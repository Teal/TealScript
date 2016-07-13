/// <reference path="sys.ts" />
/* @internal */
var ts;
(function (ts) {
    function getDeclarationOfKind(symbol, kind) {
        var declarations = symbol.declarations;
        if (declarations) {
            for (var _i = 0, declarations_1 = declarations; _i < declarations_1.length; _i++) {
                var declaration = declarations_1[_i];
                if (declaration.kind === kind) {
                    return declaration;
                }
            }
        }
        return undefined;
    }
    ts.getDeclarationOfKind = getDeclarationOfKind;
    // Pool writers to avoid needing to allocate them for every symbol we write.
    var stringWriters = [];
    function getSingleLineStringWriter() {
        if (stringWriters.length === 0) {
            var str_1 = "";
            var writeText = function (text) { return str_1 += text; };
            return {
                string: function () { return str_1; },
                writeKeyword: writeText,
                writeOperator: writeText,
                writePunctuation: writeText,
                writeSpace: writeText,
                writeStringLiteral: writeText,
                writeParameter: writeText,
                writeSymbol: writeText,
                // Completely ignore indentation for string writers.  And map newlines to
                // a single space.
                writeLine: function () { return str_1 += " "; },
                increaseIndent: function () { },
                decreaseIndent: function () { },
                clear: function () { return str_1 = ""; },
                trackSymbol: function () { },
                reportInaccessibleThisError: function () { }
            };
        }
        return stringWriters.pop();
    }
    ts.getSingleLineStringWriter = getSingleLineStringWriter;
    function releaseStringWriter(writer) {
        writer.clear();
        stringWriters.push(writer);
    }
    ts.releaseStringWriter = releaseStringWriter;
    function getFullWidth(node) {
        return node.end - node.pos;
    }
    ts.getFullWidth = getFullWidth;
    function mapIsEqualTo(map1, map2) {
        if (!map1 || !map2) {
            return map1 === map2;
        }
        return containsAll(map1, map2) && containsAll(map2, map1);
    }
    ts.mapIsEqualTo = mapIsEqualTo;
    function containsAll(map, other) {
        for (var key in map) {
            if (!ts.hasProperty(map, key)) {
                continue;
            }
            if (!ts.hasProperty(other, key) || map[key] !== other[key]) {
                return false;
            }
        }
        return true;
    }
    function arrayIsEqualTo(array1, array2, equaler) {
        if (!array1 || !array2) {
            return array1 === array2;
        }
        if (array1.length !== array2.length) {
            return false;
        }
        for (var i = 0; i < array1.length; i++) {
            var equals = equaler ? equaler(array1[i], array2[i]) : array1[i] === array2[i];
            if (!equals) {
                return false;
            }
        }
        return true;
    }
    ts.arrayIsEqualTo = arrayIsEqualTo;
    function hasResolvedModule(sourceFile, moduleNameText) {
        return sourceFile.resolvedModules && ts.hasProperty(sourceFile.resolvedModules, moduleNameText);
    }
    ts.hasResolvedModule = hasResolvedModule;
    function getResolvedModule(sourceFile, moduleNameText) {
        return hasResolvedModule(sourceFile, moduleNameText) ? sourceFile.resolvedModules[moduleNameText] : undefined;
    }
    ts.getResolvedModule = getResolvedModule;
    function setResolvedModule(sourceFile, moduleNameText, resolvedModule) {
        if (!sourceFile.resolvedModules) {
            sourceFile.resolvedModules = {};
        }
        sourceFile.resolvedModules[moduleNameText] = resolvedModule;
    }
    ts.setResolvedModule = setResolvedModule;
    function setResolvedTypeReferenceDirective(sourceFile, typeReferenceDirectiveName, resolvedTypeReferenceDirective) {
        if (!sourceFile.resolvedTypeReferenceDirectiveNames) {
            sourceFile.resolvedTypeReferenceDirectiveNames = {};
        }
        sourceFile.resolvedTypeReferenceDirectiveNames[typeReferenceDirectiveName] = resolvedTypeReferenceDirective;
    }
    ts.setResolvedTypeReferenceDirective = setResolvedTypeReferenceDirective;
    /* @internal */
    function moduleResolutionIsEqualTo(oldResolution, newResolution) {
        return oldResolution.resolvedFileName === newResolution.resolvedFileName && oldResolution.isExternalLibraryImport === newResolution.isExternalLibraryImport;
    }
    ts.moduleResolutionIsEqualTo = moduleResolutionIsEqualTo;
    /* @internal */
    function typeDirectiveIsEqualTo(oldResolution, newResolution) {
        return oldResolution.resolvedFileName === newResolution.resolvedFileName && oldResolution.primary === newResolution.primary;
    }
    ts.typeDirectiveIsEqualTo = typeDirectiveIsEqualTo;
    /* @internal */
    function hasChangesInResolutions(names, newResolutions, oldResolutions, comparer) {
        if (names.length !== newResolutions.length) {
            return false;
        }
        for (var i = 0; i < names.length; i++) {
            var newResolution = newResolutions[i];
            var oldResolution = oldResolutions && ts.hasProperty(oldResolutions, names[i]) ? oldResolutions[names[i]] : undefined;
            var changed = oldResolution
                ? !newResolution || !comparer(oldResolution, newResolution)
                : newResolution;
            if (changed) {
                return true;
            }
        }
        return false;
    }
    ts.hasChangesInResolutions = hasChangesInResolutions;
    // Returns true if this node contains a parse error anywhere underneath it.
    function containsParseError(node) {
        aggregateChildData(node);
        return (node.flags & 268435456 /* ThisNodeOrAnySubNodesHasError */) !== 0;
    }
    ts.containsParseError = containsParseError;
    function aggregateChildData(node) {
        if (!(node.flags & 536870912 /* HasAggregatedChildData */)) {
            // A node is considered to contain a parse error if:
            //  a) the parser explicitly marked that it had an error
            //  b) any of it's children reported that it had an error.
            var thisNodeOrAnySubNodesHasError = ((node.flags & 67108864 /* ThisNodeHasError */) !== 0) ||
                ts.forEachChild(node, containsParseError);
            // If so, mark ourselves accordingly.
            if (thisNodeOrAnySubNodesHasError) {
                node.flags |= 268435456 /* ThisNodeOrAnySubNodesHasError */;
            }
            // Also mark that we've propagated the child information to this node.  This way we can
            // always consult the bit directly on this node without needing to check its children
            // again.
            node.flags |= 536870912 /* HasAggregatedChildData */;
        }
    }
    function getSourceFileOfNode(node) {
        while (node && node.kind !== 402 /* SourceFile */) {
            node = node.parent;
        }
        return node;
    }
    ts.getSourceFileOfNode = getSourceFileOfNode;
    function isStatementWithLocals(node) {
        switch (node.kind) {
            case 345 /* Block */:
            case 373 /* CaseBlock */:
            case 352 /* ForStatement */:
            case 353 /* ForInStatement */:
            case 354 /* ForOfStatement */:
                return true;
        }
        return false;
    }
    ts.isStatementWithLocals = isStatementWithLocals;
    function getStartPositionOfLine(line, sourceFile) {
        ts.Debug.assert(line >= 0);
        return ts.getLineStarts(sourceFile)[line];
    }
    ts.getStartPositionOfLine = getStartPositionOfLine;
    // This is a useful function for debugging purposes.
    function nodePosToString(node) {
        var file = getSourceFileOfNode(node);
        var loc = ts.getLineAndCharacterOfPosition(file, node.pos);
        return file.fileName + "(" + (loc.line + 1) + "," + (loc.character + 1) + ")";
    }
    ts.nodePosToString = nodePosToString;
    function getStartPosOfNode(node) {
        return node.pos;
    }
    ts.getStartPosOfNode = getStartPosOfNode;
    function getEndLinePosition(line, sourceFile) {
        ts.Debug.assert(line >= 0);
        var lineStarts = ts.getLineStarts(sourceFile);
        var lineIndex = line;
        var sourceText = sourceFile.text;
        if (lineIndex + 1 === lineStarts.length) {
            // last line - return EOF
            return sourceText.length - 1;
        }
        else {
            // current line start
            var start = lineStarts[lineIndex];
            // take the start position of the next line - 1 = it should be some line break
            var pos = lineStarts[lineIndex + 1] - 1;
            ts.Debug.assert(ts.isLineBreak(sourceText.charCodeAt(pos)));
            // walk backwards skipping line breaks, stop the the beginning of current line.
            // i.e:
            // <some text>
            // $ <- end of line for this position should match the start position
            while (start <= pos && ts.isLineBreak(sourceText.charCodeAt(pos))) {
                pos--;
            }
            return pos;
        }
    }
    ts.getEndLinePosition = getEndLinePosition;
    // Returns true if this node is missing from the actual source code. A 'missing' node is different
    // from 'undefined/defined'. When a node is undefined (which can happen for optional nodes
    // in the tree), it is definitely missing. However, a node may be defined, but still be
    // missing.  This happens whenever the parser knows it needs to parse something, but can't
    // get anything in the source code that it expects at that location. For example:
    //
    //          let a: ;
    //
    // Here, the Type in the Type-Annotation is not-optional (as there is a colon in the source
    // code). So the parser will attempt to parse out a type, and will create an actual node.
    // However, this node will be 'missing' in the sense that no actual source-code/tokens are
    // contained within it.
    function nodeIsMissing(node) {
        if (!node) {
            return true;
        }
        return node.pos === node.end && node.pos >= 0 && node.kind !== 1 /* endOfFile */;
    }
    ts.nodeIsMissing = nodeIsMissing;
    function nodeIsPresent(node) {
        return !nodeIsMissing(node);
    }
    ts.nodeIsPresent = nodeIsPresent;
    function getTokenPosOfNode(node, sourceFile, includeJsDocComment) {
        // With nodes that have no width (i.e. 'Missing' nodes), we actually *don't*
        // want to skip trivia because this will launch us forward to the next token.
        if (nodeIsMissing(node)) {
            return node.pos;
        }
        if (isJSDocNode(node)) {
            return ts.skipTrivia((sourceFile || getSourceFileOfNode(node)).text, node.pos, /*stopAfterLineBreak*/ false, /*stopAtComments*/ true);
        }
        if (includeJsDocComment && node.jsDocComments && node.jsDocComments.length > 0) {
            return getTokenPosOfNode(node.jsDocComments[0]);
        }
        // For a syntax list, it is possible that one of its children has JSDocComment nodes, while
        // the syntax list itself considers them as normal trivia. Therefore if we simply skip
        // trivia for the list, we may have skipped the JSDocComment as well. So we should process its
        // first child to determine the actual position of its first token.
        if (node.kind === 428 /* SyntaxList */ && node._children.length > 0) {
            return getTokenPosOfNode(node._children[0], sourceFile, includeJsDocComment);
        }
        return ts.skipTrivia((sourceFile || getSourceFileOfNode(node)).text, node.pos);
    }
    ts.getTokenPosOfNode = getTokenPosOfNode;
    function isJSDocNode(node) {
        return node.kind >= 403 /* FirstJSDocNode */ && node.kind <= 427 /* LastJSDocNode */;
    }
    ts.isJSDocNode = isJSDocNode;
    function getNonDecoratorTokenPosOfNode(node, sourceFile) {
        if (nodeIsMissing(node) || !node.decorators) {
            return getTokenPosOfNode(node, sourceFile);
        }
        return ts.skipTrivia((sourceFile || getSourceFileOfNode(node)).text, node.decorators.end);
    }
    ts.getNonDecoratorTokenPosOfNode = getNonDecoratorTokenPosOfNode;
    function getSourceTextOfNodeFromSourceFile(sourceFile, node, includeTrivia) {
        if (includeTrivia === void 0) { includeTrivia = false; }
        if (nodeIsMissing(node)) {
            return "";
        }
        var text = sourceFile.text;
        return text.substring(includeTrivia ? node.pos : ts.skipTrivia(text, node.pos), node.end);
    }
    ts.getSourceTextOfNodeFromSourceFile = getSourceTextOfNodeFromSourceFile;
    function getTextOfNodeFromSourceText(sourceText, node) {
        if (nodeIsMissing(node)) {
            return "";
        }
        return sourceText.substring(ts.skipTrivia(sourceText, node.pos), node.end);
    }
    ts.getTextOfNodeFromSourceText = getTextOfNodeFromSourceText;
    function getTextOfNode(node, includeTrivia) {
        if (includeTrivia === void 0) { includeTrivia = false; }
        return getSourceTextOfNodeFromSourceFile(getSourceFileOfNode(node), node, includeTrivia);
    }
    ts.getTextOfNode = getTextOfNode;
    // Add an extra underscore to identifiers that start with two underscores to avoid issues with magic names like '__proto__'
    function escapeIdentifier(identifier) {
        return identifier.length >= 2 && identifier.charCodeAt(0) === ts.CharCode.underline && identifier.charCodeAt(1) === ts.CharCode.underline ? "_" + identifier : identifier;
    }
    ts.escapeIdentifier = escapeIdentifier;
    // Remove extra underscore from escaped identifier
    function unescapeIdentifier(identifier) {
        return identifier.length >= 3 && identifier.charCodeAt(0) === ts.CharCode.underline && identifier.charCodeAt(1) === ts.CharCode.underline && identifier.charCodeAt(2) === ts.CharCode.underline ? identifier.substr(1) : identifier;
    }
    ts.unescapeIdentifier = unescapeIdentifier;
    // Make an identifier from an external module name by extracting the string after the last "/" and replacing
    // all non-alphanumeric characters with underscores
    function makeIdentifierFromModuleName(moduleName) {
        return ts.getBaseFileName(moduleName).replace(/^(\d)/, "_$1").replace(/\W/g, "_");
    }
    ts.makeIdentifierFromModuleName = makeIdentifierFromModuleName;
    function isBlockOrCatchScoped(declaration) {
        return (getCombinedNodeFlags(declaration) & 3072 /* BlockScoped */) !== 0 ||
            isCatchClauseVariableDeclaration(declaration);
    }
    ts.isBlockOrCatchScoped = isBlockOrCatchScoped;
    function isAmbientModule(node) {
        return node && node.kind === 371 /* ModuleDeclaration */ &&
            (node.name.kind === 155 /* StringLiteral */ || isGlobalScopeAugmentation(node));
    }
    ts.isAmbientModule = isAmbientModule;
    function isShorthandAmbientModule(node) {
        // The only kind of module that can be missing a body is a shorthand ambient module.
        return node.kind === 371 /* ModuleDeclaration */ && (!node.body);
    }
    ts.isShorthandAmbientModule = isShorthandAmbientModule;
    function isBlockScopedContainerTopLevel(node) {
        return node.kind === 402 /* SourceFile */ ||
            node.kind === 371 /* ModuleDeclaration */ ||
            isFunctionLike(node) ||
            isFunctionBlock(node);
    }
    ts.isBlockScopedContainerTopLevel = isBlockScopedContainerTopLevel;
    function isGlobalScopeAugmentation(module) {
        return !!(module.flags & 131072 /* GlobalAugmentation */);
    }
    ts.isGlobalScopeAugmentation = isGlobalScopeAugmentation;
    function isExternalModuleAugmentation(node) {
        // external module augmentation is a ambient module declaration that is either:
        // - defined in the top level scope and source file is an external module
        // - defined inside ambient module declaration located in the top level scope and source file not an external module
        if (!node || !isAmbientModule(node)) {
            return false;
        }
        switch (node.parent.kind) {
            case 402 /* SourceFile */:
                return ts.isExternalModule(node.parent);
            case 372 /* ModuleBlock */:
                return isAmbientModule(node.parent.parent) && !ts.isExternalModule(node.parent.parent.parent);
        }
        return false;
    }
    ts.isExternalModuleAugmentation = isExternalModuleAugmentation;
    // Gets the nearest enclosing block scope container that has the provided node
    // as a descendant, that is not the provided node.
    function getEnclosingBlockScopeContainer(node) {
        var current = node.parent;
        while (current) {
            if (isFunctionLike(current)) {
                return current;
            }
            switch (current.kind) {
                case 402 /* SourceFile */:
                case 373 /* CaseBlock */:
                case 398 /* CatchClause */:
                case 371 /* ModuleDeclaration */:
                case 352 /* ForStatement */:
                case 353 /* ForInStatement */:
                case 354 /* ForOfStatement */:
                    return current;
                case 345 /* Block */:
                    // function block is not considered block-scope container
                    // see comment in binder.ts: bind(...), case for SyntaxKind.Block
                    if (!isFunctionLike(current.parent)) {
                        return current;
                    }
            }
            current = current.parent;
        }
    }
    ts.getEnclosingBlockScopeContainer = getEnclosingBlockScopeContainer;
    function isCatchClauseVariableDeclaration(declaration) {
        return declaration &&
            declaration.kind === 364 /* VariableDeclaration */ &&
            declaration.parent &&
            declaration.parent.kind === 398 /* CatchClause */;
    }
    ts.isCatchClauseVariableDeclaration = isCatchClauseVariableDeclaration;
    // Return display name of an identifier
    // Computed property names will just be emitted as "[<expr>]", where <expr> is the source
    // text of the expression in the computed property.
    function declarationNameToString(name) {
        return getFullWidth(name) === 0 ? "(Missing)" : getTextOfNode(name);
    }
    ts.declarationNameToString = declarationNameToString;
    function createDiagnosticForNode(node, message, arg0, arg1, arg2) {
        var sourceFile = getSourceFileOfNode(node);
        var span = getErrorSpanForNode(sourceFile, node);
        return ts.createFileDiagnostic(sourceFile, span.start, span.length, message, arg0, arg1, arg2);
    }
    ts.createDiagnosticForNode = createDiagnosticForNode;
    function createDiagnosticForNodeFromMessageChain(node, messageChain) {
        var sourceFile = getSourceFileOfNode(node);
        var span = getErrorSpanForNode(sourceFile, node);
        return {
            file: sourceFile,
            start: span.start,
            length: span.length,
            code: messageChain.code,
            category: messageChain.category,
            messageText: messageChain.next ? messageChain : messageChain.messageText
        };
    }
    ts.createDiagnosticForNodeFromMessageChain = createDiagnosticForNodeFromMessageChain;
    function getSpanOfTokenAtPosition(sourceFile, pos) {
        var scanner = ts.createScanner(sourceFile.languageVersion, /*skipTrivia*/ true, sourceFile.languageVariant, sourceFile.text, /*onError:*/ undefined, pos);
        scanner.scan();
        var start = scanner.getTokenPos();
        return ts.createTextSpanFromBounds(start, scanner.getTextPos());
    }
    ts.getSpanOfTokenAtPosition = getSpanOfTokenAtPosition;
    function getErrorSpanForArrowFunction(sourceFile, node) {
        var pos = ts.skipTrivia(sourceFile.text, node.pos);
        if (node.body && node.body.kind === 345 /* Block */) {
            var startLine = ts.getLineAndCharacterOfPosition(sourceFile, node.body.pos).line;
            var endLine = ts.getLineAndCharacterOfPosition(sourceFile, node.body.end).line;
            if (startLine < endLine) {
                // The arrow function spans multiple lines,
                // make the error span be the first line, inclusive.
                return ts.createTextSpan(pos, getEndLinePosition(startLine, sourceFile) - pos + 1);
            }
        }
        return ts.createTextSpanFromBounds(pos, node.end);
    }
    function getErrorSpanForNode(sourceFile, node) {
        var errorNode = node;
        switch (node.kind) {
            case 402 /* SourceFile */:
                var pos_1 = ts.skipTrivia(sourceFile.text, 0, /*stopAfterLineBreak*/ false);
                if (pos_1 === sourceFile.text.length) {
                    // file is empty - return span for the beginning of the file
                    return ts.createTextSpan(0, 0);
                }
                return getSpanOfTokenAtPosition(sourceFile, pos_1);
            // This list is a work in progress. Add missing node kinds to improve their error
            // spans.
            case 364 /* VariableDeclaration */:
            case 315 /* BindingElement */:
            case 367 /* ClassDeclaration */:
            case 338 /* ClassExpression */:
            case 368 /* InterfaceDeclaration */:
            case 371 /* ModuleDeclaration */:
            case 370 /* EnumDeclaration */:
            case 401 /* EnumMember */:
            case 366 /* FunctionDeclaration */:
            case 325 /* FunctionExpression */:
            case 293 /* MethodDeclaration */:
            case 295 /* GetAccessor */:
            case 296 /* SetAccessor */:
            case 369 /* TypeAliasDeclaration */:
                errorNode = node.name;
                break;
            case 326 /* ArrowFunction */:
                return getErrorSpanForArrowFunction(sourceFile, node);
        }
        if (errorNode === undefined) {
            // If we don't have a better node, then just set the error on the first token of
            // construct.
            return getSpanOfTokenAtPosition(sourceFile, node.pos);
        }
        var pos = nodeIsMissing(errorNode)
            ? errorNode.pos
            : ts.skipTrivia(sourceFile.text, errorNode.pos);
        return ts.createTextSpanFromBounds(pos, errorNode.end);
    }
    ts.getErrorSpanForNode = getErrorSpanForNode;
    function isExternalOrCommonJsModule(file) {
        return (file.externalModuleIndicator || file.commonJsModuleIndicator) !== undefined;
    }
    ts.isExternalOrCommonJsModule = isExternalOrCommonJsModule;
    function isDeclarationFile(file) {
        return file.isDeclarationFile;
    }
    ts.isDeclarationFile = isDeclarationFile;
    function isConstEnumDeclaration(node) {
        return node.kind === 370 /* EnumDeclaration */ && isConst(node);
    }
    ts.isConstEnumDeclaration = isConstEnumDeclaration;
    function walkUpBindingElementsAndPatterns(node) {
        while (node && (node.kind === 315 /* BindingElement */ || isBindingPattern(node))) {
            node = node.parent;
        }
        return node;
    }
    // Returns the node flags for this node and all relevant parent nodes.  This is done so that
    // nodes like variable declarations and binding elements can returned a view of their flags
    // that includes the modifiers from their container.  i.e. flags like export/declare aren't
    // stored on the variable declaration directly, but on the containing variable statement
    // (if it has one).  Similarly, flags for let/const are store on the variable declaration
    // list.  By calling this function, all those flags are combined so that the client can treat
    // the node as if it actually had those flags.
    function getCombinedNodeFlags(node) {
        node = walkUpBindingElementsAndPatterns(node);
        var flags = node.flags;
        if (node.kind === 364 /* VariableDeclaration */) {
            node = node.parent;
        }
        if (node && node.kind === 365 /* VariableDeclarationList */) {
            flags |= node.flags;
            node = node.parent;
        }
        if (node && node.kind === 346 /* VariableStatement */) {
            flags |= node.flags;
        }
        return flags;
    }
    ts.getCombinedNodeFlags = getCombinedNodeFlags;
    function isConst(node) {
        return !!(getCombinedNodeFlags(node) & 2048 /* Const */);
    }
    ts.isConst = isConst;
    function isLet(node) {
        return !!(getCombinedNodeFlags(node) & 1024 /* Let */);
    }
    ts.isLet = isLet;
    function isSuperCallExpression(n) {
        return n.kind === 320 /* CallExpression */ && n.expression.kind === 30 /* super */;
    }
    ts.isSuperCallExpression = isSuperCallExpression;
    function isPrologueDirective(node) {
        return node.kind === 348 /* ExpressionStatement */ && node.expression.kind === 155 /* StringLiteral */;
    }
    ts.isPrologueDirective = isPrologueDirective;
    function getLeadingCommentRangesOfNode(node, sourceFileOfNode) {
        return ts.getLeadingCommentRanges(sourceFileOfNode.text, node.pos);
    }
    ts.getLeadingCommentRangesOfNode = getLeadingCommentRangesOfNode;
    function getLeadingCommentRangesOfNodeFromText(node, text) {
        return ts.getLeadingCommentRanges(text, node.pos);
    }
    ts.getLeadingCommentRangesOfNodeFromText = getLeadingCommentRangesOfNodeFromText;
    function getJsDocComments(node, sourceFileOfNode) {
        return getJsDocCommentsFromText(node, sourceFileOfNode.text);
    }
    ts.getJsDocComments = getJsDocComments;
    function getJsDocCommentsFromText(node, text) {
        var commentRanges = (node.kind === 288 /* Parameter */ ||
            node.kind === 287 /* TypeParameter */ ||
            node.kind === 325 /* FunctionExpression */ ||
            node.kind === 326 /* ArrowFunction */) ?
            ts.concatenate(ts.getTrailingCommentRanges(text, node.pos), ts.getLeadingCommentRanges(text, node.pos)) :
            getLeadingCommentRangesOfNodeFromText(node, text);
        return ts.filter(commentRanges, isJsDocComment);
        function isJsDocComment(comment) {
            // True if the comment starts with '/**' but not if it is '/**/'
            return text.charCodeAt(comment.pos + 1) === ts.CharCode.asterisk &&
                text.charCodeAt(comment.pos + 2) === ts.CharCode.asterisk &&
                text.charCodeAt(comment.pos + 3) !== ts.CharCode.slash;
        }
    }
    ts.getJsDocCommentsFromText = getJsDocCommentsFromText;
    ts.fullTripleSlashReferencePathRegEx = /^(\/\/\/\s*<reference\s+path\s*=\s*)('|")(.+?)\2.*?\/>/;
    ts.fullTripleSlashReferenceTypeReferenceDirectiveRegEx = /^(\/\/\/\s*<reference\s+types\s*=\s*)('|")(.+?)\2.*?\/>/;
    ts.fullTripleSlashAMDReferencePathRegEx = /^(\/\/\/\s*<amd-dependency\s+path\s*=\s*)('|")(.+?)\2.*?\/>/;
    function isTypeNode(node) {
        if (300 /* FirstTypeNode */ <= node.kind && node.kind <= 312 /* LastTypeNode */) {
            return true;
        }
        switch (node.kind) {
            case 141 /* any */:
            case 143 /* number */:
            case 144 /* string */:
            case 142 /* boolean */:
            case 145 /* symbol */:
            case 137 /* undefined */:
            case 146 /* never */:
                return true;
            case 36 /* void */:
                return node.parent.kind !== 329 /* VoidExpression */;
            case 340 /* ExpressionWithTypeArguments */:
                return !isExpressionWithTypeArgumentsInClassExtendsClause(node);
            // Identifiers and qualified names may be type nodes, depending on their context. Climb
            // above them to find the lowest container
            case 215 /* Identifier */:
                // If the identifier is the RHS of a qualified name, then it's a type iff its parent is.
                if (node.parent.kind === 285 /* QualifiedName */ && node.parent.right === node) {
                    node = node.parent;
                }
                else if (node.parent.kind === 318 /* PropertyAccessExpression */ && node.parent.name === node) {
                    node = node.parent;
                }
                // At this point, node is either a qualified name or an identifier
                ts.Debug.assert(node.kind === 215 /* Identifier */ || node.kind === 285 /* QualifiedName */ || node.kind === 318 /* PropertyAccessExpression */, "'node' was expected to be a qualified name, identifier or property access in 'isTypeNode'.");
            case 285 /* QualifiedName */:
            case 318 /* PropertyAccessExpression */:
            case 29 /* this */:
                var parent_1 = node.parent;
                if (parent_1.kind === 304 /* TypeQuery */) {
                    return false;
                }
                // Do not recursively call isTypeNode on the parent. In the example:
                //
                //     let a: A.B.C;
                //
                // Calling isTypeNode would consider the qualified name A.B a type node. Only C or
                // A.B.C is a type node.
                if (300 /* FirstTypeNode */ <= parent_1.kind && parent_1.kind <= 312 /* LastTypeNode */) {
                    return true;
                }
                switch (parent_1.kind) {
                    case 340 /* ExpressionWithTypeArguments */:
                        return !isExpressionWithTypeArgumentsInClassExtendsClause(parent_1);
                    case 287 /* TypeParameter */:
                        return node === parent_1.constraint;
                    case 291 /* PropertyDeclaration */:
                    case 290 /* PropertySignature */:
                    case 288 /* Parameter */:
                    case 364 /* VariableDeclaration */:
                        return node === parent_1.type;
                    case 366 /* FunctionDeclaration */:
                    case 325 /* FunctionExpression */:
                    case 326 /* ArrowFunction */:
                    case 294 /* Constructor */:
                    case 293 /* MethodDeclaration */:
                    case 292 /* MethodSignature */:
                    case 295 /* GetAccessor */:
                    case 296 /* SetAccessor */:
                        return node === parent_1.type;
                    case 297 /* CallSignature */:
                    case 298 /* ConstructSignature */:
                    case 299 /* IndexSignature */:
                        return node === parent_1.type;
                    case 323 /* TypeAssertionExpression */:
                        return node === parent_1.type;
                    case 320 /* CallExpression */:
                    case 321 /* NewExpression */:
                        return parent_1.typeArguments && ts.indexOf(parent_1.typeArguments, node) >= 0;
                    case 322 /* TaggedTemplateExpression */:
                        // TODO (drosen): TaggedTemplateExpressions may eventually support type arguments.
                        return false;
                }
        }
        return false;
    }
    ts.isTypeNode = isTypeNode;
    // Warning: This has the same semantics as the forEach family of functions,
    //          in that traversal terminates in the event that 'visitor' supplies a truthy value.
    function forEachReturnStatement(body, visitor) {
        return traverse(body);
        function traverse(node) {
            switch (node.kind) {
                case 357 /* ReturnStatement */:
                    return visitor(node);
                case 373 /* CaseBlock */:
                case 345 /* Block */:
                case 349 /* IfStatement */:
                case 350 /* DoStatement */:
                case 351 /* WhileStatement */:
                case 352 /* ForStatement */:
                case 353 /* ForInStatement */:
                case 354 /* ForOfStatement */:
                case 358 /* WithStatement */:
                case 359 /* SwitchStatement */:
                case 395 /* CaseClause */:
                case 396 /* DefaultClause */:
                case 360 /* LabeledStatement */:
                case 362 /* TryStatement */:
                case 398 /* CatchClause */:
                    return ts.forEachChild(node, traverse);
            }
        }
    }
    ts.forEachReturnStatement = forEachReturnStatement;
    function forEachYieldExpression(body, visitor) {
        return traverse(body);
        function traverse(node) {
            switch (node.kind) {
                case 336 /* YieldExpression */:
                    visitor(node);
                    var operand = node.expression;
                    if (operand) {
                        traverse(operand);
                    }
                case 370 /* EnumDeclaration */:
                case 368 /* InterfaceDeclaration */:
                case 371 /* ModuleDeclaration */:
                case 369 /* TypeAliasDeclaration */:
                case 367 /* ClassDeclaration */:
                case 338 /* ClassExpression */:
                    // These are not allowed inside a generator now, but eventually they may be allowed
                    // as local types. Regardless, any yield statements contained within them should be
                    // skipped in this traversal.
                    return;
                default:
                    if (isFunctionLike(node)) {
                        var name_1 = node.name;
                        if (name_1 && name_1.kind === 286 /* ComputedPropertyName */) {
                            // Note that we will not include methods/accessors of a class because they would require
                            // first descending into the class. This is by design.
                            traverse(name_1.expression);
                            return;
                        }
                    }
                    else if (!isTypeNode(node)) {
                        // This is the general case, which should include mostly expressions and statements.
                        // Also includes NodeArrays.
                        ts.forEachChild(node, traverse);
                    }
            }
        }
    }
    ts.forEachYieldExpression = forEachYieldExpression;
    function isVariableLike(node) {
        if (node) {
            switch (node.kind) {
                case 315 /* BindingElement */:
                case 401 /* EnumMember */:
                case 288 /* Parameter */:
                case 399 /* PropertyAssignment */:
                case 291 /* PropertyDeclaration */:
                case 290 /* PropertySignature */:
                case 400 /* ShorthandPropertyAssignment */:
                case 364 /* VariableDeclaration */:
                    return true;
            }
        }
        return false;
    }
    ts.isVariableLike = isVariableLike;
    function isAccessor(node) {
        return node && (node.kind === 295 /* GetAccessor */ || node.kind === 296 /* SetAccessor */);
    }
    ts.isAccessor = isAccessor;
    function isClassLike(node) {
        return node && (node.kind === 367 /* ClassDeclaration */ || node.kind === 338 /* ClassExpression */);
    }
    ts.isClassLike = isClassLike;
    function isFunctionLike(node) {
        return node && isFunctionLikeKind(node.kind);
    }
    ts.isFunctionLike = isFunctionLike;
    function isFunctionLikeKind(kind) {
        switch (kind) {
            case 294 /* Constructor */:
            case 325 /* FunctionExpression */:
            case 366 /* FunctionDeclaration */:
            case 326 /* ArrowFunction */:
            case 293 /* MethodDeclaration */:
            case 292 /* MethodSignature */:
            case 295 /* GetAccessor */:
            case 296 /* SetAccessor */:
            case 297 /* CallSignature */:
            case 298 /* ConstructSignature */:
            case 299 /* IndexSignature */:
            case 302 /* FunctionType */:
            case 303 /* ConstructorType */:
                return true;
        }
        return false;
    }
    ts.isFunctionLikeKind = isFunctionLikeKind;
    function introducesArgumentsExoticObject(node) {
        switch (node.kind) {
            case 293 /* MethodDeclaration */:
            case 292 /* MethodSignature */:
            case 294 /* Constructor */:
            case 295 /* GetAccessor */:
            case 296 /* SetAccessor */:
            case 366 /* FunctionDeclaration */:
            case 325 /* FunctionExpression */:
                return true;
        }
        return false;
    }
    ts.introducesArgumentsExoticObject = introducesArgumentsExoticObject;
    function isIterationStatement(node, lookInLabeledStatements) {
        switch (node.kind) {
            case 352 /* ForStatement */:
            case 353 /* ForInStatement */:
            case 354 /* ForOfStatement */:
            case 350 /* DoStatement */:
            case 351 /* WhileStatement */:
                return true;
            case 360 /* LabeledStatement */:
                return lookInLabeledStatements && isIterationStatement(node.statement, lookInLabeledStatements);
        }
        return false;
    }
    ts.isIterationStatement = isIterationStatement;
    function isFunctionBlock(node) {
        return node && node.kind === 345 /* Block */ && isFunctionLike(node.parent);
    }
    ts.isFunctionBlock = isFunctionBlock;
    function isObjectLiteralMethod(node) {
        return node && node.kind === 293 /* MethodDeclaration */ && node.parent.kind === 317 /* ObjectLiteralExpression */;
    }
    ts.isObjectLiteralMethod = isObjectLiteralMethod;
    function isIdentifierTypePredicate(predicate) {
        return predicate && predicate.kind === 1 /* Identifier */;
    }
    ts.isIdentifierTypePredicate = isIdentifierTypePredicate;
    function isThisTypePredicate(predicate) {
        return predicate && predicate.kind === 0 /* This */;
    }
    ts.isThisTypePredicate = isThisTypePredicate;
    function getContainingFunction(node) {
        while (true) {
            node = node.parent;
            if (!node || isFunctionLike(node)) {
                return node;
            }
        }
    }
    ts.getContainingFunction = getContainingFunction;
    function getContainingClass(node) {
        while (true) {
            node = node.parent;
            if (!node || isClassLike(node)) {
                return node;
            }
        }
    }
    ts.getContainingClass = getContainingClass;
    function getThisContainer(node, includeArrowFunctions) {
        while (true) {
            node = node.parent;
            if (!node) {
                return undefined;
            }
            switch (node.kind) {
                case 286 /* ComputedPropertyName */:
                    // If the grandparent node is an object literal (as opposed to a class),
                    // then the computed property is not a 'this' container.
                    // A computed property name in a class needs to be a this container
                    // so that we can error on it.
                    if (isClassLike(node.parent.parent)) {
                        return node;
                    }
                    // If this is a computed property, then the parent should not
                    // make it a this container. The parent might be a property
                    // in an object literal, like a method or accessor. But in order for
                    // such a parent to be a this container, the reference must be in
                    // the *body* of the container.
                    node = node.parent;
                    break;
                case 289 /* Decorator */:
                    // Decorators are always applied outside of the body of a class or method.
                    if (node.parent.kind === 288 /* Parameter */ && isClassElement(node.parent.parent)) {
                        // If the decorator's parent is a Parameter, we resolve the this container from
                        // the grandparent class declaration.
                        node = node.parent.parent;
                    }
                    else if (isClassElement(node.parent)) {
                        // If the decorator's parent is a class element, we resolve the 'this' container
                        // from the parent class declaration.
                        node = node.parent;
                    }
                    break;
                case 326 /* ArrowFunction */:
                    if (!includeArrowFunctions) {
                        continue;
                    }
                // Fall through
                case 366 /* FunctionDeclaration */:
                case 325 /* FunctionExpression */:
                case 371 /* ModuleDeclaration */:
                case 291 /* PropertyDeclaration */:
                case 290 /* PropertySignature */:
                case 293 /* MethodDeclaration */:
                case 292 /* MethodSignature */:
                case 294 /* Constructor */:
                case 295 /* GetAccessor */:
                case 296 /* SetAccessor */:
                case 297 /* CallSignature */:
                case 298 /* ConstructSignature */:
                case 299 /* IndexSignature */:
                case 370 /* EnumDeclaration */:
                case 402 /* SourceFile */:
                    return node;
            }
        }
    }
    ts.getThisContainer = getThisContainer;
    /**
      * Given an super call\property node returns a closest node where either
      * - super call\property is legal in the node and not legal in the parent node the node.
      *   i.e. super call is legal in constructor but not legal in the class body.
      * - node is arrow function (so caller might need to call getSuperContainer in case it needs to climb higher)
      * - super call\property is definitely illegal in the node (but might be legal in some subnode)
      *   i.e. super property access is illegal in function declaration but can be legal in the statement list
      */
    function getSuperContainer(node, stopOnFunctions) {
        while (true) {
            node = node.parent;
            if (!node) {
                return node;
            }
            switch (node.kind) {
                case 286 /* ComputedPropertyName */:
                    node = node.parent;
                    break;
                case 366 /* FunctionDeclaration */:
                case 325 /* FunctionExpression */:
                case 326 /* ArrowFunction */:
                    if (!stopOnFunctions) {
                        continue;
                    }
                case 291 /* PropertyDeclaration */:
                case 290 /* PropertySignature */:
                case 293 /* MethodDeclaration */:
                case 292 /* MethodSignature */:
                case 294 /* Constructor */:
                case 295 /* GetAccessor */:
                case 296 /* SetAccessor */:
                    return node;
                case 289 /* Decorator */:
                    // Decorators are always applied outside of the body of a class or method.
                    if (node.parent.kind === 288 /* Parameter */ && isClassElement(node.parent.parent)) {
                        // If the decorator's parent is a Parameter, we resolve the this container from
                        // the grandparent class declaration.
                        node = node.parent.parent;
                    }
                    else if (isClassElement(node.parent)) {
                        // If the decorator's parent is a class element, we resolve the 'this' container
                        // from the parent class declaration.
                        node = node.parent;
                    }
                    break;
            }
        }
    }
    ts.getSuperContainer = getSuperContainer;
    function getImmediatelyInvokedFunctionExpression(func) {
        if (func.kind === 325 /* FunctionExpression */ || func.kind === 326 /* ArrowFunction */) {
            var prev = func;
            var parent_2 = func.parent;
            while (parent_2.kind === 324 /* ParenthesizedExpression */) {
                prev = parent_2;
                parent_2 = parent_2.parent;
            }
            if (parent_2.kind === 320 /* CallExpression */ && parent_2.expression === prev) {
                return parent_2;
            }
        }
    }
    ts.getImmediatelyInvokedFunctionExpression = getImmediatelyInvokedFunctionExpression;
    /**
     * Determines whether a node is a property or element access expression for super.
     */
    function isSuperPropertyOrElementAccess(node) {
        return (node.kind === 318 /* PropertyAccessExpression */
            || node.kind === 319 /* ElementAccessExpression */)
            && node.expression.kind === 30 /* super */;
    }
    ts.isSuperPropertyOrElementAccess = isSuperPropertyOrElementAccess;
    function getEntityNameFromTypeNode(node) {
        if (node) {
            switch (node.kind) {
                case 301 /* TypeReference */:
                    return node.typeName;
                case 340 /* ExpressionWithTypeArguments */:
                    return node.expression;
                case 215 /* Identifier */:
                case 285 /* QualifiedName */:
                    return node;
            }
        }
        return undefined;
    }
    ts.getEntityNameFromTypeNode = getEntityNameFromTypeNode;
    function getInvokedExpression(node) {
        if (node.kind === 322 /* TaggedTemplateExpression */) {
            return node.tag;
        }
        // Will either be a CallExpression, NewExpression, or Decorator.
        return node.expression;
    }
    ts.getInvokedExpression = getInvokedExpression;
    function nodeCanBeDecorated(node) {
        switch (node.kind) {
            case 367 /* ClassDeclaration */:
                // classes are valid targets
                return true;
            case 291 /* PropertyDeclaration */:
                // property declarations are valid if their parent is a class declaration.
                return node.parent.kind === 367 /* ClassDeclaration */;
            case 295 /* GetAccessor */:
            case 296 /* SetAccessor */:
            case 293 /* MethodDeclaration */:
                // if this method has a body and its parent is a class declaration, this is a valid target.
                return node.body !== undefined
                    && node.parent.kind === 367 /* ClassDeclaration */;
            case 288 /* Parameter */:
                // if the parameter's parent has a body and its grandparent is a class declaration, this is a valid target;
                return node.parent.body !== undefined
                    && (node.parent.kind === 294 /* Constructor */
                        || node.parent.kind === 293 /* MethodDeclaration */
                        || node.parent.kind === 296 /* SetAccessor */)
                    && node.parent.parent.kind === 367 /* ClassDeclaration */;
        }
        return false;
    }
    ts.nodeCanBeDecorated = nodeCanBeDecorated;
    function nodeIsDecorated(node) {
        return node.decorators !== undefined
            && nodeCanBeDecorated(node);
    }
    ts.nodeIsDecorated = nodeIsDecorated;
    function isPropertyAccessExpression(node) {
        return node.kind === 318 /* PropertyAccessExpression */;
    }
    ts.isPropertyAccessExpression = isPropertyAccessExpression;
    function isElementAccessExpression(node) {
        return node.kind === 319 /* ElementAccessExpression */;
    }
    ts.isElementAccessExpression = isElementAccessExpression;
    function isJSXTagName(node) {
        var parent = node.parent;
        if (parent.kind === 389 /* JsxOpeningElement */ ||
            parent.kind === 388 /* JsxSelfClosingElement */ ||
            parent.kind === 391 /* JsxClosingElement */) {
            return parent.tagName === node;
        }
        return false;
    }
    ts.isJSXTagName = isJSXTagName;
    function isExpression(node) {
        switch (node.kind) {
            case 29 /* this */:
            case 30 /* super */:
            case 26 /* null */:
            case 27 /* true */:
            case 28 /* false */:
            case 156 /* RegularExpressionLiteral */:
            case 316 /* ArrayLiteralExpression */:
            case 317 /* ObjectLiteralExpression */:
            case 318 /* PropertyAccessExpression */:
            case 319 /* ElementAccessExpression */:
            case 320 /* CallExpression */:
            case 321 /* NewExpression */:
            case 322 /* TaggedTemplateExpression */:
            case 341 /* AsExpression */:
            case 323 /* TypeAssertionExpression */:
            case 342 /* NonNullExpression */:
            case 324 /* ParenthesizedExpression */:
            case 325 /* FunctionExpression */:
            case 338 /* ClassExpression */:
            case 326 /* ArrowFunction */:
            case 329 /* VoidExpression */:
            case 327 /* DeleteExpression */:
            case 328 /* TypeOfExpression */:
            case 331 /* PrefixUnaryExpression */:
            case 332 /* PostfixUnaryExpression */:
            case 333 /* BinaryExpression */:
            case 334 /* ConditionalExpression */:
            case 337 /* SpreadElementExpression */:
            case 335 /* TemplateExpression */:
            case 157 /* NoSubstitutionTemplateLiteral */:
            case 339 /* OmittedExpression */:
            case 387 /* JsxElement */:
            case 388 /* JsxSelfClosingElement */:
            case 336 /* YieldExpression */:
            case 330 /* AwaitExpression */:
                return true;
            case 285 /* QualifiedName */:
                while (node.parent.kind === 285 /* QualifiedName */) {
                    node = node.parent;
                }
                return node.parent.kind === 304 /* TypeQuery */ || isJSXTagName(node);
            case 215 /* Identifier */:
                if (node.parent.kind === 304 /* TypeQuery */ || isJSXTagName(node)) {
                    return true;
                }
            // fall through
            case 154 /* NumericLiteral */:
            case 155 /* StringLiteral */:
            case 29 /* this */:
                var parent_3 = node.parent;
                switch (parent_3.kind) {
                    case 364 /* VariableDeclaration */:
                    case 288 /* Parameter */:
                    case 291 /* PropertyDeclaration */:
                    case 290 /* PropertySignature */:
                    case 401 /* EnumMember */:
                    case 399 /* PropertyAssignment */:
                    case 315 /* BindingElement */:
                        return parent_3.initializer === node;
                    case 348 /* ExpressionStatement */:
                    case 349 /* IfStatement */:
                    case 350 /* DoStatement */:
                    case 351 /* WhileStatement */:
                    case 357 /* ReturnStatement */:
                    case 358 /* WithStatement */:
                    case 359 /* SwitchStatement */:
                    case 395 /* CaseClause */:
                    case 361 /* ThrowStatement */:
                    case 359 /* SwitchStatement */:
                        return parent_3.expression === node;
                    case 352 /* ForStatement */:
                        var forStatement = parent_3;
                        return (forStatement.initializer === node && forStatement.initializer.kind !== 365 /* VariableDeclarationList */) ||
                            forStatement.condition === node ||
                            forStatement.incrementor === node;
                    case 353 /* ForInStatement */:
                    case 354 /* ForOfStatement */:
                        var forInStatement = parent_3;
                        return (forInStatement.initializer === node && forInStatement.initializer.kind !== 365 /* VariableDeclarationList */) ||
                            forInStatement.expression === node;
                    case 323 /* TypeAssertionExpression */:
                    case 341 /* AsExpression */:
                        return node === parent_3.expression;
                    case 343 /* TemplateSpan */:
                        return node === parent_3.expression;
                    case 286 /* ComputedPropertyName */:
                        return node === parent_3.expression;
                    case 289 /* Decorator */:
                    case 394 /* JsxExpression */:
                    case 393 /* JsxSpreadAttribute */:
                        return true;
                    case 340 /* ExpressionWithTypeArguments */:
                        return parent_3.expression === node && isExpressionWithTypeArgumentsInClassExtendsClause(parent_3);
                    default:
                        if (isExpression(parent_3)) {
                            return true;
                        }
                }
        }
        return false;
    }
    ts.isExpression = isExpression;
    function isExternalModuleNameRelative(moduleName) {
        // TypeScript 1.0 spec (April 2014): 11.2.1
        // An external module name is "relative" if the first term is "." or "..".
        return moduleName.substr(0, 2) === "./" || moduleName.substr(0, 3) === "../" || moduleName.substr(0, 2) === ".\\" || moduleName.substr(0, 3) === "..\\";
    }
    ts.isExternalModuleNameRelative = isExternalModuleNameRelative;
    function isInstantiatedModule(node, preserveConstEnums) {
        var moduleState = ts.getModuleInstanceState(node);
        return moduleState === 1 /* Instantiated */ ||
            (preserveConstEnums && moduleState === 2 /* ConstEnumOnly */);
    }
    ts.isInstantiatedModule = isInstantiatedModule;
    function isExternalModuleImportEqualsDeclaration(node) {
        return node.kind === 375 /* ImportEqualsDeclaration */ && node.moduleReference.kind === 386 /* ExternalModuleReference */;
    }
    ts.isExternalModuleImportEqualsDeclaration = isExternalModuleImportEqualsDeclaration;
    function getExternalModuleImportEqualsDeclarationExpression(node) {
        ts.Debug.assert(isExternalModuleImportEqualsDeclaration(node));
        return node.moduleReference.expression;
    }
    ts.getExternalModuleImportEqualsDeclarationExpression = getExternalModuleImportEqualsDeclarationExpression;
    function isInternalModuleImportEqualsDeclaration(node) {
        return node.kind === 375 /* ImportEqualsDeclaration */ && node.moduleReference.kind !== 386 /* ExternalModuleReference */;
    }
    ts.isInternalModuleImportEqualsDeclaration = isInternalModuleImportEqualsDeclaration;
    function isSourceFileJavaScript(file) {
        return isInJavaScriptFile(file);
    }
    ts.isSourceFileJavaScript = isSourceFileJavaScript;
    function isInJavaScriptFile(node) {
        return node && !!(node.flags & 134217728 /* JavaScriptFile */);
    }
    ts.isInJavaScriptFile = isInJavaScriptFile;
    /**
     * Returns true if the node is a CallExpression to the identifier 'require' with
     * exactly one argument.
     * This function does not test if the node is in a JavaScript file or not.
    */
    function isRequireCall(expression, checkArgumentIsStringLiteral) {
        // of the form 'require("name")'
        var isRequire = expression.kind === 320 /* CallExpression */ &&
            expression.expression.kind === 215 /* Identifier */ &&
            expression.expression.text === "require" &&
            expression.arguments.length === 1;
        return isRequire && (!checkArgumentIsStringLiteral || expression.arguments[0].kind === 155 /* StringLiteral */);
    }
    ts.isRequireCall = isRequireCall;
    function isSingleOrDoubleQuote(charCode) {
        return charCode === ts.CharCode.singleQuote || charCode === ts.CharCode.doubleQuote;
    }
    ts.isSingleOrDoubleQuote = isSingleOrDoubleQuote;
    /**
     * Returns true if the node is a variable declaration whose initializer is a function expression.
     * This function does not test if the node is in a JavaScript file or not.
     */
    function isDeclarationOfFunctionExpression(s) {
        if (s.valueDeclaration && s.valueDeclaration.kind === 364 /* VariableDeclaration */) {
            var declaration = s.valueDeclaration;
            return declaration.initializer && declaration.initializer.kind === 325 /* FunctionExpression */;
        }
        return false;
    }
    ts.isDeclarationOfFunctionExpression = isDeclarationOfFunctionExpression;
    /// Given a BinaryExpression, returns SpecialPropertyAssignmentKind for the various kinds of property
    /// assignments we treat as special in the binder
    function getSpecialPropertyAssignmentKind(expression) {
        if (!isInJavaScriptFile(expression)) {
            return 0 /* None */;
        }
        if (expression.kind !== 333 /* BinaryExpression */) {
            return 0 /* None */;
        }
        var expr = expression;
        if (expr.operatorToken.kind !== 77 /* equals */ || expr.left.kind !== 318 /* PropertyAccessExpression */) {
            return 0 /* None */;
        }
        var lhs = expr.left;
        if (lhs.expression.kind === 215 /* Identifier */) {
            var lhsId = lhs.expression;
            if (lhsId.text === "exports") {
                // exports.name = expr
                return 1 /* ExportsProperty */;
            }
            else if (lhsId.text === "module" && lhs.name.text === "exports") {
                // module.exports = expr
                return 2 /* ModuleExports */;
            }
        }
        else if (lhs.expression.kind === 29 /* this */) {
            return 4 /* ThisProperty */;
        }
        else if (lhs.expression.kind === 318 /* PropertyAccessExpression */) {
            // chained dot, e.g. x.y.z = expr; this var is the 'x.y' part
            var innerPropertyAccess = lhs.expression;
            if (innerPropertyAccess.expression.kind === 215 /* Identifier */) {
                // module.exports.name = expr
                var innerPropertyAccessIdentifier = innerPropertyAccess.expression;
                if (innerPropertyAccessIdentifier.text === "module" && innerPropertyAccess.name.text === "exports") {
                    return 1 /* ExportsProperty */;
                }
                if (innerPropertyAccess.name.text === "prototype") {
                    return 3 /* PrototypeProperty */;
                }
            }
        }
        return 0 /* None */;
    }
    ts.getSpecialPropertyAssignmentKind = getSpecialPropertyAssignmentKind;
    function getExternalModuleName(node) {
        if (node.kind === 376 /* ImportDeclaration */) {
            return node.moduleSpecifier;
        }
        if (node.kind === 375 /* ImportEqualsDeclaration */) {
            var reference = node.moduleReference;
            if (reference.kind === 386 /* ExternalModuleReference */) {
                return reference.expression;
            }
        }
        if (node.kind === 382 /* ExportDeclaration */) {
            return node.moduleSpecifier;
        }
        if (node.kind === 371 /* ModuleDeclaration */ && node.name.kind === 155 /* StringLiteral */) {
            return node.name;
        }
    }
    ts.getExternalModuleName = getExternalModuleName;
    function hasQuestionToken(node) {
        if (node) {
            switch (node.kind) {
                case 288 /* Parameter */:
                case 293 /* MethodDeclaration */:
                case 292 /* MethodSignature */:
                case 400 /* ShorthandPropertyAssignment */:
                case 399 /* PropertyAssignment */:
                case 291 /* PropertyDeclaration */:
                case 290 /* PropertySignature */:
                    return node.questionToken !== undefined;
            }
        }
        return false;
    }
    ts.hasQuestionToken = hasQuestionToken;
    function isJSDocConstructSignature(node) {
        return node.kind === 415 /* JSDocFunctionType */ &&
            node.parameters.length > 0 &&
            node.parameters[0].type.kind === 417 /* JSDocConstructorType */;
    }
    ts.isJSDocConstructSignature = isJSDocConstructSignature;
    function getJSDocTag(node, kind, checkParentVariableStatement) {
        if (!node) {
            return undefined;
        }
        var jsDocComments = getJSDocComments(node, checkParentVariableStatement);
        if (!jsDocComments) {
            return undefined;
        }
        for (var _i = 0, jsDocComments_1 = jsDocComments; _i < jsDocComments_1.length; _i++) {
            var jsDocComment = jsDocComments_1[_i];
            for (var _a = 0, _b = jsDocComment.tags; _a < _b.length; _a++) {
                var tag = _b[_a];
                if (tag.kind === kind) {
                    return tag;
                }
            }
        }
    }
    function getJSDocComments(node, checkParentVariableStatement) {
        if (node.jsDocComments) {
            return node.jsDocComments;
        }
        // Try to recognize this pattern when node is initializer of variable declaration and JSDoc comments are on containing variable statement.
        // /**
        //   * @param {number} name
        //   * @returns {number}
        //   */
        // var x = function(name) { return name.length; }
        if (checkParentVariableStatement) {
            var isInitializerOfVariableDeclarationInStatement = node.parent.kind === 364 /* VariableDeclaration */ &&
                node.parent.initializer === node &&
                node.parent.parent.parent.kind === 346 /* VariableStatement */;
            var variableStatementNode = isInitializerOfVariableDeclarationInStatement ? node.parent.parent.parent : undefined;
            if (variableStatementNode) {
                return variableStatementNode.jsDocComments;
            }
            // Also recognize when the node is the RHS of an assignment expression
            var parent_4 = node.parent;
            var isSourceOfAssignmentExpressionStatement = parent_4 && parent_4.parent &&
                parent_4.kind === 333 /* BinaryExpression */ &&
                parent_4.operatorToken.kind === 77 /* equals */ &&
                parent_4.parent.kind === 348 /* ExpressionStatement */;
            if (isSourceOfAssignmentExpressionStatement) {
                return parent_4.parent.jsDocComments;
            }
            var isPropertyAssignmentExpression = parent_4 && parent_4.kind === 399 /* PropertyAssignment */;
            if (isPropertyAssignmentExpression) {
                return parent_4.jsDocComments;
            }
        }
        return undefined;
    }
    function getJSDocTypeTag(node) {
        return getJSDocTag(node, 423 /* JSDocTypeTag */, /*checkParentVariableStatement*/ false);
    }
    ts.getJSDocTypeTag = getJSDocTypeTag;
    function getJSDocReturnTag(node) {
        return getJSDocTag(node, 422 /* JSDocReturnTag */, /*checkParentVariableStatement*/ true);
    }
    ts.getJSDocReturnTag = getJSDocReturnTag;
    function getJSDocTemplateTag(node) {
        return getJSDocTag(node, 424 /* JSDocTemplateTag */, /*checkParentVariableStatement*/ false);
    }
    ts.getJSDocTemplateTag = getJSDocTemplateTag;
    function getCorrespondingJSDocParameterTag(parameter) {
        if (parameter.name && parameter.name.kind === 215 /* Identifier */) {
            // If it's a parameter, see if the parent has a jsdoc comment with an @param
            // annotation.
            var parameterName = parameter.name.text;
            var jsDocComments = getJSDocComments(parameter.parent, /*checkParentVariableStatement*/ true);
            if (jsDocComments) {
                for (var _i = 0, jsDocComments_2 = jsDocComments; _i < jsDocComments_2.length; _i++) {
                    var jsDocComment = jsDocComments_2[_i];
                    for (var _a = 0, _b = jsDocComment.tags; _a < _b.length; _a++) {
                        var tag = _b[_a];
                        if (tag.kind === 421 /* JSDocParameterTag */) {
                            var parameterTag = tag;
                            var name_2 = parameterTag.preParameterName || parameterTag.postParameterName;
                            if (name_2.text === parameterName) {
                                return parameterTag;
                            }
                        }
                    }
                }
            }
        }
        return undefined;
    }
    ts.getCorrespondingJSDocParameterTag = getCorrespondingJSDocParameterTag;
    function hasRestParameter(s) {
        return isRestParameter(ts.lastOrUndefined(s.parameters));
    }
    ts.hasRestParameter = hasRestParameter;
    function hasDeclaredRestParameter(s) {
        return isDeclaredRestParam(ts.lastOrUndefined(s.parameters));
    }
    ts.hasDeclaredRestParameter = hasDeclaredRestParameter;
    function isRestParameter(node) {
        if (node && (node.flags & 134217728 /* JavaScriptFile */)) {
            if (node.type && node.type.kind === 416 /* JSDocVariadicType */) {
                return true;
            }
            var paramTag = getCorrespondingJSDocParameterTag(node);
            if (paramTag && paramTag.typeExpression) {
                return paramTag.typeExpression.type.kind === 416 /* JSDocVariadicType */;
            }
        }
        return isDeclaredRestParam(node);
    }
    ts.isRestParameter = isRestParameter;
    function isDeclaredRestParam(node) {
        return node && node.dotDotDotToken !== undefined;
    }
    ts.isDeclaredRestParam = isDeclaredRestParam;
    function isLiteralKind(kind) {
        return ts.TokenType.firstLiteral <= kind && kind <= ts.TokenType.lastLiteral;
    }
    ts.isLiteralKind = isLiteralKind;
    function isTextualLiteralKind(kind) {
        return kind === 155 /* StringLiteral */ || kind === 157 /* NoSubstitutionTemplateLiteral */;
    }
    ts.isTextualLiteralKind = isTextualLiteralKind;
    function isTemplateLiteralKind(kind) {
        return ts.TokenType.firstTemplate <= kind && kind <= ts.TokenType.lastTemplate;
    }
    ts.isTemplateLiteralKind = isTemplateLiteralKind;
    function isBindingPattern(node) {
        return !!node && (node.kind === 314 /* ArrayBindingPattern */ || node.kind === 313 /* ObjectBindingPattern */);
    }
    ts.isBindingPattern = isBindingPattern;
    // A node is an assignment target if it is on the left hand side of an '=' token, if it is parented by a property
    // assignment in an object literal that is an assignment target, or if it is parented by an array literal that is
    // an assignment target. Examples include 'a = xxx', '{ p: a } = xxx', '[{ p: a}] = xxx'.
    function isAssignmentTarget(node) {
        while (node.parent.kind === 324 /* ParenthesizedExpression */) {
            node = node.parent;
        }
        while (true) {
            var parent_5 = node.parent;
            if (parent_5.kind === 316 /* ArrayLiteralExpression */ || parent_5.kind === 337 /* SpreadElementExpression */) {
                node = parent_5;
                continue;
            }
            if (parent_5.kind === 399 /* PropertyAssignment */ || parent_5.kind === 400 /* ShorthandPropertyAssignment */) {
                node = parent_5.parent;
                continue;
            }
            return parent_5.kind === 333 /* BinaryExpression */ &&
                parent_5.operatorToken.kind === 77 /* equals */ &&
                parent_5.left === node ||
                (parent_5.kind === 353 /* ForInStatement */ || parent_5.kind === 354 /* ForOfStatement */) &&
                    parent_5.initializer === node;
        }
    }
    ts.isAssignmentTarget = isAssignmentTarget;
    function isNodeDescendentOf(node, ancestor) {
        while (node) {
            if (node === ancestor)
                return true;
            node = node.parent;
        }
        return false;
    }
    ts.isNodeDescendentOf = isNodeDescendentOf;
    function isInAmbientContext(node) {
        while (node) {
            if (node.flags & 2 /* Ambient */ || (node.kind === 402 /* SourceFile */ && node.isDeclarationFile)) {
                return true;
            }
            node = node.parent;
        }
        return false;
    }
    ts.isInAmbientContext = isInAmbientContext;
    function isDeclaration(node) {
        switch (node.kind) {
            case 326 /* ArrowFunction */:
            case 315 /* BindingElement */:
            case 367 /* ClassDeclaration */:
            case 338 /* ClassExpression */:
            case 294 /* Constructor */:
            case 370 /* EnumDeclaration */:
            case 401 /* EnumMember */:
            case 384 /* ExportSpecifier */:
            case 366 /* FunctionDeclaration */:
            case 325 /* FunctionExpression */:
            case 295 /* GetAccessor */:
            case 377 /* ImportClause */:
            case 375 /* ImportEqualsDeclaration */:
            case 380 /* ImportSpecifier */:
            case 368 /* InterfaceDeclaration */:
            case 293 /* MethodDeclaration */:
            case 292 /* MethodSignature */:
            case 371 /* ModuleDeclaration */:
            case 378 /* NamespaceImport */:
            case 288 /* Parameter */:
            case 399 /* PropertyAssignment */:
            case 291 /* PropertyDeclaration */:
            case 290 /* PropertySignature */:
            case 296 /* SetAccessor */:
            case 400 /* ShorthandPropertyAssignment */:
            case 369 /* TypeAliasDeclaration */:
            case 287 /* TypeParameter */:
            case 364 /* VariableDeclaration */:
            case 425 /* JSDocTypedefTag */:
                return true;
        }
        return false;
    }
    ts.isDeclaration = isDeclaration;
    function isStatement(n) {
        switch (n.kind) {
            case 356 /* BreakStatement */:
            case 355 /* ContinueStatement */:
            case 363 /* DebuggerStatement */:
            case 350 /* DoStatement */:
            case 348 /* ExpressionStatement */:
            case 347 /* EmptyStatement */:
            case 353 /* ForInStatement */:
            case 354 /* ForOfStatement */:
            case 352 /* ForStatement */:
            case 349 /* IfStatement */:
            case 360 /* LabeledStatement */:
            case 357 /* ReturnStatement */:
            case 359 /* SwitchStatement */:
            case 361 /* ThrowStatement */:
            case 362 /* TryStatement */:
            case 346 /* VariableStatement */:
            case 351 /* WhileStatement */:
            case 358 /* WithStatement */:
            case 381 /* ExportAssignment */:
                return true;
            default:
                return false;
        }
    }
    ts.isStatement = isStatement;
    function isClassElement(n) {
        switch (n.kind) {
            case 294 /* Constructor */:
            case 291 /* PropertyDeclaration */:
            case 293 /* MethodDeclaration */:
            case 295 /* GetAccessor */:
            case 296 /* SetAccessor */:
            case 292 /* MethodSignature */:
            case 299 /* IndexSignature */:
                return true;
            default:
                return false;
        }
    }
    ts.isClassElement = isClassElement;
    // True if the given identifier, string literal, or number literal is the name of a declaration node
    function isDeclarationName(name) {
        if (name.kind !== 215 /* Identifier */ && name.kind !== 155 /* StringLiteral */ && name.kind !== 154 /* NumericLiteral */) {
            return false;
        }
        var parent = name.parent;
        if (parent.kind === 380 /* ImportSpecifier */ || parent.kind === 384 /* ExportSpecifier */) {
            if (parent.propertyName) {
                return true;
            }
        }
        if (isDeclaration(parent)) {
            return parent.name === name;
        }
        return false;
    }
    ts.isDeclarationName = isDeclarationName;
    function isLiteralComputedPropertyDeclarationName(node) {
        return (node.kind === 155 /* StringLiteral */ || node.kind === 154 /* NumericLiteral */) &&
            node.parent.kind === 286 /* ComputedPropertyName */ &&
            isDeclaration(node.parent.parent);
    }
    ts.isLiteralComputedPropertyDeclarationName = isLiteralComputedPropertyDeclarationName;
    // Return true if the given identifier is classified as an IdentifierName
    function isIdentifierName(node) {
        var parent = node.parent;
        switch (parent.kind) {
            case 291 /* PropertyDeclaration */:
            case 290 /* PropertySignature */:
            case 293 /* MethodDeclaration */:
            case 292 /* MethodSignature */:
            case 295 /* GetAccessor */:
            case 296 /* SetAccessor */:
            case 401 /* EnumMember */:
            case 399 /* PropertyAssignment */:
            case 318 /* PropertyAccessExpression */:
                // Name in member declaration or property name in property access
                return parent.name === node;
            case 285 /* QualifiedName */:
                // Name on right hand side of dot in a type query
                if (parent.right === node) {
                    while (parent.kind === 285 /* QualifiedName */) {
                        parent = parent.parent;
                    }
                    return parent.kind === 304 /* TypeQuery */;
                }
                return false;
            case 315 /* BindingElement */:
            case 380 /* ImportSpecifier */:
                // Property name in binding element or import specifier
                return parent.propertyName === node;
            case 384 /* ExportSpecifier */:
                // Any name in an export specifier
                return true;
        }
        return false;
    }
    ts.isIdentifierName = isIdentifierName;
    // An alias symbol is created by one of the following declarations:
    // import <symbol> = ...
    // import <symbol> from ...
    // import * as <symbol> from ...
    // import { x as <symbol> } from ...
    // export { x as <symbol> } from ...
    // export = ...
    // export default ...
    function isAliasSymbolDeclaration(node) {
        return node.kind === 375 /* ImportEqualsDeclaration */ ||
            node.kind === 374 /* NamespaceExportDeclaration */ ||
            node.kind === 377 /* ImportClause */ && !!node.name ||
            node.kind === 378 /* NamespaceImport */ ||
            node.kind === 380 /* ImportSpecifier */ ||
            node.kind === 384 /* ExportSpecifier */ ||
            node.kind === 381 /* ExportAssignment */ && node.expression.kind === 215 /* Identifier */;
    }
    ts.isAliasSymbolDeclaration = isAliasSymbolDeclaration;
    function getClassExtendsHeritageClauseElement(node) {
        var heritageClause = getHeritageClause(node.heritageClauses, 131 /* extends */);
        return heritageClause && heritageClause.types.length > 0 ? heritageClause.types[0] : undefined;
    }
    ts.getClassExtendsHeritageClauseElement = getClassExtendsHeritageClauseElement;
    function getClassImplementsHeritageClauseElements(node) {
        var heritageClause = getHeritageClause(node.heritageClauses, 132 /* implements */);
        return heritageClause ? heritageClause.types : undefined;
    }
    ts.getClassImplementsHeritageClauseElements = getClassImplementsHeritageClauseElements;
    function getInterfaceBaseTypeNodes(node) {
        var heritageClause = getHeritageClause(node.heritageClauses, 131 /* extends */);
        return heritageClause ? heritageClause.types : undefined;
    }
    ts.getInterfaceBaseTypeNodes = getInterfaceBaseTypeNodes;
    function getHeritageClause(clauses, kind) {
        if (clauses) {
            for (var _i = 0, clauses_1 = clauses; _i < clauses_1.length; _i++) {
                var clause = clauses_1[_i];
                if (clause.token === kind) {
                    return clause;
                }
            }
        }
        return undefined;
    }
    ts.getHeritageClause = getHeritageClause;
    function tryResolveScriptReference(host, sourceFile, reference) {
        if (!host.getCompilerOptions().noResolve) {
            var referenceFileName = ts.isRootedDiskPath(reference.fileName) ? reference.fileName : ts.combinePaths(ts.getDirectoryPath(sourceFile.fileName), reference.fileName);
            return host.getSourceFile(referenceFileName);
        }
    }
    ts.tryResolveScriptReference = tryResolveScriptReference;
    function getAncestor(node, kind) {
        while (node) {
            if (node.kind === kind) {
                return node;
            }
            node = node.parent;
        }
        return undefined;
    }
    ts.getAncestor = getAncestor;
    function getFileReferenceFromReferencePath(comment, commentRange) {
        var simpleReferenceRegEx = /^\/\/\/\s*<reference\s+/gim;
        var isNoDefaultLibRegEx = /^(\/\/\/\s*<reference\s+no-default-lib\s*=\s*)('|")(.+?)\2\s*\/>/gim;
        if (simpleReferenceRegEx.test(comment)) {
            if (isNoDefaultLibRegEx.test(comment)) {
                return {
                    isNoDefaultLib: true
                };
            }
            else {
                var refMatchResult = ts.fullTripleSlashReferencePathRegEx.exec(comment);
                var refLibResult = !refMatchResult && ts.fullTripleSlashReferenceTypeReferenceDirectiveRegEx.exec(comment);
                if (refMatchResult || refLibResult) {
                    var start = commentRange.pos;
                    var end = commentRange.end;
                    return {
                        fileReference: {
                            pos: start,
                            end: end,
                            fileName: (refMatchResult || refLibResult)[3]
                        },
                        isNoDefaultLib: false,
                        isTypeReferenceDirective: !!refLibResult
                    };
                }
                return {
                    diagnosticMessage: ts.Diagnostics.Invalid_reference_directive_syntax,
                    isNoDefaultLib: false
                };
            }
        }
        return undefined;
    }
    ts.getFileReferenceFromReferencePath = getFileReferenceFromReferencePath;
    function isKeyword(token) {
        return ts.TokenType.first <= token && token <= ts.TokenType.last;
    }
    ts.isKeyword = isKeyword;
    function isTrivia(token) {
        return ts.TokenType.firstTrivia <= token && token <= ts.TokenType.lastTrivia;
    }
    ts.isTrivia = isTrivia;
    function isAsyncFunctionLike(node) {
        return isFunctionLike(node) && (node.flags & 256 /* Async */) !== 0 && !isAccessor(node);
    }
    ts.isAsyncFunctionLike = isAsyncFunctionLike;
    function isStringOrNumericLiteral(kind) {
        return kind === 155 /* StringLiteral */ || kind === 154 /* NumericLiteral */;
    }
    ts.isStringOrNumericLiteral = isStringOrNumericLiteral;
    /**
     * A declaration has a dynamic name if both of the following are true:
     *   1. The declaration has a computed property name
     *   2. The computed name is *not* expressed as Symbol.<name>, where name
     *      is a property of the Symbol constructor that denotes a built in
     *      Symbol.
     */
    function hasDynamicName(declaration) {
        return declaration.name && isDynamicName(declaration.name);
    }
    ts.hasDynamicName = hasDynamicName;
    function isDynamicName(name) {
        return name.kind === 286 /* ComputedPropertyName */ &&
            !isStringOrNumericLiteral(name.expression.kind) &&
            !isWellKnownSymbolSyntactically(name.expression);
    }
    ts.isDynamicName = isDynamicName;
    /**
     * Checks if the expression is of the form:
     *    Symbol.name
     * where Symbol is literally the word "Symbol", and name is any identifierName
     */
    function isWellKnownSymbolSyntactically(node) {
        return isPropertyAccessExpression(node) && isESSymbolIdentifier(node.expression);
    }
    ts.isWellKnownSymbolSyntactically = isWellKnownSymbolSyntactically;
    function getPropertyNameForPropertyNameNode(name) {
        if (name.kind === 215 /* Identifier */ || name.kind === 155 /* StringLiteral */ || name.kind === 154 /* NumericLiteral */ || name.kind === 288 /* Parameter */) {
            return name.text;
        }
        if (name.kind === 286 /* ComputedPropertyName */) {
            var nameExpression = name.expression;
            if (isWellKnownSymbolSyntactically(nameExpression)) {
                var rightHandSideName = nameExpression.name.text;
                return getPropertyNameForKnownSymbolName(rightHandSideName);
            }
            else if (nameExpression.kind === 155 /* StringLiteral */ || nameExpression.kind === 154 /* NumericLiteral */) {
                return nameExpression.text;
            }
        }
        return undefined;
    }
    ts.getPropertyNameForPropertyNameNode = getPropertyNameForPropertyNameNode;
    function getPropertyNameForKnownSymbolName(symbolName) {
        return "__@" + symbolName;
    }
    ts.getPropertyNameForKnownSymbolName = getPropertyNameForKnownSymbolName;
    /**
     * Includes the word "Symbol" with unicode escapes
     */
    function isESSymbolIdentifier(node) {
        return node.kind === 215 /* Identifier */ && node.text === "Symbol";
    }
    ts.isESSymbolIdentifier = isESSymbolIdentifier;
    function isParameterDeclaration(node) {
        var root = getRootDeclaration(node);
        return root.kind === 288 /* Parameter */;
    }
    ts.isParameterDeclaration = isParameterDeclaration;
    function getRootDeclaration(node) {
        while (node.kind === 315 /* BindingElement */) {
            node = node.parent.parent;
        }
        return node;
    }
    ts.getRootDeclaration = getRootDeclaration;
    function nodeStartsNewLexicalEnvironment(n) {
        return isFunctionLike(n) || n.kind === 371 /* ModuleDeclaration */ || n.kind === 402 /* SourceFile */;
    }
    ts.nodeStartsNewLexicalEnvironment = nodeStartsNewLexicalEnvironment;
    /**
     * Creates a shallow, memberwise clone of a node. The "kind", "pos", "end", "flags", and "parent"
     * properties are excluded by default, and can be provided via the "location", "flags", and
     * "parent" parameters.
     * @param node The node to clone.
     * @param location An optional TextRange to use to supply the new position.
     * @param flags The NodeFlags to use for the cloned node.
     * @param parent The parent for the new node.
     */
    function cloneNode(node, location, flags, parent) {
        // We don't use "clone" from core.ts here, as we need to preserve the prototype chain of
        // the original node. We also need to exclude specific properties and only include own-
        // properties (to skip members already defined on the shared prototype).
        var clone = location !== undefined
            ? ts.createNode(node.kind, location.pos, location.end)
            : createSynthesizedNode(node.kind);
        for (var key in node) {
            if (clone.hasOwnProperty(key) || !node.hasOwnProperty(key)) {
                continue;
            }
            clone[key] = node[key];
        }
        if (flags !== undefined) {
            clone.flags = flags;
        }
        if (parent !== undefined) {
            clone.parent = parent;
        }
        return clone;
    }
    ts.cloneNode = cloneNode;
    /**
     * Creates a deep clone of an EntityName, with new parent pointers.
     * @param node The EntityName to clone.
     * @param parent The parent for the cloned node.
     */
    function cloneEntityName(node, parent) {
        var clone = cloneNode(node, node, node.flags, parent);
        if (isQualifiedName(clone)) {
            var left = clone.left, right = clone.right;
            clone.left = cloneEntityName(left, clone);
            clone.right = cloneNode(right, right, right.flags, parent);
        }
        return clone;
    }
    ts.cloneEntityName = cloneEntityName;
    function isQualifiedName(node) {
        return node.kind === 285 /* QualifiedName */;
    }
    ts.isQualifiedName = isQualifiedName;
    function nodeIsSynthesized(node) {
        return node.pos === -1;
    }
    ts.nodeIsSynthesized = nodeIsSynthesized;
    function createSynthesizedNode(kind, startsOnNewLine) {
        var node = ts.createNode(kind, /* pos */ -1, /* end */ -1);
        node.startsOnNewLine = startsOnNewLine;
        return node;
    }
    ts.createSynthesizedNode = createSynthesizedNode;
    function createSynthesizedNodeArray() {
        var array = [];
        array.pos = -1;
        array.end = -1;
        return array;
    }
    ts.createSynthesizedNodeArray = createSynthesizedNodeArray;
    function createDiagnosticCollection() {
        var nonFileDiagnostics = [];
        var fileDiagnostics = {};
        var diagnosticsModified = false;
        var modificationCount = 0;
        return {
            add: add,
            getGlobalDiagnostics: getGlobalDiagnostics,
            getDiagnostics: getDiagnostics,
            getModificationCount: getModificationCount,
            reattachFileDiagnostics: reattachFileDiagnostics
        };
        function getModificationCount() {
            return modificationCount;
        }
        function reattachFileDiagnostics(newFile) {
            if (!ts.hasProperty(fileDiagnostics, newFile.fileName)) {
                return;
            }
            for (var _i = 0, _a = fileDiagnostics[newFile.fileName]; _i < _a.length; _i++) {
                var diagnostic = _a[_i];
                diagnostic.file = newFile;
            }
        }
        function add(diagnostic) {
            var diagnostics;
            if (diagnostic.file) {
                diagnostics = fileDiagnostics[diagnostic.file.fileName];
                if (!diagnostics) {
                    diagnostics = [];
                    fileDiagnostics[diagnostic.file.fileName] = diagnostics;
                }
            }
            else {
                diagnostics = nonFileDiagnostics;
            }
            diagnostics.push(diagnostic);
            diagnosticsModified = true;
            modificationCount++;
        }
        function getGlobalDiagnostics() {
            sortAndDeduplicate();
            return nonFileDiagnostics;
        }
        function getDiagnostics(fileName) {
            sortAndDeduplicate();
            if (fileName) {
                return fileDiagnostics[fileName] || [];
            }
            var allDiagnostics = [];
            function pushDiagnostic(d) {
                allDiagnostics.push(d);
            }
            ts.forEach(nonFileDiagnostics, pushDiagnostic);
            for (var key in fileDiagnostics) {
                if (ts.hasProperty(fileDiagnostics, key)) {
                    ts.forEach(fileDiagnostics[key], pushDiagnostic);
                }
            }
            return ts.sortAndDeduplicateDiagnostics(allDiagnostics);
        }
        function sortAndDeduplicate() {
            if (!diagnosticsModified) {
                return;
            }
            diagnosticsModified = false;
            nonFileDiagnostics = ts.sortAndDeduplicateDiagnostics(nonFileDiagnostics);
            for (var key in fileDiagnostics) {
                if (ts.hasProperty(fileDiagnostics, key)) {
                    fileDiagnostics[key] = ts.sortAndDeduplicateDiagnostics(fileDiagnostics[key]);
                }
            }
        }
    }
    ts.createDiagnosticCollection = createDiagnosticCollection;
    // This consists of the first 19 unprintable ASCII characters, canonical escapes, lineSeparator,
    // paragraphSeparator, and nextLine. The latter three are just desirable to suppress new lines in
    // the language service. These characters should be escaped when printing, and if any characters are added,
    // the map below must be updated. Note that this regexp *does not* include the 'delete' character.
    // There is no reason for this other than that JSON.stringify does not handle it either.
    var escapedCharsRegExp = /[\\\"\u0000-\u001f\t\v\f\b\r\n\u2028\u2029\u0085]/g;
    var escapedCharsMap = {
        "\0": "\\0",
        "\t": "\\t",
        "\v": "\\v",
        "\f": "\\f",
        "\b": "\\b",
        "\r": "\\r",
        "\n": "\\n",
        "\\": "\\\\",
        "\"": "\\\"",
        "\u2028": "\\u2028",
        "\u2029": "\\u2029",
        "\u0085": "\\u0085" // nextLine
    };
    /**
     * Based heavily on the abstract 'Quote'/'QuoteJSONString' operation from ECMA-262 (24.3.2.2),
     * but augmented for a few select characters (e.g. lineSeparator, paragraphSeparator, nextLine)
     * Note that this doesn't actually wrap the input in double quotes.
     */
    function escapeString(s) {
        s = escapedCharsRegExp.test(s) ? s.replace(escapedCharsRegExp, getReplacement) : s;
        return s;
        function getReplacement(c) {
            return escapedCharsMap[c] || get16BitUnicodeEscapeSequence(c.charCodeAt(0));
        }
    }
    ts.escapeString = escapeString;
    function isIntrinsicJsxName(name) {
        var ch = name.substr(0, 1);
        return ch.toLowerCase() === ch;
    }
    ts.isIntrinsicJsxName = isIntrinsicJsxName;
    function get16BitUnicodeEscapeSequence(charCode) {
        var hexCharCode = charCode.toString(16).toUpperCase();
        var paddedHexCode = ("0000" + hexCharCode).slice(-4);
        return "\\u" + paddedHexCode;
    }
    var nonAsciiCharacters = /[^\u0000-\u007F]/g;
    function escapeNonAsciiCharacters(s) {
        // Replace non-ASCII characters with '\uNNNN' escapes if any exist.
        // Otherwise just return the original string.
        return nonAsciiCharacters.test(s) ?
            s.replace(nonAsciiCharacters, function (c) { return get16BitUnicodeEscapeSequence(c.charCodeAt(0)); }) :
            s;
    }
    ts.escapeNonAsciiCharacters = escapeNonAsciiCharacters;
    var indentStrings = ["", "    "];
    function getIndentString(level) {
        if (indentStrings[level] === undefined) {
            indentStrings[level] = getIndentString(level - 1) + indentStrings[1];
        }
        return indentStrings[level];
    }
    ts.getIndentString = getIndentString;
    function getIndentSize() {
        return indentStrings[1].length;
    }
    ts.getIndentSize = getIndentSize;
    function createTextWriter(newLine) {
        var output;
        var indent;
        var lineStart;
        var lineCount;
        var linePos;
        function write(s) {
            if (s && s.length) {
                if (lineStart) {
                    output += getIndentString(indent);
                    lineStart = false;
                }
                output += s;
            }
        }
        function reset() {
            output = "";
            indent = 0;
            lineStart = true;
            lineCount = 0;
            linePos = 0;
        }
        function rawWrite(s) {
            if (s !== undefined) {
                if (lineStart) {
                    lineStart = false;
                }
                output += s;
            }
        }
        function writeLiteral(s) {
            if (s && s.length) {
                write(s);
                var lineStartsOfS = ts.computeLineStarts(s);
                if (lineStartsOfS.length > 1) {
                    lineCount = lineCount + lineStartsOfS.length - 1;
                    linePos = output.length - s.length + ts.lastOrUndefined(lineStartsOfS);
                }
            }
        }
        function writeLine() {
            if (!lineStart) {
                output += newLine;
                lineCount++;
                linePos = output.length;
                lineStart = true;
            }
        }
        function writeTextOfNode(text, node) {
            write(getTextOfNodeFromSourceText(text, node));
        }
        reset();
        return {
            write: write,
            rawWrite: rawWrite,
            writeTextOfNode: writeTextOfNode,
            writeLiteral: writeLiteral,
            writeLine: writeLine,
            increaseIndent: function () { indent++; },
            decreaseIndent: function () { indent--; },
            getIndent: function () { return indent; },
            getTextPos: function () { return output.length; },
            getLine: function () { return lineCount + 1; },
            getColumn: function () { return lineStart ? indent * getIndentSize() + 1 : output.length - linePos + 1; },
            getText: function () { return output; },
            reset: reset
        };
    }
    ts.createTextWriter = createTextWriter;
    /**
     * Resolves a local path to a path which is absolute to the base of the emit
     */
    function getExternalModuleNameFromPath(host, fileName) {
        var getCanonicalFileName = function (f) { return host.getCanonicalFileName(f); };
        var dir = ts.toPath(host.getCommonSourceDirectory(), host.getCurrentDirectory(), getCanonicalFileName);
        var filePath = ts.getNormalizedAbsolutePath(fileName, host.getCurrentDirectory());
        var relativePath = ts.getRelativePathToDirectoryOrUrl(dir, filePath, dir, getCanonicalFileName, /*isAbsolutePathAnUrl*/ false);
        return ts.removeFileExtension(relativePath);
    }
    ts.getExternalModuleNameFromPath = getExternalModuleNameFromPath;
    function getOwnEmitOutputFilePath(sourceFile, host, extension) {
        var compilerOptions = host.getCompilerOptions();
        var emitOutputFilePathWithoutExtension;
        if (compilerOptions.outDir) {
            emitOutputFilePathWithoutExtension = ts.removeFileExtension(getSourceFilePathInNewDir(sourceFile, host, compilerOptions.outDir));
        }
        else {
            emitOutputFilePathWithoutExtension = ts.removeFileExtension(sourceFile.fileName);
        }
        return emitOutputFilePathWithoutExtension + extension;
    }
    ts.getOwnEmitOutputFilePath = getOwnEmitOutputFilePath;
    function getDeclarationEmitOutputFilePath(sourceFile, host) {
        var options = host.getCompilerOptions();
        var outputDir = options.declarationDir || options.outDir; // Prefer declaration folder if specified
        if (options.declaration) {
            var path_1 = outputDir
                ? getSourceFilePathInNewDir(sourceFile, host, outputDir)
                : sourceFile.fileName;
            return ts.removeFileExtension(path_1) + ".d.ts";
        }
    }
    ts.getDeclarationEmitOutputFilePath = getDeclarationEmitOutputFilePath;
    function getEmitScriptTarget(compilerOptions) {
        return compilerOptions.target || 0 /* ES3 */;
    }
    ts.getEmitScriptTarget = getEmitScriptTarget;
    function getEmitModuleKind(compilerOptions) {
        return typeof compilerOptions.module === "number" ?
            compilerOptions.module :
            getEmitScriptTarget(compilerOptions) === 2 /* ES6 */ ? ts.ModuleKind.ES6 : ts.ModuleKind.CommonJS;
    }
    ts.getEmitModuleKind = getEmitModuleKind;
    function forEachExpectedEmitFile(host, action, targetSourceFile) {
        var options = host.getCompilerOptions();
        // Emit on each source file
        if (options.outFile || options.out) {
            onBundledEmit(host);
        }
        else {
            var sourceFiles = targetSourceFile === undefined ? host.getSourceFiles() : [targetSourceFile];
            for (var _i = 0, sourceFiles_1 = sourceFiles; _i < sourceFiles_1.length; _i++) {
                var sourceFile = sourceFiles_1[_i];
                // Don't emit if source file is a declaration file, or was located under node_modules
                if (!isDeclarationFile(sourceFile) && !host.isSourceFileFromExternalLibrary(sourceFile)) {
                    onSingleFileEmit(host, sourceFile);
                }
            }
        }
        function onSingleFileEmit(host, sourceFile) {
            // JavaScript files are always LanguageVariant.JSX, as JSX syntax is allowed in .js files also.
            // So for JavaScript files, '.jsx' is only emitted if the input was '.jsx', and JsxEmit.Preserve.
            // For TypeScript, the only time to emit with a '.jsx' extension, is on JSX input, and JsxEmit.Preserve
            var extension = ".js";
            if (options.jsx === 1 /* Preserve */) {
                if (isSourceFileJavaScript(sourceFile)) {
                    if (ts.fileExtensionIs(sourceFile.fileName, ".jsx")) {
                        extension = ".jsx";
                    }
                }
                else if (sourceFile.languageVariant === 1 /* JSX */) {
                    // TypeScript source file preserving JSX syntax
                    extension = ".jsx";
                }
            }
            var jsFilePath = getOwnEmitOutputFilePath(sourceFile, host, extension);
            var emitFileNames = {
                jsFilePath: jsFilePath,
                sourceMapFilePath: getSourceMapFilePath(jsFilePath, options),
                declarationFilePath: !isSourceFileJavaScript(sourceFile) ? getDeclarationEmitOutputFilePath(sourceFile, host) : undefined
            };
            action(emitFileNames, [sourceFile], /*isBundledEmit*/ false);
        }
        function onBundledEmit(host) {
            // Can emit only sources that are not declaration file and are either non module code or module with
            // --module or --target es6 specified. Files included by searching under node_modules are also not emitted.
            var bundledSources = ts.filter(host.getSourceFiles(), function (sourceFile) { return !isDeclarationFile(sourceFile) &&
                !host.isSourceFileFromExternalLibrary(sourceFile) &&
                (!ts.isExternalModule(sourceFile) ||
                    !!getEmitModuleKind(options)); });
            if (bundledSources.length) {
                var jsFilePath = options.outFile || options.out;
                var emitFileNames = {
                    jsFilePath: jsFilePath,
                    sourceMapFilePath: getSourceMapFilePath(jsFilePath, options),
                    declarationFilePath: options.declaration ? ts.removeFileExtension(jsFilePath) + ".d.ts" : undefined
                };
                action(emitFileNames, bundledSources, /*isBundledEmit*/ true);
            }
        }
        function getSourceMapFilePath(jsFilePath, options) {
            return options.sourceMap ? jsFilePath + ".map" : undefined;
        }
    }
    ts.forEachExpectedEmitFile = forEachExpectedEmitFile;
    function getSourceFilePathInNewDir(sourceFile, host, newDirPath) {
        var sourceFilePath = ts.getNormalizedAbsolutePath(sourceFile.fileName, host.getCurrentDirectory());
        var commonSourceDirectory = host.getCommonSourceDirectory();
        var isSourceFileInCommonSourceDirectory = host.getCanonicalFileName(sourceFilePath).indexOf(host.getCanonicalFileName(commonSourceDirectory)) === 0;
        sourceFilePath = isSourceFileInCommonSourceDirectory ? sourceFilePath.substring(commonSourceDirectory.length) : sourceFilePath;
        return ts.combinePaths(newDirPath, sourceFilePath);
    }
    ts.getSourceFilePathInNewDir = getSourceFilePathInNewDir;
    function writeFile(host, diagnostics, fileName, data, writeByteOrderMark, sourceFiles) {
        host.writeFile(fileName, data, writeByteOrderMark, function (hostErrorMessage) {
            diagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Could_not_write_file_0_Colon_1, fileName, hostErrorMessage));
        }, sourceFiles);
    }
    ts.writeFile = writeFile;
    function getLineOfLocalPosition(currentSourceFile, pos) {
        return ts.getLineAndCharacterOfPosition(currentSourceFile, pos).line;
    }
    ts.getLineOfLocalPosition = getLineOfLocalPosition;
    function getLineOfLocalPositionFromLineMap(lineMap, pos) {
        return ts.computeLineAndCharacterOfPosition(lineMap, pos).line;
    }
    ts.getLineOfLocalPositionFromLineMap = getLineOfLocalPositionFromLineMap;
    function getFirstConstructorWithBody(node) {
        return ts.forEach(node.members, function (member) {
            if (member.kind === 294 /* Constructor */ && nodeIsPresent(member.body)) {
                return member;
            }
        });
    }
    ts.getFirstConstructorWithBody = getFirstConstructorWithBody;
    function getSetAccessorTypeAnnotationNode(accessor) {
        if (accessor && accessor.parameters.length > 0) {
            var hasThis = accessor.parameters.length === 2 &&
                accessor.parameters[0].name.kind === 215 /* Identifier */ &&
                accessor.parameters[0].name.originalKeywordKind === 29 /* this */;
            return accessor.parameters[hasThis ? 1 : 0].type;
        }
    }
    ts.getSetAccessorTypeAnnotationNode = getSetAccessorTypeAnnotationNode;
    function getAllAccessorDeclarations(declarations, accessor) {
        var firstAccessor;
        var secondAccessor;
        var getAccessor;
        var setAccessor;
        if (hasDynamicName(accessor)) {
            firstAccessor = accessor;
            if (accessor.kind === 295 /* GetAccessor */) {
                getAccessor = accessor;
            }
            else if (accessor.kind === 296 /* SetAccessor */) {
                setAccessor = accessor;
            }
            else {
                ts.Debug.fail("Accessor has wrong kind");
            }
        }
        else {
            ts.forEach(declarations, function (member) {
                if ((member.kind === 295 /* GetAccessor */ || member.kind === 296 /* SetAccessor */)
                    && (member.flags & 32 /* Static */) === (accessor.flags & 32 /* Static */)) {
                    var memberName = getPropertyNameForPropertyNameNode(member.name);
                    var accessorName = getPropertyNameForPropertyNameNode(accessor.name);
                    if (memberName === accessorName) {
                        if (!firstAccessor) {
                            firstAccessor = member;
                        }
                        else if (!secondAccessor) {
                            secondAccessor = member;
                        }
                        if (member.kind === 295 /* GetAccessor */ && !getAccessor) {
                            getAccessor = member;
                        }
                        if (member.kind === 296 /* SetAccessor */ && !setAccessor) {
                            setAccessor = member;
                        }
                    }
                }
            });
        }
        return {
            firstAccessor: firstAccessor,
            secondAccessor: secondAccessor,
            getAccessor: getAccessor,
            setAccessor: setAccessor
        };
    }
    ts.getAllAccessorDeclarations = getAllAccessorDeclarations;
    function emitNewLineBeforeLeadingComments(lineMap, writer, node, leadingComments) {
        // If the leading comments start on different line than the start of node, write new line
        if (leadingComments && leadingComments.length && node.pos !== leadingComments[0].pos &&
            getLineOfLocalPositionFromLineMap(lineMap, node.pos) !== getLineOfLocalPositionFromLineMap(lineMap, leadingComments[0].pos)) {
            writer.writeLine();
        }
    }
    ts.emitNewLineBeforeLeadingComments = emitNewLineBeforeLeadingComments;
    function emitComments(text, lineMap, writer, comments, trailingSeparator, newLine, writeComment) {
        var emitLeadingSpace = !trailingSeparator;
        ts.forEach(comments, function (comment) {
            if (emitLeadingSpace) {
                writer.write(" ");
                emitLeadingSpace = false;
            }
            writeComment(text, lineMap, writer, comment, newLine);
            if (comment.hasTrailingNewLine) {
                writer.writeLine();
            }
            else if (trailingSeparator) {
                writer.write(" ");
            }
            else {
                // Emit leading space to separate comment during next comment emit
                emitLeadingSpace = true;
            }
        });
    }
    ts.emitComments = emitComments;
    /**
     * Detached comment is a comment at the top of file or function body that is separated from
     * the next statement by space.
     */
    function emitDetachedComments(text, lineMap, writer, writeComment, node, newLine, removeComments) {
        var leadingComments;
        var currentDetachedCommentInfo;
        if (removeComments) {
            // removeComments is true, only reserve pinned comment at the top of file
            // For example:
            //      /*! Pinned Comment */
            //
            //      var x = 10;
            if (node.pos === 0) {
                leadingComments = ts.filter(ts.getLeadingCommentRanges(text, node.pos), isPinnedComment);
            }
        }
        else {
            // removeComments is false, just get detached as normal and bypass the process to filter comment
            leadingComments = ts.getLeadingCommentRanges(text, node.pos);
        }
        if (leadingComments) {
            var detachedComments = [];
            var lastComment = void 0;
            for (var _i = 0, leadingComments_1 = leadingComments; _i < leadingComments_1.length; _i++) {
                var comment = leadingComments_1[_i];
                if (lastComment) {
                    var lastCommentLine = getLineOfLocalPositionFromLineMap(lineMap, lastComment.end);
                    var commentLine = getLineOfLocalPositionFromLineMap(lineMap, comment.pos);
                    if (commentLine >= lastCommentLine + 2) {
                        // There was a blank line between the last comment and this comment.  This
                        // comment is not part of the copyright comments.  Return what we have so
                        // far.
                        break;
                    }
                }
                detachedComments.push(comment);
                lastComment = comment;
            }
            if (detachedComments.length) {
                // All comments look like they could have been part of the copyright header.  Make
                // sure there is at least one blank line between it and the node.  If not, it's not
                // a copyright header.
                var lastCommentLine = getLineOfLocalPositionFromLineMap(lineMap, ts.lastOrUndefined(detachedComments).end);
                var nodeLine = getLineOfLocalPositionFromLineMap(lineMap, ts.skipTrivia(text, node.pos));
                if (nodeLine >= lastCommentLine + 2) {
                    // Valid detachedComments
                    emitNewLineBeforeLeadingComments(lineMap, writer, node, leadingComments);
                    emitComments(text, lineMap, writer, detachedComments, /*trailingSeparator*/ true, newLine, writeComment);
                    currentDetachedCommentInfo = { nodePos: node.pos, detachedCommentEndPos: ts.lastOrUndefined(detachedComments).end };
                }
            }
        }
        return currentDetachedCommentInfo;
        function isPinnedComment(comment) {
            return text.charCodeAt(comment.pos + 1) === ts.CharCode.asterisk &&
                text.charCodeAt(comment.pos + 2) === ts.CharCode.exclamation;
        }
    }
    ts.emitDetachedComments = emitDetachedComments;
    function writeCommentRange(text, lineMap, writer, comment, newLine) {
        if (text.charCodeAt(comment.pos + 1) === ts.CharCode.asterisk) {
            var firstCommentLineAndCharacter = ts.computeLineAndCharacterOfPosition(lineMap, comment.pos);
            var lineCount = lineMap.length;
            var firstCommentLineIndent = void 0;
            for (var pos = comment.pos, currentLine = firstCommentLineAndCharacter.line; pos < comment.end; currentLine++) {
                var nextLineStart = (currentLine + 1) === lineCount
                    ? text.length + 1
                    : lineMap[currentLine + 1];
                if (pos !== comment.pos) {
                    // If we are not emitting first line, we need to write the spaces to adjust the alignment
                    if (firstCommentLineIndent === undefined) {
                        firstCommentLineIndent = calculateIndent(text, lineMap[firstCommentLineAndCharacter.line], comment.pos);
                    }
                    // These are number of spaces writer is going to write at current indent
                    var currentWriterIndentSpacing = writer.getIndent() * getIndentSize();
                    // Number of spaces we want to be writing
                    // eg: Assume writer indent
                    // module m {
                    //         /* starts at character 9 this is line 1
                    //    * starts at character pos 4 line                        --1  = 8 - 8 + 3
                    //   More left indented comment */                            --2  = 8 - 8 + 2
                    //     class c { }
                    // }
                    // module m {
                    //     /* this is line 1 -- Assume current writer indent 8
                    //      * line                                                --3 = 8 - 4 + 5
                    //            More right indented comment */                  --4 = 8 - 4 + 11
                    //     class c { }
                    // }
                    var spacesToEmit = currentWriterIndentSpacing - firstCommentLineIndent + calculateIndent(text, pos, nextLineStart);
                    if (spacesToEmit > 0) {
                        var numberOfSingleSpacesToEmit = spacesToEmit % getIndentSize();
                        var indentSizeSpaceString = getIndentString((spacesToEmit - numberOfSingleSpacesToEmit) / getIndentSize());
                        // Write indent size string ( in eg 1: = "", 2: "" , 3: string with 8 spaces 4: string with 12 spaces
                        writer.rawWrite(indentSizeSpaceString);
                        // Emit the single spaces (in eg: 1: 3 spaces, 2: 2 spaces, 3: 1 space, 4: 3 spaces)
                        while (numberOfSingleSpacesToEmit) {
                            writer.rawWrite(" ");
                            numberOfSingleSpacesToEmit--;
                        }
                    }
                    else {
                        // No spaces to emit write empty string
                        writer.rawWrite("");
                    }
                }
                // Write the comment line text
                writeTrimmedCurrentLine(text, comment, writer, newLine, pos, nextLineStart);
                pos = nextLineStart;
            }
        }
        else {
            // Single line comment of style //....
            writer.write(text.substring(comment.pos, comment.end));
        }
    }
    ts.writeCommentRange = writeCommentRange;
    function writeTrimmedCurrentLine(text, comment, writer, newLine, pos, nextLineStart) {
        var end = Math.min(comment.end, nextLineStart - 1);
        var currentLineText = text.substring(pos, end).replace(/^\s+|\s+$/g, "");
        if (currentLineText) {
            // trimmed forward and ending spaces text
            writer.write(currentLineText);
            if (end !== comment.end) {
                writer.writeLine();
            }
        }
        else {
            // Empty string - make sure we write empty line
            writer.writeLiteral(newLine);
        }
    }
    function calculateIndent(text, pos, end) {
        var currentLineIndent = 0;
        for (; pos < end && ts.isNoBreakWhiteSpace(text.charCodeAt(pos)); pos++) {
            if (text.charCodeAt(pos) === ts.CharCode.horizontalTab) {
                // Tabs = TabSize = indent size and go to next tabStop
                currentLineIndent += getIndentSize() - (currentLineIndent % getIndentSize());
            }
            else {
                // Single space
                currentLineIndent++;
            }
        }
        return currentLineIndent;
    }
    function modifierToFlag(token) {
        switch (token) {
            case 9 /* static */: return 32 /* Static */;
            case 8 /* public */: return 4 /* Public */;
            case 7 /* protected */: return 16 /* Protected */;
            case 6 /* private */: return 8 /* Private */;
            case 10 /* abstract */: return 128 /* Abstract */;
            case 4 /* export */: return 1 /* Export */;
            case 11 /* declare */: return 2 /* Ambient */;
            case 115 /* const */: return 2048 /* Const */;
            case 127 /* default */: return 512 /* Default */;
            case 5 /* async */: return 256 /* Async */;
            case 12 /* readonly */: return 64 /* Readonly */;
        }
        return 0;
    }
    ts.modifierToFlag = modifierToFlag;
    function isLeftHandSideExpression(expr) {
        if (expr) {
            switch (expr.kind) {
                case 318 /* PropertyAccessExpression */:
                case 319 /* ElementAccessExpression */:
                case 321 /* NewExpression */:
                case 320 /* CallExpression */:
                case 342 /* NonNullExpression */:
                case 387 /* JsxElement */:
                case 388 /* JsxSelfClosingElement */:
                case 322 /* TaggedTemplateExpression */:
                case 316 /* ArrayLiteralExpression */:
                case 324 /* ParenthesizedExpression */:
                case 317 /* ObjectLiteralExpression */:
                case 338 /* ClassExpression */:
                case 325 /* FunctionExpression */:
                case 215 /* Identifier */:
                case 156 /* RegularExpressionLiteral */:
                case 154 /* NumericLiteral */:
                case 155 /* StringLiteral */:
                case 157 /* NoSubstitutionTemplateLiteral */:
                case 335 /* TemplateExpression */:
                case 28 /* false */:
                case 26 /* null */:
                case 29 /* this */:
                case 27 /* true */:
                case 30 /* super */:
                    return true;
            }
        }
        return false;
    }
    ts.isLeftHandSideExpression = isLeftHandSideExpression;
    function isAssignmentOperator(token) {
        return token >= 202 /* FirstAssignment */ && token <= 214 /* LastAssignment */;
    }
    ts.isAssignmentOperator = isAssignmentOperator;
    function isExpressionWithTypeArgumentsInClassExtendsClause(node) {
        return node.kind === 340 /* ExpressionWithTypeArguments */ &&
            node.parent.token === 131 /* extends */ &&
            isClassLike(node.parent.parent);
    }
    ts.isExpressionWithTypeArgumentsInClassExtendsClause = isExpressionWithTypeArgumentsInClassExtendsClause;
    // Returns false if this heritage clause element's expression contains something unsupported
    // (i.e. not a name or dotted name).
    function isSupportedExpressionWithTypeArguments(node) {
        return isSupportedExpressionWithTypeArgumentsRest(node.expression);
    }
    ts.isSupportedExpressionWithTypeArguments = isSupportedExpressionWithTypeArguments;
    function isSupportedExpressionWithTypeArgumentsRest(node) {
        if (node.kind === 215 /* Identifier */) {
            return true;
        }
        else if (isPropertyAccessExpression(node)) {
            return isSupportedExpressionWithTypeArgumentsRest(node.expression);
        }
        else {
            return false;
        }
    }
    function isRightSideOfQualifiedNameOrPropertyAccess(node) {
        return (node.parent.kind === 285 /* QualifiedName */ && node.parent.right === node) ||
            (node.parent.kind === 318 /* PropertyAccessExpression */ && node.parent.name === node);
    }
    ts.isRightSideOfQualifiedNameOrPropertyAccess = isRightSideOfQualifiedNameOrPropertyAccess;
    function isEmptyObjectLiteralOrArrayLiteral(expression) {
        var kind = expression.kind;
        if (kind === 317 /* ObjectLiteralExpression */) {
            return expression.properties.length === 0;
        }
        if (kind === 316 /* ArrayLiteralExpression */) {
            return expression.elements.length === 0;
        }
        return false;
    }
    ts.isEmptyObjectLiteralOrArrayLiteral = isEmptyObjectLiteralOrArrayLiteral;
    function getLocalSymbolForExportDefault(symbol) {
        return symbol && symbol.valueDeclaration && (symbol.valueDeclaration.flags & 512 /* Default */) ? symbol.valueDeclaration.localSymbol : undefined;
    }
    ts.getLocalSymbolForExportDefault = getLocalSymbolForExportDefault;
    function hasJavaScriptFileExtension(fileName) {
        return ts.forEach(ts.supportedJavascriptExtensions, function (extension) { return ts.fileExtensionIs(fileName, extension); });
    }
    ts.hasJavaScriptFileExtension = hasJavaScriptFileExtension;
    function hasTypeScriptFileExtension(fileName) {
        return ts.forEach(ts.supportedTypeScriptExtensions, function (extension) { return ts.fileExtensionIs(fileName, extension); });
    }
    ts.hasTypeScriptFileExtension = hasTypeScriptFileExtension;
    /**
     * Replace each instance of non-ascii characters by one, two, three, or four escape sequences
     * representing the UTF-8 encoding of the character, and return the expanded char code list.
     */
    function getExpandedCharCodes(input) {
        var output = [];
        var length = input.length;
        for (var i = 0; i < length; i++) {
            var charCode = input.charCodeAt(i);
            // handel utf8
            if (charCode < 0x80) {
                output.push(charCode);
            }
            else if (charCode < 0x800) {
                output.push((charCode >> 6) | 192);
                output.push((charCode & 63) | 128);
            }
            else if (charCode < 0x10000) {
                output.push((charCode >> 12) | 224);
                output.push(((charCode >> 6) & 63) | 128);
                output.push((charCode & 63) | 128);
            }
            else if (charCode < 0x20000) {
                output.push((charCode >> 18) | 240);
                output.push(((charCode >> 12) & 63) | 128);
                output.push(((charCode >> 6) & 63) | 128);
                output.push((charCode & 63) | 128);
            }
            else {
                ts.Debug.assert(false, "Unexpected code point");
            }
        }
        return output;
    }
    /**
     * Serialize an object graph into a JSON string. This is intended only for use on an acyclic graph
     * as the fallback implementation does not check for circular references by default.
     */
    ts.stringify = typeof JSON !== "undefined" && JSON.stringify
        ? JSON.stringify
        : stringifyFallback;
    /**
     * Serialize an object graph into a JSON string.
     */
    function stringifyFallback(value) {
        // JSON.stringify returns `undefined` here, instead of the string "undefined".
        return value === undefined ? undefined : stringifyValue(value);
    }
    function stringifyValue(value) {
        return typeof value === "string" ? "\"" + escapeString(value) + "\""
            : typeof value === "number" ? isFinite(value) ? String(value) : "null"
                : typeof value === "boolean" ? value ? "true" : "false"
                    : typeof value === "object" && value ? ts.isArray(value) ? cycleCheck(stringifyArray, value) : cycleCheck(stringifyObject, value)
                        : "null";
    }
    function cycleCheck(cb, value) {
        ts.Debug.assert(!value.hasOwnProperty("__cycle"), "Converting circular structure to JSON");
        value.__cycle = true;
        var result = cb(value);
        delete value.__cycle;
        return result;
    }
    function stringifyArray(value) {
        return "[" + ts.reduceLeft(value, stringifyElement, "") + "]";
    }
    function stringifyElement(memo, value) {
        return (memo ? memo + "," : memo) + stringifyValue(value);
    }
    function stringifyObject(value) {
        return "{" + ts.reduceProperties(value, stringifyProperty, "") + "}";
    }
    function stringifyProperty(memo, value, key) {
        return value === undefined || typeof value === "function" || key === "__cycle" ? memo
            : (memo ? memo + "," : memo) + ("\"" + escapeString(key) + "\":" + stringifyValue(value));
    }
    var base64Digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    /**
     * Converts a string to a base-64 encoded ASCII string.
     */
    function convertToBase64(input) {
        var result = "";
        var charCodes = getExpandedCharCodes(input);
        var i = 0;
        var length = charCodes.length;
        var byte1, byte2, byte3, byte4;
        while (i < length) {
            // Convert every 6-bits in the input 3 character points
            // into a base64 digit
            byte1 = charCodes[i] >> 2;
            byte2 = (charCodes[i] & 3) << 4 | charCodes[i + 1] >> 4;
            byte3 = (charCodes[i + 1] & 15) << 2 | charCodes[i + 2] >> 6;
            byte4 = charCodes[i + 2] & 63;
            // We are out of characters in the input, set the extra
            // digits to 64 (padding character).
            if (i + 1 >= length) {
                byte3 = byte4 = 64;
            }
            else if (i + 2 >= length) {
                byte4 = 64;
            }
            // Write to the output
            result += base64Digits.charAt(byte1) + base64Digits.charAt(byte2) + base64Digits.charAt(byte3) + base64Digits.charAt(byte4);
            i += 3;
        }
        return result;
    }
    ts.convertToBase64 = convertToBase64;
    function convertToRelativePath(absoluteOrRelativePath, basePath, getCanonicalFileName) {
        return !ts.isRootedDiskPath(absoluteOrRelativePath)
            ? absoluteOrRelativePath
            : ts.getRelativePathToDirectoryOrUrl(basePath, absoluteOrRelativePath, basePath, getCanonicalFileName, /* isAbsolutePathAnUrl */ false);
    }
    ts.convertToRelativePath = convertToRelativePath;
    var carriageReturnLineFeed = "\r\n";
    var lineFeed = "\n";
    function getNewLineCharacter(options) {
        if (options.newLine === 0 /* CarriageReturnLineFeed */) {
            return carriageReturnLineFeed;
        }
        else if (options.newLine === 1 /* LineFeed */) {
            return lineFeed;
        }
        else if (ts.sys) {
            return ts.sys.newLine;
        }
        return carriageReturnLineFeed;
    }
    ts.getNewLineCharacter = getNewLineCharacter;
    function isWatchSet(options) {
        // Firefox has Object.prototype.watch
        return options.watch && options.hasOwnProperty("watch");
    }
    ts.isWatchSet = isWatchSet;
})(ts || (ts = {}));
var ts;
(function (ts) {
    function getDefaultLibFileName(options) {
        return options.target === 2 /* ES6 */ ? "lib.es6.d.ts" : "lib.d.ts";
    }
    ts.getDefaultLibFileName = getDefaultLibFileName;
    function textSpanEnd(span) {
        return span.start + span.length;
    }
    ts.textSpanEnd = textSpanEnd;
    function textSpanIsEmpty(span) {
        return span.length === 0;
    }
    ts.textSpanIsEmpty = textSpanIsEmpty;
    function textSpanContainsPosition(span, position) {
        return position >= span.start && position < textSpanEnd(span);
    }
    ts.textSpanContainsPosition = textSpanContainsPosition;
    // Returns true if 'span' contains 'other'.
    function textSpanContainsTextSpan(span, other) {
        return other.start >= span.start && textSpanEnd(other) <= textSpanEnd(span);
    }
    ts.textSpanContainsTextSpan = textSpanContainsTextSpan;
    function textSpanOverlapsWith(span, other) {
        var overlapStart = Math.max(span.start, other.start);
        var overlapEnd = Math.min(textSpanEnd(span), textSpanEnd(other));
        return overlapStart < overlapEnd;
    }
    ts.textSpanOverlapsWith = textSpanOverlapsWith;
    function textSpanOverlap(span1, span2) {
        var overlapStart = Math.max(span1.start, span2.start);
        var overlapEnd = Math.min(textSpanEnd(span1), textSpanEnd(span2));
        if (overlapStart < overlapEnd) {
            return createTextSpanFromBounds(overlapStart, overlapEnd);
        }
        return undefined;
    }
    ts.textSpanOverlap = textSpanOverlap;
    function textSpanIntersectsWithTextSpan(span, other) {
        return other.start <= textSpanEnd(span) && textSpanEnd(other) >= span.start;
    }
    ts.textSpanIntersectsWithTextSpan = textSpanIntersectsWithTextSpan;
    function textSpanIntersectsWith(span, start, length) {
        var end = start + length;
        return start <= textSpanEnd(span) && end >= span.start;
    }
    ts.textSpanIntersectsWith = textSpanIntersectsWith;
    function decodedTextSpanIntersectsWith(start1, length1, start2, length2) {
        var end1 = start1 + length1;
        var end2 = start2 + length2;
        return start2 <= end1 && end2 >= start1;
    }
    ts.decodedTextSpanIntersectsWith = decodedTextSpanIntersectsWith;
    function textSpanIntersectsWithPosition(span, position) {
        return position <= textSpanEnd(span) && position >= span.start;
    }
    ts.textSpanIntersectsWithPosition = textSpanIntersectsWithPosition;
    function textSpanIntersection(span1, span2) {
        var intersectStart = Math.max(span1.start, span2.start);
        var intersectEnd = Math.min(textSpanEnd(span1), textSpanEnd(span2));
        if (intersectStart <= intersectEnd) {
            return createTextSpanFromBounds(intersectStart, intersectEnd);
        }
        return undefined;
    }
    ts.textSpanIntersection = textSpanIntersection;
    function createTextSpan(start, length) {
        if (start < 0) {
            throw new Error("start < 0");
        }
        if (length < 0) {
            throw new Error("length < 0");
        }
        return { start: start, length: length };
    }
    ts.createTextSpan = createTextSpan;
    function createTextSpanFromBounds(start, end) {
        return createTextSpan(start, end - start);
    }
    ts.createTextSpanFromBounds = createTextSpanFromBounds;
    function textChangeRangeNewSpan(range) {
        return createTextSpan(range.span.start, range.newLength);
    }
    ts.textChangeRangeNewSpan = textChangeRangeNewSpan;
    function textChangeRangeIsUnchanged(range) {
        return textSpanIsEmpty(range.span) && range.newLength === 0;
    }
    ts.textChangeRangeIsUnchanged = textChangeRangeIsUnchanged;
    function createTextChangeRange(span, newLength) {
        if (newLength < 0) {
            throw new Error("newLength < 0");
        }
        return { span: span, newLength: newLength };
    }
    ts.createTextChangeRange = createTextChangeRange;
    ts.unchangedTextChangeRange = createTextChangeRange(createTextSpan(0, 0), 0);
    /**
     * Called to merge all the changes that occurred across several versions of a script snapshot
     * into a single change.  i.e. if a user keeps making successive edits to a script we will
     * have a text change from V1 to V2, V2 to V3, ..., Vn.
     *
     * This function will then merge those changes into a single change range valid between V1 and
     * Vn.
     */
    function collapseTextChangeRangesAcrossMultipleVersions(changes) {
        if (changes.length === 0) {
            return ts.unchangedTextChangeRange;
        }
        if (changes.length === 1) {
            return changes[0];
        }
        // We change from talking about { { oldStart, oldLength }, newLength } to { oldStart, oldEnd, newEnd }
        // as it makes things much easier to reason about.
        var change0 = changes[0];
        var oldStartN = change0.span.start;
        var oldEndN = textSpanEnd(change0.span);
        var newEndN = oldStartN + change0.newLength;
        for (var i = 1; i < changes.length; i++) {
            var nextChange = changes[i];
            // Consider the following case:
            // i.e. two edits.  The first represents the text change range { { 10, 50 }, 30 }.  i.e. The span starting
            // at 10, with length 50 is reduced to length 30.  The second represents the text change range { { 30, 30 }, 40 }.
            // i.e. the span starting at 30 with length 30 is increased to length 40.
            //
            //      0         10        20        30        40        50        60        70        80        90        100
            //      -------------------------------------------------------------------------------------------------------
            //                |                                                 /
            //                |                                            /----
            //  T1            |                                       /----
            //                |                                  /----
            //                |                             /----
            //      -------------------------------------------------------------------------------------------------------
            //                                     |                            \
            //                                     |                               \
            //   T2                                |                                 \
            //                                     |                                   \
            //                                     |                                      \
            //      -------------------------------------------------------------------------------------------------------
            //
            // Merging these turns out to not be too difficult.  First, determining the new start of the change is trivial
            // it's just the min of the old and new starts.  i.e.:
            //
            //      0         10        20        30        40        50        60        70        80        90        100
            //      ------------------------------------------------------------*------------------------------------------
            //                |                                                 /
            //                |                                            /----
            //  T1            |                                       /----
            //                |                                  /----
            //                |                             /----
            //      ----------------------------------------$-------------------$------------------------------------------
            //                .                    |                            \
            //                .                    |                               \
            //   T2           .                    |                                 \
            //                .                    |                                   \
            //                .                    |                                      \
            //      ----------------------------------------------------------------------*--------------------------------
            //
            // (Note the dots represent the newly inferred start.
            // Determining the new and old end is also pretty simple.  Basically it boils down to paying attention to the
            // absolute positions at the asterisks, and the relative change between the dollar signs. Basically, we see
            // which if the two $'s precedes the other, and we move that one forward until they line up.  in this case that
            // means:
            //
            //      0         10        20        30        40        50        60        70        80        90        100
            //      --------------------------------------------------------------------------------*----------------------
            //                |                                                                     /
            //                |                                                                /----
            //  T1            |                                                           /----
            //                |                                                      /----
            //                |                                                 /----
            //      ------------------------------------------------------------$------------------------------------------
            //                .                    |                            \
            //                .                    |                               \
            //   T2           .                    |                                 \
            //                .                    |                                   \
            //                .                    |                                      \
            //      ----------------------------------------------------------------------*--------------------------------
            //
            // In other words (in this case), we're recognizing that the second edit happened after where the first edit
            // ended with a delta of 20 characters (60 - 40).  Thus, if we go back in time to where the first edit started
            // that's the same as if we started at char 80 instead of 60.
            //
            // As it so happens, the same logic applies if the second edit precedes the first edit.  In that case rather
            // than pushing the first edit forward to match the second, we'll push the second edit forward to match the
            // first.
            //
            // In this case that means we have { oldStart: 10, oldEnd: 80, newEnd: 70 } or, in TextChangeRange
            // semantics: { { start: 10, length: 70 }, newLength: 60 }
            //
            // The math then works out as follows.
            // If we have { oldStart1, oldEnd1, newEnd1 } and { oldStart2, oldEnd2, newEnd2 } then we can compute the
            // final result like so:
            //
            // {
            //      oldStart3: Min(oldStart1, oldStart2),
            //      oldEnd3  : Max(oldEnd1, oldEnd1 + (oldEnd2 - newEnd1)),
            //      newEnd3  : Max(newEnd2, newEnd2 + (newEnd1 - oldEnd2))
            // }
            var oldStart1 = oldStartN;
            var oldEnd1 = oldEndN;
            var newEnd1 = newEndN;
            var oldStart2 = nextChange.span.start;
            var oldEnd2 = textSpanEnd(nextChange.span);
            var newEnd2 = oldStart2 + nextChange.newLength;
            oldStartN = Math.min(oldStart1, oldStart2);
            oldEndN = Math.max(oldEnd1, oldEnd1 + (oldEnd2 - newEnd1));
            newEndN = Math.max(newEnd2, newEnd2 + (newEnd1 - oldEnd2));
        }
        return createTextChangeRange(createTextSpanFromBounds(oldStartN, oldEndN), /*newLength:*/ newEndN - oldStartN);
    }
    ts.collapseTextChangeRangesAcrossMultipleVersions = collapseTextChangeRangesAcrossMultipleVersions;
    function getTypeParameterOwner(d) {
        if (d && d.kind === 287 /* TypeParameter */) {
            for (var current = d; current; current = current.parent) {
                if (ts.isFunctionLike(current) || ts.isClassLike(current) || current.kind === 368 /* InterfaceDeclaration */) {
                    return current;
                }
            }
        }
    }
    ts.getTypeParameterOwner = getTypeParameterOwner;
    function isParameterPropertyDeclaration(node) {
        return node.flags & 92 /* ParameterPropertyModifier */ && node.parent.kind === 294 /* Constructor */ && ts.isClassLike(node.parent.parent);
    }
    ts.isParameterPropertyDeclaration = isParameterPropertyDeclaration;
    function startsWith(str, prefix) {
        return str.lastIndexOf(prefix, 0) === 0;
    }
    ts.startsWith = startsWith;
    function endsWith(str, suffix) {
        var expectedPos = str.length - suffix.length;
        return str.indexOf(suffix, expectedPos) === expectedPos;
    }
    ts.endsWith = endsWith;
})(ts || (ts = {}));
//# sourceMappingURL=utilities.js.map