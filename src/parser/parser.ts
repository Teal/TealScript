/**
 * @fileOverview 语法解析器
 */

import {options, error, ErrorType} from '../compiler/compiler';
import {TokenType} from './tokenType';
import * as Tokens from './tokenType';
import * as Nodes from './nodes';
import {CharCode} from './charCode';
import {TextRange} from './textRange';
import {Lexer, Token} from './lexer';

/**
 * 表示一个语法解析器。c
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
        return this.parseSourceFile(text || "", start || 0, fileName || "");
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
        delete this.lexer.comment;
        this.lexer.setSource(text, start, fileName);
        return this.parseTypeExpression();
    }

    // #endregion

    // #region 底层

    /**
     * 报告一个语法错误。
     * @param range 发生错误的位置。
     * @param message 错误的信息。
     * @param args 格式化错误的参数。
     */
    error(range: TextRange, message: string, ...args: any[]) {
        error(ErrorType.syntaxError, this.lexer.fileName, range.start, range.end, message, ...args);
    }

    /**
     * 读取下一个标记。如果下一个标记不是指定的类型则输出一条错误。
     * @param token 期待的标记。
     * @returns 返回读取的标记。
     */
    private expectToken(token: TokenType) {
        if (this.lexer.peek().type === token) {
            return this.lexer.read();
        }

        this.error(this.lexer.peek(), token === TokenType.identifier ? Tokens.isKeyword(this.lexer.peek().type) ? "应输入标识符；“{0}”是关键字。" : "应输入标识符。" : "应输入“{0}”。", Tokens.tokenToString(token));
        return this.lexer.current;
    }

    /**
     * 读取一个分号，如果不存在则自动插入。
     * @return 返回分号或自动插入点的结束位置。
     */
    private expectSemicolon() {
        switch (this.lexer.peek().type) {
            case TokenType.semicolon:
                return this.lexer.read().end;
            case TokenType.closeBrace:
            case TokenType.endOfFile:
                return !options.disallowMissingSemicolon ?
                    this.expectToken(TokenType.semicolon).end :
                    this.lexer.current.end;
            default:
                // 根据标准：只有出现换行时才允许自动插入分号。
                // 当启用 smartSemicolonInsertion 时，将允许在未换行时自动插入分号。
                return options.disallowMissingSemicolon || (options.smartSemicolonInsertion === false && !this.lexer.peek().hasLineBreakBeforeStart) ?
                    this.expectToken(TokenType.semicolon).end :
                    this.lexer.current.end;
        }
    }

    /**
     * 读取一个标识符，如果是关键字则自动转换。
     * @return 返回标识符节点。
     */
    private expectIdentifier(): Nodes.Identifier {

    }

    // #endregion

    // #region 节点

    // #endregion

    // #region 语句

    /**
     * 解析一个语句。
     */
    private parseStatement() {
        switch (this.lexer.peek().type) {
            case TokenType.semicolon:
                return this.parseEmptyStatement();
            case TokenType.openBrace:
                return this.parseBlockStatement(/*ignoreMissingOpenBrace*/ false);
            case TokenType.var:
                return this.parseVariableStatement(this.lexer.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case TokenType.let:
                if (this.isLetDeclaration()) {
                    return this.parseVariableStatement(this.lexer.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
                }
                break;
            case TokenType.function:
                return this.parseFunctionDeclaration(this.lexer.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case TokenType.class:
                return this.parseClassDeclaration(this.lexer.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
            case TokenType.if:
                return this.parseIfStatement();
            case TokenType.do:
                return this.parseDoStatement();
            case TokenType.while:
                return this.parseWhileStatement();
            case TokenType.for:
                return this.parseForStatement();
            case TokenType.break:
                return this.parseBreakOrContinueStatement(TokenType.BreakStatement);
            case TokenType.continue:
                return this.parseBreakOrContinueStatement(TokenType.ContinueStatement);
            case TokenType.return:
                return this.parseReturnStatement();
            case TokenType.with:
                return this.parseWithStatement();
            case TokenType.switch:
                return this.parseSwitchStatement();
            case TokenType.throw:
                return this.parseThrowStatement();
            case TokenType.try:
            // Nodes.Include 'catch' and 'finally' for error recovery.
            case TokenType.catch:
            case TokenType.finally:
                return this.parseTryStatement();
            case TokenType.debugger:
                return this.parseDebuggerStatement();
            case TokenType.at:
                return this.parseDeclaration();
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
        return this.parseExpressionOrLabeledStatement();
    }

    /**
     * 解析一个语句块(`{...}`)。
     */
    private parseBlockStatement() {
        console.assert(this.lexer.peek().type === TokenType.openBrace);
        const result = new Nodes.BlockStatement();
        result.statements = new Nodes.NodeList<Nodes.Statement>();
        result.statements.start = this.lexer.read().start;
        while (true) {
            switch (this.lexer.peek().type) {
                case TokenType.closeBrace:
                    result.statements.end = this.lexer.read().end;
                    return result;
                case TokenType.endOfFile:
                    result.statements.end = this.expectToken(TokenType.closeBrace).end;
                    return result;
            }
            result.statements.push(this.parseStatement());
        }
    }

    /**
     * 解析一个变量声明语句(`var x`、`let x`、`const x`)。
     */
    private parseVariableStatement() {
        console.assert(this.lexer.peek().type === TokenType.var || this.lexer.peek().type === TokenType.let || this.lexer.peek().type === TokenType.const);
        const result = new Nodes.VariableStatement();
        this.parseJsDocComment(result);
        result.start = this.lexer.read().start;
        result.type = this.lexer.current.type;
        result.variables = new Nodes.NodeList<Nodes.VariableDeclaration>();
        result.variables.commaTokens = [];
        while (true) {
            result.variables.push(this.parseVariableDeclaration());
            if (this.lexer.peek().type === TokenType.comma) {
                result.variables.commaTokens.push(this.lexer.read().start);
                continue;
            }
            break;
        };
        result.end = this.expectSemicolon();
        return result;
    }

    /**
     * 解析一个变量声明(`x = 1`、`[x] = [1]`、`{a: x} = {a: 1}`)。
     */
    private parseVariableDeclaration() {
        const result = new Nodes.VariableDeclaration();
        result.name = this.parseBindingName();
        if (this.lexer.peek().type === TokenType.colon) {
            result.colonToken = this.lexer.read().start;
            result.type = this.parseTypeNode();
        }
        if (this.lexer.peek().type === TokenType.equals) {
            result.equalToken = this.lexer.read().start;
            result.initializer = this.parseExpressionWithoutComma();
        } else if (!this.lexer.peek().hasLineBreakBeforeStart && Tokens.isExpressionStart(this.lexer.peek().type)) {
            // var x 2：需要提示“缺少等号”。
            result.equalToken = this.expectToken(TokenType.equals).start;
            result.initializer = this.parseExpressionWithoutComma();
        }
        return result;
    }

    /**
     * 解析一个空语句(`;`)。
     */
    private parseEmptyStatement() {
        console.assert(this.lexer.peek().type === TokenType.semicolon);
        const result = new Nodes.EmptyStatement();
        result.start = this.lexer.read().start;
        return result;
    }

    /**
     * 解析一个标签语句(`xx: ...`)。
     * @param label 已解析的标签部分。
     */
    private parseLabeledStatement(label: Nodes.Identifier) {
        console.assert(this.lexer.peek().type === TokenType.colon);
        const result = new Nodes.LabeledStatement();
        this.parseJsDocComment(result);
        result.label = label;
        result.colonToken = this.lexer.read().type;
        result.body = this.parseStatement();
        return result;
    }

    /**
     * 解析一个表达式语句(`x();`)。
     */
    private parseExpressionStatement() {
        console.assert(Tokens.isExpressionStart(this.lexer.peek().type));
        const result = new Nodes.ExpressionStatement();
        result.body = this.parseExpression();
        result.end = this.expectSemicolon();
        return result;
    }

    /**
     * 解析一个表达式语句(x(`);`)。
     * @param parsed 已解析的表达式。
     */
    private parseExpressionStatementRest(parsed: Nodes.Expression) {
        const result = new Nodes.ExpressionStatement();
        result.body = this.parseExpressionRest(parsed);
        result.end = this.expectSemicolon();
        return result;
    }

    /**
     * 解析一个 if 语句(`if(x) ...`)。
     */
    private parseIfStatement() {
        console.assert(this.lexer.peek().type === TokenType.if);
        const result = new Nodes.IfStatement();
        result.start = this.lexer.read().start;
        this.parseCondition(result);
        result.then = this.parseEmbeddedStatement();
        if (this.lexer.peek().type === TokenType.else) {
            result.elseToken = this.lexer.read().start;
            result.else = this.parseEmbeddedStatement();
        }
        return result;
    }

    /**
     * 解析内嵌语句。
     */
    private parseEmbeddedStatement() {
        const result = this.parseStatement();
        switch (result.constructor) {
            case Nodes.VariableStatement:
                this.error(result, "嵌套语句不能是变量声明语句。");
                break;
            case Nodes.LabeledStatement:
                this.error(result, "嵌套语句不能是标签语句。");
                break;
        }
        return result;
    }

    /**
     * 解析条件表达式。
     * @param result 存放结果的语句。
     */
    private parseCondition(result: Nodes.IfStatement | Nodes.SwitchStatement | Nodes.WhileStatement | Nodes.DoWhileStatement) {
        if (this.lexer.peek().type === TokenType.openParen) {
            result.openParanToken = this.lexer.read().type;
            result.condition = this.parseExpression();
            result.closeParanToken = this.expectToken(TokenType.closeParen).start;
        } else {
            if (!options.disallowMissingParenthese) {
                this.expectToken(TokenType.openParen);
            }
            result.condition = this.parseExpression();
        }
    }

    /**
     * 解析一个 switch 语句(`switch(x) {...}`)。
     */
    private parseSwitchStatement() {
        console.assert(this.lexer.peek().type == TokenType.switch);
        const result = new Nodes.SwitchStatement();
        result.start = this.lexer.read().start;
        if (!options.disallowMissingSwitchCondition || this.lexer.peek().type !== TokenType.openBrace) {
            this.parseCondition(result);
        }
        result.cases = new Nodes.NodeList<Nodes.CaseClause>();
        result.cases.start = this.expectToken(TokenType.openBrace).start;
        while (true) {
            switch (this.lexer.peek().type) {
                case TokenType.case:
                case TokenType.default:
                    break;
                case TokenType.closeBrace:
                    result.cases.end = this.lexer.read().start;
                    return result;
                default:
                    this.error(this.lexer.peek(), "应输入“case”或“default”。");
                    result.cases.end = this.lexer.current.end;
                    return result;
            }

            const caseCaluse = new Nodes.CaseClause();
            caseCaluse.start = this.lexer.read().start;
            if (this.lexer.current.type === TokenType.case) {
                if (!options.disallowCaseElse && this.lexer.peek().type === TokenType.else) {
                    caseCaluse.elseToken = this.lexer.read().start;
                } else {
                    caseCaluse.label = this.parseExpression();
                }
            }
            caseCaluse.colonToken = this.expectToken(TokenType.colon).start;
            caseCaluse.statements = new Nodes.NodeList<Nodes.Statement>();
            while (this.lexer.peek().type !== TokenType.closeBrace &&
                this.lexer.peek().type !== TokenType.case &&
                this.lexer.peek().type !== TokenType.default &&
                this.lexer.peek().type !== TokenType.endOfFile) {
                caseCaluse.statements.push(this.parseStatement());
            }
            result.cases.push(caseCaluse);
        }
    }

    /**
     * 解析一个 for 语句(`for(var i = 0; i < 9; i++) ...`)。
     */
    private parseForStatement() {
        console.assert(this.lexer.peek().type == TokenType.for);
        const start = this.lexer.read().start;
        const openParan = this.lexer.peek().type === TokenType.openParen ?
            this.lexer.read().start : undefined;
        if (openParan == undefined && !options.disallowMissingParenthese) {
            this.expectToken(TokenType.openParen);
        }

        const disallowIn = this.disallowIn;
        this.disallowIn = true;
        const initializer = this.lexer.peek().type === TokenType.semicolon ? undefined : this.isVariableStatement() ? this.parseVariableStatement() : this.parseExpression();
        this.disallowIn = disallowIn;

        let type = this.lexer.peek().type;
        switch (type) {
            case TokenType.semicolon:
            case TokenType.in:
                break;
            case TokenType.of:
                if (!options.disallowForOf) {
                    type = TokenType.semicolon;
                }
                break;
            case TokenType.to:
                if (!options.disallowForTo) {
                    type = TokenType.semicolon;
                }
                break;
            default:
                type = TokenType.semicolon;
                break;
        }

        if (type !== TokenType.semicolon) {
            switch (initializer.constructor) {
                case Nodes.VariableStatement:
                    if (options.disallowCompatibleForInAndForOf) {
                        const variables = (<Nodes.VariableStatement>initializer).variables;
                        if (type !== TokenType.to && variables[0].initializer) this.error(variables[0].initializer, type === TokenType.in ? "在 for..in 语句变量不能有初始值。" : "在 for..of 语句变量不能有初始值。");
                        if (variables.length > 1) {
                            this.error(variables[1].name, type === TokenType.in ? "在 for..in 语句中只能定义一个变量。" :
                                type === TokenType.of ? "在 for..of 语句中只能定义一个变量。" :
                                    "在 for..to 语句中只能定义一个变量。");
                        }
                    }
                    break;
                case Nodes.Identifier:
                    break;
                default:
                    this.error(initializer, type === TokenType.in ? "在 for..in 语句的左边只能是标识符。" :
                        type === TokenType.of ? "在 for..of 语句的左边只能是标识符。" :
                            "在 for..to 语句的左边只能是标识符。");
                    break;
            }
        }

        let result: Nodes.ForStatement | Nodes.ForInStatement | Nodes.ForOfStatement | Nodes.ForToStatement;
        switch (type) {
            case TokenType.semicolon:
                result = new Nodes.ForStatement();
                (<Nodes.ForStatement>result).firstSemicolonToken = this.expectToken(TokenType.semicolon).start;
                if (this.lexer.peek().type !== TokenType.semicolon) {
                    result.condition = this.parseExpression();
                }
                (<Nodes.ForStatement>result).secondSemicolonToken = this.expectToken(TokenType.semicolon).start;
                if (openParan != undefined ? this.lexer.peek().type !== TokenType.closeParen : Tokens.isExpressionStart(this.lexer.peek().type)) {
                    (<Nodes.ForStatement>result).iterator = this.parseExpression();
                }
                break;
            case TokenType.in:
                result = new Nodes.ForInStatement();
                (<Nodes.ForInStatement>result).inToken = this.lexer.read().start;
                result.condition = this.parseExpression();
                break;
            case TokenType.of:
                result = new Nodes.ForOfStatement();
                (<Nodes.ForOfStatement>result).ofToken = this.lexer.read().start;
                result.condition = options.disallowForOfCommaExpression ? this.parseAssignmentExpressionOrHigher() : this.parseExpression();
                break;
            case TokenType.to:
                result = new Nodes.ForToStatement();
                (<Nodes.ForToStatement>result).toToken = this.lexer.read().start;
                result.condition = this.parseExpression();
                break;
        }

        result.start = start;
        if (initializer) {
            result.initializer = initializer;
        }
        if (openParan != undefined) {
            result.openParanToken = openParan;
            result.closeParanToken = this.expectToken(TokenType.closeParen).start;
        }
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
     * 解析一个 while 语句(`while(x) ...`)。
     */
    private parseWhileStatement() {
        console.assert(this.lexer.peek().type === TokenType.while);
        const result = new Nodes.WhileStatement();
        result.start = this.lexer.read().start;
        this.parseCondition(result);
        result.body = this.parseEmbeddedStatement();
        return result;
    }

    /**
     * 解析一个 do..while 语句(`do ... while(x);`)。
     */
    private parseDoWhileStatement() {
        console.assert(this.lexer.peek().type === TokenType.do);
        const result = new Nodes.DoWhileStatement();
        result.start = this.lexer.read().type;
        result.body = this.parseEmbeddedStatement();
        result.whileToken = this.expectToken(TokenType.while).start;
        this.parseCondition(result);
        result.end = this.expectSemicolon();
        return result;
    }

    /**
     * 解析一个 break 语句(`break xx;`)。
     */
    private parseBreakStatement() {
        console.assert(this.lexer.peek().type === TokenType.break);
        const result = new Nodes.BreakStatement();
        result.start = this.lexer.read().start;
        if (this.lexer.peek().type === TokenType.identifier) {
            result.label = this.parseIdentifier();
        }
        result.end = this.expectSemicolon();
        return result;
    }

    /**
     * 解析一个 continue 语句(`continue xx;`)。
     */
    private parseContinueStatement() {
        console.assert(this.lexer.peek().type === TokenType.continue);
        const result = new Nodes.ContinueStatement();
        result.start = this.lexer.read().start;
        if (this.lexer.peek().type === TokenType.identifier) {
            result.label = this.parseIdentifier();
        }
        result.end = this.expectSemicolon();
        return result;
    }

    private parseBreakOrContinueStatement(kind: TokenType): Nodes.BreakOrContinueStatement {
        const result = new Nodes.BreakOrContinueStatement();

        this.parseExpected(kind === TokenType.BreakStatement ? TokenType.break : TokenType.continue);
        if (!this.canParseSemicolon()) {
            result.label = this.parseIdentifier();
        }

        this.expectSemicolon();
        return result;
    }

    // #endregion

    private parseJsDocComment(result) {

    }

    // #region 未整理

    private disallowInAndDecoratorContext = NodeFlags.DisallowInContext | NodeFlags.DecoratorContext;

    // capture constructors in 'this.initializeState' to avoid null checks
    private NodeConstructor: new (kind: TokenType, pos: number, end: number) => Nodes.Node;
    private SourceFileConstructor: new (kind: TokenType, pos: number, end: number) => Nodes.Node;

    private sourceFile: Nodes.SourceFile;
    private parseDiagnostics: Nodes.Diagnostic[];
    private syntaxCursor: Nodes.IncrementalParser.SyntaxCursor;

    private token: TokenType;
    private sourceText: string;
    private nodeCount: number;
    private identifiers: Nodes.Map<string>;
    private identifierCount: number;

    private parsingContext: Nodes.ParsingContext;

    // Nodes.Flags that dictate what parsing context we're in.  Nodes.For example:
    // Nodes.Whether or not we are in strict parsing mode.  Nodes.All that changes in strict parsing mode is
    // that some tokens that would be considered this.identifiers may be considered keywords.
    //
    // Nodes.When adding more parser context flags, consider which is the more common case that the
    // flag will be in.  Nodes.This should be the 'false' state for that flag.  Nodes.The reason for this is
    // that we don't store data in our nodes unless the value is in the *non-default* state.  Nodes.So,
    // for example, more often than code 'allows-in' (or doesn't 'disallow-in').  Nodes.We opt for
    // 'disallow-in' set to 'false'.  Nodes.Otherwise, if we had 'allowsIn' set to 'true', then almost
    // all nodes would need extra state on them to store this info.
    //
    // Nodes.Note:  'allowIn' and 'allowYield' track 1:1 with the [in] and [yield] concepts in the Nodes.ES6
    // grammar specification.
    //
    // Nodes.An important thing about these context concepts.  Nodes.By default they are effectively inherited
    // while parsing through every grammar production.  i.e. if you don't change them, then when
    // you parse a sub-production, it will have the same context values as the parent production.
    // Nodes.This is great most of the time.  Nodes.After all, consider all the 'expression' grammar productions
    // and how nearly all of them pass along the 'in' and 'yield' context values:
    //
    // Nodes.EqualityExpression[Nodes.In, Nodes.Yield] :
    //      Nodes.RelationalExpression[?Nodes.In, ?Nodes.Yield]
    //      Nodes.EqualityExpression[?Nodes.In, ?Nodes.Yield] == Nodes.RelationalExpression[?Nodes.In, ?Nodes.Yield]
    //      Nodes.EqualityExpression[?Nodes.In, ?Nodes.Yield] != Nodes.RelationalExpression[?Nodes.In, ?Nodes.Yield]
    //      Nodes.EqualityExpression[?Nodes.In, ?Nodes.Yield] === Nodes.RelationalExpression[?Nodes.In, ?Nodes.Yield]
    //      Nodes.EqualityExpression[?Nodes.In, ?Nodes.Yield] !== Nodes.RelationalExpression[?Nodes.In, ?Nodes.Yield]
    //
    // Nodes.Where you have to be careful is then understanding what the points are in the grammar
    // where the values are *not* passed along.  Nodes.For example:
    //
    // Nodes.SingleNameBinding[Nodes.Yield,Nodes.GeneratorParameter]
    //      [+Nodes.GeneratorParameter]Nodes.BindingIdentifier[Nodes.Yield] Nodes.Initializer[Nodes.In]opt
    //      [~Nodes.GeneratorParameter]Nodes.BindingIdentifier[?Nodes.Yield]Nodes.Initializer[Nodes.In, ?Nodes.Yield]opt
    //
    // Nodes.Here this is saying that if the Nodes.GeneratorParameter context flag is set, that we should
    // explicitly set the 'yield' context flag to false before calling into the Nodes.BindingIdentifier
    // and we should explicitly unset the 'yield' context flag before calling into the Nodes.Initializer.
    // production.  Nodes.Conversely, if the Nodes.GeneratorParameter context flag is not set, then we
    // should leave the 'yield' context flag alone.
    //
    // Nodes.Getting this all correct is tricky and requires careful reading of the grammar to
    // understand when these values should be changed versus when they should be inherited.
    //
    // Nodes.Note: it should not be necessary to save/restore these flags during speculative/lookahead
    // parsing.  Nodes.These context flags are naturally stored and restored through normal recursive
    // descent parsing and unwinding.
    private contextFlags: Nodes.NodeFlags;

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
    private parseErrorBeforeNextFinishedNode = false;

    private parseSourceFile(fileName: string, _sourceText: string, languageVersion: Nodes.ScriptTarget, _syntaxCursor: Nodes.IncrementalParser.SyntaxCursor, setParentNodes?: boolean, scriptKind?: Nodes.ScriptKind): Nodes.SourceFile {
        scriptKind = ensureScriptKind(fileName, scriptKind);

        this.initializeState(fileName, _sourceText, languageVersion, _syntaxCursor, scriptKind);

        const this.result = this.parseSourceFileWorker(fileName, languageVersion, setParentNodes, scriptKind);

        this.clearState();

        return this.result;
    }

    private initializeState(fileName: string, _sourceText: string, languageVersion: Nodes.ScriptTarget, _syntaxCursor: Nodes.IncrementalParser.SyntaxCursor, scriptKind: Nodes.ScriptKind) {
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
    }

    private clearState() {
        // Nodes.Clear out the text the this.scanner is pointing at, so it doesn't keep anything alive unnecessarily.
        this.lexer.setText("");

        // Nodes.Clear any data.  Nodes.We don't want to accidentally hold onto it for too long.
        this.parseDiagnostics = undefined;
        this.sourceFile = undefined;
        this.identifiers = undefined;
        this.syntaxCursor = undefined;
        this.sourceText = undefined;
    }

    private parseSourceFileWorker(fileName: string, languageVersion: Nodes.ScriptTarget, setParentNodes: boolean, scriptKind: Nodes.ScriptKind): Nodes.SourceFile {
        this.sourceFile = this.createSourceFile(fileName, languageVersion, scriptKind);
        this.sourceFile.flags = this.contextFlags;

        // Nodes.Prime the this.scanner.
        this.lexer.peek().type = this.nextToken();
        this.processReferenceComments(this.sourceFile);

        this.sourceFile.statements = this.parseList(Nodes.ParsingContext.SourceElements, this.parseStatement);
        console.assert(this.lexer.peek().type === TokenType.endOfFile);
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
    }

    private parseJsDocComment<T extends Nodes.Node>(result: T): T {
        if (this.contextFlags & Nodes.NodeFlags.JavaScriptFile) {
            const comments = getLeadingCommentRangesOfNode(result, this.sourceFile);
            if (comments) {
                for (const comment of comments) {
                    const jsDocComment = Nodes.JSDocParser.parseJSDocComment(result, comment.pos, comment.end - comment.pos);
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
    }

    private fixupParentReferences(rootNode: Nodes.Node) {
        // normally parent references are set during binding. Nodes.However, for clients that only need
        // a syntax tree, and no semantic features, then the binding process is an unnecessary
        // overhead.  Nodes.This functions allows us to set all the parents, without all the expense of
        // binding.

        let parent: Nodes.Node = rootNode;
        forEachChild(rootNode, visitNode);
        return;

        function visitNode(n: Nodes.Node): void {
            // walk down setting parents that differ from the parent we think it should be.  Nodes.This
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

    private createSourceFile(fileName: string, languageVersion: Nodes.ScriptTarget, scriptKind: Nodes.ScriptKind): Nodes.SourceFile {
        // code from this.createNode is inlined here so this.createNode won't have to deal with special case of creating source files
        // this is quite rare comparing to other nodes and this.createNode should be as fast as possible
        const this.sourceFile = <Nodes.SourceFile>new this.SourceFileConstructor(TokenType.SourceFile, /*pos*/ 0, /* end */ this.sourceText.length);
        this.nodeCount++;

        this.sourceFile.text = this.sourceText;
        this.sourceFile.bindDiagnostics = [];
        this.sourceFile.languageVersion = languageVersion;
        this.sourceFile.fileName = normalizePath(fileName);
        this.sourceFile.languageVariant = getLanguageVariant(scriptKind);
        this.sourceFile.isDeclarationFile = fileExtensionIs(this.sourceFile.fileName, ".d.ts");
        this.sourceFile.scriptKind = scriptKind;

        return this.sourceFile;
    }

    private setContextFlag(val: boolean, flag: Nodes.NodeFlags) {
        if (val) {
            this.contextFlags |= flag;
        }
        else {
            this.contextFlags &= ~flag;
        }
    }

    private setDisallowInContext(val: boolean) {
        this.setContextFlag(val, Nodes.NodeFlags.DisallowInContext);
    }

    private setYieldContext(val: boolean) {
        this.setContextFlag(val, Nodes.NodeFlags.YieldContext);
    }

    private setDecoratorContext(val: boolean) {
        this.setContextFlag(val, Nodes.NodeFlags.DecoratorContext);
    }

    private setAwaitContext(val: boolean) {
        this.setContextFlag(val, Nodes.NodeFlags.AwaitContext);
    }

    private doOutsideOfContext<T>(context: Nodes.NodeFlags, func: () => T): T {
        // contextFlagsToClear will contain only the context flags that are
        // currently set that we need to temporarily clear
        // Nodes.We don't just blindly reset to the previous flags to ensure
        // that we do not mutate cached flags for the incremental
        // parser (Nodes.ThisNodeHasError, Nodes.ThisNodeOrAnySubNodesHasError, and
        // Nodes.HasAggregatedChildData).
        const contextFlagsToClear = context & this.contextFlags;
        if (contextFlagsToClear) {
            // clear the requested context flags
            this.setContextFlag(/*val*/ false, contextFlagsToClear);
            const this.result = func();
            // restore the context flags we just cleared
            this.setContextFlag(/*val*/ true, contextFlagsToClear);
            return this.result;
        }

        // no need to do anything special as we are not in any of the requested contexts
        return func();
    }

    private doInsideOfContext<T>(context: Nodes.NodeFlags, func: () => T): T {
        // contextFlagsToSet will contain only the context flags that
        // are not currently set that we need to temporarily enable.
        // Nodes.We don't just blindly reset to the previous flags to ensure
        // that we do not mutate cached flags for the incremental
        // parser (Nodes.ThisNodeHasError, Nodes.ThisNodeOrAnySubNodesHasError, and
        // Nodes.HasAggregatedChildData).
        const contextFlagsToSet = context & ~this.contextFlags;
        if (contextFlagsToSet) {
            // set the requested context flags
            this.setContextFlag(/*val*/ true, contextFlagsToSet);
            const this.result = func();
            // reset the context flags we just set
            this.setContextFlag(/*val*/ false, contextFlagsToSet);
            return this.result;
        }

        // no need to do anything special as we are already in all of the requested contexts
        return func();
    }

    private allowInAnd<T>(func: () => T): T {
        return this.doOutsideOfContext(Nodes.NodeFlags.DisallowInContext, func);
    }

    private disallowInAnd<T>(func: () => T): T {
        return this.doInsideOfContext(Nodes.NodeFlags.DisallowInContext, func);
    }

    private doInYieldContext<T>(func: () => T): T {
        return this.doInsideOfContext(Nodes.NodeFlags.YieldContext, func);
    }

    private doInDecoratorContext<T>(func: () => T): T {
        return this.doInsideOfContext(Nodes.NodeFlags.DecoratorContext, func);
    }

    private doInAwaitContext<T>(func: () => T): T {
        return this.doInsideOfContext(Nodes.NodeFlags.AwaitContext, func);
    }

    private doOutsideOfAwaitContext<T>(func: () => T): T {
        return this.doOutsideOfContext(Nodes.NodeFlags.AwaitContext, func);
    }

    private doInYieldAndAwaitContext<T>(func: () => T): T {
        return this.doInsideOfContext(Nodes.NodeFlags.YieldContext | Nodes.NodeFlags.AwaitContext, func);
    }

    private inContext(flags: Nodes.NodeFlags) {
        return (this.contextFlags & flags) !== 0;
    }

    private inYieldContext() {
        return this.inContext(Nodes.NodeFlags.YieldContext);
    }

    private inDisallowInContext() {
        return this.inContext(Nodes.NodeFlags.DisallowInContext);
    }

    private inDecoratorContext() {
        return this.inContext(Nodes.NodeFlags.DecoratorContext);
    }

    private inAwaitContext() {
        return this.inContext(Nodes.NodeFlags.AwaitContext);
    }

    private parseErrorAtCurrentToken(message: Nodes.DiagnosticMessage, arg0?: any): void {
        const start = this.lexer.getTokenPos();
        const length = this.lexer.getTextPos() - start;

        this.parseErrorAtPosition(start, length, message, arg0);
    }

    private parseErrorAtPosition(start: number, length: number, message: Nodes.DiagnosticMessage, arg0?: any): void {
        // Nodes.Don't report another error if it would just be at the same position as the last error.
        const lastError = lastOrUndefined(this.parseDiagnostics);
        if (!lastError || start !== lastError.start) {
            this.parseDiagnostics.push(createFileDiagnostic(this.sourceFile, start, length, message, arg0));
        }

        // Nodes.Mark that we've encountered an error.  Nodes.We'll set an appropriate bit on the next
        // result we finish so that it can't be reused incrementally.
        this.parseErrorBeforeNextFinishedNode = true;
    }

    private scanError(message: Nodes.DiagnosticMessage, length?: number) {
        const pos = this.lexer.getTextPos();
        this.parseErrorAtPosition(pos, length || 0, message);
    }

    private getNodePos(): number {
        return this.lexer.getStartPos();
    }

    private getNodeEnd(): number {
        return this.lexer.getStartPos();
    }

    private nextToken(): TokenType {
        return this.lexer.peek().type = this.lexer.scan();
    }

    private reScanGreaterToken(): TokenType {
        return this.lexer.peek().type = this.lexer.reScanGreaterToken();
    }

    private reScanSlashToken(): TokenType {
        return this.lexer.peek().type = this.lexer.reScanSlashToken();
    }

    private reScanTemplateToken(): TokenType {
        return this.lexer.peek().type = this.lexer.reScanTemplateToken();
    }

    private scanJsxIdentifier(): TokenType {
        return this.lexer.peek().type = this.lexer.scanJsxIdentifier();
    }

    private scanJsxText(): TokenType {
        return this.lexer.peek().type = this.lexer.scanJsxToken();
    }

    private speculationHelper<T>(callback: () => T, isLookAhead: boolean): T {
        // Nodes.Keep track of the state we'll need to rollback to if lookahead fails (or if the
        // caller asked us to always reset our state).
        const saveToken = this.lexer.peek().type;
        const saveParseDiagnosticsLength = this.parseDiagnostics.length;
        const saveParseErrorBeforeNextFinishedNode = this.parseErrorBeforeNextFinishedNode;

        // Nodes.Note: it is not actually necessary to save/restore the context flags here.  Nodes.That's
        // because the saving/restoring of these flags happens naturally through the recursive
        // descent nature of our parser.  Nodes.However, we still store this here just so we can
        // assert that that invariant holds.
        const saveContextFlags = this.contextFlags;

        // Nodes.If we're only looking ahead, then tell the this.scanner to only lookahead as well.
        // Nodes.Otherwise, if we're actually speculatively parsing, then tell the this.scanner to do the
        // same.
        const this.result = isLookAhead
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
    }

    /** Nodes.Invokes the provided callback then unconditionally restores the parser to the state it
     * was in immediately prior to invoking the callback.  Nodes.The this.result of invoking the callback
     * is returned from this function.
     */
    private lookAhead<T>(callback: () => T): T {
        return this.speculationHelper(callback, /*isLookAhead*/ true);
    }

    /** Nodes.Invokes the provided callback.  Nodes.If the callback returns something falsy, then it restores
     * the parser to the state it was in immediately prior to invoking the callback.  Nodes.If the
     * callback returns something truthy, then the parser state is not rolled back.  Nodes.The this.result
     * of invoking the callback is returned from this function.
     */
    private tryParse<T>(callback: () => T): T {
        return this.speculationHelper(callback, /*isLookAhead*/ false);
    }

    // Nodes.Ignore strict mode flag because we will report an error in type checker instead.
    private isIdentifier(): boolean {
        if (this.lexer.peek().type === TokenType.Identifier) {
            return true;
        }

        // Nodes.If we have a 'yield' keyword, and we're in the [yield] context, then 'yield' is
        // considered a keyword and is not an identifier.
        if (this.lexer.peek().type === TokenType.yield && this.inYieldContext()) {
            return false;
        }

        // Nodes.If we have a 'await' keyword, and we're in the [Nodes.Await] context, then 'await' is
        // considered a keyword and is not an identifier.
        if (this.lexer.peek().type === TokenType.await && this.inAwaitContext()) {
            return false;
        }

        return this.lexer.peek().type > TokenType.LastReservedWord;
    }

    private parseExpected(kind: TokenType, diagnosticMessage?: Nodes.DiagnosticMessage, shouldAdvance = true): boolean {
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
    }

    private parseOptional(t: TokenType): boolean {
        if (this.lexer.peek().type === t) {
            this.nextToken();
            return true;
        }
        return false;
    }

    private parseOptionalToken(t: TokenType): Nodes.Node {
        if (this.lexer.peek().type === t) {
            return this.parseTokenNode();
        }
        return undefined;
    }

    private parseExpectedToken(t: TokenType, reportAtCurrentPosition: boolean, diagnosticMessage: Nodes.DiagnosticMessage, arg0?: any): Nodes.Node {
        return this.parseOptionalToken(t) ||
            this.createMissingNode(t, reportAtCurrentPosition, diagnosticMessage, arg0);
    }

    private parseTokenNode<T extends Nodes.Node>(): T {
        const result = new T();
        this.nextToken();
        return result;
    }

    private canParseSemicolon() {
        // Nodes.If there's a real semicolon, then we can always parse it out.
        if (this.lexer.peek().type === TokenType.semicolon) {
            return true;
        }

        // Nodes.We can parse out an optional semicolon in Nodes.ASI cases in the following cases.
        return this.lexer.peek().type === TokenType.closeBrace || this.lexer.peek().type === TokenType.endOfFile || this.lexer.peek().hasLineBreakBeforeStar;
    }

    private parseSemicolon(): boolean {
        if (this.canParseSemicolon()) {
            if (this.lexer.peek().type === TokenType.semicolon) {
                // consume the semicolon if it was explicitly provided.
                this.nextToken();
            }

            return true;
        }
        else {
            return this.parseExpected(TokenType.semicolon);
        }
    }

    private finishNode<T extends Nodes.Node>(result: T, end?: number): T {
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
    }

    private createMissingNode(kind: TokenType, reportAtCurrentPosition: boolean, diagnosticMessage: Nodes.DiagnosticMessage, arg0?: any): Nodes.Node {
        if (reportAtCurrentPosition) {
            this.parseErrorAtPosition(this.lexer.getStartPos(), 0, diagnosticMessage, arg0);
        }
        else {
            this.parseErrorAtCurrentToken(diagnosticMessage, arg0);
        }

        const this.result = this.createNode(kind, this.lexer.getStartPos());
        (<Nodes.Identifier>this.result).text = "";
        return this.finishNode(this.result);
    }

    private internIdentifier(text: string): string {
        text = escapeIdentifier(text);
        return hasProperty(this.identifiers, text) ? this.identifiers[text] : (this.identifiers[text] = text);
    }

    // Nodes.An identifier that starts with two underscores has an extra underscore character prepended to it to avoid issues
    // with magic property names like '__proto__'. Nodes.The 'this.identifiers' object is used to share a single string instance for
    // each identifier in order to reduce memory consumption.
    private createIdentifier(isIdentifier: boolean, diagnosticMessage?: Nodes.DiagnosticMessage): Nodes.Identifier {
        this.identifierCount++;
        if (this.isIdentifier) {
            const result = new Nodes.Identifier();

            // Nodes.Store original this.lexer.peek().type kind if it is not just an Nodes.Identifier so we can report appropriate error later in type checker
            if (this.lexer.peek().type !== TokenType.Identifier) {
                result.originalKeywordKind = this.lexer.peek().type;
            }
            result.text = this.internIdentifier(this.lexer.getTokenValue());
            this.nextToken();
            return result;
        }

        return <Nodes.Identifier>this.createMissingNode(TokenType.Identifier, /*reportAtCurrentPosition*/ false, diagnosticMessage || Nodes.Diagnostics.Identifier_expected);
    }

    private parseIdentifier(diagnosticMessage?: Nodes.DiagnosticMessage): Nodes.Identifier {
        return this.createIdentifier(this.isIdentifier(), diagnosticMessage);
    }

    private parseIdentifierName(): Nodes.Identifier {
        return this.createIdentifier(tokenIsIdentifierOrKeyword(this.lexer.peek().type));
    }

    private isLiteralPropertyName(): boolean {
        return tokenIsIdentifierOrKeyword(this.lexer.peek().type) ||
            this.lexer.peek().type === TokenType.StringLiteral ||
            this.lexer.peek().type === TokenType.NumericLiteral;
    }

    private parsePropertyNameWorker(allowComputedPropertyNames: boolean): Nodes.PropertyName {
        if (this.lexer.peek().type === TokenType.StringLiteral || this.lexer.peek().type === TokenType.NumericLiteral) {
            return this.parseLiteralNode(/*internName*/ true);
        }
        if (allowComputedPropertyNames && this.lexer.peek().type === TokenType.openBracket) {
            return this.parseComputedPropertyName();
        }
        return this.parseIdentifierName();
    }

    private parsePropertyName(): Nodes.PropertyName {
        return this.parsePropertyNameWorker(/*allowComputedPropertyNames*/ true);
    }

    private parseSimplePropertyName(): Nodes.Identifier | Nodes.LiteralExpression {
        return <Nodes.Identifier | Nodes.LiteralExpression>this.parsePropertyNameWorker(/*allowComputedPropertyNames*/ false);
    }

    private isSimplePropertyName() {
        return this.lexer.peek().type === TokenType.StringLiteral || this.lexer.peek().type === TokenType.NumericLiteral || tokenIsIdentifierOrKeyword(this.lexer.peek().type);
    }

    private parseComputedPropertyName(): Nodes.ComputedPropertyName {
        // Nodes.PropertyName [Nodes.Yield]:
        //      Nodes.LiteralPropertyName
        //      Nodes.ComputedPropertyName[?Nodes.Yield]
        const result = new Nodes.ComputedPropertyName();
        this.parseExpected(TokenType.openBracket);

        // Nodes.We parse any expression (including a comma expression). Nodes.But the grammar
        // says that only an assignment expression is allowed, so the grammar checker
        // will error if it sees a comma expression.
        result.expression = this.allowInAnd(this.parseExpression);

        this.parseExpected(TokenType.closeBracket);
        return result;
    }

    private parseContextualModifier(t: TokenType): boolean {
        return this.lexer.peek().type === t && this.tryParse(this.nextTokenCanFollowModifier);
    }

    private nextTokenIsOnSameLineAndCanFollowModifier() {
        this.nextToken();
        if (this.lexer.peek().hasLineBreakBeforeStar) {
            return false;
        }
        return this.canFollowModifier();
    }

    private nextTokenCanFollowModifier() {
        if (this.lexer.peek().type === TokenType.const) {
            // 'const' is only a modifier if followed by 'this.enum'.
            return this.nextToken() === TokenType.enum;
        }
        if (this.lexer.peek().type === TokenType.export) {
            this.nextToken();
            if (this.lexer.peek().type === TokenType.default) {
                return this.lookAhead(this.nextTokenIsClassOrFunctionOrAsync);
            }
            return this.lexer.peek().type !== TokenType.asterisk && this.lexer.peek().type !== TokenType.as && this.lexer.peek().type !== TokenType.openBrace && this.canFollowModifier();
        }
        if (this.lexer.peek().type === TokenType.default) {
            return this.nextTokenIsClassOrFunctionOrAsync();
        }
        if (this.lexer.peek().type === TokenType.static) {
            this.nextToken();
            return this.canFollowModifier();
        }

        return this.nextTokenIsOnSameLineAndCanFollowModifier();
    }

    private parseAnyContextualModifier(): boolean {
        return isModifierKind(this.lexer.peek().type) && this.tryParse(this.nextTokenCanFollowModifier);
    }

    private canFollowModifier(): boolean {
        return this.lexer.peek().type === TokenType.openBracket
            || this.lexer.peek().type === TokenType.openBrace
            || this.lexer.peek().type === TokenType.asterisk
            || this.lexer.peek().type === TokenType.dotDotDot
            || this.isLiteralPropertyName();
    }

    private nextTokenIsClassOrFunctionOrAsync(): boolean {
        this.nextToken();
        return this.lexer.peek().type === TokenType.class || this.lexer.peek().type === TokenType.function ||
            (this.lexer.peek().type === TokenType.async && this.lookAhead(this.nextTokenIsFunctionKeywordOnSameLine));
    }

    // Nodes.True if positioned at the start of a list element
    private isListElement(parsingContext: Nodes.ParsingContext, inErrorRecovery: boolean): boolean {
        const result = this.currentNode(this.parsingContext);
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
                return !(this.lexer.peek().type === TokenType.semicolon && inErrorRecovery) && this.isStartOfStatement();
            case Nodes.ParsingContext.SwitchClauses:
                return this.lexer.peek().type === TokenType.case || this.lexer.peek().type === TokenType.default;
            case Nodes.ParsingContext.TypeMembers:
                return this.lookAhead(this.isTypeMemberStart);
            case Nodes.ParsingContext.ClassMembers:
                // Nodes.We allow semicolons as class elements (as specified by Nodes.ES6) as long as we're
                // not in error recovery.  Nodes.If we're in error recovery, we don't want an errant
                // semicolon to be treated as a class member (since they're almost always used
                // for statements.
                return this.lookAhead(this.isClassMemberStart) || (this.lexer.peek().type === TokenType.semicolon && !inErrorRecovery);
            case Nodes.ParsingContext.EnumMembers:
                // Nodes.Include open bracket computed properties. Nodes.This technically also lets in indexers,
                // which would be a candidate for improved error reporting.
                return this.lexer.peek().type === TokenType.openBracket || this.isLiteralPropertyName();
            case Nodes.ParsingContext.ObjectLiteralMembers:
                return this.lexer.peek().type === TokenType.openBracket || this.lexer.peek().type === TokenType.asterisk || this.isLiteralPropertyName();
            case Nodes.ParsingContext.ObjectBindingElements:
                return this.lexer.peek().type === TokenType.openBracket || this.isLiteralPropertyName();
            case Nodes.ParsingContext.HeritageClauseElement:
                // Nodes.If we see { } then only consume it as an expression if it is followed by , or {
                // Nodes.That way we won't consume the body of a class in its heritage clause.
                if (this.lexer.peek().type === TokenType.openBrace) {
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
                return this.lexer.peek().type === TokenType.comma || this.lexer.peek().type === TokenType.dotDotDot || this.isIdentifierOrPattern();
            case Nodes.ParsingContext.TypeParameters:
                return this.isIdentifier();
            case Nodes.ParsingContext.ArgumentExpressions:
            case Nodes.ParsingContext.ArrayLiteralMembers:
                return this.lexer.peek().type === TokenType.comma || this.lexer.peek().type === TokenType.dotDotDot || this.isStartOfExpression();
            case Nodes.ParsingContext.Parameters:
                return this.isStartOfParameter();
            case Nodes.ParsingContext.TypeArguments:
            case Nodes.ParsingContext.TupleElementTypes:
                return this.lexer.peek().type === TokenType.comma || this.isStartOfType();
            case Nodes.ParsingContext.HeritageClauses:
                return this.isHeritageClause();
            case Nodes.ParsingContext.ImportOrExportSpecifiers:
                return tokenIsIdentifierOrKeyword(this.lexer.peek().type);
            case Nodes.ParsingContext.JsxAttributes:
                return tokenIsIdentifierOrKeyword(this.lexer.peek().type) || this.lexer.peek().type === TokenType.openBrace;
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
    }

    private isValidHeritageClauseObjectLiteral() {
        console.assert(this.lexer.peek().type === TokenType.openBrace);
        if (this.nextToken() === TokenType.closeBrace) {
            // if we see  "extends {}" then only treat the {} as what we're extending (and not
            // the class body) if we have:
            //
            //      extends {} {
            //      extends {},
            //      extends {} extends
            //      extends {} implements

            const next = this.nextToken();
            return next === TokenType.comma || next === TokenType.openBrace || next === TokenType.extends || next === TokenType.implements;
        }

        return true;
    }

    private nextTokenIsIdentifier() {
        this.nextToken();
        return this.isIdentifier();
    }

    private nextTokenIsIdentifierOrKeyword() {
        this.nextToken();
        return tokenIsIdentifierOrKeyword(this.lexer.peek().type);
    }

    private isHeritageClauseExtendsOrImplementsKeyword(): boolean {
        if (this.lexer.peek().type === TokenType.implements ||
            this.lexer.peek().type === TokenType.extends) {

            return this.lookAhead(this.nextTokenIsStartOfExpression);
        }

        return false;
    }

    private nextTokenIsStartOfExpression() {
        this.nextToken();
        return this.isStartOfExpression();
    }

    // Nodes.True if positioned at a list terminator
    private isListTerminator(kind: Nodes.ParsingContext): boolean {
        if (this.lexer.peek().type === TokenType.endOfFile) {
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
                return this.lexer.peek().type === TokenType.closeBrace;
            case Nodes.ParsingContext.SwitchClauseStatements:
                return this.lexer.peek().type === TokenType.closeBrace || this.lexer.peek().type === TokenType.case || this.lexer.peek().type === TokenType.default;
            case Nodes.ParsingContext.HeritageClauseElement:
                return this.lexer.peek().type === TokenType.openBrace || this.lexer.peek().type === TokenType.extends || this.lexer.peek().type === TokenType.implements;
            case Nodes.ParsingContext.VariableDeclarations:
                return this.isVariableDeclaratorListTerminator();
            case Nodes.ParsingContext.TypeParameters:
                // Nodes.Tokens other than '>' are here for better error recovery
                return this.lexer.peek().type === TokenType.greaterThan || this.lexer.peek().type === TokenType.openParen || this.lexer.peek().type === TokenType.openBrace || this.lexer.peek().type === TokenType.extends || this.lexer.peek().type === TokenType.implements;
            case Nodes.ParsingContext.ArgumentExpressions:
                // Nodes.Tokens other than ')' are here for better error recovery
                return this.lexer.peek().type === TokenType.closeParen || this.lexer.peek().type === TokenType.semicolon;
            case Nodes.ParsingContext.ArrayLiteralMembers:
            case Nodes.ParsingContext.TupleElementTypes:
            case Nodes.ParsingContext.ArrayBindingElements:
                return this.lexer.peek().type === TokenType.closeBracket;
            case Nodes.ParsingContext.Parameters:
                // Nodes.Tokens other than ')' and ']' (the latter for index signatures) are here for better error recovery
                return this.lexer.peek().type === TokenType.closeParen || this.lexer.peek().type === TokenType.closeBracket /*|| this.lexer.peek().type === Nodes.SyntaxKind.OpenBraceToken*/;
            case Nodes.ParsingContext.TypeArguments:
                // Nodes.Tokens other than '>' are here for better error recovery
                return this.lexer.peek().type === TokenType.greaterThan || this.lexer.peek().type === TokenType.openParen;
            case Nodes.ParsingContext.HeritageClauses:
                return this.lexer.peek().type === TokenType.openBrace || this.lexer.peek().type === TokenType.closeBrace;
            case Nodes.ParsingContext.JsxAttributes:
                return this.lexer.peek().type === TokenType.greaterThan || this.lexer.peek().type === TokenType.slash;
            case Nodes.ParsingContext.JsxChildren:
                return this.lexer.peek().type === TokenType.lessThan && this.lookAhead(this.nextTokenIsSlash);
            case Nodes.ParsingContext.JSDocFunctionParameters:
                return this.lexer.peek().type === TokenType.closeParen || this.lexer.peek().type === TokenType.colon || this.lexer.peek().type === TokenType.closeBrace;
            case Nodes.ParsingContext.JSDocTypeArguments:
                return this.lexer.peek().type === TokenType.greaterThan || this.lexer.peek().type === TokenType.closeBrace;
            case Nodes.ParsingContext.JSDocTupleTypes:
                return this.lexer.peek().type === TokenType.closeBracket || this.lexer.peek().type === TokenType.closeBrace;
            case Nodes.ParsingContext.JSDocRecordMembers:
                return this.lexer.peek().type === TokenType.closeBrace;
        }
    }

    private isVariableDeclaratorListTerminator(): boolean {
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
        if (this.lexer.peek().type === TokenType.equalsGreaterThan) {
            return true;
        }

        // Nodes.Keep trying to parse out variable declarators.
        return false;
    }

    // Nodes.True if positioned at element or terminator of the current list or any enclosing list
    private isInSomeParsingContext(): boolean {
        for (let kind = 0; kind < Nodes.ParsingContext.Count; kind++) {
            if (this.parsingContext & (1 << kind)) {
                if (this.isListElement(kind, /*inErrorRecovery*/ true) || this.isListTerminator(kind)) {
                    return true;
                }
            }
        }

        return false;
    }

    // Nodes.Parses a list of elements
    private parseList<T extends Nodes.Node>(kind: Nodes.ParsingContext, parseElement: () => T): Nodes.NodeList<T> {
        const saveParsingContext = this.parsingContext;
        this.parsingContext |= 1 << kind;
        const this.result = <Nodes.NodeList<T>>[];
        this.result.pos = this.getNodePos();

        while (!this.isListTerminator(kind)) {
            if (this.isListElement(kind, /*inErrorRecovery*/ false)) {
                const element = this.parseListElement(kind, parseElement);
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
    }

    private parseListElement<T extends Nodes.Node>(parsingContext: Nodes.ParsingContext, parseElement: () => T): T {
        const result = this.currentNode(this.parsingContext);
        if (result) {
            return <T>this.consumeNode(result);
        }

        return parseElement();
    }

    private currentNode(parsingContext: Nodes.ParsingContext): Nodes.Node {
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

        const result = this.syntaxCursor.currentNode(this.lexer.getStartPos());

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
        const nodeContextFlags = result.flags & Nodes.NodeFlags.ContextFlags;
        if (nodeContextFlags !== this.contextFlags) {
            return undefined;
        }

        // Nodes.Ok, we have a result that looks like it could be reused.  Nodes.Now verify that it is valid
        // in the current list parsing context that we're currently at.
        if (!this.canReuseNode(result, this.parsingContext)) {
            return undefined;
        }

        return result;
    }

    private consumeNode(result: Nodes.Node) {
        // Nodes.Move the this.scanner so it is after the result we just consumed.
        this.lexer.setTextPos(result.end);
        this.nextToken();
        return result;
    }

    private canReuseNode(result: Nodes.Node, parsingContext: Nodes.ParsingContext): boolean {
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
    }

    private isReusableClassMember(result: Nodes.Node) {
        if (result) {
            switch (result.kind) {
                case TokenType.Constructor:
                case TokenType.IndexSignature:
                case TokenType.GetAccessor:
                case TokenType.SetAccessor:
                case TokenType.PropertyDeclaration:
                case TokenType.SemicolonClassElement:
                    return true;
                case TokenType.MethodDeclaration:
                    // Nodes.Method declarations are not necessarily reusable.  Nodes.An object-literal
                    // may have a method calls "constructor(...)" and we must reparse that
                    // into an actual .ConstructorDeclaration.
                    let methodDeclaration = <Nodes.MethodDeclaration>result;
                    let nameIsConstructor = methodDeclaration.name.kind === TokenType.Identifier &&
                        (<Nodes.Identifier>methodDeclaration.name).originalKeywordKind === TokenType.constructor;

                    return !nameIsConstructor;
            }
        }

        return false;
    }

    private isReusableSwitchClause(result: Nodes.Node) {
        if (result) {
            switch (result.kind) {
                case TokenType.CaseClause:
                case TokenType.DefaultClause:
                    return true;
            }
        }

        return false;
    }

    private isReusableStatement(result: Nodes.Node) {
        if (result) {
            switch (result.kind) {
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

    private isReusableEnumMember(result: Nodes.Node) {
        return result.kind === TokenType.EnumMember;
    }

    private isReusableTypeMember(result: Nodes.Node) {
        if (result) {
            switch (result.kind) {
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

    private isReusableVariableDeclaration(result: Nodes.Node) {
        if (result.kind !== TokenType.VariableDeclaration) {
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
        const variableDeclarator = <Nodes.VariableDeclaration>result;
        return variableDeclarator.initializer === undefined;
    }

    private isReusableParameter(result: Nodes.Node) {
        if (result.kind !== TokenType.Parameter) {
            return false;
        }

        // Nodes.See the comment in this.isReusableVariableDeclaration for why we do this.
        const parameter = <Nodes.ParameterDeclaration>result;
        return parameter.initializer === undefined;
    }

    // Nodes.Returns true if we should abort parsing.
    private abortParsingListOrMoveToNextToken(kind: Nodes.ParsingContext) {
        this.parseErrorAtCurrentToken(this.parsingContextErrors(kind));
        if (this.isInSomeParsingContext()) {
            return true;
        }

        this.nextToken();
        return false;
    }

    private parsingContextErrors(context: Nodes.ParsingContext): Nodes.DiagnosticMessage {
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

    // Nodes.Parses a comma-delimited list of elements
    private parseDelimitedList<T extends Nodes.Node>(kind: Nodes.ParsingContext, parseElement: () => T, considerSemicolonAsDelimiter?: boolean): Nodes.NodeList<T> {
        const saveParsingContext = this.parsingContext;
        this.parsingContext |= 1 << kind;
        const this.result = <Nodes.NodeList<T>>[];
        this.result.pos = this.getNodePos();

        let commaStart = -1; // Nodes.Meaning the previous this.lexer.peek().type was not a comma
        while (true) {
            if (this.isListElement(kind, /*inErrorRecovery*/ false)) {
                this.result.push(this.parseListElement(kind, parseElement));
                commaStart = this.lexer.getTokenPos();
                if (this.parseOptional(TokenType.comma)) {
                    continue;
                }

                commaStart = -1; // Nodes.Back to the state where the last this.lexer.peek().type was not a comma
                if (this.isListTerminator(kind)) {
                    break;
                }

                // Nodes.We didn't get a comma, and the list wasn't terminated, explicitly parse
                // out a comma so we give a good error message.
                this.parseExpected(TokenType.comma);

                // Nodes.If the this.lexer.peek().type was a semicolon, and the caller allows that, then skip it and
                // continue.  Nodes.This ensures we get back on track and don't this.result in tons of
                // parse errors.  Nodes.For example, this can happen when people do things like use
                // a semicolon to delimit object literal members.   Nodes.Note: we'll have already
                // reported an error when we called this.parseExpected above.
                if (considerSemicolonAsDelimiter && this.lexer.peek().type === TokenType.semicolon && !this.lexer.peek().hasLineBreakBeforeStar) {
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
    }

    private createMissingList<T>(): Nodes.NodeList<T> {
        const pos = this.getNodePos();
        const this.result = <Nodes.NodeList<T>>[];
        this.result.pos = pos;
        this.result.end = pos;
        return this.result;
    }

    private parseBracketedList<T extends Nodes.Node>(kind: Nodes.ParsingContext, parseElement: () => T, open: TokenType, close: TokenType): Nodes.NodeList<T> {
        if (this.parseExpected(open)) {
            const this.result = this.parseDelimitedList(kind, parseElement);
            this.parseExpected(close);
            return this.result;
        }

        return this.createMissingList<T>();
    }

    // Nodes.The allowReservedWords parameter controls whether reserved words are permitted after the first dot
    private parseEntityName(allowReservedWords: boolean, diagnosticMessage?: Nodes.DiagnosticMessage): Nodes.EntityName {
        let entity: Nodes.EntityName = this.parseIdentifier(diagnosticMessage);
        while (this.parseOptional(TokenType.dot)) {
            const result: Nodes.QualifiedName = new Nodes.QualifiedName();  // !!!
            result.left = entity;
            result.right = this.parseRightSideOfDot(allowReservedWords);
            entity = result;
        }
        return entity;
    }

    private parseRightSideOfDot(allowIdentifierNames: boolean): Nodes.Identifier {
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
            const matchesPattern = this.lookAhead(this.nextTokenIsIdentifierOrKeywordOnSameLine);

            if (matchesPattern) {
                // Nodes.Report that we need an identifier.  Nodes.However, report it right after the dot,
                // and not on the next this.lexer.peek().type.  Nodes.This is because the next this.lexer.peek().type might actually
                // be an identifier and the error would be quite confusing.
                return <Nodes.Identifier>this.createMissingNode(TokenType.Identifier, /*reportAtCurrentPosition*/ true, Nodes.Diagnostics.Identifier_expected);
            }
        }

        return allowIdentifierNames ? this.parseIdentifierName() : this.parseIdentifier();
    }

    private parseTemplateExpression(): Nodes.TemplateExpression {
        const template = new Nodes.TemplateExpression();

        template.head = this.parseTemplateLiteralFragment();
        console.assert(template.head.kind === TokenType.TemplateHead, "Nodes.Template head has wrong this.lexer.peek().type kind");

        const templateSpans = <Nodes.NodeList<Nodes.TemplateSpan>>[];
        templateSpans.pos = this.getNodePos();

        do {
            templateSpans.push(this.parseTemplateSpan());
        }
        while (lastOrUndefined(templateSpans).literal.kind === TokenType.TemplateMiddle);

        templateSpans.end = this.getNodeEnd();
        template.templateSpans = templateSpans;

        return this.finishNode(template);
    }

    private parseTemplateSpan(): Nodes.TemplateSpan {
        const span = new Nodes.TemplateSpan();
        span.expression = this.allowInAnd(this.parseExpression);

        let literal: Nodes.TemplateLiteralFragment;

        if (this.lexer.peek().type === TokenType.closeBrace) {
            this.reScanTemplateToken();
            literal = this.parseTemplateLiteralFragment();
        }
        else {
            literal = <Nodes.TemplateLiteralFragment>this.parseExpectedToken(TokenType.TemplateTail, /*reportAtCurrentPosition*/ false, Nodes.Diagnostics._0_expected, tokenToString(TokenType.closeBrace));
        }

        span.literal = literal;
        return this.finishNode(span);
    }

    private parseStringLiteralTypeNode(): Nodes.StringLiteralTypeNode {
        return <Nodes.StringLiteralTypeNode>this.parseLiteralLikeNode(TokenType.StringLiteralType, /*internName*/ true);
    }

    private parseLiteralNode(internName?: boolean): Nodes.LiteralExpression {
        return <Nodes.LiteralExpression>this.parseLiteralLikeNode(this.lexer.peek().type, internName);
    }

    private parseTemplateLiteralFragment(): Nodes.TemplateLiteralFragment {
        return <Nodes.TemplateLiteralFragment>this.parseLiteralLikeNode(this.lexer.peek().type, /*internName*/ false);
    }

    private parseLiteralLikeNode(kind: TokenType, internName: boolean): Nodes.LiteralLikeNode {
        const result = new Nodes.LiteralExpression();
        const text = this.lexer.getTokenValue();
        result.text = internName ? this.internIdentifier(text) : text;

        if (this.lexer.hasExtendedUnicodeEscape()) {
            result.hasExtendedUnicodeEscape = true;
        }

        if (this.lexer.isUnterminated()) {
            result.isUnterminated = true;
        }

        const tokenPos = this.lexer.getTokenPos();
        this.nextToken();
        result;

        // Nodes.Octal literals are not allowed in strict mode or Nodes.ES5
        // Nodes.Note that theoretically the following condition would hold true literals like 009,
        // which is not octal.But because of how the this.scanner separates the tokens, we would
        // never get a this.lexer.peek().type like this. Nodes.Instead, we would get 00 and 9 as two separate tokens.
        // Nodes.We also do not need to check for negatives because any prefix operator would be part of a
        // parent unary expression.
        if (result.kind === TokenType.NumericLiteral
            && this.sourceText.charCodeAt(tokenPos) === Nodes.CharCode.num0
            && isOctalDigit(this.sourceText.charCodeAt(tokenPos + 1))) {

            result.isOctalLiteral = true;
        }

        return result;
    }

    // Nodes.TYPES

    private parseTypeReference(): Nodes.TypeReferenceNode {
        const typeName = this.parseEntityName(/*allowReservedWords*/ false, Nodes.Diagnostics.Type_expected);
        const result = new Nodes.TypeReferenceNode();
        result.typeName = typeName;
        if (!this.lexer.peek().hasLineBreakBeforeStar && this.lexer.peek().type === TokenType.lessThan) {
            result.typeArguments = this.parseBracketedList(Nodes.ParsingContext.TypeArguments, this.parseType, TokenType.lessThan, TokenType.greaterThan);
        }
        return result;
    }

    private parseThisTypePredicate(lhs: Nodes.ThisTypeNode): Nodes.TypePredicateNode {
        this.nextToken();
        const result = this.createNode(TokenType.TypePredicate, lhs.pos) as Nodes.TypePredicateNode;
        result.parameterName = lhs;
        result.type = this.parseType();
        return result;
    }

    private parseThisTypeNode(): Nodes.ThisTypeNode {
        const result = this.createNode(TokenType.ThisType) as Nodes.ThisTypeNode;
        this.nextToken();
        return result;
    }

    private parseTypeQuery(): Nodes.TypeQueryNode {
        const result = new Nodes.TypeQueryNode();
        this.parseExpected(TokenType.typeof);
        result.exprName = this.parseEntityName(/*allowReservedWords*/ true);
        return result;
    }

    private parseTypeParameter(): Nodes.TypeParameterDeclaration {
        const result = new Nodes.TypeParameterDeclaration();
        result.name = this.parseIdentifier();
        if (this.parseOptional(TokenType.extends)) {
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
    }

    private parseTypeParameters(): Nodes.NodeList<Nodes.TypeParameterDeclaration> {
        if (this.lexer.peek().type === TokenType.lessThan) {
            return this.parseBracketedList(Nodes.ParsingContext.TypeParameters, this.parseTypeParameter, TokenType.lessThan, TokenType.greaterThan);
        }
    }

    private parseParameterType(): Nodes.TypeNode {
        if (this.parseOptional(TokenType.colon)) {
            return this.parseType();
        }

        return undefined;
    }

    private isStartOfParameter(): boolean {
        return this.lexer.peek().type === TokenType.dotDotDot || this.isIdentifierOrPattern() || isModifierKind(this.lexer.peek().type) || this.lexer.peek().type === TokenType.at || this.lexer.peek().type === TokenType.this;
    }

    private setModifiers(result: Nodes.Node, modifiers: Nodes.ModifiersArray) {
        if (modifiers) {
            result.flags |= modifiers.flags;
            result.modifiers = modifiers;
        }
    }

    private parseParameter(): Nodes.ParameterDeclaration {
        const result = new Nodes.ParameterDeclaration();
        if (this.lexer.peek().type === TokenType.this) {
            result.name = this.createIdentifier(/*this.isIdentifier*/true, undefined);
            result.type = this.parseParameterType();
            return result;
        }

        result.decorators = this.parseDecorators();
        this.setModifiers(result, this.parseModifiers());
        result.dotDotDotToken = this.parseOptionalToken(TokenType.dotDotDot);

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

        result.questionToken = this.parseOptionalToken(TokenType.question);
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
    }

    private parseBindingElementInitializer(inParameter: boolean) {
        return inParameter ? this.parseParameterInitializer() : this.parseNonParameterInitializer();
    }

    private parseParameterInitializer() {
        return this.parseInitializer(/*inParameter*/ true);
    }

    private fillSignature(
        returnToken: TokenType,
        yieldContext: boolean,
        awaitContext: boolean,
        requireCompleteParameterList: boolean,
        signature: Nodes.SignatureDeclaration): void {

        const returnTokenRequired = returnToken === TokenType.equalsGreaterThan;
        signature.typeParameters = this.parseTypeParameters();
        signature.parameters = this.parseParameterList(yieldContext, awaitContext, requireCompleteParameterList);

        if (returnTokenRequired) {
            this.parseExpected(returnToken);
            signature.type = this.parseTypeOrTypePredicate();
        }
        else if (this.parseOptional(returnToken)) {
            signature.type = this.parseTypeOrTypePredicate();
        }
    }

    private parseParameterList(yieldContext: boolean, awaitContext: boolean, requireCompleteParameterList: boolean) {
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
        if (this.parseExpected(TokenType.openParen)) {
            const savedYieldContext = this.inYieldContext();
            const savedAwaitContext = this.inAwaitContext();

            this.setYieldContext(yieldContext);
            this.setAwaitContext(awaitContext);

            const this.result = this.parseDelimitedList(Nodes.ParsingContext.Parameters, this.parseParameter);

            this.setYieldContext(savedYieldContext);
            this.setAwaitContext(savedAwaitContext);

            if (!this.parseExpected(TokenType.closeParen) && requireCompleteParameterList) {
                // Nodes.Caller insisted that we had to end with a )   Nodes.We didn't.  Nodes.So just return
                // undefined here.
                return undefined;
            }

            return this.result;
        }

        // Nodes.We didn't even have an open paren.  Nodes.If the caller requires a complete parameter list,
        // we definitely can't provide that.  Nodes.However, if they're ok with an incomplete one,
        // then just return an empty set of parameters.
        return requireCompleteParameterList ? undefined : this.createMissingList<Nodes.ParameterDeclaration>();
    }

    private parseTypeMemberSemicolon() {
        // Nodes.We allow type members to be separated by commas or (possibly Nodes.ASI) semicolons.
        // Nodes.First check if it was a comma.  Nodes.If so, we're done with the member.
        if (this.parseOptional(TokenType.comma)) {
            return;
        }

        // Nodes.Didn't have a comma.  Nodes.We must have a (possible Nodes.ASI) semicolon.
        this.expectSemicolon();
    }

    private parseSignatureMember(kind: TokenType): Nodes.CallSignatureDeclaration | Nodes.ConstructSignatureDeclaration {
        const result = new Nodes.CallSignatureDeclaration | Nodes.ConstructSignatureDeclaration();
        if (kind === TokenType.ConstructSignature) {
            this.parseExpected(TokenType.new);
        }
        this.fillSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, result);
        this.parseTypeMemberSemicolon();
        return result;
    }

    private isIndexSignature(): boolean {
        if (this.lexer.peek().type !== TokenType.openBracket) {
            return false;
        }

        return this.lookAhead(this.isUnambiguouslyIndexSignature);
    }

    private isUnambiguouslyIndexSignature() {
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
        if (this.lexer.peek().type === TokenType.dotDotDot || this.lexer.peek().type === TokenType.closeBracket) {
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
        if (this.lexer.peek().type === TokenType.colon || this.lexer.peek().type === TokenType.comma) {
            return true;
        }

        // Nodes.Question mark could be an indexer with an optional property,
        // or it could be a conditional expression in a computed property.
        if (this.lexer.peek().type !== TokenType.question) {
            return false;
        }

        // Nodes.If any of the following tokens are after the question mark, it cannot
        // be a conditional expression, so treat it as an indexer.
        this.nextToken();
        return this.lexer.peek().type === TokenType.colon || this.lexer.peek().type === TokenType.comma || this.lexer.peek().type === TokenType.closeBracket;
    }

    private parseIndexSignatureDeclaration(fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray): Nodes.IndexSignatureDeclaration {
        const result = new Nodes.IndexSignatureDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        result.parameters = this.parseBracketedList(Nodes.ParsingContext.Parameters, this.parseParameter, TokenType.openBracket, TokenType.closeBracket);
        result.type = this.parseTypeAnnotation();
        this.parseTypeMemberSemicolon();
        return result;
    }

    private parsePropertyOrMethodSignature(fullStart: number, modifiers: Nodes.ModifiersArray): Nodes.PropertySignature | Nodes.MethodSignature {
        const name = this.parsePropertyName();
        const questionToken = this.parseOptionalToken(TokenType.question);

        if (this.lexer.peek().type === TokenType.openParen || this.lexer.peek().type === TokenType.lessThan) {
            const method = new Nodes.MethodSignature();
            this.setModifiers(method, modifiers);
            method.name = name;
            method.questionToken = questionToken;

            // Nodes.Method signatures don't exist in expression contexts.  Nodes.So they have neither
            // [Nodes.Yield] nor [Nodes.Await]
            this.fillSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, method);
            this.parseTypeMemberSemicolon();
            return this.finishNode(method);
        }
        else {
            const property = new Nodes.PropertySignature();
            this.setModifiers(property, modifiers);
            property.name = name;
            property.questionToken = questionToken;
            property.type = this.parseTypeAnnotation();

            if (this.lexer.peek().type === TokenType.equals) {
                // Nodes.Although type literal properties cannot not have initializers, we attempt
                // to parse an initializer so we can report in the checker that an interface
                // property or type literal property cannot have an initializer.
                property.initializer = this.parseNonParameterInitializer();
            }

            this.parseTypeMemberSemicolon();
            return this.finishNode(property);
        }
    }

    private isTypeMemberStart(): boolean {
        let idToken: TokenType;
        // Nodes.Return true if we have the start of a signature member
        if (this.lexer.peek().type === TokenType.openParen || this.lexer.peek().type === TokenType.lessThan) {
            return true;
        }
        // Nodes.Eat up all modifiers, but hold on to the last one in case it is actually an identifier
        while (isModifierKind(this.lexer.peek().type)) {
            idToken = this.lexer.peek().type;
            this.nextToken();
        }
        // Nodes.Index signatures and computed property names are type members
        if (this.lexer.peek().type === TokenType.openBracket) {
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
            return this.lexer.peek().type === TokenType.openParen ||
                this.lexer.peek().type === TokenType.lessThan ||
                this.lexer.peek().type === TokenType.question ||
                this.lexer.peek().type === TokenType.colon ||
                this.canParseSemicolon();
        }
        return false;
    }

    private parseTypeMember(): Nodes.TypeElement {
        if (this.lexer.peek().type === TokenType.openParen || this.lexer.peek().type === TokenType.lessThan) {
            return this.parseSignatureMember(TokenType.CallSignature);
        }
        if (this.lexer.peek().type === TokenType.new && this.lookAhead(this.isStartOfConstructSignature)) {
            return this.parseSignatureMember(TokenType.ConstructSignature);
        }
        const fullStart = this.getNodePos();
        const modifiers = this.parseModifiers();
        if (this.isIndexSignature()) {
            return this.parseIndexSignatureDeclaration(fullStart, /*decorators*/ undefined, modifiers);
        }
        return this.parsePropertyOrMethodSignature(fullStart, modifiers);
    }

    private isStartOfConstructSignature() {
        this.nextToken();
        return this.lexer.peek().type === TokenType.openParen || this.lexer.peek().type === TokenType.lessThan;
    }

    private parseTypeLiteral(): Nodes.TypeLiteralNode {
        const result = new Nodes.TypeLiteralNode();
        result.members = this.parseObjectTypeMembers();
        return result;
    }

    private parseObjectTypeMembers(): Nodes.NodeList<Nodes.TypeElement> {
        let members: Nodes.NodeList<Nodes.TypeElement>;
        if (this.parseExpected(TokenType.openBrace)) {
            members = this.parseList(Nodes.ParsingContext.TypeMembers, this.parseTypeMember);
            this.parseExpected(TokenType.closeBrace);
        }
        else {
            members = this.createMissingList<Nodes.TypeElement>();
        }

        return members;
    }

    private parseTupleType(): Nodes.TupleTypeNode {
        const result = new Nodes.TupleTypeNode();
        result.elementTypes = this.parseBracketedList(Nodes.ParsingContext.TupleElementTypes, this.parseType, TokenType.openBracket, TokenType.closeBracket);
        return result;
    }

    private parseParenthesizedType(): Nodes.ParenthesizedTypeNode {
        const result = new Nodes.ParenthesizedTypeNode();
        this.parseExpected(TokenType.openParen);
        result.type = this.parseType();
        this.parseExpected(TokenType.closeParen);
        return result;
    }

    private parseFunctionOrConstructorType(kind: TokenType): Nodes.FunctionOrConstructorTypeNode {
        const result = new Nodes.FunctionOrConstructorTypeNode();
        if (kind === TokenType.ConstructorType) {
            this.parseExpected(TokenType.new);
        }
        this.fillSignature(TokenType.equalsGreaterThan, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, result);
        return result;
    }

    private parseKeywordAndNoDot(): Nodes.TypeNode {
        const result = this.parseTokenNode<Nodes.TypeNode>();
        return this.lexer.peek().type === TokenType.dot ? undefined : result;
    }

    private parseNonArrayType(): Nodes.TypeNode {
        switch (this.lexer.peek().type) {
            case TokenType.any:
            case TokenType.string:
            case TokenType.number:
            case TokenType.boolean:
            case TokenType.symbol:
            case TokenType.undefined:
            case TokenType.never:
                // Nodes.If these are followed by a dot, then parse these out as a dotted type reference instead.
                const result = this.tryParse(this.parseKeywordAndNoDot);
                return result || this.parseTypeReference();
            case TokenType.StringLiteral:
                return this.parseStringLiteralTypeNode();
            case TokenType.void:
            case TokenType.null:
                return this.parseTokenNode<Nodes.TypeNode>();
            case TokenType.this: {
                const thisKeyword = this.parseThisTypeNode();
                if (this.lexer.peek().type === TokenType.is && !this.lexer.peek().hasLineBreakBeforeStar) {
                    return this.parseThisTypePredicate(thisKeyword);
                }
                else {
                    return thisKeyword;
                }
            }
            case TokenType.typeof:
                return this.parseTypeQuery();
            case TokenType.openBrace:
                return this.parseTypeLiteral();
            case TokenType.openBracket:
                return this.parseTupleType();
            case TokenType.openParen:
                return this.parseParenthesizedType();
            default:
                return this.parseTypeReference();
        }
    }

    private isStartOfType(): boolean {
        switch (this.lexer.peek().type) {
            case TokenType.any:
            case TokenType.string:
            case TokenType.number:
            case TokenType.boolean:
            case TokenType.symbol:
            case TokenType.void:
            case TokenType.undefined:
            case TokenType.null:
            case TokenType.this:
            case TokenType.typeof:
            case TokenType.never:
            case TokenType.openBrace:
            case TokenType.openBracket:
            case TokenType.lessThan:
            case TokenType.new:
            case TokenType.StringLiteral:
                return true;
            case TokenType.openParen:
                // Nodes.Only consider '(' the start of a type if followed by ')', '...', an identifier, a modifier,
                // or something that starts a type. Nodes.We don't want to consider things like '(1)' a type.
                return this.lookAhead(this.isStartOfParenthesizedOrFunctionType);
            default:
                return this.isIdentifier();
        }
    }

    private isStartOfParenthesizedOrFunctionType() {
        this.nextToken();
        return this.lexer.peek().type === TokenType.closeParen || this.isStartOfParameter() || this.isStartOfType();
    }

    private parseArrayTypeOrHigher(): Nodes.TypeNode {
        let type = this.parseNonArrayType();
        while (!this.lexer.peek().hasLineBreakBeforeStar && this.parseOptional(TokenType.openBracket)) {
            this.parseExpected(TokenType.closeBracket);
            const result = new Nodes.ArrayTypeNode();
            result.elementType = type;
            type = result;
        }
        return type;
    }

    private parseUnionOrIntersectionType(kind: TokenType, parseConstituentType: () => Nodes.TypeNode, operator: TokenType): Nodes.TypeNode {
        let type = parseConstituentType();
        if (this.lexer.peek().type === operator) {
            const types = <Nodes.NodeList<Nodes.TypeNode>>[type];
            types.pos = type.pos;
            while (this.parseOptional(operator)) {
                types.push(parseConstituentType());
            }
            types.end = this.getNodeEnd();
            const result = new Nodes.UnionOrIntersectionTypeNode();
            result.types = types;
            type = result;
        }
        return type;
    }

    private parseIntersectionTypeOrHigher(): Nodes.TypeNode {
        return this.parseUnionOrIntersectionType(TokenType.IntersectionType, this.parseArrayTypeOrHigher, TokenType.ampersand);
    }

    private parseUnionTypeOrHigher(): Nodes.TypeNode {
        return this.parseUnionOrIntersectionType(TokenType.UnionType, this.parseIntersectionTypeOrHigher, TokenType.bar);
    }

    private isStartOfFunctionType(): boolean {
        if (this.lexer.peek().type === TokenType.lessThan) {
            return true;
        }
        return this.lexer.peek().type === TokenType.openParen && this.lookAhead(this.isUnambiguouslyStartOfFunctionType);
    }

    private skipParameterStart(): boolean {
        if (isModifierKind(this.lexer.peek().type)) {
            // Nodes.Skip modifiers
            this.parseModifiers();
        }
        if (this.isIdentifier() || this.lexer.peek().type === TokenType.this) {
            this.nextToken();
            return true;
        }
        if (this.lexer.peek().type === TokenType.openBracket || this.lexer.peek().type === TokenType.openBrace) {
            // Nodes.Return true if we can parse an array or object binding pattern with no errors
            const previousErrorCount = this.parseDiagnostics.length;
            this.parseBindingName();
            return previousErrorCount === this.parseDiagnostics.length;
        }
        return false;
    }

    private isUnambiguouslyStartOfFunctionType() {
        this.nextToken();
        if (this.lexer.peek().type === TokenType.closeParen || this.lexer.peek().type === TokenType.dotDotDot) {
            // ( )
            // ( ...
            return true;
        }
        if (this.skipParameterStart()) {
            // Nodes.We successfully skipped modifiers (if any) and an identifier or binding pattern,
            // now see if we have something that indicates a parameter declaration
            if (this.lexer.peek().type === TokenType.colon || this.lexer.peek().type === TokenType.comma ||
                this.lexer.peek().type === TokenType.question || this.lexer.peek().type === TokenType.equals) {
                // ( xxx :
                // ( xxx ,
                // ( xxx ?
                // ( xxx =
                return true;
            }
            if (this.lexer.peek().type === TokenType.closeParen) {
                this.nextToken();
                if (this.lexer.peek().type === TokenType.equalsGreaterThan) {
                    // ( xxx ) =>
                    return true;
                }
            }
        }
        return false;
    }

    private parseTypeOrTypePredicate(): Nodes.TypeNode {
        const typePredicateVariable = this.isIdentifier() && this.tryParse(this.parseTypePredicatePrefix);
        const type = this.parseType();
        if (typePredicateVariable) {
            const result = new Nodes.TypePredicateNode();
            result.parameterName = typePredicateVariable;
            result.type = type;
            return result;
        }
        else {
            return type;
        }
    }

    private parseTypePredicatePrefix() {
        const id = this.parseIdentifier();
        if (this.lexer.peek().type === TokenType.is && !this.lexer.peek().hasLineBreakBeforeStar) {
            this.nextToken();
            return id;
        }
    }

    private parseType(): Nodes.TypeNode {
        // Nodes.The rules about 'yield' only apply to actual code/expression contexts.  Nodes.They don't
        // apply to 'type' contexts.  Nodes.So we disable these parameters here before moving on.
        return this.doOutsideOfContext(Nodes.NodeFlags.TypeExcludesFlags, this.parseTypeWorker);
    }

    private parseTypeWorker(): Nodes.TypeNode {
        if (this.isStartOfFunctionType()) {
            return this.parseFunctionOrConstructorType(TokenType.FunctionType);
        }
        if (this.lexer.peek().type === TokenType.new) {
            return this.parseFunctionOrConstructorType(TokenType.ConstructorType);
        }
        return this.parseUnionTypeOrHigher();
    }

    private parseTypeAnnotation(): Nodes.TypeNode {
        return this.parseOptional(TokenType.colon) ? this.parseType() : undefined;
    }

    // Nodes.EXPRESSIONS
    private isStartOfLeftHandSideExpression(): boolean {
        switch (this.lexer.peek().type) {
            case TokenType.this:
            case TokenType.super:
            case TokenType.null:
            case TokenType.true:
            case TokenType.false:
            case TokenType.NumericLiteral:
            case TokenType.StringLiteral:
            case TokenType.NoSubstitutionTemplateLiteral:
            case TokenType.TemplateHead:
            case TokenType.openParen:
            case TokenType.openBracket:
            case TokenType.openBrace:
            case TokenType.function:
            case TokenType.class:
            case TokenType.new:
            case TokenType.slash:
            case TokenType.slashEquals:
            case TokenType.Identifier:
                return true;
            default:
                return this.isIdentifier();
        }
    }

    private isStartOfExpression(): boolean {
        if (this.isStartOfLeftHandSideExpression()) {
            return true;
        }

        switch (this.lexer.peek().type) {
            case TokenType.plus:
            case TokenType.minus:
            case TokenType.tilde:
            case TokenType.exclamation:
            case TokenType.delete:
            case TokenType.typeof:
            case TokenType.void:
            case TokenType.plusPlus:
            case TokenType.minusMinus:
            case TokenType.lessThan:
            case TokenType.await:
            case TokenType.yield:
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
    }

    private isStartOfExpressionStatement(): boolean {
        // Nodes.As per the grammar, none of '{' or 'function' or 'class' can start an expression statement.
        return this.lexer.peek().type !== TokenType.openBrace &&
            this.lexer.peek().type !== TokenType.function &&
            this.lexer.peek().type !== TokenType.class &&
            this.lexer.peek().type !== TokenType.at &&
            this.isStartOfExpression();
    }

    private parseExpression(): Nodes.Expression {
        // Nodes.Expression[in]:
        //      Nodes.AssignmentExpression[in]
        //      Nodes.Expression[in] , Nodes.AssignmentExpression[in]

        // clear the decorator context when parsing Nodes.Expression, as it should be unambiguous when parsing a decorator
        const saveDecoratorContext = this.inDecoratorContext();
        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ false);
        }

        let expr = this.parseAssignmentExpressionOrHigher();
        let operatorToken: Nodes.Node;
        while ((operatorToken = this.parseOptionalToken(TokenType.comma))) {
            expr = this.makeBinaryExpression(expr, operatorToken, this.parseAssignmentExpressionOrHigher());
        }

        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ true);
        }
        return expr;
    }

    private parseInitializer(inParameter: boolean): Nodes.Expression {
        if (this.lexer.peek().type !== TokenType.equals) {
            // It's not uncommon during typing for the user to miss writing the '=' this.lexer.peek().type.  Check if
            // there is no newline after the last this.lexer.peek().type and if we're on an expression.  If so, parse
            // this as an equals-value clause with a missing equals.
            // NOTE: There are two places where we allow equals-value clauses.  The first is in a
            // variable declarator.  The second is with a parameter.  For variable declarators
            // it's more likely that a { would be a allowed (as an object literal).  While this
            // is also allowed for parameters, the risk is that we consume the { as an object
            // literal when it really will be for the block following the parameter.
            if (this.lexer.peek().hasLineBreakBeforeStart || (inParameter && this.lexer.peek().type === TokenType.openBrace) || !this.isStartOfExpression()) {
                // preceding line break, open brace in a parameter (likely a function body) or current this.lexer.peek().type is not an expression -
                // do not try to parse initializer
                return undefined;
            }
        }

        // Nodes.Initializer[Nodes.In, Nodes.Yield] :
        //     = Nodes.AssignmentExpression[?Nodes.In, ?Nodes.Yield]

        this.parseExpected(TokenType.equals);
        return this.parseAssignmentExpressionOrHigher();
    }

    private parseAssignmentExpressionOrHigher(): Nodes.Expression {
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
        const arrowExpression = this.tryParseParenthesizedArrowFunctionExpression() || this.tryParseAsyncSimpleArrowFunctionExpression();
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
        const expr = this.parseBinaryExpressionOrHigher(/*precedence*/ 0);

        // Nodes.To avoid a look-ahead, we did not handle the case of an arrow function with a single un-parenthesized
        // parameter ('x => ...') above. Nodes.We handle it here by checking if the parsed expression was a single
        // identifier and the current this.lexer.peek().type is an arrow.
        if (expr.kind === TokenType.Identifier && this.lexer.peek().type === TokenType.equalsGreaterThan) {
            return this.parseSimpleArrowFunctionExpression(<Nodes.Identifier>expr);
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
    }

    private isYieldExpression(): boolean {
        if (this.lexer.peek().type === TokenType.yield) {
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
    }

    private nextTokenIsIdentifierOnSameLine() {
        this.nextToken();
        return !this.lexer.peek().hasLineBreakBeforeStart && this.isIdentifier();
    }

    private parseYieldExpression(): Nodes.YieldExpression {
        const result = new Nodes.YieldExpression();

        // Nodes.YieldExpression[Nodes.In] :
        //      yield
        //      yield [no Nodes.LineTerminator here] [Nodes.Lexical goal Nodes.InputElementRegExp]Nodes.AssignmentExpression[?Nodes.In, Nodes.Yield]
        //      yield [no Nodes.LineTerminator here] * [Nodes.Lexical goal Nodes.InputElementRegExp]Nodes.AssignmentExpression[?Nodes.In, Nodes.Yield]
        this.nextToken();

        if (!this.lexer.peek().hasLineBreakBeforeStar &&
            (this.lexer.peek().type === TokenType.asterisk || this.isStartOfExpression())) {
            result.asteriskToken = this.parseOptionalToken(TokenType.asterisk);
            result.expression = this.parseAssignmentExpressionOrHigher();
            return result;
        }
        else {
            // if the next this.lexer.peek().type is not on the same line as yield.  or we don't have an '*' or
            // the start of an expression, then this is just a simple "yield" expression.
            return result;
        }
    }

    private parseSimpleArrowFunctionExpression(identifier: Nodes.Identifier, asyncModifier?: Nodes.ModifiersArray): Nodes.ArrowFunction {
        console.assert(this.lexer.peek().type === TokenType.equalsGreaterThan, "this.parseSimpleArrowFunctionExpression should only have been called if we had a =>");

        let result: Nodes.ArrowFunction;
        if (asyncModifier) {
            result = new Nodes.ArrowFunction();
            this.setModifiers(result, asyncModifier);
        }
        else {
            result = new Nodes.ArrowFunction();
        }

        const parameter = new Nodes.ParameterDeclaration();
        parameter.name = identifier;
        this.finishNode(parameter);

        result.parameters = <Nodes.NodeList<Nodes.ParameterDeclaration>>[parameter];
        result.parameters.pos = parameter.pos;
        result.parameters.end = parameter.end;

        result.equalsGreaterThanToken = this.parseExpectedToken(TokenType.equalsGreaterThan, /*reportAtCurrentPosition*/ false, Nodes.Diagnostics._0_expected, "=>");
        result.body = this.parseArrowFunctionExpressionBody(/*isAsync*/ !!asyncModifier);

        return result;
    }

    private tryParseParenthesizedArrowFunctionExpression(): Nodes.Expression {
        const triState = this.isParenthesizedArrowFunctionExpression();
        if (triState === Nodes.Tristate.False) {
            // Nodes.It's definitely not a parenthesized arrow function expression.
            return undefined;
        }

        // Nodes.If we definitely have an arrow function, then we can just parse one, not requiring a
        // following => or { this.lexer.peek().type. Nodes.Otherwise, we *might* have an arrow function.  Nodes.Try to parse
        // it out, but don't allow any ambiguity, and return 'undefined' if this could be an
        // expression instead.
        const arrowFunction = triState === Nodes.Tristate.True
            ? this.parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ true)
            : this.tryParse(this.parsePossibleParenthesizedArrowFunctionExpressionHead);

        if (!arrowFunction) {
            // Nodes.Didn't appear to actually be a parenthesized arrow function.  Nodes.Just bail out.
            return undefined;
        }

        const isAsync = !!(arrowFunction.flags & Nodes.NodeFlags.Async);

        // Nodes.If we have an arrow, then try to parse the body. Nodes.Even if not, try to parse if we
        // have an opening brace, just in case we're in an error state.
        const lastToken = this.lexer.peek().type;
        arrowFunction.equalsGreaterThanToken = this.parseExpectedToken(TokenType.equalsGreaterThan, /*reportAtCurrentPosition*/false, Nodes.Diagnostics._0_expected, "=>");
        arrowFunction.body = (lastToken === TokenType.equalsGreaterThan || lastToken === TokenType.openBrace)
            ? this.parseArrowFunctionExpressionBody(isAsync)
            : this.parseIdentifier();

        return this.finishNode(arrowFunction);
    }

    //  Nodes.True        -> Nodes.We definitely expect a parenthesized arrow function here.
    //  Nodes.False       -> Nodes.There *cannot* be a parenthesized arrow function here.
    //  Nodes.Unknown     -> Nodes.There *might* be a parenthesized arrow function here.
    //                 Nodes.Speculatively look ahead to be sure, and rollback if not.
    private isParenthesizedArrowFunctionExpression(): Nodes.Tristate {
        if (this.lexer.peek().type === TokenType.openParen || this.lexer.peek().type === TokenType.lessThan || this.lexer.peek().type === TokenType.async) {
            return this.lookAhead(this.isParenthesizedArrowFunctionExpressionWorker);
        }

        if (this.lexer.peek().type === TokenType.equalsGreaterThan) {
            // Nodes.ERROR Nodes.RECOVERY Nodes.TWEAK:
            // Nodes.If we see a standalone => try to parse it as an arrow function expression as that's
            // likely what the user intended to write.
            return Nodes.Tristate.True;
        }
        // Nodes.Definitely not a parenthesized arrow function.
        return Nodes.Tristate.False;
    }

    private isParenthesizedArrowFunctionExpressionWorker() {
        if (this.lexer.peek().type === TokenType.async) {
            this.nextToken();
            if (this.lexer.peek().hasLineBreakBeforeStar) {
                return Nodes.Tristate.False;
            }
            if (this.lexer.peek().type !== TokenType.openParen && this.lexer.peek().type !== TokenType.lessThan) {
                return Nodes.Tristate.False;
            }
        }

        const first = this.lexer.peek().type;
        const second = this.nextToken();

        if (first === TokenType.openParen) {
            if (second === TokenType.closeParen) {
                // Nodes.Simple cases: "() =>", "(): ", and  "() {".
                // Nodes.This is an arrow function with no parameters.
                // Nodes.The last one is not actually an arrow function,
                // but this is probably what the user intended.
                const third = this.nextToken();
                switch (third) {
                    case TokenType.equalsGreaterThan:
                    case TokenType.colon:
                    case TokenType.openBrace:
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
            if (second === TokenType.openBracket || second === TokenType.openBrace) {
                return Nodes.Tristate.Unknown;
            }

            // Nodes.Simple case: "(..."
            // Nodes.This is an arrow function with a rest parameter.
            if (second === TokenType.dotDotDot) {
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
            if (this.nextToken() === TokenType.colon) {
                return Nodes.Tristate.True;
            }

            // Nodes.This *could* be a parenthesized arrow function.
            // Nodes.Return Nodes.Unknown to let the caller know.
            return Nodes.Tristate.Unknown;
        }
        else {
            console.assert(first === TokenType.lessThan);

            // Nodes.If we have "<" not followed by an identifier,
            // then this definitely is not an arrow function.
            if (!this.isIdentifier()) {
                return Nodes.Tristate.False;
            }

            // Nodes.JSX overrides
            if (this.sourceFile.languageVariant === Nodes.LanguageVariant.JSX) {
                const isArrowFunctionInJsx = this.lookAhead(() => {
                    const third = this.nextToken();
                    if (third === TokenType.extends) {
                        const fourth = this.nextToken();
                        switch (fourth) {
                            case TokenType.equals:
                            case TokenType.greaterThan:
                                return false;
                            default:
                                return true;
                        }
                    }
                    else if (third === TokenType.comma) {
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
    }

    private parsePossibleParenthesizedArrowFunctionExpressionHead(): Nodes.ArrowFunction {
        return this.parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ false);
    }

    private tryParseAsyncSimpleArrowFunctionExpression(): Nodes.ArrowFunction {
        // Nodes.We do a check here so that we won't be doing unnecessarily call to "this.lookAhead"
        if (this.lexer.peek().type === TokenType.async) {
            const isUnParenthesizedAsyncArrowFunction = this.lookAhead(this.isUnParenthesizedAsyncArrowFunctionWorker);
            if (isUnParenthesizedAsyncArrowFunction === Nodes.Tristate.True) {
                const asyncModifier = this.parseModifiersForArrowFunction();
                const expr = this.parseBinaryExpressionOrHigher(/*precedence*/ 0);
                return this.parseSimpleArrowFunctionExpression(<Nodes.Identifier>expr, asyncModifier);
            }
        }
        return undefined;
    }

    private isUnParenthesizedAsyncArrowFunctionWorker(): Nodes.Tristate {
        // Nodes.AsyncArrowFunctionExpression:
        //      1) async[no Nodes.LineTerminator here]Nodes.AsyncArrowBindingIdentifier[?Nodes.Yield][no Nodes.LineTerminator here]=>Nodes.AsyncConciseBody[?Nodes.In]
        //      2) Nodes.CoverCallExpressionAndAsyncArrowHead[?Nodes.Yield, ?Nodes.Await][no Nodes.LineTerminator here]=>Nodes.AsyncConciseBody[?Nodes.In]
        if (this.lexer.peek().type === TokenType.async) {
            this.nextToken();
            // Nodes.If the "async" is followed by "=>" this.lexer.peek().type then it is not a begining of an async arrow-function
            // but instead a simple arrow-function which will be parsed inside "this.parseAssignmentExpressionOrHigher"
            if (this.lexer.peek().hasLineBreakBeforeStar || this.lexer.peek().type === TokenType.equalsGreaterThan) {
                return Nodes.Tristate.False;
            }
            // Nodes.Check for un-parenthesized Nodes.AsyncArrowFunction
            const expr = this.parseBinaryExpressionOrHigher(/*precedence*/ 0);
            if (!this.lexer.peek().hasLineBreakBeforeStar && expr.kind === TokenType.Identifier && this.lexer.peek().type === TokenType.equalsGreaterThan) {
                return Nodes.Tristate.True;
            }
        }

        return Nodes.Tristate.False;
    }

    private parseParenthesizedArrowFunctionExpressionHead(allowAmbiguity: boolean): Nodes.ArrowFunction {
        const result = new Nodes.ArrowFunction();
        this.setModifiers(result, this.parseModifiersForArrowFunction());
        const isAsync = !!(result.flags & Nodes.NodeFlags.Async);

        // Nodes.Arrow functions are never generators.
        //
        // Nodes.If we're speculatively parsing a signature for a parenthesized arrow function, then
        // we have to have a complete parameter list.  Nodes.Otherwise we might see something like
        // a => (b => c)
        // Nodes.And think that "(b =>" was actually a parenthesized arrow function with a missing
        // close paren.
        this.fillSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ !allowAmbiguity, result);

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
        if (!allowAmbiguity && this.lexer.peek().type !== TokenType.equalsGreaterThan && this.lexer.peek().type !== TokenType.openBrace) {
            // Nodes.Returning undefined here will cause our caller to rewind to where we started from.
            return undefined;
        }

        return result;
    }

    private parseArrowFunctionExpressionBody(isAsync: boolean): Nodes.Block | Nodes.Expression {
        if (this.lexer.peek().type === TokenType.openBrace) {
            return this.parseFunctionBlock(/*allowYield*/ false, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);
        }

        if (this.lexer.peek().type !== TokenType.semicolon &&
            this.lexer.peek().type !== TokenType.function &&
            this.lexer.peek().type !== TokenType.class &&
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
    }

    private parseConditionalExpressionRest(leftOperand: Nodes.Expression): Nodes.Expression {
        // Nodes.Note: we are passed in an expression which was produced from this.parseBinaryExpressionOrHigher.
        const questionToken = this.parseOptionalToken(TokenType.question);
        if (!questionToken) {
            return leftOperand;
        }

        // Nodes.Note: we explicitly 'allowIn' in the whenTrue part of the condition expression, and
        // we do not that for the 'whenFalse' part.
        const result = new Nodes.ConditionalExpression();
        result.condition = leftOperand;
        result.questionToken = questionToken;
        result.whenTrue = this.doOutsideOfContext(this.disallowInAndDecoratorContext, this.parseAssignmentExpressionOrHigher);
        result.colonToken = this.parseExpectedToken(TokenType.colon, /*reportAtCurrentPosition*/ false,
            Nodes.Diagnostics._0_expected, tokenToString(TokenType.colon));
        result.whenFalse = this.parseAssignmentExpressionOrHigher();
        return result;
    }

    private parseBinaryExpressionOrHigher(precedence: number): Nodes.Expression {
        const leftOperand = this.parseUnaryExpressionOrHigher();
        return this.parseBinaryExpressionRest(precedence, leftOperand);
    }

    private isInOrOfKeyword(t: TokenType) {
        return t === TokenType.in || t === TokenType.of;
    }

    private parseBinaryExpressionRest(precedence: number, leftOperand: Nodes.Expression): Nodes.Expression {
        while (true) {
            // Nodes.We either have a binary operator here, or we're finished.  Nodes.We call
            // this.reScanGreaterToken so that we merge this.lexer.peek().type sequences like > and = into >=

            this.reScanGreaterToken();
            const newPrecedence = getBinaryOperatorPrecedence();

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
            const consumeCurrentOperator = this.lexer.peek().type === TokenType.asteriskAsterisk ?
                newPrecedence >= precedence :
                newPrecedence > precedence;

            if (!consumeCurrentOperator) {
                break;
            }

            if (this.lexer.peek().type === TokenType.in && this.inDisallowInContext()) {
                break;
            }

            if (this.lexer.peek().type === TokenType.as) {
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
    }

    private isBinaryOperator() {
        if (this.inDisallowInContext() && this.lexer.peek().type === TokenType.in) {
            return false;
        }

        return getBinaryOperatorPrecedence() > 0;
    }

    private makeBinaryExpression(left: Nodes.Expression, operatorToken: Nodes.Node, right: Nodes.Expression): Nodes.BinaryExpression {
        const result = new Nodes.BinaryExpression();
        result.left = left;
        result.operatorToken = operatorToken;
        result.right = right;
        return result;
    }

    private makeAsExpression(left: Nodes.Expression, right: Nodes.TypeNode): Nodes.AsExpression {
        const result = new Nodes.AsExpression();
        result.expression = left;
        result.type = right;
        return result;
    }

    private parsePrefixUnaryExpression() {
        const result = new Nodes.PrefixUnaryExpression();
        result.operator = this.lexer.peek().type;
        this.nextToken();
        result.operand = this.parseSimpleUnaryExpression();

        return result;
    }

    private parseDeleteExpression() {
        const result = new Nodes.DeleteExpression();
        this.nextToken();
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    }

    private parseTypeOfExpression() {
        const result = new Nodes.TypeOfExpression();
        this.nextToken();
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    }

    private parseVoidExpression() {
        const result = new Nodes.VoidExpression();
        this.nextToken();
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    }

    private isAwaitExpression(): boolean {
        if (this.lexer.peek().type === TokenType.await) {
            if (this.inAwaitContext()) {
                return true;
            }

            // here we are using similar heuristics as 'this.isYieldExpression'
            return this.lookAhead(this.nextTokenIsIdentifierOnSameLine);
        }

        return false;
    }

    private parseAwaitExpression() {
        const result = new Nodes.AwaitExpression();
        this.nextToken();
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    }

    /**
     * Nodes.Parse Nodes.ES7 unary expression and await expression
     *
     * Nodes.ES7 Nodes.UnaryExpression:
     *      1) Nodes.SimpleUnaryExpression[?yield]
     *      2) Nodes.IncrementExpression[?yield] ** Nodes.UnaryExpression[?yield]
     */
    private parseUnaryExpressionOrHigher(): Nodes.UnaryExpression | Nodes.BinaryExpression {
        if (this.isAwaitExpression()) {
            return this.parseAwaitExpression();
        }

        if (this.isIncrementExpression()) {
            const incrementExpression = this.parseIncrementExpression();
            return this.lexer.peek().type === TokenType.asteriskAsterisk ?
                <Nodes.BinaryExpression>this.parseBinaryExpressionRest(getBinaryOperatorPrecedence(), incrementExpression) :
                incrementExpression;
        }

        const unaryOperator = this.lexer.peek().type;
        const simpleUnaryExpression = this.parseSimpleUnaryExpression();
        if (this.lexer.peek().type === TokenType.asteriskAsterisk) {
            const start = skipTrivia(this.sourceText, simpleUnaryExpression.pos);
            if (simpleUnaryExpression.kind === TokenType.TypeAssertionExpression) {
                this.parseErrorAtPosition(start, simpleUnaryExpression.end - start, Nodes.Diagnostics.A_type_assertion_expression_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses);
            }
            else {
                this.parseErrorAtPosition(start, simpleUnaryExpression.end - start, Nodes.Diagnostics.An_unary_expression_with_the_0_operator_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses, tokenToString(unaryOperator));
            }
        }
        return simpleUnaryExpression;
    }

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
    private parseSimpleUnaryExpression(): Nodes.UnaryExpression {
        switch (this.lexer.peek().type) {
            case TokenType.plus:
            case TokenType.minus:
            case TokenType.tilde:
            case TokenType.exclamation:
                return this.parsePrefixUnaryExpression();
            case TokenType.delete:
                return this.parseDeleteExpression();
            case TokenType.typeof:
                return this.parseTypeOfExpression();
            case TokenType.void:
                return this.parseVoidExpression();
            case TokenType.lessThan:
                // Nodes.This is modified Nodes.UnaryExpression grammar in Nodes.TypeScript
                //  Nodes.UnaryExpression (modified):
                //      < type > Nodes.UnaryExpression
                return this.parseTypeAssertion();
            default:
                return this.parseIncrementExpression();
        }
    }

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
    private isIncrementExpression(): boolean {
        // Nodes.This function is called inside parseUnaryExpression to decide
        // whether to call this.parseSimpleUnaryExpression or call this.parseIncrementExpression directly
        switch (this.lexer.peek().type) {
            case TokenType.plus:
            case TokenType.minus:
            case TokenType.tilde:
            case TokenType.exclamation:
            case TokenType.delete:
            case TokenType.typeof:
            case TokenType.void:
                return false;
            case TokenType.lessThan:
                // Nodes.If we are not in Nodes.JSX context, we are parsing Nodes.TypeAssertion which is an Nodes.UnaryExpression
                if (this.sourceFile.languageVariant !== Nodes.LanguageVariant.JSX) {
                    return false;
                }
            // Nodes.We are in Nodes.JSX context and the this.lexer.peek().type is part of Nodes.JSXElement.
            // Nodes.Fall through
            default:
                return true;
        }
    }

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
    private parseIncrementExpression(): Nodes.IncrementExpression {
        if (this.lexer.peek().type === TokenType.plusPlus || this.lexer.peek().type === TokenType.minusMinus) {
            const result = new Nodes.PrefixUnaryExpression();
            result.operator = this.lexer.peek().type;
            this.nextToken();
            result.operand = this.parseLeftHandSideExpressionOrHigher();
            return result;
        }
        else if (this.sourceFile.languageVariant === Nodes.LanguageVariant.JSX && this.lexer.peek().type === TokenType.lessThan && this.lookAhead(this.nextTokenIsIdentifierOrKeyword)) {
            // Nodes.JSXElement is part of primaryExpression
            return this.parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ true);
        }

        const expression = this.parseLeftHandSideExpressionOrHigher();

        console.assert(isLeftHandSideExpression(expression));
        if ((this.lexer.peek().type === TokenType.plusPlus || this.lexer.peek().type === TokenType.minusMinus) && !this.lexer.peek().hasLineBreakBeforeStar) {
            const result = new Nodes.PostfixUnaryExpression();
            result.operand = expression;
            result.operator = this.lexer.peek().type;
            this.nextToken();
            return result;
        }

        return expression;
    }

    private parseLeftHandSideExpressionOrHigher(): Nodes.LeftHandSideExpression {
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
        const expression = this.lexer.peek().type === TokenType.super
            ? this.parseSuperExpression()
            : this.parseMemberExpressionOrHigher();

        // Nodes.Now, we *may* be complete.  Nodes.However, we might have consumed the start of a
        // Nodes.CallExpression.  Nodes.As such, we need to consume the rest of it here to be complete.
        return this.parseCallExpressionRest(expression);
    }

    private parseMemberExpressionOrHigher(): Nodes.MemberExpression {
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
        const expression = this.parsePrimaryExpression();
        return this.parseMemberExpressionRest(expression);
    }

    private parseSuperExpression(): Nodes.MemberExpression {
        const expression = this.parseTokenNode<Nodes.PrimaryExpression>();
        if (this.lexer.peek().type === TokenType.openParen || this.lexer.peek().type === TokenType.dot || this.lexer.peek().type === TokenType.openBracket) {
            return expression;
        }

        // Nodes.If we have seen "super" it must be followed by '(' or '.'.
        // Nodes.If it wasn't then just try to parse out a '.' and report an error.
        const result = new Nodes.PropertyAccessExpression();
        result.expression = expression;
        this.parseExpectedToken(TokenType.dot, /*reportAtCurrentPosition*/ false, Nodes.Diagnostics.super_must_be_followed_by_an_argument_list_or_member_access);
        result.name = this.parseRightSideOfDot(/*allowIdentifierNames*/ true);
        return result;
    }

    private tagNamesAreEquivalent(lhs: Nodes.JsxTagNameExpression, rhs: Nodes.JsxTagNameExpression): boolean {
        if (lhs.kind !== rhs.kind) {
            return false;
        }

        if (lhs.kind === TokenType.Identifier) {
            return (<Nodes.Identifier>lhs).text === (<Nodes.Identifier>rhs).text;
        }

        if (lhs.kind === TokenType.this) {
            return true;
        }

        // Nodes.If we are at this statement then we must have Nodes.PropertyAccessExpression and because tag name in Nodes.Jsx element can only
        // take forms of Nodes.JsxTagNameExpression which includes an identifier, "this" expression, or another propertyAccessExpression
        // it is safe to case the expression property as such. Nodes.See this.parseJsxElementName for how we parse tag name in Nodes.Jsx element
        return (<Nodes.PropertyAccessExpression>lhs).name.text === (<Nodes.PropertyAccessExpression>rhs).name.text &&
            this.tagNamesAreEquivalent((<Nodes.PropertyAccessExpression>lhs).expression as Nodes.JsxTagNameExpression, (<Nodes.PropertyAccessExpression>rhs).expression as Nodes.JsxTagNameExpression);
    }


    private parseJsxElementOrSelfClosingElement(inExpressionContext: boolean): Nodes.JsxElement | Nodes.JsxSelfClosingElement {
        const opening = this.parseJsxOpeningOrSelfClosingElement(inExpressionContext);
        let this.result: Nodes.JsxElement | Nodes.JsxSelfClosingElement;
        if (opening.kind === TokenType.JsxOpeningElement) {
            const result = new Nodes.JsxElement();
            result.openingElement = opening;

            result.children = this.parseJsxChildren(result.openingElement.tagName);
            result.closingElement = this.parseJsxClosingElement(inExpressionContext);

            if (!this.tagNamesAreEquivalent(result.openingElement.tagName, result.closingElement.tagName)) {
                this.parseErrorAtPosition(result.closingElement.pos, result.closingElement.end - result.closingElement.pos, Nodes.Diagnostics.Expected_corresponding_JSX_closing_tag_for_0, getTextOfNodeFromSourceText(this.sourceText, result.openingElement.tagName));
            }

            this.result = result;
        }
        else {
            console.assert(opening.kind === TokenType.JsxSelfClosingElement);
            // Nodes.Nothing else to do for self-closing elements
            this.result = <Nodes.JsxSelfClosingElement>opening;
        }

        // Nodes.If the user writes the invalid code '<div></div><div></div>' in an expression context (i.e. not wrapped in
        // an enclosing tag), we'll naively try to parse   ^ this as a 'less than' operator and the remainder of the tag
        // as garbage, which will cause the formatter to badly mangle the Nodes.JSX. Nodes.Perform a speculative parse of a Nodes.JSX
        // element if we see a < this.lexer.peek().type so that we can wrap it in a synthetic binary expression so the formatter
        // does less damage and we can report a better error.
        // Nodes.Since Nodes.JSX elements are invalid < operands anyway, this lookahead parse will only occur in error scenarios
        // of one sort or another.
        if (inExpressionContext && this.lexer.peek().type === TokenType.lessThan) {
            const invalidElement = this.tryParse(() => this.parseJsxElementOrSelfClosingElement(/*inExpressionContext*/true));
            if (invalidElement) {
                this.parseErrorAtCurrentToken(Nodes.Diagnostics.JSX_expressions_must_have_one_parent_element);
                const badNode = new Nodes.BinaryExpression();
                badNode.end = invalidElement.end;
                badNode.left = this.result;
                badNode.right = invalidElement;
                badNode.operatorToken = this.createMissingNode(TokenType.comma, /*reportAtCurrentPosition*/ false, /*diagnosticMessage*/ undefined);
                badNode.operatorToken.pos = badNode.operatorToken.end = badNode.right.pos;
                return <Nodes.JsxElement><Nodes.Node>badNode;
            }
        }

        return this.result;
    }

    private parseJsxText(): Nodes.JsxText {
        const result = new Nodes.JsxText());
        this.lexer.peek().type = this.lexer.scanJsxToken();
        return result;
    }

    private parseJsxChild(): Nodes.JsxChild {
        switch (this.lexer.peek().type) {
            case TokenType.JsxText:
                return this.parseJsxText();
            case TokenType.openBrace:
                return this.parseJsxExpression(/*inExpressionContext*/ false);
            case TokenType.lessThan:
                return this.parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ false);
        }
        Nodes.Debug.fail("Nodes.Unknown Nodes.JSX child kind " + this.lexer.peek().type);
    }

    private parseJsxChildren(openingTagName: Nodes.LeftHandSideExpression): Nodes.NodeList<Nodes.JsxChild> {
        const this.result = <Nodes.NodeList<Nodes.JsxChild>>[];
        this.result.pos = this.lexer.getStartPos();
        const saveParsingContext = this.parsingContext;
        this.parsingContext |= 1 << Nodes.ParsingContext.JsxChildren;

        while (true) {
            this.lexer.peek().type = this.lexer.reScanJsxToken();
            if (this.lexer.peek().type === TokenType.lessThanSlash) {
                // Nodes.Closing tag
                break;
            }
            else if (this.lexer.peek().type === TokenType.endOfFile) {
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
    }

    private parseJsxOpeningOrSelfClosingElement(inExpressionContext: boolean): Nodes.JsxOpeningElement | Nodes.JsxSelfClosingElement {
        const fullStart = this.lexer.getStartPos();

        this.parseExpected(TokenType.lessThan);

        const tagName = this.parseJsxElementName();

        const attributes = this.parseList(Nodes.ParsingContext.JsxAttributes, this.parseJsxAttribute);
        let result: Nodes.JsxOpeningLikeElement;

        if (this.lexer.peek().type === TokenType.greaterThan) {
            // Nodes.Closing tag, so scan the immediately-following text with the Nodes.JSX scanning instead
            // of regular scanning to avoid treating illegal characters (e.g. '#') as immediate
            // scanning errors
            result = new Nodes.JsxOpeningElement();
            this.scanJsxText();
        }
        else {
            this.parseExpected(TokenType.slash);
            if (inExpressionContext) {
                this.parseExpected(TokenType.greaterThan);
            }
            else {
                this.parseExpected(TokenType.greaterThan, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
                this.scanJsxText();
            }
            result = new Nodes.JsxSelfClosingElement();
        }

        result.tagName = tagName;
        result.attributes = attributes;

        return result;
    }

    private parseJsxElementName(): Nodes.JsxTagNameExpression {
        this.scanJsxIdentifier();
        // Nodes.JsxElement can have name in the form of
        //      propertyAccessExpression
        //      primaryExpression in the form of an identifier and "this" keyword
        // Nodes.We can't just simply use this.parseLeftHandSideExpressionOrHigher because then we will start consider class,function etc as a keyword
        // Nodes.We only want to consider "this" as a primaryExpression
        let expression: Nodes.JsxTagNameExpression = this.lexer.peek().type === TokenType.this ?
            this.parseTokenNode<Nodes.PrimaryExpression>() : this.parseIdentifierName();
        while (this.parseOptional(TokenType.dot)) {
            const propertyAccess: Nodes.PropertyAccessExpression = new Nodes.PropertyAccessExpression();
            propertyAccess.expression = expression;
            propertyAccess.name = this.parseRightSideOfDot(/*allowIdentifierNames*/ true);
            expression = this.finishNode(propertyAccess);
        }
        return expression;
    }

    private parseJsxExpression(inExpressionContext: boolean): Nodes.JsxExpression {
        const result = new Nodes.JsxExpression();

        this.parseExpected(TokenType.openBrace);
        if (this.lexer.peek().type !== TokenType.closeBrace) {
            result.expression = this.parseAssignmentExpressionOrHigher();
        }
        if (inExpressionContext) {
            this.parseExpected(TokenType.closeBrace);
        }
        else {
            this.parseExpected(TokenType.closeBrace, /*message*/ undefined, /*shouldAdvance*/ false);
            this.scanJsxText();
        }

        return result;
    }

    private parseJsxAttribute(): Nodes.JsxAttribute | Nodes.JsxSpreadAttribute {
        if (this.lexer.peek().type === TokenType.openBrace) {
            return this.parseJsxSpreadAttribute();
        }

        this.scanJsxIdentifier();
        const result = new Nodes.JsxAttribute();
        result.name = this.parseIdentifierName();
        if (this.parseOptional(TokenType.equals)) {
            switch (this.lexer.peek().type) {
                case TokenType.StringLiteral:
                    result.initializer = this.parseLiteralNode();
                    break;
                default:
                    result.initializer = this.parseJsxExpression(/*inExpressionContext*/ true);
                    break;
            }
        }
        return result;
    }

    private parseJsxSpreadAttribute(): Nodes.JsxSpreadAttribute {
        const result = new Nodes.JsxSpreadAttribute();
        this.parseExpected(TokenType.openBrace);
        this.parseExpected(TokenType.dotDotDot);
        result.expression = this.parseExpression();
        this.parseExpected(TokenType.closeBrace);
        return result;
    }

    private parseJsxClosingElement(inExpressionContext: boolean): Nodes.JsxClosingElement {
        const result = new Nodes.JsxClosingElement();
        this.parseExpected(TokenType.lessThanSlash);
        result.tagName = this.parseJsxElementName();
        if (inExpressionContext) {
            this.parseExpected(TokenType.greaterThan);
        }
        else {
            this.parseExpected(TokenType.greaterThan, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
            this.scanJsxText();
        }
        return result;
    }

    private parseTypeAssertion(): Nodes.TypeAssertion {
        const result = new Nodes.TypeAssertion();
        this.parseExpected(TokenType.lessThan);
        result.type = this.parseType();
        this.parseExpected(TokenType.greaterThan);
        result.expression = this.parseSimpleUnaryExpression();
        return result;
    }

    private parseMemberExpressionRest(expression: Nodes.LeftHandSideExpression): Nodes.MemberExpression {
        while (true) {
            const dotToken = this.parseOptionalToken(TokenType.dot);
            if (dotToken) {
                const propertyAccess = new Nodes.PropertyAccessExpression();
                propertyAccess.expression = expression;
                propertyAccess.name = this.parseRightSideOfDot(/*allowIdentifierNames*/ true);
                expression = this.finishNode(propertyAccess);
                continue;
            }

            if (this.lexer.peek().type === TokenType.exclamation && !this.lexer.peek().hasLineBreakBeforeStar) {
                this.nextToken();
                const nonNullExpression = new Nodes.NonNullExpression();
                nonNullExpression.expression = expression;
                expression = this.finishNode(nonNullExpression);
                continue;
            }

            // when in the [Nodes.Decorator] context, we do not parse Nodes.ElementAccess as it could be part of a Nodes.ComputedPropertyName
            if (!this.inDecoratorContext() && this.parseOptional(TokenType.openBracket)) {
                const indexedAccess = new Nodes.ElementAccessExpression();
                indexedAccess.expression = expression;

                // Nodes.It's not uncommon for a user to write: "new Nodes.Type[]".
                // Nodes.Check for that common pattern and report a better error message.
                if (this.lexer.peek().type !== TokenType.closeBracket) {
                    indexedAccess.argumentExpression = this.allowInAnd(this.parseExpression);
                    if (indexedAccess.argumentExpression.kind === TokenType.StringLiteral || indexedAccess.argumentExpression.kind === TokenType.NumericLiteral) {
                        const literal = <Nodes.LiteralExpression>indexedAccess.argumentExpression;
                        literal.text = this.internIdentifier(literal.text);
                    }
                }

                this.parseExpected(TokenType.closeBracket);
                expression = this.finishNode(indexedAccess);
                continue;
            }

            if (this.lexer.peek().type === TokenType.NoSubstitutionTemplateLiteral || this.lexer.peek().type === TokenType.TemplateHead) {
                const tagExpression = new Nodes.TaggedTemplateExpression();
                tagExpression.tag = expression;
                tagExpression.template = this.lexer.peek().type === TokenType.NoSubstitutionTemplateLiteral
                    ? this.parseLiteralNode()
                    : this.parseTemplateExpression();
                expression = this.finishNode(tagExpression);
                continue;
            }

            return <Nodes.MemberExpression>expression;
        }
    }

    private parseCallExpressionRest(expression: Nodes.LeftHandSideExpression): Nodes.LeftHandSideExpression {
        while (true) {
            expression = this.parseMemberExpressionRest(expression);
            if (this.lexer.peek().type === TokenType.lessThan) {
                // Nodes.See if this is the start of a generic invocation.  Nodes.If so, consume it and
                // keep checking for postfix expressions.  Nodes.Otherwise, it's just a '<' that's
                // part of an arithmetic expression.  Nodes.Break out so we consume it higher in the
                // stack.
                const typeArguments = this.tryParse(this.parseTypeArgumentsInExpression);
                if (!typeArguments) {
                    return expression;
                }

                const callExpr = new Nodes.CallExpression();
                callExpr.expression = expression;
                callExpr.typeArguments = typeArguments;
                callExpr.arguments = this.parseArgumentList();
                expression = this.finishNode(callExpr);
                continue;
            }
            else if (this.lexer.peek().type === TokenType.openParen) {
                const callExpr = new Nodes.CallExpression();
                callExpr.expression = expression;
                callExpr.arguments = this.parseArgumentList();
                expression = this.finishNode(callExpr);
                continue;
            }

            return expression;
        }
    }

    private parseArgumentList() {
        this.parseExpected(TokenType.openParen);
        const this.result = this.parseDelimitedList(Nodes.ParsingContext.ArgumentExpressions, this.parseArgumentExpression);
        this.parseExpected(TokenType.closeParen);
        return this.result;
    }

    private parseTypeArgumentsInExpression() {
        if (!this.parseOptional(TokenType.lessThan)) {
            return undefined;
        }

        const typeArguments = this.parseDelimitedList(Nodes.ParsingContext.TypeArguments, this.parseType);
        if (!this.parseExpected(TokenType.greaterThan)) {
            // Nodes.If it doesn't have the closing >  then it's definitely not an type argument list.
            return undefined;
        }

        // Nodes.If we have a '<', then only parse this as a argument list if the type arguments
        // are complete and we have an open paren.  if we don't, rewind and return nothing.
        return typeArguments && this.canFollowTypeArgumentsInExpression()
            ? typeArguments
            : undefined;
    }

    private canFollowTypeArgumentsInExpression(): boolean {
        switch (this.lexer.peek().type) {
            case TokenType.openParen:                 // foo<x>(
            // this case are the only case where this this.lexer.peek().type can legally follow a type argument
            // list.  Nodes.So we definitely want to treat this as a type arg list.

            case TokenType.dot:                       // foo<x>.
            case TokenType.closeParen:                // foo<x>)
            case TokenType.closeBracket:              // foo<x>]
            case TokenType.colon:                     // foo<x>:
            case TokenType.semicolon:                 // foo<x>;
            case TokenType.question:                  // foo<x>?
            case TokenType.equalsEquals:              // foo<x> ==
            case TokenType.equalsEqualsEquals:        // foo<x> ===
            case TokenType.exclamationEquals:         // foo<x> !=
            case TokenType.exclamationEqualsEquals:   // foo<x> !==
            case TokenType.ampersandAmpersand:        // foo<x> &&
            case TokenType.barBar:                    // foo<x> ||
            case TokenType.caret:                     // foo<x> ^
            case TokenType.ampersand:                 // foo<x> &
            case TokenType.bar:                       // foo<x> |
            case TokenType.closeBrace:                // foo<x> }
            case TokenType.endOfFile:                 // foo<x>
                // these cases can't legally follow a type arg list.  Nodes.However, they're not legal
                // expressions either.  Nodes.The user is probably in the middle of a generic type. Nodes.So
                // treat it as such.
                return true;

            case TokenType.comma:                     // foo<x>,
            case TokenType.openBrace:                 // foo<x> {
            // Nodes.We don't want to treat these as type arguments.  Nodes.Otherwise we'll parse this
            // as an invocation expression.  Nodes.Instead, we want to parse out the expression
            // in isolation from the type arguments.

            default:
                // Nodes.Anything else treat as an expression.
                return false;
        }
    }

    private parsePrimaryExpression(): Nodes.PrimaryExpression {
        switch (this.lexer.peek().type) {
            case TokenType.NumericLiteral:
            case TokenType.StringLiteral:
            case TokenType.NoSubstitutionTemplateLiteral:
                return this.parseLiteralNode();
            case TokenType.this:
            case TokenType.super:
            case TokenType.null:
            case TokenType.true:
            case TokenType.false:
                return this.parseTokenNode<Nodes.PrimaryExpression>();
            case TokenType.openParen:
                return this.parseParenthesizedExpression();
            case TokenType.openBracket:
                return this.parseArrayLiteralExpression();
            case TokenType.openBrace:
                return this.parseObjectLiteralExpression();
            case TokenType.async:
                // Nodes.Async arrow functions are parsed earlier in this.parseAssignmentExpressionOrHigher.
                // Nodes.If we encounter `async [no Nodes.LineTerminator here] function` then this is an async
                // function; otherwise, its an identifier.
                if (!this.lookAhead(this.nextTokenIsFunctionKeywordOnSameLine)) {
                    break;
                }

                return this.parseFunctionExpression();
            case TokenType.class:
                return this.parseClassExpression();
            case TokenType.function:
                return this.parseFunctionExpression();
            case TokenType.new:
                return this.parseNewExpression();
            case TokenType.slash:
            case TokenType.slashEquals:
                if (this.reScanSlashToken() === TokenType.RegularExpressionLiteral) {
                    return this.parseLiteralNode();
                }
                break;
            case TokenType.TemplateHead:
                return this.parseTemplateExpression();
        }

        return this.parseIdentifier(Nodes.Diagnostics.Expression_expected);
    }

    private parseParenthesizedExpression(): Nodes.ParenthesizedExpression {
        const result = new Nodes.ParenthesizedExpression();
        this.parseExpected(TokenType.openParen);
        result.expression = this.allowInAnd(this.parseExpression);
        this.parseExpected(TokenType.closeParen);
        return result;
    }

    private parseSpreadElement(): Nodes.Expression {
        const result = new Nodes.SpreadElementExpression();
        this.parseExpected(TokenType.dotDotDot);
        result.expression = this.parseAssignmentExpressionOrHigher();
        return result;
    }

    private parseArgumentOrArrayLiteralElement(): Nodes.Expression {
        return this.lexer.peek().type === TokenType.dotDotDot ? this.parseSpreadElement() :
            this.lexer.peek().type === TokenType.comma ? new Nodes.Expression() :
                this.parseAssignmentExpressionOrHigher();
    }

    private parseArgumentExpression(): Nodes.Expression {
        return this.doOutsideOfContext(this.disallowInAndDecoratorContext, this.parseArgumentOrArrayLiteralElement);
    }

    private parseArrayLiteralExpression(): Nodes.ArrayLiteralExpression {
        const result = new Nodes.ArrayLiteralExpression();
        this.parseExpected(TokenType.openBracket);
        if (this.lexer.peek().hasLineBreakBeforeStar) {
            result.multiLine = true;
        }
        result.elements = this.parseDelimitedList(Nodes.ParsingContext.ArrayLiteralMembers, this.parseArgumentOrArrayLiteralElement);
        this.parseExpected(TokenType.closeBracket);
        return result;
    }

    private tryParseAccessorDeclaration(fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray): Nodes.AccessorDeclaration {
        if (this.parseContextualModifier(TokenType.get)) {
            return this.parseJsDocComment(this.parseAccessorDeclaration(TokenType.GetAccessor, fullStart, decorators, modifiers));
        }
        else if (this.parseContextualModifier(TokenType.set)) {
            return this.parseAccessorDeclaration(TokenType.SetAccessor, fullStart, decorators, modifiers);
        }

        return undefined;
    }

    private parseObjectLiteralElement(): Nodes.ObjectLiteralElement {
        const fullStart = this.lexer.getStartPos();
        const decorators = this.parseDecorators();
        const modifiers = this.parseModifiers();

        const accessor = this.tryParseAccessorDeclaration(fullStart, decorators, modifiers);
        if (accessor) {
            return accessor;
        }

        const asteriskToken = this.parseOptionalToken(TokenType.asterisk);
        const tokenIsIdentifier = this.isIdentifier();
        const propertyName = this.parsePropertyName();

        // Nodes.Disallowing of optional property assignments happens in the grammar checker.
        const questionToken = this.parseOptionalToken(TokenType.question);
        if (asteriskToken || this.lexer.peek().type === TokenType.openParen || this.lexer.peek().type === TokenType.lessThan) {
            return this.parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, propertyName, questionToken);
        }

        // check if it is short-hand property assignment or normal property assignment
        // Nodes.NOTE: if this.lexer.peek().type is Nodes.EqualsToken it is interpreted as Nodes.CoverInitializedName production
        // Nodes.CoverInitializedName[Nodes.Yield] :
        //     Nodes.IdentifierReference[?Nodes.Yield] Nodes.Initializer[Nodes.In, ?Nodes.Yield]
        // this is necessary because Nodes.ObjectLiteral productions are also used to cover grammar for Nodes.ObjectAssignmentPattern
        const isShorthandPropertyAssignment =
            tokenIsIdentifier && (this.lexer.peek().type === TokenType.comma || this.lexer.peek().type === TokenType.closeBrace || this.lexer.peek().type === TokenType.equals);

        if (isShorthandPropertyAssignment) {
            const shorthandDeclaration = new Nodes.ShorthandPropertyAssignment();
            shorthandDeclaration.name = <Nodes.Identifier>propertyName;
            shorthandDeclaration.questionToken = questionToken;
            const equalsToken = this.parseOptionalToken(TokenType.equals);
            if (equalsToken) {
                shorthandDeclaration.equalsToken = equalsToken;
                shorthandDeclaration.objectAssignmentInitializer = this.allowInAnd(this.parseAssignmentExpressionOrHigher);
            }
            return this.parseJsDocComment(this.finishNode(shorthandDeclaration));
        }
        else {
            const propertyAssignment = new Nodes.PropertyAssignment();
            propertyAssignment.modifiers = modifiers;
            propertyAssignment.name = propertyName;
            propertyAssignment.questionToken = questionToken;
            this.parseExpected(TokenType.colon);
            propertyAssignment.initializer = this.allowInAnd(this.parseAssignmentExpressionOrHigher);
            return this.parseJsDocComment(this.finishNode(propertyAssignment));
        }
    }

    private parseObjectLiteralExpression(): Nodes.ObjectLiteralExpression {
        const result = new Nodes.ObjectLiteralExpression();
        this.parseExpected(TokenType.openBrace);
        if (this.lexer.peek().hasLineBreakBeforeStar) {
            result.multiLine = true;
        }

        result.properties = this.parseDelimitedList(Nodes.ParsingContext.ObjectLiteralMembers, this.parseObjectLiteralElement, /*considerSemicolonAsDelimiter*/ true);
        this.parseExpected(TokenType.closeBrace);
        return result;
    }

    private parseFunctionExpression(): Nodes.FunctionExpression {
        // Nodes.GeneratorExpression:
        //      function* Nodes.BindingIdentifier [Nodes.Yield][opt](Nodes.FormalParameters[Nodes.Yield]){ Nodes.GeneratorBody }
        //
        // Nodes.FunctionExpression:
        //      function Nodes.BindingIdentifier[opt](Nodes.FormalParameters){ Nodes.FunctionBody }
        const saveDecoratorContext = this.inDecoratorContext();
        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ false);
        }

        const result = new Nodes.FunctionExpression();
        this.setModifiers(result, this.parseModifiers());
        this.parseExpected(TokenType.function);
        result.asteriskToken = this.parseOptionalToken(TokenType.asterisk);

        const isGenerator = !!result.asteriskToken;
        const isAsync = !!(result.flags & Nodes.NodeFlags.Async);
        result.name =
            isGenerator && isAsync ? this.doInYieldAndAwaitContext(this.parseOptionalIdentifier) :
                isGenerator ? this.doInYieldContext(this.parseOptionalIdentifier) :
                    isAsync ? this.doInAwaitContext(this.parseOptionalIdentifier) :
                        this.parseOptionalIdentifier();

        this.fillSignature(TokenType.colon, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, result);
        result.body = this.parseFunctionBlock(/*allowYield*/ isGenerator, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);

        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ true);
        }

        return this.parseJsDocComment(result);
    }

    private parseOptionalIdentifier() {
        return this.isIdentifier() ? this.parseIdentifier() : undefined;
    }

    private parseNewExpression(): Nodes.NewExpression {
        const result = new Nodes.NewExpression();
        this.parseExpected(TokenType.new);
        result.expression = this.parseMemberExpressionOrHigher();
        result.typeArguments = this.tryParse(this.parseTypeArgumentsInExpression);
        if (result.typeArguments || this.lexer.peek().type === TokenType.openParen) {
            result.arguments = this.parseArgumentList();
        }

        return result;
    }

    // Nodes.STATEMENTS

    private parseFunctionBlock(allowYield: boolean, allowAwait: boolean, ignoreMissingOpenBrace: boolean, diagnosticMessage?: Nodes.DiagnosticMessage): Nodes.Block {
        const savedYieldContext = this.inYieldContext();
        this.setYieldContext(allowYield);

        const savedAwaitContext = this.inAwaitContext();
        this.setAwaitContext(allowAwait);

        // Nodes.We may be in a [Nodes.Decorator] context when parsing a function expression or
        // arrow function. Nodes.The body of the function is not in [Nodes.Decorator] context.
        const saveDecoratorContext = this.inDecoratorContext();
        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ false);
        }

        const block = this.parseBlockStatement(ignoreMissingOpenBrace, diagnosticMessage);

        if (saveDecoratorContext) {
            this.setDecoratorContext(/*val*/ true);
        }

        this.setYieldContext(savedYieldContext);
        this.setAwaitContext(savedAwaitContext);

        return block;
    }


    private parseReturnStatement(): Nodes.ReturnStatement {
        const result = new Nodes.ReturnStatement();

        this.parseExpected(TokenType.return);
        if (!this.canParseSemicolon()) {
            result.expression = this.allowInAnd(this.parseExpression);
        }

        this.expectSemicolon();
        return result;
    }

    private parseWithStatement(): Nodes.WithStatement {
        const result = new Nodes.WithStatement();
        this.parseExpected(TokenType.with);
        this.parseExpected(TokenType.openParen);
        result.expression = this.allowInAnd(this.parseExpression);
        this.parseExpected(TokenType.closeParen);
        result.statement = this.parseStatement();
        return result;
    }

    private parseThrowStatement(): Nodes.ThrowStatement {
        // Nodes.ThrowStatement[Nodes.Yield] :
        //      throw [no Nodes.LineTerminator here]Nodes.Expression[Nodes.In, ?Nodes.Yield];

        // Nodes.Because of automatic semicolon insertion, we need to report error if this
        // throw could be terminated with a semicolon.  Nodes.Note: we can't call 'this.parseExpression'
        // directly as that might consume an expression on the following line.
        // Nodes.We just return 'undefined' in that case.  Nodes.The actual error will be reported in the
        // grammar walker.
        const result = new Nodes.ThrowStatement();
        this.parseExpected(TokenType.throw);
        result.expression = this.lexer.peek().hasLineBreakBeforeStar ? undefined : this.allowInAnd(this.parseExpression);
        this.expectSemicolon();
        return result;
    }

    // Nodes.TODO: Nodes.Review for error recovery
    private parseTryStatement(): Nodes.TryStatement {
        const result = new Nodes.TryStatement();

        this.parseExpected(TokenType.try);
        result.tryBlock = this.parseBlockStatement(/*ignoreMissingOpenBrace*/ false);
        result.catchClause = this.lexer.peek().type === TokenType.catch ? this.parseCatchClause() : undefined;

        // Nodes.If we don't have a catch clause, then we must have a finally clause.  Nodes.Try to parse
        // one out no matter what.
        if (!result.catchClause || this.lexer.peek().type === TokenType.finally) {
            this.parseExpected(TokenType.finally);
            result.finallyBlock = this.parseBlockStatement(/*ignoreMissingOpenBrace*/ false);
        }

        return result;
    }

    private parseCatchClause(): Nodes.CatchClause {
        const this.result = new Nodes.CatchClause();
        this.parseExpected(TokenType.catch);
        if (this.parseExpected(TokenType.openParen)) {
            this.result.variableDeclaration = this.parseVariableDeclaration();
        }

        this.parseExpected(TokenType.closeParen);
        this.result.block = this.parseBlockStatement(/*ignoreMissingOpenBrace*/ false);
        return this.finishNode(this.result);
    }

    private parseDebuggerStatement(): Nodes.Statement {
        const result = new Nodes.Statement();
        this.parseExpected(TokenType.debugger);
        this.expectSemicolon();
        return result;
    }

    private nextTokenIsIdentifierOrKeywordOnSameLine() {
        this.nextToken();
        return tokenIsIdentifierOrKeyword(this.lexer.peek().type) && !this.lexer.peek().hasLineBreakBeforeStar;
    }

    private nextTokenIsFunctionKeywordOnSameLine() {
        this.nextToken();
        return this.lexer.peek().type === TokenType.function && !this.lexer.peek().hasLineBreakBeforeStar;
    }

    private nextTokenIsIdentifierOrKeywordOrNumberOnSameLine() {
        this.nextToken();
        return (tokenIsIdentifierOrKeyword(this.lexer.peek().type) || this.lexer.peek().type === TokenType.NumericLiteral) && !this.lexer.peek().hasLineBreakBeforeStar;
    }

    private isDeclaration(): boolean {
        while (true) {
            switch (this.lexer.peek().type) {
                case TokenType.var:
                case TokenType.let:
                case TokenType.const:
                case TokenType.function:
                case TokenType.class:
                case TokenType.enum:
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
                case TokenType.interface:
                case TokenType.type:
                    return this.nextTokenIsIdentifierOnSameLine();
                case TokenType.module:
                case TokenType.namespace:
                    return this.nextTokenIsIdentifierOrStringLiteralOnSameLine();
                case TokenType.abstract:
                case TokenType.async:
                case TokenType.declare:
                case TokenType.private:
                case TokenType.protected:
                case TokenType.public:
                case TokenType.readonly:
                    this.nextToken();
                    // Nodes.ASI takes effect for this modifier.
                    if (this.lexer.peek().hasLineBreakBeforeStar) {
                        return false;
                    }
                    continue;

                case TokenType.global:
                    this.nextToken();
                    return this.lexer.peek().type === TokenType.openBrace || this.lexer.peek().type === TokenType.Identifier || this.lexer.peek().type === TokenType.export;

                case TokenType.import:
                    this.nextToken();
                    return this.lexer.peek().type === TokenType.StringLiteral || this.lexer.peek().type === TokenType.asterisk ||
                        this.lexer.peek().type === TokenType.openBrace || tokenIsIdentifierOrKeyword(this.lexer.peek().type);
                case TokenType.export:
                    this.nextToken();
                    if (this.lexer.peek().type === TokenType.equals || this.lexer.peek().type === TokenType.asterisk ||
                        this.lexer.peek().type === TokenType.openBrace || this.lexer.peek().type === TokenType.default ||
                        this.lexer.peek().type === TokenType.as) {
                        return true;
                    }
                    continue;

                case TokenType.static:
                    this.nextToken();
                    continue;
                default:
                    return false;
            }
        }
    }

    private isStartOfDeclaration(): boolean {
        return this.lookAhead(this.isDeclaration);
    }

    private isStartOfStatement(): boolean {
        switch (this.lexer.peek().type) {
            case TokenType.at:
            case TokenType.semicolon:
            case TokenType.openBrace:
            case TokenType.var:
            case TokenType.let:
            case TokenType.function:
            case TokenType.class:
            case TokenType.enum:
            case TokenType.if:
            case TokenType.do:
            case TokenType.while:
            case TokenType.for:
            case TokenType.continue:
            case TokenType.break:
            case TokenType.return:
            case TokenType.with:
            case TokenType.switch:
            case TokenType.throw:
            case TokenType.try:
            case TokenType.debugger:
            // 'catch' and 'finally' do not actually indicate that the code is part of a statement,
            // however, we say they are here so that we may gracefully parse them and error later.
            case TokenType.catch:
            case TokenType.finally:
                return true;

            case TokenType.const:
            case TokenType.export:
            case TokenType.import:
                return this.isStartOfDeclaration();

            case TokenType.async:
            case TokenType.declare:
            case TokenType.interface:
            case TokenType.module:
            case TokenType.namespace:
            case TokenType.type:
            case TokenType.global:
                // Nodes.When these don't start a declaration, they're an identifier in an expression statement
                return true;

            case TokenType.public:
            case TokenType.private:
            case TokenType.protected:
            case TokenType.static:
            case TokenType.readonly:
                // Nodes.When these don't start a declaration, they may be the start of a class member if an identifier
                // immediately follows. Nodes.Otherwise they're an identifier in an expression statement.
                return this.isStartOfDeclaration() || !this.lookAhead(this.nextTokenIsIdentifierOrKeywordOnSameLine);

            default:
                return this.isStartOfExpression();
        }
    }

    private nextTokenIsIdentifierOrStartOfDestructuring() {
        this.nextToken();
        return this.isIdentifier() || this.lexer.peek().type === TokenType.openBrace || this.lexer.peek().type === TokenType.openBracket;
    }

    private isLetDeclaration() {
        // Nodes.In Nodes.ES6 'let' always starts a lexical declaration if followed by an identifier or {
        // or [.
        return this.lookAhead(this.nextTokenIsIdentifierOrStartOfDestructuring);
    }

    private parseDeclaration(): Nodes.Statement {
        const fullStart = this.getNodePos();
        const decorators = this.parseDecorators();
        const modifiers = this.parseModifiers();
        switch (this.lexer.peek().type) {
            case TokenType.var:
            case TokenType.let:
            case TokenType.const:
                return this.parseVariableStatement(fullStart, decorators, modifiers);
            case TokenType.function:
                return this.parseFunctionDeclaration(fullStart, decorators, modifiers);
            case TokenType.class:
                return this.parseClassDeclaration(fullStart, decorators, modifiers);
            case TokenType.interface:
                return this.parseInterfaceDeclaration(fullStart, decorators, modifiers);
            case TokenType.type:
                return this.parseTypeAliasDeclaration(fullStart, decorators, modifiers);
            case TokenType.enum:
                return this.parseEnumDeclaration(fullStart, decorators, modifiers);
            case TokenType.global:
            case TokenType.module:
            case TokenType.namespace:
                return this.parseModuleDeclaration(fullStart, decorators, modifiers);
            case TokenType.import:
                return this.parseImportDeclarationOrImportEqualsDeclaration(fullStart, decorators, modifiers);
            case TokenType.export:
                this.nextToken();
                switch (this.lexer.peek().type) {
                    case TokenType.default:
                    case TokenType.equals:
                        return this.parseExportAssignment(fullStart, decorators, modifiers);
                    case TokenType.as:
                        return this.parseNamespaceExportDeclaration(fullStart, decorators, modifiers);
                    default:
                        return this.parseExportDeclaration(fullStart, decorators, modifiers);
                }
            default:
                if (decorators || modifiers) {
                    // Nodes.We reached this point because we encountered decorators and/or modifiers and assumed a declaration
                    // would follow. Nodes.For recovery and error reporting purposes, return an incomplete declaration.
                    const result = <Nodes.Statement>this.createMissingNode(TokenType.MissingDeclaration, /*reportAtCurrentPosition*/ true, Nodes.Diagnostics.Declaration_expected);
                    result.pos = fullStart;
                    result.decorators = decorators;
                    this.setModifiers(result, modifiers);
                    return result;
                }
        }
    }

    private nextTokenIsIdentifierOrStringLiteralOnSameLine() {
        this.nextToken();
        return !this.lexer.peek().hasLineBreakBeforeStar && (this.isIdentifier() || this.lexer.peek().type === TokenType.StringLiteral);
    }

    private parseFunctionBlockOrSemicolon(isGenerator: boolean, isAsync: boolean, diagnosticMessage?: Nodes.DiagnosticMessage): Nodes.Block {
        if (this.lexer.peek().type !== TokenType.openBrace && this.canParseSemicolon()) {
            this.expectSemicolon();
            return;
        }

        return this.parseFunctionBlock(isGenerator, isAsync, /*ignoreMissingOpenBrace*/ false, diagnosticMessage);
    }

    // Nodes.DECLARATIONS

    private parseArrayBindingElement(): Nodes.BindingElement {
        if (this.lexer.peek().type === TokenType.comma) {
            return new Nodes.BindingElement();
        }
        const result = new Nodes.BindingElement();
        result.dotDotDotToken = this.parseOptionalToken(TokenType.dotDotDot);
        result.name = this.parseBindingName();
        result.initializer = this.parseBindingElementInitializer(/*inParameter*/ false);
        return result;
    }

    private parseObjectBindingElement(): Nodes.BindingElement {
        const result = new Nodes.BindingElement();
        const tokenIsIdentifier = this.isIdentifier();
        const propertyName = this.parsePropertyName();
        if (tokenIsIdentifier && this.lexer.peek().type !== TokenType.colon) {
            result.name = <Nodes.Identifier>propertyName;
        }
        else {
            this.parseExpected(TokenType.colon);
            result.propertyName = propertyName;
            result.name = this.parseBindingName();
        }
        result.initializer = this.parseBindingElementInitializer(/*inParameter*/ false);
        return result;
    }

    private parseObjectBindingPattern(): Nodes.BindingPattern {
        const result = new Nodes.BindingPattern();
        this.parseExpected(TokenType.openBrace);
        result.elements = this.parseDelimitedList(Nodes.ParsingContext.ObjectBindingElements, this.parseObjectBindingElement);
        this.parseExpected(TokenType.closeBrace);
        return result;
    }

    private parseArrayBindingPattern(): Nodes.BindingPattern {
        const result = new Nodes.BindingPattern();
        this.parseExpected(TokenType.openBracket);
        result.elements = this.parseDelimitedList(Nodes.ParsingContext.ArrayBindingElements, this.parseArrayBindingElement);
        this.parseExpected(TokenType.closeBracket);
        return result;
    }

    private isIdentifierOrPattern() {
        return this.lexer.peek().type === TokenType.openBrace || this.lexer.peek().type === TokenType.openBracket || this.isIdentifier();
    }

    private parseBindingName(): Nodes.Identifier | Nodes.BindingPattern {
        if (this.lexer.peek().type === TokenType.openBracket) {
            return this.parseArrayBindingPattern();
        }
        if (this.lexer.peek().type === TokenType.openBrace) {
            return this.parseObjectBindingPattern();
        }
        return this.parseIdentifier();
    }

    private canFollowContextualOfKeyword(): boolean {
        return this.nextTokenIsIdentifier() && this.nextToken() === TokenType.closeParen;
    }

    private parseFunctionDeclaration(fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray): Nodes.FunctionDeclaration {
        const result = new Nodes.FunctionDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        this.parseExpected(TokenType.function);
        result.asteriskToken = this.parseOptionalToken(TokenType.asterisk);
        result.name = result.flags & Nodes.NodeFlags.Default ? this.parseOptionalIdentifier() : this.parseIdentifier();
        const isGenerator = !!result.asteriskToken;
        const isAsync = !!(result.flags & Nodes.NodeFlags.Async);
        this.fillSignature(TokenType.colon, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, result);
        result.body = this.parseFunctionBlockOrSemicolon(isGenerator, isAsync, Nodes.Diagnostics.or_expected);
        return this.parseJsDocComment(result);
    }

    private parseConstructorDeclaration(pos: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray): Nodes.ConstructorDeclaration {
        const result = new Nodes.ConstructorDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        this.parseExpected(TokenType.constructor);
        this.fillSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, result);
        result.body = this.parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false, Nodes.Diagnostics.or_expected);
        return this.parseJsDocComment(result);
    }

    private parseMethodDeclaration(fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray, asteriskToken: Nodes.Node, name: Nodes.PropertyName, questionToken: Nodes.Node, diagnosticMessage?: Nodes.DiagnosticMessage): Nodes.MethodDeclaration {
        const method = new Nodes.MethodDeclaration();
        method.decorators = decorators;
        this.setModifiers(method, modifiers);
        method.asteriskToken = asteriskToken;
        method.name = name;
        method.questionToken = questionToken;
        const isGenerator = !!asteriskToken;
        const isAsync = !!(method.flags & Nodes.NodeFlags.Async);
        this.fillSignature(TokenType.colon, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, method);
        method.body = this.parseFunctionBlockOrSemicolon(isGenerator, isAsync, diagnosticMessage);
        return this.parseJsDocComment(this.finishNode(method));
    }

    private parsePropertyDeclaration(fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray, name: Nodes.PropertyName, questionToken: Nodes.Node): Nodes.ClassElement {
        const property = new Nodes.PropertyDeclaration();
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
    }

    private parsePropertyOrMethodDeclaration(fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray): Nodes.ClassElement {
        const asteriskToken = this.parseOptionalToken(TokenType.asterisk);
        const name = this.parsePropertyName();

        // Nodes.Note: this is not legal as per the grammar.  Nodes.But we allow it in the parser and
        // report an error in the grammar checker.
        const questionToken = this.parseOptionalToken(TokenType.question);
        if (asteriskToken || this.lexer.peek().type === TokenType.openParen || this.lexer.peek().type === TokenType.lessThan) {
            return this.parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, name, questionToken, Nodes.Diagnostics.or_expected);
        }
        else {
            return this.parsePropertyDeclaration(fullStart, decorators, modifiers, name, questionToken);
        }
    }

    private parseNonParameterInitializer() {
        return this.parseInitializer(/*inParameter*/ false);
    }

    private parseAccessorDeclaration(kind: TokenType, fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray): Nodes.AccessorDeclaration {
        const result = new Nodes.AccessorDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        result.name = this.parsePropertyName();
        this.fillSignature(TokenType.colon, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, result);
        result.body = this.parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false);
        return result;
    }

    private isClassMemberModifier(idToken: TokenType) {
        switch (idToken) {
            case TokenType.public:
            case TokenType.private:
            case TokenType.protected:
            case TokenType.static:
            case TokenType.readonly:
                return true;
            default:
                return false;
        }
    }

    private isClassMemberStart(): boolean {
        let idToken: TokenType;

        if (this.lexer.peek().type === TokenType.at) {
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

        if (this.lexer.peek().type === TokenType.asterisk) {
            return true;
        }

        // Nodes.Try to get the first property-like this.lexer.peek().type following all modifiers.
        // Nodes.This can either be an identifier or the 'get' or 'set' keywords.
        if (this.isLiteralPropertyName()) {
            idToken = this.lexer.peek().type;
            this.nextToken();
        }

        // Nodes.Index signatures and computed properties are class members; we can parse.
        if (this.lexer.peek().type === TokenType.openBracket) {
            return true;
        }

        // Nodes.If we were able to get any potential identifier...
        if (idToken !== undefined) {
            // Nodes.If we have a non-keyword identifier, or if we have an accessor, then it's safe to parse.
            if (!isKeyword(idToken) || idToken === TokenType.set || idToken === TokenType.get) {
                return true;
            }

            // Nodes.If it *is* a keyword, but not an accessor, check a little farther along
            // to see if it should actually be parsed as a class member.
            switch (this.lexer.peek().type) {
                case TokenType.openParen:     // Nodes.Method declaration
                case TokenType.lessThan:      // Nodes.Generic Nodes.Method declaration
                case TokenType.colon:         // Nodes.Type Nodes.Annotation for declaration
                case TokenType.equals:        // Nodes.Initializer for declaration
                case TokenType.question:      // Nodes.Not valid, but permitted so that it gets caught later on.
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
    }

    private parseDecorators(): Nodes.NodeList<Nodes.Decorator> {
        let decorators: Nodes.NodeList<Nodes.Decorator>;
        while (true) {
            const decoratorStart = this.getNodePos();
            if (!this.parseOptional(TokenType.at)) {
                break;
            }

            if (!decorators) {
                decorators = <Nodes.NodeList<Nodes.Decorator>>[];
                decorators.pos = decoratorStart;
            }

            const decorator = new Nodes.Decorator();
            decorator.expression = this.doInDecoratorContext(this.parseLeftHandSideExpressionOrHigher);
            decorators.push(this.finishNode(decorator));
        }
        if (decorators) {
            decorators.end = this.getNodeEnd();
        }
        return decorators;
    }

    /*
     * Nodes.There are situations in which a modifier like 'const' will appear unexpectedly, such as on a class member.
     * Nodes.In those situations, if we are entirely sure that 'const' is not valid on its own (such as when Nodes.ASI takes effect
     * and turns it into a standalone declaration), then it is better to parse it and report an error later.
     *
     * Nodes.In such situations, 'permitInvalidConstAsModifier' should be set to true.
     */
    private parseModifiers(permitInvalidConstAsModifier?: boolean): Nodes.ModifiersArray {
        let flags: Nodes.NodeFlags = 0;
        let modifiers: Nodes.ModifiersArray;
        while (true) {
            const modifierStart = this.lexer.getStartPos();
            const modifierKind = this.lexer.peek().type;

            if (this.lexer.peek().type === TokenType.const && permitInvalidConstAsModifier) {
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
                modifiers = <Nodes.ModifiersArray>[];
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
    }

    private parseModifiersForArrowFunction(): Nodes.ModifiersArray {
        let flags = 0;
        let modifiers: Nodes.ModifiersArray;
        if (this.lexer.peek().type === TokenType.async) {
            const modifierStart = this.lexer.getStartPos();
            const modifierKind = this.lexer.peek().type;
            this.nextToken();
            modifiers = <Nodes.ModifiersArray>[];
            modifiers.pos = modifierStart;
            flags |= modifierToFlag(modifierKind);
            modifiers.push(this.finishNode(this.createNode(modifierKind, modifierStart)));
            modifiers.flags = flags;
            modifiers.end = this.lexer.getStartPos();
        }

        return modifiers;
    }

    private parseClassElement(): Nodes.ClassElement {
        if (this.lexer.peek().type === TokenType.semicolon) {
            const this.result = new Nodes.SemicolonClassElement();
            this.nextToken();
            return this.finishNode(this.result);
        }

        const fullStart = this.getNodePos();
        const decorators = this.parseDecorators();
        const modifiers = this.parseModifiers(/*permitInvalidConstAsModifier*/ true);

        const accessor = this.tryParseAccessorDeclaration(fullStart, decorators, modifiers);
        if (accessor) {
            return accessor;
        }

        if (this.lexer.peek().type === TokenType.constructor) {
            return this.parseConstructorDeclaration(fullStart, decorators, modifiers);
        }

        if (this.isIndexSignature()) {
            return this.parseIndexSignatureDeclaration(fullStart, decorators, modifiers);
        }

        // Nodes.It is very important that we check this *after* checking indexers because
        // the [ this.lexer.peek().type can start an index signature or a computed property name
        if (tokenIsIdentifierOrKeyword(this.lexer.peek().type) ||
            this.lexer.peek().type === TokenType.StringLiteral ||
            this.lexer.peek().type === TokenType.NumericLiteral ||
            this.lexer.peek().type === TokenType.asterisk ||
            this.lexer.peek().type === TokenType.openBracket) {

            return this.parsePropertyOrMethodDeclaration(fullStart, decorators, modifiers);
        }

        if (decorators || modifiers) {
            // treat this as a property declaration with a missing name.
            const name = <Nodes.Identifier>this.createMissingNode(TokenType.Identifier, /*reportAtCurrentPosition*/ true, Nodes.Diagnostics.Declaration_expected);
            return this.parsePropertyDeclaration(fullStart, decorators, modifiers, name, /*questionToken*/ undefined);
        }

        // 'this.isClassMemberStart' should have hinted not to attempt parsing.
        Nodes.Debug.fail("Nodes.Should not have attempted to parse class member declaration.");
    }

    private parseClassExpression(): Nodes.ClassExpression {
        return <Nodes.ClassExpression>this.parseClassDeclarationOrExpression(
                /*fullStart*/ this.lexer.getStartPos(),
                /*decorators*/ undefined,
                /*modifiers*/ undefined,
            TokenType.ClassExpression);
    }

    private parseClassDeclaration(fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray): Nodes.ClassDeclaration {
        return <Nodes.ClassDeclaration>this.parseClassDeclarationOrExpression(fullStart, decorators, modifiers, TokenType.ClassDeclaration);
    }

    private parseClassDeclarationOrExpression(fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray, kind: TokenType): Nodes.ClassLikeDeclaration {
        const result = new Nodes.ClassLikeDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        this.parseExpected(TokenType.class);
        result.name = this.parseNameOfClassDeclarationOrExpression();
        result.typeParameters = this.parseTypeParameters();
        result.heritageClauses = this.parseHeritageClauses(/*isClassHeritageClause*/ true);

        if (this.parseExpected(TokenType.openBrace)) {
            // Nodes.ClassTail[Nodes.Yield,Nodes.Await] : (Nodes.Modified) Nodes.See 14.5
            //      Nodes.ClassHeritage[?Nodes.Yield,?Nodes.Await]opt { Nodes.ClassBody[?Nodes.Yield,?Nodes.Await]opt }
            result.members = this.parseClassMembers();
            this.parseExpected(TokenType.closeBrace);
        }
        else {
            result.members = this.createMissingList<Nodes.ClassElement>();
        }

        return result;
    }

    private parseNameOfClassDeclarationOrExpression(): Nodes.Identifier {
        // implements is a future reserved word so
        // 'class implements' might mean either
        // - class expression with omitted name, 'implements' starts heritage clause
        // - class with name 'implements'
        // 'this.isImplementsClause' helps to disambiguate between these two cases
        return this.isIdentifier() && !this.isImplementsClause()
            ? this.parseIdentifier()
            : undefined;
    }

    private isImplementsClause() {
        return this.lexer.peek().type === TokenType.implements && this.lookAhead(this.nextTokenIsIdentifierOrKeyword);
    }

    private parseHeritageClauses(isClassHeritageClause: boolean): Nodes.NodeList<Nodes.HeritageClause> {
        // Nodes.ClassTail[Nodes.Yield,Nodes.Await] : (Nodes.Modified) Nodes.See 14.5
        //      Nodes.ClassHeritage[?Nodes.Yield,?Nodes.Await]opt { Nodes.ClassBody[?Nodes.Yield,?Nodes.Await]opt }

        if (this.isHeritageClause()) {
            return this.parseList(Nodes.ParsingContext.HeritageClauses, this.parseHeritageClause);
        }

        return undefined;
    }

    private parseHeritageClause() {
        if (this.lexer.peek().type === TokenType.extends || this.lexer.peek().type === TokenType.implements) {
            const result = new Nodes.HeritageClause();
            result.token = this.lexer.peek().type;
            this.nextToken();
            result.types = this.parseDelimitedList(Nodes.ParsingContext.HeritageClauseElement, this.parseExpressionWithTypeArguments);
            return result;
        }

        return undefined;
    }

    private parseExpressionWithTypeArguments(): Nodes.ExpressionWithTypeArguments {
        const result = new Nodes.ExpressionWithTypeArguments();
        result.expression = this.parseLeftHandSideExpressionOrHigher();
        if (this.lexer.peek().type === TokenType.lessThan) {
            result.typeArguments = this.parseBracketedList(Nodes.ParsingContext.TypeArguments, this.parseType, TokenType.lessThan, TokenType.greaterThan);
        }

        return result;
    }

    private isHeritageClause(): boolean {
        return this.lexer.peek().type === TokenType.extends || this.lexer.peek().type === TokenType.implements;
    }

    private parseClassMembers() {
        return this.parseList(Nodes.ParsingContext.ClassMembers, this.parseClassElement);
    }

    private parseInterfaceDeclaration(fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray): Nodes.InterfaceDeclaration {
        const result = new Nodes.InterfaceDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        this.parseExpected(TokenType.interface);
        result.name = this.parseIdentifier();
        result.typeParameters = this.parseTypeParameters();
        result.heritageClauses = this.parseHeritageClauses(/*isClassHeritageClause*/ false);
        result.members = this.parseObjectTypeMembers();
        return result;
    }

    private parseTypeAliasDeclaration(fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray): Nodes.TypeAliasDeclaration {
        const result = new Nodes.TypeAliasDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        this.parseExpected(TokenType.type);
        result.name = this.parseIdentifier();
        result.typeParameters = this.parseTypeParameters();
        this.parseExpected(TokenType.equals);
        result.type = this.parseType();
        this.expectSemicolon();
        return result;
    }

    // Nodes.In an ambient declaration, the grammar only allows integer literals as initializers.
    // Nodes.In a non-ambient declaration, the grammar allows uninitialized members only in a
    // Nodes.ConstantEnumMemberSection, which starts at the beginning of an this.enum declaration
    // or any time an integer literal initializer is encountered.
    private parseEnumMember(): Nodes.EnumMember {
        const result = new Nodes.EnumMember());
        result.name = this.parsePropertyName();
        result.initializer = this.allowInAnd(this.parseNonParameterInitializer);
        return result;
    }

    private parseEnumDeclaration(fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray): Nodes.EnumDeclaration {
        const result = new Nodes.EnumDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        this.parseExpected(TokenType.enum);
        result.name = this.parseIdentifier();
        if (this.parseExpected(TokenType.openBrace)) {
            result.members = this.parseDelimitedList(Nodes.ParsingContext.EnumMembers, this.parseEnumMember);
            this.parseExpected(TokenType.closeBrace);
        }
        else {
            result.members = this.createMissingList<Nodes.EnumMember>();
        }
        return result;
    }

    private parseModuleBlock(): Nodes.ModuleBlock {
        const result = new Nodes.ModuleBlock());
        if (this.parseExpected(TokenType.openBrace)) {
            result.statements = this.parseList(Nodes.ParsingContext.BlockStatements, this.parseStatement);
            this.parseExpected(TokenType.closeBrace);
        }
        else {
            result.statements = this.createMissingList<Nodes.Statement>();
        }
        return result;
    }

    private parseModuleOrNamespaceDeclaration(fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray, flags: Nodes.NodeFlags): Nodes.ModuleDeclaration {
        const result = new Nodes.ModuleDeclaration();
        // Nodes.If we are parsing a dotted namespace name, we want to
        // propagate the 'Nodes.Namespace' flag across the names if set.
        const namespaceFlag = flags & Nodes.NodeFlags.Namespace;
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        result.flags |= flags;
        result.name = this.parseIdentifier();
        result.body = this.parseOptional(TokenType.dot)
            ? this.parseModuleOrNamespaceDeclaration(this.getNodePos(), /*decorators*/ undefined, /*modifiers*/ undefined, Nodes.NodeFlags.Export | namespaceFlag)
            : this.parseModuleBlock();
        return result;
    }

    private parseAmbientExternalModuleDeclaration(fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray): Nodes.ModuleDeclaration {
        const result = new Nodes.ModuleDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        if (this.lexer.peek().type === TokenType.global) {
            // parse 'global' as name of global scope augmentation
            result.name = this.parseIdentifier();
            result.flags |= Nodes.NodeFlags.GlobalAugmentation;
        }
        else {
            result.name = this.parseLiteralNode(/*internName*/ true);
        }

        if (this.lexer.peek().type === TokenType.openBrace) {
            result.body = this.parseModuleBlock();
        }
        else {
            this.expectSemicolon();
        }

        return result;
    }

    private parseModuleDeclaration(fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray): Nodes.ModuleDeclaration {
        let flags = modifiers ? modifiers.flags : 0;
        if (this.lexer.peek().type === TokenType.global) {
            // global augmentation
            return this.parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
        }
        else if (this.parseOptional(TokenType.namespace)) {
            flags |= Nodes.NodeFlags.Namespace;
        }
        else {
            this.parseExpected(TokenType.module);
            if (this.lexer.peek().type === TokenType.StringLiteral) {
                return this.parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
            }
        }
        return this.parseModuleOrNamespaceDeclaration(fullStart, decorators, modifiers, flags);
    }

    private isExternalModuleReference() {
        return this.lexer.peek().type === TokenType.require &&
            this.lookAhead(this.nextTokenIsOpenParen);
    }

    private nextTokenIsOpenParen() {
        return this.nextToken() === TokenType.openParen;
    }

    private nextTokenIsSlash() {
        return this.nextToken() === TokenType.slash;
    }

    private parseNamespaceExportDeclaration(fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray): Nodes.NamespaceExportDeclaration {
        const exportDeclaration = new Nodes.NamespaceExportDeclaration();
        exportDeclaration.decorators = decorators;
        exportDeclaration.modifiers = modifiers;
        this.parseExpected(TokenType.as);
        this.parseExpected(TokenType.namespace);

        exportDeclaration.name = this.parseIdentifier();

        this.parseExpected(TokenType.semicolon);

        return this.finishNode(exportDeclaration);
    }

    private parseImportDeclarationOrImportEqualsDeclaration(fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray): Nodes.ImportEqualsDeclaration | Nodes.ImportDeclaration {
        this.parseExpected(TokenType.import);
        const afterImportPos = this.lexer.getStartPos();

        let identifier: Nodes.Identifier;
        if (this.isIdentifier()) {
            identifier = this.parseIdentifier();
            if (this.lexer.peek().type !== TokenType.comma && this.lexer.peek().type !== TokenType.from) {
                // Nodes.ImportEquals declaration of type:
                // import x = require("mod"); or
                // import x = M.x;
                const importEqualsDeclaration = new Nodes.ImportEqualsDeclaration();
                importEqualsDeclaration.decorators = decorators;
                this.setModifiers(importEqualsDeclaration, modifiers);
                importEqualsDeclaration.name = identifier;
                this.parseExpected(TokenType.equals);
                importEqualsDeclaration.moduleReference = this.parseModuleReference();
                this.expectSemicolon();
                return this.finishNode(importEqualsDeclaration);
            }
        }

        // Nodes.Import statement
        const importDeclaration = new Nodes.ImportDeclaration();
        importDeclaration.decorators = decorators;
        this.setModifiers(importDeclaration, modifiers);

        // Nodes.ImportDeclaration:
        //  import Nodes.ImportClause from Nodes.ModuleSpecifier ;
        //  import Nodes.ModuleSpecifier;
        if (identifier || // import id
            this.lexer.peek().type === TokenType.asterisk || // import *
            this.lexer.peek().type === TokenType.openBrace) { // import {
            importDeclaration.importClause = this.parseImportClause(identifier, afterImportPos);
            this.parseExpected(TokenType.from);
        }

        importDeclaration.moduleSpecifier = this.parseModuleSpecifier();
        this.expectSemicolon();
        return this.finishNode(importDeclaration);
    }

    private parseImportClause(identifier: Nodes.Identifier, fullStart: number) {
        // Nodes.ImportClause:
        //  Nodes.ImportedDefaultBinding
        //  Nodes.NameSpaceImport
        //  Nodes.NamedImports
        //  Nodes.ImportedDefaultBinding, Nodes.NameSpaceImport
        //  Nodes.ImportedDefaultBinding, Nodes.NamedImports

        const importClause = new Nodes.ImportClause();
        if (identifier) {
            // Nodes.ImportedDefaultBinding:
            //  Nodes.ImportedBinding
            importClause.name = identifier;
        }

        // Nodes.If there was no default import or if there is comma this.lexer.peek().type after default import
        // parse namespace or named imports
        if (!importClause.name ||
            this.parseOptional(TokenType.comma)) {
            importClause.namedBindings = this.lexer.peek().type === TokenType.asterisk ? this.parseNamespaceImport() : this.parseNamedImportsOrExports(TokenType.NamedImports);
        }

        return this.finishNode(importClause);
    }

    private parseModuleReference() {
        return this.isExternalModuleReference()
            ? this.parseExternalModuleReference()
            : this.parseEntityName(/*allowReservedWords*/ false);
    }

    private parseExternalModuleReference() {
        const result = new Nodes.ExternalModuleReference();
        this.parseExpected(TokenType.require);
        this.parseExpected(TokenType.openParen);
        result.expression = this.parseModuleSpecifier();
        this.parseExpected(TokenType.closeParen);
        return result;
    }

    private parseModuleSpecifier(): Nodes.Expression {
        if (this.lexer.peek().type === TokenType.StringLiteral) {
            const this.result = this.parseLiteralNode();
            this.internIdentifier((<Nodes.LiteralExpression>this.result).text);
            return this.result;
        }
        else {
            // Nodes.We allow arbitrary expressions here, even though the grammar only allows string
            // literals.  Nodes.We check to ensure that it is only a string literal later in the grammar
            // check pass.
            return this.parseExpression();
        }
    }

    private parseNamespaceImport(): Nodes.NamespaceImport {
        // Nodes.NameSpaceImport:
        //  * as Nodes.ImportedBinding
        const namespaceImport = new Nodes.NamespaceImport();
        this.parseExpected(TokenType.asterisk);
        this.parseExpected(TokenType.as);
        namespaceImport.name = this.parseIdentifier();
        return this.finishNode(namespaceImport);
    }

    private parseNamedImportsOrExports(kind: TokenType): Nodes.NamedImportsOrExports {
        const result = new Nodes.NamedImports();

        // Nodes.NamedImports:
        //  { }
        //  { Nodes.ImportsList }
        //  { Nodes.ImportsList, }

        // Nodes.ImportsList:
        //  Nodes.ImportSpecifier
        //  Nodes.ImportsList, Nodes.ImportSpecifier
        result.elements = this.parseBracketedList(Nodes.ParsingContext.ImportOrExportSpecifiers,
            kind === TokenType.NamedImports ? this.parseImportSpecifier : this.parseExportSpecifier,
            TokenType.openBrace, TokenType.closeBrace);
        return result;
    }

    private parseExportSpecifier() {
        return this.parseImportOrExportSpecifier(TokenType.ExportSpecifier);
    }

    private parseImportSpecifier() {
        return this.parseImportOrExportSpecifier(TokenType.ImportSpecifier);
    }

    private parseImportOrExportSpecifier(kind: TokenType): Nodes.ImportOrExportSpecifier {
        const result = new Nodes.ImportSpecifier();
        // Nodes.ImportSpecifier:
        //   Nodes.BindingIdentifier
        //   Nodes.IdentifierName as Nodes.BindingIdentifier
        // Nodes.ExportSpecifier:
        //   Nodes.IdentifierName
        //   Nodes.IdentifierName as Nodes.IdentifierName
        let checkIdentifierIsKeyword = isKeyword(this.lexer.peek().type) && !this.isIdentifier();
        let checkIdentifierStart = this.lexer.getTokenPos();
        let checkIdentifierEnd = this.lexer.getTextPos();
        const identifierName = this.parseIdentifierName();
        if (this.lexer.peek().type === TokenType.as) {
            result.propertyName = identifierName;
            this.parseExpected(TokenType.as);
            checkIdentifierIsKeyword = isKeyword(this.lexer.peek().type) && !this.isIdentifier();
            checkIdentifierStart = this.lexer.getTokenPos();
            checkIdentifierEnd = this.lexer.getTextPos();
            result.name = this.parseIdentifierName();
        }
        else {
            result.name = identifierName;
        }
        if (kind === TokenType.ImportSpecifier && checkIdentifierIsKeyword) {
            // Nodes.Report error identifier expected
            this.parseErrorAtPosition(checkIdentifierStart, checkIdentifierEnd - checkIdentifierStart, Nodes.Diagnostics.Identifier_expected);
        }
        return result;
    }

    private parseExportDeclaration(fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray): Nodes.ExportDeclaration {
        const result = new Nodes.ExportDeclaration();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        if (this.parseOptional(TokenType.asterisk)) {
            this.parseExpected(TokenType.from);
            result.moduleSpecifier = this.parseModuleSpecifier();
        }
        else {
            result.exportClause = this.parseNamedImportsOrExports(TokenType.NamedExports);

            // Nodes.It is not uncommon to accidentally omit the 'from' keyword. Nodes.Additionally, in editing scenarios,
            // the 'from' keyword can be parsed as a named export when the export clause is unterminated (i.e. `export { from "moduleName";`)
            // Nodes.If we don't have a 'from' keyword, see if we have a string literal such that Nodes.ASI won't take effect.
            if (this.lexer.peek().type === TokenType.from || (this.lexer.peek().type === TokenType.StringLiteral && !this.lexer.peek().hasLineBreakBeforeStar)) {
                this.parseExpected(TokenType.from);
                result.moduleSpecifier = this.parseModuleSpecifier();
            }
        }
        this.expectSemicolon();
        return result;
    }

    private parseExportAssignment(fullStart: number, decorators: Nodes.NodeList<Nodes.Decorator>, modifiers: Nodes.ModifiersArray): Nodes.ExportAssignment {
        const result = new Nodes.ExportAssignment();
        result.decorators = decorators;
        this.setModifiers(result, modifiers);
        if (this.parseOptional(TokenType.equals)) {
            result.isExportEquals = true;
        }
        else {
            this.parseExpected(TokenType.default);
        }
        result.expression = this.parseAssignmentExpressionOrHigher();
        this.expectSemicolon();
        return result;
    }

    private processReferenceComments(sourceFile: Nodes.SourceFile): void {
        const triviaScanner = createScanner(this.sourceFile.languageVersion, /*skipTrivia*/false, Nodes.LanguageVariant.Standard, this.sourceText);
        const referencedFiles: Nodes.FileReference[] = [];
        const typeReferenceDirectives: Nodes.FileReference[] = [];
        const amdDependencies: { path: string; name: string }[] = [];
        let amdModuleName: string;

        // Nodes.Keep scanning all the leading trivia in the file until we get to something that
        // isn't trivia.  Nodes.Any single line comment will be analyzed to see if it is a
        // reference comment.
        while (true) {
            const kind = triviaScanner.scan();
            if (kind !== TokenType.singleLineComment) {
                if (isTrivia(kind)) {
                    continue;
                }
                else {
                    break;
                }
            }

            const range = { pos: triviaScanner.getTokenPos(), end: triviaScanner.getTextPos(), kind: triviaScanner.getToken() };

            const comment = this.sourceText.substring(range.pos, range.end);
            const referencePathMatchResult = getFileReferenceFromReferencePath(comment, range);
            if (referencePathMatchResult) {
                const fileReference = referencePathMatchResult.fileReference;
                this.sourceFile.hasNoDefaultLib = referencePathMatchResult.isNoDefaultLib;
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
                    this.parseDiagnostics.push(createFileDiagnostic(this.sourceFile, range.pos, range.end - range.pos, diagnosticMessage));
                }
            }
            else {
                const amdModuleNameRegEx = /^\/\/\/\s*<amd-module\s+name\s*=\s*('|")(.+?)\1/gim;
                const amdModuleNameMatchResult = amdModuleNameRegEx.exec(comment);
                if (amdModuleNameMatchResult) {
                    if (amdModuleName) {
                        this.parseDiagnostics.push(createFileDiagnostic(this.sourceFile, range.pos, range.end - range.pos, Nodes.Diagnostics.An_AMD_module_cannot_have_multiple_name_assignments));
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

        this.sourceFile.referencedFiles = referencedFiles;
        this.sourceFile.typeReferenceDirectives = typeReferenceDirectives;
        this.sourceFile.amdDependencies = amdDependencies;
        this.sourceFile.moduleName = amdModuleName;
    }

    private setExternalModuleIndicator(sourceFile: Nodes.SourceFile) {
        this.sourceFile.externalModuleIndicator = forEach(this.sourceFile.statements, result =>
            result.flags & Nodes.NodeFlags.Export
                || result.kind === TokenType.ImportEqualsDeclaration && (<Nodes.ImportEqualsDeclaration>result).moduleReference.kind === TokenType.ExternalModuleReference
                || result.kind === TokenType.ImportDeclaration
                || result.kind === TokenType.ExportAssignment
                || result.kind === TokenType.ExportDeclaration
                ? result
                : undefined);
    }

    // #endregion

}
