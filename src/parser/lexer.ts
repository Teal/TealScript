/**
 * @fileOverview 词法解析器
 * @author xuld@vip.qq.com
 */

import {TokenType, identifierToKeyword} from '../ast/tokenType';
import {options, error, ErrorType, LanguageVersion, ParseCommentsOption} from '../compiler/compiler';
import {CharCode} from './charCode';
import * as Unicode from './unicode';

/**
 * 表示一个词法解析器。
 * @description 词法解析器可以将源码解析成多个标记的序列。
 */
export class Lexer {

    // #region 接口

    /**
     * 获取正在解析的源码文本。
     */
    sourceText: string;

    /**
     * 获取正在解析的源码开始位置。
     */
    sourceStart: number;

    /**
     * 获取正在解析的源码结束位置。
     */
    sourceEnd: number;

    /**
     * 设置要解析的源码。
     * @param text 要解析的源码文本。
     * @param start 解析的源码开始位置。
     * @param end 解析的源码结束位置。
     */
    setSource(text: string, start = 0, end = text.length) {
        this.sourceText = text;
        this.sourceStart = start;
        this.sourceEnd = end;

        // 预读第一个标记。
        const firstToken = this.scan();
        firstToken.onNewLine = true;
        this.current = {
            _next: firstToken,
            type: TokenType.unknown,
            start: start,
            end: start,
            onNewLine: true,
        };
    }

    /**
     * 获取已解析的所有注释。如果未启用注释解析则返回 undefined。
     */
    comments: {

        /**
         * 获取当前注释的开始位置。
         */
        start: number,

        /**
         * 获取当前注释的结束位置。
         */
        end: number

    }[];

    /**
     * 获取当前的标记。
     */
    current: Token;

    /**
     * 预览下一个标记。
     * @returns 返回一个标记对象。
     */
    peek() {
        return this.current._next;
    }

    /**
     * 读取下一个标记。
     * @returns 返回一个标记对象。
     */
    read() {
        const next = this.current._next;
        if (next._next == null) {
            next._next = this.scan();
        }
        return this.current = next;
    }

    /**
     * 存储临时缓存的标记。
     */
    private stash: Token;

    /**
     * 保存当前读取的进度。保存之后可以通过 {@link stashRestore} 恢复进度。
     */
    stashSave() { this.stash = this.current; }

    /**
     * 恢复之前保存的进度。
     */
    stashRestore() { this.current = this.stash; }

    // #endregion

    // #region 解析

    /**
     * 报告一个词法解析错误。
     * @param message 错误的信息。
     * @param args 格式化信息的参数。
     */
    error(message: string, ...args: any[]) {
        error(ErrorType.lexical, message, ...args);
    }

