/**
 * @fileOverview 语法解析器
 */

import {TokenType, tokenToString, isNonReservedWord, isUnaryOperator, isExpressionStart, getPrecedence, isStatementStart} from '../ast/tokenType';
import * as nodes from '../ast/nodes';
import {Lexer, Token} from './lexer';
import {options, error, ErrorType} from '../compiler/compiler';

/**
 * 表示一个语法解析器。
 * @description 语法解析器可以将源码解析一个语法树。
 */
export class Parser {

    // #region 接口

    /**
     * 获取或设置当前语法解析器使用的词法解析器。
     */
    lexer = new Lexer();

    /**
     * 解析指定的源文件。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param fileName 解析的源码位置。
     */
    private parse(text: string, start?: number, fileName?: string) {
        this.lexer.setSource(text, start, fileName);
        return this.parseSourceFile();
    }

    /**
     * 从指定的输入解析一个语句。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param fileName 解析的源码位置。
     */
    private parseAsStatement(text: string, start?: number, fileName?: string) {
        this.lexer.setSource(text, start, fileName);
        return this.parseStatement();
    }

    /**
     * 从指定的输入解析一个表达式。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param fileName 解析的源码位置。
     */
    private parseAsExpression(text: string, start?: number, fileName?: string) {
        this.lexer.setSource(text, start, fileName);
        return this.parseExpression();
    }

    /**
     * 从指定的输入解析一个类型表达式。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param fileName 解析的源码位置。
     */
    private parseAsTypeExpression(text: string, start?: number, fileName?: string) {
        this.lexer.setSource(text, start, fileName);
        return this.parseTypeExpression();
    }

    // #endregion

    // #region 解析工具

    /**
     * 报告一个语法错误。
     * @param token 发生错误的标记。
     * @param message 错误的信息。
     * @param args 格式化错误的参数。
     */
    error(token: Token, message: string, ...args: any[]) {
        error(ErrorType.syntaxError, this.lexer.fileName, token.start, token.end, message, ...args);
    }

    /**
     * 存储解析的内部标记。
     */
    private flags: ParseFlags = 0;

    /**
     * 如果下一个标记是指定的类型，则读取下一个标记。
     * @param token 期待的标记类型。
     * @returns 如果已读取标记则返回 true，否则返回 false。
     */
    private readToken(token: TokenType) {
        if (this.lexer.peek().type === token) {
            this.lexer.read();
            return true;
        }
        return false;
    }

    /**
     * 读取下一个标记。如如果下一个标记不是指定的类型则输出一条错误。
     * @param token 期待的标记。
     * @returns 如果已读取标记则返回下一个标记的开始位置，否则返回 undefined。
     */
    private expectToken(token: TokenType) {
        if (this.lexer.peek().type === token) {
            return this.lexer.read().start;
        }

        this.error(this.lexer.peek(), token === TokenType.identifier ? isKeyword(this.lexer.peek().type) ? "应输入标识符；“{0}”是关键字。" : "应输入标识符。" : "应输入“{0}”。", tokenToString(token));
    }

    /**
     * 解析一个逗号隔开的节点列表(<..., ...>。
     * @param nodes 要解析的节点列表。
     */
    private parseNodeList<T extends Node>(start: TokenType, parseElement: () => T, end: TokenType) {
        const result = new nodes.NodeList<T>();

        return result;
    }

    /**
     * 尝试在当前位置自动插入分号。
     * @return 返回插入或补齐分号后的结束位置。
     */
    private autoInsertSemicolon() {
        switch (this.lexer.peek().type) {
            case TokenType.semicolon:
                return this.lexer.read().end;
            case TokenType.closeBrace:
            case TokenType.endOfFile:
                return options.autoInsertSemicolon === false ?
                    this.expectToken(TokenType.semicolon) :
                    this.lexer.current.end;
            default:
                return options.autoInsertSemicolon === false || !this.lexer.peek().onNewLine ?
                    this.expectToken(TokenType.semicolon) :
                    this.lexer.current.end;
        }
    }

