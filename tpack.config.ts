/// <reference path=".vscode/typings/node/node.d.ts" />
/// <reference path=".vscode/typings/tpack/tpack.d.ts" />
import * as tpack from "tpack";
import * as ts from "typescript";

tpack.task("gen-parser", function () {
    tpack.src("src/parser/tealscript.def").pipe((file, options) => {
        const result = parseTokens(file.content, tpack.getFile("src/parser/tokens.ts").content);
        tpack.getFile("src/parser/tokens.ts").content = result.tokenSource;
        tpack.getFile("src/parser/tokens.ts").save();

        const result2 = parseNodes(file.content, result.tokens,
            tpack.getFile("src/parser/nodes.ts").content,
            tpack.getFile("src/parser/parser.ts").content,
            tpack.getFile("src/parser/nodeVisitor.ts").content)
        
        //tpack.getFile("src/parser/nodes.ts").content = result2.nodesSource;
        //tpack.getFile("src/parser/parser.ts").content = result2.parserSource;
        //tpack.getFile("src/parser/nodeVisitor.ts").content = result2.nodeVisitorSource;
        //tpack.getFile("src/parser/nodes.ts").save();
        //tpack.getFile("src/parser/parser.ts").save();
        //tpack.getFile("src/parser/nodeVisitor.ts").save();
    });
});

// #region 解析 .def 文件

/**
 * 解析 tokens 段。
 */
