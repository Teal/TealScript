/// <reference path="utilities.ts"/>
/// <reference path="scanner.ts"/>

namespace ts {
    /* @internal */ export let parseTime = 0;

    let NodeConstructor: new (kind: TokenType, pos: number, end: number) => Node;
    let SourceFileConstructor: new (kind: TokenType, pos: number, end: number) => Node;

    export function createNode(kind: TokenType, pos?: number, end?: number): Node {
        if (kind === TokenType.SourceFile) {
            return new (SourceFileConstructor || (SourceFileConstructor = objectAllocator.getSourceFileConstructor()))(kind, pos, end);
        }
        else {
            return new (NodeConstructor || (NodeConstructor = objectAllocator.getNodeConstructor()))(kind, pos, end);
        }
    }

    function visitNode<T>(cbNode: (node: Node) => T, node: Node): T {
        if (node) {
            return cbNode(node);
        }
    }

    function visitNodeArray<T>(cbNodes: (nodes: Node[]) => T, nodes: Node[]) {
        if (nodes) {
            return cbNodes(nodes);
        }
    }

    function visitEachNode<T>(cbNode: (node: Node) => T, nodes: Node[]) {
        if (nodes) {
            for (const node of nodes) {
                const result = cbNode(node);
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
    export function forEachChild<T>(node: Node, cbNode: (node: Node) => T, cbNodeArray?: (nodes: Node[]) => T): T {
        if (!node) {
            return;
        }
        // The visitXXX functions could be written as local functions that close over the cbNode and cbNodeArray
        // callback parameters, but that causes a closure allocation for each invocation with noticeable effects
        // on performance.
        const visitNodes: (cb: (node: Node | Node[]) => T, nodes: Node[]) => T = cbNodeArray ? visitNodeArray : visitEachNode;
        const cbNodes = cbNodeArray || cbNode;
        switch (node.kind) {
            case TokenType.QualifiedName:
                return visitNode(cbNode, (<QualifiedName>node).left) ||
                    visitNode(cbNode, (<QualifiedName>node).right);
            case TokenType.TypeParameter:
                return visitNode(cbNode, (<TypeParameterDeclaration>node).name) ||
                    visitNode(cbNode, (<TypeParameterDeclaration>node).constraint) ||
                    visitNode(cbNode, (<TypeParameterDeclaration>node).expression);
            case TokenType.ShorthandPropertyAssignment:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, (<ShorthandPropertyAssignment>node).name) ||
                    visitNode(cbNode, (<ShorthandPropertyAssignment>node).questionToken) ||
                    visitNode(cbNode, (<ShorthandPropertyAssignment>node).equalsToken) ||
                    visitNode(cbNode, (<ShorthandPropertyAssignment>node).objectAssignmentInitializer);
            case TokenType.Parameter:
            case TokenType.PropertyDeclaration:
            case TokenType.PropertySignature:
            case TokenType.PropertyAssignment:
            case TokenType.VariableDeclaration:
            case TokenType.BindingElement:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, (<VariableLikeDeclaration>node).propertyName) ||
                    visitNode(cbNode, (<VariableLikeDeclaration>node).dotDotDotToken) ||
                    visitNode(cbNode, (<VariableLikeDeclaration>node).name) ||
                    visitNode(cbNode, (<VariableLikeDeclaration>node).questionToken) ||
                    visitNode(cbNode, (<VariableLikeDeclaration>node).type) ||
                    visitNode(cbNode, (<VariableLikeDeclaration>node).initializer);
            case TokenType.FunctionType:
            case TokenType.ConstructorType:
            case TokenType.CallSignature:
            case TokenType.ConstructSignature:
            case TokenType.IndexSignature:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNodes(cbNodes, (<SignatureDeclaration>node).typeParameters) ||
                    visitNodes(cbNodes, (<SignatureDeclaration>node).parameters) ||
                    visitNode(cbNode, (<SignatureDeclaration>node).type);
            case TokenType.MethodDeclaration:
            case TokenType.MethodSignature:
            case TokenType.Constructor:
            case TokenType.GetAccessor:
            case TokenType.SetAccessor:
            case TokenType.FunctionExpression:
            case TokenType.FunctionDeclaration:
            case TokenType.ArrowFunction:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, (<FunctionLikeDeclaration>node).asteriskToken) ||
                    visitNode(cbNode, (<FunctionLikeDeclaration>node).name) ||
                    visitNode(cbNode, (<FunctionLikeDeclaration>node).questionToken) ||
                    visitNodes(cbNodes, (<FunctionLikeDeclaration>node).typeParameters) ||
                    visitNodes(cbNodes, (<FunctionLikeDeclaration>node).parameters) ||
                    visitNode(cbNode, (<FunctionLikeDeclaration>node).type) ||
                    visitNode(cbNode, (<ArrowFunction>node).equalsGreaterThanToken) ||
                    visitNode(cbNode, (<FunctionLikeDeclaration>node).body);
            case TokenType.TypeReference:
                return visitNode(cbNode, (<TypeReferenceNode>node).typeName) ||
                    visitNodes(cbNodes, (<TypeReferenceNode>node).typeArguments);
            case TokenType.TypePredicate:
                return visitNode(cbNode, (<TypePredicateNode>node).parameterName) ||
                    visitNode(cbNode, (<TypePredicateNode>node).type);
            case TokenType.TypeQuery:
                return visitNode(cbNode, (<TypeQueryNode>node).exprName);
            case TokenType.TypeLiteral:
                return visitNodes(cbNodes, (<TypeLiteralNode>node).members);
            case TokenType.ArrayType:
                return visitNode(cbNode, (<ArrayTypeNode>node).elementType);
            case TokenType.TupleType:
                return visitNodes(cbNodes, (<TupleTypeNode>node).elementTypes);
            case TokenType.UnionType:
            case TokenType.IntersectionType:
                return visitNodes(cbNodes, (<UnionOrIntersectionTypeNode>node).types);
            case TokenType.ParenthesizedType:
                return visitNode(cbNode, (<ParenthesizedTypeNode>node).type);
            case TokenType.ObjectBindingPattern:
            case TokenType.ArrayBindingPattern:
                return visitNodes(cbNodes, (<BindingPattern>node).elements);
            case TokenType.ArrayLiteralExpression:
                return visitNodes(cbNodes, (<ArrayLiteralExpression>node).elements);
            case TokenType.ObjectLiteralExpression:
                return visitNodes(cbNodes, (<ObjectLiteralExpression>node).properties);
            case TokenType.PropertyAccessExpression:
                return visitNode(cbNode, (<PropertyAccessExpression>node).expression) ||
                    visitNode(cbNode, (<PropertyAccessExpression>node).name);
            case TokenType.ElementAccessExpression:
                return visitNode(cbNode, (<ElementAccessExpression>node).expression) ||
                    visitNode(cbNode, (<ElementAccessExpression>node).argumentExpression);
            case TokenType.CallExpression:
            case TokenType.NewExpression:
                return visitNode(cbNode, (<CallExpression>node).expression) ||
                    visitNodes(cbNodes, (<CallExpression>node).typeArguments) ||
                    visitNodes(cbNodes, (<CallExpression>node).arguments);
            case TokenType.TaggedTemplateExpression:
                return visitNode(cbNode, (<TaggedTemplateExpression>node).tag) ||
                    visitNode(cbNode, (<TaggedTemplateExpression>node).template);
            case TokenType.TypeAssertionExpression:
                return visitNode(cbNode, (<TypeAssertion>node).type) ||
                    visitNode(cbNode, (<TypeAssertion>node).expression);
            case TokenType.ParenthesizedExpression:
                return visitNode(cbNode, (<ParenthesizedExpression>node).expression);
            case TokenType.DeleteExpression:
                return visitNode(cbNode, (<DeleteExpression>node).expression);
            case TokenType.TypeOfExpression:
                return visitNode(cbNode, (<TypeOfExpression>node).expression);
            case TokenType.VoidExpression:
                return visitNode(cbNode, (<VoidExpression>node).expression);
            case TokenType.PrefixUnaryExpression:
                return visitNode(cbNode, (<PrefixUnaryExpression>node).operand);
            case TokenType.YieldExpression:
                return visitNode(cbNode, (<YieldExpression>node).asteriskToken) ||
                    visitNode(cbNode, (<YieldExpression>node).expression);
            case TokenType.AwaitExpression:
                return visitNode(cbNode, (<AwaitExpression>node).expression);
            case TokenType.PostfixUnaryExpression:
                return visitNode(cbNode, (<PostfixUnaryExpression>node).operand);
            case TokenType.BinaryExpression:
                return visitNode(cbNode, (<BinaryExpression>node).left) ||
                    visitNode(cbNode, (<BinaryExpression>node).operatorToken) ||
                    visitNode(cbNode, (<BinaryExpression>node).right);
            case TokenType.AsExpression:
                return visitNode(cbNode, (<AsExpression>node).expression) ||
                    visitNode(cbNode, (<AsExpression>node).type);
            case TokenType.NonNullExpression:
                return visitNode(cbNode, (<NonNullExpression>node).expression);
            case TokenType.ConditionalExpression:
                return visitNode(cbNode, (<ConditionalExpression>node).condition) ||
                    visitNode(cbNode, (<ConditionalExpression>node).questionToken) ||
                    visitNode(cbNode, (<ConditionalExpression>node).whenTrue) ||
                    visitNode(cbNode, (<ConditionalExpression>node).colonToken) ||
                    visitNode(cbNode, (<ConditionalExpression>node).whenFalse);
            case TokenType.SpreadElementExpression:
                return visitNode(cbNode, (<SpreadElementExpression>node).expression);
            case TokenType.Block:
            case TokenType.ModuleBlock:
                return visitNodes(cbNodes, (<Block>node).statements);
            case TokenType.SourceFile:
                return visitNodes(cbNodes, (<SourceFile>node).statements) ||
                    visitNode(cbNode, (<SourceFile>node).endOfFileToken);
            case TokenType.VariableStatement:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, (<VariableStatement>node).declarationList);
            case TokenType.VariableDeclarationList:
                return visitNodes(cbNodes, (<VariableDeclarationList>node).declarations);
            case TokenType.ExpressionStatement:
                return visitNode(cbNode, (<ExpressionStatement>node).expression);
            case TokenType.IfStatement:
                return visitNode(cbNode, (<IfStatement>node).expression) ||
                    visitNode(cbNode, (<IfStatement>node).thenStatement) ||
                    visitNode(cbNode, (<IfStatement>node).elseStatement);
            case TokenType.DoStatement:
                return visitNode(cbNode, (<DoStatement>node).statement) ||
                    visitNode(cbNode, (<DoStatement>node).expression);
            case TokenType.WhileStatement:
                return visitNode(cbNode, (<WhileStatement>node).expression) ||
                    visitNode(cbNode, (<WhileStatement>node).statement);
            case TokenType.ForStatement:
                return visitNode(cbNode, (<ForStatement>node).initializer) ||
                    visitNode(cbNode, (<ForStatement>node).condition) ||
                    visitNode(cbNode, (<ForStatement>node).incrementor) ||
                    visitNode(cbNode, (<ForStatement>node).statement);
            case TokenType.ForInStatement:
                return visitNode(cbNode, (<ForInStatement>node).initializer) ||
                    visitNode(cbNode, (<ForInStatement>node).expression) ||
                    visitNode(cbNode, (<ForInStatement>node).statement);
            case TokenType.ForOfStatement:
                return visitNode(cbNode, (<ForOfStatement>node).initializer) ||
                    visitNode(cbNode, (<ForOfStatement>node).expression) ||
                    visitNode(cbNode, (<ForOfStatement>node).statement);
            case TokenType.ContinueStatement:
            case TokenType.BreakStatement:
                return visitNode(cbNode, (<BreakOrContinueStatement>node).label);
            case TokenType.ReturnStatement:
                return visitNode(cbNode, (<ReturnStatement>node).expression);
            case TokenType.WithStatement:
                return visitNode(cbNode, (<WithStatement>node).expression) ||
                    visitNode(cbNode, (<WithStatement>node).statement);
            case TokenType.SwitchStatement:
                return visitNode(cbNode, (<SwitchStatement>node).expression) ||
                    visitNode(cbNode, (<SwitchStatement>node).caseBlock);
            case TokenType.CaseBlock:
                return visitNodes(cbNodes, (<CaseBlock>node).clauses);
            case TokenType.CaseClause:
                return visitNode(cbNode, (<CaseClause>node).expression) ||
                    visitNodes(cbNodes, (<CaseClause>node).statements);
            case TokenType.DefaultClause:
                return visitNodes(cbNodes, (<DefaultClause>node).statements);
            case TokenType.LabeledStatement:
                return visitNode(cbNode, (<LabeledStatement>node).label) ||
                    visitNode(cbNode, (<LabeledStatement>node).statement);
            case TokenType.ThrowStatement:
                return visitNode(cbNode, (<ThrowStatement>node).expression);
            case TokenType.TryStatement:
                return visitNode(cbNode, (<TryStatement>node).tryBlock) ||
                    visitNode(cbNode, (<TryStatement>node).catchClause) ||
                    visitNode(cbNode, (<TryStatement>node).finallyBlock);
            case TokenType.CatchClause:
                return visitNode(cbNode, (<CatchClause>node).variableDeclaration) ||
                    visitNode(cbNode, (<CatchClause>node).block);
            case TokenType.Decorator:
                return visitNode(cbNode, (<Decorator>node).expression);
            case TokenType.ClassDeclaration:
            case TokenType.ClassExpression:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, (<ClassLikeDeclaration>node).name) ||
                    visitNodes(cbNodes, (<ClassLikeDeclaration>node).typeParameters) ||
                    visitNodes(cbNodes, (<ClassLikeDeclaration>node).heritageClauses) ||
                    visitNodes(cbNodes, (<ClassLikeDeclaration>node).members);
            case TokenType.InterfaceDeclaration:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, (<InterfaceDeclaration>node).name) ||
                    visitNodes(cbNodes, (<InterfaceDeclaration>node).typeParameters) ||
                    visitNodes(cbNodes, (<ClassDeclaration>node).heritageClauses) ||
                    visitNodes(cbNodes, (<InterfaceDeclaration>node).members);
            case TokenType.TypeAliasDeclaration:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, (<TypeAliasDeclaration>node).name) ||
                    visitNodes(cbNodes, (<TypeAliasDeclaration>node).typeParameters) ||
                    visitNode(cbNode, (<TypeAliasDeclaration>node).type);
            case TokenType.EnumDeclaration:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, (<EnumDeclaration>node).name) ||
                    visitNodes(cbNodes, (<EnumDeclaration>node).members);
            case TokenType.EnumMember:
                return visitNode(cbNode, (<EnumMember>node).name) ||
                    visitNode(cbNode, (<EnumMember>node).initializer);
            case TokenType.ModuleDeclaration:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, (<ModuleDeclaration>node).name) ||
                    visitNode(cbNode, (<ModuleDeclaration>node).body);
            case TokenType.ImportEqualsDeclaration:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, (<ImportEqualsDeclaration>node).name) ||
                    visitNode(cbNode, (<ImportEqualsDeclaration>node).moduleReference);
            case TokenType.ImportDeclaration:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, (<ImportDeclaration>node).importClause) ||
                    visitNode(cbNode, (<ImportDeclaration>node).moduleSpecifier);
            case TokenType.ImportClause:
                return visitNode(cbNode, (<ImportClause>node).name) ||
                    visitNode(cbNode, (<ImportClause>node).namedBindings);
            case TokenType.NamespaceExportDeclaration:
                return visitNode(cbNode, (<NamespaceExportDeclaration>node).name);

            case TokenType.NamespaceImport:
                return visitNode(cbNode, (<NamespaceImport>node).name);
            case TokenType.NamedImports:
            case TokenType.NamedExports:
                return visitNodes(cbNodes, (<NamedImportsOrExports>node).elements);
            case TokenType.ExportDeclaration:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, (<ExportDeclaration>node).exportClause) ||
                    visitNode(cbNode, (<ExportDeclaration>node).moduleSpecifier);
            case TokenType.ImportSpecifier:
            case TokenType.ExportSpecifier:
                return visitNode(cbNode, (<ImportOrExportSpecifier>node).propertyName) ||
                    visitNode(cbNode, (<ImportOrExportSpecifier>node).name);
            case TokenType.ExportAssignment:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, (<ExportAssignment>node).expression);
            case TokenType.TemplateExpression:
                return visitNode(cbNode, (<TemplateExpression>node).head) || visitNodes(cbNodes, (<TemplateExpression>node).templateSpans);
            case TokenType.TemplateSpan:
                return visitNode(cbNode, (<TemplateSpan>node).expression) || visitNode(cbNode, (<TemplateSpan>node).literal);
            case TokenType.ComputedPropertyName:
                return visitNode(cbNode, (<ComputedPropertyName>node).expression);
            case TokenType.HeritageClause:
                return visitNodes(cbNodes, (<HeritageClause>node).types);
            case TokenType.ExpressionWithTypeArguments:
                return visitNode(cbNode, (<ExpressionWithTypeArguments>node).expression) ||
                    visitNodes(cbNodes, (<ExpressionWithTypeArguments>node).typeArguments);
            case TokenType.ExternalModuleReference:
                return visitNode(cbNode, (<ExternalModuleReference>node).expression);
            case TokenType.MissingDeclaration:
                return visitNodes(cbNodes, node.decorators);

            case TokenType.JsxElement:
                return visitNode(cbNode, (<JsxElement>node).openingElement) ||
                    visitNodes(cbNodes, (<JsxElement>node).children) ||
                    visitNode(cbNode, (<JsxElement>node).closingElement);
            case TokenType.JsxSelfClosingElement:
            case TokenType.JsxOpeningElement:
                return visitNode(cbNode, (<JsxOpeningLikeElement>node).tagName) ||
                    visitNodes(cbNodes, (<JsxOpeningLikeElement>node).attributes);
            case TokenType.JsxAttribute:
                return visitNode(cbNode, (<JsxAttribute>node).name) ||
                    visitNode(cbNode, (<JsxAttribute>node).initializer);
            case TokenType.JsxSpreadAttribute:
                return visitNode(cbNode, (<JsxSpreadAttribute>node).expression);
            case TokenType.JsxExpression:
                return visitNode(cbNode, (<JsxExpression>node).expression);
            case TokenType.JsxClosingElement:
                return visitNode(cbNode, (<JsxClosingElement>node).tagName);

            case TokenType.JSDocTypeExpression:
                return visitNode(cbNode, (<JSDocTypeExpression>node).type);
            case TokenType.JSDocUnionType:
                return visitNodes(cbNodes, (<JSDocUnionType>node).types);
            case TokenType.JSDocTupleType:
                return visitNodes(cbNodes, (<JSDocTupleType>node).types);
            case TokenType.JSDocArrayType:
                return visitNode(cbNode, (<JSDocArrayType>node).elementType);
            case TokenType.JSDocNonNullableType:
                return visitNode(cbNode, (<JSDocNonNullableType>node).type);
            case TokenType.JSDocNullableType:
                return visitNode(cbNode, (<JSDocNullableType>node).type);
            case TokenType.JSDocRecordType:
                return visitNodes(cbNodes, (<JSDocRecordType>node).members);
            case TokenType.JSDocTypeReference:
                return visitNode(cbNode, (<JSDocTypeReference>node).name) ||
                    visitNodes(cbNodes, (<JSDocTypeReference>node).typeArguments);
            case TokenType.JSDocOptionalType:
                return visitNode(cbNode, (<JSDocOptionalType>node).type);
            case TokenType.JSDocFunctionType:
                return visitNodes(cbNodes, (<JSDocFunctionType>node).parameters) ||
                    visitNode(cbNode, (<JSDocFunctionType>node).type);
            case TokenType.JSDocVariadicType:
                return visitNode(cbNode, (<JSDocVariadicType>node).type);
            case TokenType.JSDocConstructorType:
                return visitNode(cbNode, (<JSDocConstructorType>node).type);
            case TokenType.JSDocThisType:
                return visitNode(cbNode, (<JSDocThisType>node).type);
            case TokenType.JSDocRecordMember:
                return visitNode(cbNode, (<JSDocRecordMember>node).name) ||
                    visitNode(cbNode, (<JSDocRecordMember>node).type);
            case TokenType.JSDocComment:
                return visitNodes(cbNodes, (<JSDocComment>node).tags);
            case TokenType.JSDocParameterTag:
                return visitNode(cbNode, (<JSDocParameterTag>node).preParameterName) ||
                    visitNode(cbNode, (<JSDocParameterTag>node).typeExpression) ||
                    visitNode(cbNode, (<JSDocParameterTag>node).postParameterName);
            case TokenType.JSDocReturnTag:
                return visitNode(cbNode, (<JSDocReturnTag>node).typeExpression);
            case TokenType.JSDocTypeTag:
                return visitNode(cbNode, (<JSDocTypeTag>node).typeExpression);
            case TokenType.JSDocTemplateTag:
                return visitNodes(cbNodes, (<JSDocTemplateTag>node).typeParameters);
            case TokenType.JSDocTypedefTag:
                return visitNode(cbNode, (<JSDocTypedefTag>node).typeExpression) ||
                    visitNode(cbNode, (<JSDocTypedefTag>node).name) ||
                    visitNode(cbNode, (<JSDocTypedefTag>node).jsDocTypeLiteral);
            case TokenType.JSDocTypeLiteral:
                return visitNodes(cbNodes, (<JSDocTypeLiteral>node).jsDocPropertyTags);
            case TokenType.JSDocPropertyTag:
                return visitNode(cbNode, (<JSDocPropertyTag>node).typeExpression) ||
                    visitNode(cbNode, (<JSDocPropertyTag>node).name);
        }
    }

    export function createSourceFile(fileName: string, sourceText: string, languageVersion: ScriptTarget, setParentNodes = false, scriptKind?: ScriptKind): SourceFile {
        const start = new Date().getTime();
        const result = Parser.parseSourceFile(fileName, sourceText, languageVersion, /*syntaxCursor*/ undefined, setParentNodes, scriptKind);

        parseTime += new Date().getTime() - start;
        return result;
    }

    export function isExternalModule(file: SourceFile): boolean {
        return file.externalModuleIndicator !== undefined;
    }

    // Produces a new SourceFile for the 'newText' provided. The 'textChangeRange' parameter
    // indicates what changed between the 'text' that this SourceFile has and the 'newText'.
    // The SourceFile will be created with the compiler attempting to reuse as many nodes from
    // this file as possible.
    //
    // Note: this function mutates nodes from this SourceFile. That means any existing nodes
    // from this SourceFile that are being held onto may change as a result (including
    // becoming detached from any SourceFile).  It is recommended that this SourceFile not
    // be used once 'update' is called on it.
    export function updateSourceFile(sourceFile: SourceFile, newText: string, textChangeRange: TextChangeRange, aggressiveChecks?: boolean): SourceFile {
        return IncrementalParser.updateSourceFile(sourceFile, newText, textChangeRange, aggressiveChecks);
    }

    /* @internal */
    export function parseIsolatedJSDocComment(content: string, start?: number, length?: number) {
        const result = Parser.JSDocParser.parseIsolatedJSDocComment(content, start, length);
        if (result && result.jsDocComment) {
            // because the jsDocComment was parsed out of the source file, it might
            // not be covered by the fixupParentReferences.
            Parser.fixupParentReferences(result.jsDocComment);
        }

        return result;
    }

    /* @internal */
    // Exposed only for testing.
    export function parseJSDocTypeExpressionForTests(content: string, start?: number, length?: number) {
        return Parser.JSDocParser.parseJSDocTypeExpressionForTests(content, start, length);
    }

    // Implement the parser as a singleton module.  We do this for perf reasons because creating
    // parser instances can actually be expensive enough to impact us on projects with many source
    // files.
    namespace Parser {
        // Share a single scanner across all calls to parse a source file.  This helps speed things
        // up by avoiding the cost of creating/compiling scanners over and over again.
        const scanner = createScanner(ScriptTarget.Latest, /*skipTrivia*/ true);
        const disallowInAndDecoratorContext = NodeFlags.DisallowInContext | NodeFlags.DecoratorContext;

        // capture constructors in 'initializeState' to avoid null checks
        let NodeConstructor: new (kind: TokenType, pos: number, end: number) => Node;
        let SourceFileConstructor: new (kind: TokenType, pos: number, end: number) => Node;

        let sourceFile: SourceFile;
        let parseDiagnostics: Diagnostic[];
        let syntaxCursor: IncrementalParser.SyntaxCursor;

        let token: TokenType;
        let sourceText: string;
        let nodeCount: number;
        let identifiers: Map<string>;
        let identifierCount: number;

        let parsingContext: ParsingContext;

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
        // descent parsing and unwinding.
        let contextFlags: NodeFlags;

        // Whether or not we've had a parse error since creating the last AST node.  If we have
        // encountered an error, it will be stored on the next AST node we create.  Parse errors
        // can be broken down into three categories:
        //
        // 1) An error that occurred during scanning.  For example, an unterminated literal, or a
        //    character that was completely not understood.
        //
        // 2) A token was expected, but was not present.  This type of error is commonly produced
        //    by the 'parseExpected' function.
        //
        // 3) A token was present that no parsing function was able to consume.  This type of error
        //    only occurs in the 'abortParsingListOrMoveToNextToken' function when the parser
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
        // attached to the EOF token.
        let parseErrorBeforeNextFinishedNode = false;

        export function parseSourceFile(fileName: string, _sourceText: string, languageVersion: ScriptTarget, _syntaxCursor: IncrementalParser.SyntaxCursor, setParentNodes?: boolean, scriptKind?: ScriptKind): SourceFile {
            scriptKind = ensureScriptKind(fileName, scriptKind);

            initializeState(fileName, _sourceText, languageVersion, _syntaxCursor, scriptKind);

            const result = parseSourceFileWorker(fileName, languageVersion, setParentNodes, scriptKind);

            clearState();

            return result;
        }

        function getLanguageVariant(scriptKind: ScriptKind) {
            // .tsx and .jsx files are treated as jsx language variant.
            return scriptKind === ScriptKind.TSX || scriptKind === ScriptKind.JSX || scriptKind === ScriptKind.JS ? LanguageVariant.JSX : LanguageVariant.Standard;
        }

        function initializeState(fileName: string, _sourceText: string, languageVersion: ScriptTarget, _syntaxCursor: IncrementalParser.SyntaxCursor, scriptKind: ScriptKind) {
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

        function clearState() {
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

        function parseSourceFileWorker(fileName: string, languageVersion: ScriptTarget, setParentNodes: boolean, scriptKind: ScriptKind): SourceFile {
            sourceFile = createSourceFile(fileName, languageVersion, scriptKind);
            sourceFile.flags = contextFlags;

            // Prime the scanner.
            token = nextToken();
            processReferenceComments(sourceFile);

            sourceFile.statements = parseList(ParsingContext.SourceElements, parseStatement);
            Debug.assert(token === TokenType.endOfFile);
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


        function addJSDocComment<T extends Node>(node: T): T {
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

        export function fixupParentReferences(rootNode: Node) {
            // normally parent references are set during binding. However, for clients that only need
            // a syntax tree, and no semantic features, then the binding process is an unnecessary
            // overhead.  This functions allows us to set all the parents, without all the expense of
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

        function createSourceFile(fileName: string, languageVersion: ScriptTarget, scriptKind: ScriptKind): SourceFile {
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

        function setContextFlag(val: boolean, flag: NodeFlags) {
            if (val) {
                contextFlags |= flag;
            }
            else {
                contextFlags &= ~flag;
            }
        }

        function setDisallowInContext(val: boolean) {
            setContextFlag(val, NodeFlags.DisallowInContext);
        }

        function setYieldContext(val: boolean) {
            setContextFlag(val, NodeFlags.YieldContext);
        }

        function setDecoratorContext(val: boolean) {
            setContextFlag(val, NodeFlags.DecoratorContext);
        }

        function setAwaitContext(val: boolean) {
            setContextFlag(val, NodeFlags.AwaitContext);
        }

        function doOutsideOfContext<T>(context: NodeFlags, func: () => T): T {
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

        function doInsideOfContext<T>(context: NodeFlags, func: () => T): T {
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

        function allowInAnd<T>(func: () => T): T {
            return doOutsideOfContext(NodeFlags.DisallowInContext, func);
        }

        function disallowInAnd<T>(func: () => T): T {
            return doInsideOfContext(NodeFlags.DisallowInContext, func);
        }

        function doInYieldContext<T>(func: () => T): T {
            return doInsideOfContext(NodeFlags.YieldContext, func);
        }

        function doInDecoratorContext<T>(func: () => T): T {
            return doInsideOfContext(NodeFlags.DecoratorContext, func);
        }

        function doInAwaitContext<T>(func: () => T): T {
            return doInsideOfContext(NodeFlags.AwaitContext, func);
        }

        function doOutsideOfAwaitContext<T>(func: () => T): T {
            return doOutsideOfContext(NodeFlags.AwaitContext, func);
        }

        function doInYieldAndAwaitContext<T>(func: () => T): T {
            return doInsideOfContext(NodeFlags.YieldContext | NodeFlags.AwaitContext, func);
        }

        function inContext(flags: NodeFlags) {
            return (contextFlags & flags) !== 0;
        }

        function inYieldContext() {
            return inContext(NodeFlags.YieldContext);
        }

        function inDisallowInContext() {
            return inContext(NodeFlags.DisallowInContext);
        }

        function inDecoratorContext() {
            return inContext(NodeFlags.DecoratorContext);
        }

        function inAwaitContext() {
            return inContext(NodeFlags.AwaitContext);
        }

        function parseErrorAtCurrentToken(message: DiagnosticMessage, arg0?: any): void {
            const start = scanner.getTokenPos();
            const length = scanner.getTextPos() - start;

            parseErrorAtPosition(start, length, message, arg0);
        }

        function parseErrorAtPosition(start: number, length: number, message: DiagnosticMessage, arg0?: any): void {
            // Don't report another error if it would just be at the same position as the last error.
            const lastError = lastOrUndefined(parseDiagnostics);
            if (!lastError || start !== lastError.start) {
                parseDiagnostics.push(createFileDiagnostic(sourceFile, start, length, message, arg0));
            }

            // Mark that we've encountered an error.  We'll set an appropriate bit on the next
            // node we finish so that it can't be reused incrementally.
            parseErrorBeforeNextFinishedNode = true;
        }

        function scanError(message: DiagnosticMessage, length?: number) {
            const pos = scanner.getTextPos();
            parseErrorAtPosition(pos, length || 0, message);
        }

        function getNodePos(): number {
            return scanner.getStartPos();
        }

        function getNodeEnd(): number {
            return scanner.getStartPos();
        }

        function nextToken(): TokenType {
            return token = scanner.scan();
        }

        function reScanGreaterToken(): TokenType {
            return token = scanner.reScanGreaterToken();
        }

        function reScanSlashToken(): TokenType {
            return token = scanner.reScanSlashToken();
        }

        function reScanTemplateToken(): TokenType {
            return token = scanner.reScanTemplateToken();
        }

        function scanJsxIdentifier(): TokenType {
            return token = scanner.scanJsxIdentifier();
        }

        function scanJsxText(): TokenType {
            return token = scanner.scanJsxToken();
        }

        function speculationHelper<T>(callback: () => T, isLookAhead: boolean): T {
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
         * is returned from this function.
         */
        function lookAhead<T>(callback: () => T): T {
            return speculationHelper(callback, /*isLookAhead*/ true);
        }

        /** Invokes the provided callback.  If the callback returns something falsy, then it restores
         * the parser to the state it was in immediately prior to invoking the callback.  If the
         * callback returns something truthy, then the parser state is not rolled back.  The result
         * of invoking the callback is returned from this function.
         */
        function tryParse<T>(callback: () => T): T {
            return speculationHelper(callback, /*isLookAhead*/ false);
        }

        // Ignore strict mode flag because we will report an error in type checker instead.
        function isIdentifier(): boolean {
            if (token === TokenType.Identifier) {
                return true;
            }

            // If we have a 'yield' keyword, and we're in the [yield] context, then 'yield' is
            // considered a keyword and is not an identifier.
            if (token === TokenType.yield && inYieldContext()) {
                return false;
            }

            // If we have a 'await' keyword, and we're in the [Await] context, then 'await' is
            // considered a keyword and is not an identifier.
            if (token === TokenType.await && inAwaitContext()) {
                return false;
            }

            return token > TokenType.LastReservedWord;
        }

        function parseExpected(kind: TokenType, diagnosticMessage?: DiagnosticMessage, shouldAdvance = true): boolean {
            if (token === kind) {
                if (shouldAdvance) {
                    nextToken();
                }
                return true;
            }

            // Report specific message if provided with one.  Otherwise, report generic fallback message.
            if (diagnosticMessage) {
                parseErrorAtCurrentToken(diagnosticMessage);
            }
            else {
                parseErrorAtCurrentToken(Diagnostics._0_expected, tokenToString(kind));
            }
            return false;
        }

        function parseOptional(t: TokenType): boolean {
            if (token === t) {
                nextToken();
                return true;
            }
            return false;
        }

        function parseOptionalToken(t: TokenType): Node {
            if (token === t) {
                return parseTokenNode();
            }
            return undefined;
        }

        function parseExpectedToken(t: TokenType, reportAtCurrentPosition: boolean, diagnosticMessage: DiagnosticMessage, arg0?: any): Node {
            return parseOptionalToken(t) ||
                createMissingNode(t, reportAtCurrentPosition, diagnosticMessage, arg0);
        }

        function parseTokenNode<T extends Node>(): T {
            const node = <T>createNode(token);
            nextToken();
            return finishNode(node);
        }

        function canParseSemicolon() {
            // If there's a real semicolon, then we can always parse it out.
            if (token === TokenType.semicolon) {
                return true;
            }

            // We can parse out an optional semicolon in ASI cases in the following cases.
            return token === TokenType.closeBrace || token === TokenType.endOfFile || scanner.hasPrecedingLineBreak();
        }

        function parseSemicolon(): boolean {
            if (canParseSemicolon()) {
                if (token === TokenType.semicolon) {
                    // consume the semicolon if it was explicitly provided.
                    nextToken();
                }

                return true;
            }
            else {
                return parseExpected(TokenType.semicolon);
            }
        }

        // note: this function creates only node
        function createNode(kind: TokenType, pos?: number): Node {
            nodeCount++;
            if (!(pos >= 0)) {
                pos = scanner.getStartPos();
            }

            return new NodeConstructor(kind, pos, pos);
        }

        function finishNode<T extends Node>(node: T, end?: number): T {
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

        function createMissingNode(kind: TokenType, reportAtCurrentPosition: boolean, diagnosticMessage: DiagnosticMessage, arg0?: any): Node {
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

        function internIdentifier(text: string): string {
            text = escapeIdentifier(text);
            return hasProperty(identifiers, text) ? identifiers[text] : (identifiers[text] = text);
        }

        // An identifier that starts with two underscores has an extra underscore character prepended to it to avoid issues
        // with magic property names like '__proto__'. The 'identifiers' object is used to share a single string instance for
        // each identifier in order to reduce memory consumption.
        function createIdentifier(isIdentifier: boolean, diagnosticMessage?: DiagnosticMessage): Identifier {
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

        function parseIdentifier(diagnosticMessage?: DiagnosticMessage): Identifier {
            return createIdentifier(isIdentifier(), diagnosticMessage);
        }

        function parseIdentifierName(): Identifier {
            return createIdentifier(tokenIsIdentifierOrKeyword(token));
        }

        function isLiteralPropertyName(): boolean {
            return tokenIsIdentifierOrKeyword(token) ||
                token === TokenType.StringLiteral ||
                token === TokenType.NumericLiteral;
        }

        function parsePropertyNameWorker(allowComputedPropertyNames: boolean): PropertyName {
            if (token === TokenType.StringLiteral || token === TokenType.NumericLiteral) {
                return parseLiteralNode(/*internName*/ true);
            }
            if (allowComputedPropertyNames && token === TokenType.openBracket) {
                return parseComputedPropertyName();
            }
            return parseIdentifierName();
        }

        function parsePropertyName(): PropertyName {
            return parsePropertyNameWorker(/*allowComputedPropertyNames*/ true);
        }

        function parseSimplePropertyName(): Identifier | LiteralExpression {
            return <Identifier | LiteralExpression>parsePropertyNameWorker(/*allowComputedPropertyNames*/ false);
        }

        function isSimplePropertyName() {
            return token === TokenType.StringLiteral || token === TokenType.NumericLiteral || tokenIsIdentifierOrKeyword(token);
        }

        function parseComputedPropertyName(): ComputedPropertyName {
            // PropertyName [Yield]:
            //      LiteralPropertyName
            //      ComputedPropertyName[?Yield]
            const node = <ComputedPropertyName>createNode(TokenType.ComputedPropertyName);
            parseExpected(TokenType.openBracket);

            // We parse any expression (including a comma expression). But the grammar
            // says that only an assignment expression is allowed, so the grammar checker
            // will error if it sees a comma expression.
            node.expression = allowInAnd(parseExpression);

            parseExpected(TokenType.closeBracket);
            return finishNode(node);
        }

        function parseContextualModifier(t: TokenType): boolean {
            return token === t && tryParse(nextTokenCanFollowModifier);
        }

        function nextTokenIsOnSameLineAndCanFollowModifier() {
            nextToken();
            if (scanner.hasPrecedingLineBreak()) {
                return false;
            }
            return canFollowModifier();
        }

        function nextTokenCanFollowModifier() {
            if (token === TokenType.const) {
                // 'const' is only a modifier if followed by 'enum'.
                return nextToken() === TokenType.enum;
            }
            if (token === TokenType.export) {
                nextToken();
                if (token === TokenType.default) {
                    return lookAhead(nextTokenIsClassOrFunctionOrAsync);
                }
                return token !== TokenType.asterisk && token !== TokenType.as && token !== TokenType.openBrace && canFollowModifier();
            }
            if (token === TokenType.default) {
                return nextTokenIsClassOrFunctionOrAsync();
            }
            if (token === TokenType.static) {
                nextToken();
                return canFollowModifier();
            }

            return nextTokenIsOnSameLineAndCanFollowModifier();
        }

        function parseAnyContextualModifier(): boolean {
            return isModifierKind(token) && tryParse(nextTokenCanFollowModifier);
        }

        function canFollowModifier(): boolean {
            return token === TokenType.openBracket
                || token === TokenType.openBrace
                || token === TokenType.asterisk
                || token === TokenType.dotDotDot
                || isLiteralPropertyName();
        }

        function nextTokenIsClassOrFunctionOrAsync(): boolean {
            nextToken();
            return token === TokenType.class || token === TokenType.function ||
                (token === TokenType.async && lookAhead(nextTokenIsFunctionKeywordOnSameLine));
        }

        // True if positioned at the start of a list element
        function isListElement(parsingContext: ParsingContext, inErrorRecovery: boolean): boolean {
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
                    return !(token === TokenType.semicolon && inErrorRecovery) && isStartOfStatement();
                case ParsingContext.SwitchClauses:
                    return token === TokenType.case || token === TokenType.default;
                case ParsingContext.TypeMembers:
                    return lookAhead(isTypeMemberStart);
                case ParsingContext.ClassMembers:
                    // We allow semicolons as class elements (as specified by ES6) as long as we're
                    // not in error recovery.  If we're in error recovery, we don't want an errant
                    // semicolon to be treated as a class member (since they're almost always used
                    // for statements.
                    return lookAhead(isClassMemberStart) || (token === TokenType.semicolon && !inErrorRecovery);
                case ParsingContext.EnumMembers:
                    // Include open bracket computed properties. This technically also lets in indexers,
                    // which would be a candidate for improved error reporting.
                    return token === TokenType.openBracket || isLiteralPropertyName();
                case ParsingContext.ObjectLiteralMembers:
                    return token === TokenType.openBracket || token === TokenType.asterisk || isLiteralPropertyName();
                case ParsingContext.ObjectBindingElements:
                    return token === TokenType.openBracket || isLiteralPropertyName();
                case ParsingContext.HeritageClauseElement:
                    // If we see { } then only consume it as an expression if it is followed by , or {
                    // That way we won't consume the body of a class in its heritage clause.
                    if (token === TokenType.openBrace) {
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
                    return token === TokenType.comma || token === TokenType.dotDotDot || isIdentifierOrPattern();
                case ParsingContext.TypeParameters:
                    return isIdentifier();
                case ParsingContext.ArgumentExpressions:
                case ParsingContext.ArrayLiteralMembers:
                    return token === TokenType.comma || token === TokenType.dotDotDot || isStartOfExpression();
                case ParsingContext.Parameters:
                    return isStartOfParameter();
                case ParsingContext.TypeArguments:
                case ParsingContext.TupleElementTypes:
                    return token === TokenType.comma || isStartOfType();
                case ParsingContext.HeritageClauses:
                    return isHeritageClause();
                case ParsingContext.ImportOrExportSpecifiers:
                    return tokenIsIdentifierOrKeyword(token);
                case ParsingContext.JsxAttributes:
                    return tokenIsIdentifierOrKeyword(token) || token === TokenType.openBrace;
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

        function isValidHeritageClauseObjectLiteral() {
            Debug.assert(token === TokenType.openBrace);
            if (nextToken() === TokenType.closeBrace) {
                // if we see  "extends {}" then only treat the {} as what we're extending (and not
                // the class body) if we have:
                //
                //      extends {} {
                //      extends {},
                //      extends {} extends
                //      extends {} implements

                const next = nextToken();
                return next === TokenType.comma || next === TokenType.openBrace || next === TokenType.extends || next === TokenType.implements;
            }

            return true;
        }

        function nextTokenIsIdentifier() {
            nextToken();
            return isIdentifier();
        }

        function nextTokenIsIdentifierOrKeyword() {
            nextToken();
            return tokenIsIdentifierOrKeyword(token);
        }

        function isHeritageClauseExtendsOrImplementsKeyword(): boolean {
            if (token === TokenType.implements ||
                token === TokenType.extends) {

                return lookAhead(nextTokenIsStartOfExpression);
            }

            return false;
        }

        function nextTokenIsStartOfExpression() {
            nextToken();
            return isStartOfExpression();
        }

        // True if positioned at a list terminator
        function isListTerminator(kind: ParsingContext): boolean {
            if (token === TokenType.endOfFile) {
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
                    return token === TokenType.closeBrace;
                case ParsingContext.SwitchClauseStatements:
                    return token === TokenType.closeBrace || token === TokenType.case || token === TokenType.default;
                case ParsingContext.HeritageClauseElement:
                    return token === TokenType.openBrace || token === TokenType.extends || token === TokenType.implements;
                case ParsingContext.VariableDeclarations:
                    return isVariableDeclaratorListTerminator();
                case ParsingContext.TypeParameters:
                    // Tokens other than '>' are here for better error recovery
                    return token === TokenType.greaterThan || token === TokenType.openParen || token === TokenType.openBrace || token === TokenType.extends || token === TokenType.implements;
                case ParsingContext.ArgumentExpressions:
                    // Tokens other than ')' are here for better error recovery
                    return token === TokenType.closeParen || token === TokenType.semicolon;
                case ParsingContext.ArrayLiteralMembers:
                case ParsingContext.TupleElementTypes:
                case ParsingContext.ArrayBindingElements:
                    return token === TokenType.closeBracket;
                case ParsingContext.Parameters:
                    // Tokens other than ')' and ']' (the latter for index signatures) are here for better error recovery
                    return token === TokenType.closeParen || token === TokenType.closeBracket /*|| token === SyntaxKind.OpenBraceToken*/;
                case ParsingContext.TypeArguments:
                    // Tokens other than '>' are here for better error recovery
                    return token === TokenType.greaterThan || token === TokenType.openParen;
                case ParsingContext.HeritageClauses:
                    return token === TokenType.openBrace || token === TokenType.closeBrace;
                case ParsingContext.JsxAttributes:
                    return token === TokenType.greaterThan || token === TokenType.slash;
                case ParsingContext.JsxChildren:
                    return token === TokenType.lessThan && lookAhead(nextTokenIsSlash);
                case ParsingContext.JSDocFunctionParameters:
                    return token === TokenType.closeParen || token === TokenType.colon || token === TokenType.closeBrace;
                case ParsingContext.JSDocTypeArguments:
                    return token === TokenType.greaterThan || token === TokenType.closeBrace;
                case ParsingContext.JSDocTupleTypes:
                    return token === TokenType.closeBracket || token === TokenType.closeBrace;
                case ParsingContext.JSDocRecordMembers:
                    return token === TokenType.closeBrace;
            }
        }

        function isVariableDeclaratorListTerminator(): boolean {
            // If we can consume a semicolon (either explicitly, or with ASI), then consider us done
            // with parsing the list of  variable declarators.
            if (canParseSemicolon()) {
                return true;
            }

            // in the case where we're parsing the variable declarator of a 'for-in' statement, we
            // are done if we see an 'in' keyword in front of us. Same with for-of
            if (isInOrOfKeyword(token)) {
                return true;
            }

            // ERROR RECOVERY TWEAK:
            // For better error recovery, if we see an '=>' then we just stop immediately.  We've got an
            // arrow function here and it's going to be very unlikely that we'll resynchronize and get
            // another variable declaration.
            if (token === TokenType.equalsGreaterThan) {
                return true;
            }

            // Keep trying to parse out variable declarators.
            return false;
        }

        // True if positioned at element or terminator of the current list or any enclosing list
        function isInSomeParsingContext(): boolean {
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
        function parseList<T extends Node>(kind: ParsingContext, parseElement: () => T): NodeArray<T> {
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

        function parseListElement<T extends Node>(parsingContext: ParsingContext, parseElement: () => T): T {
            const node = currentNode(parsingContext);
            if (node) {
                return <T>consumeNode(node);
            }

            return parseElement();
        }

        function currentNode(parsingContext: ParsingContext): Node {
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

        function consumeNode(node: Node) {
            // Move the scanner so it is after the node we just consumed.
            scanner.setTextPos(node.end);
            nextToken();
            return node;
        }

        function canReuseNode(node: Node, parsingContext: ParsingContext): boolean {
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

        function isReusableClassMember(node: Node) {
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
                            (<Identifier>methodDeclaration.name).originalKeywordKind === TokenType.constructor;

                        return !nameIsConstructor;
                }
            }

            return false;
        }

        function isReusableSwitchClause(node: Node) {
            if (node) {
                switch (node.kind) {
                    case TokenType.CaseClause:
                    case TokenType.DefaultClause:
                        return true;
                }
            }

            return false;
        }

        function isReusableStatement(node: Node) {
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

        function isReusableEnumMember(node: Node) {
            return node.kind === TokenType.EnumMember;
        }

        function isReusableTypeMember(node: Node) {
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

        function isReusableVariableDeclaration(node: Node) {
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

        function isReusableParameter(node: Node) {
            if (node.kind !== TokenType.Parameter) {
                return false;
            }

            // See the comment in isReusableVariableDeclaration for why we do this.
            const parameter = <ParameterDeclaration>node;
            return parameter.initializer === undefined;
        }

        // Returns true if we should abort parsing.
        function abortParsingListOrMoveToNextToken(kind: ParsingContext) {
            parseErrorAtCurrentToken(parsingContextErrors(kind));
            if (isInSomeParsingContext()) {
                return true;
            }

            nextToken();
            return false;
        }

        function parsingContextErrors(context: ParsingContext): DiagnosticMessage {
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
        function parseDelimitedList<T extends Node>(kind: ParsingContext, parseElement: () => T, considerSemicolonAsDelimiter?: boolean): NodeArray<T> {
            const saveParsingContext = parsingContext;
            parsingContext |= 1 << kind;
            const result = <NodeArray<T>>[];
            result.pos = getNodePos();

            let commaStart = -1; // Meaning the previous token was not a comma
            while (true) {
                if (isListElement(kind, /*inErrorRecovery*/ false)) {
                    result.push(parseListElement(kind, parseElement));
                    commaStart = scanner.getTokenPos();
                    if (parseOptional(TokenType.comma)) {
                        continue;
                    }

                    commaStart = -1; // Back to the state where the last token was not a comma
                    if (isListTerminator(kind)) {
                        break;
                    }

                    // We didn't get a comma, and the list wasn't terminated, explicitly parse
                    // out a comma so we give a good error message.
                    parseExpected(TokenType.comma);

                    // If the token was a semicolon, and the caller allows that, then skip it and
                    // continue.  This ensures we get back on track and don't result in tons of
                    // parse errors.  For example, this can happen when people do things like use
                    // a semicolon to delimit object literal members.   Note: we'll have already
                    // reported an error when we called parseExpected above.
                    if (considerSemicolonAsDelimiter && token === TokenType.semicolon && !scanner.hasPrecedingLineBreak()) {
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

        function createMissingList<T>(): NodeArray<T> {
            const pos = getNodePos();
            const result = <NodeArray<T>>[];
            result.pos = pos;
            result.end = pos;
            return result;
        }

        function parseBracketedList<T extends Node>(kind: ParsingContext, parseElement: () => T, open: TokenType, close: TokenType): NodeArray<T> {
            if (parseExpected(open)) {
                const result = parseDelimitedList(kind, parseElement);
                parseExpected(close);
                return result;
            }

            return createMissingList<T>();
        }

        // The allowReservedWords parameter controls whether reserved words are permitted after the first dot
        function parseEntityName(allowReservedWords: boolean, diagnosticMessage?: DiagnosticMessage): EntityName {
            let entity: EntityName = parseIdentifier(diagnosticMessage);
            while (parseOptional(TokenType.dot)) {
                const node: QualifiedName = <QualifiedName>createNode(TokenType.QualifiedName, entity.pos);  // !!!
                node.left = entity;
                node.right = parseRightSideOfDot(allowReservedWords);
                entity = finishNode(node);
            }
            return entity;
        }

        function parseRightSideOfDot(allowIdentifierNames: boolean): Identifier {
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

        function parseTemplateExpression(): TemplateExpression {
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

        function parseTemplateSpan(): TemplateSpan {
            const span = <TemplateSpan>createNode(TokenType.TemplateSpan);
            span.expression = allowInAnd(parseExpression);

            let literal: TemplateLiteralFragment;

            if (token === TokenType.closeBrace) {
                reScanTemplateToken();
                literal = parseTemplateLiteralFragment();
            }
            else {
                literal = <TemplateLiteralFragment>parseExpectedToken(TokenType.TemplateTail, /*reportAtCurrentPosition*/ false, Diagnostics._0_expected, tokenToString(TokenType.closeBrace));
            }

            span.literal = literal;
            return finishNode(span);
        }

        function parseStringLiteralTypeNode(): StringLiteralTypeNode {
            return <StringLiteralTypeNode>parseLiteralLikeNode(TokenType.StringLiteralType, /*internName*/ true);
        }

        function parseLiteralNode(internName?: boolean): LiteralExpression {
            return <LiteralExpression>parseLiteralLikeNode(token, internName);
        }

        function parseTemplateLiteralFragment(): TemplateLiteralFragment {
            return <TemplateLiteralFragment>parseLiteralLikeNode(token, /*internName*/ false);
        }

        function parseLiteralLikeNode(kind: TokenType, internName: boolean): LiteralLikeNode {
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
                && sourceText.charCodeAt(tokenPos) === CharCode.num0
                && isOctalDigit(sourceText.charCodeAt(tokenPos + 1))) {

                node.isOctalLiteral = true;
            }

            return node;
        }

        // TYPES

        function parseTypeReference(): TypeReferenceNode {
            const typeName = parseEntityName(/*allowReservedWords*/ false, Diagnostics.Type_expected);
            const node = <TypeReferenceNode>createNode(TokenType.TypeReference, typeName.pos);
            node.typeName = typeName;
            if (!scanner.hasPrecedingLineBreak() && token === TokenType.lessThan) {
                node.typeArguments = parseBracketedList(ParsingContext.TypeArguments, parseType, TokenType.lessThan, TokenType.greaterThan);
            }
            return finishNode(node);
        }

        function parseThisTypePredicate(lhs: ThisTypeNode): TypePredicateNode {
            nextToken();
            const node = createNode(TokenType.TypePredicate, lhs.pos) as TypePredicateNode;
            node.parameterName = lhs;
            node.type = parseType();
            return finishNode(node);
        }

        function parseThisTypeNode(): ThisTypeNode {
            const node = createNode(TokenType.ThisType) as ThisTypeNode;
            nextToken();
            return finishNode(node);
        }

        function parseTypeQuery(): TypeQueryNode {
            const node = <TypeQueryNode>createNode(TokenType.TypeQuery);
            parseExpected(TokenType.typeOf);
            node.exprName = parseEntityName(/*allowReservedWords*/ true);
            return finishNode(node);
        }

        function parseTypeParameter(): TypeParameterDeclaration {
            const node = <TypeParameterDeclaration>createNode(TokenType.TypeParameter);
            node.name = parseIdentifier();
            if (parseOptional(TokenType.extends)) {
                // It's not uncommon for people to write improper constraints to a generic.  If the
                // user writes a constraint that is an expression and not an actual type, then parse
                // it out as an expression (so we can recover well), but report that a type is needed
                // instead.
                if (isStartOfType() || !isStartOfExpression()) {
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

        function parseTypeParameters(): NodeArray<TypeParameterDeclaration> {
            if (token === TokenType.lessThan) {
                return parseBracketedList(ParsingContext.TypeParameters, parseTypeParameter, TokenType.lessThan, TokenType.greaterThan);
            }
        }

        function parseParameterType(): TypeNode {
            if (parseOptional(TokenType.colon)) {
                return parseType();
            }

            return undefined;
        }

        function isStartOfParameter(): boolean {
            return token === TokenType.dotDotDot || isIdentifierOrPattern() || isModifierKind(token) || token === TokenType.at || token === TokenType.this;
        }

        function setModifiers(node: Node, modifiers: ModifiersArray) {
            if (modifiers) {
                node.flags |= modifiers.flags;
                node.modifiers = modifiers;
            }
        }

        function parseParameter(): ParameterDeclaration {
            const node = <ParameterDeclaration>createNode(TokenType.Parameter);
            if (token === TokenType.this) {
                node.name = createIdentifier(/*isIdentifier*/true, undefined);
                node.type = parseParameterType();
                return finishNode(node);
            }

            node.decorators = parseDecorators();
            setModifiers(node, parseModifiers());
            node.dotDotDotToken = parseOptionalToken(TokenType.dotDotDot);

            // FormalParameter [Yield,Await]:
            //      BindingElement[?Yield,?Await]
            node.name = parseIdentifierOrPattern();
            if (getFullWidth(node.name) === 0 && node.flags === 0 && isModifierKind(token)) {
                // in cases like
                // 'use strict'
                // function foo(static)
                // isParameter('static') === true, because of isModifier('static')
                // however 'static' is not a legal identifier in a strict mode.
                // so result of this function will be ParameterDeclaration (flags = 0, name = missing, type = undefined, initializer = undefined)
                // and current token will not change => parsing of the enclosing parameter list will last till the end of time (or OOM)
                // to avoid this we'll advance cursor to the next token.
                nextToken();
            }

            node.questionToken = parseOptionalToken(TokenType.question);
            node.type = parseParameterType();
            node.initializer = parseBindingElementInitializer(/*inParameter*/ true);

            // Do not check for initializers in an ambient context for parameters. This is not
            // a grammar error because the grammar allows arbitrary call signatures in
            // an ambient context.
            // It is actually not necessary for this to be an error at all. The reason is that
            // function/constructor implementations are syntactically disallowed in ambient
            // contexts. In addition, parameter initializers are semantically disallowed in
            // overload signatures. So parameter initializers are transitively disallowed in
            // ambient contexts.

            return addJSDocComment(finishNode(node));
        }

        function parseBindingElementInitializer(inParameter: boolean) {
            return inParameter ? parseParameterInitializer() : parseNonParameterInitializer();
        }

        function parseParameterInitializer() {
            return parseInitializer(/*inParameter*/ true);
        }

        function fillSignature(
            returnToken: TokenType,
            yieldContext: boolean,
            awaitContext: boolean,
            requireCompleteParameterList: boolean,
            signature: SignatureDeclaration): void {

            const returnTokenRequired = returnToken === TokenType.equalsGreaterThan;
            signature.typeParameters = parseTypeParameters();
            signature.parameters = parseParameterList(yieldContext, awaitContext, requireCompleteParameterList);

            if (returnTokenRequired) {
                parseExpected(returnToken);
                signature.type = parseTypeOrTypePredicate();
            }
            else if (parseOptional(returnToken)) {
                signature.type = parseTypeOrTypePredicate();
            }
        }

        function parseParameterList(yieldContext: boolean, awaitContext: boolean, requireCompleteParameterList: boolean) {
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
            if (parseExpected(TokenType.openParen)) {
                const savedYieldContext = inYieldContext();
                const savedAwaitContext = inAwaitContext();

                setYieldContext(yieldContext);
                setAwaitContext(awaitContext);

                const result = parseDelimitedList(ParsingContext.Parameters, parseParameter);

                setYieldContext(savedYieldContext);
                setAwaitContext(savedAwaitContext);

                if (!parseExpected(TokenType.closeParen) && requireCompleteParameterList) {
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

        function parseTypeMemberSemicolon() {
            // We allow type members to be separated by commas or (possibly ASI) semicolons.
            // First check if it was a comma.  If so, we're done with the member.
            if (parseOptional(TokenType.comma)) {
                return;
            }

            // Didn't have a comma.  We must have a (possible ASI) semicolon.
            parseSemicolon();
        }

        function parseSignatureMember(kind: TokenType): CallSignatureDeclaration | ConstructSignatureDeclaration {
            const node = <CallSignatureDeclaration | ConstructSignatureDeclaration>createNode(kind);
            if (kind === TokenType.ConstructSignature) {
                parseExpected(TokenType.new);
            }
            fillSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
            parseTypeMemberSemicolon();
            return finishNode(node);
        }

        function isIndexSignature(): boolean {
            if (token !== TokenType.openBracket) {
                return false;
            }

            return lookAhead(isUnambiguouslyIndexSignature);
        }

        function isUnambiguouslyIndexSignature() {
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
            if (token === TokenType.dotDotDot || token === TokenType.closeBracket) {
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
            if (token === TokenType.colon || token === TokenType.comma) {
                return true;
            }

            // Question mark could be an indexer with an optional property,
            // or it could be a conditional expression in a computed property.
            if (token !== TokenType.question) {
                return false;
            }

            // If any of the following tokens are after the question mark, it cannot
            // be a conditional expression, so treat it as an indexer.
            nextToken();
            return token === TokenType.colon || token === TokenType.comma || token === TokenType.closeBracket;
        }

        function parseIndexSignatureDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): IndexSignatureDeclaration {
            const node = <IndexSignatureDeclaration>createNode(TokenType.IndexSignature, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            node.parameters = parseBracketedList(ParsingContext.Parameters, parseParameter, TokenType.openBracket, TokenType.closeBracket);
            node.type = parseTypeAnnotation();
            parseTypeMemberSemicolon();
            return finishNode(node);
        }

        function parsePropertyOrMethodSignature(fullStart: number, modifiers: ModifiersArray): PropertySignature | MethodSignature {
            const name = parsePropertyName();
            const questionToken = parseOptionalToken(TokenType.question);

            if (token === TokenType.openParen || token === TokenType.lessThan) {
                const method = <MethodSignature>createNode(TokenType.MethodSignature, fullStart);
                setModifiers(method, modifiers);
                method.name = name;
                method.questionToken = questionToken;

                // Method signatures don't exist in expression contexts.  So they have neither
                // [Yield] nor [Await]
                fillSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, method);
                parseTypeMemberSemicolon();
                return finishNode(method);
            }
            else {
                const property = <PropertySignature>createNode(TokenType.PropertySignature, fullStart);
                setModifiers(property, modifiers);
                property.name = name;
                property.questionToken = questionToken;
                property.type = parseTypeAnnotation();

                if (token === TokenType.equals) {
                    // Although type literal properties cannot not have initializers, we attempt
                    // to parse an initializer so we can report in the checker that an interface
                    // property or type literal property cannot have an initializer.
                    property.initializer = parseNonParameterInitializer();
                }

                parseTypeMemberSemicolon();
                return finishNode(property);
            }
        }

        function isTypeMemberStart(): boolean {
            let idToken: TokenType;
            // Return true if we have the start of a signature member
            if (token === TokenType.openParen || token === TokenType.lessThan) {
                return true;
            }
            // Eat up all modifiers, but hold on to the last one in case it is actually an identifier
            while (isModifierKind(token)) {
                idToken = token;
                nextToken();
            }
            // Index signatures and computed property names are type members
            if (token === TokenType.openBracket) {
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
                return token === TokenType.openParen ||
                    token === TokenType.lessThan ||
                    token === TokenType.question ||
                    token === TokenType.colon ||
                    canParseSemicolon();
            }
            return false;
        }

        function parseTypeMember(): TypeElement {
            if (token === TokenType.openParen || token === TokenType.lessThan) {
                return parseSignatureMember(TokenType.CallSignature);
            }
            if (token === TokenType.new && lookAhead(isStartOfConstructSignature)) {
                return parseSignatureMember(TokenType.ConstructSignature);
            }
            const fullStart = getNodePos();
            const modifiers = parseModifiers();
            if (isIndexSignature()) {
                return parseIndexSignatureDeclaration(fullStart, /*decorators*/ undefined, modifiers);
            }
            return parsePropertyOrMethodSignature(fullStart, modifiers);
        }

        function isStartOfConstructSignature() {
            nextToken();
            return token === TokenType.openParen || token === TokenType.lessThan;
        }

        function parseTypeLiteral(): TypeLiteralNode {
            const node = <TypeLiteralNode>createNode(TokenType.TypeLiteral);
            node.members = parseObjectTypeMembers();
            return finishNode(node);
        }

        function parseObjectTypeMembers(): NodeArray<TypeElement> {
            let members: NodeArray<TypeElement>;
            if (parseExpected(TokenType.openBrace)) {
                members = parseList(ParsingContext.TypeMembers, parseTypeMember);
                parseExpected(TokenType.closeBrace);
            }
            else {
                members = createMissingList<TypeElement>();
            }

            return members;
        }

        function parseTupleType(): TupleTypeNode {
            const node = <TupleTypeNode>createNode(TokenType.TupleType);
            node.elementTypes = parseBracketedList(ParsingContext.TupleElementTypes, parseType, TokenType.openBracket, TokenType.closeBracket);
            return finishNode(node);
        }

        function parseParenthesizedType(): ParenthesizedTypeNode {
            const node = <ParenthesizedTypeNode>createNode(TokenType.ParenthesizedType);
            parseExpected(TokenType.openParen);
            node.type = parseType();
            parseExpected(TokenType.closeParen);
            return finishNode(node);
        }

        function parseFunctionOrConstructorType(kind: TokenType): FunctionOrConstructorTypeNode {
            const node = <FunctionOrConstructorTypeNode>createNode(kind);
            if (kind === TokenType.ConstructorType) {
                parseExpected(TokenType.new);
            }
            fillSignature(TokenType.equalsGreaterThan, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
            return finishNode(node);
        }

        function parseKeywordAndNoDot(): TypeNode {
            const node = parseTokenNode<TypeNode>();
            return token === TokenType.dot ? undefined : node;
        }

        function parseNonArrayType(): TypeNode {
            switch (token) {
                case TokenType.any:
                case TokenType.string:
                case TokenType.number:
                case TokenType.boolean:
                case TokenType.symbol:
                case TokenType.undefined:
                case TokenType.never:
                    // If these are followed by a dot, then parse these out as a dotted type reference instead.
                    const node = tryParse(parseKeywordAndNoDot);
                    return node || parseTypeReference();
                case TokenType.StringLiteral:
                    return parseStringLiteralTypeNode();
                case TokenType.void:
                case TokenType.null:
                    return parseTokenNode<TypeNode>();
                case TokenType.this: {
                    const thisKeyword = parseThisTypeNode();
                    if (token === TokenType.is && !scanner.hasPrecedingLineBreak()) {
                        return parseThisTypePredicate(thisKeyword);
                    }
                    else {
                        return thisKeyword;
                    }
                }
                case TokenType.typeOf:
                    return parseTypeQuery();
                case TokenType.openBrace:
                    return parseTypeLiteral();
                case TokenType.openBracket:
                    return parseTupleType();
                case TokenType.openParen:
                    return parseParenthesizedType();
                default:
                    return parseTypeReference();
            }
        }

        function isStartOfType(): boolean {
            switch (token) {
                case TokenType.any:
                case TokenType.string:
                case TokenType.number:
                case TokenType.boolean:
                case TokenType.symbol:
                case TokenType.void:
                case TokenType.undefined:
                case TokenType.null:
                case TokenType.this:
                case TokenType.typeOf:
                case TokenType.never:
                case TokenType.openBrace:
                case TokenType.openBracket:
                case TokenType.lessThan:
                case TokenType.new:
                case TokenType.StringLiteral:
                    return true;
                case TokenType.openParen:
                    // Only consider '(' the start of a type if followed by ')', '...', an identifier, a modifier,
                    // or something that starts a type. We don't want to consider things like '(1)' a type.
                    return lookAhead(isStartOfParenthesizedOrFunctionType);
                default:
                    return isIdentifier();
            }
        }

        function isStartOfParenthesizedOrFunctionType() {
            nextToken();
            return token === TokenType.closeParen || isStartOfParameter() || isStartOfType();
        }

        function parseArrayTypeOrHigher(): TypeNode {
            let type = parseNonArrayType();
            while (!scanner.hasPrecedingLineBreak() && parseOptional(TokenType.openBracket)) {
                parseExpected(TokenType.closeBracket);
                const node = <ArrayTypeNode>createNode(TokenType.ArrayType, type.pos);
                node.elementType = type;
                type = finishNode(node);
            }
            return type;
        }

        function parseUnionOrIntersectionType(kind: TokenType, parseConstituentType: () => TypeNode, operator: TokenType): TypeNode {
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

        function parseIntersectionTypeOrHigher(): TypeNode {
            return parseUnionOrIntersectionType(TokenType.IntersectionType, parseArrayTypeOrHigher, TokenType.ampersand);
        }

        function parseUnionTypeOrHigher(): TypeNode {
            return parseUnionOrIntersectionType(TokenType.UnionType, parseIntersectionTypeOrHigher, TokenType.bar);
        }

        function isStartOfFunctionType(): boolean {
            if (token === TokenType.lessThan) {
                return true;
            }
            return token === TokenType.openParen && lookAhead(isUnambiguouslyStartOfFunctionType);
        }

        function skipParameterStart(): boolean {
            if (isModifierKind(token)) {
                // Skip modifiers
                parseModifiers();
            }
            if (isIdentifier() || token === TokenType.this) {
                nextToken();
                return true;
            }
            if (token === TokenType.openBracket || token === TokenType.openBrace) {
                // Return true if we can parse an array or object binding pattern with no errors
                const previousErrorCount = parseDiagnostics.length;
                parseIdentifierOrPattern();
                return previousErrorCount === parseDiagnostics.length;
            }
            return false;
        }

        function isUnambiguouslyStartOfFunctionType() {
            nextToken();
            if (token === TokenType.closeParen || token === TokenType.dotDotDot) {
                // ( )
                // ( ...
                return true;
            }
            if (skipParameterStart()) {
                // We successfully skipped modifiers (if any) and an identifier or binding pattern,
                // now see if we have something that indicates a parameter declaration
                if (token === TokenType.colon || token === TokenType.comma ||
                    token === TokenType.question || token === TokenType.equals) {
                    // ( xxx :
                    // ( xxx ,
                    // ( xxx ?
                    // ( xxx =
                    return true;
                }
                if (token === TokenType.closeParen) {
                    nextToken();
                    if (token === TokenType.equalsGreaterThan) {
                        // ( xxx ) =>
                        return true;
                    }
                }
            }
            return false;
        }

        function parseTypeOrTypePredicate(): TypeNode {
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

        function parseTypePredicatePrefix() {
            const id = parseIdentifier();
            if (token === TokenType.is && !scanner.hasPrecedingLineBreak()) {
                nextToken();
                return id;
            }
        }

        function parseType(): TypeNode {
            // The rules about 'yield' only apply to actual code/expression contexts.  They don't
            // apply to 'type' contexts.  So we disable these parameters here before moving on.
            return doOutsideOfContext(NodeFlags.TypeExcludesFlags, parseTypeWorker);
        }

        function parseTypeWorker(): TypeNode {
            if (isStartOfFunctionType()) {
                return parseFunctionOrConstructorType(TokenType.FunctionType);
            }
            if (token === TokenType.new) {
                return parseFunctionOrConstructorType(TokenType.ConstructorType);
            }
            return parseUnionTypeOrHigher();
        }

        function parseTypeAnnotation(): TypeNode {
            return parseOptional(TokenType.colon) ? parseType() : undefined;
        }

        // EXPRESSIONS
        function isStartOfLeftHandSideExpression(): boolean {
            switch (token) {
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
                    return isIdentifier();
            }
        }

        function isStartOfExpression(): boolean {
            if (isStartOfLeftHandSideExpression()) {
                return true;
            }

            switch (token) {
                case TokenType.plus:
                case TokenType.minus:
                case TokenType.tilde:
                case TokenType.exclamation:
                case TokenType.delete:
                case TokenType.typeOf:
                case TokenType.void:
                case TokenType.plusPlus:
                case TokenType.minusMinus:
                case TokenType.lessThan:
                case TokenType.await:
                case TokenType.yield:
                    // Yield/await always starts an expression.  Either it is an identifier (in which case
                    // it is definitely an expression).  Or it's a keyword (either because we're in
                    // a generator or async function, or in strict mode (or both)) and it started a yield or await expression.
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

        function isStartOfExpressionStatement(): boolean {
            // As per the grammar, none of '{' or 'function' or 'class' can start an expression statement.
            return token !== TokenType.openBrace &&
                token !== TokenType.function &&
                token !== TokenType.class &&
                token !== TokenType.at &&
                isStartOfExpression();
        }

        function parseExpression(): Expression {
            // Expression[in]:
            //      AssignmentExpression[in]
            //      Expression[in] , AssignmentExpression[in]

            // clear the decorator context when parsing Expression, as it should be unambiguous when parsing a decorator
            const saveDecoratorContext = inDecoratorContext();
            if (saveDecoratorContext) {
                setDecoratorContext(/*val*/ false);
            }

            let expr = parseAssignmentExpressionOrHigher();
            let operatorToken: Node;
            while ((operatorToken = parseOptionalToken(TokenType.comma))) {
                expr = makeBinaryExpression(expr, operatorToken, parseAssignmentExpressionOrHigher());
            }

            if (saveDecoratorContext) {
                setDecoratorContext(/*val*/ true);
            }
            return expr;
        }

        function parseInitializer(inParameter: boolean): Expression {
            if (token !== TokenType.equals) {
                // It's not uncommon during typing for the user to miss writing the '=' token.  Check if
                // there is no newline after the last token and if we're on an expression.  If so, parse
                // this as an equals-value clause with a missing equals.
                // NOTE: There are two places where we allow equals-value clauses.  The first is in a
                // variable declarator.  The second is with a parameter.  For variable declarators
                // it's more likely that a { would be a allowed (as an object literal).  While this
                // is also allowed for parameters, the risk is that we consume the { as an object
                // literal when it really will be for the block following the parameter.
                if (scanner.hasPrecedingLineBreak() || (inParameter && token === TokenType.openBrace) || !isStartOfExpression()) {
                    // preceding line break, open brace in a parameter (likely a function body) or current token is not an expression -
                    // do not try to parse initializer
                    return undefined;
                }
            }

            // Initializer[In, Yield] :
            //     = AssignmentExpression[?In, ?Yield]

            parseExpected(TokenType.equals);
            return parseAssignmentExpressionOrHigher();
        }

        function parseAssignmentExpressionOrHigher(): Expression {
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
            if (isYieldExpression()) {
                return parseYieldExpression();
            }

            // Then, check if we have an arrow function (production '4' and '5') that starts with a parenthesized
            // parameter list or is an async arrow function.
            // AsyncArrowFunctionExpression:
            //      1) async[no LineTerminator here]AsyncArrowBindingIdentifier[?Yield][no LineTerminator here]=>AsyncConciseBody[?In]
            //      2) CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await][no LineTerminator here]=>AsyncConciseBody[?In]
            // Production (1) of AsyncArrowFunctionExpression is parsed in "tryParseAsyncSimpleArrowFunctionExpression".
            // And production (2) is parsed in "tryParseParenthesizedArrowFunctionExpression".
            //
            // If we do successfully parse arrow-function, we must *not* recurse for productions 1, 2 or 3. An ArrowFunction is
            // not a  LeftHandSideExpression, nor does it start a ConditionalExpression.  So we are done
            // with AssignmentExpression if we see one.
            const arrowExpression = tryParseParenthesizedArrowFunctionExpression() || tryParseAsyncSimpleArrowFunctionExpression();
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
            const expr = parseBinaryExpressionOrHigher(/*precedence*/ 0);

            // To avoid a look-ahead, we did not handle the case of an arrow function with a single un-parenthesized
            // parameter ('x => ...') above. We handle it here by checking if the parsed expression was a single
            // identifier and the current token is an arrow.
            if (expr.kind === TokenType.Identifier && token === TokenType.equalsGreaterThan) {
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

        function isYieldExpression(): boolean {
            if (token === TokenType.yield) {
                // If we have a 'yield' keyword, and this is a context where yield expressions are
                // allowed, then definitely parse out a yield expression.
                if (inYieldContext()) {
                    return true;
                }

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
                return lookAhead(nextTokenIsIdentifierOrKeywordOrNumberOnSameLine);
            }

            return false;
        }

        function nextTokenIsIdentifierOnSameLine() {
            nextToken();
            return !scanner.hasPrecedingLineBreak() && isIdentifier();
        }

        function parseYieldExpression(): YieldExpression {
            const node = <YieldExpression>createNode(TokenType.YieldExpression);

            // YieldExpression[In] :
            //      yield
            //      yield [no LineTerminator here] [Lexical goal InputElementRegExp]AssignmentExpression[?In, Yield]
            //      yield [no LineTerminator here] * [Lexical goal InputElementRegExp]AssignmentExpression[?In, Yield]
            nextToken();

            if (!scanner.hasPrecedingLineBreak() &&
                (token === TokenType.asterisk || isStartOfExpression())) {
                node.asteriskToken = parseOptionalToken(TokenType.asterisk);
                node.expression = parseAssignmentExpressionOrHigher();
                return finishNode(node);
            }
            else {
                // if the next token is not on the same line as yield.  or we don't have an '*' or
                // the start of an expression, then this is just a simple "yield" expression.
                return finishNode(node);
            }
        }

        function parseSimpleArrowFunctionExpression(identifier: Identifier, asyncModifier?: ModifiersArray): ArrowFunction {
            Debug.assert(token === TokenType.equalsGreaterThan, "parseSimpleArrowFunctionExpression should only have been called if we had a =>");

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

            node.equalsGreaterThanToken = parseExpectedToken(TokenType.equalsGreaterThan, /*reportAtCurrentPosition*/ false, Diagnostics._0_expected, "=>");
            node.body = parseArrowFunctionExpressionBody(/*isAsync*/ !!asyncModifier);

            return finishNode(node);
        }

        function tryParseParenthesizedArrowFunctionExpression(): Expression {
            const triState = isParenthesizedArrowFunctionExpression();
            if (triState === Tristate.False) {
                // It's definitely not a parenthesized arrow function expression.
                return undefined;
            }

            // If we definitely have an arrow function, then we can just parse one, not requiring a
            // following => or { token. Otherwise, we *might* have an arrow function.  Try to parse
            // it out, but don't allow any ambiguity, and return 'undefined' if this could be an
            // expression instead.
            const arrowFunction = triState === Tristate.True
                ? parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ true)
                : tryParse(parsePossibleParenthesizedArrowFunctionExpressionHead);

            if (!arrowFunction) {
                // Didn't appear to actually be a parenthesized arrow function.  Just bail out.
                return undefined;
            }

            const isAsync = !!(arrowFunction.flags & NodeFlags.Async);

            // If we have an arrow, then try to parse the body. Even if not, try to parse if we
            // have an opening brace, just in case we're in an error state.
            const lastToken = token;
            arrowFunction.equalsGreaterThanToken = parseExpectedToken(TokenType.equalsGreaterThan, /*reportAtCurrentPosition*/false, Diagnostics._0_expected, "=>");
            arrowFunction.body = (lastToken === TokenType.equalsGreaterThan || lastToken === TokenType.openBrace)
                ? parseArrowFunctionExpressionBody(isAsync)
                : parseIdentifier();

            return finishNode(arrowFunction);
        }

        //  True        -> We definitely expect a parenthesized arrow function here.
        //  False       -> There *cannot* be a parenthesized arrow function here.
        //  Unknown     -> There *might* be a parenthesized arrow function here.
        //                 Speculatively look ahead to be sure, and rollback if not.
        function isParenthesizedArrowFunctionExpression(): Tristate {
            if (token === TokenType.openParen || token === TokenType.lessThan || token === TokenType.async) {
                return lookAhead(isParenthesizedArrowFunctionExpressionWorker);
            }

            if (token === TokenType.equalsGreaterThan) {
                // ERROR RECOVERY TWEAK:
                // If we see a standalone => try to parse it as an arrow function expression as that's
                // likely what the user intended to write.
                return Tristate.True;
            }
            // Definitely not a parenthesized arrow function.
            return Tristate.False;
        }

        function isParenthesizedArrowFunctionExpressionWorker() {
            if (token === TokenType.async) {
                nextToken();
                if (scanner.hasPrecedingLineBreak()) {
                    return Tristate.False;
                }
                if (token !== TokenType.openParen && token !== TokenType.lessThan) {
                    return Tristate.False;
                }
            }

            const first = token;
            const second = nextToken();

            if (first === TokenType.openParen) {
                if (second === TokenType.closeParen) {
                    // Simple cases: "() =>", "(): ", and  "() {".
                    // This is an arrow function with no parameters.
                    // The last one is not actually an arrow function,
                    // but this is probably what the user intended.
                    const third = nextToken();
                    switch (third) {
                        case TokenType.equalsGreaterThan:
                        case TokenType.colon:
                        case TokenType.openBrace:
                            return Tristate.True;
                        default:
                            return Tristate.False;
                    }
                }

                // If encounter "([" or "({", this could be the start of a binding pattern.
                // Examples:
                //      ([ x ]) => { }
                //      ({ x }) => { }
                //      ([ x ])
                //      ({ x })
                if (second === TokenType.openBracket || second === TokenType.openBrace) {
                    return Tristate.Unknown;
                }

                // Simple case: "(..."
                // This is an arrow function with a rest parameter.
                if (second === TokenType.dotDotDot) {
                    return Tristate.True;
                }

                // If we had "(" followed by something that's not an identifier,
                // then this definitely doesn't look like a lambda.
                // Note: we could be a little more lenient and allow
                // "(public" or "(private". These would not ever actually be allowed,
                // but we could provide a good error message instead of bailing out.
                if (!isIdentifier()) {
                    return Tristate.False;
                }

                // If we have something like "(a:", then we must have a
                // type-annotated parameter in an arrow function expression.
                if (nextToken() === TokenType.colon) {
                    return Tristate.True;
                }

                // This *could* be a parenthesized arrow function.
                // Return Unknown to let the caller know.
                return Tristate.Unknown;
            }
            else {
                Debug.assert(first === TokenType.lessThan);

                // If we have "<" not followed by an identifier,
                // then this definitely is not an arrow function.
                if (!isIdentifier()) {
                    return Tristate.False;
                }

                // JSX overrides
                if (sourceFile.languageVariant === LanguageVariant.JSX) {
                    const isArrowFunctionInJsx = lookAhead(() => {
                        const third = nextToken();
                        if (third === TokenType.extends) {
                            const fourth = nextToken();
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
                        return Tristate.True;
                    }

                    return Tristate.False;
                }

                // This *could* be a parenthesized arrow function.
                return Tristate.Unknown;
            }
        }

        function parsePossibleParenthesizedArrowFunctionExpressionHead(): ArrowFunction {
            return parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ false);
        }

        function tryParseAsyncSimpleArrowFunctionExpression(): ArrowFunction {
            // We do a check here so that we won't be doing unnecessarily call to "lookAhead"
            if (token === TokenType.async) {
                const isUnParenthesizedAsyncArrowFunction = lookAhead(isUnParenthesizedAsyncArrowFunctionWorker);
                if (isUnParenthesizedAsyncArrowFunction === Tristate.True) {
                    const asyncModifier = parseModifiersForArrowFunction();
                    const expr = parseBinaryExpressionOrHigher(/*precedence*/ 0);
                    return parseSimpleArrowFunctionExpression(<Identifier>expr, asyncModifier);
                }
            }
            return undefined;
        }

        function isUnParenthesizedAsyncArrowFunctionWorker(): Tristate {
            // AsyncArrowFunctionExpression:
            //      1) async[no LineTerminator here]AsyncArrowBindingIdentifier[?Yield][no LineTerminator here]=>AsyncConciseBody[?In]
            //      2) CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await][no LineTerminator here]=>AsyncConciseBody[?In]
            if (token === TokenType.async) {
                nextToken();
                // If the "async" is followed by "=>" token then it is not a begining of an async arrow-function
                // but instead a simple arrow-function which will be parsed inside "parseAssignmentExpressionOrHigher"
                if (scanner.hasPrecedingLineBreak() || token === TokenType.equalsGreaterThan) {
                    return Tristate.False;
                }
                // Check for un-parenthesized AsyncArrowFunction
                const expr = parseBinaryExpressionOrHigher(/*precedence*/ 0);
                if (!scanner.hasPrecedingLineBreak() && expr.kind === TokenType.Identifier && token === TokenType.equalsGreaterThan) {
                    return Tristate.True;
                }
            }

            return Tristate.False;
        }

        function parseParenthesizedArrowFunctionExpressionHead(allowAmbiguity: boolean): ArrowFunction {
            const node = <ArrowFunction>createNode(TokenType.ArrowFunction);
            setModifiers(node, parseModifiersForArrowFunction());
            const isAsync = !!(node.flags & NodeFlags.Async);

            // Arrow functions are never generators.
            //
            // If we're speculatively parsing a signature for a parenthesized arrow function, then
            // we have to have a complete parameter list.  Otherwise we might see something like
            // a => (b => c)
            // And think that "(b =>" was actually a parenthesized arrow function with a missing
            // close paren.
            fillSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ !allowAmbiguity, node);

            // If we couldn't get parameters, we definitely could not parse out an arrow function.
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
            if (!allowAmbiguity && token !== TokenType.equalsGreaterThan && token !== TokenType.openBrace) {
                // Returning undefined here will cause our caller to rewind to where we started from.
                return undefined;
            }

            return node;
        }

        function parseArrowFunctionExpressionBody(isAsync: boolean): Block | Expression {
            if (token === TokenType.openBrace) {
                return parseFunctionBlock(/*allowYield*/ false, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);
            }

            if (token !== TokenType.semicolon &&
                token !== TokenType.function &&
                token !== TokenType.class &&
                isStartOfStatement() &&
                !isStartOfExpressionStatement()) {
                // Check if we got a plain statement (i.e. no expression-statements, no function/class expressions/declarations)
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

        function parseConditionalExpressionRest(leftOperand: Expression): Expression {
            // Note: we are passed in an expression which was produced from parseBinaryExpressionOrHigher.
            const questionToken = parseOptionalToken(TokenType.question);
            if (!questionToken) {
                return leftOperand;
            }

            // Note: we explicitly 'allowIn' in the whenTrue part of the condition expression, and
            // we do not that for the 'whenFalse' part.
            const node = <ConditionalExpression>createNode(TokenType.ConditionalExpression, leftOperand.pos);
            node.condition = leftOperand;
            node.questionToken = questionToken;
            node.whenTrue = doOutsideOfContext(disallowInAndDecoratorContext, parseAssignmentExpressionOrHigher);
            node.colonToken = parseExpectedToken(TokenType.colon, /*reportAtCurrentPosition*/ false,
                Diagnostics._0_expected, tokenToString(TokenType.colon));
            node.whenFalse = parseAssignmentExpressionOrHigher();
            return finishNode(node);
        }

        function parseBinaryExpressionOrHigher(precedence: number): Expression {
            const leftOperand = parseUnaryExpressionOrHigher();
            return parseBinaryExpressionRest(precedence, leftOperand);
        }

        function isInOrOfKeyword(t: TokenType) {
            return t === TokenType.in || t === TokenType.of;
        }

        function parseBinaryExpressionRest(precedence: number, leftOperand: Expression): Expression {
            while (true) {
                // We either have a binary operator here, or we're finished.  We call
                // reScanGreaterToken so that we merge token sequences like > and = into >=

                reScanGreaterToken();
                const newPrecedence = getBinaryOperatorPrecedence();

                // Check the precedence to see if we should "take" this operator
                // - For left associative operator (all operator but **), consume the operator,
                //   recursively call the function below, and parse binaryExpression as a rightOperand
                //   of the caller if the new precedence of the operator is greater then or equal to the current precedence.
                //   For example:
                //      a - b - c;
                //            ^token; leftOperand = b. Return b to the caller as a rightOperand
                //      a * b - c
                //            ^token; leftOperand = b. Return b to the caller as a rightOperand
                //      a - b * c;
                //            ^token; leftOperand = b. Return b * c to the caller as a rightOperand
                // - For right associative operator (**), consume the operator, recursively call the function
                //   and parse binaryExpression as a rightOperand of the caller if the new precedence of
                //   the operator is strictly grater than the current precedence
                //   For example:
                //      a ** b ** c;
                //             ^^token; leftOperand = b. Return b ** c to the caller as a rightOperand
                //      a - b ** c;
                //            ^^token; leftOperand = b. Return b ** c to the caller as a rightOperand
                //      a ** b - c
                //             ^token; leftOperand = b. Return b to the caller as a rightOperand
                const consumeCurrentOperator = token === TokenType.asteriskAsterisk ?
                    newPrecedence >= precedence :
                    newPrecedence > precedence;

                if (!consumeCurrentOperator) {
                    break;
                }

                if (token === TokenType.in && inDisallowInContext()) {
                    break;
                }

                if (token === TokenType.as) {
                    // Make sure we *do* perform ASI for constructs like this:
                    //    var x = foo
                    //    as (Bar)
                    // This should be parsed as an initialized variable, followed
                    // by a function call to 'as' with the argument 'Bar'
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

        function isBinaryOperator() {
            if (inDisallowInContext() && token === TokenType.in) {
                return false;
            }

            return getBinaryOperatorPrecedence() > 0;
        }

        function getBinaryOperatorPrecedence(): number {
            switch (token) {
                case TokenType.barBar:
                    return 1;
                case TokenType.ampersandAmpersand:
                    return 2;
                case TokenType.bar:
                    return 3;
                case TokenType.caret:
                    return 4;
                case TokenType.ampersand:
                    return 5;
                case TokenType.equalsEquals:
                case TokenType.exclamationEquals:
                case TokenType.equalsEqualsEquals:
                case TokenType.exclamationEqualsEquals:
                    return 6;
                case TokenType.lessThan:
                case TokenType.greaterThan:
                case TokenType.lessThanEquals:
                case TokenType.greaterThanEquals:
                case TokenType.instanceOf:
                case TokenType.in:
                case TokenType.as:
                    return 7;
                case TokenType.lessThanLessThan:
                case TokenType.greaterThanGreaterThan:
                case TokenType.greaterThanGreaterThanGreaterThan:
                    return 8;
                case TokenType.plus:
                case TokenType.minus:
                    return 9;
                case TokenType.asterisk:
                case TokenType.slash:
                case TokenType.percent:
                    return 10;
                case TokenType.asteriskAsterisk:
                    return 11;
            }

            // -1 is lower than all other precedences.  Returning it will cause binary expression
            // parsing to stop.
            return -1;
        }

        function makeBinaryExpression(left: Expression, operatorToken: Node, right: Expression): BinaryExpression {
            const node = <BinaryExpression>createNode(TokenType.BinaryExpression, left.pos);
            node.left = left;
            node.operatorToken = operatorToken;
            node.right = right;
            return finishNode(node);
        }

        function makeAsExpression(left: Expression, right: TypeNode): AsExpression {
            const node = <AsExpression>createNode(TokenType.AsExpression, left.pos);
            node.expression = left;
            node.type = right;
            return finishNode(node);
        }

        function parsePrefixUnaryExpression() {
            const node = <PrefixUnaryExpression>createNode(TokenType.PrefixUnaryExpression);
            node.operator = token;
            nextToken();
            node.operand = parseSimpleUnaryExpression();

            return finishNode(node);
        }

        function parseDeleteExpression() {
            const node = <DeleteExpression>createNode(TokenType.DeleteExpression);
            nextToken();
            node.expression = parseSimpleUnaryExpression();
            return finishNode(node);
        }

        function parseTypeOfExpression() {
            const node = <TypeOfExpression>createNode(TokenType.TypeOfExpression);
            nextToken();
            node.expression = parseSimpleUnaryExpression();
            return finishNode(node);
        }

        function parseVoidExpression() {
            const node = <VoidExpression>createNode(TokenType.VoidExpression);
            nextToken();
            node.expression = parseSimpleUnaryExpression();
            return finishNode(node);
        }

        function isAwaitExpression(): boolean {
            if (token === TokenType.await) {
                if (inAwaitContext()) {
                    return true;
                }

                // here we are using similar heuristics as 'isYieldExpression'
                return lookAhead(nextTokenIsIdentifierOnSameLine);
            }

            return false;
        }

        function parseAwaitExpression() {
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
        function parseUnaryExpressionOrHigher(): UnaryExpression | BinaryExpression {
            if (isAwaitExpression()) {
                return parseAwaitExpression();
            }

            if (isIncrementExpression()) {
                const incrementExpression = parseIncrementExpression();
                return token === TokenType.asteriskAsterisk ?
                    <BinaryExpression>parseBinaryExpressionRest(getBinaryOperatorPrecedence(), incrementExpression) :
                    incrementExpression;
            }

            const unaryOperator = token;
            const simpleUnaryExpression = parseSimpleUnaryExpression();
            if (token === TokenType.asteriskAsterisk) {
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
        function parseSimpleUnaryExpression(): UnaryExpression {
            switch (token) {
                case TokenType.plus:
                case TokenType.minus:
                case TokenType.tilde:
                case TokenType.exclamation:
                    return parsePrefixUnaryExpression();
                case TokenType.delete:
                    return parseDeleteExpression();
                case TokenType.typeOf:
                    return parseTypeOfExpression();
                case TokenType.void:
                    return parseVoidExpression();
                case TokenType.lessThan:
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
        function isIncrementExpression(): boolean {
            // This function is called inside parseUnaryExpression to decide
            // whether to call parseSimpleUnaryExpression or call parseIncrementExpression directly
            switch (token) {
                case TokenType.plus:
                case TokenType.minus:
                case TokenType.tilde:
                case TokenType.exclamation:
                case TokenType.delete:
                case TokenType.typeOf:
                case TokenType.void:
                    return false;
                case TokenType.lessThan:
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
        function parseIncrementExpression(): IncrementExpression {
            if (token === TokenType.plusPlus || token === TokenType.minusMinus) {
                const node = <PrefixUnaryExpression>createNode(TokenType.PrefixUnaryExpression);
                node.operator = token;
                nextToken();
                node.operand = parseLeftHandSideExpressionOrHigher();
                return finishNode(node);
            }
            else if (sourceFile.languageVariant === LanguageVariant.JSX && token === TokenType.lessThan && lookAhead(nextTokenIsIdentifierOrKeyword)) {
                // JSXElement is part of primaryExpression
                return parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ true);
            }

            const expression = parseLeftHandSideExpressionOrHigher();

            Debug.assert(isLeftHandSideExpression(expression));
            if ((token === TokenType.plusPlus || token === TokenType.minusMinus) && !scanner.hasPrecedingLineBreak()) {
                const node = <PostfixUnaryExpression>createNode(TokenType.PostfixUnaryExpression, expression.pos);
                node.operand = expression;
                node.operator = token;
                nextToken();
                return finishNode(node);
            }

            return expression;
        }

        function parseLeftHandSideExpressionOrHigher(): LeftHandSideExpression {
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
            const expression = token === TokenType.super
                ? parseSuperExpression()
                : parseMemberExpressionOrHigher();

            // Now, we *may* be complete.  However, we might have consumed the start of a
            // CallExpression.  As such, we need to consume the rest of it here to be complete.
            return parseCallExpressionRest(expression);
        }

        function parseMemberExpressionOrHigher(): MemberExpression {
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

        function parseSuperExpression(): MemberExpression {
            const expression = parseTokenNode<PrimaryExpression>();
            if (token === TokenType.openParen || token === TokenType.dot || token === TokenType.openBracket) {
                return expression;
            }

            // If we have seen "super" it must be followed by '(' or '.'.
            // If it wasn't then just try to parse out a '.' and report an error.
            const node = <PropertyAccessExpression>createNode(TokenType.PropertyAccessExpression, expression.pos);
            node.expression = expression;
            parseExpectedToken(TokenType.dot, /*reportAtCurrentPosition*/ false, Diagnostics.super_must_be_followed_by_an_argument_list_or_member_access);
            node.name = parseRightSideOfDot(/*allowIdentifierNames*/ true);
            return finishNode(node);
        }

        function tagNamesAreEquivalent(lhs: JsxTagNameExpression, rhs: JsxTagNameExpression): boolean {
            if (lhs.kind !== rhs.kind) {
                return false;
            }

            if (lhs.kind === TokenType.Identifier) {
                return (<Identifier>lhs).text === (<Identifier>rhs).text;
            }

            if (lhs.kind === TokenType.this) {
                return true;
            }

            // If we are at this statement then we must have PropertyAccessExpression and because tag name in Jsx element can only
            // take forms of JsxTagNameExpression which includes an identifier, "this" expression, or another propertyAccessExpression
            // it is safe to case the expression property as such. See parseJsxElementName for how we parse tag name in Jsx element
            return (<PropertyAccessExpression>lhs).name.text === (<PropertyAccessExpression>rhs).name.text &&
                tagNamesAreEquivalent((<PropertyAccessExpression>lhs).expression as JsxTagNameExpression, (<PropertyAccessExpression>rhs).expression as JsxTagNameExpression);
        }


        function parseJsxElementOrSelfClosingElement(inExpressionContext: boolean): JsxElement | JsxSelfClosingElement {
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
            if (inExpressionContext && token === TokenType.lessThan) {
                const invalidElement = tryParse(() => parseJsxElementOrSelfClosingElement(/*inExpressionContext*/true));
                if (invalidElement) {
                    parseErrorAtCurrentToken(Diagnostics.JSX_expressions_must_have_one_parent_element);
                    const badNode = <BinaryExpression>createNode(TokenType.BinaryExpression, result.pos);
                    badNode.end = invalidElement.end;
                    badNode.left = result;
                    badNode.right = invalidElement;
                    badNode.operatorToken = createMissingNode(TokenType.comma, /*reportAtCurrentPosition*/ false, /*diagnosticMessage*/ undefined);
                    badNode.operatorToken.pos = badNode.operatorToken.end = badNode.right.pos;
                    return <JsxElement><Node>badNode;
                }
            }

            return result;
        }

        function parseJsxText(): JsxText {
            const node = <JsxText>createNode(TokenType.JsxText, scanner.getStartPos());
            token = scanner.scanJsxToken();
            return finishNode(node);
        }

        function parseJsxChild(): JsxChild {
            switch (token) {
                case TokenType.JsxText:
                    return parseJsxText();
                case TokenType.openBrace:
                    return parseJsxExpression(/*inExpressionContext*/ false);
                case TokenType.lessThan:
                    return parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ false);
            }
            Debug.fail("Unknown JSX child kind " + token);
        }

        function parseJsxChildren(openingTagName: LeftHandSideExpression): NodeArray<JsxChild> {
            const result = <NodeArray<JsxChild>>[];
            result.pos = scanner.getStartPos();
            const saveParsingContext = parsingContext;
            parsingContext |= 1 << ParsingContext.JsxChildren;

            while (true) {
                token = scanner.reScanJsxToken();
                if (token === TokenType.lessThanSlash) {
                    // Closing tag
                    break;
                }
                else if (token === TokenType.endOfFile) {
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

        function parseJsxOpeningOrSelfClosingElement(inExpressionContext: boolean): JsxOpeningElement | JsxSelfClosingElement {
            const fullStart = scanner.getStartPos();

            parseExpected(TokenType.lessThan);

            const tagName = parseJsxElementName();

            const attributes = parseList(ParsingContext.JsxAttributes, parseJsxAttribute);
            let node: JsxOpeningLikeElement;

            if (token === TokenType.greaterThan) {
                // Closing tag, so scan the immediately-following text with the JSX scanning instead
                // of regular scanning to avoid treating illegal characters (e.g. '#') as immediate
                // scanning errors
                node = <JsxOpeningElement>createNode(TokenType.JsxOpeningElement, fullStart);
                scanJsxText();
            }
            else {
                parseExpected(TokenType.slash);
                if (inExpressionContext) {
                    parseExpected(TokenType.greaterThan);
                }
                else {
                    parseExpected(TokenType.greaterThan, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
                    scanJsxText();
                }
                node = <JsxSelfClosingElement>createNode(TokenType.JsxSelfClosingElement, fullStart);
            }

            node.tagName = tagName;
            node.attributes = attributes;

            return finishNode(node);
        }

        function parseJsxElementName(): JsxTagNameExpression {
            scanJsxIdentifier();
            // JsxElement can have name in the form of
            //      propertyAccessExpression
            //      primaryExpression in the form of an identifier and "this" keyword
            // We can't just simply use parseLeftHandSideExpressionOrHigher because then we will start consider class,function etc as a keyword
            // We only want to consider "this" as a primaryExpression
            let expression: JsxTagNameExpression = token === TokenType.this ?
                parseTokenNode<PrimaryExpression>() : parseIdentifierName();
            while (parseOptional(TokenType.dot)) {
                const propertyAccess: PropertyAccessExpression = <PropertyAccessExpression>createNode(TokenType.PropertyAccessExpression, expression.pos);
                propertyAccess.expression = expression;
                propertyAccess.name = parseRightSideOfDot(/*allowIdentifierNames*/ true);
                expression = finishNode(propertyAccess);
            }
            return expression;
        }

        function parseJsxExpression(inExpressionContext: boolean): JsxExpression {
            const node = <JsxExpression>createNode(TokenType.JsxExpression);

            parseExpected(TokenType.openBrace);
            if (token !== TokenType.closeBrace) {
                node.expression = parseAssignmentExpressionOrHigher();
            }
            if (inExpressionContext) {
                parseExpected(TokenType.closeBrace);
            }
            else {
                parseExpected(TokenType.closeBrace, /*message*/ undefined, /*shouldAdvance*/ false);
                scanJsxText();
            }

            return finishNode(node);
        }

        function parseJsxAttribute(): JsxAttribute | JsxSpreadAttribute {
            if (token === TokenType.openBrace) {
                return parseJsxSpreadAttribute();
            }

            scanJsxIdentifier();
            const node = <JsxAttribute>createNode(TokenType.JsxAttribute);
            node.name = parseIdentifierName();
            if (parseOptional(TokenType.equals)) {
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

        function parseJsxSpreadAttribute(): JsxSpreadAttribute {
            const node = <JsxSpreadAttribute>createNode(TokenType.JsxSpreadAttribute);
            parseExpected(TokenType.openBrace);
            parseExpected(TokenType.dotDotDot);
            node.expression = parseExpression();
            parseExpected(TokenType.closeBrace);
            return finishNode(node);
        }

        function parseJsxClosingElement(inExpressionContext: boolean): JsxClosingElement {
            const node = <JsxClosingElement>createNode(TokenType.JsxClosingElement);
            parseExpected(TokenType.lessThanSlash);
            node.tagName = parseJsxElementName();
            if (inExpressionContext) {
                parseExpected(TokenType.greaterThan);
            }
            else {
                parseExpected(TokenType.greaterThan, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
                scanJsxText();
            }
            return finishNode(node);
        }

        function parseTypeAssertion(): TypeAssertion {
            const node = <TypeAssertion>createNode(TokenType.TypeAssertionExpression);
            parseExpected(TokenType.lessThan);
            node.type = parseType();
            parseExpected(TokenType.greaterThan);
            node.expression = parseSimpleUnaryExpression();
            return finishNode(node);
        }

        function parseMemberExpressionRest(expression: LeftHandSideExpression): MemberExpression {
            while (true) {
                const dotToken = parseOptionalToken(TokenType.dot);
                if (dotToken) {
                    const propertyAccess = <PropertyAccessExpression>createNode(TokenType.PropertyAccessExpression, expression.pos);
                    propertyAccess.expression = expression;
                    propertyAccess.name = parseRightSideOfDot(/*allowIdentifierNames*/ true);
                    expression = finishNode(propertyAccess);
                    continue;
                }

                if (token === TokenType.exclamation && !scanner.hasPrecedingLineBreak()) {
                    nextToken();
                    const nonNullExpression = <NonNullExpression>createNode(TokenType.NonNullExpression, expression.pos);
                    nonNullExpression.expression = expression;
                    expression = finishNode(nonNullExpression);
                    continue;
                }

                // when in the [Decorator] context, we do not parse ElementAccess as it could be part of a ComputedPropertyName
                if (!inDecoratorContext() && parseOptional(TokenType.openBracket)) {
                    const indexedAccess = <ElementAccessExpression>createNode(TokenType.ElementAccessExpression, expression.pos);
                    indexedAccess.expression = expression;

                    // It's not uncommon for a user to write: "new Type[]".
                    // Check for that common pattern and report a better error message.
                    if (token !== TokenType.closeBracket) {
                        indexedAccess.argumentExpression = allowInAnd(parseExpression);
                        if (indexedAccess.argumentExpression.kind === TokenType.StringLiteral || indexedAccess.argumentExpression.kind === TokenType.NumericLiteral) {
                            const literal = <LiteralExpression>indexedAccess.argumentExpression;
                            literal.text = internIdentifier(literal.text);
                        }
                    }

                    parseExpected(TokenType.closeBracket);
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

        function parseCallExpressionRest(expression: LeftHandSideExpression): LeftHandSideExpression {
            while (true) {
                expression = parseMemberExpressionRest(expression);
                if (token === TokenType.lessThan) {
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
                else if (token === TokenType.openParen) {
                    const callExpr = <CallExpression>createNode(TokenType.CallExpression, expression.pos);
                    callExpr.expression = expression;
                    callExpr.arguments = parseArgumentList();
                    expression = finishNode(callExpr);
                    continue;
                }

                return expression;
            }
        }

        function parseArgumentList() {
            parseExpected(TokenType.openParen);
            const result = parseDelimitedList(ParsingContext.ArgumentExpressions, parseArgumentExpression);
            parseExpected(TokenType.closeParen);
            return result;
        }

        function parseTypeArgumentsInExpression() {
            if (!parseOptional(TokenType.lessThan)) {
                return undefined;
            }

            const typeArguments = parseDelimitedList(ParsingContext.TypeArguments, parseType);
            if (!parseExpected(TokenType.greaterThan)) {
                // If it doesn't have the closing >  then it's definitely not an type argument list.
                return undefined;
            }

            // If we have a '<', then only parse this as a argument list if the type arguments
            // are complete and we have an open paren.  if we don't, rewind and return nothing.
            return typeArguments && canFollowTypeArgumentsInExpression()
                ? typeArguments
                : undefined;
        }

        function canFollowTypeArgumentsInExpression(): boolean {
            switch (token) {
                case TokenType.openParen:                 // foo<x>(
                // this case are the only case where this token can legally follow a type argument
                // list.  So we definitely want to treat this as a type arg list.

                case TokenType.dot:                       // foo<x>.
                case TokenType.closeParen:                // foo<x>)
                case TokenType.closeBracket:              // foo<x>]
                case TokenType.colon:                     // foo<x>:
                case TokenType.semicolon:                 // foo<x>;
                case TokenType.question:                  // foo<x>?
                case TokenType.equalsEquals:              // foo<x> ==
                case TokenType.equalsEqualsEquals:        // foo<x> ===
                case TokenType.exclamationEquals:         // foo<x> !=
                case TokenType.exclamationEqualsEquals:   // foo<x> !==
                case TokenType.ampersandAmpersand:        // foo<x> &&
                case TokenType.barBar:                    // foo<x> ||
                case TokenType.caret:                     // foo<x> ^
                case TokenType.ampersand:                 // foo<x> &
                case TokenType.bar:                       // foo<x> |
                case TokenType.closeBrace:                // foo<x> }
                case TokenType.endOfFile:                 // foo<x>
                    // these cases can't legally follow a type arg list.  However, they're not legal
                    // expressions either.  The user is probably in the middle of a generic type. So
                    // treat it as such.
                    return true;

                case TokenType.comma:                     // foo<x>,
                case TokenType.openBrace:                 // foo<x> {
                // We don't want to treat these as type arguments.  Otherwise we'll parse this
                // as an invocation expression.  Instead, we want to parse out the expression
                // in isolation from the type arguments.

                default:
                    // Anything else treat as an expression.
                    return false;
            }
        }

        function parsePrimaryExpression(): PrimaryExpression {
            switch (token) {
                case TokenType.NumericLiteral:
                case TokenType.StringLiteral:
                case TokenType.NoSubstitutionTemplateLiteral:
                    return parseLiteralNode();
                case TokenType.this:
                case TokenType.super:
                case TokenType.null:
                case TokenType.true:
                case TokenType.false:
                    return parseTokenNode<PrimaryExpression>();
                case TokenType.openParen:
                    return parseParenthesizedExpression();
                case TokenType.openBracket:
                    return parseArrayLiteralExpression();
                case TokenType.openBrace:
                    return parseObjectLiteralExpression();
                case TokenType.async:
                    // Async arrow functions are parsed earlier in parseAssignmentExpressionOrHigher.
                    // If we encounter `async [no LineTerminator here] function` then this is an async
                    // function; otherwise, its an identifier.
                    if (!lookAhead(nextTokenIsFunctionKeywordOnSameLine)) {
                        break;
                    }

                    return parseFunctionExpression();
                case TokenType.class:
                    return parseClassExpression();
                case TokenType.function:
                    return parseFunctionExpression();
                case TokenType.new:
                    return parseNewExpression();
                case TokenType.slash:
                case TokenType.slashEquals:
                    if (reScanSlashToken() === TokenType.RegularExpressionLiteral) {
                        return parseLiteralNode();
                    }
                    break;
                case TokenType.TemplateHead:
                    return parseTemplateExpression();
            }

            return parseIdentifier(Diagnostics.Expression_expected);
        }

        function parseParenthesizedExpression(): ParenthesizedExpression {
            const node = <ParenthesizedExpression>createNode(TokenType.ParenthesizedExpression);
            parseExpected(TokenType.openParen);
            node.expression = allowInAnd(parseExpression);
            parseExpected(TokenType.closeParen);
            return finishNode(node);
        }

        function parseSpreadElement(): Expression {
            const node = <SpreadElementExpression>createNode(TokenType.SpreadElementExpression);
            parseExpected(TokenType.dotDotDot);
            node.expression = parseAssignmentExpressionOrHigher();
            return finishNode(node);
        }

        function parseArgumentOrArrayLiteralElement(): Expression {
            return token === TokenType.dotDotDot ? parseSpreadElement() :
                token === TokenType.comma ? <Expression>createNode(TokenType.OmittedExpression) :
                    parseAssignmentExpressionOrHigher();
        }

        function parseArgumentExpression(): Expression {
            return doOutsideOfContext(disallowInAndDecoratorContext, parseArgumentOrArrayLiteralElement);
        }

        function parseArrayLiteralExpression(): ArrayLiteralExpression {
            const node = <ArrayLiteralExpression>createNode(TokenType.ArrayLiteralExpression);
            parseExpected(TokenType.openBracket);
            if (scanner.hasPrecedingLineBreak()) {
                node.multiLine = true;
            }
            node.elements = parseDelimitedList(ParsingContext.ArrayLiteralMembers, parseArgumentOrArrayLiteralElement);
            parseExpected(TokenType.closeBracket);
            return finishNode(node);
        }

        function tryParseAccessorDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): AccessorDeclaration {
            if (parseContextualModifier(TokenType.get)) {
                return addJSDocComment(parseAccessorDeclaration(TokenType.GetAccessor, fullStart, decorators, modifiers));
            }
            else if (parseContextualModifier(TokenType.set)) {
                return parseAccessorDeclaration(TokenType.SetAccessor, fullStart, decorators, modifiers);
            }

            return undefined;
        }

        function parseObjectLiteralElement(): ObjectLiteralElement {
            const fullStart = scanner.getStartPos();
            const decorators = parseDecorators();
            const modifiers = parseModifiers();

            const accessor = tryParseAccessorDeclaration(fullStart, decorators, modifiers);
            if (accessor) {
                return accessor;
            }

            const asteriskToken = parseOptionalToken(TokenType.asterisk);
            const tokenIsIdentifier = isIdentifier();
            const propertyName = parsePropertyName();

            // Disallowing of optional property assignments happens in the grammar checker.
            const questionToken = parseOptionalToken(TokenType.question);
            if (asteriskToken || token === TokenType.openParen || token === TokenType.lessThan) {
                return parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, propertyName, questionToken);
            }

            // check if it is short-hand property assignment or normal property assignment
            // NOTE: if token is EqualsToken it is interpreted as CoverInitializedName production
            // CoverInitializedName[Yield] :
            //     IdentifierReference[?Yield] Initializer[In, ?Yield]
            // this is necessary because ObjectLiteral productions are also used to cover grammar for ObjectAssignmentPattern
            const isShorthandPropertyAssignment =
                tokenIsIdentifier && (token === TokenType.comma || token === TokenType.closeBrace || token === TokenType.equals);

            if (isShorthandPropertyAssignment) {
                const shorthandDeclaration = <ShorthandPropertyAssignment>createNode(TokenType.ShorthandPropertyAssignment, fullStart);
                shorthandDeclaration.name = <Identifier>propertyName;
                shorthandDeclaration.questionToken = questionToken;
                const equalsToken = parseOptionalToken(TokenType.equals);
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
                parseExpected(TokenType.colon);
                propertyAssignment.initializer = allowInAnd(parseAssignmentExpressionOrHigher);
                return addJSDocComment(finishNode(propertyAssignment));
            }
        }

        function parseObjectLiteralExpression(): ObjectLiteralExpression {
            const node = <ObjectLiteralExpression>createNode(TokenType.ObjectLiteralExpression);
            parseExpected(TokenType.openBrace);
            if (scanner.hasPrecedingLineBreak()) {
                node.multiLine = true;
            }

            node.properties = parseDelimitedList(ParsingContext.ObjectLiteralMembers, parseObjectLiteralElement, /*considerSemicolonAsDelimiter*/ true);
            parseExpected(TokenType.closeBrace);
            return finishNode(node);
        }

        function parseFunctionExpression(): FunctionExpression {
            // GeneratorExpression:
            //      function* BindingIdentifier [Yield][opt](FormalParameters[Yield]){ GeneratorBody }
            //
            // FunctionExpression:
            //      function BindingIdentifier[opt](FormalParameters){ FunctionBody }
            const saveDecoratorContext = inDecoratorContext();
            if (saveDecoratorContext) {
                setDecoratorContext(/*val*/ false);
            }

            const node = <FunctionExpression>createNode(TokenType.FunctionExpression);
            setModifiers(node, parseModifiers());
            parseExpected(TokenType.function);
            node.asteriskToken = parseOptionalToken(TokenType.asterisk);

            const isGenerator = !!node.asteriskToken;
            const isAsync = !!(node.flags & NodeFlags.Async);
            node.name =
                isGenerator && isAsync ? doInYieldAndAwaitContext(parseOptionalIdentifier) :
                    isGenerator ? doInYieldContext(parseOptionalIdentifier) :
                        isAsync ? doInAwaitContext(parseOptionalIdentifier) :
                            parseOptionalIdentifier();

            fillSignature(TokenType.colon, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, node);
            node.body = parseFunctionBlock(/*allowYield*/ isGenerator, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);

            if (saveDecoratorContext) {
                setDecoratorContext(/*val*/ true);
            }

            return addJSDocComment(finishNode(node));
        }

        function parseOptionalIdentifier() {
            return isIdentifier() ? parseIdentifier() : undefined;
        }

        function parseNewExpression(): NewExpression {
            const node = <NewExpression>createNode(TokenType.NewExpression);
            parseExpected(TokenType.new);
            node.expression = parseMemberExpressionOrHigher();
            node.typeArguments = tryParse(parseTypeArgumentsInExpression);
            if (node.typeArguments || token === TokenType.openParen) {
                node.arguments = parseArgumentList();
            }

            return finishNode(node);
        }

        // STATEMENTS
        function parseBlock(ignoreMissingOpenBrace: boolean, diagnosticMessage?: DiagnosticMessage): Block {
            const node = <Block>createNode(TokenType.Block);
            if (parseExpected(TokenType.openBrace, diagnosticMessage) || ignoreMissingOpenBrace) {
                node.statements = parseList(ParsingContext.BlockStatements, parseStatement);
                parseExpected(TokenType.closeBrace);
            }
            else {
                node.statements = createMissingList<Statement>();
            }
            return finishNode(node);
        }

        function parseFunctionBlock(allowYield: boolean, allowAwait: boolean, ignoreMissingOpenBrace: boolean, diagnosticMessage?: DiagnosticMessage): Block {
            const savedYieldContext = inYieldContext();
            setYieldContext(allowYield);

            const savedAwaitContext = inAwaitContext();
            setAwaitContext(allowAwait);

            // We may be in a [Decorator] context when parsing a function expression or
            // arrow function. The body of the function is not in [Decorator] context.
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

        function parseEmptyStatement(): Statement {
            const node = <Statement>createNode(TokenType.EmptyStatement);
            parseExpected(TokenType.semicolon);
            return finishNode(node);
        }

        function parseIfStatement(): IfStatement {
            const node = <IfStatement>createNode(TokenType.IfStatement);
            parseExpected(TokenType.if);
            parseExpected(TokenType.openParen);
            node.expression = allowInAnd(parseExpression);
            parseExpected(TokenType.closeParen);
            node.thenStatement = parseStatement();
            node.elseStatement = parseOptional(TokenType.else) ? parseStatement() : undefined;
            return finishNode(node);
        }

        function parseDoStatement(): DoStatement {
            const node = <DoStatement>createNode(TokenType.DoStatement);
            parseExpected(TokenType.do);
            node.statement = parseStatement();
            parseExpected(TokenType.while);
            parseExpected(TokenType.openParen);
            node.expression = allowInAnd(parseExpression);
            parseExpected(TokenType.closeParen);

            // From: https://mail.mozilla.org/pipermail/es-discuss/2011-August/016188.html
            // 157 min --- All allen at wirfs-brock.com CONF --- "do{;}while(false)false" prohibited in
            // spec but allowed in consensus reality. Approved -- this is the de-facto standard whereby
            //  do;while(0)x will have a semicolon inserted before x.
            parseOptional(TokenType.semicolon);
            return finishNode(node);
        }

        function parseWhileStatement(): WhileStatement {
            const node = <WhileStatement>createNode(TokenType.WhileStatement);
            parseExpected(TokenType.while);
            parseExpected(TokenType.openParen);
            node.expression = allowInAnd(parseExpression);
            parseExpected(TokenType.closeParen);
            node.statement = parseStatement();
            return finishNode(node);
        }

        function parseForOrForInOrForOfStatement(): Statement {
            const pos = getNodePos();
            parseExpected(TokenType.for);
            parseExpected(TokenType.openParen);

            let initializer: VariableDeclarationList | Expression = undefined;
            if (token !== TokenType.semicolon) {
                if (token === TokenType.var || token === TokenType.let || token === TokenType.const) {
                    initializer = parseVariableDeclarationList(/*inForStatementInitializer*/ true);
                }
                else {
                    initializer = disallowInAnd(parseExpression);
                }
            }
            let forOrForInOrForOfStatement: IterationStatement;
            if (parseOptional(TokenType.in)) {
                const forInStatement = <ForInStatement>createNode(TokenType.ForInStatement, pos);
                forInStatement.initializer = initializer;
                forInStatement.expression = allowInAnd(parseExpression);
                parseExpected(TokenType.closeParen);
                forOrForInOrForOfStatement = forInStatement;
            }
            else if (parseOptional(TokenType.of)) {
                const forOfStatement = <ForOfStatement>createNode(TokenType.ForOfStatement, pos);
                forOfStatement.initializer = initializer;
                forOfStatement.expression = allowInAnd(parseAssignmentExpressionOrHigher);
                parseExpected(TokenType.closeParen);
                forOrForInOrForOfStatement = forOfStatement;
            }
            else {
                const forStatement = <ForStatement>createNode(TokenType.ForStatement, pos);
                forStatement.initializer = initializer;
                parseExpected(TokenType.semicolon);
                if (token !== TokenType.semicolon && token !== TokenType.closeParen) {
                    forStatement.condition = allowInAnd(parseExpression);
                }
                parseExpected(TokenType.semicolon);
                if (token !== TokenType.closeParen) {
                    forStatement.incrementor = allowInAnd(parseExpression);
                }
                parseExpected(TokenType.closeParen);
                forOrForInOrForOfStatement = forStatement;
            }

            forOrForInOrForOfStatement.statement = parseStatement();

            return finishNode(forOrForInOrForOfStatement);
        }

        function parseBreakOrContinueStatement(kind: TokenType): BreakOrContinueStatement {
            const node = <BreakOrContinueStatement>createNode(kind);

            parseExpected(kind === TokenType.BreakStatement ? TokenType.break : TokenType.continue);
            if (!canParseSemicolon()) {
                node.label = parseIdentifier();
            }

            parseSemicolon();
            return finishNode(node);
        }

        function parseReturnStatement(): ReturnStatement {
            const node = <ReturnStatement>createNode(TokenType.ReturnStatement);

            parseExpected(TokenType.return);
            if (!canParseSemicolon()) {
                node.expression = allowInAnd(parseExpression);
            }

            parseSemicolon();
            return finishNode(node);
        }

        function parseWithStatement(): WithStatement {
            const node = <WithStatement>createNode(TokenType.WithStatement);
            parseExpected(TokenType.with);
            parseExpected(TokenType.openParen);
            node.expression = allowInAnd(parseExpression);
            parseExpected(TokenType.closeParen);
            node.statement = parseStatement();
            return finishNode(node);
        }

        function parseCaseClause(): CaseClause {
            const node = <CaseClause>createNode(TokenType.CaseClause);
            parseExpected(TokenType.case);
            node.expression = allowInAnd(parseExpression);
            parseExpected(TokenType.colon);
            node.statements = parseList(ParsingContext.SwitchClauseStatements, parseStatement);
            return finishNode(node);
        }

        function parseDefaultClause(): DefaultClause {
            const node = <DefaultClause>createNode(TokenType.DefaultClause);
            parseExpected(TokenType.default);
            parseExpected(TokenType.colon);
            node.statements = parseList(ParsingContext.SwitchClauseStatements, parseStatement);
            return finishNode(node);
        }

        function parseCaseOrDefaultClause(): CaseOrDefaultClause {
            return token === TokenType.case ? parseCaseClause() : parseDefaultClause();
        }

        function parseSwitchStatement(): SwitchStatement {
            const node = <SwitchStatement>createNode(TokenType.SwitchStatement);
            parseExpected(TokenType.switch);
            parseExpected(TokenType.openParen);
            node.expression = allowInAnd(parseExpression);
            parseExpected(TokenType.closeParen);
            const caseBlock = <CaseBlock>createNode(TokenType.CaseBlock, scanner.getStartPos());
            parseExpected(TokenType.openBrace);
            caseBlock.clauses = parseList(ParsingContext.SwitchClauses, parseCaseOrDefaultClause);
            parseExpected(TokenType.closeBrace);
            node.caseBlock = finishNode(caseBlock);
            return finishNode(node);
        }

        function parseThrowStatement(): ThrowStatement {
            // ThrowStatement[Yield] :
            //      throw [no LineTerminator here]Expression[In, ?Yield];

            // Because of automatic semicolon insertion, we need to report error if this
            // throw could be terminated with a semicolon.  Note: we can't call 'parseExpression'
            // directly as that might consume an expression on the following line.
            // We just return 'undefined' in that case.  The actual error will be reported in the
            // grammar walker.
            const node = <ThrowStatement>createNode(TokenType.ThrowStatement);
            parseExpected(TokenType.throw);
            node.expression = scanner.hasPrecedingLineBreak() ? undefined : allowInAnd(parseExpression);
            parseSemicolon();
            return finishNode(node);
        }

        // TODO: Review for error recovery
        function parseTryStatement(): TryStatement {
            const node = <TryStatement>createNode(TokenType.TryStatement);

            parseExpected(TokenType.try);
            node.tryBlock = parseBlock(/*ignoreMissingOpenBrace*/ false);
            node.catchClause = token === TokenType.catch ? parseCatchClause() : undefined;

            // If we don't have a catch clause, then we must have a finally clause.  Try to parse
            // one out no matter what.
            if (!node.catchClause || token === TokenType.finally) {
                parseExpected(TokenType.finally);
                node.finallyBlock = parseBlock(/*ignoreMissingOpenBrace*/ false);
            }

            return finishNode(node);
        }

        function parseCatchClause(): CatchClause {
            const result = <CatchClause>createNode(TokenType.CatchClause);
            parseExpected(TokenType.catch);
            if (parseExpected(TokenType.openParen)) {
                result.variableDeclaration = parseVariableDeclaration();
            }

            parseExpected(TokenType.closeParen);
            result.block = parseBlock(/*ignoreMissingOpenBrace*/ false);
            return finishNode(result);
        }

        function parseDebuggerStatement(): Statement {
            const node = <Statement>createNode(TokenType.DebuggerStatement);
            parseExpected(TokenType.debugger);
            parseSemicolon();
            return finishNode(node);
        }

        function parseExpressionOrLabeledStatement(): ExpressionStatement | LabeledStatement {
            // Avoiding having to do the lookahead for a labeled statement by just trying to parse
            // out an expression, seeing if it is identifier and then seeing if it is followed by
            // a colon.
            const fullStart = scanner.getStartPos();
            const expression = allowInAnd(parseExpression);

            if (expression.kind === TokenType.Identifier && parseOptional(TokenType.colon)) {
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

        function nextTokenIsIdentifierOrKeywordOnSameLine() {
            nextToken();
            return tokenIsIdentifierOrKeyword(token) && !scanner.hasPrecedingLineBreak();
        }

        function nextTokenIsFunctionKeywordOnSameLine() {
            nextToken();
            return token === TokenType.function && !scanner.hasPrecedingLineBreak();
        }

        function nextTokenIsIdentifierOrKeywordOrNumberOnSameLine() {
            nextToken();
            return (tokenIsIdentifierOrKeyword(token) || token === TokenType.NumericLiteral) && !scanner.hasPrecedingLineBreak();
        }

        function isDeclaration(): boolean {
            while (true) {
                switch (token) {
                    case TokenType.var:
                    case TokenType.let:
                    case TokenType.const:
                    case TokenType.function:
                    case TokenType.class:
                    case TokenType.enum:
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
                    case TokenType.interface:
                    case TokenType.type:
                        return nextTokenIsIdentifierOnSameLine();
                    case TokenType.module:
                    case TokenType.namespace:
                        return nextTokenIsIdentifierOrStringLiteralOnSameLine();
                    case TokenType.abstract:
                    case TokenType.async:
                    case TokenType.declare:
                    case TokenType.private:
                    case TokenType.protected:
                    case TokenType.public:
                    case TokenType.readonly:
                        nextToken();
                        // ASI takes effect for this modifier.
                        if (scanner.hasPrecedingLineBreak()) {
                            return false;
                        }
                        continue;

                    case TokenType.global:
                        nextToken();
                        return token === TokenType.openBrace || token === TokenType.Identifier || token === TokenType.export;

                    case TokenType.import:
                        nextToken();
                        return token === TokenType.StringLiteral || token === TokenType.asterisk ||
                            token === TokenType.openBrace || tokenIsIdentifierOrKeyword(token);
                    case TokenType.export:
                        nextToken();
                        if (token === TokenType.equals || token === TokenType.asterisk ||
                            token === TokenType.openBrace || token === TokenType.default ||
                            token === TokenType.as) {
                            return true;
                        }
                        continue;

                    case TokenType.static:
                        nextToken();
                        continue;
                    default:
                        return false;
                }
            }
        }

        function isStartOfDeclaration(): boolean {
            return lookAhead(isDeclaration);
        }

        function isStartOfStatement(): boolean {
            switch (token) {
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
                    return isStartOfDeclaration();

                case TokenType.async:
                case TokenType.declare:
                case TokenType.interface:
                case TokenType.module:
                case TokenType.namespace:
                case TokenType.type:
                case TokenType.global:
                    // When these don't start a declaration, they're an identifier in an expression statement
                    return true;

                case TokenType.public:
                case TokenType.private:
                case TokenType.protected:
                case TokenType.static:
                case TokenType.readonly:
                    // When these don't start a declaration, they may be the start of a class member if an identifier
                    // immediately follows. Otherwise they're an identifier in an expression statement.
                    return isStartOfDeclaration() || !lookAhead(nextTokenIsIdentifierOrKeywordOnSameLine);

                default:
                    return isStartOfExpression();
            }
        }

        function nextTokenIsIdentifierOrStartOfDestructuring() {
            nextToken();
            return isIdentifier() || token === TokenType.openBrace || token === TokenType.openBracket;
        }

        function isLetDeclaration() {
            // In ES6 'let' always starts a lexical declaration if followed by an identifier or {
            // or [.
            return lookAhead(nextTokenIsIdentifierOrStartOfDestructuring);
        }

        function parseStatement(): Statement {
            switch (token) {
                case TokenType.semicolon:
                    return parseEmptyStatement();
                case TokenType.openBrace:
                    return parseBlock(/*ignoreMissingOpenBrace*/ false);
                case TokenType.var:
                    return parseVariableStatement(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
                case TokenType.let:
                    if (isLetDeclaration()) {
                        return parseVariableStatement(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
                    }
                    break;
                case TokenType.function:
                    return parseFunctionDeclaration(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
                case TokenType.class:
                    return parseClassDeclaration(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
                case TokenType.if:
                    return parseIfStatement();
                case TokenType.do:
                    return parseDoStatement();
                case TokenType.while:
                    return parseWhileStatement();
                case TokenType.for:
                    return parseForOrForInOrForOfStatement();
                case TokenType.continue:
                    return parseBreakOrContinueStatement(TokenType.ContinueStatement);
                case TokenType.break:
                    return parseBreakOrContinueStatement(TokenType.BreakStatement);
                case TokenType.return:
                    return parseReturnStatement();
                case TokenType.with:
                    return parseWithStatement();
                case TokenType.switch:
                    return parseSwitchStatement();
                case TokenType.throw:
                    return parseThrowStatement();
                case TokenType.try:
                // Include 'catch' and 'finally' for error recovery.
                case TokenType.catch:
                case TokenType.finally:
                    return parseTryStatement();
                case TokenType.debugger:
                    return parseDebuggerStatement();
                case TokenType.at:
                    return parseDeclaration();
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
                    if (isStartOfDeclaration()) {
                        return parseDeclaration();
                    }
                    break;
            }
            return parseExpressionOrLabeledStatement();
        }

        function parseDeclaration(): Statement {
            const fullStart = getNodePos();
            const decorators = parseDecorators();
            const modifiers = parseModifiers();
            switch (token) {
                case TokenType.var:
                case TokenType.let:
                case TokenType.const:
                    return parseVariableStatement(fullStart, decorators, modifiers);
                case TokenType.function:
                    return parseFunctionDeclaration(fullStart, decorators, modifiers);
                case TokenType.class:
                    return parseClassDeclaration(fullStart, decorators, modifiers);
                case TokenType.interface:
                    return parseInterfaceDeclaration(fullStart, decorators, modifiers);
                case TokenType.type:
                    return parseTypeAliasDeclaration(fullStart, decorators, modifiers);
                case TokenType.enum:
                    return parseEnumDeclaration(fullStart, decorators, modifiers);
                case TokenType.global:
                case TokenType.module:
                case TokenType.namespace:
                    return parseModuleDeclaration(fullStart, decorators, modifiers);
                case TokenType.import:
                    return parseImportDeclarationOrImportEqualsDeclaration(fullStart, decorators, modifiers);
                case TokenType.export:
                    nextToken();
                    switch (token) {
                        case TokenType.default:
                        case TokenType.equals:
                            return parseExportAssignment(fullStart, decorators, modifiers);
                        case TokenType.as:
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

        function nextTokenIsIdentifierOrStringLiteralOnSameLine() {
            nextToken();
            return !scanner.hasPrecedingLineBreak() && (isIdentifier() || token === TokenType.StringLiteral);
        }

        function parseFunctionBlockOrSemicolon(isGenerator: boolean, isAsync: boolean, diagnosticMessage?: DiagnosticMessage): Block {
            if (token !== TokenType.openBrace && canParseSemicolon()) {
                parseSemicolon();
                return;
            }

            return parseFunctionBlock(isGenerator, isAsync, /*ignoreMissingOpenBrace*/ false, diagnosticMessage);
        }

        // DECLARATIONS

        function parseArrayBindingElement(): BindingElement {
            if (token === TokenType.comma) {
                return <BindingElement>createNode(TokenType.OmittedExpression);
            }
            const node = <BindingElement>createNode(TokenType.BindingElement);
            node.dotDotDotToken = parseOptionalToken(TokenType.dotDotDot);
            node.name = parseIdentifierOrPattern();
            node.initializer = parseBindingElementInitializer(/*inParameter*/ false);
            return finishNode(node);
        }

        function parseObjectBindingElement(): BindingElement {
            const node = <BindingElement>createNode(TokenType.BindingElement);
            const tokenIsIdentifier = isIdentifier();
            const propertyName = parsePropertyName();
            if (tokenIsIdentifier && token !== TokenType.colon) {
                node.name = <Identifier>propertyName;
            }
            else {
                parseExpected(TokenType.colon);
                node.propertyName = propertyName;
                node.name = parseIdentifierOrPattern();
            }
            node.initializer = parseBindingElementInitializer(/*inParameter*/ false);
            return finishNode(node);
        }

        function parseObjectBindingPattern(): BindingPattern {
            const node = <BindingPattern>createNode(TokenType.ObjectBindingPattern);
            parseExpected(TokenType.openBrace);
            node.elements = parseDelimitedList(ParsingContext.ObjectBindingElements, parseObjectBindingElement);
            parseExpected(TokenType.closeBrace);
            return finishNode(node);
        }

        function parseArrayBindingPattern(): BindingPattern {
            const node = <BindingPattern>createNode(TokenType.ArrayBindingPattern);
            parseExpected(TokenType.openBracket);
            node.elements = parseDelimitedList(ParsingContext.ArrayBindingElements, parseArrayBindingElement);
            parseExpected(TokenType.closeBracket);
            return finishNode(node);
        }

        function isIdentifierOrPattern() {
            return token === TokenType.openBrace || token === TokenType.openBracket || isIdentifier();
        }

        function parseIdentifierOrPattern(): Identifier | BindingPattern {
            if (token === TokenType.openBracket) {
                return parseArrayBindingPattern();
            }
            if (token === TokenType.openBrace) {
                return parseObjectBindingPattern();
            }
            return parseIdentifier();
        }

        function parseVariableDeclaration(): VariableDeclaration {
            const node = <VariableDeclaration>createNode(TokenType.VariableDeclaration);
            node.name = parseIdentifierOrPattern();
            node.type = parseTypeAnnotation();
            if (!isInOrOfKeyword(token)) {
                node.initializer = parseInitializer(/*inParameter*/ false);
            }
            return finishNode(node);
        }

        function parseVariableDeclarationList(inForStatementInitializer: boolean): VariableDeclarationList {
            const node = <VariableDeclarationList>createNode(TokenType.VariableDeclarationList);

            switch (token) {
                case TokenType.var:
                    break;
                case TokenType.let:
                    node.flags |= NodeFlags.Let;
                    break;
                case TokenType.const:
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
            if (token === TokenType.of && lookAhead(canFollowContextualOfKeyword)) {
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

        function canFollowContextualOfKeyword(): boolean {
            return nextTokenIsIdentifier() && nextToken() === TokenType.closeParen;
        }

        function parseVariableStatement(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): VariableStatement {
            const node = <VariableStatement>createNode(TokenType.VariableStatement, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            node.declarationList = parseVariableDeclarationList(/*inForStatementInitializer*/ false);
            parseSemicolon();
            return addJSDocComment(finishNode(node));
        }

        function parseFunctionDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): FunctionDeclaration {
            const node = <FunctionDeclaration>createNode(TokenType.FunctionDeclaration, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            parseExpected(TokenType.function);
            node.asteriskToken = parseOptionalToken(TokenType.asterisk);
            node.name = node.flags & NodeFlags.Default ? parseOptionalIdentifier() : parseIdentifier();
            const isGenerator = !!node.asteriskToken;
            const isAsync = !!(node.flags & NodeFlags.Async);
            fillSignature(TokenType.colon, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, node);
            node.body = parseFunctionBlockOrSemicolon(isGenerator, isAsync, Diagnostics.or_expected);
            return addJSDocComment(finishNode(node));
        }

        function parseConstructorDeclaration(pos: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): ConstructorDeclaration {
            const node = <ConstructorDeclaration>createNode(TokenType.Constructor, pos);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            parseExpected(TokenType.constructor);
            fillSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
            node.body = parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false, Diagnostics.or_expected);
            return addJSDocComment(finishNode(node));
        }

        function parseMethodDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray, asteriskToken: Node, name: PropertyName, questionToken: Node, diagnosticMessage?: DiagnosticMessage): MethodDeclaration {
            const method = <MethodDeclaration>createNode(TokenType.MethodDeclaration, fullStart);
            method.decorators = decorators;
            setModifiers(method, modifiers);
            method.asteriskToken = asteriskToken;
            method.name = name;
            method.questionToken = questionToken;
            const isGenerator = !!asteriskToken;
            const isAsync = !!(method.flags & NodeFlags.Async);
            fillSignature(TokenType.colon, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, method);
            method.body = parseFunctionBlockOrSemicolon(isGenerator, isAsync, diagnosticMessage);
            return addJSDocComment(finishNode(method));
        }

        function parsePropertyDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray, name: PropertyName, questionToken: Node): ClassElement {
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

        function parsePropertyOrMethodDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): ClassElement {
            const asteriskToken = parseOptionalToken(TokenType.asterisk);
            const name = parsePropertyName();

            // Note: this is not legal as per the grammar.  But we allow it in the parser and
            // report an error in the grammar checker.
            const questionToken = parseOptionalToken(TokenType.question);
            if (asteriskToken || token === TokenType.openParen || token === TokenType.lessThan) {
                return parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, name, questionToken, Diagnostics.or_expected);
            }
            else {
                return parsePropertyDeclaration(fullStart, decorators, modifiers, name, questionToken);
            }
        }

        function parseNonParameterInitializer() {
            return parseInitializer(/*inParameter*/ false);
        }

        function parseAccessorDeclaration(kind: TokenType, fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): AccessorDeclaration {
            const node = <AccessorDeclaration>createNode(kind, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            node.name = parsePropertyName();
            fillSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
            node.body = parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false);
            return finishNode(node);
        }

        function isClassMemberModifier(idToken: TokenType) {
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

        function isClassMemberStart(): boolean {
            let idToken: TokenType;

            if (token === TokenType.at) {
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

            if (token === TokenType.asterisk) {
                return true;
            }

            // Try to get the first property-like token following all modifiers.
            // This can either be an identifier or the 'get' or 'set' keywords.
            if (isLiteralPropertyName()) {
                idToken = token;
                nextToken();
            }

            // Index signatures and computed properties are class members; we can parse.
            if (token === TokenType.openBracket) {
                return true;
            }

            // If we were able to get any potential identifier...
            if (idToken !== undefined) {
                // If we have a non-keyword identifier, or if we have an accessor, then it's safe to parse.
                if (!isKeyword(idToken) || idToken === TokenType.set || idToken === TokenType.get) {
                    return true;
                }

                // If it *is* a keyword, but not an accessor, check a little farther along
                // to see if it should actually be parsed as a class member.
                switch (token) {
                    case TokenType.openParen:     // Method declaration
                    case TokenType.lessThan:      // Generic Method declaration
                    case TokenType.colon:         // Type Annotation for declaration
                    case TokenType.equals:        // Initializer for declaration
                    case TokenType.question:      // Not valid, but permitted so that it gets caught later on.
                        return true;
                    default:
                        // Covers
                        //  - Semicolons     (declaration termination)
                        //  - Closing braces (end-of-class, must be declaration)
                        //  - End-of-files   (not valid, but permitted so that it gets caught later on)
                        //  - Line-breaks    (enabling *automatic semicolon insertion*)
                        return canParseSemicolon();
                }
            }

            return false;
        }

        function parseDecorators(): NodeArray<Decorator> {
            let decorators: NodeArray<Decorator>;
            while (true) {
                const decoratorStart = getNodePos();
                if (!parseOptional(TokenType.at)) {
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
        function parseModifiers(permitInvalidConstAsModifier?: boolean): ModifiersArray {
            let flags: NodeFlags = 0;
            let modifiers: ModifiersArray;
            while (true) {
                const modifierStart = scanner.getStartPos();
                const modifierKind = token;

                if (token === TokenType.const && permitInvalidConstAsModifier) {
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

        function parseModifiersForArrowFunction(): ModifiersArray {
            let flags = 0;
            let modifiers: ModifiersArray;
            if (token === TokenType.async) {
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

        function parseClassElement(): ClassElement {
            if (token === TokenType.semicolon) {
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

            if (token === TokenType.constructor) {
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
                token === TokenType.asterisk ||
                token === TokenType.openBracket) {

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

        function parseClassExpression(): ClassExpression {
            return <ClassExpression>parseClassDeclarationOrExpression(
                /*fullStart*/ scanner.getStartPos(),
                /*decorators*/ undefined,
                /*modifiers*/ undefined,
                TokenType.ClassExpression);
        }

        function parseClassDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): ClassDeclaration {
            return <ClassDeclaration>parseClassDeclarationOrExpression(fullStart, decorators, modifiers, TokenType.ClassDeclaration);
        }

        function parseClassDeclarationOrExpression(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray, kind: TokenType): ClassLikeDeclaration {
            const node = <ClassLikeDeclaration>createNode(kind, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            parseExpected(TokenType.class);
            node.name = parseNameOfClassDeclarationOrExpression();
            node.typeParameters = parseTypeParameters();
            node.heritageClauses = parseHeritageClauses(/*isClassHeritageClause*/ true);

            if (parseExpected(TokenType.openBrace)) {
                // ClassTail[Yield,Await] : (Modified) See 14.5
                //      ClassHeritage[?Yield,?Await]opt { ClassBody[?Yield,?Await]opt }
                node.members = parseClassMembers();
                parseExpected(TokenType.closeBrace);
            }
            else {
                node.members = createMissingList<ClassElement>();
            }

            return finishNode(node);
        }

        function parseNameOfClassDeclarationOrExpression(): Identifier {
            // implements is a future reserved word so
            // 'class implements' might mean either
            // - class expression with omitted name, 'implements' starts heritage clause
            // - class with name 'implements'
            // 'isImplementsClause' helps to disambiguate between these two cases
            return isIdentifier() && !isImplementsClause()
                ? parseIdentifier()
                : undefined;
        }

        function isImplementsClause() {
            return token === TokenType.implements && lookAhead(nextTokenIsIdentifierOrKeyword);
        }

        function parseHeritageClauses(isClassHeritageClause: boolean): NodeArray<HeritageClause> {
            // ClassTail[Yield,Await] : (Modified) See 14.5
            //      ClassHeritage[?Yield,?Await]opt { ClassBody[?Yield,?Await]opt }

            if (isHeritageClause()) {
                return parseList(ParsingContext.HeritageClauses, parseHeritageClause);
            }

            return undefined;
        }

        function parseHeritageClause() {
            if (token === TokenType.extends || token === TokenType.implements) {
                const node = <HeritageClause>createNode(TokenType.HeritageClause);
                node.token = token;
                nextToken();
                node.types = parseDelimitedList(ParsingContext.HeritageClauseElement, parseExpressionWithTypeArguments);
                return finishNode(node);
            }

            return undefined;
        }

        function parseExpressionWithTypeArguments(): ExpressionWithTypeArguments {
            const node = <ExpressionWithTypeArguments>createNode(TokenType.ExpressionWithTypeArguments);
            node.expression = parseLeftHandSideExpressionOrHigher();
            if (token === TokenType.lessThan) {
                node.typeArguments = parseBracketedList(ParsingContext.TypeArguments, parseType, TokenType.lessThan, TokenType.greaterThan);
            }

            return finishNode(node);
        }

        function isHeritageClause(): boolean {
            return token === TokenType.extends || token === TokenType.implements;
        }

        function parseClassMembers() {
            return parseList(ParsingContext.ClassMembers, parseClassElement);
        }

        function parseInterfaceDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): InterfaceDeclaration {
            const node = <InterfaceDeclaration>createNode(TokenType.InterfaceDeclaration, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            parseExpected(TokenType.interface);
            node.name = parseIdentifier();
            node.typeParameters = parseTypeParameters();
            node.heritageClauses = parseHeritageClauses(/*isClassHeritageClause*/ false);
            node.members = parseObjectTypeMembers();
            return finishNode(node);
        }

        function parseTypeAliasDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): TypeAliasDeclaration {
            const node = <TypeAliasDeclaration>createNode(TokenType.TypeAliasDeclaration, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            parseExpected(TokenType.type);
            node.name = parseIdentifier();
            node.typeParameters = parseTypeParameters();
            parseExpected(TokenType.equals);
            node.type = parseType();
            parseSemicolon();
            return finishNode(node);
        }

        // In an ambient declaration, the grammar only allows integer literals as initializers.
        // In a non-ambient declaration, the grammar allows uninitialized members only in a
        // ConstantEnumMemberSection, which starts at the beginning of an enum declaration
        // or any time an integer literal initializer is encountered.
        function parseEnumMember(): EnumMember {
            const node = <EnumMember>createNode(TokenType.EnumMember, scanner.getStartPos());
            node.name = parsePropertyName();
            node.initializer = allowInAnd(parseNonParameterInitializer);
            return finishNode(node);
        }

        function parseEnumDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): EnumDeclaration {
            const node = <EnumDeclaration>createNode(TokenType.EnumDeclaration, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            parseExpected(TokenType.enum);
            node.name = parseIdentifier();
            if (parseExpected(TokenType.openBrace)) {
                node.members = parseDelimitedList(ParsingContext.EnumMembers, parseEnumMember);
                parseExpected(TokenType.closeBrace);
            }
            else {
                node.members = createMissingList<EnumMember>();
            }
            return finishNode(node);
        }

        function parseModuleBlock(): ModuleBlock {
            const node = <ModuleBlock>createNode(TokenType.ModuleBlock, scanner.getStartPos());
            if (parseExpected(TokenType.openBrace)) {
                node.statements = parseList(ParsingContext.BlockStatements, parseStatement);
                parseExpected(TokenType.closeBrace);
            }
            else {
                node.statements = createMissingList<Statement>();
            }
            return finishNode(node);
        }

        function parseModuleOrNamespaceDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray, flags: NodeFlags): ModuleDeclaration {
            const node = <ModuleDeclaration>createNode(TokenType.ModuleDeclaration, fullStart);
            // If we are parsing a dotted namespace name, we want to
            // propagate the 'Namespace' flag across the names if set.
            const namespaceFlag = flags & NodeFlags.Namespace;
            node.decorators = decorators;
            setModifiers(node, modifiers);
            node.flags |= flags;
            node.name = parseIdentifier();
            node.body = parseOptional(TokenType.dot)
                ? parseModuleOrNamespaceDeclaration(getNodePos(), /*decorators*/ undefined, /*modifiers*/ undefined, NodeFlags.Export | namespaceFlag)
                : parseModuleBlock();
            return finishNode(node);
        }

        function parseAmbientExternalModuleDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): ModuleDeclaration {
            const node = <ModuleDeclaration>createNode(TokenType.ModuleDeclaration, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            if (token === TokenType.global) {
                // parse 'global' as name of global scope augmentation
                node.name = parseIdentifier();
                node.flags |= NodeFlags.GlobalAugmentation;
            }
            else {
                node.name = parseLiteralNode(/*internName*/ true);
            }

            if (token === TokenType.openBrace) {
                node.body = parseModuleBlock();
            }
            else {
                parseSemicolon();
            }

            return finishNode(node);
        }

        function parseModuleDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): ModuleDeclaration {
            let flags = modifiers ? modifiers.flags : 0;
            if (token === TokenType.global) {
                // global augmentation
                return parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
            }
            else if (parseOptional(TokenType.namespace)) {
                flags |= NodeFlags.Namespace;
            }
            else {
                parseExpected(TokenType.module);
                if (token === TokenType.StringLiteral) {
                    return parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
                }
            }
            return parseModuleOrNamespaceDeclaration(fullStart, decorators, modifiers, flags);
        }

        function isExternalModuleReference() {
            return token === TokenType.require &&
                lookAhead(nextTokenIsOpenParen);
        }

        function nextTokenIsOpenParen() {
            return nextToken() === TokenType.openParen;
        }

        function nextTokenIsSlash() {
            return nextToken() === TokenType.slash;
        }

        function parseNamespaceExportDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): NamespaceExportDeclaration {
            const exportDeclaration = <NamespaceExportDeclaration>createNode(TokenType.NamespaceExportDeclaration, fullStart);
            exportDeclaration.decorators = decorators;
            exportDeclaration.modifiers = modifiers;
            parseExpected(TokenType.as);
            parseExpected(TokenType.namespace);

            exportDeclaration.name = parseIdentifier();

            parseExpected(TokenType.semicolon);

            return finishNode(exportDeclaration);
        }

        function parseImportDeclarationOrImportEqualsDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): ImportEqualsDeclaration | ImportDeclaration {
            parseExpected(TokenType.import);
            const afterImportPos = scanner.getStartPos();

            let identifier: Identifier;
            if (isIdentifier()) {
                identifier = parseIdentifier();
                if (token !== TokenType.comma && token !== TokenType.from) {
                    // ImportEquals declaration of type:
                    // import x = require("mod"); or
                    // import x = M.x;
                    const importEqualsDeclaration = <ImportEqualsDeclaration>createNode(TokenType.ImportEqualsDeclaration, fullStart);
                    importEqualsDeclaration.decorators = decorators;
                    setModifiers(importEqualsDeclaration, modifiers);
                    importEqualsDeclaration.name = identifier;
                    parseExpected(TokenType.equals);
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
                token === TokenType.asterisk || // import *
                token === TokenType.openBrace) { // import {
                importDeclaration.importClause = parseImportClause(identifier, afterImportPos);
                parseExpected(TokenType.from);
            }

            importDeclaration.moduleSpecifier = parseModuleSpecifier();
            parseSemicolon();
            return finishNode(importDeclaration);
        }

        function parseImportClause(identifier: Identifier, fullStart: number) {
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
                parseOptional(TokenType.comma)) {
                importClause.namedBindings = token === TokenType.asterisk ? parseNamespaceImport() : parseNamedImportsOrExports(TokenType.NamedImports);
            }

            return finishNode(importClause);
        }

        function parseModuleReference() {
            return isExternalModuleReference()
                ? parseExternalModuleReference()
                : parseEntityName(/*allowReservedWords*/ false);
        }

        function parseExternalModuleReference() {
            const node = <ExternalModuleReference>createNode(TokenType.ExternalModuleReference);
            parseExpected(TokenType.require);
            parseExpected(TokenType.openParen);
            node.expression = parseModuleSpecifier();
            parseExpected(TokenType.closeParen);
            return finishNode(node);
        }

        function parseModuleSpecifier(): Expression {
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

        function parseNamespaceImport(): NamespaceImport {
            // NameSpaceImport:
            //  * as ImportedBinding
            const namespaceImport = <NamespaceImport>createNode(TokenType.NamespaceImport);
            parseExpected(TokenType.asterisk);
            parseExpected(TokenType.as);
            namespaceImport.name = parseIdentifier();
            return finishNode(namespaceImport);
        }

        function parseNamedImportsOrExports(kind: TokenType): NamedImportsOrExports {
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
                TokenType.openBrace, TokenType.closeBrace);
            return finishNode(node);
        }

        function parseExportSpecifier() {
            return parseImportOrExportSpecifier(TokenType.ExportSpecifier);
        }

        function parseImportSpecifier() {
            return parseImportOrExportSpecifier(TokenType.ImportSpecifier);
        }

        function parseImportOrExportSpecifier(kind: TokenType): ImportOrExportSpecifier {
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
            if (token === TokenType.as) {
                node.propertyName = identifierName;
                parseExpected(TokenType.as);
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

        function parseExportDeclaration(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): ExportDeclaration {
            const node = <ExportDeclaration>createNode(TokenType.ExportDeclaration, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            if (parseOptional(TokenType.asterisk)) {
                parseExpected(TokenType.from);
                node.moduleSpecifier = parseModuleSpecifier();
            }
            else {
                node.exportClause = parseNamedImportsOrExports(TokenType.NamedExports);

                // It is not uncommon to accidentally omit the 'from' keyword. Additionally, in editing scenarios,
                // the 'from' keyword can be parsed as a named export when the export clause is unterminated (i.e. `export { from "moduleName";`)
                // If we don't have a 'from' keyword, see if we have a string literal such that ASI won't take effect.
                if (token === TokenType.from || (token === TokenType.StringLiteral && !scanner.hasPrecedingLineBreak())) {
                    parseExpected(TokenType.from);
                    node.moduleSpecifier = parseModuleSpecifier();
                }
            }
            parseSemicolon();
            return finishNode(node);
        }

        function parseExportAssignment(fullStart: number, decorators: NodeArray<Decorator>, modifiers: ModifiersArray): ExportAssignment {
            const node = <ExportAssignment>createNode(TokenType.ExportAssignment, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            if (parseOptional(TokenType.equals)) {
                node.isExportEquals = true;
            }
            else {
                parseExpected(TokenType.default);
            }
            node.expression = parseAssignmentExpressionOrHigher();
            parseSemicolon();
            return finishNode(node);
        }

        function processReferenceComments(sourceFile: SourceFile): void {
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
                if (kind !== TokenType.singleLineComment) {
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

        function setExternalModuleIndicator(sourceFile: SourceFile) {
            sourceFile.externalModuleIndicator = forEach(sourceFile.statements, node =>
                node.flags & NodeFlags.Export
                    || node.kind === TokenType.ImportEqualsDeclaration && (<ImportEqualsDeclaration>node).moduleReference.kind === TokenType.ExternalModuleReference
                    || node.kind === TokenType.ImportDeclaration
                    || node.kind === TokenType.ExportAssignment
                    || node.kind === TokenType.ExportDeclaration
                    ? node
                    : undefined);
        }

        const enum ParsingContext {
            SourceElements,            // Elements in source file
            BlockStatements,           // Statements in block
            SwitchClauses,             // Clauses in switch statement
            SwitchClauseStatements,    // Statements in switch clause
            TypeMembers,               // Members in interface or type literal
            ClassMembers,              // Members in class declaration
            EnumMembers,               // Members in enum declaration
            HeritageClauseElement,     // Elements in a heritage clause
            VariableDeclarations,      // Variable declarations in variable statement
            ObjectBindingElements,     // Binding elements in object binding list
            ArrayBindingElements,      // Binding elements in array binding list
            ArgumentExpressions,       // Expressions in argument list
            ObjectLiteralMembers,      // Members in object literal
            JsxAttributes,             // Attributes in jsx element
            JsxChildren,               // Things between opening and closing JSX tags
            ArrayLiteralMembers,       // Members in array literal
            Parameters,                // Parameters in parameter list
            TypeParameters,            // Type parameters in type parameter list
            TypeArguments,             // Type arguments in type argument list
            TupleElementTypes,         // Element types in tuple element type list
            HeritageClauses,           // Heritage clauses for a class or interface declaration.
            ImportOrExportSpecifiers,  // Named import clause's import specifier list
            JSDocFunctionParameters,
            JSDocTypeArguments,
            JSDocRecordMembers,
            JSDocTupleTypes,
            Count                      // Number of parsing contexts
        }

        const enum Tristate {
            False,
            True,
            Unknown
        }

        export namespace JSDocParser {
            export function isJSDocType() {
                switch (token) {
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

                return tokenIsIdentifierOrKeyword(token);
            }

            export function parseJSDocTypeExpressionForTests(content: string, start: number, length: number) {
                initializeState("file.js", content, ScriptTarget.Latest, /*_syntaxCursor:*/ undefined, ScriptKind.JS);
                scanner.setText(content, start, length);
                token = scanner.scan();
                const jsDocTypeExpression = parseJSDocTypeExpression();
                const diagnostics = parseDiagnostics;
                clearState();

                return jsDocTypeExpression ? { jsDocTypeExpression, diagnostics } : undefined;
            }

            // Parses out a JSDoc type expression.
            /* @internal */
            export function parseJSDocTypeExpression(): JSDocTypeExpression {
                const result = <JSDocTypeExpression>createNode(TokenType.JSDocTypeExpression, scanner.getTokenPos());

                parseExpected(TokenType.openBrace);
                result.type = parseJSDocTopLevelType();
                parseExpected(TokenType.closeBrace);

                fixupParentReferences(result);
                return finishNode(result);
            }

            function parseJSDocTopLevelType(): JSDocType {
                let type = parseJSDocType();
                if (token === TokenType.bar) {
                    const unionType = <JSDocUnionType>createNode(TokenType.JSDocUnionType, type.pos);
                    unionType.types = parseJSDocTypeList(type);
                    type = finishNode(unionType);
                }

                if (token === TokenType.equals) {
                    const optionalType = <JSDocOptionalType>createNode(TokenType.JSDocOptionalType, type.pos);
                    nextToken();
                    optionalType.type = type;
                    type = finishNode(optionalType);
                }

                return type;
            }

            function parseJSDocType(): JSDocType {
                let type = parseBasicTypeExpression();

                while (true) {
                    if (token === TokenType.openBracket) {
                        const arrayType = <JSDocArrayType>createNode(TokenType.JSDocArrayType, type.pos);
                        arrayType.elementType = type;

                        nextToken();
                        parseExpected(TokenType.closeBracket);

                        type = finishNode(arrayType);
                    }
                    else if (token === TokenType.question) {
                        const nullableType = <JSDocNullableType>createNode(TokenType.JSDocNullableType, type.pos);
                        nullableType.type = type;

                        nextToken();
                        type = finishNode(nullableType);
                    }
                    else if (token === TokenType.exclamation) {
                        const nonNullableType = <JSDocNonNullableType>createNode(TokenType.JSDocNonNullableType, type.pos);
                        nonNullableType.type = type;

                        nextToken();
                        type = finishNode(nonNullableType);
                    }
                    else {
                        break;
                    }
                }

                return type;
            }

            function parseBasicTypeExpression(): JSDocType {
                switch (token) {
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
                        return parseTokenNode<JSDocType>();
                }

                // TODO (drosen): Parse string literal types in JSDoc as well.
                return parseJSDocTypeReference();
            }

            function parseJSDocThisType(): JSDocThisType {
                const result = <JSDocThisType>createNode(TokenType.JSDocThisType);
                nextToken();
                parseExpected(TokenType.colon);
                result.type = parseJSDocType();
                return finishNode(result);
            }

            function parseJSDocConstructorType(): JSDocConstructorType {
                const result = <JSDocConstructorType>createNode(TokenType.JSDocConstructorType);
                nextToken();
                parseExpected(TokenType.colon);
                result.type = parseJSDocType();
                return finishNode(result);
            }

            function parseJSDocVariadicType(): JSDocVariadicType {
                const result = <JSDocVariadicType>createNode(TokenType.JSDocVariadicType);
                nextToken();
                result.type = parseJSDocType();
                return finishNode(result);
            }

            function parseJSDocFunctionType(): JSDocFunctionType {
                const result = <JSDocFunctionType>createNode(TokenType.JSDocFunctionType);
                nextToken();

                parseExpected(TokenType.openParen);
                result.parameters = parseDelimitedList(ParsingContext.JSDocFunctionParameters, parseJSDocParameter);
                checkForTrailingComma(result.parameters);
                parseExpected(TokenType.closeParen);

                if (token === TokenType.colon) {
                    nextToken();
                    result.type = parseJSDocType();
                }

                return finishNode(result);
            }

            function parseJSDocParameter(): ParameterDeclaration {
                const parameter = <ParameterDeclaration>createNode(TokenType.Parameter);
                parameter.type = parseJSDocType();
                if (parseOptional(TokenType.equals)) {
                    parameter.questionToken = createNode(TokenType.equals);
                }
                return finishNode(parameter);
            }

            function parseJSDocTypeReference(): JSDocTypeReference {
                const result = <JSDocTypeReference>createNode(TokenType.JSDocTypeReference);
                result.name = parseSimplePropertyName();

                if (token === TokenType.lessThan) {
                    result.typeArguments = parseTypeArguments();
                }
                else {
                    while (parseOptional(TokenType.dot)) {
                        if (token === TokenType.lessThan) {
                            result.typeArguments = parseTypeArguments();
                            break;
                        }
                        else {
                            result.name = parseQualifiedName(result.name);
                        }
                    }
                }


                return finishNode(result);
            }

            function parseTypeArguments() {
                // Move past the <
                nextToken();
                const typeArguments = parseDelimitedList(ParsingContext.JSDocTypeArguments, parseJSDocType);
                checkForTrailingComma(typeArguments);
                checkForEmptyTypeArgumentList(typeArguments);
                parseExpected(TokenType.greaterThan);

                return typeArguments;
            }

            function checkForEmptyTypeArgumentList(typeArguments: NodeArray<Node>) {
                if (parseDiagnostics.length === 0 && typeArguments && typeArguments.length === 0) {
                    const start = typeArguments.pos - "<".length;
                    const end = skipTrivia(sourceText, typeArguments.end) + ">".length;
                    return parseErrorAtPosition(start, end - start, Diagnostics.Type_argument_list_cannot_be_empty);
                }
            }

            function parseQualifiedName(left: EntityName): QualifiedName {
                const result = <QualifiedName>createNode(TokenType.QualifiedName, left.pos);
                result.left = left;
                result.right = parseIdentifierName();

                return finishNode(result);
            }

            function parseJSDocRecordType(): JSDocRecordType {
                const result = <JSDocRecordType>createNode(TokenType.JSDocRecordType);
                nextToken();
                result.members = parseDelimitedList(ParsingContext.JSDocRecordMembers, parseJSDocRecordMember);
                checkForTrailingComma(result.members);
                parseExpected(TokenType.closeBrace);
                return finishNode(result);
            }

            function parseJSDocRecordMember(): JSDocRecordMember {
                const result = <JSDocRecordMember>createNode(TokenType.JSDocRecordMember);
                result.name = parseSimplePropertyName();

                if (token === TokenType.colon) {
                    nextToken();
                    result.type = parseJSDocType();
                }

                return finishNode(result);
            }

            function parseJSDocNonNullableType(): JSDocNonNullableType {
                const result = <JSDocNonNullableType>createNode(TokenType.JSDocNonNullableType);
                nextToken();
                result.type = parseJSDocType();
                return finishNode(result);
            }

            function parseJSDocTupleType(): JSDocTupleType {
                const result = <JSDocTupleType>createNode(TokenType.JSDocTupleType);
                nextToken();
                result.types = parseDelimitedList(ParsingContext.JSDocTupleTypes, parseJSDocType);
                checkForTrailingComma(result.types);
                parseExpected(TokenType.closeBracket);

                return finishNode(result);
            }

            function checkForTrailingComma(list: NodeArray<Node>) {
                if (parseDiagnostics.length === 0 && list.hasTrailingComma) {
                    const start = list.end - ",".length;
                    parseErrorAtPosition(start, ",".length, Diagnostics.Trailing_comma_not_allowed);
                }
            }

            function parseJSDocUnionType(): JSDocUnionType {
                const result = <JSDocUnionType>createNode(TokenType.JSDocUnionType);
                nextToken();
                result.types = parseJSDocTypeList(parseJSDocType());

                parseExpected(TokenType.closeParen);

                return finishNode(result);
            }

            function parseJSDocTypeList(firstType: JSDocType) {
                Debug.assert(!!firstType);

                const types = <NodeArray<JSDocType>>[];
                types.pos = firstType.pos;

                types.push(firstType);
                while (parseOptional(TokenType.bar)) {
                    types.push(parseJSDocType());
                }

                types.end = scanner.getStartPos();
                return types;
            }

            function parseJSDocAllType(): JSDocAllType {
                const result = <JSDocAllType>createNode(TokenType.JSDocAllType);
                nextToken();
                return finishNode(result);
            }

            function parseJSDocUnknownOrNullableType(): JSDocUnknownType | JSDocNullableType {
                const pos = scanner.getStartPos();
                // skip the ?
                nextToken();

                // Need to lookahead to decide if this is a nullable or unknown type.

                // Here are cases where we'll pick the unknown type:
                //
                //      Foo(?,
                //      { a: ? }
                //      Foo(?)
                //      Foo<?>
                //      Foo(?=
                //      (?|
                if (token === TokenType.comma ||
                    token === TokenType.closeBrace ||
                    token === TokenType.closeParen ||
                    token === TokenType.greaterThan ||
                    token === TokenType.equals ||
                    token === TokenType.bar) {

                    const result = <JSDocUnknownType>createNode(TokenType.JSDocUnknownType, pos);
                    return finishNode(result);
                }
                else {
                    const result = <JSDocNullableType>createNode(TokenType.JSDocNullableType, pos);
                    result.type = parseJSDocType();
                    return finishNode(result);
                }
            }

            export function parseIsolatedJSDocComment(content: string, start: number, length: number) {
                initializeState("file.js", content, ScriptTarget.Latest, /*_syntaxCursor:*/ undefined, ScriptKind.JS);
                sourceFile = <SourceFile>{ languageVariant: LanguageVariant.Standard, text: content };
                const jsDocComment = parseJSDocCommentWorker(start, length);
                const diagnostics = parseDiagnostics;
                clearState();

                return jsDocComment ? { jsDocComment, diagnostics } : undefined;
            }

            export function parseJSDocComment(parent: Node, start: number, length: number): JSDocComment {
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

            export function parseJSDocCommentWorker(start: number, length: number): JSDocComment {
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
                if (content.charCodeAt(start) === CharCode.slash &&
                    content.charCodeAt(start + 1) === CharCode.asterisk &&
                    content.charCodeAt(start + 2) === CharCode.asterisk &&
                    content.charCodeAt(start + 3) !== CharCode.asterisk) {


                    // + 3 for leading /**, - 5 in total for /** */
                    scanner.scanRange(start + 3, length - 5, () => {
                        // Initially we can parse out a tag.  We also have seen a starting asterisk.
                        // This is so that /** * @type */ doesn't parse.
                        let canParseTag = true;
                        let seenAsterisk = true;

                        nextJSDocToken();
                        while (token !== TokenType.endOfFile) {
                            switch (token) {
                                case TokenType.at:
                                    if (canParseTag) {
                                        parseTag();
                                    }
                                    // This will take us to the end of the line, so it's OK to parse a tag on the next pass through the loop
                                    seenAsterisk = false;
                                    break;

                                case TokenType.newLine:
                                    // After a line break, we can parse a tag, and we haven't seen an asterisk on the next line yet
                                    canParseTag = true;
                                    seenAsterisk = false;
                                    break;

                                case TokenType.asterisk:
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

                                case TokenType.endOfFile:
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
                    while (token === TokenType.whitespace || token === TokenType.newLine) {
                        nextJSDocToken();
                    }
                }

                function parseTag(): void {
                    Debug.assert(token === TokenType.at);
                    const atToken = createNode(TokenType.at, scanner.getTokenPos());
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
                    if (token !== TokenType.openBrace) {
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
                    if (parseOptionalToken(TokenType.openBracket)) {
                        name = parseJSDocIdentifierName();
                        isBracketed = true;

                        // May have an optional default, e.g. '[foo = 42]'
                        if (parseOptionalToken(TokenType.equals)) {
                            parseExpression();
                        }

                        parseExpected(TokenType.closeBracket);
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

                        while (token !== TokenType.endOfFile && !parentTagTerminated) {
                            nextJSDocToken();
                            switch (token) {
                                case TokenType.at:
                                    if (canParseTag) {
                                        parentTagTerminated = !tryParseChildTag(jsDocTypeLiteral);
                                        if (!parentTagTerminated) {
                                            resumePos = scanner.getStartPos();
                                        }
                                    }
                                    seenAsterisk = false;
                                    break;
                                case TokenType.newLine:
                                    resumePos = scanner.getStartPos() - 1;
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
                        scanner.setTextPos(resumePos);
                        return finishNode(jsDocTypeLiteral);
                    }
                }

                function tryParseChildTag(parentTag: JSDocTypeLiteral): boolean {
                    Debug.assert(token === TokenType.at);
                    const atToken = createNode(TokenType.at, scanner.getStartPos());
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

                        if (token === TokenType.comma) {
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
        }
    }

    namespace IncrementalParser {
        export function updateSourceFile(sourceFile: SourceFile, newText: string, textChangeRange: TextChangeRange, aggressiveChecks: boolean): SourceFile {
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

        function moveElementEntirelyPastChangeRange(element: IncrementalElement, isArray: boolean, delta: number, oldText: string, newText: string, aggressiveChecks: boolean) {
            if (isArray) {
                visitArray(<IncrementalNodeArray>element);
            }
            else {
                visitNode(<IncrementalNode>element);
            }
            return;

            function visitNode(node: IncrementalNode) {
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

            function visitArray(array: IncrementalNodeArray) {
                array._children = undefined;
                array.pos += delta;
                array.end += delta;

                for (const node of array) {
                    visitNode(node);
                }
            }
        }

        function shouldCheckNode(node: Node) {
            switch (node.kind) {
                case TokenType.StringLiteral:
                case TokenType.NumericLiteral:
                case TokenType.Identifier:
                    return true;
            }

            return false;
        }

        function adjustIntersectingElement(element: IncrementalElement, changeStart: number, changeRangeOldEnd: number, changeRangeNewEnd: number, delta: number) {
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

        function checkNodePositions(node: Node, aggressiveChecks: boolean) {
            if (aggressiveChecks) {
                let pos = node.pos;
                forEachChild(node, child => {
                    Debug.assert(child.pos >= pos);
                    pos = child.end;
                });
                Debug.assert(pos <= node.end);
            }
        }

        function updateTokenPositionsAndMarkElements(
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

            function visitNode(child: IncrementalNode) {
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

            function visitArray(array: IncrementalNodeArray) {
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

        function extendToAffectedRange(sourceFile: SourceFile, changeRange: TextChangeRange): TextChangeRange {
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

        function findNearestNodeStartingBeforeOrAtPosition(sourceFile: SourceFile, position: number): Node {
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

            function getLastChild(node: Node): Node {
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

            function getLastChildWorker(node: Node): Node {
                let last: Node = undefined;
                forEachChild(node, child => {
                    if (nodeIsPresent(child)) {
                        last = child;
                    }
                });
                return last;
            }

            function visit(child: Node) {
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

        function checkChangeRange(sourceFile: SourceFile, newText: string, textChangeRange: TextChangeRange, aggressiveChecks: boolean) {
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

        function createSyntaxCursor(sourceFile: SourceFile): SyntaxCursor {
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
            function findHighestListElementThatStartsAtPosition(position: number) {
                // Clear out any cached state about the last node we found.
                currentArray = undefined;
                currentArrayIndex = InvalidPosition.Value;
                current = undefined;

                // Recurse into the source file to find the highest node at this position.
                forEachChild(sourceFile, visitNode, visitArray);
                return;

                function visitNode(node: Node) {
                    if (position >= node.pos && position < node.end) {
                        // Position was within this node.  Keep searching deeper to find the node.
                        forEachChild(node, visitNode, visitArray);

                        // don't proceed any further in the search.
                        return true;
                    }

                    // position wasn't in this node, have to keep searching.
                    return false;
                }

                function visitArray(array: NodeArray<Node>) {
                    if (position >= array.pos && position < array.end) {
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
}
