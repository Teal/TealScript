"use strict";
/// <reference path="typings/tpack/tpack.d.ts" />
var tpack = require("tpack");
var ts = require("typescript");
// nodes.ts => nodes.ts & nodeVisitor.ts
tpack.task("gen-nodes", function () {
    tpack.allowOverwriting = true;
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
            var optional = {};
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
                if (getDocComment(prop, false).indexOf("undefined") >= 0) {
                    optional[prop.name.text] = true;
                }
            }
            nodes[clazz.name.text] = {
                summary: getDocComment(clazz),
                isAbstract: clazz.modifiers.some(function (t) { return t.kind === ts.SyntaxKind.AbstractKeyword; }),
                name: clazz.name.text,
                extends: baseClazzType && sourceFile.text.substring(baseClazzType.pos, baseClazzType.end).trim() || null,
                members: members,
                optional: optional,
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
                for (var m in p.optional) {
                    if (!type.optional[m]) {
                        type.optional[m] = p.optional[m];
                    }
                }
            }
        }
        // 第五步：修复类型信息。
        var acceptSummary = getDocComment(getMember(nodes["Node"].node, "accept"), false);
        var eachSummary = getDocComment(getMember(nodes["Node"].node, "each"), false);
        var changes = [];
        for (var name_3 in nodes) {
            var type = nodes[name_3];
            if (type.isAbstract) {
                continue;
            }
            var each = getMember(type.node, "each");
            if (each) {
                changes.push({
                    remove: true,
                    pos: each.pos,
                    end: each.end,
                });
            }
            var eachContentItems = [];
            for (var member in type.members) {
                var memberType = type.members[member];
                var tpl = isArrayType(memberType) ? "this." + member + ".each(callback, scope)" : "callback.call(scope, this." + member + ", \"" + member + "\", this) !== false";
                if (type.optional[member]) {
                    tpl = "(!this." + member + " || " + tpl + ")";
                }
                eachContentItems.push(tpl);
            }
            if (eachContentItems.length) {
                var eachContent = "\n\n    " + eachSummary + "\n    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {\n        return " + eachContentItems.join(" &&\n            ") + ";\n    }";
                changes.push({
                    insert: true,
                    pos: each ? each.pos : type.node.members.end,
                    content: eachContent
                });
            }
            var accept = getMember(type.node, "accept");
            if (accept) {
                changes.push({
                    remove: true,
                    pos: accept.pos,
                    end: accept.end,
                });
            }
            var content = "\n\n    " + acceptSummary + "\n    accept(vistior: NodeVisitor) {\n        return vistior.visit" + type.name + "(this);\n    }";
            changes.push({
                insert: true,
                pos: accept ? accept.pos : type.node.members.end,
                content: content
            });
        }
        // 第六步：应用修复。
        var source = sourceFile.text;
        changes.sort(function (x, y) { return y.pos > x.pos ? 1 : y.pos < x.pos ? -1 : y.remove ? 1 : -1; });
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
        // 第七步：生成 NodeVistior。
        var result = "/**\n * @fileOverview \u8282\u70B9\u8BBF\u95EE\u5668\n * @generated \u6B64\u6587\u4EF6\u53EF\u4F7F\u7528 `$ tpack gen-nodes` \u547D\u4EE4\u751F\u6210\u3002\n */\n\nimport * as nodes from './nodes';\n\n/**\n * \u8868\u793A\u4E00\u4E2A\u8282\u70B9\u8BBF\u95EE\u5668\u3002\n */\nexport abstract class NodeVisitor {\n\n    /**\n     * \u8BBF\u95EE\u4E00\u4E2A\u9017\u53F7\u9694\u5F00\u7684\u8282\u70B9\u5217\u8868(<..., ...>\u3002\n     * @param nodes \u8981\u8BBF\u95EE\u7684\u8282\u70B9\u5217\u8868\u3002\n     */\n    visitNodeList<T extends nodes.Node>(nodes: nodes.NodeList<T>) {\n        for(const node of nodes) {\n            node.accept(this);\n        }\n    }\n";
        for (var name_4 in nodes) {
            var type = nodes[name_4];
            if (type.isAbstract) {
                continue;
            }
            var memberList = [];
            for (var member in type.members) {
                memberList.push("        " + (type.optional[member] ? "node." + member + " && " : "") + "node." + member + ".accept(this);");
            }
            result += "\n    /**\n     * " + type.summary.replace("表示", "访问") + "\n     * @param node \u8981\u8BBF\u95EE\u7684\u8282\u70B9\u3002\n     */\n    visit" + type.name + "(node: nodes." + type.name + ") {\n" + memberList.join("\n") + "\n    }\n";
            function getNodeMembers(type) {
                var r = [];
                return r;
            }
        }
        result += "\n}";
        require("fs").writeFileSync("src/ast/nodeVisitor.ts", result);
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
            if (/^NodeList</.test(type))
                return true;
            var p = nodes[type.replace(/\s*\|.*$/, "")];
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