function parseTokens(source: string, tokenSource: string) {

    // 存储生成的 tokenTypes 每行信息。
    const tokenTypesCode: string[] = [];

    // 存储所有标记信息。
    const tokens: { [key: string]: TokenInfo } = {};

    // 存储所有属性。
    const allProps: string[] = [];

    // 解析每行。
    parseLines(getRange(source, "TokenType")).forEach(line => {

        // 注释行直接保留。
        if (/^\s*\/\//.test(line)) {
            tokenTypesCode.push(line);
            return;
        }

        // 解析当前行信息。
        if (line.replace(/^\s*'(.*)'\s*:\s*\[(.*)\],?\s*(?:\/\/(.*))?$/, (_, name: string, props: string, comment?: string) => {
            const token: TokenInfo = {
                name,
                props: [],
                addIn: "",
                comment: comment ? comment.trim() + (/^<.*>/.test(name) ? "" : ("(`" + name + "`)")) : "关键字 " + name,
                keyword: /^[a-z]/.test(name),
                field: getTokenFieldName(name),
                precedence: "",
                value: -1
            };
            props.split(/,\s*/).forEach(prop => {
                prop = prop.replace("tokens.", "");
                if (/^Precedence/.test(prop)) {
                    token.precedence = prop;
                } else if (/^addIn/.test(prop)) {
                    token.addIn = prop;
                } else if (prop) {
                    token.props.push(prop);
                    if (allProps.indexOf(prop) < 0) {
                        allProps.push(prop);
                    }
                }
            });
            if (token.addIn) {
                switch (token.addIn) {
                    case "addInJs5": token.comment += "(在 EcmaScript 5 新增)"; break;
                    case "addInJs7": token.comment += "(在 EcmaScript 7 新增)"; break;
                    case "addInTs1": token.comment += "(在 TypeScript 1 新增)"; break;
                    case "addInTs2": token.comment += "(在 TypeScript 2 新增)"; break;
                    case "addInTls1": token.comment += "(在 TealScript 1 新增)"; break;
                }
            }

            tokens[token.name] = token;

            const code =
                `    /**
     * ${token.comment}。
     */
    ${token.field},`;

            tokenTypesCode.push(code);

            return "";
        }) === line) {
            tpack.error("无法解析行：" + line);
        }

    });

    // 排序并赋值。
    const sorted = resortTokens(tokens);
    for (const token in tokens) {
        tokens[token].value = sorted.indexOf(token);
        if (tokens[token].value < 0) {
            tpack.error("非法标记数值：" + token);
        }
        for (let i = 0; i < tokenTypesCode.length; i++) {
            if (tokenTypesCode[i].indexOf(tokens[token].field + ",") >= 0) {
                tokenTypesCode[i] = tokenTypesCode[i].replace(tokens[token].field + ",", tokens[token].field + " = " + tokens[token].value + ",");
                break;
            }
        }
    }

    // 生成 TokenTypes 枚举
    tokenSource = setRange(tokenSource, "TokenType", "\n\n" + tokenTypesCode.join("\n\n") + "\n\n");

    // 生成标记名称。
    const names = [];
    for (const token in tokens) {
        names[tokens[token].value] = "\t" + JSON.stringify(tokens[token].name) + ",";
    }
    tokenSource = setRange(tokenSource, "tokenNames", "\n" + names.join("\n").replace(/,$/, "") + "\n");

    // 生成关键字名称。
    const keywords = [];
    for (const token in tokens) {
        if (tokens[token].keyword) {
            keywords.push("\t" + tokens[token].name + ": TokenType." + tokens[token].field + ",");
        }
    }
    tokenSource = setRange(tokenSource, "keywords", "\n" + keywords.join("\n").replace(/,$/, "") + "\n");

    // 生成优先级。
    const precedences = [];
    for (const token in tokens) {
        if (tokens[token].precedence) {
            precedences.push("\t" + tokens[token].value + "/*TokenType." + tokens[token].field + "*/: " + tokens[token].precedence + ",");
        }
    }
    tokenSource = setRange(tokenSource, "precedences", "\n" + precedences.join("\n").replace(/,$/, "") + "\n");

    // 生成每个判断逻辑。
    for (const prop of allProps) {
        let parts = [];

        const allTokens = getTokenByProp(prop);
        allTokens.sort((x, y) => x.value - y.value);
        for (let i = 0; i < allTokens.length;) {
            const head = allTokens[i].value;
            let c = 1;
            for (; i + c < allTokens.length; c++) {
                if (allTokens[i + c].value !== head + c) {
                    break;
                }
            }

            if (c == 1) {
                parts.push("token === TokenType." + allTokens[i].field);
            } else if (c == 2) {
                parts.push("token === TokenType." + allTokens[i].field + " || token === TokenType." + allTokens[i + 1].field);
            } else {
                parts.push("token >= TokenType." + allTokens[i].field + " && token <= TokenType." + allTokens[i + c - 1].field);
            }

            i += c;
        }

        // parts.sort((x, y) => y.length - x.length);

        tokenSource = setRange(tokenSource, prop, "\n\treturn " + parts.join(" ||\n\t\t") + ";\n");
    }

    return {
        tokenSource,
        tokens
    };

    function getTokenByProp(prop) {
        const result: TokenInfo[] = [];
        for (const token in tokens) {
            if (tokens[token].props.indexOf(prop) >= 0) {
                result.push(tokens[token]);
            }
        }
        return result;
    }

    function getTokenFieldName(name: string) {
        if (/^[a-z]/.test(name)) {
            return name;
        }

        if (/<(\w+)>/.exec(name)) {
            return /<(\w+)>/.exec(name)[1];
        }

        /**
         * 表示 Unicode 字符码表。
         */
        enum CharCode {

            // #region ASCII 字符

            /**
             * 空字符(NUL)。
             */
            null = 0x00,

            /**
             * 标题开始(SOH)。
             */
            startOfHeadLine = 0x01,

            /**
             * 正文开始(STX)。
             */
            startOfText = 0x02,

            /**
             * 正文结束(ETX)。
             */
            endOfText = 0x03,

            /**
             * 传输结束(EOT)。
             */
            endOfTransmission = 0x04,

            /**
             * 请求(ENQ)。
             */
            enquiry = 0x05,

            /**
             * 收到通知(ACK)。
             */
            acknowledge = 0x06,

            /**
             * 响铃(BEL)。
             */
            bell = 0x07,

            /**
             * 退格(BS)。
             */
            backspace = 0x08,

            /**
             * 水平制表符(HT)。
             */
            horizontalTab = 0x09,

            /**
             * 换行键(LF)。
             */
            lineFeed = 0x0A,

            /**
             * 垂直制表符(VT)。
             */
            verticalTab = 0x0B,

            /**
             * 换页键(FF)。
             */
            formFeed = 0x0C,

            /**
             * 回车键(CR)。
             */
            carriageReturn = 0x0D,

            /**
             * 不用切换(SO)。
             */
            shiftOut = 0x0E,

            /**
             * 启用切换(SI)。
             */
            shiftIn = 0x0F,

            /**
             * 数据链路转义(DLE)。
             */
            dataLinkEscape = 0x10,

            /**
             * 设备控制1(DC1)。
             */
            deviceControl1 = 0x11,

            /**
             * 设备控制2(DC2)。
             */
            deviceControl2 = 0x12,

            /**
             * 设备控制3(DC3)。
             */
            deviceControl3 = 0x13,

            /**
             * 设备控制4(DC4)。
             */
            deviceControl4 = 0x14,

            /**
             * 拒绝接收(NAK)。
             */
            negativeAcknowledge = 0x15,

            /**
             * 同步空闲(SYN)。
             */
            synchronousIdle = 0x16,

            /**
             * 结束传输块(ETB)。
             */
            endOfTranslateBlock = 0x17,

            /**
             * 取消(CAN)。
             */
            cancel = 0x18,

            /**
             * 媒介结束(EM)。
             */
            endOfMedium = 0x19,

            /**
             * 代替(SUB)。
             */
            substitute = 0x1A,

            /**
             * 换码(溢出)(ESC)。
             */
            escape = 0x1B,

            /**
             * 文件分隔符(FS)。
             */
            fileSeparator = 0x1C,

            /**
             * 分组符(GS)。
             */
            groupSeparator = 0x1D,

            /**
             * 记录分隔符(RS)。
             */
            recordSeparator = 0x1E,

            /**
             * 单元分隔符(US)。
             */
            unitSeparator = 0x1F,

            /**
             * 空格(space)。
             */
            space = 0x20,

            /**
             * 叹号(!)。
             */
            exclamation = 0x21,

            /**
             * 双引号(")。
             */
            doubleQuote = 0x22,

            /**
             * 井号(#)。
             */
            hash = 0x23,

            /**
             * 美元符($)。
             */
            dollar = 0x24,

            /**
             * 百分号(%)。
             */
            percent = 0x25,

            /**
             * 和(&)。
             */
            ampersand = 0x26,

            /**
             * 闭单引号(')。
             */
            singleQuote = 0x27,

            /**
             * 开括号(()。
             */
            openParen = 0x28,

            /**
             * 闭括号())。
             */
            closeParen = 0x29,

            /**
             * 星号(*)。
             */
            asterisk = 0x2A,

            /**
             * 加(+)。
             */
            plus = 0x2B,

            /**
             * 逗号(,)。
             */
            comma = 0x2C,

            /**
             * 减(-)。
             */
            minus = 0x2D,

            /**
             * 点(.)。
             */
            dot = 0x2E,

            /**
             * 斜杠(/)。
             */
            slash = 0x2F,

            /**
             * 数字 0。
             */
            num0 = 0x30,

            /**
             * 数字 1。
             */
            num1 = 0x31,

            /**
             * 数字 2。
             */
            num2 = 0x32,

            /**
             * 数字 3。
             */
            num3 = 0x33,

            /**
             * 数字 4。
             */
            num4 = 0x34,

            /**
             * 数字 5。
             */
            num5 = 0x35,

            /**
             * 数字 6。
             */
            num6 = 0x36,

            /**
             * 数字 7。
             */
            num7 = 0x37,

            /**
             * 数字 8。
             */
            num8 = 0x38,

            /**
             * 数字 9。
             */
            num9 = 0x39,

            /**
             * 冒号(:)。
             */
            colon = 0x3A,

            /**
             * 分号(;)。
             */
            semicolon = 0x3B,

            /**
             * 小于(<)。
             */
            lessThan = 0x3C,

            /**
             * 等号(=)。
             */
            equals = 0x3D,

            /**
             * 大于(>)。
             */
            greaterThan = 0x3E,

            /**
             * 问号(?)。
             */
            question = 0x3F,

            /**
             * 电子邮件符号(@)。
             */
            at = 0x40,

            /**
             * 大写字母 A。
             */
            A = 0x41,

            /**
             * 大写字母 B。
             */
            B = 0x42,

            /**
             * 大写字母 C。
             */
            C = 0x43,

            /**
             * 大写字母 D。
             */
            D = 0x44,

            /**
             * 大写字母 E。
             */
            E = 0x45,

            /**
             * 大写字母 F。
             */
            F = 0x46,

            /**
             * 大写字母 G。
             */
            G = 0x47,

            /**
             * 大写字母 H。
             */
            H = 0x48,

            /**
             * 大写字母 I。
             */
            I = 0x49,

            /**
             * 大写字母 J。
             */
            J = 0x4A,

            /**
             * 大写字母 K。
             */
            K = 0x4B,

            /**
             * 大写字母 L。
             */
            L = 0x4C,

            /**
             * 大写字母 M。
             */
            M = 0x4D,

            /**
             * 大写字母 N。
             */
            N = 0x4E,

            /**
             * 大写字母 O。
             */
            O = 0x4F,

            /**
             * 大写字母 P。
             */
            P = 0x50,

            /**
             * 大写字母 Q。
             */
            Q = 0x51,

            /**
             * 大写字母 R。
             */
            R = 0x52,

            /**
             * 大写字母 S。
             */
            S = 0x53,

            /**
             * 大写字母 T。
             */
            T = 0x54,

            /**
             * 大写字母 U。
             */
            U = 0x55,

            /**
             * 大写字母 V。
             */
            V = 0x56,

            /**
             * 大写字母 W。
             */
            W = 0x57,

            /**
             * 大写字母 X。
             */
            X = 0x58,

            /**
             * 大写字母 Y。
             */
            Y = 0x59,

            /**
             * 大写字母 Z。
             */
            Z = 0x5A,

            /**
             * 开方括号([)。
             */
            openBracket = 0x5B,

            /**
             * 反斜杠(\)。
             */
            backslash = 0x5C,

            /**
             * 闭方括号(])。
             */
            closeBracket = 0x5D,

            /**
             * 托字符(^)。
             */
            caret = 0x5E,

            /**
             * 下划线(_)。
             */
            underline = 0x5F,

            /**
             * 开单引号(`)。
             */
            backtick = 0x60,

            /**
             * 小写字母 a。
             */
            a = 0x61,

            /**
             * 小写字母 b。
             */
            b = 0x62,

            /**
             * 小写字母 c。
             */
            c = 0x63,

            /**
             * 小写字母 d。
             */
            d = 0x64,

            /**
             * 小写字母 e。
             */
            e = 0x65,

            /**
             * 小写字母 f。
             */
            f = 0x66,

            /**
             * 小写字母 g。
             */
            g = 0x67,

            /**
             * 小写字母 h。
             */
            h = 0x68,

            /**
             * 小写字母 i。
             */
            i = 0x69,

            /**
             * 小写字母 j。
             */
            j = 0x6A,

            /**
             * 小写字母 k。
             */
            k = 0x6B,

            /**
             * 小写字母 l。
             */
            l = 0x6C,

            /**
             * 小写字母 m。
             */
            m = 0x6D,

            /**
             * 小写字母 n。
             */
            n = 0x6E,

            /**
             * 小写字母 o。
             */
            o = 0x6F,

            /**
             * 小写字母 p。
             */
            p = 0x70,

            /**
             * 小写字母 q。
             */
            q = 0x71,

            /**
             * 小写字母 r。
             */
            r = 0x72,

            /**
             * 小写字母 s。
             */
            s = 0x73,

            /**
             * 小写字母 t。
             */
            t = 0x74,

            /**
             * 小写字母 u。
             */
            u = 0x75,

            /**
             * 小写字母 v。
             */
            v = 0x76,

            /**
             * 小写字母 w。
             */
            w = 0x77,

            /**
             * 小写字母 x。
             */
            x = 0x78,

            /**
             * 小写字母 y。
             */
            y = 0x79,

            /**
             * 小写字母 z。
             */
            z = 0x7A,

            /**
             * 开花括号({)。
             */
            openBrace = 0x7B,

            /**
             * 竖线(|)。
             */
            bar = 0x7C,

            /**
             * 闭花括号(})。
             */
            closeBrace = 0x7D,

            /**
             * 波浪号(~)。
             */
            tilde = 0x7E,

            /**
             * 删除(DEL)。
             */
            delete = 0x7F,

            /**
             * 最大的 ASCII 字符。
             */
            MAX_ASCII = 0x80,

            // #endregion 

            // #region Unicode 字符

            /**
             * 行分隔符(LS)。
             */
            lineSeparator = 0x2028,

            /**
             * 段落分隔符(PS)。
             */
            paragraphSeparator = 0x2029,

            /**
             * 换行符(NL)。
             */
            nextLine = 0x0085,

            /**
             * 不换号空格(NBSP)。
             */
            nonBreakingSpace = 0x00A0,

            /**
             * 对开空格(EQ)。
             */
            enQuad = 0x2000,
            emQuad = 0x2001,
            enSpace = 0x2002,
            emSpace = 0x2003,
            threePerEmSpace = 0x2004,
            fourPerEmSpace = 0x2005,
            sixPerEmSpace = 0x2006,
            figureSpace = 0x2007,
            punctuationSpace = 0x2008,
            thinSpace = 0x2009,
            hairSpace = 0x200A,

            /**
             * 零宽空格(ZWS)。
             */
            zeroWidthSpace = 0x200B,

            /**
             * 窄不换行空格(NNBS)。
             */
            narrowNoBreakSpace = 0x202F,

            /**
             * 表意字空格(IS)。
             */
            ideographicSpace = 0x3000,

            /**
             * 数学空格(MMS)。
             */
            mathematicalSpace = 0x205F,

            /**
             * 欧甘文字(OGHAM)。
             */
            ogham = 0x1680,

            /**
             * UTF-8 标记码(BOM)。
             */
            byteOrderMark = 0xFEFF,

            // #endregion 

        }

        var r = "";

        for (let i = 0; i < name.length; i++) {
            const n = CharCode[name.charCodeAt(i)];
            r += r ? cap(n) : n;
        }

        return r;

        function cap(w) {
            return w.replace(/^[a-z]/, t => t.toUpperCase());
        }

    }

    function resortTokens(tokens: { [key: string]: TokenInfo }) {

        const list = [];
        for (const token in tokens) {
            //   put(token);   // 暂时手动排序
            list.push(token);
        }
        return list;

        function put(token: string) {
            const t = tokens[token]; // 获取当前标记的所属类别列表。

            // 找到满足的类别数最多的位置。
            let max = -1, p = 0;
            for (let i = 0; i <= list.length; i++) {
                // 取满足数最高的位置。如果满足数相同，取满足的属性在前面的位置。
                const v = calcPropValue(i, t);
                if (v >= max) {
                    max = v;
                    p = i;
                }
            }

            list.splice(p, 0, token);
        }

        /**
         * 计算将标记放在指定位置时满足的类别数。
         */
        function calcPropValue(index, t) {
            let result = 0;
            for (let j = 0; j < t.props.length; j++) {
                const prop = t.props[j];
                // 只要左右边任一个和当前属于同一个分类，则认为当前位置是属于同一个分类。
                if (list[index - 1] && tokens[list[index - 1]].props.indexOf(prop) >= 0 || list[index] && tokens[list[index]].props.indexOf(prop) >= 0) {
                    result++;
                }
            }
            return result;
        }

    }

}

