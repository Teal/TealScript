/// <reference path=".vscode/typings/node/node.d.ts" />
/// <reference path=".vscode/typings/tpack/tpack.d.ts" />
import * as tpack from "tpack";
import * as ts from "typescript";

// nodes.ts => nodes.ts & nodeVisitor.ts
tpack.task("gen-nodes", function () {
    tpack.allowOverwriting = true;

    //    tpack.src("src/parser/nodes.ts").pipe((file, options) => {

    //        // 第一步：语法解析。
    //        const program = ts.createProgram([file.path], options);
    //        const sourceFile = program.getSourceFiles()[program.getSourceFiles().length - 1];

    //        // 第二步：提取类型信息。
    //        const nodes = {};
    //        for (const statement of sourceFile.statements) {
    //            if (statement.kind !== ts.SyntaxKind.ClassDeclaration || !(statement.flags & ts.NodeFlags.Export)) {
    //                continue;
    //            }
    //            const clazz = <ts.ClassDeclaration>statement;
    //            const baseClazzType = clazz.heritageClauses && clazz.heritageClauses.length && clazz.heritageClauses[0].types[0];
    //            let members = {};
    //            let optional = {};
    //            for (const member of clazz.members) {
    //                if (member.kind !== ts.SyntaxKind.PropertyDeclaration) {
    //                    continue;
    //                }
    //                const prop = <ts.PropertyDeclaration>member;
    //                if (!prop.type) {
    //                    continue;
    //                }
    //                members = members || {};
    //                const type = sourceFile.text.substring(prop.type.pos, prop.type.end).trim();
    //                members[(<ts.Identifier>prop.name).text] = type;
    //                if (getDocComment(prop, false).indexOf("undefined") >= 0 || getDocComment(prop, false).indexOf("可能不存在") >= 0/* || isArrayType(type)*/) {
    //                    optional[(<ts.Identifier>prop.name).text] = true;
    //                }
    //            }

    //            nodes[clazz.name.text] = {
    //                summary: getDocComment(clazz),
    //                isAbstract: clazz.modifiers && clazz.modifiers.some(t => t.kind === ts.SyntaxKind.AbstractKeyword),
    //                name: clazz.name.text,
    //                extends: baseClazzType && sourceFile.text.substring(baseClazzType.pos, baseClazzType.end).trim() || null,
    //                members,
    //                optional,
    //                node: clazz,
    //            };
    //        }

    //        // 第三步：删除非节点类。
    //        for (const name in nodes) {
    //            const type = nodes[name];
    //            if (!isNodeType(name)) {
    //                delete nodes[name];
    //                continue;
    //            }
    //            for (const member in type.members) {
    //                if (!isNodeType(type.members[member])) {
    //                    delete type.members[member];
    //                }
    //            }
    //        }

    //        // 第四步：继承父节点信息。
    //        for (const name in nodes) {
    //            const type = nodes[name];
    //            if (type.isAbstract) continue;
    //            let p = type;
    //            while (p = nodes[p.extends]) {
    //                var r = {};
    //                for (const m in p.members) {
    //                    r[m] = p.members[m];
    //                }
    //                for (const m in type.members) {
    //                    r[m] = type.members[m];
    //                }
    //                type.members = r;
    //                for (const m in p.optional) {
    //                    if (!type.optional[m]) {
    //                        type.optional[m] = p.optional[m];
    //                    }
    //                }
    //            }
    //        }

    //        // 第五步：修复类型信息。

    //        let acceptSummary = getDocComment(getMember(nodes["Node"].node, "accept"), false);
    //        let eachSummary = getDocComment(getMember(nodes["Node"].node, "each"), false);

    //        let changes = [];
    //        for (const name in nodes) {
    //            const type = nodes[name];
    //            if (type.isAbstract) {
    //                continue;
    //            }

    //            const each = getMember(type.node, "each");
    //            if (each) {
    //                changes.push({
    //                    remove: true,
    //                    pos: each.pos,
    //                    end: each.end,
    //                });
    //            }

    //            const eachContentItems = [];
    //            for (const member in type.members) {
    //                const memberType = type.members[member];
    //                let tpl = isArrayType(memberType) ? `this.${member}.each(callback, scope)` : `callback.call(scope, this.${member}, "${member}", this) !== false`;
    //                if (type.optional[member]) {
    //                    tpl = `(!this.${member} || ${tpl})`;
    //                }
    //                eachContentItems.push(tpl);
    //            }

    //            if (eachContentItems.length) {

    //                const eachContent = `

    //    ${eachSummary}
    //    each(callback: EachCallback, scope?: any) {
    //        return ${eachContentItems.join(" &&\n            ")};
    //    }`;

    //                changes.push({
    //                    insert: true,
    //                    pos: each ? each.pos : (<ts.ClassDeclaration>type.node).members.end,
    //                    content: eachContent
    //                });
    //            }

    //            const accept = getMember(type.node, "accept");
    //            if (accept) {
    //                changes.push({
    //                    remove: true,
    //                    pos: accept.pos,
    //                    end: accept.end,
    //                });
    //            }

    //            const content = `

    //    ${acceptSummary}
    //    accept(vistior: NodeVisitor) {
    //        return vistior.visit${type.name}(this);
    //    }`;

    //            changes.push({
    //                insert: true,
    //                pos: accept ? accept.pos : (<ts.ClassDeclaration>type.node).members.end,
    //                content: content
    //            });

    //        }

    //        // 第六步：应用修复。
    //        let source = sourceFile.text;
    //        changes.sort((x, y) => y.pos > x.pos ? 1 : y.pos < x.pos ? -1 : y.remove ? 1 : -1);
    //        for (const change of changes) {
    //            if (change.remove) {
    //                source = source.substr(0, change.pos) + source.substr(change.end);
    //            } else {
    //                source = source.substr(0, change.pos) + change.content + source.substr(change.pos);
    //            }
    //        }
    //        file.content = source;

    //        // 第七步：生成 NodeVistior。

    //        var result = `/**
    // * @fileOverview 节点访问器
    // * @generated 此文件可使用 \`$ tpack gen-nodes\` 命令生成。
    // */

    //import * as nodes from './nodes';

    ///**
    // * 表示一个节点访问器。
    // */
    //export abstract class NodeVisitor {

    //    /**
    //     * 访问一个逗号隔开的节点列表(<..., ...>。
    //     * @param nodes 要访问的节点列表。
    //     */
    //    visitNodeList<T extends nodes.Node>(nodes: nodes.NodeList<T>) {
    //        for(const node of nodes) {
    //            node.accept(this);
    //        }
    //    }
    //`;

    //        for (const name in nodes) {
    //            const type = nodes[name];
    //            if (type.isAbstract) {
    //                continue;
    //            }

    //            let memberList = [];
    //            for (const member in type.members) {
    //                memberList.push(`        ${type.optional[member] ? "node." + member + " && " : ""}node.${member}.accept(this);`);
    //            }

    //            result += `
    //    /**
    //     * ${type.summary.replace("表示", "访问")}
    //     * @param node 要访问的节点。
    //     */
    //    visit${type.name}(node: nodes.${type.name}) {
    //${memberList.join("\n")}
    //    }
    //`

    //            function getNodeMembers(type) {
    //                let r = [];

    //                return r;
    //            }

    //        }

    //        result += `
    //}`;

    //        require("fs").writeFileSync("src/parser/nodeVisitor.ts", result);

    //        function getDocComment(node: ts.Node, removeSpace = true) {
    //            const comments: ts.CommentRange[] = (ts as any).getJsDocComments(node, sourceFile);
    //            if (!comments || !comments.length) return;
    //            const comment = comments[comments.length - 1];

    //            const commentText = sourceFile.text.substring(comment.pos, comment.end);
    //            return removeSpace ? commentText.substring(3, commentText.length - 2).replace(/^\s*\*\s*/gm, "").trim() : commentText;
    //        }

    //        function getMember(node: ts.ClassDeclaration, name: string) {
    //            return (<ts.ClassDeclaration>node).members.filter(x => (<ts.Identifier>x.name).text == name)[0];
    //        }

    //        function isNodeType(type: string) {
    //            if (/^NodeList</.test(type)) return true;
    //            let p = nodes[type.replace(/\s*\|.*$/, "")];
    //            while (p) {
    //                if (p.name === "Node") return true;
    //                p = nodes[p.extends];
    //            }
    //            return false;
    //        }

    //        function isArrayType(type: string) {
    //            return /<.*>|\[\]/.test(type);
    //        }

    //    });

    //    tpack.src("src/parser/tokenType.ts").pipe((file, options) => {

    //        // 第一步：语法解析。
    //        const program = ts.createProgram([file.path], options);
    //        const sourceFile = program.getSourceFiles()[program.getSourceFiles().length - 1];

    //        // 第二步：提取类型信息。
    //        const data = {};
    //        const tokenType = <ts.EnumDeclaration>sourceFile.statements.filter(t => t.kind === ts.SyntaxKind.EnumDeclaration && (<ts.EnumDeclaration>t).name.text === "TokenType")[0];
    //        let val = 0;
    //        for (const member of tokenType.members) {
    //            const summary = getDocComment(member);
    //            const string = (/关键字\s*(\w+)|\((.+?)\)/.exec(summary) || []).slice(1).join("")
    //            const info = {
    //                summary,
    //                string,
    //                keyword: /关键字/.test(summary) || /0x0|EOF|\}\.|xx|.\.\.\./.test(string) || !string,
    //                value: val++
    //            };
    //            data[(<ts.Identifier>member.name).text] = info;
    //        }

    //        // generateKeywordLexer(data, 0);

    //        // 第三步：生成优先级数组。

    //        // 第四步：生成优先级数组。

    //        function getDocComment(node: ts.Node, removeSpace = true) {
    //            const comments: ts.CommentRange[] = (ts as any).getJsDocComments(node, sourceFile);
    //            if (!comments || !comments.length) return;
    //            const comment = comments[comments.length - 1];

    //            const commentText = sourceFile.text.substring(comment.pos, comment.end);
    //            return removeSpace ? commentText.substring(3, commentText.length - 2).replace(/^\s*\*\s*/gm, "").trim() : commentText;
    //        }


    //        function generateKeywordLexer(data, indent) {

    //            const names = {};
    //            const items = [];
    //            for (const name in data) {
    //                const info = data[name];
    //                if (info.keyword) {
    //                    continue;
    //                }
    //                names[info.string] = name;
    //                items.push(info.string);
    //            }
    //            items.sort();

    //            let result = '';

    //            for (let i = 0; i < items.length;) {
    //                const c = items[i];

    //                let hasSameCount = 0;
    //                for (let j = i + 1; j < items.length; j++) {
    //                    if (items[j].charAt(0) === c.charAt(0)) {
    //                        hasSameCount++;
    //                    }
    //                }

    //                result += genIndents(indent) + "// " + c;
    //                for (var j = 0; j < hasSameCount; j++) {
    //                    result += ", " + items[i + j + 1];
    //                }
    //                result += "\n";

    //                result += genIndents(indent) + 'case CharCode.' + names[c] + ':\n';

    //                if (hasSameCount === 0) {
    //                    result += 'result.type = TokenType.' + names[c] + ';\n';
    //                    result += 'break;\n';
    //                    i++;
    //                }

    //                if (hasSameCount === 1) {
    //                    result += genIndents(indent) + 'if(this.sourceText.charCodeAt(this.sourceStart) === TokenType.' + names[items[i + 1]] + ') {';
    //                    result += genIndents(indent + 1) + 'this.sourceStart++;';
    //                    result += genIndents(indent + 1) + 'result.type = TokenType.' + names[items[i + 1]] + ';\n';
    //                    result += genIndents(indent + 1) + 'break;\n';
    //                    result += genIndents(indent) + '}';
    //                    result += genIndents(indent) + 'result.type = TokenType.' + names[c] + ';\n';
    //                    result += genIndents(indent) + 'break;\n';
    //                    i += 2;
    //                }

    //                if (hasSameCount >= 2) {
    //                    result += genIndents(indent) + ' switch (this.sourceText.charCodeAt(this.sourceStart)) {\n';
    //                    for (let j = 0; j < hasSameCount; j++) {
    //                        result += genIndents(indent + 1) + 'case CharCode.' + names[items[i + j + 1]] + ':\n';
    //                        result += genIndents(indent + 2) + 'this.sourceStart++;\n';
    //                        result += genIndents(indent + 2) + 'result.type = TokenType.' + names[items[i + j + 1]] + ';\n';
    //                        result += genIndents(indent + 2) + 'break;\n';
    //                    }
    //                    result += genIndents(indent + 1) + 'default:\n';
    //                    result += genIndents(indent + 2) + 'result.type = TokenType.' + names[c] + ';\n';
    //                    result += genIndents(indent + 2) + 'break;\n';
    //                    result += genIndents(indent) + '}\n';
    //                    i += hasSameCount + 1;

    //                    result += genIndents(indent) + 'break;\n';
    //                }

    //                result += genIndents(indent) + '\n';
    //            }

    //            console.log(result)

    //            function genIndents(indent) {
    //                var result = '';
    //                while (indent-- > 0)
    //                    result += '\t';
    //                return result;
    //            }

    //            return result;
    //        }


    //    });

    tpack.src("src/parser/parser.tpl").pipe((file, options) => {
        generateParser(file.content, 0, "", "", "");
    });

});

