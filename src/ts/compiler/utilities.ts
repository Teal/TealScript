/// <reference path="sys.ts" />

/* @internal */
namespace ts {
    export interface ReferencePathMatchResult {
        fileReference?: FileReference;
        diagnosticMessage?: DiagnosticMessage;
        isNoDefaultLib?: boolean;
        isTypeReferenceDirective?: boolean;
    }

    export interface SynthesizedNode extends Node {
        leadingCommentRanges?: CommentRange[];
        trailingCommentRanges?: CommentRange[];
        startsOnNewLine: boolean;
    }

    export function getDeclarationOfKind(symbol: Symbol, kind: TokenType): Declaration {
        const declarations = symbol.declarations;
        if (declarations) {
            for (const declaration of declarations) {
                if (declaration.kind === kind) {
                    return declaration;
                }
            }
        }

        return undefined;
    }

    export interface StringSymbolWriter extends SymbolWriter {
        string(): string;
    }

    export interface EmitHost extends ScriptReferenceHost {
        getSourceFiles(): SourceFile[];

        /* @internal */
        isSourceFileFromExternalLibrary(file: SourceFile): boolean;

        getCommonSourceDirectory(): string;
        getCanonicalFileName(fileName: string): string;
        getNewLine(): string;

        isEmitBlocked(emitFileName: string): boolean;

        writeFile: WriteFileCallback;
    }

    // Pool writers to avoid needing to allocate them for every symbol we write.
    const stringWriters: StringSymbolWriter[] = [];
    export function getSingleLineStringWriter(): StringSymbolWriter {
        if (stringWriters.length === 0) {
            let str = "";

            const writeText: (text: string) => void = text => str += text;
            return {
                string: () => str,
                writeKeyword: writeText,
                writeOperator: writeText,
                writePunctuation: writeText,
                writeSpace: writeText,
                writeStringLiteral: writeText,
                writeParameter: writeText,
                writeSymbol: writeText,

                // Completely ignore indentation for string writers.  And map newlines to
                // a single space.
                writeLine: () => str += " ",
                increaseIndent: () => { },
                decreaseIndent: () => { },
                clear: () => str = "",
                trackSymbol: () => { },
                reportInaccessibleThisError: () => { }
            };
        }

        return stringWriters.pop();
    }

    export function releaseStringWriter(writer: StringSymbolWriter) {
        writer.clear();
        stringWriters.push(writer);
    }

    export function getFullWidth(node: Node) {
        return node.end - node.pos;
    }

    export function mapIsEqualTo<T>(map1: Map<T>, map2: Map<T>): boolean {
        if (!map1 || !map2) {
            return map1 === map2;
        }
        return containsAll(map1, map2) && containsAll(map2, map1);
    }

    function containsAll<T>(map: Map<T>, other: Map<T>): boolean {
        for (const key in map) {
            if (!hasProperty(map, key)) {
                continue;
            }
            if (!hasProperty(other, key) || map[key] !== other[key]) {
                return false;
            }
        }
        return true;
    }

    export function arrayIsEqualTo<T>(array1: T[], array2: T[], equaler?: (a: T, b: T) => boolean): boolean {
        if (!array1 || !array2) {
            return array1 === array2;
        }

        if (array1.length !== array2.length) {
            return false;
        }

        for (let i = 0; i < array1.length; i++) {
            const equals = equaler ? equaler(array1[i], array2[i]) : array1[i] === array2[i];
            if (!equals) {
                return false;
            }
        }

        return true;
    }

    export function hasResolvedModule(sourceFile: SourceFile, moduleNameText: string): boolean {
        return sourceFile.resolvedModules && hasProperty(sourceFile.resolvedModules, moduleNameText);
    }

    export function getResolvedModule(sourceFile: SourceFile, moduleNameText: string): ResolvedModule {
        return hasResolvedModule(sourceFile, moduleNameText) ? sourceFile.resolvedModules[moduleNameText] : undefined;
    }

    export function setResolvedModule(sourceFile: SourceFile, moduleNameText: string, resolvedModule: ResolvedModule): void {
        if (!sourceFile.resolvedModules) {
            sourceFile.resolvedModules = {};
        }

        sourceFile.resolvedModules[moduleNameText] = resolvedModule;
    }

    export function setResolvedTypeReferenceDirective(sourceFile: SourceFile, typeReferenceDirectiveName: string, resolvedTypeReferenceDirective: ResolvedTypeReferenceDirective): void {
        if (!sourceFile.resolvedTypeReferenceDirectiveNames) {
            sourceFile.resolvedTypeReferenceDirectiveNames = {};
        }

        sourceFile.resolvedTypeReferenceDirectiveNames[typeReferenceDirectiveName] = resolvedTypeReferenceDirective;
    }

    /* @internal */
    export function moduleResolutionIsEqualTo(oldResolution: ResolvedModule, newResolution: ResolvedModule): boolean {
        return oldResolution.resolvedFileName === newResolution.resolvedFileName && oldResolution.isExternalLibraryImport === newResolution.isExternalLibraryImport;
    }

    /* @internal */
    export function typeDirectiveIsEqualTo(oldResolution: ResolvedTypeReferenceDirective, newResolution: ResolvedTypeReferenceDirective): boolean {
        return oldResolution.resolvedFileName === newResolution.resolvedFileName && oldResolution.primary === newResolution.primary;
    }

    /* @internal */
    export function hasChangesInResolutions<T>(names: string[], newResolutions: T[], oldResolutions: Map<T>, comparer: (oldResolution: T, newResolution: T) => boolean): boolean {
        if (names.length !== newResolutions.length) {
            return false;
        }
        for (let i = 0; i < names.length; i++) {
            const newResolution = newResolutions[i];
            const oldResolution = oldResolutions && hasProperty(oldResolutions, names[i]) ? oldResolutions[names[i]] : undefined;
            const changed =
                oldResolution
                    ? !newResolution || !comparer(oldResolution, newResolution)
                    : newResolution;
            if (changed) {
                return true;
            }
        }
        return false;
    }

    // Returns true if this node contains a parse error anywhere underneath it.
    export function containsParseError(node: Node): boolean {
        aggregateChildData(node);
        return (node.flags & NodeFlags.ThisNodeOrAnySubNodesHasError) !== 0;
    }

    function aggregateChildData(node: Node): void {
        if (!(node.flags & NodeFlags.HasAggregatedChildData)) {
            // A node is considered to contain a parse error if:
            //  a) the parser explicitly marked that it had an error
            //  b) any of it's children reported that it had an error.
            const thisNodeOrAnySubNodesHasError = ((node.flags & NodeFlags.ThisNodeHasError) !== 0) ||
                forEachChild(node, containsParseError);

            // If so, mark ourselves accordingly.
            if (thisNodeOrAnySubNodesHasError) {
                node.flags |= NodeFlags.ThisNodeOrAnySubNodesHasError;
            }

            // Also mark that we've propagated the child information to this node.  This way we can
            // always consult the bit directly on this node without needing to check its children
            // again.
            node.flags |= NodeFlags.HasAggregatedChildData;
        }
    }

    export function getSourceFileOfNode(node: Node): SourceFile {
        while (node && node.kind !== TokenType.SourceFile) {
            node = node.parent;
        }
        return <SourceFile>node;
    }

    export function isStatementWithLocals(node: Node) {
        switch (node.kind) {
            case TokenType.Block:
            case TokenType.CaseBlock:
            case TokenType.ForStatement:
            case TokenType.ForInStatement:
            case TokenType.ForOfStatement:
                return true;
        }
        return false;
    }

    export function getStartPositionOfLine(line: number, sourceFile: SourceFile): number {
        Debug.assert(line >= 0);
        return getLineStarts(sourceFile)[line];
    }

    // This is a useful function for debugging purposes.
    export function nodePosToString(node: Node): string {
        const file = getSourceFileOfNode(node);
        const loc = getLineAndCharacterOfPosition(file, node.pos);
        return `${ file.fileName }(${ loc.line + 1 },${ loc.character + 1 })`;
    }

    export function getStartPosOfNode(node: Node): number {
        return node.pos;
    }

    export function getEndLinePosition(line: number, sourceFile: SourceFile): number {
        Debug.assert(line >= 0);
        const lineStarts = getLineStarts(sourceFile);

        const lineIndex = line;
        const sourceText = sourceFile.text;
        if (lineIndex + 1 === lineStarts.length) {
            // last line - return EOF
            return sourceText.length - 1;
        }
        else {
            // current line start
            const start = lineStarts[lineIndex];
            // take the start position of the next line - 1 = it should be some line break
            let pos = lineStarts[lineIndex + 1] - 1;
            Debug.assert(isLineBreak(sourceText.charCodeAt(pos)));
            // walk backwards skipping line breaks, stop the the beginning of current line.
            // i.e:
            // <some text>
            // $ <- end of line for this position should match the start position
            while (start <= pos && isLineBreak(sourceText.charCodeAt(pos))) {
                pos--;
            }
            return pos;
        }
    }

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
    export function nodeIsMissing(node: Node) {
        if (!node) {
            return true;
        }

        return node.pos === node.end && node.pos >= 0 && node.kind !== TokenType.endOfFile;
    }

    export function nodeIsPresent(node: Node) {
        return !nodeIsMissing(node);
    }

    export function getTokenPosOfNode(node: Node, sourceFile?: SourceFile, includeJsDocComment?: boolean): number {
        // With nodes that have no width (i.e. 'Missing' nodes), we actually *don't*
        // want to skip trivia because this will launch us forward to the next token.
        if (nodeIsMissing(node)) {
            return node.pos;
        }

        if (isJSDocNode(node)) {
            return skipTrivia((sourceFile || getSourceFileOfNode(node)).text, node.pos, /*stopAfterLineBreak*/ false, /*stopAtComments*/ true);
        }

        if (includeJsDocComment && node.jsDocComments && node.jsDocComments.length > 0) {
            return getTokenPosOfNode(node.jsDocComments[0]);
        }

        // For a syntax list, it is possible that one of its children has JSDocComment nodes, while
        // the syntax list itself considers them as normal trivia. Therefore if we simply skip
        // trivia for the list, we may have skipped the JSDocComment as well. So we should process its
        // first child to determine the actual position of its first token.
        if (node.kind === TokenType.SyntaxList && (<SyntaxList>node)._children.length > 0) {
            return getTokenPosOfNode((<SyntaxList>node)._children[0], sourceFile, includeJsDocComment);
        }

        return skipTrivia((sourceFile || getSourceFileOfNode(node)).text, node.pos);
    }

    export function isJSDocNode(node: Node) {
        return node.kind >= TokenType.FirstJSDocNode && node.kind <= TokenType.LastJSDocNode;
    }

    export function getNonDecoratorTokenPosOfNode(node: Node, sourceFile?: SourceFile): number {
        if (nodeIsMissing(node) || !node.decorators) {
            return getTokenPosOfNode(node, sourceFile);
        }

        return skipTrivia((sourceFile || getSourceFileOfNode(node)).text, node.decorators.end);
    }

    export function getSourceTextOfNodeFromSourceFile(sourceFile: SourceFile, node: Node, includeTrivia = false): string {
        if (nodeIsMissing(node)) {
            return "";
        }

        const text = sourceFile.text;
        return text.substring(includeTrivia ? node.pos : skipTrivia(text, node.pos), node.end);
    }

    export function getTextOfNodeFromSourceText(sourceText: string, node: Node): string {
        if (nodeIsMissing(node)) {
            return "";
        }

        return sourceText.substring(skipTrivia(sourceText, node.pos), node.end);
    }

    export function getTextOfNode(node: Node, includeTrivia = false): string {
        return getSourceTextOfNodeFromSourceFile(getSourceFileOfNode(node), node, includeTrivia);
    }

    // Add an extra underscore to identifiers that start with two underscores to avoid issues with magic names like '__proto__'
    export function escapeIdentifier(identifier: string): string {
        return identifier.length >= 2 && identifier.charCodeAt(0) === CharCode.underline && identifier.charCodeAt(1) === CharCode.underline ? "_" + identifier : identifier;
    }

    // Remove extra underscore from escaped identifier
    export function unescapeIdentifier(identifier: string): string {
        return identifier.length >= 3 && identifier.charCodeAt(0) === CharCode.underline && identifier.charCodeAt(1) === CharCode.underline && identifier.charCodeAt(2) === CharCode.underline ? identifier.substr(1) : identifier;
    }

    // Make an identifier from an external module name by extracting the string after the last "/" and replacing
    // all non-alphanumeric characters with underscores
    export function makeIdentifierFromModuleName(moduleName: string): string {
        return getBaseFileName(moduleName).replace(/^(\d)/, "_$1").replace(/\W/g, "_");
    }

    export function isBlockOrCatchScoped(declaration: Declaration) {
        return (getCombinedNodeFlags(declaration) & NodeFlags.BlockScoped) !== 0 ||
            isCatchClauseVariableDeclaration(declaration);
    }

    export function isAmbientModule(node: Node): boolean {
        return node && node.kind === TokenType.ModuleDeclaration &&
            ((<ModuleDeclaration>node).name.kind === TokenType.StringLiteral || isGlobalScopeAugmentation(<ModuleDeclaration>node));
    }

    export function isShorthandAmbientModule(node: Node): boolean {
        // The only kind of module that can be missing a body is a shorthand ambient module.
        return node.kind === TokenType.ModuleDeclaration && (!(<ModuleDeclaration>node).body);
    }