    // #endregion

    // #region 节点

    /**
     * 解析一个源文件。
     */
    private parseSourceFile() {



    }

    // #endregion

    // #region 语句

    /**
     * 解析一个语句。
     */
    private parseStatement() {
        switch (this.lexer.peek().type) {
            case TokenType.identifier:
                const identifier = this.parseIdentifier();
                return this.readToken(TokenType.colon) ?
                    this.parseLabeledStatement(identifier) :
                    this.parseRestExpressionStatement(identifier);

            case TokenType.openBrace:
                return this.parseBlockStatement();
            case TokenType.var:
            case TokenType.let:
            case TokenType.const:
                return this.parseVariableStatement();
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
                return null;
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
                if (this.isDeclaration()) {
                    return this.parseDeclaration();
                }
                break;
        }
        return this.parseExpressionStatement();
    }

    /**
     * 解析一个语句列表(...; ...)。
     */
    private parseStatementList(end?: TokenType) {
        const result = new nodes.NodeList<nodes.Statement>();
        while (true) {
            switch (this.lexer.peek().type) {
                case end:
                    return result;
                case TokenType.endOfFile:
                    if (end != undefined) {
                        this.expectToken(end);
                    }
                    return result;
            }
            result.push(this.parseStatement());
        }
    }

    /**
     * 解析一个语句块({...})。
     */
    private parseBlockStatement() {
        console.assert(this.lexer.peek().type === TokenType.openBrace);
        const result = new nodes.BlockStatement();
        result.start = this.lexer.read().start;
        result.statements = this.parseStatementList(TokenType.closeBrace);
        result.end = this.lexer.read().end;
        return result;
    }

    /**
     * 解析一个变量声明语句(var xx、let xx、const xx)。
     */
    private parseVariableStatement() {
        console.assert(this.lexer.peek().type === TokenType.var || this.lexer.peek().type === TokenType.let || this.lexer.peek().type === TokenType.const);
        const result = new nodes.VariableStatement();
        result.start = this.lexer.read().start; // var、let、const
        result.type = this.lexer.current.type;
        result.variables = this.parseVariableDeclarationList();
        result.end = this.autoInsertSemicolon();
        return result;
    }

    /**
     * 解析一个变量声明列表(xx = 1, ...)。
     */
    private parseVariableDeclarationList() {
        const result = new nodes.NodeList<nodes.VariableDeclaration>();
        do {
            result.push(this.parseVariableDeclaration());
        } while (this.readToken(TokenType.comma));
        return result;
    }

    /**
     * 解析一个变量声明(x = 1、[x] = [1]、{a: x} = {a: 1})。
     */
    private parseVariableDeclaration() {
        const result = new nodes.VariableDeclaration();
        result.name = this.parseBindingName();
        if (this.lexer.peek().type === TokenType.colon) {
            result.colon = this.lexer.read().start;
            result.type = this.parseTypeExpression();
        }
        if (this.lexer.peek().type === TokenType.equals) {
            result.equal = this.lexer.read().start;
            result.initialiser = this.parseExpressionWith(ParseFlags.disallowComma);
        }
        return result;
    }

    /**
     * 解析一个绑定名称(xx, [xx], {x:x})。
     */
    private parseBindingName(): any {
        switch (this.lexer.peek().type) {
            case TokenType.identifier:
                return this.parseIdentifier();
            case TokenType.openBracket:
            //    return this.parseArrayBindingPattern();
            // todo
            case TokenType.openBrace:
            //  return this.parseObjectBindingPattern();
            // todo
            default:
                this.expectToken(TokenType.identifier);
                return nodes.Expression.error;
        }
    }

    /**
     * 解析一个空语句(;)。
     */
    private parseEmptyStatement() {
        console.assert(this.lexer.peek().type === TokenType.semicolon);
        const result = new nodes.EmptyStatement();
        result.start = this.lexer.read().start;
        return result;
    }

