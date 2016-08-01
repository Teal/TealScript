/// <reference path=".vscode/typings/node/node.d.ts" />
/// <reference path=".vscode/typings/tpack/tpack.d.ts" />
import * as tpack from "tpack";
import * as ts from "typescript";

// nodes.ts => nodes.ts & nodeVisitor.ts
tpack.task("gen-nodes", function () {
    tpack.allowOverwriting = true;

    tpack.src("src/parser/tealscript.def").pipe((file, options) => {
        const result = parseTokens(file.content, tpack.getFile("src/parser/tokens.ts").content);
        tpack.getFile("src/parser/tokens.ts").content = result.tokenSource;
        tpack.getFile("src/parser/tokens.ts").save();
    });

    return;

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

    tpack.src("src/parser/tokens.ts").pipe((file, options) => {

        // 第一步：语法解析。
        const program = ts.createProgram([file.path], options);
        const sourceFile = program.getSourceFiles()[program.getSourceFiles().length - 1];

        // 第二步：提取类型信息。
        const data = {};
        const tokenType = <ts.EnumDeclaration>sourceFile.statements.filter(t => t.kind === ts.SyntaxKind.EnumDeclaration && (<ts.EnumDeclaration>t).name.text === "TokenType")[0];
        let val = 0;
        for (const member of tokenType.members) {
            const summary = getDocComment(member);
            const string = (/关键字\s*(\w+)|\((.+?)\)/.exec(summary) || []).slice(1).join("")
            const info = {
                summary,
                string,
                keyword: /关键字/.test(summary) || /0x0|EOF|\}\.|xx|.\.\.\./.test(string) || !string,
                value: val++
            };
            data[(<ts.Identifier>member.name).text] = info;
        }

        let ss = [];
        for (var k in data) {
            const d = data[k];
            if (!d.keyword) {
                d.summary = (d.summary || "").replace(/\((.*)\)/, function (_, n) {
                    // k = n;
                    return "";
                });
            }
            ss.push(`'${d.string || k}': [], // ${d.summary}`);
        }

        // require("fs").writeFileSync("aa.json", JSON.stringify(data, null, 4));
        require("fs").writeFileSync("aa.js", ss.join("\n"));

        //generateKeywordLexer(data, 0);

        // 第三步：生成优先级数组。

        // 第四步：生成优先级数组。

        function getDocComment(node: ts.Node, removeSpace = true) {
            const comments: ts.CommentRange[] = (ts as any).getJsDocComments(node, sourceFile);
            if (!comments || !comments.length) return;
            const comment = comments[comments.length - 1];

            const commentText = sourceFile.text.substring(comment.pos, comment.end);
            return removeSpace ? commentText.substring(3, commentText.length - 2).replace(/^\s*\*\s*/gm, "").trim() : commentText;
        }


        function generateKeywordLexer(data, indent) {

            const names = {};
            const items = [];
            for (const name in data) {
                const info = data[name];
                if (info.keyword) {
                    continue;
                }
                names[info.string] = name;
                items.push(info.string);
            }
            items.sort();

            let result = '';

            for (let i = 0; i < items.length;) {
                const c = items[i];

                let hasSameCount = 0;
                for (let j = i + 1; j < items.length; j++) {
                    if (items[j].charAt(0) === c.charAt(0)) {
                        hasSameCount++;
                    }
                }

                result += genIndents(indent) + "// " + c;
                for (var j = 0; j < hasSameCount; j++) {
                    result += ", " + items[i + j + 1];
                }
                result += "\n";

                result += genIndents(indent) + 'case CharCode.' + names[c] + ':\n';

                if (hasSameCount === 0) {
                    result += 'result.type = TokenType.' + names[c] + ';\n';
                    result += 'break;\n';
                    i++;
                }

                if (hasSameCount === 1) {
                    result += genIndents(indent) + 'if(this.sourceText.charCodeAt(this.sourceStart) === TokenType.' + names[items[i + 1]] + ') {';
                    result += genIndents(indent + 1) + 'this.sourceStart++;';
                    result += genIndents(indent + 1) + 'result.type = TokenType.' + names[items[i + 1]] + ';\n';
                    result += genIndents(indent + 1) + 'break;\n';
                    result += genIndents(indent) + '}';
                    result += genIndents(indent) + 'result.type = TokenType.' + names[c] + ';\n';
                    result += genIndents(indent) + 'break;\n';
                    i += 2;
                }

                if (hasSameCount >= 2) {
                    result += genIndents(indent) + ' switch (this.sourceText.charCodeAt(this.sourceStart)) {\n';
                    for (let j = 0; j < hasSameCount; j++) {
                        result += genIndents(indent + 1) + 'case CharCode.' + names[items[i + j + 1]] + ':\n';
                        result += genIndents(indent + 2) + 'this.sourceStart++;\n';
                        result += genIndents(indent + 2) + 'result.type = TokenType.' + names[items[i + j + 1]] + ';\n';
                        result += genIndents(indent + 2) + 'break;\n';
                    }
                    result += genIndents(indent + 1) + 'default:\n';
                    result += genIndents(indent + 2) + 'result.type = TokenType.' + names[c] + ';\n';
                    result += genIndents(indent + 2) + 'break;\n';
                    result += genIndents(indent) + '}\n';
                    i += hasSameCount + 1;

                    result += genIndents(indent) + 'break;\n';
                }

                result += genIndents(indent) + '\n';
            }

            console.log(result)

            function genIndents(indent) {
                var result = '';
                while (indent-- > 0)
                    result += '\t';
                return result;
            }

            return result;
        }


    });

    tpack.src("src/parser/parser.tpl").pipe((file, options) => {
        //  generateParser(file.content, 0, "", "", "");
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

            part.partComment = "获取当前" + production.comment.replace(/\(.*\)/, "") + "的" + part.comment + "。";

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

    eachProduction(function (production) {
        // 补全成员的注释
        for (let i = 0; i < production.parts && production.parts.length; i++) {
            const part = production.parts[i];

            // 追加内联部分。
            if (productions[part.type] && productions[part.type].inline) {
                for (var part2 of productions[part.type].parts) {
                    production.parts.splice(i++, 0, {
                        inlined: true,
                        name: part2.name,
                        type: part2.type,
                        comment: "获取当前" + production.comment.replace(/\(.*\)/, "") + "的" + part.comment + "。"
                    });
                }
            }

        }
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
            result.comment = result.comment || (" " + result.tokens[0] + " 的位置");
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

function parseSyntax(source: string, tokenNames: {}) {

    const lines = source.split(/\r\n?|\n/);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 忽略空行、注释、type、declare 开头的行。
        if (!line || /^(\/\/|\s*(type|declare)\b)/.test(line)) continue;



    }

    function parseHeader(line) {

    }

    function parseParam(line) {

    }

    function isPart(line) {
        return /^\s*_/.test(line);
    }

	/**
	 * 从指定的代码行中提取字段信息。
	 * @param production 所属的产生式。
	 * @param line 行源码。
	 */
    function parseCode(production: Production, line: string) {

        // _...
        if (/^\s*_/.test(line)) {
            const field: ProductionField = {};
            line.replace(/\/\/\s*(.+)$/, function (_, value) {
                field.comment = value.trim();
                return "";
            }).replace(/__/, (_) => {
                field.optional = true;
                return "_";
            }).replace(/^\s*_\('(.*?)'\)/, (all, token) => {
                return "_." + nameOf(token) + " = " + all;
            }).replace(/_\.(\w+)\s*=\s*(.*)/, (_, name, value) => {
                field.name = name;

                // _.x = read('x', 'x')
                if (/_\('/.test(value)) {
                    field.type = "number";
                    const tokens = value.replace(/,\s+/g, ",").replace(/^_\('/g, "").replace(/'\)$/g, "").split(",");
                    if (tokens.length > 1) {
                        field.tokens = tokens;
                        return `result.${field.name} = this.readToken(); // ${field.tokens.join("、")}`;
                    }
                    field.token = tokens[0];
                    return `result.${field.name} = this.expectToken(TokenType.${nameOf(field.token)});`;
                }

                // _.x = <'xx'>
                if (/<'\w'>/) {

                }

                // _.x = T()
                field.type = getWord(value);
                return _.replace("_", "result");
            });
        }

        // Initializer(_);
        if (line.indexOf("(_)") >= 0) {
            production.fields.push({
                inline: getWord(line)
            });
            return line.replace("_", "result");
        }

        return line;
    }

    function nameOf(token: string) {
        return (tokenNames[token] || token) + "Token";
    }

    function getWord(content) {
        return (/(\w+)/.exec(content) || [""])[0];
    }

    interface Production {
        fields: ProductionField[];
    }

    interface ProductionField {
        inline?: string;
        tokens?: string[];
        token?: string;
        name?: string;
        type?: string;
        optional?: boolean;
        comment?: string;
    }

}

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