    export function isBlockScopedContainerTopLevel(node: Node): boolean {
        return node.kind === TokenType.SourceFile ||
            node.kind === TokenType.ModuleDeclaration ||
            isFunctionLike(node) ||
            isFunctionBlock(node);
    }

    export function isGlobalScopeAugmentation(module: ModuleDeclaration): boolean {
        return !!(module.flags & NodeFlags.GlobalAugmentation);
    }

    export function isExternalModuleAugmentation(node: Node): boolean {
        // external module augmentation is a ambient module declaration that is either:
        // - defined in the top level scope and source file is an external module
        // - defined inside ambient module declaration located in the top level scope and source file not an external module
        if (!node || !isAmbientModule(node)) {
            return false;
        }
        switch (node.parent.kind) {
            case TokenType.SourceFile:
                return isExternalModule(<SourceFile>node.parent);
            case TokenType.ModuleBlock:
                return isAmbientModule(node.parent.parent) && !isExternalModule(<SourceFile>node.parent.parent.parent);
        }
        return false;
    }

    // Gets the nearest enclosing block scope container that has the provided node
    // as a descendant, that is not the provided node.
    export function getEnclosingBlockScopeContainer(node: Node): Node {
        let current = node.parent;
        while (current) {
            if (isFunctionLike(current)) {
                return current;
            }
            switch (current.kind) {
                case TokenType.SourceFile:
                case TokenType.CaseBlock:
                case TokenType.CatchClause:
                case TokenType.ModuleDeclaration:
                case TokenType.ForStatement:
                case TokenType.ForInStatement:
                case TokenType.ForOfStatement:
                    return current;
                case TokenType.Block:
                    // function block is not considered block-scope container
                    // see comment in binder.ts: bind(...), case for SyntaxKind.Block
                    if (!isFunctionLike(current.parent)) {
                        return current;
                    }
            }

            current = current.parent;
        }
    }

    export function isCatchClauseVariableDeclaration(declaration: Declaration) {
        return declaration &&
            declaration.kind === TokenType.VariableDeclaration &&
            declaration.parent &&
            declaration.parent.kind === TokenType.CatchClause;
    }

    // Return display name of an identifier
    // Computed property names will just be emitted as "[<expr>]", where <expr> is the source
    // text of the expression in the computed property.
    export function declarationNameToString(name: DeclarationName) {
        return getFullWidth(name) === 0 ? "(Missing)" : getTextOfNode(name);
    }

    export function createDiagnosticForNode(node: Node, message: DiagnosticMessage, arg0?: any, arg1?: any, arg2?: any): Diagnostic {
        const sourceFile = getSourceFileOfNode(node);
        const span = getErrorSpanForNode(sourceFile, node);
        return createFileDiagnostic(sourceFile, span.start, span.length, message, arg0, arg1, arg2);
    }

    export function createDiagnosticForNodeFromMessageChain(node: Node, messageChain: DiagnosticMessageChain): Diagnostic {
        const sourceFile = getSourceFileOfNode(node);
        const span = getErrorSpanForNode(sourceFile, node);
        return {
            file: sourceFile,
            start: span.start,
            length: span.length,
            code: messageChain.code,
            category: messageChain.category,
            messageText: messageChain.next ? messageChain : messageChain.messageText
        };
    }

    export function getSpanOfTokenAtPosition(sourceFile: SourceFile, pos: number): TextSpan {
        const scanner = createScanner(sourceFile.languageVersion, /*skipTrivia*/ true, sourceFile.languageVariant, sourceFile.text, /*onError:*/ undefined, pos);
        scanner.scan();
        const start = scanner.getTokenPos();
        return createTextSpanFromBounds(start, scanner.getTextPos());
    }

    function getErrorSpanForArrowFunction(sourceFile: SourceFile, node: ArrowFunction): TextSpan {
        const pos = skipTrivia(sourceFile.text, node.pos);
        if (node.body && node.body.kind === TokenType.Block) {
            const { line: startLine } = getLineAndCharacterOfPosition(sourceFile, node.body.pos);
            const { line: endLine } = getLineAndCharacterOfPosition(sourceFile, node.body.end);
            if (startLine < endLine) {
                // The arrow function spans multiple lines,
                // make the error span be the first line, inclusive.
                return createTextSpan(pos, getEndLinePosition(startLine, sourceFile) - pos + 1);
            }
        }
        return createTextSpanFromBounds(pos, node.end);
    }

    export function getErrorSpanForNode(sourceFile: SourceFile, node: Node): TextSpan {
        let errorNode = node;
        switch (node.kind) {
            case TokenType.SourceFile:
                let pos = skipTrivia(sourceFile.text, 0, /*stopAfterLineBreak*/ false);
                if (pos === sourceFile.text.length) {
                    // file is empty - return span for the beginning of the file
                    return createTextSpan(0, 0);
                }
                return getSpanOfTokenAtPosition(sourceFile, pos);
            // This list is a work in progress. Add missing node kinds to improve their error
            // spans.
            case TokenType.VariableDeclaration:
            case TokenType.BindingElement:
            case TokenType.ClassDeclaration:
            case TokenType.ClassExpression:
            case TokenType.InterfaceDeclaration:
            case TokenType.ModuleDeclaration:
            case TokenType.EnumDeclaration:
            case TokenType.EnumMember:
            case TokenType.FunctionDeclaration:
            case TokenType.FunctionExpression:
            case TokenType.MethodDeclaration:
            case TokenType.GetAccessor:
            case TokenType.SetAccessor:
            case TokenType.TypeAliasDeclaration:
                errorNode = (<Declaration>node).name;
                break;
            case TokenType.ArrowFunction:
                return getErrorSpanForArrowFunction(sourceFile, <ArrowFunction>node);
        }

        if (errorNode === undefined) {
            // If we don't have a better node, then just set the error on the first token of
            // construct.
            return getSpanOfTokenAtPosition(sourceFile, node.pos);
        }

        const pos = nodeIsMissing(errorNode)
            ? errorNode.pos
            : skipTrivia(sourceFile.text, errorNode.pos);

        return createTextSpanFromBounds(pos, errorNode.end);
    }

    export function isExternalOrCommonJsModule(file: SourceFile): boolean {
        return (file.externalModuleIndicator || file.commonJsModuleIndicator) !== undefined;
    }

    export function isDeclarationFile(file: SourceFile): boolean {
        return file.isDeclarationFile;
    }

    export function isConstEnumDeclaration(node: Node): boolean {
        return node.kind === TokenType.EnumDeclaration && isConst(node);
    }

