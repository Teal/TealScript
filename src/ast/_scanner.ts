﻿/// <reference path="core.ts"/>
/// <reference path="diagnosticInformationMap.generated.ts"/>

namespace ts {

    export function couldStartTrivia(text: string, pos: number): boolean {
        // Keep in sync with skipTrivia
        const ch = text.charCodeAt(pos);
        switch (ch) {
            case CharacterCodes.carriageReturn:
            case CharacterCodes.lineFeed:
            case CharacterCodes.tab:
            case CharacterCodes.verticalTab:
            case CharacterCodes.formFeed:
            case CharacterCodes.space:
            case CharacterCodes.slash:
            // starts of normal trivia
            case CharacterCodes.lessThan:
            case CharacterCodes.equals:
            case CharacterCodes.greaterThan:
                // Starts of conflict marker trivia
                return true;
            case CharacterCodes.hash:
                // Only if its the beginning can we have #! trivia
                return pos === 0;
            default:
                return ch > CharacterCodes.maxAsciiCharacter;
        }
    }

    /* @internal */
    export function skipTrivia(text: string, pos: number, stopAfterLineBreak?: boolean, stopAtComments = false): number {
        // Using ! with a greater than test is a fast way of testing the following conditions:
        //  pos === undefined || pos === null || isNaN(pos) || pos < 0;
        if (!(pos >= 0)) {
            return pos;
        }

        // Keep in sync with couldStartTrivia
        while (true) {
            const ch = text.charCodeAt(pos);
            switch (ch) {
                case CharacterCodes.carriageReturn:
                    if (text.charCodeAt(pos + 1) === CharacterCodes.lineFeed) {
                        pos++;
                    }
                case CharacterCodes.lineFeed:
                    pos++;
                    if (stopAfterLineBreak) {
                        return pos;
                    }
                    continue;
                case CharacterCodes.tab:
                case CharacterCodes.verticalTab:
                case CharacterCodes.formFeed:
                case CharacterCodes.space:
                    pos++;
                    continue;
                case CharacterCodes.slash:
                    if (stopAtComments) {
                        break;
                    }
                    if (text.charCodeAt(pos + 1) === CharacterCodes.slash) {
                        pos += 2;
                        while (pos < text.length) {
                            if (isLineBreak(text.charCodeAt(pos))) {
                                break;
                            }
                            pos++;
                        }
                        continue;
                    }
                    if (text.charCodeAt(pos + 1) === CharacterCodes.asterisk) {
                        pos += 2;
                        while (pos < text.length) {
                            if (text.charCodeAt(pos) === CharacterCodes.asterisk && text.charCodeAt(pos + 1) === CharacterCodes.slash) {
                                pos += 2;
                                break;
                            }
                            pos++;
                        }
                        continue;
                    }
                    break;

                case CharacterCodes.lessThan:
                case CharacterCodes.equals:
                case CharacterCodes.greaterThan:
                    if (isConflictMarkerTrivia(text, pos)) {
                        pos = scanConflictMarkerTrivia(text, pos);
                        continue;
                    }
                    break;

                default:
                    if (ch > CharacterCodes.maxAsciiCharacter && (isWhiteSpace(ch) || isLineBreak(ch))) {
                        pos++;
                        continue;
                    }
                    break;
            }
            return pos;
        }
    }

    // All conflict markers consist of the same character repeated seven times.  If it is
    // a <<<<<<< or >>>>>>> marker then it is also followed by a space.
    const mergeConflictMarkerLength = "<<<<<<<".length;

    function isConflictMarkerTrivia(text: string, pos: number) {
        Debug.assert(pos >= 0);

        // Conflict markers must be at the start of a line.
        if (pos === 0 || isLineBreak(text.charCodeAt(pos - 1))) {
            const ch = text.charCodeAt(pos);

            if ((pos + mergeConflictMarkerLength) < text.length) {
                for (let i = 0, n = mergeConflictMarkerLength; i < n; i++) {
                    if (text.charCodeAt(pos + i) !== ch) {
                        return false;
                    }
                }

                return ch === CharacterCodes.equals ||
                    text.charCodeAt(pos + mergeConflictMarkerLength) === CharacterCodes.space;
            }
        }

        return false;
    }

