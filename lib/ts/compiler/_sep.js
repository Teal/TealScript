var ts;
(function (ts) {
    /* @internal */
    function tokenIsIdentifierOrKeyword(token) {
        return token >= 215 /* Identifier */;
    }
    ts.tokenIsIdentifierOrKeyword = tokenIsIdentifierOrKeyword;
    /* @internal */
    function computeLineStarts(text) {
        var result = new Array();
        var pos = 0;
        var lineStart = 0;
        while (pos < text.length) {
            var ch = text.charCodeAt(pos);
            pos++;
            switch (ch) {
                case ts.CharCode.carriageReturn:
                    if (text.charCodeAt(pos) === ts.CharCode.lineFeed) {
                        pos++;
                    }
                case ts.CharCode.lineFeed:
                    result.push(lineStart);
                    lineStart = pos;
                    break;
                default:
                    if (ch > ts.CharCode.MAX_ASCII && ts.isLineBreak(ch)) {
                        result.push(lineStart);
                        lineStart = pos;
                    }
                    break;
            }
        }
        result.push(lineStart);
        return result;
    }
    ts.computeLineStarts = computeLineStarts;
    function getPositionOfLineAndCharacter(sourceFile, line, character) {
        return computePositionOfLineAndCharacter(getLineStarts(sourceFile), line, character);
    }
    ts.getPositionOfLineAndCharacter = getPositionOfLineAndCharacter;
    /* @internal */
    function computePositionOfLineAndCharacter(lineStarts, line, character) {
        ts.Debug.assert(line >= 0 && line < lineStarts.length);
        return lineStarts[line] + character;
    }
    ts.computePositionOfLineAndCharacter = computePositionOfLineAndCharacter;
    /* @internal */
    function getLineStarts(sourceFile) {
        return sourceFile.lineMap || (sourceFile.lineMap = computeLineStarts(sourceFile.text));
    }
    ts.getLineStarts = getLineStarts;
    /* @internal */
    /**
     * We assume the first line starts at position 0 and 'position' is non-negative.
     */
    function computeLineAndCharacterOfPosition(lineStarts, position) {
        var lineNumber = ts.binarySearch(lineStarts, position);
        if (lineNumber < 0) {
            // If the actual position was not found,
            // the binary search returns the 2's-complement of the next line start
            // e.g. if the line starts at [5, 10, 23, 80] and the position requested was 20
            // then the search will return -2.
            //
            // We want the index of the previous line start, so we subtract 1.
            // Review 2's-complement if this is confusing.
            lineNumber = ~lineNumber - 1;
            ts.Debug.assert(lineNumber !== -1, "position cannot precede the beginning of the file");
        }
        return {
            line: lineNumber,
            character: position - lineStarts[lineNumber]
        };
    }
    ts.computeLineAndCharacterOfPosition = computeLineAndCharacterOfPosition;
    function getLineAndCharacterOfPosition(sourceFile, position) {
        return computeLineAndCharacterOfPosition(getLineStarts(sourceFile), position);
    }
    ts.getLineAndCharacterOfPosition = getLineAndCharacterOfPosition;
    function createNode(kind, pos, end) {
        if (kind === 402 /* SourceFile */) {
            return new (SourceFileConstructor || (SourceFileConstructor = ts.objectAllocator.getSourceFileConstructor()))(kind, pos, end);
        }
        else {
            return new (NodeConstructor || (NodeConstructor = ts.objectAllocator.getNodeConstructor()))(kind, pos, end);
        }
    }
    ts.createNode = createNode;
    function visitNode(cbNode, node) {
        if (node) {
            return cbNode(node);
        }
    }
    function visitNodeArray(cbNodes, nodes) {
        if (nodes) {
            return cbNodes(nodes);
        }
    }
    function visitEachNode(cbNode, nodes) {
        if (nodes) {
            for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
                var node = nodes_1[_i];
                var result = cbNode(node);
                if (result) {
                    return result;
                }
            }
        }
    }
    // Invokes a callback for each child of the given node. The 'cbNode' callback is invoked for all child nodes
    // stored in properties. If a 'cbNodes' callback is specified, it is invoked for embedded arrays; otherwise,
    // embedded arrays are flattened and the 'cbNode' callback is invoked for each element. If a callback returns
    // a truthy value, iteration stops and that value is returned. Otherwise, undefined is returned.
    function forEachChild(node, cbNode, cbNodeArray) {
        if (!node) {
            return;
        }
        // The visitXXX functions could be written as local functions that close over the cbNode and cbNodeArray
        // callback parameters, but that causes a closure allocation for each invocation with noticeable effects
        // on performance.
        var visitNodes = cbNodeArray ? visitNodeArray : visitEachNode;
        var cbNodes = cbNodeArray || cbNode;
        switch (node.kind) {
            case 285 /* QualifiedName */:
                return visitNode(cbNode, node.left) ||
                    visitNode(cbNode, node.right);
            case 287 /* TypeParameter */:
                return visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.constraint) ||
                    visitNode(cbNode, node.expression);
            case 400 /* ShorthandPropertyAssignment */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.questionToken) ||
                    visitNode(cbNode, node.equalsToken) ||
                    visitNode(cbNode, node.objectAssignmentInitializer);
            case 288 /* Parameter */:
            case 291 /* PropertyDeclaration */:
            case 290 /* PropertySignature */:
            case 399 /* PropertyAssignment */:
            case 364 /* VariableDeclaration */:
            case 315 /* BindingElement */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.propertyName) ||
                    visitNode(cbNode, node.dotDotDotToken) ||
                    visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.questionToken) ||
                    visitNode(cbNode, node.type) ||
                    visitNode(cbNode, node.initializer);
            case 302 /* FunctionType */:
            case 303 /* ConstructorType */:
            case 297 /* CallSignature */:
            case 298 /* ConstructSignature */:
            case 299 /* IndexSignature */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNodes(cbNodes, node.typeParameters) ||
                    visitNodes(cbNodes, node.parameters) ||
                    visitNode(cbNode, node.type);
            case 293 /* MethodDeclaration */:
            case 292 /* MethodSignature */:
            case 294 /* Constructor */:
            case 295 /* GetAccessor */:
            case 296 /* SetAccessor */:
            case 325 /* FunctionExpression */:
            case 366 /* FunctionDeclaration */:
            case 326 /* ArrowFunction */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.asteriskToken) ||
                    visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.questionToken) ||
                    visitNodes(cbNodes, node.typeParameters) ||
                    visitNodes(cbNodes, node.parameters) ||
                    visitNode(cbNode, node.type) ||
                    visitNode(cbNode, node.equalsGreaterThanToken) ||
                    visitNode(cbNode, node.body);
            case 301 /* TypeReference */:
                return visitNode(cbNode, node.typeName) ||
                    visitNodes(cbNodes, node.typeArguments);
            case 300 /* TypePredicate */:
                return visitNode(cbNode, node.parameterName) ||
                    visitNode(cbNode, node.type);
            case 304 /* TypeQuery */:
                return visitNode(cbNode, node.exprName);
            case 305 /* TypeLiteral */:
                return visitNodes(cbNodes, node.members);
            case 306 /* ArrayType */:
                return visitNode(cbNode, node.elementType);
            case 307 /* TupleType */:
                return visitNodes(cbNodes, node.elements);
            case 308 /* UnionType */:
            case 309 /* IntersectionType */:
                return visitNodes(cbNodes, node.types);
            case 310 /* ParenthesizedType */:
                return visitNode(cbNode, node.type);
            case 313 /* ObjectBindingPattern */:
            case 314 /* ArrayBindingPattern */:
                return visitNodes(cbNodes, node.elements);
            case 316 /* ArrayLiteralExpression */:
                return visitNodes(cbNodes, node.elements);
            case 317 /* ObjectLiteralExpression */:
                return visitNodes(cbNodes, node.properties);
            case 318 /* PropertyAccessExpression */:
                return visitNode(cbNode, node.expression) ||
                    visitNode(cbNode, node.name);
            case 319 /* ElementAccessExpression */:
                return visitNode(cbNode, node.expression) ||
                    visitNode(cbNode, node.argumentExpression);
            case 320 /* CallExpression */:
            case 321 /* NewExpression */:
                return visitNode(cbNode, node.expression) ||
                    visitNodes(cbNodes, node.typeArguments) ||
                    visitNodes(cbNodes, node.arguments);
            case 322 /* TaggedTemplateExpression */:
                return visitNode(cbNode, node.tag) ||
                    visitNode(cbNode, node.template);
            case 323 /* TypeAssertionExpression */:
                return visitNode(cbNode, node.type) ||
                    visitNode(cbNode, node.expression);
            case 324 /* ParenthesizedExpression */:
                return visitNode(cbNode, node.expression);
            case 327 /* DeleteExpression */:
                return visitNode(cbNode, node.expression);
            case 328 /* TypeOfExpression */:
                return visitNode(cbNode, node.expression);
            case 329 /* VoidExpression */:
                return visitNode(cbNode, node.expression);
            case 331 /* PrefixUnaryExpression */:
                return visitNode(cbNode, node.operand);
            case 336 /* YieldExpression */:
                return visitNode(cbNode, node.asteriskToken) ||
                    visitNode(cbNode, node.expression);
            case 330 /* AwaitExpression */:
                return visitNode(cbNode, node.expression);
            case 332 /* PostfixUnaryExpression */:
                return visitNode(cbNode, node.operand);
            case 333 /* BinaryExpression */:
                return visitNode(cbNode, node.left) ||
                    visitNode(cbNode, node.operatorToken) ||
                    visitNode(cbNode, node.right);
            case 341 /* AsExpression */:
                return visitNode(cbNode, node.expression) ||
                    visitNode(cbNode, node.type);
            case 342 /* NonNullExpression */:
                return visitNode(cbNode, node.expression);
            case 334 /* ConditionalExpression */:
                return visitNode(cbNode, node.condition) ||
                    visitNode(cbNode, node.questionToken) ||
                    visitNode(cbNode, node.whenTrue) ||
                    visitNode(cbNode, node.colonToken) ||
                    visitNode(cbNode, node.whenFalse);
            case 337 /* SpreadElementExpression */:
                return visitNode(cbNode, node.expression);
            case 345 /* Block */:
            case 372 /* ModuleBlock */:
                return visitNodes(cbNodes, node.statements);
            case 402 /* SourceFile */:
                return visitNodes(cbNodes, node.statements) ||
                    visitNode(cbNode, node.endOfFileToken);
            case 346 /* VariableStatement */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.declarationList);
            case 365 /* VariableDeclarationList */:
                return visitNodes(cbNodes, node.declarations);
            case 348 /* ExpressionStatement */:
                return visitNode(cbNode, node.expression);
            case 349 /* IfStatement */:
                return visitNode(cbNode, node.expression) ||
                    visitNode(cbNode, node.thenStatement) ||
                    visitNode(cbNode, node.elseStatement);
            case 350 /* DoStatement */:
                return visitNode(cbNode, node.statement) ||
                    visitNode(cbNode, node.expression);
            case 351 /* WhileStatement */:
                return visitNode(cbNode, node.expression) ||
                    visitNode(cbNode, node.statement);
            case 352 /* ForStatement */:
                return visitNode(cbNode, node.initializer) ||
                    visitNode(cbNode, node.condition) ||
                    visitNode(cbNode, node.incrementor) ||
                    visitNode(cbNode, node.statement);
            case 353 /* ForInStatement */:
                return visitNode(cbNode, node.initializer) ||
                    visitNode(cbNode, node.expression) ||
                    visitNode(cbNode, node.statement);
            case 354 /* ForOfStatement */:
                return visitNode(cbNode, node.initializer) ||
                    visitNode(cbNode, node.expression) ||
                    visitNode(cbNode, node.statement);
            case 355 /* ContinueStatement */:
            case 356 /* BreakStatement */:
                return visitNode(cbNode, node.label);
            case 357 /* ReturnStatement */:
                return visitNode(cbNode, node.expression);
            case 358 /* WithStatement */:
                return visitNode(cbNode, node.expression) ||
                    visitNode(cbNode, node.statement);
            case 359 /* SwitchStatement */:
                return visitNode(cbNode, node.expression) ||
                    visitNode(cbNode, node.caseBlock);
            case 373 /* CaseBlock */:
                return visitNodes(cbNodes, node.clauses);
            case 395 /* CaseClause */:
                return visitNode(cbNode, node.expression) ||
                    visitNodes(cbNodes, node.statements);
            case 396 /* DefaultClause */:
                return visitNodes(cbNodes, node.statements);
            case 360 /* LabeledStatement */:
                return visitNode(cbNode, node.label) ||
                    visitNode(cbNode, node.statement);
            case 361 /* ThrowStatement */:
                return visitNode(cbNode, node.expression);
            case 362 /* TryStatement */:
                return visitNode(cbNode, node.tryBlock) ||
                    visitNode(cbNode, node.catchClause) ||
                    visitNode(cbNode, node.finallyBlock);
            case 398 /* CatchClause */:
                return visitNode(cbNode, node.variableDeclaration) ||
                    visitNode(cbNode, node.block);
            case 289 /* Decorator */:
                return visitNode(cbNode, node.expression);
            case 367 /* ClassDeclaration */:
            case 338 /* ClassExpression */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.name) ||
                    visitNodes(cbNodes, node.typeParameters) ||
                    visitNodes(cbNodes, node.heritageClauses) ||
                    visitNodes(cbNodes, node.members);
            case 368 /* InterfaceDeclaration */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.name) ||
                    visitNodes(cbNodes, node.typeParameters) ||
                    visitNodes(cbNodes, node.heritageClauses) ||
                    visitNodes(cbNodes, node.members);
            case 369 /* TypeAliasDeclaration */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.name) ||
                    visitNodes(cbNodes, node.typeParameters) ||
                    visitNode(cbNode, node.type);
            case 370 /* EnumDeclaration */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.name) ||
                    visitNodes(cbNodes, node.members);
            case 401 /* EnumMember */:
                return visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.initializer);
            case 371 /* ModuleDeclaration */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.body);
            case 375 /* ImportEqualsDeclaration */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.moduleReference);
            case 376 /* ImportDeclaration */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.importClause) ||
                    visitNode(cbNode, node.moduleSpecifier);
            case 377 /* ImportClause */:
                return visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.namedBindings);
            case 374 /* NamespaceExportDeclaration */:
                return visitNode(cbNode, node.name);
            case 378 /* NamespaceImport */:
                return visitNode(cbNode, node.name);
            case 379 /* NamedImports */:
            case 383 /* NamedExports */:
                return visitNodes(cbNodes, node.elements);
            case 382 /* ExportDeclaration */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.exportClause) ||
                    visitNode(cbNode, node.moduleSpecifier);
            case 380 /* ImportSpecifier */:
            case 384 /* ExportSpecifier */:
                return visitNode(cbNode, node.propertyName) ||
                    visitNode(cbNode, node.name);
            case 381 /* ExportAssignment */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.expression);
            case 335 /* TemplateExpression */:
                return visitNode(cbNode, node.head) || visitNodes(cbNodes, node.templateSpans);
            case 343 /* TemplateSpan */:
                return visitNode(cbNode, node.expression) || visitNode(cbNode, node.literal);
            case 286 /* ComputedPropertyName */:
                return visitNode(cbNode, node.expression);
            case 397 /* HeritageClause */:
                return visitNodes(cbNodes, node.types);
            case 340 /* ExpressionWithTypeArguments */:
                return visitNode(cbNode, node.expression) ||
                    visitNodes(cbNodes, node.typeArguments);
            case 386 /* ExternalModuleReference */:
                return visitNode(cbNode, node.expression);
            case 385 /* MissingDeclaration */:
                return visitNodes(cbNodes, node.decorators);
            case 387 /* JsxElement */:
                return visitNode(cbNode, node.openingElement) ||
                    visitNodes(cbNodes, node.children) ||
                    visitNode(cbNode, node.closingElement);
            case 388 /* JsxSelfClosingElement */:
            case 389 /* JsxOpeningElement */:
                return visitNode(cbNode, node.tagName) ||
                    visitNodes(cbNodes, node.attributes);
            case 392 /* JsxAttribute */:
                return visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.initializer);
            case 393 /* JsxSpreadAttribute */:
                return visitNode(cbNode, node.expression);
            case 394 /* JsxExpression */:
                return visitNode(cbNode, node.expression);
            case 391 /* JsxClosingElement */:
                return visitNode(cbNode, node.tagName);
            case 403 /* JSDocTypeExpression */:
                return visitNode(cbNode, node.type);
            case 407 /* JSDocUnionType */:
                return visitNodes(cbNodes, node.types);
            case 408 /* JSDocTupleType */:
                return visitNodes(cbNodes, node.types);
            case 406 /* JSDocArrayType */:
                return visitNode(cbNode, node.elementType);
            case 410 /* JSDocNonNullableType */:
                return visitNode(cbNode, node.type);
            case 409 /* JSDocNullableType */:
                return visitNode(cbNode, node.type);
            case 411 /* JSDocRecordType */:
                return visitNodes(cbNodes, node.members);
            case 413 /* JSDocTypeReference */:
                return visitNode(cbNode, node.name) ||
                    visitNodes(cbNodes, node.typeArguments);
            case 414 /* JSDocOptionalType */:
                return visitNode(cbNode, node.type);
            case 415 /* JSDocFunctionType */:
                return visitNodes(cbNodes, node.parameters) ||
                    visitNode(cbNode, node.type);
            case 416 /* JSDocVariadicType */:
                return visitNode(cbNode, node.type);
            case 417 /* JSDocConstructorType */:
                return visitNode(cbNode, node.type);
            case 418 /* JSDocThisType */:
                return visitNode(cbNode, node.type);
            case 412 /* JSDocRecordMember */:
                return visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.type);
            case 419 /* JSDocComment */:
                return visitNodes(cbNodes, node.tags);
            case 421 /* JSDocParameterTag */:
                return visitNode(cbNode, node.preParameterName) ||
                    visitNode(cbNode, node.typeExpression) ||
                    visitNode(cbNode, node.postParameterName);
            case 422 /* JSDocReturnTag */:
                return visitNode(cbNode, node.typeExpression);
            case 423 /* JSDocTypeTag */:
                return visitNode(cbNode, node.typeExpression);
            case 424 /* JSDocTemplateTag */:
                return visitNodes(cbNodes, node.typeParameters);
            case 425 /* JSDocTypedefTag */:
                return visitNode(cbNode, node.typeExpression) ||
                    visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.jsDocTypeLiteral);
            case 427 /* JSDocTypeLiteral */:
                return visitNodes(cbNodes, node.jsDocPropertyTags);
            case 426 /* JSDocPropertyTag */:
                return visitNode(cbNode, node.typeExpression) ||
                    visitNode(cbNode, node.name);
        }
    }
    ts.forEachChild = forEachChild;
    function createSourceFile(fileName, sourceText, languageVersion, setParentNodes, scriptKind) {
        if (setParentNodes === void 0) { setParentNodes = false; }
        var start = new Date().getTime();
        var result = Parser.parseSourceFile(fileName, sourceText, languageVersion, /*syntaxCursor*/ undefined, setParentNodes, scriptKind);
        ts.parseTime += new Date().getTime() - start;
        return result;
    }
    ts.createSourceFile = createSourceFile;
    function isExternalModule(file) {
        return file.externalModuleIndicator !== undefined;
    }
    ts.isExternalModule = isExternalModule;
})(ts || (ts = {}));
//# sourceMappingURL=_sep.js.map