    /**
     * 从源码扫描下一个标记。
     * @returns 返回解析的标记对象。
     */
    private scan() {

        console.assert(this.sourceText != null, "应先调用“setSource()”设置源码内容。");

        const result = <Token>{
            onNewLine: false
        };

        while (this.sourceStart < this.sourceEnd) {
            let ch = this.sourceText.charCodeAt(result.start = this.sourceStart++);

            // 标识符, 关键字
            if (ch >= CharCode.a && ch <= CharCode.z) {
                result.data = this.scanIdentifierBody(ch);
                result.type = identifierToKeyword(result.data);
                break;
            }

            switch (ch) {

                // \s, \t
                case CharCode.space:
                case CharCode.horizontalTab:
                    continue;

                // \r, \n
                case CharCode.carriageReturn:
                case CharCode.lineFeed:
                    result.onNewLine = true;
                    continue;

                // /, //, /*, /=
                case CharCode.slash:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case CharCode.slash:
                            const singleCommentStart = ++this.sourceStart;
                            while (this.sourceStart < this.sourceEnd && !Unicode.isLineTerminator(this.sourceText.charCodeAt(this.sourceStart))) {
                                this.sourceStart++;
                            }
                            if (options.parseComments & ParseCommentsOption.singleLine) {
                                this.comments.push({ start: singleCommentStart, end: this.sourceStart });
                            }
                            continue;
                        case CharCode.asterisk:
                            const multiCommentStart = ++this.sourceStart;
                            let multiCommentEnd: number;
                            while (this.sourceStart < this.sourceEnd) {
                                ch = this.sourceText.charCodeAt(this.sourceStart++);
                                if (Unicode.isLineTerminator(ch)) {
                                    result.onNewLine = true;
                                } else if (ch === CharCode.asterisk && this.sourceText.charCodeAt(this.sourceStart + 1) === CharCode.slash) {
                                    multiCommentEnd = this.sourceStart - 2;
                                    this.sourceStart++;
                                    break;
                                }
                            }
                            if (multiCommentEnd == null && options.languageVersion) {
                                this.error("多行注释未关闭；应输入“*/”。");
                            }
                            if ((options.parseComments & ParseCommentsOption.jsDoc) ? this.sourceText.charCodeAt(multiCommentStart) === CharCode.asterisk : (options.parseComments & ParseCommentsOption.multiLine)) {
                                this.comments.push({ start: multiCommentStart, end: multiCommentEnd });
                            }
                            continue;
                        case CharCode.equals:
                            this.sourceStart++;
                            result.type = TokenType.slashEquals;
                            break;
                        default:
                            result.type = TokenType.slash;
                            break;
                    }
                    break;

                // .1, .., ...
                case CharCode.dot:
                    if (Unicode.isDecimalDigit(this.sourceStart)) {
                        result.data = this.scanFloatDights(0);
                        result.type = TokenType.numericLiteral;
                        break;
                    }
                    if (this.sourceText.charCodeAt(this.sourceStart) === CharCode.dot) {
                        this.sourceStart++;
                        if (this.sourceText.charCodeAt(this.sourceStart) === CharCode.dot) {
                            this.sourceStart++;
                            result.type = TokenType.dotDotDot;
                            break;
                        }
                        result.type = TokenType.dotDot;
                        break;
                    }
                    result.type = TokenType.dot;
                    break;

                // (
                case CharCode.openParen:
                    result.type = TokenType.openParen;
                    break;

                // )
                case CharCode.closeParen:
                    result.type = TokenType.closeParen;
                    break;

                // {
                case CharCode.openBrace:
                    result.type = TokenType.openBrace;
                    break;

                // }
                case CharCode.closeBrace:
                    result.type = TokenType.closeBrace;
                    break;

                // ;
                case CharCode.semicolon:
                    result.type = TokenType.semicolon;
                    break;

                // =, ==, ===, =>
                case CharCode.equals:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case CharCode.equals:
                            this.sourceStart++;
                            if (this.sourceText.charCodeAt(this.sourceStart) === CharCode.equals) {
                                this.sourceStart++;
                                result.type = TokenType.equalsEqualsEquals;
                                break;
                            }
                            result.type = TokenType.equalsEquals;
                        case CharCode.greaterThan:
                            this.sourceStart++;
                            result.type = TokenType.equalsGreaterThan;
                            break;
                        default:
                            result.type = TokenType.equals;
                            break;
                    }
                    break;

                // ', "
                case CharCode.singleQuote:
                case CharCode.doubleQuote:
                    result.data = this.scanStringLiteralBody(ch);
                    result.type = TokenType.stringLiteral;
                    break;

                // `
                case CharCode.backtick:
                    result.data = this.scanTemplateLiteralBody(ch);
                    result.type = this.sourceText.charCodeAt(this.sourceStart - 1) === CharCode.backtick ? TokenType.noSubstitutionTemplateLiteral : TokenType.templateHead;
                    break;

                // +, ++, +=
                case CharCode.plus:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case CharCode.plus:
                            this.sourceStart++;
                            result.type = TokenType.plusPlus;
                            break;
                        case CharCode.equals:
                            this.sourceStart++;
                            result.type = TokenType.plusEquals;
                            break;
                        default:
                            result.type = TokenType.plus;
                            break;
                    }
                    break;