    function scanConflictMarkerTrivia(text: string, pos: number, error?: ErrorCallback) {
        if (error) {
            error(Diagnostics.Merge_conflict_marker_encountered, mergeConflictMarkerLength);
        }

        const ch = text.charCodeAt(pos);
        const len = text.length;

        if (ch === CharacterCodes.lessThan || ch === CharacterCodes.greaterThan) {
            while (pos < len && !isLineBreak(text.charCodeAt(pos))) {
                pos++;
            }
        }
        else {
            Debug.assert(ch === CharacterCodes.equals);
            // Consume everything from the start of the mid-conflict marker to the start of the next
            // end-conflict marker.
            while (pos < len) {
                const ch = text.charCodeAt(pos);
                if (ch === CharacterCodes.greaterThan && isConflictMarkerTrivia(text, pos)) {
                    break;
                }

                pos++;
            }
        }

        return pos;
    }

    /**
     * Extract comments from text prefixing the token closest following `pos`.
     * The return value is an array containing a TextRange for each comment.
     * Single-line comment ranges include the beginning '//' characters but not the ending line break.
     * Multi - line comment ranges include the beginning '/* and ending '<asterisk>/' characters.
     * The return value is undefined if no comments were found.
     * @param trailing
     * If false, whitespace is skipped until the first line break and comments between that location
     * and the next token are returned.
     * If true, comments occurring between the given position and the next line break are returned.
     */
    function getCommentRanges(text: string, pos: number, trailing: boolean): CommentRange[] {
        let result: CommentRange[];
        let collecting = trailing || pos === 0;
        while (pos < text.length) {
            const ch = text.charCodeAt(pos);
            switch (ch) {
                case CharacterCodes.carriageReturn:
                    if (text.charCodeAt(pos + 1) === CharacterCodes.lineFeed) {
                        pos++;
                    }
                case CharacterCodes.lineFeed:
                    pos++;
                    if (trailing) {
                        return result;
                    }
                    collecting = true;
                    if (result && result.length) {
                        lastOrUndefined(result).hasTrailingNewLine = true;
                    }
                    continue;
                case CharacterCodes.tab:
                case CharacterCodes.verticalTab:
                case CharacterCodes.formFeed:
                case CharacterCodes.space:
                    pos++;
                    continue;
                case CharacterCodes.slash:
                    let nextChar = text.charCodeAt(pos + 1);
                    let hasTrailingNewLine = false;
                    if (nextChar === CharacterCodes.slash || nextChar === CharacterCodes.asterisk) {
                        const kind = nextChar === CharacterCodes.slash ? SyntaxKind.SingleLineCommentTrivia : SyntaxKind.MultiLineCommentTrivia;
                        const startPos = pos;
                        pos += 2;
                        if (nextChar === CharacterCodes.slash) {
                            while (pos < text.length) {
                                if (isLineBreak(text.charCodeAt(pos))) {
                                    hasTrailingNewLine = true;
                                    break;
                                }
                                pos++;
                            }
                        }
                        else {
                            while (pos < text.length) {
                                if (text.charCodeAt(pos) === CharacterCodes.asterisk && text.charCodeAt(pos + 1) === CharacterCodes.slash) {
                                    pos += 2;
                                    break;
                                }
                                pos++;
                            }
                        }
                        if (collecting) {
                            if (!result) {
                                result = [];
                            }

                            result.push({ pos: startPos, end: pos, hasTrailingNewLine, kind });
                        }
                        continue;
                    }
                    break;
                default:
                    if (ch > CharacterCodes.maxAsciiCharacter && (isWhiteSpace(ch) || isLineBreak(ch))) {
                        if (result && result.length && isLineBreak(ch)) {
                            lastOrUndefined(result).hasTrailingNewLine = true;
                        }
                        pos++;
                        continue;
                    }
                    break;
            }
            return result;
        }

        return result;
    }

