"use strict";
/// <reference path="typings/tpack/tpack.d.ts" />
var tpack = require("tpack");
var ts = require("typescript");
// nodes.ts => nodes.ts & nodeVisitor.ts
tpack.task("gen-nodes", function () {
    tpack.src("src/ast/nodes.ts").pipe(function (file, options) {
        // 第一步：语法解析。
        var program = ts.createProgram([file.path], options);
        var sourceFile = program.getSourceFiles()[program.getSourceFiles().length - 1];
        // 第二步：提取类型信息。
        var nodes = {};
        for (var _i = 0, _a = sourceFile.statements; _i < _a.length; _i++) {
            var statement = _a[_i];
            if (statement.kind !== ts.SyntaxKind.ClassDeclaration) {
                continue;
            }
            var clazz = statement;
            var baseClazzType = clazz.heritageClauses && clazz.heritageClauses.length && clazz.heritageClauses[0].types[0];
            var members = {};
            for (var _b = 0, _c = clazz.members; _b < _c.length; _b++) {
                var member = _c[_b];
                if (member.kind !== ts.SyntaxKind.PropertyDeclaration) {
                    continue;
                }
                var prop = member;
                if (!prop.type) {
                    continue;
                }
                members = members || {};
                members[prop.name.text] = sourceFile.text.substring(prop.type.pos, prop.type.end).trim();
            }
            nodes[clazz.name.text] = {
                summary: getDocComment(clazz),
                isAbstract: clazz.modifiers.some(function (t) { return t.kind === ts.SyntaxKind.AbstractKeyword; }),
                name: clazz.name.text,
                extends: baseClazzType && sourceFile.text.substring(baseClazzType.pos, baseClazzType.end).trim() || null,
                members: members,
                node: clazz,
            };
        }
        // 第三步：删除非节点类。
        for (var name_1 in nodes) {
            var type = nodes[name_1];
            if (!isNodeType(name_1)) {
                delete nodes[name_1];
                continue;
            }
            for (var member in type.members) {
                if (!isNodeType(type.members[member])) {
                    delete type.members[member];
                }
            }
        }
        // 第四步：继承父节点信息。
        for (var name_2 in nodes) {
            var type = nodes[name_2];
            if (type.isAbstract)
                continue;
            var p = type;
            while (p = nodes[p.extends]) {
                for (var m in p.members) {
                    if (!type.members[m]) {
                        type.members[m] = p.members[m];
                    }
                }
            }
        }
        // 第五步：修复类型信息。
        var acceptSummary = getDocComment(getMember(nodes["Node"].node, "accept"), false);
        var walkSummary = getDocComment(getMember(nodes["Node"].node, "walk"), false);
        var changes = [];
        for (var name_3 in nodes) {
            var type = nodes[name_3];
            if (type.isAbstract)
                continue;
            //// 添加 
            //if (type.missingWalk) {
            //    const content = "";
            //    changes.push({
            //        pos: type.pos,
            //        content: content
            //    });
            //}
            // 修复 Accept。 
            var accept = getMember(nodes["Node"].node, "accept");
            if (accept) {
                changes.push({
                    remove: true,
                    pos: accept.pos,
                    end: accept.end,
                });
            }
            var content = "\n\n    " + acceptSummary + "\n    accept(vistior: NodeVisitor) {\n        return vistior.visit" + type.name + "(this);\n    }\n";
            changes.push({
                insert: true,
                pos: type.pos,
                content: content
            });
            break;
        }
        // 第六步：应用修复。
        var source = sourceFile.text;
        changes.sort(function (x, y) { return y.pos - x.pos; });
        for (var _d = 0, changes_1 = changes; _d < changes_1.length; _d++) {
            var change = changes_1[_d];
            if (change.remove) {
                source = source.substr(0, change.pos) + source.substr(change.end);
            }
            else {
                source = source.substr(0, change.pos) + change.content + source.substr(change.pos);
            }
        }
        file.content = source;
        function getDocComment(node, removeSpace) {
            if (removeSpace === void 0) { removeSpace = true; }
            var comments = ts.getJsDocComments(node, sourceFile);
            if (!comments || !comments.length)
                return;
            var comment = comments[comments.length - 1];
            var commentText = sourceFile.text.substring(comment.pos, comment.end);
            return removeSpace ? commentText.substring(3, commentText.length - 2).replace(/^\s*\*\s*/gm, "").trim() : commentText;
        }
        function getMember(node, name) {
            return node.members.filter(function (x) { return x.name.text == name; })[0];
        }
        function isNodeType(type) {
            var p = nodes[type.replace(/\s*\|.*$|<.*>|\[\]/g, "")];
            while (p) {
                if (p.name === "Node")
                    return true;
                p = nodes[p.extends];
            }
            return false;
        }
        function isArrayType(type) {
            return /<.*>|\[\]/.test(type);
        }
    });
});
tpack.task("gen", function () {
    tpack.src("src/parser/nodes.json").pipe(function (file) {
        var data = JSON.parse(file.content);
        var result = "/**\n * @fileOverview \u8BED\u6CD5\u6811\u8282\u70B9\n * @generated $ tpack gen\n */\n\nimport {TokenType, tokenToString} from './tokenType';\nimport {NodeVisitor} from './nodeVisitor';\n";
        for (var index in data) {
            var type = data[index];
            var accA = "\n    /**\n     * \u4F7F\u7528\u6307\u5B9A\u7684\u8282\u70B9\u8BBF\u95EE\u5668\u5904\u7406\u5F53\u524D\u8282\u70B9\u3002\n     * @param vistior \u8981\u4F7F\u7528\u7684\u8282\u70B9\u8BBF\u95EE\u5668\u3002\n     */\n    abstract accept(vistior: NodeVisitor);\n                ";
            var acc = "\n    /**\n     * \u4F7F\u7528\u6307\u5B9A\u7684\u8282\u70B9\u8BBF\u95EE\u5668\u5904\u7406\u5F53\u524D\u8282\u70B9\u3002\n     * @param vistior \u8981\u4F7F\u7528\u7684\u8282\u70B9\u8BBF\u95EE\u5668\u3002\n     */\n    accept(vistior: NodeVisitor) {\n        return vistior.visit" + type.name + "(this);\n    }\n                ";
            result += "\n/**\n * " + type.summary + "\n */\nexport " + (type.modifiers ? type.modifiers + " " : "") + (type.type || "class") + " " + type.name + (type.extends ? " extends " + type.extends : "") + " {\n" + (type.members ? type.members.map(function (x) { return member(x); }).join("") : "") + (isType(type.name) ? type.name === "Node" ? accA : acc : "") + "\n}\n";
        }
        function member(x) {
            var pp = data.find(function (t) { return t.name == type.extends; });
            x.summary = x.summary || pp && pp.members && (pp.members.find(function (t) { return t.name == x.name; }) || {}).summary;
            x.type = x.type || pp && pp.members && (pp.members.find(function (t) { return t.name == x.name; }) || {}).type;
            return "\n    /**\n     * " + x.summary + "\n     */\n    " + (x.body ? "get " : "") + x.name + (x.body ? "()" : "") + (x.type && !x.body ? ": " + x.type : "") + (x.body ? " { " + x.body + " }" : type.type == "enum" ? "," : ";") + "\n";
        }
        file.content = result;
        var result = "/**\n * @fileOverview \u8282\u70B9\u8BBF\u95EE\u5668\n * @generated $ tpack gen\n */\n\nimport * as nodes from './nodes';\n\n/**\n * \u8868\u793A\u4E00\u4E2A\u8282\u70B9\u8BBF\u95EE\u5668\u3002\n */\nexport abstract class NodeVisitor {\n\n    /**\n     * \u8BBF\u95EE\u4E00\u4E2A\u591A\u4E2A\u8282\u70B9\u6570\u7EC4\u3002\n     * @param nodes \u8981\u8BBF\u95EE\u7684\u8282\u70B9\u6570\u7EC4\u3002\n     */\n    visitList<T extends nodes.Node>(nodes: T[]) {\n        for(const node of nodes) {\n            node.accept(this);\n        }\n    }\n\n    /**\n     * \u8BBF\u95EE\u4E00\u4E2A\u9017\u53F7\u9694\u5F00\u7684\u8282\u70B9\u5217\u8868(<..., ...>\u3002\n     * @param nodes \u8981\u8BBF\u95EE\u7684\u8282\u70B9\u5217\u8868\u3002\n     */\n    visitNodeList<T extends nodes.Node>(nodes: nodes.NodeList<T>) {\n        this.visitList(nodes);\n    }\n";
        for (var index in data) {
            var type = data[index];
            if (!isType(type.name) || type.modifiers == "abstract")
                continue;
            result += "\n    /**\n     * " + type.summary.replace("表示", "访问") + "\n     * @param node \u8981\u8BBF\u95EE\u7684\u8282\u70B9\u3002\n     */\n    visit" + type.name.replace("Node>", "nodes.Node>") + "(node: nodes." + type.name.replace(/<T.*>/, "<T>") + ") {\n" + getNodeMembers(type).map(function (t) { return t.type.startsWith("NodeList") ? "        this.visitNodeList(node." + t.name + ");" : t.type.endsWith("[]") ? "        this.visitList(node." + t.name + ");" : "        node." + t.name + ".accept(this);"; }).join("\n") + "\n    }\n";
            function getNodeMembers(x) {
                return x.members && x.members.filter(function (t) { return ((t.type + "").endsWith("[]") || (t.type + "").startsWith("NodeList") || isType(t.type)); }) || [];
            }
        }
        result += "\n}";
        require("fs").writeFileSync("src/parser/nodeVisitor.ts", result);
        function isType(t) {
            while (t) {
                t = t.replace(/\s*\|.*$/, "");
                if (t === "Node")
                    return true;
                t = data.find(function (tt) { return tt.name == t; });
                if (!t)
                    break;
                t = t.extends;
            }
            return false;
        }
    }).extension(".ts");
});
