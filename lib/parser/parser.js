/**
 * @fileOverview 语法解析器
 * @author xuld@vip.qq.com
 */
var tokenType_1 = require('./tokenType');
var lexer_1 = require('./lexer');
var nodes = require('./nodes');
/**
 * 表示一个语法解析器。
 * @description 语法解析器可以将源码解析一个语法树。
 */
var Parser = (function () {
    function Parser() {
        // #region 对外接口
        /**
         * 获取或设置当前语法解析器使用的词法解析器。
         */
        this.lexer = new lexer_1.Lexer();
        // #endregion
        // #region 未整理
        this.disallowInAndDecoratorContext = NodeFlags.DisallowInContext | NodeFlags.DecoratorContext;
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
        this.parseErrorBeforeNextFinishedNode = false;
    }
    Object.defineProperty(Parser.prototype, "options", {
        /**
         * 获取当前语法解析器的配置。
         */
        get: function () {
            return this.lexer.options;
        },
        /**
         * 设置当前语法解析器的配置。
         */
        set: function (value) {
            this.lexer.options = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 解析指定的源文件。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param options 解析的源码位置。
     */
    Parser.prototype.parse = function (text, start, options) {
        return this.parseSourceFile(text || "", start || 0, options);
    };
    /**
     * 从指定的输入解析一个语句。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param fileName 解析的源码位置。
     */
    Parser.prototype.parseAsStatement = function (text, start, fileName) {
        this.lexer.setSource(text, start, fileName);
        return this.parseStatement();
    };
    /**
     * 从指定的输入解析一个表达式。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param fileName 解析的源码位置。
     */
    Parser.prototype.parseAsExpression = function (text, start, fileName) {
        this.lexer.setSource(text, start, fileName);
        return this.parseExpression();
    };
    /**
     * 从指定的输入解析一个类型表达式。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param fileName 解析的源码位置。
     */
    Parser.prototype.parseAsTypeNode = function (text, start, fileName) {
        delete this.lexer.comment;
        this.lexer.setSource(text, start, fileName);
        return this.parseTypeNode();
    };
    /**
     * 报告一个语法错误。
     * @param range 发生错误的位置。
     * @param message 错误的信息。
     * @param args 格式化错误的参数。
     */
    Parser.prototype.error = function (range, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        // error(ErrorType.syntaxError, this.lexer.fileName, range.start, range.end, message, ...args);
    };
    // #endregion
    // #region 解析节点底层
    /**
     * 尝试读取指定类型的标记。如果下一个标记不是指定的类型则不读取。
     * @param token 要读取的标记类型。
     * @returns 如果已读取则返回读取的标记位置，否则返回 undefined。
     */
    Parser.prototype.tryReadToken = function (token) {
        if (this.lexer.peek().type === token) {
            return this.lexer.read().start;
        }
    };
    /**
     * 读取指定类型的标记，如果下一个标记不是指定的类型则报告错误。
     * @param token 要读取的标记类型。
     * @returns 如果已读取则返回读取的标记位置，否则返回当前的结束位置。
     */
    Parser.prototype.readToken = function (token) {
        if (this.lexer.peek().type === token) {
            return this.lexer.read().start;
        }
        this.error(this.lexer.peek(), token !== 22 /* identifier */ ? "应输入“{0}”。" : tokenType_1.isKeyword(token) ? "应输入标识符；“{0}”是关键字。" : "应输入标识符。", tokenType_1.tokenToString(token));
        return this.lexer.current.end;
    };
    /**
     * 解析一个节点列表。
     * @param parseElement 解析每个元素的函数。如果解析失败函数返回 undefined。
     * @param openToken 列表的开始标记。
     * @param closeToken 列表的结束标记。
     * @param delimiter 分隔符类型。合法的值有 unknown、comma、semicolon。
     * @param continueParse 用于判断出现错误后是否继续解析列表项的函数。
     */
    Parser.prototype.parseNodeList = function (parseElement, openToken, closeToken, delimiter, continueParse) {
        var result = openToken ? new nodes.NodeList() : undefined;
        if (openToken)
            result.start = this.readToken(openToken);
        while (this.lexer.peek().type !== 1 /* endOfFile */ &&
            (!closeToken || this.lexer.peek().type !== closeToken)) {
            var element = parseElement.call(this);
            if (!element)
                break;
            if (!result)
                result = new nodes.NodeList();
            result.push(element);
            if (delimiter) {
                if (this.lexer.peek().type === 98 /* comma */) {
                    element.commaToken = this.readToken(98 /* comma */);
                    continue;
                }
                if (delimiter === 106 /* semicolon */ && this.lexer.peek().type === 106 /* semicolon */) {
                    element.semicolonToken = this.readToken(106 /* semicolon */);
                    continue;
                }
            }
            if (continueParse && continueParse.call(this)) {
                continue;
            }
            break;
        }
        if (closeToken)
            result.end = this.readToken(closeToken);
        return result;
    };
    /**
     * 在不影响现有状态的情况下尝试解析。
     * @param parser 解析的函数。
     * @return 返回尝试解析的结果。如果尝试解析失败则返回 undefined。
     */
    Parser.prototype.tryParse = function (parser) {
        // 保存状态。
        var orignalToken = this.lexer.current;
        var orignalError = this.error;
        var cachedErrors = [];
        this.error = function () { cachedErrors.push(arguments); };
        // 解析节点。        
        var result = parser.call(this, cachedErrors);
        // 恢复状态。        
        this.error = orignalError;
        if (result) {
            for (var _i = 0, cachedErrors_1 = cachedErrors; _i < cachedErrors_1.length; _i++) {
                var e = cachedErrors_1[_i];
                this.error.apply(this, e);
            }
        }
        else {
            this.lexer.current = orignalToken;
        }
        return result;
    };
    // #endregion
    // #region 解析类型节点
    /**
     * 解析一个类型节点(`number`、`string[]`、...)。
     */
    Parser.prototype.parseTypeNode = function () {
        // todo: 关闭 yield | await
        switch (this.lexer.peek().type) {
            case 47 /* openParen */:
                var parameters = this.tryParseParameterDeclarationList();
                if (parameters) {
                    return this.parseFunctionOrConstructorTypeNode(20 /* function */, parameters);
                }
                break;
            case 54 /* lessThan */:
                return this.parseFunctionOrConstructorTypeNode(20 /* function */);
            case 38 /* new */:
                return this.parseFunctionOrConstructorTypeNode(38 /* new */);
        }
        return this.parseUnionOrIntersectionTypeOrHigher(77 /* bar */);
        // todo: 防止用户输入表达式。
    };
    /**
     * 尝试解析一个参数定义列表。
     */
    Parser.prototype.tryParseParameterDeclarationList = function () {
        var _this = this;
        return this.tryParse(function () {
            var parameters = _this.parseParameterDeclarationList();
            if (_this.lexer.peek().type === 55 /* equalsGreaterThan */ || _this.lexer.peek().type === 105 /* colon */) {
                return parameters;
            }
        });
    };
    /**
     * 解析一个参数定义列表。
     */
    Parser.prototype.parseParameterDeclarationList = function () {
        // todo: 设置 yield  和 await
        return this.parseNodeList(this.parseParameterDeclaration, 47 /* openParen */, 102 /* closeParen */, 98 /* comma */, this.isBindingName);
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
    };
    /**
     * 解析一个参数声明(`x`、`x = 1`、`...x`、...)。
     */
    Parser.prototype.parseParameterDeclaration = function () {
        var result = new nodes.ParameterDeclaration();
        result.decorators = this.parseDecoratorList();
        result.modifiers = this.parseModifierList(0 /* parameter */);
        result.dotDotDotToken = this.tryReadToken(56 /* dotDotDot */);
        result.name = this.lexer.peek().type === 32 /* this */ ? this.createIdentifier() : this.parseBindingName();
        result.questionToken = this.tryReadToken(97 /* question */);
        this.parseTypeAnnotation(result);
        this.parseInitializer(result);
        return result;
    };
    /**
     * 解释一个修饰器列表。
     */
    Parser.prototype.parseDecoratorList = function () {
        return this.parseNodeList(this.parseDecorator);
    };
    /**
     * 解析一个修饰器(`@x`)。
     */
    Parser.prototype.parseDecorator = function () {
        if (!this.tryReadToken(98 /* comma */))
            return;
        var result = new nodes.Decorator();
        result.start = this.lexer.current.start;
        result.body = this.doInDecoratorContext(this.parseLeftHandSideExpressionOrHigher);
        return result;
    };
    /**
     * 解析一个修饰符列表(`static`、`private`、...)。
     */
    Parser.prototype.parseModifierList = function (usage) {
        var _this = this;
        return this.parseNodeList(function () { return _this.parseModifier(usage); });
    };
    /**
     * 解析一个修饰符(`static`、`private`、...)。
     * @param usage 当前修饰符的使用场景。
     */
    Parser.prototype.parseModifier = function (usage) {
        var _this = this;
        // 仅当：修饰符关键字 + 未换行 + 声明/变量开始 时才解析为修饰符。
        if (!tokenType_1.isModifier(this.lexer.peek().type)) {
            return;
        }
        return this.tryParse(function () {
            _this.lexer.read();
            if (_this.options.useStandardSemicolonInsertion && _this.lexer.peek().hasLineBreakBeforeStart)
                return;
            // 修饰符本身可能是变量名，推断之后的内容判断当前修饰符是否有效。
            switch (usage) {
                case 0 /* parameter */:
                    if (_this.lexer.peek().type === 98 /* comma */ ||
                        _this.lexer.peek().type === 102 /* closeParen */ ||
                        _this.lexer.peek().type === 105 /* colon */) {
                        return;
                    }
                case 1 /* property */:
                    if (_this.lexer.peek().type === 98 /* comma */ ||
                        _this.lexer.peek().type === 104 /* closeBrace */ ||
                        _this.lexer.peek().type === 105 /* colon */) {
                        return;
                    }
                case 2 /* declaration */:
                    if (!tokenType_1.isDeclarationStart(_this.lexer.peek().type)) {
                        return;
                    }
            }
            var result = new nodes.Modifier();
            result.type = _this.lexer.current.type;
            result.start = _this.lexer.current.type;
            return result;
        });
    };
    /**
     * 解析一个参数注解(`: number`)。
     * @param result 存放结果的对象。
     */
    Parser.prototype.parseTypeAnnotation = function (result) {
        if (result.colonToken = this.tryReadToken(105 /* colon */)) {
            result.type = this.parseTypeNode();
        }
    };
    /**
     * 解析一个初始值(`= 0`)。
     * @param result 存放结果的对象。
     */
    Parser.prototype.parseInitializer = function (result) {
        if (result.equalToken = this.tryReadToken(83 /* equals */)) {
            result.initializer = this.parseExpression();
        }
    };
    /**
     * 判断下一个字符是否可作为变量名。
     */
    Parser.prototype.isBindingName = function () {
        switch (this.lexer.peek().type) {
            case 22 /* identifier */:
            case 48 /* openBracket */:
            case 36 /* openBrace */:
                return true;
            default:
                return tokenType_1.isReservedWord(this.lexer.peek().type);
        }
    };
    // nodes.Ignore strict mode flag because we will report an error in type checker instead.
    Parser.prototype.isIdentifier = function () {
        if (this.lexer.peek().type === tokenType_1.TokenType.Identifier) {
            return true;
        }
        // nodes.If we have a 'yield' keyword, and we're in the [yield] context, then 'yield' is
        // considered a keyword and is not an identifier.
        if (this.lexer.peek().type === 43 /* yield */ && this.inYieldContext()) {
            return false;
        }
        // nodes.If we have a 'await' keyword, and we're in the [nodes.Await] context, then 'await' is
        // considered a keyword and is not an identifier.
        if (this.lexer.peek().type === 44 /* await */ && this.inAwaitContext()) {
            return false;
        }
        return this.lexer.peek().type > tokenType_1.TokenType.LastReservedWord;
    };
    /**
     * 解析一个函数类型节点(`()=>void`)或构造函数类型节点(`new ()=>void`)。
     * @param type 解析的类型。合法的值有：function、new
     */
    Parser.prototype.parseFunctionOrConstructorTypeNode = function (type, parameters) {
        var result = type === 38 /* new */ ? new nodes.ConstructorTypeNode() : new nodes.FunctionTypeNode();
        if (type === 38 /* new */)
            result.start = this.readToken(38 /* new */);
        this.parseMethodSignature(result, true, false, false, false);
        return result;
    };
    /**
     * 解析方法签名。
     * @param result 解析的结果。
     * @param returnToken 表示结果的返回类型。
     * @param yieldContext
     * @param awaitContext
     * @param requireCompleteParameterList
     */
    Parser.prototype.parseMethodSignature = function (result, isType, yieldContext, awaitContext, requireCompleteParameterList) {
        result.typeParameters = this.parseTypeParameterDeclarations();
        result.parameters = this.parseParameterDeclarations(yieldContext, awaitContext, requireCompleteParameterList);
        if (isType) {
            result.arrowToken = this.readToken(55 /* equalsGreaterThan */);
            result.returnType = this.parseTypeOrTypePredicate();
        }
        else if (this.tryReadToken(98 /* comma */)) {
            result.colonToken = this.lexer.current.start;
            result.returnType = this.parseTypeOrTypePredicate();
        }
    };
    /**
     * 解析一个泛型参数声明列表。
     */
    Parser.prototype.parseTypeParameterDeclarations = function () {
        if (this.lexer.peek().type === 54 /* lessThan */) {
            return this.parseDelimitedList(54 /* lessThan */, this.parseTypeParameterDeclaration, 67 /* greaterThan */);
        }
    };
    /**
     * 解析一个类型参数声明(`T`、`T extends R`)。
     */
    Parser.prototype.parseTypeParameterDeclaration = function () {
        // 当前必须是 < 或 , 才是类型参数开始。
        if (this.lexer.current.type !== 98 /* comma */ &&
            this.lexer.current.type !== 54 /* lessThan */)
            return;
        var result = new nodes.TypeParameterDeclaration();
        result.name = this.parseIdentifier();
        if (this.tryReadToken(140 /* extends */)) {
            result.extendsToken = this.lexer.current.start;
            result.extends = this.parseTypeNode();
        }
        if (this.tryReadToken(98 /* comma */)) {
            result.commaToken = this.lexer.current.start;
        }
        return result;
    };
    /**
     * 解析一个联合类型节点(`number | string`)或交错类型节点(`number & string`)。
     * @param type 解析的类型。合法的值有：|、&。
     */
    Parser.prototype.parseUnionOrIntersectionTypeOrHigher = function (type) {
        var result = type === 63 /* ampersand */ ? this.parseArrayTypeOrHigher() : this.parseUnionOrIntersectionTypeOrHigher(63 /* ampersand */);
        while (this.lexer.peek().type === type) {
            var newResult = type === 63 /* ampersand */ ? new nodes.IntersectionTypeNode() : new nodes.UnionTypeNode();
            newResult.leftOperand = result;
            newResult.operatorToken = this.readToken(type);
            newResult.rightOperand = type === 63 /* ampersand */ ? this.parseArrayTypeOrHigher() : this.parseUnionOrIntersectionTypeOrHigher(63 /* ampersand */);
            result = newResult;
        }
        return result;
    };
    Parser.prototype.parseTypeReference = function () {
        var typeName = this.parseEntityName(/*allowReservedWords*/ false, nodes.Diagnostics.Type_expected);
        var result = new nodes.TypeReferenceNode();
        result.typeName = typeName;
        if (!this.lexer.peek().hasLineBreakBeforeStart && this.lexer.peek().type === 54 /* lessThan */) {
            result.typeArguments = this.parseBracketedList(nodes.ParsingContext.TypeArguments, this.parseTypeNode, 54 /* lessThan */, 67 /* greaterThan */);
        }
        return result;
    };
    Parser.prototype.parseThisTypePredicate = function (lhs) {
        this.lexer.read().type;
        var result = this.createNode(tokenType_1.TokenType.TypePredicate, lhs.pos);
        result.parameterName = lhs;
        result.type = this.parseTypeNode();
        return result;
    };
    Parser.prototype.parseThisTypeNode = function () {
        var result = this.createNode(tokenType_1.TokenType.ThisType);
        this.lexer.read().type;
        return result;
    };
    Parser.prototype.parseTypeQuery = function () {
        var result = new nodes.TypeQueryNode();
        this.readToken(40 /* typeof */);
        result.exprName = this.parseEntityName(/*allowReservedWords*/ true);
        return result;
    };
    Parser.prototype.isStartOfParameter = function () {
        return this.lexer.peek().type === 56 /* dotDotDot */ || this.isIdentifierOrPattern() || isModifierKind(this.lexer.peek().type) || this.lexer.peek().type === 45 /* at */ || this.lexer.peek().type === 32 /* this */;
    };
    Parser.prototype.parseBindingElementInitializer = function (inParameter) {
        return inParameter ? this.parseParameterInitializer() : this.parseNonParameterInitializer();
    };
    Parser.prototype.parseParameterInitializer = function () {
        return this.parseInitializer(/*inParameter*/ true);
    };
    Parser.prototype.parseTypeMemberSemicolon = function () {
        // nodes.We allow type members to be separated by commas or (possibly nodes.ASI) semicolons.
        // nodes.First check if it was a comma.  nodes.If so, we're done with the member.
        if (this.tryReadToken(98 /* comma */)) {
            return;
        }
        // nodes.Didn't have a comma.  nodes.We must have a (possible nodes.ASI) semicolon.
        this.tryReadSemicolon();
    };
    Parser.prototype.parseSignatureMember = function (kind) {
        var result = new nodes.CallSignatureDeclaration | nodes.ConstructSignatureDeclaration();
        if (kind === tokenType_1.TokenType.ConstructSignature) {
            this.readToken(38 /* new */);
        }
        this.parseMethodSignature(105 /* colon */, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, result);
        this.parseTypeMemberSemicolon();
        return result;
    };
    Parser.prototype.isIndexSignature = function () {
        if (this.lexer.peek().type !== 48 /* openBracket */) {
            return false;
        }
        return this.lookAhead(this.isUnambiguouslyIndexSignature);
    };
    Parser.prototype.isUnambiguouslyIndexSignature = function () {
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
        if (this.lexer.peek().type === 56 /* dotDotDot */ || this.lexer.peek().type === 103 /* closeBracket */) {
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
        if (this.lexer.peek().type === 105 /* colon */ || this.lexer.peek().type === 98 /* comma */) {
            return true;
        }
        // nodes.Question mark could be an indexer with an optional property,
        // or it could be a conditional expression in a computed property.
        if (this.lexer.peek().type !== 97 /* question */) {
            return false;
        }
        // nodes.If any of the following tokens are after the question mark, it cannot
        // be a conditional expression, so treat it as an indexer.
        this.lexer.read().type;
        return this.lexer.peek().type === 105 /* colon */ || this.lexer.peek().type === 98 /* comma */ || this.lexer.peek().type === 103 /* closeBracket */;
    };
    Parser.prototype.parseIndexSignatureDeclaration = function (fullStart, decorators, modifiers) {
        var result = new nodes.IndexSignatureDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        result.parameters = this.parseBracketedList(nodes.ParsingContext.Parameters, this.parseParameterDeclaration, 48 /* openBracket */, 103 /* closeBracket */);
        result.type = this.parseTypeAnnotation();
        this.parseTypeMemberSemicolon();
        return result;
    };
    Parser.prototype.parsePropertyOrMethodSignature = function (fullStart, modifiers) {
        var name = this.parsePropertyName();
        var questionToken = this.tryReadTokenToken(97 /* question */);
        if (this.lexer.peek().type === 47 /* openParen */ || this.lexer.peek().type === 54 /* lessThan */) {
            var method = new nodes.MethodSignature();
            method.modifiers = modifiers;
            method.name = name;
            method.questionToken = questionToken;
            // nodes.Method signatures don't exist in expression contexts.  nodes.So they have neither
            // [nodes.Yield] nor [nodes.Await]
            this.parseMethodSignature(105 /* colon */, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, method);
            this.parseTypeMemberSemicolon();
            return this.finishNode(method);
        }
        else {
            var property = new nodes.PropertySignature();
            property.modifiers = modifiers;
            property.name = name;
            property.questionToken = questionToken;
            property.type = this.parseTypeAnnotation();
            if (this.lexer.peek().type === 83 /* equals */) {
                // nodes.Although type literal properties cannot not have initializers, we attempt
                // to parse an initializer so we can report in the checker that an interface
                // property or type literal property cannot have an initializer.
                property.initializer = this.parseNonParameterInitializer();
            }
            this.parseTypeMemberSemicolon();
            return this.finishNode(property);
        }
    };
    Parser.prototype.isTypeMemberStart = function () {
        var idToken;
        // nodes.Return true if we have the start of a signature member
        if (this.lexer.peek().type === 47 /* openParen */ || this.lexer.peek().type === 54 /* lessThan */) {
            return true;
        }
        // nodes.Eat up all modifiers, but hold on to the last one in case it is actually an identifier
        while (isModifierKind(this.lexer.peek().type)) {
            idToken = this.lexer.peek().type;
            this.lexer.read().type;
        }
        // nodes.Index signatures and computed property names are type members
        if (this.lexer.peek().type === 48 /* openBracket */) {
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
            return this.lexer.peek().type === 47 /* openParen */ ||
                this.lexer.peek().type === 54 /* lessThan */ ||
                this.lexer.peek().type === 97 /* question */ ||
                this.lexer.peek().type === 105 /* colon */ ||
                this.canParseSemicolon();
        }
        return false;
    };
    Parser.prototype.parseTypeMember = function () {
        if (this.lexer.peek().type === 47 /* openParen */ || this.lexer.peek().type === 54 /* lessThan */) {
            return this.parseSignatureMember(tokenType_1.TokenType.CallSignature);
        }
        if (this.lexer.peek().type === 38 /* new */ && this.lookAhead(this.isStartOfConstructSignature)) {
            return this.parseSignatureMember(tokenType_1.TokenType.ConstructSignature);
        }
        var fullStart = this.getNodePos();
        var modifiers = this.parseModifierList();
        if (this.isIndexSignature()) {
            return this.parseIndexSignatureDeclaration(fullStart, /*decorators*/ undefined, modifiers);
        }
        return this.parsePropertyOrMethodSignature(fullStart, modifiers);
    };
    Parser.prototype.isStartOfConstructSignature = function () {
        this.lexer.read().type;
        return this.lexer.peek().type === 47 /* openParen */ || this.lexer.peek().type === 54 /* lessThan */;
    };
    Parser.prototype.parseTypeLiteral = function () {
        var result = new nodes.TypeLiteralNode();
        result.members = this.parseObjectTypeMembers();
        return result;
    };
    Parser.prototype.parseObjectTypeMembers = function () {
        var members;
        if (this.readToken(36 /* openBrace */)) {
            members = this.parseList(nodes.ParsingContext.TypeMembers, this.parseTypeMember);
            this.readToken(104 /* closeBrace */);
        }
        else {
            members = this.createMissingList();
        }
        return members;
    };
    /**
     * 解析一个元祖类型节点(`[string, number]`)。
     */
    Parser.prototype.parseTupleType = function () {
        var result = new nodes.TupleTypeNode();
        result.elements = this.parseArrayElements(this.parseTypeNode);
        return result;
    };
    Parser.prototype.parseParenthesizedType = function () {
        var result = new nodes.ParenthesizedTypeNode();
        this.readToken(47 /* openParen */);
        result.type = this.parseTypeNode();
        this.readToken(102 /* closeParen */);
        return result;
    };
    Parser.prototype.parseKeywordAndNoDot = function () {
        var result = this.parseTokenNode();
        return this.lexer.peek().type === 59 /* dot */ ? undefined : result;
    };
    Parser.prototype.parseNonArrayType = function () {
        switch (this.lexer.peek().type) {
            case 150 /* any */:
            case 153 /* string */:
            case 152 /* number */:
            case 151 /* boolean */:
            case 154 /* symbol */:
            case 146 /* undefined */:
            case 155 /* never */:
                // nodes.If these are followed by a dot, then parse these out as a dotted type reference instead.
                var result = this.tryParse(this.parseKeywordAndNoDot);
                return result || this.parseTypeReference();
            case tokenType_1.TokenType.StringLiteral:
                return this.parseStringLiteralTypeNode();
            case 41 /* void */:
            case 29 /* null */:
                return this.parseTokenNode();
            case 32 /* this */: {
                var thisKeyword = this.parseThisTypeNode();
                if (this.lexer.peek().type === 100 /* is */ && !this.lexer.peek().hasLineBreakBeforeStart) {
                    return this.parseThisTypePredicate(thisKeyword);
                }
                else {
                    return thisKeyword;
                }
            }
            case 40 /* typeof */:
                return this.parseTypeQuery();
            case 36 /* openBrace */:
                return this.parseTypeLiteral();
            case 48 /* openBracket */:
                return this.parseTupleType();
            case 47 /* openParen */:
                return this.parseParenthesizedType();
            default:
                return this.parseTypeReference();
        }
    };
    Parser.prototype.isStartOfType = function () {
        switch (this.lexer.peek().type) {
            case 150 /* any */:
            case 153 /* string */:
            case 152 /* number */:
            case 151 /* boolean */:
            case 154 /* symbol */:
            case 41 /* void */:
            case 146 /* undefined */:
            case 29 /* null */:
            case 32 /* this */:
            case 40 /* typeof */:
            case 155 /* never */:
            case 36 /* openBrace */:
            case 48 /* openBracket */:
            case 54 /* lessThan */:
            case 38 /* new */:
            case tokenType_1.TokenType.StringLiteral:
                return true;
            case 47 /* openParen */:
                // nodes.Only consider '(' the start of a type if followed by ')', '...', an identifier, a modifier,
                // or something that starts a type. nodes.We don't want to consider things like '(1)' a type.
                return this.lookAhead(this.isStartOfParenthesizedOrFunctionType);
            default:
                return this.isIdentifier();
        }
    };
    Parser.prototype.isStartOfParenthesizedOrFunctionType = function () {
        this.lexer.read().type;
        return this.lexer.peek().type === 102 /* closeParen */ || this.isStartOfParameter() || this.isStartOfType();
    };
    Parser.prototype.parseArrayTypeOrHigher = function () {
        var type = this.parseNonArrayType();
        while (!this.lexer.peek().hasLineBreakBeforeStart && this.tryReadToken(48 /* openBracket */)) {
            this.readToken(103 /* closeBracket */);
            var result = new nodes.ArrayTypeNode();
            result.elementType = type;
            type = result;
        }
        return type;
    };
    Parser.prototype.parseTypeOrTypePredicate = function () {
        var typePredicateVariable = this.isIdentifier() && this.tryParse(this.parseTypePredicatePrefix);
        var type = this.parseTypeNode();
        if (typePredicateVariable) {
            var result = new nodes.TypePredicateNode();
            result.parameterName = typePredicateVariable;
            result.type = type;
            return result;
        }
        else {
            return type;
        }
    };
    Parser.prototype.parseTypePredicatePrefix = function () {
        var id = this.parseIdentifier();
        if (this.lexer.peek().type === 100 /* is */ && !this.lexer.peek().hasLineBreakBeforeStart) {
            this.lexer.read().type;
            return id;
        }
    };
    // #endregion
    // #region 解析表达式
    /**
     * 读取一个标识符或可降级为标识符的关键字。
     * @param allowES3Keyword 是否允许将普通关键字作为标识符解析。
     * @return 返回标识符节点。
     */
    Parser.prototype.readIdentifier = function (allowES3Keyword) {
        if (this.lexer.peek().type === 22 /* identifier */ || (allowES3Keyword ? tokenType_1.isKeyword(this.lexer.peek().type) : tokenType_1.isReservedWord(this.lexer.peek().type))) {
            return this.parseIdentifier();
        }
        this.expectToken(22 /* identifier */);
        var result = new nodes.Identifier();
        result.start = result.end = this.lexer.current.end;
        return result;
    };
    // nodes.EXPRESSIONS
    Parser.prototype.isStartOfLeftHandSideExpression = function () {
        switch (this.lexer.peek().type) {
            case 32 /* this */:
            case 33 /* super */:
            case 29 /* null */:
            case 30 /* true */:
            case 31 /* false */:
            case tokenType_1.TokenType.NumericLiteral:
            case tokenType_1.TokenType.StringLiteral:
            case tokenType_1.TokenType.NoSubstitutionTemplateLiteral:
            case tokenType_1.TokenType.TemplateHead:
            case 47 /* openParen */:
            case 48 /* openBracket */:
            case 36 /* openBrace */:
            case 20 /* function */:
            case 18 /* class */:
            case 38 /* new */:
            case 51 /* slash */:
            case 87 /* slashEquals */:
            case tokenType_1.TokenType.Identifier:
                return true;
            default:
                return this.isIdentifier();
        }
    };
    Parser.prototype.isStartOfExpression = function () {
        if (this.isStartOfLeftHandSideExpression()) {
            return true;
        }
        switch (this.lexer.peek().type) {
            case 49 /* plus */:
            case 50 /* minus */:
            case 42 /* tilde */:
            case 37 /* exclamation */:
            case 39 /* delete */:
            case 40 /* typeof */:
            case 41 /* void */:
            case 52 /* plusPlus */:
            case 53 /* minusMinus */:
            case 54 /* lessThan */:
            case 44 /* await */:
            case 43 /* yield */:
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
    };
    Parser.prototype.isStartOfExpressionStatement = function () {
        // nodes.As per the grammar, none of '{' or 'function' or 'class' can start an expression statement.
        return this.lexer.peek().type !== 36 /* openBrace */ &&
            this.lexer.peek().type !== 20 /* function */ &&
            this.lexer.peek().type !== 18 /* class */ &&
            this.lexer.peek().type !== 45 /* at */ &&
            this.isStartOfExpression();
    };
    Parser.prototype.parseExpression = function () {
        // nodes.Expression[in]:
        //      nodes.AssignmentExpression[in]
        //      nodes.Expression[in] , nodes.AssignmentExpression[in]
        // clear the decorator context when parsing nodes.Expression, as it should be unambiguous when parsing a decorator
        var saveDecoratorContext = this.inDecoratorContext();
        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ false);
        }
        var expr = this.parseAssignmentExpressionOrHigher();
        var operatorToken;
        while ((operatorToken = this.tryReadTokenToken(98 /* comma */))) {
            expr = this.makeBinaryExpression(expr, operatorToken, this.parseAssignmentExpressionOrHigher());
        }
        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ true);
        }
        return expr;
    };
    Parser.prototype.parseInitializer = function (inParameter) {
        if (this.lexer.peek().type !== 83 /* equals */) {
            // It's not uncommon during typing for the user to miss writing the '=' this.lexer.peek().type.  Check if
            // there is no newline after the last this.lexer.peek().type and if we're on an expression.  If so, parse
            // this as an equals-value clause with a missing equals.
            // NOTE: There are two places where we allow equals-value clauses.  The first is in a
            // variable declarator.  The second is with a parameter.  For variable declarators
            // it's more likely that a { would be a allowed (as an object literal).  While this
            // is also allowed for parameters, the risk is that we consume the { as an object
            // literal when it really will be for the block following the parameter.
            if (this.lexer.peek().hasLineBreakBeforeStart || (inParameter && this.lexer.peek().type === 36 /* openBrace */) || !this.isStartOfExpression()) {
                // preceding line break, open brace in a parameter (likely a function body) or current this.lexer.peek().type is not an expression -
                // do not try to parse initializer
                return undefined;
            }
        }
        // nodes.Initializer[nodes.In, nodes.Yield] :
        //     = nodes.AssignmentExpression[?nodes.In, ?nodes.Yield]
        this.readToken(83 /* equals */);
        return this.parseAssignmentExpressionOrHigher();
    };
    Parser.prototype.parseAssignmentExpressionOrHigher = function () {
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
        var arrowExpression = this.tryParseParenthesizedArrowFunctionExpression() || this.tryParseAsyncSimpleArrowFunctionExpression();
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
        var expr = this.parseBinaryExpressionOrHigher(/*precedence*/ 0);
        // nodes.To avoid a look-ahead, we did not handle the case of an arrow function with a single un-parenthesized
        // parameter ('x => ...') above. nodes.We handle it here by checking if the parsed expression was a single
        // identifier and the current this.lexer.peek().type is an arrow.
        if (expr.kind === tokenType_1.TokenType.Identifier && this.lexer.peek().type === 55 /* equalsGreaterThan */) {
            return this.parseSimpleArrowFunctionExpression(expr);
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
    };
    Parser.prototype.isYieldExpression = function () {
        if (this.lexer.peek().type === 43 /* yield */) {
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
    };
    Parser.prototype.nextTokenIsIdentifierOnSameLine = function () {
        this.lexer.read().type;
        return !this.lexer.peek().hasLineBreakBeforeStart && this.isIdentifier();
    };
    Parser.prototype.parseYieldExpression = function () {
        var result = new nodes.YieldExpression();
        // nodes.YieldExpression[nodes.In] :
        //      yield
        //      yield [no nodes.LineTerminator here] [nodes.Lexical goal nodes.InputElementRegExp]nodes.AssignmentExpression[?nodes.In, nodes.Yield]
        //      yield [no nodes.LineTerminator here] * [nodes.Lexical goal nodes.InputElementRegExp]nodes.AssignmentExpression[?nodes.In, nodes.Yield]
        this.lexer.read().type;
        if (!this.lexer.peek().hasLineBreakBeforeStart &&
            (this.lexer.peek().type === 62 /* asterisk */ || this.isStartOfExpression())) {
            result.asteriskToken = this.tryReadTokenToken(62 /* asterisk */);
            result.expression = this.parseAssignmentExpressionOrHigher();
            return result;
        }
        else {
            // if the next this.lexer.peek().type is not on the same line as yield.  or we don't have an '*' or
            // the start of an expression, then this is just a simple "yield" expression.
            return result;
        }
    };
    Parser.prototype.parseSimpleArrowFunctionExpression = function (identifier, asyncModifier) {
        console.assert(this.lexer.peek().type === 55 /* equalsGreaterThan */, "this.parseSimpleArrowFunctionExpression should only have been called if we had a =>");
        var result;
        if (asyncModifier) {
            result = new nodes.ArrowFunction();
            result.modifiers = asyncModifier;
        }
        else {
            result = new nodes.ArrowFunction();
        }
        var parameter = new nodes.ParameterDeclaration();
        parameter.name = identifier;
        this.finishNode(parameter);
        result.parameters = [parameter];
        result.parameters.pos = parameter.pos;
        result.parameters.end = parameter.end;
        result.equalsGreaterThanToken = this.readTokenToken(55 /* equalsGreaterThan */, /*reportAtCurrentPosition*/ false, nodes.Diagnostics._0_expected, "=>");
        result.body = this.parseArrowFunctionExpressionBody(/*isAsync*/ !!asyncModifier);
        return result;
    };
    Parser.prototype.tryParseParenthesizedArrowFunctionExpression = function () {
        var triState = this.isParenthesizedArrowFunctionExpression();
        if (triState === nodes.Tristate.False) {
            // nodes.It's definitely not a parenthesized arrow function expression.
            return undefined;
        }
        // nodes.If we definitely have an arrow function, then we can just parse one, not requiring a
        // following => or { this.lexer.peek().type. nodes.Otherwise, we *might* have an arrow function.  nodes.Try to parse
        // it out, but don't allow any ambiguity, and return 'undefined' if this could be an
        // expression instead.
        var arrowFunction = triState === nodes.Tristate.True
            ? this.parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ true)
            : this.tryParse(this.parsePossibleParenthesizedArrowFunctionExpressionHead);
        if (!arrowFunction) {
            // nodes.Didn't appear to actually be a parenthesized arrow function.  nodes.Just bail out.
            return undefined;
        }
        var isAsync = !!(arrowFunction.flags & nodes.NodeFlags.Async);
        // nodes.If we have an arrow, then try to parse the body. nodes.Even if not, try to parse if we
        // have an opening brace, just in case we're in an error state.
        var lastToken = this.lexer.peek().type;
        arrowFunction.equalsGreaterThanToken = this.readTokenToken(55 /* equalsGreaterThan */, /*reportAtCurrentPosition*/ false, nodes.Diagnostics._0_expected, "=>");
        arrowFunction.body = (lastToken === 55 /* equalsGreaterThan */ || lastToken === 36 /* openBrace */)
            ? this.parseArrowFunctionExpressionBody(isAsync)
            : this.parseIdentifier();
        return this.finishNode(arrowFunction);
    };
    //  nodes.True        -> nodes.We definitely expect a parenthesized arrow function here.
    //  nodes.False       -> nodes.There *cannot* be a parenthesized arrow function here.
    //  nodes.Unknown     -> nodes.There *might* be a parenthesized arrow function here.
    //                 nodes.Speculatively look ahead to be sure, and rollback if not.
    Parser.prototype.isParenthesizedArrowFunctionExpression = function () {
        if (this.lexer.peek().type === 47 /* openParen */ || this.lexer.peek().type === 54 /* lessThan */ || this.lexer.peek().type === 7 /* async */) {
            return this.lookAhead(this.isParenthesizedArrowFunctionExpressionWorker);
        }
        if (this.lexer.peek().type === 55 /* equalsGreaterThan */) {
            // nodes.ERROR nodes.RECOVERY nodes.TWEAK:
            // nodes.If we see a standalone => try to parse it as an arrow function expression as that's
            // likely what the user intended to write.
            return nodes.Tristate.True;
        }
        // nodes.Definitely not a parenthesized arrow function.
        return nodes.Tristate.False;
    };
    Parser.prototype.isParenthesizedArrowFunctionExpressionWorker = function () {
        var _this = this;
        if (this.lexer.peek().type === 7 /* async */) {
            this.lexer.read().type;
            if (this.lexer.peek().hasLineBreakBeforeStart) {
                return nodes.Tristate.False;
            }
            if (this.lexer.peek().type !== 47 /* openParen */ && this.lexer.peek().type !== 54 /* lessThan */) {
                return nodes.Tristate.False;
            }
        }
        var first = this.lexer.peek().type;
        var second = this.lexer.read().type;
        if (first === 47 /* openParen */) {
            if (second === 102 /* closeParen */) {
                // nodes.Simple cases: "() =>", "(): ", and  "() {".
                // nodes.This is an arrow function with no parameters.
                // nodes.The last one is not actually an arrow function,
                // but this is probably what the user intended.
                var third = this.lexer.read().type;
                switch (third) {
                    case 55 /* equalsGreaterThan */:
                    case 105 /* colon */:
                    case 36 /* openBrace */:
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
            if (second === 48 /* openBracket */ || second === 36 /* openBrace */) {
                return nodes.Tristate.Unknown;
            }
            // nodes.Simple case: "(..."
            // nodes.This is an arrow function with a rest parameter.
            if (second === 56 /* dotDotDot */) {
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
            if (this.lexer.read().type === 105 /* colon */) {
                return nodes.Tristate.True;
            }
            // nodes.This *could* be a parenthesized arrow function.
            // nodes.Return nodes.Unknown to let the caller know.
            return nodes.Tristate.Unknown;
        }
        else {
            console.assert(first === 54 /* lessThan */);
            // nodes.If we have "<" not followed by an identifier,
            // then this definitely is not an arrow function.
            if (!this.isIdentifier()) {
                return nodes.Tristate.False;
            }
            // nodes.JSX overrides
            if (this.sourceFile.languageVariant === nodes.LanguageVariant.JSX) {
                var isArrowFunctionInJsx = this.lookAhead(function () {
                    var third = _this.lexer.read().type;
                    if (third === 140 /* extends */) {
                        var fourth = _this.lexer.read().type;
                        switch (fourth) {
                            case 83 /* equals */:
                            case 67 /* greaterThan */:
                                return false;
                            default:
                                return true;
                        }
                    }
                    else if (third === 98 /* comma */) {
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
    };
    Parser.prototype.parsePossibleParenthesizedArrowFunctionExpressionHead = function () {
        return this.parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ false);
    };
    Parser.prototype.tryParseAsyncSimpleArrowFunctionExpression = function () {
        // nodes.We do a check here so that we won't be doing unnecessarily call to "this.lookAhead"
        if (this.lexer.peek().type === 7 /* async */) {
            var isUnParenthesizedAsyncArrowFunction = this.lookAhead(this.isUnParenthesizedAsyncArrowFunctionWorker);
            if (isUnParenthesizedAsyncArrowFunction === nodes.Tristate.True) {
                var asyncModifier = this.parseModifiersForArrowFunction();
                var expr = this.parseBinaryExpressionOrHigher(/*precedence*/ 0);
                return this.parseSimpleArrowFunctionExpression(expr, asyncModifier);
            }
        }
        return undefined;
    };
    Parser.prototype.isUnParenthesizedAsyncArrowFunctionWorker = function () {
        // nodes.AsyncArrowFunctionExpression:
        //      1) async[no nodes.LineTerminator here]nodes.AsyncArrowBindingIdentifier[?nodes.Yield][no nodes.LineTerminator here]=>nodes.AsyncConciseBody[?nodes.In]
        //      2) nodes.CoverCallExpressionAndAsyncArrowHead[?nodes.Yield, ?nodes.Await][no nodes.LineTerminator here]=>nodes.AsyncConciseBody[?nodes.In]
        if (this.lexer.peek().type === 7 /* async */) {
            this.lexer.read().type;
            // nodes.If the "async" is followed by "=>" this.lexer.peek().type then it is not a begining of an async arrow-function
            // but instead a simple arrow-function which will be parsed inside "this.parseAssignmentExpressionOrHigher"
            if (this.lexer.peek().hasLineBreakBeforeStart || this.lexer.peek().type === 55 /* equalsGreaterThan */) {
                return nodes.Tristate.False;
            }
            // nodes.Check for un-parenthesized nodes.AsyncArrowFunction
            var expr = this.parseBinaryExpressionOrHigher(/*precedence*/ 0);
            if (!this.lexer.peek().hasLineBreakBeforeStart && expr.kind === tokenType_1.TokenType.Identifier && this.lexer.peek().type === 55 /* equalsGreaterThan */) {
                return nodes.Tristate.True;
            }
        }
        return nodes.Tristate.False;
    };
    Parser.prototype.parseParenthesizedArrowFunctionExpressionHead = function (allowAmbiguity) {
        var result = new nodes.ArrowFunction();
        result.modifiers = this.parseModifiersForArrowFunction();
        var isAsync = !!(result.flags & nodes.NodeFlags.Async);
        // nodes.Arrow functions are never generators.
        //
        // nodes.If we're speculatively parsing a signature for a parenthesized arrow function, then
        // we have to have a complete parameter list.  nodes.Otherwise we might see something like
        // a => (b => c)
        // nodes.And think that "(b =>" was actually a parenthesized arrow function with a missing
        // close paren.
        this.parseMethodSignature(105 /* colon */, /*yieldContext*/ false, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ !allowAmbiguity, result);
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
        if (!allowAmbiguity && this.lexer.peek().type !== 55 /* equalsGreaterThan */ && this.lexer.peek().type !== 36 /* openBrace */) {
            // nodes.Returning undefined here will cause our caller to rewind to where we started from.
            return undefined;
        }
        return result;
    };
    Parser.prototype.parseArrowFunctionExpressionBody = function (isAsync) {
        if (this.lexer.peek().type === 36 /* openBrace */) {
            return this.parseFunctionBlock(/*allowYield*/ false, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);
        }
        if (this.lexer.peek().type !== 106 /* semicolon */ &&
            this.lexer.peek().type !== 20 /* function */ &&
            this.lexer.peek().type !== 18 /* class */ &&
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
    };
    Parser.prototype.parseConditionalExpressionRest = function (leftOperand) {
        // nodes.Note: we are passed in an expression which was produced from this.parseBinaryExpressionOrHigher.
        var questionToken = this.tryReadTokenToken(97 /* question */);
        if (!questionToken) {
            return leftOperand;
        }
        // nodes.Note: we explicitly 'allowIn' in the whenTrue part of the condition expression, and
        // we do not that for the 'whenFalse' part.
        var result = new nodes.ConditionalExpression();
        result.condition = leftOperand;
        result.questionToken = questionToken;
        result.whenTrue = this.doOutsideOfContext(this.disallowInAndDecoratorContext, this.parseAssignmentExpressionOrHigher);
        result.colonToken = this.readTokenToken(105 /* colon */, /*reportAtCurrentPosition*/ false, nodes.Diagnostics._0_expected, tokenType_1.tokenToString(105 /* colon */));
        result.whenFalse = this.parseAssignmentExpressionOrHigher();
        return result;
    };
    Parser.prototype.parseBinaryExpressionOrHigher = function (precedence) {
        var leftOperand = this.parseUnaryExpressionOrHigher();
        return this.parseBinaryExpressionRest(precedence, leftOperand);
    };
    Parser.prototype.isInOrOfKeyword = function (t) {
        return t === 64 /* in */ || t === 142 /* of */;
    };
    Parser.prototype.parseBinaryExpressionRest = function (precedence, leftOperand) {
        while (true) {
            // nodes.We either have a binary operator here, or we're finished.  nodes.We call
            // this.reScanGreaterToken so that we merge this.lexer.peek().type sequences like > and = into >=
            this.reScanGreaterToken();
            var newPrecedence = getBinaryOperatorPrecedence();
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
            var consumeCurrentOperator = this.lexer.peek().type === 81 /* asteriskAsterisk */ ?
                newPrecedence >= precedence :
                newPrecedence > precedence;
            if (!consumeCurrentOperator) {
                break;
            }
            if (this.lexer.peek().type === 64 /* in */ && this.inDisallowInContext()) {
                break;
            }
            if (this.lexer.peek().type === 99 /* as */) {
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
    };
    Parser.prototype.isBinaryOperator = function () {
        if (this.inDisallowInContext() && this.lexer.peek().type === 64 /* in */) {
            return false;
        }
        return getBinaryOperatorPrecedence() > 0;
    };
    Parser.prototype.makeBinaryExpression = function (left, operatorToken, right) {
        var result = new nodes.BinaryExpression();
        result.left = left;
        result.operatorToken = operatorToken;
        result.right = right;
        return result;
    };
    Parser.prototype.makeAsExpression = function (left, right) {
        var result = new nodes.AsExpression();
        result.expression = left;
        result.type = right;
        return result;
    };
    Parser.prototype.parsePrefixUnaryExpression = function () {
        var result = new nodes.PrefixUnaryExpression();
        result.operator = this.lexer.peek().type;
        this.lexer.read().type;
        result.operand = this.parseSimpleUnaryExpression();
        return result;
    };
    Parser.prototype.parseDeleteExpression = function () {
        var result = new nodes.DeleteExpression();
        this.lexer.read().type;
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    };
    Parser.prototype.parseTypeOfExpression = function () {
        var result = new nodes.TypeOfExpression();
        this.lexer.read().type;
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    };
    Parser.prototype.parseVoidExpression = function () {
        var result = new nodes.VoidExpression();
        this.lexer.read().type;
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    };
    Parser.prototype.isAwaitExpression = function () {
        if (this.lexer.peek().type === 44 /* await */) {
            if (this.inAwaitContext()) {
                return true;
            }
            // here we are using similar heuristics as 'this.isYieldExpression'
            return this.lookAhead(this.nextTokenIsIdentifierOnSameLine);
        }
        return false;
    };
    Parser.prototype.parseAwaitExpression = function () {
        var result = new nodes.AwaitExpression();
        this.lexer.read().type;
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    };
    /**
     * nodes.Parse nodes.ES7 unary expression and await expression
     *
     * nodes.ES7 nodes.UnaryExpression:
     *      1) nodes.SimpleUnaryExpression[?yield]
     *      2) nodes.IncrementExpression[?yield] ** nodes.UnaryExpression[?yield]
     */
    Parser.prototype.parseUnaryExpressionOrHigher = function () {
        if (this.isAwaitExpression()) {
            return this.parseAwaitExpression();
        }
        if (this.isIncrementExpression()) {
            var incrementExpression = this.parseIncrementExpression();
            return this.lexer.peek().type === 81 /* asteriskAsterisk */ ?
                this.parseBinaryExpressionRest(getBinaryOperatorPrecedence(), incrementExpression) :
                incrementExpression;
        }
        var unaryOperator = this.lexer.peek().type;
        var simpleUnaryExpression = this.parseSimpleUnaryExpression();
        if (this.lexer.peek().type === 81 /* asteriskAsterisk */) {
            var start = skipTrivia(this.sourceText, simpleUnaryExpression.pos);
            if (simpleUnaryExpression.kind === tokenType_1.TokenType.TypeAssertionExpression) {
                this.parseErrorAtPosition(start, simpleUnaryExpression.end - start, nodes.Diagnostics.A_type_assertion_expression_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses);
            }
            else {
                this.parseErrorAtPosition(start, simpleUnaryExpression.end - start, nodes.Diagnostics.An_unary_expression_with_the_0_operator_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses, tokenType_1.tokenToString(unaryOperator));
            }
        }
        return simpleUnaryExpression;
    };
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
    Parser.prototype.parseSimpleUnaryExpression = function () {
        switch (this.lexer.peek().type) {
            case 49 /* plus */:
            case 50 /* minus */:
            case 42 /* tilde */:
            case 37 /* exclamation */:
                return this.parsePrefixUnaryExpression();
            case 39 /* delete */:
                return this.parseDeleteExpression();
            case 40 /* typeof */:
                return this.parseTypeOfExpression();
            case 41 /* void */:
                return this.parseVoidExpression();
            case 54 /* lessThan */:
                // nodes.This is modified nodes.UnaryExpression grammar in nodes.TypeScript
                //  nodes.UnaryExpression (modified):
                //      < type > nodes.UnaryExpression
                return this.parseTypeAssertion();
            default:
                return this.parseIncrementExpression();
        }
    };
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
    Parser.prototype.isIncrementExpression = function () {
        // nodes.This function is called inside parseUnaryExpression to decide
        // whether to call this.parseSimpleUnaryExpression or call this.parseIncrementExpression directly
        switch (this.lexer.peek().type) {
            case 49 /* plus */:
            case 50 /* minus */:
            case 42 /* tilde */:
            case 37 /* exclamation */:
            case 39 /* delete */:
            case 40 /* typeof */:
            case 41 /* void */:
                return false;
            case 54 /* lessThan */:
                // nodes.If we are not in nodes.JSX context, we are parsing nodes.TypeAssertion which is an nodes.UnaryExpression
                if (this.sourceFile.languageVariant !== nodes.LanguageVariant.JSX) {
                    return false;
                }
            // nodes.We are in nodes.JSX context and the this.lexer.peek().type is part of nodes.JSXElement.
            // nodes.Fall through
            default:
                return true;
        }
    };
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
    Parser.prototype.parseIncrementExpression = function () {
        if (this.lexer.peek().type === 52 /* plusPlus */ || this.lexer.peek().type === 53 /* minusMinus */) {
            var result = new nodes.PrefixUnaryExpression();
            result.operator = this.lexer.peek().type;
            this.lexer.read().type;
            result.operand = this.parseLeftHandSideExpressionOrHigher();
            return result;
        }
        else if (this.sourceFile.languageVariant === nodes.LanguageVariant.JSX && this.lexer.peek().type === 54 /* lessThan */ && this.lookAhead(this.nextTokenIsIdentifierOrKeyword)) {
            // nodes.JSXElement is part of primaryExpression
            return this.parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ true);
        }
        var expression = this.parseLeftHandSideExpressionOrHigher();
        console.assert(isLeftHandSideExpression(expression));
        if ((this.lexer.peek().type === 52 /* plusPlus */ || this.lexer.peek().type === 53 /* minusMinus */) && !this.lexer.peek().hasLineBreakBeforeStart) {
            var result = new nodes.PostfixUnaryExpression();
            result.operand = expression;
            result.operator = this.lexer.peek().type;
            this.lexer.read().type;
            return result;
        }
        return expression;
    };
    Parser.prototype.parseLeftHandSideExpressionOrHigher = function () {
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
        var expression = this.lexer.peek().type === 33 /* super */
            ? this.parseSuperExpression()
            : this.parseMemberExpressionOrHigher();
        // nodes.Now, we *may* be complete.  nodes.However, we might have consumed the start of a
        // nodes.CallExpression.  nodes.As such, we need to consume the rest of it here to be complete.
        return this.parseCallExpressionRest(expression);
    };
    Parser.prototype.parseMemberExpressionOrHigher = function () {
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
        var expression = this.parsePrimaryExpression();
        return this.parseMemberExpressionRest(expression);
    };
    Parser.prototype.parseSuperExpression = function () {
        var expression = this.parseTokenNode();
        if (this.lexer.peek().type === 47 /* openParen */ || this.lexer.peek().type === 59 /* dot */ || this.lexer.peek().type === 48 /* openBracket */) {
            return expression;
        }
        // nodes.If we have seen "super" it must be followed by '(' or '.'.
        // nodes.If it wasn't then just try to parse out a '.' and report an error.
        var result = new nodes.PropertyAccessExpression();
        result.expression = expression;
        this.readTokenToken(59 /* dot */, /*reportAtCurrentPosition*/ false, nodes.Diagnostics.super_must_be_followed_by_an_argument_list_or_member_access);
        result.name = this.parseRightSideOfDot(/*allowIdentifierNames*/ true);
        return result;
    };
    Parser.prototype.tagNamesAreEquivalent = function (lhs, rhs) {
        if (lhs.kind !== rhs.kind) {
            return false;
        }
        if (lhs.kind === tokenType_1.TokenType.Identifier) {
            return lhs.text === rhs.text;
        }
        if (lhs.kind === 32 /* this */) {
            return true;
        }
        // nodes.If we are at this statement then we must have nodes.PropertyAccessExpression and because tag name in nodes.Jsx element can only
        // take forms of nodes.JsxTagNameExpression which includes an identifier, "this" expression, or another propertyAccessExpression
        // it is safe to case the expression property as such. nodes.See this.parseJsxElementName for how we parse tag name in nodes.Jsx element
        return lhs.name.text === rhs.name.text &&
            this.tagNamesAreEquivalent(lhs.expression, rhs.expression);
    };
    Parser.prototype.parseJsxElementOrSelfClosingElement = function (inExpressionContext) {
        var _this = this;
        var opening = this.parseJsxOpeningOrSelfClosingElement(inExpressionContext);
        let;
        this.result;
        nodes.JsxElement | nodes.JsxSelfClosingElement;
        if (opening.kind === tokenType_1.TokenType.JsxOpeningElement) {
            var result = new nodes.JsxElement();
            result.openingElement = opening;
            result.children = this.parseJsxChildren(result.openingElement.tagName);
            result.closingElement = this.parseJsxClosingElement(inExpressionContext);
            if (!this.tagNamesAreEquivalent(result.openingElement.tagName, result.closingElement.tagName)) {
                this.parseErrorAtPosition(result.closingElement.pos, result.closingElement.end - result.closingElement.pos, nodes.Diagnostics.Expected_corresponding_JSX_closing_tag_for_0, getTextOfNodeFromSourceText(this.sourceText, result.openingElement.tagName));
            }
            this.result = result;
        }
        else {
            console.assert(opening.kind === tokenType_1.TokenType.JsxSelfClosingElement);
            // nodes.Nothing else to do for self-closing elements
            this.result = opening;
        }
        // nodes.If the user writes the invalid code '<div></div><div></div>' in an expression context (i.e. not wrapped in
        // an enclosing tag), we'll naively try to parse   ^ this as a 'less than' operator and the remainder of the tag
        // as garbage, which will cause the formatter to badly mangle the nodes.JSX. nodes.Perform a speculative parse of a nodes.JSX
        // element if we see a < this.lexer.peek().type so that we can wrap it in a synthetic binary expression so the formatter
        // does less damage and we can report a better error.
        // nodes.Since nodes.JSX elements are invalid < operands anyway, this lookahead parse will only occur in error scenarios
        // of one sort or another.
        if (inExpressionContext && this.lexer.peek().type === 54 /* lessThan */) {
            var invalidElement = this.tryParse(function () { return _this.parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ true); });
            if (invalidElement) {
                this.parseErrorAtCurrentToken(nodes.Diagnostics.JSX_expressions_must_have_one_parent_element);
                var badNode = new nodes.BinaryExpression();
                badNode.end = invalidElement.end;
                badNode.left = this.result;
                badNode.right = invalidElement;
                badNode.operatorToken = this.createMissingNode(98 /* comma */, /*reportAtCurrentPosition*/ false, /*diagnosticMessage*/ undefined);
                badNode.operatorToken.pos = badNode.operatorToken.end = badNode.right.pos;
                return badNode;
            }
        }
        return this.result;
    };
    Parser.prototype.parseJsxText = function () {
        var result = new nodes.JsxText();
        this.lexer.peek().type = this.lexer.scanJsxToken();
        return result;
    };
    Parser.prototype.parseJsxChild = function () {
        switch (this.lexer.peek().type) {
            case tokenType_1.TokenType.JsxText:
                return this.parseJsxText();
            case 36 /* openBrace */:
                return this.parseJsxExpression(/*inExpressionContext*/ false);
            case 54 /* lessThan */:
                return this.parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ false);
        }
        nodes.Debug.fail("nodes.Unknown nodes.JSX child kind " + this.lexer.peek().type);
    };
    Parser.prototype.parseJsxChildren = function (openingTagName) {
        var ;
        this.result = [];
        this.result.pos = this.lexer.getStartPos();
        var saveParsingContext = this.parsingContext;
        this.parsingContext |= 1 << nodes.ParsingContext.JsxChildren;
        while (true) {
            this.lexer.peek().type = this.lexer.reScanJsxToken();
            if (this.lexer.peek().type === tokenType_1.TokenType.lessThanSlash) {
                // nodes.Closing tag
                break;
            }
            else if (this.lexer.peek().type === 1 /* endOfFile */) {
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
    };
    Parser.prototype.parseJsxOpeningOrSelfClosingElement = function (inExpressionContext) {
        var fullStart = this.lexer.getStartPos();
        this.readToken(54 /* lessThan */);
        var tagName = this.parseJsxElementName();
        var attributes = this.parseList(nodes.ParsingContext.JsxAttributes, this.parseJsxAttribute);
        var result;
        if (this.lexer.peek().type === 67 /* greaterThan */) {
            // nodes.Closing tag, so scan the immediately-following text with the nodes.JSX scanning instead
            // of regular scanning to avoid treating illegal characters (e.g. '#') as immediate
            // scanning errors
            result = new nodes.JsxOpeningElement();
            this.scanJsxText();
        }
        else {
            this.readToken(51 /* slash */);
            if (inExpressionContext) {
                this.readToken(67 /* greaterThan */);
            }
            else {
                this.readToken(67 /* greaterThan */, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
                this.scanJsxText();
            }
            result = new nodes.JsxSelfClosingElement();
        }
        result.tagName = tagName;
        result.attributes = attributes;
        return result;
    };
    Parser.prototype.parseJsxElementName = function () {
        this.scanJsxIdentifier();
        // nodes.JsxElement can have name in the form of
        //      propertyAccessExpression
        //      primaryExpression in the form of an identifier and "this" keyword
        // nodes.We can't just simply use this.parseLeftHandSideExpressionOrHigher because then we will start consider class,function etc as a keyword
        // nodes.We only want to consider "this" as a primaryExpression
        var expression = this.lexer.peek().type === 32 /* this */ ?
            this.parseTokenNode() : this.parseIdentifierName();
        while (this.tryReadToken(59 /* dot */)) {
            var propertyAccess = new nodes.PropertyAccessExpression();
            propertyAccess.expression = expression;
            propertyAccess.name = this.parseRightSideOfDot(/*allowIdentifierNames*/ true);
            expression = this.finishNode(propertyAccess);
        }
        return expression;
    };
    Parser.prototype.parseJsxExpression = function (inExpressionContext) {
        var result = new nodes.JsxExpression();
        this.readToken(36 /* openBrace */);
        if (this.lexer.peek().type !== 104 /* closeBrace */) {
            result.expression = this.parseAssignmentExpressionOrHigher();
        }
        if (inExpressionContext) {
            this.readToken(104 /* closeBrace */);
        }
        else {
            this.readToken(104 /* closeBrace */, /*message*/ undefined, /*shouldAdvance*/ false);
            this.scanJsxText();
        }
        return result;
    };
    Parser.prototype.parseJsxAttribute = function () {
        if (this.lexer.peek().type === 36 /* openBrace */) {
            return this.parseJsxSpreadAttribute();
        }
        this.scanJsxIdentifier();
        var result = new nodes.JsxAttribute();
        result.name = this.parseIdentifierName();
        if (this.tryReadToken(83 /* equals */)) {
            switch (this.lexer.peek().type) {
                case tokenType_1.TokenType.StringLiteral:
                    result.initializer = this.parseLiteralNode();
                    break;
                default:
                    result.initializer = this.parseJsxExpression(/*inExpressionContext*/ true);
                    break;
            }
        }
        return result;
    };
    Parser.prototype.parseJsxSpreadAttribute = function () {
        var result = new nodes.JsxSpreadAttribute();
        this.readToken(36 /* openBrace */);
        this.readToken(56 /* dotDotDot */);
        result.expression = this.parseExpression();
        this.readToken(104 /* closeBrace */);
        return result;
    };
    Parser.prototype.parseJsxClosingElement = function (inExpressionContext) {
        var result = new nodes.JsxClosingElement();
        this.readToken(tokenType_1.TokenType.lessThanSlash);
        result.tagName = this.parseJsxElementName();
        if (inExpressionContext) {
            this.readToken(67 /* greaterThan */);
        }
        else {
            this.readToken(67 /* greaterThan */, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
            this.scanJsxText();
        }
        return result;
    };
    Parser.prototype.parseTypeAssertion = function () {
        var result = new nodes.TypeAssertion();
        this.readToken(54 /* lessThan */);
        result.type = this.parseTypeNode();
        this.readToken(67 /* greaterThan */);
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    };
    Parser.prototype.parseMemberExpressionRest = function (expression) {
        while (true) {
            var dotToken = this.tryReadTokenToken(59 /* dot */);
            if (dotToken) {
                var propertyAccess = new nodes.PropertyAccessExpression();
                propertyAccess.expression = expression;
                propertyAccess.name = this.parseRightSideOfDot(/*allowIdentifierNames*/ true);
                expression = this.finishNode(propertyAccess);
                continue;
            }
            if (this.lexer.peek().type === 37 /* exclamation */ && !this.lexer.peek().hasLineBreakBeforeStart) {
                this.lexer.read().type;
                var nonNullExpression = new nodes.NonNullExpression();
                nonNullExpression.expression = expression;
                expression = this.finishNode(nonNullExpression);
                continue;
            }
            // when in the [nodes.Decorator] context, we do not parse nodes.ElementAccess as it could be part of a nodes.ComputedPropertyName
            if (!this.inDecoratorContext() && this.tryReadToken(48 /* openBracket */)) {
                var indexedAccess = new nodes.ElementAccessExpression();
                indexedAccess.expression = expression;
                // nodes.It's not uncommon for a user to write: "new nodes.Type[]".
                // nodes.Check for that common pattern and report a better error message.
                if (this.lexer.peek().type !== 103 /* closeBracket */) {
                    indexedAccess.argumentExpression = this.allowInAnd(this.parseExpression);
                    if (indexedAccess.argumentExpression.kind === tokenType_1.TokenType.StringLiteral || indexedAccess.argumentExpression.kind === tokenType_1.TokenType.NumericLiteral) {
                        var literal = indexedAccess.argumentExpression;
                        literal.text = this.internIdentifier(literal.text);
                    }
                }
                this.readToken(103 /* closeBracket */);
                expression = this.finishNode(indexedAccess);
                continue;
            }
            if (this.lexer.peek().type === tokenType_1.TokenType.NoSubstitutionTemplateLiteral || this.lexer.peek().type === tokenType_1.TokenType.TemplateHead) {
                var tagExpression = new nodes.TaggedTemplateExpression();
                tagExpression.tag = expression;
                tagExpression.template = this.lexer.peek().type === tokenType_1.TokenType.NoSubstitutionTemplateLiteral
                    ? this.parseLiteralNode()
                    : this.parseTemplateExpression();
                expression = this.finishNode(tagExpression);
                continue;
            }
            return expression;
        }
    };
    Parser.prototype.parseCallExpressionRest = function (expression) {
        while (true) {
            expression = this.parseMemberExpressionRest(expression);
            if (this.lexer.peek().type === 54 /* lessThan */) {
                // nodes.See if this is the start of a generic invocation.  nodes.If so, consume it and
                // keep checking for postfix expressions.  nodes.Otherwise, it's just a '<' that's
                // part of an arithmetic expression.  nodes.Break out so we consume it higher in the
                // stack.
                var typeArguments = this.tryParse(this.parseTypeArgumentsInExpression);
                if (!typeArguments) {
                    return expression;
                }
                var callExpr = new nodes.CallExpression();
                callExpr.expression = expression;
                callExpr.typeArguments = typeArguments;
                callExpr.arguments = this.parseArgumentList();
                expression = this.finishNode(callExpr);
                continue;
            }
            else if (this.lexer.peek().type === 47 /* openParen */) {
                var callExpr = new nodes.CallExpression();
                callExpr.expression = expression;
                callExpr.arguments = this.parseArgumentList();
                expression = this.finishNode(callExpr);
                continue;
            }
            return expression;
        }
    };
    Parser.prototype.parseArgumentList = function () {
        this.readToken(47 /* openParen */);
        var ;
        this.result = this.parseDelimitedList(nodes.ParsingContext.ArgumentExpressions, this.parseArgumentExpression);
        this.readToken(102 /* closeParen */);
        return this.result;
    };
    Parser.prototype.parseTypeArgumentsInExpression = function () {
        if (!this.tryReadToken(54 /* lessThan */)) {
            return undefined;
        }
        var typeArguments = this.parseDelimitedList(nodes.ParsingContext.TypeArguments, this.parseTypeNode);
        if (!this.readToken(67 /* greaterThan */)) {
            // nodes.If it doesn't have the closing >  then it's definitely not an type argument list.
            return undefined;
        }
        // nodes.If we have a '<', then only parse this as a argument list if the type arguments
        // are complete and we have an open paren.  if we don't, rewind and return nothing.
        return typeArguments && this.canFollowTypeArgumentsInExpression()
            ? typeArguments
            : undefined;
    };
    Parser.prototype.canFollowTypeArgumentsInExpression = function () {
        switch (this.lexer.peek().type) {
            case 47 /* openParen */: // foo<x>(
            // this case are the only case where this this.lexer.peek().type can legally follow a type argument
            // list.  nodes.So we definitely want to treat this as a type arg list.
            case 59 /* dot */: // foo<x>.
            case 102 /* closeParen */: // foo<x>)
            case 103 /* closeBracket */: // foo<x>]
            case 105 /* colon */: // foo<x>:
            case 106 /* semicolon */: // foo<x>;
            case 97 /* question */: // foo<x>?
            case 70 /* equalsEquals */: // foo<x> ==
            case 72 /* equalsEqualsEquals */: // foo<x> ===
            case 71 /* exclamationEquals */: // foo<x> !=
            case 73 /* exclamationEqualsEquals */: // foo<x> !==
            case 79 /* ampersandAmpersand */: // foo<x> &&
            case 80 /* barBar */: // foo<x> ||
            case 78 /* caret */: // foo<x> ^
            case 63 /* ampersand */: // foo<x> &
            case 77 /* bar */: // foo<x> |
            case 104 /* closeBrace */: // foo<x> }
            case 1 /* endOfFile */:
                // these cases can't legally follow a type arg list.  nodes.However, they're not legal
                // expressions either.  nodes.The user is probably in the middle of a generic type. nodes.So
                // treat it as such.
                return true;
            case 98 /* comma */: // foo<x>,
            case 36 /* openBrace */: // foo<x> {
            // nodes.We don't want to treat these as type arguments.  nodes.Otherwise we'll parse this
            // as an invocation expression.  nodes.Instead, we want to parse out the expression
            // in isolation from the type arguments.
            default:
                // nodes.Anything else treat as an expression.
                return false;
        }
    };
    Parser.prototype.parsePrimaryExpression = function () {
        switch (this.lexer.peek().type) {
            case tokenType_1.TokenType.NumericLiteral:
            case tokenType_1.TokenType.StringLiteral:
            case tokenType_1.TokenType.NoSubstitutionTemplateLiteral:
                return this.parseLiteralNode();
            case 32 /* this */:
            case 33 /* super */:
            case 29 /* null */:
            case 30 /* true */:
            case 31 /* false */:
                return this.parseTokenNode();
            case 47 /* openParen */:
                return this.parseParenthesizedExpression();
            case 48 /* openBracket */:
                return this.parseArrayLiteralExpression();
            case 36 /* openBrace */:
                return this.parseObjectLiteralExpression();
            case 7 /* async */:
                // nodes.Async arrow functions are parsed earlier in this.parseAssignmentExpressionOrHigher.
                // nodes.If we encounter `async [no nodes.LineTerminator here] function` then this is an async
                // function; otherwise, its an identifier.
                if (!this.lookAhead(this.nextTokenIsFunctionKeywordOnSameLine)) {
                    break;
                }
                return this.parseFunctionExpression();
            case 18 /* class */:
                return this.parseClassExpression();
            case 20 /* function */:
                return this.parseFunctionExpression();
            case 38 /* new */:
                return this.parseNewExpression();
            case 51 /* slash */:
            case 87 /* slashEquals */:
                if (this.reScanSlashToken() === tokenType_1.TokenType.RegularExpressionLiteral) {
                    return this.parseLiteralNode();
                }
                break;
            case tokenType_1.TokenType.TemplateHead:
                return this.parseTemplateExpression();
        }
        return this.parseIdentifier(nodes.Diagnostics.Expression_expected);
    };
    /**
     * 解析一个括号表达式(`(x)`)。
     */
    Parser.prototype.parseParenthesizedExpression = function () {
        console.assert(this.lexer.peek().type === 47 /* openParen */);
        var result = new nodes.ParenthesizedExpression();
        result.start = this.lexer.read().start;
        result.body = this.allowInAnd(this.parseExpression);
        result.end = this.readToken(102 /* closeParen */);
        return result;
    };
    Parser.prototype.parseSpreadElement = function () {
        var result = new nodes.SpreadElementExpression();
        this.readToken(56 /* dotDotDot */);
        result.expression = this.parseAssignmentExpressionOrHigher();
        return result;
    };
    Parser.prototype.parseArgumentOrArrayLiteralElement = function () {
        return this.lexer.peek().type === 56 /* dotDotDot */ ? this.parseSpreadElement() :
            this.lexer.peek().type === 98 /* comma */ ? new nodes.Expression() :
                this.parseAssignmentExpressionOrHigher();
    };
    Parser.prototype.parseArgumentExpression = function () {
        return this.doOutsideOfContext(this.disallowInAndDecoratorContext, this.parseArgumentOrArrayLiteralElement);
    };
    Parser.prototype.parseArrayLiteralExpression = function () {
        var result = new nodes.ArrayLiteralExpression();
        this.readToken(48 /* openBracket */);
        if (this.lexer.peek().hasLineBreakBeforeStart) {
            result.multiLine = true;
        }
        result.elements = this.parseDelimitedList(nodes.ParsingContext.ArrayLiteralMembers, this.parseArgumentOrArrayLiteralElement);
        this.readToken(103 /* closeBracket */);
        return result;
    };
    Parser.prototype.tryParseAccessorDeclaration = function (fullStart, decorators, modifiers) {
        if (this.parseContextualModifier(144 /* get */)) {
            return this.parseJsDocComment(this.parseAccessorDeclaration(tokenType_1.TokenType.GetAccessor, fullStart, decorators, modifiers));
        }
        else if (this.parseContextualModifier(145 /* set */)) {
            return this.parseAccessorDeclaration(tokenType_1.TokenType.SetAccessor, fullStart, decorators, modifiers);
        }
        return undefined;
    };
    Parser.prototype.parseObjectLiteralElement = function () {
        var fullStart = this.lexer.getStartPos();
        var decorators = this.parseDecoratorList();
        var modifiers = this.parseModifierList();
        var accessor = this.tryParseAccessorDeclaration(fullStart, decorators, modifiers);
        if (accessor) {
            return accessor;
        }
        var asteriskToken = this.tryReadTokenToken(62 /* asterisk */);
        var tokenIsIdentifier = this.isIdentifier();
        var propertyName = this.parsePropertyName();
        // nodes.Disallowing of optional property assignments happens in the grammar checker.
        var questionToken = this.tryReadTokenToken(97 /* question */);
        if (asteriskToken || this.lexer.peek().type === 47 /* openParen */ || this.lexer.peek().type === 54 /* lessThan */) {
            return this.parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, propertyName, questionToken);
        }
        // check if it is short-hand property assignment or normal property assignment
        // nodes.NOTE: if this.lexer.peek().type is nodes.EqualsToken it is interpreted as nodes.CoverInitializedName production
        // nodes.CoverInitializedName[nodes.Yield] :
        //     nodes.IdentifierReference[?nodes.Yield] nodes.Initializer[nodes.In, ?nodes.Yield]
        // this is necessary because nodes.ObjectLiteral productions are also used to cover grammar for nodes.ObjectAssignmentPattern
        var isShorthandPropertyAssignment = tokenIsIdentifier && (this.lexer.peek().type === 98 /* comma */ || this.lexer.peek().type === 104 /* closeBrace */ || this.lexer.peek().type === 83 /* equals */);
        if (isShorthandPropertyAssignment) {
            var shorthandDeclaration = new nodes.ShorthandPropertyAssignment();
            shorthandDeclaration.name = propertyName;
            shorthandDeclaration.questionToken = questionToken;
            var equalsToken = this.tryReadTokenToken(83 /* equals */);
            if (equalsToken) {
                shorthandDeclaration.equalsToken = equalsToken;
                shorthandDeclaration.objectAssignmentInitializer = this.allowInAnd(this.parseAssignmentExpressionOrHigher);
            }
            return this.parseJsDocComment(this.finishNode(shorthandDeclaration));
        }
        else {
            var propertyAssignment = new nodes.PropertyAssignment();
            propertyAssignment.modifiers = modifiers;
            propertyAssignment.name = propertyName;
            propertyAssignment.questionToken = questionToken;
            this.readToken(105 /* colon */);
            propertyAssignment.initializer = this.allowInAnd(this.parseAssignmentExpressionOrHigher);
            return this.parseJsDocComment(this.finishNode(propertyAssignment));
        }
    };
    Parser.prototype.parseObjectLiteralExpression = function () {
        var result = new nodes.ObjectLiteralExpression();
        this.readToken(36 /* openBrace */);
        if (this.lexer.peek().hasLineBreakBeforeStart) {
            result.multiLine = true;
        }
        result.properties = this.parseDelimitedList(nodes.ParsingContext.ObjectLiteralMembers, this.parseObjectLiteralElement, /*considerSemicolonAsDelimiter*/ true);
        this.readToken(104 /* closeBrace */);
        return result;
    };
    Parser.prototype.parseFunctionExpression = function () {
        // nodes.GeneratorExpression:
        //      function* nodes.BindingIdentifier [nodes.Yield][opt](nodes.FormalParameters[nodes.Yield]){ nodes.GeneratorBody }
        //
        // nodes.FunctionExpression:
        //      function nodes.BindingIdentifier[opt](nodes.FormalParameters){ nodes.FunctionBody }
        var saveDecoratorContext = this.inDecoratorContext();
        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ false);
        }
        var result = new nodes.FunctionExpression();
        result.modifiers = this.parseModifierList();
        this.readToken(20 /* function */);
        result.asteriskToken = this.tryReadTokenToken(62 /* asterisk */);
        var isGenerator = !!result.asteriskToken;
        var isAsync = !!(result.flags & nodes.NodeFlags.Async);
        result.name =
            isGenerator && isAsync ? this.doInYieldAndAwaitContext(this.tryReadTokenIdentifier) :
                isGenerator ? this.doInYieldContext(this.tryReadTokenIdentifier) :
                    isAsync ? this.doInAwaitContext(this.tryReadTokenIdentifier) :
                        this.tryReadTokenIdentifier();
        this.parseMethodSignature(105 /* colon */, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, result);
        result.body = this.parseFunctionBlock(/*allowYield*/ isGenerator, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);
        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ true);
        }
        return this.parseJsDocComment(result);
    };
    Parser.prototype.tryReadTokenIdentifier = function () {
        return this.isIdentifier() ? this.parseIdentifier() : undefined;
    };
    /**
     * 解析一个 new 表达式(`new x()`)。
     */
    Parser.prototype.parseNewExpression = function () {
        console.assert(this.lexer.peek().type === 38 /* new */);
        var result = new nodes.NewExpression();
        result.start = this.lexer.read().start;
        result.target = this.parseMemberExpressionOrHigher();
        if (this.lexer.peek().type === 47 /* openParen */) {
            result.arguments = this.parseArgumentList();
        }
        return result;
    };
    // #endregion
    // #region 解析语句
    /**
     * 解析一个语句。
     */
    Parser.prototype.parseStatement = function () {
        switch (this.lexer.peek().type) {
            case 22 /* identifier */:
                return this.parseLabeledOrExpressionStatement(this.parseIdentifier());
            case 36 /* openBrace */:
                return this.parseBlockStatement();
            case 122 /* var */:
                return this.parseVariableStatement();
            case 125 /* let */:
            case 124 /* const */:
                if (this.isVariableStatement()) {
                    return this.parseVariableStatement();
                }
                break;
            case 20 /* function */:
                return this.parseFunctionDeclaration();
            case 18 /* class */:
                return this.parseClassDeclaration();
            case 110 /* if */:
                return this.parseIfStatement();
            case 111 /* switch */:
                return this.parseSwitchStatement();
            case 112 /* for */:
                return this.parseForStatement();
            case 113 /* while */:
                return this.parseWhileStatement();
            case 114 /* do */:
                return this.parseDoWhileStatement();
            case 116 /* break */:
                return this.parseBreakStatement();
            case 115 /* continue */:
                return this.parseContinueStatement();
            case 117 /* return */:
                return this.parseReturnStatement();
            case 118 /* throw */:
                return this.parseThrowStatement();
            case 119 /* try */:
                return this.parseTryStatement();
            case 120 /* debugger */:
                return this.parseDebuggerStatement();
            case 106 /* semicolon */:
                return this.parseEmptyStatement();
            case 1 /* endOfFile */:
                return this.parseErrorStatement();
            case 121 /* with */:
                return this.parseWithStatement();
            case 45 /* at */:
            case 7 /* async */:
            case 17 /* interface */:
            case 128 /* type */:
            case 130 /* module */:
            case 129 /* namespace */:
            case 12 /* declare */:
            case 124 /* const */:
            case 16 /* enum */:
            case 6 /* export */:
            case 126 /* import */:
            case 8 /* private */:
            case 9 /* protected */:
            case 10 /* public */:
            case 14 /* abstract */:
            case 13 /* static */:
            case 11 /* readonly */:
            case 148 /* global */:
                if (this.isDeclarationStart()) {
                    return this.parseDeclaration();
                }
                break;
        }
        if (this.isDeclarationStart()) {
            return this.parseDeclaration();
        }
        return this.parseLabeledOrExpressionStatement(this.parseExpression());
    };
    /**
     * 解析一个语句块(`{...}`)。
     */
    Parser.prototype.parseBlockStatement = function () {
        console.assert(this.lexer.peek().type === 36 /* openBrace */);
        var result = new nodes.BlockStatement();
        result.statements = new nodes.NodeList();
        result.statements.start = this.lexer.read().start;
        while (true) {
            switch (this.lexer.peek().type) {
                case 104 /* closeBrace */:
                    result.statements.end = this.lexer.read().end;
                    return result;
                case 1 /* endOfFile */:
                    result.statements.end = this.expectToken(104 /* closeBrace */);
                    return result;
            }
            result.statements.push(this.parseStatement());
        }
    };
    /**
     * 解析一个变量声明语句(`var x`、`let x`、`const x`)。
     */
    Parser.prototype.parseVariableStatement = function () {
        console.assert(this.lexer.peek().type === 122 /* var */ || this.lexer.peek().type === 125 /* let */ || this.lexer.peek().type === 124 /* const */);
        var result = new nodes.VariableStatement();
        this.parseJsDocComment(result);
        result.start = this.lexer.read().start;
        result.type = this.lexer.current.type;
        result.variables = new nodes.NodeList();
        result.variables.commaTokens = [];
        while (true) {
            result.variables.push(this.parseVariableDeclaration());
            if (this.lexer.peek().type === 98 /* comma */) {
                result.variables.commaTokens.push(this.lexer.read().start);
                continue;
            }
            break;
        }
        ;
        result.end = this.tryReadSemicolon();
        return result;
    };
    /**
     * 解析一个变量声明(`x = 1`、`[x] = [1]`、`{a: x} = {a: 1}`)。
     */
    Parser.prototype.parseVariableDeclaration = function () {
        var result = new nodes.VariableDeclaration();
        result.name = this.parseBindingName();
        if (this.lexer.peek().type === 105 /* colon */) {
            result.colonToken = this.lexer.read().start;
            result.type = this.parseTypeNode();
        }
        if (this.lexer.peek().type === 83 /* equals */) {
            result.equalToken = this.lexer.read().start;
            result.initializer = this.parseExpressionWithoutComma();
        }
        else if (!this.hasSemicolon() && tokenType_1.isExpressionStart(this.lexer.peek().type)) {
            result.equalToken = this.expectToken(83 /* equals */);
            result.initializer = this.parseExpressionWithoutComma();
        }
        return result;
    };
    /**
     * 解析一个空语句(`;`)。
     */
    Parser.prototype.parseEmptyStatement = function () {
        console.assert(this.lexer.peek().type === 106 /* semicolon */);
        var result = new nodes.EmptyStatement();
        result.start = this.lexer.read().start;
        return result;
    };
    /**
     * 解析一个表达式或标签语句。
     * @param parsed 已解析的表达式。
     */
    Parser.prototype.parseLabeledOrExpressionStatement = function (parsed) {
        if (parsed.constructor === nodes.Identifier && this.lexer.peek().type === 105 /* colon */) {
            return this.parseLabeledStatement(parsed);
        }
        return this.parseExpressionStatement(parsed);
    };
    /**
     * 解析一个标签语句(`xx: ...`)。
     * @param label 已解析的标签部分。
     */
    Parser.prototype.parseLabeledStatement = function (label) {
        console.assert(this.lexer.peek().type === 105 /* colon */);
        var result = new nodes.LabeledStatement();
        this.parseJsDocComment(result);
        result.label = label;
        result.colonToken = this.lexer.read().type;
        result.body = this.parseStatement();
        return result;
    };
    /**
     * 解析一个表达式语句(`x();`)。
     * @param parsed 已解析的表达式。
     */
    Parser.prototype.parseExpressionStatement = function (parsed) {
        var result = new nodes.ExpressionStatement();
        result.body = this.parseExpressionRest(parsed);
        result.end = this.tryReadSemicolon();
        return result;
    };
    /**
     * 解析一个 if 语句(`if(x) ...`)。
     */
    Parser.prototype.parseIfStatement = function () {
        console.assert(this.lexer.peek().type === 110 /* if */);
        var result = new nodes.IfStatement();
        result.start = this.lexer.read().start;
        this.parseCondition(result);
        result.then = this.parseEmbeddedStatement();
        if (this.lexer.peek().type === 133 /* else */) {
            result.elseToken = this.lexer.read().start;
            result.else = this.parseEmbeddedStatement();
        }
        return result;
    };
    /**
     * 解析一个 switch 语句(`switch(x) {...}`)。
     */
    Parser.prototype.parseSwitchStatement = function () {
        console.assert(this.lexer.peek().type == 111 /* switch */);
        var result = new nodes.SwitchStatement();
        result.start = this.lexer.read().start;
        if (!this.options.disallowMissingSwitchCondition || this.lexer.peek().type !== 36 /* openBrace */) {
            this.parseCondition(result);
        }
        result.cases = new nodes.NodeList();
        result.cases.start = this.readToken(36 /* openBrace */);
        while (true) {
            switch (this.lexer.peek().type) {
                case 134 /* case */:
                case 135 /* default */:
                    break;
                case 104 /* closeBrace */:
                    result.cases.end = this.lexer.read().end;
                    return result;
                default:
                    this.error(this.lexer.peek(), "应输入“case”或“default”。");
                    result.cases.end = this.lexer.current.end;
                    return result;
            }
            var caseCaluse = new nodes.CaseClause();
            caseCaluse.start = this.lexer.read().start;
            if (this.lexer.current.type === 134 /* case */) {
                if (!this.options.disallowCaseElse && this.lexer.peek().type === 133 /* else */) {
                    caseCaluse.elseToken = this.lexer.read().start;
                }
                else {
                    caseCaluse.label = this.allowInAnd(this.parseExpression);
                }
            }
            caseCaluse.colonToken = this.readToken(105 /* colon */);
            caseCaluse.statements = new nodes.NodeList();
            while (true) {
                switch (this.lexer.peek().type) {
                    case 134 /* case */:
                    case 135 /* default */:
                    case 104 /* closeBrace */:
                    case 1 /* endOfFile */:
                        break;
                    default:
                        caseCaluse.statements.push(this.parseStatement());
                        continue;
                }
                break;
            }
            result.cases.push(caseCaluse);
        }
    };
    /**
     * 解析一个 for 语句(`for(var i = 0; i < 9; i++) ...`)。
     */
    Parser.prototype.parseForStatement = function () {
        console.assert(this.lexer.peek().type == 112 /* for */);
        var start = this.lexer.read().start;
        var openParan = this.lexer.peek().type === 47 /* openParen */ ?
            this.lexer.read().start : undefined;
        if (openParan == undefined && !this.options.disallowMissingParenthese) {
            this.expectToken(47 /* openParen */);
        }
        var disallowIn = this.disallowIn;
        this.disallowIn = true;
        var initializer = this.lexer.peek().type === 106 /* semicolon */ ? undefined : this.isVariableStatement() ? this.parseVariableStatement() : this.allowInAnd(this.parseExpression);
        this.disallowIn = disallowIn;
        var type = this.lexer.peek().type;
        switch (type) {
            case 106 /* semicolon */:
            case 64 /* in */:
                break;
            case 142 /* of */:
                if (!this.options.disallowForOf) {
                    type = 106 /* semicolon */;
                }
                break;
            case 143 /* to */:
                if (!this.options.disallowForTo) {
                    type = 106 /* semicolon */;
                }
                break;
            default:
                type = 106 /* semicolon */;
                break;
        }
        if (type !== 106 /* semicolon */) {
            switch (initializer.constructor) {
                case nodes.VariableStatement:
                    if (!this.options.useCompatibleForInAndForOf) {
                        var variables = initializer.variables;
                        if (type !== 143 /* to */ && variables[0].initializer)
                            this.error(variables[0].initializer, type === 64 /* in */ ? "在 for..in 语句变量不能有初始值。" : "在 for..of 语句变量不能有初始值。");
                        if (variables.length > 1) {
                            this.error(variables[1].name, type === 64 /* in */ ? "在 for..in 语句中只能定义一个变量。" :
                                type === 142 /* of */ ? "在 for..of 语句中只能定义一个变量。" :
                                    "在 for..to 语句中只能定义一个变量。");
                        }
                    }
                    break;
                case nodes.Identifier:
                    break;
                default:
                    this.error(initializer, type === 64 /* in */ ? "在 for..in 语句的左边只能是标识符。" :
                        type === 142 /* of */ ? "在 for..of 语句的左边只能是标识符。" :
                            "在 for..to 语句的左边只能是标识符。");
                    break;
            }
        }
        var result;
        switch (type) {
            case 106 /* semicolon */:
                result = new nodes.ForStatement();
                result.firstSemicolonToken = this.readToken(106 /* semicolon */);
                if (this.lexer.peek().type !== 106 /* semicolon */) {
                    result.condition = this.allowInAnd(this.parseExpression);
                }
                result.secondSemicolonToken = this.readToken(106 /* semicolon */);
                if (openParan != undefined ? this.lexer.peek().type !== 102 /* closeParen */ : tokenType_1.isExpressionStart(this.lexer.peek().type)) {
                    result.iterator = this.allowInAnd(this.parseExpression);
                }
                break;
            case 64 /* in */:
                result = new nodes.ForInStatement();
                result.inToken = this.lexer.read().start;
                result.condition = this.allowInAnd(this.parseExpression);
                break;
            case 142 /* of */:
                result = new nodes.ForOfStatement();
                result.ofToken = this.lexer.read().start;
                result.condition = this.options.disallowForOfCommaExpression ? this.allowInAnd(this.parseAssignmentExpressionOrHigher) : this.allowInAnd(this.parseExpression);
                break;
            case 143 /* to */:
                result = new nodes.ForToStatement();
                result.toToken = this.lexer.read().start;
                result.condition = this.allowInAnd(this.parseExpression);
                break;
        }
        result.start = start;
        if (initializer) {
            result.initializer = initializer;
        }
        if (openParan != undefined) {
            result.openParanToken = openParan;
            result.closeParanToken = this.readToken(102 /* closeParen */);
        }
        result.body = this.parseEmbeddedStatement();
        return result;
    };
    /**
     * 解析一个 while 语句(`while(x) ...`)。
     */
    Parser.prototype.parseWhileStatement = function () {
        console.assert(this.lexer.peek().type === 113 /* while */);
        var result = new nodes.WhileStatement();
        result.start = this.lexer.read().start;
        this.parseCondition(result);
        result.body = this.parseEmbeddedStatement();
        return result;
    };
    /**
     * 解析一个 do..while 语句(`do ... while(x);`)。
     */
    Parser.prototype.parseDoWhileStatement = function () {
        console.assert(this.lexer.peek().type === 114 /* do */);
        var result = new nodes.DoWhileStatement();
        result.start = this.lexer.read().type;
        result.body = this.parseEmbeddedStatement();
        result.whileToken = this.readToken(113 /* while */);
        this.parseCondition(result);
        result.end = this.tryReadSemicolon();
        return result;
    };
    /**
     * 解析一个 break 语句(`break xx;`)。
     */
    Parser.prototype.parseBreakStatement = function () {
        console.assert(this.lexer.peek().type === 116 /* break */);
        var result = new nodes.BreakStatement();
        result.start = this.lexer.read().start;
        if (this.lexer.peek().type === 22 /* identifier */ || tokenType_1.isReservedWord(this.lexer.peek().type)) {
            result.label = this.parseIdentifier();
        }
        else if (!this.hasSemicolon()) {
            this.expectToken(22 /* identifier */);
        }
        result.end = this.tryReadSemicolon();
        return result;
    };
    /**
     * 解析一个 continue 语句(`continue xx;`)。
     */
    Parser.prototype.parseContinueStatement = function () {
        console.assert(this.lexer.peek().type === 115 /* continue */);
        var result = new nodes.ContinueStatement();
        result.start = this.lexer.read().start;
        if (this.lexer.peek().type === 22 /* identifier */ || tokenType_1.isReservedWord(this.lexer.peek().type)) {
            result.label = this.parseIdentifier();
        }
        else if (!this.hasSemicolon()) {
            this.expectToken(22 /* identifier */);
        }
        result.end = this.tryReadSemicolon();
        return result;
    };
    /**
     * 解析一个 return 语句(`return x;`)。
     */
    Parser.prototype.parseReturnStatement = function () {
        console.assert(this.lexer.peek().type === 117 /* return */);
        var result = new nodes.ReturnStatement();
        result.start = this.lexer.read().start;
        if (this.options.useStandardSemicolonInsertion ? !this.hasSemicolon() : tokenType_1.isExpressionStart(this.lexer.peek().type)) {
            result.value = this.allowInAnd(this.parseExpression);
        }
        result.end = this.tryReadSemicolon();
        return result;
    };
    /**
     * 解析一个 throw 语句(`throw x;`)。
     */
    Parser.prototype.parseThrowStatement = function () {
        console.assert(this.lexer.peek().type === 118 /* throw */);
        var result = new nodes.ThrowStatement();
        result.start = this.lexer.read().start;
        if (this.options.useStandardSemicolonInsertion ? !this.hasSemicolon() : tokenType_1.isExpressionStart(this.lexer.peek().type)) {
            result.value = this.allowInAnd(this.parseExpression);
        }
        else if (this.options.disallowRethrow) {
            this.error({ start: this.lexer.current.end, end: this.lexer.current.end }, "应输入表达式。");
        }
        result.end = this.tryReadSemicolon();
        return result;
    };
    /**
     * 解析一个 try 语句(`try {...} catch(e) {...}`)。
     */
    Parser.prototype.parseTryStatement = function () {
        console.assert(this.lexer.peek().type == 119 /* try */);
        var result = new nodes.TryStatement();
        result.start = this.lexer.read().start;
        result.try = this.parseTryClauseBody();
        if (this.lexer.peek().type === 136 /* catch */) {
            result.catch = new nodes.CatchClause();
            result.catch.start = this.lexer.read().start;
            if (this.lexer.peek().type === 47 /* openParen */) {
                result.catch.openParanToken = this.lexer.read().start;
                result.catch.variable = this.parseBindingName();
                result.catch.openParanToken = this.readToken(102 /* closeParen */);
            }
            else if (!this.options.disallowMissingParenthese && this.isBindingName()) {
                result.catch.variable = this.parseBindingName();
            }
            else if (this.options.disallowMissingCatchVaribale) {
                this.expectToken(47 /* openParen */);
            }
            result.catch.body = this.parseTryClauseBody();
        }
        if (this.lexer.peek().type === 137 /* finally */) {
            result.finally = new nodes.FinallyClause();
            result.finally.start = this.lexer.read().start;
            result.finally.body = this.parseTryClauseBody();
        }
        if (this.options.disallowSimpleTryBlock && !result.catch && !result.finally) {
            this.error(this.lexer.peek(), "应输入“catch”或“finally”");
        }
        return result;
    };
    /**
     * 解析一个 try 语句的语句块。
     */
    Parser.prototype.parseTryClauseBody = function () {
        if (!this.options.disallowMissingTryBlock) {
            return this.parseEmbeddedStatement();
        }
        if (this.lexer.peek().type === 36 /* openBrace */) {
            return this.parseBlockStatement();
        }
        var result = new nodes.BlockStatement();
        result.statements = new nodes.NodeList();
        result.statements.start = this.expectToken(36 /* openBrace */);
        var statement = this.parseStatement();
        result.statements.push(statement);
        result.statements.end = statement.end;
        return result;
    };
    /**
     * 解析一个 debugger 语句(`debugger;`)。
     */
    Parser.prototype.parseDebuggerStatement = function () {
        console.assert(this.lexer.peek().type === 120 /* debugger */);
        var result = new nodes.DebuggerStatement();
        result.start = this.lexer.read().start;
        result.end = this.tryReadSemicolon();
        return result;
    };
    /**
     * 解析一个 with 语句(`with(x) ...`)。
     */
    Parser.prototype.parseWithStatement = function () {
        console.assert(this.lexer.peek().type === 121 /* with */);
        var result = new nodes.WithStatement();
        result.start = this.lexer.read().start;
        if (this.lexer.peek().type === 47 /* openParen */) {
            result.openParanToken = this.lexer.read().start;
            result.value = !this.options.disallowWithVaribale && this.isVariableStatement() ?
                this.allowInAnd(this.parseVariableStatement) :
                this.allowInAnd(this.parseExpression);
            result.closeParanToken = this.readToken(102 /* closeParen */);
        }
        else {
            if (this.options.disallowMissingParenthese) {
                this.expectToken(47 /* openParen */);
            }
            result.value = !this.options.disallowWithVaribale && this.isVariableStatement() ?
                this.allowInAnd(this.parseVariableStatement) :
                this.allowInAnd(this.parseExpression);
        }
        result.body = this.parseEmbeddedStatement();
        return result;
    };
    /**
     * 解析一个错误的语句。
     */
    Parser.prototype.parseErrorStatement = function () {
        this.error(this.lexer.peek(), "应输入语句");
        var result = new nodes.EmptyStatement();
        result.start = result.end = this.lexer.peek().start;
        return result;
    };
    /**
     * 判断是否可以自动插入一个分号。
     */
    Parser.prototype.hasSemicolon = function () {
        switch (this.lexer.peek().type) {
            case 106 /* semicolon */:
                return true;
            case 104 /* closeBrace */:
            case 1 /* endOfFile */:
                return !this.options.disallowMissingSemicolon;
            default:
                if (this.options.disallowMissingSemicolon)
                    return false;
                if (this.options.useStandardSemicolonInsertion)
                    return this.lexer.peek().hasLineBreakBeforeStart;
                return true;
        }
    };
    /**
     * 尝试读取或自动插入一个分号。
     * @return 返回分号或自动插入点的结束位置。
     */
    Parser.prototype.tryReadSemicolon = function () {
        if (this.lexer.peek().type === 106 /* semicolon */) {
            return this.lexer.read().end;
        }
        if (!this.hasSemicolon()) {
            this.error({ start: this.lexer.current.end, end: this.lexer.current.end }, "语句后缺少“;”。");
        }
        return this.lexer.current.end;
    };
    /**
     * 解析内嵌语句。
     */
    Parser.prototype.parseEmbeddedStatement = function () {
        var result = this.parseStatement();
        if (result.constructor === nodes.VariableStatement && result.type !== 122 /* var */) {
            this.error(result, "变量声明语句应放在语句块中。");
        }
        return result;
    };
    /**
     * 解析条件表达式。
     * @param result 存放结果的语句。
     */
    Parser.prototype.parseCondition = function (result) {
        if (this.lexer.peek().type === 47 /* openParen */) {
            result.openParanToken = this.lexer.read().type;
            result.condition = this.allowInAnd(this.parseExpression);
            result.closeParanToken = this.readToken(102 /* closeParen */);
        }
        else {
            if (!this.options.disallowMissingParenthese) {
                this.expectToken(47 /* openParen */);
            }
            result.condition = this.allowInAnd(this.parseExpression);
        }
    };
    /**
     * 判断是否紧跟一个变量定义语句。
     */
    Parser.prototype.isVariableStatement = function () {
        switch (this.lexer.peek().type) {
            case 122 /* var */:
                return true;
            case 125 /* let */:
            case 124 /* const */:
                this.lexer.stashSave();
                this.lexer.read();
                var result = this.isBindingName();
                this.lexer.stashRestore();
                return result;
            default:
                return false;
        }
    };
    // #endregion
    // #region 解析声明
    /**
     * 判断是否紧跟定义开始。
     */
    Parser.prototype.isDeclarationStart = function () {
        if (!tokenType_1.isDeclarationStart(this.lexer.peek().type)) {
            return false;
        }
        while (true) {
            switch (this.lexer.peek().type) {
                case 122 /* var */:
                case 125 /* let */:
                case 124 /* const */:
                case 20 /* function */:
                case 18 /* class */:
                case 16 /* enum */:
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
                case 17 /* interface */:
                case 128 /* type */:
                    return this.nextTokenIsIdentifierOnSameLine();
                case 130 /* module */:
                case 129 /* namespace */:
                    return this.nextTokenIsIdentifierOrStringLiteralOnSameLine();
                case 14 /* abstract */:
                case 7 /* async */:
                case 12 /* declare */:
                case 8 /* private */:
                case 9 /* protected */:
                case 10 /* public */:
                case 11 /* readonly */:
                    this.lexer.read().type;
                    // nodes.ASI takes effect for this modifier.
                    if (this.lexer.peek().hasLineBreakBeforeStart) {
                        return false;
                    }
                    continue;
                case 148 /* global */:
                    this.lexer.read().type;
                    return this.lexer.peek().type === 36 /* openBrace */ || this.lexer.peek().type === tokenType_1.TokenType.Identifier || this.lexer.peek().type === 6 /* export */;
                case 126 /* import */:
                    this.lexer.read().type;
                    return this.lexer.peek().type === tokenType_1.TokenType.StringLiteral || this.lexer.peek().type === 62 /* asterisk */ ||
                        this.lexer.peek().type === 36 /* openBrace */ || tokenIsIdentifierOrKeyword(this.lexer.peek().type);
                case 6 /* export */:
                    this.lexer.read().type;
                    if (this.lexer.peek().type === 83 /* equals */ || this.lexer.peek().type === 62 /* asterisk */ ||
                        this.lexer.peek().type === 36 /* openBrace */ || this.lexer.peek().type === 135 /* default */ ||
                        this.lexer.peek().type === 99 /* as */) {
                        return true;
                    }
                    continue;
                case 13 /* static */:
                    this.lexer.read().type;
                    continue;
                default:
                    return false;
            }
        }
    };
    Parser.prototype.parseFunctionBlock = function (allowYield, allowAwait, ignoreMissingOpenBrace, diagnosticMessage) {
        var savedYieldContext = this.inYieldContext();
        this.setYieldContext(allowYield);
        var savedAwaitContext = this.inAwaitContext();
        this.setAwaitContext(allowAwait);
        // nodes.We may be in a [nodes.Decorator] context when parsing a function expression or
        // arrow function. nodes.The body of the function is not in [nodes.Decorator] context.
        var saveDecoratorContext = this.inDecoratorContext();
        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ false);
        }
        var block = this.parseBlockStatement(ignoreMissingOpenBrace, diagnosticMessage);
        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ true);
        }
        this.setYieldContext(savedYieldContext);
        this.setAwaitContext(savedAwaitContext);
        return block;
    };
    Parser.prototype.nextTokenIsIdentifierOrKeywordOnSameLine = function () {
        this.lexer.read().type;
        return tokenIsIdentifierOrKeyword(this.lexer.peek().type) && !this.lexer.peek().hasLineBreakBeforeStart;
    };
    Parser.prototype.nextTokenIsFunctionKeywordOnSameLine = function () {
        this.lexer.read().type;
        return this.lexer.peek().type === 20 /* function */ && !this.lexer.peek().hasLineBreakBeforeStart;
    };
    Parser.prototype.nextTokenIsIdentifierOrKeywordOrNumberOnSameLine = function () {
        this.lexer.read().type;
        return (tokenIsIdentifierOrKeyword(this.lexer.peek().type) || this.lexer.peek().type === tokenType_1.TokenType.NumericLiteral) && !this.lexer.peek().hasLineBreakBeforeStart;
    };
    Parser.prototype.isStartOfDeclaration = function () {
        return this.lookAhead(this.isDeclarationStart);
    };
    Parser.prototype.isStartOfStatement = function () {
        switch (this.lexer.peek().type) {
            case 45 /* at */:
            case 106 /* semicolon */:
            case 36 /* openBrace */:
            case 122 /* var */:
            case 125 /* let */:
            case 20 /* function */:
            case 18 /* class */:
            case 16 /* enum */:
            case 110 /* if */:
            case 114 /* do */:
            case 113 /* while */:
            case 112 /* for */:
            case 115 /* continue */:
            case 116 /* break */:
            case 117 /* return */:
            case 121 /* with */:
            case 111 /* switch */:
            case 118 /* throw */:
            case 119 /* try */:
            case 120 /* debugger */:
            // 'catch' and 'finally' do not actually indicate that the code is part of a statement,
            // however, we say they are here so that we may gracefully parse them and error later.
            case 136 /* catch */:
            case 137 /* finally */:
                return true;
            case 124 /* const */:
            case 6 /* export */:
            case 126 /* import */:
                return this.isStartOfDeclaration();
            case 7 /* async */:
            case 12 /* declare */:
            case 17 /* interface */:
            case 130 /* module */:
            case 129 /* namespace */:
            case 128 /* type */:
            case 148 /* global */:
                // nodes.When these don't start a declaration, they're an identifier in an expression statement
                return true;
            case 10 /* public */:
            case 8 /* private */:
            case 9 /* protected */:
            case 13 /* static */:
            case 11 /* readonly */:
                // nodes.When these don't start a declaration, they may be the start of a class member if an identifier
                // immediately follows. nodes.Otherwise they're an identifier in an expression statement.
                return this.isStartOfDeclaration() || !this.lookAhead(this.nextTokenIsIdentifierOrKeywordOnSameLine);
            default:
                return this.isStartOfExpression();
        }
    };
    Parser.prototype.nextTokenIsIdentifierOrStartOfDestructuring = function () {
        this.lexer.read().type;
        return this.isIdentifier() || this.lexer.peek().type === 36 /* openBrace */ || this.lexer.peek().type === 48 /* openBracket */;
    };
    Parser.prototype.isLetDeclaration = function () {
        // nodes.In nodes.ES6 'let' always starts a lexical declaration if followed by an identifier or {
        // or [.
        return this.lookAhead(this.nextTokenIsIdentifierOrStartOfDestructuring);
    };
    Parser.prototype.parseDeclaration = function () {
        var fullStart = this.getNodePos();
        var decorators = this.parseDecoratorList();
        var modifiers = this.parseModifierList();
        switch (this.lexer.peek().type) {
            case 122 /* var */:
            case 125 /* let */:
            case 124 /* const */:
                return this.parseVariableStatement(fullStart, decorators, modifiers);
            case 20 /* function */:
                return this.parseFunctionDeclaration(fullStart, decorators, modifiers);
            case 18 /* class */:
                return this.parseClassDeclaration(fullStart, decorators, modifiers);
            case 17 /* interface */:
                return this.parseInterfaceDeclaration(fullStart, decorators, modifiers);
            case 128 /* type */:
                return this.parseTypeAliasDeclaration(fullStart, decorators, modifiers);
            case 16 /* enum */:
                return this.parseEnumDeclaration(fullStart, decorators, modifiers);
            case 148 /* global */:
            case 130 /* module */:
            case 129 /* namespace */:
                return this.parseModuleDeclaration(fullStart, decorators, modifiers);
            case 126 /* import */:
                return this.parseImportDeclarationOrImportEqualsDeclaration(fullStart, decorators, modifiers);
            case 6 /* export */:
                this.lexer.read().type;
                switch (this.lexer.peek().type) {
                    case 135 /* default */:
                    case 83 /* equals */:
                        return this.parseExportAssignment(fullStart, decorators, modifiers);
                    case 99 /* as */:
                        return this.parseNamespaceExportDeclaration(fullStart, decorators, modifiers);
                    default:
                        return this.parseExportDeclaration(fullStart, decorators, modifiers);
                }
            default:
                if (decorators || modifiers) {
                    // nodes.We reached this point because we encountered decorators and/or modifiers and assumed a declaration
                    // would follow. nodes.For recovery and error reporting purposes, return an incomplete declaration.
                    var result = this.createMissingNode(tokenType_1.TokenType.MissingDeclaration, /*reportAtCurrentPosition*/ true, nodes.Diagnostics.Declaration_expected);
                    result.pos = fullStart;
                    result.decorators = decorators;
                    result.modifiers = modifiers;
                    return result;
                }
        }
    };
    Parser.prototype.nextTokenIsIdentifierOrStringLiteralOnSameLine = function () {
        this.lexer.read().type;
        return !this.lexer.peek().hasLineBreakBeforeStart && (this.isIdentifier() || this.lexer.peek().type === tokenType_1.TokenType.StringLiteral);
    };
    Parser.prototype.parseFunctionBlockOrSemicolon = function (isGenerator, isAsync, diagnosticMessage) {
        if (this.lexer.peek().type !== 36 /* openBrace */ && this.canParseSemicolon()) {
            this.tryReadSemicolon();
            return;
        }
        return this.parseFunctionBlock(isGenerator, isAsync, /*ignoreMissingOpenBrace*/ false, diagnosticMessage);
    };
    // nodes.DECLARATIONS
    Parser.prototype.parseArrayBindingElement = function () {
        if (this.lexer.peek().type === 98 /* comma */) {
            return new nodes.BindingElement();
        }
        var result = new nodes.BindingElement();
        result.dotDotDotToken = this.tryReadTokenToken(56 /* dotDotDot */);
        result.name = this.parseBindingName();
        result.initializer = this.parseBindingElementInitializer(/*inParameter*/ false);
        return result;
    };
    Parser.prototype.parseObjectBindingElement = function () {
        var result = new nodes.BindingElement();
        var tokenIsIdentifier = this.isIdentifier();
        var propertyName = this.parsePropertyName();
        if (tokenIsIdentifier && this.lexer.peek().type !== 105 /* colon */) {
            result.name = propertyName;
        }
        else {
            this.readToken(105 /* colon */);
            result.propertyName = propertyName;
            result.name = this.parseBindingName();
        }
        result.initializer = this.parseBindingElementInitializer(/*inParameter*/ false);
        return result;
    };
    Parser.prototype.parseObjectBindingPattern = function () {
        var result = new nodes.BindingPattern();
        this.readToken(36 /* openBrace */);
        result.elements = this.parseDelimitedList(nodes.ParsingContext.ObjectBindingElements, this.parseObjectBindingElement);
        this.readToken(104 /* closeBrace */);
        return result;
    };
    Parser.prototype.parseArrayBindingPattern = function () {
        var result = new nodes.BindingPattern();
        this.readToken(48 /* openBracket */);
        result.elements = this.parseDelimitedList(nodes.ParsingContext.ArrayBindingElements, this.parseArrayBindingElement);
        this.readToken(103 /* closeBracket */);
        return result;
    };
    Parser.prototype.isIdentifierOrPattern = function () {
        return this.lexer.peek().type === 36 /* openBrace */ || this.lexer.peek().type === 48 /* openBracket */ || this.isIdentifier();
    };
    Parser.prototype.parseBindingName = function () {
        if (this.lexer.peek().type === 48 /* openBracket */) {
            return this.parseArrayBindingPattern();
        }
        if (this.lexer.peek().type === 36 /* openBrace */) {
            return this.parseObjectBindingPattern();
        }
        return this.parseIdentifier();
    };
    Parser.prototype.canFollowContextualOfKeyword = function () {
        return this.nextTokenIsIdentifier() && this.lexer.read().type === 102 /* closeParen */;
    };
    Parser.prototype.parseFunctionDeclaration = function (fullStart, decorators, modifiers) {
        var result = new nodes.FunctionDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        this.readToken(20 /* function */);
        result.asteriskToken = this.tryReadTokenToken(62 /* asterisk */);
        result.name = result.flags & nodes.NodeFlags.Default ? this.tryReadTokenIdentifier() : this.parseIdentifier();
        var isGenerator = !!result.asteriskToken;
        var isAsync = !!(result.flags & nodes.NodeFlags.Async);
        this.parseMethodSignature(105 /* colon */, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, result);
        result.body = this.parseFunctionBlockOrSemicolon(isGenerator, isAsync, nodes.Diagnostics.or_expected);
        return this.parseJsDocComment(result);
    };
    Parser.prototype.parseConstructorDeclaration = function (pos, decorators, modifiers) {
        var result = new nodes.ConstructorDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        this.readToken(147 /* constructor */);
        this.parseMethodSignature(105 /* colon */, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, result);
        result.body = this.parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false, nodes.Diagnostics.or_expected);
        return this.parseJsDocComment(result);
    };
    /**
     * 解析一个方法声明(`fn() {...}`)。
     */
    Parser.prototype.parseMethodDeclaration = function (decorators, modifiers, asteriskToken, name, questionToken) {
        var result = new nodes.MethodDeclaration();
        this.parseJsDocComment(result);
        result.decorators = decorators;
        result.modifiers = modifiers;
        result.asteriskToken = asteriskToken;
        result.name = name;
        result.questionToken = questionToken;
        this.parseMethodSignature(105 /* colon */, /*yieldContext*/ !!asteriskToken, /*awaitContext*/ !!(result.flags & nodes.NodeFlags.Async), /*requireCompleteParameterList*/ false, result);
        result.body = this.parseFunctionBlockOrSemicolon(isGenerator, isAsync);
        return result;
    };
    /**
     * 解析一个属性声明(`x: 1`)。
     */
    Parser.prototype.parsePropertyDeclaration = function (fullStart, decorators, modifiers, name, questionToken) {
        var property = new nodes.PropertyDeclaration();
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
    };
    Parser.prototype.parsePropertyOrMethodDeclaration = function (fullStart, decorators, modifiers) {
        var asteriskToken = this.tryReadTokenToken(62 /* asterisk */);
        var name = this.parsePropertyName();
        // nodes.Note: this is not legal as per the grammar.  nodes.But we allow it in the parser and
        // report an error in the grammar checker.
        var questionToken = this.tryReadTokenToken(97 /* question */);
        if (asteriskToken || this.lexer.peek().type === 47 /* openParen */ || this.lexer.peek().type === 54 /* lessThan */) {
            return this.parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, name, questionToken, nodes.Diagnostics.or_expected);
        }
        else {
            return this.parsePropertyDeclaration(fullStart, decorators, modifiers, name, questionToken);
        }
    };
    Parser.prototype.parseNonParameterInitializer = function () {
        return this.parseInitializer(/*inParameter*/ false);
    };
    Parser.prototype.parseAccessorDeclaration = function (kind, fullStart, decorators, modifiers) {
        var result = new nodes.AccessorDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        result.name = this.parsePropertyName();
        this.parseMethodSignature(105 /* colon */, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, result);
        result.body = this.parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false);
        return result;
    };
    Parser.prototype.isClassMemberModifier = function (idToken) {
        switch (idToken) {
            case 10 /* public */:
            case 8 /* private */:
            case 9 /* protected */:
            case 13 /* static */:
            case 11 /* readonly */:
                return true;
            default:
                return false;
        }
    };
    Parser.prototype.isClassMemberStart = function () {
        var idToken;
        if (this.lexer.peek().type === 45 /* at */) {
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
        if (this.lexer.peek().type === 62 /* asterisk */) {
            return true;
        }
        // nodes.Try to get the first property-like this.lexer.peek().type following all modifiers.
        // nodes.This can either be an identifier or the 'get' or 'set' keywords.
        if (this.isLiteralPropertyName()) {
            idToken = this.lexer.peek().type;
            this.lexer.read().type;
        }
        // nodes.Index signatures and computed properties are class members; we can parse.
        if (this.lexer.peek().type === 48 /* openBracket */) {
            return true;
        }
        // nodes.If we were able to get any potential identifier...
        if (idToken !== undefined) {
            // nodes.If we have a non-keyword identifier, or if we have an accessor, then it's safe to parse.
            if (!tokenType_1.isKeyword(idToken) || idToken === 145 /* set */ || idToken === 144 /* get */) {
                return true;
            }
            // nodes.If it *is* a keyword, but not an accessor, check a little farther along
            // to see if it should actually be parsed as a class member.
            switch (this.lexer.peek().type) {
                case 47 /* openParen */: // nodes.Method declaration
                case 54 /* lessThan */: // nodes.Generic nodes.Method declaration
                case 105 /* colon */: // nodes.Type nodes.Annotation for declaration
                case 83 /* equals */: // nodes.Initializer for declaration
                case 97 /* question */:
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
    };
    Parser.prototype.parseModifiersForArrowFunction = function () {
        var flags = 0;
        var modifiers;
        if (this.lexer.peek().type === 7 /* async */) {
            var modifierStart = this.lexer.getStartPos();
            var modifierKind = this.lexer.peek().type;
            this.lexer.read().type;
            modifiers = [];
            modifiers.pos = modifierStart;
            flags |= modifierToFlag(modifierKind);
            modifiers.push(this.finishNode(this.createNode(modifierKind, modifierStart)));
            modifiers.flags = flags;
            modifiers.end = this.lexer.getStartPos();
        }
        return modifiers;
    };
    Parser.prototype.parseClassElement = function () {
        if (this.lexer.peek().type === 106 /* semicolon */) {
            var ;
            this.result = new nodes.SemicolonClassElement();
            this.lexer.read().type;
            return this.finishNode(this.result);
        }
        var fullStart = this.getNodePos();
        var decorators = this.parseDecoratorList();
        var modifiers = this.parseModifierList(/*permitInvalidConstAsModifier*/ true);
        var accessor = this.tryParseAccessorDeclaration(fullStart, decorators, modifiers);
        if (accessor) {
            return accessor;
        }
        if (this.lexer.peek().type === 147 /* constructor */) {
            return this.parseConstructorDeclaration(fullStart, decorators, modifiers);
        }
        if (this.isIndexSignature()) {
            return this.parseIndexSignatureDeclaration(fullStart, decorators, modifiers);
        }
        // nodes.It is very important that we check this *after* checking indexers because
        // the [ this.lexer.peek().type can start an index signature or a computed property name
        if (tokenIsIdentifierOrKeyword(this.lexer.peek().type) ||
            this.lexer.peek().type === tokenType_1.TokenType.StringLiteral ||
            this.lexer.peek().type === tokenType_1.TokenType.NumericLiteral ||
            this.lexer.peek().type === 62 /* asterisk */ ||
            this.lexer.peek().type === 48 /* openBracket */) {
            return this.parsePropertyOrMethodDeclaration(fullStart, decorators, modifiers);
        }
        if (decorators || modifiers) {
            // treat this as a property declaration with a missing name.
            var name_1 = this.createMissingNode(tokenType_1.TokenType.Identifier, /*reportAtCurrentPosition*/ true, nodes.Diagnostics.Declaration_expected);
            return this.parsePropertyDeclaration(fullStart, decorators, modifiers, name_1, /*questionToken*/ undefined);
        }
        // 'this.isClassMemberStart' should have hinted not to attempt parsing.
        nodes.Debug.fail("nodes.Should not have attempted to parse class member declaration.");
    };
    Parser.prototype.parseClassExpression = function () {
        return this.parseClassDeclarationOrExpression(
        /*fullStart*/ this.lexer.getStartPos(), 
        /*decorators*/ undefined, 
        /*modifiers*/ undefined, tokenType_1.TokenType.ClassExpression);
    };
    Parser.prototype.parseClassDeclaration = function (fullStart, decorators, modifiers) {
        return this.parseClassDeclarationOrExpression(fullStart, decorators, modifiers, tokenType_1.TokenType.ClassDeclaration);
    };
    Parser.prototype.parseClassDeclarationOrExpression = function (fullStart, decorators, modifiers, kind) {
        var result = new nodes.ClassLikeDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        this.readToken(18 /* class */);
        result.name = this.parseNameOfClassDeclarationOrExpression();
        result.typeParameters = this.parseTypeParameterDeclarations();
        result.heritageClauses = this.parseHeritageClauses(/*isClassHeritageClause*/ true);
        if (this.readToken(36 /* openBrace */)) {
            // nodes.ClassTail[nodes.Yield,nodes.Await] : (nodes.Modified) nodes.See 14.5
            //      nodes.ClassHeritage[?nodes.Yield,?nodes.Await]opt { nodes.ClassBody[?nodes.Yield,?nodes.Await]opt }
            result.members = this.parseClassMembers();
            this.readToken(104 /* closeBrace */);
        }
        else {
            result.members = this.createMissingList();
        }
        return result;
    };
    Parser.prototype.parseNameOfClassDeclarationOrExpression = function () {
        // implements is a future reserved word so
        // 'class implements' might mean either
        // - class expression with omitted name, 'implements' starts heritage clause
        // - class with name 'implements'
        // 'this.isImplementsClause' helps to disambiguate between these two cases
        return this.isIdentifier() && !this.isImplementsClause()
            ? this.parseIdentifier()
            : undefined;
    };
    Parser.prototype.isImplementsClause = function () {
        return this.lexer.peek().type === 141 /* implements */ && this.lookAhead(this.nextTokenIsIdentifierOrKeyword);
    };
    Parser.prototype.parseHeritageClauses = function (isClassHeritageClause) {
        // nodes.ClassTail[nodes.Yield,nodes.Await] : (nodes.Modified) nodes.See 14.5
        //      nodes.ClassHeritage[?nodes.Yield,?nodes.Await]opt { nodes.ClassBody[?nodes.Yield,?nodes.Await]opt }
        if (this.isHeritageClause()) {
            return this.parseList(nodes.ParsingContext.HeritageClauses, this.parseHeritageClause);
        }
        return undefined;
    };
    Parser.prototype.parseHeritageClause = function () {
        if (this.lexer.peek().type === 140 /* extends */ || this.lexer.peek().type === 141 /* implements */) {
            var result = new nodes.HeritageClause();
            result.token = this.lexer.peek().type;
            this.lexer.read().type;
            result.types = this.parseDelimitedList(nodes.ParsingContext.HeritageClauseElement, this.parseExpressionWithTypeArguments);
            return result;
        }
        return undefined;
    };
    Parser.prototype.parseExpressionWithTypeArguments = function () {
        var result = new nodes.ExpressionWithTypeArguments();
        result.expression = this.parseLeftHandSideExpressionOrHigher();
        if (this.lexer.peek().type === 54 /* lessThan */) {
            result.typeArguments = this.parseBracketedList(nodes.ParsingContext.TypeArguments, this.parseTypeNode, 54 /* lessThan */, 67 /* greaterThan */);
        }
        return result;
    };
    Parser.prototype.isHeritageClause = function () {
        return this.lexer.peek().type === 140 /* extends */ || this.lexer.peek().type === 141 /* implements */;
    };
    Parser.prototype.parseClassMembers = function () {
        return this.parseList(nodes.ParsingContext.ClassMembers, this.parseClassElement);
    };
    Parser.prototype.parseInterfaceDeclaration = function (fullStart, decorators, modifiers) {
        var result = new nodes.InterfaceDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        this.readToken(17 /* interface */);
        result.name = this.parseIdentifier();
        result.typeParameters = this.parseTypeParameterDeclarations();
        result.heritageClauses = this.parseHeritageClauses(/*isClassHeritageClause*/ false);
        result.members = this.parseObjectTypeMembers();
        return result;
    };
    Parser.prototype.parseTypeAliasDeclaration = function (fullStart, decorators, modifiers) {
        var result = new nodes.TypeAliasDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        this.readToken(128 /* type */);
        result.name = this.parseIdentifier();
        result.typeParameters = this.parseTypeParameterDeclarations();
        this.readToken(83 /* equals */);
        result.type = this.parseTypeNode();
        this.tryReadSemicolon();
        return result;
    };
    // nodes.In an ambient declaration, the grammar only allows integer literals as initializers.
    // nodes.In a non-ambient declaration, the grammar allows uninitialized members only in a
    // nodes.ConstantEnumMemberSection, which starts at the beginning of an this.enum declaration
    // or any time an integer literal initializer is encountered.
    Parser.prototype.parseEnumMember = function () {
        var result = new nodes.EnumMember();
        result.name = this.parsePropertyName();
        result.initializer = this.allowInAnd(this.parseNonParameterInitializer);
        return result;
    };
    Parser.prototype.parseEnumDeclaration = function (fullStart, decorators, modifiers) {
        var result = new nodes.EnumDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        this.readToken(16 /* enum */);
        result.name = this.parseIdentifier();
        if (this.readToken(36 /* openBrace */)) {
            result.members = this.parseDelimitedList(nodes.ParsingContext.EnumMembers, this.parseEnumMember);
            this.readToken(104 /* closeBrace */);
        }
        else {
            result.members = this.createMissingList();
        }
        return result;
    };
    Parser.prototype.parseModuleBlock = function () {
        var result = new nodes.ModuleBlock();
        if (this.readToken(36 /* openBrace */)) {
            result.statements = this.parseList(nodes.ParsingContext.BlockStatements, this.parseStatement);
            this.readToken(104 /* closeBrace */);
        }
        else {
            result.statements = this.createMissingList();
        }
        return result;
    };
    Parser.prototype.parseModuleOrNamespaceDeclaration = function (fullStart, decorators, modifiers, flags) {
        var result = new nodes.ModuleDeclaration();
        // nodes.If we are parsing a dotted namespace name, we want to
        // propagate the 'nodes.Namespace' flag across the names if set.
        var namespaceFlag = flags & nodes.NodeFlags.Namespace;
        result.decorators = decorators;
        result.modifiers = modifiers;
        result.flags |= flags;
        result.name = this.parseIdentifier();
        result.body = this.tryReadToken(59 /* dot */)
            ? this.parseModuleOrNamespaceDeclaration(this.getNodePos(), /*decorators*/ undefined, /*modifiers*/ undefined, nodes.NodeFlags.Export | namespaceFlag)
            : this.parseModuleBlock();
        return result;
    };
    Parser.prototype.parseAmbientExternalModuleDeclaration = function (fullStart, decorators, modifiers) {
        var result = new nodes.ModuleDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        if (this.lexer.peek().type === 148 /* global */) {
            // parse 'global' as name of global scope augmentation
            result.name = this.parseIdentifier();
            result.flags |= nodes.NodeFlags.GlobalAugmentation;
        }
        else {
            result.name = this.parseLiteralNode(/*internName*/ true);
        }
        if (this.lexer.peek().type === 36 /* openBrace */) {
            result.body = this.parseModuleBlock();
        }
        else {
            this.tryReadSemicolon();
        }
        return result;
    };
    Parser.prototype.parseModuleDeclaration = function (fullStart, decorators, modifiers) {
        var flags = modifiers ? modifiers.flags : 0;
        if (this.lexer.peek().type === 148 /* global */) {
            // global augmentation
            return this.parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
        }
        else if (this.tryReadToken(129 /* namespace */)) {
            flags |= nodes.NodeFlags.Namespace;
        }
        else {
            this.readToken(130 /* module */);
            if (this.lexer.peek().type === tokenType_1.TokenType.StringLiteral) {
                return this.parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
            }
        }
        return this.parseModuleOrNamespaceDeclaration(fullStart, decorators, modifiers, flags);
    };
    Parser.prototype.isExternalModuleReference = function () {
        return this.lexer.peek().type === tokenType_1.TokenType.require &&
            this.lookAhead(this.nextTokenIsOpenParen);
    };
    Parser.prototype.nextTokenIsOpenParen = function () {
        return this.lexer.read().type === 47 /* openParen */;
    };
    Parser.prototype.nextTokenIsSlash = function () {
        return this.lexer.read().type === 51 /* slash */;
    };
    // #endregion
    // #region 解析导入导出
    Parser.prototype.parseNamespaceExportDeclaration = function (fullStart, decorators, modifiers) {
        var exportDeclaration = new nodes.NamespaceExportDeclaration();
        exportDeclaration.decorators = decorators;
        exportDeclaration.modifiers = modifiers;
        this.readToken(99 /* as */);
        this.readToken(129 /* namespace */);
        exportDeclaration.name = this.parseIdentifier();
        this.readToken(106 /* semicolon */);
        return this.finishNode(exportDeclaration);
    };
    Parser.prototype.parseImportDeclarationOrImportEqualsDeclaration = function (fullStart, decorators, modifiers) {
        this.readToken(126 /* import */);
        var afterImportPos = this.lexer.getStartPos();
        var identifier;
        if (this.isIdentifier()) {
            identifier = this.parseIdentifier();
            if (this.lexer.peek().type !== 98 /* comma */ && this.lexer.peek().type !== 139 /* from */) {
                // nodes.ImportEquals declaration of type:
                // import x = require("mod"); or
                // import x = M.x;
                var importEqualsDeclaration = new nodes.ImportEqualsDeclaration();
                importEqualsDeclaration.decorators = decorators;
                importEqualsDeclaration.modifiers = modifiers;
                importEqualsDeclaration.name = identifier;
                this.readToken(83 /* equals */);
                importEqualsDeclaration.moduleReference = this.parseModuleReference();
                this.tryReadSemicolon();
                return this.finishNode(importEqualsDeclaration);
            }
        }
        // nodes.Import statement
        var importDeclaration = new nodes.ImportDeclaration();
        importDeclaration.decorators = decorators;
        importDeclaration.modifiers = modifiers;
        // nodes.ImportDeclaration:
        //  import nodes.ImportClause from nodes.ModuleSpecifier ;
        //  import nodes.ModuleSpecifier;
        if (identifier ||
            this.lexer.peek().type === 62 /* asterisk */ ||
            this.lexer.peek().type === 36 /* openBrace */) {
            importDeclaration.importClause = this.parseImportClause(identifier, afterImportPos);
            this.readToken(139 /* from */);
        }
        importDeclaration.moduleSpecifier = this.parseModuleSpecifier();
        this.tryReadSemicolon();
        return this.finishNode(importDeclaration);
    };
    Parser.prototype.parseImportClause = function (identifier, fullStart) {
        // nodes.ImportClause:
        //  nodes.ImportedDefaultBinding
        //  nodes.NameSpaceImport
        //  nodes.NamedImports
        //  nodes.ImportedDefaultBinding, nodes.NameSpaceImport
        //  nodes.ImportedDefaultBinding, nodes.NamedImports
        var importClause = new nodes.ImportClause();
        if (identifier) {
            // nodes.ImportedDefaultBinding:
            //  nodes.ImportedBinding
            importClause.name = identifier;
        }
        // nodes.If there was no default import or if there is comma this.lexer.peek().type after default import
        // parse namespace or named imports
        if (!importClause.name ||
            this.tryReadToken(98 /* comma */)) {
            importClause.namedBindings = this.lexer.peek().type === 62 /* asterisk */ ? this.parseNamespaceImport() : this.parseNamedImportsOrExports(tokenType_1.TokenType.NamedImports);
        }
        return this.finishNode(importClause);
    };
    Parser.prototype.parseModuleReference = function () {
        return this.isExternalModuleReference()
            ? this.parseExternalModuleReference()
            : this.parseEntityName(/*allowReservedWords*/ false);
    };
    Parser.prototype.parseExternalModuleReference = function () {
        var result = new nodes.ExternalModuleReference();
        this.readToken(tokenType_1.TokenType.require);
        this.readToken(47 /* openParen */);
        result.expression = this.parseModuleSpecifier();
        this.readToken(102 /* closeParen */);
        return result;
    };
    Parser.prototype.parseModuleSpecifier = function () {
        if (this.lexer.peek().type === tokenType_1.TokenType.StringLiteral) {
            var ;
            this.result = this.parseLiteralNode();
            this.internIdentifier(this.result.text);
            return this.result;
        }
        else {
            // nodes.We allow arbitrary expressions here, even though the grammar only allows string
            // literals.  nodes.We check to ensure that it is only a string literal later in the grammar
            // check pass.
            return this.parseExpression();
        }
    };
    Parser.prototype.parseNamespaceImport = function () {
        // nodes.NameSpaceImport:
        //  * as nodes.ImportedBinding
        var namespaceImport = new nodes.NamespaceImport();
        this.readToken(62 /* asterisk */);
        this.readToken(99 /* as */);
        namespaceImport.name = this.parseIdentifier();
        return this.finishNode(namespaceImport);
    };
    Parser.prototype.parseNamedImportsOrExports = function (kind) {
        var result = new nodes.NamedImports();
        // nodes.NamedImports:
        //  { }
        //  { nodes.ImportsList }
        //  { nodes.ImportsList, }
        // nodes.ImportsList:
        //  nodes.ImportSpecifier
        //  nodes.ImportsList, nodes.ImportSpecifier
        result.elements = this.parseBracketedList(nodes.ParsingContext.ImportOrExportSpecifiers, kind === tokenType_1.TokenType.NamedImports ? this.parseImportSpecifier : this.parseExportSpecifier, 36 /* openBrace */, 104 /* closeBrace */);
        return result;
    };
    Parser.prototype.parseExportSpecifier = function () {
        return this.parseImportOrExportSpecifier(tokenType_1.TokenType.ExportSpecifier);
    };
    Parser.prototype.parseImportSpecifier = function () {
        return this.parseImportOrExportSpecifier(tokenType_1.TokenType.ImportSpecifier);
    };
    Parser.prototype.parseImportOrExportSpecifier = function (kind) {
        var result = new nodes.ImportSpecifier();
        // nodes.ImportSpecifier:
        //   nodes.BindingIdentifier
        //   nodes.IdentifierName as nodes.BindingIdentifier
        // nodes.ExportSpecifier:
        //   nodes.IdentifierName
        //   nodes.IdentifierName as nodes.IdentifierName
        var checkIdentifierIsKeyword = tokenType_1.isKeyword(this.lexer.peek().type) && !this.isIdentifier();
        var checkIdentifierStart = this.lexer.getTokenPos();
        var checkIdentifierEnd = this.lexer.getTextPos();
        var identifierName = this.parseIdentifierName();
        if (this.lexer.peek().type === 99 /* as */) {
            result.propertyName = identifierName;
            this.readToken(99 /* as */);
            checkIdentifierIsKeyword = tokenType_1.isKeyword(this.lexer.peek().type) && !this.isIdentifier();
            checkIdentifierStart = this.lexer.getTokenPos();
            checkIdentifierEnd = this.lexer.getTextPos();
            result.name = this.parseIdentifierName();
        }
        else {
            result.name = identifierName;
        }
        if (kind === tokenType_1.TokenType.ImportSpecifier && checkIdentifierIsKeyword) {
            // nodes.Report error identifier expected
            this.parseErrorAtPosition(checkIdentifierStart, checkIdentifierEnd - checkIdentifierStart, nodes.Diagnostics.Identifier_expected);
        }
        return result;
    };
    Parser.prototype.parseExportDeclaration = function (fullStart, decorators, modifiers) {
        var result = new nodes.ExportDeclaration();
        result.decorators = decorators;
        result.modifiers = modifiers;
        if (this.tryReadToken(62 /* asterisk */)) {
            this.readToken(139 /* from */);
            result.moduleSpecifier = this.parseModuleSpecifier();
        }
        else {
            result.exportClause = this.parseNamedImportsOrExports(tokenType_1.TokenType.NamedExports);
            // nodes.It is not uncommon to accidentally omit the 'from' keyword. nodes.Additionally, in editing scenarios,
            // the 'from' keyword can be parsed as a named export when the export clause is unterminated (i.e. `export { from "moduleName";`)
            // nodes.If we don't have a 'from' keyword, see if we have a string literal such that nodes.ASI won't take effect.
            if (this.lexer.peek().type === 139 /* from */ || (this.lexer.peek().type === tokenType_1.TokenType.StringLiteral && !this.lexer.peek().hasLineBreakBeforeStart)) {
                this.readToken(139 /* from */);
                result.moduleSpecifier = this.parseModuleSpecifier();
            }
        }
        this.tryReadSemicolon();
        return result;
    };
    Parser.prototype.parseExportAssignment = function (fullStart, decorators, modifiers) {
        var result = new nodes.ExportAssignment();
        result.decorators = decorators;
        result.modifiers = modifiers;
        if (this.tryReadToken(83 /* equals */)) {
            result.isExportEquals = true;
        }
        else {
            this.readToken(135 /* default */);
        }
        result.expression = this.parseAssignmentExpressionOrHigher();
        this.tryReadSemicolon();
        return result;
    };
    Parser.prototype.processReferenceComments = function (sourceFile) {
        var triviaScanner = createScanner(this.sourceFile.languageVersion, /*skipTrivia*/ false, nodes.LanguageVariant.Standard, this.sourceText);
        var referencedFiles = [];
        var typeReferenceDirectives = [];
        var amdDependencies = [];
        var amdModuleName;
        // nodes.Keep scanning all the leading trivia in the file until we get to something that
        // isn't trivia.  nodes.Any single line comment will be analyzed to see if it is a
        // reference comment.
        while (true) {
            var kind = triviaScanner.scan();
            if (kind !== tokenType_1.TokenType.singleLineComment) {
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
                        this.parseDiagnostics.push(createFileDiagnostic(this.sourceFile, range.pos, range.end - range.pos, nodes.Diagnostics.An_AMD_module_cannot_have_multiple_name_assignments));
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
    };
    Parser.prototype.setExternalModuleIndicator = function (sourceFile) {
        this.sourceFile.externalModuleIndicator = forEach(this.sourceFile.statements, function (result) {
            return result.flags & nodes.NodeFlags.Export
                || result.kind === tokenType_1.TokenType.ImportEqualsDeclaration && result.moduleReference.kind === tokenType_1.TokenType.ExternalModuleReference
                || result.kind === tokenType_1.TokenType.ImportDeclaration
                || result.kind === tokenType_1.TokenType.ExportAssignment
                || result.kind === tokenType_1.TokenType.ExportDeclaration
                ? result
                : undefined;
        });
    };
    // #endregion
    // #region 解析文档注释
    Parser.prototype.parseJsDocComment = function (result) {
    };
    Parser.prototype.parseSourceFile = function (fileName, _sourceText, languageVersion, _syntaxCursor, setParentNodes, scriptKind) {
        scriptKind = ensureScriptKind(fileName, scriptKind);
        this.initializeState(fileName, _sourceText, languageVersion, _syntaxCursor, scriptKind);
        var ;
        this.result = this.parseSourceFileWorker(fileName, languageVersion, setParentNodes, scriptKind);
        this.clearState();
        return this.result;
    };
    Parser.prototype.initializeState = function (fileName, _sourceText, languageVersion, _syntaxCursor, scriptKind) {
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
    };
    Parser.prototype.clearState = function () {
        // nodes.Clear out the text the this.scanner is pointing at, so it doesn't keep anything alive unnecessarily.
        this.lexer.setText("");
        // nodes.Clear any data.  nodes.We don't want to accidentally hold onto it for too long.
        this.parseDiagnostics = undefined;
        this.sourceFile = undefined;
        this.identifiers = undefined;
        this.syntaxCursor = undefined;
        this.sourceText = undefined;
    };
    Parser.prototype.parseSourceFileWorker = function (fileName, languageVersion, setParentNodes, scriptKind) {
        this.sourceFile = this.createSourceFile(fileName, languageVersion, scriptKind);
        this.sourceFile.flags = this.contextFlags;
        // nodes.Prime the this.scanner.
        this.lexer.peek().type = this.lexer.read().type;
        this.processReferenceComments(this.sourceFile);
        this.sourceFile.statements = this.parseList(nodes.ParsingContext.SourceElements, this.parseStatement);
        console.assert(this.lexer.peek().type === 1 /* endOfFile */);
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
    };
    Parser.prototype.parseJsDocComment = function (result) {
        if (this.contextFlags & nodes.NodeFlags.JavaScriptFile) {
            var comments = getLeadingCommentRangesOfNode(result, this.sourceFile);
            if (comments) {
                for (var _i = 0, comments_1 = comments; _i < comments_1.length; _i++) {
                    var comment = comments_1[_i];
                    var jsDocComment = nodes.JSDocParser.parseJSDocComment(result, comment.pos, comment.end - comment.pos);
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
    };
    Parser.prototype.fixupParentReferences = function (rootNode) {
        // normally parent references are set during binding. nodes.However, for clients that only need
        // a syntax tree, and no semantic features, then the binding process is an unnecessary
        // overhead.  nodes.This functions allows us to set all the parents, without all the expense of
        // binding.
        var parent = rootNode;
        forEachChild(rootNode, visitNode);
        return;
        function visitNode(n) {
            // walk down setting parents that differ from the parent we think it should be.  nodes.This
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
    };
    Parser.prototype.createSourceFile = function (fileName, languageVersion, scriptKind) {
        // code from this.createNode is inlined here so this.createNode won't have to deal with special case of creating source files
        // this is quite rare comparing to other nodes and this.createNode should be as fast as possible
        var ;
        this.sourceFile = new this.SourceFileConstructor(tokenType_1.TokenType.SourceFile, /*pos*/ 0, /* end */ this.sourceText.length);
        this.nodeCount++;
        this.sourceFile.text = this.sourceText;
        this.sourceFile.bindDiagnostics = [];
        this.sourceFile.languageVersion = languageVersion;
        this.sourceFile.fileName = normalizePath(fileName);
        this.sourceFile.languageVariant = getLanguageVariant(scriptKind);
        this.sourceFile.isDeclarationFile = fileExtensionIs(this.sourceFile.fileName, ".d.ts");
        this.sourceFile.scriptKind = scriptKind;
        return this.sourceFile;
    };
    Parser.prototype.setContextFlag = function (val, flag) {
        if (val) {
            this.contextFlags |= flag;
        }
        else {
            this.contextFlags &= ~flag;
        }
    };
    Parser.prototype.setDisallowInContext = function (val) {
        this.setContextFlag(val, nodes.NodeFlags.DisallowInContext);
    };
    Parser.prototype.setYieldContext = function (val) {
        this.setContextFlag(val, nodes.NodeFlags.YieldContext);
    };
    Parser.prototype.setDecoratorContext = function (val) {
        this.setContextFlag(val, nodes.NodeFlags.DecoratorContext);
    };
    Parser.prototype.setAwaitContext = function (val) {
        this.setContextFlag(val, nodes.NodeFlags.AwaitContext);
    };
    Parser.prototype.doOutsideOfContext = function (context, func) {
        // contextFlagsToClear will contain only the context flags that are
        // currently set that we need to temporarily clear
        // nodes.We don't just blindly reset to the previous flags to ensure
        // that we do not mutate cached flags for the incremental
        // parser (nodes.ThisNodeHasError, nodes.ThisNodeOrAnySubNodesHasError, and
        // nodes.HasAggregatedChildData).
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
    };
    Parser.prototype.doInsideOfContext = function (context, func) {
        // contextFlagsToSet will contain only the context flags that
        // are not currently set that we need to temporarily enable.
        // nodes.We don't just blindly reset to the previous flags to ensure
        // that we do not mutate cached flags for the incremental
        // parser (nodes.ThisNodeHasError, nodes.ThisNodeOrAnySubNodesHasError, and
        // nodes.HasAggregatedChildData).
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
    };
    Parser.prototype.allowInAnd = function (func) {
        return this.doOutsideOfContext(nodes.NodeFlags.DisallowInContext, func);
    };
    Parser.prototype.disallowInAnd = function (func) {
        return this.doInsideOfContext(nodes.NodeFlags.DisallowInContext, func);
    };
    Parser.prototype.doInYieldContext = function (func) {
        return this.doInsideOfContext(nodes.NodeFlags.YieldContext, func);
    };
    Parser.prototype.doInDecoratorContext = function (func) {
        return this.doInsideOfContext(nodes.NodeFlags.DecoratorContext, func);
    };
    Parser.prototype.doInAwaitContext = function (func) {
        return this.doInsideOfContext(nodes.NodeFlags.AwaitContext, func);
    };
    Parser.prototype.doOutsideOfAwaitContext = function (func) {
        return this.doOutsideOfContext(nodes.NodeFlags.AwaitContext, func);
    };
    Parser.prototype.doInYieldAndAwaitContext = function (func) {
        return this.doInsideOfContext(nodes.NodeFlags.YieldContext | nodes.NodeFlags.AwaitContext, func);
    };
    Parser.prototype.inContext = function (flags) {
        return (this.contextFlags & flags) !== 0;
    };
    Parser.prototype.inYieldContext = function () {
        return this.inContext(nodes.NodeFlags.YieldContext);
    };
    Parser.prototype.inDisallowInContext = function () {
        return this.inContext(nodes.NodeFlags.DisallowInContext);
    };
    Parser.prototype.inDecoratorContext = function () {
        return this.inContext(nodes.NodeFlags.DecoratorContext);
    };
    Parser.prototype.inAwaitContext = function () {
        return this.inContext(nodes.NodeFlags.AwaitContext);
    };
    Parser.prototype.parseErrorAtCurrentToken = function (message, arg0) {
        var start = this.lexer.getTokenPos();
        var length = this.lexer.getTextPos() - start;
        this.parseErrorAtPosition(start, length, message, arg0);
    };
    Parser.prototype.parseErrorAtPosition = function (start, length, message, arg0) {
        // nodes.Don't report another error if it would just be at the same position as the last error.
        var lastError = lastOrUndefined(this.parseDiagnostics);
        if (!lastError || start !== lastError.start) {
            this.parseDiagnostics.push(createFileDiagnostic(this.sourceFile, start, length, message, arg0));
        }
        // nodes.Mark that we've encountered an error.  nodes.We'll set an appropriate bit on the next
        // result we finish so that it can't be reused incrementally.
        this.parseErrorBeforeNextFinishedNode = true;
    };
    Parser.prototype.scanError = function (message, length) {
        var pos = this.lexer.getTextPos();
        this.parseErrorAtPosition(pos, length || 0, message);
    };
    Parser.prototype.getNodePos = function () {
        return this.lexer.getStartPos();
    };
    Parser.prototype.getNodeEnd = function () {
        return this.lexer.getStartPos();
    };
    Parser.prototype.reScanGreaterToken = function () {
        return this.lexer.peek().type = this.lexer.reScanGreaterToken();
    };
    Parser.prototype.reScanSlashToken = function () {
        return this.lexer.peek().type = this.lexer.reScanSlashToken();
    };
    Parser.prototype.reScanTemplateToken = function () {
        return this.lexer.peek().type = this.lexer.reScanTemplateToken();
    };
    Parser.prototype.scanJsxIdentifier = function () {
        return this.lexer.peek().type = this.lexer.scanJsxIdentifier();
    };
    Parser.prototype.scanJsxText = function () {
        return this.lexer.peek().type = this.lexer.scanJsxToken();
    };
    Parser.prototype.speculationHelper = function (callback, isLookAhead) {
        // nodes.Keep track of the state we'll need to rollback to if lookahead fails (or if the
        // caller asked us to always reset our state).
        var saveToken = this.lexer.peek().type;
        var saveParseDiagnosticsLength = this.parseDiagnostics.length;
        var saveParseErrorBeforeNextFinishedNode = this.parseErrorBeforeNextFinishedNode;
        // nodes.Note: it is not actually necessary to save/restore the context flags here.  nodes.That's
        // because the saving/restoring of these flags happens naturally through the recursive
        // descent nature of our parser.  nodes.However, we still store this here just so we can
        // assert that that invariant holds.
        var saveContextFlags = this.contextFlags;
        // nodes.If we're only looking ahead, then tell the this.scanner to only lookahead as well.
        // nodes.Otherwise, if we're actually speculatively parsing, then tell the this.scanner to do the
        // same.
        var ;
        this.result = isLookAhead
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
    };
    /** nodes.Invokes the provided callback then unconditionally restores the parser to the state it
     * was in immediately prior to invoking the callback.  nodes.The this.result of invoking the callback
     * is returned from this function.
     */
    Parser.prototype.lookAhead = function (callback) {
        return this.speculationHelper(callback, /*isLookAhead*/ true);
    };
    Parser.prototype.tryReadTokenToken = function (t) {
        if (this.lexer.peek().type === t) {
            return this.parseTokenNode();
        }
        return undefined;
    };
    Parser.prototype.readTokenToken = function (t, reportAtCurrentPosition, diagnosticMessage, arg0) {
        return this.tryReadTokenToken(t) ||
            this.createMissingNode(t, reportAtCurrentPosition, diagnosticMessage, arg0);
    };
    Parser.prototype.parseTokenNode = function () {
        var result = new T();
        this.lexer.read().type;
        return result;
    };
    Parser.prototype.canParseSemicolon = function () {
        // nodes.If there's a real semicolon, then we can always parse it out.
        if (this.lexer.peek().type === 106 /* semicolon */) {
            return true;
        }
        // nodes.We can parse out an optional semicolon in nodes.ASI cases in the following cases.
        return this.lexer.peek().type === 104 /* closeBrace */ || this.lexer.peek().type === 1 /* endOfFile */ || this.lexer.peek().hasLineBreakBeforeStart;
    };
    Parser.prototype.parseSemicolon = function () {
        if (this.canParseSemicolon()) {
            if (this.lexer.peek().type === 106 /* semicolon */) {
                // consume the semicolon if it was explicitly provided.
                this.lexer.read().type;
            }
            return true;
        }
        else {
            return this.readToken(106 /* semicolon */);
        }
    };
    Parser.prototype.finishNode = function (result, end) {
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
    };
    Parser.prototype.createMissingNode = function (kind, reportAtCurrentPosition, diagnosticMessage, arg0) {
        if (reportAtCurrentPosition) {
            this.parseErrorAtPosition(this.lexer.getStartPos(), 0, diagnosticMessage, arg0);
        }
        else {
            this.parseErrorAtCurrentToken(diagnosticMessage, arg0);
        }
        var ;
        this.result = this.createNode(kind, this.lexer.getStartPos());
        this.result.text = "";
        return this.finishNode(this.result);
    };
    Parser.prototype.internIdentifier = function (text) {
        text = escapeIdentifier(text);
        return hasProperty(this.identifiers, text) ? this.identifiers[text] : (this.identifiers[text] = text);
    };
    // nodes.An identifier that starts with two underscores has an extra underscore character prepended to it to avoid issues
    // with magic property names like '__proto__'. nodes.The 'this.identifiers' object is used to share a single string instance for
    // each identifier in order to reduce memory consumption.
    Parser.prototype.createIdentifier = function () {
        this.identifierCount++;
        if (this.isIdentifier) {
            var result = new nodes.Identifier();
            // nodes.Store original this.lexer.peek().type kind if it is not just an nodes.Identifier so we can report appropriate error later in type checker
            if (this.lexer.peek().type !== tokenType_1.TokenType.Identifier) {
                result.originalKeywordKind = this.lexer.peek().type;
            }
            result.text = this.internIdentifier(this.lexer.getTokenValue());
            this.lexer.read().type;
            return result;
        }
        return this.createMissingNode(tokenType_1.TokenType.Identifier, /*reportAtCurrentPosition*/ false, diagnosticMessage || nodes.Diagnostics.Identifier_expected);
    };
    Parser.prototype.parseIdentifier = function (diagnosticMessage) {
        return this.createIdentifier(this.isIdentifier(), diagnosticMessage);
    };
    Parser.prototype.parseIdentifierName = function () {
        return this.createIdentifier(tokenIsIdentifierOrKeyword(this.lexer.peek().type));
    };
    Parser.prototype.isLiteralPropertyName = function () {
        return tokenIsIdentifierOrKeyword(this.lexer.peek().type) ||
            this.lexer.peek().type === tokenType_1.TokenType.StringLiteral ||
            this.lexer.peek().type === tokenType_1.TokenType.NumericLiteral;
    };
    Parser.prototype.parsePropertyNameWorker = function (allowComputedPropertyNames) {
        if (this.lexer.peek().type === tokenType_1.TokenType.StringLiteral || this.lexer.peek().type === tokenType_1.TokenType.NumericLiteral) {
            return this.parseLiteralNode(/*internName*/ true);
        }
        if (allowComputedPropertyNames && this.lexer.peek().type === 48 /* openBracket */) {
            return this.parseComputedPropertyName();
        }
        return this.parseIdentifierName();
    };
    Parser.prototype.parsePropertyName = function () {
        return this.parsePropertyNameWorker(/*allowComputedPropertyNames*/ true);
    };
    Parser.prototype.parseSimplePropertyName = function () {
        return this.parsePropertyNameWorker(/*allowComputedPropertyNames*/ false);
    };
    Parser.prototype.isSimplePropertyName = function () {
        return this.lexer.peek().type === tokenType_1.TokenType.StringLiteral || this.lexer.peek().type === tokenType_1.TokenType.NumericLiteral || tokenIsIdentifierOrKeyword(this.lexer.peek().type);
    };
    Parser.prototype.parseComputedPropertyName = function () {
        // nodes.PropertyName [nodes.Yield]:
        //      nodes.LiteralPropertyName
        //      nodes.ComputedPropertyName[?nodes.Yield]
        var result = new nodes.ComputedPropertyName();
        this.readToken(48 /* openBracket */);
        // nodes.We parse any expression (including a comma expression). nodes.But the grammar
        // says that only an assignment expression is allowed, so the grammar checker
        // will error if it sees a comma expression.
        result.expression = this.allowInAnd(this.parseExpression);
        this.readToken(103 /* closeBracket */);
        return result;
    };
    Parser.prototype.parseContextualModifier = function (t) {
        return this.lexer.peek().type === t && this.tryParse(this.nextTokenCanFollowModifier);
    };
    Parser.prototype.nextTokenIsOnSameLineAndCanFollowModifier = function () {
        this.lexer.read();
        if (this.lexer.peek().hasLineBreakBeforeStart) {
            return false;
        }
        return this.canFollowModifier();
    };
    Parser.prototype.nextTokenIsClassOrFunctionOrAsync = function () {
        this.lexer.read().type;
        return this.lexer.peek().type === 18 /* class */ || this.lexer.peek().type === 20 /* function */ ||
            (this.lexer.peek().type === 7 /* async */ && this.lookAhead(this.nextTokenIsFunctionKeywordOnSameLine));
    };
    // nodes.True if positioned at the start of a list element
    Parser.prototype.isListElement = function (parsingContext, inErrorRecovery) {
        var result = this.currentNode(this.parsingContext);
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
                return !(this.lexer.peek().type === 106 /* semicolon */ && inErrorRecovery) && this.isStartOfStatement();
            case nodes.ParsingContext.SwitchClauses:
                return this.lexer.peek().type === 134 /* case */ || this.lexer.peek().type === 135 /* default */;
            case nodes.ParsingContext.TypeMembers:
                return this.lookAhead(this.isTypeMemberStart);
            case nodes.ParsingContext.ClassMembers:
                // nodes.We allow semicolons as class elements (as specified by nodes.ES6) as long as we're
                // not in error recovery.  nodes.If we're in error recovery, we don't want an errant
                // semicolon to be treated as a class member (since they're almost always used
                // for statements.
                return this.lookAhead(this.isClassMemberStart) || (this.lexer.peek().type === 106 /* semicolon */ && !inErrorRecovery);
            case nodes.ParsingContext.EnumMembers:
                // nodes.Include open bracket computed properties. nodes.This technically also lets in indexers,
                // which would be a candidate for improved error reporting.
                return this.lexer.peek().type === 48 /* openBracket */ || this.isLiteralPropertyName();
            case nodes.ParsingContext.ObjectLiteralMembers:
                return this.lexer.peek().type === 48 /* openBracket */ || this.lexer.peek().type === 62 /* asterisk */ || this.isLiteralPropertyName();
            case nodes.ParsingContext.ObjectBindingElements:
                return this.lexer.peek().type === 48 /* openBracket */ || this.isLiteralPropertyName();
            case nodes.ParsingContext.HeritageClauseElement:
                // nodes.If we see { } then only consume it as an expression if it is followed by , or {
                // nodes.That way we won't consume the body of a class in its heritage clause.
                if (this.lexer.peek().type === 36 /* openBrace */) {
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
                return this.lexer.peek().type === 98 /* comma */ || this.lexer.peek().type === 56 /* dotDotDot */ || this.isIdentifierOrPattern();
            case nodes.ParsingContext.TypeParameters:
                return this.isIdentifier();
            case nodes.ParsingContext.ArgumentExpressions:
            case nodes.ParsingContext.ArrayLiteralMembers:
                return this.lexer.peek().type === 98 /* comma */ || this.lexer.peek().type === 56 /* dotDotDot */ || this.isStartOfExpression();
            case nodes.ParsingContext.Parameters:
                return this.isStartOfParameter();
            case nodes.ParsingContext.TypeArguments:
            case nodes.ParsingContext.TupleElementTypes:
                return this.lexer.peek().type === 98 /* comma */ || this.isStartOfType();
            case nodes.ParsingContext.HeritageClauses:
                return this.isHeritageClause();
            case nodes.ParsingContext.ImportOrExportSpecifiers:
                return tokenIsIdentifierOrKeyword(this.lexer.peek().type);
            case nodes.ParsingContext.JsxAttributes:
                return tokenIsIdentifierOrKeyword(this.lexer.peek().type) || this.lexer.peek().type === 36 /* openBrace */;
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
    };
    Parser.prototype.isValidHeritageClauseObjectLiteral = function () {
        console.assert(this.lexer.peek().type === 36 /* openBrace */);
        if (this.lexer.read().type === 104 /* closeBrace */) {
            // if we see  "extends {}" then only treat the {} as what we're extending (and not
            // the class body) if we have:
            //
            //      extends {} {
            //      extends {},
            //      extends {} extends
            //      extends {} implements
            var next = this.lexer.read().type;
            return next === 98 /* comma */ || next === 36 /* openBrace */ || next === 140 /* extends */ || next === 141 /* implements */;
        }
        return true;
    };
    Parser.prototype.nextTokenIsIdentifier = function () {
        this.lexer.read().type;
        return this.isIdentifier();
    };
    Parser.prototype.nextTokenIsIdentifierOrKeyword = function () {
        this.lexer.read().type;
        return tokenIsIdentifierOrKeyword(this.lexer.peek().type);
    };
    Parser.prototype.isHeritageClauseExtendsOrImplementsKeyword = function () {
        if (this.lexer.peek().type === 141 /* implements */ ||
            this.lexer.peek().type === 140 /* extends */) {
            return this.lookAhead(this.nextTokenIsStartOfExpression);
        }
        return false;
    };
    Parser.prototype.nextTokenIsStartOfExpression = function () {
        this.lexer.read().type;
        return this.isStartOfExpression();
    };
    // nodes.True if positioned at a list terminator
    Parser.prototype.isListTerminator = function (kind) {
        if (this.lexer.peek().type === 1 /* endOfFile */) {
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
                return this.lexer.peek().type === 104 /* closeBrace */;
            case nodes.ParsingContext.SwitchClauseStatements:
                return this.lexer.peek().type === 104 /* closeBrace */ || this.lexer.peek().type === 134 /* case */ || this.lexer.peek().type === 135 /* default */;
            case nodes.ParsingContext.HeritageClauseElement:
                return this.lexer.peek().type === 36 /* openBrace */ || this.lexer.peek().type === 140 /* extends */ || this.lexer.peek().type === 141 /* implements */;
            case nodes.ParsingContext.VariableDeclarations:
                return this.isVariableDeclaratorListTerminator();
            case nodes.ParsingContext.TypeParameters:
                // nodes.Tokens other than '>' are here for better error recovery
                return this.lexer.peek().type === 67 /* greaterThan */ || this.lexer.peek().type === 47 /* openParen */ || this.lexer.peek().type === 36 /* openBrace */ || this.lexer.peek().type === 140 /* extends */ || this.lexer.peek().type === 141 /* implements */;
            case nodes.ParsingContext.ArgumentExpressions:
                // nodes.Tokens other than ')' are here for better error recovery
                return this.lexer.peek().type === 102 /* closeParen */ || this.lexer.peek().type === 106 /* semicolon */;
            case nodes.ParsingContext.ArrayLiteralMembers:
            case nodes.ParsingContext.TupleElementTypes:
            case nodes.ParsingContext.ArrayBindingElements:
                return this.lexer.peek().type === 103 /* closeBracket */;
            case nodes.ParsingContext.Parameters:
                // nodes.Tokens other than ')' and ']' (the latter for index signatures) are here for better error recovery
                return this.lexer.peek().type === 102 /* closeParen */ || this.lexer.peek().type === 103 /* closeBracket */ /*|| this.lexer.peek().type === nodes.SyntaxKind.OpenBraceToken*/;
            case nodes.ParsingContext.TypeArguments:
                // nodes.Tokens other than '>' are here for better error recovery
                return this.lexer.peek().type === 67 /* greaterThan */ || this.lexer.peek().type === 47 /* openParen */;
            case nodes.ParsingContext.HeritageClauses:
                return this.lexer.peek().type === 36 /* openBrace */ || this.lexer.peek().type === 104 /* closeBrace */;
            case nodes.ParsingContext.JsxAttributes:
                return this.lexer.peek().type === 67 /* greaterThan */ || this.lexer.peek().type === 51 /* slash */;
            case nodes.ParsingContext.JsxChildren:
                return this.lexer.peek().type === 54 /* lessThan */ && this.lookAhead(this.nextTokenIsSlash);
            case nodes.ParsingContext.JSDocFunctionParameters:
                return this.lexer.peek().type === 102 /* closeParen */ || this.lexer.peek().type === 105 /* colon */ || this.lexer.peek().type === 104 /* closeBrace */;
            case nodes.ParsingContext.JSDocTypeArguments:
                return this.lexer.peek().type === 67 /* greaterThan */ || this.lexer.peek().type === 104 /* closeBrace */;
            case nodes.ParsingContext.JSDocTupleTypes:
                return this.lexer.peek().type === 103 /* closeBracket */ || this.lexer.peek().type === 104 /* closeBrace */;
            case nodes.ParsingContext.JSDocRecordMembers:
                return this.lexer.peek().type === 104 /* closeBrace */;
        }
    };
    Parser.prototype.isVariableDeclaratorListTerminator = function () {
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
        if (this.lexer.peek().type === 55 /* equalsGreaterThan */) {
            return true;
        }
        // nodes.Keep trying to parse out variable declarators.
        return false;
    };
    // nodes.True if positioned at element or terminator of the current list or any enclosing list
    Parser.prototype.isInSomeParsingContext = function () {
        for (var kind = 0; kind < nodes.ParsingContext.Count; kind++) {
            if (this.parsingContext & (1 << kind)) {
                if (this.isListElement(kind, /*inErrorRecovery*/ true) || this.isListTerminator(kind)) {
                    return true;
                }
            }
        }
        return false;
    };
    // nodes.Parses a list of elements
    Parser.prototype.parseList = function (kind, parseElement) {
        var saveParsingContext = this.parsingContext;
        this.parsingContext |= 1 << kind;
        var ;
        this.result = [];
        this.result.pos = this.getNodePos();
        while (!this.isListTerminator(kind)) {
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
    };
    Parser.prototype.parseListElement = function (parsingContext, parseElement) {
        var result = this.currentNode(this.parsingContext);
        if (result) {
            return this.consumeNode(result);
        }
        return parseElement();
    };
    Parser.prototype.currentNode = function (parsingContext) {
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
        var result = this.syntaxCursor.currentNode(this.lexer.getStartPos());
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
        var nodeContextFlags = result.flags & nodes.NodeFlags.ContextFlags;
        if (nodeContextFlags !== this.contextFlags) {
            return undefined;
        }
        // nodes.Ok, we have a result that looks like it could be reused.  nodes.Now verify that it is valid
        // in the current list parsing context that we're currently at.
        if (!this.canReuseNode(result, this.parsingContext)) {
            return undefined;
        }
        return result;
    };
    Parser.prototype.consumeNode = function (result) {
        // nodes.Move the this.scanner so it is after the result we just consumed.
        this.lexer.setTextPos(result.end);
        this.lexer.read().type;
        return result;
    };
    Parser.prototype.canReuseNode = function (result, parsingContext) {
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
    };
    Parser.prototype.isReusableClassMember = function (result) {
        if (result) {
            switch (result.kind) {
                case tokenType_1.TokenType.Constructor:
                case tokenType_1.TokenType.IndexSignature:
                case tokenType_1.TokenType.GetAccessor:
                case tokenType_1.TokenType.SetAccessor:
                case tokenType_1.TokenType.PropertyDeclaration:
                case tokenType_1.TokenType.SemicolonClassElement:
                    return true;
                case tokenType_1.TokenType.MethodDeclaration:
                    // nodes.Method declarations are not necessarily reusable.  nodes.An object-literal
                    // may have a method calls "constructor(...)" and we must reparse that
                    // into an actual .ConstructorDeclaration.
                    var methodDeclaration = result;
                    var nameIsConstructor = methodDeclaration.name.kind === tokenType_1.TokenType.Identifier &&
                        methodDeclaration.name.originalKeywordKind === 147 /* constructor */;
                    return !nameIsConstructor;
            }
        }
        return false;
    };
    Parser.prototype.isReusableSwitchClause = function (result) {
        if (result) {
            switch (result.kind) {
                case tokenType_1.TokenType.CaseClause:
                case tokenType_1.TokenType.DefaultClause:
                    return true;
            }
        }
        return false;
    };
    Parser.prototype.isReusableStatement = function (result) {
        if (result) {
            switch (result.kind) {
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
    Parser.prototype.isReusableEnumMember = function (result) {
        return result.kind === tokenType_1.TokenType.EnumMember;
    };
    Parser.prototype.isReusableTypeMember = function (result) {
        if (result) {
            switch (result.kind) {
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
    Parser.prototype.isReusableVariableDeclaration = function (result) {
        if (result.kind !== tokenType_1.TokenType.VariableDeclaration) {
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
        var variableDeclarator = result;
        return variableDeclarator.initializer === undefined;
    };
    Parser.prototype.isReusableParameter = function (result) {
        if (result.kind !== tokenType_1.TokenType.Parameter) {
            return false;
        }
        // nodes.See the comment in this.isReusableVariableDeclaration for why we do this.
        var parameter = result;
        return parameter.initializer === undefined;
    };
    // nodes.Returns true if we should abort parsing.
    Parser.prototype.abortParsingListOrMoveToNextToken = function (kind) {
        this.parseErrorAtCurrentToken(this.parsingContextErrors(kind));
        if (this.isInSomeParsingContext()) {
            return true;
        }
        this.lexer.read().type;
        return false;
    };
    Parser.prototype.parsingContextErrors = function (context) {
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
    ;
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
    Parser.prototype.createMissingList = function () {
        var pos = this.getNodePos();
        var ;
        this.result = [];
        this.result.pos = pos;
        this.result.end = pos;
        return this.result;
    };
    // nodes.The allowReservedWords parameter controls whether reserved words are permitted after the first dot
    Parser.prototype.parseEntityName = function (allowReservedWords, diagnosticMessage) {
        var entity = this.parseIdentifier(diagnosticMessage);
        while (this.tryReadToken(59 /* dot */)) {
            var result = new nodes.QualifiedName(); // !!!
            result.left = entity;
            result.right = this.parseRightSideOfDot(allowReservedWords);
            entity = result;
        }
        return entity;
    };
    Parser.prototype.parseRightSideOfDot = function (allowIdentifierNames) {
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
            var matchesPattern = this.lookAhead(this.nextTokenIsIdentifierOrKeywordOnSameLine);
            if (matchesPattern) {
                // nodes.Report that we need an identifier.  nodes.However, report it right after the dot,
                // and not on the next this.lexer.peek().type.  nodes.This is because the next this.lexer.peek().type might actually
                // be an identifier and the error would be quite confusing.
                return this.createMissingNode(tokenType_1.TokenType.Identifier, /*reportAtCurrentPosition*/ true, nodes.Diagnostics.Identifier_expected);
            }
        }
        return allowIdentifierNames ? this.parseIdentifierName() : this.parseIdentifier();
    };
    Parser.prototype.parseTemplateExpression = function () {
        var template = new nodes.TemplateExpression();
        template.head = this.parseTemplateLiteralFragment();
        console.assert(template.head.kind === tokenType_1.TokenType.TemplateHead, "nodes.Template head has wrong this.lexer.peek().type kind");
        var templateSpans = [];
        templateSpans.pos = this.getNodePos();
        do {
            templateSpans.push(this.parseTemplateSpan());
        } while (lastOrUndefined(templateSpans).literal.kind === tokenType_1.TokenType.TemplateMiddle);
        templateSpans.end = this.getNodeEnd();
        template.templateSpans = templateSpans;
        return this.finishNode(template);
    };
    Parser.prototype.parseTemplateSpan = function () {
        var span = new nodes.TemplateSpan();
        span.expression = this.allowInAnd(this.parseExpression);
        var literal;
        if (this.lexer.peek().type === 104 /* closeBrace */) {
            this.reScanTemplateToken();
            literal = this.parseTemplateLiteralFragment();
        }
        else {
            literal = this.readTokenToken(tokenType_1.TokenType.TemplateTail, /*reportAtCurrentPosition*/ false, nodes.Diagnostics._0_expected, tokenType_1.tokenToString(104 /* closeBrace */));
        }
        span.literal = literal;
        return this.finishNode(span);
    };
    Parser.prototype.parseStringLiteralTypeNode = function () {
        return this.parseLiteralLikeNode(tokenType_1.TokenType.StringLiteralType, /*internName*/ true);
    };
    Parser.prototype.parseLiteralNode = function (internName) {
        return this.parseLiteralLikeNode(this.lexer.peek().type, internName);
    };
    Parser.prototype.parseTemplateLiteralFragment = function () {
        return this.parseLiteralLikeNode(this.lexer.peek().type, /*internName*/ false);
    };
    Parser.prototype.parseLiteralLikeNode = function (kind, internName) {
        var result = new nodes.LiteralExpression();
        var text = this.lexer.getTokenValue();
        result.text = internName ? this.internIdentifier(text) : text;
        if (this.lexer.hasExtendedUnicodeEscape()) {
            result.hasExtendedUnicodeEscape = true;
        }
        if (this.lexer.isUnterminated()) {
            result.isUnterminated = true;
        }
        var tokenPos = this.lexer.getTokenPos();
        this.lexer.read().type;
        result;
        // nodes.Octal literals are not allowed in strict mode or nodes.ES5
        // nodes.Note that theoretically the following condition would hold true literals like 009,
        // which is not octal.But because of how the this.scanner separates the tokens, we would
        // never get a this.lexer.peek().type like this. nodes.Instead, we would get 00 and 9 as two separate tokens.
        // nodes.We also do not need to check for negatives because any prefix operator would be part of a
        // parent unary expression.
        if (result.kind === tokenType_1.TokenType.NumericLiteral
            && this.sourceText.charCodeAt(tokenPos) === nodes.CharCode.num0
            && isOctalDigit(this.sourceText.charCodeAt(tokenPos + 1))) {
            result.isOctalLiteral = true;
        }
        return result;
    };
    /**
     * 解析一个源文件。
     */
    Parser.prototype.parseSourceFile = function (text, start, fileName) {
        var result = new nodes.SourceFile();
        result.path = fileName;
        result.content = text;
        result.start = start;
        this.lexer.setSource(text, start, fileName);
        if (this.lexer.comments) {
            for (var _i = 0, _a = this.lexer.comments; _i < _a.length; _i++) {
                var comment = _a[_i];
                // 只处理 /// 开头的注释。
                if (this.lexer.source.charCodeAt(comment.start) !== 47 /* slash */ ||
                    this.lexer.source.charCodeAt(comment.start - 1) !== 47 /* slash */) {
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
        result.statements = new Nodes.NodeList();
        while (this.lexer.peek().type !== 1 /* endOfFile */) {
            result.statements.push(this.parseStatement());
        }
        result.comments = this.lexer.comments;
        result.end = this.lexer.peek().start;
        return result;
    };
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map