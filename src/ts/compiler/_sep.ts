namespace ts {


    /* @internal */
    export function tokenIsIdentifierOrKeyword(token: TokenType): boolean {
        return token >= TokenType.Identifier;
    }


    /* @internal */
    export function computeLineStarts(text: string): number[] {
        const result: number[] = new Array();
        let pos = 0;
        let lineStart = 0;
        while (pos < text.length) {
            const ch = text.charCodeAt(pos);
            pos++;
            switch (ch) {
                case CharCode.carriageReturn:
                    if (text.charCodeAt(pos) === CharCode.lineFeed) {
                        pos++;
                    }
                case CharCode.lineFeed:
                    result.push(lineStart);
                    lineStart = pos;
                    break;
                default:
                    if (ch > CharCode.MAX_ASCII && isLineBreak(ch)) {
                        result.push(lineStart);
                        lineStart = pos;
                    }
                    break;
            }
        }
        result.push(lineStart);
        return result;
    }

    export function getPositionOfLineAndCharacter(sourceFile: SourceFile, line: number, character: number): number {
        return computePositionOfLineAndCharacter(getLineStarts(sourceFile), line, character);
    }

    /* @internal */
    export function computePositionOfLineAndCharacter(lineStarts: number[], line: number, character: number): number {
        Debug.assert(line >= 0 && line < lineStarts.length);
        return lineStarts[line] + character;
    }

    /* @internal */
    export function getLineStarts(sourceFile: SourceFile): number[] {
        return sourceFile.lineMap || (sourceFile.lineMap = computeLineStarts(sourceFile.text));
    }

    /* @internal */
    /**
     * We assume the first line starts at position 0 and 'position' is non-negative.
     */
    export function computeLineAndCharacterOfPosition(lineStarts: number[], position: number) {
        let lineNumber = binarySearch(lineStarts, position);
        if (lineNumber < 0) {
            // If the actual position was not found,
            // the binary search returns the 2's-complement of the next line start
            // e.g. if the line starts at [5, 10, 23, 80] and the position requested was 20
            // then the search will return -2.
            //
            // We want the index of the previous line start, so we subtract 1.
            // Review 2's-complement if this is confusing.
            lineNumber = ~lineNumber - 1;
            Debug.assert(lineNumber !== -1, "position cannot precede the beginning of the file");
        }
        return {
            line: lineNumber,
            character: position - lineStarts[lineNumber]
        };
    }

    export function getLineAndCharacterOfPosition(sourceFile: SourceFile, position: number): LineAndCharacter {
        return computeLineAndCharacterOfPosition(getLineStarts(sourceFile), position);
    }


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
                return visitNodes(cbNodes, (<BlockStatement>node).statements);
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
}