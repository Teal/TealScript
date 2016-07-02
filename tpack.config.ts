/// <reference path="typings/tpack/tpack.d.ts" />
import * as tpack from "tpack";
import * as ts from "typescript";

// nodes.ts => nodes.ts & nodeVisitor.ts
tpack.task("gen-nodes", function () {
    tpack.allowOverwriting = true;
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
            let optional = {};
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
                if (getDocComment(prop, false).indexOf("undefined") >= 0) {
                    optional[(<ts.Identifier>prop.name).text] = true;
                }
            }

            nodes[clazz.name.text] = {
                summary: getDocComment(clazz),
                isAbstract: clazz.modifiers.some(t => t.kind === ts.SyntaxKind.AbstractKeyword),
                name: clazz.name.text,
                extends: baseClazzType && sourceFile.text.substring(baseClazzType.pos, baseClazzType.end).trim() || null,
                members,
                optional,
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
                for (const m in p.optional) {
                    if (!type.optional[m]) {
                        type.optional[m] = p.optional[m];
                    }
                }
            }
        }

        // 第五步：修复类型信息。

        let acceptSummary = getDocComment(getMember(nodes["Node"].node, "accept"), false);
        let eachSummary = getDocComment(getMember(nodes["Node"].node, "each"), false);

        let changes = [];
        for (const name in nodes) {
            const type = nodes[name];
            if (type.isAbstract) {
                continue;
            }

            const each = getMember(type.node, "each");
            if (each) {
                changes.push({
                    remove: true,
                    pos: each.pos,
                    end: each.end,
                });
            }

            const eachContentItems = [];
            for (const member in type.members) {
                const memberType = type.members[member];
                let tpl = isArrayType(memberType) ? `this.${member}.each(callback, scope)` : `callback.call(scope, this.${member}, "${member}", this) !== false`;
                if (type.optional[member]) {
                    tpl = `(!this.${member} || ${tpl})`;
                }
                eachContentItems.push(tpl);
            }

            if (eachContentItems.length) {

                const eachContent = `

    ${eachSummary}
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return ${eachContentItems.join(" &&\n            ")};
    }`;

                changes.push({
                    insert: true,
                    pos: each ? each.pos : (<ts.ClassDeclaration>type.node).members.end,
                    content: eachContent
                });
            }

            const accept = getMember(type.node, "accept");
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
    }`;

            changes.push({
                insert: true,
                pos: accept ? accept.pos : (<ts.ClassDeclaration>type.node).members.end,
                content: content
            });

        }

        // 第六步：应用修复。
        let source = sourceFile.text;
        changes.sort((x, y) => y.pos > x.pos ? 1 : y.pos < x.pos ? -1 : y.remove ? 1 : -1);
        for (const change of changes) {
            if (change.remove) {
                source = source.substr(0, change.pos) + source.substr(change.end);
            } else {
                source = source.substr(0, change.pos) + change.content + source.substr(change.pos);
            }
        }
        file.content = source;

        // 第七步：生成 NodeVistior。

        var result = `/**
 * @fileOverview 节点访问器
 * @generated 此文件可使用 \`$ tpack gen-nodes\` 命令生成。
 */

import * as nodes from './nodes';

/**
 * 表示一个节点访问器。
 */
export abstract class NodeVisitor {

    /**
     * 访问一个逗号隔开的节点列表(<..., ...>。
     * @param nodes 要访问的节点列表。
     */
    visitNodeList<T extends nodes.Node>(nodes: nodes.NodeList<T>) {
        for(const node of nodes) {
            node.accept(this);
        }
    }
`;

        for (const name in nodes) {
            const type = nodes[name];
            if (type.isAbstract) {
                continue;
            }

            let memberList = [];
            for (const member in type.members) {
                memberList.push(`        ${type.optional[member] ? "node." + member + " && " : ""}node.${member}.accept(this);`);
            }

            result += `
    /**
     * ${type.summary.replace("表示", "访问")}
     * @param node 要访问的节点。
     */
    visit${type.name}(node: nodes.${type.name}) {
${memberList.join("\n")}
    }
`

            function getNodeMembers(type) {
                let r = [];

                return r;
            }

        }

        result += `
}`;

        require("fs").writeFileSync("src/ast/nodeVisitor.ts", result);


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
            if (/^NodeList</.test(type)) return true;
            let p = nodes[type.replace(/\s*\|.*$/, "")];
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
