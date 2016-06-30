/**
 * @fileOverview 语法解析器
 */
var tokenType_1 = require('./tokenType');
var lexer_1 = require('./lexer');
var ast = require('./nodes');
var Compiler = require('../compiler/compiler');
/**
 * 表示一个语法解析器。
 */
var Parser = (function () {
    function Parser() {
        /**
         * 获取或设置当前语法解析器使用的词法解析器。
         */
        this.lexer = new lexer_1.Lexer();
        /**
         * 存储内部解析的标记。
         */
        this.flags = 0;
    }
    /**
     * 解析指定的代码。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param end 解析的源码结束位置。
     * @param fileName 解析的源码位置。
     */
    Parser.prototype.parse = function (source, start, end, fileName) {
    };
    /**
     * 解析指定的标记。
     * @param token 期待的标记。
     * @returns 如果已解析到正确的标签则返回 true，否则返回 false。
     */
    Parser.prototype.parseExpected = function (token) {
        if (this.lexer.tokenType === token) {
            this.lexer.read();
            return true;
        }
        this.reportSyntaxError("应输入“{0}”；实际是“{1}”", tokenType_1.tokenToString(token), tokenType_1.tokenToString(this.lexer.tokenType));
        return false;
    };
    /**
     * 如果存在则解析指定的标记。
     * @param token 期待的标记。
     */
    Parser.prototype.parseOptional = function (token) {
        if (this.lexer.tokenType === token) {
            this.lexer.read();
            return true;
        }
        return false;
    };
    /**
     * 报告语法错误。
     * @param message 错误的信息。
     * @param args 格式化错误的参数。
     */
    Parser.prototype.reportSyntaxError = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
    };
    // #region 语句
    /**
     * 解析一个语句。
     */
    Parser.prototype.parseStatement = function () {
        switch (this.lexer.tokenType) {
            case tokenType_1.TokenType.semicolon:
                return this.parseEmptyStatement();
            case tokenType_1.TokenType.openBrace:
                return parseBlock(/*ignoreMissingOpenBrace*/ false);
            case tokenType_1.TokenType.VarKeyword:
                return parseVariableStatement(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case tokenType_1.TokenType.LetKeyword:
                if (isLetDeclaration()) {
                    return parseVariableStatement(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
                }
                break;
            case tokenType_1.TokenType.FunctionKeyword:
                return parseFunctionDeclaration(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case tokenType_1.TokenType.ClassKeyword:
                return parseClassDeclaration(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case tokenType_1.TokenType.IfKeyword:
                return parseIfStatement();
            case tokenType_1.TokenType.DoKeyword:
                return parseDoStatement();
            case tokenType_1.TokenType.WhileKeyword:
                return parseWhileStatement();
            case tokenType_1.TokenType.ForKeyword:
                return parseForOrForInOrForOfStatement();
            case tokenType_1.TokenType.ContinueKeyword:
                return parseBreakOrContinueStatement(tokenType_1.TokenType.ContinueStatement);
            case tokenType_1.TokenType.BreakKeyword:
                return parseBreakOrContinueStatement(tokenType_1.TokenType.BreakStatement);
            case tokenType_1.TokenType.ReturnKeyword:
                return parseReturnStatement();
            case tokenType_1.TokenType.WithKeyword:
                return parseWithStatement();
            case tokenType_1.TokenType.SwitchKeyword:
                return parseSwitchStatement();
            case tokenType_1.TokenType.ThrowKeyword:
                return parseThrowStatement();
            case tokenType_1.TokenType.TryKeyword:
            // Include 'catch' and 'finally' for error recovery.
            case tokenType_1.TokenType.CatchKeyword:
            case tokenType_1.TokenType.FinallyKeyword:
                return parseTryStatement();
            case tokenType_1.TokenType.DebuggerKeyword:
                return parseDebuggerStatement();
            case tokenType_1.TokenType.AtToken:
                return parseDeclaration();
            case tokenType_1.TokenType.AsyncKeyword:
            case tokenType_1.TokenType.InterfaceKeyword:
            case tokenType_1.TokenType.TypeKeyword:
            case tokenType_1.TokenType.ModuleKeyword:
            case tokenType_1.TokenType.NamespaceKeyword:
            case tokenType_1.TokenType.DeclareKeyword:
            case tokenType_1.TokenType.ConstKeyword:
            case tokenType_1.TokenType.EnumKeyword:
            case tokenType_1.TokenType.ExportKeyword:
            case tokenType_1.TokenType.ImportKeyword:
            case tokenType_1.TokenType.PrivateKeyword:
            case tokenType_1.TokenType.ProtectedKeyword:
            case tokenType_1.TokenType.PublicKeyword:
            case tokenType_1.TokenType.AbstractKeyword:
            case tokenType_1.TokenType.StaticKeyword:
            case tokenType_1.TokenType.ReadonlyKeyword:
            case tokenType_1.TokenType.GlobalKeyword:
                if (isStartOfDeclaration()) {
                    return parseDeclaration();
                }
                break;
        }
        return parseExpressionOrLabeledStatement();
    };
    Parser.prototype.parseEmptyStatement = function () {
        var result = new ast.EmptyStatement();
        result.start = this.lexer.tokenStart;
        this.this.parseExpected(tokenType_1.TokenType.semicolon);
        result.end = this.lexer.tokenEnd;
        return result;
    };
    //    // Share a single scanner across all calls to parse a source file.  This helps speed things
    //    // up by avoiding the cost of creating/compiling scanners over and over again.
    //    const scanner = createScanner(ScriptTarget.Latest, /*skipTrivia*/ true);
    //    const disallowInAndDecoratorContext = NodeFlags.DisallowInContext | NodeFlags.DecoratorContext;
    //        // capture constructors in 'initializeState' to avoid null checks
    //        let NodeConstructor: new (kind: TokenType, pos: number, end: number) => Node;
    //let SourceFileConstructor: new (kind: TokenType, pos: number, end: number) => Node;
    //let sourceFile: SourceFile;
    //let parseDiagnostics: Diagnostic[];
    //let syntaxCursor: IncrementalParser.SyntaxCursor;
    //let token: TokenType;
    //let sourceText: string;
    //let nodeCount: number;
    //let identifiers: Map<string>;
    //let identifierCount: number;
    //let parsingContext: ParsingContext;
    // Flags that dictate what parsing context we're in.  For example:
    // Whether or not we are in strict parsing mode.  All that changes in strict parsing mode is
    // that some tokens that would be considered identifiers may be considered keywords.
    //
    // When adding more parser context flags, consider which is the more common case that the
    // flag will be in.  This should be the 'false' state for that flag.  The reason for this is
    // that we don't store data in our nodes unless the value is in the *non-default* state.  So,
    // for example, more often than code 'allows-in' (or doesn't 'disallow-in').  We opt for
    // 'disallow-in' set to 'false'.  Otherwise, if we had 'allowsIn' set to 'true', then almost
    // all nodes would need extra state on them to store this info.
    //
    // Note:  'allowIn' and 'allowYield' track 1:1 with the [in] and [yield] concepts in the ES6
    // grammar specification.
    //
    // An important thing about these context concepts.  By default they are effectively inherited
    // while parsing through every grammar production.  i.e. if you don't change them, then when
    // you parse a sub-production, it will have the same context values as the parent production.
    // This is great most of the time.  After all, consider all the 'expression' grammar productions
    // and how nearly all of them pass along the 'in' and 'yield' context values:
    //
    // EqualityExpression[In, Yield] :
    //      RelationalExpression[?In, ?Yield]
    //      EqualityExpression[?In, ?Yield] == RelationalExpression[?In, ?Yield]
    //      EqualityExpression[?In, ?Yield] != RelationalExpression[?In, ?Yield]
    //      EqualityExpression[?In, ?Yield] === RelationalExpression[?In, ?Yield]
    //      EqualityExpression[?In, ?Yield] !== RelationalExpression[?In, ?Yield]
    //
    // Where you have to be careful is then understanding what the points are in the grammar
    // where the values are *not* passed along.  For example:
    //
    // SingleNameBinding[Yield,GeneratorParameter]
    //      [+GeneratorParameter]BindingIdentifier[Yield] Initializer[In]opt
    //      [~GeneratorParameter]BindingIdentifier[?Yield]Initializer[In, ?Yield]opt
    //
    // Here this is saying that if the GeneratorParameter context flag is set, that we should
    // explicitly set the 'yield' context flag to false before calling into the BindingIdentifier
    // and we should explicitly unset the 'yield' context flag before calling into the Initializer.
    // production.  Conversely, if the GeneratorParameter context flag is not set, then we
    // should leave the 'yield' context flag alone.
    //
    // Getting this all correct is tricky and requires careful reading of the grammar to
    // understand when these values should be changed versus when they should be inherited.
    //
    // Note: it should not be necessary to save/restore these flags during speculative/lookahead
    // parsing.  These context flags are naturally stored and restored through normal recursive
    //// descent parsing and unwinding.
    //let contextFlags: NodeFlags;
    // Whether or not we've had a parse error since creating the last AST node.  If we have
    // encountered an error, it will be stored on the next AST node we create.  Parse errors
    // can be broken down into three categories:
    //
    // 1) An error that occurred during scanning.  For example, an unterminated literal, or a
    //    character that was completely not understood.
    //
    // 2) A token was expected, but was not present.  This type of error is commonly produced
    //    by the 'this.parseExpected' private.
    //
    // 3) A token was present that no parsing private was able to consume.  This type of error
    //    only occurs in the 'abortParsingListOrMoveToNextToken' private when the parser
    //    decides to skip the token.
    //
    // In all of these cases, we want to mark the next node as having had an error before it.
    // With this mark, we can know in incremental settings if this node can be reused, or if
    // we have to reparse it.  If we don't keep this information around, we may just reuse the
    // node.  in that event we would then not produce the same errors as we did before, causing
    // significant confusion problems.
    //
    // Note: it is necessary that this value be saved/restored during speculative/lookahead
    // parsing.  During lookahead parsing, we will often create a node.  That node will have
    // this value attached, and then this value will be set back to 'false'.  If we decide to
    // rewind, we must get back to the same value we had prior to the lookahead.
    //
    // Note: any errors at the end of the file that do not precede a regular node, should get
    //// attached to the EOF token.
    //let parseErrorBeforeNextFinishedNode = false;
    Parser.prototype.parseSourceFile = function (fileName, _sourceText, languageVersion, _syntaxCursor, setParentNodes, scriptKind) {
        scriptKind = ensureScriptKind(fileName, scriptKind);
        initializeState(fileName, _sourceText, languageVersion, _syntaxCursor, scriptKind);
        var result = parseSourceFileWorker(fileName, languageVersion, setParentNodes, scriptKind);
        clearState();
        return result;
    };
    Parser.prototype.getLanguageVariant = function (scriptKind) {
        // .tsx and .jsx files are treated as jsx language variant.
        return scriptKind === ScriptKind.TSX || scriptKind === ScriptKind.JSX || scriptKind === ScriptKind.JS ? LanguageVariant.JSX : LanguageVariant.Standard;
    };
    Parser.prototype.initializeState = function (fileName, _sourceText, languageVersion, _syntaxCursor, scriptKind) {
        NodeConstructor = objectAllocator.getNodeConstructor();
        SourceFileConstructor = objectAllocator.getSourceFileConstructor();
        sourceText = _sourceText;
        syntaxCursor = _syntaxCursor;
        parseDiagnostics = [];
        parsingContext = 0;
        identifiers = {};
        identifierCount = 0;
        nodeCount = 0;
        contextFlags = scriptKind === ScriptKind.JS || scriptKind === ScriptKind.JSX ? NodeFlags.JavaScriptFile : NodeFlags.None;
        parseErrorBeforeNextFinishedNode = false;
        // Initialize and prime the scanner before parsing the source elements.
        scanner.setText(sourceText);
        scanner.setOnError(scanError);
        scanner.setScriptTarget(languageVersion);
        scanner.setLanguageVariant(getLanguageVariant(scriptKind));
    };
    Parser.prototype.clearState = function () {
        // Clear out the text the scanner is pointing at, so it doesn't keep anything alive unnecessarily.
        scanner.setText("");
        scanner.setOnError(undefined);
        // Clear any data.  We don't want to accidentally hold onto it for too long.
        parseDiagnostics = undefined;
        sourceFile = undefined;
        identifiers = undefined;
        syntaxCursor = undefined;
        sourceText = undefined;
    };
    Parser.prototype.parseSourceFileWorker = function (fileName, languageVersion, setParentNodes, scriptKind) {
        sourceFile = createSourceFile(fileName, languageVersion, scriptKind);
        sourceFile.flags = contextFlags;
        // Prime the scanner.
        token = nextToken();
        processReferenceComments(sourceFile);
        sourceFile.statements = parseList(ParsingContext.SourceElements, parseStatement);
        Debug.assert(token === tokenType_1.TokenType.EndOfFileToken);
        sourceFile.endOfFileToken = parseTokenNode();
        setExternalModuleIndicator(sourceFile);
        sourceFile.nodeCount = nodeCount;
        sourceFile.identifierCount = identifierCount;
        sourceFile.identifiers = identifiers;
        sourceFile.parseDiagnostics = parseDiagnostics;
        if (setParentNodes) {
            fixupParentReferences(sourceFile);
        }
        return sourceFile;
    };
    Parser.prototype.addJSDocComment = function (node) {
        if (contextFlags & NodeFlags.JavaScriptFile) {
            var comments = getLeadingCommentRangesOfNode(node, sourceFile);
            if (comments) {
                for (var _i = 0, comments_1 = comments; _i < comments_1.length; _i++) {
                    var comment = comments_1[_i];
                    var jsDocComment = JSDocParser.parseJSDocComment(node, comment.pos, comment.end - comment.pos);
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
    };
    Parser.prototype.fixupParentReferences = function (rootNode) {
        // normally parent references are set during binding. However, for clients that only need
        // a syntax tree, and no semantic features, then the binding process is an unnecessary
        // overhead.  This privates allows us to set all the parents, without all the expense of
        // binding.
        var parent = rootNode;
        forEachChild(rootNode, visitNode);
        return;
        function visitNode(n) {
            // walk down setting parents that differ from the parent we think it should be.  This
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
    exports.fixupParentReferences = fixupParentReferences;;
    Parser.prototype.createSourceFile = function (fileName, languageVersion, scriptKind) {
        // code from createNode is inlined here so createNode won't have to deal with special case of creating source files
        // this is quite rare comparing to other nodes and createNode should be as fast as possible
        var sourceFile = new SourceFileConstructor(tokenType_1.TokenType.SourceFile, /*pos*/ 0, /* end */ sourceText.length);
        nodeCount++;
        sourceFile.text = sourceText;
        sourceFile.bindDiagnostics = [];
        sourceFile.languageVersion = languageVersion;
        sourceFile.fileName = normalizePath(fileName);
        sourceFile.languageVariant = getLanguageVariant(scriptKind);
        sourceFile.isDeclarationFile = fileExtensionIs(sourceFile.fileName, ".d.ts");
        sourceFile.scriptKind = scriptKind;
        return sourceFile;
    };
    Parser.prototype.setContextFlag = function (val, flag) {
        if (val) {
            contextFlags |= flag;
        }
        else {
            contextFlags &= ~flag;
        }
    };
    Parser.prototype.setDisallowInContext = function (val) {
        setContextFlag(val, NodeFlags.DisallowInContext);
    };
    Parser.prototype.setYieldContext = function (val) {
        setContextFlag(val, NodeFlags.YieldContext);
    };
    Parser.prototype.setDecoratorContext = function (val) {
        setContextFlag(val, NodeFlags.DecoratorContext);
    };
    Parser.prototype.setAwaitContext = function (val) {
        setContextFlag(val, NodeFlags.AwaitContext);
    };
    Parser.prototype.doOutsideOfContext = function (context, func) {
        // contextFlagsToClear will contain only the context flags that are
        // currently set that we need to temporarily clear
        // We don't just blindly reset to the previous flags to ensure
        // that we do not mutate cached flags for the incremental
        // parser (ThisNodeHasError, ThisNodeOrAnySubNodesHasError, and
        // HasAggregatedChildData).
        var contextFlagsToClear = context & contextFlags;
        if (contextFlagsToClear) {
            // clear the requested context flags
            setContextFlag(/*val*/ false, contextFlagsToClear);
            var result = func();
            // restore the context flags we just cleared
            setContextFlag(/*val*/ true, contextFlagsToClear);
            return result;
        }
        // no need to do anything special as we are not in any of the requested contexts
        return func();
    };
    Parser.prototype.doInsideOfContext = function (context, func) {
        // contextFlagsToSet will contain only the context flags that
        // are not currently set that we need to temporarily enable.
        // We don't just blindly reset to the previous flags to ensure
        // that we do not mutate cached flags for the incremental
        // parser (ThisNodeHasError, ThisNodeOrAnySubNodesHasError, and
        // HasAggregatedChildData).
        var contextFlagsToSet = context & ~contextFlags;
        if (contextFlagsToSet) {
            // set the requested context flags
            setContextFlag(/*val*/ true, contextFlagsToSet);
            var result = func();
            // reset the context flags we just set
            setContextFlag(/*val*/ false, contextFlagsToSet);
            return result;
        }
        // no need to do anything special as we are already in all of the requested contexts
        return func();
    };
    Parser.prototype.allowInAnd = function (func) {
        return doOutsideOfContext(NodeFlags.DisallowInContext, func);
    };
    Parser.prototype.disallowInAnd = function (func) {
        return doInsideOfContext(NodeFlags.DisallowInContext, func);
    };
    Parser.prototype.doInYieldContext = function (func) {
        return doInsideOfContext(NodeFlags.YieldContext, func);
    };
    Parser.prototype.doInDecoratorContext = function (func) {
        return doInsideOfContext(NodeFlags.DecoratorContext, func);
    };
    Parser.prototype.doInAwaitContext = function (func) {
        return doInsideOfContext(NodeFlags.AwaitContext, func);
    };
    Parser.prototype.doOutsideOfAwaitContext = function (func) {
        return doOutsideOfContext(NodeFlags.AwaitContext, func);
    };
    Parser.prototype.doInYieldAndAwaitContext = function (func) {
        return doInsideOfContext(NodeFlags.YieldContext | NodeFlags.AwaitContext, func);
    };
    Parser.prototype.inContext = function (flags) {
        return (contextFlags & flags) !== 0;
    };
    Parser.prototype.inYieldContext = function () {
        return inContext(NodeFlags.YieldContext);
    };
    Parser.prototype.inDisallowInContext = function () {
        return inContext(NodeFlags.DisallowInContext);
    };
    Parser.prototype.inDecoratorContext = function () {
        return inContext(NodeFlags.DecoratorContext);
    };
    Parser.prototype.inAwaitContext = function () {
        return inContext(NodeFlags.AwaitContext);
    };
    Parser.prototype.parseErrorAtCurrentToken = function (message, arg0) {
        var start = scanner.getTokenPos();
        var length = scanner.getTextPos() - start;
        parseErrorAtPosition(start, length, message, arg0);
    };
    Parser.prototype.parseErrorAtPosition = function (start, length, message, arg0) {
        // Don't report another error if it would just be at the same position as the last error.
        var lastError = lastOrUndefined(parseDiagnostics);
        if (!lastError || start !== lastError.start) {
            parseDiagnostics.push(createFileDiagnostic(sourceFile, start, length, message, arg0));
        }
        // Mark that we've encountered an error.  We'll set an appropriate bit on the next
        // node we finish so that it can't be reused incrementally.
        parseErrorBeforeNextFinishedNode = true;
    };
    Parser.prototype.scanError = function (message, length) {
        var pos = scanner.getTextPos();
        parseErrorAtPosition(pos, length || 0, message);
    };
    Parser.prototype.getNodePos = function () {
        return scanner.getStartPos();
    };
    Parser.prototype.getNodeEnd = function () {
        return scanner.getStartPos();
    };
    Parser.prototype.nextToken = function () {
        return token = scanner.scan();
    };
    Parser.prototype.reScanGreaterToken = function () {
        return token = scanner.reScanGreaterToken();
    };
    Parser.prototype.reScanSlashToken = function () {
        return token = scanner.reScanSlashToken();
    };
    Parser.prototype.reScanTemplateToken = function () {
        return token = scanner.reScanTemplateToken();
    };
    Parser.prototype.scanJsxIdentifier = function () {
        return token = scanner.scanJsxIdentifier();
    };
    Parser.prototype.scanJsxText = function () {
        return token = scanner.scanJsxToken();
    };
    Parser.prototype.speculationHelper = function (callback, isLookAhead) {
        // Keep track of the state we'll need to rollback to if lookahead fails (or if the
        // caller asked us to always reset our state).
        var saveToken = token;
        var saveParseDiagnosticsLength = parseDiagnostics.length;
        var saveParseErrorBeforeNextFinishedNode = parseErrorBeforeNextFinishedNode;
        // Note: it is not actually necessary to save/restore the context flags here.  That's
        // because the saving/restoring of these flags happens naturally through the recursive
        // descent nature of our parser.  However, we still store this here just so we can
        // assert that that invariant holds.
        var saveContextFlags = contextFlags;
        // If we're only looking ahead, then tell the scanner to only lookahead as well.
        // Otherwise, if we're actually speculatively parsing, then tell the scanner to do the
        // same.
        var result = isLookAhead
            ? scanner.lookAhead(callback)
            : scanner.tryScan(callback);
        Debug.assert(saveContextFlags === contextFlags);
        // If our callback returned something 'falsy' or we're just looking ahead,
        // then unconditionally restore us to where we were.
        if (!result || isLookAhead) {
            token = saveToken;
            parseDiagnostics.length = saveParseDiagnosticsLength;
            parseErrorBeforeNextFinishedNode = saveParseErrorBeforeNextFinishedNode;
        }
        return result;
    };
    /** Invokes the provided callback then unconditionally restores the parser to the state it
     * was in immediately prior to invoking the callback.  The result of invoking the callback
     * is returned from this private.
     */
    Parser.prototype.lookAhead = function (callback) {
        return speculationHelper(callback, /*isLookAhead*/ true);
    };
    /** Invokes the provided callback.  If the callback returns something falsy, then it restores
     * the parser to the state it was in immediately prior to invoking the callback.  If the
     * callback returns something truthy, then the parser state is not rolled back.  The result
     * of invoking the callback is returned from this private.
     */
    Parser.prototype.tryParse = function (callback) {
        return speculationHelper(callback, /*isLookAhead*/ false);
    };
    /**
     * 判断是否紧跟一个标识符。
     */
    Parser.prototype.fallowsIdentifier = function () {
        switch (this.lexer.currentToken.type) {
            case tokenType_1.TokenType.identifier:
                return true;
            // If we have a 'yield' keyword, and we're in the [yield] context, then 'yield' is
            // considered a keyword and is not an identifier.
            case tokenType_1.TokenType.yield:
                if (this.flags & ParseFlags.allowYield) {
                    return false;
                }
            // If we have a 'await' keyword, and we're in the [Await] context, then 'await' is
            // considered a keyword and is not an identifier.
            case tokenType_1.TokenType.await:
                if (this.flags & ParseFlags.allowAwait) {
                    return false;
                }
            default:
                return tokenType_1.isNonReservedWord(this.lexer.currentToken.type);
        }
    };
    Parser.prototype.parseOptionalToken = function (t) {
        if (token === t) {
            return parseTokenNode();
        }
        return undefined;
    };
    Parser.prototype.parseTokenNode = function () {
        var node = createNode(token);
        nextToken();
        return finishNode(node);
    };
    /**
     * 判断当前位置是否可以自动插入分号。
     */
    Parser.prototype.autoInsertSemicolon = function () {
        switch (this.lexer.tokenType) {
            case tokenType_1.TokenType.semicolon:
            case tokenType_1.TokenType.closeBrace:
            case tokenType_1.TokenType.endOfFile:
                return true;
            default:
                return this.lexer.hasLineTerminatorBeforeTokenStart;
        }
    };
    Parser.prototype.parseSemicolon = function () {
        if (this.autoInsertSemicolon()) {
            if (token === tokenType_1.TokenType.SemicolonToken) {
                // consume the semicolon if it was explicitly provided.
                nextToken();
            }
            return true;
        }
        else {
            return this.parseExpected(tokenType_1.TokenType.SemicolonToken);
        }
    };
    // note: this private creates only node
    Parser.prototype.createNode = function (kind, pos) {
        nodeCount++;
        if (!(pos >= 0)) {
            pos = scanner.getStartPos();
        }
        return new NodeConstructor(kind, pos, pos);
    };
    Parser.prototype.finishNode = function (node, end) {
        node.end = end === undefined ? scanner.getStartPos() : end;
        if (contextFlags) {
            node.flags |= contextFlags;
        }
        // Keep track on the node if we encountered an error while parsing it.  If we did, then
        // we cannot reuse the node incrementally.  Once we've marked this node, clear out the
        // flag so that we don't mark any subsequent nodes.
        if (parseErrorBeforeNextFinishedNode) {
            parseErrorBeforeNextFinishedNode = false;
            node.flags |= NodeFlags.ThisNodeHasError;
        }
        return node;
    };
    Parser.prototype.createMissingNode = function (kind, reportAtCurrentPosition, diagnosticMessage, arg0) {
        if (reportAtCurrentPosition) {
            parseErrorAtPosition(scanner.getStartPos(), 0, diagnosticMessage, arg0);
        }
        else {
            parseErrorAtCurrentToken(diagnosticMessage, arg0);
        }
        var result = createNode(kind, scanner.getStartPos());
        result.text = "";
        return finishNode(result);
    };
    Parser.prototype.internIdentifier = function (text) {
        text = escapeIdentifier(text);
        return hasProperty(identifiers, text) ? identifiers[text] : (identifiers[text] = text);
    };
    // An identifier that starts with two underscores has an extra underscore character prepended to it to avoid issues
    // with magic property names like '__proto__'. The 'identifiers' object is used to share a single string instance for
    // each identifier in order to reduce memory consumption.
    Parser.prototype.createIdentifier = function (isIdentifier, diagnosticMessage) {
        identifierCount++;
        if (isIdentifier) {
            var node = createNode(tokenType_1.TokenType.Identifier);
            // Store original token kind if it is not just an Identifier so we can report appropriate error later in type checker
            if (token !== tokenType_1.TokenType.Identifier) {
                node.originalKeywordKind = token;
            }
            node.text = internIdentifier(scanner.getTokenValue());
            nextToken();
            return finishNode(node);
        }
        return createMissingNode(tokenType_1.TokenType.Identifier, /*reportAtCurrentPosition*/ false, diagnosticMessage || Diagnostics.Identifier_expected);
    };
    Parser.prototype.parseIdentifier = function (diagnosticMessage) {
        return createIdentifier(isIdentifier(), diagnosticMessage);
    };
    Parser.prototype.parseIdentifierName = function () {
        return createIdentifier(tokenIsIdentifierOrKeyword(token));
    };
    Parser.prototype.isLiteralPropertyName = function () {
        return tokenIsIdentifierOrKeyword(token) ||
            token === tokenType_1.TokenType.StringLiteral ||
            token === tokenType_1.TokenType.NumericLiteral;
    };
    Parser.prototype.parsePropertyNameWorker = function (allowComputedPropertyNames) {
        if (token === tokenType_1.TokenType.StringLiteral || token === tokenType_1.TokenType.NumericLiteral) {
            return parseLiteralNode(/*internName*/ true);
        }
        if (allowComputedPropertyNames && token === tokenType_1.TokenType.OpenBracketToken) {
            return parseComputedPropertyName();
        }
        return parseIdentifierName();
    };
    Parser.prototype.parsePropertyName = function () {
        return parsePropertyNameWorker(/*allowComputedPropertyNames*/ true);
    };
    Parser.prototype.parseSimplePropertyName = function () {
        return parsePropertyNameWorker(/*allowComputedPropertyNames*/ false);
    };
    Parser.prototype.isSimplePropertyName = function () {
        return token === tokenType_1.TokenType.StringLiteral || token === tokenType_1.TokenType.NumericLiteral || tokenIsIdentifierOrKeyword(token);
    };
    Parser.prototype.parseComputedPropertyName = function () {
        // PropertyName [Yield]:
        //      LiteralPropertyName
        //      ComputedPropertyName[?Yield]
        var node = createNode(tokenType_1.TokenType.ComputedPropertyName);
        this.parseExpected(tokenType_1.TokenType.OpenBracketToken);
        // We parse any expression (including a comma expression). But the grammar
        // says that only an assignment expression is allowed, so the grammar checker
        // will error if it sees a comma expression.
        node.expression = allowInAnd(parseExpression);
        this.parseExpected(tokenType_1.TokenType.CloseBracketToken);
        return finishNode(node);
    };
    Parser.prototype.parseContextualModifier = function (t) {
        return token === t && tryParse(nextTokenCanFollowModifier);
    };
    Parser.prototype.nextTokenIsOnSameLineAndCanFollowModifier = function () {
        nextToken();
        if (scanner.hasPrecedingLineBreak()) {
            return false;
        }
        return canFollowModifier();
    };
    Parser.prototype.nextTokenCanFollowModifier = function () {
        if (token === tokenType_1.TokenType.ConstKeyword) {
            // 'const' is only a modifier if followed by 'enum'.
            return nextToken() === tokenType_1.TokenType.EnumKeyword;
        }
        if (token === tokenType_1.TokenType.ExportKeyword) {
            nextToken();
            if (token === tokenType_1.TokenType.DefaultKeyword) {
                return lookAhead(nextTokenIsClassOrFunction);
            }
            return token !== tokenType_1.TokenType.AsteriskToken && token !== tokenType_1.TokenType.AsKeyword && token !== tokenType_1.TokenType.OpenBraceToken && canFollowModifier();
        }
        if (token === tokenType_1.TokenType.DefaultKeyword) {
            return nextTokenIsClassOrFunction();
        }
        if (token === tokenType_1.TokenType.StaticKeyword) {
            nextToken();
            return canFollowModifier();
        }
        return nextTokenIsOnSameLineAndCanFollowModifier();
    };
    Parser.prototype.parseAnyContextualModifier = function () {
        return isModifierKind(token) && tryParse(nextTokenCanFollowModifier);
    };
    Parser.prototype.canFollowModifier = function () {
        return token === tokenType_1.TokenType.OpenBracketToken
            || token === tokenType_1.TokenType.OpenBraceToken
            || token === tokenType_1.TokenType.AsteriskToken
            || token === tokenType_1.TokenType.DotDotDotToken
            || isLiteralPropertyName();
    };
    Parser.prototype.nextTokenIsClassOrFunction = function () {
        nextToken();
        return token === tokenType_1.TokenType.ClassKeyword || token === tokenType_1.TokenType.FunctionKeyword;
    };
    // True if positioned at the start of a list element
    Parser.prototype.isListElement = function (parsingContext, inErrorRecovery) {
        var node = currentNode(parsingContext);
        if (node) {
            return true;
        }
        switch (parsingContext) {
            case ParsingContext.SourceElements:
            case ParsingContext.BlockStatements:
            case ParsingContext.SwitchClauseStatements:
                // If we're in error recovery, then we don't want to treat ';' as an empty statement.
                // The problem is that ';' can show up in far too many contexts, and if we see one
                // and assume it's a statement, then we may bail out inappropriately from whatever
                // we're parsing.  For example, if we have a semicolon in the middle of a class, then
                // we really don't want to assume the class is over and we're on a statement in the
                // outer module.  We just want to consume and move on.
                return !(token === tokenType_1.TokenType.SemicolonToken && inErrorRecovery) && isStartOfStatement();
            case ParsingContext.SwitchClauses:
                return token === tokenType_1.TokenType.CaseKeyword || token === tokenType_1.TokenType.DefaultKeyword;
            case ParsingContext.TypeMembers:
                return lookAhead(isTypeMemberStart);
            case ParsingContext.ClassMembers:
                // We allow semicolons as class elements (as specified by ES6) as long as we're
                // not in error recovery.  If we're in error recovery, we don't want an errant
                // semicolon to be treated as a class member (since they're almost always used
                // for statements.
                return lookAhead(isClassMemberStart) || (token === tokenType_1.TokenType.SemicolonToken && !inErrorRecovery);
            case ParsingContext.EnumMembers:
                // Include open bracket computed properties. This technically also lets in indexers,
                // which would be a candidate for improved error reporting.
                return token === tokenType_1.TokenType.OpenBracketToken || isLiteralPropertyName();
            case ParsingContext.ObjectLiteralMembers:
                return token === tokenType_1.TokenType.OpenBracketToken || token === tokenType_1.TokenType.AsteriskToken || isLiteralPropertyName();
            case ParsingContext.ObjectBindingElements:
                return token === tokenType_1.TokenType.OpenBracketToken || isLiteralPropertyName();
            case ParsingContext.HeritageClauseElement:
                // If we see { } then only consume it as an expression if it is followed by , or {
                // That way we won't consume the body of a class in its heritage clause.
                if (token === tokenType_1.TokenType.OpenBraceToken) {
                    return lookAhead(isValidHeritageClauseObjectLiteral);
                }
                if (!inErrorRecovery) {
                    return isStartOfLeftHandSideExpression() && !isHeritageClauseExtendsOrImplementsKeyword();
                }
                else {
                    // If we're in error recovery we tighten up what we're willing to match.
                    // That way we don't treat something like "this" as a valid heritage clause
                    // element during recovery.
                    return isIdentifier() && !isHeritageClauseExtendsOrImplementsKeyword();
                }
            case ParsingContext.VariableDeclarations:
                return isIdentifierOrPattern();
            case ParsingContext.ArrayBindingElements:
                return token === tokenType_1.TokenType.CommaToken || token === tokenType_1.TokenType.DotDotDotToken || isIdentifierOrPattern();
            case ParsingContext.TypeParameters:
                return isIdentifier();
            case ParsingContext.ArgumentExpressions:
            case ParsingContext.ArrayLiteralMembers:
                return token === tokenType_1.TokenType.CommaToken || token === tokenType_1.TokenType.DotDotDotToken || fallowsExpression();
            case ParsingContext.Parameters:
                return isStartOfParameter();
            case ParsingContext.TypeArguments:
            case ParsingContext.TupleElementTypes:
                return token === tokenType_1.TokenType.CommaToken || isStartOfType();
            case ParsingContext.HeritageClauses:
                return isHeritageClause();
            case ParsingContext.ImportOrExportSpecifiers:
                return tokenIsIdentifierOrKeyword(token);
            case ParsingContext.JsxAttributes:
                return tokenIsIdentifierOrKeyword(token) || token === tokenType_1.TokenType.OpenBraceToken;
            case ParsingContext.JsxChildren:
                return true;
            case ParsingContext.JSDocFunctionParameters:
            case ParsingContext.JSDocTypeArguments:
            case ParsingContext.JSDocTupleTypes:
                return JSDocParser.isJSDocType();
            case ParsingContext.JSDocRecordMembers:
                return isSimplePropertyName();
        }
        Debug.fail("Non-exhaustive case in 'isListElement'.");
    };
    Parser.prototype.isValidHeritageClauseObjectLiteral = function () {
        Debug.assert(token === tokenType_1.TokenType.OpenBraceToken);
        if (nextToken() === tokenType_1.TokenType.CloseBraceToken) {
            // if we see  "extends {}" then only treat the {} as what we're extending (and not
            // the class body) if we have:
            //
            //      extends {} {
            //      extends {},
            //      extends {} extends
            //      extends {} implements
            var next = nextToken();
            return next === tokenType_1.TokenType.CommaToken || next === tokenType_1.TokenType.OpenBraceToken || next === tokenType_1.TokenType.ExtendsKeyword || next === tokenType_1.TokenType.ImplementsKeyword;
        }
        return true;
    };
    Parser.prototype.nextTokenIsIdentifier = function () {
        nextToken();
        return isIdentifier();
    };
    Parser.prototype.nextTokenIsIdentifierOrKeyword = function () {
        nextToken();
        return tokenIsIdentifierOrKeyword(token);
    };
    Parser.prototype.isHeritageClauseExtendsOrImplementsKeyword = function () {
        if (token === tokenType_1.TokenType.ImplementsKeyword ||
            token === tokenType_1.TokenType.ExtendsKeyword) {
            return lookAhead(nextTokenIsStartOfExpression);
        }
        return false;
    };
    Parser.prototype.nextTokenIsStartOfExpression = function () {
        nextToken();
        return fallowsExpression();
    };
    // True if positioned at a list terminator
    Parser.prototype.isListTerminator = function (kind) {
        if (token === tokenType_1.TokenType.EndOfFileToken) {
            // Being at the end of the file ends all lists.
            return true;
        }
        switch (kind) {
            case ParsingContext.BlockStatements:
            case ParsingContext.SwitchClauses:
            case ParsingContext.TypeMembers:
            case ParsingContext.ClassMembers:
            case ParsingContext.EnumMembers:
            case ParsingContext.ObjectLiteralMembers:
            case ParsingContext.ObjectBindingElements:
            case ParsingContext.ImportOrExportSpecifiers:
                return token === tokenType_1.TokenType.CloseBraceToken;
            case ParsingContext.SwitchClauseStatements:
                return token === tokenType_1.TokenType.CloseBraceToken || token === tokenType_1.TokenType.CaseKeyword || token === tokenType_1.TokenType.DefaultKeyword;
            case ParsingContext.HeritageClauseElement:
                return token === tokenType_1.TokenType.OpenBraceToken || token === tokenType_1.TokenType.ExtendsKeyword || token === tokenType_1.TokenType.ImplementsKeyword;
            case ParsingContext.VariableDeclarations:
                return isVariableDeclaratorListTerminator();
            case ParsingContext.TypeParameters:
                // Tokens other than '>' are here for better error recovery
                return token === tokenType_1.TokenType.GreaterThanToken || token === tokenType_1.TokenType.OpenParenToken || token === tokenType_1.TokenType.OpenBraceToken || token === tokenType_1.TokenType.ExtendsKeyword || token === tokenType_1.TokenType.ImplementsKeyword;
            case ParsingContext.ArgumentExpressions:
                // Tokens other than ')' are here for better error recovery
                return token === tokenType_1.TokenType.CloseParenToken || token === tokenType_1.TokenType.SemicolonToken;
            case ParsingContext.ArrayLiteralMembers:
            case ParsingContext.TupleElementTypes:
            case ParsingContext.ArrayBindingElements:
                return token === tokenType_1.TokenType.CloseBracketToken;
            case ParsingContext.Parameters:
                // Tokens other than ')' and ']' (the latter for index signatures) are here for better error recovery
                return token === tokenType_1.TokenType.CloseParenToken || token === tokenType_1.TokenType.CloseBracketToken /*|| token === TokenType.OpenBraceToken*/;
            case ParsingContext.TypeArguments:
                // Tokens other than '>' are here for better error recovery
                return token === tokenType_1.TokenType.GreaterThanToken || token === tokenType_1.TokenType.OpenParenToken;
            case ParsingContext.HeritageClauses:
                return token === tokenType_1.TokenType.OpenBraceToken || token === tokenType_1.TokenType.CloseBraceToken;
            case ParsingContext.JsxAttributes:
                return token === tokenType_1.TokenType.GreaterThanToken || token === tokenType_1.TokenType.SlashToken;
            case ParsingContext.JsxChildren:
                return token === tokenType_1.TokenType.LessThanToken && lookAhead(nextTokenIsSlash);
            case ParsingContext.JSDocFunctionParameters:
                return token === tokenType_1.TokenType.CloseParenToken || token === tokenType_1.TokenType.ColonToken || token === tokenType_1.TokenType.CloseBraceToken;
            case ParsingContext.JSDocTypeArguments:
                return token === tokenType_1.TokenType.GreaterThanToken || token === tokenType_1.TokenType.CloseBraceToken;
            case ParsingContext.JSDocTupleTypes:
                return token === tokenType_1.TokenType.CloseBracketToken || token === tokenType_1.TokenType.CloseBraceToken;
            case ParsingContext.JSDocRecordMembers:
                return token === tokenType_1.TokenType.CloseBraceToken;
        }
    };
    Parser.prototype.isVariableDeclaratorListTerminator = function () {
        // If we can consume a semicolon (either explicitly, or with ASI), then consider us done
        // with parsing the list of  variable declarators.
        if (autoInsertSemicolon()) {
            return true;
        }
        // in the case where we're parsing the variable declarator of a 'for-in' statement, we
        // are done if we see an 'in' keyword in front of us. Same with for-of
        if (isInOrOfKeyword(token)) {
            return true;
        }
        // ERROR RECOVERY TWEAK:
        // For better error recovery, if we see an '=>' then we just stop immediately.  We've got an
        // arrow private here and it's going to be very unlikely that we'll resynchronize and get
        // another variable declaration.
        if (token === tokenType_1.TokenType.EqualsGreaterThanToken) {
            return true;
        }
        // Keep trying to parse out variable declarators.
        return false;
    };
    // True if positioned at element or terminator of the current list or any enclosing list
    Parser.prototype.isInSomeParsingContext = function () {
        for (var kind = 0; kind < ParsingContext.Count; kind++) {
            if (parsingContext & (1 << kind)) {
                if (isListElement(kind, /*inErrorRecovery*/ true) || isListTerminator(kind)) {
                    return true;
                }
            }
        }
        return false;
    };
    // Parses a list of elements
    Parser.prototype.parseList = function (kind, parseElement) {
        var saveParsingContext = parsingContext;
        parsingContext |= 1 << kind;
        var result = [];
        result.pos = getNodePos();
        while (!isListTerminator(kind)) {
            if (isListElement(kind, /*inErrorRecovery*/ false)) {
                var element = parseListElement(kind, parseElement);
                result.push(element);
                continue;
            }
            if (abortParsingListOrMoveToNextToken(kind)) {
                break;
            }
        }
        result.end = getNodeEnd();
        parsingContext = saveParsingContext;
        return result;
    };
    Parser.prototype.parseListElement = function (parsingContext, parseElement) {
        var node = currentNode(parsingContext);
        if (node) {
            return consumeNode(node);
        }
        return parseElement();
    };
    Parser.prototype.currentNode = function (parsingContext) {
        // If there is an outstanding parse error that we've encountered, but not attached to
        // some node, then we cannot get a node from the old source tree.  This is because we
        // want to mark the next node we encounter as being unusable.
        //
        // Note: This may be too conservative.  Perhaps we could reuse the node and set the bit
        // on it (or its leftmost child) as having the error.  For now though, being conservative
        // is nice and likely won't ever affect perf.
        if (parseErrorBeforeNextFinishedNode) {
            return undefined;
        }
        if (!syntaxCursor) {
            // if we don't have a cursor, we could never return a node from the old tree.
            return undefined;
        }
        var node = syntaxCursor.currentNode(scanner.getStartPos());
        // Can't reuse a missing node.
        if (nodeIsMissing(node)) {
            return undefined;
        }
        // Can't reuse a node that intersected the change range.
        if (node.intersectsChange) {
            return undefined;
        }
        // Can't reuse a node that contains a parse error.  This is necessary so that we
        // produce the same set of errors again.
        if (containsParseError(node)) {
            return undefined;
        }
        // We can only reuse a node if it was parsed under the same strict mode that we're
        // currently in.  i.e. if we originally parsed a node in non-strict mode, but then
        // the user added 'using strict' at the top of the file, then we can't use that node
        // again as the presence of strict mode may cause us to parse the tokens in the file
        // differently.
        //
        // Note: we *can* reuse tokens when the strict mode changes.  That's because tokens
        // are unaffected by strict mode.  It's just the parser will decide what to do with it
        // differently depending on what mode it is in.
        //
        // This also applies to all our other context flags as well.
        var nodeContextFlags = node.flags & NodeFlags.ContextFlags;
        if (nodeContextFlags !== contextFlags) {
            return undefined;
        }
        // Ok, we have a node that looks like it could be reused.  Now verify that it is valid
        // in the current list parsing context that we're currently at.
        if (!canReuseNode(node, parsingContext)) {
            return undefined;
        }
        return node;
    };
    Parser.prototype.consumeNode = function (node) {
        // Move the scanner so it is after the node we just consumed.
        scanner.setTextPos(node.end);
        nextToken();
        return node;
    };
    Parser.prototype.canReuseNode = function (node, parsingContext) {
        switch (parsingContext) {
            case ParsingContext.ClassMembers:
                return isReusableClassMember(node);
            case ParsingContext.SwitchClauses:
                return isReusableSwitchClause(node);
            case ParsingContext.SourceElements:
            case ParsingContext.BlockStatements:
            case ParsingContext.SwitchClauseStatements:
                return isReusableStatement(node);
            case ParsingContext.EnumMembers:
                return isReusableEnumMember(node);
            case ParsingContext.TypeMembers:
                return isReusableTypeMember(node);
            case ParsingContext.VariableDeclarations:
                return isReusableVariableDeclaration(node);
            case ParsingContext.Parameters:
                return isReusableParameter(node);
            // Any other lists we do not care about reusing nodes in.  But feel free to add if
            // you can do so safely.  Danger areas involve nodes that may involve speculative
            // parsing.  If speculative parsing is involved with the node, then the range the
            // parser reached while looking ahead might be in the edited range (see the example
            // in canReuseVariableDeclaratorNode for a good case of this).
            case ParsingContext.HeritageClauses:
            // This would probably be safe to reuse.  There is no speculative parsing with
            // heritage clauses.
            case ParsingContext.TypeParameters:
            // This would probably be safe to reuse.  There is no speculative parsing with
            // type parameters.  Note that that's because type *parameters* only occur in
            // unambiguous *type* contexts.  While type *arguments* occur in very ambiguous
            // *expression* contexts.
            case ParsingContext.TupleElementTypes:
            // This would probably be safe to reuse.  There is no speculative parsing with
            // tuple types.
            // Technically, type argument list types are probably safe to reuse.  While
            // speculative parsing is involved with them (since type argument lists are only
            // produced from speculative parsing a < as a type argument list), we only have
            // the types because speculative parsing succeeded.  Thus, the lookahead never
            // went past the end of the list and rewound.
            case ParsingContext.TypeArguments:
            // Note: these are almost certainly not safe to ever reuse.  Expressions commonly
            // need a large amount of lookahead, and we should not reuse them as they may
            // have actually intersected the edit.
            case ParsingContext.ArgumentExpressions:
            // This is not safe to reuse for the same reason as the 'AssignmentExpression'
            // cases.  i.e. a property assignment may end with an expression, and thus might
            // have lookahead far beyond it's old node.
            case ParsingContext.ObjectLiteralMembers:
            // This is probably not safe to reuse.  There can be speculative parsing with
            // type names in a heritage clause.  There can be generic names in the type
            // name list, and there can be left hand side expressions (which can have type
            // arguments.)
            case ParsingContext.HeritageClauseElement:
            // Perhaps safe to reuse, but it's unlikely we'd see more than a dozen attributes
            // on any given element. Same for children.
            case ParsingContext.JsxAttributes:
            case ParsingContext.JsxChildren:
        }
        return false;
    };
    Parser.prototype.isReusableClassMember = function (node) {
        if (node) {
            switch (node.kind) {
                case tokenType_1.TokenType.Constructor:
                case tokenType_1.TokenType.IndexSignature:
                case tokenType_1.TokenType.GetAccessor:
                case tokenType_1.TokenType.SetAccessor:
                case tokenType_1.TokenType.PropertyDeclaration:
                case tokenType_1.TokenType.SemicolonClassElement:
                    return true;
                case tokenType_1.TokenType.MethodDeclaration:
                    // Method declarations are not necessarily reusable.  An object-literal
                    // may have a method calls "constructor(...)" and we must reparse that
                    // into an actual .ConstructorDeclaration.
                    var methodDeclaration = node;
                    var nameIsConstructor = methodDeclaration.name.kind === tokenType_1.TokenType.Identifier &&
                        methodDeclaration.name.originalKeywordKind === tokenType_1.TokenType.ConstructorKeyword;
                    return !nameIsConstructor;
            }
        }
        return false;
    };
    Parser.prototype.isReusableSwitchClause = function (node) {
        if (node) {
            switch (node.kind) {
                case tokenType_1.TokenType.CaseClause:
                case tokenType_1.TokenType.DefaultClause:
                    return true;
            }
        }
        return false;
    };
    Parser.prototype.isReusableStatement = function (node) {
        if (node) {
            switch (node.kind) {
                case tokenType_1.TokenType.FunctionDeclaration:
                case tokenType_1.TokenType.VariableStatement:
                case tokenType_1.TokenType.Block:
                case tokenType_1.TokenType.IfStatement:
                case tokenType_1.TokenType.ExpressionStatement:
                case tokenType_1.TokenType.ThrowStatement:
                case tokenType_1.TokenType.ReturnStatement:
                case tokenType_1.TokenType.SwitchStatement:
                case tokenType_1.TokenType.BreakStatement:
                case tokenType_1.TokenType.ContinueStatement:
                case tokenType_1.TokenType.ForInStatement:
                case tokenType_1.TokenType.ForOfStatement:
                case tokenType_1.TokenType.ForStatement:
                case tokenType_1.TokenType.WhileStatement:
                case tokenType_1.TokenType.WithStatement:
                case tokenType_1.TokenType.EmptyStatement:
                case tokenType_1.TokenType.TryStatement:
                case tokenType_1.TokenType.LabeledStatement:
                case tokenType_1.TokenType.DoStatement:
                case tokenType_1.TokenType.DebuggerStatement:
                case tokenType_1.TokenType.ImportDeclaration:
                case tokenType_1.TokenType.ImportEqualsDeclaration:
                case tokenType_1.TokenType.ExportDeclaration:
                case tokenType_1.TokenType.ExportAssignment:
                case tokenType_1.TokenType.ModuleDeclaration:
                case tokenType_1.TokenType.ClassDeclaration:
                case tokenType_1.TokenType.InterfaceDeclaration:
                case tokenType_1.TokenType.EnumDeclaration:
                case tokenType_1.TokenType.TypeAliasDeclaration:
                    return true;
            }
        }
        return false;
    };
    Parser.prototype.isReusableEnumMember = function (node) {
        return node.kind === tokenType_1.TokenType.EnumMember;
    };
    Parser.prototype.isReusableTypeMember = function (node) {
        if (node) {
            switch (node.kind) {
                case tokenType_1.TokenType.ConstructSignature:
                case tokenType_1.TokenType.MethodSignature:
                case tokenType_1.TokenType.IndexSignature:
                case tokenType_1.TokenType.PropertySignature:
                case tokenType_1.TokenType.CallSignature:
                    return true;
            }
        }
        return false;
    };
    Parser.prototype.isReusableVariableDeclaration = function (node) {
        if (node.kind !== tokenType_1.TokenType.VariableDeclaration) {
            return false;
        }
        // Very subtle incremental parsing bug.  Consider the following code:
        //
        //      let v = new List < A, B
        //
        // This is actually legal code.  It's a list of variable declarators "v = new List<A"
        // on one side and "B" on the other. If you then change that to:
        //
        //      let v = new List < A, B >()
        //
        // then we have a problem.  "v = new List<A" doesn't intersect the change range, so we
        // start reparsing at "B" and we completely fail to handle this properly.
        //
        // In order to prevent this, we do not allow a variable declarator to be reused if it
        // has an initializer.
        var variableDeclarator = node;
        return variableDeclarator.initializer === undefined;
    };
    Parser.prototype.isReusableParameter = function (node) {
        if (node.kind !== tokenType_1.TokenType.Parameter) {
            return false;
        }
        // See the comment in isReusableVariableDeclaration for why we do this.
        var parameter = node;
        return parameter.initializer === undefined;
    };
    // Returns true if we should abort parsing.
    Parser.prototype.abortParsingListOrMoveToNextToken = function (kind) {
        parseErrorAtCurrentToken(parsingContextErrors(kind));
        if (isInSomeParsingContext()) {
            return true;
        }
        nextToken();
        return false;
    };
    Parser.prototype.parsingContextErrors = function (context) {
        switch (context) {
            case ParsingContext.SourceElements: return Diagnostics.Declaration_or_statement_expected;
            case ParsingContext.BlockStatements: return Diagnostics.Declaration_or_statement_expected;
            case ParsingContext.SwitchClauses: return Diagnostics.case_or_default_expected;
            case ParsingContext.SwitchClauseStatements: return Diagnostics.Statement_expected;
            case ParsingContext.TypeMembers: return Diagnostics.Property_or_signature_expected;
            case ParsingContext.ClassMembers: return Diagnostics.Unexpected_token_A_constructor_method_accessor_or_property_was_expected;
            case ParsingContext.EnumMembers: return Diagnostics.Enum_member_expected;
            case ParsingContext.HeritageClauseElement: return Diagnostics.Expression_expected;
            case ParsingContext.VariableDeclarations: return Diagnostics.Variable_declaration_expected;
            case ParsingContext.ObjectBindingElements: return Diagnostics.Property_destructuring_pattern_expected;
            case ParsingContext.ArrayBindingElements: return Diagnostics.Array_element_destructuring_pattern_expected;
            case ParsingContext.ArgumentExpressions: return Diagnostics.Argument_expression_expected;
            case ParsingContext.ObjectLiteralMembers: return Diagnostics.Property_assignment_expected;
            case ParsingContext.ArrayLiteralMembers: return Diagnostics.Expression_or_comma_expected;
            case ParsingContext.Parameters: return Diagnostics.Parameter_declaration_expected;
            case ParsingContext.TypeParameters: return Diagnostics.Type_parameter_declaration_expected;
            case ParsingContext.TypeArguments: return Diagnostics.Type_argument_expected;
            case ParsingContext.TupleElementTypes: return Diagnostics.Type_expected;
            case ParsingContext.HeritageClauses: return Diagnostics.Unexpected_token_expected;
            case ParsingContext.ImportOrExportSpecifiers: return Diagnostics.Identifier_expected;
            case ParsingContext.JsxAttributes: return Diagnostics.Identifier_expected;
            case ParsingContext.JsxChildren: return Diagnostics.Identifier_expected;
            case ParsingContext.JSDocFunctionParameters: return Diagnostics.Parameter_declaration_expected;
            case ParsingContext.JSDocTypeArguments: return Diagnostics.Type_argument_expected;
            case ParsingContext.JSDocTupleTypes: return Diagnostics.Type_expected;
            case ParsingContext.JSDocRecordMembers: return Diagnostics.Property_assignment_expected;
        }
    };
    ;
    // Parses a comma-delimited list of elements
    Parser.prototype.parseDelimitedList = function (kind, parseElement, considerSemicolonAsDelimiter) {
        var saveParsingContext = parsingContext;
        parsingContext |= 1 << kind;
        var result = [];
        result.pos = getNodePos();
        var commaStart = -1; // Meaning the previous token was not a comma
        while (true) {
            if (isListElement(kind, /*inErrorRecovery*/ false)) {
                result.push(parseListElement(kind, parseElement));
                commaStart = scanner.getTokenPos();
                if (parseOptional(tokenType_1.TokenType.CommaToken)) {
                    continue;
                }
                commaStart = -1; // Back to the state where the last token was not a comma
                if (isListTerminator(kind)) {
                    break;
                }
                // We didn't get a comma, and the list wasn't terminated, explicitly parse
                // out a comma so we give a good error message.
                this.parseExpected(tokenType_1.TokenType.CommaToken);
                // If the token was a semicolon, and the caller allows that, then skip it and
                // continue.  This ensures we get back on track and don't result in tons of
                // parse errors.  For example, this can happen when people do things like use
                // a semicolon to delimit object literal members.   Note: we'll have already
                // reported an error when we called this.parseExpected above.
                if (considerSemicolonAsDelimiter && token === tokenType_1.TokenType.SemicolonToken && !scanner.hasPrecedingLineBreak()) {
                    nextToken();
                }
                continue;
            }
            if (isListTerminator(kind)) {
                break;
            }
            if (abortParsingListOrMoveToNextToken(kind)) {
                break;
            }
        }
        // Recording the trailing comma is deliberately done after the previous
        // loop, and not just if we see a list terminator. This is because the list
        // may have ended incorrectly, but it is still important to know if there
        // was a trailing comma.
        // Check if the last token was a comma.
        if (commaStart >= 0) {
            // Always preserve a trailing comma by marking it on the NodeArray
            result.hasTrailingComma = true;
        }
        result.end = getNodeEnd();
        parsingContext = saveParsingContext;
        return result;
    };
    Parser.prototype.createMissingList = function () {
        var pos = getNodePos();
        var result = [];
        result.pos = pos;
        result.end = pos;
        return result;
    };
    Parser.prototype.parseBracketedList = function (kind, parseElement, open, close) {
        if (this.parseExpected(open)) {
            var result = parseDelimitedList(kind, parseElement);
            this.parseExpected(close);
            return result;
        }
        return createMissingList();
    };
    // The allowReservedWords parameter controls whether reserved words are permitted after the first dot
    Parser.prototype.parseEntityName = function (allowReservedWords, diagnosticMessage) {
        var entity = parseIdentifier(diagnosticMessage);
        while (parseOptional(tokenType_1.TokenType.DotToken)) {
            var node = createNode(tokenType_1.TokenType.QualifiedName, entity.pos); // !!!
            node.left = entity;
            node.right = parseRightSideOfDot(allowReservedWords);
            entity = finishNode(node);
        }
        return entity;
    };
    Parser.prototype.parseRightSideOfDot = function (allowIdentifierNames) {
        // Technically a keyword is valid here as all identifiers and keywords are identifier names.
        // However, often we'll encounter this in error situations when the identifier or keyword
        // is actually starting another valid construct.
        //
        // So, we check for the following specific case:
        //
        //      name.
        //      identifierOrKeyword identifierNameOrKeyword
        //
        // Note: the newlines are important here.  For example, if that above code
        // were rewritten into:
        //
        //      name.identifierOrKeyword
        //      identifierNameOrKeyword
        //
        // Then we would consider it valid.  That's because ASI would take effect and
        // the code would be implicitly: "name.identifierOrKeyword; identifierNameOrKeyword".
        // In the first case though, ASI will not take effect because there is not a
        // line terminator after the identifier or keyword.
        if (scanner.hasPrecedingLineBreak() && tokenIsIdentifierOrKeyword(token)) {
            var matchesPattern = lookAhead(nextTokenIsIdentifierOrKeywordOnSameLine);
            if (matchesPattern) {
                // Report that we need an identifier.  However, report it right after the dot,
                // and not on the next token.  This is because the next token might actually
                // be an identifier and the error would be quite confusing.
                return createMissingNode(tokenType_1.TokenType.Identifier, /*reportAtCurrentPosition*/ true, Diagnostics.Identifier_expected);
            }
        }
        return allowIdentifierNames ? parseIdentifierName() : parseIdentifier();
    };
    Parser.prototype.parseTemplateExpression = function () {
        var template = createNode(tokenType_1.TokenType.TemplateExpression);
        template.head = parseTemplateLiteralFragment();
        Debug.assert(template.head.kind === tokenType_1.TokenType.TemplateHead, "Template head has wrong token kind");
        var templateSpans = [];
        templateSpans.pos = getNodePos();
        do {
            templateSpans.push(parseTemplateSpan());
        } while (lastOrUndefined(templateSpans).literal.kind === tokenType_1.TokenType.TemplateMiddle);
        templateSpans.end = getNodeEnd();
        template.templateSpans = templateSpans;
        return finishNode(template);
    };
    Parser.prototype.parseTemplateSpan = function () {
        var span = createNode(tokenType_1.TokenType.TemplateSpan);
        span.expression = allowInAnd(parseExpression);
        var literal;
        if (token === tokenType_1.TokenType.CloseBraceToken) {
            reScanTemplateToken();
            literal = parseTemplateLiteralFragment();
        }
        else {
            literal = this.parseExpectedToken(tokenType_1.TokenType.TemplateTail, /*reportAtCurrentPosition*/ false, Diagnostics._0_expected, tokenType_1.tokenToString(tokenType_1.TokenType.CloseBraceToken));
        }
        span.literal = literal;
        return finishNode(span);
    };
    Parser.prototype.parseStringLiteralTypeNode = function () {
        return parseLiteralLikeNode(tokenType_1.TokenType.StringLiteralType, /*internName*/ true);
    };
    Parser.prototype.parseLiteralNode = function (internName) {
        return parseLiteralLikeNode(token, internName);
    };
    Parser.prototype.parseTemplateLiteralFragment = function () {
        return parseLiteralLikeNode(token, /*internName*/ false);
    };
    Parser.prototype.parseLiteralLikeNode = function (kind, internName) {
        var node = createNode(kind);
        var text = scanner.getTokenValue();
        node.text = internName ? internIdentifier(text) : text;
        if (scanner.hasExtendedUnicodeEscape()) {
            node.hasExtendedUnicodeEscape = true;
        }
        if (scanner.isUnterminated()) {
            node.isUnterminated = true;
        }
        var tokenPos = scanner.getTokenPos();
        nextToken();
        finishNode(node);
        // Octal literals are not allowed in strict mode or ES5
        // Note that theoretically the following condition would hold true literals like 009,
        // which is not octal.But because of how the scanner separates the tokens, we would
        // never get a token like this. Instead, we would get 00 and 9 as two separate tokens.
        // We also do not need to check for negatives because any prefix operator would be part of a
        // parent unary expression.
        if (node.kind === tokenType_1.TokenType.NumericLiteral
            && sourceText.charCodeAt(tokenPos) === CharacterCodes._0
            && isOctalDigit(sourceText.charCodeAt(tokenPos + 1))) {
            node.isOctalLiteral = true;
        }
        return node;
    };
    // TYPES
    Parser.prototype.parseTypeReference = function () {
        var typeName = parseEntityName(/*allowReservedWords*/ false, Diagnostics.Type_expected);
        var node = createNode(tokenType_1.TokenType.TypeReference, typeName.pos);
        node.typeName = typeName;
        if (!scanner.hasPrecedingLineBreak() && token === tokenType_1.TokenType.LessThanToken) {
            node.typeArguments = parseBracketedList(ParsingContext.TypeArguments, parseType, tokenType_1.TokenType.LessThanToken, tokenType_1.TokenType.GreaterThanToken);
        }
        return finishNode(node);
    };
    Parser.prototype.parseThisTypePredicate = function (lhs) {
        nextToken();
        var node = createNode(tokenType_1.TokenType.TypePredicate, lhs.pos);
        node.parameterName = lhs;
        node.type = parseType();
        return finishNode(node);
    };
    Parser.prototype.parseThisTypeNode = function () {
        var node = createNode(tokenType_1.TokenType.ThisType);
        nextToken();
        return finishNode(node);
    };
    Parser.prototype.parseTypeQuery = function () {
        var node = createNode(tokenType_1.TokenType.TypeQuery);
        this.parseExpected(tokenType_1.TokenType.TypeOfKeyword);
        node.exprName = parseEntityName(/*allowReservedWords*/ true);
        return finishNode(node);
    };
    Parser.prototype.parseTypeParameter = function () {
        var node = createNode(tokenType_1.TokenType.TypeParameter);
        node.name = parseIdentifier();
        if (parseOptional(tokenType_1.TokenType.ExtendsKeyword)) {
            // It's not uncommon for people to write improper constraints to a generic.  If the
            // user writes a constraint that is an expression and not an actual type, then parse
            // it out as an expression (so we can recover well), but report that a type is needed
            // instead.
            if (isStartOfType() || !fallowsExpression()) {
                node.constraint = parseType();
            }
            else {
                // It was not a type, and it looked like an expression.  Parse out an expression
                // here so we recover well.  Note: it is important that we call parseUnaryExpression
                // and not parseExpression here.  If the user has:
                //
                //      <T extends "">
                //
                // We do *not* want to consume the  >  as we're consuming the expression for "".
                node.expression = parseUnaryExpressionOrHigher();
            }
        }
        return finishNode(node);
    };
    Parser.prototype.parseTypeParameters = function () {
        if (token === tokenType_1.TokenType.LessThanToken) {
            return parseBracketedList(ParsingContext.TypeParameters, parseTypeParameter, tokenType_1.TokenType.LessThanToken, tokenType_1.TokenType.GreaterThanToken);
        }
    };
    Parser.prototype.parseParameterType = function () {
        if (parseOptional(tokenType_1.TokenType.ColonToken)) {
            return parseType();
        }
        return undefined;
    };
    Parser.prototype.isStartOfParameter = function () {
        return token === tokenType_1.TokenType.DotDotDotToken || isIdentifierOrPattern() || isModifierKind(token) || token === tokenType_1.TokenType.AtToken || token === tokenType_1.TokenType.ThisKeyword;
    };
    Parser.prototype.setModifiers = function (node, modifiers) {
        if (modifiers) {
            node.flags |= modifiers.flags;
            node.modifiers = modifiers;
        }
    };
    Parser.prototype.parseParameter = function () {
        var node = createNode(tokenType_1.TokenType.Parameter);
        if (token === tokenType_1.TokenType.ThisKeyword) {
            node.name = createIdentifier(/*isIdentifier*/ true, undefined);
            node.type = parseParameterType();
            return finishNode(node);
        }
        node.decorators = parseDecorators();
        setModifiers(node, parseModifiers());
        node.dotDotDotToken = parseOptionalToken(tokenType_1.TokenType.DotDotDotToken);
        // FormalParameter [Yield,Await]:
        //      BindingElement[?Yield,?Await]
        node.name = parseIdentifierOrPattern();
        if (getFullWidth(node.name) === 0 && node.flags === 0 && isModifierKind(token)) {
            // in cases like
            // 'use strict'
            // private foo(static)
            // isParameter('static') === true, because of isModifier('static')
            // however 'static' is not a legal identifier in a strict mode.
            // so result of this private will be ParameterDeclaration (flags = 0, name = missing, type = undefined, initializer = undefined)
            // and current token will not change => parsing of the enclosing parameter list will last till the end of time (or OOM)
            // to avoid this we'll advance cursor to the next token.
            nextToken();
        }
        node.questionToken = parseOptionalToken(tokenType_1.TokenType.QuestionToken);
        node.type = parseParameterType();
        node.initializer = parseBindingElementInitializer(/*inParameter*/ true);
        // Do not check for initializers in an ambient context for parameters. This is not
        // a grammar error because the grammar allows arbitrary call signatures in
        // an ambient context.
        // It is actually not necessary for this to be an error at all. The reason is that
        // private/constructor implementations are syntactically disallowed in ambient
        // contexts. In addition, parameter initializers are semantically disallowed in
        // overload signatures. So parameter initializers are transitively disallowed in
        // ambient contexts.
        return addJSDocComment(finishNode(node));
    };
    Parser.prototype.parseBindingElementInitializer = function (inParameter) {
        return inParameter ? parseParameterInitializer() : parseNonParameterInitializer();
    };
    Parser.prototype.parseParameterInitializer = function () {
        return parseInitializer(/*inParameter*/ true);
    };
    Parser.prototype.fillSignature = function (returnToken, yieldContext, awaitContext, requireCompleteParameterList, signature) {
        var returnTokenRequired = returnToken === tokenType_1.TokenType.EqualsGreaterThanToken;
        signature.typeParameters = parseTypeParameters();
        signature.parameters = parseParameterList(yieldContext, awaitContext, requireCompleteParameterList);
        if (returnTokenRequired) {
            this.parseExpected(returnToken);
            signature.type = parseTypeOrTypePredicate();
        }
        else if (parseOptional(returnToken)) {
            signature.type = parseTypeOrTypePredicate();
        }
    };
    Parser.prototype.parseParameterList = function (yieldContext, awaitContext, requireCompleteParameterList) {
        // FormalParameters [Yield,Await]: (modified)
        //      [empty]
        //      FormalParameterList[?Yield,Await]
        //
        // FormalParameter[Yield,Await]: (modified)
        //      BindingElement[?Yield,Await]
        //
        // BindingElement [Yield,Await]: (modified)
        //      SingleNameBinding[?Yield,?Await]
        //      BindingPattern[?Yield,?Await]Initializer [In, ?Yield,?Await] opt
        //
        // SingleNameBinding [Yield,Await]:
        //      BindingIdentifier[?Yield,?Await]Initializer [In, ?Yield,?Await] opt
        if (this.parseExpected(tokenType_1.TokenType.OpenParenToken)) {
            var savedYieldContext = inYieldContext();
            var savedAwaitContext = inAwaitContext();
            setYieldContext(yieldContext);
            setAwaitContext(awaitContext);
            var result = parseDelimitedList(ParsingContext.Parameters, parseParameter);
            setYieldContext(savedYieldContext);
            setAwaitContext(savedAwaitContext);
            if (!this.parseExpected(tokenType_1.TokenType.CloseParenToken) && requireCompleteParameterList) {
                // Caller insisted that we had to end with a )   We didn't.  So just return
                // undefined here.
                return undefined;
            }
            return result;
        }
        // We didn't even have an open paren.  If the caller requires a complete parameter list,
        // we definitely can't provide that.  However, if they're ok with an incomplete one,
        // then just return an empty set of parameters.
        return requireCompleteParameterList ? undefined : createMissingList();
    };
    Parser.prototype.parseTypeMemberSemicolon = function () {
        // We allow type members to be separated by commas or (possibly ASI) semicolons.
        // First check if it was a comma.  If so, we're done with the member.
        if (parseOptional(tokenType_1.TokenType.CommaToken)) {
            return;
        }
        // Didn't have a comma.  We must have a (possible ASI) semicolon.
        parseSemicolon();
    };
    Parser.prototype.parseSignatureMember = function (kind) {
        var node = createNode(kind);
        if (kind === tokenType_1.TokenType.ConstructSignature) {
            this.parseExpected(tokenType_1.TokenType.NewKeyword);
        }
        fillSignature(tokenType_1.TokenType.ColonToken, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
        parseTypeMemberSemicolon();
        return finishNode(node);
    };
    Parser.prototype.isIndexSignature = function () {
        if (token !== tokenType_1.TokenType.OpenBracketToken) {
            return false;
        }
        return lookAhead(isUnambiguouslyIndexSignature);
    };
    Parser.prototype.isUnambiguouslyIndexSignature = function () {
        // The only allowed sequence is:
        //
        //   [id:
        //
        // However, for error recovery, we also check the following cases:
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
        nextToken();
        if (token === tokenType_1.TokenType.DotDotDotToken || token === tokenType_1.TokenType.CloseBracketToken) {
            return true;
        }
        if (isModifierKind(token)) {
            nextToken();
            if (isIdentifier()) {
                return true;
            }
        }
        else if (!isIdentifier()) {
            return false;
        }
        else {
            // Skip the identifier
            nextToken();
        }
        // A colon signifies a well formed indexer
        // A comma should be a badly formed indexer because comma expressions are not allowed
        // in computed properties.
        if (token === tokenType_1.TokenType.ColonToken || token === tokenType_1.TokenType.CommaToken) {
            return true;
        }
        // Question mark could be an indexer with an optional property,
        // or it could be a conditional expression in a computed property.
        if (token !== tokenType_1.TokenType.QuestionToken) {
            return false;
        }
        // If any of the following tokens are after the question mark, it cannot
        // be a conditional expression, so treat it as an indexer.
        nextToken();
        return token === tokenType_1.TokenType.ColonToken || token === tokenType_1.TokenType.CommaToken || token === tokenType_1.TokenType.CloseBracketToken;
    };
    Parser.prototype.parseIndexSignatureDeclaration = function (fullStart, decorators, modifiers) {
        var node = createNode(tokenType_1.TokenType.IndexSignature, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        node.parameters = parseBracketedList(ParsingContext.Parameters, parseParameter, tokenType_1.TokenType.OpenBracketToken, tokenType_1.TokenType.CloseBracketToken);
        node.type = parseTypeAnnotation();
        parseTypeMemberSemicolon();
        return finishNode(node);
    };
    Parser.prototype.parsePropertyOrMethodSignature = function (fullStart, modifiers) {
        var name = parsePropertyName();
        var questionToken = parseOptionalToken(tokenType_1.TokenType.QuestionToken);
        if (token === tokenType_1.TokenType.OpenParenToken || token === tokenType_1.TokenType.LessThanToken) {
            var method = createNode(tokenType_1.TokenType.MethodSignature, fullStart);
            setModifiers(method, modifiers);
            method.name = name;
            method.questionToken = questionToken;
            // Method signatures don't exist in expression contexts.  So they have neither
            // [Yield] nor [Await]
            fillSignature(tokenType_1.TokenType.ColonToken, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, method);
            parseTypeMemberSemicolon();
            return finishNode(method);
        }
        else {
            var property = createNode(tokenType_1.TokenType.PropertySignature, fullStart);
            setModifiers(property, modifiers);
            property.name = name;
            property.questionToken = questionToken;
            property.type = parseTypeAnnotation();
            if (token === tokenType_1.TokenType.EqualsToken) {
                // Although type literal properties cannot not have initializers, we attempt
                // to parse an initializer so we can report in the checker that an interface
                // property or type literal property cannot have an initializer.
                property.initializer = parseNonParameterInitializer();
            }
            parseTypeMemberSemicolon();
            return finishNode(property);
        }
    };
    Parser.prototype.isTypeMemberStart = function () {
        var idToken;
        // Return true if we have the start of a signature member
        if (token === tokenType_1.TokenType.OpenParenToken || token === tokenType_1.TokenType.LessThanToken) {
            return true;
        }
        // Eat up all modifiers, but hold on to the last one in case it is actually an identifier
        while (isModifierKind(token)) {
            idToken = token;
            nextToken();
        }
        // Index signatures and computed property names are type members
        if (token === tokenType_1.TokenType.OpenBracketToken) {
            return true;
        }
        // Try to get the first property-like token following all modifiers
        if (isLiteralPropertyName()) {
            idToken = token;
            nextToken();
        }
        // If we were able to get any potential identifier, check that it is
        // the start of a member declaration
        if (idToken) {
            return token === tokenType_1.TokenType.OpenParenToken ||
                token === tokenType_1.TokenType.LessThanToken ||
                token === tokenType_1.TokenType.QuestionToken ||
                token === tokenType_1.TokenType.ColonToken ||
                autoInsertSemicolon();
        }
        return false;
    };
    Parser.prototype.parseTypeMember = function () {
        if (token === tokenType_1.TokenType.OpenParenToken || token === tokenType_1.TokenType.LessThanToken) {
            return parseSignatureMember(tokenType_1.TokenType.CallSignature);
        }
        if (token === tokenType_1.TokenType.NewKeyword && lookAhead(isStartOfConstructSignature)) {
            return parseSignatureMember(tokenType_1.TokenType.ConstructSignature);
        }
        var fullStart = getNodePos();
        var modifiers = parseModifiers();
        if (isIndexSignature()) {
            return parseIndexSignatureDeclaration(fullStart, /*decorators*/ undefined, modifiers);
        }
        return parsePropertyOrMethodSignature(fullStart, modifiers);
    };
    Parser.prototype.isStartOfConstructSignature = function () {
        nextToken();
        return token === tokenType_1.TokenType.OpenParenToken || token === tokenType_1.TokenType.LessThanToken;
    };
    Parser.prototype.parseTypeLiteral = function () {
        var node = createNode(tokenType_1.TokenType.TypeLiteral);
        node.members = parseObjectTypeMembers();
        return finishNode(node);
    };
    Parser.prototype.parseObjectTypeMembers = function () {
        var members;
        if (this.parseExpected(tokenType_1.TokenType.OpenBraceToken)) {
            members = parseList(ParsingContext.TypeMembers, parseTypeMember);
            this.parseExpected(tokenType_1.TokenType.CloseBraceToken);
        }
        else {
            members = createMissingList();
        }
        return members;
    };
    Parser.prototype.parseTupleType = function () {
        var node = createNode(tokenType_1.TokenType.TupleType);
        node.elementTypes = parseBracketedList(ParsingContext.TupleElementTypes, parseType, tokenType_1.TokenType.OpenBracketToken, tokenType_1.TokenType.CloseBracketToken);
        return finishNode(node);
    };
    Parser.prototype.parseParenthesizedType = function () {
        var node = createNode(tokenType_1.TokenType.ParenthesizedType);
        this.parseExpected(tokenType_1.TokenType.OpenParenToken);
        node.type = parseType();
        this.parseExpected(tokenType_1.TokenType.CloseParenToken);
        return finishNode(node);
    };
    Parser.prototype.parseFunctionOrConstructorType = function (kind) {
        var node = createNode(kind);
        if (kind === tokenType_1.TokenType.ConstructorType) {
            this.parseExpected(tokenType_1.TokenType.NewKeyword);
        }
        fillSignature(tokenType_1.TokenType.EqualsGreaterThanToken, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
        return finishNode(node);
    };
    Parser.prototype.parseKeywordAndNoDot = function () {
        var node = parseTokenNode();
        return token === tokenType_1.TokenType.DotToken ? undefined : node;
    };
    Parser.prototype.parseNonArrayType = function () {
        switch (token) {
            case tokenType_1.TokenType.AnyKeyword:
            case tokenType_1.TokenType.StringKeyword:
            case tokenType_1.TokenType.NumberKeyword:
            case tokenType_1.TokenType.BooleanKeyword:
            case tokenType_1.TokenType.SymbolKeyword:
            case tokenType_1.TokenType.UndefinedKeyword:
            case tokenType_1.TokenType.NeverKeyword:
                // If these are followed by a dot, then parse these out as a dotted type reference instead.
                var node = tryParse(parseKeywordAndNoDot);
                return node || parseTypeReference();
            case tokenType_1.TokenType.StringLiteral:
                return parseStringLiteralTypeNode();
            case tokenType_1.TokenType.VoidKeyword:
            case tokenType_1.TokenType.NullKeyword:
                return parseTokenNode();
            case tokenType_1.TokenType.ThisKeyword: {
                var thisKeyword = parseThisTypeNode();
                if (token === tokenType_1.TokenType.IsKeyword && !scanner.hasPrecedingLineBreak()) {
                    return parseThisTypePredicate(thisKeyword);
                }
                else {
                    return thisKeyword;
                }
            }
            case tokenType_1.TokenType.TypeOfKeyword:
                return parseTypeQuery();
            case tokenType_1.TokenType.OpenBraceToken:
                return parseTypeLiteral();
            case tokenType_1.TokenType.OpenBracketToken:
                return parseTupleType();
            case tokenType_1.TokenType.OpenParenToken:
                return parseParenthesizedType();
            default:
                return parseTypeReference();
        }
    };
    Parser.prototype.isStartOfType = function () {
        switch (token) {
            case tokenType_1.TokenType.AnyKeyword:
            case tokenType_1.TokenType.StringKeyword:
            case tokenType_1.TokenType.NumberKeyword:
            case tokenType_1.TokenType.BooleanKeyword:
            case tokenType_1.TokenType.SymbolKeyword:
            case tokenType_1.TokenType.VoidKeyword:
            case tokenType_1.TokenType.UndefinedKeyword:
            case tokenType_1.TokenType.NullKeyword:
            case tokenType_1.TokenType.ThisKeyword:
            case tokenType_1.TokenType.TypeOfKeyword:
            case tokenType_1.TokenType.NeverKeyword:
            case tokenType_1.TokenType.OpenBraceToken:
            case tokenType_1.TokenType.OpenBracketToken:
            case tokenType_1.TokenType.LessThanToken:
            case tokenType_1.TokenType.NewKeyword:
            case tokenType_1.TokenType.StringLiteral:
                return true;
            case tokenType_1.TokenType.OpenParenToken:
                // Only consider '(' the start of a type if followed by ')', '...', an identifier, a modifier,
                // or something that starts a type. We don't want to consider things like '(1)' a type.
                return lookAhead(isStartOfParenthesizedOrFunctionType);
            default:
                return isIdentifier();
        }
    };
    Parser.prototype.isStartOfParenthesizedOrFunctionType = function () {
        nextToken();
        return token === tokenType_1.TokenType.CloseParenToken || isStartOfParameter() || isStartOfType();
    };
    Parser.prototype.parseArrayTypeOrHigher = function () {
        var type = parseNonArrayType();
        while (!scanner.hasPrecedingLineBreak() && parseOptional(tokenType_1.TokenType.OpenBracketToken)) {
            this.parseExpected(tokenType_1.TokenType.CloseBracketToken);
            var node = createNode(tokenType_1.TokenType.ArrayType, type.pos);
            node.elementType = type;
            type = finishNode(node);
        }
        return type;
    };
    Parser.prototype.parseUnionOrIntersectionType = function (kind, parseConstituentType, operator) {
        var type = parseConstituentType();
        if (token === operator) {
            var types = [type];
            types.pos = type.pos;
            while (parseOptional(operator)) {
                types.push(parseConstituentType());
            }
            types.end = getNodeEnd();
            var node = createNode(kind, type.pos);
            node.types = types;
            type = finishNode(node);
        }
        return type;
    };
    Parser.prototype.parseIntersectionTypeOrHigher = function () {
        return parseUnionOrIntersectionType(tokenType_1.TokenType.IntersectionType, parseArrayTypeOrHigher, tokenType_1.TokenType.AmpersandToken);
    };
    Parser.prototype.parseUnionTypeOrHigher = function () {
        return parseUnionOrIntersectionType(tokenType_1.TokenType.UnionType, parseIntersectionTypeOrHigher, tokenType_1.TokenType.BarToken);
    };
    Parser.prototype.isStartOfFunctionType = function () {
        if (token === tokenType_1.TokenType.LessThanToken) {
            return true;
        }
        return token === tokenType_1.TokenType.OpenParenToken && lookAhead(isUnambiguouslyStartOfFunctionType);
    };
    Parser.prototype.skipParameterStart = function () {
        if (isModifierKind(token)) {
            // Skip modifiers
            parseModifiers();
        }
        if (isIdentifier() || token === tokenType_1.TokenType.ThisKeyword) {
            nextToken();
            return true;
        }
        if (token === tokenType_1.TokenType.OpenBracketToken || token === tokenType_1.TokenType.OpenBraceToken) {
            // Return true if we can parse an array or object binding pattern with no errors
            var previousErrorCount = parseDiagnostics.length;
            parseIdentifierOrPattern();
            return previousErrorCount === parseDiagnostics.length;
        }
        return false;
    };
    Parser.prototype.isUnambiguouslyStartOfFunctionType = function () {
        nextToken();
        if (token === tokenType_1.TokenType.CloseParenToken || token === tokenType_1.TokenType.DotDotDotToken) {
            // ( )
            // ( ...
            return true;
        }
        if (skipParameterStart()) {
            // We successfully skipped modifiers (if any) and an identifier or binding pattern,
            // now see if we have something that indicates a parameter declaration
            if (token === tokenType_1.TokenType.ColonToken || token === tokenType_1.TokenType.CommaToken ||
                token === tokenType_1.TokenType.QuestionToken || token === tokenType_1.TokenType.EqualsToken) {
                // ( xxx :
                // ( xxx ,
                // ( xxx ?
                // ( xxx =
                return true;
            }
            if (token === tokenType_1.TokenType.CloseParenToken) {
                nextToken();
                if (token === tokenType_1.TokenType.EqualsGreaterThanToken) {
                    // ( xxx ) =>
                    return true;
                }
            }
        }
        return false;
    };
    Parser.prototype.parseTypeOrTypePredicate = function () {
        var typePredicateVariable = isIdentifier() && tryParse(parseTypePredicatePrefix);
        var type = parseType();
        if (typePredicateVariable) {
            var node = createNode(tokenType_1.TokenType.TypePredicate, typePredicateVariable.pos);
            node.parameterName = typePredicateVariable;
            node.type = type;
            return finishNode(node);
        }
        else {
            return type;
        }
    };
    Parser.prototype.parseTypePredicatePrefix = function () {
        var id = parseIdentifier();
        if (token === tokenType_1.TokenType.IsKeyword && !scanner.hasPrecedingLineBreak()) {
            nextToken();
            return id;
        }
    };
    Parser.prototype.parseType = function () {
        // The rules about 'yield' only apply to actual code/expression contexts.  They don't
        // apply to 'type' contexts.  So we disable these parameters here before moving on.
        return doOutsideOfContext(NodeFlags.TypeExcludesFlags, parseTypeWorker);
    };
    Parser.prototype.parseTypeWorker = function () {
        if (isStartOfFunctionType()) {
            return parseFunctionOrConstructorType(tokenType_1.TokenType.FunctionType);
        }
        if (token === tokenType_1.TokenType.NewKeyword) {
            return parseFunctionOrConstructorType(tokenType_1.TokenType.ConstructorType);
        }
        return parseUnionTypeOrHigher();
    };
    Parser.prototype.parseTypeAnnotation = function () {
        return parseOptional(tokenType_1.TokenType.ColonToken) ? parseType() : undefined;
    };
    // EXPRESSIONS
    Parser.prototype.isStartOfLeftHandSideExpression = function () {
        switch (token) {
            case tokenType_1.TokenType.ThisKeyword:
            case tokenType_1.TokenType.SuperKeyword:
            case tokenType_1.TokenType.NullKeyword:
            case tokenType_1.TokenType.TrueKeyword:
            case tokenType_1.TokenType.FalseKeyword:
            case tokenType_1.TokenType.NumericLiteral:
            case tokenType_1.TokenType.StringLiteral:
            case tokenType_1.TokenType.NoSubstitutionTemplateLiteral:
            case tokenType_1.TokenType.TemplateHead:
            case tokenType_1.TokenType.OpenParenToken:
            case tokenType_1.TokenType.OpenBracketToken:
            case tokenType_1.TokenType.OpenBraceToken:
            case tokenType_1.TokenType.FunctionKeyword:
            case tokenType_1.TokenType.ClassKeyword:
            case tokenType_1.TokenType.NewKeyword:
            case tokenType_1.TokenType.SlashToken:
            case tokenType_1.TokenType.SlashEqualsToken:
            case tokenType_1.TokenType.Identifier:
                return true;
            default:
                return isIdentifier();
        }
    };
    Parser.prototype.fallowsExpression = function () {
        if (isStartOfLeftHandSideExpression()) {
            return true;
        }
        switch (token) {
            case tokenType_1.TokenType.PlusToken:
            case tokenType_1.TokenType.MinusToken:
            case tokenType_1.TokenType.TildeToken:
            case tokenType_1.TokenType.ExclamationToken:
            case tokenType_1.TokenType.DeleteKeyword:
            case tokenType_1.TokenType.TypeOfKeyword:
            case tokenType_1.TokenType.VoidKeyword:
            case tokenType_1.TokenType.PlusPlusToken:
            case tokenType_1.TokenType.MinusMinusToken:
            case tokenType_1.TokenType.LessThanToken:
            case tokenType_1.TokenType.AwaitKeyword:
            case tokenType_1.TokenType.YieldKeyword:
                // Yield/await always starts an expression.  Either it is an identifier (in which case
                // it is definitely an expression).  Or it's a keyword (either because we're in
                // a generator or async private, or in strict mode (or both)) and it started a yield or await expression.
                return true;
            default:
                // Error tolerance.  If we see the start of some binary operator, we consider
                // that the start of an expression.  That way we'll parse out a missing identifier,
                // give a good message about an identifier being missing, and then consume the
                // rest of the binary expression.
                if (isBinaryOperator()) {
                    return true;
                }
                return isIdentifier();
        }
    };
    Parser.prototype.fallowsExpressionStatement = function () {
        // As per the grammar, none of '{' or 'private' or 'class' can start an expression statement.
        return token !== tokenType_1.TokenType.OpenBraceToken &&
            token !== tokenType_1.TokenType.FunctionKeyword &&
            token !== tokenType_1.TokenType.ClassKeyword &&
            token !== tokenType_1.TokenType.AtToken &&
            fallowsExpression();
    };
    Parser.prototype.parseExpression = function () {
        // Expression[in]:
        //      AssignmentExpression[in]
        //      Expression[in] , AssignmentExpression[in]
        var result = this.parseAssignmentExpressionOrHigher();
        while (this.parseOptional(tokenType_1.TokenType.comma)) {
            result = this.makeBinaryExpression(result, tokenType_1.TokenType.comma, this.lexer.tokenStart - 1, this.parseAssignmentExpressionOrHigher());
        }
        return result;
    };
    Parser.prototype.parseInitializer = function (inParameter) {
        if (token !== tokenType_1.TokenType.EqualsToken) {
            // It's not uncommon during typing for the user to miss writing the '=' token.  Check if
            // there is no newline after the last token and if we're on an expression.  If so, parse
            // this as an equals-value clause with a missing equals.
            // NOTE: There are two places where we allow equals-value clauses.  The first is in a
            // variable declarator.  The second is with a parameter.  For variable declarators
            // it's more likely that a { would be a allowed (as an object literal).  While this
            // is also allowed for parameters, the risk is that we consume the { as an object
            // literal when it really will be for the block following the parameter.
            if (scanner.hasPrecedingLineBreak() || (inParameter && token === tokenType_1.TokenType.OpenBraceToken) || !fallowsExpression()) {
                // preceding line break, open brace in a parameter (likely a private body) or current token is not an expression -
                // do not try to parse initializer
                return undefined;
            }
        }
        // Initializer[In, Yield] :
        //     = AssignmentExpression[?In, ?Yield]
        this.parseExpected(tokenType_1.TokenType.EqualsToken);
        return parseAssignmentExpressionOrHigher();
    };
    Parser.prototype.parseAssignmentExpressionOrHigher = function () {
        //  AssignmentExpression[in,yield]:
        //      1) ConditionalExpression[?in,?yield]
        //      2) LeftHandSideExpression = AssignmentExpression[?in,?yield]
        //      3) LeftHandSideExpression AssignmentOperator AssignmentExpression[?in,?yield]
        //      4) ArrowFunctionExpression[?in,?yield]
        //      5) AsyncArrowFunctionExpression[in,yield,await]
        //      6) [+Yield] YieldExpression[?In]
        //
        // Note: for ease of implementation we treat productions '2' and '3' as the same thing.
        // (i.e. they're both BinaryExpressions with an assignment operator in it).
        // First, do the simple check if we have a YieldExpression (production '5').
        var yieldExpression = this.tryParseYieldExpression();
        if (yieldExpression) {
            return yieldExpression;
        }
        // Then, check if we have an arrow private (production '4' and '5') that starts with a parenthesized
        // parameter list or is an async arrow private.
        // AsyncArrowFunctionExpression:
        //      1) async[no LineTerminator here]AsyncArrowBindingIdentifier[?Yield][no LineTerminator here]=>AsyncConciseBody[?In]
        //      2) CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await][no LineTerminator here]=>AsyncConciseBody[?In]
        // Production (1) of AsyncArrowFunctionExpression is parsed in "tryParseAsyncSimpleArrowFunctionExpression".
        // And production (2) is parsed in "tryParseParenthesizedArrowFunctionExpression".
        //
        // If we do successfully parse arrow-private, we must *not* recurse for productions 1, 2 or 3. An ArrowFunction is
        // not a  LeftHandSideExpression, nor does it start a ConditionalExpression.  So we are done
        // with AssignmentExpression if we see one.
        var arrowExpression = this.tryParseLambdaLiteral();
        this.tryParseParenthesizedArrowFunctionExpression() || this.tryParseAsyncSimpleArrowFunctionExpression();
        if (arrowExpression) {
            return arrowExpression;
        }
        // Now try to see if we're in production '1', '2' or '3'.  A conditional expression can
        // start with a LogicalOrExpression, while the assignment productions can only start with
        // LeftHandSideExpressions.
        //
        // So, first, we try to just parse out a BinaryExpression.  If we get something that is a
        // LeftHandSide or higher, then we can try to parse out the assignment expression part.
        // Otherwise, we try to parse out the conditional expression bit.  We want to allow any
        // binary expression here, so we pass in the 'lowest' precedence here so that it matches
        // and consumes anything.
        var expr = this.parseBinaryExpressionOrHigher(/*precedence*/ 0);
        // To avoid a look-ahead, we did not handle the case of an arrow private with a single un-parenthesized
        // parameter ('x => ...') above. We handle it here by checking if the parsed expression was a single
        // identifier and the current token is an arrow.
        if (expr.kind === tokenType_1.TokenType.identifier && token === tokenType_1.TokenType.EqualsGreaterThanToken) {
            return parseSimpleArrowFunctionExpression(expr);
        }
        // Now see if we might be in cases '2' or '3'.
        // If the expression was a LHS expression, and we have an assignment operator, then
        // we're in '2' or '3'. Consume the assignment and return.
        //
        // Note: we call reScanGreaterToken so that we get an appropriately merged token
        // for cases like > > =  becoming >>=
        if (isLeftHandSideExpression(expr) && isAssignmentOperator(reScanGreaterToken())) {
            return makeBinaryExpression(expr, parseTokenNode(), parseAssignmentExpressionOrHigher());
        }
        // It wasn't an assignment or a lambda.  This is a conditional expression:
        return parseConditionalExpressionRest(expr);
    };
    Parser.prototype.tryParseYieldExpression = function () {
        // We're in a context where 'yield expr' is not allowed.  However, if we can
        // definitely tell that the user was trying to parse a 'yield expr' and not
        // just a normal expr that start with a 'yield' identifier, then parse out
        // a 'yield expr'.  We can then report an error later that they are only
        // allowed in generator expressions.
        //
        // for example, if we see 'yield(foo)', then we'll have to treat that as an
        // invocation expression of something called 'yield'.  However, if we have
        // 'yield foo' then that is not legal as a normal expression, so we can
        // definitely recognize this as a yield expression.
        //
        // for now we just check if the next token is an identifier.  More heuristics
        // can be added here later as necessary.  We just need to make sure that we
        // don't accidentally consume something legal.
        if (this.lexer.tokenType === tokenType_1.TokenType.yield && (this.flags & ParseFlags.allowYield) && this.nextTokenIsIdentifierOrKeywordOrNumberOnSameLine()) {
            return this.parseYieldExpression();
        }
    };
    Parser.prototype.parseYieldExpression = function () {
        // YieldExpression[In] :
        //      yield
        //      yield [no LineTerminator here] [Lexical goal InputElementRegExp]AssignmentExpression[?In, Yield]
        //      yield [no LineTerminator here] * [Lexical goal InputElementRegExp]AssignmentExpression[?In, Yield]
        // #assert this.lexer.currentToken.type === TokenType.yield
        var result = new ast.YieldExpression();
        result.start = this.lexer.read().start; // yield
        if (!this.lexer.currentToken.hasLineTerminatorBeforeStart) {
            if (this.lexer.tokenType === tokenType_1.TokenType.asterisk) {
                result.asteriskStart = this.lexer.read().start;
                result.value = this.parseAssignmentExpressionOrHigher();
            }
            else if (this.fallowsExpression()) {
                result.value = this.parseAssignmentExpressionOrHigher();
            }
        }
        return result;
    };
    Parser.prototype.nextTokenIsIdentifierOnSameLine = function () {
        nextToken();
        return !scanner.hasPrecedingLineBreak() && isIdentifier();
    };
    Parser.prototype.parseSimpleArrowFunctionExpression = function (identifier, asyncModifier) {
        Debug.assert(token === tokenType_1.TokenType.EqualsGreaterThanToken, "parseSimpleArrowFunctionExpression should only have been called if we had a =>");
        var node;
        if (asyncModifier) {
            node = createNode(tokenType_1.TokenType.ArrowFunction, asyncModifier.pos);
            setModifiers(node, asyncModifier);
        }
        else {
            node = createNode(tokenType_1.TokenType.ArrowFunction, identifier.pos);
        }
        var parameter = createNode(tokenType_1.TokenType.Parameter, identifier.pos);
        parameter.name = identifier;
        finishNode(parameter);
        node.parameters = [parameter];
        node.parameters.pos = parameter.pos;
        node.parameters.end = parameter.end;
        node.equalsGreaterThanToken = this.parseExpectedToken(tokenType_1.TokenType.EqualsGreaterThanToken, /*reportAtCurrentPosition*/ false, Diagnostics._0_expected, "=>");
        node.body = parseArrowFunctionExpressionBody(/*isAsync*/ !!asyncModifier);
        return finishNode(node);
    };
    Parser.prototype.tryParseLambdaLiteral = function () {
        // LambdaLiteral:
        //   ( ParemeterList ) LambdaReturnType? LambdaBody
        //   Identifier LambdaReturnType? LambdaBody
        //   < TypeParamerList > ( ParemeterList ) LambdaReturnType? LambdaLiteral
        //   async ( ParemeterList ) LambdaReturnType? LambdaLiteral
        //   async < TypeParamerList >  ( ParemeterList ) LambdaReturnType? LambdaLiteral
        // LambdaBody:
        //   => Block
        //   => Expression
    };
    Parser.prototype.tryParseParenthesizedArrowFunctionExpression = function () {
        var mustBeArrowFunction;
        switch (this.lexer.tokenType) {
            case tokenType_1.TokenType.openParen:
            case tokenType_1.TokenType.lessThan:
            case tokenType_1.TokenType.async:
                mustBeArrowFunction = this.isParenthesizedArrowFunctionExpressionWorker();
                break;
            case tokenType_1.TokenType.equalsGreaterThan:
                mustBeArrowFunction = true;
                break;
            default:
                return;
        }
        var triState = this.isParenthesizedArrowFunctionExpression();
        if (triState === false) {
            // It's definitely not a parenthesized arrow private expression.
            return undefined;
        }
        // If we definitely have an arrow private, then we can just parse one, not requiring a
        // following => or { token. Otherwise, we *might* have an arrow private.  Try to parse
        // it out, but don't allow any ambiguity, and return 'undefined' if this could be an
        // expression instead.
        var arrowFunction = triState === true
            ? parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ true)
            : tryParse(parsePossibleParenthesizedArrowFunctionExpressionHead);
        if (!arrowFunction) {
            // Didn't appear to actually be a parenthesized arrow private.  Just bail out.
            return undefined;
        }
        var isAsync = !!(arrowFunction.flags & NodeFlags.Async);
        // If we have an arrow, then try to parse the body. Even if not, try to parse if we
        // have an opening brace, just in case we're in an error state.
        var lastToken = token;
        arrowFunction.equalsGreaterThanToken = this.parseExpectedToken(tokenType_1.TokenType.EqualsGreaterThanToken, /*reportAtCurrentPosition*/ false, Diagnostics._0_expected, "=>");
        arrowFunction.body = (lastToken === tokenType_1.TokenType.EqualsGreaterThanToken || lastToken === tokenType_1.TokenType.OpenBraceToken)
            ? parseArrowFunctionExpressionBody(isAsync)
            : parseIdentifier();
        return finishNode(arrowFunction);
    };
    //  True        -> We definitely expect a parenthesized arrow private here.
    //  False       -> There *cannot* be a parenthesized arrow private here.
    //  Unknown     -> There *might* be a parenthesized arrow private here.
    //                 Speculatively look ahead to be sure, and rollback if not.
    Parser.prototype.isParenthesizedArrowFunctionExpression = function () {
    };
    Parser.prototype.isParenthesizedArrowFunctionExpressionWorker = function () {
        this.lexer.stashSave();
        if (this.lexer.currentToken.type === tokenType_1.TokenType.async) {
            this.lexer.read();
            if (this.lexer.currentToken.hasLineTerminatorBeforeStart) {
                return false;
            }
            if (this.lexer.currentToken.type !== tokenType_1.TokenType.openParen && this.lexer.currentToken.type !== tokenType_1.TokenType.lessThanSlash) {
                return false;
            }
        }
        var first = token;
        var second = nextToken();
        if (first === tokenType_1.TokenType.openParen) {
            if (second === tokenType_1.TokenType.closeParen) {
                // Simple cases: "() =>", "(): ", and  "() {".
                // This is an arrow private with no parameters.
                // The last one is not actually an arrow private,
                // but this is probably what the user intended.
                var third = nextToken();
                switch (third) {
                    case tokenType_1.TokenType.equalsGreaterThan:
                    case tokenType_1.TokenType.colon:
                    case tokenType_1.TokenType.openParen:
                        return true;
                    default:
                        return false;
                }
            }
            // If encounter "([" or "({", this could be the start of a binding pattern.
            // Examples:
            //      ([ x ]) => { }
            //      ({ x }) => { }
            //      ([ x ])
            //      ({ x })
            if (second === tokenType_1.TokenType.openBracket || second === tokenType_1.TokenType.openBrace) {
                return null;
            }
            // Simple case: "(..."
            // This is an arrow private with a rest parameter.
            if (second === tokenType_1.TokenType.dotDotDot) {
                return true;
            }
            // If we had "(" followed by something that's not an identifier,
            // then this definitely doesn't look like a lambda.
            // Note: we could be a little more lenient and allow
            // "(public" or "(private". These would not ever actually be allowed,
            // but we could provide a good error message instead of bailing out.
            if (!this.isIdentifier()) {
                return false;
            }
            // If we have something like "(a:", then we must have a
            // type-annotated parameter in an arrow private expression.
            if (nextToken() === tokenType_1.TokenType.colonToken) {
                return Tristate.True;
            }
            // This *could* be a parenthesized arrow private.
            // Return Unknown to let the caller know.
            return Tristate.Unknown;
        }
        else {
            Debug.assert(first === tokenType_1.TokenType.LessThanToken);
            // If we have "<" not followed by an identifier,
            // then this definitely is not an arrow private.
            if (!isIdentifier()) {
                return Tristate.False;
            }
            // JSX overrides
            if (sourceFile.languageVariant === LanguageVariant.JSX) {
                var isArrowFunctionInJsx = lookAhead(function () {
                    var third = nextToken();
                    if (third === tokenType_1.TokenType.ExtendsKeyword) {
                        var fourth = nextToken();
                        switch (fourth) {
                            case tokenType_1.TokenType.EqualsToken:
                            case tokenType_1.TokenType.GreaterThanToken:
                                return false;
                            default:
                                return true;
                        }
                    }
                    else if (third === tokenType_1.TokenType.CommaToken) {
                        return true;
                    }
                    return false;
                });
                if (isArrowFunctionInJsx) {
                    return Tristate.True;
                }
                return Tristate.False;
            }
            // This *could* be a parenthesized arrow private.
            return Tristate.Unknown;
        }
    };
    Parser.prototype.parsePossibleParenthesizedArrowFunctionExpressionHead = function () {
        return parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ false);
    };
    Parser.prototype.tryParseAsyncSimpleArrowFunctionExpression = function () {
        // We do a check here so that we won't be doing unnecessarily call to "lookAhead"
        if (token === tokenType_1.TokenType.AsyncKeyword) {
            var isUnParenthesizedAsyncArrowFunction = lookAhead(isUnParenthesizedAsyncArrowFunctionWorker);
            if (isUnParenthesizedAsyncArrowFunction === Tristate.True) {
                var asyncModifier = parseModifiersForArrowFunction();
                var expr = parseBinaryExpressionOrHigher(/*precedence*/ 0);
                return parseSimpleArrowFunctionExpression(expr, asyncModifier);
            }
        }
        return undefined;
    };
    Parser.prototype.isUnParenthesizedAsyncArrowFunctionWorker = function () {
        // AsyncArrowFunctionExpression:
        //      1) async[no LineTerminator here]AsyncArrowBindingIdentifier[?Yield][no LineTerminator here]=>AsyncConciseBody[?In]
        //      2) CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await][no LineTerminator here]=>AsyncConciseBody[?In]
        if (token === tokenType_1.TokenType.AsyncKeyword) {
            nextToken();
            // If the "async" is followed by "=>" token then it is not a begining of an async arrow-private
            // but instead a simple arrow-private which will be parsed inside "parseAssignmentExpressionOrHigher"
            if (scanner.hasPrecedingLineBreak() || token === tokenType_1.TokenType.EqualsGreaterThanToken) {
                return Tristate.False;
            }
            // Check for un-parenthesized AsyncArrowFunction
            var expr = parseBinaryExpressionOrHigher(/*precedence*/ 0);
            if (!scanner.hasPrecedingLineBreak() && expr.kind === tokenType_1.TokenType.Identifier && token === tokenType_1.TokenType.EqualsGreaterThanToken) {
                return Tristate.True;
            }
        }
        return Tristate.False;
    };
    Parser.prototype.parseParenthesizedArrowFunctionExpressionHead = function (allowAmbiguity) {
        var node = createNode(tokenType_1.TokenType.ArrowFunction);
        setModifiers(node, parseModifiersForArrowFunction());
        var isAsync = !!(node.flags & NodeFlags.Async);
        // Arrow privates are never generators.
        //
        // If we're speculatively parsing a signature for a parenthesized arrow private, then
        // we have to have a complete parameter list.  Otherwise we might see something like
        // a => (b => c)
        // And think that "(b =>" was actually a parenthesized arrow private with a missing
        // close paren.
        fillSignature(tokenType_1.TokenType.ColonToken, /*yieldContext*/ false, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ !allowAmbiguity, node);
        // If we couldn't get parameters, we definitely could not parse out an arrow private.
        if (!node.parameters) {
            return undefined;
        }
        // Parsing a signature isn't enough.
        // Parenthesized arrow signatures often look like other valid expressions.
        // For instance:
        //  - "(x = 10)" is an assignment expression parsed as a signature with a default parameter value.
        //  - "(x,y)" is a comma expression parsed as a signature with two parameters.
        //  - "a ? (b): c" will have "(b):" parsed as a signature with a return type annotation.
        //
        // So we need just a bit of lookahead to ensure that it can only be a signature.
        if (!allowAmbiguity && token !== tokenType_1.TokenType.EqualsGreaterThanToken && token !== tokenType_1.TokenType.OpenBraceToken) {
            // Returning undefined here will cause our caller to rewind to where we started from.
            return undefined;
        }
        return node;
    };
    Parser.prototype.parseArrowFunctionExpressionBody = function (isAsync) {
        if (token === tokenType_1.TokenType.OpenBraceToken) {
            return parseFunctionBlock(/*allowYield*/ false, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);
        }
        if (token !== tokenType_1.TokenType.SemicolonToken &&
            token !== tokenType_1.TokenType.FunctionKeyword &&
            token !== tokenType_1.TokenType.ClassKeyword &&
            isStartOfStatement() &&
            !fallowsExpressionStatement()) {
            // Check if we got a plain statement (i.e. no expression-statements, no private/class expressions/declarations)
            //
            // Here we try to recover from a potential error situation in the case where the
            // user meant to supply a block. For example, if the user wrote:
            //
            //  a =>
            //      let v = 0;
            //  }
            //
            // they may be missing an open brace.  Check to see if that's the case so we can
            // try to recover better.  If we don't do this, then the next close curly we see may end
            // up preemptively closing the containing construct.
            //
            // Note: even when 'ignoreMissingOpenBrace' is passed as true, parseBody will still error.
            return parseFunctionBlock(/*allowYield*/ false, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ true);
        }
        return isAsync
            ? doInAwaitContext(parseAssignmentExpressionOrHigher)
            : doOutsideOfAwaitContext(parseAssignmentExpressionOrHigher);
    };
    Parser.prototype.parseConditionalExpressionRest = function (leftOperand) {
        // Note: we are passed in an expression which was produced from parseBinaryExpressionOrHigher.
        var questionToken = parseOptionalToken(tokenType_1.TokenType.QuestionToken);
        if (!questionToken) {
            return leftOperand;
        }
        // Note: we explicitly 'allowIn' in the whenTrue part of the condition expression, and
        // we do not that for the 'whenFalse' part.
        var node = createNode(tokenType_1.TokenType.ConditionalExpression, leftOperand.pos);
        node.condition = leftOperand;
        node.questionToken = questionToken;
        node.whenTrue = doOutsideOfContext(disallowInAndDecoratorContext, parseAssignmentExpressionOrHigher);
        node.colonToken = this.parseExpectedToken(tokenType_1.TokenType.ColonToken, /*reportAtCurrentPosition*/ false, Diagnostics._0_expected, tokenType_1.tokenToString(tokenType_1.TokenType.ColonToken));
        node.whenFalse = parseAssignmentExpressionOrHigher();
        return finishNode(node);
    };
    Parser.prototype.parseBinaryExpressionOrHigher = function (precedence) {
        var leftOperand = this.parseUnaryExpressionOrHigher();
        return this.parseBinaryExpressionRest(precedence, leftOperand);
    };
    Parser.prototype.isInOrOfKeyword = function (t) {
        return t === tokenType_1.TokenType.InKeyword || t === tokenType_1.TokenType.OfKeyword;
    };
    Parser.prototype.parseBinaryExpressionRest = function (precedence, leftOperand) {
        while (true) {
            // We either have a binary operator here, or we're finished.  We call
            // reScanGreaterToken so that we merge token sequences like > and = into >=
            reScanGreaterToken();
            var newPrecedence = getBinaryOperatorPrecedence();
            // Check the precedence to see if we should "take" this operator
            // - For left associative operator (all operator but **), consume the operator,
            //   recursively call the private below, and parse binaryExpression as a rightOperand
            //   of the caller if the new precedence of the operator is greater then or equal to the current precedence.
            //   For example:
            //      a - b - c;
            //            ^token; leftOperand = b. Return b to the caller as a rightOperand
            //      a * b - c
            //            ^token; leftOperand = b. Return b to the caller as a rightOperand
            //      a - b * c;
            //            ^token; leftOperand = b. Return b * c to the caller as a rightOperand
            // - For right associative operator (**), consume the operator, recursively call the private
            //   and parse binaryExpression as a rightOperand of the caller if the new precedence of
            //   the operator is strictly grater than the current precedence
            //   For example:
            //      a ** b ** c;
            //             ^^token; leftOperand = b. Return b ** c to the caller as a rightOperand
            //      a - b ** c;
            //            ^^token; leftOperand = b. Return b ** c to the caller as a rightOperand
            //      a ** b - c
            //             ^token; leftOperand = b. Return b to the caller as a rightOperand
            var consumeCurrentOperator = token === tokenType_1.TokenType.AsteriskAsteriskToken ?
                newPrecedence >= precedence :
                newPrecedence > precedence;
            if (!consumeCurrentOperator) {
                break;
            }
            if (token === tokenType_1.TokenType.InKeyword && inDisallowInContext()) {
                break;
            }
            if (token === tokenType_1.TokenType.AsKeyword) {
                // Make sure we *do* perform ASI for constructs like this:
                //    var x = foo
                //    as (Bar)
                // This should be parsed as an initialized variable, followed
                // by a private call to 'as' with the argument 'Bar'
                if (scanner.hasPrecedingLineBreak()) {
                    break;
                }
                else {
                    nextToken();
                    leftOperand = makeAsExpression(leftOperand, parseType());
                }
            }
            else {
                leftOperand = makeBinaryExpression(leftOperand, parseTokenNode(), parseBinaryExpressionOrHigher(newPrecedence));
            }
        }
        return leftOperand;
    };
    Parser.prototype.isBinaryOperator = function () {
        if (inDisallowInContext() && token === tokenType_1.TokenType.InKeyword) {
            return false;
        }
        return getBinaryOperatorPrecedence() > 0;
    };
    Parser.prototype.getBinaryOperatorPrecedence = function () {
        switch (token) {
            case tokenType_1.TokenType.BarBarToken:
                return 1;
            case tokenType_1.TokenType.AmpersandAmpersandToken:
                return 2;
            case tokenType_1.TokenType.BarToken:
                return 3;
            case tokenType_1.TokenType.CaretToken:
                return 4;
            case tokenType_1.TokenType.AmpersandToken:
                return 5;
            case tokenType_1.TokenType.EqualsEqualsToken:
            case tokenType_1.TokenType.ExclamationEqualsToken:
            case tokenType_1.TokenType.EqualsEqualsEqualsToken:
            case tokenType_1.TokenType.ExclamationEqualsEqualsToken:
                return 6;
            case tokenType_1.TokenType.LessThanToken:
            case tokenType_1.TokenType.GreaterThanToken:
            case tokenType_1.TokenType.LessThanEqualsToken:
            case tokenType_1.TokenType.GreaterThanEqualsToken:
            case tokenType_1.TokenType.InstanceOfKeyword:
            case tokenType_1.TokenType.InKeyword:
            case tokenType_1.TokenType.AsKeyword:
                return 7;
            case tokenType_1.TokenType.LessThanLessThanToken:
            case tokenType_1.TokenType.GreaterThanGreaterThanToken:
            case tokenType_1.TokenType.GreaterThanGreaterThanGreaterThanToken:
                return 8;
            case tokenType_1.TokenType.PlusToken:
            case tokenType_1.TokenType.MinusToken:
                return 9;
            case tokenType_1.TokenType.AsteriskToken:
            case tokenType_1.TokenType.SlashToken:
            case tokenType_1.TokenType.PercentToken:
                return 10;
            case tokenType_1.TokenType.AsteriskAsteriskToken:
                return 11;
        }
        // -1 is lower than all other precedences.  Returning it will cause binary expression
        // parsing to stop.
        return -1;
    };
    Parser.prototype.makeBinaryExpression = function (left, operator, operatorStart, right) {
        var result = new ast.BinaryExpression();
        result.leftOperand = left;
        result.operator = operator;
        result.operatorStart = operatorStart;
        result.rightOperand = right;
        return result;
    };
    Parser.prototype.makeAsExpression = function (left, right) {
        var node = createNode(tokenType_1.TokenType.AsExpression, left.pos);
        node.expression = left;
        node.type = right;
        return finishNode(node);
    };
    Parser.prototype.parsePrefixUnaryExpression = function () {
        var node = createNode(tokenType_1.TokenType.PrefixUnaryExpression);
        node.operator = token;
        nextToken();
        node.operand = parseSimpleUnaryExpression();
        return finishNode(node);
    };
    Parser.prototype.parseDeleteExpression = function () {
        var node = createNode(tokenType_1.TokenType.DeleteExpression);
        nextToken();
        node.expression = parseSimpleUnaryExpression();
        return finishNode(node);
    };
    Parser.prototype.parseTypeOfExpression = function () {
        var node = createNode(tokenType_1.TokenType.TypeOfExpression);
        nextToken();
        node.expression = parseSimpleUnaryExpression();
        return finishNode(node);
    };
    Parser.prototype.parseVoidExpression = function () {
        var node = createNode(tokenType_1.TokenType.VoidExpression);
        nextToken();
        node.expression = parseSimpleUnaryExpression();
        return finishNode(node);
    };
    Parser.prototype.isAwaitExpression = function () {
        if (token === tokenType_1.TokenType.AwaitKeyword) {
            if (inAwaitContext()) {
                return true;
            }
            // here we are using similar heuristics as 'isYieldExpression'
            return lookAhead(nextTokenIsIdentifierOnSameLine);
        }
        return false;
    };
    Parser.prototype.parseAwaitExpression = function () {
        var node = createNode(tokenType_1.TokenType.AwaitExpression);
        nextToken();
        node.expression = parseSimpleUnaryExpression();
        return finishNode(node);
    };
    /**
     * Parse ES7 unary expression and await expression
     *
     * ES7 UnaryExpression:
     *      1) SimpleUnaryExpression[?yield]
     *      2) IncrementExpression[?yield] ** UnaryExpression[?yield]
     */
    Parser.prototype.parseUnaryExpressionOrHigher = function () {
        if (this.isAwaitExpression()) {
            return this.parseAwaitExpression();
        }
        if (this.isIncrementExpression()) {
            var incrementExpression = this.parseIncrementExpression();
            return this.lexer.currentToken.type === tokenType_1.TokenType.asteriskAsterisk ?
                parseBinaryExpressionRest(getBinaryOperatorPrecedence(), incrementExpression) :
                incrementExpression;
        }
        var unaryOperator = token;
        var simpleUnaryExpression = parseSimpleUnaryExpression();
        if (token === tokenType_1.TokenType.AsteriskAsteriskToken) {
            var start = skipTrivia(sourceText, simpleUnaryExpression.pos);
            if (simpleUnaryExpression.kind === tokenType_1.TokenType.TypeAssertionExpression) {
                parseErrorAtPosition(start, simpleUnaryExpression.end - start, Diagnostics.A_type_assertion_expression_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses);
            }
            else {
                parseErrorAtPosition(start, simpleUnaryExpression.end - start, Diagnostics.An_unary_expression_with_the_0_operator_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses, tokenType_1.tokenToString(unaryOperator));
            }
        }
        return simpleUnaryExpression;
    };
    /**
     * Parse ES7 simple-unary expression or higher:
     *
     * ES7 SimpleUnaryExpression:
     *      1) IncrementExpression[?yield]
     *      2) delete UnaryExpression[?yield]
     *      3) void UnaryExpression[?yield]
     *      4) typeof UnaryExpression[?yield]
     *      5) + UnaryExpression[?yield]
     *      6) - UnaryExpression[?yield]
     *      7) ~ UnaryExpression[?yield]
     *      8) ! UnaryExpression[?yield]
     */
    Parser.prototype.parseSimpleUnaryExpression = function () {
        switch (token) {
            case tokenType_1.TokenType.PlusToken:
            case tokenType_1.TokenType.MinusToken:
            case tokenType_1.TokenType.TildeToken:
            case tokenType_1.TokenType.ExclamationToken:
                return parsePrefixUnaryExpression();
            case tokenType_1.TokenType.DeleteKeyword:
                return parseDeleteExpression();
            case tokenType_1.TokenType.TypeOfKeyword:
                return parseTypeOfExpression();
            case tokenType_1.TokenType.VoidKeyword:
                return parseVoidExpression();
            case tokenType_1.TokenType.LessThanToken:
                // This is modified UnaryExpression grammar in TypeScript
                //  UnaryExpression (modified):
                //      < type > UnaryExpression
                return parseTypeAssertion();
            default:
                return parseIncrementExpression();
        }
    };
    /**
     * Check if the current token can possibly be an ES7 increment expression.
     *
     * ES7 IncrementExpression:
     *      LeftHandSideExpression[?Yield]
     *      LeftHandSideExpression[?Yield][no LineTerminator here]++
     *      LeftHandSideExpression[?Yield][no LineTerminator here]--
     *      ++LeftHandSideExpression[?Yield]
     *      --LeftHandSideExpression[?Yield]
     */
    Parser.prototype.isIncrementExpression = function () {
        // This private is called inside parseUnaryExpression to decide
        // whether to call parseSimpleUnaryExpression or call parseIncrementExpression directly
        switch (token) {
            case tokenType_1.TokenType.PlusToken:
            case tokenType_1.TokenType.MinusToken:
            case tokenType_1.TokenType.TildeToken:
            case tokenType_1.TokenType.ExclamationToken:
            case tokenType_1.TokenType.DeleteKeyword:
            case tokenType_1.TokenType.TypeOfKeyword:
            case tokenType_1.TokenType.VoidKeyword:
                return false;
            case tokenType_1.TokenType.LessThanToken:
                // If we are not in JSX context, we are parsing TypeAssertion which is an UnaryExpression
                if (sourceFile.languageVariant !== LanguageVariant.JSX) {
                    return false;
                }
            // We are in JSX context and the token is part of JSXElement.
            // Fall through
            default:
                return true;
        }
    };
    /**
     * Parse ES7 IncrementExpression. IncrementExpression is used instead of ES6's PostFixExpression.
     *
     * ES7 IncrementExpression[yield]:
     *      1) LeftHandSideExpression[?yield]
     *      2) LeftHandSideExpression[?yield] [[no LineTerminator here]]++
     *      3) LeftHandSideExpression[?yield] [[no LineTerminator here]]--
     *      4) ++LeftHandSideExpression[?yield]
     *      5) --LeftHandSideExpression[?yield]
     * In TypeScript (2), (3) are parsed as PostfixUnaryExpression. (4), (5) are parsed as PrefixUnaryExpression
     */
    Parser.prototype.parseIncrementExpression = function () {
        if (token === tokenType_1.TokenType.PlusPlusToken || token === tokenType_1.TokenType.MinusMinusToken) {
            var node = createNode(tokenType_1.TokenType.PrefixUnaryExpression);
            node.operator = token;
            nextToken();
            node.operand = parseLeftHandSideExpressionOrHigher();
            return finishNode(node);
        }
        else if (sourceFile.languageVariant === LanguageVariant.JSX && token === tokenType_1.TokenType.LessThanToken && lookAhead(nextTokenIsIdentifierOrKeyword)) {
            // JSXElement is part of primaryExpression
            return parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ true);
        }
        var expression = parseLeftHandSideExpressionOrHigher();
        Debug.assert(isLeftHandSideExpression(expression));
        if ((token === tokenType_1.TokenType.PlusPlusToken || token === tokenType_1.TokenType.MinusMinusToken) && !scanner.hasPrecedingLineBreak()) {
            var node = createNode(tokenType_1.TokenType.PostfixUnaryExpression, expression.pos);
            node.operand = expression;
            node.operator = token;
            nextToken();
            return finishNode(node);
        }
        return expression;
    };
    Parser.prototype.parseLeftHandSideExpressionOrHigher = function () {
        // Original Ecma:
        // LeftHandSideExpression: See 11.2
        //      NewExpression
        //      CallExpression
        //
        // Our simplification:
        //
        // LeftHandSideExpression: See 11.2
        //      MemberExpression
        //      CallExpression
        //
        // See comment in parseMemberExpressionOrHigher on how we replaced NewExpression with
        // MemberExpression to make our lives easier.
        //
        // to best understand the below code, it's important to see how CallExpression expands
        // out into its own productions:
        //
        // CallExpression:
        //      MemberExpression Arguments
        //      CallExpression Arguments
        //      CallExpression[Expression]
        //      CallExpression.IdentifierName
        //      super   (   ArgumentListopt   )
        //      super.IdentifierName
        //
        // Because of the recursion in these calls, we need to bottom out first.  There are two
        // bottom out states we can run into.  Either we see 'super' which must start either of
        // the last two CallExpression productions.  Or we have a MemberExpression which either
        // completes the LeftHandSideExpression, or starts the beginning of the first four
        // CallExpression productions.
        var expression = token === tokenType_1.TokenType.SuperKeyword
            ? parseSuperExpression()
            : parseMemberExpressionOrHigher();
        // Now, we *may* be complete.  However, we might have consumed the start of a
        // CallExpression.  As such, we need to consume the rest of it here to be complete.
        return parseCallExpressionRest(expression);
    };
    Parser.prototype.parseMemberExpressionOrHigher = function () {
        // Note: to make our lives simpler, we decompose the the NewExpression productions and
        // place ObjectCreationExpression and FunctionExpression into PrimaryExpression.
        // like so:
        //
        //   PrimaryExpression : See 11.1
        //      this
        //      Identifier
        //      Literal
        //      ArrayLiteral
        //      ObjectLiteral
        //      (Expression)
        //      FunctionExpression
        //      new MemberExpression Arguments?
        //
        //   MemberExpression : See 11.2
        //      PrimaryExpression
        //      MemberExpression[Expression]
        //      MemberExpression.IdentifierName
        //
        //   CallExpression : See 11.2
        //      MemberExpression
        //      CallExpression Arguments
        //      CallExpression[Expression]
        //      CallExpression.IdentifierName
        //
        // Technically this is ambiguous.  i.e. CallExpression defines:
        //
        //   CallExpression:
        //      CallExpression Arguments
        //
        // If you see: "new Foo()"
        //
        // Then that could be treated as a single ObjectCreationExpression, or it could be
        // treated as the invocation of "new Foo".  We disambiguate that in code (to match
        // the original grammar) by making sure that if we see an ObjectCreationExpression
        // we always consume arguments if they are there. So we treat "new Foo()" as an
        // object creation only, and not at all as an invocation)  Another way to think
        // about this is that for every "new" that we see, we will consume an argument list if
        // it is there as part of the *associated* object creation node.  Any additional
        // argument lists we see, will become invocation expressions.
        //
        // Because there are no other places in the grammar now that refer to FunctionExpression
        // or ObjectCreationExpression, it is safe to push down into the PrimaryExpression
        // production.
        //
        // Because CallExpression and MemberExpression are left recursive, we need to bottom out
        // of the recursion immediately.  So we parse out a primary expression to start with.
        var expression = parsePrimaryExpression();
        return parseMemberExpressionRest(expression);
    };
    Parser.prototype.parseSuperExpression = function () {
        var expression = parseTokenNode();
        if (token === tokenType_1.TokenType.OpenParenToken || token === tokenType_1.TokenType.DotToken || token === tokenType_1.TokenType.OpenBracketToken) {
            return expression;
        }
        // If we have seen "super" it must be followed by '(' or '.'.
        // If it wasn't then just try to parse out a '.' and report an error.
        var node = createNode(tokenType_1.TokenType.PropertyAccessExpression, expression.pos);
        node.expression = expression;
        this.parseExpectedToken(tokenType_1.TokenType.DotToken, /*reportAtCurrentPosition*/ false, Diagnostics.super_must_be_followed_by_an_argument_list_or_member_access);
        node.name = parseRightSideOfDot(/*allowIdentifierNames*/ true);
        return finishNode(node);
    };
    Parser.prototype.tagNamesAreEquivalent = function (lhs, rhs) {
        if (lhs.kind !== rhs.kind) {
            return false;
        }
        if (lhs.kind === tokenType_1.TokenType.Identifier) {
            return lhs.text === rhs.text;
        }
        if (lhs.kind === tokenType_1.TokenType.ThisKeyword) {
            return true;
        }
        // If we are at this statement then we must have PropertyAccessExpression and because tag name in Jsx element can only
        // take forms of JsxTagNameExpression which includes an identifier, "this" expression, or another propertyAccessExpression
        // it is safe to case the expression property as such. See parseJsxElementName for how we parse tag name in Jsx element
        return lhs.name.text === rhs.name.text &&
            tagNamesAreEquivalent(lhs.expression, rhs.expression);
    };
    Parser.prototype.parseJsxElementOrSelfClosingElement = function (inExpressionContext) {
        var opening = parseJsxOpeningOrSelfClosingElement(inExpressionContext);
        var result;
        if (opening.kind === tokenType_1.TokenType.JsxOpeningElement) {
            var node = createNode(tokenType_1.TokenType.JsxElement, opening.pos);
            node.openingElement = opening;
            node.children = parseJsxChildren(node.openingElement.tagName);
            node.closingElement = parseJsxClosingElement(inExpressionContext);
            if (!tagNamesAreEquivalent(node.openingElement.tagName, node.closingElement.tagName)) {
                parseErrorAtPosition(node.closingElement.pos, node.closingElement.end - node.closingElement.pos, Diagnostics.Expected_corresponding_JSX_closing_tag_for_0, getTextOfNodeFromSourceText(sourceText, node.openingElement.tagName));
            }
            result = finishNode(node);
        }
        else {
            Debug.assert(opening.kind === tokenType_1.TokenType.JsxSelfClosingElement);
            // Nothing else to do for self-closing elements
            result = opening;
        }
        // If the user writes the invalid code '<div></div><div></div>' in an expression context (i.e. not wrapped in
        // an enclosing tag), we'll naively try to parse   ^ this as a 'less than' operator and the remainder of the tag
        // as garbage, which will cause the formatter to badly mangle the JSX. Perform a speculative parse of a JSX
        // element if we see a < token so that we can wrap it in a synthetic binary expression so the formatter
        // does less damage and we can report a better error.
        // Since JSX elements are invalid < operands anyway, this lookahead parse will only occur in error scenarios
        // of one sort or another.
        if (inExpressionContext && token === tokenType_1.TokenType.LessThanToken) {
            var invalidElement = tryParse(function () { return parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ true); });
            if (invalidElement) {
                parseErrorAtCurrentToken(Diagnostics.JSX_expressions_must_have_one_parent_element);
                var badNode = createNode(tokenType_1.TokenType.BinaryExpression, result.pos);
                badNode.end = invalidElement.end;
                badNode.left = result;
                badNode.right = invalidElement;
                badNode.operatorToken = createMissingNode(tokenType_1.TokenType.CommaToken, /*reportAtCurrentPosition*/ false, /*diagnosticMessage*/ undefined);
                badNode.operatorToken.pos = badNode.operatorToken.end = badNode.right.pos;
                return badNode;
            }
        }
        return result;
    };
    Parser.prototype.parseJsxText = function () {
        var node = createNode(tokenType_1.TokenType.JsxText, scanner.getStartPos());
        token = scanner.scanJsxToken();
        return finishNode(node);
    };
    Parser.prototype.parseJsxChild = function () {
        switch (token) {
            case tokenType_1.TokenType.JsxText:
                return parseJsxText();
            case tokenType_1.TokenType.OpenBraceToken:
                return parseJsxExpression(/*inExpressionContext*/ false);
            case tokenType_1.TokenType.LessThanToken:
                return parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ false);
        }
        Debug.fail("Unknown JSX child kind " + token);
    };
    Parser.prototype.parseJsxChildren = function (openingTagName) {
        var result = [];
        result.pos = scanner.getStartPos();
        var saveParsingContext = parsingContext;
        parsingContext |= 1 << ParsingContext.JsxChildren;
        while (true) {
            token = scanner.reScanJsxToken();
            if (token === tokenType_1.TokenType.LessThanSlashToken) {
                // Closing tag
                break;
            }
            else if (token === tokenType_1.TokenType.EndOfFileToken) {
                // If we hit EOF, issue the error at the tag that lacks the closing element
                // rather than at the end of the file (which is useless)
                parseErrorAtPosition(openingTagName.pos, openingTagName.end - openingTagName.pos, Diagnostics.JSX_element_0_has_no_corresponding_closing_tag, getTextOfNodeFromSourceText(sourceText, openingTagName));
                break;
            }
            result.push(parseJsxChild());
        }
        result.end = scanner.getTokenPos();
        parsingContext = saveParsingContext;
        return result;
    };
    Parser.prototype.parseJsxOpeningOrSelfClosingElement = function (inExpressionContext) {
        var fullStart = scanner.getStartPos();
        this.parseExpected(tokenType_1.TokenType.LessThanToken);
        var tagName = parseJsxElementName();
        var attributes = parseList(ParsingContext.JsxAttributes, parseJsxAttribute);
        var node;
        if (token === tokenType_1.TokenType.GreaterThanToken) {
            // Closing tag, so scan the immediately-following text with the JSX scanning instead
            // of regular scanning to avoid treating illegal characters (e.g. '#') as immediate
            // scanning errors
            node = createNode(tokenType_1.TokenType.JsxOpeningElement, fullStart);
            scanJsxText();
        }
        else {
            this.parseExpected(tokenType_1.TokenType.SlashToken);
            if (inExpressionContext) {
                this.parseExpected(tokenType_1.TokenType.GreaterThanToken);
            }
            else {
                this.parseExpected(tokenType_1.TokenType.GreaterThanToken, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
                scanJsxText();
            }
            node = createNode(tokenType_1.TokenType.JsxSelfClosingElement, fullStart);
        }
        node.tagName = tagName;
        node.attributes = attributes;
        return finishNode(node);
    };
    Parser.prototype.parseJsxElementName = function () {
        scanJsxIdentifier();
        // JsxElement can have name in the form of
        //      propertyAccessExpression
        //      primaryExpression in the form of an identifier and "this" keyword
        // We can't just simply use parseLeftHandSideExpressionOrHigher because then we will start consider class,private etc as a keyword
        // We only want to consider "this" as a primaryExpression
        var expression = token === tokenType_1.TokenType.ThisKeyword ?
            parseTokenNode() : parseIdentifierName();
        while (parseOptional(tokenType_1.TokenType.DotToken)) {
            var propertyAccess = createNode(tokenType_1.TokenType.PropertyAccessExpression, expression.pos);
            propertyAccess.expression = expression;
            propertyAccess.name = parseRightSideOfDot(/*allowIdentifierNames*/ true);
            expression = finishNode(propertyAccess);
        }
        return expression;
    };
    Parser.prototype.parseJsxExpression = function (inExpressionContext) {
        var node = createNode(tokenType_1.TokenType.JsxExpression);
        this.parseExpected(tokenType_1.TokenType.OpenBraceToken);
        if (token !== tokenType_1.TokenType.CloseBraceToken) {
            node.expression = parseAssignmentExpressionOrHigher();
        }
        if (inExpressionContext) {
            this.parseExpected(tokenType_1.TokenType.CloseBraceToken);
        }
        else {
            this.parseExpected(tokenType_1.TokenType.CloseBraceToken, /*message*/ undefined, /*shouldAdvance*/ false);
            scanJsxText();
        }
        return finishNode(node);
    };
    Parser.prototype.parseJsxAttribute = function () {
        if (token === tokenType_1.TokenType.OpenBraceToken) {
            return parseJsxSpreadAttribute();
        }
        scanJsxIdentifier();
        var node = createNode(tokenType_1.TokenType.JsxAttribute);
        node.name = parseIdentifierName();
        if (parseOptional(tokenType_1.TokenType.EqualsToken)) {
            switch (token) {
                case tokenType_1.TokenType.StringLiteral:
                    node.initializer = parseLiteralNode();
                    break;
                default:
                    node.initializer = parseJsxExpression(/*inExpressionContext*/ true);
                    break;
            }
        }
        return finishNode(node);
    };
    Parser.prototype.parseJsxSpreadAttribute = function () {
        var node = createNode(tokenType_1.TokenType.JsxSpreadAttribute);
        this.parseExpected(tokenType_1.TokenType.OpenBraceToken);
        this.parseExpected(tokenType_1.TokenType.DotDotDotToken);
        node.expression = parseExpression();
        this.parseExpected(tokenType_1.TokenType.CloseBraceToken);
        return finishNode(node);
    };
    Parser.prototype.parseJsxClosingElement = function (inExpressionContext) {
        var node = createNode(tokenType_1.TokenType.JsxClosingElement);
        this.parseExpected(tokenType_1.TokenType.LessThanSlashToken);
        node.tagName = parseJsxElementName();
        if (inExpressionContext) {
            this.parseExpected(tokenType_1.TokenType.GreaterThanToken);
        }
        else {
            this.parseExpected(tokenType_1.TokenType.GreaterThanToken, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
            scanJsxText();
        }
        return finishNode(node);
    };
    Parser.prototype.parseTypeAssertion = function () {
        var node = createNode(tokenType_1.TokenType.TypeAssertionExpression);
        this.parseExpected(tokenType_1.TokenType.LessThanToken);
        node.type = parseType();
        this.parseExpected(tokenType_1.TokenType.GreaterThanToken);
        node.expression = parseSimpleUnaryExpression();
        return finishNode(node);
    };
    Parser.prototype.parseMemberExpressionRest = function (expression) {
        while (true) {
            var dotToken = parseOptionalToken(tokenType_1.TokenType.DotToken);
            if (dotToken) {
                var propertyAccess = createNode(tokenType_1.TokenType.PropertyAccessExpression, expression.pos);
                propertyAccess.expression = expression;
                propertyAccess.name = parseRightSideOfDot(/*allowIdentifierNames*/ true);
                expression = finishNode(propertyAccess);
                continue;
            }
            if (token === tokenType_1.TokenType.ExclamationToken && !scanner.hasPrecedingLineBreak()) {
                nextToken();
                var nonNullExpression = createNode(tokenType_1.TokenType.NonNullExpression, expression.pos);
                nonNullExpression.expression = expression;
                expression = finishNode(nonNullExpression);
                continue;
            }
            // when in the [Decorator] context, we do not parse ElementAccess as it could be part of a ComputedPropertyName
            if (!inDecoratorContext() && parseOptional(tokenType_1.TokenType.OpenBracketToken)) {
                var indexedAccess = createNode(tokenType_1.TokenType.ElementAccessExpression, expression.pos);
                indexedAccess.expression = expression;
                // It's not uncommon for a user to write: "new Type[]".
                // Check for that common pattern and report a better error message.
                if (token !== tokenType_1.TokenType.CloseBracketToken) {
                    indexedAccess.argumentExpression = allowInAnd(parseExpression);
                    if (indexedAccess.argumentExpression.kind === tokenType_1.TokenType.StringLiteral || indexedAccess.argumentExpression.kind === tokenType_1.TokenType.NumericLiteral) {
                        var literal = indexedAccess.argumentExpression;
                        literal.text = internIdentifier(literal.text);
                    }
                }
                this.parseExpected(tokenType_1.TokenType.CloseBracketToken);
                expression = finishNode(indexedAccess);
                continue;
            }
            if (token === tokenType_1.TokenType.NoSubstitutionTemplateLiteral || token === tokenType_1.TokenType.TemplateHead) {
                var tagExpression = createNode(tokenType_1.TokenType.TaggedTemplateExpression, expression.pos);
                tagExpression.tag = expression;
                tagExpression.template = token === tokenType_1.TokenType.NoSubstitutionTemplateLiteral
                    ? parseLiteralNode()
                    : parseTemplateExpression();
                expression = finishNode(tagExpression);
                continue;
            }
            return expression;
        }
    };
    Parser.prototype.parseCallExpressionRest = function (expression) {
        while (true) {
            expression = parseMemberExpressionRest(expression);
            if (token === tokenType_1.TokenType.LessThanToken) {
                // See if this is the start of a generic invocation.  If so, consume it and
                // keep checking for postfix expressions.  Otherwise, it's just a '<' that's
                // part of an arithmetic expression.  Break out so we consume it higher in the
                // stack.
                var typeArguments = tryParse(parseTypeArgumentsInExpression);
                if (!typeArguments) {
                    return expression;
                }
                var callExpr = createNode(tokenType_1.TokenType.CallExpression, expression.pos);
                callExpr.expression = expression;
                callExpr.typeArguments = typeArguments;
                callExpr.arguments = parseArgumentList();
                expression = finishNode(callExpr);
                continue;
            }
            else if (token === tokenType_1.TokenType.OpenParenToken) {
                var callExpr = createNode(tokenType_1.TokenType.CallExpression, expression.pos);
                callExpr.expression = expression;
                callExpr.arguments = parseArgumentList();
                expression = finishNode(callExpr);
                continue;
            }
            return expression;
        }
    };
    Parser.prototype.parseArgumentList = function () {
        this.parseExpected(tokenType_1.TokenType.OpenParenToken);
        var result = parseDelimitedList(ParsingContext.ArgumentExpressions, parseArgumentExpression);
        this.parseExpected(tokenType_1.TokenType.CloseParenToken);
        return result;
    };
    Parser.prototype.parseTypeArgumentsInExpression = function () {
        if (!parseOptional(tokenType_1.TokenType.LessThanToken)) {
            return undefined;
        }
        var typeArguments = parseDelimitedList(ParsingContext.TypeArguments, parseType);
        if (!this.parseExpected(tokenType_1.TokenType.GreaterThanToken)) {
            // If it doesn't have the closing >  then it's definitely not an type argument list.
            return undefined;
        }
        // If we have a '<', then only parse this as a argument list if the type arguments
        // are complete and we have an open paren.  if we don't, rewind and return nothing.
        return typeArguments && canFollowTypeArgumentsInExpression()
            ? typeArguments
            : undefined;
    };
    Parser.prototype.canFollowTypeArgumentsInExpression = function () {
        switch (token) {
            case tokenType_1.TokenType.OpenParenToken: // foo<x>(
            // this case are the only case where this token can legally follow a type argument
            // list.  So we definitely want to treat this as a type arg list.
            case tokenType_1.TokenType.DotToken: // foo<x>.
            case tokenType_1.TokenType.CloseParenToken: // foo<x>)
            case tokenType_1.TokenType.CloseBracketToken: // foo<x>]
            case tokenType_1.TokenType.ColonToken: // foo<x>:
            case tokenType_1.TokenType.SemicolonToken: // foo<x>;
            case tokenType_1.TokenType.QuestionToken: // foo<x>?
            case tokenType_1.TokenType.EqualsEqualsToken: // foo<x> ==
            case tokenType_1.TokenType.EqualsEqualsEqualsToken: // foo<x> ===
            case tokenType_1.TokenType.ExclamationEqualsToken: // foo<x> !=
            case tokenType_1.TokenType.ExclamationEqualsEqualsToken: // foo<x> !==
            case tokenType_1.TokenType.AmpersandAmpersandToken: // foo<x> &&
            case tokenType_1.TokenType.BarBarToken: // foo<x> ||
            case tokenType_1.TokenType.CaretToken: // foo<x> ^
            case tokenType_1.TokenType.AmpersandToken: // foo<x> &
            case tokenType_1.TokenType.BarToken: // foo<x> |
            case tokenType_1.TokenType.CloseBraceToken: // foo<x> }
            case tokenType_1.TokenType.EndOfFileToken:
                // these cases can't legally follow a type arg list.  However, they're not legal
                // expressions either.  The user is probably in the middle of a generic type. So
                // treat it as such.
                return true;
            case tokenType_1.TokenType.CommaToken: // foo<x>,
            case tokenType_1.TokenType.OpenBraceToken: // foo<x> {
            // We don't want to treat these as type arguments.  Otherwise we'll parse this
            // as an invocation expression.  Instead, we want to parse out the expression
            // in isolation from the type arguments.
            default:
                // Anything else treat as an expression.
                return false;
        }
    };
    Parser.prototype.parsePrimaryExpression = function () {
        switch (token) {
            case tokenType_1.TokenType.NumericLiteral:
            case tokenType_1.TokenType.StringLiteral:
            case tokenType_1.TokenType.NoSubstitutionTemplateLiteral:
                return parseLiteralNode();
            case tokenType_1.TokenType.ThisKeyword:
            case tokenType_1.TokenType.SuperKeyword:
            case tokenType_1.TokenType.NullKeyword:
            case tokenType_1.TokenType.TrueKeyword:
            case tokenType_1.TokenType.FalseKeyword:
                return parseTokenNode();
            case tokenType_1.TokenType.OpenParenToken:
                return parseParenthesizedExpression();
            case tokenType_1.TokenType.OpenBracketToken:
                return parseArrayLiteralExpression();
            case tokenType_1.TokenType.OpenBraceToken:
                return parseObjectLiteralExpression();
            case tokenType_1.TokenType.AsyncKeyword:
                // Async arrow privates are parsed earlier in parseAssignmentExpressionOrHigher.
                // If we encounter `async [no LineTerminator here] private` then this is an async
                // private; otherwise, its an identifier.
                if (!lookAhead(nextTokenIsFunctionKeywordOnSameLine)) {
                    break;
                }
                return parseFunctionExpression();
            case tokenType_1.TokenType.ClassKeyword:
                return parseClassExpression();
            case tokenType_1.TokenType.FunctionKeyword:
                return parseFunctionExpression();
            case tokenType_1.TokenType.NewKeyword:
                return parseNewExpression();
            case tokenType_1.TokenType.SlashToken:
            case tokenType_1.TokenType.SlashEqualsToken:
                if (reScanSlashToken() === tokenType_1.TokenType.RegularExpressionLiteral) {
                    return parseLiteralNode();
                }
                break;
            case tokenType_1.TokenType.TemplateHead:
                return parseTemplateExpression();
        }
        return parseIdentifier(Diagnostics.Expression_expected);
    };
    Parser.prototype.parseParenthesizedExpression = function () {
        var node = createNode(tokenType_1.TokenType.ParenthesizedExpression);
        this.parseExpected(tokenType_1.TokenType.OpenParenToken);
        node.expression = allowInAnd(parseExpression);
        this.parseExpected(tokenType_1.TokenType.CloseParenToken);
        return finishNode(node);
    };
    Parser.prototype.parseSpreadElement = function () {
        var node = createNode(tokenType_1.TokenType.SpreadElementExpression);
        this.parseExpected(tokenType_1.TokenType.DotDotDotToken);
        node.expression = parseAssignmentExpressionOrHigher();
        return finishNode(node);
    };
    Parser.prototype.parseArgumentOrArrayLiteralElement = function () {
        return token === tokenType_1.TokenType.DotDotDotToken ? parseSpreadElement() :
            token === tokenType_1.TokenType.CommaToken ? createNode(tokenType_1.TokenType.OmittedExpression) :
                parseAssignmentExpressionOrHigher();
    };
    Parser.prototype.parseArgumentExpression = function () {
        return doOutsideOfContext(disallowInAndDecoratorContext, parseArgumentOrArrayLiteralElement);
    };
    Parser.prototype.parseArrayLiteralExpression = function () {
        var node = createNode(tokenType_1.TokenType.ArrayLiteralExpression);
        this.parseExpected(tokenType_1.TokenType.OpenBracketToken);
        if (scanner.hasPrecedingLineBreak()) {
            node.multiLine = true;
        }
        node.elements = parseDelimitedList(ParsingContext.ArrayLiteralMembers, parseArgumentOrArrayLiteralElement);
        this.parseExpected(tokenType_1.TokenType.CloseBracketToken);
        return finishNode(node);
    };
    Parser.prototype.tryParseAccessorDeclaration = function (fullStart, decorators, modifiers) {
        if (parseContextualModifier(tokenType_1.TokenType.GetKeyword)) {
            return addJSDocComment(parseAccessorDeclaration(tokenType_1.TokenType.GetAccessor, fullStart, decorators, modifiers));
        }
        else if (parseContextualModifier(tokenType_1.TokenType.SetKeyword)) {
            return parseAccessorDeclaration(tokenType_1.TokenType.SetAccessor, fullStart, decorators, modifiers);
        }
        return undefined;
    };
    Parser.prototype.parseObjectLiteralElement = function () {
        var fullStart = scanner.getStartPos();
        var decorators = parseDecorators();
        var modifiers = parseModifiers();
        var accessor = tryParseAccessorDeclaration(fullStart, decorators, modifiers);
        if (accessor) {
            return accessor;
        }
        var asteriskToken = parseOptionalToken(tokenType_1.TokenType.AsteriskToken);
        var tokenIsIdentifier = isIdentifier();
        var propertyName = parsePropertyName();
        // Disallowing of optional property assignments happens in the grammar checker.
        var questionToken = parseOptionalToken(tokenType_1.TokenType.QuestionToken);
        if (asteriskToken || token === tokenType_1.TokenType.OpenParenToken || token === tokenType_1.TokenType.LessThanToken) {
            return parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, propertyName, questionToken);
        }
        // check if it is short-hand property assignment or normal property assignment
        // NOTE: if token is EqualsToken it is interpreted as CoverInitializedName production
        // CoverInitializedName[Yield] :
        //     IdentifierReference[?Yield] Initializer[In, ?Yield]
        // this is necessary because ObjectLiteral productions are also used to cover grammar for ObjectAssignmentPattern
        var isShorthandPropertyAssignment = tokenIsIdentifier && (token === tokenType_1.TokenType.CommaToken || token === tokenType_1.TokenType.CloseBraceToken || token === tokenType_1.TokenType.EqualsToken);
        if (isShorthandPropertyAssignment) {
            var shorthandDeclaration = createNode(tokenType_1.TokenType.ShorthandPropertyAssignment, fullStart);
            shorthandDeclaration.name = propertyName;
            shorthandDeclaration.questionToken = questionToken;
            var equalsToken = parseOptionalToken(tokenType_1.TokenType.EqualsToken);
            if (equalsToken) {
                shorthandDeclaration.equalsToken = equalsToken;
                shorthandDeclaration.objectAssignmentInitializer = allowInAnd(parseAssignmentExpressionOrHigher);
            }
            return addJSDocComment(finishNode(shorthandDeclaration));
        }
        else {
            var propertyAssignment = createNode(tokenType_1.TokenType.PropertyAssignment, fullStart);
            propertyAssignment.modifiers = modifiers;
            propertyAssignment.name = propertyName;
            propertyAssignment.questionToken = questionToken;
            this.parseExpected(tokenType_1.TokenType.ColonToken);
            propertyAssignment.initializer = allowInAnd(parseAssignmentExpressionOrHigher);
            return addJSDocComment(finishNode(propertyAssignment));
        }
    };
    Parser.prototype.parseObjectLiteralExpression = function () {
        var node = createNode(tokenType_1.TokenType.ObjectLiteralExpression);
        this.parseExpected(tokenType_1.TokenType.OpenBraceToken);
        if (scanner.hasPrecedingLineBreak()) {
            node.multiLine = true;
        }
        node.properties = parseDelimitedList(ParsingContext.ObjectLiteralMembers, parseObjectLiteralElement, /*considerSemicolonAsDelimiter*/ true);
        this.parseExpected(tokenType_1.TokenType.CloseBraceToken);
        return finishNode(node);
    };
    Parser.prototype.parseFunctionExpression = function () {
        // GeneratorExpression:
        //      private* BindingIdentifier [Yield][opt](FormalParameters[Yield]){ GeneratorBody }
        //
        // FunctionExpression:
        //      private BindingIdentifier[opt](FormalParameters){ FunctionBody }
        var saveDecoratorContext = inDecoratorContext();
        if (saveDecoratorContext) {
            setDecoratorContext(/*val*/ false);
        }
        var node = createNode(tokenType_1.TokenType.FunctionExpression);
        setModifiers(node, parseModifiers());
        this.parseExpected(tokenType_1.TokenType.FunctionKeyword);
        node.asteriskToken = parseOptionalToken(tokenType_1.TokenType.AsteriskToken);
        var isGenerator = !!node.asteriskToken;
        var isAsync = !!(node.flags & NodeFlags.Async);
        node.name =
            isGenerator && isAsync ? doInYieldAndAwaitContext(parseOptionalIdentifier) :
                isGenerator ? doInYieldContext(parseOptionalIdentifier) :
                    isAsync ? doInAwaitContext(parseOptionalIdentifier) :
                        parseOptionalIdentifier();
        fillSignature(tokenType_1.TokenType.ColonToken, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, node);
        node.body = parseFunctionBlock(/*allowYield*/ isGenerator, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);
        if (saveDecoratorContext) {
            setDecoratorContext(/*val*/ true);
        }
        return addJSDocComment(finishNode(node));
    };
    Parser.prototype.parseOptionalIdentifier = function () {
        return isIdentifier() ? parseIdentifier() : undefined;
    };
    Parser.prototype.parseNewExpression = function () {
        var node = createNode(tokenType_1.TokenType.NewExpression);
        this.parseExpected(tokenType_1.TokenType.NewKeyword);
        node.expression = parseMemberExpressionOrHigher();
        node.typeArguments = tryParse(parseTypeArgumentsInExpression);
        if (node.typeArguments || token === tokenType_1.TokenType.OpenParenToken) {
            node.arguments = parseArgumentList();
        }
        return finishNode(node);
    };
    // STATEMENTS
    Parser.prototype.parseBlock = function (ignoreMissingOpenBrace, diagnosticMessage) {
        var node = createNode(tokenType_1.TokenType.Block);
        if (this.parseExpected(tokenType_1.TokenType.OpenBraceToken, diagnosticMessage) || ignoreMissingOpenBrace) {
            node.statements = parseList(ParsingContext.BlockStatements, parseStatement);
            this.parseExpected(tokenType_1.TokenType.CloseBraceToken);
        }
        else {
            node.statements = createMissingList();
        }
        return finishNode(node);
    };
    Parser.prototype.parseFunctionBlock = function (allowYield, allowAwait, ignoreMissingOpenBrace, diagnosticMessage) {
        var savedYieldContext = inYieldContext();
        setYieldContext(allowYield);
        var savedAwaitContext = inAwaitContext();
        setAwaitContext(allowAwait);
        // We may be in a [Decorator] context when parsing a private expression or
        // arrow private. The body of the private is not in [Decorator] context.
        var saveDecoratorContext = inDecoratorContext();
        if (saveDecoratorContext) {
            setDecoratorContext(/*val*/ false);
        }
        var block = parseBlock(ignoreMissingOpenBrace, diagnosticMessage);
        if (saveDecoratorContext) {
            setDecoratorContext(/*val*/ true);
        }
        setYieldContext(savedYieldContext);
        setAwaitContext(savedAwaitContext);
        return block;
    };
    Parser.prototype.parseIfStatement = function () {
        // IfStatement :
        //   if Condition EmbeddedStatement
        //   if Condition EmbeddedStatement else EmbeddedStatement
        var result = new ast.IfStatement();
        result.start = this.lexer.tokenStart;
        this.parseExpected(tokenType_1.TokenType.if);
        result.condition = this.parseCondition();
        result.thenClause = this.parseEmbeddedStatement();
        if (this.parseOptional(tokenType_1.TokenType.else)) {
            result.elseClause = this.parseEmbeddedStatement();
        }
        return result;
    };
    /**
     * 解析条件部分。
     */
    Parser.prototype.parseCondition = function () {
        // Condition :
        //   ( BooleanExpression )
        var result;
        if (this.parseOptional(tokenType_1.TokenType.openParen)) {
            result = this.parseExpression(0);
            this.parseExpected(tokenType_1.TokenType.closeParen);
        }
        else {
            if (Compiler.options.disallowMissingParentheses) {
                this.reportSyntaxError("严格模式: 应输入“(”");
            }
            result = this.parseExpression();
        }
        return result;
    };
    Parser.prototype.parseEmbeddedStatement = function () {
        // EmbeddedStatement :
        //   Statement except VariableStatement and LabeledStatement 
        var result = this.parseStatement();
        //if (result == null) {
        //    Compiler.error(ErrorCode.expectedStatement, "语法错误：应输入语句", lexer.peek());
        //} else if (result is VariableStatement) {
        //    Compiler.error(ErrorCode.invalidVariableStatement, "嵌套语句不能是变量声明语句；应使用“{}”包围", ((VariableStatement)result).type);
        //} else if (result is LabeledStatement) {
        //    Compiler.error(ErrorCode.invalidLabeledStatement, "嵌套语句不能是标签语句；应使用“{}”包围", ((LabeledStatement)result).label);
        //}
        //if (result is Semicolon && lexer.peek().type == TokenType.lBrace) {
        //    Compiler.warning(ErrorCode.confusedSemicolon, "此分号可能是多余的", lexer.current.startLocation, lexer.current.endLocation);
        //}
        return result;
    };
    Parser.prototype.parseDoWhileStatement = function () {
        // DoWhileStatement :
        //   do EmbeddedStatement while Condition ;
        var result = new ast.DoWhileStatement();
        result.start = this.lexer.tokenStart;
        this.parseExpected(tokenType_1.TokenType.do);
        result.body = this.parseEmbeddedStatement();
        this.parseExpected(tokenType_1.TokenType.while);
        result.condition = this.parseCondition();
        // From: https://mail.mozilla.org/pipermail/es-discuss/2011-August/016188.html
        // 157 min --- All allen at wirfs-brock.com CONF --- "do{;}while(false)false" prohibited in
        // spec but allowed in consensus reality. Approved -- this is the de-facto standard whereby
        //  do;while(0)x will have a semicolon inserted before x.
        this.parseOptional(tokenType_1.TokenType.semicolon);
        result.end = this.lexer.tokenEnd;
        return result;
    };
    Parser.prototype.parseWhileStatement = function () {
        // WhileStatement :
        //   while Condition EmbeddedStatement ;
        var result = new ast.WhileStatement();
        result.start = this.lexer.tokenStart;
        this.parseExpected(tokenType_1.TokenType.while);
        result.condition = this.parseCondition();
        result.body = this.parseEmbeddedStatement();
        return result;
    };
    Parser.prototype.parseForStatement = function () {
        // ForStatement :
        //   for ( VariableOrExpression? ; Expression? ; Expression? ) EmbeddedStatement
        //   for ( VaribaleDeclartionList in Expression ) EmbeddedStatement
        //   for ( Identifier: Type = Expression to Expression ) EmbeddedStatement
        var pos = getNodePos();
        this.parseExpected(tokenType_1.TokenType.ForKeyword);
        this.parseExpected(tokenType_1.TokenType.OpenParenToken);
        var initializer = undefined;
        if (token !== tokenType_1.TokenType.SemicolonToken) {
            if (token === tokenType_1.TokenType.VarKeyword || token === tokenType_1.TokenType.LetKeyword || token === tokenType_1.TokenType.ConstKeyword) {
                initializer = parseVariableDeclarationList(/*inForStatementInitializer*/ true);
            }
            else {
                initializer = disallowInAnd(parseExpression);
            }
        }
        var forOrForInOrForOfStatement;
        if (parseOptional(tokenType_1.TokenType.InKeyword)) {
            var forInStatement = createNode(tokenType_1.TokenType.ForInStatement, pos);
            forInStatement.initializer = initializer;
            forInStatement.expression = allowInAnd(parseExpression);
            this.parseExpected(tokenType_1.TokenType.CloseParenToken);
            forOrForInOrForOfStatement = forInStatement;
        }
        else if (parseOptional(tokenType_1.TokenType.OfKeyword)) {
            var forOfStatement = createNode(tokenType_1.TokenType.ForOfStatement, pos);
            forOfStatement.initializer = initializer;
            forOfStatement.expression = allowInAnd(parseAssignmentExpressionOrHigher);
            this.parseExpected(tokenType_1.TokenType.CloseParenToken);
            forOrForInOrForOfStatement = forOfStatement;
        }
        else {
            var forStatement = createNode(tokenType_1.TokenType.ForStatement, pos);
            forStatement.initializer = initializer;
            this.parseExpected(tokenType_1.TokenType.SemicolonToken);
            if (token !== tokenType_1.TokenType.SemicolonToken && token !== tokenType_1.TokenType.CloseParenToken) {
                forStatement.condition = allowInAnd(parseExpression);
            }
            this.parseExpected(tokenType_1.TokenType.SemicolonToken);
            if (token !== tokenType_1.TokenType.CloseParenToken) {
                forStatement.incrementor = allowInAnd(parseExpression);
            }
            this.parseExpected(tokenType_1.TokenType.CloseParenToken);
            forOrForInOrForOfStatement = forStatement;
        }
        forOrForInOrForOfStatement.statement = parseStatement();
        return finishNode(forOrForInOrForOfStatement);
    };
    Parser.prototype.parseBreakStatement = function () {
        // BreakStatement :
        //   break ;
        var result = new ast.BreakStatement();
        result.start = this.lexer.tokenStart;
        this.parseExpected(tokenType_1.TokenType.break);
        if (!this.autoInsertSemicolon()) {
            result.label = this.parseIdentifier();
        }
        this.parseOptional(tokenType_1.TokenType.semicolon);
        result.end = this.lexer.tokenEnd;
        return result;
    };
    Parser.prototype.parseContinueStatement = function (kind) {
        // ContinueStatement :
        //   continue ;
        var result = new ast.ContinueStatement();
        result.start = this.lexer.tokenStart;
        this.parseExpected(tokenType_1.TokenType.continue);
        if (!this.autoInsertSemicolon()) {
            result.label = this.parseIdentifier();
        }
        this.parseOptional(tokenType_1.TokenType.semicolon);
        result.end = this.lexer.tokenEnd;
        return result;
    };
    Parser.prototype.parseReturnStatement = function () {
        // ReturnStatement :
        //   return Expression? ;
        var result = new ast.ReturnStatement();
        result.start = this.lexer.tokenStart;
        this.parseExpected(tokenType_1.TokenType.return);
        if (!this.autoInsertSemicolon()) {
            result.value = this.parseExpression(true);
        }
        parseSemicolon();
        return finishNode(node);
    };
    Parser.prototype.parseWithStatement = function () {
        var node = createNode(tokenType_1.TokenType.WithStatement);
        this.parseExpected(tokenType_1.TokenType.WithKeyword);
        this.parseExpected(tokenType_1.TokenType.OpenParenToken);
        node.expression = allowInAnd(parseExpression);
        this.parseExpected(tokenType_1.TokenType.CloseParenToken);
        node.statement = parseStatement();
        return finishNode(node);
    };
    Parser.prototype.parseCaseClause = function () {
        var node = createNode(tokenType_1.TokenType.CaseClause);
        this.parseExpected(tokenType_1.TokenType.CaseKeyword);
        node.expression = allowInAnd(parseExpression);
        this.parseExpected(tokenType_1.TokenType.ColonToken);
        node.statements = parseList(ParsingContext.SwitchClauseStatements, parseStatement);
        return finishNode(node);
    };
    Parser.prototype.parseDefaultClause = function () {
        var node = createNode(tokenType_1.TokenType.DefaultClause);
        this.parseExpected(tokenType_1.TokenType.DefaultKeyword);
        this.parseExpected(tokenType_1.TokenType.ColonToken);
        node.statements = parseList(ParsingContext.SwitchClauseStatements, parseStatement);
        return finishNode(node);
    };
    Parser.prototype.parseCaseOrDefaultClause = function () {
        return token === tokenType_1.TokenType.CaseKeyword ? parseCaseClause() : parseDefaultClause();
    };
    Parser.prototype.parseSwitchStatement = function () {
        var node = createNode(tokenType_1.TokenType.SwitchStatement);
        this.parseExpected(tokenType_1.TokenType.SwitchKeyword);
        this.parseExpected(tokenType_1.TokenType.OpenParenToken);
        node.expression = allowInAnd(parseExpression);
        this.parseExpected(tokenType_1.TokenType.CloseParenToken);
        var caseBlock = createNode(tokenType_1.TokenType.CaseBlock, scanner.getStartPos());
        this.parseExpected(tokenType_1.TokenType.OpenBraceToken);
        caseBlock.clauses = parseList(ParsingContext.SwitchClauses, parseCaseOrDefaultClause);
        this.parseExpected(tokenType_1.TokenType.CloseBraceToken);
        node.caseBlock = finishNode(caseBlock);
        return finishNode(node);
    };
    Parser.prototype.parseThrowStatement = function () {
        // ThrowStatement[Yield] :
        //      throw [no LineTerminator here]Expression[In, ?Yield];
        // Because of automatic semicolon insertion, we need to report error if this
        // throw could be terminated with a semicolon.  Note: we can't call 'parseExpression'
        // directly as that might consume an expression on the following line.
        // We just return 'undefined' in that case.  The actual error will be reported in the
        // grammar walker.
        var node = createNode(tokenType_1.TokenType.ThrowStatement);
        this.parseExpected(tokenType_1.TokenType.ThrowKeyword);
        node.expression = scanner.hasPrecedingLineBreak() ? undefined : allowInAnd(parseExpression);
        parseSemicolon();
        return finishNode(node);
    };
    // TODO: Review for error recovery
    Parser.prototype.parseTryStatement = function () {
        var node = createNode(tokenType_1.TokenType.TryStatement);
        this.parseExpected(tokenType_1.TokenType.TryKeyword);
        node.tryBlock = parseBlock(/*ignoreMissingOpenBrace*/ false);
        node.catchClause = token === tokenType_1.TokenType.CatchKeyword ? parseCatchClause() : undefined;
        // If we don't have a catch clause, then we must have a finally clause.  Try to parse
        // one out no matter what.
        if (!node.catchClause || token === tokenType_1.TokenType.FinallyKeyword) {
            this.parseExpected(tokenType_1.TokenType.FinallyKeyword);
            node.finallyBlock = parseBlock(/*ignoreMissingOpenBrace*/ false);
        }
        return finishNode(node);
    };
    Parser.prototype.parseCatchClause = function () {
        var result = createNode(tokenType_1.TokenType.CatchClause);
        this.parseExpected(tokenType_1.TokenType.CatchKeyword);
        if (this.parseExpected(tokenType_1.TokenType.OpenParenToken)) {
            result.variableDeclaration = parseVariableDeclaration();
        }
        this.parseExpected(tokenType_1.TokenType.CloseParenToken);
        result.block = parseBlock(/*ignoreMissingOpenBrace*/ false);
        return finishNode(result);
    };
    Parser.prototype.parseDebuggerStatement = function () {
        var node = createNode(tokenType_1.TokenType.DebuggerStatement);
        this.parseExpected(tokenType_1.TokenType.DebuggerKeyword);
        parseSemicolon();
        return finishNode(node);
    };
    Parser.prototype.parseExpressionOrLabeledStatement = function () {
        // Avoiding having to do the lookahead for a labeled statement by just trying to parse
        // out an expression, seeing if it is identifier and then seeing if it is followed by
        // a colon.
        var fullStart = scanner.getStartPos();
        var expression = allowInAnd(parseExpression);
        if (expression.kind === tokenType_1.TokenType.Identifier && parseOptional(tokenType_1.TokenType.ColonToken)) {
            var labeledStatement = createNode(tokenType_1.TokenType.LabeledStatement, fullStart);
            labeledStatement.label = expression;
            labeledStatement.statement = parseStatement();
            return addJSDocComment(finishNode(labeledStatement));
        }
        else {
            var expressionStatement = createNode(tokenType_1.TokenType.ExpressionStatement, fullStart);
            expressionStatement.expression = expression;
            parseSemicolon();
            return addJSDocComment(finishNode(expressionStatement));
        }
    };
    Parser.prototype.nextTokenIsIdentifierOrKeywordOnSameLine = function () {
        nextToken();
        return tokenIsIdentifierOrKeyword(token) && !scanner.hasPrecedingLineBreak();
    };
    Parser.prototype.nextTokenIsFunctionKeywordOnSameLine = function () {
        nextToken();
        return token === tokenType_1.TokenType.FunctionKeyword && !scanner.hasPrecedingLineBreak();
    };
    Parser.prototype.nextTokenIsIdentifierOrKeywordOrNumberOnSameLine = function () {
        nextToken();
        return (tokenIsIdentifierOrKeyword(token) || token === tokenType_1.TokenType.NumericLiteral) && !scanner.hasPrecedingLineBreak();
    };
    Parser.prototype.isDeclaration = function () {
        while (true) {
            switch (token) {
                case tokenType_1.TokenType.VarKeyword:
                case tokenType_1.TokenType.LetKeyword:
                case tokenType_1.TokenType.ConstKeyword:
                case tokenType_1.TokenType.FunctionKeyword:
                case tokenType_1.TokenType.ClassKeyword:
                case tokenType_1.TokenType.EnumKeyword:
                    return true;
                // 'declare', 'module', 'namespace', 'interface'* and 'type' are all legal JavaScript identifiers;
                // however, an identifier cannot be followed by another identifier on the same line. This is what we
                // count on to parse out the respective declarations. For instance, we exploit this to say that
                //
                //    namespace n
                //
                // can be none other than the beginning of a namespace declaration, but need to respect that JavaScript sees
                //
                //    namespace
                //    n
                //
                // as the identifier 'namespace' on one line followed by the identifier 'n' on another.
                // We need to look one token ahead to see if it permissible to try parsing a declaration.
                //
                // *Note*: 'interface' is actually a strict mode reserved word. So while
                //
                //   "use strict"
                //   interface
                //   I {}
                //
                // could be legal, it would add complexity for very little gain.
                case tokenType_1.TokenType.InterfaceKeyword:
                case tokenType_1.TokenType.TypeKeyword:
                    return nextTokenIsIdentifierOnSameLine();
                case tokenType_1.TokenType.ModuleKeyword:
                case tokenType_1.TokenType.NamespaceKeyword:
                    return nextTokenIsIdentifierOrStringLiteralOnSameLine();
                case tokenType_1.TokenType.AbstractKeyword:
                case tokenType_1.TokenType.AsyncKeyword:
                case tokenType_1.TokenType.DeclareKeyword:
                case tokenType_1.TokenType.PrivateKeyword:
                case tokenType_1.TokenType.ProtectedKeyword:
                case tokenType_1.TokenType.PublicKeyword:
                case tokenType_1.TokenType.ReadonlyKeyword:
                    nextToken();
                    // ASI takes effect for this modifier.
                    if (scanner.hasPrecedingLineBreak()) {
                        return false;
                    }
                    continue;
                case tokenType_1.TokenType.GlobalKeyword:
                    nextToken();
                    return token === tokenType_1.TokenType.OpenBraceToken || token === tokenType_1.TokenType.Identifier || token === tokenType_1.TokenType.ExportKeyword;
                case tokenType_1.TokenType.ImportKeyword:
                    nextToken();
                    return token === tokenType_1.TokenType.StringLiteral || token === tokenType_1.TokenType.AsteriskToken ||
                        token === tokenType_1.TokenType.OpenBraceToken || tokenIsIdentifierOrKeyword(token);
                case tokenType_1.TokenType.ExportKeyword:
                    nextToken();
                    if (token === tokenType_1.TokenType.EqualsToken || token === tokenType_1.TokenType.AsteriskToken ||
                        token === tokenType_1.TokenType.OpenBraceToken || token === tokenType_1.TokenType.DefaultKeyword ||
                        token === tokenType_1.TokenType.AsKeyword) {
                        return true;
                    }
                    continue;
                case tokenType_1.TokenType.StaticKeyword:
                    nextToken();
                    continue;
                default:
                    return false;
            }
        }
    };
    Parser.prototype.isStartOfDeclaration = function () {
        return lookAhead(isDeclaration);
    };
    Parser.prototype.isStartOfStatement = function () {
        switch (token) {
            case tokenType_1.TokenType.AtToken:
            case tokenType_1.TokenType.SemicolonToken:
            case tokenType_1.TokenType.OpenBraceToken:
            case tokenType_1.TokenType.VarKeyword:
            case tokenType_1.TokenType.LetKeyword:
            case tokenType_1.TokenType.FunctionKeyword:
            case tokenType_1.TokenType.ClassKeyword:
            case tokenType_1.TokenType.EnumKeyword:
            case tokenType_1.TokenType.IfKeyword:
            case tokenType_1.TokenType.DoKeyword:
            case tokenType_1.TokenType.WhileKeyword:
            case tokenType_1.TokenType.ForKeyword:
            case tokenType_1.TokenType.ContinueKeyword:
            case tokenType_1.TokenType.BreakKeyword:
            case tokenType_1.TokenType.ReturnKeyword:
            case tokenType_1.TokenType.WithKeyword:
            case tokenType_1.TokenType.SwitchKeyword:
            case tokenType_1.TokenType.ThrowKeyword:
            case tokenType_1.TokenType.TryKeyword:
            case tokenType_1.TokenType.DebuggerKeyword:
            // 'catch' and 'finally' do not actually indicate that the code is part of a statement,
            // however, we say they are here so that we may gracefully parse them and error later.
            case tokenType_1.TokenType.CatchKeyword:
            case tokenType_1.TokenType.FinallyKeyword:
                return true;
            case tokenType_1.TokenType.ConstKeyword:
            case tokenType_1.TokenType.ExportKeyword:
            case tokenType_1.TokenType.ImportKeyword:
                return isStartOfDeclaration();
            case tokenType_1.TokenType.AsyncKeyword:
            case tokenType_1.TokenType.DeclareKeyword:
            case tokenType_1.TokenType.InterfaceKeyword:
            case tokenType_1.TokenType.ModuleKeyword:
            case tokenType_1.TokenType.NamespaceKeyword:
            case tokenType_1.TokenType.TypeKeyword:
            case tokenType_1.TokenType.GlobalKeyword:
                // When these don't start a declaration, they're an identifier in an expression statement
                return true;
            case tokenType_1.TokenType.PublicKeyword:
            case tokenType_1.TokenType.PrivateKeyword:
            case tokenType_1.TokenType.ProtectedKeyword:
            case tokenType_1.TokenType.StaticKeyword:
            case tokenType_1.TokenType.ReadonlyKeyword:
                // When these don't start a declaration, they may be the start of a class member if an identifier
                // immediately follows. Otherwise they're an identifier in an expression statement.
                return isStartOfDeclaration() || !lookAhead(nextTokenIsIdentifierOrKeywordOnSameLine);
            default:
                return fallowsExpression();
        }
    };
    Parser.prototype.nextTokenIsIdentifierOrStartOfDestructuring = function () {
        nextToken();
        return isIdentifier() || token === tokenType_1.TokenType.OpenBraceToken || token === tokenType_1.TokenType.OpenBracketToken;
    };
    Parser.prototype.isLetDeclaration = function () {
        // In ES6 'let' always starts a lexical declaration if followed by an identifier or {
        // or [.
        return lookAhead(nextTokenIsIdentifierOrStartOfDestructuring);
    };
    Parser.prototype.parseStatement = function () {
        switch (token) {
            case tokenType_1.TokenType.SemicolonToken:
                return parseEmptyStatement();
            case tokenType_1.TokenType.OpenBraceToken:
                return parseBlock(/*ignoreMissingOpenBrace*/ false);
            case tokenType_1.TokenType.VarKeyword:
                return parseVariableStatement(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case tokenType_1.TokenType.LetKeyword:
                if (isLetDeclaration()) {
                    return parseVariableStatement(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
                }
                break;
            case tokenType_1.TokenType.FunctionKeyword:
                return parseFunctionDeclaration(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case tokenType_1.TokenType.ClassKeyword:
                return parseClassDeclaration(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case tokenType_1.TokenType.IfKeyword:
                return parseIfStatement();
            case tokenType_1.TokenType.DoKeyword:
                return parseDoStatement();
            case tokenType_1.TokenType.WhileKeyword:
                return parseWhileStatement();
            case tokenType_1.TokenType.ForKeyword:
                return parseForOrForInOrForOfStatement();
            case tokenType_1.TokenType.ContinueKeyword:
                return parseBreakOrContinueStatement(tokenType_1.TokenType.ContinueStatement);
            case tokenType_1.TokenType.BreakKeyword:
                return parseBreakOrContinueStatement(tokenType_1.TokenType.BreakStatement);
            case tokenType_1.TokenType.ReturnKeyword:
                return parseReturnStatement();
            case tokenType_1.TokenType.WithKeyword:
                return parseWithStatement();
            case tokenType_1.TokenType.SwitchKeyword:
                return parseSwitchStatement();
            case tokenType_1.TokenType.ThrowKeyword:
                return parseThrowStatement();
            case tokenType_1.TokenType.TryKeyword:
            // Include 'catch' and 'finally' for error recovery.
            case tokenType_1.TokenType.CatchKeyword:
            case tokenType_1.TokenType.FinallyKeyword:
                return parseTryStatement();
            case tokenType_1.TokenType.DebuggerKeyword:
                return parseDebuggerStatement();
            case tokenType_1.TokenType.AtToken:
                return parseDeclaration();
            case tokenType_1.TokenType.AsyncKeyword:
            case tokenType_1.TokenType.InterfaceKeyword:
            case tokenType_1.TokenType.TypeKeyword:
            case tokenType_1.TokenType.ModuleKeyword:
            case tokenType_1.TokenType.NamespaceKeyword:
            case tokenType_1.TokenType.DeclareKeyword:
            case tokenType_1.TokenType.ConstKeyword:
            case tokenType_1.TokenType.EnumKeyword:
            case tokenType_1.TokenType.ExportKeyword:
            case tokenType_1.TokenType.ImportKeyword:
            case tokenType_1.TokenType.PrivateKeyword:
            case tokenType_1.TokenType.ProtectedKeyword:
            case tokenType_1.TokenType.PublicKeyword:
            case tokenType_1.TokenType.AbstractKeyword:
            case tokenType_1.TokenType.StaticKeyword:
            case tokenType_1.TokenType.ReadonlyKeyword:
            case tokenType_1.TokenType.GlobalKeyword:
                if (isStartOfDeclaration()) {
                    return parseDeclaration();
                }
                break;
        }
        return parseExpressionOrLabeledStatement();
    };
    Parser.prototype.parseDeclaration = function () {
        var fullStart = getNodePos();
        var decorators = parseDecorators();
        var modifiers = parseModifiers();
        switch (token) {
            case tokenType_1.TokenType.VarKeyword:
            case tokenType_1.TokenType.LetKeyword:
            case tokenType_1.TokenType.ConstKeyword:
                return parseVariableStatement(fullStart, decorators, modifiers);
            case tokenType_1.TokenType.FunctionKeyword:
                return parseFunctionDeclaration(fullStart, decorators, modifiers);
            case tokenType_1.TokenType.ClassKeyword:
                return parseClassDeclaration(fullStart, decorators, modifiers);
            case tokenType_1.TokenType.InterfaceKeyword:
                return parseInterfaceDeclaration(fullStart, decorators, modifiers);
            case tokenType_1.TokenType.TypeKeyword:
                return parseTypeAliasDeclaration(fullStart, decorators, modifiers);
            case tokenType_1.TokenType.EnumKeyword:
                return parseEnumDeclaration(fullStart, decorators, modifiers);
            case tokenType_1.TokenType.GlobalKeyword:
            case tokenType_1.TokenType.ModuleKeyword:
            case tokenType_1.TokenType.NamespaceKeyword:
                return parseModuleDeclaration(fullStart, decorators, modifiers);
            case tokenType_1.TokenType.ImportKeyword:
                return parseImportDeclarationOrImportEqualsDeclaration(fullStart, decorators, modifiers);
            case tokenType_1.TokenType.ExportKeyword:
                nextToken();
                switch (token) {
                    case tokenType_1.TokenType.DefaultKeyword:
                    case tokenType_1.TokenType.EqualsToken:
                        return parseExportAssignment(fullStart, decorators, modifiers);
                    case tokenType_1.TokenType.AsKeyword:
                        return parseNamespaceExportDeclaration(fullStart, decorators, modifiers);
                    default:
                        return parseExportDeclaration(fullStart, decorators, modifiers);
                }
            default:
                if (decorators || modifiers) {
                    // We reached this point because we encountered decorators and/or modifiers and assumed a declaration
                    // would follow. For recovery and error reporting purposes, return an incomplete declaration.
                    var node = createMissingNode(tokenType_1.TokenType.MissingDeclaration, /*reportAtCurrentPosition*/ true, Diagnostics.Declaration_expected);
                    node.pos = fullStart;
                    node.decorators = decorators;
                    setModifiers(node, modifiers);
                    return finishNode(node);
                }
        }
    };
    Parser.prototype.nextTokenIsIdentifierOrStringLiteralOnSameLine = function () {
        nextToken();
        return !scanner.hasPrecedingLineBreak() && (isIdentifier() || token === tokenType_1.TokenType.StringLiteral);
    };
    Parser.prototype.parseFunctionBlockOrSemicolon = function (isGenerator, isAsync, diagnosticMessage) {
        if (token !== tokenType_1.TokenType.OpenBraceToken && autoInsertSemicolon()) {
            parseSemicolon();
            return;
        }
        return parseFunctionBlock(isGenerator, isAsync, /*ignoreMissingOpenBrace*/ false, diagnosticMessage);
    };
    // DECLARATIONS
    Parser.prototype.parseArrayBindingElement = function () {
        if (token === tokenType_1.TokenType.CommaToken) {
            return createNode(tokenType_1.TokenType.OmittedExpression);
        }
        var node = createNode(tokenType_1.TokenType.BindingElement);
        node.dotDotDotToken = parseOptionalToken(tokenType_1.TokenType.DotDotDotToken);
        node.name = parseIdentifierOrPattern();
        node.initializer = parseBindingElementInitializer(/*inParameter*/ false);
        return finishNode(node);
    };
    Parser.prototype.parseObjectBindingElement = function () {
        var node = createNode(tokenType_1.TokenType.BindingElement);
        var tokenIsIdentifier = isIdentifier();
        var propertyName = parsePropertyName();
        if (tokenIsIdentifier && token !== tokenType_1.TokenType.ColonToken) {
            node.name = propertyName;
        }
        else {
            this.parseExpected(tokenType_1.TokenType.ColonToken);
            node.propertyName = propertyName;
            node.name = parseIdentifierOrPattern();
        }
        node.initializer = parseBindingElementInitializer(/*inParameter*/ false);
        return finishNode(node);
    };
    Parser.prototype.parseObjectBindingPattern = function () {
        var node = createNode(tokenType_1.TokenType.ObjectBindingPattern);
        this.parseExpected(tokenType_1.TokenType.OpenBraceToken);
        node.elements = parseDelimitedList(ParsingContext.ObjectBindingElements, parseObjectBindingElement);
        this.parseExpected(tokenType_1.TokenType.CloseBraceToken);
        return finishNode(node);
    };
    Parser.prototype.parseArrayBindingPattern = function () {
        var node = createNode(tokenType_1.TokenType.ArrayBindingPattern);
        this.parseExpected(tokenType_1.TokenType.OpenBracketToken);
        node.elements = parseDelimitedList(ParsingContext.ArrayBindingElements, parseArrayBindingElement);
        this.parseExpected(tokenType_1.TokenType.CloseBracketToken);
        return finishNode(node);
    };
    Parser.prototype.isIdentifierOrPattern = function () {
        return token === tokenType_1.TokenType.OpenBraceToken || token === tokenType_1.TokenType.OpenBracketToken || isIdentifier();
    };
    Parser.prototype.parseIdentifierOrPattern = function () {
        if (token === tokenType_1.TokenType.OpenBracketToken) {
            return parseArrayBindingPattern();
        }
        if (token === tokenType_1.TokenType.OpenBraceToken) {
            return parseObjectBindingPattern();
        }
        return parseIdentifier();
    };
    Parser.prototype.parseVariableDeclaration = function () {
        var node = createNode(tokenType_1.TokenType.VariableDeclaration);
        node.name = parseIdentifierOrPattern();
        node.type = parseTypeAnnotation();
        if (!isInOrOfKeyword(token)) {
            node.initializer = parseInitializer(/*inParameter*/ false);
        }
        return finishNode(node);
    };
    Parser.prototype.parseVariableDeclarationList = function (inForStatementInitializer) {
        var node = createNode(tokenType_1.TokenType.VariableDeclarationList);
        switch (token) {
            case tokenType_1.TokenType.VarKeyword:
                break;
            case tokenType_1.TokenType.LetKeyword:
                node.flags |= NodeFlags.Let;
                break;
            case tokenType_1.TokenType.ConstKeyword:
                node.flags |= NodeFlags.Const;
                break;
            default:
                Debug.fail();
        }
        nextToken();
        // The user may have written the following:
        //
        //    for (let of X) { }
        //
        // In this case, we want to parse an empty declaration list, and then parse 'of'
        // as a keyword. The reason this is not automatic is that 'of' is a valid identifier.
        // So we need to look ahead to determine if 'of' should be treated as a keyword in
        // this context.
        // The checker will then give an error that there is an empty declaration list.
        if (token === tokenType_1.TokenType.OfKeyword && lookAhead(canFollowContextualOfKeyword)) {
            node.declarations = createMissingList();
        }
        else {
            var savedDisallowIn = inDisallowInContext();
            setDisallowInContext(inForStatementInitializer);
            node.declarations = parseDelimitedList(ParsingContext.VariableDeclarations, parseVariableDeclaration);
            setDisallowInContext(savedDisallowIn);
        }
        return finishNode(node);
    };
    Parser.prototype.canFollowContextualOfKeyword = function () {
        return nextTokenIsIdentifier() && nextToken() === tokenType_1.TokenType.CloseParenToken;
    };
    Parser.prototype.parseVariableStatement = function (fullStart, decorators, modifiers) {
        var node = createNode(tokenType_1.TokenType.VariableStatement, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        node.declarationList = parseVariableDeclarationList(/*inForStatementInitializer*/ false);
        parseSemicolon();
        return addJSDocComment(finishNode(node));
    };
    Parser.prototype.parseFunctionDeclaration = function (fullStart, decorators, modifiers) {
        var node = createNode(tokenType_1.TokenType.FunctionDeclaration, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        this.parseExpected(tokenType_1.TokenType.FunctionKeyword);
        node.asteriskToken = parseOptionalToken(tokenType_1.TokenType.AsteriskToken);
        node.name = node.flags & NodeFlags.Default ? parseOptionalIdentifier() : parseIdentifier();
        var isGenerator = !!node.asteriskToken;
        var isAsync = !!(node.flags & NodeFlags.Async);
        fillSignature(tokenType_1.TokenType.ColonToken, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, node);
        node.body = parseFunctionBlockOrSemicolon(isGenerator, isAsync, Diagnostics.or_expected);
        return addJSDocComment(finishNode(node));
    };
    Parser.prototype.parseConstructorDeclaration = function (pos, decorators, modifiers) {
        var node = createNode(tokenType_1.TokenType.Constructor, pos);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        this.parseExpected(tokenType_1.TokenType.ConstructorKeyword);
        fillSignature(tokenType_1.TokenType.ColonToken, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
        node.body = parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false, Diagnostics.or_expected);
        return addJSDocComment(finishNode(node));
    };
    Parser.prototype.parseMethodDeclaration = function (fullStart, decorators, modifiers, asteriskToken, name, questionToken, diagnosticMessage) {
        var method = createNode(tokenType_1.TokenType.MethodDeclaration, fullStart);
        method.decorators = decorators;
        setModifiers(method, modifiers);
        method.asteriskToken = asteriskToken;
        method.name = name;
        method.questionToken = questionToken;
        var isGenerator = !!asteriskToken;
        var isAsync = !!(method.flags & NodeFlags.Async);
        fillSignature(tokenType_1.TokenType.ColonToken, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, method);
        method.body = parseFunctionBlockOrSemicolon(isGenerator, isAsync, diagnosticMessage);
        return addJSDocComment(finishNode(method));
    };
    Parser.prototype.parsePropertyDeclaration = function (fullStart, decorators, modifiers, name, questionToken) {
        var property = createNode(tokenType_1.TokenType.PropertyDeclaration, fullStart);
        property.decorators = decorators;
        setModifiers(property, modifiers);
        property.name = name;
        property.questionToken = questionToken;
        property.type = parseTypeAnnotation();
        // For instance properties specifically, since they are evaluated inside the constructor,
        // we do *not * want to parse yield expressions, so we specifically turn the yield context
        // off. The grammar would look something like this:
        //
        //    MemberVariableDeclaration[Yield]:
        //        AccessibilityModifier_opt   PropertyName   TypeAnnotation_opt   Initializer_opt[In];
        //        AccessibilityModifier_opt  static_opt  PropertyName   TypeAnnotation_opt   Initializer_opt[In, ?Yield];
        //
        // The checker may still error in the static case to explicitly disallow the yield expression.
        property.initializer = modifiers && modifiers.flags & NodeFlags.Static
            ? allowInAnd(parseNonParameterInitializer)
            : doOutsideOfContext(NodeFlags.YieldContext | NodeFlags.DisallowInContext, parseNonParameterInitializer);
        parseSemicolon();
        return finishNode(property);
    };
    Parser.prototype.parsePropertyOrMethodDeclaration = function (fullStart, decorators, modifiers) {
        var asteriskToken = parseOptionalToken(tokenType_1.TokenType.AsteriskToken);
        var name = parsePropertyName();
        // Note: this is not legal as per the grammar.  But we allow it in the parser and
        // report an error in the grammar checker.
        var questionToken = parseOptionalToken(tokenType_1.TokenType.QuestionToken);
        if (asteriskToken || token === tokenType_1.TokenType.OpenParenToken || token === tokenType_1.TokenType.LessThanToken) {
            return parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, name, questionToken, Diagnostics.or_expected);
        }
        else {
            return parsePropertyDeclaration(fullStart, decorators, modifiers, name, questionToken);
        }
    };
    Parser.prototype.parseNonParameterInitializer = function () {
        return parseInitializer(/*inParameter*/ false);
    };
    Parser.prototype.parseAccessorDeclaration = function (kind, fullStart, decorators, modifiers) {
        var node = createNode(kind, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        node.name = parsePropertyName();
        fillSignature(tokenType_1.TokenType.ColonToken, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
        node.body = parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false);
        return finishNode(node);
    };
    Parser.prototype.isClassMemberModifier = function (idToken) {
        switch (idToken) {
            case tokenType_1.TokenType.PublicKeyword:
            case tokenType_1.TokenType.PrivateKeyword:
            case tokenType_1.TokenType.ProtectedKeyword:
            case tokenType_1.TokenType.StaticKeyword:
            case tokenType_1.TokenType.ReadonlyKeyword:
                return true;
            default:
                return false;
        }
    };
    Parser.prototype.isClassMemberStart = function () {
        var idToken;
        if (token === tokenType_1.TokenType.AtToken) {
            return true;
        }
        // Eat up all modifiers, but hold on to the last one in case it is actually an identifier.
        while (isModifierKind(token)) {
            idToken = token;
            // If the idToken is a class modifier (protected, private, public, and static), it is
            // certain that we are starting to parse class member. This allows better error recovery
            // Example:
            //      public foo() ...     // true
            //      public @dec blah ... // true; we will then report an error later
            //      export public ...    // true; we will then report an error later
            if (isClassMemberModifier(idToken)) {
                return true;
            }
            nextToken();
        }
        if (token === tokenType_1.TokenType.AsteriskToken) {
            return true;
        }
        // Try to get the first property-like token following all modifiers.
        // This can either be an identifier or the 'get' or 'set' keywords.
        if (isLiteralPropertyName()) {
            idToken = token;
            nextToken();
        }
        // Index signatures and computed properties are class members; we can parse.
        if (token === tokenType_1.TokenType.OpenBracketToken) {
            return true;
        }
        // If we were able to get any potential identifier...
        if (idToken !== undefined) {
            // If we have a non-keyword identifier, or if we have an accessor, then it's safe to parse.
            if (!isKeyword(idToken) || idToken === tokenType_1.TokenType.SetKeyword || idToken === tokenType_1.TokenType.GetKeyword) {
                return true;
            }
            // If it *is* a keyword, but not an accessor, check a little farther along
            // to see if it should actually be parsed as a class member.
            switch (token) {
                case tokenType_1.TokenType.OpenParenToken: // Method declaration
                case tokenType_1.TokenType.LessThanToken: // Generic Method declaration
                case tokenType_1.TokenType.ColonToken: // Type Annotation for declaration
                case tokenType_1.TokenType.EqualsToken: // Initializer for declaration
                case tokenType_1.TokenType.QuestionToken:
                    return true;
                default:
                    // Covers
                    //  - Semicolons     (declaration termination)
                    //  - Closing braces (end-of-class, must be declaration)
                    //  - End-of-files   (not valid, but permitted so that it gets caught later on)
                    //  - Line-breaks    (enabling *automatic semicolon insertion*)
                    return autoInsertSemicolon();
            }
        }
        return false;
    };
    Parser.prototype.parseDecorators = function () {
        var decorators;
        while (true) {
            var decoratorStart = getNodePos();
            if (!parseOptional(tokenType_1.TokenType.AtToken)) {
                break;
            }
            if (!decorators) {
                decorators = [];
                decorators.pos = decoratorStart;
            }
            var decorator = createNode(tokenType_1.TokenType.Decorator, decoratorStart);
            decorator.expression = doInDecoratorContext(parseLeftHandSideExpressionOrHigher);
            decorators.push(finishNode(decorator));
        }
        if (decorators) {
            decorators.end = getNodeEnd();
        }
        return decorators;
    };
    /*
     * There are situations in which a modifier like 'const' will appear unexpectedly, such as on a class member.
     * In those situations, if we are entirely sure that 'const' is not valid on its own (such as when ASI takes effect
     * and turns it into a standalone declaration), then it is better to parse it and report an error later.
     *
     * In such situations, 'permitInvalidConstAsModifier' should be set to true.
     */
    Parser.prototype.parseModifiers = function (permitInvalidConstAsModifier) {
        var flags = 0;
        var modifiers;
        while (true) {
            var modifierStart = scanner.getStartPos();
            var modifierKind = token;
            if (token === tokenType_1.TokenType.ConstKeyword && permitInvalidConstAsModifier) {
                // We need to ensure that any subsequent modifiers appear on the same line
                // so that when 'const' is a standalone declaration, we don't issue an error.
                if (!tryParse(nextTokenIsOnSameLineAndCanFollowModifier)) {
                    break;
                }
            }
            else {
                if (!parseAnyContextualModifier()) {
                    break;
                }
            }
            if (!modifiers) {
                modifiers = [];
                modifiers.pos = modifierStart;
            }
            flags |= modifierToFlag(modifierKind);
            modifiers.push(finishNode(createNode(modifierKind, modifierStart)));
        }
        if (modifiers) {
            modifiers.flags = flags;
            modifiers.end = scanner.getStartPos();
        }
        return modifiers;
    };
    Parser.prototype.parseModifiersForArrowFunction = function () {
        var flags = 0;
        var modifiers;
        if (token === tokenType_1.TokenType.AsyncKeyword) {
            var modifierStart = scanner.getStartPos();
            var modifierKind = token;
            nextToken();
            modifiers = [];
            modifiers.pos = modifierStart;
            flags |= modifierToFlag(modifierKind);
            modifiers.push(finishNode(createNode(modifierKind, modifierStart)));
            modifiers.flags = flags;
            modifiers.end = scanner.getStartPos();
        }
        return modifiers;
    };
    Parser.prototype.parseClassElement = function () {
        if (token === tokenType_1.TokenType.SemicolonToken) {
            var result = createNode(tokenType_1.TokenType.SemicolonClassElement);
            nextToken();
            return finishNode(result);
        }
        var fullStart = getNodePos();
        var decorators = parseDecorators();
        var modifiers = parseModifiers(/*permitInvalidConstAsModifier*/ true);
        var accessor = tryParseAccessorDeclaration(fullStart, decorators, modifiers);
        if (accessor) {
            return accessor;
        }
        if (token === tokenType_1.TokenType.ConstructorKeyword) {
            return parseConstructorDeclaration(fullStart, decorators, modifiers);
        }
        if (isIndexSignature()) {
            return parseIndexSignatureDeclaration(fullStart, decorators, modifiers);
        }
        // It is very important that we check this *after* checking indexers because
        // the [ token can start an index signature or a computed property name
        if (tokenIsIdentifierOrKeyword(token) ||
            token === tokenType_1.TokenType.StringLiteral ||
            token === tokenType_1.TokenType.NumericLiteral ||
            token === tokenType_1.TokenType.AsteriskToken ||
            token === tokenType_1.TokenType.OpenBracketToken) {
            return parsePropertyOrMethodDeclaration(fullStart, decorators, modifiers);
        }
        if (decorators || modifiers) {
            // treat this as a property declaration with a missing name.
            var name_1 = createMissingNode(tokenType_1.TokenType.Identifier, /*reportAtCurrentPosition*/ true, Diagnostics.Declaration_expected);
            return parsePropertyDeclaration(fullStart, decorators, modifiers, name_1, /*questionToken*/ undefined);
        }
        // 'isClassMemberStart' should have hinted not to attempt parsing.
        Debug.fail("Should not have attempted to parse class member declaration.");
    };
    Parser.prototype.parseClassExpression = function () {
        return parseClassDeclarationOrExpression(
        /*fullStart*/ scanner.getStartPos(), 
        /*decorators*/ undefined, 
        /*modifiers*/ undefined, tokenType_1.TokenType.ClassExpression);
    };
    Parser.prototype.parseClassDeclaration = function (fullStart, decorators, modifiers) {
        return parseClassDeclarationOrExpression(fullStart, decorators, modifiers, tokenType_1.TokenType.ClassDeclaration);
    };
    Parser.prototype.parseClassDeclarationOrExpression = function (fullStart, decorators, modifiers, kind) {
        var node = createNode(kind, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        this.parseExpected(tokenType_1.TokenType.ClassKeyword);
        node.name = parseNameOfClassDeclarationOrExpression();
        node.typeParameters = parseTypeParameters();
        node.heritageClauses = parseHeritageClauses(/*isClassHeritageClause*/ true);
        if (this.parseExpected(tokenType_1.TokenType.OpenBraceToken)) {
            // ClassTail[Yield,Await] : (Modified) See 14.5
            //      ClassHeritage[?Yield,?Await]opt { ClassBody[?Yield,?Await]opt }
            node.members = parseClassMembers();
            this.parseExpected(tokenType_1.TokenType.CloseBraceToken);
        }
        else {
            node.members = createMissingList();
        }
        return finishNode(node);
    };
    Parser.prototype.parseNameOfClassDeclarationOrExpression = function () {
        // implements is a future reserved word so
        // 'class implements' might mean either
        // - class expression with omitted name, 'implements' starts heritage clause
        // - class with name 'implements'
        // 'isImplementsClause' helps to disambiguate between these two cases
        return isIdentifier() && !isImplementsClause()
            ? parseIdentifier()
            : undefined;
    };
    Parser.prototype.isImplementsClause = function () {
        return token === tokenType_1.TokenType.ImplementsKeyword && lookAhead(nextTokenIsIdentifierOrKeyword);
    };
    Parser.prototype.parseHeritageClauses = function (isClassHeritageClause) {
        // ClassTail[Yield,Await] : (Modified) See 14.5
        //      ClassHeritage[?Yield,?Await]opt { ClassBody[?Yield,?Await]opt }
        if (isHeritageClause()) {
            return parseList(ParsingContext.HeritageClauses, parseHeritageClause);
        }
        return undefined;
    };
    Parser.prototype.parseHeritageClause = function () {
        if (token === tokenType_1.TokenType.ExtendsKeyword || token === tokenType_1.TokenType.ImplementsKeyword) {
            var node = createNode(tokenType_1.TokenType.HeritageClause);
            node.token = token;
            nextToken();
            node.types = parseDelimitedList(ParsingContext.HeritageClauseElement, parseExpressionWithTypeArguments);
            return finishNode(node);
        }
        return undefined;
    };
    Parser.prototype.parseExpressionWithTypeArguments = function () {
        var node = createNode(tokenType_1.TokenType.ExpressionWithTypeArguments);
        node.expression = parseLeftHandSideExpressionOrHigher();
        if (token === tokenType_1.TokenType.LessThanToken) {
            node.typeArguments = parseBracketedList(ParsingContext.TypeArguments, parseType, tokenType_1.TokenType.LessThanToken, tokenType_1.TokenType.GreaterThanToken);
        }
        return finishNode(node);
    };
    Parser.prototype.isHeritageClause = function () {
        return token === tokenType_1.TokenType.ExtendsKeyword || token === tokenType_1.TokenType.ImplementsKeyword;
    };
    Parser.prototype.parseClassMembers = function () {
        return parseList(ParsingContext.ClassMembers, parseClassElement);
    };
    Parser.prototype.parseInterfaceDeclaration = function (fullStart, decorators, modifiers) {
        var node = createNode(tokenType_1.TokenType.InterfaceDeclaration, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        this.parseExpected(tokenType_1.TokenType.InterfaceKeyword);
        node.name = parseIdentifier();
        node.typeParameters = parseTypeParameters();
        node.heritageClauses = parseHeritageClauses(/*isClassHeritageClause*/ false);
        node.members = parseObjectTypeMembers();
        return finishNode(node);
    };
    Parser.prototype.parseTypeAliasDeclaration = function (fullStart, decorators, modifiers) {
        var node = createNode(tokenType_1.TokenType.TypeAliasDeclaration, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        this.parseExpected(tokenType_1.TokenType.TypeKeyword);
        node.name = parseIdentifier();
        node.typeParameters = parseTypeParameters();
        this.parseExpected(tokenType_1.TokenType.EqualsToken);
        node.type = parseType();
        parseSemicolon();
        return finishNode(node);
    };
    // In an ambient declaration, the grammar only allows integer literals as initializers.
    // In a non-ambient declaration, the grammar allows uninitialized members only in a
    // ConstantEnumMemberSection, which starts at the beginning of an enum declaration
    // or any time an integer literal initializer is encountered.
    Parser.prototype.parseEnumMember = function () {
        var node = createNode(tokenType_1.TokenType.EnumMember, scanner.getStartPos());
        node.name = parsePropertyName();
        node.initializer = allowInAnd(parseNonParameterInitializer);
        return finishNode(node);
    };
    Parser.prototype.parseEnumDeclaration = function (fullStart, decorators, modifiers) {
        var node = createNode(tokenType_1.TokenType.EnumDeclaration, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        this.parseExpected(tokenType_1.TokenType.EnumKeyword);
        node.name = parseIdentifier();
        if (this.parseExpected(tokenType_1.TokenType.OpenBraceToken)) {
            node.members = parseDelimitedList(ParsingContext.EnumMembers, parseEnumMember);
            this.parseExpected(tokenType_1.TokenType.CloseBraceToken);
        }
        else {
            node.members = createMissingList();
        }
        return finishNode(node);
    };
    Parser.prototype.parseModuleBlock = function () {
        var node = createNode(tokenType_1.TokenType.ModuleBlock, scanner.getStartPos());
        if (this.parseExpected(tokenType_1.TokenType.OpenBraceToken)) {
            node.statements = parseList(ParsingContext.BlockStatements, parseStatement);
            this.parseExpected(tokenType_1.TokenType.CloseBraceToken);
        }
        else {
            node.statements = createMissingList();
        }
        return finishNode(node);
    };
    Parser.prototype.parseModuleOrNamespaceDeclaration = function (fullStart, decorators, modifiers, flags) {
        var node = createNode(tokenType_1.TokenType.ModuleDeclaration, fullStart);
        // If we are parsing a dotted namespace name, we want to
        // propagate the 'Namespace' flag across the names if set.
        var namespaceFlag = flags & NodeFlags.Namespace;
        node.decorators = decorators;
        setModifiers(node, modifiers);
        node.flags |= flags;
        node.name = parseIdentifier();
        node.body = parseOptional(tokenType_1.TokenType.DotToken)
            ? parseModuleOrNamespaceDeclaration(getNodePos(), /*decorators*/ undefined, /*modifiers*/ undefined, NodeFlags.Export | namespaceFlag)
            : parseModuleBlock();
        return finishNode(node);
    };
    Parser.prototype.parseAmbientExternalModuleDeclaration = function (fullStart, decorators, modifiers) {
        var node = createNode(tokenType_1.TokenType.ModuleDeclaration, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        if (token === tokenType_1.TokenType.GlobalKeyword) {
            // parse 'global' as name of global scope augmentation
            node.name = parseIdentifier();
            node.flags |= NodeFlags.GlobalAugmentation;
        }
        else {
            node.name = parseLiteralNode(/*internName*/ true);
        }
        if (token === tokenType_1.TokenType.OpenBraceToken) {
            node.body = parseModuleBlock();
        }
        else {
            parseSemicolon();
        }
        return finishNode(node);
    };
    Parser.prototype.parseModuleDeclaration = function (fullStart, decorators, modifiers) {
        var flags = modifiers ? modifiers.flags : 0;
        if (token === tokenType_1.TokenType.GlobalKeyword) {
            // global augmentation
            return parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
        }
        else if (parseOptional(tokenType_1.TokenType.NamespaceKeyword)) {
            flags |= NodeFlags.Namespace;
        }
        else {
            this.parseExpected(tokenType_1.TokenType.ModuleKeyword);
            if (token === tokenType_1.TokenType.StringLiteral) {
                return parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
            }
        }
        return parseModuleOrNamespaceDeclaration(fullStart, decorators, modifiers, flags);
    };
    Parser.prototype.isExternalModuleReference = function () {
        return token === tokenType_1.TokenType.RequireKeyword &&
            lookAhead(nextTokenIsOpenParen);
    };
    Parser.prototype.nextTokenIsOpenParen = function () {
        return nextToken() === tokenType_1.TokenType.OpenParenToken;
    };
    Parser.prototype.nextTokenIsSlash = function () {
        return nextToken() === tokenType_1.TokenType.SlashToken;
    };
    Parser.prototype.parseNamespaceExportDeclaration = function (fullStart, decorators, modifiers) {
        var exportDeclaration = createNode(tokenType_1.TokenType.NamespaceExportDeclaration, fullStart);
        exportDeclaration.decorators = decorators;
        exportDeclaration.modifiers = modifiers;
        this.parseExpected(tokenType_1.TokenType.AsKeyword);
        this.parseExpected(tokenType_1.TokenType.NamespaceKeyword);
        exportDeclaration.name = parseIdentifier();
        this.parseExpected(tokenType_1.TokenType.SemicolonToken);
        return finishNode(exportDeclaration);
    };
    Parser.prototype.parseImportDeclarationOrImportEqualsDeclaration = function (fullStart, decorators, modifiers) {
        this.parseExpected(tokenType_1.TokenType.ImportKeyword);
        var afterImportPos = scanner.getStartPos();
        var identifier;
        if (isIdentifier()) {
            identifier = parseIdentifier();
            if (token !== tokenType_1.TokenType.CommaToken && token !== tokenType_1.TokenType.FromKeyword) {
                // ImportEquals declaration of type:
                // import x = require("mod"); or
                // import x = M.x;
                var importEqualsDeclaration = createNode(tokenType_1.TokenType.ImportEqualsDeclaration, fullStart);
                importEqualsDeclaration.decorators = decorators;
                setModifiers(importEqualsDeclaration, modifiers);
                importEqualsDeclaration.name = identifier;
                this.parseExpected(tokenType_1.TokenType.EqualsToken);
                importEqualsDeclaration.moduleReference = parseModuleReference();
                parseSemicolon();
                return finishNode(importEqualsDeclaration);
            }
        }
        // Import statement
        var importDeclaration = createNode(tokenType_1.TokenType.ImportDeclaration, fullStart);
        importDeclaration.decorators = decorators;
        setModifiers(importDeclaration, modifiers);
        // ImportDeclaration:
        //  import ImportClause from ModuleSpecifier ;
        //  import ModuleSpecifier;
        if (identifier ||
            token === tokenType_1.TokenType.AsteriskToken ||
            token === tokenType_1.TokenType.OpenBraceToken) {
            importDeclaration.importClause = parseImportClause(identifier, afterImportPos);
            this.parseExpected(tokenType_1.TokenType.FromKeyword);
        }
        importDeclaration.moduleSpecifier = parseModuleSpecifier();
        parseSemicolon();
        return finishNode(importDeclaration);
    };
    Parser.prototype.parseImportClause = function (identifier, fullStart) {
        // ImportClause:
        //  ImportedDefaultBinding
        //  NameSpaceImport
        //  NamedImports
        //  ImportedDefaultBinding, NameSpaceImport
        //  ImportedDefaultBinding, NamedImports
        var importClause = createNode(tokenType_1.TokenType.ImportClause, fullStart);
        if (identifier) {
            // ImportedDefaultBinding:
            //  ImportedBinding
            importClause.name = identifier;
        }
        // If there was no default import or if there is comma token after default import
        // parse namespace or named imports
        if (!importClause.name ||
            parseOptional(tokenType_1.TokenType.CommaToken)) {
            importClause.namedBindings = token === tokenType_1.TokenType.AsteriskToken ? parseNamespaceImport() : parseNamedImportsOrExports(tokenType_1.TokenType.NamedImports);
        }
        return finishNode(importClause);
    };
    Parser.prototype.parseModuleReference = function () {
        return isExternalModuleReference()
            ? parseExternalModuleReference()
            : parseEntityName(/*allowReservedWords*/ false);
    };
    Parser.prototype.parseExternalModuleReference = function () {
        var node = createNode(tokenType_1.TokenType.ExternalModuleReference);
        this.parseExpected(tokenType_1.TokenType.RequireKeyword);
        this.parseExpected(tokenType_1.TokenType.OpenParenToken);
        node.expression = parseModuleSpecifier();
        this.parseExpected(tokenType_1.TokenType.CloseParenToken);
        return finishNode(node);
    };
    Parser.prototype.parseModuleSpecifier = function () {
        if (token === tokenType_1.TokenType.StringLiteral) {
            var result = parseLiteralNode();
            internIdentifier(result.text);
            return result;
        }
        else {
            // We allow arbitrary expressions here, even though the grammar only allows string
            // literals.  We check to ensure that it is only a string literal later in the grammar
            // check pass.
            return parseExpression();
        }
    };
    Parser.prototype.parseNamespaceImport = function () {
        // NameSpaceImport:
        //  * as ImportedBinding
        var namespaceImport = createNode(tokenType_1.TokenType.NamespaceImport);
        this.parseExpected(tokenType_1.TokenType.AsteriskToken);
        this.parseExpected(tokenType_1.TokenType.AsKeyword);
        namespaceImport.name = parseIdentifier();
        return finishNode(namespaceImport);
    };
    Parser.prototype.parseNamedImportsOrExports = function (kind) {
        var node = createNode(kind);
        // NamedImports:
        //  { }
        //  { ImportsList }
        //  { ImportsList, }
        // ImportsList:
        //  ImportSpecifier
        //  ImportsList, ImportSpecifier
        node.elements = parseBracketedList(ParsingContext.ImportOrExportSpecifiers, kind === tokenType_1.TokenType.NamedImports ? parseImportSpecifier : parseExportSpecifier, tokenType_1.TokenType.OpenBraceToken, tokenType_1.TokenType.CloseBraceToken);
        return finishNode(node);
    };
    Parser.prototype.parseExportSpecifier = function () {
        return parseImportOrExportSpecifier(tokenType_1.TokenType.ExportSpecifier);
    };
    Parser.prototype.parseImportSpecifier = function () {
        return parseImportOrExportSpecifier(tokenType_1.TokenType.ImportSpecifier);
    };
    Parser.prototype.parseImportOrExportSpecifier = function (kind) {
        var node = createNode(kind);
        // ImportSpecifier:
        //   BindingIdentifier
        //   IdentifierName as BindingIdentifier
        // ExportSpecifier:
        //   IdentifierName
        //   IdentifierName as IdentifierName
        var checkIdentifierIsKeyword = isKeyword(token) && !isIdentifier();
        var checkIdentifierStart = scanner.getTokenPos();
        var checkIdentifierEnd = scanner.getTextPos();
        var identifierName = parseIdentifierName();
        if (token === tokenType_1.TokenType.AsKeyword) {
            node.propertyName = identifierName;
            this.parseExpected(tokenType_1.TokenType.AsKeyword);
            checkIdentifierIsKeyword = isKeyword(token) && !isIdentifier();
            checkIdentifierStart = scanner.getTokenPos();
            checkIdentifierEnd = scanner.getTextPos();
            node.name = parseIdentifierName();
        }
        else {
            node.name = identifierName;
        }
        if (kind === tokenType_1.TokenType.ImportSpecifier && checkIdentifierIsKeyword) {
            // Report error identifier expected
            parseErrorAtPosition(checkIdentifierStart, checkIdentifierEnd - checkIdentifierStart, Diagnostics.Identifier_expected);
        }
        return finishNode(node);
    };
    Parser.prototype.parseExportDeclaration = function (fullStart, decorators, modifiers) {
        var node = createNode(tokenType_1.TokenType.ExportDeclaration, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        if (parseOptional(tokenType_1.TokenType.AsteriskToken)) {
            this.parseExpected(tokenType_1.TokenType.FromKeyword);
            node.moduleSpecifier = parseModuleSpecifier();
        }
        else {
            node.exportClause = parseNamedImportsOrExports(tokenType_1.TokenType.NamedExports);
            // It is not uncommon to accidentally omit the 'from' keyword. Additionally, in editing scenarios,
            // the 'from' keyword can be parsed as a named export when the export clause is unterminated (i.e. `export { from "moduleName";`)
            // If we don't have a 'from' keyword, see if we have a string literal such that ASI won't take effect.
            if (token === tokenType_1.TokenType.FromKeyword || (token === tokenType_1.TokenType.StringLiteral && !scanner.hasPrecedingLineBreak())) {
                this.parseExpected(tokenType_1.TokenType.FromKeyword);
                node.moduleSpecifier = parseModuleSpecifier();
            }
        }
        parseSemicolon();
        return finishNode(node);
    };
    Parser.prototype.parseExportAssignment = function (fullStart, decorators, modifiers) {
        var node = createNode(tokenType_1.TokenType.ExportAssignment, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        if (parseOptional(tokenType_1.TokenType.EqualsToken)) {
            node.isExportEquals = true;
        }
        else {
            this.parseExpected(tokenType_1.TokenType.DefaultKeyword);
        }
        node.expression = parseAssignmentExpressionOrHigher();
        parseSemicolon();
        return finishNode(node);
    };
    Parser.prototype.processReferenceComments = function (sourceFile) {
        var triviaScanner = createScanner(sourceFile.languageVersion, /*skipTrivia*/ false, LanguageVariant.Standard, sourceText);
        var referencedFiles = [];
        var typeReferenceDirectives = [];
        var amdDependencies = [];
        var amdModuleName;
        // Keep scanning all the leading trivia in the file until we get to something that
        // isn't trivia.  Any single line comment will be analyzed to see if it is a
        // reference comment.
        while (true) {
            var kind = triviaScanner.scan();
            if (kind !== tokenType_1.TokenType.SingleLineCommentTrivia) {
                if (isTrivia(kind)) {
                    continue;
                }
                else {
                    break;
                }
            }
            var range = { pos: triviaScanner.getTokenPos(), end: triviaScanner.getTextPos(), kind: triviaScanner.getToken() };
            var comment = sourceText.substring(range.pos, range.end);
            var referencePathMatchResult = getFileReferenceFromReferencePath(comment, range);
            if (referencePathMatchResult) {
                var fileReference = referencePathMatchResult.fileReference;
                sourceFile.hasNoDefaultLib = referencePathMatchResult.isNoDefaultLib;
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
                    parseDiagnostics.push(createFileDiagnostic(sourceFile, range.pos, range.end - range.pos, diagnosticMessage));
                }
            }
            else {
                var amdModuleNameRegEx = /^\/\/\/\s*<amd-module\s+name\s*=\s*('|")(.+?)\1/gim;
                var amdModuleNameMatchResult = amdModuleNameRegEx.exec(comment);
                if (amdModuleNameMatchResult) {
                    if (amdModuleName) {
                        parseDiagnostics.push(createFileDiagnostic(sourceFile, range.pos, range.end - range.pos, Diagnostics.An_AMD_module_cannot_have_multiple_name_assignments));
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
        sourceFile.referencedFiles = referencedFiles;
        sourceFile.typeReferenceDirectives = typeReferenceDirectives;
        sourceFile.amdDependencies = amdDependencies;
        sourceFile.moduleName = amdModuleName;
    };
    Parser.prototype.setExternalModuleIndicator = function (sourceFile) {
        sourceFile.externalModuleIndicator = forEach(sourceFile.statements, function (node) {
            return node.flags & NodeFlags.Export
                || node.kind === tokenType_1.TokenType.ImportEqualsDeclaration && node.moduleReference.kind === tokenType_1.TokenType.ExternalModuleReference
                || node.kind === tokenType_1.TokenType.ImportDeclaration
                || node.kind === tokenType_1.TokenType.ExportAssignment
                || node.kind === tokenType_1.TokenType.ExportDeclaration
                ? node
                : undefined;
        });
    };
    //const enum ParsingContext {
    //    SourceElements,            // Elements in source file
    //    BlockStatements,           // Statements in block
    //    SwitchClauses,             // Clauses in switch statement
    //    SwitchClauseStatements,    // Statements in switch clause
    //    TypeMembers,               // Members in interface or type literal
    //    ClassMembers,              // Members in class declaration
    //    EnumMembers,               // Members in enum declaration
    //    HeritageClauseElement,     // Elements in a heritage clause
    //    VariableDeclarations,      // Variable declarations in variable statement
    //    ObjectBindingElements,     // Binding elements in object binding list
    //    ArrayBindingElements,      // Binding elements in array binding list
    //    ArgumentExpressions,       // Expressions in argument list
    //    ObjectLiteralMembers,      // Members in object literal
    //    JsxAttributes,             // Attributes in jsx element
    //    JsxChildren,               // Things between opening and closing JSX tags
    //    ArrayLiteralMembers,       // Members in array literal
    //    Parameters,                // Parameters in parameter list
    //    TypeParameters,            // Type parameters in type parameter list
    //    TypeArguments,             // Type arguments in type argument list
    //    TupleElementTypes,         // Element types in tuple element type list
    //    HeritageClauses,           // Heritage clauses for a class or interface declaration.
    //    ImportOrExportSpecifiers,  // Named import clause's import specifier list
    //    JSDocFunctionParameters,
    //    JSDocTypeArguments,
    //    JSDocRecordMembers,
    //    JSDocTupleTypes,
    //    Count                      // Number of parsing contexts
    //}
    //const enum Tristate {
    //    False,
    //    True,
    //    Unknown
    //}
    //export namespace JSDocParser {
    //    export private isJSDocType() {
    //        switch (token) {
    //            case TokenType.AsteriskToken:
    //            case TokenType.QuestionToken:
    //            case TokenType.OpenParenToken:
    //            case TokenType.OpenBracketToken:
    //            case TokenType.ExclamationToken:
    //            case TokenType.OpenBraceToken:
    //            case TokenType.FunctionKeyword:
    //            case TokenType.DotDotDotToken:
    //            case TokenType.NewKeyword:
    //            case TokenType.ThisKeyword:
    //                return true;
    //        }
    //        return tokenIsIdentifierOrKeyword(token);
    //    }
    //    export private parseJSDocTypeExpressionForTests(content: string, start: number, length: number) {
    //        initializeState("file.js", content, ScriptTarget.Latest, /*_syntaxCursor:*/ undefined, ScriptKind.JS);
    //        scanner.setText(content, start, length);
    //        token = scanner.scan();
    //        const jsDocTypeExpression = parseJSDocTypeExpression();
    //        const diagnostics = parseDiagnostics;
    //        clearState();
    //        return jsDocTypeExpression ? { jsDocTypeExpression, diagnostics } : undefined;
    //    }
    //    // Parses out a JSDoc type expression.
    //    /* @internal */
    //    export private parseJSDocTypeExpression(): JSDocTypeExpression {
    //        const result = <JSDocTypeExpression>createNode(TokenType.JSDocTypeExpression, scanner.getTokenPos());
    //        this.parseExpected(TokenType.OpenBraceToken);
    //        result.type = parseJSDocTopLevelType();
    //        this.parseExpected(TokenType.CloseBraceToken);
    //        fixupParentReferences(result);
    //        return finishNode(result);
    //    }
    //    private parseJSDocTopLevelType(): JSDocType {
    //        let type = parseJSDocType();
    //        if (token === TokenType.BarToken) {
    //            const unionType = <JSDocUnionType>createNode(TokenType.JSDocUnionType, type.pos);
    //            unionType.types = parseJSDocTypeList(type);
    //            type = finishNode(unionType);
    //        }
    //        if (token === TokenType.EqualsToken) {
    //            const optionalType = <JSDocOptionalType>createNode(TokenType.JSDocOptionalType, type.pos);
    //            nextToken();
    //            optionalType.type = type;
    //            type = finishNode(optionalType);
    //        }
    //        return type;
    //    }
    //    private parseJSDocType(): JSDocType {
    //        let type = parseBasicTypeExpression();
    //        while (true) {
    //            if (token === TokenType.OpenBracketToken) {
    //                const arrayType = <JSDocArrayType>createNode(TokenType.JSDocArrayType, type.pos);
    //                arrayType.elementType = type;
    //                nextToken();
    //                this.parseExpected(TokenType.CloseBracketToken);
    //                type = finishNode(arrayType);
    //            }
    //            else if (token === TokenType.QuestionToken) {
    //                const nullableType = <JSDocNullableType>createNode(TokenType.JSDocNullableType, type.pos);
    //                nullableType.type = type;
    //                nextToken();
    //                type = finishNode(nullableType);
    //            }
    //            else if (token === TokenType.ExclamationToken) {
    //                const nonNullableType = <JSDocNonNullableType>createNode(TokenType.JSDocNonNullableType, type.pos);
    //                nonNullableType.type = type;
    //                nextToken();
    //                type = finishNode(nonNullableType);
    //            }
    //            else {
    //                break;
    //            }
    //        }
    //        return type;
    //    }
    //    private parseBasicTypeExpression(): JSDocType {
    //        switch (token) {
    //            case TokenType.AsteriskToken:
    //                return parseJSDocAllType();
    //            case TokenType.QuestionToken:
    //                return parseJSDocUnknownOrNullableType();
    //            case TokenType.OpenParenToken:
    //                return parseJSDocUnionType();
    //            case TokenType.OpenBracketToken:
    //                return parseJSDocTupleType();
    //            case TokenType.ExclamationToken:
    //                return parseJSDocNonNullableType();
    //            case TokenType.OpenBraceToken:
    //                return parseJSDocRecordType();
    //            case TokenType.FunctionKeyword:
    //                return parseJSDocFunctionType();
    //            case TokenType.DotDotDotToken:
    //                return parseJSDocVariadicType();
    //            case TokenType.NewKeyword:
    //                return parseJSDocConstructorType();
    //            case TokenType.ThisKeyword:
    //                return parseJSDocThisType();
    //            case TokenType.AnyKeyword:
    //            case TokenType.StringKeyword:
    //            case TokenType.NumberKeyword:
    //            case TokenType.BooleanKeyword:
    //            case TokenType.SymbolKeyword:
    //            case TokenType.VoidKeyword:
    //                return parseTokenNode<JSDocType>();
    //        }
    //        // TODO (drosen): Parse string literal types in JSDoc as well.
    //        return parseJSDocTypeReference();
    //    }
    //    private parseJSDocThisType(): JSDocThisType {
    //        const result = <JSDocThisType>createNode(TokenType.JSDocThisType);
    //        nextToken();
    //        this.parseExpected(TokenType.ColonToken);
    //        result.type = parseJSDocType();
    //        return finishNode(result);
    //    }
    //    private parseJSDocConstructorType(): JSDocConstructorType {
    //        const result = <JSDocConstructorType>createNode(TokenType.JSDocConstructorType);
    //        nextToken();
    //        this.parseExpected(TokenType.ColonToken);
    //        result.type = parseJSDocType();
    //        return finishNode(result);
    //    }
    //    private parseJSDocVariadicType(): JSDocVariadicType {
    //        const result = <JSDocVariadicType>createNode(TokenType.JSDocVariadicType);
    //        nextToken();
    //        result.type = parseJSDocType();
    //        return finishNode(result);
    //    }
    //    private parseJSDocFunctionType(): JSDocFunctionType {
    //        const result = <JSDocFunctionType>createNode(TokenType.JSDocFunctionType);
    //        nextToken();
    //        this.parseExpected(TokenType.OpenParenToken);
    //        result.parameters = parseDelimitedList(ParsingContext.JSDocFunctionParameters, parseJSDocParameter);
    //        checkForTrailingComma(result.parameters);
    //        this.parseExpected(TokenType.CloseParenToken);
    //        if (token === TokenType.ColonToken) {
    //            nextToken();
    //            result.type = parseJSDocType();
    //        }
    //        return finishNode(result);
    //    }
    //    private parseJSDocParameter(): ParameterDeclaration {
    //        const parameter = <ParameterDeclaration>createNode(TokenType.Parameter);
    //        parameter.type = parseJSDocType();
    //        if (parseOptional(TokenType.EqualsToken)) {
    //            parameter.questionToken = createNode(TokenType.EqualsToken);
    //        }
    //        return finishNode(parameter);
    //    }
    //    private parseJSDocTypeReference(): JSDocTypeReference {
    //        const result = <JSDocTypeReference>createNode(TokenType.JSDocTypeReference);
    //        result.name = parseSimplePropertyName();
    //        if (token === TokenType.LessThanToken) {
    //            result.typeArguments = parseTypeArguments();
    //        }
    //        else {
    //            while (parseOptional(TokenType.DotToken)) {
    //                if (token === TokenType.LessThanToken) {
    //                    result.typeArguments = parseTypeArguments();
    //                    break;
    //                }
    //                else {
    //                    result.name = parseQualifiedName(result.name);
    //                }
    //            }
    //        }
    //        return finishNode(result);
    //    }
    //    private parseTypeArguments() {
    //        // Move past the <
    //        nextToken();
    //        const typeArguments = parseDelimitedList(ParsingContext.JSDocTypeArguments, parseJSDocType);
    //        checkForTrailingComma(typeArguments);
    //        checkForEmptyTypeArgumentList(typeArguments);
    //        this.parseExpected(TokenType.GreaterThanToken);
    //        return typeArguments;
    //    }
    //    private checkForEmptyTypeArgumentList(typeArguments: NodeArray<Node>) {
    //        if(parseDiagnostics.length === 0 && typeArguments && typeArguments.length === 0) {
    //            const start = typeArguments.pos - "<".length;
    //            const end = skipTrivia(sourceText, typeArguments.end) + ">".length;
    //            return parseErrorAtPosition(start, end - start, Diagnostics.Type_argument_list_cannot_be_empty);
    //        }
    //    }
    //    private parseQualifiedName(left: EntityName): QualifiedName {
    //            const result = <QualifiedName>createNode(TokenType.QualifiedName, left.pos);
    //            result.left = left;
    //            result.right = parseIdentifierName();
    //            return finishNode(result);
    //        }
    //    private parseJSDocRecordType(): JSDocRecordType {
    //            const result = <JSDocRecordType>createNode(TokenType.JSDocRecordType);
    //            nextToken();
    //        result.members = parseDelimitedList(ParsingContext.JSDocRecordMembers, parseJSDocRecordMember);
    //            checkForTrailingComma(result.members);
    //        this.parseExpected(TokenType.CloseBraceToken);
    //        return finishNode(result);
    //        }
    //    private parseJSDocRecordMember(): JSDocRecordMember {
    //            const result = <JSDocRecordMember>createNode(TokenType.JSDocRecordMember);
    //            result.name = parseSimplePropertyName();
    //            if(token === TokenType.ColonToken) {
    //                nextToken();
    //                result.type = parseJSDocType();
    //            }
    //        return finishNode(result);
    //        }
    //    private parseJSDocNonNullableType(): JSDocNonNullableType {
    //            const result = <JSDocNonNullableType>createNode(TokenType.JSDocNonNullableType);
    //            nextToken();
    //        result.type = parseJSDocType();
    //            return finishNode(result);
    //        }
    //    private parseJSDocTupleType(): JSDocTupleType {
    //            const result = <JSDocTupleType>createNode(TokenType.JSDocTupleType);
    //            nextToken();
    //        result.types = parseDelimitedList(ParsingContext.JSDocTupleTypes, parseJSDocType);
    //            checkForTrailingComma(result.types);
    //        this.parseExpected(TokenType.CloseBracketToken);
    //        return finishNode(result);
    //        }
    //    private checkForTrailingComma(list: NodeArray<Node>) {
    //            if(parseDiagnostics.length === 0 && list.hasTrailingComma) {
    //                const start = list.end - ",".length;
    //                parseErrorAtPosition(start, ",".length, Diagnostics.Trailing_comma_not_allowed);
    //            }
    //        }
    //    private parseJSDocUnionType(): JSDocUnionType {
    //                const result = <JSDocUnionType>createNode(TokenType.JSDocUnionType);
    //                nextToken();
    //        result.types = parseJSDocTypeList(parseJSDocType());
    //                this.parseExpected(TokenType.CloseParenToken);
    //        return finishNode(result);
    //            }
    //    private parseJSDocTypeList(firstType: JSDocType) {
    //                Debug.assert(!!firstType);
    //                const types = <NodeArray<JSDocType>>[];
    //                types.pos = firstType.pos;
    //                types.push(firstType);
    //                while(parseOptional(TokenType.BarToken)) {
    //                    types.push(parseJSDocType());
    //                }
    //        types.end = scanner.getStartPos();
    //                return types;
    //            }
    //    private parseJSDocAllType(): JSDocAllType {
    //                const result = <JSDocAllType>createNode(TokenType.JSDocAllType);
    //                nextToken();
    //        return finishNode(result);
    //            }
    //    private parseJSDocUnknownOrNullableType(): JSDocUnknownType | JSDocNullableType {
    //                const pos = scanner.getStartPos();
    //                // skip the ?
    //                nextToken();
    //        // Need to lookahead to decide if this is a nullable or unknown type.
    //        // Here are cases where we'll pick the unknown type:
    //        //
    //        //      Foo(?,
    //        //      { a: ? }
    //        //      Foo(?)
    //        //      Foo<?>
    //        //      Foo(?=
    //        //      (?|
    //        if (token === TokenType.CommaToken ||
    //                    token === TokenType.CloseBraceToken ||
    //                    token === TokenType.CloseParenToken ||
    //                    token === TokenType.GreaterThanToken ||
    //                    token === TokenType.EqualsToken ||
    //                    token === TokenType.BarToken) {
    //                    const result = <JSDocUnknownType>createNode(TokenType.JSDocUnknownType, pos);
    //                    return finishNode(result);
    //                }
    //        else {
    //                    const result = <JSDocNullableType>createNode(TokenType.JSDocNullableType, pos);
    //                    result.type = parseJSDocType();
    //                    return finishNode(result);
    //                }
    //            }
    //    export private parseIsolatedJSDocComment(content: string, start: number, length: number) {
    //                initializeState("file.js", content, ScriptTarget.Latest, /*_syntaxCursor:*/ undefined, ScriptKind.JS);
    //    sourceFile = <SourceFile>{ languageVariant: LanguageVariant.Standard, text: content };
    //    const jsDocComment = parseJSDocCommentWorker(start, length);
    //    const diagnostics = parseDiagnostics;
    //    clearState();
    //    return jsDocComment ? { jsDocComment, diagnostics } : undefined;
    //}
    Parser.prototype.parseJSDocComment = function (parent, start, length) {
        var saveToken = token;
        var saveParseDiagnosticsLength = parseDiagnostics.length;
        var saveParseErrorBeforeNextFinishedNode = parseErrorBeforeNextFinishedNode;
        var comment = parseJSDocCommentWorker(start, length);
        if (comment) {
            comment.parent = parent;
        }
        token = saveToken;
        parseDiagnostics.length = saveParseDiagnosticsLength;
        parseErrorBeforeNextFinishedNode = saveParseErrorBeforeNextFinishedNode;
        return comment;
    };
    Parser.prototype.parseJSDocCommentWorker = function (start, length) {
        var content = sourceText;
        start = start || 0;
        var end = length === undefined ? content.length : start + length;
        length = end - start;
        Debug.assert(start >= 0);
        Debug.assert(start <= end);
        Debug.assert(end <= content.length);
        var tags;
        var result;
        // Check for /** (JSDoc opening part)
        if (content.charCodeAt(start) === CharacterCodes.slash &&
            content.charCodeAt(start + 1) === CharacterCodes.asterisk &&
            content.charCodeAt(start + 2) === CharacterCodes.asterisk &&
            content.charCodeAt(start + 3) !== CharacterCodes.asterisk) {
            // + 3 for leading /**, - 5 in total for /** */
            scanner.scanRange(start + 3, length - 5, function () {
                // Initially we can parse out a tag.  We also have seen a starting asterisk.
                // This is so that /** * @type */ doesn't parse.
                var canParseTag = true;
                var seenAsterisk = true;
                nextJSDocToken();
                while (token !== tokenType_1.TokenType.EndOfFileToken) {
                    switch (token) {
                        case tokenType_1.TokenType.AtToken:
                            if (canParseTag) {
                                parseTag();
                            }
                            // This will take us to the end of the line, so it's OK to parse a tag on the next pass through the loop
                            seenAsterisk = false;
                            break;
                        case tokenType_1.TokenType.NewLineTrivia:
                            // After a line break, we can parse a tag, and we haven't seen an asterisk on the next line yet
                            canParseTag = true;
                            seenAsterisk = false;
                            break;
                        case tokenType_1.TokenType.AsteriskToken:
                            if (seenAsterisk) {
                                // If we've already seen an asterisk, then we can no longer parse a tag on this line
                                canParseTag = false;
                            }
                            // Ignore the first asterisk on a line
                            seenAsterisk = true;
                            break;
                        case tokenType_1.TokenType.Identifier:
                            // Anything else is doc comment text.  We can't do anything with it.  Because it
                            // wasn't a tag, we can no longer parse a tag on this line until we hit the next
                            // line break.
                            canParseTag = false;
                            break;
                        case tokenType_1.TokenType.EndOfFileToken:
                            break;
                    }
                    nextJSDocToken();
                }
                result = createJSDocComment();
            });
        }
        return result;
        function createJSDocComment() {
            if (!tags) {
                return undefined;
            }
            var result = createNode(tokenType_1.TokenType.JSDocComment, start);
            result.tags = tags;
            return finishNode(result, end);
        }
        function skipWhitespace() {
            while (token === tokenType_1.TokenType.WhitespaceTrivia || token === tokenType_1.TokenType.NewLineTrivia) {
                nextJSDocToken();
            }
        }
        function parseTag() {
            Debug.assert(token === tokenType_1.TokenType.AtToken);
            var atToken = createNode(tokenType_1.TokenType.AtToken, scanner.getTokenPos());
            atToken.end = scanner.getTextPos();
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
            var result = createNode(tokenType_1.TokenType.JSDocTag, atToken.pos);
            result.atToken = atToken;
            result.tagName = tagName;
            return finishNode(result);
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
            if (token !== tokenType_1.TokenType.OpenBraceToken) {
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
            // Looking for something like '[foo]' or 'foo'
            if (parseOptionalToken(tokenType_1.TokenType.OpenBracketToken)) {
                name = parseJSDocIdentifierName();
                isBracketed = true;
                // May have an optional default, e.g. '[foo = 42]'
                if (parseOptionalToken(tokenType_1.TokenType.EqualsToken)) {
                    parseExpression();
                }
                this.parseExpected(tokenType_1.TokenType.CloseBracketToken);
            }
            else if (tokenIsIdentifierOrKeyword(token)) {
                name = parseJSDocIdentifierName();
            }
            if (!name) {
                parseErrorAtPosition(scanner.getStartPos(), 0, Diagnostics.Identifier_expected);
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
            var result = createNode(tokenType_1.TokenType.JSDocParameterTag, atToken.pos);
            result.atToken = atToken;
            result.tagName = tagName;
            result.preParameterName = preName;
            result.typeExpression = typeExpression;
            result.postParameterName = postName;
            result.isBracketed = isBracketed;
            return finishNode(result);
        }
        function handleReturnTag(atToken, tagName) {
            if (forEach(tags, function (t) { return t.kind === tokenType_1.TokenType.JSDocReturnTag; })) {
                parseErrorAtPosition(tagName.pos, scanner.getTokenPos() - tagName.pos, Diagnostics._0_tag_already_specified, tagName.text);
            }
            var result = createNode(tokenType_1.TokenType.JSDocReturnTag, atToken.pos);
            result.atToken = atToken;
            result.tagName = tagName;
            result.typeExpression = tryParseTypeExpression();
            return finishNode(result);
        }
        function handleTypeTag(atToken, tagName) {
            if (forEach(tags, function (t) { return t.kind === tokenType_1.TokenType.JSDocTypeTag; })) {
                parseErrorAtPosition(tagName.pos, scanner.getTokenPos() - tagName.pos, Diagnostics._0_tag_already_specified, tagName.text);
            }
            var result = createNode(tokenType_1.TokenType.JSDocTypeTag, atToken.pos);
            result.atToken = atToken;
            result.tagName = tagName;
            result.typeExpression = tryParseTypeExpression();
            return finishNode(result);
        }
        function handlePropertyTag(atToken, tagName) {
            var typeExpression = tryParseTypeExpression();
            skipWhitespace();
            var name = parseJSDocIdentifierName();
            if (!name) {
                parseErrorAtPosition(scanner.getStartPos(), /*length*/ 0, Diagnostics.Identifier_expected);
                return undefined;
            }
            var result = createNode(tokenType_1.TokenType.JSDocPropertyTag, atToken.pos);
            result.atToken = atToken;
            result.tagName = tagName;
            result.name = name;
            result.typeExpression = typeExpression;
            return finishNode(result);
        }
        function handleTypedefTag(atToken, tagName) {
            var typeExpression = tryParseTypeExpression();
            skipWhitespace();
            var typedefTag = createNode(tokenType_1.TokenType.JSDocTypedefTag, atToken.pos);
            typedefTag.atToken = atToken;
            typedefTag.tagName = tagName;
            typedefTag.name = parseJSDocIdentifierName();
            typedefTag.typeExpression = typeExpression;
            if (typeExpression) {
                if (typeExpression.type.kind === tokenType_1.TokenType.JSDocTypeReference) {
                    var jsDocTypeReference = typeExpression.type;
                    if (jsDocTypeReference.name.kind === tokenType_1.TokenType.Identifier) {
                        var name_2 = jsDocTypeReference.name;
                        if (name_2.text === "Object") {
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
            return finishNode(typedefTag);
            function scanChildTags() {
                var jsDocTypeLiteral = createNode(tokenType_1.TokenType.JSDocTypeLiteral, scanner.getStartPos());
                var resumePos = scanner.getStartPos();
                var canParseTag = true;
                var seenAsterisk = false;
                var parentTagTerminated = false;
                while (token !== tokenType_1.TokenType.EndOfFileToken && !parentTagTerminated) {
                    nextJSDocToken();
                    switch (token) {
                        case tokenType_1.TokenType.AtToken:
                            if (canParseTag) {
                                parentTagTerminated = !tryParseChildTag(jsDocTypeLiteral);
                            }
                            seenAsterisk = false;
                            break;
                        case tokenType_1.TokenType.NewLineTrivia:
                            resumePos = scanner.getStartPos() - 1;
                            canParseTag = true;
                            seenAsterisk = false;
                            break;
                        case tokenType_1.TokenType.AsteriskToken:
                            if (seenAsterisk) {
                                canParseTag = false;
                            }
                            seenAsterisk = true;
                            break;
                        case tokenType_1.TokenType.Identifier:
                            canParseTag = false;
                        case tokenType_1.TokenType.EndOfFileToken:
                            break;
                    }
                }
                scanner.setTextPos(resumePos);
                return finishNode(jsDocTypeLiteral);
            }
        }
        function tryParseChildTag(parentTag) {
            Debug.assert(token === tokenType_1.TokenType.AtToken);
            var atToken = createNode(tokenType_1.TokenType.AtToken, scanner.getStartPos());
            atToken.end = scanner.getTextPos();
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
            if (forEach(tags, function (t) { return t.kind === tokenType_1.TokenType.JSDocTemplateTag; })) {
                parseErrorAtPosition(tagName.pos, scanner.getTokenPos() - tagName.pos, Diagnostics._0_tag_already_specified, tagName.text);
            }
            // Type parameter list looks like '@template T,U,V'
            var typeParameters = [];
            typeParameters.pos = scanner.getStartPos();
            while (true) {
                var name_3 = parseJSDocIdentifierName();
                if (!name_3) {
                    parseErrorAtPosition(scanner.getStartPos(), 0, Diagnostics.Identifier_expected);
                    return undefined;
                }
                var typeParameter = createNode(tokenType_1.TokenType.TypeParameter, name_3.pos);
                typeParameter.name = name_3;
                finishNode(typeParameter);
                typeParameters.push(typeParameter);
                if (token === tokenType_1.TokenType.CommaToken) {
                    nextJSDocToken();
                }
                else {
                    break;
                }
            }
            var result = createNode(tokenType_1.TokenType.JSDocTemplateTag, atToken.pos);
            result.atToken = atToken;
            result.tagName = tagName;
            result.typeParameters = typeParameters;
            finishNode(result);
            typeParameters.end = result.end;
            return result;
        }
        function nextJSDocToken() {
            return token = scanner.scanJSDocToken();
        }
        function parseJSDocIdentifierName() {
            return createJSDocIdentifier(tokenIsIdentifierOrKeyword(token));
        }
        function createJSDocIdentifier(isIdentifier) {
            if (!isIdentifier) {
                parseErrorAtCurrentToken(Diagnostics.Identifier_expected);
                return undefined;
            }
            var pos = scanner.getTokenPos();
            var end = scanner.getTextPos();
            var result = createNode(tokenType_1.TokenType.Identifier, pos);
            result.text = content.substring(pos, end);
            finishNode(result, end);
            nextJSDocToken();
            return result;
        }
    };
    return Parser;
}());
exports.Parser = Parser;
var IncrementalParser;
(function (IncrementalParser) {
    updateSourceFile(sourceFile, SourceFile, newText, string, textChangeRange, TextChangeRange, aggressiveChecks, boolean);
    SourceFile;
    {
        aggressiveChecks = aggressiveChecks || Debug.shouldAssert(AssertionLevel.Aggressive);
        checkChangeRange(sourceFile, newText, textChangeRange, aggressiveChecks);
        if (textChangeRangeIsUnchanged(textChangeRange)) {
            // if the text didn't change, then we can just return our current source file as-is.
            return sourceFile;
        }
        if (sourceFile.statements.length === 0) {
            // If we don't have any statements in the current source file, then there's no real
            // way to incrementally parse.  So just do a full parse instead.
            return Parser.parseSourceFile(sourceFile.fileName, newText, sourceFile.languageVersion, /*syntaxCursor*/ undefined, /*setParentNodes*/ true, sourceFile.scriptKind);
        }
        // Make sure we're not trying to incrementally update a source file more than once.  Once
        // we do an update the original source file is considered unusable from that point onwards.
        //
        // This is because we do incremental parsing in-place.  i.e. we take nodes from the old
        // tree and give them new positions and parents.  From that point on, trusting the old
        // tree at all is not possible as far too much of it may violate invariants.
        var incrementalSourceFile = sourceFile;
        Debug.assert(!incrementalSourceFile.hasBeenIncrementallyParsed);
        incrementalSourceFile.hasBeenIncrementallyParsed = true;
        var oldText = sourceFile.text;
        var syntaxCursor = createSyntaxCursor(sourceFile);
        // Make the actual change larger so that we know to reparse anything whose lookahead
        // might have intersected the change.
        var changeRange = extendToAffectedRange(sourceFile, textChangeRange);
        checkChangeRange(sourceFile, newText, changeRange, aggressiveChecks);
        // Ensure that extending the affected range only moved the start of the change range
        // earlier in the file.
        Debug.assert(changeRange.span.start <= textChangeRange.span.start);
        Debug.assert(textSpanEnd(changeRange.span) === textSpanEnd(textChangeRange.span));
        Debug.assert(textSpanEnd(textChangeRangeNewSpan(changeRange)) === textSpanEnd(textChangeRangeNewSpan(textChangeRange)));
        // The is the amount the nodes after the edit range need to be adjusted.  It can be
        // positive (if the edit added characters), negative (if the edit deleted characters)
        // or zero (if this was a pure overwrite with nothing added/removed).
        var delta = textChangeRangeNewSpan(changeRange).length - changeRange.span.length;
        // If we added or removed characters during the edit, then we need to go and adjust all
        // the nodes after the edit.  Those nodes may move forward (if we inserted chars) or they
        // may move backward (if we deleted chars).
        //
        // Doing this helps us out in two ways.  First, it means that any nodes/tokens we want
        // to reuse are already at the appropriate position in the new text.  That way when we
        // reuse them, we don't have to figure out if they need to be adjusted.  Second, it makes
        // it very easy to determine if we can reuse a node.  If the node's position is at where
        // we are in the text, then we can reuse it.  Otherwise we can't.  If the node's position
        // is ahead of us, then we'll need to rescan tokens.  If the node's position is behind
        // us, then we'll need to skip it or crumble it as appropriate
        //
        // We will also adjust the positions of nodes that intersect the change range as well.
        // By doing this, we ensure that all the positions in the old tree are consistent, not
        // just the positions of nodes entirely before/after the change range.  By being
        // consistent, we can then easily map from positions to nodes in the old tree easily.
        //
        // Also, mark any syntax elements that intersect the changed span.  We know, up front,
        // that we cannot reuse these elements.
        updateTokenPositionsAndMarkElements(incrementalSourceFile, changeRange.span.start, textSpanEnd(changeRange.span), textSpanEnd(textChangeRangeNewSpan(changeRange)), delta, oldText, newText, aggressiveChecks);
        // Now that we've set up our internal incremental state just proceed and parse the
        // source file in the normal fashion.  When possible the parser will retrieve and
        // reuse nodes from the old tree.
        //
        // Note: passing in 'true' for setNodeParents is very important.  When incrementally
        // parsing, we will be reusing nodes from the old tree, and placing it into new
        // parents.  If we don't set the parents now, we'll end up with an observably
        // inconsistent tree.  Setting the parents on the new tree should be very fast.  We
        // will immediately bail out of walking any subtrees when we can see that their parents
        // are already correct.
        var result = Parser.parseSourceFile(sourceFile.fileName, newText, sourceFile.languageVersion, syntaxCursor, /*setParentNodes*/ true, sourceFile.scriptKind);
        return result;
    }
    moveElementEntirelyPastChangeRange(element, IncrementalElement, isArray, boolean, delta, number, oldText, string, newText, string, aggressiveChecks, boolean);
    {
        if (isArray) {
            visitArray(element);
        }
        else {
            visitNode(element);
        }
        return;
        visitNode(node, IncrementalNode);
        {
            var text = "";
            if (aggressiveChecks && shouldCheckNode(node)) {
                text = oldText.substring(node.pos, node.end);
            }
            // Ditch any existing LS children we may have created.  This way we can avoid
            // moving them forward.
            if (node._children) {
                node._children = undefined;
            }
            node.pos += delta;
            node.end += delta;
            if (aggressiveChecks && shouldCheckNode(node)) {
                Debug.assert(text === newText.substring(node.pos, node.end));
            }
            forEachChild(node, visitNode, visitArray);
            if (node.jsDocComments) {
                for (var _i = 0, _a = node.jsDocComments; _i < _a.length; _i++) {
                    var jsDocComment = _a[_i];
                    forEachChild(jsDocComment, visitNode, visitArray);
                }
            }
            checkNodePositions(node, aggressiveChecks);
        }
        visitArray(array, IncrementalNodeArray);
        {
            array._children = undefined;
            array.pos += delta;
            array.end += delta;
            for (var _b = 0, array_1 = array; _b < array_1.length; _b++) {
                var node = array_1[_b];
                visitNode(node);
            }
        }
    }
    shouldCheckNode(node, Node);
    {
        switch (node.kind) {
            case tokenType_1.TokenType.StringLiteral:
            case tokenType_1.TokenType.NumericLiteral:
            case tokenType_1.TokenType.Identifier:
                return true;
        }
        return false;
    }
    adjustIntersectingElement(element, IncrementalElement, changeStart, number, changeRangeOldEnd, number, changeRangeNewEnd, number, delta, number);
    {
        Debug.assert(element.end >= changeStart, "Adjusting an element that was entirely before the change range");
        Debug.assert(element.pos <= changeRangeOldEnd, "Adjusting an element that was entirely after the change range");
        Debug.assert(element.pos <= element.end);
        // We have an element that intersects the change range in some way.  It may have its
        // start, or its end (or both) in the changed range.  We want to adjust any part
        // that intersects such that the final tree is in a consistent state.  i.e. all
        // children have spans within the span of their parent, and all siblings are ordered
        // properly.
        // We may need to update both the 'pos' and the 'end' of the element.
        // If the 'pos' is before the start of the change, then we don't need to touch it.
        // If it isn't, then the 'pos' must be inside the change.  How we update it will
        // depend if delta is  positive or negative.  If delta is positive then we have
        // something like:
        //
        //  -------------------AAA-----------------
        //  -------------------BBBCCCCCCC-----------------
        //
        // In this case, we consider any node that started in the change range to still be
        // starting at the same position.
        //
        // however, if the delta is negative, then we instead have something like this:
        //
        //  -------------------XXXYYYYYYY-----------------
        //  -------------------ZZZ-----------------
        //
        // In this case, any element that started in the 'X' range will keep its position.
        // However any element that started after that will have their pos adjusted to be
        // at the end of the new range.  i.e. any node that started in the 'Y' range will
        // be adjusted to have their start at the end of the 'Z' range.
        //
        // The element will keep its position if possible.  Or Move backward to the new-end
        // if it's in the 'Y' range.
        element.pos = Math.min(element.pos, changeRangeNewEnd);
        // If the 'end' is after the change range, then we always adjust it by the delta
        // amount.  However, if the end is in the change range, then how we adjust it
        // will depend on if delta is  positive or negative.  If delta is positive then we
        // have something like:
        //
        //  -------------------AAA-----------------
        //  -------------------BBBCCCCCCC-----------------
        //
        // In this case, we consider any node that ended inside the change range to keep its
        // end position.
        //
        // however, if the delta is negative, then we instead have something like this:
        //
        //  -------------------XXXYYYYYYY-----------------
        //  -------------------ZZZ-----------------
        //
        // In this case, any element that ended in the 'X' range will keep its position.
        // However any element that ended after that will have their pos adjusted to be
        // at the end of the new range.  i.e. any node that ended in the 'Y' range will
        // be adjusted to have their end at the end of the 'Z' range.
        if (element.end >= changeRangeOldEnd) {
            // Element ends after the change range.  Always adjust the end pos.
            element.end += delta;
        }
        else {
            // Element ends in the change range.  The element will keep its position if
            // possible. Or Move backward to the new-end if it's in the 'Y' range.
            element.end = Math.min(element.end, changeRangeNewEnd);
        }
        Debug.assert(element.pos <= element.end);
        if (element.parent) {
            Debug.assert(element.pos >= element.parent.pos);
            Debug.assert(element.end <= element.parent.end);
        }
    }
    checkNodePositions(node, Node, aggressiveChecks, boolean);
    {
        if (aggressiveChecks) {
            var pos_1 = node.pos;
            forEachChild(node, function (child) {
                Debug.assert(child.pos >= pos_1);
                pos_1 = child.end;
            });
            Debug.assert(pos_1 <= node.end);
        }
    }
    updateTokenPositionsAndMarkElements(sourceFile, IncrementalNode, changeStart, number, changeRangeOldEnd, number, changeRangeNewEnd, number, delta, number, oldText, string, newText, string, aggressiveChecks, boolean);
    void {
        visitNode: function (sourceFile) { },
        return: ,
        visitNode: function (child) {
            Debug.assert(child.pos <= child.end);
            if (child.pos > changeRangeOldEnd) {
                // Node is entirely past the change range.  We need to move both its pos and
                // end, forward or backward appropriately.
                moveElementEntirelyPastChangeRange(child, /*isArray*/ false, delta, oldText, newText, aggressiveChecks);
                return;
            }
            // Check if the element intersects the change range.  If it does, then it is not
            // reusable.  Also, we'll need to recurse to see what constituent portions we may
            // be able to use.
            var fullEnd = child.end;
            if (fullEnd >= changeStart) {
                child.intersectsChange = true;
                child._children = undefined;
                // Adjust the pos or end (or both) of the intersecting element accordingly.
                adjustIntersectingElement(child, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta);
                forEachChild(child, visitNode, visitArray);
                checkNodePositions(child, aggressiveChecks);
                return;
            }
            // Otherwise, the node is entirely before the change range.  No need to do anything with it.
            Debug.assert(fullEnd < changeStart);
        },
        visitArray: function (array) {
            Debug.assert(array.pos <= array.end);
            if (array.pos > changeRangeOldEnd) {
                // Array is entirely after the change range.  We need to move it, and move any of
                // its children.
                moveElementEntirelyPastChangeRange(array, /*isArray*/ true, delta, oldText, newText, aggressiveChecks);
                return;
            }
            // Check if the element intersects the change range.  If it does, then it is not
            // reusable.  Also, we'll need to recurse to see what constituent portions we may
            // be able to use.
            var fullEnd = array.end;
            if (fullEnd >= changeStart) {
                array.intersectsChange = true;
                array._children = undefined;
                // Adjust the pos or end (or both) of the intersecting array accordingly.
                adjustIntersectingElement(array, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta);
                for (var _i = 0, array_2 = array; _i < array_2.length; _i++) {
                    var node = array_2[_i];
                    visitNode(node);
                }
                return;
            }
            // Otherwise, the array is entirely before the change range.  No need to do anything with it.
            Debug.assert(fullEnd < changeStart);
        }
    };
    extendToAffectedRange(sourceFile, SourceFile, changeRange, TextChangeRange);
    TextChangeRange;
    {
        // Consider the following code:
        //      void foo() { /; }
        //
        // If the text changes with an insertion of / just before the semicolon then we end up with:
        //      void foo() { //; }
        //
        // If we were to just use the changeRange a is, then we would not rescan the { token
        // (as it does not intersect the actual original change range).  Because an edit may
        // change the token touching it, we actually need to look back *at least* one token so
        // that the prior token sees that change.
        var maxLookahead = 1;
        var start = changeRange.span.start;
        // the first iteration aligns us with the change start. subsequent iteration move us to
        // the left by maxLookahead tokens.  We only need to do this as long as we're not at the
        // start of the tree.
        for (var i = 0; start > 0 && i <= maxLookahead; i++) {
            var nearestNode = findNearestNodeStartingBeforeOrAtPosition(sourceFile, start);
            Debug.assert(nearestNode.pos <= start);
            var position = nearestNode.pos;
            start = Math.max(0, position - 1);
        }
        var finalSpan = createTextSpanFromBounds(start, textSpanEnd(changeRange.span));
        var finalLength = changeRange.newLength + (changeRange.span.start - start);
        return createTextChangeRange(finalSpan, finalLength);
    }
    findNearestNodeStartingBeforeOrAtPosition(sourceFile, SourceFile, position, number);
    Node;
    {
        var bestResult = sourceFile;
        var lastNodeEntirelyBeforePosition = void 0;
        forEachChild(sourceFile, visit);
        if (lastNodeEntirelyBeforePosition) {
            var lastChildOfLastEntireNodeBeforePosition = getLastChild(lastNodeEntirelyBeforePosition);
            if (lastChildOfLastEntireNodeBeforePosition.pos > bestResult.pos) {
                bestResult = lastChildOfLastEntireNodeBeforePosition;
            }
        }
        return bestResult;
        getLastChild(node, Node);
        Node;
        {
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
        getLastChildWorker(node, Node);
        Node;
        {
            var last_1 = undefined;
            forEachChild(node, function (child) {
                if (nodeIsPresent(child)) {
                    last_1 = child;
                }
            });
            return last_1;
        }
        visit(child, Node);
        {
            if (nodeIsMissing(child)) {
                // Missing nodes are effectively invisible to us.  We never even consider them
                // When trying to find the nearest node before us.
                return;
            }
            // If the child intersects this position, then this node is currently the nearest
            // node that starts before the position.
            if (child.pos <= position) {
                if (child.pos >= bestResult.pos) {
                    // This node starts before the position, and is closer to the position than
                    // the previous best node we found.  It is now the new best node.
                    bestResult = child;
                }
                // Now, the node may overlap the position, or it may end entirely before the
                // position.  If it overlaps with the position, then either it, or one of its
                // children must be the nearest node before the position.  So we can just
                // recurse into this child to see if we can find something better.
                if (position < child.end) {
                    // The nearest node is either this child, or one of the children inside
                    // of it.  We've already marked this child as the best so far.  Recurse
                    // in case one of the children is better.
                    forEachChild(child, visit);
                    // Once we look at the children of this node, then there's no need to
                    // continue any further.
                    return true;
                }
                else {
                    Debug.assert(child.end <= position);
                    // The child ends entirely before this position.  Say you have the following
                    // (where $ is the position)
                    //
                    //      <complex expr 1> ? <complex expr 2> $ : <...> <...>
                    //
                    // We would want to find the nearest preceding node in "complex expr 2".
                    // To support that, we keep track of this node, and once we're done searching
                    // for a best node, we recurse down this node to see if we can find a good
                    // result in it.
                    //
                    // This approach allows us to quickly skip over nodes that are entirely
                    // before the position, while still allowing us to find any nodes in the
                    // last one that might be what we want.
                    lastNodeEntirelyBeforePosition = child;
                }
            }
            else {
                Debug.assert(child.pos > position);
                // We're now at a node that is entirely past the position we're searching for.
                // This node (and all following nodes) could never contribute to the result,
                // so just skip them by returning 'true' here.
                return true;
            }
        }
    }
    checkChangeRange(sourceFile, SourceFile, newText, string, textChangeRange, TextChangeRange, aggressiveChecks, boolean);
    {
        var oldText = sourceFile.text;
        if (textChangeRange) {
            Debug.assert((oldText.length - textChangeRange.span.length + textChangeRange.newLength) === newText.length);
            if (aggressiveChecks || Debug.shouldAssert(AssertionLevel.VeryAggressive)) {
                var oldTextPrefix = oldText.substr(0, textChangeRange.span.start);
                var newTextPrefix = newText.substr(0, textChangeRange.span.start);
                Debug.assert(oldTextPrefix === newTextPrefix);
                var oldTextSuffix = oldText.substring(textSpanEnd(textChangeRange.span), oldText.length);
                var newTextSuffix = newText.substring(textSpanEnd(textChangeRangeNewSpan(textChangeRange)), newText.length);
                Debug.assert(oldTextSuffix === newTextSuffix);
            }
        }
    }
    createSyntaxCursor(sourceFile, SourceFile);
    SyntaxCursor;
    {
        var currentArray_1 = sourceFile.statements;
        var currentArrayIndex_1 = 0;
        Debug.assert(currentArrayIndex_1 < currentArray_1.length);
        var current_1 = currentArray_1[currentArrayIndex_1];
        var lastQueriedPosition = -1 /* Value */;
        return {
            currentNode: function (position) {
                // Only compute the current node if the position is different than the last time
                // we were asked.  The parser commonly asks for the node at the same position
                // twice.  Once to know if can read an appropriate list element at a certain point,
                // and then to actually read and consume the node.
                if (position !== lastQueriedPosition) {
                    // Much of the time the parser will need the very next node in the array that
                    // we just returned a node from.So just simply check for that case and move
                    // forward in the array instead of searching for the node again.
                    if (current_1 && current_1.end === position && currentArrayIndex_1 < (currentArray_1.length - 1)) {
                        currentArrayIndex_1++;
                        current_1 = currentArray_1[currentArrayIndex_1];
                    }
                    // If we don't have a node, or the node we have isn't in the right position,
                    // then try to find a viable node at the position requested.
                    if (!current_1 || current_1.pos !== position) {
                        findHighestListElementThatStartsAtPosition(position);
                    }
                }
                // Cache this query so that we don't do any extra work if the parser calls back
                // into us.  Note: this is very common as the parser will make pairs of calls like
                // 'isListElement -> parseListElement'.  If we were unable to find a node when
                // called with 'isListElement', we don't want to redo the work when parseListElement
                // is called immediately after.
                lastQueriedPosition = position;
                // Either we don'd have a node, or we have a node at the position being asked for.
                Debug.assert(!current_1 || current_1.pos === position);
                return current_1;
            }
        };
        findHighestListElementThatStartsAtPosition(position, number);
        {
            // Clear out any cached state about the last node we found.
            currentArray_1 = undefined;
            currentArrayIndex_1 = -1 /* Value */;
            current_1 = undefined;
            // Recurse into the source file to find the highest node at this position.
            forEachChild(sourceFile, visitNode, visitArray);
            return;
            visitNode(node, Node);
            {
                if (position >= node.pos && position < node.end) {
                    // Position was within this node.  Keep searching deeper to find the node.
                    forEachChild(node, visitNode, visitArray);
                    // don't proceed any further in the search.
                    return true;
                }
                // position wasn't in this node, have to keep searching.
                return false;
            }
            visitArray(array, NodeArray(), {
                if: function (position) {
                    if (position === void 0) { position =  >= array.pos && position < array.end; }
                    // position was in this array.  Search through this array to see if we find a
                    // viable element.
                    for (var i = 0, n = array.length; i < n; i++) {
                        var child = array[i];
                        if (child) {
                            if (child.pos === position) {
                                // Found the right node.  We're done.
                                currentArray_1 = array;
                                currentArrayIndex_1 = i;
                                current_1 = child;
                                return true;
                            }
                            else {
                                if (child.pos < position && position < child.end) {
                                    // Position in somewhere within this child.  Search in it and
                                    // stop searching in this array.
                                    forEachChild(child, visitNode, visitArray);
                                    return true;
                                }
                            }
                        }
                    }
                },
                // position wasn't in this array, have to keep searching.
                return: false
            });
        }
    }
})(IncrementalParser || (IncrementalParser = {}));
var ParseFlags;
(function (ParseFlags) {
    ParseFlags[ParseFlags["allowIn"] = 0] = "allowIn";
    ParseFlags[ParseFlags["allowYield"] = 1] = "allowYield";
    ParseFlags[ParseFlags["allowAwait"] = 2] = "allowAwait";
})(ParseFlags || (ParseFlags = {}));
//# sourceMappingURL=parser.js.map