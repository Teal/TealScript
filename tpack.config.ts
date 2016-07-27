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

    const productions = readSource();
    console.log(productions);

    function readSource() {

        const productions = {};

        const stack = [];
        const lines = source.split(/\r\n?|\n/);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || /^\/\//.test(line)) continue;

            if (/^@/.test(line)) {
                const production = {
                    indent: getIndent(line),
                    comment: "",
                    name: "",
                    equals: "",
                    params: [],
                    parts: [],
                    codes: []
                };
                production.name = line
                    .replace(/\/\/\s*(.*)$/, function (_, name) {
                        production.comment = name.trim();
                        return "";
                    })
                    .replace(/@(\w+)\s*\(([^)]*?)\)/, function (_, prop, value) {
                        production[prop] = value.trim();
                        return "";
                    })
                    .replace(/@=(.*)/, function (_, value) {
                        production.equals = value.trim();
                        return "";
                    })
                    .replace(/\(([^)]*?)\)/, function (_, params) {
                        production.params = params.split(/,\s*/)
                            .map(function (p) {
                                const info = {
                                    comment: "",
                                    name: "",
                                    equal: "",
                                    question: false,
                                    type: ""
                                };
                                info.name = p.replace(/\/\*(.*)\*\//, function (_, comment) {
                                    info.comment = comment.trim();
                                    return "";
                                })
                                    .replace(/=(.*)/, function (_, value) {
                                        info.equal = value.trim();
                                        return "";
                                    })
                                    .replace(/:(.*)/, function (_, type) {
                                        info.type = type.trim();
                                        return "";
                                    })
                                    .replace(/\?/, function (_) {
                                        info.question = true;
                                        return "";
                                    })
                                    .trim();
                                return info;
                            });
                        return "";
                    });

                productions[production.name] = production;
                stack.push(production);
            } else {
                let production = stack[stack.length - 1];
                if (getIndent(line) <= production.indent) {
                    stack.pop();
                    production = stack[stack.length - 1];
                }
                if (isCode(line)) {
                    production.codes.push(formatCode(removeIndent(line, production.indent + 1)));
                } else {
                    production.parts.push(formatPart(line.trim()));
                }
            }
        }

        return productions;

        function getIndent(line) {
            return /^\s*/.exec(line)[0].length;
        }

        function removeIndent(line, count) {
            return line.substring(count);
        }

        function split2(line, sepeator) {
            var p = line.indexOf(sepeator);
            return p >= 0 ? [line.substring(0, p), line.substring(p + sepeator.length)] : [line, ""];
        }

        function isCode(line) {
            return /[\{:;\}\?]$/.test(line) && !/^\?[:;\{\?]$/.test(line);
        }

        function formatCode(line) {
            return line.replace(/@peek/g, "this.lexer.peek().type")
                .replace(/@read/g, "this.lexer.read().start")
                .replace(/'(.+)'/g, function (_, t) {
                    if (!/^a-z/.test(t)) t = tokenTypes[t];
                    return "TokenType." + t;
                })
                .replace(/@([A-Z])/g, "this.parse$1")
                .replace(/@/g, "this.");
        }

        function formatPart(line) {
            const result = {
                optional: false,
                name: "",
                comment: "",
                args: "",
                equals: "",
                type: ""
            };
            result.name = line
                .replace(/\/\/\s*(.*)$/, function (_, name) {
                    result.comment = name.trim();
                    return "";
                })
                .replace(/@=(.*)/, function (_, value) {
                    result.equals = value.trim();
                    return "";
                })
                .replace(/\(([^)]*?)\)/, function (_, value) {
                    result.args = value.trim();
                    return "";
                })
                .replace(/@:(.*)/, function (_, value) {
                    result.type = value.trim();
                    return "";
                })
                .replace(/^\?/g, function () {
                    result.optional = true;
                    return "";
                });
            return result;
        }

    }

}

