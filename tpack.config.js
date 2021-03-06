"use strict";
/// <reference path="typings/node/node.d.ts" />
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
            if (statement.kind !== ts.SyntaxKind.ClassDeclaration || !(statement.flags & ts.NodeFlags.Export)) {
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
                var type = sourceFile.text.substring(prop.type.pos, prop.type.end).trim();
                members[prop.name.text] = type;
                if (getDocComment(prop, false).indexOf("undefined") >= 0 || getDocComment(prop, false).indexOf("可能不存在") >= 0 /* || isArrayType(type)*/) {
                    optional[prop.name.text] = true;
                }
            }
            nodes[clazz.name.text] = {
                summary: getDocComment(clazz),
                isAbstract: clazz.modifiers && clazz.modifiers.some(function (t) { return t.kind === ts.SyntaxKind.AbstractKeyword; }),
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
                var r = {};
                for (var m in p.members) {
                    r[m] = p.members[m];
                }
                for (var m in type.members) {
                    r[m] = type.members[m];
                }
                type.members = r;
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
                var eachContent = "\n\n    " + eachSummary + "\n    each(callback: EachCallback, scope?: any) {\n        return " + eachContentItems.join(" &&\n            ") + ";\n    }";
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
    tpack.src("src/ast/tokenType.ts").pipe(function (file, options) {
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
        // generateKeywordLexer(data, 0);
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
            for (var name_5 in data) {
                var info = data[name_5];
                if (info.keyword) {
                    continue;
                }
                names[info.string] = name_5;
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
});
