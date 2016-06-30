/**
 * @fileOverview 语法解析器
 */

import {TokenType, tokenToString, isNonReservedWord} from './tokenType';
import {Lexer} from './lexer';
import * as ast from './nodes';
import * as Compiler from '../compiler/compiler';

/**
 * 表示一个语法解析器。
 */
export class Parser {

    /**
     * 获取或设置当前语法解析器使用的词法解析器。
     */
    lexer = new Lexer();

    /**
     * 存储内部解析的标记。
     */
    private flags: ParseFlags = 0;

    /**
     * 解析指定的代码。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param end 解析的源码结束位置。
     * @param fileName 解析的源码位置。
     */
    parse(source: string, start?: number, end?: number, fileName?: string) {

    }

    /**
     * 解析指定的标记。
     * @param token 期待的标记。
     * @returns 如果已解析到正确的标签则返回 true，否则返回 false。
     */
    private parseExpected(token: TokenType) {
        if (this.lexer.tokenType === token) {
            this.lexer.read();
            return true;
        }

        this.reportSyntaxError("应输入“{0}”；实际是“{1}”", tokenToString(token), tokenToString(this.lexer.tokenType));
        return false;
    }

    /**
     * 如果存在则解析指定的标记。
     * @param token 期待的标记。
     */
    private parseOptional(token: TokenType) {
        if (this.lexer.tokenType === token) {
            this.lexer.read();
            return true;
        }
        return false;
    }

    /**
     * 报告语法错误。
     * @param message 错误的信息。
     * @param args 格式化错误的参数。
     */
    reportSyntaxError(message: string, ...args: any[]) {

    }

    // #region 语句