    /**
     * 解析一个标签语句(xx: ...)。
     * @param label 已解析的标签部分。
     */
    private parseLabeledStatement(label: nodes.Identifier) {
        console.assert(this.lexer.peek().type === TokenType.colon);
        const result = new nodes.LabeledStatement();
        result.label = label;
        result.colon = this.lexer.read().type;
        result.body = this.parseStatement();
        return result;
    }

    /**
     * 解析一个表达式语句(x();)。
     */
    private parseExpressionStatement() {
        console.assert(isExpressionStart(this.lexer.peek().type));
        const result = new nodes.ExpressionStatement();
        result.body = this.parseExpression();
        result.end = this.autoInsertSemicolon();
        return result;
    }

    /**
     * 解析一个表达式语句(x();)。
     * @param parsed 已解析的表达式。
     */
    private parseRestExpressionStatement(parsed: nodes.Expression) {
        console.assert(isExpressionStart(this.lexer.peek().type));
        const result = new nodes.ExpressionStatement();
        result.body = this.parseRestExpression(parsed);
        result.end = this.autoInsertSemicolon();
        return result;
    }

    /**
     * 解析一个 if 语句(if(xx) ...)。
     */
    private parseIfStatement() {
        console.assert(this.lexer.peek().type === TokenType.if);
        const result = new nodes.IfStatement();
        result.start = this.lexer.read().start;
        this.parseCondition(result);
        result.then = this.parseEmbeddedStatement();
        if (this.readToken(TokenType.else)) {
            result.else = this.parseEmbeddedStatement();
        }
        return result;
    }

    /**
     * 解析条件表达式。
     */
    private parseCondition(result: nodes.IfStatement | nodes.SwitchStatement | nodes.WhileStatement | nodes.DoWhileStatement) {
        if (this.lexer.peek().type === TokenType.openParen) {
            result.openParan = this.lexer.read().type;
            result.condition = this.parseExpression();
            result.closeParan = this.expectToken(TokenType.closeParen);
        } else {
            if (options.autoInsertParenthese === false) {
                this.error(this.lexer.peek(), "应输入“(”");
            }
            result.condition = this.parseExpression();
        }
    }

    /**
     * 解析内嵌语句。
     */
    private parseEmbeddedStatement() {
        const result = this.parseStatement();
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
    }

    /**
     * 解析一个 switch 语句(switch(xx){...})。
     */
    private parseSwitchStatement() {
        console.assert(this.lexer.peek().type == TokenType.switch);
        const result = new nodes.SwitchStatement();
        result.start = this.lexer.read().start;
        if (this.lexer.peek().type !== TokenType.openBrace) {
            this.parseCondition(result);
        }
        result.cases = new nodes.NodeList<nodes.CaseClause>();
        result.cases.start = this.expectToken(TokenType.openBrace);
        while (true) {
            const start = this.lexer.peek().start;
            let label: nodes.Expression;
            switch (this.lexer.peek().start) {
                case TokenType.case:
                    if (options.allowCaseElse === false || !this.readToken(TokenType.else)) {
                        label = this.parseExpression();
                    }
                    break;
                case TokenType.default:
                    break;
                default:
                    result.cases.end = this.expectToken(TokenType.closeBrace);
                    return result;
            }

            const caseCaluse = new nodes.CaseClause();
            caseCaluse.start = start;
            caseCaluse.label = label;
            caseCaluse.colon = this.expectToken(TokenType.colon);
            caseCaluse.statements = new nodes.NodeList<nodes.Statement>();
            while (this.lexer.peek().type !== TokenType.closeBrace &&
                this.lexer.peek().type !== TokenType.case &&
                this.lexer.peek().type !== TokenType.default) {
                caseCaluse.statements.push(this.parseStatement());
            }
            result.cases.push(caseCaluse);
        }
    }

