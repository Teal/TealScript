/**
 * @fileOverview 语法解析器
 * @author xuld@vip.qq.com
 */

import {CharCode} from './unicode';
import {TextRange} from './location';
import {TokenType, tokenToString, isKeyword, isReservedWord, isExpressionStart, isDeclarationStart, isModifier} from './tokenType';
import {Lexer, LexerOptions} from './lexer';
import * as nodes from './nodes';

/**
 * 表示一个语法解析器。
 * @description 语法解析器可以将源码解析一个语法树。
 */
export class Parser {

    // #region 对外接口

    /**
     * 获取或设置当前语法解析器使用的词法解析器。
     */
    lexer = new Lexer();

    /**
     * 获取当前语法解析器的配置。
     */
    get options(): ParserOptions {
        return this.lexer.options;
    }

    /**
     * 设置当前语法解析器的配置。
     */
    set options(value) {
        this.lexer.options = value;
    }

    /**
     * 解析指定的源文件。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param options 解析的源码位置。
     */
    parse(text: string, start?: number, options?: ParserOptions) {
        return this.parseSourceFile(text || "", start || 0, options);
    }

    /**
     * 从指定的输入解析一个语句。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param fileName 解析的源码位置。
     */
    parseAsStatement(text: string, start?: number, fileName?: string) {
        this.lexer.setSource(text, start, fileName);
        return this.parseStatement();
    }

    /**
     * 从指定的输入解析一个表达式。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param fileName 解析的源码位置。
     */
    parseAsExpression(text: string, start?: number, fileName?: string) {
        this.lexer.setSource(text, start, fileName);
        return this.parseExpression();
    }

    /**
     * 从指定的输入解析一个类型表达式。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param fileName 解析的源码位置。
     */
    parseAsTypeExpression(text: string, start?: number, fileName?: string) {
        delete this.lexer.comment;
        this.lexer.setSource(text, start, fileName);
        return this.parseTypeExpression();
    }

    /**
     * 报告一个语法错误。
     * @param range 发生错误的位置。
     * @param message 错误的信息。
     * @param args 格式化错误的参数。
     */
    error(range: TextRange, message: string, ...args: any[]) {
        // error(ErrorType.syntaxError, this.lexer.fileName, range.start, range.end, message, ...args);
    }

    // #endregion

    // #region 解析节点底层

    /**
     * 读取一个指定类型的标记。如果下一个标记不是指定的类型则报告错误。
     * @param token 期待的标记。
     * @returns 返回读取的标记位置。
     */
    private readToken(token: TokenType) {
        if (this.lexer.peek().type === token) {
            return this.lexer.read().start;
        }
        this.error(this.lexer.peek(), token !== TokenType.identifier ? "应输入“{0}”。" : isKeyword(token) ? "应输入标识符；“{0}”是关键字。" : "应输入标识符。", tokenToString(token));
        return this.lexer.current.end;
    }

    /**
     * 尝试读取一个指定类型的标记。如果下一个标记不是指定的类型则不读取。
     * @param token 期待的标记。
     * @returns 如果读取成功则返回 true，否则返回 false。
     */
    private tryReadToken(token: TokenType) {
        if (this.lexer.peek().type === token) {
            this.lexer.read();
            return true;
        }
        return false;
    }

    /**
     * 解析一个没有开始和结束标记的列表。
     * @param parseElement 解析每个项的函数。
     */
    private parseSimpleList<T extends nodes.Node>(parseElement: () => T) {
        const result = new nodes.NodeList<T>();
        while (this.lexer.peek().type !== TokenType.endOfFile) {
            const element = <T>parseElement.call(this);
            if (!element) break;
            result.push(element);
        }
        return result;
    }

    /**
     * 解析一个有开始和结束标记的列表。
     * @param openToken 列表的开始标记。
     * @param parseElement 解析每个元素的函数。
     * @param closeToken 列表的结束标记。
     */
    private parseDelimitedList<T extends nodes.Node>(openToken: TokenType, parseElement: () => T, closeToken: TokenType) {
        const result = new nodes.NodeList<T>();
        result.start = this.readToken(openToken);
        while (this.lexer.peek().type !== closeToken && this.lexer.peek().type !== TokenType.endOfFile) {
            const element = <T>parseElement.call(this);
            if (!element) break;
            result.push(element);
        }
        result.end = this.readToken(closeToken);
        return result;
    }

    /**
     * 在不影响现有状态的情况下尝试解析。
     * @param parser 解析的函数。
     * @return 如果尝试解析成功则返回 true，否则返回 false。
     */
    private tryParse<T>(parser: (errors: IArguments[]) => T) {
        const errors = [];
        const error = this.error;
        this.error = function () { errors.push(arguments); };
        this.lexer.stashSave();
        if (parser.call(this, errors) === false) {
            this.error = error;
            this.lexer.stashRestore();
            return false;
        }

        this.error = error;
        this.lexer.stashClear();
        for (const e of errors) {
            this.error.apply(this, e);
        }
        return true;
    }

    /**
     * 存储临时保存状态后累积的错误。
     */
    private stashErrors: IArguments[];

    /**
     * 临时保存状态用于处理错误的函数。
     */
    private orignalError: Function;

    /**
     * 临时保存状态用于处理错误的函数。
     */
    private stashError() {
        this.stashErrors.push(arguments);
    }

    /**
     * 保存当前读取的进度。保存之后可以通过 {@link stashRestore} 恢复进度。
     */
    private stashSave() {
        this.orignalError = this.error;
    }

    /**
     * 恢复之前保存的进度。
     */
    private stashRestore() {

    }

    /**
     * 清除之前保存的进度。
     */
    private stashClear() {

    }

    // #endregion

    // #region 解析类型节点

    /**
     * 解析一个类型节点(`number`、`string[]`、...)。
     */
    private parseTypeNode() {
        // todo: 关闭 yield | await
        switch (this.lexer.peek().type) {
            case TokenType.openParen:
                if (this.isArrowFunction()) {
                    return this.parseFunctionOrConstructorTypeNode(TokenType.function);
                }
                break;
            case TokenType.lessThan:
                return this.parseFunctionOrConstructorTypeNode(TokenType.function);
            case TokenType.new:
                return this.parseFunctionOrConstructorTypeNode(TokenType.new);
        }
        return this.parseUnionOrIntersectionTypeOrHigher(TokenType.bar);
        // todo: 防止用户输入表达式。
    }

    /**
     * 尝试解析之后的定义。
     */
    private tryParseParameterDeclarations() {
        return this.tryParse(() => {
            const parameters = this.parseParameterDeclarations();
            if (this.lexer.peek().type === TokenType.equalsGreaterThan || this.lexer.peek().type === TokenType.colon) {
                return parameters;
            }
        });
    }

    /**
     * 判断是否紧跟箭头函数。
     */
    private isArrowFunction() {

    }

    /**
     * 判断下一个字符是否可作为变量名。
     */
    private isBindingName() {
        switch (this.lexer.peek().type) {
            case TokenType.identifier:
            case TokenType.openBracket:
            case TokenType.openBrace:
                return true;
            default:
                return isReservedWord(this.lexer.peek().type);
        }
    }

    // nodes.Ignore strict mode flag because we will report an error in type checker instead.
    private isIdentifier(): boolean {
        if (this.lexer.peek().type === TokenType.Identifier) {
            return true;
        }

        // nodes.If we have a 'yield' keyword, and we're in the [yield] context, then 'yield' is
        // considered a keyword and is not an identifier.
        if (this.lexer.peek().type === TokenType.yield && this.inYieldContext()) {
            return false;
        }

        // nodes.If we have a 'await' keyword, and we're in the [nodes.Await] context, then 'await' is
        // considered a keyword and is not an identifier.
        if (this.lexer.peek().type === TokenType.await && this.inAwaitContext()) {
            return false;
        }

        return this.lexer.peek().type > TokenType.LastReservedWord;
    }

    /**
     * 解析一个函数类型节点(`()=>void`)或构造函数类型节点(`new ()=>void`)。
     * @param type 解析的类型。合法的值有：function、new
     */
    private parseFunctionOrConstructorTypeNode(type: TokenType) {
        const result = type === TokenType.new ? new nodes.ConstructorTypeNode() : new nodes.FunctionTypeNode();
        if (type === TokenType.new) result.start = this.readToken(TokenType.new);
        this.parseMethodSignature(result, true, false, false, false);
        return result;
    }

    /**
     * 解析方法签名。
     * @param result 解析的结果。
     * @param returnToken 表示结果的返回类型。
     * @param yieldContext
     * @param awaitContext
     * @param requireCompleteParameterList
     */
    private parseMethodSignature(result: nodes.FunctionTypeNode | nodes.MethodDeclaration | nodes.AccessorDeclaration, isType: boolean, yieldContext: boolean, awaitContext: boolean, requireCompleteParameterList: boolean) {
        result.typeParameters = this.parseTypeParameterDeclarations();
        result.parameters = this.parseParameterDeclarations(yieldContext, awaitContext, requireCompleteParameterList);
        if (isType) {
            (<nodes.FunctionTypeNode | nodes.ConstructorTypeNode>result).arrowToken = this.readToken(TokenType.equalsGreaterThan);
            result.returnType = this.parseTypeOrTypePredicate();
        } else if (this.tryReadToken(TokenType.comma)) {
            (<nodes.MethodDeclaration | nodes.AccessorDeclaration>result).colonToken = this.lexer.current.start;
            result.returnType = this.parseTypeOrTypePredicate();
        }
    }

    /**
     * 解析一个泛型参数声明列表。
     */
    private parseTypeParameterDeclarations() {
        if (this.lexer.peek().type === TokenType.lessThan) {
            return this.parseDelimitedList(TokenType.lessThan, this.parseTypeParameterDeclaration, TokenType.greaterThan);
        }
    }

    /**
     * 解析一个类型参数声明(`T`、`T extends R`)。
     */
    private parseTypeParameterDeclaration() {
        // 当前必须是 < 或 , 才是类型参数开始。
        if (this.lexer.current.type !== TokenType.comma &&
            this.lexer.current.type !== TokenType.lessThan) return;
        const result = new nodes.TypeParameterDeclaration();
        result.name = this.parseIdentifier();
        if (this.tryReadToken(TokenType.extends)) {
            result.extendsToken = this.lexer.current.start;
            result.extends = this.parseTypeNode();
        }
        if (this.tryReadToken(TokenType.comma)) {
            result.commaToken = this.lexer.current.start;
        }
        return result;
    }

    private parseParameterDeclarations(yieldContext: boolean, awaitContext: boolean, requireCompleteParameterList: boolean) {
        // todo: 设置 yield  和 await
        return this.parseDelimitedList(TokenType.openParen, this.parseParameterDeclaration, TokenType.closeParen);


        //if (this.readToken(TokenType.openParen)) {

        //    const savedYieldContext = this.inYieldContext();
        //    const savedAwaitContext = this.inAwaitContext();

        //    this.setYieldContext(yieldContext);
        //    this.setAwaitContext(awaitContext);

        //    const result = this.parseNodeList(TokenType.openParen, this.parseParameterDeclaration, TokenType.closeParen);

        //    this.setYieldContext(savedYieldContext);
        //    this.setAwaitContext(savedAwaitContext);

        //    //if (!this.readToken(TokenType.closeParen) && requireCompleteParameterList) {
        //    //    // nodes.Caller insisted that we had to end with a )   nodes.We didn't.  nodes.So just return
        //    //    // undefined here.
        //    //    return undefined;
        //    //}

        //    return result;
        //}

        //// nodes.We didn't even have an open paren.  nodes.If the caller requires a complete parameter list,
        //// we definitely can't provide that.  nodes.However, if they're ok with an incomplete one,
        //// then just return an empty set of parameters.
        //return requireCompleteParameterList ? undefined : this.createMissingList<nodes.ParameterDeclaration>();
    }

    private parseParameterDeclaration() {
        // 当前必须是 ( 或 , 才是类型参数开始。
        if (this.lexer.current.type !== TokenType.comma &&
            this.lexer.current.type !== TokenType.lessThan) return;
        const result = new nodes.ParameterDeclaration();
        if (this.lexer.peek().type === TokenType.this) {
            result.name = this.createIdentifier(/*this.isIdentifier*/true, undefined);
            result.type = this.parseParameterType();
            return result;
        }

        result.decorators = this.parseDecorators();
        result.modifiers = this.parseModifiers();
        result.dotDotDotToken = this.tryReadTokenToken(TokenType.dotDotDot);

        // nodes.FormalParameter [nodes.Yield,nodes.Await]:
        //      nodes.BindingElement[?nodes.Yield,?nodes.Await]
        result.name = this.parseBindingName();
        if (getFullWidth(result.name) === 0 && result.flags === 0 && isModifierKind(this.lexer.peek().type)) {
            // in cases like
            // 'use strict'
            // function foo(static)
            // isParameter('static') === true, because of isModifier('static')
            // however 'static' is not a legal identifier in a strict mode.
            // so this.result of this function will be nodes.ParameterDeclaration (flags = 0, name = missing, type = undefined, initializer = undefined)
            // and current this.lexer.peek().type will not change => parsing of the enclosing parameter list will last till the end of time (or nodes.OOM)
            // to avoid this we'll advance cursor to the next this.lexer.peek().type.
            this.lexer.read().type;
        }

        result.questionToken = this.tryReadTokenToken(TokenType.question);
        result.type = this.parseParameterType();
        result.initializer = this.parseBindingElementInitializer(/*inParameter*/ true);

        // nodes.Do not check for initializers in an ambient context for parameters. nodes.This is not
        // a grammar error because the grammar allows arbitrary call signatures in
        // an ambient context.
        // nodes.It is actually not necessary for this to be an error at all. nodes.The reason is that
        // function/constructor implementations are syntactically disallowed in ambient
        // contexts. nodes.In addition, parameter initializers are semantically disallowed in
        // overload signatures. nodes.So parameter initializers are transitively disallowed in
        // ambient contexts.

        return this.parseJsDocComment(result);
    }

    private parseDecorators() {
        return this.parseSimpleList(this.parseDecorator);
    }

    /**
     * 解析一个修饰器(`@x`)。
     */
    private parseDecorator() {
        if (!this.tryReadToken(TokenType.at)) return;
        const result = new nodes.Decorator();
        result.start = this.lexer.current.start;
        result.body = this.doInDecoratorContext(this.parseLeftHandSideExpressionOrHigher);
        return result;
    }

    /*
     * nodes.There are situations in which a modifier like 'const' will appear unexpectedly, such as on a class member.
     * nodes.In those situations, if we are entirely sure that 'const' is not valid on its own (such as when nodes.ASI takes effect
     * and turns it into a standalone declaration), then it is better to parse it and report an error later.
     *
     * nodes.In such situations, 'permitInvalidConstAsModifier' should be set to true.
     */
    private parseModifiers(permitInvalidConstAsModifier?: boolean): nodes.NodeList<nodes.Modifier> {
        let flags: nodes.NodeFlags = 0;
        let modifiers: nodes.NodeList<nodes.Modifier>;
        while (true) {
            const modifierStart = this.lexer.getStartPos();
            const modifierKind = this.lexer.peek().type;

            if (this.lexer.peek().type === TokenType.const && permitInvalidConstAsModifier) {
                // nodes.We need to ensure that any subsequent modifiers appear on the same line
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
                modifiers = <nodes.NodeList<nodes.Modifier>>[];
                modifiers.pos = modifierStart;
            }

            flags |= modifierToFlag(modifierKind);
            modifiers.push(this.finishNode(this.createNode(modifierKind, modifierStart)));
        }
        if (modifiers) {
            modifiers.flags = flags;
            modifiers.end = this.lexer.getStartPos();
        }
        return modifiers;
    }

    /**
     * 解析一个联合类型节点(`number | string`)或交错类型节点(`number & string`)。
     * @param type 解析的类型。合法的值有：|、&。
     */
    private parseUnionOrIntersectionTypeOrHigher(type: TokenType) {
        let result: nodes.TypeNode = type === TokenType.ampersand ? this.parseArrayTypeOrHigher() : this.parseUnionOrIntersectionTypeOrHigher(TokenType.ampersand);
        while (this.lexer.peek().type === type) {
            const newResult = type === TokenType.ampersand ? new nodes.IntersectionTypeNode() : new nodes.UnionTypeNode();
            newResult.leftOperand = result;
            newResult.operatorToken = this.readToken(type);
            newResult.rightOperand = type === TokenType.ampersand ? this.parseArrayTypeOrHigher() : this.parseUnionOrIntersectionTypeOrHigher(TokenType.ampersand);
            result = newResult;
        }
        return result;
    }

    private parseTypeReference(): nodes.TypeReferenceNode {
        const typeName = this.parseEntityName(/*allowReservedWords*/ false, nodes.Diagnostics.Type_expected);
        const result = new nodes.TypeReferenceNode();
        result.typeName = typeName;
        if (!this.lexer.peek().hasLineBreakBeforeStart && this.lexer.peek().type === TokenType.lessThan) {
            result.typeArguments = this.parseBracketedList(nodes.ParsingContext.TypeArguments, this.parseTypeNode, TokenType.lessThan, TokenType.greaterThan);
        }
        return result;
    }

    private parseThisTypePredicate(lhs: nodes.ThisTypeNode): nodes.TypePredicateNode {
        this.lexer.read().type;
        const result = this.createNode(TokenType.TypePredicate, lhs.pos) as nodes.TypePredicateNode;
        result.parameterName = lhs;
        result.type = this.parseTypeNode();
        return result;
    }

    private parseThisTypeNode(): nodes.ThisTypeNode {
        const result = this.createNode(TokenType.ThisType) as nodes.ThisTypeNode;
        this.lexer.read().type;
        return result;
    }

    private parseTypeQuery(): nodes.TypeQueryNode {
        const result = new nodes.TypeQueryNode();
        this.readToken(TokenType.typeof);
        result.exprName = this.parseEntityName(/*allowReservedWords*/ true);
        return result;
    }

    private parseParameterType(): nodes.TypeNode {
        if (this.tryReadToken(TokenType.colon)) {
            return this.parseTypeNode();
        }

        return undefined;
    }

    private isStartOfParameter(): boolean {
        return this.lexer.peek().type === TokenType.dotDotDot || this.isIdentifierOrPattern() || isModifierKind(this.lexer.peek().type) || this.lexer.peek().type === TokenType.at || this.lexer.peek().type === TokenType.this;
    }

    private parseBindingElementInitializer(inParameter: boolean) {
        return inParameter ? this.parseParameterInitializer() : this.parseNonParameterInitializer();
    }

    private parseParameterInitializer() {
        return this.parseInitializer(/*inParameter*/ true);
    }

    private parseTypeMemberSemicolon() {
        // nodes.We allow type members to be separated by commas or (possibly nodes.ASI) semicolons.
        // nodes.First check if it was a comma.  nodes.If so, we're done with the member.
        if (this.tryReadToken(TokenType.comma)) {
            return;
        }

        // nodes.Didn't have a comma.  nodes.We must have a (possible nodes.ASI) semicolon.
        this.tryReadSemicolon();
    }

