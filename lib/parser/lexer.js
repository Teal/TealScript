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
 * @description 词法解析器可以将源码解析成多个标记的序列。
 */
var Lexer = (function () {
    function Lexer() {
    }
    /**
     * 设置要解析的源码。
     * @param text 要解析的源码文本。
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
        var firstToken = this.scan();
        firstToken.onNewLine = true;
        this.current = {
            _next: firstToken,
            type: tokenType_1.TokenType.unknown,
            start: start,
            end: start,
            onNewLine: true,
        };
    };
    /**
     * 预览下一个标记。
     * @returns 返回一个标记对象。
     */
    Lexer.prototype.peek = function () {
        return this.current._next;
    };
    /**
     * 读取下一个标记。
     * @returns 返回一个标记对象。
     */
    Lexer.prototype.read = function () {
        var next = this.current._next;
        if (next._next == null) {
            next._next = this.scan();
        }
        return this.current = next;
    };
    /**
     * 保存当前读取的进度。保存之后可以通过 {@link stashRestore} 恢复进度。
     */
    Lexer.prototype.stashSave = function () { this.stash = this.current; };
    /**
     * 恢复之前保存的进度。
     */
    Lexer.prototype.stashRestore = function () { this.current = this.stash; };
    // #endregion
    // #region 解析
    /**
     * 报告一个词法解析错误。
     * @param message 错误的信息。
     * @param args 格式化信息的参数。
     */
    Lexer.prototype.error = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        compiler_1.error.apply(void 0, [compiler_1.ErrorType.lexical, message].concat(args));
    };
    /**
     * 从源码扫描下一个标记。
     * @returns 返回解析的标记对象。
     */
    Lexer.prototype.scan = function () {
        console.assert(this.sourceText != null, "应先调用“setSource()”设置源码内容。");
        var result = {
            onNewLine: false
        };
        while (this.sourceStart < this.sourceEnd) {
            var ch = this.sourceText.charCodeAt(result.start = this.sourceStart++);
            // 标识符, 关键字
            if (ch >= charCode_1.CharCode.a && ch <= charCode_1.CharCode.z) {
                result.data = this.scanIdentifierBody(ch);
                result.type = tokenType_1.identifierToKeyword(result.data);
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
                // /, //, /*, /=
                case charCode_1.CharCode.slash:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case charCode_1.CharCode.slash:
                            var singleCommentStart = ++this.sourceStart;
                            while (this.sourceStart < this.sourceEnd && !Unicode.isLineTerminator(this.sourceText.charCodeAt(this.sourceStart))) {
                                this.sourceStart++;
                            }
                            if (compiler_1.options.parseComments & compiler_1.ParseCommentsOption.singleLine) {
                                this.comments.push({ start: singleCommentStart, end: this.sourceStart });
                            }
                            continue;
                        case charCode_1.CharCode.asterisk:
                            var multiCommentStart = ++this.sourceStart;
                            var multiCommentEnd = void 0;
                            while (this.sourceStart < this.sourceEnd) {
                                ch = this.sourceText.charCodeAt(this.sourceStart++);
                                if (Unicode.isLineTerminator(ch)) {
                                    result.onNewLine = true;
                                }
                                else if (ch === charCode_1.CharCode.asterisk && this.sourceText.charCodeAt(this.sourceStart + 1) === charCode_1.CharCode.slash) {
                                    multiCommentEnd = this.sourceStart - 2;
                                    this.sourceStart++;
                                    break;
                                }
                            }
                            if (multiCommentEnd == null && compiler_1.options.languageVersion) {
                                this.error("多行注释未关闭；应输入“*/”。");
                            }
                            if ((compiler_1.options.parseComments & compiler_1.ParseCommentsOption.jsDoc) ? this.sourceText.charCodeAt(multiCommentStart) === charCode_1.CharCode.asterisk : (compiler_1.options.parseComments & compiler_1.ParseCommentsOption.multiLine)) {
                                this.comments.push({ start: multiCommentStart, end: multiCommentEnd });
                            }
                            continue;
                        case charCode_1.CharCode.equals:
                            this.sourceStart++;
                            result.type = tokenType_1.TokenType.slashEquals;
                            break;
                        default:
                            result.type = tokenType_1.TokenType.slash;
                            break;
                    }
                    break;
                // .1, .., ...
                case charCode_1.CharCode.dot:
                    if (Unicode.isDecimalDigit(this.sourceStart)) {
                        result.data = this.scanFloatDights(0);
                        result.type = tokenType_1.TokenType.numericLiteral;
                        break;
                    }
                    if (this.sourceText.charCodeAt(this.sourceStart) === charCode_1.CharCode.dot) {
                        this.sourceStart++;
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
                // (
                case charCode_1.CharCode.openParen:
                    result.type = tokenType_1.TokenType.openParen;
                    break;
                // )
                case charCode_1.CharCode.closeParen:
                    result.type = tokenType_1.TokenType.closeParen;
                    break;
                // {
                case charCode_1.CharCode.openBrace:
                    result.type = tokenType_1.TokenType.openBrace;
                    break;
                // }
                case charCode_1.CharCode.closeBrace:
                    result.type = tokenType_1.TokenType.closeBrace;
                    break;
                // ;
                case charCode_1.CharCode.semicolon:
                    result.type = tokenType_1.TokenType.semicolon;
                    break;
                // =, ==, ===, =>
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
                // ', "
                case charCode_1.CharCode.singleQuote:
                case charCode_1.CharCode.doubleQuote:
                    result.data = this.scanStringLiteralBody(ch);
                    result.type = tokenType_1.TokenType.stringLiteral;
                    break;
                // `
                case charCode_1.CharCode.backtick:
                    result.data = this.scanTemplateLiteralBody(ch);
                    result.type = this.sourceText.charCodeAt(this.sourceStart - 1) === charCode_1.CharCode.backtick ? tokenType_1.TokenType.noSubstitutionTemplateLiteral : tokenType_1.TokenType.templateHead;
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
                // ,
                case charCode_1.CharCode.comma:
                    result.type = tokenType_1.TokenType.comma;
                    break;
                // :
                case charCode_1.CharCode.colon:
                    result.type = tokenType_1.TokenType.colon;
                    break;
                // ?
                case charCode_1.CharCode.question:
                    result.type = tokenType_1.TokenType.question;
                    break;
                // [
                case charCode_1.CharCode.openBracket:
                    result.type = tokenType_1.TokenType.openBracket;
                    break;
                // ]
                case charCode_1.CharCode.closeBracket:
                    result.type = tokenType_1.TokenType.closeBracket;
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
                // *, **, **=, *=
                case charCode_1.CharCode.asterisk:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case charCode_1.CharCode.asterisk:
                            if (this.sourceText.charCodeAt(++this.sourceStart) === charCode_1.CharCode.equals) {
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
                // <, <<, <<=, <=
                case charCode_1.CharCode.lessThan:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case charCode_1.CharCode.lessThan:
                            if (this.sourceText.charCodeAt(++this.sourceStart) === charCode_1.CharCode.equals) {
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
                // >, >=, >>, >>=, >>>, >>>=
                case charCode_1.CharCode.greaterThan:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case charCode_1.CharCode.equals:
                            this.sourceStart++;
                            result.type = tokenType_1.TokenType.greaterThanEquals;
                            break;
                        case charCode_1.CharCode.greaterThan:
                            switch (this.sourceText.charCodeAt(++this.sourceStart)) {
                                case charCode_1.CharCode.equals:
                                    this.sourceStart++;
                                    result.type = tokenType_1.TokenType.greaterThanGreaterThanEquals;
                                    break;
                                case charCode_1.CharCode.greaterThan:
                                    if (this.sourceText.charCodeAt(++this.sourceStart) === charCode_1.CharCode.equals) {
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
                // ~
                case charCode_1.CharCode.tilde:
                    result.type = tokenType_1.TokenType.tilde;
                    break;
                // @
                case charCode_1.CharCode.at:
                    result.type = tokenType_1.TokenType.at;
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
                default:
                    // 数字。
                    if (Unicode.isDecimalDigit(ch)) {
                        result.data = this.scanNumericLiteralBody(ch);
                        result.type = tokenType_1.TokenType.numericLiteral;
                        break;
                    }
                    // 标识符。
                    if (Unicode.isIdentifierStart(ch)) {
                        result.data = this.scanIdentifierBody(ch);
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
    /**
     * 扫描紧跟的标识符主体部分。
     * @param currentChar 当前已读取的字符。
     */
    Lexer.prototype.scanIdentifierBody = function (currentChar) {
        var result = "";
        if (currentChar === charCode_1.CharCode.backslash) {
            if (this.sourceText.charCodeAt(this.sourceStart) !== charCode_1.CharCode.u) {
                this.error("意外的字符：“{0}”。", '\\');
                result += "\\";
            }
            else {
                var num = this.scanHexDights(++this.sourceStart + 4);
                result += String.fromCharCode(num);
            }
        }
        else {
            result += String.fromCharCode(currentChar);
        }
        while (true) {
            var ch = this.sourceText.charCodeAt(this.sourceStart);
            if (ch === charCode_1.CharCode.backslash) {
                if (this.sourceText.charCodeAt(this.sourceStart) !== charCode_1.CharCode.u) {
                    this.error("意外的字符：“{0}”。", '\\');
                    result += "\\";
                }
                else {
                    var num = this.scanHexDights(++this.sourceStart + 4);
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
    };
    /**
     * 扫描紧跟的数字部分。
     * @param currentChar 当前已读取的数字字符。
     */
    Lexer.prototype.scanNumericLiteralBody = function (currentChar) {
        console.assert(currentChar >= charCode_1.CharCode.num0 && currentChar <= charCode_1.CharCode.num9);
        // 0x00, 0O00, 0b00
        if (currentChar === charCode_1.CharCode.num0) {
            switch (this.sourceText.charCodeAt(this.sourceStart)) {
                case charCode_1.CharCode.x:
                case charCode_1.CharCode.X:
                    this.sourceStart++;
                    return this.scanHexDights(this.sourceEnd);
                case charCode_1.CharCode.b:
                case charCode_1.CharCode.B:
                    this.sourceStart++;
                    return this.scanBinaryOrOctalOrDecimalDights(2);
                case charCode_1.CharCode.o:
                case charCode_1.CharCode.O:
                    this.sourceStart++;
                    return this.scanBinaryOrOctalOrDecimalDights(8);
            }
        }
        // 读取整数部分。
        var result = currentChar - charCode_1.CharCode.num0;
        while (this.sourceStart < this.sourceEnd) {
            var num = this.sourceText.charCodeAt(this.sourceStart) - charCode_1.CharCode.num0;
            if (num >= 0 && num < 10) {
                this.sourceStart++;
                result = result * 10 + num;
            }
            else {
                break;
            }
        }
        // 读取小数部分。
        switch (this.sourceText.charCodeAt(this.sourceStart)) {
            case charCode_1.CharCode.dot:
                this.sourceStart++;
                return this.scanFloatDights(result);
            case charCode_1.CharCode.e:
            case charCode_1.CharCode.E:
                this.sourceStart++;
                return this.scanExponentDights(result);
        }
        return result;
    };
    /**
     * 扫描紧跟的浮点数字部分。
     * @param currentValue 当前已读取的数值。
     */
    Lexer.prototype.scanFloatDights = function (currentValue) {
        console.assert(this.sourceText.charCodeAt(this.sourceStart - 1) === charCode_1.CharCode.dot);
        // 解析小数点。
        var p = 1;
        while (this.sourceStart < this.sourceEnd) {
            var num = this.sourceText.charCodeAt(this.sourceStart) - charCode_1.CharCode.num0;
            if (num >= 0 && num <= 9) {
                currentValue += num / p;
                p /= 10;
            }
            else {
                break;
            }
        }
        // 解析 e, E。
        switch (this.sourceText.charCodeAt(this.sourceStart)) {
            case charCode_1.CharCode.e:
            case charCode_1.CharCode.E:
                this.sourceStart++;
                return this.scanExponentDights(currentValue);
        }
        return currentValue;
    };
    /**
     * 扫描紧跟的浮点数字部分。
     * @param currentValue 当前已读取的数值。
     */
    Lexer.prototype.scanExponentDights = function (currentValue) {
        console.assert((this.sourceText.charCodeAt(this.sourceStart - 1) | charCode_1.CharCode.space) === charCode_1.CharCode.e);
        switch (this.sourceText.charCodeAt(this.sourceStart)) {
            case charCode_1.CharCode.minus:
                this.sourceStart++;
                return currentValue * Math.pow(10, -this.scanBinaryOrOctalOrDecimalDights(10));
            case charCode_1.CharCode.plus:
                this.sourceStart++;
            // 继续执行
            default:
                return currentValue * Math.pow(10, this.scanBinaryOrOctalOrDecimalDights(10));
        }
    };
    /**
     * 扫描紧跟的十六进制数字。
     * @param end 扫描的终止位置。
     * @return 返回解析的数值。
     */
    Lexer.prototype.scanHexDights = function (end) {
        var result = 0;
        var start = this.sourceStart;
        while (this.sourceStart < end) {
            var ch = this.sourceText.charCodeAt(this.sourceStart);
            if (ch >= charCode_1.CharCode.num0 && ch <= charCode_1.CharCode.num9) {
                this.sourceStart++;
                result = result * 16 + ch - charCode_1.CharCode.num0;
            }
            else if (ch >= charCode_1.CharCode.A && ch <= charCode_1.CharCode.F) {
                this.sourceStart++;
                result = result * 16 + 10 + ch - charCode_1.CharCode.A;
            }
            else if (ch >= charCode_1.CharCode.a && ch <= charCode_1.CharCode.f) {
                this.sourceStart++;
                result = result * 16 + 10 + ch - charCode_1.CharCode.a;
            }
            else {
                if (start === this.sourceStart) {
                    this.error("应输入十六进制数字；实际是“{0}”", this.sourceText.charAt(this.sourceStart));
                }
                break;
            }
        }
        return result;
    };
    /**
     * 扫描紧跟的二进制或八进制数字。
     * @param base 进制基数。可以是 2 或 8。
     * @return 返回解析的数值。
     */
    Lexer.prototype.scanBinaryOrOctalOrDecimalDights = function (base) {
        var result = 0;
        var start = this.sourceStart;
        while (this.sourceStart < this.sourceEnd) {
            var num = this.sourceText.charCodeAt(this.sourceStart) - charCode_1.CharCode.num0;
            if (num >= 0 && num < base) {
                this.sourceStart++;
                result = result * base + num;
            }
            else {
                if (start === this.sourceStart) {
                    this.error(base === 2 ? "应输入二进制数字；实际是“{0}”" : base === 8 ? "应输入八进制数字；实际是“{0}”" : "应输入数字；实际是“{0}”", this.sourceText.charAt(this.sourceStart));
                }
                break;
            }
        }
        return result;
    };
    /**
     * 扫描紧跟的字符串部分。
     * @param currentChar 当前已读取的字符。
     */
    Lexer.prototype.scanStringLiteralBody = function (currentChar) {
        console.assert(currentChar === charCode_1.CharCode.singleQuote || currentChar === charCode_1.CharCode.doubleQuote);
        var result = "";
        while (this.sourceStart < this.sourceEnd) {
            var ch = this.sourceText.charCodeAt(this.sourceStart++);
            switch (ch) {
                case currentChar:
                    return result;
                case charCode_1.CharCode.backslash:
                    switch (this.sourceText.charCodeAt(this.sourceStart)) {
                        case charCode_1.CharCode.singleQuote:
                            this.sourceStart++;
                            result += '\'';
                            continue;
                        case charCode_1.CharCode.doubleQuote:
                            this.sourceStart++;
                            result += '\"';
                            continue;
                        case charCode_1.CharCode.n:
                            this.sourceStart++;
                            result += '\n';
                            continue;
                        case charCode_1.CharCode.r:
                            this.sourceStart++;
                            result += '\r';
                            continue;
                        case charCode_1.CharCode.t:
                            this.sourceStart++;
                            result += '\t';
                            continue;
                        case charCode_1.CharCode.u:
                            result += String.fromCharCode(this.scanHexDights(++this.sourceStart + 4));
                            continue;
                        case charCode_1.CharCode.x:
                            result += String.fromCharCode(this.scanHexDights(++this.sourceStart + 2));
                            continue;
                        case charCode_1.CharCode.num0:
                            this.sourceStart++;
                            result += '\0';
                            continue;
                        case charCode_1.CharCode.b:
                            this.sourceStart++;
                            result += '\b';
                            continue;
                        case charCode_1.CharCode.f:
                            this.sourceStart++;
                            result += '\f';
                            continue;
                        case charCode_1.CharCode.v:
                            this.sourceStart++;
                            result += '\v';
                            continue;
                        case charCode_1.CharCode.carriageReturn:
                            if (this.sourceText.charCodeAt(++this.sourceStart) === charCode_1.CharCode.lineFeed) {
                                this.sourceStart++;
                            }
                            continue;
                        case charCode_1.CharCode.lineFeed:
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
    };
    /**
     * 扫描紧跟的模板字符串部分。
     * @param currentChar 当前已读取的字符。
     */
    Lexer.prototype.scanTemplateLiteralBody = function (currentChar) {
    };
    return Lexer;
}());
exports.Lexer = Lexer;
//# sourceMappingURL=lexer.js.map