    /**
     * 解析一个 for 语句(for(var i = 0; i < 9; i++) ...)。
     */
    private parseForStatement() {
        console.assert(this.lexer.peek().type == TokenType.for);
        const start = this.lexer.read().start;
        const hasParan = this.readToken(TokenType.openParen);
        if (options.autoInsertParenthese === false && !hasParan) {
            this.error(this.lexer.peek(), "应输入“(”");
        }
        let result: nodes.ForStatement | nodes.ForInStatement | nodes.ForOfStatement | nodes.ForToStatement;
        if (this.isVariableStatement()) {
            const variableStatement = this.parseVariableStatement();
            switch (this.lexer.peek().type) {
                case TokenType.semicolon:
                    result = this.parseForStatementHeader(variableStatement);
                    break;
                case TokenType.in:
                    result = this.parseForInStatementHeader(variableStatement);
                    break;
                case TokenType.of:
                    result = options.allowForOf !== false ? this.parseForOfStatementHeader(variableStatement) : this.parseForStatementHeader(variableStatement);
                    break;
                case TokenType.to:
                    result = options.allowForTo !== false ? this.parseForToStatementHeader(variableStatement) : this.parseForStatementHeader(variableStatement);
                    break;
                default:
                    result = this.parseForStatementHeader(variableStatement);
                    break;
            }
        } else {
            result = this.parseForStatementHeader();
        }
        if (hasParan) this.expectToken(TokenType.closeParen);
        result.start = start;
        result.body = this.parseEmbeddedStatement();
        return result;
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
                return false;
        }
    }

    /**
     * 解析一个 for 语句(for(var i = 0; i < 9; i++) ...)的语句头。
     * @param initializer 已解析的变量定义部分。
     */
    private parseForStatementHeader(initializer?: nodes.VariableStatement) {
        const result = new nodes.ForStatement();
        if (initializer) {
            result.initializer = initializer;
        } else if (isExpressionStart(this.lexer.peek().type)) {
            result.initializer = this.parseExpression();
        }
        result.firstSemicolon = this.expectToken(TokenType.semicolon);
        if (isExpressionStart(this.lexer.peek().type)) {
            result.condition = this.parseExpression();
        }
        result.secondSemicolon = this.expectToken(TokenType.semicolon);
        if (isExpressionStart(this.lexer.peek().type)) {
            result.iterator = this.parseExpression();
        }
        return result;
    }

    /**
     * 解析一个 for..in 语句(for(var x in y) ...)的语句头。
     * @param initializer 已解析的变量定义部分。
     */
    private parseForInStatementHeader(initializer: nodes.VariableStatement) {
        console.assert(this.lexer.peek().type === TokenType.in);
        const result = new nodes.ForInStatement();
        result.initializer = initializer;
        result.in = this.lexer.read().start;
        // "“for in”语句中最多只能有一个变量"
        // todo
        result.condition = this.parseExpression();
        return result;
    }

    /**
     * 解析一个 for..of 语句(for(var x of y) ...)的语句头。
     * @param initializer 已解析的变量定义部分。
     */
    private parseForOfStatementHeader(initializer: nodes.VariableStatement) {
        console.assert(this.lexer.peek().type === TokenType.of);
        const result = new nodes.ForOfStatement();
        result.initializer = initializer;
        // "“for of”语句中变量不允许有初始值"
        // todo
        result.of = this.lexer.read().start;
        result.condition = this.parseExpression();
        return result;
    }

    /**
     * 解析一个 for..to 语句(for(var x = 0 to 10) ...)的语句头。
     * @param initializer 已解析的变量定义部分。
     */
    private parseForToStatementHeader(initializer: nodes.VariableStatement) {
        console.assert(this.lexer.peek().type === TokenType.to);
        const result = new nodes.ForToStatement();
        result.initializer = initializer;
        result.to = this.lexer.read().start;
        // "“for to”语句中变量不允许有初始值"
        // todo
        result.condition = this.parseExpression();
        return result;
    }

    /**
     * 解析一个 while 语句(while(...) ...)。
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
     * 解析一个 do..while 语句(do ... while(xx);)。
     */
    private parseDoWhileStatement() {
        console.assert(this.lexer.peek().type === TokenType.do);
        const result = new nodes.DoWhileStatement();
        result.start = this.lexer.read().type;
        result.body = this.parseEmbeddedStatement();
        result.while = this.expectToken(TokenType.while);
        this.parseCondition(result);
        result.end = this.autoInsertSemicolon();
        return result;
    }

    /**
     * 解析一个 continue 语句(continue xx;)。
     */
    private parseContinueStatement() {
        console.assert(this.lexer.peek().type == TokenType.continue);
        const result = new nodes.ContinueStatement();
        result.start = this.lexer.read().start;
        result.end = this.autoInsertSemicolon();
        return result;
    }

    /**
     * 解析一个 break 语句(break xx;)。
     */
    private parseBreakStatement() {
        console.assert(this.lexer.peek().type == TokenType.break);
        const result = new nodes.BreakStatement();
        result.start = this.lexer.read().start;
        result.end = this.autoInsertSemicolon();
        return result;
    }

    /**
     * 解析一个 return 语句(return xx;)。
     */
    private parseReturnStatement() {
        console.assert(this.lexer.peek().type === TokenType.return);
        const result = new nodes.ReturnStatement();
        result.start = this.lexer.read().start;
        if ((options.smartSemicolonInsertion !== false || !this.lexer.peek().onNewLine) &&
            isExpressionStart(this.lexer.peek().type)) {
            result.value = this.parseExpression();
        }
        result.end = this.autoInsertSemicolon();
        return result;
    }

    /**
     * 解析一个 throw 语句(throw xx;)。
     */
    private parseThrowStatement() {
        console.assert(this.lexer.peek().type === TokenType.throw);
        const result = new nodes.ThrowStatement();
        result.start = this.lexer.read().start;
        if (isExpressionStart(this.lexer.peek().type)) {
            if ((options.smartSemicolonInsertion !== false || !this.lexer.peek().onNewLine)) {
                result.value = this.parseExpression();
            }
        } else if (options.allowRethrow === false) {
            this.error(this.lexer.peek(), "应输入表达式。");
        }
        result.end = this.autoInsertSemicolon();
        return result;
    }

    /**
     * 解析一个 try 语句(try {...} catch(e) {...})。
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
                result.catch.openParan = this.lexer.read().start;
                result.catch.variable = this.parseBindingName();
                result.catch.openParan = this.expectToken(TokenType.closeParen);
            } else if (options.autoInsertParenthese !== false && this.isBindingName()) {
                result.catch.variable = this.parseBindingName();
            } else if (options.allowTryStatementCatchMissingVaribale !== false) {
                this.expectToken(TokenType.openParen);
            }
            result.catch.body = this.parseTryClauseBody();
        }

        if (this.lexer.peek().type === TokenType.finally) {
            result.finally = new nodes.FinallyClause();
            result.finally.start = this.lexer.read().start;
            result.finally.body = this.parseTryClauseBody();
        }

        result.end = this.autoInsertSemicolon();
        return result;

    }

    /**
     * 解析一个 try 语句的语句块。
     */
    private parseTryClauseBody() {
        if (options.autoInsertTryStatementBlock !== false) {
            return this.parseEmbeddedStatement();
        }

        if (this.lexer.peek().type === TokenType.openBrace) {
            return this.parseBlockStatement();
        }

        this.expectToken(TokenType.openBrace);
        const result = new nodes.ExpressionStatement();
        result.body = nodes.Expression.error;
        return result;
    }

    /**
     * 解析一个 debugger 语句(debugger;)。
     */
    private parseDebuggerStatement() {
        console.assert(this.lexer.peek().type == TokenType.debugger);
        const result = new nodes.DebuggerStatement();
        result.start = this.lexer.read().start;
        result.end = this.autoInsertSemicolon();
        return result;
    }

    /**
     * 解析一个 with 语句(with(...) ...)。
     */
    private parseWithStatement() {
        console.assert(this.lexer.peek().type == TokenType.debugger);
        const result = new nodes.WithStatement();
        result.start = this.lexer.read().start;
        const hasParan = this.readToken(TokenType.openParen);
        if (options.autoInsertParenthese === false && !hasParan) {
            this.error(this.lexer.peek(), "应输入“(”");
        }
        result.value = options.allowWithVaribale !== false && this.isVariableStatement() ?
            this.parseVariableStatement() :
            this.parseExpression();
        if (hasParan) this.expectToken(TokenType.closeParen);
        result.end = this.autoInsertSemicolon();
        return result;
    }

    // #endregion

    // #region 表达式

    private parseExpression(): nodes.Expression {

        //    case TokenType.endOfFile:
        //this.error(this.lexer.peek(), "应输入语句。");
        //return nodes.Statement.error;
    }

    private parseExpressionWith(flags: ParseFlags) {
        const savedFlags = this.flags;
        this.flags |= flags;
        const result = this.parseExpression();
        this.flags = savedFlags;
        return result;
    }

    /**
     * 解析一个标识符(x)。
     */
    private parseIdentifier() {

    }

    /**
     * 解析一个简单字面量(this、super、null、true、false)。
     */
    private parseSimpleLiteral() {

    }

    /**
     * 解析一个数字字面量(1)。
     */
    private parseNumericLiteral() {

    }

    /**
     * 解析一个字符串字面量('abc'、"abc"、`abc`)。
     */
    private parseStringLiteral() {

    }

    /**
     * 解析一个模板字面量(`abc${x + y}def`)。
     */
    private parseTemplateLiteral() {

    }

    /**
     * 解析一个正则表达式字面量(/abc/)。
     */
    private parseRegularExpressionLiteral() {

    }

    /**
     * 解析一个数组字面量([x, y])。
     */
    private parseArrayLiteral() {

    }

    /**
     * 解析一个对象字面量({x: y})。
     */
    private parseObjectLiteral() {

    }

    /**
     * 解析一个函数表达式(function () {})。
     */
    private parseFunctionExpression() {





    }

    /**
     * 解析一个箭头函数表达式(x => y)。
     */
    private parseArrowFunctionExpression() {



    }

    /**
     * 解析一个类表达式(class xx {})。
     */
    private parseClassExpression() {





    }

    /**
     * 解析一个接口表达式(interface xx {})。
     */
    private parseInterfaceExpression() {




    }

    /**
     * 解析一个枚举表达式(enum xx {})。
     */
    private parseEnumExpression() {


    }

    /**
     * 解析一个括号表达式((x))。
     */
    private parseParenthesizedExpression() {

    }

    /**
     * 解析一个成员调用表达式(x.y)。
     */
    private parseMemberCallExpression() {


    }

    /**
     * 解析一个函数调用表达式(x())。
     */
    private parseFunctionCallExpression() {


    }

    /**
     * 解析一个索引调用表达式(x[y])。
     */
    private parseIndexCallExpression() {


    }

    /**
     * 解析一个模板调用表达式(x`abc`)。
     */
    private parseTemplateCallExpression() {


    }

    /**
     * 解析一个 new 表达式(new x())。
     */
    private parseNewExpression() {


    }

    /**
     * 解析一个 new.target 表达式(new.target)。
     */
    private parseNewTargetExpression() {

    }

    /**
     * 解析一个一元运算表达式(+x、typeof x、...)。
     */
    private parseUnaryExpression() {

    }

    /**
     * 解析一个二元运算表达式(x + y、x = y、...)。
     */
    private parseBinaryExpression() {


    }

    /**
     * 解析一个 yield 表达式(yield x、yield * x)。
     */
    private parseYieldExpression() {

    }

    /**
     * 解析一个条件表达式(x ? y : z)。
     */
    private parseConditionalExpression() {



    }

    /**
     * 解析一个类型转换表达式(<T>xx)。
     */
    private parseTypeCastExpression() {


    }

    /**
     * 解析一个泛型表达式(Array<T>)。
     */
    private parseGenericTypeExpression() {


    }

    /**
     * 解析一个数组类型表达式(T[])。
     */
    private parseArrayTypeExpression() {

    }

    // #endregion

    // #region 成员声明

    /**
     * 解析一个修饰器(@xx)。
     */
    private parseDecorator() {

    }

    /**
     * 解析一个修饰符(static、private、...)。
     */
    private parseModifier() {

    }

    /**
     * 解析一个函数声明(function fn() {...}、function * fn(){...})。
     */
    private parseFunctionDeclaration() {







    }

    /**
     * 解析一个泛型参数声明。
     */
    private parseGenericParameterDeclaration() {


    }

    /**
     * 解析一个参数声明(x、x = 1、...x)。
     */
    private parseParameterDeclaration() {




    }

    /**
     * 解析一个类声明(class T {...})。
     */
    private parseClassDeclaration() {







    }

    /**
     * 解析一个属性声明(x: 1)。
     */
    private parsePropertyDeclaration() {



    }

    /**
     * 解析一个方法声明(fn() {...})。
     */
    private parseMethodDeclaration() {







    }

    /**
     * 解析一个解析器声明(get fn() {...}、set fn() {...})。
     */
    private parseAccessorDeclaration() {







    }

    /**
     * 解析一个接口声明(interface T {...})。
     */
    private parseInterfaceDeclaration() {






    }

    /**
     * 解析一个枚举声明(enum T {})。
     */
    private parseEnumDeclaration() {




    }

    /**
     * 解析一个枚举成员声明(xx = 1)。
     */
    private parseEnumMemberDeclaration() {




    }

    /**
     * 解析一个命名空间声明(namespace abc {...}、module abc {...})。
     */
    private parseNamespaceDeclaration() {


    }

    // #endregion

    // #region 导入和导出

    /**
     * 解析一个 import 指令(import xx from '...';)。
     */
    private parseImportDirective() {


    }

    /**
     * 解析一个 import = 指令(import xx = require("");)。
     */
    private parseImportEqualsDirective() {

    }

    /**
     * 解析一个名字导入声明项(a as b)。
     */
    private parseNameImportClause() {


    }

    /**
     * 解析一个命名空间导入声明项({a as b})。
     */
    private parseNamespaceImportClause() {

    }

    /**
     * 解析一个 export 指令(export xx from '...';)。
     */
    private parseExportDirective() {


    }

    /**
     * 解析一个 export = 指令(export = 1;)。
     */
    private parseExportEqualsDirective() {

    }


    // #endregion

    // #region Jsx 节点

    /**
     * 解析一个 JSX 标签(<div>...</div>)。
     */
    private parseJsxElement() {



    }

    /**
     * 解析一个 JSX 标签属性(id="a")。
     */
    private parseJsxAttribute() {


    }

    /**
     * 解析一个 JSX 文本({...})。
     */
    private parseJsxText() {

    }

    /**
     * 解析一个 JSX 表达式({...})。
     */
    private parseJsxExpression() {

    }

    /**
     * 解析一个 JSX 关闭元素({...})。
     */
    private parseJsxClosingElement() {

    }



    // #endregion

    // #region 绑定名称

    /**
     * 解析一个数组绑定模式项(xx, ..)
     */
    private parseArrayBindingElement() {

    }

    /**
     * 解析一个对象绑定模式项(xx: y)
     */
    private parseObjectBindingElement() {

    }

    /**
     * 解析一个已计算的属性名。
     */
    private parseComputedPropertyName() {

    }

    // #endregion

    // #region 注释

    /**
     * 解析一个 JS 注释。
     */
    private parseComment() {

    }

    /**
     * 解析一个 JS 文档注释。
     */
    private parseJsDocComment() {

    }



    // #endregion

    ///**
    // * 解析一个逗号隔开的节点列表(<..., ...>。
    // */
    //parseNodeList<T extends nodes.Node>(nodes: nodes.NodeList<T>) {
    //    for (const node of nodes) {

    //    }
    //}

}

enum ParseFlags {

    disallowComma,

    disallowIn,

    allowYield,

    allowAwait,

}