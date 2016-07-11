/**
 * @fileOverview 语法解析器
 */
var compiler_1 = require('../compiler/compiler');
var tokenType_1 = require('./tokenType');
var Tokens = require('./tokenType');
var Nodes = require('./nodes');
var lexer_1 = require('./lexer');
/**
 * 表示一个语法解析器。c
 * @description 语法解析器可以将源码解析一个语法树。
 */
var Parser = (function () {
    function Parser() {
        // #region 接口
        /**
         * 获取或设置当前语法解析器使用的词法解析器。
         */
        this.lexer = new lexer_1.Lexer();
        // #region 未整理
        this.disallowInAndDecoratorContext = NodeFlags.DisallowInContext | NodeFlags.DecoratorContext;
        // Nodes.Whether or not we've had a parse error since creating the last Nodes.AST result.  Nodes.If we have
        // encountered an error, it will be stored on the next Nodes.AST result we create.  Nodes.Parse errors
        // can be broken down into three categories:
        //
        // 1) Nodes.An error that occurred during scanning.  Nodes.For example, an unterminated literal, or a
        //    character that was completely not understood.
        //
        // 2) A this.lexer.peek().type was expected, but was not present.  Nodes.This type of error is commonly produced
        //    by the 'this.parseExpected' function.
        //
        // 3) A this.lexer.peek().type was present that no parsing function was able to consume.  Nodes.This type of error
        //    only occurs in the 'this.abortParsingListOrMoveToNextToken' function when the parser
        //    decides to skip the this.lexer.peek().type.
        //
        // Nodes.In all of these cases, we want to mark the next result as having had an error before it.
        // Nodes.With this mark, we can know in incremental settings if this result can be reused, or if
        // we have to reparse it.  Nodes.If we don't keep this information around, we may just reuse the
        // result.  in that event we would then not produce the same errors as we did before, causing
        // significant confusion problems.
        //
        // Nodes.Note: it is necessary that this value be saved/restored during speculative/lookahead
        // parsing.  Nodes.During lookahead parsing, we will often create a result.  Nodes.That result will have
        // this value attached, and then this value will be set back to 'false'.  Nodes.If we decide to
        // rewind, we must get back to the same value we had prior to the lookahead.
        //
        // Nodes.Note: any errors at the end of the file that do not precede a regular result, should get
        // attached to the Nodes.EOF this.lexer.peek().type.
        this.parseErrorBeforeNextFinishedNode = false;
    }
    /**
     * 解析指定的源文件。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param fileName 解析的源码位置。
     */
    Parser.prototype.parse = function (text, start, fileName) {
        return this.parseSourceFile(text || "", start || 0, fileName || "");
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
        delete this.lexer.comment;
        this.lexer.setSource(text, start, fileName);
        return this.parseTypeExpression();
    };
    // #endregion
    // #region 底层
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
        compiler_1.error.apply(void 0, [compiler_1.ErrorType.syntaxError, this.lexer.fileName, range.start, range.end, message].concat(args));
    };
    /**
     * 读取下一个标记。如果下一个标记不是指定的类型则输出一条错误。
     * @param token 期待的标记。
     * @returns 返回读取的标记。
     */
    Parser.prototype.expectToken = function (token) {
        if (this.lexer.peek().type === token) {
            return this.lexer.read();
        }
        this.error(this.lexer.peek(), token === tokenType_1.TokenType.identifier ? Tokens.isKeyword(this.lexer.peek().type) ? "应输入标识符；“{0}”是关键字。" : "应输入标识符。" : "应输入“{0}”。", Tokens.tokenToString(token));
        return this.lexer.current;
    };
    /**
     * 读取一个分号，如果不存在则自动插入。
     * @return 返回分号或自动插入点的结束位置。
     */
    Parser.prototype.expectSemicolon = function () {
        switch (this.lexer.peek().type) {
            case tokenType_1.TokenType.semicolon:
                return this.lexer.read().end;
            case tokenType_1.TokenType.closeBrace:
            case tokenType_1.TokenType.endOfFile:
                return !compiler_1.options.disallowMissingSemicolon ?
                    this.expectToken(tokenType_1.TokenType.semicolon).end :
                    this.lexer.current.end;
            default:
                // 根据标准：只有出现换行时才允许自动插入分号。
                // 当启用 smartSemicolonInsertion 时，将允许在未换行时自动插入分号。
                return compiler_1.options.disallowMissingSemicolon || (compiler_1.options.smartSemicolonInsertion === false && !this.lexer.peek().hasLineBreakBeforeStart) ?
                    this.expectToken(tokenType_1.TokenType.semicolon).end :
                    this.lexer.current.end;
        }
    };
    /**
     * 读取一个标识符，如果是关键字则自动转换。
     * @return 返回标识符节点。
     */
    Parser.prototype.expectIdentifier = function () {
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
            case tokenType_1.TokenType.semicolon:
                return this.parseEmptyStatement();
            case tokenType_1.TokenType.openBrace:
                return this.parseBlockStatement(/*ignoreMissingOpenBrace*/ false);
            case tokenType_1.TokenType.var:
                return this.parseVariableStatement(this.lexer.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case tokenType_1.TokenType.let:
                if (this.isLetDeclaration()) {
                    return this.parseVariableStatement(this.lexer.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
                }
                break;
            case tokenType_1.TokenType.function:
                return this.parseFunctionDeclaration(this.lexer.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case tokenType_1.TokenType.class:
                return this.parseClassDeclaration(this.lexer.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case tokenType_1.TokenType.if:
                return this.parseIfStatement();
            case tokenType_1.TokenType.do:
                return this.parseDoStatement();
            case tokenType_1.TokenType.while:
                return this.parseWhileStatement();
            case tokenType_1.TokenType.for:
                return this.parseForStatement();
            case tokenType_1.TokenType.break:
                return this.parseBreakOrContinueStatement(tokenType_1.TokenType.BreakStatement);
            case tokenType_1.TokenType.continue:
                return this.parseBreakOrContinueStatement(tokenType_1.TokenType.ContinueStatement);
            case tokenType_1.TokenType.return:
                return this.parseReturnStatement();
            case tokenType_1.TokenType.with:
                return this.parseWithStatement();
            case tokenType_1.TokenType.switch:
                return this.parseSwitchStatement();
            case tokenType_1.TokenType.throw:
                return this.parseThrowStatement();
            case tokenType_1.TokenType.try:
            // Nodes.Include 'catch' and 'finally' for error recovery.
            case tokenType_1.TokenType.catch:
            case tokenType_1.TokenType.finally:
                return this.parseTryStatement();
            case tokenType_1.TokenType.debugger:
                return this.parseDebuggerStatement();
            case tokenType_1.TokenType.at:
                return this.parseDeclaration();
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
        return this.parseExpressionOrLabeledStatement();
    };
    /**
     * 解析一个语句块(`{...}`)。
     */
    Parser.prototype.parseBlockStatement = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.openBrace);
        var result = new Nodes.BlockStatement();
        result.statements = new Nodes.NodeList();
        result.statements.start = this.lexer.read().start;
        while (true) {
            switch (this.lexer.peek().type) {
                case tokenType_1.TokenType.closeBrace:
                    result.statements.end = this.lexer.read().end;
                    return result;
                case tokenType_1.TokenType.endOfFile:
                    result.statements.end = this.expectToken(tokenType_1.TokenType.closeBrace).end;
                    return result;
            }
            result.statements.push(this.parseStatement());
        }
    };
    /**
     * 解析一个变量声明语句(`var x`、`let x`、`const x`)。
     */
    Parser.prototype.parseVariableStatement = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.var || this.lexer.peek().type === tokenType_1.TokenType.let || this.lexer.peek().type === tokenType_1.TokenType.const);
        var result = new Nodes.VariableStatement();
        this.parseJsDocComment(result);
        result.start = this.lexer.read().start;
        result.type = this.lexer.current.type;
        result.variables = new Nodes.NodeList();
        result.variables.commaTokens = [];
        while (true) {
            result.variables.push(this.parseVariableDeclaration());
            if (this.lexer.peek().type === tokenType_1.TokenType.comma) {
                result.variables.commaTokens.push(this.lexer.read().start);
                continue;
            }
            break;
        }
        ;
        result.end = this.expectSemicolon();
        return result;
    };
    /**
     * 解析一个变量声明(`x = 1`、`[x] = [1]`、`{a: x} = {a: 1}`)。
     */
    Parser.prototype.parseVariableDeclaration = function () {
        var result = new Nodes.VariableDeclaration();
        result.name = this.parseBindingName();
        if (this.lexer.peek().type === tokenType_1.TokenType.colon) {
            result.colonToken = this.lexer.read().start;
            result.type = this.parseTypeNode();
        }
        if (this.lexer.peek().type === tokenType_1.TokenType.equals) {
            result.equalToken = this.lexer.read().start;
            result.initializer = this.parseExpressionWithoutComma();
        }
        else if (!this.lexer.peek().hasLineBreakBeforeStart && Tokens.isExpressionStart(this.lexer.peek().type)) {
            // var x 2：需要提示“缺少等号”。
            result.equalToken = this.expectToken(tokenType_1.TokenType.equals).start;
            result.initializer = this.parseExpressionWithoutComma();
        }
        return result;
    };
    /**
     * 解析一个空语句(`;`)。
     */
    Parser.prototype.parseEmptyStatement = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.semicolon);
        var result = new Nodes.EmptyStatement();
        result.start = this.lexer.read().start;
        return result;
    };
    /**
     * 解析一个标签语句(`xx: ...`)。
     * @param label 已解析的标签部分。
     */
    Parser.prototype.parseLabeledStatement = function (label) {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.colon);
        var result = new Nodes.LabeledStatement();
        this.parseJsDocComment(result);
        result.label = label;
        result.colonToken = this.lexer.read().type;
        result.body = this.parseStatement();
        return result;
    };
    /**
     * 解析一个表达式语句(`x();`)。
     */
    Parser.prototype.parseExpressionStatement = function () {
        console.assert(Tokens.isExpressionStart(this.lexer.peek().type));
        var result = new Nodes.ExpressionStatement();
        result.body = this.parseExpression();
        result.end = this.expectSemicolon();
        return result;
    };
    /**
     * 解析一个表达式语句(x(`);`)。
     * @param parsed 已解析的表达式。
     */
    Parser.prototype.parseExpressionStatementRest = function (parsed) {
        var result = new Nodes.ExpressionStatement();
        result.body = this.parseExpressionRest(parsed);
        result.end = this.expectSemicolon();
        return result;
    };
    /**
     * 解析一个 if 语句(`if(x) ...`)。
     */
    Parser.prototype.parseIfStatement = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.if);
        var result = new Nodes.IfStatement();
        result.start = this.lexer.read().start;
        this.parseCondition(result);
        result.then = this.parseEmbeddedStatement();
        if (this.lexer.peek().type === tokenType_1.TokenType.else) {
            result.elseToken = this.lexer.read().start;
            result.else = this.parseEmbeddedStatement();
        }
        return result;
    };
    /**
     * 解析内嵌语句。
     */
    Parser.prototype.parseEmbeddedStatement = function () {
        var result = this.parseStatement();
        switch (result.constructor) {
            case Nodes.VariableStatement:
                this.error(result, "嵌套语句不能是变量声明语句。");
                break;
            case Nodes.LabeledStatement:
                this.error(result, "嵌套语句不能是标签语句。");
                break;
        }
        return result;
    };
    /**
     * 解析条件表达式。
     * @param result 存放结果的语句。
     */
    Parser.prototype.parseCondition = function (result) {
        if (this.lexer.peek().type === tokenType_1.TokenType.openParen) {
            result.openParanToken = this.lexer.read().type;
            result.condition = this.parseExpression();
            result.closeParanToken = this.expectToken(tokenType_1.TokenType.closeParen).start;
        }
        else {
            if (!compiler_1.options.disallowMissingParenthese) {
                this.expectToken(tokenType_1.TokenType.openParen);
            }
            result.condition = this.parseExpression();
        }
    };
    /**
     * 解析一个 switch 语句(`switch(x) {...}`)。
     */
    Parser.prototype.parseSwitchStatement = function () {
        console.assert(this.lexer.peek().type == tokenType_1.TokenType.switch);
        var result = new Nodes.SwitchStatement();
        result.start = this.lexer.read().start;
        if (!compiler_1.options.disallowMissingSwitchCondition || this.lexer.peek().type !== tokenType_1.TokenType.openBrace) {
            this.parseCondition(result);
        }
        result.cases = new Nodes.NodeList();
        result.cases.start = this.expectToken(tokenType_1.TokenType.openBrace).start;
        while (true) {
            switch (this.lexer.peek().type) {
                case tokenType_1.TokenType.case:
                case tokenType_1.TokenType.default:
                    break;
                case tokenType_1.TokenType.closeBrace:
                    result.cases.end = this.lexer.read().start;
                    return result;
                default:
                    this.error(this.lexer.peek(), "应输入“case”或“default”。");
                    result.cases.end = this.lexer.current.end;
                    return result;
            }
            var caseCaluse = new Nodes.CaseClause();
            caseCaluse.start = this.lexer.read().start;
            if (this.lexer.current.type === tokenType_1.TokenType.case) {
                if (!compiler_1.options.disallowCaseElse && this.lexer.peek().type === tokenType_1.TokenType.else) {
                    caseCaluse.elseToken = this.lexer.read().start;
                }
                else {
                    caseCaluse.label = this.parseExpression();
                }
            }
            caseCaluse.colonToken = this.expectToken(tokenType_1.TokenType.colon).start;
            caseCaluse.statements = new Nodes.NodeList();
            while (this.lexer.peek().type !== tokenType_1.TokenType.closeBrace &&
                this.lexer.peek().type !== tokenType_1.TokenType.case &&
                this.lexer.peek().type !== tokenType_1.TokenType.default &&
                this.lexer.peek().type !== tokenType_1.TokenType.endOfFile) {
                caseCaluse.statements.push(this.parseStatement());
            }
            result.cases.push(caseCaluse);
        }
    };
    /**
     * 解析一个 for 语句(`for(var i = 0; i < 9; i++) ...`)。
     */
    Parser.prototype.parseForStatement = function () {
        console.assert(this.lexer.peek().type == tokenType_1.TokenType.for);
        var start = this.lexer.read().start;
        var openParan = this.lexer.peek().type === tokenType_1.TokenType.openParen ?
            this.lexer.read().start : undefined;
        if (openParan == undefined && !compiler_1.options.disallowMissingParenthese) {
            this.expectToken(tokenType_1.TokenType.openParen);
        }
        var disallowIn = this.disallowIn;
        this.disallowIn = true;
        var initializer = this.lexer.peek().type === tokenType_1.TokenType.semicolon ? undefined : this.isVariableStatement() ? this.parseVariableStatement() : this.parseExpression();
        this.disallowIn = disallowIn;
        var type = this.lexer.peek().type;
        switch (type) {
            case tokenType_1.TokenType.semicolon:
            case tokenType_1.TokenType.in:
                break;
            case tokenType_1.TokenType.of:
                if (!compiler_1.options.disallowForOf) {
                    type = tokenType_1.TokenType.semicolon;
                }
                break;
            case tokenType_1.TokenType.to:
                if (!compiler_1.options.disallowForTo) {
                    type = tokenType_1.TokenType.semicolon;
                }
                break;
            default:
                type = tokenType_1.TokenType.semicolon;
                break;
        }
        if (type !== tokenType_1.TokenType.semicolon) {
            switch (initializer.constructor) {
                case Nodes.VariableStatement:
                    if (compiler_1.options.disallowCompatibleForInAndForOf) {
                        var variables = initializer.variables;
                        if (type !== tokenType_1.TokenType.to && variables[0].initializer)
                            this.error(variables[0].initializer, type === tokenType_1.TokenType.in ? "在 for..in 语句变量不能有初始值。" : "在 for..of 语句变量不能有初始值。");
                        if (variables.length > 1) {
                            this.error(variables[1].name, type === tokenType_1.TokenType.in ? "在 for..in 语句中只能定义一个变量。" :
                                type === tokenType_1.TokenType.of ? "在 for..of 语句中只能定义一个变量。" :
                                    "在 for..to 语句中只能定义一个变量。");
                        }
                    }
                    break;
                case Nodes.Identifier:
                    break;
                default:
                    this.error(initializer, type === tokenType_1.TokenType.in ? "在 for..in 语句的左边只能是标识符。" :
                        type === tokenType_1.TokenType.of ? "在 for..of 语句的左边只能是标识符。" :
                            "在 for..to 语句的左边只能是标识符。");
                    break;
            }
        }
        var result;
        switch (type) {
            case tokenType_1.TokenType.semicolon:
                result = new Nodes.ForStatement();
                result.firstSemicolonToken = this.expectToken(tokenType_1.TokenType.semicolon).start;
                if (this.lexer.peek().type !== tokenType_1.TokenType.semicolon) {
                    result.condition = this.parseExpression();
                }
                result.secondSemicolonToken = this.expectToken(tokenType_1.TokenType.semicolon).start;
                if (openParan != undefined ? this.lexer.peek().type !== tokenType_1.TokenType.closeParen : Tokens.isExpressionStart(this.lexer.peek().type)) {
                    result.iterator = this.parseExpression();
                }
                break;
            case tokenType_1.TokenType.in:
                result = new Nodes.ForInStatement();
                result.inToken = this.lexer.read().start;
                result.condition = this.parseExpression();
                break;
            case tokenType_1.TokenType.of:
                result = new Nodes.ForOfStatement();
                result.ofToken = this.lexer.read().start;
                result.condition = compiler_1.options.disallowForOfCommaExpression ? this.parseAssignmentExpressionOrHigher() : this.parseExpression();
                break;
            case tokenType_1.TokenType.to:
                result = new Nodes.ForToStatement();
                result.toToken = this.lexer.read().start;
                result.condition = this.parseExpression();
                break;
        }
        result.start = start;
        if (initializer) {
            result.initializer = initializer;
        }
        if (openParan != undefined) {
            result.openParanToken = openParan;
            result.closeParanToken = this.expectToken(tokenType_1.TokenType.closeParen).start;
        }
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
     * 解析一个 while 语句(`while(x) ...`)。
     */
    Parser.prototype.parseWhileStatement = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.while);
        var result = new Nodes.WhileStatement();
        result.start = this.lexer.read().start;
        this.parseCondition(result);
        result.body = this.parseEmbeddedStatement();
        return result;
    };
    /**
     * 解析一个 do..while 语句(`do ... while(x);`)。
     */
    Parser.prototype.parseDoWhileStatement = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.do);
        var result = new Nodes.DoWhileStatement();
        result.start = this.lexer.read().type;
        result.body = this.parseEmbeddedStatement();
        result.whileToken = this.expectToken(tokenType_1.TokenType.while).start;
        this.parseCondition(result);
        result.end = this.expectSemicolon();
        return result;
    };
    /**
     * 解析一个 break 语句(`break xx;`)。
     */
    Parser.prototype.parseBreakStatement = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.break);
        var result = new Nodes.BreakStatement();
        result.start = this.lexer.read().start;
        if (this.lexer.peek().type === tokenType_1.TokenType.identifier) {
            result.label = this.parseIdentifier();
        }
        result.end = this.expectSemicolon();
        return result;
    };
    /**
     * 解析一个 continue 语句(`continue xx;`)。
     */
    Parser.prototype.parseContinueStatement = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.continue);
        var result = new Nodes.ContinueStatement();
        result.start = this.lexer.read().start;
        if (this.lexer.peek().type === tokenType_1.TokenType.identifier) {
            result.label = this.parseIdentifier();
        }
        result.end = this.expectSemicolon();
        return result;
    };
    Parser.prototype.parseBreakOrContinueStatement = function (kind) {
        var result = new Nodes.BreakOrContinueStatement();
        this.parseExpected(kind === tokenType_1.TokenType.BreakStatement ? tokenType_1.TokenType.break : tokenType_1.TokenType.continue);
        if (!this.canParseSemicolon()) {
            result.label = this.parseIdentifier();
        }
        this.expectSemicolon();
        return result;
    };
    // #endregion
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
        this.contextFlags = scriptKind === Nodes.ScriptKind.JS || scriptKind === Nodes.ScriptKind.JSX ? Nodes.NodeFlags.JavaScriptFile : Nodes.NodeFlags.None;
        this.parseErrorBeforeNextFinishedNode = false;
        // Nodes.Initialize and prime the this.scanner before parsing the source elements.
        this.lexer.setText(this.sourceText);
        this.lexer.setScriptTarget(languageVersion);
        this.lexer.setLanguageVariant(getLanguageVariant(scriptKind));
    };
    Parser.prototype.clearState = function () {
        // Nodes.Clear out the text the this.scanner is pointing at, so it doesn't keep anything alive unnecessarily.
        this.lexer.setText("");
        // Nodes.Clear any data.  Nodes.We don't want to accidentally hold onto it for too long.
        this.parseDiagnostics = undefined;
        this.sourceFile = undefined;
        this.identifiers = undefined;
        this.syntaxCursor = undefined;
        this.sourceText = undefined;
    };
    Parser.prototype.parseSourceFileWorker = function (fileName, languageVersion, setParentNodes, scriptKind) {
        this.sourceFile = this.createSourceFile(fileName, languageVersion, scriptKind);
        this.sourceFile.flags = this.contextFlags;
        // Nodes.Prime the this.scanner.
        this.lexer.peek().type = this.nextToken();
        this.processReferenceComments(this.sourceFile);
        this.sourceFile.statements = this.parseList(Nodes.ParsingContext.SourceElements, this.parseStatement);
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.endOfFile);
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
        if (this.contextFlags & Nodes.NodeFlags.JavaScriptFile) {
            var comments = getLeadingCommentRangesOfNode(result, this.sourceFile);
            if (comments) {
                for (var _i = 0, comments_1 = comments; _i < comments_1.length; _i++) {
                    var comment = comments_1[_i];
                    var jsDocComment = Nodes.JSDocParser.parseJSDocComment(result, comment.pos, comment.end - comment.pos);
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
        // normally parent references are set during binding. Nodes.However, for clients that only need
        // a syntax tree, and no semantic features, then the binding process is an unnecessary
        // overhead.  Nodes.This functions allows us to set all the parents, without all the expense of
        // binding.
        var parent = rootNode;
        forEachChild(rootNode, visitNode);
        return;
        function visitNode(n) {
            // walk down setting parents that differ from the parent we think it should be.  Nodes.This
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
        this.setContextFlag(val, Nodes.NodeFlags.DisallowInContext);
    };
    Parser.prototype.setYieldContext = function (val) {
        this.setContextFlag(val, Nodes.NodeFlags.YieldContext);
    };
    Parser.prototype.setDecoratorContext = function (val) {
        this.setContextFlag(val, Nodes.NodeFlags.DecoratorContext);
    };
    Parser.prototype.setAwaitContext = function (val) {
        this.setContextFlag(val, Nodes.NodeFlags.AwaitContext);
    };
    Parser.prototype.doOutsideOfContext = function (context, func) {
        // contextFlagsToClear will contain only the context flags that are
        // currently set that we need to temporarily clear
        // Nodes.We don't just blindly reset to the previous flags to ensure
        // that we do not mutate cached flags for the incremental
        // parser (Nodes.ThisNodeHasError, Nodes.ThisNodeOrAnySubNodesHasError, and
        // Nodes.HasAggregatedChildData).
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
        // Nodes.We don't just blindly reset to the previous flags to ensure
        // that we do not mutate cached flags for the incremental
        // parser (Nodes.ThisNodeHasError, Nodes.ThisNodeOrAnySubNodesHasError, and
        // Nodes.HasAggregatedChildData).
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
        return this.doOutsideOfContext(Nodes.NodeFlags.DisallowInContext, func);
    };
    Parser.prototype.disallowInAnd = function (func) {
        return this.doInsideOfContext(Nodes.NodeFlags.DisallowInContext, func);
    };
    Parser.prototype.doInYieldContext = function (func) {
        return this.doInsideOfContext(Nodes.NodeFlags.YieldContext, func);
    };
    Parser.prototype.doInDecoratorContext = function (func) {
        return this.doInsideOfContext(Nodes.NodeFlags.DecoratorContext, func);
    };
    Parser.prototype.doInAwaitContext = function (func) {
        return this.doInsideOfContext(Nodes.NodeFlags.AwaitContext, func);
    };
    Parser.prototype.doOutsideOfAwaitContext = function (func) {
        return this.doOutsideOfContext(Nodes.NodeFlags.AwaitContext, func);
    };
    Parser.prototype.doInYieldAndAwaitContext = function (func) {
        return this.doInsideOfContext(Nodes.NodeFlags.YieldContext | Nodes.NodeFlags.AwaitContext, func);
    };
    Parser.prototype.inContext = function (flags) {
        return (this.contextFlags & flags) !== 0;
    };
    Parser.prototype.inYieldContext = function () {
        return this.inContext(Nodes.NodeFlags.YieldContext);
    };
    Parser.prototype.inDisallowInContext = function () {
        return this.inContext(Nodes.NodeFlags.DisallowInContext);
    };
    Parser.prototype.inDecoratorContext = function () {
        return this.inContext(Nodes.NodeFlags.DecoratorContext);
    };
    Parser.prototype.inAwaitContext = function () {
        return this.inContext(Nodes.NodeFlags.AwaitContext);
    };
    Parser.prototype.parseErrorAtCurrentToken = function (message, arg0) {
        var start = this.lexer.getTokenPos();
        var length = this.lexer.getTextPos() - start;
        this.parseErrorAtPosition(start, length, message, arg0);
    };
    Parser.prototype.parseErrorAtPosition = function (start, length, message, arg0) {
        // Nodes.Don't report another error if it would just be at the same position as the last error.
        var lastError = lastOrUndefined(this.parseDiagnostics);
        if (!lastError || start !== lastError.start) {
            this.parseDiagnostics.push(createFileDiagnostic(this.sourceFile, start, length, message, arg0));
        }
        // Nodes.Mark that we've encountered an error.  Nodes.We'll set an appropriate bit on the next
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
    Parser.prototype.nextToken = function () {
        return this.lexer.peek().type = this.lexer.scan();
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
        // Nodes.Keep track of the state we'll need to rollback to if lookahead fails (or if the
        // caller asked us to always reset our state).
        var saveToken = this.lexer.peek().type;
        var saveParseDiagnosticsLength = this.parseDiagnostics.length;
        var saveParseErrorBeforeNextFinishedNode = this.parseErrorBeforeNextFinishedNode;
        // Nodes.Note: it is not actually necessary to save/restore the context flags here.  Nodes.That's
        // because the saving/restoring of these flags happens naturally through the recursive
        // descent nature of our parser.  Nodes.However, we still store this here just so we can
        // assert that that invariant holds.
        var saveContextFlags = this.contextFlags;
        // Nodes.If we're only looking ahead, then tell the this.scanner to only lookahead as well.
        // Nodes.Otherwise, if we're actually speculatively parsing, then tell the this.scanner to do the
        // same.
        var ;
        this.result = isLookAhead
            ? this.lexer.lookAhead(callback)
            : this.lexer.tryScan(callback);
        console.assert(saveContextFlags === this.contextFlags);
        // Nodes.If our callback returned something 'falsy' or we're just looking ahead,
        // then unconditionally restore us to where we were.
        if (!this.result || isLookAhead) {
            this.lexer.peek().type = saveToken;
            this.parseDiagnostics.length = saveParseDiagnosticsLength;
            this.parseErrorBeforeNextFinishedNode = saveParseErrorBeforeNextFinishedNode;
        }
        return this.result;
    };
    /** Nodes.Invokes the provided callback then unconditionally restores the parser to the state it
     * was in immediately prior to invoking the callback.  Nodes.The this.result of invoking the callback
     * is returned from this function.
     */
    Parser.prototype.lookAhead = function (callback) {
        return this.speculationHelper(callback, /*isLookAhead*/ true);
    };
    /** Nodes.Invokes the provided callback.  Nodes.If the callback returns something falsy, then it restores
     * the parser to the state it was in immediately prior to invoking the callback.  Nodes.If the
     * callback returns something truthy, then the parser state is not rolled back.  Nodes.The this.result
     * of invoking the callback is returned from this function.
     */
    Parser.prototype.tryParse = function (callback) {
        return this.speculationHelper(callback, /*isLookAhead*/ false);
    };
    // Nodes.Ignore strict mode flag because we will report an error in type checker instead.
    Parser.prototype.isIdentifier = function () {
        if (this.lexer.peek().type === tokenType_1.TokenType.Identifier) {
            return true;
        }
        // Nodes.If we have a 'yield' keyword, and we're in the [yield] context, then 'yield' is
        // considered a keyword and is not an identifier.
        if (this.lexer.peek().type === tokenType_1.TokenType.yield && this.inYieldContext()) {
            return false;
        }
        // Nodes.If we have a 'await' keyword, and we're in the [Nodes.Await] context, then 'await' is
        // considered a keyword and is not an identifier.
        if (this.lexer.peek().type === tokenType_1.TokenType.await && this.inAwaitContext()) {
            return false;
        }
        return this.lexer.peek().type > tokenType_1.TokenType.LastReservedWord;
    };
    Parser.prototype.parseExpected = function (kind, diagnosticMessage, shouldAdvance) {
        if (shouldAdvance === void 0) { shouldAdvance = true; }
        if (this.lexer.peek().type === kind) {
            if (shouldAdvance) {
                this.nextToken();
            }
            return true;
        }
        // Nodes.Report specific message if provided with one.  Nodes.Otherwise, report generic fallback message.
        if (diagnosticMessage) {
            this.parseErrorAtCurrentToken(diagnosticMessage);
        }
        else {
            this.parseErrorAtCurrentToken(Nodes.Diagnostics._0_expected, tokenToString(kind));
        }
        return false;
    };
    Parser.prototype.parseOptional = function (t) {
        if (this.lexer.peek().type === t) {
            this.nextToken();
            return true;
        }
        return false;
    };
    Parser.prototype.parseOptionalToken = function (t) {
        if (this.lexer.peek().type === t) {
            return this.parseTokenNode();
        }
        return undefined;
    };
    Parser.prototype.parseExpectedToken = function (t, reportAtCurrentPosition, diagnosticMessage, arg0) {
        return this.parseOptionalToken(t) ||
            this.createMissingNode(t, reportAtCurrentPosition, diagnosticMessage, arg0);
    };
    Parser.prototype.parseTokenNode = function () {
        var result = new T();
        this.nextToken();
        return result;
    };
    Parser.prototype.canParseSemicolon = function () {
        // Nodes.If there's a real semicolon, then we can always parse it out.
        if (this.lexer.peek().type === tokenType_1.TokenType.semicolon) {
            return true;
        }
        // Nodes.We can parse out an optional semicolon in Nodes.ASI cases in the following cases.
        return this.lexer.peek().type === tokenType_1.TokenType.closeBrace || this.lexer.peek().type === tokenType_1.TokenType.endOfFile || this.lexer.peek().hasLineBreakBeforeStar;
    };
    Parser.prototype.parseSemicolon = function () {
        if (this.canParseSemicolon()) {
            if (this.lexer.peek().type === tokenType_1.TokenType.semicolon) {
                // consume the semicolon if it was explicitly provided.
                this.nextToken();
            }
            return true;
        }
        else {
            return this.parseExpected(tokenType_1.TokenType.semicolon);
        }
    };
    Parser.prototype.finishNode = function (result, end) {
        result.end = end === undefined ? this.lexer.getStartPos() : end;
        if (this.contextFlags) {
            result.flags |= this.contextFlags;
        }
        // Nodes.Keep track on the result if we encountered an error while parsing it.  Nodes.If we did, then
        // we cannot reuse the result incrementally.  Nodes.Once we've marked this result, clear out the
        // flag so that we don't mark any subsequent nodes.
        if (this.parseErrorBeforeNextFinishedNode) {
            this.parseErrorBeforeNextFinishedNode = false;
            result.flags |= Nodes.NodeFlags.ThisNodeHasError;
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
    // Nodes.An identifier that starts with two underscores has an extra underscore character prepended to it to avoid issues
    // with magic property names like '__proto__'. Nodes.The 'this.identifiers' object is used to share a single string instance for
    // each identifier in order to reduce memory consumption.
    Parser.prototype.createIdentifier = function (isIdentifier, diagnosticMessage) {
        this.identifierCount++;
        if (this.isIdentifier) {
            var result = new Nodes.Identifier();
            // Nodes.Store original this.lexer.peek().type kind if it is not just an Nodes.Identifier so we can report appropriate error later in type checker
            if (this.lexer.peek().type !== tokenType_1.TokenType.Identifier) {
                result.originalKeywordKind = this.lexer.peek().type;
            }
            result.text = this.internIdentifier(this.lexer.getTokenValue());
            this.nextToken();
            return result;
        }
        return this.createMissingNode(tokenType_1.TokenType.Identifier, /*reportAtCurrentPosition*/ false, diagnosticMessage || Nodes.Diagnostics.Identifier_expected);
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
        if (allowComputedPropertyNames && this.lexer.peek().type === tokenType_1.TokenType.openBracket) {
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
        // Nodes.PropertyName [Nodes.Yield]:
        //      Nodes.LiteralPropertyName
        //      Nodes.ComputedPropertyName[?Nodes.Yield]
        var result = new Nodes.ComputedPropertyName();
        this.parseExpected(tokenType_1.TokenType.openBracket);
        // Nodes.We parse any expression (including a comma expression). Nodes.But the grammar
        // says that only an assignment expression is allowed, so the grammar checker
        // will error if it sees a comma expression.
        result.expression = this.allowInAnd(this.parseExpression);
        this.parseExpected(tokenType_1.TokenType.closeBracket);
        return result;
    };
    Parser.prototype.parseContextualModifier = function (t) {
        return this.lexer.peek().type === t && this.tryParse(this.nextTokenCanFollowModifier);
    };
    Parser.prototype.nextTokenIsOnSameLineAndCanFollowModifier = function () {
        this.nextToken();
        if (this.lexer.peek().hasLineBreakBeforeStar) {
            return false;
        }
        return this.canFollowModifier();
    };
    Parser.prototype.nextTokenCanFollowModifier = function () {
        if (this.lexer.peek().type === tokenType_1.TokenType.const) {
            // 'const' is only a modifier if followed by 'this.enum'.
            return this.nextToken() === tokenType_1.TokenType.enum;
        }
        if (this.lexer.peek().type === tokenType_1.TokenType.export) {
            this.nextToken();
            if (this.lexer.peek().type === tokenType_1.TokenType.default) {
                return this.lookAhead(this.nextTokenIsClassOrFunctionOrAsync);
            }
            return this.lexer.peek().type !== tokenType_1.TokenType.asterisk && this.lexer.peek().type !== tokenType_1.TokenType.as && this.lexer.peek().type !== tokenType_1.TokenType.openBrace && this.canFollowModifier();
        }
        if (this.lexer.peek().type === tokenType_1.TokenType.default) {
            return this.nextTokenIsClassOrFunctionOrAsync();
        }
        if (this.lexer.peek().type === tokenType_1.TokenType.static) {
            this.nextToken();
            return this.canFollowModifier();
        }
        return this.nextTokenIsOnSameLineAndCanFollowModifier();
    };
    Parser.prototype.parseAnyContextualModifier = function () {
        return isModifierKind(this.lexer.peek().type) && this.tryParse(this.nextTokenCanFollowModifier);
    };
    Parser.prototype.canFollowModifier = function () {
        return this.lexer.peek().type === tokenType_1.TokenType.openBracket
            || this.lexer.peek().type === tokenType_1.TokenType.openBrace
            || this.lexer.peek().type === tokenType_1.TokenType.asterisk
            || this.lexer.peek().type === tokenType_1.TokenType.dotDotDot
            || this.isLiteralPropertyName();
    };
    Parser.prototype.nextTokenIsClassOrFunctionOrAsync = function () {
        this.nextToken();
        return this.lexer.peek().type === tokenType_1.TokenType.class || this.lexer.peek().type === tokenType_1.TokenType.function ||
            (this.lexer.peek().type === tokenType_1.TokenType.async && this.lookAhead(this.nextTokenIsFunctionKeywordOnSameLine));
    };
    // Nodes.True if positioned at the start of a list element
    Parser.prototype.isListElement = function (parsingContext, inErrorRecovery) {
        var result = this.currentNode(this.parsingContext);
        if (result) {
            return true;
        }
        switch (this.parsingContext) {
            case Nodes.ParsingContext.SourceElements:
            case Nodes.ParsingContext.BlockStatements:
            case Nodes.ParsingContext.SwitchClauseStatements:
                // Nodes.If we're in error recovery, then we don't want to treat ';' as an empty statement.
                // Nodes.The problem is that ';' can show up in far too many contexts, and if we see one
                // and assume it's a statement, then we may bail out inappropriately from whatever
                // we're parsing.  Nodes.For example, if we have a semicolon in the middle of a class, then
                // we really don't want to assume the class is over and we're on a statement in the
                // outer module.  Nodes.We just want to consume and move on.
                return !(this.lexer.peek().type === tokenType_1.TokenType.semicolon && inErrorRecovery) && this.isStartOfStatement();
            case Nodes.ParsingContext.SwitchClauses:
                return this.lexer.peek().type === tokenType_1.TokenType.case || this.lexer.peek().type === tokenType_1.TokenType.default;
            case Nodes.ParsingContext.TypeMembers:
                return this.lookAhead(this.isTypeMemberStart);
            case Nodes.ParsingContext.ClassMembers:
                // Nodes.We allow semicolons as class elements (as specified by Nodes.ES6) as long as we're
                // not in error recovery.  Nodes.If we're in error recovery, we don't want an errant
                // semicolon to be treated as a class member (since they're almost always used
                // for statements.
                return this.lookAhead(this.isClassMemberStart) || (this.lexer.peek().type === tokenType_1.TokenType.semicolon && !inErrorRecovery);
            case Nodes.ParsingContext.EnumMembers:
                // Nodes.Include open bracket computed properties. Nodes.This technically also lets in indexers,
                // which would be a candidate for improved error reporting.
                return this.lexer.peek().type === tokenType_1.TokenType.openBracket || this.isLiteralPropertyName();
            case Nodes.ParsingContext.ObjectLiteralMembers:
                return this.lexer.peek().type === tokenType_1.TokenType.openBracket || this.lexer.peek().type === tokenType_1.TokenType.asterisk || this.isLiteralPropertyName();
            case Nodes.ParsingContext.ObjectBindingElements:
                return this.lexer.peek().type === tokenType_1.TokenType.openBracket || this.isLiteralPropertyName();
            case Nodes.ParsingContext.HeritageClauseElement:
                // Nodes.If we see { } then only consume it as an expression if it is followed by , or {
                // Nodes.That way we won't consume the body of a class in its heritage clause.
                if (this.lexer.peek().type === tokenType_1.TokenType.openBrace) {
                    return this.lookAhead(this.isValidHeritageClauseObjectLiteral);
                }
                if (!inErrorRecovery) {
                    return this.isStartOfLeftHandSideExpression() && !this.isHeritageClauseExtendsOrImplementsKeyword();
                }
                else {
                    // Nodes.If we're in error recovery we tighten up what we're willing to match.
                    // Nodes.That way we don't treat something like "this" as a valid heritage clause
                    // element during recovery.
                    return this.isIdentifier() && !this.isHeritageClauseExtendsOrImplementsKeyword();
                }
            case Nodes.ParsingContext.VariableDeclarations:
                return this.isIdentifierOrPattern();
            case Nodes.ParsingContext.ArrayBindingElements:
                return this.lexer.peek().type === tokenType_1.TokenType.comma || this.lexer.peek().type === tokenType_1.TokenType.dotDotDot || this.isIdentifierOrPattern();
            case Nodes.ParsingContext.TypeParameters:
                return this.isIdentifier();
            case Nodes.ParsingContext.ArgumentExpressions:
            case Nodes.ParsingContext.ArrayLiteralMembers:
                return this.lexer.peek().type === tokenType_1.TokenType.comma || this.lexer.peek().type === tokenType_1.TokenType.dotDotDot || this.isStartOfExpression();
            case Nodes.ParsingContext.Parameters:
                return this.isStartOfParameter();
            case Nodes.ParsingContext.TypeArguments:
            case Nodes.ParsingContext.TupleElementTypes:
                return this.lexer.peek().type === tokenType_1.TokenType.comma || this.isStartOfType();
            case Nodes.ParsingContext.HeritageClauses:
                return this.isHeritageClause();
            case Nodes.ParsingContext.ImportOrExportSpecifiers:
                return tokenIsIdentifierOrKeyword(this.lexer.peek().type);
            case Nodes.ParsingContext.JsxAttributes:
                return tokenIsIdentifierOrKeyword(this.lexer.peek().type) || this.lexer.peek().type === tokenType_1.TokenType.openBrace;
            case Nodes.ParsingContext.JsxChildren:
                return true;
            case Nodes.ParsingContext.JSDocFunctionParameters:
            case Nodes.ParsingContext.JSDocTypeArguments:
            case Nodes.ParsingContext.JSDocTupleTypes:
                return Nodes.JSDocParser.isJSDocType();
            case Nodes.ParsingContext.JSDocRecordMembers:
                return this.isSimplePropertyName();
        }
        Nodes.Debug.fail("Nodes.Non-exhaustive case in 'this.isListElement'.");
    };
    Parser.prototype.isValidHeritageClauseObjectLiteral = function () {
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.openBrace);
        if (this.nextToken() === tokenType_1.TokenType.closeBrace) {
            // if we see  "extends {}" then only treat the {} as what we're extending (and not
            // the class body) if we have:
            //
            //      extends {} {
            //      extends {},
            //      extends {} extends
            //      extends {} implements
            var next = this.nextToken();
            return next === tokenType_1.TokenType.comma || next === tokenType_1.TokenType.openBrace || next === tokenType_1.TokenType.extends || next === tokenType_1.TokenType.implements;
        }
        return true;
    };
    Parser.prototype.nextTokenIsIdentifier = function () {
        this.nextToken();
        return this.isIdentifier();
    };
    Parser.prototype.nextTokenIsIdentifierOrKeyword = function () {
        this.nextToken();
        return tokenIsIdentifierOrKeyword(this.lexer.peek().type);
    };
    Parser.prototype.isHeritageClauseExtendsOrImplementsKeyword = function () {
        if (this.lexer.peek().type === tokenType_1.TokenType.implements ||
            this.lexer.peek().type === tokenType_1.TokenType.extends) {
            return this.lookAhead(this.nextTokenIsStartOfExpression);
        }
        return false;
    };
    Parser.prototype.nextTokenIsStartOfExpression = function () {
        this.nextToken();
        return this.isStartOfExpression();
    };
    // Nodes.True if positioned at a list terminator
    Parser.prototype.isListTerminator = function (kind) {
        if (this.lexer.peek().type === tokenType_1.TokenType.endOfFile) {
            // Nodes.Being at the end of the file ends all lists.
            return true;
        }
        switch (kind) {
            case Nodes.ParsingContext.BlockStatements:
            case Nodes.ParsingContext.SwitchClauses:
            case Nodes.ParsingContext.TypeMembers:
            case Nodes.ParsingContext.ClassMembers:
            case Nodes.ParsingContext.EnumMembers:
            case Nodes.ParsingContext.ObjectLiteralMembers:
            case Nodes.ParsingContext.ObjectBindingElements:
            case Nodes.ParsingContext.ImportOrExportSpecifiers:
                return this.lexer.peek().type === tokenType_1.TokenType.closeBrace;
            case Nodes.ParsingContext.SwitchClauseStatements:
                return this.lexer.peek().type === tokenType_1.TokenType.closeBrace || this.lexer.peek().type === tokenType_1.TokenType.case || this.lexer.peek().type === tokenType_1.TokenType.default;
            case Nodes.ParsingContext.HeritageClauseElement:
                return this.lexer.peek().type === tokenType_1.TokenType.openBrace || this.lexer.peek().type === tokenType_1.TokenType.extends || this.lexer.peek().type === tokenType_1.TokenType.implements;
            case Nodes.ParsingContext.VariableDeclarations:
                return this.isVariableDeclaratorListTerminator();
            case Nodes.ParsingContext.TypeParameters:
                // Nodes.Tokens other than '>' are here for better error recovery
                return this.lexer.peek().type === tokenType_1.TokenType.greaterThan || this.lexer.peek().type === tokenType_1.TokenType.openParen || this.lexer.peek().type === tokenType_1.TokenType.openBrace || this.lexer.peek().type === tokenType_1.TokenType.extends || this.lexer.peek().type === tokenType_1.TokenType.implements;
            case Nodes.ParsingContext.ArgumentExpressions:
                // Nodes.Tokens other than ')' are here for better error recovery
                return this.lexer.peek().type === tokenType_1.TokenType.closeParen || this.lexer.peek().type === tokenType_1.TokenType.semicolon;
            case Nodes.ParsingContext.ArrayLiteralMembers:
            case Nodes.ParsingContext.TupleElementTypes:
            case Nodes.ParsingContext.ArrayBindingElements:
                return this.lexer.peek().type === tokenType_1.TokenType.closeBracket;
            case Nodes.ParsingContext.Parameters:
                // Nodes.Tokens other than ')' and ']' (the latter for index signatures) are here for better error recovery
                return this.lexer.peek().type === tokenType_1.TokenType.closeParen || this.lexer.peek().type === tokenType_1.TokenType.closeBracket /*|| this.lexer.peek().type === Nodes.SyntaxKind.OpenBraceToken*/;
            case Nodes.ParsingContext.TypeArguments:
                // Nodes.Tokens other than '>' are here for better error recovery
                return this.lexer.peek().type === tokenType_1.TokenType.greaterThan || this.lexer.peek().type === tokenType_1.TokenType.openParen;
            case Nodes.ParsingContext.HeritageClauses:
                return this.lexer.peek().type === tokenType_1.TokenType.openBrace || this.lexer.peek().type === tokenType_1.TokenType.closeBrace;
            case Nodes.ParsingContext.JsxAttributes:
                return this.lexer.peek().type === tokenType_1.TokenType.greaterThan || this.lexer.peek().type === tokenType_1.TokenType.slash;
            case Nodes.ParsingContext.JsxChildren:
                return this.lexer.peek().type === tokenType_1.TokenType.lessThan && this.lookAhead(this.nextTokenIsSlash);
            case Nodes.ParsingContext.JSDocFunctionParameters:
                return this.lexer.peek().type === tokenType_1.TokenType.closeParen || this.lexer.peek().type === tokenType_1.TokenType.colon || this.lexer.peek().type === tokenType_1.TokenType.closeBrace;
            case Nodes.ParsingContext.JSDocTypeArguments:
                return this.lexer.peek().type === tokenType_1.TokenType.greaterThan || this.lexer.peek().type === tokenType_1.TokenType.closeBrace;
            case Nodes.ParsingContext.JSDocTupleTypes:
                return this.lexer.peek().type === tokenType_1.TokenType.closeBracket || this.lexer.peek().type === tokenType_1.TokenType.closeBrace;
            case Nodes.ParsingContext.JSDocRecordMembers:
                return this.lexer.peek().type === tokenType_1.TokenType.closeBrace;
        }
    };
    Parser.prototype.isVariableDeclaratorListTerminator = function () {
        // Nodes.If we can consume a semicolon (either explicitly, or with Nodes.ASI), then consider us done
        // with parsing the list of  variable declarators.
        if (this.canParseSemicolon()) {
            return true;
        }
        // in the case where we're parsing the variable declarator of a 'for-in' statement, we
        // are done if we see an 'in' keyword in front of us. Nodes.Same with for-of
        if (this.isInOrOfKeyword(this.lexer.peek().type)) {
            return true;
        }
        // Nodes.ERROR Nodes.RECOVERY Nodes.TWEAK:
        // Nodes.For better error recovery, if we see an '=>' then we just stop immediately.  Nodes.We've got an
        // arrow function here and it's going to be very unlikely that we'll resynchronize and get
        // another variable declaration.
        if (this.lexer.peek().type === tokenType_1.TokenType.equalsGreaterThan) {
            return true;
        }
        // Nodes.Keep trying to parse out variable declarators.
        return false;
    };
    // Nodes.True if positioned at element or terminator of the current list or any enclosing list
    Parser.prototype.isInSomeParsingContext = function () {
        for (var kind = 0; kind < Nodes.ParsingContext.Count; kind++) {
            if (this.parsingContext & (1 << kind)) {
                if (this.isListElement(kind, /*inErrorRecovery*/ true) || this.isListTerminator(kind)) {
                    return true;
                }
            }
        }
        return false;
    };
    // Nodes.Parses a list of elements
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
        // Nodes.If there is an outstanding parse error that we've encountered, but not attached to
        // some result, then we cannot get a result from the old source tree.  Nodes.This is because we
        // want to mark the next result we encounter as being unusable.
        //
        // Nodes.Note: Nodes.This may be too conservative.  Nodes.Perhaps we could reuse the result and set the bit
        // on it (or its leftmost child) as having the error.  Nodes.For now though, being conservative
        // is nice and likely won't ever affect perf.
        if (this.parseErrorBeforeNextFinishedNode) {
            return undefined;
        }
        if (!this.syntaxCursor) {
            // if we don't have a cursor, we could never return a result from the old tree.
            return undefined;
        }
        var result = this.syntaxCursor.currentNode(this.lexer.getStartPos());
        // Nodes.Can't reuse a missing result.
        if (nodeIsMissing(result)) {
            return undefined;
        }
        // Nodes.Can't reuse a result that intersected the change range.
        if (result.intersectsChange) {
            return undefined;
        }
        // Nodes.Can't reuse a result that contains a parse error.  Nodes.This is necessary so that we
        // produce the same set of errors again.
        if (containsParseError(result)) {
            return undefined;
        }
        // Nodes.We can only reuse a result if it was parsed under the same strict mode that we're
        // currently in.  i.e. if we originally parsed a result in non-strict mode, but then
        // the user added 'using strict' at the top of the file, then we can't use that result
        // again as the presence of strict mode may cause us to parse the tokens in the file
        // differently.
        //
        // Nodes.Note: we *can* reuse tokens when the strict mode changes.  Nodes.That's because tokens
        // are unaffected by strict mode.  Nodes.It's just the parser will decide what to do with it
        // differently depending on what mode it is in.
        //
        // Nodes.This also applies to all our other context flags as well.
        var nodeContextFlags = result.flags & Nodes.NodeFlags.ContextFlags;
        if (nodeContextFlags !== this.contextFlags) {
            return undefined;
        }
        // Nodes.Ok, we have a result that looks like it could be reused.  Nodes.Now verify that it is valid
        // in the current list parsing context that we're currently at.
        if (!this.canReuseNode(result, this.parsingContext)) {
            return undefined;
        }
        return result;
    };
    Parser.prototype.consumeNode = function (result) {
        // Nodes.Move the this.scanner so it is after the result we just consumed.
        this.lexer.setTextPos(result.end);
        this.nextToken();
        return result;
    };
    Parser.prototype.canReuseNode = function (result, parsingContext) {
        switch (this.parsingContext) {
            case Nodes.ParsingContext.ClassMembers:
                return this.isReusableClassMember(result);
            case Nodes.ParsingContext.SwitchClauses:
                return this.isReusableSwitchClause(result);
            case Nodes.ParsingContext.SourceElements:
            case Nodes.ParsingContext.BlockStatements:
            case Nodes.ParsingContext.SwitchClauseStatements:
                return this.isReusableStatement(result);
            case Nodes.ParsingContext.EnumMembers:
                return this.isReusableEnumMember(result);
            case Nodes.ParsingContext.TypeMembers:
                return this.isReusableTypeMember(result);
            case Nodes.ParsingContext.VariableDeclarations:
                return this.isReusableVariableDeclaration(result);
            case Nodes.ParsingContext.Parameters:
                return this.isReusableParameter(result);
            // Nodes.Any other lists we do not care about reusing nodes in.  Nodes.But feel free to add if
            // you can do so safely.  Nodes.Danger areas involve nodes that may involve speculative
            // parsing.  Nodes.If speculative parsing is involved with the result, then the range the
            // parser reached while looking ahead might be in the edited range (see the example
            // in canReuseVariableDeclaratorNode for a good case of this).
            case Nodes.ParsingContext.HeritageClauses:
            // Nodes.This would probably be safe to reuse.  Nodes.There is no speculative parsing with
            // heritage clauses.
            case Nodes.ParsingContext.TypeParameters:
            // Nodes.This would probably be safe to reuse.  Nodes.There is no speculative parsing with
            // type parameters.  Nodes.Note that that's because type *parameters* only occur in
            // unambiguous *type* contexts.  Nodes.While type *arguments* occur in very ambiguous
            // *expression* contexts.
            case Nodes.ParsingContext.TupleElementTypes:
            // Nodes.This would probably be safe to reuse.  Nodes.There is no speculative parsing with
            // tuple types.
            // Nodes.Technically, type argument list types are probably safe to reuse.  Nodes.While
            // speculative parsing is involved with them (since type argument lists are only
            // produced from speculative parsing a < as a type argument list), we only have
            // the types because speculative parsing succeeded.  Nodes.Thus, the lookahead never
            // went past the end of the list and rewound.
            case Nodes.ParsingContext.TypeArguments:
            // Nodes.Note: these are almost certainly not safe to ever reuse.  Nodes.Expressions commonly
            // need a large amount of lookahead, and we should not reuse them as they may
            // have actually intersected the edit.
            case Nodes.ParsingContext.ArgumentExpressions:
            // Nodes.This is not safe to reuse for the same reason as the 'Nodes.AssignmentExpression'
            // cases.  i.e. a property assignment may end with an expression, and thus might
            // have lookahead far beyond it's old result.
            case Nodes.ParsingContext.ObjectLiteralMembers:
            // Nodes.This is probably not safe to reuse.  Nodes.There can be speculative parsing with
            // type names in a heritage clause.  Nodes.There can be generic names in the type
            // name list, and there can be left hand side expressions (which can have type
            // arguments.)
            case Nodes.ParsingContext.HeritageClauseElement:
            // Nodes.Perhaps safe to reuse, but it's unlikely we'd see more than a dozen attributes
            // on any given element. Nodes.Same for children.
            case Nodes.ParsingContext.JsxAttributes:
            case Nodes.ParsingContext.JsxChildren:
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
                    // Nodes.Method declarations are not necessarily reusable.  Nodes.An object-literal
                    // may have a method calls "constructor(...)" and we must reparse that
                    // into an actual .ConstructorDeclaration.
                    var methodDeclaration = result;
                    var nameIsConstructor = methodDeclaration.name.kind === tokenType_1.TokenType.Identifier &&
                        methodDeclaration.name.originalKeywordKind === tokenType_1.TokenType.constructor;
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
        // Nodes.Very subtle incremental parsing bug.  Nodes.Consider the following code:
        //
        //      let v = new Nodes.List < A, B
        //
        // Nodes.This is actually legal code.  Nodes.It's a list of variable declarators "v = new Nodes.List<A"
        // on one side and "B" on the other. Nodes.If you then change that to:
        //
        //      let v = new Nodes.List < A, B >()
        //
        // then we have a problem.  "v = new Nodes.List<A" doesn't intersect the change range, so we
        // start reparsing at "B" and we completely fail to handle this properly.
        //
        // Nodes.In order to prevent this, we do not allow a variable declarator to be reused if it
        // has an initializer.
        var variableDeclarator = result;
        return variableDeclarator.initializer === undefined;
    };
    Parser.prototype.isReusableParameter = function (result) {
        if (result.kind !== tokenType_1.TokenType.Parameter) {
            return false;
        }
        // Nodes.See the comment in this.isReusableVariableDeclaration for why we do this.
        var parameter = result;
        return parameter.initializer === undefined;
    };
    // Nodes.Returns true if we should abort parsing.
    Parser.prototype.abortParsingListOrMoveToNextToken = function (kind) {
        this.parseErrorAtCurrentToken(this.parsingContextErrors(kind));
        if (this.isInSomeParsingContext()) {
            return true;
        }
        this.nextToken();
        return false;
    };
    Parser.prototype.parsingContextErrors = function (context) {
        switch (context) {
            case Nodes.ParsingContext.SourceElements: return Nodes.Diagnostics.Declaration_or_statement_expected;
            case Nodes.ParsingContext.BlockStatements: return Nodes.Diagnostics.Declaration_or_statement_expected;
            case Nodes.ParsingContext.SwitchClauses: return Nodes.Diagnostics.case_or_default_expected;
            case Nodes.ParsingContext.SwitchClauseStatements: return Nodes.Diagnostics.Statement_expected;
            case Nodes.ParsingContext.TypeMembers: return Nodes.Diagnostics.Property_or_signature_expected;
            case Nodes.ParsingContext.ClassMembers: return Nodes.Diagnostics.Unexpected_token_A_constructor_method_accessor_or_property_was_expected;
            case Nodes.ParsingContext.EnumMembers: return Nodes.Diagnostics.Enum_member_expected;
            case Nodes.ParsingContext.HeritageClauseElement: return Nodes.Diagnostics.Expression_expected;
            case Nodes.ParsingContext.VariableDeclarations: return Nodes.Diagnostics.Variable_declaration_expected;
            case Nodes.ParsingContext.ObjectBindingElements: return Nodes.Diagnostics.Property_destructuring_pattern_expected;
            case Nodes.ParsingContext.ArrayBindingElements: return Nodes.Diagnostics.Array_element_destructuring_pattern_expected;
            case Nodes.ParsingContext.ArgumentExpressions: return Nodes.Diagnostics.Argument_expression_expected;
            case Nodes.ParsingContext.ObjectLiteralMembers: return Nodes.Diagnostics.Property_assignment_expected;
            case Nodes.ParsingContext.ArrayLiteralMembers: return Nodes.Diagnostics.Expression_or_comma_expected;
            case Nodes.ParsingContext.Parameters: return Nodes.Diagnostics.Parameter_declaration_expected;
            case Nodes.ParsingContext.TypeParameters: return Nodes.Diagnostics.Type_parameter_declaration_expected;
            case Nodes.ParsingContext.TypeArguments: return Nodes.Diagnostics.Type_argument_expected;
            case Nodes.ParsingContext.TupleElementTypes: return Nodes.Diagnostics.Type_expected;
            case Nodes.ParsingContext.HeritageClauses: return Nodes.Diagnostics.Unexpected_token_expected;
            case Nodes.ParsingContext.ImportOrExportSpecifiers: return Nodes.Diagnostics.Identifier_expected;
            case Nodes.ParsingContext.JsxAttributes: return Nodes.Diagnostics.Identifier_expected;
            case Nodes.ParsingContext.JsxChildren: return Nodes.Diagnostics.Identifier_expected;
            case Nodes.ParsingContext.JSDocFunctionParameters: return Nodes.Diagnostics.Parameter_declaration_expected;
            case Nodes.ParsingContext.JSDocTypeArguments: return Nodes.Diagnostics.Type_argument_expected;
            case Nodes.ParsingContext.JSDocTupleTypes: return Nodes.Diagnostics.Type_expected;
            case Nodes.ParsingContext.JSDocRecordMembers: return Nodes.Diagnostics.Property_assignment_expected;
        }
    };
    ;
    // Nodes.Parses a comma-delimited list of elements
    Parser.prototype.parseDelimitedList = function (kind, parseElement, considerSemicolonAsDelimiter) {
        var saveParsingContext = this.parsingContext;
        this.parsingContext |= 1 << kind;
        var ;
        this.result = [];
        this.result.pos = this.getNodePos();
        var commaStart = -1; // Nodes.Meaning the previous this.lexer.peek().type was not a comma
        while (true) {
            if (this.isListElement(kind, /*inErrorRecovery*/ false)) {
                this.result.push(this.parseListElement(kind, parseElement));
                commaStart = this.lexer.getTokenPos();
                if (this.parseOptional(tokenType_1.TokenType.comma)) {
                    continue;
                }
                commaStart = -1; // Nodes.Back to the state where the last this.lexer.peek().type was not a comma
                if (this.isListTerminator(kind)) {
                    break;
                }
                // Nodes.We didn't get a comma, and the list wasn't terminated, explicitly parse
                // out a comma so we give a good error message.
                this.parseExpected(tokenType_1.TokenType.comma);
                // Nodes.If the this.lexer.peek().type was a semicolon, and the caller allows that, then skip it and
                // continue.  Nodes.This ensures we get back on track and don't this.result in tons of
                // parse errors.  Nodes.For example, this can happen when people do things like use
                // a semicolon to delimit object literal members.   Nodes.Note: we'll have already
                // reported an error when we called this.parseExpected above.
                if (considerSemicolonAsDelimiter && this.lexer.peek().type === tokenType_1.TokenType.semicolon && !this.lexer.peek().hasLineBreakBeforeStar) {
                    this.nextToken();
                }
                continue;
            }
            if (this.isListTerminator(kind)) {
                break;
            }
            if (this.abortParsingListOrMoveToNextToken(kind)) {
                break;
            }
        }
        // Nodes.Recording the trailing comma is deliberately done after the previous
        // loop, and not just if we see a list terminator. Nodes.This is because the list
        // may have ended incorrectly, but it is still important to know if there
        // was a trailing comma.
        // Nodes.Check if the last this.lexer.peek().type was a comma.
        if (commaStart >= 0) {
            // Nodes.Always preserve a trailing comma by marking it on the Nodes.NodeList
            this.result.hasTrailingComma = true;
        }
        this.result.end = this.getNodeEnd();
        this.parsingContext = saveParsingContext;
        return this.result;
    };
    Parser.prototype.createMissingList = function () {
        var pos = this.getNodePos();
        var ;
        this.result = [];
        this.result.pos = pos;
        this.result.end = pos;
        return this.result;
    };
    Parser.prototype.parseBracketedList = function (kind, parseElement, open, close) {
        if (this.parseExpected(open)) {
            var ;
            this.result = this.parseDelimitedList(kind, parseElement);
            this.parseExpected(close);
            return this.result;
        }
        return this.createMissingList();
    };
    // Nodes.The allowReservedWords parameter controls whether reserved words are permitted after the first dot
    Parser.prototype.parseEntityName = function (allowReservedWords, diagnosticMessage) {
        var entity = this.parseIdentifier(diagnosticMessage);
        while (this.parseOptional(tokenType_1.TokenType.dot)) {
            var result = new Nodes.QualifiedName(); // !!!
            result.left = entity;
            result.right = this.parseRightSideOfDot(allowReservedWords);
            entity = result;
        }
        return entity;
    };
    Parser.prototype.parseRightSideOfDot = function (allowIdentifierNames) {
        // Nodes.Technically a keyword is valid here as all this.identifiers and keywords are identifier names.
        // Nodes.However, often we'll encounter this in error situations when the identifier or keyword
        // is actually starting another valid construct.
        //
        // Nodes.So, we check for the following specific case:
        //
        //      name.
        //      identifierOrKeyword identifierNameOrKeyword
        //
        // Nodes.Note: the newlines are important here.  Nodes.For example, if that above code
        // were rewritten into:
        //
        //      name.identifierOrKeyword
        //      identifierNameOrKeyword
        //
        // Nodes.Then we would consider it valid.  Nodes.That's because Nodes.ASI would take effect and
        // the code would be implicitly: "name.identifierOrKeyword; identifierNameOrKeyword".
        // Nodes.In the first case though, Nodes.ASI will not take effect because there is not a
        // line terminator after the identifier or keyword.
        if (this.lexer.peek().hasLineBreakBeforeStar && tokenIsIdentifierOrKeyword(this.lexer.peek().type)) {
            var matchesPattern = this.lookAhead(this.nextTokenIsIdentifierOrKeywordOnSameLine);
            if (matchesPattern) {
                // Nodes.Report that we need an identifier.  Nodes.However, report it right after the dot,
                // and not on the next this.lexer.peek().type.  Nodes.This is because the next this.lexer.peek().type might actually
                // be an identifier and the error would be quite confusing.
                return this.createMissingNode(tokenType_1.TokenType.Identifier, /*reportAtCurrentPosition*/ true, Nodes.Diagnostics.Identifier_expected);
            }
        }
        return allowIdentifierNames ? this.parseIdentifierName() : this.parseIdentifier();
    };
    Parser.prototype.parseTemplateExpression = function () {
        var template = new Nodes.TemplateExpression();
        template.head = this.parseTemplateLiteralFragment();
        console.assert(template.head.kind === tokenType_1.TokenType.TemplateHead, "Nodes.Template head has wrong this.lexer.peek().type kind");
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
        var span = new Nodes.TemplateSpan();
        span.expression = this.allowInAnd(this.parseExpression);
        var literal;
        if (this.lexer.peek().type === tokenType_1.TokenType.closeBrace) {
            this.reScanTemplateToken();
            literal = this.parseTemplateLiteralFragment();
        }
        else {
            literal = this.parseExpectedToken(tokenType_1.TokenType.TemplateTail, /*reportAtCurrentPosition*/ false, Nodes.Diagnostics._0_expected, tokenToString(tokenType_1.TokenType.closeBrace));
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
        var result = new Nodes.LiteralExpression();
        var text = this.lexer.getTokenValue();
        result.text = internName ? this.internIdentifier(text) : text;
        if (this.lexer.hasExtendedUnicodeEscape()) {
            result.hasExtendedUnicodeEscape = true;
        }
        if (this.lexer.isUnterminated()) {
            result.isUnterminated = true;
        }
        var tokenPos = this.lexer.getTokenPos();
        this.nextToken();
        result;
        // Nodes.Octal literals are not allowed in strict mode or Nodes.ES5
        // Nodes.Note that theoretically the following condition would hold true literals like 009,
        // which is not octal.But because of how the this.scanner separates the tokens, we would
        // never get a this.lexer.peek().type like this. Nodes.Instead, we would get 00 and 9 as two separate tokens.
        // Nodes.We also do not need to check for negatives because any prefix operator would be part of a
        // parent unary expression.
        if (result.kind === tokenType_1.TokenType.NumericLiteral
            && this.sourceText.charCodeAt(tokenPos) === Nodes.CharCode.num0
            && isOctalDigit(this.sourceText.charCodeAt(tokenPos + 1))) {
            result.isOctalLiteral = true;
        }
        return result;
    };
    // Nodes.TYPES
    Parser.prototype.parseTypeReference = function () {
        var typeName = this.parseEntityName(/*allowReservedWords*/ false, Nodes.Diagnostics.Type_expected);
        var result = new Nodes.TypeReferenceNode();
        result.typeName = typeName;
        if (!this.lexer.peek().hasLineBreakBeforeStar && this.lexer.peek().type === tokenType_1.TokenType.lessThan) {
            result.typeArguments = this.parseBracketedList(Nodes.ParsingContext.TypeArguments, this.parseType, tokenType_1.TokenType.lessThan, tokenType_1.TokenType.greaterThan);
        }
        return result;
    };
    Parser.prototype.parseThisTypePredicate = function (lhs) {
        this.nextToken();
        var result = this.createNode(tokenType_1.TokenType.TypePredicate, lhs.pos);
        result.parameterName = lhs;
        result.type = this.parseType();
        return result;
    };
    Parser.prototype.parseThisTypeNode = function () {
        var result = this.createNode(tokenType_1.TokenType.ThisType);
        this.nextToken();
        return result;
    };
    Parser.prototype.parseTypeQuery = function () {
        var result = new Nodes.TypeQueryNode();
        this.parseExpected(tokenType_1.TokenType.typeof);
        result.exprName = this.parseEntityName(/*allowReservedWords*/ true);
        return result;
    };
    Parser.prototype.parseTypeParameter = function () {
        var result = new Nodes.TypeParameterDeclaration();
        result.name = this.parseIdentifier();
        if (this.parseOptional(tokenType_1.TokenType.extends)) {
            // Nodes.It's not uncommon for people to write improper constraints to a generic.  Nodes.If the
            // user writes a constraint that is an expression and not an actual type, then parse
            // it out as an expression (so we can recover well), but report that a type is needed
            // instead.
            if (this.isStartOfType() || !this.isStartOfExpression()) {
                result.constraint = this.parseType();
            }
            else {
                // Nodes.It was not a type, and it looked like an expression.  Nodes.Parse out an expression
                // here so we recover well.  Nodes.Note: it is important that we call parseUnaryExpression
                // and not this.parseExpression here.  Nodes.If the user has:
                //
                //      <T extends "">
                //
                // Nodes.We do *not* want to consume the  >  as we're consuming the expression for "".
                result.expression = this.parseUnaryExpressionOrHigher();
            }
        }
        return result;
    };
    Parser.prototype.parseTypeParameters = function () {
        if (this.lexer.peek().type === tokenType_1.TokenType.lessThan) {
            return this.parseBracketedList(Nodes.ParsingContext.TypeParameters, this.parseTypeParameter, tokenType_1.TokenType.lessThan, tokenType_1.TokenType.greaterThan);
        }
    };
    Parser.prototype.parseParameterType = function () {
        if (this.parseOptional(tokenType_1.TokenType.colon)) {
            return this.parseType();
        }
        return undefined;
    };
    Parser.prototype.isStartOfParameter = function () {
        return this.lexer.peek().type === tokenType_1.TokenType.dotDotDot || this.isIdentifierOrPattern() || isModifierKind(this.lexer.peek().type) || this.lexer.peek().type === tokenType_1.TokenType.at || this.lexer.peek().type === tokenType_1.TokenType.this;
    };
    Parser.prototype.setModifiers = function (result, modifiers) {
        if (modifiers) {
            result.flags |= modifiers.flags;
            result.modifiers = modifiers;
        }
    };
    Parser.prototype.parseParameter = function () {
        var result = new Nodes.ParameterDeclaration();
        if (this.lexer.peek().type === tokenType_1.TokenType.this) {
            result.name = this.createIdentifier(/*this.isIdentifier*/ true, undefined);
            result.type = this.parseParameterType();
            return result;
        }
        result.decorators = this.parseDecorators();
        this.setModifiers(result, this.parseModifiers());
        result.dotDotDotToken = this.parseOptionalToken(tokenType_1.TokenType.dotDotDot);
        // Nodes.FormalParameter [Nodes.Yield,Nodes.Await]:
        //      Nodes.BindingElement[?Nodes.Yield,?Nodes.Await]
        result.name = this.parseBindingName();
        if (getFullWidth(result.name) === 0 && result.flags === 0 && isModifierKind(this.lexer.peek().type)) {
            // in cases like
            // 'use strict'
            // function foo(static)
            // isParameter('static') === true, because of isModifier('static')
            // however 'static' is not a legal identifier in a strict mode.
            // so this.result of this function will be Nodes.ParameterDeclaration (flags = 0, name = missing, type = undefined, initializer = undefined)
            // and current this.lexer.peek().type will not change => parsing of the enclosing parameter list will last till the end of time (or Nodes.OOM)
            // to avoid this we'll advance cursor to the next this.lexer.peek().type.
            this.nextToken();
        }
        result.questionToken = this.parseOptionalToken(tokenType_1.TokenType.question);
        result.type = this.parseParameterType();
        result.initializer = this.parseBindingElementInitializer(/*inParameter*/ true);
        // Nodes.Do not check for initializers in an ambient context for parameters. Nodes.This is not
        // a grammar error because the grammar allows arbitrary call signatures in
        // an ambient context.
        // Nodes.It is actually not necessary for this to be an error at all. Nodes.The reason is that
        // function/constructor implementations are syntactically disallowed in ambient
        // contexts. Nodes.In addition, parameter initializers are semantically disallowed in
        // overload signatures. Nodes.So parameter initializers are transitively disallowed in
        // ambient contexts.
        return this.parseJsDocComment(result);
    };
    Parser.prototype.parseBindingElementInitializer = function (inParameter) {
        return inParameter ? this.parseParameterInitializer() : this.parseNonParameterInitializer();
    };
    Parser.prototype.parseParameterInitializer = function () {
        return this.parseInitializer(/*inParameter*/ true);
    };
    Parser.prototype.fillSignature = function (returnToken, yieldContext, awaitContext, requireCompleteParameterList, signature) {
        var returnTokenRequired = returnToken === tokenType_1.TokenType.equalsGreaterThan;
        signature.typeParameters = this.parseTypeParameters();
        signature.parameters = this.parseParameterList(yieldContext, awaitContext, requireCompleteParameterList);
        if (returnTokenRequired) {
            this.parseExpected(returnToken);
            signature.type = this.parseTypeOrTypePredicate();
        }
        else if (this.parseOptional(returnToken)) {
            signature.type = this.parseTypeOrTypePredicate();
        }
    };
    Parser.prototype.parseParameterList = function (yieldContext, awaitContext, requireCompleteParameterList) {
        // Nodes.FormalParameters [Nodes.Yield,Nodes.Await]: (modified)
        //      [empty]
        //      Nodes.FormalParameterList[?Nodes.Yield,Nodes.Await]
        //
        // Nodes.FormalParameter[Nodes.Yield,Nodes.Await]: (modified)
        //      Nodes.BindingElement[?Nodes.Yield,Nodes.Await]
        //
        // Nodes.BindingElement [Nodes.Yield,Nodes.Await]: (modified)
        //      Nodes.SingleNameBinding[?Nodes.Yield,?Nodes.Await]
        //      Nodes.BindingPattern[?Nodes.Yield,?Nodes.Await]Nodes.Initializer [Nodes.In, ?Nodes.Yield,?Nodes.Await] opt
        //
        // Nodes.SingleNameBinding [Nodes.Yield,Nodes.Await]:
        //      Nodes.BindingIdentifier[?Nodes.Yield,?Nodes.Await]Nodes.Initializer [Nodes.In, ?Nodes.Yield,?Nodes.Await] opt
        if (this.parseExpected(tokenType_1.TokenType.openParen)) {
            var savedYieldContext = this.inYieldContext();
            var savedAwaitContext = this.inAwaitContext();
            this.setYieldContext(yieldContext);
            this.setAwaitContext(awaitContext);
            var ;
            this.result = this.parseDelimitedList(Nodes.ParsingContext.Parameters, this.parseParameter);
            this.setYieldContext(savedYieldContext);
            this.setAwaitContext(savedAwaitContext);
            if (!this.parseExpected(tokenType_1.TokenType.closeParen) && requireCompleteParameterList) {
                // Nodes.Caller insisted that we had to end with a )   Nodes.We didn't.  Nodes.So just return
                // undefined here.
                return undefined;
            }
            return this.result;
        }
        // Nodes.We didn't even have an open paren.  Nodes.If the caller requires a complete parameter list,
        // we definitely can't provide that.  Nodes.However, if they're ok with an incomplete one,
        // then just return an empty set of parameters.
        return requireCompleteParameterList ? undefined : this.createMissingList();
    };
    Parser.prototype.parseTypeMemberSemicolon = function () {
        // Nodes.We allow type members to be separated by commas or (possibly Nodes.ASI) semicolons.
        // Nodes.First check if it was a comma.  Nodes.If so, we're done with the member.
        if (this.parseOptional(tokenType_1.TokenType.comma)) {
            return;
        }
        // Nodes.Didn't have a comma.  Nodes.We must have a (possible Nodes.ASI) semicolon.
        this.expectSemicolon();
    };
    Parser.prototype.parseSignatureMember = function (kind) {
        var result = new Nodes.CallSignatureDeclaration | Nodes.ConstructSignatureDeclaration();
        if (kind === tokenType_1.TokenType.ConstructSignature) {
            this.parseExpected(tokenType_1.TokenType.new);
        }
        this.fillSignature(tokenType_1.TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, result);
        this.parseTypeMemberSemicolon();
        return result;
    };
    Parser.prototype.isIndexSignature = function () {
        if (this.lexer.peek().type !== tokenType_1.TokenType.openBracket) {
            return false;
        }
        return this.lookAhead(this.isUnambiguouslyIndexSignature);
    };
    Parser.prototype.isUnambiguouslyIndexSignature = function () {
        // Nodes.The only allowed sequence is:
        //
        //   [id:
        //
        // Nodes.However, for error recovery, we also check the following cases:
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
        this.nextToken();
        if (this.lexer.peek().type === tokenType_1.TokenType.dotDotDot || this.lexer.peek().type === tokenType_1.TokenType.closeBracket) {
            return true;
        }
        if (isModifierKind(this.lexer.peek().type)) {
            this.nextToken();
            if (this.isIdentifier()) {
                return true;
            }
        }
        else if (!this.isIdentifier()) {
            return false;
        }
        else {
            // Nodes.Skip the identifier
            this.nextToken();
        }
        // A colon signifies a well formed indexer
        // A comma should be a badly formed indexer because comma expressions are not allowed
        // in computed properties.
        if (this.lexer.peek().type === tokenType_1.TokenType.colon || this.lexer.peek().type === tokenType_1.TokenType.comma) {
            return true;
        }
        // Nodes.Question mark could be an indexer with an optional property,
        // or it could be a conditional expression in a computed property.
        if (this.lexer.peek().type !== tokenType_1.TokenType.question) {
            return false;
        }
        // Nodes.If any of the following tokens are after the question mark, it cannot
        // be a conditional expression, so treat it as an indexer.
        this.nextToken();
        return this.lexer.peek().type === tokenType_1.TokenType.colon || this.lexer.peek().type === tokenType_1.TokenType.comma || this.lexer.peek().type === tokenType_1.TokenType.closeBracket;
    };
    Parser.prototype.parseIndexSignatureDeclaration = function (fullStart, decorators, modifiers) {
        var result = new Nodes.IndexSignatureDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        result.parameters = this.parseBracketedList(Nodes.ParsingContext.Parameters, this.parseParameter, tokenType_1.TokenType.openBracket, tokenType_1.TokenType.closeBracket);
        result.type = this.parseTypeAnnotation();
        this.parseTypeMemberSemicolon();
        return result;
    };
    Parser.prototype.parsePropertyOrMethodSignature = function (fullStart, modifiers) {
        var name = this.parsePropertyName();
        var questionToken = this.parseOptionalToken(tokenType_1.TokenType.question);
        if (this.lexer.peek().type === tokenType_1.TokenType.openParen || this.lexer.peek().type === tokenType_1.TokenType.lessThan) {
            var method = new Nodes.MethodSignature();
            this.setModifiers(method, modifiers);
            method.name = name;
            method.questionToken = questionToken;
            // Nodes.Method signatures don't exist in expression contexts.  Nodes.So they have neither
            // [Nodes.Yield] nor [Nodes.Await]
            this.fillSignature(tokenType_1.TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, method);
            this.parseTypeMemberSemicolon();
            return this.finishNode(method);
        }
        else {
            var property = new Nodes.PropertySignature();
            this.setModifiers(property, modifiers);
            property.name = name;
            property.questionToken = questionToken;
            property.type = this.parseTypeAnnotation();
            if (this.lexer.peek().type === tokenType_1.TokenType.equals) {
                // Nodes.Although type literal properties cannot not have initializers, we attempt
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
        // Nodes.Return true if we have the start of a signature member
        if (this.lexer.peek().type === tokenType_1.TokenType.openParen || this.lexer.peek().type === tokenType_1.TokenType.lessThan) {
            return true;
        }
        // Nodes.Eat up all modifiers, but hold on to the last one in case it is actually an identifier
        while (isModifierKind(this.lexer.peek().type)) {
            idToken = this.lexer.peek().type;
            this.nextToken();
        }
        // Nodes.Index signatures and computed property names are type members
        if (this.lexer.peek().type === tokenType_1.TokenType.openBracket) {
            return true;
        }
        // Nodes.Try to get the first property-like this.lexer.peek().type following all modifiers
        if (this.isLiteralPropertyName()) {
            idToken = this.lexer.peek().type;
            this.nextToken();
        }
        // Nodes.If we were able to get any potential identifier, check that it is
        // the start of a member declaration
        if (idToken) {
            return this.lexer.peek().type === tokenType_1.TokenType.openParen ||
                this.lexer.peek().type === tokenType_1.TokenType.lessThan ||
                this.lexer.peek().type === tokenType_1.TokenType.question ||
                this.lexer.peek().type === tokenType_1.TokenType.colon ||
                this.canParseSemicolon();
        }
        return false;
    };
    Parser.prototype.parseTypeMember = function () {
        if (this.lexer.peek().type === tokenType_1.TokenType.openParen || this.lexer.peek().type === tokenType_1.TokenType.lessThan) {
            return this.parseSignatureMember(tokenType_1.TokenType.CallSignature);
        }
        if (this.lexer.peek().type === tokenType_1.TokenType.new && this.lookAhead(this.isStartOfConstructSignature)) {
            return this.parseSignatureMember(tokenType_1.TokenType.ConstructSignature);
        }
        var fullStart = this.getNodePos();
        var modifiers = this.parseModifiers();
        if (this.isIndexSignature()) {
            return this.parseIndexSignatureDeclaration(fullStart, /*decorators*/ undefined, modifiers);
        }
        return this.parsePropertyOrMethodSignature(fullStart, modifiers);
    };
    Parser.prototype.isStartOfConstructSignature = function () {
        this.nextToken();
        return this.lexer.peek().type === tokenType_1.TokenType.openParen || this.lexer.peek().type === tokenType_1.TokenType.lessThan;
    };
    Parser.prototype.parseTypeLiteral = function () {
        var result = new Nodes.TypeLiteralNode();
        result.members = this.parseObjectTypeMembers();
        return result;
    };
    Parser.prototype.parseObjectTypeMembers = function () {
        var members;
        if (this.parseExpected(tokenType_1.TokenType.openBrace)) {
            members = this.parseList(Nodes.ParsingContext.TypeMembers, this.parseTypeMember);
            this.parseExpected(tokenType_1.TokenType.closeBrace);
        }
        else {
            members = this.createMissingList();
        }
        return members;
    };
    Parser.prototype.parseTupleType = function () {
        var result = new Nodes.TupleTypeNode();
        result.elementTypes = this.parseBracketedList(Nodes.ParsingContext.TupleElementTypes, this.parseType, tokenType_1.TokenType.openBracket, tokenType_1.TokenType.closeBracket);
        return result;
    };
    Parser.prototype.parseParenthesizedType = function () {
        var result = new Nodes.ParenthesizedTypeNode();
        this.parseExpected(tokenType_1.TokenType.openParen);
        result.type = this.parseType();
        this.parseExpected(tokenType_1.TokenType.closeParen);
        return result;
    };
    Parser.prototype.parseFunctionOrConstructorType = function (kind) {
        var result = new Nodes.FunctionOrConstructorTypeNode();
        if (kind === tokenType_1.TokenType.ConstructorType) {
            this.parseExpected(tokenType_1.TokenType.new);
        }
        this.fillSignature(tokenType_1.TokenType.equalsGreaterThan, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, result);
        return result;
    };
    Parser.prototype.parseKeywordAndNoDot = function () {
        var result = this.parseTokenNode();
        return this.lexer.peek().type === tokenType_1.TokenType.dot ? undefined : result;
    };
    Parser.prototype.parseNonArrayType = function () {
        switch (this.lexer.peek().type) {
            case tokenType_1.TokenType.any:
            case tokenType_1.TokenType.string:
            case tokenType_1.TokenType.number:
            case tokenType_1.TokenType.boolean:
            case tokenType_1.TokenType.symbol:
            case tokenType_1.TokenType.undefined:
            case tokenType_1.TokenType.never:
                // Nodes.If these are followed by a dot, then parse these out as a dotted type reference instead.
                var result = this.tryParse(this.parseKeywordAndNoDot);
                return result || this.parseTypeReference();
            case tokenType_1.TokenType.StringLiteral:
                return this.parseStringLiteralTypeNode();
            case tokenType_1.TokenType.void:
            case tokenType_1.TokenType.null:
                return this.parseTokenNode();
            case tokenType_1.TokenType.this: {
                var thisKeyword = this.parseThisTypeNode();
                if (this.lexer.peek().type === tokenType_1.TokenType.is && !this.lexer.peek().hasLineBreakBeforeStar) {
                    return this.parseThisTypePredicate(thisKeyword);
                }
                else {
                    return thisKeyword;
                }
            }
            case tokenType_1.TokenType.typeof:
                return this.parseTypeQuery();
            case tokenType_1.TokenType.openBrace:
                return this.parseTypeLiteral();
            case tokenType_1.TokenType.openBracket:
                return this.parseTupleType();
            case tokenType_1.TokenType.openParen:
                return this.parseParenthesizedType();
            default:
                return this.parseTypeReference();
        }
    };
    Parser.prototype.isStartOfType = function () {
        switch (this.lexer.peek().type) {
            case tokenType_1.TokenType.any:
            case tokenType_1.TokenType.string:
            case tokenType_1.TokenType.number:
            case tokenType_1.TokenType.boolean:
            case tokenType_1.TokenType.symbol:
            case tokenType_1.TokenType.void:
            case tokenType_1.TokenType.undefined:
            case tokenType_1.TokenType.null:
            case tokenType_1.TokenType.this:
            case tokenType_1.TokenType.typeof:
            case tokenType_1.TokenType.never:
            case tokenType_1.TokenType.openBrace:
            case tokenType_1.TokenType.openBracket:
            case tokenType_1.TokenType.lessThan:
            case tokenType_1.TokenType.new:
            case tokenType_1.TokenType.StringLiteral:
                return true;
            case tokenType_1.TokenType.openParen:
                // Nodes.Only consider '(' the start of a type if followed by ')', '...', an identifier, a modifier,
                // or something that starts a type. Nodes.We don't want to consider things like '(1)' a type.
                return this.lookAhead(this.isStartOfParenthesizedOrFunctionType);
            default:
                return this.isIdentifier();
        }
    };
    Parser.prototype.isStartOfParenthesizedOrFunctionType = function () {
        this.nextToken();
        return this.lexer.peek().type === tokenType_1.TokenType.closeParen || this.isStartOfParameter() || this.isStartOfType();
    };
    Parser.prototype.parseArrayTypeOrHigher = function () {
        var type = this.parseNonArrayType();
        while (!this.lexer.peek().hasLineBreakBeforeStar && this.parseOptional(tokenType_1.TokenType.openBracket)) {
            this.parseExpected(tokenType_1.TokenType.closeBracket);
            var result = new Nodes.ArrayTypeNode();
            result.elementType = type;
            type = result;
        }
        return type;
    };
    Parser.prototype.parseUnionOrIntersectionType = function (kind, parseConstituentType, operator) {
        var type = parseConstituentType();
        if (this.lexer.peek().type === operator) {
            var types = [type];
            types.pos = type.pos;
            while (this.parseOptional(operator)) {
                types.push(parseConstituentType());
            }
            types.end = this.getNodeEnd();
            var result = new Nodes.UnionOrIntersectionTypeNode();
            result.types = types;
            type = result;
        }
        return type;
    };
    Parser.prototype.parseIntersectionTypeOrHigher = function () {
        return this.parseUnionOrIntersectionType(tokenType_1.TokenType.IntersectionType, this.parseArrayTypeOrHigher, tokenType_1.TokenType.ampersand);
    };
    Parser.prototype.parseUnionTypeOrHigher = function () {
        return this.parseUnionOrIntersectionType(tokenType_1.TokenType.UnionType, this.parseIntersectionTypeOrHigher, tokenType_1.TokenType.bar);
    };
    Parser.prototype.isStartOfFunctionType = function () {
        if (this.lexer.peek().type === tokenType_1.TokenType.lessThan) {
            return true;
        }
        return this.lexer.peek().type === tokenType_1.TokenType.openParen && this.lookAhead(this.isUnambiguouslyStartOfFunctionType);
    };
    Parser.prototype.skipParameterStart = function () {
        if (isModifierKind(this.lexer.peek().type)) {
            // Nodes.Skip modifiers
            this.parseModifiers();
        }
        if (this.isIdentifier() || this.lexer.peek().type === tokenType_1.TokenType.this) {
            this.nextToken();
            return true;
        }
        if (this.lexer.peek().type === tokenType_1.TokenType.openBracket || this.lexer.peek().type === tokenType_1.TokenType.openBrace) {
            // Nodes.Return true if we can parse an array or object binding pattern with no errors
            var previousErrorCount = this.parseDiagnostics.length;
            this.parseBindingName();
            return previousErrorCount === this.parseDiagnostics.length;
        }
        return false;
    };
    Parser.prototype.isUnambiguouslyStartOfFunctionType = function () {
        this.nextToken();
        if (this.lexer.peek().type === tokenType_1.TokenType.closeParen || this.lexer.peek().type === tokenType_1.TokenType.dotDotDot) {
            // ( )
            // ( ...
            return true;
        }
        if (this.skipParameterStart()) {
            // Nodes.We successfully skipped modifiers (if any) and an identifier or binding pattern,
            // now see if we have something that indicates a parameter declaration
            if (this.lexer.peek().type === tokenType_1.TokenType.colon || this.lexer.peek().type === tokenType_1.TokenType.comma ||
                this.lexer.peek().type === tokenType_1.TokenType.question || this.lexer.peek().type === tokenType_1.TokenType.equals) {
                // ( xxx :
                // ( xxx ,
                // ( xxx ?
                // ( xxx =
                return true;
            }
            if (this.lexer.peek().type === tokenType_1.TokenType.closeParen) {
                this.nextToken();
                if (this.lexer.peek().type === tokenType_1.TokenType.equalsGreaterThan) {
                    // ( xxx ) =>
                    return true;
                }
            }
        }
        return false;
    };
    Parser.prototype.parseTypeOrTypePredicate = function () {
        var typePredicateVariable = this.isIdentifier() && this.tryParse(this.parseTypePredicatePrefix);
        var type = this.parseType();
        if (typePredicateVariable) {
            var result = new Nodes.TypePredicateNode();
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
        if (this.lexer.peek().type === tokenType_1.TokenType.is && !this.lexer.peek().hasLineBreakBeforeStar) {
            this.nextToken();
            return id;
        }
    };
    Parser.prototype.parseType = function () {
        // Nodes.The rules about 'yield' only apply to actual code/expression contexts.  Nodes.They don't
        // apply to 'type' contexts.  Nodes.So we disable these parameters here before moving on.
        return this.doOutsideOfContext(Nodes.NodeFlags.TypeExcludesFlags, this.parseTypeWorker);
    };
    Parser.prototype.parseTypeWorker = function () {
        if (this.isStartOfFunctionType()) {
            return this.parseFunctionOrConstructorType(tokenType_1.TokenType.FunctionType);
        }
        if (this.lexer.peek().type === tokenType_1.TokenType.new) {
            return this.parseFunctionOrConstructorType(tokenType_1.TokenType.ConstructorType);
        }
        return this.parseUnionTypeOrHigher();
    };
    Parser.prototype.parseTypeAnnotation = function () {
        return this.parseOptional(tokenType_1.TokenType.colon) ? this.parseType() : undefined;
    };
    // Nodes.EXPRESSIONS
    Parser.prototype.isStartOfLeftHandSideExpression = function () {
        switch (this.lexer.peek().type) {
            case tokenType_1.TokenType.this:
            case tokenType_1.TokenType.super:
            case tokenType_1.TokenType.null:
            case tokenType_1.TokenType.true:
            case tokenType_1.TokenType.false:
            case tokenType_1.TokenType.NumericLiteral:
            case tokenType_1.TokenType.StringLiteral:
            case tokenType_1.TokenType.NoSubstitutionTemplateLiteral:
            case tokenType_1.TokenType.TemplateHead:
            case tokenType_1.TokenType.openParen:
            case tokenType_1.TokenType.openBracket:
            case tokenType_1.TokenType.openBrace:
            case tokenType_1.TokenType.function:
            case tokenType_1.TokenType.class:
            case tokenType_1.TokenType.new:
            case tokenType_1.TokenType.slash:
            case tokenType_1.TokenType.slashEquals:
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
            case tokenType_1.TokenType.plus:
            case tokenType_1.TokenType.minus:
            case tokenType_1.TokenType.tilde:
            case tokenType_1.TokenType.exclamation:
            case tokenType_1.TokenType.delete:
            case tokenType_1.TokenType.typeof:
            case tokenType_1.TokenType.void:
            case tokenType_1.TokenType.plusPlus:
            case tokenType_1.TokenType.minusMinus:
            case tokenType_1.TokenType.lessThan:
            case tokenType_1.TokenType.await:
            case tokenType_1.TokenType.yield:
                // Nodes.Yield/await always starts an expression.  Nodes.Either it is an identifier (in which case
                // it is definitely an expression).  Nodes.Or it's a keyword (either because we're in
                // a generator or async function, or in strict mode (or both)) and it started a yield or await expression.
                return true;
            default:
                // Nodes.Error tolerance.  Nodes.If we see the start of some binary operator, we consider
                // that the start of an expression.  Nodes.That way we'll parse out a missing identifier,
                // give a good message about an identifier being missing, and then consume the
                // rest of the binary expression.
                if (this.isBinaryOperator()) {
                    return true;
                }
                return this.isIdentifier();
        }
    };
    Parser.prototype.isStartOfExpressionStatement = function () {
        // Nodes.As per the grammar, none of '{' or 'function' or 'class' can start an expression statement.
        return this.lexer.peek().type !== tokenType_1.TokenType.openBrace &&
            this.lexer.peek().type !== tokenType_1.TokenType.function &&
            this.lexer.peek().type !== tokenType_1.TokenType.class &&
            this.lexer.peek().type !== tokenType_1.TokenType.at &&
            this.isStartOfExpression();
    };
    Parser.prototype.parseExpression = function () {
        // Nodes.Expression[in]:
        //      Nodes.AssignmentExpression[in]
        //      Nodes.Expression[in] , Nodes.AssignmentExpression[in]
        // clear the decorator context when parsing Nodes.Expression, as it should be unambiguous when parsing a decorator
        var saveDecoratorContext = this.inDecoratorContext();
        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ false);
        }
        var expr = this.parseAssignmentExpressionOrHigher();
        var operatorToken;
        while ((operatorToken = this.parseOptionalToken(tokenType_1.TokenType.comma))) {
            expr = this.makeBinaryExpression(expr, operatorToken, this.parseAssignmentExpressionOrHigher());
        }
        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ true);
        }
        return expr;
    };
    Parser.prototype.parseInitializer = function (inParameter) {
        if (this.lexer.peek().type !== tokenType_1.TokenType.equals) {
            // It's not uncommon during typing for the user to miss writing the '=' this.lexer.peek().type.  Check if
            // there is no newline after the last this.lexer.peek().type and if we're on an expression.  If so, parse
            // this as an equals-value clause with a missing equals.
            // NOTE: There are two places where we allow equals-value clauses.  The first is in a
            // variable declarator.  The second is with a parameter.  For variable declarators
            // it's more likely that a { would be a allowed (as an object literal).  While this
            // is also allowed for parameters, the risk is that we consume the { as an object
            // literal when it really will be for the block following the parameter.
            if (this.lexer.peek().hasLineBreakBeforeStart || (inParameter && this.lexer.peek().type === tokenType_1.TokenType.openBrace) || !this.isStartOfExpression()) {
                // preceding line break, open brace in a parameter (likely a function body) or current this.lexer.peek().type is not an expression -
                // do not try to parse initializer
                return undefined;
            }
        }
        // Nodes.Initializer[Nodes.In, Nodes.Yield] :
        //     = Nodes.AssignmentExpression[?Nodes.In, ?Nodes.Yield]
        this.parseExpected(tokenType_1.TokenType.equals);
        return this.parseAssignmentExpressionOrHigher();
    };
    Parser.prototype.parseAssignmentExpressionOrHigher = function () {
        //  Nodes.AssignmentExpression[in,yield]:
        //      1) Nodes.ConditionalExpression[?in,?yield]
        //      2) Nodes.LeftHandSideExpression = Nodes.AssignmentExpression[?in,?yield]
        //      3) Nodes.LeftHandSideExpression Nodes.AssignmentOperator Nodes.AssignmentExpression[?in,?yield]
        //      4) Nodes.ArrowFunctionExpression[?in,?yield]
        //      5) Nodes.AsyncArrowFunctionExpression[in,yield,await]
        //      6) [+Nodes.Yield] Nodes.YieldExpression[?Nodes.In]
        //
        // Nodes.Note: for ease of implementation we treat productions '2' and '3' as the same thing.
        // (i.e. they're both Nodes.BinaryExpressions with an assignment operator in it).
        // Nodes.First, do the simple check if we have a Nodes.YieldExpression (production '5').
        if (this.isYieldExpression()) {
            return this.parseYieldExpression();
        }
        // Nodes.Then, check if we have an arrow function (production '4' and '5') that starts with a parenthesized
        // parameter list or is an async arrow function.
        // Nodes.AsyncArrowFunctionExpression:
        //      1) async[no Nodes.LineTerminator here]Nodes.AsyncArrowBindingIdentifier[?Nodes.Yield][no Nodes.LineTerminator here]=>Nodes.AsyncConciseBody[?Nodes.In]
        //      2) Nodes.CoverCallExpressionAndAsyncArrowHead[?Nodes.Yield, ?Nodes.Await][no Nodes.LineTerminator here]=>Nodes.AsyncConciseBody[?Nodes.In]
        // Nodes.Production (1) of Nodes.AsyncArrowFunctionExpression is parsed in "this.tryParseAsyncSimpleArrowFunctionExpression".
        // Nodes.And production (2) is parsed in "this.tryParseParenthesizedArrowFunctionExpression".
        //
        // Nodes.If we do successfully parse arrow-function, we must *not* recurse for productions 1, 2 or 3. Nodes.An Nodes.ArrowFunction is
        // not a  Nodes.LeftHandSideExpression, nor does it start a Nodes.ConditionalExpression.  Nodes.So we are done
        // with Nodes.AssignmentExpression if we see one.
        var arrowExpression = this.tryParseParenthesizedArrowFunctionExpression() || this.tryParseAsyncSimpleArrowFunctionExpression();
        if (arrowExpression) {
            return arrowExpression;
        }
        // Nodes.Now try to see if we're in production '1', '2' or '3'.  A conditional expression can
        // start with a Nodes.LogicalOrExpression, while the assignment productions can only start with
        // Nodes.LeftHandSideExpressions.
        //
        // Nodes.So, first, we try to just parse out a Nodes.BinaryExpression.  Nodes.If we get something that is a
        // Nodes.LeftHandSide or higher, then we can try to parse out the assignment expression part.
        // Nodes.Otherwise, we try to parse out the conditional expression bit.  Nodes.We want to allow any
        // binary expression here, so we pass in the 'lowest' precedence here so that it matches
        // and consumes anything.
        var expr = this.parseBinaryExpressionOrHigher(/*precedence*/ 0);
        // Nodes.To avoid a look-ahead, we did not handle the case of an arrow function with a single un-parenthesized
        // parameter ('x => ...') above. Nodes.We handle it here by checking if the parsed expression was a single
        // identifier and the current this.lexer.peek().type is an arrow.
        if (expr.kind === tokenType_1.TokenType.Identifier && this.lexer.peek().type === tokenType_1.TokenType.equalsGreaterThan) {
            return this.parseSimpleArrowFunctionExpression(expr);
        }
        // Nodes.Now see if we might be in cases '2' or '3'.
        // Nodes.If the expression was a Nodes.LHS expression, and we have an assignment operator, then
        // we're in '2' or '3'. Nodes.Consume the assignment and return.
        //
        // Nodes.Note: we call this.reScanGreaterToken so that we get an appropriately merged this.lexer.peek().type
        // for cases like > > =  becoming >>=
        if (isLeftHandSideExpression(expr) && isAssignmentOperator(this.reScanGreaterToken())) {
            return this.makeBinaryExpression(expr, this.parseTokenNode(), this.parseAssignmentExpressionOrHigher());
        }
        // Nodes.It wasn't an assignment or a lambda.  Nodes.This is a conditional expression:
        return this.parseConditionalExpressionRest(expr);
    };
    Parser.prototype.isYieldExpression = function () {
        if (this.lexer.peek().type === tokenType_1.TokenType.yield) {
            // Nodes.If we have a 'yield' keyword, and this is a context where yield expressions are
            // allowed, then definitely parse out a yield expression.
            if (this.inYieldContext()) {
                return true;
            }
            // Nodes.We're in a context where 'yield expr' is not allowed.  Nodes.However, if we can
            // definitely tell that the user was trying to parse a 'yield expr' and not
            // just a normal expr that start with a 'yield' identifier, then parse out
            // a 'yield expr'.  Nodes.We can then report an error later that they are only
            // allowed in generator expressions.
            //
            // for example, if we see 'yield(foo)', then we'll have to treat that as an
            // invocation expression of something called 'yield'.  Nodes.However, if we have
            // 'yield foo' then that is not legal as a normal expression, so we can
            // definitely recognize this as a yield expression.
            //
            // for now we just check if the next this.lexer.peek().type is an identifier.  Nodes.More heuristics
            // can be added here later as necessary.  Nodes.We just need to make sure that we
            // don't accidentally consume something legal.
            return this.lookAhead(this.nextTokenIsIdentifierOrKeywordOrNumberOnSameLine);
        }
        return false;
    };
    Parser.prototype.nextTokenIsIdentifierOnSameLine = function () {
        this.nextToken();
        return !this.lexer.peek().hasLineBreakBeforeStart && this.isIdentifier();
    };
    Parser.prototype.parseYieldExpression = function () {
        var result = new Nodes.YieldExpression();
        // Nodes.YieldExpression[Nodes.In] :
        //      yield
        //      yield [no Nodes.LineTerminator here] [Nodes.Lexical goal Nodes.InputElementRegExp]Nodes.AssignmentExpression[?Nodes.In, Nodes.Yield]
        //      yield [no Nodes.LineTerminator here] * [Nodes.Lexical goal Nodes.InputElementRegExp]Nodes.AssignmentExpression[?Nodes.In, Nodes.Yield]
        this.nextToken();
        if (!this.lexer.peek().hasLineBreakBeforeStar &&
            (this.lexer.peek().type === tokenType_1.TokenType.asterisk || this.isStartOfExpression())) {
            result.asteriskToken = this.parseOptionalToken(tokenType_1.TokenType.asterisk);
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
        console.assert(this.lexer.peek().type === tokenType_1.TokenType.equalsGreaterThan, "this.parseSimpleArrowFunctionExpression should only have been called if we had a =>");
        var result;
        if (asyncModifier) {
            result = new Nodes.ArrowFunction();
            this.setModifiers(result, asyncModifier);
        }
        else {
            result = new Nodes.ArrowFunction();
        }
        var parameter = new Nodes.ParameterDeclaration();
        parameter.name = identifier;
        this.finishNode(parameter);
        result.parameters = [parameter];
        result.parameters.pos = parameter.pos;
        result.parameters.end = parameter.end;
        result.equalsGreaterThanToken = this.parseExpectedToken(tokenType_1.TokenType.equalsGreaterThan, /*reportAtCurrentPosition*/ false, Nodes.Diagnostics._0_expected, "=>");
        result.body = this.parseArrowFunctionExpressionBody(/*isAsync*/ !!asyncModifier);
        return result;
    };
    Parser.prototype.tryParseParenthesizedArrowFunctionExpression = function () {
        var triState = this.isParenthesizedArrowFunctionExpression();
        if (triState === Nodes.Tristate.False) {
            // Nodes.It's definitely not a parenthesized arrow function expression.
            return undefined;
        }
        // Nodes.If we definitely have an arrow function, then we can just parse one, not requiring a
        // following => or { this.lexer.peek().type. Nodes.Otherwise, we *might* have an arrow function.  Nodes.Try to parse
        // it out, but don't allow any ambiguity, and return 'undefined' if this could be an
        // expression instead.
        var arrowFunction = triState === Nodes.Tristate.True
            ? this.parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ true)
            : this.tryParse(this.parsePossibleParenthesizedArrowFunctionExpressionHead);
        if (!arrowFunction) {
            // Nodes.Didn't appear to actually be a parenthesized arrow function.  Nodes.Just bail out.
            return undefined;
        }
        var isAsync = !!(arrowFunction.flags & Nodes.NodeFlags.Async);
        // Nodes.If we have an arrow, then try to parse the body. Nodes.Even if not, try to parse if we
        // have an opening brace, just in case we're in an error state.
        var lastToken = this.lexer.peek().type;
        arrowFunction.equalsGreaterThanToken = this.parseExpectedToken(tokenType_1.TokenType.equalsGreaterThan, /*reportAtCurrentPosition*/ false, Nodes.Diagnostics._0_expected, "=>");
        arrowFunction.body = (lastToken === tokenType_1.TokenType.equalsGreaterThan || lastToken === tokenType_1.TokenType.openBrace)
            ? this.parseArrowFunctionExpressionBody(isAsync)
            : this.parseIdentifier();
        return this.finishNode(arrowFunction);
    };
    //  Nodes.True        -> Nodes.We definitely expect a parenthesized arrow function here.
    //  Nodes.False       -> Nodes.There *cannot* be a parenthesized arrow function here.
    //  Nodes.Unknown     -> Nodes.There *might* be a parenthesized arrow function here.
    //                 Nodes.Speculatively look ahead to be sure, and rollback if not.
    Parser.prototype.isParenthesizedArrowFunctionExpression = function () {
        if (this.lexer.peek().type === tokenType_1.TokenType.openParen || this.lexer.peek().type === tokenType_1.TokenType.lessThan || this.lexer.peek().type === tokenType_1.TokenType.async) {
            return this.lookAhead(this.isParenthesizedArrowFunctionExpressionWorker);
        }
        if (this.lexer.peek().type === tokenType_1.TokenType.equalsGreaterThan) {
            // Nodes.ERROR Nodes.RECOVERY Nodes.TWEAK:
            // Nodes.If we see a standalone => try to parse it as an arrow function expression as that's
            // likely what the user intended to write.
            return Nodes.Tristate.True;
        }
        // Nodes.Definitely not a parenthesized arrow function.
        return Nodes.Tristate.False;
    };
    Parser.prototype.isParenthesizedArrowFunctionExpressionWorker = function () {
        var _this = this;
        if (this.lexer.peek().type === tokenType_1.TokenType.async) {
            this.nextToken();
            if (this.lexer.peek().hasLineBreakBeforeStar) {
                return Nodes.Tristate.False;
            }
            if (this.lexer.peek().type !== tokenType_1.TokenType.openParen && this.lexer.peek().type !== tokenType_1.TokenType.lessThan) {
                return Nodes.Tristate.False;
            }
        }
        var first = this.lexer.peek().type;
        var second = this.nextToken();
        if (first === tokenType_1.TokenType.openParen) {
            if (second === tokenType_1.TokenType.closeParen) {
                // Nodes.Simple cases: "() =>", "(): ", and  "() {".
                // Nodes.This is an arrow function with no parameters.
                // Nodes.The last one is not actually an arrow function,
                // but this is probably what the user intended.
                var third = this.nextToken();
                switch (third) {
                    case tokenType_1.TokenType.equalsGreaterThan:
                    case tokenType_1.TokenType.colon:
                    case tokenType_1.TokenType.openBrace:
                        return Nodes.Tristate.True;
                    default:
                        return Nodes.Tristate.False;
                }
            }
            // Nodes.If encounter "([" or "({", this could be the start of a binding pattern.
            // Nodes.Examples:
            //      ([ x ]) => { }
            //      ({ x }) => { }
            //      ([ x ])
            //      ({ x })
            if (second === tokenType_1.TokenType.openBracket || second === tokenType_1.TokenType.openBrace) {
                return Nodes.Tristate.Unknown;
            }
            // Nodes.Simple case: "(..."
            // Nodes.This is an arrow function with a rest parameter.
            if (second === tokenType_1.TokenType.dotDotDot) {
                return Nodes.Tristate.True;
            }
            // Nodes.If we had "(" followed by something that's not an identifier,
            // then this definitely doesn't look like a lambda.
            // Nodes.Note: we could be a little more lenient and allow
            // "(public" or "(private". Nodes.These would not ever actually be allowed,
            // but we could provide a good error message instead of bailing out.
            if (!this.isIdentifier()) {
                return Nodes.Tristate.False;
            }
            // Nodes.If we have something like "(a:", then we must have a
            // type-annotated parameter in an arrow function expression.
            if (this.nextToken() === tokenType_1.TokenType.colon) {
                return Nodes.Tristate.True;
            }
            // Nodes.This *could* be a parenthesized arrow function.
            // Nodes.Return Nodes.Unknown to let the caller know.
            return Nodes.Tristate.Unknown;
        }
        else {
            console.assert(first === tokenType_1.TokenType.lessThan);
            // Nodes.If we have "<" not followed by an identifier,
            // then this definitely is not an arrow function.
            if (!this.isIdentifier()) {
                return Nodes.Tristate.False;
            }
            // Nodes.JSX overrides
            if (this.sourceFile.languageVariant === Nodes.LanguageVariant.JSX) {
                var isArrowFunctionInJsx = this.lookAhead(function () {
                    var third = _this.nextToken();
                    if (third === tokenType_1.TokenType.extends) {
                        var fourth = _this.nextToken();
                        switch (fourth) {
                            case tokenType_1.TokenType.equals:
                            case tokenType_1.TokenType.greaterThan:
                                return false;
                            default:
                                return true;
                        }
                    }
                    else if (third === tokenType_1.TokenType.comma) {
                        return true;
                    }
                    return false;
                });
                if (isArrowFunctionInJsx) {
                    return Nodes.Tristate.True;
                }
                return Nodes.Tristate.False;
            }
            // Nodes.This *could* be a parenthesized arrow function.
            return Nodes.Tristate.Unknown;
        }
    };
    Parser.prototype.parsePossibleParenthesizedArrowFunctionExpressionHead = function () {
        return this.parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ false);
    };
    Parser.prototype.tryParseAsyncSimpleArrowFunctionExpression = function () {
        // Nodes.We do a check here so that we won't be doing unnecessarily call to "this.lookAhead"
        if (this.lexer.peek().type === tokenType_1.TokenType.async) {
            var isUnParenthesizedAsyncArrowFunction = this.lookAhead(this.isUnParenthesizedAsyncArrowFunctionWorker);
            if (isUnParenthesizedAsyncArrowFunction === Nodes.Tristate.True) {
                var asyncModifier = this.parseModifiersForArrowFunction();
                var expr = this.parseBinaryExpressionOrHigher(/*precedence*/ 0);
                return this.parseSimpleArrowFunctionExpression(expr, asyncModifier);
            }
        }
        return undefined;
    };
    Parser.prototype.isUnParenthesizedAsyncArrowFunctionWorker = function () {
        // Nodes.AsyncArrowFunctionExpression:
        //      1) async[no Nodes.LineTerminator here]Nodes.AsyncArrowBindingIdentifier[?Nodes.Yield][no Nodes.LineTerminator here]=>Nodes.AsyncConciseBody[?Nodes.In]
        //      2) Nodes.CoverCallExpressionAndAsyncArrowHead[?Nodes.Yield, ?Nodes.Await][no Nodes.LineTerminator here]=>Nodes.AsyncConciseBody[?Nodes.In]
        if (this.lexer.peek().type === tokenType_1.TokenType.async) {
            this.nextToken();
            // Nodes.If the "async" is followed by "=>" this.lexer.peek().type then it is not a begining of an async arrow-function
            // but instead a simple arrow-function which will be parsed inside "this.parseAssignmentExpressionOrHigher"
            if (this.lexer.peek().hasLineBreakBeforeStar || this.lexer.peek().type === tokenType_1.TokenType.equalsGreaterThan) {
                return Nodes.Tristate.False;
            }
            // Nodes.Check for un-parenthesized Nodes.AsyncArrowFunction
            var expr = this.parseBinaryExpressionOrHigher(/*precedence*/ 0);
            if (!this.lexer.peek().hasLineBreakBeforeStar && expr.kind === tokenType_1.TokenType.Identifier && this.lexer.peek().type === tokenType_1.TokenType.equalsGreaterThan) {
                return Nodes.Tristate.True;
            }
        }
        return Nodes.Tristate.False;
    };
    Parser.prototype.parseParenthesizedArrowFunctionExpressionHead = function (allowAmbiguity) {
        var result = new Nodes.ArrowFunction();
        this.setModifiers(result, this.parseModifiersForArrowFunction());
        var isAsync = !!(result.flags & Nodes.NodeFlags.Async);
        // Nodes.Arrow functions are never generators.
        //
        // Nodes.If we're speculatively parsing a signature for a parenthesized arrow function, then
        // we have to have a complete parameter list.  Nodes.Otherwise we might see something like
        // a => (b => c)
        // Nodes.And think that "(b =>" was actually a parenthesized arrow function with a missing
        // close paren.
        this.fillSignature(tokenType_1.TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ !allowAmbiguity, result);
        // Nodes.If we couldn't get parameters, we definitely could not parse out an arrow function.
        if (!result.parameters) {
            return undefined;
        }
        // Nodes.Parsing a signature isn't enough.
        // Nodes.Parenthesized arrow signatures often look like other valid expressions.
        // Nodes.For instance:
        //  - "(x = 10)" is an assignment expression parsed as a signature with a default parameter value.
        //  - "(x,y)" is a comma expression parsed as a signature with two parameters.
        //  - "a ? (b): c" will have "(b):" parsed as a signature with a return type annotation.
        //
        // Nodes.So we need just a bit of lookahead to ensure that it can only be a signature.
        if (!allowAmbiguity && this.lexer.peek().type !== tokenType_1.TokenType.equalsGreaterThan && this.lexer.peek().type !== tokenType_1.TokenType.openBrace) {
            // Nodes.Returning undefined here will cause our caller to rewind to where we started from.
            return undefined;
        }
        return result;
    };
    Parser.prototype.parseArrowFunctionExpressionBody = function (isAsync) {
        if (this.lexer.peek().type === tokenType_1.TokenType.openBrace) {
            return this.parseFunctionBlock(/*allowYield*/ false, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);
        }
        if (this.lexer.peek().type !== tokenType_1.TokenType.semicolon &&
            this.lexer.peek().type !== tokenType_1.TokenType.function &&
            this.lexer.peek().type !== tokenType_1.TokenType.class &&
            this.isStartOfStatement() &&
            !this.isStartOfExpressionStatement()) {
            // Nodes.Check if we got a plain statement (i.e. no expression-statements, no function/class expressions/declarations)
            //
            // Nodes.Here we try to recover from a potential error situation in the case where the
            // user meant to supply a block. Nodes.For example, if the user wrote:
            //
            //  a =>
            //      let v = 0;
            //  }
            //
            // they may be missing an open brace.  Nodes.Check to see if that's the case so we can
            // try to recover better.  Nodes.If we don't do this, then the next close curly we see may end
            // up preemptively closing the containing construct.
            //
            // Nodes.Note: even when 'ignoreMissingOpenBrace' is passed as true, parseBody will still error.
            return this.parseFunctionBlock(/*allowYield*/ false, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ true);
        }
        return isAsync
            ? this.doInAwaitContext(this.parseAssignmentExpressionOrHigher)
            : this.doOutsideOfAwaitContext(this.parseAssignmentExpressionOrHigher);
    };
    Parser.prototype.parseConditionalExpressionRest = function (leftOperand) {
        // Nodes.Note: we are passed in an expression which was produced from this.parseBinaryExpressionOrHigher.
        var questionToken = this.parseOptionalToken(tokenType_1.TokenType.question);
        if (!questionToken) {
            return leftOperand;
        }
        // Nodes.Note: we explicitly 'allowIn' in the whenTrue part of the condition expression, and
        // we do not that for the 'whenFalse' part.
        var result = new Nodes.ConditionalExpression();
        result.condition = leftOperand;
        result.questionToken = questionToken;
        result.whenTrue = this.doOutsideOfContext(this.disallowInAndDecoratorContext, this.parseAssignmentExpressionOrHigher);
        result.colonToken = this.parseExpectedToken(tokenType_1.TokenType.colon, /*reportAtCurrentPosition*/ false, Nodes.Diagnostics._0_expected, tokenToString(tokenType_1.TokenType.colon));
        result.whenFalse = this.parseAssignmentExpressionOrHigher();
        return result;
    };
    Parser.prototype.parseBinaryExpressionOrHigher = function (precedence) {
        var leftOperand = this.parseUnaryExpressionOrHigher();
        return this.parseBinaryExpressionRest(precedence, leftOperand);
    };
    Parser.prototype.isInOrOfKeyword = function (t) {
        return t === tokenType_1.TokenType.in || t === tokenType_1.TokenType.of;
    };
    Parser.prototype.parseBinaryExpressionRest = function (precedence, leftOperand) {
        while (true) {
            // Nodes.We either have a binary operator here, or we're finished.  Nodes.We call
            // this.reScanGreaterToken so that we merge this.lexer.peek().type sequences like > and = into >=
            this.reScanGreaterToken();
            var newPrecedence = getBinaryOperatorPrecedence();
            // Nodes.Check the precedence to see if we should "take" this operator
            // - Nodes.For left associative operator (all operator but **), consume the operator,
            //   recursively call the function below, and parse binaryExpression as a rightOperand
            //   of the caller if the new precedence of the operator is greater then or equal to the current precedence.
            //   Nodes.For example:
            //      a - b - c;
            //            ^this.lexer.peek().type; leftOperand = b. Nodes.Return b to the caller as a rightOperand
            //      a * b - c
            //            ^this.lexer.peek().type; leftOperand = b. Nodes.Return b to the caller as a rightOperand
            //      a - b * c;
            //            ^this.lexer.peek().type; leftOperand = b. Nodes.Return b * c to the caller as a rightOperand
            // - Nodes.For right associative operator (**), consume the operator, recursively call the function
            //   and parse binaryExpression as a rightOperand of the caller if the new precedence of
            //   the operator is strictly grater than the current precedence
            //   Nodes.For example:
            //      a ** b ** c;
            //             ^^this.lexer.peek().type; leftOperand = b. Nodes.Return b ** c to the caller as a rightOperand
            //      a - b ** c;
            //            ^^this.lexer.peek().type; leftOperand = b. Nodes.Return b ** c to the caller as a rightOperand
            //      a ** b - c
            //             ^this.lexer.peek().type; leftOperand = b. Nodes.Return b to the caller as a rightOperand
            var consumeCurrentOperator = this.lexer.peek().type === tokenType_1.TokenType.asteriskAsterisk ?
                newPrecedence >= precedence :
                newPrecedence > precedence;
            if (!consumeCurrentOperator) {
                break;
            }
            if (this.lexer.peek().type === tokenType_1.TokenType.in && this.inDisallowInContext()) {
                break;
            }
            if (this.lexer.peek().type === tokenType_1.TokenType.as) {
                // Nodes.Make sure we *do* perform Nodes.ASI for constructs like this:
                //    var x = foo
                //    as (Nodes.Bar)
                // Nodes.This should be parsed as an initialized variable, followed
                // by a function call to 'as' with the argument 'Nodes.Bar'
                if (this.lexer.peek().hasLineBreakBeforeStar) {
                    break;
                }
                else {
                    this.nextToken();
                    leftOperand = this.makeAsExpression(leftOperand, this.parseType());
                }
            }
            else {
                leftOperand = this.makeBinaryExpression(leftOperand, this.parseTokenNode(), this.parseBinaryExpressionOrHigher(newPrecedence));
            }
        }
        return leftOperand;
    };
    Parser.prototype.isBinaryOperator = function () {
        if (this.inDisallowInContext() && this.lexer.peek().type === tokenType_1.TokenType.in) {
            return false;
        }
        return getBinaryOperatorPrecedence() > 0;
    };
    Parser.prototype.makeBinaryExpression = function (left, operatorToken, right) {
        var result = new Nodes.BinaryExpression();
        result.left = left;
        result.operatorToken = operatorToken;
        result.right = right;
        return result;
    };
    Parser.prototype.makeAsExpression = function (left, right) {
        var result = new Nodes.AsExpression();
        result.expression = left;
        result.type = right;
        return result;
    };
    Parser.prototype.parsePrefixUnaryExpression = function () {
        var result = new Nodes.PrefixUnaryExpression();
        result.operator = this.lexer.peek().type;
        this.nextToken();
        result.operand = this.parseSimpleUnaryExpression();
        return result;
    };
    Parser.prototype.parseDeleteExpression = function () {
        var result = new Nodes.DeleteExpression();
        this.nextToken();
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    };
    Parser.prototype.parseTypeOfExpression = function () {
        var result = new Nodes.TypeOfExpression();
        this.nextToken();
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    };
    Parser.prototype.parseVoidExpression = function () {
        var result = new Nodes.VoidExpression();
        this.nextToken();
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    };
    Parser.prototype.isAwaitExpression = function () {
        if (this.lexer.peek().type === tokenType_1.TokenType.await) {
            if (this.inAwaitContext()) {
                return true;
            }
            // here we are using similar heuristics as 'this.isYieldExpression'
            return this.lookAhead(this.nextTokenIsIdentifierOnSameLine);
        }
        return false;
    };
    Parser.prototype.parseAwaitExpression = function () {
        var result = new Nodes.AwaitExpression();
        this.nextToken();
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    };
    /**
     * Nodes.Parse Nodes.ES7 unary expression and await expression
     *
     * Nodes.ES7 Nodes.UnaryExpression:
     *      1) Nodes.SimpleUnaryExpression[?yield]
     *      2) Nodes.IncrementExpression[?yield] ** Nodes.UnaryExpression[?yield]
     */
    Parser.prototype.parseUnaryExpressionOrHigher = function () {
        if (this.isAwaitExpression()) {
            return this.parseAwaitExpression();
        }
        if (this.isIncrementExpression()) {
            var incrementExpression = this.parseIncrementExpression();
            return this.lexer.peek().type === tokenType_1.TokenType.asteriskAsterisk ?
                this.parseBinaryExpressionRest(getBinaryOperatorPrecedence(), incrementExpression) :
                incrementExpression;
        }
        var unaryOperator = this.lexer.peek().type;
        var simpleUnaryExpression = this.parseSimpleUnaryExpression();
        if (this.lexer.peek().type === tokenType_1.TokenType.asteriskAsterisk) {
            var start = skipTrivia(this.sourceText, simpleUnaryExpression.pos);
            if (simpleUnaryExpression.kind === tokenType_1.TokenType.TypeAssertionExpression) {
                this.parseErrorAtPosition(start, simpleUnaryExpression.end - start, Nodes.Diagnostics.A_type_assertion_expression_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses);
            }
            else {
                this.parseErrorAtPosition(start, simpleUnaryExpression.end - start, Nodes.Diagnostics.An_unary_expression_with_the_0_operator_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses, tokenToString(unaryOperator));
            }
        }
        return simpleUnaryExpression;
    };
    /**
     * Nodes.Parse Nodes.ES7 simple-unary expression or higher:
     *
     * Nodes.ES7 Nodes.SimpleUnaryExpression:
     *      1) Nodes.IncrementExpression[?yield]
     *      2) delete Nodes.UnaryExpression[?yield]
     *      3) void Nodes.UnaryExpression[?yield]
     *      4) typeof Nodes.UnaryExpression[?yield]
     *      5) + Nodes.UnaryExpression[?yield]
     *      6) - Nodes.UnaryExpression[?yield]
     *      7) ~ Nodes.UnaryExpression[?yield]
     *      8) ! Nodes.UnaryExpression[?yield]
     */
    Parser.prototype.parseSimpleUnaryExpression = function () {
        switch (this.lexer.peek().type) {
            case tokenType_1.TokenType.plus:
            case tokenType_1.TokenType.minus:
            case tokenType_1.TokenType.tilde:
            case tokenType_1.TokenType.exclamation:
                return this.parsePrefixUnaryExpression();
            case tokenType_1.TokenType.delete:
                return this.parseDeleteExpression();
            case tokenType_1.TokenType.typeof:
                return this.parseTypeOfExpression();
            case tokenType_1.TokenType.void:
                return this.parseVoidExpression();
            case tokenType_1.TokenType.lessThan:
                // Nodes.This is modified Nodes.UnaryExpression grammar in Nodes.TypeScript
                //  Nodes.UnaryExpression (modified):
                //      < type > Nodes.UnaryExpression
                return this.parseTypeAssertion();
            default:
                return this.parseIncrementExpression();
        }
    };
    /**
     * Nodes.Check if the current this.lexer.peek().type can possibly be an Nodes.ES7 increment expression.
     *
     * Nodes.ES7 Nodes.IncrementExpression:
     *      Nodes.LeftHandSideExpression[?Nodes.Yield]
     *      Nodes.LeftHandSideExpression[?Nodes.Yield][no Nodes.LineTerminator here]++
     *      Nodes.LeftHandSideExpression[?Nodes.Yield][no Nodes.LineTerminator here]--
     *      ++Nodes.LeftHandSideExpression[?Nodes.Yield]
     *      --Nodes.LeftHandSideExpression[?Nodes.Yield]
     */
    Parser.prototype.isIncrementExpression = function () {
        // Nodes.This function is called inside parseUnaryExpression to decide
        // whether to call this.parseSimpleUnaryExpression or call this.parseIncrementExpression directly
        switch (this.lexer.peek().type) {
            case tokenType_1.TokenType.plus:
            case tokenType_1.TokenType.minus:
            case tokenType_1.TokenType.tilde:
            case tokenType_1.TokenType.exclamation:
            case tokenType_1.TokenType.delete:
            case tokenType_1.TokenType.typeof:
            case tokenType_1.TokenType.void:
                return false;
            case tokenType_1.TokenType.lessThan:
                // Nodes.If we are not in Nodes.JSX context, we are parsing Nodes.TypeAssertion which is an Nodes.UnaryExpression
                if (this.sourceFile.languageVariant !== Nodes.LanguageVariant.JSX) {
                    return false;
                }
            // Nodes.We are in Nodes.JSX context and the this.lexer.peek().type is part of Nodes.JSXElement.
            // Nodes.Fall through
            default:
                return true;
        }
    };
    /**
     * Nodes.Parse Nodes.ES7 Nodes.IncrementExpression. Nodes.IncrementExpression is used instead of Nodes.ES6's Nodes.PostFixExpression.
     *
     * Nodes.ES7 Nodes.IncrementExpression[yield]:
     *      1) Nodes.LeftHandSideExpression[?yield]
     *      2) Nodes.LeftHandSideExpression[?yield] [[no Nodes.LineTerminator here]]++
     *      3) Nodes.LeftHandSideExpression[?yield] [[no Nodes.LineTerminator here]]--
     *      4) ++Nodes.LeftHandSideExpression[?yield]
     *      5) --Nodes.LeftHandSideExpression[?yield]
     * Nodes.In Nodes.TypeScript (2), (3) are parsed as Nodes.PostfixUnaryExpression. (4), (5) are parsed as Nodes.PrefixUnaryExpression
     */
    Parser.prototype.parseIncrementExpression = function () {
        if (this.lexer.peek().type === tokenType_1.TokenType.plusPlus || this.lexer.peek().type === tokenType_1.TokenType.minusMinus) {
            var result = new Nodes.PrefixUnaryExpression();
            result.operator = this.lexer.peek().type;
            this.nextToken();
            result.operand = this.parseLeftHandSideExpressionOrHigher();
            return result;
        }
        else if (this.sourceFile.languageVariant === Nodes.LanguageVariant.JSX && this.lexer.peek().type === tokenType_1.TokenType.lessThan && this.lookAhead(this.nextTokenIsIdentifierOrKeyword)) {
            // Nodes.JSXElement is part of primaryExpression
            return this.parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ true);
        }
        var expression = this.parseLeftHandSideExpressionOrHigher();
        console.assert(isLeftHandSideExpression(expression));
        if ((this.lexer.peek().type === tokenType_1.TokenType.plusPlus || this.lexer.peek().type === tokenType_1.TokenType.minusMinus) && !this.lexer.peek().hasLineBreakBeforeStar) {
            var result = new Nodes.PostfixUnaryExpression();
            result.operand = expression;
            result.operator = this.lexer.peek().type;
            this.nextToken();
            return result;
        }
        return expression;
    };
    Parser.prototype.parseLeftHandSideExpressionOrHigher = function () {
        // Nodes.Original Nodes.Ecma:
        // Nodes.LeftHandSideExpression: Nodes.See 11.2
        //      Nodes.NewExpression
        //      Nodes.CallExpression
        //
        // Nodes.Our simplification:
        //
        // Nodes.LeftHandSideExpression: Nodes.See 11.2
        //      Nodes.MemberExpression
        //      Nodes.CallExpression
        //
        // Nodes.See comment in this.parseMemberExpressionOrHigher on how we replaced Nodes.NewExpression with
        // Nodes.MemberExpression to make our lives easier.
        //
        // to best understand the below code, it's important to see how Nodes.CallExpression expands
        // out into its own productions:
        //
        // Nodes.CallExpression:
        //      Nodes.MemberExpression Nodes.Arguments
        //      Nodes.CallExpression Nodes.Arguments
        //      Nodes.CallExpression[Nodes.Expression]
        //      Nodes.CallExpression.IdentifierName
        //      super   (   Nodes.ArgumentListopt   )
        //      super.IdentifierName
        //
        // Nodes.Because of the recursion in these calls, we need to bottom out first.  Nodes.There are two
        // bottom out states we can run into.  Nodes.Either we see 'super' which must start either of
        // the last two Nodes.CallExpression productions.  Nodes.Or we have a Nodes.MemberExpression which either
        // completes the Nodes.LeftHandSideExpression, or starts the beginning of the first four
        // Nodes.CallExpression productions.
        var expression = this.lexer.peek().type === tokenType_1.TokenType.super
            ? this.parseSuperExpression()
            : this.parseMemberExpressionOrHigher();
        // Nodes.Now, we *may* be complete.  Nodes.However, we might have consumed the start of a
        // Nodes.CallExpression.  Nodes.As such, we need to consume the rest of it here to be complete.
        return this.parseCallExpressionRest(expression);
    };
    Parser.prototype.parseMemberExpressionOrHigher = function () {
        // Nodes.Note: to make our lives simpler, we decompose the the Nodes.NewExpression productions and
        // place Nodes.ObjectCreationExpression and Nodes.FunctionExpression into Nodes.PrimaryExpression.
        // like so:
        //
        //   Nodes.PrimaryExpression : Nodes.See 11.1
        //      this
        //      Nodes.Identifier
        //      Nodes.Literal
        //      Nodes.ArrayLiteral
        //      Nodes.ObjectLiteral
        //      (Nodes.Expression)
        //      Nodes.FunctionExpression
        //      new Nodes.MemberExpression Nodes.Arguments?
        //
        //   Nodes.MemberExpression : Nodes.See 11.2
        //      Nodes.PrimaryExpression
        //      Nodes.MemberExpression[Nodes.Expression]
        //      Nodes.MemberExpression.IdentifierName
        //
        //   Nodes.CallExpression : Nodes.See 11.2
        //      Nodes.MemberExpression
        //      Nodes.CallExpression Nodes.Arguments
        //      Nodes.CallExpression[Nodes.Expression]
        //      Nodes.CallExpression.IdentifierName
        //
        // Nodes.Technically this is ambiguous.  i.e. Nodes.CallExpression defines:
        //
        //   Nodes.CallExpression:
        //      Nodes.CallExpression Nodes.Arguments
        //
        // Nodes.If you see: "new Nodes.Foo()"
        //
        // Nodes.Then that could be treated as a single Nodes.ObjectCreationExpression, or it could be
        // treated as the invocation of "new Nodes.Foo".  Nodes.We disambiguate that in code (to match
        // the original grammar) by making sure that if we see an Nodes.ObjectCreationExpression
        // we always consume arguments if they are there. Nodes.So we treat "new Nodes.Foo()" as an
        // object creation only, and not at all as an invocation)  Nodes.Another way to think
        // about this is that for every "new" that we see, we will consume an argument list if
        // it is there as part of the *associated* object creation result.  Nodes.Any additional
        // argument lists we see, will become invocation expressions.
        //
        // Nodes.Because there are no other places in the grammar now that refer to Nodes.FunctionExpression
        // or Nodes.ObjectCreationExpression, it is safe to push down into the Nodes.PrimaryExpression
        // production.
        //
        // Nodes.Because Nodes.CallExpression and Nodes.MemberExpression are left recursive, we need to bottom out
        // of the recursion immediately.  Nodes.So we parse out a primary expression to start with.
        var expression = this.parsePrimaryExpression();
        return this.parseMemberExpressionRest(expression);
    };
    Parser.prototype.parseSuperExpression = function () {
        var expression = this.parseTokenNode();
        if (this.lexer.peek().type === tokenType_1.TokenType.openParen || this.lexer.peek().type === tokenType_1.TokenType.dot || this.lexer.peek().type === tokenType_1.TokenType.openBracket) {
            return expression;
        }
        // Nodes.If we have seen "super" it must be followed by '(' or '.'.
        // Nodes.If it wasn't then just try to parse out a '.' and report an error.
        var result = new Nodes.PropertyAccessExpression();
        result.expression = expression;
        this.parseExpectedToken(tokenType_1.TokenType.dot, /*reportAtCurrentPosition*/ false, Nodes.Diagnostics.super_must_be_followed_by_an_argument_list_or_member_access);
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
        if (lhs.kind === tokenType_1.TokenType.this) {
            return true;
        }
        // Nodes.If we are at this statement then we must have Nodes.PropertyAccessExpression and because tag name in Nodes.Jsx element can only
        // take forms of Nodes.JsxTagNameExpression which includes an identifier, "this" expression, or another propertyAccessExpression
        // it is safe to case the expression property as such. Nodes.See this.parseJsxElementName for how we parse tag name in Nodes.Jsx element
        return lhs.name.text === rhs.name.text &&
            this.tagNamesAreEquivalent(lhs.expression, rhs.expression);
    };
    Parser.prototype.parseJsxElementOrSelfClosingElement = function (inExpressionContext) {
        var _this = this;
        var opening = this.parseJsxOpeningOrSelfClosingElement(inExpressionContext);
        let;
        this.result;
        Nodes.JsxElement | Nodes.JsxSelfClosingElement;
        if (opening.kind === tokenType_1.TokenType.JsxOpeningElement) {
            var result = new Nodes.JsxElement();
            result.openingElement = opening;
            result.children = this.parseJsxChildren(result.openingElement.tagName);
            result.closingElement = this.parseJsxClosingElement(inExpressionContext);
            if (!this.tagNamesAreEquivalent(result.openingElement.tagName, result.closingElement.tagName)) {
                this.parseErrorAtPosition(result.closingElement.pos, result.closingElement.end - result.closingElement.pos, Nodes.Diagnostics.Expected_corresponding_JSX_closing_tag_for_0, getTextOfNodeFromSourceText(this.sourceText, result.openingElement.tagName));
            }
            this.result = result;
        }
        else {
            console.assert(opening.kind === tokenType_1.TokenType.JsxSelfClosingElement);
            // Nodes.Nothing else to do for self-closing elements
            this.result = opening;
        }
        // Nodes.If the user writes the invalid code '<div></div><div></div>' in an expression context (i.e. not wrapped in
        // an enclosing tag), we'll naively try to parse   ^ this as a 'less than' operator and the remainder of the tag
        // as garbage, which will cause the formatter to badly mangle the Nodes.JSX. Nodes.Perform a speculative parse of a Nodes.JSX
        // element if we see a < this.lexer.peek().type so that we can wrap it in a synthetic binary expression so the formatter
        // does less damage and we can report a better error.
        // Nodes.Since Nodes.JSX elements are invalid < operands anyway, this lookahead parse will only occur in error scenarios
        // of one sort or another.
        if (inExpressionContext && this.lexer.peek().type === tokenType_1.TokenType.lessThan) {
            var invalidElement = this.tryParse(function () { return _this.parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ true); });
            if (invalidElement) {
                this.parseErrorAtCurrentToken(Nodes.Diagnostics.JSX_expressions_must_have_one_parent_element);
                var badNode = new Nodes.BinaryExpression();
                badNode.end = invalidElement.end;
                badNode.left = this.result;
                badNode.right = invalidElement;
                badNode.operatorToken = this.createMissingNode(tokenType_1.TokenType.comma, /*reportAtCurrentPosition*/ false, /*diagnosticMessage*/ undefined);
                badNode.operatorToken.pos = badNode.operatorToken.end = badNode.right.pos;
                return badNode;
            }
        }
        return this.result;
    };
    Parser.prototype.parseJsxText = function () {
        var result = new Nodes.JsxText();
        this.lexer.peek().type = this.lexer.scanJsxToken();
        return result;
    };
    Parser.prototype.parseJsxChild = function () {
        switch (this.lexer.peek().type) {
            case tokenType_1.TokenType.JsxText:
                return this.parseJsxText();
            case tokenType_1.TokenType.openBrace:
                return this.parseJsxExpression(/*inExpressionContext*/ false);
            case tokenType_1.TokenType.lessThan:
                return this.parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ false);
        }
        Nodes.Debug.fail("Nodes.Unknown Nodes.JSX child kind " + this.lexer.peek().type);
    };
    Parser.prototype.parseJsxChildren = function (openingTagName) {
        var ;
        this.result = [];
        this.result.pos = this.lexer.getStartPos();
        var saveParsingContext = this.parsingContext;
        this.parsingContext |= 1 << Nodes.ParsingContext.JsxChildren;
        while (true) {
            this.lexer.peek().type = this.lexer.reScanJsxToken();
            if (this.lexer.peek().type === tokenType_1.TokenType.lessThanSlash) {
                // Nodes.Closing tag
                break;
            }
            else if (this.lexer.peek().type === tokenType_1.TokenType.endOfFile) {
                // Nodes.If we hit Nodes.EOF, issue the error at the tag that lacks the closing element
                // rather than at the end of the file (which is useless)
                this.parseErrorAtPosition(openingTagName.pos, openingTagName.end - openingTagName.pos, Nodes.Diagnostics.JSX_element_0_has_no_corresponding_closing_tag, getTextOfNodeFromSourceText(this.sourceText, openingTagName));
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
        this.parseExpected(tokenType_1.TokenType.lessThan);
        var tagName = this.parseJsxElementName();
        var attributes = this.parseList(Nodes.ParsingContext.JsxAttributes, this.parseJsxAttribute);
        var result;
        if (this.lexer.peek().type === tokenType_1.TokenType.greaterThan) {
            // Nodes.Closing tag, so scan the immediately-following text with the Nodes.JSX scanning instead
            // of regular scanning to avoid treating illegal characters (e.g. '#') as immediate
            // scanning errors
            result = new Nodes.JsxOpeningElement();
            this.scanJsxText();
        }
        else {
            this.parseExpected(tokenType_1.TokenType.slash);
            if (inExpressionContext) {
                this.parseExpected(tokenType_1.TokenType.greaterThan);
            }
            else {
                this.parseExpected(tokenType_1.TokenType.greaterThan, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
                this.scanJsxText();
            }
            result = new Nodes.JsxSelfClosingElement();
        }
        result.tagName = tagName;
        result.attributes = attributes;
        return result;
    };
    Parser.prototype.parseJsxElementName = function () {
        this.scanJsxIdentifier();
        // Nodes.JsxElement can have name in the form of
        //      propertyAccessExpression
        //      primaryExpression in the form of an identifier and "this" keyword
        // Nodes.We can't just simply use this.parseLeftHandSideExpressionOrHigher because then we will start consider class,function etc as a keyword
        // Nodes.We only want to consider "this" as a primaryExpression
        var expression = this.lexer.peek().type === tokenType_1.TokenType.this ?
            this.parseTokenNode() : this.parseIdentifierName();
        while (this.parseOptional(tokenType_1.TokenType.dot)) {
            var propertyAccess = new Nodes.PropertyAccessExpression();
            propertyAccess.expression = expression;
            propertyAccess.name = this.parseRightSideOfDot(/*allowIdentifierNames*/ true);
            expression = this.finishNode(propertyAccess);
        }
        return expression;
    };
    Parser.prototype.parseJsxExpression = function (inExpressionContext) {
        var result = new Nodes.JsxExpression();
        this.parseExpected(tokenType_1.TokenType.openBrace);
        if (this.lexer.peek().type !== tokenType_1.TokenType.closeBrace) {
            result.expression = this.parseAssignmentExpressionOrHigher();
        }
        if (inExpressionContext) {
            this.parseExpected(tokenType_1.TokenType.closeBrace);
        }
        else {
            this.parseExpected(tokenType_1.TokenType.closeBrace, /*message*/ undefined, /*shouldAdvance*/ false);
            this.scanJsxText();
        }
        return result;
    };
    Parser.prototype.parseJsxAttribute = function () {
        if (this.lexer.peek().type === tokenType_1.TokenType.openBrace) {
            return this.parseJsxSpreadAttribute();
        }
        this.scanJsxIdentifier();
        var result = new Nodes.JsxAttribute();
        result.name = this.parseIdentifierName();
        if (this.parseOptional(tokenType_1.TokenType.equals)) {
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
        var result = new Nodes.JsxSpreadAttribute();
        this.parseExpected(tokenType_1.TokenType.openBrace);
        this.parseExpected(tokenType_1.TokenType.dotDotDot);
        result.expression = this.parseExpression();
        this.parseExpected(tokenType_1.TokenType.closeBrace);
        return result;
    };
    Parser.prototype.parseJsxClosingElement = function (inExpressionContext) {
        var result = new Nodes.JsxClosingElement();
        this.parseExpected(tokenType_1.TokenType.lessThanSlash);
        result.tagName = this.parseJsxElementName();
        if (inExpressionContext) {
            this.parseExpected(tokenType_1.TokenType.greaterThan);
        }
        else {
            this.parseExpected(tokenType_1.TokenType.greaterThan, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
            this.scanJsxText();
        }
        return result;
    };
    Parser.prototype.parseTypeAssertion = function () {
        var result = new Nodes.TypeAssertion();
        this.parseExpected(tokenType_1.TokenType.lessThan);
        result.type = this.parseType();
        this.parseExpected(tokenType_1.TokenType.greaterThan);
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    };
    Parser.prototype.parseMemberExpressionRest = function (expression) {
        while (true) {
            var dotToken = this.parseOptionalToken(tokenType_1.TokenType.dot);
            if (dotToken) {
                var propertyAccess = new Nodes.PropertyAccessExpression();
                propertyAccess.expression = expression;
                propertyAccess.name = this.parseRightSideOfDot(/*allowIdentifierNames*/ true);
                expression = this.finishNode(propertyAccess);
                continue;
            }
            if (this.lexer.peek().type === tokenType_1.TokenType.exclamation && !this.lexer.peek().hasLineBreakBeforeStar) {
                this.nextToken();
                var nonNullExpression = new Nodes.NonNullExpression();
                nonNullExpression.expression = expression;
                expression = this.finishNode(nonNullExpression);
                continue;
            }
            // when in the [Nodes.Decorator] context, we do not parse Nodes.ElementAccess as it could be part of a Nodes.ComputedPropertyName
            if (!this.inDecoratorContext() && this.parseOptional(tokenType_1.TokenType.openBracket)) {
                var indexedAccess = new Nodes.ElementAccessExpression();
                indexedAccess.expression = expression;
                // Nodes.It's not uncommon for a user to write: "new Nodes.Type[]".
                // Nodes.Check for that common pattern and report a better error message.
                if (this.lexer.peek().type !== tokenType_1.TokenType.closeBracket) {
                    indexedAccess.argumentExpression = this.allowInAnd(this.parseExpression);
                    if (indexedAccess.argumentExpression.kind === tokenType_1.TokenType.StringLiteral || indexedAccess.argumentExpression.kind === tokenType_1.TokenType.NumericLiteral) {
                        var literal = indexedAccess.argumentExpression;
                        literal.text = this.internIdentifier(literal.text);
                    }
                }
                this.parseExpected(tokenType_1.TokenType.closeBracket);
                expression = this.finishNode(indexedAccess);
                continue;
            }
            if (this.lexer.peek().type === tokenType_1.TokenType.NoSubstitutionTemplateLiteral || this.lexer.peek().type === tokenType_1.TokenType.TemplateHead) {
                var tagExpression = new Nodes.TaggedTemplateExpression();
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
            if (this.lexer.peek().type === tokenType_1.TokenType.lessThan) {
                // Nodes.See if this is the start of a generic invocation.  Nodes.If so, consume it and
                // keep checking for postfix expressions.  Nodes.Otherwise, it's just a '<' that's
                // part of an arithmetic expression.  Nodes.Break out so we consume it higher in the
                // stack.
                var typeArguments = this.tryParse(this.parseTypeArgumentsInExpression);
                if (!typeArguments) {
                    return expression;
                }
                var callExpr = new Nodes.CallExpression();
                callExpr.expression = expression;
                callExpr.typeArguments = typeArguments;
                callExpr.arguments = this.parseArgumentList();
                expression = this.finishNode(callExpr);
                continue;
            }
            else if (this.lexer.peek().type === tokenType_1.TokenType.openParen) {
                var callExpr = new Nodes.CallExpression();
                callExpr.expression = expression;
                callExpr.arguments = this.parseArgumentList();
                expression = this.finishNode(callExpr);
                continue;
            }
            return expression;
        }
    };
    Parser.prototype.parseArgumentList = function () {
        this.parseExpected(tokenType_1.TokenType.openParen);
        var ;
        this.result = this.parseDelimitedList(Nodes.ParsingContext.ArgumentExpressions, this.parseArgumentExpression);
        this.parseExpected(tokenType_1.TokenType.closeParen);
        return this.result;
    };
    Parser.prototype.parseTypeArgumentsInExpression = function () {
        if (!this.parseOptional(tokenType_1.TokenType.lessThan)) {
            return undefined;
        }
        var typeArguments = this.parseDelimitedList(Nodes.ParsingContext.TypeArguments, this.parseType);
        if (!this.parseExpected(tokenType_1.TokenType.greaterThan)) {
            // Nodes.If it doesn't have the closing >  then it's definitely not an type argument list.
            return undefined;
        }
        // Nodes.If we have a '<', then only parse this as a argument list if the type arguments
        // are complete and we have an open paren.  if we don't, rewind and return nothing.
        return typeArguments && this.canFollowTypeArgumentsInExpression()
            ? typeArguments
            : undefined;
    };
    Parser.prototype.canFollowTypeArgumentsInExpression = function () {
        switch (this.lexer.peek().type) {
            case tokenType_1.TokenType.openParen: // foo<x>(
            // this case are the only case where this this.lexer.peek().type can legally follow a type argument
            // list.  Nodes.So we definitely want to treat this as a type arg list.
            case tokenType_1.TokenType.dot: // foo<x>.
            case tokenType_1.TokenType.closeParen: // foo<x>)
            case tokenType_1.TokenType.closeBracket: // foo<x>]
            case tokenType_1.TokenType.colon: // foo<x>:
            case tokenType_1.TokenType.semicolon: // foo<x>;
            case tokenType_1.TokenType.question: // foo<x>?
            case tokenType_1.TokenType.equalsEquals: // foo<x> ==
            case tokenType_1.TokenType.equalsEqualsEquals: // foo<x> ===
            case tokenType_1.TokenType.exclamationEquals: // foo<x> !=
            case tokenType_1.TokenType.exclamationEqualsEquals: // foo<x> !==
            case tokenType_1.TokenType.ampersandAmpersand: // foo<x> &&
            case tokenType_1.TokenType.barBar: // foo<x> ||
            case tokenType_1.TokenType.caret: // foo<x> ^
            case tokenType_1.TokenType.ampersand: // foo<x> &
            case tokenType_1.TokenType.bar: // foo<x> |
            case tokenType_1.TokenType.closeBrace: // foo<x> }
            case tokenType_1.TokenType.endOfFile:
                // these cases can't legally follow a type arg list.  Nodes.However, they're not legal
                // expressions either.  Nodes.The user is probably in the middle of a generic type. Nodes.So
                // treat it as such.
                return true;
            case tokenType_1.TokenType.comma: // foo<x>,
            case tokenType_1.TokenType.openBrace: // foo<x> {
            // Nodes.We don't want to treat these as type arguments.  Nodes.Otherwise we'll parse this
            // as an invocation expression.  Nodes.Instead, we want to parse out the expression
            // in isolation from the type arguments.
            default:
                // Nodes.Anything else treat as an expression.
                return false;
        }
    };
    Parser.prototype.parsePrimaryExpression = function () {
        switch (this.lexer.peek().type) {
            case tokenType_1.TokenType.NumericLiteral:
            case tokenType_1.TokenType.StringLiteral:
            case tokenType_1.TokenType.NoSubstitutionTemplateLiteral:
                return this.parseLiteralNode();
            case tokenType_1.TokenType.this:
            case tokenType_1.TokenType.super:
            case tokenType_1.TokenType.null:
            case tokenType_1.TokenType.true:
            case tokenType_1.TokenType.false:
                return this.parseTokenNode();
            case tokenType_1.TokenType.openParen:
                return this.parseParenthesizedExpression();
            case tokenType_1.TokenType.openBracket:
                return this.parseArrayLiteralExpression();
            case tokenType_1.TokenType.openBrace:
                return this.parseObjectLiteralExpression();
            case tokenType_1.TokenType.async:
                // Nodes.Async arrow functions are parsed earlier in this.parseAssignmentExpressionOrHigher.
                // Nodes.If we encounter `async [no Nodes.LineTerminator here] function` then this is an async
                // function; otherwise, its an identifier.
                if (!this.lookAhead(this.nextTokenIsFunctionKeywordOnSameLine)) {
                    break;
                }
                return this.parseFunctionExpression();
            case tokenType_1.TokenType.class:
                return this.parseClassExpression();
            case tokenType_1.TokenType.function:
                return this.parseFunctionExpression();
            case tokenType_1.TokenType.new:
                return this.parseNewExpression();
            case tokenType_1.TokenType.slash:
            case tokenType_1.TokenType.slashEquals:
                if (this.reScanSlashToken() === tokenType_1.TokenType.RegularExpressionLiteral) {
                    return this.parseLiteralNode();
                }
                break;
            case tokenType_1.TokenType.TemplateHead:
                return this.parseTemplateExpression();
        }
        return this.parseIdentifier(Nodes.Diagnostics.Expression_expected);
    };
    Parser.prototype.parseParenthesizedExpression = function () {
        var result = new Nodes.ParenthesizedExpression();
        this.parseExpected(tokenType_1.TokenType.openParen);
        result.expression = this.allowInAnd(this.parseExpression);
        this.parseExpected(tokenType_1.TokenType.closeParen);
        return result;
    };
    Parser.prototype.parseSpreadElement = function () {
        var result = new Nodes.SpreadElementExpression();
        this.parseExpected(tokenType_1.TokenType.dotDotDot);
        result.expression = this.parseAssignmentExpressionOrHigher();
        return result;
    };
    Parser.prototype.parseArgumentOrArrayLiteralElement = function () {
        return this.lexer.peek().type === tokenType_1.TokenType.dotDotDot ? this.parseSpreadElement() :
            this.lexer.peek().type === tokenType_1.TokenType.comma ? new Nodes.Expression() :
                this.parseAssignmentExpressionOrHigher();
    };
    Parser.prototype.parseArgumentExpression = function () {
        return this.doOutsideOfContext(this.disallowInAndDecoratorContext, this.parseArgumentOrArrayLiteralElement);
    };
    Parser.prototype.parseArrayLiteralExpression = function () {
        var result = new Nodes.ArrayLiteralExpression();
        this.parseExpected(tokenType_1.TokenType.openBracket);
        if (this.lexer.peek().hasLineBreakBeforeStar) {
            result.multiLine = true;
        }
        result.elements = this.parseDelimitedList(Nodes.ParsingContext.ArrayLiteralMembers, this.parseArgumentOrArrayLiteralElement);
        this.parseExpected(tokenType_1.TokenType.closeBracket);
        return result;
    };
    Parser.prototype.tryParseAccessorDeclaration = function (fullStart, decorators, modifiers) {
        if (this.parseContextualModifier(tokenType_1.TokenType.get)) {
            return this.parseJsDocComment(this.parseAccessorDeclaration(tokenType_1.TokenType.GetAccessor, fullStart, decorators, modifiers));
        }
        else if (this.parseContextualModifier(tokenType_1.TokenType.set)) {
            return this.parseAccessorDeclaration(tokenType_1.TokenType.SetAccessor, fullStart, decorators, modifiers);
        }
        return undefined;
    };
    Parser.prototype.parseObjectLiteralElement = function () {
        var fullStart = this.lexer.getStartPos();
        var decorators = this.parseDecorators();
        var modifiers = this.parseModifiers();
        var accessor = this.tryParseAccessorDeclaration(fullStart, decorators, modifiers);
        if (accessor) {
            return accessor;
        }
        var asteriskToken = this.parseOptionalToken(tokenType_1.TokenType.asterisk);
        var tokenIsIdentifier = this.isIdentifier();
        var propertyName = this.parsePropertyName();
        // Nodes.Disallowing of optional property assignments happens in the grammar checker.
        var questionToken = this.parseOptionalToken(tokenType_1.TokenType.question);
        if (asteriskToken || this.lexer.peek().type === tokenType_1.TokenType.openParen || this.lexer.peek().type === tokenType_1.TokenType.lessThan) {
            return this.parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, propertyName, questionToken);
        }
        // check if it is short-hand property assignment or normal property assignment
        // Nodes.NOTE: if this.lexer.peek().type is Nodes.EqualsToken it is interpreted as Nodes.CoverInitializedName production
        // Nodes.CoverInitializedName[Nodes.Yield] :
        //     Nodes.IdentifierReference[?Nodes.Yield] Nodes.Initializer[Nodes.In, ?Nodes.Yield]
        // this is necessary because Nodes.ObjectLiteral productions are also used to cover grammar for Nodes.ObjectAssignmentPattern
        var isShorthandPropertyAssignment = tokenIsIdentifier && (this.lexer.peek().type === tokenType_1.TokenType.comma || this.lexer.peek().type === tokenType_1.TokenType.closeBrace || this.lexer.peek().type === tokenType_1.TokenType.equals);
        if (isShorthandPropertyAssignment) {
            var shorthandDeclaration = new Nodes.ShorthandPropertyAssignment();
            shorthandDeclaration.name = propertyName;
            shorthandDeclaration.questionToken = questionToken;
            var equalsToken = this.parseOptionalToken(tokenType_1.TokenType.equals);
            if (equalsToken) {
                shorthandDeclaration.equalsToken = equalsToken;
                shorthandDeclaration.objectAssignmentInitializer = this.allowInAnd(this.parseAssignmentExpressionOrHigher);
            }
            return this.parseJsDocComment(this.finishNode(shorthandDeclaration));
        }
        else {
            var propertyAssignment = new Nodes.PropertyAssignment();
            propertyAssignment.modifiers = modifiers;
            propertyAssignment.name = propertyName;
            propertyAssignment.questionToken = questionToken;
            this.parseExpected(tokenType_1.TokenType.colon);
            propertyAssignment.initializer = this.allowInAnd(this.parseAssignmentExpressionOrHigher);
            return this.parseJsDocComment(this.finishNode(propertyAssignment));
        }
    };
    Parser.prototype.parseObjectLiteralExpression = function () {
        var result = new Nodes.ObjectLiteralExpression();
        this.parseExpected(tokenType_1.TokenType.openBrace);
        if (this.lexer.peek().hasLineBreakBeforeStar) {
            result.multiLine = true;
        }
        result.properties = this.parseDelimitedList(Nodes.ParsingContext.ObjectLiteralMembers, this.parseObjectLiteralElement, /*considerSemicolonAsDelimiter*/ true);
        this.parseExpected(tokenType_1.TokenType.closeBrace);
        return result;
    };
    Parser.prototype.parseFunctionExpression = function () {
        // Nodes.GeneratorExpression:
        //      function* Nodes.BindingIdentifier [Nodes.Yield][opt](Nodes.FormalParameters[Nodes.Yield]){ Nodes.GeneratorBody }
        //
        // Nodes.FunctionExpression:
        //      function Nodes.BindingIdentifier[opt](Nodes.FormalParameters){ Nodes.FunctionBody }
        var saveDecoratorContext = this.inDecoratorContext();
        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ false);
        }
        var result = new Nodes.FunctionExpression();
        this.setModifiers(result, this.parseModifiers());
        this.parseExpected(tokenType_1.TokenType.function);
        result.asteriskToken = this.parseOptionalToken(tokenType_1.TokenType.asterisk);
        var isGenerator = !!result.asteriskToken;
        var isAsync = !!(result.flags & Nodes.NodeFlags.Async);
        result.name =
            isGenerator && isAsync ? this.doInYieldAndAwaitContext(this.parseOptionalIdentifier) :
                isGenerator ? this.doInYieldContext(this.parseOptionalIdentifier) :
                    isAsync ? this.doInAwaitContext(this.parseOptionalIdentifier) :
                        this.parseOptionalIdentifier();
        this.fillSignature(tokenType_1.TokenType.colon, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, result);
        result.body = this.parseFunctionBlock(/*allowYield*/ isGenerator, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);
        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ true);
        }
        return this.parseJsDocComment(result);
    };
    Parser.prototype.parseOptionalIdentifier = function () {
        return this.isIdentifier() ? this.parseIdentifier() : undefined;
    };
    Parser.prototype.parseNewExpression = function () {
        var result = new Nodes.NewExpression();
        this.parseExpected(tokenType_1.TokenType.new);
        result.expression = this.parseMemberExpressionOrHigher();
        result.typeArguments = this.tryParse(this.parseTypeArgumentsInExpression);
        if (result.typeArguments || this.lexer.peek().type === tokenType_1.TokenType.openParen) {
            result.arguments = this.parseArgumentList();
        }
        return result;
    };
    // Nodes.STATEMENTS
    Parser.prototype.parseFunctionBlock = function (allowYield, allowAwait, ignoreMissingOpenBrace, diagnosticMessage) {
        var savedYieldContext = this.inYieldContext();
        this.setYieldContext(allowYield);
        var savedAwaitContext = this.inAwaitContext();
        this.setAwaitContext(allowAwait);
        // Nodes.We may be in a [Nodes.Decorator] context when parsing a function expression or
        // arrow function. Nodes.The body of the function is not in [Nodes.Decorator] context.
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
    Parser.prototype.parseReturnStatement = function () {
        var result = new Nodes.ReturnStatement();
        this.parseExpected(tokenType_1.TokenType.return);
        if (!this.canParseSemicolon()) {
            result.expression = this.allowInAnd(this.parseExpression);
        }
        this.expectSemicolon();
        return result;
    };
    Parser.prototype.parseWithStatement = function () {
        var result = new Nodes.WithStatement();
        this.parseExpected(tokenType_1.TokenType.with);
        this.parseExpected(tokenType_1.TokenType.openParen);
        result.expression = this.allowInAnd(this.parseExpression);
        this.parseExpected(tokenType_1.TokenType.closeParen);
        result.statement = this.parseStatement();
        return result;
    };
    Parser.prototype.parseThrowStatement = function () {
        // Nodes.ThrowStatement[Nodes.Yield] :
        //      throw [no Nodes.LineTerminator here]Nodes.Expression[Nodes.In, ?Nodes.Yield];
        // Nodes.Because of automatic semicolon insertion, we need to report error if this
        // throw could be terminated with a semicolon.  Nodes.Note: we can't call 'this.parseExpression'
        // directly as that might consume an expression on the following line.
        // Nodes.We just return 'undefined' in that case.  Nodes.The actual error will be reported in the
        // grammar walker.
        var result = new Nodes.ThrowStatement();
        this.parseExpected(tokenType_1.TokenType.throw);
        result.expression = this.lexer.peek().hasLineBreakBeforeStar ? undefined : this.allowInAnd(this.parseExpression);
        this.expectSemicolon();
        return result;
    };
    // Nodes.TODO: Nodes.Review for error recovery
    Parser.prototype.parseTryStatement = function () {
        var result = new Nodes.TryStatement();
        this.parseExpected(tokenType_1.TokenType.try);
        result.tryBlock = this.parseBlockStatement(/*ignoreMissingOpenBrace*/ false);
        result.catchClause = this.lexer.peek().type === tokenType_1.TokenType.catch ? this.parseCatchClause() : undefined;
        // Nodes.If we don't have a catch clause, then we must have a finally clause.  Nodes.Try to parse
        // one out no matter what.
        if (!result.catchClause || this.lexer.peek().type === tokenType_1.TokenType.finally) {
            this.parseExpected(tokenType_1.TokenType.finally);
            result.finallyBlock = this.parseBlockStatement(/*ignoreMissingOpenBrace*/ false);
        }
        return result;
    };
    Parser.prototype.parseCatchClause = function () {
        var ;
        this.result = new Nodes.CatchClause();
        this.parseExpected(tokenType_1.TokenType.catch);
        if (this.parseExpected(tokenType_1.TokenType.openParen)) {
            this.result.variableDeclaration = this.parseVariableDeclaration();
        }
        this.parseExpected(tokenType_1.TokenType.closeParen);
        this.result.block = this.parseBlockStatement(/*ignoreMissingOpenBrace*/ false);
        return this.finishNode(this.result);
    };
    Parser.prototype.parseDebuggerStatement = function () {
        var result = new Nodes.Statement();
        this.parseExpected(tokenType_1.TokenType.debugger);
        this.expectSemicolon();
        return result;
    };
    Parser.prototype.nextTokenIsIdentifierOrKeywordOnSameLine = function () {
        this.nextToken();
        return tokenIsIdentifierOrKeyword(this.lexer.peek().type) && !this.lexer.peek().hasLineBreakBeforeStar;
    };
    Parser.prototype.nextTokenIsFunctionKeywordOnSameLine = function () {
        this.nextToken();
        return this.lexer.peek().type === tokenType_1.TokenType.function && !this.lexer.peek().hasLineBreakBeforeStar;
    };
    Parser.prototype.nextTokenIsIdentifierOrKeywordOrNumberOnSameLine = function () {
        this.nextToken();
        return (tokenIsIdentifierOrKeyword(this.lexer.peek().type) || this.lexer.peek().type === tokenType_1.TokenType.NumericLiteral) && !this.lexer.peek().hasLineBreakBeforeStar;
    };
    Parser.prototype.isDeclaration = function () {
        while (true) {
            switch (this.lexer.peek().type) {
                case tokenType_1.TokenType.var:
                case tokenType_1.TokenType.let:
                case tokenType_1.TokenType.const:
                case tokenType_1.TokenType.function:
                case tokenType_1.TokenType.class:
                case tokenType_1.TokenType.enum:
                    return true;
                // 'declare', 'module', 'namespace', 'interface'* and 'type' are all legal Nodes.JavaScript this.identifiers;
                // however, an identifier cannot be followed by another identifier on the same line. Nodes.This is what we
                // count on to parse out the respective declarations. Nodes.For instance, we exploit this to say that
                //
                //    namespace n
                //
                // can be none other than the beginning of a namespace declaration, but need to respect that Nodes.JavaScript sees
                //
                //    namespace
                //    n
                //
                // as the identifier 'namespace' on one line followed by the identifier 'n' on another.
                // Nodes.We need to look one this.lexer.peek().type ahead to see if it permissible to try parsing a declaration.
                //
                // *Nodes.Note*: 'interface' is actually a strict mode reserved word. Nodes.So while
                //
                //   "use strict"
                //   interface
                //   I {}
                //
                // could be legal, it would add complexity for very little gain.
                case tokenType_1.TokenType.interface:
                case tokenType_1.TokenType.type:
                    return this.nextTokenIsIdentifierOnSameLine();
                case tokenType_1.TokenType.module:
                case tokenType_1.TokenType.namespace:
                    return this.nextTokenIsIdentifierOrStringLiteralOnSameLine();
                case tokenType_1.TokenType.abstract:
                case tokenType_1.TokenType.async:
                case tokenType_1.TokenType.declare:
                case tokenType_1.TokenType.private:
                case tokenType_1.TokenType.protected:
                case tokenType_1.TokenType.public:
                case tokenType_1.TokenType.readonly:
                    this.nextToken();
                    // Nodes.ASI takes effect for this modifier.
                    if (this.lexer.peek().hasLineBreakBeforeStar) {
                        return false;
                    }
                    continue;
                case tokenType_1.TokenType.global:
                    this.nextToken();
                    return this.lexer.peek().type === tokenType_1.TokenType.openBrace || this.lexer.peek().type === tokenType_1.TokenType.Identifier || this.lexer.peek().type === tokenType_1.TokenType.export;
                case tokenType_1.TokenType.import:
                    this.nextToken();
                    return this.lexer.peek().type === tokenType_1.TokenType.StringLiteral || this.lexer.peek().type === tokenType_1.TokenType.asterisk ||
                        this.lexer.peek().type === tokenType_1.TokenType.openBrace || tokenIsIdentifierOrKeyword(this.lexer.peek().type);
                case tokenType_1.TokenType.export:
                    this.nextToken();
                    if (this.lexer.peek().type === tokenType_1.TokenType.equals || this.lexer.peek().type === tokenType_1.TokenType.asterisk ||
                        this.lexer.peek().type === tokenType_1.TokenType.openBrace || this.lexer.peek().type === tokenType_1.TokenType.default ||
                        this.lexer.peek().type === tokenType_1.TokenType.as) {
                        return true;
                    }
                    continue;
                case tokenType_1.TokenType.static:
                    this.nextToken();
                    continue;
                default:
                    return false;
            }
        }
    };
    Parser.prototype.isStartOfDeclaration = function () {
        return this.lookAhead(this.isDeclaration);
    };
    Parser.prototype.isStartOfStatement = function () {
        switch (this.lexer.peek().type) {
            case tokenType_1.TokenType.at:
            case tokenType_1.TokenType.semicolon:
            case tokenType_1.TokenType.openBrace:
            case tokenType_1.TokenType.var:
            case tokenType_1.TokenType.let:
            case tokenType_1.TokenType.function:
            case tokenType_1.TokenType.class:
            case tokenType_1.TokenType.enum:
            case tokenType_1.TokenType.if:
            case tokenType_1.TokenType.do:
            case tokenType_1.TokenType.while:
            case tokenType_1.TokenType.for:
            case tokenType_1.TokenType.continue:
            case tokenType_1.TokenType.break:
            case tokenType_1.TokenType.return:
            case tokenType_1.TokenType.with:
            case tokenType_1.TokenType.switch:
            case tokenType_1.TokenType.throw:
            case tokenType_1.TokenType.try:
            case tokenType_1.TokenType.debugger:
            // 'catch' and 'finally' do not actually indicate that the code is part of a statement,
            // however, we say they are here so that we may gracefully parse them and error later.
            case tokenType_1.TokenType.catch:
            case tokenType_1.TokenType.finally:
                return true;
            case tokenType_1.TokenType.const:
            case tokenType_1.TokenType.export:
            case tokenType_1.TokenType.import:
                return this.isStartOfDeclaration();
            case tokenType_1.TokenType.async:
            case tokenType_1.TokenType.declare:
            case tokenType_1.TokenType.interface:
            case tokenType_1.TokenType.module:
            case tokenType_1.TokenType.namespace:
            case tokenType_1.TokenType.type:
            case tokenType_1.TokenType.global:
                // Nodes.When these don't start a declaration, they're an identifier in an expression statement
                return true;
            case tokenType_1.TokenType.public:
            case tokenType_1.TokenType.private:
            case tokenType_1.TokenType.protected:
            case tokenType_1.TokenType.static:
            case tokenType_1.TokenType.readonly:
                // Nodes.When these don't start a declaration, they may be the start of a class member if an identifier
                // immediately follows. Nodes.Otherwise they're an identifier in an expression statement.
                return this.isStartOfDeclaration() || !this.lookAhead(this.nextTokenIsIdentifierOrKeywordOnSameLine);
            default:
                return this.isStartOfExpression();
        }
    };
    Parser.prototype.nextTokenIsIdentifierOrStartOfDestructuring = function () {
        this.nextToken();
        return this.isIdentifier() || this.lexer.peek().type === tokenType_1.TokenType.openBrace || this.lexer.peek().type === tokenType_1.TokenType.openBracket;
    };
    Parser.prototype.isLetDeclaration = function () {
        // Nodes.In Nodes.ES6 'let' always starts a lexical declaration if followed by an identifier or {
        // or [.
        return this.lookAhead(this.nextTokenIsIdentifierOrStartOfDestructuring);
    };
    Parser.prototype.parseDeclaration = function () {
        var fullStart = this.getNodePos();
        var decorators = this.parseDecorators();
        var modifiers = this.parseModifiers();
        switch (this.lexer.peek().type) {
            case tokenType_1.TokenType.var:
            case tokenType_1.TokenType.let:
            case tokenType_1.TokenType.const:
                return this.parseVariableStatement(fullStart, decorators, modifiers);
            case tokenType_1.TokenType.function:
                return this.parseFunctionDeclaration(fullStart, decorators, modifiers);
            case tokenType_1.TokenType.class:
                return this.parseClassDeclaration(fullStart, decorators, modifiers);
            case tokenType_1.TokenType.interface:
                return this.parseInterfaceDeclaration(fullStart, decorators, modifiers);
            case tokenType_1.TokenType.type:
                return this.parseTypeAliasDeclaration(fullStart, decorators, modifiers);
            case tokenType_1.TokenType.enum:
                return this.parseEnumDeclaration(fullStart, decorators, modifiers);
            case tokenType_1.TokenType.global:
            case tokenType_1.TokenType.module:
            case tokenType_1.TokenType.namespace:
                return this.parseModuleDeclaration(fullStart, decorators, modifiers);
            case tokenType_1.TokenType.import:
                return this.parseImportDeclarationOrImportEqualsDeclaration(fullStart, decorators, modifiers);
            case tokenType_1.TokenType.export:
                this.nextToken();
                switch (this.lexer.peek().type) {
                    case tokenType_1.TokenType.default:
                    case tokenType_1.TokenType.equals:
                        return this.parseExportAssignment(fullStart, decorators, modifiers);
                    case tokenType_1.TokenType.as:
                        return this.parseNamespaceExportDeclaration(fullStart, decorators, modifiers);
                    default:
                        return this.parseExportDeclaration(fullStart, decorators, modifiers);
                }
            default:
                if (decorators || modifiers) {
                    // Nodes.We reached this point because we encountered decorators and/or modifiers and assumed a declaration
                    // would follow. Nodes.For recovery and error reporting purposes, return an incomplete declaration.
                    var result = this.createMissingNode(tokenType_1.TokenType.MissingDeclaration, /*reportAtCurrentPosition*/ true, Nodes.Diagnostics.Declaration_expected);
                    result.pos = fullStart;
                    result.decorators = decorators;
                    this.setModifiers(result, modifiers);
                    return result;
                }
        }
    };
    Parser.prototype.nextTokenIsIdentifierOrStringLiteralOnSameLine = function () {
        this.nextToken();
        return !this.lexer.peek().hasLineBreakBeforeStar && (this.isIdentifier() || this.lexer.peek().type === tokenType_1.TokenType.StringLiteral);
    };
    Parser.prototype.parseFunctionBlockOrSemicolon = function (isGenerator, isAsync, diagnosticMessage) {
        if (this.lexer.peek().type !== tokenType_1.TokenType.openBrace && this.canParseSemicolon()) {
            this.expectSemicolon();
            return;
        }
        return this.parseFunctionBlock(isGenerator, isAsync, /*ignoreMissingOpenBrace*/ false, diagnosticMessage);
    };
    // Nodes.DECLARATIONS
    Parser.prototype.parseArrayBindingElement = function () {
        if (this.lexer.peek().type === tokenType_1.TokenType.comma) {
            return new Nodes.BindingElement();
        }
        var result = new Nodes.BindingElement();
        result.dotDotDotToken = this.parseOptionalToken(tokenType_1.TokenType.dotDotDot);
        result.name = this.parseBindingName();
        result.initializer = this.parseBindingElementInitializer(/*inParameter*/ false);
        return result;
    };
    Parser.prototype.parseObjectBindingElement = function () {
        var result = new Nodes.BindingElement();
        var tokenIsIdentifier = this.isIdentifier();
        var propertyName = this.parsePropertyName();
        if (tokenIsIdentifier && this.lexer.peek().type !== tokenType_1.TokenType.colon) {
            result.name = propertyName;
        }
        else {
            this.parseExpected(tokenType_1.TokenType.colon);
            result.propertyName = propertyName;
            result.name = this.parseBindingName();
        }
        result.initializer = this.parseBindingElementInitializer(/*inParameter*/ false);
        return result;
    };
    Parser.prototype.parseObjectBindingPattern = function () {
        var result = new Nodes.BindingPattern();
        this.parseExpected(tokenType_1.TokenType.openBrace);
        result.elements = this.parseDelimitedList(Nodes.ParsingContext.ObjectBindingElements, this.parseObjectBindingElement);
        this.parseExpected(tokenType_1.TokenType.closeBrace);
        return result;
    };
    Parser.prototype.parseArrayBindingPattern = function () {
        var result = new Nodes.BindingPattern();
        this.parseExpected(tokenType_1.TokenType.openBracket);
        result.elements = this.parseDelimitedList(Nodes.ParsingContext.ArrayBindingElements, this.parseArrayBindingElement);
        this.parseExpected(tokenType_1.TokenType.closeBracket);
        return result;
    };
    Parser.prototype.isIdentifierOrPattern = function () {
        return this.lexer.peek().type === tokenType_1.TokenType.openBrace || this.lexer.peek().type === tokenType_1.TokenType.openBracket || this.isIdentifier();
    };
    Parser.prototype.parseBindingName = function () {
        if (this.lexer.peek().type === tokenType_1.TokenType.openBracket) {
            return this.parseArrayBindingPattern();
        }
        if (this.lexer.peek().type === tokenType_1.TokenType.openBrace) {
            return this.parseObjectBindingPattern();
        }
        return this.parseIdentifier();
    };
    Parser.prototype.canFollowContextualOfKeyword = function () {
        return this.nextTokenIsIdentifier() && this.nextToken() === tokenType_1.TokenType.closeParen;
    };
    Parser.prototype.parseFunctionDeclaration = function (fullStart, decorators, modifiers) {
        var result = new Nodes.FunctionDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        this.parseExpected(tokenType_1.TokenType.function);
        result.asteriskToken = this.parseOptionalToken(tokenType_1.TokenType.asterisk);
        result.name = result.flags & Nodes.NodeFlags.Default ? this.parseOptionalIdentifier() : this.parseIdentifier();
        var isGenerator = !!result.asteriskToken;
        var isAsync = !!(result.flags & Nodes.NodeFlags.Async);
        this.fillSignature(tokenType_1.TokenType.colon, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, result);
        result.body = this.parseFunctionBlockOrSemicolon(isGenerator, isAsync, Nodes.Diagnostics.or_expected);
        return this.parseJsDocComment(result);
    };
    Parser.prototype.parseConstructorDeclaration = function (pos, decorators, modifiers) {
        var result = new Nodes.ConstructorDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        this.parseExpected(tokenType_1.TokenType.constructor);
        this.fillSignature(tokenType_1.TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, result);
        result.body = this.parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false, Nodes.Diagnostics.or_expected);
        return this.parseJsDocComment(result);
    };
    Parser.prototype.parseMethodDeclaration = function (fullStart, decorators, modifiers, asteriskToken, name, questionToken, diagnosticMessage) {
        var method = new Nodes.MethodDeclaration();
        method.decorators = decorators;
        this.setModifiers(method, modifiers);
        method.asteriskToken = asteriskToken;
        method.name = name;
        method.questionToken = questionToken;
        var isGenerator = !!asteriskToken;
        var isAsync = !!(method.flags & Nodes.NodeFlags.Async);
        this.fillSignature(tokenType_1.TokenType.colon, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, method);
        method.body = this.parseFunctionBlockOrSemicolon(isGenerator, isAsync, diagnosticMessage);
        return this.parseJsDocComment(this.finishNode(method));
    };
    Parser.prototype.parsePropertyDeclaration = function (fullStart, decorators, modifiers, name, questionToken) {
        var property = new Nodes.PropertyDeclaration();
        property.decorators = decorators;
        this.setModifiers(property, modifiers);
        property.name = name;
        property.questionToken = questionToken;
        property.type = this.parseTypeAnnotation();
        // Nodes.For instance properties specifically, since they are evaluated inside the constructor,
        // we do *not * want to parse yield expressions, so we specifically turn the yield context
        // off. Nodes.The grammar would look something like this:
        //
        //    Nodes.MemberVariableDeclaration[Nodes.Yield]:
        //        Nodes.AccessibilityModifier_opt   Nodes.PropertyName   Nodes.TypeAnnotation_opt   Nodes.Initializer_opt[Nodes.In];
        //        Nodes.AccessibilityModifier_opt  static_opt  Nodes.PropertyName   Nodes.TypeAnnotation_opt   Nodes.Initializer_opt[Nodes.In, ?Nodes.Yield];
        //
        // Nodes.The checker may still error in the static case to explicitly disallow the yield expression.
        property.initializer = modifiers && modifiers.flags & Nodes.NodeFlags.Static
            ? this.allowInAnd(this.parseNonParameterInitializer)
            : this.doOutsideOfContext(Nodes.NodeFlags.YieldContext | Nodes.NodeFlags.DisallowInContext, this.parseNonParameterInitializer);
        this.expectSemicolon();
        return this.finishNode(property);
    };
    Parser.prototype.parsePropertyOrMethodDeclaration = function (fullStart, decorators, modifiers) {
        var asteriskToken = this.parseOptionalToken(tokenType_1.TokenType.asterisk);
        var name = this.parsePropertyName();
        // Nodes.Note: this is not legal as per the grammar.  Nodes.But we allow it in the parser and
        // report an error in the grammar checker.
        var questionToken = this.parseOptionalToken(tokenType_1.TokenType.question);
        if (asteriskToken || this.lexer.peek().type === tokenType_1.TokenType.openParen || this.lexer.peek().type === tokenType_1.TokenType.lessThan) {
            return this.parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, name, questionToken, Nodes.Diagnostics.or_expected);
        }
        else {
            return this.parsePropertyDeclaration(fullStart, decorators, modifiers, name, questionToken);
        }
    };
    Parser.prototype.parseNonParameterInitializer = function () {
        return this.parseInitializer(/*inParameter*/ false);
    };
    Parser.prototype.parseAccessorDeclaration = function (kind, fullStart, decorators, modifiers) {
        var result = new Nodes.AccessorDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        result.name = this.parsePropertyName();
        this.fillSignature(tokenType_1.TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, result);
        result.body = this.parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false);
        return result;
    };
    Parser.prototype.isClassMemberModifier = function (idToken) {
        switch (idToken) {
            case tokenType_1.TokenType.public:
            case tokenType_1.TokenType.private:
            case tokenType_1.TokenType.protected:
            case tokenType_1.TokenType.static:
            case tokenType_1.TokenType.readonly:
                return true;
            default:
                return false;
        }
    };
    Parser.prototype.isClassMemberStart = function () {
        var idToken;
        if (this.lexer.peek().type === tokenType_1.TokenType.at) {
            return true;
        }
        // Nodes.Eat up all modifiers, but hold on to the last one in case it is actually an identifier.
        while (isModifierKind(this.lexer.peek().type)) {
            idToken = this.lexer.peek().type;
            // Nodes.If the idToken is a class modifier (protected, private, public, and static), it is
            // certain that we are starting to parse class member. Nodes.This allows better error recovery
            // Nodes.Example:
            //      public foo() ...     // true
            //      public @dec blah ... // true; we will then report an error later
            //      export public ...    // true; we will then report an error later
            if (this.isClassMemberModifier(idToken)) {
                return true;
            }
            this.nextToken();
        }
        if (this.lexer.peek().type === tokenType_1.TokenType.asterisk) {
            return true;
        }
        // Nodes.Try to get the first property-like this.lexer.peek().type following all modifiers.
        // Nodes.This can either be an identifier or the 'get' or 'set' keywords.
        if (this.isLiteralPropertyName()) {
            idToken = this.lexer.peek().type;
            this.nextToken();
        }
        // Nodes.Index signatures and computed properties are class members; we can parse.
        if (this.lexer.peek().type === tokenType_1.TokenType.openBracket) {
            return true;
        }
        // Nodes.If we were able to get any potential identifier...
        if (idToken !== undefined) {
            // Nodes.If we have a non-keyword identifier, or if we have an accessor, then it's safe to parse.
            if (!isKeyword(idToken) || idToken === tokenType_1.TokenType.set || idToken === tokenType_1.TokenType.get) {
                return true;
            }
            // Nodes.If it *is* a keyword, but not an accessor, check a little farther along
            // to see if it should actually be parsed as a class member.
            switch (this.lexer.peek().type) {
                case tokenType_1.TokenType.openParen: // Nodes.Method declaration
                case tokenType_1.TokenType.lessThan: // Nodes.Generic Nodes.Method declaration
                case tokenType_1.TokenType.colon: // Nodes.Type Nodes.Annotation for declaration
                case tokenType_1.TokenType.equals: // Nodes.Initializer for declaration
                case tokenType_1.TokenType.question:
                    return true;
                default:
                    // Nodes.Covers
                    //  - Nodes.Semicolons     (declaration termination)
                    //  - Nodes.Closing braces (end-of-class, must be declaration)
                    //  - Nodes.End-of-files   (not valid, but permitted so that it gets caught later on)
                    //  - Nodes.Line-breaks    (enabling *automatic semicolon insertion*)
                    return this.canParseSemicolon();
            }
        }
        return false;
    };
    Parser.prototype.parseDecorators = function () {
        var decorators;
        while (true) {
            var decoratorStart = this.getNodePos();
            if (!this.parseOptional(tokenType_1.TokenType.at)) {
                break;
            }
            if (!decorators) {
                decorators = [];
                decorators.pos = decoratorStart;
            }
            var decorator = new Nodes.Decorator();
            decorator.expression = this.doInDecoratorContext(this.parseLeftHandSideExpressionOrHigher);
            decorators.push(this.finishNode(decorator));
        }
        if (decorators) {
            decorators.end = this.getNodeEnd();
        }
        return decorators;
    };
    /*
     * Nodes.There are situations in which a modifier like 'const' will appear unexpectedly, such as on a class member.
     * Nodes.In those situations, if we are entirely sure that 'const' is not valid on its own (such as when Nodes.ASI takes effect
     * and turns it into a standalone declaration), then it is better to parse it and report an error later.
     *
     * Nodes.In such situations, 'permitInvalidConstAsModifier' should be set to true.
     */
    Parser.prototype.parseModifiers = function (permitInvalidConstAsModifier) {
        var flags = 0;
        var modifiers;
        while (true) {
            var modifierStart = this.lexer.getStartPos();
            var modifierKind = this.lexer.peek().type;
            if (this.lexer.peek().type === tokenType_1.TokenType.const && permitInvalidConstAsModifier) {
                // Nodes.We need to ensure that any subsequent modifiers appear on the same line
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
                modifiers = [];
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
    };
    Parser.prototype.parseModifiersForArrowFunction = function () {
        var flags = 0;
        var modifiers;
        if (this.lexer.peek().type === tokenType_1.TokenType.async) {
            var modifierStart = this.lexer.getStartPos();
            var modifierKind = this.lexer.peek().type;
            this.nextToken();
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
        if (this.lexer.peek().type === tokenType_1.TokenType.semicolon) {
            var ;
            this.result = new Nodes.SemicolonClassElement();
            this.nextToken();
            return this.finishNode(this.result);
        }
        var fullStart = this.getNodePos();
        var decorators = this.parseDecorators();
        var modifiers = this.parseModifiers(/*permitInvalidConstAsModifier*/ true);
        var accessor = this.tryParseAccessorDeclaration(fullStart, decorators, modifiers);
        if (accessor) {
            return accessor;
        }
        if (this.lexer.peek().type === tokenType_1.TokenType.constructor) {
            return this.parseConstructorDeclaration(fullStart, decorators, modifiers);
        }
        if (this.isIndexSignature()) {
            return this.parseIndexSignatureDeclaration(fullStart, decorators, modifiers);
        }
        // Nodes.It is very important that we check this *after* checking indexers because
        // the [ this.lexer.peek().type can start an index signature or a computed property name
        if (tokenIsIdentifierOrKeyword(this.lexer.peek().type) ||
            this.lexer.peek().type === tokenType_1.TokenType.StringLiteral ||
            this.lexer.peek().type === tokenType_1.TokenType.NumericLiteral ||
            this.lexer.peek().type === tokenType_1.TokenType.asterisk ||
            this.lexer.peek().type === tokenType_1.TokenType.openBracket) {
            return this.parsePropertyOrMethodDeclaration(fullStart, decorators, modifiers);
        }
        if (decorators || modifiers) {
            // treat this as a property declaration with a missing name.
            var name_1 = this.createMissingNode(tokenType_1.TokenType.Identifier, /*reportAtCurrentPosition*/ true, Nodes.Diagnostics.Declaration_expected);
            return this.parsePropertyDeclaration(fullStart, decorators, modifiers, name_1, /*questionToken*/ undefined);
        }
        // 'this.isClassMemberStart' should have hinted not to attempt parsing.
        Nodes.Debug.fail("Nodes.Should not have attempted to parse class member declaration.");
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
        var result = new Nodes.ClassLikeDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        this.parseExpected(tokenType_1.TokenType.class);
        result.name = this.parseNameOfClassDeclarationOrExpression();
        result.typeParameters = this.parseTypeParameters();
        result.heritageClauses = this.parseHeritageClauses(/*isClassHeritageClause*/ true);
        if (this.parseExpected(tokenType_1.TokenType.openBrace)) {
            // Nodes.ClassTail[Nodes.Yield,Nodes.Await] : (Nodes.Modified) Nodes.See 14.5
            //      Nodes.ClassHeritage[?Nodes.Yield,?Nodes.Await]opt { Nodes.ClassBody[?Nodes.Yield,?Nodes.Await]opt }
            result.members = this.parseClassMembers();
            this.parseExpected(tokenType_1.TokenType.closeBrace);
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
        return this.lexer.peek().type === tokenType_1.TokenType.implements && this.lookAhead(this.nextTokenIsIdentifierOrKeyword);
    };
    Parser.prototype.parseHeritageClauses = function (isClassHeritageClause) {
        // Nodes.ClassTail[Nodes.Yield,Nodes.Await] : (Nodes.Modified) Nodes.See 14.5
        //      Nodes.ClassHeritage[?Nodes.Yield,?Nodes.Await]opt { Nodes.ClassBody[?Nodes.Yield,?Nodes.Await]opt }
        if (this.isHeritageClause()) {
            return this.parseList(Nodes.ParsingContext.HeritageClauses, this.parseHeritageClause);
        }
        return undefined;
    };
    Parser.prototype.parseHeritageClause = function () {
        if (this.lexer.peek().type === tokenType_1.TokenType.extends || this.lexer.peek().type === tokenType_1.TokenType.implements) {
            var result = new Nodes.HeritageClause();
            result.token = this.lexer.peek().type;
            this.nextToken();
            result.types = this.parseDelimitedList(Nodes.ParsingContext.HeritageClauseElement, this.parseExpressionWithTypeArguments);
            return result;
        }
        return undefined;
    };
    Parser.prototype.parseExpressionWithTypeArguments = function () {
        var result = new Nodes.ExpressionWithTypeArguments();
        result.expression = this.parseLeftHandSideExpressionOrHigher();
        if (this.lexer.peek().type === tokenType_1.TokenType.lessThan) {
            result.typeArguments = this.parseBracketedList(Nodes.ParsingContext.TypeArguments, this.parseType, tokenType_1.TokenType.lessThan, tokenType_1.TokenType.greaterThan);
        }
        return result;
    };
    Parser.prototype.isHeritageClause = function () {
        return this.lexer.peek().type === tokenType_1.TokenType.extends || this.lexer.peek().type === tokenType_1.TokenType.implements;
    };
    Parser.prototype.parseClassMembers = function () {
        return this.parseList(Nodes.ParsingContext.ClassMembers, this.parseClassElement);
    };
    Parser.prototype.parseInterfaceDeclaration = function (fullStart, decorators, modifiers) {
        var result = new Nodes.InterfaceDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        this.parseExpected(tokenType_1.TokenType.interface);
        result.name = this.parseIdentifier();
        result.typeParameters = this.parseTypeParameters();
        result.heritageClauses = this.parseHeritageClauses(/*isClassHeritageClause*/ false);
        result.members = this.parseObjectTypeMembers();
        return result;
    };
    Parser.prototype.parseTypeAliasDeclaration = function (fullStart, decorators, modifiers) {
        var result = new Nodes.TypeAliasDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        this.parseExpected(tokenType_1.TokenType.type);
        result.name = this.parseIdentifier();
        result.typeParameters = this.parseTypeParameters();
        this.parseExpected(tokenType_1.TokenType.equals);
        result.type = this.parseType();
        this.expectSemicolon();
        return result;
    };
    // Nodes.In an ambient declaration, the grammar only allows integer literals as initializers.
    // Nodes.In a non-ambient declaration, the grammar allows uninitialized members only in a
    // Nodes.ConstantEnumMemberSection, which starts at the beginning of an this.enum declaration
    // or any time an integer literal initializer is encountered.
    Parser.prototype.parseEnumMember = function () {
        var result = new Nodes.EnumMember();
        result.name = this.parsePropertyName();
        result.initializer = this.allowInAnd(this.parseNonParameterInitializer);
        return result;
    };
    Parser.prototype.parseEnumDeclaration = function (fullStart, decorators, modifiers) {
        var result = new Nodes.EnumDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        this.parseExpected(tokenType_1.TokenType.enum);
        result.name = this.parseIdentifier();
        if (this.parseExpected(tokenType_1.TokenType.openBrace)) {
            result.members = this.parseDelimitedList(Nodes.ParsingContext.EnumMembers, this.parseEnumMember);
            this.parseExpected(tokenType_1.TokenType.closeBrace);
        }
        else {
            result.members = this.createMissingList();
        }
        return result;
    };
    Parser.prototype.parseModuleBlock = function () {
        var result = new Nodes.ModuleBlock();
        if (this.parseExpected(tokenType_1.TokenType.openBrace)) {
            result.statements = this.parseList(Nodes.ParsingContext.BlockStatements, this.parseStatement);
            this.parseExpected(tokenType_1.TokenType.closeBrace);
        }
        else {
            result.statements = this.createMissingList();
        }
        return result;
    };
    Parser.prototype.parseModuleOrNamespaceDeclaration = function (fullStart, decorators, modifiers, flags) {
        var result = new Nodes.ModuleDeclaration();
        // Nodes.If we are parsing a dotted namespace name, we want to
        // propagate the 'Nodes.Namespace' flag across the names if set.
        var namespaceFlag = flags & Nodes.NodeFlags.Namespace;
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        result.flags |= flags;
        result.name = this.parseIdentifier();
        result.body = this.parseOptional(tokenType_1.TokenType.dot)
            ? this.parseModuleOrNamespaceDeclaration(this.getNodePos(), /*decorators*/ undefined, /*modifiers*/ undefined, Nodes.NodeFlags.Export | namespaceFlag)
            : this.parseModuleBlock();
        return result;
    };
    Parser.prototype.parseAmbientExternalModuleDeclaration = function (fullStart, decorators, modifiers) {
        var result = new Nodes.ModuleDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        if (this.lexer.peek().type === tokenType_1.TokenType.global) {
            // parse 'global' as name of global scope augmentation
            result.name = this.parseIdentifier();
            result.flags |= Nodes.NodeFlags.GlobalAugmentation;
        }
        else {
            result.name = this.parseLiteralNode(/*internName*/ true);
        }
        if (this.lexer.peek().type === tokenType_1.TokenType.openBrace) {
            result.body = this.parseModuleBlock();
        }
        else {
            this.expectSemicolon();
        }
        return result;
    };
    Parser.prototype.parseModuleDeclaration = function (fullStart, decorators, modifiers) {
        var flags = modifiers ? modifiers.flags : 0;
        if (this.lexer.peek().type === tokenType_1.TokenType.global) {
            // global augmentation
            return this.parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
        }
        else if (this.parseOptional(tokenType_1.TokenType.namespace)) {
            flags |= Nodes.NodeFlags.Namespace;
        }
        else {
            this.parseExpected(tokenType_1.TokenType.module);
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
        return this.nextToken() === tokenType_1.TokenType.openParen;
    };
    Parser.prototype.nextTokenIsSlash = function () {
        return this.nextToken() === tokenType_1.TokenType.slash;
    };
    Parser.prototype.parseNamespaceExportDeclaration = function (fullStart, decorators, modifiers) {
        var exportDeclaration = new Nodes.NamespaceExportDeclaration();
        exportDeclaration.decorators = decorators;
        exportDeclaration.modifiers = modifiers;
        this.parseExpected(tokenType_1.TokenType.as);
        this.parseExpected(tokenType_1.TokenType.namespace);
        exportDeclaration.name = this.parseIdentifier();
        this.parseExpected(tokenType_1.TokenType.semicolon);
        return this.finishNode(exportDeclaration);
    };
    Parser.prototype.parseImportDeclarationOrImportEqualsDeclaration = function (fullStart, decorators, modifiers) {
        this.parseExpected(tokenType_1.TokenType.import);
        var afterImportPos = this.lexer.getStartPos();
        var identifier;
        if (this.isIdentifier()) {
            identifier = this.parseIdentifier();
            if (this.lexer.peek().type !== tokenType_1.TokenType.comma && this.lexer.peek().type !== tokenType_1.TokenType.from) {
                // Nodes.ImportEquals declaration of type:
                // import x = require("mod"); or
                // import x = M.x;
                var importEqualsDeclaration = new Nodes.ImportEqualsDeclaration();
                importEqualsDeclaration.decorators = decorators;
                this.setModifiers(importEqualsDeclaration, modifiers);
                importEqualsDeclaration.name = identifier;
                this.parseExpected(tokenType_1.TokenType.equals);
                importEqualsDeclaration.moduleReference = this.parseModuleReference();
                this.expectSemicolon();
                return this.finishNode(importEqualsDeclaration);
            }
        }
        // Nodes.Import statement
        var importDeclaration = new Nodes.ImportDeclaration();
        importDeclaration.decorators = decorators;
        this.setModifiers(importDeclaration, modifiers);
        // Nodes.ImportDeclaration:
        //  import Nodes.ImportClause from Nodes.ModuleSpecifier ;
        //  import Nodes.ModuleSpecifier;
        if (identifier ||
            this.lexer.peek().type === tokenType_1.TokenType.asterisk ||
            this.lexer.peek().type === tokenType_1.TokenType.openBrace) {
            importDeclaration.importClause = this.parseImportClause(identifier, afterImportPos);
            this.parseExpected(tokenType_1.TokenType.from);
        }
        importDeclaration.moduleSpecifier = this.parseModuleSpecifier();
        this.expectSemicolon();
        return this.finishNode(importDeclaration);
    };
    Parser.prototype.parseImportClause = function (identifier, fullStart) {
        // Nodes.ImportClause:
        //  Nodes.ImportedDefaultBinding
        //  Nodes.NameSpaceImport
        //  Nodes.NamedImports
        //  Nodes.ImportedDefaultBinding, Nodes.NameSpaceImport
        //  Nodes.ImportedDefaultBinding, Nodes.NamedImports
        var importClause = new Nodes.ImportClause();
        if (identifier) {
            // Nodes.ImportedDefaultBinding:
            //  Nodes.ImportedBinding
            importClause.name = identifier;
        }
        // Nodes.If there was no default import or if there is comma this.lexer.peek().type after default import
        // parse namespace or named imports
        if (!importClause.name ||
            this.parseOptional(tokenType_1.TokenType.comma)) {
            importClause.namedBindings = this.lexer.peek().type === tokenType_1.TokenType.asterisk ? this.parseNamespaceImport() : this.parseNamedImportsOrExports(tokenType_1.TokenType.NamedImports);
        }
        return this.finishNode(importClause);
    };
    Parser.prototype.parseModuleReference = function () {
        return this.isExternalModuleReference()
            ? this.parseExternalModuleReference()
            : this.parseEntityName(/*allowReservedWords*/ false);
    };
    Parser.prototype.parseExternalModuleReference = function () {
        var result = new Nodes.ExternalModuleReference();
        this.parseExpected(tokenType_1.TokenType.require);
        this.parseExpected(tokenType_1.TokenType.openParen);
        result.expression = this.parseModuleSpecifier();
        this.parseExpected(tokenType_1.TokenType.closeParen);
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
            // Nodes.We allow arbitrary expressions here, even though the grammar only allows string
            // literals.  Nodes.We check to ensure that it is only a string literal later in the grammar
            // check pass.
            return this.parseExpression();
        }
    };
    Parser.prototype.parseNamespaceImport = function () {
        // Nodes.NameSpaceImport:
        //  * as Nodes.ImportedBinding
        var namespaceImport = new Nodes.NamespaceImport();
        this.parseExpected(tokenType_1.TokenType.asterisk);
        this.parseExpected(tokenType_1.TokenType.as);
        namespaceImport.name = this.parseIdentifier();
        return this.finishNode(namespaceImport);
    };
    Parser.prototype.parseNamedImportsOrExports = function (kind) {
        var result = new Nodes.NamedImports();
        // Nodes.NamedImports:
        //  { }
        //  { Nodes.ImportsList }
        //  { Nodes.ImportsList, }
        // Nodes.ImportsList:
        //  Nodes.ImportSpecifier
        //  Nodes.ImportsList, Nodes.ImportSpecifier
        result.elements = this.parseBracketedList(Nodes.ParsingContext.ImportOrExportSpecifiers, kind === tokenType_1.TokenType.NamedImports ? this.parseImportSpecifier : this.parseExportSpecifier, tokenType_1.TokenType.openBrace, tokenType_1.TokenType.closeBrace);
        return result;
    };
    Parser.prototype.parseExportSpecifier = function () {
        return this.parseImportOrExportSpecifier(tokenType_1.TokenType.ExportSpecifier);
    };
    Parser.prototype.parseImportSpecifier = function () {
        return this.parseImportOrExportSpecifier(tokenType_1.TokenType.ImportSpecifier);
    };
    Parser.prototype.parseImportOrExportSpecifier = function (kind) {
        var result = new Nodes.ImportSpecifier();
        // Nodes.ImportSpecifier:
        //   Nodes.BindingIdentifier
        //   Nodes.IdentifierName as Nodes.BindingIdentifier
        // Nodes.ExportSpecifier:
        //   Nodes.IdentifierName
        //   Nodes.IdentifierName as Nodes.IdentifierName
        var checkIdentifierIsKeyword = isKeyword(this.lexer.peek().type) && !this.isIdentifier();
        var checkIdentifierStart = this.lexer.getTokenPos();
        var checkIdentifierEnd = this.lexer.getTextPos();
        var identifierName = this.parseIdentifierName();
        if (this.lexer.peek().type === tokenType_1.TokenType.as) {
            result.propertyName = identifierName;
            this.parseExpected(tokenType_1.TokenType.as);
            checkIdentifierIsKeyword = isKeyword(this.lexer.peek().type) && !this.isIdentifier();
            checkIdentifierStart = this.lexer.getTokenPos();
            checkIdentifierEnd = this.lexer.getTextPos();
            result.name = this.parseIdentifierName();
        }
        else {
            result.name = identifierName;
        }
        if (kind === tokenType_1.TokenType.ImportSpecifier && checkIdentifierIsKeyword) {
            // Nodes.Report error identifier expected
            this.parseErrorAtPosition(checkIdentifierStart, checkIdentifierEnd - checkIdentifierStart, Nodes.Diagnostics.Identifier_expected);
        }
        return result;
    };
    Parser.prototype.parseExportDeclaration = function (fullStart, decorators, modifiers) {
        var result = new Nodes.ExportDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        if (this.parseOptional(tokenType_1.TokenType.asterisk)) {
            this.parseExpected(tokenType_1.TokenType.from);
            result.moduleSpecifier = this.parseModuleSpecifier();
        }
        else {
            result.exportClause = this.parseNamedImportsOrExports(tokenType_1.TokenType.NamedExports);
            // Nodes.It is not uncommon to accidentally omit the 'from' keyword. Nodes.Additionally, in editing scenarios,
            // the 'from' keyword can be parsed as a named export when the export clause is unterminated (i.e. `export { from "moduleName";`)
            // Nodes.If we don't have a 'from' keyword, see if we have a string literal such that Nodes.ASI won't take effect.
            if (this.lexer.peek().type === tokenType_1.TokenType.from || (this.lexer.peek().type === tokenType_1.TokenType.StringLiteral && !this.lexer.peek().hasLineBreakBeforeStar)) {
                this.parseExpected(tokenType_1.TokenType.from);
                result.moduleSpecifier = this.parseModuleSpecifier();
            }
        }
        this.expectSemicolon();
        return result;
    };
    Parser.prototype.parseExportAssignment = function (fullStart, decorators, modifiers) {
        var result = new Nodes.ExportAssignment();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        if (this.parseOptional(tokenType_1.TokenType.equals)) {
            result.isExportEquals = true;
        }
        else {
            this.parseExpected(tokenType_1.TokenType.default);
        }
        result.expression = this.parseAssignmentExpressionOrHigher();
        this.expectSemicolon();
        return result;
    };
    Parser.prototype.processReferenceComments = function (sourceFile) {
        var triviaScanner = createScanner(this.sourceFile.languageVersion, /*skipTrivia*/ false, Nodes.LanguageVariant.Standard, this.sourceText);
        var referencedFiles = [];
        var typeReferenceDirectives = [];
        var amdDependencies = [];
        var amdModuleName;
        // Nodes.Keep scanning all the leading trivia in the file until we get to something that
        // isn't trivia.  Nodes.Any single line comment will be analyzed to see if it is a
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
                        this.parseDiagnostics.push(createFileDiagnostic(this.sourceFile, range.pos, range.end - range.pos, Nodes.Diagnostics.An_AMD_module_cannot_have_multiple_name_assignments));
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
            return result.flags & Nodes.NodeFlags.Export
                || result.kind === tokenType_1.TokenType.ImportEqualsDeclaration && result.moduleReference.kind === tokenType_1.TokenType.ExternalModuleReference
                || result.kind === tokenType_1.TokenType.ImportDeclaration
                || result.kind === tokenType_1.TokenType.ExportAssignment
                || result.kind === tokenType_1.TokenType.ExportDeclaration
                ? result
                : undefined;
        });
    };
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map