    export function getLeadingCommentRanges(text: string, pos: number): CommentRange[] {
        return getCommentRanges(text, pos, /*trailing*/ false);
    }

    export function getTrailingCommentRanges(text: string, pos: number): CommentRange[] {
        return getCommentRanges(text, pos, /*trailing*/ true);
    }
    
    // Creates a scanner over a (possibly unspecified) range of a piece of text.
    export function createScanner(languageVersion: ScriptTarget,
        skipTrivia: boolean,
        languageVariant = LanguageVariant.Standard,
        text?: string,
        onError?: ErrorCallback,
        start?: number,
        length?: number): Scanner {
        // Current position (end position of text of current token)
        let pos: number;

        // end of text
        let end: number;

        // Start position of whitespace before current token
        let startPos: number;

        // Start position of text of current token
        let tokenPos: number;

        let token: SyntaxKind;
        let tokenValue: string;
        let precedingLineBreak: boolean;
        let hasExtendedUnicodeEscape: boolean;
        let tokenIsUnterminated: boolean;

        function scan(): SyntaxKind {
            startPos = pos;
            hasExtendedUnicodeEscape = false;
            precedingLineBreak = false;
            tokenIsUnterminated = false;
            while (true) {
                tokenPos = pos;
                let ch = text.charCodeAt(pos);

                switch (ch) {
                    
                    case CharacterCodes.percent:
                        if (text.charCodeAt(pos + 1) === CharacterCodes.equals) {
                            return pos += 2, token = SyntaxKind.PercentEqualsToken;
                        }
                        pos++;
                        return token = SyntaxKind.PercentToken;
                    case CharacterCodes.ampersand:
                        if (text.charCodeAt(pos + 1) === CharacterCodes.ampersand) {
                            return pos += 2, token = SyntaxKind.AmpersandAmpersandToken;
                        }
                        if (text.charCodeAt(pos + 1) === CharacterCodes.equals) {
                            return pos += 2, token = SyntaxKind.AmpersandEqualsToken;
                        }
                        pos++;
                        return token = SyntaxKind.AmpersandToken;
                    case CharacterCodes.openParen:
                        pos++;
                        return token = SyntaxKind.OpenParenToken;
                    case CharacterCodes.closeParen:
                        pos++;
                        return token = SyntaxKind.CloseParenToken;
                    case CharacterCodes.asterisk:
                        if (text.charCodeAt(pos + 1) === CharacterCodes.equals) {
                            return pos += 2, token = SyntaxKind.AsteriskEqualsToken;
                        }
                        if (text.charCodeAt(pos + 1) === CharacterCodes.asterisk) {
                            if (text.charCodeAt(pos + 2) === CharacterCodes.equals) {
                                return pos += 3, token = SyntaxKind.AsteriskAsteriskEqualsToken;
                            }
                            return pos += 2, token = SyntaxKind.AsteriskAsteriskToken;
                        }
                        pos++;
                        return token = SyntaxKind.AsteriskToken;
                    case CharacterCodes.plus:
                        if (text.charCodeAt(pos + 1) === CharacterCodes.plus) {
                            return pos += 2, token = SyntaxKind.PlusPlusToken;
                        }
                        if (text.charCodeAt(pos + 1) === CharacterCodes.equals) {
                            return pos += 2, token = SyntaxKind.PlusEqualsToken;
                        }
                        pos++;
                        return token = SyntaxKind.PlusToken;
                    case CharacterCodes.comma:
                        pos++;
                        return token = SyntaxKind.CommaToken;
                    case CharacterCodes.minus:
                        if (text.charCodeAt(pos + 1) === CharacterCodes.minus) {
                            return pos += 2, token = SyntaxKind.MinusMinusToken;
                        }
                        if (text.charCodeAt(pos + 1) === CharacterCodes.equals) {
                            return pos += 2, token = SyntaxKind.MinusEqualsToken;
                        }
                        pos++;
                        return token = SyntaxKind.MinusToken;
                    case CharacterCodes.dot:
                        if (isDigit(text.charCodeAt(pos + 1))) {
                            tokenValue = scanNumber();
                            return token = SyntaxKind.NumericLiteral;
                        }
                        if (text.charCodeAt(pos + 1) === CharacterCodes.dot && text.charCodeAt(pos + 2) === CharacterCodes.dot) {
                            return pos += 3, token = SyntaxKind.DotDotDotToken;
                        }
                        pos++;
                        return token = SyntaxKind.DotToken;
                    case CharacterCodes.slash:
                        // Single-line comment
                        if (text.charCodeAt(pos + 1) === CharacterCodes.slash) {
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
                        if (text.charCodeAt(pos + 1) === CharacterCodes.asterisk) {
                            pos += 2;

                            let commentClosed = false;
                            while (pos < end) {
                                const ch = text.charCodeAt(pos);

                                if (ch === CharacterCodes.asterisk && text.charCodeAt(pos + 1) === CharacterCodes.slash) {
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

                        if (text.charCodeAt(pos + 1) === CharacterCodes.equals) {
                            return pos += 2, token = SyntaxKind.SlashEqualsToken;
                        }

                        pos++;
                        return token = SyntaxKind.SlashToken;

                    case CharacterCodes._0:
                        if (pos + 2 < end && (text.charCodeAt(pos + 1) === CharacterCodes.X || text.charCodeAt(pos + 1) === CharacterCodes.x)) {
                            pos += 2;
                            let value = scanMinimumNumberOfHexDigits(1);
                            if (value < 0) {
                                error(Diagnostics.Hexadecimal_digit_expected);
                                value = 0;
                            }
                            tokenValue = "" + value;
                            return token = SyntaxKind.NumericLiteral;
                        }
                        else if (pos + 2 < end && (text.charCodeAt(pos + 1) === CharacterCodes.B || text.charCodeAt(pos + 1) === CharacterCodes.b)) {
                            pos += 2;
                            let value = scanBinaryOrOctalDigits(/* base */ 2);
                            if (value < 0) {
                                error(Diagnostics.Binary_digit_expected);
                                value = 0;
                            }
                            tokenValue = "" + value;
                            return token = SyntaxKind.NumericLiteral;
                        }
                        else if (pos + 2 < end && (text.charCodeAt(pos + 1) === CharacterCodes.O || text.charCodeAt(pos + 1) === CharacterCodes.o)) {
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
                    case CharacterCodes._1:
                    case CharacterCodes._2:
                    case CharacterCodes._3:
                    case CharacterCodes._4:
                    case CharacterCodes._5:
                    case CharacterCodes._6:
                    case CharacterCodes._7:
                    case CharacterCodes._8:
                    case CharacterCodes._9:
                        tokenValue = scanNumber();
                        return token = SyntaxKind.NumericLiteral;
                    case CharacterCodes.colon:
                        pos++;
                        return token = SyntaxKind.ColonToken;
                    case CharacterCodes.semicolon:
                        pos++;
                        return token = SyntaxKind.SemicolonToken;
                    case CharacterCodes.lessThan:
                        if (isConflictMarkerTrivia(text, pos)) {
                            pos = scanConflictMarkerTrivia(text, pos, error);
                            if (skipTrivia) {
                                continue;
                            }
                            else {
                                return token = SyntaxKind.ConflictMarkerTrivia;
                            }
                        }

                        if (text.charCodeAt(pos + 1) === CharacterCodes.lessThan) {
                            if (text.charCodeAt(pos + 2) === CharacterCodes.equals) {
                                return pos += 3, token = SyntaxKind.LessThanLessThanEqualsToken;
                            }
                            return pos += 2, token = SyntaxKind.LessThanLessThanToken;
                        }
                        if (text.charCodeAt(pos + 1) === CharacterCodes.equals) {
                            return pos += 2, token = SyntaxKind.LessThanEqualsToken;
                        }
                        if (languageVariant === LanguageVariant.JSX &&
                            text.charCodeAt(pos + 1) === CharacterCodes.slash &&
                            text.charCodeAt(pos + 2) !== CharacterCodes.asterisk) {
                            return pos += 2, token = SyntaxKind.LessThanSlashToken;
                        }
                        pos++;
                        return token = SyntaxKind.LessThanToken;
                    case CharacterCodes.equals:
                        if (isConflictMarkerTrivia(text, pos)) {
                            pos = scanConflictMarkerTrivia(text, pos, error);
                            if (skipTrivia) {
                                continue;
                            }
                            else {
                                return token = SyntaxKind.ConflictMarkerTrivia;
                            }
                        }

                        if (text.charCodeAt(pos + 1) === CharacterCodes.equals) {
                            if (text.charCodeAt(pos + 2) === CharacterCodes.equals) {
                                return pos += 3, token = SyntaxKind.EqualsEqualsEqualsToken;
                            }
                            return pos += 2, token = SyntaxKind.EqualsEqualsToken;
                        }
                        if (text.charCodeAt(pos + 1) === CharacterCodes.greaterThan) {
                            return pos += 2, token = SyntaxKind.EqualsGreaterThanToken;
                        }
                        pos++;
                        return token = SyntaxKind.EqualsToken;
                    case CharacterCodes.greaterThan:
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
                    case CharacterCodes.question:
                        pos++;
                        return token = SyntaxKind.QuestionToken;
                    case CharacterCodes.openBracket:
                        pos++;
                        return token = SyntaxKind.OpenBracketToken;
                    case CharacterCodes.closeBracket:
                        pos++;
                        return token = SyntaxKind.CloseBracketToken;
                    case CharacterCodes.caret:
                        if (text.charCodeAt(pos + 1) === CharacterCodes.equals) {
                            return pos += 2, token = SyntaxKind.CaretEqualsToken;
                        }
                        pos++;
                        return token = SyntaxKind.CaretToken;
                    case CharacterCodes.openBrace:
                        pos++;
                        return token = SyntaxKind.OpenBraceToken;
                    case CharacterCodes.bar:
                        if (text.charCodeAt(pos + 1) === CharacterCodes.bar) {
                            return pos += 2, token = SyntaxKind.BarBarToken;
                        }
                        if (text.charCodeAt(pos + 1) === CharacterCodes.equals) {
                            return pos += 2, token = SyntaxKind.BarEqualsToken;
                        }
                        pos++;
                        return token = SyntaxKind.BarToken;
                    case CharacterCodes.closeBrace:
                        pos++;
                        return token = SyntaxKind.CloseBraceToken;
                    case CharacterCodes.tilde:
                        pos++;
                        return token = SyntaxKind.TildeToken;
                    case CharacterCodes.at:
                        pos++;
                        return token = SyntaxKind.AtToken;
                    default:
                        if (isIdentifierStart(ch, languageVersion)) {
                            pos++;
                            while (pos < end && isIdentifierPart(ch = text.charCodeAt(pos), languageVersion)) pos++;
                            tokenValue = text.substring(tokenPos, pos);
                            if (ch === CharacterCodes.backslash) {
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

        function reScanGreaterToken(): SyntaxKind {
            if (token === SyntaxKind.GreaterThanToken) {
                if (text.charCodeAt(pos) === CharacterCodes.greaterThan) {
                    if (text.charCodeAt(pos + 1) === CharacterCodes.greaterThan) {
                        if (text.charCodeAt(pos + 2) === CharacterCodes.equals) {
                            return pos += 3, token = SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken;
                        }
                        return pos += 2, token = SyntaxKind.GreaterThanGreaterThanGreaterThanToken;
                    }
                    if (text.charCodeAt(pos + 1) === CharacterCodes.equals) {
                        return pos += 2, token = SyntaxKind.GreaterThanGreaterThanEqualsToken;
                    }
                    pos++;
                    return token = SyntaxKind.GreaterThanGreaterThanToken;
                }
                if (text.charCodeAt(pos) === CharacterCodes.equals) {
                    pos++;
                    return token = SyntaxKind.GreaterThanEqualsToken;
                }
            }
            return token;
        }

        function reScanSlashToken(): SyntaxKind {
            if (token === SyntaxKind.SlashToken || token === SyntaxKind.SlashEqualsToken) {
                let p = tokenPos + 1;
                let inEscape = false;
                let inCharacterClass = false;
                while (true) {
                    // If we reach the end of a file, or hit a newline, then this is an unterminated
                    // regex.  Report error and return what we have so far.
                    if (p >= end) {
                        tokenIsUnterminated = true;
                        error(Diagnostics.Unterminated_regular_expression_literal);
                        break;
                    }

                    const ch = text.charCodeAt(p);
                    if (isLineBreak(ch)) {
                        tokenIsUnterminated = true;
                        error(Diagnostics.Unterminated_regular_expression_literal);
                        break;
                    }

                    if (inEscape) {
                        // Parsing an escape character;
                        // reset the flag and just advance to the next char.
                        inEscape = false;
                    }
                    else if (ch === CharacterCodes.slash && !inCharacterClass) {
                        // A slash within a character class is permissible,
                        // but in general it signals the end of the regexp literal.
                        p++;
                        break;
                    }
                    else if (ch === CharacterCodes.openBracket) {
                        inCharacterClass = true;
                    }
                    else if (ch === CharacterCodes.backslash) {
                        inEscape = true;
                    }
                    else if (ch === CharacterCodes.closeBracket) {
                        inCharacterClass = false;
                    }
                    p++;
                }

                while (p < end && isIdentifierPart(text.charCodeAt(p), languageVersion)) {
                    p++;
                }
                pos = p;
                tokenValue = text.substring(tokenPos, pos);
                token = SyntaxKind.RegularExpressionLiteral;
            }
            return token;
        }

        /**
         * Unconditionally back up and scan a template expression portion.
         */
        function reScanTemplateToken(): SyntaxKind {
            Debug.assert(token === SyntaxKind.CloseBraceToken, "'reScanTemplateToken' should only be called on a '}'");
            pos = tokenPos;
            return token = scanTemplateAndSetTokenValue();
        }

        function reScanJsxToken(): SyntaxKind {
            pos = tokenPos = startPos;
            return token = scanJsxToken();
        }

        function scanJsxToken(): SyntaxKind {
            startPos = tokenPos = pos;

            if (pos >= end) {
                return token = SyntaxKind.EndOfFileToken;
            }

            let char = text.charCodeAt(pos);
            if (char === CharacterCodes.lessThan) {
                if (text.charCodeAt(pos + 1) === CharacterCodes.slash) {
                    pos += 2;
                    return token = SyntaxKind.LessThanSlashToken;
                }
                pos++;
                return token = SyntaxKind.LessThanToken;
            }

            if (char === CharacterCodes.openBrace) {
                pos++;
                return token = SyntaxKind.OpenBraceToken;
            }

            while (pos < end) {
                pos++;
                char = text.charCodeAt(pos);
                if ((char === CharacterCodes.openBrace) || (char === CharacterCodes.lessThan)) {
                    break;
                }
            }
            return token = SyntaxKind.JsxText;
        }

        // Scans a JSX identifier; these differ from normal identifiers in that
        // they allow dashes
        function scanJsxIdentifier(): SyntaxKind {
            if (tokenIsIdentifierOrKeyword(token)) {
                const firstCharPosition = pos;
                while (pos < end) {
                    const ch = text.charCodeAt(pos);
                    if (ch === CharacterCodes.minus || ((firstCharPosition === pos) ? isIdentifierStart(ch, languageVersion) : isIdentifierPart(ch, languageVersion))) {
                        pos++;
                    }
                    else {
                        break;
                    }
                }
                tokenValue += text.substr(firstCharPosition, pos - firstCharPosition);
            }
            return token;
        }

        function scanJSDocToken(): SyntaxKind {
            if (pos >= end) {
                return token = SyntaxKind.EndOfFileToken;
            }

            startPos = pos;

            // Eat leading whitespace
            let ch = text.charCodeAt(pos);
            while (pos < end) {
                ch = text.charCodeAt(pos);
                if (isWhiteSpace(ch)) {
                    pos++;
                }
                else {
                    break;
                }
            }
            tokenPos = pos;

            switch (ch) {
                case CharacterCodes.at:
                    return pos += 1, token = SyntaxKind.AtToken;
                case CharacterCodes.lineFeed:
                case CharacterCodes.carriageReturn:
                    return pos += 1, token = SyntaxKind.NewLineTrivia;
                case CharacterCodes.asterisk:
                    return pos += 1, token = SyntaxKind.AsteriskToken;
                case CharacterCodes.openBrace:
                    return pos += 1, token = SyntaxKind.OpenBraceToken;
                case CharacterCodes.closeBrace:
                    return pos += 1, token = SyntaxKind.CloseBraceToken;
                case CharacterCodes.openBracket:
                    return pos += 1, token = SyntaxKind.OpenBracketToken;
                case CharacterCodes.closeBracket:
                    return pos += 1, token = SyntaxKind.CloseBracketToken;
                case CharacterCodes.equals:
                    return pos += 1, token = SyntaxKind.EqualsToken;
                case CharacterCodes.comma:
                    return pos += 1, token = SyntaxKind.CommaToken;
            }

            if (isIdentifierStart(ch, ScriptTarget.Latest)) {
                pos++;
                while (isIdentifierPart(text.charCodeAt(pos), ScriptTarget.Latest) && pos < end) {
                    pos++;
                }
                return token = SyntaxKind.Identifier;
            }
            else {
                return pos += 1, token = SyntaxKind.Unknown;
            }
        }

        function speculationHelper<T>(callback: () => T, isLookahead: boolean): T {
            const savePos = pos;
            const saveStartPos = startPos;
            const saveTokenPos = tokenPos;
            const saveToken = token;
            const saveTokenValue = tokenValue;
            const savePrecedingLineBreak = precedingLineBreak;
            const result = callback();

            // If our callback returned something 'falsy' or we're just looking ahead,
            // then unconditionally restore us to where we were.
            if (!result || isLookahead) {
                pos = savePos;
                startPos = saveStartPos;
                tokenPos = saveTokenPos;
                token = saveToken;
                tokenValue = saveTokenValue;
                precedingLineBreak = savePrecedingLineBreak;
            }
            return result;
        }

        function scanRange<T>(start: number, length: number, callback: () => T): T {
            const saveEnd = end;
            const savePos = pos;
            const saveStartPos = startPos;
            const saveTokenPos = tokenPos;
            const saveToken = token;
            const savePrecedingLineBreak = precedingLineBreak;
            const saveTokenValue = tokenValue;
            const saveHasExtendedUnicodeEscape = hasExtendedUnicodeEscape;
            const saveTokenIsUnterminated = tokenIsUnterminated;

            setText(text, start, length);
            const result = callback();

            end = saveEnd;
            pos = savePos;
            startPos = saveStartPos;
            tokenPos = saveTokenPos;
            token = saveToken;
            precedingLineBreak = savePrecedingLineBreak;
            tokenValue = saveTokenValue;
            hasExtendedUnicodeEscape = saveHasExtendedUnicodeEscape;
            tokenIsUnterminated = saveTokenIsUnterminated;

            return result;
        }

        function lookAhead<T>(callback: () => T): T {
            return speculationHelper(callback, /*isLookahead*/ true);
        }

        function tryScan<T>(callback: () => T): T {
            return speculationHelper(callback, /*isLookahead*/ false);
        }

        function setOnError(errorCallback: ErrorCallback) {
            onError = errorCallback;
        }

        function setScriptTarget(scriptTarget: ScriptTarget) {
            languageVersion = scriptTarget;
        }

        function setLanguageVariant(variant: LanguageVariant) {
            languageVariant = variant;
        }

        function setTextPos(textPos: number) {
            Debug.assert(textPos >= 0);
            pos = textPos;
            startPos = textPos;
            tokenPos = textPos;
            token = SyntaxKind.Unknown;
            precedingLineBreak = false;

            tokenValue = undefined;
            hasExtendedUnicodeEscape = false;
            tokenIsUnterminated = false;
        }
    }
}
