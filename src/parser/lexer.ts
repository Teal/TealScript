/**
 * @fileOverview 词法解析器
 */

import {TokenType} from './tokenType';
import {CharCode} from './charCode';

/**
 * 表示一个词法解析器。
 */
export class Lexer {

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
    }

    /**
     * 获取当前的标记类型。
     */
    tokenType: TokenType;

    /**
     * 获取当前的标记开始位置。
     */
    tokenStart: number;

    /**
     * 获取当前的标记结束位置。
     */
    tokenEnd: number;

    /**
     * 判断当前标记之前是否存在换行符。
     */
    hasLineTerminatorBeforeTokenStart: boolean;

    /**
     * 获取当前的标记。
     */
    currentToken: Token;

    /**
     * 获取当前的标记。
     */
    peekToken: Token;

    /**
     * 读取下一个标记。
     */
    read() {
        return this.currentToken;
    }

    /**
     * 预览下一个标记。
     */
    peek() {
        return this.peekToken;
    }

    /**
     * 保存当前读取的进度。
     */
    stashSave() {

    }

    /**
     * 恢复当前读取的进度。
     */
    stashRestore() {

    }

    private scan() {
        startPos = pos;
        hasExtendedUnicodeEscape = false;
        precedingLineBreak = false;
        tokenIsUnterminated = false;
        while (true) {
            tokenPos = pos;
            if (pos >= end) {
                return token = SyntaxKind.EndOfFileToken;
            }
            let ch = text.charCodeAt(pos);

            // Special handling for shebang
            if (ch === CharCode.hash && pos === 0 && isShebangTrivia(text, pos)) {
                pos = scanShebangTrivia(text, pos);
                if (skipTrivia) {
                    continue;
                }
                else {
                    return token = SyntaxKind.ShebangTrivia;
                }
            }

            switch (ch) {
                case CharCode.lineFeed:
                case CharCode.carriageReturn:
                    precedingLineBreak = true;
                    if (skipTrivia) {
                        pos++;
                        continue;
                    }
                    else {
                        if (ch === CharCode.carriageReturn && pos + 1 < end && text.charCodeAt(pos + 1) === CharCode.lineFeed) {
                            // consume both CR and LF
                            pos += 2;
                        }
                        else {
                            pos++;
                        }
                        return token = SyntaxKind.NewLineTrivia;
                    }
                case CharCode.tab:
                case CharCode.verticalTab:
                case CharCode.formFeed:
                case CharCode.space:
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
                case CharCode.exclamation:
                    if (text.charCodeAt(pos + 1) === CharCode.equals) {
                        if (text.charCodeAt(pos + 2) === CharCode.equals) {
                            return pos += 3, token = SyntaxKind.ExclamationEqualsEqualsToken;
                        }
                        return pos += 2, token = SyntaxKind.ExclamationEqualsToken;
                    }
                    pos++;
                    return token = SyntaxKind.ExclamationToken;
                case CharCode.doubleQuote:
                case CharCode.singleQuote:
                    tokenValue = scanString();
                    return token = SyntaxKind.StringLiteral;
                case CharCode.backtick:
                    return token = scanTemplateAndSetTokenValue();
                case CharCode.percent:
                    if (text.charCodeAt(pos + 1) === CharCode.equals) {
                        return pos += 2, token = SyntaxKind.PercentEqualsToken;
                    }
                    pos++;
                    return token = SyntaxKind.PercentToken;
                case CharCode.ampersand:
                    if (text.charCodeAt(pos + 1) === CharCode.ampersand) {
                        return pos += 2, token = SyntaxKind.AmpersandAmpersandToken;
                    }
                    if (text.charCodeAt(pos + 1) === CharCode.equals) {
                        return pos += 2, token = SyntaxKind.AmpersandEqualsToken;
                    }
                    pos++;
                    return token = SyntaxKind.AmpersandToken;
                case CharCode.openParen:
                    pos++;
                    return token = SyntaxKind.OpenParenToken;
                case CharCode.closeParen:
                    pos++;
                    return token = SyntaxKind.CloseParenToken;
                case CharCode.asterisk:
                    if (text.charCodeAt(pos + 1) === CharCode.equals) {
                        return pos += 2, token = SyntaxKind.AsteriskEqualsToken;
                    }
                    if (text.charCodeAt(pos + 1) === CharCode.asterisk) {
                        if (text.charCodeAt(pos + 2) === CharCode.equals) {
                            return pos += 3, token = SyntaxKind.AsteriskAsteriskEqualsToken;
                        }
                        return pos += 2, token = SyntaxKind.AsteriskAsteriskToken;
                    }
                    pos++;
                    return token = SyntaxKind.AsteriskToken;
                case CharCode.plus:
                    if (text.charCodeAt(pos + 1) === CharCode.plus) {
                        return pos += 2, token = SyntaxKind.PlusPlusToken;
                    }
                    if (text.charCodeAt(pos + 1) === CharCode.equals) {
                        return pos += 2, token = SyntaxKind.PlusEqualsToken;
                    }
                    pos++;
                    return token = SyntaxKind.PlusToken;
                case CharCode.comma:
                    pos++;
                    return token = SyntaxKind.CommaToken;
                case CharCode.minus:
                    if (text.charCodeAt(pos + 1) === CharCode.minus) {
                        return pos += 2, token = SyntaxKind.MinusMinusToken;
                    }
                    if (text.charCodeAt(pos + 1) === CharCode.equals) {
                        return pos += 2, token = SyntaxKind.MinusEqualsToken;
                    }
                    pos++;
                    return token = SyntaxKind.MinusToken;
                case CharCode.dot:
                    if (isDigit(text.charCodeAt(pos + 1))) {
                        tokenValue = scanNumber();
                        return token = SyntaxKind.NumericLiteral;
                    }
                    if (text.charCodeAt(pos + 1) === CharCode.dot && text.charCodeAt(pos + 2) === CharCode.dot) {
                        return pos += 3, token = SyntaxKind.DotDotDotToken;
                    }
                    pos++;
                    return token = SyntaxKind.DotToken;
                case CharCode.slash:
                    // Single-line comment
                    if (text.charCodeAt(pos + 1) === CharCode.slash) {
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
                    if (text.charCodeAt(pos + 1) === CharCode.asterisk) {
                        pos += 2;

                        let commentClosed = false;
                        while (pos < end) {
                            const ch = text.charCodeAt(pos);

                            if (ch === CharCode.asterisk && text.charCodeAt(pos + 1) === CharCode.slash) {
                                pos += 2;
                                commentClosed = true;
                                break;
                            }

                            if (isLineBreak(ch)) {
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

                    if (text.charCodeAt(pos + 1) === CharCode.equals) {
                        return pos += 2, token = SyntaxKind.SlashEqualsToken;
                    }

                    pos++;
                    return token = SyntaxKind.SlashToken;

                case CharCode._0:
                    if (pos + 2 < end && (text.charCodeAt(pos + 1) === CharCode.X || text.charCodeAt(pos + 1) === CharCode.x)) {
                        pos += 2;
                        let value = scanMinimumNumberOfHexDigits(1);
                        if (value < 0) {
                            error(Diagnostics.Hexadecimal_digit_expected);
                            value = 0;
                        }
                        tokenValue = "" + value;
                        return token = SyntaxKind.NumericLiteral;
                    }
                    else if (pos + 2 < end && (text.charCodeAt(pos + 1) === CharCode.B || text.charCodeAt(pos + 1) === CharCode.b)) {
                        pos += 2;
                        let value = scanBinaryOrOctalDigits(/* base */ 2);
                        if (value < 0) {
                            error(Diagnostics.Binary_digit_expected);
                            value = 0;
                        }
                        tokenValue = "" + value;
                        return token = SyntaxKind.NumericLiteral;
                    }
                    else if (pos + 2 < end && (text.charCodeAt(pos + 1) === CharCode.O || text.charCodeAt(pos + 1) === CharCode.o)) {
                        pos += 2;
                        let value = scanBinaryOrOctalDigits(/* base */ 8);
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
                case CharCode._1:
                case CharCode._2:
                case CharCode._3:
                case CharCode._4:
                case CharCode._5:
                case CharCode._6:
                case CharCode._7:
                case CharCode._8:
                case CharCode._9:
                    tokenValue = scanNumber();
                    return token = SyntaxKind.NumericLiteral;
                case CharCode.colon:
                    pos++;
                    return token = SyntaxKind.ColonToken;
                case CharCode.semicolon:
                    pos++;
                    return token = SyntaxKind.SemicolonToken;
                case CharCode.lessThan:
                    if (isConflictMarkerTrivia(text, pos)) {
                        pos = scanConflictMarkerTrivia(text, pos, error);
                        if (skipTrivia) {
                            continue;
                        }
                        else {
                            return token = SyntaxKind.ConflictMarkerTrivia;
                        }
                    }

                    if (text.charCodeAt(pos + 1) === CharCode.lessThan) {
                        if (text.charCodeAt(pos + 2) === CharCode.equals) {
                            return pos += 3, token = SyntaxKind.LessThanLessThanEqualsToken;
                        }
                        return pos += 2, token = SyntaxKind.LessThanLessThanToken;
                    }
                    if (text.charCodeAt(pos + 1) === CharCode.equals) {
                        return pos += 2, token = SyntaxKind.LessThanEqualsToken;
                    }
                    if (languageVariant === LanguageVariant.JSX &&
                        text.charCodeAt(pos + 1) === CharCode.slash &&
                        text.charCodeAt(pos + 2) !== CharCode.asterisk) {
                        return pos += 2, token = SyntaxKind.LessThanSlashToken;
                    }
                    pos++;
                    return token = SyntaxKind.LessThanToken;
                case CharCode.equals:
                    if (isConflictMarkerTrivia(text, pos)) {
                        pos = scanConflictMarkerTrivia(text, pos, error);
                        if (skipTrivia) {
                            continue;
                        }
                        else {
                            return token = SyntaxKind.ConflictMarkerTrivia;
                        }
                    }

                    if (text.charCodeAt(pos + 1) === CharCode.equals) {
                        if (text.charCodeAt(pos + 2) === CharCode.equals) {
                            return pos += 3, token = SyntaxKind.EqualsEqualsEqualsToken;
                        }
                        return pos += 2, token = SyntaxKind.EqualsEqualsToken;
                    }
                    if (text.charCodeAt(pos + 1) === CharCode.greaterThan) {
                        return pos += 2, token = SyntaxKind.EqualsGreaterThanToken;
                    }
                    pos++;
                    return token = SyntaxKind.EqualsToken;
                case CharCode.greaterThan:
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
                case CharCode.question:
                    pos++;
                    return token = SyntaxKind.QuestionToken;
                case CharCode.openBracket:
                    pos++;
                    return token = SyntaxKind.OpenBracketToken;
                case CharCode.closeBracket:
                    pos++;
                    return token = SyntaxKind.CloseBracketToken;
                case CharCode.caret:
                    if (text.charCodeAt(pos + 1) === CharCode.equals) {
                        return pos += 2, token = SyntaxKind.CaretEqualsToken;
                    }
                    pos++;
                    return token = SyntaxKind.CaretToken;
                case CharCode.openBrace:
                    pos++;
                    return token = SyntaxKind.OpenBraceToken;
                case CharCode.bar:
                    if (text.charCodeAt(pos + 1) === CharCode.bar) {
                        return pos += 2, token = SyntaxKind.BarBarToken;
                    }
                    if (text.charCodeAt(pos + 1) === CharCode.equals) {
                        return pos += 2, token = SyntaxKind.BarEqualsToken;
                    }
                    pos++;
                    return token = SyntaxKind.BarToken;
                case CharCode.closeBrace:
                    pos++;
                    return token = SyntaxKind.CloseBraceToken;
                case CharCode.tilde:
                    pos++;
                    return token = SyntaxKind.TildeToken;
                case CharCode.at:
                    pos++;
                    return token = SyntaxKind.AtToken;
                case CharCode.backslash:
                    let cookedChar = peekUnicodeEscape();
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
                        while (pos < end && isIdentifierPart(ch = text.charCodeAt(pos), languageVersion)) pos++;
                        tokenValue = text.substring(tokenPos, pos);
                        if (ch === CharCode.backslash) {
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
    hasLineTerminatorBeforeStart: boolean;

    ///**
    // * 获取当前标识之前的文档注释。
    // */
    //docComment: DocComment;

}