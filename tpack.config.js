"use strict";
/// <reference path=".vscode/typings/node/node.d.ts" />
/// <reference path=".vscode/typings/tpack/tpack.d.ts" />
var tpack = require("tpack");
tpack.task("gen-parser", function () {
    tpack.src("src/parser/tealscript.def").pipe(function (file, options) {
        var result = parseTokens(file.content, tpack.getFile("src/parser/tokens.ts").content);
        tpack.getFile("src/parser/tokens.ts").content = result.tokenSource;
        tpack.getFile("src/parser/tokens.ts").save();
        var result2 = parseNodes(file.content, result.tokens, tpack.getFile("src/parser/nodes.ts").content, tpack.getFile("src/parser/parser.ts").content, tpack.getFile("src/parser/nodeVisitor.ts").content);
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
function parseTokens(source, tokenSource) {
    // 存储生成的 tokenTypes 每行信息。
    var tokenTypesCode = [];
    // 存储所有标记信息。
    var tokens = {};
    // 存储所有属性。
    var allProps = [];
    // 解析每行。
    parseLines(getRange(source, "TokenType")).forEach(function (line) {
        // 注释行直接保留。
        if (/^\s*\/\//.test(line)) {
            tokenTypesCode.push(line);
            return;
        }
        // 解析当前行信息。
        if (line.replace(/^\s*'(.*)'\s*:\s*\[(.*)\],?\s*(?:\/\/(.*))?$/, function (_, name, props, comment) {
            var token = {
                name: name,
                props: [],
                addIn: "",
                comment: comment ? comment.trim() + (/^<.*>/.test(name) ? "" : ("(`" + name + "`)")) : "关键字 " + name,
                keyword: /^[a-z]/.test(name),
                field: getTokenFieldName(name),
                precedence: "",
                value: -1
            };
            props.split(/,\s*/).forEach(function (prop) {
                prop = prop.replace("tokens.", "");
                if (/^Precedence/.test(prop)) {
                    token.precedence = prop;
                }
                else if (/^addIn/.test(prop)) {
                    token.addIn = prop;
                }
                else if (prop) {
                    token.props.push(prop);
                    if (allProps.indexOf(prop) < 0) {
                        allProps.push(prop);
                    }
                }
            });
            if (token.addIn) {
                switch (token.addIn) {
                    case "addInJs5":
                        token.comment += "(在 EcmaScript 5 新增)";
                        break;
                    case "addInJs7":
                        token.comment += "(在 EcmaScript 7 新增)";
                        break;
                    case "addInTs1":
                        token.comment += "(在 TypeScript 1 新增)";
                        break;
                    case "addInTs2":
                        token.comment += "(在 TypeScript 2 新增)";
                        break;
                    case "addInTls1":
                        token.comment += "(在 TealScript 1 新增)";
                        break;
                }
            }
            tokens[token.name] = token;
            var code = "    /**\n     * " + token.comment + "\u3002\n     */\n    " + token.field + ",";
            tokenTypesCode.push(code);
            return "";
        }) === line) {
            tpack.error("无法解析行：" + line);
        }
    });
    // 排序并赋值。
    var sorted = resortTokens(tokens);
    for (var token in tokens) {
        tokens[token].value = sorted.indexOf(token);
        if (tokens[token].value < 0) {
            tpack.error("非法标记数值：" + token);
        }
        for (var i = 0; i < tokenTypesCode.length; i++) {
            if (tokenTypesCode[i].indexOf(tokens[token].field + ",") >= 0) {
                tokenTypesCode[i] = tokenTypesCode[i].replace(tokens[token].field + ",", tokens[token].field + " = " + tokens[token].value + ",");
                break;
            }
        }
    }
    // 生成 TokenTypes 枚举
    tokenSource = setRange(tokenSource, "TokenType", "\n\n" + tokenTypesCode.join("\n\n") + "\n\n");
    // 生成标记名称。
    var names = [];
    for (var token in tokens) {
        names[tokens[token].value] = "\t" + JSON.stringify(tokens[token].name) + ",";
    }
    tokenSource = setRange(tokenSource, "tokenNames", "\n" + names.join("\n").replace(/,$/, "") + "\n");
    // 生成关键字名称。
    var keywords = [];
    for (var token in tokens) {
        if (tokens[token].keyword) {
            keywords.push("\t" + tokens[token].name + ": TokenType." + tokens[token].field + ",");
        }
    }
    tokenSource = setRange(tokenSource, "keywords", "\n" + keywords.join("\n").replace(/,$/, "") + "\n");
    // 生成优先级。
    var precedences = [];
    for (var token in tokens) {
        if (tokens[token].precedence) {
            precedences.push("\t" + tokens[token].value + "/*TokenType." + tokens[token].field + "*/: " + tokens[token].precedence + ",");
        }
    }
    tokenSource = setRange(tokenSource, "precedences", "\n" + precedences.join("\n").replace(/,$/, "") + "\n");
    // 生成每个判断逻辑。
    for (var _i = 0, allProps_1 = allProps; _i < allProps_1.length; _i++) {
        var prop = allProps_1[_i];
        var parts = [];
        var allTokens = getTokenByProp(prop);
        allTokens.sort(function (x, y) { return x.value - y.value; });
        for (var i = 0; i < allTokens.length;) {
            var head = allTokens[i].value;
            var c = 1;
            for (; i + c < allTokens.length; c++) {
                if (allTokens[i + c].value !== head + c) {
                    break;
                }
            }
            if (c == 1) {
                parts.push("token === TokenType." + allTokens[i].field);
            }
            else if (c == 2) {
                parts.push("token === TokenType." + allTokens[i].field + " || token === TokenType." + allTokens[i + 1].field);
            }
            else {
                parts.push("token >= TokenType." + allTokens[i].field + " && token <= TokenType." + allTokens[i + c - 1].field);
            }
            i += c;
        }
        // parts.sort((x, y) => y.length - x.length);
        tokenSource = setRange(tokenSource, prop, "\n\treturn " + parts.join(" ||\n\t\t") + ";\n");
    }
    return {
        tokenSource: tokenSource,
        tokens: tokens
    };
    function getTokenByProp(prop) {
        var result = [];
        for (var token in tokens) {
            if (tokens[token].props.indexOf(prop) >= 0) {
                result.push(tokens[token]);
            }
        }
        return result;
    }
    function getTokenFieldName(name) {
        if (/^[a-z]/.test(name)) {
            return name;
        }
        if (/<(\w+)>/.exec(name)) {
            return /<(\w+)>/.exec(name)[1];
        }
        /**
         * 表示 Unicode 字符码表。
         */
        var CharCode;
        (function (CharCode) {
            // #region ASCII 字符
            /**
             * 空字符(NUL)。
             */
            CharCode[CharCode["null"] = 0] = "null";
            /**
             * 标题开始(SOH)。
             */
            CharCode[CharCode["startOfHeadLine"] = 1] = "startOfHeadLine";
            /**
             * 正文开始(STX)。
             */
            CharCode[CharCode["startOfText"] = 2] = "startOfText";
            /**
             * 正文结束(ETX)。
             */
            CharCode[CharCode["endOfText"] = 3] = "endOfText";
            /**
             * 传输结束(EOT)。
             */
            CharCode[CharCode["endOfTransmission"] = 4] = "endOfTransmission";
            /**
             * 请求(ENQ)。
             */
            CharCode[CharCode["enquiry"] = 5] = "enquiry";
            /**
             * 收到通知(ACK)。
             */
            CharCode[CharCode["acknowledge"] = 6] = "acknowledge";
            /**
             * 响铃(BEL)。
             */
            CharCode[CharCode["bell"] = 7] = "bell";
            /**
             * 退格(BS)。
             */
            CharCode[CharCode["backspace"] = 8] = "backspace";
            /**
             * 水平制表符(HT)。
             */
            CharCode[CharCode["horizontalTab"] = 9] = "horizontalTab";
            /**
             * 换行键(LF)。
             */
            CharCode[CharCode["lineFeed"] = 10] = "lineFeed";
            /**
             * 垂直制表符(VT)。
             */
            CharCode[CharCode["verticalTab"] = 11] = "verticalTab";
            /**
             * 换页键(FF)。
             */
            CharCode[CharCode["formFeed"] = 12] = "formFeed";
            /**
             * 回车键(CR)。
             */
            CharCode[CharCode["carriageReturn"] = 13] = "carriageReturn";
            /**
             * 不用切换(SO)。
             */
            CharCode[CharCode["shiftOut"] = 14] = "shiftOut";
            /**
             * 启用切换(SI)。
             */
            CharCode[CharCode["shiftIn"] = 15] = "shiftIn";
            /**
             * 数据链路转义(DLE)。
             */
            CharCode[CharCode["dataLinkEscape"] = 16] = "dataLinkEscape";
            /**
             * 设备控制1(DC1)。
             */
            CharCode[CharCode["deviceControl1"] = 17] = "deviceControl1";
            /**
             * 设备控制2(DC2)。
             */
            CharCode[CharCode["deviceControl2"] = 18] = "deviceControl2";
            /**
             * 设备控制3(DC3)。
             */
            CharCode[CharCode["deviceControl3"] = 19] = "deviceControl3";
            /**
             * 设备控制4(DC4)。
             */
            CharCode[CharCode["deviceControl4"] = 20] = "deviceControl4";
            /**
             * 拒绝接收(NAK)。
             */
            CharCode[CharCode["negativeAcknowledge"] = 21] = "negativeAcknowledge";
            /**
             * 同步空闲(SYN)。
             */
            CharCode[CharCode["synchronousIdle"] = 22] = "synchronousIdle";
            /**
             * 结束传输块(ETB)。
             */
            CharCode[CharCode["endOfTranslateBlock"] = 23] = "endOfTranslateBlock";
            /**
             * 取消(CAN)。
             */
            CharCode[CharCode["cancel"] = 24] = "cancel";
            /**
             * 媒介结束(EM)。
             */
            CharCode[CharCode["endOfMedium"] = 25] = "endOfMedium";
            /**
             * 代替(SUB)。
             */
            CharCode[CharCode["substitute"] = 26] = "substitute";
            /**
             * 换码(溢出)(ESC)。
             */
            CharCode[CharCode["escape"] = 27] = "escape";
            /**
             * 文件分隔符(FS)。
             */
            CharCode[CharCode["fileSeparator"] = 28] = "fileSeparator";
            /**
             * 分组符(GS)。
             */
            CharCode[CharCode["groupSeparator"] = 29] = "groupSeparator";
            /**
             * 记录分隔符(RS)。
             */
            CharCode[CharCode["recordSeparator"] = 30] = "recordSeparator";
            /**
             * 单元分隔符(US)。
             */
            CharCode[CharCode["unitSeparator"] = 31] = "unitSeparator";
            /**
             * 空格(space)。
             */
            CharCode[CharCode["space"] = 32] = "space";
            /**
             * 叹号(!)。
             */
            CharCode[CharCode["exclamation"] = 33] = "exclamation";
            /**
             * 双引号(")。
             */
            CharCode[CharCode["doubleQuote"] = 34] = "doubleQuote";
            /**
             * 井号(#)。
             */
            CharCode[CharCode["hash"] = 35] = "hash";
            /**
             * 美元符($)。
             */
            CharCode[CharCode["dollar"] = 36] = "dollar";
            /**
             * 百分号(%)。
             */
            CharCode[CharCode["percent"] = 37] = "percent";
            /**
             * 和(&)。
             */
            CharCode[CharCode["ampersand"] = 38] = "ampersand";
            /**
             * 闭单引号(')。
             */
            CharCode[CharCode["singleQuote"] = 39] = "singleQuote";
            /**
             * 开括号(()。
             */
            CharCode[CharCode["openParen"] = 40] = "openParen";
            /**
             * 闭括号())。
             */
            CharCode[CharCode["closeParen"] = 41] = "closeParen";
            /**
             * 星号(*)。
             */
            CharCode[CharCode["asterisk"] = 42] = "asterisk";
            /**
             * 加(+)。
             */
            CharCode[CharCode["plus"] = 43] = "plus";
            /**
             * 逗号(,)。
             */
            CharCode[CharCode["comma"] = 44] = "comma";
            /**
             * 减(-)。
             */
            CharCode[CharCode["minus"] = 45] = "minus";
            /**
             * 点(.)。
             */
            CharCode[CharCode["dot"] = 46] = "dot";
            /**
             * 斜杠(/)。
             */
            CharCode[CharCode["slash"] = 47] = "slash";
            /**
             * 数字 0。
             */
            CharCode[CharCode["num0"] = 48] = "num0";
            /**
             * 数字 1。
             */
            CharCode[CharCode["num1"] = 49] = "num1";
            /**
             * 数字 2。
             */
            CharCode[CharCode["num2"] = 50] = "num2";
            /**
             * 数字 3。
             */
            CharCode[CharCode["num3"] = 51] = "num3";
            /**
             * 数字 4。
             */
            CharCode[CharCode["num4"] = 52] = "num4";
            /**
             * 数字 5。
             */
            CharCode[CharCode["num5"] = 53] = "num5";
            /**
             * 数字 6。
             */
            CharCode[CharCode["num6"] = 54] = "num6";
            /**
             * 数字 7。
             */
            CharCode[CharCode["num7"] = 55] = "num7";
            /**
             * 数字 8。
             */
            CharCode[CharCode["num8"] = 56] = "num8";
            /**
             * 数字 9。
             */
            CharCode[CharCode["num9"] = 57] = "num9";
            /**
             * 冒号(:)。
             */
            CharCode[CharCode["colon"] = 58] = "colon";
            /**
             * 分号(;)。
             */
            CharCode[CharCode["semicolon"] = 59] = "semicolon";
            /**
             * 小于(<)。
             */
            CharCode[CharCode["lessThan"] = 60] = "lessThan";
            /**
             * 等号(=)。
             */
            CharCode[CharCode["equals"] = 61] = "equals";
            /**
             * 大于(>)。
             */
            CharCode[CharCode["greaterThan"] = 62] = "greaterThan";
            /**
             * 问号(?)。
             */
            CharCode[CharCode["question"] = 63] = "question";
            /**
             * 电子邮件符号(@)。
             */
            CharCode[CharCode["at"] = 64] = "at";
            /**
             * 大写字母 A。
             */
            CharCode[CharCode["A"] = 65] = "A";
            /**
             * 大写字母 B。
             */
            CharCode[CharCode["B"] = 66] = "B";
            /**
             * 大写字母 C。
             */
            CharCode[CharCode["C"] = 67] = "C";
            /**
             * 大写字母 D。
             */
            CharCode[CharCode["D"] = 68] = "D";
            /**
             * 大写字母 E。
             */
            CharCode[CharCode["E"] = 69] = "E";
            /**
             * 大写字母 F。
             */
            CharCode[CharCode["F"] = 70] = "F";
            /**
             * 大写字母 G。
             */
            CharCode[CharCode["G"] = 71] = "G";
            /**
             * 大写字母 H。
             */
            CharCode[CharCode["H"] = 72] = "H";
            /**
             * 大写字母 I。
             */
            CharCode[CharCode["I"] = 73] = "I";
            /**
             * 大写字母 J。
             */
            CharCode[CharCode["J"] = 74] = "J";
            /**
             * 大写字母 K。
             */
            CharCode[CharCode["K"] = 75] = "K";
            /**
             * 大写字母 L。
             */
            CharCode[CharCode["L"] = 76] = "L";
            /**
             * 大写字母 M。
             */
            CharCode[CharCode["M"] = 77] = "M";
            /**
             * 大写字母 N。
             */
            CharCode[CharCode["N"] = 78] = "N";
            /**
             * 大写字母 O。
             */
            CharCode[CharCode["O"] = 79] = "O";
            /**
             * 大写字母 P。
             */
            CharCode[CharCode["P"] = 80] = "P";
            /**
             * 大写字母 Q。
             */
            CharCode[CharCode["Q"] = 81] = "Q";
            /**
             * 大写字母 R。
             */
            CharCode[CharCode["R"] = 82] = "R";
            /**
             * 大写字母 S。
             */
            CharCode[CharCode["S"] = 83] = "S";
            /**
             * 大写字母 T。
             */
            CharCode[CharCode["T"] = 84] = "T";
            /**
             * 大写字母 U。
             */
            CharCode[CharCode["U"] = 85] = "U";
            /**
             * 大写字母 V。
             */
            CharCode[CharCode["V"] = 86] = "V";
            /**
             * 大写字母 W。
             */
            CharCode[CharCode["W"] = 87] = "W";
            /**
             * 大写字母 X。
             */
            CharCode[CharCode["X"] = 88] = "X";
            /**
             * 大写字母 Y。
             */
            CharCode[CharCode["Y"] = 89] = "Y";
            /**
             * 大写字母 Z。
             */
            CharCode[CharCode["Z"] = 90] = "Z";
            /**
             * 开方括号([)。
             */
            CharCode[CharCode["openBracket"] = 91] = "openBracket";
            /**
             * 反斜杠(\)。
             */
            CharCode[CharCode["backslash"] = 92] = "backslash";
            /**
             * 闭方括号(])。
             */
            CharCode[CharCode["closeBracket"] = 93] = "closeBracket";
            /**
             * 托字符(^)。
             */
            CharCode[CharCode["caret"] = 94] = "caret";
            /**
             * 下划线(_)。
             */
            CharCode[CharCode["underline"] = 95] = "underline";
            /**
             * 开单引号(`)。
             */
            CharCode[CharCode["backtick"] = 96] = "backtick";
            /**
             * 小写字母 a。
             */
            CharCode[CharCode["a"] = 97] = "a";
            /**
             * 小写字母 b。
             */
            CharCode[CharCode["b"] = 98] = "b";
            /**
             * 小写字母 c。
             */
            CharCode[CharCode["c"] = 99] = "c";
            /**
             * 小写字母 d。
             */
            CharCode[CharCode["d"] = 100] = "d";
            /**
             * 小写字母 e。
             */
            CharCode[CharCode["e"] = 101] = "e";
            /**
             * 小写字母 f。
             */
            CharCode[CharCode["f"] = 102] = "f";
            /**
             * 小写字母 g。
             */
            CharCode[CharCode["g"] = 103] = "g";
            /**
             * 小写字母 h。
             */
            CharCode[CharCode["h"] = 104] = "h";
            /**
             * 小写字母 i。
             */
            CharCode[CharCode["i"] = 105] = "i";
            /**
             * 小写字母 j。
             */
            CharCode[CharCode["j"] = 106] = "j";
            /**
             * 小写字母 k。
             */
            CharCode[CharCode["k"] = 107] = "k";
            /**
             * 小写字母 l。
             */
            CharCode[CharCode["l"] = 108] = "l";
            /**
             * 小写字母 m。
             */
            CharCode[CharCode["m"] = 109] = "m";
            /**
             * 小写字母 n。
             */
            CharCode[CharCode["n"] = 110] = "n";
            /**
             * 小写字母 o。
             */
            CharCode[CharCode["o"] = 111] = "o";
            /**
             * 小写字母 p。
             */
            CharCode[CharCode["p"] = 112] = "p";
            /**
             * 小写字母 q。
             */
            CharCode[CharCode["q"] = 113] = "q";
            /**
             * 小写字母 r。
             */
            CharCode[CharCode["r"] = 114] = "r";
            /**
             * 小写字母 s。
             */
            CharCode[CharCode["s"] = 115] = "s";
            /**
             * 小写字母 t。
             */
            CharCode[CharCode["t"] = 116] = "t";
            /**
             * 小写字母 u。
             */
            CharCode[CharCode["u"] = 117] = "u";
            /**
             * 小写字母 v。
             */
            CharCode[CharCode["v"] = 118] = "v";
            /**
             * 小写字母 w。
             */
            CharCode[CharCode["w"] = 119] = "w";
            /**
             * 小写字母 x。
             */
            CharCode[CharCode["x"] = 120] = "x";
            /**
             * 小写字母 y。
             */
            CharCode[CharCode["y"] = 121] = "y";
            /**
             * 小写字母 z。
             */
            CharCode[CharCode["z"] = 122] = "z";
            /**
             * 开花括号({)。
             */
            CharCode[CharCode["openBrace"] = 123] = "openBrace";
            /**
             * 竖线(|)。
             */
            CharCode[CharCode["bar"] = 124] = "bar";
            /**
             * 闭花括号(})。
             */
            CharCode[CharCode["closeBrace"] = 125] = "closeBrace";
            /**
             * 波浪号(~)。
             */
            CharCode[CharCode["tilde"] = 126] = "tilde";
            /**
             * 删除(DEL)。
             */
            CharCode[CharCode["delete"] = 127] = "delete";
            /**
             * 最大的 ASCII 字符。
             */
            CharCode[CharCode["MAX_ASCII"] = 128] = "MAX_ASCII";
            // #endregion 
            // #region Unicode 字符
            /**
             * 行分隔符(LS)。
             */
            CharCode[CharCode["lineSeparator"] = 8232] = "lineSeparator";
            /**
             * 段落分隔符(PS)。
             */
            CharCode[CharCode["paragraphSeparator"] = 8233] = "paragraphSeparator";
            /**
             * 换行符(NL)。
             */
            CharCode[CharCode["nextLine"] = 133] = "nextLine";
            /**
             * 不换号空格(NBSP)。
             */
            CharCode[CharCode["nonBreakingSpace"] = 160] = "nonBreakingSpace";
            /**
             * 对开空格(EQ)。
             */
            CharCode[CharCode["enQuad"] = 8192] = "enQuad";
            CharCode[CharCode["emQuad"] = 8193] = "emQuad";
            CharCode[CharCode["enSpace"] = 8194] = "enSpace";
            CharCode[CharCode["emSpace"] = 8195] = "emSpace";
            CharCode[CharCode["threePerEmSpace"] = 8196] = "threePerEmSpace";
            CharCode[CharCode["fourPerEmSpace"] = 8197] = "fourPerEmSpace";
            CharCode[CharCode["sixPerEmSpace"] = 8198] = "sixPerEmSpace";
            CharCode[CharCode["figureSpace"] = 8199] = "figureSpace";
            CharCode[CharCode["punctuationSpace"] = 8200] = "punctuationSpace";
            CharCode[CharCode["thinSpace"] = 8201] = "thinSpace";
            CharCode[CharCode["hairSpace"] = 8202] = "hairSpace";
            /**
             * 零宽空格(ZWS)。
             */
            CharCode[CharCode["zeroWidthSpace"] = 8203] = "zeroWidthSpace";
            /**
             * 窄不换行空格(NNBS)。
             */
            CharCode[CharCode["narrowNoBreakSpace"] = 8239] = "narrowNoBreakSpace";
            /**
             * 表意字空格(IS)。
             */
            CharCode[CharCode["ideographicSpace"] = 12288] = "ideographicSpace";
            /**
             * 数学空格(MMS)。
             */
            CharCode[CharCode["mathematicalSpace"] = 8287] = "mathematicalSpace";
            /**
             * 欧甘文字(OGHAM)。
             */
            CharCode[CharCode["ogham"] = 5760] = "ogham";
            /**
             * UTF-8 标记码(BOM)。
             */
            CharCode[CharCode["byteOrderMark"] = 65279] = "byteOrderMark";
        })(CharCode || (CharCode = {}));
        var r = "";
        for (var i = 0; i < name.length; i++) {
            var n = CharCode[name.charCodeAt(i)];
            r += r ? cap(n) : n;
        }
        return r;
        function cap(w) {
            return w.replace(/^[a-z]/, function (t) { return t.toUpperCase(); });
        }
    }
    function resortTokens(tokens) {
        var list = [];
        for (var token in tokens) {
            //   put(token);   // 暂时手动排序
            list.push(token);
        }
        return list;
        function put(token) {
            var t = tokens[token]; // 获取当前标记的所属类别列表。
            // 找到满足的类别数最多的位置。
            var max = -1, p = 0;
            for (var i = 0; i <= list.length; i++) {
                // 取满足数最高的位置。如果满足数相同，取满足的属性在前面的位置。
                var v = calcPropValue(i, t);
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
            var result = 0;
            for (var j = 0; j < t.props.length; j++) {
                var prop = t.props[j];
                // 只要左右边任一个和当前属于同一个分类，则认为当前位置是属于同一个分类。
                if (list[index - 1] && tokens[list[index - 1]].props.indexOf(prop) >= 0 || list[index] && tokens[list[index]].props.indexOf(prop) >= 0) {
                    result++;
                }
            }
            return result;
        }
    }
}
/**
 * 解析 nodes 段。
 */
function parseNodes(source, tokens, nodesSource, parserSource, nodeVisitorSource) {
    // 存储所有节点信息。
    var productions = {};
    // 存储所有区域。
    var allRegions = [];
    // 解析所有行。
    var currentRegion;
    var currentProduction;
    parseLines(getRegion(source, "语法")).forEach(function (line) {
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
        if (/^\s*(\/\/|\/\*|\*|(type|declare)\b)/.test(line))
            return;
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
            var prev = currentProduction;
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
        var indent = line.substring(getIndent(line));
        // 独立列表。
        if (/^\s*list\((.*?)\)/.exec(line)) {
            var value = parseSpecailValue(line);
            currentProduction.list = value.list;
            currentProduction.codes.push(indent + "return " + value.code + ";");
            return;
        }
        function getIndent(line) {
            return (/\S/.exec(line.replace(/    /g, "\t")) || { index: 0 }).index;
        }
        function removeIndent(line, count) {
            return line.replace(/    /g, "\t").substring(count);
        }
    });
    // 展开 inline
    eachProduction(function (p) {
    });
    function expandFields(production) {
        for (var i = 0; i < production.fields.length; i++) {
        }
    }
    // 提取公共注释。
    var comments = {};
    var types = {};
    eachProduction(function (p) {
        for (var _i = 0, _a = p.fields; _i < _a.length; _i++) {
            var f = _a[_i];
            comments[f.name] = comments[f.name] || f.comment;
            types[f.name] = types[f.name] || f.type;
        }
        for (var _b = 0, _c = p.params; _b < _c.length; _b++) {
            var f = _c[_b];
            comments[f.name] = comments[f.name] || f.comment;
            types[f.name] = types[f.name] || f.type;
        }
    });
    eachProduction(function (p) {
        for (var _i = 0, _a = p.fields; _i < _a.length; _i++) {
            var f = _a[_i];
            f.comment = f.comment || comments[f.name];
            f.type = f.type || types[f.name];
        }
        for (var _b = 0, _c = p.params; _b < _c.length; _b++) {
            var f = _c[_b];
            f.comment = f.comment || comments[f.name];
            f.type = f.type || types[f.name];
        }
    });
    // 生成 parser。
    parserSource;
    // 生成 nodes。
    // 生成 nodesVisitor。
    require("fs").writeFileSync("aa.json", JSON.stringify(productions, null, 4));
    function eachProduction(callback) {
        for (var name_1 in productions) {
            callback(productions[name_1]);
        }
    }
}
;
/**
 * 获取源码中指定区域的内容。
 * @param source
 * @param rangeName
 */
function getRange(source, rangeName) {
    return (new RegExp("^.*" + rangeName + ".*\\{([\\s\\S]*?)^\\};?", "m").exec(source) || ["", ""])[1];
}
/**
 * 获取源码中指定区域的内容。
 * @param source
 * @param rangeName
 */
function setRange(source, rangeName, value) {
    return source.replace(new RegExp("^(.*" + rangeName + ".*[\\{\\[])([\\s\\S]*?)(^[\\}\\]];?)", "m"), function (_, prefix, body, postfix) { return prefix + value + postfix; });
}
/**
 * 获取源码中指定区域的内容。
 * @param source
 * @param rangeName
 */
function getRegion(source, rangeName) {
    return (new RegExp("^\\s*//\\s*#region\\s*" + rangeName + ".*([\\s\\S]*?)^//\\s*#endregion\\s*" + rangeName, "m").exec(source) || ["", ""])[1];
}
/**
 * 将源码拆分为多行。
 * @param source
 */
function parseLines(source) {
    return source.split(/\r\n?|\n/).filter(function (line) { return !!line; }); //  && !/^(\/\/|\s*(type|declare)\b)/.test(line)
}
/**
 * 拆分注释。
 * @param line
 */
function parseComment(line) {
    var result = {
        line: "",
        comment: ""
    };
    result.line = line.replace(/\/\/\s*(.+)$/, function (_, value) {
        result.comment = value.trim();
        return "";
    });
    return result;
}
// #endregion