/**
 * 生成解析器。
 * @param source 源文件内容。
 * @param tokenTypes 所有标记类型。
 * @param parser 输入 parser.ts 源文件。
 * @param nodes 输入 nodes.ts 源文件。
 * @param nodeVisitor 输入 nodeVisitor.ts 源文件。
 * @returns 返回生成的结果。
 */
function generateParser(source, tokenTypes, parser, nodes, nodeVisitor) {

    // #region 解析源

    const rootProductions = [];
    const productions = {};
    const comments = {};
    const types = {};
    const listItems = [];
    const stack = [];
    const lines = source.split(/\r\n?|\n/);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line || /^\/\//.test(line)) continue;
        if (/^\s*@\w/.test(line) && !/;$/.test(line)) {
            const production = parseHeader(line);
            productions[production.name] = production;
            stack.push(production);
            if (production.indent == 0) {
                production.region = production.comment;
                rootProductions.push(production.comment);
            }
        } else {
            let production = stack[stack.length - 1];
            while (production && getIndent(line) <= production.indent) {
                stack.pop();
                production = stack[stack.length - 1];
            }
            if (!production) continue;
            if (isPart(line)) {
                production.parts.push(parsePart(line.trim()));
            } else {
                production.codes.push(parseCode(removeIndent(line, production.indent + 1)));
            }
        }
    }

    // #endregion

    // #region 补全和生成信息

    eachProduction(function (production) {

        if (production.inline) {
            production.params[0].type = "{" +
                production.parts.map(p => p.tokens.length ? "'" + p.tokens[0] + "'?: number" : p.name + "?: " + p.type).join(", ") +
                "}";
        }

        // 补全参数注释
        for (let i = 0; i < production.params.length; i++) {
            const param = production.params[i];
            param.comment = param.comment || comments[param.name];
            param.type = param.type || types[param.name];
            param.comment += "。";
        }

        // 补全成员的注释
        for (let i = 0; i < production.parts.length; i++) {
            const part = production.parts[i];
            part.comment = part.comment || comments[part.name];
            part.type = part.type || types[part.name];
            if (production.params[i] && production.params[i].name === "*") {
                production.params[i].name = part.name;
                production.params[i].type = part.type;
                production.params[i].comment = production.params[i].comment || ("当前" + production.comment.replace(/\(.*\)/, "") + "的" + part.comment + "。");
                part.equals = part.equals || part.name;
            }

            // 如果目标节点是列表，则按列表解析。
            if (productions[part.type] && productions[part.type].list) {
                part.equals = part.equals || productions[part.type].list.equals;
                part.type = productions[part.type].list.type;
            }

            // 自动生成 equals
            if (!part.equals) {
                part.equals = part.tokens.length ? part.tokens.length > 1 ? "@read" : "@readToken('" + part.tokens[0] + "')" : "@" + part.type + "(" + (part.args || "") + ")";
            }

            // 追加内联部分。
            if (productions[part.type] && productions[part.type].inline) {
                for (var part2 of productions[part.type].parts) {
                    production.parts.splice(i++, 0, {
                        inlined: true,
                        name: part2.name,
                        type: part2.type,
                        comment: part.comment
                    });
                }
            }

            part.comment = "获取当前" + production.comment.replace(/\(.*\)/, "") + "的" + part.comment + "。";

        }

        // 生成解析代码。
        if (production.parts.length && !production.codes.length) {
            if (!production.inline) {
                production.codes.push("const result = new @" + production.name + "();");
            }
            for (let i = 0; i < production.parts.length; i++) {
                let equals = "result." + production.parts[i].name + " = " + production.parts[i].equals + ";";
                if (production.parts[i].optional && production.parts[i].tokens.length) {
                    equals = "if (@peek === '" + production.parts[i].tokens[0] + "') " + equals;
                }
                production.codes.push(equals);
            }
            if (!production.inline) {
                production.codes.push("return result;");
            }
        }

        if (production.parts.length) {
            production.classComment = "表示一个" + production.comment + "。";
        }
        production.comment = "解析一个" + production.comment + "。";

        delete production.indent;
        cleanObj(production);
    });

    // #endregion

    // #region 生成代码

    const regions = {

    };
    eachProduction(function (production) {
        const data = regions[production.region] = {
            parser: "",
            nodes: "",
            nodeVisitor: ""
        };

        // 生成解析器。
        data.parser += "\n";
        data.parser += "\t/**\n";
        data.parser += "\t * " + production.comment + "\n";
        data.parser += production.params ? production.params.map(p => "\t * @param " + p.name + " " + p.comment + "\n").join("") : "";
        data.parser += "\t */";
        data.parser += "\tprivate parse" + production.name + "(" + (production.params ? production.params.map(p => p.name + (p.equal ? " = " + p.equal : p.type ? " : " + p.type : "")).join(", ") : "") + ") {";
        production.codes && production.codes.forEach(function (code) {
            data.parser += "\t\t" + code;
        });
        data.parser += "\t}";

        // 生成节点。
    });

    // #endregion

    var s = tpack.createFile("d.json");
    s.content = JSON.stringify(productions, null, 4);
    s.save();

    function getIndent(line) {
        return (/\S/.exec(line.replace(/    /g, "\t")) || { index: 0 }).index;
    }

    function removeIndent(line, count) {
        return line.replace(/    /g, "\t").substring(count);
    }

    function split2(line, sepeator) {
        var p = line.indexOf(sepeator);
        return p >= 0 ? [line.substring(0, p), line.substring(p + sepeator.length)] : [line, ""];
    }

    function isPart(line) {
        line = line.trim();
        return /^\?|^'.*'$|^\w+:\s*.+/.test(line);
    }

    function parseHeader(line) {
        // @Name(p:T=v/*comment*/) doc extends Foo alias A | B list ... a // title
        // 当参数 0 为 result 表示 inline；当参数为 * 表示映射成员。
        const result = {
            region: rootProductions[rootProductions.length - 1],
            indent: getIndent(line),
            name: "",
            params: [],
            doc: false,
            extends: "",
            alias: "",
            list: null,

            comment: "",
            parts: [],
            codes: [],

            inline: false
        };

        result.name = line.replace(/^\s*@/, "")
            .replace(/\/\/\s*(.+)$/, function (_, value) {
                result.comment = value.trim();
                return "";
            })
            .replace(/\bdoc\b/, function (_, value) {
                result.doc = true;
                return "";
            })
            .replace(/extends\s+(\w+)/, function (_, value) {
                result.extends = value.trim();
                return "";
            })
            .replace(/alias\s+(.+)/, function (_, value) {
                result.alias = value.trim();
                return "";
            })
            .replace(/list\s+(.+)/, function (_, value) {
                result.list = parseList(value);
                return "";
            })
            .replace(/\(([^)]+?)\)/, function (_, params) {
                result.params = params.split(/,\s*/).map(parseParam);
                return "";
            })
            .trim();

        // 填充 extends
        if (!result.extends) {
            result.extends = "Node";
            const extendsMap = {
                "Expression": "Expression",
                "Statement": "Statement",
                "Literal": "Expression",
                "Declaration": "Declaration",
            }
            for (const n in extendsMap) {
                if (result.name.indexOf(n) >= 0 && result.name !== n) {
                    result.extends = extendsMap[n];
                    break;
                }
            }
        }

        // @产生式(result)
        if (result.params && result.params.length && result.params[0].name === "result") {
            result.inline = true;
            result.params[0].comment = result.params[0].comment || "存放结果的目标节点";
        }

        return result;
    }

    function parseParam(line) {
        const result = {
            comment: "",
            name: "",
            equal: "",
            question: false,
            type: ""
        };

        result.name = line
            .replace(/\/\*(.+)\*\//, function (_, comment) {
                result.comment = comment.trim();
                return "";
            })
            .replace(/=(.+)/, function (_, value) {
                result.equal = value.trim();
                return "";
            })
            .replace(/:(.+)/, function (_, type) {
                result.type = type.trim();
                return "";
            })
            .replace(/\?/, function (_) {
                result.question = true;
                return "";
            })
            .trim();

        // 未提供注释和类型时，可以使用已提供的注释和类型。
        if (result.comment && !comments[result.name]) {
            comments[result.name] = result.comment;
        }
        if (result.type && !types[result.name]) {
            types[result.name] = result.type;
        }
        return result;
    }

    function parseList(line) {
        // [ ?TupleTypeElement , ...isTypeNodeStart ]
        const result = {
            element: "",
            open: "",
            close: "",
            continue: "",
            seperator: "",
            optional: false,
            type: "",
            equals: ""
        };
        let dotDotDot = "";

        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
            result.open = parts[0];
            result.element = parts[1];
            result.seperator = parts[2];
            dotDotDot = parts[3];
            result.close = parts[4];
        } else if (parts.length === 4) {
            result.open = parts[0];
            result.element = parts[1];
            dotDotDot = parts[2];
            result.close = parts[3];
        } else if (parts.length === 3) {
            result.element = parts[0];
            result.seperator = parts[1];
            dotDotDot = parts[2];
        } else if (parts.length === 2) {
            result.element = parts[0];
            dotDotDot = parts[1];
        }

        if (/^\?/.test(result.element)) {
            result.optional = true;
            result.element = result.element.substring(1);
        }

        if (dotDotDot.length > 3) {
            result.continue = dotDotDot.substring(3);
        }

        if (result.seperator) {
            result.equals = `@DelimitedList(@${result.element}, ${result.open ? "'" + result.open + "'" : undefined}, ${result.close ? "'" + result.close + "'" : undefined}, ${result.optional}, ${result.continue ? "@" + result.continue : undefined})`;
        } else {
            result.equals = `@NodeList(@${result.element}, ${result.open ? "'" + result.open + "'" : undefined}, ${result.close ? "'" + result.close + "'" : undefined})`;
        }
        result.type = "@NodeList<@" + result.element + ">";
        result.equals = result.equals.replace(', undefined)', ')')
            .replace(', false)', ')')
            .replace(', undefined)', ')')
            .replace(', undefined)', ')');

        listItems.push(result.element);

        return result;
    }

    function parseCode(line) {
        return line.replace(/@peek/g, "this.lexer.peek().type")
        //.replace(/@read/g, "this.lexer.read().start")
        //.replace(/'(.+)'/g, function (_, t) {
        //    if (!/^a-z/.test(t)) t = tokenTypes[t];
        //    return "TokenType." + t;
        //})
        //.replace(/@([A-Z])/g, "this.parse$1")
        //.replace(/@/g, "this.");
    }

    function parsePart(line) {
        const result = {
            optional: false,
            name: "",
            comment: "",
            args: "",
            equals: "",
            type: "",
            tokens: [],
            list: null
        };

        result.name = line.trim()
            .replace(/\/\/\s*(.+)$/, function (_, name) {
                result.comment = name.trim();
                return "";
            })
            .replace(/=\s(.+)/, function (_, value) {
                result.equals = value.trim();
                return "";
            })
            .replace(/\(([^)]+?)\)/, function (_, value) {
                result.args = value.trim();
                return "";
            })
            .replace(/:\s(.+)/, function (_, value) {
                result.type = value.trim();
                return "";
            })
            .replace(/^\?/g, function () {
                result.optional = true;
                return "";
            });

        if (!result.type) {
            result.type = result.name;
            result.name = "";
        }

        if (/^'.*'$/.test(result.type)) {
            result.tokens = result.type.substring(1, result.type.length - 1).split("'|'");
            result.name = result.name || ((tokenTypes[result.tokens[0]] || result.tokens[0]) + "Token");
            result.type = "number";
            result.comment = result.comment || (result.name + " 的位置");
        }
        if (result.optional) {
            result.comment += "(可能不存在)";
        }
        if (result.tokens && result.tokens.length > 1) {
            result.comment += "。合法的值有：`" + result.tokens.join("`、`") + "`";
        }
        if (result.comment && !comments[result.name]) {
            comments[result.name] = result.comment;
        }
        if (result.type.indexOf(" ...") >= 0) {
            result.list = parseList(result.type);
            result.equals = result.equals || result.list.equals;
            result.type = result.type || result.list.type;
        }
        return result;
    }

    function eachProduction(callback) {
        for (const name in productions) {
            callback(productions[name]);
        }
    }

    function cleanObj(obj) {
        for (const k in obj) {
            if (!obj[k]) {
                delete obj[k];
            } else if (Array.isArray(obj[k])) {
                if (!obj[k].length) {
                    delete obj[k];
                } else {
                    obj[k].forEach(cleanObj);
                }
            }
        }
    }

}

