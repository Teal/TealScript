/**
 * @fileOverview 语法解析器
 */

import {TokenType, tokenToString, isNonReservedWord, isUnaryOperator, isExpressionStart, getPrecedence, isStatementStart} from '../ast/tokenType';
import * as nodes from '../ast/nodes';
import {CharCode} from './charCode';
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

    ///**
    // * 存储解析的内部标记。
    // */
    //private flags: ParseFlags = 0;

    /**
     * 读取下一个标记。如果下一个标记不是指定的类型则输出一条错误。
     * @param token 期待的标记。
     * @returns 返回读取的标记。
     */
    private expectToken(token: TokenType) {
        if (this.lexer.peek().type === token) {
            return this.lexer.read();
        }

        this.error(this.lexer.peek(), token === TokenType.identifier ? isKeyword(this.lexer.peek().type) ? "应输入标识符；“{0}”是关键字。" : "应输入标识符。" : "应输入“{0}”。", tokenToString(token));
        return this.lexer.current;
    }

    ///**
    // * 解析一个逗号隔开的节点列表(<..., ...>。
    // * @param nodes 要解析的节点列表。
    // */
    //private parseNodeList<T extends Node>(start: TokenType, parseElement: () => T, end: TokenType) {
    //    const result = new nodes.NodeList<T>();

    //    return result;
    //}

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
                return options.autoInsertSemicolon === false ?
                    this.expectToken(TokenType.semicolon).end :
                    this.lexer.current.end;
            default:
                // 根据标准：只有出现换行时才允许自动插入分号。
                // 当启用 smartSemicolonInsertion 时，将允许在未换行时自动插入分号。
                return options.autoInsertSemicolon === false || (options.smartSemicolonInsertion === false && !this.lexer.peek().onNewLine) ?
                    this.expectToken(TokenType.semicolon).end :
                    this.lexer.current.end;
        }
    }

    /**
     * 读取一个标识符，如果是关键字则自动转换。
     * @return 返回标识符节点。
     */
    private expectIdentifier(): nodes.Identifier {

    }

    // #endregion

    // #region 节点

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

        result.statements = new nodes.NodeList<nodes.Statement>();
        while (this.lexer.peek().type !== TokenType.endOfFile) {
            result.statements.push(this.parseStatement());
        }
        result.comments = this.lexer.comments;
        result.end = this.lexer.peek().start;
        return result;
    }

    ///**
    // * 当解析到一个全局注释时执行。
    // * @param multiLineComment 标记是否是多行注释。
    // * @param start 注释的开始位置。
    // * @param end 注释的结束位置。
    // */
    //private parseGlobalComment(multiLineComment: boolean, start: number, end: number) {



    //}

    ///**
    // * 当解析到一个注释时执行。
    // * @param multiLineComment 标记是否是多行注释。
    // * @param start 注释的开始位置。
    // * @param end 注释的结束位置。
    // */
    //private parseComment(multiLineComment: boolean, start: number, end: number) {

    //}

    /**
     * 解析 \<reference /> 注释。
     */
    private parseReferenceComment() {

        //const referencedFiles: FileReference[] = [];
        //const typeReferenceDirectives: FileReference[] = [];
        //const amdDependencies: { path: string; name: string }[] = [];
        //let amdModuleName: string;

        //// Keep scanning all the leading trivia in the file until we get to something that
        //// isn't trivia.  Any single line comment will be analyzed to see if it is a
        //// reference comment.
        //while (true) {

        //    const range = { pos: triviaScanner.getTokenPos(), end: triviaScanner.getTextPos(), kind: triviaScanner.getToken() };

        //    const comment = sourceText.substring(range.pos, range.end);
        //    const referencePathMatchResult = getFileReferenceFromReferencePath(comment, range);
        //    if (referencePathMatchResult) {
        //        const fileReference = referencePathMatchResult.fileReference;
        //        sourceFile.hasNoDefaultLib = referencePathMatchResult.isNoDefaultLib;
        //        const diagnosticMessage = referencePathMatchResult.diagnosticMessage;
        //        if (fileReference) {
        //            if (referencePathMatchResult.isTypeReferenceDirective) {
        //                typeReferenceDirectives.push(fileReference);
        //            }
        //            else {
        //                referencedFiles.push(fileReference);
        //            }
        //        }
        //        if (diagnosticMessage) {
        //            parseDiagnostics.push(createFileDiagnostic(sourceFile, range.pos, range.end - range.pos, diagnosticMessage));
        //        }
        //    }
        //    else {
        //        const amdModuleNameRegEx = /^\/\/\/\s*<amd-module\s+name\s*=\s*('|")(.+?)\1/gim;
        //        const amdModuleNameMatchResult = amdModuleNameRegEx.exec(comment);
        //        if (amdModuleNameMatchResult) {
        //            if (amdModuleName) {
        //                parseDiagnostics.push(createFileDiagnostic(sourceFile, range.pos, range.end - range.pos, Diagnostics.An_AMD_module_cannot_have_multiple_name_assignments));
        //            }
        //            amdModuleName = amdModuleNameMatchResult[2];
        //        }

        //        const amdDependencyRegEx = /^\/\/\/\s*<amd-dependency\s/gim;
        //        const pathRegex = /\spath\s*=\s*('|")(.+?)\1/gim;
        //        const nameRegex = /\sname\s*=\s*('|")(.+?)\1/gim;
        //        const amdDependencyMatchResult = amdDependencyRegEx.exec(comment);
        //        if (amdDependencyMatchResult) {
        //            const pathMatchResult = pathRegex.exec(comment);
        //            const nameMatchResult = nameRegex.exec(comment);
        //            if (pathMatchResult) {
        //                const amdDependency = { path: pathMatchResult[2], name: nameMatchResult ? nameMatchResult[2] : undefined };
        //                amdDependencies.push(amdDependency);
        //            }
        //        }
        //    }
        //}

        //sourceFile.referencedFiles = referencedFiles;
        //sourceFile.typeReferenceDirectives = typeReferenceDirectives;
        //sourceFile.amdDependencies = amdDependencies;
        //sourceFile.moduleName = amdModuleName;
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
                return this.lexer.peek().type === TokenType.colon ?
                    this.parseLabeledStatement(identifier) :
                    this.parseRestExpressionStatement(identifier);

            case TokenType.openBrace:
                return this.parseBlockStatement();
            case TokenType.var:
                return this.parseVariableStatement();
            case TokenType.let:
            case TokenType.const:
                if (this.isVariableStatement()) {
                    return this.parseVariableStatement();
                }
                break;
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
     * 解析一个语句块({...})。
     */
    private parseBlockStatement() {
        console.assert(this.lexer.peek().type === TokenType.openBrace);
        const result = new nodes.BlockStatement();
        result.start = this.lexer.read().start;
        result.statements = new nodes.NodeList<nodes.Statement>();
        while (true) {
            switch (this.lexer.peek().type) {
                case TokenType.closeBrace:
                    result.end = this.lexer.read().end;
                    return result;
                case TokenType.endOfFile:
                    result.end = this.expectToken(TokenType.closeBrace).end;
                    return result;
            }
            result.statements.push(this.parseStatement());
        }
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
        result.end = this.expectSemicolon();

        // todo: JsDoc
        return result;
    }

    /**
     * 解析一个变量声明列表(xx = 1, ...)。
     */
    private parseVariableDeclarationList() {
        const result = new nodes.NodeList<nodes.VariableDeclaration>();
        result.seperators = [];
        while (true) {
            result.push(this.parseVariableDeclaration());
            if (this.lexer.peek().type === TokenType.comma) {
                result.seperators.push(this.lexer.read().start);
                continue;
            }
            break;
        };
        return result;
    }

    /**
     * 解析一个变量声明(x = 1、[x] = [1]、{a: x} = {a: 1})。
     */
    private parseVariableDeclaration() {
        const result = new nodes.VariableDeclaration();
        result.name = this.parseBindingName();
        if (this.lexer.peek().type === TokenType.colon) {
            result.colonToken = this.lexer.read().start;
            result.type = this.parseTypeExpression();
        }
        if (this.lexer.peek().type === TokenType.equals) {
            result.equalToken = this.lexer.read().start;
            result.initializer = this.parseExpression(ParseFlags.disallowComma);
        }
        return result;
    }

    /**
     * 解析一个绑定名称(xx, [xx], {x:x})。
     */
    private parseBindingName() {
        switch (this.lexer.peek().type) {
            case TokenType.identifier:
                return this.parseIdentifier();
            case TokenType.openBracket:
                return this.parseArrayBindingPattern();
            case TokenType.openBrace:
                return this.parseObjectBindingPattern();
            default:
                return this.expectIdentifier();
        }
    }

    /**
     * 解析一个数组绑定模式项([xx])。
     */
    private parseArrayBindingPattern() {
        console.assert(this.lexer.peek().type === TokenType.openBracket);
        const result = new nodes.ArrayBindingPattern();
        result.start = this.lexer.read().start;
        result.elements = new nodes.NodeList<nodes.ArrayBindingElement>();
        result.elements.seperatorTokens = [];
        while (true) {
            switch (this.lexer.peek().type) {
                case TokenType.comma:
                    result.elements.push(nodes.ArrayBindingElement.empty);
                    result.elements.seperatorTokens.push(this.lexer.read().start);
                    continue;
                case TokenType.closeBracket:
                    result.end = this.lexer.read().end;
                    return result;
                case TokenType.endOfFile:
                    result.end = this.expectToken(TokenType.closeBracket).end;
                    return result;
            }

            const element = new nodes.ArrayBindingElement();
            element.start = this.lexer.current.start;
            if (this.lexer.peek().type === TokenType.dotDotDot) {
                this.lexer.read();
            }
            element.name = this.parseBindingName();
            if (this.lexer.peek().type === TokenType.equals) {
                element.equal = this.lexer.read().start;
                element.initializer = this.parseExpression(ParseFlags.disallowComma);
            }
            result.elements.push(element);
        }
    }

    /**
     * 解析一个对象绑定模式项({xx: xx})。
     */
    private parseObjectBindingPattern() {
        console.assert(this.lexer.peek().type === TokenType.openBrace);
        const result = new nodes.ObjectBindingPattern();
        result.start = this.lexer.read().start;
        result.elements = new nodes.NodeList<nodes.ObjectBindingElement>();
        result.elements.seperatorTokens = [];
        while (true) {
            switch (this.lexer.peek().type) {
                case TokenType.closeBrace:
                    result.end = this.lexer.read().end;
                    return result;
                case TokenType.endOfFile:
                    result.end = this.expectToken(TokenType.closeBrace).end;
                    return result;
            }

            const element = new nodes.ObjectBindingElement();
            element.property = this.parsePropertyName();
            if (this.lexer.peek().type === TokenType.colon) {
                element.colonToken = this.lexer.read().start;
                element.name = this.parseBindingName();
            }
            if (this.lexer.peek().type === TokenType.equals) {
                element.equalToken = this.lexer.read().start;
                element.initializer = this.parseExpression(ParseFlags.disallowComma);
            }
            if (this.lexer.peek().type === TokenType.comma) {
                result.elements.seperatorTokens.push(this.lexer.read().start);
            }
            result.elements.push(element);
        }
    }

    /**
     * 解析一个属性名称(xx、"xx"、[xx])。
     */
    private parsePropertyName(): nodes.PropertyName {
        switch (this.lexer.peek().type) {
            case TokenType.identifier:
                return this.parseIdentifier();
            case TokenType.stringLiteral:
                return this.parseStringLiteral();
            case TokenType.numericLiteral:
                return this.parseNumericLiteral();
            case TokenType.openBracket:
                return this.parseComputedPropertyName();
            default:
                return this.expectIdentifier();
        }
    }

    /**
     * 解析一个已计算的属性名。
     */
    private parseComputedPropertyName() {
        console.assert(this.lexer.peek().type === TokenType.openBracket);
        const result = new nodes.ComputedPropertyName();
        result.start = this.lexer.read().start;
        result.body = this.parseExpression(ParseFlags.allowIn);
        result.end = this.expectToken(TokenType.closeBracket).end;
        return result;
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
        result.colonToken = this.lexer.read().type;
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
        result.end = this.expectSemicolon();
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
        result.end = this.expectSemicolon();
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
        if (this.lexer.peek().type === TokenType.else) {
            result.elseToken = this.lexer.read().start;
            result.else = this.parseEmbeddedStatement();
        }
        return result;
    }

    /**
     * 解析条件表达式。
     * @param result 存放结果的语句。
     */
    private parseCondition(result: nodes.IfStatement | nodes.SwitchStatement | nodes.WhileStatement | nodes.DoWhileStatement) {
        if (this.lexer.peek().type === TokenType.openParen) {
            result.openParanToken = this.lexer.read().type;
            result.condition = this.parseExpression(ParseFlags.allowIn);
            result.closeParanToken = this.expectToken(TokenType.closeParen);
        } else {
            if (options.autoInsertParenthese === false) {
                this.expectToken(TokenType.openParen);
            }
            result.condition = this.parseExpression(ParseFlags.allowIn);
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
        if (options.autoInsertSwitchCondition === false || this.lexer.peek().type !== TokenType.openBrace) {
            this.parseCondition(result);
        }
        result.cases = new nodes.NodeList<nodes.CaseClause>();
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

            const caseCaluse = new nodes.CaseClause();
            caseCaluse.start = this.lexer.read().start;
            if (this.lexer.current.type === TokenType.case) {
                if (options.allowCaseElse !== false && this.lexer.peek().type === TokenType.else) {
                    caseCaluse.elseToken = this.lexer.read().start;
                } else {
                    caseCaluse.label = this.parseExpression(ParseFlags.allowIn);
                }
            }
            caseCaluse.colonToken = this.expectToken(TokenType.colon).start;
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
        const openParan = this.lexer.peek().type === TokenType.openParen ?
            this.lexer.read().start :
            undefined;
        if (openParan == undefined && options.autoInsertParenthese === false) {
            this.expectToken(TokenType.openParen);
        }

        const initializer = this.lexer.peek().type === TokenType.semicolon ? undefined : this.isVariableStatement() ? this.parseVariableStatement() : this.parseExpression(ParseFlags.disallowIn);

        let result: nodes.ForStatement | nodes.ForInStatement | nodes.ForOfStatement | nodes.ForToStatement;

        // FIXME: 特殊处理：for (let of X) 的场景。
        let type = this.lexer.peek().type;
        switch (type) {
            case TokenType.semicolon:
            case TokenType.in:
                break;
            case TokenType.of:
                if (options.allowForOf === false) {
                    type = TokenType.semicolon;
                }
                break;
            case TokenType.to:
                if (options.allowForTo === false) {
                    type = TokenType.semicolon;
                }
                break;
            default:
                type = TokenType.semicolon;
                break;
        }

        switch (type) {
            case TokenType.semicolon:
                result = new nodes.ForStatement();
                (<nodes.ForStatement>result).firstSemicolonToken = this.expectToken(TokenType.semicolon).start;
                if (this.lexer.peek().type !== TokenType.semicolon) {
                    result.condition = this.parseExpression(ParseFlags.allowIn);
                }
                (<nodes.ForStatement>result).secondSemicolonToken = this.expectToken(TokenType.semicolon).start;
                if (openParan != undefined ? this.lexer.peek().type !== TokenType.closeParen : isExpressionStart(this.lexer.peek().type)) {
                    (<nodes.ForStatement>result).iterator = this.parseExpression(ParseFlags.allowIn);
                }
                break;
            case TokenType.in:
                result = new nodes.ForInStatement();
                (<nodes.ForInStatement>result).inToken = this.lexer.read().start;
                result.condition = this.parseExpression(ParseFlags.allowIn);
                break;
            case TokenType.of:
                result = new nodes.ForOfStatement();
                (<nodes.ForOfStatement>result).ofToken = this.lexer.read().start;
                result.condition = this.parseExpression(ParseFlags.allowIn | ParseFlags.disallowComma);
                break;
            case TokenType.to:
                result = new nodes.ForToStatement();
                (<nodes.ForToStatement>result).toToken = this.lexer.read().start;
                result.condition = this.parseExpression(ParseFlags.allowIn);
                break;
        }

        result.start = start;
        if (initializer) {
            result.initializer = initializer;
            // "“for in/of/to”语句中最多只能有一个变量"
            // todo
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
        result.whileToken = this.expectToken(TokenType.while).start;
        this.parseCondition(result);
        result.end = this.expectSemicolon();
        return result;
    }

    /**
     * 解析一个 continue 语句(continue xx;)。
     */
    private parseContinueStatement() {
        console.assert(this.lexer.peek().type === TokenType.continue);
        const result = new nodes.ContinueStatement();
        result.start = this.lexer.read().start;
        if (this.lexer.peek().type === TokenType.identifier) {
            result.label = this.parseIdentifier();
        }
        result.end = this.expectSemicolon();
        return result;
    }

    /**
     * 解析一个 break 语句(break xx;)。
     */
    private parseBreakStatement() {
        console.assert(this.lexer.peek().type === TokenType.break);
        const result = new nodes.BreakStatement();
        result.start = this.lexer.read().start;
        if (this.lexer.peek().type === TokenType.identifier) {
            result.label = this.parseIdentifier();
        }
        result.end = this.expectSemicolon();
        return result;
    }

    /**
     * 解析一个 return 语句(return xx;)。
     */
    private parseReturnStatement() {
        console.assert(this.lexer.peek().type === TokenType.return);
        const result = new nodes.ReturnStatement();
        result.start = this.lexer.read().start;
        if (options.smartSemicolonInsertion === false ?
            !this.lexer.peek().onNewLine :
            isExpressionStart(this.lexer.peek().type)) {
            result.value = this.parseExpression(ParseFlags.allowIn);
        }
        result.end = this.expectSemicolon();
        return result;
    }

    /**
     * 解析一个 throw 语句(throw xx;)。
     */
    private parseThrowStatement() {
        console.assert(this.lexer.peek().type === TokenType.throw);
        const result = new nodes.ThrowStatement();
        result.start = this.lexer.read().start;
        if (options.smartSemicolonInsertion === false ?
            !this.lexer.peek().onNewLine :
            isExpressionStart(this.lexer.peek().type)) {
            result.value = this.parseExpression(ParseFlags.allowIn);
        } else if (options.allowRethrow === false) {
            this.error(this.lexer.current, "应输入表达式。");
        }
        result.end = this.expectSemicolon();
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
                result.catch.openParanToken = this.lexer.read().start;
                result.catch.variable = this.parseBindingName();
                result.catch.openParanToken = this.expectToken(TokenType.closeParen).start;
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
        result.end = this.expectSemicolon();
        return result;
    }

    /**
     * 解析一个 with 语句(with(...) ...)。
     */
    private parseWithStatement() {
        console.assert(this.lexer.peek().type == TokenType.with);
        const result = new nodes.WithStatement();
        result.start = this.lexer.read().start;
        if (this.lexer.peek().type === TokenType.openParen) {
            result.openParanToken = this.lexer.read().start;
            result.value = options.allowWithVaribale !== false && this.isVariableStatement() ?
                this.parseVariableStatement() :
                this.parseExpression(ParseFlags.allowIn);
            result.closeParanToken = this.expectToken(TokenType.closeParen).start;
        } else {
            if (options.autoInsertParenthese === false) {
                this.expectToken(TokenType.openParen);
            }
            result.value = options.allowWithVaribale !== false && this.isVariableStatement() ?
                this.parseVariableStatement() :
                this.parseExpression(ParseFlags.allowIn);
        }
        result.body = this.parseEmbeddedStatement();
        return result;
    }

    // #endregion

    // #region 表达式

    private parseExpression(a): nodes.Expression {

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
        console.assert(this.lexer.peek().type === TokenType.identifier);
        const result = new nodes.Identifier();
        result.start = this.lexer.read().start;
        result.value = this.lexer.current.data;
        result.end = this.lexer.read().end;
        return result;
    }

    /**
     * 解析一个简单字面量(this、super、null、true、false)。
     */
    private parseSimpleLiteral() {
        console.assert(this.lexer.peek().type === TokenType.this ||
            this.lexer.peek().type === TokenType.super ||
            this.lexer.peek().type === TokenType.null ||
            this.lexer.peek().type === TokenType.true ||
            this.lexer.peek().type === TokenType.false);
        const result = new nodes.SimpleLiteral();
        result.start = this.lexer.read().start;
        result.type = this.lexer.current.type;
        result.end = this.lexer.read().end;
        return result;
    }

    /**
     * 解析一个数字字面量(1)。
     */
    private parseNumericLiteral() {
        console.assert(this.lexer.peek().type === TokenType.numericLiteral);
        const result = new nodes.NumericLiteral();
        result.start = this.lexer.read().start;
        result.value = this.lexer.current.data;
        result.end = this.lexer.read().end;
        return result;
    }

    /**
     * 解析一个字符串字面量('abc'、"abc"、`abc`)。
     */
    private parseStringLiteral() {
        console.assert(this.lexer.peek().type === TokenType.stringLiteral || this.lexer.peek().type === TokenType.noSubstitutionTemplateLiteral);
        const result = new nodes.StringLiteral();
        result.start = this.lexer.read().start;
        result.value = this.lexer.current.data;
        result.end = this.lexer.current.end;
        return result;
    }

    /**
     * 解析一个模板字面量(`abc${x + y}def`)。
     */
    private parseTemplateLiteral() {
        console.assert(this.lexer.peek().type === TokenType.templateHead);
        const result = new nodes.TemplateLiteral();
        result.spans = new nodes.NodeList<nodes.Expression>();

        while (true) {

            console.assert(this.lexer.peek().type === TokenType.templateHead || this.lexer.peek().type === TokenType.templateMiddle);
            let span = new nodes.TemplateSpan();
            span.start = this.lexer.read().start;
            span.value = this.lexer.current.data;
            span.end = this.lexer.current.end;
            result.spans.push(span);

            let expressions = this.parseExpression();
            result.spans.push(expressions);

            if (this.lexer.peek().type !== TokenType.closeBrace) {
                this.expectToken(TokenType.closeBrace);
                break;
            }

            if (this.lexer.readAsTemplateMiddleOrTail().type === TokenType.templateTail) {
                let span = new nodes.TemplateSpan();
                span.start = this.lexer.read().start;
                span.value = this.lexer.current.data;
                span.end = this.lexer.current.end;
                result.spans.push(span);
                break;
            }
        }

        return result;
    }

    /**
     * 解析一个正则表达式字面量(/abc/)。
     */
    private parseRegularExpressionLiteral() {
        console.assert(this.lexer.peek().type === TokenType.slash || this.lexer.peek().type === TokenType.slashEquals);
        const result = new nodes.RegularExpressionLiteral();
        result.start = this.lexer.readAsRegularExpressionLiteral().start;
        result.value = this.lexer.current.data.pattern;
        result.flags = this.lexer.current.data.flags;
        result.end = this.lexer.current.end;
        return result;
    }

    /**
     * 解析一个数组字面量([x, y])。
     */
    private parseArrayLiteral() {
        console.assert(this.lexer.peek().type === TokenType.openBracket);
        const result = new nodes.ArrayLiteral();
        result.start = this.lexer.read().start;
        result.elements = new nodes.NodeList<nodes.Expression>();
        result.elements.seperatorTokens = [];
        while (true) {
            switch (this.lexer.peek().type) {
                case TokenType.comma:
                    result.elements.push(nodes.Expression.empty);
                    result.elements.seperatorTokens.push(this.lexer.read().start);
                    continue;
                case TokenType.closeBracket:
                    result.end = this.lexer.read().start;
                    return result;
                case TokenType.endOfFile:
                    result.end = this.expectToken(TokenType.closeBracket).end;
                    return result;
            }
            result.elements.push(this.parseExpression(ParseFlags.disallowComma));
        }
    }

    /**
     * 解析一个对象字面量({x: y})。
     */
    private parseObjectLiteral() {
        console.assert(this.lexer.peek().type === TokenType.openBrace);
        const result = new nodes.ObjectLiteral();
        result.start = this.lexer.read().start;
        result.elements = new nodes.NodeList<nodes.ObjectLiteralElement>();
        result.elements.seperatorTokens = [];
        while (true) {
            switch (this.lexer.peek().type) {
                case TokenType.closeBrace:
                    result.end = this.lexer.read().end;
                    return result;
                case TokenType.endOfFile:
                    result.end = this.expectToken(TokenType.closeBrace).end;
                    return result;
            }

            //const start = this.lexer.peek().start;
            //const decorators = this.parseDecorators();
            //const modifiers = this.parseModifiers();

            // todo
            //const element = new nodes.ObjectBindingElement();
            //element.property = this.parsePropertyName();
            //if (this.lexer.peek().type === TokenType.colon) {
            //    element.colon = this.lexer.read().start;
            //    element.name = this.parseBindingName();
            //}
            //if (this.lexer.peek().type === TokenType.equals) {
            //    element.equal = this.lexer.read().start;
            //    element.initializer = this.parseExpression(ParseFlags.disallowComma);
            //}
            //if (this.lexer.peek().type === TokenType.comma) {
            //    result.elements.seperators.push(this.lexer.read().start);
            //}
            result.elements.push(element);
        }
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
        console.assert(this.lexer.peek().type === TokenType.class);
        const result = new nodes.ClassExpression();
        result.start = this.lexer.read().start;
        switch (this.lexer.peek().type) {
            case TokenType.identifier:
                result.name = this.parseIdentifier();
                break;
            case TokenType.implements:
                // implements 可能是关键字或类名。
                if (!this.isImplements()) {
                    result.name = this.parseIdentifier();
                }
                break;
        }
        result.typeParameters = this.parseTypeParameters();
        if (this.lexer.peek().type === TokenType.extends) {
            result.extendsToken = this.lexer.read().type;
            result.extends = this.parseHeritageClause();
        }
        if (this.lexer.peek().type === TokenType.implements) {
            result.implementsToken = this.lexer.read().type;
            result.implements = this.parseHeritageClause();
        }
    }

    private parseHeritageClause() {
        const result = new nodes.NodeList<nodes.Expression>();
        result.seperators = [];
        while (true) {
            result.push(this.parseTypeExpression());
            if (this.lexer.peek().type === TokenType.comma) {
                result.seperators.push(this.lexer.read().start);
                continue;
            }
            return result;
        }
    }

    private isImplements() {
        this.lexer.stashSave();
        this.lexer.read();
        const result = isIdentifierOrKeyword(this.lexer.peek().type);
        this.lexer.stashRestore();
        return result;
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
        console.assert(this.lexer.peek().type === TokenType.enum);
        const result = new nodes.EnumExpression();
        result.start = this.lexer.read().start;
        if (this.lexer.peek().type === TokenType.identifier) {
            result.name = this.parseIdentifier();
        }

        if (this.lexer.peek().type === TokenType.openBrace) {
            result.members
        }

    }

    /**
     * 解析一个括号表达式((x))。
     */
    private parseParenthesizedExpression() {
        console.assert(this.lexer.peek().type === TokenType.openParen);
        const result = new nodes.ParenthesizedExpression();
        result.start = this.lexer.read().start;
        result.body = this.parseExpression(ParseFlags.allowIn);
        result.end = this.expectToken(TokenType.closeParen).end;
        return result;
    }

    /**
     * 解析一个成员调用表达式(x.y)。
     * @param parsed 已解析的表达式部分。
     */
    private parseMemberCallExpression(parsed: nodes.Expression) {
        console.assert(this.lexer.peek().type === TokenType.dot);
        const result = new nodes.MemberCallExpression();
        result.target = parsed;
        result.dotToken = this.expectToken(TokenType.dot).start;
        result.argument = this.expectIdentifier();
        return result;
    }

    /**
     * 解析一个函数调用表达式(x())。
     * @param parsed 已解析的表达式部分。
     */
    private parseFunctionCallExpression(parsed: nodes.Expression) {
        console.assert(this.lexer.peek().type === TokenType.openParen);
        const result = new nodes.FunctionCallExpression();
        result.target = parsed;
        //return result;
    }

    /**
     * 解析一个索引调用表达式(x[y])。
     * @param parsed 已解析的表达式部分。
     */
    private parseIndexCallExpression(parsed: nodes.Expression) {
        console.assert(this.lexer.peek().type === TokenType.openBracket);
        const result = new nodes.IndexCallExpression();
        result.target = parsed;
        //result.argument = this.parseTemplateLiteral();
        //return result;
    }

    /**
     * 解析一个模板调用表达式(x`abc`)。
     * @param parsed 已解析的表达式部分。
     */
    private parseTemplateCallExpression(parsed: nodes.Expression) {
        console.assert(this.lexer.peek().type === TokenType.noSubstitutionTemplateLiteral || this.lexer.peek().type === TokenType.templateHead);
        const result = new nodes.TemplateCallExpression();
        result.target = parsed;
        result.argument = this.parseTemplateLiteral();
        return result;
    }

    /**
     * 解析一个 new 表达式(new x())。
     */
    private parseNewExpression() {
        console.assert(this.lexer.peek().type === TokenType.new);

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
        console.assert(isUnaryOperator(this.lexer.peek().type));
        const result = new nodes.UnaryExpression();
        result.start = this.lexer.read().start;
        result.operand = this.parseExpression();
        return result;
    }

    /**
     * 解析一个一元运算表达式(+x、typeof x、...)。
     */
    private parsePrefixIncrementExpression() {
        console.assert(this.lexer.peek().type === TokenType.plusPlus || this.lexer.peek().type === TokenType.minusMinus);
        const result = new nodes.IncrementExpression();
        result.start = this.lexer.read().start;
        result.type = this.lexer.current.type;
        result.operand = this.parseExpression();
        result.end = this.lexer.current.end;
        return result;
    }

    /**
     * 解析一个一元运算表达式(+x、typeof x、...)。
     * @param parsed 已解析的表达式部分。
     */
    private parsePostfixIncrementExpression(parsed: nodes.Expression) {
        console.assert(this.lexer.peek().type === TokenType.plusPlus || this.lexer.peek().type === TokenType.minusMinus);
        const result = new nodes.IncrementExpression();
        result.start = this.lexer.read().start;
        result.type = this.lexer.current.type;
        result.operand = parsed;
        result.end = this.lexer.current.end;
        return result;
    }

    /**
     * 解析一个二元运算表达式(x + y、x = y、...)。
     * @param parsed 已解析的表达式部分。
     */
    private parseBinaryExpression(parsed: nodes.Expression) {
        console.assert(isBinaryOperator(this.lexer.peek().type));
        const result = new nodes.BinaryExpression();
        result.leftOperand = parsed;
        result.operatorToken = this.lexer.read().start;
        result.type = this.lexer.current.type;
        result.rightOperand = this.parseExpression();
        return result;
    }

    /**
     * 解析一个 yield 表达式(yield x、yield * x)。
     */
    private parseYieldExpression() {

    }

    /**
     * 解析一个条件表达式(x ? y : z)。
     * @param parsed 已解析的表达式部分。
     */
    private parseConditionalExpression(parsed: nodes.Expression) {
        console.assert(this.lexer.peek().type === TokenType.question);
        const result = new nodes.ConditionalExpression();
        result.condition = parsed;
        result.questionToken = this.lexer.read().start;
        result.thenExpression = this.parseExpression();
        result.colonToken = this.expectToken(TokenType.colon).start;
        result.elseExpression = this.parseExpression();
        return result;
    }

    /**
     * 解析一个类型转换表达式(<T>xx)。
     */
    private parseTypeCastExpression() {


    }

    /**
     * 解析一个泛型表达式(Array<T>)。
     * @param parsed 已解析的表达式部分。
     */
    private parseGenericTypeExpression(parsed: nodes.Expression) {


    }

    /**
     * 解析一个数组类型表达式(T[])。
     * @param parsed 已解析的表达式部分。
     */
    private parseArrayTypeExpression(parsed: nodes.Expression) {

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
        console.assert(this.lexer.peek().type === TokenType.function);
        const result = new nodes.FunctionDeclaration();
        this.parseJSDocComment(result);
        result.start = this.lexer.read().start;
        if (this.lexer.peek().type === TokenType.asterisk) {
            result.asteriskToken = this.lexer.read().type;
        }

        result.name = this.expectIdentifier();
        result.typeParameters = this.parseTypeParameters();
        switch (this.lexer.peek().type) {
            case TokenType.openBrace:
                result.body = this.parseBlockStatement();
                break;
            case TokenType.equalsGreaterThan:
                result.body = this.parseArrowFunctionExpression();
                break;
            case TokenType.semicolon:
                this.lexer.read();
                break;
            default:
                this.expectToken(TokenType.openBrace);
                break;
        }
        result.end = this.lexer.current.end;

        return result;
    }

    private parseFunctionBody(result) {

    }

    /**
     * 解析一个泛型参数声明。
     */
    private parseTypeParametersDeclaration() {


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
        console.assert(this.lexer.peek().type == TokenType.import);
        const start = this.lexer.read().type;

        let identifier: nodes.Identifier;
        switch (this.lexer.peek().type) {
            case TokenType.identifier:
                identifier = this.parseIdentifier();
                break;
            case TokenType.stringLiteral:
                break;
            case TokenType.openBrace:
                break;
            case TokenType.asterisk:
                break;
            default:
                identifier = this.expectIdentifier();
                break;
        }

        const result = new nodes.ImportDeclaration();

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

    // #region 注释

    /**
     * 解析一个 JS 注释。
     */
    private parseComment() {

    }

    /**
     * 解析一个 JS 文档注释。
     * @param node 所属的节点。
     */
    private parseJsDocComment(node) {

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

    allowIn,

    disallowComma,

    disallowIn,

    allowYield,

    allowAwait,

}