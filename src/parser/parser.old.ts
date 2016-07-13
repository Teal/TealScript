/**
 * @fileOverview 语法解析器
 */

import {TokenType, tokenToString, isNonReservedWord, isSimpleLiteral, isUnaryOperator, isExpressionStart, getPrecedence, isStatementStart} from '../ast/tokenType';
import * as nodes from '../ast/nodes';
import {CharCode} from './charCode';
import {Lexer, Token} from './lexer';
import {options, error, ErrorType} from '../compiler/compiler';

/**
 * 表示一个语法解析器。
 * @description 语法解析器可以将源码解析一个语法树。
 */
export class Parser {

    ///**
    // * 解析一个逗号隔开的节点列表(<..., ...>。
    // * @param nodes 要解析的节点列表。
    // */
    //private parseNodeList<T extends Node>(start: TokenType, parseElement: () => T, end: TokenType) {
    //    const result = new nodes.NodeList<T>();

    //    return result;
    //}

    // #region 节点

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
        
    }

    /**
     * 解析一个绑定名称(`xx, [xx], {x:x}`)。
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
     * 解析一个数组绑定模式项(`[xx]`)。
     */
    private parseArrayBindingPattern() {
        console.assert(this.lexer.peek().type === TokenType.openBracket);
        const result = new nodes.ArrayBindingPattern();
        result.start = this.lexer.read().start;
        result.elements = new nodes.NodeList<nodes.ArrayBindingElement>();
        result.elements.commaTokens = [];
        while (true) {
            switch (this.lexer.peek().type) {
                case TokenType.comma:
                    result.elements.push(nodes.ArrayBindingElement.empty);
                    result.elements.commaTokens.push(this.lexer.read().start);
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
     * 解析一个对象绑定模式项(`{xx: xx}`)。
     */
    private parseObjectBindingPattern() {
        console.assert(this.lexer.peek().type === TokenType.openBrace);
        const result = new nodes.ObjectBindingPattern();
        result.start = this.lexer.read().start;
        result.elements = new nodes.NodeList<nodes.ObjectBindingElement>();
        result.elements.commaTokens = [];
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
                result.elements.commaTokens.push(this.lexer.read().start);
            }
            result.elements.push(element);
        }
    }

    /**
     * 解析一个属性名称(`xx、"xx"、[xx]`)。
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
        result.body = this.parseExpression(ParseFlags.disallowIn);
        result.end = this.expectToken(TokenType.closeBracket).end;
        return result;
    }

    // #endregion

    // #region 声明

    /**
     * 解析修饰器列表(`@xx`)。
     * @param result 存放结果的对象。
     */
    private parseDecoratorList(result: nodes.Declaration) {

        // 无修饰器。
        if (this.lexer.peek().type !== TokenType.at) {
            return;
        }

        result.decorators = new nodes.NodeList<nodes.Decorator>();
        do {
            const decorator = new nodes.Decorator();
            decorator.start = this.lexer.read().start;
            decorator.body = this.parseExpression();

            // 检查修饰器是否是合法的表达式。

            result.decorators.push(decorator);
        } while (this.lexer.peek().type === TokenType.at);
    }

    /**
     * 解析所有修饰符(`static`、`private`、...)。
     */
    private parseModifiers() {

    }

    /**
     * 解析一个函数声明(`function fn() {...}`、`function * fn(){...}`)。
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

    /**
     * 解析函数参数声明列表。
     * @param ignoreError 如果解析出现错误则返回空。
     */
    private parseParameterList(ignoreError: boolean): any {

    }

    private parseFunctionBody(result) {

    }

    /**
     * 解析一个泛型参数声明。
     */
    private parseTypeParametersDeclaration() {


    }

    /**
     * 解析一个函数表达式(function (`) {}`)。
     */
    private parseFunctionExpression(a) {





    }

    /**
     * 解析一个参数声明(`x、x = 1、...x`)。
     */
    private parseParameterDeclaration() {




    }

    /**
     * 解析一个类声明(`class T {...}`)。
     */
    private parseClassDeclaration() {







    }

    /**
     * 解析一个解析器声明(get fn() {...}、set fn(`) {...}`)。
     */
    private parseAccessorDeclaration() {







    }

    /**
     * 解析一个接口声明(`interface T {...}`)。
     */
    private parseInterfaceDeclaration() {






    }

    /**
     * 解析一个枚举声明(`enum T {}`)。
     */
    private parseEnumDeclaration() {




    }

    /**
     * 解析一个类表达式(`class xx {}`)。
     */
    private parseClassExpression(): nodes.Expression {
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
     * 解析一个接口表达式(`interface xx {}`)。
     */
    private parseInterfaceExpression(): nodes.Expression {




    }

    /**
     * 解析一个枚举表达式(`enum xx {}`)。
     */
    private parseEnumExpression(): nodes.EnumExpression {
        return this.parseEnumDeclarationOrExpression(true);
    }

    /**
     * 解析一个枚举声明或表达式(`enum xx {}`)。
     */
    private parseEnumDeclarationOrExpression(expression: boolean) {
        console.assert(this.lexer.peek().type === TokenType.enum);
        const result: nodes.EnumExpression | nodes.EnumDeclaration = expression ? new nodes.EnumExpression() : new nodes.EnumDeclaration();
        result.start = this.lexer.read().start;
        if (expression || this.lexer.peek().type === TokenType.identifier) {
            result.name = this.parseIdentifier();
        } else {
            result.name = this.expectIdentifier();
        }
        if (this.lexer.peek().type === TokenType.openBrace) {
            result.members = new nodes.NodeList<nodes.EnumMemberDeclaration>();
            result.members.start = this.lexer.read().start;
            while (true) {
                switch (this.lexer.peek().type) {
                    case TokenType.closeBrace:
                        result.end = this.lexer.read().end;
                        return result;
                    case TokenType.endOfFile:
                        result.end = this.expectToken(TokenType.closeBrace).end;
                        return result;
                }
                const member = new nodes.EnumMemberDeclaration();
                member.name = this.expectIdentifier();
                if (this.lexer.peek().type === TokenType.equals) {
                    member.equalToken = this.lexer.read().start;
                    member.initializer = this.parseExpression(ParseFlags.disallowIn);
                }
                result.members.push(member);
            }
        }
    }

    /**
     * 解析一个枚举成员声明(`xx = 1`)。
     */
    private parseEnumMemberDeclaration() {




    }

    /**
     * 解析一个命名空间声明(`namespace abc {...}、module abc {...}`)。
     */
    private parseNamespaceDeclaration() {


    }

    /**
     * 解析一个 import 指令(`import xx from '...';`)。
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
     * 解析一个 import = 指令(import xx = require(`"");`)。
     */
    private parseImportEqualsDirective() {

    }

    /**
     * 解析一个名字导入声明项(`a as b`)。
     */
    private parseNameImportClause() {


    }

    /**
     * 解析一个命名空间导入声明项(`{a as b}`)。
     */
    private parseNamespaceImportClause() {

    }

    /**
     * 解析一个 export 指令(`export xx from '...';`)。
     */
    private parseExportDirective() {


    }

    /**
     * 解析一个 export = 指令(`export = 1;`)。
     */
    private parseExportEqualsDirective() {

    }


    // #endregion

    // #region 表达式

    /**
     * 存储是否禁止解析 in 表达式。
     */
    private disallowIn: boolean;

    /**
     * 存储是否禁止解析逗号表达式。
     */
    private disallowComma: boolean;

    /**
     * 解析一个表达式。
     */
    private parseExpression() {
        let parsed: nodes.Expression;
        const type = this.lexer.peek().type;

        return this.parseExpressionRest(parsed, precedence, disallowIn);
    }

    /**
     * 在允许解析 in 和逗号表达式的上下文中解析一个表达式。
     */
    private parseExpressionWithInAndComma() {
        if (this.disallowIn || this.disallowComma) {
            const disallowIn = this.disallowIn;
            const disallowComma = this.disallowComma;
            this.disallowIn = this.disallowComma = false;
            const result = this.parseExpression();
            this.disallowIn = disallowIn;
            this.disallowComma = disallowComma;
            return result;
        }
        return this.parseExpression();
    }

    /**
     * 在禁止解析逗号表达式的上下文中解析一个表达式。
     */
    private parseExpressionWithoutComma() {
        if (this.disallowComma) {
            return this.parseExpression();
        }
        this.disallowComma = true;
        const result = this.parseExpression();
        this.disallowComma = false;
        return result;
    }

    /**
     * 解析一个单目或主表达式。
     */
    private parseUnaryOrPrimaryExpression() {
        const type = this.lexer.peek().type;
        switch (type) {

            // Identifier、Identifier<T>
            case TokenType.identifier:
                return this.parseIdentifierOrGenericExpression();

            // (Expr)、(Expr) => {...}
            case TokenType.openParen:
                return this.parseParenthesizedExpressionOrArrowFunction();

            // ""、''
            case TokenType.stringLiteral:
            case TokenType.noSubstitutionTemplateLiteral:
                return this.parseStringLiteral();

            // 0
            case TokenType.numericLiteral:
                return this.parseNumericLiteral();

            // [Expr, ...]
            case TokenType.openBracket:
                return this.parseArrayLiteral();

            // {key: Expr, ...}
            case TokenType.openBrace:
                return this.parseObjectLiteral();

            // new Expr
            case TokenType.new:
                return this.parseNewExpression();

            // `abc${
            case TokenType.templateHead:
                return this.parseTemplateLiteral();

            // yield ...
            case TokenType.yield:
                return this.parseYieldExpression();

            // await ...
            case TokenType.await:
                return this.parseAwaitExpression();

            // => ...
            case TokenType.equalsGreaterThan:
                return this.parseArrowFunctionExpression(undefined, undefined, undefined);

            case TokenType.slash:
            case TokenType.slashEquals:
                return this.parseRegularExpressionLiteral();

        }

        // this、super、null、true、false
        if (isSimpleLiteral(type)) {
            return this.parseSimpleLiteral();
        }

        // void、delete、typeof、+、-、~、!、++、--。
        if (isUnaryOperator(type)) {
            return this.parseUnaryExpression();
        }

        // 非法标记。
        return this.parseErrorExpression();
    }

    // #region 独立表达式

    /**
     * 解析一个独立表达式。
     */
    private parsePrimaryExpression() {
        switch (this.lexer.peek().type) {

            // Identifier、Identifier<T>
            case TokenType.identifier:
                return this.parseIdentifierOrGenericExpression();

            // this、super、null、true、false
            case TokenType.this:
            case TokenType.null:
            case TokenType.true:
            case TokenType.false:
            case TokenType.super:
                return this.parseSimpleLiteral();

            // ""、''
            case TokenType.stringLiteral:
            case TokenType.noSubstitutionTemplateLiteral:
                return this.parseStringLiteral();

            // 0
            case TokenType.numericLiteral:
                return this.parseNumericLiteral();

            // (Expr)、(Expr) => {...}
            case TokenType.openParen:
                return this.parseParenthesizedExpressionOrArrowFunction();

            // [Expr, ...]
            case TokenType.openBracket:
                return this.parseArrayLiteral();

            // {key: Expr, ...}
            case TokenType.openBrace:
                return this.parseObjectLiteral();

            // new Expr
            case TokenType.new:
                return this.parseNewExpression();

            // `abc${
            case TokenType.templateHead:
                return this.parseTemplateLiteral();

            // => ...
            case TokenType.equalsGreaterThan:
                return this.parseArrowFunctionExpression(undefined, undefined, undefined);

            // /、/=
            case TokenType.slash:
            case TokenType.slashEquals:
                return this.parseRegularExpressionLiteral();

            // function () {}
            case TokenType.function:
                return this.parseFunctionExpression();

            // async () => ...、async function () {}、async
            case TokenType.async:
                return this.parseAsyncFunctionExpressionOrIdentifier();

            // class {}
            case TokenType.class:
                return this.parseClassExpression();

            // interface {}
            case TokenType.interface:
                return this.parseInterfaceExpression();

            // enum {}
            case TokenType.enum:
                return this.parseEnumExpression();

        }

        // 其它关键字作为标识符处理。
        if (isKeyword(this.lexer.peek().type)) {
            return this.parseIdentifier();
        }

        // 非法标记。
        return this.parseErrorExpression();

    }

    /**
     * 解析一个标识符或泛型表达式(`foo`、`foo<number>`)。
     */
    private parseIdentifierOrGenericExpression(): nodes.Identifier | nodes.GenericExpression {
        const identifier = this.parseIdentifier();
        if (this.lexer.peek().type !== TokenType.lessThan) {
            return identifier;
        }

        this.lexer.stashSave();
        const typeArguments = this.parseTypeArguments(true);
        if (!typeArguments) {
            this.lexer.stashRestore();
            return identifier;
        }

        this.lexer.stashClear();
        return this.parseGenericExpression(identifier, typeArguments);
    }

    /**
     * 解析一个标识符(`x`)。
     */
    private parseIdentifier() {
        console.assert(this.lexer.peek().type === TokenType.identifier || isKeyword(this.lexer.peek().type));
        const result = new nodes.Identifier();
        result.start = this.lexer.read().start;
        result.value = this.lexer.current.data;
        result.end = this.lexer.current.end;
        return result;
    }

    /**
     * 解析一个泛型表达式(`foo<number>`)。
     */
    private parseGenericExpression(element: nodes.Identifier, typeArguments: nodes.NodeList<nodes.TypeNode>) {
        const result = new nodes.GenericExpression();
        result.element = element;
        result.typeArguments = typeArguments;
        return result;
    }

    /**
     * 解析一个简单字面量(`this`、`super`、`null`、`true`、`false`)。
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
        return result;
    }

    /**
     * 解析一个字符串字面量(`'abc'`、`"abc"`、`\`abc\``)。
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
     * 解析一个数字字面量(`1`)。
     */
    private parseNumericLiteral() {
        console.assert(this.lexer.peek().type === TokenType.numericLiteral);
        const result = new nodes.NumericLiteral();
        result.start = this.lexer.read().start;
        result.value = this.lexer.current.data;
        result.end = this.lexer.current.end;
        return result;
    }

    /**
     * 解析一个括号或箭头函数表达式(`(x)`、`(x) => {...}`)。
     */
    private parseParenthesizedExpressionOrArrowFunction() {
        console.assert(this.lexer.peek().type === TokenType.openParen);
        this.lexer.stashSave();
        const parameters = this.parseParameterList(true);
        if (!parameters || (this.lexer.peek().type !== TokenType.equalsGreaterThan && this.lexer.peek().type !== TokenType.colon)) {
            this.lexer.stashRestore();
            return this.parseParenthesizedExpression();
        }
        this.lexer.stashClear();
        return this.parseArrowFunctionExpression(undefined, undefined, parameters);
    }

    /**
     * 解析一个括号表达式((`x)`)。
     */
    private parseParenthesizedExpression() {
        console.assert(this.lexer.peek().type === TokenType.openParen);
        const result = new nodes.ParenthesizedExpression();
        result.start = this.lexer.read().start;
        result.body = this.parseExpressionWithInAndComma();
        result.end = this.expectToken(TokenType.closeParen).end;
        return result;
    }

    /**
     * 解析一个箭头函数表达式(`x => y`)。
     * @param modifiers 已解析的所有修饰器。
     * @param typeParameters 已解析的所有类型参数。
     * @param parameters 已解析的所有参数。
     * @param disallowIn 是否禁止解析 in 表达式。
     * @param precedence 允许解析的最低操作符优先级。
     */
    private parseArrowFunctionExpression(modifiers: nodes.NodeList<nodes.Modifier>, typeParameters: nodes.NodeList<nodes.TypeParametersDeclaration>, parameters: nodes.NodeList<nodes.ParameterDeclaration> | nodes.Identifier) {
        console.assert(this.lexer.peek().type === TokenType.equalsGreaterThan || this.lexer.peek().type === TokenType.colon);
        const result = new nodes.ArrowFunctionExpression();
        if (modifiers) result.modifiers = modifiers;
        if (typeParameters) result.typeParameters = typeParameters;
        if (parameters) result.parameters = parameters;
        if (this.lexer.peek().type === TokenType.colon) {
            result.colonToken = this.lexer.read().start;
            result.returnType = this.parseTypeNode();
            result.arrowToken = this.expectToken(TokenType.equalsGreaterThan).start;
        } else {
            result.arrowToken = this.lexer.read().start;
        }
        result.body = this.lexer.peek().type === TokenType.openBrace ? this.parseBlockStatement() : this.parseExpression();
        return result;
    }

    /**
     * 解析一个数组字面量(`[x, y]`)。
     */
    private parseArrayLiteral() {
        console.assert(this.lexer.peek().type === TokenType.openBracket);
        const result = new nodes.ArrayLiteral();
        result.elements = new nodes.NodeList<nodes.Expression>();
        result.elements.start = this.lexer.read().start;
        result.elements.commaTokens = [];
        while (true) {
            switch (this.lexer.peek().type) {
                case TokenType.comma:
                    result.elements.push(nodes.Expression.empty);
                    result.elements.commaTokens.push(this.lexer.read().start);
                    continue;
                case TokenType.closeBracket:
                    result.elements.end = this.lexer.read().start;
                    return result;
                case TokenType.endOfFile:
                    result.elements.end = this.expectToken(TokenType.closeBracket).end;
                    return result;
            }
            result.elements.push(this.parseExpressionWithoutComma());
        }
    }

    /**
     * 解析一个对象字面量(`{x: y}`)。
     */
    private parseObjectLiteral() {
        console.assert(this.lexer.peek().type === TokenType.openBrace);
        const result = new nodes.ObjectLiteral();
        result.elements = new nodes.NodeList<nodes.TypeMemberDeclaration>();
        result.elements.start = this.lexer.read().start;
        result.elements.commaTokens = [];
        while (true) {
            switch (this.lexer.peek().type) {
                case TokenType.closeBrace:
                    result.elements.end = this.lexer.read().end;
                    return result;
                case TokenType.endOfFile:
                    result.elements.end = this.expectToken(TokenType.closeBrace).end;
                    return result;
            }
            result.elements.push(this.parseTypeMemberDeclaration());
            if (this.lexer.peek().type === TokenType.comma) {
                result.elements.commaTokens.push(this.lexer.read().start);
                continue;
            }

            result.elements.end = this.expectToken(TokenType.closeBrace).end;
            return result;
        }
    }

    /**
     * 解析一个模板字面量(``abc${x + y}def``)。
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
     * 解析一个正则表达式字面量(`/abc/`)。
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
     * 解析一个 async 异步函数或标识符。
     */
    private parseAsyncFunctionExpressionOrIdentifier() {
        console.assert(this.lexer.peek().type === TokenType.async);

        this.lexer.stashSave();
        this.lexer.read();

        // 如果已换行，则认为不是 async 关键字。
        if (options.smartSemicolonInsertion === false && this.lexer.peek().onNewLine) {
            this.lexer.stashRestore();
            return this.parseIdentifier();
        }

        switch (this.lexer.peek().type) {

            // async function
            case TokenType.function:
                this.lexer.stashRestore();
                return this.parseFunctionExpression(this.parseModifiers());

            // async x
            case TokenType.identifier:
                this.lexer.stashRestore();
                return this.parseArrowFunctionExpression(this.parseModifiers(), undefined, this.parseIdentifier());

            // async <
            case TokenType.lessThan:
                return this.parseArrowFunctionExpression(this.parseModifiers());

            // async (
            case TokenType.openParen:
                const parameters = this.parseParameterList(true);
                if (!parameters || (this.lexer.peek().type !== TokenType.equalsGreaterThan && this.lexer.peek().type !== TokenType.colon)) {
                    this.lexer.stashRestore();
                    return this.parseIdentifier();
                }
                this.lexer.stashClear();
                return this.parseArrowFunctionExpression(undefined, undefined, parameters);

            default:
                this.lexer.stashRestore();
                return this.parseIdentifier();
        }

    }

    // #endregion

    private parseMemberExpression() {
        let parsed;
        //const type = this.lexer.peek().type;
        //switch (type) {

        //    // Identifier、Identifier<T>
        //    case TokenType.identifier:
        //        return this.parseIdentifierOrGenericExpression();

        //    // (Expr)、(Expr) => {...}
        //    case TokenType.openParen:
        //        return this.parseParenthesizedExpressionOrArrowFunction();

        //    // new Expr
        //    case TokenType.new:
        //        return this.parseNewExpression();

        //    // yield ...
        //    case TokenType.yield:
        //        return this.parseYieldExpression();

        //    // await ...
        //    case TokenType.await:
        //        return this.parseAwaitExpression();

        //}

        //// this、super、null、true、false
        //if (isSimpleLiteral(type)) {
        //    return this.parseSimpleLiteral();
        //}

        //// 非法标记。
        //return this.parseErrorExpression();
    }

    /**
     * 解析一个错误表达式。
     */
    private parseErrorExpression() {
        const token = this.lexer.peek();
        switch (token.type) {
            case TokenType.closeParen:
            case TokenType.closeBracket:
            case TokenType.closeBrace:
                this.error(token, "多余的“{0}”。", tokenToString(token.type));
                break;
            case TokenType.endOfFile:
                this.error(token, "应输入表达式；文件意外结束。");
                break;
            default:
                this.error(token, isStatementStart(token.type) ? "无效的表达式项“{0}”；“{0}”是语句关键字。" : "无效的表达式项“{0}”。", tokenToString(token.type));
                break;
        }
        const result = new nodes.ErrorExpression();
        result.start = this.lexer.read().start;
        result.end = this.lexer.current.end;
        return result;
    }

    private parseExpressionWith(flags: ParseFlags) {
        const savedFlags = this.flags;
        this.flags |= flags;
        const result = this.parseExpression();
        this.flags = savedFlags;
        return result;
    }

    private parseTypeMemberDeclaration() {

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
    }

    /**
     * 解析一个成员调用表达式(`x.y`)。
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
     * 解析一个函数调用表达式(x(`)`)。
     * @param parsed 已解析的表达式部分。
     */
    private parseFunctionCallExpression(parsed: nodes.Expression) {
        console.assert(this.lexer.peek().type === TokenType.openParen);
        const result = new nodes.FunctionCallExpression();
        result.target = parsed;
        //return result;
    }

    /**
     * 解析一个索引调用表达式(`x[y]`)。
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
     * 解析一个模板调用表达式(`x`abc``)。
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
     * 解析一个 new.target 表达式(`new.target`)。
     */
    private parseNewTargetExpression() {

    }

    /**
     * 解析一个一元运算表达式(`+x、typeof x、...`)。
     */
    private parseUnaryExpression() {
        console.assert(isUnaryOperator(this.lexer.peek().type));
        const result = new nodes.UnaryExpression();
        result.start = this.lexer.read().start;
        // todo: ++ -- 的操作数只能是 parseLeftHandSideExpressionOrHigher
        result.operand = this.parseUnaryOrPrimaryExpression();
        return result;
    }

    /**
     * 解析一个后缀增量运算表达式(`x++`、`x--`)。
     * @param parsed 已解析的表达式部分。
     */
    private parsePostfixIncrementExpression(operand: nodes.Expression) {
        console.assert(this.lexer.peek().type === TokenType.plusPlus || this.lexer.peek().type === TokenType.minusMinus);
        // todo: ++ -- 需要处理自动换行
        const result = new nodes.PostfixIncrementExpression();
        result.operand = operand;
        result.type = this.lexer.read().type;
        result.end = this.lexer.current.end;
        return result;
    }

    /**
     * 解析一个二元运算表达式(`x + y、x = y、...`)。
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
     * 解析一个 yield 表达式(`yield x、yield * x`)。
     */
    private parseYieldExpression() {

    }

    /**
     * 解析一个条件表达式(`x ? y : z`)。
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
     * 解析一个类型转换表达式(`<T>xx`)。
     */
    private parseTypeCastExpression() {


    }

    /**
     * 解析一个泛型表达式(`Array<T>`)。
     * @param parsed 已解析的表达式部分。
     */
    private parseGenericTypeExpression(parsed: nodes.Expression) {


    }

    /**
     * 解析一个数组类型表达式(`T[]`)。
     * @param parsed 已解析的表达式部分。
     */
    private parseArrayTypeExpression(parsed: nodes.Expression) {

    }

    // #endregion

    // #region Jsx 节点

    /**
     * 解析一个 JSX 标签(`<div>...</div>`)。
     */
    private parseJsxElement() {



    }

    /**
     * 解析一个 JSX 标签属性(`id="a"`)。
     */
    private parseJsxAttribute() {


    }

    /**
     * 解析一个 JSX 文本(`{...}`)。
     */
    private parseJsxText() {

    }

    /**
     * 解析一个 JSX 表达式(`{...}`)。
     */
    private parseJsxExpression() {

    }

    /**
     * 解析一个 JSX 关闭元素(`{...}`)。
     */
    private parseJsxClosingElement() {

    }



    // #endregion

    // #region 类型

    private parseTypeNode(): nodes.TypeNode {
        switch (this.lexer.peek()) {

        }
    }

    /**
     * 解析一个泛型参数列表。
     * @param ignoreError 如果解析出现错误则返回空。
     */
    private parseTypeArguments(ignoreError: boolean): any {

    }

    /**
     * 解析一个类型表达式的剩余部分。
     */
    private parseTypeExprssionRest(parsedIdentifier: nodes.Identifier) {

    }

    //    /// <summary>
    //    /// 解析以标识符开头的类型。
    //    /// </summary>
    //    /// <param name="parsedIdentifier"></param>
    //    /// <returns></returns>
    //    private Expression parseType(Identifier parsedIdentifier, TypeUsage typeUsage) {
    //    var parsed = parseTypeExpression(parsedIdentifier, typeUsage);

    //    while (readToken(TokenType.period)) {
    //        parsed = parseArrayTypeExpression(new MemberCallExpression() {
    //            target = parsed,
    //            argument = parseGenericTypeExpression(expectIdentifier(), typeUsage)
    //        }, typeUsage);
    //    }

    //    return parsed;
    //}

    //        /// <summary>
    //        /// 尝试组合当前类型为复合类型表达式。
    //        /// </summary>
    //        /// <param name="parsedIdentifier"></param>
    //        /// <param name="typeUsage"></param>
    //        /// <returns></returns>
    //        private Expression parseTypeExpression(Identifier parsedIdentifier, TypeUsage typeUsage) {
    //    return parseArrayTypeExpression(parseGenericTypeExpression(parsedIdentifier, typeUsage), typeUsage);
    //}

    //        /// <summary>
    //        /// 尝试组合当前类型为数组类型。
    //        /// </summary>
    //        /// <param name="parsed"></param>
    //        /// <param name="typeUsage"></param>
    //        /// <returns></returns>
    //        private Expression parseArrayTypeExpression(Expression parsed, TypeUsage typeUsage) {

    //    while (true) {
    //        switch (lexer.peek().type) {
    //            case TokenType.lBrack:

    //                // new 表达式中不解析数组类型。
    //                if (typeUsage == TypeUsage.@new) {
    //                    return parsed;
    //                }
    //                if (typeUsage != TypeUsage.type) {

    //                    // 判断 [ 是索引还是数组类型。
    //                    lexer.mark();
    //                    do {
    //                        lexer.markRead();
    //                    } while (lexer.markPeek().type == TokenType.comma);
    //                    if (lexer.markPeek().type != TokenType.rBrack) {
    //                        goto default;
    //        }
    //    }

    //    lexer.read(); // [

    //    int rank = 1;
    //    while (readToken(TokenType.comma))
    //        rank++;

    //    expectToken(TokenType.rBrack, ErrorCode.expectedRBrack);
    //    parsed = new ArrayTypeExpression() {
    //        elementType = parsed,
    //            //rank = rank,
    //            endLocation = lexer.current.endLocation
    //    };
    //    continue;
    //                    case TokenType.mul:
    //    if (typeUsage == TypeUsage.expression) {
    //        lexer.mark();
    //        lexer.markRead();

    //        // 如果紧跟表达式，则 * 解析为乘号。
    //        if (lexer.markRead().type.isExpressionStart()) {
    //            goto default;
    //        }
    //    }
    //    parsed = new PtrTypeExpression() {
    //        elementType = parsed,
    //            endLocation = lexer.read().endLocation
    //    };
    //    continue;
    //                    default:
    //    return parsed;
    //}
    //            }

    //        }

    //        /// <summary>
    //        /// 尝试组合当前类型为泛型。
    //        /// </summary>
    //        /// <param name="parsed"></param>
    //        /// <param name="typeUsage"></param>
    //        /// <returns></returns>
    //        private Expression parseGenericTypeExpression(Identifier parsedIdentifier, TypeUsage typeUsage) {

    //    if (lexer.peek().type == TokenType.lt) {

    //        // 判断 < 是小于号还是泛型参数。
    //        if (typeUsage != TypeUsage.type) {
    //            lexer.mark();
    //            if (!markReadGenericTypeExpression()) {
    //                return parsedIdentifier;
    //            }
    //        }

    //        lexer.read(); // <

    //        var result = new GenericTypeExpression();
    //        result.elementType = parsedIdentifier;
    //        result.genericArguments = new List<Expression>();
    //        do {
    //            if (lexer.peek().type == TokenType.comma || lexer.peek().type == TokenType.gt) {
    //                result.genericArguments.Add(null);
    //                continue;
    //            }
    //            result.genericArguments.Add(parseType());
    //        } while (readToken(TokenType.comma));

    //        expectToken(TokenType.gt, ErrorCode.expectedGt);
    //        result.endLocation = lexer.current.endLocation;
    //        return result;
    //    }

    //    return parsedIdentifier;
    //}

    //        /// <summary>
    //        /// 判断一个类型之后是否存在泛型参数。
    //        /// </summary>
    //        /// <returns></returns>
    //        private bool markReadGenericTypeExpression() {

    //    Debug.Assert(lexer.markPeek().type == TokenType.@lt);

    //    do {

    //        lexer.markRead(); // <, ,

    //        // 允许直接结束。
    //        if (lexer.markPeek().type == TokenType.gt) {
    //            break;
    //        }

    //        // 如果紧跟的不是类型，则不是类型。
    //        if (!markReadType()) {
    //            return false;
    //        }

    //    } while (lexer.markPeek().type == TokenType.comma);

    //    // 如果是 > 说明一切顺利。
    //    return lexer.markRead().type == TokenType.gt;
    //}

    //        /// <summary>
    //        /// 判断一个类型之后是否是数组类型。
    //        /// </summary>
    //        /// <returns></returns>
    //        private bool markReadArrayTypeExpression() {

    //    Debug.Assert(lexer.markPeek().type == TokenType.lBrack);

    //    lexer.markRead(); // [

    //    // 跳过逗号。
    //    while (lexer.markPeek().type == TokenType.comma) {
    //        lexer.markRead();
    //    }

    //    return lexer.markRead().type == TokenType.rBrack;

    //}

    //        private bool markReadType() {
    //    var type = lexer.markRead().type;

    //    if (type == TokenType.identifier) {
    //        if (lexer.markPeek().type == TokenType.lt && !markReadGenericTypeExpression()) {
    //            return false;
    //        }
    //    } else if (!type.isPredefinedType()) {
    //        return false;
    //    }

    //    // 读取类型数组和指针组合。
    //    while (true) {
    //        switch (lexer.markPeek().type) {
    //            case TokenType.lBrack:
    //                if (!markReadArrayTypeExpression()) {
    //                    return false;
    //                }
    //                continue;
    //            case TokenType.mul:
    //                lexer.markRead();
    //                continue;
    //            case TokenType.period:
    //                lexer.markRead();
    //                if (lexer.markRead().type != TokenType.identifier) {
    //                    return false;
    //                }
    //                continue;
    //            default:
    //                return true;
    //        }
    //    }

    //}

    /**
     * 解析一个简单类型节点(`number`、`string`、...)。
     * @param node 要解析的节点。
     */
    private parseSimpleTypeNode(node: nodes.SimpleTypeNode) {

    }

    /**
     * 解析一个泛型节点(`Array<T>`)。
     * @param node 要解析的节点。
     */
    private parseGenericTypeNode(node: nodes.GenericTypeNode) {
        node.element.accept(this);
        node.typeArguments.accept(this);
    }

    /**
     * 解析一个数组类型节点(`T[]`)。
     * @param node 要解析的节点。
     */
    private parseArrayTypeNode(node: nodes.ArrayTypeNode) {
        node.element.accept(this);
    }

    /**
     * 解析一个函数类型节点(`()=>void`)。
     * @param node 要解析的节点。
     */
    private parseFunctionTypeNode(node: nodes.FunctionTypeNode) {
        node.typeParameters && node.typeParameters.accept(this);
    }

    /**
     * 解析一个构造函数类型节点(`new ()=>void`)。
     * @param node 要解析的节点。
     */
    private parseConstructorTypeNode(node: nodes.ConstructorTypeNode) {

    }

    /**
     * 解析一个联合类型节点(`number | string`)。
     * @param node 要解析的节点。
     */
    private parseUnionTypeNode(node: nodes.UnionTypeNode) {

    }

    /**
     * 解析一个交错类型节点(`number & string`)。
     * @param node 要解析的节点。
     */
    private parseIntersectionTypeNode(node: nodes.IntersectionTypeNode) {

    }

    /**
     * 解析一个对象类型节点(`{x: string}`)。
     * @param node 要解析的节点。
     */
    private parseObjectTypeNode(node: nodes.ObjectTypeNode) {

    }

    /**
     * 解析一个类型查询节点(`typeof x`)。
     * @param node 要解析的节点。
     */
    private parseTypeQueryNode(node: nodes.TypeQueryNode) {

    }

    /**
     * 解析一个括号类型节点(`(number)`)。
     * @param node 要解析的节点。
     */
    private parseParenthesizedTypeNode(node: nodes.ParenthesizedTypeNode) {
        node.body.accept(this);
    }

    /**
     * 解析一个表达式类型节点(`"abc"`、`true`)。
     * @param node 要解析的节点。
     */
    private parseExpressionTypeNode(node: nodes.ExpressionTypeNode) {

    }

    /**
     * 解析一个限定名称类型节点(`"abc"`、`true`)。
     * @param node 要解析的节点。
     */
    private parseQualifiedNameTypeNode(node: nodes.QualifiedNameTypeNode) {

    }

    /**
     * 解析一个类型别名声明(`type A = number`)。
     * @param node 要解析的节点。
     */
    private parseTypeAliasDeclaration(node: nodes.TypeAliasDeclaration) {

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

    disallowIn,

    disallowComma,

    disdisallowIn,

}