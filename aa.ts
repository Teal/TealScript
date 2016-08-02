/**
 * @fileOverview 语法解析器
 * @author xuld@vip.qq.com
 */

import {CharCode} from './unicode';
import * as tokens from './tokens';
import {TextRange} from './location';
import * as nodes from './nodes';
import {Lexer, LexerOptions, Token} from './lexer';

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
    parseAsTypeNode(text: string, start?: number, fileName?: string) {
        delete this.lexer.comment;
        this.lexer.setSource(text, start, fileName);
        return this.parseTypeNode();
    }

    // #endregion

    // #region 工具函数

    /**
     * 报告一个语法错误。
     * @param range 发生错误的位置。
     * @param message 错误的信息。
     * @param args 格式化错误的参数。
     */
    private error(range: TextRange, message: string, ...args: any[]) {
        // error(ErrorType.syntaxError, this.lexer.fileName, range.start, range.end, message, ...args);
    }

    /**
     * 读取指定类型的标记，如果下一个标记不是指定的类型则报告错误。
     * @param token 要读取的标记类型。
     * @returns 如果标记类型匹配则返回读取的标记位置，否则返回当前的结束位置。
     */
    private readToken(token: tokens.TokenType) {
        if (this.lexer.peek().type === token) {
            return this.lexer.read().start;
        }
        this.error(this.lexer.peek(), "'{0}' expected; Unexpected token '{1}'.", tokens.getTokenName(token), tokens.getTokenName(this.lexer.peek().type));
        return this.lexer.current.end;
    }

    /**
     * 解析一个节点列表。
     * @param parseElement 解析每个元素的函数。如果解析失败函数返回 undefined。
     * @param openToken 列表的开始标记。
     * @param closeToken 列表的结束标记。
     */
    private parseNodeList<T extends nodes.Node>(parseElement: () => T, openToken?: TokenType, closeToken?: TokenType) {
        let result = new nodes.NodeList<T>();
        if (openToken) result.start = this.readToken(openToken);
        while (this.lexer.peek().type !== TokenType.endOfFile &&
            (!closeToken || this.lexer.peek().type !== closeToken)) {
            const element = <T>parseElement.call(this);
            if (!element) return result;
            result.push(element);
        }
        if (closeToken) result.end = this.readToken(closeToken);
        return result;
    }

    /**
     * 解析一个以逗号隔开的列表。
     * @param parseElement 解析每个元素的函数。如果解析失败函数返回 undefined。
     * @param openToken 列表的开始标记。
     * @param closeToken 列表的结束标记。
     * @param allowEmptyList 是否允许空列表。
     * @param continueParse 用于判断出现错误后是否继续解析列表项的函数。
     */
    private parseDelimitedList<T extends nodes.Node & { commaToken?: number }>(parseElement: () => T, openToken?: TokenType, closeToken?: TokenType, allowEmptyList: boolean, continueParse?: (token: TokenType) => boolean) {
        let result = new nodes.NodeList<T>();
        if (openToken) result.start = this.readToken(openToken);
        if (!allowEmptyList || this.lexer.peek().type !== closeToken && this.lexer.peek().type !== TokenType.endOfFile) {
            while (true) {
                const element = <T>parseElement.call(this);
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
        if (closeToken) result.end = this.readToken(closeToken);
        return result;
    }

    /**
     * 尝试读取或自动插入一个分号。
     * @param result 存放结果的对象。
     * @return 如果已读取或自动插入一个分号则返回 true，否则返回 false。
     */
    private tryReadSemicolon(result: { semicolonToken?: number }) {
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
    }

    // #endregion

    // #region 类型节点

    /**
     * 解析一个类型节点。
     * @param precedence 允许解析的最低操作符优先级。
     */
    private parseTypeNode(precedence = tokens.Precedence.any) {
        let result: nodes.TypeNode;
        if (tokens.isPredefinedType(this.lexer.peek().type)) {
        	result = this.parsePredefinedTypeNode();
        } else {
        	switch (this.lexer.peek().type) {
        		case tokens.TokenType.openParen:
        			result = this.parseFunctionOrParenthesizedTypeNode();
        			break;
        		case tokens.TokenType.openBracket:
        			result = this.parseTupleTypeNode();
        			break;
        		case tokens.TokenType.openBrace:
        			result = this.parseObjectTypeNode();
        			break;
        		case tokens.TokenType.new:
        			return this.parseConstructorTypeNode();
        		case tokens.TokenType.lessThan:
        			return this.parseFunctionTypeNode(this.parseTypeParameters(), this.parseParameters());
        		case tokens.TokenType.typeof:
        			result = this.parseTypeQueryNode();
        			break;
        		case tokens.TokenType.equalsGreaterThan:
        			return this.parseFunctionTypeNode();
        		case tokens.TokenType.numericLiteral:
        		case tokens.TokenType.stringLiteral:
        		case tokens.TokenType.true:
        		case tokens.TokenType.false:
        			result = this.parseLiteralTypeNode();
        			break;
        		default:
        			result = this.parseGenericTypeOrTypeReferenceNode();
        			break;
        	}
        }
        while (tokens.getPrecedence(this.lexer.peek().type) >= precedence) {
        	switch (this.lexer.peek().type) {
        		case tokens.TokenType.dot:
        			result = this.parseQualifiedNameTypeNode(result);
        			continue;
        		case tokens.TokenType.openBracket:
        			if (!this.lexer.peek().hasLineBreakBeforeStart) {
        				result = this.parseArrayTypeNode(result);
        			}
        			continue;
        		case tokens.TokenType.ampersand:
        		case tokens.TokenType.bar:
        		case tokens.TokenType.is:
        			result = this.parseBinaryTypeNode(result);
        			continue;
        	}
        	return result;
        }
    }

    /**
     * 解析一个内置类型节点(`number`、`string`、...)。
     */
    private parsePredefinedTypeNode() {
        const result = new nodes.PredefinedTypeNode;
        result.type = this.lexer.read(); // any、number、boolean、string、symbol、void、never、this、null、undefined、char、byte、int、long、short、uint、ulong、ushort、float、double、*、?
        return result;
    }

    /**
     * 解析一个函数或括号类型节点(`() => void`、`(x)`)。
     */
    private parseFunctionOrParenthesizedTypeNode() {
        const savedState = this.lexer.stashSave();
        const parameters = this.parseParameters();
        if (this.lexer.peek().type === tokens.TokenType.equalsGreaterThan || this.lexer.peek().type === tokens.TokenType.colon) {
        	this.lexer.stashClear(savedState);
        	return this.parseFunctionTypeNode(undefined, parameters);
        }
        this.lexer.stashRestore(savedState);
        return this.parseParenthesizedTypeNode();
    }

    /**
     * 解析一个括号类型节点(`(number)`)。
     */
    private parseParenthesizedTypeNode() {
        const result = new nodes.ParenthesizedTypeNode;
        result.openParenToken = this.readToken(tokens.TokenType.openParen);
        result.body = this.parseTypeNode();
        result.closeParenToken = this.readToken(tokens.TokenType.closeParen);
        return result;
    }

    /**
     * 解析一个函数类型节点(`(x: number) => void`)。
     * @param typeParameters undefined。
     * @param parameters 参数部分。
     */
    private parseFunctionTypeNode(typeParameters?: nodes.NodeList<nodes.TypeParameterDeclaration>, parameters?: nodes.NodeList<nodes.ParameterDeclaration>) {
        const result = new nodes.FunctionTypeNode;
        if (typeParameters != undefined) {
        	result.typeParameters = typeParameters;
        }
        if (parameters != undefined) {
        	result.parameters = parameters;
        }
        result.equalsGreaterThanToken = this.readToken(tokens.TokenType.equalsGreaterThan);
        result.return = this.parseTypeNode();
        return result;
    }

    /**
     * 解析一个元祖类型节点(`[string, number]`)。
     */
    private parseTupleTypeNode() {
        return this.parseDelimitedList(this.parseTupleTypeElement(), tokens.TokenType.openBracket, tokens.TokenType.closeBracket, true, tokens.isTypeNodeStart);
    }

    /**
     * 解析一个元祖类型节点元素(`x`)。
     */
    private parseTupleTypeElement() {
        const result = new nodes.TupleTypeElement;
        result.value = this.parseTypeNode(tokens.Precedence.assignment);
        return result;
    }

    /**
     * 解析一个对象类型节点(`{x: number}`)。
     */
    private parseObjectTypeNode() {
        const result = new nodes.ObjectTypeNode;
        result.elements = this.parseNodeList(this.parseTypeMemberSignature(), tokens.TokenType.openBrace, tokens.TokenType.closeBrace)
        return result;
    }

    /**
     * 解析一个构造函数类型节点(`new () => void`)。
     */
    private parseConstructorTypeNode() {
        const result = new nodes.ConstructorTypeNode;
        result.newToken = this.readToken(tokens.TokenType.new);
        if (this.lexer.peek().type === tokens.TokenType.lessThan) {
        	result.typeParameters = this.parseTypeParameters();
        }
        result.parameters = this.parseParameters();
        result.equalsGreaterThanToken = this.readToken(tokens.TokenType.equalsGreaterThan);
        result.return = this.parseTypeNode();
        return result;
    }

    /**
     * 解析一个类型查询节点(`typeof x`)。
     */
    private parseTypeQueryNode() {
        const result = new nodes.TypeQueryNode;
        result.typeofToken = this.readToken(tokens.TokenType.typeof);
        result.operand = this.parseExpression(tokens.Precedence.postfix);
        return result;
    }

    /**
     * 解析一个字面量类型节点(`"abc"`、`true`)。
     */
    private parseLiteralTypeNode() {
        const result = new nodes.LiteralTypeNode;
        result.value = this.parseExpression(tokens.Precedence.primary);
        return result;
    }

    /**
     * 解析一个泛型类型节点(`x<T>`)或类型引用节点(`x`)。
     */
    private parseGenericTypeOrTypeReferenceNode() {
        const result = this.parseTypeReferenceNode();
        if (!this.lexer.peek().hasLineBreakBeforeStart && this.lexer.peek().type === tokens.TokenType.lessThan) {
        	return this.parseGenericTypeNode(result);
        }
        return result;
    }

    /**
     * 解析一个类型引用节点(`x`)。
     */
    private parseTypeReferenceNode() {
        const result = new nodes.TypeReferenceNode;
        if (tokens.isIdentifierName, tokens.isTypeNodeStart(this.lexer.peek().type)) {
        	result.value = this.readToken(tokens.TokenType.identifier);
        } else {
        	this.error(this.lexer.peek(), "this.parseType() expected. this.parseUnexpected() token '{0}'.", tokens.getTokenName(this.lexer.peek().type));
        }
        return result;
    }

    /**
     * 解析一个泛型类型节点(`Array<number>`)。
     * @param target 目标部分。
     */
    private parseGenericTypeNode(target: nodes.TypeReferenceNode) {
        const result = new nodes.GenericTypeNode;
        result.target = target;
        result.typeArguments = this.parseTypeArguments();
        return result;
    }

    /**
     * 解析一个限定名称类型节点(`"abc"`、`true`)。
     * @param target 目标部分。
     */
    private parseQualifiedNameTypeNode(target: nodes.TypeNode) {
        const result = new nodes.QualifiedNameTypeNode;
        result.target = target;
        result.dotToken = this.readToken(tokens.TokenType.dot);
        result.argument = this.parseIdentifier(true);
        return result;
    }

    /**
     * 解析一个数组类型节点(`T[]`)。
     * @param target 目标部分。
     */
    private parseArrayTypeNode(target: nodes.TypeNode) {
        const result = new nodes.ArrayTypeNode;
        result.target = target;
        result.openBracketToken = this.readToken(tokens.TokenType.openBracket);
        result.closeBracketToken = this.readToken(tokens.TokenType.closeBracket);
        return result;
    }

    /**
     * 解析一个双目表达式(`x + y`、`x = y`、...)。
     * @param left 左值部分。
     */
    private parseBinaryTypeNode(left: nodes.TypeNode) {
        const result = new nodes.BinaryTypeNode;
        result.left = left;
        result.operator = this.lexer.read(); // &、|、is
        result.right = this.parseTypeNode(tokens.getPrecedence(result.operator) + 1);
        return result;
    }

    /**
     * 解析一个类型成员签名(`x： y`、`x() {...}`)。
     */
    private parseTypeMemberSignature() {
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.get:
        	case tokens.TokenType.set:
        		const savedToken = this.lexer.current;
        		this.lexer.read();
        		if (tokens.isPropertyNameStart(this.lexer.peek().type)) {
        			return this.parseAccessorSignature(savedToken.type === tokens.TokenType.get ? savedToken.start : undefined, savedToken.type === tokens.TokenType.set ? savedToken.start : undefined);
        		}
        		this.lexer.current = savedToken;
        		break;
        	case tokens.TokenType.openBracket:
        		let isIndexSignature: boolean;
        		const savedToken2 = this.lexer.current;
        		this.lexer.read();
        		if (tokens.isIdentifierName, tokens.isTypeNodeStart(this.lexer.peek().type)) {
        			this.lexer.read();
        			isIndexSignature = this.lexer.peek().type === tokens.TokenType.colon;
        		}
        		this.lexer.current = savedToken2;
        		if (isIndexSignature) {
        			return this.parseIndexSignature();
        		}
        		break;
        	case tokens.TokenType.openParen:
        	case tokens.TokenType.lessThan:
        		return this.parseFunctionSignature();
        	case tokens.TokenType.new:
        		return this.parseConstructSignature();
        }
        const name = this.parsePropertyName();
        const questionToken = this.lexer.peek().type === tokens.TokenType.question ? read(tokens.TokenType.question) : undefined;
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.openParen:
        	case tokens.TokenType.lessThan:
        		return this.parseMethodSignature(name, questionToken);
        	default:
        		return this.parsePropertySignature(name, questionToken);
        }
    }

    /**
     * 解析一个访问器签名(`get x(): number`、`set x(value): void`)。
     * @param getToken 标记 'get' 的位置。
     * @param setToken 标记 'set' 的位置。
     */
    private parseAccessorSignature(getToken?: number, setToken?: number) {
        const result = new nodes.AccessorSignature;
        if (getToken != undefined) {
        	result.getToken = getToken;
        }
        if (setToken != undefined) {
        	result.setToken = setToken;
        }
        this.parseDocComment(result);
        result.name = this.parsePropertyName();
        if (this.lexer.peek().type === tokens.TokenType.question) {
        	result.questionToken = this.readToken(tokens.TokenType.question);;
        }
        result.parameters = this.parseParameters();
        this.parseTypeAnnotation(result);
        this.parseCommaOrSemicolon(result);
        return result;
    }

    /**
     * 解析一个索引器声明(`[key: string]: string``)。
     */
    private parseIndexSignature() {
        const result = new nodes.IndexSignature;
        this.parseDocComment(result);
        result.openBracketToken = this.readToken(tokens.TokenType.openBracket);
        result.argument = this.parseIdentifier();
        this.parseTypeAnnotation(result);
        result.closeBracketToken = this.readToken(tokens.TokenType.closeBracket);
        this.parseTypeAnnotation(result);
        this.parseCommaOrSemicolon(result);
        return result;
    }

    /**
     * 解析一个函数签名(`(): number`)。
     */
    private parseFunctionSignature() {
        const result = new nodes.FunctionSignature;
        this.parseDocComment(result);
        this.parseMethodOrConstructOrCallSignature(result);
        return result;
    }

    /**
     * 解析一个构造函数签名(`new x(): number`)。
     */
    private parseConstructSignature() {
        const result = new nodes.ConstructSignature;
        this.parseDocComment(result);
        result.newToken = this.readToken(tokens.TokenType.new);
        this.parseMethodOrConstructOrCallSignature(result);
        return result;
    }

    /**
     * 解析一个方法签名(`x(): number`)。
     * @param name  名字部分 。
     * @param questionToken 标记 '?' 的位置。
     */
    private parseMethodSignature(name: nodes.PropertyName, questionToken?: number) {
        const result = new nodes.MethodSignature;
        result.name = name;
        if (questionToken != undefined) {
        	result.questionToken = questionToken;
        }
        this.parseDocComment(result);
        this.parseMethodOrConstructOrCallSignature(result);
        return result;
    }

    /**
     * 解析一个属性签名(`x: number`)。
     * @param name  名字部分 。
     * @param questionToken 标记 '?' 的位置。
     */
    private parsePropertySignature(name: nodes.PropertyName, questionToken?: number) {
        const result = new nodes.PropertySignature;
        result.name = name;
        if (questionToken != undefined) {
        	result.questionToken = questionToken;
        }
        this.parseDocComment(result);
        this.parseTypeAnnotation(result);
        this.parseCommaOrSemicolon(result);
        return result;
    }

    /**
     * 解析一个方法(`x(): number`)或构造函数(`new x(): number`)或函数(`(): number`)签名。
     * @param _  解析的目标节点 。
     */
    private parseMethodOrConstructOrCallSignature(result: nodes.BreakStatement | nodes.ContinueStatement) {
        this.parseCallSignature(result);
        this.parseCommaOrSemicolon(result);
    }

    /**
     * 解析一个类型参数列表(`<T>`)。
     */
    private parseTypeParameters() {
        return this.parseDelimitedList(this.parseTypeParameterDeclaration(), tokens.TokenType.lessThan, tokens.TokenType.greaterThan, false, tokens.isIdentifierName);
    }

    /**
     * 解析一个类型参数声明(`T`、`T extends R`)。
     */
    private parseTypeParameterDeclaration() {
        const result = new nodes.TypeParameterDeclaration;
        result.name = this.parseIdentifier();
        if (this.lexer.peek().type === tokens.TokenType.extends) {
        	result.extendsToken = this.readToken(tokens.TokenType.extends);
        	result.extends = this.parseTypeNode();
        }
        return result;
    }

    /**
     * 解析一个类型参数列表(`<number>`)。
     */
    private parseTypeArguments() {
        return this.parseDelimitedList(this.parseTypeArgument(), tokens.TokenType.lessThan, tokens.TokenType.greaterThan, false, tokens.isTypeNodeStart);
    }

    /**
     * 解析一个类型参数(`number`)。
     */
    private parseTypeArgument() {
        const result = new nodes.TypeArgument;
        result.value = this.parseTypeNode(tokens.Precedence.assignment);
        return result;
    }

    /**
     * 解析一个参数列表(`(x, y)`)。
     */
    private parseParameters() {
        return this.parseNodeList(this.parseParameterDeclaration(), tokens.TokenType.openParen, ')
    }

    /**
     * 解析一个参数声明(`x`、`x?: number`)。
     */
    private parseParameterDeclaration() {
        const result = new nodes.ParameterDeclaration;
        const modifiers = this.parseModifiers();
        if (modifiers) {
        	result.modifiers = modifiers;
        }
        if (this.lexer.peek().type === tokens.TokenType.dotDotDot) {
        	result.dotDotDotToken = this.readToken(tokens.TokenType.dotDotDot);;
        }
        result.name = this.parseBindingName();
        if (this.lexer.peek().type === tokens.TokenType.question) {
        	result.questionToken = this.readToken(tokens.TokenType.question);;
        }
        this.parseTypeAnnotation(result);
        this.parseInitializer(result);
        return result;
    }

    /**
     * 解析一个绑定名称(`x`, `[x]`, `{x: x}`)。
     */
    private parseBindingName() {
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.openBracket:
        		return this.parseArrayBindingPattern();
        	case tokens.TokenType.openBrace:
        		return this.parseObjectBindingPattern();
        	default:
        		return this.parseIdentifier();
        }
    }

    /**
     * 解析一个数组绑定模式项(`[x]`)。
     */
    private parseArrayBindingPattern() {
        const result = new nodes.ArrayBindingPattern;
        result.elements = this.parseDelimitedList(this.parseArrayBindingElement(), tokens.TokenType.openBracket, tokens.TokenType.closeBracket, true, tokens.isArrayBindingElementStart);
        return result;
    }

    /**
     * 解析一个数组绑定模式项(`x`)。
     */
    private parseArrayBindingElement() {
        const result = new nodes.ArrayBindingElement;
        if (this.lexer.peek().type !== tokens.TokenType.comma && this.lexer.peek().type !== tokens.TokenType.closeBracket) {
        	if (this.lexer.peek().type === tokens.TokenType.dotDotDot) {
        		result.dotDotDotToken = this.readToken(tokens.TokenType.dotDotDot);;
        	}
        	result.value = this.parseBindingName();
        	this.parseInitializer(result);
        }
        return result;
    }

    /**
     * 解析一个对象绑定模式项(`{x: x}`)。
     */
    private parseObjectBindingPattern() {
        const result = new nodes.ObjectBindingPattern;
        result.elements = this.parseDelimitedList(this.parseObjectBindingElement(), tokens.TokenType.openBrace, tokens.TokenType.closeBrace, true, tokens.isPropertyNameStart);
        return result;
    }

    /**
     * 解析一个对象绑定模式项(`x`)。
     */
    private parseObjectBindingElement() {
        const result = new nodes.ObjectBindingElement;
        const keyToken = this.lexer.peek().type;
        result.key = this.parsePropertyName();
        if (this.lexer.peek().type === tokens.TokenType.colon) {
        	result.colonToken = this.readToken(tokens.TokenType.colon);
        	result.value = this.parseBindingName();
        } else if (!tokens.isIdentifierName, tokens.isTypeNodeStart(keyToken)) {
        	this.readToken(tokens.TokenType.colon);
        }
        this.parseInitializer(result);
        return result;
    }

    /**
     * 解析一个类型注解(`: number`)。
     * @param _  解析的目标节点 。
     */
    private parseTypeAnnotation(result: nodes.BreakStatement | nodes.ContinueStatement) {
        if (this.lexer.peek().type === tokens.TokenType.colon) {
        	result.colonToken = this.readToken(tokens.TokenType.colon);
        	result.type = this.parseTypeNode();
        }
    }

    /**
     * 解析一个初始值。
     * @param _  解析的目标节点 。
     * @param allowIn 是否解析 in 表达式。
     */
    private parseInitializer(result: nodes.BreakStatement | nodes.ContinueStatement, allowIn?: boolean) {
        if (this.lexer.peek().type === tokens.TokenType.equals) {
        	result.equalsToken = this.readToken(tokens.TokenType.equals);
        	result.initializer = this.parseExpression(tokens.Precedence.assignment, allowIn);
        }
    }

    /**
     * 解析一个属性名称(`xx`、`"xx"`、`0`、`[xx]`)。
     */
    private parsePropertyName() {
        switch (this.lexer.peek().type) {
        	case 'stringLiteral':
        		return this.parseStringLiteral();
        	case 'numericLiteral':
        		return this.parseNumericLiteral();
        	case tokens.TokenType.openBracket:
        		return this.parseComputedPropertyName();
        	default:
        		return this.parseIdentifier(true);
        }
    }

    /**
     * 解析一个已计算的属性名(`[1]`)。
     */
    private parseComputedPropertyName() {
        const result = new nodes.ComputedPropertyName;
        result.openBracketToken = this.readToken(tokens.TokenType.openBracket);
        result.body = this.parseExpression(tokens.Precedence.assignment);
        result.closeBracketToken = this.readToken(tokens.TokenType.closeBracket);
        return result;
    }
    // #endregion

    // #region 表达式

    /**
     * 解析一个对象成员尾部。
     * @param _  解析的目标节点 。
     */
    private parseCommaOrSemicolon(result: nodes.BreakStatement | nodes.ContinueStatement) {
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.semicolon:
        		result.semicolonToken = this.readToken(tokens.TokenType.semicolon);
        	case tokens.TokenType.comma:
        		result.commaToken = this.readToken(tokens.TokenType.comma);
        		break;
        	default:
        		if (!this.lexer.peek().hasLineBreakBeforeStart) {
        			this.error({ start: this.lexer.current.end, end: this.lexer.current.end }, "this.parseMissing() tokens.TokenType.semicolon after property.");
        		}
        		break;
        }
    }

    /**
     * 解析一个表达式。
     * @param precedence 允许解析的最低操作符优先级。
     * @param allowIn 是否解析 in 表达式。
     */
    private parseExpression(precedence = tokens.Precedence.any, allowIn = true) {
        let result: nodes.Expression;
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.this:
        	case tokens.TokenType.null:
        	case tokens.TokenType.true:
        	case tokens.TokenType.false:
        	case tokens.TokenType.super:
        		result = this.parseSimpleLiteral();
        		break;
        	case tokens.TokenType.openParen:
        		result = this.parseArrowFunctionOrParenthesizedExpression(allowIn);
        		break;
        	case 'numericLiteral':
        		result = this.parseNumericLiteral();
        		break;
        	case 'stringLiteral':
        	case 'noSubstitutionTemplateLiteral':
        		result = this.parseStringLiteral();
        		break;
        	case tokens.TokenType.openBracket:
        		result = this.parseArrayLiteral();
        		break;
        	case tokens.TokenType.openBrace:
        		result = this.parseObjectLiteral();
        		break;
        	case tokens.TokenType.function:
        		result = this.parseFunctionExpression();
        		break;
        	case tokens.TokenType.new:
        		result = this.parseNewTargetOrNewExpression();
        		break;
        	case tokens.TokenType.slash:
        	case tokens.TokenType.slashEquals:
        		result = this.parseRegularExpressionLiteral();
        		break;
        	case 'templateHead':
        		result = this.parseTemplateLiteral();
        		break;
        	case tokens.TokenType.lessThan:
        		result = this.parseArrowFunctionOrTypeAssertionExpression(allowIn);
        		break;
        	case tokens.TokenType.yield:
        		result = this.parseYieldExpression(allowIn);
        		break;
        	case tokens.TokenType.await:
        		result = this.parseAwaitExpressionOrIdentifier(allowIn);
        		break;
        	case tokens.TokenType.class:
        		result = this.parseClassExpression();
        		break;
        	case tokens.TokenType.async:
        		result = this.parseAsyncFunctionExpressionOrIdentifier(allowIn);
        		break;
        	case tokens.TokenType.equalsGreaterThan:
        		result = this.parseArrowFunctionExpression(undefined, undefined, undefined, allowIn);
        		break;
        	default:
        		if (tokens.isUnaryOperator(this.lexer.peek().type)) {
        			result = this.parseUnaryExpression();
        			break;
        		}
        		if (tokens.isIdentifierName, tokens.isTypeNodeStart(this.lexer.peek().type)) {
        			result = this.parseArrowFunctionOrGenericExpressionOrIdentifier(allowIn);
        			break;
        		}
        		this.error(this.lexer.peek(), tokens.isKeyword(this.lexer.peek().type) ? "this.parseExpression() expected; '{0}' is a keyword." : "this.parseExpression() expected; this.parseUnexpected() token '{0}'.", tokens.getTokenName(this.lexer.peek().type));
        		return this.parseMissingExpression(tokens.isStatementStart(this.lexer.peek().type) ? this.lexer.current.end : this.lexer.read().type);
        }
        while (tokens.getPrecedence(this.lexer.peek().type) >= precedence) {
        	switch (this.lexer.peek().type) {
        		case tokens.TokenType.dot:
        			result = this.parseMemberCallExpression(result);
        			continue;
        		case tokens.TokenType.openParen:
        			result = this.parseFunctionCallExpression(result);
        			continue;
        		case tokens.TokenType.openBracket:
        			result = this.parseIndexCallExpression(result);
        			continue;
        		case tokens.TokenType.question:
        			result = this.parseConditionalExpression(result, allowIn);
        			continue;
        		case tokens.TokenType.plusPlus:
        		case tokens.TokenType.minusMinus:
        			if (!!this.lexer.peek().hasLineBreakBeforeStart) {
        				return result;
        			}
        			result = this.parsePostfixExpression(result);
        			continue;
        		case 'noSubstitutionTemplateLiteral':
        			result = this.parseTemplateCallExpression(result, this.parseStringLiteral());
        			continue;
        		case 'templateHead':
        			result = this.parseTemplateCallExpression(result, this.parseTemplateLiteral());
        			continue;
        		case tokens.TokenType.greaterThan:
        			const savedToken = this.lexer.current;
        			this.lexer.readAsGreaterThanTokens();
        			this.lexer.current = savedToken;
        			break;
        		case tokens.TokenType.in:
        			if (allowIn === false) {
        				return result;
        			}
        			break;
        	}
        	result = this.parseBinaryExpression(result, allowIn);
        }
        return result;
    }

    /**
     * 解析一个简单字面量(`null`、`true`、`false`、`this`、`super`)。
     */
    private parseSimpleLiteral() {
        const result = new nodes.SimpleLiteral;
        result.type = this.lexer.read(); // this、null、true、false、super
        return result;
    }

    /**
     * 解析一个箭头或括号表达式(`()=>...`、`(x)`)。
     * @param allowIn 是否解析 in 表达式。
     */
    private parseArrowFunctionOrParenthesizedExpression(allowIn?: boolean) {
        const savedState = this.lexer.stashSave();
        const parameters = this.parseParameters();
        if (!this.lexer.peek().hasLineBreakBeforeStart && (this.lexer.peek().type === tokens.TokenType.equalsGreaterThan || this.lexer.peek().type === tokens.TokenType.colon || this.lexer.peek().type === tokens.TokenType.openBrace)) {
        	this.lexer.stashClear(savedState);
        	return this.parseArrowFunctionExpression(undefined, undefined, parameters, allowIn);
        }
        this.lexer.stashRestore(savedState);
        return this.parseParenthesizedExpression();
    }

    /**
     * 解析一个括号表达式(`(x)`)。
     */
    private parseParenthesizedExpression() {
        const result = new nodes.ParenthesizedExpression;
        result.openParenToken = this.readToken(tokens.TokenType.openParen);
        result.body = this.parseExpression();
        result.closeParenToken = this.readToken(tokens.TokenType.closeParen);
        return result;
    }

    /**
     * 解析一个数组字面量(`[x, y]`)。
     */
    private parseArrayLiteral() {
        const result = new nodes.ArrayLiteral;
        result.elements = this.parseDelimitedList(this.parseArrayLiteralElement(), tokens.TokenType.openBracket, tokens.TokenType.closeBracket, true, tokens.isExpressionStart);
        return result;
    }

    /**
     * 解析一个数组字面量元素(`x`)。
     */
    private parseArrayLiteralElement() {
        const result = new nodes.ArrayLiteralElement;
        if (this.lexer.peek().type !== tokens.TokenType.comma && this.lexer.peek().type !== tokens.TokenType.closeBracket) {
        	if (this.lexer.peek().type === tokens.TokenType.dotDotDot) {
        		result.dotDotDotToken = this.readToken(tokens.TokenType.dotDotDot);;
        	}
        	result.value = this.parseExpression(tokens.Precedence.assignment);
        }
        return result;
    }

    /**
     * 解析一个对象字面量(`{x: y}`)。
     */
    private parseObjectLiteral() {
        const result = new nodes.ObjectLiteral;
        result.elements = this.parseDelimitedList(this.parseObjectLiteralElement(), tokens.TokenType.openBrace, tokens.TokenType.closeBrace, true, tokens.isPropertyNameStart);
        return result;
    }

    /**
     * 解析一个对象字面量元素(`x: y`、`x() {...}`)。
     */
    private parseObjectLiteralElement() {
        const modifiers = this.parseModifiers();
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.get:
        	case tokens.TokenType.set:
        		const savedToken = this.lexer.current;
        		this.lexer.read();
        		if (tokens.isPropertyNameStart(this.lexer.peek().type)) {
        			return this.parseObjectAccessorDeclaration(modifiers, savedToken.type === tokens.TokenType.get ? savedToken.start : undefined, savedToken.type === tokens.TokenType.set ? savedToken.start : undefined);
        		}
        		this.lexer.current = savedToken;
        		break;
        	case tokens.TokenType.asterisk:
        		return this.parseObjectMethodDeclaration(modifiers, this.readToken(tokens.TokenType.asterisk), this.parsePropertyName());
        }
        const name = this.parsePropertyName();
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.openParen:
        	case tokens.TokenType.lessThan:
        		return this.parseObjectMethodDeclaration(modifiers, undefined, name);
        	default:
        		return this.parseObjectPropertyDeclaration(modifiers, name);
        }
    }

    /**
     * 解析一个访问器声明(`get x() {...}`、`set x(value) {...}`)。
     * @param modifiers undefined。
     * @param getToken 标记 'get' 的位置。
     * @param setToken 标记 'set' 的位置。
     */
    private parseObjectAccessorDeclaration(modifiers?: nodes.Modifiers, getToken?: number, setToken?: number) {
        const result = new nodes.ObjectAccessorDeclaration;
        if (modifiers != undefined) {
        	result.modifiers = modifiers;
        }
        if (getToken != undefined) {
        	result.getToken = getToken;
        }
        if (setToken != undefined) {
        	result.setToken = setToken;
        }
        this.parseDocComment(result);
        result.name = this.parsePropertyName();
        this.parseCallSignature(result);
        this.parseFunctionBody(result);
        this.parseCommaOrSemicolon(result);
        return result;
    }

    /**
     * 解析一个方法声明(`x() {...}`)。
     * @param modifiers undefined。
     * @param asteriskToken 标记 '*' 的位置。
     * @param name  名字部分 。
     */
    private parseObjectMethodDeclaration(modifiers?: nodes.Modifiers, asteriskToken?: number, name: nodes.PropertyName) {
        const result = new nodes.ObjectMethodDeclaration;
        if (modifiers != undefined) {
        	result.modifiers = modifiers;
        }
        if (asteriskToken != undefined) {
        	result.asteriskToken = asteriskToken;
        }
        result.name = name;
        this.parseDocComment(result);
        this.parseCallSignature(result);
        this.parseFunctionBody(result);
        this.parseCommaOrSemicolon(result);
        return result;
    }

    /**
     * 解析一个属性声明(`x: y`)。
     * @param modifiers undefined。
     * @param key undefined。
     */
    private parseObjectPropertyDeclaration(modifiers?: nodes.Modifiers, key: nodes.PropertyName) {
        const result = new nodes.ObjectPropertyDeclaration;
        if (modifiers != undefined) {
        	result.modifiers = modifiers;
        }
        result.key = key;
        this.parseDocComment(result);
        if (this.lexer.peek().type === tokens.TokenType.colon || this.lexer.peek().type === tokens.TokenType.equals) {
        	if (this.lexer.peek().type === tokens.TokenType.colon) {
        		result.colonToken = this.readToken(tokens.TokenType.colon);
        	} else {
        		result.equalsToken = this.readToken(tokens.TokenType.equals);
        	}
        	result.value = this.parseExpression(tokens.Precedence.assignment);
        } else if (key.constructor === this.parseIdentifier() ? !utility.isIdentifier((<nodes.Identifier>key).value) :
        	key.constructor === this.parseMemberCallExpression() ? !utility.isIdentifier((<nodes.MemberCallExpression>key).argument) :
        		true) {
        	this.readToken(tokens.TokenType.colon);
        }
        this.parseCommaOrSemicolon(result);
        return result;
    }

    /**
     * 解析一个 new.target(`new.target`) 或 new 表达式(`new x()`)。
     */
    private parseNewTargetOrNewExpression() {
        const newToken = read(tokens.TokenType.new);
        if (this.lexer.peek().type === tokens.TokenType.dot) {
        	return this.parseNewTargetExpression(newToken);
        }
        return this.parseNewExpression(newToken);
    }

    /**
     * 解析一个 new.target 表达式(`new.target`)。
     * @param newToken 标记 'new' 的位置。
     */
    private parseNewTargetExpression(newToken: number) {
        const result = new nodes.NewTargetExpression;
        result.newToken = newToken;
        result.dotToken = this.readToken(tokens.TokenType.dot);
        if (this.lexer.peek().type === 'identifier' && this.lexer.peek().data === "target") {
        	result.target = this.readToken(tokens.TokenType.unknown);
        } else {
        	this.error(this.lexer.peek(), "'target' expected; this.parseUnexpected() token '{0}'.", tokens.getTokenName(this.lexer.peek().type));
        }
        return result;
    }

    /**
     * 解析一个 new 表达式(`new x()`、`new x`)。
     * @param newToken 标记 'new' 的位置。
     */
    private parseNewExpression(newToken: number) {
        const result = new nodes.NewExpression;
        result.newToken = newToken;
        result.target = this.parseExpression(tokens.Precedence.member);
        if (this.lexer.peek().type === tokens.TokenType.openParen) {
        	result.arguments = this.parseArguments();
        }
        return result;
    }

    /**
     * 解析一个正则表达式字面量(/abc/)。
     */
    private parseRegularExpressionLiteral() {
        const result = new nodes.RegularExpressionLiteral;
        result.value = this.readToken(tokens.TokenType.regularExpressionLiteral);
        return result;
    }

    /**
     * 解析一个模板字面量(`\`abc\``)。
     */
    private parseTemplateLiteral() {
        const result = new nodes.TemplateLiteral;
        result.spans = this.parseNodeList(this.parseTemplateSpan() || nodes.Expression, , )
        while (true) {
        	result.spans.push(this.parseTemplateSpan());
        	result.spans.push(this.parseExpression());
        	if (this.lexer.peek().type !== tokens.TokenType.closeBrace) {
        		this.readToken(tokens.TokenType.closeBrace);
        		break;
        	}
        	if (this.lexer.readAsTemplateMiddleOrTail().type === 'templateTail') {
        		result.spans.push(this.parseTemplateSpan());
        		break;
        	}
        }
        return result;
    }

    /**
     * 解析一个模板文本区块(`\`abc${`、`}abc${`、`}abc\``)。
     */
    private parseTemplateSpan() {
        const result = new nodes.TemplateSpan;
        result.value = this.readToken(tokens.TokenType.templateMiddle);
        return result;
    }

    /**
     * 解析一个箭头函数(`<T>() => {}`)或类型确认表达式(`<T>fn`)。
     * @param allowIn 是否解析 in 表达式。
     */
    private parseArrowFunctionOrTypeAssertionExpression(allowIn?: boolean) {
        const savedState = this.lexer.stashSave();
        const typeParameters = this.parseTypeParameters();
        const parameters = this.lexer.peek().type === tokens.TokenType.openParen ? this.parseParameters() : tokens.isIdentifierName(this.lexer.peek().type) ? this.parseIdentifier() : undefined;
        if (parameters && !this.lexer.peek().hasLineBreakBeforeStart && (this.lexer.peek().type === tokens.TokenType.equalsGreaterThan || this.lexer.peek().type === tokens.TokenType.colon || this.lexer.peek().type === tokens.TokenType.openBrace)) {
        	this.lexer.stashClear(savedState);
        	return this.parseArrowFunctionExpression(undefined, typeParameters, parameters, allowIn);
        }
        this.lexer.stashRestore(savedState);
        return this.parseTypeAssertionExpression();
    }

    /**
     * 解析一个类型确认表达式(<T>xx)。
     */
    private parseTypeAssertionExpression() {
        const result = new nodes.TypeAssertionExpression;
        result.lessThanToken = this.readToken(tokens.TokenType.lessThan);
        result.type = this.parseTypeNode();
        result.greaterThanToken = this.readToken(tokens.TokenType.greaterThan);
        result.operand = this.parseExpression(tokens.Precedence.postfix);
        return result;
    }

    /**
     * 解析一个 yield 表达式(`yield xx`)。
     * @param allowIn 是否解析 in 表达式。
     */
    private parseYieldExpression(allowIn?: boolean) {
        const result = new nodes.YieldExpression;
        result.yieldToken = this.readToken(tokens.TokenType.yield);
        if (!this.lexer.peek().hasLineBreakBeforeStart && this.lexer.peek().type === tokens.TokenType.asterisk) {
        	result.asteriskToken = this.readToken(tokens.TokenType.asterisk);
        }
        if (!this.lexer.peek().hasLineBreakBeforeStart && tokens.isExpressionStart(this.lexer.peek().type)) {
        	result.operand = this.parseExpression(tokens.Precedence.assignment, allowIn);
        }
        return result;
    }

    /**
     * 解析一个 await 表达式(`await xx`)或标识符。
     * @param allowIn 是否解析 in 表达式。
     */
    private parseAwaitExpressionOrIdentifier(allowIn: boolean) {
        const savedToken = this.lexer.current;
        const awaitToken = read(tokens.TokenType.await);
        if (!this.lexer.peek().hasLineBreakBeforeStart && tokens.isExpressionStart(this.lexer.peek().type)) {
        	return this.parseAwaitExpression(awaitToken, allowIn);
        }
        this.lexer.current = savedToken;
        return this.parseIdentifier();
    }

    /**
     * 解析一个 await 表达式(`await xx`)。
     * @param awaitToken 标记 'await' 的位置。
     * @param allowIn 是否解析 in 表达式。
     */
    private parseAwaitExpression(awaitToken: number, allowIn?: boolean) {
        const result = new nodes.AwaitExpression;
        result.awaitToken = awaitToken;
        result.operand = this.parseExpression(tokens.Precedence.assignment, allowIn);
        return result;
    }

    /**
     * 解析一个异步函数表达式或标识符。
     * @param allowIn 是否解析 in 表达式。
     */
    private parseAsyncFunctionExpressionOrIdentifier(allowIn?: boolean) {
        const savedState = this.lexer.stashSave();
        const modifiers = this.parseModifiers();
        const typeParameters = !this.lexer.peek().hasLineBreakBeforeStart && this.lexer.peek().type === tokens.TokenType.lessThan ? this.parseTypeParameters() : undefined;
        if (!this.lexer.peek().hasLineBreakBeforeStart) {
        	if (this.lexer.peek().type === tokens.TokenType.function) {
        		return this.parseFunctionExpression(modifiers);
        	}
        	if ((this.lexer.peek().type === tokens.TokenType.openParen || tokens.isIdentifierName, tokens.isTypeNodeStart(this.lexer.peek().type))) {
        		const parameters = this.lexer.peek().type === tokens.TokenType.openParen ? this.parseParameters() : nodes.Identifier();
        		if (!this.lexer.peek().hasLineBreakBeforeStart && (this.lexer.peek().type === tokens.TokenType.equalsGreaterThan || this.lexer.peek().type === tokens.TokenType.colon || this.lexer.peek().type === tokens.TokenType.openBrace)) {
        			this.lexer.stashClear(savedState);
        			return this.parseArrowFunctionExpression(modifiers, typeParameters, parameters, allowIn);
        		}
        	}
        }
        this.lexer.stashRestore(savedState);
        return this.parseIdentifier();
    }

    /**
     * 解析一个一元运算表达式(`+x`、`typeof x`、...)。
     */
    private parseUnaryExpression() {
        const result = new nodes.UnaryExpression;
        result.operator = this.lexer.read(); // delete、void、typeof、+、-、~、!、++、--、...
        result.operand = this.parseExpression(tokens.Precedence.postfix);
        return result;
    }

    /**
     * 解析一个箭头函数或泛型表达式或标识符(`x => y`、`x<T>`、`x`)。
     * @param allowIn 是否解析 in 表达式。
     */
    private parseArrowFunctionOrGenericExpressionOrIdentifier(allowIn?: boolean) {
        let result = this.parseIdentifier();
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.equalsGreaterThan:
        		result = this.parseArrowFunctionExpression(undefined, undefined, result, allowIn);
        		break;
        	case tokens.TokenType.lessThan:
        		if (!this.lexer.peek().hasLineBreakBeforeStart) {
        			const savedState = this.lexer.stashSave();
        			const typeArguments = this.parseTypeArguments();
        			if (this.lexer.current.type === tokens.TokenType.greaterThan) {
        				this.lexer.stashClear(savedState);
        				result = this.parseGenericExpression(result, typeArguments);
        			} else {
        				this.lexer.stashRestore(savedState);
        			}
        		}
        		break;
        }
        return result;
    }

    /**
     * 解析一个泛型表达式(`x<number>`)。
     * @param target 目标部分。
     * @param typeArguments 类型参数部分。
     */
    private parseGenericExpression(target: nodes.Identifier, typeArguments: nodes.NodeList<nodes.TypeArgument>) {
        const result = new nodes.GenericExpression;
        result.target = target;
        result.typeArguments = typeArguments;
        return result;
    }

    /**
     * 解析一个错误的表达式占位符。
     * @param start undefined。
     */
    private parseMissingExpression(start: number/*标记的开始位置*/) {
    }

    /**
     * 解析一个函数调用表达式(`x()`)。
     * @param target 目标部分。
     */
    private parseFunctionCallExpression(target: nodes.Expression) {
        const result = new nodes.FunctionCallExpression;
        result.target = target;
        result.arguments = this.parseArguments();
        return result;
    }

    /**
     * 解析一个索引调用表达式(`x[y]`)。
     * @param target 目标部分。
     */
    private parseIndexCallExpression(target: nodes.Expression) {
        const result = new nodes.IndexCallExpression;
        result.target = target;
        result.openBracketToken = this.readToken(tokens.TokenType.openBracket);
        result.argument = this.parseExpression();
        result.closeBracketToken = this.readToken(tokens.TokenType.closeBracket);
        return result;
    }

    /**
     * 解析一个条件表达式(`x ? y : z`)。
     * @param condition undefined。
     * @param allowIn 是否解析 in 表达式。
     */
    private parseConditionalExpression(condition: nodes.Expression, allowIn?: boolean) {
        const result = new nodes.ConditionalExpression;
        result.condition = condition;
        result.questionToken = this.readToken(tokens.TokenType.question);
        result.then = this.parseExpression(tokens.Precedence.assignment);
        result.colonToken = this.readToken(tokens.TokenType.colon);
        result.else = this.parseExpression(tokens.Precedence.assignment, allowIn);
        return result;
    }

    /**
     * 解析一个后缀表达式(`x++`、`x--`)。
     * @param operand  操作数。
     */
    private parsePostfixExpression(operand: nodes.Expression) {
        const result = new nodes.PostfixExpression;
        result.operand = operand;
        result.operator = this.lexer.read(); // ++、--
        return result;
    }

    /**
     * 解析一个模板调用表达式(`x\`abc\``)。
     * @param target 目标部分。
     * @param argument  参数部分。
     */
    private parseTemplateCallExpression(target: nodes.Expression, argument: nodes.TemplateLiteral | nodes.StringLiteral) {
        const result = new nodes.TemplateCallExpression;
        result.target = target;
        result.argument = argument;
        return result;
    }

    /**
     * 解析一个双目表达式(x + y、x = y、...)。
     * @param left 左值部分。
     * @param allowIn 是否解析 in 表达式。
     */
    private parseBinaryExpression(left: nodes.Expression, allowIn?: boolean) {
        const result = new nodes.BinaryExpression;
        result.left = left;
        result.operator = this.lexer.read(); // ,、*=、/=、%=、+=、‐=、<<=、>>=、>>>=、&=、^=、,=、**=、=、,,、&&、,、^、&、==、!=、===、!==、<、>、<=、>=、instanceof、in、<<、>>、>>>、+、-、*、/、%、**
        result.right = this.parseExpression(tokens.getPrecedence(result.operator) + (tokens.isRightHandOperator(result.operator) ? 0 : 1), allowIn);
        return result;
    }

    /**
     * 解析一个函数调用参数列表。
     */
    private parseArguments() {
        return this.parseDelimitedList(this.parseArgument(), , , true, tokens.isArgumentStart);
    }

    /**
     * 解析一个函数调用参数(`x`)。
     */
    private parseArgument() {
        const result = new nodes.Argument;
        if (this.lexer.peek().type === tokens.TokenType.dotDotDot) {
        	result.dotDotDotToken = this.readToken(tokens.TokenType.dotDotDot);;
        }
        result.value = this.parseExpression(tokens.Precedence.assignment);
        return result;
    }

    /**
     * 解析一个箭头函数表达式(`x => {...}`、`(x, y) => {...}`)。。
     * @param modifiers undefined。
     * @param typeParameters undefined。
     * @param parameters 参数部分。
     * @param allowIn 是否解析 in 表达式。
     */
    private parseArrowFunctionExpression(modifiers?: nodes.Modifiers, typeParameters?: nodes.NodeList<nodes.TypeParameterDeclaration>, parameters?: nodes.Parameters | nodes.Identifier, allowIn?: boolean) {
        const result = new nodes.ArrowFunctionExpression;
        if (modifiers != undefined) {
        	result.modifiers = modifiers;
        }
        if (typeParameters != undefined) {
        	result.typeParameters = typeParameters;
        }
        if (parameters != undefined) {
        	result.parameters = parameters;
        }
        if (parameters.constructor !== this.parseIdentifier()) {
        	this.parseTypeAnnotation(result);
        }
        result.equalsGreaterThanToken = this.readToken(tokens.TokenType.equalsGreaterThan);
        result.body = this.lexer.peek().type === tokens.TokenType.openBrace ? this.parseBlockStatement() : nodes.Expression(tokens.Precedence.assignment, allowIn);
        return result;
    }

    /**
     * 解析一个成员调用表达式(x.y)。
     * @param target 目标部分。
     */
    private parseMemberCallExpression(target: nodes.Expression) {
        const result = new nodes.MemberCallExpression;
        result.target = target;
        result.dotToken = this.readToken(tokens.TokenType.dot);
        result.argument = this.parseIdentifier(true);
        return result;
    }

    /**
     * 解析一个数字字面量(`1`)。
     */
    private parseNumericLiteral() {
        const result = new nodes.NumericLiteral;
        result.value = this.readToken(tokens.TokenType.numericLiteral);
        return result;
    }

    /**
     * 解析一个字符串字面量(`'abc'`、`"abc"`、`\`abc\``)。
     */
    private parseStringLiteral() {
        const result = new nodes.StringLiteral;
        result.value = this.readToken(tokens.TokenType.stringLiteral);
        return result;
    }

    /**
     * 解析一个标识符(`x`)。
     * @param allowKeyword 是否允许解析关键字。
     */
    private parseIdentifier(allowKeyword = false) {
        const result = new nodes.Identifier;
        let isIdentifier = tokens.isIdentifierName(this.lexer.peek().type);
        if (!isIdentifier && allowKeyword && tokens.isKeyword(this.lexer.peek().type)) {
        	isIdentifier = true;
        	if (!!this.lexer.peek().hasLineBreakBeforeStart && tokens.isStatementStart(this.lexer.peek().type)) {
        		const savedState = this.lexer.stashSave();
        		this.parseStatement();
        		if (!savedState.errors.length) {
        			isIdentifier = false;
        		}
        	}
        }
        if (isIdentifier) {
        	result.value = this.readToken(tokens.TokenType.identifier);
        } else {
        	this.error(this.lexer.peek(), tokens.isKeyword(this.lexer.peek().type) ? "this.parseIdentifier() expected; this.parseKeyword() '{0}' cannot be used as an identifier." : "this.parseIdentifier() expected; this.parseUnexpected() token '{0}'.", tokens.getTokenName(this.lexer.peek().type));
        }
        return result;
    }
    // #endregion

    // #region 语句

    /**
     * 解析一个语句。
     */
    private parseStatement() {
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.openBrace:
        		return this.parseBlockStatement();
        	case tokens.TokenType.var:
        	case tokens.TokenType.const:
        		return this.parseVariableStatement();
        	case tokens.TokenType.let:
        		return this.parseVariableOrExpressionStatement();
        	case tokens.TokenType.if:
        		return this.parseIfStatement();
        	case tokens.TokenType.for:
        		return this.parseForOrForInOrForOfOrForToStatement();
        	case tokens.TokenType.while:
        		return this.parseWhileStatement();
        	case tokens.TokenType.switch:
        		return this.parseSwitchStatement();
        	case tokens.TokenType.do:
        		return this.parseDoWhileStatement();
        	case tokens.TokenType.break:
        		return this.parseBreakStatement();
        	case tokens.TokenType.continue:
        		return this.parseContinueStatement();
        	case tokens.TokenType.return:
        		return this.parseReturnStatement();
        	case tokens.TokenType.throw:
        		return this.parseThrowStatement();
        	case tokens.TokenType.try:
        		return this.parseTryStatement();
        	case tokens.TokenType.debugger:
        		return this.parseDebuggerStatement();
        	case tokens.TokenType.semicolon:
        		return this.parseEmptyStatement();
        	case 'endOfFile':
        		return this.parseMissingStatement();
        	case tokens.TokenType.with:
        		return this.parseWithStatement();
        	case tokens.TokenType.import:
        		return this.parseImportAssignmentOrImportDeclaration();
        	case tokens.TokenType.export:
        		return this.parseExportAssignmentOrExportDeclaration();
        	case tokens.TokenType.type:
        		return this.parseTypeAliasDeclaration();
        	default:
        		if (tokens.isDeclarationStart(this.lexer.peek().type)) {
        			return this.parseDeclarationOrLabeledOrExpressionStatement();
        		}
        		return this.parseLabeledOrExpressionStatement();
        }
    }

    /**
     * 解析一个变量声明(`let x`)或表达式语句(`let(x)`)。
     * @param allowIn 是否解析 in 表达式。
     */
    private parseVariableOrExpressionStatement(allowIn?: boolean) {
        const savedToken = this.lexer.current;
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.let:
        	case tokens.TokenType.var:
        	case tokens.TokenType.const:
        		this.lexer.read();
        		const isBindingName = tokens.isBindingNameStart(this.lexer.peek().type);
        		this.lexer.current = savedToken;
        		if (isBindingName) {
        			return this.parseVariableStatement(allowIn);
        		}
        		break;
        }
        return this.parseExpressionStatement(this.parseExpression(tokens.Precedence.any, allowIn));
    }

    /**
     * 解析一个 if 语句(`if (x) ...`)。
     */
    private parseIfStatement() {
        const result = new nodes.IfStatement;
        result.ifToken = this.readToken(tokens.TokenType.if);
        this.parseCondition(result);
        result.then = this.parseEmbeddedStatement();
        if (this.lexer.peek().type === tokens.TokenType.else) {
        	result.elseToken = this.readToken(tokens.TokenType.else);
        	result.else = this.parseEmbeddedStatement();
        }
        return result;
    }

    /**
     * 解析一个 for 或 for..in 或 for..of 或 for..to 语句。
     */
    private parseForOrForInOrForOfOrForToStatement() {
        const forToken = this.readToken(tokens.TokenType.for);
        const openParenToken = this.lexer.peek().type === tokens.TokenType.openParen || this.options.allowMissingParenthese === false ? this.readToken(tokens.TokenType.openParen) : undefined;
        const initializer = this.lexer.peek().type === tokens.TokenType.semicolon ? undefined : nodes.VariableOrExpressionStatement(false);
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.in:
        		return this.parseForInStatement(forToken, openParenToken, initializer);
        	case tokens.TokenType.of:
        		return this.parseForOfStatement(forToken, openParenToken, initializer);
        	case tokens.TokenType.to:
        		return this.parseForToStatement(forToken, openParenToken, initializer);
        	default:
        		return this.parseForStatement(forToken, openParenToken, initializer);
        }
    }

    /**
     * 解析一个 for..in 语句(`for(var x in y) ...`)。
     * @param forToken 标记 'for' 的位置。
     * @param openParenToken 标记 '(' 的位置。
     * @param initializer  初始值部分。
     */
    private parseForInStatement(forToken: number, openParenToken?: number, initializer?: nodes.VariableStatement | nodes.ExpressionStatement) {
        const result = new nodes.ForInStatement;
        result.forToken = forToken;
        if (openParenToken != undefined) {
        	result.openParenToken = openParenToken;
        }
        if (initializer != undefined) {
        	result.initializer = initializer;
        }
        result.inToken = this.readToken(tokens.TokenType.in);
        result.condition = this.parseExpression();
        if (openParenToken != undefined) {
        	result.closeParenToken = this.readToken(tokens.TokenType.closeParen);
        }
        result.body = this.parseEmbeddedStatement();
        return result;
    }

    /**
     * 解析一个 for..of 语句(`for(var x of y) ...`)。
     * @param forToken 标记 'for' 的位置。
     * @param openParenToken 标记 '(' 的位置。
     * @param initializer  初始值部分。
     */
    private parseForOfStatement(forToken: number, openParenToken?: number, initializer?: nodes.VariableStatement | nodes.ExpressionStatement) {
        const result = new nodes.ForOfStatement;
        result.forToken = forToken;
        if (openParenToken != undefined) {
        	result.openParenToken = openParenToken;
        }
        if (initializer != undefined) {
        	result.initializer = initializer;
        }
        result.ofToken = this.readToken(tokens.TokenType.of);
        result.condition = this.parseExpression();
        if (openParenToken != undefined) {
        	result.closeParenToken = this.readToken(tokens.TokenType.closeParen);
        }
        result.body = this.parseEmbeddedStatement();
        return result;
    }

    /**
     * 解析一个 for..to 语句(`for(var x = 0 to 10) ...`)。
     * @param forToken 标记 'for' 的位置。
     * @param openParenToken 标记 '(' 的位置。
     * @param initializer  初始值部分。
     */
    private parseForToStatement(forToken: number, openParenToken?: number, initializer?: nodes.VariableStatement | nodes.ExpressionStatement) {
        const result = new nodes.ForToStatement;
        result.forToken = forToken;
        if (openParenToken != undefined) {
        	result.openParenToken = openParenToken;
        }
        if (initializer != undefined) {
        	result.initializer = initializer;
        }
        result.toToken = this.readToken(tokens.TokenType.to);
        result.condition = this.parseExpression();
        if (openParenToken != undefined) {
        	result.closeParenToken = this.readToken(tokens.TokenType.closeParen);
        }
        result.body = this.parseEmbeddedStatement();
        return result;
    }

    /**
     * 解析一个 for 语句(`for(var i = 0; i < 9 i++) ...`)。
     * @param forToken 标记 'for' 的位置。
     * @param openParenToken 标记 '(' 的位置。
     * @param initializer  初始值部分。
     */
    private parseForStatement(forToken: number, openParenToken?: number, initializer?: nodes.VariableStatement | nodes.ExpressionStatement) {
        const result = new nodes.ForStatement;
        result.forToken = forToken;
        if (openParenToken != undefined) {
        	result.openParenToken = openParenToken;
        }
        if (initializer != undefined) {
        	result.initializer = initializer;
        }
        result.firstSemicolon = this.readToken(tokens.TokenType.semicolon);
        if (this.lexer.peek().type !== tokens.TokenType.semicolon) {
        	result.condition = this.parseExpression();
        }
        if (openParenToken == undefined ? tokens.isExpressionStart(this.lexer.peek().type) : this.lexer.peek().type !== tokens.TokenType.closeParen) {
        	result.iterator = this.parseExpression();
        }
        if (openParenToken != undefined) {
        	result.closeParenToken = this.readToken(tokens.TokenType.closeParen);
        }
        result.body = this.parseEmbeddedStatement();
        return result;
    }

    /**
     * 解析一个 while 语句(`while(x) ...`)。
     */
    private parseWhileStatement() {
        const result = new nodes.WhileStatement;
        result.whileToken = this.readToken(tokens.TokenType.while);
        this.parseCondition(result);
        result.body = this.parseEmbeddedStatement();
        return result;
    }

    /**
     * 解析一个 switch 语句(`switch(x) {...}`)。
     */
    private parseSwitchStatement() {
        const result = new nodes.SwitchStatement;
        if (this.options.allowMissingSwitchCondition === false || this.lexer.peek().type !== tokens.TokenType.openBrace) {
        	this.parseCondition(result);
        }
        result.cases = this.parseNodeList(this.parseCaseOrDefaultClause(), tokens.TokenType.openBrace, tokens.TokenType.closeBrace)
        return result;
    }

    /**
     * 解析一个 case(`case x: ...`) 或 default(`default: ...`) 分支。
     */
    private parseCaseOrDefaultClause() {
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.case:
        		return this.parseCaseClause();
        	case tokens.TokenType.default:
        		return this.parseDefaultClause();
        	default:
        		this.error(this.lexer.peek(), "tokens.TokenType.case or tokens.TokenType.default expected; this.parseUnexpected() token '{0}'.", tokens.getTokenName(this.lexer.peek().type));
        		return;
        }
    }

    /**
     * 解析一个 case 分支(`case x: ...`)。
     */
    private parseCaseClause() {
        const result = new nodes.CaseClause;
        result.caseToken = this.readToken(tokens.TokenType.case);
        result.labels = this.parseDelimitedList(this.parseCaseClauseLabel(), , , false, tokens.isCaseLabelStart);
        result.colonToken = this.readToken(tokens.TokenType.colon);
        result.statements = this.parseNodeList(this.parseCaseStatement(), , )
        return result;
    }

    /**
     * 解析一个 case 分支标签(`case x: ...`)。
     */
    private parseCaseClauseLabel() {
        const result = new nodes.CaseClauseLabel;
        if (this.lexer.peek().type === tokens.TokenType.else) {
        	result.elseToken = this.readToken(tokens.TokenType.else);
        } else {
        	result.label = this.parseExpression(tokens.Precedence.assignment);
        }
        return result;
    }

    /**
     * 解析一个 default 分支(`default: ...`)。
     */
    private parseDefaultClause() {
        const result = new nodes.DefaultClause;
        result.defaultToken = this.readToken(tokens.TokenType.default);
        result.colonToken = this.readToken(tokens.TokenType.colon);
        result.statements = this.parseNodeList(this.parseCaseStatement(), , )
        return result;
    }

    /**
     * 解析一个 case 段语句。
     */
    private parseCaseStatement() {
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.case:
        	case tokens.TokenType.default:
        	case tokens.TokenType.closeBrace:
        	case 'endOfFile':
        		return;
        	default:
        		return this.parseStatement();
        }
    }

    /**
     * 解析一个 do..while 语句(`do ... while(x)`)。
     */
    private parseDoWhileStatement() {
        const result = new nodes.DoWhileStatement;
        result.doToken = this.readToken(tokens.TokenType.do);
        result.body = this.parseEmbeddedStatement();
        result.whileToken = this.readToken(tokens.TokenType.while);
        this.parseCondition(result);
        this.parseSemicolon(result);
        return result;
    }

    /**
     * 解析一个 break 语句(`break xx`)。
     */
    private parseBreakStatement() {
        const result = new nodes.BreakStatement;
        result.breakToken = this.readToken(tokens.TokenType.break);
        this.parseBreakOrContinueStatement(result);
        return result;
    }

    /**
     * 解析一个 continue 语句(`continue xx`)。
     */
    private parseContinueStatement() {
        const result = new nodes.ContinueStatement;
        result.continueToken = this.readToken(tokens.TokenType.continue);
        this.parseBreakOrContinueStatement(result);
        return result;
    }

    /**
     * 解析一个 break 或 continue语句(`break xx;`、`continue xx`)。
     * @param _  解析的目标节点 。
     */
    private parseBreakOrContinueStatement(result: nodes.BreakStatement | nodes.ContinueStatement) {
        result.result = result;
        if (!this.parseSemicolon(result)) {
        	result.label = this.parseIdentifier();
        	this.parseSemicolon(result);
        }
    }

    /**
     * 解析一个 return 语句(`return x`)。
     */
    private parseReturnStatement() {
        const result = new nodes.ReturnStatement;
        result.returnToken = this.readToken(tokens.TokenType.return);
        if (!this.parseSemicolon(result)) {
        	result.value = this.parseExpression();
        	this.parseSemicolon(result);
        }
        return result;
    }

    /**
     * 解析一个 throw 语句(`throw x`)。
     */
    private parseThrowStatement() {
        const result = new nodes.ThrowStatement;
        result.throwToken = this.readToken(tokens.TokenType.throw);
        if (!this.parseSemicolon(result)) {
        	result.value = this.parseExpression();
        	!this.parseSemicolon(result);
        }
        return result;
    }

    /**
     * 解析一个 try 语句(`try {...} catch(e) {...}`)。
     */
    private parseTryStatement() {
        const result = new nodes.TryStatement;
        result.tryToken = this.readToken(tokens.TokenType.try);
        result.try = this.parseEmbeddedStatement();
        if (this.lexer.peek().type === tokens.TokenType.catch) {
        	result.catch = this.parseCatchClause();
        }
        if (this.lexer.peek().type === tokens.TokenType.finally) {
        	result.finally = this.parseFinallyClause();
        }
        if (this.options.allowSimpleTryBlock === false && !result.catch && !result.finally) {
        	this.error(this.lexer.peek(), "tokens.TokenType.catch or tokens.TokenType.finally expected. this.parseUnexpected() token '{0}'.", tokens.getTokenName(this.lexer.peek().type));
        }
        return result;
    }

    /**
     * 解析一个 catch 分句(`catch(e) {...}`)。
     */
    private parseCatchClause() {
        const result = new nodes.CatchClause;
        result.catchToken = this.readToken(tokens.TokenType.catch);
        const hasParan = this.lexer.peek().type === tokens.TokenType.openParen;
        if (hasParan || this.options.allowMissingParenthese === false) {
        	result(tokens.TokenType.openParen);
        }
        if (tokens.isBindingNameStart(this.lexer.peek().type)) {
        	result.variable = this.parseBindingName();
        	if (this.lexer.peek().type === tokens.TokenType.colon) {
        		this.error(this.lexer.peek().type, "this.parseCatch() variable cannot have a type annotation; this.parseUnexpected() token tokens.TokenType.colon.");
        		this.lexer.read();
        		if (tokens.isTypeNodeStart(this.lexer.peek().type)) {
        			this.parseTypeNode();
        		}
        	}
        }
        if (hasParan) {
        	result(tokens.TokenType.closeParen);
        }
        result.body = this.parseEmbeddedStatement();
        return result;
    }

    /**
     * 解析一个 finally 分句(`finally {...}`)。
     */
    private parseFinallyClause() {
        const result = new nodes.FinallyClause;
        result.finallyToken = this.readToken(tokens.TokenType.finally);
        result.body = this.parseEmbeddedStatement();
        return result;
    }

    /**
     * 解析一个 debugger 语句(`debugger`)。
     */
    private parseDebuggerStatement() {
        const result = new nodes.DebuggerStatement;
        result.debuggerToken = this.readToken(tokens.TokenType.debugger);
        this.parseSemicolon(tokens.TokenType.semicolon);
        return result;
    }

    /**
     * 解析一个空语句(``)。
     */
    private parseEmptyStatement() {
        const result = new nodes.EmptyStatement;
        this.parseSemicolon(result);
        return result;
    }

    /**
     * 解析一个缺少语句。
     */
    private parseMissingStatement() {
        this.error(this.lexer.peek(), "this.parseStatement() this.parseOr() this.parseDeclaration() expected. this.parseUnexpected() end of file.");
    }

    /**
     * 解析一个 with 语句(`with (x) ...`)。
     */
    private parseWithStatement() {
        const result = new nodes.WithStatement;
        result.withToken = this.readToken(tokens.TokenType.with);
        const hasParan = this.lexer.peek().type === tokens.TokenType.openParen;
        if (hasParan) {
        	result(tokens.TokenType.openParen);
        }
        result.value = this.parseVariableOrExpressionStatement();
        if (hasParan) {
        	result(tokens.TokenType.closeParen);
        }
        result.body = this.parseEmbeddedStatement();
        return result;
    }

    /**
     * 解析一个条件表达式。
     * @param _  解析的目标节点 。
     */
    private parseCondition(result: nodes.BreakStatement | nodes.ContinueStatement) {
        const hasParan = this.lexer.peek().type === tokens.TokenType.openParen;
        if (hasParan || this.options.allowMissingParenthese === false) {
        	result.openParenToken = this.readToken(tokens.TokenType.openParen);
        }
        result.condition = this.parseExpression();
        if (hasParan) {
        	result.closeParenToken = this.readToken(tokens.TokenType.closeParen);
        }
    }

    /**
     * 解析一个内嵌语句。
     */
    private parseEmbeddedStatement() {
        return this.parseStatement();
    }

    /**
     * 解析一个表达式或标签语句。
     */
    private parseLabeledOrExpressionStatement() {
        const parsed = this.parseExpression();
        if (parsed.constructor === this.parseIdentifier() && this.lexer.peek().type === tokens.TokenType.colon) {
        	return this.parseLabelledStatement(<nodes.Identifier>parsed);
        }
        return this.parseExpressionStatement(parsed);
    }

    /**
     * 解析一个标签语句(`x: ...`)。
     * @param label undefined。
     */
    private parseLabelledStatement(label: nodes.Identifier) {
        const result = new nodes.LabelledStatement;
        result.label = label;
        this.parseDocComment(result);
        result.colonToken = this.readToken(tokens.TokenType.colon);
        result.statement = this.parseStatement();
        return result;
    }

    /**
     * 解析一个变量声明语句(`var x`、`let x`、`const x`)。
     * @param modifiers undefined。
     * @param allowIn 是否解析 in 表达式。
     */
    private parseVariableStatement(modifiers?: nodes.Modifiers, allowIn?: boolean) {
        const result = new nodes.VariableStatement;
        if (modifiers != undefined) {
        	result.modifiers = modifiers;
        }
        result.type = this.lexer.read(); // var、let、const
        result.variables = this.parseNodeList(allowIn !== false ? this.parseVariableDeclaration() : (, , )
        return result;
    }

    /**
     * 解析一个变量声明(`x = 1`、`[x] = [1]`、`{a: x} = {a: 1}`)。
     * @param allowIn 是否解析 in 表达式。
     */
    private parseVariableDeclaration(allowIn?: boolean) {
        const result = new nodes.VariableDeclaration;
        result.mame = this.parseBindingName();
        this.parseTypeAnnotation(result);
        this.parseInitializer(result, allowIn);
        return result;
    }

    /**
     * 解析一个表达式语句(`x()`)。
     * @param expression 表达式部分。
     */
    private parseExpressionStatement(expression: nodes.Expression) {
        const result = new nodes.ExpressionStatement;
        result.expression = expression;
        this.parseSemicolon(result);
        return result;
    }

    /**
     * 解析一个语句块(`{...}`)。
     */
    private parseBlockStatement() {
        const result = new nodes.BlockStatement;
        result.statements = this.parseNodeList(this.parseStatement(), tokens.TokenType.openBrace, tokens.TokenType.closeBrace)
        return result;
    }

    /**
     * 解析一个分号。
     * @param _  解析的目标节点 。
     */
    private parseSemicolon(result: nodes.BreakStatement | nodes.ContinueStatement) {
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.semicolon:
        		if (this.lexer.peek().type === tokens.TokenType.semicolon) {
        			result.semicolonToken = this.readToken(tokens.TokenType.semicolon);;
        		}
        		return true;
        	case tokens.TokenType.closeBrace:
        	case 'endOfFile':
        		if (this.options.allowMissingSemicolon !== false) {
        			return true;
        		}
        		break;
        }
        this.error({ start: this.lexer.current.end, end: this.lexer.current.end }, "this.parseMissing() tokens.TokenType.semicolon after statement.");
        return false;
    }
    // #endregion

    // #region 声明

    /**
     * 解析一个声明。
     */
    private parseDeclaration() {
    }

    /**
     * 解析一个声明或表达式语句。
     */
    private parseDeclarationOrLabeledOrExpressionStatement() {
        const savedState = this.lexer.stashSave();
        const decorators = this.parseDecorators();
        const modifiers = this.parseModifiers();
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.function:
        		this.lexer.stashClear(savedState);
        		return this.parseFunctionDeclaration(decorators, modifiers);
        	case tokens.TokenType.class:
        		this.lexer.stashClear(savedState);
        		return this.parseClassDeclaration(decorators, modifiers);
        	case tokens.TokenType.interface:
        		this.lexer.stashClear(savedState);
        		return this.parseInterfaceDeclaration(decorators, modifiers);
        	case tokens.TokenType.enum:
        		this.lexer.stashClear(savedState);
        		return this.parseEnumDeclaration(decorators, modifiers);
        	case tokens.TokenType.namespace:
        		this.lexer.stashClear(savedState);
        		return this.parseNamespaceDeclaration(decorators, modifiers);
        	case tokens.TokenType.module:
        		this.lexer.stashClear(savedState);
        		return this.parseModuleDeclaration(decorators, modifiers);
        	case tokens.TokenType.extends:
        		this.lexer.stashClear(savedState);
        		return this.parseExtensionDeclaration(decorators, modifiers);
        	default:
        		this.lexer.stashRestore(savedState);
        		return this.parseLabeledOrExpressionStatement();
        }
    }

    /**
     * 解析一个修饰器列表。
     */
    private parseDecorators() {
        let result: nodes.NodeList<nodes.Decorator>;
        while (this.lexer.peek().type === '') {
        	if (!result) result = list(this.parseDecorator());
        	result.push(this.parseDecorator());
        }
        return result;
    }

    /**
     * 解析一个修饰器(`x`)。
     */
    private parseDecorator() {
        const result = new nodes.Decorator;
        result.atToken = this.readToken(tokens.TokenType.at);
        result.body = this.parseExpression(tokens.Precedence.leftHandSide);
        return result;
    }

    /**
     * 解析一个修饰符列表。
     */
    private parseModifiers() {
        let result: nodes.NodeList<nodes.Modifier>;
        while (tokens.isModifier(this.lexer.peek().type)) {
        	const savedToken = this.lexer.current;
        	const modifier = this.parseModifier();
        	switch (modifier.type) {
        		case tokens.TokenType.export:
        			if (!result) result = list(this.parseModifier());
        			result.push(modifier);
        			if (this.lexer.peek().type === tokens.TokenType.default) {
        				result.push(this.parseModifier());
        			}
        			continue;
        		case tokens.TokenType.const:
        			if (this.lexer.peek().type === tokens.TokenType.enum) {
        				if (!result) result = list(this.parseModifier());
        				result.push(modifier);
        				continue;
        			}
        			break;
        		default:
        			if (!this.lexer.peek().hasLineBreakBeforeStart) {
        				if (!result) result = list(this.parseModifier());
        				result.push(modifier);
        				continue;
        			}
        			break;
        	}
        	this.lexer.current = savedToken;
        	break;
        }
        return result;
    }

    /**
     * 解析一个修饰符(`static`、`private`、...)。
     */
    private parseModifier() {
        const result = new nodes.Modifier;
        result.type = this.lexer.read(); // export、default、declare、const、static、abstract、readonly、async、public、protected、private
        return result;
    }

    /**
     * 解析一个函数声明(`function fn() {...}`、`function *fn() {...}`)。
     * @param decorators undefined。
     * @param modifiers undefined。
     */
    private parseFunctionDeclaration(decorators?: nodes.Decorators, modifiers?: nodes.Modifiers) {
        const result = new nodes.FunctionDeclaration;
        if (decorators != undefined) {
        	result.decorators = decorators;
        }
        if (modifiers != undefined) {
        	result.modifiers = modifiers;
        }
        this.parseFunctionDeclarationOrExpression(result, modifiers);
        return result;
    }

    /**
     * 解析一个函数表达式(`function () {}`)。
     * @param modifiers undefined。
     */
    private parseFunctionExpression(modifiers?: nodes.Modifiers) {
        const result = new nodes.FunctionExpression;
        if (modifiers != undefined) {
        	result.modifiers = modifiers;
        }
        this.parseFunctionDeclarationOrExpression(result, modifiers);
        return result;
    }

    /**
     * 解析一个函数声明或表达式。
     * @param _  解析的目标节点 。
     * @param modifiers undefined。
     */
    private parseFunctionDeclarationOrExpression(result: nodes.FunctionDeclaration | nodes.FunctionExpression, modifiers?: nodes.Modifiers) {
        result.result = result;
        if (modifiers != undefined) {
        	result.modifiers = modifiers;
        }
        this.parseDocComment(result);
        result.functionToken = this.readToken(tokens.TokenType.function);
        if (this.lexer.peek().type === tokens.TokenType.asterisk) {
        	result.asteriskToken = this.readToken(tokens.TokenType.asterisk);;
        }
        if (tokens.isIdentifierName, tokens.isTypeNodeStart(this.lexer.peek().type)) {
        	result.name = this.parseIdentifier();
        }
        this.parseTypeAnnotation(result);
        this.parseCallSignature(result);
        this.parseFunctionBody(result);
    }

    /**
     * 解析一个函数签名(`(): number`)。
     * @param _  解析的目标节点 。
     */
    private parseCallSignature(result: nodes.BreakStatement | nodes.ContinueStatement) {
        if (this.lexer.peek().type === tokens.TokenType.lessThan) {
        	result.typeParameters = this.parseTypeParameters();
        }
        result.parameters = this.parseParameters();
        this.parseTypeAnnotation(result);
    }

    /**
     * 解析一个函数主体(`{...}`、`=> xx`、``)。
     * @param _  解析的目标节点 。
     */
    private parseFunctionBody(result: nodes.BreakStatement | nodes.ContinueStatement) {
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.openBrace:
        		result.body = this.parseBlockStatement();
        		break;
        	case tokens.TokenType.equalsGreaterThan:
        		result.equalsGreaterThanToken = this.readToken(tokens.TokenType.equalsGreaterThan);
        		result.body = this.parseExpression(tokens.Precedence.assignment);
        		break;
        	default:
        		this.parseSemicolon(result);
        		break;
        }
    }

    /**
     * 解析一个类声明(`class xx {}`)。
     * @param decorators undefined。
     * @param modifiers undefined。
     */
    private parseClassDeclaration(decorators?: nodes.Decorators, modifiers?: nodes.Modifiers) {
        const result = new nodes.ClassDeclaration;
        if (decorators != undefined) {
        	result.decorators = decorators;
        }
        if (modifiers != undefined) {
        	result.modifiers = modifiers;
        }
        this.parseClassDeclarationOrExpression(result);
        return result;
    }

    /**
     * 解析一个类表达式(`class xx {}`)。
     */
    private parseClassExpression() {
        const result = new nodes.ClassExpression;
        this.parseClassDeclarationOrExpression(result);
        return result;
    }

    /**
     * 解析一个类声明或类表达式。
     * @param _  解析的目标节点 。
     */
    private parseClassDeclarationOrExpression(result: nodes.ClassDeclaration | nodes.ClassExpression) {
        result.result = result;
        this.parseDocComment(result);
        result.classToken = this.readToken(tokens.TokenType.class);
        if (tokens.isIdentifierName, tokens.isTypeNodeStart(this.lexer.peek().type) && this.lexer.peek().type !== tokens.TokenType.extends && this.lexer.peek().type !== tokens.TokenType.implements) {
        	result.name = this.parseIdentifier();
        }
        if (this.lexer.peek().type === tokens.TokenType.lessThan) {
        	result.typeParameters = this.parseTypeParameters();
        }
        this.parseExtendsClause(result);
        this.parseImplementsClause(result);
        this.parseClassBody(result);
    }

    /**
     * 解析一个类主体(`{...}`、``)。
     * @param _  解析的目标节点 。
     */
    private parseClassBody(result: nodes.BreakStatement | nodes.ContinueStatement) {
        if (this.lexer.peek().type === tokens.TokenType.openBrace) {
        	result.members = this.parseNodeList(this.parseClassElement(), tokens.TokenType.openBrace, tokens.TokenType.closeBrace)
        } else {
        	this.parseSemicolon(result);
        }
    }

    /**
     * 解析一个类成员。
     */
    private parseClassElement() {
        const decorators = this.parseDecorators();
        const modifiers = this.parseModifiers();
        switch (this.lexer.peek().type) {
        	case 'identifier':
        		break;
        	case tokens.TokenType.get:
        	case tokens.TokenType.set:
        		const savedToken = this.lexer.current;
        		this.lexer.read();
        		if (tokens.isPropertyNameStart(this.lexer.peek().type)) {
        			return this.parseAccessorDeclaration(decorators, modifiers, savedToken.type === tokens.TokenType.get ? savedToken.start : undefined, savedToken.type === tokens.TokenType.set ? savedToken.start : undefined);
        		}
        		this.lexer.current = savedToken;
        		break;
        	case tokens.TokenType.asterisk:
        		return this.parseMethodDeclaration(decorators, modifiers, read, this.parsePropertyName());
        }
        const name = this.parsePropertyName();
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.openParen:
        	case tokens.TokenType.lessThan:
        		return this.parseMethodDeclaration(decorators, modifiers, undefined, name);
        	default:
        		return this.parsePropertyDeclaration(decorators, modifiers, name);
        }
    }

    /**
     * 解析一个访问器声明(`get x() {...}`、`set x(value) {...}`)。
     * @param decorators undefined。
     * @param modifiers undefined。
     * @param getToken 标记 'get' 的位置。
     * @param setToken 标记 'set' 的位置。
     */
    private parseAccessorDeclaration(decorators?: nodes.Decorators, modifiers?: nodes.Modifiers, getToken?: number, setToken?: number) {
        const result = new nodes.AccessorDeclaration;
        if (decorators != undefined) {
        	result.decorators = decorators;
        }
        if (modifiers != undefined) {
        	result.modifiers = modifiers;
        }
        if (getToken != undefined) {
        	result.getToken = getToken;
        }
        if (setToken != undefined) {
        	result.setToken = setToken;
        }
        this.parseDocComment(result);
        result.name = this.parsePropertyName();
        this.parseParameters()
        this.parseTypeAnnotation(result);
        this.parseFunctionBody(result);
        return result;
    }

    /**
     * 解析一个方法声明(`x() {...}`)。
     * @param decorators undefined。
     * @param modifiers undefined。
     * @param asteriskToken 标记 '*' 的位置。
     * @param name  名字部分 。
     */
    private parseMethodDeclaration(decorators?: nodes.Decorators, modifiers?: nodes.Modifiers, asteriskToken?: number, name: nodes.PropertyName) {
        const result = new nodes.MethodDeclaration;
        if (decorators != undefined) {
        	result.decorators = decorators;
        }
        if (modifiers != undefined) {
        	result.modifiers = modifiers;
        }
        if (asteriskToken != undefined) {
        	result.asteriskToken = asteriskToken;
        }
        result.name = name;
        this.parseDocComment(result);
        this.parseCallSignature(result);
        this.parseFunctionBody(result);
        return result;
    }

    /**
     * 解析一个属性声明(`x: number`)。
     * @param decorators undefined。
     * @param modifiers undefined。
     * @param name  名字部分 。
     */
    private parsePropertyDeclaration(decorators?: nodes.Decorators, modifiers?: nodes.Modifiers, name: nodes.PropertyName) {
        const result = new nodes.PropertyDeclaration;
        if (decorators != undefined) {
        	result.decorators = decorators;
        }
        if (modifiers != undefined) {
        	result.modifiers = modifiers;
        }
        result.name = name;
        this.parseDocComment(result);
        this.parseTypeAnnotation(result);
        this.parseInitializer(result);
        return result;
    }

    /**
     * 解析一个接口声明(`interface T {...}`)。
     * @param decorators undefined。
     * @param modifiers undefined。
     */
    private parseInterfaceDeclaration(decorators?: nodes.Decorators, modifiers?: nodes.Modifiers) {
        const result = new nodes.InterfaceDeclaration;
        if (decorators != undefined) {
        	result.decorators = decorators;
        }
        if (modifiers != undefined) {
        	result.modifiers = modifiers;
        }
        this.parseDocComment(result);
        result.interfaceToken = this.readToken(tokens.TokenType.interface);
        result.name = this.parseIdentifier(false);
        if (this.lexer.peek().type === tokens.TokenType.lessThan) {
        	result.typeParameters = this.parseTypeParameters();
        }
        this.parseExtendsClause(result);
        result.members = this.parseNodeList(this.parseTypeMemberSignature(), tokens.TokenType.openBrace, tokens.TokenType.closeBrace)
        return result;
    }

    /**
     * 解析一个枚举声明(`enum T {}`)。
     * @param decorators undefined。
     * @param modifiers undefined。
     */
    private parseEnumDeclaration(decorators?: nodes.Decorators, modifiers?: nodes.Modifiers) {
        const result = new nodes.EnumDeclaration;
        if (decorators != undefined) {
        	result.decorators = decorators;
        }
        if (modifiers != undefined) {
        	result.modifiers = modifiers;
        }
        this.parseDocComment(result);
        result.enumToken = this.readToken(tokens.TokenType.enum);
        result.name = this.parseIdentifier(false);
        this.parseExtendsClause(result);
        result.members = this.parseDelimitedList(this.parseEnumMemberDeclaration(), tokens.TokenType.openBrace, tokens.TokenType.closeBrace, true, tokens.isPropertyNameStart);
        return result;
    }

    /**
     * 解析一个枚举成员声明(`x`、`x = 1`)。
     */
    private parseEnumMemberDeclaration() {
        const result = new nodes.EnumMemberDeclaration;
        result.name = this.parsePropertyName();
        this.parseInitializer(result);
        return result;
    }

    /**
     * 解析一个命名空间声明(`namespace T {}`)。
     * @param decorators undefined。
     * @param modifiers undefined。
     */
    private parseNamespaceDeclaration(decorators?: nodes.Decorators, modifiers?: nodes.Modifiers) {
        const result = new nodes.NamespaceDeclaration;
        if (decorators != undefined) {
        	result.decorators = decorators;
        }
        if (modifiers != undefined) {
        	result.modifiers = modifiers;
        }
        result.namespaceToken = this.readToken(tokens.TokenType.namespace);
        this.parseNamespaceOrModuleDeclaration(result, decorators, modifiers);
        return result;
    }

    /**
     * 解析一个模块声明(`module T {}`)。
     * @param decorators undefined。
     * @param modifiers undefined。
     */
    private parseModuleDeclaration(decorators?: nodes.Decorators, modifiers?: nodes.Modifiers) {
        const result = new nodes.ModuleDeclaration;
        if (decorators != undefined) {
        	result.decorators = decorators;
        }
        if (modifiers != undefined) {
        	result.modifiers = modifiers;
        }
        result.moduleToken = this.readToken(tokens.TokenType.module);
        this.parseNamespaceOrModuleDeclaration(result, decorators, modifiers);
        return result;
    }

    /**
     * 解析一个命名空间或模块声明。
     * @param _  解析的目标节点 。
     * @param decorators undefined。
     * @param modifiers undefined。
     */
    private parseNamespaceOrModuleDeclaration(result: nodes.NamespaceDeclaration | nodes.ModuleDeclaration, decorators?: nodes.Decorators, modifiers?: nodes.Modifiers) {
        result.result = result;
        if (decorators != undefined) {
        	result.decorators = decorators;
        }
        if (modifiers != undefined) {
        	result.modifiers = modifiers;
        }
        this.parseDocComment(result);
        if (this.lexer.current.type === tokens.TokenType.module && this.lexer.peek().type === 'stringLiteral') {
        	(<nodes.ModuleDeclaration>result).name = this.parseStringLiteral();
        } else {
        	result.name = this.parseIdentifier();
        	while (this.lexer.peek().type === tokens.TokenType.dot) {
        		result.name = this.parseMemberCallExpression(result.name);
        	}
        }
        this.parseBlockBody(result);
    }

    /**
     * 解析一个扩展声明(`extends T {}`)。
     * @param decorators undefined。
     * @param modifiers undefined。
     */
    private parseExtensionDeclaration(decorators?: nodes.Decorators, modifiers?: nodes.Modifiers) {
        const result = new nodes.ExtensionDeclaration;
        if (decorators != undefined) {
        	result.decorators = decorators;
        }
        if (modifiers != undefined) {
        	result.modifiers = modifiers;
        }
        this.parseDocComment(result);
        result.extendsToken = this.readToken(tokens.TokenType.extends);
        result.type = this.parseTypeNode();
        this.parseExtendsClause(result);
        this.parseImplementsClause(result);
        this.parseClassBody(result);
        return result;
    }

    /**
     * 解析一个 extends 分句(`extends xx`)。
     * @param _  解析的目标节点 。
     */
    private parseExtendsClause(result: nodes.BreakStatement | nodes.ContinueStatement) {
        if (this.lexer.peek().type === tokens.TokenType.extends) {
        	result.extendsToken = this.readToken(tokens.TokenType.extends);
        	result.extends = this.parseDelimitedList(this.parseClassHeritageNode(), , , false, tokens.isExpressionStart);
        }
    }

    /**
     * 解析一个 implements 分句(`implements xx`)。
     * @param result undefined。
     */
    private parseImplementsClause(result) {
        const result = new nodes.ImplementsClause;
        if (this.lexer.peek().type === tokens.TokenType.implements) {
        	result.implementsToken = this.readToken(tokens.TokenType.implements);
        	result.implements = this.parseDelimitedList(this.parseClassHeritageNode(), , , false, tokens.isExpressionStart);
        }
        return result;
    }

    /**
     * 解析一个 extends 或 implements 分句项。
     */
    private parseClassHeritageNode() {
        const result = new nodes.ClassHeritageNode;
        result.value = this.parseExpression(tokens.Precedence.leftHandSide);
        return result;
    }

    /**
     * 解析一个语句块主体(`{...}`)。
     * @param _  解析的目标节点 。
     */
    private parseBlockBody(result: nodes.BreakStatement | nodes.ContinueStatement) {
        result.statements = this.parseNodeList(this.parseStatement(), tokens.TokenType.openBrace, tokens.TokenType.closeBrace)
    }

    /**
     * 解析一个类型别名声明(`type A = number`)。
     */
    private parseTypeAliasDeclaration() {
        const result = new nodes.TypeAliasDeclaration;
        result.typeToken = this.readToken(tokens.TokenType.type);
        result.name = this.parseIdentifier();
        if (this.lexer.peek().type === tokens.TokenType.lessThan) {
        	result.typeParameters = this.parseTypeParameters();
        }
        result.equalsToken = this.readToken(tokens.TokenType.equals);
        result.value = this.parseTypeNode();
        this.parseSemicolon(tokens.TokenType.semicolon);
        return result;
    }

    /**
     * 解析一个 import 赋值或 import 声明。
     */
    private parseImportAssignmentOrImportDeclaration() {
        const importToken = read;
        const imports = list(this.parseImportClause(), false, undefined, undefined, tokens.TokenType.comma, tokens.isBindingNameStart);
        if (this.lexer.peek().type === tokens.TokenType.equals && imports.length === 1 && imports[0].constructor === this.parseSimpleImportOrExportClause() && (<nodes.SimpleImportOrExportClause>imports[0]).name == null) {
        	return this.parseImportAssignmentDeclaration(importToken, (<nodes.SimpleImportOrExportClause>imports[0]).variable);
        }
        return this.parseImportDeclaration(importToken, imports);
    }

    /**
     * 解析一个 import 赋值声明。
     * @param importToken 标记 'import' 的位置。
     * @param variable 别名。
     */
    private parseImportAssignmentDeclaration(importToken: number, variable: nodes.Identifier) {
        const result = new nodes.ImportAssignmentDeclaration;
        result.importToken = importToken;
        result.variable = variable;
        result.equalsToken = this.readToken(tokens.TokenType.equals);
        result.value = this.parseExpression(tokens.Precedence.assignment);
        this.parseSemicolon(result);
        return result;
    }

    /**
     * 解析一个。
     * @param importToken 标记 'import' 的位置。
     * @param variables 别名。
     */
    private parseImportDeclaration(importToken: number, variables: nodes.NodeList<nodes.Identifier>) {
        const result = new nodes.ImportDeclaration;
        result.importToken = importToken;
        result.variables = variables;
        ; // import 声明(`import x from tokens.TokenType.dotDotDot`)
        if (variables) {
        	result.fromToken = this.readToken(tokens.TokenType.from);
        }
        result.from = this.parseStringLiteral();
        this.parseSemicolon(result);
        return result;
    }

    /**
     * 解析一个 import 分句(`x`、`{x}`、...)。
     */
    private parseImportClause() {
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.asterisk:
        		return this.parseNamespaceImportClause();
        	case tokens.TokenType.openBrace:
        		return this.parseNamedImportClause();
        	default:
        		return this.parseSimpleImportOrExportClause(true);
        }
    }

    /**
     * 解析一个命名空间导入分句(`* as x`)。
     */
    private parseNamespaceImportClause() {
        const result = new nodes.NamespaceImportClause;
        result.asteriskToken = this.readToken(tokens.TokenType.asterisk);
        result.asToken = this.readToken(tokens.TokenType.as);
        result.variable = this.parseIdentifier();
        return result;
    }

    /**
     * 解析一个对象导入分句(`{x, x as y}`)。
     */
    private parseNamedImportClause() {
        const result = new nodes.NamedImportClause;
        result.elements = this.parseNodeList((, , )
        return result;
    }

    /**
     * 解析一个简单导入或导出分句(`x`、`x as y`)。
     * @param importClause undefined。
     */
    private parseSimpleImportOrExportClause(importClause: boolean/* 解析 import 分句*/) {
        const result = new nodes.SimpleImportOrExportClause;
        const nameOrVariable = this.parseIdentifier(true);
        if (this.lexer.peek().type === tokens.TokenType.as) {
        	result.asToken = this.readToken(tokens.TokenType.as);
        	result.variable = this.parseIdentifier(!importClause);
        } else {
        	if (importClause && !tokens.isIdentifierName, tokens.isTypeNodeStart(this.lexer.current.type)) {
        		this.error(this.lexer.current, "this.parseIdentifier() expected; this.parseKeyword() '{0}' cannot be used as an identifier.", tokens.getTokenName(this.lexer.current.type));
        	}
        }
        return result;
    }

    /**
     * 解析一个 export 赋值或 export 声明。
     */
    private parseExportAssignmentOrExportDeclaration() {
        const savedState = this.lexer.current;
        const exportToekn = read;
        switch (this.lexer.peek().type) {
        	case tokens.TokenType.function:
        		this.lexer.current = savedState;
        		return this.parseFunctionDeclaration(undefined, this.parseModifiers());
        	case tokens.TokenType.class:
        		this.lexer.current = savedState;
        		return this.parseClassDeclaration(undefined, this.parseModifiers());
        	case tokens.TokenType.interface:
        		this.lexer.current = savedState;
        		return this.parseInterfaceDeclaration(undefined, this.parseModifiers());
        	case tokens.TokenType.enum:
        		this.lexer.current = savedState;
        		return this.parseEnumDeclaration(undefined, this.parseModifiers());
        	case tokens.TokenType.namespace:
        		this.lexer.current = savedState;
        		return this.parseNamespaceDeclaration(undefined, this.parseModifiers());
        	case tokens.TokenType.module:
        		this.lexer.current = savedState;
        		return this.parseModuleDeclaration(undefined, this.parseModifiers());
        	case tokens.TokenType.var:
        	case tokens.TokenType.let:
        	case tokens.TokenType.const:
        		this.lexer.current = savedState;
        		return this.parseVariableStatement(this.parseModifiers());
        	case tokens.TokenType.asterisk:
        		return this.parseExportNamespaceDeclaration(exportToken);
        	case tokens.TokenType.openBrace:
        		return this.parseExportListDeclaration(exportToken);
        	case tokens.TokenType.equals:
        		return this.parseExportAssignmentDeclaration(exportToken);
        	default:
        		return this.parseExportDefaultDeclaration(this.parseModifiers());
        }
    }

    /**
     * 解析一个导出列表声明(`export * from ...`)。
     * @param exportToken 标记 'export' 的位置。
     */
    private parseExportNamespaceDeclaration(exportToken: number) {
        const result = new nodes.ExportNamespaceDeclaration;
        result.exportToken = exportToken;
        result.asteriskToken = this.readToken(tokens.TokenType.asterisk);
        result.fromToken = this.readToken(tokens.TokenType.from);
        result.from = this.parseStringLiteral();
        this.parseSemicolon(result);
        return result;
    }

    /**
     * 解析一个导出列表声明(`export a from ...`)。
     * @param exportToken 标记 'export' 的位置。
     */
    private parseExportListDeclaration(exportToken: number) {
        const result = new nodes.ExportListDeclaration;
        result.exportToken = exportToken;
        result.variables = this.parseDelimitedList(this.parseSimpleImportOrExportClause(), tokens.TokenType.openBrace, tokens.TokenType.closeBrace, true, tokens.isKeyword);
        result.fromToken = this.readToken(tokens.TokenType.from);
        result.from = this.parseStringLiteral();
        this.parseSemicolon(result);
        return result;
    }

    /**
     * 解析一个导出赋值声明(`export = 1`)。
     * @param exportToken 标记 'export' 的位置。
     */
    private parseExportAssignmentDeclaration(exportToken: number) {
        const result = new nodes.ExportAssignmentDeclaration;
        result.exportToken = exportToken;
        result.equalsToken = this.readToken(tokens.TokenType.equals);
        result.value = this.parseExpression(tokens.Precedence.assignment);
        this.parseSemicolon(result);
        return result;
    }

    /**
     * 解析一个 export default 声明(`export default x = 1`)。
     * @param modifiers undefined。
     */
    private parseExportDefaultDeclaration(modifiers: nodes.Modifiers) {
        const result = new nodes.ExportDefaultDeclaration;
        result.modifiers = modifiers;
        result.expression = this.parseExpression(tokens.Precedence.assignment);
        this.parseSemicolon(result);
        return result;
    }
    // #endregion

    // #region 文档注释

    /**
     * 解析一个文档注释。
     * @param _  解析的目标节点 。
     */
    private parseDocComment(result: nodes.BreakStatement | nodes.ContinueStatement) {
    }

    // #endregion

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

}