    private parseSignatureMember(kind: TokenType): nodes.CallSignatureDeclaration | nodes.ConstructSignatureDeclaration {
        const result = new nodes.CallSignatureDeclaration | nodes.ConstructSignatureDeclaration();
        if (kind === TokenType.ConstructSignature) {
            this.readToken(TokenType.new);
        }
        this.parseMethodSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, result);
        this.parseTypeMemberSemicolon();
        return result;
    }

    private isIndexSignature(): boolean {
        if (this.lexer.peek().type !== TokenType.openBracket) {
            return false;
        }

        return this.lookAhead(this.isUnambiguouslyIndexSignature);
    }

    private isUnambiguouslyIndexSignature() {
        // nodes.The only allowed sequence is:
        //
        //   [id:
        //
        // nodes.However, for error recovery, we also check the following cases:
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
        this.lexer.read().type;
        if (this.lexer.peek().type === TokenType.dotDotDot || this.lexer.peek().type === TokenType.closeBracket) {
            return true;
        }

        if (isModifierKind(this.lexer.peek().type)) {
            this.lexer.read().type;
            if (this.isIdentifier()) {
                return true;
            }
        }
        else if (!this.isIdentifier()) {
            return false;
        }
        else {
            // nodes.Skip the identifier
            this.lexer.read().type;
        }

        // A colon signifies a well formed indexer
        // A comma should be a badly formed indexer because comma expressions are not allowed
        // in computed properties.
        if (this.lexer.peek().type === TokenType.colon || this.lexer.peek().type === TokenType.comma) {
            return true;
        }

        // nodes.Question mark could be an indexer with an optional property,
        // or it could be a conditional expression in a computed property.
        if (this.lexer.peek().type !== TokenType.question) {
            return false;
        }

        // nodes.If any of the following tokens are after the question mark, it cannot
        // be a conditional expression, so treat it as an indexer.
        this.lexer.read().type;
        return this.lexer.peek().type === TokenType.colon || this.lexer.peek().type === TokenType.comma || this.lexer.peek().type === TokenType.closeBracket;
    }

    private parseIndexSignatureDeclaration(fullStart: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>): nodes.IndexSignatureDeclaration {
        const result = new nodes.IndexSignatureDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        result.parameters = this.parseBracketedList(nodes.ParsingContext.Parameters, this.parseParameterDeclaration, TokenType.openBracket, TokenType.closeBracket);
        result.type = this.parseTypeAnnotation();
        this.parseTypeMemberSemicolon();
        return result;
    }

    private parsePropertyOrMethodSignature(fullStart: number, modifiers: nodes.NodeList<nodes.Modifier>): nodes.PropertySignature | nodes.MethodSignature {
        const name = this.parsePropertyName();
        const questionToken = this.tryReadTokenToken(TokenType.question);

        if (this.lexer.peek().type === TokenType.openParen || this.lexer.peek().type === TokenType.lessThan) {
            const method = new nodes.MethodSignature();
            method.modifiers = modifiers;
            method.name = name;
            method.questionToken = questionToken;

            // nodes.Method signatures don't exist in expression contexts.  nodes.So they have neither
            // [nodes.Yield] nor [nodes.Await]
            this.parseMethodSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, method);
            this.parseTypeMemberSemicolon();
            return this.finishNode(method);
        }
        else {
            const property = new nodes.PropertySignature();
            property.modifiers = modifiers;
            property.name = name;
            property.questionToken = questionToken;
            property.type = this.parseTypeAnnotation();

            if (this.lexer.peek().type === TokenType.equals) {
                // nodes.Although type literal properties cannot not have initializers, we attempt
                // to parse an initializer so we can report in the checker that an interface
                // property or type literal property cannot have an initializer.
                property.initializer = this.parseNonParameterInitializer();
            }

            this.parseTypeMemberSemicolon();
            return this.finishNode(property);
        }
    }

    private isTypeMemberStart(): boolean {
        let idToken: TokenType;
        // nodes.Return true if we have the start of a signature member
        if (this.lexer.peek().type === TokenType.openParen || this.lexer.peek().type === TokenType.lessThan) {
            return true;
        }
        // nodes.Eat up all modifiers, but hold on to the last one in case it is actually an identifier
        while (isModifierKind(this.lexer.peek().type)) {
            idToken = this.lexer.peek().type;
            this.lexer.read().type;
        }
        // nodes.Index signatures and computed property names are type members
        if (this.lexer.peek().type === TokenType.openBracket) {
            return true;
        }
        // nodes.Try to get the first property-like this.lexer.peek().type following all modifiers
        if (this.isLiteralPropertyName()) {
            idToken = this.lexer.peek().type;
            this.lexer.read().type;
        }
        // nodes.If we were able to get any potential identifier, check that it is
        // the start of a member declaration
        if (idToken) {
            return this.lexer.peek().type === TokenType.openParen ||
                this.lexer.peek().type === TokenType.lessThan ||
                this.lexer.peek().type === TokenType.question ||
                this.lexer.peek().type === TokenType.colon ||
                this.canParseSemicolon();
        }
        return false;
    }

    private parseTypeMember(): nodes.TypeElement {
        if (this.lexer.peek().type === TokenType.openParen || this.lexer.peek().type === TokenType.lessThan) {
            return this.parseSignatureMember(TokenType.CallSignature);
        }
        if (this.lexer.peek().type === TokenType.new && this.lookAhead(this.isStartOfConstructSignature)) {
            return this.parseSignatureMember(TokenType.ConstructSignature);
        }
        const fullStart = this.getNodePos();
        const modifiers = this.parseModifiers();
        if (this.isIndexSignature()) {
            return this.parseIndexSignatureDeclaration(fullStart, /*decorators*/ undefined, modifiers);
        }
        return this.parsePropertyOrMethodSignature(fullStart, modifiers);
    }

    private isStartOfConstructSignature() {
        this.lexer.read().type;
        return this.lexer.peek().type === TokenType.openParen || this.lexer.peek().type === TokenType.lessThan;
    }

    private parseTypeLiteral(): nodes.TypeLiteralNode {
        const result = new nodes.TypeLiteralNode();
        result.members = this.parseObjectTypeMembers();
        return result;
    }

    private parseObjectTypeMembers(): nodes.NodeList<nodes.TypeElement> {
        let members: nodes.NodeList<nodes.TypeElement>;
        if (this.readToken(TokenType.openBrace)) {
            members = this.parseList(nodes.ParsingContext.TypeMembers, this.parseTypeMember);
            this.readToken(TokenType.closeBrace);
        }
        else {
            members = this.createMissingList<nodes.TypeElement>();
        }

        return members;
    }

    /**
     * 解析一个元祖类型节点(`[string, number]`)。
     */
    private parseTupleType() {
        const result = new nodes.TupleTypeNode();
        result.elements = this.parseArrayElements(this.parseTypeNode);
        return result;
    }

    private parseParenthesizedType(): nodes.ParenthesizedTypeNode {
        const result = new nodes.ParenthesizedTypeNode();
        this.readToken(TokenType.openParen);
        result.type = this.parseTypeNode();
        this.readToken(TokenType.closeParen);
        return result;
    }

    private parseKeywordAndNoDot(): nodes.TypeNode {
        const result = this.parseTokenNode<nodes.TypeNode>();
        return this.lexer.peek().type === TokenType.dot ? undefined : result;
    }

    private parseNonArrayType(): nodes.TypeNode {
        switch (this.lexer.peek().type) {
            case TokenType.any:
            case TokenType.string:
            case TokenType.number:
            case TokenType.boolean:
            case TokenType.symbol:
            case TokenType.undefined:
            case TokenType.never:
                // nodes.If these are followed by a dot, then parse these out as a dotted type reference instead.
                const result = this.tryParse(this.parseKeywordAndNoDot);
                return result || this.parseTypeReference();
            case TokenType.StringLiteral:
                return this.parseStringLiteralTypeNode();
            case TokenType.void:
            case TokenType.null:
                return this.parseTokenNode<nodes.TypeNode>();
            case TokenType.this: {
                const thisKeyword = this.parseThisTypeNode();
                if (this.lexer.peek().type === TokenType.is && !this.lexer.peek().hasLineBreakBeforeStart) {
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

    private isStartOfType(): boolean {
        switch (this.lexer.peek().type) {
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
                // nodes.Only consider '(' the start of a type if followed by ')', '...', an identifier, a modifier,
                // or something that starts a type. nodes.We don't want to consider things like '(1)' a type.
                return this.lookAhead(this.isStartOfParenthesizedOrFunctionType);
            default:
                return this.isIdentifier();
        }
    }

    private isStartOfParenthesizedOrFunctionType() {
        this.lexer.read().type;
        return this.lexer.peek().type === TokenType.closeParen || this.isStartOfParameter() || this.isStartOfType();
    }

    private parseArrayTypeOrHigher(): nodes.TypeNode {
        let type = this.parseNonArrayType();
        while (!this.lexer.peek().hasLineBreakBeforeStart && this.tryReadToken(TokenType.openBracket)) {
            this.readToken(TokenType.closeBracket);
            const result = new nodes.ArrayTypeNode();
            result.elementType = type;
            type = result;
        }
        return type;
    }

    private parseTypeOrTypePredicate(): nodes.TypeNode {
        const typePredicateVariable = this.isIdentifier() && this.tryParse(this.parseTypePredicatePrefix);
        const type = this.parseTypeNode();
        if (typePredicateVariable) {
            const result = new nodes.TypePredicateNode();
            result.parameterName = typePredicateVariable;
            result.type = type;
            return result;
        }
        else {
            return type;
        }
    }

    private parseTypePredicatePrefix() {
        const id = this.parseIdentifier();
        if (this.lexer.peek().type === TokenType.is && !this.lexer.peek().hasLineBreakBeforeStart) {
            this.lexer.read().type;
            return id;
        }
    }

    private parseTypeAnnotation(): nodes.TypeNode {
        return this.tryReadToken(TokenType.colon) ? this.parseTypeNode() : undefined;
    }


    // #endregion

    // #region 解析表达式

    /**
     * 读取一个标识符或可降级为标识符的关键字。
     * @param allowES3Keyword 是否允许将普通关键字作为标识符解析。
     * @return 返回标识符节点。
     */
    private readIdentifier(allowES3Keyword?: boolean) {
        if (this.lexer.peek().type === TokenType.identifier || (allowES3Keyword ? isKeyword(this.lexer.peek().type) : isReservedWord(this.lexer.peek().type))) {
            return this.parseIdentifier();
        }
        this.expectToken(TokenType.identifier);
        const result = new nodes.Identifier();
        result.start = result.end = this.lexer.current.end;
        return result;
    }

    // nodes.EXPRESSIONS
    private isStartOfLeftHandSideExpression(): boolean {
        switch (this.lexer.peek().type) {
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

    private isStartOfExpression(): boolean {
        if (this.isStartOfLeftHandSideExpression()) {
            return true;
        }

        switch (this.lexer.peek().type) {
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
                // nodes.Yield/await always starts an expression.  nodes.Either it is an identifier (in which case
                // it is definitely an expression).  nodes.Or it's a keyword (either because we're in
                // a generator or async function, or in strict mode (or both)) and it started a yield or await expression.
                return true;
            default:
                // nodes.Error tolerance.  nodes.If we see the start of some binary operator, we consider
                // that the start of an expression.  nodes.That way we'll parse out a missing identifier,
                // give a good message about an identifier being missing, and then consume the
                // rest of the binary expression.
                if (this.isBinaryOperator()) {
                    return true;
                }

                return this.isIdentifier();
        }
    }

    private isStartOfExpressionStatement(): boolean {
        // nodes.As per the grammar, none of '{' or 'function' or 'class' can start an expression statement.
        return this.lexer.peek().type !== TokenType.openBrace &&
            this.lexer.peek().type !== TokenType.function &&
            this.lexer.peek().type !== TokenType.class &&
            this.lexer.peek().type !== TokenType.at &&
            this.isStartOfExpression();
    }

    private parseExpression(): nodes.Expression {
        // nodes.Expression[in]:
        //      nodes.AssignmentExpression[in]
        //      nodes.Expression[in] , nodes.AssignmentExpression[in]

        // clear the decorator context when parsing nodes.Expression, as it should be unambiguous when parsing a decorator
        const saveDecoratorContext = this.inDecoratorContext();
        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ false);
        }

        let expr = this.parseAssignmentExpressionOrHigher();
        let operatorToken: nodes.Node;
        while ((operatorToken = this.tryReadTokenToken(TokenType.comma))) {
            expr = this.makeBinaryExpression(expr, operatorToken, this.parseAssignmentExpressionOrHigher());
        }

        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ true);
        }
        return expr;
    }

    private parseInitializer(inParameter: boolean): nodes.Expression {
        if (this.lexer.peek().type !== TokenType.equals) {
            // It's not uncommon during typing for the user to miss writing the '=' this.lexer.peek().type.  Check if
            // there is no newline after the last this.lexer.peek().type and if we're on an expression.  If so, parse
            // this as an equals-value clause with a missing equals.
            // NOTE: There are two places where we allow equals-value clauses.  The first is in a
            // variable declarator.  The second is with a parameter.  For variable declarators
            // it's more likely that a { would be a allowed (as an object literal).  While this
            // is also allowed for parameters, the risk is that we consume the { as an object
            // literal when it really will be for the block following the parameter.
            if (this.lexer.peek().hasLineBreakBeforeStart || (inParameter && this.lexer.peek().type === TokenType.openBrace) || !this.isStartOfExpression()) {
                // preceding line break, open brace in a parameter (likely a function body) or current this.lexer.peek().type is not an expression -
                // do not try to parse initializer
                return undefined;
            }
        }

        // nodes.Initializer[nodes.In, nodes.Yield] :
        //     = nodes.AssignmentExpression[?nodes.In, ?nodes.Yield]

        this.readToken(TokenType.equals);
        return this.parseAssignmentExpressionOrHigher();
    }

    private parseAssignmentExpressionOrHigher(): nodes.Expression {
        //  nodes.AssignmentExpression[in,yield]:
        //      1) nodes.ConditionalExpression[?in,?yield]
        //      2) nodes.LeftHandSideExpression = nodes.AssignmentExpression[?in,?yield]
        //      3) nodes.LeftHandSideExpression nodes.AssignmentOperator nodes.AssignmentExpression[?in,?yield]
        //      4) nodes.ArrowFunctionExpression[?in,?yield]
        //      5) nodes.AsyncArrowFunctionExpression[in,yield,await]
        //      6) [+nodes.Yield] nodes.YieldExpression[?nodes.In]
        //
        // nodes.Note: for ease of implementation we treat productions '2' and '3' as the same thing.
        // (i.e. they're both nodes.BinaryExpressions with an assignment operator in it).

        // nodes.First, do the simple check if we have a nodes.YieldExpression (production '5').
        if (this.isYieldExpression()) {
            return this.parseYieldExpression();
        }

        // nodes.Then, check if we have an arrow function (production '4' and '5') that starts with a parenthesized
        // parameter list or is an async arrow function.
        // nodes.AsyncArrowFunctionExpression:
        //      1) async[no nodes.LineTerminator here]nodes.AsyncArrowBindingIdentifier[?nodes.Yield][no nodes.LineTerminator here]=>nodes.AsyncConciseBody[?nodes.In]
        //      2) nodes.CoverCallExpressionAndAsyncArrowHead[?nodes.Yield, ?nodes.Await][no nodes.LineTerminator here]=>nodes.AsyncConciseBody[?nodes.In]
        // nodes.Production (1) of nodes.AsyncArrowFunctionExpression is parsed in "this.tryParseAsyncSimpleArrowFunctionExpression".
        // nodes.And production (2) is parsed in "this.tryParseParenthesizedArrowFunctionExpression".
        //
        // nodes.If we do successfully parse arrow-function, we must *not* recurse for productions 1, 2 or 3. nodes.An nodes.ArrowFunction is
        // not a  nodes.LeftHandSideExpression, nor does it start a nodes.ConditionalExpression.  nodes.So we are done
        // with nodes.AssignmentExpression if we see one.
        const arrowExpression = this.tryParseParenthesizedArrowFunctionExpression() || this.tryParseAsyncSimpleArrowFunctionExpression();
        if (arrowExpression) {
            return arrowExpression;
        }

        // nodes.Now try to see if we're in production '1', '2' or '3'.  A conditional expression can
        // start with a nodes.LogicalOrExpression, while the assignment productions can only start with
        // nodes.LeftHandSideExpressions.
        //
        // nodes.So, first, we try to just parse out a nodes.BinaryExpression.  nodes.If we get something that is a
        // nodes.LeftHandSide or higher, then we can try to parse out the assignment expression part.
        // nodes.Otherwise, we try to parse out the conditional expression bit.  nodes.We want to allow any
        // binary expression here, so we pass in the 'lowest' precedence here so that it matches
        // and consumes anything.
        const expr = this.parseBinaryExpressionOrHigher(/*precedence*/ 0);

        // nodes.To avoid a look-ahead, we did not handle the case of an arrow function with a single un-parenthesized
        // parameter ('x => ...') above. nodes.We handle it here by checking if the parsed expression was a single
        // identifier and the current this.lexer.peek().type is an arrow.
        if (expr.kind === TokenType.Identifier && this.lexer.peek().type === TokenType.equalsGreaterThan) {
            return this.parseSimpleArrowFunctionExpression(<nodes.Identifier>expr);
        }

        // nodes.Now see if we might be in cases '2' or '3'.
        // nodes.If the expression was a nodes.LHS expression, and we have an assignment operator, then
        // we're in '2' or '3'. nodes.Consume the assignment and return.
        //
        // nodes.Note: we call this.reScanGreaterToken so that we get an appropriately merged this.lexer.peek().type
        // for cases like > > =  becoming >>=
        if (isLeftHandSideExpression(expr) && isAssignmentOperator(this.reScanGreaterToken())) {
            return this.makeBinaryExpression(expr, this.parseTokenNode(), this.parseAssignmentExpressionOrHigher());
        }

        // nodes.It wasn't an assignment or a lambda.  nodes.This is a conditional expression:
        return this.parseConditionalExpressionRest(expr);
    }

    private isYieldExpression(): boolean {
        if (this.lexer.peek().type === TokenType.yield) {
            // nodes.If we have a 'yield' keyword, and this is a context where yield expressions are
            // allowed, then definitely parse out a yield expression.
            if (this.inYieldContext()) {
                return true;
            }

            // nodes.We're in a context where 'yield expr' is not allowed.  nodes.However, if we can
            // definitely tell that the user was trying to parse a 'yield expr' and not
            // just a normal expr that start with a 'yield' identifier, then parse out
            // a 'yield expr'.  nodes.We can then report an error later that they are only
            // allowed in generator expressions.
            //
            // for example, if we see 'yield(foo)', then we'll have to treat that as an
            // invocation expression of something called 'yield'.  nodes.However, if we have
            // 'yield foo' then that is not legal as a normal expression, so we can
            // definitely recognize this as a yield expression.
            //
            // for now we just check if the next this.lexer.peek().type is an identifier.  nodes.More heuristics
            // can be added here later as necessary.  nodes.We just need to make sure that we
            // don't accidentally consume something legal.
            return this.lookAhead(this.nextTokenIsIdentifierOrKeywordOrNumberOnSameLine);
        }

        return false;
    }

    private nextTokenIsIdentifierOnSameLine() {
        this.lexer.read().type;
        return !this.lexer.peek().hasLineBreakBeforeStart && this.isIdentifier();
    }

    private parseYieldExpression(): nodes.YieldExpression {
        const result = new nodes.YieldExpression();

        // nodes.YieldExpression[nodes.In] :
        //      yield
        //      yield [no nodes.LineTerminator here] [nodes.Lexical goal nodes.InputElementRegExp]nodes.AssignmentExpression[?nodes.In, nodes.Yield]
        //      yield [no nodes.LineTerminator here] * [nodes.Lexical goal nodes.InputElementRegExp]nodes.AssignmentExpression[?nodes.In, nodes.Yield]
        this.lexer.read().type;

        if (!this.lexer.peek().hasLineBreakBeforeStart &&
            (this.lexer.peek().type === TokenType.asterisk || this.isStartOfExpression())) {
            result.asteriskToken = this.tryReadTokenToken(TokenType.asterisk);
            result.expression = this.parseAssignmentExpressionOrHigher();
            return result;
        }
        else {
            // if the next this.lexer.peek().type is not on the same line as yield.  or we don't have an '*' or
            // the start of an expression, then this is just a simple "yield" expression.
            return result;
        }
    }

    private parseSimpleArrowFunctionExpression(identifier: nodes.Identifier, asyncModifier?: nodes.NodeList<nodes.Modifier>): nodes.ArrowFunction {
        console.assert(this.lexer.peek().type === TokenType.equalsGreaterThan, "this.parseSimpleArrowFunctionExpression should only have been called if we had a =>");

        let result: nodes.ArrowFunction;
        if (asyncModifier) {
            result = new nodes.ArrowFunction();
            result.modifiers = asyncModifier;
        }
        else {
            result = new nodes.ArrowFunction();
        }

        const parameter = new nodes.ParameterDeclaration();
        parameter.name = identifier;
        this.finishNode(parameter);

        result.parameters = <nodes.NodeList<nodes.ParameterDeclaration>>[parameter];
        result.parameters.pos = parameter.pos;
        result.parameters.end = parameter.end;

        result.equalsGreaterThanToken = this.readTokenToken(TokenType.equalsGreaterThan, /*reportAtCurrentPosition*/ false, nodes.Diagnostics._0_expected, "=>");
        result.body = this.parseArrowFunctionExpressionBody(/*isAsync*/ !!asyncModifier);

        return result;
    }

    private tryParseParenthesizedArrowFunctionExpression(): nodes.Expression {
        const triState = this.isParenthesizedArrowFunctionExpression();
        if (triState === nodes.Tristate.False) {
            // nodes.It's definitely not a parenthesized arrow function expression.
            return undefined;
        }

        // nodes.If we definitely have an arrow function, then we can just parse one, not requiring a
        // following => or { this.lexer.peek().type. nodes.Otherwise, we *might* have an arrow function.  nodes.Try to parse
        // it out, but don't allow any ambiguity, and return 'undefined' if this could be an
        // expression instead.
        const arrowFunction = triState === nodes.Tristate.True
            ? this.parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ true)
            : this.tryParse(this.parsePossibleParenthesizedArrowFunctionExpressionHead);

        if (!arrowFunction) {
            // nodes.Didn't appear to actually be a parenthesized arrow function.  nodes.Just bail out.
            return undefined;
        }

        const isAsync = !!(arrowFunction.flags & nodes.NodeFlags.Async);

        // nodes.If we have an arrow, then try to parse the body. nodes.Even if not, try to parse if we
        // have an opening brace, just in case we're in an error state.
        const lastToken = this.lexer.peek().type;
        arrowFunction.equalsGreaterThanToken = this.readTokenToken(TokenType.equalsGreaterThan, /*reportAtCurrentPosition*/false, nodes.Diagnostics._0_expected, "=>");
        arrowFunction.body = (lastToken === TokenType.equalsGreaterThan || lastToken === TokenType.openBrace)
            ? this.parseArrowFunctionExpressionBody(isAsync)
            : this.parseIdentifier();

        return this.finishNode(arrowFunction);
    }

    //  nodes.True        -> nodes.We definitely expect a parenthesized arrow function here.
    //  nodes.False       -> nodes.There *cannot* be a parenthesized arrow function here.
    //  nodes.Unknown     -> nodes.There *might* be a parenthesized arrow function here.
    //                 nodes.Speculatively look ahead to be sure, and rollback if not.
    private isParenthesizedArrowFunctionExpression(): nodes.Tristate {
        if (this.lexer.peek().type === TokenType.openParen || this.lexer.peek().type === TokenType.lessThan || this.lexer.peek().type === TokenType.async) {
            return this.lookAhead(this.isParenthesizedArrowFunctionExpressionWorker);
        }

        if (this.lexer.peek().type === TokenType.equalsGreaterThan) {
            // nodes.ERROR nodes.RECOVERY nodes.TWEAK:
            // nodes.If we see a standalone => try to parse it as an arrow function expression as that's
            // likely what the user intended to write.
            return nodes.Tristate.True;
        }
        // nodes.Definitely not a parenthesized arrow function.
        return nodes.Tristate.False;
    }

    private isParenthesizedArrowFunctionExpressionWorker() {
        if (this.lexer.peek().type === TokenType.async) {
            this.lexer.read().type;
            if (this.lexer.peek().hasLineBreakBeforeStart) {
                return nodes.Tristate.False;
            }
            if (this.lexer.peek().type !== TokenType.openParen && this.lexer.peek().type !== TokenType.lessThan) {
                return nodes.Tristate.False;
            }
        }

        const first = this.lexer.peek().type;
        const second = this.lexer.read().type;

        if (first === TokenType.openParen) {
            if (second === TokenType.closeParen) {
                // nodes.Simple cases: "() =>", "(): ", and  "() {".
                // nodes.This is an arrow function with no parameters.
                // nodes.The last one is not actually an arrow function,
                // but this is probably what the user intended.
                const third = this.lexer.read().type;
                switch (third) {
                    case TokenType.equalsGreaterThan:
                    case TokenType.colon:
                    case TokenType.openBrace:
                        return nodes.Tristate.True;
                    default:
                        return nodes.Tristate.False;
                }
            }

            // nodes.If encounter "([" or "({", this could be the start of a binding pattern.
            // nodes.Examples:
            //      ([ x ]) => { }
            //      ({ x }) => { }
            //      ([ x ])
            //      ({ x })
            if (second === TokenType.openBracket || second === TokenType.openBrace) {
                return nodes.Tristate.Unknown;
            }

            // nodes.Simple case: "(..."
            // nodes.This is an arrow function with a rest parameter.
            if (second === TokenType.dotDotDot) {
                return nodes.Tristate.True;
            }

            // nodes.If we had "(" followed by something that's not an identifier,
            // then this definitely doesn't look like a lambda.
            // nodes.Note: we could be a little more lenient and allow
            // "(public" or "(private". nodes.These would not ever actually be allowed,
            // but we could provide a good error message instead of bailing out.
            if (!this.isIdentifier()) {
                return nodes.Tristate.False;
            }

            // nodes.If we have something like "(a:", then we must have a
            // type-annotated parameter in an arrow function expression.
            if (this.lexer.read().type === TokenType.colon) {
                return nodes.Tristate.True;
            }

            // nodes.This *could* be a parenthesized arrow function.
            // nodes.Return nodes.Unknown to let the caller know.
            return nodes.Tristate.Unknown;
        }
        else {
            console.assert(first === TokenType.lessThan);

            // nodes.If we have "<" not followed by an identifier,
            // then this definitely is not an arrow function.
            if (!this.isIdentifier()) {
                return nodes.Tristate.False;
            }

            // nodes.JSX overrides
            if (this.sourceFile.languageVariant === nodes.LanguageVariant.JSX) {
                const isArrowFunctionInJsx = this.lookAhead(() => {
                    const third = this.lexer.read().type;
                    if (third === TokenType.extends) {
                        const fourth = this.lexer.read().type;
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
                    return nodes.Tristate.True;
                }

                return nodes.Tristate.False;
            }

            // nodes.This *could* be a parenthesized arrow function.
            return nodes.Tristate.Unknown;
        }
    }

    private parsePossibleParenthesizedArrowFunctionExpressionHead(): nodes.ArrowFunction {
        return this.parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ false);
    }

    private tryParseAsyncSimpleArrowFunctionExpression(): nodes.ArrowFunction {
        // nodes.We do a check here so that we won't be doing unnecessarily call to "this.lookAhead"
        if (this.lexer.peek().type === TokenType.async) {
            const isUnParenthesizedAsyncArrowFunction = this.lookAhead(this.isUnParenthesizedAsyncArrowFunctionWorker);
            if (isUnParenthesizedAsyncArrowFunction === nodes.Tristate.True) {
                const asyncModifier = this.parseModifiersForArrowFunction();
                const expr = this.parseBinaryExpressionOrHigher(/*precedence*/ 0);
                return this.parseSimpleArrowFunctionExpression(<nodes.Identifier>expr, asyncModifier);
            }
        }
        return undefined;
    }

    private isUnParenthesizedAsyncArrowFunctionWorker(): nodes.Tristate {
        // nodes.AsyncArrowFunctionExpression:
        //      1) async[no nodes.LineTerminator here]nodes.AsyncArrowBindingIdentifier[?nodes.Yield][no nodes.LineTerminator here]=>nodes.AsyncConciseBody[?nodes.In]
        //      2) nodes.CoverCallExpressionAndAsyncArrowHead[?nodes.Yield, ?nodes.Await][no nodes.LineTerminator here]=>nodes.AsyncConciseBody[?nodes.In]
        if (this.lexer.peek().type === TokenType.async) {
            this.lexer.read().type;
            // nodes.If the "async" is followed by "=>" this.lexer.peek().type then it is not a begining of an async arrow-function
            // but instead a simple arrow-function which will be parsed inside "this.parseAssignmentExpressionOrHigher"
            if (this.lexer.peek().hasLineBreakBeforeStart || this.lexer.peek().type === TokenType.equalsGreaterThan) {
                return nodes.Tristate.False;
            }
            // nodes.Check for un-parenthesized nodes.AsyncArrowFunction
            const expr = this.parseBinaryExpressionOrHigher(/*precedence*/ 0);
            if (!this.lexer.peek().hasLineBreakBeforeStart && expr.kind === TokenType.Identifier && this.lexer.peek().type === TokenType.equalsGreaterThan) {
                return nodes.Tristate.True;
            }
        }

        return nodes.Tristate.False;
    }

    private parseParenthesizedArrowFunctionExpressionHead(allowAmbiguity: boolean): nodes.ArrowFunction {
        const result = new nodes.ArrowFunction();
        result.modifiers = this.parseModifiersForArrowFunction();
        const isAsync = !!(result.flags & nodes.NodeFlags.Async);

        // nodes.Arrow functions are never generators.
        //
        // nodes.If we're speculatively parsing a signature for a parenthesized arrow function, then
        // we have to have a complete parameter list.  nodes.Otherwise we might see something like
        // a => (b => c)
        // nodes.And think that "(b =>" was actually a parenthesized arrow function with a missing
        // close paren.
        this.parseMethodSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ !allowAmbiguity, result);

        // nodes.If we couldn't get parameters, we definitely could not parse out an arrow function.
        if (!result.parameters) {
            return undefined;
        }

        // nodes.Parsing a signature isn't enough.
        // nodes.Parenthesized arrow signatures often look like other valid expressions.
        // nodes.For instance:
        //  - "(x = 10)" is an assignment expression parsed as a signature with a default parameter value.
        //  - "(x,y)" is a comma expression parsed as a signature with two parameters.
        //  - "a ? (b): c" will have "(b):" parsed as a signature with a return type annotation.
        //
        // nodes.So we need just a bit of lookahead to ensure that it can only be a signature.
        if (!allowAmbiguity && this.lexer.peek().type !== TokenType.equalsGreaterThan && this.lexer.peek().type !== TokenType.openBrace) {
            // nodes.Returning undefined here will cause our caller to rewind to where we started from.
            return undefined;
        }

        return result;
    }

    private parseArrowFunctionExpressionBody(isAsync: boolean): nodes.Block | nodes.Expression {
        if (this.lexer.peek().type === TokenType.openBrace) {
            return this.parseFunctionBlock(/*allowYield*/ false, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);
        }

        if (this.lexer.peek().type !== TokenType.semicolon &&
            this.lexer.peek().type !== TokenType.function &&
            this.lexer.peek().type !== TokenType.class &&
            this.isStartOfStatement() &&
            !this.isStartOfExpressionStatement()) {
            // nodes.Check if we got a plain statement (i.e. no expression-statements, no function/class expressions/declarations)
            //
            // nodes.Here we try to recover from a potential error situation in the case where the
            // user meant to supply a block. nodes.For example, if the user wrote:
            //
            //  a =>
            //      let v = 0;
            //  }
            //
            // they may be missing an open brace.  nodes.Check to see if that's the case so we can
            // try to recover better.  nodes.If we don't do this, then the next close curly we see may end
            // up preemptively closing the containing construct.
            //
            // nodes.Note: even when 'ignoreMissingOpenBrace' is passed as true, parseBody will still error.
            return this.parseFunctionBlock(/*allowYield*/ false, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ true);
        }

        return isAsync
            ? this.doInAwaitContext(this.parseAssignmentExpressionOrHigher)
            : this.doOutsideOfAwaitContext(this.parseAssignmentExpressionOrHigher);
    }

    private parseConditionalExpressionRest(leftOperand: nodes.Expression): nodes.Expression {
        // nodes.Note: we are passed in an expression which was produced from this.parseBinaryExpressionOrHigher.
        const questionToken = this.tryReadTokenToken(TokenType.question);
        if (!questionToken) {
            return leftOperand;
        }

        // nodes.Note: we explicitly 'allowIn' in the whenTrue part of the condition expression, and
        // we do not that for the 'whenFalse' part.
        const result = new nodes.ConditionalExpression();
        result.condition = leftOperand;
        result.questionToken = questionToken;
        result.whenTrue = this.doOutsideOfContext(this.disallowInAndDecoratorContext, this.parseAssignmentExpressionOrHigher);
        result.colonToken = this.readTokenToken(TokenType.colon, /*reportAtCurrentPosition*/ false,
            nodes.Diagnostics._0_expected, tokenToString(TokenType.colon));
        result.whenFalse = this.parseAssignmentExpressionOrHigher();
        return result;
    }

    private parseBinaryExpressionOrHigher(precedence: number): nodes.Expression {
        const leftOperand = this.parseUnaryExpressionOrHigher();
        return this.parseBinaryExpressionRest(precedence, leftOperand);
    }

    private isInOrOfKeyword(t: TokenType) {
        return t === TokenType.in || t === TokenType.of;
    }

    private parseBinaryExpressionRest(precedence: number, leftOperand: nodes.Expression): nodes.Expression {
        while (true) {
            // nodes.We either have a binary operator here, or we're finished.  nodes.We call
            // this.reScanGreaterToken so that we merge this.lexer.peek().type sequences like > and = into >=

            this.reScanGreaterToken();
            const newPrecedence = getBinaryOperatorPrecedence();

            // nodes.Check the precedence to see if we should "take" this operator
            // - nodes.For left associative operator (all operator but **), consume the operator,
            //   recursively call the function below, and parse binaryExpression as a rightOperand
            //   of the caller if the new precedence of the operator is greater then or equal to the current precedence.
            //   nodes.For example:
            //      a - b - c;
            //            ^this.lexer.peek().type; leftOperand = b. nodes.Return b to the caller as a rightOperand
            //      a * b - c
            //            ^this.lexer.peek().type; leftOperand = b. nodes.Return b to the caller as a rightOperand
            //      a - b * c;
            //            ^this.lexer.peek().type; leftOperand = b. nodes.Return b * c to the caller as a rightOperand
            // - nodes.For right associative operator (**), consume the operator, recursively call the function
            //   and parse binaryExpression as a rightOperand of the caller if the new precedence of
            //   the operator is strictly grater than the current precedence
            //   nodes.For example:
            //      a ** b ** c;
            //             ^^this.lexer.peek().type; leftOperand = b. nodes.Return b ** c to the caller as a rightOperand
            //      a - b ** c;
            //            ^^this.lexer.peek().type; leftOperand = b. nodes.Return b ** c to the caller as a rightOperand
            //      a ** b - c
            //             ^this.lexer.peek().type; leftOperand = b. nodes.Return b to the caller as a rightOperand
            const consumeCurrentOperator = this.lexer.peek().type === TokenType.asteriskAsterisk ?
                newPrecedence >= precedence :
                newPrecedence > precedence;

            if (!consumeCurrentOperator) {
                break;
            }

            if (this.lexer.peek().type === TokenType.in && this.inDisallowInContext()) {
                break;
            }

            if (this.lexer.peek().type === TokenType.as) {
                // nodes.Make sure we *do* perform nodes.ASI for constructs like this:
                //    var x = foo
                //    as (nodes.Bar)
                // nodes.This should be parsed as an initialized variable, followed
                // by a function call to 'as' with the argument 'nodes.Bar'
                if (this.lexer.peek().hasLineBreakBeforeStart) {
                    break;
                }
                else {
                    this.lexer.read().type;
                    leftOperand = this.makeAsExpression(leftOperand, this.parseTypeNode());
                }
            }
            else {
                leftOperand = this.makeBinaryExpression(leftOperand, this.parseTokenNode(), this.parseBinaryExpressionOrHigher(newPrecedence));
            }
        }

        return leftOperand;
    }

    private isBinaryOperator() {
        if (this.inDisallowInContext() && this.lexer.peek().type === TokenType.in) {
            return false;
        }

        return getBinaryOperatorPrecedence() > 0;
    }

    private makeBinaryExpression(left: nodes.Expression, operatorToken: nodes.Node, right: nodes.Expression): nodes.BinaryExpression {
        const result = new nodes.BinaryExpression();
        result.left = left;
        result.operatorToken = operatorToken;
        result.right = right;
        return result;
    }

    private makeAsExpression(left: nodes.Expression, right: nodes.TypeNode): nodes.AsExpression {
        const result = new nodes.AsExpression();
        result.expression = left;
        result.type = right;
        return result;
    }

    private parsePrefixUnaryExpression() {
        const result = new nodes.PrefixUnaryExpression();
        result.operator = this.lexer.peek().type;
        this.lexer.read().type;
        result.operand = this.parseSimpleUnaryExpression();

        return result;
    }

    private parseDeleteExpression() {
        const result = new nodes.DeleteExpression();
        this.lexer.read().type;
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    }

    private parseTypeOfExpression() {
        const result = new nodes.TypeOfExpression();
        this.lexer.read().type;
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    }

    private parseVoidExpression() {
        const result = new nodes.VoidExpression();
        this.lexer.read().type;
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    }

    private isAwaitExpression(): boolean {
        if (this.lexer.peek().type === TokenType.await) {
            if (this.inAwaitContext()) {
                return true;
            }

            // here we are using similar heuristics as 'this.isYieldExpression'
            return this.lookAhead(this.nextTokenIsIdentifierOnSameLine);
        }

        return false;
    }

    private parseAwaitExpression() {
        const result = new nodes.AwaitExpression();
        this.lexer.read().type;
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    }

    /**
     * nodes.Parse nodes.ES7 unary expression and await expression
     *
     * nodes.ES7 nodes.UnaryExpression:
     *      1) nodes.SimpleUnaryExpression[?yield]
     *      2) nodes.IncrementExpression[?yield] ** nodes.UnaryExpression[?yield]
     */
    private parseUnaryExpressionOrHigher(): nodes.UnaryExpression | nodes.BinaryExpression {
        if (this.isAwaitExpression()) {
            return this.parseAwaitExpression();
        }

        if (this.isIncrementExpression()) {
            const incrementExpression = this.parseIncrementExpression();
            return this.lexer.peek().type === TokenType.asteriskAsterisk ?
                <nodes.BinaryExpression>this.parseBinaryExpressionRest(getBinaryOperatorPrecedence(), incrementExpression) :
                incrementExpression;
        }

        const unaryOperator = this.lexer.peek().type;
        const simpleUnaryExpression = this.parseSimpleUnaryExpression();
        if (this.lexer.peek().type === TokenType.asteriskAsterisk) {
            const start = skipTrivia(this.sourceText, simpleUnaryExpression.pos);
            if (simpleUnaryExpression.kind === TokenType.TypeAssertionExpression) {
                this.parseErrorAtPosition(start, simpleUnaryExpression.end - start, nodes.Diagnostics.A_type_assertion_expression_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses);
            }
            else {
                this.parseErrorAtPosition(start, simpleUnaryExpression.end - start, nodes.Diagnostics.An_unary_expression_with_the_0_operator_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses, tokenToString(unaryOperator));
            }
        }
        return simpleUnaryExpression;
    }

    /**
     * nodes.Parse nodes.ES7 simple-unary expression or higher:
     *
     * nodes.ES7 nodes.SimpleUnaryExpression:
     *      1) nodes.IncrementExpression[?yield]
     *      2) delete nodes.UnaryExpression[?yield]
     *      3) void nodes.UnaryExpression[?yield]
     *      4) typeof nodes.UnaryExpression[?yield]
     *      5) + nodes.UnaryExpression[?yield]
     *      6) - nodes.UnaryExpression[?yield]
     *      7) ~ nodes.UnaryExpression[?yield]
     *      8) ! nodes.UnaryExpression[?yield]
     */
    private parseSimpleUnaryExpression(): nodes.UnaryExpression {
        switch (this.lexer.peek().type) {
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
                // nodes.This is modified nodes.UnaryExpression grammar in nodes.TypeScript
                //  nodes.UnaryExpression (modified):
                //      < type > nodes.UnaryExpression
                return this.parseTypeAssertion();
            default:
                return this.parseIncrementExpression();
        }
    }

    /**
     * nodes.Check if the current this.lexer.peek().type can possibly be an nodes.ES7 increment expression.
     *
     * nodes.ES7 nodes.IncrementExpression:
     *      nodes.LeftHandSideExpression[?nodes.Yield]
     *      nodes.LeftHandSideExpression[?nodes.Yield][no nodes.LineTerminator here]++
     *      nodes.LeftHandSideExpression[?nodes.Yield][no nodes.LineTerminator here]--
     *      ++nodes.LeftHandSideExpression[?nodes.Yield]
     *      --nodes.LeftHandSideExpression[?nodes.Yield]
     */
    private isIncrementExpression(): boolean {
        // nodes.This function is called inside parseUnaryExpression to decide
        // whether to call this.parseSimpleUnaryExpression or call this.parseIncrementExpression directly
        switch (this.lexer.peek().type) {
            case TokenType.plus:
            case TokenType.minus:
            case TokenType.tilde:
            case TokenType.exclamation:
            case TokenType.delete:
            case TokenType.typeof:
            case TokenType.void:
                return false;
            case TokenType.lessThan:
                // nodes.If we are not in nodes.JSX context, we are parsing nodes.TypeAssertion which is an nodes.UnaryExpression
                if (this.sourceFile.languageVariant !== nodes.LanguageVariant.JSX) {
                    return false;
                }
            // nodes.We are in nodes.JSX context and the this.lexer.peek().type is part of nodes.JSXElement.
            // nodes.Fall through
            default:
                return true;
        }
    }

    /**
     * nodes.Parse nodes.ES7 nodes.IncrementExpression. nodes.IncrementExpression is used instead of nodes.ES6's nodes.PostFixExpression.
     *
     * nodes.ES7 nodes.IncrementExpression[yield]:
     *      1) nodes.LeftHandSideExpression[?yield]
     *      2) nodes.LeftHandSideExpression[?yield] [[no nodes.LineTerminator here]]++
     *      3) nodes.LeftHandSideExpression[?yield] [[no nodes.LineTerminator here]]--
     *      4) ++nodes.LeftHandSideExpression[?yield]
     *      5) --nodes.LeftHandSideExpression[?yield]
     * nodes.In nodes.TypeScript (2), (3) are parsed as nodes.PostfixUnaryExpression. (4), (5) are parsed as nodes.PrefixUnaryExpression
     */
    private parseIncrementExpression(): nodes.IncrementExpression {
        if (this.lexer.peek().type === TokenType.plusPlus || this.lexer.peek().type === TokenType.minusMinus) {
            const result = new nodes.PrefixUnaryExpression();
            result.operator = this.lexer.peek().type;
            this.lexer.read().type;
            result.operand = this.parseLeftHandSideExpressionOrHigher();
            return result;
        }
        else if (this.sourceFile.languageVariant === nodes.LanguageVariant.JSX && this.lexer.peek().type === TokenType.lessThan && this.lookAhead(this.nextTokenIsIdentifierOrKeyword)) {
            // nodes.JSXElement is part of primaryExpression
            return this.parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ true);
        }

        const expression = this.parseLeftHandSideExpressionOrHigher();

        console.assert(isLeftHandSideExpression(expression));
        if ((this.lexer.peek().type === TokenType.plusPlus || this.lexer.peek().type === TokenType.minusMinus) && !this.lexer.peek().hasLineBreakBeforeStart) {
            const result = new nodes.PostfixUnaryExpression();
            result.operand = expression;
            result.operator = this.lexer.peek().type;
            this.lexer.read().type;
            return result;
        }

        return expression;
    }

    private parseLeftHandSideExpressionOrHigher(): nodes.LeftHandSideExpression {
        // nodes.Original nodes.Ecma:
        // nodes.LeftHandSideExpression: nodes.See 11.2
        //      nodes.NewExpression
        //      nodes.CallExpression
        //
        // nodes.Our simplification:
        //
        // nodes.LeftHandSideExpression: nodes.See 11.2
        //      nodes.MemberExpression
        //      nodes.CallExpression
        //
        // nodes.See comment in this.parseMemberExpressionOrHigher on how we replaced nodes.NewExpression with
        // nodes.MemberExpression to make our lives easier.
        //
        // to best understand the below code, it's important to see how nodes.CallExpression expands
        // out into its own productions:
        //
        // nodes.CallExpression:
        //      nodes.MemberExpression nodes.Arguments
        //      nodes.CallExpression nodes.Arguments
        //      nodes.CallExpression[nodes.Expression]
        //      nodes.CallExpression.IdentifierName
        //      super   (   nodes.ArgumentListopt   )
        //      super.IdentifierName
        //
        // nodes.Because of the recursion in these calls, we need to bottom out first.  nodes.There are two
        // bottom out states we can run into.  nodes.Either we see 'super' which must start either of
        // the last two nodes.CallExpression productions.  nodes.Or we have a nodes.MemberExpression which either
        // completes the nodes.LeftHandSideExpression, or starts the beginning of the first four
        // nodes.CallExpression productions.
        const expression = this.lexer.peek().type === TokenType.super
            ? this.parseSuperExpression()
            : this.parseMemberExpressionOrHigher();

        // nodes.Now, we *may* be complete.  nodes.However, we might have consumed the start of a
        // nodes.CallExpression.  nodes.As such, we need to consume the rest of it here to be complete.
        return this.parseCallExpressionRest(expression);
    }

    private parseMemberExpressionOrHigher(): nodes.MemberExpression {
        // nodes.Note: to make our lives simpler, we decompose the the nodes.NewExpression productions and
        // place nodes.ObjectCreationExpression and nodes.FunctionExpression into nodes.PrimaryExpression.
        // like so:
        //
        //   nodes.PrimaryExpression : nodes.See 11.1
        //      this
        //      nodes.Identifier
        //      nodes.Literal
        //      nodes.ArrayLiteral
        //      nodes.ObjectLiteral
        //      (nodes.Expression)
        //      nodes.FunctionExpression
        //      new nodes.MemberExpression nodes.Arguments?
        //
        //   nodes.MemberExpression : nodes.See 11.2
        //      nodes.PrimaryExpression
        //      nodes.MemberExpression[nodes.Expression]
        //      nodes.MemberExpression.IdentifierName
        //
        //   nodes.CallExpression : nodes.See 11.2
        //      nodes.MemberExpression
        //      nodes.CallExpression nodes.Arguments
        //      nodes.CallExpression[nodes.Expression]
        //      nodes.CallExpression.IdentifierName
        //
        // nodes.Technically this is ambiguous.  i.e. nodes.CallExpression defines:
        //
        //   nodes.CallExpression:
        //      nodes.CallExpression nodes.Arguments
        //
        // nodes.If you see: "new nodes.Foo()"
        //
        // nodes.Then that could be treated as a single nodes.ObjectCreationExpression, or it could be
        // treated as the invocation of "new nodes.Foo".  nodes.We disambiguate that in code (to match
        // the original grammar) by making sure that if we see an nodes.ObjectCreationExpression
        // we always consume arguments if they are there. nodes.So we treat "new nodes.Foo()" as an
        // object creation only, and not at all as an invocation)  nodes.Another way to think
        // about this is that for every "new" that we see, we will consume an argument list if
        // it is there as part of the *associated* object creation result.  nodes.Any additional
        // argument lists we see, will become invocation expressions.
        //
        // nodes.Because there are no other places in the grammar now that refer to nodes.FunctionExpression
        // or nodes.ObjectCreationExpression, it is safe to push down into the nodes.PrimaryExpression
        // production.
        //
        // nodes.Because nodes.CallExpression and nodes.MemberExpression are left recursive, we need to bottom out
        // of the recursion immediately.  nodes.So we parse out a primary expression to start with.
        const expression = this.parsePrimaryExpression();
        return this.parseMemberExpressionRest(expression);
    }

    private parseSuperExpression(): nodes.MemberExpression {
        const expression = this.parseTokenNode<nodes.PrimaryExpression>();
        if (this.lexer.peek().type === TokenType.openParen || this.lexer.peek().type === TokenType.dot || this.lexer.peek().type === TokenType.openBracket) {
            return expression;
        }

        // nodes.If we have seen "super" it must be followed by '(' or '.'.
        // nodes.If it wasn't then just try to parse out a '.' and report an error.
        const result = new nodes.PropertyAccessExpression();
        result.expression = expression;
        this.readTokenToken(TokenType.dot, /*reportAtCurrentPosition*/ false, nodes.Diagnostics.super_must_be_followed_by_an_argument_list_or_member_access);
        result.name = this.parseRightSideOfDot(/*allowIdentifierNames*/ true);
        return result;
    }

    private tagNamesAreEquivalent(lhs: nodes.JsxTagNameExpression, rhs: nodes.JsxTagNameExpression): boolean {
        if (lhs.kind !== rhs.kind) {
            return false;
        }

        if (lhs.kind === TokenType.Identifier) {
            return (<nodes.Identifier>lhs).text === (<nodes.Identifier>rhs).text;
        }

        if (lhs.kind === TokenType.this) {
            return true;
        }

        // nodes.If we are at this statement then we must have nodes.PropertyAccessExpression and because tag name in nodes.Jsx element can only
        // take forms of nodes.JsxTagNameExpression which includes an identifier, "this" expression, or another propertyAccessExpression
        // it is safe to case the expression property as such. nodes.See this.parseJsxElementName for how we parse tag name in nodes.Jsx element
        return (<nodes.PropertyAccessExpression>lhs).name.text === (<nodes.PropertyAccessExpression>rhs).name.text &&
            this.tagNamesAreEquivalent((<nodes.PropertyAccessExpression>lhs).expression as nodes.JsxTagNameExpression, (<nodes.PropertyAccessExpression>rhs).expression as nodes.JsxTagNameExpression);
    }


    private parseJsxElementOrSelfClosingElement(inExpressionContext: boolean): nodes.JsxElement | nodes.JsxSelfClosingElement {
        const opening = this.parseJsxOpeningOrSelfClosingElement(inExpressionContext);
        let this.result: nodes.JsxElement | nodes.JsxSelfClosingElement;
        if (opening.kind === TokenType.JsxOpeningElement) {
            const result = new nodes.JsxElement();
            result.openingElement = opening;

            result.children = this.parseJsxChildren(result.openingElement.tagName);
            result.closingElement = this.parseJsxClosingElement(inExpressionContext);

            if (!this.tagNamesAreEquivalent(result.openingElement.tagName, result.closingElement.tagName)) {
                this.parseErrorAtPosition(result.closingElement.pos, result.closingElement.end - result.closingElement.pos, nodes.Diagnostics.Expected_corresponding_JSX_closing_tag_for_0, getTextOfNodeFromSourceText(this.sourceText, result.openingElement.tagName));
            }

            this.result = result;
        }
        else {
            console.assert(opening.kind === TokenType.JsxSelfClosingElement);
            // nodes.Nothing else to do for self-closing elements
            this.result = <nodes.JsxSelfClosingElement>opening;
        }

        // nodes.If the user writes the invalid code '<div></div><div></div>' in an expression context (i.e. not wrapped in
        // an enclosing tag), we'll naively try to parse   ^ this as a 'less than' operator and the remainder of the tag
        // as garbage, which will cause the formatter to badly mangle the nodes.JSX. nodes.Perform a speculative parse of a nodes.JSX
        // element if we see a < this.lexer.peek().type so that we can wrap it in a synthetic binary expression so the formatter
        // does less damage and we can report a better error.
        // nodes.Since nodes.JSX elements are invalid < operands anyway, this lookahead parse will only occur in error scenarios
        // of one sort or another.
        if (inExpressionContext && this.lexer.peek().type === TokenType.lessThan) {
            const invalidElement = this.tryParse(() => this.parseJsxElementOrSelfClosingElement(/*inExpressionContext*/true));
            if (invalidElement) {
                this.parseErrorAtCurrentToken(nodes.Diagnostics.JSX_expressions_must_have_one_parent_element);
                const badNode = new nodes.BinaryExpression();
                badNode.end = invalidElement.end;
                badNode.left = this.result;
                badNode.right = invalidElement;
                badNode.operatorToken = this.createMissingNode(TokenType.comma, /*reportAtCurrentPosition*/ false, /*diagnosticMessage*/ undefined);
                badNode.operatorToken.pos = badNode.operatorToken.end = badNode.right.pos;
                return <nodes.JsxElement><nodes.Node>badNode;
            }
        }

        return this.result;
    }

    private parseJsxText(): nodes.JsxText {
        const result = new nodes.JsxText());
        this.lexer.peek().type = this.lexer.scanJsxToken();
        return result;
    }

    private parseJsxChild(): nodes.JsxChild {
        switch (this.lexer.peek().type) {
            case TokenType.JsxText:
                return this.parseJsxText();
            case TokenType.openBrace:
                return this.parseJsxExpression(/*inExpressionContext*/ false);
            case TokenType.lessThan:
                return this.parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ false);
        }
        nodes.Debug.fail("nodes.Unknown nodes.JSX child kind " + this.lexer.peek().type);
    }

    private parseJsxChildren(openingTagName: nodes.LeftHandSideExpression): nodes.NodeList<nodes.JsxChild> {
        const this.result = <nodes.NodeList<nodes.JsxChild>>[];
        this.result.pos = this.lexer.getStartPos();
        const saveParsingContext = this.parsingContext;
        this.parsingContext |= 1 << nodes.ParsingContext.JsxChildren;

        while (true) {
            this.lexer.peek().type = this.lexer.reScanJsxToken();
            if (this.lexer.peek().type === TokenType.lessThanSlash) {
                // nodes.Closing tag
                break;
            }
            else if (this.lexer.peek().type === TokenType.endOfFile) {
                // nodes.If we hit nodes.EOF, issue the error at the tag that lacks the closing element
                // rather than at the end of the file (which is useless)
                this.parseErrorAtPosition(openingTagName.pos, openingTagName.end - openingTagName.pos, nodes.Diagnostics.JSX_element_0_has_no_corresponding_closing_tag, getTextOfNodeFromSourceText(this.sourceText, openingTagName));
                break;
            }
            this.result.push(this.parseJsxChild());
        }

        this.result.end = this.lexer.getTokenPos();

        this.parsingContext = saveParsingContext;

        return this.result;
    }

    private parseJsxOpeningOrSelfClosingElement(inExpressionContext: boolean): nodes.JsxOpeningElement | nodes.JsxSelfClosingElement {
        const fullStart = this.lexer.getStartPos();

        this.readToken(TokenType.lessThan);

        const tagName = this.parseJsxElementName();

        const attributes = this.parseList(nodes.ParsingContext.JsxAttributes, this.parseJsxAttribute);
        let result: nodes.JsxOpeningLikeElement;

        if (this.lexer.peek().type === TokenType.greaterThan) {
            // nodes.Closing tag, so scan the immediately-following text with the nodes.JSX scanning instead
            // of regular scanning to avoid treating illegal characters (e.g. '#') as immediate
            // scanning errors
            result = new nodes.JsxOpeningElement();
            this.scanJsxText();
        }
        else {
            this.readToken(TokenType.slash);
            if (inExpressionContext) {
                this.readToken(TokenType.greaterThan);
            }
            else {
                this.readToken(TokenType.greaterThan, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
                this.scanJsxText();
            }
            result = new nodes.JsxSelfClosingElement();
        }

        result.tagName = tagName;
        result.attributes = attributes;

        return result;
    }

    private parseJsxElementName(): nodes.JsxTagNameExpression {
        this.scanJsxIdentifier();
        // nodes.JsxElement can have name in the form of
        //      propertyAccessExpression
        //      primaryExpression in the form of an identifier and "this" keyword
        // nodes.We can't just simply use this.parseLeftHandSideExpressionOrHigher because then we will start consider class,function etc as a keyword
        // nodes.We only want to consider "this" as a primaryExpression
        let expression: nodes.JsxTagNameExpression = this.lexer.peek().type === TokenType.this ?
            this.parseTokenNode<nodes.PrimaryExpression>() : this.parseIdentifierName();
        while (this.tryReadToken(TokenType.dot)) {
            const propertyAccess: nodes.PropertyAccessExpression = new nodes.PropertyAccessExpression();
            propertyAccess.expression = expression;
            propertyAccess.name = this.parseRightSideOfDot(/*allowIdentifierNames*/ true);
            expression = this.finishNode(propertyAccess);
        }
        return expression;
    }

    private parseJsxExpression(inExpressionContext: boolean): nodes.JsxExpression {
        const result = new nodes.JsxExpression();

        this.readToken(TokenType.openBrace);
        if (this.lexer.peek().type !== TokenType.closeBrace) {
            result.expression = this.parseAssignmentExpressionOrHigher();
        }
        if (inExpressionContext) {
            this.readToken(TokenType.closeBrace);
        }
        else {
            this.readToken(TokenType.closeBrace, /*message*/ undefined, /*shouldAdvance*/ false);
            this.scanJsxText();
        }

        return result;
    }

    private parseJsxAttribute(): nodes.JsxAttribute | nodes.JsxSpreadAttribute {
        if (this.lexer.peek().type === TokenType.openBrace) {
            return this.parseJsxSpreadAttribute();
        }

        this.scanJsxIdentifier();
        const result = new nodes.JsxAttribute();
        result.name = this.parseIdentifierName();
        if (this.tryReadToken(TokenType.equals)) {
            switch (this.lexer.peek().type) {
                case TokenType.StringLiteral:
                    result.initializer = this.parseLiteralNode();
                    break;
                default:
                    result.initializer = this.parseJsxExpression(/*inExpressionContext*/ true);
                    break;
            }
        }
        return result;
    }

    private parseJsxSpreadAttribute(): nodes.JsxSpreadAttribute {
        const result = new nodes.JsxSpreadAttribute();
        this.readToken(TokenType.openBrace);
        this.readToken(TokenType.dotDotDot);
        result.expression = this.parseExpression();
        this.readToken(TokenType.closeBrace);
        return result;
    }

    private parseJsxClosingElement(inExpressionContext: boolean): nodes.JsxClosingElement {
        const result = new nodes.JsxClosingElement();
        this.readToken(TokenType.lessThanSlash);
        result.tagName = this.parseJsxElementName();
        if (inExpressionContext) {
            this.readToken(TokenType.greaterThan);
        }
        else {
            this.readToken(TokenType.greaterThan, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
            this.scanJsxText();
        }
        return result;
    }

    private parseTypeAssertion(): nodes.TypeAssertion {
        const result = new nodes.TypeAssertion();
        this.readToken(TokenType.lessThan);
        result.type = this.parseTypeNode();
        this.readToken(TokenType.greaterThan);
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    }

    private parseMemberExpressionRest(expression: nodes.LeftHandSideExpression): nodes.MemberExpression {
        while (true) {
            const dotToken = this.tryReadTokenToken(TokenType.dot);
            if (dotToken) {
                const propertyAccess = new nodes.PropertyAccessExpression();
                propertyAccess.expression = expression;
                propertyAccess.name = this.parseRightSideOfDot(/*allowIdentifierNames*/ true);
                expression = this.finishNode(propertyAccess);
                continue;
            }

            if (this.lexer.peek().type === TokenType.exclamation && !this.lexer.peek().hasLineBreakBeforeStart) {
                this.lexer.read().type;
                const nonNullExpression = new nodes.NonNullExpression();
                nonNullExpression.expression = expression;
                expression = this.finishNode(nonNullExpression);
                continue;
            }

            // when in the [nodes.Decorator] context, we do not parse nodes.ElementAccess as it could be part of a nodes.ComputedPropertyName
            if (!this.inDecoratorContext() && this.tryReadToken(TokenType.openBracket)) {
                const indexedAccess = new nodes.ElementAccessExpression();
                indexedAccess.expression = expression;

                // nodes.It's not uncommon for a user to write: "new nodes.Type[]".
                // nodes.Check for that common pattern and report a better error message.
                if (this.lexer.peek().type !== TokenType.closeBracket) {
                    indexedAccess.argumentExpression = this.allowInAnd(this.parseExpression);
                    if (indexedAccess.argumentExpression.kind === TokenType.StringLiteral || indexedAccess.argumentExpression.kind === TokenType.NumericLiteral) {
                        const literal = <nodes.LiteralExpression>indexedAccess.argumentExpression;
                        literal.text = this.internIdentifier(literal.text);
                    }
                }

                this.readToken(TokenType.closeBracket);
                expression = this.finishNode(indexedAccess);
                continue;
            }

            if (this.lexer.peek().type === TokenType.NoSubstitutionTemplateLiteral || this.lexer.peek().type === TokenType.TemplateHead) {
                const tagExpression = new nodes.TaggedTemplateExpression();
                tagExpression.tag = expression;
                tagExpression.template = this.lexer.peek().type === TokenType.NoSubstitutionTemplateLiteral
                    ? this.parseLiteralNode()
                    : this.parseTemplateExpression();
                expression = this.finishNode(tagExpression);
                continue;
            }

            return <nodes.MemberExpression>expression;
        }
    }

    private parseCallExpressionRest(expression: nodes.LeftHandSideExpression): nodes.LeftHandSideExpression {
        while (true) {
            expression = this.parseMemberExpressionRest(expression);
            if (this.lexer.peek().type === TokenType.lessThan) {
                // nodes.See if this is the start of a generic invocation.  nodes.If so, consume it and
                // keep checking for postfix expressions.  nodes.Otherwise, it's just a '<' that's
                // part of an arithmetic expression.  nodes.Break out so we consume it higher in the
                // stack.
                const typeArguments = this.tryParse(this.parseTypeArgumentsInExpression);
                if (!typeArguments) {
                    return expression;
                }

                const callExpr = new nodes.CallExpression();
                callExpr.expression = expression;
                callExpr.typeArguments = typeArguments;
                callExpr.arguments = this.parseArgumentList();
                expression = this.finishNode(callExpr);
                continue;
            }
            else if (this.lexer.peek().type === TokenType.openParen) {
                const callExpr = new nodes.CallExpression();
                callExpr.expression = expression;
                callExpr.arguments = this.parseArgumentList();
                expression = this.finishNode(callExpr);
                continue;
            }

            return expression;
        }
    }

    private parseArgumentList() {
        this.readToken(TokenType.openParen);
        const this.result = this.parseDelimitedList(nodes.ParsingContext.ArgumentExpressions, this.parseArgumentExpression);
        this.readToken(TokenType.closeParen);
        return this.result;
    }

    private parseTypeArgumentsInExpression() {
        if (!this.tryReadToken(TokenType.lessThan)) {
            return undefined;
        }

        const typeArguments = this.parseDelimitedList(nodes.ParsingContext.TypeArguments, this.parseTypeNode);
        if (!this.readToken(TokenType.greaterThan)) {
            // nodes.If it doesn't have the closing >  then it's definitely not an type argument list.
            return undefined;
        }

        // nodes.If we have a '<', then only parse this as a argument list if the type arguments
        // are complete and we have an open paren.  if we don't, rewind and return nothing.
        return typeArguments && this.canFollowTypeArgumentsInExpression()
            ? typeArguments
            : undefined;
    }

    private canFollowTypeArgumentsInExpression(): boolean {
        switch (this.lexer.peek().type) {
            case TokenType.openParen:                 // foo<x>(
            // this case are the only case where this this.lexer.peek().type can legally follow a type argument
            // list.  nodes.So we definitely want to treat this as a type arg list.

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
                // these cases can't legally follow a type arg list.  nodes.However, they're not legal
                // expressions either.  nodes.The user is probably in the middle of a generic type. nodes.So
                // treat it as such.
                return true;

            case TokenType.comma:                     // foo<x>,
            case TokenType.openBrace:                 // foo<x> {
            // nodes.We don't want to treat these as type arguments.  nodes.Otherwise we'll parse this
            // as an invocation expression.  nodes.Instead, we want to parse out the expression
            // in isolation from the type arguments.

            default:
                // nodes.Anything else treat as an expression.
                return false;
        }
    }

    private parsePrimaryExpression(): nodes.PrimaryExpression {
        switch (this.lexer.peek().type) {
            case TokenType.NumericLiteral:
            case TokenType.StringLiteral:
            case TokenType.NoSubstitutionTemplateLiteral:
                return this.parseLiteralNode();
            case TokenType.this:
            case TokenType.super:
            case TokenType.null:
            case TokenType.true:
            case TokenType.false:
                return this.parseTokenNode<nodes.PrimaryExpression>();
            case TokenType.openParen:
                return this.parseParenthesizedExpression();
            case TokenType.openBracket:
                return this.parseArrayLiteralExpression();
            case TokenType.openBrace:
                return this.parseObjectLiteralExpression();
            case TokenType.async:
                // nodes.Async arrow functions are parsed earlier in this.parseAssignmentExpressionOrHigher.
                // nodes.If we encounter `async [no nodes.LineTerminator here] function` then this is an async
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

        return this.parseIdentifier(nodes.Diagnostics.Expression_expected);
    }

    /**
     * 解析一个括号表达式(`(x)`)。
     */
    private parseParenthesizedExpression() {
        console.assert(this.lexer.peek().type === TokenType.openParen);
        const result = new nodes.ParenthesizedExpression();
        result.start = this.lexer.read().start;
        result.body = this.allowInAnd(this.parseExpression);
        result.end = this.readToken(TokenType.closeParen);
        return result;
    }

    private parseSpreadElement(): nodes.Expression {
        const result = new nodes.SpreadElementExpression();
        this.readToken(TokenType.dotDotDot);
        result.expression = this.parseAssignmentExpressionOrHigher();
        return result;
    }

    private parseArgumentOrArrayLiteralElement(): nodes.Expression {
        return this.lexer.peek().type === TokenType.dotDotDot ? this.parseSpreadElement() :
            this.lexer.peek().type === TokenType.comma ? new nodes.Expression() :
                this.parseAssignmentExpressionOrHigher();
    }

    private parseArgumentExpression(): nodes.Expression {
        return this.doOutsideOfContext(this.disallowInAndDecoratorContext, this.parseArgumentOrArrayLiteralElement);
    }

    private parseArrayLiteralExpression(): nodes.ArrayLiteralExpression {
        const result = new nodes.ArrayLiteralExpression();
        this.readToken(TokenType.openBracket);
        if (this.lexer.peek().hasLineBreakBeforeStart) {
            result.multiLine = true;
        }
        result.elements = this.parseDelimitedList(nodes.ParsingContext.ArrayLiteralMembers, this.parseArgumentOrArrayLiteralElement);
        this.readToken(TokenType.closeBracket);
        return result;
    }

    private tryParseAccessorDeclaration(fullStart: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>): nodes.AccessorDeclaration {
        if (this.parseContextualModifier(TokenType.get)) {
            return this.parseJsDocComment(this.parseAccessorDeclaration(TokenType.GetAccessor, fullStart, decorators, modifiers));
        }
        else if (this.parseContextualModifier(TokenType.set)) {
            return this.parseAccessorDeclaration(TokenType.SetAccessor, fullStart, decorators, modifiers);
        }

        return undefined;
    }

    private parseObjectLiteralElement(): nodes.ObjectLiteralElement {
        const fullStart = this.lexer.getStartPos();
        const decorators = this.parseDecorators();
        const modifiers = this.parseModifiers();

        const accessor = this.tryParseAccessorDeclaration(fullStart, decorators, modifiers);
        if (accessor) {
            return accessor;
        }

        const asteriskToken = this.tryReadTokenToken(TokenType.asterisk);
        const tokenIsIdentifier = this.isIdentifier();
        const propertyName = this.parsePropertyName();

        // nodes.Disallowing of optional property assignments happens in the grammar checker.
        const questionToken = this.tryReadTokenToken(TokenType.question);
        if (asteriskToken || this.lexer.peek().type === TokenType.openParen || this.lexer.peek().type === TokenType.lessThan) {
            return this.parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, propertyName, questionToken);
        }

        // check if it is short-hand property assignment or normal property assignment
        // nodes.NOTE: if this.lexer.peek().type is nodes.EqualsToken it is interpreted as nodes.CoverInitializedName production
        // nodes.CoverInitializedName[nodes.Yield] :
        //     nodes.IdentifierReference[?nodes.Yield] nodes.Initializer[nodes.In, ?nodes.Yield]
        // this is necessary because nodes.ObjectLiteral productions are also used to cover grammar for nodes.ObjectAssignmentPattern
        const isShorthandPropertyAssignment =
            tokenIsIdentifier && (this.lexer.peek().type === TokenType.comma || this.lexer.peek().type === TokenType.closeBrace || this.lexer.peek().type === TokenType.equals);

        if (isShorthandPropertyAssignment) {
            const shorthandDeclaration = new nodes.ShorthandPropertyAssignment();
            shorthandDeclaration.name = <nodes.Identifier>propertyName;
            shorthandDeclaration.questionToken = questionToken;
            const equalsToken = this.tryReadTokenToken(TokenType.equals);
            if (equalsToken) {
                shorthandDeclaration.equalsToken = equalsToken;
                shorthandDeclaration.objectAssignmentInitializer = this.allowInAnd(this.parseAssignmentExpressionOrHigher);
            }
            return this.parseJsDocComment(this.finishNode(shorthandDeclaration));
        }
        else {
            const propertyAssignment = new nodes.PropertyAssignment();
            propertyAssignment.modifiers = modifiers;
            propertyAssignment.name = propertyName;
            propertyAssignment.questionToken = questionToken;
            this.readToken(TokenType.colon);
            propertyAssignment.initializer = this.allowInAnd(this.parseAssignmentExpressionOrHigher);
            return this.parseJsDocComment(this.finishNode(propertyAssignment));
        }
    }

    private parseObjectLiteralExpression(): nodes.ObjectLiteralExpression {
        const result = new nodes.ObjectLiteralExpression();
        this.readToken(TokenType.openBrace);
        if (this.lexer.peek().hasLineBreakBeforeStart) {
            result.multiLine = true;
        }

        result.properties = this.parseDelimitedList(nodes.ParsingContext.ObjectLiteralMembers, this.parseObjectLiteralElement, /*considerSemicolonAsDelimiter*/ true);
        this.readToken(TokenType.closeBrace);
        return result;
    }

    private parseFunctionExpression(): nodes.FunctionExpression {
        // nodes.GeneratorExpression:
        //      function* nodes.BindingIdentifier [nodes.Yield][opt](nodes.FormalParameters[nodes.Yield]){ nodes.GeneratorBody }
        //
        // nodes.FunctionExpression:
        //      function nodes.BindingIdentifier[opt](nodes.FormalParameters){ nodes.FunctionBody }
        const saveDecoratorContext = this.inDecoratorContext();
        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ false);
        }

        const result = new nodes.FunctionExpression();
        result.modifiers = this.parseModifiers();
        this.readToken(TokenType.function);
        result.asteriskToken = this.tryReadTokenToken(TokenType.asterisk);

        const isGenerator = !!result.asteriskToken;
        const isAsync = !!(result.flags & nodes.NodeFlags.Async);
        result.name =
            isGenerator && isAsync ? this.doInYieldAndAwaitContext(this.tryReadTokenIdentifier) :
                isGenerator ? this.doInYieldContext(this.tryReadTokenIdentifier) :
                    isAsync ? this.doInAwaitContext(this.tryReadTokenIdentifier) :
                        this.tryReadTokenIdentifier();

        this.parseMethodSignature(TokenType.colon, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, result);
        result.body = this.parseFunctionBlock(/*allowYield*/ isGenerator, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);

        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ true);
        }

        return this.parseJsDocComment(result);
    }

    private tryReadTokenIdentifier() {
        return this.isIdentifier() ? this.parseIdentifier() : undefined;
    }

    /**
     * 解析一个 new 表达式(`new x()`)。
     */
    private parseNewExpression() {
        console.assert(this.lexer.peek().type === TokenType.new);
        const result = new nodes.NewExpression();
        result.start = this.lexer.read().start;
        result.target = this.parseMemberExpressionOrHigher();
        if (this.lexer.peek().type === TokenType.openParen) {
            result.arguments = this.parseArgumentList();
        }
        return result;
    }

    // #endregion

    // #region 解析语句

    /**
     * 解析一个语句。
     */
    private parseStatement() {
        switch (this.lexer.peek().type) {
            case TokenType.identifier:
                return this.parseLabeledOrExpressionStatement(this.parseIdentifier());
            case TokenType.openBrace:
                return this.parseBlockStatement();
            case TokenType.var:
                return this.parseVariableStatement();
            case TokenType.let:
            case TokenType.const:
                if (this.isVariableStatement()) {
                    return this.parseVariableStatement();
                }
                break;
            case TokenType.function:
                return this.parseFunctionDeclaration();
            case TokenType.class:
                return this.parseClassDeclaration();

            case TokenType.if:
                return this.parseIfStatement();
            case TokenType.switch:
                return this.parseSwitchStatement();
            case TokenType.for:
                return this.parseForStatement();
            case TokenType.while:
                return this.parseWhileStatement();
            case TokenType.do:
                return this.parseDoWhileStatement();

            case TokenType.break:
                return this.parseBreakStatement();
            case TokenType.continue:
                return this.parseContinueStatement();
            case TokenType.return:
                return this.parseReturnStatement();
            case TokenType.throw:
                return this.parseThrowStatement();

            case TokenType.try:
                return this.parseTryStatement();

            case TokenType.debugger:
                return this.parseDebuggerStatement();

            case TokenType.semicolon:
                return this.parseEmptyStatement();
            case TokenType.endOfFile:
                return this.parseErrorStatement();
            case TokenType.with:
                return this.parseWithStatement();

            case TokenType.at:
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
                if (this.isDeclarationStart()) {
                    return this.parseDeclaration();
                }
                break;
        }
        if (this.isDeclarationStart()) {
            return this.parseDeclaration();
        }
        return this.parseLabeledOrExpressionStatement(this.parseExpression());
    }

    /**
     * 解析一个语句块(`{...}`)。
     */
    private parseBlockStatement() {
        console.assert(this.lexer.peek().type === TokenType.openBrace);
        const result = new nodes.BlockStatement();
        result.statements = new nodes.NodeList<nodes.Statement>();
        result.statements.start = this.lexer.read().start;
        while (true) {
            switch (this.lexer.peek().type) {
                case TokenType.closeBrace:
                    result.statements.end = this.lexer.read().end;
                    return result;
                case TokenType.endOfFile:
                    result.statements.end = this.expectToken(TokenType.closeBrace);
                    return result;
            }
            result.statements.push(this.parseStatement());
        }
    }

    /**
     * 解析一个变量声明语句(`var x`、`let x`、`const x`)。
     */
    private parseVariableStatement() {
        console.assert(this.lexer.peek().type === TokenType.var || this.lexer.peek().type === TokenType.let || this.lexer.peek().type === TokenType.const);
        const result = new nodes.VariableStatement();
        this.parseJsDocComment(result);
        result.start = this.lexer.read().start;
        result.type = this.lexer.current.type;
        result.variables = new nodes.NodeList<nodes.VariableDeclaration>();
        result.variables.commaTokens = [];
        while (true) {
            result.variables.push(this.parseVariableDeclaration());
            if (this.lexer.peek().type === TokenType.comma) {
                result.variables.commaTokens.push(this.lexer.read().start);
                continue;
            }
            break;
        };
        result.end = this.tryReadSemicolon();
        return result;
    }

    /**
     * 解析一个变量声明(`x = 1`、`[x] = [1]`、`{a: x} = {a: 1}`)。
     */
    private parseVariableDeclaration() {
        const result = new nodes.VariableDeclaration();
        result.name = this.parseBindingName();
        if (this.lexer.peek().type === TokenType.colon) {
            result.colonToken = this.lexer.read().start;
            result.type = this.parseTypeNode();
        }
        if (this.lexer.peek().type === TokenType.equals) {
            result.equalToken = this.lexer.read().start;
            result.initializer = this.parseExpressionWithoutComma();
        } else if (!this.hasSemicolon() && isExpressionStart(this.lexer.peek().type)) {
            result.equalToken = this.expectToken(TokenType.equals);
            result.initializer = this.parseExpressionWithoutComma();
        }
        return result;
    }

    /**
     * 解析一个空语句(`;`)。
     */
    private parseEmptyStatement() {
        console.assert(this.lexer.peek().type === TokenType.semicolon);
        const result = new nodes.EmptyStatement();
        result.start = this.lexer.read().start;
        return result;
    }

    /**
     * 解析一个表达式或标签语句。
     * @param parsed 已解析的表达式。
     */
    private parseLabeledOrExpressionStatement(parsed: nodes.Expression) {
        if (parsed.constructor === nodes.Identifier && this.lexer.peek().type === TokenType.colon) {
            return this.parseLabeledStatement(<nodes.Identifier>parsed);
        }
        return this.parseExpressionStatement(parsed);
    }

    /**
     * 解析一个标签语句(`xx: ...`)。
     * @param label 已解析的标签部分。
     */
    private parseLabeledStatement(label: nodes.Identifier) {
        console.assert(this.lexer.peek().type === TokenType.colon);
        const result = new nodes.LabeledStatement();
        this.parseJsDocComment(result);
        result.label = label;
        result.colonToken = this.lexer.read().type;
        result.body = this.parseStatement();
        return result;
    }

    /**
     * 解析一个表达式语句(`x();`)。
     * @param parsed 已解析的表达式。
     */
    private parseExpressionStatement(parsed: nodes.Expression) {
        const result = new nodes.ExpressionStatement();
        result.body = this.parseExpressionRest(parsed);
        result.end = this.tryReadSemicolon();
        return result;
    }

    /**
     * 解析一个 if 语句(`if(x) ...`)。
     */
    private parseIfStatement() {
        console.assert(this.lexer.peek().type === TokenType.if);
        const result = new nodes.IfStatement();
        result.start = this.lexer.read().start;
        this.parseCondition(result);
        result.then = this.parseEmbeddedStatement();
        if (this.lexer.peek().type === TokenType.else) {
            result.elseToken = this.lexer.read().start;
            result.else = this.parseEmbeddedStatement();
        }
        return result;
    }

    /**
     * 解析一个 switch 语句(`switch(x) {...}`)。
     */
    private parseSwitchStatement() {
        console.assert(this.lexer.peek().type == TokenType.switch);
        const result = new nodes.SwitchStatement();
        result.start = this.lexer.read().start;
        if (!this.options.disallowMissingSwitchCondition || this.lexer.peek().type !== TokenType.openBrace) {
            this.parseCondition(result);
        }
        result.cases = new nodes.NodeList<nodes.CaseClause>();
        result.cases.start = this.readToken(TokenType.openBrace);
        while (true) {
            switch (this.lexer.peek().type) {
                case TokenType.case:
                case TokenType.default:
                    break;
                case TokenType.closeBrace:
                    result.cases.end = this.lexer.read().end;
                    return result;
                default:
                    this.error(this.lexer.peek(), "应输入“case”或“default”。");
                    result.cases.end = this.lexer.current.end;
                    return result;
            }

            const caseCaluse = new nodes.CaseClause();
            caseCaluse.start = this.lexer.read().start;
            if (this.lexer.current.type === TokenType.case) {
                if (!this.options.disallowCaseElse && this.lexer.peek().type === TokenType.else) {
                    caseCaluse.elseToken = this.lexer.read().start;
                } else {
                    caseCaluse.label = this.allowInAnd(this.parseExpression);
                }
            }
            caseCaluse.colonToken = this.readToken(TokenType.colon);
            caseCaluse.statements = new nodes.NodeList<nodes.Statement>();
            while (true) {
                switch (this.lexer.peek().type) {
                    case TokenType.case:
                    case TokenType.default:
                    case TokenType.closeBrace:
                    case TokenType.endOfFile:
                        break;
                    default:
                        caseCaluse.statements.push(this.parseStatement());
                        continue;
                }
                break;
            }
            result.cases.push(caseCaluse);
        }
    }

    /**
     * 解析一个 for 语句(`for(var i = 0; i < 9; i++) ...`)。
     */
    private parseForStatement() {
        console.assert(this.lexer.peek().type == TokenType.for);
        const start = this.lexer.read().start;
        const openParan = this.lexer.peek().type === TokenType.openParen ?
            this.lexer.read().start : undefined;
        if (openParan == undefined && !this.options.disallowMissingParenthese) {
            this.expectToken(TokenType.openParen);
        }

        const disallowIn = this.disallowIn;
        this.disallowIn = true;
        const initializer = this.lexer.peek().type === TokenType.semicolon ? undefined : this.isVariableStatement() ? this.parseVariableStatement() : this.allowInAnd(this.parseExpression);
        this.disallowIn = disallowIn;

        let type = this.lexer.peek().type;
        switch (type) {
            case TokenType.semicolon:
            case TokenType.in:
                break;
            case TokenType.of:
                if (!this.options.disallowForOf) {
                    type = TokenType.semicolon;
                }
                break;
            case TokenType.to:
                if (!this.options.disallowForTo) {
                    type = TokenType.semicolon;
                }
                break;
            default:
                type = TokenType.semicolon;
                break;
        }

        if (type !== TokenType.semicolon) {
            switch (initializer.constructor) {
                case nodes.VariableStatement:
                    if (!this.options.useCompatibleForInAndForOf) {
                        const variables = (<nodes.VariableStatement>initializer).variables;
                        if (type !== TokenType.to && variables[0].initializer) this.error(variables[0].initializer, type === TokenType.in ? "在 for..in 语句变量不能有初始值。" : "在 for..of 语句变量不能有初始值。");
                        if (variables.length > 1) {
                            this.error(variables[1].name, type === TokenType.in ? "在 for..in 语句中只能定义一个变量。" :
                                type === TokenType.of ? "在 for..of 语句中只能定义一个变量。" :
                                    "在 for..to 语句中只能定义一个变量。");
                        }
                    }
                    break;
                case nodes.Identifier:
                    break;
                default:
                    this.error(initializer, type === TokenType.in ? "在 for..in 语句的左边只能是标识符。" :
                        type === TokenType.of ? "在 for..of 语句的左边只能是标识符。" :
                            "在 for..to 语句的左边只能是标识符。");
                    break;
            }
        }

        let result: nodes.ForStatement | nodes.ForInStatement | nodes.ForOfStatement | nodes.ForToStatement;
        switch (type) {
            case TokenType.semicolon:
                result = new nodes.ForStatement();
                (<nodes.ForStatement>result).firstSemicolonToken = this.readToken(TokenType.semicolon);
                if (this.lexer.peek().type !== TokenType.semicolon) {
                    result.condition = this.allowInAnd(this.parseExpression);
                }
                (<nodes.ForStatement>result).secondSemicolonToken = this.readToken(TokenType.semicolon);
                if (openParan != undefined ? this.lexer.peek().type !== TokenType.closeParen : isExpressionStart(this.lexer.peek().type)) {
                    (<nodes.ForStatement>result).iterator = this.allowInAnd(this.parseExpression);
                }
                break;
            case TokenType.in:
                result = new nodes.ForInStatement();
                (<nodes.ForInStatement>result).inToken = this.lexer.read().start;
                result.condition = this.allowInAnd(this.parseExpression);
                break;
            case TokenType.of:
                result = new nodes.ForOfStatement();
                (<nodes.ForOfStatement>result).ofToken = this.lexer.read().start;
                result.condition = this.options.disallowForOfCommaExpression ? this.allowInAnd(this.parseAssignmentExpressionOrHigher) : this.allowInAnd(this.parseExpression);
                break;
            case TokenType.to:
                result = new nodes.ForToStatement();
                (<nodes.ForToStatement>result).toToken = this.lexer.read().start;
                result.condition = this.allowInAnd(this.parseExpression);
                break;
        }

        result.start = start;
        if (initializer) {
            result.initializer = initializer;
        }
        if (openParan != undefined) {
            result.openParanToken = openParan;
            result.closeParanToken = this.readToken(TokenType.closeParen);
        }
        result.body = this.parseEmbeddedStatement();
        return result;
    }

    /**
     * 解析一个 while 语句(`while(x) ...`)。
     */
    private parseWhileStatement() {
        console.assert(this.lexer.peek().type === TokenType.while);
        const result = new nodes.WhileStatement();
        result.start = this.lexer.read().start;
        this.parseCondition(result);
        result.body = this.parseEmbeddedStatement();
        return result;
    }

    /**
     * 解析一个 do..while 语句(`do ... while(x);`)。
     */
    private parseDoWhileStatement() {
        console.assert(this.lexer.peek().type === TokenType.do);
        const result = new nodes.DoWhileStatement();
        result.start = this.lexer.read().type;
        result.body = this.parseEmbeddedStatement();
        result.whileToken = this.readToken(TokenType.while);
        this.parseCondition(result);
        result.end = this.tryReadSemicolon();
        return result;
    }

    /**
     * 解析一个 break 语句(`break xx;`)。
     */
    private parseBreakStatement() {
        console.assert(this.lexer.peek().type === TokenType.break);
        const result = new nodes.BreakStatement();
        result.start = this.lexer.read().start;
        if (this.lexer.peek().type === TokenType.identifier || isReservedWord(this.lexer.peek().type)) {
            result.label = this.parseIdentifier();
        } else if (!this.hasSemicolon()) {
            this.expectToken(TokenType.identifier);
        }
        result.end = this.tryReadSemicolon();
        return result;
    }

    /**
     * 解析一个 continue 语句(`continue xx;`)。
     */
    private parseContinueStatement() {
        console.assert(this.lexer.peek().type === TokenType.continue);
        const result = new nodes.ContinueStatement();
        result.start = this.lexer.read().start;
        if (this.lexer.peek().type === TokenType.identifier || isReservedWord(this.lexer.peek().type)) {
            result.label = this.parseIdentifier();
        } else if (!this.hasSemicolon()) {
            this.expectToken(TokenType.identifier);
        }
        result.end = this.tryReadSemicolon();
        return result;
    }

    /**
     * 解析一个 return 语句(`return x;`)。
     */
    private parseReturnStatement() {
        console.assert(this.lexer.peek().type === TokenType.return);
        const result = new nodes.ReturnStatement();
        result.start = this.lexer.read().start;
        if (this.options.useStandardSemicolonInsertion ? !this.hasSemicolon() : isExpressionStart(this.lexer.peek().type)) {
            result.value = this.allowInAnd(this.parseExpression);
        }
        result.end = this.tryReadSemicolon();
        return result;
    }

    /**
     * 解析一个 throw 语句(`throw x;`)。
     */
    private parseThrowStatement() {
        console.assert(this.lexer.peek().type === TokenType.throw);
        const result = new nodes.ThrowStatement();
        result.start = this.lexer.read().start;
        if (this.options.useStandardSemicolonInsertion ? !this.hasSemicolon() : isExpressionStart(this.lexer.peek().type)) {
            result.value = this.allowInAnd(this.parseExpression);
        } else if (this.options.disallowRethrow) {
            this.error({ start: this.lexer.current.end, end: this.lexer.current.end }, "应输入表达式。");
        }
        result.end = this.tryReadSemicolon();
        return result;
    }

    /**
     * 解析一个 try 语句(`try {...} catch(e) {...}`)。
     */
    private parseTryStatement() {
        console.assert(this.lexer.peek().type == TokenType.try);
        const result = new nodes.TryStatement();
        result.start = this.lexer.read().start;
        result.try = this.parseTryClauseBody();
        if (this.lexer.peek().type === TokenType.catch) {
            result.catch = new nodes.CatchClause();
            result.catch.start = this.lexer.read().start;
            if (this.lexer.peek().type === TokenType.openParen) {
                result.catch.openParanToken = this.lexer.read().start;
                result.catch.variable = this.parseBindingName();
                result.catch.openParanToken = this.readToken(TokenType.closeParen);
            } else if (!this.options.disallowMissingParenthese && this.isBindingName()) {
                result.catch.variable = this.parseBindingName();
            } else if (this.options.disallowMissingCatchVaribale) {
                this.expectToken(TokenType.openParen);
            }
            result.catch.body = this.parseTryClauseBody();
        }
        if (this.lexer.peek().type === TokenType.finally) {
            result.finally = new nodes.FinallyClause();
            result.finally.start = this.lexer.read().start;
            result.finally.body = this.parseTryClauseBody();
        }
        if (this.options.disallowSimpleTryBlock && !result.catch && !result.finally) {
            this.error(this.lexer.peek(), "应输入“catch”或“finally”");
        }
        return result;
    }

    /**
     * 解析一个 try 语句的语句块。
     */
    private parseTryClauseBody() {
        if (!this.options.disallowMissingTryBlock) {
            return this.parseEmbeddedStatement();
        }
        if (this.lexer.peek().type === TokenType.openBrace) {
            return this.parseBlockStatement();
        }
        const result = new nodes.BlockStatement();
        result.statements = new nodes.NodeList<nodes.Statement>();
        result.statements.start = this.expectToken(TokenType.openBrace);
        const statement = this.parseStatement();
        result.statements.push(statement);
        result.statements.end = statement.end;
        return result;
    }

    /**
     * 解析一个 debugger 语句(`debugger;`)。
     */
    private parseDebuggerStatement() {
        console.assert(this.lexer.peek().type === TokenType.debugger);
        const result = new nodes.DebuggerStatement();
        result.start = this.lexer.read().start;
        result.end = this.tryReadSemicolon();
        return result;
    }

    /**
     * 解析一个 with 语句(`with(x) ...`)。
     */
    private parseWithStatement() {
        console.assert(this.lexer.peek().type === TokenType.with);
        const result = new nodes.WithStatement();
        result.start = this.lexer.read().start;
        if (this.lexer.peek().type === TokenType.openParen) {
            result.openParanToken = this.lexer.read().start;
            result.value = !this.options.disallowWithVaribale && this.isVariableStatement() ?
                this.allowInAnd(this.parseVariableStatement) :
                this.allowInAnd(this.parseExpression);
            result.closeParanToken = this.readToken(TokenType.closeParen);
        } else {
            if (this.options.disallowMissingParenthese) {
                this.expectToken(TokenType.openParen);
            }
            result.value = !this.options.disallowWithVaribale && this.isVariableStatement() ?
                this.allowInAnd(this.parseVariableStatement) :
                this.allowInAnd(this.parseExpression);
        }
        result.body = this.parseEmbeddedStatement();
        return result;
    }

    /**
     * 解析一个错误的语句。
     */
    private parseErrorStatement() {
        this.error(this.lexer.peek(), "应输入语句");
        const result = new nodes.EmptyStatement();
        result.start = result.end = this.lexer.peek().start;
        return result;
    }

    /**
     * 判断是否可以自动插入一个分号。
     */
    private hasSemicolon() {
        switch (this.lexer.peek().type) {
            case TokenType.semicolon:
                return true;
            case TokenType.closeBrace:
            case TokenType.endOfFile:
                return !this.options.disallowMissingSemicolon;
            default:
                if (this.options.disallowMissingSemicolon) return false;
                if (this.options.useStandardSemicolonInsertion) return this.lexer.peek().hasLineBreakBeforeStart;
                return true;
        }
    }

    /**
     * 尝试读取或自动插入一个分号。
     * @return 返回分号或自动插入点的结束位置。
     */
    private tryReadSemicolon() {
        if (this.lexer.peek().type === TokenType.semicolon) {
            return this.lexer.read().end;
        }
        if (!this.hasSemicolon()) {
            this.error({ start: this.lexer.current.end, end: this.lexer.current.end }, "语句后缺少“;”。");
        }
        return this.lexer.current.end;
    }

    /**
     * 解析内嵌语句。
     */
    private parseEmbeddedStatement() {
        const result = this.parseStatement();
        if (result.constructor === nodes.VariableStatement && (<nodes.VariableStatement>result).type !== TokenType.var) {
            this.error(result, "变量声明语句应放在语句块中。");
        }
        return result;
    }

    /**
     * 解析条件表达式。
     * @param result 存放结果的语句。
     */
    private parseCondition(result: nodes.IfStatement | nodes.SwitchStatement | nodes.WhileStatement | nodes.DoWhileStatement) {
        if (this.lexer.peek().type === TokenType.openParen) {
            result.openParanToken = this.lexer.read().type;
            result.condition = this.allowInAnd(this.parseExpression);
            result.closeParanToken = this.readToken(TokenType.closeParen);
        } else {
            if (!this.options.disallowMissingParenthese) {
                this.expectToken(TokenType.openParen);
            }
            result.condition = this.allowInAnd(this.parseExpression);
        }
    }

    /**
     * 判断是否紧跟一个变量定义语句。
     */
    private isVariableStatement() {
        switch (this.lexer.peek().type) {
            case TokenType.var:
                return true;
            case TokenType.let:
            case TokenType.const:
                this.lexer.stashSave();
                this.lexer.read();
                const result = this.isBindingName();
                this.lexer.stashRestore();
                return result;
            default:
                return false;
        }
    }

    // #endregion

    // #region 解析声明

    /**
     * 判断是否紧跟定义开始。
     */
    private isDeclarationStart() {
        if (!isDeclarationStart(this.lexer.peek().type)) {
            return false;
        }
        while (true) {
            switch (this.lexer.peek().type) {
                case TokenType.var:
                case TokenType.let:
                case TokenType.const:
                case TokenType.function:
                case TokenType.class:
                case TokenType.enum:
                    return true;

                // 'declare', 'module', 'namespace', 'interface'* and 'type' are all legal nodes.JavaScript this.identifiers;
                // however, an identifier cannot be followed by another identifier on the same line. nodes.This is what we
                // count on to parse out the respective declarations. nodes.For instance, we exploit this to say that
                //
                //    namespace n
                //
                // can be none other than the beginning of a namespace declaration, but need to respect that nodes.JavaScript sees
                //
                //    namespace
                //    n
                //
                // as the identifier 'namespace' on one line followed by the identifier 'n' on another.
                // nodes.We need to look one this.lexer.peek().type ahead to see if it permissible to try parsing a declaration.
                //
                // *nodes.Note*: 'interface' is actually a strict mode reserved word. nodes.So while
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
                    this.lexer.read().type;
                    // nodes.ASI takes effect for this modifier.
                    if (this.lexer.peek().hasLineBreakBeforeStart) {
                        return false;
                    }
                    continue;

                case TokenType.global:
                    this.lexer.read().type;
                    return this.lexer.peek().type === TokenType.openBrace || this.lexer.peek().type === TokenType.Identifier || this.lexer.peek().type === TokenType.export;

                case TokenType.import:
                    this.lexer.read().type;
                    return this.lexer.peek().type === TokenType.StringLiteral || this.lexer.peek().type === TokenType.asterisk ||
                        this.lexer.peek().type === TokenType.openBrace || tokenIsIdentifierOrKeyword(this.lexer.peek().type);
                case TokenType.export:
                    this.lexer.read().type;
                    if (this.lexer.peek().type === TokenType.equals || this.lexer.peek().type === TokenType.asterisk ||
                        this.lexer.peek().type === TokenType.openBrace || this.lexer.peek().type === TokenType.default ||
                        this.lexer.peek().type === TokenType.as) {
                        return true;
                    }
                    continue;

                case TokenType.static:
                    this.lexer.read().type;
                    continue;
                default:
                    return false;
            }
        }
    }

    private parseFunctionBlock(allowYield: boolean, allowAwait: boolean, ignoreMissingOpenBrace: boolean, diagnosticMessage?: nodes.DiagnosticMessage): nodes.Block {
        const savedYieldContext = this.inYieldContext();
        this.setYieldContext(allowYield);

        const savedAwaitContext = this.inAwaitContext();
        this.setAwaitContext(allowAwait);

        // nodes.We may be in a [nodes.Decorator] context when parsing a function expression or
        // arrow function. nodes.The body of the function is not in [nodes.Decorator] context.
        const saveDecoratorContext = this.inDecoratorContext();
        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ false);
        }

        const block = this.parseBlockStatement(ignoreMissingOpenBrace, diagnosticMessage);

        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ true);
        }

        this.setYieldContext(savedYieldContext);
        this.setAwaitContext(savedAwaitContext);

        return block;
    }

    private nextTokenIsIdentifierOrKeywordOnSameLine() {
        this.lexer.read().type;
        return tokenIsIdentifierOrKeyword(this.lexer.peek().type) && !this.lexer.peek().hasLineBreakBeforeStart;
    }

    private nextTokenIsFunctionKeywordOnSameLine() {
        this.lexer.read().type;
        return this.lexer.peek().type === TokenType.function && !this.lexer.peek().hasLineBreakBeforeStart;
    }

    private nextTokenIsIdentifierOrKeywordOrNumberOnSameLine() {
        this.lexer.read().type;
        return (tokenIsIdentifierOrKeyword(this.lexer.peek().type) || this.lexer.peek().type === TokenType.NumericLiteral) && !this.lexer.peek().hasLineBreakBeforeStart;
    }

    private isStartOfDeclaration(): boolean {
        return this.lookAhead(this.isDeclarationStart);
    }

    private isStartOfStatement(): boolean {
        switch (this.lexer.peek().type) {
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
                // nodes.When these don't start a declaration, they're an identifier in an expression statement
                return true;

            case TokenType.public:
            case TokenType.private:
            case TokenType.protected:
            case TokenType.static:
            case TokenType.readonly:
                // nodes.When these don't start a declaration, they may be the start of a class member if an identifier
                // immediately follows. nodes.Otherwise they're an identifier in an expression statement.
                return this.isStartOfDeclaration() || !this.lookAhead(this.nextTokenIsIdentifierOrKeywordOnSameLine);

            default:
                return this.isStartOfExpression();
        }
    }

    private nextTokenIsIdentifierOrStartOfDestructuring() {
        this.lexer.read().type;
        return this.isIdentifier() || this.lexer.peek().type === TokenType.openBrace || this.lexer.peek().type === TokenType.openBracket;
    }

    private isLetDeclaration() {
        // nodes.In nodes.ES6 'let' always starts a lexical declaration if followed by an identifier or {
        // or [.
        return this.lookAhead(this.nextTokenIsIdentifierOrStartOfDestructuring);
    }

    private parseDeclaration(): nodes.Statement {
        const fullStart = this.getNodePos();
        const decorators = this.parseDecorators();
        const modifiers = this.parseModifiers();
        switch (this.lexer.peek().type) {
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
                this.lexer.read().type;
                switch (this.lexer.peek().type) {
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
                    // nodes.We reached this point because we encountered decorators and/or modifiers and assumed a declaration
                    // would follow. nodes.For recovery and error reporting purposes, return an incomplete declaration.
                    const result = <nodes.Statement>this.createMissingNode(TokenType.MissingDeclaration, /*reportAtCurrentPosition*/ true, nodes.Diagnostics.Declaration_expected);
                    result.pos = fullStart;
                    result.decorators = decorators;
                    result.modifiers = modifiers;
                    return result;
                }
        }
    }

    private nextTokenIsIdentifierOrStringLiteralOnSameLine() {
        this.lexer.read().type;
        return !this.lexer.peek().hasLineBreakBeforeStart && (this.isIdentifier() || this.lexer.peek().type === TokenType.StringLiteral);
    }

    private parseFunctionBlockOrSemicolon(isGenerator: boolean, isAsync: boolean, diagnosticMessage?: nodes.DiagnosticMessage): nodes.Block {
        if (this.lexer.peek().type !== TokenType.openBrace && this.canParseSemicolon()) {
            this.tryReadSemicolon();
            return;
        }

        return this.parseFunctionBlock(isGenerator, isAsync, /*ignoreMissingOpenBrace*/ false, diagnosticMessage);
    }

    // nodes.DECLARATIONS

    private parseArrayBindingElement(): nodes.BindingElement {
        if (this.lexer.peek().type === TokenType.comma) {
            return new nodes.BindingElement();
        }
        const result = new nodes.BindingElement();
        result.dotDotDotToken = this.tryReadTokenToken(TokenType.dotDotDot);
        result.name = this.parseBindingName();
        result.initializer = this.parseBindingElementInitializer(/*inParameter*/ false);
        return result;
    }

    private parseObjectBindingElement(): nodes.BindingElement {
        const result = new nodes.BindingElement();
        const tokenIsIdentifier = this.isIdentifier();
        const propertyName = this.parsePropertyName();
        if (tokenIsIdentifier && this.lexer.peek().type !== TokenType.colon) {
            result.name = <nodes.Identifier>propertyName;
        }
        else {
            this.readToken(TokenType.colon);
            result.propertyName = propertyName;
            result.name = this.parseBindingName();
        }
        result.initializer = this.parseBindingElementInitializer(/*inParameter*/ false);
        return result;
    }

    private parseObjectBindingPattern(): nodes.BindingPattern {
        const result = new nodes.BindingPattern();
        this.readToken(TokenType.openBrace);
        result.elements = this.parseDelimitedList(nodes.ParsingContext.ObjectBindingElements, this.parseObjectBindingElement);
        this.readToken(TokenType.closeBrace);
        return result;
    }

    private parseArrayBindingPattern(): nodes.BindingPattern {
        const result = new nodes.BindingPattern();
        this.readToken(TokenType.openBracket);
        result.elements = this.parseDelimitedList(nodes.ParsingContext.ArrayBindingElements, this.parseArrayBindingElement);
        this.readToken(TokenType.closeBracket);
        return result;
    }

    private isIdentifierOrPattern() {
        return this.lexer.peek().type === TokenType.openBrace || this.lexer.peek().type === TokenType.openBracket || this.isIdentifier();
    }

    private parseBindingName(): nodes.Identifier | nodes.BindingPattern {
        if (this.lexer.peek().type === TokenType.openBracket) {
            return this.parseArrayBindingPattern();
        }
        if (this.lexer.peek().type === TokenType.openBrace) {
            return this.parseObjectBindingPattern();
        }
        return this.parseIdentifier();
    }

    private canFollowContextualOfKeyword(): boolean {
        return this.nextTokenIsIdentifier() && this.lexer.read().type === TokenType.closeParen;
    }

    private parseFunctionDeclaration(fullStart: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>): nodes.FunctionDeclaration {
        const result = new nodes.FunctionDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        this.readToken(TokenType.function);
        result.asteriskToken = this.tryReadTokenToken(TokenType.asterisk);
        result.name = result.flags & nodes.NodeFlags.Default ? this.tryReadTokenIdentifier() : this.parseIdentifier();
        const isGenerator = !!result.asteriskToken;
        const isAsync = !!(result.flags & nodes.NodeFlags.Async);
        this.parseMethodSignature(TokenType.colon, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, result);
        result.body = this.parseFunctionBlockOrSemicolon(isGenerator, isAsync, nodes.Diagnostics.or_expected);
        return this.parseJsDocComment(result);
    }

    private parseConstructorDeclaration(pos: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>): nodes.ConstructorDeclaration {
        const result = new nodes.ConstructorDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        this.readToken(TokenType.constructor);
        this.parseMethodSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, result);
        result.body = this.parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false, nodes.Diagnostics.or_expected);
        return this.parseJsDocComment(result);
    }

    /**
     * 解析一个方法声明(`fn() {...}`)。
     */
    private parseMethodDeclaration(decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>, asteriskToken: number, name: nodes.PropertyName, questionToken: number) {
        const result = new nodes.MethodDeclaration();
        this.parseJsDocComment(result);
        result.decorators = decorators;
        result.modifiers = modifiers;
        result.asteriskToken = asteriskToken;
        result.name = name;
        result.questionToken = questionToken;
        this.parseMethodSignature(TokenType.colon, /*yieldContext*/ !!asteriskToken, /*awaitContext*/ !!(result.flags & nodes.NodeFlags.Async), /*requireCompleteParameterList*/ false, result);
        result.body = this.parseFunctionBlockOrSemicolon(isGenerator, isAsync);
        return result;
    }

    /**
     * 解析一个属性声明(`x: 1`)。
     */
    private parsePropertyDeclaration(fullStart: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>, name: nodes.PropertyName, questionToken: nodes.Node): nodes.ClassElement {
        const property = new nodes.PropertyDeclaration();
        property.decorators = decorators;
        property.modifiers = modifiers;
        property.name = name;
        property.questionToken = questionToken;
        property.type = this.parseTypeAnnotation();

        // nodes.For instance properties specifically, since they are evaluated inside the constructor,
        // we do *not * want to parse yield expressions, so we specifically turn the yield context
        // off. nodes.The grammar would look something like this:
        //
        //    nodes.MemberVariableDeclaration[nodes.Yield]:
        //        nodes.AccessibilityModifier_opt   nodes.PropertyName   nodes.TypeAnnotation_opt   nodes.Initializer_opt[nodes.In];
        //        nodes.AccessibilityModifier_opt  static_opt  nodes.PropertyName   nodes.TypeAnnotation_opt   nodes.Initializer_opt[nodes.In, ?nodes.Yield];
        //
        // nodes.The checker may still error in the static case to explicitly disallow the yield expression.
        property.initializer = modifiers && modifiers.flags & nodes.NodeFlags.Static
            ? this.allowInAnd(this.parseNonParameterInitializer)
            : this.doOutsideOfContext(nodes.NodeFlags.YieldContext | nodes.NodeFlags.DisallowInContext, this.parseNonParameterInitializer);

        this.tryReadSemicolon();
        return this.finishNode(property);
    }

    private parsePropertyOrMethodDeclaration(fullStart: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>): nodes.ClassElement {
        const asteriskToken = this.tryReadTokenToken(TokenType.asterisk);
        const name = this.parsePropertyName();

        // nodes.Note: this is not legal as per the grammar.  nodes.But we allow it in the parser and
        // report an error in the grammar checker.
        const questionToken = this.tryReadTokenToken(TokenType.question);
        if (asteriskToken || this.lexer.peek().type === TokenType.openParen || this.lexer.peek().type === TokenType.lessThan) {
            return this.parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, name, questionToken, nodes.Diagnostics.or_expected);
        }
        else {
            return this.parsePropertyDeclaration(fullStart, decorators, modifiers, name, questionToken);
        }
    }

    private parseNonParameterInitializer() {
        return this.parseInitializer(/*inParameter*/ false);
    }

    private parseAccessorDeclaration(kind: TokenType, fullStart: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>): nodes.AccessorDeclaration {
        const result = new nodes.AccessorDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        result.name = this.parsePropertyName();
        this.parseMethodSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, result);
        result.body = this.parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false);
        return result;
    }

    private isClassMemberModifier(idToken: TokenType) {
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

    private isClassMemberStart(): boolean {
        let idToken: TokenType;

        if (this.lexer.peek().type === TokenType.at) {
            return true;
        }

        // nodes.Eat up all modifiers, but hold on to the last one in case it is actually an identifier.
        while (isModifierKind(this.lexer.peek().type)) {
            idToken = this.lexer.peek().type;
            // nodes.If the idToken is a class modifier (protected, private, public, and static), it is
            // certain that we are starting to parse class member. nodes.This allows better error recovery
            // nodes.Example:
            //      public foo() ...     // true
            //      public @dec blah ... // true; we will then report an error later
            //      export public ...    // true; we will then report an error later
            if (this.isClassMemberModifier(idToken)) {
                return true;
            }

            this.lexer.read().type;
        }

        if (this.lexer.peek().type === TokenType.asterisk) {
            return true;
        }

        // nodes.Try to get the first property-like this.lexer.peek().type following all modifiers.
        // nodes.This can either be an identifier or the 'get' or 'set' keywords.
        if (this.isLiteralPropertyName()) {
            idToken = this.lexer.peek().type;
            this.lexer.read().type;
        }

        // nodes.Index signatures and computed properties are class members; we can parse.
        if (this.lexer.peek().type === TokenType.openBracket) {
            return true;
        }

        // nodes.If we were able to get any potential identifier...
        if (idToken !== undefined) {
            // nodes.If we have a non-keyword identifier, or if we have an accessor, then it's safe to parse.
            if (!isKeyword(idToken) || idToken === TokenType.set || idToken === TokenType.get) {
                return true;
            }

            // nodes.If it *is* a keyword, but not an accessor, check a little farther along
            // to see if it should actually be parsed as a class member.
            switch (this.lexer.peek().type) {
                case TokenType.openParen:     // nodes.Method declaration
                case TokenType.lessThan:      // nodes.Generic nodes.Method declaration
                case TokenType.colon:         // nodes.Type nodes.Annotation for declaration
                case TokenType.equals:        // nodes.Initializer for declaration
                case TokenType.question:      // nodes.Not valid, but permitted so that it gets caught later on.
                    return true;
                default:
                    // nodes.Covers
                    //  - nodes.Semicolons     (declaration termination)
                    //  - nodes.Closing braces (end-of-class, must be declaration)
                    //  - nodes.End-of-files   (not valid, but permitted so that it gets caught later on)
                    //  - nodes.Line-breaks    (enabling *automatic semicolon insertion*)
                    return this.canParseSemicolon();
            }
        }

        return false;
    }

    private parseModifiersForArrowFunction(): nodes.NodeList<nodes.Modifier> {
        let flags = 0;
        let modifiers: nodes.NodeList<nodes.Modifier>;
        if (this.lexer.peek().type === TokenType.async) {
            const modifierStart = this.lexer.getStartPos();
            const modifierKind = this.lexer.peek().type;
            this.lexer.read().type;
            modifiers = <nodes.NodeList<nodes.Modifier>>[];
            modifiers.pos = modifierStart;
            flags |= modifierToFlag(modifierKind);
            modifiers.push(this.finishNode(this.createNode(modifierKind, modifierStart)));
            modifiers.flags = flags;
            modifiers.end = this.lexer.getStartPos();
        }

        return modifiers;
    }

    private parseClassElement(): nodes.ClassElement {
        if (this.lexer.peek().type === TokenType.semicolon) {
            const this.result = new nodes.SemicolonClassElement();
            this.lexer.read().type;
            return this.finishNode(this.result);
        }

        const fullStart = this.getNodePos();
        const decorators = this.parseDecorators();
        const modifiers = this.parseModifiers(/*permitInvalidConstAsModifier*/ true);

        const accessor = this.tryParseAccessorDeclaration(fullStart, decorators, modifiers);
        if (accessor) {
            return accessor;
        }

        if (this.lexer.peek().type === TokenType.constructor) {
            return this.parseConstructorDeclaration(fullStart, decorators, modifiers);
        }

        if (this.isIndexSignature()) {
            return this.parseIndexSignatureDeclaration(fullStart, decorators, modifiers);
        }

        // nodes.It is very important that we check this *after* checking indexers because
        // the [ this.lexer.peek().type can start an index signature or a computed property name
        if (tokenIsIdentifierOrKeyword(this.lexer.peek().type) ||
            this.lexer.peek().type === TokenType.StringLiteral ||
            this.lexer.peek().type === TokenType.NumericLiteral ||
            this.lexer.peek().type === TokenType.asterisk ||
            this.lexer.peek().type === TokenType.openBracket) {

            return this.parsePropertyOrMethodDeclaration(fullStart, decorators, modifiers);
        }

        if (decorators || modifiers) {
            // treat this as a property declaration with a missing name.
            const name = <nodes.Identifier>this.createMissingNode(TokenType.Identifier, /*reportAtCurrentPosition*/ true, nodes.Diagnostics.Declaration_expected);
            return this.parsePropertyDeclaration(fullStart, decorators, modifiers, name, /*questionToken*/ undefined);
        }

        // 'this.isClassMemberStart' should have hinted not to attempt parsing.
        nodes.Debug.fail("nodes.Should not have attempted to parse class member declaration.");
    }

    private parseClassExpression(): nodes.ClassExpression {
        return <nodes.ClassExpression>this.parseClassDeclarationOrExpression(
                /*fullStart*/ this.lexer.getStartPos(),
                /*decorators*/ undefined,
                /*modifiers*/ undefined,
            TokenType.ClassExpression);
    }

    private parseClassDeclaration(fullStart: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>): nodes.ClassDeclaration {
        return <nodes.ClassDeclaration>this.parseClassDeclarationOrExpression(fullStart, decorators, modifiers, TokenType.ClassDeclaration);
    }

    private parseClassDeclarationOrExpression(fullStart: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>, kind: TokenType): nodes.ClassLikeDeclaration {
        const result = new nodes.ClassLikeDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        this.readToken(TokenType.class);
        result.name = this.parseNameOfClassDeclarationOrExpression();
        result.typeParameters = this.parseTypeParameterDeclarations();
        result.heritageClauses = this.parseHeritageClauses(/*isClassHeritageClause*/ true);

        if (this.readToken(TokenType.openBrace)) {
            // nodes.ClassTail[nodes.Yield,nodes.Await] : (nodes.Modified) nodes.See 14.5
            //      nodes.ClassHeritage[?nodes.Yield,?nodes.Await]opt { nodes.ClassBody[?nodes.Yield,?nodes.Await]opt }
            result.members = this.parseClassMembers();
            this.readToken(TokenType.closeBrace);
        }
        else {
            result.members = this.createMissingList<nodes.ClassElement>();
        }

        return result;
    }

    private parseNameOfClassDeclarationOrExpression(): nodes.Identifier {
        // implements is a future reserved word so
        // 'class implements' might mean either
        // - class expression with omitted name, 'implements' starts heritage clause
        // - class with name 'implements'
        // 'this.isImplementsClause' helps to disambiguate between these two cases
        return this.isIdentifier() && !this.isImplementsClause()
            ? this.parseIdentifier()
            : undefined;
    }

    private isImplementsClause() {
        return this.lexer.peek().type === TokenType.implements && this.lookAhead(this.nextTokenIsIdentifierOrKeyword);
    }

    private parseHeritageClauses(isClassHeritageClause: boolean): nodes.NodeList<nodes.HeritageClause> {
        // nodes.ClassTail[nodes.Yield,nodes.Await] : (nodes.Modified) nodes.See 14.5
        //      nodes.ClassHeritage[?nodes.Yield,?nodes.Await]opt { nodes.ClassBody[?nodes.Yield,?nodes.Await]opt }

        if (this.isHeritageClause()) {
            return this.parseList(nodes.ParsingContext.HeritageClauses, this.parseHeritageClause);
        }

        return undefined;
    }

    private parseHeritageClause() {
        if (this.lexer.peek().type === TokenType.extends || this.lexer.peek().type === TokenType.implements) {
            const result = new nodes.HeritageClause();
            result.token = this.lexer.peek().type;
            this.lexer.read().type;
            result.types = this.parseDelimitedList(nodes.ParsingContext.HeritageClauseElement, this.parseExpressionWithTypeArguments);
            return result;
        }

        return undefined;
    }

    private parseExpressionWithTypeArguments(): nodes.ExpressionWithTypeArguments {
        const result = new nodes.ExpressionWithTypeArguments();
        result.expression = this.parseLeftHandSideExpressionOrHigher();
        if (this.lexer.peek().type === TokenType.lessThan) {
            result.typeArguments = this.parseBracketedList(nodes.ParsingContext.TypeArguments, this.parseTypeNode, TokenType.lessThan, TokenType.greaterThan);
        }

        return result;
    }

    private isHeritageClause(): boolean {
        return this.lexer.peek().type === TokenType.extends || this.lexer.peek().type === TokenType.implements;
    }

    private parseClassMembers() {
        return this.parseList(nodes.ParsingContext.ClassMembers, this.parseClassElement);
    }

    private parseInterfaceDeclaration(fullStart: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>): nodes.InterfaceDeclaration {
        const result = new nodes.InterfaceDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        this.readToken(TokenType.interface);
        result.name = this.parseIdentifier();
        result.typeParameters = this.parseTypeParameterDeclarations();
        result.heritageClauses = this.parseHeritageClauses(/*isClassHeritageClause*/ false);
        result.members = this.parseObjectTypeMembers();
        return result;
    }

    private parseTypeAliasDeclaration(fullStart: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>): nodes.TypeAliasDeclaration {
        const result = new nodes.TypeAliasDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        this.readToken(TokenType.type);
        result.name = this.parseIdentifier();
        result.typeParameters = this.parseTypeParameterDeclarations();
        this.readToken(TokenType.equals);
        result.type = this.parseTypeNode();
        this.tryReadSemicolon();
        return result;
    }

    // nodes.In an ambient declaration, the grammar only allows integer literals as initializers.
    // nodes.In a non-ambient declaration, the grammar allows uninitialized members only in a
    // nodes.ConstantEnumMemberSection, which starts at the beginning of an this.enum declaration
    // or any time an integer literal initializer is encountered.
    private parseEnumMember(): nodes.EnumMember {
        const result = new nodes.EnumMember());
        result.name = this.parsePropertyName();
        result.initializer = this.allowInAnd(this.parseNonParameterInitializer);
        return result;
    }

    private parseEnumDeclaration(fullStart: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>): nodes.EnumDeclaration {
        const result = new nodes.EnumDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        this.readToken(TokenType.enum);
        result.name = this.parseIdentifier();
        if (this.readToken(TokenType.openBrace)) {
            result.members = this.parseDelimitedList(nodes.ParsingContext.EnumMembers, this.parseEnumMember);
            this.readToken(TokenType.closeBrace);
        }
        else {
            result.members = this.createMissingList<nodes.EnumMember>();
        }
        return result;
    }

    private parseModuleBlock(): nodes.ModuleBlock {
        const result = new nodes.ModuleBlock());
        if (this.readToken(TokenType.openBrace)) {
            result.statements = this.parseList(nodes.ParsingContext.BlockStatements, this.parseStatement);
            this.readToken(TokenType.closeBrace);
        }
        else {
            result.statements = this.createMissingList<nodes.Statement>();
        }
        return result;
    }

    private parseModuleOrNamespaceDeclaration(fullStart: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>, flags: nodes.NodeFlags): nodes.ModuleDeclaration {
        const result = new nodes.ModuleDeclaration();
        // nodes.If we are parsing a dotted namespace name, we want to
        // propagate the 'nodes.Namespace' flag across the names if set.
        const namespaceFlag = flags & nodes.NodeFlags.Namespace;
        result.decorators = decorators;
        result.modifiers = modifiers;
        result.flags |= flags;
        result.name = this.parseIdentifier();
        result.body = this.tryReadToken(TokenType.dot)
            ? this.parseModuleOrNamespaceDeclaration(this.getNodePos(), /*decorators*/ undefined, /*modifiers*/ undefined, nodes.NodeFlags.Export | namespaceFlag)
            : this.parseModuleBlock();
        return result;
    }

    private parseAmbientExternalModuleDeclaration(fullStart: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>): nodes.ModuleDeclaration {
        const result = new nodes.ModuleDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        if (this.lexer.peek().type === TokenType.global) {
            // parse 'global' as name of global scope augmentation
            result.name = this.parseIdentifier();
            result.flags |= nodes.NodeFlags.GlobalAugmentation;
        }
        else {
            result.name = this.parseLiteralNode(/*internName*/ true);
        }

        if (this.lexer.peek().type === TokenType.openBrace) {
            result.body = this.parseModuleBlock();
        }
        else {
            this.tryReadSemicolon();
        }

        return result;
    }

    private parseModuleDeclaration(fullStart: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>): nodes.ModuleDeclaration {
        let flags = modifiers ? modifiers.flags : 0;
        if (this.lexer.peek().type === TokenType.global) {
            // global augmentation
            return this.parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
        }
        else if (this.tryReadToken(TokenType.namespace)) {
            flags |= nodes.NodeFlags.Namespace;
        }
        else {
            this.readToken(TokenType.module);
            if (this.lexer.peek().type === TokenType.StringLiteral) {
                return this.parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
            }
        }
        return this.parseModuleOrNamespaceDeclaration(fullStart, decorators, modifiers, flags);
    }

    private isExternalModuleReference() {
        return this.lexer.peek().type === TokenType.require &&
            this.lookAhead(this.nextTokenIsOpenParen);
    }

    private nextTokenIsOpenParen() {
        return this.lexer.read().type === TokenType.openParen;
    }

    private nextTokenIsSlash() {
        return this.lexer.read().type === TokenType.slash;
    }

    // #endregion

    // #region 解析导入导出

    private parseNamespaceExportDeclaration(fullStart: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>): nodes.NamespaceExportDeclaration {
        const exportDeclaration = new nodes.NamespaceExportDeclaration();
        exportDeclaration.decorators = decorators;
        exportDeclaration.modifiers = modifiers;
        this.readToken(TokenType.as);
        this.readToken(TokenType.namespace);

        exportDeclaration.name = this.parseIdentifier();

        this.readToken(TokenType.semicolon);

        return this.finishNode(exportDeclaration);
    }

    private parseImportDeclarationOrImportEqualsDeclaration(fullStart: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>): nodes.ImportEqualsDeclaration | nodes.ImportDeclaration {
        this.readToken(TokenType.import);
        const afterImportPos = this.lexer.getStartPos();

        let identifier: nodes.Identifier;
        if (this.isIdentifier()) {
            identifier = this.parseIdentifier();
            if (this.lexer.peek().type !== TokenType.comma && this.lexer.peek().type !== TokenType.from) {
                // nodes.ImportEquals declaration of type:
                // import x = require("mod"); or
                // import x = M.x;
                const importEqualsDeclaration = new nodes.ImportEqualsDeclaration();
                importEqualsDeclaration.decorators = decorators;
                importEqualsDeclaration.modifiers = modifiers;
                importEqualsDeclaration.name = identifier;
                this.readToken(TokenType.equals);
                importEqualsDeclaration.moduleReference = this.parseModuleReference();
                this.tryReadSemicolon();
                return this.finishNode(importEqualsDeclaration);
            }
        }

        // nodes.Import statement
        const importDeclaration = new nodes.ImportDeclaration();
        importDeclaration.decorators = decorators;
        importDeclaration.modifiers = modifiers;

        // nodes.ImportDeclaration:
        //  import nodes.ImportClause from nodes.ModuleSpecifier ;
        //  import nodes.ModuleSpecifier;
        if (identifier || // import id
            this.lexer.peek().type === TokenType.asterisk || // import *
            this.lexer.peek().type === TokenType.openBrace) { // import {
            importDeclaration.importClause = this.parseImportClause(identifier, afterImportPos);
            this.readToken(TokenType.from);
        }

        importDeclaration.moduleSpecifier = this.parseModuleSpecifier();
        this.tryReadSemicolon();
        return this.finishNode(importDeclaration);
    }

    private parseImportClause(identifier: nodes.Identifier, fullStart: number) {
        // nodes.ImportClause:
        //  nodes.ImportedDefaultBinding
        //  nodes.NameSpaceImport
        //  nodes.NamedImports
        //  nodes.ImportedDefaultBinding, nodes.NameSpaceImport
        //  nodes.ImportedDefaultBinding, nodes.NamedImports

        const importClause = new nodes.ImportClause();
        if (identifier) {
            // nodes.ImportedDefaultBinding:
            //  nodes.ImportedBinding
            importClause.name = identifier;
        }

        // nodes.If there was no default import or if there is comma this.lexer.peek().type after default import
        // parse namespace or named imports
        if (!importClause.name ||
            this.tryReadToken(TokenType.comma)) {
            importClause.namedBindings = this.lexer.peek().type === TokenType.asterisk ? this.parseNamespaceImport() : this.parseNamedImportsOrExports(TokenType.NamedImports);
        }

        return this.finishNode(importClause);
    }

    private parseModuleReference() {
        return this.isExternalModuleReference()
            ? this.parseExternalModuleReference()
            : this.parseEntityName(/*allowReservedWords*/ false);
    }

    private parseExternalModuleReference() {
        const result = new nodes.ExternalModuleReference();
        this.readToken(TokenType.require);
        this.readToken(TokenType.openParen);
        result.expression = this.parseModuleSpecifier();
        this.readToken(TokenType.closeParen);
        return result;
    }

    private parseModuleSpecifier(): nodes.Expression {
        if (this.lexer.peek().type === TokenType.StringLiteral) {
            const this.result = this.parseLiteralNode();
            this.internIdentifier((<nodes.LiteralExpression>this.result).text);
            return this.result;
        }
        else {
            // nodes.We allow arbitrary expressions here, even though the grammar only allows string
            // literals.  nodes.We check to ensure that it is only a string literal later in the grammar
            // check pass.
            return this.parseExpression();
        }
    }

    private parseNamespaceImport(): nodes.NamespaceImport {
        // nodes.NameSpaceImport:
        //  * as nodes.ImportedBinding
        const namespaceImport = new nodes.NamespaceImport();
        this.readToken(TokenType.asterisk);
        this.readToken(TokenType.as);
        namespaceImport.name = this.parseIdentifier();
        return this.finishNode(namespaceImport);
    }

    private parseNamedImportsOrExports(kind: TokenType): nodes.NamedImportsOrExports {
        const result = new nodes.NamedImports();

        // nodes.NamedImports:
        //  { }
        //  { nodes.ImportsList }
        //  { nodes.ImportsList, }

        // nodes.ImportsList:
        //  nodes.ImportSpecifier
        //  nodes.ImportsList, nodes.ImportSpecifier
        result.elements = this.parseBracketedList(nodes.ParsingContext.ImportOrExportSpecifiers,
            kind === TokenType.NamedImports ? this.parseImportSpecifier : this.parseExportSpecifier,
            TokenType.openBrace, TokenType.closeBrace);
        return result;
    }

    private parseExportSpecifier() {
        return this.parseImportOrExportSpecifier(TokenType.ExportSpecifier);
    }

    private parseImportSpecifier() {
        return this.parseImportOrExportSpecifier(TokenType.ImportSpecifier);
    }

    private parseImportOrExportSpecifier(kind: TokenType): nodes.ImportOrExportSpecifier {
        const result = new nodes.ImportSpecifier();
        // nodes.ImportSpecifier:
        //   nodes.BindingIdentifier
        //   nodes.IdentifierName as nodes.BindingIdentifier
        // nodes.ExportSpecifier:
        //   nodes.IdentifierName
        //   nodes.IdentifierName as nodes.IdentifierName
        let checkIdentifierIsKeyword = isKeyword(this.lexer.peek().type) && !this.isIdentifier();
        let checkIdentifierStart = this.lexer.getTokenPos();
        let checkIdentifierEnd = this.lexer.getTextPos();
        const identifierName = this.parseIdentifierName();
        if (this.lexer.peek().type === TokenType.as) {
            result.propertyName = identifierName;
            this.readToken(TokenType.as);
            checkIdentifierIsKeyword = isKeyword(this.lexer.peek().type) && !this.isIdentifier();
            checkIdentifierStart = this.lexer.getTokenPos();
            checkIdentifierEnd = this.lexer.getTextPos();
            result.name = this.parseIdentifierName();
        }
        else {
            result.name = identifierName;
        }
        if (kind === TokenType.ImportSpecifier && checkIdentifierIsKeyword) {
            // nodes.Report error identifier expected
            this.parseErrorAtPosition(checkIdentifierStart, checkIdentifierEnd - checkIdentifierStart, nodes.Diagnostics.Identifier_expected);
        }
        return result;
    }

    private parseExportDeclaration(fullStart: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>): nodes.ExportDeclaration {
        const result = new nodes.ExportDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        if (this.tryReadToken(TokenType.asterisk)) {
            this.readToken(TokenType.from);
            result.moduleSpecifier = this.parseModuleSpecifier();
        }
        else {
            result.exportClause = this.parseNamedImportsOrExports(TokenType.NamedExports);

            // nodes.It is not uncommon to accidentally omit the 'from' keyword. nodes.Additionally, in editing scenarios,
            // the 'from' keyword can be parsed as a named export when the export clause is unterminated (i.e. `export { from "moduleName";`)
            // nodes.If we don't have a 'from' keyword, see if we have a string literal such that nodes.ASI won't take effect.
            if (this.lexer.peek().type === TokenType.from || (this.lexer.peek().type === TokenType.StringLiteral && !this.lexer.peek().hasLineBreakBeforeStart)) {
                this.readToken(TokenType.from);
                result.moduleSpecifier = this.parseModuleSpecifier();
            }
        }
        this.tryReadSemicolon();
        return result;
    }

    private parseExportAssignment(fullStart: number, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>): nodes.ExportAssignment {
        const result = new nodes.ExportAssignment();
        result.decorators = decorators;
        result.modifiers = modifiers;
        if (this.tryReadToken(TokenType.equals)) {
            result.isExportEquals = true;
        }
        else {
            this.readToken(TokenType.default);
        }
        result.expression = this.parseAssignmentExpressionOrHigher();
        this.tryReadSemicolon();
        return result;
    }

    private processReferenceComments(sourceFile: nodes.SourceFile): void {
        const triviaScanner = createScanner(this.sourceFile.languageVersion, /*skipTrivia*/false, nodes.LanguageVariant.Standard, this.sourceText);
        const referencedFiles: nodes.FileReference[] = [];
        const typeReferenceDirectives: nodes.FileReference[] = [];
        const amdDependencies: { path: string; name: string }[] = [];
        let amdModuleName: string;

        // nodes.Keep scanning all the leading trivia in the file until we get to something that
        // isn't trivia.  nodes.Any single line comment will be analyzed to see if it is a
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

            const comment = this.sourceText.substring(range.pos, range.end);
            const referencePathMatchResult = getFileReferenceFromReferencePath(comment, range);
            if (referencePathMatchResult) {
                const fileReference = referencePathMatchResult.fileReference;
                this.sourceFile.hasNoDefaultLib = referencePathMatchResult.isNoDefaultLib;
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
                    this.parseDiagnostics.push(createFileDiagnostic(this.sourceFile, range.pos, range.end - range.pos, diagnosticMessage));
                }
            }
            else {
                const amdModuleNameRegEx = /^\/\/\/\s*<amd-module\s+name\s*=\s*('|")(.+?)\1/gim;
                const amdModuleNameMatchResult = amdModuleNameRegEx.exec(comment);
                if (amdModuleNameMatchResult) {
                    if (amdModuleName) {
                        this.parseDiagnostics.push(createFileDiagnostic(this.sourceFile, range.pos, range.end - range.pos, nodes.Diagnostics.An_AMD_module_cannot_have_multiple_name_assignments));
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

        this.sourceFile.referencedFiles = referencedFiles;
        this.sourceFile.typeReferenceDirectives = typeReferenceDirectives;
        this.sourceFile.amdDependencies = amdDependencies;
        this.sourceFile.moduleName = amdModuleName;
    }

    private setExternalModuleIndicator(sourceFile: nodes.SourceFile) {
        this.sourceFile.externalModuleIndicator = forEach(this.sourceFile.statements, result =>
            result.flags & nodes.NodeFlags.Export
                || result.kind === TokenType.ImportEqualsDeclaration && (<nodes.ImportEqualsDeclaration>result).moduleReference.kind === TokenType.ExternalModuleReference
                || result.kind === TokenType.ImportDeclaration
                || result.kind === TokenType.ExportAssignment
                || result.kind === TokenType.ExportDeclaration
                ? result
                : undefined);
    }


    // #endregion

    // #region 解析文档注释

    private parseJsDocComment(result) {

    }

    // #endregion

    // #region 未整理

    private disallowInAndDecoratorContext = NodeFlags.DisallowInContext | NodeFlags.DecoratorContext;

    // capture constructors in 'this.initializeState' to avoid null checks
    private NodeConstructor: new (kind: TokenType, pos: number, end: number) => nodes.Node;
    private SourceFileConstructor: new (kind: TokenType, pos: number, end: number) => nodes.Node;

    private sourceFile: nodes.SourceFile;
    private parseDiagnostics: nodes.Diagnostic[];
    private syntaxCursor: nodes.IncrementalParser.SyntaxCursor;

    private token: TokenType;
    private sourceText: string;
    private nodeCount: number;
    private identifiers: nodes.Map<string>;
    private identifierCount: number;

    private parsingContext: nodes.ParsingContext;

    // nodes.Flags that dictate what parsing context we're in.  nodes.For example:
    // nodes.Whether or not we are in strict parsing mode.  nodes.All that changes in strict parsing mode is
    // that some tokens that would be considered this.identifiers may be considered keywords.
    //
    // nodes.When adding more parser context flags, consider which is the more common case that the
    // flag will be in.  nodes.This should be the 'false' state for that flag.  nodes.The reason for this is
    // that we don't store data in our nodes unless the value is in the *non-default* state.  nodes.So,
    // for example, more often than code 'allows-in' (or doesn't 'disallow-in').  nodes.We opt for
    // 'disallow-in' set to 'false'.  nodes.Otherwise, if we had 'allowsIn' set to 'true', then almost
    // all nodes would need extra state on them to store this info.
    //
    // nodes.Note:  'allowIn' and 'allowYield' track 1:1 with the [in] and [yield] concepts in the nodes.ES6
    // grammar specification.
    //
    // nodes.An important thing about these context concepts.  nodes.By default they are effectively inherited
    // while parsing through every grammar production.  i.e. if you don't change them, then when
    // you parse a sub-production, it will have the same context values as the parent production.
    // nodes.This is great most of the time.  nodes.After all, consider all the 'expression' grammar productions
    // and how nearly all of them pass along the 'in' and 'yield' context values:
    //
    // nodes.EqualityExpression[nodes.In, nodes.Yield] :
    //      nodes.RelationalExpression[?nodes.In, ?nodes.Yield]
    //      nodes.EqualityExpression[?nodes.In, ?nodes.Yield] == nodes.RelationalExpression[?nodes.In, ?nodes.Yield]
    //      nodes.EqualityExpression[?nodes.In, ?nodes.Yield] != nodes.RelationalExpression[?nodes.In, ?nodes.Yield]
    //      nodes.EqualityExpression[?nodes.In, ?nodes.Yield] === nodes.RelationalExpression[?nodes.In, ?nodes.Yield]
    //      nodes.EqualityExpression[?nodes.In, ?nodes.Yield] !== nodes.RelationalExpression[?nodes.In, ?nodes.Yield]
    //
    // nodes.Where you have to be careful is then understanding what the points are in the grammar
    // where the values are *not* passed along.  nodes.For example:
    //
    // nodes.SingleNameBinding[nodes.Yield,nodes.GeneratorParameter]
    //      [+nodes.GeneratorParameter]nodes.BindingIdentifier[nodes.Yield] nodes.Initializer[nodes.In]opt
    //      [~nodes.GeneratorParameter]nodes.BindingIdentifier[?nodes.Yield]nodes.Initializer[nodes.In, ?nodes.Yield]opt
    //
    // nodes.Here this is saying that if the nodes.GeneratorParameter context flag is set, that we should
    // explicitly set the 'yield' context flag to false before calling into the nodes.BindingIdentifier
    // and we should explicitly unset the 'yield' context flag before calling into the nodes.Initializer.
    // production.  nodes.Conversely, if the nodes.GeneratorParameter context flag is not set, then we
    // should leave the 'yield' context flag alone.
    //
    // nodes.Getting this all correct is tricky and requires careful reading of the grammar to
    // understand when these values should be changed versus when they should be inherited.
    //
    // nodes.Note: it should not be necessary to save/restore these flags during speculative/lookahead
    // parsing.  nodes.These context flags are naturally stored and restored through normal recursive
    // descent parsing and unwinding.
    private contextFlags: nodes.NodeFlags;

    // nodes.Whether or not we've had a parse error since creating the last nodes.AST result.  nodes.If we have
    // encountered an error, it will be stored on the next nodes.AST result we create.  nodes.Parse errors
    // can be broken down into three categories:
    //
    // 1) nodes.An error that occurred during scanning.  nodes.For example, an unterminated literal, or a
    //    character that was completely not understood.
    //
    // 2) A this.lexer.peek().type was expected, but was not present.  nodes.This type of error is commonly produced
    //    by the 'this.readToken' function.
    //
    // 3) A this.lexer.peek().type was present that no parsing function was able to consume.  nodes.This type of error
    //    only occurs in the 'this.abortParsingListOrMoveToNextToken' function when the parser
    //    decides to skip the this.lexer.peek().type.
    //
    // nodes.In all of these cases, we want to mark the next result as having had an error before it.
    // nodes.With this mark, we can know in incremental settings if this result can be reused, or if
    // we have to reparse it.  nodes.If we don't keep this information around, we may just reuse the
    // result.  in that event we would then not produce the same errors as we did before, causing
    // significant confusion problems.
    //
    // nodes.Note: it is necessary that this value be saved/restored during speculative/lookahead
    // parsing.  nodes.During lookahead parsing, we will often create a result.  nodes.That result will have
    // this value attached, and then this value will be set back to 'false'.  nodes.If we decide to
    // rewind, we must get back to the same value we had prior to the lookahead.
    //
    // nodes.Note: any errors at the end of the file that do not precede a regular result, should get
    // attached to the nodes.EOF this.lexer.peek().type.
    private parseErrorBeforeNextFinishedNode = false;

    private parseSourceFile(fileName: string, _sourceText: string, languageVersion: nodes.ScriptTarget, _syntaxCursor: nodes.IncrementalParser.SyntaxCursor, setParentNodes?: boolean, scriptKind?: nodes.ScriptKind): nodes.SourceFile {
        scriptKind = ensureScriptKind(fileName, scriptKind);

        this.initializeState(fileName, _sourceText, languageVersion, _syntaxCursor, scriptKind);

        const this.result = this.parseSourceFileWorker(fileName, languageVersion, setParentNodes, scriptKind);

        this.clearState();

        return this.result;
    }

    private initializeState(fileName: string, _sourceText: string, languageVersion: nodes.ScriptTarget, _syntaxCursor: nodes.IncrementalParser.SyntaxCursor, scriptKind: nodes.ScriptKind) {
        this.NodeConstructor = objectAllocator.getNodeConstructor();
        this.SourceFileConstructor = objectAllocator.getSourceFileConstructor();

        this.sourceText = _sourceText;
        this.syntaxCursor = _syntaxCursor;

        this.parseDiagnostics = [];
        this.parsingContext = 0;
        this.identifiers = {};
        this.identifierCount = 0;
        this.nodeCount = 0;

        this.contextFlags = scriptKind === nodes.ScriptKind.JS || scriptKind === nodes.ScriptKind.JSX ? nodes.NodeFlags.JavaScriptFile : nodes.NodeFlags.None;
        this.parseErrorBeforeNextFinishedNode = false;

        // nodes.Initialize and prime the this.scanner before parsing the source elements.
        this.lexer.setText(this.sourceText);
        this.lexer.setScriptTarget(languageVersion);
        this.lexer.setLanguageVariant(getLanguageVariant(scriptKind));
    }

    private clearState() {
        // nodes.Clear out the text the this.scanner is pointing at, so it doesn't keep anything alive unnecessarily.
        this.lexer.setText("");

        // nodes.Clear any data.  nodes.We don't want to accidentally hold onto it for too long.
        this.parseDiagnostics = undefined;
        this.sourceFile = undefined;
        this.identifiers = undefined;
        this.syntaxCursor = undefined;
        this.sourceText = undefined;
    }

    private parseSourceFileWorker(fileName: string, languageVersion: nodes.ScriptTarget, setParentNodes: boolean, scriptKind: nodes.ScriptKind): nodes.SourceFile {
        this.sourceFile = this.createSourceFile(fileName, languageVersion, scriptKind);
        this.sourceFile.flags = this.contextFlags;

        // nodes.Prime the this.scanner.
        this.lexer.peek().type = this.lexer.read().type;
        this.processReferenceComments(this.sourceFile);

        this.sourceFile.statements = this.parseList(nodes.ParsingContext.SourceElements, this.parseStatement);
        console.assert(this.lexer.peek().type === TokenType.endOfFile);
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

    private parseJsDocComment<T extends nodes.Node>(result: T): T {
        if (this.contextFlags & nodes.NodeFlags.JavaScriptFile) {
            const comments = getLeadingCommentRangesOfNode(result, this.sourceFile);
            if (comments) {
                for (const comment of comments) {
                    const jsDocComment = nodes.JSDocParser.parseJSDocComment(result, comment.pos, comment.end - comment.pos);
                    if (!jsDocComment) {
                        continue;
                    }

                    if (!result.jsDocComments) {
                        result.jsDocComments = [];
                    }
                    result.jsDocComments.push(jsDocComment);
                }
            }
        }

        return result;
    }

    private fixupParentReferences(rootNode: nodes.Node) {
        // normally parent references are set during binding. nodes.However, for clients that only need
        // a syntax tree, and no semantic features, then the binding process is an unnecessary
        // overhead.  nodes.This functions allows us to set all the parents, without all the expense of
        // binding.

        let parent: nodes.Node = rootNode;
        forEachChild(rootNode, visitNode);
        return;

        function visitNode(n: nodes.Node): void {
            // walk down setting parents that differ from the parent we think it should be.  nodes.This
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

    private createSourceFile(fileName: string, languageVersion: nodes.ScriptTarget, scriptKind: nodes.ScriptKind): nodes.SourceFile {
        // code from this.createNode is inlined here so this.createNode won't have to deal with special case of creating source files
        // this is quite rare comparing to other nodes and this.createNode should be as fast as possible
        const this.sourceFile = <nodes.SourceFile>new this.SourceFileConstructor(TokenType.SourceFile, /*pos*/ 0, /* end */ this.sourceText.length);
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

    private setContextFlag(val: boolean, flag: nodes.NodeFlags) {
        if (val) {
            this.contextFlags |= flag;
        }
        else {
            this.contextFlags &= ~flag;
        }
    }

    private setDisallowInContext(val: boolean) {
        this.setContextFlag(val, nodes.NodeFlags.DisallowInContext);
    }

    private setYieldContext(val: boolean) {
        this.setContextFlag(val, nodes.NodeFlags.YieldContext);
    }

    private setDecoratorContext(val: boolean) {
        this.setContextFlag(val, nodes.NodeFlags.DecoratorContext);
    }

    private setAwaitContext(val: boolean) {
        this.setContextFlag(val, nodes.NodeFlags.AwaitContext);
    }

    private doOutsideOfContext<T>(context: nodes.NodeFlags, func: () => T): T {
        // contextFlagsToClear will contain only the context flags that are
        // currently set that we need to temporarily clear
        // nodes.We don't just blindly reset to the previous flags to ensure
        // that we do not mutate cached flags for the incremental
        // parser (nodes.ThisNodeHasError, nodes.ThisNodeOrAnySubNodesHasError, and
        // nodes.HasAggregatedChildData).
        const contextFlagsToClear = context & this.contextFlags;
        if (contextFlagsToClear) {
            // clear the requested context flags
            this.setContextFlag(/*val*/ false, contextFlagsToClear);
            const this.result = func();
            // restore the context flags we just cleared
            this.setContextFlag(/*val*/ true, contextFlagsToClear);
            return this.result;
        }

        // no need to do anything special as we are not in any of the requested contexts
        return func();
    }

    private doInsideOfContext<T>(context: nodes.NodeFlags, func: () => T): T {
        // contextFlagsToSet will contain only the context flags that
        // are not currently set that we need to temporarily enable.
        // nodes.We don't just blindly reset to the previous flags to ensure
        // that we do not mutate cached flags for the incremental
        // parser (nodes.ThisNodeHasError, nodes.ThisNodeOrAnySubNodesHasError, and
        // nodes.HasAggregatedChildData).
        const contextFlagsToSet = context & ~this.contextFlags;
        if (contextFlagsToSet) {
            // set the requested context flags
            this.setContextFlag(/*val*/ true, contextFlagsToSet);
            const this.result = func();
            // reset the context flags we just set
            this.setContextFlag(/*val*/ false, contextFlagsToSet);
            return this.result;
        }

        // no need to do anything special as we are already in all of the requested contexts
        return func();
    }

    private allowInAnd<T>(func: () => T): T {
        return this.doOutsideOfContext(nodes.NodeFlags.DisallowInContext, func);
    }

    private disallowInAnd<T>(func: () => T): T {
        return this.doInsideOfContext(nodes.NodeFlags.DisallowInContext, func);
    }

    private doInYieldContext<T>(func: () => T): T {
        return this.doInsideOfContext(nodes.NodeFlags.YieldContext, func);
    }

    private doInDecoratorContext<T>(func: () => T): T {
        return this.doInsideOfContext(nodes.NodeFlags.DecoratorContext, func);
    }

    private doInAwaitContext<T>(func: () => T): T {
        return this.doInsideOfContext(nodes.NodeFlags.AwaitContext, func);
    }

    private doOutsideOfAwaitContext<T>(func: () => T): T {
        return this.doOutsideOfContext(nodes.NodeFlags.AwaitContext, func);
    }

    private doInYieldAndAwaitContext<T>(func: () => T): T {
        return this.doInsideOfContext(nodes.NodeFlags.YieldContext | nodes.NodeFlags.AwaitContext, func);
    }

    private inContext(flags: nodes.NodeFlags) {
        return (this.contextFlags & flags) !== 0;
    }

    private inYieldContext() {
        return this.inContext(nodes.NodeFlags.YieldContext);
    }

    private inDisallowInContext() {
        return this.inContext(nodes.NodeFlags.DisallowInContext);
    }

    private inDecoratorContext() {
        return this.inContext(nodes.NodeFlags.DecoratorContext);
    }

    private inAwaitContext() {
        return this.inContext(nodes.NodeFlags.AwaitContext);
    }

    private parseErrorAtCurrentToken(message: nodes.DiagnosticMessage, arg0?: any): void {
        const start = this.lexer.getTokenPos();
        const length = this.lexer.getTextPos() - start;

        this.parseErrorAtPosition(start, length, message, arg0);
    }

    private parseErrorAtPosition(start: number, length: number, message: nodes.DiagnosticMessage, arg0?: any): void {
        // nodes.Don't report another error if it would just be at the same position as the last error.
        const lastError = lastOrUndefined(this.parseDiagnostics);
        if (!lastError || start !== lastError.start) {
            this.parseDiagnostics.push(createFileDiagnostic(this.sourceFile, start, length, message, arg0));
        }

        // nodes.Mark that we've encountered an error.  nodes.We'll set an appropriate bit on the next
        // result we finish so that it can't be reused incrementally.
        this.parseErrorBeforeNextFinishedNode = true;
    }

    private scanError(message: nodes.DiagnosticMessage, length?: number) {
        const pos = this.lexer.getTextPos();
        this.parseErrorAtPosition(pos, length || 0, message);
    }

    private getNodePos(): number {
        return this.lexer.getStartPos();
    }

    private getNodeEnd(): number {
        return this.lexer.getStartPos();
    }

    private reScanGreaterToken(): TokenType {
        return this.lexer.peek().type = this.lexer.reScanGreaterToken();
    }

    private reScanSlashToken(): TokenType {
        return this.lexer.peek().type = this.lexer.reScanSlashToken();
    }

    private reScanTemplateToken(): TokenType {
        return this.lexer.peek().type = this.lexer.reScanTemplateToken();
    }

    private scanJsxIdentifier(): TokenType {
        return this.lexer.peek().type = this.lexer.scanJsxIdentifier();
    }

    private scanJsxText(): TokenType {
        return this.lexer.peek().type = this.lexer.scanJsxToken();
    }

    private speculationHelper<T>(callback: () => T, isLookAhead: boolean): T {
        // nodes.Keep track of the state we'll need to rollback to if lookahead fails (or if the
        // caller asked us to always reset our state).
        const saveToken = this.lexer.peek().type;
        const saveParseDiagnosticsLength = this.parseDiagnostics.length;
        const saveParseErrorBeforeNextFinishedNode = this.parseErrorBeforeNextFinishedNode;

        // nodes.Note: it is not actually necessary to save/restore the context flags here.  nodes.That's
        // because the saving/restoring of these flags happens naturally through the recursive
        // descent nature of our parser.  nodes.However, we still store this here just so we can
        // assert that that invariant holds.
        const saveContextFlags = this.contextFlags;

        // nodes.If we're only looking ahead, then tell the this.scanner to only lookahead as well.
        // nodes.Otherwise, if we're actually speculatively parsing, then tell the this.scanner to do the
        // same.
        const this.result = isLookAhead
            ? this.lexer.lookAhead(callback)
            : this.lexer.tryScan(callback);

        console.assert(saveContextFlags === this.contextFlags);

        // nodes.If our callback returned something 'falsy' or we're just looking ahead,
        // then unconditionally restore us to where we were.
        if (!this.result || isLookAhead) {
            this.lexer.peek().type = saveToken;
            this.parseDiagnostics.length = saveParseDiagnosticsLength;
            this.parseErrorBeforeNextFinishedNode = saveParseErrorBeforeNextFinishedNode;
        }

        return this.result;
    }

    /** nodes.Invokes the provided callback then unconditionally restores the parser to the state it
     * was in immediately prior to invoking the callback.  nodes.The this.result of invoking the callback
     * is returned from this function.
     */
    private lookAhead<T>(callback: () => T): T {
        return this.speculationHelper(callback, /*isLookAhead*/ true);
    }

    private tryReadTokenToken(t: TokenType): nodes.Node {
        if (this.lexer.peek().type === t) {
            return this.parseTokenNode();
        }
        return undefined;
    }

    private readTokenToken(t: TokenType, reportAtCurrentPosition: boolean, diagnosticMessage: nodes.DiagnosticMessage, arg0?: any): nodes.Node {
        return this.tryReadTokenToken(t) ||
            this.createMissingNode(t, reportAtCurrentPosition, diagnosticMessage, arg0);
    }

    private parseTokenNode<T extends nodes.Node>(): T {
        const result = new T();
        this.lexer.read().type;
        return result;
    }

    private canParseSemicolon() {
        // nodes.If there's a real semicolon, then we can always parse it out.
        if (this.lexer.peek().type === TokenType.semicolon) {
            return true;
        }

        // nodes.We can parse out an optional semicolon in nodes.ASI cases in the following cases.
        return this.lexer.peek().type === TokenType.closeBrace || this.lexer.peek().type === TokenType.endOfFile || this.lexer.peek().hasLineBreakBeforeStart;
    }

    private parseSemicolon(): boolean {
        if (this.canParseSemicolon()) {
            if (this.lexer.peek().type === TokenType.semicolon) {
                // consume the semicolon if it was explicitly provided.
                this.lexer.read().type;
            }

            return true;
        }
        else {
            return this.readToken(TokenType.semicolon);
        }
    }

    private finishNode<T extends nodes.Node>(result: T, end?: number): T {
        result.end = end === undefined ? this.lexer.getStartPos() : end;

        if (this.contextFlags) {
            result.flags |= this.contextFlags;
        }

        // nodes.Keep track on the result if we encountered an error while parsing it.  nodes.If we did, then
        // we cannot reuse the result incrementally.  nodes.Once we've marked this result, clear out the
        // flag so that we don't mark any subsequent nodes.
        if (this.parseErrorBeforeNextFinishedNode) {
            this.parseErrorBeforeNextFinishedNode = false;
            result.flags |= nodes.NodeFlags.ThisNodeHasError;
        }

        return result;
    }

    private createMissingNode(kind: TokenType, reportAtCurrentPosition: boolean, diagnosticMessage: nodes.DiagnosticMessage, arg0?: any): nodes.Node {
        if (reportAtCurrentPosition) {
            this.parseErrorAtPosition(this.lexer.getStartPos(), 0, diagnosticMessage, arg0);
        }
        else {
            this.parseErrorAtCurrentToken(diagnosticMessage, arg0);
        }

        const this.result = this.createNode(kind, this.lexer.getStartPos());
        (<nodes.Identifier>this.result).text = "";
        return this.finishNode(this.result);
    }

    private internIdentifier(text: string): string {
        text = escapeIdentifier(text);
        return hasProperty(this.identifiers, text) ? this.identifiers[text] : (this.identifiers[text] = text);
    }

    // nodes.An identifier that starts with two underscores has an extra underscore character prepended to it to avoid issues
    // with magic property names like '__proto__'. nodes.The 'this.identifiers' object is used to share a single string instance for
    // each identifier in order to reduce memory consumption.
    private createIdentifier(isIdentifier: boolean, diagnosticMessage?: nodes.DiagnosticMessage): nodes.Identifier {
        this.identifierCount++;
        if (this.isIdentifier) {
            const result = new nodes.Identifier();

            // nodes.Store original this.lexer.peek().type kind if it is not just an nodes.Identifier so we can report appropriate error later in type checker
            if (this.lexer.peek().type !== TokenType.Identifier) {
                result.originalKeywordKind = this.lexer.peek().type;
            }
            result.text = this.internIdentifier(this.lexer.getTokenValue());
            this.lexer.read().type;
            return result;
        }

        return <nodes.Identifier>this.createMissingNode(TokenType.Identifier, /*reportAtCurrentPosition*/ false, diagnosticMessage || nodes.Diagnostics.Identifier_expected);
    }

    private parseIdentifier(diagnosticMessage?: nodes.DiagnosticMessage): nodes.Identifier {
        return this.createIdentifier(this.isIdentifier(), diagnosticMessage);
    }

    private parseIdentifierName(): nodes.Identifier {
        return this.createIdentifier(tokenIsIdentifierOrKeyword(this.lexer.peek().type));
    }

    private isLiteralPropertyName(): boolean {
        return tokenIsIdentifierOrKeyword(this.lexer.peek().type) ||
            this.lexer.peek().type === TokenType.StringLiteral ||
            this.lexer.peek().type === TokenType.NumericLiteral;
    }

    private parsePropertyNameWorker(allowComputedPropertyNames: boolean): nodes.PropertyName {
        if (this.lexer.peek().type === TokenType.StringLiteral || this.lexer.peek().type === TokenType.NumericLiteral) {
            return this.parseLiteralNode(/*internName*/ true);
        }
        if (allowComputedPropertyNames && this.lexer.peek().type === TokenType.openBracket) {
            return this.parseComputedPropertyName();
        }
        return this.parseIdentifierName();
    }

    private parsePropertyName(): nodes.PropertyName {
        return this.parsePropertyNameWorker(/*allowComputedPropertyNames*/ true);
    }

    private parseSimplePropertyName(): nodes.Identifier | nodes.LiteralExpression {
        return <nodes.Identifier | nodes.LiteralExpression>this.parsePropertyNameWorker(/*allowComputedPropertyNames*/ false);
    }

    private isSimplePropertyName() {
        return this.lexer.peek().type === TokenType.StringLiteral || this.lexer.peek().type === TokenType.NumericLiteral || tokenIsIdentifierOrKeyword(this.lexer.peek().type);
    }

    private parseComputedPropertyName(): nodes.ComputedPropertyName {
        // nodes.PropertyName [nodes.Yield]:
        //      nodes.LiteralPropertyName
        //      nodes.ComputedPropertyName[?nodes.Yield]
        const result = new nodes.ComputedPropertyName();
        this.readToken(TokenType.openBracket);

        // nodes.We parse any expression (including a comma expression). nodes.But the grammar
        // says that only an assignment expression is allowed, so the grammar checker
        // will error if it sees a comma expression.
        result.expression = this.allowInAnd(this.parseExpression);

        this.readToken(TokenType.closeBracket);
        return result;
    }

    private parseContextualModifier(t: TokenType): boolean {
        return this.lexer.peek().type === t && this.tryParse(this.nextTokenCanFollowModifier);
    }

    private nextTokenIsOnSameLineAndCanFollowModifier() {
        this.lexer.read().type;
        if (this.lexer.peek().hasLineBreakBeforeStart) {
            return false;
        }
        return this.canFollowModifier();
    }

    private nextTokenCanFollowModifier() {
        if (this.lexer.peek().type === TokenType.const) {
            // 'const' is only a modifier if followed by 'this.enum'.
            return this.lexer.read().type === TokenType.enum;
        }
        if (this.lexer.peek().type === TokenType.export) {
            this.lexer.read().type;
            if (this.lexer.peek().type === TokenType.default) {
                return this.lookAhead(this.nextTokenIsClassOrFunctionOrAsync);
            }
            return this.lexer.peek().type !== TokenType.asterisk && this.lexer.peek().type !== TokenType.as && this.lexer.peek().type !== TokenType.openBrace && this.canFollowModifier();
        }
        if (this.lexer.peek().type === TokenType.default) {
            return this.nextTokenIsClassOrFunctionOrAsync();
        }
        if (this.lexer.peek().type === TokenType.static) {
            this.lexer.read().type;
            return this.canFollowModifier();
        }

        return this.nextTokenIsOnSameLineAndCanFollowModifier();
    }

    private parseAnyContextualModifier(): boolean {
        return isModifierKind(this.lexer.peek().type) && this.tryParse(this.nextTokenCanFollowModifier);
    }

    private canFollowModifier(): boolean {
        return this.lexer.peek().type === TokenType.openBracket
            || this.lexer.peek().type === TokenType.openBrace
            || this.lexer.peek().type === TokenType.asterisk
            || this.lexer.peek().type === TokenType.dotDotDot
            || this.isLiteralPropertyName();
    }

    private nextTokenIsClassOrFunctionOrAsync(): boolean {
        this.lexer.read().type;
        return this.lexer.peek().type === TokenType.class || this.lexer.peek().type === TokenType.function ||
            (this.lexer.peek().type === TokenType.async && this.lookAhead(this.nextTokenIsFunctionKeywordOnSameLine));
    }

    // nodes.True if positioned at the start of a list element
    private isListElement(parsingContext: nodes.ParsingContext, inErrorRecovery: boolean): boolean {
        const result = this.currentNode(this.parsingContext);
        if (result) {
            return true;
        }

        switch (this.parsingContext) {
            case nodes.ParsingContext.SourceElements:
            case nodes.ParsingContext.BlockStatements:
            case nodes.ParsingContext.SwitchClauseStatements:
                // nodes.If we're in error recovery, then we don't want to treat ';' as an empty statement.
                // nodes.The problem is that ';' can show up in far too many contexts, and if we see one
                // and assume it's a statement, then we may bail out inappropriately from whatever
                // we're parsing.  nodes.For example, if we have a semicolon in the middle of a class, then
                // we really don't want to assume the class is over and we're on a statement in the
                // outer module.  nodes.We just want to consume and move on.
                return !(this.lexer.peek().type === TokenType.semicolon && inErrorRecovery) && this.isStartOfStatement();
            case nodes.ParsingContext.SwitchClauses:
                return this.lexer.peek().type === TokenType.case || this.lexer.peek().type === TokenType.default;
            case nodes.ParsingContext.TypeMembers:
                return this.lookAhead(this.isTypeMemberStart);
            case nodes.ParsingContext.ClassMembers:
                // nodes.We allow semicolons as class elements (as specified by nodes.ES6) as long as we're
                // not in error recovery.  nodes.If we're in error recovery, we don't want an errant
                // semicolon to be treated as a class member (since they're almost always used
                // for statements.
                return this.lookAhead(this.isClassMemberStart) || (this.lexer.peek().type === TokenType.semicolon && !inErrorRecovery);
            case nodes.ParsingContext.EnumMembers:
                // nodes.Include open bracket computed properties. nodes.This technically also lets in indexers,
                // which would be a candidate for improved error reporting.
                return this.lexer.peek().type === TokenType.openBracket || this.isLiteralPropertyName();
            case nodes.ParsingContext.ObjectLiteralMembers:
                return this.lexer.peek().type === TokenType.openBracket || this.lexer.peek().type === TokenType.asterisk || this.isLiteralPropertyName();
            case nodes.ParsingContext.ObjectBindingElements:
                return this.lexer.peek().type === TokenType.openBracket || this.isLiteralPropertyName();
            case nodes.ParsingContext.HeritageClauseElement:
                // nodes.If we see { } then only consume it as an expression if it is followed by , or {
                // nodes.That way we won't consume the body of a class in its heritage clause.
                if (this.lexer.peek().type === TokenType.openBrace) {
                    return this.lookAhead(this.isValidHeritageClauseObjectLiteral);
                }

                if (!inErrorRecovery) {
                    return this.isStartOfLeftHandSideExpression() && !this.isHeritageClauseExtendsOrImplementsKeyword();
                }
                else {
                    // nodes.If we're in error recovery we tighten up what we're willing to match.
                    // nodes.That way we don't treat something like "this" as a valid heritage clause
                    // element during recovery.
                    return this.isIdentifier() && !this.isHeritageClauseExtendsOrImplementsKeyword();
                }
            case nodes.ParsingContext.VariableDeclarations:
                return this.isIdentifierOrPattern();
            case nodes.ParsingContext.ArrayBindingElements:
                return this.lexer.peek().type === TokenType.comma || this.lexer.peek().type === TokenType.dotDotDot || this.isIdentifierOrPattern();
            case nodes.ParsingContext.TypeParameters:
                return this.isIdentifier();
            case nodes.ParsingContext.ArgumentExpressions:
            case nodes.ParsingContext.ArrayLiteralMembers:
                return this.lexer.peek().type === TokenType.comma || this.lexer.peek().type === TokenType.dotDotDot || this.isStartOfExpression();
            case nodes.ParsingContext.Parameters:
                return this.isStartOfParameter();
            case nodes.ParsingContext.TypeArguments:
            case nodes.ParsingContext.TupleElementTypes:
                return this.lexer.peek().type === TokenType.comma || this.isStartOfType();
            case nodes.ParsingContext.HeritageClauses:
                return this.isHeritageClause();
            case nodes.ParsingContext.ImportOrExportSpecifiers:
                return tokenIsIdentifierOrKeyword(this.lexer.peek().type);
            case nodes.ParsingContext.JsxAttributes:
                return tokenIsIdentifierOrKeyword(this.lexer.peek().type) || this.lexer.peek().type === TokenType.openBrace;
            case nodes.ParsingContext.JsxChildren:
                return true;
            case nodes.ParsingContext.JSDocFunctionParameters:
            case nodes.ParsingContext.JSDocTypeArguments:
            case nodes.ParsingContext.JSDocTupleTypes:
                return nodes.JSDocParser.isJSDocType();
            case nodes.ParsingContext.JSDocRecordMembers:
                return this.isSimplePropertyName();
        }

        nodes.Debug.fail("nodes.Non-exhaustive case in 'this.isListElement'.");
    }

    private isValidHeritageClauseObjectLiteral() {
        console.assert(this.lexer.peek().type === TokenType.openBrace);
        if (this.lexer.read().type === TokenType.closeBrace) {
            // if we see  "extends {}" then only treat the {} as what we're extending (and not
            // the class body) if we have:
            //
            //      extends {} {
            //      extends {},
            //      extends {} extends
            //      extends {} implements

            const next = this.lexer.read().type;
            return next === TokenType.comma || next === TokenType.openBrace || next === TokenType.extends || next === TokenType.implements;
        }

        return true;
    }

    private nextTokenIsIdentifier() {
        this.lexer.read().type;
        return this.isIdentifier();
    }

    private nextTokenIsIdentifierOrKeyword() {
        this.lexer.read().type;
        return tokenIsIdentifierOrKeyword(this.lexer.peek().type);
    }

    private isHeritageClauseExtendsOrImplementsKeyword(): boolean {
        if (this.lexer.peek().type === TokenType.implements ||
            this.lexer.peek().type === TokenType.extends) {

            return this.lookAhead(this.nextTokenIsStartOfExpression);
        }

        return false;
    }

    private nextTokenIsStartOfExpression() {
        this.lexer.read().type;
        return this.isStartOfExpression();
    }

    // nodes.True if positioned at a list terminator
    private isListTerminator(kind: nodes.ParsingContext): boolean {
        if (this.lexer.peek().type === TokenType.endOfFile) {
            // nodes.Being at the end of the file ends all lists.
            return true;
        }

        switch (kind) {
            case nodes.ParsingContext.BlockStatements:
            case nodes.ParsingContext.SwitchClauses:
            case nodes.ParsingContext.TypeMembers:
            case nodes.ParsingContext.ClassMembers:
            case nodes.ParsingContext.EnumMembers:
            case nodes.ParsingContext.ObjectLiteralMembers:
            case nodes.ParsingContext.ObjectBindingElements:
            case nodes.ParsingContext.ImportOrExportSpecifiers:
                return this.lexer.peek().type === TokenType.closeBrace;
            case nodes.ParsingContext.SwitchClauseStatements:
                return this.lexer.peek().type === TokenType.closeBrace || this.lexer.peek().type === TokenType.case || this.lexer.peek().type === TokenType.default;
            case nodes.ParsingContext.HeritageClauseElement:
                return this.lexer.peek().type === TokenType.openBrace || this.lexer.peek().type === TokenType.extends || this.lexer.peek().type === TokenType.implements;
            case nodes.ParsingContext.VariableDeclarations:
                return this.isVariableDeclaratorListTerminator();
            case nodes.ParsingContext.TypeParameters:
                // nodes.Tokens other than '>' are here for better error recovery
                return this.lexer.peek().type === TokenType.greaterThan || this.lexer.peek().type === TokenType.openParen || this.lexer.peek().type === TokenType.openBrace || this.lexer.peek().type === TokenType.extends || this.lexer.peek().type === TokenType.implements;
            case nodes.ParsingContext.ArgumentExpressions:
                // nodes.Tokens other than ')' are here for better error recovery
                return this.lexer.peek().type === TokenType.closeParen || this.lexer.peek().type === TokenType.semicolon;
            case nodes.ParsingContext.ArrayLiteralMembers:
            case nodes.ParsingContext.TupleElementTypes:
            case nodes.ParsingContext.ArrayBindingElements:
                return this.lexer.peek().type === TokenType.closeBracket;
            case nodes.ParsingContext.Parameters:
                // nodes.Tokens other than ')' and ']' (the latter for index signatures) are here for better error recovery
                return this.lexer.peek().type === TokenType.closeParen || this.lexer.peek().type === TokenType.closeBracket /*|| this.lexer.peek().type === nodes.SyntaxKind.OpenBraceToken*/;
            case nodes.ParsingContext.TypeArguments:
                // nodes.Tokens other than '>' are here for better error recovery
                return this.lexer.peek().type === TokenType.greaterThan || this.lexer.peek().type === TokenType.openParen;
            case nodes.ParsingContext.HeritageClauses:
                return this.lexer.peek().type === TokenType.openBrace || this.lexer.peek().type === TokenType.closeBrace;
            case nodes.ParsingContext.JsxAttributes:
                return this.lexer.peek().type === TokenType.greaterThan || this.lexer.peek().type === TokenType.slash;
            case nodes.ParsingContext.JsxChildren:
                return this.lexer.peek().type === TokenType.lessThan && this.lookAhead(this.nextTokenIsSlash);
            case nodes.ParsingContext.JSDocFunctionParameters:
                return this.lexer.peek().type === TokenType.closeParen || this.lexer.peek().type === TokenType.colon || this.lexer.peek().type === TokenType.closeBrace;
            case nodes.ParsingContext.JSDocTypeArguments:
                return this.lexer.peek().type === TokenType.greaterThan || this.lexer.peek().type === TokenType.closeBrace;
            case nodes.ParsingContext.JSDocTupleTypes:
                return this.lexer.peek().type === TokenType.closeBracket || this.lexer.peek().type === TokenType.closeBrace;
            case nodes.ParsingContext.JSDocRecordMembers:
                return this.lexer.peek().type === TokenType.closeBrace;
        }
    }

    private isVariableDeclaratorListTerminator(): boolean {
        // nodes.If we can consume a semicolon (either explicitly, or with nodes.ASI), then consider us done
        // with parsing the list of  variable declarators.
        if (this.canParseSemicolon()) {
            return true;
        }

        // in the case where we're parsing the variable declarator of a 'for-in' statement, we
        // are done if we see an 'in' keyword in front of us. nodes.Same with for-of
        if (this.isInOrOfKeyword(this.lexer.peek().type)) {
            return true;
        }

        // nodes.ERROR nodes.RECOVERY nodes.TWEAK:
        // nodes.For better error recovery, if we see an '=>' then we just stop immediately.  nodes.We've got an
        // arrow function here and it's going to be very unlikely that we'll resynchronize and get
        // another variable declaration.
        if (this.lexer.peek().type === TokenType.equalsGreaterThan) {
            return true;
        }

        // nodes.Keep trying to parse out variable declarators.
        return false;
    }

    // nodes.True if positioned at element or terminator of the current list or any enclosing list
    private isInSomeParsingContext(): boolean {
        for (let kind = 0; kind < nodes.ParsingContext.Count; kind++) {
            if (this.parsingContext & (1 << kind)) {
                if (this.isListElement(kind, /*inErrorRecovery*/ true) || this.isListTerminator(kind)) {
                    return true;
                }
            }
        }

        return false;
    }

    // nodes.Parses a list of elements
    private parseList<T extends nodes.Node>(kind: nodes.ParsingContext, parseElement: () => T): nodes.NodeList<T> {
        const saveParsingContext = this.parsingContext;
        this.parsingContext |= 1 << kind;
        const this.result = <nodes.NodeList<T>>[];
        this.result.pos = this.getNodePos();

        while (!this.isListTerminator(kind)) {
            if (this.isListElement(kind, /*inErrorRecovery*/ false)) {
                const element = this.parseListElement(kind, parseElement);
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
    }

    private parseListElement<T extends nodes.Node>(parsingContext: nodes.ParsingContext, parseElement: () => T): T {
        const result = this.currentNode(this.parsingContext);
        if (result) {
            return <T>this.consumeNode(result);
        }

        return parseElement();
    }

    private currentNode(parsingContext: nodes.ParsingContext): nodes.Node {
        // nodes.If there is an outstanding parse error that we've encountered, but not attached to
        // some result, then we cannot get a result from the old source tree.  nodes.This is because we
        // want to mark the next result we encounter as being unusable.
        //
        // nodes.Note: nodes.This may be too conservative.  nodes.Perhaps we could reuse the result and set the bit
        // on it (or its leftmost child) as having the error.  nodes.For now though, being conservative
        // is nice and likely won't ever affect perf.
        if (this.parseErrorBeforeNextFinishedNode) {
            return undefined;
        }

        if (!this.syntaxCursor) {
            // if we don't have a cursor, we could never return a result from the old tree.
            return undefined;
        }

        const result = this.syntaxCursor.currentNode(this.lexer.getStartPos());

        // nodes.Can't reuse a missing result.
        if (nodeIsMissing(result)) {
            return undefined;
        }

        // nodes.Can't reuse a result that intersected the change range.
        if (result.intersectsChange) {
            return undefined;
        }

        // nodes.Can't reuse a result that contains a parse error.  nodes.This is necessary so that we
        // produce the same set of errors again.
        if (containsParseError(result)) {
            return undefined;
        }

        // nodes.We can only reuse a result if it was parsed under the same strict mode that we're
        // currently in.  i.e. if we originally parsed a result in non-strict mode, but then
        // the user added 'using strict' at the top of the file, then we can't use that result
        // again as the presence of strict mode may cause us to parse the tokens in the file
        // differently.
        //
        // nodes.Note: we *can* reuse tokens when the strict mode changes.  nodes.That's because tokens
        // are unaffected by strict mode.  nodes.It's just the parser will decide what to do with it
        // differently depending on what mode it is in.
        //
        // nodes.This also applies to all our other context flags as well.
        const nodeContextFlags = result.flags & nodes.NodeFlags.ContextFlags;
        if (nodeContextFlags !== this.contextFlags) {
            return undefined;
        }

        // nodes.Ok, we have a result that looks like it could be reused.  nodes.Now verify that it is valid
        // in the current list parsing context that we're currently at.
        if (!this.canReuseNode(result, this.parsingContext)) {
            return undefined;
        }

        return result;
    }

    private consumeNode(result: nodes.Node) {
        // nodes.Move the this.scanner so it is after the result we just consumed.
        this.lexer.setTextPos(result.end);
        this.lexer.read().type;
        return result;
    }

    private canReuseNode(result: nodes.Node, parsingContext: nodes.ParsingContext): boolean {
        switch (this.parsingContext) {
            case nodes.ParsingContext.ClassMembers:
                return this.isReusableClassMember(result);

            case nodes.ParsingContext.SwitchClauses:
                return this.isReusableSwitchClause(result);

            case nodes.ParsingContext.SourceElements:
            case nodes.ParsingContext.BlockStatements:
            case nodes.ParsingContext.SwitchClauseStatements:
                return this.isReusableStatement(result);

            case nodes.ParsingContext.EnumMembers:
                return this.isReusableEnumMember(result);

            case nodes.ParsingContext.TypeMembers:
                return this.isReusableTypeMember(result);

            case nodes.ParsingContext.VariableDeclarations:
                return this.isReusableVariableDeclaration(result);

            case nodes.ParsingContext.Parameters:
                return this.isReusableParameter(result);

            // nodes.Any other lists we do not care about reusing nodes in.  nodes.But feel free to add if
            // you can do so safely.  nodes.Danger areas involve nodes that may involve speculative
            // parsing.  nodes.If speculative parsing is involved with the result, then the range the
            // parser reached while looking ahead might be in the edited range (see the example
            // in canReuseVariableDeclaratorNode for a good case of this).
            case nodes.ParsingContext.HeritageClauses:
            // nodes.This would probably be safe to reuse.  nodes.There is no speculative parsing with
            // heritage clauses.

            case nodes.ParsingContext.TypeParameters:
            // nodes.This would probably be safe to reuse.  nodes.There is no speculative parsing with
            // type parameters.  nodes.Note that that's because type *parameters* only occur in
            // unambiguous *type* contexts.  nodes.While type *arguments* occur in very ambiguous
            // *expression* contexts.

            case nodes.ParsingContext.TupleElementTypes:
            // nodes.This would probably be safe to reuse.  nodes.There is no speculative parsing with
            // tuple types.

            // nodes.Technically, type argument list types are probably safe to reuse.  nodes.While
            // speculative parsing is involved with them (since type argument lists are only
            // produced from speculative parsing a < as a type argument list), we only have
            // the types because speculative parsing succeeded.  nodes.Thus, the lookahead never
            // went past the end of the list and rewound.
            case nodes.ParsingContext.TypeArguments:

            // nodes.Note: these are almost certainly not safe to ever reuse.  nodes.Expressions commonly
            // need a large amount of lookahead, and we should not reuse them as they may
            // have actually intersected the edit.
            case nodes.ParsingContext.ArgumentExpressions:

            // nodes.This is not safe to reuse for the same reason as the 'nodes.AssignmentExpression'
            // cases.  i.e. a property assignment may end with an expression, and thus might
            // have lookahead far beyond it's old result.
            case nodes.ParsingContext.ObjectLiteralMembers:

            // nodes.This is probably not safe to reuse.  nodes.There can be speculative parsing with
            // type names in a heritage clause.  nodes.There can be generic names in the type
            // name list, and there can be left hand side expressions (which can have type
            // arguments.)
            case nodes.ParsingContext.HeritageClauseElement:

            // nodes.Perhaps safe to reuse, but it's unlikely we'd see more than a dozen attributes
            // on any given element. nodes.Same for children.
            case nodes.ParsingContext.JsxAttributes:
            case nodes.ParsingContext.JsxChildren:

        }

        return false;
    }

    private isReusableClassMember(result: nodes.Node) {
        if (result) {
            switch (result.kind) {
                case TokenType.Constructor:
                case TokenType.IndexSignature:
                case TokenType.GetAccessor:
                case TokenType.SetAccessor:
                case TokenType.PropertyDeclaration:
                case TokenType.SemicolonClassElement:
                    return true;
                case TokenType.MethodDeclaration:
                    // nodes.Method declarations are not necessarily reusable.  nodes.An object-literal
                    // may have a method calls "constructor(...)" and we must reparse that
                    // into an actual .ConstructorDeclaration.
                    let methodDeclaration = <nodes.MethodDeclaration>result;
                    let nameIsConstructor = methodDeclaration.name.kind === TokenType.Identifier &&
                        (<nodes.Identifier>methodDeclaration.name).originalKeywordKind === TokenType.constructor;

                    return !nameIsConstructor;
            }
        }

        return false;
    }

    private isReusableSwitchClause(result: nodes.Node) {
        if (result) {
            switch (result.kind) {
                case TokenType.CaseClause:
                case TokenType.DefaultClause:
                    return true;
            }
        }

        return false;
    }

    private isReusableStatement(result: nodes.Node) {
        if (result) {
            switch (result.kind) {
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

    private isReusableEnumMember(result: nodes.Node) {
        return result.kind === TokenType.EnumMember;
    }

    private isReusableTypeMember(result: nodes.Node) {
        if (result) {
            switch (result.kind) {
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

    private isReusableVariableDeclaration(result: nodes.Node) {
        if (result.kind !== TokenType.VariableDeclaration) {
            return false;
        }

        // nodes.Very subtle incremental parsing bug.  nodes.Consider the following code:
        //
        //      let v = new nodes.List < A, B
        //
        // nodes.This is actually legal code.  nodes.It's a list of variable declarators "v = new nodes.List<A"
        // on one side and "B" on the other. nodes.If you then change that to:
        //
        //      let v = new nodes.List < A, B >()
        //
        // then we have a problem.  "v = new nodes.List<A" doesn't intersect the change range, so we
        // start reparsing at "B" and we completely fail to handle this properly.
        //
        // nodes.In order to prevent this, we do not allow a variable declarator to be reused if it
        // has an initializer.
        const variableDeclarator = <nodes.VariableDeclaration>result;
        return variableDeclarator.initializer === undefined;
    }

    private isReusableParameter(result: nodes.Node) {
        if (result.kind !== TokenType.Parameter) {
            return false;
        }

        // nodes.See the comment in this.isReusableVariableDeclaration for why we do this.
        const parameter = <nodes.ParameterDeclaration>result;
        return parameter.initializer === undefined;
    }

    // nodes.Returns true if we should abort parsing.
    private abortParsingListOrMoveToNextToken(kind: nodes.ParsingContext) {
        this.parseErrorAtCurrentToken(this.parsingContextErrors(kind));
        if (this.isInSomeParsingContext()) {
            return true;
        }

        this.lexer.read().type;
        return false;
    }

    private parsingContextErrors(context: nodes.ParsingContext): nodes.DiagnosticMessage {
        switch (context) {
            case nodes.ParsingContext.SourceElements: return nodes.Diagnostics.Declaration_or_statement_expected;
            case nodes.ParsingContext.BlockStatements: return nodes.Diagnostics.Declaration_or_statement_expected;
            case nodes.ParsingContext.SwitchClauses: return nodes.Diagnostics.case_or_default_expected;
            case nodes.ParsingContext.SwitchClauseStatements: return nodes.Diagnostics.Statement_expected;
            case nodes.ParsingContext.TypeMembers: return nodes.Diagnostics.Property_or_signature_expected;
            case nodes.ParsingContext.ClassMembers: return nodes.Diagnostics.Unexpected_token_A_constructor_method_accessor_or_property_was_expected;
            case nodes.ParsingContext.EnumMembers: return nodes.Diagnostics.Enum_member_expected;
            case nodes.ParsingContext.HeritageClauseElement: return nodes.Diagnostics.Expression_expected;
            case nodes.ParsingContext.VariableDeclarations: return nodes.Diagnostics.Variable_declaration_expected;
            case nodes.ParsingContext.ObjectBindingElements: return nodes.Diagnostics.Property_destructuring_pattern_expected;
            case nodes.ParsingContext.ArrayBindingElements: return nodes.Diagnostics.Array_element_destructuring_pattern_expected;
            case nodes.ParsingContext.ArgumentExpressions: return nodes.Diagnostics.Argument_expression_expected;
            case nodes.ParsingContext.ObjectLiteralMembers: return nodes.Diagnostics.Property_assignment_expected;
            case nodes.ParsingContext.ArrayLiteralMembers: return nodes.Diagnostics.Expression_or_comma_expected;
            case nodes.ParsingContext.Parameters: return nodes.Diagnostics.Parameter_declaration_expected;
            case nodes.ParsingContext.TypeParameters: return nodes.Diagnostics.Type_parameter_declaration_expected;
            case nodes.ParsingContext.TypeArguments: return nodes.Diagnostics.Type_argument_expected;
            case nodes.ParsingContext.TupleElementTypes: return nodes.Diagnostics.Type_expected;
            case nodes.ParsingContext.HeritageClauses: return nodes.Diagnostics.Unexpected_token_expected;
            case nodes.ParsingContext.ImportOrExportSpecifiers: return nodes.Diagnostics.Identifier_expected;
            case nodes.ParsingContext.JsxAttributes: return nodes.Diagnostics.Identifier_expected;
            case nodes.ParsingContext.JsxChildren: return nodes.Diagnostics.Identifier_expected;
            case nodes.ParsingContext.JSDocFunctionParameters: return nodes.Diagnostics.Parameter_declaration_expected;
            case nodes.ParsingContext.JSDocTypeArguments: return nodes.Diagnostics.Type_argument_expected;
            case nodes.ParsingContext.JSDocTupleTypes: return nodes.Diagnostics.Type_expected;
            case nodes.ParsingContext.JSDocRecordMembers: return nodes.Diagnostics.Property_assignment_expected;
        }
    };

    //// nodes.Parses a comma-delimited list of elements
    //private parseDelimitedList<T extends nodes.Node>(kind: nodes.ParsingContext, parseElement: () => T, considerSemicolonAsDelimiter?: boolean): nodes.NodeList<T> {
    //    const saveParsingContext = this.parsingContext;
    //    this.parsingContext |= 1 << kind;
    //    const this.result = <nodes.NodeList<T>>[];
    //    this.result.pos = this.getNodePos();

    //    let commaStart = -1; // nodes.Meaning the previous this.lexer.peek().type was not a comma
    //    while (true) {
    //        if (this.isListElement(kind, /*inErrorRecovery*/ false)) {
    //            this.result.push(this.parseListElement(kind, parseElement));
    //            commaStart = this.lexer.getTokenPos();
    //            if (this.tryReadToken(TokenType.comma)) {
    //                continue;
    //            }

    //            commaStart = -1; // nodes.Back to the state where the last this.lexer.peek().type was not a comma
    //            if (this.isListTerminator(kind)) {
    //                break;
    //            }

    //            // nodes.We didn't get a comma, and the list wasn't terminated, explicitly parse
    //            // out a comma so we give a good error message.
    //            this.readToken(TokenType.comma);

    //            // nodes.If the this.lexer.peek().type was a semicolon, and the caller allows that, then skip it and
    //            // continue.  nodes.This ensures we get back on track and don't this.result in tons of
    //            // parse errors.  nodes.For example, this can happen when people do things like use
    //            // a semicolon to delimit object literal members.   nodes.Note: we'll have already
    //            // reported an error when we called this.readToken above.
    //            if (considerSemicolonAsDelimiter && this.lexer.peek().type === TokenType.semicolon && !this.lexer.peek().hasLineBreakBeforeStart) {
    //                this.lexer.read().type;
    //            }
    //            continue;
    //        }

    //        if (this.isListTerminator(kind)) {
    //            break;
    //        }

    //        if (this.abortParsingListOrMoveToNextToken(kind)) {
    //            break;
    //        }
    //    }

    //    // nodes.Recording the trailing comma is deliberately done after the previous
    //    // loop, and not just if we see a list terminator. nodes.This is because the list
    //    // may have ended incorrectly, but it is still important to know if there
    //    // was a trailing comma.
    //    // nodes.Check if the last this.lexer.peek().type was a comma.
    //    if (commaStart >= 0) {
    //        // nodes.Always preserve a trailing comma by marking it on the nodes.NodeList
    //        this.result.hasTrailingComma = true;
    //    }

    //    this.result.end = this.getNodeEnd();
    //    this.parsingContext = saveParsingContext;
    //    return this.result;
    //}

    private createMissingList<T>(): nodes.NodeList<T> {
        const pos = this.getNodePos();
        const this.result = <nodes.NodeList<T>>[];
        this.result.pos = pos;
        this.result.end = pos;
        return this.result;
    }

    // nodes.The allowReservedWords parameter controls whether reserved words are permitted after the first dot
    private parseEntityName(allowReservedWords: boolean, diagnosticMessage?: nodes.DiagnosticMessage): nodes.EntityName {
        let entity: nodes.EntityName = this.parseIdentifier(diagnosticMessage);
        while (this.tryReadToken(TokenType.dot)) {
            const result: nodes.QualifiedName = new nodes.QualifiedName();  // !!!
            result.left = entity;
            result.right = this.parseRightSideOfDot(allowReservedWords);
            entity = result;
        }
        return entity;
    }

    private parseRightSideOfDot(allowIdentifierNames: boolean): nodes.Identifier {
        // nodes.Technically a keyword is valid here as all this.identifiers and keywords are identifier names.
        // nodes.However, often we'll encounter this in error situations when the identifier or keyword
        // is actually starting another valid construct.
        //
        // nodes.So, we check for the following specific case:
        //
        //      name.
        //      identifierOrKeyword identifierNameOrKeyword
        //
        // nodes.Note: the newlines are important here.  nodes.For example, if that above code
        // were rewritten into:
        //
        //      name.identifierOrKeyword
        //      identifierNameOrKeyword
        //
        // nodes.Then we would consider it valid.  nodes.That's because nodes.ASI would take effect and
        // the code would be implicitly: "name.identifierOrKeyword; identifierNameOrKeyword".
        // nodes.In the first case though, nodes.ASI will not take effect because there is not a
        // line terminator after the identifier or keyword.
        if (this.lexer.peek().hasLineBreakBeforeStart && tokenIsIdentifierOrKeyword(this.lexer.peek().type)) {
            const matchesPattern = this.lookAhead(this.nextTokenIsIdentifierOrKeywordOnSameLine);

            if (matchesPattern) {
                // nodes.Report that we need an identifier.  nodes.However, report it right after the dot,
                // and not on the next this.lexer.peek().type.  nodes.This is because the next this.lexer.peek().type might actually
                // be an identifier and the error would be quite confusing.
                return <nodes.Identifier>this.createMissingNode(TokenType.Identifier, /*reportAtCurrentPosition*/ true, nodes.Diagnostics.Identifier_expected);
            }
        }

        return allowIdentifierNames ? this.parseIdentifierName() : this.parseIdentifier();
    }

    private parseTemplateExpression(): nodes.TemplateExpression {
        const template = new nodes.TemplateExpression();

        template.head = this.parseTemplateLiteralFragment();
        console.assert(template.head.kind === TokenType.TemplateHead, "nodes.Template head has wrong this.lexer.peek().type kind");

        const templateSpans = <nodes.NodeList<nodes.TemplateSpan>>[];
        templateSpans.pos = this.getNodePos();

        do {
            templateSpans.push(this.parseTemplateSpan());
        }
        while (lastOrUndefined(templateSpans).literal.kind === TokenType.TemplateMiddle);

        templateSpans.end = this.getNodeEnd();
        template.templateSpans = templateSpans;

        return this.finishNode(template);
    }

    private parseTemplateSpan(): nodes.TemplateSpan {
        const span = new nodes.TemplateSpan();
        span.expression = this.allowInAnd(this.parseExpression);

        let literal: nodes.TemplateLiteralFragment;

        if (this.lexer.peek().type === TokenType.closeBrace) {
            this.reScanTemplateToken();
            literal = this.parseTemplateLiteralFragment();
        }
        else {
            literal = <nodes.TemplateLiteralFragment>this.readTokenToken(TokenType.TemplateTail, /*reportAtCurrentPosition*/ false, nodes.Diagnostics._0_expected, tokenToString(TokenType.closeBrace));
        }

        span.literal = literal;
        return this.finishNode(span);
    }

    private parseStringLiteralTypeNode(): nodes.StringLiteralTypeNode {
        return <nodes.StringLiteralTypeNode>this.parseLiteralLikeNode(TokenType.StringLiteralType, /*internName*/ true);
    }

    private parseLiteralNode(internName?: boolean): nodes.LiteralExpression {
        return <nodes.LiteralExpression>this.parseLiteralLikeNode(this.lexer.peek().type, internName);
    }

    private parseTemplateLiteralFragment(): nodes.TemplateLiteralFragment {
        return <nodes.TemplateLiteralFragment>this.parseLiteralLikeNode(this.lexer.peek().type, /*internName*/ false);
    }

    private parseLiteralLikeNode(kind: TokenType, internName: boolean): nodes.LiteralLikeNode {
        const result = new nodes.LiteralExpression();
        const text = this.lexer.getTokenValue();
        result.text = internName ? this.internIdentifier(text) : text;

        if (this.lexer.hasExtendedUnicodeEscape()) {
            result.hasExtendedUnicodeEscape = true;
        }

        if (this.lexer.isUnterminated()) {
            result.isUnterminated = true;
        }

        const tokenPos = this.lexer.getTokenPos();
        this.lexer.read().type;
        result;

        // nodes.Octal literals are not allowed in strict mode or nodes.ES5
        // nodes.Note that theoretically the following condition would hold true literals like 009,
        // which is not octal.But because of how the this.scanner separates the tokens, we would
        // never get a this.lexer.peek().type like this. nodes.Instead, we would get 00 and 9 as two separate tokens.
        // nodes.We also do not need to check for negatives because any prefix operator would be part of a
        // parent unary expression.
        if (result.kind === TokenType.NumericLiteral
            && this.sourceText.charCodeAt(tokenPos) === nodes.CharCode.num0
            && isOctalDigit(this.sourceText.charCodeAt(tokenPos + 1))) {

            result.isOctalLiteral = true;
        }

        return result;
    }

    /**
     * 解析一个源文件。
     */
    private parseSourceFile(text: string, start: number, fileName: string) {
        const result = new nodes.SourceFile();
        result.path = fileName;
        result.content = text;
        result.start = start;
        this.lexer.setSource(text, start, fileName);

        if (this.lexer.comments) {
            for (const comment of this.lexer.comments) {
                // 只处理 /// 开头的注释。
                if (this.lexer.source.charCodeAt(comment.start) !== CharCode.slash ||
                    this.lexer.source.charCodeAt(comment.start - 1) !== CharCode.slash) {
                    continue;
                }
            }
        }

        //// 解析文件主文档注释。
        //if (options.parseJsDoc !== false) {

        //}

        //// 解析 <reference /> 注释。
        //if (options.parseReferenceComments !== false) {
        //    this.parseReferenceComments();
        //}

        result.statements = new Nodes.NodeList<Nodes.Statement>();
        while (this.lexer.peek().type !== TokenType.endOfFile) {
            result.statements.push(this.parseStatement());
        }
        result.comments = this.lexer.comments;
        result.end = this.lexer.peek().start;
        return result;
    }

    // #endregion

}

/**
 * 表示语法解析的相关配置。
 */
export interface ParserOptions extends LexerOptions {

    /**
     * 禁止省略语句末尾的分号。
     */
    disallowMissingSemicolon?: boolean,

    /**
     * 使用智能分号插入策略。使用该策略可以减少省略分号引发的语法错误。
     */
    useStandardSemicolonInsertion?: boolean,

    /**
     * 禁止省略条件表达式的括号。
     */
    disallowMissingParenthese?: boolean,

    /**
     * 禁止省略 switch (true) 中的 (true)。
     */
    disallowMissingSwitchCondition?: boolean,

    /**
     * 禁止使用 case else 语法代替 default。
     */
    disallowCaseElse?: boolean,

    /**
     * 使用 for..in 兼容变量定义。
     */
    useCompatibleForInAndForOf?: boolean,

    /**
     * 禁止使用 for..of 语法。
     */
    disallowForOf?: boolean,

    /**
     * 禁止使用 for..of 逗号语法。
     */
    disallowForOfCommaExpression?: boolean,

    /**
     * 禁止使用 for..to 语法。
     */
    disallowForTo?: boolean,

    /**
     * 禁止使用 throw 空参数语法。
     */
    disallowRethrow?: boolean,

    /**
     * 禁止使用 with 语句定义语法。
     */
    disallowWithVaribale?: boolean,

    /**
     * 禁止省略 try 语句块的 {}。
     */
    disallowMissingTryBlock?: boolean,

    /**
     * 禁止省略 catch 分句的变量名。
     */
    disallowMissingCatchVaribale?: boolean,

    /**
     * 禁止不含 catch 和 finally 分句的 try 语句。
     */
    disallowSimpleTryBlock?: boolean,

}
