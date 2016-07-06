/**
 * @fileOverview 词法解析器
 * @author xuld@vip.qq.com
 */

import {TokenType, stringToToken} from '../ast/tokenType';
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
    source: string;

    /**
     * 获取正在解析的源码开始位置。
     */
    pos: number;

    /**
     * 设置要解析的源码。
     * @param text 要解析的源码文本。
     * @param start 解析的源码开始位置。
     */
    setSource(text: string, start = 0) {
        this.source = text;
        this.pos = start;
        delete this.comments;

        // 跳过开头的 #! 部分。
        if (options.skipShebang !== false) {
            this.skipShebang();
        }

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
    stashSave() {
        this.stash = this.current;
    }

    /**
     * 恢复之前保存的进度。
     */
    stashRestore() {
        this.current = this.stash;
        delete this.stash;
    }

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
     * 跳过开头的 #! 标记。
     */
    private skipShebang() {
        if (this.source.charCodeAt(this.pos) === CharCode.hash && this.source.charCodeAt(this.pos + 1) === CharCode.exclamation) {
            this.pos += 2;
            this.skipLine();
        }
    }

    /**
     * 跳过当前行剩下的所有字符。
     */
    private skipLine() {
        while (this.pos < this.source.length && !Unicode.isLineTerminator(this.source.charCodeAt(this.pos))) {
            this.pos++;
        }
    }

    /**
     * 从源码扫描下一个标记。
     * @returns 返回解析的标记对象。
     */
    private scan() {

        console.assert(this.source != null, "应先调用“setSource()”设置源码内容。");

        const result = <Token>{};

        while (true) {
            if (this.pos >= this.sourceEnd) {
                result.type = TokenType.endOfFile;
                break;
            }
            let ch = this.source.charCodeAt(result.start = this.pos++);

            // 标识符, 关键字
            if (ch >= CharCode.a && ch <= CharCode.z) {
                result.data = this.scanIdentifier();
                result.type = stringToToken(result.data);
                break;
            }

            switch (ch) {

                // \s, \t
                case CharCode.space:
                case CharCode.horizontalTab:
                    // 加速连续空格解析。
                    while (Unicode.isWhiteSpace(this.pos)) {
                        this.pos++;
                    }
                    continue;

                // \r, \n
                case CharCode.carriageReturn:
                case CharCode.lineFeed:
                    result.onNewLine = true;
                    continue;

                // /, //, /*, /=
                case CharCode.slash:
                    switch (this.source.charCodeAt(this.pos)) {
                        case CharCode.slash:
                            const singleCommentStart = ++this.pos;
                            this.skipLine();
                            if (options.parseComments & ParseCommentsOption.singleLine) {
                                this.comments.push({ start: singleCommentStart, end: this.pos });
                            }
                            continue;
                        case CharCode.asterisk:
                            const multiCommentStart = ++this.pos;
                            let multiCommentEnd: number;
                            while (this.pos < this.sourceEnd) {
                                ch = this.source.charCodeAt(this.pos++);
                                if (Unicode.isLineTerminator(ch)) {
                                    result.onNewLine = true;
                                } else if (ch === CharCode.asterisk && this.source.charCodeAt(this.pos + 1) === CharCode.slash) {
                                    multiCommentEnd = this.pos - 2;
                                    this.pos++;
                                    break;
                                }
                            }
                            if (multiCommentEnd == null && options.languageVersion) {
                                this.error("多行注释未关闭；应输入“*/”。");
                            }
                            if ((options.parseComments & ParseCommentsOption.jsDoc) ? this.source.charCodeAt(multiCommentStart) === CharCode.asterisk : (options.parseComments & ParseCommentsOption.multiLine)) {
                                this.comments.push({ start: multiCommentStart, end: multiCommentEnd });
                            }
                            continue;
                        case CharCode.equals:
                            this.pos++;
                            result.type = TokenType.slashEquals;
                            break;
                        default:
                            result.type = TokenType.slash;
                            break;
                    }
                    break;

                // .1, .., ...
                case CharCode.dot:
                    if (Unicode.isDecimalDigit(this.pos)) {
                        this.pos--;
                        result.data = this.scanNumericLiteral(CharCode.num0);
                        result.type = TokenType.numericLiteral;
                        break;
                    }
                    if (this.source.charCodeAt(this.pos) === CharCode.dot) {
                        this.pos++;
                        if (this.source.charCodeAt(this.pos) === CharCode.dot) {
                            this.pos++;
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
                    switch (this.source.charCodeAt(this.pos)) {
                        case CharCode.equals:
                            this.pos++;
                            if (this.source.charCodeAt(this.pos) === CharCode.equals) {
                                this.pos++;
                                result.type = TokenType.equalsEqualsEquals;
                                break;
                            }
                            result.type = TokenType.equalsEquals;
                        case CharCode.greaterThan:
                            this.pos++;
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
                    result.data = this.scanStringLiteral(ch);
                    result.type = TokenType.stringLiteral;
                    break;

                // `
                case CharCode.backtick:
                    result.data = this.scanStringLiteral(ch);
                    result.type = this.source.charCodeAt(this.pos - 1) === CharCode.openBrace ? TokenType.templateHead : TokenType.noSubstitutionTemplateLiteral;
                    break;

                // +, ++, +=
                case CharCode.plus:
                    switch (this.source.charCodeAt(this.pos)) {
                        case CharCode.plus:
                            this.pos++;
                            result.type = TokenType.plusPlus;
                            break;
                        case CharCode.equals:
                            this.pos++;
                            result.type = TokenType.plusEquals;
                            break;
                        default:
                            result.type = TokenType.plus;
                            break;
                    }
                    break;

                // -, --, -=
                case CharCode.minus:
                    switch (this.source.charCodeAt(this.pos)) {
                        case CharCode.minus:
                            this.pos++;
                            result.type = TokenType.minusMinus;
                            break;
                        case CharCode.equals:
                            this.pos++;
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
                    if (this.pos < this.sourceEnd && this.source.charCodeAt(this.pos) === CharCode.equals) {
                        this.pos++;
                        if (this.pos < this.sourceEnd && this.source.charCodeAt(this.pos) === CharCode.equals) {
                            this.pos++;
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
                    if (this.pos < this.sourceEnd && this.source.charCodeAt(this.pos) === TokenType.equals) {
                        this.pos++;
                        result.type = TokenType.percentEquals;
                        break;
                    }
                    result.type = TokenType.percent;
                    break;

                // &, &&, &=
                case CharCode.ampersand:
                    switch (this.source.charCodeAt(this.pos)) {
                        case CharCode.ampersand:
                            this.pos++;
                            result.type = TokenType.ampersandAmpersand;
                            break;
                        case CharCode.equals:
                            this.pos++;
                            result.type = TokenType.ampersandEquals;
                            break;
                        default:
                            result.type = TokenType.ampersand;
                            break;
                    }
                    break;

                // *, **, **=, *=
                case CharCode.asterisk:
                    switch (this.source.charCodeAt(this.pos)) {
                        case CharCode.asterisk:
                            if (this.source.charCodeAt(++this.pos) === CharCode.equals) {
                                this.pos++;
                                result.type = TokenType.asteriskAsteriskEquals;
                                break;
                            }
                            result.type = TokenType.asteriskAsterisk;
                            break;
                        case CharCode.equals:
                            this.pos++;
                            result.type = TokenType.asteriskEquals;
                            break;
                        default:
                            result.type = TokenType.asterisk;
                            break;
                    }
                    break;

                // <, <<, <<=, <=
                case CharCode.lessThan:
                    switch (this.source.charCodeAt(this.pos)) {
                        case CharCode.lessThan:
                            if (this.source.charCodeAt(++this.pos) === CharCode.equals) {
                                this.pos++;
                                result.type = TokenType.lessThanLessThanEquals;
                                break;
                            }
                            result.type = TokenType.lessThanLessThan;
                            break;
                        case CharCode.equals:
                            this.pos++;
                            result.type = TokenType.lessThanEquals;
                            break;
                        default:
                            result.type = TokenType.lessThan;
                            break;
                    }
                    break;

                // >, >=, >>, >>=, >>>, >>>=
                case CharCode.greaterThan:
                    switch (this.source.charCodeAt(this.pos)) {
                        case CharCode.equals:
                            this.pos++;
                            result.type = TokenType.greaterThanEquals;
                            break;
                        case CharCode.greaterThan:
                            switch (this.source.charCodeAt(++this.pos)) {
                                case CharCode.equals:
                                    this.pos++;
                                    result.type = TokenType.greaterThanGreaterThanEquals;
                                    break;
                                case CharCode.greaterThan:
                                    if (this.source.charCodeAt(++this.pos) === CharCode.equals) {
                                        this.pos++;
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
                    switch (this.source.charCodeAt(this.pos)) {
                        case CharCode.equals:
                            this.pos++;
                            result.type = TokenType.barEquals;
                            break;
                        case CharCode.bar:
                            this.pos++;
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
                    if (this.source.charCodeAt(this.pos) === TokenType.caretEquals) {
                        this.pos++;
                        result.type = TokenType.caretEquals;
                        break;
                    }
                    result.type = TokenType.caret;
                    break;

                // \u0000
                case CharCode.backslash:
                    if (this.source.charCodeAt(this.pos) === CharCode.u) {
                        this.pos++;
                        ch = this.scanDights(16, 4);
                        if (Unicode.isIdentifierStart(ch)) {
                            result.data = this.scanIdentifier(ch);
                            if ((options.languageVersion === LanguageVersion.javaScript3 || options.languageVersion === LanguageVersion.javaScript) && stringToToken(result.data) !== TokenType.identifier) {
                                this.error("关键字不能使用 Unicode 编码表示。");
                            }
                            result.type = TokenType.identifier;
                            break;
                        }
                    }
                    this.error("非法字符：“{0}”。", '#');
                    continue;

                // #
                case CharCode.hash:
                    if (options.languageVersion === LanguageVersion.tealScript) {
                        this.skipLine();
                        continue;
                    }

                // 继续执行。
                default:

                    // 数字。
                    if (Unicode.isDecimalDigit(ch)) {
                        result.data = this.scanNumericLiteral(ch);
                        result.type = TokenType.numericLiteral;
                        break;
                    }

                    // 标识符。
                    if (Unicode.isIdentifierStart(ch)) {
                        result.data = this.scanIdentifier();
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
                    this.error("非法字符：“{0}”。", String.fromCharCode(ch));
                    continue;

            }

        }

        result.end = this.pos;
        return result;

    }

    /**
     * 扫描紧跟的标识符。
     * @param currentChar 当前已读取的字符。如果不传递则直接从当前位置获取。
     */
    private scanIdentifier(currentChar?: number) {

        let result: string;
        let start = this.pos;
        while (this.pos < this.sourceEnd) {
            const ch = this.source.charCodeAt(this.pos);
            if (!Unicode.isIdentifierPart(ch)) {
                if (ch === CharCode.backslash) {

                    // 处理反斜杠之前的标识符部分。
                    if (result == undefined) {
                        if (currentChar == undefined) {
                            start--;
                            result = "";
                        } else {
                            result = String.fromCharCode(currentChar);
                        }
                    }
                    result += this.source.substring(start, this.pos);

                    // 处理转义字符。
                    if (++this.pos < this.sourceEnd &&
                        this.source.charCodeAt(this.pos) === CharCode.u) {
                        this.pos++;
                        result += String.fromCharCode(this.scanDights(16, 4));
                    } else {
                        this.error("非法字符：“{0}”。", '\\');
                    }

                    // 继续处理剩下的识符部分。
                    start = this.pos;
                    continue;
                }
                break;
            }
            this.pos++;
        }

        // 如果 result 为空说明未出现过 \u0000 转义字符。
        return result != undefined ?
            result + this.source.substring(start, this.pos) :
            currentChar == undefined ?
                this.source.substring(start - 1, this.pos) :
                String.fromCharCode(currentChar) + this.source.substring(start, this.pos);
    }

    /**
     * 扫描紧跟的字符串。
     * @param currentChar 当前已读取的字符。只能是 '、" 或 `。
     */
    private scanStringLiteral(currentChar: number) {

        // ''' 多行不转义字符串。
        if (options.languageVersion === LanguageVersion.tealScript &&
            this.pos + 2 < this.sourceEnd &&
            this.source.charCodeAt(this.pos + 1) === currentChar &&
            this.source.charCodeAt(this.pos) === currentChar) {
            let start = this.pos += 2;
            for (; this.pos < this.sourceEnd; this.pos++) {
                if (this.pos + 2 < this.sourceEnd &&
                    this.source.charCodeAt(this.pos) === currentChar &&
                    this.source.charCodeAt(this.pos + 1) === currentChar &&
                    this.source.charCodeAt(this.pos + 2) === currentChar) {
                    const end = this.pos;
                    this.pos += 3;
                    return this.source.substring(start, end);
                }
            }
            if (options.skipUnterminatedLiteral === false) {
                this.error("字符串未关闭；应输入“{0}”", String.fromCharCode(currentChar) + String.fromCharCode(currentChar) + String.fromCharCode(currentChar));
            }
            return this.source.substring(start, this.pos);
        }

        // 普通字符串和模板字符串。
        let result = "";
        let start = this.pos;
        while (this.pos < this.sourceEnd) {
            let ch = this.source.charCodeAt(this.pos);
            switch (ch) {
                case currentChar:
                    return result + this.source.substring(start, this.pos++);
                case CharCode.backslash:
                    result += this.source.substring(start, this.pos++);
                    if (this.pos >= this.sourceEnd) {
                        this.error("应输入转义字符。");
                        return result;
                    }
                    ch = this.source.charCodeAt(this.pos++);
                    switch (ch) {
                        case CharCode.singleQuote:
                            result += '\'';
                            break;
                        case CharCode.doubleQuote:
                            result += '\"';
                            break;
                        case CharCode.backtick:
                            result += '`';
                            break;
                        case CharCode.n:
                            result += '\n';
                            break;
                        case CharCode.r:
                            result += '\r';
                            break;
                        case CharCode.num0:
                            result += '\0';
                            break;
                        case CharCode.t:
                            result += '\t';
                            break;
                        case CharCode.u:
                            // \u{00000000}
                            if (options.languageVersion !== LanguageVersion.javaScript3 &&
                                ++this.pos < this.sourceEnd &&
                                this.source.charCodeAt(this.pos) === CharCode.openBrace) {
                                ch = this.scanDights(16);
                                if (ch > 0x10FFFF) {
                                    this.error("扩展 Unicode 字符必须在 0x0 到 0x10FFFF 之间");
                                    break;
                                }
                                result += ch <= 65535 ? String.fromCharCode(ch) : String.fromCharCode(Math.floor((ch - 65536) / 1024) + 0xD800, ((ch - 65536) % 1024) + 0xDC00);
                                if (this.pos >= this.sourceEnd || this.source.charCodeAt(this.pos) !== CharCode.closeBrace) {
                                    this.error("扩展 Unicode 字符未关闭；应输入“}”");
                                    break;
                                }
                                this.pos++;
                            } else {
                                result += String.fromCharCode(this.scanDights(16, 4));
                            }
                            break;
                        case CharCode.x:
                            result += String.fromCharCode(this.scanDights(16, 2));
                            break;
                        case CharCode.b:
                            result += '\b';
                            break;
                        case CharCode.v:
                            result += '\v';
                            break;
                        case CharCode.f:
                            result += '\f';
                            break;
                        case CharCode.carriageReturn:
                            if (this.source.charCodeAt(this.pos) === CharCode.lineFeed) {
                                this.pos++;
                            }
                        // 继续执行。
                        case CharCode.lineFeed:
                        case CharCode.lineSeparator:
                        case CharCode.paragraphSeparator:
                            break;
                        default:
                            result += String.fromCharCode(ch);
                            break;
                    }
                    start = this.pos;
                    continue;
                case CharCode.dollar:
                    this.pos++;
                    // 模板字符串中的 ${ 。
                    if (currentChar === CharCode.backtick &&
                        this.pos < this.sourceEnd &&
                        this.source.charCodeAt(this.pos) === CharCode.openBrace) {
                        return result + this.source.substring(start, this.pos++ - 1);
                    }
                    continue;
                case CharCode.carriageReturn:
                    // 仅在模板字符串内部可换行。换行符 \r 和 \r\n 转 \n。
                    if (currentChar === CharCode.backtick) {
                        result += this.source.substring(start, this.pos++) + "\n";
                        if (this.source.charCodeAt(this.pos) === CharCode.lineFeed) {
                            this.pos++;
                        }
                        start = this.pos;
                        continue;
                    }
                    break;
                case CharCode.lineFeed:
                    // 仅在模板字符串内部可换行。
                    if (currentChar === CharCode.backtick) {
                        result += this.source.substring(start, this.pos++) + "\n";
                        start = this.pos;
                        continue;
                    }
                    break;
            }
            if (Unicode.isLineTerminator(ch)) {
                break;
            }
            this.pos++;
        }

        this.error("字符串未关闭；应输入“{0}”。", String.fromCharCode(currentChar));
        return result + this.source.substring(start, this.pos);
    }

    /**
     * 扫描紧跟的数字部分。
     * @param currentChar 当前已读取的数字字符。
     */
    private scanNumericLiteral(currentChar: number) {

        // 0x00, 0O00, 0b00
        if (currentChar === CharCode.num0 && this.pos < this.sourceEnd) {
            switch (this.source.charCodeAt(this.pos++)) {
                case CharCode.x:
                case CharCode.X:
                    return this.scanDights(16);
                case CharCode.b:
                case CharCode.B:
                    return this.scanDights(2);
                case CharCode.o:
                case CharCode.O:
                    return this.scanDights(8);
                default:
                    this.pos--;
            }
        }

        // 读取整数部分。
        let result = currentChar - CharCode.num0;
        while (this.pos < this.sourceEnd) {
            const num = this.source.charCodeAt(this.pos) - CharCode.num0;
            if (num >= 0 && num <= 9) {
                this.pos++;
                result = result * 10 + num;
            } else {
                break;
            }
        }

        // 读取小数部分。
        if (this.source.charCodeAt(this.pos) === CharCode.dot) {
            this.pos++;
            let p = 1;
            while (this.pos < this.sourceEnd) {
                const num = this.source.charCodeAt(this.pos) - CharCode.num0;
                if (num >= 0 && num <= 9) {
                    this.pos++;
                    result += num / p;
                    p *= 10;
                } else {
                    break;
                }
            }
        }

        // 读取科学计数法部分。
        switch (this.source.charCodeAt(this.pos)) {
            case CharCode.e:
            case CharCode.E:
                let base: number;
                switch (++this.pos < this.sourceEnd ? this.source.charCodeAt(this.pos) : undefined) {
                    case CharCode.minus:
                        this.pos++;
                        base = -this.scanDights(10);
                        break;
                    case CharCode.plus:
                        this.pos++;
                    // 继续执行
                    default:
                        base = this.scanDights(10);
                        break;
                }
                result *= 10 ** base;
                break;
        }

        return result;
    }

    /**
     * 扫描紧跟的数字字符。
     * @param base 进制基数。可以是 2、8、10 或 16。
     * @param count 要求的解析字数。如果未传递则不限制。
     * @return 返回解析的数值。
     */
    private scanDights(base: number, count?: number) {
        let result = 0;
        const start = this.pos;
        const end = count == undefined ? this.sourceEnd : this.pos + count;
        while (this.pos < this.sourceEnd) {
            let num = this.source.charCodeAt(this.pos);
            num = base <= 9 || num >= CharCode.num0 && num <= CharCode.num9 ? num - CharCode.num0 :
                num >= CharCode.A && num <= CharCode.Z ? 10 + num - CharCode.A :
                    num >= CharCode.a && num <= CharCode.z ? 10 + num - CharCode.a : -1;
            if (num >= 0 && num < base) {
                this.pos++;
                result = result * base + num;
            } else {
                break;
            }
        }
        if (start === this.pos || count != undefined && this.pos - start !== count) {
            this.error(base === 2 ? "应输入二进制数字" : base === 8 ? "应输入八进制数字" : base === 16 ? "应输入十六进制数字" : "应输入数字");
        }
        return result;
    }

    // #endregion

    // #region 延时解析

    readAsRegExpLiteral(currentChar: number) {

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
     * 判断当前标记之前是否存在换行符。如果不存在换行符则返回 undefined。
     */
    onNewLine?: boolean;

    /**
     * 获取当前标记相关的数据。如果当前标记不存在数据则返回 undefined。
     */
    data?: any;

}
