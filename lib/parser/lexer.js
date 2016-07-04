/**
 * @fileOverview 词法解析器
 * @author xuld@vip.qq.com
 */
var tokenType_1 = require('../ast/tokenType');
var compiler_1 = require('../compiler/compiler');
var charCode_1 = require('./charCode');
var Unicode = require('./unicode');
/**
 * 表示一个词法解析器。
 */
var Lexer = (function () {
    function Lexer() {
        this["token"] =  > /param>
            * /returns>;
    }
    /**
     * 设置要解析的源码。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param end 解析的源码结束位置。
     */
    Lexer.prototype.setSource = function (text, start, end) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = text.length; }
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
    };
    /**
     * 预览下一个标记。
     * @returns 返回一个标记对象。
     */
    Lexer.prototype.peek = function () {
        return this.current.next;
    };
    /**
     * 读取下一个标记。
     * @returns 返回一个标记对象。
     */
    Lexer.prototype.read = function () {
        var next = this.current.next;
        if (next.next == null) {
            next.next = this.scan();
        }
        return this.current = next;
    };
    /**
     * 保存当前读取的进度。
     */
    Lexer.prototype.stashSave = function () {
        this.stash = this.current;
    };
    /**
     * 恢复当前读取的进度。
     */
    Lexer.prototype.stashRestore = function () {
        this.current = this.stash;
    };
    // #endregion
    // #region 解析
    /**
     * 报告一个词法错误。
     * @param message 错误的信息。
     * @param args 格式化错误的参数。
     */
    Lexer.prototype.error = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        compiler_1.error.apply(void 0, [compiler_1.ErrorType.lexical, message].concat(args));
    };
    /**
     * 从源中扫描下一个标记的数据并存放在 result。
     */
    Lexer.prototype.scan = function () {
        console.assert(this.sourceText != null, "应先调用“setSource()”设置源。");
        var result = {
            onNewLine: false
        };
        while (this.sourceStart < this.sourceEnd) {
            var ch = this.sourceText.charCodeAt(result.start = this.sourceStart++);
            // 标识符或关键字。
            if (ch >= charCode_1.CharCode.a && ch <= charCode_1.CharCode.z) {
                result.buffer = this.scanIdentifierBody(ch);
                result.type = tokenType_1.identifierToKeyword(result.buffer);
                break;
            }
            switch (ch) {
                // \s, \t
                case charCode_1.CharCode.space:
                case charCode_1.CharCode.horizontalTab:
                    continue;
                // \r, \n
                case charCode_1.CharCode.carriageReturn:
                case charCode_1.CharCode.lineFeed:
                    result.onNewLine = true;
                    continue;
                // /  // /* /=
                case charCode_1.CharCode.slash:
                    switch (this.sourceText.charCodeAt(this.sourceStart++)) {
                        case charCode_1.CharCode.slash:
                            var singleCommentStart = this.sourceStart;
                            while (this.sourceStart < this.sourceEnd && !Unicode.isLineTerminator(this.sourceText.charCodeAt(this.sourceStart))) {
                                this.sourceStart++;
                            }
                            if (compiler_1.options.parseComments) {
                                this.comments.push({ start: singleCommentStart, end: this.sourceStart });
                            }
                            continue;
                        case charCode_1.CharCode.asterisk:
                            var multiCommentStart = this.sourceStart;
                            var multiCommentEnd = void 0;
                            while (this.sourceStart < this.sourceEnd) {
                                ch = this.sourceText.charCodeAt(this.sourceStart);
                                if (Unicode.isLineTerminator(ch)) {
                                    result.onNewLine = true;
                                }
                                else if (ch === charCode_1.CharCode.asterisk && this.sourceText.charCodeAt(this.sourceStart + 1) === charCode_1.CharCode.slash) {
                                    multiCommentEnd = this.sourceStart;
                                    this.sourceStart += 2;
                                    break;
                                }
                                this.sourceStart++;
                            }
                            if (multiCommentEnd == null && compiler_1.options.languageVersion) {
                                this.error("多行注释未关闭；应输入“*/”。");
                            }
                            if (compiler_1.options.parseComments) {
                                this.comments.push({ start: multiCommentStart, end: multiCommentEnd });
                            }
                            continue;
                        case charCode_1.CharCode.equals:
                            result.type = tokenType_1.TokenType.slashEquals;
                            break;
                        default:
                            this.sourceStart--;
                            result.type = tokenType_1.TokenType.slash;
                            break;
                    }
                // ', "
                case charCode_1.CharCode.singleQuote:
                case charCode_1.CharCode.doubleQuote:
                    result.buffer = this.scanStringLiteralBody(ch);
                    result.type = tokenType_1.TokenType.stringLiteral;
                    break;
                // `
                case charCode_1.CharCode.backtick:
                    // todo
                    //    result.type = TokenType.stringLiteral;
                    // scanVerbatimString();
                    return result;
                // =, ==, =>
                case charCode_1.CharCode.equals:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case charCode_1.CharCode.equals:
                            this.sourceStart++;
                            if (this.sourceText.charCodeAt(this.sourceStart) === charCode_1.CharCode.equals) {
                                this.sourceStart++;
                                result.type = tokenType_1.TokenType.equalsEqualsEquals;
                                break;
                            }
                            result.type = tokenType_1.TokenType.equalsEquals;
                        case charCode_1.CharCode.greaterThan:
                            this.sourceStart++;
                            result.type = tokenType_1.TokenType.equalsGreaterThan;
                            break;
                        default:
                            result.type = tokenType_1.TokenType.equals;
                            break;
                    }
                    break;
                // .1, .., ...
                case charCode_1.CharCode.dot:
                    if (Unicode.isDecimalDigit(this.sourceStart)) {
                        // todo
                        break;
                    }
                    if (this.sourceText.charCodeAt(this.sourceStart++) === charCode_1.CharCode.dot) {
                        if (this.sourceText.charCodeAt(this.sourceStart) === charCode_1.CharCode.dot) {
                            this.sourceStart++;
                            result.type = tokenType_1.TokenType.dotDotDot;
                            break;
                        }
                        result.type = tokenType_1.TokenType.dotDot;
                        break;
                    }
                    result.type = tokenType_1.TokenType.dot;
                    break;
                // !, !=, !==
                case charCode_1.CharCode.exclamation:
                    if (this.sourceText.charCodeAt(this.sourceStart) === charCode_1.CharCode.equals) {
                        if (this.sourceText.charCodeAt(this.sourceStart++) === charCode_1.CharCode.equals) {
                            this.sourceStart++;
                            result.type = tokenType_1.TokenType.exclamationEqualsEquals;
                            break;
                        }
                        result.type = tokenType_1.TokenType.exclamationEquals;
                        break;
                    }
                    result.type = tokenType_1.TokenType.exclamation;
                    break;
                // %, %=
                case charCode_1.CharCode.percent:
                    if (this.sourceText.charCodeAt(this.sourceStart) === tokenType_1.TokenType.equals) {
                        this.sourceStart++;
                        result.type = tokenType_1.TokenType.percentEquals;
                        break;
                    }
                    result.type = tokenType_1.TokenType.percent;
                    break;
                // &, &&, &=
                case charCode_1.CharCode.ampersand:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case charCode_1.CharCode.ampersand:
                            this.sourceStart++;
                            result.type = tokenType_1.TokenType.ampersandAmpersand;
                            break;
                        case charCode_1.CharCode.equals:
                            this.sourceStart++;
                            result.type = tokenType_1.TokenType.ampersandEquals;
                            break;
                        default:
                            result.type = tokenType_1.TokenType.ampersand;
                            break;
                    }
                    break;
                // (
                case charCode_1.CharCode.openParen:
                    result.type = tokenType_1.TokenType.openParen;
                    break;
                // )
                case charCode_1.CharCode.closeParen:
                    result.type = tokenType_1.TokenType.closeParen;
                    break;
                // *, **, **=, *=
                case charCode_1.CharCode.asterisk:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case charCode_1.CharCode.asterisk:
                            if (this.sourceText.charCodeAt(this.sourceStart++) === charCode_1.CharCode.equals) {
                                this.sourceStart++;
                                result.type = tokenType_1.TokenType.asteriskAsteriskEquals;
                                break;
                            }
                            result.type = tokenType_1.TokenType.asteriskAsterisk;
                            break;
                        case charCode_1.CharCode.equals:
                            this.sourceStart++;
                            result.type = tokenType_1.TokenType.asteriskEquals;
                            break;
                        default:
                            result.type = tokenType_1.TokenType.asterisk;
                            break;
                    }
                    break;
                // +, ++, +=
                case charCode_1.CharCode.plus:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case charCode_1.CharCode.plus:
                            this.sourceStart++;
                            result.type = tokenType_1.TokenType.plusPlus;
                            break;
                        case charCode_1.CharCode.equals:
                            this.sourceStart++;
                            result.type = tokenType_1.TokenType.plusEquals;
                            break;
                        default:
                            result.type = tokenType_1.TokenType.plus;
                            break;
                    }
                    break;
                // ,
                case charCode_1.CharCode.comma:
                    result.type = tokenType_1.TokenType.comma;
                    break;
                // -, --, -=
                case charCode_1.CharCode.minus:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case charCode_1.CharCode.minus:
                            this.sourceStart++;
                            result.type = tokenType_1.TokenType.minusMinus;
                            break;
                        case charCode_1.CharCode.equals:
                            this.sourceStart++;
                            result.type = tokenType_1.TokenType.minusEquals;
                            break;
                        default:
                            result.type = tokenType_1.TokenType.minus;
                            break;
                    }
                    break;
                // /, /=
                case charCode_1.CharCode.slash:
                    if (this.sourceText.charCodeAt(this.sourceStart) === tokenType_1.TokenType.equals) {
                        this.sourceStart++;
                        result.type = tokenType_1.TokenType.slashEquals;
                        break;
                    }
                    result.type = tokenType_1.TokenType.slash;
                    break;
                // :
                case charCode_1.CharCode.colon:
                    result.type = tokenType_1.TokenType.colon;
                    break;
                // ;
                case charCode_1.CharCode.semicolon:
                    result.type = tokenType_1.TokenType.semicolon;
                    break;
                // <, <<, <<=, <=
                case charCode_1.CharCode.lessThan:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case charCode_1.CharCode.lessThan:
                            if (this.sourceText.charCodeAt(this.sourceStart++) === charCode_1.CharCode.equals) {
                                this.sourceStart++;
                                result.type = tokenType_1.TokenType.lessThanLessThanEquals;
                                break;
                            }
                            result.type = tokenType_1.TokenType.lessThanLessThan;
                            break;
                        case charCode_1.CharCode.equals:
                            this.sourceStart++;
                            result.type = tokenType_1.TokenType.lessThanEquals;
                            break;
                        default:
                            result.type = tokenType_1.TokenType.lessThan;
                            break;
                    }
                    break;
                // =, ==, ===, =>
                case charCode_1.CharCode.equals:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case charCode_1.CharCode.equals:
                            if (this.sourceText.charCodeAt(this.sourceStart++) === charCode_1.CharCode.equals) {
                                this.sourceStart++;
                                result.type = tokenType_1.TokenType.equalsEqualsEquals;
                                break;
                            }
                            result.type = tokenType_1.TokenType.equalsEquals;
                            break;
                        case charCode_1.CharCode.greaterThan:
                            this.sourceStart++;
                            result.type = tokenType_1.TokenType.equalsGreaterThan;
                            break;
                        default:
                            result.type = tokenType_1.TokenType.equals;
                            break;
                    }
                    break;
                // >, >=, >>, >>=, >>>, >>>=
                case charCode_1.CharCode.greaterThan:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case charCode_1.CharCode.equals:
                            this.sourceStart++;
                            result.type = tokenType_1.TokenType.greaterThanEquals;
                            break;
                        case charCode_1.CharCode.greaterThan:
                            switch (this.sourceText.charCodeAt(this.sourceStart++)) {
                                case charCode_1.CharCode.equals:
                                    this.sourceStart++;
                                    result.type = tokenType_1.TokenType.greaterThanGreaterThanEquals;
                                    break;
                                case charCode_1.CharCode.greaterThan:
                                    if (this.sourceText.charCodeAt(this.sourceStart++) === charCode_1.CharCode.equals) {
                                        this.sourceStart++;
                                        result.type = tokenType_1.TokenType.greaterThanGreaterThanGreaterThanEquals;
                                        break;
                                    }
                                    result.type = tokenType_1.TokenType.greaterThanGreaterThanGreaterThan;
                                    break;
                                default:
                                    result.type = tokenType_1.TokenType.greaterThanGreaterThan;
                                    break;
                            }
                            break;
                        default:
                            result.type = tokenType_1.TokenType.greaterThan;
                            break;
                    }
                    break;
                // ?
                case charCode_1.CharCode.question:
                    result.type = tokenType_1.TokenType.question;
                    break;
                // @
                case charCode_1.CharCode.at:
                    result.type = tokenType_1.TokenType.at;
                    break;
                // [
                case charCode_1.CharCode.openBracket:
                    result.type = tokenType_1.TokenType.openBracket;
                    break;
                // ]
                case charCode_1.CharCode.closeBracket:
                    result.type = tokenType_1.TokenType.closeBracket;
                    break;
                // ^, ^=
                case charCode_1.CharCode.caret:
                    if (this.sourceText.charCodeAt(this.sourceStart) === tokenType_1.TokenType.caretEquals) {
                        this.sourceStart++;
                        result.type = tokenType_1.TokenType.caretEquals;
                        break;
                    }
                    result.type = tokenType_1.TokenType.caret;
                    break;
                // {
                case charCode_1.CharCode.openBrace:
                    result.type = tokenType_1.TokenType.openBrace;
                    break;
                // |, |=, ||
                case charCode_1.CharCode.bar:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case charCode_1.CharCode.equals:
                            this.sourceStart++;
                            result.type = tokenType_1.TokenType.barEquals;
                            break;
                        case charCode_1.CharCode.bar:
                            this.sourceStart++;
                            result.type = tokenType_1.TokenType.barBar;
                            break;
                        default:
                            result.type = tokenType_1.TokenType.bar;
                            break;
                    }
                    break;
                // }
                case charCode_1.CharCode.closeBrace:
                    result.type = tokenType_1.TokenType.closeBrace;
                    break;
                // ~
                case charCode_1.CharCode.tilde:
                    result.type = tokenType_1.TokenType.tilde;
                    break;
                default:
                    // 数字。
                    if (Unicode.isDecimalDigit(ch)) {
                        result.buffer = this.scanNumericLiteralBody(ch);
                        result.type = tokenType_1.TokenType.numericLiteral;
                        break;
                    }
                    // 标识符。
                    if (Unicode.isIdentifierStart(ch)) {
                        result.buffer = this.scanIdentifierBody(ch);
                        result.type = tokenType_1.TokenType.identifier;
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
    };
    // #endregion
    /**
     * 扫描紧跟的标识符主体部分。
     * @param ch 当前已读取的字符。
     */
    Lexer.prototype.scanIdentifierBody = function (ch) {
        var identifierStart = this.sourceStart - 1;
        while (Unicode.isIdentifierPart(this.sourceStart)) {
            this.sourceStart++;
        }
        return this.sourceText.substring(identifierStart, this.sourceStart);
    };
    /**
     * 扫描紧跟的转义字符串部分。忽略 _currentChar 值。
     */
    Lexer.prototype.scanStringLiteralBody = function () {
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
    };
    /**
     * 扫描紧跟的数字部分。
     * @param ch 当前已读取的字符。
     */
    Lexer.prototype.scanNumericLiteralBody = function (ch) {
        var result = 0;
        if (ch === charCode_1.CharCode.num0) {
            switch (this.sourceText.charCodeAt(this.sourceStart)) {
                case charCode_1.CharCode.x:
                case charCode_1.CharCode.X:
                    this.sourceStart++;
                    while (this.sourceStart < this.sourceEnd) {
                        ch = this.sourceText.charCodeAt(this.sourceStart);
                        if (ch >= charCode_1.CharCode.num0 && ch <= charCode_1.CharCode.num9) {
                            result = result * 16 + ch - charCode_1.CharCode.num0;
                        }
                        else if (ch >= charCode_1.CharCode.A && ch <= charCode_1.CharCode.F) {
                            result = result * 16 + 10 + ch - charCode_1.CharCode.A;
                        }
                        else if (ch >= charCode_1.CharCode.a && ch <= charCode_1.CharCode.f) {
                            result = result * 16 + 10 + ch - charCode_1.CharCode.a;
                        }
                        else {
                            this.error("应输入十六进制数字，实际是“{0}”", String.fromCharCode(ch));
                            break;
                        }
                    }
                    return result;
                case charCode_1.CharCode.b:
                case charCode_1.CharCode.B:
                    this.sourceStart++;
                    while (this.sourceStart < this.sourceEnd) {
                        ch = this.sourceText.charCodeAt(this.sourceStart);
                        if (ch === charCode_1.CharCode.num0) {
                            result = result * 2;
                        }
                        else if (ch === charCode_1.CharCode.num1) {
                            result = result * 2 + 1;
                        }
                        else {
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
    };
    /**
     * 解析指定标记表示的整数。
     * @param buffer 要解析的内容。
     */
    Lexer.parseNumber = function (buffer, start, end) {
        long;
        result = 0;
        try {
            for (int; i = 0; i < token.buffer.Length)
                ;
            i++;
            {
                result = checked(result * 10 + token.buffer[i] - '0');
            }
        }
        catch (OverflowException) {
            Compiler.error(ErrorCode.decimalNumberTooLarge, "整数常量值太大", token.startLocation, token.endLocation);
            result = long.MaxValue;
        }
        return result;
    };
    /**
     * 读取接下来的所有数字。从 _currentChar 开始判断。
     */
    Lexer.prototype.readDecimalDigits = function () {
        do {
            result.buffer.Append((char), _currentChar);
        } while (Unicode.isDecimalDigit(_currentChar = _input.Read()));
    };
    /**
     * 读取接下来的所有十六进制数字组成的字符。忽略 _currentChar 值。
     * <param name="length" > </param>
* <returns></returns>
     */
    Lexer.prototype.readUnicodeChar = function (int) {
        if (int === void 0) { int = length; }
        int;
        result = 0;
        while (--length >= 0) {
            _currentChar = _input.Read();
            currentLocation.column++;
            int;
            value = _currentChar - '0';
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
    };
    /**
     * 报告当前标记不是标识符的错误。
     */
    Lexer.prototype.reportIsNotIdentifierError = function () {
        Compiler.error(ErrorCode.expectedIdentifier, result.type.isKeyword() ? String.Format("语法错误：应输入标识符；“{0}”是关键字，请改为“${0}”", result.type.getName()) : "语法错误：应输入标识符", result.startLocation, result.endLocation);
    };
    /**
     * 扫描紧跟的一行字符。从 _currentChar 开始判断。
     */
    Lexer.prototype.scanLine = function () {
        // 读取非换行符。
        while (Unicode.isNonTerminator(_currentChar)) {
            result.buffer.Append((char), _currentChar);
            _currentChar = _input.Read();
            currentLocation.column++;
        }
        // 忽略末尾空白。
        while (result.buffer.Length > 0 && Unicode.isWhiteSpace(result.buffer[result.buffer.Length - 1])) {
            result.buffer.Length--;
            currentLocation.column--;
        }
    };
    /**
     * 解析指定标记中表示的十六进制整数。
     */
    Lexer.prototype. = ;
    Lexer.long = parseHexIntToken(Token, token);
    return Lexer;
}());
exports.Lexer = Lexer;
{
    long;
    result = 0;
    try {
        for (int; i = 0; i < token.buffer.Length)
            ;
        i++;
        {
            if (Unicode.isDecimalDigit(token.buffer[i])) {
                result = checked(result * 16 + token.buffer[i] - '0');
            }
            else {
                result = checked(result * 16 + 10 + (token.buffer[i] | 0x20) - 'a');
            }
        }
    }
    catch (OverflowException) {
        Compiler.error(ErrorCode.hexNumberTooLarge, "整数常量值太大", token.startLocation, token.endLocation);
        result = long.MaxValue;
    }
    return result;
}
/**
 * 解析指定标记中表示的浮点数。
 */
    * name;
"token" > /param>
    * /returns>;
double;
parseFloatToken(Token, token);
{
    double;
    num = 0;
    int;
    i = 0;
    for (; i < token.buffer.Length; i++) {
        if (token.buffer[i] == '.') {
            break;
        }
        num = num * 10 + token.buffer[i] - '0';
    }
    i++;
    for (int; p = 10; i < token.buffer.Length)
        ;
    i++, p *= 10;
    {
        num += ((double)(token.buffer[i] - '0')) / p;
    }
    return num;
}
//# sourceMappingURL=lexer.js.map