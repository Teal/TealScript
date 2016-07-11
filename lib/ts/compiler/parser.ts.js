/// <reference path="utilities.ts"/>
/// <reference path="this.scanner.ts"/>
var _this = this;
var ts;
(function (ts) {
    /* @internal */ ts.parseTime = 0;
    let;
    this.NodeConstructor;
    new (kind);
    TokenType, pos;
    number, end;
    number;
    Nodes.Node;
    let;
    this.SourceFileConstructor;
    new (kind);
    TokenType, pos;
    number, end;
    number;
    Nodes.Node;
    this.sourceFile;
    Nodes.SourceFile, newText;
    string, textChangeRange;
    Nodes.TextChangeRange, aggressiveChecks ?  : boolean;
    Nodes.SourceFile;
    {
        return Nodes.IncrementalParser.updateSourceFile(this.sourceFile, newText, textChangeRange, aggressiveChecks);
    }
    /* @internal */
    function parseIsolatedJSDocComment(content, start, length) {
        result = Nodes.Parser.JSDocParser.parseIsolatedJSDocComment(content, start, length);
        if (this.result && this.result.jsDocComment) {
            // because the jsDocComment was parsed out of the source file, it might
            // not be covered by the fixupParentReferences.
            Nodes.Parser.fixupParentReferences(this.result.jsDocComment);
        }
        return this.result;
    }
    ts.parseIsolatedJSDocComment = parseIsolatedJSDocComment;
    /* @internal */
    // Nodes.Exposed only for testing.
    function parseJSDocTypeExpressionForTests(content, start, length) {
        return Nodes.Parser.JSDocParser.parseJSDocTypeExpressionForTests(content, start, length);
    }
    ts.parseJSDocTypeExpressionForTests = parseJSDocTypeExpressionForTests;
    // Nodes.Implement the parser as a singleton module.  Nodes.We do this for perf reasons because creating
    // parser instances can actually be expensive enough to impact us on projects with many source
    // files.
    var Nodes;
    (function (Nodes) {
        var Parser;
        (function (Parser) {
            scanner = createScanner(Nodes.ScriptTarget.Latest, /*skipTrivia*/ true);
            disallowInAndDecoratorContext = Nodes.NodeFlags.DisallowInContext | Nodes.NodeFlags.DecoratorContext;
            NodeConstructor: new (kind);
            TokenType, pos;
            number, end;
            number;
            Nodes.Node;
            SourceFileConstructor: new (kind);
            TokenType, pos;
            number, end;
            number;
            Nodes.Node;
            sourceFile: Nodes.SourceFile;
            parseDiagnostics: Nodes.Diagnostic[];
            syntaxCursor: Nodes.IncrementalParser.SyntaxCursor;
            token: TokenType;
            sourceText: string;
            nodeCount: number;
            identifiers: Nodes.Map();
            identifierCount: number;
            parsingContext: Nodes.ParsingContext;
            contextFlags: Nodes.NodeFlags;
            parseErrorBeforeNextFinishedNode = false;
            function parseSourceFile(fileName, _sourceText, languageVersion, _syntaxCursor, setParentNodes, scriptKind) {
                scriptKind = ensureScriptKind(fileName, scriptKind);
                this.initializeState(fileName, _sourceText, languageVersion, _syntaxCursor, scriptKind);
                var ;
                this.result = this.parseSourceFileWorker(fileName, languageVersion, setParentNodes, scriptKind);
                this.clearState();
                return this.result;
            }
            Parser.parseSourceFile = parseSourceFile;
            initializeState(fileName, string, _sourceText, string, languageVersion, Nodes.ScriptTarget, _syntaxCursor, Nodes.IncrementalParser.SyntaxCursor, scriptKind, Nodes.ScriptKind);
            {
                this.NodeConstructor = objectAllocator.getNodeConstructor();
                this.SourceFileConstructor = objectAllocator.getSourceFileConstructor();
                this.sourceText = _sourceText;
                this.syntaxCursor = _syntaxCursor;
                this.parseDiagnostics = [];
                this.parsingContext = 0;
                this.identifiers = {};
                this.identifierCount = 0;
                this.nodeCount = 0;
                this.contextFlags = scriptKind === Nodes.ScriptKind.JS || scriptKind === Nodes.ScriptKind.JSX ? Nodes.NodeFlags.JavaScriptFile : Nodes.NodeFlags.None;
                this.parseErrorBeforeNextFinishedNode = false;
                // Nodes.Initialize and prime the this.scanner before parsing the source elements.
                this.scanner.setText(this.sourceText);
                this.scanner.setScriptTarget(languageVersion);
                this.scanner.setLanguageVariant(getLanguageVariant(scriptKind));
            }
            clearState();
            {
                // Nodes.Clear out the text the this.scanner is pointing at, so it doesn't keep anything alive unnecessarily.
                this.scanner.setText("");
                // Nodes.Clear any data.  Nodes.We don't want to accidentally hold onto it for too long.
                this.parseDiagnostics = undefined;
                this.sourceFile = undefined;
                this.identifiers = undefined;
                this.syntaxCursor = undefined;
                this.sourceText = undefined;
            }
            parseSourceFileWorker(fileName, string, languageVersion, Nodes.ScriptTarget, setParentNodes, boolean, scriptKind, Nodes.ScriptKind);
            Nodes.SourceFile;
            {
                this.sourceFile = this.createSourceFile(fileName, languageVersion, scriptKind);
                this.sourceFile.flags = this.contextFlags;
                // Nodes.Prime the this.scanner.
                this.token = this.nextToken();
                this.processReferenceComments(this.sourceFile);
                this.sourceFile.statements = this.parseList(Nodes.ParsingContext.SourceElements, this.parseStatement);
                console.assert(this.token === TokenType.endOfFile);
                this.sourceFile.endOfFileToken = this.parseTokenNode();
                this.setExternalModuleIndicator(this.sourceFile);
                this.sourceFile.nodeCount = this.nodeCount;
                this.sourceFile.identifierCount = this.identifierCount;
                this.sourceFile.identifiers = this.identifiers;
                this.sourceFile.parseDiagnostics = this.parseDiagnostics;
                if (setParentNodes) {
                    fixupParentReferences(this.sourceFile);
                }
                return this.sourceFile;
            }
            addJSDocComment(node, T);
            T;
            {
                if (this.contextFlags & Nodes.NodeFlags.JavaScriptFile) {
                    var comments = getLeadingCommentRangesOfNode(node, this.sourceFile);
                    if (comments) {
                        for (var _i = 0, comments_1 = comments; _i < comments_1.length; _i++) {
                            var comment = comments_1[_i];
                            var jsDocComment = Nodes.JSDocParser.parseJSDocComment(node, comment.pos, comment.end - comment.pos);
                            if (!jsDocComment) {
                                continue;
                            }
                            if (!node.jsDocComments) {
                                node.jsDocComments = [];
                            }
                            node.jsDocComments.push(jsDocComment);
                        }
                    }
                }
                return node;
            }
            function fixupParentReferences(rootNode) {
                // normally parent references are set during binding. Nodes.However, for clients that only need
                // a syntax tree, and no semantic features, then the binding process is an unnecessary
                // overhead.  Nodes.This functions allows us to set all the parents, without all the expense of
                // binding.
                var parent = rootNode;
                forEachChild(rootNode, visitNode);
                return;
                function visitNode(n) {
                    // walk down setting parents that differ from the parent we think it should be.  Nodes.This
                    // allows us to quickly bail out of setting parents for subtrees during incremental
                    // parsing
                    if (n.parent !== parent) {
                        n.parent = parent;
                        var saveParent = parent;
                        parent = n;
                        forEachChild(n, visitNode);
                        if (n.jsDocComments) {
                            for (var _i = 0, _a = n.jsDocComments; _i < _a.length; _i++) {
                                var jsDocComment = _a[_i];
                                jsDocComment.parent = n;
                                parent = jsDocComment;
                                forEachChild(jsDocComment, visitNode);
                            }
                        }
                        parent = saveParent;
                    }
                }
            }
            Parser.fixupParentReferences = fixupParentReferences;
            createSourceFile(fileName, string, languageVersion, Nodes.ScriptTarget, scriptKind, Nodes.ScriptKind);
            Nodes.SourceFile;
            {
                // code from this.createNode is inlined here so this.createNode won't have to deal with special case of creating source files
                // this is quite rare comparing to other nodes and this.createNode should be as fast as possible
                var ;
                this.sourceFile = new this.SourceFileConstructor(TokenType.SourceFile, /*pos*/ 0, /* end */ this.sourceText.length);
                this.nodeCount++;
                this.sourceFile.text = this.sourceText;
                this.sourceFile.bindDiagnostics = [];
                this.sourceFile.languageVersion = languageVersion;
                this.sourceFile.fileName = normalizePath(fileName);
                this.sourceFile.languageVariant = getLanguageVariant(scriptKind);
                this.sourceFile.isDeclarationFile = fileExtensionIs(this.sourceFile.fileName, ".d.ts");
                this.sourceFile.scriptKind = scriptKind;
                return this.sourceFile;
            }
            setContextFlag(val, boolean, flag, Nodes.NodeFlags);
            {
                if (val) {
                    this.contextFlags |= flag;
                }
                else {
                    this.contextFlags &= ~flag;
                }
            }
            setDisallowInContext(val, boolean);
            {
                this.setContextFlag(val, Nodes.NodeFlags.DisallowInContext);
            }
            setYieldContext(val, boolean);
            {
                this.setContextFlag(val, Nodes.NodeFlags.YieldContext);
            }
            setDecoratorContext(val, boolean);
            {
                this.setContextFlag(val, Nodes.NodeFlags.DecoratorContext);
            }
            setAwaitContext(val, boolean);
            {
                this.setContextFlag(val, Nodes.NodeFlags.AwaitContext);
            }
            doOutsideOfContext(context, Nodes.NodeFlags, func, function () { return T; });
            T;
            {
                // contextFlagsToClear will contain only the context flags that are
                // currently set that we need to temporarily clear
                // Nodes.We don't just blindly reset to the previous flags to ensure
                // that we do not mutate cached flags for the incremental
                // parser (Nodes.ThisNodeHasError, Nodes.ThisNodeOrAnySubNodesHasError, and
                // Nodes.HasAggregatedChildData).
                var contextFlagsToClear = context & this.contextFlags;
                if (contextFlagsToClear) {
                    // clear the requested context flags
                    this.setContextFlag(/*val*/ false, contextFlagsToClear);
                    var ;
                    this.result = func();
                    // restore the context flags we just cleared
                    this.setContextFlag(/*val*/ true, contextFlagsToClear);
                    return this.result;
                }
                // no need to do anything special as we are not in any of the requested contexts
                return func();
            }
            doInsideOfContext(context, Nodes.NodeFlags, func, function () { return T; });
            T;
            {
                // contextFlagsToSet will contain only the context flags that
                // are not currently set that we need to temporarily enable.
                // Nodes.We don't just blindly reset to the previous flags to ensure
                // that we do not mutate cached flags for the incremental
                // parser (Nodes.ThisNodeHasError, Nodes.ThisNodeOrAnySubNodesHasError, and
                // Nodes.HasAggregatedChildData).
                var contextFlagsToSet = context & ~this.contextFlags;
                if (contextFlagsToSet) {
                    // set the requested context flags
                    this.setContextFlag(/*val*/ true, contextFlagsToSet);
                    var ;
                    this.result = func();
                    // reset the context flags we just set
                    this.setContextFlag(/*val*/ false, contextFlagsToSet);
                    return this.result;
                }
                // no need to do anything special as we are already in all of the requested contexts
                return func();
            }
            allowInAnd(func, function () { return T; });
            T;
            {
                return this.doOutsideOfContext(Nodes.NodeFlags.DisallowInContext, func);
            }
            disallowInAnd(func, function () { return T; });
            T;
            {
                return this.doInsideOfContext(Nodes.NodeFlags.DisallowInContext, func);
            }
            doInYieldContext(func, function () { return T; });
            T;
            {
                return this.doInsideOfContext(Nodes.NodeFlags.YieldContext, func);
            }
            doInDecoratorContext(func, function () { return T; });
            T;
            {
                return this.doInsideOfContext(Nodes.NodeFlags.DecoratorContext, func);
            }
            doInAwaitContext(func, function () { return T; });
            T;
            {
                return this.doInsideOfContext(Nodes.NodeFlags.AwaitContext, func);
            }
            doOutsideOfAwaitContext(func, function () { return T; });
            T;
            {
                return this.doOutsideOfContext(Nodes.NodeFlags.AwaitContext, func);
            }
            doInYieldAndAwaitContext(func, function () { return T; });
            T;
            {
                return this.doInsideOfContext(Nodes.NodeFlags.YieldContext | Nodes.NodeFlags.AwaitContext, func);
            }
            inContext(flags, Nodes.NodeFlags);
            {
                return (this.contextFlags & flags) !== 0;
            }
            inYieldContext();
            {
                return this.inContext(Nodes.NodeFlags.YieldContext);
            }
            inDisallowInContext();
            {
                return this.inContext(Nodes.NodeFlags.DisallowInContext);
            }
            inDecoratorContext();
            {
                return this.inContext(Nodes.NodeFlags.DecoratorContext);
            }
            inAwaitContext();
            {
                return this.inContext(Nodes.NodeFlags.AwaitContext);
            }
            parseErrorAtCurrentToken(message, Nodes.DiagnosticMessage, arg0 ?  : any);
            void {
                const: start = this.scanner.getTokenPos(),
                const: length = this.scanner.getTextPos() - start,
                this: .parseErrorAtPosition(start, length, message, arg0)
            };
            parseErrorAtPosition(start, number, length, number, message, Nodes.DiagnosticMessage, arg0 ?  : any);
            void {
                // Nodes.Don't report another error if it would just be at the same position as the last error.
                const: lastError = lastOrUndefined(this.parseDiagnostics),
                if: function () { } };
            !lastError || start !== lastError.start;
            {
                this.parseDiagnostics.push(createFileDiagnostic(this.sourceFile, start, length, message, arg0));
            }
            // Nodes.Mark that we've encountered an error.  Nodes.We'll set an appropriate bit on the next
            // node we finish so that it can't be reused incrementally.
            this.parseErrorBeforeNextFinishedNode = true;
        })(Parser = Nodes.Parser || (Nodes.Parser = {}));
    })(Nodes || (Nodes = {}));
    scanError(message, Nodes.DiagnosticMessage, length ?  : number);
    {
        var pos = this.scanner.getTextPos();
        this.parseErrorAtPosition(pos, length || 0, message);
    }
    getNodePos();
    number;
    {
        return this.scanner.getStartPos();
    }
    getNodeEnd();
    number;
    {
        return this.scanner.getStartPos();
    }
    nextToken();
    TokenType;
    {
        return this.token = this.scanner.scan();
    }
    reScanGreaterToken();
    TokenType;
    {
        return this.token = this.scanner.reScanGreaterToken();
    }
    reScanSlashToken();
    TokenType;
    {
        return this.token = this.scanner.reScanSlashToken();
    }
    reScanTemplateToken();
    TokenType;
    {
        return this.token = this.scanner.reScanTemplateToken();
    }
    scanJsxIdentifier();
    TokenType;
    {
        return this.token = this.scanner.scanJsxIdentifier();
    }
    scanJsxText();
    TokenType;
    {
        return this.token = this.scanner.scanJsxToken();
    }
    speculationHelper(callback, function () { return T; }, isLookAhead, boolean);
    T;
    {
        // Nodes.Keep track of the state we'll need to rollback to if lookahead fails (or if the
        // caller asked us to always reset our state).
        var saveToken = this.token;
        var saveParseDiagnosticsLength = this.parseDiagnostics.length;
        var saveParseErrorBeforeNextFinishedNode = this.parseErrorBeforeNextFinishedNode;
        // Nodes.Note: it is not actually necessary to save/restore the context flags here.  Nodes.That's
        // because the saving/restoring of these flags happens naturally through the recursive
        // descent nature of our parser.  Nodes.However, we still store this here just so we can
        // assert that that invariant holds.
        var saveContextFlags = this.contextFlags;
        // Nodes.If we're only looking ahead, then tell the this.scanner to only lookahead as well.
        // Nodes.Otherwise, if we're actually speculatively parsing, then tell the this.scanner to do the
        // same.
        var ;
        this.result = isLookAhead
            ? this.scanner.lookAhead(callback)
            : this.scanner.tryScan(callback);
        console.assert(saveContextFlags === this.contextFlags);
        // Nodes.If our callback returned something 'falsy' or we're just looking ahead,
        // then unconditionally restore us to where we were.
        if (!this.result || isLookAhead) {
            this.token = saveToken;
            this.parseDiagnostics.length = saveParseDiagnosticsLength;
            this.parseErrorBeforeNextFinishedNode = saveParseErrorBeforeNextFinishedNode;
        }
        return this.result;
    }
    lookAhead(callback, function () { return T; });
    T;
    {
        return this.speculationHelper(callback, /*isLookAhead*/ true);
    }
    tryParse(callback, function () { return T; });
    T;
    {
        return this.speculationHelper(callback, /*isLookAhead*/ false);
    }
    isIdentifier();
    boolean;
    {
        if (this.token === TokenType.Identifier) {
            return true;
        }
        // Nodes.If we have a 'yield' keyword, and we're in the [yield] context, then 'yield' is
        // considered a keyword and is not an identifier.
        if (this.token === TokenType.yield && this.inYieldContext()) {
            return false;
        }
        // Nodes.If we have a 'await' keyword, and we're in the [Nodes.Await] context, then 'await' is
        // considered a keyword and is not an identifier.
        if (this.token === TokenType.await && this.inAwaitContext()) {
            return false;
        }
        return this.token > TokenType.LastReservedWord;
    }
    parseExpected(kind, TokenType, diagnosticMessage ?  : Nodes.DiagnosticMessage, shouldAdvance = true);
    boolean;
    {
        if (this.token === kind) {
            if (shouldAdvance) {
                this.nextToken();
            }
            return true;
        }
        // Nodes.Report specific message if provided with one.  Nodes.Otherwise, report generic fallback message.
        if (diagnosticMessage) {
            this.parseErrorAtCurrentToken(diagnosticMessage);
        }
        else {
            this.parseErrorAtCurrentToken(Nodes.Diagnostics._0_expected, tokenToString(kind));
        }
        return false;
    }
    parseOptional(t, TokenType);
    boolean;
    {
        if (this.token === t) {
            this.nextToken();
            return true;
        }
        return false;
    }
    parseOptionalToken(t, TokenType);
    Nodes.Node;
    {
        if (this.token === t) {
            return this.parseTokenNode();
        }
        return undefined;
    }
    parseExpectedToken(t, TokenType, reportAtCurrentPosition, boolean, diagnosticMessage, Nodes.DiagnosticMessage, arg0 ?  : any);
    Nodes.Node;
    {
        return this.parseOptionalToken(t) ||
            this.createMissingNode(t, reportAtCurrentPosition, diagnosticMessage, arg0);
    }
    parseTokenNode();
    T;
    {
        var node = this.createNode(this.token);
        this.nextToken();
        return this.finishNode(node);
    }
    canParseSemicolon();
    {
        // Nodes.If there's a real semicolon, then we can always parse it out.
        if (this.token === TokenType.semicolon) {
            return true;
        }
        // Nodes.We can parse out an optional semicolon in Nodes.ASI cases in the following cases.
        return this.token === TokenType.closeBrace || this.token === TokenType.endOfFile || this.scanner.hasPrecedingLineBreak();
    }
    parseSemicolon();
    boolean;
    {
        if (this.canParseSemicolon()) {
            if (this.token === TokenType.semicolon) {
                // consume the semicolon if it was explicitly provided.
                this.nextToken();
            }
            return true;
        }
        else {
            return this.parseExpected(TokenType.semicolon);
        }
    }
    createNode(kind, TokenType, pos ?  : number);
    Nodes.Node;
    {
        this.nodeCount++;
        if (!(pos >= 0)) {
            pos = this.scanner.getStartPos();
        }
        return new this.NodeConstructor(kind, pos, pos);
    }
    finishNode(node, T, end ?  : number);
    T;
    {
        node.end = end === undefined ? this.scanner.getStartPos() : end;
        if (this.contextFlags) {
            node.flags |= this.contextFlags;
        }
        // Nodes.Keep track on the node if we encountered an error while parsing it.  Nodes.If we did, then
        // we cannot reuse the node incrementally.  Nodes.Once we've marked this node, clear out the
        // flag so that we don't mark any subsequent nodes.
        if (this.parseErrorBeforeNextFinishedNode) {
            this.parseErrorBeforeNextFinishedNode = false;
            node.flags |= Nodes.NodeFlags.ThisNodeHasError;
        }
        return node;
    }
    createMissingNode(kind, TokenType, reportAtCurrentPosition, boolean, diagnosticMessage, Nodes.DiagnosticMessage, arg0 ?  : any);
    Nodes.Node;
    {
        if (reportAtCurrentPosition) {
            this.parseErrorAtPosition(this.scanner.getStartPos(), 0, diagnosticMessage, arg0);
        }
        else {
            this.parseErrorAtCurrentToken(diagnosticMessage, arg0);
        }
        var ;
        this.result = this.createNode(kind, this.scanner.getStartPos());
        this.result.text = "";
        return this.finishNode(this.result);
    }
    internIdentifier(text, string);
    string;
    {
        text = escapeIdentifier(text);
        return hasProperty(this.identifiers, text) ? this.identifiers[text] : (this.identifiers[text] = text);
    }
    createIdentifier(this.isIdentifier, boolean, diagnosticMessage ?  : Nodes.DiagnosticMessage);
    Nodes.Identifier;
    {
        this.identifierCount++;
        if (this.isIdentifier) {
            var node = this.createNode(TokenType.Identifier);
            // Nodes.Store original this.token kind if it is not just an Nodes.Identifier so we can report appropriate error later in type checker
            if (this.token !== TokenType.Identifier) {
                node.originalKeywordKind = this.token;
            }
            node.text = this.internIdentifier(this.scanner.getTokenValue());
            this.nextToken();
            return this.finishNode(node);
        }
        return this.createMissingNode(TokenType.Identifier, /*reportAtCurrentPosition*/ false, diagnosticMessage || Nodes.Diagnostics.Identifier_expected);
    }
    parseIdentifier(diagnosticMessage ?  : Nodes.DiagnosticMessage);
    Nodes.Identifier;
    {
        return this.createIdentifier(this.isIdentifier(), diagnosticMessage);
    }
    parseIdentifierName();
    Nodes.Identifier;
    {
        return this.createIdentifier(tokenIsIdentifierOrKeyword(this.token));
    }
    isLiteralPropertyName();
    boolean;
    {
        return tokenIsIdentifierOrKeyword(this.token) ||
            this.token === TokenType.StringLiteral ||
            this.token === TokenType.NumericLiteral;
    }
    parsePropertyNameWorker(allowComputedPropertyNames, boolean);
    Nodes.PropertyName;
    {
        if (this.token === TokenType.StringLiteral || this.token === TokenType.NumericLiteral) {
            return this.parseLiteralNode(/*internName*/ true);
        }
        if (allowComputedPropertyNames && this.token === TokenType.openBracket) {
            return this.parseComputedPropertyName();
        }
        return this.parseIdentifierName();
    }
    parsePropertyName();
    Nodes.PropertyName;
    {
        return this.parsePropertyNameWorker(/*allowComputedPropertyNames*/ true);
    }
    parseSimplePropertyName();
    Nodes.Identifier | Nodes.LiteralExpression;
    {
        return this.parsePropertyNameWorker(/*allowComputedPropertyNames*/ false);
    }
    isSimplePropertyName();
    {
        return this.token === TokenType.StringLiteral || this.token === TokenType.NumericLiteral || tokenIsIdentifierOrKeyword(this.token);
    }
    parseComputedPropertyName();
    Nodes.ComputedPropertyName;
    {
        // Nodes.PropertyName [Nodes.Yield]:
        //      Nodes.LiteralPropertyName
        //      Nodes.ComputedPropertyName[?Nodes.Yield]
        var node = this.createNode(TokenType.ComputedPropertyName);
        this.parseExpected(TokenType.openBracket);
        // Nodes.We parse any expression (including a comma expression). Nodes.But the grammar
        // says that only an assignment expression is allowed, so the grammar checker
        // will error if it sees a comma expression.
        node.expression = this.allowInAnd(this.parseExpression);
        this.parseExpected(TokenType.closeBracket);
        return this.finishNode(node);
    }
    parseContextualModifier(t, TokenType);
    boolean;
    {
        return this.token === t && this.tryParse(this.nextTokenCanFollowModifier);
    }
    nextTokenIsOnSameLineAndCanFollowModifier();
    {
        this.nextToken();
        if (this.scanner.hasPrecedingLineBreak()) {
            return false;
        }
        return this.canFollowModifier();
    }
    nextTokenCanFollowModifier();
    {
        if (this.token === TokenType.const) {
            // 'const' is only a modifier if followed by 'this.enum'.
            return this.nextToken() === TokenType.enum;
        }
        if (this.token === TokenType.export) {
            this.nextToken();
            if (this.token === TokenType.default) {
                return this.lookAhead(this.nextTokenIsClassOrFunctionOrAsync);
            }
            return this.token !== TokenType.asterisk && this.token !== TokenType.as && this.token !== TokenType.openBrace && this.canFollowModifier();
        }
        if (this.token === TokenType.default) {
            return this.nextTokenIsClassOrFunctionOrAsync();
        }
        if (this.token === TokenType.static) {
            this.nextToken();
            return this.canFollowModifier();
        }
        return this.nextTokenIsOnSameLineAndCanFollowModifier();
    }
    parseAnyContextualModifier();
    boolean;
    {
        return isModifierKind(this.token) && this.tryParse(this.nextTokenCanFollowModifier);
    }
    canFollowModifier();
    boolean;
    {
        return this.token === TokenType.openBracket
            || this.token === TokenType.openBrace
            || this.token === TokenType.asterisk
            || this.token === TokenType.dotDotDot
            || this.isLiteralPropertyName();
    }
    nextTokenIsClassOrFunctionOrAsync();
    boolean;
    {
        this.nextToken();
        return this.token === TokenType.class || this.token === TokenType.function ||
            (this.token === TokenType.async && this.lookAhead(this.nextTokenIsFunctionKeywordOnSameLine));
    }
    isListElement(this.parsingContext, Nodes.ParsingContext, inErrorRecovery, boolean);
    boolean;
    {
        var node = this.currentNode(this.parsingContext);
        if (node) {
            return true;
        }
        switch (this.parsingContext) {
            case Nodes.ParsingContext.SourceElements:
            case Nodes.ParsingContext.BlockStatements:
            case Nodes.ParsingContext.SwitchClauseStatements:
                // Nodes.If we're in error recovery, then we don't want to treat ';' as an empty statement.
                // Nodes.The problem is that ';' can show up in far too many contexts, and if we see one
                // and assume it's a statement, then we may bail out inappropriately from whatever
                // we're parsing.  Nodes.For example, if we have a semicolon in the middle of a class, then
                // we really don't want to assume the class is over and we're on a statement in the
                // outer module.  Nodes.We just want to consume and move on.
                return !(this.token === TokenType.semicolon && inErrorRecovery) && this.isStartOfStatement();
            case Nodes.ParsingContext.SwitchClauses:
                return this.token === TokenType.case || this.token === TokenType.default;
            case Nodes.ParsingContext.TypeMembers:
                return this.lookAhead(this.isTypeMemberStart);
            case Nodes.ParsingContext.ClassMembers:
                // Nodes.We allow semicolons as class elements (as specified by Nodes.ES6) as long as we're
                // not in error recovery.  Nodes.If we're in error recovery, we don't want an errant
                // semicolon to be treated as a class member (since they're almost always used
                // for statements.
                return this.lookAhead(this.isClassMemberStart) || (this.token === TokenType.semicolon && !inErrorRecovery);
            case Nodes.ParsingContext.EnumMembers:
                // Nodes.Include open bracket computed properties. Nodes.This technically also lets in indexers,
                // which would be a candidate for improved error reporting.
                return this.token === TokenType.openBracket || this.isLiteralPropertyName();
            case Nodes.ParsingContext.ObjectLiteralMembers:
                return this.token === TokenType.openBracket || this.token === TokenType.asterisk || this.isLiteralPropertyName();
            case Nodes.ParsingContext.ObjectBindingElements:
                return this.token === TokenType.openBracket || this.isLiteralPropertyName();
            case Nodes.ParsingContext.HeritageClauseElement:
                // Nodes.If we see { } then only consume it as an expression if it is followed by , or {
                // Nodes.That way we won't consume the body of a class in its heritage clause.
                if (this.token === TokenType.openBrace) {
                    return this.lookAhead(this.isValidHeritageClauseObjectLiteral);
                }
                if (!inErrorRecovery) {
                    return this.isStartOfLeftHandSideExpression() && !this.isHeritageClauseExtendsOrImplementsKeyword();
                }
                else {
                    // Nodes.If we're in error recovery we tighten up what we're willing to match.
                    // Nodes.That way we don't treat something like "this" as a valid heritage clause
                    // element during recovery.
                    return this.isIdentifier() && !this.isHeritageClauseExtendsOrImplementsKeyword();
                }
            case Nodes.ParsingContext.VariableDeclarations:
                return this.isIdentifierOrPattern();
            case Nodes.ParsingContext.ArrayBindingElements:
                return this.token === TokenType.comma || this.token === TokenType.dotDotDot || this.isIdentifierOrPattern();
            case Nodes.ParsingContext.TypeParameters:
                return this.isIdentifier();
            case Nodes.ParsingContext.ArgumentExpressions:
            case Nodes.ParsingContext.ArrayLiteralMembers:
                return this.token === TokenType.comma || this.token === TokenType.dotDotDot || this.isStartOfExpression();
            case Nodes.ParsingContext.Parameters:
                return this.isStartOfParameter();
            case Nodes.ParsingContext.TypeArguments:
            case Nodes.ParsingContext.TupleElementTypes:
                return this.token === TokenType.comma || this.isStartOfType();
            case Nodes.ParsingContext.HeritageClauses:
                return this.isHeritageClause();
            case Nodes.ParsingContext.ImportOrExportSpecifiers:
                return tokenIsIdentifierOrKeyword(this.token);
            case Nodes.ParsingContext.JsxAttributes:
                return tokenIsIdentifierOrKeyword(this.token) || this.token === TokenType.openBrace;
            case Nodes.ParsingContext.JsxChildren:
                return true;
            case Nodes.ParsingContext.JSDocFunctionParameters:
            case Nodes.ParsingContext.JSDocTypeArguments:
            case Nodes.ParsingContext.JSDocTupleTypes:
                return Nodes.JSDocParser.isJSDocType();
            case Nodes.ParsingContext.JSDocRecordMembers:
                return this.isSimplePropertyName();
        }
        Nodes.Debug.fail("Nodes.Non-exhaustive case in 'this.isListElement'.");
    }
    isValidHeritageClauseObjectLiteral();
    {
        console.assert(this.token === TokenType.openBrace);
        if (this.nextToken() === TokenType.closeBrace) {
            // if we see  "extends {}" then only treat the {} as what we're extending (and not
            // the class body) if we have:
            //
            //      extends {} {
            //      extends {},
            //      extends {} extends
            //      extends {} implements
            var next = this.nextToken();
            return next === TokenType.comma || next === TokenType.openBrace || next === TokenType.extends || next === TokenType.implements;
        }
        return true;
    }
    nextTokenIsIdentifier();
    {
        this.nextToken();
        return this.isIdentifier();
    }
    nextTokenIsIdentifierOrKeyword();
    {
        this.nextToken();
        return tokenIsIdentifierOrKeyword(this.token);
    }
    isHeritageClauseExtendsOrImplementsKeyword();
    boolean;
    {
        if (this.token === TokenType.implements ||
            this.token === TokenType.extends) {
            return this.lookAhead(this.nextTokenIsStartOfExpression);
        }
        return false;
    }
    nextTokenIsStartOfExpression();
    {
        this.nextToken();
        return this.isStartOfExpression();
    }
    isListTerminator(kind, Nodes.ParsingContext);
    boolean;
    {
        if (this.token === TokenType.endOfFile) {
            // Nodes.Being at the end of the file ends all lists.
            return true;
        }
        switch (kind) {
            case Nodes.ParsingContext.BlockStatements:
            case Nodes.ParsingContext.SwitchClauses:
            case Nodes.ParsingContext.TypeMembers:
            case Nodes.ParsingContext.ClassMembers:
            case Nodes.ParsingContext.EnumMembers:
            case Nodes.ParsingContext.ObjectLiteralMembers:
            case Nodes.ParsingContext.ObjectBindingElements:
            case Nodes.ParsingContext.ImportOrExportSpecifiers:
                return this.token === TokenType.closeBrace;
            case Nodes.ParsingContext.SwitchClauseStatements:
                return this.token === TokenType.closeBrace || this.token === TokenType.case || this.token === TokenType.default;
            case Nodes.ParsingContext.HeritageClauseElement:
                return this.token === TokenType.openBrace || this.token === TokenType.extends || this.token === TokenType.implements;
            case Nodes.ParsingContext.VariableDeclarations:
                return this.isVariableDeclaratorListTerminator();
            case Nodes.ParsingContext.TypeParameters:
                // Nodes.Tokens other than '>' are here for better error recovery
                return this.token === TokenType.greaterThan || this.token === TokenType.openParen || this.token === TokenType.openBrace || this.token === TokenType.extends || this.token === TokenType.implements;
            case Nodes.ParsingContext.ArgumentExpressions:
                // Nodes.Tokens other than ')' are here for better error recovery
                return this.token === TokenType.closeParen || this.token === TokenType.semicolon;
            case Nodes.ParsingContext.ArrayLiteralMembers:
            case Nodes.ParsingContext.TupleElementTypes:
            case Nodes.ParsingContext.ArrayBindingElements:
                return this.token === TokenType.closeBracket;
            case Nodes.ParsingContext.Parameters:
                // Nodes.Tokens other than ')' and ']' (the latter for index signatures) are here for better error recovery
                return this.token === TokenType.closeParen || this.token === TokenType.closeBracket /*|| this.token === Nodes.SyntaxKind.OpenBraceToken*/;
            case Nodes.ParsingContext.TypeArguments:
                // Nodes.Tokens other than '>' are here for better error recovery
                return this.token === TokenType.greaterThan || this.token === TokenType.openParen;
            case Nodes.ParsingContext.HeritageClauses:
                return this.token === TokenType.openBrace || this.token === TokenType.closeBrace;
            case Nodes.ParsingContext.JsxAttributes:
                return this.token === TokenType.greaterThan || this.token === TokenType.slash;
            case Nodes.ParsingContext.JsxChildren:
                return this.token === TokenType.lessThan && this.lookAhead(this.nextTokenIsSlash);
            case Nodes.ParsingContext.JSDocFunctionParameters:
                return this.token === TokenType.closeParen || this.token === TokenType.colon || this.token === TokenType.closeBrace;
            case Nodes.ParsingContext.JSDocTypeArguments:
                return this.token === TokenType.greaterThan || this.token === TokenType.closeBrace;
            case Nodes.ParsingContext.JSDocTupleTypes:
                return this.token === TokenType.closeBracket || this.token === TokenType.closeBrace;
            case Nodes.ParsingContext.JSDocRecordMembers:
                return this.token === TokenType.closeBrace;
        }
    }
    isVariableDeclaratorListTerminator();
    boolean;
    {
        // Nodes.If we can consume a semicolon (either explicitly, or with Nodes.ASI), then consider us done
        // with parsing the list of  variable declarators.
        if (this.canParseSemicolon()) {
            return true;
        }
        // in the case where we're parsing the variable declarator of a 'for-in' statement, we
        // are done if we see an 'in' keyword in front of us. Nodes.Same with for-of
        if (this.isInOrOfKeyword(this.token)) {
            return true;
        }
        // Nodes.ERROR Nodes.RECOVERY Nodes.TWEAK:
        // Nodes.For better error recovery, if we see an '=>' then we just stop immediately.  Nodes.We've got an
        // arrow function here and it's going to be very unlikely that we'll resynchronize and get
        // another variable declaration.
        if (this.token === TokenType.equalsGreaterThan) {
            return true;
        }
        // Nodes.Keep trying to parse out variable declarators.
        return false;
    }
    isInSomeParsingContext();
    boolean;
    {
        for (var kind = 0; kind < Nodes.ParsingContext.Count; kind++) {
            if (this.parsingContext & (1 << kind)) {
                if (this.isListElement(kind, /*inErrorRecovery*/ true) || this.isListTerminator(kind)) {
                    return true;
                }
            }
        }
        return false;
    }
    parseList(kind, Nodes.ParsingContext, parseElement, function () { return T; });
    Nodes.NodeList < T > {
        const: saveParsingContext = this.parsingContext,
        this: .parsingContext |= 1 << kind,
        const: this.result = [],
        this: .result.pos = this.getNodePos(),
        while: function () { } };
    !this.isListTerminator(kind);
    {
        if (this.isListElement(kind, /*inErrorRecovery*/ false)) {
            var element = this.parseListElement(kind, parseElement);
            this.result.push(element);
            continue;
        }
        if (this.abortParsingListOrMoveToNextToken(kind)) {
            break;
        }
    }
    this.result.end = this.getNodeEnd();
    this.parsingContext = saveParsingContext;
    return this.result;
})(ts || (ts = {}));
parseListElement(this.parsingContext, Nodes.ParsingContext, parseElement, function () { return T; });
T;
{
    var node = this.currentNode(this.parsingContext);
    if (node) {
        return this.consumeNode(node);
    }
    return parseElement();
}
currentNode(this.parsingContext, Nodes.ParsingContext);
Nodes.Node;
{
    // Nodes.If there is an outstanding parse error that we've encountered, but not attached to
    // some node, then we cannot get a node from the old source tree.  Nodes.This is because we
    // want to mark the next node we encounter as being unusable.
    //
    // Nodes.Note: Nodes.This may be too conservative.  Nodes.Perhaps we could reuse the node and set the bit
    // on it (or its leftmost child) as having the error.  Nodes.For now though, being conservative
    // is nice and likely won't ever affect perf.
    if (this.parseErrorBeforeNextFinishedNode) {
        return undefined;
    }
    if (!this.syntaxCursor) {
        // if we don't have a cursor, we could never return a node from the old tree.
        return undefined;
    }
    var node = this.syntaxCursor.currentNode(this.scanner.getStartPos());
    // Nodes.Can't reuse a missing node.
    if (nodeIsMissing(node)) {
        return undefined;
    }
    // Nodes.Can't reuse a node that intersected the change range.
    if (node.intersectsChange) {
        return undefined;
    }
    // Nodes.Can't reuse a node that contains a parse error.  Nodes.This is necessary so that we
    // produce the same set of errors again.
    if (containsParseError(node)) {
        return undefined;
    }
    // Nodes.We can only reuse a node if it was parsed under the same strict mode that we're
    // currently in.  i.e. if we originally parsed a node in non-strict mode, but then
    // the user added 'using strict' at the top of the file, then we can't use that node
    // again as the presence of strict mode may cause us to parse the tokens in the file
    // differently.
    //
    // Nodes.Note: we *can* reuse tokens when the strict mode changes.  Nodes.That's because tokens
    // are unaffected by strict mode.  Nodes.It's just the parser will decide what to do with it
    // differently depending on what mode it is in.
    //
    // Nodes.This also applies to all our other context flags as well.
    var nodeContextFlags = node.flags & Nodes.NodeFlags.ContextFlags;
    if (nodeContextFlags !== this.contextFlags) {
        return undefined;
    }
    // Nodes.Ok, we have a node that looks like it could be reused.  Nodes.Now verify that it is valid
    // in the current list parsing context that we're currently at.
    if (!this.canReuseNode(node, this.parsingContext)) {
        return undefined;
    }
    return node;
}
consumeNode(node, Nodes.Node);
{
    // Nodes.Move the this.scanner so it is after the node we just consumed.
    this.scanner.setTextPos(node.end);
    this.nextToken();
    return node;
}
canReuseNode(node, Nodes.Node, this.parsingContext, Nodes.ParsingContext);
boolean;
{
    switch (this.parsingContext) {
        case Nodes.ParsingContext.ClassMembers:
            return this.isReusableClassMember(node);
        case Nodes.ParsingContext.SwitchClauses:
            return this.isReusableSwitchClause(node);
        case Nodes.ParsingContext.SourceElements:
        case Nodes.ParsingContext.BlockStatements:
        case Nodes.ParsingContext.SwitchClauseStatements:
            return this.isReusableStatement(node);
        case Nodes.ParsingContext.EnumMembers:
            return this.isReusableEnumMember(node);
        case Nodes.ParsingContext.TypeMembers:
            return this.isReusableTypeMember(node);
        case Nodes.ParsingContext.VariableDeclarations:
            return this.isReusableVariableDeclaration(node);
        case Nodes.ParsingContext.Parameters:
            return this.isReusableParameter(node);
        // Nodes.Any other lists we do not care about reusing nodes in.  Nodes.But feel free to add if
        // you can do so safely.  Nodes.Danger areas involve nodes that may involve speculative
        // parsing.  Nodes.If speculative parsing is involved with the node, then the range the
        // parser reached while looking ahead might be in the edited range (see the example
        // in canReuseVariableDeclaratorNode for a good case of this).
        case Nodes.ParsingContext.HeritageClauses:
        // Nodes.This would probably be safe to reuse.  Nodes.There is no speculative parsing with
        // heritage clauses.
        case Nodes.ParsingContext.TypeParameters:
        // Nodes.This would probably be safe to reuse.  Nodes.There is no speculative parsing with
        // type parameters.  Nodes.Note that that's because type *parameters* only occur in
        // unambiguous *type* contexts.  Nodes.While type *arguments* occur in very ambiguous
        // *expression* contexts.
        case Nodes.ParsingContext.TupleElementTypes:
        // Nodes.This would probably be safe to reuse.  Nodes.There is no speculative parsing with
        // tuple types.
        // Nodes.Technically, type argument list types are probably safe to reuse.  Nodes.While
        // speculative parsing is involved with them (since type argument lists are only
        // produced from speculative parsing a < as a type argument list), we only have
        // the types because speculative parsing succeeded.  Nodes.Thus, the lookahead never
        // went past the end of the list and rewound.
        case Nodes.ParsingContext.TypeArguments:
        // Nodes.Note: these are almost certainly not safe to ever reuse.  Nodes.Expressions commonly
        // need a large amount of lookahead, and we should not reuse them as they may
        // have actually intersected the edit.
        case Nodes.ParsingContext.ArgumentExpressions:
        // Nodes.This is not safe to reuse for the same reason as the 'Nodes.AssignmentExpression'
        // cases.  i.e. a property assignment may end with an expression, and thus might
        // have lookahead far beyond it's old node.
        case Nodes.ParsingContext.ObjectLiteralMembers:
        // Nodes.This is probably not safe to reuse.  Nodes.There can be speculative parsing with
        // type names in a heritage clause.  Nodes.There can be generic names in the type
        // name list, and there can be left hand side expressions (which can have type
        // arguments.)
        case Nodes.ParsingContext.HeritageClauseElement:
        // Nodes.Perhaps safe to reuse, but it's unlikely we'd see more than a dozen attributes
        // on any given element. Nodes.Same for children.
        case Nodes.ParsingContext.JsxAttributes:
        case Nodes.ParsingContext.JsxChildren:
    }
    return false;
}
isReusableClassMember(node, Nodes.Node);
{
    if (node) {
        switch (node.kind) {
            case TokenType.Constructor:
            case TokenType.IndexSignature:
            case TokenType.GetAccessor:
            case TokenType.SetAccessor:
            case TokenType.PropertyDeclaration:
            case TokenType.SemicolonClassElement:
                return true;
            case TokenType.MethodDeclaration:
                // Nodes.Method declarations are not necessarily reusable.  Nodes.An object-literal
                // may have a method calls "constructor(...)" and we must reparse that
                // into an actual .ConstructorDeclaration.
                var methodDeclaration = node;
                var nameIsConstructor = methodDeclaration.name.kind === TokenType.Identifier &&
                    methodDeclaration.name.originalKeywordKind === TokenType.constructor;
                return !nameIsConstructor;
        }
    }
    return false;
}
isReusableSwitchClause(node, Nodes.Node);
{
    if (node) {
        switch (node.kind) {
            case TokenType.CaseClause:
            case TokenType.DefaultClause:
                return true;
        }
    }
    return false;
}
isReusableStatement(node, Nodes.Node);
{
    if (node) {
        switch (node.kind) {
            case TokenType.FunctionDeclaration:
            case TokenType.VariableStatement:
            case TokenType.Block:
            case TokenType.IfStatement:
            case TokenType.ExpressionStatement:
            case TokenType.ThrowStatement:
            case TokenType.ReturnStatement:
            case TokenType.SwitchStatement:
            case TokenType.BreakStatement:
            case TokenType.ContinueStatement:
            case TokenType.ForInStatement:
            case TokenType.ForOfStatement:
            case TokenType.ForStatement:
            case TokenType.WhileStatement:
            case TokenType.WithStatement:
            case TokenType.EmptyStatement:
            case TokenType.TryStatement:
            case TokenType.LabeledStatement:
            case TokenType.DoStatement:
            case TokenType.DebuggerStatement:
            case TokenType.ImportDeclaration:
            case TokenType.ImportEqualsDeclaration:
            case TokenType.ExportDeclaration:
            case TokenType.ExportAssignment:
            case TokenType.ModuleDeclaration:
            case TokenType.ClassDeclaration:
            case TokenType.InterfaceDeclaration:
            case TokenType.EnumDeclaration:
            case TokenType.TypeAliasDeclaration:
                return true;
        }
    }
    return false;
}
isReusableEnumMember(node, Nodes.Node);
{
    return node.kind === TokenType.EnumMember;
}
isReusableTypeMember(node, Nodes.Node);
{
    if (node) {
        switch (node.kind) {
            case TokenType.ConstructSignature:
            case TokenType.MethodSignature:
            case TokenType.IndexSignature:
            case TokenType.PropertySignature:
            case TokenType.CallSignature:
                return true;
        }
    }
    return false;
}
isReusableVariableDeclaration(node, Nodes.Node);
{
    if (node.kind !== TokenType.VariableDeclaration) {
        return false;
    }
    // Nodes.Very subtle incremental parsing bug.  Nodes.Consider the following code:
    //
    //      let v = new Nodes.List < A, B
    //
    // Nodes.This is actually legal code.  Nodes.It's a list of variable declarators "v = new Nodes.List<A"
    // on one side and "B" on the other. Nodes.If you then change that to:
    //
    //      let v = new Nodes.List < A, B >()
    //
    // then we have a problem.  "v = new Nodes.List<A" doesn't intersect the change range, so we
    // start reparsing at "B" and we completely fail to handle this properly.
    //
    // Nodes.In order to prevent this, we do not allow a variable declarator to be reused if it
    // has an initializer.
    var variableDeclarator = node;
    return variableDeclarator.initializer === undefined;
}
isReusableParameter(node, Nodes.Node);
{
    if (node.kind !== TokenType.Parameter) {
        return false;
    }
    // Nodes.See the comment in this.isReusableVariableDeclaration for why we do this.
    var parameter = node;
    return parameter.initializer === undefined;
}
abortParsingListOrMoveToNextToken(kind, Nodes.ParsingContext);
{
    this.parseErrorAtCurrentToken(this.parsingContextErrors(kind));
    if (this.isInSomeParsingContext()) {
        return true;
    }
    this.nextToken();
    return false;
}
parsingContextErrors(context, Nodes.ParsingContext);
Nodes.DiagnosticMessage;
{
    switch (context) {
        case Nodes.ParsingContext.SourceElements: return Nodes.Diagnostics.Declaration_or_statement_expected;
        case Nodes.ParsingContext.BlockStatements: return Nodes.Diagnostics.Declaration_or_statement_expected;
        case Nodes.ParsingContext.SwitchClauses: return Nodes.Diagnostics.case_or_default_expected;
        case Nodes.ParsingContext.SwitchClauseStatements: return Nodes.Diagnostics.Statement_expected;
        case Nodes.ParsingContext.TypeMembers: return Nodes.Diagnostics.Property_or_signature_expected;
        case Nodes.ParsingContext.ClassMembers: return Nodes.Diagnostics.Unexpected_token_A_constructor_method_accessor_or_property_was_expected;
        case Nodes.ParsingContext.EnumMembers: return Nodes.Diagnostics.Enum_member_expected;
        case Nodes.ParsingContext.HeritageClauseElement: return Nodes.Diagnostics.Expression_expected;
        case Nodes.ParsingContext.VariableDeclarations: return Nodes.Diagnostics.Variable_declaration_expected;
        case Nodes.ParsingContext.ObjectBindingElements: return Nodes.Diagnostics.Property_destructuring_pattern_expected;
        case Nodes.ParsingContext.ArrayBindingElements: return Nodes.Diagnostics.Array_element_destructuring_pattern_expected;
        case Nodes.ParsingContext.ArgumentExpressions: return Nodes.Diagnostics.Argument_expression_expected;
        case Nodes.ParsingContext.ObjectLiteralMembers: return Nodes.Diagnostics.Property_assignment_expected;
        case Nodes.ParsingContext.ArrayLiteralMembers: return Nodes.Diagnostics.Expression_or_comma_expected;
        case Nodes.ParsingContext.Parameters: return Nodes.Diagnostics.Parameter_declaration_expected;
        case Nodes.ParsingContext.TypeParameters: return Nodes.Diagnostics.Type_parameter_declaration_expected;
        case Nodes.ParsingContext.TypeArguments: return Nodes.Diagnostics.Type_argument_expected;
        case Nodes.ParsingContext.TupleElementTypes: return Nodes.Diagnostics.Type_expected;
        case Nodes.ParsingContext.HeritageClauses: return Nodes.Diagnostics.Unexpected_token_expected;
        case Nodes.ParsingContext.ImportOrExportSpecifiers: return Nodes.Diagnostics.Identifier_expected;
        case Nodes.ParsingContext.JsxAttributes: return Nodes.Diagnostics.Identifier_expected;
        case Nodes.ParsingContext.JsxChildren: return Nodes.Diagnostics.Identifier_expected;
        case Nodes.ParsingContext.JSDocFunctionParameters: return Nodes.Diagnostics.Parameter_declaration_expected;
        case Nodes.ParsingContext.JSDocTypeArguments: return Nodes.Diagnostics.Type_argument_expected;
        case Nodes.ParsingContext.JSDocTupleTypes: return Nodes.Diagnostics.Type_expected;
        case Nodes.ParsingContext.JSDocRecordMembers: return Nodes.Diagnostics.Property_assignment_expected;
    }
}
;
parseDelimitedList(kind, Nodes.ParsingContext, parseElement, function () { return T; }, considerSemicolonAsDelimiter ?  : boolean);
Nodes.NodeList < T > {
    const: saveParsingContext = this.parsingContext,
    this: .parsingContext |= 1 << kind,
    const: this.result = [],
    this: .result.pos = this.getNodePos(),
    let: commaStart = -1,
    while: function () { }, true:  };
{
    if (this.isListElement(kind, /*inErrorRecovery*/ false)) {
        this.result.push(this.parseListElement(kind, parseElement));
        commaStart = this.scanner.getTokenPos();
        if (this.parseOptional(TokenType.comma)) {
            continue;
        }
        commaStart = -1; // Nodes.Back to the state where the last this.token was not a comma
        if (this.isListTerminator(kind)) {
            break;
        }
        // Nodes.We didn't get a comma, and the list wasn't terminated, explicitly parse
        // out a comma so we give a good error message.
        this.parseExpected(TokenType.comma);
        // Nodes.If the this.token was a semicolon, and the caller allows that, then skip it and
        // continue.  Nodes.This ensures we get back on track and don't this.result in tons of
        // parse errors.  Nodes.For example, this can happen when people do things like use
        // a semicolon to delimit object literal members.   Nodes.Note: we'll have already
        // reported an error when we called this.parseExpected above.
        if (considerSemicolonAsDelimiter && this.token === TokenType.semicolon && !this.scanner.hasPrecedingLineBreak()) {
            this.nextToken();
        }
        continue;
    }
    if (this.isListTerminator(kind)) {
        break;
    }
    if (this.abortParsingListOrMoveToNextToken(kind)) {
        break;
    }
}
// Nodes.Recording the trailing comma is deliberately done after the previous
// loop, and not just if we see a list terminator. Nodes.This is because the list
// may have ended incorrectly, but it is still important to know if there
// was a trailing comma.
// Nodes.Check if the last this.token was a comma.
if (commaStart >= 0) {
    // Nodes.Always preserve a trailing comma by marking it on the Nodes.NodeList
    this.result.hasTrailingComma = true;
}
this.result.end = this.getNodeEnd();
this.parsingContext = saveParsingContext;
return this.result;
createMissingList();
Nodes.NodeList < T > {
    const: pos = this.getNodePos(),
    const: this.result = [],
    this: .result.pos = pos,
    this: .result.end = pos,
    return: this.result
};
parseBracketedList(kind, Nodes.ParsingContext, parseElement, function () { return T; }, open, TokenType, close, TokenType);
Nodes.NodeList < T > {
    if: function () { }, this: .parseExpected(open) };
{
    var ;
    this.result = this.parseDelimitedList(kind, parseElement);
    this.parseExpected(close);
    return this.result;
}
return this.createMissingList();
parseEntityName(allowReservedWords, boolean, diagnosticMessage ?  : Nodes.DiagnosticMessage);
Nodes.EntityName;
{
    var entity = this.parseIdentifier(diagnosticMessage);
    while (this.parseOptional(TokenType.dot)) {
        var node = this.createNode(TokenType.QualifiedName, entity.pos); // !!!
        node.left = entity;
        node.right = this.parseRightSideOfDot(allowReservedWords);
        entity = this.finishNode(node);
    }
    return entity;
}
parseRightSideOfDot(allowIdentifierNames, boolean);
Nodes.Identifier;
{
    // Nodes.Technically a keyword is valid here as all this.identifiers and keywords are identifier names.
    // Nodes.However, often we'll encounter this in error situations when the identifier or keyword
    // is actually starting another valid construct.
    //
    // Nodes.So, we check for the following specific case:
    //
    //      name.
    //      identifierOrKeyword identifierNameOrKeyword
    //
    // Nodes.Note: the newlines are important here.  Nodes.For example, if that above code
    // were rewritten into:
    //
    //      name.identifierOrKeyword
    //      identifierNameOrKeyword
    //
    // Nodes.Then we would consider it valid.  Nodes.That's because Nodes.ASI would take effect and
    // the code would be implicitly: "name.identifierOrKeyword; identifierNameOrKeyword".
    // Nodes.In the first case though, Nodes.ASI will not take effect because there is not a
    // line terminator after the identifier or keyword.
    if (this.scanner.hasPrecedingLineBreak() && tokenIsIdentifierOrKeyword(this.token)) {
        var matchesPattern = this.lookAhead(this.nextTokenIsIdentifierOrKeywordOnSameLine);
        if (matchesPattern) {
            // Nodes.Report that we need an identifier.  Nodes.However, report it right after the dot,
            // and not on the next this.token.  Nodes.This is because the next this.token might actually
            // be an identifier and the error would be quite confusing.
            return this.createMissingNode(TokenType.Identifier, /*reportAtCurrentPosition*/ true, Nodes.Diagnostics.Identifier_expected);
        }
    }
    return allowIdentifierNames ? this.parseIdentifierName() : this.parseIdentifier();
}
parseTemplateExpression();
Nodes.TemplateExpression;
{
    var template = this.createNode(TokenType.TemplateExpression);
    template.head = this.parseTemplateLiteralFragment();
    console.assert(template.head.kind === TokenType.TemplateHead, "Nodes.Template head has wrong this.token kind");
    var templateSpans = [];
    templateSpans.pos = this.getNodePos();
    do {
        templateSpans.push(this.parseTemplateSpan());
    } while (lastOrUndefined(templateSpans).literal.kind === TokenType.TemplateMiddle);
    templateSpans.end = this.getNodeEnd();
    template.templateSpans = templateSpans;
    return this.finishNode(template);
}
parseTemplateSpan();
Nodes.TemplateSpan;
{
    var span = this.createNode(TokenType.TemplateSpan);
    span.expression = this.allowInAnd(this.parseExpression);
    var literal = void 0;
    if (this.token === TokenType.closeBrace) {
        this.reScanTemplateToken();
        literal = this.parseTemplateLiteralFragment();
    }
    else {
        literal = this.parseExpectedToken(TokenType.TemplateTail, /*reportAtCurrentPosition*/ false, Nodes.Diagnostics._0_expected, tokenToString(TokenType.closeBrace));
    }
    span.literal = literal;
    return this.finishNode(span);
}
parseStringLiteralTypeNode();
Nodes.StringLiteralTypeNode;
{
    return this.parseLiteralLikeNode(TokenType.StringLiteralType, /*internName*/ true);
}
parseLiteralNode(internName ?  : boolean);
Nodes.LiteralExpression;
{
    return this.parseLiteralLikeNode(this.token, internName);
}
parseTemplateLiteralFragment();
Nodes.TemplateLiteralFragment;
{
    return this.parseLiteralLikeNode(this.token, /*internName*/ false);
}
parseLiteralLikeNode(kind, TokenType, internName, boolean);
Nodes.LiteralLikeNode;
{
    var node = this.createNode(kind);
    var text = this.scanner.getTokenValue();
    node.text = internName ? this.internIdentifier(text) : text;
    if (this.scanner.hasExtendedUnicodeEscape()) {
        node.hasExtendedUnicodeEscape = true;
    }
    if (this.scanner.isUnterminated()) {
        node.isUnterminated = true;
    }
    var tokenPos = this.scanner.getTokenPos();
    this.nextToken();
    this.finishNode(node);
    // Nodes.Octal literals are not allowed in strict mode or Nodes.ES5
    // Nodes.Note that theoretically the following condition would hold true literals like 009,
    // which is not octal.But because of how the this.scanner separates the tokens, we would
    // never get a this.token like this. Nodes.Instead, we would get 00 and 9 as two separate tokens.
    // Nodes.We also do not need to check for negatives because any prefix operator would be part of a
    // parent unary expression.
    if (node.kind === TokenType.NumericLiteral
        && this.sourceText.charCodeAt(tokenPos) === Nodes.CharCode.num0
        && isOctalDigit(this.sourceText.charCodeAt(tokenPos + 1))) {
        node.isOctalLiteral = true;
    }
    return node;
}
parseTypeReference();
Nodes.TypeReferenceNode;
{
    var typeName = this.parseEntityName(/*allowReservedWords*/ false, Nodes.Diagnostics.Type_expected);
    var node = this.createNode(TokenType.TypeReference, typeName.pos);
    node.typeName = typeName;
    if (!this.scanner.hasPrecedingLineBreak() && this.token === TokenType.lessThan) {
        node.typeArguments = this.parseBracketedList(Nodes.ParsingContext.TypeArguments, this.parseType, TokenType.lessThan, TokenType.greaterThan);
    }
    return this.finishNode(node);
}
parseThisTypePredicate(lhs, Nodes.ThisTypeNode);
Nodes.TypePredicateNode;
{
    this.nextToken();
    var node = this.createNode(TokenType.TypePredicate, lhs.pos);
    node.parameterName = lhs;
    node.type = this.parseType();
    return this.finishNode(node);
}
parseThisTypeNode();
Nodes.ThisTypeNode;
{
    var node = this.createNode(TokenType.ThisType);
    this.nextToken();
    return this.finishNode(node);
}
parseTypeQuery();
Nodes.TypeQueryNode;
{
    var node = this.createNode(TokenType.TypeQuery);
    this.parseExpected(TokenType.typeof);
    node.exprName = this.parseEntityName(/*allowReservedWords*/ true);
    return this.finishNode(node);
}
parseTypeParameter();
Nodes.TypeParameterDeclaration;
{
    var node = this.createNode(TokenType.TypeParameter);
    node.name = this.parseIdentifier();
    if (this.parseOptional(TokenType.extends)) {
        // Nodes.It's not uncommon for people to write improper constraints to a generic.  Nodes.If the
        // user writes a constraint that is an expression and not an actual type, then parse
        // it out as an expression (so we can recover well), but report that a type is needed
        // instead.
        if (this.isStartOfType() || !this.isStartOfExpression()) {
            node.constraint = this.parseType();
        }
        else {
            // Nodes.It was not a type, and it looked like an expression.  Nodes.Parse out an expression
            // here so we recover well.  Nodes.Note: it is important that we call parseUnaryExpression
            // and not this.parseExpression here.  Nodes.If the user has:
            //
            //      <T extends "">
            //
            // Nodes.We do *not* want to consume the  >  as we're consuming the expression for "".
            node.expression = this.parseUnaryExpressionOrHigher();
        }
    }
    return this.finishNode(node);
}
parseTypeParameters();
Nodes.NodeList < Nodes.TypeParameterDeclaration > {
    if: function () { }, this: .token === TokenType.lessThan };
{
    return this.parseBracketedList(Nodes.ParsingContext.TypeParameters, this.parseTypeParameter, TokenType.lessThan, TokenType.greaterThan);
}
parseParameterType();
Nodes.TypeNode;
{
    if (this.parseOptional(TokenType.colon)) {
        return this.parseType();
    }
    return undefined;
}
isStartOfParameter();
boolean;
{
    return this.token === TokenType.dotDotDot || this.isIdentifierOrPattern() || isModifierKind(this.token) || this.token === TokenType.at || this.token === TokenType.this;
}
setModifiers(node, Nodes.Node, modifiers, Nodes.ModifiersArray);
{
    if (modifiers) {
        node.flags |= modifiers.flags;
        node.modifiers = modifiers;
    }
}
parseParameter();
Nodes.ParameterDeclaration;
{
    var node = this.createNode(TokenType.Parameter);
    if (this.token === TokenType.this) {
        node.name = this.createIdentifier(/*this.isIdentifier*/ true, undefined);
        node.type = this.parseParameterType();
        return this.finishNode(node);
    }
    node.decorators = this.parseDecorators();
    this.setModifiers(node, this.parseModifiers());
    node.dotDotDotToken = this.parseOptionalToken(TokenType.dotDotDot);
    // Nodes.FormalParameter [Nodes.Yield,Nodes.Await]:
    //      Nodes.BindingElement[?Nodes.Yield,?Nodes.Await]
    node.name = this.parseIdentifierOrPattern();
    if (getFullWidth(node.name) === 0 && node.flags === 0 && isModifierKind(this.token)) {
        // in cases like
        // 'use strict'
        // function foo(static)
        // isParameter('static') === true, because of isModifier('static')
        // however 'static' is not a legal identifier in a strict mode.
        // so this.result of this function will be Nodes.ParameterDeclaration (flags = 0, name = missing, type = undefined, initializer = undefined)
        // and current this.token will not change => parsing of the enclosing parameter list will last till the end of time (or Nodes.OOM)
        // to avoid this we'll advance cursor to the next this.token.
        this.nextToken();
    }
    node.questionToken = this.parseOptionalToken(TokenType.question);
    node.type = this.parseParameterType();
    node.initializer = this.parseBindingElementInitializer(/*inParameter*/ true);
    // Nodes.Do not check for initializers in an ambient context for parameters. Nodes.This is not
    // a grammar error because the grammar allows arbitrary call signatures in
    // an ambient context.
    // Nodes.It is actually not necessary for this to be an error at all. Nodes.The reason is that
    // function/constructor implementations are syntactically disallowed in ambient
    // contexts. Nodes.In addition, parameter initializers are semantically disallowed in
    // overload signatures. Nodes.So parameter initializers are transitively disallowed in
    // ambient contexts.
    return this.addJSDocComment(this.finishNode(node));
}
parseBindingElementInitializer(inParameter, boolean);
{
    return inParameter ? this.parseParameterInitializer() : this.parseNonParameterInitializer();
}
parseParameterInitializer();
{
    return this.parseInitializer(/*inParameter*/ true);
}
fillSignature(returnToken, TokenType, yieldContext, boolean, awaitContext, boolean, requireCompleteParameterList, boolean, signature, Nodes.SignatureDeclaration);
void {
    const: returnTokenRequired = returnToken === TokenType.equalsGreaterThan,
    signature: .typeParameters = this.parseTypeParameters(),
    signature: .parameters = this.parseParameterList(yieldContext, awaitContext, requireCompleteParameterList),
    if: function (returnTokenRequired) {
        this.parseExpected(returnToken);
        signature.type = this.parseTypeOrTypePredicate();
    },
    else: , if: function () { }, this: .parseOptional(returnToken) };
{
    signature.type = this.parseTypeOrTypePredicate();
}
parseParameterList(yieldContext, boolean, awaitContext, boolean, requireCompleteParameterList, boolean);
{
    // Nodes.FormalParameters [Nodes.Yield,Nodes.Await]: (modified)
    //      [empty]
    //      Nodes.FormalParameterList[?Nodes.Yield,Nodes.Await]
    //
    // Nodes.FormalParameter[Nodes.Yield,Nodes.Await]: (modified)
    //      Nodes.BindingElement[?Nodes.Yield,Nodes.Await]
    //
    // Nodes.BindingElement [Nodes.Yield,Nodes.Await]: (modified)
    //      Nodes.SingleNameBinding[?Nodes.Yield,?Nodes.Await]
    //      Nodes.BindingPattern[?Nodes.Yield,?Nodes.Await]Nodes.Initializer [Nodes.In, ?Nodes.Yield,?Nodes.Await] opt
    //
    // Nodes.SingleNameBinding [Nodes.Yield,Nodes.Await]:
    //      Nodes.BindingIdentifier[?Nodes.Yield,?Nodes.Await]Nodes.Initializer [Nodes.In, ?Nodes.Yield,?Nodes.Await] opt
    if (this.parseExpected(TokenType.openParen)) {
        var savedYieldContext = this.inYieldContext();
        var savedAwaitContext = this.inAwaitContext();
        this.setYieldContext(yieldContext);
        this.setAwaitContext(awaitContext);
        var ;
        this.result = this.parseDelimitedList(Nodes.ParsingContext.Parameters, this.parseParameter);
        this.setYieldContext(savedYieldContext);
        this.setAwaitContext(savedAwaitContext);
        if (!this.parseExpected(TokenType.closeParen) && requireCompleteParameterList) {
            // Nodes.Caller insisted that we had to end with a )   Nodes.We didn't.  Nodes.So just return
            // undefined here.
            return undefined;
        }
        return this.result;
    }
    // Nodes.We didn't even have an open paren.  Nodes.If the caller requires a complete parameter list,
    // we definitely can't provide that.  Nodes.However, if they're ok with an incomplete one,
    // then just return an empty set of parameters.
    return requireCompleteParameterList ? undefined : this.createMissingList();
}
parseTypeMemberSemicolon();
{
    // Nodes.We allow type members to be separated by commas or (possibly Nodes.ASI) semicolons.
    // Nodes.First check if it was a comma.  Nodes.If so, we're done with the member.
    if (this.parseOptional(TokenType.comma)) {
        return;
    }
    // Nodes.Didn't have a comma.  Nodes.We must have a (possible Nodes.ASI) semicolon.
    this.parseSemicolon();
}
parseSignatureMember(kind, TokenType);
Nodes.CallSignatureDeclaration | Nodes.ConstructSignatureDeclaration;
{
    var node = this.createNode(kind);
    if (kind === TokenType.ConstructSignature) {
        this.parseExpected(TokenType.new);
    }
    this.fillSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
    this.parseTypeMemberSemicolon();
    return this.finishNode(node);
}
isIndexSignature();
boolean;
{
    if (this.token !== TokenType.openBracket) {
        return false;
    }
    return this.lookAhead(this.isUnambiguouslyIndexSignature);
}
isUnambiguouslyIndexSignature();
{
    // Nodes.The only allowed sequence is:
    //
    //   [id:
    //
    // Nodes.However, for error recovery, we also check the following cases:
    //
    //   [...
    //   [id,
    //   [id?,
    //   [id?:
    //   [id?]
    //   [public id
    //   [private id
    //   [protected id
    //   []
    //
    this.nextToken();
    if (this.token === TokenType.dotDotDot || this.token === TokenType.closeBracket) {
        return true;
    }
    if (isModifierKind(this.token)) {
        this.nextToken();
        if (this.isIdentifier()) {
            return true;
        }
    }
    else if (!this.isIdentifier()) {
        return false;
    }
    else {
        // Nodes.Skip the identifier
        this.nextToken();
    }
    // A colon signifies a well formed indexer
    // A comma should be a badly formed indexer because comma expressions are not allowed
    // in computed properties.
    if (this.token === TokenType.colon || this.token === TokenType.comma) {
        return true;
    }
    // Nodes.Question mark could be an indexer with an optional property,
    // or it could be a conditional expression in a computed property.
    if (this.token !== TokenType.question) {
        return false;
    }
    // Nodes.If any of the following tokens are after the question mark, it cannot
    // be a conditional expression, so treat it as an indexer.
    this.nextToken();
    return this.token === TokenType.colon || this.token === TokenType.comma || this.token === TokenType.closeBracket;
}
parseIndexSignatureDeclaration(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray);
Nodes.IndexSignatureDeclaration;
{
    var node = this.createNode(TokenType.IndexSignature, fullStart);
    node.decorators = decorators;
    this.setModifiers(node, modifiers);
    node.parameters = this.parseBracketedList(Nodes.ParsingContext.Parameters, this.parseParameter, TokenType.openBracket, TokenType.closeBracket);
    node.type = this.parseTypeAnnotation();
    this.parseTypeMemberSemicolon();
    return this.finishNode(node);
}
parsePropertyOrMethodSignature(fullStart, number, modifiers, Nodes.ModifiersArray);
Nodes.PropertySignature | Nodes.MethodSignature;
{
    var name_1 = this.parsePropertyName();
    var questionToken = this.parseOptionalToken(TokenType.question);
    if (this.token === TokenType.openParen || this.token === TokenType.lessThan) {
        var method = this.createNode(TokenType.MethodSignature, fullStart);
        this.setModifiers(method, modifiers);
        method.name = name_1;
        method.questionToken = questionToken;
        // Nodes.Method signatures don't exist in expression contexts.  Nodes.So they have neither
        // [Nodes.Yield] nor [Nodes.Await]
        this.fillSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, method);
        this.parseTypeMemberSemicolon();
        return this.finishNode(method);
    }
    else {
        var property = this.createNode(TokenType.PropertySignature, fullStart);
        this.setModifiers(property, modifiers);
        property.name = name_1;
        property.questionToken = questionToken;
        property.type = this.parseTypeAnnotation();
        if (this.token === TokenType.equals) {
            // Nodes.Although type literal properties cannot not have initializers, we attempt
            // to parse an initializer so we can report in the checker that an interface
            // property or type literal property cannot have an initializer.
            property.initializer = this.parseNonParameterInitializer();
        }
        this.parseTypeMemberSemicolon();
        return this.finishNode(property);
    }
}
isTypeMemberStart();
boolean;
{
    var idToken = void 0;
    // Nodes.Return true if we have the start of a signature member
    if (this.token === TokenType.openParen || this.token === TokenType.lessThan) {
        return true;
    }
    // Nodes.Eat up all modifiers, but hold on to the last one in case it is actually an identifier
    while (isModifierKind(this.token)) {
        idToken = this.token;
        this.nextToken();
    }
    // Nodes.Index signatures and computed property names are type members
    if (this.token === TokenType.openBracket) {
        return true;
    }
    // Nodes.Try to get the first property-like this.token following all modifiers
    if (this.isLiteralPropertyName()) {
        idToken = this.token;
        this.nextToken();
    }
    // Nodes.If we were able to get any potential identifier, check that it is
    // the start of a member declaration
    if (idToken) {
        return this.token === TokenType.openParen ||
            this.token === TokenType.lessThan ||
            this.token === TokenType.question ||
            this.token === TokenType.colon ||
            this.canParseSemicolon();
    }
    return false;
}
parseTypeMember();
Nodes.TypeElement;
{
    if (this.token === TokenType.openParen || this.token === TokenType.lessThan) {
        return this.parseSignatureMember(TokenType.CallSignature);
    }
    if (this.token === TokenType.new && this.lookAhead(this.isStartOfConstructSignature)) {
        return this.parseSignatureMember(TokenType.ConstructSignature);
    }
    var fullStart = this.getNodePos();
    var modifiers = this.parseModifiers();
    if (this.isIndexSignature()) {
        return this.parseIndexSignatureDeclaration(fullStart, /*decorators*/ undefined, modifiers);
    }
    return this.parsePropertyOrMethodSignature(fullStart, modifiers);
}
isStartOfConstructSignature();
{
    this.nextToken();
    return this.token === TokenType.openParen || this.token === TokenType.lessThan;
}
parseTypeLiteral();
Nodes.TypeLiteralNode;
{
    var node = this.createNode(TokenType.TypeLiteral);
    node.members = this.parseObjectTypeMembers();
    return this.finishNode(node);
}
parseObjectTypeMembers();
Nodes.NodeList < Nodes.TypeElement > {
    let: members, Nodes: .NodeList(),
    if: function () { }, this: .parseExpected(TokenType.openBrace) };
{
    members = this.parseList(Nodes.ParsingContext.TypeMembers, this.parseTypeMember);
    this.parseExpected(TokenType.closeBrace);
}
{
    members = this.createMissingList();
}
return members;
parseTupleType();
Nodes.TupleTypeNode;
{
    var node = this.createNode(TokenType.TupleType);
    node.elementTypes = this.parseBracketedList(Nodes.ParsingContext.TupleElementTypes, this.parseType, TokenType.openBracket, TokenType.closeBracket);
    return this.finishNode(node);
}
parseParenthesizedType();
Nodes.ParenthesizedTypeNode;
{
    var node = this.createNode(TokenType.ParenthesizedType);
    this.parseExpected(TokenType.openParen);
    node.type = this.parseType();
    this.parseExpected(TokenType.closeParen);
    return this.finishNode(node);
}
parseFunctionOrConstructorType(kind, TokenType);
Nodes.FunctionOrConstructorTypeNode;
{
    var node = this.createNode(kind);
    if (kind === TokenType.ConstructorType) {
        this.parseExpected(TokenType.new);
    }
    this.fillSignature(TokenType.equalsGreaterThan, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
    return this.finishNode(node);
}
parseKeywordAndNoDot();
Nodes.TypeNode;
{
    var node = this.parseTokenNode();
    return this.token === TokenType.dot ? undefined : node;
}
parseNonArrayType();
Nodes.TypeNode;
{
    switch (this.token) {
        case TokenType.any:
        case TokenType.string:
        case TokenType.number:
        case TokenType.boolean:
        case TokenType.symbol:
        case TokenType.undefined:
        case TokenType.never:
            // Nodes.If these are followed by a dot, then parse these out as a dotted type reference instead.
            var node = this.tryParse(this.parseKeywordAndNoDot);
            return node || this.parseTypeReference();
        case TokenType.StringLiteral:
            return this.parseStringLiteralTypeNode();
        case TokenType.void:
        case TokenType.null:
            return this.parseTokenNode();
        case TokenType.this: {
            var thisKeyword = this.parseThisTypeNode();
            if (this.token === TokenType.is && !this.scanner.hasPrecedingLineBreak()) {
                return this.parseThisTypePredicate(thisKeyword);
            }
            else {
                return thisKeyword;
            }
        }
        case TokenType.typeof:
            return this.parseTypeQuery();
        case TokenType.openBrace:
            return this.parseTypeLiteral();
        case TokenType.openBracket:
            return this.parseTupleType();
        case TokenType.openParen:
            return this.parseParenthesizedType();
        default:
            return this.parseTypeReference();
    }
}
isStartOfType();
boolean;
{
    switch (this.token) {
        case TokenType.any:
        case TokenType.string:
        case TokenType.number:
        case TokenType.boolean:
        case TokenType.symbol:
        case TokenType.void:
        case TokenType.undefined:
        case TokenType.null:
        case TokenType.this:
        case TokenType.typeof:
        case TokenType.never:
        case TokenType.openBrace:
        case TokenType.openBracket:
        case TokenType.lessThan:
        case TokenType.new:
        case TokenType.StringLiteral:
            return true;
        case TokenType.openParen:
            // Nodes.Only consider '(' the start of a type if followed by ')', '...', an identifier, a modifier,
            // or something that starts a type. Nodes.We don't want to consider things like '(1)' a type.
            return this.lookAhead(this.isStartOfParenthesizedOrFunctionType);
        default:
            return this.isIdentifier();
    }
}
isStartOfParenthesizedOrFunctionType();
{
    this.nextToken();
    return this.token === TokenType.closeParen || this.isStartOfParameter() || this.isStartOfType();
}
parseArrayTypeOrHigher();
Nodes.TypeNode;
{
    var type = this.parseNonArrayType();
    while (!this.scanner.hasPrecedingLineBreak() && this.parseOptional(TokenType.openBracket)) {
        this.parseExpected(TokenType.closeBracket);
        var node = this.createNode(TokenType.ArrayType, type.pos);
        node.elementType = type;
        type = this.finishNode(node);
    }
    return type;
}
parseUnionOrIntersectionType(kind, TokenType, parseConstituentType, function () { return Nodes.TypeNode; }, operator, TokenType);
Nodes.TypeNode;
{
    var type = parseConstituentType();
    if (this.token === operator) {
        var types = [type];
        types.pos = type.pos;
        while (this.parseOptional(operator)) {
            types.push(parseConstituentType());
        }
        types.end = this.getNodeEnd();
        var node = this.createNode(kind, type.pos);
        node.types = types;
        type = this.finishNode(node);
    }
    return type;
}
parseIntersectionTypeOrHigher();
Nodes.TypeNode;
{
    return this.parseUnionOrIntersectionType(TokenType.IntersectionType, this.parseArrayTypeOrHigher, TokenType.ampersand);
}
parseUnionTypeOrHigher();
Nodes.TypeNode;
{
    return this.parseUnionOrIntersectionType(TokenType.UnionType, this.parseIntersectionTypeOrHigher, TokenType.bar);
}
isStartOfFunctionType();
boolean;
{
    if (this.token === TokenType.lessThan) {
        return true;
    }
    return this.token === TokenType.openParen && this.lookAhead(this.isUnambiguouslyStartOfFunctionType);
}
skipParameterStart();
boolean;
{
    if (isModifierKind(this.token)) {
        // Nodes.Skip modifiers
        this.parseModifiers();
    }
    if (this.isIdentifier() || this.token === TokenType.this) {
        this.nextToken();
        return true;
    }
    if (this.token === TokenType.openBracket || this.token === TokenType.openBrace) {
        // Nodes.Return true if we can parse an array or object binding pattern with no errors
        var previousErrorCount = this.parseDiagnostics.length;
        this.parseIdentifierOrPattern();
        return previousErrorCount === this.parseDiagnostics.length;
    }
    return false;
}
isUnambiguouslyStartOfFunctionType();
{
    this.nextToken();
    if (this.token === TokenType.closeParen || this.token === TokenType.dotDotDot) {
        // ( )
        // ( ...
        return true;
    }
    if (this.skipParameterStart()) {
        // Nodes.We successfully skipped modifiers (if any) and an identifier or binding pattern,
        // now see if we have something that indicates a parameter declaration
        if (this.token === TokenType.colon || this.token === TokenType.comma ||
            this.token === TokenType.question || this.token === TokenType.equals) {
            // ( xxx :
            // ( xxx ,
            // ( xxx ?
            // ( xxx =
            return true;
        }
        if (this.token === TokenType.closeParen) {
            this.nextToken();
            if (this.token === TokenType.equalsGreaterThan) {
                // ( xxx ) =>
                return true;
            }
        }
    }
    return false;
}
parseTypeOrTypePredicate();
Nodes.TypeNode;
{
    var typePredicateVariable = this.isIdentifier() && this.tryParse(this.parseTypePredicatePrefix);
    var type = this.parseType();
    if (typePredicateVariable) {
        var node = this.createNode(TokenType.TypePredicate, typePredicateVariable.pos);
        node.parameterName = typePredicateVariable;
        node.type = type;
        return this.finishNode(node);
    }
    else {
        return type;
    }
}
parseTypePredicatePrefix();
{
    var id = this.parseIdentifier();
    if (this.token === TokenType.is && !this.scanner.hasPrecedingLineBreak()) {
        this.nextToken();
        return id;
    }
}
parseType();
Nodes.TypeNode;
{
    // Nodes.The rules about 'yield' only apply to actual code/expression contexts.  Nodes.They don't
    // apply to 'type' contexts.  Nodes.So we disable these parameters here before moving on.
    return this.doOutsideOfContext(Nodes.NodeFlags.TypeExcludesFlags, this.parseTypeWorker);
}
parseTypeWorker();
Nodes.TypeNode;
{
    if (this.isStartOfFunctionType()) {
        return this.parseFunctionOrConstructorType(TokenType.FunctionType);
    }
    if (this.token === TokenType.new) {
        return this.parseFunctionOrConstructorType(TokenType.ConstructorType);
    }
    return this.parseUnionTypeOrHigher();
}
parseTypeAnnotation();
Nodes.TypeNode;
{
    return this.parseOptional(TokenType.colon) ? this.parseType() : undefined;
}
isStartOfLeftHandSideExpression();
boolean;
{
    switch (this.token) {
        case TokenType.this:
        case TokenType.super:
        case TokenType.null:
        case TokenType.true:
        case TokenType.false:
        case TokenType.NumericLiteral:
        case TokenType.StringLiteral:
        case TokenType.NoSubstitutionTemplateLiteral:
        case TokenType.TemplateHead:
        case TokenType.openParen:
        case TokenType.openBracket:
        case TokenType.openBrace:
        case TokenType.function:
        case TokenType.class:
        case TokenType.new:
        case TokenType.slash:
        case TokenType.slashEquals:
        case TokenType.Identifier:
            return true;
        default:
            return this.isIdentifier();
    }
}
isStartOfExpression();
boolean;
{
    if (this.isStartOfLeftHandSideExpression()) {
        return true;
    }
    switch (this.token) {
        case TokenType.plus:
        case TokenType.minus:
        case TokenType.tilde:
        case TokenType.exclamation:
        case TokenType.delete:
        case TokenType.typeof:
        case TokenType.void:
        case TokenType.plusPlus:
        case TokenType.minusMinus:
        case TokenType.lessThan:
        case TokenType.await:
        case TokenType.yield:
            // Nodes.Yield/await always starts an expression.  Nodes.Either it is an identifier (in which case
            // it is definitely an expression).  Nodes.Or it's a keyword (either because we're in
            // a generator or async function, or in strict mode (or both)) and it started a yield or await expression.
            return true;
        default:
            // Nodes.Error tolerance.  Nodes.If we see the start of some binary operator, we consider
            // that the start of an expression.  Nodes.That way we'll parse out a missing identifier,
            // give a good message about an identifier being missing, and then consume the
            // rest of the binary expression.
            if (this.isBinaryOperator()) {
                return true;
            }
            return this.isIdentifier();
    }
}
isStartOfExpressionStatement();
boolean;
{
    // Nodes.As per the grammar, none of '{' or 'function' or 'class' can start an expression statement.
    return this.token !== TokenType.openBrace &&
        this.token !== TokenType.function &&
        this.token !== TokenType.class &&
        this.token !== TokenType.at &&
        this.isStartOfExpression();
}
parseExpression();
Nodes.Expression;
{
    // Nodes.Expression[in]:
    //      Nodes.AssignmentExpression[in]
    //      Nodes.Expression[in] , Nodes.AssignmentExpression[in]
    // clear the decorator context when parsing Nodes.Expression, as it should be unambiguous when parsing a decorator
    var saveDecoratorContext = this.inDecoratorContext();
    if (saveDecoratorContext) {
        this.setDecoratorContext(/*val*/ false);
    }
    var expr = this.parseAssignmentExpressionOrHigher();
    var operatorToken = void 0;
    while ((operatorToken = this.parseOptionalToken(TokenType.comma))) {
        expr = this.makeBinaryExpression(expr, operatorToken, this.parseAssignmentExpressionOrHigher());
    }
    if (saveDecoratorContext) {
        this.setDecoratorContext(/*val*/ true);
    }
    return expr;
}
parseInitializer(inParameter, boolean);
Nodes.Expression;
{
    if (this.token !== TokenType.equals) {
        // Nodes.It's not uncommon during typing for the user to miss writing the '=' this.token.  Nodes.Check if
        // there is no newline after the last this.token and if we're on an expression.  Nodes.If so, parse
        // this as an equals-value clause with a missing equals.
        // Nodes.NOTE: Nodes.There are two places where we allow equals-value clauses.  Nodes.The first is in a
        // variable declarator.  Nodes.The second is with a parameter.  Nodes.For variable declarators
        // it's more likely that a { would be a allowed (as an object literal).  Nodes.While this
        // is also allowed for parameters, the risk is that we consume the { as an object
        // literal when it really will be for the block following the parameter.
        if (this.scanner.hasPrecedingLineBreak() || (inParameter && this.token === TokenType.openBrace) || !this.isStartOfExpression()) {
            // preceding line break, open brace in a parameter (likely a function body) or current this.token is not an expression -
            // do not try to parse initializer
            return undefined;
        }
    }
    // Nodes.Initializer[Nodes.In, Nodes.Yield] :
    //     = Nodes.AssignmentExpression[?Nodes.In, ?Nodes.Yield]
    this.parseExpected(TokenType.equals);
    return this.parseAssignmentExpressionOrHigher();
}
parseAssignmentExpressionOrHigher();
Nodes.Expression;
{
    //  Nodes.AssignmentExpression[in,yield]:
    //      1) Nodes.ConditionalExpression[?in,?yield]
    //      2) Nodes.LeftHandSideExpression = Nodes.AssignmentExpression[?in,?yield]
    //      3) Nodes.LeftHandSideExpression Nodes.AssignmentOperator Nodes.AssignmentExpression[?in,?yield]
    //      4) Nodes.ArrowFunctionExpression[?in,?yield]
    //      5) Nodes.AsyncArrowFunctionExpression[in,yield,await]
    //      6) [+Nodes.Yield] Nodes.YieldExpression[?Nodes.In]
    //
    // Nodes.Note: for ease of implementation we treat productions '2' and '3' as the same thing.
    // (i.e. they're both Nodes.BinaryExpressions with an assignment operator in it).
    // Nodes.First, do the simple check if we have a Nodes.YieldExpression (production '5').
    if (this.isYieldExpression()) {
        return this.parseYieldExpression();
    }
    // Nodes.Then, check if we have an arrow function (production '4' and '5') that starts with a parenthesized
    // parameter list or is an async arrow function.
    // Nodes.AsyncArrowFunctionExpression:
    //      1) async[no Nodes.LineTerminator here]Nodes.AsyncArrowBindingIdentifier[?Nodes.Yield][no Nodes.LineTerminator here]=>Nodes.AsyncConciseBody[?Nodes.In]
    //      2) Nodes.CoverCallExpressionAndAsyncArrowHead[?Nodes.Yield, ?Nodes.Await][no Nodes.LineTerminator here]=>Nodes.AsyncConciseBody[?Nodes.In]
    // Nodes.Production (1) of Nodes.AsyncArrowFunctionExpression is parsed in "this.tryParseAsyncSimpleArrowFunctionExpression".
    // Nodes.And production (2) is parsed in "this.tryParseParenthesizedArrowFunctionExpression".
    //
    // Nodes.If we do successfully parse arrow-function, we must *not* recurse for productions 1, 2 or 3. Nodes.An Nodes.ArrowFunction is
    // not a  Nodes.LeftHandSideExpression, nor does it start a Nodes.ConditionalExpression.  Nodes.So we are done
    // with Nodes.AssignmentExpression if we see one.
    var arrowExpression = this.tryParseParenthesizedArrowFunctionExpression() || this.tryParseAsyncSimpleArrowFunctionExpression();
    if (arrowExpression) {
        return arrowExpression;
    }
    // Nodes.Now try to see if we're in production '1', '2' or '3'.  A conditional expression can
    // start with a Nodes.LogicalOrExpression, while the assignment productions can only start with
    // Nodes.LeftHandSideExpressions.
    //
    // Nodes.So, first, we try to just parse out a Nodes.BinaryExpression.  Nodes.If we get something that is a
    // Nodes.LeftHandSide or higher, then we can try to parse out the assignment expression part.
    // Nodes.Otherwise, we try to parse out the conditional expression bit.  Nodes.We want to allow any
    // binary expression here, so we pass in the 'lowest' precedence here so that it matches
    // and consumes anything.
    var expr = this.parseBinaryExpressionOrHigher(/*precedence*/ 0);
    // Nodes.To avoid a look-ahead, we did not handle the case of an arrow function with a single un-parenthesized
    // parameter ('x => ...') above. Nodes.We handle it here by checking if the parsed expression was a single
    // identifier and the current this.token is an arrow.
    if (expr.kind === TokenType.Identifier && this.token === TokenType.equalsGreaterThan) {
        return this.parseSimpleArrowFunctionExpression(expr);
    }
    // Nodes.Now see if we might be in cases '2' or '3'.
    // Nodes.If the expression was a Nodes.LHS expression, and we have an assignment operator, then
    // we're in '2' or '3'. Nodes.Consume the assignment and return.
    //
    // Nodes.Note: we call this.reScanGreaterToken so that we get an appropriately merged this.token
    // for cases like > > =  becoming >>=
    if (isLeftHandSideExpression(expr) && isAssignmentOperator(this.reScanGreaterToken())) {
        return this.makeBinaryExpression(expr, this.parseTokenNode(), this.parseAssignmentExpressionOrHigher());
    }
    // Nodes.It wasn't an assignment or a lambda.  Nodes.This is a conditional expression:
    return this.parseConditionalExpressionRest(expr);
}
isYieldExpression();
boolean;
{
    if (this.token === TokenType.yield) {
        // Nodes.If we have a 'yield' keyword, and this is a context where yield expressions are
        // allowed, then definitely parse out a yield expression.
        if (this.inYieldContext()) {
            return true;
        }
        // Nodes.We're in a context where 'yield expr' is not allowed.  Nodes.However, if we can
        // definitely tell that the user was trying to parse a 'yield expr' and not
        // just a normal expr that start with a 'yield' identifier, then parse out
        // a 'yield expr'.  Nodes.We can then report an error later that they are only
        // allowed in generator expressions.
        //
        // for example, if we see 'yield(foo)', then we'll have to treat that as an
        // invocation expression of something called 'yield'.  Nodes.However, if we have
        // 'yield foo' then that is not legal as a normal expression, so we can
        // definitely recognize this as a yield expression.
        //
        // for now we just check if the next this.token is an identifier.  Nodes.More heuristics
        // can be added here later as necessary.  Nodes.We just need to make sure that we
        // don't accidentally consume something legal.
        return this.lookAhead(this.nextTokenIsIdentifierOrKeywordOrNumberOnSameLine);
    }
    return false;
}
nextTokenIsIdentifierOnSameLine();
{
    this.nextToken();
    return !this.scanner.hasPrecedingLineBreak() && this.isIdentifier();
}
parseYieldExpression();
Nodes.YieldExpression;
{
    var node = this.createNode(TokenType.YieldExpression);
    // Nodes.YieldExpression[Nodes.In] :
    //      yield
    //      yield [no Nodes.LineTerminator here] [Nodes.Lexical goal Nodes.InputElementRegExp]Nodes.AssignmentExpression[?Nodes.In, Nodes.Yield]
    //      yield [no Nodes.LineTerminator here] * [Nodes.Lexical goal Nodes.InputElementRegExp]Nodes.AssignmentExpression[?Nodes.In, Nodes.Yield]
    this.nextToken();
    if (!this.scanner.hasPrecedingLineBreak() &&
        (this.token === TokenType.asterisk || this.isStartOfExpression())) {
        node.asteriskToken = this.parseOptionalToken(TokenType.asterisk);
        node.expression = this.parseAssignmentExpressionOrHigher();
        return this.finishNode(node);
    }
    else {
        // if the next this.token is not on the same line as yield.  or we don't have an '*' or
        // the start of an expression, then this is just a simple "yield" expression.
        return this.finishNode(node);
    }
}
parseSimpleArrowFunctionExpression(identifier, Nodes.Identifier, asyncModifier ?  : Nodes.ModifiersArray);
Nodes.ArrowFunction;
{
    console.assert(this.token === TokenType.equalsGreaterThan, "this.parseSimpleArrowFunctionExpression should only have been called if we had a =>");
    var node = void 0;
    if (asyncModifier) {
        node = this.createNode(TokenType.ArrowFunction, asyncModifier.pos);
        this.setModifiers(node, asyncModifier);
    }
    else {
        node = this.createNode(TokenType.ArrowFunction, identifier.pos);
    }
    var parameter = this.createNode(TokenType.Parameter, identifier.pos);
    parameter.name = identifier;
    this.finishNode(parameter);
    node.parameters = [parameter];
    node.parameters.pos = parameter.pos;
    node.parameters.end = parameter.end;
    node.equalsGreaterThanToken = this.parseExpectedToken(TokenType.equalsGreaterThan, /*reportAtCurrentPosition*/ false, Nodes.Diagnostics._0_expected, "=>");
    node.body = this.parseArrowFunctionExpressionBody(/*isAsync*/ !!asyncModifier);
    return this.finishNode(node);
}
tryParseParenthesizedArrowFunctionExpression();
Nodes.Expression;
{
    var triState = this.isParenthesizedArrowFunctionExpression();
    if (triState === Nodes.Tristate.False) {
        // Nodes.It's definitely not a parenthesized arrow function expression.
        return undefined;
    }
    // Nodes.If we definitely have an arrow function, then we can just parse one, not requiring a
    // following => or { this.token. Nodes.Otherwise, we *might* have an arrow function.  Nodes.Try to parse
    // it out, but don't allow any ambiguity, and return 'undefined' if this could be an
    // expression instead.
    var arrowFunction = triState === Nodes.Tristate.True
        ? this.parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ true)
        : this.tryParse(this.parsePossibleParenthesizedArrowFunctionExpressionHead);
    if (!arrowFunction) {
        // Nodes.Didn't appear to actually be a parenthesized arrow function.  Nodes.Just bail out.
        return undefined;
    }
    var isAsync = !!(arrowFunction.flags & Nodes.NodeFlags.Async);
    // Nodes.If we have an arrow, then try to parse the body. Nodes.Even if not, try to parse if we
    // have an opening brace, just in case we're in an error state.
    var lastToken = this.token;
    arrowFunction.equalsGreaterThanToken = this.parseExpectedToken(TokenType.equalsGreaterThan, /*reportAtCurrentPosition*/ false, Nodes.Diagnostics._0_expected, "=>");
    arrowFunction.body = (lastToken === TokenType.equalsGreaterThan || lastToken === TokenType.openBrace)
        ? this.parseArrowFunctionExpressionBody(isAsync)
        : this.parseIdentifier();
    return this.finishNode(arrowFunction);
}
isParenthesizedArrowFunctionExpression();
Nodes.Tristate;
{
    if (this.token === TokenType.openParen || this.token === TokenType.lessThan || this.token === TokenType.async) {
        return this.lookAhead(this.isParenthesizedArrowFunctionExpressionWorker);
    }
    if (this.token === TokenType.equalsGreaterThan) {
        // Nodes.ERROR Nodes.RECOVERY Nodes.TWEAK:
        // Nodes.If we see a standalone => try to parse it as an arrow function expression as that's
        // likely what the user intended to write.
        return Nodes.Tristate.True;
    }
    // Nodes.Definitely not a parenthesized arrow function.
    return Nodes.Tristate.False;
}
isParenthesizedArrowFunctionExpressionWorker();
{
    if (this.token === TokenType.async) {
        this.nextToken();
        if (this.scanner.hasPrecedingLineBreak()) {
            return Nodes.Tristate.False;
        }
        if (this.token !== TokenType.openParen && this.token !== TokenType.lessThan) {
            return Nodes.Tristate.False;
        }
    }
    var first = this.token;
    var second = this.nextToken();
    if (first === TokenType.openParen) {
        if (second === TokenType.closeParen) {
            // Nodes.Simple cases: "() =>", "(): ", and  "() {".
            // Nodes.This is an arrow function with no parameters.
            // Nodes.The last one is not actually an arrow function,
            // but this is probably what the user intended.
            var third = this.nextToken();
            switch (third) {
                case TokenType.equalsGreaterThan:
                case TokenType.colon:
                case TokenType.openBrace:
                    return Nodes.Tristate.True;
                default:
                    return Nodes.Tristate.False;
            }
        }
        // Nodes.If encounter "([" or "({", this could be the start of a binding pattern.
        // Nodes.Examples:
        //      ([ x ]) => { }
        //      ({ x }) => { }
        //      ([ x ])
        //      ({ x })
        if (second === TokenType.openBracket || second === TokenType.openBrace) {
            return Nodes.Tristate.Unknown;
        }
        // Nodes.Simple case: "(..."
        // Nodes.This is an arrow function with a rest parameter.
        if (second === TokenType.dotDotDot) {
            return Nodes.Tristate.True;
        }
        // Nodes.If we had "(" followed by something that's not an identifier,
        // then this definitely doesn't look like a lambda.
        // Nodes.Note: we could be a little more lenient and allow
        // "(public" or "(private". Nodes.These would not ever actually be allowed,
        // but we could provide a good error message instead of bailing out.
        if (!this.isIdentifier()) {
            return Nodes.Tristate.False;
        }
        // Nodes.If we have something like "(a:", then we must have a
        // type-annotated parameter in an arrow function expression.
        if (this.nextToken() === TokenType.colon) {
            return Nodes.Tristate.True;
        }
        // Nodes.This *could* be a parenthesized arrow function.
        // Nodes.Return Nodes.Unknown to let the caller know.
        return Nodes.Tristate.Unknown;
    }
    else {
        console.assert(first === TokenType.lessThan);
        // Nodes.If we have "<" not followed by an identifier,
        // then this definitely is not an arrow function.
        if (!this.isIdentifier()) {
            return Nodes.Tristate.False;
        }
        // Nodes.JSX overrides
        if (this.sourceFile.languageVariant === Nodes.LanguageVariant.JSX) {
            var isArrowFunctionInJsx = this.lookAhead(function () {
                var third = _this.nextToken();
                if (third === TokenType.extends) {
                    var fourth = _this.nextToken();
                    switch (fourth) {
                        case TokenType.equals:
                        case TokenType.greaterThan:
                            return false;
                        default:
                            return true;
                    }
                }
                else if (third === TokenType.comma) {
                    return true;
                }
                return false;
            });
            if (isArrowFunctionInJsx) {
                return Nodes.Tristate.True;
            }
            return Nodes.Tristate.False;
        }
        // Nodes.This *could* be a parenthesized arrow function.
        return Nodes.Tristate.Unknown;
    }
}
parsePossibleParenthesizedArrowFunctionExpressionHead();
Nodes.ArrowFunction;
{
    return this.parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ false);
}
tryParseAsyncSimpleArrowFunctionExpression();
Nodes.ArrowFunction;
{
    // Nodes.We do a check here so that we won't be doing unnecessarily call to "this.lookAhead"
    if (this.token === TokenType.async) {
        var isUnParenthesizedAsyncArrowFunction = this.lookAhead(this.isUnParenthesizedAsyncArrowFunctionWorker);
        if (isUnParenthesizedAsyncArrowFunction === Nodes.Tristate.True) {
            var asyncModifier = this.parseModifiersForArrowFunction();
            var expr = this.parseBinaryExpressionOrHigher(/*precedence*/ 0);
            return this.parseSimpleArrowFunctionExpression(expr, asyncModifier);
        }
    }
    return undefined;
}
isUnParenthesizedAsyncArrowFunctionWorker();
Nodes.Tristate;
{
    // Nodes.AsyncArrowFunctionExpression:
    //      1) async[no Nodes.LineTerminator here]Nodes.AsyncArrowBindingIdentifier[?Nodes.Yield][no Nodes.LineTerminator here]=>Nodes.AsyncConciseBody[?Nodes.In]
    //      2) Nodes.CoverCallExpressionAndAsyncArrowHead[?Nodes.Yield, ?Nodes.Await][no Nodes.LineTerminator here]=>Nodes.AsyncConciseBody[?Nodes.In]
    if (this.token === TokenType.async) {
        this.nextToken();
        // Nodes.If the "async" is followed by "=>" this.token then it is not a begining of an async arrow-function
        // but instead a simple arrow-function which will be parsed inside "this.parseAssignmentExpressionOrHigher"
        if (this.scanner.hasPrecedingLineBreak() || this.token === TokenType.equalsGreaterThan) {
            return Nodes.Tristate.False;
        }
        // Nodes.Check for un-parenthesized Nodes.AsyncArrowFunction
        var expr = this.parseBinaryExpressionOrHigher(/*precedence*/ 0);
        if (!this.scanner.hasPrecedingLineBreak() && expr.kind === TokenType.Identifier && this.token === TokenType.equalsGreaterThan) {
            return Nodes.Tristate.True;
        }
    }
    return Nodes.Tristate.False;
}
parseParenthesizedArrowFunctionExpressionHead(allowAmbiguity, boolean);
Nodes.ArrowFunction;
{
    var node = this.createNode(TokenType.ArrowFunction);
    this.setModifiers(node, this.parseModifiersForArrowFunction());
    var isAsync = !!(node.flags & Nodes.NodeFlags.Async);
    // Nodes.Arrow functions are never generators.
    //
    // Nodes.If we're speculatively parsing a signature for a parenthesized arrow function, then
    // we have to have a complete parameter list.  Nodes.Otherwise we might see something like
    // a => (b => c)
    // Nodes.And think that "(b =>" was actually a parenthesized arrow function with a missing
    // close paren.
    this.fillSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ !allowAmbiguity, node);
    // Nodes.If we couldn't get parameters, we definitely could not parse out an arrow function.
    if (!node.parameters) {
        return undefined;
    }
    // Nodes.Parsing a signature isn't enough.
    // Nodes.Parenthesized arrow signatures often look like other valid expressions.
    // Nodes.For instance:
    //  - "(x = 10)" is an assignment expression parsed as a signature with a default parameter value.
    //  - "(x,y)" is a comma expression parsed as a signature with two parameters.
    //  - "a ? (b): c" will have "(b):" parsed as a signature with a return type annotation.
    //
    // Nodes.So we need just a bit of lookahead to ensure that it can only be a signature.
    if (!allowAmbiguity && this.token !== TokenType.equalsGreaterThan && this.token !== TokenType.openBrace) {
        // Nodes.Returning undefined here will cause our caller to rewind to where we started from.
        return undefined;
    }
    return node;
}
parseArrowFunctionExpressionBody(isAsync, boolean);
Nodes.Block | Nodes.Expression;
{
    if (this.token === TokenType.openBrace) {
        return this.parseFunctionBlock(/*allowYield*/ false, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);
    }
    if (this.token !== TokenType.semicolon &&
        this.token !== TokenType.function &&
        this.token !== TokenType.class &&
        this.isStartOfStatement() &&
        !this.isStartOfExpressionStatement()) {
        // Nodes.Check if we got a plain statement (i.e. no expression-statements, no function/class expressions/declarations)
        //
        // Nodes.Here we try to recover from a potential error situation in the case where the
        // user meant to supply a block. Nodes.For example, if the user wrote:
        //
        //  a =>
        //      let v = 0;
        //  }
        //
        // they may be missing an open brace.  Nodes.Check to see if that's the case so we can
        // try to recover better.  Nodes.If we don't do this, then the next close curly we see may end
        // up preemptively closing the containing construct.
        //
        // Nodes.Note: even when 'ignoreMissingOpenBrace' is passed as true, parseBody will still error.
        return this.parseFunctionBlock(/*allowYield*/ false, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ true);
    }
    return isAsync
        ? this.doInAwaitContext(this.parseAssignmentExpressionOrHigher)
        : this.doOutsideOfAwaitContext(this.parseAssignmentExpressionOrHigher);
}
parseConditionalExpressionRest(leftOperand, Nodes.Expression);
Nodes.Expression;
{
    // Nodes.Note: we are passed in an expression which was produced from this.parseBinaryExpressionOrHigher.
    var questionToken = this.parseOptionalToken(TokenType.question);
    if (!questionToken) {
        return leftOperand;
    }
    // Nodes.Note: we explicitly 'allowIn' in the whenTrue part of the condition expression, and
    // we do not that for the 'whenFalse' part.
    var node = this.createNode(TokenType.ConditionalExpression, leftOperand.pos);
    node.condition = leftOperand;
    node.questionToken = questionToken;
    node.whenTrue = this.doOutsideOfContext(this.disallowInAndDecoratorContext, this.parseAssignmentExpressionOrHigher);
    node.colonToken = this.parseExpectedToken(TokenType.colon, /*reportAtCurrentPosition*/ false, Nodes.Diagnostics._0_expected, tokenToString(TokenType.colon));
    node.whenFalse = this.parseAssignmentExpressionOrHigher();
    return this.finishNode(node);
}
parseBinaryExpressionOrHigher(precedence, number);
Nodes.Expression;
{
    var leftOperand = this.parseUnaryExpressionOrHigher();
    return this.parseBinaryExpressionRest(precedence, leftOperand);
}
isInOrOfKeyword(t, TokenType);
{
    return t === TokenType.in || t === TokenType.of;
}
parseBinaryExpressionRest(precedence, number, leftOperand, Nodes.Expression);
Nodes.Expression;
{
    while (true) {
        // Nodes.We either have a binary operator here, or we're finished.  Nodes.We call
        // this.reScanGreaterToken so that we merge this.token sequences like > and = into >=
        this.reScanGreaterToken();
        var newPrecedence = getBinaryOperatorPrecedence();
        // Nodes.Check the precedence to see if we should "take" this operator
        // - Nodes.For left associative operator (all operator but **), consume the operator,
        //   recursively call the function below, and parse binaryExpression as a rightOperand
        //   of the caller if the new precedence of the operator is greater then or equal to the current precedence.
        //   Nodes.For example:
        //      a - b - c;
        //            ^this.token; leftOperand = b. Nodes.Return b to the caller as a rightOperand
        //      a * b - c
        //            ^this.token; leftOperand = b. Nodes.Return b to the caller as a rightOperand
        //      a - b * c;
        //            ^this.token; leftOperand = b. Nodes.Return b * c to the caller as a rightOperand
        // - Nodes.For right associative operator (**), consume the operator, recursively call the function
        //   and parse binaryExpression as a rightOperand of the caller if the new precedence of
        //   the operator is strictly grater than the current precedence
        //   Nodes.For example:
        //      a ** b ** c;
        //             ^^this.token; leftOperand = b. Nodes.Return b ** c to the caller as a rightOperand
        //      a - b ** c;
        //            ^^this.token; leftOperand = b. Nodes.Return b ** c to the caller as a rightOperand
        //      a ** b - c
        //             ^this.token; leftOperand = b. Nodes.Return b to the caller as a rightOperand
        var consumeCurrentOperator = this.token === TokenType.asteriskAsterisk ?
            newPrecedence >= precedence :
            newPrecedence > precedence;
        if (!consumeCurrentOperator) {
            break;
        }
        if (this.token === TokenType.in && this.inDisallowInContext()) {
            break;
        }
        if (this.token === TokenType.as) {
            // Nodes.Make sure we *do* perform Nodes.ASI for constructs like this:
            //    var x = foo
            //    as (Nodes.Bar)
            // Nodes.This should be parsed as an initialized variable, followed
            // by a function call to 'as' with the argument 'Nodes.Bar'
            if (this.scanner.hasPrecedingLineBreak()) {
                break;
            }
            else {
                this.nextToken();
                leftOperand = this.makeAsExpression(leftOperand, this.parseType());
            }
        }
        else {
            leftOperand = this.makeBinaryExpression(leftOperand, this.parseTokenNode(), this.parseBinaryExpressionOrHigher(newPrecedence));
        }
    }
    return leftOperand;
}
isBinaryOperator();
{
    if (this.inDisallowInContext() && this.token === TokenType.in) {
        return false;
    }
    return getBinaryOperatorPrecedence() > 0;
}
makeBinaryExpression(left, Nodes.Expression, operatorToken, Nodes.Node, right, Nodes.Expression);
Nodes.BinaryExpression;
{
    var node = this.createNode(TokenType.BinaryExpression, left.pos);
    node.left = left;
    node.operatorToken = operatorToken;
    node.right = right;
    return this.finishNode(node);
}
makeAsExpression(left, Nodes.Expression, right, Nodes.TypeNode);
Nodes.AsExpression;
{
    var node = this.createNode(TokenType.AsExpression, left.pos);
    node.expression = left;
    node.type = right;
    return this.finishNode(node);
}
parsePrefixUnaryExpression();
{
    var node = this.createNode(TokenType.PrefixUnaryExpression);
    node.operator = this.token;
    this.nextToken();
    node.operand = this.parseSimpleUnaryExpression();
    return this.finishNode(node);
}
parseDeleteExpression();
{
    var node = this.createNode(TokenType.DeleteExpression);
    this.nextToken();
    node.expression = this.parseSimpleUnaryExpression();
    return this.finishNode(node);
}
parseTypeOfExpression();
{
    var node = this.createNode(TokenType.TypeOfExpression);
    this.nextToken();
    node.expression = this.parseSimpleUnaryExpression();
    return this.finishNode(node);
}
parseVoidExpression();
{
    var node = this.createNode(TokenType.VoidExpression);
    this.nextToken();
    node.expression = this.parseSimpleUnaryExpression();
    return this.finishNode(node);
}
isAwaitExpression();
boolean;
{
    if (this.token === TokenType.await) {
        if (this.inAwaitContext()) {
            return true;
        }
        // here we are using similar heuristics as 'this.isYieldExpression'
        return this.lookAhead(this.nextTokenIsIdentifierOnSameLine);
    }
    return false;
}
parseAwaitExpression();
{
    var node = this.createNode(TokenType.AwaitExpression);
    this.nextToken();
    node.expression = this.parseSimpleUnaryExpression();
    return this.finishNode(node);
}
parseUnaryExpressionOrHigher();
Nodes.UnaryExpression | Nodes.BinaryExpression;
{
    if (this.isAwaitExpression()) {
        return this.parseAwaitExpression();
    }
    if (this.isIncrementExpression()) {
        var incrementExpression = this.parseIncrementExpression();
        return this.token === TokenType.asteriskAsterisk ?
            this.parseBinaryExpressionRest(getBinaryOperatorPrecedence(), incrementExpression) :
            incrementExpression;
    }
    var unaryOperator = this.token;
    var simpleUnaryExpression = this.parseSimpleUnaryExpression();
    if (this.token === TokenType.asteriskAsterisk) {
        var start = skipTrivia(this.sourceText, simpleUnaryExpression.pos);
        if (simpleUnaryExpression.kind === TokenType.TypeAssertionExpression) {
            this.parseErrorAtPosition(start, simpleUnaryExpression.end - start, Nodes.Diagnostics.A_type_assertion_expression_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses);
        }
        else {
            this.parseErrorAtPosition(start, simpleUnaryExpression.end - start, Nodes.Diagnostics.An_unary_expression_with_the_0_operator_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses, tokenToString(unaryOperator));
        }
    }
    return simpleUnaryExpression;
}
parseSimpleUnaryExpression();
Nodes.UnaryExpression;
{
    switch (this.token) {
        case TokenType.plus:
        case TokenType.minus:
        case TokenType.tilde:
        case TokenType.exclamation:
            return this.parsePrefixUnaryExpression();
        case TokenType.delete:
            return this.parseDeleteExpression();
        case TokenType.typeof:
            return this.parseTypeOfExpression();
        case TokenType.void:
            return this.parseVoidExpression();
        case TokenType.lessThan:
            // Nodes.This is modified Nodes.UnaryExpression grammar in Nodes.TypeScript
            //  Nodes.UnaryExpression (modified):
            //      < type > Nodes.UnaryExpression
            return this.parseTypeAssertion();
        default:
            return this.parseIncrementExpression();
    }
}
isIncrementExpression();
boolean;
{
    // Nodes.This function is called inside parseUnaryExpression to decide
    // whether to call this.parseSimpleUnaryExpression or call this.parseIncrementExpression directly
    switch (this.token) {
        case TokenType.plus:
        case TokenType.minus:
        case TokenType.tilde:
        case TokenType.exclamation:
        case TokenType.delete:
        case TokenType.typeof:
        case TokenType.void:
            return false;
        case TokenType.lessThan:
            // Nodes.If we are not in Nodes.JSX context, we are parsing Nodes.TypeAssertion which is an Nodes.UnaryExpression
            if (this.sourceFile.languageVariant !== Nodes.LanguageVariant.JSX) {
                return false;
            }
        // Nodes.We are in Nodes.JSX context and the this.token is part of Nodes.JSXElement.
        // Nodes.Fall through
        default:
            return true;
    }
}
parseIncrementExpression();
Nodes.IncrementExpression;
{
    if (this.token === TokenType.plusPlus || this.token === TokenType.minusMinus) {
        var node = this.createNode(TokenType.PrefixUnaryExpression);
        node.operator = this.token;
        this.nextToken();
        node.operand = this.parseLeftHandSideExpressionOrHigher();
        return this.finishNode(node);
    }
    else if (this.sourceFile.languageVariant === Nodes.LanguageVariant.JSX && this.token === TokenType.lessThan && this.lookAhead(this.nextTokenIsIdentifierOrKeyword)) {
        // Nodes.JSXElement is part of primaryExpression
        return this.parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ true);
    }
    var expression = this.parseLeftHandSideExpressionOrHigher();
    console.assert(isLeftHandSideExpression(expression));
    if ((this.token === TokenType.plusPlus || this.token === TokenType.minusMinus) && !this.scanner.hasPrecedingLineBreak()) {
        var node = this.createNode(TokenType.PostfixUnaryExpression, expression.pos);
        node.operand = expression;
        node.operator = this.token;
        this.nextToken();
        return this.finishNode(node);
    }
    return expression;
}
parseLeftHandSideExpressionOrHigher();
Nodes.LeftHandSideExpression;
{
    // Nodes.Original Nodes.Ecma:
    // Nodes.LeftHandSideExpression: Nodes.See 11.2
    //      Nodes.NewExpression
    //      Nodes.CallExpression
    //
    // Nodes.Our simplification:
    //
    // Nodes.LeftHandSideExpression: Nodes.See 11.2
    //      Nodes.MemberExpression
    //      Nodes.CallExpression
    //
    // Nodes.See comment in this.parseMemberExpressionOrHigher on how we replaced Nodes.NewExpression with
    // Nodes.MemberExpression to make our lives easier.
    //
    // to best understand the below code, it's important to see how Nodes.CallExpression expands
    // out into its own productions:
    //
    // Nodes.CallExpression:
    //      Nodes.MemberExpression Nodes.Arguments
    //      Nodes.CallExpression Nodes.Arguments
    //      Nodes.CallExpression[Nodes.Expression]
    //      Nodes.CallExpression.IdentifierName
    //      super   (   Nodes.ArgumentListopt   )
    //      super.IdentifierName
    //
    // Nodes.Because of the recursion in these calls, we need to bottom out first.  Nodes.There are two
    // bottom out states we can run into.  Nodes.Either we see 'super' which must start either of
    // the last two Nodes.CallExpression productions.  Nodes.Or we have a Nodes.MemberExpression which either
    // completes the Nodes.LeftHandSideExpression, or starts the beginning of the first four
    // Nodes.CallExpression productions.
    var expression = this.token === TokenType.super
        ? this.parseSuperExpression()
        : this.parseMemberExpressionOrHigher();
    // Nodes.Now, we *may* be complete.  Nodes.However, we might have consumed the start of a
    // Nodes.CallExpression.  Nodes.As such, we need to consume the rest of it here to be complete.
    return this.parseCallExpressionRest(expression);
}
parseMemberExpressionOrHigher();
Nodes.MemberExpression;
{
    // Nodes.Note: to make our lives simpler, we decompose the the Nodes.NewExpression productions and
    // place Nodes.ObjectCreationExpression and Nodes.FunctionExpression into Nodes.PrimaryExpression.
    // like so:
    //
    //   Nodes.PrimaryExpression : Nodes.See 11.1
    //      this
    //      Nodes.Identifier
    //      Nodes.Literal
    //      Nodes.ArrayLiteral
    //      Nodes.ObjectLiteral
    //      (Nodes.Expression)
    //      Nodes.FunctionExpression
    //      new Nodes.MemberExpression Nodes.Arguments?
    //
    //   Nodes.MemberExpression : Nodes.See 11.2
    //      Nodes.PrimaryExpression
    //      Nodes.MemberExpression[Nodes.Expression]
    //      Nodes.MemberExpression.IdentifierName
    //
    //   Nodes.CallExpression : Nodes.See 11.2
    //      Nodes.MemberExpression
    //      Nodes.CallExpression Nodes.Arguments
    //      Nodes.CallExpression[Nodes.Expression]
    //      Nodes.CallExpression.IdentifierName
    //
    // Nodes.Technically this is ambiguous.  i.e. Nodes.CallExpression defines:
    //
    //   Nodes.CallExpression:
    //      Nodes.CallExpression Nodes.Arguments
    //
    // Nodes.If you see: "new Nodes.Foo()"
    //
    // Nodes.Then that could be treated as a single Nodes.ObjectCreationExpression, or it could be
    // treated as the invocation of "new Nodes.Foo".  Nodes.We disambiguate that in code (to match
    // the original grammar) by making sure that if we see an Nodes.ObjectCreationExpression
    // we always consume arguments if they are there. Nodes.So we treat "new Nodes.Foo()" as an
    // object creation only, and not at all as an invocation)  Nodes.Another way to think
    // about this is that for every "new" that we see, we will consume an argument list if
    // it is there as part of the *associated* object creation node.  Nodes.Any additional
    // argument lists we see, will become invocation expressions.
    //
    // Nodes.Because there are no other places in the grammar now that refer to Nodes.FunctionExpression
    // or Nodes.ObjectCreationExpression, it is safe to push down into the Nodes.PrimaryExpression
    // production.
    //
    // Nodes.Because Nodes.CallExpression and Nodes.MemberExpression are left recursive, we need to bottom out
    // of the recursion immediately.  Nodes.So we parse out a primary expression to start with.
    var expression = this.parsePrimaryExpression();
    return this.parseMemberExpressionRest(expression);
}
parseSuperExpression();
Nodes.MemberExpression;
{
    var expression = this.parseTokenNode();
    if (this.token === TokenType.openParen || this.token === TokenType.dot || this.token === TokenType.openBracket) {
        return expression;
    }
    // Nodes.If we have seen "super" it must be followed by '(' or '.'.
    // Nodes.If it wasn't then just try to parse out a '.' and report an error.
    var node = this.createNode(TokenType.PropertyAccessExpression, expression.pos);
    node.expression = expression;
    this.parseExpectedToken(TokenType.dot, /*reportAtCurrentPosition*/ false, Nodes.Diagnostics.super_must_be_followed_by_an_argument_list_or_member_access);
    node.name = this.parseRightSideOfDot(/*allowIdentifierNames*/ true);
    return this.finishNode(node);
}
tagNamesAreEquivalent(lhs, Nodes.JsxTagNameExpression, rhs, Nodes.JsxTagNameExpression);
boolean;
{
    if (lhs.kind !== rhs.kind) {
        return false;
    }
    if (lhs.kind === TokenType.Identifier) {
        return lhs.text === rhs.text;
    }
    if (lhs.kind === TokenType.this) {
        return true;
    }
    // Nodes.If we are at this statement then we must have Nodes.PropertyAccessExpression and because tag name in Nodes.Jsx element can only
    // take forms of Nodes.JsxTagNameExpression which includes an identifier, "this" expression, or another propertyAccessExpression
    // it is safe to case the expression property as such. Nodes.See this.parseJsxElementName for how we parse tag name in Nodes.Jsx element
    return lhs.name.text === rhs.name.text &&
        this.tagNamesAreEquivalent(lhs.expression, rhs.expression);
}
parseJsxElementOrSelfClosingElement(inExpressionContext, boolean);
Nodes.JsxElement | Nodes.JsxSelfClosingElement;
{
    var opening = this.parseJsxOpeningOrSelfClosingElement(inExpressionContext);
    let;
    this.result;
    Nodes.JsxElement | Nodes.JsxSelfClosingElement;
    if (opening.kind === TokenType.JsxOpeningElement) {
        var node = this.createNode(TokenType.JsxElement, opening.pos);
        node.openingElement = opening;
        node.children = this.parseJsxChildren(node.openingElement.tagName);
        node.closingElement = this.parseJsxClosingElement(inExpressionContext);
        if (!this.tagNamesAreEquivalent(node.openingElement.tagName, node.closingElement.tagName)) {
            this.parseErrorAtPosition(node.closingElement.pos, node.closingElement.end - node.closingElement.pos, Nodes.Diagnostics.Expected_corresponding_JSX_closing_tag_for_0, getTextOfNodeFromSourceText(this.sourceText, node.openingElement.tagName));
        }
        this.result = this.finishNode(node);
    }
    else {
        console.assert(opening.kind === TokenType.JsxSelfClosingElement);
        // Nodes.Nothing else to do for self-closing elements
        this.result = opening;
    }
    // Nodes.If the user writes the invalid code '<div></div><div></div>' in an expression context (i.e. not wrapped in
    // an enclosing tag), we'll naively try to parse   ^ this as a 'less than' operator and the remainder of the tag
    // as garbage, which will cause the formatter to badly mangle the Nodes.JSX. Nodes.Perform a speculative parse of a Nodes.JSX
    // element if we see a < this.token so that we can wrap it in a synthetic binary expression so the formatter
    // does less damage and we can report a better error.
    // Nodes.Since Nodes.JSX elements are invalid < operands anyway, this lookahead parse will only occur in error scenarios
    // of one sort or another.
    if (inExpressionContext && this.token === TokenType.lessThan) {
        var invalidElement = this.tryParse(function () { return _this.parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ true); });
        if (invalidElement) {
            this.parseErrorAtCurrentToken(Nodes.Diagnostics.JSX_expressions_must_have_one_parent_element);
            var badNode = this.createNode(TokenType.BinaryExpression, this.result.pos);
            badNode.end = invalidElement.end;
            badNode.left = this.result;
            badNode.right = invalidElement;
            badNode.operatorToken = this.createMissingNode(TokenType.comma, /*reportAtCurrentPosition*/ false, /*diagnosticMessage*/ undefined);
            badNode.operatorToken.pos = badNode.operatorToken.end = badNode.right.pos;
            return badNode;
        }
    }
    return this.result;
}
parseJsxText();
Nodes.JsxText;
{
    var node = this.createNode(TokenType.JsxText, this.scanner.getStartPos());
    this.token = this.scanner.scanJsxToken();
    return this.finishNode(node);
}
parseJsxChild();
Nodes.JsxChild;
{
    switch (this.token) {
        case TokenType.JsxText:
            return this.parseJsxText();
        case TokenType.openBrace:
            return this.parseJsxExpression(/*inExpressionContext*/ false);
        case TokenType.lessThan:
            return this.parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ false);
    }
    Nodes.Debug.fail("Nodes.Unknown Nodes.JSX child kind " + this.token);
}
parseJsxChildren(openingTagName, Nodes.LeftHandSideExpression);
Nodes.NodeList < Nodes.JsxChild > {
    const: this.result = [],
    this: .result.pos = this.scanner.getStartPos(),
    const: saveParsingContext = this.parsingContext,
    this: .parsingContext |= 1 << Nodes.ParsingContext.JsxChildren,
    while: function () { }, true:  };
{
    this.token = this.scanner.reScanJsxToken();
    if (this.token === TokenType.lessThanSlash) {
        // Nodes.Closing tag
        break;
    }
    else if (this.token === TokenType.endOfFile) {
        // Nodes.If we hit Nodes.EOF, issue the error at the tag that lacks the closing element
        // rather than at the end of the file (which is useless)
        this.parseErrorAtPosition(openingTagName.pos, openingTagName.end - openingTagName.pos, Nodes.Diagnostics.JSX_element_0_has_no_corresponding_closing_tag, getTextOfNodeFromSourceText(this.sourceText, openingTagName));
        break;
    }
    this.result.push(this.parseJsxChild());
}
this.result.end = this.scanner.getTokenPos();
this.parsingContext = saveParsingContext;
return this.result;
parseJsxOpeningOrSelfClosingElement(inExpressionContext, boolean);
Nodes.JsxOpeningElement | Nodes.JsxSelfClosingElement;
{
    var fullStart = this.scanner.getStartPos();
    this.parseExpected(TokenType.lessThan);
    var tagName = this.parseJsxElementName();
    var attributes = this.parseList(Nodes.ParsingContext.JsxAttributes, this.parseJsxAttribute);
    var node = void 0;
    if (this.token === TokenType.greaterThan) {
        // Nodes.Closing tag, so scan the immediately-following text with the Nodes.JSX scanning instead
        // of regular scanning to avoid treating illegal characters (e.g. '#') as immediate
        // scanning errors
        node = this.createNode(TokenType.JsxOpeningElement, fullStart);
        this.scanJsxText();
    }
    else {
        this.parseExpected(TokenType.slash);
        if (inExpressionContext) {
            this.parseExpected(TokenType.greaterThan);
        }
        else {
            this.parseExpected(TokenType.greaterThan, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
            this.scanJsxText();
        }
        node = this.createNode(TokenType.JsxSelfClosingElement, fullStart);
    }
    node.tagName = tagName;
    node.attributes = attributes;
    return this.finishNode(node);
}
parseJsxElementName();
Nodes.JsxTagNameExpression;
{
    this.scanJsxIdentifier();
    // Nodes.JsxElement can have name in the form of
    //      propertyAccessExpression
    //      primaryExpression in the form of an identifier and "this" keyword
    // Nodes.We can't just simply use this.parseLeftHandSideExpressionOrHigher because then we will start consider class,function etc as a keyword
    // Nodes.We only want to consider "this" as a primaryExpression
    var expression = this.token === TokenType.this ?
        this.parseTokenNode() : this.parseIdentifierName();
    while (this.parseOptional(TokenType.dot)) {
        var propertyAccess = this.createNode(TokenType.PropertyAccessExpression, expression.pos);
        propertyAccess.expression = expression;
        propertyAccess.name = this.parseRightSideOfDot(/*allowIdentifierNames*/ true);
        expression = this.finishNode(propertyAccess);
    }
    return expression;
}
parseJsxExpression(inExpressionContext, boolean);
Nodes.JsxExpression;
{
    var node = this.createNode(TokenType.JsxExpression);
    this.parseExpected(TokenType.openBrace);
    if (this.token !== TokenType.closeBrace) {
        node.expression = this.parseAssignmentExpressionOrHigher();
    }
    if (inExpressionContext) {
        this.parseExpected(TokenType.closeBrace);
    }
    else {
        this.parseExpected(TokenType.closeBrace, /*message*/ undefined, /*shouldAdvance*/ false);
        this.scanJsxText();
    }
    return this.finishNode(node);
}
parseJsxAttribute();
Nodes.JsxAttribute | Nodes.JsxSpreadAttribute;
{
    if (this.token === TokenType.openBrace) {
        return this.parseJsxSpreadAttribute();
    }
    this.scanJsxIdentifier();
    var node = this.createNode(TokenType.JsxAttribute);
    node.name = this.parseIdentifierName();
    if (this.parseOptional(TokenType.equals)) {
        switch (this.token) {
            case TokenType.StringLiteral:
                node.initializer = this.parseLiteralNode();
                break;
            default:
                node.initializer = this.parseJsxExpression(/*inExpressionContext*/ true);
                break;
        }
    }
    return this.finishNode(node);
}
parseJsxSpreadAttribute();
Nodes.JsxSpreadAttribute;
{
    var node = this.createNode(TokenType.JsxSpreadAttribute);
    this.parseExpected(TokenType.openBrace);
    this.parseExpected(TokenType.dotDotDot);
    node.expression = this.parseExpression();
    this.parseExpected(TokenType.closeBrace);
    return this.finishNode(node);
}
parseJsxClosingElement(inExpressionContext, boolean);
Nodes.JsxClosingElement;
{
    var node = this.createNode(TokenType.JsxClosingElement);
    this.parseExpected(TokenType.lessThanSlash);
    node.tagName = this.parseJsxElementName();
    if (inExpressionContext) {
        this.parseExpected(TokenType.greaterThan);
    }
    else {
        this.parseExpected(TokenType.greaterThan, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
        this.scanJsxText();
    }
    return this.finishNode(node);
}
parseTypeAssertion();
Nodes.TypeAssertion;
{
    var node = this.createNode(TokenType.TypeAssertionExpression);
    this.parseExpected(TokenType.lessThan);
    node.type = this.parseType();
    this.parseExpected(TokenType.greaterThan);
    node.expression = this.parseSimpleUnaryExpression();
    return this.finishNode(node);
}
parseMemberExpressionRest(expression, Nodes.LeftHandSideExpression);
Nodes.MemberExpression;
{
    while (true) {
        var dotToken = this.parseOptionalToken(TokenType.dot);
        if (dotToken) {
            var propertyAccess = this.createNode(TokenType.PropertyAccessExpression, expression.pos);
            propertyAccess.expression = expression;
            propertyAccess.name = this.parseRightSideOfDot(/*allowIdentifierNames*/ true);
            expression = this.finishNode(propertyAccess);
            continue;
        }
        if (this.token === TokenType.exclamation && !this.scanner.hasPrecedingLineBreak()) {
            this.nextToken();
            var nonNullExpression = this.createNode(TokenType.NonNullExpression, expression.pos);
            nonNullExpression.expression = expression;
            expression = this.finishNode(nonNullExpression);
            continue;
        }
        // when in the [Nodes.Decorator] context, we do not parse Nodes.ElementAccess as it could be part of a Nodes.ComputedPropertyName
        if (!this.inDecoratorContext() && this.parseOptional(TokenType.openBracket)) {
            var indexedAccess = this.createNode(TokenType.ElementAccessExpression, expression.pos);
            indexedAccess.expression = expression;
            // Nodes.It's not uncommon for a user to write: "new Nodes.Type[]".
            // Nodes.Check for that common pattern and report a better error message.
            if (this.token !== TokenType.closeBracket) {
                indexedAccess.argumentExpression = this.allowInAnd(this.parseExpression);
                if (indexedAccess.argumentExpression.kind === TokenType.StringLiteral || indexedAccess.argumentExpression.kind === TokenType.NumericLiteral) {
                    var literal = indexedAccess.argumentExpression;
                    literal.text = this.internIdentifier(literal.text);
                }
            }
            this.parseExpected(TokenType.closeBracket);
            expression = this.finishNode(indexedAccess);
            continue;
        }
        if (this.token === TokenType.NoSubstitutionTemplateLiteral || this.token === TokenType.TemplateHead) {
            var tagExpression = this.createNode(TokenType.TaggedTemplateExpression, expression.pos);
            tagExpression.tag = expression;
            tagExpression.template = this.token === TokenType.NoSubstitutionTemplateLiteral
                ? this.parseLiteralNode()
                : this.parseTemplateExpression();
            expression = this.finishNode(tagExpression);
            continue;
        }
        return expression;
    }
}
parseCallExpressionRest(expression, Nodes.LeftHandSideExpression);
Nodes.LeftHandSideExpression;
{
    while (true) {
        expression = this.parseMemberExpressionRest(expression);
        if (this.token === TokenType.lessThan) {
            // Nodes.See if this is the start of a generic invocation.  Nodes.If so, consume it and
            // keep checking for postfix expressions.  Nodes.Otherwise, it's just a '<' that's
            // part of an arithmetic expression.  Nodes.Break out so we consume it higher in the
            // stack.
            var typeArguments = this.tryParse(this.parseTypeArgumentsInExpression);
            if (!typeArguments) {
                return expression;
            }
            var callExpr = this.createNode(TokenType.CallExpression, expression.pos);
            callExpr.expression = expression;
            callExpr.typeArguments = typeArguments;
            callExpr.arguments = this.parseArgumentList();
            expression = this.finishNode(callExpr);
            continue;
        }
        else if (this.token === TokenType.openParen) {
            var callExpr = this.createNode(TokenType.CallExpression, expression.pos);
            callExpr.expression = expression;
            callExpr.arguments = this.parseArgumentList();
            expression = this.finishNode(callExpr);
            continue;
        }
        return expression;
    }
}
parseArgumentList();
{
    this.parseExpected(TokenType.openParen);
    var ;
    this.result = this.parseDelimitedList(Nodes.ParsingContext.ArgumentExpressions, this.parseArgumentExpression);
    this.parseExpected(TokenType.closeParen);
    return this.result;
}
parseTypeArgumentsInExpression();
{
    if (!this.parseOptional(TokenType.lessThan)) {
        return undefined;
    }
    var typeArguments = this.parseDelimitedList(Nodes.ParsingContext.TypeArguments, this.parseType);
    if (!this.parseExpected(TokenType.greaterThan)) {
        // Nodes.If it doesn't have the closing >  then it's definitely not an type argument list.
        return undefined;
    }
    // Nodes.If we have a '<', then only parse this as a argument list if the type arguments
    // are complete and we have an open paren.  if we don't, rewind and return nothing.
    return typeArguments && this.canFollowTypeArgumentsInExpression()
        ? typeArguments
        : undefined;
}
canFollowTypeArgumentsInExpression();
boolean;
{
    switch (this.token) {
        case TokenType.openParen: // foo<x>(
        // this case are the only case where this this.token can legally follow a type argument
        // list.  Nodes.So we definitely want to treat this as a type arg list.
        case TokenType.dot: // foo<x>.
        case TokenType.closeParen: // foo<x>)
        case TokenType.closeBracket: // foo<x>]
        case TokenType.colon: // foo<x>:
        case TokenType.semicolon: // foo<x>;
        case TokenType.question: // foo<x>?
        case TokenType.equalsEquals: // foo<x> ==
        case TokenType.equalsEqualsEquals: // foo<x> ===
        case TokenType.exclamationEquals: // foo<x> !=
        case TokenType.exclamationEqualsEquals: // foo<x> !==
        case TokenType.ampersandAmpersand: // foo<x> &&
        case TokenType.barBar: // foo<x> ||
        case TokenType.caret: // foo<x> ^
        case TokenType.ampersand: // foo<x> &
        case TokenType.bar: // foo<x> |
        case TokenType.closeBrace: // foo<x> }
        case TokenType.endOfFile:
            // these cases can't legally follow a type arg list.  Nodes.However, they're not legal
            // expressions either.  Nodes.The user is probably in the middle of a generic type. Nodes.So
            // treat it as such.
            return true;
        case TokenType.comma: // foo<x>,
        case TokenType.openBrace: // foo<x> {
        // Nodes.We don't want to treat these as type arguments.  Nodes.Otherwise we'll parse this
        // as an invocation expression.  Nodes.Instead, we want to parse out the expression
        // in isolation from the type arguments.
        default:
            // Nodes.Anything else treat as an expression.
            return false;
    }
}
parsePrimaryExpression();
Nodes.PrimaryExpression;
{
    switch (this.token) {
        case TokenType.NumericLiteral:
        case TokenType.StringLiteral:
        case TokenType.NoSubstitutionTemplateLiteral:
            return this.parseLiteralNode();
        case TokenType.this:
        case TokenType.super:
        case TokenType.null:
        case TokenType.true:
        case TokenType.false:
            return this.parseTokenNode();
        case TokenType.openParen:
            return this.parseParenthesizedExpression();
        case TokenType.openBracket:
            return this.parseArrayLiteralExpression();
        case TokenType.openBrace:
            return this.parseObjectLiteralExpression();
        case TokenType.async:
            // Nodes.Async arrow functions are parsed earlier in this.parseAssignmentExpressionOrHigher.
            // Nodes.If we encounter `async [no Nodes.LineTerminator here] function` then this is an async
            // function; otherwise, its an identifier.
            if (!this.lookAhead(this.nextTokenIsFunctionKeywordOnSameLine)) {
                break;
            }
            return this.parseFunctionExpression();
        case TokenType.class:
            return this.parseClassExpression();
        case TokenType.function:
            return this.parseFunctionExpression();
        case TokenType.new:
            return this.parseNewExpression();
        case TokenType.slash:
        case TokenType.slashEquals:
            if (this.reScanSlashToken() === TokenType.RegularExpressionLiteral) {
                return this.parseLiteralNode();
            }
            break;
        case TokenType.TemplateHead:
            return this.parseTemplateExpression();
    }
    return this.parseIdentifier(Nodes.Diagnostics.Expression_expected);
}
parseParenthesizedExpression();
Nodes.ParenthesizedExpression;
{
    var node = this.createNode(TokenType.ParenthesizedExpression);
    this.parseExpected(TokenType.openParen);
    node.expression = this.allowInAnd(this.parseExpression);
    this.parseExpected(TokenType.closeParen);
    return this.finishNode(node);
}
parseSpreadElement();
Nodes.Expression;
{
    var node = this.createNode(TokenType.SpreadElementExpression);
    this.parseExpected(TokenType.dotDotDot);
    node.expression = this.parseAssignmentExpressionOrHigher();
    return this.finishNode(node);
}
parseArgumentOrArrayLiteralElement();
Nodes.Expression;
{
    return this.token === TokenType.dotDotDot ? this.parseSpreadElement() :
        this.token === TokenType.comma ? this.createNode(TokenType.OmittedExpression) :
            this.parseAssignmentExpressionOrHigher();
}
parseArgumentExpression();
Nodes.Expression;
{
    return this.doOutsideOfContext(this.disallowInAndDecoratorContext, this.parseArgumentOrArrayLiteralElement);
}
parseArrayLiteralExpression();
Nodes.ArrayLiteralExpression;
{
    var node = this.createNode(TokenType.ArrayLiteralExpression);
    this.parseExpected(TokenType.openBracket);
    if (this.scanner.hasPrecedingLineBreak()) {
        node.multiLine = true;
    }
    node.elements = this.parseDelimitedList(Nodes.ParsingContext.ArrayLiteralMembers, this.parseArgumentOrArrayLiteralElement);
    this.parseExpected(TokenType.closeBracket);
    return this.finishNode(node);
}
tryParseAccessorDeclaration(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray);
Nodes.AccessorDeclaration;
{
    if (this.parseContextualModifier(TokenType.get)) {
        return this.addJSDocComment(this.parseAccessorDeclaration(TokenType.GetAccessor, fullStart, decorators, modifiers));
    }
    else if (this.parseContextualModifier(TokenType.set)) {
        return this.parseAccessorDeclaration(TokenType.SetAccessor, fullStart, decorators, modifiers);
    }
    return undefined;
}
parseObjectLiteralElement();
Nodes.ObjectLiteralElement;
{
    var fullStart = this.scanner.getStartPos();
    var decorators = this.parseDecorators();
    var modifiers = this.parseModifiers();
    var accessor = this.tryParseAccessorDeclaration(fullStart, decorators, modifiers);
    if (accessor) {
        return accessor;
    }
    var asteriskToken = this.parseOptionalToken(TokenType.asterisk);
    var tokenIsIdentifier = this.isIdentifier();
    var propertyName = this.parsePropertyName();
    // Nodes.Disallowing of optional property assignments happens in the grammar checker.
    var questionToken = this.parseOptionalToken(TokenType.question);
    if (asteriskToken || this.token === TokenType.openParen || this.token === TokenType.lessThan) {
        return this.parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, propertyName, questionToken);
    }
    // check if it is short-hand property assignment or normal property assignment
    // Nodes.NOTE: if this.token is Nodes.EqualsToken it is interpreted as Nodes.CoverInitializedName production
    // Nodes.CoverInitializedName[Nodes.Yield] :
    //     Nodes.IdentifierReference[?Nodes.Yield] Nodes.Initializer[Nodes.In, ?Nodes.Yield]
    // this is necessary because Nodes.ObjectLiteral productions are also used to cover grammar for Nodes.ObjectAssignmentPattern
    var isShorthandPropertyAssignment = tokenIsIdentifier && (this.token === TokenType.comma || this.token === TokenType.closeBrace || this.token === TokenType.equals);
    if (isShorthandPropertyAssignment) {
        var shorthandDeclaration = this.createNode(TokenType.ShorthandPropertyAssignment, fullStart);
        shorthandDeclaration.name = propertyName;
        shorthandDeclaration.questionToken = questionToken;
        var equalsToken = this.parseOptionalToken(TokenType.equals);
        if (equalsToken) {
            shorthandDeclaration.equalsToken = equalsToken;
            shorthandDeclaration.objectAssignmentInitializer = this.allowInAnd(this.parseAssignmentExpressionOrHigher);
        }
        return this.addJSDocComment(this.finishNode(shorthandDeclaration));
    }
    else {
        var propertyAssignment = this.createNode(TokenType.PropertyAssignment, fullStart);
        propertyAssignment.modifiers = modifiers;
        propertyAssignment.name = propertyName;
        propertyAssignment.questionToken = questionToken;
        this.parseExpected(TokenType.colon);
        propertyAssignment.initializer = this.allowInAnd(this.parseAssignmentExpressionOrHigher);
        return this.addJSDocComment(this.finishNode(propertyAssignment));
    }
}
parseObjectLiteralExpression();
Nodes.ObjectLiteralExpression;
{
    var node = this.createNode(TokenType.ObjectLiteralExpression);
    this.parseExpected(TokenType.openBrace);
    if (this.scanner.hasPrecedingLineBreak()) {
        node.multiLine = true;
    }
    node.properties = this.parseDelimitedList(Nodes.ParsingContext.ObjectLiteralMembers, this.parseObjectLiteralElement, /*considerSemicolonAsDelimiter*/ true);
    this.parseExpected(TokenType.closeBrace);
    return this.finishNode(node);
}
parseFunctionExpression();
Nodes.FunctionExpression;
{
    // Nodes.GeneratorExpression:
    //      function* Nodes.BindingIdentifier [Nodes.Yield][opt](Nodes.FormalParameters[Nodes.Yield]){ Nodes.GeneratorBody }
    //
    // Nodes.FunctionExpression:
    //      function Nodes.BindingIdentifier[opt](Nodes.FormalParameters){ Nodes.FunctionBody }
    var saveDecoratorContext = this.inDecoratorContext();
    if (saveDecoratorContext) {
        this.setDecoratorContext(/*val*/ false);
    }
    var node = this.createNode(TokenType.FunctionExpression);
    this.setModifiers(node, this.parseModifiers());
    this.parseExpected(TokenType.function);
    node.asteriskToken = this.parseOptionalToken(TokenType.asterisk);
    var isGenerator = !!node.asteriskToken;
    var isAsync = !!(node.flags & Nodes.NodeFlags.Async);
    node.name =
        isGenerator && isAsync ? this.doInYieldAndAwaitContext(this.parseOptionalIdentifier) :
            isGenerator ? this.doInYieldContext(this.parseOptionalIdentifier) :
                isAsync ? this.doInAwaitContext(this.parseOptionalIdentifier) :
                    this.parseOptionalIdentifier();
    this.fillSignature(TokenType.colon, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, node);
    node.body = this.parseFunctionBlock(/*allowYield*/ isGenerator, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);
    if (saveDecoratorContext) {
        this.setDecoratorContext(/*val*/ true);
    }
    return this.addJSDocComment(this.finishNode(node));
}
parseOptionalIdentifier();
{
    return this.isIdentifier() ? this.parseIdentifier() : undefined;
}
parseNewExpression();
Nodes.NewExpression;
{
    var node = this.createNode(TokenType.NewExpression);
    this.parseExpected(TokenType.new);
    node.expression = this.parseMemberExpressionOrHigher();
    node.typeArguments = this.tryParse(this.parseTypeArgumentsInExpression);
    if (node.typeArguments || this.token === TokenType.openParen) {
        node.arguments = this.parseArgumentList();
    }
    return this.finishNode(node);
}
parseBlock(ignoreMissingOpenBrace, boolean, diagnosticMessage ?  : Nodes.DiagnosticMessage);
Nodes.Block;
{
    var node = this.createNode(TokenType.Block);
    if (this.parseExpected(TokenType.openBrace, diagnosticMessage) || ignoreMissingOpenBrace) {
        node.statements = this.parseList(Nodes.ParsingContext.BlockStatements, this.parseStatement);
        this.parseExpected(TokenType.closeBrace);
    }
    else {
        node.statements = this.createMissingList();
    }
    return this.finishNode(node);
}
parseFunctionBlock(allowYield, boolean, allowAwait, boolean, ignoreMissingOpenBrace, boolean, diagnosticMessage ?  : Nodes.DiagnosticMessage);
Nodes.Block;
{
    var savedYieldContext = this.inYieldContext();
    this.setYieldContext(allowYield);
    var savedAwaitContext = this.inAwaitContext();
    this.setAwaitContext(allowAwait);
    // Nodes.We may be in a [Nodes.Decorator] context when parsing a function expression or
    // arrow function. Nodes.The body of the function is not in [Nodes.Decorator] context.
    var saveDecoratorContext = this.inDecoratorContext();
    if (saveDecoratorContext) {
        this.setDecoratorContext(/*val*/ false);
    }
    var block = this.parseBlock(ignoreMissingOpenBrace, diagnosticMessage);
    if (saveDecoratorContext) {
        this.setDecoratorContext(/*val*/ true);
    }
    this.setYieldContext(savedYieldContext);
    this.setAwaitContext(savedAwaitContext);
    return block;
}
parseEmptyStatement();
Nodes.Statement;
{
    var node = this.createNode(TokenType.EmptyStatement);
    this.parseExpected(TokenType.semicolon);
    return this.finishNode(node);
}
parseIfStatement();
Nodes.IfStatement;
{
    var node = this.createNode(TokenType.IfStatement);
    this.parseExpected(TokenType.if);
    this.parseExpected(TokenType.openParen);
    node.expression = this.allowInAnd(this.parseExpression);
    this.parseExpected(TokenType.closeParen);
    node.thenStatement = this.parseStatement();
    node.elseStatement = this.parseOptional(TokenType.else) ? this.parseStatement() : undefined;
    return this.finishNode(node);
}
parseDoStatement();
Nodes.DoStatement;
{
    var node = this.createNode(TokenType.DoStatement);
    this.parseExpected(TokenType.do);
    node.statement = this.parseStatement();
    this.parseExpected(TokenType.while);
    this.parseExpected(TokenType.openParen);
    node.expression = this.allowInAnd(this.parseExpression);
    this.parseExpected(TokenType.closeParen);
    // Nodes.From: https://mail.mozilla.org/pipermail/es-discuss/2011-Nodes.August/016188.html
    // 157 min --- Nodes.All allen at wirfs-brock.com Nodes.CONF --- "do{;}while(false)false" prohibited in
    // spec but allowed in consensus reality. Nodes.Approved -- this is the de-facto standard whereby
    //  do;while(0)x will have a semicolon inserted before x.
    this.parseOptional(TokenType.semicolon);
    return this.finishNode(node);
}
parseWhileStatement();
Nodes.WhileStatement;
{
    var node = this.createNode(TokenType.WhileStatement);
    this.parseExpected(TokenType.while);
    this.parseExpected(TokenType.openParen);
    node.expression = this.allowInAnd(this.parseExpression);
    this.parseExpected(TokenType.closeParen);
    node.statement = this.parseStatement();
    return this.finishNode(node);
}
parseForOrForInOrForOfStatement();
Nodes.Statement;
{
    var pos = this.getNodePos();
    this.parseExpected(TokenType.for);
    this.parseExpected(TokenType.openParen);
    var initializer = undefined;
    if (this.token !== TokenType.semicolon) {
        if (this.token === TokenType.var || this.token === TokenType.let || this.token === TokenType.const) {
            initializer = this.parseVariableDeclarationList(/*inForStatementInitializer*/ true);
        }
        else {
            initializer = this.disallowInAnd(this.parseExpression);
        }
    }
    var forOrForInOrForOfStatement = void 0;
    if (this.parseOptional(TokenType.in)) {
        var forInStatement = this.createNode(TokenType.ForInStatement, pos);
        forInStatement.initializer = initializer;
        forInStatement.expression = this.allowInAnd(this.parseExpression);
        this.parseExpected(TokenType.closeParen);
        forOrForInOrForOfStatement = forInStatement;
    }
    else if (this.parseOptional(TokenType.of)) {
        var forOfStatement = this.createNode(TokenType.ForOfStatement, pos);
        forOfStatement.initializer = initializer;
        forOfStatement.expression = this.allowInAnd(this.parseAssignmentExpressionOrHigher);
        this.parseExpected(TokenType.closeParen);
        forOrForInOrForOfStatement = forOfStatement;
    }
    else {
        var forStatement = this.createNode(TokenType.ForStatement, pos);
        forStatement.initializer = initializer;
        this.parseExpected(TokenType.semicolon);
        if (this.token !== TokenType.semicolon && this.token !== TokenType.closeParen) {
            forStatement.condition = this.allowInAnd(this.parseExpression);
        }
        this.parseExpected(TokenType.semicolon);
        if (this.token !== TokenType.closeParen) {
            forStatement.incrementor = this.allowInAnd(this.parseExpression);
        }
        this.parseExpected(TokenType.closeParen);
        forOrForInOrForOfStatement = forStatement;
    }
    forOrForInOrForOfStatement.statement = this.parseStatement();
    return this.finishNode(forOrForInOrForOfStatement);
}
parseBreakOrContinueStatement(kind, TokenType);
Nodes.BreakOrContinueStatement;
{
    var node = this.createNode(kind);
    this.parseExpected(kind === TokenType.BreakStatement ? TokenType.break : TokenType.continue);
    if (!this.canParseSemicolon()) {
        node.label = this.parseIdentifier();
    }
    this.parseSemicolon();
    return this.finishNode(node);
}
parseReturnStatement();
Nodes.ReturnStatement;
{
    var node = this.createNode(TokenType.ReturnStatement);
    this.parseExpected(TokenType.return);
    if (!this.canParseSemicolon()) {
        node.expression = this.allowInAnd(this.parseExpression);
    }
    this.parseSemicolon();
    return this.finishNode(node);
}
parseWithStatement();
Nodes.WithStatement;
{
    var node = this.createNode(TokenType.WithStatement);
    this.parseExpected(TokenType.with);
    this.parseExpected(TokenType.openParen);
    node.expression = this.allowInAnd(this.parseExpression);
    this.parseExpected(TokenType.closeParen);
    node.statement = this.parseStatement();
    return this.finishNode(node);
}
parseCaseClause();
Nodes.CaseClause;
{
    var node = this.createNode(TokenType.CaseClause);
    this.parseExpected(TokenType.case);
    node.expression = this.allowInAnd(this.parseExpression);
    this.parseExpected(TokenType.colon);
    node.statements = this.parseList(Nodes.ParsingContext.SwitchClauseStatements, this.parseStatement);
    return this.finishNode(node);
}
parseDefaultClause();
Nodes.DefaultClause;
{
    var node = this.createNode(TokenType.DefaultClause);
    this.parseExpected(TokenType.default);
    this.parseExpected(TokenType.colon);
    node.statements = this.parseList(Nodes.ParsingContext.SwitchClauseStatements, this.parseStatement);
    return this.finishNode(node);
}
parseCaseOrDefaultClause();
Nodes.CaseOrDefaultClause;
{
    return this.token === TokenType.case ? this.parseCaseClause() : this.parseDefaultClause();
}
parseSwitchStatement();
Nodes.SwitchStatement;
{
    var node = this.createNode(TokenType.SwitchStatement);
    this.parseExpected(TokenType.switch);
    this.parseExpected(TokenType.openParen);
    node.expression = this.allowInAnd(this.parseExpression);
    this.parseExpected(TokenType.closeParen);
    var caseBlock = this.createNode(TokenType.CaseBlock, this.scanner.getStartPos());
    this.parseExpected(TokenType.openBrace);
    caseBlock.clauses = this.parseList(Nodes.ParsingContext.SwitchClauses, this.parseCaseOrDefaultClause);
    this.parseExpected(TokenType.closeBrace);
    node.caseBlock = this.finishNode(caseBlock);
    return this.finishNode(node);
}
parseThrowStatement();
Nodes.ThrowStatement;
{
    // Nodes.ThrowStatement[Nodes.Yield] :
    //      throw [no Nodes.LineTerminator here]Nodes.Expression[Nodes.In, ?Nodes.Yield];
    // Nodes.Because of automatic semicolon insertion, we need to report error if this
    // throw could be terminated with a semicolon.  Nodes.Note: we can't call 'this.parseExpression'
    // directly as that might consume an expression on the following line.
    // Nodes.We just return 'undefined' in that case.  Nodes.The actual error will be reported in the
    // grammar walker.
    var node = this.createNode(TokenType.ThrowStatement);
    this.parseExpected(TokenType.throw);
    node.expression = this.scanner.hasPrecedingLineBreak() ? undefined : this.allowInAnd(this.parseExpression);
    this.parseSemicolon();
    return this.finishNode(node);
}
parseTryStatement();
Nodes.TryStatement;
{
    var node = this.createNode(TokenType.TryStatement);
    this.parseExpected(TokenType.try);
    node.tryBlock = this.parseBlock(/*ignoreMissingOpenBrace*/ false);
    node.catchClause = this.token === TokenType.catch ? this.parseCatchClause() : undefined;
    // Nodes.If we don't have a catch clause, then we must have a finally clause.  Nodes.Try to parse
    // one out no matter what.
    if (!node.catchClause || this.token === TokenType.finally) {
        this.parseExpected(TokenType.finally);
        node.finallyBlock = this.parseBlock(/*ignoreMissingOpenBrace*/ false);
    }
    return this.finishNode(node);
}
parseCatchClause();
Nodes.CatchClause;
{
    var ;
    this.result = this.createNode(TokenType.CatchClause);
    this.parseExpected(TokenType.catch);
    if (this.parseExpected(TokenType.openParen)) {
        this.result.variableDeclaration = this.parseVariableDeclaration();
    }
    this.parseExpected(TokenType.closeParen);
    this.result.block = this.parseBlock(/*ignoreMissingOpenBrace*/ false);
    return this.finishNode(this.result);
}
parseDebuggerStatement();
Nodes.Statement;
{
    var node = this.createNode(TokenType.DebuggerStatement);
    this.parseExpected(TokenType.debugger);
    this.parseSemicolon();
    return this.finishNode(node);
}
parseExpressionOrLabeledStatement();
Nodes.ExpressionStatement | Nodes.LabeledStatement;
{
    // Nodes.Avoiding having to do the lookahead for a labeled statement by just trying to parse
    // out an expression, seeing if it is identifier and then seeing if it is followed by
    // a colon.
    var fullStart = this.scanner.getStartPos();
    var expression = this.allowInAnd(this.parseExpression);
    if (expression.kind === TokenType.Identifier && this.parseOptional(TokenType.colon)) {
        var labeledStatement = this.createNode(TokenType.LabeledStatement, fullStart);
        labeledStatement.label = expression;
        labeledStatement.statement = this.parseStatement();
        return this.addJSDocComment(this.finishNode(labeledStatement));
    }
    else {
        var expressionStatement = this.createNode(TokenType.ExpressionStatement, fullStart);
        expressionStatement.expression = expression;
        this.parseSemicolon();
        return this.addJSDocComment(this.finishNode(expressionStatement));
    }
}
nextTokenIsIdentifierOrKeywordOnSameLine();
{
    this.nextToken();
    return tokenIsIdentifierOrKeyword(this.token) && !this.scanner.hasPrecedingLineBreak();
}
nextTokenIsFunctionKeywordOnSameLine();
{
    this.nextToken();
    return this.token === TokenType.function && !this.scanner.hasPrecedingLineBreak();
}
nextTokenIsIdentifierOrKeywordOrNumberOnSameLine();
{
    this.nextToken();
    return (tokenIsIdentifierOrKeyword(this.token) || this.token === TokenType.NumericLiteral) && !this.scanner.hasPrecedingLineBreak();
}
isDeclaration();
boolean;
{
    while (true) {
        switch (this.token) {
            case TokenType.var:
            case TokenType.let:
            case TokenType.const:
            case TokenType.function:
            case TokenType.class:
            case TokenType.enum:
                return true;
            // 'declare', 'module', 'namespace', 'interface'* and 'type' are all legal Nodes.JavaScript this.identifiers;
            // however, an identifier cannot be followed by another identifier on the same line. Nodes.This is what we
            // count on to parse out the respective declarations. Nodes.For instance, we exploit this to say that
            //
            //    namespace n
            //
            // can be none other than the beginning of a namespace declaration, but need to respect that Nodes.JavaScript sees
            //
            //    namespace
            //    n
            //
            // as the identifier 'namespace' on one line followed by the identifier 'n' on another.
            // Nodes.We need to look one this.token ahead to see if it permissible to try parsing a declaration.
            //
            // *Nodes.Note*: 'interface' is actually a strict mode reserved word. Nodes.So while
            //
            //   "use strict"
            //   interface
            //   I {}
            //
            // could be legal, it would add complexity for very little gain.
            case TokenType.interface:
            case TokenType.type:
                return this.nextTokenIsIdentifierOnSameLine();
            case TokenType.module:
            case TokenType.namespace:
                return this.nextTokenIsIdentifierOrStringLiteralOnSameLine();
            case TokenType.abstract:
            case TokenType.async:
            case TokenType.declare:
            case TokenType.private:
            case TokenType.protected:
            case TokenType.public:
            case TokenType.readonly:
                this.nextToken();
                // Nodes.ASI takes effect for this modifier.
                if (this.scanner.hasPrecedingLineBreak()) {
                    return false;
                }
                continue;
            case TokenType.global:
                this.nextToken();
                return this.token === TokenType.openBrace || this.token === TokenType.Identifier || this.token === TokenType.export;
            case TokenType.import:
                this.nextToken();
                return this.token === TokenType.StringLiteral || this.token === TokenType.asterisk ||
                    this.token === TokenType.openBrace || tokenIsIdentifierOrKeyword(this.token);
            case TokenType.export:
                this.nextToken();
                if (this.token === TokenType.equals || this.token === TokenType.asterisk ||
                    this.token === TokenType.openBrace || this.token === TokenType.default ||
                    this.token === TokenType.as) {
                    return true;
                }
                continue;
            case TokenType.static:
                this.nextToken();
                continue;
            default:
                return false;
        }
    }
}
isStartOfDeclaration();
boolean;
{
    return this.lookAhead(this.isDeclaration);
}
isStartOfStatement();
boolean;
{
    switch (this.token) {
        case TokenType.at:
        case TokenType.semicolon:
        case TokenType.openBrace:
        case TokenType.var:
        case TokenType.let:
        case TokenType.function:
        case TokenType.class:
        case TokenType.enum:
        case TokenType.if:
        case TokenType.do:
        case TokenType.while:
        case TokenType.for:
        case TokenType.continue:
        case TokenType.break:
        case TokenType.return:
        case TokenType.with:
        case TokenType.switch:
        case TokenType.throw:
        case TokenType.try:
        case TokenType.debugger:
        // 'catch' and 'finally' do not actually indicate that the code is part of a statement,
        // however, we say they are here so that we may gracefully parse them and error later.
        case TokenType.catch:
        case TokenType.finally:
            return true;
        case TokenType.const:
        case TokenType.export:
        case TokenType.import:
            return this.isStartOfDeclaration();
        case TokenType.async:
        case TokenType.declare:
        case TokenType.interface:
        case TokenType.module:
        case TokenType.namespace:
        case TokenType.type:
        case TokenType.global:
            // Nodes.When these don't start a declaration, they're an identifier in an expression statement
            return true;
        case TokenType.public:
        case TokenType.private:
        case TokenType.protected:
        case TokenType.static:
        case TokenType.readonly:
            // Nodes.When these don't start a declaration, they may be the start of a class member if an identifier
            // immediately follows. Nodes.Otherwise they're an identifier in an expression statement.
            return this.isStartOfDeclaration() || !this.lookAhead(this.nextTokenIsIdentifierOrKeywordOnSameLine);
        default:
            return this.isStartOfExpression();
    }
}
nextTokenIsIdentifierOrStartOfDestructuring();
{
    this.nextToken();
    return this.isIdentifier() || this.token === TokenType.openBrace || this.token === TokenType.openBracket;
}
isLetDeclaration();
{
    // Nodes.In Nodes.ES6 'let' always starts a lexical declaration if followed by an identifier or {
    // or [.
    return this.lookAhead(this.nextTokenIsIdentifierOrStartOfDestructuring);
}
parseStatement();
Nodes.Statement;
{
    switch (this.token) {
        case TokenType.semicolon:
            return this.parseEmptyStatement();
        case TokenType.openBrace:
            return this.parseBlock(/*ignoreMissingOpenBrace*/ false);
        case TokenType.var:
            return this.parseVariableStatement(this.scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
        case TokenType.let:
            if (this.isLetDeclaration()) {
                return this.parseVariableStatement(this.scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            }
            break;
        case TokenType.function:
            return this.parseFunctionDeclaration(this.scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
        case TokenType.class:
            return this.parseClassDeclaration(this.scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
        case TokenType.if:
            return this.parseIfStatement();
        case TokenType.do:
            return this.parseDoStatement();
        case TokenType.while:
            return this.parseWhileStatement();
        case TokenType.for:
            return this.parseForOrForInOrForOfStatement();
        case TokenType.continue:
            return this.parseBreakOrContinueStatement(TokenType.ContinueStatement);
        case TokenType.break:
            return this.parseBreakOrContinueStatement(TokenType.BreakStatement);
        case TokenType.return:
            return this.parseReturnStatement();
        case TokenType.with:
            return this.parseWithStatement();
        case TokenType.switch:
            return this.parseSwitchStatement();
        case TokenType.throw:
            return this.parseThrowStatement();
        case TokenType.try:
        // Nodes.Include 'catch' and 'finally' for error recovery.
        case TokenType.catch:
        case TokenType.finally:
            return this.parseTryStatement();
        case TokenType.debugger:
            return this.parseDebuggerStatement();
        case TokenType.at:
            return this.parseDeclaration();
        case TokenType.async:
        case TokenType.interface:
        case TokenType.type:
        case TokenType.module:
        case TokenType.namespace:
        case TokenType.declare:
        case TokenType.const:
        case TokenType.enum:
        case TokenType.export:
        case TokenType.import:
        case TokenType.private:
        case TokenType.protected:
        case TokenType.public:
        case TokenType.abstract:
        case TokenType.static:
        case TokenType.readonly:
        case TokenType.global:
            if (this.isStartOfDeclaration()) {
                return this.parseDeclaration();
            }
            break;
    }
    return this.parseExpressionOrLabeledStatement();
}
parseDeclaration();
Nodes.Statement;
{
    var fullStart = this.getNodePos();
    var decorators = this.parseDecorators();
    var modifiers = this.parseModifiers();
    switch (this.token) {
        case TokenType.var:
        case TokenType.let:
        case TokenType.const:
            return this.parseVariableStatement(fullStart, decorators, modifiers);
        case TokenType.function:
            return this.parseFunctionDeclaration(fullStart, decorators, modifiers);
        case TokenType.class:
            return this.parseClassDeclaration(fullStart, decorators, modifiers);
        case TokenType.interface:
            return this.parseInterfaceDeclaration(fullStart, decorators, modifiers);
        case TokenType.type:
            return this.parseTypeAliasDeclaration(fullStart, decorators, modifiers);
        case TokenType.enum:
            return this.parseEnumDeclaration(fullStart, decorators, modifiers);
        case TokenType.global:
        case TokenType.module:
        case TokenType.namespace:
            return this.parseModuleDeclaration(fullStart, decorators, modifiers);
        case TokenType.import:
            return this.parseImportDeclarationOrImportEqualsDeclaration(fullStart, decorators, modifiers);
        case TokenType.export:
            this.nextToken();
            switch (this.token) {
                case TokenType.default:
                case TokenType.equals:
                    return this.parseExportAssignment(fullStart, decorators, modifiers);
                case TokenType.as:
                    return this.parseNamespaceExportDeclaration(fullStart, decorators, modifiers);
                default:
                    return this.parseExportDeclaration(fullStart, decorators, modifiers);
            }
        default:
            if (decorators || modifiers) {
                // Nodes.We reached this point because we encountered decorators and/or modifiers and assumed a declaration
                // would follow. Nodes.For recovery and error reporting purposes, return an incomplete declaration.
                var node = this.createMissingNode(TokenType.MissingDeclaration, /*reportAtCurrentPosition*/ true, Nodes.Diagnostics.Declaration_expected);
                node.pos = fullStart;
                node.decorators = decorators;
                this.setModifiers(node, modifiers);
                return this.finishNode(node);
            }
    }
}
nextTokenIsIdentifierOrStringLiteralOnSameLine();
{
    this.nextToken();
    return !this.scanner.hasPrecedingLineBreak() && (this.isIdentifier() || this.token === TokenType.StringLiteral);
}
parseFunctionBlockOrSemicolon(isGenerator, boolean, isAsync, boolean, diagnosticMessage ?  : Nodes.DiagnosticMessage);
Nodes.Block;
{
    if (this.token !== TokenType.openBrace && this.canParseSemicolon()) {
        this.parseSemicolon();
        return;
    }
    return this.parseFunctionBlock(isGenerator, isAsync, /*ignoreMissingOpenBrace*/ false, diagnosticMessage);
}
parseArrayBindingElement();
Nodes.BindingElement;
{
    if (this.token === TokenType.comma) {
        return this.createNode(TokenType.OmittedExpression);
    }
    var node = this.createNode(TokenType.BindingElement);
    node.dotDotDotToken = this.parseOptionalToken(TokenType.dotDotDot);
    node.name = this.parseIdentifierOrPattern();
    node.initializer = this.parseBindingElementInitializer(/*inParameter*/ false);
    return this.finishNode(node);
}
parseObjectBindingElement();
Nodes.BindingElement;
{
    var node = this.createNode(TokenType.BindingElement);
    var tokenIsIdentifier = this.isIdentifier();
    var propertyName = this.parsePropertyName();
    if (tokenIsIdentifier && this.token !== TokenType.colon) {
        node.name = propertyName;
    }
    else {
        this.parseExpected(TokenType.colon);
        node.propertyName = propertyName;
        node.name = this.parseIdentifierOrPattern();
    }
    node.initializer = this.parseBindingElementInitializer(/*inParameter*/ false);
    return this.finishNode(node);
}
parseObjectBindingPattern();
Nodes.BindingPattern;
{
    var node = this.createNode(TokenType.ObjectBindingPattern);
    this.parseExpected(TokenType.openBrace);
    node.elements = this.parseDelimitedList(Nodes.ParsingContext.ObjectBindingElements, this.parseObjectBindingElement);
    this.parseExpected(TokenType.closeBrace);
    return this.finishNode(node);
}
parseArrayBindingPattern();
Nodes.BindingPattern;
{
    var node = this.createNode(TokenType.ArrayBindingPattern);
    this.parseExpected(TokenType.openBracket);
    node.elements = this.parseDelimitedList(Nodes.ParsingContext.ArrayBindingElements, this.parseArrayBindingElement);
    this.parseExpected(TokenType.closeBracket);
    return this.finishNode(node);
}
isIdentifierOrPattern();
{
    return this.token === TokenType.openBrace || this.token === TokenType.openBracket || this.isIdentifier();
}
parseIdentifierOrPattern();
Nodes.Identifier | Nodes.BindingPattern;
{
    if (this.token === TokenType.openBracket) {
        return this.parseArrayBindingPattern();
    }
    if (this.token === TokenType.openBrace) {
        return this.parseObjectBindingPattern();
    }
    return this.parseIdentifier();
}
parseVariableDeclaration();
Nodes.VariableDeclaration;
{
    var node = this.createNode(TokenType.VariableDeclaration);
    node.name = this.parseIdentifierOrPattern();
    node.type = this.parseTypeAnnotation();
    if (!this.isInOrOfKeyword(this.token)) {
        node.initializer = this.parseInitializer(/*inParameter*/ false);
    }
    return this.finishNode(node);
}
parseVariableDeclarationList(inForStatementInitializer, boolean);
Nodes.VariableDeclarationList;
{
    var node = this.createNode(TokenType.VariableDeclarationList);
    switch (this.token) {
        case TokenType.var:
            break;
        case TokenType.let:
            node.flags |= Nodes.NodeFlags.Let;
            break;
        case TokenType.const:
            node.flags |= Nodes.NodeFlags.Const;
            break;
        default:
            Nodes.Debug.fail();
    }
    this.nextToken();
    // Nodes.The user may have written the following:
    //
    //    for (let of X) { }
    //
    // Nodes.In this case, we want to parse an empty declaration list, and then parse 'of'
    // as a keyword. Nodes.The reason this is not automatic is that 'of' is a valid identifier.
    // Nodes.So we need to look ahead to determine if 'of' should be treated as a keyword in
    // this context.
    // Nodes.The checker will then give an error that there is an empty declaration list.
    if (this.token === TokenType.of && this.lookAhead(this.canFollowContextualOfKeyword)) {
        node.declarations = this.createMissingList();
    }
    else {
        var savedDisallowIn = this.inDisallowInContext();
        this.setDisallowInContext(inForStatementInitializer);
        node.declarations = this.parseDelimitedList(Nodes.ParsingContext.VariableDeclarations, this.parseVariableDeclaration);
        this.setDisallowInContext(savedDisallowIn);
    }
    return this.finishNode(node);
}
canFollowContextualOfKeyword();
boolean;
{
    return this.nextTokenIsIdentifier() && this.nextToken() === TokenType.closeParen;
}
parseVariableStatement(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray);
Nodes.VariableStatement;
{
    var node = this.createNode(TokenType.VariableStatement, fullStart);
    node.decorators = decorators;
    this.setModifiers(node, modifiers);
    node.declarationList = this.parseVariableDeclarationList(/*inForStatementInitializer*/ false);
    this.parseSemicolon();
    return this.addJSDocComment(this.finishNode(node));
}
parseFunctionDeclaration(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray);
Nodes.FunctionDeclaration;
{
    var node = this.createNode(TokenType.FunctionDeclaration, fullStart);
    node.decorators = decorators;
    this.setModifiers(node, modifiers);
    this.parseExpected(TokenType.function);
    node.asteriskToken = this.parseOptionalToken(TokenType.asterisk);
    node.name = node.flags & Nodes.NodeFlags.Default ? this.parseOptionalIdentifier() : this.parseIdentifier();
    var isGenerator = !!node.asteriskToken;
    var isAsync = !!(node.flags & Nodes.NodeFlags.Async);
    this.fillSignature(TokenType.colon, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, node);
    node.body = this.parseFunctionBlockOrSemicolon(isGenerator, isAsync, Nodes.Diagnostics.or_expected);
    return this.addJSDocComment(this.finishNode(node));
}
parseConstructorDeclaration(pos, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray);
Nodes.ConstructorDeclaration;
{
    var node = this.createNode(TokenType.Constructor, pos);
    node.decorators = decorators;
    this.setModifiers(node, modifiers);
    this.parseExpected(TokenType.constructor);
    this.fillSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
    node.body = this.parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false, Nodes.Diagnostics.or_expected);
    return this.addJSDocComment(this.finishNode(node));
}
parseMethodDeclaration(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray, asteriskToken, Nodes.Node, name, Nodes.PropertyName, questionToken, Nodes.Node, diagnosticMessage ?  : Nodes.DiagnosticMessage);
Nodes.MethodDeclaration;
{
    var method = this.createNode(TokenType.MethodDeclaration, fullStart);
    method.decorators = decorators;
    this.setModifiers(method, modifiers);
    method.asteriskToken = asteriskToken;
    method.name = name;
    method.questionToken = questionToken;
    var isGenerator = !!asteriskToken;
    var isAsync = !!(method.flags & Nodes.NodeFlags.Async);
    this.fillSignature(TokenType.colon, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, method);
    method.body = this.parseFunctionBlockOrSemicolon(isGenerator, isAsync, diagnosticMessage);
    return this.addJSDocComment(this.finishNode(method));
}
parsePropertyDeclaration(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray, name, Nodes.PropertyName, questionToken, Nodes.Node);
Nodes.ClassElement;
{
    var property = this.createNode(TokenType.PropertyDeclaration, fullStart);
    property.decorators = decorators;
    this.setModifiers(property, modifiers);
    property.name = name;
    property.questionToken = questionToken;
    property.type = this.parseTypeAnnotation();
    // Nodes.For instance properties specifically, since they are evaluated inside the constructor,
    // we do *not * want to parse yield expressions, so we specifically turn the yield context
    // off. Nodes.The grammar would look something like this:
    //
    //    Nodes.MemberVariableDeclaration[Nodes.Yield]:
    //        Nodes.AccessibilityModifier_opt   Nodes.PropertyName   Nodes.TypeAnnotation_opt   Nodes.Initializer_opt[Nodes.In];
    //        Nodes.AccessibilityModifier_opt  static_opt  Nodes.PropertyName   Nodes.TypeAnnotation_opt   Nodes.Initializer_opt[Nodes.In, ?Nodes.Yield];
    //
    // Nodes.The checker may still error in the static case to explicitly disallow the yield expression.
    property.initializer = modifiers && modifiers.flags & Nodes.NodeFlags.Static
        ? this.allowInAnd(this.parseNonParameterInitializer)
        : this.doOutsideOfContext(Nodes.NodeFlags.YieldContext | Nodes.NodeFlags.DisallowInContext, this.parseNonParameterInitializer);
    this.parseSemicolon();
    return this.finishNode(property);
}
parsePropertyOrMethodDeclaration(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray);
Nodes.ClassElement;
{
    var asteriskToken = this.parseOptionalToken(TokenType.asterisk);
    var name_2 = this.parsePropertyName();
    // Nodes.Note: this is not legal as per the grammar.  Nodes.But we allow it in the parser and
    // report an error in the grammar checker.
    var questionToken = this.parseOptionalToken(TokenType.question);
    if (asteriskToken || this.token === TokenType.openParen || this.token === TokenType.lessThan) {
        return this.parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, name_2, questionToken, Nodes.Diagnostics.or_expected);
    }
    else {
        return this.parsePropertyDeclaration(fullStart, decorators, modifiers, name_2, questionToken);
    }
}
parseNonParameterInitializer();
{
    return this.parseInitializer(/*inParameter*/ false);
}
parseAccessorDeclaration(kind, TokenType, fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray);
Nodes.AccessorDeclaration;
{
    var node = this.createNode(kind, fullStart);
    node.decorators = decorators;
    this.setModifiers(node, modifiers);
    node.name = this.parsePropertyName();
    this.fillSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
    node.body = this.parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false);
    return this.finishNode(node);
}
isClassMemberModifier(idToken, TokenType);
{
    switch (idToken) {
        case TokenType.public:
        case TokenType.private:
        case TokenType.protected:
        case TokenType.static:
        case TokenType.readonly:
            return true;
        default:
            return false;
    }
}
isClassMemberStart();
boolean;
{
    var idToken = void 0;
    if (this.token === TokenType.at) {
        return true;
    }
    // Nodes.Eat up all modifiers, but hold on to the last one in case it is actually an identifier.
    while (isModifierKind(this.token)) {
        idToken = this.token;
        // Nodes.If the idToken is a class modifier (protected, private, public, and static), it is
        // certain that we are starting to parse class member. Nodes.This allows better error recovery
        // Nodes.Example:
        //      public foo() ...     // true
        //      public @dec blah ... // true; we will then report an error later
        //      export public ...    // true; we will then report an error later
        if (this.isClassMemberModifier(idToken)) {
            return true;
        }
        this.nextToken();
    }
    if (this.token === TokenType.asterisk) {
        return true;
    }
    // Nodes.Try to get the first property-like this.token following all modifiers.
    // Nodes.This can either be an identifier or the 'get' or 'set' keywords.
    if (this.isLiteralPropertyName()) {
        idToken = this.token;
        this.nextToken();
    }
    // Nodes.Index signatures and computed properties are class members; we can parse.
    if (this.token === TokenType.openBracket) {
        return true;
    }
    // Nodes.If we were able to get any potential identifier...
    if (idToken !== undefined) {
        // Nodes.If we have a non-keyword identifier, or if we have an accessor, then it's safe to parse.
        if (!isKeyword(idToken) || idToken === TokenType.set || idToken === TokenType.get) {
            return true;
        }
        // Nodes.If it *is* a keyword, but not an accessor, check a little farther along
        // to see if it should actually be parsed as a class member.
        switch (this.token) {
            case TokenType.openParen: // Nodes.Method declaration
            case TokenType.lessThan: // Nodes.Generic Nodes.Method declaration
            case TokenType.colon: // Nodes.Type Nodes.Annotation for declaration
            case TokenType.equals: // Nodes.Initializer for declaration
            case TokenType.question:
                return true;
            default:
                // Nodes.Covers
                //  - Nodes.Semicolons     (declaration termination)
                //  - Nodes.Closing braces (end-of-class, must be declaration)
                //  - Nodes.End-of-files   (not valid, but permitted so that it gets caught later on)
                //  - Nodes.Line-breaks    (enabling *automatic semicolon insertion*)
                return this.canParseSemicolon();
        }
    }
    return false;
}
parseDecorators();
Nodes.NodeList < Nodes.Decorator > {
    let: decorators, Nodes: .NodeList(),
    while: function () { }, true:  };
{
    var decoratorStart = this.getNodePos();
    if (!this.parseOptional(TokenType.at)) {
        break;
    }
    if (!decorators) {
        decorators = [];
        decorators.pos = decoratorStart;
    }
    var decorator = this.createNode(TokenType.Decorator, decoratorStart);
    decorator.expression = this.doInDecoratorContext(this.parseLeftHandSideExpressionOrHigher);
    decorators.push(this.finishNode(decorator));
}
if (decorators) {
    decorators.end = this.getNodeEnd();
}
return decorators;
parseModifiers(permitInvalidConstAsModifier ?  : boolean);
Nodes.ModifiersArray;
{
    var flags = 0;
    var modifiers = void 0;
    while (true) {
        var modifierStart = this.scanner.getStartPos();
        var modifierKind = this.token;
        if (this.token === TokenType.const && permitInvalidConstAsModifier) {
            // Nodes.We need to ensure that any subsequent modifiers appear on the same line
            // so that when 'const' is a standalone declaration, we don't issue an error.
            if (!this.tryParse(this.nextTokenIsOnSameLineAndCanFollowModifier)) {
                break;
            }
        }
        else {
            if (!this.parseAnyContextualModifier()) {
                break;
            }
        }
        if (!modifiers) {
            modifiers = [];
            modifiers.pos = modifierStart;
        }
        flags |= modifierToFlag(modifierKind);
        modifiers.push(this.finishNode(this.createNode(modifierKind, modifierStart)));
    }
    if (modifiers) {
        modifiers.flags = flags;
        modifiers.end = this.scanner.getStartPos();
    }
    return modifiers;
}
parseModifiersForArrowFunction();
Nodes.ModifiersArray;
{
    var flags = 0;
    var modifiers = void 0;
    if (this.token === TokenType.async) {
        var modifierStart = this.scanner.getStartPos();
        var modifierKind = this.token;
        this.nextToken();
        modifiers = [];
        modifiers.pos = modifierStart;
        flags |= modifierToFlag(modifierKind);
        modifiers.push(this.finishNode(this.createNode(modifierKind, modifierStart)));
        modifiers.flags = flags;
        modifiers.end = this.scanner.getStartPos();
    }
    return modifiers;
}
parseClassElement();
Nodes.ClassElement;
{
    if (this.token === TokenType.semicolon) {
        var ;
        this.result = this.createNode(TokenType.SemicolonClassElement);
        this.nextToken();
        return this.finishNode(this.result);
    }
    var fullStart = this.getNodePos();
    var decorators = this.parseDecorators();
    var modifiers = this.parseModifiers(/*permitInvalidConstAsModifier*/ true);
    var accessor = this.tryParseAccessorDeclaration(fullStart, decorators, modifiers);
    if (accessor) {
        return accessor;
    }
    if (this.token === TokenType.constructor) {
        return this.parseConstructorDeclaration(fullStart, decorators, modifiers);
    }
    if (this.isIndexSignature()) {
        return this.parseIndexSignatureDeclaration(fullStart, decorators, modifiers);
    }
    // Nodes.It is very important that we check this *after* checking indexers because
    // the [ this.token can start an index signature or a computed property name
    if (tokenIsIdentifierOrKeyword(this.token) ||
        this.token === TokenType.StringLiteral ||
        this.token === TokenType.NumericLiteral ||
        this.token === TokenType.asterisk ||
        this.token === TokenType.openBracket) {
        return this.parsePropertyOrMethodDeclaration(fullStart, decorators, modifiers);
    }
    if (decorators || modifiers) {
        // treat this as a property declaration with a missing name.
        var name_3 = this.createMissingNode(TokenType.Identifier, /*reportAtCurrentPosition*/ true, Nodes.Diagnostics.Declaration_expected);
        return this.parsePropertyDeclaration(fullStart, decorators, modifiers, name_3, /*questionToken*/ undefined);
    }
    // 'this.isClassMemberStart' should have hinted not to attempt parsing.
    Nodes.Debug.fail("Nodes.Should not have attempted to parse class member declaration.");
}
parseClassExpression();
Nodes.ClassExpression;
{
    return this.parseClassDeclarationOrExpression(
    /*fullStart*/ this.scanner.getStartPos(), 
    /*decorators*/ undefined, 
    /*modifiers*/ undefined, TokenType.ClassExpression);
}
parseClassDeclaration(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray);
Nodes.ClassDeclaration;
{
    return this.parseClassDeclarationOrExpression(fullStart, decorators, modifiers, TokenType.ClassDeclaration);
}
parseClassDeclarationOrExpression(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray, kind, TokenType);
Nodes.ClassLikeDeclaration;
{
    var node = this.createNode(kind, fullStart);
    node.decorators = decorators;
    this.setModifiers(node, modifiers);
    this.parseExpected(TokenType.class);
    node.name = this.parseNameOfClassDeclarationOrExpression();
    node.typeParameters = this.parseTypeParameters();
    node.heritageClauses = this.parseHeritageClauses(/*isClassHeritageClause*/ true);
    if (this.parseExpected(TokenType.openBrace)) {
        // Nodes.ClassTail[Nodes.Yield,Nodes.Await] : (Nodes.Modified) Nodes.See 14.5
        //      Nodes.ClassHeritage[?Nodes.Yield,?Nodes.Await]opt { Nodes.ClassBody[?Nodes.Yield,?Nodes.Await]opt }
        node.members = this.parseClassMembers();
        this.parseExpected(TokenType.closeBrace);
    }
    else {
        node.members = this.createMissingList();
    }
    return this.finishNode(node);
}
parseNameOfClassDeclarationOrExpression();
Nodes.Identifier;
{
    // implements is a future reserved word so
    // 'class implements' might mean either
    // - class expression with omitted name, 'implements' starts heritage clause
    // - class with name 'implements'
    // 'this.isImplementsClause' helps to disambiguate between these two cases
    return this.isIdentifier() && !this.isImplementsClause()
        ? this.parseIdentifier()
        : undefined;
}
isImplementsClause();
{
    return this.token === TokenType.implements && this.lookAhead(this.nextTokenIsIdentifierOrKeyword);
}
parseHeritageClauses(isClassHeritageClause, boolean);
Nodes.NodeList < Nodes.HeritageClause > {
    // Nodes.ClassTail[Nodes.Yield,Nodes.Await] : (Nodes.Modified) Nodes.See 14.5
    //      Nodes.ClassHeritage[?Nodes.Yield,?Nodes.Await]opt { Nodes.ClassBody[?Nodes.Yield,?Nodes.Await]opt }
    if: function () { }, this: .isHeritageClause() };
{
    return this.parseList(Nodes.ParsingContext.HeritageClauses, this.parseHeritageClause);
}
return undefined;
parseHeritageClause();
{
    if (this.token === TokenType.extends || this.token === TokenType.implements) {
        var node = this.createNode(TokenType.HeritageClause);
        node.token = this.token;
        this.nextToken();
        node.types = this.parseDelimitedList(Nodes.ParsingContext.HeritageClauseElement, this.parseExpressionWithTypeArguments);
        return this.finishNode(node);
    }
    return undefined;
}
parseExpressionWithTypeArguments();
Nodes.ExpressionWithTypeArguments;
{
    var node = this.createNode(TokenType.ExpressionWithTypeArguments);
    node.expression = this.parseLeftHandSideExpressionOrHigher();
    if (this.token === TokenType.lessThan) {
        node.typeArguments = this.parseBracketedList(Nodes.ParsingContext.TypeArguments, this.parseType, TokenType.lessThan, TokenType.greaterThan);
    }
    return this.finishNode(node);
}
isHeritageClause();
boolean;
{
    return this.token === TokenType.extends || this.token === TokenType.implements;
}
parseClassMembers();
{
    return this.parseList(Nodes.ParsingContext.ClassMembers, this.parseClassElement);
}
parseInterfaceDeclaration(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray);
Nodes.InterfaceDeclaration;
{
    var node = this.createNode(TokenType.InterfaceDeclaration, fullStart);
    node.decorators = decorators;
    this.setModifiers(node, modifiers);
    this.parseExpected(TokenType.interface);
    node.name = this.parseIdentifier();
    node.typeParameters = this.parseTypeParameters();
    node.heritageClauses = this.parseHeritageClauses(/*isClassHeritageClause*/ false);
    node.members = this.parseObjectTypeMembers();
    return this.finishNode(node);
}
parseTypeAliasDeclaration(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray);
Nodes.TypeAliasDeclaration;
{
    var node = this.createNode(TokenType.TypeAliasDeclaration, fullStart);
    node.decorators = decorators;
    this.setModifiers(node, modifiers);
    this.parseExpected(TokenType.type);
    node.name = this.parseIdentifier();
    node.typeParameters = this.parseTypeParameters();
    this.parseExpected(TokenType.equals);
    node.type = this.parseType();
    this.parseSemicolon();
    return this.finishNode(node);
}
parseEnumMember();
Nodes.EnumMember;
{
    var node = this.createNode(TokenType.EnumMember, this.scanner.getStartPos());
    node.name = this.parsePropertyName();
    node.initializer = this.allowInAnd(this.parseNonParameterInitializer);
    return this.finishNode(node);
}
parseEnumDeclaration(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray);
Nodes.EnumDeclaration;
{
    var node = this.createNode(TokenType.EnumDeclaration, fullStart);
    node.decorators = decorators;
    this.setModifiers(node, modifiers);
    this.parseExpected(TokenType.enum);
    node.name = this.parseIdentifier();
    if (this.parseExpected(TokenType.openBrace)) {
        node.members = this.parseDelimitedList(Nodes.ParsingContext.EnumMembers, this.parseEnumMember);
        this.parseExpected(TokenType.closeBrace);
    }
    else {
        node.members = this.createMissingList();
    }
    return this.finishNode(node);
}
parseModuleBlock();
Nodes.ModuleBlock;
{
    var node = this.createNode(TokenType.ModuleBlock, this.scanner.getStartPos());
    if (this.parseExpected(TokenType.openBrace)) {
        node.statements = this.parseList(Nodes.ParsingContext.BlockStatements, this.parseStatement);
        this.parseExpected(TokenType.closeBrace);
    }
    else {
        node.statements = this.createMissingList();
    }
    return this.finishNode(node);
}
parseModuleOrNamespaceDeclaration(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray, flags, Nodes.NodeFlags);
Nodes.ModuleDeclaration;
{
    var node = this.createNode(TokenType.ModuleDeclaration, fullStart);
    // Nodes.If we are parsing a dotted namespace name, we want to
    // propagate the 'Nodes.Namespace' flag across the names if set.
    var namespaceFlag = flags & Nodes.NodeFlags.Namespace;
    node.decorators = decorators;
    this.setModifiers(node, modifiers);
    node.flags |= flags;
    node.name = this.parseIdentifier();
    node.body = this.parseOptional(TokenType.dot)
        ? this.parseModuleOrNamespaceDeclaration(this.getNodePos(), /*decorators*/ undefined, /*modifiers*/ undefined, Nodes.NodeFlags.Export | namespaceFlag)
        : this.parseModuleBlock();
    return this.finishNode(node);
}
parseAmbientExternalModuleDeclaration(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray);
Nodes.ModuleDeclaration;
{
    var node = this.createNode(TokenType.ModuleDeclaration, fullStart);
    node.decorators = decorators;
    this.setModifiers(node, modifiers);
    if (this.token === TokenType.global) {
        // parse 'global' as name of global scope augmentation
        node.name = this.parseIdentifier();
        node.flags |= Nodes.NodeFlags.GlobalAugmentation;
    }
    else {
        node.name = this.parseLiteralNode(/*internName*/ true);
    }
    if (this.token === TokenType.openBrace) {
        node.body = this.parseModuleBlock();
    }
    else {
        this.parseSemicolon();
    }
    return this.finishNode(node);
}
parseModuleDeclaration(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray);
Nodes.ModuleDeclaration;
{
    var flags = modifiers ? modifiers.flags : 0;
    if (this.token === TokenType.global) {
        // global augmentation
        return this.parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
    }
    else if (this.parseOptional(TokenType.namespace)) {
        flags |= Nodes.NodeFlags.Namespace;
    }
    else {
        this.parseExpected(TokenType.module);
        if (this.token === TokenType.StringLiteral) {
            return this.parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
        }
    }
    return this.parseModuleOrNamespaceDeclaration(fullStart, decorators, modifiers, flags);
}
isExternalModuleReference();
{
    return this.token === TokenType.require &&
        this.lookAhead(this.nextTokenIsOpenParen);
}
nextTokenIsOpenParen();
{
    return this.nextToken() === TokenType.openParen;
}
nextTokenIsSlash();
{
    return this.nextToken() === TokenType.slash;
}
parseNamespaceExportDeclaration(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray);
Nodes.NamespaceExportDeclaration;
{
    var exportDeclaration = this.createNode(TokenType.NamespaceExportDeclaration, fullStart);
    exportDeclaration.decorators = decorators;
    exportDeclaration.modifiers = modifiers;
    this.parseExpected(TokenType.as);
    this.parseExpected(TokenType.namespace);
    exportDeclaration.name = this.parseIdentifier();
    this.parseExpected(TokenType.semicolon);
    return this.finishNode(exportDeclaration);
}
parseImportDeclarationOrImportEqualsDeclaration(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray);
Nodes.ImportEqualsDeclaration | Nodes.ImportDeclaration;
{
    this.parseExpected(TokenType.import);
    var afterImportPos = this.scanner.getStartPos();
    var identifier = void 0;
    if (this.isIdentifier()) {
        identifier = this.parseIdentifier();
        if (this.token !== TokenType.comma && this.token !== TokenType.from) {
            // Nodes.ImportEquals declaration of type:
            // import x = require("mod"); or
            // import x = M.x;
            var importEqualsDeclaration = this.createNode(TokenType.ImportEqualsDeclaration, fullStart);
            importEqualsDeclaration.decorators = decorators;
            this.setModifiers(importEqualsDeclaration, modifiers);
            importEqualsDeclaration.name = identifier;
            this.parseExpected(TokenType.equals);
            importEqualsDeclaration.moduleReference = this.parseModuleReference();
            this.parseSemicolon();
            return this.finishNode(importEqualsDeclaration);
        }
    }
    // Nodes.Import statement
    var importDeclaration = this.createNode(TokenType.ImportDeclaration, fullStart);
    importDeclaration.decorators = decorators;
    this.setModifiers(importDeclaration, modifiers);
    // Nodes.ImportDeclaration:
    //  import Nodes.ImportClause from Nodes.ModuleSpecifier ;
    //  import Nodes.ModuleSpecifier;
    if (identifier ||
        this.token === TokenType.asterisk ||
        this.token === TokenType.openBrace) {
        importDeclaration.importClause = this.parseImportClause(identifier, afterImportPos);
        this.parseExpected(TokenType.from);
    }
    importDeclaration.moduleSpecifier = this.parseModuleSpecifier();
    this.parseSemicolon();
    return this.finishNode(importDeclaration);
}
parseImportClause(identifier, Nodes.Identifier, fullStart, number);
{
    // Nodes.ImportClause:
    //  Nodes.ImportedDefaultBinding
    //  Nodes.NameSpaceImport
    //  Nodes.NamedImports
    //  Nodes.ImportedDefaultBinding, Nodes.NameSpaceImport
    //  Nodes.ImportedDefaultBinding, Nodes.NamedImports
    var importClause = this.createNode(TokenType.ImportClause, fullStart);
    if (identifier) {
        // Nodes.ImportedDefaultBinding:
        //  Nodes.ImportedBinding
        importClause.name = identifier;
    }
    // Nodes.If there was no default import or if there is comma this.token after default import
    // parse namespace or named imports
    if (!importClause.name ||
        this.parseOptional(TokenType.comma)) {
        importClause.namedBindings = this.token === TokenType.asterisk ? this.parseNamespaceImport() : this.parseNamedImportsOrExports(TokenType.NamedImports);
    }
    return this.finishNode(importClause);
}
parseModuleReference();
{
    return this.isExternalModuleReference()
        ? this.parseExternalModuleReference()
        : this.parseEntityName(/*allowReservedWords*/ false);
}
parseExternalModuleReference();
{
    var node = this.createNode(TokenType.ExternalModuleReference);
    this.parseExpected(TokenType.require);
    this.parseExpected(TokenType.openParen);
    node.expression = this.parseModuleSpecifier();
    this.parseExpected(TokenType.closeParen);
    return this.finishNode(node);
}
parseModuleSpecifier();
Nodes.Expression;
{
    if (this.token === TokenType.StringLiteral) {
        var ;
        this.result = this.parseLiteralNode();
        this.internIdentifier(this.result.text);
        return this.result;
    }
    else {
        // Nodes.We allow arbitrary expressions here, even though the grammar only allows string
        // literals.  Nodes.We check to ensure that it is only a string literal later in the grammar
        // check pass.
        return this.parseExpression();
    }
}
parseNamespaceImport();
Nodes.NamespaceImport;
{
    // Nodes.NameSpaceImport:
    //  * as Nodes.ImportedBinding
    var namespaceImport = this.createNode(TokenType.NamespaceImport);
    this.parseExpected(TokenType.asterisk);
    this.parseExpected(TokenType.as);
    namespaceImport.name = this.parseIdentifier();
    return this.finishNode(namespaceImport);
}
parseNamedImportsOrExports(kind, TokenType);
Nodes.NamedImportsOrExports;
{
    var node = this.createNode(kind);
    // Nodes.NamedImports:
    //  { }
    //  { Nodes.ImportsList }
    //  { Nodes.ImportsList, }
    // Nodes.ImportsList:
    //  Nodes.ImportSpecifier
    //  Nodes.ImportsList, Nodes.ImportSpecifier
    node.elements = this.parseBracketedList(Nodes.ParsingContext.ImportOrExportSpecifiers, kind === TokenType.NamedImports ? this.parseImportSpecifier : this.parseExportSpecifier, TokenType.openBrace, TokenType.closeBrace);
    return this.finishNode(node);
}
parseExportSpecifier();
{
    return this.parseImportOrExportSpecifier(TokenType.ExportSpecifier);
}
parseImportSpecifier();
{
    return this.parseImportOrExportSpecifier(TokenType.ImportSpecifier);
}
parseImportOrExportSpecifier(kind, TokenType);
Nodes.ImportOrExportSpecifier;
{
    var node = this.createNode(kind);
    // Nodes.ImportSpecifier:
    //   Nodes.BindingIdentifier
    //   Nodes.IdentifierName as Nodes.BindingIdentifier
    // Nodes.ExportSpecifier:
    //   Nodes.IdentifierName
    //   Nodes.IdentifierName as Nodes.IdentifierName
    var checkIdentifierIsKeyword = isKeyword(this.token) && !this.isIdentifier();
    var checkIdentifierStart = this.scanner.getTokenPos();
    var checkIdentifierEnd = this.scanner.getTextPos();
    var identifierName = this.parseIdentifierName();
    if (this.token === TokenType.as) {
        node.propertyName = identifierName;
        this.parseExpected(TokenType.as);
        checkIdentifierIsKeyword = isKeyword(this.token) && !this.isIdentifier();
        checkIdentifierStart = this.scanner.getTokenPos();
        checkIdentifierEnd = this.scanner.getTextPos();
        node.name = this.parseIdentifierName();
    }
    else {
        node.name = identifierName;
    }
    if (kind === TokenType.ImportSpecifier && checkIdentifierIsKeyword) {
        // Nodes.Report error identifier expected
        this.parseErrorAtPosition(checkIdentifierStart, checkIdentifierEnd - checkIdentifierStart, Nodes.Diagnostics.Identifier_expected);
    }
    return this.finishNode(node);
}
parseExportDeclaration(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray);
Nodes.ExportDeclaration;
{
    var node = this.createNode(TokenType.ExportDeclaration, fullStart);
    node.decorators = decorators;
    this.setModifiers(node, modifiers);
    if (this.parseOptional(TokenType.asterisk)) {
        this.parseExpected(TokenType.from);
        node.moduleSpecifier = this.parseModuleSpecifier();
    }
    else {
        node.exportClause = this.parseNamedImportsOrExports(TokenType.NamedExports);
        // Nodes.It is not uncommon to accidentally omit the 'from' keyword. Nodes.Additionally, in editing scenarios,
        // the 'from' keyword can be parsed as a named export when the export clause is unterminated (i.e. `export { from "moduleName";`)
        // Nodes.If we don't have a 'from' keyword, see if we have a string literal such that Nodes.ASI won't take effect.
        if (this.token === TokenType.from || (this.token === TokenType.StringLiteral && !this.scanner.hasPrecedingLineBreak())) {
            this.parseExpected(TokenType.from);
            node.moduleSpecifier = this.parseModuleSpecifier();
        }
    }
    this.parseSemicolon();
    return this.finishNode(node);
}
parseExportAssignment(fullStart, number, decorators, Nodes.NodeList < Nodes.Decorator > , modifiers, Nodes.ModifiersArray);
Nodes.ExportAssignment;
{
    var node = this.createNode(TokenType.ExportAssignment, fullStart);
    node.decorators = decorators;
    this.setModifiers(node, modifiers);
    if (this.parseOptional(TokenType.equals)) {
        node.isExportEquals = true;
    }
    else {
        this.parseExpected(TokenType.default);
    }
    node.expression = this.parseAssignmentExpressionOrHigher();
    this.parseSemicolon();
    return this.finishNode(node);
}
processReferenceComments(this.sourceFile, Nodes.SourceFile);
void {
    const: triviaScanner = createScanner(this.sourceFile.languageVersion, /*skipTrivia*/ false, Nodes.LanguageVariant.Standard, this.sourceText),
    const: referencedFiles, Nodes: .FileReference[] = [],
    const: typeReferenceDirectives, Nodes: .FileReference[] = [],
    const: amdDependencies };
{
    path: string;
    name: string;
}
[];
var amdModuleName;
// Nodes.Keep scanning all the leading trivia in the file until we get to something that
// isn't trivia.  Nodes.Any single line comment will be analyzed to see if it is a
// reference comment.
while (true) {
    var kind = triviaScanner.scan();
    if (kind !== TokenType.singleLineComment) {
        if (isTrivia(kind)) {
            continue;
        }
        else {
            break;
        }
    }
    var range = { pos: triviaScanner.getTokenPos(), end: triviaScanner.getTextPos(), kind: triviaScanner.getToken() };
    var comment = this.sourceText.substring(range.pos, range.end);
    var referencePathMatchResult = getFileReferenceFromReferencePath(comment, range);
    if (referencePathMatchResult) {
        var fileReference = referencePathMatchResult.fileReference;
        this.sourceFile.hasNoDefaultLib = referencePathMatchResult.isNoDefaultLib;
        var diagnosticMessage = referencePathMatchResult.diagnosticMessage;
        if (fileReference) {
            if (referencePathMatchResult.isTypeReferenceDirective) {
                typeReferenceDirectives.push(fileReference);
            }
            else {
                referencedFiles.push(fileReference);
            }
        }
        if (diagnosticMessage) {
            this.parseDiagnostics.push(createFileDiagnostic(this.sourceFile, range.pos, range.end - range.pos, diagnosticMessage));
        }
    }
    else {
        var amdModuleNameRegEx = /^\/\/\/\s*<amd-module\s+name\s*=\s*('|")(.+?)\1/gim;
        var amdModuleNameMatchResult = amdModuleNameRegEx.exec(comment);
        if (amdModuleNameMatchResult) {
            if (amdModuleName) {
                this.parseDiagnostics.push(createFileDiagnostic(this.sourceFile, range.pos, range.end - range.pos, Nodes.Diagnostics.An_AMD_module_cannot_have_multiple_name_assignments));
            }
            amdModuleName = amdModuleNameMatchResult[2];
        }
        var amdDependencyRegEx = /^\/\/\/\s*<amd-dependency\s/gim;
        var pathRegex = /\spath\s*=\s*('|")(.+?)\1/gim;
        var nameRegex = /\sname\s*=\s*('|")(.+?)\1/gim;
        var amdDependencyMatchResult = amdDependencyRegEx.exec(comment);
        if (amdDependencyMatchResult) {
            var pathMatchResult = pathRegex.exec(comment);
            var nameMatchResult = nameRegex.exec(comment);
            if (pathMatchResult) {
                var amdDependency = { path: pathMatchResult[2], name: nameMatchResult ? nameMatchResult[2] : undefined };
                amdDependencies.push(amdDependency);
            }
        }
    }
}
this.sourceFile.referencedFiles = referencedFiles;
this.sourceFile.typeReferenceDirectives = typeReferenceDirectives;
this.sourceFile.amdDependencies = amdDependencies;
this.sourceFile.moduleName = amdModuleName;
setExternalModuleIndicator(this.sourceFile, Nodes.SourceFile);
{
    this.sourceFile.externalModuleIndicator = forEach(this.sourceFile.statements, function (node) {
        return node.flags & Nodes.NodeFlags.Export
            || node.kind === TokenType.ImportEqualsDeclaration && node.moduleReference.kind === TokenType.ExternalModuleReference
            || node.kind === TokenType.ImportDeclaration
            || node.kind === TokenType.ExportAssignment
            || node.kind === TokenType.ExportDeclaration
            ? node
            : undefined;
    });
}
var Nodes;
(function (Nodes) {
})(Nodes || (Nodes = {}));
ParsingContext;
{
    Nodes.SourceElements,
        Nodes.BlockStatements,
        Nodes.SwitchClauses,
        Nodes.SwitchClauseStatements,
        Nodes.TypeMembers,
        Nodes.ClassMembers,
        Nodes.EnumMembers,
        Nodes.HeritageClauseElement,
        Nodes.VariableDeclarations,
        Nodes.ObjectBindingElements,
        Nodes.ArrayBindingElements,
        Nodes.ArgumentExpressions,
        Nodes.ObjectLiteralMembers,
        Nodes.JsxAttributes,
        Nodes.JsxChildren,
        Nodes.ArrayLiteralMembers,
        Nodes.Parameters,
        Nodes.TypeParameters,
        Nodes.TypeArguments,
        Nodes.TupleElementTypes,
        Nodes.HeritageClauses,
        Nodes.ImportOrExportSpecifiers,
        Nodes.JSDocFunctionParameters,
        Nodes.JSDocTypeArguments,
        Nodes.JSDocRecordMembers,
        Nodes.JSDocTupleTypes,
        Nodes.Count; // Nodes.Number of parsing contexts
}
var Nodes;
(function (Nodes) {
})(Nodes || (Nodes = {}));
Tristate;
{
    Nodes.False,
        Nodes.True,
        Nodes.Unknown;
}
var Nodes;
(function (Nodes) {
    var JSDocParser;
    (function (JSDocParser) {
        function isJSDocType() {
            switch (this.token) {
                case TokenType.asterisk:
                case TokenType.question:
                case TokenType.openParen:
                case TokenType.openBracket:
                case TokenType.exclamation:
                case TokenType.openBrace:
                case TokenType.function:
                case TokenType.dotDotDot:
                case TokenType.new:
                case TokenType.this:
                    return true;
            }
            return tokenIsIdentifierOrKeyword(this.token);
        }
        JSDocParser.isJSDocType = isJSDocType;
        function parseJSDocTypeExpressionForTests(content, start, length) {
            this.initializeState("file.js", content, Nodes.ScriptTarget.Latest, /*_syntaxCursor:*/ undefined, Nodes.ScriptKind.JS);
            this.scanner.setText(content, start, length);
            this.token = this.scanner.scan();
            var jsDocTypeExpression = parseJSDocTypeExpression();
            var diagnostics = this.parseDiagnostics;
            this.clearState();
            return jsDocTypeExpression ? { jsDocTypeExpression: jsDocTypeExpression, diagnostics: diagnostics } : undefined;
        }
        JSDocParser.parseJSDocTypeExpressionForTests = parseJSDocTypeExpressionForTests;
        // Nodes.Parses out a Nodes.JSDoc type expression.
        /* @internal */
        function parseJSDocTypeExpression() {
            var ;
            this.result = this.createNode(TokenType.JSDocTypeExpression, this.scanner.getTokenPos());
            this.parseExpected(TokenType.openBrace);
            this.result.type = parseJSDocTopLevelType();
            this.parseExpected(TokenType.closeBrace);
            fixupParentReferences(this.result);
            return this.finishNode(this.result);
        }
        JSDocParser.parseJSDocTypeExpression = parseJSDocTypeExpression;
        function parseJSDocTopLevelType() {
            var type = parseJSDocType();
            if (this.token === TokenType.bar) {
                var unionType = this.createNode(TokenType.JSDocUnionType, type.pos);
                unionType.types = parseJSDocTypeList(type);
                type = this.finishNode(unionType);
            }
            if (this.token === TokenType.equals) {
                var optionalType = this.createNode(TokenType.JSDocOptionalType, type.pos);
                this.nextToken();
                optionalType.type = type;
                type = this.finishNode(optionalType);
            }
            return type;
        }
        function parseJSDocType() {
            var type = parseBasicTypeExpression();
            while (true) {
                if (this.token === TokenType.openBracket) {
                    var arrayType = this.createNode(TokenType.JSDocArrayType, type.pos);
                    arrayType.elementType = type;
                    this.nextToken();
                    this.parseExpected(TokenType.closeBracket);
                    type = this.finishNode(arrayType);
                }
                else if (this.token === TokenType.question) {
                    var nullableType = this.createNode(TokenType.JSDocNullableType, type.pos);
                    nullableType.type = type;
                    this.nextToken();
                    type = this.finishNode(nullableType);
                }
                else if (this.token === TokenType.exclamation) {
                    var nonNullableType = this.createNode(TokenType.JSDocNonNullableType, type.pos);
                    nonNullableType.type = type;
                    this.nextToken();
                    type = this.finishNode(nonNullableType);
                }
                else {
                    break;
                }
            }
            return type;
        }
        function parseBasicTypeExpression() {
            switch (this.token) {
                case TokenType.asterisk:
                    return parseJSDocAllType();
                case TokenType.question:
                    return parseJSDocUnknownOrNullableType();
                case TokenType.openParen:
                    return parseJSDocUnionType();
                case TokenType.openBracket:
                    return parseJSDocTupleType();
                case TokenType.exclamation:
                    return parseJSDocNonNullableType();
                case TokenType.openBrace:
                    return parseJSDocRecordType();
                case TokenType.function:
                    return parseJSDocFunctionType();
                case TokenType.dotDotDot:
                    return parseJSDocVariadicType();
                case TokenType.new:
                    return parseJSDocConstructorType();
                case TokenType.this:
                    return parseJSDocThisType();
                case TokenType.any:
                case TokenType.string:
                case TokenType.number:
                case TokenType.boolean:
                case TokenType.symbol:
                case TokenType.void:
                    return this.parseTokenNode();
            }
            // Nodes.TODO (drosen): Nodes.Parse string literal types in Nodes.JSDoc as well.
            return parseJSDocTypeReference();
        }
        function parseJSDocThisType() {
            var ;
            this.result = this.createNode(TokenType.JSDocThisType);
            this.nextToken();
            this.parseExpected(TokenType.colon);
            this.result.type = parseJSDocType();
            return this.finishNode(this.result);
        }
        function parseJSDocConstructorType() {
            var ;
            this.result = this.createNode(TokenType.JSDocConstructorType);
            this.nextToken();
            this.parseExpected(TokenType.colon);
            this.result.type = parseJSDocType();
            return this.finishNode(this.result);
        }
        function parseJSDocVariadicType() {
            var ;
            this.result = this.createNode(TokenType.JSDocVariadicType);
            this.nextToken();
            this.result.type = parseJSDocType();
            return this.finishNode(this.result);
        }
        function parseJSDocFunctionType() {
            var ;
            this.result = this.createNode(TokenType.JSDocFunctionType);
            this.nextToken();
            this.parseExpected(TokenType.openParen);
            this.result.parameters = this.parseDelimitedList(Nodes.ParsingContext.JSDocFunctionParameters, parseJSDocParameter);
            checkForTrailingComma(this.result.parameters);
            this.parseExpected(TokenType.closeParen);
            if (this.token === TokenType.colon) {
                this.nextToken();
                this.result.type = parseJSDocType();
            }
            return this.finishNode(this.result);
        }
        function parseJSDocParameter() {
            var parameter = this.createNode(TokenType.Parameter);
            parameter.type = parseJSDocType();
            if (this.parseOptional(TokenType.equals)) {
                parameter.questionToken = this.createNode(TokenType.equals);
            }
            return this.finishNode(parameter);
        }
        function parseJSDocTypeReference() {
            var ;
            this.result = this.createNode(TokenType.JSDocTypeReference);
            this.result.name = this.parseSimplePropertyName();
            if (this.token === TokenType.lessThan) {
                this.result.typeArguments = parseTypeArguments();
            }
            else {
                while (this.parseOptional(TokenType.dot)) {
                    if (this.token === TokenType.lessThan) {
                        this.result.typeArguments = parseTypeArguments();
                        break;
                    }
                    else {
                        this.result.name = parseQualifiedName(this.result.name);
                    }
                }
            }
            return this.finishNode(this.result);
        }
        function parseTypeArguments() {
            // Nodes.Move past the <
            this.nextToken();
            var typeArguments = this.parseDelimitedList(Nodes.ParsingContext.JSDocTypeArguments, parseJSDocType);
            checkForTrailingComma(typeArguments);
            checkForEmptyTypeArgumentList(typeArguments);
            this.parseExpected(TokenType.greaterThan);
            return typeArguments;
        }
        function checkForEmptyTypeArgumentList(typeArguments) {
            if (this.parseDiagnostics.length === 0 && typeArguments && typeArguments.length === 0) {
                var start = typeArguments.pos - "<".length;
                var end = skipTrivia(this.sourceText, typeArguments.end) + ">".length;
                return this.parseErrorAtPosition(start, end - start, Nodes.Diagnostics.Type_argument_list_cannot_be_empty);
            }
        }
        function parseQualifiedName(left) {
            var ;
            this.result = this.createNode(TokenType.QualifiedName, left.pos);
            this.result.left = left;
            this.result.right = this.parseIdentifierName();
            return this.finishNode(this.result);
        }
        function parseJSDocRecordType() {
            var ;
            this.result = this.createNode(TokenType.JSDocRecordType);
            this.nextToken();
            this.result.members = this.parseDelimitedList(Nodes.ParsingContext.JSDocRecordMembers, parseJSDocRecordMember);
            checkForTrailingComma(this.result.members);
            this.parseExpected(TokenType.closeBrace);
            return this.finishNode(this.result);
        }
        function parseJSDocRecordMember() {
            var ;
            this.result = this.createNode(TokenType.JSDocRecordMember);
            this.result.name = this.parseSimplePropertyName();
            if (this.token === TokenType.colon) {
                this.nextToken();
                this.result.type = parseJSDocType();
            }
            return this.finishNode(this.result);
        }
        function parseJSDocNonNullableType() {
            var ;
            this.result = this.createNode(TokenType.JSDocNonNullableType);
            this.nextToken();
            this.result.type = parseJSDocType();
            return this.finishNode(this.result);
        }
        function parseJSDocTupleType() {
            var ;
            this.result = this.createNode(TokenType.JSDocTupleType);
            this.nextToken();
            this.result.types = this.parseDelimitedList(Nodes.ParsingContext.JSDocTupleTypes, parseJSDocType);
            checkForTrailingComma(this.result.types);
            this.parseExpected(TokenType.closeBracket);
            return this.finishNode(this.result);
        }
        function checkForTrailingComma(list) {
            if (this.parseDiagnostics.length === 0 && list.hasTrailingComma) {
                var start = list.end - ",".length;
                this.parseErrorAtPosition(start, ",".length, Nodes.Diagnostics.Trailing_comma_not_allowed);
            }
        }
        function parseJSDocUnionType() {
            var ;
            this.result = this.createNode(TokenType.JSDocUnionType);
            this.nextToken();
            this.result.types = parseJSDocTypeList(parseJSDocType());
            this.parseExpected(TokenType.closeParen);
            return this.finishNode(this.result);
        }
        function parseJSDocTypeList(firstType) {
            console.assert(!!firstType);
            var types = [];
            types.pos = firstType.pos;
            types.push(firstType);
            while (this.parseOptional(TokenType.bar)) {
                types.push(parseJSDocType());
            }
            types.end = this.scanner.getStartPos();
            return types;
        }
        function parseJSDocAllType() {
            var ;
            this.result = this.createNode(TokenType.JSDocAllType);
            this.nextToken();
            return this.finishNode(this.result);
        }
        function parseJSDocUnknownOrNullableType() {
            var pos = this.scanner.getStartPos();
            // skip the ?
            this.nextToken();
            // Nodes.Need to lookahead to decide if this is a nullable or unknown type.
            // Nodes.Here are cases where we'll pick the unknown type:
            //
            //      Nodes.Foo(?,
            //      { a: ? }
            //      Nodes.Foo(?)
            //      Nodes.Foo<?>
            //      Nodes.Foo(?=
            //      (?|
            if (this.token === TokenType.comma ||
                this.token === TokenType.closeBrace ||
                this.token === TokenType.closeParen ||
                this.token === TokenType.greaterThan ||
                this.token === TokenType.equals ||
                this.token === TokenType.bar) {
                var ;
                this.result = this.createNode(TokenType.JSDocUnknownType, pos);
                return this.finishNode(this.result);
            }
            else {
                var ;
                this.result = this.createNode(TokenType.JSDocNullableType, pos);
                this.result.type = parseJSDocType();
                return this.finishNode(this.result);
            }
        }
        function parseIsolatedJSDocComment(content, start, length) {
            this.initializeState("file.js", content, Nodes.ScriptTarget.Latest, /*_syntaxCursor:*/ undefined, Nodes.ScriptKind.JS);
            this.sourceFile = { languageVariant: Nodes.LanguageVariant.Standard, text: content };
            var jsDocComment = parseJSDocCommentWorker(start, length);
            var diagnostics = this.parseDiagnostics;
            this.clearState();
            return jsDocComment ? { jsDocComment: jsDocComment, diagnostics: diagnostics } : undefined;
        }
        JSDocParser.parseIsolatedJSDocComment = parseIsolatedJSDocComment;
        function parseJSDocComment(parent, start, length) {
            var saveToken = this.token;
            var saveParseDiagnosticsLength = this.parseDiagnostics.length;
            var saveParseErrorBeforeNextFinishedNode = this.parseErrorBeforeNextFinishedNode;
            var comment = parseJSDocCommentWorker(start, length);
            if (comment) {
                comment.parent = parent;
            }
            this.token = saveToken;
            this.parseDiagnostics.length = saveParseDiagnosticsLength;
            this.parseErrorBeforeNextFinishedNode = saveParseErrorBeforeNextFinishedNode;
            return comment;
        }
        JSDocParser.parseJSDocComment = parseJSDocComment;
        function parseJSDocCommentWorker(start, length) {
            var _this = this;
            var content = this.sourceText;
            start = start || 0;
            var end = length === undefined ? content.length : start + length;
            length = end - start;
            console.assert(start >= 0);
            console.assert(start <= end);
            console.assert(end <= content.length);
            var tags;
            let;
            this.result;
            Nodes.JSDocComment;
            // Nodes.Check for /** (Nodes.JSDoc opening part)
            if (content.charCodeAt(start) === Nodes.CharCode.slash &&
                content.charCodeAt(start + 1) === Nodes.CharCode.asterisk &&
                content.charCodeAt(start + 2) === Nodes.CharCode.asterisk &&
                content.charCodeAt(start + 3) !== Nodes.CharCode.asterisk) {
                // + 3 for leading /**, - 5 in total for /** */
                this.scanner.scanRange(start + 3, length - 5, function () {
                    // Nodes.Initially we can parse out a tag.  Nodes.We also have seen a starting asterisk.
                    // Nodes.This is so that /** * @type */ doesn't parse.
                    var canParseTag = true;
                    var seenAsterisk = true;
                    nextJSDocToken();
                    while (_this.token !== TokenType.endOfFile) {
                        switch (_this.token) {
                            case TokenType.at:
                                if (canParseTag) {
                                    parseTag();
                                }
                                // Nodes.This will take us to the end of the line, so it's Nodes.OK to parse a tag on the next pass through the loop
                                seenAsterisk = false;
                                break;
                            case TokenType.newLine:
                                // Nodes.After a line break, we can parse a tag, and we haven't seen an asterisk on the next line yet
                                canParseTag = true;
                                seenAsterisk = false;
                                break;
                            case TokenType.asterisk:
                                if (seenAsterisk) {
                                    // Nodes.If we've already seen an asterisk, then we can no longer parse a tag on this line
                                    canParseTag = false;
                                }
                                // Nodes.Ignore the first asterisk on a line
                                seenAsterisk = true;
                                break;
                            case TokenType.Identifier:
                                // Nodes.Anything else is doc comment text.  Nodes.We can't do anything with it.  Nodes.Because it
                                // wasn't a tag, we can no longer parse a tag on this line until we hit the next
                                // line break.
                                canParseTag = false;
                                break;
                            case TokenType.endOfFile:
                                break;
                        }
                        nextJSDocToken();
                    }
                    _this.result = createJSDocComment();
                });
            }
            return this.result;
            function createJSDocComment() {
                if (!tags) {
                    return undefined;
                }
                var ;
                this.result = this.createNode(TokenType.JSDocComment, start);
                this.result.tags = tags;
                return this.finishNode(this.result, end);
            }
            function skipWhitespace() {
                while (this.token === TokenType.whitespace || this.token === TokenType.newLine) {
                    nextJSDocToken();
                }
            }
            function parseTag() {
                console.assert(this.token === TokenType.at);
                var atToken = this.createNode(TokenType.at, this.scanner.getTokenPos());
                atToken.end = this.scanner.getTextPos();
                nextJSDocToken();
                var tagName = parseJSDocIdentifierName();
                if (!tagName) {
                    return;
                }
                var tag = handleTag(atToken, tagName) || handleUnknownTag(atToken, tagName);
                addTag(tag);
            }
            function handleTag(atToken, tagName) {
                if (tagName) {
                    switch (tagName.text) {
                        case "param":
                            return handleParamTag(atToken, tagName);
                        case "return":
                        case "returns":
                            return handleReturnTag(atToken, tagName);
                        case "template":
                            return handleTemplateTag(atToken, tagName);
                        case "type":
                            return handleTypeTag(atToken, tagName);
                        case "typedef":
                            return handleTypedefTag(atToken, tagName);
                    }
                }
                return undefined;
            }
            function handleUnknownTag(atToken, tagName) {
                var ;
                this.result = this.createNode(TokenType.JSDocTag, atToken.pos);
                this.result.atToken = atToken;
                this.result.tagName = tagName;
                return this.finishNode(this.result);
            }
            function addTag(tag) {
                if (tag) {
                    if (!tags) {
                        tags = [];
                        tags.pos = tag.pos;
                    }
                    tags.push(tag);
                    tags.end = tag.end;
                }
            }
            function tryParseTypeExpression() {
                if (this.token !== TokenType.openBrace) {
                    return undefined;
                }
                var typeExpression = parseJSDocTypeExpression();
                return typeExpression;
            }
            function handleParamTag(atToken, tagName) {
                var typeExpression = tryParseTypeExpression();
                skipWhitespace();
                var name;
                var isBracketed;
                // Nodes.Looking for something like '[foo]' or 'foo'
                if (this.parseOptionalToken(TokenType.openBracket)) {
                    name = parseJSDocIdentifierName();
                    isBracketed = true;
                    // Nodes.May have an optional default, e.g. '[foo = 42]'
                    if (this.parseOptionalToken(TokenType.equals)) {
                        this.parseExpression();
                    }
                    this.parseExpected(TokenType.closeBracket);
                }
                else if (tokenIsIdentifierOrKeyword(this.token)) {
                    name = parseJSDocIdentifierName();
                }
                if (!name) {
                    this.parseErrorAtPosition(this.scanner.getStartPos(), 0, Nodes.Diagnostics.Identifier_expected);
                    return undefined;
                }
                var preName, postName;
                if (typeExpression) {
                    postName = name;
                }
                else {
                    preName = name;
                }
                if (!typeExpression) {
                    typeExpression = tryParseTypeExpression();
                }
                var ;
                this.result = this.createNode(TokenType.JSDocParameterTag, atToken.pos);
                this.result.atToken = atToken;
                this.result.tagName = tagName;
                this.result.preParameterName = preName;
                this.result.typeExpression = typeExpression;
                this.result.postParameterName = postName;
                this.result.isBracketed = isBracketed;
                return this.finishNode(this.result);
            }
            function handleReturnTag(atToken, tagName) {
                if (forEach(tags, function (t) { return t.kind === TokenType.JSDocReturnTag; })) {
                    this.parseErrorAtPosition(tagName.pos, this.scanner.getTokenPos() - tagName.pos, Nodes.Diagnostics._0_tag_already_specified, tagName.text);
                }
                var ;
                this.result = this.createNode(TokenType.JSDocReturnTag, atToken.pos);
                this.result.atToken = atToken;
                this.result.tagName = tagName;
                this.result.typeExpression = tryParseTypeExpression();
                return this.finishNode(this.result);
            }
            function handleTypeTag(atToken, tagName) {
                if (forEach(tags, function (t) { return t.kind === TokenType.JSDocTypeTag; })) {
                    this.parseErrorAtPosition(tagName.pos, this.scanner.getTokenPos() - tagName.pos, Nodes.Diagnostics._0_tag_already_specified, tagName.text);
                }
                var ;
                this.result = this.createNode(TokenType.JSDocTypeTag, atToken.pos);
                this.result.atToken = atToken;
                this.result.tagName = tagName;
                this.result.typeExpression = tryParseTypeExpression();
                return this.finishNode(this.result);
            }
            function handlePropertyTag(atToken, tagName) {
                var typeExpression = tryParseTypeExpression();
                skipWhitespace();
                var name = parseJSDocIdentifierName();
                if (!name) {
                    this.parseErrorAtPosition(this.scanner.getStartPos(), /*length*/ 0, Nodes.Diagnostics.Identifier_expected);
                    return undefined;
                }
                var ;
                this.result = this.createNode(TokenType.JSDocPropertyTag, atToken.pos);
                this.result.atToken = atToken;
                this.result.tagName = tagName;
                this.result.name = name;
                this.result.typeExpression = typeExpression;
                return this.finishNode(this.result);
            }
            function handleTypedefTag(atToken, tagName) {
                var typeExpression = tryParseTypeExpression();
                skipWhitespace();
                var typedefTag = this.createNode(TokenType.JSDocTypedefTag, atToken.pos);
                typedefTag.atToken = atToken;
                typedefTag.tagName = tagName;
                typedefTag.name = parseJSDocIdentifierName();
                typedefTag.typeExpression = typeExpression;
                if (typeExpression) {
                    if (typeExpression.type.kind === TokenType.JSDocTypeReference) {
                        var jsDocTypeReference = typeExpression.type;
                        if (jsDocTypeReference.name.kind === TokenType.Identifier) {
                            var name_4 = jsDocTypeReference.name;
                            if (name_4.text === "Nodes.Object") {
                                typedefTag.jsDocTypeLiteral = scanChildTags();
                            }
                        }
                    }
                    if (!typedefTag.jsDocTypeLiteral) {
                        typedefTag.jsDocTypeLiteral = typeExpression.type;
                    }
                }
                else {
                    typedefTag.jsDocTypeLiteral = scanChildTags();
                }
                return this.finishNode(typedefTag);
                function scanChildTags() {
                    var jsDocTypeLiteral = this.createNode(TokenType.JSDocTypeLiteral, this.scanner.getStartPos());
                    var resumePos = this.scanner.getStartPos();
                    var canParseTag = true;
                    var seenAsterisk = false;
                    var parentTagTerminated = false;
                    while (this.token !== TokenType.endOfFile && !parentTagTerminated) {
                        nextJSDocToken();
                        switch (this.token) {
                            case TokenType.at:
                                if (canParseTag) {
                                    parentTagTerminated = !tryParseChildTag(jsDocTypeLiteral);
                                    if (!parentTagTerminated) {
                                        resumePos = this.scanner.getStartPos();
                                    }
                                }
                                seenAsterisk = false;
                                break;
                            case TokenType.newLine:
                                resumePos = this.scanner.getStartPos() - 1;
                                canParseTag = true;
                                seenAsterisk = false;
                                break;
                            case TokenType.asterisk:
                                if (seenAsterisk) {
                                    canParseTag = false;
                                }
                                seenAsterisk = true;
                                break;
                            case TokenType.Identifier:
                                canParseTag = false;
                            case TokenType.endOfFile:
                                break;
                        }
                    }
                    this.scanner.setTextPos(resumePos);
                    return this.finishNode(jsDocTypeLiteral);
                }
            }
            function tryParseChildTag(parentTag) {
                console.assert(this.token === TokenType.at);
                var atToken = this.createNode(TokenType.at, this.scanner.getStartPos());
                atToken.end = this.scanner.getTextPos();
                nextJSDocToken();
                var tagName = parseJSDocIdentifierName();
                if (!tagName) {
                    return false;
                }
                switch (tagName.text) {
                    case "type":
                        if (parentTag.jsDocTypeTag) {
                            // already has a @type tag, terminate the parent tag now.
                            return false;
                        }
                        parentTag.jsDocTypeTag = handleTypeTag(atToken, tagName);
                        return true;
                    case "prop":
                    case "property":
                        if (!parentTag.jsDocPropertyTags) {
                            parentTag.jsDocPropertyTags = [];
                        }
                        var propertyTag = handlePropertyTag(atToken, tagName);
                        parentTag.jsDocPropertyTags.push(propertyTag);
                        return true;
                }
                return false;
            }
            function handleTemplateTag(atToken, tagName) {
                if (forEach(tags, function (t) { return t.kind === TokenType.JSDocTemplateTag; })) {
                    this.parseErrorAtPosition(tagName.pos, this.scanner.getTokenPos() - tagName.pos, Nodes.Diagnostics._0_tag_already_specified, tagName.text);
                }
                // Nodes.Type parameter list looks like '@template T,U,V'
                var typeParameters = [];
                typeParameters.pos = this.scanner.getStartPos();
                while (true) {
                    var name_5 = parseJSDocIdentifierName();
                    if (!name_5) {
                        this.parseErrorAtPosition(this.scanner.getStartPos(), 0, Nodes.Diagnostics.Identifier_expected);
                        return undefined;
                    }
                    var typeParameter = this.createNode(TokenType.TypeParameter, name_5.pos);
                    typeParameter.name = name_5;
                    this.finishNode(typeParameter);
                    typeParameters.push(typeParameter);
                    if (this.token === TokenType.comma) {
                        nextJSDocToken();
                    }
                    else {
                        break;
                    }
                }
                var ;
                this.result = this.createNode(TokenType.JSDocTemplateTag, atToken.pos);
                this.result.atToken = atToken;
                this.result.tagName = tagName;
                this.result.typeParameters = typeParameters;
                this.finishNode(this.result);
                typeParameters.end = this.result.end;
                return this.result;
            }
            function nextJSDocToken() {
                return this.token = this.scanner.scanJSDocToken();
            }
            function parseJSDocIdentifierName() {
                return createJSDocIdentifier(tokenIsIdentifierOrKeyword(this.token));
            }
            this.isIdentifier;
            boolean;
            Nodes.Identifier;
            {
                if (!this.isIdentifier) {
                    this.parseErrorAtCurrentToken(Nodes.Diagnostics.Identifier_expected);
                    return undefined;
                }
                var pos = this.scanner.getTokenPos();
                var end_1 = this.scanner.getTextPos();
                var ;
                this.result = this.createNode(TokenType.Identifier, pos);
                this.result.text = content.substring(pos, end_1);
                this.finishNode(this.result, end_1);
                nextJSDocToken();
                return this.result;
            }
        }
        JSDocParser.parseJSDocCommentWorker = parseJSDocCommentWorker;
    })(JSDocParser = Nodes.JSDocParser || (Nodes.JSDocParser = {}));
})(Nodes = exports.Nodes || (exports.Nodes = {}));
var Nodes;
(function (Nodes) {
    var IncrementalParser;
    (function (IncrementalParser) {
        this.sourceFile;
        Nodes.SourceFile, newText;
        string, textChangeRange;
        Nodes.TextChangeRange, aggressiveChecks;
        boolean;
        Nodes.SourceFile;
        {
            aggressiveChecks = aggressiveChecks || Nodes.Debug.shouldAssert(Nodes.AssertionLevel.Aggressive);
            this.checkChangeRange(this.sourceFile, newText, textChangeRange, aggressiveChecks);
            if (textChangeRangeIsUnchanged(textChangeRange)) {
                // if the text didn't change, then we can just return our current source file as-is.
                return this.sourceFile;
            }
            if (this.sourceFile.statements.length === 0) {
                // Nodes.If we don't have any statements in the current source file, then there's no real
                // way to incrementally parse.  Nodes.So just do a full parse instead.
                return Nodes.Parser.parseSourceFile(this.sourceFile.fileName, newText, this.sourceFile.languageVersion, /*this.syntaxCursor*/ undefined, /*setParentNodes*/ true, this.sourceFile.scriptKind);
            }
            // Nodes.Make sure we're not trying to incrementally update a source file more than once.  Nodes.Once
            // we do an update the original source file is considered unusable from that point onwards.
            //
            // Nodes.This is because we do incremental parsing in-place.  i.e. we take nodes from the old
            // tree and give them new positions and parents.  Nodes.From that point on, trusting the old
            // tree at all is not possible as far too much of it may violate invariants.
            var incrementalSourceFile = this.sourceFile;
            console.assert(!incrementalSourceFile.hasBeenIncrementallyParsed);
            incrementalSourceFile.hasBeenIncrementallyParsed = true;
            var oldText = this.sourceFile.text;
            var ;
            this.syntaxCursor = this.createSyntaxCursor(this.sourceFile);
            // Nodes.Make the actual change larger so that we know to reparse anything whose lookahead
            // might have intersected the change.
            var changeRange = this.extendToAffectedRange(this.sourceFile, textChangeRange);
            this.checkChangeRange(this.sourceFile, newText, changeRange, aggressiveChecks);
            // Nodes.Ensure that extending the affected range only moved the start of the change range
            // earlier in the file.
            console.assert(changeRange.span.start <= textChangeRange.span.start);
            console.assert(textSpanEnd(changeRange.span) === textSpanEnd(textChangeRange.span));
            console.assert(textSpanEnd(textChangeRangeNewSpan(changeRange)) === textSpanEnd(textChangeRangeNewSpan(textChangeRange)));
            // Nodes.The is the amount the nodes after the edit range need to be adjusted.  Nodes.It can be
            // positive (if the edit added characters), negative (if the edit deleted characters)
            // or zero (if this was a pure overwrite with nothing added/removed).
            var delta = textChangeRangeNewSpan(changeRange).length - changeRange.span.length;
            // Nodes.If we added or removed characters during the edit, then we need to go and adjust all
            // the nodes after the edit.  Nodes.Those nodes may move forward (if we inserted chars) or they
            // may move backward (if we deleted chars).
            //
            // Nodes.Doing this helps us out in two ways.  Nodes.First, it means that any nodes/tokens we want
            // to reuse are already at the appropriate position in the new text.  Nodes.That way when we
            // reuse them, we don't have to figure out if they need to be adjusted.  Nodes.Second, it makes
            // it very easy to determine if we can reuse a node.  Nodes.If the node's position is at where
            // we are in the text, then we can reuse it.  Nodes.Otherwise we can't.  Nodes.If the node's position
            // is ahead of us, then we'll need to rescan tokens.  Nodes.If the node's position is behind
            // us, then we'll need to skip it or crumble it as appropriate
            //
            // Nodes.We will also adjust the positions of nodes that intersect the change range as well.
            // Nodes.By doing this, we ensure that all the positions in the old tree are consistent, not
            // just the positions of nodes entirely before/after the change range.  Nodes.By being
            // consistent, we can then easily map from positions to nodes in the old tree easily.
            //
            // Nodes.Also, mark any syntax elements that intersect the changed span.  Nodes.We know, up front,
            // that we cannot reuse these elements.
            this.updateTokenPositionsAndMarkElements(incrementalSourceFile, changeRange.span.start, textSpanEnd(changeRange.span), textSpanEnd(textChangeRangeNewSpan(changeRange)), delta, oldText, newText, aggressiveChecks);
            // Nodes.Now that we've set up our internal incremental state just proceed and parse the
            // source file in the normal fashion.  Nodes.When possible the parser will retrieve and
            // reuse nodes from the old tree.
            //
            // Nodes.Note: passing in 'true' for setNodeParents is very important.  Nodes.When incrementally
            // parsing, we will be reusing nodes from the old tree, and placing it into new
            // parents.  Nodes.If we don't set the parents now, we'll end up with an observably
            // inconsistent tree.  Nodes.Setting the parents on the new tree should be very fast.  Nodes.We
            // will immediately bail out of walking any subtrees when we can see that their parents
            // are already correct.
            var ;
            this.result = Nodes.Parser.parseSourceFile(this.sourceFile.fileName, newText, this.sourceFile.languageVersion, this.syntaxCursor, /*setParentNodes*/ true, this.sourceFile.scriptKind);
            return this.result;
        }
        moveElementEntirelyPastChangeRange(element, Nodes.IncrementalElement, isArray, boolean, delta, number, oldText, string, newText, string, aggressiveChecks, boolean);
        {
            if (isArray) {
                visitArray(element);
            }
            else {
                visitNode(element);
            }
            return;
            function visitNode(node) {
                var text = "";
                if (aggressiveChecks && this.shouldCheckNode(node)) {
                    text = oldText.substring(node.pos, node.end);
                }
                // Nodes.Ditch any existing Nodes.LS children we may have created.  Nodes.This way we can avoid
                // moving them forward.
                if (node._children) {
                    node._children = undefined;
                }
                node.pos += delta;
                node.end += delta;
                if (aggressiveChecks && this.shouldCheckNode(node)) {
                    console.assert(text === newText.substring(node.pos, node.end));
                }
                forEachChild(node, visitNode, visitArray);
                if (node.jsDocComments) {
                    for (var _i = 0, _a = node.jsDocComments; _i < _a.length; _i++) {
                        var jsDocComment = _a[_i];
                        forEachChild(jsDocComment, visitNode, visitArray);
                    }
                }
                this.checkNodePositions(node, aggressiveChecks);
            }
            function visitArray(array) {
                array._children = undefined;
                array.pos += delta;
                array.end += delta;
                for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
                    var node = array_1[_i];
                    visitNode(node);
                }
            }
        }
        shouldCheckNode(node, Nodes.Node);
        {
            switch (node.kind) {
                case TokenType.StringLiteral:
                case TokenType.NumericLiteral:
                case TokenType.Identifier:
                    return true;
            }
            return false;
        }
        adjustIntersectingElement(element, Nodes.IncrementalElement, changeStart, number, changeRangeOldEnd, number, changeRangeNewEnd, number, delta, number);
        {
            console.assert(element.end >= changeStart, "Nodes.Adjusting an element that was entirely before the change range");
            console.assert(element.pos <= changeRangeOldEnd, "Nodes.Adjusting an element that was entirely after the change range");
            console.assert(element.pos <= element.end);
            // Nodes.We have an element that intersects the change range in some way.  Nodes.It may have its
            // start, or its end (or both) in the changed range.  Nodes.We want to adjust any part
            // that intersects such that the final tree is in a consistent state.  i.e. all
            // children have spans within the span of their parent, and all siblings are ordered
            // properly.
            // Nodes.We may need to update both the 'pos' and the 'end' of the element.
            // Nodes.If the 'pos' is before the start of the change, then we don't need to touch it.
            // Nodes.If it isn't, then the 'pos' must be inside the change.  Nodes.How we update it will
            // depend if delta is  positive or negative.  Nodes.If delta is positive then we have
            // something like:
            //
            //  -------------------Nodes.AAA-----------------
            //  -------------------Nodes.BBBCCCCCCC-----------------
            //
            // Nodes.In this case, we consider any node that started in the change range to still be
            // starting at the same position.
            //
            // however, if the delta is negative, then we instead have something like this:
            //
            //  -------------------Nodes.XXXYYYYYYY-----------------
            //  -------------------Nodes.ZZZ-----------------
            //
            // Nodes.In this case, any element that started in the 'X' range will keep its position.
            // Nodes.However any element that started after that will have their pos adjusted to be
            // at the end of the new range.  i.e. any node that started in the 'Y' range will
            // be adjusted to have their start at the end of the 'Z' range.
            //
            // Nodes.The element will keep its position if possible.  Nodes.Or Nodes.Move backward to the new-end
            // if it's in the 'Y' range.
            element.pos = Nodes.Math.min(element.pos, changeRangeNewEnd);
            // Nodes.If the 'end' is after the change range, then we always adjust it by the delta
            // amount.  Nodes.However, if the end is in the change range, then how we adjust it
            // will depend on if delta is  positive or negative.  Nodes.If delta is positive then we
            // have something like:
            //
            //  -------------------Nodes.AAA-----------------
            //  -------------------Nodes.BBBCCCCCCC-----------------
            //
            // Nodes.In this case, we consider any node that ended inside the change range to keep its
            // end position.
            //
            // however, if the delta is negative, then we instead have something like this:
            //
            //  -------------------Nodes.XXXYYYYYYY-----------------
            //  -------------------Nodes.ZZZ-----------------
            //
            // Nodes.In this case, any element that ended in the 'X' range will keep its position.
            // Nodes.However any element that ended after that will have their pos adjusted to be
            // at the end of the new range.  i.e. any node that ended in the 'Y' range will
            // be adjusted to have their end at the end of the 'Z' range.
            if (element.end >= changeRangeOldEnd) {
                // Nodes.Element ends after the change range.  Nodes.Always adjust the end pos.
                element.end += delta;
            }
            else {
                // Nodes.Element ends in the change range.  Nodes.The element will keep its position if
                // possible. Nodes.Or Nodes.Move backward to the new-end if it's in the 'Y' range.
                element.end = Nodes.Math.min(element.end, changeRangeNewEnd);
            }
            console.assert(element.pos <= element.end);
            if (element.parent) {
                console.assert(element.pos >= element.parent.pos);
                console.assert(element.end <= element.parent.end);
            }
        }
        checkNodePositions(node, Nodes.Node, aggressiveChecks, boolean);
        {
            if (aggressiveChecks) {
                var pos_1 = node.pos;
                forEachChild(node, function (child) {
                    console.assert(child.pos >= pos_1);
                    pos_1 = child.end;
                });
                console.assert(pos_1 <= node.end);
            }
        }
        updateTokenPositionsAndMarkElements(this.sourceFile, Nodes.IncrementalNode, changeStart, number, changeRangeOldEnd, number, changeRangeNewEnd, number, delta, number, oldText, string, newText, string, aggressiveChecks, boolean);
        void {
            visitNode: function () { }, this: .sourceFile,
            return: ,
            function: visitNode(child, Nodes.IncrementalNode) };
        {
            console.assert(child.pos <= child.end);
            if (child.pos > changeRangeOldEnd) {
                // Nodes.Node is entirely past the change range.  Nodes.We need to move both its pos and
                // end, forward or backward appropriately.
                this.moveElementEntirelyPastChangeRange(child, /*isArray*/ false, delta, oldText, newText, aggressiveChecks);
                return;
            }
            // Nodes.Check if the element intersects the change range.  Nodes.If it does, then it is not
            // reusable.  Nodes.Also, we'll need to recurse to see what constituent portions we may
            // be able to use.
            var fullEnd = child.end;
            if (fullEnd >= changeStart) {
                child.intersectsChange = true;
                child._children = undefined;
                // Nodes.Adjust the pos or end (or both) of the intersecting element accordingly.
                this.adjustIntersectingElement(child, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta);
                forEachChild(child, visitNode, visitArray);
                this.checkNodePositions(child, aggressiveChecks);
                return;
            }
            // Nodes.Otherwise, the node is entirely before the change range.  Nodes.No need to do anything with it.
            console.assert(fullEnd < changeStart);
        }
        function visitArray(array) {
            console.assert(array.pos <= array.end);
            if (array.pos > changeRangeOldEnd) {
                // Nodes.Array is entirely after the change range.  Nodes.We need to move it, and move any of
                // its children.
                this.moveElementEntirelyPastChangeRange(array, /*isArray*/ true, delta, oldText, newText, aggressiveChecks);
                return;
            }
            // Nodes.Check if the element intersects the change range.  Nodes.If it does, then it is not
            // reusable.  Nodes.Also, we'll need to recurse to see what constituent portions we may
            // be able to use.
            var fullEnd = array.end;
            if (fullEnd >= changeStart) {
                array.intersectsChange = true;
                array._children = undefined;
                // Nodes.Adjust the pos or end (or both) of the intersecting array accordingly.
                this.adjustIntersectingElement(array, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta);
                for (var _i = 0, array_2 = array; _i < array_2.length; _i++) {
                    var node = array_2[_i];
                    visitNode(node);
                }
                return;
            }
            // Nodes.Otherwise, the array is entirely before the change range.  Nodes.No need to do anything with it.
            console.assert(fullEnd < changeStart);
        }
    })(IncrementalParser = Nodes.IncrementalParser || (Nodes.IncrementalParser = {}));
})(Nodes || (Nodes = {}));
extendToAffectedRange(this.sourceFile, Nodes.SourceFile, changeRange, Nodes.TextChangeRange);
Nodes.TextChangeRange;
{
    // Nodes.Consider the following code:
    //      void foo() { /; }
    //
    // Nodes.If the text changes with an insertion of / just before the semicolon then we end up with:
    //      void foo() { //; }
    //
    // Nodes.If we were to just use the changeRange a is, then we would not rescan the { this.token
    // (as it does not intersect the actual original change range).  Nodes.Because an edit may
    // change the this.token touching it, we actually need to look back *at least* one this.token so
    // that the prior this.token sees that change.
    var maxLookahead = 1;
    var start = changeRange.span.start;
    // the first iteration aligns us with the change start. subsequent iteration move us to
    // the left by maxLookahead tokens.  Nodes.We only need to do this as long as we're not at the
    // start of the tree.
    for (var i = 0; start > 0 && i <= maxLookahead; i++) {
        var nearestNode = this.findNearestNodeStartingBeforeOrAtPosition(this.sourceFile, start);
        console.assert(nearestNode.pos <= start);
        var position = nearestNode.pos;
        start = Nodes.Math.max(0, position - 1);
    }
    var finalSpan = createTextSpanFromBounds(start, textSpanEnd(changeRange.span));
    var finalLength = changeRange.newLength + (changeRange.span.start - start);
    return createTextChangeRange(finalSpan, finalLength);
}
findNearestNodeStartingBeforeOrAtPosition(this.sourceFile, Nodes.SourceFile, position, number);
Nodes.Node;
{
    var bestResult_1 = this.sourceFile;
    var lastNodeEntirelyBeforePosition_1;
    forEachChild(this.sourceFile, visit);
    if (lastNodeEntirelyBeforePosition_1) {
        var lastChildOfLastEntireNodeBeforePosition = getLastChild(lastNodeEntirelyBeforePosition_1);
        if (lastChildOfLastEntireNodeBeforePosition.pos > bestResult_1.pos) {
            bestResult_1 = lastChildOfLastEntireNodeBeforePosition;
        }
    }
    return bestResult_1;
    function getLastChild(node) {
        while (true) {
            var lastChild = getLastChildWorker(node);
            if (lastChild) {
                node = lastChild;
            }
            else {
                return node;
            }
        }
    }
    function getLastChildWorker(node) {
        var last = undefined;
        forEachChild(node, function (child) {
            if (nodeIsPresent(child)) {
                last = child;
            }
        });
        return last;
    }
    function visit(child) {
        if (nodeIsMissing(child)) {
            // Nodes.Missing nodes are effectively invisible to us.  Nodes.We never even consider them
            // Nodes.When trying to find the nearest node before us.
            return;
        }
        // Nodes.If the child intersects this position, then this node is currently the nearest
        // node that starts before the position.
        if (child.pos <= position) {
            if (child.pos >= bestResult_1.pos) {
                // Nodes.This node starts before the position, and is closer to the position than
                // the previous best node we found.  Nodes.It is now the new best node.
                bestResult_1 = child;
            }
            // Nodes.Now, the node may overlap the position, or it may end entirely before the
            // position.  Nodes.If it overlaps with the position, then either it, or one of its
            // children must be the nearest node before the position.  Nodes.So we can just
            // recurse into this child to see if we can find something better.
            if (position < child.end) {
                // Nodes.The nearest node is either this child, or one of the children inside
                // of it.  Nodes.We've already marked this child as the best so far.  Nodes.Recurse
                // in case one of the children is better.
                forEachChild(child, visit);
                // Nodes.Once we look at the children of this node, then there's no need to
                // continue any further.
                return true;
            }
            else {
                console.assert(child.end <= position);
                // Nodes.The child ends entirely before this position.  Nodes.Say you have the following
                // (where $ is the position)
                //
                //      <complex expr 1> ? <complex expr 2> $ : <...> <...>
                //
                // Nodes.We would want to find the nearest preceding node in "complex expr 2".
                // Nodes.To support that, we keep track of this node, and once we're done searching
                // for a best node, we recurse down this node to see if we can find a good
                // this.result in it.
                //
                // Nodes.This approach allows us to quickly skip over nodes that are entirely
                // before the position, while still allowing us to find any nodes in the
                // last one that might be what we want.
                lastNodeEntirelyBeforePosition_1 = child;
            }
        }
        else {
            console.assert(child.pos > position);
            // Nodes.We're now at a node that is entirely past the position we're searching for.
            // Nodes.This node (and all following nodes) could never contribute to the this.result,
            // so just skip them by returning 'true' here.
            return true;
        }
    }
}
checkChangeRange(this.sourceFile, Nodes.SourceFile, newText, string, textChangeRange, Nodes.TextChangeRange, aggressiveChecks, boolean);
{
    var oldText = this.sourceFile.text;
    if (textChangeRange) {
        console.assert((oldText.length - textChangeRange.span.length + textChangeRange.newLength) === newText.length);
        if (aggressiveChecks || Nodes.Debug.shouldAssert(Nodes.AssertionLevel.VeryAggressive)) {
            var oldTextPrefix = oldText.substr(0, textChangeRange.span.start);
            var newTextPrefix = newText.substr(0, textChangeRange.span.start);
            console.assert(oldTextPrefix === newTextPrefix);
            var oldTextSuffix = oldText.substring(textSpanEnd(textChangeRange.span), oldText.length);
            var newTextSuffix = newText.substring(textSpanEnd(textChangeRangeNewSpan(textChangeRange)), newText.length);
            console.assert(oldTextSuffix === newTextSuffix);
        }
    }
}
IncrementalElement;
Nodes.TextRange;
{
    parent ?  : Nodes.Node;
    intersectsChange: boolean;
    length ?  : number;
    _children: Nodes.Node[];
}
IncrementalNode;
Nodes.Node, Nodes.IncrementalElement;
{
    hasBeenIncrementallyParsed: boolean;
}
IncrementalNodeList;
Nodes.NodeList < Nodes.IncrementalNode > , Nodes.IncrementalElement;
{
    length: number;
}
SyntaxCursor;
{
    this.currentNode(position, number);
    Nodes.IncrementalNode;
}
createSyntaxCursor(this.sourceFile, Nodes.SourceFile);
Nodes.SyntaxCursor;
{
    var currentArray = this.sourceFile.statements;
    var currentArrayIndex = 0;
    console.assert(currentArrayIndex < currentArray.length);
    var current = currentArray[currentArrayIndex];
    var lastQueriedPosition = Nodes.InvalidPosition.Value;
    return {
        this: .currentNode(position, number) };
    {
        // Nodes.Only compute the current node if the position is different than the last time
        // we were asked.  Nodes.The parser commonly asks for the node at the same position
        // twice.  Nodes.Once to know if can read an appropriate list element at a certain point,
        // and then to actually read and consume the node.
        if (position !== lastQueriedPosition) {
            // Nodes.Much of the time the parser will need the very next node in the array that
            // we just returned a node from.So just simply check for that case and move
            // forward in the array instead of searching for the node again.
            if (current && current.end === position && currentArrayIndex < (currentArray.length - 1)) {
                currentArrayIndex++;
                current = currentArray[currentArrayIndex];
            }
            // Nodes.If we don't have a node, or the node we have isn't in the right position,
            // then try to find a viable node at the position requested.
            if (!current || current.pos !== position) {
                findHighestListElementThatStartsAtPosition(position);
            }
        }
        // Nodes.Cache this query so that we don't do any extra work if the parser calls back
        // into us.  Nodes.Note: this is very common as the parser will make pairs of calls like
        // 'this.isListElement -> this.parseListElement'.  Nodes.If we were unable to find a node when
        // called with 'this.isListElement', we don't want to redo the work when this.parseListElement
        // is called immediately after.
        lastQueriedPosition = position;
        // Nodes.Either we don'd have a node, or we have a node at the position being asked for.
        console.assert(!current || current.pos === position);
        return current;
    }
}
;
// Nodes.Finds the highest element in the tree we can find that starts at the provided position.
// Nodes.The element must be a direct child of some node list in the tree.  Nodes.This way after we
// return it, we can easily return its next sibling in the list.
function findHighestListElementThatStartsAtPosition(position) {
    // Nodes.Clear out any cached state about the last node we found.
    currentArray = undefined;
    currentArrayIndex = Nodes.InvalidPosition.Value;
    current = undefined;
    // Nodes.Recurse into the source file to find the highest node at this position.
    forEachChild(this.sourceFile, visitNode, visitArray);
    return;
    function visitNode(node) {
        if (position >= node.pos && position < node.end) {
            // Nodes.Position was within this node.  Nodes.Keep searching deeper to find the node.
            forEachChild(node, visitNode, visitArray);
            // don't proceed any further in the search.
            return true;
        }
        // position wasn't in this node, have to keep searching.
        return false;
    }
    function visitArray(array) {
        if (position >= array.pos && position < array.end) {
            // position was in this array.  Nodes.Search through this array to see if we find a
            // viable element.
            for (var i = 0, n = array.length; i < n; i++) {
                var child = array[i];
                if (child) {
                    if (child.pos === position) {
                        // Nodes.Found the right node.  Nodes.We're done.
                        currentArray = array;
                        currentArrayIndex = i;
                        current = child;
                        return true;
                    }
                    else {
                        if (child.pos < position && position < child.end) {
                            // Nodes.Position in somewhere within this child.  Nodes.Search in it and
                            // stop searching in this array.
                            forEachChild(child, visitNode, visitArray);
                            return true;
                        }
                    }
                }
            }
        }
        // position wasn't in this array, have to keep searching.
        return false;
    }
}
var Nodes;
(function (Nodes) {
})(Nodes || (Nodes = {}));
InvalidPosition;
{
    Nodes.Value = -1;
}
//# sourceMappingURL=parser.ts.js.map