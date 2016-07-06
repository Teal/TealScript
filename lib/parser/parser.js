/**
 * @fileOverview 语法解析器
 */
var tokenType_1 = require('../ast/tokenType');
var nodes = require('../ast/nodes');
var lexer_1 = require('./lexer');
var compiler_1 = require('../compiler/compiler');
/**
 * 表示一个语法解析器。
 * @description 语法解析器可以将源码解析一个语法树。
 */
var Parser = (function () {
    function Parser() {
        // #region 接口
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
     * @param fileName 解析的源码位置。
     */
    Parser.prototype.parse = function (text, start, fileName) {
        this.lexer.setSource(text, start, fileName);
        return this.parseSourceFile();
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
    Parser.prototype.parseAsTypeExpression = function (text, start, fileName) {
        this.lexer.setSource(text, start, fileName);
        return this.parseTypeExpression();
    };
    // #endregion
    // #region 解析工具
    /**
     * 报告一个语法错误。
     * @param token 发生错误的标记。
     * @param message 错误的信息。
     * @param args 格式化错误的参数。
     */
    Parser.prototype.error = function (token, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        compiler_1.error.apply(void 0, [compiler_1.ErrorType.syntaxError, this.lexer.fileName, token.start, token.end, message].concat(args));
    };
    /**
     * 如果下一个标记是指定的类型，则读取下一个标记。
     * @param token 期待的标记类型。
     * @returns 如果已读取标记则返回 true，否则返回 false。
     */
    Parser.prototype.readToken = function (token) {
        if (this.lexer.peek().type === token) {
            this.lexer.read();
            return true;
        }
        return false;
    };
    /**
     * 读取下一个标记。如如果下一个标记不是指定的类型则输出一条错误。
     * @param token 期待的标记。
     * @returns 如果已读取标记则返回下一个标记的开始位置，否则返回 undefined。
     */
    Parser.prototype.expectToken = function (token) {
        if (this.lexer.peek().type === token) {
            return this.lexer.read().start;
        }
        this.error(this.lexer.peek(), "应输入“{0}”。", tokenType_1.tokenToString(token));
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
    /**
     * 尝试在当前位置自动插入分号。
     * @return 返回插入或补齐分号后的结束位置。
     */
    Parser.prototype.autoInsertSemicolon = function () {
        switch (this.lexer.peek().type) {
            case tokenType_1.TokenType.semicolon:
                return this.lexer.read().end;
            case tokenType_1.TokenType.closeBrace:
            case tokenType_1.TokenType.endOfFile:
                return compiler_1.options.autoInsertSemicolon === false ?
                    this.expectToken(tokenType_1.TokenType.semicolon) :
                    this.lexer.current.end;
            default:
                return compiler_1.options.autoInsertSemicolon === false || !this.lexer.peek().onNewLine ?
                    this.expectToken(tokenType_1.TokenType.semicolon) :
                    this.lexer.current.end;
        }
    };
    // #endregion
    // #region 节点
    // #endregion
    // #region 语句
    /**
     * 解析一个语句。
     */
    Parser.prototype.parseStatement = function () {
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
                return this.parseBlockStatement();
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
     * 解析一个语句块({...})。
     */
    Parser.prototype.parseBlockStatement = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.openBrace);
        var result = new nodes.BlockStatement();
        result.start = this.lexer.read().start;
        result.statements = this.parseStatementList(tokenType_1.TokenType.closeBrace);
        result.end = this.lexer.read().end;
        console.assert(this.lexer.current.type === tokenType_1.TokenType.closeBrace);
        return result;
    };
    /**
     * 解析一个语句列表(...; ...)。
     */
    Parser.prototype.parseStatementList = function (end) {
        //  StatementList[Yield, Return] :
        //      StatementListItem[Yield, Return]
        //      StatementList[Yield,Return] StatementListItem[Yield, Return]
        //  
        //  StatementListItem[Yield, Return] :
        //      Statement[Yield, Return]
        //      Declaration[Yield]
        var result = [];
        while (true) {
            result.push(this.parseStatement());
            switch (this.lexer.peek().type) {
                case end:
                    return result;
                case tokenType_1.TokenType.endOfFile:
                    if (end != undefined) {
                        this.expectToken(end);
                    }
                    return result;
            }
        }
    };
    /**
     * 解析一个变量声明语句(var xx = ...)。
     */
    Parser.prototype.parseVariableStatement = function (type, decorators, modifiers) {
        //  VariableStatement[Yield] :
        //      var VariableDeclarationList[In, Yield];
        //      let VariableDeclarationList[In, Yield];
        //      const VariableDeclarationList[In, Yield];
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.var || this.lexer.peek().type === tokenType_1.TokenType.let || this.lexer.peek().type === tokenType_1.TokenType.const);
        var result = this.lexer.peek().type === tokenType_1.TokenType.var ? new nodes.VarStatement() :
            this.lexer.peek().type === tokenType_1.TokenType.let ? new nodes.LetStatement() :
                new nodes.ConstStatement();
        result.start = this.lexer.read().start; // var、let、const
        result.decorators = decorators;
        result.modifiers = modifiers;
        result.variables = this.parseVariableDeclarationList();
        result.end = this.autoInsertSemicolon();
        return result;
    };
    /**
     * 解析一个变量声明列表(xx = 1, ...)。
     */
    Parser.prototype.parseVariableDeclarationList = function () {
        //  VariableDeclarationList[In, Yield] :
        //      VariableDeclaration[In, Yield]
        //      VariableDeclarationList[In, Yield] , VariableDeclaration[In, Yield]
        var result = [];
        do {
            result.push(this.parseVariableDeclaration());
        } while (this.readToken(tokenType_1.TokenType.comma));
        return result;
    };
    /**
     * 解析一个变量声明(xx = 1)。
     */
    Parser.prototype.parseVariableDeclaration = function () {
        //  VariableDeclaration[In, Yield] :
        //      BindingIdentifier[Yield] TypeAnnotation? Initializer[In, Yield]?
        //      BindingPattern[Yield] TypeAnnotation? Initializer[In, Yield]
        var result = new nodes.VariableDeclaration();
        result.name = this.parseBindingIdentifierOrPattern(); // BindingIdentifier | BindingPattern
        if (this.readToken(tokenType_1.TokenType.colon)) {
            result.colonStart = this.lexer.current.start;
            result.type = this.parseTypeExpression();
        }
        if (this.readToken(tokenType_1.TokenType.equals)) {
            result.equalStart = this.lexer.current.start;
            result.initialiser = this.parseExpression();
        }
        return result;
    };
    /**
     * 解析一个绑定名称(xx、[xx]、{xx})。
     */
    Parser.prototype.parseBindingIdentifierOrPattern = function () {
        switch (this.lexer.peek().type) {
            case tokenType_1.TokenType.identifier:
                return this.parseIdentifier();
            case tokenType_1.TokenType.openBracket:
                return this.parseArrayBindingPattern();
            case tokenType_1.TokenType.openBrace:
                return this.parseObjectBindingPattern();
            default:
                return this.parseIdentifier();
        }
    };
    /**
     * 解析一个空语句(;)。
     */
    Parser.prototype.parseEmptyStatement = function () {
        //  EmptyStatement:
        //      ;
        console.assert(this.lexer.current.type === tokenType_1.TokenType.semicolon);
        var result = new nodes.EmptyStatement();
        result.start = this.lexer.read().start;
        return result;
    };
    /**
     * 解析一个标签语句(xx: ...)。
     * @param label 已解析的标签部分。
     */
    Parser.prototype.parseLabeledStatement = function (label) {
        // LabeledStatement :
        //   Identifier : Statement
        console.assert(this.lexer.current.type === tokenType_1.TokenType.colon);
        var result = new nodes.LabeledStatement();
        result.label = label;
        result.colonStart = this.lexer.read().type;
        result.body = this.parseStatement();
        return result;
    };
    /**
     * 解析一个表达式语句(x();)。
     */
    Parser.prototype.parseExpressionStatement = function () {
        // ExpressionStatement[Yield] :
        //   Expression[In, Yield] ;
        console.assert(tokenType_1.isExpressionStart(this.lexer.current.type));
        var result = new nodes.ExpressionStatement();
        result.body = this.parseExpression();
        result.end = this.autoInsertSemicolon();
        return result;
    };
    /**
     * 解析一个 if 语句(if(xx) {...})。
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
        if (this.lexer.current.type === tokenType_1.TokenType.case) {
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
        console.assert(tokenType_1.isExpressionStart(this.lexer.peek().type));
        var parsed;
        var type = this.lexer.peek().type;
        switch (type) {
            // Identifier、Identifier<T>、Identifier[]
            case tokenType_1.TokenType.identifier:
                parsed = this.parseRestTypeExprssion(this.parseIdentifier());
                break;
            // (Expr)、(Expr) => {...}
            case tokenType_1.TokenType.openParen:
                parsed = this.parseParenthesizedExpressionOrArrowFunction();
                break;
            // new Expr
            case tokenType_1.TokenType.new:
                parsed = this.parseNewExpression();
                break;
            // ""、''
            case tokenType_1.TokenType.stringLiteral:
                parsed = this.parseStringLiteral();
                break;
            // 0
            case tokenType_1.TokenType.numericLiteral:
                parsed = this.parseNumericLiteral();
                break;
            // [Expr, ...]
            case tokenType_1.TokenType.openBracket:
                parsed = this.parseArrayLiteral();
                break;
            // {key: Expr, ...}
            case tokenType_1.TokenType.openBrace:
                parsed = this.parseObjectLiteral();
                break;
            // @ Identifier
            case tokenType_1.TokenType.at:
                parsed = this.parseAtExpression();
                break;
            case tokenType_1.TokenType.null:
                parsed = this.parseNullLiteral();
                break;
            case tokenType_1.TokenType.true:
                parsed = this.parseTrueLiteral();
                break;
            case tokenType_1.TokenType.false:
                parsed = this.parseFalseLiteral();
                break;
            case tokenType_1.TokenType.this:
                parsed = this.parseThisLiteral();
                break;
            case tokenType_1.TokenType.super:
                parsed = this.parseSuperLiteral();
                break;
            case tokenType_1.TokenType.plusPlus:
                parsed = this.parseIncrementExpression();
                break;
            case tokenType_1.TokenType.minusMinus:
                parsed = this.parseDecrementExpression();
                break;
            case tokenType_1.TokenType.equalsGreaterThan:
                parsed = this.parseArrowFunction();
                break;
            case tokenType_1.TokenType.await:
                parsed = this.parseAwaitExpression();
                break;
            default:
                // +Expr
                if (tokenType_1.isUnaryOperator(type)) {
                    parsed = this.parseUnaryExpression();
                    break;
                }
                switch (type) {
                    case tokenType_1.TokenType.closeParen:
                        this.error(this.lexer.read(), "多余的“)”。");
                        break;
                    case tokenType_1.TokenType.closeBracket:
                        this.error(this.lexer.read(), "多余的“]”。");
                        break;
                    case tokenType_1.TokenType.closeBrace:
                        this.error(this.lexer.read(), "多余的“}”。");
                        break;
                    default:
                        if (tokenType_1.isStatementStart(type)) {
                            this.error(this.lexer.peek(), "“{0}”是语句关键字；改用其它变量名?", tokenType_1.tokenToString(type));
                        }
                        else {
                            this.error(this.lexer.peek(), "无效的表达式项“{0}”", tokenType_1.tokenToString(type));
                        }
                        do {
                            this.lexer.read();
                        } while (this.lexer.peek().type != tokenType_1.TokenType.endOfFile && !this.lexer.peek().onNewLine);
                        break;
                }
                return nodes.Expression.null;
        }
        return this.parseRestExpression(parsed, minPrecedence);
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
    Parser.prototype.parseParenthesizedExpressionOrArrowFunction = function () {
        console.assert(this.lexer.peek().type == tokenType_1.TokenType.openParen);
        if (this.isArrowFunction()) { }
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
    };
    Parser.prototype.parseNewExpression = function () {
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
    };
    Parser.prototype.parseExpression = function () {
        var result = this.parseAssignmentExpressionOrHigher();
        while (this.readToken(tokenType_1.TokenType.comma)) {
            result = this.makeBinaryExpression(result, tokenType_1.TokenType.comma, this.lexer.tokenStart - 1, this.parseAssignmentExpressionOrHigher());
        }
        return result;
    };
    /**
     * 解析一个一元运算表达式(+x)。
     */
    Parser.prototype.parseUnaryExpression = function (node) {
        node.operand.accept(this);
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
    var result_1;
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
            result_1 = createJSDocComment();
        });
    }
    return result_1;
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
                    var name_1 = jsDocTypeReference.name;
                    if (name_1.text === "Object") {
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
            var name_2 = parseJSDocIdentifierName();
            if (!name_2) {
                parseErrorAtPosition(scanner.getStartPos(), 0, Diagnostics.Identifier_expected);
                return undefined;
            }
            var typeParameter = createNode(tokenType_1.TokenType.TypeParameter, name_2.pos);
            typeParameter.name = name_2;
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
        var result_2 = Parser.parseSourceFile(sourceFile.fileName, newText, sourceFile.languageVersion, syntaxCursor, /*setParentNodes*/ true, sourceFile.scriptKind);
        return result_2;
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