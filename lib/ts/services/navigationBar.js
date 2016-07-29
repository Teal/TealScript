/// <reference path='services.ts' />
/* @internal */
var ts;
(function (ts) {
    var NavigationBar;
    (function (NavigationBar) {
        function getNavigationBarItems(sourceFile) {
            curSourceFile = sourceFile;
            var result = ts.map(topLevelItems(rootNavigationBarNode(sourceFile)), convertToTopLevelItem);
            curSourceFile = undefined;
            return result;
        }
        NavigationBar.getNavigationBarItems = getNavigationBarItems;
        // Keep sourceFile handy so we don't have to search for it every time we need to call `getText`.
        var curSourceFile;
        function nodeText(node) {
            return node.getText(curSourceFile);
        }
        function navigationBarNodeKind(n) {
            return n.node.kind;
        }
        function pushChild(parent, child) {
            if (parent.children) {
                parent.children.push(child);
            }
            else {
                parent.children = [child];
            }
        }
        /*
        For performance, we keep navigation bar parents on a stack rather than passing them through each recursion.
        `parent` is the current parent and is *not* stored in parentsStack.
        `startNode` sets a new parent and `endNode` returns to the previous parent.
        */
        var parentsStack = [];
        var parent;
        function rootNavigationBarNode(sourceFile) {
            ts.Debug.assert(!parentsStack.length);
            var root = { node: sourceFile, additionalNodes: undefined, parent: undefined, children: undefined, indent: 0 };
            parent = root;
            for (var _i = 0, _a = sourceFile.statements; _i < _a.length; _i++) {
                var statement = _a[_i];
                addChildrenRecursively(statement);
            }
            endNode();
            ts.Debug.assert(!parent && !parentsStack.length);
            return root;
        }
        function addLeafNode(node) {
            pushChild(parent, emptyNavigationBarNode(node));
        }
        function emptyNavigationBarNode(node) {
            return {
                node: node,
                additionalNodes: undefined,
                parent: parent,
                children: undefined,
                indent: parent.indent + 1
            };
        }
        /**
         * Add a new level of NavigationBarNodes.
         * This pushes to the stack, so you must call `endNode` when you are done adding to this node.
         */
        function startNode(node) {
            var navNode = emptyNavigationBarNode(node);
            pushChild(parent, navNode);
            // Save the old parent
            parentsStack.push(parent);
            parent = navNode;
        }
        /** Call after calling `startNode` and adding children to it. */
        function endNode() {
            if (parent.children) {
                mergeChildren(parent.children);
                sortChildren(parent.children);
            }
            parent = parentsStack.pop();
        }
        function addNodeWithRecursiveChild(node, child) {
            startNode(node);
            addChildrenRecursively(child);
            endNode();
        }
        /** Look for navigation bar items in node's subtree, adding them to the current `parent`. */
        function addChildrenRecursively(node) {
            if (!node || ts.isToken(node)) {
                return;
            }
            switch (node.kind) {
                case SyntaxKind.Constructor:
                    // Get parameter properties, and treat them as being on the *same* level as the constructor, not under it.
                    var ctr = node;
                    addNodeWithRecursiveChild(ctr, ctr.body);
                    // Parameter properties are children of the class, not the constructor.
                    for (var _i = 0, _a = ctr.parameters; _i < _a.length; _i++) {
                        var param = _a[_i];
                        if (ts.isParameterPropertyDeclaration(param)) {
                            addLeafNode(param);
                        }
                    }
                    break;
                case SyntaxKind.MethodDeclaration:
                case SyntaxKind.GetAccessor:
                case SyntaxKind.SetAccessor:
                case SyntaxKind.MethodSignature:
                    if (!ts.hasDynamicName(node)) {
                        addNodeWithRecursiveChild(node, node.body);
                    }
                    break;
                case SyntaxKind.PropertyDeclaration:
                case SyntaxKind.PropertySignature:
                    if (!ts.hasDynamicName(node)) {
                        addLeafNode(node);
                    }
                    break;
                case SyntaxKind.ImportClause:
                    var importClause = node;
                    // Handle default import case e.g.:
                    //    import d from "mod";
                    if (importClause.name) {
                        addLeafNode(importClause);
                    }
                    // Handle named bindings in imports e.g.:
                    //    import * as NS from "mod";
                    //    import {a, b as B} from "mod";
                    var namedBindings = importClause.namedBindings;
                    if (namedBindings) {
                        if (namedBindings.kind === SyntaxKind.NamespaceImport) {
                            addLeafNode(namedBindings);
                        }
                        else {
                            for (var _b = 0, _c = namedBindings.elements; _b < _c.length; _b++) {
                                var element = _c[_b];
                                addLeafNode(element);
                            }
                        }
                    }
                    break;
                case SyntaxKind.BindingElement:
                case SyntaxKind.VariableDeclaration:
                    var decl = node;
                    var name_1 = decl.name;
                    if (ts.isBindingPattern(name_1)) {
                        addChildrenRecursively(name_1);
                    }
                    else if (decl.initializer && isFunctionOrClassExpression(decl.initializer)) {
                        // For `const x = function() {}`, just use the function node, not the const.
                        addChildrenRecursively(decl.initializer);
                    }
                    else {
                        addNodeWithRecursiveChild(decl, decl.initializer);
                    }
                    break;
                case SyntaxKind.ArrowFunction:
                case SyntaxKind.FunctionDeclaration:
                case SyntaxKind.FunctionExpression:
                    addNodeWithRecursiveChild(node, node.body);
                    break;
                case SyntaxKind.EnumDeclaration:
                    startNode(node);
                    for (var _d = 0, _e = node.members; _d < _e.length; _d++) {
                        var member = _e[_d];
                        if (!isComputedProperty(member)) {
                            addLeafNode(member);
                        }
                    }
                    endNode();
                    break;
                case SyntaxKind.ClassDeclaration:
                case SyntaxKind.ClassExpression:
                case SyntaxKind.InterfaceDeclaration:
                    startNode(node);
                    for (var _f = 0, _g = node.members; _f < _g.length; _f++) {
                        var member = _g[_f];
                        addChildrenRecursively(member);
                    }
                    endNode();
                    break;
                case SyntaxKind.ModuleDeclaration:
                    addNodeWithRecursiveChild(node, getInteriorModule(node).body);
                    break;
                case SyntaxKind.ExportSpecifier:
                case SyntaxKind.ImportEqualsDeclaration:
                case SyntaxKind.IndexSignature:
                case SyntaxKind.CallSignature:
                case SyntaxKind.ConstructSignature:
                case SyntaxKind.TypeAliasDeclaration:
                    addLeafNode(node);
                    break;
                default:
                    if (node.jsDocComments) {
                        for (var _h = 0, _j = node.jsDocComments; _h < _j.length; _h++) {
                            var jsDocComment = _j[_h];
                            for (var _k = 0, _l = jsDocComment.tags; _k < _l.length; _k++) {
                                var tag = _l[_k];
                                if (tag.kind === SyntaxKind.JSDocTypedefTag) {
                                    addLeafNode(tag);
                                }
                            }
                        }
                    }
                    ts.forEachChild(node, addChildrenRecursively);
            }
        }
        /** Merge declarations of the same kind. */
        function mergeChildren(children) {
            var nameToItems = {};
            ts.filterMutate(children, function (child) {
                var decl = child.node;
                var name = decl.name && nodeText(decl.name);
                if (!name) {
                    // Anonymous items are never merged.
                    return true;
                }
                var itemsWithSameName = ts.getProperty(nameToItems, name);
                if (!itemsWithSameName) {
                    nameToItems[name] = child;
                    return true;
                }
                if (itemsWithSameName instanceof Array) {
                    for (var _i = 0, itemsWithSameName_1 = itemsWithSameName; _i < itemsWithSameName_1.length; _i++) {
                        var itemWithSameName = itemsWithSameName_1[_i];
                        if (tryMerge(itemWithSameName, child)) {
                            return false;
                        }
                    }
                    itemsWithSameName.push(child);
                    return true;
                }
                else {
                    var itemWithSameName = itemsWithSameName;
                    if (tryMerge(itemWithSameName, child)) {
                        return false;
                    }
                    nameToItems[name] = [itemWithSameName, child];
                    return true;
                }
                function tryMerge(a, b) {
                    if (shouldReallyMerge(a.node, b.node)) {
                        merge(a, b);
                        return true;
                    }
                    return false;
                }
            });
            /** a and b have the same name, but they may not be mergeable. */
            function shouldReallyMerge(a, b) {
                return a.kind === b.kind && (a.kind !== SyntaxKind.ModuleDeclaration || areSameModule(a, b));
                // We use 1 NavNode to represent 'A.B.C', but there are multiple source nodes.
                // Only merge module nodes that have the same chain. Don't merge 'A.B.C' with 'A'!
                function areSameModule(a, b) {
                    if (a.body.kind !== b.body.kind) {
                        return false;
                    }
                    if (a.body.kind !== SyntaxKind.ModuleDeclaration) {
                        return true;
                    }
                    return areSameModule(a.body, b.body);
                }
            }
            /** Merge source into target. Source should be thrown away after this is called. */
            function merge(target, source) {
                target.additionalNodes = target.additionalNodes || [];
                target.additionalNodes.push(source.node);
                if (source.additionalNodes) {
                    (_a = target.additionalNodes).push.apply(_a, source.additionalNodes);
                }
                target.children = ts.concatenate(target.children, source.children);
                if (target.children) {
                    mergeChildren(target.children);
                    sortChildren(target.children);
                }
                var _a;
            }
        }
        /** Recursively ensure that each NavNode's children are in sorted order. */
        function sortChildren(children) {
            children.sort(compareChildren);
        }
        function compareChildren(child1, child2) {
            var name1 = tryGetName(child1.node), name2 = tryGetName(child2.node);
            if (name1 && name2) {
                var cmp = localeCompareFix(name1, name2);
                return cmp !== 0 ? cmp : navigationBarNodeKind(child1) - navigationBarNodeKind(child2);
            }
            else {
                return name1 ? 1 : name2 ? -1 : navigationBarNodeKind(child1) - navigationBarNodeKind(child2);
            }
        }
        // More efficient to create a collator once and use its `compare` than to call `a.localeCompare(b)` many times.
        var collator = typeof Intl === "undefined" ? undefined : new Intl.Collator();
        // Intl is missing in Safari, and node 0.10 treats "a" as greater than "B".
        var localeCompareIsCorrect = collator && collator.compare("a", "B") < 0;
        var localeCompareFix = localeCompareIsCorrect ? collator.compare : function (a, b) {
            // This isn't perfect, but it passes all of our tests.
            for (var i = 0; i < Math.min(a.length, b.length); i++) {
                var chA = a.charAt(i), chB = b.charAt(i);
                if (chA === "\"" && chB === "'") {
                    return 1;
                }
                if (chA === "'" && chB === "\"") {
                    return -1;
                }
                var cmp = chA.toLocaleLowerCase().localeCompare(chB.toLocaleLowerCase());
                if (cmp !== 0) {
                    return cmp;
                }
            }
            return a.length - b.length;
        };
        /**
         * This differs from getItemName because this is just used for sorting.
         * We only sort nodes by name that have a more-or-less "direct" name, as opposed to `new()` and the like.
         * So `new()` can still come before an `aardvark` method.
         */
        function tryGetName(node) {
            if (node.kind === SyntaxKind.ModuleDeclaration) {
                return getModuleName(node);
            }
            var decl = node;
            if (decl.name) {
                return ts.getPropertyNameForPropertyNameNode(decl.name);
            }
            switch (node.kind) {
                case SyntaxKind.FunctionExpression:
                case SyntaxKind.ArrowFunction:
                case SyntaxKind.ClassExpression:
                    return getFunctionOrClassName(node);
                case SyntaxKind.JSDocTypedefTag:
                    return getJSDocTypedefTagName(node);
                default:
                    return undefined;
            }
        }
        function getItemName(node) {
            if (node.kind === SyntaxKind.ModuleDeclaration) {
                return getModuleName(node);
            }
            var name = node.name;
            if (name) {
                var text = nodeText(name);
                if (text.length > 0) {
                    return text;
                }
            }
            switch (node.kind) {
                case SyntaxKind.SourceFile:
                    var sourceFile = node;
                    return ts.isExternalModule(sourceFile)
                        ? "\"" + ts.escapeString(ts.getBaseFileName(ts.removeFileExtension(ts.normalizePath(sourceFile.fileName)))) + "\""
                        : "<global>";
                case SyntaxKind.ArrowFunction:
                case SyntaxKind.FunctionDeclaration:
                case SyntaxKind.FunctionExpression:
                case SyntaxKind.ClassDeclaration:
                case SyntaxKind.ClassExpression:
                    if (node.flags & 512 /* Default */) {
                        return "default";
                    }
                    return getFunctionOrClassName(node);
                case SyntaxKind.Constructor:
                    return "constructor";
                case SyntaxKind.ConstructSignature:
                    return "new()";
                case SyntaxKind.CallSignature:
                    return "()";
                case SyntaxKind.IndexSignature:
                    return "[]";
                case SyntaxKind.JSDocTypedefTag:
                    return getJSDocTypedefTagName(node);
                default:
                    return "<unknown>";
            }
        }
        function getJSDocTypedefTagName(node) {
            if (node.name) {
                return node.name.text;
            }
            else {
                var parentNode = node.parent && node.parent.parent;
                if (parentNode && parentNode.kind === SyntaxKind.VariableStatement) {
                    if (parentNode.declarationList.declarations.length > 0) {
                        var nameIdentifier = parentNode.declarationList.declarations[0].name;
                        if (nameIdentifier.kind === SyntaxKind.Identifier) {
                            return nameIdentifier.text;
                        }
                    }
                }
                return "<typedef>";
            }
        }
        /** Flattens the NavNode tree to a list, keeping only the top-level items. */
        function topLevelItems(root) {
            var topLevel = [];
            function recur(item) {
                if (isTopLevel(item)) {
                    topLevel.push(item);
                    if (item.children) {
                        for (var _i = 0, _a = item.children; _i < _a.length; _i++) {
                            var child = _a[_i];
                            recur(child);
                        }
                    }
                }
            }
            recur(root);
            return topLevel;
            function isTopLevel(item) {
                switch (navigationBarNodeKind(item)) {
                    case SyntaxKind.ClassDeclaration:
                    case SyntaxKind.ClassExpression:
                    case SyntaxKind.EnumDeclaration:
                    case SyntaxKind.InterfaceDeclaration:
                    case SyntaxKind.ModuleDeclaration:
                    case SyntaxKind.SourceFile:
                    case SyntaxKind.TypeAliasDeclaration:
                    case SyntaxKind.JSDocTypedefTag:
                        return true;
                    case SyntaxKind.Constructor:
                    case SyntaxKind.MethodDeclaration:
                    case SyntaxKind.GetAccessor:
                    case SyntaxKind.SetAccessor:
                        return hasSomeImportantChild(item);
                    case SyntaxKind.ArrowFunction:
                    case SyntaxKind.FunctionDeclaration:
                    case SyntaxKind.FunctionExpression:
                        return isTopLevelFunctionDeclaration(item);
                    default:
                        return false;
                }
                function isTopLevelFunctionDeclaration(item) {
                    if (!item.node.body) {
                        return false;
                    }
                    switch (navigationBarNodeKind(item.parent)) {
                        case SyntaxKind.ModuleBlock:
                        case SyntaxKind.SourceFile:
                        case SyntaxKind.MethodDeclaration:
                        case SyntaxKind.Constructor:
                            return true;
                        default:
                            return hasSomeImportantChild(item);
                    }
                }
                function hasSomeImportantChild(item) {
                    return ts.forEach(item.children, function (child) {
                        var childKind = navigationBarNodeKind(child);
                        return childKind !== SyntaxKind.VariableDeclaration && childKind !== SyntaxKind.BindingElement;
                    });
                }
            }
        }
        // NavigationBarItem requires an array, but will not mutate it, so just give it this for performance.
        var emptyChildItemArray = [];
        function convertToTopLevelItem(n) {
            return {
                text: getItemName(n.node),
                kind: nodeKind(n.node),
                kindModifiers: ts.getNodeModifiers(n.node),
                spans: getSpans(n),
                childItems: ts.map(n.children, convertToChildItem) || emptyChildItemArray,
                indent: n.indent,
                bolded: false,
                grayed: false
            };
            function convertToChildItem(n) {
                return {
                    text: getItemName(n.node),
                    kind: nodeKind(n.node),
                    kindModifiers: ts.getNodeModifiers(n.node),
                    spans: getSpans(n),
                    childItems: emptyChildItemArray,
                    indent: 0,
                    bolded: false,
                    grayed: false
                };
            }
            function getSpans(n) {
                var spans = [getNodeSpan(n.node)];
                if (n.additionalNodes) {
                    for (var _i = 0, _a = n.additionalNodes; _i < _a.length; _i++) {
                        var node = _a[_i];
                        spans.push(getNodeSpan(node));
                    }
                }
                return spans;
            }
        }
        // TODO: GH#9145: We should just use getNodeKind. No reason why navigationBar and navigateTo should have different behaviors.
        function nodeKind(node) {
            switch (node.kind) {
                case SyntaxKind.SourceFile:
                    return ts.ScriptElementKind.moduleElement;
                case SyntaxKind.EnumMember:
                    return ts.ScriptElementKind.memberVariableElement;
                case SyntaxKind.VariableDeclaration:
                case SyntaxKind.BindingElement:
                    var variableDeclarationNode = void 0;
                    var name_2;
                    if (node.kind === SyntaxKind.BindingElement) {
                        name_2 = node.name;
                        variableDeclarationNode = node;
                        // binding elements are added only for variable declarations
                        // bubble up to the containing variable declaration
                        while (variableDeclarationNode && variableDeclarationNode.kind !== SyntaxKind.VariableDeclaration) {
                            variableDeclarationNode = variableDeclarationNode.parent;
                        }
                        ts.Debug.assert(!!variableDeclarationNode);
                    }
                    else {
                        ts.Debug.assert(!ts.isBindingPattern(node.name));
                        variableDeclarationNode = node;
                        name_2 = node.name;
                    }
                    if (ts.isConst(variableDeclarationNode)) {
                        return ts.ScriptElementKind.constElement;
                    }
                    else if (ts.isLet(variableDeclarationNode)) {
                        return ts.ScriptElementKind.letElement;
                    }
                    else {
                        return ts.ScriptElementKind.variableElement;
                    }
                case SyntaxKind.ArrowFunction:
                    return ts.ScriptElementKind.functionElement;
                case SyntaxKind.JSDocTypedefTag:
                    return ts.ScriptElementKind.typeElement;
                default:
                    return ts.getNodeKind(node);
            }
        }
        function getModuleName(moduleDeclaration) {
            // We want to maintain quotation marks.
            if (ts.isAmbientModule(moduleDeclaration)) {
                return ts.getTextOfNode(moduleDeclaration.name);
            }
            // Otherwise, we need to aggregate each identifier to build up the qualified name.
            var result = [];
            result.push(moduleDeclaration.name.text);
            while (moduleDeclaration.body && moduleDeclaration.body.kind === SyntaxKind.ModuleDeclaration) {
                moduleDeclaration = moduleDeclaration.body;
                result.push(moduleDeclaration.name.text);
            }
            return result.join(".");
        }
        /**
         * For 'module A.B.C', we want to get the node for 'C'.
         * We store 'A' as associated with a NavNode, and use getModuleName to traverse down again.
         */
        function getInteriorModule(decl) {
            return decl.body.kind === SyntaxKind.ModuleDeclaration ? getInteriorModule(decl.body) : decl;
        }
        function isComputedProperty(member) {
            return !member.name || member.name.kind === SyntaxKind.ComputedPropertyName;
        }
        function getNodeSpan(node) {
            return node.kind === SyntaxKind.SourceFile
                ? ts.createTextSpanFromBounds(node.getFullStart(), node.getEnd())
                : ts.createTextSpanFromBounds(node.getStart(curSourceFile), node.getEnd());
        }
        function getFunctionOrClassName(node) {
            if (node.name && ts.getFullWidth(node.name) > 0) {
                return ts.declarationNameToString(node.name);
            }
            else if (node.parent.kind === SyntaxKind.VariableDeclaration) {
                return ts.declarationNameToString(node.parent.name);
            }
            else if (node.parent.kind === SyntaxKind.BinaryExpression &&
                node.parent.operatorToken.kind === SyntaxKind.EqualsToken) {
                return nodeText(node.parent.left);
            }
            else if (node.parent.kind === SyntaxKind.PropertyAssignment && node.parent.name) {
                return nodeText(node.parent.name);
            }
            else if (node.flags & 512 /* Default */) {
                return "default";
            }
            else {
                return ts.isClassLike(node) ? "<class>" : "<function>";
            }
        }
        function isFunctionOrClassExpression(node) {
            return node.kind === SyntaxKind.FunctionExpression || node.kind === SyntaxKind.ArrowFunction || node.kind === SyntaxKind.ClassExpression;
        }
    })(NavigationBar = ts.NavigationBar || (ts.NavigationBar = {}));
})(ts || (ts = {}));
//# sourceMappingURL=navigationBar.js.map