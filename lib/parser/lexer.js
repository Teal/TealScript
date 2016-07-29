/**
 * @fileOverview 词法解析器
 * @author xuld@vip.qq.com
 */
var compiler_1 = require('../compiler/compiler');
var tokenType_1 = require('./tokenType');
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
     * @param fileName 解析的源码位置。
     */
    Lexer.prototype.setSource = function (text, start, options) {
        if (start === void 0) { start = 0; }
        this.source = text;
        this.pos = start;
        if (options)
            this.options = options;
        delete this.comments;
        // 跳过开头的 #! 部分。
        if (!options.disallowShebang) {
            this.skipShebang();
        }
        // 预读第一个标记。
        var firstToken = this.scan();
        firstToken.hasLineBreakBeforeStart = true;
        this.current = {
            _next: firstToken,
            type: 0 /* unknown */,
            start: start,
            end: start,
            hasLineBreakBeforeStart: true
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
        compiler_1.error.apply(void 0, [compiler_1.ErrorType.lexicalError, this.fileName, this.pos, this.pos, message].concat(args));
    };
    /**
     * 当解析到一个注释时执行。
     * @param multiLineComment 标记是否是多行注释。
     * @param start 注释的开始位置。
     * @param end 注释的结束位置。
     */
    Lexer.prototype.comment = function (multiLineComment, start, end) {
        if (compiler_1.options.parseComments) {
            this.comments = this.comments || [];
            this.comments.push({ start: start, end: end });
        }
    };
    /**
     * 跳过开头的 #! 标记。
     */
    Lexer.prototype.skipShebang = function () {
        if (this.source.charCodeAt(this.pos) === 35 /* hash */ && this.source.charCodeAt(this.pos + 1) === 33 /* exclamation */) {
            this.pos += 2;
            this.skipLine();
        }
    };
    /**
     * 跳过当前行剩下的所有字符。
     */
    Lexer.prototype.skipLine = function () {
        while (this.pos < this.source.length && !Unicode.isLineTerminator(this.source.charCodeAt(this.pos))) {
            this.pos++;
        }
    };
    /**
     * 从源码扫描下一个标记。
     * @returns 返回解析的标记对象。
     */
    Lexer.prototype.scan = function () {
        console.assert(this.source != null, "应先调用“setSource()”设置源码内容。");
        var result = {};
        while (true) {
            var ch = this.source.charCodeAt(result.start = this.pos++);
            // 标识符、关键字
            if (ch >= 97 /* a */ && ch <= 122 /* z */) {
                result.data = this.scanIdentifier();
                result.type = tokenType_1.stringToToken(result.data);
                break;
            }
            switch (ch) {
                // \s、\t
                case 32 /* space */:
                case 9 /* horizontalTab */:
                    // 加速连续空格解析。
                    while (Unicode.isWhiteSpace(this.pos)) {
                        this.pos++;
                    }
                    continue;
                // \r、\n
                case 13 /* carriageReturn */:
                case 10 /* lineFeed */:
                    result.hasLineBreakBeforeStart = true;
                    continue;
                // /、//、/*、/=
                case 47 /* slash */:
                    switch (this.source.charCodeAt(this.pos++)) {
                        case 47 /* slash */:
                            var singleCommentStart = this.pos;
                            this.skipLine();
                            this.comment(false, singleCommentStart, this.pos);
                            continue;
                        case 42 /* asterisk */:
                            var multiCommentStart = this.pos;
                            var multiCommentEnd = void 0;
                            while (this.pos < this.source.length) {
                                ch = this.source.charCodeAt(this.pos++); // 注释字符。
                                if (Unicode.isLineTerminator(ch)) {
                                    result.hasLineBreakBeforeStart = true;
                                }
                                else if (ch === 42 /* asterisk */ && this.source.charCodeAt(this.pos + 1) === 47 /* slash */) {
                                    multiCommentEnd = this.pos - 2;
                                    this.pos++;
                                    break;
                                }
                            }
                            if (multiCommentEnd == null && compiler_1.options.languageVersion !== LanguageVersion.tealScript) {
                                this.error("多行注释未关闭；应输入“*/”。");
                            }
                            this.comment(true, multiCommentStart, multiCommentEnd);
                            continue;
                        case 61 /* equals */:
                            result.type = 71 /* slashEquals */;
                            break;
                        default:
                            this.pos--;
                            result.type = 65 /* slash */;
                            break;
                    }
                    break;
                // .1、..、...
                case 46 /* dot */:
                    if (Unicode.isDecimalDigit(this.pos)) {
                        this.pos--;
                        result.data = this.scanNumericLiteral(48 /* num0 */);
                        result.type = 11 /* numericLiteral */;
                        break;
                    }
                    if (this.source.charCodeAt(this.pos) === 46 /* dot */) {
                        this.pos++; // .
                        if (this.source.charCodeAt(this.pos) === 46 /* dot */) {
                            this.pos++; // .
                            result.type = 57 /* dotDotDot */;
                            break;
                        }
                        result.type = 89 /* dotDot */;
                        break;
                    }
                    result.type = 88 /* dot */;
                    break;
                // (
                case 40 /* openParen */:
                    result.type = 61 /* openParen */;
                    break;
                // )
                case 41 /* closeParen */:
                    result.type = 2 /* closeParen */;
                    break;
                // {
                case 123 /* openBrace */:
                    result.type = 51 /* openBrace */;
                    break;
                // }
                case 125 /* closeBrace */:
                    result.type = 4 /* closeBrace */;
                    break;
                // ;
                case 59 /* semicolon */:
                    result.type = 6 /* semicolon */;
                    break;
                // =、==、===、=>
                case 61 /* equals */:
                    switch (this.source.charCodeAt(this.pos)) {
                        case 61 /* equals */:
                            this.pos++; // =
                            if (this.source.charCodeAt(this.pos) === 61 /* equals */) {
                                this.pos++; // =
                                if (compiler_1.options.allowGitConflictMarker !== false && result.hasLineBreakBeforeStart && this.skipGitConflictMarker(61 /* equals */, 4)) {
                                    // 跳过冲突的第二个版本。
                                    while (this.pos < this.source.length) {
                                        if (this.skipGitConflictMarker(62 /* greaterThan */, 7)) {
                                            break;
                                        }
                                        this.skipLine();
                                    }
                                    continue;
                                }
                                result.type = 99 /* equalsEqualsEquals */;
                                break;
                            }
                            result.type = 97 /* equalsEquals */;
                        case 62 /* greaterThan */:
                            this.pos++; // >
                            result.type = 69 /* equalsGreaterThan */;
                            break;
                        default:
                            result.type = 75 /* equals */;
                            break;
                    }
                    break;
                // '、"
                case 39 /* singleQuote */:
                case 34 /* doubleQuote */:
                    result.data = this.scanStringLiteral(ch);
                    result.type = 12 /* stringLiteral */;
                    break;
                // `
                case 96 /* backtick */:
                    result.data = this.scanStringLiteral(ch);
                    result.type = this.source.charCodeAt(this.pos - 1) === 123 /* openBrace */ ? 15 /* templateHead */ : 14 /* noSubstitutionTemplateLiteral */;
                    break;
                // +、++、+=
                case 43 /* plus */:
                    switch (this.source.charCodeAt(this.pos)) {
                        case 43 /* plus */:
                            this.pos++; // +
                            result.type = 66 /* plusPlus */;
                            break;
                        case 61 /* equals */:
                            this.pos++; // =
                            result.type = 76 /* plusEquals */;
                            break;
                        default:
                            result.type = 63 /* plus */;
                            break;
                    }
                    break;
                // -、--、-=
                case 45 /* minus */:
                    switch (this.source.charCodeAt(this.pos)) {
                        case 45 /* minus */:
                            this.pos++; // -
                            result.type = 67 /* minusMinus */;
                            break;
                        case 61 /* equals */:
                            this.pos++; // =
                            result.type = 77 /* minusEquals */;
                            break;
                        default:
                            result.type = 64 /* minus */;
                            break;
                    }
                    break;
                // ,
                case 44 /* comma */:
                    result.type = 109 /* comma */;
                    break;
                // :
                case 58 /* colon */:
                    result.type = 5 /* colon */;
                    break;
                // ?
                case 63 /* question */:
                    result.type = 108 /* question */;
                    break;
                // [
                case 91 /* openBracket */:
                    result.type = 62 /* openBracket */;
                    break;
                // ]
                case 93 /* closeBracket */:
                    result.type = 3 /* closeBracket */;
                    break;
                // 0x000、0b000、0O000、0
                case 48 /* num0 */:
                    switch (this.source.charCodeAt(this.pos++)) {
                        case 120 /* x */:
                        case 88 /* X */:
                            result.data = this.scanDights(16);
                            break;
                        case 98 /* b */:
                        case 66 /* B */:
                            result.data = this.scanDights(2);
                            break;
                        case 111 /* o */:
                        case 79 /* O */:
                            result.data = this.scanDights(8);
                            break;
                        default:
                            // EcmaScript 规定 0 后必须跟八进制数字，
                            // 实际上大部分编译器将 08 和 09 解释为十进制数字。
                            // todo: 严格模式需要输出语法错误。
                            result.data = Unicode.isOctalDigit(this.source.charCodeAt(--this.pos)) ?
                                this.scanDights(8) :
                                this.scanNumericLiteral(48 /* num0 */);
                            break;
                    }
                    result.type = 11 /* numericLiteral */;
                    break;
                // @
                case 64 /* at */:
                    result.type = 58 /* at */;
                    break;
                // !、!=、!==
                case 33 /* exclamation */:
                    if (this.source.charCodeAt(this.pos) === 61 /* equals */) {
                        if (this.source.charCodeAt(++this.pos) === 61 /* equals */) {
                            this.pos++; // =
                            result.type = 100 /* exclamationEqualsEquals */;
                            break;
                        }
                        result.type = 98 /* exclamationEquals */;
                        break;
                    }
                    result.type = 52 /* exclamation */;
                    break;
                // %、%=
                case 37 /* percent */:
                    if (this.source.charCodeAt(this.pos) === 75 /* equals */) {
                        this.pos++; // =
                        result.type = 79 /* percentEquals */;
                        break;
                    }
                    result.type = 93 /* percent */;
                    break;
                // &、&&、&=
                case 38 /* ampersand */:
                    switch (this.source.charCodeAt(this.pos)) {
                        case 38 /* ampersand */:
                            this.pos++; // &
                            result.type = 106 /* ampersandAmpersand */;
                            break;
                        case 61 /* equals */:
                            this.pos++; // =
                            result.type = 83 /* ampersandEquals */;
                            break;
                        default:
                            result.type = 92 /* ampersand */;
                            break;
                    }
                    break;
                // *、**、**=、*=
                case 42 /* asterisk */:
                    switch (this.source.charCodeAt(this.pos)) {
                        case 42 /* asterisk */:
                            if (this.source.charCodeAt(++this.pos) === 61 /* equals */) {
                                this.pos++; // =
                                result.type = 86 /* asteriskAsteriskEquals */;
                                break;
                            }
                            result.type = 74 /* asteriskAsterisk */;
                            break;
                        case 61 /* equals */:
                            this.pos++; // =
                            result.type = 78 /* asteriskEquals */;
                            break;
                        default:
                            result.type = 91 /* asterisk */;
                            break;
                    }
                    break;
                // <、<<、<<=、<=
                case 60 /* lessThan */:
                    switch (this.source.charCodeAt(this.pos)) {
                        case 60 /* lessThan */:
                            this.pos++; // <
                            if (compiler_1.options.allowGitConflictMarker !== false && result.hasLineBreakBeforeStart && this.skipGitConflictMarker(60 /* lessThan */, 5)) {
                                continue;
                            }
                            if (this.source.charCodeAt(this.pos) === 61 /* equals */) {
                                this.pos++; // =
                                result.type = 80 /* lessThanLessThanEquals */;
                                break;
                            }
                            result.type = 101 /* lessThanLessThan */;
                            break;
                        case 61 /* equals */:
                            this.pos++; // =
                            result.type = 95 /* lessThanEquals */;
                            break;
                        default:
                            result.type = 68 /* lessThan */;
                            break;
                    }
                    break;
                // >, >=, >>、>>=、>>>、>>>=
                case 62 /* greaterThan */:
                    switch (this.source.charCodeAt(this.pos)) {
                        case 61 /* equals */:
                            this.pos++; // =
                            result.type = 96 /* greaterThanEquals */;
                            break;
                        case 62 /* greaterThan */:
                            switch (this.source.charCodeAt(++this.pos)) {
                                case 61 /* equals */:
                                    this.pos++;
                                    result.type = 81 /* greaterThanGreaterThanEquals */;
                                    break;
                                case 62 /* greaterThan */:
                                    if (this.source.charCodeAt(++this.pos) === 61 /* equals */) {
                                        this.pos++;
                                        result.type = 82 /* greaterThanGreaterThanGreaterThanEquals */;
                                        break;
                                    }
                                    result.type = 103 /* greaterThanGreaterThanGreaterThan */;
                                    break;
                                default:
                                    result.type = 102 /* greaterThanGreaterThan */;
                                    break;
                            }
                            break;
                        default:
                            result.type = 94 /* greaterThan */;
                            break;
                    }
                    break;
                // |、|=、||
                case 124 /* bar */:
                    switch (this.source.charCodeAt(this.pos)) {
                        case 124 /* bar */:
                            this.pos++; // |
                            result.type = 107 /* barBar */;
                            break;
                        case 61 /* equals */:
                            this.pos++; // =
                            result.type = 84 /* barEquals */;
                            break;
                        default:
                            result.type = 104 /* bar */;
                            break;
                    }
                    break;
                // ~
                case 126 /* tilde */:
                    result.type = 59 /* tilde */;
                    break;
                // ^、^=
                case 94 /* caret */:
                    if (this.source.charCodeAt(this.pos) === 61 /* equals */) {
                        this.pos++; // =
                        result.type = 85 /* caretEquals */;
                        break;
                    }
                    result.type = 105 /* caret */;
                    break;
                // \u0000
                case 92 /* backslash */:
                    if (this.source.charCodeAt(this.pos) === 117 /* u */) {
                        this.pos++;
                        ch = this.scanDights(16, 4);
                        if (Unicode.isIdentifierStart(ch)) {
                            result.data = this.scanIdentifier(ch);
                            if ((compiler_1.options.languageVersion === LanguageVersion.javaScript3 || compiler_1.options.languageVersion === LanguageVersion.javaScript) && tokenType_1.stringToToken(result.data) !== 10 /* identifier */) {
                                this.error("关键字不能使用 Unicode 编码表示。");
                            }
                            result.type = 10 /* identifier */;
                            break;
                        }
                    }
                    this.error("非法字符：“{0}”。", '#');
                    continue;
                case undefined:
                    this.pos = this.source.length;
                    result.type = 1 /* endOfFile */;
                    break;
                // #
                case 35 /* hash */:
                    if (compiler_1.options.languageVersion === LanguageVersion.tealScript) {
                        this.skipLine();
                        continue;
                    }
                // 继续执行。
                default:
                    // 数字。
                    if (Unicode.isDecimalDigit(ch)) {
                        result.data = this.scanNumericLiteral(ch);
                        result.type = 11 /* numericLiteral */;
                        break;
                    }
                    // 标识符。
                    if (Unicode.isIdentifierStart(ch)) {
                        result.data = this.scanIdentifier();
                        result.type = 10 /* identifier */;
                        break;
                    }
                    // 空白。
                    if (Unicode.isWhiteSpace(ch)) {
                        continue;
                    }
                    if (Unicode.isLineTerminator(ch)) {
                        result.hasLineBreakBeforeStart = true;
                        continue;
                    }
                    // 剩下的字符为不支持的字符。
                    this.error("非法字符：“{0}”。", String.fromCharCode(ch));
                    continue;
            }
            break;
        }
        result.end = this.pos;
        return result;
    };
    /**
     * 扫描紧跟的标识符。
     * @param currentChar 当前已读取的字符。如果不传递则直接从当前位置获取。
     */
    Lexer.prototype.scanIdentifier = function (currentChar) {
        console.assert(Unicode.isIdentifierStart(currentChar == undefined ? this.source.charCodeAt(this.pos) : currentChar));
        var result;
        var start = this.pos;
        while (true) {
            var ch = this.source.charCodeAt(this.pos);
            if (!Unicode.isIdentifierPart(ch)) {
                if (ch === 92 /* backslash */) {
                    // 处理反斜杠之前的标识符部分。
                    if (result == undefined) {
                        if (currentChar == undefined) {
                            start--;
                            result = "";
                        }
                        else {
                            result = String.fromCharCode(currentChar);
                        }
                    }
                    result += this.source.substring(start, this.pos);
                    // 处理转义字符。
                    if (this.source.charCodeAt(++this.pos) === 117 /* u */) {
                        this.pos++; // u
                        result += String.fromCharCode(this.scanDights(16, 4));
                    }
                    else {
                        this.error("非法字符：“\\”；应输入“u”。");
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
    };
    /**
     * 扫描紧跟的字符串。
     * @param currentChar 当前已读取的字符。只能是 '、" 或 `。
     */
    Lexer.prototype.scanStringLiteral = function (currentChar) {
        // ''' 多行不转义字符串。
        if (compiler_1.options.languageVersion === LanguageVersion.tealScript &&
            this.source.charCodeAt(this.pos + 1) === currentChar &&
            this.source.charCodeAt(this.pos) === currentChar) {
            var start_1 = this.pos += 2;
            for (; this.pos < this.source.length; this.pos++) {
                if (this.source.charCodeAt(this.pos) === currentChar &&
                    this.source.charCodeAt(this.pos + 1) === currentChar &&
                    this.source.charCodeAt(this.pos + 2) === currentChar) {
                    var end = this.pos;
                    this.pos += 3;
                    return this.source.substring(start_1, end);
                }
            }
            if (compiler_1.options.allowUnterminatedLiteral === false) {
                this.error("字符串未关闭；应输入“{0}”", String.fromCharCode(currentChar) + String.fromCharCode(currentChar) + String.fromCharCode(currentChar));
            }
            return this.source.substring(start_1, this.pos);
        }
        // 普通字符串和模板字符串。
        var result = "";
        var start = this.pos;
        while (true) {
            var ch = this.source.charCodeAt(this.pos);
            switch (ch) {
                case currentChar:
                    return result + this.source.substring(start, this.pos++);
                case 92 /* backslash */:
                    result += this.source.substring(start, this.pos++); // \
                    ch = this.source.charCodeAt(this.pos++); // 转义字符。
                    switch (ch) {
                        case 39 /* singleQuote */:
                            result += '\'';
                            break;
                        case 34 /* doubleQuote */:
                            result += '\"';
                            break;
                        case 96 /* backtick */:
                            result += '`';
                            break;
                        case 110 /* n */:
                            result += '\n';
                            break;
                        case 114 /* r */:
                            result += '\r';
                            break;
                        case 116 /* t */:
                            result += '\t';
                            break;
                        case 117 /* u */:
                            // \u{00000000}
                            if (compiler_1.options.languageVersion !== LanguageVersion.javaScript3 &&
                                this.source.charCodeAt(this.pos) === 123 /* openBrace */) {
                                this.pos++; // {
                                ch = this.scanDights(16);
                                if (ch > 0x10FFFF) {
                                    this.error("扩展 Unicode 字符必须在 0x0 到 0x10FFFF 之间");
                                    break;
                                }
                                result += ch <= 65535 ? String.fromCharCode(ch) : String.fromCharCode(Math.floor((ch - 65536) / 1024) + 0xD800, ((ch - 65536) % 1024) + 0xDC00);
                                if (this.source.charCodeAt(this.pos++) !== 125 /* closeBrace */) {
                                    this.pos--;
                                    this.error("扩展 Unicode 字符未关闭；应输入“}”");
                                    break;
                                }
                            }
                            else {
                                result += String.fromCharCode(this.scanDights(16, 4));
                            }
                            break;
                        case 120 /* x */:
                            result += String.fromCharCode(this.scanDights(16, 2));
                            break;
                        case 98 /* b */:
                            result += '\b';
                            break;
                        case 118 /* v */:
                            result += '\v';
                            break;
                        case 102 /* f */:
                            result += '\f';
                            break;
                        case 13 /* carriageReturn */:
                            if (this.source.charCodeAt(this.pos) === 10 /* lineFeed */) {
                                this.pos++; // \n
                            }
                        // 继续执行。
                        case 10 /* lineFeed */:
                        case 8232 /* lineSeparator */:
                        case 8233 /* paragraphSeparator */:
                            break;
                        case undefined:
                            this.pos--;
                            this.error("应输入转义字符。");
                            return result;
                        default:
                            result += String.fromCharCode(Unicode.isOctalDigit(ch) ? this.scanDights(8, undefined, 256) : ch);
                            break;
                    }
                    start = this.pos;
                    continue;
                case 36 /* dollar */:
                    this.pos++; // $
                    // 模板字符串中的 ${ 。
                    if (currentChar === 96 /* backtick */ &&
                        this.source.charCodeAt(this.pos) === 123 /* openBrace */) {
                        return result + this.source.substring(start, this.pos++ - 1); // {
                    }
                    continue;
                case 13 /* carriageReturn */:
                    // 仅在模板字符串内部可换行。换行符 \r 和 \r\n 转 \n。
                    if (currentChar === 96 /* backtick */) {
                        result += this.source.substring(start, this.pos++) + "\n"; // \r
                        if (this.source.charCodeAt(this.pos) === 10 /* lineFeed */) {
                            this.pos++; // \n
                        }
                        start = this.pos;
                        continue;
                    }
                    break;
                case 10 /* lineFeed */:
                    // 仅在模板字符串内部可换行。
                    if (currentChar === 96 /* backtick */) {
                        result += this.source.substring(start, this.pos++) + "\n"; // \n
                        start = this.pos;
                        continue;
                    }
                    break;
            }
            if (ch == undefined || Unicode.isLineTerminator(ch)) {
                break;
            }
            this.pos++; // 字符串的字符。
        }
        this.error("字符串未关闭；应输入“{0}”。", String.fromCharCode(currentChar));
        return result + this.source.substring(start, this.pos);
    };
    /**
     * 扫描紧跟的数字部分。
     * @param currentChar 当前已读取的数字字符。
     */
    Lexer.prototype.scanNumericLiteral = function (currentChar) {
        // 读取整数部分。
        var result = currentChar - 48 /* num0 */;
        while (true) {
            var num = this.source.charCodeAt(this.pos) - 48 /* num0 */;
            if (num >= 0 && num <= 9) {
                this.pos++; // 整数部分。
                result = result * 10 + num;
            }
            else {
                break;
            }
        }
        // 读取小数部分。
        if (this.source.charCodeAt(this.pos) === 46 /* dot */) {
            this.pos++; // .
            var p = 1;
            while (true) {
                var num = this.source.charCodeAt(this.pos) - 48 /* num0 */;
                if (num >= 0 && num <= 9) {
                    this.pos++; // 小数部分。
                    result += num / p;
                    p *= 10;
                }
                else {
                    break;
                }
            }
        }
        // 读取科学计数法部分。
        switch (this.source.charCodeAt(this.pos)) {
            case 101 /* e */:
            case 69 /* E */:
                var base = void 0;
                switch (this.source.charCodeAt(this.pos)) {
                    case 45 /* minus */:
                        this.pos++; // -
                        base = -this.scanDights(10);
                        break;
                    case 43 /* plus */:
                        this.pos++; // +
                    // 继续执行
                    default:
                        base = this.scanDights(10);
                        break;
                }
                result *= Math.pow(10, base);
                break;
        }
        return result;
    };
    /**
     * 扫描紧跟的数字字符。
     * @param base 进制基数。可以是 2、8、10 或 16。
     * @param count 要求的解析字数。如果未传递则不限制。
     * @param max 允许解析的最大值。如果未传递则不限制。
     * @return 返回解析的数值。
     */
    Lexer.prototype.scanDights = function (base, count, max) {
        var result = 0;
        var start = this.pos;
        while (true) {
            var num = this.source.charCodeAt(this.pos);
            num = base <= 9 || num >= 48 /* num0 */ && num <= 57 /* num9 */ ? num - 48 /* num0 */ :
                num >= 65 /* A */ && num <= 90 /* Z */ ? 10 + num - 65 /* A */ :
                    num >= 97 /* a */ && num <= 122 /* z */ ? 10 + num - 97 /* a */ : -1;
            // 解析到不合法的数字或超过范围则停止解析。
            if (num < 0 || num >= base ||
                count != undefined && count-- === 0 ||
                max != undefined && result * base + num >= max) {
                break;
            }
            result = result * base + num;
            this.pos++;
        }
        if (start === this.pos || count > 0) {
            this.error(base === 2 ? "应输入二进制数字。" : base === 8 ? "应输入八进制数字。" : base === 16 ? "应输入十六进制数字。" : "应输入数字。");
        }
        return result;
    };
    /**
     * 跳过当前紧跟 Git 的冲突标记。
     * @param currentChar 当前已读取的字符。只能是 <、= 或 >。
     * @param repeatCount 要求的重复个数。
     * @returns 如果跳过成功则返回 true，否则返回 false。
     */
    Lexer.prototype.skipGitConflictMarker = function (currentChar, repeatCount) {
        for (var i = 0; i < repeatCount; i++) {
            if (this.source.charCodeAt(this.pos + i) !== currentChar) {
                return false;
            }
        }
        if (this.source.charCodeAt(this.pos + repeatCount) !== 32 /* space */) {
            return false;
        }
        this.pos += repeatCount;
        this.skipLine();
        return true;
    };
    // #endregion
    // #region 重新读取
    /**
     * 以正则表达式重新读取下一个标记。
     */
    Lexer.prototype.readAsRegularExpressionLiteral = function () {
        console.assert(this.source.charCodeAt(this.current.start) === 47 /* slash */);
        // FIXME: 需要测试正则表达式语法?
        var pattern;
        var flags;
        var data;
        var start = this.current.start + 1;
        this.pos = start;
        var tokenIsUnterminated = false;
        var inCharacterClass = false;
        while (true) {
            var ch = this.source.charCodeAt(this.pos++);
            switch (ch) {
                case 47 /* slash */:
                    if (inCharacterClass) {
                        continue;
                    }
                    break;
                case 91 /* openBracket */:
                    inCharacterClass = true;
                    break;
                case 93 /* closeBracket */:
                    inCharacterClass = false;
                    break;
                case 92 /* backslash */:
                    ch = this.source.charCodeAt(++this.pos); // 转义字符
                    if (ch == undefined || Unicode.isLineTerminator(ch)) {
                        tokenIsUnterminated = true;
                    }
                    continue;
                default:
                    if (ch == undefined || Unicode.isLineTerminator(ch)) {
                        this.pos--;
                        tokenIsUnterminated = true;
                        break;
                    }
                    continue;
            }
            break;
        }
        if (tokenIsUnterminated) {
            this.error("正则表达式未关闭；应输入“/”");
            pattern = this.source.substring(start, this.pos);
        }
        else {
            pattern = this.source.substring(start, this.pos - 1);
            start = this.pos;
            while (Unicode.isIdentifierPart(this.source.charCodeAt(this.pos))) {
                this.pos++;
            }
            flags = this.source.substring(start, this.pos);
        }
        return this.current = this.current._next = {
            start: this.current.start,
            type: 13 /* regularExpressionLiteral */,
            data: { pattern: pattern, flags: flags },
            end: this.pos
        };
    };
    /**
     * 以模板中间或尾部重新读取下一个标记。
     */
    Lexer.prototype.readAsTemplateMiddleOrTail = function () {
        console.assert(this.source.charCodeAt(this.current.start) === 125 /* closeBrace */);
        var start = this.current.start + 1;
        this.pos = start;
        var data = this.scanStringLiteral(96 /* backtick */);
        return this.current = this.current._next = {
            start: this.current.start,
            type: this.source.charCodeAt(this.pos - 1) === 123 /* openBrace */ ? 7 /* templateMiddle */ : 8 /* templateTail */,
            data: data,
            end: this.pos
        };
    };
    /**
     * 以 JSX 标签名重新读取下一个标记。
     */
    Lexer.prototype.readAsJsxTagName = function () {
    };
    return Lexer;
}());
exports.Lexer = Lexer;
//# sourceMappingURL=lexer.js.map