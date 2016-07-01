var tpack = require("tpack");

tpack.task("gen", function () {

    tpack.src("src/parser/nodes.json").copy().pipe(function (file) {
        var data = JSON.parse(file.content);

        var result = `/**
 * @fileOverview 语法树节点
 * @generated $ tpack gen
 */

import {TokenType} from './tokenType';
`;

        for (var index in data) {
            var type = data[index];
            result += `
/**
 * ${type.summary}
 */
export ${type.modifiers ? type.modifiers + " " : ""}${type.type || "class"} ${type.name}${type.extends ? " extends " + type.extends : ""} {
${type.members ? type.members.map(x => member(x)).join("") : ""}
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

    }).extension(".ts");

    tpack.src("src/parser/nodes.json").copy().pipe(function (file) {
        var data = JSON.parse(file.content);

        var result = `/**
 * @fileOverview 节点访问器
 * @generated $ tpack gen
 */

/**
 * 表示一个节点访问器。
 */
export abstract class NodeVisitor {

`;

        for (var index in data) {
            var type = data[index];

            
            result += `
    /**
     * 访问一个${type.summary.replace(/表示一个|。|\(.*?\)|（.*?）/, "")}。
     */
    visit${type.name}() {
${getNodeMembers(type).map(t=>"        this." +t.name + ".accept(this);").join("\n")}
}
`

            function getNodeMembers(x) {
                return x.members && x.members.filter(t => /^A-Z/.test(t.type)) || [];
            }

        }

result += `




}`;

        file.content = result;

    }).dest("src/parser/nodeVisitor.ts");
});
