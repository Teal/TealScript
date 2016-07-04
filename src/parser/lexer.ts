/**
 * @fileOverview 词法解析器
 * @author xuld@vip.qq.com
 */

import {TokenType, identifierToKeyword} from '../ast/tokenType';
import {options, error, ErrorType, LanguageVersion} from '../compiler/compiler';
import {CharCode} from './charCode';
import * as Unicode from './unicode';

/**
 * 表示一个词法解析器。
 */
export class Lexer {

    // #region 接口

    /**
     * 获取正在解析的源码。
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
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param end 解析的源码结束位置。
     */
    setSource(text: string, start = 0, end = text.length) {
        this.sourceText = text;
        this.sourceStart = start;
        this.sourceEnd = end;

        // 预读第一个标记。
        this.current = {
            type: null,
            next: this.scan(),
            start: start,
            end: start,
            onNewLine: true,
            buffer: null,
        };
        this.current.next.onNewLine = true;
    }

    /**
     * 获取所有注释。如果未启用注释解析则返回 undefined。
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
        return this.current.next;
    }

    /**
     * 读取下一个标记。
     * @returns 返回一个标记对象。
     */
    read() {
        const next = this.current.next;
        if (next.next == null) {
            next.next = this.scan();
        }
        return this.current = next;
    }

    /**
     * 存储临时缓存的标记。
     */
    private stash: Token;

    /**
     * 保存当前读取的进度。
     */
    stashSave() {
        this.stash = this.current;
    }

    /**
     * 恢复当前读取的进度。
     */
    stashRestore() {
        this.current = this.stash;
    }

    // #endregion

    // #region 解析

    /**
     * 报告一个词法错误。
     * @param message 错误的信息。
     * @param args 格式化错误的参数。
     */
    error(message: string, ...args: any[]) {
        error(ErrorType.lexical, message, ...args);
    }

