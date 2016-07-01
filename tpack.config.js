var tpack = require("tpack");

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
            x.summary = x.summary || pp && pp.members && (pp.members.find(t=>t.name == x.name) || {}).summary;
            x.type = x.type || pp && pp.members && (pp.members.find(t=>t.name == x.name) || {}).type;

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
${getNodeMembers(type).map(t=>t.type.startsWith("NodeList") ? "        this.visitNodeList(node." + t.name + ");" : t.type.endsWith("[]") ? "        this.visitList(node." + t.name + ");" : "        node." + t.name + ".accept(this);").join("\n")}
    }
`

            function getNodeMembers(x) {
                return x.members && x.members.filter(t=>((t.type + "").endsWith("[]") || (t.type + "").startsWith("NodeList") || isType(t.type))) || [];
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