    /**
     * 解析一个语句。
     */
    private parseStatement() {
        switch (this.lexer.tokenType) {
            case TokenType.semicolon:
                return this.parseEmptyStatement();
            case TokenType.openBrace:
                return parseBlock(/*ignoreMissingOpenBrace*/ false);
            case TokenType.VarKeyword:
                return parseVariableStatement(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case TokenType.LetKeyword:
                if (isLetDeclaration()) {
                    return parseVariableStatement(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
                }
                break;
            case TokenType.FunctionKeyword:
                return parseFunctionDeclaration(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case TokenType.ClassKeyword:
                return parseClassDeclaration(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case TokenType.IfKeyword:
                return parseIfStatement();
            case TokenType.DoKeyword:
                return parseDoStatement();
            case TokenType.WhileKeyword:
                return parseWhileStatement();
            case TokenType.ForKeyword:
                return parseForOrForInOrForOfStatement();
            case TokenType.ContinueKeyword:
                return parseBreakOrContinueStatement(TokenType.ContinueStatement);
            case TokenType.BreakKeyword:
                return parseBreakOrContinueStatement(TokenType.BreakStatement);
            case TokenType.ReturnKeyword:
                return parseReturnStatement();
            case TokenType.WithKeyword:
                return parseWithStatement();
            case TokenType.SwitchKeyword:
                return parseSwitchStatement();
            case TokenType.ThrowKeyword:
                return parseThrowStatement();
            case TokenType.TryKeyword:
            // Include 'catch' and 'finally' for error recovery.
            case TokenType.CatchKeyword:
            case TokenType.FinallyKeyword:
                return parseTryStatement();
            case TokenType.DebuggerKeyword:
                return parseDebuggerStatement();
            case TokenType.AtToken:
                return parseDeclaration();
            case TokenType.AsyncKeyword:
            case TokenType.InterfaceKeyword:
            case TokenType.TypeKeyword:
            case TokenType.ModuleKeyword:
            case TokenType.NamespaceKeyword:
            case TokenType.DeclareKeyword:
            case TokenType.ConstKeyword:
            case TokenType.EnumKeyword:
            case TokenType.ExportKeyword:
            case TokenType.ImportKeyword:
            case TokenType.PrivateKeyword:
            case TokenType.ProtectedKeyword:
            case TokenType.PublicKeyword:
            case TokenType.AbstractKeyword:
            case TokenType.StaticKeyword:
            case TokenType.ReadonlyKeyword:
            case TokenType.GlobalKeyword:
                if (isStartOfDeclaration()) {
                    return parseDeclaration();
                }
                break;
        }
        return parseExpressionOrLabeledStatement();
    }

    private parseEmptyStatement() {
        const result = new ast.EmptyStatement();
        result.start = this.lexer.tokenStart;
        this.this.parseExpected(TokenType.semicolon);
        result.end = this.lexer.tokenEnd;
        return result;
    }
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

    private parseSourceFile(fileName: string, _sourceText: string, languageVersion: ScriptTarget, _syntaxCursor: IncrementalParser.SyntaxCursor, setParentNodes?: boolean, scriptKind?: ScriptKind): SourceFile {
        scriptKind = ensureScriptKind(fileName, scriptKind);

        initializeState(fileName, _sourceText, languageVersion, _syntaxCursor, scriptKind);

        const result = parseSourceFileWorker(fileName, languageVersion, setParentNodes, scriptKind);

        clearState();

        return result;
    }

    private getLanguageVariant(scriptKind: ScriptKind) {
        // .tsx and .jsx files are treated as jsx language variant.
        return scriptKind === ScriptKind.TSX || scriptKind === ScriptKind.JSX || scriptKind === ScriptKind.JS ? LanguageVariant.JSX : LanguageVariant.Standard;
    }

    private initializeState(fileName: string, _sourceText: string, languageVersion: ScriptTarget, _syntaxCursor: IncrementalParser.SyntaxCursor, scriptKind: ScriptKind) {
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
    }

    private clearState() {
        // Clear out the text the scanner is pointing at, so it doesn't keep anything alive unnecessarily.
        scanner.setText("");
        scanner.setOnError(undefined);

        // Clear any data.  We don't want to accidentally hold onto it for too long.
        parseDiagnostics = undefined;
        sourceFile = undefined;
        identifiers = undefined;
        syntaxCursor = undefined;
        sourceText = undefined;
    }

    private parseSourceFileWorker(fileName: string, languageVersion: ScriptTarget, setParentNodes: boolean, scriptKind: ScriptKind): SourceFile {
        sourceFile = createSourceFile(fileName, languageVersion, scriptKind);
        sourceFile.flags = contextFlags;

        // Prime the scanner.
        token = nextToken();
        processReferenceComments(sourceFile);

        sourceFile.statements = parseList(ParsingContext.SourceElements, parseStatement);
        Debug.assert(token === TokenType.EndOfFileToken);
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
    }


    private addJSDocComment<T extends Node>(node: T): T {
        if (contextFlags & NodeFlags.JavaScriptFile) {
            const comments = getLeadingCommentRangesOfNode(node, sourceFile);
            if (comments) {
                for (const comment of comments) {
                    const jsDocComment = JSDocParser.parseJSDocComment(node, comment.pos, comment.end - comment.pos);
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

    export private fixupParentReferences(rootNode: Node) {
        // normally parent references are set during binding. However, for clients that only need
        // a syntax tree, and no semantic features, then the binding process is an unnecessary
        // overhead.  This privates allows us to set all the parents, without all the expense of
        // binding.

        let parent: Node = rootNode;
        forEachChild(rootNode, visitNode);
        return;

        function visitNode(n: Node): void {
            // walk down setting parents that differ from the parent we think it should be.  This
            // allows us to quickly bail out of setting parents for subtrees during incremental
            // parsing
            if (n.parent !== parent) {
                n.parent = parent;

                const saveParent = parent;
                parent = n;
                forEachChild(n, visitNode);
                if (n.jsDocComments) {
                    for (const jsDocComment of n.jsDocComments) {
                        jsDocComment.parent = n;
                        parent = jsDocComment;
                        forEachChild(jsDocComment, visitNode);
                    }
                }
                parent = saveParent;
            }
        }
    }

    private createSourceFile(fileName: string, languageVersion: ScriptTarget, scriptKind: ScriptKind): SourceFile {
        // code from createNode is inlined here so createNode won't have to deal with special case of creating source files
        // this is quite rare comparing to other nodes and createNode should be as fast as possible
        const sourceFile = <SourceFile>new SourceFileConstructor(TokenType.SourceFile, /*pos*/ 0, /* end */ sourceText.length);
        nodeCount++;

        sourceFile.text = sourceText;
        sourceFile.bindDiagnostics = [];
        sourceFile.languageVersion = languageVersion;
        sourceFile.fileName = normalizePath(fileName);
        sourceFile.languageVariant = getLanguageVariant(scriptKind);
        sourceFile.isDeclarationFile = fileExtensionIs(sourceFile.fileName, ".d.ts");
        sourceFile.scriptKind = scriptKind;

        return sourceFile;
    }

    private setContextFlag(val: boolean, flag: NodeFlags) {
        if (val) {
            contextFlags |= flag;
        }
        else {
            contextFlags &= ~flag;
        }
    }

    private setDisallowInContext(val: boolean) {
        setContextFlag(val, NodeFlags.DisallowInContext);
    }

    private setYieldContext(val: boolean) {
        setContextFlag(val, NodeFlags.YieldContext);
    }

    private setDecoratorContext(val: boolean) {
        setContextFlag(val, NodeFlags.DecoratorContext);
    }

    private setAwaitContext(val: boolean) {
        setContextFlag(val, NodeFlags.AwaitContext);
    }

    private doOutsideOfContext<T>(context: NodeFlags, func: () => T): T {
        // contextFlagsToClear will contain only the context flags that are
        // currently set that we need to temporarily clear
        // We don't just blindly reset to the previous flags to ensure
        // that we do not mutate cached flags for the incremental
        // parser (ThisNodeHasError, ThisNodeOrAnySubNodesHasError, and
        // HasAggregatedChildData).
        const contextFlagsToClear = context & contextFlags;
        if (contextFlagsToClear) {
            // clear the requested context flags
            setContextFlag(/*val*/ false, contextFlagsToClear);
            const result = func();
            // restore the context flags we just cleared
            setContextFlag(/*val*/ true, contextFlagsToClear);
            return result;
        }

        // no need to do anything special as we are not in any of the requested contexts
        return func();
    }

    private doInsideOfContext<T>(context: NodeFlags, func: () => T): T {
        // contextFlagsToSet will contain only the context flags that
        // are not currently set that we need to temporarily enable.
        // We don't just blindly reset to the previous flags to ensure
        // that we do not mutate cached flags for the incremental
        // parser (ThisNodeHasError, ThisNodeOrAnySubNodesHasError, and
        // HasAggregatedChildData).
        const contextFlagsToSet = context & ~contextFlags;
        if (contextFlagsToSet) {
            // set the requested context flags
            setContextFlag(/*val*/ true, contextFlagsToSet);
            const result = func();
            // reset the context flags we just set
            setContextFlag(/*val*/ false, contextFlagsToSet);
            return result;
        }

        // no need to do anything special as we are already in all of the requested contexts
        return func();
    }

    private allowInAnd<T>(func: () => T): T {
        return doOutsideOfContext(NodeFlags.DisallowInContext, func);
    }

    private disallowInAnd<T>(func: () => T): T {
        return doInsideOfContext(NodeFlags.DisallowInContext, func);
    }

    private doInYieldContext<T>(func: () => T): T {
        return doInsideOfContext(NodeFlags.YieldContext, func);
    }

    private doInDecoratorContext<T>(func: () => T): T {
        return doInsideOfContext(NodeFlags.DecoratorContext, func);
    }

    private doInAwaitContext<T>(func: () => T): T {
        return doInsideOfContext(NodeFlags.AwaitContext, func);
    }

    private doOutsideOfAwaitContext<T>(func: () => T): T {
        return doOutsideOfContext(NodeFlags.AwaitContext, func);
    }

    private doInYieldAndAwaitContext<T>(func: () => T): T {
        return doInsideOfContext(NodeFlags.YieldContext | NodeFlags.AwaitContext, func);
    }

    private inContext(flags: NodeFlags) {
        return (contextFlags & flags) !== 0;
    }

    private inYieldContext() {
        return inContext(NodeFlags.YieldContext);
    }

    private inDisallowInContext() {
        return inContext(NodeFlags.DisallowInContext);
    }

    private inDecoratorContext() {
        return inContext(NodeFlags.DecoratorContext);
    }

    private inAwaitContext() {
        return inContext(NodeFlags.AwaitContext);
    }

    private parseErrorAtCurrentToken(message: DiagnosticMessage, arg0?: any): void {
        const start = scanner.getTokenPos();
        const length = scanner.getTextPos() - start;

        parseErrorAtPosition(start, length, message, arg0);
    }

    private parseErrorAtPosition(start: number, length: number, message: DiagnosticMessage, arg0?: any): void {
        // Don't report another error if it would just be at the same position as the last error.
        const lastError = lastOrUndefined(parseDiagnostics);
        if (!lastError || start !== lastError.start) {
            parseDiagnostics.push(createFileDiagnostic(sourceFile, start, length, message, arg0));
        }

        // Mark that we've encountered an error.  We'll set an appropriate bit on the next
        // node we finish so that it can't be reused incrementally.
        parseErrorBeforeNextFinishedNode = true;
    }

    private scanError(message: DiagnosticMessage, length?: number) {
        const pos = scanner.getTextPos();
        parseErrorAtPosition(pos, length || 0, message);
    }

    private getNodePos(): number {
        return scanner.getStartPos();
    }

    private getNodeEnd(): number {
        return scanner.getStartPos();
    }

    private nextToken(): TokenType {
        return token = scanner.scan();
    }

    private reScanGreaterToken(): TokenType {
        return token = scanner.reScanGreaterToken();
    }

    private reScanSlashToken(): TokenType {
        return token = scanner.reScanSlashToken();
    }

    private reScanTemplateToken(): TokenType {
        return token = scanner.reScanTemplateToken();
    }

    private scanJsxIdentifier(): TokenType {
        return token = scanner.scanJsxIdentifier();
    }

    private scanJsxText(): TokenType {
        return token = scanner.scanJsxToken();
    }

    private speculationHelper<T>(callback: () => T, isLookAhead: boolean): T {
        // Keep track of the state we'll need to rollback to if lookahead fails (or if the
        // caller asked us to always reset our state).
        const saveToken = token;
        const saveParseDiagnosticsLength = parseDiagnostics.length;
        const saveParseErrorBeforeNextFinishedNode = parseErrorBeforeNextFinishedNode;

        // Note: it is not actually necessary to save/restore the context flags here.  That's
        // because the saving/restoring of these flags happens naturally through the recursive
        // descent nature of our parser.  However, we still store this here just so we can
        // assert that that invariant holds.
        const saveContextFlags = contextFlags;

        // If we're only looking ahead, then tell the scanner to only lookahead as well.
        // Otherwise, if we're actually speculatively parsing, then tell the scanner to do the
        // same.
        const result = isLookAhead
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
    }

    /** Invokes the provided callback then unconditionally restores the parser to the state it
     * was in immediately prior to invoking the callback.  The result of invoking the callback
     * is returned from this private.
     */
    private lookAhead<T>(callback: () => T): T {
        return speculationHelper(callback, /*isLookAhead*/ true);
    }

    /** Invokes the provided callback.  If the callback returns something falsy, then it restores
     * the parser to the state it was in immediately prior to invoking the callback.  If the
     * callback returns something truthy, then the parser state is not rolled back.  The result
     * of invoking the callback is returned from this private.
     */
    private tryParse<T>(callback: () => T): T {
        return speculationHelper(callback, /*isLookAhead*/ false);
    }

    /**
     * 判断是否紧跟一个标识符。
     */
    private fallowsIdentifier() {
        switch (this.lexer.currentToken.type) {
            case TokenType.identifier:
                return true;

            // If we have a 'yield' keyword, and we're in the [yield] context, then 'yield' is
            // considered a keyword and is not an identifier.
            case TokenType.yield:
                if (this.flags & ParseFlags.allowYield) {
                    return false;
                }

            // If we have a 'await' keyword, and we're in the [Await] context, then 'await' is
            // considered a keyword and is not an identifier.
            case TokenType.await:
                if (this.flags & ParseFlags.allowAwait) {
                    return false;
                }

            default:
                return isNonReservedWord(this.lexer.currentToken.type);
        }

    }

    private parseOptionalToken(t: TokenType): Node {
        if (token === t) {
            return parseTokenNode();
        }
        return undefined;
    }

    private parseTokenNode<T extends Node>(): T {
        const node = <T>createNode(token);
        nextToken();
        return finishNode(node);
    }

    /**
     * 判断当前位置是否可以自动插入分号。
     */
    private autoInsertSemicolon() {
        switch (this.lexer.tokenType) {
            case TokenType.semicolon:
            case TokenType.closeBrace:
            case TokenType.endOfFile:
                return true;
            default:
                return this.lexer.hasLineTerminatorBeforeTokenStart;
        }
    }

    private parseSemicolon(): boolean {
        if (this.autoInsertSemicolon()) {
            if (token === TokenType.SemicolonToken) {
                // consume the semicolon if it was explicitly provided.
                nextToken();
            }

            return true;
        }
        else {
            return this.parseExpected(TokenType.SemicolonToken);
        }
    }

    // note: this private creates only node
    private createNode(kind: TokenType, pos?: number): Node {
        nodeCount++;
        if (!(pos >= 0)) {
            pos = scanner.getStartPos();
        }

        return new NodeConstructor(kind, pos, pos);
    }

    private finishNode<T extends Node>(node: T, end?: number): T {
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
    }

    private createMissingNode(kind: TokenType, reportAtCurrentPosition: boolean, diagnosticMessage: DiagnosticMessage, arg0?: any): Node {
        if (reportAtCurrentPosition) {
            parseErrorAtPosition(scanner.getStartPos(), 0, diagnosticMessage, arg0);
        }
        else {
            parseErrorAtCurrentToken(diagnosticMessage, arg0);
        }

        const result = createNode(kind, scanner.getStartPos());
        (<Identifier>result).text = "";
        return finishNode(result);
    }

    private internIdentifier(text: string): string {
        text = escapeIdentifier(text);
        return hasProperty(identifiers, text) ? identifiers[text] : (identifiers[text] = text);
    }

    // An identifier that starts with two underscores has an extra underscore character prepended to it to avoid issues
    // with magic property names like '__proto__'. The 'identifiers' object is used to share a single string instance for
    // each identifier in order to reduce memory consumption.
    private createIdentifier(isIdentifier: boolean, diagnosticMessage?: DiagnosticMessage): Identifier {
        identifierCount++;
        if (isIdentifier) {
            const node = <Identifier>createNode(TokenType.Identifier);

            // Store original token kind if it is not just an Identifier so we can report appropriate error later in type checker
            if (token !== TokenType.Identifier) {
                node.originalKeywordKind = token;
            }
            node.text = internIdentifier(scanner.getTokenValue());
            nextToken();
            return finishNode(node);
        }

        return <Identifier>createMissingNode(TokenType.Identifier, /*reportAtCurrentPosition*/ false, diagnosticMessage || Diagnostics.Identifier_expected);
    }

    private parseIdentifier(diagnosticMessage?: DiagnosticMessage): Identifier {
        return createIdentifier(isIdentifier(), diagnosticMessage);
    }

    private parseIdentifierName(): Identifier {
        return createIdentifier(tokenIsIdentifierOrKeyword(token));
    }

    private isLiteralPropertyName(): boolean {
        return tokenIsIdentifierOrKeyword(token) ||
            token === TokenType.StringLiteral ||
            token === TokenType.NumericLiteral;
    }

    private parsePropertyNameWorker(allowComputedPropertyNames: boolean): PropertyName {
        if (token === TokenType.StringLiteral || token === TokenType.NumericLiteral) {
            return parseLiteralNode(/*internName*/ true);
        }
        if (allowComputedPropertyNames && token === TokenType.OpenBracketToken) {
            return parseComputedPropertyName();
        }
        return parseIdentifierName();
    }

    private parsePropertyName(): PropertyName {
        return parsePropertyNameWorker(/*allowComputedPropertyNames*/ true);
    }

    private parseSimplePropertyName(): Identifier | LiteralExpression {
        return <Identifier | LiteralExpression>parsePropertyNameWorker(/*allowComputedPropertyNames*/ false);
    }

    private isSimplePropertyName() {
        return token === TokenType.StringLiteral || token === TokenType.NumericLiteral || tokenIsIdentifierOrKeyword(token);
    }

    private parseComputedPropertyName(): ComputedPropertyName {
        // PropertyName [Yield]:
        //      LiteralPropertyName
        //      ComputedPropertyName[?Yield]
        const node = <ComputedPropertyName>createNode(TokenType.ComputedPropertyName);
        this.parseExpected(TokenType.OpenBracketToken);

        // We parse any expression (including a comma expression). But the grammar
        // says that only an assignment expression is allowed, so the grammar checker
        // will error if it sees a comma expression.
        node.expression = allowInAnd(parseExpression);

        this.parseExpected(TokenType.CloseBracketToken);
        return finishNode(node);
    }

    private parseContextualModifier(t: TokenType): boolean {
        return token === t && tryParse(nextTokenCanFollowModifier);
    }

    private nextTokenIsOnSameLineAndCanFollowModifier() {
        nextToken();
        if (scanner.hasPrecedingLineBreak()) {
            return false;
        }
        return canFollowModifier();
    }

    private nextTokenCanFollowModifier() {
        if (token === TokenType.ConstKeyword) {
            // 'const' is only a modifier if followed by 'enum'.
            return nextToken() === TokenType.EnumKeyword;
        }
        if (token === TokenType.ExportKeyword) {
            nextToken();
            if (token === TokenType.DefaultKeyword) {
                return lookAhead(nextTokenIsClassOrFunction);
            }
            return token !== TokenType.AsteriskToken && token !== TokenType.AsKeyword && token !== TokenType.OpenBraceToken && canFollowModifier();
        }
        if (token === TokenType.DefaultKeyword) {
            return nextTokenIsClassOrFunction();
        }
        if (token === TokenType.StaticKeyword) {
            nextToken();
            return canFollowModifier();
        }

        return nextTokenIsOnSameLineAndCanFollowModifier();
    }

    private parseAnyContextualModifier(): boolean {
        return isModifierKind(token) && tryParse(nextTokenCanFollowModifier);
    }

    private canFollowModifier(): boolean {
        return token === TokenType.OpenBracketToken
            || token === TokenType.OpenBraceToken
            || token === TokenType.AsteriskToken
            || token === TokenType.DotDotDotToken
            || isLiteralPropertyName();
    }

    private nextTokenIsClassOrFunction(): boolean {
        nextToken();
        return token === TokenType.ClassKeyword || token === TokenType.FunctionKeyword;
    }

    // True if positioned at the start of a list element
    private isListElement(parsingContext: ParsingContext, inErrorRecovery: boolean): boolean {
        const node = currentNode(parsingContext);
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
                return !(token === TokenType.SemicolonToken && inErrorRecovery) && isStartOfStatement();
            case ParsingContext.SwitchClauses:
                return token === TokenType.CaseKeyword || token === TokenType.DefaultKeyword;
            case ParsingContext.TypeMembers:
                return lookAhead(isTypeMemberStart);
            case ParsingContext.ClassMembers:
                // We allow semicolons as class elements (as specified by ES6) as long as we're
                // not in error recovery.  If we're in error recovery, we don't want an errant
                // semicolon to be treated as a class member (since they're almost always used
                // for statements.
                return lookAhead(isClassMemberStart) || (token === TokenType.SemicolonToken && !inErrorRecovery);
            case ParsingContext.EnumMembers:
                // Include open bracket computed properties. This technically also lets in indexers,
                // which would be a candidate for improved error reporting.
                return token === TokenType.OpenBracketToken || isLiteralPropertyName();
            case ParsingContext.ObjectLiteralMembers:
                return token === TokenType.OpenBracketToken || token === TokenType.AsteriskToken || isLiteralPropertyName();
            case ParsingContext.ObjectBindingElements:
                return token === TokenType.OpenBracketToken || isLiteralPropertyName();
            case ParsingContext.HeritageClauseElement:
                // If we see { } then only consume it as an expression if it is followed by , or {
                // That way we won't consume the body of a class in its heritage clause.
                if (token === TokenType.OpenBraceToken) {
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
                return token === TokenType.CommaToken || token === TokenType.DotDotDotToken || isIdentifierOrPattern();
            case ParsingContext.TypeParameters:
                return isIdentifier();
            case ParsingContext.ArgumentExpressions:
            case ParsingContext.ArrayLiteralMembers:
                return token === TokenType.CommaToken || token === TokenType.DotDotDotToken || fallowsExpression();
            case ParsingContext.Parameters:
                return isStartOfParameter();
            case ParsingContext.TypeArguments:
            case ParsingContext.TupleElementTypes:
                return token === TokenType.CommaToken || isStartOfType();
            case ParsingContext.HeritageClauses:
                return isHeritageClause();
            case ParsingContext.ImportOrExportSpecifiers:
                return tokenIsIdentifierOrKeyword(token);
            case ParsingContext.JsxAttributes:
                return tokenIsIdentifierOrKeyword(token) || token === TokenType.OpenBraceToken;
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
    }

    private isValidHeritageClauseObjectLiteral() {
        Debug.assert(token === TokenType.OpenBraceToken);
        if (nextToken() === TokenType.CloseBraceToken) {
            // if we see  "extends {}" then only treat the {} as what we're extending (and not
            // the class body) if we have:
            //
            //      extends {} {
            //      extends {},
            //      extends {} extends
            //      extends {} implements

            const next = nextToken();
            return next === TokenType.CommaToken || next === TokenType.OpenBraceToken || next === TokenType.ExtendsKeyword || next === TokenType.ImplementsKeyword;
        }

        return true;
    }

    private nextTokenIsIdentifier() {
        nextToken();
        return isIdentifier();
    }

    private nextTokenIsIdentifierOrKeyword() {
        nextToken();
        return tokenIsIdentifierOrKeyword(token);
    }

    private isHeritageClauseExtendsOrImplementsKeyword(): boolean {
        if (token === TokenType.ImplementsKeyword ||
            token === TokenType.ExtendsKeyword) {

            return lookAhead(nextTokenIsStartOfExpression);
        }

        return false;
    }

    private nextTokenIsStartOfExpression() {
        nextToken();
        return fallowsExpression();
    }

    // True if positioned at a list terminator
    private isListTerminator(kind: ParsingContext): boolean {
        if (token === TokenType.EndOfFileToken) {
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
                return token === TokenType.CloseBraceToken;
            case ParsingContext.SwitchClauseStatements:
                return token === TokenType.CloseBraceToken || token === TokenType.CaseKeyword || token === TokenType.DefaultKeyword;
            case ParsingContext.HeritageClauseElement:
                return token === TokenType.OpenBraceToken || token === TokenType.ExtendsKeyword || token === TokenType.ImplementsKeyword;
            case ParsingContext.VariableDeclarations:
                return isVariableDeclaratorListTerminator();
            case ParsingContext.TypeParameters:
                // Tokens other than '>' are here for better error recovery
                return token === TokenType.GreaterThanToken || token === TokenType.OpenParenToken || token === TokenType.OpenBraceToken || token === TokenType.ExtendsKeyword || token === TokenType.ImplementsKeyword;
            case ParsingContext.ArgumentExpressions:
                // Tokens other than ')' are here for better error recovery
                return token === TokenType.CloseParenToken || token === TokenType.SemicolonToken;
            case ParsingContext.ArrayLiteralMembers:
            case ParsingContext.TupleElementTypes:
            case ParsingContext.ArrayBindingElements:
                return token === TokenType.CloseBracketToken;
            case ParsingContext.Parameters:
                // Tokens other than ')' and ']' (the latter for index signatures) are here for better error recovery
                return token === TokenType.CloseParenToken || token === TokenType.CloseBracketToken /*|| token === TokenType.OpenBraceToken*/;
            case ParsingContext.TypeArguments:
                // Tokens other than '>' are here for better error recovery
                return token === TokenType.GreaterThanToken || token === TokenType.OpenParenToken;
            case ParsingContext.HeritageClauses:
                return token === TokenType.OpenBraceToken || token === TokenType.CloseBraceToken;
            case ParsingContext.JsxAttributes:
                return token === TokenType.GreaterThanToken || token === TokenType.SlashToken;
            case ParsingContext.JsxChildren:
                return token === TokenType.LessThanToken && lookAhead(nextTokenIsSlash);
            case ParsingContext.JSDocFunctionParameters:
                return token === TokenType.CloseParenToken || token === TokenType.ColonToken || token === TokenType.CloseBraceToken;
            case ParsingContext.JSDocTypeArguments:
                return token === TokenType.GreaterThanToken || token === TokenType.CloseBraceToken;
            case ParsingContext.JSDocTupleTypes:
                return token === TokenType.CloseBracketToken || token === TokenType.CloseBraceToken;
            case ParsingContext.JSDocRecordMembers:
                return token === TokenType.CloseBraceToken;
        }
    }

    private isVariableDeclaratorListTerminator(): boolean {
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
        if (token === TokenType.EqualsGreaterThanToken) {
            return true;
        }

        // Keep trying to parse out variable declarators.
        return false;
    }

    // True if positioned at element or terminator of the current list or any enclosing list
    private isInSomeParsingContext(): boolean {
        for (let kind = 0; kind < ParsingContext.Count; kind++) {
            if (parsingContext & (1 << kind)) {
                if (isListElement(kind, /*inErrorRecovery*/ true) || isListTerminator(kind)) {
                    return true;
                }
            }
        }

        return false;
    }

    // Parses a list of elements
    private parseList<T extends Node>(kind: ParsingContext, parseElement: () => T): NodeArray<T> {
        const saveParsingContext = parsingContext;
        parsingContext |= 1 << kind;
        const result = <NodeArray<T>>[];
        result.pos = getNodePos();

        while (!isListTerminator(kind)) {
            if (isListElement(kind, /*inErrorRecovery*/ false)) {
                const element = parseListElement(kind, parseElement);
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
    }

    private parseListElement<T extends Node>(parsingContext: ParsingContext, parseElement: () => T): T {
        const node = currentNode(parsingContext);
        if (node) {
            return <T>consumeNode(node);
        }

        return parseElement();
    }

    private currentNode(parsingContext: ParsingContext): Node {
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

        const node = syntaxCursor.currentNode(scanner.getStartPos());

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
        const nodeContextFlags = node.flags & NodeFlags.ContextFlags;
        if (nodeContextFlags !== contextFlags) {
            return undefined;
        }

        // Ok, we have a node that looks like it could be reused.  Now verify that it is valid
        // in the current list parsing context that we're currently at.
        if (!canReuseNode(node, parsingContext)) {
            return undefined;
        }

        return node;
    }

    private consumeNode(node: Node) {
        // Move the scanner so it is after the node we just consumed.
        scanner.setTextPos(node.end);
        nextToken();
        return node;
    }

    private canReuseNode(node: Node, parsingContext: ParsingContext): boolean {
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
    }

    private isReusableClassMember(node: Node) {
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
                    // Method declarations are not necessarily reusable.  An object-literal
                    // may have a method calls "constructor(...)" and we must reparse that
                    // into an actual .ConstructorDeclaration.
                    let methodDeclaration = <MethodDeclaration>node;
                    let nameIsConstructor = methodDeclaration.name.kind === TokenType.Identifier &&
                        (<Identifier>methodDeclaration.name).originalKeywordKind === TokenType.ConstructorKeyword;

                    return !nameIsConstructor;
            }
        }

        return false;
    }

    private isReusableSwitchClause(node: Node) {
        if (node) {
            switch (node.kind) {
                case TokenType.CaseClause:
                case TokenType.DefaultClause:
                    return true;
            }
        }

        return false;
    }

    private isReusableStatement(node: Node) {
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

    private isReusableEnumMember(node: Node) {
        return node.kind === TokenType.EnumMember;
    }

    private isReusableTypeMember(node: Node) {
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

    private isReusableVariableDeclaration(node: Node) {
        if (node.kind !== TokenType.VariableDeclaration) {
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
        const variableDeclarator = <VariableDeclaration>node;
        return variableDeclarator.initializer === undefined;
    }

    private isReusableParameter(node: Node) {
        if (node.kind !== TokenType.Parameter) {
            return false;
        }

        // See the comment in isReusableVariableDeclaration for why we do this.
        const parameter = <ParameterDeclaration>node;
        return parameter.initializer === undefined;
    }

    // Returns true if we should abort parsing.
    private abortParsingListOrMoveToNextToken(kind: ParsingContext) {
        parseErrorAtCurrentToken(parsingContextErrors(kind));
        if (isInSomeParsingContext()) {
            return true;
        }

        nextToken();
        return false;
    }

    private parsingContextErrors(context: ParsingContext): DiagnosticMessage {
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

    // Parses a comma-delimited list of elements
    private parseDelimitedList<T extends Node>(kind: ParsingContext, parseElement: () => T, considerSemicolonAsDelimiter?: boolean): NodeArray<T> {
        const saveParsingContext = parsingContext;
        parsingContext |= 1 << kind;
        const result = <NodeArray<T>>[];
        result.pos = getNodePos();

        let commaStart = -1; // Meaning the previous token was not a comma
        while (true) {
            if (isListElement(kind, /*inErrorRecovery*/ false)) {
                result.push(parseListElement(kind, parseElement));
                commaStart = scanner.getTokenPos();
                if (parseOptional(TokenType.CommaToken)) {
                    continue;
                }

                commaStart = -1; // Back to the state where the last token was not a comma
                if (isListTerminator(kind)) {
                    break;
                }

                // We didn't get a comma, and the list wasn't terminated, explicitly parse
                // out a comma so we give a good error message.
                this.parseExpected(TokenType.CommaToken);

                // If the token was a semicolon, and the caller allows that, then skip it and
                // continue.  This ensures we get back on track and don't result in tons of
                // parse errors.  For example, this can happen when people do things like use
                // a semicolon to delimit object literal members.   Note: we'll have already
                // reported an error when we called this.parseExpected above.
                if (considerSemicolonAsDelimiter && token === TokenType.SemicolonToken && !scanner.hasPrecedingLineBreak()) {
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
    }

    private createMissingList<T>(): NodeArray<T> {
        const pos = getNodePos();
        const result = <NodeArray<T>>[];
        result.pos = pos;
        result.end = pos;
        return result;
    }

    private parseBracketedList<T extends Node>(kind: ParsingContext, parseElement: () => T, open: TokenType, close: TokenType): NodeArray<T> {
        if (this.parseExpected(open)) {
            const result = parseDelimitedList(kind, parseElement);
            this.parseExpected(close);
            return result;
        }

        return createMissingList<T>();
    }

    // The allowReservedWords parameter controls whether reserved words are permitted after the first dot
    private parseEntityName(allowReservedWords: boolean, diagnosticMessage?: DiagnosticMessage): EntityName {
        let entity: EntityName = parseIdentifier(diagnosticMessage);
        while (parseOptional(TokenType.DotToken)) {
            const node: QualifiedName = <QualifiedName>createNode(TokenType.QualifiedName, entity.pos);  // !!!
            node.left = entity;
            node.right = parseRightSideOfDot(allowReservedWords);
            entity = finishNode(node);
        }
        return entity;
    }

    private parseRightSideOfDot(allowIdentifierNames: boolean): Identifier {
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
            const matchesPattern = lookAhead(nextTokenIsIdentifierOrKeywordOnSameLine);

            if (matchesPattern) {
                // Report that we need an identifier.  However, report it right after the dot,
                // and not on the next token.  This is because the next token might actually
                // be an identifier and the error would be quite confusing.
                return <Identifier>createMissingNode(TokenType.Identifier, /*reportAtCurrentPosition*/ true, Diagnostics.Identifier_expected);
            }
        }

        return allowIdentifierNames ? parseIdentifierName() : parseIdentifier();
    }

    private parseTemplateExpression(): TemplateExpression {
        const template = <TemplateExpression>createNode(TokenType.TemplateExpression);

        template.head = parseTemplateLiteralFragment();
        Debug.assert(template.head.kind === TokenType.TemplateHead, "Template head has wrong token kind");

        const templateSpans = <NodeArray<TemplateSpan>>[];
        templateSpans.pos = getNodePos();

        do {
            templateSpans.push(parseTemplateSpan());
        }
        while (lastOrUndefined(templateSpans).literal.kind === TokenType.TemplateMiddle);

        templateSpans.end = getNodeEnd();
        template.templateSpans = templateSpans;

        return finishNode(template);
    }

    private parseTemplateSpan(): TemplateSpan {
        const span = <TemplateSpan>createNode(TokenType.TemplateSpan);
        span.expression = allowInAnd(parseExpression);

        let literal: TemplateLiteralFragment;

        if (token === TokenType.CloseBraceToken) {
            reScanTemplateToken();
            literal = parseTemplateLiteralFragment();
        }
        else {
            literal = <TemplateLiteralFragment>this.parseExpectedToken(TokenType.TemplateTail, /*reportAtCurrentPosition*/ false, Diagnostics._0_expected, tokenToString(TokenType.CloseBraceToken));
        }

        span.literal = literal;
        return finishNode(span);
    }

    private parseStringLiteralTypeNode(): StringLiteralTypeNode {
        return <StringLiteralTypeNode>parseLiteralLikeNode(TokenType.StringLiteralType, /*internName*/ true);
    }

    private parseLiteralNode(internName?: boolean): LiteralExpression {
        return <LiteralExpression>parseLiteralLikeNode(token, internName);
    }

    private parseTemplateLiteralFragment(): TemplateLiteralFragment {
        return <TemplateLiteralFragment>parseLiteralLikeNode(token, /*internName*/ false);
    }

    private parseLiteralLikeNode(kind: TokenType, internName: boolean): LiteralLikeNode {
        const node = <LiteralExpression>createNode(kind);
        const text = scanner.getTokenValue();
        node.text = internName ? internIdentifier(text) : text;

        if (scanner.hasExtendedUnicodeEscape()) {
            node.hasExtendedUnicodeEscape = true;
        }

        if (scanner.isUnterminated()) {
            node.isUnterminated = true;
        }

        const tokenPos = scanner.getTokenPos();
        nextToken();
        finishNode(node);

        // Octal literals are not allowed in strict mode or ES5
        // Note that theoretically the following condition would hold true literals like 009,
        // which is not octal.But because of how the scanner separates the tokens, we would
        // never get a token like this. Instead, we would get 00 and 9 as two separate tokens.
        // We also do not need to check for negatives because any prefix operator would be part of a
        // parent unary expression.
        if (node.kind === TokenType.NumericLiteral
            && sourceText.charCodeAt(tokenPos) === CharacterCodes._0
            && isOctalDigit(sourceText.charCodeAt(tokenPos + 1))) {

            node.isOctalLiteral = true;
        }

        return node;
    }

    // TYPES

    private parseTypeReference(): TypeReferenceNode {
        const typeName = parseEntityName(/*allowReservedWords*/ false, Diagnostics.Type_expected);
        const node = <TypeReferenceNode>createNode(TokenType.TypeReference, typeName.pos);
        node.typeName = typeName;
        if (!scanner.hasPrecedingLineBreak() && token === TokenType.LessThanToken) {
            node.typeArguments = parseBracketedList(ParsingContext.TypeArguments, parseType, TokenType.LessThanToken, TokenType.GreaterThanToken);
        }
        return finishNode(node);
    }

    private parseThisTypePredicate(lhs: ThisTypeNode): TypePredicateNode {
        nextToken();
        const node = createNode(TokenType.TypePredicate, lhs.pos) as TypePredicateNode;
        node.parameterName = lhs;
        node.type = parseType();
        return finishNode(node);
    }

    private parseThisTypeNode(): ThisTypeNode {
        const node = createNode(TokenType.ThisType) as ThisTypeNode;
        nextToken();
        return finishNode(node);
    }

    private parseTypeQuery(): TypeQueryNode {
        const node = <TypeQueryNode>createNode(TokenType.TypeQuery);
        this.parseExpected(TokenType.TypeOfKeyword);
        node.exprName = parseEntityName(/*allowReservedWords*/ true);
        return finishNode(node);
    }

    private parseTypeParameter(): TypeParameterDeclaration {
        const node = <TypeParameterDeclaration>createNode(TokenType.TypeParameter);
        node.name = parseIdentifier();
        if (parseOptional(TokenType.ExtendsKeyword)) {
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
    }

    private parseTypeParameters(): NodeArray<TypeParameterDeclaration> {
        if (token === TokenType.LessThanToken) {
            return parseBracketedList(ParsingContext.TypeParameters, parseTypeParameter, TokenType.LessThanToken, TokenType.GreaterThanToken);
        }
    }

    private parseParameterType(): TypeNode {
        if (parseOptional(TokenType.ColonToken)) {
            return parseType();
        }

        return undefined;
    }

    private isStartOfParameter(): boolean {
        return token === TokenType.DotDotDotToken || isIdentifierOrPattern() || isModifierKind(token) || token === TokenType.AtToken || token === TokenType.ThisKeyword;
    }

    private setModifiers(node: Node, modifiers: ModifiersArray) {
        if (modifiers) {
            node.flags |= modifiers.flags;
            node.modifiers = modifiers;
        }
    }

    private parseParameter(): ParameterDeclaration {
        const node = <ParameterDeclaration>createNode(TokenType.Parameter);
        if (token === TokenType.ThisKeyword) {
            node.name = createIdentifier(/*isIdentifier*/true, undefined);
            node.type = parseParameterType();
            return finishNode(node);
        }

        node.decorators = parseDecorators();
        setModifiers(node, parseModifiers());
        node.dotDotDotToken = parseOptionalToken(TokenType.DotDotDotToken);

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

        node.questionToken = parseOptionalToken(TokenType.QuestionToken);
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
    }

    private parseBindingElementInitializer(inParameter: boolean) {
        return inParameter ? parseParameterInitializer() : parseNonParameterInitializer();
    }

    private parseParameterInitializer() {
        return parseInitializer(/*inParameter*/ true);
    }

    private fillSignature(
        returnToken: TokenType,
        yieldContext: boolean,
        awaitContext: boolean,
        requireCompleteParameterList: boolean,
        signature: SignatureDeclaration): void {

        const returnTokenRequired = returnToken === TokenType.EqualsGreaterThanToken;
        signature.typeParameters = parseTypeParameters();
        signature.parameters = parseParameterList(yieldContext, awaitContext, requireCompleteParameterList);

        if (returnTokenRequired) {
            this.parseExpected(returnToken);
            signature.type = parseTypeOrTypePredicate();
        }
        else if (parseOptional(returnToken)) {
            signature.type = parseTypeOrTypePredicate();
        }
    }

    private parseParameterList(yieldContext: boolean, awaitContext: boolean, requireCompleteParameterList: boolean) {
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
        if (this.parseExpected(TokenType.OpenParenToken)) {
            const savedYieldContext = inYieldContext();
            const savedAwaitContext = inAwaitContext();

            setYieldContext(yieldContext);
            setAwaitContext(awaitContext);

            const result = parseDelimitedList(ParsingContext.Parameters, parseParameter);

            setYieldContext(savedYieldContext);
            setAwaitContext(savedAwaitContext);

            if (!this.parseExpected(TokenType.CloseParenToken) && requireCompleteParameterList) {
                // Caller insisted that we had to end with a )   We didn't.  So just return
                // undefined here.
                return undefined;
            }

            return result;
        }

        // We didn't even have an open paren.  If the caller requires a complete parameter list,
        // we definitely can't provide that.  However, if they're ok with an incomplete one,
        // then just return an empty set of parameters.
        return requireCompleteParameterList ? undefined : createMissingList<ParameterDeclaration>();
    }

    private parseTypeMemberSemicolon() {
        // We allow type members to be separated by commas or (possibly ASI) semicolons.
        // First check if it was a comma.  If so, we're done with the member.
        if (parseOptional(TokenType.CommaToken)) {
            return;
        }

        // Didn't have a comma.  We must have a (possible ASI) semicolon.
        parseSemicolon();
    }

    private parseSignatureMember(kind: TokenType): CallSignatureDeclaration | ConstructSignatureDeclaration {
        const node = <CallSignatureDeclaration | ConstructSignatureDeclaration>createNode(kind);
        if (kind === TokenType.ConstructSignature) {
            this.parseExpected(TokenType.NewKeyword);
        }
        fillSignature(TokenType.ColonToken, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
        parseTypeMemberSemicolon();
        return finishNode(node);
    }

    private isIndexSignature(): boolean {
        if (token !== TokenType.OpenBracketToken) {
            return false;
        }

        return lookAhead(isUnambiguouslyIndexSignature);
    }

    private isUnambiguouslyIndexSignature() {
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
        if (token === TokenType.DotDotDotToken || token === TokenType.CloseBracketToken) {
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
        if (token === TokenType.ColonToken || token === TokenType.CommaToken) {
            return true;
        }

        // Question mark could be an indexer with an optional property,
        // or it could be a conditional expression in a computed property.
        if (token !== TokenType.QuestionToken) {
            return false;
        }

        // If any of the following tokens are after the question mark, it cannot
        // be a conditional expression, so treat it as an indexer.
        nextToken();
        return token === TokenType.ColonToken || token === TokenType.CommaToken || token === TokenType.CloseBracketToken;
    }

    private parseIndexSignatureDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): IndexSignatureDeclaration {
        const node = <IndexSignatureDeclaration>createNode(TokenType.IndexSignature, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        node.parameters = parseBracketedList(ParsingContext.Parameters, parseParameter, TokenType.OpenBracketToken, TokenType.CloseBracketToken);
        node.type = parseTypeAnnotation();
        parseTypeMemberSemicolon();
        return finishNode(node);
    }

    private parsePropertyOrMethodSignature(fullStart: number, modifiers: ModifiersArray): PropertySignature | MethodSignature {
        const name = parsePropertyName();
        const questionToken = parseOptionalToken(TokenType.QuestionToken);

        if (token === TokenType.OpenParenToken || token === TokenType.LessThanToken) {
            const method = <MethodSignature>createNode(TokenType.MethodSignature, fullStart);
            setModifiers(method, modifiers);
            method.name = name;
            method.questionToken = questionToken;

            // Method signatures don't exist in expression contexts.  So they have neither
            // [Yield] nor [Await]
            fillSignature(TokenType.ColonToken, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, method);
            parseTypeMemberSemicolon();
            return finishNode(method);
        }
        else {
            const property = <PropertySignature>createNode(TokenType.PropertySignature, fullStart);
            setModifiers(property, modifiers);
            property.name = name;
            property.questionToken = questionToken;
            property.type = parseTypeAnnotation();

            if (token === TokenType.EqualsToken) {
                // Although type literal properties cannot not have initializers, we attempt
                // to parse an initializer so we can report in the checker that an interface
                // property or type literal property cannot have an initializer.
                property.initializer = parseNonParameterInitializer();
            }

            parseTypeMemberSemicolon();
            return finishNode(property);
        }
    }

    private isTypeMemberStart(): boolean {
        let idToken: TokenType;
        // Return true if we have the start of a signature member
        if (token === TokenType.OpenParenToken || token === TokenType.LessThanToken) {
            return true;
        }
        // Eat up all modifiers, but hold on to the last one in case it is actually an identifier
        while (isModifierKind(token)) {
            idToken = token;
            nextToken();
        }
        // Index signatures and computed property names are type members
        if (token === TokenType.OpenBracketToken) {
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
            return token === TokenType.OpenParenToken ||
                token === TokenType.LessThanToken ||
                token === TokenType.QuestionToken ||
                token === TokenType.ColonToken ||
                autoInsertSemicolon();
        }
        return false;
    }

    private parseTypeMember(): TypeElement {
        if (token === TokenType.OpenParenToken || token === TokenType.LessThanToken) {
            return parseSignatureMember(TokenType.CallSignature);
        }
        if (token === TokenType.NewKeyword && lookAhead(isStartOfConstructSignature)) {
            return parseSignatureMember(TokenType.ConstructSignature);
        }
        const fullStart = getNodePos();
        const modifiers = parseModifiers();
        if (isIndexSignature()) {
            return parseIndexSignatureDeclaration(fullStart, /*decorators*/ undefined, modifiers);
        }
        return parsePropertyOrMethodSignature(fullStart, modifiers);
    }

    private isStartOfConstructSignature() {
        nextToken();
        return token === TokenType.OpenParenToken || token === TokenType.LessThanToken;
    }

    private parseTypeLiteral(): TypeLiteralNode {
        const node = <TypeLiteralNode>createNode(TokenType.TypeLiteral);
        node.members = parseObjectTypeMembers();
        return finishNode(node);
    }

    private parseObjectTypeMembers(): NodeArray<TypeElement> {
        let members: NodeArray<TypeElement>;
        if (this.parseExpected(TokenType.OpenBraceToken)) {
            members = parseList(ParsingContext.TypeMembers, parseTypeMember);
            this.parseExpected(TokenType.CloseBraceToken);
        }
        else {
            members = createMissingList<TypeElement>();
        }

        return members;
    }

    private parseTupleType(): TupleTypeNode {
        const node = <TupleTypeNode>createNode(TokenType.TupleType);
        node.elementTypes = parseBracketedList(ParsingContext.TupleElementTypes, parseType, TokenType.OpenBracketToken, TokenType.CloseBracketToken);
        return finishNode(node);
    }

    private parseParenthesizedType(): ParenthesizedTypeNode {
        const node = <ParenthesizedTypeNode>createNode(TokenType.ParenthesizedType);
        this.parseExpected(TokenType.OpenParenToken);
        node.type = parseType();
        this.parseExpected(TokenType.CloseParenToken);
        return finishNode(node);
    }

    private parseFunctionOrConstructorType(kind: TokenType): FunctionOrConstructorTypeNode {
        const node = <FunctionOrConstructorTypeNode>createNode(kind);
        if (kind === TokenType.ConstructorType) {
            this.parseExpected(TokenType.NewKeyword);
        }
        fillSignature(TokenType.EqualsGreaterThanToken, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
        return finishNode(node);
    }

    private parseKeywordAndNoDot(): TypeNode {
        const node = parseTokenNode<TypeNode>();
        return token === TokenType.DotToken ? undefined : node;
    }

    private parseNonArrayType(): TypeNode {
        switch (token) {
            case TokenType.AnyKeyword:
            case TokenType.StringKeyword:
            case TokenType.NumberKeyword:
            case TokenType.BooleanKeyword:
            case TokenType.SymbolKeyword:
            case TokenType.UndefinedKeyword:
            case TokenType.NeverKeyword:
                // If these are followed by a dot, then parse these out as a dotted type reference instead.
                const node = tryParse(parseKeywordAndNoDot);
                return node || parseTypeReference();
            case TokenType.StringLiteral:
                return parseStringLiteralTypeNode();
            case TokenType.VoidKeyword:
            case TokenType.NullKeyword:
                return parseTokenNode<TypeNode>();
            case TokenType.ThisKeyword: {
                const thisKeyword = parseThisTypeNode();
                if (token === TokenType.IsKeyword && !scanner.hasPrecedingLineBreak()) {
                    return parseThisTypePredicate(thisKeyword);
                }
                else {
                    return thisKeyword;
                }
            }
            case TokenType.TypeOfKeyword:
                return parseTypeQuery();
            case TokenType.OpenBraceToken:
                return parseTypeLiteral();
            case TokenType.OpenBracketToken:
                return parseTupleType();
            case TokenType.OpenParenToken:
                return parseParenthesizedType();
            default:
                return parseTypeReference();
        }
    }

    private isStartOfType(): boolean {
        switch (token) {
            case TokenType.AnyKeyword:
            case TokenType.StringKeyword:
            case TokenType.NumberKeyword:
            case TokenType.BooleanKeyword:
            case TokenType.SymbolKeyword:
            case TokenType.VoidKeyword:
            case TokenType.UndefinedKeyword:
            case TokenType.NullKeyword:
            case TokenType.ThisKeyword:
            case TokenType.TypeOfKeyword:
            case TokenType.NeverKeyword:
            case TokenType.OpenBraceToken:
            case TokenType.OpenBracketToken:
            case TokenType.LessThanToken:
            case TokenType.NewKeyword:
            case TokenType.StringLiteral:
                return true;
            case TokenType.OpenParenToken:
                // Only consider '(' the start of a type if followed by ')', '...', an identifier, a modifier,
                // or something that starts a type. We don't want to consider things like '(1)' a type.
                return lookAhead(isStartOfParenthesizedOrFunctionType);
            default:
                return isIdentifier();
        }
    }

    private isStartOfParenthesizedOrFunctionType() {
        nextToken();
        return token === TokenType.CloseParenToken || isStartOfParameter() || isStartOfType();
    }

    private parseArrayTypeOrHigher(): TypeNode {
        let type = parseNonArrayType();
        while (!scanner.hasPrecedingLineBreak() && parseOptional(TokenType.OpenBracketToken)) {
            this.parseExpected(TokenType.CloseBracketToken);
            const node = <ArrayTypeNode>createNode(TokenType.ArrayType, type.pos);
            node.elementType = type;
            type = finishNode(node);
        }
        return type;
    }

    private parseUnionOrIntersectionType(kind: TokenType, parseConstituentType: () => TypeNode, operator: TokenType): TypeNode {
        let type = parseConstituentType();
        if (token === operator) {
            const types = <NodeArray<TypeNode>>[type];
            types.pos = type.pos;
            while (parseOptional(operator)) {
                types.push(parseConstituentType());
            }
            types.end = getNodeEnd();
            const node = <UnionOrIntersectionTypeNode>createNode(kind, type.pos);
            node.types = types;
            type = finishNode(node);
        }
        return type;
    }

    private parseIntersectionTypeOrHigher(): TypeNode {
        return parseUnionOrIntersectionType(TokenType.IntersectionType, parseArrayTypeOrHigher, TokenType.AmpersandToken);
    }

    private parseUnionTypeOrHigher(): TypeNode {
        return parseUnionOrIntersectionType(TokenType.UnionType, parseIntersectionTypeOrHigher, TokenType.BarToken);
    }

    private isStartOfFunctionType(): boolean {
        if (token === TokenType.LessThanToken) {
            return true;
        }
        return token === TokenType.OpenParenToken && lookAhead(isUnambiguouslyStartOfFunctionType);
    }

    private skipParameterStart(): boolean {
        if (isModifierKind(token)) {
            // Skip modifiers
            parseModifiers();
        }
        if (isIdentifier() || token === TokenType.ThisKeyword) {
            nextToken();
            return true;
        }
        if (token === TokenType.OpenBracketToken || token === TokenType.OpenBraceToken) {
            // Return true if we can parse an array or object binding pattern with no errors
            const previousErrorCount = parseDiagnostics.length;
            parseIdentifierOrPattern();
            return previousErrorCount === parseDiagnostics.length;
        }
        return false;
    }

    private isUnambiguouslyStartOfFunctionType() {
        nextToken();
        if (token === TokenType.CloseParenToken || token === TokenType.DotDotDotToken) {
            // ( )
            // ( ...
            return true;
        }
        if (skipParameterStart()) {
            // We successfully skipped modifiers (if any) and an identifier or binding pattern,
            // now see if we have something that indicates a parameter declaration
            if (token === TokenType.ColonToken || token === TokenType.CommaToken ||
                token === TokenType.QuestionToken || token === TokenType.EqualsToken) {
                // ( xxx :
                // ( xxx ,
                // ( xxx ?
                // ( xxx =
                return true;
            }
            if (token === TokenType.CloseParenToken) {
                nextToken();
                if (token === TokenType.EqualsGreaterThanToken) {
                    // ( xxx ) =>
                    return true;
                }
            }
        }
        return false;
    }

    private parseTypeOrTypePredicate(): TypeNode {
        const typePredicateVariable = isIdentifier() && tryParse(parseTypePredicatePrefix);
        const type = parseType();
        if (typePredicateVariable) {
            const node = <TypePredicateNode>createNode(TokenType.TypePredicate, typePredicateVariable.pos);
            node.parameterName = typePredicateVariable;
            node.type = type;
            return finishNode(node);
        }
        else {
            return type;
        }
    }

    private parseTypePredicatePrefix() {
        const id = parseIdentifier();
        if (token === TokenType.IsKeyword && !scanner.hasPrecedingLineBreak()) {
            nextToken();
            return id;
        }
    }

    private parseType(): TypeNode {
        // The rules about 'yield' only apply to actual code/expression contexts.  They don't
        // apply to 'type' contexts.  So we disable these parameters here before moving on.
        return doOutsideOfContext(NodeFlags.TypeExcludesFlags, parseTypeWorker);
    }

    private parseTypeWorker(): TypeNode {
        if (isStartOfFunctionType()) {
            return parseFunctionOrConstructorType(TokenType.FunctionType);
        }
        if (token === TokenType.NewKeyword) {
            return parseFunctionOrConstructorType(TokenType.ConstructorType);
        }
        return parseUnionTypeOrHigher();
    }

    private parseTypeAnnotation(): TypeNode {
        return parseOptional(TokenType.ColonToken) ? parseType() : undefined;
    }

    // EXPRESSIONS
    private isStartOfLeftHandSideExpression(): boolean {
        switch (token) {
            case TokenType.ThisKeyword:
            case TokenType.SuperKeyword:
            case TokenType.NullKeyword:
            case TokenType.TrueKeyword:
            case TokenType.FalseKeyword:
            case TokenType.NumericLiteral:
            case TokenType.StringLiteral:
            case TokenType.NoSubstitutionTemplateLiteral:
            case TokenType.TemplateHead:
            case TokenType.OpenParenToken:
            case TokenType.OpenBracketToken:
            case TokenType.OpenBraceToken:
            case TokenType.FunctionKeyword:
            case TokenType.ClassKeyword:
            case TokenType.NewKeyword:
            case TokenType.SlashToken:
            case TokenType.SlashEqualsToken:
            case TokenType.Identifier:
                return true;
            default:
                return isIdentifier();
        }
    }

    private fallowsExpression(): boolean {
        if (isStartOfLeftHandSideExpression()) {
            return true;
        }

        switch (token) {
            case TokenType.PlusToken:
            case TokenType.MinusToken:
            case TokenType.TildeToken:
            case TokenType.ExclamationToken:
            case TokenType.DeleteKeyword:
            case TokenType.TypeOfKeyword:
            case TokenType.VoidKeyword:
            case TokenType.PlusPlusToken:
            case TokenType.MinusMinusToken:
            case TokenType.LessThanToken:
            case TokenType.AwaitKeyword:
            case TokenType.YieldKeyword:
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
    }

    private fallowsExpressionStatement(): boolean {
        // As per the grammar, none of '{' or 'private' or 'class' can start an expression statement.
        return token !== TokenType.OpenBraceToken &&
            token !== TokenType.FunctionKeyword &&
            token !== TokenType.ClassKeyword &&
            token !== TokenType.AtToken &&
            fallowsExpression();
    }

    private parseExpression() {

        // Expression[in]:
        //      AssignmentExpression[in]
        //      Expression[in] , AssignmentExpression[in]

        let result = this.parseAssignmentExpressionOrHigher();
        while (this.parseOptional(TokenType.comma)) {
            result = this.makeBinaryExpression(result, TokenType.comma, this.lexer.tokenStart - 1, this.parseAssignmentExpressionOrHigher());
        }

        return result;
    }

    private parseInitializer(inParameter: boolean): Expression {
        if (token !== TokenType.EqualsToken) {
            // It's not uncommon during typing for the user to miss writing the '=' token.  Check if
            // there is no newline after the last token and if we're on an expression.  If so, parse
            // this as an equals-value clause with a missing equals.
            // NOTE: There are two places where we allow equals-value clauses.  The first is in a
            // variable declarator.  The second is with a parameter.  For variable declarators
            // it's more likely that a { would be a allowed (as an object literal).  While this
            // is also allowed for parameters, the risk is that we consume the { as an object
            // literal when it really will be for the block following the parameter.
            if (scanner.hasPrecedingLineBreak() || (inParameter && token === TokenType.OpenBraceToken) || !fallowsExpression()) {
                // preceding line break, open brace in a parameter (likely a private body) or current token is not an expression -
                // do not try to parse initializer
                return undefined;
            }
        }

        // Initializer[In, Yield] :
        //     = AssignmentExpression[?In, ?Yield]

        this.parseExpected(TokenType.EqualsToken);
        return parseAssignmentExpressionOrHigher();
    }

    private parseAssignmentExpressionOrHigher() {
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
        const yieldExpression = this.tryParseYieldExpression();
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
        const arrowExpression = this.tryParseLambdaLiteral(); this.tryParseParenthesizedArrowFunctionExpression() || this.tryParseAsyncSimpleArrowFunctionExpression();
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
        const expr = this.parseBinaryExpressionOrHigher(/*precedence*/ 0);

        // To avoid a look-ahead, we did not handle the case of an arrow private with a single un-parenthesized
        // parameter ('x => ...') above. We handle it here by checking if the parsed expression was a single
        // identifier and the current token is an arrow.
        if (expr.kind === TokenType.identifier && token === TokenType.EqualsGreaterThanToken) {
            return parseSimpleArrowFunctionExpression(<Identifier>expr);
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
    }

    private tryParseYieldExpression() {
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
        if (this.lexer.tokenType === TokenType.yield && (this.flags & ParseFlags.allowYield) && this.nextTokenIsIdentifierOrKeywordOrNumberOnSameLine()) {
            return this.parseYieldExpression();
        }
    }

    private parseYieldExpression() {

        // YieldExpression[In] :
        //      yield
        //      yield [no LineTerminator here] [Lexical goal InputElementRegExp]AssignmentExpression[?In, Yield]
        //      yield [no LineTerminator here] * [Lexical goal InputElementRegExp]AssignmentExpression[?In, Yield]

        // #assert this.lexer.currentToken.type === TokenType.yield

        const result = new ast.YieldExpression();
        result.start = this.lexer.read().start; // yield

        if (!this.lexer.currentToken.hasLineTerminatorBeforeStart) {
            if (this.lexer.tokenType === TokenType.asterisk) {
                result.asteriskStart = this.lexer.read().start;
                result.value = this.parseAssignmentExpressionOrHigher();
            } else if (this.fallowsExpression()) {
                result.value = this.parseAssignmentExpressionOrHigher();
            }
        }

        return result;
    }

    private nextTokenIsIdentifierOnSameLine() {
        nextToken();
        return !scanner.hasPrecedingLineBreak() && isIdentifier();
    }

    private parseSimpleArrowFunctionExpression(identifier: Identifier, asyncModifier?: ModifiersArray): ArrowFunction {
        Debug.assert(token === TokenType.EqualsGreaterThanToken, "parseSimpleArrowFunctionExpression should only have been called if we had a =>");

        let node: ArrowFunction;
        if (asyncModifier) {
            node = <ArrowFunction>createNode(TokenType.ArrowFunction, asyncModifier.pos);
            setModifiers(node, asyncModifier);
        }
        else {
            node = <ArrowFunction>createNode(TokenType.ArrowFunction, identifier.pos);
        }

        const parameter = <ParameterDeclaration>createNode(TokenType.Parameter, identifier.pos);
        parameter.name = identifier;
        finishNode(parameter);

        node.parameters = <NodeArray<ParameterDeclaration>>[parameter];
        node.parameters.pos = parameter.pos;
        node.parameters.end = parameter.end;

        node.equalsGreaterThanToken = this.parseExpectedToken(TokenType.EqualsGreaterThanToken, /*reportAtCurrentPosition*/ false, Diagnostics._0_expected, "=>");
        node.body = parseArrowFunctionExpressionBody(/*isAsync*/ !!asyncModifier);

        return finishNode(node);
    }

    private tryParseLambdaLiteral() {

        // LambdaLiteral:
        //   ( ParemeterList ) LambdaReturnType? LambdaBody
        //   Identifier LambdaReturnType? LambdaBody
        //   < TypeParamerList > ( ParemeterList ) LambdaReturnType? LambdaLiteral
        //   async ( ParemeterList ) LambdaReturnType? LambdaLiteral
        //   async < TypeParamerList >  ( ParemeterList ) LambdaReturnType? LambdaLiteral

        // LambdaBody:
        //   => Block
        //   => Expression

    }

    private tryParseParenthesizedArrowFunctionExpression() {

        let mustBeArrowFunction: boolean;

        switch (this.lexer.tokenType) {
            case TokenType.openParen:
            case TokenType.lessThan:
            case TokenType.async:
                mustBeArrowFunction = this.isParenthesizedArrowFunctionExpressionWorker();
                break;
            case TokenType.equalsGreaterThan:
                mustBeArrowFunction = true;
                break;
            default:
                return;
        }

        const triState = this.isParenthesizedArrowFunctionExpression();
        if (triState === false) {
            // It's definitely not a parenthesized arrow private expression.
            return undefined;
        }

        // If we definitely have an arrow private, then we can just parse one, not requiring a
        // following => or { token. Otherwise, we *might* have an arrow private.  Try to parse
        // it out, but don't allow any ambiguity, and return 'undefined' if this could be an
        // expression instead.
        const arrowFunction = triState === true
            ? parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ true)
            : tryParse(parsePossibleParenthesizedArrowFunctionExpressionHead);

        if (!arrowFunction) {
            // Didn't appear to actually be a parenthesized arrow private.  Just bail out.
            return undefined;
        }

        const isAsync = !!(arrowFunction.flags & NodeFlags.Async);

        // If we have an arrow, then try to parse the body. Even if not, try to parse if we
        // have an opening brace, just in case we're in an error state.
        const lastToken = token;
        arrowFunction.equalsGreaterThanToken = this.parseExpectedToken(TokenType.EqualsGreaterThanToken, /*reportAtCurrentPosition*/false, Diagnostics._0_expected, "=>");
        arrowFunction.body = (lastToken === TokenType.EqualsGreaterThanToken || lastToken === TokenType.OpenBraceToken)
            ? parseArrowFunctionExpressionBody(isAsync)
            : parseIdentifier();

        return finishNode(arrowFunction);
    }

    //  True        -> We definitely expect a parenthesized arrow private here.
    //  False       -> There *cannot* be a parenthesized arrow private here.
    //  Unknown     -> There *might* be a parenthesized arrow private here.
    //                 Speculatively look ahead to be sure, and rollback if not.
    private isParenthesizedArrowFunctionExpression() {

    }

    private isParenthesizedArrowFunctionExpressionWorker() {
        this.lexer.stashSave();

        if (this.lexer.currentToken.type === TokenType.async) {
            this.lexer.read();
            if (this.lexer.currentToken.hasLineTerminatorBeforeStart) {
                return false;
            }
            if (this.lexer.currentToken.type !== TokenType.openParen && this.lexer.currentToken.type !== TokenType.lessThanSlash) {
                return false;
            }
        }

        const first = token;
        const second = nextToken();

        if (first === TokenType.openParen) {
            if (second === TokenType.closeParen) {
                // Simple cases: "() =>", "(): ", and  "() {".
                // This is an arrow private with no parameters.
                // The last one is not actually an arrow private,
                // but this is probably what the user intended.
                const third = nextToken();
                switch (third) {
                    case TokenType.equalsGreaterThan:
                    case TokenType.colon:
                    case TokenType.openParen:
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
            if (second === TokenType.openBracket || second === TokenType.openBrace) {
                return null;
            }

            // Simple case: "(..."
            // This is an arrow private with a rest parameter.
            if (second === TokenType.dotDotDot) {
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
            if (nextToken() === TokenType.colonToken) {
                return Tristate.True;
            }

            // This *could* be a parenthesized arrow private.
            // Return Unknown to let the caller know.
            return Tristate.Unknown;
        }
        else {
            Debug.assert(first === TokenType.LessThanToken);

            // If we have "<" not followed by an identifier,
            // then this definitely is not an arrow private.
            if (!isIdentifier()) {
                return Tristate.False;
            }

            // JSX overrides
            if (sourceFile.languageVariant === LanguageVariant.JSX) {
                const isArrowFunctionInJsx = lookAhead(() => {
                    const third = nextToken();
                    if (third === TokenType.ExtendsKeyword) {
                        const fourth = nextToken();
                        switch (fourth) {
                            case TokenType.EqualsToken:
                            case TokenType.GreaterThanToken:
                                return false;
                            default:
                                return true;
                        }
                    }
                    else if (third === TokenType.CommaToken) {
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
    }

    private parsePossibleParenthesizedArrowFunctionExpressionHead(): ArrowFunction {
        return parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ false);
    }

    private tryParseAsyncSimpleArrowFunctionExpression(): ArrowFunction {
        // We do a check here so that we won't be doing unnecessarily call to "lookAhead"
        if (token === TokenType.AsyncKeyword) {
            const isUnParenthesizedAsyncArrowFunction = lookAhead(isUnParenthesizedAsyncArrowFunctionWorker);
            if (isUnParenthesizedAsyncArrowFunction === Tristate.True) {
                const asyncModifier = parseModifiersForArrowFunction();
                const expr = parseBinaryExpressionOrHigher(/*precedence*/ 0);
                return parseSimpleArrowFunctionExpression(<Identifier>expr, asyncModifier);
            }
        }
        return undefined;
    }

    private isUnParenthesizedAsyncArrowFunctionWorker(): Tristate {
        // AsyncArrowFunctionExpression:
        //      1) async[no LineTerminator here]AsyncArrowBindingIdentifier[?Yield][no LineTerminator here]=>AsyncConciseBody[?In]
        //      2) CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await][no LineTerminator here]=>AsyncConciseBody[?In]
        if (token === TokenType.AsyncKeyword) {
            nextToken();
            // If the "async" is followed by "=>" token then it is not a begining of an async arrow-private
            // but instead a simple arrow-private which will be parsed inside "parseAssignmentExpressionOrHigher"
            if (scanner.hasPrecedingLineBreak() || token === TokenType.EqualsGreaterThanToken) {
                return Tristate.False;
            }
            // Check for un-parenthesized AsyncArrowFunction
            const expr = parseBinaryExpressionOrHigher(/*precedence*/ 0);
            if (!scanner.hasPrecedingLineBreak() && expr.kind === TokenType.Identifier && token === TokenType.EqualsGreaterThanToken) {
                return Tristate.True;
            }
        }

        return Tristate.False;
    }

    private parseParenthesizedArrowFunctionExpressionHead(allowAmbiguity: boolean): ArrowFunction {
        const node = <ArrowFunction>createNode(TokenType.ArrowFunction);
        setModifiers(node, parseModifiersForArrowFunction());
        const isAsync = !!(node.flags & NodeFlags.Async);

        // Arrow privates are never generators.
        //
        // If we're speculatively parsing a signature for a parenthesized arrow private, then
        // we have to have a complete parameter list.  Otherwise we might see something like
        // a => (b => c)
        // And think that "(b =>" was actually a parenthesized arrow private with a missing
        // close paren.
        fillSignature(TokenType.ColonToken, /*yieldContext*/ false, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ !allowAmbiguity, node);

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
        if (!allowAmbiguity && token !== TokenType.EqualsGreaterThanToken && token !== TokenType.OpenBraceToken) {
            // Returning undefined here will cause our caller to rewind to where we started from.
            return undefined;
        }

        return node;
    }

    private parseArrowFunctionExpressionBody(isAsync: boolean): Block | Expression {
        if (token === TokenType.OpenBraceToken) {
            return parseFunctionBlock(/*allowYield*/ false, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);
        }

        if (token !== TokenType.SemicolonToken &&
            token !== TokenType.FunctionKeyword &&
            token !== TokenType.ClassKeyword &&
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
    }

    private parseConditionalExpressionRest(leftOperand: Expression): Expression {
        // Note: we are passed in an expression which was produced from parseBinaryExpressionOrHigher.
        const questionToken = parseOptionalToken(TokenType.QuestionToken);
        if (!questionToken) {
            return leftOperand;
        }

        // Note: we explicitly 'allowIn' in the whenTrue part of the condition expression, and
        // we do not that for the 'whenFalse' part.
        const node = <ConditionalExpression>createNode(TokenType.ConditionalExpression, leftOperand.pos);
        node.condition = leftOperand;
        node.questionToken = questionToken;
        node.whenTrue = doOutsideOfContext(disallowInAndDecoratorContext, parseAssignmentExpressionOrHigher);
        node.colonToken = this.parseExpectedToken(TokenType.ColonToken, /*reportAtCurrentPosition*/ false,
            Diagnostics._0_expected, tokenToString(TokenType.ColonToken));
        node.whenFalse = parseAssignmentExpressionOrHigher();
        return finishNode(node);
    }

    private parseBinaryExpressionOrHigher(precedence: number) {
        const leftOperand = this.parseUnaryExpressionOrHigher();
        return this.parseBinaryExpressionRest(precedence, leftOperand);
    }

    private isInOrOfKeyword(t: TokenType) {
        return t === TokenType.InKeyword || t === TokenType.OfKeyword;
    }

    private parseBinaryExpressionRest(precedence: number, leftOperand: Expression): Expression {
        while (true) {
            // We either have a binary operator here, or we're finished.  We call
            // reScanGreaterToken so that we merge token sequences like > and = into >=

            reScanGreaterToken();
            const newPrecedence = getBinaryOperatorPrecedence();

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
            const consumeCurrentOperator = token === TokenType.AsteriskAsteriskToken ?
                newPrecedence >= precedence :
                newPrecedence > precedence;

            if (!consumeCurrentOperator) {
                break;
            }

            if (token === TokenType.InKeyword && inDisallowInContext()) {
                break;
            }

            if (token === TokenType.AsKeyword) {
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
    }

    private isBinaryOperator() {
        if (inDisallowInContext() && token === TokenType.InKeyword) {
            return false;
        }

        return getBinaryOperatorPrecedence() > 0;
    }

    private getBinaryOperatorPrecedence(): number {
        switch (token) {
            case TokenType.BarBarToken:
                return 1;
            case TokenType.AmpersandAmpersandToken:
                return 2;
            case TokenType.BarToken:
                return 3;
            case TokenType.CaretToken:
                return 4;
            case TokenType.AmpersandToken:
                return 5;
            case TokenType.EqualsEqualsToken:
            case TokenType.ExclamationEqualsToken:
            case TokenType.EqualsEqualsEqualsToken:
            case TokenType.ExclamationEqualsEqualsToken:
                return 6;
            case TokenType.LessThanToken:
            case TokenType.GreaterThanToken:
            case TokenType.LessThanEqualsToken:
            case TokenType.GreaterThanEqualsToken:
            case TokenType.InstanceOfKeyword:
            case TokenType.InKeyword:
            case TokenType.AsKeyword:
                return 7;
            case TokenType.LessThanLessThanToken:
            case TokenType.GreaterThanGreaterThanToken:
            case TokenType.GreaterThanGreaterThanGreaterThanToken:
                return 8;
            case TokenType.PlusToken:
            case TokenType.MinusToken:
                return 9;
            case TokenType.AsteriskToken:
            case TokenType.SlashToken:
            case TokenType.PercentToken:
                return 10;
            case TokenType.AsteriskAsteriskToken:
                return 11;
        }

        // -1 is lower than all other precedences.  Returning it will cause binary expression
        // parsing to stop.
        return -1;
    }

    private makeBinaryExpression(left: ast.Expression, operator: TokenType, operatorStart: number, right: ast.Expression) {
        const result = new ast.BinaryExpression();
        result.leftOperand = left;
        result.operator = operator;
        result.operatorStart = operatorStart;
        result.rightOperand = right;
        return result;
    }

    private makeAsExpression(left: Expression, right: TypeNode): AsExpression {
        const node = <AsExpression>createNode(TokenType.AsExpression, left.pos);
        node.expression = left;
        node.type = right;
        return finishNode(node);
    }

    private parsePrefixUnaryExpression() {
        const node = <PrefixUnaryExpression>createNode(TokenType.PrefixUnaryExpression);
        node.operator = token;
        nextToken();
        node.operand = parseSimpleUnaryExpression();

        return finishNode(node);
    }

    private parseDeleteExpression() {
        const node = <DeleteExpression>createNode(TokenType.DeleteExpression);
        nextToken();
        node.expression = parseSimpleUnaryExpression();
        return finishNode(node);
    }

    private parseTypeOfExpression() {
        const node = <TypeOfExpression>createNode(TokenType.TypeOfExpression);
        nextToken();
        node.expression = parseSimpleUnaryExpression();
        return finishNode(node);
    }

    private parseVoidExpression() {
        const node = <VoidExpression>createNode(TokenType.VoidExpression);
        nextToken();
        node.expression = parseSimpleUnaryExpression();
        return finishNode(node);
    }

    private isAwaitExpression(): boolean {
        if (token === TokenType.AwaitKeyword) {
            if (inAwaitContext()) {
                return true;
            }

            // here we are using similar heuristics as 'isYieldExpression'
            return lookAhead(nextTokenIsIdentifierOnSameLine);
        }

        return false;
    }

    private parseAwaitExpression() {
        const node = <AwaitExpression>createNode(TokenType.AwaitExpression);
        nextToken();
        node.expression = parseSimpleUnaryExpression();
        return finishNode(node);
    }

    /**
     * Parse ES7 unary expression and await expression
     *
     * ES7 UnaryExpression:
     *      1) SimpleUnaryExpression[?yield]
     *      2) IncrementExpression[?yield] ** UnaryExpression[?yield]
     */
    private parseUnaryExpressionOrHigher() {
        if (this.isAwaitExpression()) {
            return this.parseAwaitExpression();
        }

        if (this.isIncrementExpression()) {
            const incrementExpression = this.parseIncrementExpression();
            return this.lexer.currentToken.type === TokenType.asteriskAsterisk ?
                <BinaryExpression>parseBinaryExpressionRest(getBinaryOperatorPrecedence(), incrementExpression) :
                incrementExpression;
        }

        const unaryOperator = token;
        const simpleUnaryExpression = parseSimpleUnaryExpression();
        if (token === TokenType.AsteriskAsteriskToken) {
            const start = skipTrivia(sourceText, simpleUnaryExpression.pos);
            if (simpleUnaryExpression.kind === TokenType.TypeAssertionExpression) {
                parseErrorAtPosition(start, simpleUnaryExpression.end - start, Diagnostics.A_type_assertion_expression_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses);
            }
            else {
                parseErrorAtPosition(start, simpleUnaryExpression.end - start, Diagnostics.An_unary_expression_with_the_0_operator_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses, tokenToString(unaryOperator));
            }
        }
        return simpleUnaryExpression;
    }

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
    private parseSimpleUnaryExpression(): UnaryExpression {
        switch (token) {
            case TokenType.PlusToken:
            case TokenType.MinusToken:
            case TokenType.TildeToken:
            case TokenType.ExclamationToken:
                return parsePrefixUnaryExpression();
            case TokenType.DeleteKeyword:
                return parseDeleteExpression();
            case TokenType.TypeOfKeyword:
                return parseTypeOfExpression();
            case TokenType.VoidKeyword:
                return parseVoidExpression();
            case TokenType.LessThanToken:
                // This is modified UnaryExpression grammar in TypeScript
                //  UnaryExpression (modified):
                //      < type > UnaryExpression
                return parseTypeAssertion();
            default:
                return parseIncrementExpression();
        }
    }

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
    private isIncrementExpression(): boolean {
        // This private is called inside parseUnaryExpression to decide
        // whether to call parseSimpleUnaryExpression or call parseIncrementExpression directly
        switch (token) {
            case TokenType.PlusToken:
            case TokenType.MinusToken:
            case TokenType.TildeToken:
            case TokenType.ExclamationToken:
            case TokenType.DeleteKeyword:
            case TokenType.TypeOfKeyword:
            case TokenType.VoidKeyword:
                return false;
            case TokenType.LessThanToken:
                // If we are not in JSX context, we are parsing TypeAssertion which is an UnaryExpression
                if (sourceFile.languageVariant !== LanguageVariant.JSX) {
                    return false;
                }
            // We are in JSX context and the token is part of JSXElement.
            // Fall through
            default:
                return true;
        }
    }

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
    private parseIncrementExpression(): IncrementExpression {
        if (token === TokenType.PlusPlusToken || token === TokenType.MinusMinusToken) {
            const node = <PrefixUnaryExpression>createNode(TokenType.PrefixUnaryExpression);
            node.operator = token;
            nextToken();
            node.operand = parseLeftHandSideExpressionOrHigher();
            return finishNode(node);
        }
        else if (sourceFile.languageVariant === LanguageVariant.JSX && token === TokenType.LessThanToken && lookAhead(nextTokenIsIdentifierOrKeyword)) {
            // JSXElement is part of primaryExpression
            return parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ true);
        }

        const expression = parseLeftHandSideExpressionOrHigher();

        Debug.assert(isLeftHandSideExpression(expression));
        if ((token === TokenType.PlusPlusToken || token === TokenType.MinusMinusToken) && !scanner.hasPrecedingLineBreak()) {
            const node = <PostfixUnaryExpression>createNode(TokenType.PostfixUnaryExpression, expression.pos);
            node.operand = expression;
            node.operator = token;
            nextToken();
            return finishNode(node);
        }

        return expression;
    }

    private parseLeftHandSideExpressionOrHigher(): LeftHandSideExpression {
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
        const expression = token === TokenType.SuperKeyword
            ? parseSuperExpression()
            : parseMemberExpressionOrHigher();

        // Now, we *may* be complete.  However, we might have consumed the start of a
        // CallExpression.  As such, we need to consume the rest of it here to be complete.
        return parseCallExpressionRest(expression);
    }

    private parseMemberExpressionOrHigher(): MemberExpression {
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
        const expression = parsePrimaryExpression();
        return parseMemberExpressionRest(expression);
    }

    private parseSuperExpression(): MemberExpression {
        const expression = parseTokenNode<PrimaryExpression>();
        if (token === TokenType.OpenParenToken || token === TokenType.DotToken || token === TokenType.OpenBracketToken) {
            return expression;
        }

        // If we have seen "super" it must be followed by '(' or '.'.
        // If it wasn't then just try to parse out a '.' and report an error.
        const node = <PropertyAccessExpression>createNode(TokenType.PropertyAccessExpression, expression.pos);
        node.expression = expression;
        this.parseExpectedToken(TokenType.DotToken, /*reportAtCurrentPosition*/ false, Diagnostics.super_must_be_followed_by_an_argument_list_or_member_access);
        node.name = parseRightSideOfDot(/*allowIdentifierNames*/ true);
        return finishNode(node);
    }

    private tagNamesAreEquivalent(lhs: JsxTagNameExpression, rhs: JsxTagNameExpression): boolean {
        if (lhs.kind !== rhs.kind) {
            return false;
        }

        if (lhs.kind === TokenType.Identifier) {
            return (<Identifier>lhs).text === (<Identifier>rhs).text;
        }

        if (lhs.kind === TokenType.ThisKeyword) {
            return true;
        }

        // If we are at this statement then we must have PropertyAccessExpression and because tag name in Jsx element can only
        // take forms of JsxTagNameExpression which includes an identifier, "this" expression, or another propertyAccessExpression
        // it is safe to case the expression property as such. See parseJsxElementName for how we parse tag name in Jsx element
        return (<PropertyAccessExpression>lhs).name.text === (<PropertyAccessExpression>rhs).name.text &&
            tagNamesAreEquivalent((<PropertyAccessExpression>lhs).expression as JsxTagNameExpression, (<PropertyAccessExpression>rhs).expression as JsxTagNameExpression);
    }


    private parseJsxElementOrSelfClosingElement(inExpressionContext: boolean): JsxElement | JsxSelfClosingElement {
        const opening = parseJsxOpeningOrSelfClosingElement(inExpressionContext);
        let result: JsxElement | JsxSelfClosingElement;
        if (opening.kind === TokenType.JsxOpeningElement) {
            const node = <JsxElement>createNode(TokenType.JsxElement, opening.pos);
            node.openingElement = opening;

            node.children = parseJsxChildren(node.openingElement.tagName);
            node.closingElement = parseJsxClosingElement(inExpressionContext);

            if (!tagNamesAreEquivalent(node.openingElement.tagName, node.closingElement.tagName)) {
                parseErrorAtPosition(node.closingElement.pos, node.closingElement.end - node.closingElement.pos, Diagnostics.Expected_corresponding_JSX_closing_tag_for_0, getTextOfNodeFromSourceText(sourceText, node.openingElement.tagName));
            }

            result = finishNode(node);
        }
        else {
            Debug.assert(opening.kind === TokenType.JsxSelfClosingElement);
            // Nothing else to do for self-closing elements
            result = <JsxSelfClosingElement>opening;
        }

        // If the user writes the invalid code '<div></div><div></div>' in an expression context (i.e. not wrapped in
        // an enclosing tag), we'll naively try to parse   ^ this as a 'less than' operator and the remainder of the tag
        // as garbage, which will cause the formatter to badly mangle the JSX. Perform a speculative parse of a JSX
        // element if we see a < token so that we can wrap it in a synthetic binary expression so the formatter
        // does less damage and we can report a better error.
        // Since JSX elements are invalid < operands anyway, this lookahead parse will only occur in error scenarios
        // of one sort or another.
        if (inExpressionContext && token === TokenType.LessThanToken) {
            const invalidElement = tryParse(() => parseJsxElementOrSelfClosingElement(/*inExpressionContext*/true));
            if (invalidElement) {
                parseErrorAtCurrentToken(Diagnostics.JSX_expressions_must_have_one_parent_element);
                const badNode = <BinaryExpression>createNode(TokenType.BinaryExpression, result.pos);
                badNode.end = invalidElement.end;
                badNode.left = result;
                badNode.right = invalidElement;
                badNode.operatorToken = createMissingNode(TokenType.CommaToken, /*reportAtCurrentPosition*/ false, /*diagnosticMessage*/ undefined);
                badNode.operatorToken.pos = badNode.operatorToken.end = badNode.right.pos;
                return <JsxElement><Node>badNode;
            }
        }

        return result;
    }

    private parseJsxText(): JsxText {
        const node = <JsxText>createNode(TokenType.JsxText, scanner.getStartPos());
        token = scanner.scanJsxToken();
        return finishNode(node);
    }

    private parseJsxChild(): JsxChild {
        switch (token) {
            case TokenType.JsxText:
                return parseJsxText();
            case TokenType.OpenBraceToken:
                return parseJsxExpression(/*inExpressionContext*/ false);
            case TokenType.LessThanToken:
                return parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ false);
        }
        Debug.fail("Unknown JSX child kind " + token);
    }

    private parseJsxChildren(openingTagName: LeftHandSideExpression): NodeArray<JsxChild> {
        const result = <NodeArray<JsxChild>>[];
        result.pos = scanner.getStartPos();
        const saveParsingContext = parsingContext;
        parsingContext |= 1 << ParsingContext.JsxChildren;

        while (true) {
            token = scanner.reScanJsxToken();
            if (token === TokenType.LessThanSlashToken) {
                // Closing tag
                break;
            }
            else if (token === TokenType.EndOfFileToken) {
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
    }

    private parseJsxOpeningOrSelfClosingElement(inExpressionContext: boolean): JsxOpeningElement | JsxSelfClosingElement {
        const fullStart = scanner.getStartPos();

        this.parseExpected(TokenType.LessThanToken);

        const tagName = parseJsxElementName();

        const attributes = parseList(ParsingContext.JsxAttributes, parseJsxAttribute);
        let node: JsxOpeningLikeElement;

        if (token === TokenType.GreaterThanToken) {
            // Closing tag, so scan the immediately-following text with the JSX scanning instead
            // of regular scanning to avoid treating illegal characters (e.g. '#') as immediate
            // scanning errors
            node = <JsxOpeningElement>createNode(TokenType.JsxOpeningElement, fullStart);
            scanJsxText();
        }
        else {
            this.parseExpected(TokenType.SlashToken);
            if (inExpressionContext) {
                this.parseExpected(TokenType.GreaterThanToken);
            }
            else {
                this.parseExpected(TokenType.GreaterThanToken, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
                scanJsxText();
            }
            node = <JsxSelfClosingElement>createNode(TokenType.JsxSelfClosingElement, fullStart);
        }

        node.tagName = tagName;
        node.attributes = attributes;

        return finishNode(node);
    }

    private parseJsxElementName(): JsxTagNameExpression {
        scanJsxIdentifier();
        // JsxElement can have name in the form of
        //      propertyAccessExpression
        //      primaryExpression in the form of an identifier and "this" keyword
        // We can't just simply use parseLeftHandSideExpressionOrHigher because then we will start consider class,private etc as a keyword
        // We only want to consider "this" as a primaryExpression
        let expression: JsxTagNameExpression = token === TokenType.ThisKeyword ?
            parseTokenNode<PrimaryExpression>() : parseIdentifierName();
        while (parseOptional(TokenType.DotToken)) {
            const propertyAccess: PropertyAccessExpression = <PropertyAccessExpression>createNode(TokenType.PropertyAccessExpression, expression.pos);
            propertyAccess.expression = expression;
            propertyAccess.name = parseRightSideOfDot(/*allowIdentifierNames*/ true);
            expression = finishNode(propertyAccess);
        }
        return expression;
    }

    private parseJsxExpression(inExpressionContext: boolean): JsxExpression {
        const node = <JsxExpression>createNode(TokenType.JsxExpression);

        this.parseExpected(TokenType.OpenBraceToken);
        if (token !== TokenType.CloseBraceToken) {
            node.expression = parseAssignmentExpressionOrHigher();
        }
        if (inExpressionContext) {
            this.parseExpected(TokenType.CloseBraceToken);
        }
        else {
            this.parseExpected(TokenType.CloseBraceToken, /*message*/ undefined, /*shouldAdvance*/ false);
            scanJsxText();
        }

        return finishNode(node);
    }

    private parseJsxAttribute(): JsxAttribute | JsxSpreadAttribute {
        if (token === TokenType.OpenBraceToken) {
            return parseJsxSpreadAttribute();
        }

        scanJsxIdentifier();
        const node = <JsxAttribute>createNode(TokenType.JsxAttribute);
        node.name = parseIdentifierName();
        if (parseOptional(TokenType.EqualsToken)) {
            switch (token) {
                case TokenType.StringLiteral:
                    node.initializer = parseLiteralNode();
                    break;
                default:
                    node.initializer = parseJsxExpression(/*inExpressionContext*/ true);
                    break;
            }
        }
        return finishNode(node);
    }

    private parseJsxSpreadAttribute(): JsxSpreadAttribute {
        const node = <JsxSpreadAttribute>createNode(TokenType.JsxSpreadAttribute);
        this.parseExpected(TokenType.OpenBraceToken);
        this.parseExpected(TokenType.DotDotDotToken);
        node.expression = parseExpression();
        this.parseExpected(TokenType.CloseBraceToken);
        return finishNode(node);
    }

    private parseJsxClosingElement(inExpressionContext: boolean): JsxClosingElement {
        const node = <JsxClosingElement>createNode(TokenType.JsxClosingElement);
        this.parseExpected(TokenType.LessThanSlashToken);
        node.tagName = parseJsxElementName();
        if (inExpressionContext) {
            this.parseExpected(TokenType.GreaterThanToken);
        }
        else {
            this.parseExpected(TokenType.GreaterThanToken, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
            scanJsxText();
        }
        return finishNode(node);
    }

    private parseTypeAssertion(): TypeAssertion {
        const node = <TypeAssertion>createNode(TokenType.TypeAssertionExpression);
        this.parseExpected(TokenType.LessThanToken);
        node.type = parseType();
        this.parseExpected(TokenType.GreaterThanToken);
        node.expression = parseSimpleUnaryExpression();
        return finishNode(node);
    }

    private parseMemberExpressionRest(expression: LeftHandSideExpression): MemberExpression {
        while (true) {
            const dotToken = parseOptionalToken(TokenType.DotToken);
            if (dotToken) {
                const propertyAccess = <PropertyAccessExpression>createNode(TokenType.PropertyAccessExpression, expression.pos);
                propertyAccess.expression = expression;
                propertyAccess.name = parseRightSideOfDot(/*allowIdentifierNames*/ true);
                expression = finishNode(propertyAccess);
                continue;
            }

            if (token === TokenType.ExclamationToken && !scanner.hasPrecedingLineBreak()) {
                nextToken();
                const nonNullExpression = <NonNullExpression>createNode(TokenType.NonNullExpression, expression.pos);
                nonNullExpression.expression = expression;
                expression = finishNode(nonNullExpression);
                continue;
            }

            // when in the [Decorator] context, we do not parse ElementAccess as it could be part of a ComputedPropertyName
            if (!inDecoratorContext() && parseOptional(TokenType.OpenBracketToken)) {
                const indexedAccess = <ElementAccessExpression>createNode(TokenType.ElementAccessExpression, expression.pos);
                indexedAccess.expression = expression;

                // It's not uncommon for a user to write: "new Type[]".
                // Check for that common pattern and report a better error message.
                if (token !== TokenType.CloseBracketToken) {
                    indexedAccess.argumentExpression = allowInAnd(parseExpression);
                    if (indexedAccess.argumentExpression.kind === TokenType.StringLiteral || indexedAccess.argumentExpression.kind === TokenType.NumericLiteral) {
                        const literal = <LiteralExpression>indexedAccess.argumentExpression;
                        literal.text = internIdentifier(literal.text);
                    }
                }

                this.parseExpected(TokenType.CloseBracketToken);
                expression = finishNode(indexedAccess);
                continue;
            }

            if (token === TokenType.NoSubstitutionTemplateLiteral || token === TokenType.TemplateHead) {
                const tagExpression = <TaggedTemplateExpression>createNode(TokenType.TaggedTemplateExpression, expression.pos);
                tagExpression.tag = expression;
                tagExpression.template = token === TokenType.NoSubstitutionTemplateLiteral
                    ? parseLiteralNode()
                    : parseTemplateExpression();
                expression = finishNode(tagExpression);
                continue;
            }

            return <MemberExpression>expression;
        }
    }

    private parseCallExpressionRest(expression: LeftHandSideExpression): LeftHandSideExpression {
        while (true) {
            expression = parseMemberExpressionRest(expression);
            if (token === TokenType.LessThanToken) {
                // See if this is the start of a generic invocation.  If so, consume it and
                // keep checking for postfix expressions.  Otherwise, it's just a '<' that's
                // part of an arithmetic expression.  Break out so we consume it higher in the
                // stack.
                const typeArguments = tryParse(parseTypeArgumentsInExpression);
                if (!typeArguments) {
                    return expression;
                }

                const callExpr = <CallExpression>createNode(TokenType.CallExpression, expression.pos);
                callExpr.expression = expression;
                callExpr.typeArguments = typeArguments;
                callExpr.arguments = parseArgumentList();
                expression = finishNode(callExpr);
                continue;
            }
            else if (token === TokenType.OpenParenToken) {
                const callExpr = <CallExpression>createNode(TokenType.CallExpression, expression.pos);
                callExpr.expression = expression;
                callExpr.arguments = parseArgumentList();
                expression = finishNode(callExpr);
                continue;
            }

            return expression;
        }
    }

    private parseArgumentList() {
        this.parseExpected(TokenType.OpenParenToken);
        const result = parseDelimitedList(ParsingContext.ArgumentExpressions, parseArgumentExpression);
        this.parseExpected(TokenType.CloseParenToken);
        return result;
    }

    private parseTypeArgumentsInExpression() {
        if (!parseOptional(TokenType.LessThanToken)) {
            return undefined;
        }

        const typeArguments = parseDelimitedList(ParsingContext.TypeArguments, parseType);
        if (!this.parseExpected(TokenType.GreaterThanToken)) {
            // If it doesn't have the closing >  then it's definitely not an type argument list.
            return undefined;
        }

        // If we have a '<', then only parse this as a argument list if the type arguments
        // are complete and we have an open paren.  if we don't, rewind and return nothing.
        return typeArguments && canFollowTypeArgumentsInExpression()
            ? typeArguments
            : undefined;
    }

    private canFollowTypeArgumentsInExpression(): boolean {
        switch (token) {
            case TokenType.OpenParenToken:                 // foo<x>(
            // this case are the only case where this token can legally follow a type argument
            // list.  So we definitely want to treat this as a type arg list.

            case TokenType.DotToken:                       // foo<x>.
            case TokenType.CloseParenToken:                // foo<x>)
            case TokenType.CloseBracketToken:              // foo<x>]
            case TokenType.ColonToken:                     // foo<x>:
            case TokenType.SemicolonToken:                 // foo<x>;
            case TokenType.QuestionToken:                  // foo<x>?
            case TokenType.EqualsEqualsToken:              // foo<x> ==
            case TokenType.EqualsEqualsEqualsToken:        // foo<x> ===
            case TokenType.ExclamationEqualsToken:         // foo<x> !=
            case TokenType.ExclamationEqualsEqualsToken:   // foo<x> !==
            case TokenType.AmpersandAmpersandToken:        // foo<x> &&
            case TokenType.BarBarToken:                    // foo<x> ||
            case TokenType.CaretToken:                     // foo<x> ^
            case TokenType.AmpersandToken:                 // foo<x> &
            case TokenType.BarToken:                       // foo<x> |
            case TokenType.CloseBraceToken:                // foo<x> }
            case TokenType.EndOfFileToken:                 // foo<x>
                // these cases can't legally follow a type arg list.  However, they're not legal
                // expressions either.  The user is probably in the middle of a generic type. So
                // treat it as such.
                return true;

            case TokenType.CommaToken:                     // foo<x>,
            case TokenType.OpenBraceToken:                 // foo<x> {
            // We don't want to treat these as type arguments.  Otherwise we'll parse this
            // as an invocation expression.  Instead, we want to parse out the expression
            // in isolation from the type arguments.

            default:
                // Anything else treat as an expression.
                return false;
        }
    }

    private parsePrimaryExpression(): PrimaryExpression {
        switch (token) {
            case TokenType.NumericLiteral:
            case TokenType.StringLiteral:
            case TokenType.NoSubstitutionTemplateLiteral:
                return parseLiteralNode();
            case TokenType.ThisKeyword:
            case TokenType.SuperKeyword:
            case TokenType.NullKeyword:
            case TokenType.TrueKeyword:
            case TokenType.FalseKeyword:
                return parseTokenNode<PrimaryExpression>();
            case TokenType.OpenParenToken:
                return parseParenthesizedExpression();
            case TokenType.OpenBracketToken:
                return parseArrayLiteralExpression();
            case TokenType.OpenBraceToken:
                return parseObjectLiteralExpression();
            case TokenType.AsyncKeyword:
                // Async arrow privates are parsed earlier in parseAssignmentExpressionOrHigher.
                // If we encounter `async [no LineTerminator here] private` then this is an async
                // private; otherwise, its an identifier.
                if (!lookAhead(nextTokenIsFunctionKeywordOnSameLine)) {
                    break;
                }

                return parseFunctionExpression();
            case TokenType.ClassKeyword:
                return parseClassExpression();
            case TokenType.FunctionKeyword:
                return parseFunctionExpression();
            case TokenType.NewKeyword:
                return parseNewExpression();
            case TokenType.SlashToken:
            case TokenType.SlashEqualsToken:
                if (reScanSlashToken() === TokenType.RegularExpressionLiteral) {
                    return parseLiteralNode();
                }
                break;
            case TokenType.TemplateHead:
                return parseTemplateExpression();
        }

        return parseIdentifier(Diagnostics.Expression_expected);
    }

    private parseParenthesizedExpression(): ParenthesizedExpression {
        const node = <ParenthesizedExpression>createNode(TokenType.ParenthesizedExpression);
        this.parseExpected(TokenType.OpenParenToken);
        node.expression = allowInAnd(parseExpression);
        this.parseExpected(TokenType.CloseParenToken);
        return finishNode(node);
    }

    private parseSpreadElement(): Expression {
        const node = <SpreadElementExpression>createNode(TokenType.SpreadElementExpression);
        this.parseExpected(TokenType.DotDotDotToken);
        node.expression = parseAssignmentExpressionOrHigher();
        return finishNode(node);
    }

    private parseArgumentOrArrayLiteralElement(): Expression {
        return token === TokenType.DotDotDotToken ? parseSpreadElement() :
            token === TokenType.CommaToken ? <Expression>createNode(TokenType.OmittedExpression) :
                parseAssignmentExpressionOrHigher();
    }

    private parseArgumentExpression(): Expression {
        return doOutsideOfContext(disallowInAndDecoratorContext, parseArgumentOrArrayLiteralElement);
    }

    private parseArrayLiteralExpression(): ArrayLiteralExpression {
        const node = <ArrayLiteralExpression>createNode(TokenType.ArrayLiteralExpression);
        this.parseExpected(TokenType.OpenBracketToken);
        if (scanner.hasPrecedingLineBreak()) {
            node.multiLine = true;
        }
        node.elements = parseDelimitedList(ParsingContext.ArrayLiteralMembers, parseArgumentOrArrayLiteralElement);
        this.parseExpected(TokenType.CloseBracketToken);
        return finishNode(node);
    }

    private tryParseAccessorDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): AccessorDeclaration {
        if (parseContextualModifier(TokenType.GetKeyword)) {
            return addJSDocComment(parseAccessorDeclaration(TokenType.GetAccessor, fullStart, decorators, modifiers));
        }
        else if (parseContextualModifier(TokenType.SetKeyword)) {
            return parseAccessorDeclaration(TokenType.SetAccessor, fullStart, decorators, modifiers);
        }

        return undefined;
    }

    private parseObjectLiteralElement(): ObjectLiteralElement {
        const fullStart = scanner.getStartPos();
        const decorators = parseDecorators();
        const modifiers = parseModifiers();

        const accessor = tryParseAccessorDeclaration(fullStart, decorators, modifiers);
        if (accessor) {
            return accessor;
        }

        const asteriskToken = parseOptionalToken(TokenType.AsteriskToken);
        const tokenIsIdentifier = isIdentifier();
        const propertyName = parsePropertyName();

        // Disallowing of optional property assignments happens in the grammar checker.
        const questionToken = parseOptionalToken(TokenType.QuestionToken);
        if (asteriskToken || token === TokenType.OpenParenToken || token === TokenType.LessThanToken) {
            return parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, propertyName, questionToken);
        }

        // check if it is short-hand property assignment or normal property assignment
        // NOTE: if token is EqualsToken it is interpreted as CoverInitializedName production
        // CoverInitializedName[Yield] :
        //     IdentifierReference[?Yield] Initializer[In, ?Yield]
        // this is necessary because ObjectLiteral productions are also used to cover grammar for ObjectAssignmentPattern
        const isShorthandPropertyAssignment =
            tokenIsIdentifier && (token === TokenType.CommaToken || token === TokenType.CloseBraceToken || token === TokenType.EqualsToken);

        if (isShorthandPropertyAssignment) {
            const shorthandDeclaration = <ShorthandPropertyAssignment>createNode(TokenType.ShorthandPropertyAssignment, fullStart);
            shorthandDeclaration.name = <Identifier>propertyName;
            shorthandDeclaration.questionToken = questionToken;
            const equalsToken = parseOptionalToken(TokenType.EqualsToken);
            if (equalsToken) {
                shorthandDeclaration.equalsToken = equalsToken;
                shorthandDeclaration.objectAssignmentInitializer = allowInAnd(parseAssignmentExpressionOrHigher);
            }
            return addJSDocComment(finishNode(shorthandDeclaration));
        }
        else {
            const propertyAssignment = <PropertyAssignment>createNode(TokenType.PropertyAssignment, fullStart);
            propertyAssignment.modifiers = modifiers;
            propertyAssignment.name = propertyName;
            propertyAssignment.questionToken = questionToken;
            this.parseExpected(TokenType.ColonToken);
            propertyAssignment.initializer = allowInAnd(parseAssignmentExpressionOrHigher);
            return addJSDocComment(finishNode(propertyAssignment));
        }
    }

    private parseObjectLiteralExpression(): ObjectLiteralExpression {
        const node = <ObjectLiteralExpression>createNode(TokenType.ObjectLiteralExpression);
        this.parseExpected(TokenType.OpenBraceToken);
        if (scanner.hasPrecedingLineBreak()) {
            node.multiLine = true;
        }

        node.properties = parseDelimitedList(ParsingContext.ObjectLiteralMembers, parseObjectLiteralElement, /*considerSemicolonAsDelimiter*/ true);
        this.parseExpected(TokenType.CloseBraceToken);
        return finishNode(node);
    }

    private parseFunctionExpression(): FunctionExpression {
        // GeneratorExpression:
        //      private* BindingIdentifier [Yield][opt](FormalParameters[Yield]){ GeneratorBody }
        //
        // FunctionExpression:
        //      private BindingIdentifier[opt](FormalParameters){ FunctionBody }
        const saveDecoratorContext = inDecoratorContext();
        if (saveDecoratorContext) {
            setDecoratorContext(/*val*/ false);
        }

        const node = <FunctionExpression>createNode(TokenType.FunctionExpression);
        setModifiers(node, parseModifiers());
        this.parseExpected(TokenType.FunctionKeyword);
        node.asteriskToken = parseOptionalToken(TokenType.AsteriskToken);

        const isGenerator = !!node.asteriskToken;
        const isAsync = !!(node.flags & NodeFlags.Async);
        node.name =
            isGenerator && isAsync ? doInYieldAndAwaitContext(parseOptionalIdentifier) :
                isGenerator ? doInYieldContext(parseOptionalIdentifier) :
                    isAsync ? doInAwaitContext(parseOptionalIdentifier) :
                        parseOptionalIdentifier();

        fillSignature(TokenType.ColonToken, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, node);
        node.body = parseFunctionBlock(/*allowYield*/ isGenerator, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);

        if (saveDecoratorContext) {
            setDecoratorContext(/*val*/ true);
        }

        return addJSDocComment(finishNode(node));
    }

    private parseOptionalIdentifier() {
        return isIdentifier() ? parseIdentifier() : undefined;
    }

    private parseNewExpression(): NewExpression {
        const node = <NewExpression>createNode(TokenType.NewExpression);
        this.parseExpected(TokenType.NewKeyword);
        node.expression = parseMemberExpressionOrHigher();
        node.typeArguments = tryParse(parseTypeArgumentsInExpression);
        if (node.typeArguments || token === TokenType.OpenParenToken) {
            node.arguments = parseArgumentList();
        }

        return finishNode(node);
    }

    // STATEMENTS
    private parseBlock(ignoreMissingOpenBrace: boolean, diagnosticMessage?: DiagnosticMessage): Block {
        const node = <Block>createNode(TokenType.Block);
        if (this.parseExpected(TokenType.OpenBraceToken, diagnosticMessage) || ignoreMissingOpenBrace) {
            node.statements = parseList(ParsingContext.BlockStatements, parseStatement);
            this.parseExpected(TokenType.CloseBraceToken);
        }
        else {
            node.statements = createMissingList<Statement>();
        }
        return finishNode(node);
    }

    private parseFunctionBlock(allowYield: boolean, allowAwait: boolean, ignoreMissingOpenBrace: boolean, diagnosticMessage?: DiagnosticMessage): Block {
        const savedYieldContext = inYieldContext();
        setYieldContext(allowYield);

        const savedAwaitContext = inAwaitContext();
        setAwaitContext(allowAwait);

        // We may be in a [Decorator] context when parsing a private expression or
        // arrow private. The body of the private is not in [Decorator] context.
        const saveDecoratorContext = inDecoratorContext();
        if (saveDecoratorContext) {
            setDecoratorContext(/*val*/ false);
        }

        const block = parseBlock(ignoreMissingOpenBrace, diagnosticMessage);

        if (saveDecoratorContext) {
            setDecoratorContext(/*val*/ true);
        }

        setYieldContext(savedYieldContext);
        setAwaitContext(savedAwaitContext);

        return block;
    }

    private parseIfStatement() {

        // IfStatement :
        //   if Condition EmbeddedStatement
        //   if Condition EmbeddedStatement else EmbeddedStatement

        const result = new ast.IfStatement();
        result.start = this.lexer.tokenStart;
        this.parseExpected(TokenType.if);
        result.condition = this.parseCondition();
        result.thenClause = this.parseEmbeddedStatement();
        if (this.parseOptional(TokenType.else)) {
            result.elseClause = this.parseEmbeddedStatement();
        }
        return result;
    }

    /**
     * 解析条件部分。
     */
    private parseCondition() {

        // Condition :
        //   ( BooleanExpression )

        let result: ast.Expression;
        if (this.parseOptional(TokenType.openParen)) {
            result = this.parseExpression(0);
            this.parseExpected(TokenType.closeParen);
        } else {
            if (Compiler.options.disallowMissingParentheses) {
                this.reportSyntaxError("严格模式: 应输入“(”");
            }
            result = this.parseExpression();
        }
        return result;
    }

    private parseEmbeddedStatement() {

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
    }

    private parseDoWhileStatement() {

        // DoWhileStatement :
        //   do EmbeddedStatement while Condition ;

        const result = new ast.DoWhileStatement();
        result.start = this.lexer.tokenStart;
        this.parseExpected(TokenType.do);
        result.body = this.parseEmbeddedStatement();
        this.parseExpected(TokenType.while);
        result.condition = this.parseCondition();

        // From: https://mail.mozilla.org/pipermail/es-discuss/2011-August/016188.html
        // 157 min --- All allen at wirfs-brock.com CONF --- "do{;}while(false)false" prohibited in
        // spec but allowed in consensus reality. Approved -- this is the de-facto standard whereby
        //  do;while(0)x will have a semicolon inserted before x.
        this.parseOptional(TokenType.semicolon);
        result.end = this.lexer.tokenEnd;
        return result;
    }

    private parseWhileStatement() {

        // WhileStatement :
        //   while Condition EmbeddedStatement ;

        const result = new ast.WhileStatement();
        result.start = this.lexer.tokenStart;
        this.parseExpected(TokenType.while);
        result.condition = this.parseCondition();
        result.body = this.parseEmbeddedStatement();
        return result;
    }

    private parseForStatement() {

        // ForStatement :
        //   for ( VariableOrExpression? ; Expression? ; Expression? ) EmbeddedStatement
        //   for ( VaribaleDeclartionList in Expression ) EmbeddedStatement
        //   for ( Identifier: Type = Expression to Expression ) EmbeddedStatement

        const pos = getNodePos();
        this.parseExpected(TokenType.ForKeyword);
        this.parseExpected(TokenType.OpenParenToken);

        let initializer: VariableDeclarationList | Expression = undefined;
        if (token !== TokenType.SemicolonToken) {
            if (token === TokenType.VarKeyword || token === TokenType.LetKeyword || token === TokenType.ConstKeyword) {
                initializer = parseVariableDeclarationList(/*inForStatementInitializer*/ true);
            }
            else {
                initializer = disallowInAnd(parseExpression);
            }
        }
        let forOrForInOrForOfStatement: IterationStatement;
        if (parseOptional(TokenType.InKeyword)) {
            const forInStatement = <ForInStatement>createNode(TokenType.ForInStatement, pos);
            forInStatement.initializer = initializer;
            forInStatement.expression = allowInAnd(parseExpression);
            this.parseExpected(TokenType.CloseParenToken);
            forOrForInOrForOfStatement = forInStatement;
        }
        else if (parseOptional(TokenType.OfKeyword)) {
            const forOfStatement = <ForOfStatement>createNode(TokenType.ForOfStatement, pos);
            forOfStatement.initializer = initializer;
            forOfStatement.expression = allowInAnd(parseAssignmentExpressionOrHigher);
            this.parseExpected(TokenType.CloseParenToken);
            forOrForInOrForOfStatement = forOfStatement;
        }
        else {
            const forStatement = <ForStatement>createNode(TokenType.ForStatement, pos);
            forStatement.initializer = initializer;
            this.parseExpected(TokenType.SemicolonToken);
            if (token !== TokenType.SemicolonToken && token !== TokenType.CloseParenToken) {
                forStatement.condition = allowInAnd(parseExpression);
            }
            this.parseExpected(TokenType.SemicolonToken);
            if (token !== TokenType.CloseParenToken) {
                forStatement.incrementor = allowInAnd(parseExpression);
            }
            this.parseExpected(TokenType.CloseParenToken);
            forOrForInOrForOfStatement = forStatement;
        }

        forOrForInOrForOfStatement.statement = parseStatement();

        return finishNode(forOrForInOrForOfStatement);
    }

    private parseBreakStatement() {

        // BreakStatement :
        //   break ;

        const result = new ast.BreakStatement();
        result.start = this.lexer.tokenStart;
        this.parseExpected(TokenType.break);
        if (!this.autoInsertSemicolon()) {
            result.label = this.parseIdentifier();
        }
        this.parseOptional(TokenType.semicolon);
        result.end = this.lexer.tokenEnd;
        return result;
    }

    private parseContinueStatement(kind: TokenType) {

        // ContinueStatement :
        //   continue ;

        const result = new ast.ContinueStatement();
        result.start = this.lexer.tokenStart;
        this.parseExpected(TokenType.continue);
        if (!this.autoInsertSemicolon()) {
            result.label = this.parseIdentifier();
        }
        this.parseOptional(TokenType.semicolon);
        result.end = this.lexer.tokenEnd;
        return result;
    }

    private parseReturnStatement() {

        // ReturnStatement :
        //   return Expression? ;

        const result = new ast.ReturnStatement();
        result.start = this.lexer.tokenStart;
        this.parseExpected(TokenType.return);
        if (!this.autoInsertSemicolon()) {
            result.value = this.parseExpression(true);
        }

        parseSemicolon();
        return finishNode(node);
    }

    private parseWithStatement(): WithStatement {
        const node = <WithStatement>createNode(TokenType.WithStatement);
        this.parseExpected(TokenType.WithKeyword);
        this.parseExpected(TokenType.OpenParenToken);
        node.expression = allowInAnd(parseExpression);
        this.parseExpected(TokenType.CloseParenToken);
        node.statement = parseStatement();
        return finishNode(node);
    }

    private parseCaseClause(): CaseClause {
        const node = <CaseClause>createNode(TokenType.CaseClause);
        this.parseExpected(TokenType.CaseKeyword);
        node.expression = allowInAnd(parseExpression);
        this.parseExpected(TokenType.ColonToken);
        node.statements = parseList(ParsingContext.SwitchClauseStatements, parseStatement);
        return finishNode(node);
    }

    private parseDefaultClause(): DefaultClause {
        const node = <DefaultClause>createNode(TokenType.DefaultClause);
        this.parseExpected(TokenType.DefaultKeyword);
        this.parseExpected(TokenType.ColonToken);
        node.statements = parseList(ParsingContext.SwitchClauseStatements, parseStatement);
        return finishNode(node);
    }

    private parseCaseOrDefaultClause(): CaseOrDefaultClause {
        return token === TokenType.CaseKeyword ? parseCaseClause() : parseDefaultClause();
    }

    private parseSwitchStatement(): SwitchStatement {
        const node = <SwitchStatement>createNode(TokenType.SwitchStatement);
        this.parseExpected(TokenType.SwitchKeyword);
        this.parseExpected(TokenType.OpenParenToken);
        node.expression = allowInAnd(parseExpression);
        this.parseExpected(TokenType.CloseParenToken);
        const caseBlock = <CaseBlock>createNode(TokenType.CaseBlock, scanner.getStartPos());
        this.parseExpected(TokenType.OpenBraceToken);
        caseBlock.clauses = parseList(ParsingContext.SwitchClauses, parseCaseOrDefaultClause);
        this.parseExpected(TokenType.CloseBraceToken);
        node.caseBlock = finishNode(caseBlock);
        return finishNode(node);
    }

    private parseThrowStatement(): ThrowStatement {
        // ThrowStatement[Yield] :
        //      throw [no LineTerminator here]Expression[In, ?Yield];

        // Because of automatic semicolon insertion, we need to report error if this
        // throw could be terminated with a semicolon.  Note: we can't call 'parseExpression'
        // directly as that might consume an expression on the following line.
        // We just return 'undefined' in that case.  The actual error will be reported in the
        // grammar walker.
        const node = <ThrowStatement>createNode(TokenType.ThrowStatement);
        this.parseExpected(TokenType.ThrowKeyword);
        node.expression = scanner.hasPrecedingLineBreak() ? undefined : allowInAnd(parseExpression);
        parseSemicolon();
        return finishNode(node);
    }

    // TODO: Review for error recovery
    private parseTryStatement(): TryStatement {
        const node = <TryStatement>createNode(TokenType.TryStatement);

        this.parseExpected(TokenType.TryKeyword);
        node.tryBlock = parseBlock(/*ignoreMissingOpenBrace*/ false);
        node.catchClause = token === TokenType.CatchKeyword ? parseCatchClause() : undefined;

        // If we don't have a catch clause, then we must have a finally clause.  Try to parse
        // one out no matter what.
        if (!node.catchClause || token === TokenType.FinallyKeyword) {
            this.parseExpected(TokenType.FinallyKeyword);
            node.finallyBlock = parseBlock(/*ignoreMissingOpenBrace*/ false);
        }

        return finishNode(node);
    }

    private parseCatchClause(): CatchClause {
        const result = <CatchClause>createNode(TokenType.CatchClause);
        this.parseExpected(TokenType.CatchKeyword);
        if (this.parseExpected(TokenType.OpenParenToken)) {
            result.variableDeclaration = parseVariableDeclaration();
        }

        this.parseExpected(TokenType.CloseParenToken);
        result.block = parseBlock(/*ignoreMissingOpenBrace*/ false);
        return finishNode(result);
    }

    private parseDebuggerStatement(): Statement {
        const node = <Statement>createNode(TokenType.DebuggerStatement);
        this.parseExpected(TokenType.DebuggerKeyword);
        parseSemicolon();
        return finishNode(node);
    }

    private parseExpressionOrLabeledStatement(): ExpressionStatement | LabeledStatement {
        // Avoiding having to do the lookahead for a labeled statement by just trying to parse
        // out an expression, seeing if it is identifier and then seeing if it is followed by
        // a colon.
        const fullStart = scanner.getStartPos();
        const expression = allowInAnd(parseExpression);

        if (expression.kind === TokenType.Identifier && parseOptional(TokenType.ColonToken)) {
            const labeledStatement = <LabeledStatement>createNode(TokenType.LabeledStatement, fullStart);
            labeledStatement.label = <Identifier>expression;
            labeledStatement.statement = parseStatement();
            return addJSDocComment(finishNode(labeledStatement));
        }
        else {
            const expressionStatement = <ExpressionStatement>createNode(TokenType.ExpressionStatement, fullStart);
            expressionStatement.expression = expression;
            parseSemicolon();
            return addJSDocComment(finishNode(expressionStatement));
        }
    }

    private nextTokenIsIdentifierOrKeywordOnSameLine() {
        nextToken();
        return tokenIsIdentifierOrKeyword(token) && !scanner.hasPrecedingLineBreak();
    }

    private nextTokenIsFunctionKeywordOnSameLine() {
        nextToken();
        return token === TokenType.FunctionKeyword && !scanner.hasPrecedingLineBreak();
    }

    private nextTokenIsIdentifierOrKeywordOrNumberOnSameLine() {
        nextToken();
        return (tokenIsIdentifierOrKeyword(token) || token === TokenType.NumericLiteral) && !scanner.hasPrecedingLineBreak();
    }

    private isDeclaration(): boolean {
        while (true) {
            switch (token) {
                case TokenType.VarKeyword:
                case TokenType.LetKeyword:
                case TokenType.ConstKeyword:
                case TokenType.FunctionKeyword:
                case TokenType.ClassKeyword:
                case TokenType.EnumKeyword:
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
                case TokenType.InterfaceKeyword:
                case TokenType.TypeKeyword:
                    return nextTokenIsIdentifierOnSameLine();
                case TokenType.ModuleKeyword:
                case TokenType.NamespaceKeyword:
                    return nextTokenIsIdentifierOrStringLiteralOnSameLine();
                case TokenType.AbstractKeyword:
                case TokenType.AsyncKeyword:
                case TokenType.DeclareKeyword:
                case TokenType.PrivateKeyword:
                case TokenType.ProtectedKeyword:
                case TokenType.PublicKeyword:
                case TokenType.ReadonlyKeyword:
                    nextToken();
                    // ASI takes effect for this modifier.
                    if (scanner.hasPrecedingLineBreak()) {
                        return false;
                    }
                    continue;

                case TokenType.GlobalKeyword:
                    nextToken();
                    return token === TokenType.OpenBraceToken || token === TokenType.Identifier || token === TokenType.ExportKeyword;

                case TokenType.ImportKeyword:
                    nextToken();
                    return token === TokenType.StringLiteral || token === TokenType.AsteriskToken ||
                        token === TokenType.OpenBraceToken || tokenIsIdentifierOrKeyword(token);
                case TokenType.ExportKeyword:
                    nextToken();
                    if (token === TokenType.EqualsToken || token === TokenType.AsteriskToken ||
                        token === TokenType.OpenBraceToken || token === TokenType.DefaultKeyword ||
                        token === TokenType.AsKeyword) {
                        return true;
                    }
                    continue;

                case TokenType.StaticKeyword:
                    nextToken();
                    continue;
                default:
                    return false;
            }
        }
    }

    private isStartOfDeclaration(): boolean {
        return lookAhead(isDeclaration);
    }

    private isStartOfStatement(): boolean {
        switch (token) {
            case TokenType.AtToken:
            case TokenType.SemicolonToken:
            case TokenType.OpenBraceToken:
            case TokenType.VarKeyword:
            case TokenType.LetKeyword:
            case TokenType.FunctionKeyword:
            case TokenType.ClassKeyword:
            case TokenType.EnumKeyword:
            case TokenType.IfKeyword:
            case TokenType.DoKeyword:
            case TokenType.WhileKeyword:
            case TokenType.ForKeyword:
            case TokenType.ContinueKeyword:
            case TokenType.BreakKeyword:
            case TokenType.ReturnKeyword:
            case TokenType.WithKeyword:
            case TokenType.SwitchKeyword:
            case TokenType.ThrowKeyword:
            case TokenType.TryKeyword:
            case TokenType.DebuggerKeyword:
            // 'catch' and 'finally' do not actually indicate that the code is part of a statement,
            // however, we say they are here so that we may gracefully parse them and error later.
            case TokenType.CatchKeyword:
            case TokenType.FinallyKeyword:
                return true;

            case TokenType.ConstKeyword:
            case TokenType.ExportKeyword:
            case TokenType.ImportKeyword:
                return isStartOfDeclaration();

            case TokenType.AsyncKeyword:
            case TokenType.DeclareKeyword:
            case TokenType.InterfaceKeyword:
            case TokenType.ModuleKeyword:
            case TokenType.NamespaceKeyword:
            case TokenType.TypeKeyword:
            case TokenType.GlobalKeyword:
                // When these don't start a declaration, they're an identifier in an expression statement
                return true;

            case TokenType.PublicKeyword:
            case TokenType.PrivateKeyword:
            case TokenType.ProtectedKeyword:
            case TokenType.StaticKeyword:
            case TokenType.ReadonlyKeyword:
                // When these don't start a declaration, they may be the start of a class member if an identifier
                // immediately follows. Otherwise they're an identifier in an expression statement.
                return isStartOfDeclaration() || !lookAhead(nextTokenIsIdentifierOrKeywordOnSameLine);

            default:
                return fallowsExpression();
        }
    }

    private nextTokenIsIdentifierOrStartOfDestructuring() {
        nextToken();
        return isIdentifier() || token === TokenType.OpenBraceToken || token === TokenType.OpenBracketToken;
    }

    private isLetDeclaration() {
        // In ES6 'let' always starts a lexical declaration if followed by an identifier or {
        // or [.
        return lookAhead(nextTokenIsIdentifierOrStartOfDestructuring);
    }

    private parseStatement(): Statement {
        switch (token) {
            case TokenType.SemicolonToken:
                return parseEmptyStatement();
            case TokenType.OpenBraceToken:
                return parseBlock(/*ignoreMissingOpenBrace*/ false);
            case TokenType.VarKeyword:
                return parseVariableStatement(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case TokenType.LetKeyword:
                if (isLetDeclaration()) {
                    return parseVariableStatement(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
                }
                break;
            case TokenType.FunctionKeyword:
                return parseFunctionDeclaration(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case TokenType.ClassKeyword:
                return parseClassDeclaration(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case TokenType.IfKeyword:
                return parseIfStatement();
            case TokenType.DoKeyword:
                return parseDoStatement();
            case TokenType.WhileKeyword:
                return parseWhileStatement();
            case TokenType.ForKeyword:
                return parseForOrForInOrForOfStatement();
            case TokenType.ContinueKeyword:
                return parseBreakOrContinueStatement(TokenType.ContinueStatement);
            case TokenType.BreakKeyword:
                return parseBreakOrContinueStatement(TokenType.BreakStatement);
            case TokenType.ReturnKeyword:
                return parseReturnStatement();
            case TokenType.WithKeyword:
                return parseWithStatement();
            case TokenType.SwitchKeyword:
                return parseSwitchStatement();
            case TokenType.ThrowKeyword:
                return parseThrowStatement();
            case TokenType.TryKeyword:
            // Include 'catch' and 'finally' for error recovery.
            case TokenType.CatchKeyword:
            case TokenType.FinallyKeyword:
                return parseTryStatement();
            case TokenType.DebuggerKeyword:
                return parseDebuggerStatement();
            case TokenType.AtToken:
                return parseDeclaration();
            case TokenType.AsyncKeyword:
            case TokenType.InterfaceKeyword:
            case TokenType.TypeKeyword:
            case TokenType.ModuleKeyword:
            case TokenType.NamespaceKeyword:
            case TokenType.DeclareKeyword:
            case TokenType.ConstKeyword:
            case TokenType.EnumKeyword:
            case TokenType.ExportKeyword:
            case TokenType.ImportKeyword:
            case TokenType.PrivateKeyword:
            case TokenType.ProtectedKeyword:
            case TokenType.PublicKeyword:
            case TokenType.AbstractKeyword:
            case TokenType.StaticKeyword:
            case TokenType.ReadonlyKeyword:
            case TokenType.GlobalKeyword:
                if (isStartOfDeclaration()) {
                    return parseDeclaration();
                }
                break;
        }
        return parseExpressionOrLabeledStatement();
    }

    private parseDeclaration(): Statement {
        const fullStart = getNodePos();
        const decorators = parseDecorators();
        const modifiers = parseModifiers();
        switch (token) {
            case TokenType.VarKeyword:
            case TokenType.LetKeyword:
            case TokenType.ConstKeyword:
                return parseVariableStatement(fullStart, decorators, modifiers);
            case TokenType.FunctionKeyword:
                return parseFunctionDeclaration(fullStart, decorators, modifiers);
            case TokenType.ClassKeyword:
                return parseClassDeclaration(fullStart, decorators, modifiers);
            case TokenType.InterfaceKeyword:
                return parseInterfaceDeclaration(fullStart, decorators, modifiers);
            case TokenType.TypeKeyword:
                return parseTypeAliasDeclaration(fullStart, decorators, modifiers);
            case TokenType.EnumKeyword:
                return parseEnumDeclaration(fullStart, decorators, modifiers);
            case TokenType.GlobalKeyword:
            case TokenType.ModuleKeyword:
            case TokenType.NamespaceKeyword:
                return parseModuleDeclaration(fullStart, decorators, modifiers);
            case TokenType.ImportKeyword:
                return parseImportDeclarationOrImportEqualsDeclaration(fullStart, decorators, modifiers);
            case TokenType.ExportKeyword:
                nextToken();
                switch (token) {
                    case TokenType.DefaultKeyword:
                    case TokenType.EqualsToken:
                        return parseExportAssignment(fullStart, decorators, modifiers);
                    case TokenType.AsKeyword:
                        return parseNamespaceExportDeclaration(fullStart, decorators, modifiers);
                    default:
                        return parseExportDeclaration(fullStart, decorators, modifiers);
                }
            default:
                if (decorators || modifiers) {
                    // We reached this point because we encountered decorators and/or modifiers and assumed a declaration
                    // would follow. For recovery and error reporting purposes, return an incomplete declaration.
                    const node = <Statement>createMissingNode(TokenType.MissingDeclaration, /*reportAtCurrentPosition*/ true, Diagnostics.Declaration_expected);
                    node.pos = fullStart;
                    node.decorators = decorators;
                    setModifiers(node, modifiers);
                    return finishNode(node);
                }
        }
    }

    private nextTokenIsIdentifierOrStringLiteralOnSameLine() {
        nextToken();
        return !scanner.hasPrecedingLineBreak() && (isIdentifier() || token === TokenType.StringLiteral);
    }

    private parseFunctionBlockOrSemicolon(isGenerator: boolean, isAsync: boolean, diagnosticMessage?: DiagnosticMessage): Block {
        if (token !== TokenType.OpenBraceToken && autoInsertSemicolon()) {
            parseSemicolon();
            return;
        }

        return parseFunctionBlock(isGenerator, isAsync, /*ignoreMissingOpenBrace*/ false, diagnosticMessage);
    }

    // DECLARATIONS

    private parseArrayBindingElement(): BindingElement {
        if (token === TokenType.CommaToken) {
            return <BindingElement>createNode(TokenType.OmittedExpression);
        }
        const node = <BindingElement>createNode(TokenType.BindingElement);
        node.dotDotDotToken = parseOptionalToken(TokenType.DotDotDotToken);
        node.name = parseIdentifierOrPattern();
        node.initializer = parseBindingElementInitializer(/*inParameter*/ false);
        return finishNode(node);
    }

    private parseObjectBindingElement(): BindingElement {
        const node = <BindingElement>createNode(TokenType.BindingElement);
        const tokenIsIdentifier = isIdentifier();
        const propertyName = parsePropertyName();
        if (tokenIsIdentifier && token !== TokenType.ColonToken) {
            node.name = <Identifier>propertyName;
        }
        else {
            this.parseExpected(TokenType.ColonToken);
            node.propertyName = propertyName;
            node.name = parseIdentifierOrPattern();
        }
        node.initializer = parseBindingElementInitializer(/*inParameter*/ false);
        return finishNode(node);
    }

    private parseObjectBindingPattern(): BindingPattern {
        const node = <BindingPattern>createNode(TokenType.ObjectBindingPattern);
        this.parseExpected(TokenType.OpenBraceToken);
        node.elements = parseDelimitedList(ParsingContext.ObjectBindingElements, parseObjectBindingElement);
        this.parseExpected(TokenType.CloseBraceToken);
        return finishNode(node);
    }

    private parseArrayBindingPattern(): BindingPattern {
        const node = <BindingPattern>createNode(TokenType.ArrayBindingPattern);
        this.parseExpected(TokenType.OpenBracketToken);
        node.elements = parseDelimitedList(ParsingContext.ArrayBindingElements, parseArrayBindingElement);
        this.parseExpected(TokenType.CloseBracketToken);
        return finishNode(node);
    }

    private isIdentifierOrPattern() {
        return token === TokenType.OpenBraceToken || token === TokenType.OpenBracketToken || isIdentifier();
    }

    private parseIdentifierOrPattern(): Identifier | BindingPattern {
        if (token === TokenType.OpenBracketToken) {
            return parseArrayBindingPattern();
        }
        if (token === TokenType.OpenBraceToken) {
            return parseObjectBindingPattern();
        }
        return parseIdentifier();
    }

    private parseVariableDeclaration(): VariableDeclaration {
        const node = <VariableDeclaration>createNode(TokenType.VariableDeclaration);
        node.name = parseIdentifierOrPattern();
        node.type = parseTypeAnnotation();
        if (!isInOrOfKeyword(token)) {
            node.initializer = parseInitializer(/*inParameter*/ false);
        }
        return finishNode(node);
    }

    private parseVariableDeclarationList(inForStatementInitializer: boolean): VariableDeclarationList {
        const node = <VariableDeclarationList>createNode(TokenType.VariableDeclarationList);

        switch (token) {
            case TokenType.VarKeyword:
                break;
            case TokenType.LetKeyword:
                node.flags |= NodeFlags.Let;
                break;
            case TokenType.ConstKeyword:
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
        if (token === TokenType.OfKeyword && lookAhead(canFollowContextualOfKeyword)) {
            node.declarations = createMissingList<VariableDeclaration>();
        }
        else {
            const savedDisallowIn = inDisallowInContext();
            setDisallowInContext(inForStatementInitializer);

            node.declarations = parseDelimitedList(ParsingContext.VariableDeclarations, parseVariableDeclaration);

            setDisallowInContext(savedDisallowIn);
        }

        return finishNode(node);
    }

    private canFollowContextualOfKeyword(): boolean {
        return nextTokenIsIdentifier() && nextToken() === TokenType.CloseParenToken;
    }

    private parseVariableStatement(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): VariableStatement {
        const node = <VariableStatement>createNode(TokenType.VariableStatement, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        node.declarationList = parseVariableDeclarationList(/*inForStatementInitializer*/ false);
        parseSemicolon();
        return addJSDocComment(finishNode(node));
    }

    private parseFunctionDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): FunctionDeclaration {
        const node = <FunctionDeclaration>createNode(TokenType.FunctionDeclaration, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        this.parseExpected(TokenType.FunctionKeyword);
        node.asteriskToken = parseOptionalToken(TokenType.AsteriskToken);
        node.name = node.flags & NodeFlags.Default ? parseOptionalIdentifier() : parseIdentifier();
        const isGenerator = !!node.asteriskToken;
        const isAsync = !!(node.flags & NodeFlags.Async);
        fillSignature(TokenType.ColonToken, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, node);
        node.body = parseFunctionBlockOrSemicolon(isGenerator, isAsync, Diagnostics.or_expected);
        return addJSDocComment(finishNode(node));
    }

    private parseConstructorDeclaration(pos: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): ConstructorDeclaration {
        const node = <ConstructorDeclaration>createNode(TokenType.Constructor, pos);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        this.parseExpected(TokenType.ConstructorKeyword);
        fillSignature(TokenType.ColonToken, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
        node.body = parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false, Diagnostics.or_expected);
        return addJSDocComment(finishNode(node));
    }

    private parseMethodDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray, asteriskToken: Node, name: PropertyName, questionToken: Node, diagnosticMessage?: DiagnosticMessage): MethodDeclaration {
        const method = <MethodDeclaration>createNode(TokenType.MethodDeclaration, fullStart);
        method.decorators = decorators;
        setModifiers(method, modifiers);
        method.asteriskToken = asteriskToken;
        method.name = name;
        method.questionToken = questionToken;
        const isGenerator = !!asteriskToken;
        const isAsync = !!(method.flags & NodeFlags.Async);
        fillSignature(TokenType.ColonToken, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, method);
        method.body = parseFunctionBlockOrSemicolon(isGenerator, isAsync, diagnosticMessage);
        return addJSDocComment(finishNode(method));
    }

    private parsePropertyDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray, name: PropertyName, questionToken: Node): ClassElement {
        const property = <PropertyDeclaration>createNode(TokenType.PropertyDeclaration, fullStart);
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
    }

    private parsePropertyOrMethodDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): ClassElement {
        const asteriskToken = parseOptionalToken(TokenType.AsteriskToken);
        const name = parsePropertyName();

        // Note: this is not legal as per the grammar.  But we allow it in the parser and
        // report an error in the grammar checker.
        const questionToken = parseOptionalToken(TokenType.QuestionToken);
        if (asteriskToken || token === TokenType.OpenParenToken || token === TokenType.LessThanToken) {
            return parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, name, questionToken, Diagnostics.or_expected);
        }
        else {
            return parsePropertyDeclaration(fullStart, decorators, modifiers, name, questionToken);
        }
    }

    private parseNonParameterInitializer() {
        return parseInitializer(/*inParameter*/ false);
    }

    private parseAccessorDeclaration(kind: TokenType, fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): AccessorDeclaration {
        const node = <AccessorDeclaration>createNode(kind, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        node.name = parsePropertyName();
        fillSignature(TokenType.ColonToken, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
        node.body = parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false);
        return finishNode(node);
    }

    private isClassMemberModifier(idToken: TokenType) {
        switch (idToken) {
            case TokenType.PublicKeyword:
            case TokenType.PrivateKeyword:
            case TokenType.ProtectedKeyword:
            case TokenType.StaticKeyword:
            case TokenType.ReadonlyKeyword:
                return true;
            default:
                return false;
        }
    }

    private isClassMemberStart(): boolean {
        let idToken: TokenType;

        if (token === TokenType.AtToken) {
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

        if (token === TokenType.AsteriskToken) {
            return true;
        }

        // Try to get the first property-like token following all modifiers.
        // This can either be an identifier or the 'get' or 'set' keywords.
        if (isLiteralPropertyName()) {
            idToken = token;
            nextToken();
        }

        // Index signatures and computed properties are class members; we can parse.
        if (token === TokenType.OpenBracketToken) {
            return true;
        }

        // If we were able to get any potential identifier...
        if (idToken !== undefined) {
            // If we have a non-keyword identifier, or if we have an accessor, then it's safe to parse.
            if (!isKeyword(idToken) || idToken === TokenType.SetKeyword || idToken === TokenType.GetKeyword) {
                return true;
            }

            // If it *is* a keyword, but not an accessor, check a little farther along
            // to see if it should actually be parsed as a class member.
            switch (token) {
                case TokenType.OpenParenToken:     // Method declaration
                case TokenType.LessThanToken:      // Generic Method declaration
                case TokenType.ColonToken:         // Type Annotation for declaration
                case TokenType.EqualsToken:        // Initializer for declaration
                case TokenType.QuestionToken:      // Not valid, but permitted so that it gets caught later on.
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
    }

    private parseDecorators(): NodeArray<Decorator> {
        let decorators: NodeArray<Decorator>;
        while (true) {
            const decoratorStart = getNodePos();
            if (!parseOptional(TokenType.AtToken)) {
                break;
            }

            if (!decorators) {
                decorators = <NodeArray<Decorator>>[];
                decorators.pos = decoratorStart;
            }

            const decorator = <Decorator>createNode(TokenType.Decorator, decoratorStart);
            decorator.expression = doInDecoratorContext(parseLeftHandSideExpressionOrHigher);
            decorators.push(finishNode(decorator));
        }
        if (decorators) {
            decorators.end = getNodeEnd();
        }
        return decorators;
    }

    /*
     * There are situations in which a modifier like 'const' will appear unexpectedly, such as on a class member.
     * In those situations, if we are entirely sure that 'const' is not valid on its own (such as when ASI takes effect
     * and turns it into a standalone declaration), then it is better to parse it and report an error later.
     *
     * In such situations, 'permitInvalidConstAsModifier' should be set to true.
     */
    private parseModifiers(permitInvalidConstAsModifier?: boolean): ModifiersArray {
        let flags = 0;
        let modifiers: ModifiersArray;
        while (true) {
            const modifierStart = scanner.getStartPos();
            const modifierKind = token;

            if (token === TokenType.ConstKeyword && permitInvalidConstAsModifier) {
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
                modifiers = <ModifiersArray>[];
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
    }

    private parseModifiersForArrowFunction(): ModifiersArray {
        let flags = 0;
        let modifiers: ModifiersArray;
        if (token === TokenType.AsyncKeyword) {
            const modifierStart = scanner.getStartPos();
            const modifierKind = token;
            nextToken();
            modifiers = <ModifiersArray>[];
            modifiers.pos = modifierStart;
            flags |= modifierToFlag(modifierKind);
            modifiers.push(finishNode(createNode(modifierKind, modifierStart)));
            modifiers.flags = flags;
            modifiers.end = scanner.getStartPos();
        }

        return modifiers;
    }

    private parseClassElement(): ClassElement {
        if (token === TokenType.SemicolonToken) {
            const result = <SemicolonClassElement>createNode(TokenType.SemicolonClassElement);
            nextToken();
            return finishNode(result);
        }

        const fullStart = getNodePos();
        const decorators = parseDecorators();
        const modifiers = parseModifiers(/*permitInvalidConstAsModifier*/ true);

        const accessor = tryParseAccessorDeclaration(fullStart, decorators, modifiers);
        if (accessor) {
            return accessor;
        }

        if (token === TokenType.ConstructorKeyword) {
            return parseConstructorDeclaration(fullStart, decorators, modifiers);
        }

        if (isIndexSignature()) {
            return parseIndexSignatureDeclaration(fullStart, decorators, modifiers);
        }

        // It is very important that we check this *after* checking indexers because
        // the [ token can start an index signature or a computed property name
        if (tokenIsIdentifierOrKeyword(token) ||
            token === TokenType.StringLiteral ||
            token === TokenType.NumericLiteral ||
            token === TokenType.AsteriskToken ||
            token === TokenType.OpenBracketToken) {

            return parsePropertyOrMethodDeclaration(fullStart, decorators, modifiers);
        }

        if (decorators || modifiers) {
            // treat this as a property declaration with a missing name.
            const name = <Identifier>createMissingNode(TokenType.Identifier, /*reportAtCurrentPosition*/ true, Diagnostics.Declaration_expected);
            return parsePropertyDeclaration(fullStart, decorators, modifiers, name, /*questionToken*/ undefined);
        }

        // 'isClassMemberStart' should have hinted not to attempt parsing.
        Debug.fail("Should not have attempted to parse class member declaration.");
    }

    private parseClassExpression(): ClassExpression {
        return <ClassExpression>parseClassDeclarationOrExpression(
                /*fullStart*/ scanner.getStartPos(),
                /*decorators*/ undefined,
                /*modifiers*/ undefined,
            TokenType.ClassExpression);
    }

    private parseClassDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): ClassDeclaration {
        return <ClassDeclaration>parseClassDeclarationOrExpression(fullStart, decorators, modifiers, TokenType.ClassDeclaration);
    }

    private parseClassDeclarationOrExpression(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray, kind: TokenType): ClassLikeDeclaration {
        const node = <ClassLikeDeclaration>createNode(kind, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        this.parseExpected(TokenType.ClassKeyword);
        node.name = parseNameOfClassDeclarationOrExpression();
        node.typeParameters = parseTypeParameters();
        node.heritageClauses = parseHeritageClauses(/*isClassHeritageClause*/ true);

        if (this.parseExpected(TokenType.OpenBraceToken)) {
            // ClassTail[Yield,Await] : (Modified) See 14.5
            //      ClassHeritage[?Yield,?Await]opt { ClassBody[?Yield,?Await]opt }
            node.members = parseClassMembers();
            this.parseExpected(TokenType.CloseBraceToken);
        }
        else {
            node.members = createMissingList<ClassElement>();
        }

        return finishNode(node);
    }

    private parseNameOfClassDeclarationOrExpression(): Identifier {
        // implements is a future reserved word so
        // 'class implements' might mean either
        // - class expression with omitted name, 'implements' starts heritage clause
        // - class with name 'implements'
        // 'isImplementsClause' helps to disambiguate between these two cases
        return isIdentifier() && !isImplementsClause()
            ? parseIdentifier()
            : undefined;
    }

    private isImplementsClause() {
        return token === TokenType.ImplementsKeyword && lookAhead(nextTokenIsIdentifierOrKeyword);
    }

    private parseHeritageClauses(isClassHeritageClause: boolean): NodeArray<HeritageClause> {
        // ClassTail[Yield,Await] : (Modified) See 14.5
        //      ClassHeritage[?Yield,?Await]opt { ClassBody[?Yield,?Await]opt }

        if (isHeritageClause()) {
            return parseList(ParsingContext.HeritageClauses, parseHeritageClause);
        }

        return undefined;
    }

    private parseHeritageClause() {
        if (token === TokenType.ExtendsKeyword || token === TokenType.ImplementsKeyword) {
            const node = <HeritageClause>createNode(TokenType.HeritageClause);
            node.token = token;
            nextToken();
            node.types = parseDelimitedList(ParsingContext.HeritageClauseElement, parseExpressionWithTypeArguments);
            return finishNode(node);
        }

        return undefined;
    }

    private parseExpressionWithTypeArguments(): ExpressionWithTypeArguments {
        const node = <ExpressionWithTypeArguments>createNode(TokenType.ExpressionWithTypeArguments);
        node.expression = parseLeftHandSideExpressionOrHigher();
        if (token === TokenType.LessThanToken) {
            node.typeArguments = parseBracketedList(ParsingContext.TypeArguments, parseType, TokenType.LessThanToken, TokenType.GreaterThanToken);
        }

        return finishNode(node);
    }

    private isHeritageClause(): boolean {
        return token === TokenType.ExtendsKeyword || token === TokenType.ImplementsKeyword;
    }

    private parseClassMembers() {
        return parseList(ParsingContext.ClassMembers, parseClassElement);
    }

    private parseInterfaceDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): InterfaceDeclaration {
        const node = <InterfaceDeclaration>createNode(TokenType.InterfaceDeclaration, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        this.parseExpected(TokenType.InterfaceKeyword);
        node.name = parseIdentifier();
        node.typeParameters = parseTypeParameters();
        node.heritageClauses = parseHeritageClauses(/*isClassHeritageClause*/ false);
        node.members = parseObjectTypeMembers();
        return finishNode(node);
    }

    private parseTypeAliasDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): TypeAliasDeclaration {
        const node = <TypeAliasDeclaration>createNode(TokenType.TypeAliasDeclaration, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        this.parseExpected(TokenType.TypeKeyword);
        node.name = parseIdentifier();
        node.typeParameters = parseTypeParameters();
        this.parseExpected(TokenType.EqualsToken);
        node.type = parseType();
        parseSemicolon();
        return finishNode(node);
    }

    // In an ambient declaration, the grammar only allows integer literals as initializers.
    // In a non-ambient declaration, the grammar allows uninitialized members only in a
    // ConstantEnumMemberSection, which starts at the beginning of an enum declaration
    // or any time an integer literal initializer is encountered.
    private parseEnumMember(): EnumMember {
        const node = <EnumMember>createNode(TokenType.EnumMember, scanner.getStartPos());
        node.name = parsePropertyName();
        node.initializer = allowInAnd(parseNonParameterInitializer);
        return finishNode(node);
    }

    private parseEnumDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): EnumDeclaration {
        const node = <EnumDeclaration>createNode(TokenType.EnumDeclaration, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        this.parseExpected(TokenType.EnumKeyword);
        node.name = parseIdentifier();
        if (this.parseExpected(TokenType.OpenBraceToken)) {
            node.members = parseDelimitedList(ParsingContext.EnumMembers, parseEnumMember);
            this.parseExpected(TokenType.CloseBraceToken);
        }
        else {
            node.members = createMissingList<EnumMember>();
        }
        return finishNode(node);
    }

    private parseModuleBlock(): ModuleBlock {
        const node = <ModuleBlock>createNode(TokenType.ModuleBlock, scanner.getStartPos());
        if (this.parseExpected(TokenType.OpenBraceToken)) {
            node.statements = parseList(ParsingContext.BlockStatements, parseStatement);
            this.parseExpected(TokenType.CloseBraceToken);
        }
        else {
            node.statements = createMissingList<Statement>();
        }
        return finishNode(node);
    }

    private parseModuleOrNamespaceDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray, flags: NodeFlags): ModuleDeclaration {
        const node = <ModuleDeclaration>createNode(TokenType.ModuleDeclaration, fullStart);
        // If we are parsing a dotted namespace name, we want to
        // propagate the 'Namespace' flag across the names if set.
        const namespaceFlag = flags & NodeFlags.Namespace;
        node.decorators = decorators;
        setModifiers(node, modifiers);
        node.flags |= flags;
        node.name = parseIdentifier();
        node.body = parseOptional(TokenType.DotToken)
            ? parseModuleOrNamespaceDeclaration(getNodePos(), /*decorators*/ undefined, /*modifiers*/ undefined, NodeFlags.Export | namespaceFlag)
            : parseModuleBlock();
        return finishNode(node);
    }

    private parseAmbientExternalModuleDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): ModuleDeclaration {
        const node = <ModuleDeclaration>createNode(TokenType.ModuleDeclaration, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        if (token === TokenType.GlobalKeyword) {
            // parse 'global' as name of global scope augmentation
            node.name = parseIdentifier();
            node.flags |= NodeFlags.GlobalAugmentation;
        }
        else {
            node.name = parseLiteralNode(/*internName*/ true);
        }

        if (token === TokenType.OpenBraceToken) {
            node.body = parseModuleBlock();
        }
        else {
            parseSemicolon();
        }

        return finishNode(node);
    }

    private parseModuleDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): ModuleDeclaration {
        let flags = modifiers ? modifiers.flags : 0;
        if (token === TokenType.GlobalKeyword) {
            // global augmentation
            return parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
        }
        else if (parseOptional(TokenType.NamespaceKeyword)) {
            flags |= NodeFlags.Namespace;
        }
        else {
            this.parseExpected(TokenType.ModuleKeyword);
            if (token === TokenType.StringLiteral) {
                return parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
            }
        }
        return parseModuleOrNamespaceDeclaration(fullStart, decorators, modifiers, flags);
    }

    private isExternalModuleReference() {
        return token === TokenType.RequireKeyword &&
            lookAhead(nextTokenIsOpenParen);
    }

    private nextTokenIsOpenParen() {
        return nextToken() === TokenType.OpenParenToken;
    }

    private nextTokenIsSlash() {
        return nextToken() === TokenType.SlashToken;
    }

    private parseNamespaceExportDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): NamespaceExportDeclaration {
        const exportDeclaration = <NamespaceExportDeclaration>createNode(TokenType.NamespaceExportDeclaration, fullStart);
        exportDeclaration.decorators = decorators;
        exportDeclaration.modifiers = modifiers;
        this.parseExpected(TokenType.AsKeyword);
        this.parseExpected(TokenType.NamespaceKeyword);

        exportDeclaration.name = parseIdentifier();

        this.parseExpected(TokenType.SemicolonToken);

        return finishNode(exportDeclaration);
    }

    private parseImportDeclarationOrImportEqualsDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): ImportEqualsDeclaration | ImportDeclaration {
        this.parseExpected(TokenType.ImportKeyword);
        const afterImportPos = scanner.getStartPos();

        let identifier: Identifier;
        if (isIdentifier()) {
            identifier = parseIdentifier();
            if (token !== TokenType.CommaToken && token !== TokenType.FromKeyword) {
                // ImportEquals declaration of type:
                // import x = require("mod"); or
                // import x = M.x;
                const importEqualsDeclaration = <ImportEqualsDeclaration>createNode(TokenType.ImportEqualsDeclaration, fullStart);
                importEqualsDeclaration.decorators = decorators;
                setModifiers(importEqualsDeclaration, modifiers);
                importEqualsDeclaration.name = identifier;
                this.parseExpected(TokenType.EqualsToken);
                importEqualsDeclaration.moduleReference = parseModuleReference();
                parseSemicolon();
                return finishNode(importEqualsDeclaration);
            }
        }

        // Import statement
        const importDeclaration = <ImportDeclaration>createNode(TokenType.ImportDeclaration, fullStart);
        importDeclaration.decorators = decorators;
        setModifiers(importDeclaration, modifiers);

        // ImportDeclaration:
        //  import ImportClause from ModuleSpecifier ;
        //  import ModuleSpecifier;
        if (identifier || // import id
            token === TokenType.AsteriskToken || // import *
            token === TokenType.OpenBraceToken) { // import {
            importDeclaration.importClause = parseImportClause(identifier, afterImportPos);
            this.parseExpected(TokenType.FromKeyword);
        }

        importDeclaration.moduleSpecifier = parseModuleSpecifier();
        parseSemicolon();
        return finishNode(importDeclaration);
    }

    private parseImportClause(identifier: Identifier, fullStart: number) {
        // ImportClause:
        //  ImportedDefaultBinding
        //  NameSpaceImport
        //  NamedImports
        //  ImportedDefaultBinding, NameSpaceImport
        //  ImportedDefaultBinding, NamedImports

        const importClause = <ImportClause>createNode(TokenType.ImportClause, fullStart);
        if (identifier) {
            // ImportedDefaultBinding:
            //  ImportedBinding
            importClause.name = identifier;
        }

        // If there was no default import or if there is comma token after default import
        // parse namespace or named imports
        if (!importClause.name ||
            parseOptional(TokenType.CommaToken)) {
            importClause.namedBindings = token === TokenType.AsteriskToken ? parseNamespaceImport() : parseNamedImportsOrExports(TokenType.NamedImports);
        }

        return finishNode(importClause);
    }

    private parseModuleReference() {
        return isExternalModuleReference()
            ? parseExternalModuleReference()
            : parseEntityName(/*allowReservedWords*/ false);
    }

    private parseExternalModuleReference() {
        const node = <ExternalModuleReference>createNode(TokenType.ExternalModuleReference);
        this.parseExpected(TokenType.RequireKeyword);
        this.parseExpected(TokenType.OpenParenToken);
        node.expression = parseModuleSpecifier();
        this.parseExpected(TokenType.CloseParenToken);
        return finishNode(node);
    }

    private parseModuleSpecifier(): Expression {
        if (token === TokenType.StringLiteral) {
            const result = parseLiteralNode();
            internIdentifier((<LiteralExpression>result).text);
            return result;
        }
        else {
            // We allow arbitrary expressions here, even though the grammar only allows string
            // literals.  We check to ensure that it is only a string literal later in the grammar
            // check pass.
            return parseExpression();
        }
    }

    private parseNamespaceImport(): NamespaceImport {
        // NameSpaceImport:
        //  * as ImportedBinding
        const namespaceImport = <NamespaceImport>createNode(TokenType.NamespaceImport);
        this.parseExpected(TokenType.AsteriskToken);
        this.parseExpected(TokenType.AsKeyword);
        namespaceImport.name = parseIdentifier();
        return finishNode(namespaceImport);
    }

    private parseNamedImportsOrExports(kind: TokenType): NamedImportsOrExports {
        const node = <NamedImports>createNode(kind);

        // NamedImports:
        //  { }
        //  { ImportsList }
        //  { ImportsList, }

        // ImportsList:
        //  ImportSpecifier
        //  ImportsList, ImportSpecifier
        node.elements = parseBracketedList(ParsingContext.ImportOrExportSpecifiers,
            kind === TokenType.NamedImports ? parseImportSpecifier : parseExportSpecifier,
            TokenType.OpenBraceToken, TokenType.CloseBraceToken);
        return finishNode(node);
    }

    private parseExportSpecifier() {
        return parseImportOrExportSpecifier(TokenType.ExportSpecifier);
    }

    private parseImportSpecifier() {
        return parseImportOrExportSpecifier(TokenType.ImportSpecifier);
    }

    private parseImportOrExportSpecifier(kind: TokenType): ImportOrExportSpecifier {
        const node = <ImportSpecifier>createNode(kind);
        // ImportSpecifier:
        //   BindingIdentifier
        //   IdentifierName as BindingIdentifier
        // ExportSpecifier:
        //   IdentifierName
        //   IdentifierName as IdentifierName
        let checkIdentifierIsKeyword = isKeyword(token) && !isIdentifier();
        let checkIdentifierStart = scanner.getTokenPos();
        let checkIdentifierEnd = scanner.getTextPos();
        const identifierName = parseIdentifierName();
        if (token === TokenType.AsKeyword) {
            node.propertyName = identifierName;
            this.parseExpected(TokenType.AsKeyword);
            checkIdentifierIsKeyword = isKeyword(token) && !isIdentifier();
            checkIdentifierStart = scanner.getTokenPos();
            checkIdentifierEnd = scanner.getTextPos();
            node.name = parseIdentifierName();
        }
        else {
            node.name = identifierName;
        }
        if (kind === TokenType.ImportSpecifier && checkIdentifierIsKeyword) {
            // Report error identifier expected
            parseErrorAtPosition(checkIdentifierStart, checkIdentifierEnd - checkIdentifierStart, Diagnostics.Identifier_expected);
        }
        return finishNode(node);
    }

    private parseExportDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): ExportDeclaration {
        const node = <ExportDeclaration>createNode(TokenType.ExportDeclaration, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        if (parseOptional(TokenType.AsteriskToken)) {
            this.parseExpected(TokenType.FromKeyword);
            node.moduleSpecifier = parseModuleSpecifier();
        }
        else {
            node.exportClause = parseNamedImportsOrExports(TokenType.NamedExports);

            // It is not uncommon to accidentally omit the 'from' keyword. Additionally, in editing scenarios,
            // the 'from' keyword can be parsed as a named export when the export clause is unterminated (i.e. `export { from "moduleName";`)
            // If we don't have a 'from' keyword, see if we have a string literal such that ASI won't take effect.
            if (token === TokenType.FromKeyword || (token === TokenType.StringLiteral && !scanner.hasPrecedingLineBreak())) {
                this.parseExpected(TokenType.FromKeyword);
                node.moduleSpecifier = parseModuleSpecifier();
            }
        }
        parseSemicolon();
        return finishNode(node);
    }

    private parseExportAssignment(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): ExportAssignment {
        const node = <ExportAssignment>createNode(TokenType.ExportAssignment, fullStart);
        node.decorators = decorators;
        setModifiers(node, modifiers);
        if (parseOptional(TokenType.EqualsToken)) {
            node.isExportEquals = true;
        }
        else {
            this.parseExpected(TokenType.DefaultKeyword);
        }
        node.expression = parseAssignmentExpressionOrHigher();
        parseSemicolon();
        return finishNode(node);
    }

    private processReferenceComments(sourceFile: SourceFile): void {
        const triviaScanner = createScanner(sourceFile.languageVersion, /*skipTrivia*/false, LanguageVariant.Standard, sourceText);
        const referencedFiles: FileReference[] = [];
        const typeReferenceDirectives: FileReference[] = [];
        const amdDependencies: { path: string; name: string }[] = [];
        let amdModuleName: string;

        // Keep scanning all the leading trivia in the file until we get to something that
        // isn't trivia.  Any single line comment will be analyzed to see if it is a
        // reference comment.
        while (true) {
            const kind = triviaScanner.scan();
            if (kind !== TokenType.SingleLineCommentTrivia) {
                if (isTrivia(kind)) {
                    continue;
                }
                else {
                    break;
                }
            }

            const range = { pos: triviaScanner.getTokenPos(), end: triviaScanner.getTextPos(), kind: triviaScanner.getToken() };

            const comment = sourceText.substring(range.pos, range.end);
            const referencePathMatchResult = getFileReferenceFromReferencePath(comment, range);
            if (referencePathMatchResult) {
                const fileReference = referencePathMatchResult.fileReference;
                sourceFile.hasNoDefaultLib = referencePathMatchResult.isNoDefaultLib;
                const diagnosticMessage = referencePathMatchResult.diagnosticMessage;
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
                const amdModuleNameRegEx = /^\/\/\/\s*<amd-module\s+name\s*=\s*('|")(.+?)\1/gim;
                const amdModuleNameMatchResult = amdModuleNameRegEx.exec(comment);
                if (amdModuleNameMatchResult) {
                    if (amdModuleName) {
                        parseDiagnostics.push(createFileDiagnostic(sourceFile, range.pos, range.end - range.pos, Diagnostics.An_AMD_module_cannot_have_multiple_name_assignments));
                    }
                    amdModuleName = amdModuleNameMatchResult[2];
                }

                const amdDependencyRegEx = /^\/\/\/\s*<amd-dependency\s/gim;
                const pathRegex = /\spath\s*=\s*('|")(.+?)\1/gim;
                const nameRegex = /\sname\s*=\s*('|")(.+?)\1/gim;
                const amdDependencyMatchResult = amdDependencyRegEx.exec(comment);
                if (amdDependencyMatchResult) {
                    const pathMatchResult = pathRegex.exec(comment);
                    const nameMatchResult = nameRegex.exec(comment);
                    if (pathMatchResult) {
                        const amdDependency = { path: pathMatchResult[2], name: nameMatchResult ? nameMatchResult[2] : undefined };
                        amdDependencies.push(amdDependency);
                    }
                }
            }
        }

        sourceFile.referencedFiles = referencedFiles;
        sourceFile.typeReferenceDirectives = typeReferenceDirectives;
        sourceFile.amdDependencies = amdDependencies;
        sourceFile.moduleName = amdModuleName;
    }

    private setExternalModuleIndicator(sourceFile: SourceFile) {
        sourceFile.externalModuleIndicator = forEach(sourceFile.statements, node =>
            node.flags & NodeFlags.Export
                || node.kind === TokenType.ImportEqualsDeclaration && (<ImportEqualsDeclaration>node).moduleReference.kind === TokenType.ExternalModuleReference
                || node.kind === TokenType.ImportDeclaration
                || node.kind === TokenType.ExportAssignment
                || node.kind === TokenType.ExportDeclaration
                ? node
                : undefined);
    }

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

    private parseJSDocComment(parent: Node, start: number, length: number): JSDocComment {
        const saveToken = token;
        const saveParseDiagnosticsLength = parseDiagnostics.length;
        const saveParseErrorBeforeNextFinishedNode = parseErrorBeforeNextFinishedNode;

        const comment = parseJSDocCommentWorker(start, length);
        if (comment) {
            comment.parent = parent;
        }

        token = saveToken;
        parseDiagnostics.length = saveParseDiagnosticsLength;
        parseErrorBeforeNextFinishedNode = saveParseErrorBeforeNextFinishedNode;

        return comment;
    }

    private parseJSDocCommentWorker(start: number, length: number): JSDocComment {
        const content = sourceText;
        start = start || 0;
        const end = length === undefined ? content.length : start + length;
        length = end - start;

        Debug.assert(start >= 0);
        Debug.assert(start <= end);
        Debug.assert(end <= content.length);

        let tags: NodeArray<JSDocTag>;
        let result: JSDocComment;

        // Check for /** (JSDoc opening part)
        if (content.charCodeAt(start) === CharacterCodes.slash &&
            content.charCodeAt(start + 1) === CharacterCodes.asterisk &&
            content.charCodeAt(start + 2) === CharacterCodes.asterisk &&
            content.charCodeAt(start + 3) !== CharacterCodes.asterisk) {


            // + 3 for leading /**, - 5 in total for /** */
            scanner.scanRange(start + 3, length - 5, () => {
                // Initially we can parse out a tag.  We also have seen a starting asterisk.
                // This is so that /** * @type */ doesn't parse.
                let canParseTag = true;
                let seenAsterisk = true;

                nextJSDocToken();
                while (token !== TokenType.EndOfFileToken) {
                    switch (token) {
                        case TokenType.AtToken:
                            if (canParseTag) {
                                parseTag();
                            }
                            // This will take us to the end of the line, so it's OK to parse a tag on the next pass through the loop
                            seenAsterisk = false;
                            break;

                        case TokenType.NewLineTrivia:
                            // After a line break, we can parse a tag, and we haven't seen an asterisk on the next line yet
                            canParseTag = true;
                            seenAsterisk = false;
                            break;

                        case TokenType.AsteriskToken:
                            if (seenAsterisk) {
                                // If we've already seen an asterisk, then we can no longer parse a tag on this line
                                canParseTag = false;
                            }
                            // Ignore the first asterisk on a line
                            seenAsterisk = true;
                            break;

                        case TokenType.Identifier:
                            // Anything else is doc comment text.  We can't do anything with it.  Because it
                            // wasn't a tag, we can no longer parse a tag on this line until we hit the next
                            // line break.
                            canParseTag = false;
                            break;

                        case TokenType.EndOfFileToken:
                            break;
                    }

                    nextJSDocToken();
                }

                result = createJSDocComment();

            });
        }

        return result;

        function createJSDocComment(): JSDocComment {
            if (!tags) {
                return undefined;
            }

            const result = <JSDocComment>createNode(TokenType.JSDocComment, start);
            result.tags = tags;
            return finishNode(result, end);
        }

        function skipWhitespace(): void {
            while (token === TokenType.WhitespaceTrivia || token === TokenType.NewLineTrivia) {
                nextJSDocToken();
            }
        }

        function parseTag(): void {
            Debug.assert(token === TokenType.AtToken);
            const atToken = createNode(TokenType.AtToken, scanner.getTokenPos());
            atToken.end = scanner.getTextPos();
            nextJSDocToken();

            const tagName = parseJSDocIdentifierName();
            if (!tagName) {
                return;
            }

            const tag = handleTag(atToken, tagName) || handleUnknownTag(atToken, tagName);
            addTag(tag);
        }

        function handleTag(atToken: Node, tagName: Identifier): JSDocTag {
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

        function handleUnknownTag(atToken: Node, tagName: Identifier) {
            const result = <JSDocTag>createNode(TokenType.JSDocTag, atToken.pos);
            result.atToken = atToken;
            result.tagName = tagName;
            return finishNode(result);
        }

        function addTag(tag: JSDocTag): void {
            if (tag) {
                if (!tags) {
                    tags = <NodeArray<JSDocTag>>[];
                    tags.pos = tag.pos;
                }

                tags.push(tag);
                tags.end = tag.end;
            }
        }

        function tryParseTypeExpression(): JSDocTypeExpression {
            if (token !== TokenType.OpenBraceToken) {
                return undefined;
            }

            const typeExpression = parseJSDocTypeExpression();
            return typeExpression;
        }

        function handleParamTag(atToken: Node, tagName: Identifier) {
            let typeExpression = tryParseTypeExpression();

            skipWhitespace();
            let name: Identifier;
            let isBracketed: boolean;
            // Looking for something like '[foo]' or 'foo'
            if (parseOptionalToken(TokenType.OpenBracketToken)) {
                name = parseJSDocIdentifierName();
                isBracketed = true;

                // May have an optional default, e.g. '[foo = 42]'
                if (parseOptionalToken(TokenType.EqualsToken)) {
                    parseExpression();
                }

                this.parseExpected(TokenType.CloseBracketToken);
            }
            else if (tokenIsIdentifierOrKeyword(token)) {
                name = parseJSDocIdentifierName();
            }

            if (!name) {
                parseErrorAtPosition(scanner.getStartPos(), 0, Diagnostics.Identifier_expected);
                return undefined;
            }

            let preName: Identifier, postName: Identifier;
            if (typeExpression) {
                postName = name;
            }
            else {
                preName = name;
            }

            if (!typeExpression) {
                typeExpression = tryParseTypeExpression();
            }

            const result = <JSDocParameterTag>createNode(TokenType.JSDocParameterTag, atToken.pos);
            result.atToken = atToken;
            result.tagName = tagName;
            result.preParameterName = preName;
            result.typeExpression = typeExpression;
            result.postParameterName = postName;
            result.isBracketed = isBracketed;
            return finishNode(result);
        }

        function handleReturnTag(atToken: Node, tagName: Identifier): JSDocReturnTag {
            if (forEach(tags, t => t.kind === TokenType.JSDocReturnTag)) {
                parseErrorAtPosition(tagName.pos, scanner.getTokenPos() - tagName.pos, Diagnostics._0_tag_already_specified, tagName.text);
            }

            const result = <JSDocReturnTag>createNode(TokenType.JSDocReturnTag, atToken.pos);
            result.atToken = atToken;
            result.tagName = tagName;
            result.typeExpression = tryParseTypeExpression();
            return finishNode(result);
        }

        function handleTypeTag(atToken: Node, tagName: Identifier): JSDocTypeTag {
            if (forEach(tags, t => t.kind === TokenType.JSDocTypeTag)) {
                parseErrorAtPosition(tagName.pos, scanner.getTokenPos() - tagName.pos, Diagnostics._0_tag_already_specified, tagName.text);
            }

            const result = <JSDocTypeTag>createNode(TokenType.JSDocTypeTag, atToken.pos);
            result.atToken = atToken;
            result.tagName = tagName;
            result.typeExpression = tryParseTypeExpression();
            return finishNode(result);
        }

        function handlePropertyTag(atToken: Node, tagName: Identifier): JSDocPropertyTag {
            const typeExpression = tryParseTypeExpression();
            skipWhitespace();
            const name = parseJSDocIdentifierName();
            if (!name) {
                parseErrorAtPosition(scanner.getStartPos(), /*length*/ 0, Diagnostics.Identifier_expected);
                return undefined;
            }

            const result = <JSDocPropertyTag>createNode(TokenType.JSDocPropertyTag, atToken.pos);
            result.atToken = atToken;
            result.tagName = tagName;
            result.name = name;
            result.typeExpression = typeExpression;
            return finishNode(result);
        }

        function handleTypedefTag(atToken: Node, tagName: Identifier): JSDocTypedefTag {
            const typeExpression = tryParseTypeExpression();
            skipWhitespace();

            const typedefTag = <JSDocTypedefTag>createNode(TokenType.JSDocTypedefTag, atToken.pos);
            typedefTag.atToken = atToken;
            typedefTag.tagName = tagName;
            typedefTag.name = parseJSDocIdentifierName();
            typedefTag.typeExpression = typeExpression;

            if (typeExpression) {
                if (typeExpression.type.kind === TokenType.JSDocTypeReference) {
                    const jsDocTypeReference = <JSDocTypeReference>typeExpression.type;
                    if (jsDocTypeReference.name.kind === TokenType.Identifier) {
                        const name = <Identifier>jsDocTypeReference.name;
                        if (name.text === "Object") {
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

            function scanChildTags(): JSDocTypeLiteral {
                const jsDocTypeLiteral = <JSDocTypeLiteral>createNode(TokenType.JSDocTypeLiteral, scanner.getStartPos());
                let resumePos = scanner.getStartPos();
                let canParseTag = true;
                let seenAsterisk = false;
                let parentTagTerminated = false;

                while (token !== TokenType.EndOfFileToken && !parentTagTerminated) {
                    nextJSDocToken();
                    switch (token) {
                        case TokenType.AtToken:
                            if (canParseTag) {
                                parentTagTerminated = !tryParseChildTag(jsDocTypeLiteral);
                            }
                            seenAsterisk = false;
                            break;
                        case TokenType.NewLineTrivia:
                            resumePos = scanner.getStartPos() - 1;
                            canParseTag = true;
                            seenAsterisk = false;
                            break;
                        case TokenType.AsteriskToken:
                            if (seenAsterisk) {
                                canParseTag = false;
                            }
                            seenAsterisk = true;
                            break;
                        case TokenType.Identifier:
                            canParseTag = false;
                        case TokenType.EndOfFileToken:
                            break;
                    }
                }
                scanner.setTextPos(resumePos);
                return finishNode(jsDocTypeLiteral);
            }
        }

        function tryParseChildTag(parentTag: JSDocTypeLiteral): boolean {
            Debug.assert(token === TokenType.AtToken);
            const atToken = createNode(TokenType.AtToken, scanner.getStartPos());
            atToken.end = scanner.getTextPos();
            nextJSDocToken();

            const tagName = parseJSDocIdentifierName();
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
                        parentTag.jsDocPropertyTags = <NodeArray<JSDocPropertyTag>>[];
                    }
                    const propertyTag = handlePropertyTag(atToken, tagName);
                    parentTag.jsDocPropertyTags.push(propertyTag);
                    return true;
            }
            return false;
        }

        function handleTemplateTag(atToken: Node, tagName: Identifier): JSDocTemplateTag {
            if (forEach(tags, t => t.kind === TokenType.JSDocTemplateTag)) {
                parseErrorAtPosition(tagName.pos, scanner.getTokenPos() - tagName.pos, Diagnostics._0_tag_already_specified, tagName.text);
            }

            // Type parameter list looks like '@template T,U,V'
            const typeParameters = <NodeArray<TypeParameterDeclaration>>[];
            typeParameters.pos = scanner.getStartPos();

            while (true) {
                const name = parseJSDocIdentifierName();
                if (!name) {
                    parseErrorAtPosition(scanner.getStartPos(), 0, Diagnostics.Identifier_expected);
                    return undefined;
                }

                const typeParameter = <TypeParameterDeclaration>createNode(TokenType.TypeParameter, name.pos);
                typeParameter.name = name;
                finishNode(typeParameter);

                typeParameters.push(typeParameter);

                if (token === TokenType.CommaToken) {
                    nextJSDocToken();
                }
                else {
                    break;
                }
            }

            const result = <JSDocTemplateTag>createNode(TokenType.JSDocTemplateTag, atToken.pos);
            result.atToken = atToken;
            result.tagName = tagName;
            result.typeParameters = typeParameters;
            finishNode(result);
            typeParameters.end = result.end;
            return result;
        }

        function nextJSDocToken(): TokenType {
            return token = scanner.scanJSDocToken();
        }

        function parseJSDocIdentifierName(): Identifier {
            return createJSDocIdentifier(tokenIsIdentifierOrKeyword(token));
        }

        function createJSDocIdentifier(isIdentifier: boolean): Identifier {
            if (!isIdentifier) {
                parseErrorAtCurrentToken(Diagnostics.Identifier_expected);
                return undefined;
            }

            const pos = scanner.getTokenPos();
            const end = scanner.getTextPos();
            const result = <Identifier>createNode(TokenType.Identifier, pos);
            result.text = content.substring(pos, end);
            finishNode(result, end);

            nextJSDocToken();
            return result;
        }
    }

    // #endregion

}

namespace IncrementalParser {
    export private updateSourceFile(sourceFile: SourceFile, newText: string, textChangeRange: TextChangeRange, aggressiveChecks: boolean): SourceFile {
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
        const incrementalSourceFile = <IncrementalNode><Node>sourceFile;
        Debug.assert(!incrementalSourceFile.hasBeenIncrementallyParsed);
        incrementalSourceFile.hasBeenIncrementallyParsed = true;

        const oldText = sourceFile.text;
        const syntaxCursor = createSyntaxCursor(sourceFile);

        // Make the actual change larger so that we know to reparse anything whose lookahead
        // might have intersected the change.
        const changeRange = extendToAffectedRange(sourceFile, textChangeRange);
        checkChangeRange(sourceFile, newText, changeRange, aggressiveChecks);

        // Ensure that extending the affected range only moved the start of the change range
        // earlier in the file.
        Debug.assert(changeRange.span.start <= textChangeRange.span.start);
        Debug.assert(textSpanEnd(changeRange.span) === textSpanEnd(textChangeRange.span));
        Debug.assert(textSpanEnd(textChangeRangeNewSpan(changeRange)) === textSpanEnd(textChangeRangeNewSpan(textChangeRange)));

        // The is the amount the nodes after the edit range need to be adjusted.  It can be
        // positive (if the edit added characters), negative (if the edit deleted characters)
        // or zero (if this was a pure overwrite with nothing added/removed).
        const delta = textChangeRangeNewSpan(changeRange).length - changeRange.span.length;

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
        updateTokenPositionsAndMarkElements(incrementalSourceFile,
            changeRange.span.start, textSpanEnd(changeRange.span), textSpanEnd(textChangeRangeNewSpan(changeRange)), delta, oldText, newText, aggressiveChecks);

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
        const result = Parser.parseSourceFile(sourceFile.fileName, newText, sourceFile.languageVersion, syntaxCursor, /*setParentNodes*/ true, sourceFile.scriptKind);

        return result;
    }

    private moveElementEntirelyPastChangeRange(element: IncrementalElement, isArray: boolean, delta: number, oldText: string, newText: string, aggressiveChecks: boolean) {
        if (isArray) {
            visitArray(<IncrementalNodeArray>element);
        }
        else {
            visitNode(<IncrementalNode>element);
        }
        return;

        private visitNode(node: IncrementalNode) {
            let text = "";
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
                for (const jsDocComment of node.jsDocComments) {
                    forEachChild(jsDocComment, visitNode, visitArray);
                }
            }
            checkNodePositions(node, aggressiveChecks);
        }

        private visitArray(array: IncrementalNodeArray) {
            array._children = undefined;
            array.pos += delta;
            array.end += delta;

            for (const node of array) {
                visitNode(node);
            }
        }
    }

    private shouldCheckNode(node: Node) {
        switch (node.kind) {
            case TokenType.StringLiteral:
            case TokenType.NumericLiteral:
            case TokenType.Identifier:
                return true;
        }

        return false;
    }

    private adjustIntersectingElement(element: IncrementalElement, changeStart: number, changeRangeOldEnd: number, changeRangeNewEnd: number, delta: number) {
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

    private checkNodePositions(node: Node, aggressiveChecks: boolean) {
        if (aggressiveChecks) {
            let pos = node.pos;
            forEachChild(node, child => {
                Debug.assert(child.pos >= pos);
                pos = child.end;
            });
            Debug.assert(pos <= node.end);
        }
    }

    private updateTokenPositionsAndMarkElements(
        sourceFile: IncrementalNode,
        changeStart: number,
        changeRangeOldEnd: number,
        changeRangeNewEnd: number,
        delta: number,
        oldText: string,
        newText: string,
        aggressiveChecks: boolean): void {

            visitNode(sourceFile);
        return;

            private visitNode(child: IncrementalNode) {
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
                const fullEnd = child.end;
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
            }

        private visitArray(array: IncrementalNodeArray) {
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
                const fullEnd = array.end;
                if (fullEnd >= changeStart) {
                    array.intersectsChange = true;
                    array._children = undefined;

                    // Adjust the pos or end (or both) of the intersecting array accordingly.
                    adjustIntersectingElement(array, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta);
                    for (const node of array) {
                        visitNode(node);
                    }
                    return;
                }

                // Otherwise, the array is entirely before the change range.  No need to do anything with it.
                Debug.assert(fullEnd < changeStart);
            }
        }

    private extendToAffectedRange(sourceFile: SourceFile, changeRange: TextChangeRange): TextChangeRange {
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
        const maxLookahead = 1;

        let start = changeRange.span.start;

        // the first iteration aligns us with the change start. subsequent iteration move us to
        // the left by maxLookahead tokens.  We only need to do this as long as we're not at the
        // start of the tree.
        for (let i = 0; start > 0 && i <= maxLookahead; i++) {
            const nearestNode = findNearestNodeStartingBeforeOrAtPosition(sourceFile, start);
            Debug.assert(nearestNode.pos <= start);
            const position = nearestNode.pos;

            start = Math.max(0, position - 1);
        }

        const finalSpan = createTextSpanFromBounds(start, textSpanEnd(changeRange.span));
        const finalLength = changeRange.newLength + (changeRange.span.start - start);

        return createTextChangeRange(finalSpan, finalLength);
    }

    private findNearestNodeStartingBeforeOrAtPosition(sourceFile: SourceFile, position: number): Node {
        let bestResult: Node = sourceFile;
        let lastNodeEntirelyBeforePosition: Node;

        forEachChild(sourceFile, visit);

        if (lastNodeEntirelyBeforePosition) {
            const lastChildOfLastEntireNodeBeforePosition = getLastChild(lastNodeEntirelyBeforePosition);
            if (lastChildOfLastEntireNodeBeforePosition.pos > bestResult.pos) {
                bestResult = lastChildOfLastEntireNodeBeforePosition;
            }
        }

        return bestResult;

        private getLastChild(node: Node): Node {
            while (true) {
                const lastChild = getLastChildWorker(node);
                if (lastChild) {
                    node = lastChild;
                }
                else {
                    return node;
                }
            }
        }

        private getLastChildWorker(node: Node): Node {
            let last: Node = undefined;
            forEachChild(node, child => {
                if (nodeIsPresent(child)) {
                    last = child;
                }
            });
            return last;
        }

        private visit(child: Node) {
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

    private checkChangeRange(sourceFile: SourceFile, newText: string, textChangeRange: TextChangeRange, aggressiveChecks: boolean) {
        const oldText = sourceFile.text;
        if (textChangeRange) {
            Debug.assert((oldText.length - textChangeRange.span.length + textChangeRange.newLength) === newText.length);

            if (aggressiveChecks || Debug.shouldAssert(AssertionLevel.VeryAggressive)) {
                const oldTextPrefix = oldText.substr(0, textChangeRange.span.start);
                const newTextPrefix = newText.substr(0, textChangeRange.span.start);
                Debug.assert(oldTextPrefix === newTextPrefix);

                const oldTextSuffix = oldText.substring(textSpanEnd(textChangeRange.span), oldText.length);
                const newTextSuffix = newText.substring(textSpanEnd(textChangeRangeNewSpan(textChangeRange)), newText.length);
                Debug.assert(oldTextSuffix === newTextSuffix);
            }
        }
    }

    interface IncrementalElement extends TextRange {
        parent?: Node;
        intersectsChange: boolean;
        length?: number;
        _children: Node[];
    }

    export interface IncrementalNode extends Node, IncrementalElement {
        hasBeenIncrementallyParsed: boolean;
    }

    interface IncrementalNodeArray extends NodeArray<IncrementalNode>, IncrementalElement {
        length: number;
    }

    // Allows finding nodes in the source file at a certain position in an efficient manner.
    // The implementation takes advantage of the calling pattern it knows the parser will
    // make in order to optimize finding nodes as quickly as possible.
    export interface SyntaxCursor {
        currentNode(position: number): IncrementalNode;
    }

    private createSyntaxCursor(sourceFile: SourceFile): SyntaxCursor {
        let currentArray: NodeArray<Node> = sourceFile.statements;
        let currentArrayIndex = 0;

        Debug.assert(currentArrayIndex < currentArray.length);
        let current = currentArray[currentArrayIndex];
        let lastQueriedPosition = InvalidPosition.Value;

        return {
            currentNode(position: number) {
                // Only compute the current node if the position is different than the last time
                // we were asked.  The parser commonly asks for the node at the same position
                // twice.  Once to know if can read an appropriate list element at a certain point,
                // and then to actually read and consume the node.
                if (position !== lastQueriedPosition) {
                    // Much of the time the parser will need the very next node in the array that
                    // we just returned a node from.So just simply check for that case and move
                    // forward in the array instead of searching for the node again.
                    if (current && current.end === position && currentArrayIndex < (currentArray.length - 1)) {
                        currentArrayIndex++;
                        current = currentArray[currentArrayIndex];
                    }

                    // If we don't have a node, or the node we have isn't in the right position,
                    // then try to find a viable node at the position requested.
                    if (!current || current.pos !== position) {
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
                Debug.assert(!current || current.pos === position);
                return <IncrementalNode>current;
            }
        };

        // Finds the highest element in the tree we can find that starts at the provided position.
        // The element must be a direct child of some node list in the tree.  This way after we
        // return it, we can easily return its next sibling in the list.
        private findHighestListElementThatStartsAtPosition(position: number) {
            // Clear out any cached state about the last node we found.
            currentArray = undefined;
            currentArrayIndex = InvalidPosition.Value;
            current = undefined;

            // Recurse into the source file to find the highest node at this position.
            forEachChild(sourceFile, visitNode, visitArray);
            return;

            private visitNode(node: Node) {
                if (position >= node.pos && position < node.end) {
                    // Position was within this node.  Keep searching deeper to find the node.
                    forEachChild(node, visitNode, visitArray);

                    // don't proceed any further in the search.
                    return true;
                }

                // position wasn't in this node, have to keep searching.
                return false;
            }

            private visitArray(array: NodeArray<Node>) {
                if(position >= array.pos && position < array.end) {
                    // position was in this array.  Search through this array to see if we find a
                    // viable element.
                    for (let i = 0, n = array.length; i < n; i++) {
                        const child = array[i];
                        if (child) {
                            if (child.pos === position) {
                                // Found the right node.  We're done.
                                currentArray = array;
                                currentArrayIndex = i;
                                current = child;
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
                }

                // position wasn't in this array, have to keep searching.
                return false;
            }
        }
    }

    const enum InvalidPosition {
        Value = -1
    }

}

enum ParseFlags {

    allowIn,

    allowYield,

    allowAwait,




}