interface TokenInfo {
    name: string;
    props: string[];
    addIn: string;
    comment: string;
    keyword: boolean;
    field: string;
    precedence: string;
    value: number;
}

/**
 * 解析 nodes 段。
 */
function parseNodes(source: string, tokens: { [key: string]: TokenInfo }, nodesSource: string, parserSource: string, nodeVisitorSource: string) {

    // 存储所有节点信息。
    const productions: { [key: string]: ProductionInfo } = {};

    // 存储所有区域。
    const allRegions: RegionInfo[] = [];

    // 解析所有行。
    let currentRegion: RegionInfo;
    let currentProduction: ProductionInfo;
    parseLines(getRegion(source, "语法")).forEach(line => {

        // 处理 region
        if (/^\s*\/\/\s*#region/.test(line)) {
            currentRegion = {
                start: line,
                end: "",
                productions: []
            };
            allRegions.push(currentRegion);
            return;
        }

        if (!currentRegion) {
            tpack.error("发现不属于任何 region 的代码：" + line);
            return;
        }

        if (/^\s*\/\/\s*#endregion/.test(line)) {
            currentRegion.end = line;
            currentRegion = null;
            return;
        }

        // 忽略注释、type、declare 开头的行。
        if (/^\s*(\/\/|\/\*|\*|(type|declare)\b)/.test(line)) return;

        // 处理定义头。
        if (/function\s/.test(line)) {
            currentProduction = {
                _last: currentProduction,
                indent: getIndent(line),
                fields: [],
                params: [],
                name: "",
                comment: "",
                codes: [],
                extend: "",
                abstract: false,
                doc: false,
                list: null,
                alias: "",
            };

            //if (line.replace(/function\s(\w+)\((.*?)\)\s*\{[^\/]*(?:\/\/(.*))?/, (_, name: string, params: string, comment: string) => {
            //    currentProduction.name = name;
            //    params.split(/,\s*/).forEach(line => {
            //        if (!line) {
            //            return;
            //        }
            //        const param: ParamInfo = {
            //            name: "",
            //            type: "",
            //            comment: "",
            //            value: "",
            //            optional: false
            //        };

            //        if (line.replace(/(\w+)\s*(\?)?\s*(?::\s*(.*))?\s*(?:=\s*(.*))?\s*(?:\/\*(.*?)\*\/)?/, (_, name, optional, type, value, comment) => {

            //            // = null || ...
            //            if (/^\s*null\s*\|\|/.exec(value)) {
            //                optional = true;
            //                value = value.replace(/^\s*null\s*\|\|/, "");
            //            }

            //            // = Expression, = read()
            //            if (/^\s*[A-Z]/.exec(value)) {
            //                if (name !== "_") {
            //                    addCode(`_.${name} = ${value}`);
            //                }
            //                type = value.replace(/\|\|/g, "|");
            //                value = "";
            //            } else if (/^\s*read\('(.*?)'\)/.exec(value)) {
            //                addCode(value);
            //                name = tokens[/^\s*read\('(.*?)'\)/.exec(value)[1]].field + "Token";
            //                type = "number";
            //                value = "";
            //            }

            //            param.name = name;
            //            param.optional = !!optional;
            //            param.type = type;
            //            param.value = value;

            //            param.comment = comment;
            //            return "";
            //        }) === line) {
            //            tpack.error("解析参数错误：" + line);
            //        }

            //        currentProduction.params.push(param);

            //    });
            //    currentProduction.comment = comment ? comment.trim() : "";
            //    return "";
            //}) === line) {
            //    tpack.error("解析定义错误：" + line);
            //}

            //// result = function AA() { => result = parseAA();
            //if (!/^\s*function/.test(line)) {
            //    currentProduction._last.codes.push(removeIndent(line.replace(/function\s.*$/, _ => "this.parse" + currentProduction.name + "(" + currentProduction.params.map(t => t.name).join(", ") + ");"), currentProduction._last.indent + 1));
            //}

            //productions[currentProduction.name] = currentProduction;
            //currentRegion.productions.push(currentProduction.name);

            return;

        }

        // 处理定义底。
        if (/^\s*};?\s*$/.test(line) && getIndent(line) === currentProduction.indent) {
            const prev = currentProduction;
            currentProduction = currentProduction._last;
            delete prev._last;
            return;
        }

        // 处理定义正文。
        if (!currentProduction) {
            tpack.error("发现不属于任何产生式的代码：" + line);
            return;
        }

        if (/\s*extend\((.*?)\)/.exec(line)) {
            currentProduction.extend = /\s*extend\((.*?)\)/.exec(line)[1];
            return;
        }

        if (/\s*alias\((.*?)\)/.exec(line)) {
            currentProduction.alias = /\s*alias\((.*?)\)/.exec(line)[1];
            return;
        }

        if (/\s*abstract\((.*?)\)/.exec(line)) {
            currentProduction.abstract = true;
            return;
        }
        
        // 删除缩进。
        line = removeIndent(line, currentProduction.indent + 1);
        const indent = line.substring(getIndent(line));
        
        // 独立列表。
        if (/^\s*list\((.*?)\)/.exec(line)) {
            const value = parseSpecailValue(line);
            currentProduction.list = value.list;
            currentProduction.codes.push(`${indent}return ${value.code};`);
            return;
        }

//        // 独立标记。
//        if (/^\s*read?\((.*?)\)/.exec(line)) {
//            const value = parseSpecailValue(line);
//            currentProduction.fields.push({
//                inline: "",
//                name: value.name,
//                type: "number",
//                comment: "",
//            });
//            currentProduction.codes.push( `${indent}if (peek === '${token}') {
//${indent}    _.${result.name} = this.readToken('${token}');
//${indent}}`);
//            return;
//        }
        
//        // 独立可选标记。
//        if (/^\s*readIf\((.*?)\)/.exec(line)) {
//            const value = parseSpecailValue(line);
//            currentProduction.fields.push({
//                inline: "",
//                name: value.name,
//                type: "number",
//                comment: "",
//            });
//            currentProduction.codes.push(value.code);
//            return;
//        }
        
//        // _.xx = 
//        if (/^\s*_\./.exec(line)) {
//            line = line.replace(/_\.(\w+)\s*=\s*(.*);?(?:\/\/(.*))?$/, (_, name: string, value: string, comment: string) => {
//                const v = parseSpecailValue(value, name, indent);
//                v.optional = v.optional || getIndent(line) > 0;
//                if (v.readSingle || v.readIfSingle || v.readAny) {
//                    currentProduction.fields.push({
//                        inline: "",
//                        name: v.name,
//                        type: "number",
//                        comment: comment,
//                    });
//                    currentProduction.codes.push(v.code);
//                    return "";
//                }

//                if (v.list) {
//                    currentProduction.fields.push({
//                        inline: "",
//                        name: v.name,
//                        type: "nodes.NodeList<" + v.list.element + ">",
//                        comment: comment,
//                    });
//                    currentProduction.codes.push(v.code);
//                    return "";
//                }

//                if (v.expression) {
//                    currentProduction.fields.push({
//                        inline: "",
//                        name: v.name,
//                        type: v.expression,
//                        comment: comment,
//                    });
//                    currentProduction.codes.push(v.code);
//                    return "";
//                }

//                return "";
//            });
//            return;
//        }

//        // XX(_)
//        if (/^\w+\(_\)/.exec(line)) {
//            currentProduction.fields.push({
//                inline: line.replace(/\(.*/, ""),
//                comment: "",
//                name: "",
//                type: ""
//            });
//        }

//        currentProduction.codes.push(line);

//        /**
//         * 解析特殊的值。
//         * @param value
//         */
//        function parseSpecailValue(value, name?, indent?) {
//            const result: SpecailValueInfo = {
//                name: /^\s*_/.test(name) ? "" : name,
//                optional: !!indent,
//                readSingle: "",
//                readIfSingle: "",
//                readAny: null,
//                list: null,
//                expression: "",
//                code: ""
//            };

//            // read('x')、readIf('x')
//            if (/^\s*read(If)?\('(.*?)'\)/.exec(value)) {
//                const token = /^\s*read(If)?\('(.*?)'\)/.exec(line)[2];
//                result.name = result.name || (tokens[token].field + "Token");
//                if (/^\s*read(If)?\('(.*?)'\)/.exec(line)[1]) {
//                    result.optional = true;
//                    result.readIfSingle = token;
//                    result.code = `${indent}if (peek === '${token}') {
//${indent}    _.${result.name} = this.readToken('${token}');
//${indent}}`;
//                } else {
//                    result.readSingle = token;
//                    result.code = `${indent}_.${result.name} = this.readToken(TokenType.${tokens[token].field});`;
//                }
//                return result;
//            }

//            // read('x', 'y')
//            if (/^\s*read\((.*?)\)/.exec(value)) {
//                result.readAny = value.substring(1, value.length - 1).split("', '");
//                result.code = `${indent}_.${result.name} = this.lexer.read(); // ${result.readAny.join("、")}`;
//                return result;
//            }

//            // list()
//            if (/^\s*list\((.*?)\)/.exec(value)) {
//                const p = /\s*list\((.*?)\)/.exec(line)[1].split(/,\s+/);
//                result.list = {
//                    element: p[0],
//                    allowEmpty: !p[1] || p[1] == "true",
//                    open: !p[2] || p[2] == "undefined" ? "" : p[2],
//                    close: !p[3] || p[3] == "undefined" ? "" : p[3],
//                    seperator: p[4] || "",
//                    continue: p[5] || "",
//                };
//                if (result.list.seperator && result.list.seperator !== "','") {
//                    tpack.error("只支持逗号分隔符:   " + line);
//                }

//                let header = result.list.element;
//                if (/\/\*(.*)\*\//.exec(result.list.element)) {
//                    result.list.element = /\/\*(.*)\*\//[1];
//                    header = header.replace(/\/\*(.*)\*\//, "");
//                }
//                result.code = result.list.seperator ? "${indent}this.parseDelimitedList(" + header + ", " + result.list.open + ", " + result.list.close + ", " + result.list.allowEmpty + ", " + result.list.continue + ")" : "${indent}this.parseNodeList(" + header + ", " + result.list.open + ", " + result.list.close + ")";
//                result.code = result.code.replace(', undefined)', ')')
//                    .replace(', false)', ')')
//                    .replace(', undefined)', ')')
//                    .replace(', undefined)', ')');
//                return result;
//            }

//            // Expression || Statement
//            if (/^\s*[A-Z]/.exec(value)) {
//                result.expression = value.replace(/\(.*$/, "").replace(/\|\|/g, "|");
//                result.code = value;
//                return result;
//            }

//            // /**/foo()
//            if (/^\/\*(.*)\*\//.exec(value)) {
//                result.expression = /^\/\*(.*)\*\//.exec(value)[1];
//                result.code = value.replace(/^\/\*(.*)\*\//, "");
//                return result;
//            }

//        }

        interface SpecailValueInfo {
            name: string;
            optional: boolean;
            code: string;
            readSingle: string;
            readIfSingle: string;
            readAny: string[];
            list: ListInfo;
            expression: string;
        }

        function getIndent(line) {
            return (/\S/.exec(line.replace(/    /g, "\t")) || { index: 0 }).index;
        }

        function removeIndent(line, count) {
            return line.replace(/    /g, "\t").substring(count);
        }

    });
    
    // 展开 inline
    eachProduction(p => {
        
    });
    
    function expandFields(production: ProductionInfo){
        for (let i=0; i < production.fields.length;i++){

        }
    }

    // 提取公共注释。
    const comments = {};
    const types = {};
    eachProduction(p => {
        for(const f of p.fields){
            comments[f.name] = comments[f.name] || f.comment;
            types[f.name] = types[f.name] || f.type;
        }
        for(const f of p.params){
            comments[f.name] = comments[f.name] || f.comment;
            types[f.name] = types[f.name] || f.type;
        }
    });
    eachProduction(p => {
        for(const f of p.fields){
           f.comment = f.comment || comments[f.name];
           f.type = f.type || types[f.name];
        }
        for(const f of p.params){
           f.comment = f.comment || comments[f.name];
           f.type = f.type || types[f.name];
        }
    });
    
    // 生成 parser。
    parserSource

    // 生成 nodes。

    // 生成 nodesVisitor。

    require("fs").writeFileSync("aa.json", JSON.stringify(productions, null, 4));

    interface RegionInfo {
        start: string;
        productions: string[];
        end: string;
    }

    function eachProduction(callback: (p: ProductionInfo) => void) {
        for (const name in productions) {
            callback(productions[name]);
        }
    }

}

