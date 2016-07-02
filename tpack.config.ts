/// <reference path="typings/tpack/tpack.d.ts" />
import * as tpack from "tpack";
import * as ts from "typescript";

// nodes.ts => nodes.ts & nodeVisitor.ts
tpack.task("gen-nodes", function () {
    tpack.src("src/ast/nodes.ts").pipe(function (file, options) {

        // 第一步：语法解析。
        const program = ts.createProgram([file.path], options);
        const sourceFile = program.getSourceFiles()[program.getSourceFiles().length - 1];

        // 第二步：提取类型信息。
        const nodes = {};
        for (const statement of sourceFile.statements) {
            if (statement.kind !== ts.SyntaxKind.ClassDeclaration) {
                continue;
            }
            const clazz = <ts.ClassDeclaration>statement;
            const baseClazzType = clazz.heritageClauses && clazz.heritageClauses.length && clazz.heritageClauses[0].types[0];
            let members = {};
            for (const member of clazz.members) {
                if (member.kind !== ts.SyntaxKind.PropertyDeclaration) {
                    continue;
                }
                const prop = <ts.PropertyDeclaration>member;
                if (!prop.type) {
                    continue;
                }
                members = members || {};
                members[(<ts.Identifier>prop.name).text] = sourceFile.text.substring(prop.type.pos, prop.type.end).trim();
            }

            nodes[clazz.name.text] = {
                summary: getDocComment(clazz),
                isAbstract: clazz.modifiers.some(t => t.kind === ts.SyntaxKind.AbstractKeyword),
                name: clazz.name.text,
                extends: baseClazzType && sourceFile.text.substring(baseClazzType.pos, baseClazzType.end).trim() || null,
                members,
                node: clazz,
            };
        }

        // 第三步：删除非节点类。
        for (const name in nodes) {
            const type = nodes[name];
            if (!isNodeType(name)) {
                delete nodes[name];
                continue;
            }
            for (const member in type.members) {
                if (!isNodeType(type.members[member])) {
                    delete type.members[member];
                }
            }
        }

        // 第四步：继承父节点信息。
        for (const name in nodes) {
            const type = nodes[name];
            if (type.isAbstract) continue;
            let p = type;
            while (p = nodes[p.extends]) {
                for (const m in p.members) {
                    if (!type.members[m]) {
                        type.members[m] = p.members[m];
                    }
                }
            }
        }

        // 第五步：修复类型信息。

        let acceptSummary = getDocComment(getMember(nodes["Node"].node, "accept"), false);
        let walkSummary = getDocComment(getMember(nodes["Node"].node, "walk"), false);

        let changes = [];
        for (const name in nodes) {
            const type = nodes[name];
            if (type.isAbstract) continue;

            //// 添加 

            //if (type.missingWalk) {
            //    const content = "";

            //    changes.push({
            //        pos: type.pos,
            //        content: content
            //    });
            //}

            // 修复 Accept。 
            const accept = getMember(nodes["Node"].node, "accept");
            if (accept) {
                changes.push({
                    remove: true,
                    pos: accept.pos,
                    end: accept.end,
                });
            }

            const content = `

    ${acceptSummary}
    accept(vistior: NodeVisitor) {
        return vistior.visit${type.name}(this);
    }
`;

            changes.push({
                insert: true,
                pos: type.pos,
                content: content
            });

            break;
        }

        // 第六步：应用修复。
        let source = sourceFile.text;
        changes.sort((x, y) => y.pos - x.pos);
        for (const change of changes) {
            if (change.remove) {
                source = source.substr(0, change.pos) + source.substr(change.end);
            } else {
                source = source.substr(0, change.pos) + change.content + source.substr(change.pos);
            }
        }
        file.content = source;

        function getDocComment(node: ts.Node, removeSpace = true) {
            const comments: ts.CommentRange[] = (ts as any).getJsDocComments(node, sourceFile);
            if (!comments || !comments.length) return;
            const comment = comments[comments.length - 1];

            const commentText = sourceFile.text.substring(comment.pos, comment.end);
            return removeSpace ? commentText.substring(3, commentText.length - 2).replace(/^\s*\*\s*/gm, "").trim() : commentText;
        }

        function getMember(node: ts.ClassDeclaration, name: string) {
            return (<ts.ClassDeclaration>node).members.filter(x => (<ts.Identifier>x.name).text == name)[0];
        }

        function isNodeType(type: string) {
            let p = nodes[type.replace(/\s*\|.*$|<.*>|\[\]/g, "")];
            while (p) {
                if (p.name === "Node") return true;
                p = nodes[p.extends];
            }
            return false;
        }

        function isArrayType(type: string) {
            return /<.*>|\[\]/.test(type);
        }

    });

});

