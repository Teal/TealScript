/**
 * @fileOverview 语法解析器
 */

import {TokenType, tokenToString, isNonReservedWord, isUnaryOperator} from '../ast/tokenType';
import * as nodes from '../ast/nodes';
import {Lexer} from './lexer';
import * as Compiler from '../compiler/compiler';

/**
 * 表示一个语法解析器。
 */
export class Parser {

    // #region 核心

    /**
     * 获取或设置当前语法解析器使用的词法解析器。
     */
    lexer = new Lexer();

    /**
     * 解析指定的源文件。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param end 解析的源码结束位置。
     * @param fileName 解析的源码位置。
     */
    parse(source: string, start?: number, end?: number, fileName?: string) {
        this.lexer.setSource(source, start, end);
        return this.parseSourceFile();
    }

    /**
     * 从指定的输入解析一个表达式。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param end 解析的源码结束位置。
     * @param fileName 解析的源码位置。
     */
    parseAsExpression(source: string, start?: number, end?: number, fileName?: string) {
        this.lexer.setSource(source, start, end);
        return this.parseExpression();
    }

    /**
     * 从指定的输入解析一个语句。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param end 解析的源码结束位置。
     * @param fileName 解析的源码位置
     */
    parseAsStatement(source: string, start?: number, end?: number, fileName?: string) {
        this.lexer.setSource(source, start, end);
        return this.parseStatement();
    }

    // #endregion

    // #region 解析底层

    /**
     * 报告一个语法错误。
     * @param message 错误的信息。
     * @param args 格式化错误的参数。
     */
    reportSyntaxError(message: string, ...args: any[]) {

    }

    /**
     * 存储解析的内部标记。
     */
    private flags: ParseFlags = 0;

    /**
     * 如果下一个标记类型是指定的类型，则读取并移动到下一个标记。
     * @param token 期待的标记类型。
     * @returns 如果当前标记类型符合指定的操作符且移动位置则返回 true，否则返回 false。
     */
    private readToken(token: TokenType) {
        if (this.lexer.tokenType === token) {
            this.lexer.read();
            return true;
        }
        return false;
    }

    /**
     * 读取并移动到下一个标记。如果读取到的标记类型不是指定的类型，则输出一个错误。
     * @param token 期待的标记。
     * @returns 如果已解析到正确的标签则返回标签的位置，否则返回 undefined。
     */
    private expectToken(token: TokenType) {
        if (this.lexer.peek().type === token) {
            return this.lexer.read().start;
        }

        this.reportSyntaxError("应输入“{0}”；实际是“{1}”", tokenToString(token), tokenToString(this.lexer.tokenType));
    }

    //    /**
    //     * 读取一个标识符。
    //     */
    //    * <returns></returns>
    //    private Identifier expectIdentifier() {
    //    if (lexer.peek().type == TokenType.identifier) {
    //        return parseIdentifier();
    //    }

    //    if (lexer.peek().type.isKeyword()) {
    //        Compiler.error(ErrorCode.expectedIdentifier, String.Format("语法错误：应输入标识符；“{0}”是关键字，请改为“${0}”", lexer.peek().type.getName()), lexer.peek());
    //        return parseIdentifier();
    //    }
    //    Compiler.error(ErrorCode.expectedIdentifier, "语法错误：应输入标识符", lexer.peek());

    //    return new Identifier() {
    //        value = String.Empty
    //    };
    //}

    //    /**
    //     * 读取一个分号。
    //     */
    //    private void expectSemicolon() {
    //    if (readToken(TokenType.semicolon)) {
    //        return;
    //    }

    //    if (Compiler.options.disallowMissingSemicolons) {
    //        Compiler.error(ErrorCode.strictExpectedSemicolon, "严格模式：应输入“;”", lexer.current.endLocation, lexer.current.endLocation);
    //        return;
    //    }

    //    if (!lexer.peek().hasLineTerminatorBeforeStart && lexer.peek().type != TokenType.rBrace && lexer.peek().type != TokenType.eof) {
    //        Compiler.error(ErrorCode.expectedSemicolon, "语法错误：应输入“;”或换行", lexer.current.endLocation, lexer.current.endLocation);
    //    }
    //}

    //    private bool expectLBrace() {
    //    if (lexer.peek().type == TokenType.lBrace) {
    //        lexer.read();
    //        return true;
    //    }
    //    Compiler.error(ErrorCode.expectedLBrace, "语法错误：应输入“{”", lexer.peek());
    //    return false;
    //}

    //        private static bool checkIdentifier(Token token, string value) {
    //    if (token.type != TokenType.identifier || token.buffer.Length != value.Length) {
    //        return false;
    //    }
    //    for (int i = 0; i < value.Length; i++) {
    //        if (token.buffer[i] != value[i]) {
    //            return false;
    //        }
    //    }
    //    return true;
    //}

    //        /**
    //         * 将现有的表达式转为标识符。
    //         */
    //         * <param name="value" > </param>
    //    * <returns></returns>
    //        private static Identifier toIdentifier(Expression value) {
    //    var result = value as Identifier;
    //    if (result != null) {
    //        return result;
    //    }

    //    // expression 为 null， 表示 expression 不是表达式，已经在解析表达式时报告错误了。
    //    if (value != Expression.empty) {
    //        if (value is PredefinedTypeLiteral) {
    //            Compiler.error(ErrorCode.expectedIdentifier, String.Format("语法错误：应输入标识符；“{0}”是关键字，请改用“${0}”", ((PredefinedTypeLiteral)value).type.getName()), value);
    //        } else {
    //            Compiler.error(ErrorCode.expectedIdentifier, "语法错误：应输入标识符", value);
    //        }
    //    }

    //    return new Identifier() {
    //        value = value.ToString()
    //    };
    //}

    //    /**
    //     * 忽略当前成员相关的所有标记。
    //     */
    //    private void skipToMemberDefinition() {
    //    // #todo 改进我
    //    do {
    //        lexer.read();

    //        if (lexer.peek().type.isUsedInGlobal()) {
    //            if (lexer.peek().type.isPredefinedType() && lexer.current.type != TokenType.rBrace) {
    //                continue;
    //            }
    //            break;
    //        }

    //    } while (lexer.peek().type != TokenType.eof);
    //}

    //        /**
    //         * 忽略当前行的所有标记。
    //         */
    //        private void skipToNextLine() {
    //    do {
    //        lexer.read();
    //    } while (lexer.peek().type != TokenType.eof && !lexer.peek().hasLineTerminatorBeforeStart);
    //}

    /**
     * 解析一个逗号隔开的节点列表(<..., ...>。
     * @param nodes 要解析的节点列表。
     */
    parseNodeList<T extends Node>(start: TokenType, parseElement: () => T, end: TokenType) {
        const result = new nodes.NodeList<T>();

        return result;
    }

    // #endregion

    // #region 节点

    // #endregion

    // #region 语句

