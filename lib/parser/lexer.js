/**
 * @fileOverview 词法解析器
 */
var charCode_1 = require('./charCode');
/**
 * 表示一个词法解析器。
 */
var Lexer = (function () {
    function Lexer() {
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
    };
    /**
     * 读取下一个标记。
     */
    Lexer.prototype.read = function () {
        return this.currentToken;
    };
    /**
     * 预览下一个标记。
     */
    Lexer.prototype.peek = function () {
        return this.peekToken;
    };
    /**
     * 保存当前读取的进度。
     */
    Lexer.prototype.stashSave = function () {
    };
    /**
     * 恢复当前读取的进度。
     */
    Lexer.prototype.stashRestore = function () {
    };
    Lexer.prototype.scan = function () {
        startPos = pos;
        hasExtendedUnicodeEscape = false;
        precedingLineBreak = false;
        tokenIsUnterminated = false;
        while (true) {
            tokenPos = pos;
            if (pos >= end) {
                return token = SyntaxKind.EndOfFileToken;
            }
            var ch = text.charCodeAt(pos);
            // Special handling for shebang
            if (ch === charCode_1.CharCode.hash && pos === 0 && isShebangTrivia(text, pos)) {
                pos = scanShebangTrivia(text, pos);
                if (skipTrivia) {
                    continue;
                }
                else {
                    return token = SyntaxKind.ShebangTrivia;
                }
            }
            switch (ch) {
                case charCode_1.CharCode.lineFeed:
                case charCode_1.CharCode.carriageReturn:
                    precedingLineBreak = true;
                    if (skipTrivia) {
                        pos++;
                        continue;
                    }
                    else {
                        if (ch === charCode_1.CharCode.carriageReturn && pos + 1 < end && text.charCodeAt(pos + 1) === charCode_1.CharCode.lineFeed) {
                            // consume both CR and LF
                            pos += 2;
                        }
                        else {
                            pos++;
                        }
                        return token = SyntaxKind.NewLineTrivia;
                    }
                case charCode_1.CharCode.tab:
                case charCode_1.CharCode.verticalTab:
                case charCode_1.CharCode.formFeed:
                case charCode_1.CharCode.space:
                    if (skipTrivia) {
                        pos++;
                        continue;
                    }
                    else {
                        while (pos < end && isWhiteSpace(text.charCodeAt(pos))) {
                            pos++;
                        }
                        return token = SyntaxKind.WhitespaceTrivia;
                    }
                case charCode_1.CharCode.exclamation:
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.equals) {
                        if (text.charCodeAt(pos + 2) === charCode_1.CharCode.equals) {
                            return pos += 3, token = SyntaxKind.ExclamationEqualsEqualsToken;
                        }
                        return pos += 2, token = SyntaxKind.ExclamationEqualsToken;
                    }
                    pos++;
                    return token = SyntaxKind.ExclamationToken;
                case charCode_1.CharCode.doubleQuote:
                case charCode_1.CharCode.singleQuote:
                    tokenValue = scanString();
                    return token = SyntaxKind.StringLiteral;
                case charCode_1.CharCode.backtick:
                    return token = scanTemplateAndSetTokenValue();
                case charCode_1.CharCode.percent:
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.equals) {
                        return pos += 2, token = SyntaxKind.PercentEqualsToken;
                    }
                    pos++;
                    return token = SyntaxKind.PercentToken;
                case charCode_1.CharCode.ampersand:
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.ampersand) {
                        return pos += 2, token = SyntaxKind.AmpersandAmpersandToken;
                    }
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.equals) {
                        return pos += 2, token = SyntaxKind.AmpersandEqualsToken;
                    }
                    pos++;
                    return token = SyntaxKind.AmpersandToken;
                case charCode_1.CharCode.openParen:
                    pos++;
                    return token = SyntaxKind.OpenParenToken;
                case charCode_1.CharCode.closeParen:
                    pos++;
                    return token = SyntaxKind.CloseParenToken;
                case charCode_1.CharCode.asterisk:
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.equals) {
                        return pos += 2, token = SyntaxKind.AsteriskEqualsToken;
                    }
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.asterisk) {
                        if (text.charCodeAt(pos + 2) === charCode_1.CharCode.equals) {
                            return pos += 3, token = SyntaxKind.AsteriskAsteriskEqualsToken;
                        }
                        return pos += 2, token = SyntaxKind.AsteriskAsteriskToken;
                    }
                    pos++;
                    return token = SyntaxKind.AsteriskToken;
                case charCode_1.CharCode.plus:
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.plus) {
                        return pos += 2, token = SyntaxKind.PlusPlusToken;
                    }
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.equals) {
                        return pos += 2, token = SyntaxKind.PlusEqualsToken;
                    }
                    pos++;
                    return token = SyntaxKind.PlusToken;
                case charCode_1.CharCode.comma:
                    pos++;
                    return token = SyntaxKind.CommaToken;
                case charCode_1.CharCode.minus:
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.minus) {
                        return pos += 2, token = SyntaxKind.MinusMinusToken;
                    }
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.equals) {
                        return pos += 2, token = SyntaxKind.MinusEqualsToken;
                    }
                    pos++;
                    return token = SyntaxKind.MinusToken;
                case charCode_1.CharCode.dot:
                    if (isDigit(text.charCodeAt(pos + 1))) {
                        tokenValue = scanNumber();
                        return token = SyntaxKind.NumericLiteral;
                    }
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.dot && text.charCodeAt(pos + 2) === charCode_1.CharCode.dot) {
                        return pos += 3, token = SyntaxKind.DotDotDotToken;
                    }
                    pos++;
                    return token = SyntaxKind.DotToken;
                case charCode_1.CharCode.slash:
                    // Single-line comment
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.slash) {
                        pos += 2;
                        while (pos < end) {
                            if (isLineBreak(text.charCodeAt(pos))) {
                                break;
                            }
                            pos++;
                        }
                        if (skipTrivia) {
                            continue;
                        }
                        else {
                            return token = SyntaxKind.SingleLineCommentTrivia;
                        }
                    }
                    // Multi-line comment
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.asterisk) {
                        pos += 2;
                        var commentClosed = false;
                        while (pos < end) {
                            var ch_1 = text.charCodeAt(pos);
                            if (ch_1 === charCode_1.CharCode.asterisk && text.charCodeAt(pos + 1) === charCode_1.CharCode.slash) {
                                pos += 2;
                                commentClosed = true;
                                break;
                            }
                            if (isLineBreak(ch_1)) {
                                precedingLineBreak = true;
                            }
                            pos++;
                        }
                        if (!commentClosed) {
                            error(Diagnostics.Asterisk_Slash_expected);
                        }
                        if (skipTrivia) {
                            continue;
                        }
                        else {
                            tokenIsUnterminated = !commentClosed;
                            return token = SyntaxKind.MultiLineCommentTrivia;
                        }
                    }
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.equals) {
                        return pos += 2, token = SyntaxKind.SlashEqualsToken;
                    }
                    pos++;
                    return token = SyntaxKind.SlashToken;
                case charCode_1.CharCode._0:
                    if (pos + 2 < end && (text.charCodeAt(pos + 1) === charCode_1.CharCode.X || text.charCodeAt(pos + 1) === charCode_1.CharCode.x)) {
                        pos += 2;
                        var value = scanMinimumNumberOfHexDigits(1);
                        if (value < 0) {
                            error(Diagnostics.Hexadecimal_digit_expected);
                            value = 0;
                        }
                        tokenValue = "" + value;
                        return token = SyntaxKind.NumericLiteral;
                    }
                    else if (pos + 2 < end && (text.charCodeAt(pos + 1) === charCode_1.CharCode.B || text.charCodeAt(pos + 1) === charCode_1.CharCode.b)) {
                        pos += 2;
                        var value = scanBinaryOrOctalDigits(/* base */ 2);
                        if (value < 0) {
                            error(Diagnostics.Binary_digit_expected);
                            value = 0;
                        }
                        tokenValue = "" + value;
                        return token = SyntaxKind.NumericLiteral;
                    }
                    else if (pos + 2 < end && (text.charCodeAt(pos + 1) === charCode_1.CharCode.O || text.charCodeAt(pos + 1) === charCode_1.CharCode.o)) {
                        pos += 2;
                        var value = scanBinaryOrOctalDigits(/* base */ 8);
                        if (value < 0) {
                            error(Diagnostics.Octal_digit_expected);
                            value = 0;
                        }
                        tokenValue = "" + value;
                        return token = SyntaxKind.NumericLiteral;
                    }
                    // Try to parse as an octal
                    if (pos + 1 < end && isOctalDigit(text.charCodeAt(pos + 1))) {
                        tokenValue = "" + scanOctalDigits();
                        return token = SyntaxKind.NumericLiteral;
                    }
                // This fall-through is a deviation from the EcmaScript grammar. The grammar says that a leading zero
                // can only be followed by an octal digit, a dot, or the end of the number literal. However, we are being
                // permissive and allowing decimal digits of the form 08* and 09* (which many browsers also do).
                case charCode_1.CharCode._1:
                case charCode_1.CharCode._2:
                case charCode_1.CharCode._3:
                case charCode_1.CharCode._4:
                case charCode_1.CharCode._5:
                case charCode_1.CharCode._6:
                case charCode_1.CharCode._7:
                case charCode_1.CharCode._8:
                case charCode_1.CharCode._9:
                    tokenValue = scanNumber();
                    return token = SyntaxKind.NumericLiteral;
                case charCode_1.CharCode.colon:
                    pos++;
                    return token = SyntaxKind.ColonToken;
                case charCode_1.CharCode.semicolon:
                    pos++;
                    return token = SyntaxKind.SemicolonToken;
                case charCode_1.CharCode.lessThan:
                    if (isConflictMarkerTrivia(text, pos)) {
                        pos = scanConflictMarkerTrivia(text, pos, error);
                        if (skipTrivia) {
                            continue;
                        }
                        else {
                            return token = SyntaxKind.ConflictMarkerTrivia;
                        }
                    }
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.lessThan) {
                        if (text.charCodeAt(pos + 2) === charCode_1.CharCode.equals) {
                            return pos += 3, token = SyntaxKind.LessThanLessThanEqualsToken;
                        }
                        return pos += 2, token = SyntaxKind.LessThanLessThanToken;
                    }
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.equals) {
                        return pos += 2, token = SyntaxKind.LessThanEqualsToken;
                    }
                    if (languageVariant === LanguageVariant.JSX &&
                        text.charCodeAt(pos + 1) === charCode_1.CharCode.slash &&
                        text.charCodeAt(pos + 2) !== charCode_1.CharCode.asterisk) {
                        return pos += 2, token = SyntaxKind.LessThanSlashToken;
                    }
                    pos++;
                    return token = SyntaxKind.LessThanToken;
                case charCode_1.CharCode.equals:
                    if (isConflictMarkerTrivia(text, pos)) {
                        pos = scanConflictMarkerTrivia(text, pos, error);
                        if (skipTrivia) {
                            continue;
                        }
                        else {
                            return token = SyntaxKind.ConflictMarkerTrivia;
                        }
                    }
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.equals) {
                        if (text.charCodeAt(pos + 2) === charCode_1.CharCode.equals) {
                            return pos += 3, token = SyntaxKind.EqualsEqualsEqualsToken;
                        }
                        return pos += 2, token = SyntaxKind.EqualsEqualsToken;
                    }
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.greaterThan) {
                        return pos += 2, token = SyntaxKind.EqualsGreaterThanToken;
                    }
                    pos++;
                    return token = SyntaxKind.EqualsToken;
                case charCode_1.CharCode.greaterThan:
                    if (isConflictMarkerTrivia(text, pos)) {
                        pos = scanConflictMarkerTrivia(text, pos, error);
                        if (skipTrivia) {
                            continue;
                        }
                        else {
                            return token = SyntaxKind.ConflictMarkerTrivia;
                        }
                    }
                    pos++;
                    return token = SyntaxKind.GreaterThanToken;
                case charCode_1.CharCode.question:
                    pos++;
                    return token = SyntaxKind.QuestionToken;
                case charCode_1.CharCode.openBracket:
                    pos++;
                    return token = SyntaxKind.OpenBracketToken;
                case charCode_1.CharCode.closeBracket:
                    pos++;
                    return token = SyntaxKind.CloseBracketToken;
                case charCode_1.CharCode.caret:
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.equals) {
                        return pos += 2, token = SyntaxKind.CaretEqualsToken;
                    }
                    pos++;
                    return token = SyntaxKind.CaretToken;
                case charCode_1.CharCode.openBrace:
                    pos++;
                    return token = SyntaxKind.OpenBraceToken;
                case charCode_1.CharCode.bar:
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.bar) {
                        return pos += 2, token = SyntaxKind.BarBarToken;
                    }
                    if (text.charCodeAt(pos + 1) === charCode_1.CharCode.equals) {
                        return pos += 2, token = SyntaxKind.BarEqualsToken;
                    }
                    pos++;
                    return token = SyntaxKind.BarToken;
                case charCode_1.CharCode.closeBrace:
                    pos++;
                    return token = SyntaxKind.CloseBraceToken;
                case charCode_1.CharCode.tilde:
                    pos++;
                    return token = SyntaxKind.TildeToken;
                case charCode_1.CharCode.at:
                    pos++;
                    return token = SyntaxKind.AtToken;
                case charCode_1.CharCode.backslash:
                    var cookedChar = peekUnicodeEscape();
                    if (cookedChar >= 0 && isIdentifierStart(cookedChar, languageVersion)) {
                        pos += 6;
                        tokenValue = String.fromCharCode(cookedChar) + scanIdentifierParts();
                        return token = getIdentifierToken();
                    }
                    error(Diagnostics.Invalid_character);
                    pos++;
                    return token = SyntaxKind.Unknown;
                default:
                    if (isIdentifierStart(ch, languageVersion)) {
                        pos++;
                        while (pos < end && isIdentifierPart(ch = text.charCodeAt(pos), languageVersion))
                            pos++;
                        tokenValue = text.substring(tokenPos, pos);
                        if (ch === charCode_1.CharCode.backslash) {
                            tokenValue += scanIdentifierParts();
                        }
                        return token = getIdentifierToken();
                    }
                    else if (isWhiteSpace(ch)) {
                        pos++;
                        continue;
                    }
                    else if (isLineBreak(ch)) {
                        precedingLineBreak = true;
                        pos++;
                        continue;
                    }
                    error(Diagnostics.Invalid_character);
                    pos++;
                    return token = SyntaxKind.Unknown;
            }
        }
    };
    return Lexer;
}());
exports.Lexer = Lexer;
//# sourceMappingURL=lexer.js.map