    function walkUpBindingElementsAndPatterns(node: Node): Node {
        while (node && (node.kind === TokenType.BindingElement || isBindingPattern(node))) {
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
    export function getCombinedNodeFlags(node: Node): NodeFlags {
        node = walkUpBindingElementsAndPatterns(node);

        let flags = node.flags;
        if (node.kind === TokenType.VariableDeclaration) {
            node = node.parent;
        }

        if (node && node.kind === TokenType.VariableDeclarationList) {
            flags |= node.flags;
            node = node.parent;
        }

        if (node && node.kind === TokenType.VariableStatement) {
            flags |= node.flags;
        }

        return flags;
    }

    export function isConst(node: Node): boolean {
        return !!(getCombinedNodeFlags(node) & NodeFlags.Const);
    }

    export function isLet(node: Node): boolean {
        return !!(getCombinedNodeFlags(node) & NodeFlags.Let);
    }

    export function isSuperCallExpression(n: Node): boolean {
        return n.kind === TokenType.CallExpression && (<CallExpression>n).expression.kind === TokenType.super;
    }

    export function isPrologueDirective(node: Node): boolean {
        return node.kind === TokenType.ExpressionStatement && (<ExpressionStatement>node).expression.kind === TokenType.StringLiteral;
    }

    export function getLeadingCommentRangesOfNode(node: Node, sourceFileOfNode: SourceFile) {
        return getLeadingCommentRanges(sourceFileOfNode.text, node.pos);
    }

    export function getLeadingCommentRangesOfNodeFromText(node: Node, text: string) {
        return getLeadingCommentRanges(text, node.pos);
    }

    export function getJsDocComments(node: Node, sourceFileOfNode: SourceFile) {
        return getJsDocCommentsFromText(node, sourceFileOfNode.text);
    }

    export function getJsDocCommentsFromText(node: Node, text: string) {
        const commentRanges = (node.kind === TokenType.Parameter ||
                               node.kind === TokenType.TypeParameter ||
                               node.kind === TokenType.FunctionExpression ||
                               node.kind === TokenType.ArrowFunction) ?
            concatenate(getTrailingCommentRanges(text, node.pos), getLeadingCommentRanges(text, node.pos)) :
            getLeadingCommentRangesOfNodeFromText(node, text);
        return filter(commentRanges, isJsDocComment);

        function isJsDocComment(comment: CommentRange) {
            // True if the comment starts with '/**' but not if it is '/**/'
            return text.charCodeAt(comment.pos + 1) === CharCode.asterisk &&
                text.charCodeAt(comment.pos + 2) === CharCode.asterisk &&
                text.charCodeAt(comment.pos + 3) !== CharCode.slash;
        }
    }

    export let fullTripleSlashReferencePathRegEx = /^(\/\/\/\s*<reference\s+path\s*=\s*)('|")(.+?)\2.*?\/>/;
    export let fullTripleSlashReferenceTypeReferenceDirectiveRegEx = /^(\/\/\/\s*<reference\s+types\s*=\s*)('|")(.+?)\2.*?\/>/;
    export let fullTripleSlashAMDReferencePathRegEx = /^(\/\/\/\s*<amd-dependency\s+path\s*=\s*)('|")(.+?)\2.*?\/>/;

    export function isTypeNode(node: Node): boolean {
        if (TokenType.FirstTypeNode <= node.kind && node.kind <= TokenType.LastTypeNode) {
            return true;
        }

        switch (node.kind) {
            case TokenType.any:
            case TokenType.number:
            case TokenType.string:
            case TokenType.boolean:
            case TokenType.symbol:
            case TokenType.undefined:
            case TokenType.never:
                return true;
            case TokenType.void:
                return node.parent.kind !== TokenType.VoidExpression;
            case TokenType.ExpressionWithTypeArguments:
                return !isExpressionWithTypeArgumentsInClassExtendsClause(node);

            // Identifiers and qualified names may be type nodes, depending on their context. Climb
            // above them to find the lowest container
            case TokenType.Identifier:
                // If the identifier is the RHS of a qualified name, then it's a type iff its parent is.
                if (node.parent.kind === TokenType.QualifiedName && (<QualifiedName>node.parent).right === node) {
                    node = node.parent;
                }
                else if (node.parent.kind === TokenType.PropertyAccessExpression && (<PropertyAccessExpression>node.parent).name === node) {
                    node = node.parent;
                }
                // At this point, node is either a qualified name or an identifier
                Debug.assert(node.kind === TokenType.Identifier || node.kind === TokenType.QualifiedName || node.kind === TokenType.PropertyAccessExpression,
                    "'node' was expected to be a qualified name, identifier or property access in 'isTypeNode'.");
            case TokenType.QualifiedName:
            case TokenType.PropertyAccessExpression:
            case TokenType.this:
                let parent = node.parent;
                if (parent.kind === TokenType.TypeQuery) {
                    return false;
                }
                // Do not recursively call isTypeNode on the parent. In the example:
                //
                //     let a: A.B.C;
                //
                // Calling isTypeNode would consider the qualified name A.B a type node. Only C or
                // A.B.C is a type node.
                if (TokenType.FirstTypeNode <= parent.kind && parent.kind <= TokenType.LastTypeNode) {
                    return true;
                }
                switch (parent.kind) {
                    case TokenType.ExpressionWithTypeArguments:
                        return !isExpressionWithTypeArgumentsInClassExtendsClause(parent);
                    case TokenType.TypeParameter:
                        return node === (<TypeParameterDeclaration>parent).constraint;
                    case TokenType.PropertyDeclaration:
                    case TokenType.PropertySignature:
                    case TokenType.Parameter:
                    case TokenType.VariableDeclaration:
                        return node === (<VariableLikeDeclaration>parent).type;
                    case TokenType.FunctionDeclaration:
                    case TokenType.FunctionExpression:
                    case TokenType.ArrowFunction:
                    case TokenType.Constructor:
                    case TokenType.MethodDeclaration:
                    case TokenType.MethodSignature:
                    case TokenType.GetAccessor:
                    case TokenType.SetAccessor:
                        return node === (<FunctionLikeDeclaration>parent).type;
                    case TokenType.CallSignature:
                    case TokenType.ConstructSignature:
                    case TokenType.IndexSignature:
                        return node === (<SignatureDeclaration>parent).type;
                    case TokenType.TypeAssertionExpression:
                        return node === (<TypeAssertion>parent).type;
                    case TokenType.CallExpression:
                    case TokenType.NewExpression:
                        return (<CallExpression>parent).typeArguments && indexOf((<CallExpression>parent).typeArguments, node) >= 0;
                    case TokenType.TaggedTemplateExpression:
                        // TODO (drosen): TaggedTemplateExpressions may eventually support type arguments.
                        return false;
                }
        }

        return false;
    }

    // Warning: This has the same semantics as the forEach family of functions,
    //          in that traversal terminates in the event that 'visitor' supplies a truthy value.
    export function forEachReturnStatement<T>(body: BlockStatement, visitor: (stmt: ReturnStatement) => T): T {

        return traverse(body);

        function traverse(node: Node): T {
            switch (node.kind) {
                case TokenType.ReturnStatement:
                    return visitor(<ReturnStatement>node);
                case TokenType.CaseBlock:
                case TokenType.Block:
                case TokenType.IfStatement:
                case TokenType.DoStatement:
                case TokenType.WhileStatement:
                case TokenType.ForStatement:
                case TokenType.ForInStatement:
                case TokenType.ForOfStatement:
                case TokenType.WithStatement:
                case TokenType.SwitchStatement:
                case TokenType.CaseClause:
                case TokenType.DefaultClause:
                case TokenType.LabeledStatement:
                case TokenType.TryStatement:
                case TokenType.CatchClause:
                    return forEachChild(node, traverse);
            }
        }
    }

    export function forEachYieldExpression(body: BlockStatement, visitor: (expr: YieldExpression) => void): void {

        return traverse(body);

        function traverse(node: Node): void {
            switch (node.kind) {
                case TokenType.YieldExpression:
                    visitor(<YieldExpression>node);
                    let operand = (<YieldExpression>node).expression;
                    if (operand) {
                        traverse(operand);
                    }
                case TokenType.EnumDeclaration:
                case TokenType.InterfaceDeclaration:
                case TokenType.ModuleDeclaration:
                case TokenType.TypeAliasDeclaration:
                case TokenType.ClassDeclaration:
                case TokenType.ClassExpression:
                    // These are not allowed inside a generator now, but eventually they may be allowed
                    // as local types. Regardless, any yield statements contained within them should be
                    // skipped in this traversal.
                    return;
                default:
                    if (isFunctionLike(node)) {
                        const name = (<FunctionLikeDeclaration>node).name;
                        if (name && name.kind === TokenType.ComputedPropertyName) {
                            // Note that we will not include methods/accessors of a class because they would require
                            // first descending into the class. This is by design.
                            traverse((<ComputedPropertyName>name).expression);
                            return;
                        }
                    }
                    else if (!isTypeNode(node)) {
                        // This is the general case, which should include mostly expressions and statements.
                        // Also includes NodeArrays.
                        forEachChild(node, traverse);
                    }
            }
        }
    }

    export function isVariableLike(node: Node): node is VariableLikeDeclaration {
        if (node) {
            switch (node.kind) {
                case TokenType.BindingElement:
                case TokenType.EnumMember:
                case TokenType.Parameter:
                case TokenType.PropertyAssignment:
                case TokenType.PropertyDeclaration:
                case TokenType.PropertySignature:
                case TokenType.ShorthandPropertyAssignment:
                case TokenType.VariableDeclaration:
                    return true;
            }
        }
        return false;
    }

    export function isAccessor(node: Node): node is AccessorDeclaration {
        return node && (node.kind === TokenType.GetAccessor || node.kind === TokenType.SetAccessor);
    }

    export function isClassLike(node: Node): node is ClassLikeDeclaration {
        return node && (node.kind === TokenType.ClassDeclaration || node.kind === TokenType.ClassExpression);
    }

    export function isFunctionLike(node: Node): node is FunctionLikeDeclaration {
        return node && isFunctionLikeKind(node.kind);
    }

    export function isFunctionLikeKind(kind: TokenType): boolean {
        switch (kind) {
            case TokenType.Constructor:
            case TokenType.FunctionExpression:
            case TokenType.FunctionDeclaration:
            case TokenType.ArrowFunction:
            case TokenType.MethodDeclaration:
            case TokenType.MethodSignature:
            case TokenType.GetAccessor:
            case TokenType.SetAccessor:
            case TokenType.CallSignature:
            case TokenType.ConstructSignature:
            case TokenType.IndexSignature:
            case TokenType.FunctionType:
            case TokenType.ConstructorType:
                return true;
        }

        return false;
    }

    export function introducesArgumentsExoticObject(node: Node) {
        switch (node.kind) {
            case TokenType.MethodDeclaration:
            case TokenType.MethodSignature:
            case TokenType.Constructor:
            case TokenType.GetAccessor:
            case TokenType.SetAccessor:
            case TokenType.FunctionDeclaration:
            case TokenType.FunctionExpression:
                return true;
        }
        return false;
    }

    export function isIterationStatement(node: Node, lookInLabeledStatements: boolean): boolean {
        switch (node.kind) {
            case TokenType.ForStatement:
            case TokenType.ForInStatement:
            case TokenType.ForOfStatement:
            case TokenType.DoStatement:
            case TokenType.WhileStatement:
                return true;
            case TokenType.LabeledStatement:
                return lookInLabeledStatements && isIterationStatement((<LabeledStatement>node).statement, lookInLabeledStatements);
        }

        return false;
    }


    export function isFunctionBlock(node: Node) {
        return node && node.kind === TokenType.Block && isFunctionLike(node.parent);
    }

    export function isObjectLiteralMethod(node: Node): node is MethodDeclaration {
        return node && node.kind === TokenType.MethodDeclaration && node.parent.kind === TokenType.ObjectLiteralExpression;
    }

    export function isIdentifierTypePredicate(predicate: TypePredicate): predicate is IdentifierTypePredicate {
        return predicate && predicate.kind === TypePredicateKind.Identifier;
    }

    export function isThisTypePredicate(predicate: TypePredicate): predicate is ThisTypePredicate {
        return predicate && predicate.kind === TypePredicateKind.This;
    }

    export function getContainingFunction(node: Node): FunctionLikeDeclaration {
        while (true) {
            node = node.parent;
            if (!node || isFunctionLike(node)) {
                return <FunctionLikeDeclaration>node;
            }
        }
    }

    export function getContainingClass(node: Node): ClassLikeDeclaration {
        while (true) {
            node = node.parent;
            if (!node || isClassLike(node)) {
                return <ClassLikeDeclaration>node;
            }
        }
    }

    export function getThisContainer(node: Node, includeArrowFunctions: boolean): Node {
        while (true) {
            node = node.parent;
            if (!node) {
                return undefined;
            }
            switch (node.kind) {
                case TokenType.ComputedPropertyName:
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
                case TokenType.Decorator:
                    // Decorators are always applied outside of the body of a class or method.
                    if (node.parent.kind === TokenType.Parameter && isClassElement(node.parent.parent)) {
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
                case TokenType.ArrowFunction:
                    if (!includeArrowFunctions) {
                        continue;
                    }
                // Fall through
                case TokenType.FunctionDeclaration:
                case TokenType.FunctionExpression:
                case TokenType.ModuleDeclaration:
                case TokenType.PropertyDeclaration:
                case TokenType.PropertySignature:
                case TokenType.MethodDeclaration:
                case TokenType.MethodSignature:
                case TokenType.Constructor:
                case TokenType.GetAccessor:
                case TokenType.SetAccessor:
                case TokenType.CallSignature:
                case TokenType.ConstructSignature:
                case TokenType.IndexSignature:
                case TokenType.EnumDeclaration:
                case TokenType.SourceFile:
                    return node;
            }
        }
    }

    /**
      * Given an super call\property node returns a closest node where either
      * - super call\property is legal in the node and not legal in the parent node the node.
      *   i.e. super call is legal in constructor but not legal in the class body.
      * - node is arrow function (so caller might need to call getSuperContainer in case it needs to climb higher)
      * - super call\property is definitely illegal in the node (but might be legal in some subnode)
      *   i.e. super property access is illegal in function declaration but can be legal in the statement list
      */
    export function getSuperContainer(node: Node, stopOnFunctions: boolean): Node {
        while (true) {
            node = node.parent;
            if (!node) {
                return node;
            }
            switch (node.kind) {
                case TokenType.ComputedPropertyName:
                    node = node.parent;
                    break;
                case TokenType.FunctionDeclaration:
                case TokenType.FunctionExpression:
                case TokenType.ArrowFunction:
                    if (!stopOnFunctions) {
                        continue;
                    }
                case TokenType.PropertyDeclaration:
                case TokenType.PropertySignature:
                case TokenType.MethodDeclaration:
                case TokenType.MethodSignature:
                case TokenType.Constructor:
                case TokenType.GetAccessor:
                case TokenType.SetAccessor:
                    return node;
                case TokenType.Decorator:
                    // Decorators are always applied outside of the body of a class or method.
                    if (node.parent.kind === TokenType.Parameter && isClassElement(node.parent.parent)) {
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

    export function getImmediatelyInvokedFunctionExpression(func: Node): CallExpression {
        if (func.kind === TokenType.FunctionExpression || func.kind === TokenType.ArrowFunction) {
            let prev = func;
            let parent = func.parent;
            while (parent.kind === TokenType.ParenthesizedExpression) {
                prev = parent;
                parent = parent.parent;
            }
            if (parent.kind === TokenType.CallExpression && (parent as CallExpression).expression === prev) {
                return parent as CallExpression;
            }
        }
    }

    /**
     * Determines whether a node is a property or element access expression for super.
     */
    export function isSuperPropertyOrElementAccess(node: Node) {
        return (node.kind === TokenType.PropertyAccessExpression
            || node.kind === TokenType.ElementAccessExpression)
            && (<PropertyAccessExpression | ElementAccessExpression>node).expression.kind === TokenType.super;
    }


    export function getEntityNameFromTypeNode(node: TypeNode): EntityName | Expression {
        if (node) {
            switch (node.kind) {
                case TokenType.TypeReference:
                    return (<TypeReferenceNode>node).typeName;
                case TokenType.ExpressionWithTypeArguments:
                    return (<ExpressionWithTypeArguments>node).expression;
                case TokenType.Identifier:
                case TokenType.QualifiedName:
                    return (<EntityName><Node>node);
            }
        }

        return undefined;
    }

    export function getInvokedExpression(node: CallLikeExpression): Expression {
        if (node.kind === TokenType.TaggedTemplateExpression) {
            return (<TaggedTemplateExpression>node).tag;
        }

        // Will either be a CallExpression, NewExpression, or Decorator.
        return (<CallExpression | Decorator>node).expression;
    }

    export function nodeCanBeDecorated(node: Node): boolean {
        switch (node.kind) {
            case TokenType.ClassDeclaration:
                // classes are valid targets
                return true;

            case TokenType.PropertyDeclaration:
                // property declarations are valid if their parent is a class declaration.
                return node.parent.kind === TokenType.ClassDeclaration;

            case TokenType.GetAccessor:
            case TokenType.SetAccessor:
            case TokenType.MethodDeclaration:
                // if this method has a body and its parent is a class declaration, this is a valid target.
                return (<FunctionLikeDeclaration>node).body !== undefined
                    && node.parent.kind === TokenType.ClassDeclaration;

            case TokenType.Parameter:
                // if the parameter's parent has a body and its grandparent is a class declaration, this is a valid target;
                return (<FunctionLikeDeclaration>node.parent).body !== undefined
                    && (node.parent.kind === TokenType.Constructor
                    || node.parent.kind === TokenType.MethodDeclaration
                    || node.parent.kind === TokenType.SetAccessor)
                    && node.parent.parent.kind === TokenType.ClassDeclaration;
        }

        return false;
    }

    export function nodeIsDecorated(node: Node): boolean {
        return node.decorators !== undefined
            && nodeCanBeDecorated(node);
    }

    export function isPropertyAccessExpression(node: Node): node is PropertyAccessExpression {
        return node.kind === TokenType.PropertyAccessExpression;
    }

    export function isElementAccessExpression(node: Node): node is ElementAccessExpression {
        return node.kind === TokenType.ElementAccessExpression;
    }

    export function isJSXTagName(node: Node) {
        const parent = node.parent;
        if (parent.kind === TokenType.JsxOpeningElement ||
            parent.kind === TokenType.JsxSelfClosingElement ||
            parent.kind === TokenType.JsxClosingElement) {
            return (<JsxOpeningLikeElement>parent).tagName === node;
        }
        return false;
    }

    export function isExpression(node: Node): boolean {
        switch (node.kind) {
            case TokenType.this:
            case TokenType.super:
            case TokenType.null:
            case TokenType.true:
            case TokenType.false:
            case TokenType.RegularExpressionLiteral:
            case TokenType.ArrayLiteralExpression:
            case TokenType.ObjectLiteralExpression:
            case TokenType.PropertyAccessExpression:
            case TokenType.ElementAccessExpression:
            case TokenType.CallExpression:
            case TokenType.NewExpression:
            case TokenType.TaggedTemplateExpression:
            case TokenType.AsExpression:
            case TokenType.TypeAssertionExpression:
            case TokenType.NonNullExpression:
            case TokenType.ParenthesizedExpression:
            case TokenType.FunctionExpression:
            case TokenType.ClassExpression:
            case TokenType.ArrowFunction:
            case TokenType.VoidExpression:
            case TokenType.DeleteExpression:
            case TokenType.TypeOfExpression:
            case TokenType.PrefixUnaryExpression:
            case TokenType.PostfixUnaryExpression:
            case TokenType.BinaryExpression:
            case TokenType.ConditionalExpression:
            case TokenType.SpreadElementExpression:
            case TokenType.TemplateExpression:
            case TokenType.NoSubstitutionTemplateLiteral:
            case TokenType.OmittedExpression:
            case TokenType.JsxElement:
            case TokenType.JsxSelfClosingElement:
            case TokenType.YieldExpression:
            case TokenType.AwaitExpression:
                return true;
            case TokenType.QualifiedName:
                while (node.parent.kind === TokenType.QualifiedName) {
                    node = node.parent;
                }
                return node.parent.kind === TokenType.TypeQuery || isJSXTagName(node);
            case TokenType.Identifier:
                if (node.parent.kind === TokenType.TypeQuery || isJSXTagName(node)) {
                    return true;
                }
            // fall through
            case TokenType.NumericLiteral:
            case TokenType.StringLiteral:
            case TokenType.this:
                let parent = node.parent;
                switch (parent.kind) {
                    case TokenType.VariableDeclaration:
                    case TokenType.Parameter:
                    case TokenType.PropertyDeclaration:
                    case TokenType.PropertySignature:
                    case TokenType.EnumMember:
                    case TokenType.PropertyAssignment:
                    case TokenType.BindingElement:
                        return (<VariableLikeDeclaration>parent).initializer === node;
                    case TokenType.ExpressionStatement:
                    case TokenType.IfStatement:
                    case TokenType.DoStatement:
                    case TokenType.WhileStatement:
                    case TokenType.ReturnStatement:
                    case TokenType.WithStatement:
                    case TokenType.SwitchStatement:
                    case TokenType.CaseClause:
                    case TokenType.ThrowStatement:
                    case TokenType.SwitchStatement:
                        return (<ExpressionStatement>parent).expression === node;
                    case TokenType.ForStatement:
                        let forStatement = <ForStatement>parent;
                        return (forStatement.initializer === node && forStatement.initializer.kind !== TokenType.VariableDeclarationList) ||
                            forStatement.condition === node ||
                            forStatement.incrementor === node;
                    case TokenType.ForInStatement:
                    case TokenType.ForOfStatement:
                        let forInStatement = <ForInStatement | ForOfStatement>parent;
                        return (forInStatement.initializer === node && forInStatement.initializer.kind !== TokenType.VariableDeclarationList) ||
                            forInStatement.expression === node;
                    case TokenType.TypeAssertionExpression:
                    case TokenType.AsExpression:
                        return node === (<AssertionExpression>parent).expression;
                    case TokenType.TemplateSpan:
                        return node === (<TemplateSpan>parent).expression;
                    case TokenType.ComputedPropertyName:
                        return node === (<ComputedPropertyName>parent).expression;
                    case TokenType.Decorator:
                    case TokenType.JsxExpression:
                    case TokenType.JsxSpreadAttribute:
                        return true;
                    case TokenType.ExpressionWithTypeArguments:
                        return (<ExpressionWithTypeArguments>parent).expression === node && isExpressionWithTypeArgumentsInClassExtendsClause(parent);
                    default:
                        if (isExpression(parent)) {
                            return true;
                        }
                }
        }
        return false;
    }

    export function isExternalModuleNameRelative(moduleName: string): boolean {
        // TypeScript 1.0 spec (April 2014): 11.2.1
        // An external module name is "relative" if the first term is "." or "..".
        return moduleName.substr(0, 2) === "./" || moduleName.substr(0, 3) === "../" || moduleName.substr(0, 2) === ".\\" || moduleName.substr(0, 3) === "..\\";
    }

    export function isInstantiatedModule(node: ModuleDeclaration, preserveConstEnums: boolean) {
        const moduleState = getModuleInstanceState(node);
        return moduleState === ModuleInstanceState.Instantiated ||
            (preserveConstEnums && moduleState === ModuleInstanceState.ConstEnumOnly);
    }

    export function isExternalModuleImportEqualsDeclaration(node: Node) {
        return node.kind === TokenType.ImportEqualsDeclaration && (<ImportEqualsDeclaration>node).moduleReference.kind === TokenType.ExternalModuleReference;
    }

    export function getExternalModuleImportEqualsDeclarationExpression(node: Node) {
        Debug.assert(isExternalModuleImportEqualsDeclaration(node));
        return (<ExternalModuleReference>(<ImportEqualsDeclaration>node).moduleReference).expression;
    }

    export function isInternalModuleImportEqualsDeclaration(node: Node): node is ImportEqualsDeclaration {
        return node.kind === TokenType.ImportEqualsDeclaration && (<ImportEqualsDeclaration>node).moduleReference.kind !== TokenType.ExternalModuleReference;
    }

    export function isSourceFileJavaScript(file: SourceFile): boolean {
        return isInJavaScriptFile(file);
    }

    export function isInJavaScriptFile(node: Node): boolean {
        return node && !!(node.flags & NodeFlags.JavaScriptFile);
    }

    /**
     * Returns true if the node is a CallExpression to the identifier 'require' with
     * exactly one argument.
     * This function does not test if the node is in a JavaScript file or not.
    */
    export function isRequireCall(expression: Node, checkArgumentIsStringLiteral: boolean): expression is CallExpression {
        // of the form 'require("name")'
        const isRequire = expression.kind === TokenType.CallExpression &&
            (<CallExpression>expression).expression.kind === TokenType.Identifier &&
            (<Identifier>(<CallExpression>expression).expression).text === "require" &&
            (<CallExpression>expression).arguments.length === 1;

        return isRequire && (!checkArgumentIsStringLiteral || (<CallExpression>expression).arguments[0].kind === TokenType.StringLiteral);
    }

    export function isSingleOrDoubleQuote(charCode: number) {
        return charCode === CharCode.singleQuote || charCode === CharCode.doubleQuote;
    }

    /**
     * Returns true if the node is a variable declaration whose initializer is a function expression.
     * This function does not test if the node is in a JavaScript file or not.
     */
    export function isDeclarationOfFunctionExpression(s: Symbol) {
        if (s.valueDeclaration && s.valueDeclaration.kind === TokenType.VariableDeclaration) {
            const declaration = s.valueDeclaration as VariableDeclaration;
            return declaration.initializer && declaration.initializer.kind === TokenType.FunctionExpression;
        }
        return false;
    }

    /// Given a BinaryExpression, returns SpecialPropertyAssignmentKind for the various kinds of property
    /// assignments we treat as special in the binder
    export function getSpecialPropertyAssignmentKind(expression: Node): SpecialPropertyAssignmentKind {
        if (!isInJavaScriptFile(expression)) {
            return SpecialPropertyAssignmentKind.None;
        }
        if (expression.kind !== TokenType.BinaryExpression) {
            return SpecialPropertyAssignmentKind.None;
        }
        const expr = <BinaryExpression>expression;
        if (expr.operatorToken.kind !== TokenType.equals || expr.left.kind !== TokenType.PropertyAccessExpression) {
            return SpecialPropertyAssignmentKind.None;
        }
        const lhs = <PropertyAccessExpression>expr.left;
        if (lhs.expression.kind === TokenType.Identifier) {
            const lhsId = <Identifier>lhs.expression;
            if (lhsId.text === "exports") {
                // exports.name = expr
                return SpecialPropertyAssignmentKind.ExportsProperty;
            }
            else if (lhsId.text === "module" && lhs.name.text === "exports") {
                // module.exports = expr
                return SpecialPropertyAssignmentKind.ModuleExports;
            }
        }
        else if (lhs.expression.kind === TokenType.this) {
            return SpecialPropertyAssignmentKind.ThisProperty;
        }
        else if (lhs.expression.kind === TokenType.PropertyAccessExpression) {
            // chained dot, e.g. x.y.z = expr; this var is the 'x.y' part
            const innerPropertyAccess = <PropertyAccessExpression>lhs.expression;
            if (innerPropertyAccess.expression.kind === TokenType.Identifier) {
                // module.exports.name = expr
                const innerPropertyAccessIdentifier = <Identifier>innerPropertyAccess.expression;
                if (innerPropertyAccessIdentifier.text === "module" && innerPropertyAccess.name.text === "exports") {
                    return SpecialPropertyAssignmentKind.ExportsProperty;
                }
                if (innerPropertyAccess.name.text === "prototype") {
                    return SpecialPropertyAssignmentKind.PrototypeProperty;
                }
            }
        }

        return SpecialPropertyAssignmentKind.None;
    }

    export function getExternalModuleName(node: Node): Expression {
        if (node.kind === TokenType.ImportDeclaration) {
            return (<ImportDeclaration>node).moduleSpecifier;
        }
        if (node.kind === TokenType.ImportEqualsDeclaration) {
            const reference = (<ImportEqualsDeclaration>node).moduleReference;
            if (reference.kind === TokenType.ExternalModuleReference) {
                return (<ExternalModuleReference>reference).expression;
            }
        }
        if (node.kind === TokenType.ExportDeclaration) {
            return (<ExportDeclaration>node).moduleSpecifier;
        }
        if (node.kind === TokenType.ModuleDeclaration && (<ModuleDeclaration>node).name.kind === TokenType.StringLiteral) {
            return (<ModuleDeclaration>node).name;
        }
    }

    export function hasQuestionToken(node: Node) {
        if (node) {
            switch (node.kind) {
                case TokenType.Parameter:
                case TokenType.MethodDeclaration:
                case TokenType.MethodSignature:
                case TokenType.ShorthandPropertyAssignment:
                case TokenType.PropertyAssignment:
                case TokenType.PropertyDeclaration:
                case TokenType.PropertySignature:
                    return (<ParameterDeclaration | MethodDeclaration | PropertyDeclaration>node).questionToken !== undefined;
            }
        }

        return false;
    }

    export function isJSDocConstructSignature(node: Node) {
        return node.kind === TokenType.JSDocFunctionType &&
            (<JSDocFunctionType>node).parameters.length > 0 &&
            (<JSDocFunctionType>node).parameters[0].type.kind === TokenType.JSDocConstructorType;
    }

    function getJSDocTag(node: Node, kind: TokenType, checkParentVariableStatement: boolean): JSDocTag {
        if (!node) {
            return undefined;
        }

        const jsDocComments = getJSDocComments(node, checkParentVariableStatement);
        if (!jsDocComments) {
            return undefined;
        }

        for (const jsDocComment of jsDocComments) {
            for (const tag of jsDocComment.tags) {
                if (tag.kind === kind) {
                    return tag;
                }
            }
        }
    }

    function getJSDocComments(node: Node, checkParentVariableStatement: boolean): JSDocComment[] {
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
            const isInitializerOfVariableDeclarationInStatement =
                node.parent.kind === TokenType.VariableDeclaration &&
                (<VariableDeclaration>node.parent).initializer === node &&
                node.parent.parent.parent.kind === TokenType.VariableStatement;

            const variableStatementNode = isInitializerOfVariableDeclarationInStatement ? node.parent.parent.parent : undefined;
            if (variableStatementNode) {
                return variableStatementNode.jsDocComments;
            }

            // Also recognize when the node is the RHS of an assignment expression
            const parent = node.parent;
            const isSourceOfAssignmentExpressionStatement =
                parent && parent.parent &&
                parent.kind === TokenType.BinaryExpression &&
                (parent as BinaryExpression).operatorToken.kind === TokenType.equals &&
                parent.parent.kind === TokenType.ExpressionStatement;
            if (isSourceOfAssignmentExpressionStatement) {
                return parent.parent.jsDocComments;
            }

            const isPropertyAssignmentExpression = parent && parent.kind === TokenType.PropertyAssignment;
            if (isPropertyAssignmentExpression) {
                return parent.jsDocComments;
            }
        }

        return undefined;
    }

    export function getJSDocTypeTag(node: Node): JSDocTypeTag {
        return <JSDocTypeTag>getJSDocTag(node, TokenType.JSDocTypeTag, /*checkParentVariableStatement*/ false);
    }

    export function getJSDocReturnTag(node: Node): JSDocReturnTag {
        return <JSDocReturnTag>getJSDocTag(node, TokenType.JSDocReturnTag, /*checkParentVariableStatement*/ true);
    }

    export function getJSDocTemplateTag(node: Node): JSDocTemplateTag {
        return <JSDocTemplateTag>getJSDocTag(node, TokenType.JSDocTemplateTag, /*checkParentVariableStatement*/ false);
    }

    export function getCorrespondingJSDocParameterTag(parameter: ParameterDeclaration): JSDocParameterTag {
        if (parameter.name && parameter.name.kind === TokenType.Identifier) {
            // If it's a parameter, see if the parent has a jsdoc comment with an @param
            // annotation.
            const parameterName = (<Identifier>parameter.name).text;

            const jsDocComments = getJSDocComments(parameter.parent, /*checkParentVariableStatement*/ true);
            if (jsDocComments) {
                for (const jsDocComment of jsDocComments) {
                    for (const tag of jsDocComment.tags) {
                        if (tag.kind === TokenType.JSDocParameterTag) {
                            const parameterTag = <JSDocParameterTag>tag;
                            const name = parameterTag.preParameterName || parameterTag.postParameterName;
                            if (name.text === parameterName) {
                                return parameterTag;
                            }
                        }
                    }
                }
            }
        }

        return undefined;
    }

    export function hasRestParameter(s: SignatureDeclaration): boolean {
        return isRestParameter(lastOrUndefined(s.parameters));
    }

    export function hasDeclaredRestParameter(s: SignatureDeclaration): boolean {
        return isDeclaredRestParam(lastOrUndefined(s.parameters));
    }

    export function isRestParameter(node: ParameterDeclaration) {
        if (node && (node.flags & NodeFlags.JavaScriptFile)) {
            if (node.type && node.type.kind === TokenType.JSDocVariadicType) {
                return true;
            }

            const paramTag = getCorrespondingJSDocParameterTag(node);
            if (paramTag && paramTag.typeExpression) {
                return paramTag.typeExpression.type.kind === TokenType.JSDocVariadicType;
            }
        }
        return isDeclaredRestParam(node);
    }

    export function isDeclaredRestParam(node: ParameterDeclaration) {
        return node && node.dotDotDotToken !== undefined;
    }

    export function isLiteralKind(kind: TokenType): boolean {
        return TokenType.firstLiteral <= kind && kind <= TokenType.lastLiteral;
    }

    export function isTextualLiteralKind(kind: TokenType): boolean {
        return kind === TokenType.StringLiteral || kind === TokenType.NoSubstitutionTemplateLiteral;
    }

    export function isTemplateLiteralKind(kind: TokenType): boolean {
        return TokenType.firstTemplate <= kind && kind <= TokenType.lastTemplate;
    }

    export function isBindingPattern(node: Node): node is BindingPattern {
        return !!node && (node.kind === TokenType.ArrayBindingPattern || node.kind === TokenType.ObjectBindingPattern);
    }

    // A node is an assignment target if it is on the left hand side of an '=' token, if it is parented by a property
    // assignment in an object literal that is an assignment target, or if it is parented by an array literal that is
    // an assignment target. Examples include 'a = xxx', '{ p: a } = xxx', '[{ p: a}] = xxx'.
    export function isAssignmentTarget(node: Node): boolean {
        while (node.parent.kind === TokenType.ParenthesizedExpression) {
            node = node.parent;
        }
        while (true) {
            const parent = node.parent;
            if (parent.kind === TokenType.ArrayLiteralExpression || parent.kind === TokenType.SpreadElementExpression) {
                node = parent;
                continue;
            }
            if (parent.kind === TokenType.PropertyAssignment || parent.kind === TokenType.ShorthandPropertyAssignment) {
                node = parent.parent;
                continue;
            }
            return parent.kind === TokenType.BinaryExpression &&
                (<BinaryExpression>parent).operatorToken.kind === TokenType.equals &&
                (<BinaryExpression>parent).left === node ||
                (parent.kind === TokenType.ForInStatement || parent.kind === TokenType.ForOfStatement) &&
                (<ForInStatement | ForOfStatement>parent).initializer === node;
        }
    }

    export function isNodeDescendentOf(node: Node, ancestor: Node): boolean {
        while (node) {
            if (node === ancestor) return true;
            node = node.parent;
        }
        return false;
    }

    export function isInAmbientContext(node: Node): boolean {
        while (node) {
            if (node.flags & NodeFlags.Ambient || (node.kind === TokenType.SourceFile && (node as SourceFile).isDeclarationFile)) {
                return true;
            }
            node = node.parent;
        }
        return false;
    }

    export function isDeclaration(node: Node): boolean {
        switch (node.kind) {
            case TokenType.ArrowFunction:
            case TokenType.BindingElement:
            case TokenType.ClassDeclaration:
            case TokenType.ClassExpression:
            case TokenType.Constructor:
            case TokenType.EnumDeclaration:
            case TokenType.EnumMember:
            case TokenType.ExportSpecifier:
            case TokenType.FunctionDeclaration:
            case TokenType.FunctionExpression:
            case TokenType.GetAccessor:
            case TokenType.ImportClause:
            case TokenType.ImportEqualsDeclaration:
            case TokenType.ImportSpecifier:
            case TokenType.InterfaceDeclaration:
            case TokenType.MethodDeclaration:
            case TokenType.MethodSignature:
            case TokenType.ModuleDeclaration:
            case TokenType.NamespaceImport:
            case TokenType.Parameter:
            case TokenType.PropertyAssignment:
            case TokenType.PropertyDeclaration:
            case TokenType.PropertySignature:
            case TokenType.SetAccessor:
            case TokenType.ShorthandPropertyAssignment:
            case TokenType.TypeAliasDeclaration:
            case TokenType.TypeParameter:
            case TokenType.VariableDeclaration:
            case TokenType.JSDocTypedefTag:
                return true;
        }
        return false;
    }

    export function isStatement(n: Node): boolean {
        switch (n.kind) {
            case TokenType.BreakStatement:
            case TokenType.ContinueStatement:
            case TokenType.DebuggerStatement:
            case TokenType.DoStatement:
            case TokenType.ExpressionStatement:
            case TokenType.EmptyStatement:
            case TokenType.ForInStatement:
            case TokenType.ForOfStatement:
            case TokenType.ForStatement:
            case TokenType.IfStatement:
            case TokenType.LabeledStatement:
            case TokenType.ReturnStatement:
            case TokenType.SwitchStatement:
            case TokenType.ThrowStatement:
            case TokenType.TryStatement:
            case TokenType.VariableStatement:
            case TokenType.WhileStatement:
            case TokenType.WithStatement:
            case TokenType.ExportAssignment:
                return true;
            default:
                return false;
        }
    }

    export function isClassElement(n: Node): boolean {
        switch (n.kind) {
            case TokenType.Constructor:
            case TokenType.PropertyDeclaration:
            case TokenType.MethodDeclaration:
            case TokenType.GetAccessor:
            case TokenType.SetAccessor:
            case TokenType.MethodSignature:
            case TokenType.IndexSignature:
                return true;
            default:
                return false;
        }
    }

    // True if the given identifier, string literal, or number literal is the name of a declaration node
    export function isDeclarationName(name: Node): boolean {
        if (name.kind !== TokenType.Identifier && name.kind !== TokenType.StringLiteral && name.kind !== TokenType.NumericLiteral) {
            return false;
        }

        const parent = name.parent;
        if (parent.kind === TokenType.ImportSpecifier || parent.kind === TokenType.ExportSpecifier) {
            if ((<ImportOrExportSpecifier>parent).propertyName) {
                return true;
            }
        }

        if (isDeclaration(parent)) {
            return (<Declaration>parent).name === name;
        }

        return false;
    }

    export function isLiteralComputedPropertyDeclarationName(node: Node) {
        return (node.kind === TokenType.StringLiteral || node.kind === TokenType.NumericLiteral) &&
            node.parent.kind === TokenType.ComputedPropertyName &&
            isDeclaration(node.parent.parent);
    }

    // Return true if the given identifier is classified as an IdentifierName
    export function isIdentifierName(node: Identifier): boolean {
        let parent = node.parent;
        switch (parent.kind) {
            case TokenType.PropertyDeclaration:
            case TokenType.PropertySignature:
            case TokenType.MethodDeclaration:
            case TokenType.MethodSignature:
            case TokenType.GetAccessor:
            case TokenType.SetAccessor:
            case TokenType.EnumMember:
            case TokenType.PropertyAssignment:
            case TokenType.PropertyAccessExpression:
                // Name in member declaration or property name in property access
                return (<Declaration | PropertyAccessExpression>parent).name === node;
            case TokenType.QualifiedName:
                // Name on right hand side of dot in a type query
                if ((<QualifiedName>parent).right === node) {
                    while (parent.kind === TokenType.QualifiedName) {
                        parent = parent.parent;
                    }
                    return parent.kind === TokenType.TypeQuery;
                }
                return false;
            case TokenType.BindingElement:
            case TokenType.ImportSpecifier:
                // Property name in binding element or import specifier
                return (<BindingElement | ImportSpecifier>parent).propertyName === node;
            case TokenType.ExportSpecifier:
                // Any name in an export specifier
                return true;
        }
        return false;
    }

    // An alias symbol is created by one of the following declarations:
    // import <symbol> = ...
    // import <symbol> from ...
    // import * as <symbol> from ...
    // import { x as <symbol> } from ...
    // export { x as <symbol> } from ...
    // export = ...
    // export default ...
    export function isAliasSymbolDeclaration(node: Node): boolean {
        return node.kind === TokenType.ImportEqualsDeclaration ||
            node.kind === TokenType.NamespaceExportDeclaration ||
            node.kind === TokenType.ImportClause && !!(<ImportClause>node).name ||
            node.kind === TokenType.NamespaceImport ||
            node.kind === TokenType.ImportSpecifier ||
            node.kind === TokenType.ExportSpecifier ||
            node.kind === TokenType.ExportAssignment && (<ExportAssignment>node).expression.kind === TokenType.Identifier;
    }

    export function getClassExtendsHeritageClauseElement(node: ClassLikeDeclaration | InterfaceDeclaration) {
        const heritageClause = getHeritageClause(node.heritageClauses, TokenType.extends);
        return heritageClause && heritageClause.types.length > 0 ? heritageClause.types[0] : undefined;
    }

    export function getClassImplementsHeritageClauseElements(node: ClassLikeDeclaration) {
        const heritageClause = getHeritageClause(node.heritageClauses, TokenType.implements);
        return heritageClause ? heritageClause.types : undefined;
    }

    export function getInterfaceBaseTypeNodes(node: InterfaceDeclaration) {
        const heritageClause = getHeritageClause(node.heritageClauses, TokenType.extends);
        return heritageClause ? heritageClause.types : undefined;
    }

    export function getHeritageClause(clauses: NodeArray<HeritageClause>, kind: TokenType) {
        if (clauses) {
            for (const clause of clauses) {
                if (clause.token === kind) {
                    return clause;
                }
            }
        }

        return undefined;
    }

    export function tryResolveScriptReference(host: ScriptReferenceHost, sourceFile: SourceFile, reference: FileReference) {
        if (!host.getCompilerOptions().noResolve) {
            const referenceFileName = isRootedDiskPath(reference.fileName) ? reference.fileName : combinePaths(getDirectoryPath(sourceFile.fileName), reference.fileName);
            return host.getSourceFile(referenceFileName);
        }
    }

    export function getAncestor(node: Node, kind: TokenType): Node {
        while (node) {
            if (node.kind === kind) {
                return node;
            }
            node = node.parent;
        }
        return undefined;
    }

    export function getFileReferenceFromReferencePath(comment: string, commentRange: CommentRange): ReferencePathMatchResult {
        const simpleReferenceRegEx = /^\/\/\/\s*<reference\s+/gim;
        const isNoDefaultLibRegEx = /^(\/\/\/\s*<reference\s+no-default-lib\s*=\s*)('|")(.+?)\2\s*\/>/gim;
        if (simpleReferenceRegEx.test(comment)) {
            if (isNoDefaultLibRegEx.test(comment)) {
                return {
                    isNoDefaultLib: true
                };
            }
            else {
                const refMatchResult = fullTripleSlashReferencePathRegEx.exec(comment);
                const refLibResult = !refMatchResult && fullTripleSlashReferenceTypeReferenceDirectiveRegEx.exec(comment);
                if (refMatchResult || refLibResult) {
                    const start = commentRange.pos;
                    const end = commentRange.end;
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
                    diagnosticMessage: Diagnostics.Invalid_reference_directive_syntax,
                    isNoDefaultLib: false
                };
            }
        }

        return undefined;
    }

    export function isKeyword(token: TokenType): boolean {
        return TokenType.first <= token && token <= TokenType.last;
    }

    export function isTrivia(token: TokenType) {
        return TokenType.firstTrivia <= token && token <= TokenType.lastTrivia;
    }

    export function isAsyncFunctionLike(node: Node): boolean {
        return isFunctionLike(node) && (node.flags & NodeFlags.Async) !== 0 && !isAccessor(node);
    }

    export function isStringOrNumericLiteral(kind: TokenType): boolean {
        return kind === TokenType.StringLiteral || kind === TokenType.NumericLiteral;
    }

    /**
     * A declaration has a dynamic name if both of the following are true:
     *   1. The declaration has a computed property name
     *   2. The computed name is *not* expressed as Symbol.<name>, where name
     *      is a property of the Symbol constructor that denotes a built in
     *      Symbol.
     */
    export function hasDynamicName(declaration: Declaration): boolean {
        return declaration.name && isDynamicName(declaration.name);
    }

    export function isDynamicName(name: DeclarationName): boolean {
        return name.kind === TokenType.ComputedPropertyName &&
            !isStringOrNumericLiteral((<ComputedPropertyName>name).expression.kind) &&
            !isWellKnownSymbolSyntactically((<ComputedPropertyName>name).expression);
    }

    /**
     * Checks if the expression is of the form:
     *    Symbol.name
     * where Symbol is literally the word "Symbol", and name is any identifierName
     */
    export function isWellKnownSymbolSyntactically(node: Expression): boolean {
        return isPropertyAccessExpression(node) && isESSymbolIdentifier(node.expression);
    }

    export function getPropertyNameForPropertyNameNode(name: DeclarationName): string {
        if (name.kind === TokenType.Identifier || name.kind === TokenType.StringLiteral || name.kind === TokenType.NumericLiteral || name.kind === TokenType.Parameter) {
            return (<Identifier | LiteralExpression>name).text;
        }
        if (name.kind === TokenType.ComputedPropertyName) {
            const nameExpression = (<ComputedPropertyName>name).expression;
            if (isWellKnownSymbolSyntactically(nameExpression)) {
                const rightHandSideName = (<PropertyAccessExpression>nameExpression).name.text;
                return getPropertyNameForKnownSymbolName(rightHandSideName);
            }
            else if (nameExpression.kind === TokenType.StringLiteral || nameExpression.kind === TokenType.NumericLiteral) {
                return (<LiteralExpression>nameExpression).text;
            }
        }

        return undefined;
    }

    export function getPropertyNameForKnownSymbolName(symbolName: string): string {
        return "__@" + symbolName;
    }

    /**
     * Includes the word "Symbol" with unicode escapes
     */
    export function isESSymbolIdentifier(node: Node): boolean {
        return node.kind === TokenType.Identifier && (<Identifier>node).text === "Symbol";
    }

    export function isModifierKind(token: TokenType): boolean {
        switch (token) {
            case TokenType.abstract:
            case TokenType.async:
            case TokenType.const:
            case TokenType.declare:
            case TokenType.default:
            case TokenType.export:
            case TokenType.public:
            case TokenType.private:
            case TokenType.protected:
            case TokenType.readonly:
            case TokenType.static:
                return true;
        }
        return false;
    }

    export function isParameterDeclaration(node: VariableLikeDeclaration) {
        const root = getRootDeclaration(node);
        return root.kind === TokenType.Parameter;
    }

    export function getRootDeclaration(node: Node): Node {
        while (node.kind === TokenType.BindingElement) {
            node = node.parent.parent;
        }
        return node;
    }

    export function nodeStartsNewLexicalEnvironment(n: Node): boolean {
        return isFunctionLike(n) || n.kind === TokenType.ModuleDeclaration || n.kind === TokenType.SourceFile;
    }

    /**
     * Creates a shallow, memberwise clone of a node. The "kind", "pos", "end", "flags", and "parent"
     * properties are excluded by default, and can be provided via the "location", "flags", and
     * "parent" parameters.
     * @param node The node to clone.
     * @param location An optional TextRange to use to supply the new position.
     * @param flags The NodeFlags to use for the cloned node.
     * @param parent The parent for the new node.
     */
    export function cloneNode<T extends Node>(node: T, location?: TextRange, flags?: NodeFlags, parent?: Node): T {
        // We don't use "clone" from core.ts here, as we need to preserve the prototype chain of
        // the original node. We also need to exclude specific properties and only include own-
        // properties (to skip members already defined on the shared prototype).
        const clone = location !== undefined
            ? <T>createNode(node.kind, location.pos, location.end)
            : <T>createSynthesizedNode(node.kind);

        for (const key in node) {
            if (clone.hasOwnProperty(key) || !node.hasOwnProperty(key)) {
                continue;
            }

            (<any>clone)[key] = (<any>node)[key];
        }

        if (flags !== undefined) {
            clone.flags = flags;
        }

        if (parent !== undefined) {
            clone.parent = parent;
        }

        return clone;
    }

    /**
     * Creates a deep clone of an EntityName, with new parent pointers.
     * @param node The EntityName to clone.
     * @param parent The parent for the cloned node.
     */
    export function cloneEntityName(node: EntityName, parent?: Node): EntityName {
        const clone = cloneNode(node, node, node.flags, parent);
        if (isQualifiedName(clone)) {
            const { left, right } = clone;
            clone.left = cloneEntityName(left, clone);
            clone.right = cloneNode(right, right, right.flags, parent);
        }

        return clone;
    }

    export function isQualifiedName(node: Node): node is QualifiedName {
        return node.kind === TokenType.QualifiedName;
    }

    export function nodeIsSynthesized(node: Node): boolean {
        return node.pos === -1;
    }

    export function createSynthesizedNode(kind: TokenType, startsOnNewLine?: boolean): Node {
        const node = <SynthesizedNode>createNode(kind, /* pos */ -1, /* end */ -1);
        node.startsOnNewLine = startsOnNewLine;
        return node;
    }

    export function createSynthesizedNodeArray(): NodeArray<any> {
        const array = <NodeArray<any>>[];
        array.pos = -1;
        array.end = -1;
        return array;
    }

    export function createDiagnosticCollection(): DiagnosticCollection {
        let nonFileDiagnostics: Diagnostic[] = [];
        const fileDiagnostics: Map<Diagnostic[]> = {};

        let diagnosticsModified = false;
        let modificationCount = 0;

        return {
            add,
            getGlobalDiagnostics,
            getDiagnostics,
            getModificationCount,
            reattachFileDiagnostics
        };

        function getModificationCount() {
            return modificationCount;
        }

        function reattachFileDiagnostics(newFile: SourceFile): void {
            if (!hasProperty(fileDiagnostics, newFile.fileName)) {
                return;
            }

            for (const diagnostic of fileDiagnostics[newFile.fileName]) {
                diagnostic.file = newFile;
            }
        }

        function add(diagnostic: Diagnostic): void {
            let diagnostics: Diagnostic[];
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

        function getGlobalDiagnostics(): Diagnostic[] {
            sortAndDeduplicate();
            return nonFileDiagnostics;
        }

        function getDiagnostics(fileName?: string): Diagnostic[] {
            sortAndDeduplicate();
            if (fileName) {
                return fileDiagnostics[fileName] || [];
            }

            const allDiagnostics: Diagnostic[] = [];
            function pushDiagnostic(d: Diagnostic) {
                allDiagnostics.push(d);
            }

            forEach(nonFileDiagnostics, pushDiagnostic);

            for (const key in fileDiagnostics) {
                if (hasProperty(fileDiagnostics, key)) {
                    forEach(fileDiagnostics[key], pushDiagnostic);
                }
            }

            return sortAndDeduplicateDiagnostics(allDiagnostics);
        }

        function sortAndDeduplicate() {
            if (!diagnosticsModified) {
                return;
            }

            diagnosticsModified = false;
            nonFileDiagnostics = sortAndDeduplicateDiagnostics(nonFileDiagnostics);

            for (const key in fileDiagnostics) {
                if (hasProperty(fileDiagnostics, key)) {
                    fileDiagnostics[key] = sortAndDeduplicateDiagnostics(fileDiagnostics[key]);
                }
            }
        }
    }

    // This consists of the first 19 unprintable ASCII characters, canonical escapes, lineSeparator,
    // paragraphSeparator, and nextLine. The latter three are just desirable to suppress new lines in
    // the language service. These characters should be escaped when printing, and if any characters are added,
    // the map below must be updated. Note that this regexp *does not* include the 'delete' character.
    // There is no reason for this other than that JSON.stringify does not handle it either.
    const escapedCharsRegExp = /[\\\"\u0000-\u001f\t\v\f\b\r\n\u2028\u2029\u0085]/g;
    const escapedCharsMap: Map<string> = {
        "\0": "\\0",
        "\t": "\\t",
        "\v": "\\v",
        "\f": "\\f",
        "\b": "\\b",
        "\r": "\\r",
        "\n": "\\n",
        "\\": "\\\\",
        "\"": "\\\"",
        "\u2028": "\\u2028", // lineSeparator
        "\u2029": "\\u2029", // paragraphSeparator
        "\u0085": "\\u0085"  // nextLine
    };


    /**
     * Based heavily on the abstract 'Quote'/'QuoteJSONString' operation from ECMA-262 (24.3.2.2),
     * but augmented for a few select characters (e.g. lineSeparator, paragraphSeparator, nextLine)
     * Note that this doesn't actually wrap the input in double quotes.
     */
    export function escapeString(s: string): string {
        s = escapedCharsRegExp.test(s) ? s.replace(escapedCharsRegExp, getReplacement) : s;

        return s;

        function getReplacement(c: string) {
            return escapedCharsMap[c] || get16BitUnicodeEscapeSequence(c.charCodeAt(0));
        }
    }

    export function isIntrinsicJsxName(name: string) {
        const ch = name.substr(0, 1);
        return ch.toLowerCase() === ch;
    }

    function get16BitUnicodeEscapeSequence(charCode: number): string {
        const hexCharCode = charCode.toString(16).toUpperCase();
        const paddedHexCode = ("0000" + hexCharCode).slice(-4);
        return "\\u" + paddedHexCode;
    }

    const nonAsciiCharacters = /[^\u0000-\u007F]/g;
    export function escapeNonAsciiCharacters(s: string): string {
        // Replace non-ASCII characters with '\uNNNN' escapes if any exist.
        // Otherwise just return the original string.
        return nonAsciiCharacters.test(s) ?
            s.replace(nonAsciiCharacters, c => get16BitUnicodeEscapeSequence(c.charCodeAt(0))) :
            s;
    }

    export interface EmitTextWriter {
        write(s: string): void;
        writeTextOfNode(text: string, node: Node): void;
        writeLine(): void;
        increaseIndent(): void;
        decreaseIndent(): void;
        getText(): string;
        rawWrite(s: string): void;
        writeLiteral(s: string): void;
        getTextPos(): number;
        getLine(): number;
        getColumn(): number;
        getIndent(): number;
        reset(): void;
    }

    const indentStrings: string[] = ["", "    "];
    export function getIndentString(level: number) {
        if (indentStrings[level] === undefined) {
            indentStrings[level] = getIndentString(level - 1) + indentStrings[1];
        }
        return indentStrings[level];
    }

    export function getIndentSize() {
        return indentStrings[1].length;
    }

    export function createTextWriter(newLine: String): EmitTextWriter {
        let output: string;
        let indent: number;
        let lineStart: boolean;
        let lineCount: number;
        let linePos: number;

        function write(s: string) {
            if (s && s.length) {
                if (lineStart) {
                    output += getIndentString(indent);
                    lineStart = false;
                }
                output += s;
            }
        }

        function reset(): void {
            output = "";
            indent = 0;
            lineStart = true;
            lineCount = 0;
            linePos = 0;
        }

        function rawWrite(s: string) {
            if (s !== undefined) {
                if (lineStart) {
                    lineStart = false;
                }
                output += s;
            }
        }

        function writeLiteral(s: string) {
            if (s && s.length) {
                write(s);
                const lineStartsOfS = computeLineStarts(s);
                if (lineStartsOfS.length > 1) {
                    lineCount = lineCount + lineStartsOfS.length - 1;
                    linePos = output.length - s.length + lastOrUndefined(lineStartsOfS);
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

        function writeTextOfNode(text: string, node: Node) {
            write(getTextOfNodeFromSourceText(text, node));
        }

        reset();

        return {
            write,
            rawWrite,
            writeTextOfNode,
            writeLiteral,
            writeLine,
            increaseIndent: () => { indent++; },
            decreaseIndent: () => { indent--; },
            getIndent: () => indent,
            getTextPos: () => output.length,
            getLine: () => lineCount + 1,
            getColumn: () => lineStart ? indent * getIndentSize() + 1 : output.length - linePos + 1,
            getText: () => output,
            reset
        };
    }

    /**
     * Resolves a local path to a path which is absolute to the base of the emit
     */
    export function getExternalModuleNameFromPath(host: EmitHost, fileName: string): string {
        const getCanonicalFileName = (f: string) => host.getCanonicalFileName(f);
        const dir = toPath(host.getCommonSourceDirectory(), host.getCurrentDirectory(), getCanonicalFileName);
        const filePath = getNormalizedAbsolutePath(fileName, host.getCurrentDirectory());
        const relativePath = getRelativePathToDirectoryOrUrl(dir, filePath, dir, getCanonicalFileName, /*isAbsolutePathAnUrl*/ false);
        return removeFileExtension(relativePath);
    }

    export function getOwnEmitOutputFilePath(sourceFile: SourceFile, host: EmitHost, extension: string) {
        const compilerOptions = host.getCompilerOptions();
        let emitOutputFilePathWithoutExtension: string;
        if (compilerOptions.outDir) {
            emitOutputFilePathWithoutExtension = removeFileExtension(getSourceFilePathInNewDir(sourceFile, host, compilerOptions.outDir));
        }
        else {
            emitOutputFilePathWithoutExtension = removeFileExtension(sourceFile.fileName);
        }

        return emitOutputFilePathWithoutExtension + extension;
    }

    export function getDeclarationEmitOutputFilePath(sourceFile: SourceFile, host: EmitHost) {
        const options = host.getCompilerOptions();
        const outputDir = options.declarationDir || options.outDir; // Prefer declaration folder if specified

        if (options.declaration) {
            const path = outputDir
                ? getSourceFilePathInNewDir(sourceFile, host, outputDir)
                : sourceFile.fileName;
            return removeFileExtension(path) + ".d.ts";
        }
    }

    export function getEmitScriptTarget(compilerOptions: CompilerOptions) {
        return compilerOptions.target || ScriptTarget.ES3;
    }

    export function getEmitModuleKind(compilerOptions: CompilerOptions) {
        return typeof compilerOptions.module === "number" ?
            compilerOptions.module :
            getEmitScriptTarget(compilerOptions) === ScriptTarget.ES6 ? ModuleKind.ES6 : ModuleKind.CommonJS;
    }

    export interface EmitFileNames {
        jsFilePath: string;
        sourceMapFilePath: string;
        declarationFilePath: string;
    }

    export function forEachExpectedEmitFile(host: EmitHost,
        action: (emitFileNames: EmitFileNames, sourceFiles: SourceFile[], isBundledEmit: boolean) => void,
        targetSourceFile?: SourceFile) {
        const options = host.getCompilerOptions();
        // Emit on each source file
        if (options.outFile || options.out) {
            onBundledEmit(host);
        }
        else {
            const sourceFiles = targetSourceFile === undefined ? host.getSourceFiles() : [targetSourceFile];
            for (const sourceFile of sourceFiles) {
                // Don't emit if source file is a declaration file, or was located under node_modules
                if (!isDeclarationFile(sourceFile) && !host.isSourceFileFromExternalLibrary(sourceFile)) {
                    onSingleFileEmit(host, sourceFile);
                }
            }
        }

        function onSingleFileEmit(host: EmitHost, sourceFile: SourceFile) {
            // JavaScript files are always LanguageVariant.JSX, as JSX syntax is allowed in .js files also.
            // So for JavaScript files, '.jsx' is only emitted if the input was '.jsx', and JsxEmit.Preserve.
            // For TypeScript, the only time to emit with a '.jsx' extension, is on JSX input, and JsxEmit.Preserve
            let extension = ".js";
            if (options.jsx === JsxEmit.Preserve) {
                if (isSourceFileJavaScript(sourceFile)) {
                    if (fileExtensionIs(sourceFile.fileName, ".jsx")) {
                        extension = ".jsx";
                    }
                }
                else if (sourceFile.languageVariant === LanguageVariant.JSX) {
                    // TypeScript source file preserving JSX syntax
                    extension = ".jsx";
                }
            }
            const jsFilePath = getOwnEmitOutputFilePath(sourceFile, host, extension);
            const emitFileNames: EmitFileNames = {
                jsFilePath,
                sourceMapFilePath: getSourceMapFilePath(jsFilePath, options),
                declarationFilePath: !isSourceFileJavaScript(sourceFile) ? getDeclarationEmitOutputFilePath(sourceFile, host) : undefined
            };
            action(emitFileNames, [sourceFile], /*isBundledEmit*/false);
        }

        function onBundledEmit(host: EmitHost) {
            // Can emit only sources that are not declaration file and are either non module code or module with
            // --module or --target es6 specified. Files included by searching under node_modules are also not emitted.
            const bundledSources = filter(host.getSourceFiles(),
                sourceFile => !isDeclarationFile(sourceFile) &&
                              !host.isSourceFileFromExternalLibrary(sourceFile) &&
                              (!isExternalModule(sourceFile) ||
                               !!getEmitModuleKind(options)));
            if (bundledSources.length) {
                const jsFilePath = options.outFile || options.out;
                const emitFileNames: EmitFileNames = {
                    jsFilePath,
                    sourceMapFilePath: getSourceMapFilePath(jsFilePath, options),
                    declarationFilePath: options.declaration ? removeFileExtension(jsFilePath) + ".d.ts" : undefined
                };
                action(emitFileNames, bundledSources, /*isBundledEmit*/true);
            }
        }

        function getSourceMapFilePath(jsFilePath: string, options: CompilerOptions) {
            return options.sourceMap ? jsFilePath + ".map" : undefined;
        }
    }

    export function getSourceFilePathInNewDir(sourceFile: SourceFile, host: EmitHost, newDirPath: string) {
        let sourceFilePath = getNormalizedAbsolutePath(sourceFile.fileName, host.getCurrentDirectory());
        const commonSourceDirectory = host.getCommonSourceDirectory();
        const isSourceFileInCommonSourceDirectory = host.getCanonicalFileName(sourceFilePath).indexOf(host.getCanonicalFileName(commonSourceDirectory)) === 0;
        sourceFilePath = isSourceFileInCommonSourceDirectory ? sourceFilePath.substring(commonSourceDirectory.length) : sourceFilePath;
        return combinePaths(newDirPath, sourceFilePath);
    }

    export function writeFile(host: EmitHost, diagnostics: DiagnosticCollection, fileName: string, data: string, writeByteOrderMark: boolean, sourceFiles?: SourceFile[]) {
        host.writeFile(fileName, data, writeByteOrderMark, hostErrorMessage => {
            diagnostics.add(createCompilerDiagnostic(Diagnostics.Could_not_write_file_0_Colon_1, fileName, hostErrorMessage));
        }, sourceFiles);
    }

    export function getLineOfLocalPosition(currentSourceFile: SourceFile, pos: number) {
        return getLineAndCharacterOfPosition(currentSourceFile, pos).line;
    }

    export function getLineOfLocalPositionFromLineMap(lineMap: number[], pos: number) {
        return computeLineAndCharacterOfPosition(lineMap, pos).line;
    }

    export function getFirstConstructorWithBody(node: ClassLikeDeclaration): ConstructorDeclaration {
        return forEach(node.members, member => {
            if (member.kind === TokenType.Constructor && nodeIsPresent((<ConstructorDeclaration>member).body)) {
                return <ConstructorDeclaration>member;
            }
        });
    }

    export function getSetAccessorTypeAnnotationNode(accessor: AccessorDeclaration): TypeNode {
        if (accessor && accessor.parameters.length > 0) {
            const hasThis = accessor.parameters.length === 2 &&
                accessor.parameters[0].name.kind === TokenType.Identifier &&
                (accessor.parameters[0].name as Identifier).originalKeywordKind === TokenType.this;
            return accessor.parameters[hasThis ? 1 : 0].type;
        }
    }

    export function getAllAccessorDeclarations(declarations: NodeArray<Declaration>, accessor: AccessorDeclaration) {
        let firstAccessor: AccessorDeclaration;
        let secondAccessor: AccessorDeclaration;
        let getAccessor: AccessorDeclaration;
        let setAccessor: AccessorDeclaration;
        if (hasDynamicName(accessor)) {
            firstAccessor = accessor;
            if (accessor.kind === TokenType.GetAccessor) {
                getAccessor = accessor;
            }
            else if (accessor.kind === TokenType.SetAccessor) {
                setAccessor = accessor;
            }
            else {
                Debug.fail("Accessor has wrong kind");
            }
        }
        else {
            forEach(declarations, (member: Declaration) => {
                if ((member.kind === TokenType.GetAccessor || member.kind === TokenType.SetAccessor)
                    && (member.flags & NodeFlags.Static) === (accessor.flags & NodeFlags.Static)) {
                    const memberName = getPropertyNameForPropertyNameNode(member.name);
                    const accessorName = getPropertyNameForPropertyNameNode(accessor.name);
                    if (memberName === accessorName) {
                        if (!firstAccessor) {
                            firstAccessor = <AccessorDeclaration>member;
                        }
                        else if (!secondAccessor) {
                            secondAccessor = <AccessorDeclaration>member;
                        }

                        if (member.kind === TokenType.GetAccessor && !getAccessor) {
                            getAccessor = <AccessorDeclaration>member;
                        }

                        if (member.kind === TokenType.SetAccessor && !setAccessor) {
                            setAccessor = <AccessorDeclaration>member;
                        }
                    }
                }
            });
        }
        return {
            firstAccessor,
            secondAccessor,
            getAccessor,
            setAccessor
        };
    }

    export function emitNewLineBeforeLeadingComments(lineMap: number[], writer: EmitTextWriter, node: TextRange, leadingComments: CommentRange[]) {
        // If the leading comments start on different line than the start of node, write new line
        if (leadingComments && leadingComments.length && node.pos !== leadingComments[0].pos &&
            getLineOfLocalPositionFromLineMap(lineMap, node.pos) !== getLineOfLocalPositionFromLineMap(lineMap, leadingComments[0].pos)) {
            writer.writeLine();
        }
    }

    export function emitComments(text: string, lineMap: number[], writer: EmitTextWriter, comments: CommentRange[], trailingSeparator: boolean, newLine: string,
        writeComment: (text: string, lineMap: number[], writer: EmitTextWriter, comment: CommentRange, newLine: string) => void) {
        let emitLeadingSpace = !trailingSeparator;
        forEach(comments, comment => {
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

    /**
     * Detached comment is a comment at the top of file or function body that is separated from
     * the next statement by space.
     */
    export function emitDetachedComments(text: string, lineMap: number[], writer: EmitTextWriter,
        writeComment: (text: string, lineMap: number[], writer: EmitTextWriter, comment: CommentRange, newLine: string) => void,
        node: TextRange, newLine: string, removeComments: boolean) {
        let leadingComments: CommentRange[];
        let currentDetachedCommentInfo: {nodePos: number, detachedCommentEndPos: number};
        if (removeComments) {
            // removeComments is true, only reserve pinned comment at the top of file
            // For example:
            //      /*! Pinned Comment */
            //
            //      var x = 10;
            if (node.pos === 0) {
                leadingComments = filter(getLeadingCommentRanges(text, node.pos), isPinnedComment);
            }
        }
        else {
            // removeComments is false, just get detached as normal and bypass the process to filter comment
            leadingComments = getLeadingCommentRanges(text, node.pos);
        }

        if (leadingComments) {
            const detachedComments: CommentRange[] = [];
            let lastComment: CommentRange;

            for (const comment of leadingComments) {
                if (lastComment) {
                    const lastCommentLine = getLineOfLocalPositionFromLineMap(lineMap, lastComment.end);
                    const commentLine = getLineOfLocalPositionFromLineMap(lineMap, comment.pos);

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
                const lastCommentLine = getLineOfLocalPositionFromLineMap(lineMap, lastOrUndefined(detachedComments).end);
                const nodeLine = getLineOfLocalPositionFromLineMap(lineMap, skipTrivia(text, node.pos));
                if (nodeLine >= lastCommentLine + 2) {
                    // Valid detachedComments
                    emitNewLineBeforeLeadingComments(lineMap, writer, node, leadingComments);
                    emitComments(text, lineMap, writer, detachedComments, /*trailingSeparator*/ true, newLine, writeComment);
                    currentDetachedCommentInfo = { nodePos: node.pos, detachedCommentEndPos: lastOrUndefined(detachedComments).end };
                }
            }
        }

        return currentDetachedCommentInfo;

        function isPinnedComment(comment: CommentRange) {
            return text.charCodeAt(comment.pos + 1) === CharCode.asterisk &&
                text.charCodeAt(comment.pos + 2) === CharCode.exclamation;
        }

    }

    export function writeCommentRange(text: string, lineMap: number[], writer: EmitTextWriter, comment: CommentRange, newLine: string) {
        if (text.charCodeAt(comment.pos + 1) === CharCode.asterisk) {
            const firstCommentLineAndCharacter = computeLineAndCharacterOfPosition(lineMap, comment.pos);
            const lineCount = lineMap.length;
            let firstCommentLineIndent: number;
            for (let pos = comment.pos, currentLine = firstCommentLineAndCharacter.line; pos < comment.end; currentLine++) {
                const nextLineStart = (currentLine + 1) === lineCount
                    ? text.length + 1
                    : lineMap[currentLine + 1];

                if (pos !== comment.pos) {
                    // If we are not emitting first line, we need to write the spaces to adjust the alignment
                    if (firstCommentLineIndent === undefined) {
                        firstCommentLineIndent = calculateIndent(text, lineMap[firstCommentLineAndCharacter.line], comment.pos);
                    }

                    // These are number of spaces writer is going to write at current indent
                    const currentWriterIndentSpacing = writer.getIndent() * getIndentSize();

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
                    const spacesToEmit = currentWriterIndentSpacing - firstCommentLineIndent + calculateIndent(text, pos, nextLineStart);
                    if (spacesToEmit > 0) {
                        let numberOfSingleSpacesToEmit = spacesToEmit % getIndentSize();
                        const indentSizeSpaceString = getIndentString((spacesToEmit - numberOfSingleSpacesToEmit) / getIndentSize());

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

    function writeTrimmedCurrentLine(text: string, comment: CommentRange, writer: EmitTextWriter, newLine: string, pos: number, nextLineStart: number) {
        const end = Math.min(comment.end, nextLineStart - 1);
        const currentLineText = text.substring(pos, end).replace(/^\s+|\s+$/g, "");
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

    function calculateIndent(text: string, pos: number, end: number) {
        let currentLineIndent = 0;
        for (; pos < end && isNoBreakWhiteSpace(text.charCodeAt(pos)); pos++) {
            if (text.charCodeAt(pos) === CharCode.horizontalTab) {
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

    export function modifierToFlag(token: TokenType): NodeFlags {
        switch (token) {
            case TokenType.static: return NodeFlags.Static;
            case TokenType.public: return NodeFlags.Public;
            case TokenType.protected: return NodeFlags.Protected;
            case TokenType.private: return NodeFlags.Private;
            case TokenType.abstract: return NodeFlags.Abstract;
            case TokenType.export: return NodeFlags.Export;
            case TokenType.declare: return NodeFlags.Ambient;
            case TokenType.const: return NodeFlags.Const;
            case TokenType.default: return NodeFlags.Default;
            case TokenType.async: return NodeFlags.Async;
            case TokenType.readonly: return NodeFlags.Readonly;
        }
        return 0;
    }

    export function isLeftHandSideExpression(expr: Expression): boolean {
        if (expr) {
            switch (expr.kind) {
                case TokenType.PropertyAccessExpression:
                case TokenType.ElementAccessExpression:
                case TokenType.NewExpression:
                case TokenType.CallExpression:
                case TokenType.NonNullExpression:
                case TokenType.JsxElement:
                case TokenType.JsxSelfClosingElement:
                case TokenType.TaggedTemplateExpression:
                case TokenType.ArrayLiteralExpression:
                case TokenType.ParenthesizedExpression:
                case TokenType.ObjectLiteralExpression:
                case TokenType.ClassExpression:
                case TokenType.FunctionExpression:
                case TokenType.Identifier:
                case TokenType.RegularExpressionLiteral:
                case TokenType.NumericLiteral:
                case TokenType.StringLiteral:
                case TokenType.NoSubstitutionTemplateLiteral:
                case TokenType.TemplateExpression:
                case TokenType.false:
                case TokenType.null:
                case TokenType.this:
                case TokenType.true:
                case TokenType.super:
                    return true;
            }
        }

        return false;
    }

    export function isAssignmentOperator(token: TokenType): boolean {
        return token >= TokenType.FirstAssignment && token <= TokenType.LastAssignment;
    }

    export function isExpressionWithTypeArgumentsInClassExtendsClause(node: Node): boolean {
        return node.kind === TokenType.ExpressionWithTypeArguments &&
            (<HeritageClause>node.parent).token === TokenType.extends &&
            isClassLike(node.parent.parent);
    }

    // Returns false if this heritage clause element's expression contains something unsupported
    // (i.e. not a name or dotted name).
    export function isSupportedExpressionWithTypeArguments(node: ExpressionWithTypeArguments): boolean {
        return isSupportedExpressionWithTypeArgumentsRest(node.expression);
    }

    function isSupportedExpressionWithTypeArgumentsRest(node: Expression): boolean {
        if (node.kind === TokenType.Identifier) {
            return true;
        }
        else if (isPropertyAccessExpression(node)) {
            return isSupportedExpressionWithTypeArgumentsRest(node.expression);
        }
        else {
            return false;
        }
    }

    export function isRightSideOfQualifiedNameOrPropertyAccess(node: Node) {
        return (node.parent.kind === TokenType.QualifiedName && (<QualifiedName>node.parent).right === node) ||
            (node.parent.kind === TokenType.PropertyAccessExpression && (<PropertyAccessExpression>node.parent).name === node);
    }

    export function isEmptyObjectLiteralOrArrayLiteral(expression: Node): boolean {
        const kind = expression.kind;
        if (kind === TokenType.ObjectLiteralExpression) {
            return (<ObjectLiteralExpression>expression).properties.length === 0;
        }
        if (kind === TokenType.ArrayLiteralExpression) {
            return (<ArrayLiteralExpression>expression).elements.length === 0;
        }
        return false;
    }

    export function getLocalSymbolForExportDefault(symbol: Symbol) {
        return symbol && symbol.valueDeclaration && (symbol.valueDeclaration.flags & NodeFlags.Default) ? symbol.valueDeclaration.localSymbol : undefined;
    }

    export function hasJavaScriptFileExtension(fileName: string) {
        return forEach(supportedJavascriptExtensions, extension => fileExtensionIs(fileName, extension));
    }

    export function hasTypeScriptFileExtension(fileName: string) {
        return forEach(supportedTypeScriptExtensions, extension => fileExtensionIs(fileName, extension));
    }

    /**
     * Replace each instance of non-ascii characters by one, two, three, or four escape sequences
     * representing the UTF-8 encoding of the character, and return the expanded char code list.
     */
    function getExpandedCharCodes(input: string): number[] {
        const output: number[] = [];
        const length = input.length;

        for (let i = 0; i < length; i++) {
            const charCode = input.charCodeAt(i);

            // handel utf8
            if (charCode < 0x80) {
                output.push(charCode);
            }
            else if (charCode < 0x800) {
                output.push((charCode >> 6) | 0B11000000);
                output.push((charCode & 0B00111111) | 0B10000000);
            }
            else if (charCode < 0x10000) {
                output.push((charCode >> 12) | 0B11100000);
                output.push(((charCode >> 6) & 0B00111111) | 0B10000000);
                output.push((charCode & 0B00111111) | 0B10000000);
            }
            else if (charCode < 0x20000) {
                output.push((charCode >> 18) | 0B11110000);
                output.push(((charCode >> 12) & 0B00111111) | 0B10000000);
                output.push(((charCode >> 6) & 0B00111111) | 0B10000000);
                output.push((charCode & 0B00111111) | 0B10000000);
            }
            else {
                Debug.assert(false, "Unexpected code point");
            }
        }

        return output;
    }

    /**
     * Serialize an object graph into a JSON string. This is intended only for use on an acyclic graph
     * as the fallback implementation does not check for circular references by default.
     */
    export const stringify: (value: any) => string = typeof JSON !== "undefined" && JSON.stringify
        ? JSON.stringify
        : stringifyFallback;

    /**
     * Serialize an object graph into a JSON string.
     */
    function stringifyFallback(value: any): string {
        // JSON.stringify returns `undefined` here, instead of the string "undefined".
        return value === undefined ? undefined : stringifyValue(value);
    }

    function stringifyValue(value: any): string {
        return typeof value === "string" ? `"${escapeString(value)}"`
             : typeof value === "number" ? isFinite(value) ? String(value) : "null"
             : typeof value === "boolean" ? value ? "true" : "false"
             : typeof value === "object" && value ? isArray(value) ? cycleCheck(stringifyArray, value) : cycleCheck(stringifyObject, value)
             : /*fallback*/ "null";
    }

    function cycleCheck(cb: (value: any) => string, value: any) {
        Debug.assert(!value.hasOwnProperty("__cycle"), "Converting circular structure to JSON");
        value.__cycle = true;
        const result = cb(value);
        delete value.__cycle;
        return result;
    }

    function stringifyArray(value: any) {
        return `[${reduceLeft(value, stringifyElement, "")}]`;
    }

    function stringifyElement(memo: string, value: any) {
        return (memo ? memo + "," : memo) + stringifyValue(value);
    }

    function stringifyObject(value: any) {
        return `{${reduceProperties(value, stringifyProperty, "")}}`;
    }

    function stringifyProperty(memo: string, value: any, key: string) {
        return value === undefined || typeof value === "function" || key === "__cycle" ? memo
             : (memo ? memo + "," : memo) + `"${escapeString(key)}":${stringifyValue(value)}`;
    }

    const base64Digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    /**
     * Converts a string to a base-64 encoded ASCII string.
     */
    export function convertToBase64(input: string): string {
        let result = "";
        const charCodes = getExpandedCharCodes(input);
        let i = 0;
        const length = charCodes.length;
        let byte1: number, byte2: number, byte3: number, byte4: number;

        while (i < length) {
            // Convert every 6-bits in the input 3 character points
            // into a base64 digit
            byte1 = charCodes[i] >> 2;
            byte2 = (charCodes[i] & 0B00000011) << 4 | charCodes[i + 1] >> 4;
            byte3 = (charCodes[i + 1] & 0B00001111) << 2 | charCodes[i + 2] >> 6;
            byte4 = charCodes[i + 2] & 0B00111111;

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

    export function convertToRelativePath(absoluteOrRelativePath: string, basePath: string, getCanonicalFileName: (path: string) => string): string {
        return !isRootedDiskPath(absoluteOrRelativePath)
            ? absoluteOrRelativePath
            : getRelativePathToDirectoryOrUrl(basePath, absoluteOrRelativePath, basePath, getCanonicalFileName, /* isAbsolutePathAnUrl */ false);
    }

    const carriageReturnLineFeed = "\r\n";
    const lineFeed = "\n";
    export function getNewLineCharacter(options: CompilerOptions): string {
        if (options.newLine === NewLineKind.CarriageReturnLineFeed) {
            return carriageReturnLineFeed;
        }
        else if (options.newLine === NewLineKind.LineFeed) {
            return lineFeed;
        }
        else if (sys) {
            return sys.newLine;
        }
        return carriageReturnLineFeed;
    }

    export function isWatchSet(options: CompilerOptions) {
        // Firefox has Object.prototype.watch
        return options.watch && options.hasOwnProperty("watch");
    }
}

namespace ts {
    export function getDefaultLibFileName(options: CompilerOptions): string {
        return options.target === ScriptTarget.ES6 ? "lib.es6.d.ts" : "lib.d.ts";
    }

    export function textSpanEnd(span: TextSpan) {
        return span.start + span.length;
    }

    export function textSpanIsEmpty(span: TextSpan) {
        return span.length === 0;
    }

    export function textSpanContainsPosition(span: TextSpan, position: number) {
        return position >= span.start && position < textSpanEnd(span);
    }

    // Returns true if 'span' contains 'other'.
    export function textSpanContainsTextSpan(span: TextSpan, other: TextSpan) {
        return other.start >= span.start && textSpanEnd(other) <= textSpanEnd(span);
    }

    export function textSpanOverlapsWith(span: TextSpan, other: TextSpan) {
        const overlapStart = Math.max(span.start, other.start);
        const overlapEnd = Math.min(textSpanEnd(span), textSpanEnd(other));
        return overlapStart < overlapEnd;
    }

    export function textSpanOverlap(span1: TextSpan, span2: TextSpan) {
        const overlapStart = Math.max(span1.start, span2.start);
        const overlapEnd = Math.min(textSpanEnd(span1), textSpanEnd(span2));
        if (overlapStart < overlapEnd) {
            return createTextSpanFromBounds(overlapStart, overlapEnd);
        }
        return undefined;
    }

    export function textSpanIntersectsWithTextSpan(span: TextSpan, other: TextSpan) {
        return other.start <= textSpanEnd(span) && textSpanEnd(other) >= span.start;
    }

    export function textSpanIntersectsWith(span: TextSpan, start: number, length: number) {
        const end = start + length;
        return start <= textSpanEnd(span) && end >= span.start;
    }

    export function decodedTextSpanIntersectsWith(start1: number, length1: number, start2: number, length2: number) {
        const end1 = start1 + length1;
        const end2 = start2 + length2;
        return start2 <= end1 && end2 >= start1;
    }

    export function textSpanIntersectsWithPosition(span: TextSpan, position: number) {
        return position <= textSpanEnd(span) && position >= span.start;
    }

    export function textSpanIntersection(span1: TextSpan, span2: TextSpan) {
        const intersectStart = Math.max(span1.start, span2.start);
        const intersectEnd = Math.min(textSpanEnd(span1), textSpanEnd(span2));
        if (intersectStart <= intersectEnd) {
            return createTextSpanFromBounds(intersectStart, intersectEnd);
        }
        return undefined;
    }

    export function createTextSpan(start: number, length: number): TextSpan {
        if (start < 0) {
            throw new Error("start < 0");
        }
        if (length < 0) {
            throw new Error("length < 0");
        }

        return { start, length };
    }

    export function createTextSpanFromBounds(start: number, end: number) {
        return createTextSpan(start, end - start);
    }

    export function textChangeRangeNewSpan(range: TextChangeRange) {
        return createTextSpan(range.span.start, range.newLength);
    }

    export function textChangeRangeIsUnchanged(range: TextChangeRange) {
        return textSpanIsEmpty(range.span) && range.newLength === 0;
    }

    export function createTextChangeRange(span: TextSpan, newLength: number): TextChangeRange {
        if (newLength < 0) {
            throw new Error("newLength < 0");
        }

        return { span, newLength };
    }

    export let unchangedTextChangeRange = createTextChangeRange(createTextSpan(0, 0), 0);

    /**
     * Called to merge all the changes that occurred across several versions of a script snapshot
     * into a single change.  i.e. if a user keeps making successive edits to a script we will
     * have a text change from V1 to V2, V2 to V3, ..., Vn.
     *
     * This function will then merge those changes into a single change range valid between V1 and
     * Vn.
     */
    export function collapseTextChangeRangesAcrossMultipleVersions(changes: TextChangeRange[]): TextChangeRange {
        if (changes.length === 0) {
            return unchangedTextChangeRange;
        }

        if (changes.length === 1) {
            return changes[0];
        }

        // We change from talking about { { oldStart, oldLength }, newLength } to { oldStart, oldEnd, newEnd }
        // as it makes things much easier to reason about.
        const change0 = changes[0];

        let oldStartN = change0.span.start;
        let oldEndN = textSpanEnd(change0.span);
        let newEndN = oldStartN + change0.newLength;

        for (let i = 1; i < changes.length; i++) {
            const nextChange = changes[i];

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

            const oldStart1 = oldStartN;
            const oldEnd1 = oldEndN;
            const newEnd1 = newEndN;

            const oldStart2 = nextChange.span.start;
            const oldEnd2 = textSpanEnd(nextChange.span);
            const newEnd2 = oldStart2 + nextChange.newLength;

            oldStartN = Math.min(oldStart1, oldStart2);
            oldEndN = Math.max(oldEnd1, oldEnd1 + (oldEnd2 - newEnd1));
            newEndN = Math.max(newEnd2, newEnd2 + (newEnd1 - oldEnd2));
        }

        return createTextChangeRange(createTextSpanFromBounds(oldStartN, oldEndN), /*newLength:*/ newEndN - oldStartN);
    }

    export function getTypeParameterOwner(d: Declaration): Declaration {
        if (d && d.kind === TokenType.TypeParameter) {
            for (let current: Node = d; current; current = current.parent) {
                if (isFunctionLike(current) || isClassLike(current) || current.kind === TokenType.InterfaceDeclaration) {
                    return <Declaration>current;
                }
            }
        }
    }

    export function isParameterPropertyDeclaration(node: ParameterDeclaration): boolean {
        return node.flags & NodeFlags.ParameterPropertyModifier && node.parent.kind === TokenType.Constructor && isClassLike(node.parent.parent);
    }

    export function startsWith(str: string, prefix: string): boolean {
        return str.lastIndexOf(prefix, 0) === 0;
    }

    export function endsWith(str: string, suffix: string): boolean {
        const expectedPos = str.length - suffix.length;
        return str.indexOf(suffix, expectedPos) === expectedPos;
    }
}
