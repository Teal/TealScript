/**
 * @fileOverview 语法解析器
 * @author xuld@vip.qq.com
 */
var tokens = require('./tokens');
var nodes = require('./nodes');
var lexer_1 = require('./lexer');
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
    // #endregion
    // #region 工具函数
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
    /**
     * 读取指定类型的标记，如果下一个标记不是指定的类型则报告错误。
     * @param token 要读取的标记类型。
     * @returns 如果标记类型匹配则返回读取的标记位置，否则返回当前的结束位置。
     */
    Parser.prototype.readToken = function (token) {
        if (this.lexer.peek().type === token) {
            return this.lexer.read().start;
        }
        this.error(this.lexer.peek(), "'{0}' expected; Unexpected token '{1}'.", tokens.getTokenName(token), tokens.getTokenName(this.lexer.peek().type));
        return this.lexer.current.end;
    };
    /**
     * 解析一个节点列表。
     * @param parseElement 解析每个元素的函数。如果解析失败函数返回 undefined。
     * @param openToken 列表的开始标记。
     * @param closeToken 列表的结束标记。
     */
    Parser.prototype.parseNodeList = function (parseElement, openToken, closeToken) {
        var result = new nodes.NodeList();
        if (openToken)
            result.start = this.readToken(openToken);
        while (this.lexer.peek().type !== TokenType.endOfFile &&
            (!closeToken || this.lexer.peek().type !== closeToken)) {
            var element = parseElement.call(this);
            if (!element)
                return result;
            result.push(element);
        }
        if (closeToken)
            result.end = this.readToken(closeToken);
        return result;
    };
    /**
     * 解析一个以逗号隔开的列表。
     * @param parseElement 解析每个元素的函数。如果解析失败函数返回 undefined。
     * @param openToken 列表的开始标记。
     * @param closeToken 列表的结束标记。
     * @param allowEmptyList 是否允许空列表。
     * @param continueParse 用于判断出现错误后是否继续解析列表项的函数。
     */
    Parser.prototype.parseDelimitedList = function (parseElement, openToken, closeToken, allowEmptyList, continueParse) {
        var result = new nodes.NodeList();
        if (openToken)
            result.start = this.readToken(openToken);
        if (!allowEmptyList || this.lexer.peek().type !== closeToken && this.lexer.peek().type !== TokenType.endOfFile) {
            while (true) {
                var element = parseElement.call(this);
                result.push(element);
                switch (this.lexer.peek().type) {
                    case TokenType.comma:
                        element.commaToken = this.readToken(TokenType.comma);
                        continue;
                    case closeToken:
                    case TokenType.endOfFile:
                        break;
                    default:
                        // 未读到分隔符和结束标记：分析是缺少,还是缺少结束标记。
                        if (continueParse && continueParse.call(this, this.lexer.peek().type)) {
                            this.readToken(TokenType.comma);
                            continue;
                        }
                        break;
                }
                break;
            }
        }
        if (closeToken)
            result.end = this.readToken(closeToken);
        return result;
    };
    /**
     * 尝试读取或自动插入一个分号。
     * @param result 存放结果的对象。
     * @return 如果已读取或自动插入一个分号则返回 true，否则返回 false。
     */
    Parser.prototype.tryReadSemicolon = function (result) {
        switch (this.lexer.peek().type) {
            case TokenType.semicolon:
                result.semicolonToken = this.lexer.read().start;
                return true;
            case TokenType.closeBrace:
            case TokenType.endOfFile:
                if (this.options.allowMissingSemicolon !== false) {
                    return true;
                }
                break;
        }
        this.error({ start: this.lexer.current.end, end: this.lexer.current.end }, "Missing ';' after statement.");
        return false;
    };
    // #endregion
    // #region 类型节点
    /**
     * 解析一个类型节点。
     * @param precedence 允许解析的最低操作符优先级。
     */
    Parser.prototype.parseTypeNode = function (precedence) {
        if (precedence === void 0) { precedence = 0 /* any */; }
        var result;
        if (tokens.isPredefinedType(this.lexer.peek().type)) {
            result = this.parsePredefinedTypeNode();
        }
        else {
            switch (this.lexer.peek().type) {
                case 69 /* openParen */:
                    result = this.parseFunctionOrParenthesizedTypeNode();
                    break;
                case 70 /* openBracket */:
                    result = this.parseTupleTypeNode();
                    break;
                case 57 /* openBrace */:
                    result = this.parseObjectTypeNode();
                    break;
                case 58 /* new */:
                    return this.parseConstructorTypeNode();
                case 72 /* lessThan */:
                    return this.parseFunctionTypeNode(this.parseTypeParameters(), this.parseParameters());
                case 59 /* typeof */:
                    result = this.parseTypeQueryNode();
                    break;
                case 73 /* equalsGreaterThan */:
                    return this.parseFunctionTypeNode();
                case 13 /* numericLiteral */:
                case 14 /* stringLiteral */:
                case 15 /* true */:
                case 16 /* false */:
                    result = this.parseLiteralTypeNode();
                    break;
                default:
                    result = this.parseGenericTypeOrTypeReferenceNode();
                    break;
            }
        }
        while (tokens.getPrecedence(this.lexer.peek().type) >= precedence) {
            switch (this.lexer.peek().type) {
                case 88 /* dot */:
                    result = this.parseQualifiedNameTypeNode(result);
                    continue;
                case 70 /* openBracket */:
                    if (!this.lexer.peek().hasLineBreakBeforeStart) {
                        result = this.parseArrayTypeNode(result);
                    }
                    continue;
                case 91 /* ampersand */:
                case 103 /* bar */:
                case 111 /* is */:
                    result = this.parseBinaryTypeNode(result);
                    continue;
            }
            return result;
        }
    };
    /**
     * 解析一个内置类型节点(`number`、`string`、...)。
     */
    Parser.prototype.parsePredefinedTypeNode = function () {
        var result = new nodes.PredefinedTypeNode;
        result.type = this.lexer.read(); // any、number、boolean、string、symbol、void、never、this、null、undefined、char、byte、int、long、short、uint、ulong、ushort、float、double、*、?
        return result;
    };
    /**
     * 解析一个函数或括号类型节点(`() => void`、`(x)`)。
     */
    Parser.prototype.parseFunctionOrParenthesizedTypeNode = function () {
        var savedState = this.lexer.stashSave();
        var parameters = this.parseParameters();
        if (this.lexer.peek().type === 73 /* equalsGreaterThan */ || this.lexer.peek().type === 5 /* colon */) {
            this.lexer.stashClear(savedState);
            return this.parseFunctionTypeNode(undefined, parameters);
        }
        this.lexer.stashRestore(savedState);
        return this.parseParenthesizedTypeNode();
    };
    /**
     * 解析一个括号类型节点(`(number)`)。
     */
    Parser.prototype.parseParenthesizedTypeNode = function () {
        var result = new nodes.ParenthesizedTypeNode;
        result.openParenToken = this.readToken(69 /* openParen */);
        result.body = this.parseTypeNode();
        result.closeParenToken = this.readToken(2 /* closeParen */);
        return result;
    };
    /**
     * 解析一个函数类型节点(`(x: number) => void`)。
     * @param typeParameters undefined。
     * @param parameters 参数部分。
     */
    Parser.prototype.parseFunctionTypeNode = function (typeParameters, parameters) {
        var result = new nodes.FunctionTypeNode;
        if (typeParameters != undefined) {
            result.typeParameters = typeParameters;
        }
        if (parameters != undefined) {
            result.parameters = parameters;
        }
        result.equalsGreaterThanToken = this.readToken(73 /* equalsGreaterThan */);
        result.return = this.parseTypeNode();
        return result;
    };
    /**
     * 解析一个元祖类型节点(`[string, number]`)。
     */
    Parser.prototype.parseTupleTypeNode = function () {
        return this.parseDelimitedList(this.parseTupleTypeElement, 70 /* openBracket */, 3 /* closeBracket */, true, tokens.isTypeNodeStart);
    };
    /**
     * 解析一个元祖类型节点元素(`x`)。
     */
    Parser.prototype.parseTupleTypeElement = function () {
        var result = new nodes.TupleTypeElement;
        result.value = this.parseTypeNode(2 /* assignment */);
        return result;
    };
    /**
     * 解析一个对象类型节点(`{x: number}`)。
     */
    Parser.prototype.parseObjectTypeNode = function () {
        var result = new nodes.ObjectTypeNode;
        result.elements = this.parseNodeList(this.parseTypeMemberSignature, 57 /* openBrace */, 4 /* closeBrace */);
        return result;
    };
    /**
     * 解析一个构造函数类型节点(`new () => void`)。
     */
    Parser.prototype.parseConstructorTypeNode = function () {
        var result = new nodes.ConstructorTypeNode;
        result.newToken = this.readToken(58 /* new */);
        if (this.lexer.peek().type === 72 /* lessThan */) {
            result.typeParameters = this.parseTypeParameters();
        }
        result.parameters = this.parseParameters();
        result.equalsGreaterThanToken = this.readToken(73 /* equalsGreaterThan */);
        result.return = this.parseTypeNode();
        return result;
    };
    /**
     * 解析一个类型查询节点(`typeof x`)。
     */
    Parser.prototype.parseTypeQueryNode = function () {
        var result = new nodes.TypeQueryNode;
        result.typeofToken = this.readToken(59 /* typeof */);
        result.operand = this.parseExpression(15 /* postfix */);
        return result;
    };
    /**
     * 解析一个字面量类型节点(`"abc"`、`true`)。
     */
    Parser.prototype.parseLiteralTypeNode = function () {
        var result = new nodes.LiteralTypeNode;
        result.value = this.parseExpression(19 /* primary */);
        return result;
    };
    /**
     * 解析一个泛型类型节点(`x<T>`)或类型引用节点(`x`)。
     */
    Parser.prototype.parseGenericTypeOrTypeReferenceNode = function () {
        var result = this.parseTypeReferenceNode();
        if (!this.lexer.peek().hasLineBreakBeforeStart && this.lexer.peek().type === 72 /* lessThan */) {
            return this.parseGenericTypeNode(result);
        }
        return result;
    };
    /**
     * 解析一个类型引用节点(`x`)。
     */
    Parser.prototype.parseTypeReferenceNode = function () {
        var result = new nodes.TypeReferenceNode;
        if (tokens.isIdentifierName, tokens.isTypeNodeStart(this.lexer.peek().type)) {
            result.value = this.readToken(12 /* identifier */);
        }
        else {
            this.error(this.lexer.peek(), "this.parseType() expected. this.parseUnexpected() token '{0}'.", tokens.getTokenName(this.lexer.peek().type));
        }
        return result;
    };
    /**
     * 解析一个泛型类型节点(`Array<number>`)。
     * @param target 目标部分。
     */
    Parser.prototype.parseGenericTypeNode = function (target) {
        var result = new nodes.GenericTypeNode;
        result.target = target;
        result.typeArguments = this.parseTypeArguments();
        return result;
    };
    /**
     * 解析一个限定名称类型节点(`"abc"`、`true`)。
     * @param target 目标部分。
     */
    Parser.prototype.parseQualifiedNameTypeNode = function (target) {
        var result = new nodes.QualifiedNameTypeNode;
        result.target = target;
        result.dotToken = this.readToken(88 /* dot */);
        result.argument = this.parseIdentifier(true);
        return result;
    };
    /**
     * 解析一个数组类型节点(`T[]`)。
     * @param target 目标部分。
     */
    Parser.prototype.parseArrayTypeNode = function (target) {
        var result = new nodes.ArrayTypeNode;
        result.target = target;
        result.openBracketToken = this.readToken(70 /* openBracket */);
        result.closeBracketToken = this.readToken(3 /* closeBracket */);
        return result;
    };
    /**
     * 解析一个双目表达式(`x + y`、`x = y`、...)。
     * @param left 左值部分。
     */
    Parser.prototype.parseBinaryTypeNode = function (left) {
        var result = new nodes.BinaryTypeNode;
        result.left = left;
        result.operator = this.lexer.read(); // &、|、is
        result.right = this.parseTypeNode(tokens.getPrecedence(result.operator) + 1);
        return result;
    };
    /**
     * 解析一个类型成员签名(`x： y`、`x() {...}`)。
     */
    Parser.prototype.parseTypeMemberSignature = function () {
        switch (this.lexer.peek().type) {
            case 134 /* get */:
            case 135 /* set */:
                var savedToken = this.lexer.current;
                this.lexer.read();
                if (tokens.isPropertyNameStart(this.lexer.peek().type)) {
                    return this.parseAccessorSignature(savedToken.type === 134 /* get */ ? savedToken.start : undefined, savedToken.type === 135 /* set */ ? savedToken.start : undefined);
                }
                this.lexer.current = savedToken;
                break;
            case 70 /* openBracket */:
                var isIndexSignature = void 0;
                var savedToken2 = this.lexer.current;
                this.lexer.read();
                if (tokens.isIdentifierName, tokens.isTypeNodeStart(this.lexer.peek().type)) {
                    this.lexer.read();
                    isIndexSignature = this.lexer.peek().type === 5 /* colon */;
                }
                this.lexer.current = savedToken2;
                if (isIndexSignature) {
                    return this.parseIndexSignature();
                }
                break;
            case 69 /* openParen */:
            case 72 /* lessThan */:
                return this.parseFunctionSignature();
            case 58 /* new */:
                return this.parseConstructSignature();
        }
        var name = this.parsePropertyName();
        var questionToken = this.lexer.peek().type === 38 /* question */ ? read(38 /* question */) : undefined;
        switch (this.lexer.peek().type) {
            case 69 /* openParen */:
            case 72 /* lessThan */:
                return this.parseMethodSignature(name, questionToken);
            default:
                return this.parsePropertySignature(name, questionToken);
        }
    };
    /**
     * 解析一个访问器签名(`get x(): number`、`set x(value): void`)。
     * @param getToken 标记 'get' 的位置。
     * @param setToken 标记 'set' 的位置。
     */
    Parser.prototype.parseAccessorSignature = function (getToken, setToken) {
        var result = new nodes.AccessorSignature;
        if (getToken != undefined) {
            result.getToken = getToken;
        }
        if (setToken != undefined) {
            result.setToken = setToken;
        }
        this.parseDocComment(result);
        result.name = this.parsePropertyName();
        if (this.lexer.peek().type === 38 /* question */) {
            result.questionToken = this.readToken(38 /* question */);
            ;
        }
        result.parameters = this.parseParameters();
        this.parseTypeAnnotation(result);
        this.parseCommaOrSemicolon(result);
        return result;
    };
    /**
     * 解析一个索引器声明(`[key: string]: string``)。
     */
    Parser.prototype.parseIndexSignature = function () {
        var result = new nodes.IndexSignature;
        this.parseDocComment(result);
        result.openBracketToken = this.readToken(70 /* openBracket */);
        result.argument = this.parseIdentifier();
        this.parseTypeAnnotation(result);
        result.closeBracketToken = this.readToken(3 /* closeBracket */);
        this.parseTypeAnnotation(result);
        this.parseCommaOrSemicolon(result);
        return result;
    };
    /**
     * 解析一个函数签名(`(): number`)。
     */
    Parser.prototype.parseFunctionSignature = function () {
        var result = new nodes.FunctionSignature;
        this.parseDocComment(result);
        this.parseMethodOrConstructOrCallSignature(result);
        return result;
    };
    /**
     * 解析一个构造函数签名(`new x(): number`)。
     */
    Parser.prototype.parseConstructSignature = function () {
        var result = new nodes.ConstructSignature;
        this.parseDocComment(result);
        result.newToken = this.readToken(58 /* new */);
        this.parseMethodOrConstructOrCallSignature(result);
        return result;
    };
    /**
     * 解析一个方法签名(`x(): number`)。
     * @param name  名字部分 。
     * @param questionToken 标记 '?' 的位置。
     */
    Parser.prototype.parseMethodSignature = function (name, questionToken) {
        var result = new nodes.MethodSignature;
        result.name = name;
        if (questionToken != undefined) {
            result.questionToken = questionToken;
        }
        this.parseDocComment(result);
        this.parseMethodOrConstructOrCallSignature(result);
        return result;
    };
    /**
     * 解析一个属性签名(`x: number`)。
     * @param name  名字部分 。
     * @param questionToken 标记 '?' 的位置。
     */
    Parser.prototype.parsePropertySignature = function (name, questionToken) {
        var result = new nodes.PropertySignature;
        result.name = name;
        if (questionToken != undefined) {
            result.questionToken = questionToken;
        }
        this.parseDocComment(result);
        this.parseTypeAnnotation(result);
        this.parseCommaOrSemicolon(result);
        return result;
    };
    /**
     * 解析一个方法(`x(): number`)或构造函数(`new x(): number`)或函数(`(): number`)签名。
     * @param _  解析的目标节点 。
     */
    Parser.prototype.parseMethodOrConstructOrCallSignature = function (result) {
        this.parseCallSignature(result);
        this.parseCommaOrSemicolon(result);
    };
    /**
     * 解析一个类型参数列表(`<T>`)。
     */
    Parser.prototype.parseTypeParameters = function () {
        return this.parseDelimitedList(this.parseTypeParameterDeclaration, 72 /* lessThan */, 93 /* greaterThan */, false, tokens.isIdentifierName);
    };
    /**
     * 解析一个类型参数声明(`T`、`T extends R`)。
     */
    Parser.prototype.parseTypeParameterDeclaration = function () {
        var result = new nodes.TypeParameterDeclaration;
        result.name = this.parseIdentifier();
        if (this.lexer.peek().type === 141 /* extends */) {
            result.extendsToken = this.readToken(141 /* extends */);
            result.extends = this.parseTypeNode();
        }
        return result;
    };
    /**
     * 解析一个类型参数列表(`<number>`)。
     */
    Parser.prototype.parseTypeArguments = function () {
        return this.parseDelimitedList(this.parseTypeArgument, 72 /* lessThan */, 93 /* greaterThan */, false, tokens.isTypeNodeStart);
    };
    /**
     * 解析一个类型参数(`number`)。
     */
    Parser.prototype.parseTypeArgument = function () {
        var result = new nodes.TypeArgument;
        result.value = this.parseTypeNode(2 /* assignment */);
        return result;
    };
    /**
     * 解析一个参数列表(`(x, y)`)。
     */
    Parser.prototype.parseParameters = function () {
        return this.parseDelimitedList(this.parseParameterDeclaration, 69 /* openParen */, 2 /* closeParen */, true, tokens.isParameterStart);
    };
    /**
     * 解析一个参数声明(`x`、`x?: number`)。
     */
    Parser.prototype.parseParameterDeclaration = function () {
        var result = new nodes.ParameterDeclaration;
        var modifiers = this.parseModifiers();
        if (modifiers) {
            result.modifiers = modifiers;
        }
        if (this.lexer.peek().type === 63 /* dotDotDot */) {
            result.dotDotDotToken = this.readToken(63 /* dotDotDot */);
            ;
        }
        result.name = this.parseBindingName();
        if (this.lexer.peek().type === 38 /* question */) {
            result.questionToken = this.readToken(38 /* question */);
            ;
        }
        this.parseTypeAnnotation(result);
        this.parseInitializer(result);
        return result;
    };
    /**
     * 解析一个绑定名称(`x`, `[x]`, `{x: x}`)。
     */
    Parser.prototype.parseBindingName = function () {
        switch (this.lexer.peek().type) {
            case 70 /* openBracket */:
                return this.parseArrayBindingPattern();
            case 57 /* openBrace */:
                return this.parseObjectBindingPattern();
            default:
                return this.parseIdentifier();
        }
    };
    /**
     * 解析一个数组绑定模式项(`[x]`)。
     */
    Parser.prototype.parseArrayBindingPattern = function () {
        var result = new nodes.ArrayBindingPattern;
        result.elements = this.parseDelimitedList(this.parseArrayBindingElement, 70 /* openBracket */, 3 /* closeBracket */, true, tokens.isArrayBindingElementStart);
        return result;
    };
    /**
     * 解析一个数组绑定模式项(`x`)。
     */
    Parser.prototype.parseArrayBindingElement = function () {
        var result = new nodes.ArrayBindingElement;
        if (this.lexer.peek().type !== 107 /* comma */ && this.lexer.peek().type !== 3 /* closeBracket */) {
            if (this.lexer.peek().type === 63 /* dotDotDot */) {
                result.dotDotDotToken = this.readToken(63 /* dotDotDot */);
                ;
            }
            result.value = this.parseBindingName();
            this.parseInitializer(result);
        }
        return result;
    };
    /**
     * 解析一个对象绑定模式项(`{x: x}`)。
     */
    Parser.prototype.parseObjectBindingPattern = function () {
        var result = new nodes.ObjectBindingPattern;
        result.elements = this.parseDelimitedList(this.parseObjectBindingElement, 57 /* openBrace */, 4 /* closeBrace */, true, tokens.isPropertyNameStart);
        return result;
    };
    /**
     * 解析一个对象绑定模式项(`x`)。
     */
    Parser.prototype.parseObjectBindingElement = function () {
        var result = new nodes.ObjectBindingElement;
        var keyToken = this.lexer.peek().type;
        result.key = this.parsePropertyName();
        if (this.lexer.peek().type === 5 /* colon */) {
            result.colonToken = this.readToken(5 /* colon */);
            result.value = this.parseBindingName();
        }
        else if (!tokens.isIdentifierName, tokens.isTypeNodeStart(keyToken)) {
            this.readToken(5 /* colon */);
        }
        this.parseInitializer(result);
        return result;
    };
    /**
     * 解析一个类型注解(`: number`)。
     * @param _  解析的目标节点 。
     */
    Parser.prototype.parseTypeAnnotation = function (result) {
        if (this.lexer.peek().type === 5 /* colon */) {
            result.colonToken = this.readToken(5 /* colon */);
            result.type = this.parseTypeNode();
        }
    };
    /**
     * 解析一个初始值。
     * @param _  解析的目标节点 。
     * @param allowIn 是否解析 in 表达式。
     */
    Parser.prototype.parseInitializer = function (result, allowIn) {
        if (this.lexer.peek().type === 76 /* equals */) {
            result.equalsToken = this.readToken(76 /* equals */);
            result.initializer = this.parseExpression(2 /* assignment */, allowIn);
        }
    };
    /**
     * 解析一个属性名称(`xx`、`"xx"`、`0`、`[xx]`)。
     */
    Parser.prototype.parsePropertyName = function () {
        switch (this.lexer.peek().type) {
            case 'stringLiteral':
                return this.parseStringLiteral();
            case 'numericLiteral':
                return this.parseNumericLiteral();
            case 70 /* openBracket */:
                return this.parseComputedPropertyName();
            default:
                return this.parseIdentifier(true);
        }
    };
    /**
     * 解析一个已计算的属性名(`[1]`)。
     */
    Parser.prototype.parseComputedPropertyName = function () {
        var result = new nodes.ComputedPropertyName;
        result.openBracketToken = this.readToken(70 /* openBracket */);
        result.body = this.parseExpression(2 /* assignment */);
        result.closeBracketToken = this.readToken(3 /* closeBracket */);
        return result;
    }; // #endregion
    // #region 文档注释
    /**
     * 解析一个文档注释。
     * @param _  解析的目标节点 。
     */
    Parser.prototype.parseDocComment = function (result) {
    }; // #endregion
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
        while (this.lexer.peek().type !== TokenType.endOfFile) {
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