/**
 * 表示语法解析的相关配置。
 */
export interface ParserOptions extends LexerOptions {

    /**
     * 允许省略语句末尾的分号。
     */
    allowMissingSemicolon?: boolean,

    /**
     * 使用智能分号插入策略。使用该策略可以减少省略分号引发的语法错误。
     */
    useStandardSemicolonInsertion?: boolean,

    /**
     * 允许省略条件表达式的括号。
     */
    allowMissingParenthese?: boolean,

    /**
     * 允许省略 switch (true) 中的 (true)。
     */
    allowMissingSwitchCondition?: boolean,

    /**
     * 允许使用 case else 语法代替 default。
     */
    allowCaseElse?: boolean,

    /**
     * 使用 for..in 兼容变量定义。
     */
    useCompatibleForInAndForOf?: boolean,

    /**
     * 允许使用 for..of 语法。
     */
    allowForOf?: boolean,

    /**
     * 允许使用 for..of 逗号语法。
     */
    allowForOfCommaExpression?: boolean,

    /**
     * 允许使用 for..to 语法。
     */
    allowForTo?: boolean,

    /**
     * 允许使用 throw 空参数语法。
     */
    allowRethrow?: boolean,

    /**
     * 允许使用 with 语句定义语法。
     */
    allowWithVaribale?: boolean,

    /**
     * 允许省略 try 语句块的 {}。
     */
    allowMissingTryBlock?: boolean,

    /**
     * 允许省略 catch 分句的变量名。
     */
    allowMissingCatchVaribale?: boolean,

    /**
     * 允许不含 catch 和 finally 分句的 try 语句。
     */
    allowSimpleTryBlock?: boolean,

}

/**
 * 表示修饰符的使用场景。
 */
const enum ModifierUsage {

    /**
     * 参数。
     */
    parameter,

    /**
     * 属性。
     */
    property,

    /**
     * 定义。
     */
    declaration,

}
