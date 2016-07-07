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
        this.error(this.lexer.peek(), token === tokenType_1.TokenType.identifier ? isKeyword(this.lexer.peek().type) ? "应输入标识符；“{0}”是关键字。" : "应输入标识符。" : "应输入“{0}”。", tokenType_1.tokenToString(token));
    };
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
    /**
     * 解析一个源文件。
     */
    Parser.prototype.parseSourceFile = function () {
    };
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
                    this.parseRestExpressionStatement(identifier);
            case tokenType_1.TokenType.openBrace:
                return this.parseBlockStatement();
            case tokenType_1.TokenType.var:
            case tokenType_1.TokenType.let:
            case tokenType_1.TokenType.const:
                return this.parseVariableStatement();
            case tokenType_1.TokenType.function:
                return this.parseFunctionDeclaration();
            case tokenType_1.TokenType.class:
                return this.parseClassDeclaration();
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
            case tokenType_1.TokenType.at:
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
                if (this.isDeclaration()) {
                    return this.parseDeclaration();
                }
                break;
        }
        return this.parseExpressionStatement();
    };
    /**
     * 解析一个语句列表(...; ...)。
     */
    Parser.prototype.parseStatementList = function (end) {
        var result = new nodes.NodeList();
        while (true) {
            switch (this.lexer.peek().type) {
                case end:
                    return result;
                case tokenType_1.TokenType.endOfFile:
                    if (end != undefined) {
                        this.expectToken(end);
                    }
                    return result;
            }
            result.push(this.parseStatement());
        }
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
        return result;
    };
    /**
     * 解析一个变量声明语句(var xx、let xx、const xx)。
     */
    Parser.prototype.parseVariableStatement = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.var || this.lexer.peek().type === tokenType_1.TokenType.let || this.lexer.peek().type === tokenType_1.TokenType.const);
        var result = new nodes.VariableStatement();
        result.start = this.lexer.read().start; // var、let、const
        result.type = this.lexer.current.type;
        result.variables = this.parseVariableDeclarationList();
        result.end = this.autoInsertSemicolon();
        return result;
    };
    /**
     * 解析一个变量声明列表(xx = 1, ...)。
     */
    Parser.prototype.parseVariableDeclarationList = function () {
        var result = new nodes.NodeList();
        do {
            result.push(this.parseVariableDeclaration());
        } while (this.readToken(tokenType_1.TokenType.comma));
        return result;
    };
    /**
     * 解析一个变量声明(x = 1、[x] = [1]、{a: x} = {a: 1})。
     */
    Parser.prototype.parseVariableDeclaration = function () {
        var result = new nodes.VariableDeclaration();
        result.name = this.parseBindingName();
        if (this.lexer.peek().type === tokenType_1.TokenType.colon) {
            result.colon = this.lexer.read().start;
            result.type = this.parseTypeExpression();
        }
        if (this.lexer.peek().type === tokenType_1.TokenType.equals) {
            result.equal = this.lexer.read().start;
            result.initialiser = this.parseExpressionWith(ParseFlags.disallowComma);
        }
        return result;
    };
    /**
     * 解析一个绑定名称(xx, [xx], {x:x})。
     */
    Parser.prototype.parseBindingName = function () {
        switch (this.lexer.peek().type) {
            case tokenType_1.TokenType.identifier:
                return this.parseIdentifier();
            case tokenType_1.TokenType.openBracket:
            //    return this.parseArrayBindingPattern();
            // todo
            case tokenType_1.TokenType.openBrace:
            //  return this.parseObjectBindingPattern();
            // todo
            default:
                this.expectToken(tokenType_1.TokenType.identifier);
                return nodes.Expression.error;
        }
    };
    /**
     * 解析一个空语句(;)。
     */
    Parser.prototype.parseEmptyStatement = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.semicolon);
        var result = new nodes.EmptyStatement();
        result.start = this.lexer.read().start;
        return result;
    };
    /**
     * 解析一个标签语句(xx: ...)。
     * @param label 已解析的标签部分。
     */
    Parser.prototype.parseLabeledStatement = function (label) {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.colon);
        var result = new nodes.LabeledStatement();
        result.label = label;
        result.colon = this.lexer.read().type;
        result.body = this.parseStatement();
        return result;
    };
    /**
     * 解析一个表达式语句(x();)。
     */
    Parser.prototype.parseExpressionStatement = function () {
        console.assert(tokenType_1.isExpressionStart(this.lexer.peek().type));
        var result = new nodes.ExpressionStatement();
        result.body = this.parseExpression();
        result.end = this.autoInsertSemicolon();
        return result;
    };
    /**
     * 解析一个表达式语句(x();)。
     * @param parsed 已解析的表达式。
     */
    Parser.prototype.parseRestExpressionStatement = function (parsed) {
        console.assert(tokenType_1.isExpressionStart(this.lexer.peek().type));
        var result = new nodes.ExpressionStatement();
        result.body = this.parseRestExpression(parsed);
        result.end = this.autoInsertSemicolon();
        return result;
    };
    /**
     * 解析一个 if 语句(if(xx) ...)。
     */
    Parser.prototype.parseIfStatement = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.if);
        var result = new nodes.IfStatement();
        result.start = this.lexer.read().start;
        this.parseCondition(result);
        result.then = this.parseEmbeddedStatement();
        if (this.readToken(tokenType_1.TokenType.else)) {
            result.else = this.parseEmbeddedStatement();
        }
        return result;
    };
    /**
     * 解析条件表达式。
     */
    Parser.prototype.parseCondition = function (result) {
        if (this.lexer.peek().type === tokenType_1.TokenType.openParen) {
            result.openParan = this.lexer.read().type;
            result.condition = this.parseExpression();
            result.closeParan = this.expectToken(tokenType_1.TokenType.closeParen);
        }
        else {
            if (compiler_1.options.autoInsertParenthese === false) {
                this.error(this.lexer.peek(), "应输入“(”");
            }
            result.condition = this.parseExpression();
        }
    };
    /**
     * 解析内嵌语句。
     */
    Parser.prototype.parseEmbeddedStatement = function () {
        var result = this.parseStatement();
        // todo
        //if (result == null) {
        //    Compiler.error(ErrorCode.expectedStatement, "语法错误：应输入语句", this.lexer.peek());
        //} else if (result is VariableStatement) {
        //    Compiler.error(ErrorCode.invalidVariableStatement, "嵌套语句不能是变量声明语句；应使用“{}”包围", ((VariableStatement)result).type);
        //} else if (result is LabeledStatement) {
        //    Compiler.error(ErrorCode.invalidLabeledStatement, "嵌套语句不能是标签语句；应使用“{}”包围", ((LabeledStatement)result).label);
        //}
        //if (result is Semicolon && this.lexer.peek().type == TokenType.lBrace) {
        //    Compiler.warning(ErrorCode.confusedSemicolon, "此分号可能是多余的", this.lexer.current.start, this.lexer.current.endLocation);
        //}
        return result;
    };
    /**
     * 解析一个 switch 语句(switch(xx){...})。
     */
    Parser.prototype.parseSwitchStatement = function () {
        console.assert(this.lexer.peek().type == tokenType_1.TokenType.switch);
        var result = new nodes.SwitchStatement();
        result.start = this.lexer.read().start;
        if (this.lexer.peek().type !== tokenType_1.TokenType.openBrace) {
            this.parseCondition(result);
        }
        result.cases = new nodes.NodeList();
        result.cases.start = this.expectToken(tokenType_1.TokenType.openBrace);
        while (true) {
            var start = this.lexer.peek().start;
            var label = void 0;
            switch (this.lexer.peek().start) {
                case tokenType_1.TokenType.case:
                    if (compiler_1.options.allowCaseElse === false || !this.readToken(tokenType_1.TokenType.else)) {
                        label = this.parseExpression();
                    }
                    break;
                case tokenType_1.TokenType.default:
                    break;
                default:
                    result.cases.end = this.expectToken(tokenType_1.TokenType.closeBrace);
                    return result;
            }
            var caseCaluse = new nodes.CaseClause();
            caseCaluse.start = start;
            caseCaluse.label = label;
            caseCaluse.colon = this.expectToken(tokenType_1.TokenType.colon);
            caseCaluse.statements = new nodes.NodeList();
            while (this.lexer.peek().type !== tokenType_1.TokenType.closeBrace &&
                this.lexer.peek().type !== tokenType_1.TokenType.case &&
                this.lexer.peek().type !== tokenType_1.TokenType.default) {
                caseCaluse.statements.push(this.parseStatement());
            }
            result.cases.push(caseCaluse);
        }
    };
    /**
     * 解析一个 for 语句(for(var i = 0; i < 9; i++) ...)。
     */
    Parser.prototype.parseForStatement = function () {
        console.assert(this.lexer.peek().type == tokenType_1.TokenType.for);
        var start = this.lexer.read().start;
        var hasParan = this.readToken(tokenType_1.TokenType.openParen);
        if (compiler_1.options.autoInsertParenthese === false && !hasParan) {
            this.error(this.lexer.peek(), "应输入“(”");
        }
        var result;
        if (this.isVariableStatement()) {
            var variableStatement = this.parseVariableStatement();
            switch (this.lexer.peek().type) {
                case tokenType_1.TokenType.semicolon:
                    result = this.parseForStatementHeader(variableStatement);
                    break;
                case tokenType_1.TokenType.in:
                    result = this.parseForInStatementHeader(variableStatement);
                    break;
                case tokenType_1.TokenType.of:
                    result = compiler_1.options.allowForOf !== false ? this.parseForOfStatementHeader(variableStatement) : this.parseForStatementHeader(variableStatement);
                    break;
                case tokenType_1.TokenType.to:
                    result = compiler_1.options.allowForTo !== false ? this.parseForToStatementHeader(variableStatement) : this.parseForStatementHeader(variableStatement);
                    break;
                default:
                    result = this.parseForStatementHeader(variableStatement);
                    break;
            }
        }
        else {
            result = this.parseForStatementHeader();
        }
        if (hasParan)
            this.expectToken(tokenType_1.TokenType.closeParen);
        result.start = start;
        result.body = this.parseEmbeddedStatement();
        return result;
    };
    /**
     * 判断是否紧跟一个变量定义语句。
     */
    Parser.prototype.isVariableStatement = function () {
        switch (this.lexer.peek().type) {
            case tokenType_1.TokenType.var:
                return true;
            case tokenType_1.TokenType.let:
            case tokenType_1.TokenType.const:
                this.lexer.stashSave();
                this.lexer.read();
                var result = this.isBindingName();
                this.lexer.stashRestore();
                return result;
            default:
                return false;
        }
    };
    /**
     * 判断下一个字符是否可作为变量名。
     */
    Parser.prototype.isBindingName = function () {
        switch (this.lexer.peek().type) {
            case tokenType_1.TokenType.identifier:
            case tokenType_1.TokenType.openBracket:
            case tokenType_1.TokenType.openBrace:
                return true;
            default:
                return false;
        }
    };
    /**
     * 解析一个 for 语句(for(var i = 0; i < 9; i++) ...)的语句头。
     * @param initializer 已解析的变量定义部分。
     */
    Parser.prototype.parseForStatementHeader = function (initializer) {
        var result = new nodes.ForStatement();
        if (initializer) {
            result.initializer = initializer;
        }
        else if (tokenType_1.isExpressionStart(this.lexer.peek().type)) {
            result.initializer = this.parseExpression();
        }
        result.firstSemicolon = this.expectToken(tokenType_1.TokenType.semicolon);
        if (tokenType_1.isExpressionStart(this.lexer.peek().type)) {
            result.condition = this.parseExpression();
        }
        result.secondSemicolon = this.expectToken(tokenType_1.TokenType.semicolon);
        if (tokenType_1.isExpressionStart(this.lexer.peek().type)) {
            result.iterator = this.parseExpression();
        }
        return result;
    };
    /**
     * 解析一个 for..in 语句(for(var x in y) ...)的语句头。
     * @param initializer 已解析的变量定义部分。
     */
    Parser.prototype.parseForInStatementHeader = function (initializer) {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.in);
        var result = new nodes.ForInStatement();
        result.initializer = initializer;
        result.in = this.lexer.read().start;
        // "“for in”语句中最多只能有一个变量"
        // todo
        result.condition = this.parseExpression();
        return result;
    };
    /**
     * 解析一个 for..of 语句(for(var x of y) ...)的语句头。
     * @param initializer 已解析的变量定义部分。
     */
    Parser.prototype.parseForOfStatementHeader = function (initializer) {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.of);
        var result = new nodes.ForOfStatement();
        result.initializer = initializer;
        // "“for of”语句中变量不允许有初始值"
        // todo
        result.of = this.lexer.read().start;
        result.condition = this.parseExpression();
        return result;
    };
    /**
     * 解析一个 for..to 语句(for(var x = 0 to 10) ...)的语句头。
     * @param initializer 已解析的变量定义部分。
     */
    Parser.prototype.parseForToStatementHeader = function (initializer) {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.to);
        var result = new nodes.ForToStatement();
        result.initializer = initializer;
        result.to = this.lexer.read().start;
        // "“for to”语句中变量不允许有初始值"
        // todo
        result.condition = this.parseExpression();
        return result;
    };
    /**
     * 解析一个 while 语句(while(...) ...)。
     */
    Parser.prototype.parseWhileStatement = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.while);
        var result = new nodes.WhileStatement();
        result.start = this.lexer.read().start;
        this.parseCondition(result);
        result.body = this.parseEmbeddedStatement();
        return result;
    };
    /**
     * 解析一个 do..while 语句(do ... while(xx);)。
     */
    Parser.prototype.parseDoWhileStatement = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.do);
        var result = new nodes.DoWhileStatement();
        result.start = this.lexer.read().type;
        result.body = this.parseEmbeddedStatement();
        result.while = this.expectToken(tokenType_1.TokenType.while);
        this.parseCondition(result);
        result.end = this.autoInsertSemicolon();
        return result;
    };
    /**
     * 解析一个 continue 语句(continue xx;)。
     */
    Parser.prototype.parseContinueStatement = function () {
        console.assert(this.lexer.peek().type == tokenType_1.TokenType.continue);
        var result = new nodes.ContinueStatement();
        result.start = this.lexer.read().start;
        result.end = this.autoInsertSemicolon();
        return result;
    };
    /**
     * 解析一个 break 语句(break xx;)。
     */
    Parser.prototype.parseBreakStatement = function () {
        console.assert(this.lexer.peek().type == tokenType_1.TokenType.break);
        var result = new nodes.BreakStatement();
        result.start = this.lexer.read().start;
        result.end = this.autoInsertSemicolon();
        return result;
    };
    /**
     * 解析一个 return 语句(return xx;)。
     */
    Parser.prototype.parseReturnStatement = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.return);
        var result = new nodes.ReturnStatement();
        result.start = this.lexer.read().start;
        if ((compiler_1.options.smartSemicolonInsertion !== false || !this.lexer.peek().onNewLine) &&
            tokenType_1.isExpressionStart(this.lexer.peek().type)) {
            result.value = this.parseExpression();
        }
        result.end = this.autoInsertSemicolon();
        return result;
    };
    /**
     * 解析一个 throw 语句(throw xx;)。
     */
    Parser.prototype.parseThrowStatement = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.throw);
        var result = new nodes.ThrowStatement();
        result.start = this.lexer.read().start;
        if (tokenType_1.isExpressionStart(this.lexer.peek().type)) {
            if ((compiler_1.options.smartSemicolonInsertion !== false || !this.lexer.peek().onNewLine)) {
                result.value = this.parseExpression();
            }
        }
        else if (compiler_1.options.allowRethrow === false) {
            this.error(this.lexer.peek(), "应输入表达式。");
        }
        result.end = this.autoInsertSemicolon();
        return result;
    };
    /**
     * 解析一个 try 语句(try {...} catch(e) {...})。
     */
    Parser.prototype.parseTryStatement = function () {
        console.assert(this.lexer.peek().type == tokenType_1.TokenType.try);
        var result = new nodes.TryStatement();
        result.start = this.lexer.read().start;
        result.try = this.parseTryClauseBody();
        if (this.lexer.peek().type === tokenType_1.TokenType.catch) {
            result.catch = new nodes.CatchClause();
            result.catch.start = this.lexer.read().start;
            if (this.lexer.peek().type === tokenType_1.TokenType.openParen) {
                result.catch.openParan = this.lexer.read().start;
                result.catch.variable = this.parseBindingName();
                result.catch.openParan = this.expectToken(tokenType_1.TokenType.closeParen);
            }
            else if (compiler_1.options.autoInsertParenthese !== false && this.isBindingName()) {
                result.catch.variable = this.parseBindingName();
            }
            else if (compiler_1.options.allowTryStatementCatchMissingVaribale !== false) {
                this.expectToken(tokenType_1.TokenType.openParen);
            }
            result.catch.body = this.parseTryClauseBody();
        }
        if (this.lexer.peek().type === tokenType_1.TokenType.finally) {
            result.finally = new nodes.FinallyClause();
            result.finally.start = this.lexer.read().start;
            result.finally.body = this.parseTryClauseBody();
        }
        result.end = this.autoInsertSemicolon();
        return result;
    };
    /**
     * 解析一个 try 语句的语句块。
     */
    Parser.prototype.parseTryClauseBody = function () {
        if (compiler_1.options.autoInsertTryStatementBlock !== false) {
            return this.parseEmbeddedStatement();
        }
        if (this.lexer.peek().type === tokenType_1.TokenType.openBrace) {
            return this.parseBlockStatement();
        }
        this.expectToken(tokenType_1.TokenType.openBrace);
        var result = new nodes.ExpressionStatement();
        result.body = nodes.Expression.error;
        return result;
    };
    /**
     * 解析一个 debugger 语句(debugger;)。
     */
    Parser.prototype.parseDebuggerStatement = function () {
        console.assert(this.lexer.peek().type == tokenType_1.TokenType.debugger);
        var result = new nodes.DebuggerStatement();
        result.start = this.lexer.read().start;
        result.end = this.autoInsertSemicolon();
        return result;
    };
    /**
     * 解析一个 with 语句(with(...) ...)。
     */
    Parser.prototype.parseWithStatement = function () {
        console.assert(this.lexer.peek().type == tokenType_1.TokenType.debugger);
        var result = new nodes.WithStatement();
        result.start = this.lexer.read().start;
        var hasParan = this.readToken(tokenType_1.TokenType.openParen);
        if (compiler_1.options.autoInsertParenthese === false && !hasParan) {
            this.error(this.lexer.peek(), "应输入“(”");
        }
        result.value = compiler_1.options.allowWithVaribale !== false && this.isVariableStatement() ?
            this.parseVariableStatement() :
            this.parseExpression();
        if (hasParan)
            this.expectToken(tokenType_1.TokenType.closeParen);
        result.end = this.autoInsertSemicolon();
        return result;
    };
    // #endregion
    // #region 表达式
    Parser.prototype.parseExpression = function () {
        //    case TokenType.endOfFile:
        //this.error(this.lexer.peek(), "应输入语句。");
        //return nodes.Statement.error;
    };
    Parser.prototype.parseExpressionWith = function (flags) {
        var savedFlags = this.flags;
        this.flags |= flags;
        var result = this.parseExpression();
        this.flags = savedFlags;
        return result;
    };
    /**
     * 解析一个标识符(x)。
     */
    Parser.prototype.parseIdentifier = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.identifier);
        var result = new nodes.Identifier();
        result.start = this.lexer.read().start;
        result.value = this.lexer.current.data;
        result.end = this.lexer.read().end;
        return result;
    };
    /**
     * 解析一个简单字面量(this、super、null、true、false)。
     */
    Parser.prototype.parseSimpleLiteral = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.this ||
            this.lexer.peek().type === tokenType_1.TokenType.super ||
            this.lexer.peek().type === tokenType_1.TokenType.null ||
            this.lexer.peek().type === tokenType_1.TokenType.true ||
            this.lexer.peek().type === tokenType_1.TokenType.false);
        var result = new nodes.SimpleLiteral();
        result.start = this.lexer.read().start;
        result.type = this.lexer.current.type;
        result.end = this.lexer.read().end;
        return result;
    };
    /**
     * 解析一个数字字面量(1)。
     */
    Parser.prototype.parseNumericLiteral = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.numericLiteral);
        var result = new nodes.NumericLiteral();
        result.start = this.lexer.read().start;
        result.value = this.lexer.current.data;
        result.end = this.lexer.read().end;
        return result;
    };
    /**
     * 解析一个字符串字面量('abc'、"abc"、`abc`)。
     */
    Parser.prototype.parseStringLiteral = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.stringLiteral);
        var result = new nodes.StringLiteral();
        result.start = this.lexer.read().start;
        result.value = this.lexer.current.data;
        result.end = this.lexer.read().end;
        return result;
    };
    /**
     * 解析一个模板字面量(`abc${x + y}def`)。
     */
    Parser.prototype.parseTemplateLiteral = function () {
    };
    /**
     * 解析一个正则表达式字面量(/abc/)。
     */
    Parser.prototype.parseRegularExpressionLiteral = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.regularExpressionLiteral);
        var result = new nodes.RegularExpressionLiteral();
        result.start = this.lexer.read().start;
        result.value = this.lexer.current.data.pattern;
        result.flags = this.lexer.current.data.flags;
        result.end = this.lexer.read().end;
        return result;
    };
    /**
     * 解析一个数组字面量([x, y])。
     */
    Parser.prototype.parseArrayLiteral = function () {
    };
    /**
     * 解析一个对象字面量({x: y})。
     */
    Parser.prototype.parseObjectLiteral = function () {
    };
    /**
     * 解析一个函数表达式(function () {})。
     */
    Parser.prototype.parseFunctionExpression = function () {
    };
    /**
     * 解析一个箭头函数表达式(x => y)。
     */
    Parser.prototype.parseArrowFunctionExpression = function () {
    };
    /**
     * 解析一个类表达式(class xx {})。
     */
    Parser.prototype.parseClassExpression = function () {
    };
    /**
     * 解析一个接口表达式(interface xx {})。
     */
    Parser.prototype.parseInterfaceExpression = function () {
    };
    /**
     * 解析一个枚举表达式(enum xx {})。
     */
    Parser.prototype.parseEnumExpression = function () {
    };
    /**
     * 解析一个括号表达式((x))。
     */
    Parser.prototype.parseParenthesizedExpression = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.openParen);
        var result = new nodes.ParenthesizedExpression();
        result.start = this.lexer.read().start;
        result.body = this.parseExpression();
        result.end = this.expectToken(tokenType_1.TokenType.closeParen);
        return result;
    };
    /**
     * 解析一个成员调用表达式(x.y)。
     */
    Parser.prototype.parseMemberCallExpression = function () {
    };
    /**
     * 解析一个函数调用表达式(x())。
     */
    Parser.prototype.parseFunctionCallExpression = function () {
    };
    /**
     * 解析一个索引调用表达式(x[y])。
     */
    Parser.prototype.parseIndexCallExpression = function () {
    };
    /**
     * 解析一个模板调用表达式(x`abc`)。
     */
    Parser.prototype.parseTemplateCallExpression = function () {
    };
    /**
     * 解析一个 new 表达式(new x())。
     */
    Parser.prototype.parseNewExpression = function () {
    };
    /**
     * 解析一个 new.target 表达式(new.target)。
     */
    Parser.prototype.parseNewTargetExpression = function () {
    };
    /**
     * 解析一个一元运算表达式(+x、typeof x、...)。
     */
    Parser.prototype.parseUnaryExpression = function () {
    };
    /**
     * 解析一个二元运算表达式(x + y、x = y、...)。
     */
    Parser.prototype.parseBinaryExpression = function () {
    };
    /**
     * 解析一个 yield 表达式(yield x、yield * x)。
     */
    Parser.prototype.parseYieldExpression = function () {
    };
    /**
     * 解析一个条件表达式(x ? y : z)。
     */
    Parser.prototype.parseConditionalExpression = function () {
    };
    /**
     * 解析一个类型转换表达式(<T>xx)。
     */
    Parser.prototype.parseTypeCastExpression = function () {
    };
    /**
     * 解析一个泛型表达式(Array<T>)。
     */
    Parser.prototype.parseGenericTypeExpression = function () {
    };
    /**
     * 解析一个数组类型表达式(T[])。
     */
    Parser.prototype.parseArrayTypeExpression = function () {
    };
    // #endregion
    // #region 成员声明
    /**
     * 解析一个修饰器(@xx)。
     */
    Parser.prototype.parseDecorator = function () {
    };
    /**
     * 解析一个修饰符(static、private、...)。
     */
    Parser.prototype.parseModifier = function () {
    };
    /**
     * 解析一个函数声明(function fn() {...}、function * fn(){...})。
     */
    Parser.prototype.parseFunctionDeclaration = function () {
    };
    /**
     * 解析一个泛型参数声明。
     */
    Parser.prototype.parseGenericParameterDeclaration = function () {
    };
    /**
     * 解析一个参数声明(x、x = 1、...x)。
     */
    Parser.prototype.parseParameterDeclaration = function () {
    };
    /**
     * 解析一个类声明(class T {...})。
     */
    Parser.prototype.parseClassDeclaration = function () {
    };
    /**
     * 解析一个属性声明(x: 1)。
     */
    Parser.prototype.parsePropertyDeclaration = function () {
    };
    /**
     * 解析一个方法声明(fn() {...})。
     */
    Parser.prototype.parseMethodDeclaration = function () {
    };
    /**
     * 解析一个解析器声明(get fn() {...}、set fn() {...})。
     */
    Parser.prototype.parseAccessorDeclaration = function () {
    };
    /**
     * 解析一个接口声明(interface T {...})。
     */
    Parser.prototype.parseInterfaceDeclaration = function () {
    };
    /**
     * 解析一个枚举声明(enum T {})。
     */
    Parser.prototype.parseEnumDeclaration = function () {
    };
    /**
     * 解析一个枚举成员声明(xx = 1)。
     */
    Parser.prototype.parseEnumMemberDeclaration = function () {
    };
    /**
     * 解析一个命名空间声明(namespace abc {...}、module abc {...})。
     */
    Parser.prototype.parseNamespaceDeclaration = function () {
    };
    // #endregion
    // #region 导入和导出
    /**
     * 解析一个 import 指令(import xx from '...';)。
     */
    Parser.prototype.parseImportDirective = function () {
    };
    /**
     * 解析一个 import = 指令(import xx = require("");)。
     */
    Parser.prototype.parseImportEqualsDirective = function () {
    };
    /**
     * 解析一个名字导入声明项(a as b)。
     */
    Parser.prototype.parseNameImportClause = function () {
    };
    /**
     * 解析一个命名空间导入声明项({a as b})。
     */
    Parser.prototype.parseNamespaceImportClause = function () {
    };
    /**
     * 解析一个 export 指令(export xx from '...';)。
     */
    Parser.prototype.parseExportDirective = function () {
    };
    /**
     * 解析一个 export = 指令(export = 1;)。
     */
    Parser.prototype.parseExportEqualsDirective = function () {
    };
    // #endregion
    // #region Jsx 节点
    /**
     * 解析一个 JSX 标签(<div>...</div>)。
     */
    Parser.prototype.parseJsxElement = function () {
    };
    /**
     * 解析一个 JSX 标签属性(id="a")。
     */
    Parser.prototype.parseJsxAttribute = function () {
    };
    /**
     * 解析一个 JSX 文本({...})。
     */
    Parser.prototype.parseJsxText = function () {
    };
    /**
     * 解析一个 JSX 表达式({...})。
     */
    Parser.prototype.parseJsxExpression = function () {
    };
    /**
     * 解析一个 JSX 关闭元素({...})。
     */
    Parser.prototype.parseJsxClosingElement = function () {
    };
    // #endregion
    // #region 绑定名称
    /**
     * 解析一个数组绑定模式项(xx, ..)
     */
    Parser.prototype.parseArrayBindingElement = function () {
    };
    /**
     * 解析一个对象绑定模式项(xx: y)
     */
    Parser.prototype.parseObjectBindingElement = function () {
    };
    /**
     * 解析一个已计算的属性名。
     */
    Parser.prototype.parseComputedPropertyName = function () {
    };
    // #endregion
    // #region 注释
    /**
     * 解析一个 JS 注释。
     */
    Parser.prototype.parseComment = function () {
    };
    /**
     * 解析一个 JS 文档注释。
     */
    Parser.prototype.parseJsDocComment = function () {
    };
    return Parser;
}());
exports.Parser = Parser;
var ParseFlags;
(function (ParseFlags) {
    ParseFlags[ParseFlags["disallowComma"] = 0] = "disallowComma";
    ParseFlags[ParseFlags["disallowIn"] = 1] = "disallowIn";
    ParseFlags[ParseFlags["allowYield"] = 2] = "allowYield";
    ParseFlags[ParseFlags["allowAwait"] = 3] = "allowAwait";
})(ParseFlags || (ParseFlags = {}));
//# sourceMappingURL=parser.js.map