/**
 * 表示一个产生式。
 */
interface ProductionInfo {
    _last: ProductionInfo;
    indent: number;
    fields: FieldInfo[];
    params: ParamInfo[];
    codes: string[];
    name: string;
    comment: string;
    extend: string;
    doc: boolean;
    abstract: boolean;
    alias: string;
    list: ListInfo;
}

interface FieldInfo {
    inline: string;
    optional: boolean;
    name: string;
    type: string;
    comment: string;
}

interface ParamInfo {
    name: string;
    type: string;
    value: string;
    comment: string;
    optional: boolean;
}

interface ListInfo {
    element: string;
    allowEmpty: boolean;
    open: string;
    close: string;
    continue: string;
    seperator: string;
};

/**
 * 获取源码中指定区域的内容。
 * @param source
 * @param rangeName
 */
function getRange(source: string, rangeName: string) {
    return (new RegExp("^.*" + rangeName + ".*\\{([\\s\\S]*?)^\\};?", "m").exec(source) || ["", ""])[1];
}

/**
 * 获取源码中指定区域的内容。
 * @param source
 * @param rangeName
 */
function setRange(source: string, rangeName: string, value: string) {
    return source.replace(new RegExp("^(.*" + rangeName + ".*[\\{\\[])([\\s\\S]*?)(^[\\}\\]];?)", "m"), (_, prefix, body, postfix) => prefix + value + postfix);
}

/**
 * 获取源码中指定区域的内容。
 * @param source
 * @param rangeName
 */
function getRegion(source: string, rangeName: string) {
    return (new RegExp("^\\s*//\\s*#region\\s*" + rangeName + ".*([\\s\\S]*?)^//\\s*#endregion\\s*" + rangeName, "m").exec(source) || ["", ""])[1];
}

/**
 * 将源码拆分为多行。
 * @param source
 */
function parseLines(source: string) {
    return source.split(/\r\n?|\n/).filter(line => !!line); //  && !/^(\/\/|\s*(type|declare)\b)/.test(line)
}

/**
 * 拆分注释。
 * @param line
 */
function parseComment(line: string) {
    const result = {
        line: "",
        comment: ""
    };
    result.line = line.replace(/\/\/\s*(.+)$/, function (_, value) {
        result.comment = value.trim();
        return "";
    })
    return result;
}

// #endregion
