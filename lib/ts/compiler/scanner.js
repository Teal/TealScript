/// <reference path="core.ts"/>
/// <reference path="diagnosticInformationMap.generated.ts"/>
var ts;
(function (ts) {
    /* @internal */
    function tokenIsIdentifierOrKeyword(token) {
        return token >= 215 /* Identifier */;
    }
    ts.tokenIsIdentifierOrKeyword = tokenIsIdentifierOrKeyword;
    /* @internal */
    function computeLineStarts(text) {
        var result = new Array();
        var pos = 0;
        var lineStart = 0;
        while (pos < text.length) {
            var ch = text.charCodeAt(pos);
            pos++;
            switch (ch) {
                case ts.CharCode.carriageReturn:
                    if (text.charCodeAt(pos) === ts.CharCode.lineFeed) {
                        pos++;
                    }
                case ts.CharCode.lineFeed:
                    result.push(lineStart);
                    lineStart = pos;
                    break;
                default:
                    if (ch > ts.CharCode.MAX_ASCII && ts.isLineBreak(ch)) {
                        result.push(lineStart);
                        lineStart = pos;
                    }
                    break;
            }
        }
        result.push(lineStart);
        return result;
    }
    ts.computeLineStarts = computeLineStarts;
    function getPositionOfLineAndCharacter(sourceFile, line, character) {
        return computePositionOfLineAndCharacter(getLineStarts(sourceFile), line, character);
    }
    ts.getPositionOfLineAndCharacter = getPositionOfLineAndCharacter;
    /* @internal */
    function computePositionOfLineAndCharacter(lineStarts, line, character) {
        ts.Debug.assert(line >= 0 && line < lineStarts.length);
        return lineStarts[line] + character;
    }
    ts.computePositionOfLineAndCharacter = computePositionOfLineAndCharacter;
    /* @internal */
    function getLineStarts(sourceFile) {
        return sourceFile.lineMap || (sourceFile.lineMap = computeLineStarts(sourceFile.text));
    }
    ts.getLineStarts = getLineStarts;
    /* @internal */
    /**
     * We assume the first line starts at position 0 and 'position' is non-negative.
     */
    function computeLineAndCharacterOfPosition(lineStarts, position) {
        var lineNumber = ts.binarySearch(lineStarts, position);
        if (lineNumber < 0) {
            // If the actual position was not found,
            // the binary search returns the 2's-complement of the next line start
            // e.g. if the line starts at [5, 10, 23, 80] and the position requested was 20
            // then the search will return -2.
            //
            // We want the index of the previous line start, so we subtract 1.
            // Review 2's-complement if this is confusing.
            lineNumber = ~lineNumber - 1;
            ts.Debug.assert(lineNumber !== -1, "position cannot precede the beginning of the file");
        }
        return {
            line: lineNumber,
            character: position - lineStarts[lineNumber]
        };
    }
    ts.computeLineAndCharacterOfPosition = computeLineAndCharacterOfPosition;
    function getLineAndCharacterOfPosition(sourceFile, position) {
        return computeLineAndCharacterOfPosition(getLineStarts(sourceFile), position);
    }
    ts.getLineAndCharacterOfPosition = getLineAndCharacterOfPosition;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function couldStartTrivia(text, pos) {
        // Keep in sync with skipTrivia
        var ch = text.charCodeAt(pos);
        switch (ch) {
            case ts.CharCode.carriageReturn:
            case ts.CharCode.lineFeed:
            case ts.CharCode.horizontalTab:
            case ts.CharCode.verticalTab:
            case ts.CharCode.formFeed:
            case ts.CharCode.space:
            case ts.CharCode.slash:
            // starts of normal trivia
            case ts.CharCode.lessThan:
            case ts.CharCode.equals:
            case ts.CharCode.greaterThan:
                // Starts of conflict marker trivia
                return true;
            case ts.CharCode.hash:
                // Only if its the beginning can we have #! trivia
                return pos === 0;
            default:
                return ch > ts.CharCode.MAX_ASCII;
        }
    }
    ts.couldStartTrivia = couldStartTrivia;
    /* @internal */
    function skipTrivia(text, pos, stopAfterLineBreak, stopAtComments) {
        if (stopAtComments === void 0) { stopAtComments = false; }
        // Using ! with a greater than test is a fast way of testing the following conditions:
        //  pos === undefined || pos === null || isNaN(pos) || pos < 0;
        if (!(pos >= 0)) {
            return pos;
        }
        // Keep in sync with couldStartTrivia
        while (true) {
            var ch = text.charCodeAt(pos);
            switch (ch) {
                case ts.CharCode.carriageReturn:
                    if (text.charCodeAt(pos + 1) === ts.CharCode.lineFeed) {
                        pos++;
                    }
                case ts.CharCode.lineFeed:
                    pos++;
                    if (stopAfterLineBreak) {
                        return pos;
                    }
                    continue;
                case ts.CharCode.horizontalTab:
                case ts.CharCode.verticalTab:
                case ts.CharCode.formFeed:
                case ts.CharCode.space:
                    pos++;
                    continue;
                case ts.CharCode.slash:
                    if (stopAtComments) {
                        break;
                    }
                    if (text.charCodeAt(pos + 1) === ts.CharCode.slash) {
                        pos += 2;
                        while (pos < text.length) {
                            if (ts.isLineBreak(text.charCodeAt(pos))) {
                                break;
                            }
                            pos++;
                        }
                        continue;
                    }
                    if (text.charCodeAt(pos + 1) === ts.CharCode.asterisk) {
                        pos += 2;
                        while (pos < text.length) {
                            if (text.charCodeAt(pos) === ts.CharCode.asterisk && text.charCodeAt(pos + 1) === ts.CharCode.slash) {
                                pos += 2;
                                break;
                            }
                            pos++;
                        }
                        continue;
                    }
                    break;
                case ts.CharCode.lessThan:
                case ts.CharCode.equals:
                case ts.CharCode.greaterThan:
                    if (isConflictMarkerTrivia(text, pos)) {
                        pos = scanConflictMarkerTrivia(text, pos);
                        continue;
                    }
                    break;
                case ts.CharCode.hash:
                    if (pos === 0 && isShebangTrivia(text, pos)) {
                        pos = scanShebangTrivia(text, pos);
                        continue;
                    }
                    break;
                default:
                    if (ch > ts.CharCode.MAX_ASCII && (ts.isWhiteSpace(ch))) {
                        pos++;
                        continue;
                    }
                    break;
            }
            return pos;
        }
    }
    ts.skipTrivia = skipTrivia;
    // All conflict markers consist of the same character repeated seven times.  If it is
    // a <<<<<<< or >>>>>>> marker then it is also followed by a space.
    var mergeConflictMarkerLength = "<<<<<<<".length;
    function isConflictMarkerTrivia(text, pos) {
        ts.Debug.assert(pos >= 0);
        // Conflict markers must be at the start of a line.
        if (pos === 0 || ts.isLineBreak(text.charCodeAt(pos - 1))) {
            var ch = text.charCodeAt(pos);
            if ((pos + mergeConflictMarkerLength) < text.length) {
                for (var i = 0, n = mergeConflictMarkerLength; i < n; i++) {
                    if (text.charCodeAt(pos + i) !== ch) {
                        return false;
                    }
                }
                return ch === ts.CharCode.equals ||
                    text.charCodeAt(pos + mergeConflictMarkerLength) === ts.CharCode.space;
            }
        }
        return false;
    }
    function scanConflictMarkerTrivia(text, pos) {
        if (error) {
            error(ts.Diagnostics.Merge_conflict_marker_encountered, mergeConflictMarkerLength);
        }
        var ch = text.charCodeAt(pos);
        var len = text.length;
        if (ch === ts.CharCode.lessThan || ch === ts.CharCode.greaterThan) {
            while (pos < len && !ts.isLineBreak(text.charCodeAt(pos))) {
                pos++;
            }
        }
        else {
            ts.Debug.assert(ch === ts.CharCode.equals);
            // Consume everything from the start of the mid-conflict marker to the start of the next
            // end-conflict marker.
            while (pos < len) {
                var ch_1 = text.charCodeAt(pos);
                if (ch_1 === ts.CharCode.greaterThan && isConflictMarkerTrivia(text, pos)) {
                    break;
                }
                pos++;
            }
        }
        return pos;
    }
    var shebangTriviaRegex = /^#!.*/;
    function isShebangTrivia(text, pos) {
        // Shebangs check must only be done at the start of the file
        ts.Debug.assert(pos === 0);
        return shebangTriviaRegex.test(text);
    }
    function scanShebangTrivia(text, pos) {
        var shebang = shebangTriviaRegex.exec(text)[0];
        pos = pos + shebang.length;
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
    function getCommentRanges(text, pos, trailing) {
        var result;
        var collecting = trailing || pos === 0;
        while (pos < text.length) {
            var ch = text.charCodeAt(pos);
            switch (ch) {
                case ts.CharCode.carriageReturn:
                    if (text.charCodeAt(pos + 1) === ts.CharCode.lineFeed) {
                        pos++;
                    }
                case ts.CharCode.lineFeed:
                    pos++;
                    if (trailing) {
                        return result;
                    }
                    collecting = true;
                    if (result && result.length) {
                        ts.lastOrUndefined(result).hasTrailingNewLine = true;
                    }
                    continue;
                case ts.CharCode.horizontalTab:
                case ts.CharCode.verticalTab:
                case ts.CharCode.formFeed:
                case ts.CharCode.space:
                    pos++;
                    continue;
                case ts.CharCode.slash:
                    var nextChar = text.charCodeAt(pos + 1);
                    var hasTrailingNewLine = false;
                    if (nextChar === ts.CharCode.slash || nextChar === ts.CharCode.asterisk) {
                        var kind = nextChar === ts.CharCode.slash ? ts.TokenType.singleLineComment : ts.TokenType.multiLineComment;
                        var startPos = pos;
                        pos += 2;
                        if (nextChar === ts.CharCode.slash) {
                            while (pos < text.length) {
                                if (ts.isLineBreak(text.charCodeAt(pos))) {
                                    hasTrailingNewLine = true;
                                    break;
                                }
                                pos++;
                            }
                        }
                        else {
                            while (pos < text.length) {
                                if (text.charCodeAt(pos) === ts.CharCode.asterisk && text.charCodeAt(pos + 1) === ts.CharCode.slash) {
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
                            result.push({ pos: startPos, end: pos, hasTrailingNewLine: hasTrailingNewLine, kind: kind });
                        }
                        continue;
                    }
                    break;
                default:
                    if (ch > ts.CharCode.MAX_ASCII && (ts.isWhiteSpace(ch))) {
                        if (result && result.length && ts.isLineBreak(ch)) {
                            ts.lastOrUndefined(result).hasTrailingNewLine = true;
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
    function getLeadingCommentRanges(text, pos) {
        return getCommentRanges(text, pos, /*trailing*/ false);
    }
    ts.getLeadingCommentRanges = getLeadingCommentRanges;
    function getTrailingCommentRanges(text, pos) {
        return getCommentRanges(text, pos, /*trailing*/ true);
    }
    ts.getTrailingCommentRanges = getTrailingCommentRanges;
    /** Optionally, get the shebang */
    function getShebang(text) {
        return shebangTriviaRegex.test(text)
            ? shebangTriviaRegex.exec(text)[0]
            : undefined;
    }
    ts.getShebang = getShebang;
    // Creates a scanner over a (possibly unspecified) range of a piece of text.
    function createScanner(languageVersion, skipTrivia, languageVariant, text, start, length) {
        if (languageVariant === void 0) { languageVariant = 0 /* Standard */; }
        // Current position (end position of text of current token)
        var pos;
        // end of text
        var end;
        // Start position of whitespace before current token
        var startPos;
        // Start position of text of current token
        var tokenPos;
        var token;
        var tokenValue;
        var precedingLineBreak;
        var hasExtendedUnicodeEscape;
        var tokenIsUnterminated;
        setText(text, start, length);
        return {
            getStartPos: function () { return startPos; },
            getTextPos: function () { return pos; },
            getToken: function () { return token; },
            getTokenPos: function () { return tokenPos; },
            getTokenText: function () { return text.substring(tokenPos, pos); },
            getTokenValue: function () { return tokenValue; },
            hasExtendedUnicodeEscape: function () { return false; },
            hasPrecedingLineBreak: function () { return precedingLineBreak; },
            isUnterminated: function () { return tokenIsUnterminated; },
            reScanGreaterToken: reScanGreaterToken,
            reScanSlashToken: reScanSlashToken,
            reScanTemplateToken: reScanTemplateToken,
            scanJsxIdentifier: scanJsxIdentifier,
            reScanJsxToken: reScanJsxToken,
            scanJsxToken: scanJsxToken,
            scanJSDocToken: scanJSDocToken,
            scan: scan,
            getText: getText,
            setText: setText,
            setScriptTarget: setScriptTarget,
            setLanguageVariant: setLanguageVariant,
            setTextPos: setTextPos,
            tryScan: tryScan,
            lookAhead: lookAhead,
            scanRange: scanRange,
        };
        function scanNumber() {
            var start = pos;
            while (isDecimalDigit(text.charCodeAt(pos)))
                pos++;
            if (text.charCodeAt(pos) === ts.CharCode.dot) {
                pos++;
                while (isDecimalDigit(text.charCodeAt(pos)))
                    pos++;
            }
            var end = pos;
            if (text.charCodeAt(pos) === ts.CharCode.E || text.charCodeAt(pos) === ts.CharCode.e) {
                pos++;
                if (text.charCodeAt(pos) === ts.CharCode.plus || text.charCodeAt(pos) === ts.CharCode.minus)
                    pos++;
                if (isDecimalDigit(text.charCodeAt(pos))) {
                    pos++;
                    while (isDecimalDigit(text.charCodeAt(pos)))
                        pos++;
                    end = pos;
                }
                else {
                    error(ts.Diagnostics.Digit_expected);
                }
            }
            return "" + +(text.substring(start, end));
        }
        function scanOctalDigits() {
            var start = pos;
            while (ts.isOctalDigit(text.charCodeAt(pos))) {
                pos++;
            }
            return +(text.substring(start, pos));
        }
        /**
         * Scans the given number of hexadecimal digits in the text,
         * returning -1 if the given number is unavailable.
         */
        function scanExactNumberOfHexDigits(count) {
            return scanHexDigits(/*minCount*/ count, /*scanAsManyAsPossible*/ false);
        }
        /**
         * Scans as many hexadecimal digits as are available in the text,
         * returning -1 if the given number of digits was unavailable.
         */
        function scanMinimumNumberOfHexDigits(count) {
            return scanHexDigits(/*minCount*/ count, /*scanAsManyAsPossible*/ true);
        }
        function scanHexDigits(minCount, scanAsManyAsPossible) {
            var digits = 0;
            var value = 0;
            while (digits < minCount || scanAsManyAsPossible) {
                var ch = text.charCodeAt(pos);
                if (ch >= ts.CharCode.num0 && ch <= ts.CharCode.num9) {
                    value = value * 16 + ch - ts.CharCode.num0;
                }
                else if (ch >= ts.CharCode.A && ch <= ts.CharCode.F) {
                    value = value * 16 + ch - ts.CharCode.A + 10;
                }
                else if (ch >= ts.CharCode.a && ch <= ts.CharCode.f) {
                    value = value * 16 + ch - ts.CharCode.a + 10;
                }
                else {
                    break;
                }
                pos++;
                digits++;
            }
            if (digits < minCount) {
                value = -1;
            }
            return value;
        }
        function scanString() {
            var quote = text.charCodeAt(pos);
            pos++;
            var result = "";
            var start = pos;
            while (true) {
                if (pos >= end) {
                    result += text.substring(start, pos);
                    tokenIsUnterminated = true;
                    error(ts.Diagnostics.Unterminated_string_literal);
                    break;
                }
                var ch = text.charCodeAt(pos);
                if (ch === quote) {
                    result += text.substring(start, pos);
                    pos++;
                    break;
                }
                if (ch === ts.CharCode.backslash) {
                    result += text.substring(start, pos);
                    result += scanEscapeSequence();
                    start = pos;
                    continue;
                }
                if (ts.isLineBreak(ch)) {
                    result += text.substring(start, pos);
                    tokenIsUnterminated = true;
                    error(ts.Diagnostics.Unterminated_string_literal);
                    break;
                }
                pos++;
            }
            return result;
        }
        /**
         * Sets the current 'tokenValue' and returns a NoSubstitutionTemplateLiteral or
         * a literal component of a TemplateExpression.
         */
        function scanTemplateAndSetTokenValue() {
            var startedWithBacktick = text.charCodeAt(pos) === ts.CharCode.backtick;
            pos++;
            var start = pos;
            var contents = "";
            var resultingToken;
            while (true) {
                if (pos >= end) {
                    contents += text.substring(start, pos);
                    tokenIsUnterminated = true;
                    error(ts.Diagnostics.Unterminated_template_literal);
                    resultingToken = startedWithBacktick ? 157 /* NoSubstitutionTemplateLiteral */ : 160 /* TemplateTail */;
                    break;
                }
                var currChar = text.charCodeAt(pos);
                // '`'
                if (currChar === ts.CharCode.backtick) {
                    contents += text.substring(start, pos);
                    pos++;
                    resultingToken = startedWithBacktick ? 157 /* NoSubstitutionTemplateLiteral */ : 160 /* TemplateTail */;
                    break;
                }
                // '${'
                if (currChar === ts.CharCode.dollar && pos + 1 < end && text.charCodeAt(pos + 1) === ts.CharCode.openBrace) {
                    contents += text.substring(start, pos);
                    pos += 2;
                    resultingToken = startedWithBacktick ? 158 /* TemplateHead */ : 159 /* TemplateMiddle */;
                    break;
                }
                // Escape character
                if (currChar === ts.CharCode.backslash) {
                    contents += text.substring(start, pos);
                    contents += scanEscapeSequence();
                    start = pos;
                    continue;
                }
                // Speculated ECMAScript 6 Spec 11.8.6.1:
                // <CR><LF> and <CR> LineTerminatorSequences are normalized to <LF> for Template Values
                if (currChar === ts.CharCode.carriageReturn) {
                    contents += text.substring(start, pos);
                    pos++;
                    if (pos < end && text.charCodeAt(pos) === ts.CharCode.lineFeed) {
                        pos++;
                    }
                    contents += "\n";
                    start = pos;
                    continue;
                }
                pos++;
            }
            ts.Debug.assert(resultingToken !== undefined);
            tokenValue = contents;
            return resultingToken;
        }
        function scanEscapeSequence() {
            pos++;
            if (pos >= end) {
                error(ts.Diagnostics.Unexpected_end_of_text);
                return "";
            }
            var ch = text.charCodeAt(pos);
            pos++;
            switch (ch) {
                case ts.CharCode.num0:
                    return "\0";
                case ts.CharCode.b:
                    return "\b";
                case ts.CharCode.t:
                    return "\t";
                case ts.CharCode.n:
                    return "\n";
                case ts.CharCode.v:
                    return "\v";
                case ts.CharCode.f:
                    return "\f";
                case ts.CharCode.r:
                    return "\r";
                case ts.CharCode.singleQuote:
                    return "\'";
                case ts.CharCode.doubleQuote:
                    return "\"";
                case ts.CharCode.u:
                    // '\u{DDDDDDDD}'
                    if (pos < end && text.charCodeAt(pos) === ts.CharCode.openBrace) {
                        hasExtendedUnicodeEscape = true;
                        pos++;
                        return scanExtendedUnicodeEscape();
                    }
                    // '\uDDDD'
                    return scanHexadecimalEscape(/*numDigits*/ 4);
                case ts.CharCode.x:
                    // '\xDD'
                    return scanHexadecimalEscape(/*numDigits*/ 2);
                // when encountering a LineContinuation (i.e. a backslash and a line terminator sequence),
                // the line terminator is interpreted to be "the empty code unit sequence".
                case ts.CharCode.carriageReturn:
                    if (pos < end && text.charCodeAt(pos) === ts.CharCode.lineFeed) {
                        pos++;
                    }
                // fall through
                case ts.CharCode.lineFeed:
                case ts.CharCode.lineSeparator:
                case ts.CharCode.paragraphSeparator:
                    return "";
                default:
                    return String.fromCharCode(ch);
            }
        }
        function scanHexadecimalEscape(numDigits) {
            var escapedValue = scanExactNumberOfHexDigits(numDigits);
            if (escapedValue >= 0) {
                return String.fromCharCode(escapedValue);
            }
            else {
                error(ts.Diagnostics.Hexadecimal_digit_expected);
                return "";
            }
        }
        function scanExtendedUnicodeEscape() {
            var escapedValue = scanMinimumNumberOfHexDigits(1);
            var isInvalidExtendedEscape = false;
            // Validate the value of the digit
            if (escapedValue < 0) {
                error(ts.Diagnostics.Hexadecimal_digit_expected);
                isInvalidExtendedEscape = true;
            }
            else if (escapedValue > 0x10FFFF) {
                error(ts.Diagnostics.An_extended_Unicode_escape_value_must_be_between_0x0_and_0x10FFFF_inclusive);
                isInvalidExtendedEscape = true;
            }
            if (pos >= end) {
                error(ts.Diagnostics.Unexpected_end_of_text);
                isInvalidExtendedEscape = true;
            }
            else if (text.charCodeAt(pos) === ts.CharCode.closeBrace) {
                // Only swallow the following character up if it's a '}'.
                pos++;
            }
            else {
                error(ts.Diagnostics.Unterminated_Unicode_escape_sequence);
                isInvalidExtendedEscape = true;
            }
            if (isInvalidExtendedEscape) {
                return "";
            }
            return utf16EncodeAsString(escapedValue);
        }
        // Derived from the 10.1.1 UTF16Encoding of the ES6 Spec.
        function utf16EncodeAsString(codePoint) {
            ts.Debug.assert(0x0 <= codePoint && codePoint <= 0x10FFFF);
            if (codePoint <= 65535) {
                return String.fromCharCode(codePoint);
            }
            var codeUnit1 = Math.floor((codePoint - 65536) / 1024) + 0xD800;
            var codeUnit2 = ((codePoint - 65536) % 1024) + 0xDC00;
            return String.fromCharCode(codeUnit1, codeUnit2);
        }
        // Current character is known to be a backslash. Check for Unicode escape of the form '\uXXXX'
        // and return code point value if valid Unicode escape is found. Otherwise return -1.
        function peekUnicodeEscape() {
            if (pos + 5 < end && text.charCodeAt(pos + 1) === ts.CharCode.u) {
                var start_1 = pos;
                pos += 2;
                var value = scanExactNumberOfHexDigits(4);
                pos = start_1;
                return value;
            }
            return -1;
        }
        function scanIdentifierParts() {
            var result = "";
            var start = pos;
            while (pos < end) {
                var ch = text.charCodeAt(pos);
                if (ts.isIdentifierPart(ch, languageVersion)) {
                    pos++;
                }
                else if (ch === ts.CharCode.backslash) {
                    ch = peekUnicodeEscape();
                    if (!(ch >= 0 && ts.isIdentifierPart(ch, languageVersion))) {
                        break;
                    }
                    result += text.substring(start, pos);
                    result += String.fromCharCode(ch);
                    // Valid Unicode escape is always six characters
                    pos += 6;
                    start = pos;
                }
                else {
                    break;
                }
            }
            result += text.substring(start, pos);
            return result;
        }
        function scanBinaryOrOctalDigits(base) {
            ts.Debug.assert(base !== 2 || base !== 8, "Expected either base 2 or base 8");
            var value = 0;
            // For counting number of digits; Valid binaryIntegerLiteral must have at least one binary digit following B or b.
            // Similarly valid octalIntegerLiteral must have at least one octal digit following o or O.
            var numberOfDigits = 0;
            while (true) {
                var ch = text.charCodeAt(pos);
                var valueOfCh = ch - ts.CharCode.num0;
                if (!isDecimalDigit(ch) || valueOfCh >= base) {
                    break;
                }
                value = value * base + valueOfCh;
                pos++;
                numberOfDigits++;
            }
            // Invalid binaryIntegerLiteral or octalIntegerLiteral
            if (numberOfDigits === 0) {
                return -1;
            }
            return value;
        }
        function scan() {
            startPos = pos;
            hasExtendedUnicodeEscape = false;
            precedingLineBreak = false;
            tokenIsUnterminated = false;
            while (true) {
                tokenPos = pos;
                if (pos >= end) {
                    return token = 1 /* endOfFile */;
                }
                var ch = text.charCodeAt(pos);
                // Special handling for shebang
                if (ch === ts.CharCode.hash && pos === 0 && isShebangTrivia(text, pos)) {
                    pos = scanShebangTrivia(text, pos);
                    if (skipTrivia) {
                        continue;
                    }
                    else {
                        return token = ts.TokenType.shebang;
                    }
                }
                switch (ch) {
                    case ts.CharCode.lineFeed:
                    case ts.CharCode.carriageReturn:
                        precedingLineBreak = true;
                        if (skipTrivia) {
                            pos++;
                            continue;
                        }
                        else {
                            if (ch === ts.CharCode.carriageReturn && pos + 1 < end && text.charCodeAt(pos + 1) === ts.CharCode.lineFeed) {
                                // consume both CR and LF
                                pos += 2;
                            }
                            else {
                                pos++;
                            }
                            return token = ts.TokenType.newLine;
                        }
                    case ts.CharCode.horizontalTab:
                    case ts.CharCode.verticalTab:
                    case ts.CharCode.formFeed:
                    case ts.CharCode.space:
                        if (skipTrivia) {
                            pos++;
                            continue;
                        }
                        else {
                            while (pos < end && ts.isNoBreakWhiteSpace(text.charCodeAt(pos))) {
                                pos++;
                            }
                            return token = ts.TokenType.whitespace;
                        }
                    case ts.CharCode.exclamation:
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            if (text.charCodeAt(pos + 2) === ts.CharCode.equals) {
                                return pos += 3, token = 67 /* exclamationEqualsEquals */;
                            }
                            return pos += 2, token = 65 /* exclamationEquals */;
                        }
                        pos++;
                        return token = 32 /* exclamation */;
                    case ts.CharCode.doubleQuote:
                    case ts.CharCode.singleQuote:
                        tokenValue = scanString();
                        return token = 155 /* StringLiteral */;
                    case ts.CharCode.backtick:
                        return token = scanTemplateAndSetTokenValue();
                    case ts.CharCode.percent:
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            return pos += 2, token = 82 /* percentEquals */;
                        }
                        pos++;
                        return token = 60 /* percent */;
                    case ts.CharCode.ampersand:
                        if (text.charCodeAt(pos + 1) === ts.CharCode.ampersand) {
                            return pos += 2, token = 73 /* ampersandAmpersand */;
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            return pos += 2, token = 86 /* ampersandEquals */;
                        }
                        pos++;
                        return token = 57 /* ampersand */;
                    case ts.CharCode.openParen:
                        pos++;
                        return token = 42 /* openParen */;
                    case ts.CharCode.closeParen:
                        pos++;
                        return token = 96 /* closeParen */;
                    case ts.CharCode.asterisk:
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            return pos += 2, token = 80 /* asteriskEquals */;
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.asterisk) {
                            if (text.charCodeAt(pos + 2) === ts.CharCode.equals) {
                                return pos += 3, token = 89 /* asteriskAsteriskEquals */;
                            }
                            return pos += 2, token = 75 /* asteriskAsterisk */;
                        }
                        pos++;
                        return token = 56 /* asterisk */;
                    case ts.CharCode.plus:
                        if (text.charCodeAt(pos + 1) === ts.CharCode.plus) {
                            return pos += 2, token = 47 /* plusPlus */;
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            return pos += 2, token = 78 /* plusEquals */;
                        }
                        pos++;
                        return token = 44 /* plus */;
                    case ts.CharCode.comma:
                        pos++;
                        return token = 92 /* comma */;
                    case ts.CharCode.minus:
                        if (text.charCodeAt(pos + 1) === ts.CharCode.minus) {
                            return pos += 2, token = 48 /* minusMinus */;
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            return pos += 2, token = 79 /* minusEquals */;
                        }
                        pos++;
                        return token = 45 /* minus */;
                    case ts.CharCode.dot:
                        if (isDecimalDigit(text.charCodeAt(pos + 1))) {
                            tokenValue = scanNumber();
                            return token = 154 /* NumericLiteral */;
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.dot && text.charCodeAt(pos + 2) === ts.CharCode.dot) {
                            return pos += 3, token = 51 /* dotDotDot */;
                        }
                        pos++;
                        return token = 53 /* dot */;
                    case ts.CharCode.slash:
                        // Single-line comment
                        if (text.charCodeAt(pos + 1) === ts.CharCode.slash) {
                            pos += 2;
                            while (pos < end) {
                                if (ts.isLineBreak(text.charCodeAt(pos))) {
                                    break;
                                }
                                pos++;
                            }
                            if (skipTrivia) {
                                continue;
                            }
                            else {
                                return token = ts.TokenType.singleLineComment;
                            }
                        }
                        // Multi-line comment
                        if (text.charCodeAt(pos + 1) === ts.CharCode.asterisk) {
                            pos += 2;
                            var commentClosed = false;
                            while (pos < end) {
                                var ch_2 = text.charCodeAt(pos);
                                if (ch_2 === ts.CharCode.asterisk && text.charCodeAt(pos + 1) === ts.CharCode.slash) {
                                    pos += 2;
                                    commentClosed = true;
                                    break;
                                }
                                if (ts.isLineBreak(ch_2)) {
                                    precedingLineBreak = true;
                                }
                                pos++;
                            }
                            if (!commentClosed) {
                                error(ts.Diagnostics.Asterisk_Slash_expected);
                            }
                            if (skipTrivia) {
                                continue;
                            }
                            else {
                                tokenIsUnterminated = !commentClosed;
                                return token = ts.TokenType.multiLineComment;
                            }
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            return pos += 2, token = 81 /* slashEquals */;
                        }
                        pos++;
                        return token = 46 /* slash */;
                    case ts.CharCode.num0:
                        if (pos + 2 < end && (text.charCodeAt(pos + 1) === ts.CharCode.X || text.charCodeAt(pos + 1) === ts.CharCode.x)) {
                            pos += 2;
                            var value = scanMinimumNumberOfHexDigits(1);
                            if (value < 0) {
                                error(ts.Diagnostics.Hexadecimal_digit_expected);
                                value = 0;
                            }
                            tokenValue = "" + value;
                            return token = 154 /* NumericLiteral */;
                        }
                        else if (pos + 2 < end && (text.charCodeAt(pos + 1) === ts.CharCode.B || text.charCodeAt(pos + 1) === ts.CharCode.b)) {
                            pos += 2;
                            var value = scanBinaryOrOctalDigits(/* base */ 2);
                            if (value < 0) {
                                error(ts.Diagnostics.Binary_digit_expected);
                                value = 0;
                            }
                            tokenValue = "" + value;
                            return token = 154 /* NumericLiteral */;
                        }
                        else if (pos + 2 < end && (text.charCodeAt(pos + 1) === ts.CharCode.O || text.charCodeAt(pos + 1) === ts.CharCode.o)) {
                            pos += 2;
                            var value = scanBinaryOrOctalDigits(/* base */ 8);
                            if (value < 0) {
                                error(ts.Diagnostics.Octal_digit_expected);
                                value = 0;
                            }
                            tokenValue = "" + value;
                            return token = 154 /* NumericLiteral */;
                        }
                        // Try to parse as an octal
                        if (pos + 1 < end && ts.isOctalDigit(text.charCodeAt(pos + 1))) {
                            tokenValue = "" + scanOctalDigits();
                            return token = 154 /* NumericLiteral */;
                        }
                    // This fall-through is a deviation from the EcmaScript grammar. The grammar says that a leading zero
                    // can only be followed by an octal digit, a dot, or the end of the number literal. However, we are being
                    // permissive and allowing decimal digits of the form 08* and 09* (which many browsers also do).
                    case ts.CharCode.num1:
                    case ts.CharCode.num2:
                    case ts.CharCode.num3:
                    case ts.CharCode.num4:
                    case ts.CharCode.num5:
                    case ts.CharCode.num6:
                    case ts.CharCode.num7:
                    case ts.CharCode.num8:
                    case ts.CharCode.num9:
                        tokenValue = scanNumber();
                        return token = 154 /* NumericLiteral */;
                    case ts.CharCode.colon:
                        pos++;
                        return token = 99 /* colon */;
                    case ts.CharCode.semicolon:
                        pos++;
                        return token = 100 /* semicolon */;
                    case ts.CharCode.lessThan:
                        if (isConflictMarkerTrivia(text, pos)) {
                            pos = scanConflictMarkerTrivia(text, pos, error);
                            if (skipTrivia) {
                                continue;
                            }
                            else {
                                return token = ts.TokenType.conflictMarker;
                            }
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.lessThan) {
                            if (text.charCodeAt(pos + 2) === ts.CharCode.equals) {
                                return pos += 3, token = 83 /* lessThanLessThanEquals */;
                            }
                            return pos += 2, token = 68 /* lessThanLessThan */;
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            return pos += 2, token = 62 /* lessThanEquals */;
                        }
                        if (languageVariant === 1 /* JSX */ &&
                            text.charCodeAt(pos + 1) === ts.CharCode.slash &&
                            text.charCodeAt(pos + 2) !== ts.CharCode.asterisk) {
                            return pos += 2, token = ts.TokenType.lessThanSlash;
                        }
                        pos++;
                        return token = 49 /* lessThan */;
                    case ts.CharCode.equals:
                        if (isConflictMarkerTrivia(text, pos)) {
                            pos = scanConflictMarkerTrivia(text, pos, error);
                            if (skipTrivia) {
                                continue;
                            }
                            else {
                                return token = ts.TokenType.conflictMarker;
                            }
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            if (text.charCodeAt(pos + 2) === ts.CharCode.equals) {
                                return pos += 3, token = 66 /* equalsEqualsEquals */;
                            }
                            return pos += 2, token = 64 /* equalsEquals */;
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.greaterThan) {
                            return pos += 2, token = 50 /* equalsGreaterThan */;
                        }
                        pos++;
                        return token = 77 /* equals */;
                    case ts.CharCode.greaterThan:
                        if (isConflictMarkerTrivia(text, pos)) {
                            pos = scanConflictMarkerTrivia(text, pos, error);
                            if (skipTrivia) {
                                continue;
                            }
                            else {
                                return token = ts.TokenType.conflictMarker;
                            }
                        }
                        pos++;
                        return token = 61 /* greaterThan */;
                    case ts.CharCode.question:
                        pos++;
                        return token = 91 /* question */;
                    case ts.CharCode.openBracket:
                        pos++;
                        return token = 43 /* openBracket */;
                    case ts.CharCode.closeBracket:
                        pos++;
                        return token = 97 /* closeBracket */;
                    case ts.CharCode.caret:
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            return pos += 2, token = 88 /* caretEquals */;
                        }
                        pos++;
                        return token = 72 /* caret */;
                    case ts.CharCode.openBrace:
                        pos++;
                        return token = 31 /* openBrace */;
                    case ts.CharCode.bar:
                        if (text.charCodeAt(pos + 1) === ts.CharCode.bar) {
                            return pos += 2, token = 74 /* barBar */;
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            return pos += 2, token = 87 /* barEquals */;
                        }
                        pos++;
                        return token = 71 /* bar */;
                    case ts.CharCode.closeBrace:
                        pos++;
                        return token = 98 /* closeBrace */;
                    case ts.CharCode.tilde:
                        pos++;
                        return token = 37 /* tilde */;
                    case ts.CharCode.at:
                        pos++;
                        return token = 40 /* at */;
                    case ts.CharCode.backslash:
                        var cookedChar = peekUnicodeEscape();
                        if (cookedChar >= 0 && ts.isIdentifierStart(cookedChar, languageVersion)) {
                            pos += 6;
                            tokenValue = String.fromCharCode(cookedChar) + scanIdentifierParts();
                            return token = getIdentifierToken();
                        }
                        error(ts.Diagnostics.Invalid_character);
                        pos++;
                        return token = 0 /* unknown */;
                    default:
                        if (ts.isIdentifierStart(ch, languageVersion)) {
                            pos++;
                            while (pos < end && ts.isIdentifierPart(ch = text.charCodeAt(pos), languageVersion))
                                pos++;
                            tokenValue = text.substring(tokenPos, pos);
                            if (ch === ts.CharCode.backslash) {
                                tokenValue += scanIdentifierParts();
                            }
                            return token = getIdentifierToken();
                        }
                        else if (ts.isNoBreakWhiteSpace(ch)) {
                            pos++;
                            continue;
                        }
                        else if (ts.isLineBreak(ch)) {
                            precedingLineBreak = true;
                            pos++;
                            continue;
                        }
                        error(ts.Diagnostics.Invalid_character);
                        pos++;
                        return token = 0 /* unknown */;
                }
            }
        }
        function reScanGreaterToken() {
            if (token === 61 /* greaterThan */) {
                if (text.charCodeAt(pos) === ts.CharCode.greaterThan) {
                    if (text.charCodeAt(pos + 1) === ts.CharCode.greaterThan) {
                        if (text.charCodeAt(pos + 2) === ts.CharCode.equals) {
                            return pos += 3, token = 85 /* greaterThanGreaterThanGreaterThanEquals */;
                        }
                        return pos += 2, token = 70 /* greaterThanGreaterThanGreaterThan */;
                    }
                    if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                        return pos += 2, token = 84 /* greaterThanGreaterThanEquals */;
                    }
                    pos++;
                    return token = 69 /* greaterThanGreaterThan */;
                }
                if (text.charCodeAt(pos) === ts.CharCode.equals) {
                    pos++;
                    return token = 63 /* greaterThanEquals */;
                }
            }
            return token;
        }
        function reScanSlashToken() {
            if (token === 46 /* slash */ || token === 81 /* slashEquals */) {
                var p = tokenPos + 1;
                var inEscape = false;
                var inCharacterClass = false;
                while (true) {
                    // If we reach the end of a file, or hit a newline, then this is an unterminated
                    // regex.  Report error and return what we have so far.
                    if (p >= end) {
                        tokenIsUnterminated = true;
                        error(ts.Diagnostics.Unterminated_regular_expression_literal);
                        break;
                    }
                    var ch = text.charCodeAt(p);
                    if (ts.isLineBreak(ch)) {
                        tokenIsUnterminated = true;
                        error(ts.Diagnostics.Unterminated_regular_expression_literal);
                        break;
                    }
                    if (inEscape) {
                        // Parsing an escape character;
                        // reset the flag and just advance to the next char.
                        inEscape = false;
                    }
                    else if (ch === ts.CharCode.slash && !inCharacterClass) {
                        // A slash within a character class is permissible,
                        // but in general it signals the end of the regexp literal.
                        p++;
                        break;
                    }
                    else if (ch === ts.CharCode.openBracket) {
                        inCharacterClass = true;
                    }
                    else if (ch === ts.CharCode.backslash) {
                        inEscape = true;
                    }
                    else if (ch === ts.CharCode.closeBracket) {
                        inCharacterClass = false;
                    }
                    p++;
                }
                while (p < end && ts.isIdentifierPart(text.charCodeAt(p), languageVersion)) {
                    p++;
                }
                pos = p;
                tokenValue = text.substring(tokenPos, pos);
                token = 156 /* RegularExpressionLiteral */;
            }
            return token;
        }
        /**
         * Unconditionally back up and scan a template expression portion.
         */
        function reScanTemplateToken() {
            ts.Debug.assert(token === 98 /* closeBrace */, "'reScanTemplateToken' should only be called on a '}'");
            pos = tokenPos;
            return token = scanTemplateAndSetTokenValue();
        }
        function reScanJsxToken() {
            pos = tokenPos = startPos;
            return token = scanJsxToken();
        }
        function scanJsxToken() {
            startPos = tokenPos = pos;
            if (pos >= end) {
                return token = 1 /* endOfFile */;
            }
            var char = text.charCodeAt(pos);
            if (char === ts.CharCode.lessThan) {
                if (text.charCodeAt(pos + 1) === ts.CharCode.slash) {
                    pos += 2;
                    return token = ts.TokenType.lessThanSlash;
                }
                pos++;
                return token = 49 /* lessThan */;
            }
            if (char === ts.CharCode.openBrace) {
                pos++;
                return token = 31 /* openBrace */;
            }
            while (pos < end) {
                pos++;
                char = text.charCodeAt(pos);
                if ((char === ts.CharCode.openBrace) || (char === ts.CharCode.lessThan)) {
                    break;
                }
            }
            return token = 390 /* JsxText */;
        }
        // Scans a JSX identifier; these differ from normal identifiers in that
        // they allow dashes
        function scanJsxIdentifier() {
            if (tokenIsIdentifierOrKeyword(token)) {
                var firstCharPosition = pos;
                while (pos < end) {
                    var ch = text.charCodeAt(pos);
                    if (ch === ts.CharCode.minus || ((firstCharPosition === pos) ? ts.isIdentifierStart(ch, languageVersion) : ts.isIdentifierPart(ch, languageVersion))) {
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
        function scanJSDocToken() {
            if (pos >= end) {
                return token = 1 /* endOfFile */;
            }
            startPos = pos;
            // Eat leading whitespace
            var ch = text.charCodeAt(pos);
            while (pos < end) {
                ch = text.charCodeAt(pos);
                if (ts.isNoBreakWhiteSpace(ch)) {
                    pos++;
                }
                else {
                    break;
                }
            }
            tokenPos = pos;
            switch (ch) {
                case ts.CharCode.at:
                    return pos += 1, token = 40 /* at */;
                case ts.CharCode.lineFeed:
                case ts.CharCode.carriageReturn:
                    return pos += 1, token = ts.TokenType.newLine;
                case ts.CharCode.asterisk:
                    return pos += 1, token = 56 /* asterisk */;
                case ts.CharCode.openBrace:
                    return pos += 1, token = 31 /* openBrace */;
                case ts.CharCode.closeBrace:
                    return pos += 1, token = 98 /* closeBrace */;
                case ts.CharCode.openBracket:
                    return pos += 1, token = 43 /* openBracket */;
                case ts.CharCode.closeBracket:
                    return pos += 1, token = 97 /* closeBracket */;
                case ts.CharCode.equals:
                    return pos += 1, token = 77 /* equals */;
                case ts.CharCode.comma:
                    return pos += 1, token = 92 /* comma */;
            }
            if (ts.isIdentifierStart(ch, 2 /* Latest */)) {
                pos++;
                while (ts.isIdentifierPart(text.charCodeAt(pos), 2 /* Latest */) && pos < end) {
                    pos++;
                }
                return token = 215 /* Identifier */;
            }
            else {
                return pos += 1, token = 0 /* unknown */;
            }
        }
        function speculationHelper(callback, isLookahead) {
            var savePos = pos;
            var saveStartPos = startPos;
            var saveTokenPos = tokenPos;
            var saveToken = token;
            var saveTokenValue = tokenValue;
            var savePrecedingLineBreak = precedingLineBreak;
            var result = callback();
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
        function scanRange(start, length, callback) {
            var saveEnd = end;
            var savePos = pos;
            var saveStartPos = startPos;
            var saveTokenPos = tokenPos;
            var saveToken = token;
            var savePrecedingLineBreak = precedingLineBreak;
            var saveTokenValue = tokenValue;
            var saveHasExtendedUnicodeEscape = hasExtendedUnicodeEscape;
            var saveTokenIsUnterminated = tokenIsUnterminated;
            setText(text, start, length);
            var result = callback();
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
        function lookAhead(callback) {
            return speculationHelper(callback, /*isLookahead*/ true);
        }
        function tryScan(callback) {
            return speculationHelper(callback, /*isLookahead*/ false);
        }
        function getText() {
            return text;
        }
        function setText(newText, start, length) {
            text = newText || "";
            end = length === undefined ? text.length : start + length;
            setTextPos(start || 0);
        }
        function setScriptTarget(scriptTarget) {
            languageVersion = scriptTarget;
        }
        function setLanguageVariant(variant) {
            languageVariant = variant;
        }
        function setTextPos(textPos) {
            ts.Debug.assert(textPos >= 0);
            pos = textPos;
            startPos = textPos;
            tokenPos = textPos;
            token = 0 /* unknown */;
            precedingLineBreak = false;
            tokenValue = undefined;
            hasExtendedUnicodeEscape = false;
            tokenIsUnterminated = false;
        }
    }
    ts.createScanner = createScanner;
})(ts || (ts = {}));
//# sourceMappingURL=scanner.js.map