    /**
     * 从源中扫描下一个标记的数据并存放在 result。
     */
    private scan() {

        console.assert(this.sourceText != null, "应先调用“setSource()”设置源。");

        const result = {
            onNewLine: false
        } as Token;

        while (this.sourceStart < this.sourceEnd) {
            let ch = this.sourceText.charCodeAt(result.start = this.sourceStart++);

            // 标识符或关键字。
            if (ch >= CharCode.a && ch <= CharCode.z) {
                result.buffer = this.scanIdentifierBody(ch);
                result.type = identifierToKeyword(result.buffer);
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

                // /  // /* /=
                case CharCode.slash:
                    switch (this.sourceText.charCodeAt(this.sourceStart++)) {
                        case CharCode.slash:
                            const singleCommentStart = this.sourceStart;
                            while (this.sourceStart < this.sourceEnd && !Unicode.isLineTerminator(this.sourceText.charCodeAt(this.sourceStart))) {
                                this.sourceStart++;
                            }
                            if (options.parseComments) {
                                this.comments.push({ start: singleCommentStart, end: this.sourceStart });
                            }
                            continue;
                        case CharCode.asterisk:
                            const multiCommentStart = this.sourceStart;
                            let multiCommentEnd: number;
                            while (this.sourceStart < this.sourceEnd) {
                                ch = this.sourceText.charCodeAt(this.sourceStart);
                                if (Unicode.isLineTerminator(ch)) {
                                    result.onNewLine = true;
                                } else if (ch === CharCode.asterisk && this.sourceText.charCodeAt(this.sourceStart + 1) === CharCode.slash) {
                                    multiCommentEnd = this.sourceStart;
                                    this.sourceStart += 2;
                                    break;
                                }
                                this.sourceStart++;
                            }
                            if (multiCommentEnd == null && options.languageVersion) {
                                this.error("多行注释未关闭；应输入“*/”。");
                            }
                            if (options.parseComments) {
                                this.comments.push({ start: multiCommentStart, end: multiCommentEnd });
                            }
                            continue;
                        case CharCode.equals:
                            result.type = TokenType.slashEquals;
                            break;
                        default:
                            this.sourceStart--;
                            result.type = TokenType.slash;
                            break;
                    }

                // ', "
                case CharCode.singleQuote:
                case CharCode.doubleQuote:
                    result.buffer = this.scanStringLiteralBody(ch);
                    result.type = TokenType.stringLiteral;
                    break;

                // `
                case CharCode.backtick:
                    // todo
                    //    result.type = TokenType.stringLiteral;
                    // scanVerbatimString();
                    return result;

                // =, ==, =>
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

                // .1, .., ...
                case CharCode.dot:
                    if (Unicode.isDecimalDigit(this.sourceStart)) {
                        // todo
                        break;
                        //result.type = TokenType.;
                        //result.buffer.Length = 0;
                        //scanFloatLiteral();
                        //goto end;
                    }
                    if (this.sourceText.charCodeAt(this.sourceStart++) === CharCode.dot) {
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

                // (
                case CharCode.openParen:
                    result.type = TokenType.openParen;
                    break;

                // )
                case CharCode.closeParen:
                    result.type = TokenType.closeParen;
                    break;

                // *, **, **=, *=
                case CharCode.asterisk:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case CharCode.asterisk:
                            if (this.sourceText.charCodeAt(this.sourceStart++) === CharCode.equals) {
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

                // ,
                case CharCode.comma:
                    result.type = TokenType.comma;
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

                // /, /=
                case CharCode.slash:
                    if (this.sourceText.charCodeAt(this.sourceStart) === TokenType.equals) {
                        this.sourceStart++;
                        result.type = TokenType.slashEquals;
                        break;
                    }
                    result.type = TokenType.slash;
                    break;

                // :
                case CharCode.colon:
                    result.type = TokenType.colon;
                    break;

                // ;
                case CharCode.semicolon:
                    result.type = TokenType.semicolon;
                    break;

                // <, <<, <<=, <=
                case CharCode.lessThan:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case CharCode.lessThan:
                            if (this.sourceText.charCodeAt(this.sourceStart++) === CharCode.equals) {
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

                // =, ==, ===, =>
                case CharCode.equals:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case CharCode.equals:
                            if (this.sourceText.charCodeAt(this.sourceStart++) === CharCode.equals) {
                                this.sourceStart++;
                                result.type = TokenType.equalsEqualsEquals;
                                break;
                            }
                            result.type = TokenType.equalsEquals;
                            break;
                        case CharCode.greaterThan:
                            this.sourceStart++;
                            result.type = TokenType.equalsGreaterThan;
                            break;
                        default:
                            result.type = TokenType.equals;
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
                            switch (this.sourceText.charCodeAt(this.sourceStart++)) {
                                case CharCode.equals:
                                    this.sourceStart++;
                                    result.type = TokenType.greaterThanGreaterThanEquals;
                                    break;
                                case CharCode.greaterThan:
                                    if (this.sourceText.charCodeAt(this.sourceStart++) === CharCode.equals) {
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

                // ?
                case CharCode.question:
                    result.type = TokenType.question;
                    break;

                // @
                case CharCode.at:
                    result.type = TokenType.at;
                    break;

                // [
                case CharCode.openBracket:
                    result.type = TokenType.openBracket;
                    break;

                // ]
                case CharCode.closeBracket:
                    result.type = TokenType.closeBracket;
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

                // {
                case CharCode.openBrace:
                    result.type = TokenType.openBrace;
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

                // }
                case CharCode.closeBrace:
                    result.type = TokenType.closeBrace;
                    break;

                // ~
                case CharCode.tilde:
                    result.type = TokenType.tilde;
                    break;

                default:

                    // 数字。
                    if (Unicode.isDecimalDigit(ch)) {
                        result.buffer = this.scanNumericLiteralBody(ch);
                        result.type = TokenType.numericLiteral;
                        break;
                    }

                    // 标识符。
                    if (Unicode.isIdentifierStart(ch)) {
                        result.buffer = this.scanIdentifierBody(ch);
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

    // #endregion

    /**
     * 扫描紧跟的标识符主体部分。
     * @param ch 当前已读取的字符。
     */
    private scanIdentifierBody(ch: number) {
        const identifierStart = this.sourceStart - 1;
        while (Unicode.isIdentifierPart(this.sourceStart)) {
            this.sourceStart++;
        }
        return this.sourceText.substring(identifierStart, this.sourceStart);
    }

    /**
     * 扫描紧跟的转义字符串部分。忽略 _currentChar 值。
     */
    private scanStringLiteralBody() {

        //        // 在解析字符串变量时不能再次解析到字符串。
        //        if (_parsingStringVarableChar == currentChar) {
        //            this.error("字符串内联表达式未关闭；应输入“}”");
        //            result.type = TokenType.rBrace;
        //            return;
        //        }

        //        currentLocation.column++; // 引号。

        //        // 用于读取变量表达式时存储原始标记。
        //        Token orignalScanTargetToken = result;

        //        result.buffer.Length = 0;
        //        while (true) {
        //            _currentChar = _input.Read();
        //            parseCurrent:
        //            switch (_currentChar) {
        //                case '"':
        //                case '\'':
        //                    // 允许在 "" 字符串中不转义 ' 字符。反之亦然。
        //                    if (_currentChar != currentChar) {
        //                        goto default;
        //            }

        //            _currentChar = _input.Read();
        //            currentLocation.column++;
        //            goto end;

        //            #region 转义
        //                    case '\\':
        //            switch (_currentChar = _input.Read()) {
        //                case 'n':
        //                    _currentChar = '\n';
        //                    goto default;
        //                case 'r':
        //                    _currentChar = '\r';
        //                    goto default;
        //                case 't':
        //                    _currentChar = '\t';
        //                    goto default;
        //                case 'u':
        //                    _currentChar = readUnicodeChar(4);
        //                    goto default;
        //                case 'x':
        //                    _currentChar = readUnicodeChar(2);
        //                    goto default;
        //                case '\r':
        //                    if (_input.Peek() == '\n') {
        //                        _input.Read();
        //                    }
        //                    goto case '\n';
        //                case '\n':
        //                    newLine();
        //                    continue;
        //                case 'b':
        //                    _currentChar = '\b';
        //                    goto default;
        //                case 'f':
        //                    _currentChar = '\f';
        //                    goto default;
        //                case 'v':
        //                    _currentChar = '\v';
        //                    goto default;
        //                case '0':
        //                    _currentChar = '\0';
        //                    goto default;
        //                case -1:
        //                    orignalScanTargetToken.buffer.Append('\\');
        //                    currentLocation.column++;
        //                    continue;
        //                default:
        //                    orignalScanTargetToken.buffer.Append((char)_currentChar);
        //                    currentLocation.column += 2;
        //                    continue;
        //            }
        //            #endregion

        //                    case '\r':
        //            result.buffer.Append('\r');
        //            if (_input.Peek() == '\n') {
        //                _input.Read();
        //                goto case '\n';
        //            }
        //            newLine();
        //            continue;
        //                    case '\n':
        //            result.buffer.Append('\n');
        //            newLine();
        //            continue;
        //                    case -1:
        //            Compiler.error(ErrorCode.expectedStringLiteralEnd, String.Format("语法错误：字符串未关闭；应输入“{0}”", (char)currentChar), result.startLocation, currentLocation);
        //            goto end;

        //            #region 变量字符串
        //                    case '$':

        //            // $xxx, ${xx}
        //            if (_parsingStringVarableChar >= 0 && (Unicode.isIdentifierPart(_input.Peek()) || _input.Peek() == '{')) {

        //                // 标记之前的字符串已读取完毕。
        //                result.endLocation = currentLocation;

        //                // 第一次发现变量，生成 ("之前的字符串" + <表达式> + "之后的字符串") 标记序列。
        //                // 在 result 后插入变量。
        //                if (orignalScanTargetToken == result) {
        //                    result.next = result.clone();
        //                    result.type = TokenType.lParam;
        //                    result.endLocation = result.startLocation + 1;
        //                    result = result.next;
        //                    result.startLocation++;
        //                }

        //                // 插入 + 。
        //                result = result.next = new Token() {
        //                    type = TokenType.add,
        //                        startLocation = currentLocation,
        //                        endLocation = currentLocation,
        //                            };

        //                // $abc
        //                if (_input.Peek() != '{') {

        //                    // 插入字符串。
        //                    result = result.next = new Token();
        //                    scan();

        //                    // 插入 +。
        //                    result = result.next = new Token() {
        //                        type = TokenType.add,
        //                            startLocation = currentLocation,
        //                            endLocation = currentLocation,
        //                                };

        //                } else {

        //                    // 插入 (
        //                    result = result.next = new Token() {
        //                        type = TokenType.lParam,
        //                            startLocation = currentLocation + 1,
        //                            endLocation = currentLocation + 2,
        //                                };

        //                    // 读取 ${
        //                    _input.Read(); // {
        //                    _currentChar = _input.Read();
        //                    currentLocation.column += 2;

        //                    bool foundSomething = false;
        //                    _parsingStringVarableChar = currentChar;

        //                    // 插入 } 之前的所有标记。
        //                    while (true) {
        //                        result = result.next = new Token();
        //                        scan();
        //                        if (result.type == TokenType.rBrace) {
        //                            break;
        //                        }
        //                        if (result.type == TokenType.eof) {
        //                            goto end;
        //                        }
        //                        foundSomething = true;
        //                    }

        //                    _parsingStringVarableChar = 0;

        //                    if (!foundSomething) {
        //                        result.type = TokenType.@null;

        //                        // 插入 )
        //                        result = result.next = new Token() {
        //                            type = TokenType.rParam,
        //                                startLocation = currentLocation - 1,
        //                                endLocation = currentLocation
        //                        };

        //                    } else {
        //                        // 插入 )
        //                        result.type = TokenType.rParam;
        //                    }

        //                    // 插入 + 。
        //                    result = result.next = new Token() {
        //                        type = TokenType.add,
        //                            startLocation = result.startLocation,
        //                            endLocation = result.startLocation
        //                    };

        //                }

        //                // 插入后续字符串。
        //                result = result.next = new Token() {
        //                    type = TokenType.stringLiteral,
        //                        startLocation = currentLocation,
        //                            };
        //                goto parseCurrent;

        //            }

        //            goto default;
        //    #endregion

        //    default:
        //    result.buffer.Append((char)_currentChar);
        //    currentLocation.column++;
        //    continue;

        //}
        //}

        //end:

        //// 如果之前解析了变量字符串，则重定位开头。
        //if (orignalScanTargetToken != result) {
        //    result.endLocation = currentLocation - 1;
        //    result.next = new Token() {
        //        type = TokenType.rParam,
        //            startLocation = currentLocation - 1,
        //            endLocation = currentLocation,
        //                };
        //    result = orignalScanTargetToken;
        //    return;
        //}

        //orignalScanTargetToken.endLocation = currentLocation;
        //        }

        //        /**
        //         * 扫描紧跟的无转义字符串部分。忽略 _currentChar 值。
        //         */
        //        private void scanVerbatimString() {

        //    // 读取引号。
        //    currentLocation.column++;

        //    result.buffer.Length = 0;
        //    while (true) {
        //        switch (_currentChar = _input.Read()) {
        //            case '`':
        //                _currentChar = _input.Read();
        //                currentLocation.column++;
        //                if (_currentChar == '`') {
        //                    goto default;
        //        }
        //        return;
        //                    case '\r':
        //        result.buffer.Append('\r');
        //        if (_input.Peek() == '\n') {
        //            _input.Read();
        //            goto case '\n';
        //        }
        //        newLine();
        //        continue;
        //                    case '\n':
        //        result.buffer.Append('\n');
        //        newLine();
        //        continue;
        //                    case -1:
        //        result.endLocation = currentLocation;
        //        Compiler.error(ErrorCode.expectedStringLiteralEnd, String.Format("语法错误：字符串未关闭；应输入“{0}”", (char)'`'), result.startLocation, currentLocation);
        //        return;
        //                    default:
        //        result.buffer.Append((char)_currentChar);
        //        currentLocation.column++;
        //        continue;
        //    }
        //}

    }

    /**
     * 扫描紧跟的数字部分。
     * @param ch 当前已读取的字符。
     */
    private scanNumericLiteralBody(ch: number) {

        let result = 0;

        if (ch === CharCode.num0) {
            switch (this.sourceText.charCodeAt(this.sourceStart)) {
                case CharCode.x:
                case CharCode.X:
                    this.sourceStart++;
                    while (this.sourceStart < this.sourceEnd) {
                        ch = this.sourceText.charCodeAt(this.sourceStart);
                        if (ch >= CharCode.num0 && ch <= CharCode.num9) {
                            result = result * 16 + ch - CharCode.num0;
                        } else if (ch >= CharCode.A && ch <= CharCode.F) {
                            result = result * 16 + 10 + ch - CharCode.A;
                        } else if (ch >= CharCode.a && ch <= CharCode.f) {
                            result = result * 16 + 10 + ch - CharCode.a;
                        } else {
                            this.error("应输入十六进制数字，实际是“{0}”", String.fromCharCode(ch));
                            break;
                        }
                    }
                    return result;
                case CharCode.b:
                case CharCode.B:
                    this.sourceStart++;
                    while (this.sourceStart < this.sourceEnd) {
                        ch = this.sourceText.charCodeAt(this.sourceStart);
                        if (ch === CharCode.num0) {
                            result = result * 2;
                        } else if (ch === CharCode.num1) {
                            result = result * 2 + 1;
                        } else {
                            this.error("应输入十六进制数字，实际是“{0}”", String.fromCharCode(ch));
                            break;
                        }
                    }
                    return result;
            }
        }

        result.buffer.Append('.');
        readDecimalDigits();
        currentLocation.column += result.buffer.Length;


        //result.buffer.Length = 0;

        //// 0x...
        //if (_currentChar == '0' && (_input.Peek() | 0x20) == 'x') {
        //    // 读取 0x
        //    _input.Read();

        //    // 读取十六进制。
        //    while (Unicode.isHexDigit(_currentChar = _input.Read())) {
        //        result.buffer.Append((char)_currentChar);
        //    }
        //    currentLocation.column += 2 + result.buffer.Length;

        //    // 至少应读到一个数字。
        //    if (result.buffer.Length == 0) {
        //        Compiler.error(ErrorCode.invalidHexNumber, "语法错误：无效的数字；应输入十六进制数字", result.startLocation, currentLocation);
        //    }

        //    result.type = TokenType.hexIntLiteral;
        //    goto end;
        //}

        //// 整数部分。
        //readDecimalDigits();

        //// 小数部分。
        //if (_currentChar == '.' && Unicode.isDecimalDigit(_input.Peek())) {
        //    _currentChar = _input.Read();
        //    scanFloatLiteral();
        //    result.type = TokenType.floatLiteral;
        //    goto end;
        //}

        //currentLocation.column += result.buffer.Length;
        //result.type = TokenType.intLiteral;
        //goto end;

    }

    /**
     * 解析指定标记表示的整数。
     * @param buffer 要解析的内容。
     */
    static parseNumber(buffer: string, start: number, end: number) {
        long result = 0;
        try {
            for (int i = 0; i < token.buffer.Length; i++) {
                result = checked(result * 10 + token.buffer[i] - '0');
            }
        } catch (OverflowException) {
            Compiler.error(ErrorCode.decimalNumberTooLarge, "整数常量值太大", token.startLocation, token.endLocation);
            result = long.MaxValue;
        }

        return result;
    }

    /**
     * 读取接下来的所有数字。从 _currentChar 开始判断。
     */
    private readDecimalDigits() {
        do {
            result.buffer.Append((char)_currentChar);
        } while (Unicode.isDecimalDigit(_currentChar = _input.Read()));
    }

    /**
     * 读取接下来的所有十六进制数字组成的字符。忽略 _currentChar 值。
     * <param name="length" > </param>
* <returns></returns>
     */
    private readUnicodeChar(int length) {

        int result = 0;

        while (--length >= 0) {
            _currentChar = _input.Read();
            currentLocation.column++;
            int value = _currentChar - '0';
            if (value < 0 || value > 9) {
                value = (_currentChar | 0x20) - 'a';
                if (value < 0 || value > 5) {
                    Compiler.error(ErrorCode.expectedHexDight, "语法错误：应输入十六进制数字", currentLocation, currentLocation + 1);
                    return result;
                }

                value += 10;
            }

            result = (result << 4) | value;
        }

        return result;
    }

    /**
     * 报告当前标记不是标识符的错误。
     */
    private reportIsNotIdentifierError() {
        Compiler.error(ErrorCode.expectedIdentifier, result.type.isKeyword() ? String.Format("语法错误：应输入标识符；“{0}”是关键字，请改为“${0}”", result.type.getName()) : "语法错误：应输入标识符", result.startLocation, result.endLocation);
    }

    /**
     * 扫描紧跟的一行字符。从 _currentChar 开始判断。
     */
    private scanLine() {

        // 读取非换行符。
        while (Unicode.isNonTerminator(_currentChar)) {
            result.buffer.Append((char)_currentChar);
            _currentChar = _input.Read();
            currentLocation.column++;
        }

        // 忽略末尾空白。
        while (result.buffer.Length > 0 && Unicode.isWhiteSpace(result.buffer[result.buffer.Length - 1])) {
            result.buffer.Length--;
            currentLocation.column--;
        }

    }

    /**
     * 解析指定标记中表示的十六进制整数。
     */
    * <param name="token" > </param>
    * <returns></returns>
    public static long parseHexIntToken(Token token) {
    long result = 0;
    try {
        for (int i = 0; i < token.buffer.Length; i++) {
            if (Unicode.isDecimalDigit(token.buffer[i])) {
                result = checked(result * 16 + token.buffer[i] - '0');
            } else {
                result = checked(result * 16 + 10 + (token.buffer[i] | 0x20) - 'a');
            }
        }
    } catch (OverflowException) {
        Compiler.error(ErrorCode.hexNumberTooLarge, "整数常量值太大", token.startLocation, token.endLocation);
        result = long.MaxValue;
    }
    return result;
}

        /**
         * 解析指定标记中表示的浮点数。
         */
         * <param name="token" > </param>
    * <returns></returns>
        public static double parseFloatToken(Token token) {
    double num = 0;
    int i = 0;
    for (; i < token.buffer.Length; i++) {
        if (token.buffer[i] == '.') {
            break;
        }
        num = num * 10 + token.buffer[i] - '0';
    }
    i++;
    for (int p = 10; i < token.buffer.Length; i++ , p *= 10) {
        num += ((double)(token.buffer[i] - '0')) / p;
    }
    return num;
}

}

/**
 * 表示一个标记。
 */
interface Token {

    /**
     * 用于支持多个对象组成一个单链表。
     */
    next: Token;

    /**
     * 获取当前标记的类型。
     */
    type: TokenType;

    /**
     * 获取当前标记的起始位置。
     */
    start: number;

    /**
     * 获取当前标记的结束位置。
     */
    end: number;

    /**
     * 获取存储当前标记内容的缓存。此属性只对特定的标记类型（如字符串）有效。
     */
    buffer: string;

    /**
     * 判断当前标识之前是否存在换行符。
     */
    onNewLine: boolean;

}