    /**
     * 解析一个语句。
     */
    private parseStatement() {

        // Statement :
        //   VariableStatement
        //   Block
        //   EmptyStatement
        //   LabeledStatement
        //   ExpressionStatement
        //   SelectionStatement
        //   IterationStatement
        //   JumpStatement
        //   TryStatement
        //   WithStatement

        // EmptyStatement :
        //   ;

        // SelectionStatement :
        //   IfStatement
        //   SwitchStatement

        // IterationStatement :
        //   ForStatement
        //   ForInStatement
        //   ForOfStatement
        //   WhileStatement
        //   DoWhileStatement

        // JumpStatement :
        //   ContinueStatement
        //   BreakStatement
        //   ReturnStatement
        //   ThrowStatement 

        switch (this.lexer.peek().type) {

            case TokenType.identifier:
                const identifier = this.parseIdentifier();
                return this.readToken(TokenType.colon) ?
                    this.parseLabeledStatement(identifier) :
                    this.parseExpressionStatement(identifier);

            //        case TokenType.var:
            //            return parseVariableOrExpressionStatement(parsePredefinedType());

            //        case TokenType.yield:
            //            return parseYieldStatement();

            //        case TokenType.@const:
            //            return parseVariableStatement(VariableType.constLocal);

            //        default:
            //            if (type.isPredefinedType()) {
            //                goto case TokenType.var;
            case TokenType.openBrace:
                return this.parseBlock();
            case TokenType.var:
                return this.parseVariableStatement(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case TokenType.let:
                if (this.followsIdentifierOrStartOfDestructuring()) {
                    return parseVariableStatement(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
                }
                break;
            case TokenType.function:
                return parseFunctionDeclaration(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case TokenType.class:
                return parseClassDeclaration(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);

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
                return null;
            case TokenType.with:
                return this.parseWithStatement();

            case TokenType.AtToken:
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
                if (this.isStartOfDeclaration()) {
                    return this.parseDeclaration();
                }
                break;
        }
        return this.parseExpressionStatement();
    }

    /**
     * 解析一个标签语句(xx: ...)。
     * @param label 已解析的标签部分。
     */
    private parseLabeledStatement(label: nodes.Identifier) {
        // LabeledStatement :
        //   Identifier : Statement
        console.assert(this.lexer.currentToken.type === TokenType.colon);
        const result = new nodes.LabeledStatement();
        result.label = label;
        result.colonStart = this.lexer.read().type;
        result.body = this.parseStatement();
        return result;
    }

    private parseExpressionStatement() {
        //const expression = this.parseExpression();

        //const expressionStatement = <ExpressionStatement>createNode(TokenType.ExpressionStatement, fullStart);
        //expressionStatement.expression = expression;
        //parseSemicolon();
        //return addJSDocComment(finishNode(expressionStatement));

    }

    /**
     * 解析一个空语句(;)。
     */
    private parseEmptyStatement() {
        console.assert(this.lexer.currentToken.type === TokenType.semicolon);
        const result = new nodes.EmptyStatement();
        result.start = this.lexer.read().start;
        return result;
    }

    /**
     * 解析一个语句块({...})。
     */
    private parseBlock(node: nodes.Block) {
        const result = new nodes.Block();
        console.assert(this.lexer.currentToken.type === TokenType.openBrace);
        result.start = this.lexer.read().start;
        result.statements = this.parseNodeList(TokenType.closeBrace);
        console.assert(this.lexer.currentToken.type === TokenType.closeBrace);
        result.end = this.lexer.read().end;
        return result;
    }

    /**
     * 解析一个 if 语句(if(...) {...})。
     */
    private parseIfStatement() {

        // IfStatement :
        //   if Condition EmbeddedStatement
        //   if Condition EmbeddedStatement else EmbeddedStatement

        console.assert(this.lexer.peek().type === TokenType.if);
        const result = new nodes.IfStatement();
        result.start = this.lexer.read().start;
        result.condition = this.parseCondition();
        result.then = this.parseEmbeddedStatement();
        if (this.readToken(TokenType.else)) {
            result.else = this.parseEmbeddedStatement();
        }
        return result;
    }

    /**
     * 解析一个 switch 语句(switch(...){...})。
     */
    private parseSwitchStatement() {

        // SwitchStatement :
        //   switch Condition? { CaseClause... }

        console.assert(this.lexer.peek().type == TokenType.switch);

        const result = new nodes.SwitchStatement();
        result.start = this.lexer.read().start; // switch
        result.condition = this.lexer.peek().type === TokenType.openBrace ? undefined : this.parseCondition();
        result.cases = this.parseNodeList(TokenType.openBrace, this.parseCaseClause, TokenType.closeBrace);
        return result;

    }

    /**
     * 解析一个 switch 语句的 case 分支(case ...:{...})。
     */
    private parseCaseClause() {

        // CaseClause :
        //   case Expression : Statement...
        //   default : Statement...
        //   case Expression, Expression... : Statement...
        //   case else : Statement...

        console.assert(this.lexer.peek().type == TokenType.case || this.lexer.peek().type == TokenType.default);
        const result = new nodes.CaseClause();
        result.start = this.lexer.read().start;
        if (this.lexer.currentToken.type === TokenType.case) {
            result.label = this.parseExpressionWith(ParseContext.allowElse);
        }
        result.colonStart = this.expectToken(TokenType.colon);
        result.statements = this.parseNodeList(null, this.parseStatement, TokenType.closeBrace);
        return result;
    }

    /**
     * 解析一个 for 语句(for(...; ...; ...) {...})。
     */
    private parseForStatement() {

        // ForStatement :
        //   for ( VariableOrExpression? ; Expression? ; Expression? ) EmbeddedStatement
        //   for ( Type Identifier in Expression ) EmbeddedStatement
        //   for ( Type Identifier = Expression to Expression ) EmbeddedStatement

        // VariableOrExpression :
        //   Type VariableList
        //   Expression

        console.assert(lexer.peek().type == TokenType.@for);

        var startLocation = lexer.read().startLocation; // for

        bool hasParentheses = readToken(TokenType.lParam);
        if (!hasParentheses && Compiler.options.disallowMissingParentheses) {
            Compiler.error(ErrorCode.strictExpectedParentheses, "严格模式: 应输入“(”", lexer.current);
        }

        if (followsWithExpression()) {

            var parsed = parseVariableOrExpression();
            Variable parsedVariable = parsed as Variable;
            if (parsedVariable != null) {

                // for in
                if (checkIdentifier(lexer.peek(), "in")) {
                    return parseForInStatement(startLocation, hasParentheses, parsedVariable);
                }

                // for to
                if (checkIdentifier(lexer.peek(), "to")) {
                    return parseForToStatement(startLocation, hasParentheses, parsedVariable);
                }

            }

            return parseForStatement(startLocation, hasParentheses, parsed);
        }

        return parseForStatement(startLocation, hasParentheses, null);

    }

    private parseForStatement(Location startLocation, bool hasParam, Node initializer) {
        var result = new ForStatement();
        result.startLocation = startLocation;
        result.initializer = initializer;
        expectToken(TokenType.semicolon, ErrorCode.expectedSemicolon);
        if (lexer.peek().type != TokenType.semicolon) {
            result.condition = parseExpression();
        }
        expectToken(TokenType.semicolon, ErrorCode.expectedSemicolon);

        if (followsWithExpression()) {
            result.iterator = parseExpression();
            while (readToken(TokenType.comma)) {
                result.iterator = new CommaExpression() {
                    left = result.iterator,
                        right = parseExpression()
                };
            }
        }
        if (hasParam) {
            expectToken(TokenType.rParam, ErrorCode.expectedRParam);
        }
        result.body = parseEmbeddedStatement();
        return result;
    }

    /**
     * 解析一个 for..in 语句(for(var xx in ...) {...})。
     */
    private parseForInStatement(Location startLocation, bool hasParam, Variable variable) {

        if (variable.initialiser != null) {
            Compiler.error(ErrorCode.unexpectedForInInitialiser, "语法错误：“for in”语句中变量不允许有初始值", variable.initialiser);
        }
        if (variable.next != null) {
            Compiler.error(ErrorCode.invalidForInInitialiser, "语法错误：“for in”语句中最多只能有一个变量", variable.next);
        }

        var result = new ForInStatement();
        result.startLocation = startLocation;
        result.variable = variable;
        lexer.read(); // in
        result.iterator = parseExpression();
        if (hasParam) {
            expectToken(TokenType.rParam, ErrorCode.expectedRParam);
        }
        result.body = parseEmbeddedStatement();
        return result;
    }

    /**
     * 解析一个 for..of 语句(for(var xx of ...) {...})。
     */
    private parseForOfStatement(node: nodes.ForOfStatement) {

    }

    /**
     * 解析一个 for..to 语句(for(var xx = ... to ...) {...})。
     */
    private parseForToStatement(Location startLocation, bool hasParam, Variable variable) {
        if (variable.initialiser == null) {
            Compiler.error(ErrorCode.expectedForToInitialiser, "语法错误：“for to”语句中变量缺少初始值", variable.name);
        }
        if (variable.next != null) {
            Compiler.error(ErrorCode.invalidForToInitialiser, "语法错误：“for to”语句中最多只能有一个变量", variable.next);
        }
        var result = new ForToStatement();
        result.startLocation = startLocation;
        result.variable = variable;
        lexer.read(); // to
        result.end = parseExpression();

        if (readToken(TokenType.semicolon) && followsWithExpression()) {
            result.iterator = parseExpression();
        }

        if (hasParam) {
            expectToken(TokenType.rParam, ErrorCode.expectedRParam);
        }
        result.body = parseEmbeddedStatement();
        return result;
    }

    /**
     * 解析一个 while 语句(while(...) {...})。
     */
    private parseWhileStatement() {

        // WhileStatement :
        //   while Condition EmbeddedStatement ;

        console.assert(lexer.peek().type == TokenType.@while);

        return new WhileStatement() {
            startLocation = lexer.read().startLocation, // @while
                condition = parseCondition(),
                body = parseEmbeddedStatement()
        };
    }

    /**
     * 解析一个 do..while 语句(do {...} while(...);)。
     */
    private parseDoWhileStatement() {

        // DoWhileStatement :
        //   do EmbeddedStatement while Condition ;

        console.assert(lexer.peek().type == TokenType.@do);

        var startLocation = lexer.read().startLocation; // do
        var body = parseEmbeddedStatement();
        DoWhileStatement result = new DoWhileStatement();

        expectToken(TokenType.@while, ErrorCode.expectedWhile);

        result.startLocation = startLocation;
        result.body = body;
        result.condition = parseCondition();

        expectSemicolon();
        return result;
    }

    // #endregion

    // #region 表达式

    /**
     * 解析一个表达式。
     * @param minPrecedence 当前解析的最低操作符优先级。
     */
    private parseExpression(minPrecedence?: number) {

        // Expression[in]:
        //      AssignmentExpression[in]
        //      Expression[in] , AssignmentExpression[in]

        //  AssignmentExpression[in,yield]:
        //      ConditionalExpression[?in,?yield]
        //      LeftHandSideExpression = AssignmentExpression[?in,?yield]
        //      LeftHandSideExpression AssignmentOperator AssignmentExpression[?in,?yield]
        //      ArrowFunctionExpression[?in,?yield]
        //      AsyncArrowFunctionExpression[in,yield,await]
        //      [+Yield] YieldExpression[?In]

        // UnaryExpression :
        //   PostfixExpression
        //   ++ UnaryExpression
        //   -- UnaryExpression
        //   + UnaryExpression
        //   - UnaryExpression
        //   ! UnaryExpression
        //   await UnaryExpression
        //   async UnaryExpression
        //   new Type FuncCallArguments? NewInitilizer?
        //   typeof Type
        //   sizeof Type
        //   -> Expression

        const type = this.lexer.peek().type;
        let parsed: nodes.Expression;
        switch (type) {

            // Identifier, Identifier<T>, Identifier[]
            case TokenType.identifier:
                parsed = this.parseTypeExprssion(this.parseIdentifier());
                break;

            // (Expr)
            case TokenType.openParen:
                parsed = this.parseParenthesizedExpression();
                break;

            // new Expr
            case TokenType.new:
                parsed = this.parseNewExpression();
                break;

            // ""
            case TokenType.stringLiteral:
                parsed = this.parseStringLiteral();
                break;

            // 0
            case TokenType.numericLiteral:
                parsed = this.parseNumericLiteral();
                break;

            // [Expr, ...]
            case TokenType.lBrack:
                parsed = parseListOrDictLiteral(TokenType.rBrack, ErrorCode.expectedRBrack);
                break;

            // {key: Expr, ...}
            case TokenType.lBrace:
                parsed = parseListOrDictLiteral(TokenType.rBrace, ErrorCode.expectedRBrack);
                break;

            // @ Identifier
            case TokenType.at:
                parsed = this.parseAtExpression();
                break;

            case TokenType.null:
                parsed = this.parentNullLiteral();
                break;

            case TokenType.true:
                parsed = this.parentTrueLiteral();
                break;

            case TokenType.false:
                parsed = this.parentFalseLiteral();
                break;

            case TokenType.this:
                parsed = this.parentThisLiteral();
                break;

            case TokenType.super:
                parsed = this.parentSuperLiteral();
                break;

            case TokenType.plusPlus:
            case TokenType.minusMinus:
                parsed = this.IncrementExpression();
                break;

            case TokenType.lambda:
                parsed = parseLambdaLiteral(null);
                break;

            default:

                // +Expr
                if (isUnaryOperator(type)) {
                    parsed = this.parseUnaryExpression(null);
                    break;
                }

                #region 错误

                if (type.isUsedInGlobal()) {
                    Compiler.error(ErrorCode.invalidExpression, "不能在函数主体内嵌其它成员定义", lexer.peek());
                    skipToNextLine();
                } else if (type == TokenType.rParam) {
                    Compiler.error(ErrorCode.unexpectedRParam, "语法错误：多余的“)”", lexer.read());
                } else if (type == TokenType.rBrack) {
                    Compiler.error(ErrorCode.unexpectedRBrack, "语法错误：多余的“]”", lexer.read());
                } else if (type == TokenType.rBrace) {
                    Compiler.error(ErrorCode.unexpectedRBrace, "语法错误：多余的“}”", lexer.read());
                } else if (type.isStatementStart()) {
                    Compiler.error(ErrorCode.invalidExpression, String.Format("语法错误：“{0}”只能出现在每行语句的最前面位置", lexer.peek().ToString()), lexer.peek());
                    // 这里不处理当前标记，等接下来继续处理其它语句。
                } else {
                    Compiler.error(ErrorCode.invalidExpression, String.Format("语法错误：无效的表达式项“{0}”", lexer.peek().ToString()), lexer.peek());
                    skipToNextLine();
                }

                return Expression.empty;

                #endregion

        }

        return parseExpression(parsed, minPrecedence);

    }

    /**
     * 在解析一个表达式之后，继续解析剩下的后缀表达式。
     * @pram parsed 已解析的表达式。
     * @param minPrecedence 当前解析的最低操作符优先级。
     */
    private parseRestExpression(parsed: Expression, minPrecedence?: number) {

        // PostfixExpression :
        //   MemberExpression
        //   MemberExpression [no LineTerminator here] ++
        //   MemberExpression [no LineTerminator here] --

        // MemberExpression :
        //   CallExpression
        //   PrimaryExpression
        //   LambdaLiteral
        //   MemberExpression [ Expression ]
        //   MemberExpression . Identifier
        //   MemberExpression .. Identifier

        TokenType type;
        int precedence;

        while ((precedence = (type = lexer.peek().type).getPrecedence()) >= minPrecedence) {

            // Exper = Val
            if (type.isAssignOperator()) {
                lexer.read();
                parsed = new BinaryExpression() {
                    leftOperand = parsed,
                        @operator = type,
                        rightOperand = parseExpression(precedence)
                };
                continue;
            }

            switch (type) {

                // Expr.call
                case TokenType.period: {
                    var current = new MemberCallExpression();
                    current.target = parsed;
                    lexer.read();
                    current.argument = parseGenericTypeExpression(expectIdentifier(), TypeUsage.expression);
                    parsed = current;
                    continue;
                }

                // Expr()
                case TokenType.lParam: {
                    var current = new FuncCallExpression();
                    current.target = parsed;
                    current.arguments = parseArgumentList(TokenType.rParam, ErrorCode.expectedRParam);
                    current.endLocation = lexer.current.endLocation;
                    parsed = current;
                    continue;
                }

                // Expr ->
                case TokenType.lambda:
                    parsed = parseLambdaLiteral(toIdentifier(parsed));
                    continue;

                // Expr[]
                case TokenType.lBrack: {
                    var current = new IndexCallExpression();
                    current.target = parsed;
                    current.arguments = parseArgumentList(TokenType.rBrack, ErrorCode.expectedRBrack);
                    current.endLocation = lexer.current.endLocation;
                    parsed = current;
                    continue;
                }

                // Expr ? A : B
                case TokenType.conditional: {
                    var current = new ConditionalExpression();
                    current.condition = parsed;
                    lexer.read();
                    current.thenExpression = parseExpression();
                    expectToken(TokenType.colon, ErrorCode.expectedColon);
                    current.elseExpression = parseExpression();
                    parsed = current;
                    continue;
                }

                // Expr++, Exper--
                case TokenType.inc:
                case TokenType.dec:
                    // 如果 ++ 和 -- 在新行出现，则不继续解析。
                    if (lexer.peek().hasLineTerminatorBeforeStart) {
                        return parsed;
                    }
                    parsed = new MutatorExpression {
                        operand = parsed,
                            @operator = type,
                            endLocation = lexer.read().endLocation
                    };
                    continue;

                // Expr..A
                case TokenType.periodChain: {
                    var current = new ChainCallExpression();
                    current.target = parsed;
                    lexer.read(); // ..
                    current.argument = expectIdentifier();
                    parsed = new ChainExpression() {
                        chainCallExpression = current,
                              //  body = parseExpression(current, precedence + 1)
                            };
                    continue;
                }

                case TokenType.@is:
                    lexer.read();
                    parsed = new IsExpression() {
                        leftOperand = parsed,
                            rightOperand = parseExpression(precedence + 1)
                    };
                    continue;

                case TokenType.@as:
                    lexer.read();
                    parsed = new AsExpression() {
                        leftOperand = parsed,
                            rightOperand = parseExpression(precedence + 1)
                    };
                    continue;

                case TokenType.rangeTo: {
                    var current = new RangeLiteral();
                    current.start = parsed;
                    lexer.read();
                    current.end = parseExpression(precedence + 1);
                    parsed = current;
                    continue;
                }

                default:

                    // Exper + Val
                    if (type.isBinaryOperator()) {
                        lexer.read();
                        parsed = new BinaryExpression() {
                            leftOperand = parsed,
                                @operator = type,
                                rightOperand = parseExpression(precedence + 1)
                        };
                        continue;
                    }

                    return parsed;
            }
        }

        return parsed;
    }

    private parseExpression() {

        let result = this.parseAssignmentExpressionOrHigher();
        while (this.readToken(TokenType.comma)) {
            result = this.makeBinaryExpression(result, TokenType.comma, this.lexer.tokenStart - 1, this.parseAssignmentExpressionOrHigher());
        }

        return result;
    }

    // #endregion

    // #region 成员

    // #endregion

    #region 解析成员

    /**
     * 所有解析操作的入口函数。
     */
    * <param name="target" > </param>
    private void parseSourceUnitBody(SourceUnit target) {

    // SourceUnit :
    //   ImportDirectiveList? MemberDefinitionList?

    // ImportDirectiveList :
    //   ImportDirective ...

    // 解析导入指令。
    target.importDirectives = parseImportDirectiveList();

    // 解析其它成员。
    parseMemberContainerDefinitionBody(target, false);

}

        private ImportDirective parseImportDirectiveList() {

    // ImportDirective :
    //   import Type ;
    //   import Identifier = Type ;
    //   import Type => Identifier ;

    ImportDirective first = null, last = null;

    while (readToken(TokenType.import)) {

        var current = new ImportDirective();

        current.value = parseType();
        switch (lexer.peek().type) {
            case TokenType.assign:
                lexer.read();
                current.alias = toIdentifier(current.value);
                current.value = parseType();
                break;
            case TokenType.assignTo:
                lexer.read();
                current.alias = expectIdentifier();
                break;
        }

        expectSemicolon();

        if (first == null) {
            last = first = current;
        } else {
            last = last.next = current;
        }
    }

    return first;

}

        private void parseMemberContainerDefinitionBody(MemberContainerDefinition target, bool expectRBrack) {

    // MemberDefinitionList :
    //   MemberDefinition ...

    // MemberDefinition :
    //   FieldDefinition
    //   AliasDefinition
    //   PropertyDefinition
    //   OperatorOverloadDefinition
    //   IndexerDefinition
    //   MethodDefinition
    //   ConstructorDefinition
    //   DeconstructorDefinition
    //   TypeDefinition 
    //   NamespaceDefinition 
    //   ExtensionDefinition 

    // TypeDefinition :
    //   ClassDefinition
    //   StructDefinition
    //   EnumDefinition
    //   InterfaceDefinition

    MemberDefinition last = null;
    while (true) {

        MemberDefinition current;
        Expression returnType;
        var docComment = parseDocComment();
        var annotations = parseMemberAnnotationList();
        var modifiers = parseModifiers();
        var type = lexer.peek().type;

        // int xxx...
        if (type.isPredefinedType()) {
            returnType = parsePredefinedType();
            goto parseTypeMember;
        }

        switch (type) {

            #region 标识符
                    case TokenType.identifier:

        var currentIdentifier = parseIdentifier();

        // A()
        if (lexer.peek().type == TokenType.lParam) {
            current = parseConstructor(docComment, annotations, modifiers, currentIdentifier);
            goto parseSuccess;
        }

        returnType = parseType(currentIdentifier, TypeUsage.type);
        goto parseTypeMember;

        #endregion

        #region 关键字开头的成员定义

                    case TokenType.@namespace:
        current = parseNamespaceDefinition(docComment, annotations, modifiers);
        goto parseSuccess;
                    case TokenType.@class:
        current = parseClassDefinition(docComment, annotations, modifiers);
        goto parseSuccess;
                    case TokenType.@struct:
        current = parseStructDefinition(docComment, annotations, modifiers);
        goto parseSuccess;
                    case TokenType.@interface:
        current = parseInterfaceDefinition(docComment, annotations, modifiers);
        goto parseSuccess;
                    case TokenType.@enum:
        current = parseEnumDefinition(docComment, annotations, modifiers);
        goto parseSuccess;
                    case TokenType.extend:
        current = parseExtensionDefinition(docComment, annotations, modifiers);
        goto parseSuccess;
                    case TokenType.func:
        current = parseFuncDefinition(docComment, annotations, modifiers);
        goto parseSuccess;

        #endregion

        #region 结束符

                    case TokenType.rBrace:
        lexer.read();
        if (expectRBrack) {
            return;
        }
        Compiler.error(ErrorCode.unexpectedRBrace, "语法错误：多余的“}”", lexer.current);
        continue;
                    case TokenType.eof:
        if (expectRBrack) {
            expectToken(TokenType.rBrace, ErrorCode.expectedRBrace);
        }
        return;

        #endregion

        #region 错误

                    case TokenType.import:
        Compiler.error(ErrorCode.unexpectedImportDirective, "“import”指令只能在文件顶部使用", lexer.peek());
        // 忽略之后的所有 import 语句。
        skipToMemberDefinition();
        continue;
                    case TokenType.semicolon:
        Compiler.error(ErrorCode.unexpectedSemicolon, "语法错误：多余的“;”", lexer.peek());
        lexer.read();
        continue;
                    default:
        Compiler.error(ErrorCode.unexpectedStatement, "语法错误：应输入函数、类或其它成员定义；所有语句都应放在函数内", lexer.peek());
        skipToMemberDefinition();
        continue;

        #endregion

    }

    parseTypeMember:

    // 当前接口的显示声明。
    Expression explicitType = null;

    parseNextTypeMember:

    switch (lexer.peek().type) {

        #region Type name
                    case TokenType.identifier:

    Identifier currentIdentifier = parseIdentifier();
    switch (lexer.peek().type) {

        // Type name()
        case TokenType.lParam:
            current = parseMethodDefinition(docComment, annotations, modifiers, returnType, explicitType, currentIdentifier);
            goto parseSuccess;

        // Type name {get; set;}
        case TokenType.lBrace:
            current = parsePropertyDefinition(docComment, annotations, modifiers, returnType, explicitType, currentIdentifier);
            goto parseSuccess;

        // Type InterfaceType.name()
        case TokenType.period:
            explicitType = explicitType == null ? (Expression)currentIdentifier : new MemberCallExpression() {
                target = explicitType,
                    argument = currentIdentifier
            };
            lexer.read();
            goto parseNextTypeMember;

        // Type name<T>()
        case TokenType.lt:
            if (followsWithTypeMemberDefinition()) {
                var currentType = parseGenericTypeExpression(currentIdentifier, TypeUsage.type);
                explicitType = explicitType == null ? (Expression)currentType : new MemberCallExpression() {
                    target = explicitType,
                        argument = currentType
                };
                lexer.read();
                goto parseNextTypeMember;
            }
            current = parseMethodDefinition(docComment, annotations, modifiers, returnType, explicitType, currentIdentifier);
            goto parseSuccess;

        // Type name;
        // Type name = Value;
        // Type name, name2;
        default:
            current = parseFieldDefinition(docComment, annotations, modifiers, returnType, explicitType, currentIdentifier);
            goto parseSuccess;

    }

    #endregion

    #region Type this
                    case TokenType.@this:
    lexer.read();

    // Type this [params] {}
    if (lexer.peek().type == TokenType.lBrack) {
        current = parseIndexerOperatorDefinition(docComment, annotations, modifiers, returnType, explicitType);
        goto parseSuccess;
    }

    // Type this +(params) {}
    if (lexer.peek().type.isOverloadableOperator()) {
        current = parseOperatorOverloadDefinition(docComment, annotations, modifiers, returnType, explicitType);
        goto parseSuccess;
    }

    Compiler.error(ErrorCode.invalidOperatorOverload, String.Format("“{0}”不是可重载的操作符", lexer.peek().type.getName()), lexer.peek());
    skipToMemberDefinition();
    continue;
    #endregion

                    // 其它情况。
                    default:
    expectIdentifier();
    skipToMemberDefinition();
    continue;

}

parseSuccess:
if (target.members == null) {
    last = target.members = current;
} else if (current != null) {
    last = last.next = current;
}

            }

        }

        /**
         * 判断之后是否存在函数名。
         */
         * <returns></returns>
        private bool followsWithTypeMemberDefinition() {
    lexer.mark();
    lexer.markRead();

    // 忽略之后的泛型参数。
    while (true) {
        switch (lexer.markRead().type) {
            case TokenType.gt:

                // 如果紧跟 . 说明这是实体泛型。
                return lexer.markRead().type == TokenType.period;
            case TokenType.lt:
                return true;
            case TokenType.colon:
            case TokenType.eof:
                return false;
        }
    }
}

        private DocComment parseDocComment() {
    return lexer.peek().docComment;
}

        private MemberDefinition.MemberAnnotation parseMemberAnnotationList() {

    // MemberAnnotationList :
    //   MemberDefinition.MemberAnnotation ...

    // MemberDefinition.MemberAnnotation :
    //   @ Type FuncCallArguments?

    MemberDefinition.MemberAnnotation first = null, last = null;

    int count = 0;

    while (readToken(TokenType.at)) {

        var current = new MemberDefinition.MemberAnnotation();

        current.target = parseType();
        if (lexer.peek().type == TokenType.lParam) {
            current.arguments = parseArgumentList(TokenType.rParam, ErrorCode.expectedRParam);
        }

        if (first == null) {
            last = first = current;
        } else {
            last = last.next = current;
        }

        if (++count > 250) {
            Compiler.error(ErrorCode.tooManyAnnoatation, "注解太多；一个成员最多只能包含 250 个注解", lexer.current);
        }

    }

    return first;

}

        private Modifiers parseModifiers() {
    Modifiers result = Modifiers.none;

    while (lexer.peek().type.isModifier()) {
        Modifiers current;
        switch (lexer.read().type) {
            case TokenType.@static:
                current = Modifiers.@static;
                break;
            case TokenType.@virtual:
                current = Modifiers.@virtual;
                break;
            case TokenType.@override:
                current = Modifiers.@override;
                break;
            case TokenType.@abstract:
                current = Modifiers.@abstract;
                break;

            case TokenType.@private:
                current = Modifiers.@private;
                break;
            case TokenType.@public:
                current = Modifiers.@public;
                break;
            case TokenType.@protected:
                current = Modifiers.@protected;
                break;

            case TokenType.@new:
                current = Modifiers.@new;
                break;
            case TokenType.@const:
                current = Modifiers.@const;
                break;
            case TokenType.final:
                current = Modifiers.final;
                break;
            case TokenType.@extern:
                current = Modifiers.@extern;
                break;
            case TokenType.@volatile:
                current = Modifiers.@volatile;
                break;
            default:
                console.assert(false, "TokenType.isModifier() 返回错误的结果");
                throw new Unreachable();
        }

        if (result.hasFlag(current)) {
            Compiler.error(ErrorCode.dumpModifiers, String.Format("“{0}”修饰符重复；应删除“{0}”", current.getName()), lexer.current);
            continue;
        }

        if (result.getAccessibility() != Modifiers.none && current.getAccessibility() != Modifiers.none) {
            Compiler.error(ErrorCode.tooManyAccessibility, String.Format("访问修饰符太多；应删除“{0}”", current.getName()), lexer.current);
            continue;
        }

        result |= current;

    }

    return result;
}

        private MethodDefinition parseMethodDefinition(DocComment docComment, MemberDefinition.MemberAnnotation annotations, Modifiers modifiers, Expression returnType, Expression explicitType, Identifier name) {

    // MethodDefinition :
    //   Annotations? Modifiers? Type ExplicitType? Identifier GenericParameterList? ( ParameterList? ) MethodBody

    // MethodBody :
    //   ;
    //   Block

    var result = new MethodDefinition();
    result.docComment = docComment;
    result.annotations = annotations;
    result.modifiers = modifiers;
    result.returnType = returnType;
    result.explicitType = explicitType;
    result.name = name;

    if (readToken(TokenType.lt)) {
        result.genericParameters = parseGenericParameterList();
    }

    result.parameters = parseParameterList(TokenType.lParam, TokenType.rParam, ErrorCode.expectedRParam);
    result.body = parseMethodBody();
    return result;

}

        private Teal.Compiler.MemberDefinition.GenericParameter parseGenericParameterList() {

    // GenericParameterList :
    //   GenericParameter
    //   GenericParameterList , GenericParameter

    // GenericParameter :
    //   Identifier
    //   Identifier : TypeConstract
    //   ...

    // TypeConstract :
    //   Type
    //   ( TypeList? )

    Teal.Compiler.MemberDefinition.GenericParameter first = null, last = null;

    int count = 0;

    do {
        var current = new Teal.Compiler.MemberDefinition.GenericParameter();

        if (!readToken(TokenType.ellipsis)) {
            current.name = expectIdentifier();

            if (readToken(TokenType.colon)) {
                current.constraints = new List<Expression>();
                bool hasParam = readToken(TokenType.lParam);
                int j = 0;
                do {
                    Expression type;

                    switch (lexer.peek().type) {
                        case TokenType.@class:
                            type = new MemberDefinition.GenericParameter.ClassConstraintExpression() {
                                startLocation = lexer.read().startLocation
                            };
                            break;
                        case TokenType.@struct:
                            type = new MemberDefinition.GenericParameter.StructConstraintExpression() {
                                startLocation = lexer.read().startLocation
                            };
                            break;
                        case TokenType.@enum:
                            type = new MemberDefinition.GenericParameter.EnumConstraintExpression() {
                                startLocation = lexer.read().startLocation
                            };
                            break;
                        case TokenType.@new:
                            type = new MemberDefinition.GenericParameter.NewableConstraintExpression() {
                                startLocation = lexer.read().startLocation,
                                    };
                            expectToken(TokenType.lParam, ErrorCode.expectedLParam);
                            expectToken(TokenType.rParam, ErrorCode.expectedRParam);
                            type.endLocation = lexer.current.endLocation;
                            break;
                        case TokenType.rParam:
                            goto end;
                        default:
                            type = parseType();
                            break;
                    }

                    current.constraints.Add(type);

                    if (!hasParam) {
                        goto end;
                    }

                    if (++j > 250) {
                        Compiler.error(ErrorCode.tooManyGenericConstraints, "泛型约束太多；一个泛型参数最多只能包含 250 个约束", lexer.current);
                    }

                } while (readToken(TokenType.comma));

                expectToken(TokenType.rParam, ErrorCode.expectedRParam);
            }

        }

        end:

        if (last == null) {
            last = first = current;
        } else {
            last = last.next = current;
        }

        if (++count > 250) {
            Compiler.error(ErrorCode.tooManyGenericTypeParameters, "泛型参数太多；一个成员最多只能包含 250 个泛型参数", lexer.current);
        }

    } while (readToken(TokenType.comma));

    expectToken(TokenType.gt, ErrorCode.expectedGt);
    return first;

}

        private Teal.Compiler.MemberDefinition.Parameter parseParameterList(TokenType startToken, TokenType stopToken, ErrorCode errorCode) {

    // ParameterList :
    //   Parameter
    //   ParameterList , Parameter

    // Parameter :
    //   ParameterModifers? Type Identifier VariableInitializer?
    //   ...

    // ParameterModifers :
    //   ref
    //   out
    //   params

    if (readToken(startToken)) {
        Teal.Compiler.MemberDefinition.Parameter first = null;
        Variable last = first;
        do {

            if (readToken(stopToken)) {
                return first;
            }

            var current = new Teal.Compiler.MemberDefinition.Parameter();
            current.variableType = VariableType.inParameter;
            switch (lexer.peek().type) {
                case TokenType.@ref:
                    current.variableType = VariableType.refParameter;
                    lexer.read();
                    parseRestParameterModifiers();
                    goto default;
                case TokenType.@params:
                    current.variableType = VariableType.paramsParameter;
                    lexer.read();
                    parseRestParameterModifiers();
                    goto default;
                case TokenType.@out:
                    current.variableType = VariableType.outParameter;
                    lexer.read();
                    parseRestParameterModifiers();
                    goto default;
                case TokenType.ellipsis:
                    current.variableType = VariableType.argListParameter;
                    current.name = new Identifier() {
                        startLocation = lexer.read().startLocation,
                            value = "...",
                            endLocation = lexer.current.endLocation
                    };
                    break;
                default:
                    current.type = parseType();
                    current.name = expectIdentifier();

                    // 读取参数默认值。
                    if (readToken(TokenType.assign)) {
                        current.initialiser = parseExpression();
                        if (current.variableType != VariableType.inParameter) {
                            Compiler.error(ErrorCode.invalidDefaultParameter, String.Format("含有其它修饰符的参数不允许有默认值"), current.initialiser);
                        }
                    }

                    break;
            }

            if (last == null) {
                last = first = current;
            } else {
                last = last.next = current;
            }

        } while (readToken(TokenType.comma));

        expectToken(stopToken, errorCode);
        return first;
    }

    expectToken(startToken, errorCode);
    return null;

}

        private void parseRestParameterModifiers() {
    switch (lexer.peek().type) {
        case TokenType.@ref:
        case TokenType.@params:
        case TokenType.@out:
            lexer.read();
            Compiler.error(ErrorCode.tooManyParameterModifiers, String.Format("参数修饰符太多；应删除“{0}”", lexer.peek().type.getName()), lexer.current);
            parseRestParameterModifiers();
            break;
    }
}

        private ToplevelBlock parseMethodBody() {

    // MethodBody :
    //   Block
    //   ;

    if (readToken(TokenType.lBrace)) {
        var result = new ToplevelBlock();
        result.startLocation = lexer.current.startLocation;
        parseBlockBody(result);
        return result;
    }

    expectSemicolon();
    return null;
}

        private ConstructorDefinition parseConstructor(DocComment docComment, MemberDefinition.MemberAnnotation annotations, Modifiers modifiers, Identifier name) {

    // ConstructorDefinition :
    //   Annotations? Modifiers? Identifier ( ParameterList? ) ConstructorInitializer? Block

    // ConstructorInitializer :
    //   : this ArgumentList
    //   : base ArgumentList

    var result = new ConstructorDefinition();
    result.docComment = docComment;
    result.annotations = annotations;
    result.modifiers = modifiers;
    result.name = name;
    result.parameters = parseParameterList(TokenType.lParam, TokenType.rParam, ErrorCode.expectedRParam);

    //if (readToken(TokenType.colon)) {
    //    if (lexer.peek().type != TokenType.@this && lexer.peek().type != TokenType.@base) {
    //        Compiler.error(ErrorCode.expectedThisOrBase, "语法错误：应输入“this”或“base”", lexer.peek());
    //    } else {
    //        result.initializerType = lexer.read().type;
    //        if (lexer.peek().type == TokenType.lParam) {
    //            result.initializerArguments = parseArgumentList(TokenType.rParam, ErrorCode.expectedRParam);
    //        } else {
    //            expectToken(TokenType.lParam, ErrorCode.expectedLParam);
    //        }
    //    }
    //}

    result.body = parseMethodBody();

    return result;
}

        private PropertyDefinition parsePropertyDefinition(DocComment docComment, MemberDefinition.MemberAnnotation annotations, Modifiers modifiers, Expression returnType, Expression explicitType, Identifier name) {

    // PropertyDefinition :
    //   Annotations? Modifiers? Type ExplicitType? Identifier { PropertyAccessorList }

    var result = new PropertyDefinition();
    result.docComment = docComment;
    result.annotations = annotations;
    result.modifiers = modifiers;
    result.returnType = returnType;
    result.explicitType = explicitType;
    result.name = name;
    parsePropertyBody(result);
    return result;
}

        private IndexerDefinition parseIndexerOperatorDefinition(DocComment docComment, MemberDefinition.MemberAnnotation annotations, Modifiers modifiers, Expression returnType, Expression explicitType) {

    // IndexerOperatorDefinition :
    //   Annotations? Modifiers? Type this [ ParameterList ] { PropertyAccessorList }

    var result = new IndexerDefinition();
    result.docComment = docComment;
    result.annotations = annotations;
    result.modifiers = modifiers;
    result.returnType = returnType;
    result.explicitType = explicitType;
    result.parameters = parseParameterList(TokenType.lBrack, TokenType.rBrack, ErrorCode.expectedRBrack);
    parsePropertyBody(result);
    return result;

    throw new Unreachable();

}

        private void parsePropertyBody(PropertyOrIndexerDefinition target) {

    // PropertyAccessorList :
    //   get MethodBody
    //   set MethodBody
    //   get MethodBody set MethodBody
    //   set MethodBody get MethodBody

    if (expectLBrace()) {

        do {

            var current = new PropertyDefinition.PropertyAccessor();
            current.annotations = parseMemberAnnotationList();
            current.modifiers = parseAccesibilityModifiers();

            if (!readToken(TokenType.identifier)) {
                Compiler.error(ErrorCode.expectedGetOrSet, "语法错误：应输入“get”或“set”", lexer.peek());
                skipToMemberDefinition();
                return;
            }


            current.name = parseIdentifier();
            if (current.name.value == "get") {
                if (target.getAccessor != null) {
                    Compiler.error(ErrorCode.dumpGetOrSet, "get 访问器重复", lexer.current);
                }
                target.getAccessor = current;
            } else if (current.name.value == "set") {
                if (target.setAccessor != null) {
                    Compiler.error(ErrorCode.dumpGetOrSet, "set 访问器重复", lexer.current);
                }
                target.setAccessor = current;
            } else {
                Compiler.error(ErrorCode.expectedGetOrSet, "语法错误：应输入“get”或“set”", lexer.current);
            }

            current.body = parseMethodBody();

        } while (!readToken(TokenType.rBrace));

    }

}

        private Modifiers parseAccesibilityModifiers() {
    Modifiers result = Modifiers.none;
    while (lexer.peek().type.isModifier()) {
        Modifiers current;
        switch (lexer.read().type) {
            case TokenType.@private:
                current = Modifiers.@private;
                break;
            case TokenType.@public:
                current = Modifiers.@public;
                break;
            case TokenType.@protected:
                current = Modifiers.@protected;
                break;
            default:
                Compiler.error(ErrorCode.invalidModifiers, String.Format("修饰符“{0}”对该项无效", lexer.current.type.getName()), lexer.current);
                continue;
        }

        // 只能设置成一个值。
        if (result != Modifiers.none) {
            Compiler.error(ErrorCode.tooManyAccessibility, String.Format("访问修饰符太多；应删除“{0}”", lexer.current.type.getName()), lexer.current);
            continue;
        }

        result = current;
    }

    return result;
}

        private OperatorDefinition parseOperatorOverloadDefinition(DocComment docComment, MemberDefinition.MemberAnnotation annotations, Modifiers modifiers, Expression returnType, Expression explicitType) {

    // OperatorOverloadDefinition :
    //   Annotations? Modifiers? Type ExplicitType? OverloadableOperator ( ParameterList ) MethodBody

    var result = new OperatorDefinition();
    result.docComment = docComment;
    result.annotations = annotations;
    result.modifiers = modifiers;
    result.returnType = returnType;
    result.explicitType = explicitType;
    result.name = parseIdentifier(); // this
    result.@operator = lexer.current.type;
    result.parameters = parseParameterList(TokenType.lParam, TokenType.rParam, ErrorCode.expectedRParam);
    result.body = parseMethodBody();
    return result;

}

        private FieldDefinition parseFieldDefinition(DocComment docComment, MemberDefinition.MemberAnnotation annotations, Modifiers modifiers, Expression type, Expression explicitType, Identifier currentIdentifier) {

    // FieldDefinition :
    //   Annotations? Modifiers? Type VariableDefinitionList ;

    var result = new FieldDefinition();
    result.docComment = docComment;
    result.annotations = annotations;
    result.modifiers = modifiers;
    if (explicitType != null) {
        Compiler.error(ErrorCode.invalidExplicitType, "字段不允许显示声明接口", explicitType);
    }
    result.variables = parseVariableList(type, currentIdentifier);
    expectSemicolon();
    return result;

}

        private MemberDefinition parseFuncDefinition(DocComment docComment, MemberDefinition.MemberAnnotation annotations, Modifiers modifiers) {

    // FuncDefinition :
    //    Annotations? Modifiers? func Identifier ( ParameterList? ) MethodBody

    var result = new MethodDefinition();
    lexer.read(); // func
    result.name = expectIdentifier();
    expectToken(TokenType.lParam, ErrorCode.expectedLParam);

    Variable last = null;
    do {
        if (lexer.peek().type == TokenType.rParam) {
            break;
        }

        var current = new MethodDefinition.Parameter();
        current.name = expectIdentifier();

        if (readToken(TokenType.assign)) {
            current.initialiser = parseExpression();
        }

        if (last == null) {
            last = result.parameters = current;
        } else {
            last = last.next = current;
        }
    } while (readToken(TokenType.comma));

    expectToken(TokenType.rParam, ErrorCode.expectedRParam);
    result.body = parseMethodBody();
    return result;
}

        private NamespaceDefinition parseNamespaceDefinition(DocComment docComment, MemberDefinition.MemberAnnotation annotations, Modifiers modifiers) {

    // NamespaceDefinition :
    //   Annotations? Modifiers? namespace IdentifierList  { MemberDefinitionList? }

    if (annotations != null) {
        //Compiler.error(ErrorCode.unexpectedAnnotation, "命名空间不允许有注解", annotations);
    }

    if (modifiers != Modifiers.none) {
        Compiler.error(ErrorCode.unexpectedModifiers, "命名空间不允许有修饰符", lexer.current);
    }

    var result = new NamespaceDefinition();
    result.docComment = docComment;
    lexer.read(); // namespace

    result.name = expectIdentifier();
    if (readToken(TokenType.period)) {
        result.names = new List<Identifier>() { result.name };
        do {
            result.names.Add(expectIdentifier());
        } while (readToken(TokenType.period));
    }

    if (expectLBrace()) {
        parseMemberContainerDefinitionBody(result, true);
    }

    return result;

}

        private ClassDefinition parseClassDefinition(DocComment docComment, MemberDefinition.MemberAnnotation annotations, Modifiers modifiers) {

    // ClassDefinition :
    //   Annotations? Modifiers? class Identifier GenericParameterList? BaseTypeList? { MemberDefinitionList? }

    // BaseTypeList :
    //   : TypeList

    var result = new ClassDefinition();
    parseTypeDefinitionBody(result, docComment, annotations, modifiers);
    return result;

}

        private StructDefinition parseStructDefinition(DocComment docComment, MemberDefinition.MemberAnnotation annotations, Modifiers modifiers) {

    // StructDefinition :
    //   Annotations? Modifiers? struct Identifier GenericParameterList? BaseTypeList? { MemberDefinitionList? }

    var result = new StructDefinition();
    parseTypeDefinitionBody(result, docComment, annotations, modifiers);
    return result;

}

        private InterfaceDefinition parseInterfaceDefinition(DocComment docComment, MemberDefinition.MemberAnnotation annotations, Modifiers modifiers) {

    // InterfaceDefinition :
    //  Annotations? Modifiers? interface Identifier GenericParameterList? BaseTypeList? { MemberDefinitionList? }

    var result = new InterfaceDefinition();
    parseTypeDefinitionBody(result, docComment, annotations, modifiers);
    return result;

}

        private void parseTypeDefinitionBody(TypeDefinition target, DocComment docComment, MemberDefinition.MemberAnnotation annotations, Modifiers modifiers) {

    target.docComment = docComment;
    target.annotations = annotations;
    target.modifiers = modifiers;
    lexer.read(); // class | struct | interface
    target.name = expectIdentifier();

    if (readToken(TokenType.lt)) {
        target.genericParameters = parseGenericParameterList();
    }

    if (readToken(TokenType.colon)) {
        target.baseTypes = parseBaseTypeList();
    }

    if (expectLBrace()) {
        parseMemberContainerDefinitionBody(target, true);
    }

}

        private ExtensionDefinition parseExtensionDefinition(DocComment docComment, MemberDefinition.MemberAnnotation annotations, Modifiers modifiers) {

    // ExtensionDefinition :
    //   Annotations? Modifiers? extend Type BaseTypeList? { MemberDefinitionList? }

    var result = new ExtensionDefinition();
    result.docComment = docComment;
    result.annotations = annotations;
    result.modifiers = modifiers;
    result.name = parseIdentifier(); // extend
    result.targetType = parseType();

    if (readToken(TokenType.colon)) {
        result.baseTypes = parseBaseTypeList();
    }

    if (expectLBrace()) {
        parseMemberContainerDefinitionBody(result, true);
    }

    return result;
}

        private EnumDefinition parseEnumDefinition(DocComment docComment, MemberDefinition.MemberAnnotation annotations, Modifiers modifiers) {

    // EnumDefinition :
    //   Annotations? Modifiers? enum Identifier EnumBaseType? { EnumFieldDefinitionList? }

    // EnumBaseType :
    //   : Type

    // EnumFieldDefinitionList :
    //   EnumFieldDefinition 
    //   EnumFieldDefinitionList , EnumFieldDefinition

    // EnumFieldDefinition :
    //   Identifier
    //   Identifier = Expression

    var result = new EnumDefinition();
    result.docComment = docComment;
    result.annotations = annotations;
    result.modifiers = modifiers;
    lexer.read(); // enum
    result.name = expectIdentifier();

    if (readToken(TokenType.colon)) {
        result.baseTypes = parseBaseTypeList();
    }

    if (expectLBrace()) {

        MemberDefinition last = null;

        do {

            if (readToken(TokenType.rBrace)) {
                return result;
            }

            var current = new EnumMemberDefinition();
            current.docComment = parseDocComment();
            current.annotations = parseMemberAnnotationList();
            current.name = expectIdentifier();

            if (readToken(TokenType.assign)) {
                current.initializer = parseExpression();
            }

            if (result.members == null) {
                last = result.members = current;
            } else {
                last = last.next = current;
            }

        } while (readToken(TokenType.comma));

        expectToken(TokenType.rBrace, ErrorCode.expectedRBrace);

    }
    return result;
}

        private List < Expression > parseBaseTypeList() {

    // TypeList :
    //   Type
    //   TypeList , Type

    List < Expression > result = new List<Expression>();
    do {
        result.Add(parseType());
        if (result.Count > 250) {
            Compiler.error(ErrorCode.tooManyBaseTypes, "基类型太多；类类型不得超过 250 个", lexer.current);
        }
    } while (readToken(TokenType.comma));
    return result;
}

#endregion

#region 解析语句

        private void parseBlockBody(Block target) {

    // StatementList :
    //   Statement ...

    var statements = target.statements = new List<Statement>();

    while (true) {
        switch (lexer.peek().type) {
            case TokenType.rBrace:
                target.endLocation = lexer.read().endLocation;
                return;
            case TokenType.eof:
                expectToken(TokenType.rBrace, ErrorCode.expectedRBrace);
                target.endLocation = lexer.current.endLocation;
                return;
            default:
                statements.Add(parseStatement());
                continue;
        }
    }

}

        /**
         * 在已经解析到一个类型时，继续解析语句。
         */
         * <param name="parsedType" > </param>
    * <returns></returns>
        private Statement parseVariableOrExpressionStatement(Expression parsedType) {

    // Type Identifier;
    if (lexer.peek().type == TokenType.identifier) {
        return parseVariableStatement(parsedType, parseIdentifier());
    }

    //// Type.A;
    //return parseExpressionStatement(parsedType);

    throw new Unreachable();

}

        private VariableStatement parseVariableStatement(Expression parsedType, Identifier parsedIdentifier) {

    var result = new VariableStatement();
    result.startLocation = parsedType.startLocation;
    result.variables = parseVariableList(parsedType, parsedIdentifier);
    expectSemicolon();
    return result;

}

        private VariableStatement parseVariableStatement(VariableType variableType) {

    // VariableStatement :
    //   Type VariableList
    //   const Type? VariableList

    console.assert(lexer.peek().type == TokenType.@const);

    VariableStatement result = new VariableStatement();
    result.startLocation = lexer.read().startLocation; //  const

    // 读取类型。
    var parsedType = parseType();
    if (lexer.peek().type == TokenType.identifier) {
        result.variables = parseVariableList(parsedType, parseIdentifier());
    } else {
        result.variables = parseVariableList(null, toIdentifier(parsedType));
    }

    for (var variable = result.variables; variable != null; variable = variable.next) {
        variable.variableType = variableType;
    }

    expectSemicolon();

    return result;
}

        private Variable parseVariableList(Expression type, Identifier currentIdentifier) {

    // VariableList :
    //   Variable
    //   VariableList , Variable

    var first = parseVariable(type, currentIdentifier);
    var last = first;
    while (readToken(TokenType.comma)) {
        last = last.next = parseVariable(type, expectIdentifier());
    }
    return first;
}

        private Variable parseVariable(Expression type, Identifier name) {

    // Variable :
    //   name
    //   name = Expression

    var result = new Variable();
    result.type = type;
    result.name = name;
    if (readToken(TokenType.assign)) {
        result.initialiser = parseExpression();
    }
    result.endLocation = lexer.current.endLocation;
    return result;
}

        /**
         * 解析变量定义或其他表达式。
         */
         * <returns></returns>
        private Node parseVariableOrExpression() {
    switch (lexer.peek().type) {
        case TokenType.identifier:
            var parsedType = parseTypeExpression(parseIdentifier(), TypeUsage.declartion);

            // 标识符后不是标识符，说明当前标识符就是需要的标识符。
            if (lexer.peek().type == TokenType.identifier) {
                return parseVariableList(parsedType, parseIdentifier());
            }

            return parseExpression(parsedType);

        default:

            if (lexer.peek().type.isPredefinedType()) {
                var parsedType2 = parsePredefinedType();

                // 标识符后不是标识符，说明当前标识符就是需要解析的标识符。
                if (lexer.peek().type == TokenType.identifier) {
                    return parseVariableList(parsedType2, parseIdentifier());
                }
                return parseExpression(parsedType2);
            }

            return parseExpression();
    }

}

        private Statement parseEmbeddedStatement() {

    // EmbeddedStatement :
    //   Statement except VariableStatement and LabeledStatement 

    var result = parseStatement();

    if (result == null) {
        Compiler.error(ErrorCode.expectedStatement, "语法错误：应输入语句", lexer.peek());
    } else if (result is VariableStatement) {
        Compiler.error(ErrorCode.invalidVariableStatement, "嵌套语句不能是变量声明语句；应使用“{}”包围", ((VariableStatement)result).type);
    } else if (result is LabeledStatement) {
        Compiler.error(ErrorCode.invalidLabeledStatement, "嵌套语句不能是标签语句；应使用“{}”包围", ((LabeledStatement)result).label);
    }

    if (result is Semicolon && lexer.peek().type == TokenType.lBrace) {
        Compiler.warning(ErrorCode.confusedSemicolon, "此分号可能是多余的", lexer.current.startLocation, lexer.current.endLocation);
    }

    return result;
}

        private Block parseBlock() {

    // Block :
    //   { StatementList? }

    console.assert(lexer.peek().type == TokenType.lBrace);

    var result = new Block();
    result.startLocation = lexer.read().startLocation; // {
    parseBlockBody(result);
    return result;

}

        private ExpressionStatement parseExpressionStatement() {

    // ExpressionStatement :
    //   Expression ;

    //var result = new ExpressionStatement();
    //result.body = parseExpression();
    //expectSemicolon();
    //result.endLocation = lexer.current.endLocation;
    //return result;

    throw new Unreachable();

}

        private ExpressionStatement parseExpressionStatement(Expression parsed) {

    // ExpressionStatement :
    //   Expression ;

    //var result = new ExpressionStatement();
    //result.body = parseExpression(parsed);
    //expectSemicolon();
    //result.endLocation = lexer.current.endLocation;
    //return result;

    throw new Unreachable();

}

        private ThrowStatement parseThrowStatement() {

    // ThrowStatement :
    //   throw Expression? ;

    console.assert(lexer.peek().type == TokenType.@throw);

    var result = new ThrowStatement();
    result.startLocation = lexer.read().startLocation; // throw

    if (followsWithExpression()) {
        result.value = parseExpression();
    }

    expectSemicolon();
    result.endLocation = lexer.current.endLocation;
    return result;

}

        private YieldStatement parseYieldStatement() {

    // YieldStatement :
    //   yield Expression ;

    console.assert(lexer.peek().type == TokenType.@yield);

    YieldStatement result = new YieldStatement();
    result.startLocation = lexer.read().startLocation; // yield
    result.value = parseExpression();
    expectSemicolon();
    result.endLocation = lexer.current.endLocation;

    return result;
}

        private Statement parseGotoStatement() {

    // GotoStatement :
    //   goto Identifier ;

    console.assert(lexer.peek().type == TokenType.@goto);

    var startLocation = lexer.read().startLocation; // goto

    Statement result;

    switch (lexer.peek().type) {
        case TokenType.identifier:
            result = new GotoLabelStatement() {
                startLocation = startLocation,
                    target = parseIdentifier()
            };
            break;
        case TokenType.@case:
            lexer.read();
            result = new GotoCaseStatement() {
                target = readToken(TokenType.@else) ? null : parseExpression()
            };
            break;
        default:
            expectIdentifier();
            return null;
    }

    result.startLocation = startLocation;
    expectSemicolon();
    result.endLocation = lexer.current.endLocation;
    return result;
}

        private BreakStatement parseBreakStatement() {

    // BreakStatement :
    //   break ;

    console.assert(lexer.peek().type == TokenType.@break);

    var result = new BreakStatement();
    result.startLocation = lexer.read().startLocation; // break
    expectSemicolon();
    result.endLocation = lexer.current.endLocation;
    return result;
}

        private ContinueStatement parseContinueStatement() {

    // ContinueStatement :
    //   continue ;

    console.assert(lexer.peek().type == TokenType.@continue);

    var result = new ContinueStatement();
    result.startLocation = lexer.read().startLocation; // continue
    expectSemicolon();
    result.endLocation = lexer.current.endLocation;
    return result;
}

        private ReturnStatement parseReturnStatement() {

    // ReturnStatement :
    //   return Expression? ;

    console.assert(lexer.peek().type == TokenType.@return);

    var result = new ReturnStatement();

    result.startLocation = lexer.read().startLocation;

    if (followsWithExpression()) {
        result.value = parseExpression();
    }

    expectSemicolon();
    result.endLocation = lexer.current.endLocation;
    return result;

}

        private TryStatement parseTryStatement() {

    // TryStatement :
    //   try EmbeddedStatement CatchClauseList
    //   try EmbeddedStatement CatchClauseList? finally EmbeddedStatement

    // CatchClauseList :
    //   CatchClause ...

    // CatchClause :
    //   catch EmbeddedStatement
    //   catch ( Type ) EmbeddedStatement
    //   catch ( Type Identifier ) EmbeddedStatement

    console.assert(lexer.peek().type == TokenType.@try);

    var result = new TryStatement();
    result.startLocation = lexer.read().startLocation; // try
    result.tryClause = parseEmbeddedStatement();

    TryStatement.CatchClause last = null;
    while (readToken(TokenType.@catch)) {
        var current = new TryStatement.CatchClause();
        current.startLocation = lexer.current.startLocation;

        if (readToken(TokenType.lParam)) {
            current.variable = new Variable();
            current.variable.type = parseType();
            if (!readToken(TokenType.rParam)) {
                current.variable.name = expectIdentifier();
                expectToken(TokenType.rParam, ErrorCode.expectedRParam);
            }
        }

        current.body = parseEmbeddedStatement();

        if (result.catchClauses == null) {
            last = result.catchClauses = current;
        } else {
            last = last.next = current;
        }
    }

    if (readToken(TokenType.@finally)) {
        result.finallyClause = parseEmbeddedStatement();
    }

    return result;
}

        private WithStatement parseWithStatement() {

    // WithStatement :
    //   with EmabedVariableDeclaration EmbeddedStatement

    console.assert(lexer.peek().type == TokenType.@with);

    var result = new WithStatement();
    result.startLocation = lexer.read().startLocation;

    bool foundParams = readToken(TokenType.lParam);
    if (!foundParams && Compiler.options.disallowMissingParentheses) {
        Compiler.error(ErrorCode.strictExpectedParentheses, "严格模式: 应输入“(”", lexer.current);
    }

    result.target = parseVariableOrExpression();

    if (foundParams) {
        expectToken(TokenType.rParam, ErrorCode.expectedRParam);
    }

    result.body = parseEmbeddedStatement();

    return result;

}

#endregion

#region 解析表达式

    /**
     * 解析一个标识符。
     */
    * <returns></returns>
        private Identifier parseIdentifier() {
    return new Identifier() {
        startLocation = lexer.read().startLocation,
            value = lexer.current.buffer.ToString(),
            endLocation = lexer.current.endLocation
    };
}

        /**
         * 解析一个魔法变量。
         */
         * <returns></returns>
        private MagicVariable parseMagicVariable() {

    // MagicVariable :
    //   @ Identifier

    console.assert(lexer.peek().type == TokenType.@at);

    var result = new MagicVariable();
    result.startLocation = lexer.read().startLocation; // @
    result.value = expectIdentifier().value;
    result.endLocation = lexer.current.endLocation;
    return result;
}

        private Expression parseCondition() {

    // Condition :
    //   ( BooleanExpression )

    //if (!Compiler.options.disallowMissingParentheses && this.lexer.peek().type != TokenType.openParen) {
    //    result.condition = parseExpression();
    //} else {
    //    expectToken(TokenType.openParen);
    //    result.condition = parseExpression();
    //    expectToken(TokenType.closeParen);
    //}

    Expression result;

    if (readToken(TokenType.lParam)) {
        result = parseExpression(0);
        expectToken(TokenType.rParam, ErrorCode.expectedRParam);
    } else {
        if (Compiler.options.disallowMissingParentheses) {
            Compiler.error(ErrorCode.strictExpectedParentheses, "严格模式: 应输入“(”", lexer.current);
        }
        result = parseExpression();
    }

    return result;
}

        private Expression parseIntOrLongLiteral(long value) {
    if (value <= int.MaxValue) {
        return new IntLiteral() {
            startLocation = lexer.read().startLocation,
                value = (int)value,
                    endLocation = lexer.current.endLocation
        };
    }

    return new LongLiteral() {
        startLocation = lexer.read().startLocation,
            value = value,
            endLocation = lexer.current.endLocation
    };

}

        private Expression parseListOrDictLiteral(TokenType stopBrack, ErrorCode errorCode) {

    // ListLiteral :
    //   [ ElementList? ]
    //   [ ElementList? , ]

    // ElementList :
    //   Expression
    //   ElementList , Expression

    // DictLiteral :
    //   { PropertyList? }

    // PropertyList :
    //   Property
    //   PropertyNameAndValueList , Property

    // Property :
    //   PropertyName : Expression

    console.assert(lexer.peek().type == (stopBrack == TokenType.rBrace ? TokenType.@lBrace : TokenType.lBrack));

    var startLocation = lexer.read().startLocation; // [
    var type = lexer.current.type;

    // [:], {:}
    if (readToken(TokenType.colon)) {
        expectToken(stopBrack, errorCode);
        return new DictLiteral() {
            startLocation = startLocation,
                type = type,
                endLocation = lexer.current.endLocation
        };
    }

    // [], {}
    if (readToken(stopBrack)) {
        return new ListLiteral() {
            startLocation = startLocation,
                type = type,
                endLocation = lexer.current.endLocation
        };
    }

    var firstKey = parseExpression();

    // [key: value], {key: value}
    if (readToken(TokenType.colon)) {
        var result = new DictLiteral();
        result.startLocation = startLocation;
        result.type = type;

        var last = result.properties = new DictLiteral.Property() {
            key = type == TokenType.lBrace ? toIdentifier(firstKey) : firstKey,
            value = parseExpression()
        };

        while (readToken(TokenType.comma)) {

            // ], }
            if (readToken(stopBrack)) {
                goto end;
            }

            var current = new DictLiteral.Property();

            if (type == TokenType.lBrace) {
                current.key = expectIdentifier();
            } else {
                current.key = parseExpression();
            }

            expectToken(TokenType.colon, ErrorCode.expectedColon);
            current.value = parseExpression();

            last = last.next = current;

        }

        expectToken(stopBrack, errorCode);
        end:
        result.endLocation = lexer.current.endLocation;
        return result;

    } else {

        var result = new ListLiteral();
        result.startLocation = startLocation;
        result.type = type;
        result.values = new List<Expression>() { firstKey };

        while (readToken(TokenType.comma)) {

            // ], }
            if (readToken(stopBrack)) {
                goto end;
            }

            result.values.Add(parseExpression());

        }

        expectToken(stopBrack, errorCode);
        end:
        result.endLocation = lexer.current.endLocation;
        return result;

    }

}

        private FuncCallExpression.Argument parseArgumentList(TokenType stopBrack, ErrorCode errorCode) {

    // CallExpression :
    //   MemberExpression ( ArgumentList? )

    // ArgumentList :
    //   Argument
    //   ArgumentList , Argument

    // ArgumentValue :
    //   ArgumentValue
    //   Identifier : ArgumentValue

    // ArgumentValue :
    //   ToExpression
    //   ref ToExpression
    //   out ToExpression

    console.assert(lexer.peek().type == (stopBrack == TokenType.rParam ? TokenType.@lParam : TokenType.lBrack));

    lexer.read(); // [, (

    FuncCallExpression.Argument first = null, last = null;

    do {

        if (readToken(stopBrack)) {
            goto end;
        }

        var current = new FuncCallExpression.Argument();

        // 读取命名参数名。
        if (lexer.peek().type == TokenType.identifier) {
            var currentIdentifier = parseIdentifier();

            if (readToken(TokenType.colon)) {
                current.name = currentIdentifier;
                parseArgumentBody(current);
            } else {
                current.value = parseExpression(parseTypeExpression(currentIdentifier, TypeUsage.expression));
            }

        } else {
            parseArgumentBody(current);
        }

        if (last == null) {
            last = first = current;
        } else {
            last = last.next = current;
        }

    } while (readToken(TokenType.comma));

    expectToken(stopBrack, errorCode);

    end:
    return first;

}

        private void parseArgumentBody(FuncCallExpression.Argument target) {

    if (readToken(TokenType.@out)) {
        target.type = readToken(TokenType.assignTo) ? FuncCallExpression.ArgumentType.outAssignTo : FuncCallExpression.ArgumentType.@out;
    } else if (readToken(TokenType.@ref)) {
        target.type = FuncCallExpression.ArgumentType.@ref;
    }

    target.value = parseExpression();

}

        private NewExpression parseNewExpression() {

    // NewExpression :
    //   new FuncCallExpression NewInitilizer?

    // NewInitilizer :
    //   ArrayLiteral
    //   ObjectLiteral

    console.assert(lexer.peek().type == TokenType.@new);

    var result = new NewExpression();
    //result.startLocation = lexer.read().startLocation; // new
    //result.target = parseType(TypeUsage.@new);

    //switch (lexer.peek().type) {
    //    case TokenType.lParam:
    //        result.type = TokenType.lParam;
    //        result.arguments = parseArgumentList(TokenType.rParam, ErrorCode.expectedRParam);
    //        break;
    //    case TokenType.lBrack:
    //        result.type = TokenType.lBrack;
    //        result.arguments = parseArgumentList(TokenType.rBrack, ErrorCode.expectedRBrack);
    //        break;
    //}

    //if (lexer.peek().type == TokenType.lBrace) {
    //    result.initializer = parseListOrDictLiteral(TokenType.rBrace, ErrorCode.expectedRBrace);
    //}

    return result;
}

        private Expression parseParenthesizedExpression() {

    // ParenthesizedExpression:
    //   ( Expression )

    console.assert(lexer.peek().type == TokenType.lParam);

    //switch (followsWithLambdaOrTypeConversion()) {

    //    // (Parameters) ->
    //    case State.on:
    //        return parseLambdaLiteral(null);

    //    // (Type) Expression
    //    case State.off: {
    //            var result = new CastExpression();
    //            result.startLocation = lexer.read().startLocation; // (
    //            result.targetType = parseType();
    //            expectToken(TokenType.rParam, ErrorCode.expectedRParam);
    //            result.body = parseExpression(TokenType.lParam.getPrecedence());
    //            return result;
    //        }

    //    // (Expression)
    //    default: {
    //            var result = new ParenthesizedExpression();
    //            result.startLocation = lexer.read().startLocation; // (
    //            result.body = parseExpression();
    //            expectToken(TokenType.rParam, ErrorCode.expectedRParam);
    //            result.endLocation = lexer.current.endLocation;
    //            return result;
    //        }
    //}

    throw new Unreachable();

}

        private State followsWithLambdaOrTypeConversion() {
    lexer.mark();
    lexer.markRead(); // (
    while (true) {
        switch (lexer.markRead().type) {
            case TokenType.rParam:
                if (lexer.markRead().type == TokenType.lambda) { // -> identifier
                    return State.on;
                }
                return lexer.markCurrent.type.isExpressionStart() ? State.off : State.unset;
            case TokenType.lParam:
            case TokenType.eof:
                return State.unset;
        }
    }
}

        private LambdaLiteral parseLambdaLiteral(Identifier parsedParameter) {

    // LambdaLiteral :
    //    ( LambdaParameterList ) -> LambdaBody
    //    Identifier -> LambdaBody

    // LambdaParameterList :
    //    LambdaParameter ...

    // LambdaParameter :
    //    ref? Type Identifier
    //    out? Type Identifier
    //    Identifier

    // LambdaBody :
    //    MethodBody
    //    Expression

    console.assert(lexer.peek().type == TokenType.lParam || lexer.peek().type == TokenType.lambda);

    var result = new LambdaLiteral();

    //if (parsedParameter != null) {
    //    result.startLocation = parsedParameter.startLocation;
    //    result.parameters = new Parameter();
    //    result.parameters.name = parsedParameter;
    //} else if (lexer.peek().type == TokenType.lambda) {
    //    result.startLocation = lexer.peek().startLocation; // ->
    //} else {
    //    result.startLocation = lexer.read().startLocation; // (

    //    if (!readToken(TokenType.rParam)) {
    //        Parameter current = result.parameters = new Parameter();
    //        if (readToken(TokenType.@ref)) {
    //            current.variableType = VariableType.refParameter;
    //            current.type = parseType();
    //            current.name = expectIdentifier();
    //        } else if (readToken(TokenType.@out)) {
    //            current.variableType = VariableType.outParameter;
    //            current.type = parseType();
    //            current.name = expectIdentifier();
    //        } else {
    //            current.type = parseType();
    //            if (lexer.peek().type == TokenType.identifier) {
    //                current.name = parseIdentifier();
    //            } else {
    //                current.name = toIdentifier(current.type);
    //                current.type = null;
    //            }
    //        }

    //        bool hasType = current.type != null;
    //        Variable last = result.parameters;
    //        while (readToken(TokenType.comma)) {
    //            current = new Parameter();
    //            if (hasType) {
    //                if (readToken(TokenType.@ref)) {
    //                    current.variableType = VariableType.refParameter;
    //                } else if (readToken(TokenType.@out)) {
    //                    current.variableType = VariableType.outParameter;
    //                }
    //                current.type = parseType();
    //            }
    //            current.name = expectIdentifier();
    //            last = last.next = current;
    //        }

    //        if (!readToken(TokenType.rParam)) {
    //            expectToken(TokenType.rParam, ErrorCode.expectedRParam);

    //            // 跳过参数部分。
    //            do {
    //                lexer.read();
    //            } while (lexer.peek().type != TokenType.eof && lexer.peek().type != TokenType.rParam && lexer.peek().type != TokenType.lambda && lexer.peek().type != TokenType.lBrace && lexer.peek().type != TokenType.rBrace);
    //        }
    //    }

    //}

    //console.assert(lexer.peek().type == TokenType.lambda);
    //lexer.read(); //->
    //if (readToken(TokenType.lBrace)) {
    //    result.body = new ToplevelBlock();
    //    parseBlockBody(result.body);
    //} else {
    //    result.returnBody = parseExpression();
    //}

    return result;

}

/**
 * 用于指示类型的使用场景。
 */
private enum TypeUsage {
    type,
    expression,
    declartion,
            @new
        }

        private Expression parseType(TypeUsage typeUsage = TypeUsage.type) {

    // Type :
    //   PredefineType
    //   Identifier
    //   Type GenericArgumentList
    //   Type . Identifier GenericArgumentList?
    //   Type *
    //   Type [ ]

    // GenericArgumentList :
    //   < TypeList >

    var type = lexer.peek().type;

    if (type == TokenType.identifier) {
        return parseType(parseIdentifier(), typeUsage);
    }

    if (type.isPredefinedType()) {
        return parsePredefinedType(typeUsage);
    }

    Compiler.error(ErrorCode.expectedType, String.Format("语法错误：应输入类型；“{0}”不是类型", type.getName()), lexer.peek());
    return Expression.empty;

}

        /**
         * 当前是内置类型，继续解析其它类型。
         */
         * <returns></returns>
        private Expression parsePredefinedType(TypeUsage typeUsage = TypeUsage.type) {

    // PredefinedType :
    //   int
    //   float
    //   var
    //   dynamic
    //   ...
    //   PredefinedType []
    //   PredefinedType *

    console.assert(lexer.peek().type.isPredefinedType());

    Expression parsed = new PredefinedTypeLiteral() {
        startLocation = lexer.read().startLocation,
            type = lexer.current.type,
            };

    while (true) {
        switch (lexer.peek().type) {
            case TokenType.lBrack:

                // new 表达式中不解析数组类型。
                if (typeUsage == TypeUsage.@new) {
                    goto default;
        }
        lexer.read(); // [

        //// 读取数组维数。
        //int rank = 1;
        //while (readToken(TokenType.comma))
        //    rank++;

        expectToken(TokenType.rBrack, ErrorCode.expectedRBrack);
        parsed = new ArrayTypeExpression() {
            elementType = parsed,
                //rank = rank,
                endLocation = lexer.current.endLocation
        };
        continue;
                    case TokenType.mul:
        lexer.read();
        parsed = new PtrTypeExpression() {
            elementType = parsed,
                endLocation = lexer.current.endLocation
        };
        continue;
                    default:
        return parsed;
    }
}

        }

        /**
         * 解析以标识符开头的类型。
         */
         * <param name="parsedIdentifier" > </param>
    * <returns></returns>
        private Expression parseType(Identifier parsedIdentifier, TypeUsage typeUsage) {
    var parsed = parseTypeExpression(parsedIdentifier, typeUsage);

    while (readToken(TokenType.period)) {
        parsed = parseArrayTypeExpression(new MemberCallExpression() {
            target = parsed,
            argument = parseGenericTypeExpression(expectIdentifier(), typeUsage)
        }, typeUsage);
    }

    return parsed;
}

        /**
         * 尝试组合当前类型为复合类型表达式。
         */
         * <param name="parsedIdentifier" > </param>
    * <param name="typeUsage" > </param>
        * <returns></returns>
        private Expression parseTypeExpression(Identifier parsedIdentifier, TypeUsage typeUsage) {
    return parseArrayTypeExpression(parseGenericTypeExpression(parsedIdentifier, typeUsage), typeUsage);
}

        /**
         * 尝试组合当前类型为数组类型。
         */
         * <param name="parsed" > </param>
    * <param name="typeUsage" > </param>
        * <returns></returns>
        private Expression parseArrayTypeExpression(Expression parsed, TypeUsage typeUsage) {

    while (true) {
        switch (lexer.peek().type) {
            case TokenType.lBrack:

                // new 表达式中不解析数组类型。
                if (typeUsage == TypeUsage.@new) {
                    return parsed;
                }
                if (typeUsage != TypeUsage.type) {

                    // 判断 [ 是索引还是数组类型。
                    lexer.mark();
                    do {
                        lexer.markRead();
                    } while (lexer.markPeek().type == TokenType.comma);
                    if (lexer.markPeek().type != TokenType.rBrack) {
                        goto default;
        }
    }

    lexer.read(); // [

    int rank = 1;
    while (readToken(TokenType.comma))
        rank++;

    expectToken(TokenType.rBrack, ErrorCode.expectedRBrack);
    parsed = new ArrayTypeExpression() {
        elementType = parsed,
            //rank = rank,
            endLocation = lexer.current.endLocation
    };
    continue;
                    case TokenType.mul:
    if (typeUsage == TypeUsage.expression) {
        lexer.mark();
        lexer.markRead();

        // 如果紧跟表达式，则 * 解析为乘号。
        if (lexer.markRead().type.isExpressionStart()) {
            goto default;
        }
    }
    parsed = new PtrTypeExpression() {
        elementType = parsed,
            endLocation = lexer.read().endLocation
    };
    continue;
                    default:
    return parsed;
}
            }

        }

        /**
         * 尝试组合当前类型为泛型。
         */
         * <param name="parsed" > </param>
    * <param name="typeUsage" > </param>
        * <returns></returns>
        private Expression parseGenericTypeExpression(Identifier parsedIdentifier, TypeUsage typeUsage) {

    if (lexer.peek().type == TokenType.lt) {

        // 判断 < 是小于号还是泛型参数。
        if (typeUsage != TypeUsage.type) {
            lexer.mark();
            if (!markReadGenericTypeExpression()) {
                return parsedIdentifier;
            }
        }

        lexer.read(); // <

        var result = new GenericTypeExpression();
        result.elementType = parsedIdentifier;
        result.genericArguments = new List<Expression>();
        do {
            if (lexer.peek().type == TokenType.comma || lexer.peek().type == TokenType.gt) {
                result.genericArguments.Add(null);
                continue;
            }
            result.genericArguments.Add(parseType());
        } while (readToken(TokenType.comma));

        expectToken(TokenType.gt, ErrorCode.expectedGt);
        result.endLocation = lexer.current.endLocation;
        return result;
    }

    return parsedIdentifier;
}

        /**
         * 判断一个类型之后是否存在泛型参数。
         */
         * <returns></returns>
        private bool markReadGenericTypeExpression() {

    console.assert(lexer.markPeek().type == TokenType.@lt);

    do {

        lexer.markRead(); // <, ,

        // 允许直接结束。
        if (lexer.markPeek().type == TokenType.gt) {
            break;
        }

        // 如果紧跟的不是类型，则不是类型。
        if (!markReadType()) {
            return false;
        }

    } while (lexer.markPeek().type == TokenType.comma);

    // 如果是 > 说明一切顺利。
    return lexer.markRead().type == TokenType.gt;
}

        /**
         * 判断一个类型之后是否是数组类型。
         */
         * <returns></returns>
        private bool markReadArrayTypeExpression() {

    console.assert(lexer.markPeek().type == TokenType.lBrack);

    lexer.markRead(); // [

    // 跳过逗号。
    while (lexer.markPeek().type == TokenType.comma) {
        lexer.markRead();
    }

    return lexer.markRead().type == TokenType.rBrack;

}

        private bool markReadType() {
    var type = lexer.markRead().type;

    if (type == TokenType.identifier) {
        if (lexer.markPeek().type == TokenType.lt && !markReadGenericTypeExpression()) {
            return false;
        }
    } else if (!type.isPredefinedType()) {
        return false;
    }

    // 读取类型数组和指针组合。
    while (true) {
        switch (lexer.markPeek().type) {
            case TokenType.lBrack:
                if (!markReadArrayTypeExpression()) {
                    return false;
                }
                continue;
            case TokenType.mul:
                lexer.markRead();
                continue;
            case TokenType.period:
                lexer.markRead();
                if (lexer.markRead().type != TokenType.identifier) {
                    return false;
                }
                continue;
            default:
                return true;
        }
    }

}

        private bool followsWithExpression() {
    return lexer.peek().type.isExpressionStart();
}

#endregion

/**
 * 解析一个源文件。
 */
parseSourceFile(node: nodes.SourceFile) {
    node.comments && node.comments.accept(this);
    node.jsDoc && node.jsDoc.accept(this);
    node.statements.accept(this);
}

/**
 * 解析一个变量声明语句(var xx = ...)。
 */
parseVariableStatement(node: nodes.VariableStatement) {
    node.decorators.accept(this);
    node.variables.accept(this);
}

/**
 * 解析一个表达式语句(...;)。
 */
parseExpressionStatement(node: nodes.ExpressionStatement) {
    node.body.accept(this);
}

/**
 * 解析一个 continue 语句(continue;)。
 */
parseContinueStatement(node: nodes.ContinueStatement) {
    node.label && node.label.accept(this);
}

/**
 * 解析一个 break 语句(break;)。
 */
parseBreakStatement(node: nodes.BreakStatement) {
    node.label && node.label.accept(this);
}

/**
 * 解析一个 return 语句(return ...;)。
 */
parseReturnStatement(node: nodes.ReturnStatement) {
    node.value && node.value.accept(this);
}

/**
 * 解析一个 throw 语句(throw ...;)。
 */
parseThrowStatement(node: nodes.ThrowStatement) {
    node.value.accept(this);
}

/**
 * 解析一个 try 语句(try {...} catch(e) {...})。
 */
parseTryStatement(node: nodes.TryStatement) {
    node.try.accept(this);
    node.catch.accept(this);
    node.finally.accept(this);
}

/**
 * 解析一个 try 语句的 catch 分句(catch(e) {...})。
 */
parseCatchClause(node: nodes.CatchClause) {
    node.variable.accept(this);
    node.body.accept(this);
}

/**
 * 解析一个 try 语句的 finally 分句(finally {...})。
 */
parseFinallyClause(node: nodes.FinallyClause) {
    node.body.accept(this);
}

/**
 * 解析一个 with 语句(with(...) {...})。
 */
parseWithStatement(node: nodes.WithStatement) {
    node.value.accept(this);
    node.body.accept(this);
}

/**
 * 解析一个标识符(xx)。
 */
parseIdentifier(node: nodes.Identifier) {

}

/**
 * 解析 null 字面量(null)。
 */
parseNullLiteral(node: nodes.NullLiteral) {

}

/**
 * 解析 true 字面量(true)。
 */
parseTrueLiteral(node: nodes.TrueLiteral) {

}

/**
 * 解析 false 字面量(false)。
 */
parseFalseLiteral(node: nodes.FalseLiteral) {

}

/**
 * 解析一个浮点数字面量(1)。
 */
parseNumericLiteral(node: nodes.NumericLiteral) {

}

/**
 * 解析一个字符串字面量('...')。
 */
parseStringLiteral(node: nodes.StringLiteral) {

}

/**
 * 解析一个数组字面量([...])。
 */
parseArrayLiteral(node: nodes.ArrayLiteral) {
    node.elements.accept(this);
}

/**
 * 解析一个对象字面量({x: ...})。
 */
parseObjectLiteral(node: nodes.ObjectLiteral) {
    node.elements.accept(this);
}

/**
 * 解析一个对象字面量项。
 */
parseObjectLiteralElement(node: nodes.ObjectLiteralElement) {
    node.name.accept(this);
    node.value.accept(this);
}

/**
 * 解析 this 字面量(this)。
 */
parseThisLiteral(node: nodes.ThisLiteral) {

}

/**
 * 解析 super 字面量(super)。
 */
parseSuperLiteral(node: nodes.SuperLiteral) {

}

/**
 * 解析一个括号表达式((...))。
 */
parseParenthesizedExpression(node: nodes.ParenthesizedExpression) {
    node.body.accept(this);
}

/**
 * 解析一个条件表达式(... ? ... : ...)。
 */
parseConditionalExpression(node: nodes.ConditionalExpression) {
    node.condition.accept(this);
    node.then.accept(this);
    node.else.accept(this);
}

/**
 * 解析一个成员调用表达式(x.y)。
 */
parseMemberCallExpression(node: nodes.MemberCallExpression) {
    node.target.accept(this);
    node.argument.accept(this);
}

/**
 * 解析一个函数调用表达式(x(...))。
 */
parseCallExpression(node: nodes.CallExpression) {
    node.target.accept(this);
    node.arguments.accept(this);
}

/**
 * 解析一个 new 表达式(new x(...))。
 */
parseNewExpression(node: nodes.NewExpression) {
    node.target.accept(this);
    node.arguments.accept(this);
}

/**
 * 解析一个索引调用表达式(x[...])。
 */
parseIndexCallExpression(node: nodes.IndexCallExpression) {
    node.target.accept(this);
    node.arguments.accept(this);
}

/**
 * 解析一个一元运算表达式(+x)。
 */
parseUnaryExpression(node: nodes.UnaryExpression) {
    node.operand.accept(this);
}

/**
 * 解析一个二元运算表达式(x + y)。
 */
parseBinaryExpression(node: nodes.BinaryExpression) {
    node.leftOperand.accept(this);
    node.rightOperand.accept(this);
}

/**
 * 解析一个箭头函数(x => ...)。
 */
parseLambdaLiteral(node: nodes.LambdaLiteral) {
    node.typeParameters.accept(this);
    node.parameters.accept(this);
    node.body.accept(this);
}

/**
 * 解析一个 yield 表达式(yield xx)。
 */
parseYieldExpression(node: nodes.YieldExpression) {
    node.body.accept(this);
}

/**
 * 解析一个类型转换表达式(<T>xx)。
 */
parseCnodesExpression(node: nodes.CnodesExpression) {
    node.type.accept(this);
    node.body.accept(this);
}

/**
 * 解析内置类型字面量(number)。
 */
parsePredefinedTypeLiteral(node: nodes.PredefinedTypeLiteral) {

}

/**
 * 解析一个泛型表达式(Array<T>)。
 */
parseGenericTypeExpression(node: nodes.GenericTypeExpression) {
    node.element.accept(this);
    node.genericArguments.accept(this);
}

/**
 * 解析一个数组类型表达式(T[])。
 */
parseArrayTypeExpression(node: nodes.ArrayTypeExpression) {
    node.element.accept(this);
}

/**
 * 解析一个描述器(@xx(...))。
 */
parseDecorator(node: nodes.Decorator) {
    node.body.accept(this);
}

/**
 * 解析一个修饰符(public)。
 */
parseModifier(node: nodes.Modifier) {

}

/**
 * 解析一个类定义(@class ...)。
 */
parseClassDefinition(node: nodes.ClassDefinition) {
    node.extends.accept(this);
    node.implements.accept(this);
    node.genericParameters && node.genericParameters.accept(this);
    node.members.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}

/**
 * 解析一个接口定义。
 */
parseInterfaceDefinition(node: nodes.InterfaceDefinition) {
    node.extends.accept(this);
    node.implements.accept(this);
    node.genericParameters && node.genericParameters.accept(this);
    node.members.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}

/**
 * 解析一个枚举定义。
 */
parseEnumDefinition(node: nodes.EnumDefinition) {
    node.members.accept(this);
    node.extends.accept(this);
    node.implements.accept(this);
    node.genericParameters && node.genericParameters.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}

/**
 * 解析一个扩展定义。
 */
parseExtensionDefinition(node: nodes.ExtensionDefinition) {
    node.targetType.accept(this);
    node.implements.accept(this);
    node.members.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}

/**
 * 解析一个命名空间定义。
 */
parseNamespaceDefinition(node: nodes.NamespaceDefinition) {
    node.names.accept(this);
    node.members.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}

/**
 * 解析一个模块。
 */
parseModuleDefinition(node: nodes.ModuleDefinition) {
    node.members.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}

/**
 * 解析一个类型子成员定义。
 */
parseTypeMemberDefinition(node: nodes.TypeMemberDefinition) {
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}

/**
 * 解析一个字段定义。
 */
parseFieldDefinition(node: nodes.FieldDefinition) {
    node.variables.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}

/**
 * 解析一个方法或属性定义。
 */
parseMethodOrPropertyDefinition(node: nodes.MethodOrPropertyDefinition) {
    node.returnType.accept(this);
    node.explicitType.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}

/**
 * 解析一个属性或索引器定义。
 */
parsePropertyOrIndexerDefinition(node: nodes.PropertyOrIndexerDefinition) {
    node.body.accept(this);
    node.returnType.accept(this);
    node.explicitType.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}

/**
 * 解析一个属性定义。
 */
parsePropertyDefinition(node: nodes.PropertyDefinition) {
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}

/**
 * 解析一个索引器定义。
 */
parseIndexerDefinition(node: nodes.IndexerDefinition) {
    node.parameters.accept(this);
    node.body.accept(this);
    node.returnType.accept(this);
    node.explicitType.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}

/**
 * 解析一个方法或构造函数定义。
 */
parseMethodOrConstructorDefinition(node: nodes.MethodOrConstructorDefinition) {
    node.parameters.accept(this);
    node.body.accept(this);
    node.returnType.accept(this);
    node.explicitType.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}

/**
 * 解析一个方法定义。
 */
parseMethodDefinition(node: nodes.MethodDefinition) {
    node.genericParameters.accept(this);
    node.parameters.accept(this);
    node.body.accept(this);
    node.returnType.accept(this);
    node.explicitType.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}

/**
 * 解析一个构造函数定义。
 */
parseConstructorDefinition(node: nodes.ConstructorDefinition) {
    node.parameters.accept(this);
    node.body.accept(this);
    node.returnType.accept(this);
    node.explicitType.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}

/**
 * 解析一个枚举的成员定义。
 */
parseEnumMemberDefinition(node: nodes.EnumMemberDefinition) {
    node.initializer.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}

/**
 * 解析一个 import 指令(import xx from '...';)。
 */
parseImportDirective(node: nodes.ImportDirective) {
    node.from.accept(this);
    node.alias.accept(this);
    node.value.accept(this);
}

/**
 * 解析一个数组绑定模式([xx, ...])
 */
parseArrayBindingPattern(node: nodes.ArrayBindingPattern) {
    node.elements.accept(this);
}

/**
 * 解析一个数组绑定模式项(xx, ..)
 */
parseArrayBindingElement(node: nodes.ArrayBindingElement) {
    node.initializer.accept(this);
    node.name.accept(this);
}

/**
 * 解析一个对象绑定模式({xx, ...})
 */
parseObjectBindingPattern(node: nodes.ObjectBindingPattern) {
    node.elements.accept(this);
}

/**
 * 解析一个对象绑定模式项(xx: y)
 */
parseObjectBindingElement(node: nodes.ObjectBindingElement) {
    node.propertyName.accept(this);
    node.name.accept(this);
}

/**
 * 解析一个变量声明(xx = ...)。
 */
parseVariableDeclaration(node: nodes.VariableDeclaration) {
    node.type.accept(this);
    node.initializer.accept(this);
    node.name.accept(this);
}

/**
 * 解析一个参数声明。
 */
parseParameterDeclaration(node: nodes.ParameterDeclaration) {
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name.accept(this);
}

/**
 * 解析一个泛型参数。
 */
parseGenericParameterDeclaration(node: nodes.GenericParameterDeclaration) {
    node.name.accept(this);
    node.constraint && node.constraint.accept(this);
}

/**
 * 解析一个 JS 注释。
 */
parseComment(node: nodes.Comment) {

}

/**
 * 解析一个 JS 文档注释。
 */
parseJsDocComment(node: nodes.JsDocComment) {

}


    // #region aa

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

    // Whether or not we've had a parse error since creating the lnodes AST node.  If we have
    // encountered an error, it will be stored on the next AST node we create.  Parse errors
    // can be broken down into three categories:
    //
    // 1) An error that occurred during scanning.  For example, an unterminated literal, or a
    //    character that was completely not understood.
    //
    // 2) A token was expected, but was not present.  This type of error is commonly produced
    //    by the 'this.expectToken' private.
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

    private parseSourceFile(fileName: string, _sourceText: string, languageVersion: ScriptTarget, _syntaxCursor: IncrementalParser.SyntaxCursor, setParentNodes ?: boolean, scriptKind ?: ScriptKind): SourceFile {
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
    // this is quite rare comparing to other nodes and createNode should be as fnodes as possible
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

    private parseErrorAtCurrentToken(message: DiagnosticMessage, arg0 ?: any): void {
    const start = scanner.getTokenPos();
    const length = scanner.getTextPos() - start;

    parseErrorAtPosition(start, length, message, arg0);
}

    private parseErrorAtPosition(start: number, length: number, message: DiagnosticMessage, arg0 ?: any): void {
    // Don't report another error if it would just be at the same position as the lnodes error.
    const lnodesError = lnodesOrUndefined(parseDiagnostics);
    if(!lnodesError || start !== lnodesError.start) {
    parseDiagnostics.push(createFileDiagnostic(sourceFile, start, length, message, arg0));
}

// Mark that we've encountered an error.  We'll set an appropriate bit on the next
// node we finish so that it can't be reused incrementally.
parseErrorBeforeNextFinishedNode = true;
    }

    private scanError(message: DiagnosticMessage, length ?: number) {
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

    private readTokenToken(t: TokenType): Node {
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
        return this.expectToken(TokenType.SemicolonToken);
    }
}

    // note: this private creates only node
    private createNode(kind: TokenType, pos ?: number): Node {
    nodeCount++;
    if (!(pos >= 0)) {
        pos = scanner.getStartPos();
    }

    return new NodeConstructor(kind, pos, pos);
}

    private finishNode<T extends Node>(node: T, end ?: number): T {
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

    private createMissingNode(kind: TokenType, reportAtCurrentPosition: boolean, diagnosticMessage: DiagnosticMessage, arg0 ?: any): Node {
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
    private createIdentifier(isIdentifier: boolean, diagnosticMessage ?: DiagnosticMessage): Identifier {
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

    private parseIdentifier(diagnosticMessage ?: DiagnosticMessage): Identifier {
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
    this.expectToken(TokenType.OpenBracketToken);

    // We parse any expression (including a comma expression). But the grammar
    // says that only an assignment expression is allowed, so the grammar checker
    // will error if it sees a comma expression.
    node.expression = allowInAnd(parseExpression);

    this.expectToken(TokenType.CloseBracketToken);
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
    private parseList<T extends Node>(kind: ParsingContext, parseElement: () => T): NodeArray < T > {
    const saveParsingContext = parsingContext;
    parsingContext |= 1 << kind;
    const result = <NodeArray<T>>[];
    result.pos = getNodePos();

    while(!isListTerminator(kind)) {
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
        // went pnodes the end of the list and rewound.
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
    private parseDelimitedList<T extends Node>(kind: ParsingContext, parseElement: () => T, considerSemicolonAsDelimiter ?: boolean): NodeArray < T > {
    const saveParsingContext = parsingContext;
    parsingContext |= 1 << kind;
    const result = <NodeArray<T>>[];
    result.pos = getNodePos();

    let commaStart = -1; // Meaning the previous token was not a comma
    while(true) {
    if (isListElement(kind, /*inErrorRecovery*/ false)) {
        result.push(parseListElement(kind, parseElement));
        commaStart = scanner.getTokenPos();
        if (readToken(TokenType.CommaToken)) {
            continue;
        }

        commaStart = -1; // Back to the state where the lnodes token was not a comma
        if (isListTerminator(kind)) {
            break;
        }

        // We didn't get a comma, and the list wasn't terminated, explicitly parse
        // out a comma so we give a good error message.
        this.expectToken(TokenType.CommaToken);

        // If the token was a semicolon, and the caller allows that, then skip it and
        // continue.  This ensures we get back on track and don't result in tons of
        // parse errors.  For example, this can happen when people do things like use
        // a semicolon to delimit object literal members.   Note: we'll have already
        // reported an error when we called this.expectToken above.
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
// Check if the lnodes token was a comma.
if (commaStart >= 0) {
    // Always preserve a trailing comma by marking it on the NodeArray
    result.hasTrailingComma = true;
}

result.end = getNodeEnd();
parsingContext = saveParsingContext;
return result;
    }

    private createMissingList<T>(): NodeArray < T > {
    const pos = getNodePos();
    const result = <NodeArray<T>>[];
    result.pos = pos;
    result.end = pos;
    return result;
}

    private parseBracketedList<T extends Node>(kind: ParsingContext, parseElement: () => T, open: TokenType, close: TokenType): NodeArray < T > {
    if(this.expectToken(open)) {
    const result = parseDelimitedList(kind, parseElement);
    this.expectToken(close);
    return result;
}

return createMissingList<T>();
    }

    // The allowReservedWords parameter controls whether reserved words are permitted after the first dot
    private parseEntityName(allowReservedWords: boolean, diagnosticMessage ?: DiagnosticMessage): EntityName {
    let entity: EntityName = parseIdentifier(diagnosticMessage);
    while (readToken(TokenType.DotToken)) {
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
    while (lnodesOrUndefined(templateSpans).literal.kind === TokenType.TemplateMiddle);

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
        literal = <TemplateLiteralFragment>this.expectTokenToken(TokenType.TemplateTail, /*reportAtCurrentPosition*/ false, Diagnostics._0_expected, tokenToString(TokenType.CloseBraceToken));
    }

    span.literal = literal;
    return finishNode(span);
}

    private parseStringLiteralTypeNode(): StringLiteralTypeNode {
    return <StringLiteralTypeNode>parseLiteralLikeNode(TokenType.StringLiteralType, /*internName*/ true);
}

    private parseLiteralNode(internName ?: boolean): LiteralExpression {
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
    this.expectToken(TokenType.TypeOfKeyword);
    node.exprName = parseEntityName(/*allowReservedWords*/ true);
    return finishNode(node);
}

    private parseTypeParameter(): TypeParameterDeclaration {
    const node = <TypeParameterDeclaration>createNode(TokenType.TypeParameter);
    node.name = parseIdentifier();
    if (readToken(TokenType.ExtendsKeyword)) {
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

    private parseTypeParameters(): NodeArray < TypeParameterDeclaration > {
    if(token === TokenType.LessThanToken) {
        return parseBracketedList(ParsingContext.TypeParameters, parseTypeParameter, TokenType.LessThanToken, TokenType.GreaterThanToken);
    }
}

    private parseParameterType(): TypeNode {
    if (readToken(TokenType.ColonToken)) {
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
    node.dotDotDotToken = readTokenToken(TokenType.DotDotDotToken);

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
        // and current token will not change => parsing of the enclosing parameter list will lnodes till the end of time (or OOM)
        // to avoid this we'll advance cursor to the next token.
        nextToken();
    }

    node.questionToken = readTokenToken(TokenType.QuestionToken);
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

        if(returnTokenRequired) {
            this.expectToken(returnToken);
            signature.type = parseTypeOrTypePredicate();
        }
        else if (readToken(returnToken)) {
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
    if (this.expectToken(TokenType.OpenParenToken)) {
        const savedYieldContext = inYieldContext();
        const savedAwaitContext = inAwaitContext();

        setYieldContext(yieldContext);
        setAwaitContext(awaitContext);

        const result = parseDelimitedList(ParsingContext.Parameters, parseParameter);

        setYieldContext(savedYieldContext);
        setAwaitContext(savedAwaitContext);

        if (!this.expectToken(TokenType.CloseParenToken) && requireCompleteParameterList) {
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
    if (readToken(TokenType.CommaToken)) {
        return;
    }

    // Didn't have a comma.  We must have a (possible ASI) semicolon.
    parseSemicolon();
}

    private parseSignatureMember(kind: TokenType): CallSignatureDeclaration | ConstructSignatureDeclaration {
    const node = <CallSignatureDeclaration | ConstructSignatureDeclaration>createNode(kind);
    if (kind === TokenType.ConstructSignature) {
        this.expectToken(TokenType.NewKeyword);
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

    private parseIndexSignatureDeclaration(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray): IndexSignatureDeclaration {
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
    const questionToken = readTokenToken(TokenType.QuestionToken);

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
    // Eat up all modifiers, but hold on to the lnodes one in case it is actually an identifier
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

    private parseObjectTypeMembers(): NodeArray < TypeElement > {
    let members: NodeArray<TypeElement>;
        if (this.expectToken(TokenType.OpenBraceToken)) {
    members = parseList(ParsingContext.TypeMembers, parseTypeMember);
    this.expectToken(TokenType.CloseBraceToken);
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
    this.expectToken(TokenType.OpenParenToken);
    node.type = parseType();
    this.expectToken(TokenType.CloseParenToken);
    return finishNode(node);
}

    private parseFunctionOrConstructorType(kind: TokenType): FunctionOrConstructorTypeNode {
    const node = <FunctionOrConstructorTypeNode>createNode(kind);
    if (kind === TokenType.ConstructorType) {
        this.expectToken(TokenType.NewKeyword);
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
        case TokenType.Any:
        case TokenType.String:
        case TokenType.Number:
        case TokenType.Boolean:
        case TokenType.Symbol:
        case TokenType.Undefined:
        case TokenType.Never:
            // If these are followed by a dot, then parse these out as a dotted type reference instead.
            const node = tryParse(parseKeywordAndNoDot);
            return node || parseTypeReference();
        case TokenType.StringLiteral:
            return parseStringLiteralTypeNode();
        case TokenType.Void:
        case TokenType.Null:
            return parseTokenNode<TypeNode>();
        case TokenType.This: {
            const thisKeyword = parseThisTypeNode();
            if (token === TokenType.IsKeyword && !scanner.hasPrecedingLineBreak()) {
                return parseThisTypePredicate(thisKeyword);
            }
            else {
                return thisKeyword;
            }
        }
        case TokenType.TypeOf:
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
        case TokenType.Any:
        case TokenType.String:
        case TokenType.Number:
        case TokenType.Boolean:
        case TokenType.Symbol:
        case TokenType.Void:
        case TokenType.Undefined:
        case TokenType.Null:
        case TokenType.This:
        case TokenType.TypeOf:
        case TokenType.Never:
        case TokenType.OpenBraceToken:
        case TokenType.OpenBracketToken:
        case TokenType.LessThanToken:
        case TokenType.New:
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
    while (!scanner.hasPrecedingLineBreak() && readToken(TokenType.OpenBracketToken)) {
        this.expectToken(TokenType.CloseBracketToken);
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
        while (readToken(operator)) {
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
    return readToken(TokenType.ColonToken) ? parseType() : undefined;
}

    // EXPRESSIONS
    private isStartOfLeftHandSideExpression(): boolean {
    switch (token) {
        case TokenType.This:
        case TokenType.Super:
        case TokenType.Null:
        case TokenType.True:
        case TokenType.False:
        case TokenType.NumericLiteral:
        case TokenType.StringLiteral:
        case TokenType.NoSubstitutionTemplateLiteral:
        case TokenType.TemplateHead:
        case TokenType.OpenParenToken:
        case TokenType.OpenBracketToken:
        case TokenType.OpenBraceToken:
        case TokenType.Function:
        case TokenType.Class:
        case TokenType.New:
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
        case TokenType.Delete:
        case TokenType.TypeOf:
        case TokenType.Void:
        case TokenType.PlusPlusToken:
        case TokenType.MinusMinusToken:
        case TokenType.LessThanToken:
        case TokenType.Await:
        case TokenType.Yield:
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

    private parseInitializer(inParameter: boolean): Expression {
    if (token !== TokenType.EqualsToken) {
        // It's not uncommon during typing for the user to miss writing the '=' token.  Check if
        // there is no newline after the lnodes token and if we're on an expression.  If so, parse
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

    this.expectToken(TokenType.EqualsToken);
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

    const result = new nodes.YieldExpression();
    result.start = this.lexer.read().start; // yield

    if (!this.lexer.currentToken.hasLineTerminatorBeforeStart) {
        if (this.lexer.tokenType === TokenType.nodeserisk) {
            result.nodeseriskStart = this.lexer.read().start;
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

    private parseSimpleArrowFunctionExpression(identifier: Identifier, asyncModifier ?: ModifiersArray): ArrowFunction {
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

    node.equalsGreaterThanToken = this.expectTokenToken(TokenType.EqualsGreaterThanToken, /*reportAtCurrentPosition*/ false, Diagnostics._0_expected, "=>");
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
    const lnodesToken = token;
    arrowFunction.equalsGreaterThanToken = this.expectTokenToken(TokenType.EqualsGreaterThanToken, /*reportAtCurrentPosition*/false, Diagnostics._0_expected, "=>");
    arrowFunction.body = (lnodesToken === TokenType.EqualsGreaterThanToken || lnodesToken === TokenType.OpenBraceToken)
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
            // The lnodes one is not actually an arrow private,
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
    const questionToken = readTokenToken(TokenType.QuestionToken);
    if (!questionToken) {
        return leftOperand;
    }

    // Note: we explicitly 'allowIn' in the whenTrue part of the condition expression, and
    // we do not that for the 'whenFalse' part.
    const node = <ConditionalExpression>createNode(TokenType.ConditionalExpression, leftOperand.pos);
    node.condition = leftOperand;
    node.questionToken = questionToken;
    node.whenTrue = doOutsideOfContext(disallowInAndDecoratorContext, parseAssignmentExpressionOrHigher);
    node.colonToken = this.expectTokenToken(TokenType.ColonToken, /*reportAtCurrentPosition*/ false,
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
        case TokenType.InstanceOf:
        case TokenType.In:
        case TokenType.As:
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

    private makeBinaryExpression(left: nodes.Expression, operator: TokenType, operatorStart: number, right: nodes.Expression) {
    const result = new nodes.BinaryExpression();
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
        return this.lexer.currentToken.type === TokenType.nodeseriskAsterisk ?
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
        case TokenType.Delete:
            return parseDeleteExpression();
        case TokenType.TypeOf:
            return parseTypeOfExpression();
        case TokenType.Void:
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
        case TokenType.Delete:
        case TokenType.TypeOf:
        case TokenType.Void:
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
    // the lnodes two CallExpression productions.  Or we have a MemberExpression which either
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
    this.expectTokenToken(TokenType.DotToken, /*reportAtCurrentPosition*/ false, Diagnostics.super_must_be_followed_by_an_argument_list_or_member_access);
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

    private parseJsxChildren(openingTagName: LeftHandSideExpression): NodeArray < JsxChild > {
    const result = <NodeArray<JsxChild>>[];
    result.pos = scanner.getStartPos();
    const saveParsingContext = parsingContext;
    parsingContext |= 1 << ParsingContext.JsxChildren;

    while(true) {
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

    this.expectToken(TokenType.LessThanToken);

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
        this.expectToken(TokenType.SlashToken);
        if (inExpressionContext) {
            this.expectToken(TokenType.GreaterThanToken);
        }
        else {
            this.expectToken(TokenType.GreaterThanToken, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
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
    while (readToken(TokenType.DotToken)) {
        const propertyAccess: PropertyAccessExpression = <PropertyAccessExpression>createNode(TokenType.PropertyAccessExpression, expression.pos);
        propertyAccess.expression = expression;
        propertyAccess.name = parseRightSideOfDot(/*allowIdentifierNames*/ true);
        expression = finishNode(propertyAccess);
    }
    return expression;
}

    private parseJsxExpression(inExpressionContext: boolean): JsxExpression {
    const node = <JsxExpression>createNode(TokenType.JsxExpression);

    this.expectToken(TokenType.OpenBraceToken);
    if (token !== TokenType.CloseBraceToken) {
        node.expression = parseAssignmentExpressionOrHigher();
    }
    if (inExpressionContext) {
        this.expectToken(TokenType.CloseBraceToken);
    }
    else {
        this.expectToken(TokenType.CloseBraceToken, /*message*/ undefined, /*shouldAdvance*/ false);
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
    if (readToken(TokenType.EqualsToken)) {
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
    this.expectToken(TokenType.OpenBraceToken);
    this.expectToken(TokenType.DotDotDotToken);
    node.expression = parseExpression();
    this.expectToken(TokenType.CloseBraceToken);
    return finishNode(node);
}

    private parseJsxClosingElement(inExpressionContext: boolean): JsxClosingElement {
    const node = <JsxClosingElement>createNode(TokenType.JsxClosingElement);
    this.expectToken(TokenType.LessThanSlashToken);
    node.tagName = parseJsxElementName();
    if (inExpressionContext) {
        this.expectToken(TokenType.GreaterThanToken);
    }
    else {
        this.expectToken(TokenType.GreaterThanToken, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
        scanJsxText();
    }
    return finishNode(node);
}

    private parseTypeAssertion(): TypeAssertion {
    const node = <TypeAssertion>createNode(TokenType.TypeAssertionExpression);
    this.expectToken(TokenType.LessThanToken);
    node.type = parseType();
    this.expectToken(TokenType.GreaterThanToken);
    node.expression = parseSimpleUnaryExpression();
    return finishNode(node);
}

    private parseMemberExpressionRest(expression: LeftHandSideExpression): MemberExpression {
    while (true) {
        const dotToken = readTokenToken(TokenType.DotToken);
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
        if (!inDecoratorContext() && readToken(TokenType.OpenBracketToken)) {
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

            this.expectToken(TokenType.CloseBracketToken);
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
    this.expectToken(TokenType.OpenParenToken);
    const result = parseDelimitedList(ParsingContext.ArgumentExpressions, parseArgumentExpression);
    this.expectToken(TokenType.CloseParenToken);
    return result;
}

    private parseTypeArgumentsInExpression() {
    if (!readToken(TokenType.LessThanToken)) {
        return undefined;
    }

    const typeArguments = parseDelimitedList(ParsingContext.TypeArguments, parseType);
    if (!this.expectToken(TokenType.GreaterThanToken)) {
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
        case TokenType.This:
        case TokenType.Super:
        case TokenType.Null:
        case TokenType.True:
        case TokenType.False:
            return parseTokenNode<PrimaryExpression>();
        case TokenType.OpenParenToken:
            return parseParenthesizedExpression();
        case TokenType.OpenBracketToken:
            return parseArrayLiteralExpression();
        case TokenType.OpenBraceToken:
            return parseObjectLiteralExpression();
        case TokenType.Async:
            // Async arrow privates are parsed earlier in parseAssignmentExpressionOrHigher.
            // If we encounter `async [no LineTerminator here] private` then this is an async
            // private; otherwise, its an identifier.
            if (!lookAhead(nextTokenIsFunctionKeywordOnSameLine)) {
                break;
            }

            return parseFunctionExpression();
        case TokenType.Class:
            return parseClassExpression();
        case TokenType.Function:
            return parseFunctionExpression();
        case TokenType.New:
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
    this.expectToken(TokenType.OpenParenToken);
    node.expression = allowInAnd(parseExpression);
    this.expectToken(TokenType.CloseParenToken);
    return finishNode(node);
}

    private parseSpreadElement(): Expression {
    const node = <SpreadElementExpression>createNode(TokenType.SpreadElementExpression);
    this.expectToken(TokenType.DotDotDotToken);
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
    this.expectToken(TokenType.OpenBracketToken);
    if (scanner.hasPrecedingLineBreak()) {
        node.multiLine = true;
    }
    node.elements = parseDelimitedList(ParsingContext.ArrayLiteralMembers, parseArgumentOrArrayLiteralElement);
    this.expectToken(TokenType.CloseBracketToken);
    return finishNode(node);
}

    private tryParseAccessorDeclaration(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray): AccessorDeclaration {
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

    const nodeseriskToken = readTokenToken(TokenType.AsteriskToken);
    const tokenIsIdentifier = isIdentifier();
    const propertyName = parsePropertyName();

    // Disallowing of optional property assignments happens in the grammar checker.
    const questionToken = readTokenToken(TokenType.QuestionToken);
    if (nodeseriskToken || token === TokenType.OpenParenToken || token === TokenType.LessThanToken) {
        return parseMethodDeclaration(fullStart, decorators, modifiers, nodeseriskToken, propertyName, questionToken);
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
        const equalsToken = readTokenToken(TokenType.EqualsToken);
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
        this.expectToken(TokenType.ColonToken);
        propertyAssignment.initializer = allowInAnd(parseAssignmentExpressionOrHigher);
        return addJSDocComment(finishNode(propertyAssignment));
    }
}

    private parseObjectLiteralExpression(): ObjectLiteralExpression {
    const node = <ObjectLiteralExpression>createNode(TokenType.ObjectLiteralExpression);
    this.expectToken(TokenType.OpenBraceToken);
    if (scanner.hasPrecedingLineBreak()) {
        node.multiLine = true;
    }

    node.properties = parseDelimitedList(ParsingContext.ObjectLiteralMembers, parseObjectLiteralElement, /*considerSemicolonAsDelimiter*/ true);
    this.expectToken(TokenType.CloseBraceToken);
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
    this.expectToken(TokenType.FunctionKeyword);
    node.nodeseriskToken = readTokenToken(TokenType.AsteriskToken);

    const isGenerator = !!node.nodeseriskToken;
    const isAsync = !!(node.flags & NodeFlags.Async);
    node.name =
        isGenerator && isAsync ? doInYieldAndAwaitContext(readTokenIdentifier) :
            isGenerator ? doInYieldContext(readTokenIdentifier) :
                isAsync ? doInAwaitContext(readTokenIdentifier) :
                    readTokenIdentifier();

    fillSignature(TokenType.ColonToken, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, node);
    node.body = parseFunctionBlock(/*allowYield*/ isGenerator, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);

    if (saveDecoratorContext) {
        setDecoratorContext(/*val*/ true);
    }

    return addJSDocComment(finishNode(node));
}

    private readTokenIdentifier() {
    return isIdentifier() ? parseIdentifier() : undefined;
}

    private parseNewExpression(): NewExpression {
    const node = <NewExpression>createNode(TokenType.NewExpression);
    this.expectToken(TokenType.NewKeyword);
    node.expression = parseMemberExpressionOrHigher();
    node.typeArguments = tryParse(parseTypeArgumentsInExpression);
    if (node.typeArguments || token === TokenType.OpenParenToken) {
        node.arguments = parseArgumentList();
    }

    return finishNode(node);
}

    // STATEMENTS

    private parseFunctionBlock(allowYield: boolean, allowAwait: boolean, ignoreMissingOpenBrace: boolean, diagnosticMessage ?: DiagnosticMessage): Block {
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

    /**
     * 解析条件部分。
     */
    private parseCondition() {

    // Condition :
    //   ( BooleanExpression )

    let result: nodes.Expression;
    if (this.readToken(TokenType.openParen)) {
        result = this.parseExpression(0);
        this.expectToken(TokenType.closeParen);
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

    const result = new nodes.DoWhileStatement();
    result.start = this.lexer.tokenStart;
    this.expectToken(TokenType.do);
    result.body = this.parseEmbeddedStatement();
    this.expectToken(TokenType.while);
    result.condition = this.parseCondition();

    // From: https://mail.mozilla.org/pipermail/es-discuss/2011-August/016188.html
    // 157 min --- All allen at wirfs-brock.com CONF --- "do{;}while(false)false" prohibited in
    // spec but allowed in consensus reality. Approved -- this is the de-facto standard whereby
    //  do;while(0)x will have a semicolon inserted before x.
    this.readToken(TokenType.semicolon);
    result.end = this.lexer.tokenEnd;
    return result;
}

    private parseWhileStatement() {

    // WhileStatement :
    //   while Condition EmbeddedStatement ;

    const result = new nodes.WhileStatement();
    result.start = this.lexer.tokenStart;
    this.expectToken(TokenType.while);
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
    this.expectToken(TokenType.ForKeyword);
    this.expectToken(TokenType.OpenParenToken);

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
    if (readToken(TokenType.InKeyword)) {
        const forInStatement = <ForInStatement>createNode(TokenType.ForInStatement, pos);
        forInStatement.initializer = initializer;
        forInStatement.expression = allowInAnd(parseExpression);
        this.expectToken(TokenType.CloseParenToken);
        forOrForInOrForOfStatement = forInStatement;
    }
    else if (readToken(TokenType.OfKeyword)) {
        const forOfStatement = <ForOfStatement>createNode(TokenType.ForOfStatement, pos);
        forOfStatement.initializer = initializer;
        forOfStatement.expression = allowInAnd(parseAssignmentExpressionOrHigher);
        this.expectToken(TokenType.CloseParenToken);
        forOrForInOrForOfStatement = forOfStatement;
    }
    else {
        const forStatement = <ForStatement>createNode(TokenType.ForStatement, pos);
        forStatement.initializer = initializer;
        this.expectToken(TokenType.SemicolonToken);
        if (token !== TokenType.SemicolonToken && token !== TokenType.CloseParenToken) {
            forStatement.condition = allowInAnd(parseExpression);
        }
        this.expectToken(TokenType.SemicolonToken);
        if (token !== TokenType.CloseParenToken) {
            forStatement.incrementor = allowInAnd(parseExpression);
        }
        this.expectToken(TokenType.CloseParenToken);
        forOrForInOrForOfStatement = forStatement;
    }

    forOrForInOrForOfStatement.statement = parseStatement();

    return finishNode(forOrForInOrForOfStatement);
}

    private parseBreakStatement() {

    // BreakStatement :
    //   break ;

    const result = new nodes.BreakStatement();
    result.start = this.lexer.tokenStart;
    this.expectToken(TokenType.break);
    if (!this.autoInsertSemicolon()) {
        result.label = this.parseIdentifier();
    }
    this.readToken(TokenType.semicolon);
    result.end = this.lexer.tokenEnd;
    return result;
}

    private parseContinueStatement(kind: TokenType) {

    // ContinueStatement :
    //   continue ;

    const result = new nodes.ContinueStatement();
    result.start = this.lexer.tokenStart;
    this.expectToken(TokenType.continue);
    if (!this.autoInsertSemicolon()) {
        result.label = this.parseIdentifier();
    }
    this.readToken(TokenType.semicolon);
    result.end = this.lexer.tokenEnd;
    return result;
}

    private parseReturnStatement() {

    // ReturnStatement :
    //   return Expression? ;

    const result = new nodes.ReturnStatement();
    result.start = this.lexer.tokenStart;
    this.expectToken(TokenType.return);
    if (!this.autoInsertSemicolon()) {
        result.value = this.parseExpression(true);
    }

    parseSemicolon();
    return finishNode(node);
}

    private parseWithStatement(): WithStatement {
    const node = <WithStatement>createNode(TokenType.WithStatement);
    this.expectToken(TokenType.WithKeyword);
    this.expectToken(TokenType.OpenParenToken);
    node.expression = allowInAnd(parseExpression);
    this.expectToken(TokenType.CloseParenToken);
    node.statement = parseStatement();
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
    this.expectToken(TokenType.ThrowKeyword);
    node.expression = scanner.hasPrecedingLineBreak() ? undefined : allowInAnd(parseExpression);
    parseSemicolon();
    return finishNode(node);
}

    // TODO: Review for error recovery
    private parseTryStatement(): TryStatement {
    const node = <TryStatement>createNode(TokenType.TryStatement);

    this.expectToken(TokenType.TryKeyword);
    node.tryBlock = parseBlock(/*ignoreMissingOpenBrace*/ false);
    node.catchClause = token === TokenType.CatchKeyword ? parseCatchClause() : undefined;

    // If we don't have a catch clause, then we must have a finally clause.  Try to parse
    // one out no matter what.
    if (!node.catchClause || token === TokenType.FinallyKeyword) {
        this.expectToken(TokenType.FinallyKeyword);
        node.finallyBlock = parseBlock(/*ignoreMissingOpenBrace*/ false);
    }

    return finishNode(node);
}

    private parseCatchClause(): CatchClause {
    const result = <CatchClause>createNode(TokenType.CatchClause);
    this.expectToken(TokenType.CatchKeyword);
    if (this.expectToken(TokenType.OpenParenToken)) {
        result.variableDeclaration = parseVariableDeclaration();
    }

    this.expectToken(TokenType.CloseParenToken);
    result.block = parseBlock(/*ignoreMissingOpenBrace*/ false);
    return finishNode(result);
}

    private parseDebuggerStatement(): Statement {
    const node = <Statement>createNode(TokenType.DebuggerStatement);
    this.expectToken(TokenType.DebuggerKeyword);
    parseSemicolon();
    return finishNode(node);
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
            case TokenType.Var:
            case TokenType.Let:
            case TokenType.Const:
            case TokenType.Function:
            case TokenType.Class:
            case TokenType.Enum:
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
            case TokenType.Interface:
            case TokenType.Type:
                return nextTokenIsIdentifierOnSameLine();
            case TokenType.Module:
            case TokenType.Namespace:
                return nextTokenIsIdentifierOrStringLiteralOnSameLine();
            case TokenType.Abstract:
            case TokenType.Async:
            case TokenType.Declare:
            case TokenType.Private:
            case TokenType.Protected:
            case TokenType.Public:
            case TokenType.Readonly:
                nextToken();
                // ASI takes effect for this modifier.
                if (scanner.hasPrecedingLineBreak()) {
                    return false;
                }
                continue;

            case TokenType.Global:
                nextToken();
                return token === TokenType.OpenBraceToken || token === TokenType.Identifier || token === TokenType.ExportKeyword;

            case TokenType.Import:
                nextToken();
                return token === TokenType.StringLiteral || token === TokenType.AsteriskToken ||
                    token === TokenType.OpenBraceToken || tokenIsIdentifierOrKeyword(token);
            case TokenType.Export:
                nextToken();
                if (token === TokenType.EqualsToken || token === TokenType.AsteriskToken ||
                    token === TokenType.OpenBraceToken || token === TokenType.DefaultKeyword ||
                    token === TokenType.AsKeyword) {
                    return true;
                }
                continue;

            case TokenType.Static:
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
        case TokenType.Var:
        case TokenType.Let:
        case TokenType.Function:
        case TokenType.Class:
        case TokenType.Enum:
        case TokenType.If:
        case TokenType.Do:
        case TokenType.While:
        case TokenType.For:
        case TokenType.Continue:
        case TokenType.Break:
        case TokenType.Return:
        case TokenType.With:
        case TokenType.Switch:
        case TokenType.Throw:
        case TokenType.Try:
        case TokenType.Debugger:
        // 'catch' and 'finally' do not actually indicate that the code is part of a statement,
        // however, we say they are here so that we may gracefully parse them and error later.
        case TokenType.Catch:
        case TokenType.Finally:
            return true;

        case TokenType.Const:
        case TokenType.Export:
        case TokenType.Import:
            return isStartOfDeclaration();

        case TokenType.Async:
        case TokenType.Declare:
        case TokenType.Interface:
        case TokenType.Module:
        case TokenType.Namespace:
        case TokenType.Type:
        case TokenType.Global:
            // When these don't start a declaration, they're an identifier in an expression statement
            return true;

        case TokenType.Public:
        case TokenType.Private:
        case TokenType.Protected:
        case TokenType.Static:
        case TokenType.Readonly:
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

    private parseDeclaration(): Statement {
    const fullStart = getNodePos();
    const decorators = parseDecorators();
    const modifiers = parseModifiers();
    switch (token) {
        case TokenType.Var:
        case TokenType.Let:
        case TokenType.Const:
            return parseVariableStatement(fullStart, decorators, modifiers);
        case TokenType.Function:
            return parseFunctionDeclaration(fullStart, decorators, modifiers);
        case TokenType.Class:
            return parseClassDeclaration(fullStart, decorators, modifiers);
        case TokenType.Interface:
            return parseInterfaceDeclaration(fullStart, decorators, modifiers);
        case TokenType.Type:
            return parseTypeAliasDeclaration(fullStart, decorators, modifiers);
        case TokenType.Enum:
            return parseEnumDeclaration(fullStart, decorators, modifiers);
        case TokenType.Global:
        case TokenType.Module:
        case TokenType.Namespace:
            return parseModuleDeclaration(fullStart, decorators, modifiers);
        case TokenType.Import:
            return parseImportDeclarationOrImportEqualsDeclaration(fullStart, decorators, modifiers);
        case TokenType.Export:
            nextToken();
            switch (token) {
                case TokenType.Default:
                case TokenType.EqualsToken:
                    return parseExportAssignment(fullStart, decorators, modifiers);
                case TokenType.As:
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

    private parseFunctionBlockOrSemicolon(isGenerator: boolean, isAsync: boolean, diagnosticMessage ?: DiagnosticMessage): Block {
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
    node.dotDotDotToken = readTokenToken(TokenType.DotDotDotToken);
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
        this.expectToken(TokenType.ColonToken);
        node.propertyName = propertyName;
        node.name = parseIdentifierOrPattern();
    }
    node.initializer = parseBindingElementInitializer(/*inParameter*/ false);
    return finishNode(node);
}

    private parseObjectBindingPattern(): BindingPattern {
    const node = <BindingPattern>createNode(TokenType.ObjectBindingPattern);
    this.expectToken(TokenType.OpenBraceToken);
    node.elements = parseDelimitedList(ParsingContext.ObjectBindingElements, parseObjectBindingElement);
    this.expectToken(TokenType.CloseBraceToken);
    return finishNode(node);
}

    private parseArrayBindingPattern(): BindingPattern {
    const node = <BindingPattern>createNode(TokenType.ArrayBindingPattern);
    this.expectToken(TokenType.OpenBracketToken);
    node.elements = parseDelimitedList(ParsingContext.ArrayBindingElements, parseArrayBindingElement);
    this.expectToken(TokenType.CloseBracketToken);
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
        case TokenType.Var:
            break;
        case TokenType.Let:
            node.flags |= NodeFlags.Let;
            break;
        case TokenType.Const:
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

    private parseVariableStatement(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray): VariableStatement {
    console.assert(this.lexer.currentToken.type === TokenType.var ||
        this.lexer.currentToken.type === TokenType.let ||
        this.lexer.currentToken.type === TokenType.const);
    const node = new nodes.VariableStatement();
    node.decorators = decorators;
    setModifiers(node, modifiers);
    node.declarationList = parseVariableDeclarationList(/*inForStatementInitializer*/ false);
    parseSemicolon();
    return addJSDocComment(finishNode(node));
}

    private parseFunctionDeclaration(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray): FunctionDeclaration {
    const node = <FunctionDeclaration>createNode(TokenType.FunctionDeclaration, fullStart);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    this.expectToken(TokenType.FunctionKeyword);
    node.nodeseriskToken = readTokenToken(TokenType.AsteriskToken);
    node.name = node.flags & NodeFlags.Default ? readTokenIdentifier() : parseIdentifier();
    const isGenerator = !!node.nodeseriskToken;
    const isAsync = !!(node.flags & NodeFlags.Async);
    fillSignature(TokenType.ColonToken, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, node);
    node.body = parseFunctionBlockOrSemicolon(isGenerator, isAsync, Diagnostics.or_expected);
    return addJSDocComment(finishNode(node));
}

    private parseConstructorDeclaration(pos: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray): ConstructorDeclaration {
    const node = <ConstructorDeclaration>createNode(TokenType.Constructor, pos);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    this.expectToken(TokenType.ConstructorKeyword);
    fillSignature(TokenType.ColonToken, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
    node.body = parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false, Diagnostics.or_expected);
    return addJSDocComment(finishNode(node));
}

    private parseMethodDeclaration(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray, nodeseriskToken: Node, name: PropertyName, questionToken: Node, diagnosticMessage ?: DiagnosticMessage): MethodDeclaration {
    const method = <MethodDeclaration>createNode(TokenType.MethodDeclaration, fullStart);
    method.decorators = decorators;
    setModifiers(method, modifiers);
    method.nodeseriskToken = nodeseriskToken;
    method.name = name;
    method.questionToken = questionToken;
    const isGenerator = !!nodeseriskToken;
    const isAsync = !!(method.flags & NodeFlags.Async);
    fillSignature(TokenType.ColonToken, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, method);
    method.body = parseFunctionBlockOrSemicolon(isGenerator, isAsync, diagnosticMessage);
    return addJSDocComment(finishNode(method));
}

    private parsePropertyDeclaration(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray, name: PropertyName, questionToken: Node): ClassElement {
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

    private parsePropertyOrMethodDeclaration(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray): ClassElement {
    const nodeseriskToken = readTokenToken(TokenType.AsteriskToken);
    const name = parsePropertyName();

    // Note: this is not legal as per the grammar.  But we allow it in the parser and
    // report an error in the grammar checker.
    const questionToken = readTokenToken(TokenType.QuestionToken);
    if (nodeseriskToken || token === TokenType.OpenParenToken || token === TokenType.LessThanToken) {
        return parseMethodDeclaration(fullStart, decorators, modifiers, nodeseriskToken, name, questionToken, Diagnostics.or_expected);
    }
    else {
        return parsePropertyDeclaration(fullStart, decorators, modifiers, name, questionToken);
    }
}

    private parseNonParameterInitializer() {
    return parseInitializer(/*inParameter*/ false);
}

    private parseAccessorDeclaration(kind: TokenType, fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray): AccessorDeclaration {
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
        case TokenType.Public:
        case TokenType.Private:
        case TokenType.Protected:
        case TokenType.Static:
        case TokenType.Readonly:
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

    // Eat up all modifiers, but hold on to the lnodes one in case it is actually an identifier.
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

    /**
     * 解析一个描述器(@xx(...))。
     */
    private parseDecorators() {
    const result = new nodes.NodeList<nodes.Decorator>();
    do {
        console.assert(this.lexer.currentToken.type === TokenType.at);
        const decorator = new nodes.Decorator();
        decorator.start = this.lexer.read().start;
        decorator.body = this.parseExpression();
        result.push(decorator);
    } while (this.lexer.peek().type === TokenType.at);
    return result;
}

    /*
     * There are situations in which a modifier like 'const' will appear unexpectedly, such as on a class member.
     * In those situations, if we are entirely sure that 'const' is not valid on its own (such as when ASI takes effect
     * and turns it into a standalone declaration), then it is better to parse it and report an error later.
     *
     * In such situations, 'permitInvalidConstAsModifier' should be set to true.
     */
    private parseModifiers(permitInvalidConstAsModifier ?: boolean): ModifiersArray {
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

    private parseClassDeclaration(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray): ClassDeclaration {
    return <ClassDeclaration>parseClassDeclarationOrExpression(fullStart, decorators, modifiers, TokenType.ClassDeclaration);
}

    private parseClassDeclarationOrExpression(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray, kind: TokenType): ClassLikeDeclaration {
    const node = <ClassLikeDeclaration>createNode(kind, fullStart);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    this.expectToken(TokenType.ClassKeyword);
    node.name = parseNameOfClassDeclarationOrExpression();
    node.typeParameters = parseTypeParameters();
    node.heritageClauses = parseHeritageClauses(/*isClassHeritageClause*/ true);

    if (this.expectToken(TokenType.OpenBraceToken)) {
        // ClassTail[Yield,Await] : (Modified) See 14.5
        //      ClassHeritage[?Yield,?Await]opt { ClassBody[?Yield,?Await]opt }
        node.members = parseClassMembers();
        this.expectToken(TokenType.CloseBraceToken);
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

    private parseHeritageClauses(isClassHeritageClause: boolean): NodeArray < HeritageClause > {
    // ClassTail[Yield,Await] : (Modified) See 14.5
    //      ClassHeritage[?Yield,?Await]opt { ClassBody[?Yield,?Await]opt }

    if(isHeritageClause()) {
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

    private parseInterfaceDeclaration(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray): InterfaceDeclaration {
    const node = <InterfaceDeclaration>createNode(TokenType.InterfaceDeclaration, fullStart);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    this.expectToken(TokenType.InterfaceKeyword);
    node.name = parseIdentifier();
    node.typeParameters = parseTypeParameters();
    node.heritageClauses = parseHeritageClauses(/*isClassHeritageClause*/ false);
    node.members = parseObjectTypeMembers();
    return finishNode(node);
}

    private parseTypeAliasDeclaration(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray): TypeAliasDeclaration {
    const node = <TypeAliasDeclaration>createNode(TokenType.TypeAliasDeclaration, fullStart);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    this.expectToken(TokenType.TypeKeyword);
    node.name = parseIdentifier();
    node.typeParameters = parseTypeParameters();
    this.expectToken(TokenType.EqualsToken);
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

    private parseEnumDeclaration(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray): EnumDeclaration {
    const node = <EnumDeclaration>createNode(TokenType.EnumDeclaration, fullStart);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    this.expectToken(TokenType.EnumKeyword);
    node.name = parseIdentifier();
    if (this.expectToken(TokenType.OpenBraceToken)) {
        node.members = parseDelimitedList(ParsingContext.EnumMembers, parseEnumMember);
        this.expectToken(TokenType.CloseBraceToken);
    }
    else {
        node.members = createMissingList<EnumMember>();
    }
    return finishNode(node);
}

    private parseModuleBlock(): ModuleBlock {
    const node = <ModuleBlock>createNode(TokenType.ModuleBlock, scanner.getStartPos());
    if (this.expectToken(TokenType.OpenBraceToken)) {
        node.statements = parseList(ParsingContext.BlockStatements, parseStatement);
        this.expectToken(TokenType.CloseBraceToken);
    }
    else {
        node.statements = createMissingList<Statement>();
    }
    return finishNode(node);
}

    private parseModuleOrNamespaceDeclaration(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray, flags: NodeFlags): ModuleDeclaration {
    const node = <ModuleDeclaration>createNode(TokenType.ModuleDeclaration, fullStart);
    // If we are parsing a dotted namespace name, we want to
    // propagate the 'Namespace' flag across the names if set.
    const namespaceFlag = flags & NodeFlags.Namespace;
    node.decorators = decorators;
    setModifiers(node, modifiers);
    node.flags |= flags;
    node.name = parseIdentifier();
    node.body = readToken(TokenType.DotToken)
        ? parseModuleOrNamespaceDeclaration(getNodePos(), /*decorators*/ undefined, /*modifiers*/ undefined, NodeFlags.Export | namespaceFlag)
        : parseModuleBlock();
    return finishNode(node);
}

    private parseAmbientExternalModuleDeclaration(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray): ModuleDeclaration {
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

    private parseModuleDeclaration(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray): ModuleDeclaration {
    let flags = modifiers ? modifiers.flags : 0;
    if (token === TokenType.GlobalKeyword) {
        // global augmentation
        return parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
    }
    else if (readToken(TokenType.NamespaceKeyword)) {
        flags |= NodeFlags.Namespace;
    }
    else {
        this.expectToken(TokenType.ModuleKeyword);
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

    private parseNamespaceExportDeclaration(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray): NamespaceExportDeclaration {
    const exportDeclaration = <NamespaceExportDeclaration>createNode(TokenType.NamespaceExportDeclaration, fullStart);
    exportDeclaration.decorators = decorators;
    exportDeclaration.modifiers = modifiers;
    this.expectToken(TokenType.AsKeyword);
    this.expectToken(TokenType.NamespaceKeyword);

    exportDeclaration.name = parseIdentifier();

    this.expectToken(TokenType.SemicolonToken);

    return finishNode(exportDeclaration);
}

    private parseImportDeclarationOrImportEqualsDeclaration(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray): ImportEqualsDeclaration | ImportDeclaration {
    this.expectToken(TokenType.ImportKeyword);
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
            this.expectToken(TokenType.EqualsToken);
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
        this.expectToken(TokenType.FromKeyword);
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
        readToken(TokenType.CommaToken)) {
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
    this.expectToken(TokenType.RequireKeyword);
    this.expectToken(TokenType.OpenParenToken);
    node.expression = parseModuleSpecifier();
    this.expectToken(TokenType.CloseParenToken);
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
    this.expectToken(TokenType.AsteriskToken);
    this.expectToken(TokenType.AsKeyword);
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
        this.expectToken(TokenType.AsKeyword);
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

    private parseExportDeclaration(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray): ExportDeclaration {
    const node = <ExportDeclaration>createNode(TokenType.ExportDeclaration, fullStart);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    if (readToken(TokenType.AsteriskToken)) {
        this.expectToken(TokenType.FromKeyword);
        node.moduleSpecifier = parseModuleSpecifier();
    }
    else {
        node.exportClause = parseNamedImportsOrExports(TokenType.NamedExports);

        // It is not uncommon to accidentally omit the 'from' keyword. Additionally, in editing scenarios,
        // the 'from' keyword can be parsed as a named export when the export clause is unterminated (i.e. `export { from "moduleName";`)
        // If we don't have a 'from' keyword, see if we have a string literal such that ASI won't take effect.
        if (token === TokenType.FromKeyword || (token === TokenType.StringLiteral && !scanner.hasPrecedingLineBreak())) {
            this.expectToken(TokenType.FromKeyword);
            node.moduleSpecifier = parseModuleSpecifier();
        }
    }
    parseSemicolon();
    return finishNode(node);
}

    private parseExportAssignment(fullStart: number, decorators: NodeArray < Decorator >, modifiers: ModifiersArray): ExportAssignment {
    const node = <ExportAssignment>createNode(TokenType.ExportAssignment, fullStart);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    if (readToken(TokenType.EqualsToken)) {
        node.isExportEquals = true;
    }
    else {
        this.expectToken(TokenType.DefaultKeyword);
    }
    node.expression = parseAssignmentExpressionOrHigher();
    parseSemicolon();
    return finishNode(node);
}

    private processReferenceComments(sourceFile: SourceFile): void {
    const triviaScanner = createScanner(sourceFile.languageVersion, /*skipTrivia*/false, LanguageVariant.Standard, sourceText);
    const referencedFiles: FileReference[] = [];
    const typeReferenceDirectives: FileReference[] = [];
    const amdDependencies: { path: string; name: string } [] = [];
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
    //            case TokenType.Function:
    //            case TokenType.DotDotDotToken:
    //            case TokenType.New:
    //            case TokenType.This:
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

    //        this.expectToken(TokenType.OpenBraceToken);
    //        result.type = parseJSDocTopLevelType();
    //        this.expectToken(TokenType.CloseBraceToken);

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
    //                this.expectToken(TokenType.CloseBracketToken);

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
    //            case TokenType.Function:
    //                return parseJSDocFunctionType();
    //            case TokenType.DotDotDotToken:
    //                return parseJSDocVariadicType();
    //            case TokenType.New:
    //                return parseJSDocConstructorType();
    //            case TokenType.This:
    //                return parseJSDocThisType();
    //            case TokenType.Any:
    //            case TokenType.String:
    //            case TokenType.Number:
    //            case TokenType.Boolean:
    //            case TokenType.Symbol:
    //            case TokenType.Void:
    //                return parseTokenNode<JSDocType>();
    //        }

    //        // TODO (drosen): Parse string literal types in JSDoc as well.
    //        return parseJSDocTypeReference();
    //    }

    //    private parseJSDocThisType(): JSDocThisType {
    //        const result = <JSDocThisType>createNode(TokenType.JSDocThisType);
    //        nextToken();
    //        this.expectToken(TokenType.ColonToken);
    //        result.type = parseJSDocType();
    //        return finishNode(result);
    //    }

    //    private parseJSDocConstructorType(): JSDocConstructorType {
    //        const result = <JSDocConstructorType>createNode(TokenType.JSDocConstructorType);
    //        nextToken();
    //        this.expectToken(TokenType.ColonToken);
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

    //        this.expectToken(TokenType.OpenParenToken);
    //        result.parameters = parseDelimitedList(ParsingContext.JSDocFunctionParameters, parseJSDocParameter);
    //        checkForTrailingComma(result.parameters);
    //        this.expectToken(TokenType.CloseParenToken);

    //        if (token === TokenType.ColonToken) {
    //            nextToken();
    //            result.type = parseJSDocType();
    //        }

    //        return finishNode(result);
    //    }

    //    private parseJSDocParameter(): ParameterDeclaration {
    //        const parameter = <ParameterDeclaration>createNode(TokenType.Parameter);
    //        parameter.type = parseJSDocType();
    //        if (readToken(TokenType.EqualsToken)) {
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
    //            while (readToken(TokenType.DotToken)) {
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
    //        // Move pnodes the <
    //        nextToken();
    //        const typeArguments = parseDelimitedList(ParsingContext.JSDocTypeArguments, parseJSDocType);
    //        checkForTrailingComma(typeArguments);
    //        checkForEmptyTypeArgumentList(typeArguments);
    //        this.expectToken(TokenType.GreaterThanToken);

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
    //        this.expectToken(TokenType.CloseBraceToken);
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
    //        this.expectToken(TokenType.CloseBracketToken);

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

    //                this.expectToken(TokenType.CloseParenToken);

    //        return finishNode(result);
    //            }

    //    private parseJSDocTypeList(firstType: JSDocType) {
    //                Debug.assert(!!firstType);

    //                const types = <NodeArray<JSDocType>>[];
    //                types.pos = firstType.pos;

    //                types.push(firstType);
    //                while(readToken(TokenType.BarToken)) {
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
        content.charCodeAt(start + 1) === CharacterCodes.nodeserisk &&
        content.charCodeAt(start + 2) === CharacterCodes.nodeserisk &&
        content.charCodeAt(start + 3) !== CharacterCodes.nodeserisk) {


        // + 3 for leading /**, - 5 in total for /** */
        scanner.scanRange(start + 3, length - 5, () => {
            // Initially we can parse out a tag.  We also have seen a starting nodeserisk.
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
                        // After a line break, we can parse a tag, and we haven't seen an nodeserisk on the next line yet
                        canParseTag = true;
                        seenAsterisk = false;
                        break;

                    case TokenType.AsteriskToken:
                        if (seenAsterisk) {
                            // If we've already seen an nodeserisk, then we can no longer parse a tag on this line
                            canParseTag = false;
                        }
                        // Ignore the first nodeserisk on a line
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
        if (readTokenToken(TokenType.OpenBracketToken)) {
            name = parseJSDocIdentifierName();
            isBracketed = true;

            // May have an optional default, e.g. '[foo = 42]'
            if (readTokenToken(TokenType.EqualsToken)) {
                parseExpression();
            }

            this.expectToken(TokenType.CloseBracketToken);
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
        // inconsistent tree.  Setting the parents on the new tree should be very fnodes.  We
        // will immediately bail out of walking any subtrees when we can see that their parents
        // are already correct.
        const result = Parser.parseSourceFile(sourceFile.fileName, newText, sourceFile.languageVersion, syntaxCursor, /*setParentNodes*/ true, sourceFile.scriptKind);

        return result;
    }

    private moveElementEntirelyPnodesChangeRange(element: IncrementalElement, isArray: boolean, delta: number, oldText: string, newText: string, aggressiveChecks: boolean) {
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
                    // Node is entirely pnodes the change range.  We need to move both its pos and
                    // end, forward or backward appropriately.
                    moveElementEntirelyPnodesChangeRange(child, /*isArray*/ false, delta, oldText, newText, aggressiveChecks);
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
                    moveElementEntirelyPnodesChangeRange(array, /*isArray*/ true, delta, oldText, newText, aggressiveChecks);
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
        // change the token touching it, we actually need to look back *at lenodes* one token so
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
        let lnodesNodeEntirelyBeforePosition: Node;

        forEachChild(sourceFile, visit);

        if (lnodesNodeEntirelyBeforePosition) {
            const lnodesChildOfLnodesEntireNodeBeforePosition = getLnodesChild(lnodesNodeEntirelyBeforePosition);
            if (lnodesChildOfLnodesEntireNodeBeforePosition.pos > bestResult.pos) {
                bestResult = lnodesChildOfLnodesEntireNodeBeforePosition;
            }
        }

        return bestResult;

        private getLnodesChild(node: Node): Node {
            while (true) {
                const lnodesChild = getLnodesChildWorker(node);
                if (lnodesChild) {
                    node = lnodesChild;
                }
                else {
                    return node;
                }
            }
        }

        private getLnodesChildWorker(node: Node): Node {
            let lnodes: Node = undefined;
            forEachChild(node, child => {
                if (nodeIsPresent(child)) {
                    lnodes = child;
                }
            });
            return lnodes;
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
                    // lnodes one that might be what we want.
                    lnodesNodeEntirelyBeforePosition = child;
                }
            }
            else {
                Debug.assert(child.pos > position);
                // We're now at a node that is entirely pnodes the position we're searching for.
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
        let lnodesQueriedPosition = InvalidPosition.Value;

        return {
            currentNode(position: number) {
                // Only compute the current node if the position is different than the lnodes time
                // we were asked.  The parser commonly asks for the node at the same position
                // twice.  Once to know if can read an appropriate list element at a certain point,
                // and then to actually read and consume the node.
                if (position !== lnodesQueriedPosition) {
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
                lnodesQueriedPosition = position;

                // Either we don'd have a node, or we have a node at the position being asked for.
                Debug.assert(!current || current.pos === position);
                return <IncrementalNode>current;
            }
        };

        // Finds the highest element in the tree we can find that starts at the provided position.
        // The element must be a direct child of some node list in the tree.  This way after we
        // return it, we can easily return its next sibling in the list.
        private findHighestListElementThatStartsAtPosition(position: number) {
            // Clear out any cached state about the lnodes node we found.
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