/**
 * @fileOverview 语法解析器
 * @author xuld@vip.qq.com
 */

import {CharCode} from './unicode';
import * as tokens from './tokens';
import {TextRange} from './location';
import * as nodes from './nodes';
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

    // #endregion

    // #region 表达式

    // #endregion

    // #region 语句

    // #endregion

    // #region 声明

    // #endregion

    // #region 文档注释

    private parseJsDocComment(result) {

    }

    // #endregion

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