                // -, --, -=
                case CharCode.minus:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case CharCode.minus:
                            this.sourceStart++;
                            result.type = TokenType.minusMinus;
                            break;
                        case CharCode.equals:
                            this.sourceStart++;
                            result.type = TokenType.minusEquals;
                            break;
                        default:
                            result.type = TokenType.minus;
                            break;
                    }
                    break;

                // ,
                case CharCode.comma:
                    result.type = TokenType.comma;
                    break;

                // :
                case CharCode.colon:
                    result.type = TokenType.colon;
                    break;

                // ?
                case CharCode.question:
                    result.type = TokenType.question;
                    break;

                // [
                case CharCode.openBracket:
                    result.type = TokenType.openBracket;
                    break;

                // ]
                case CharCode.closeBracket:
                    result.type = TokenType.closeBracket;
                    break;

                // !, !=, !==
                case CharCode.exclamation:
                    if (this.sourceText.charCodeAt(this.sourceStart) === CharCode.equals) {
                        if (this.sourceText.charCodeAt(this.sourceStart++) === CharCode.equals) {
                            this.sourceStart++;
                            result.type = TokenType.exclamationEqualsEquals;
                            break;
                        }
                        result.type = TokenType.exclamationEquals;
                        break;
                    }
                    result.type = TokenType.exclamation;
                    break;

                // %, %=
                case CharCode.percent:
                    if (this.sourceText.charCodeAt(this.sourceStart) === TokenType.equals) {
                        this.sourceStart++;
                        result.type = TokenType.percentEquals;
                        break;
                    }
                    result.type = TokenType.percent;
                    break;

                // &, &&, &=
                case CharCode.ampersand:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case CharCode.ampersand:
                            this.sourceStart++;
                            result.type = TokenType.ampersandAmpersand;
                            break;
                        case CharCode.equals:
                            this.sourceStart++;
                            result.type = TokenType.ampersandEquals;
                            break;
                        default:
                            result.type = TokenType.ampersand;
                            break;
                    }
                    break;

                // *, **, **=, *=
                case CharCode.asterisk:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case CharCode.asterisk:
                            if (this.sourceText.charCodeAt(++this.sourceStart) === CharCode.equals) {
                                this.sourceStart++;
                                result.type = TokenType.asteriskAsteriskEquals;
                                break;
                            }
                            result.type = TokenType.asteriskAsterisk;
                            break;
                        case CharCode.equals:
                            this.sourceStart++;
                            result.type = TokenType.asteriskEquals;
                            break;
                        default:
                            result.type = TokenType.asterisk;
                            break;
                    }
                    break;

                // <, <<, <<=, <=
                case CharCode.lessThan:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case CharCode.lessThan:
                            if (this.sourceText.charCodeAt(++this.sourceStart) === CharCode.equals) {
                                this.sourceStart++;
                                result.type = TokenType.lessThanLessThanEquals;
                                break;
                            }
                            result.type = TokenType.lessThanLessThan;
                            break;
                        case CharCode.equals:
                            this.sourceStart++;
                            result.type = TokenType.lessThanEquals;
                            break;
                        default:
                            result.type = TokenType.lessThan;
                            break;
                    }
                    break;

                // >, >=, >>, >>=, >>>, >>>=
                case CharCode.greaterThan:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case CharCode.equals:
                            this.sourceStart++;
                            result.type = TokenType.greaterThanEquals;
                            break;
                        case CharCode.greaterThan:
                            switch (this.sourceText.charCodeAt(++this.sourceStart)) {
                                case CharCode.equals:
                                    this.sourceStart++;
                                    result.type = TokenType.greaterThanGreaterThanEquals;
                                    break;
                                case CharCode.greaterThan:
                                    if (this.sourceText.charCodeAt(++this.sourceStart) === CharCode.equals) {
                                        this.sourceStart++;
                                        result.type = TokenType.greaterThanGreaterThanGreaterThanEquals;
                                        break;
                                    }
                                    result.type = TokenType.greaterThanGreaterThanGreaterThan;
                                    break;
                                default:
                                    result.type = TokenType.greaterThanGreaterThan;
                                    break;
                            }
                            break;
                        default:
                            result.type = TokenType.greaterThan;
                            break;
                    }
                    break;

                // |, |=, ||
                case CharCode.bar:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case CharCode.equals:
                            this.sourceStart++;
                            result.type = TokenType.barEquals;
                            break;
                        case CharCode.bar:
                            this.sourceStart++;
                            result.type = TokenType.barBar;
                            break;
                        default:
                            result.type = TokenType.bar;
                            break;
                    }
                    break;

                // ~
                case CharCode.tilde:
                    result.type = TokenType.tilde;
                    break;

                // @
                case CharCode.at:
                    result.type = TokenType.at;
                    break;

                // ^, ^=
                case CharCode.caret:
                    if (this.sourceText.charCodeAt(this.sourceStart) === TokenType.caretEquals) {
                        this.sourceStart++;
                        result.type = TokenType.caretEquals;
                        break;
                    }
                    result.type = TokenType.caret;
                    break;

                default:

                    // 数字。
                    if (Unicode.isDecimalDigit(ch)) {
                        result.data = this.scanNumericLiteralBody(ch);
                        result.type = TokenType.numericLiteral;
                        break;
                    }

                    // 标识符。
                    if (Unicode.isIdentifierStart(ch)) {
                        result.data = this.scanIdentifierBody(ch);
                        result.type = TokenType.identifier;
                        break;
                    }

                    // 空白。
                    if (Unicode.isWhiteSpace(ch)) {
                        continue;
                    }
                    if (Unicode.isLineTerminator(ch)) {
                        result.onNewLine = true;
                        continue;
                    }

                    // 剩下的字符为不支持的字符。
                    this.error("意外的字符：“{0}”。", String.fromCharCode(ch));
                    continue;

            }

        }

        result.end = this.sourceStart;
        return result;

    }

    /**
     * 扫描紧跟的标识符主体部分。
     * @param currentChar 当前已读取的字符。
     */
    private scanIdentifierBody(currentChar: number) {
        let result = "";
        if (currentChar === CharCode.backslash) {
            if (this.sourceText.charCodeAt(this.sourceStart) !== CharCode.u) {
                this.error("意外的字符：“{0}”。", '\\');
                result += "\\";
            } else {
                const num = this.scanHexDights(++this.sourceStart + 4);
                result += String.fromCharCode(num);
            }
        } else {
            result += String.fromCharCode(currentChar);
        }
        while (true) {
            const ch = this.sourceText.charCodeAt(this.sourceStart);
            if (ch === CharCode.backslash) {
                if (this.sourceText.charCodeAt(this.sourceStart) !== CharCode.u) {
                    this.error("意外的字符：“{0}”。", '\\');
                    result += "\\";
                } else {
                    const num = this.scanHexDights(++this.sourceStart + 4);
                    result += String.fromCharCode(num);
                }
                continue;
            }
            if (!Unicode.isIdentifierPart(ch)) {
                break;
            }
            this.sourceStart++;
            result += String.fromCharCode(ch);
        }
        return result;
    }

    /**
     * 扫描紧跟的数字部分。
     * @param currentChar 当前已读取的数字字符。
     */
    private scanNumericLiteralBody(currentChar: number) {

        console.assert(currentChar >= CharCode.num0 && currentChar <= CharCode.num9);

        // 0x00, 0O00, 0b00
        if (currentChar === CharCode.num0) {
            switch (this.sourceText.charCodeAt(this.sourceStart)) {
                case CharCode.x:
                case CharCode.X:
                    this.sourceStart++;
                    return this.scanHexDights(this.sourceEnd);
                case CharCode.b:
                case CharCode.B:
                    this.sourceStart++;
                    return this.scanBinaryOrOctalOrDecimalDights(2);
                case CharCode.o:
                case CharCode.O:
                    this.sourceStart++;
                    return this.scanBinaryOrOctalOrDecimalDights(8);
            }
        }

        // 读取整数部分。
        let result = currentChar - CharCode.num0;
        while (this.sourceStart < this.sourceEnd) {
            const num = this.sourceText.charCodeAt(this.sourceStart) - CharCode.num0;
            if (num >= 0 && num < 10) {
                this.sourceStart++;
                result = result * 10 + num;
            } else {
                break;
            }
        }

        // 读取小数部分。
        switch (this.sourceText.charCodeAt(this.sourceStart)) {
            case CharCode.dot:
                this.sourceStart++;
                return this.scanFloatDights(result);
            case CharCode.e:
            case CharCode.E:
                this.sourceStart++;
                return this.scanExponentDights(result);
        }

        return result;
    }

    /**
     * 扫描紧跟的浮点数字部分。
     * @param currentValue 当前已读取的数值。
     */
    private scanFloatDights(currentValue: number) {

        console.assert(this.sourceText.charCodeAt(this.sourceStart - 1) === CharCode.dot);

        // 解析小数点。
        let p = 1;
        while (this.sourceStart < this.sourceEnd) {
            const num = this.sourceText.charCodeAt(this.sourceStart) - CharCode.num0;
            if (num >= 0 && num <= 9) {
                currentValue += num / p;
                p /= 10;
            } else {
                break;
            }
        }

        // 解析 e, E。
        switch (this.sourceText.charCodeAt(this.sourceStart)) {
            case CharCode.e:
            case CharCode.E:
                this.sourceStart++;
                return this.scanExponentDights(currentValue);
        }

        return currentValue;
    }

    /**
     * 扫描紧跟的浮点数字部分。
     * @param currentValue 当前已读取的数值。
     */
    private scanExponentDights(currentValue: number) {

        console.assert((this.sourceText.charCodeAt(this.sourceStart - 1) | CharCode.space) === CharCode.e);

        switch (this.sourceText.charCodeAt(this.sourceStart)) {
            case CharCode.minus:
                this.sourceStart++;
                return currentValue * Math.pow(10, -this.scanBinaryOrOctalOrDecimalDights(10));
            case CharCode.plus:
                this.sourceStart++;
            // 继续执行
            default:
                return currentValue * Math.pow(10, this.scanBinaryOrOctalOrDecimalDights(10));
        }

    }

    /**
     * 扫描紧跟的十六进制数字。
     * @param end 扫描的终止位置。
     * @return 返回解析的数值。
     */
    private scanHexDights(end: number) {
        let result = 0;
        const start = this.sourceStart;
        while (this.sourceStart < end) {
            const ch = this.sourceText.charCodeAt(this.sourceStart);
            if (ch >= CharCode.num0 && ch <= CharCode.num9) {
                this.sourceStart++;
                result = result * 16 + ch - CharCode.num0;
            } else if (ch >= CharCode.A && ch <= CharCode.F) {
                this.sourceStart++;
                result = result * 16 + 10 + ch - CharCode.A;
            } else if (ch >= CharCode.a && ch <= CharCode.f) {
                this.sourceStart++;
                result = result * 16 + 10 + ch - CharCode.a;
            } else {
                if (start === this.sourceStart) {
                    this.error("应输入十六进制数字；实际是“{0}”", this.sourceText.charAt(this.sourceStart));
                }
                break;
            }
        }
        return result;
    }

    /**
     * 扫描紧跟的二进制或八进制数字。
     * @param base 进制基数。可以是 2 或 8。
     * @return 返回解析的数值。
     */
    private scanBinaryOrOctalOrDecimalDights(base: number) {
        let result = 0;
        const start = this.sourceStart;
        while (this.sourceStart < this.sourceEnd) {
            const num = this.sourceText.charCodeAt(this.sourceStart) - CharCode.num0;
            if (num >= 0 && num < base) {
                this.sourceStart++;
                result = result * base + num;
            } else {
                if (start === this.sourceStart) {
                    this.error(base === 2 ? "应输入二进制数字；实际是“{0}”" : base === 8 ? "应输入八进制数字；实际是“{0}”" : "应输入数字；实际是“{0}”", this.sourceText.charAt(this.sourceStart));
                }
                break;
            }
        }
        return result;
    }

    /**
     * 扫描紧跟的字符串部分。
     * @param currentChar 当前已读取的字符。
     */
    private scanStringLiteralBody(currentChar: number) {

        console.assert(currentChar === CharCode.singleQuote || currentChar === CharCode.doubleQuote);

        let result = "";

        while (this.sourceStart < this.sourceEnd) {
            const ch = this.sourceText.charCodeAt(this.sourceStart++);
            switch (ch) {
                case currentChar:
                    return result;
                case CharCode.backslash:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case CharCode.singleQuote:
                            this.sourceStart++;
                            result += '\'';
                            continue;
                        case CharCode.doubleQuote:
                            this.sourceStart++;
                            result += '\"';
                            continue;
                        case CharCode.n:
                            this.sourceStart++;
                            result += '\n';
                            continue;
                        case CharCode.r:
                            this.sourceStart++;
                            result += '\r';
                            continue;
                        case CharCode.t:
                            this.sourceStart++;
                            result += '\t';
                            continue;
                        case CharCode.u:
                            result += String.fromCharCode(this.scanHexDights(++this.sourceStart + 4));
                            continue;
                        case CharCode.x:
                            result += String.fromCharCode(this.scanHexDights(++this.sourceStart + 2));
                            continue;
                        case CharCode.num0:
                            this.sourceStart++;
                            result += '\0';
                            continue;
                        case CharCode.b:
                            this.sourceStart++;
                            result += '\b';
                            continue;
                        case CharCode.f:
                            this.sourceStart++;
                            result += '\f';
                            continue;
                        case CharCode.v:
                            this.sourceStart++;
                            result += '\v';
                            continue;
                        case CharCode.carriageReturn:
                            if (this.sourceText.charCodeAt(++this.sourceStart) === CharCode.lineFeed) {
                                this.sourceStart++;
                            }
                            continue;
                        case CharCode.lineFeed:
                            this.sourceStart++;
                            continue;
                        default:
                            continue;
                    }
            }
            if (Unicode.isLineTerminator(ch)) {
                break;
            }
            result += String.fromCharCode(ch);
        }

        this.error("字符串未关闭；应输入“{0}”", String.fromCharCode(currentChar));

        return result;
    }

    /**
     * 扫描紧跟的模板字符串部分。
     * @param currentChar 当前已读取的字符。
     */
    private scanTemplateLiteralBody(currentChar: number) {

    }

    // #endregion

}

/**
 * 表示一个标记。
 */
export interface Token {

    /**
     * 获取下一个标记。如果下一个标记未解析则返回 undefined。
     */
    _next?: Token;

    /**
     * 获取当前标记的类型。
     */
    type: TokenType;

    /**
     * 获取当前标记的开始位置。
     */
    start: number;

    /**
     * 获取当前标记的结束位置。
     */
    end: number;

    /**
     * 判断当前标记之前是否存在换行符。
     */
    onNewLine: boolean;

    /**
     * 获取当前标记相关的数据。如果当前标记不存在数据则返回 undefined。
     */
    data?: any;

}