tpack.task("gen", function () {

    tpack.src("src/parser/nodes.json").pipe(function (file) {
        var data = JSON.parse(file.content);

        var result = `/**
 * @fileOverview 语法树节点
 * @generated $ tpack gen
 */

import {TokenType, tokenToString} from './tokenType';
import {NodeVisitor} from './nodeVisitor';
`;

        for (var index in data) {
            var type = data[index];

            var accA = `
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    abstract accept(vistior: NodeVisitor);
                `
            var acc = `
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visit${type.name}(this);
    }
                `

            result += `
/**
 * ${type.summary}
 */
export ${type.modifiers ? type.modifiers + " " : ""}${type.type || "class"} ${type.name}${type.extends ? " extends " + type.extends : ""} {
${type.members ? type.members.map(x => member(x)).join("") : ""}${isType(type.name) ? type.name === "Node" ? accA : acc : ""}
}
`
        }

        function member(x) {
            var pp = data.find(t => t.name == type.extends);
            x.summary = x.summary || pp && pp.members && (pp.members.find(t => t.name == x.name) || {}).summary;
            x.type = x.type || pp && pp.members && (pp.members.find(t => t.name == x.name) || {}).type;

            return `
    /**
     * ${x.summary}
     */
    ${x.body ? "get " : ""}${x.name}${x.body ? "()" : ""}${x.type && !x.body ? ": " + x.type : ""}${x.body ? " { " + x.body + " }" : type.type == "enum" ? "," : ";"}
`;


        }

        file.content = result;

        var result = `/**
 * @fileOverview 节点访问器
 * @generated $ tpack gen
 */

import * as nodes from './nodes';

/**
 * 表示一个节点访问器。
 */
export abstract class NodeVisitor {

    /**
     * 访问一个多个节点数组。
     * @param nodes 要访问的节点数组。
     */
    visitList<T extends nodes.Node>(nodes: T[]) {
        for(const node of nodes) {
            node.accept(this);
        }
    }

    /**
     * 访问一个逗号隔开的节点列表(<..., ...>。
     * @param nodes 要访问的节点列表。
     */
    visitNodeList<T extends nodes.Node>(nodes: nodes.NodeList<T>) {
        this.visitList(nodes);
    }
`;

        for (var index in data) {
            var type = data[index];
            if (!isType(type.name) || type.modifiers == "abstract") continue;

            result += `
    /**
     * ${type.summary.replace("表示", "访问")}
     * @param node 要访问的节点。
     */
    visit${type.name.replace("Node>", "nodes.Node>")}(node: nodes.${type.name.replace(/<T.*>/, "<T>")}) {
${getNodeMembers(type).map(t => t.type.startsWith("NodeList") ? "        this.visitNodeList(node." + t.name + ");" : t.type.endsWith("[]") ? "        this.visitList(node." + t.name + ");" : "        node." + t.name + ".accept(this);").join("\n")}
    }
`

            function getNodeMembers(x) {
                return x.members && x.members.filter(t => ((t.type + "").endsWith("[]") || (t.type + "").startsWith("NodeList") || isType(t.type))) || [];
            }

        }

        result += `
}`;

        require("fs").writeFileSync("src/parser/nodeVisitor.ts", result);


        function isType(t) {
            while (t) {
                t = t.replace(/\s*\|.*$/, "");
                if (t === "Node") return true;
                t = data.find(tt => tt.name == t);
                if (!t) break;
                t = t.extends;
            }
            return false;
        }

    }).extension(".ts");
});
