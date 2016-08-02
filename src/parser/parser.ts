/**
 * @fileOverview 语法解析器
 * @author xuld@vip.qq.com
 */

import {CharCode} from './unicode';
import * as tokens from './tokens';
import {TextRange} from './location';
import * as nodes from './nodes';
import * as utility from './utility';
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
        return this.parseDelimitedList(this.parseTupleTypeElement, tokens.TokenType.openBracket, tokens.TokenType.closeBracket, true, tokens.isTypeNodeStart);
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
        result.elements = this.parseNodeList(this.parseTypeMemberSignature, tokens.TokenType.openBrace, tokens.TokenType.closeBrace)
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
        return this.parseDelimitedList(this.parseTypeParameterDeclaration, tokens.TokenType.lessThan, tokens.TokenType.greaterThan, false, tokens.isIdentifierName);
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
        return this.parseDelimitedList(this.parseTypeArgument, tokens.TokenType.lessThan, tokens.TokenType.greaterThan, false, tokens.isTypeNodeStart);
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
        return this.parseDelimitedList(this.parseParameterDeclaration, tokens.TokenType.openParen, tokens.TokenType.closeParen, true, tokens.isParameterStart);
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
        result.elements = this.parseDelimitedList(this.parseArrayBindingElement, tokens.TokenType.openBracket, tokens.TokenType.closeBracket, true, tokens.isArrayBindingElementStart);
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
        result.elements = this.parseDelimitedList(this.parseObjectBindingElement, tokens.TokenType.openBrace, tokens.TokenType.closeBrace, true, tokens.isPropertyNameStart);
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
    }    // #endregion

    // #region 文档注释

    /**
     * 解析一个文档注释。
     * @param _  解析的目标节点 。
     */
    private parseDocComment(result: nodes.BreakStatement | nodes.ContinueStatement) {
    }    // #endregion

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
