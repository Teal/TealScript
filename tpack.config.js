"use strict";
/// <reference path=".vscode/typings/node/node.d.ts" />
/// <reference path=".vscode/typings/tpack/tpack.d.ts" />
var tpack = require("tpack");
var ts = require("typescript");
// nodes.ts => nodes.ts & nodeVisitor.ts
tpack.task("gen-nodes", function () {
    tpack.allowOverwriting = true;
    tpack.src("src/parser/tealscript.def").pipe(function (file, options) {
        parseTokens(file.content, tpack.getFile("src/parser/tokens.ts").content);
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
    tpack.src("src/parser/tokens.ts").pipe(function (file, options) {
        // 第一步：语法解析。
        var program = ts.createProgram([file.path], options);
        var sourceFile = program.getSourceFiles()[program.getSourceFiles().length - 1];
        // 第二步：提取类型信息。
        var data = {};
        var tokenType = sourceFile.statements.filter(function (t) { return t.kind === ts.SyntaxKind.EnumDeclaration && t.name.text === "TokenType"; })[0];
        var val = 0;
        for (var _i = 0, _a = tokenType.members; _i < _a.length; _i++) {
            var member = _a[_i];
            var summary = getDocComment(member);
            var string = (/关键字\s*(\w+)|\((.+?)\)/.exec(summary) || []).slice(1).join("");
            var info = {
                summary: summary,
                string: string,
                keyword: /关键字/.test(summary) || /0x0|EOF|\}\.|xx|.\.\.\./.test(string) || !string,
                value: val++
            };
            data[member.name.text] = info;
        }
        var ss = [];
        for (var k in data) {
            var d = data[k];
            if (!d.keyword) {
                d.summary = (d.summary || "").replace(/\((.*)\)/, function (_, n) {
                    // k = n;
                    return "";
                });
            }
            ss.push("'" + (d.string || k) + "': [], // " + d.summary);
        }
        // require("fs").writeFileSync("aa.json", JSON.stringify(data, null, 4));
        require("fs").writeFileSync("aa.js", ss.join("\n"));
        //generateKeywordLexer(data, 0);
        // 第三步：生成优先级数组。
        // 第四步：生成优先级数组。
        function getDocComment(node, removeSpace) {
            if (removeSpace === void 0) { removeSpace = true; }
            var comments = ts.getJsDocComments(node, sourceFile);
            if (!comments || !comments.length)
                return;
            var comment = comments[comments.length - 1];
            var commentText = sourceFile.text.substring(comment.pos, comment.end);
            return removeSpace ? commentText.substring(3, commentText.length - 2).replace(/^\s*\*\s*/gm, "").trim() : commentText;
        }
        function generateKeywordLexer(data, indent) {
            var names = {};
            var items = [];
            for (var name_1 in data) {
                var info = data[name_1];
                if (info.keyword) {
                    continue;
                }
                names[info.string] = name_1;
                items.push(info.string);
            }
            items.sort();
            var result = '';
            for (var i = 0; i < items.length;) {
                var c = items[i];
                var hasSameCount = 0;
                for (var j_1 = i + 1; j_1 < items.length; j_1++) {
                    if (items[j_1].charAt(0) === c.charAt(0)) {
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
                    for (var j_2 = 0; j_2 < hasSameCount; j_2++) {
                        result += genIndents(indent + 1) + 'case CharCode.' + names[items[i + j_2 + 1]] + ':\n';
                        result += genIndents(indent + 2) + 'this.sourceStart++;\n';
                        result += genIndents(indent + 2) + 'result.type = TokenType.' + names[items[i + j_2 + 1]] + ';\n';
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
            console.log(result);
            function genIndents(indent) {
                var result = '';
                while (indent-- > 0)
                    result += '\t';
                return result;
            }
            return result;
        }
    });
    tpack.src("src/parser/parser.tpl").pipe(function (file, options) {
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
    var rootProductions = [];
    var productions = {};
    var comments = {};
    var types = {};
    var listItems = [];
    var stack = [];
    var lines = source.split(/\r\n?|\n/);
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (!line || /^\/\//.test(line))
            continue;
        if (/^\s*@\w/.test(line) && !/;$/.test(line)) {
            var production = parseHeader(line);
            productions[production.name] = production;
            stack.push(production);
            if (production.indent == 0) {
                production.region = production.comment;
                rootProductions.push(production.comment);
            }
        }
        else {
            var production = stack[stack.length - 1];
            while (production && getIndent(line) <= production.indent) {
                stack.pop();
                production = stack[stack.length - 1];
            }
            if (!production)
                continue;
            if (isPart(line)) {
                production.parts.push(parsePart(line.trim()));
            }
            else {
                production.codes.push(parseCode(removeIndent(line, production.indent + 1)));
            }
        }
    }
    // #endregion
    // #region 补全和生成信息
    eachProduction(function (production) {
        if (production.inline) {
            production.params[0].type = "{" +
                production.parts.map(function (p) { return p.tokens.length ? "'" + p.tokens[0] + "'?: number" : p.name + "?: " + p.type; }).join(", ") +
                "}";
        }
        // 补全参数注释
        for (var i = 0; i < production.params.length; i++) {
            var param = production.params[i];
            param.comment = param.comment || comments[param.name];
            param.type = param.type || types[param.name];
            param.comment += "。";
        }
        // 补全成员的注释
        for (var i = 0; i < production.parts.length; i++) {
            var part = production.parts[i];
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
            for (var i = 0; i < production.parts.length; i++) {
                var equals = "result." + production.parts[i].name + " = " + production.parts[i].equals + ";";
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
        for (var i = 0; i < production.parts && production.parts.length; i++) {
            var part = production.parts[i];
            // 追加内联部分。
            if (productions[part.type] && productions[part.type].inline) {
                for (var _i = 0, _a = productions[part.type].parts; _i < _a.length; _i++) {
                    var part2 = _a[_i];
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
    var regions = {};
    eachProduction(function (production) {
        var data = regions[production.region] = {
            parser: "",
            nodes: "",
            nodeVisitor: ""
        };
        // 生成解析器。
        data.parser += "\n";
        data.parser += "\t/**\n";
        data.parser += "\t * " + production.comment + "\n";
        data.parser += production.params ? production.params.map(function (p) { return "\t * @param " + p.name + " " + p.comment + "\n"; }).join("") : "";
        data.parser += "\t */";
        data.parser += "\tprivate parse" + production.name + "(" + (production.params ? production.params.map(function (p) { return p.name + (p.equal ? " = " + p.equal : p.type ? " : " + p.type : ""); }).join(", ") : "") + ") {";
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
        var result = {
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
            var extendsMap = {
                "Expression": "Expression",
                "Statement": "Statement",
                "Literal": "Expression",
                "Declaration": "Declaration",
            };
            for (var n in extendsMap) {
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
        var result = {
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
        var result = {
            element: "",
            open: "",
            close: "",
            continue: "",
            seperator: "",
            optional: false,
            type: "",
            equals: ""
        };
        var dotDotDot = "";
        var parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
            result.open = parts[0];
            result.element = parts[1];
            result.seperator = parts[2];
            dotDotDot = parts[3];
            result.close = parts[4];
        }
        else if (parts.length === 4) {
            result.open = parts[0];
            result.element = parts[1];
            dotDotDot = parts[2];
            result.close = parts[3];
        }
        else if (parts.length === 3) {
            result.element = parts[0];
            result.seperator = parts[1];
            dotDotDot = parts[2];
        }
        else if (parts.length === 2) {
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
            result.equals = "@DelimitedList(@" + result.element + ", " + (result.open ? "'" + result.open + "'" : undefined) + ", " + (result.close ? "'" + result.close + "'" : undefined) + ", " + result.optional + ", " + (result.continue ? "@" + result.continue : undefined) + ")";
        }
        else {
            result.equals = "@NodeList(@" + result.element + ", " + (result.open ? "'" + result.open + "'" : undefined) + ", " + (result.close ? "'" + result.close + "'" : undefined) + ")";
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
        return line.replace(/@peek/g, "this.lexer.peek().type");
        //.replace(/@read/g, "this.lexer.read().start")
        //.replace(/'(.+)'/g, function (_, t) {
        //    if (!/^a-z/.test(t)) t = tokenTypes[t];
        //    return "TokenType." + t;
        //})
        //.replace(/@([A-Z])/g, "this.parse$1")
        //.replace(/@/g, "this.");
    }
    function parsePart(line) {
        var result = {
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
        for (var name_2 in productions) {
            callback(productions[name_2]);
        }
    }
    function cleanObj(obj) {
        for (var k in obj) {
            if (!obj[k]) {
                delete obj[k];
            }
            else if (Array.isArray(obj[k])) {
                if (!obj[k].length) {
                    delete obj[k];
                }
                else {
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
                comment: comment ? comment.trim() : "关键字 " + name,
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
                else if (prop) {
                    token.props.push(prop);
                    if (allProps.indexOf(prop) < 0) {
                        allProps.push(prop);
                    }
                }
            });
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
        tokenSource = setRange(tokenSource, prop, "\n\treturn " + parts.join(" ||\n\t\t") + ";\n");
    }
    require("fs").writeFileSync("codes.ts", tokenSource);
    //  console.log(allProps);
    return {
        tokenTypesCode: tokenTypesCode,
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
}
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
 * 将源码拆分为多行。
 * @param source
 */
function parseLines(source) {
    return source.split(/\r\n?|\n/).filter(function (line) { return !!line; }); //  && !/^(\/\/|\s*(type|declare)\b)/.test(line)
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
        put(token);
    }
    return list;
    function put(token) {
        var t = tokens[token]; // 获取当前标记的所属类别列表。
        // 找到满足的类别数最多的位置。
        var max = -1, p = 0;
        for (var i = 0; i <= list.length; i++) {
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
    function calcPropValue(i, t) {
        var result = 0;
        for (var _i = 0, _a = t.props; _i < _a.length; _i++) {
            var prop = _a[_i];
            // 只要左右边任一个和当前属于同一个分类，则认为当前位置是属于同一个分类。
            if (list[i - 1] && tokens[list[i - 1]].props.indexOf(t.props) >= 0 || list[i] && tokens[list[i]].props.indexOf(t.props) >= 0) {
                result++;
            }
        }
        return result;
    }
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
function parseSyntax(source, tokenNames) {
    var lines = source.split(/\r\n?|\n/);
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        // 忽略空行、注释、type、declare 开头的行。
        if (!line || /^(\/\/|\s*(type|declare)\b)/.test(line))
            continue;
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
    function parseCode(production, line) {
        // _...
        if (/^\s*_/.test(line)) {
            var field_1 = {};
            line.replace(/\/\/\s*(.+)$/, function (_, value) {
                field_1.comment = value.trim();
                return "";
            }).replace(/__/, function (_) {
                field_1.optional = true;
                return "_";
            }).replace(/^\s*_\('(.*?)'\)/, function (all, token) {
                return "_." + nameOf(token) + " = " + all;
            }).replace(/_\.(\w+)\s*=\s*(.*)/, function (_, name, value) {
                field_1.name = name;
                // _.x = read('x', 'x')
                if (/_\('/.test(value)) {
                    field_1.type = "number";
                    var tokens = value.replace(/,\s+/g, ",").replace(/^_\('/g, "").replace(/'\)$/g, "").split(",");
                    if (tokens.length > 1) {
                        field_1.tokens = tokens;
                        return "result." + field_1.name + " = this.readToken(); // " + field_1.tokens.join("、");
                    }
                    field_1.token = tokens[0];
                    return "result." + field_1.name + " = this.expectToken(TokenType." + nameOf(field_1.token) + ");";
                }
                // _.x = <'xx'>
                if (/<'\w'>/) {
                }
                // _.x = T()
                field_1.type = getWord(value);
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
    function nameOf(token) {
        return (tokenNames[token] || token) + "Token";
    }
    function getWord(content) {
        return (/(\w+)/.exec(content) || [""])[0];
    }
}
// #endregion
