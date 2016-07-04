/**
 * @fileOverview 语法解析器
 */
var tokenType_1 = require('../ast/tokenType');
var nodes = require('../ast/nodes');
var lexer_1 = require('./lexer');
var Compiler = require('../compiler/compiler');
/**
 * 表示一个语法解析器。
 */
var Parser = (function () {
    function Parser() {
        // #region 核心
        /**
         * 获取或设置当前语法解析器使用的词法解析器。
         */
        this.lexer = new lexer_1.Lexer();
        /**
         * 存储解析的内部标记。
         */
        this.flags = 0;
        this.region = 解析成员
            * name;
        this["target"] =  > /param>;
        this.void = parseSourceUnitBody(SourceUnit, target);
    }
    /**
     * 解析指定的源文件。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param end 解析的源码结束位置。
     * @param fileName 解析的源码位置。
     */
    Parser.prototype.parse = function (source, start, end, fileName) {
        this.lexer.setSource(source, start, end);
        return this.parseSourceFile();
    };
    /**
     * 从指定的输入解析一个表达式。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param end 解析的源码结束位置。
     * @param fileName 解析的源码位置。
     */
    Parser.prototype.parseAsExpression = function (source, start, end, fileName) {
        this.lexer.setSource(source, start, end);
        return this.parseExpression();
    };
    /**
     * 从指定的输入解析一个语句。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param end 解析的源码结束位置。
     * @param fileName 解析的源码位置
     */
    Parser.prototype.parseAsStatement = function (source, start, end, fileName) {
        this.lexer.setSource(source, start, end);
        return this.parseStatement();
    };
    // #endregion
    // #region 解析底层
    /**
     * 报告一个语法错误。
     * @param message 错误的信息。
     * @param args 格式化错误的参数。
     */
    Parser.prototype.reportSyntaxError = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
    };
    /**
     * 如果下一个标记类型是指定的类型，则读取并移动到下一个标记。
     * @param token 期待的标记类型。
     * @returns 如果当前标记类型符合指定的操作符且移动位置则返回 true，否则返回 false。
     */
    Parser.prototype.readToken = function (token) {
        if (this.lexer.tokenType === token) {
            this.lexer.read();
            return true;
        }
        return false;
    };
    /**
     * 读取并移动到下一个标记。如果读取到的标记类型不是指定的类型，则输出一个错误。
     * @param token 期待的标记。
     * @returns 如果已解析到正确的标签则返回标签的位置，否则返回 undefined。
     */
    Parser.prototype.expectToken = function (token) {
        if (this.lexer.peek().type === token) {
            return this.lexer.read().start;
        }
        this.reportSyntaxError("应输入“{0}”；实际是“{1}”", tokenType_1.tokenToString(token), tokenType_1.tokenToString(this.lexer.tokenType));
    };
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
    Parser.prototype.parseNodeList = function (start, parseElement, end) {
        var result = new nodes.NodeList();
        return result;
    };
    // #endregion
    // #region 节点
    // #endregion
    // #region 语句
    /**
     * 解析一个语句。
     */
    Parser.prototype.parseStatement = function () {
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
            case tokenType_1.TokenType.identifier:
                var identifier = this.parseIdentifier();
                return this.readToken(tokenType_1.TokenType.colon) ?
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
            case tokenType_1.TokenType.openBrace:
                return this.parseBlock();
            case tokenType_1.TokenType.var:
                return this.parseVariableStatement(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case tokenType_1.TokenType.let:
                if (this.followsIdentifierOrStartOfDestructuring()) {
                    return parseVariableStatement(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
                }
                break;
            case tokenType_1.TokenType.function:
                return parseFunctionDeclaration(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case tokenType_1.TokenType.class:
                return parseClassDeclaration(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case tokenType_1.TokenType.if:
                return this.parseIfStatement();
            case tokenType_1.TokenType.switch:
                return this.parseSwitchStatement();
            case tokenType_1.TokenType.for:
                return this.parseForStatement();
            case tokenType_1.TokenType.while:
                return this.parseWhileStatement();
            case tokenType_1.TokenType.do:
                return this.parseDoWhileStatement();
            case tokenType_1.TokenType.break:
                return this.parseBreakStatement();
            case tokenType_1.TokenType.continue:
                return this.parseContinueStatement();
            case tokenType_1.TokenType.return:
                return this.parseReturnStatement();
            case tokenType_1.TokenType.throw:
                return this.parseThrowStatement();
            case tokenType_1.TokenType.try:
                return this.parseTryStatement();
            case tokenType_1.TokenType.debugger:
                return this.parseDebuggerStatement();
            case tokenType_1.TokenType.semicolon:
                return this.parseEmptyStatement();
            case tokenType_1.TokenType.endOfFile:
                return null;
            case tokenType_1.TokenType.with:
                return this.parseWithStatement();
            case tokenType_1.TokenType.AtToken:
                return parseDeclaration();
            case tokenType_1.TokenType.async:
            case tokenType_1.TokenType.interface:
            case tokenType_1.TokenType.type:
            case tokenType_1.TokenType.module:
            case tokenType_1.TokenType.namespace:
            case tokenType_1.TokenType.declare:
            case tokenType_1.TokenType.const:
            case tokenType_1.TokenType.enum:
            case tokenType_1.TokenType.export:
            case tokenType_1.TokenType.import:
            case tokenType_1.TokenType.private:
            case tokenType_1.TokenType.protected:
            case tokenType_1.TokenType.public:
            case tokenType_1.TokenType.abstract:
            case tokenType_1.TokenType.static:
            case tokenType_1.TokenType.readonly:
            case tokenType_1.TokenType.global:
                if (this.isStartOfDeclaration()) {
                    return this.parseDeclaration();
                }
                break;
        }
        return this.parseExpressionStatement();
    };
    /**
     * 解析一个标签语句(xx: ...)。
     * @param label 已解析的标签部分。
     */
    Parser.prototype.parseLabeledStatement = function (label) {
        // LabeledStatement :
        //   Identifier : Statement
        console.assert(this.lexer.currentToken.type === tokenType_1.TokenType.colon);
        var result = new nodes.LabeledStatement();
        result.label = label;
        result.colonStart = this.lexer.read().type;
        result.body = this.parseStatement();
        return result;
    };
    Parser.prototype.parseExpressionStatement = function () {
        //const expression = this.parseExpression();
        //const expressionStatement = <ExpressionStatement>createNode(TokenType.ExpressionStatement, fullStart);
        //expressionStatement.expression = expression;
        //parseSemicolon();
        //return addJSDocComment(finishNode(expressionStatement));
    };
    /**
     * 解析一个空语句(;)。
     */
    Parser.prototype.parseEmptyStatement = function () {
        console.assert(this.lexer.currentToken.type === tokenType_1.TokenType.semicolon);
        var result = new nodes.EmptyStatement();
        result.start = this.lexer.read().start;
        return result;
    };
    /**
     * 解析一个语句块({...})。
     */
    Parser.prototype.parseBlock = function (node) {
        var result = new nodes.Block();
        console.assert(this.lexer.currentToken.type === tokenType_1.TokenType.openBrace);
        result.start = this.lexer.read().start;
        result.statements = this.parseNodeList(tokenType_1.TokenType.closeBrace);
        console.assert(this.lexer.currentToken.type === tokenType_1.TokenType.closeBrace);
        result.end = this.lexer.read().end;
        return result;
    };
    /**
     * 解析一个 if 语句(if(...) {...})。
     */
    Parser.prototype.parseIfStatement = function () {
        // IfStatement :
        //   if Condition EmbeddedStatement
        //   if Condition EmbeddedStatement else EmbeddedStatement
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.if);
        var result = new nodes.IfStatement();
        result.start = this.lexer.read().start;
        result.condition = this.parseCondition();
        result.then = this.parseEmbeddedStatement();
        if (this.readToken(tokenType_1.TokenType.else)) {
            result.else = this.parseEmbeddedStatement();
        }
        return result;
    };
    /**
     * 解析一个 switch 语句(switch(...){...})。
     */
    Parser.prototype.parseSwitchStatement = function () {
        // SwitchStatement :
        //   switch Condition? { CaseClause... }
        console.assert(this.lexer.peek().type == tokenType_1.TokenType.switch);
        var result = new nodes.SwitchStatement();
        result.start = this.lexer.read().start; // switch
        result.condition = this.lexer.peek().type === tokenType_1.TokenType.openBrace ? undefined : this.parseCondition();
        result.cases = this.parseNodeList(tokenType_1.TokenType.openBrace, this.parseCaseClause, tokenType_1.TokenType.closeBrace);
        return result;
    };
    /**
     * 解析一个 switch 语句的 case 分支(case ...:{...})。
     */
    Parser.prototype.parseCaseClause = function () {
        // CaseClause :
        //   case Expression : Statement...
        //   default : Statement...
        //   case Expression, Expression... : Statement...
        //   case else : Statement...
        console.assert(this.lexer.peek().type == tokenType_1.TokenType.case || this.lexer.peek().type == tokenType_1.TokenType.default);
        var result = new nodes.CaseClause();
        result.start = this.lexer.read().start;
        if (this.lexer.currentToken.type === tokenType_1.TokenType.case) {
            result.label = this.parseExpressionWith(ParseContext.allowElse);
        }
        result.colonStart = this.expectToken(tokenType_1.TokenType.colon);
        result.statements = this.parseNodeList(null, this.parseStatement, tokenType_1.TokenType.closeBrace);
        return result;
    };
    /**
     * 解析一个 for 语句(for(...; ...; ...) {...})。
     */
    Parser.prototype.parseForStatement = function () {
        // ForStatement :
        //   for ( VariableOrExpression? ; Expression? ; Expression? ) EmbeddedStatement
        //   for ( Type Identifier in Expression ) EmbeddedStatement
        //   for ( Type Identifier = Expression to Expression ) EmbeddedStatement
        // VariableOrExpression :
        //   Type VariableList
        //   Expression
        console.assert(lexer.peek().type == tokenType_1.TokenType.);
        for (;;)
            ;
        var startLocation = lexer.read().startLocation; // for
        bool;
        hasParentheses = readToken(tokenType_1.TokenType.lParam);
        if (!hasParentheses && Compiler.options.disallowMissingParentheses) {
            Compiler.error(ErrorCode.strictExpectedParentheses, "严格模式: 应输入“(”", lexer.current);
        }
        if (followsWithExpression()) {
            var parsed = parseVariableOrExpression();
            Variable;
            parsedVariable = parsed;
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
    };
    Parser.prototype.parseForStatement = function (Location, bool, Node) {
        if (Location === void 0) { Location = startLocation; }
        if (bool === void 0) { bool = hasParam; }
        if (Node === void 0) { Node = initializer; }
        var result = new ForStatement();
        result.startLocation = startLocation;
        result.initializer = initializer;
        expectToken(tokenType_1.TokenType.semicolon, ErrorCode.expectedSemicolon);
        if (lexer.peek().type != tokenType_1.TokenType.semicolon) {
            result.condition = parseExpression();
        }
        expectToken(tokenType_1.TokenType.semicolon, ErrorCode.expectedSemicolon);
        if (followsWithExpression()) {
            result.iterator = parseExpression();
            while (readToken(tokenType_1.TokenType.comma)) {
                result.iterator = new CommaExpression();
                {
                    left = result.iterator,
                        right = parseExpression();
                }
                ;
            }
        }
        if (hasParam) {
            expectToken(tokenType_1.TokenType.rParam, ErrorCode.expectedRParam);
        }
        result.body = parseEmbeddedStatement();
        return result;
    };
    /**
     * 解析一个 for..in 语句(for(var xx in ...) {...})。
     */
    Parser.prototype.parseForInStatement = function (Location, bool, Variable) {
        if (Location === void 0) { Location = startLocation; }
        if (bool === void 0) { bool = hasParam; }
        if (Variable === void 0) { Variable = variable; }
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
            expectToken(tokenType_1.TokenType.rParam, ErrorCode.expectedRParam);
        }
        result.body = parseEmbeddedStatement();
        return result;
    };
    /**
     * 解析一个 for..of 语句(for(var xx of ...) {...})。
     */
    Parser.prototype.parseForOfStatement = function (node) {
    };
    /**
     * 解析一个 for..to 语句(for(var xx = ... to ...) {...})。
     */
    Parser.prototype.parseForToStatement = function (Location, bool, Variable) {
        if (Location === void 0) { Location = startLocation; }
        if (bool === void 0) { bool = hasParam; }
        if (Variable === void 0) { Variable = variable; }
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
        if (readToken(tokenType_1.TokenType.semicolon) && followsWithExpression()) {
            result.iterator = parseExpression();
        }
        if (hasParam) {
            expectToken(tokenType_1.TokenType.rParam, ErrorCode.expectedRParam);
        }
        result.body = parseEmbeddedStatement();
        return result;
    };
    /**
     * 解析一个 while 语句(while(...) {...})。
     */
    Parser.prototype.parseWhileStatement = function () {
        // WhileStatement :
        //   while Condition EmbeddedStatement ;
        console.assert(lexer.peek().type == tokenType_1.TokenType.);
        while ()
            ;
        return new WhileStatement();
        {
            startLocation = lexer.read().startLocation,
                condition = parseCondition(),
                body = parseEmbeddedStatement();
        }
        ;
    };
    /**
     * 解析一个 do..while 语句(do {...} while(...);)。
     */
    Parser.prototype.parseDoWhileStatement = function () {
        // DoWhileStatement :
        //   do EmbeddedStatement while Condition ;
        console.assert(lexer.peek().type == tokenType_1.TokenType.);
        do
            ;
        while ();
        var startLocation = lexer.read().startLocation; // do
        var body = parseEmbeddedStatement();
        DoWhileStatement;
        result = new DoWhileStatement();
        expectToken(tokenType_1.TokenType.);
        while (, ErrorCode.expectedWhile)
            ;
        result.startLocation = startLocation;
        result.body = body;
        result.condition = parseCondition();
        expectSemicolon();
        return result;
    };
    // #endregion
    // #region 表达式
    /**
     * 解析一个表达式。
     * @param minPrecedence 当前解析的最低操作符优先级。
     */
    Parser.prototype.parseExpression = function (minPrecedence) {
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
        var type = this.lexer.peek().type;
        var parsed;
        switch (type) {
            // Identifier, Identifier<T>, Identifier[]
            case tokenType_1.TokenType.identifier:
                parsed = this.parseTypeExprssion(this.parseIdentifier());
                break;
            // (Expr)
            case tokenType_1.TokenType.openParen:
                parsed = this.parseParenthesizedExpression();
                break;
            // new Expr
            case tokenType_1.TokenType.new:
                parsed = this.parseNewExpression();
                break;
            // ""
            case tokenType_1.TokenType.stringLiteral:
                parsed = this.parseStringLiteral();
                break;
            // 0
            case tokenType_1.TokenType.numericLiteral:
                parsed = this.parseNumericLiteral();
                break;
            // [Expr, ...]
            case tokenType_1.TokenType.lBrack:
                parsed = parseListOrDictLiteral(tokenType_1.TokenType.rBrack, ErrorCode.expectedRBrack);
                break;
            // {key: Expr, ...}
            case tokenType_1.TokenType.lBrace:
                parsed = parseListOrDictLiteral(tokenType_1.TokenType.rBrace, ErrorCode.expectedRBrack);
                break;
            // @ Identifier
            case tokenType_1.TokenType.at:
                parsed = this.parseAtExpression();
                break;
            case tokenType_1.TokenType.null:
                parsed = this.parentNullLiteral();
                break;
            case tokenType_1.TokenType.true:
                parsed = this.parentTrueLiteral();
                break;
            case tokenType_1.TokenType.false:
                parsed = this.parentFalseLiteral();
                break;
            case tokenType_1.TokenType.this:
                parsed = this.parentThisLiteral();
                break;
            case tokenType_1.TokenType.super:
                parsed = this.parentSuperLiteral();
                break;
            case tokenType_1.TokenType.plusPlus:
            case tokenType_1.TokenType.minusMinus:
                parsed = this.IncrementExpression();
                break;
            case tokenType_1.TokenType.lambda:
                parsed = parseLambdaLiteral(null);
                break;
            default:
                // +Expr
                if (tokenType_1.isUnaryOperator(type)) {
                    parsed = this.parseUnaryExpression(null);
                    break;
                }
                region;
                错误;
                if (type.isUsedInGlobal()) {
                    Compiler.error(ErrorCode.invalidExpression, "不能在函数主体内嵌其它成员定义", lexer.peek());
                    skipToNextLine();
                }
                else if (type == tokenType_1.TokenType.rParam) {
                    Compiler.error(ErrorCode.unexpectedRParam, "语法错误：多余的“)”", lexer.read());
                }
                else if (type == tokenType_1.TokenType.rBrack) {
                    Compiler.error(ErrorCode.unexpectedRBrack, "语法错误：多余的“]”", lexer.read());
                }
                else if (type == tokenType_1.TokenType.rBrace) {
                    Compiler.error(ErrorCode.unexpectedRBrace, "语法错误：多余的“}”", lexer.read());
                }
                else if (type.isStatementStart()) {
                    Compiler.error(ErrorCode.invalidExpression, String.Format("语法错误：“{0}”只能出现在每行语句的最前面位置", lexer.peek().ToString()), lexer.peek());
                }
                else {
                    Compiler.error(ErrorCode.invalidExpression, String.Format("语法错误：无效的表达式项“{0}”", lexer.peek().ToString()), lexer.peek());
                    skipToNextLine();
                }
                return Expression.empty;
                endregion;
        }
        return parseExpression(parsed, minPrecedence);
    };
    /**
     * 在解析一个表达式之后，继续解析剩下的后缀表达式。
     * @pram parsed 已解析的表达式。
     * @param minPrecedence 当前解析的最低操作符优先级。
     */
    Parser.prototype.parseRestExpression = function (parsed, minPrecedence) {
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
        tokenType_1.TokenType;
        type;
        int;
        precedence;
        while ((precedence = (type = lexer.peek().type).getPrecedence()) >= minPrecedence) {
            // Exper = Val
            if (type.isAssignOperator()) {
                lexer.read();
                parsed = new BinaryExpression();
                {
                    leftOperand = parsed,
                    ;
                    type,
                        rightOperand = parseExpression(precedence);
                }
                ;
                continue;
            }
            switch (type) {
                // Expr.call
                case tokenType_1.TokenType.period: {
                    var current = new MemberCallExpression();
                    current.target = parsed;
                    lexer.read();
                    current.argument = parseGenericTypeExpression(expectIdentifier(), TypeUsage.expression);
                    parsed = current;
                    continue;
                }
                // Expr()
                case tokenType_1.TokenType.lParam: {
                    var current = new FuncCallExpression();
                    current.target = parsed;
                    current.arguments = parseArgumentList(tokenType_1.TokenType.rParam, ErrorCode.expectedRParam);
                    current.endLocation = lexer.current.endLocation;
                    parsed = current;
                    continue;
                }
                // Expr ->
                case tokenType_1.TokenType.lambda:
                    parsed = parseLambdaLiteral(toIdentifier(parsed));
                    continue;
                // Expr[]
                case tokenType_1.TokenType.lBrack: {
                    var current = new IndexCallExpression();
                    current.target = parsed;
                    current.arguments = parseArgumentList(tokenType_1.TokenType.rBrack, ErrorCode.expectedRBrack);
                    current.endLocation = lexer.current.endLocation;
                    parsed = current;
                    continue;
                }
                // Expr ? A : B
                case tokenType_1.TokenType.conditional: {
                    var current = new ConditionalExpression();
                    current.condition = parsed;
                    lexer.read();
                    current.thenExpression = parseExpression();
                    expectToken(tokenType_1.TokenType.colon, ErrorCode.expectedColon);
                    current.elseExpression = parseExpression();
                    parsed = current;
                    continue;
                }
                // Expr++, Exper--
                case tokenType_1.TokenType.inc:
                case tokenType_1.TokenType.dec:
                    // 如果 ++ 和 -- 在新行出现，则不继续解析。
                    if (lexer.peek().hasLineTerminatorBeforeStart) {
                        return parsed;
                    }
                    parsed = new MutatorExpression;
                    {
                        operand = parsed,
                        ;
                        type,
                            endLocation = lexer.read().endLocation;
                    }
                    ;
                    continue;
                // Expr..A
                case tokenType_1.TokenType.periodChain: {
                    var current = new ChainCallExpression();
                    current.target = parsed;
                    lexer.read(); // ..
                    current.argument = expectIdentifier();
                    parsed = new ChainExpression();
                    {
                        chainCallExpression = current,
                            //  body = parseExpression(current, precedence + 1)
                        ;
                    }
                    ;
                    continue;
                }
                case tokenType_1.TokenType.:
                    lexer.read();
                    parsed = new IsExpression();
                    {
                        leftOperand = parsed,
                            rightOperand = parseExpression(precedence + 1);
                    }
                    ;
                    continue;
                case tokenType_1.TokenType.:
                    lexer.read();
                    parsed = new AsExpression();
                    {
                        leftOperand = parsed,
                            rightOperand = parseExpression(precedence + 1);
                    }
                    ;
                    continue;
                case tokenType_1.TokenType.rangeTo: {
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
                        parsed = new BinaryExpression();
                        {
                            leftOperand = parsed,
                            ;
                            type,
                                rightOperand = parseExpression(precedence + 1);
                        }
                        ;
                        continue;
                    }
                    return parsed;
            }
        }
        return parsed;
    };
    Parser.prototype.parseExpression = function () {
        var result = this.parseAssignmentExpressionOrHigher();
        while (this.readToken(tokenType_1.TokenType.comma)) {
            result = this.makeBinaryExpression(result, tokenType_1.TokenType.comma, this.lexer.tokenStart - 1, this.parseAssignmentExpressionOrHigher());
        }
        return result;
    };
    return Parser;
}());
exports.Parser = Parser;
{
    // SourceUnit :
    //   ImportDirectiveList? MemberDefinitionList?
    // ImportDirectiveList :
    //   ImportDirective ...
    // 解析导入指令。
    target.importDirectives = parseImportDirectiveList();
    // 解析其它成员。
    parseMemberContainerDefinitionBody(target, false);
}
ImportDirective;
parseImportDirectiveList();
{
    // ImportDirective :
    //   import Type ;
    //   import Identifier = Type ;
    //   import Type => Identifier ;
    ImportDirective;
    first = null, last = null;
    while (readToken(tokenType_1.TokenType.import)) {
        var current = new ImportDirective();
        current.value = parseType();
        switch (lexer.peek().type) {
            case tokenType_1.TokenType.assign:
                lexer.read();
                current.alias = toIdentifier(current.value);
                current.value = parseType();
                break;
            case tokenType_1.TokenType.assignTo:
                lexer.read();
                current.alias = expectIdentifier();
                break;
        }
        expectSemicolon();
        if (first == null) {
            last = first = current;
        }
        else {
            last = last.next = current;
        }
    }
    return first;
}
void parseMemberContainerDefinitionBody(MemberContainerDefinition, target, bool, expectRBrack);
{
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
    MemberDefinition;
    last = null;
    while (true) {
        MemberDefinition;
        current;
        Expression;
        returnType;
        var docComment = parseDocComment();
        var annotations = parseMemberAnnotationList();
        var modifiers = parseModifiers();
        var type = lexer.peek().type;
        // int xxx...
        if (type.isPredefinedType()) {
            returnType = parsePredefinedType();
            goto;
            parseTypeMember;
        }
        switch (type) {
        }
        region;
        标识符;
        tokenType_1.TokenType.identifier;
        var currentIdentifier = parseIdentifier();
        // A()
        if (lexer.peek().type == tokenType_1.TokenType.lParam) {
            current = parseConstructor(docComment, annotations, modifiers, currentIdentifier);
            goto;
            parseSuccess;
        }
        returnType = parseType(currentIdentifier, TypeUsage.type);
        goto;
        parseTypeMember;
        endregion;
        region;
        关键字开头的成员定义;
        tokenType_1.TokenType.;
        current = parseNamespaceDefinition(docComment, annotations, modifiers);
        goto;
        parseSuccess;
        tokenType_1.TokenType.;
        current = parseClassDefinition(docComment, annotations, modifiers);
        goto;
        parseSuccess;
        tokenType_1.TokenType.;
        current = parseStructDefinition(docComment, annotations, modifiers);
        goto;
        parseSuccess;
        tokenType_1.TokenType.;
        current = parseInterfaceDefinition(docComment, annotations, modifiers);
        goto;
        parseSuccess;
        tokenType_1.TokenType.;
        var ;
        (function () {
        })( || ( = {}));
        current = parseEnumDefinition(docComment, annotations, modifiers);
        goto;
        parseSuccess;
        tokenType_1.TokenType.extend;
        current = parseExtensionDefinition(docComment, annotations, modifiers);
        goto;
        parseSuccess;
        tokenType_1.TokenType.func;
        current = parseFuncDefinition(docComment, annotations, modifiers);
        goto;
        parseSuccess;
        endregion;
        region;
        结束符;
        tokenType_1.TokenType.rBrace;
        lexer.read();
        if (expectRBrack) {
            return;
        }
        Compiler.error(ErrorCode.unexpectedRBrace, "语法错误：多余的“}”", lexer.current);
        continue;
        tokenType_1.TokenType.eof;
        if (expectRBrack) {
            expectToken(tokenType_1.TokenType.rBrace, ErrorCode.expectedRBrace);
        }
        return;
        endregion;
        region;
        错误;
        tokenType_1.TokenType.import;
        Compiler.error(ErrorCode.unexpectedImportDirective, "“import”指令只能在文件顶部使用", lexer.peek());
        // 忽略之后的所有 import 语句。
        skipToMemberDefinition();
        continue;
        tokenType_1.TokenType.semicolon;
        Compiler.error(ErrorCode.unexpectedSemicolon, "语法错误：多余的“;”", lexer.peek());
        lexer.read();
        continue;
        Compiler.error(ErrorCode.unexpectedStatement, "语法错误：应输入函数、类或其它成员定义；所有语句都应放在函数内", lexer.peek());
        skipToMemberDefinition();
        continue;
        endregion;
    }
    parseTypeMember: 
    // 当前接口的显示声明。
    Expression;
    explicitType = null;
    parseNextTypeMember: switch (lexer.peek().type) {
    }
    region;
    Type;
    name;
    tokenType_1.TokenType.identifier;
    Identifier;
    currentIdentifier = parseIdentifier();
    switch (lexer.peek().type) {
        // Type name()
        case tokenType_1.TokenType.lParam:
            current = parseMethodDefinition(docComment, annotations, modifiers, returnType, explicitType, currentIdentifier);
            goto;
            parseSuccess;
        // Type name {get; set;}
        case tokenType_1.TokenType.lBrace:
            current = parsePropertyDefinition(docComment, annotations, modifiers, returnType, explicitType, currentIdentifier);
            goto;
            parseSuccess;
        // Type InterfaceType.name()
        case tokenType_1.TokenType.period:
            explicitType = explicitType == null ? (Expression) : currentIdentifier;
            new MemberCallExpression();
            {
                target = explicitType,
                    argument = currentIdentifier;
            }
            ;
            lexer.read();
            goto;
            parseNextTypeMember;
        // Type name<T>()
        case tokenType_1.TokenType.lt:
            if (followsWithTypeMemberDefinition()) {
                var currentType = parseGenericTypeExpression(currentIdentifier, TypeUsage.type);
                explicitType = explicitType == null ? (Expression) : currentType;
                new MemberCallExpression();
                {
                    target = explicitType,
                        argument = currentType;
                }
                ;
                lexer.read();
                goto;
                parseNextTypeMember;
            }
            current = parseMethodDefinition(docComment, annotations, modifiers, returnType, explicitType, currentIdentifier);
            goto;
            parseSuccess;
        // Type name;
        // Type name = Value;
        // Type name, name2;
        default:
            current = parseFieldDefinition(docComment, annotations, modifiers, returnType, explicitType, currentIdentifier);
            goto;
            parseSuccess;
    }
    endregion;
    region;
    Type;
    this;
    tokenType_1.TokenType.;
    lexer.read();
    // Type this [params] {}
    if (lexer.peek().type == tokenType_1.TokenType.lBrack) {
        current = parseIndexerOperatorDefinition(docComment, annotations, modifiers, returnType, explicitType);
        goto;
        parseSuccess;
    }
    // Type this +(params) {}
    if (lexer.peek().type.isOverloadableOperator()) {
        current = parseOperatorOverloadDefinition(docComment, annotations, modifiers, returnType, explicitType);
        goto;
        parseSuccess;
    }
    Compiler.error(ErrorCode.invalidOperatorOverload, String.Format("“{0}”不是可重载的操作符", lexer.peek().type.getName()), lexer.peek());
    skipToMemberDefinition();
    continue;
    endregion;
    expectIdentifier();
    skipToMemberDefinition();
    continue;
}
parseSuccess: if (target.members == null) {
    last = target.members = current;
}
else if (current != null) {
    last = last.next = current;
}
/**
 * 判断之后是否存在函数名。
 */
    * /returns>;
bool;
followsWithTypeMemberDefinition();
{
    lexer.mark();
    lexer.markRead();
    // 忽略之后的泛型参数。
    while (true) {
        switch (lexer.markRead().type) {
            case tokenType_1.TokenType.gt:
                // 如果紧跟 . 说明这是实体泛型。
                return lexer.markRead().type == tokenType_1.TokenType.period;
            case tokenType_1.TokenType.lt:
                return true;
            case tokenType_1.TokenType.colon:
            case tokenType_1.TokenType.eof:
                return false;
        }
    }
}
DocComment;
parseDocComment();
{
    return lexer.peek().docComment;
}
MemberDefinition.MemberAnnotation;
parseMemberAnnotationList();
{
    // MemberAnnotationList :
    //   MemberDefinition.MemberAnnotation ...
    // MemberDefinition.MemberAnnotation :
    //   @ Type FuncCallArguments?
    MemberDefinition.MemberAnnotation;
    first = null, last = null;
    int;
    count = 0;
    while (readToken(tokenType_1.TokenType.at)) {
        var current = new MemberDefinition.MemberAnnotation();
        current.target = parseType();
        if (lexer.peek().type == tokenType_1.TokenType.lParam) {
            current.arguments = parseArgumentList(tokenType_1.TokenType.rParam, ErrorCode.expectedRParam);
        }
        if (first == null) {
            last = first = current;
        }
        else {
            last = last.next = current;
        }
        if (++count > 250) {
            Compiler.error(ErrorCode.tooManyAnnoatation, "注解太多；一个成员最多只能包含 250 个注解", lexer.current);
        }
    }
    return first;
}
Modifiers;
parseModifiers();
{
    Modifiers;
    result = Modifiers.none;
    while (lexer.peek().type.isModifier()) {
        Modifiers;
        current;
        switch (lexer.read().type) {
            case tokenType_1.TokenType.:
                current_1 = Modifiers.;
                ;
                break;
            case tokenType_1.TokenType.:
                current_1 = Modifiers.;
                ;
                break;
            case tokenType_1.TokenType.:
                current_1 = Modifiers.;
                ;
                break;
            case tokenType_1.TokenType.:
                current_1 = Modifiers.;
                ;
                break;
            case tokenType_1.TokenType.:
                current_1 = Modifiers.;
                ;
                break;
            case tokenType_1.TokenType.:
                current_1 = Modifiers.;
                ;
                break;
            case tokenType_1.TokenType.:
                current_1 = Modifiers.;
                ;
                break;
            case tokenType_1.TokenType.:
                current_1 = Modifiers.;
                ;
                break;
            case tokenType_1.TokenType.:
                var current_1 = Modifiers.;
                var ;
                break;
            case tokenType_1.TokenType.final:
                current_1 = Modifiers.final;
                break;
            case tokenType_1.TokenType.:
                current_1 = Modifiers.;
                ;
                break;
            case tokenType_1.TokenType.:
                current_1 = Modifiers.;
                ;
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
MethodDefinition;
parseMethodDefinition(DocComment, docComment, MemberDefinition.MemberAnnotation, annotations, Modifiers, modifiers, Expression, returnType, Expression, explicitType, Identifier, name);
{
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
    if (readToken(tokenType_1.TokenType.lt)) {
        result.genericParameters = parseGenericParameterList();
    }
    result.parameters = parseParameterList(tokenType_1.TokenType.lParam, tokenType_1.TokenType.rParam, ErrorCode.expectedRParam);
    result.body = parseMethodBody();
    return result;
}
Teal.Compiler.MemberDefinition.GenericParameter;
parseGenericParameterList();
{
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
    Teal.Compiler.MemberDefinition.GenericParameter;
    first = null, last = null;
    int;
    count = 0;
    do {
        var current = new Teal.Compiler.MemberDefinition.GenericParameter();
        if (!readToken(tokenType_1.TokenType.ellipsis)) {
            current.name = expectIdentifier();
            if (readToken(tokenType_1.TokenType.colon)) {
                current.constraints = new List();
                bool;
                hasParam = readToken(tokenType_1.TokenType.lParam);
                int;
                j = 0;
                do {
                    Expression;
                    type;
                    switch (lexer.peek().type) {
                        case tokenType_1.TokenType.:
                            type = new MemberDefinition.GenericParameter.ClassConstraintExpression();
                            {
                                startLocation = lexer.read().startLocation;
                            }
                            ;
                            break;
                        case tokenType_1.TokenType.:
                            type = new MemberDefinition.GenericParameter.StructConstraintExpression();
                            {
                                startLocation = lexer.read().startLocation;
                            }
                            ;
                            break;
                        case tokenType_1.TokenType.:
                            var ;
                            (function () {
                            })( || ( = {}));
                            type = new MemberDefinition.GenericParameter.EnumConstraintExpression();
                            {
                                startLocation = lexer.read().startLocation;
                            }
                            ;
                            break;
                        case tokenType_1.TokenType.:
                            type = new MemberDefinition.GenericParameter.NewableConstraintExpression();
                            {
                                startLocation = lexer.read().startLocation,
                                ;
                            }
                            ;
                            expectToken(tokenType_1.TokenType.lParam, ErrorCode.expectedLParam);
                            expectToken(tokenType_1.TokenType.rParam, ErrorCode.expectedRParam);
                            type.endLocation = lexer.current.endLocation;
                            break;
                        case tokenType_1.TokenType.rParam:
                            goto;
                            end;
                        default:
                            type = parseType();
                            break;
                    }
                    current.constraints.Add(type);
                    if (!hasParam) {
                        goto;
                        end;
                    }
                    if (++j > 250) {
                        Compiler.error(ErrorCode.tooManyGenericConstraints, "泛型约束太多；一个泛型参数最多只能包含 250 个约束", lexer.current);
                    }
                } while (readToken(tokenType_1.TokenType.comma));
                expectToken(tokenType_1.TokenType.rParam, ErrorCode.expectedRParam);
            }
        }
        end: if (last == null) {
            last = first = current;
        }
        else {
            last = last.next = current;
        }
        if (++count > 250) {
            Compiler.error(ErrorCode.tooManyGenericTypeParameters, "泛型参数太多；一个成员最多只能包含 250 个泛型参数", lexer.current);
        }
    } while (readToken(tokenType_1.TokenType.comma));
    expectToken(tokenType_1.TokenType.gt, ErrorCode.expectedGt);
    return first;
}
Teal.Compiler.MemberDefinition.Parameter;
parseParameterList(tokenType_1.TokenType, startToken, tokenType_1.TokenType, stopToken, ErrorCode, errorCode);
{
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
        Teal.Compiler.MemberDefinition.Parameter;
        first = null;
        Variable;
        last = first;
        do {
            if (readToken(stopToken)) {
                return first;
            }
            var current = new Teal.Compiler.MemberDefinition.Parameter();
            current.variableType = VariableType.inParameter;
            switch (lexer.peek().type) {
                case tokenType_1.TokenType.:
                    current.variableType = VariableType.refParameter;
                    lexer.read();
                    parseRestParameterModifiers();
                    goto;
                default: ;
                case tokenType_1.TokenType.:
                    current.variableType = VariableType.paramsParameter;
                    lexer.read();
                    parseRestParameterModifiers();
                    goto;
                default: ;
                case tokenType_1.TokenType.:
                    current.variableType = VariableType.outParameter;
                    lexer.read();
                    parseRestParameterModifiers();
                    goto;
                default: ;
                case tokenType_1.TokenType.ellipsis:
                    current.variableType = VariableType.argListParameter;
                    current.name = new Identifier();
                    {
                        startLocation = lexer.read().startLocation,
                            value = "...",
                            endLocation = lexer.current.endLocation;
                    }
                    ;
                    break;
                default:
                    current.type = parseType();
                    current.name = expectIdentifier();
                    // 读取参数默认值。
                    if (readToken(tokenType_1.TokenType.assign)) {
                        current.initialiser = parseExpression();
                        if (current.variableType != VariableType.inParameter) {
                            Compiler.error(ErrorCode.invalidDefaultParameter, String.Format("含有其它修饰符的参数不允许有默认值"), current.initialiser);
                        }
                    }
                    break;
            }
            if (last == null) {
                last = first = current;
            }
            else {
                last = last.next = current;
            }
        } while (readToken(tokenType_1.TokenType.comma));
        expectToken(stopToken, errorCode);
        return first;
    }
    expectToken(startToken, errorCode);
    return null;
}
void parseRestParameterModifiers();
{
    switch (lexer.peek().type) {
        case tokenType_1.TokenType.: 
        case tokenType_1.TokenType.: 
        case tokenType_1.TokenType.:
            lexer.read();
            Compiler.error(ErrorCode.tooManyParameterModifiers, String.Format("参数修饰符太多；应删除“{0}”", lexer.peek().type.getName()), lexer.current);
            parseRestParameterModifiers();
            break;
    }
}
ToplevelBlock;
parseMethodBody();
{
    // MethodBody :
    //   Block
    //   ;
    if (readToken(tokenType_1.TokenType.lBrace)) {
        var result = new ToplevelBlock();
        result.startLocation = lexer.current.startLocation;
        parseBlockBody(result);
        return result;
    }
    expectSemicolon();
    return null;
}
ConstructorDefinition;
parseConstructor(DocComment, docComment, MemberDefinition.MemberAnnotation, annotations, Modifiers, modifiers, Identifier, name);
{
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
    result.parameters = parseParameterList(tokenType_1.TokenType.lParam, tokenType_1.TokenType.rParam, ErrorCode.expectedRParam);
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
PropertyDefinition;
parsePropertyDefinition(DocComment, docComment, MemberDefinition.MemberAnnotation, annotations, Modifiers, modifiers, Expression, returnType, Expression, explicitType, Identifier, name);
{
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
IndexerDefinition;
parseIndexerOperatorDefinition(DocComment, docComment, MemberDefinition.MemberAnnotation, annotations, Modifiers, modifiers, Expression, returnType, Expression, explicitType);
{
    // IndexerOperatorDefinition :
    //   Annotations? Modifiers? Type this [ ParameterList ] { PropertyAccessorList }
    var result = new IndexerDefinition();
    result.docComment = docComment;
    result.annotations = annotations;
    result.modifiers = modifiers;
    result.returnType = returnType;
    result.explicitType = explicitType;
    result.parameters = parseParameterList(tokenType_1.TokenType.lBrack, tokenType_1.TokenType.rBrack, ErrorCode.expectedRBrack);
    parsePropertyBody(result);
    return result;
    throw new Unreachable();
}
void parsePropertyBody(PropertyOrIndexerDefinition, target);
{
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
            if (!readToken(tokenType_1.TokenType.identifier)) {
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
            }
            else if (current.name.value == "set") {
                if (target.setAccessor != null) {
                    Compiler.error(ErrorCode.dumpGetOrSet, "set 访问器重复", lexer.current);
                }
                target.setAccessor = current;
            }
            else {
                Compiler.error(ErrorCode.expectedGetOrSet, "语法错误：应输入“get”或“set”", lexer.current);
            }
            current.body = parseMethodBody();
        } while (!readToken(tokenType_1.TokenType.rBrace));
    }
}
Modifiers;
parseAccesibilityModifiers();
{
    Modifiers;
    result = Modifiers.none;
    while (lexer.peek().type.isModifier()) {
        Modifiers;
        current;
        switch (lexer.read().type) {
            case tokenType_1.TokenType.:
                current = Modifiers.;
                ;
                break;
            case tokenType_1.TokenType.:
                current = Modifiers.;
                ;
                break;
            case tokenType_1.TokenType.:
                current = Modifiers.;
                ;
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
OperatorDefinition;
parseOperatorOverloadDefinition(DocComment, docComment, MemberDefinition.MemberAnnotation, annotations, Modifiers, modifiers, Expression, returnType, Expression, explicitType);
{
    // OperatorOverloadDefinition :
    //   Annotations? Modifiers? Type ExplicitType? OverloadableOperator ( ParameterList ) MethodBody
    var result = new OperatorDefinition();
    result.docComment = docComment;
    result.annotations = annotations;
    result.modifiers = modifiers;
    result.returnType = returnType;
    result.explicitType = explicitType;
    result.name = parseIdentifier(); // this
    result.;
    lexer.current.type;
    result.parameters = parseParameterList(tokenType_1.TokenType.lParam, tokenType_1.TokenType.rParam, ErrorCode.expectedRParam);
    result.body = parseMethodBody();
    return result;
}
FieldDefinition;
parseFieldDefinition(DocComment, docComment, MemberDefinition.MemberAnnotation, annotations, Modifiers, modifiers, Expression, type, Expression, explicitType, Identifier, currentIdentifier);
{
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
MemberDefinition;
parseFuncDefinition(DocComment, docComment, MemberDefinition.MemberAnnotation, annotations, Modifiers, modifiers);
{
    // FuncDefinition :
    //    Annotations? Modifiers? func Identifier ( ParameterList? ) MethodBody
    var result = new MethodDefinition();
    lexer.read(); // func
    result.name = expectIdentifier();
    expectToken(tokenType_1.TokenType.lParam, ErrorCode.expectedLParam);
    Variable;
    last = null;
    do {
        if (lexer.peek().type == tokenType_1.TokenType.rParam) {
            break;
        }
        var current = new MethodDefinition.Parameter();
        current.name = expectIdentifier();
        if (readToken(tokenType_1.TokenType.assign)) {
            current.initialiser = parseExpression();
        }
        if (last == null) {
            last = result.parameters = current;
        }
        else {
            last = last.next = current;
        }
    } while (readToken(tokenType_1.TokenType.comma));
    expectToken(tokenType_1.TokenType.rParam, ErrorCode.expectedRParam);
    result.body = parseMethodBody();
    return result;
}
NamespaceDefinition;
parseNamespaceDefinition(DocComment, docComment, MemberDefinition.MemberAnnotation, annotations, Modifiers, modifiers);
{
    // NamespaceDefinition :
    //   Annotations? Modifiers? namespace IdentifierList  { MemberDefinitionList? }
    if (annotations != null) {
    }
    if (modifiers != Modifiers.none) {
        Compiler.error(ErrorCode.unexpectedModifiers, "命名空间不允许有修饰符", lexer.current);
    }
    var result = new NamespaceDefinition();
    result.docComment = docComment;
    lexer.read(); // namespace
    result.name = expectIdentifier();
    if (readToken(tokenType_1.TokenType.period)) {
        result.names = new List();
        {
            result.name;
        }
        ;
        do {
            result.names.Add(expectIdentifier());
        } while (readToken(tokenType_1.TokenType.period));
    }
    if (expectLBrace()) {
        parseMemberContainerDefinitionBody(result, true);
    }
    return result;
}
ClassDefinition;
parseClassDefinition(DocComment, docComment, MemberDefinition.MemberAnnotation, annotations, Modifiers, modifiers);
{
    // ClassDefinition :
    //   Annotations? Modifiers? class Identifier GenericParameterList? BaseTypeList? { MemberDefinitionList? }
    // BaseTypeList :
    //   : TypeList
    var result = new ClassDefinition();
    parseTypeDefinitionBody(result, docComment, annotations, modifiers);
    return result;
}
StructDefinition;
parseStructDefinition(DocComment, docComment, MemberDefinition.MemberAnnotation, annotations, Modifiers, modifiers);
{
    // StructDefinition :
    //   Annotations? Modifiers? struct Identifier GenericParameterList? BaseTypeList? { MemberDefinitionList? }
    var result = new StructDefinition();
    parseTypeDefinitionBody(result, docComment, annotations, modifiers);
    return result;
}
InterfaceDefinition;
parseInterfaceDefinition(DocComment, docComment, MemberDefinition.MemberAnnotation, annotations, Modifiers, modifiers);
{
    // InterfaceDefinition :
    //  Annotations? Modifiers? interface Identifier GenericParameterList? BaseTypeList? { MemberDefinitionList? }
    var result = new InterfaceDefinition();
    parseTypeDefinitionBody(result, docComment, annotations, modifiers);
    return result;
}
void parseTypeDefinitionBody(TypeDefinition, target, DocComment, docComment, MemberDefinition.MemberAnnotation, annotations, Modifiers, modifiers);
{
    target.docComment = docComment;
    target.annotations = annotations;
    target.modifiers = modifiers;
    lexer.read(); // class | struct | interface
    target.name = expectIdentifier();
    if (readToken(tokenType_1.TokenType.lt)) {
        target.genericParameters = parseGenericParameterList();
    }
    if (readToken(tokenType_1.TokenType.colon)) {
        target.baseTypes = parseBaseTypeList();
    }
    if (expectLBrace()) {
        parseMemberContainerDefinitionBody(target, true);
    }
}
ExtensionDefinition;
parseExtensionDefinition(DocComment, docComment, MemberDefinition.MemberAnnotation, annotations, Modifiers, modifiers);
{
    // ExtensionDefinition :
    //   Annotations? Modifiers? extend Type BaseTypeList? { MemberDefinitionList? }
    var result = new ExtensionDefinition();
    result.docComment = docComment;
    result.annotations = annotations;
    result.modifiers = modifiers;
    result.name = parseIdentifier(); // extend
    result.targetType = parseType();
    if (readToken(tokenType_1.TokenType.colon)) {
        result.baseTypes = parseBaseTypeList();
    }
    if (expectLBrace()) {
        parseMemberContainerDefinitionBody(result, true);
    }
    return result;
}
EnumDefinition;
parseEnumDefinition(DocComment, docComment, MemberDefinition.MemberAnnotation, annotations, Modifiers, modifiers);
{
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
    if (readToken(tokenType_1.TokenType.colon)) {
        result.baseTypes = parseBaseTypeList();
    }
    if (expectLBrace()) {
        MemberDefinition;
        last = null;
        do {
            if (readToken(tokenType_1.TokenType.rBrace)) {
                return result;
            }
            var current = new EnumMemberDefinition();
            current.docComment = parseDocComment();
            current.annotations = parseMemberAnnotationList();
            current.name = expectIdentifier();
            if (readToken(tokenType_1.TokenType.assign)) {
                current.initializer = parseExpression();
            }
            if (result.members == null) {
                last = result.members = current;
            }
            else {
                last = last.next = current;
            }
        } while (readToken(tokenType_1.TokenType.comma));
        expectToken(tokenType_1.TokenType.rBrace, ErrorCode.expectedRBrace);
    }
    return result;
}
List < Expression > parseBaseTypeList();
{
    // TypeList :
    //   Type
    //   TypeList , Type
    List < Expression > result;
    new List();
    do {
        result.Add(parseType());
        if (result.Count > 250) {
            Compiler.error(ErrorCode.tooManyBaseTypes, "基类型太多；类类型不得超过 250 个", lexer.current);
        }
    } while (readToken(tokenType_1.TokenType.comma));
    return result;
}
endregion;
region;
解析语句;
void parseBlockBody(Block, target);
{
    // StatementList :
    //   Statement ...
    var statements = target.statements = new List();
    while (true) {
        switch (lexer.peek().type) {
            case tokenType_1.TokenType.rBrace:
                target.endLocation = lexer.read().endLocation;
                return;
            case tokenType_1.TokenType.eof:
                expectToken(tokenType_1.TokenType.rBrace, ErrorCode.expectedRBrace);
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
    * name;
"parsedType" > /param>
    * /returns>;
Statement;
parseVariableOrExpressionStatement(Expression, parsedType);
{
    // Type Identifier;
    if (lexer.peek().type == tokenType_1.TokenType.identifier) {
        return parseVariableStatement(parsedType, parseIdentifier());
    }
    //// Type.A;
    //return parseExpressionStatement(parsedType);
    throw new Unreachable();
}
VariableStatement;
parseVariableStatement(Expression, parsedType, Identifier, parsedIdentifier);
{
    var result = new VariableStatement();
    result.startLocation = parsedType.startLocation;
    result.variables = parseVariableList(parsedType, parsedIdentifier);
    expectSemicolon();
    return result;
}
VariableStatement;
parseVariableStatement(VariableType, variableType);
{
    // VariableStatement :
    //   Type VariableList
    //   const Type? VariableList
    console.assert(lexer.peek().type == tokenType_1.TokenType.);
    var ;
    VariableStatement;
    result = new VariableStatement();
    result.startLocation = lexer.read().startLocation; //  const
    // 读取类型。
    var parsedType = parseType();
    if (lexer.peek().type == tokenType_1.TokenType.identifier) {
        result.variables = parseVariableList(parsedType, parseIdentifier());
    }
    else {
        result.variables = parseVariableList(null, toIdentifier(parsedType));
    }
    for (var variable = result.variables; variable != null; variable = variable.next) {
        variable.variableType = variableType;
    }
    expectSemicolon();
    return result;
}
Variable;
parseVariableList(Expression, type, Identifier, currentIdentifier);
{
    // VariableList :
    //   Variable
    //   VariableList , Variable
    var first = parseVariable(type, currentIdentifier);
    var last = first;
    while (readToken(tokenType_1.TokenType.comma)) {
        last = last.next = parseVariable(type, expectIdentifier());
    }
    return first;
}
Variable;
parseVariable(Expression, type, Identifier, name);
{
    // Variable :
    //   name
    //   name = Expression
    var result = new Variable();
    result.type = type;
    result.name = name;
    if (readToken(tokenType_1.TokenType.assign)) {
        result.initialiser = parseExpression();
    }
    result.endLocation = lexer.current.endLocation;
    return result;
}
/**
 * 解析变量定义或其他表达式。
 */
    * /returns>;
Node;
parseVariableOrExpression();
{
    switch (lexer.peek().type) {
        case tokenType_1.TokenType.identifier:
            var parsedType = parseTypeExpression(parseIdentifier(), TypeUsage.declartion);
            // 标识符后不是标识符，说明当前标识符就是需要的标识符。
            if (lexer.peek().type == tokenType_1.TokenType.identifier) {
                return parseVariableList(parsedType, parseIdentifier());
            }
            return parseExpression(parsedType);
        default:
            if (lexer.peek().type.isPredefinedType()) {
                var parsedType2 = parsePredefinedType();
                // 标识符后不是标识符，说明当前标识符就是需要解析的标识符。
                if (lexer.peek().type == tokenType_1.TokenType.identifier) {
                    return parseVariableList(parsedType2, parseIdentifier());
                }
                return parseExpression(parsedType2);
            }
            return parseExpression();
    }
}
Statement;
parseEmbeddedStatement();
{
    // EmbeddedStatement :
    //   Statement except VariableStatement and LabeledStatement 
    var result = parseStatement();
    if (result == null) {
        Compiler.error(ErrorCode.expectedStatement, "语法错误：应输入语句", lexer.peek());
    }
    else if (result)
        is;
    VariableStatement;
    {
        Compiler.error(ErrorCode.invalidVariableStatement, "嵌套语句不能是变量声明语句；应使用“{}”包围", ((VariableStatement)), result).type;
        ;
    }
    if (result)
        is;
    LabeledStatement;
    {
        Compiler.error(ErrorCode.invalidLabeledStatement, "嵌套语句不能是标签语句；应使用“{}”包围", ((LabeledStatement)), result).label;
        ;
    }
    if (result)
        is;
    Semicolon && lexer.peek().type == tokenType_1.TokenType.lBrace;
    {
        Compiler.warning(ErrorCode.confusedSemicolon, "此分号可能是多余的", lexer.current.startLocation, lexer.current.endLocation);
    }
    return result;
}
Block;
parseBlock();
{
    // Block :
    //   { StatementList? }
    console.assert(lexer.peek().type == tokenType_1.TokenType.lBrace);
    var result = new Block();
    result.startLocation = lexer.read().startLocation; // {
    parseBlockBody(result);
    return result;
}
ExpressionStatement;
parseExpressionStatement();
{
    // ExpressionStatement :
    //   Expression ;
    //var result = new ExpressionStatement();
    //result.body = parseExpression();
    //expectSemicolon();
    //result.endLocation = lexer.current.endLocation;
    //return result;
    throw new Unreachable();
}
ExpressionStatement;
parseExpressionStatement(Expression, parsed);
{
    // ExpressionStatement :
    //   Expression ;
    //var result = new ExpressionStatement();
    //result.body = parseExpression(parsed);
    //expectSemicolon();
    //result.endLocation = lexer.current.endLocation;
    //return result;
    throw new Unreachable();
}
ThrowStatement;
parseThrowStatement();
{
    // ThrowStatement :
    //   throw Expression? ;
    console.assert(lexer.peek().type == tokenType_1.TokenType.);
    throw ;
    ;
    var result = new ThrowStatement();
    result.startLocation = lexer.read().startLocation; // throw
    if (followsWithExpression()) {
        result.value = parseExpression();
    }
    expectSemicolon();
    result.endLocation = lexer.current.endLocation;
    return result;
}
YieldStatement;
parseYieldStatement();
{
    // YieldStatement :
    //   yield Expression ;
    console.assert(lexer.peek().type == tokenType_1.TokenType.);
    ;
    YieldStatement;
    result = new YieldStatement();
    result.startLocation = lexer.read().startLocation; // yield
    result.value = parseExpression();
    expectSemicolon();
    result.endLocation = lexer.current.endLocation;
    return result;
}
Statement;
parseGotoStatement();
{
    // GotoStatement :
    //   goto Identifier ;
    console.assert(lexer.peek().type == tokenType_1.TokenType.);
    ;
    var startLocation = lexer.read().startLocation; // goto
    Statement;
    result;
    switch (lexer.peek().type) {
        case tokenType_1.TokenType.identifier:
            result = new GotoLabelStatement();
            {
                startLocation = startLocation,
                    target = parseIdentifier();
            }
            ;
            break;
        case tokenType_1.TokenType.: 
        case :
            lexer.read();
            result = new GotoCaseStatement();
            {
                target = readToken(tokenType_1.TokenType.);
                null;
                parseExpression();
            }
            ;
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
BreakStatement;
parseBreakStatement();
{
    // BreakStatement :
    //   break ;
    console.assert(lexer.peek().type == tokenType_1.TokenType.);
    break ;
    ;
    var result = new BreakStatement();
    result.startLocation = lexer.read().startLocation; // break
    expectSemicolon();
    result.endLocation = lexer.current.endLocation;
    return result;
}
ContinueStatement;
parseContinueStatement();
{
    // ContinueStatement :
    //   continue ;
    console.assert(lexer.peek().type == tokenType_1.TokenType.);
    continue ;
    ;
    var result = new ContinueStatement();
    result.startLocation = lexer.read().startLocation; // continue
    expectSemicolon();
    result.endLocation = lexer.current.endLocation;
    return result;
}
ReturnStatement;
parseReturnStatement();
{
    // ReturnStatement :
    //   return Expression? ;
    console.assert(lexer.peek().type == tokenType_1.TokenType.);
    return ;
    ;
    var result = new ReturnStatement();
    result.startLocation = lexer.read().startLocation;
    if (followsWithExpression()) {
        result.value = parseExpression();
    }
    expectSemicolon();
    result.endLocation = lexer.current.endLocation;
    return result;
}
TryStatement;
parseTryStatement();
{
    // TryStatement :
    //   try EmbeddedStatement CatchClauseList
    //   try EmbeddedStatement CatchClauseList? finally EmbeddedStatement
    // CatchClauseList :
    //   CatchClause ...
    // CatchClause :
    //   catch EmbeddedStatement
    //   catch ( Type ) EmbeddedStatement
    //   catch ( Type Identifier ) EmbeddedStatement
    console.assert(lexer.peek().type == tokenType_1.TokenType.);
    try { }
    finally { }
    ;
    var result = new TryStatement();
    result.startLocation = lexer.read().startLocation; // try
    result.tryClause = parseEmbeddedStatement();
    TryStatement.CatchClause;
    last = null;
    while (readToken(tokenType_1.TokenType.))
    try { }
    catch () { }
    {
        var current = new TryStatement.CatchClause();
        current.startLocation = lexer.current.startLocation;
        if (readToken(tokenType_1.TokenType.lParam)) {
            current.variable = new Variable();
            current.variable.type = parseType();
            if (!readToken(tokenType_1.TokenType.rParam)) {
                current.variable.name = expectIdentifier();
                expectToken(tokenType_1.TokenType.rParam, ErrorCode.expectedRParam);
            }
        }
        current.body = parseEmbeddedStatement();
        if (result.catchClauses == null) {
            last = result.catchClauses = current;
        }
        else {
            last = last.next = current;
        }
    }
    if (readToken(tokenType_1.TokenType.))
    try { }
    finally { }
    {
        result.finallyClause = parseEmbeddedStatement();
    }
    return result;
}
WithStatement;
parseWithStatement();
{
    // WithStatement :
    //   with EmabedVariableDeclaration EmbeddedStatement
    console.assert(lexer.peek().type == tokenType_1.TokenType.);
    with ()
        ;
    var result = new WithStatement();
    result.startLocation = lexer.read().startLocation;
    bool;
    foundParams = readToken(tokenType_1.TokenType.lParam);
    if (!foundParams && Compiler.options.disallowMissingParentheses) {
        Compiler.error(ErrorCode.strictExpectedParentheses, "严格模式: 应输入“(”", lexer.current);
    }
    result.target = parseVariableOrExpression();
    if (foundParams) {
        expectToken(tokenType_1.TokenType.rParam, ErrorCode.expectedRParam);
    }
    result.body = parseEmbeddedStatement();
    return result;
}
endregion;
region;
解析表达式
    * /returns>;
Identifier;
parseIdentifier();
{
    return new Identifier();
    {
        startLocation = lexer.read().startLocation,
            value = lexer.current.buffer.ToString(),
            endLocation = lexer.current.endLocation;
    }
    ;
}
/**
 * 解析一个魔法变量。
 */
    * /returns>;
MagicVariable;
parseMagicVariable();
{
    // MagicVariable :
    //   @ Identifier
    console.assert(lexer.peek().type == tokenType_1.TokenType.);
    ;
    var result = new MagicVariable();
    result.startLocation = lexer.read().startLocation; // @
    result.value = expectIdentifier().value;
    result.endLocation = lexer.current.endLocation;
    return result;
}
Expression;
parseCondition();
{
    // Condition :
    //   ( BooleanExpression )
    //if (!Compiler.options.disallowMissingParentheses && this.lexer.peek().type != TokenType.openParen) {
    //    result.condition = parseExpression();
    //} else {
    //    expectToken(TokenType.openParen);
    //    result.condition = parseExpression();
    //    expectToken(TokenType.closeParen);
    //}
    Expression;
    result;
    if (readToken(tokenType_1.TokenType.lParam)) {
        result = parseExpression(0);
        expectToken(tokenType_1.TokenType.rParam, ErrorCode.expectedRParam);
    }
    else {
        if (Compiler.options.disallowMissingParentheses) {
            Compiler.error(ErrorCode.strictExpectedParentheses, "严格模式: 应输入“(”", lexer.current);
        }
        result = parseExpression();
    }
    return result;
}
Expression;
parseIntOrLongLiteral(long, value);
{
    if (value <= int.MaxValue) {
        return new IntLiteral();
        {
            startLocation = lexer.read().startLocation,
                value = (int);
            value,
                endLocation = lexer.current.endLocation;
        }
        ;
    }
    return new LongLiteral();
    {
        startLocation = lexer.read().startLocation,
            value = value,
            endLocation = lexer.current.endLocation;
    }
    ;
}
Expression;
parseListOrDictLiteral(tokenType_1.TokenType, stopBrack, ErrorCode, errorCode);
{
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
    console.assert(lexer.peek().type == (stopBrack == tokenType_1.TokenType.rBrace ? tokenType_1.TokenType. : ));
    tokenType_1.TokenType.lBrack;
    ;
    var startLocation = lexer.read().startLocation; // [
    var type = lexer.current.type;
    // [:], {:}
    if (readToken(tokenType_1.TokenType.colon)) {
        expectToken(stopBrack, errorCode);
        return new DictLiteral();
        {
            startLocation = startLocation,
                type = type,
                endLocation = lexer.current.endLocation;
        }
        ;
    }
    // [], {}
    if (readToken(stopBrack)) {
        return new ListLiteral();
        {
            startLocation = startLocation,
                type = type,
                endLocation = lexer.current.endLocation;
        }
        ;
    }
    var firstKey = parseExpression();
    // [key: value], {key: value}
    if (readToken(tokenType_1.TokenType.colon)) {
        var result = new DictLiteral();
        result.startLocation = startLocation;
        result.type = type;
        var last = result.properties = new DictLiteral.Property(), _a = void 0, _b = _a.key, key = _b === void 0 ? type == tokenType_1.TokenType.lBrace ? toIdentifier(firstKey) : firstKey : _b, _c = _a.value, value = _c === void 0 ? parseExpression() : _c;
        while (readToken(tokenType_1.TokenType.comma)) {
            // ], }
            if (readToken(stopBrack)) {
                goto;
                end;
            }
            var current = new DictLiteral.Property();
            if (type == tokenType_1.TokenType.lBrace) {
                current.key = expectIdentifier();
            }
            else {
                current.key = parseExpression();
            }
            expectToken(tokenType_1.TokenType.colon, ErrorCode.expectedColon);
            current.value = parseExpression();
            last = last.next = current;
        }
        expectToken(stopBrack, errorCode);
        end: result.endLocation = lexer.current.endLocation;
        return result;
    }
    else {
        var result = new ListLiteral();
        result.startLocation = startLocation;
        result.type = type;
        result.values = new List();
        {
            firstKey;
        }
        ;
        while (readToken(tokenType_1.TokenType.comma)) {
            // ], }
            if (readToken(stopBrack)) {
                goto;
                end;
            }
            result.values.Add(parseExpression());
        }
        expectToken(stopBrack, errorCode);
        end: result.endLocation = lexer.current.endLocation;
        return result;
    }
}
FuncCallExpression.Argument;
parseArgumentList(tokenType_1.TokenType, stopBrack, ErrorCode, errorCode);
{
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
    console.assert(lexer.peek().type == (stopBrack == tokenType_1.TokenType.rParam ? tokenType_1.TokenType. : ));
    tokenType_1.TokenType.lBrack;
    ;
    lexer.read(); // [, (
    FuncCallExpression.Argument;
    first = null, last = null;
    do {
        if (readToken(stopBrack)) {
            goto;
            end;
        }
        var current = new FuncCallExpression.Argument();
        // 读取命名参数名。
        if (lexer.peek().type == tokenType_1.TokenType.identifier) {
            var currentIdentifier = parseIdentifier();
            if (readToken(tokenType_1.TokenType.colon)) {
                current.name = currentIdentifier;
                parseArgumentBody(current);
            }
            else {
                current.value = parseExpression(parseTypeExpression(currentIdentifier, TypeUsage.expression));
            }
        }
        else {
            parseArgumentBody(current);
        }
        if (last == null) {
            last = first = current;
        }
        else {
            last = last.next = current;
        }
    } while (readToken(tokenType_1.TokenType.comma));
    expectToken(stopBrack, errorCode);
    end: return first;
}
void parseArgumentBody(FuncCallExpression.Argument, target);
{
    if (readToken(tokenType_1.TokenType.))
    {
        target.type = readToken(tokenType_1.TokenType.assignTo) ? FuncCallExpression.ArgumentType.outAssignTo : FuncCallExpression.ArgumentType.;
        ;
    }
    if (readToken(tokenType_1.TokenType.))
    {
        target.type = FuncCallExpression.ArgumentType.;
        ;
    }
    target.value = parseExpression();
}
NewExpression;
parseNewExpression();
{
    // NewExpression :
    //   new FuncCallExpression NewInitilizer?
    // NewInitilizer :
    //   ArrayLiteral
    //   ObjectLiteral
    console.assert(lexer.peek().type == tokenType_1.TokenType.);
    ;
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
Expression;
parseParenthesizedExpression();
{
    // ParenthesizedExpression:
    //   ( Expression )
    console.assert(lexer.peek().type == tokenType_1.TokenType.lParam);
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
State;
followsWithLambdaOrTypeConversion();
{
    lexer.mark();
    lexer.markRead(); // (
    while (true) {
        switch (lexer.markRead().type) {
            case tokenType_1.TokenType.rParam:
                if (lexer.markRead().type == tokenType_1.TokenType.lambda) {
                    return State.on;
                }
                return lexer.markCurrent.type.isExpressionStart() ? State.off : State.unset;
            case tokenType_1.TokenType.lParam:
            case tokenType_1.TokenType.eof:
                return State.unset;
        }
    }
}
LambdaLiteral;
parseLambdaLiteral(Identifier, parsedParameter);
{
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
    console.assert(lexer.peek().type == tokenType_1.TokenType.lParam || lexer.peek().type == tokenType_1.TokenType.lambda);
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
var TypeUsage;
(function (TypeUsage) {
    TypeUsage[TypeUsage["type"] = 0] = "type";
    TypeUsage[TypeUsage["expression"] = 1] = "expression";
    TypeUsage[TypeUsage["declartion"] = 2] = "declartion";
})(TypeUsage || (TypeUsage = {}));
Expression;
parseType(TypeUsage, typeUsage = TypeUsage.type);
{
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
    if (type == tokenType_1.TokenType.identifier) {
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
    * /returns>;
Expression;
parsePredefinedType(TypeUsage, typeUsage = TypeUsage.type);
{
    // PredefinedType :
    //   int
    //   float
    //   var
    //   dynamic
    //   ...
    //   PredefinedType []
    //   PredefinedType *
    console.assert(lexer.peek().type.isPredefinedType());
    Expression;
    parsed = new PredefinedTypeLiteral();
    {
        startLocation = lexer.read().startLocation,
            type = lexer.current.type,
        ;
    }
    ;
    while (true) {
        switch (lexer.peek().type) {
            case tokenType_1.TokenType.lBrack:
                // new 表达式中不解析数组类型。
                if (typeUsage == TypeUsage.)
                {
                    goto;
                }
            default: ;
        }
        lexer.read(); // [
        //// 读取数组维数。
        //int rank = 1;
        //while (readToken(TokenType.comma))
        //    rank++;
        expectToken(tokenType_1.TokenType.rBrack, ErrorCode.expectedRBrack);
        parsed = new ArrayTypeExpression();
        {
            elementType = parsed,
                //rank = rank,
                endLocation = lexer.current.endLocation;
        }
        ;
        continue;
        tokenType_1.TokenType.mul;
        lexer.read();
        parsed = new PtrTypeExpression();
        {
            elementType = parsed,
                endLocation = lexer.current.endLocation;
        }
        ;
        continue;
        return parsed;
    }
}
/**
 * 解析以标识符开头的类型。
 */
    * name;
"parsedIdentifier" > /param>
    * /returns>;
Expression;
parseType(Identifier, parsedIdentifier, TypeUsage, typeUsage);
{
    var parsed = parseTypeExpression(parsedIdentifier, typeUsage);
    while (readToken(tokenType_1.TokenType.period)) {
        parsed = parseArrayTypeExpression(new MemberCallExpression(), {
            target: target,
            argument: argument
        }, typeUsage);
    }
    return parsed;
}
/**
 * 尝试组合当前类型为复合类型表达式。
 */
    * name;
"parsedIdentifier" > /param>
    * name;
"typeUsage" > /param>
    * /returns>;
Expression;
parseTypeExpression(Identifier, parsedIdentifier, TypeUsage, typeUsage);
{
    return parseArrayTypeExpression(parseGenericTypeExpression(parsedIdentifier, typeUsage), typeUsage);
}
/**
 * 尝试组合当前类型为数组类型。
 */
    * name;
"parsed" > /param>
    * name;
"typeUsage" > /param>
    * /returns>;
Expression;
parseArrayTypeExpression(Expression, parsed, TypeUsage, typeUsage);
{
    while (true) {
        switch (lexer.peek().type) {
            case tokenType_1.TokenType.lBrack:
                // new 表达式中不解析数组类型。
                if (typeUsage == TypeUsage.)
                {
                    return parsed;
                }
                if (typeUsage != TypeUsage.type) {
                    // 判断 [ 是索引还是数组类型。
                    lexer.mark();
                    do {
                        lexer.markRead();
                    } while (lexer.markPeek().type == tokenType_1.TokenType.comma);
                    if (lexer.markPeek().type != tokenType_1.TokenType.rBrack) {
                        goto;
                    }
                }
            default: ;
        }
    }
    lexer.read(); // [
    int;
    rank = 1;
    while (readToken(tokenType_1.TokenType.comma))
        rank++;
    expectToken(tokenType_1.TokenType.rBrack, ErrorCode.expectedRBrack);
    parsed = new ArrayTypeExpression();
    {
        elementType = parsed,
            //rank = rank,
            endLocation = lexer.current.endLocation;
    }
    ;
    continue;
    tokenType_1.TokenType.mul;
    if (typeUsage == TypeUsage.expression) {
        lexer.mark();
        lexer.markRead();
        // 如果紧跟表达式，则 * 解析为乘号。
        if (lexer.markRead().type.isExpressionStart()) {
            goto;
            ;
        }
    }
    parsed = new PtrTypeExpression();
    {
        elementType = parsed,
            endLocation = lexer.read().endLocation;
    }
    ;
    continue;
    return parsed;
}
/**
 * 尝试组合当前类型为泛型。
 */
    * name;
"parsed" > /param>
    * name;
"typeUsage" > /param>
    * /returns>;
Expression;
parseGenericTypeExpression(Identifier, parsedIdentifier, TypeUsage, typeUsage);
{
    if (lexer.peek().type == tokenType_1.TokenType.lt) {
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
        result.genericArguments = new List();
        do {
            if (lexer.peek().type == tokenType_1.TokenType.comma || lexer.peek().type == tokenType_1.TokenType.gt) {
                result.genericArguments.Add(null);
                continue;
            }
            result.genericArguments.Add(parseType());
        } while (readToken(tokenType_1.TokenType.comma));
        expectToken(tokenType_1.TokenType.gt, ErrorCode.expectedGt);
        result.endLocation = lexer.current.endLocation;
        return result;
    }
    return parsedIdentifier;
}
/**
 * 判断一个类型之后是否存在泛型参数。
 */
    * /returns>;
bool;
markReadGenericTypeExpression();
{
    console.assert(lexer.markPeek().type == tokenType_1.TokenType.);
    ;
    do {
        lexer.markRead(); // <, ,
        // 允许直接结束。
        if (lexer.markPeek().type == tokenType_1.TokenType.gt) {
            break;
        }
        // 如果紧跟的不是类型，则不是类型。
        if (!markReadType()) {
            return false;
        }
    } while (lexer.markPeek().type == tokenType_1.TokenType.comma);
    // 如果是 > 说明一切顺利。
    return lexer.markRead().type == tokenType_1.TokenType.gt;
}
/**
 * 判断一个类型之后是否是数组类型。
 */
    * /returns>;
bool;
markReadArrayTypeExpression();
{
    console.assert(lexer.markPeek().type == tokenType_1.TokenType.lBrack);
    lexer.markRead(); // [
    // 跳过逗号。
    while (lexer.markPeek().type == tokenType_1.TokenType.comma) {
        lexer.markRead();
    }
    return lexer.markRead().type == tokenType_1.TokenType.rBrack;
}
bool;
markReadType();
{
    var type = lexer.markRead().type;
    if (type == tokenType_1.TokenType.identifier) {
        if (lexer.markPeek().type == tokenType_1.TokenType.lt && !markReadGenericTypeExpression()) {
            return false;
        }
    }
    else if (!type.isPredefinedType()) {
        return false;
    }
    // 读取类型数组和指针组合。
    while (true) {
        switch (lexer.markPeek().type) {
            case tokenType_1.TokenType.lBrack:
                if (!markReadArrayTypeExpression()) {
                    return false;
                }
                continue;
            case tokenType_1.TokenType.mul:
                lexer.markRead();
                continue;
            case tokenType_1.TokenType.period:
                lexer.markRead();
                if (lexer.markRead().type != tokenType_1.TokenType.identifier) {
                    return false;
                }
                continue;
            default:
                return true;
        }
    }
}
bool;
followsWithExpression();
{
    return lexer.peek().type.isExpressionStart();
}
endregion;
/**
 * 解析一个源文件。
 */
parseSourceFile(node, nodes.SourceFile);
{
    node.comments && node.comments.accept(this);
    node.jsDoc && node.jsDoc.accept(this);
    node.statements.accept(this);
}
/**
 * 解析一个变量声明语句(var xx = ...)。
 */
parseVariableStatement(node, nodes.VariableStatement);
{
    node.decorators.accept(this);
    node.variables.accept(this);
}
/**
 * 解析一个表达式语句(...;)。
 */
parseExpressionStatement(node, nodes.ExpressionStatement);
{
    node.body.accept(this);
}
/**
 * 解析一个 continue 语句(continue;)。
 */
parseContinueStatement(node, nodes.ContinueStatement);
{
    node.label && node.label.accept(this);
}
/**
 * 解析一个 break 语句(break;)。
 */
parseBreakStatement(node, nodes.BreakStatement);
{
    node.label && node.label.accept(this);
}
/**
 * 解析一个 return 语句(return ...;)。
 */
parseReturnStatement(node, nodes.ReturnStatement);
{
    node.value && node.value.accept(this);
}
/**
 * 解析一个 throw 语句(throw ...;)。
 */
parseThrowStatement(node, nodes.ThrowStatement);
{
    node.value.accept(this);
}
/**
 * 解析一个 try 语句(try {...} catch(e) {...})。
 */
parseTryStatement(node, nodes.TryStatement);
{
    node.try.accept(this);
    node.catch.accept(this);
    node.finally.accept(this);
}
/**
 * 解析一个 try 语句的 catch 分句(catch(e) {...})。
 */
parseCatchClause(node, nodes.CatchClause);
{
    node.variable.accept(this);
    node.body.accept(this);
}
/**
 * 解析一个 try 语句的 finally 分句(finally {...})。
 */
parseFinallyClause(node, nodes.FinallyClause);
{
    node.body.accept(this);
}
/**
 * 解析一个 with 语句(with(...) {...})。
 */
parseWithStatement(node, nodes.WithStatement);
{
    node.value.accept(this);
    node.body.accept(this);
}
/**
 * 解析一个标识符(xx)。
 */
parseIdentifier(node, nodes.Identifier);
{
}
/**
 * 解析 null 字面量(null)。
 */
parseNullLiteral(node, nodes.NullLiteral);
{
}
/**
 * 解析 true 字面量(true)。
 */
parseTrueLiteral(node, nodes.TrueLiteral);
{
}
/**
 * 解析 false 字面量(false)。
 */
parseFalseLiteral(node, nodes.FalseLiteral);
{
}
/**
 * 解析一个浮点数字面量(1)。
 */
parseNumericLiteral(node, nodes.NumericLiteral);
{
}
/**
 * 解析一个字符串字面量('...')。
 */
parseStringLiteral(node, nodes.StringLiteral);
{
}
/**
 * 解析一个数组字面量([...])。
 */
parseArrayLiteral(node, nodes.ArrayLiteral);
{
    node.elements.accept(this);
}
/**
 * 解析一个对象字面量({x: ...})。
 */
parseObjectLiteral(node, nodes.ObjectLiteral);
{
    node.elements.accept(this);
}
/**
 * 解析一个对象字面量项。
 */
parseObjectLiteralElement(node, nodes.ObjectLiteralElement);
{
    node.name.accept(this);
    node.value.accept(this);
}
/**
 * 解析 this 字面量(this)。
 */
parseThisLiteral(node, nodes.ThisLiteral);
{
}
/**
 * 解析 super 字面量(super)。
 */
parseSuperLiteral(node, nodes.SuperLiteral);
{
}
/**
 * 解析一个括号表达式((...))。
 */
parseParenthesizedExpression(node, nodes.ParenthesizedExpression);
{
    node.body.accept(this);
}
/**
 * 解析一个条件表达式(... ? ... : ...)。
 */
parseConditionalExpression(node, nodes.ConditionalExpression);
{
    node.condition.accept(this);
    node.then.accept(this);
    node.else.accept(this);
}
/**
 * 解析一个成员调用表达式(x.y)。
 */
parseMemberCallExpression(node, nodes.MemberCallExpression);
{
    node.target.accept(this);
    node.argument.accept(this);
}
/**
 * 解析一个函数调用表达式(x(...))。
 */
parseCallExpression(node, nodes.CallExpression);
{
    node.target.accept(this);
    node.arguments.accept(this);
}
/**
 * 解析一个 new 表达式(new x(...))。
 */
parseNewExpression(node, nodes.NewExpression);
{
    node.target.accept(this);
    node.arguments.accept(this);
}
/**
 * 解析一个索引调用表达式(x[...])。
 */
parseIndexCallExpression(node, nodes.IndexCallExpression);
{
    node.target.accept(this);
    node.arguments.accept(this);
}
/**
 * 解析一个一元运算表达式(+x)。
 */
parseUnaryExpression(node, nodes.UnaryExpression);
{
    node.operand.accept(this);
}
/**
 * 解析一个二元运算表达式(x + y)。
 */
parseBinaryExpression(node, nodes.BinaryExpression);
{
    node.leftOperand.accept(this);
    node.rightOperand.accept(this);
}
/**
 * 解析一个箭头函数(x => ...)。
 */
parseLambdaLiteral(node, nodes.LambdaLiteral);
{
    node.typeParameters.accept(this);
    node.parameters.accept(this);
    node.body.accept(this);
}
/**
 * 解析一个 yield 表达式(yield xx)。
 */
parseYieldExpression(node, nodes.YieldExpression);
{
    node.body.accept(this);
}
/**
 * 解析一个类型转换表达式(<T>xx)。
 */
parseCnodesExpression(node, nodes.CnodesExpression);
{
    node.type.accept(this);
    node.body.accept(this);
}
/**
 * 解析内置类型字面量(number)。
 */
parsePredefinedTypeLiteral(node, nodes.PredefinedTypeLiteral);
{
}
/**
 * 解析一个泛型表达式(Array<T>)。
 */
parseGenericTypeExpression(node, nodes.GenericTypeExpression);
{
    node.element.accept(this);
    node.genericArguments.accept(this);
}
/**
 * 解析一个数组类型表达式(T[])。
 */
parseArrayTypeExpression(node, nodes.ArrayTypeExpression);
{
    node.element.accept(this);
}
/**
 * 解析一个描述器(@xx(...))。
 */
parseDecorator(node, nodes.Decorator);
{
    node.body.accept(this);
}
/**
 * 解析一个修饰符(public)。
 */
parseModifier(node, nodes.Modifier);
{
}
/**
 * 解析一个类定义(@class ...)。
 */
parseClassDefinition(node, nodes.ClassDefinition);
{
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
parseInterfaceDefinition(node, nodes.InterfaceDefinition);
{
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
parseEnumDefinition(node, nodes.EnumDefinition);
{
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
parseExtensionDefinition(node, nodes.ExtensionDefinition);
{
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
parseNamespaceDefinition(node, nodes.NamespaceDefinition);
{
    node.names.accept(this);
    node.members.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}
/**
 * 解析一个模块。
 */
parseModuleDefinition(node, nodes.ModuleDefinition);
{
    node.members.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}
/**
 * 解析一个类型子成员定义。
 */
parseTypeMemberDefinition(node, nodes.TypeMemberDefinition);
{
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}
/**
 * 解析一个字段定义。
 */
parseFieldDefinition(node, nodes.FieldDefinition);
{
    node.variables.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}
/**
 * 解析一个方法或属性定义。
 */
parseMethodOrPropertyDefinition(node, nodes.MethodOrPropertyDefinition);
{
    node.returnType.accept(this);
    node.explicitType.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}
/**
 * 解析一个属性或索引器定义。
 */
parsePropertyOrIndexerDefinition(node, nodes.PropertyOrIndexerDefinition);
{
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
parsePropertyDefinition(node, nodes.PropertyDefinition);
{
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}
/**
 * 解析一个索引器定义。
 */
parseIndexerDefinition(node, nodes.IndexerDefinition);
{
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
parseMethodOrConstructorDefinition(node, nodes.MethodOrConstructorDefinition);
{
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
parseMethodDefinition(node, nodes.MethodDefinition);
{
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
parseConstructorDefinition(node, nodes.ConstructorDefinition);
{
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
parseEnumMemberDefinition(node, nodes.EnumMemberDefinition);
{
    node.initializer.accept(this);
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name && node.name.accept(this);
}
/**
 * 解析一个 import 指令(import xx from '...';)。
 */
parseImportDirective(node, nodes.ImportDirective);
{
    node.from.accept(this);
    node.alias.accept(this);
    node.value.accept(this);
}
/**
 * 解析一个数组绑定模式([xx, ...])
 */
parseArrayBindingPattern(node, nodes.ArrayBindingPattern);
{
    node.elements.accept(this);
}
/**
 * 解析一个数组绑定模式项(xx, ..)
 */
parseArrayBindingElement(node, nodes.ArrayBindingElement);
{
    node.initializer.accept(this);
    node.name.accept(this);
}
/**
 * 解析一个对象绑定模式({xx, ...})
 */
parseObjectBindingPattern(node, nodes.ObjectBindingPattern);
{
    node.elements.accept(this);
}
/**
 * 解析一个对象绑定模式项(xx: y)
 */
parseObjectBindingElement(node, nodes.ObjectBindingElement);
{
    node.propertyName.accept(this);
    node.name.accept(this);
}
/**
 * 解析一个变量声明(xx = ...)。
 */
parseVariableDeclaration(node, nodes.VariableDeclaration);
{
    node.type.accept(this);
    node.initializer.accept(this);
    node.name.accept(this);
}
/**
 * 解析一个参数声明。
 */
parseParameterDeclaration(node, nodes.ParameterDeclaration);
{
    node.decorators.accept(this);
    node.modifiers.accept(this);
    node.name.accept(this);
}
/**
 * 解析一个泛型参数。
 */
parseGenericParameterDeclaration(node, nodes.GenericParameterDeclaration);
{
    node.name.accept(this);
    node.constraint && node.constraint.accept(this);
}
/**
 * 解析一个 JS 注释。
 */
parseComment(node, nodes.Comment);
{
}
/**
 * 解析一个 JS 文档注释。
 */
parseJsDocComment(node, nodes.JsDocComment);
{
}
parseSourceFile(fileName, string, _sourceText, string, languageVersion, ScriptTarget, _syntaxCursor, IncrementalParser.SyntaxCursor, setParentNodes ?  : boolean, scriptKind ?  : ScriptKind);
SourceFile;
{
    scriptKind = ensureScriptKind(fileName, scriptKind);
    initializeState(fileName, _sourceText, languageVersion, _syntaxCursor, scriptKind);
    var result_1 = parseSourceFileWorker(fileName, languageVersion, setParentNodes, scriptKind);
    clearState();
    return result_1;
}
getLanguageVariant(scriptKind, ScriptKind);
{
    // .tsx and .jsx files are treated as jsx language variant.
    return scriptKind === ScriptKind.TSX || scriptKind === ScriptKind.JSX || scriptKind === ScriptKind.JS ? LanguageVariant.JSX : LanguageVariant.Standard;
}
initializeState(fileName, string, _sourceText, string, languageVersion, ScriptTarget, _syntaxCursor, IncrementalParser.SyntaxCursor, scriptKind, ScriptKind);
{
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
clearState();
{
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
parseSourceFileWorker(fileName, string, languageVersion, ScriptTarget, setParentNodes, boolean, scriptKind, ScriptKind);
SourceFile;
{
    sourceFile = createSourceFile(fileName, languageVersion, scriptKind);
    sourceFile.flags = contextFlags;
    // Prime the scanner.
    token = nextToken();
    processReferenceComments(sourceFile);
    sourceFile.statements = parseList(ParsingContext.SourceElements, parseStatement);
    Debug.assert(token === tokenType_1.TokenType.EndOfFileToken);
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
addJSDocComment(node, T);
T;
{
    if (contextFlags & NodeFlags.JavaScriptFile) {
        var comments = getLeadingCommentRangesOfNode(node, sourceFile);
        if (comments) {
            for (var _i = 0, comments_1 = comments; _i < comments_1.length; _i++) {
                var comment = comments_1[_i];
                var jsDocComment = JSDocParser.parseJSDocComment(node, comment.pos, comment.end - comment.pos);
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
fixupParentReferences(rootNode, Node);
{
    // normally parent references are set during binding. However, for clients that only need
    // a syntax tree, and no semantic features, then the binding process is an unnecessary
    // overhead.  This privates allows us to set all the parents, without all the expense of
    // binding.
    var parent_1 = rootNode;
    forEachChild(rootNode, visitNode);
    return;
    function visitNode(n) {
        // walk down setting parents that differ from the parent we think it should be.  This
        // allows us to quickly bail out of setting parents for subtrees during incremental
        // parsing
        if (n.parent !== parent_1) {
            n.parent = parent_1;
            var saveParent = parent_1;
            parent_1 = n;
            forEachChild(n, visitNode);
            if (n.jsDocComments) {
                for (var _i = 0, _a = n.jsDocComments; _i < _a.length; _i++) {
                    var jsDocComment = _a[_i];
                    jsDocComment.parent = n;
                    parent_1 = jsDocComment;
                    forEachChild(jsDocComment, visitNode);
                }
            }
            parent_1 = saveParent;
        }
    }
}
createSourceFile(fileName, string, languageVersion, ScriptTarget, scriptKind, ScriptKind);
SourceFile;
{
    // code from createNode is inlined here so createNode won't have to deal with special case of creating source files
    // this is quite rare comparing to other nodes and createNode should be as fnodes as possible
    var sourceFile = new SourceFileConstructor(tokenType_1.TokenType.SourceFile, /*pos*/ 0, /* end */ sourceText.length);
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
setContextFlag(val, boolean, flag, NodeFlags);
{
    if (val) {
        contextFlags |= flag;
    }
    else {
        contextFlags &= ~flag;
    }
}
setDisallowInContext(val, boolean);
{
    setContextFlag(val, NodeFlags.DisallowInContext);
}
setYieldContext(val, boolean);
{
    setContextFlag(val, NodeFlags.YieldContext);
}
setDecoratorContext(val, boolean);
{
    setContextFlag(val, NodeFlags.DecoratorContext);
}
setAwaitContext(val, boolean);
{
    setContextFlag(val, NodeFlags.AwaitContext);
}
doOutsideOfContext(context, NodeFlags, func, function () { return T; });
T;
{
    // contextFlagsToClear will contain only the context flags that are
    // currently set that we need to temporarily clear
    // We don't just blindly reset to the previous flags to ensure
    // that we do not mutate cached flags for the incremental
    // parser (ThisNodeHasError, ThisNodeOrAnySubNodesHasError, and
    // HasAggregatedChildData).
    var contextFlagsToClear = context & contextFlags;
    if (contextFlagsToClear) {
        // clear the requested context flags
        setContextFlag(/*val*/ false, contextFlagsToClear);
        var result_2 = func();
        // restore the context flags we just cleared
        setContextFlag(/*val*/ true, contextFlagsToClear);
        return result_2;
    }
    // no need to do anything special as we are not in any of the requested contexts
    return func();
}
doInsideOfContext(context, NodeFlags, func, function () { return T; });
T;
{
    // contextFlagsToSet will contain only the context flags that
    // are not currently set that we need to temporarily enable.
    // We don't just blindly reset to the previous flags to ensure
    // that we do not mutate cached flags for the incremental
    // parser (ThisNodeHasError, ThisNodeOrAnySubNodesHasError, and
    // HasAggregatedChildData).
    var contextFlagsToSet = context & ~contextFlags;
    if (contextFlagsToSet) {
        // set the requested context flags
        setContextFlag(/*val*/ true, contextFlagsToSet);
        var result_3 = func();
        // reset the context flags we just set
        setContextFlag(/*val*/ false, contextFlagsToSet);
        return result_3;
    }
    // no need to do anything special as we are already in all of the requested contexts
    return func();
}
allowInAnd(func, function () { return T; });
T;
{
    return doOutsideOfContext(NodeFlags.DisallowInContext, func);
}
disallowInAnd(func, function () { return T; });
T;
{
    return doInsideOfContext(NodeFlags.DisallowInContext, func);
}
doInYieldContext(func, function () { return T; });
T;
{
    return doInsideOfContext(NodeFlags.YieldContext, func);
}
doInDecoratorContext(func, function () { return T; });
T;
{
    return doInsideOfContext(NodeFlags.DecoratorContext, func);
}
doInAwaitContext(func, function () { return T; });
T;
{
    return doInsideOfContext(NodeFlags.AwaitContext, func);
}
doOutsideOfAwaitContext(func, function () { return T; });
T;
{
    return doOutsideOfContext(NodeFlags.AwaitContext, func);
}
doInYieldAndAwaitContext(func, function () { return T; });
T;
{
    return doInsideOfContext(NodeFlags.YieldContext | NodeFlags.AwaitContext, func);
}
inContext(flags, NodeFlags);
{
    return (contextFlags & flags) !== 0;
}
inYieldContext();
{
    return inContext(NodeFlags.YieldContext);
}
inDisallowInContext();
{
    return inContext(NodeFlags.DisallowInContext);
}
inDecoratorContext();
{
    return inContext(NodeFlags.DecoratorContext);
}
inAwaitContext();
{
    return inContext(NodeFlags.AwaitContext);
}
parseErrorAtCurrentToken(message, DiagnosticMessage, arg0 ?  : any);
void {
    const: start = scanner.getTokenPos(),
    const: length = scanner.getTextPos() - start,
    parseErrorAtPosition: function (start, length, message, arg0) { }
};
parseErrorAtPosition(start, number, length, number, message, DiagnosticMessage, arg0 ?  : any);
void {
    // Don't report another error if it would just be at the same position as the lnodes error.
    const: lnodesError = lnodesOrUndefined(parseDiagnostics),
    if: function () { } };
!lnodesError || start !== lnodesError.start;
{
    parseDiagnostics.push(createFileDiagnostic(sourceFile, start, length, message, arg0));
}
// Mark that we've encountered an error.  We'll set an appropriate bit on the next
// node we finish so that it can't be reused incrementally.
parseErrorBeforeNextFinishedNode = true;
scanError(message, DiagnosticMessage, length ?  : number);
{
    var pos = scanner.getTextPos();
    parseErrorAtPosition(pos, length || 0, message);
}
getNodePos();
number;
{
    return scanner.getStartPos();
}
getNodeEnd();
number;
{
    return scanner.getStartPos();
}
nextToken();
tokenType_1.TokenType;
{
    return token = scanner.scan();
}
reScanGreaterToken();
tokenType_1.TokenType;
{
    return token = scanner.reScanGreaterToken();
}
reScanSlashToken();
tokenType_1.TokenType;
{
    return token = scanner.reScanSlashToken();
}
reScanTemplateToken();
tokenType_1.TokenType;
{
    return token = scanner.reScanTemplateToken();
}
scanJsxIdentifier();
tokenType_1.TokenType;
{
    return token = scanner.scanJsxIdentifier();
}
scanJsxText();
tokenType_1.TokenType;
{
    return token = scanner.scanJsxToken();
}
speculationHelper(callback, function () { return T; }, isLookAhead, boolean);
T;
{
    // Keep track of the state we'll need to rollback to if lookahead fails (or if the
    // caller asked us to always reset our state).
    var saveToken = token;
    var saveParseDiagnosticsLength = parseDiagnostics.length;
    var saveParseErrorBeforeNextFinishedNode = parseErrorBeforeNextFinishedNode;
    // Note: it is not actually necessary to save/restore the context flags here.  That's
    // because the saving/restoring of these flags happens naturally through the recursive
    // descent nature of our parser.  However, we still store this here just so we can
    // assert that that invariant holds.
    var saveContextFlags = contextFlags;
    // If we're only looking ahead, then tell the scanner to only lookahead as well.
    // Otherwise, if we're actually speculatively parsing, then tell the scanner to do the
    // same.
    var result_4 = isLookAhead
        ? scanner.lookAhead(callback)
        : scanner.tryScan(callback);
    Debug.assert(saveContextFlags === contextFlags);
    // If our callback returned something 'falsy' or we're just looking ahead,
    // then unconditionally restore us to where we were.
    if (!result_4 || isLookAhead) {
        token = saveToken;
        parseDiagnostics.length = saveParseDiagnosticsLength;
        parseErrorBeforeNextFinishedNode = saveParseErrorBeforeNextFinishedNode;
    }
    return result_4;
}
lookAhead(callback, function () { return T; });
T;
{
    return speculationHelper(callback, /*isLookAhead*/ true);
}
tryParse(callback, function () { return T; });
T;
{
    return speculationHelper(callback, /*isLookAhead*/ false);
}
fallowsIdentifier();
{
    switch (this.lexer.currentToken.type) {
        case tokenType_1.TokenType.identifier:
            return true;
        // If we have a 'yield' keyword, and we're in the [yield] context, then 'yield' is
        // considered a keyword and is not an identifier.
        case tokenType_1.TokenType.yield:
            if (this.flags & ParseFlags.allowYield) {
                return false;
            }
        // If we have a 'await' keyword, and we're in the [Await] context, then 'await' is
        // considered a keyword and is not an identifier.
        case tokenType_1.TokenType.await:
            if (this.flags & ParseFlags.allowAwait) {
                return false;
            }
        default:
            return tokenType_1.isNonReservedWord(this.lexer.currentToken.type);
    }
}
readTokenToken(t, tokenType_1.TokenType);
Node;
{
    if (token === t) {
        return parseTokenNode();
    }
    return undefined;
}
parseTokenNode();
T;
{
    var node = createNode(token);
    nextToken();
    return finishNode(node);
}
autoInsertSemicolon();
{
    switch (this.lexer.tokenType) {
        case tokenType_1.TokenType.semicolon:
        case tokenType_1.TokenType.closeBrace:
        case tokenType_1.TokenType.endOfFile:
            return true;
        default:
            return this.lexer.hasLineTerminatorBeforeTokenStart;
    }
}
parseSemicolon();
boolean;
{
    if (this.autoInsertSemicolon()) {
        if (token === tokenType_1.TokenType.SemicolonToken) {
            // consume the semicolon if it was explicitly provided.
            nextToken();
        }
        return true;
    }
    else {
        return this.expectToken(tokenType_1.TokenType.SemicolonToken);
    }
}
createNode(kind, tokenType_1.TokenType, pos ?  : number);
Node;
{
    nodeCount++;
    if (!(pos >= 0)) {
        pos = scanner.getStartPos();
    }
    return new NodeConstructor(kind, pos, pos);
}
finishNode(node, T, end ?  : number);
T;
{
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
createMissingNode(kind, tokenType_1.TokenType, reportAtCurrentPosition, boolean, diagnosticMessage, DiagnosticMessage, arg0 ?  : any);
Node;
{
    if (reportAtCurrentPosition) {
        parseErrorAtPosition(scanner.getStartPos(), 0, diagnosticMessage, arg0);
    }
    else {
        parseErrorAtCurrentToken(diagnosticMessage, arg0);
    }
    var result_5 = createNode(kind, scanner.getStartPos());
    result_5.text = "";
    return finishNode(result_5);
}
internIdentifier(text, string);
string;
{
    text = escapeIdentifier(text);
    return hasProperty(identifiers, text) ? identifiers[text] : (identifiers[text] = text);
}
createIdentifier(isIdentifier, boolean, diagnosticMessage ?  : DiagnosticMessage);
Identifier;
{
    identifierCount++;
    if (isIdentifier) {
        var node = createNode(tokenType_1.TokenType.Identifier);
        // Store original token kind if it is not just an Identifier so we can report appropriate error later in type checker
        if (token !== tokenType_1.TokenType.Identifier) {
            node.originalKeywordKind = token;
        }
        node.text = internIdentifier(scanner.getTokenValue());
        nextToken();
        return finishNode(node);
    }
    return createMissingNode(tokenType_1.TokenType.Identifier, /*reportAtCurrentPosition*/ false, diagnosticMessage || Diagnostics.Identifier_expected);
}
parseIdentifier(diagnosticMessage ?  : DiagnosticMessage);
Identifier;
{
    return createIdentifier(isIdentifier(), diagnosticMessage);
}
parseIdentifierName();
Identifier;
{
    return createIdentifier(tokenIsIdentifierOrKeyword(token));
}
isLiteralPropertyName();
boolean;
{
    return tokenIsIdentifierOrKeyword(token) ||
        token === tokenType_1.TokenType.StringLiteral ||
        token === tokenType_1.TokenType.NumericLiteral;
}
parsePropertyNameWorker(allowComputedPropertyNames, boolean);
PropertyName;
{
    if (token === tokenType_1.TokenType.StringLiteral || token === tokenType_1.TokenType.NumericLiteral) {
        return parseLiteralNode(/*internName*/ true);
    }
    if (allowComputedPropertyNames && token === tokenType_1.TokenType.OpenBracketToken) {
        return parseComputedPropertyName();
    }
    return parseIdentifierName();
}
parsePropertyName();
PropertyName;
{
    return parsePropertyNameWorker(/*allowComputedPropertyNames*/ true);
}
parseSimplePropertyName();
Identifier | LiteralExpression;
{
    return parsePropertyNameWorker(/*allowComputedPropertyNames*/ false);
}
isSimplePropertyName();
{
    return token === tokenType_1.TokenType.StringLiteral || token === tokenType_1.TokenType.NumericLiteral || tokenIsIdentifierOrKeyword(token);
}
parseComputedPropertyName();
ComputedPropertyName;
{
    // PropertyName [Yield]:
    //      LiteralPropertyName
    //      ComputedPropertyName[?Yield]
    var node = createNode(tokenType_1.TokenType.ComputedPropertyName);
    this.expectToken(tokenType_1.TokenType.OpenBracketToken);
    // We parse any expression (including a comma expression). But the grammar
    // says that only an assignment expression is allowed, so the grammar checker
    // will error if it sees a comma expression.
    node.expression = allowInAnd(parseExpression);
    this.expectToken(tokenType_1.TokenType.CloseBracketToken);
    return finishNode(node);
}
parseContextualModifier(t, tokenType_1.TokenType);
boolean;
{
    return token === t && tryParse(nextTokenCanFollowModifier);
}
nextTokenIsOnSameLineAndCanFollowModifier();
{
    nextToken();
    if (scanner.hasPrecedingLineBreak()) {
        return false;
    }
    return canFollowModifier();
}
nextTokenCanFollowModifier();
{
    if (token === tokenType_1.TokenType.ConstKeyword) {
        // 'const' is only a modifier if followed by 'enum'.
        return nextToken() === tokenType_1.TokenType.EnumKeyword;
    }
    if (token === tokenType_1.TokenType.ExportKeyword) {
        nextToken();
        if (token === tokenType_1.TokenType.DefaultKeyword) {
            return lookAhead(nextTokenIsClassOrFunction);
        }
        return token !== tokenType_1.TokenType.AsteriskToken && token !== tokenType_1.TokenType.AsKeyword && token !== tokenType_1.TokenType.OpenBraceToken && canFollowModifier();
    }
    if (token === tokenType_1.TokenType.DefaultKeyword) {
        return nextTokenIsClassOrFunction();
    }
    if (token === tokenType_1.TokenType.StaticKeyword) {
        nextToken();
        return canFollowModifier();
    }
    return nextTokenIsOnSameLineAndCanFollowModifier();
}
parseAnyContextualModifier();
boolean;
{
    return isModifierKind(token) && tryParse(nextTokenCanFollowModifier);
}
canFollowModifier();
boolean;
{
    return token === tokenType_1.TokenType.OpenBracketToken
        || token === tokenType_1.TokenType.OpenBraceToken
        || token === tokenType_1.TokenType.AsteriskToken
        || token === tokenType_1.TokenType.DotDotDotToken
        || isLiteralPropertyName();
}
nextTokenIsClassOrFunction();
boolean;
{
    nextToken();
    return token === tokenType_1.TokenType.ClassKeyword || token === tokenType_1.TokenType.FunctionKeyword;
}
isListElement(parsingContext, ParsingContext, inErrorRecovery, boolean);
boolean;
{
    var node = currentNode(parsingContext);
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
            return !(token === tokenType_1.TokenType.SemicolonToken && inErrorRecovery) && isStartOfStatement();
        case ParsingContext.SwitchClauses:
            return token === tokenType_1.TokenType.CaseKeyword || token === tokenType_1.TokenType.DefaultKeyword;
        case ParsingContext.TypeMembers:
            return lookAhead(isTypeMemberStart);
        case ParsingContext.ClassMembers:
            // We allow semicolons as class elements (as specified by ES6) as long as we're
            // not in error recovery.  If we're in error recovery, we don't want an errant
            // semicolon to be treated as a class member (since they're almost always used
            // for statements.
            return lookAhead(isClassMemberStart) || (token === tokenType_1.TokenType.SemicolonToken && !inErrorRecovery);
        case ParsingContext.EnumMembers:
            // Include open bracket computed properties. This technically also lets in indexers,
            // which would be a candidate for improved error reporting.
            return token === tokenType_1.TokenType.OpenBracketToken || isLiteralPropertyName();
        case ParsingContext.ObjectLiteralMembers:
            return token === tokenType_1.TokenType.OpenBracketToken || token === tokenType_1.TokenType.AsteriskToken || isLiteralPropertyName();
        case ParsingContext.ObjectBindingElements:
            return token === tokenType_1.TokenType.OpenBracketToken || isLiteralPropertyName();
        case ParsingContext.HeritageClauseElement:
            // If we see { } then only consume it as an expression if it is followed by , or {
            // That way we won't consume the body of a class in its heritage clause.
            if (token === tokenType_1.TokenType.OpenBraceToken) {
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
            return token === tokenType_1.TokenType.CommaToken || token === tokenType_1.TokenType.DotDotDotToken || isIdentifierOrPattern();
        case ParsingContext.TypeParameters:
            return isIdentifier();
        case ParsingContext.ArgumentExpressions:
        case ParsingContext.ArrayLiteralMembers:
            return token === tokenType_1.TokenType.CommaToken || token === tokenType_1.TokenType.DotDotDotToken || fallowsExpression();
        case ParsingContext.Parameters:
            return isStartOfParameter();
        case ParsingContext.TypeArguments:
        case ParsingContext.TupleElementTypes:
            return token === tokenType_1.TokenType.CommaToken || isStartOfType();
        case ParsingContext.HeritageClauses:
            return isHeritageClause();
        case ParsingContext.ImportOrExportSpecifiers:
            return tokenIsIdentifierOrKeyword(token);
        case ParsingContext.JsxAttributes:
            return tokenIsIdentifierOrKeyword(token) || token === tokenType_1.TokenType.OpenBraceToken;
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
isValidHeritageClauseObjectLiteral();
{
    Debug.assert(token === tokenType_1.TokenType.OpenBraceToken);
    if (nextToken() === tokenType_1.TokenType.CloseBraceToken) {
        // if we see  "extends {}" then only treat the {} as what we're extending (and not
        // the class body) if we have:
        //
        //      extends {} {
        //      extends {},
        //      extends {} extends
        //      extends {} implements
        var next = nextToken();
        return next === tokenType_1.TokenType.CommaToken || next === tokenType_1.TokenType.OpenBraceToken || next === tokenType_1.TokenType.ExtendsKeyword || next === tokenType_1.TokenType.ImplementsKeyword;
    }
    return true;
}
nextTokenIsIdentifier();
{
    nextToken();
    return isIdentifier();
}
nextTokenIsIdentifierOrKeyword();
{
    nextToken();
    return tokenIsIdentifierOrKeyword(token);
}
isHeritageClauseExtendsOrImplementsKeyword();
boolean;
{
    if (token === tokenType_1.TokenType.ImplementsKeyword ||
        token === tokenType_1.TokenType.ExtendsKeyword) {
        return lookAhead(nextTokenIsStartOfExpression);
    }
    return false;
}
nextTokenIsStartOfExpression();
{
    nextToken();
    return fallowsExpression();
}
isListTerminator(kind, ParsingContext);
boolean;
{
    if (token === tokenType_1.TokenType.EndOfFileToken) {
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
            return token === tokenType_1.TokenType.CloseBraceToken;
        case ParsingContext.SwitchClauseStatements:
            return token === tokenType_1.TokenType.CloseBraceToken || token === tokenType_1.TokenType.CaseKeyword || token === tokenType_1.TokenType.DefaultKeyword;
        case ParsingContext.HeritageClauseElement:
            return token === tokenType_1.TokenType.OpenBraceToken || token === tokenType_1.TokenType.ExtendsKeyword || token === tokenType_1.TokenType.ImplementsKeyword;
        case ParsingContext.VariableDeclarations:
            return isVariableDeclaratorListTerminator();
        case ParsingContext.TypeParameters:
            // Tokens other than '>' are here for better error recovery
            return token === tokenType_1.TokenType.GreaterThanToken || token === tokenType_1.TokenType.OpenParenToken || token === tokenType_1.TokenType.OpenBraceToken || token === tokenType_1.TokenType.ExtendsKeyword || token === tokenType_1.TokenType.ImplementsKeyword;
        case ParsingContext.ArgumentExpressions:
            // Tokens other than ')' are here for better error recovery
            return token === tokenType_1.TokenType.CloseParenToken || token === tokenType_1.TokenType.SemicolonToken;
        case ParsingContext.ArrayLiteralMembers:
        case ParsingContext.TupleElementTypes:
        case ParsingContext.ArrayBindingElements:
            return token === tokenType_1.TokenType.CloseBracketToken;
        case ParsingContext.Parameters:
            // Tokens other than ')' and ']' (the latter for index signatures) are here for better error recovery
            return token === tokenType_1.TokenType.CloseParenToken || token === tokenType_1.TokenType.CloseBracketToken /*|| token === TokenType.OpenBraceToken*/;
        case ParsingContext.TypeArguments:
            // Tokens other than '>' are here for better error recovery
            return token === tokenType_1.TokenType.GreaterThanToken || token === tokenType_1.TokenType.OpenParenToken;
        case ParsingContext.HeritageClauses:
            return token === tokenType_1.TokenType.OpenBraceToken || token === tokenType_1.TokenType.CloseBraceToken;
        case ParsingContext.JsxAttributes:
            return token === tokenType_1.TokenType.GreaterThanToken || token === tokenType_1.TokenType.SlashToken;
        case ParsingContext.JsxChildren:
            return token === tokenType_1.TokenType.LessThanToken && lookAhead(nextTokenIsSlash);
        case ParsingContext.JSDocFunctionParameters:
            return token === tokenType_1.TokenType.CloseParenToken || token === tokenType_1.TokenType.ColonToken || token === tokenType_1.TokenType.CloseBraceToken;
        case ParsingContext.JSDocTypeArguments:
            return token === tokenType_1.TokenType.GreaterThanToken || token === tokenType_1.TokenType.CloseBraceToken;
        case ParsingContext.JSDocTupleTypes:
            return token === tokenType_1.TokenType.CloseBracketToken || token === tokenType_1.TokenType.CloseBraceToken;
        case ParsingContext.JSDocRecordMembers:
            return token === tokenType_1.TokenType.CloseBraceToken;
    }
}
isVariableDeclaratorListTerminator();
boolean;
{
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
    if (token === tokenType_1.TokenType.EqualsGreaterThanToken) {
        return true;
    }
    // Keep trying to parse out variable declarators.
    return false;
}
isInSomeParsingContext();
boolean;
{
    for (var kind = 0; kind < ParsingContext.Count; kind++) {
        if (parsingContext & (1 << kind)) {
            if (isListElement(kind, /*inErrorRecovery*/ true) || isListTerminator(kind)) {
                return true;
            }
        }
    }
    return false;
}
parseList(kind, ParsingContext, parseElement, function () { return T; });
NodeArray < T > {
    const: saveParsingContext = parsingContext,
    parsingContext:  |= 1 << kind,
    const: result = [],
    result: .pos = getNodePos(),
    while: function () { } };
!isListTerminator(kind);
{
    if (isListElement(kind, /*inErrorRecovery*/ false)) {
        var element = parseListElement(kind, parseElement);
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
parseListElement(parsingContext, ParsingContext, parseElement, function () { return T; });
T;
{
    var node = currentNode(parsingContext);
    if (node) {
        return consumeNode(node);
    }
    return parseElement();
}
currentNode(parsingContext, ParsingContext);
Node;
{
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
    var node = syntaxCursor.currentNode(scanner.getStartPos());
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
    var nodeContextFlags = node.flags & NodeFlags.ContextFlags;
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
consumeNode(node, Node);
{
    // Move the scanner so it is after the node we just consumed.
    scanner.setTextPos(node.end);
    nextToken();
    return node;
}
canReuseNode(node, Node, parsingContext, ParsingContext);
boolean;
{
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
isReusableClassMember(node, Node);
{
    if (node) {
        switch (node.kind) {
            case tokenType_1.TokenType.Constructor:
            case tokenType_1.TokenType.IndexSignature:
            case tokenType_1.TokenType.GetAccessor:
            case tokenType_1.TokenType.SetAccessor:
            case tokenType_1.TokenType.PropertyDeclaration:
            case tokenType_1.TokenType.SemicolonClassElement:
                return true;
            case tokenType_1.TokenType.MethodDeclaration:
                // Method declarations are not necessarily reusable.  An object-literal
                // may have a method calls "constructor(...)" and we must reparse that
                // into an actual .ConstructorDeclaration.
                var methodDeclaration = node;
                var nameIsConstructor = methodDeclaration.name.kind === tokenType_1.TokenType.Identifier &&
                    methodDeclaration.name.originalKeywordKind === tokenType_1.TokenType.ConstructorKeyword;
                return !nameIsConstructor;
        }
    }
    return false;
}
isReusableSwitchClause(node, Node);
{
    if (node) {
        switch (node.kind) {
            case tokenType_1.TokenType.CaseClause:
            case tokenType_1.TokenType.DefaultClause:
                return true;
        }
    }
    return false;
}
isReusableStatement(node, Node);
{
    if (node) {
        switch (node.kind) {
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
}
isReusableEnumMember(node, Node);
{
    return node.kind === tokenType_1.TokenType.EnumMember;
}
isReusableTypeMember(node, Node);
{
    if (node) {
        switch (node.kind) {
            case tokenType_1.TokenType.ConstructSignature:
            case tokenType_1.TokenType.MethodSignature:
            case tokenType_1.TokenType.IndexSignature:
            case tokenType_1.TokenType.PropertySignature:
            case tokenType_1.TokenType.CallSignature:
                return true;
        }
    }
    return false;
}
isReusableVariableDeclaration(node, Node);
{
    if (node.kind !== tokenType_1.TokenType.VariableDeclaration) {
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
    var variableDeclarator = node;
    return variableDeclarator.initializer === undefined;
}
isReusableParameter(node, Node);
{
    if (node.kind !== tokenType_1.TokenType.Parameter) {
        return false;
    }
    // See the comment in isReusableVariableDeclaration for why we do this.
    var parameter = node;
    return parameter.initializer === undefined;
}
abortParsingListOrMoveToNextToken(kind, ParsingContext);
{
    parseErrorAtCurrentToken(parsingContextErrors(kind));
    if (isInSomeParsingContext()) {
        return true;
    }
    nextToken();
    return false;
}
parsingContextErrors(context, ParsingContext);
DiagnosticMessage;
{
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
}
;
parseDelimitedList(kind, ParsingContext, parseElement, function () { return T; }, considerSemicolonAsDelimiter ?  : boolean);
NodeArray < T > {
    const: saveParsingContext = parsingContext,
    parsingContext:  |= 1 << kind,
    const: result = [],
    result: .pos = getNodePos(),
    let: commaStart = -1,
    while: function () { }, true:  };
{
    if (isListElement(kind, /*inErrorRecovery*/ false)) {
        result.push(parseListElement(kind, parseElement));
        commaStart = scanner.getTokenPos();
        if (readToken(tokenType_1.TokenType.CommaToken)) {
            continue;
        }
        commaStart = -1; // Back to the state where the lnodes token was not a comma
        if (isListTerminator(kind)) {
            break;
        }
        // We didn't get a comma, and the list wasn't terminated, explicitly parse
        // out a comma so we give a good error message.
        this.expectToken(tokenType_1.TokenType.CommaToken);
        // If the token was a semicolon, and the caller allows that, then skip it and
        // continue.  This ensures we get back on track and don't result in tons of
        // parse errors.  For example, this can happen when people do things like use
        // a semicolon to delimit object literal members.   Note: we'll have already
        // reported an error when we called this.expectToken above.
        if (considerSemicolonAsDelimiter && token === tokenType_1.TokenType.SemicolonToken && !scanner.hasPrecedingLineBreak()) {
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
createMissingList();
NodeArray < T > {
    const: pos = getNodePos(),
    const: result = [],
    result: .pos = pos,
    result: .end = pos,
    return: result
};
parseBracketedList(kind, ParsingContext, parseElement, function () { return T; }, open, tokenType_1.TokenType, close, tokenType_1.TokenType);
NodeArray < T > {
    if: function () { }, this: .expectToken(open) };
{
    var result_6 = parseDelimitedList(kind, parseElement);
    this.expectToken(close);
    return result_6;
}
return createMissingList();
parseEntityName(allowReservedWords, boolean, diagnosticMessage ?  : DiagnosticMessage);
EntityName;
{
    var entity = parseIdentifier(diagnosticMessage);
    while (readToken(tokenType_1.TokenType.DotToken)) {
        var node = createNode(tokenType_1.TokenType.QualifiedName, entity.pos); // !!!
        node.left = entity;
        node.right = parseRightSideOfDot(allowReservedWords);
        entity = finishNode(node);
    }
    return entity;
}
parseRightSideOfDot(allowIdentifierNames, boolean);
Identifier;
{
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
        var matchesPattern = lookAhead(nextTokenIsIdentifierOrKeywordOnSameLine);
        if (matchesPattern) {
            // Report that we need an identifier.  However, report it right after the dot,
            // and not on the next token.  This is because the next token might actually
            // be an identifier and the error would be quite confusing.
            return createMissingNode(tokenType_1.TokenType.Identifier, /*reportAtCurrentPosition*/ true, Diagnostics.Identifier_expected);
        }
    }
    return allowIdentifierNames ? parseIdentifierName() : parseIdentifier();
}
parseTemplateExpression();
TemplateExpression;
{
    var template = createNode(tokenType_1.TokenType.TemplateExpression);
    template.head = parseTemplateLiteralFragment();
    Debug.assert(template.head.kind === tokenType_1.TokenType.TemplateHead, "Template head has wrong token kind");
    var templateSpans = [];
    templateSpans.pos = getNodePos();
    do {
        templateSpans.push(parseTemplateSpan());
    } while (lnodesOrUndefined(templateSpans).literal.kind === tokenType_1.TokenType.TemplateMiddle);
    templateSpans.end = getNodeEnd();
    template.templateSpans = templateSpans;
    return finishNode(template);
}
parseTemplateSpan();
TemplateSpan;
{
    var span = createNode(tokenType_1.TokenType.TemplateSpan);
    span.expression = allowInAnd(parseExpression);
    var literal = void 0;
    if (token === tokenType_1.TokenType.CloseBraceToken) {
        reScanTemplateToken();
        literal = parseTemplateLiteralFragment();
    }
    else {
        literal = this.expectTokenToken(tokenType_1.TokenType.TemplateTail, /*reportAtCurrentPosition*/ false, Diagnostics._0_expected, tokenType_1.tokenToString(tokenType_1.TokenType.CloseBraceToken));
    }
    span.literal = literal;
    return finishNode(span);
}
parseStringLiteralTypeNode();
StringLiteralTypeNode;
{
    return parseLiteralLikeNode(tokenType_1.TokenType.StringLiteralType, /*internName*/ true);
}
parseLiteralNode(internName ?  : boolean);
LiteralExpression;
{
    return parseLiteralLikeNode(token, internName);
}
parseTemplateLiteralFragment();
TemplateLiteralFragment;
{
    return parseLiteralLikeNode(token, /*internName*/ false);
}
parseLiteralLikeNode(kind, tokenType_1.TokenType, internName, boolean);
LiteralLikeNode;
{
    var node = createNode(kind);
    var text = scanner.getTokenValue();
    node.text = internName ? internIdentifier(text) : text;
    if (scanner.hasExtendedUnicodeEscape()) {
        node.hasExtendedUnicodeEscape = true;
    }
    if (scanner.isUnterminated()) {
        node.isUnterminated = true;
    }
    var tokenPos = scanner.getTokenPos();
    nextToken();
    finishNode(node);
    // Octal literals are not allowed in strict mode or ES5
    // Note that theoretically the following condition would hold true literals like 009,
    // which is not octal.But because of how the scanner separates the tokens, we would
    // never get a token like this. Instead, we would get 00 and 9 as two separate tokens.
    // We also do not need to check for negatives because any prefix operator would be part of a
    // parent unary expression.
    if (node.kind === tokenType_1.TokenType.NumericLiteral
        && sourceText.charCodeAt(tokenPos) === CharacterCodes._0
        && isOctalDigit(sourceText.charCodeAt(tokenPos + 1))) {
        node.isOctalLiteral = true;
    }
    return node;
}
parseTypeReference();
TypeReferenceNode;
{
    var typeName = parseEntityName(/*allowReservedWords*/ false, Diagnostics.Type_expected);
    var node = createNode(tokenType_1.TokenType.TypeReference, typeName.pos);
    node.typeName = typeName;
    if (!scanner.hasPrecedingLineBreak() && token === tokenType_1.TokenType.LessThanToken) {
        node.typeArguments = parseBracketedList(ParsingContext.TypeArguments, parseType, tokenType_1.TokenType.LessThanToken, tokenType_1.TokenType.GreaterThanToken);
    }
    return finishNode(node);
}
parseThisTypePredicate(lhs, ThisTypeNode);
TypePredicateNode;
{
    nextToken();
    var node = createNode(tokenType_1.TokenType.TypePredicate, lhs.pos);
    node.parameterName = lhs;
    node.type = parseType();
    return finishNode(node);
}
parseThisTypeNode();
ThisTypeNode;
{
    var node = createNode(tokenType_1.TokenType.ThisType);
    nextToken();
    return finishNode(node);
}
parseTypeQuery();
TypeQueryNode;
{
    var node = createNode(tokenType_1.TokenType.TypeQuery);
    this.expectToken(tokenType_1.TokenType.TypeOfKeyword);
    node.exprName = parseEntityName(/*allowReservedWords*/ true);
    return finishNode(node);
}
parseTypeParameter();
TypeParameterDeclaration;
{
    var node = createNode(tokenType_1.TokenType.TypeParameter);
    node.name = parseIdentifier();
    if (readToken(tokenType_1.TokenType.ExtendsKeyword)) {
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
parseTypeParameters();
NodeArray < TypeParameterDeclaration > {
    if: function (token) {
        if (token === void 0) { token =  === tokenType_1.TokenType.LessThanToken; }
        return parseBracketedList(ParsingContext.TypeParameters, parseTypeParameter, tokenType_1.TokenType.LessThanToken, tokenType_1.TokenType.GreaterThanToken);
    }
};
parseParameterType();
TypeNode;
{
    if (readToken(tokenType_1.TokenType.ColonToken)) {
        return parseType();
    }
    return undefined;
}
isStartOfParameter();
boolean;
{
    return token === tokenType_1.TokenType.DotDotDotToken || isIdentifierOrPattern() || isModifierKind(token) || token === tokenType_1.TokenType.AtToken || token === tokenType_1.TokenType.ThisKeyword;
}
setModifiers(node, Node, modifiers, ModifiersArray);
{
    if (modifiers) {
        node.flags |= modifiers.flags;
        node.modifiers = modifiers;
    }
}
parseParameter();
ParameterDeclaration;
{
    var node = createNode(tokenType_1.TokenType.Parameter);
    if (token === tokenType_1.TokenType.ThisKeyword) {
        node.name = createIdentifier(/*isIdentifier*/ true, undefined);
        node.type = parseParameterType();
        return finishNode(node);
    }
    node.decorators = parseDecorators();
    setModifiers(node, parseModifiers());
    node.dotDotDotToken = readTokenToken(tokenType_1.TokenType.DotDotDotToken);
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
    node.questionToken = readTokenToken(tokenType_1.TokenType.QuestionToken);
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
parseBindingElementInitializer(inParameter, boolean);
{
    return inParameter ? parseParameterInitializer() : parseNonParameterInitializer();
}
parseParameterInitializer();
{
    return parseInitializer(/*inParameter*/ true);
}
fillSignature(returnToken, tokenType_1.TokenType, yieldContext, boolean, awaitContext, boolean, requireCompleteParameterList, boolean, signature, SignatureDeclaration);
void {
    const: returnTokenRequired = returnToken === tokenType_1.TokenType.EqualsGreaterThanToken,
    signature: .typeParameters = parseTypeParameters(),
    signature: .parameters = parseParameterList(yieldContext, awaitContext, requireCompleteParameterList),
    if: function (returnTokenRequired) {
        this.expectToken(returnToken);
        signature.type = parseTypeOrTypePredicate();
    },
    else: , if: function (readToken) {
        if (readToken === void 0) { readToken = (returnToken); }
        signature.type = parseTypeOrTypePredicate();
    }
};
parseParameterList(yieldContext, boolean, awaitContext, boolean, requireCompleteParameterList, boolean);
{
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
    if (this.expectToken(tokenType_1.TokenType.OpenParenToken)) {
        var savedYieldContext = inYieldContext();
        var savedAwaitContext = inAwaitContext();
        setYieldContext(yieldContext);
        setAwaitContext(awaitContext);
        var result_7 = parseDelimitedList(ParsingContext.Parameters, parseParameter);
        setYieldContext(savedYieldContext);
        setAwaitContext(savedAwaitContext);
        if (!this.expectToken(tokenType_1.TokenType.CloseParenToken) && requireCompleteParameterList) {
            // Caller insisted that we had to end with a )   We didn't.  So just return
            // undefined here.
            return undefined;
        }
        return result_7;
    }
    // We didn't even have an open paren.  If the caller requires a complete parameter list,
    // we definitely can't provide that.  However, if they're ok with an incomplete one,
    // then just return an empty set of parameters.
    return requireCompleteParameterList ? undefined : createMissingList();
}
parseTypeMemberSemicolon();
{
    // We allow type members to be separated by commas or (possibly ASI) semicolons.
    // First check if it was a comma.  If so, we're done with the member.
    if (readToken(tokenType_1.TokenType.CommaToken)) {
        return;
    }
    // Didn't have a comma.  We must have a (possible ASI) semicolon.
    parseSemicolon();
}
parseSignatureMember(kind, tokenType_1.TokenType);
CallSignatureDeclaration | ConstructSignatureDeclaration;
{
    var node = createNode(kind);
    if (kind === tokenType_1.TokenType.ConstructSignature) {
        this.expectToken(tokenType_1.TokenType.NewKeyword);
    }
    fillSignature(tokenType_1.TokenType.ColonToken, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
    parseTypeMemberSemicolon();
    return finishNode(node);
}
isIndexSignature();
boolean;
{
    if (token !== tokenType_1.TokenType.OpenBracketToken) {
        return false;
    }
    return lookAhead(isUnambiguouslyIndexSignature);
}
isUnambiguouslyIndexSignature();
{
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
    if (token === tokenType_1.TokenType.DotDotDotToken || token === tokenType_1.TokenType.CloseBracketToken) {
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
    if (token === tokenType_1.TokenType.ColonToken || token === tokenType_1.TokenType.CommaToken) {
        return true;
    }
    // Question mark could be an indexer with an optional property,
    // or it could be a conditional expression in a computed property.
    if (token !== tokenType_1.TokenType.QuestionToken) {
        return false;
    }
    // If any of the following tokens are after the question mark, it cannot
    // be a conditional expression, so treat it as an indexer.
    nextToken();
    return token === tokenType_1.TokenType.ColonToken || token === tokenType_1.TokenType.CommaToken || token === tokenType_1.TokenType.CloseBracketToken;
}
parseIndexSignatureDeclaration(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray);
IndexSignatureDeclaration;
{
    var node = createNode(tokenType_1.TokenType.IndexSignature, fullStart);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    node.parameters = parseBracketedList(ParsingContext.Parameters, parseParameter, tokenType_1.TokenType.OpenBracketToken, tokenType_1.TokenType.CloseBracketToken);
    node.type = parseTypeAnnotation();
    parseTypeMemberSemicolon();
    return finishNode(node);
}
parsePropertyOrMethodSignature(fullStart, number, modifiers, ModifiersArray);
PropertySignature | MethodSignature;
{
    var name_1 = parsePropertyName();
    var questionToken = readTokenToken(tokenType_1.TokenType.QuestionToken);
    if (token === tokenType_1.TokenType.OpenParenToken || token === tokenType_1.TokenType.LessThanToken) {
        var method = createNode(tokenType_1.TokenType.MethodSignature, fullStart);
        setModifiers(method, modifiers);
        method.name = name_1;
        method.questionToken = questionToken;
        // Method signatures don't exist in expression contexts.  So they have neither
        // [Yield] nor [Await]
        fillSignature(tokenType_1.TokenType.ColonToken, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, method);
        parseTypeMemberSemicolon();
        return finishNode(method);
    }
    else {
        var property = createNode(tokenType_1.TokenType.PropertySignature, fullStart);
        setModifiers(property, modifiers);
        property.name = name_1;
        property.questionToken = questionToken;
        property.type = parseTypeAnnotation();
        if (token === tokenType_1.TokenType.EqualsToken) {
            // Although type literal properties cannot not have initializers, we attempt
            // to parse an initializer so we can report in the checker that an interface
            // property or type literal property cannot have an initializer.
            property.initializer = parseNonParameterInitializer();
        }
        parseTypeMemberSemicolon();
        return finishNode(property);
    }
}
isTypeMemberStart();
boolean;
{
    var idToken = void 0;
    // Return true if we have the start of a signature member
    if (token === tokenType_1.TokenType.OpenParenToken || token === tokenType_1.TokenType.LessThanToken) {
        return true;
    }
    // Eat up all modifiers, but hold on to the lnodes one in case it is actually an identifier
    while (isModifierKind(token)) {
        idToken = token;
        nextToken();
    }
    // Index signatures and computed property names are type members
    if (token === tokenType_1.TokenType.OpenBracketToken) {
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
        return token === tokenType_1.TokenType.OpenParenToken ||
            token === tokenType_1.TokenType.LessThanToken ||
            token === tokenType_1.TokenType.QuestionToken ||
            token === tokenType_1.TokenType.ColonToken ||
            autoInsertSemicolon();
    }
    return false;
}
parseTypeMember();
TypeElement;
{
    if (token === tokenType_1.TokenType.OpenParenToken || token === tokenType_1.TokenType.LessThanToken) {
        return parseSignatureMember(tokenType_1.TokenType.CallSignature);
    }
    if (token === tokenType_1.TokenType.NewKeyword && lookAhead(isStartOfConstructSignature)) {
        return parseSignatureMember(tokenType_1.TokenType.ConstructSignature);
    }
    var fullStart = getNodePos();
    var modifiers_1 = parseModifiers();
    if (isIndexSignature()) {
        return parseIndexSignatureDeclaration(fullStart, /*decorators*/ undefined, modifiers_1);
    }
    return parsePropertyOrMethodSignature(fullStart, modifiers_1);
}
isStartOfConstructSignature();
{
    nextToken();
    return token === tokenType_1.TokenType.OpenParenToken || token === tokenType_1.TokenType.LessThanToken;
}
parseTypeLiteral();
TypeLiteralNode;
{
    var node = createNode(tokenType_1.TokenType.TypeLiteral);
    node.members = parseObjectTypeMembers();
    return finishNode(node);
}
parseObjectTypeMembers();
NodeArray < TypeElement > {
    let: members, NodeArray: function () { },
    if: function () { }, this: .expectToken(tokenType_1.TokenType.OpenBraceToken) };
{
    members = parseList(ParsingContext.TypeMembers, parseTypeMember);
    this.expectToken(tokenType_1.TokenType.CloseBraceToken);
}
{
    members = createMissingList();
}
return members;
parseTupleType();
TupleTypeNode;
{
    var node = createNode(tokenType_1.TokenType.TupleType);
    node.elementTypes = parseBracketedList(ParsingContext.TupleElementTypes, parseType, tokenType_1.TokenType.OpenBracketToken, tokenType_1.TokenType.CloseBracketToken);
    return finishNode(node);
}
parseParenthesizedType();
ParenthesizedTypeNode;
{
    var node = createNode(tokenType_1.TokenType.ParenthesizedType);
    this.expectToken(tokenType_1.TokenType.OpenParenToken);
    node.type = parseType();
    this.expectToken(tokenType_1.TokenType.CloseParenToken);
    return finishNode(node);
}
parseFunctionOrConstructorType(kind, tokenType_1.TokenType);
FunctionOrConstructorTypeNode;
{
    var node = createNode(kind);
    if (kind === tokenType_1.TokenType.ConstructorType) {
        this.expectToken(tokenType_1.TokenType.NewKeyword);
    }
    fillSignature(tokenType_1.TokenType.EqualsGreaterThanToken, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
    return finishNode(node);
}
parseKeywordAndNoDot();
TypeNode;
{
    var node = parseTokenNode();
    return token === tokenType_1.TokenType.DotToken ? undefined : node;
}
parseNonArrayType();
TypeNode;
{
    switch (token) {
        case tokenType_1.TokenType.Any:
        case tokenType_1.TokenType.String:
        case tokenType_1.TokenType.Number:
        case tokenType_1.TokenType.Boolean:
        case tokenType_1.TokenType.Symbol:
        case tokenType_1.TokenType.Undefined:
        case tokenType_1.TokenType.Never:
            // If these are followed by a dot, then parse these out as a dotted type reference instead.
            var node = tryParse(parseKeywordAndNoDot);
            return node || parseTypeReference();
        case tokenType_1.TokenType.StringLiteral:
            return parseStringLiteralTypeNode();
        case tokenType_1.TokenType.Void:
        case tokenType_1.TokenType.Null:
            return parseTokenNode();
        case tokenType_1.TokenType.This: {
            var thisKeyword = parseThisTypeNode();
            if (token === tokenType_1.TokenType.IsKeyword && !scanner.hasPrecedingLineBreak()) {
                return parseThisTypePredicate(thisKeyword);
            }
            else {
                return thisKeyword;
            }
        }
        case tokenType_1.TokenType.TypeOf:
            return parseTypeQuery();
        case tokenType_1.TokenType.OpenBraceToken:
            return parseTypeLiteral();
        case tokenType_1.TokenType.OpenBracketToken:
            return parseTupleType();
        case tokenType_1.TokenType.OpenParenToken:
            return parseParenthesizedType();
        default:
            return parseTypeReference();
    }
}
isStartOfType();
boolean;
{
    switch (token) {
        case tokenType_1.TokenType.Any:
        case tokenType_1.TokenType.String:
        case tokenType_1.TokenType.Number:
        case tokenType_1.TokenType.Boolean:
        case tokenType_1.TokenType.Symbol:
        case tokenType_1.TokenType.Void:
        case tokenType_1.TokenType.Undefined:
        case tokenType_1.TokenType.Null:
        case tokenType_1.TokenType.This:
        case tokenType_1.TokenType.TypeOf:
        case tokenType_1.TokenType.Never:
        case tokenType_1.TokenType.OpenBraceToken:
        case tokenType_1.TokenType.OpenBracketToken:
        case tokenType_1.TokenType.LessThanToken:
        case tokenType_1.TokenType.New:
        case tokenType_1.TokenType.StringLiteral:
            return true;
        case tokenType_1.TokenType.OpenParenToken:
            // Only consider '(' the start of a type if followed by ')', '...', an identifier, a modifier,
            // or something that starts a type. We don't want to consider things like '(1)' a type.
            return lookAhead(isStartOfParenthesizedOrFunctionType);
        default:
            return isIdentifier();
    }
}
isStartOfParenthesizedOrFunctionType();
{
    nextToken();
    return token === tokenType_1.TokenType.CloseParenToken || isStartOfParameter() || isStartOfType();
}
parseArrayTypeOrHigher();
TypeNode;
{
    var type_1 = parseNonArrayType();
    while (!scanner.hasPrecedingLineBreak() && readToken(tokenType_1.TokenType.OpenBracketToken)) {
        this.expectToken(tokenType_1.TokenType.CloseBracketToken);
        var node = createNode(tokenType_1.TokenType.ArrayType, type_1.pos);
        node.elementType = type_1;
        type_1 = finishNode(node);
    }
    return type_1;
}
parseUnionOrIntersectionType(kind, tokenType_1.TokenType, parseConstituentType, function () { return TypeNode; }, operator, tokenType_1.TokenType);
TypeNode;
{
    var type_2 = parseConstituentType();
    if (token === operator) {
        var types = [type_2];
        types.pos = type_2.pos;
        while (readToken(operator)) {
            types.push(parseConstituentType());
        }
        types.end = getNodeEnd();
        var node = createNode(kind, type_2.pos);
        node.types = types;
        type_2 = finishNode(node);
    }
    return type_2;
}
parseIntersectionTypeOrHigher();
TypeNode;
{
    return parseUnionOrIntersectionType(tokenType_1.TokenType.IntersectionType, parseArrayTypeOrHigher, tokenType_1.TokenType.AmpersandToken);
}
parseUnionTypeOrHigher();
TypeNode;
{
    return parseUnionOrIntersectionType(tokenType_1.TokenType.UnionType, parseIntersectionTypeOrHigher, tokenType_1.TokenType.BarToken);
}
isStartOfFunctionType();
boolean;
{
    if (token === tokenType_1.TokenType.LessThanToken) {
        return true;
    }
    return token === tokenType_1.TokenType.OpenParenToken && lookAhead(isUnambiguouslyStartOfFunctionType);
}
skipParameterStart();
boolean;
{
    if (isModifierKind(token)) {
        // Skip modifiers
        parseModifiers();
    }
    if (isIdentifier() || token === tokenType_1.TokenType.ThisKeyword) {
        nextToken();
        return true;
    }
    if (token === tokenType_1.TokenType.OpenBracketToken || token === tokenType_1.TokenType.OpenBraceToken) {
        // Return true if we can parse an array or object binding pattern with no errors
        var previousErrorCount = parseDiagnostics.length;
        parseIdentifierOrPattern();
        return previousErrorCount === parseDiagnostics.length;
    }
    return false;
}
isUnambiguouslyStartOfFunctionType();
{
    nextToken();
    if (token === tokenType_1.TokenType.CloseParenToken || token === tokenType_1.TokenType.DotDotDotToken) {
        // ( )
        // ( ...
        return true;
    }
    if (skipParameterStart()) {
        // We successfully skipped modifiers (if any) and an identifier or binding pattern,
        // now see if we have something that indicates a parameter declaration
        if (token === tokenType_1.TokenType.ColonToken || token === tokenType_1.TokenType.CommaToken ||
            token === tokenType_1.TokenType.QuestionToken || token === tokenType_1.TokenType.EqualsToken) {
            // ( xxx :
            // ( xxx ,
            // ( xxx ?
            // ( xxx =
            return true;
        }
        if (token === tokenType_1.TokenType.CloseParenToken) {
            nextToken();
            if (token === tokenType_1.TokenType.EqualsGreaterThanToken) {
                // ( xxx ) =>
                return true;
            }
        }
    }
    return false;
}
parseTypeOrTypePredicate();
TypeNode;
{
    var typePredicateVariable = isIdentifier() && tryParse(parseTypePredicatePrefix);
    var type_3 = parseType();
    if (typePredicateVariable) {
        var node = createNode(tokenType_1.TokenType.TypePredicate, typePredicateVariable.pos);
        node.parameterName = typePredicateVariable;
        node.type = type_3;
        return finishNode(node);
    }
    else {
        return type_3;
    }
}
parseTypePredicatePrefix();
{
    var id = parseIdentifier();
    if (token === tokenType_1.TokenType.IsKeyword && !scanner.hasPrecedingLineBreak()) {
        nextToken();
        return id;
    }
}
parseType();
TypeNode;
{
    // The rules about 'yield' only apply to actual code/expression contexts.  They don't
    // apply to 'type' contexts.  So we disable these parameters here before moving on.
    return doOutsideOfContext(NodeFlags.TypeExcludesFlags, parseTypeWorker);
}
parseTypeWorker();
TypeNode;
{
    if (isStartOfFunctionType()) {
        return parseFunctionOrConstructorType(tokenType_1.TokenType.FunctionType);
    }
    if (token === tokenType_1.TokenType.NewKeyword) {
        return parseFunctionOrConstructorType(tokenType_1.TokenType.ConstructorType);
    }
    return parseUnionTypeOrHigher();
}
parseTypeAnnotation();
TypeNode;
{
    return readToken(tokenType_1.TokenType.ColonToken) ? parseType() : undefined;
}
isStartOfLeftHandSideExpression();
boolean;
{
    switch (token) {
        case tokenType_1.TokenType.This:
        case tokenType_1.TokenType.Super:
        case tokenType_1.TokenType.Null:
        case tokenType_1.TokenType.True:
        case tokenType_1.TokenType.False:
        case tokenType_1.TokenType.NumericLiteral:
        case tokenType_1.TokenType.StringLiteral:
        case tokenType_1.TokenType.NoSubstitutionTemplateLiteral:
        case tokenType_1.TokenType.TemplateHead:
        case tokenType_1.TokenType.OpenParenToken:
        case tokenType_1.TokenType.OpenBracketToken:
        case tokenType_1.TokenType.OpenBraceToken:
        case tokenType_1.TokenType.Function:
        case tokenType_1.TokenType.Class:
        case tokenType_1.TokenType.New:
        case tokenType_1.TokenType.SlashToken:
        case tokenType_1.TokenType.SlashEqualsToken:
        case tokenType_1.TokenType.Identifier:
            return true;
        default:
            return isIdentifier();
    }
}
fallowsExpression();
boolean;
{
    if (isStartOfLeftHandSideExpression()) {
        return true;
    }
    switch (token) {
        case tokenType_1.TokenType.PlusToken:
        case tokenType_1.TokenType.MinusToken:
        case tokenType_1.TokenType.TildeToken:
        case tokenType_1.TokenType.ExclamationToken:
        case tokenType_1.TokenType.Delete:
        case tokenType_1.TokenType.TypeOf:
        case tokenType_1.TokenType.Void:
        case tokenType_1.TokenType.PlusPlusToken:
        case tokenType_1.TokenType.MinusMinusToken:
        case tokenType_1.TokenType.LessThanToken:
        case tokenType_1.TokenType.Await:
        case tokenType_1.TokenType.Yield:
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
fallowsExpressionStatement();
boolean;
{
    // As per the grammar, none of '{' or 'private' or 'class' can start an expression statement.
    return token !== tokenType_1.TokenType.OpenBraceToken &&
        token !== tokenType_1.TokenType.FunctionKeyword &&
        token !== tokenType_1.TokenType.ClassKeyword &&
        token !== tokenType_1.TokenType.AtToken &&
        fallowsExpression();
}
parseInitializer(inParameter, boolean);
Expression;
{
    if (token !== tokenType_1.TokenType.EqualsToken) {
        // It's not uncommon during typing for the user to miss writing the '=' token.  Check if
        // there is no newline after the lnodes token and if we're on an expression.  If so, parse
        // this as an equals-value clause with a missing equals.
        // NOTE: There are two places where we allow equals-value clauses.  The first is in a
        // variable declarator.  The second is with a parameter.  For variable declarators
        // it's more likely that a { would be a allowed (as an object literal).  While this
        // is also allowed for parameters, the risk is that we consume the { as an object
        // literal when it really will be for the block following the parameter.
        if (scanner.hasPrecedingLineBreak() || (inParameter && token === tokenType_1.TokenType.OpenBraceToken) || !fallowsExpression()) {
            // preceding line break, open brace in a parameter (likely a private body) or current token is not an expression -
            // do not try to parse initializer
            return undefined;
        }
    }
    // Initializer[In, Yield] :
    //     = AssignmentExpression[?In, ?Yield]
    this.expectToken(tokenType_1.TokenType.EqualsToken);
    return parseAssignmentExpressionOrHigher();
}
parseAssignmentExpressionOrHigher();
{
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
    var yieldExpression = this.tryParseYieldExpression();
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
    var arrowExpression = this.tryParseLambdaLiteral();
    this.tryParseParenthesizedArrowFunctionExpression() || this.tryParseAsyncSimpleArrowFunctionExpression();
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
    var expr = this.parseBinaryExpressionOrHigher(/*precedence*/ 0);
    // To avoid a look-ahead, we did not handle the case of an arrow private with a single un-parenthesized
    // parameter ('x => ...') above. We handle it here by checking if the parsed expression was a single
    // identifier and the current token is an arrow.
    if (expr.kind === tokenType_1.TokenType.identifier && token === tokenType_1.TokenType.EqualsGreaterThanToken) {
        return parseSimpleArrowFunctionExpression(expr);
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
tryParseYieldExpression();
{
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
    if (this.lexer.tokenType === tokenType_1.TokenType.yield && (this.flags & ParseFlags.allowYield) && this.nextTokenIsIdentifierOrKeywordOrNumberOnSameLine()) {
        return this.parseYieldExpression();
    }
}
parseYieldExpression();
{
    // YieldExpression[In] :
    //      yield
    //      yield [no LineTerminator here] [Lexical goal InputElementRegExp]AssignmentExpression[?In, Yield]
    //      yield [no LineTerminator here] * [Lexical goal InputElementRegExp]AssignmentExpression[?In, Yield]
    // #assert this.lexer.currentToken.type === TokenType.yield
    var result_8 = new nodes.YieldExpression();
    result_8.start = this.lexer.read().start; // yield
    if (!this.lexer.currentToken.hasLineTerminatorBeforeStart) {
        if (this.lexer.tokenType === tokenType_1.TokenType.nodeserisk) {
            result_8.nodeseriskStart = this.lexer.read().start;
            result_8.value = this.parseAssignmentExpressionOrHigher();
        }
        else if (this.fallowsExpression()) {
            result_8.value = this.parseAssignmentExpressionOrHigher();
        }
    }
    return result_8;
}
nextTokenIsIdentifierOnSameLine();
{
    nextToken();
    return !scanner.hasPrecedingLineBreak() && isIdentifier();
}
parseSimpleArrowFunctionExpression(identifier, Identifier, asyncModifier ?  : ModifiersArray);
ArrowFunction;
{
    Debug.assert(token === tokenType_1.TokenType.EqualsGreaterThanToken, "parseSimpleArrowFunctionExpression should only have been called if we had a =>");
    var node = void 0;
    if (asyncModifier) {
        node = createNode(tokenType_1.TokenType.ArrowFunction, asyncModifier.pos);
        setModifiers(node, asyncModifier);
    }
    else {
        node = createNode(tokenType_1.TokenType.ArrowFunction, identifier.pos);
    }
    var parameter = createNode(tokenType_1.TokenType.Parameter, identifier.pos);
    parameter.name = identifier;
    finishNode(parameter);
    node.parameters = [parameter];
    node.parameters.pos = parameter.pos;
    node.parameters.end = parameter.end;
    node.equalsGreaterThanToken = this.expectTokenToken(tokenType_1.TokenType.EqualsGreaterThanToken, /*reportAtCurrentPosition*/ false, Diagnostics._0_expected, "=>");
    node.body = parseArrowFunctionExpressionBody(/*isAsync*/ !!asyncModifier);
    return finishNode(node);
}
tryParseLambdaLiteral();
{
}
tryParseParenthesizedArrowFunctionExpression();
{
    var mustBeArrowFunction = void 0;
    switch (this.lexer.tokenType) {
        case tokenType_1.TokenType.openParen:
        case tokenType_1.TokenType.lessThan:
        case tokenType_1.TokenType.async:
            mustBeArrowFunction = this.isParenthesizedArrowFunctionExpressionWorker();
            break;
        case tokenType_1.TokenType.equalsGreaterThan:
            mustBeArrowFunction = true;
            break;
        default:
            return;
    }
    var triState = this.isParenthesizedArrowFunctionExpression();
    if (triState === false) {
        // It's definitely not a parenthesized arrow private expression.
        return undefined;
    }
    // If we definitely have an arrow private, then we can just parse one, not requiring a
    // following => or { token. Otherwise, we *might* have an arrow private.  Try to parse
    // it out, but don't allow any ambiguity, and return 'undefined' if this could be an
    // expression instead.
    var arrowFunction = triState === true
        ? parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ true)
        : tryParse(parsePossibleParenthesizedArrowFunctionExpressionHead);
    if (!arrowFunction) {
        // Didn't appear to actually be a parenthesized arrow private.  Just bail out.
        return undefined;
    }
    var isAsync = !!(arrowFunction.flags & NodeFlags.Async);
    // If we have an arrow, then try to parse the body. Even if not, try to parse if we
    // have an opening brace, just in case we're in an error state.
    var lnodesToken = token;
    arrowFunction.equalsGreaterThanToken = this.expectTokenToken(tokenType_1.TokenType.EqualsGreaterThanToken, /*reportAtCurrentPosition*/ false, Diagnostics._0_expected, "=>");
    arrowFunction.body = (lnodesToken === tokenType_1.TokenType.EqualsGreaterThanToken || lnodesToken === tokenType_1.TokenType.OpenBraceToken)
        ? parseArrowFunctionExpressionBody(isAsync)
        : parseIdentifier();
    return finishNode(arrowFunction);
}
isParenthesizedArrowFunctionExpression();
{
}
isParenthesizedArrowFunctionExpressionWorker();
{
    this.lexer.stashSave();
    if (this.lexer.currentToken.type === tokenType_1.TokenType.async) {
        this.lexer.read();
        if (this.lexer.currentToken.hasLineTerminatorBeforeStart) {
            return false;
        }
        if (this.lexer.currentToken.type !== tokenType_1.TokenType.openParen && this.lexer.currentToken.type !== tokenType_1.TokenType.lessThanSlash) {
            return false;
        }
    }
    var first_1 = token;
    var second = nextToken();
    if (first_1 === tokenType_1.TokenType.openParen) {
        if (second === tokenType_1.TokenType.closeParen) {
            // Simple cases: "() =>", "(): ", and  "() {".
            // This is an arrow private with no parameters.
            // The lnodes one is not actually an arrow private,
            // but this is probably what the user intended.
            var third = nextToken();
            switch (third) {
                case tokenType_1.TokenType.equalsGreaterThan:
                case tokenType_1.TokenType.colon:
                case tokenType_1.TokenType.openParen:
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
        if (second === tokenType_1.TokenType.openBracket || second === tokenType_1.TokenType.openBrace) {
            return null;
        }
        // Simple case: "(..."
        // This is an arrow private with a rest parameter.
        if (second === tokenType_1.TokenType.dotDotDot) {
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
        if (nextToken() === tokenType_1.TokenType.colonToken) {
            return Tristate.True;
        }
        // This *could* be a parenthesized arrow private.
        // Return Unknown to let the caller know.
        return Tristate.Unknown;
    }
    else {
        Debug.assert(first_1 === tokenType_1.TokenType.LessThanToken);
        // If we have "<" not followed by an identifier,
        // then this definitely is not an arrow private.
        if (!isIdentifier()) {
            return Tristate.False;
        }
        // JSX overrides
        if (sourceFile.languageVariant === LanguageVariant.JSX) {
            var isArrowFunctionInJsx = lookAhead(function () {
                var third = nextToken();
                if (third === tokenType_1.TokenType.ExtendsKeyword) {
                    var fourth = nextToken();
                    switch (fourth) {
                        case tokenType_1.TokenType.EqualsToken:
                        case tokenType_1.TokenType.GreaterThanToken:
                            return false;
                        default:
                            return true;
                    }
                }
                else if (third === tokenType_1.TokenType.CommaToken) {
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
parsePossibleParenthesizedArrowFunctionExpressionHead();
ArrowFunction;
{
    return parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ false);
}
tryParseAsyncSimpleArrowFunctionExpression();
ArrowFunction;
{
    // We do a check here so that we won't be doing unnecessarily call to "lookAhead"
    if (token === tokenType_1.TokenType.AsyncKeyword) {
        var isUnParenthesizedAsyncArrowFunction = lookAhead(isUnParenthesizedAsyncArrowFunctionWorker);
        if (isUnParenthesizedAsyncArrowFunction === Tristate.True) {
            var asyncModifier = parseModifiersForArrowFunction();
            var expr = parseBinaryExpressionOrHigher(/*precedence*/ 0);
            return parseSimpleArrowFunctionExpression(expr, asyncModifier);
        }
    }
    return undefined;
}
isUnParenthesizedAsyncArrowFunctionWorker();
Tristate;
{
    // AsyncArrowFunctionExpression:
    //      1) async[no LineTerminator here]AsyncArrowBindingIdentifier[?Yield][no LineTerminator here]=>AsyncConciseBody[?In]
    //      2) CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await][no LineTerminator here]=>AsyncConciseBody[?In]
    if (token === tokenType_1.TokenType.AsyncKeyword) {
        nextToken();
        // If the "async" is followed by "=>" token then it is not a begining of an async arrow-private
        // but instead a simple arrow-private which will be parsed inside "parseAssignmentExpressionOrHigher"
        if (scanner.hasPrecedingLineBreak() || token === tokenType_1.TokenType.EqualsGreaterThanToken) {
            return Tristate.False;
        }
        // Check for un-parenthesized AsyncArrowFunction
        var expr = parseBinaryExpressionOrHigher(/*precedence*/ 0);
        if (!scanner.hasPrecedingLineBreak() && expr.kind === tokenType_1.TokenType.Identifier && token === tokenType_1.TokenType.EqualsGreaterThanToken) {
            return Tristate.True;
        }
    }
    return Tristate.False;
}
parseParenthesizedArrowFunctionExpressionHead(allowAmbiguity, boolean);
ArrowFunction;
{
    var node = createNode(tokenType_1.TokenType.ArrowFunction);
    setModifiers(node, parseModifiersForArrowFunction());
    var isAsync = !!(node.flags & NodeFlags.Async);
    // Arrow privates are never generators.
    //
    // If we're speculatively parsing a signature for a parenthesized arrow private, then
    // we have to have a complete parameter list.  Otherwise we might see something like
    // a => (b => c)
    // And think that "(b =>" was actually a parenthesized arrow private with a missing
    // close paren.
    fillSignature(tokenType_1.TokenType.ColonToken, /*yieldContext*/ false, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ !allowAmbiguity, node);
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
    if (!allowAmbiguity && token !== tokenType_1.TokenType.EqualsGreaterThanToken && token !== tokenType_1.TokenType.OpenBraceToken) {
        // Returning undefined here will cause our caller to rewind to where we started from.
        return undefined;
    }
    return node;
}
parseArrowFunctionExpressionBody(isAsync, boolean);
Block | Expression;
{
    if (token === tokenType_1.TokenType.OpenBraceToken) {
        return parseFunctionBlock(/*allowYield*/ false, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);
    }
    if (token !== tokenType_1.TokenType.SemicolonToken &&
        token !== tokenType_1.TokenType.FunctionKeyword &&
        token !== tokenType_1.TokenType.ClassKeyword &&
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
parseConditionalExpressionRest(leftOperand, Expression);
Expression;
{
    // Note: we are passed in an expression which was produced from parseBinaryExpressionOrHigher.
    var questionToken = readTokenToken(tokenType_1.TokenType.QuestionToken);
    if (!questionToken) {
        return leftOperand;
    }
    // Note: we explicitly 'allowIn' in the whenTrue part of the condition expression, and
    // we do not that for the 'whenFalse' part.
    var node = createNode(tokenType_1.TokenType.ConditionalExpression, leftOperand.pos);
    node.condition = leftOperand;
    node.questionToken = questionToken;
    node.whenTrue = doOutsideOfContext(disallowInAndDecoratorContext, parseAssignmentExpressionOrHigher);
    node.colonToken = this.expectTokenToken(tokenType_1.TokenType.ColonToken, /*reportAtCurrentPosition*/ false, Diagnostics._0_expected, tokenType_1.tokenToString(tokenType_1.TokenType.ColonToken));
    node.whenFalse = parseAssignmentExpressionOrHigher();
    return finishNode(node);
}
parseBinaryExpressionOrHigher(precedence, number);
{
    var leftOperand = this.parseUnaryExpressionOrHigher();
    return this.parseBinaryExpressionRest(precedence, leftOperand);
}
isInOrOfKeyword(t, tokenType_1.TokenType);
{
    return t === tokenType_1.TokenType.InKeyword || t === tokenType_1.TokenType.OfKeyword;
}
parseBinaryExpressionRest(precedence, number, leftOperand, Expression);
Expression;
{
    while (true) {
        // We either have a binary operator here, or we're finished.  We call
        // reScanGreaterToken so that we merge token sequences like > and = into >=
        reScanGreaterToken();
        var newPrecedence = getBinaryOperatorPrecedence();
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
        var consumeCurrentOperator = token === tokenType_1.TokenType.AsteriskAsteriskToken ?
            newPrecedence >= precedence :
            newPrecedence > precedence;
        if (!consumeCurrentOperator) {
            break;
        }
        if (token === tokenType_1.TokenType.InKeyword && inDisallowInContext()) {
            break;
        }
        if (token === tokenType_1.TokenType.AsKeyword) {
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
isBinaryOperator();
{
    if (inDisallowInContext() && token === tokenType_1.TokenType.InKeyword) {
        return false;
    }
    return getBinaryOperatorPrecedence() > 0;
}
getBinaryOperatorPrecedence();
number;
{
    switch (token) {
        case tokenType_1.TokenType.BarBarToken:
            return 1;
        case tokenType_1.TokenType.AmpersandAmpersandToken:
            return 2;
        case tokenType_1.TokenType.BarToken:
            return 3;
        case tokenType_1.TokenType.CaretToken:
            return 4;
        case tokenType_1.TokenType.AmpersandToken:
            return 5;
        case tokenType_1.TokenType.EqualsEqualsToken:
        case tokenType_1.TokenType.ExclamationEqualsToken:
        case tokenType_1.TokenType.EqualsEqualsEqualsToken:
        case tokenType_1.TokenType.ExclamationEqualsEqualsToken:
            return 6;
        case tokenType_1.TokenType.LessThanToken:
        case tokenType_1.TokenType.GreaterThanToken:
        case tokenType_1.TokenType.LessThanEqualsToken:
        case tokenType_1.TokenType.GreaterThanEqualsToken:
        case tokenType_1.TokenType.InstanceOf:
        case tokenType_1.TokenType.In:
        case tokenType_1.TokenType.As:
            return 7;
        case tokenType_1.TokenType.LessThanLessThanToken:
        case tokenType_1.TokenType.GreaterThanGreaterThanToken:
        case tokenType_1.TokenType.GreaterThanGreaterThanGreaterThanToken:
            return 8;
        case tokenType_1.TokenType.PlusToken:
        case tokenType_1.TokenType.MinusToken:
            return 9;
        case tokenType_1.TokenType.AsteriskToken:
        case tokenType_1.TokenType.SlashToken:
        case tokenType_1.TokenType.PercentToken:
            return 10;
        case tokenType_1.TokenType.AsteriskAsteriskToken:
            return 11;
    }
    // -1 is lower than all other precedences.  Returning it will cause binary expression
    // parsing to stop.
    return -1;
}
makeBinaryExpression(left, nodes.Expression, operator, tokenType_1.TokenType, operatorStart, number, right, nodes.Expression);
{
    var result_9 = new nodes.BinaryExpression();
    result_9.leftOperand = left;
    result_9.operator = operator;
    result_9.operatorStart = operatorStart;
    result_9.rightOperand = right;
    return result_9;
}
makeAsExpression(left, Expression, right, TypeNode);
AsExpression;
{
    var node = createNode(tokenType_1.TokenType.AsExpression, left.pos);
    node.expression = left;
    node.type = right;
    return finishNode(node);
}
parsePrefixUnaryExpression();
{
    var node = createNode(tokenType_1.TokenType.PrefixUnaryExpression);
    node.operator = token;
    nextToken();
    node.operand = parseSimpleUnaryExpression();
    return finishNode(node);
}
parseDeleteExpression();
{
    var node = createNode(tokenType_1.TokenType.DeleteExpression);
    nextToken();
    node.expression = parseSimpleUnaryExpression();
    return finishNode(node);
}
parseTypeOfExpression();
{
    var node = createNode(tokenType_1.TokenType.TypeOfExpression);
    nextToken();
    node.expression = parseSimpleUnaryExpression();
    return finishNode(node);
}
parseVoidExpression();
{
    var node = createNode(tokenType_1.TokenType.VoidExpression);
    nextToken();
    node.expression = parseSimpleUnaryExpression();
    return finishNode(node);
}
isAwaitExpression();
boolean;
{
    if (token === tokenType_1.TokenType.AwaitKeyword) {
        if (inAwaitContext()) {
            return true;
        }
        // here we are using similar heuristics as 'isYieldExpression'
        return lookAhead(nextTokenIsIdentifierOnSameLine);
    }
    return false;
}
parseAwaitExpression();
{
    var node = createNode(tokenType_1.TokenType.AwaitExpression);
    nextToken();
    node.expression = parseSimpleUnaryExpression();
    return finishNode(node);
}
parseUnaryExpressionOrHigher();
{
    if (this.isAwaitExpression()) {
        return this.parseAwaitExpression();
    }
    if (this.isIncrementExpression()) {
        var incrementExpression = this.parseIncrementExpression();
        return this.lexer.currentToken.type === tokenType_1.TokenType.nodeseriskAsterisk ?
            parseBinaryExpressionRest(getBinaryOperatorPrecedence(), incrementExpression) :
            incrementExpression;
    }
    var unaryOperator = token;
    var simpleUnaryExpression = parseSimpleUnaryExpression();
    if (token === tokenType_1.TokenType.AsteriskAsteriskToken) {
        var start = skipTrivia(sourceText, simpleUnaryExpression.pos);
        if (simpleUnaryExpression.kind === tokenType_1.TokenType.TypeAssertionExpression) {
            parseErrorAtPosition(start, simpleUnaryExpression.end - start, Diagnostics.A_type_assertion_expression_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses);
        }
        else {
            parseErrorAtPosition(start, simpleUnaryExpression.end - start, Diagnostics.An_unary_expression_with_the_0_operator_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses, tokenType_1.tokenToString(unaryOperator));
        }
    }
    return simpleUnaryExpression;
}
parseSimpleUnaryExpression();
UnaryExpression;
{
    switch (token) {
        case tokenType_1.TokenType.PlusToken:
        case tokenType_1.TokenType.MinusToken:
        case tokenType_1.TokenType.TildeToken:
        case tokenType_1.TokenType.ExclamationToken:
            return parsePrefixUnaryExpression();
        case tokenType_1.TokenType.Delete:
            return parseDeleteExpression();
        case tokenType_1.TokenType.TypeOf:
            return parseTypeOfExpression();
        case tokenType_1.TokenType.Void:
            return parseVoidExpression();
        case tokenType_1.TokenType.LessThanToken:
            // This is modified UnaryExpression grammar in TypeScript
            //  UnaryExpression (modified):
            //      < type > UnaryExpression
            return parseTypeAssertion();
        default:
            return parseIncrementExpression();
    }
}
isIncrementExpression();
boolean;
{
    // This private is called inside parseUnaryExpression to decide
    // whether to call parseSimpleUnaryExpression or call parseIncrementExpression directly
    switch (token) {
        case tokenType_1.TokenType.PlusToken:
        case tokenType_1.TokenType.MinusToken:
        case tokenType_1.TokenType.TildeToken:
        case tokenType_1.TokenType.ExclamationToken:
        case tokenType_1.TokenType.Delete:
        case tokenType_1.TokenType.TypeOf:
        case tokenType_1.TokenType.Void:
            return false;
        case tokenType_1.TokenType.LessThanToken:
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
parseIncrementExpression();
IncrementExpression;
{
    if (token === tokenType_1.TokenType.PlusPlusToken || token === tokenType_1.TokenType.MinusMinusToken) {
        var node = createNode(tokenType_1.TokenType.PrefixUnaryExpression);
        node.operator = token;
        nextToken();
        node.operand = parseLeftHandSideExpressionOrHigher();
        return finishNode(node);
    }
    else if (sourceFile.languageVariant === LanguageVariant.JSX && token === tokenType_1.TokenType.LessThanToken && lookAhead(nextTokenIsIdentifierOrKeyword)) {
        // JSXElement is part of primaryExpression
        return parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ true);
    }
    var expression = parseLeftHandSideExpressionOrHigher();
    Debug.assert(isLeftHandSideExpression(expression));
    if ((token === tokenType_1.TokenType.PlusPlusToken || token === tokenType_1.TokenType.MinusMinusToken) && !scanner.hasPrecedingLineBreak()) {
        var node = createNode(tokenType_1.TokenType.PostfixUnaryExpression, expression.pos);
        node.operand = expression;
        node.operator = token;
        nextToken();
        return finishNode(node);
    }
    return expression;
}
parseLeftHandSideExpressionOrHigher();
LeftHandSideExpression;
{
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
    var expression = token === tokenType_1.TokenType.SuperKeyword
        ? parseSuperExpression()
        : parseMemberExpressionOrHigher();
    // Now, we *may* be complete.  However, we might have consumed the start of a
    // CallExpression.  As such, we need to consume the rest of it here to be complete.
    return parseCallExpressionRest(expression);
}
parseMemberExpressionOrHigher();
MemberExpression;
{
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
    var expression = parsePrimaryExpression();
    return parseMemberExpressionRest(expression);
}
parseSuperExpression();
MemberExpression;
{
    var expression = parseTokenNode();
    if (token === tokenType_1.TokenType.OpenParenToken || token === tokenType_1.TokenType.DotToken || token === tokenType_1.TokenType.OpenBracketToken) {
        return expression;
    }
    // If we have seen "super" it must be followed by '(' or '.'.
    // If it wasn't then just try to parse out a '.' and report an error.
    var node = createNode(tokenType_1.TokenType.PropertyAccessExpression, expression.pos);
    node.expression = expression;
    this.expectTokenToken(tokenType_1.TokenType.DotToken, /*reportAtCurrentPosition*/ false, Diagnostics.super_must_be_followed_by_an_argument_list_or_member_access);
    node.name = parseRightSideOfDot(/*allowIdentifierNames*/ true);
    return finishNode(node);
}
tagNamesAreEquivalent(lhs, JsxTagNameExpression, rhs, JsxTagNameExpression);
boolean;
{
    if (lhs.kind !== rhs.kind) {
        return false;
    }
    if (lhs.kind === tokenType_1.TokenType.Identifier) {
        return lhs.text === rhs.text;
    }
    if (lhs.kind === tokenType_1.TokenType.ThisKeyword) {
        return true;
    }
    // If we are at this statement then we must have PropertyAccessExpression and because tag name in Jsx element can only
    // take forms of JsxTagNameExpression which includes an identifier, "this" expression, or another propertyAccessExpression
    // it is safe to case the expression property as such. See parseJsxElementName for how we parse tag name in Jsx element
    return lhs.name.text === rhs.name.text &&
        tagNamesAreEquivalent(lhs.expression, rhs.expression);
}
parseJsxElementOrSelfClosingElement(inExpressionContext, boolean);
JsxElement | JsxSelfClosingElement;
{
    var opening = parseJsxOpeningOrSelfClosingElement(inExpressionContext);
    var result_10;
    if (opening.kind === tokenType_1.TokenType.JsxOpeningElement) {
        var node = createNode(tokenType_1.TokenType.JsxElement, opening.pos);
        node.openingElement = opening;
        node.children = parseJsxChildren(node.openingElement.tagName);
        node.closingElement = parseJsxClosingElement(inExpressionContext);
        if (!tagNamesAreEquivalent(node.openingElement.tagName, node.closingElement.tagName)) {
            parseErrorAtPosition(node.closingElement.pos, node.closingElement.end - node.closingElement.pos, Diagnostics.Expected_corresponding_JSX_closing_tag_for_0, getTextOfNodeFromSourceText(sourceText, node.openingElement.tagName));
        }
        result_10 = finishNode(node);
    }
    else {
        Debug.assert(opening.kind === tokenType_1.TokenType.JsxSelfClosingElement);
        // Nothing else to do for self-closing elements
        result_10 = opening;
    }
    // If the user writes the invalid code '<div></div><div></div>' in an expression context (i.e. not wrapped in
    // an enclosing tag), we'll naively try to parse   ^ this as a 'less than' operator and the remainder of the tag
    // as garbage, which will cause the formatter to badly mangle the JSX. Perform a speculative parse of a JSX
    // element if we see a < token so that we can wrap it in a synthetic binary expression so the formatter
    // does less damage and we can report a better error.
    // Since JSX elements are invalid < operands anyway, this lookahead parse will only occur in error scenarios
    // of one sort or another.
    if (inExpressionContext && token === tokenType_1.TokenType.LessThanToken) {
        var invalidElement = tryParse(function () { return parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ true); });
        if (invalidElement) {
            parseErrorAtCurrentToken(Diagnostics.JSX_expressions_must_have_one_parent_element);
            var badNode = createNode(tokenType_1.TokenType.BinaryExpression, result_10.pos);
            badNode.end = invalidElement.end;
            badNode.left = result_10;
            badNode.right = invalidElement;
            badNode.operatorToken = createMissingNode(tokenType_1.TokenType.CommaToken, /*reportAtCurrentPosition*/ false, /*diagnosticMessage*/ undefined);
            badNode.operatorToken.pos = badNode.operatorToken.end = badNode.right.pos;
            return badNode;
        }
    }
    return result_10;
}
parseJsxText();
JsxText;
{
    var node = createNode(tokenType_1.TokenType.JsxText, scanner.getStartPos());
    token = scanner.scanJsxToken();
    return finishNode(node);
}
parseJsxChild();
JsxChild;
{
    switch (token) {
        case tokenType_1.TokenType.JsxText:
            return parseJsxText();
        case tokenType_1.TokenType.OpenBraceToken:
            return parseJsxExpression(/*inExpressionContext*/ false);
        case tokenType_1.TokenType.LessThanToken:
            return parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ false);
    }
    Debug.fail("Unknown JSX child kind " + token);
}
parseJsxChildren(openingTagName, LeftHandSideExpression);
NodeArray < JsxChild > {
    const: result = [],
    result: .pos = scanner.getStartPos(),
    const: saveParsingContext = parsingContext,
    parsingContext:  |= 1 << ParsingContext.JsxChildren,
    while: function () { }, true:  };
{
    token = scanner.reScanJsxToken();
    if (token === tokenType_1.TokenType.LessThanSlashToken) {
        // Closing tag
        break;
    }
    else if (token === tokenType_1.TokenType.EndOfFileToken) {
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
parseJsxOpeningOrSelfClosingElement(inExpressionContext, boolean);
JsxOpeningElement | JsxSelfClosingElement;
{
    var fullStart = scanner.getStartPos();
    this.expectToken(tokenType_1.TokenType.LessThanToken);
    var tagName = parseJsxElementName();
    var attributes = parseList(ParsingContext.JsxAttributes, parseJsxAttribute);
    var node = void 0;
    if (token === tokenType_1.TokenType.GreaterThanToken) {
        // Closing tag, so scan the immediately-following text with the JSX scanning instead
        // of regular scanning to avoid treating illegal characters (e.g. '#') as immediate
        // scanning errors
        node = createNode(tokenType_1.TokenType.JsxOpeningElement, fullStart);
        scanJsxText();
    }
    else {
        this.expectToken(tokenType_1.TokenType.SlashToken);
        if (inExpressionContext) {
            this.expectToken(tokenType_1.TokenType.GreaterThanToken);
        }
        else {
            this.expectToken(tokenType_1.TokenType.GreaterThanToken, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
            scanJsxText();
        }
        node = createNode(tokenType_1.TokenType.JsxSelfClosingElement, fullStart);
    }
    node.tagName = tagName;
    node.attributes = attributes;
    return finishNode(node);
}
parseJsxElementName();
JsxTagNameExpression;
{
    scanJsxIdentifier();
    // JsxElement can have name in the form of
    //      propertyAccessExpression
    //      primaryExpression in the form of an identifier and "this" keyword
    // We can't just simply use parseLeftHandSideExpressionOrHigher because then we will start consider class,private etc as a keyword
    // We only want to consider "this" as a primaryExpression
    var expression = token === tokenType_1.TokenType.ThisKeyword ?
        parseTokenNode() : parseIdentifierName();
    while (readToken(tokenType_1.TokenType.DotToken)) {
        var propertyAccess = createNode(tokenType_1.TokenType.PropertyAccessExpression, expression.pos);
        propertyAccess.expression = expression;
        propertyAccess.name = parseRightSideOfDot(/*allowIdentifierNames*/ true);
        expression = finishNode(propertyAccess);
    }
    return expression;
}
parseJsxExpression(inExpressionContext, boolean);
JsxExpression;
{
    var node = createNode(tokenType_1.TokenType.JsxExpression);
    this.expectToken(tokenType_1.TokenType.OpenBraceToken);
    if (token !== tokenType_1.TokenType.CloseBraceToken) {
        node.expression = parseAssignmentExpressionOrHigher();
    }
    if (inExpressionContext) {
        this.expectToken(tokenType_1.TokenType.CloseBraceToken);
    }
    else {
        this.expectToken(tokenType_1.TokenType.CloseBraceToken, /*message*/ undefined, /*shouldAdvance*/ false);
        scanJsxText();
    }
    return finishNode(node);
}
parseJsxAttribute();
JsxAttribute | JsxSpreadAttribute;
{
    if (token === tokenType_1.TokenType.OpenBraceToken) {
        return parseJsxSpreadAttribute();
    }
    scanJsxIdentifier();
    var node = createNode(tokenType_1.TokenType.JsxAttribute);
    node.name = parseIdentifierName();
    if (readToken(tokenType_1.TokenType.EqualsToken)) {
        switch (token) {
            case tokenType_1.TokenType.StringLiteral:
                node.initializer = parseLiteralNode();
                break;
            default:
                node.initializer = parseJsxExpression(/*inExpressionContext*/ true);
                break;
        }
    }
    return finishNode(node);
}
parseJsxSpreadAttribute();
JsxSpreadAttribute;
{
    var node = createNode(tokenType_1.TokenType.JsxSpreadAttribute);
    this.expectToken(tokenType_1.TokenType.OpenBraceToken);
    this.expectToken(tokenType_1.TokenType.DotDotDotToken);
    node.expression = parseExpression();
    this.expectToken(tokenType_1.TokenType.CloseBraceToken);
    return finishNode(node);
}
parseJsxClosingElement(inExpressionContext, boolean);
JsxClosingElement;
{
    var node = createNode(tokenType_1.TokenType.JsxClosingElement);
    this.expectToken(tokenType_1.TokenType.LessThanSlashToken);
    node.tagName = parseJsxElementName();
    if (inExpressionContext) {
        this.expectToken(tokenType_1.TokenType.GreaterThanToken);
    }
    else {
        this.expectToken(tokenType_1.TokenType.GreaterThanToken, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
        scanJsxText();
    }
    return finishNode(node);
}
parseTypeAssertion();
TypeAssertion;
{
    var node = createNode(tokenType_1.TokenType.TypeAssertionExpression);
    this.expectToken(tokenType_1.TokenType.LessThanToken);
    node.type = parseType();
    this.expectToken(tokenType_1.TokenType.GreaterThanToken);
    node.expression = parseSimpleUnaryExpression();
    return finishNode(node);
}
parseMemberExpressionRest(expression, LeftHandSideExpression);
MemberExpression;
{
    while (true) {
        var dotToken = readTokenToken(tokenType_1.TokenType.DotToken);
        if (dotToken) {
            var propertyAccess = createNode(tokenType_1.TokenType.PropertyAccessExpression, expression.pos);
            propertyAccess.expression = expression;
            propertyAccess.name = parseRightSideOfDot(/*allowIdentifierNames*/ true);
            expression = finishNode(propertyAccess);
            continue;
        }
        if (token === tokenType_1.TokenType.ExclamationToken && !scanner.hasPrecedingLineBreak()) {
            nextToken();
            var nonNullExpression = createNode(tokenType_1.TokenType.NonNullExpression, expression.pos);
            nonNullExpression.expression = expression;
            expression = finishNode(nonNullExpression);
            continue;
        }
        // when in the [Decorator] context, we do not parse ElementAccess as it could be part of a ComputedPropertyName
        if (!inDecoratorContext() && readToken(tokenType_1.TokenType.OpenBracketToken)) {
            var indexedAccess = createNode(tokenType_1.TokenType.ElementAccessExpression, expression.pos);
            indexedAccess.expression = expression;
            // It's not uncommon for a user to write: "new Type[]".
            // Check for that common pattern and report a better error message.
            if (token !== tokenType_1.TokenType.CloseBracketToken) {
                indexedAccess.argumentExpression = allowInAnd(parseExpression);
                if (indexedAccess.argumentExpression.kind === tokenType_1.TokenType.StringLiteral || indexedAccess.argumentExpression.kind === tokenType_1.TokenType.NumericLiteral) {
                    var literal = indexedAccess.argumentExpression;
                    literal.text = internIdentifier(literal.text);
                }
            }
            this.expectToken(tokenType_1.TokenType.CloseBracketToken);
            expression = finishNode(indexedAccess);
            continue;
        }
        if (token === tokenType_1.TokenType.NoSubstitutionTemplateLiteral || token === tokenType_1.TokenType.TemplateHead) {
            var tagExpression = createNode(tokenType_1.TokenType.TaggedTemplateExpression, expression.pos);
            tagExpression.tag = expression;
            tagExpression.template = token === tokenType_1.TokenType.NoSubstitutionTemplateLiteral
                ? parseLiteralNode()
                : parseTemplateExpression();
            expression = finishNode(tagExpression);
            continue;
        }
        return expression;
    }
}
parseCallExpressionRest(expression, LeftHandSideExpression);
LeftHandSideExpression;
{
    while (true) {
        expression = parseMemberExpressionRest(expression);
        if (token === tokenType_1.TokenType.LessThanToken) {
            // See if this is the start of a generic invocation.  If so, consume it and
            // keep checking for postfix expressions.  Otherwise, it's just a '<' that's
            // part of an arithmetic expression.  Break out so we consume it higher in the
            // stack.
            var typeArguments = tryParse(parseTypeArgumentsInExpression);
            if (!typeArguments) {
                return expression;
            }
            var callExpr = createNode(tokenType_1.TokenType.CallExpression, expression.pos);
            callExpr.expression = expression;
            callExpr.typeArguments = typeArguments;
            callExpr.arguments = parseArgumentList();
            expression = finishNode(callExpr);
            continue;
        }
        else if (token === tokenType_1.TokenType.OpenParenToken) {
            var callExpr = createNode(tokenType_1.TokenType.CallExpression, expression.pos);
            callExpr.expression = expression;
            callExpr.arguments = parseArgumentList();
            expression = finishNode(callExpr);
            continue;
        }
        return expression;
    }
}
parseArgumentList();
{
    this.expectToken(tokenType_1.TokenType.OpenParenToken);
    var result_11 = parseDelimitedList(ParsingContext.ArgumentExpressions, parseArgumentExpression);
    this.expectToken(tokenType_1.TokenType.CloseParenToken);
    return result_11;
}
parseTypeArgumentsInExpression();
{
    if (!readToken(tokenType_1.TokenType.LessThanToken)) {
        return undefined;
    }
    var typeArguments = parseDelimitedList(ParsingContext.TypeArguments, parseType);
    if (!this.expectToken(tokenType_1.TokenType.GreaterThanToken)) {
        // If it doesn't have the closing >  then it's definitely not an type argument list.
        return undefined;
    }
    // If we have a '<', then only parse this as a argument list if the type arguments
    // are complete and we have an open paren.  if we don't, rewind and return nothing.
    return typeArguments && canFollowTypeArgumentsInExpression()
        ? typeArguments
        : undefined;
}
canFollowTypeArgumentsInExpression();
boolean;
{
    switch (token) {
        case tokenType_1.TokenType.OpenParenToken: // foo<x>(
        // this case are the only case where this token can legally follow a type argument
        // list.  So we definitely want to treat this as a type arg list.
        case tokenType_1.TokenType.DotToken: // foo<x>.
        case tokenType_1.TokenType.CloseParenToken: // foo<x>)
        case tokenType_1.TokenType.CloseBracketToken: // foo<x>]
        case tokenType_1.TokenType.ColonToken: // foo<x>:
        case tokenType_1.TokenType.SemicolonToken: // foo<x>;
        case tokenType_1.TokenType.QuestionToken: // foo<x>?
        case tokenType_1.TokenType.EqualsEqualsToken: // foo<x> ==
        case tokenType_1.TokenType.EqualsEqualsEqualsToken: // foo<x> ===
        case tokenType_1.TokenType.ExclamationEqualsToken: // foo<x> !=
        case tokenType_1.TokenType.ExclamationEqualsEqualsToken: // foo<x> !==
        case tokenType_1.TokenType.AmpersandAmpersandToken: // foo<x> &&
        case tokenType_1.TokenType.BarBarToken: // foo<x> ||
        case tokenType_1.TokenType.CaretToken: // foo<x> ^
        case tokenType_1.TokenType.AmpersandToken: // foo<x> &
        case tokenType_1.TokenType.BarToken: // foo<x> |
        case tokenType_1.TokenType.CloseBraceToken: // foo<x> }
        case tokenType_1.TokenType.EndOfFileToken:
            // these cases can't legally follow a type arg list.  However, they're not legal
            // expressions either.  The user is probably in the middle of a generic type. So
            // treat it as such.
            return true;
        case tokenType_1.TokenType.CommaToken: // foo<x>,
        case tokenType_1.TokenType.OpenBraceToken: // foo<x> {
        // We don't want to treat these as type arguments.  Otherwise we'll parse this
        // as an invocation expression.  Instead, we want to parse out the expression
        // in isolation from the type arguments.
        default:
            // Anything else treat as an expression.
            return false;
    }
}
parsePrimaryExpression();
PrimaryExpression;
{
    switch (token) {
        case tokenType_1.TokenType.NumericLiteral:
        case tokenType_1.TokenType.StringLiteral:
        case tokenType_1.TokenType.NoSubstitutionTemplateLiteral:
            return parseLiteralNode();
        case tokenType_1.TokenType.This:
        case tokenType_1.TokenType.Super:
        case tokenType_1.TokenType.Null:
        case tokenType_1.TokenType.True:
        case tokenType_1.TokenType.False:
            return parseTokenNode();
        case tokenType_1.TokenType.OpenParenToken:
            return parseParenthesizedExpression();
        case tokenType_1.TokenType.OpenBracketToken:
            return parseArrayLiteralExpression();
        case tokenType_1.TokenType.OpenBraceToken:
            return parseObjectLiteralExpression();
        case tokenType_1.TokenType.Async:
            // Async arrow privates are parsed earlier in parseAssignmentExpressionOrHigher.
            // If we encounter `async [no LineTerminator here] private` then this is an async
            // private; otherwise, its an identifier.
            if (!lookAhead(nextTokenIsFunctionKeywordOnSameLine)) {
                break;
            }
            return parseFunctionExpression();
        case tokenType_1.TokenType.Class:
            return parseClassExpression();
        case tokenType_1.TokenType.Function:
            return parseFunctionExpression();
        case tokenType_1.TokenType.New:
            return parseNewExpression();
        case tokenType_1.TokenType.SlashToken:
        case tokenType_1.TokenType.SlashEqualsToken:
            if (reScanSlashToken() === tokenType_1.TokenType.RegularExpressionLiteral) {
                return parseLiteralNode();
            }
            break;
        case tokenType_1.TokenType.TemplateHead:
            return parseTemplateExpression();
    }
    return parseIdentifier(Diagnostics.Expression_expected);
}
parseParenthesizedExpression();
ParenthesizedExpression;
{
    var node = createNode(tokenType_1.TokenType.ParenthesizedExpression);
    this.expectToken(tokenType_1.TokenType.OpenParenToken);
    node.expression = allowInAnd(parseExpression);
    this.expectToken(tokenType_1.TokenType.CloseParenToken);
    return finishNode(node);
}
parseSpreadElement();
Expression;
{
    var node = createNode(tokenType_1.TokenType.SpreadElementExpression);
    this.expectToken(tokenType_1.TokenType.DotDotDotToken);
    node.expression = parseAssignmentExpressionOrHigher();
    return finishNode(node);
}
parseArgumentOrArrayLiteralElement();
Expression;
{
    return token === tokenType_1.TokenType.DotDotDotToken ? parseSpreadElement() :
        token === tokenType_1.TokenType.CommaToken ? createNode(tokenType_1.TokenType.OmittedExpression) :
            parseAssignmentExpressionOrHigher();
}
parseArgumentExpression();
Expression;
{
    return doOutsideOfContext(disallowInAndDecoratorContext, parseArgumentOrArrayLiteralElement);
}
parseArrayLiteralExpression();
ArrayLiteralExpression;
{
    var node = createNode(tokenType_1.TokenType.ArrayLiteralExpression);
    this.expectToken(tokenType_1.TokenType.OpenBracketToken);
    if (scanner.hasPrecedingLineBreak()) {
        node.multiLine = true;
    }
    node.elements = parseDelimitedList(ParsingContext.ArrayLiteralMembers, parseArgumentOrArrayLiteralElement);
    this.expectToken(tokenType_1.TokenType.CloseBracketToken);
    return finishNode(node);
}
tryParseAccessorDeclaration(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray);
AccessorDeclaration;
{
    if (parseContextualModifier(tokenType_1.TokenType.GetKeyword)) {
        return addJSDocComment(parseAccessorDeclaration(tokenType_1.TokenType.GetAccessor, fullStart, decorators, modifiers));
    }
    else if (parseContextualModifier(tokenType_1.TokenType.SetKeyword)) {
        return parseAccessorDeclaration(tokenType_1.TokenType.SetAccessor, fullStart, decorators, modifiers);
    }
    return undefined;
}
parseObjectLiteralElement();
ObjectLiteralElement;
{
    var fullStart = scanner.getStartPos();
    var decorators = parseDecorators();
    var modifiers_2 = parseModifiers();
    var accessor = tryParseAccessorDeclaration(fullStart, decorators, modifiers_2);
    if (accessor) {
        return accessor;
    }
    var nodeseriskToken = readTokenToken(tokenType_1.TokenType.AsteriskToken);
    var tokenIsIdentifier = isIdentifier();
    var propertyName = parsePropertyName();
    // Disallowing of optional property assignments happens in the grammar checker.
    var questionToken = readTokenToken(tokenType_1.TokenType.QuestionToken);
    if (nodeseriskToken || token === tokenType_1.TokenType.OpenParenToken || token === tokenType_1.TokenType.LessThanToken) {
        return parseMethodDeclaration(fullStart, decorators, modifiers_2, nodeseriskToken, propertyName, questionToken);
    }
    // check if it is short-hand property assignment or normal property assignment
    // NOTE: if token is EqualsToken it is interpreted as CoverInitializedName production
    // CoverInitializedName[Yield] :
    //     IdentifierReference[?Yield] Initializer[In, ?Yield]
    // this is necessary because ObjectLiteral productions are also used to cover grammar for ObjectAssignmentPattern
    var isShorthandPropertyAssignment = tokenIsIdentifier && (token === tokenType_1.TokenType.CommaToken || token === tokenType_1.TokenType.CloseBraceToken || token === tokenType_1.TokenType.EqualsToken);
    if (isShorthandPropertyAssignment) {
        var shorthandDeclaration = createNode(tokenType_1.TokenType.ShorthandPropertyAssignment, fullStart);
        shorthandDeclaration.name = propertyName;
        shorthandDeclaration.questionToken = questionToken;
        var equalsToken = readTokenToken(tokenType_1.TokenType.EqualsToken);
        if (equalsToken) {
            shorthandDeclaration.equalsToken = equalsToken;
            shorthandDeclaration.objectAssignmentInitializer = allowInAnd(parseAssignmentExpressionOrHigher);
        }
        return addJSDocComment(finishNode(shorthandDeclaration));
    }
    else {
        var propertyAssignment = createNode(tokenType_1.TokenType.PropertyAssignment, fullStart);
        propertyAssignment.modifiers = modifiers_2;
        propertyAssignment.name = propertyName;
        propertyAssignment.questionToken = questionToken;
        this.expectToken(tokenType_1.TokenType.ColonToken);
        propertyAssignment.initializer = allowInAnd(parseAssignmentExpressionOrHigher);
        return addJSDocComment(finishNode(propertyAssignment));
    }
}
parseObjectLiteralExpression();
ObjectLiteralExpression;
{
    var node = createNode(tokenType_1.TokenType.ObjectLiteralExpression);
    this.expectToken(tokenType_1.TokenType.OpenBraceToken);
    if (scanner.hasPrecedingLineBreak()) {
        node.multiLine = true;
    }
    node.properties = parseDelimitedList(ParsingContext.ObjectLiteralMembers, parseObjectLiteralElement, /*considerSemicolonAsDelimiter*/ true);
    this.expectToken(tokenType_1.TokenType.CloseBraceToken);
    return finishNode(node);
}
parseFunctionExpression();
FunctionExpression;
{
    // GeneratorExpression:
    //      private* BindingIdentifier [Yield][opt](FormalParameters[Yield]){ GeneratorBody }
    //
    // FunctionExpression:
    //      private BindingIdentifier[opt](FormalParameters){ FunctionBody }
    var saveDecoratorContext = inDecoratorContext();
    if (saveDecoratorContext) {
        setDecoratorContext(/*val*/ false);
    }
    var node = createNode(tokenType_1.TokenType.FunctionExpression);
    setModifiers(node, parseModifiers());
    this.expectToken(tokenType_1.TokenType.FunctionKeyword);
    node.nodeseriskToken = readTokenToken(tokenType_1.TokenType.AsteriskToken);
    var isGenerator = !!node.nodeseriskToken;
    var isAsync = !!(node.flags & NodeFlags.Async);
    node.name =
        isGenerator && isAsync ? doInYieldAndAwaitContext(readTokenIdentifier) :
            isGenerator ? doInYieldContext(readTokenIdentifier) :
                isAsync ? doInAwaitContext(readTokenIdentifier) :
                    readTokenIdentifier();
    fillSignature(tokenType_1.TokenType.ColonToken, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, node);
    node.body = parseFunctionBlock(/*allowYield*/ isGenerator, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);
    if (saveDecoratorContext) {
        setDecoratorContext(/*val*/ true);
    }
    return addJSDocComment(finishNode(node));
}
readTokenIdentifier();
{
    return isIdentifier() ? parseIdentifier() : undefined;
}
parseNewExpression();
NewExpression;
{
    var node = createNode(tokenType_1.TokenType.NewExpression);
    this.expectToken(tokenType_1.TokenType.NewKeyword);
    node.expression = parseMemberExpressionOrHigher();
    node.typeArguments = tryParse(parseTypeArgumentsInExpression);
    if (node.typeArguments || token === tokenType_1.TokenType.OpenParenToken) {
        node.arguments = parseArgumentList();
    }
    return finishNode(node);
}
parseFunctionBlock(allowYield, boolean, allowAwait, boolean, ignoreMissingOpenBrace, boolean, diagnosticMessage ?  : DiagnosticMessage);
Block;
{
    var savedYieldContext = inYieldContext();
    setYieldContext(allowYield);
    var savedAwaitContext = inAwaitContext();
    setAwaitContext(allowAwait);
    // We may be in a [Decorator] context when parsing a private expression or
    // arrow private. The body of the private is not in [Decorator] context.
    var saveDecoratorContext = inDecoratorContext();
    if (saveDecoratorContext) {
        setDecoratorContext(/*val*/ false);
    }
    var block = parseBlock(ignoreMissingOpenBrace, diagnosticMessage);
    if (saveDecoratorContext) {
        setDecoratorContext(/*val*/ true);
    }
    setYieldContext(savedYieldContext);
    setAwaitContext(savedAwaitContext);
    return block;
}
parseCondition();
{
    // Condition :
    //   ( BooleanExpression )
    var result_12;
    if (this.readToken(tokenType_1.TokenType.openParen)) {
        result_12 = this.parseExpression(0);
        this.expectToken(tokenType_1.TokenType.closeParen);
    }
    else {
        if (Compiler.options.disallowMissingParentheses) {
            this.reportSyntaxError("严格模式: 应输入“(”");
        }
        result_12 = this.parseExpression();
    }
    return result_12;
}
parseEmbeddedStatement();
{
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
parseDoWhileStatement();
{
    // DoWhileStatement :
    //   do EmbeddedStatement while Condition ;
    var result_13 = new nodes.DoWhileStatement();
    result_13.start = this.lexer.tokenStart;
    this.expectToken(tokenType_1.TokenType.do);
    result_13.body = this.parseEmbeddedStatement();
    this.expectToken(tokenType_1.TokenType.while);
    result_13.condition = this.parseCondition();
    // From: https://mail.mozilla.org/pipermail/es-discuss/2011-August/016188.html
    // 157 min --- All allen at wirfs-brock.com CONF --- "do{;}while(false)false" prohibited in
    // spec but allowed in consensus reality. Approved -- this is the de-facto standard whereby
    //  do;while(0)x will have a semicolon inserted before x.
    this.readToken(tokenType_1.TokenType.semicolon);
    result_13.end = this.lexer.tokenEnd;
    return result_13;
}
parseWhileStatement();
{
    // WhileStatement :
    //   while Condition EmbeddedStatement ;
    var result_14 = new nodes.WhileStatement();
    result_14.start = this.lexer.tokenStart;
    this.expectToken(tokenType_1.TokenType.while);
    result_14.condition = this.parseCondition();
    result_14.body = this.parseEmbeddedStatement();
    return result_14;
}
parseForStatement();
{
    // ForStatement :
    //   for ( VariableOrExpression? ; Expression? ; Expression? ) EmbeddedStatement
    //   for ( VaribaleDeclartionList in Expression ) EmbeddedStatement
    //   for ( Identifier: Type = Expression to Expression ) EmbeddedStatement
    var pos = getNodePos();
    this.expectToken(tokenType_1.TokenType.ForKeyword);
    this.expectToken(tokenType_1.TokenType.OpenParenToken);
    var initializer = undefined;
    if (token !== tokenType_1.TokenType.SemicolonToken) {
        if (token === tokenType_1.TokenType.VarKeyword || token === tokenType_1.TokenType.LetKeyword || token === tokenType_1.TokenType.ConstKeyword) {
            initializer = parseVariableDeclarationList(/*inForStatementInitializer*/ true);
        }
        else {
            initializer = disallowInAnd(parseExpression);
        }
    }
    var forOrForInOrForOfStatement = void 0;
    if (readToken(tokenType_1.TokenType.InKeyword)) {
        var forInStatement = createNode(tokenType_1.TokenType.ForInStatement, pos);
        forInStatement.initializer = initializer;
        forInStatement.expression = allowInAnd(parseExpression);
        this.expectToken(tokenType_1.TokenType.CloseParenToken);
        forOrForInOrForOfStatement = forInStatement;
    }
    else if (readToken(tokenType_1.TokenType.OfKeyword)) {
        var forOfStatement = createNode(tokenType_1.TokenType.ForOfStatement, pos);
        forOfStatement.initializer = initializer;
        forOfStatement.expression = allowInAnd(parseAssignmentExpressionOrHigher);
        this.expectToken(tokenType_1.TokenType.CloseParenToken);
        forOrForInOrForOfStatement = forOfStatement;
    }
    else {
        var forStatement = createNode(tokenType_1.TokenType.ForStatement, pos);
        forStatement.initializer = initializer;
        this.expectToken(tokenType_1.TokenType.SemicolonToken);
        if (token !== tokenType_1.TokenType.SemicolonToken && token !== tokenType_1.TokenType.CloseParenToken) {
            forStatement.condition = allowInAnd(parseExpression);
        }
        this.expectToken(tokenType_1.TokenType.SemicolonToken);
        if (token !== tokenType_1.TokenType.CloseParenToken) {
            forStatement.incrementor = allowInAnd(parseExpression);
        }
        this.expectToken(tokenType_1.TokenType.CloseParenToken);
        forOrForInOrForOfStatement = forStatement;
    }
    forOrForInOrForOfStatement.statement = parseStatement();
    return finishNode(forOrForInOrForOfStatement);
}
parseBreakStatement();
{
    // BreakStatement :
    //   break ;
    var result_15 = new nodes.BreakStatement();
    result_15.start = this.lexer.tokenStart;
    this.expectToken(tokenType_1.TokenType.break);
    if (!this.autoInsertSemicolon()) {
        result_15.label = this.parseIdentifier();
    }
    this.readToken(tokenType_1.TokenType.semicolon);
    result_15.end = this.lexer.tokenEnd;
    return result_15;
}
parseContinueStatement(kind, tokenType_1.TokenType);
{
    // ContinueStatement :
    //   continue ;
    var result_16 = new nodes.ContinueStatement();
    result_16.start = this.lexer.tokenStart;
    this.expectToken(tokenType_1.TokenType.continue);
    if (!this.autoInsertSemicolon()) {
        result_16.label = this.parseIdentifier();
    }
    this.readToken(tokenType_1.TokenType.semicolon);
    result_16.end = this.lexer.tokenEnd;
    return result_16;
}
parseReturnStatement();
{
    // ReturnStatement :
    //   return Expression? ;
    var result_17 = new nodes.ReturnStatement();
    result_17.start = this.lexer.tokenStart;
    this.expectToken(tokenType_1.TokenType.return);
    if (!this.autoInsertSemicolon()) {
        result_17.value = this.parseExpression(true);
    }
    parseSemicolon();
    return finishNode(node);
}
parseWithStatement();
WithStatement;
{
    var node = createNode(tokenType_1.TokenType.WithStatement);
    this.expectToken(tokenType_1.TokenType.WithKeyword);
    this.expectToken(tokenType_1.TokenType.OpenParenToken);
    node.expression = allowInAnd(parseExpression);
    this.expectToken(tokenType_1.TokenType.CloseParenToken);
    node.statement = parseStatement();
    return finishNode(node);
}
parseThrowStatement();
ThrowStatement;
{
    // ThrowStatement[Yield] :
    //      throw [no LineTerminator here]Expression[In, ?Yield];
    // Because of automatic semicolon insertion, we need to report error if this
    // throw could be terminated with a semicolon.  Note: we can't call 'parseExpression'
    // directly as that might consume an expression on the following line.
    // We just return 'undefined' in that case.  The actual error will be reported in the
    // grammar walker.
    var node = createNode(tokenType_1.TokenType.ThrowStatement);
    this.expectToken(tokenType_1.TokenType.ThrowKeyword);
    node.expression = scanner.hasPrecedingLineBreak() ? undefined : allowInAnd(parseExpression);
    parseSemicolon();
    return finishNode(node);
}
parseTryStatement();
TryStatement;
{
    var node = createNode(tokenType_1.TokenType.TryStatement);
    this.expectToken(tokenType_1.TokenType.TryKeyword);
    node.tryBlock = parseBlock(/*ignoreMissingOpenBrace*/ false);
    node.catchClause = token === tokenType_1.TokenType.CatchKeyword ? parseCatchClause() : undefined;
    // If we don't have a catch clause, then we must have a finally clause.  Try to parse
    // one out no matter what.
    if (!node.catchClause || token === tokenType_1.TokenType.FinallyKeyword) {
        this.expectToken(tokenType_1.TokenType.FinallyKeyword);
        node.finallyBlock = parseBlock(/*ignoreMissingOpenBrace*/ false);
    }
    return finishNode(node);
}
parseCatchClause();
CatchClause;
{
    var result_18 = createNode(tokenType_1.TokenType.CatchClause);
    this.expectToken(tokenType_1.TokenType.CatchKeyword);
    if (this.expectToken(tokenType_1.TokenType.OpenParenToken)) {
        result_18.variableDeclaration = parseVariableDeclaration();
    }
    this.expectToken(tokenType_1.TokenType.CloseParenToken);
    result_18.block = parseBlock(/*ignoreMissingOpenBrace*/ false);
    return finishNode(result_18);
}
parseDebuggerStatement();
Statement;
{
    var node = createNode(tokenType_1.TokenType.DebuggerStatement);
    this.expectToken(tokenType_1.TokenType.DebuggerKeyword);
    parseSemicolon();
    return finishNode(node);
}
nextTokenIsIdentifierOrKeywordOnSameLine();
{
    nextToken();
    return tokenIsIdentifierOrKeyword(token) && !scanner.hasPrecedingLineBreak();
}
nextTokenIsFunctionKeywordOnSameLine();
{
    nextToken();
    return token === tokenType_1.TokenType.FunctionKeyword && !scanner.hasPrecedingLineBreak();
}
nextTokenIsIdentifierOrKeywordOrNumberOnSameLine();
{
    nextToken();
    return (tokenIsIdentifierOrKeyword(token) || token === tokenType_1.TokenType.NumericLiteral) && !scanner.hasPrecedingLineBreak();
}
isDeclaration();
boolean;
{
    while (true) {
        switch (token) {
            case tokenType_1.TokenType.Var:
            case tokenType_1.TokenType.Let:
            case tokenType_1.TokenType.Const:
            case tokenType_1.TokenType.Function:
            case tokenType_1.TokenType.Class:
            case tokenType_1.TokenType.Enum:
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
            case tokenType_1.TokenType.Interface:
            case tokenType_1.TokenType.Type:
                return nextTokenIsIdentifierOnSameLine();
            case tokenType_1.TokenType.Module:
            case tokenType_1.TokenType.Namespace:
                return nextTokenIsIdentifierOrStringLiteralOnSameLine();
            case tokenType_1.TokenType.Abstract:
            case tokenType_1.TokenType.Async:
            case tokenType_1.TokenType.Declare:
            case tokenType_1.TokenType.Private:
            case tokenType_1.TokenType.Protected:
            case tokenType_1.TokenType.Public:
            case tokenType_1.TokenType.Readonly:
                nextToken();
                // ASI takes effect for this modifier.
                if (scanner.hasPrecedingLineBreak()) {
                    return false;
                }
                continue;
            case tokenType_1.TokenType.Global:
                nextToken();
                return token === tokenType_1.TokenType.OpenBraceToken || token === tokenType_1.TokenType.Identifier || token === tokenType_1.TokenType.ExportKeyword;
            case tokenType_1.TokenType.Import:
                nextToken();
                return token === tokenType_1.TokenType.StringLiteral || token === tokenType_1.TokenType.AsteriskToken ||
                    token === tokenType_1.TokenType.OpenBraceToken || tokenIsIdentifierOrKeyword(token);
            case tokenType_1.TokenType.Export:
                nextToken();
                if (token === tokenType_1.TokenType.EqualsToken || token === tokenType_1.TokenType.AsteriskToken ||
                    token === tokenType_1.TokenType.OpenBraceToken || token === tokenType_1.TokenType.DefaultKeyword ||
                    token === tokenType_1.TokenType.AsKeyword) {
                    return true;
                }
                continue;
            case tokenType_1.TokenType.Static:
                nextToken();
                continue;
            default:
                return false;
        }
    }
}
isStartOfDeclaration();
boolean;
{
    return lookAhead(isDeclaration);
}
isStartOfStatement();
boolean;
{
    switch (token) {
        case tokenType_1.TokenType.AtToken:
        case tokenType_1.TokenType.SemicolonToken:
        case tokenType_1.TokenType.OpenBraceToken:
        case tokenType_1.TokenType.Var:
        case tokenType_1.TokenType.Let:
        case tokenType_1.TokenType.Function:
        case tokenType_1.TokenType.Class:
        case tokenType_1.TokenType.Enum:
        case tokenType_1.TokenType.If:
        case tokenType_1.TokenType.Do:
        case tokenType_1.TokenType.While:
        case tokenType_1.TokenType.For:
        case tokenType_1.TokenType.Continue:
        case tokenType_1.TokenType.Break:
        case tokenType_1.TokenType.Return:
        case tokenType_1.TokenType.With:
        case tokenType_1.TokenType.Switch:
        case tokenType_1.TokenType.Throw:
        case tokenType_1.TokenType.Try:
        case tokenType_1.TokenType.Debugger:
        // 'catch' and 'finally' do not actually indicate that the code is part of a statement,
        // however, we say they are here so that we may gracefully parse them and error later.
        case tokenType_1.TokenType.Catch:
        case tokenType_1.TokenType.Finally:
            return true;
        case tokenType_1.TokenType.Const:
        case tokenType_1.TokenType.Export:
        case tokenType_1.TokenType.Import:
            return isStartOfDeclaration();
        case tokenType_1.TokenType.Async:
        case tokenType_1.TokenType.Declare:
        case tokenType_1.TokenType.Interface:
        case tokenType_1.TokenType.Module:
        case tokenType_1.TokenType.Namespace:
        case tokenType_1.TokenType.Type:
        case tokenType_1.TokenType.Global:
            // When these don't start a declaration, they're an identifier in an expression statement
            return true;
        case tokenType_1.TokenType.Public:
        case tokenType_1.TokenType.Private:
        case tokenType_1.TokenType.Protected:
        case tokenType_1.TokenType.Static:
        case tokenType_1.TokenType.Readonly:
            // When these don't start a declaration, they may be the start of a class member if an identifier
            // immediately follows. Otherwise they're an identifier in an expression statement.
            return isStartOfDeclaration() || !lookAhead(nextTokenIsIdentifierOrKeywordOnSameLine);
        default:
            return fallowsExpression();
    }
}
nextTokenIsIdentifierOrStartOfDestructuring();
{
    nextToken();
    return isIdentifier() || token === tokenType_1.TokenType.OpenBraceToken || token === tokenType_1.TokenType.OpenBracketToken;
}
isLetDeclaration();
{
    // In ES6 'let' always starts a lexical declaration if followed by an identifier or {
    // or [.
    return lookAhead(nextTokenIsIdentifierOrStartOfDestructuring);
}
parseDeclaration();
Statement;
{
    var fullStart = getNodePos();
    var decorators = parseDecorators();
    var modifiers_3 = parseModifiers();
    switch (token) {
        case tokenType_1.TokenType.Var:
        case tokenType_1.TokenType.Let:
        case tokenType_1.TokenType.Const:
            return parseVariableStatement(fullStart, decorators, modifiers_3);
        case tokenType_1.TokenType.Function:
            return parseFunctionDeclaration(fullStart, decorators, modifiers_3);
        case tokenType_1.TokenType.Class:
            return parseClassDeclaration(fullStart, decorators, modifiers_3);
        case tokenType_1.TokenType.Interface:
            return parseInterfaceDeclaration(fullStart, decorators, modifiers_3);
        case tokenType_1.TokenType.Type:
            return parseTypeAliasDeclaration(fullStart, decorators, modifiers_3);
        case tokenType_1.TokenType.Enum:
            return parseEnumDeclaration(fullStart, decorators, modifiers_3);
        case tokenType_1.TokenType.Global:
        case tokenType_1.TokenType.Module:
        case tokenType_1.TokenType.Namespace:
            return parseModuleDeclaration(fullStart, decorators, modifiers_3);
        case tokenType_1.TokenType.Import:
            return parseImportDeclarationOrImportEqualsDeclaration(fullStart, decorators, modifiers_3);
        case tokenType_1.TokenType.Export:
            nextToken();
            switch (token) {
                case tokenType_1.TokenType.Default:
                case tokenType_1.TokenType.EqualsToken:
                    return parseExportAssignment(fullStart, decorators, modifiers_3);
                case tokenType_1.TokenType.As:
                    return parseNamespaceExportDeclaration(fullStart, decorators, modifiers_3);
                default:
                    return parseExportDeclaration(fullStart, decorators, modifiers_3);
            }
        default:
            if (decorators || modifiers_3) {
                // We reached this point because we encountered decorators and/or modifiers and assumed a declaration
                // would follow. For recovery and error reporting purposes, return an incomplete declaration.
                var node = createMissingNode(tokenType_1.TokenType.MissingDeclaration, /*reportAtCurrentPosition*/ true, Diagnostics.Declaration_expected);
                node.pos = fullStart;
                node.decorators = decorators;
                setModifiers(node, modifiers_3);
                return finishNode(node);
            }
    }
}
nextTokenIsIdentifierOrStringLiteralOnSameLine();
{
    nextToken();
    return !scanner.hasPrecedingLineBreak() && (isIdentifier() || token === tokenType_1.TokenType.StringLiteral);
}
parseFunctionBlockOrSemicolon(isGenerator, boolean, isAsync, boolean, diagnosticMessage ?  : DiagnosticMessage);
Block;
{
    if (token !== tokenType_1.TokenType.OpenBraceToken && autoInsertSemicolon()) {
        parseSemicolon();
        return;
    }
    return parseFunctionBlock(isGenerator, isAsync, /*ignoreMissingOpenBrace*/ false, diagnosticMessage);
}
parseArrayBindingElement();
BindingElement;
{
    if (token === tokenType_1.TokenType.CommaToken) {
        return createNode(tokenType_1.TokenType.OmittedExpression);
    }
    var node = createNode(tokenType_1.TokenType.BindingElement);
    node.dotDotDotToken = readTokenToken(tokenType_1.TokenType.DotDotDotToken);
    node.name = parseIdentifierOrPattern();
    node.initializer = parseBindingElementInitializer(/*inParameter*/ false);
    return finishNode(node);
}
parseObjectBindingElement();
BindingElement;
{
    var node = createNode(tokenType_1.TokenType.BindingElement);
    var tokenIsIdentifier = isIdentifier();
    var propertyName = parsePropertyName();
    if (tokenIsIdentifier && token !== tokenType_1.TokenType.ColonToken) {
        node.name = propertyName;
    }
    else {
        this.expectToken(tokenType_1.TokenType.ColonToken);
        node.propertyName = propertyName;
        node.name = parseIdentifierOrPattern();
    }
    node.initializer = parseBindingElementInitializer(/*inParameter*/ false);
    return finishNode(node);
}
parseObjectBindingPattern();
BindingPattern;
{
    var node = createNode(tokenType_1.TokenType.ObjectBindingPattern);
    this.expectToken(tokenType_1.TokenType.OpenBraceToken);
    node.elements = parseDelimitedList(ParsingContext.ObjectBindingElements, parseObjectBindingElement);
    this.expectToken(tokenType_1.TokenType.CloseBraceToken);
    return finishNode(node);
}
parseArrayBindingPattern();
BindingPattern;
{
    var node = createNode(tokenType_1.TokenType.ArrayBindingPattern);
    this.expectToken(tokenType_1.TokenType.OpenBracketToken);
    node.elements = parseDelimitedList(ParsingContext.ArrayBindingElements, parseArrayBindingElement);
    this.expectToken(tokenType_1.TokenType.CloseBracketToken);
    return finishNode(node);
}
isIdentifierOrPattern();
{
    return token === tokenType_1.TokenType.OpenBraceToken || token === tokenType_1.TokenType.OpenBracketToken || isIdentifier();
}
parseIdentifierOrPattern();
Identifier | BindingPattern;
{
    if (token === tokenType_1.TokenType.OpenBracketToken) {
        return parseArrayBindingPattern();
    }
    if (token === tokenType_1.TokenType.OpenBraceToken) {
        return parseObjectBindingPattern();
    }
    return parseIdentifier();
}
parseVariableDeclaration();
VariableDeclaration;
{
    var node = createNode(tokenType_1.TokenType.VariableDeclaration);
    node.name = parseIdentifierOrPattern();
    node.type = parseTypeAnnotation();
    if (!isInOrOfKeyword(token)) {
        node.initializer = parseInitializer(/*inParameter*/ false);
    }
    return finishNode(node);
}
parseVariableDeclarationList(inForStatementInitializer, boolean);
VariableDeclarationList;
{
    var node = createNode(tokenType_1.TokenType.VariableDeclarationList);
    switch (token) {
        case tokenType_1.TokenType.Var:
            break;
        case tokenType_1.TokenType.Let:
            node.flags |= NodeFlags.Let;
            break;
        case tokenType_1.TokenType.Const:
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
    if (token === tokenType_1.TokenType.OfKeyword && lookAhead(canFollowContextualOfKeyword)) {
        node.declarations = createMissingList();
    }
    else {
        var savedDisallowIn = inDisallowInContext();
        setDisallowInContext(inForStatementInitializer);
        node.declarations = parseDelimitedList(ParsingContext.VariableDeclarations, parseVariableDeclaration);
        setDisallowInContext(savedDisallowIn);
    }
    return finishNode(node);
}
canFollowContextualOfKeyword();
boolean;
{
    return nextTokenIsIdentifier() && nextToken() === tokenType_1.TokenType.CloseParenToken;
}
parseVariableStatement(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray);
VariableStatement;
{
    console.assert(this.lexer.currentToken.type === tokenType_1.TokenType.var ||
        this.lexer.currentToken.type === tokenType_1.TokenType.let ||
        this.lexer.currentToken.type === tokenType_1.TokenType.const);
    var node = new nodes.VariableStatement();
    node.decorators = decorators;
    setModifiers(node, modifiers);
    node.declarationList = parseVariableDeclarationList(/*inForStatementInitializer*/ false);
    parseSemicolon();
    return addJSDocComment(finishNode(node));
}
parseFunctionDeclaration(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray);
FunctionDeclaration;
{
    var node = createNode(tokenType_1.TokenType.FunctionDeclaration, fullStart);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    this.expectToken(tokenType_1.TokenType.FunctionKeyword);
    node.nodeseriskToken = readTokenToken(tokenType_1.TokenType.AsteriskToken);
    node.name = node.flags & NodeFlags.Default ? readTokenIdentifier() : parseIdentifier();
    var isGenerator = !!node.nodeseriskToken;
    var isAsync = !!(node.flags & NodeFlags.Async);
    fillSignature(tokenType_1.TokenType.ColonToken, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, node);
    node.body = parseFunctionBlockOrSemicolon(isGenerator, isAsync, Diagnostics.or_expected);
    return addJSDocComment(finishNode(node));
}
parseConstructorDeclaration(pos, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray);
ConstructorDeclaration;
{
    var node = createNode(tokenType_1.TokenType.Constructor, pos);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    this.expectToken(tokenType_1.TokenType.ConstructorKeyword);
    fillSignature(tokenType_1.TokenType.ColonToken, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
    node.body = parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false, Diagnostics.or_expected);
    return addJSDocComment(finishNode(node));
}
parseMethodDeclaration(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray, nodeseriskToken, Node, name, PropertyName, questionToken, Node, diagnosticMessage ?  : DiagnosticMessage);
MethodDeclaration;
{
    var method = createNode(tokenType_1.TokenType.MethodDeclaration, fullStart);
    method.decorators = decorators;
    setModifiers(method, modifiers);
    method.nodeseriskToken = nodeseriskToken;
    method.name = name;
    method.questionToken = questionToken;
    var isGenerator = !!nodeseriskToken;
    var isAsync = !!(method.flags & NodeFlags.Async);
    fillSignature(tokenType_1.TokenType.ColonToken, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, method);
    method.body = parseFunctionBlockOrSemicolon(isGenerator, isAsync, diagnosticMessage);
    return addJSDocComment(finishNode(method));
}
parsePropertyDeclaration(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray, name, PropertyName, questionToken, Node);
ClassElement;
{
    var property = createNode(tokenType_1.TokenType.PropertyDeclaration, fullStart);
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
parsePropertyOrMethodDeclaration(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray);
ClassElement;
{
    var nodeseriskToken = readTokenToken(tokenType_1.TokenType.AsteriskToken);
    var name_2 = parsePropertyName();
    // Note: this is not legal as per the grammar.  But we allow it in the parser and
    // report an error in the grammar checker.
    var questionToken = readTokenToken(tokenType_1.TokenType.QuestionToken);
    if (nodeseriskToken || token === tokenType_1.TokenType.OpenParenToken || token === tokenType_1.TokenType.LessThanToken) {
        return parseMethodDeclaration(fullStart, decorators, modifiers, nodeseriskToken, name_2, questionToken, Diagnostics.or_expected);
    }
    else {
        return parsePropertyDeclaration(fullStart, decorators, modifiers, name_2, questionToken);
    }
}
parseNonParameterInitializer();
{
    return parseInitializer(/*inParameter*/ false);
}
parseAccessorDeclaration(kind, tokenType_1.TokenType, fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray);
AccessorDeclaration;
{
    var node = createNode(kind, fullStart);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    node.name = parsePropertyName();
    fillSignature(tokenType_1.TokenType.ColonToken, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
    node.body = parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false);
    return finishNode(node);
}
isClassMemberModifier(idToken, tokenType_1.TokenType);
{
    switch (idToken) {
        case tokenType_1.TokenType.Public:
        case tokenType_1.TokenType.Private:
        case tokenType_1.TokenType.Protected:
        case tokenType_1.TokenType.Static:
        case tokenType_1.TokenType.Readonly:
            return true;
        default:
            return false;
    }
}
isClassMemberStart();
boolean;
{
    var idToken = void 0;
    if (token === tokenType_1.TokenType.AtToken) {
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
    if (token === tokenType_1.TokenType.AsteriskToken) {
        return true;
    }
    // Try to get the first property-like token following all modifiers.
    // This can either be an identifier or the 'get' or 'set' keywords.
    if (isLiteralPropertyName()) {
        idToken = token;
        nextToken();
    }
    // Index signatures and computed properties are class members; we can parse.
    if (token === tokenType_1.TokenType.OpenBracketToken) {
        return true;
    }
    // If we were able to get any potential identifier...
    if (idToken !== undefined) {
        // If we have a non-keyword identifier, or if we have an accessor, then it's safe to parse.
        if (!isKeyword(idToken) || idToken === tokenType_1.TokenType.SetKeyword || idToken === tokenType_1.TokenType.GetKeyword) {
            return true;
        }
        // If it *is* a keyword, but not an accessor, check a little farther along
        // to see if it should actually be parsed as a class member.
        switch (token) {
            case tokenType_1.TokenType.OpenParenToken: // Method declaration
            case tokenType_1.TokenType.LessThanToken: // Generic Method declaration
            case tokenType_1.TokenType.ColonToken: // Type Annotation for declaration
            case tokenType_1.TokenType.EqualsToken: // Initializer for declaration
            case tokenType_1.TokenType.QuestionToken:
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
parseDecorators();
{
    var result_19 = new nodes.NodeList();
    do {
        console.assert(this.lexer.currentToken.type === tokenType_1.TokenType.at);
        var decorator = new nodes.Decorator();
        decorator.start = this.lexer.read().start;
        decorator.body = this.parseExpression();
        result_19.push(decorator);
    } while (this.lexer.peek().type === tokenType_1.TokenType.at);
    return result_19;
}
parseModifiers(permitInvalidConstAsModifier ?  : boolean);
ModifiersArray;
{
    var flags = 0;
    var modifiers_4;
    while (true) {
        var modifierStart = scanner.getStartPos();
        var modifierKind = token;
        if (token === tokenType_1.TokenType.ConstKeyword && permitInvalidConstAsModifier) {
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
        if (!modifiers_4) {
            modifiers_4 = [];
            modifiers_4.pos = modifierStart;
        }
        flags |= modifierToFlag(modifierKind);
        modifiers_4.push(finishNode(createNode(modifierKind, modifierStart)));
    }
    if (modifiers_4) {
        modifiers_4.flags = flags;
        modifiers_4.end = scanner.getStartPos();
    }
    return modifiers_4;
}
parseModifiersForArrowFunction();
ModifiersArray;
{
    var flags = 0;
    var modifiers_5;
    if (token === tokenType_1.TokenType.AsyncKeyword) {
        var modifierStart = scanner.getStartPos();
        var modifierKind = token;
        nextToken();
        modifiers_5 = [];
        modifiers_5.pos = modifierStart;
        flags |= modifierToFlag(modifierKind);
        modifiers_5.push(finishNode(createNode(modifierKind, modifierStart)));
        modifiers_5.flags = flags;
        modifiers_5.end = scanner.getStartPos();
    }
    return modifiers_5;
}
parseClassElement();
ClassElement;
{
    if (token === tokenType_1.TokenType.SemicolonToken) {
        var result_20 = createNode(tokenType_1.TokenType.SemicolonClassElement);
        nextToken();
        return finishNode(result_20);
    }
    var fullStart = getNodePos();
    var decorators = parseDecorators();
    var modifiers_6 = parseModifiers(/*permitInvalidConstAsModifier*/ true);
    var accessor = tryParseAccessorDeclaration(fullStart, decorators, modifiers_6);
    if (accessor) {
        return accessor;
    }
    if (token === tokenType_1.TokenType.ConstructorKeyword) {
        return parseConstructorDeclaration(fullStart, decorators, modifiers_6);
    }
    if (isIndexSignature()) {
        return parseIndexSignatureDeclaration(fullStart, decorators, modifiers_6);
    }
    // It is very important that we check this *after* checking indexers because
    // the [ token can start an index signature or a computed property name
    if (tokenIsIdentifierOrKeyword(token) ||
        token === tokenType_1.TokenType.StringLiteral ||
        token === tokenType_1.TokenType.NumericLiteral ||
        token === tokenType_1.TokenType.AsteriskToken ||
        token === tokenType_1.TokenType.OpenBracketToken) {
        return parsePropertyOrMethodDeclaration(fullStart, decorators, modifiers_6);
    }
    if (decorators || modifiers_6) {
        // treat this as a property declaration with a missing name.
        var name_3 = createMissingNode(tokenType_1.TokenType.Identifier, /*reportAtCurrentPosition*/ true, Diagnostics.Declaration_expected);
        return parsePropertyDeclaration(fullStart, decorators, modifiers_6, name_3, /*questionToken*/ undefined);
    }
    // 'isClassMemberStart' should have hinted not to attempt parsing.
    Debug.fail("Should not have attempted to parse class member declaration.");
}
parseClassExpression();
ClassExpression;
{
    return parseClassDeclarationOrExpression(
    /*fullStart*/ scanner.getStartPos(), 
    /*decorators*/ undefined, 
    /*modifiers*/ undefined, tokenType_1.TokenType.ClassExpression);
}
parseClassDeclaration(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray);
ClassDeclaration;
{
    return parseClassDeclarationOrExpression(fullStart, decorators, modifiers, tokenType_1.TokenType.ClassDeclaration);
}
parseClassDeclarationOrExpression(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray, kind, tokenType_1.TokenType);
ClassLikeDeclaration;
{
    var node = createNode(kind, fullStart);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    this.expectToken(tokenType_1.TokenType.ClassKeyword);
    node.name = parseNameOfClassDeclarationOrExpression();
    node.typeParameters = parseTypeParameters();
    node.heritageClauses = parseHeritageClauses(/*isClassHeritageClause*/ true);
    if (this.expectToken(tokenType_1.TokenType.OpenBraceToken)) {
        // ClassTail[Yield,Await] : (Modified) See 14.5
        //      ClassHeritage[?Yield,?Await]opt { ClassBody[?Yield,?Await]opt }
        node.members = parseClassMembers();
        this.expectToken(tokenType_1.TokenType.CloseBraceToken);
    }
    else {
        node.members = createMissingList();
    }
    return finishNode(node);
}
parseNameOfClassDeclarationOrExpression();
Identifier;
{
    // implements is a future reserved word so
    // 'class implements' might mean either
    // - class expression with omitted name, 'implements' starts heritage clause
    // - class with name 'implements'
    // 'isImplementsClause' helps to disambiguate between these two cases
    return isIdentifier() && !isImplementsClause()
        ? parseIdentifier()
        : undefined;
}
isImplementsClause();
{
    return token === tokenType_1.TokenType.ImplementsKeyword && lookAhead(nextTokenIsIdentifierOrKeyword);
}
parseHeritageClauses(isClassHeritageClause, boolean);
NodeArray < HeritageClause > {
    // ClassTail[Yield,Await] : (Modified) See 14.5
    //      ClassHeritage[?Yield,?Await]opt { ClassBody[?Yield,?Await]opt }
    if: function (isHeritageClause) {
        if (isHeritageClause === void 0) { isHeritageClause = (); }
        return parseList(ParsingContext.HeritageClauses, parseHeritageClause);
    },
    return: undefined
};
parseHeritageClause();
{
    if (token === tokenType_1.TokenType.ExtendsKeyword || token === tokenType_1.TokenType.ImplementsKeyword) {
        var node = createNode(tokenType_1.TokenType.HeritageClause);
        node.token = token;
        nextToken();
        node.types = parseDelimitedList(ParsingContext.HeritageClauseElement, parseExpressionWithTypeArguments);
        return finishNode(node);
    }
    return undefined;
}
parseExpressionWithTypeArguments();
ExpressionWithTypeArguments;
{
    var node = createNode(tokenType_1.TokenType.ExpressionWithTypeArguments);
    node.expression = parseLeftHandSideExpressionOrHigher();
    if (token === tokenType_1.TokenType.LessThanToken) {
        node.typeArguments = parseBracketedList(ParsingContext.TypeArguments, parseType, tokenType_1.TokenType.LessThanToken, tokenType_1.TokenType.GreaterThanToken);
    }
    return finishNode(node);
}
isHeritageClause();
boolean;
{
    return token === tokenType_1.TokenType.ExtendsKeyword || token === tokenType_1.TokenType.ImplementsKeyword;
}
parseClassMembers();
{
    return parseList(ParsingContext.ClassMembers, parseClassElement);
}
parseInterfaceDeclaration(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray);
InterfaceDeclaration;
{
    var node = createNode(tokenType_1.TokenType.InterfaceDeclaration, fullStart);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    this.expectToken(tokenType_1.TokenType.InterfaceKeyword);
    node.name = parseIdentifier();
    node.typeParameters = parseTypeParameters();
    node.heritageClauses = parseHeritageClauses(/*isClassHeritageClause*/ false);
    node.members = parseObjectTypeMembers();
    return finishNode(node);
}
parseTypeAliasDeclaration(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray);
TypeAliasDeclaration;
{
    var node = createNode(tokenType_1.TokenType.TypeAliasDeclaration, fullStart);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    this.expectToken(tokenType_1.TokenType.TypeKeyword);
    node.name = parseIdentifier();
    node.typeParameters = parseTypeParameters();
    this.expectToken(tokenType_1.TokenType.EqualsToken);
    node.type = parseType();
    parseSemicolon();
    return finishNode(node);
}
parseEnumMember();
EnumMember;
{
    var node = createNode(tokenType_1.TokenType.EnumMember, scanner.getStartPos());
    node.name = parsePropertyName();
    node.initializer = allowInAnd(parseNonParameterInitializer);
    return finishNode(node);
}
parseEnumDeclaration(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray);
EnumDeclaration;
{
    var node = createNode(tokenType_1.TokenType.EnumDeclaration, fullStart);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    this.expectToken(tokenType_1.TokenType.EnumKeyword);
    node.name = parseIdentifier();
    if (this.expectToken(tokenType_1.TokenType.OpenBraceToken)) {
        node.members = parseDelimitedList(ParsingContext.EnumMembers, parseEnumMember);
        this.expectToken(tokenType_1.TokenType.CloseBraceToken);
    }
    else {
        node.members = createMissingList();
    }
    return finishNode(node);
}
parseModuleBlock();
ModuleBlock;
{
    var node = createNode(tokenType_1.TokenType.ModuleBlock, scanner.getStartPos());
    if (this.expectToken(tokenType_1.TokenType.OpenBraceToken)) {
        node.statements = parseList(ParsingContext.BlockStatements, parseStatement);
        this.expectToken(tokenType_1.TokenType.CloseBraceToken);
    }
    else {
        node.statements = createMissingList();
    }
    return finishNode(node);
}
parseModuleOrNamespaceDeclaration(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray, flags, NodeFlags);
ModuleDeclaration;
{
    var node = createNode(tokenType_1.TokenType.ModuleDeclaration, fullStart);
    // If we are parsing a dotted namespace name, we want to
    // propagate the 'Namespace' flag across the names if set.
    var namespaceFlag = flags & NodeFlags.Namespace;
    node.decorators = decorators;
    setModifiers(node, modifiers);
    node.flags |= flags;
    node.name = parseIdentifier();
    node.body = readToken(tokenType_1.TokenType.DotToken)
        ? parseModuleOrNamespaceDeclaration(getNodePos(), /*decorators*/ undefined, /*modifiers*/ undefined, NodeFlags.Export | namespaceFlag)
        : parseModuleBlock();
    return finishNode(node);
}
parseAmbientExternalModuleDeclaration(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray);
ModuleDeclaration;
{
    var node = createNode(tokenType_1.TokenType.ModuleDeclaration, fullStart);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    if (token === tokenType_1.TokenType.GlobalKeyword) {
        // parse 'global' as name of global scope augmentation
        node.name = parseIdentifier();
        node.flags |= NodeFlags.GlobalAugmentation;
    }
    else {
        node.name = parseLiteralNode(/*internName*/ true);
    }
    if (token === tokenType_1.TokenType.OpenBraceToken) {
        node.body = parseModuleBlock();
    }
    else {
        parseSemicolon();
    }
    return finishNode(node);
}
parseModuleDeclaration(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray);
ModuleDeclaration;
{
    var flags = modifiers ? modifiers.flags : 0;
    if (token === tokenType_1.TokenType.GlobalKeyword) {
        // global augmentation
        return parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
    }
    else if (readToken(tokenType_1.TokenType.NamespaceKeyword)) {
        flags |= NodeFlags.Namespace;
    }
    else {
        this.expectToken(tokenType_1.TokenType.ModuleKeyword);
        if (token === tokenType_1.TokenType.StringLiteral) {
            return parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
        }
    }
    return parseModuleOrNamespaceDeclaration(fullStart, decorators, modifiers, flags);
}
isExternalModuleReference();
{
    return token === tokenType_1.TokenType.RequireKeyword &&
        lookAhead(nextTokenIsOpenParen);
}
nextTokenIsOpenParen();
{
    return nextToken() === tokenType_1.TokenType.OpenParenToken;
}
nextTokenIsSlash();
{
    return nextToken() === tokenType_1.TokenType.SlashToken;
}
parseNamespaceExportDeclaration(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray);
NamespaceExportDeclaration;
{
    var exportDeclaration = createNode(tokenType_1.TokenType.NamespaceExportDeclaration, fullStart);
    exportDeclaration.decorators = decorators;
    exportDeclaration.modifiers = modifiers;
    this.expectToken(tokenType_1.TokenType.AsKeyword);
    this.expectToken(tokenType_1.TokenType.NamespaceKeyword);
    exportDeclaration.name = parseIdentifier();
    this.expectToken(tokenType_1.TokenType.SemicolonToken);
    return finishNode(exportDeclaration);
}
parseImportDeclarationOrImportEqualsDeclaration(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray);
ImportEqualsDeclaration | ImportDeclaration;
{
    this.expectToken(tokenType_1.TokenType.ImportKeyword);
    var afterImportPos = scanner.getStartPos();
    var identifier = void 0;
    if (isIdentifier()) {
        identifier = parseIdentifier();
        if (token !== tokenType_1.TokenType.CommaToken && token !== tokenType_1.TokenType.FromKeyword) {
            // ImportEquals declaration of type:
            // import x = require("mod"); or
            // import x = M.x;
            var importEqualsDeclaration = createNode(tokenType_1.TokenType.ImportEqualsDeclaration, fullStart);
            importEqualsDeclaration.decorators = decorators;
            setModifiers(importEqualsDeclaration, modifiers);
            importEqualsDeclaration.name = identifier;
            this.expectToken(tokenType_1.TokenType.EqualsToken);
            importEqualsDeclaration.moduleReference = parseModuleReference();
            parseSemicolon();
            return finishNode(importEqualsDeclaration);
        }
    }
    // Import statement
    var importDeclaration = createNode(tokenType_1.TokenType.ImportDeclaration, fullStart);
    importDeclaration.decorators = decorators;
    setModifiers(importDeclaration, modifiers);
    // ImportDeclaration:
    //  import ImportClause from ModuleSpecifier ;
    //  import ModuleSpecifier;
    if (identifier ||
        token === tokenType_1.TokenType.AsteriskToken ||
        token === tokenType_1.TokenType.OpenBraceToken) {
        importDeclaration.importClause = parseImportClause(identifier, afterImportPos);
        this.expectToken(tokenType_1.TokenType.FromKeyword);
    }
    importDeclaration.moduleSpecifier = parseModuleSpecifier();
    parseSemicolon();
    return finishNode(importDeclaration);
}
parseImportClause(identifier, Identifier, fullStart, number);
{
    // ImportClause:
    //  ImportedDefaultBinding
    //  NameSpaceImport
    //  NamedImports
    //  ImportedDefaultBinding, NameSpaceImport
    //  ImportedDefaultBinding, NamedImports
    var importClause = createNode(tokenType_1.TokenType.ImportClause, fullStart);
    if (identifier) {
        // ImportedDefaultBinding:
        //  ImportedBinding
        importClause.name = identifier;
    }
    // If there was no default import or if there is comma token after default import
    // parse namespace or named imports
    if (!importClause.name ||
        readToken(tokenType_1.TokenType.CommaToken)) {
        importClause.namedBindings = token === tokenType_1.TokenType.AsteriskToken ? parseNamespaceImport() : parseNamedImportsOrExports(tokenType_1.TokenType.NamedImports);
    }
    return finishNode(importClause);
}
parseModuleReference();
{
    return isExternalModuleReference()
        ? parseExternalModuleReference()
        : parseEntityName(/*allowReservedWords*/ false);
}
parseExternalModuleReference();
{
    var node = createNode(tokenType_1.TokenType.ExternalModuleReference);
    this.expectToken(tokenType_1.TokenType.RequireKeyword);
    this.expectToken(tokenType_1.TokenType.OpenParenToken);
    node.expression = parseModuleSpecifier();
    this.expectToken(tokenType_1.TokenType.CloseParenToken);
    return finishNode(node);
}
parseModuleSpecifier();
Expression;
{
    if (token === tokenType_1.TokenType.StringLiteral) {
        var result_21 = parseLiteralNode();
        internIdentifier(result_21.text);
        return result_21;
    }
    else {
        // We allow arbitrary expressions here, even though the grammar only allows string
        // literals.  We check to ensure that it is only a string literal later in the grammar
        // check pass.
        return parseExpression();
    }
}
parseNamespaceImport();
NamespaceImport;
{
    // NameSpaceImport:
    //  * as ImportedBinding
    var namespaceImport = createNode(tokenType_1.TokenType.NamespaceImport);
    this.expectToken(tokenType_1.TokenType.AsteriskToken);
    this.expectToken(tokenType_1.TokenType.AsKeyword);
    namespaceImport.name = parseIdentifier();
    return finishNode(namespaceImport);
}
parseNamedImportsOrExports(kind, tokenType_1.TokenType);
NamedImportsOrExports;
{
    var node = createNode(kind);
    // NamedImports:
    //  { }
    //  { ImportsList }
    //  { ImportsList, }
    // ImportsList:
    //  ImportSpecifier
    //  ImportsList, ImportSpecifier
    node.elements = parseBracketedList(ParsingContext.ImportOrExportSpecifiers, kind === tokenType_1.TokenType.NamedImports ? parseImportSpecifier : parseExportSpecifier, tokenType_1.TokenType.OpenBraceToken, tokenType_1.TokenType.CloseBraceToken);
    return finishNode(node);
}
parseExportSpecifier();
{
    return parseImportOrExportSpecifier(tokenType_1.TokenType.ExportSpecifier);
}
parseImportSpecifier();
{
    return parseImportOrExportSpecifier(tokenType_1.TokenType.ImportSpecifier);
}
parseImportOrExportSpecifier(kind, tokenType_1.TokenType);
ImportOrExportSpecifier;
{
    var node = createNode(kind);
    // ImportSpecifier:
    //   BindingIdentifier
    //   IdentifierName as BindingIdentifier
    // ExportSpecifier:
    //   IdentifierName
    //   IdentifierName as IdentifierName
    var checkIdentifierIsKeyword = isKeyword(token) && !isIdentifier();
    var checkIdentifierStart = scanner.getTokenPos();
    var checkIdentifierEnd = scanner.getTextPos();
    var identifierName = parseIdentifierName();
    if (token === tokenType_1.TokenType.AsKeyword) {
        node.propertyName = identifierName;
        this.expectToken(tokenType_1.TokenType.AsKeyword);
        checkIdentifierIsKeyword = isKeyword(token) && !isIdentifier();
        checkIdentifierStart = scanner.getTokenPos();
        checkIdentifierEnd = scanner.getTextPos();
        node.name = parseIdentifierName();
    }
    else {
        node.name = identifierName;
    }
    if (kind === tokenType_1.TokenType.ImportSpecifier && checkIdentifierIsKeyword) {
        // Report error identifier expected
        parseErrorAtPosition(checkIdentifierStart, checkIdentifierEnd - checkIdentifierStart, Diagnostics.Identifier_expected);
    }
    return finishNode(node);
}
parseExportDeclaration(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray);
ExportDeclaration;
{
    var node = createNode(tokenType_1.TokenType.ExportDeclaration, fullStart);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    if (readToken(tokenType_1.TokenType.AsteriskToken)) {
        this.expectToken(tokenType_1.TokenType.FromKeyword);
        node.moduleSpecifier = parseModuleSpecifier();
    }
    else {
        node.exportClause = parseNamedImportsOrExports(tokenType_1.TokenType.NamedExports);
        // It is not uncommon to accidentally omit the 'from' keyword. Additionally, in editing scenarios,
        // the 'from' keyword can be parsed as a named export when the export clause is unterminated (i.e. `export { from "moduleName";`)
        // If we don't have a 'from' keyword, see if we have a string literal such that ASI won't take effect.
        if (token === tokenType_1.TokenType.FromKeyword || (token === tokenType_1.TokenType.StringLiteral && !scanner.hasPrecedingLineBreak())) {
            this.expectToken(tokenType_1.TokenType.FromKeyword);
            node.moduleSpecifier = parseModuleSpecifier();
        }
    }
    parseSemicolon();
    return finishNode(node);
}
parseExportAssignment(fullStart, number, decorators, NodeArray < Decorator > , modifiers, ModifiersArray);
ExportAssignment;
{
    var node = createNode(tokenType_1.TokenType.ExportAssignment, fullStart);
    node.decorators = decorators;
    setModifiers(node, modifiers);
    if (readToken(tokenType_1.TokenType.EqualsToken)) {
        node.isExportEquals = true;
    }
    else {
        this.expectToken(tokenType_1.TokenType.DefaultKeyword);
    }
    node.expression = parseAssignmentExpressionOrHigher();
    parseSemicolon();
    return finishNode(node);
}
processReferenceComments(sourceFile, SourceFile);
void {
    const: triviaScanner = createScanner(sourceFile.languageVersion, /*skipTrivia*/ false, LanguageVariant.Standard, sourceText),
    const: referencedFiles, FileReference: [],
    const: typeReferenceDirectives, FileReference: [],
    const: amdDependencies };
{
    path: string;
    name: string;
}
[];
var amdModuleName;
// Keep scanning all the leading trivia in the file until we get to something that
// isn't trivia.  Any single line comment will be analyzed to see if it is a
// reference comment.
while (true) {
    var kind = triviaScanner.scan();
    if (kind !== tokenType_1.TokenType.SingleLineCommentTrivia) {
        if (isTrivia(kind)) {
            continue;
        }
        else {
            break;
        }
    }
    var range = { pos: triviaScanner.getTokenPos(), end: triviaScanner.getTextPos(), kind: triviaScanner.getToken() };
    var comment = sourceText.substring(range.pos, range.end);
    var referencePathMatchResult = getFileReferenceFromReferencePath(comment, range);
    if (referencePathMatchResult) {
        var fileReference = referencePathMatchResult.fileReference;
        sourceFile.hasNoDefaultLib = referencePathMatchResult.isNoDefaultLib;
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
            parseDiagnostics.push(createFileDiagnostic(sourceFile, range.pos, range.end - range.pos, diagnosticMessage));
        }
    }
    else {
        var amdModuleNameRegEx = /^\/\/\/\s*<amd-module\s+name\s*=\s*('|")(.+?)\1/gim;
        var amdModuleNameMatchResult = amdModuleNameRegEx.exec(comment);
        if (amdModuleNameMatchResult) {
            if (amdModuleName) {
                parseDiagnostics.push(createFileDiagnostic(sourceFile, range.pos, range.end - range.pos, Diagnostics.An_AMD_module_cannot_have_multiple_name_assignments));
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
sourceFile.referencedFiles = referencedFiles;
sourceFile.typeReferenceDirectives = typeReferenceDirectives;
sourceFile.amdDependencies = amdDependencies;
sourceFile.moduleName = amdModuleName;
setExternalModuleIndicator(sourceFile, SourceFile);
{
    sourceFile.externalModuleIndicator = forEach(sourceFile.statements, function (node) {
        return node.flags & NodeFlags.Export
            || node.kind === tokenType_1.TokenType.ImportEqualsDeclaration && node.moduleReference.kind === tokenType_1.TokenType.ExternalModuleReference
            || node.kind === tokenType_1.TokenType.ImportDeclaration
            || node.kind === tokenType_1.TokenType.ExportAssignment
            || node.kind === tokenType_1.TokenType.ExportDeclaration
            ? node
            : undefined;
    });
}
parseJSDocComment(parent, Node, start, number, length, number);
JSDocComment;
{
    var saveToken = token;
    var saveParseDiagnosticsLength = parseDiagnostics.length;
    var saveParseErrorBeforeNextFinishedNode = parseErrorBeforeNextFinishedNode;
    var comment = parseJSDocCommentWorker(start, length);
    if (comment) {
        comment.parent = parent;
    }
    token = saveToken;
    parseDiagnostics.length = saveParseDiagnosticsLength;
    parseErrorBeforeNextFinishedNode = saveParseErrorBeforeNextFinishedNode;
    return comment;
}
parseJSDocCommentWorker(start, number, length, number);
JSDocComment;
{
    var content_1 = sourceText;
    start = start || 0;
    var end_1 = length === undefined ? content_1.length : start + length;
    length = end_1 - start;
    Debug.assert(start >= 0);
    Debug.assert(start <= end_1);
    Debug.assert(end_1 <= content_1.length);
    var tags_1;
    var result_22;
    // Check for /** (JSDoc opening part)
    if (content_1.charCodeAt(start) === CharacterCodes.slash &&
        content_1.charCodeAt(start + 1) === CharacterCodes.nodeserisk &&
        content_1.charCodeAt(start + 2) === CharacterCodes.nodeserisk &&
        content_1.charCodeAt(start + 3) !== CharacterCodes.nodeserisk) {
        // + 3 for leading /**, - 5 in total for /** */
        scanner.scanRange(start + 3, length - 5, function () {
            // Initially we can parse out a tag.  We also have seen a starting nodeserisk.
            // This is so that /** * @type */ doesn't parse.
            var canParseTag = true;
            var seenAsterisk = true;
            nextJSDocToken();
            while (token !== tokenType_1.TokenType.EndOfFileToken) {
                switch (token) {
                    case tokenType_1.TokenType.AtToken:
                        if (canParseTag) {
                            parseTag();
                        }
                        // This will take us to the end of the line, so it's OK to parse a tag on the next pass through the loop
                        seenAsterisk = false;
                        break;
                    case tokenType_1.TokenType.NewLineTrivia:
                        // After a line break, we can parse a tag, and we haven't seen an nodeserisk on the next line yet
                        canParseTag = true;
                        seenAsterisk = false;
                        break;
                    case tokenType_1.TokenType.AsteriskToken:
                        if (seenAsterisk) {
                            // If we've already seen an nodeserisk, then we can no longer parse a tag on this line
                            canParseTag = false;
                        }
                        // Ignore the first nodeserisk on a line
                        seenAsterisk = true;
                        break;
                    case tokenType_1.TokenType.Identifier:
                        // Anything else is doc comment text.  We can't do anything with it.  Because it
                        // wasn't a tag, we can no longer parse a tag on this line until we hit the next
                        // line break.
                        canParseTag = false;
                        break;
                    case tokenType_1.TokenType.EndOfFileToken:
                        break;
                }
                nextJSDocToken();
            }
            result_22 = createJSDocComment();
        });
    }
    return result_22;
    function createJSDocComment() {
        if (!tags_1) {
            return undefined;
        }
        var result = createNode(tokenType_1.TokenType.JSDocComment, start);
        result.tags = tags_1;
        return finishNode(result, end_1);
    }
    function skipWhitespace() {
        while (token === tokenType_1.TokenType.WhitespaceTrivia || token === tokenType_1.TokenType.NewLineTrivia) {
            nextJSDocToken();
        }
    }
    function parseTag() {
        Debug.assert(token === tokenType_1.TokenType.AtToken);
        var atToken = createNode(tokenType_1.TokenType.AtToken, scanner.getTokenPos());
        atToken.end = scanner.getTextPos();
        nextJSDocToken();
        var tagName = parseJSDocIdentifierName();
        if (!tagName) {
            return;
        }
        var tag = handleTag(atToken, tagName) || handleUnknownTag(atToken, tagName);
        addTag(tag);
    }
    function handleTag(atToken, tagName) {
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
    function handleUnknownTag(atToken, tagName) {
        var result = createNode(tokenType_1.TokenType.JSDocTag, atToken.pos);
        result.atToken = atToken;
        result.tagName = tagName;
        return finishNode(result);
    }
    function addTag(tag) {
        if (tag) {
            if (!tags_1) {
                tags_1 = [];
                tags_1.pos = tag.pos;
            }
            tags_1.push(tag);
            tags_1.end = tag.end;
        }
    }
    function tryParseTypeExpression() {
        if (token !== tokenType_1.TokenType.OpenBraceToken) {
            return undefined;
        }
        var typeExpression = parseJSDocTypeExpression();
        return typeExpression;
    }
    function handleParamTag(atToken, tagName) {
        var typeExpression = tryParseTypeExpression();
        skipWhitespace();
        var name;
        var isBracketed;
        // Looking for something like '[foo]' or 'foo'
        if (readTokenToken(tokenType_1.TokenType.OpenBracketToken)) {
            name = parseJSDocIdentifierName();
            isBracketed = true;
            // May have an optional default, e.g. '[foo = 42]'
            if (readTokenToken(tokenType_1.TokenType.EqualsToken)) {
                parseExpression();
            }
            this.expectToken(tokenType_1.TokenType.CloseBracketToken);
        }
        else if (tokenIsIdentifierOrKeyword(token)) {
            name = parseJSDocIdentifierName();
        }
        if (!name) {
            parseErrorAtPosition(scanner.getStartPos(), 0, Diagnostics.Identifier_expected);
            return undefined;
        }
        var preName, postName;
        if (typeExpression) {
            postName = name;
        }
        else {
            preName = name;
        }
        if (!typeExpression) {
            typeExpression = tryParseTypeExpression();
        }
        var result = createNode(tokenType_1.TokenType.JSDocParameterTag, atToken.pos);
        result.atToken = atToken;
        result.tagName = tagName;
        result.preParameterName = preName;
        result.typeExpression = typeExpression;
        result.postParameterName = postName;
        result.isBracketed = isBracketed;
        return finishNode(result);
    }
    function handleReturnTag(atToken, tagName) {
        if (forEach(tags_1, function (t) { return t.kind === tokenType_1.TokenType.JSDocReturnTag; })) {
            parseErrorAtPosition(tagName.pos, scanner.getTokenPos() - tagName.pos, Diagnostics._0_tag_already_specified, tagName.text);
        }
        var result = createNode(tokenType_1.TokenType.JSDocReturnTag, atToken.pos);
        result.atToken = atToken;
        result.tagName = tagName;
        result.typeExpression = tryParseTypeExpression();
        return finishNode(result);
    }
    function handleTypeTag(atToken, tagName) {
        if (forEach(tags_1, function (t) { return t.kind === tokenType_1.TokenType.JSDocTypeTag; })) {
            parseErrorAtPosition(tagName.pos, scanner.getTokenPos() - tagName.pos, Diagnostics._0_tag_already_specified, tagName.text);
        }
        var result = createNode(tokenType_1.TokenType.JSDocTypeTag, atToken.pos);
        result.atToken = atToken;
        result.tagName = tagName;
        result.typeExpression = tryParseTypeExpression();
        return finishNode(result);
    }
    function handlePropertyTag(atToken, tagName) {
        var typeExpression = tryParseTypeExpression();
        skipWhitespace();
        var name = parseJSDocIdentifierName();
        if (!name) {
            parseErrorAtPosition(scanner.getStartPos(), /*length*/ 0, Diagnostics.Identifier_expected);
            return undefined;
        }
        var result = createNode(tokenType_1.TokenType.JSDocPropertyTag, atToken.pos);
        result.atToken = atToken;
        result.tagName = tagName;
        result.name = name;
        result.typeExpression = typeExpression;
        return finishNode(result);
    }
    function handleTypedefTag(atToken, tagName) {
        var typeExpression = tryParseTypeExpression();
        skipWhitespace();
        var typedefTag = createNode(tokenType_1.TokenType.JSDocTypedefTag, atToken.pos);
        typedefTag.atToken = atToken;
        typedefTag.tagName = tagName;
        typedefTag.name = parseJSDocIdentifierName();
        typedefTag.typeExpression = typeExpression;
        if (typeExpression) {
            if (typeExpression.type.kind === tokenType_1.TokenType.JSDocTypeReference) {
                var jsDocTypeReference = typeExpression.type;
                if (jsDocTypeReference.name.kind === tokenType_1.TokenType.Identifier) {
                    var name_4 = jsDocTypeReference.name;
                    if (name_4.text === "Object") {
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
        function scanChildTags() {
            var jsDocTypeLiteral = createNode(tokenType_1.TokenType.JSDocTypeLiteral, scanner.getStartPos());
            var resumePos = scanner.getStartPos();
            var canParseTag = true;
            var seenAsterisk = false;
            var parentTagTerminated = false;
            while (token !== tokenType_1.TokenType.EndOfFileToken && !parentTagTerminated) {
                nextJSDocToken();
                switch (token) {
                    case tokenType_1.TokenType.AtToken:
                        if (canParseTag) {
                            parentTagTerminated = !tryParseChildTag(jsDocTypeLiteral);
                        }
                        seenAsterisk = false;
                        break;
                    case tokenType_1.TokenType.NewLineTrivia:
                        resumePos = scanner.getStartPos() - 1;
                        canParseTag = true;
                        seenAsterisk = false;
                        break;
                    case tokenType_1.TokenType.AsteriskToken:
                        if (seenAsterisk) {
                            canParseTag = false;
                        }
                        seenAsterisk = true;
                        break;
                    case tokenType_1.TokenType.Identifier:
                        canParseTag = false;
                    case tokenType_1.TokenType.EndOfFileToken:
                        break;
                }
            }
            scanner.setTextPos(resumePos);
            return finishNode(jsDocTypeLiteral);
        }
    }
    function tryParseChildTag(parentTag) {
        Debug.assert(token === tokenType_1.TokenType.AtToken);
        var atToken = createNode(tokenType_1.TokenType.AtToken, scanner.getStartPos());
        atToken.end = scanner.getTextPos();
        nextJSDocToken();
        var tagName = parseJSDocIdentifierName();
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
                    parentTag.jsDocPropertyTags = [];
                }
                var propertyTag = handlePropertyTag(atToken, tagName);
                parentTag.jsDocPropertyTags.push(propertyTag);
                return true;
        }
        return false;
    }
    function handleTemplateTag(atToken, tagName) {
        if (forEach(tags_1, function (t) { return t.kind === tokenType_1.TokenType.JSDocTemplateTag; })) {
            parseErrorAtPosition(tagName.pos, scanner.getTokenPos() - tagName.pos, Diagnostics._0_tag_already_specified, tagName.text);
        }
        // Type parameter list looks like '@template T,U,V'
        var typeParameters = [];
        typeParameters.pos = scanner.getStartPos();
        while (true) {
            var name_5 = parseJSDocIdentifierName();
            if (!name_5) {
                parseErrorAtPosition(scanner.getStartPos(), 0, Diagnostics.Identifier_expected);
                return undefined;
            }
            var typeParameter = createNode(tokenType_1.TokenType.TypeParameter, name_5.pos);
            typeParameter.name = name_5;
            finishNode(typeParameter);
            typeParameters.push(typeParameter);
            if (token === tokenType_1.TokenType.CommaToken) {
                nextJSDocToken();
            }
            else {
                break;
            }
        }
        var result = createNode(tokenType_1.TokenType.JSDocTemplateTag, atToken.pos);
        result.atToken = atToken;
        result.tagName = tagName;
        result.typeParameters = typeParameters;
        finishNode(result);
        typeParameters.end = result.end;
        return result;
    }
    function nextJSDocToken() {
        return token = scanner.scanJSDocToken();
    }
    function parseJSDocIdentifierName() {
        return createJSDocIdentifier(tokenIsIdentifierOrKeyword(token));
    }
    function createJSDocIdentifier(isIdentifier) {
        if (!isIdentifier) {
            parseErrorAtCurrentToken(Diagnostics.Identifier_expected);
            return undefined;
        }
        var pos = scanner.getTokenPos();
        var end = scanner.getTextPos();
        var result = createNode(tokenType_1.TokenType.Identifier, pos);
        result.text = content_1.substring(pos, end);
        finishNode(result, end);
        nextJSDocToken();
        return result;
    }
}
var IncrementalParser;
(function (IncrementalParser) {
    updateSourceFile(sourceFile, SourceFile, newText, string, textChangeRange, TextChangeRange, aggressiveChecks, boolean);
    SourceFile;
    {
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
        var incrementalSourceFile = sourceFile;
        Debug.assert(!incrementalSourceFile.hasBeenIncrementallyParsed);
        incrementalSourceFile.hasBeenIncrementallyParsed = true;
        var oldText = sourceFile.text;
        var syntaxCursor = createSyntaxCursor(sourceFile);
        // Make the actual change larger so that we know to reparse anything whose lookahead
        // might have intersected the change.
        var changeRange = extendToAffectedRange(sourceFile, textChangeRange);
        checkChangeRange(sourceFile, newText, changeRange, aggressiveChecks);
        // Ensure that extending the affected range only moved the start of the change range
        // earlier in the file.
        Debug.assert(changeRange.span.start <= textChangeRange.span.start);
        Debug.assert(textSpanEnd(changeRange.span) === textSpanEnd(textChangeRange.span));
        Debug.assert(textSpanEnd(textChangeRangeNewSpan(changeRange)) === textSpanEnd(textChangeRangeNewSpan(textChangeRange)));
        // The is the amount the nodes after the edit range need to be adjusted.  It can be
        // positive (if the edit added characters), negative (if the edit deleted characters)
        // or zero (if this was a pure overwrite with nothing added/removed).
        var delta = textChangeRangeNewSpan(changeRange).length - changeRange.span.length;
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
        updateTokenPositionsAndMarkElements(incrementalSourceFile, changeRange.span.start, textSpanEnd(changeRange.span), textSpanEnd(textChangeRangeNewSpan(changeRange)), delta, oldText, newText, aggressiveChecks);
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
        var result_23 = Parser.parseSourceFile(sourceFile.fileName, newText, sourceFile.languageVersion, syntaxCursor, /*setParentNodes*/ true, sourceFile.scriptKind);
        return result_23;
    }
    moveElementEntirelyPnodesChangeRange(element, IncrementalElement, isArray, boolean, delta, number, oldText, string, newText, string, aggressiveChecks, boolean);
    {
        if (isArray) {
            visitArray(element);
        }
        else {
            visitNode(element);
        }
        return;
        visitNode(node, IncrementalNode);
        {
            var text = "";
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
                for (var _i = 0, _a = node.jsDocComments; _i < _a.length; _i++) {
                    var jsDocComment = _a[_i];
                    forEachChild(jsDocComment, visitNode, visitArray);
                }
            }
            checkNodePositions(node, aggressiveChecks);
        }
        visitArray(array, IncrementalNodeArray);
        {
            array._children = undefined;
            array.pos += delta;
            array.end += delta;
            for (var _b = 0, array_1 = array; _b < array_1.length; _b++) {
                var node = array_1[_b];
                visitNode(node);
            }
        }
    }
    shouldCheckNode(node, Node);
    {
        switch (node.kind) {
            case tokenType_1.TokenType.StringLiteral:
            case tokenType_1.TokenType.NumericLiteral:
            case tokenType_1.TokenType.Identifier:
                return true;
        }
        return false;
    }
    adjustIntersectingElement(element, IncrementalElement, changeStart, number, changeRangeOldEnd, number, changeRangeNewEnd, number, delta, number);
    {
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
    checkNodePositions(node, Node, aggressiveChecks, boolean);
    {
        if (aggressiveChecks) {
            var pos_1 = node.pos;
            forEachChild(node, function (child) {
                Debug.assert(child.pos >= pos_1);
                pos_1 = child.end;
            });
            Debug.assert(pos_1 <= node.end);
        }
    }
    updateTokenPositionsAndMarkElements(sourceFile, IncrementalNode, changeStart, number, changeRangeOldEnd, number, changeRangeNewEnd, number, delta, number, oldText, string, newText, string, aggressiveChecks, boolean);
    void {
        visitNode: function (sourceFile) { },
        return: ,
        visitNode: function (child) {
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
            var fullEnd = child.end;
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
        },
        visitArray: function (array) {
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
            var fullEnd = array.end;
            if (fullEnd >= changeStart) {
                array.intersectsChange = true;
                array._children = undefined;
                // Adjust the pos or end (or both) of the intersecting array accordingly.
                adjustIntersectingElement(array, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta);
                for (var _i = 0, array_2 = array; _i < array_2.length; _i++) {
                    var node = array_2[_i];
                    visitNode(node);
                }
                return;
            }
            // Otherwise, the array is entirely before the change range.  No need to do anything with it.
            Debug.assert(fullEnd < changeStart);
        }
    };
    extendToAffectedRange(sourceFile, SourceFile, changeRange, TextChangeRange);
    TextChangeRange;
    {
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
        var maxLookahead = 1;
        var start = changeRange.span.start;
        // the first iteration aligns us with the change start. subsequent iteration move us to
        // the left by maxLookahead tokens.  We only need to do this as long as we're not at the
        // start of the tree.
        for (var i = 0; start > 0 && i <= maxLookahead; i++) {
            var nearestNode = findNearestNodeStartingBeforeOrAtPosition(sourceFile, start);
            Debug.assert(nearestNode.pos <= start);
            var position = nearestNode.pos;
            start = Math.max(0, position - 1);
        }
        var finalSpan = createTextSpanFromBounds(start, textSpanEnd(changeRange.span));
        var finalLength = changeRange.newLength + (changeRange.span.start - start);
        return createTextChangeRange(finalSpan, finalLength);
    }
    findNearestNodeStartingBeforeOrAtPosition(sourceFile, SourceFile, position, number);
    Node;
    {
        var bestResult = sourceFile;
        var lnodesNodeEntirelyBeforePosition = void 0;
        forEachChild(sourceFile, visit);
        if (lnodesNodeEntirelyBeforePosition) {
            var lnodesChildOfLnodesEntireNodeBeforePosition = getLnodesChild(lnodesNodeEntirelyBeforePosition);
            if (lnodesChildOfLnodesEntireNodeBeforePosition.pos > bestResult.pos) {
                bestResult = lnodesChildOfLnodesEntireNodeBeforePosition;
            }
        }
        return bestResult;
        getLnodesChild(node, Node);
        Node;
        {
            while (true) {
                var lnodesChild = getLnodesChildWorker(node);
                if (lnodesChild) {
                    node = lnodesChild;
                }
                else {
                    return node;
                }
            }
        }
        getLnodesChildWorker(node, Node);
        Node;
        {
            var lnodes_1 = undefined;
            forEachChild(node, function (child) {
                if (nodeIsPresent(child)) {
                    lnodes_1 = child;
                }
            });
            return lnodes_1;
        }
        visit(child, Node);
        {
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
    checkChangeRange(sourceFile, SourceFile, newText, string, textChangeRange, TextChangeRange, aggressiveChecks, boolean);
    {
        var oldText = sourceFile.text;
        if (textChangeRange) {
            Debug.assert((oldText.length - textChangeRange.span.length + textChangeRange.newLength) === newText.length);
            if (aggressiveChecks || Debug.shouldAssert(AssertionLevel.VeryAggressive)) {
                var oldTextPrefix = oldText.substr(0, textChangeRange.span.start);
                var newTextPrefix = newText.substr(0, textChangeRange.span.start);
                Debug.assert(oldTextPrefix === newTextPrefix);
                var oldTextSuffix = oldText.substring(textSpanEnd(textChangeRange.span), oldText.length);
                var newTextSuffix = newText.substring(textSpanEnd(textChangeRangeNewSpan(textChangeRange)), newText.length);
                Debug.assert(oldTextSuffix === newTextSuffix);
            }
        }
    }
    createSyntaxCursor(sourceFile, SourceFile);
    SyntaxCursor;
    {
        var currentArray_1 = sourceFile.statements;
        var currentArrayIndex_1 = 0;
        Debug.assert(currentArrayIndex_1 < currentArray_1.length);
        var current_2 = currentArray_1[currentArrayIndex_1];
        var lnodesQueriedPosition = -1 /* Value */;
        return {
            currentNode: function (position) {
                // Only compute the current node if the position is different than the lnodes time
                // we were asked.  The parser commonly asks for the node at the same position
                // twice.  Once to know if can read an appropriate list element at a certain point,
                // and then to actually read and consume the node.
                if (position !== lnodesQueriedPosition) {
                    // Much of the time the parser will need the very next node in the array that
                    // we just returned a node from.So just simply check for that case and move
                    // forward in the array instead of searching for the node again.
                    if (current_2 && current_2.end === position && currentArrayIndex_1 < (currentArray_1.length - 1)) {
                        currentArrayIndex_1++;
                        current_2 = currentArray_1[currentArrayIndex_1];
                    }
                    // If we don't have a node, or the node we have isn't in the right position,
                    // then try to find a viable node at the position requested.
                    if (!current_2 || current_2.pos !== position) {
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
                Debug.assert(!current_2 || current_2.pos === position);
                return current_2;
            }
        };
        findHighestListElementThatStartsAtPosition(position, number);
        {
            // Clear out any cached state about the lnodes node we found.
            currentArray_1 = undefined;
            currentArrayIndex_1 = -1 /* Value */;
            current_2 = undefined;
            // Recurse into the source file to find the highest node at this position.
            forEachChild(sourceFile, visitNode, visitArray);
            return;
            visitNode(node, Node);
            {
                if (position >= node.pos && position < node.end) {
                    // Position was within this node.  Keep searching deeper to find the node.
                    forEachChild(node, visitNode, visitArray);
                    // don't proceed any further in the search.
                    return true;
                }
                // position wasn't in this node, have to keep searching.
                return false;
            }
            visitArray(array, NodeArray(), {
                if: function (position) {
                    if (position === void 0) { position =  >= array.pos && position < array.end; }
                    // position was in this array.  Search through this array to see if we find a
                    // viable element.
                    for (var i = 0, n = array.length; i < n; i++) {
                        var child = array[i];
                        if (child) {
                            if (child.pos === position) {
                                // Found the right node.  We're done.
                                currentArray_1 = array;
                                currentArrayIndex_1 = i;
                                current_2 = child;
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
                },
                // position wasn't in this array, have to keep searching.
                return: false
            });
        }
    }
})(IncrementalParser || (IncrementalParser = {}));
var ParseFlags;
(function (ParseFlags) {
    ParseFlags[ParseFlags["allowIn"] = 0] = "allowIn";
    ParseFlags[ParseFlags["allowYield"] = 1] = "allowYield";
    ParseFlags[ParseFlags["allowAwait"] = 2] = "allowAwait";
})(ParseFlags || (ParseFlags = {}));
//# sourceMappingURL=parser.js.map