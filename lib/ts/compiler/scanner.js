/// <reference path="core.ts"/>
/// <reference path="diagnosticInformationMap.generated.ts"/>
var ts;
(function (ts) {
    /* @internal */
    function tokenIsIdentifierOrKeyword(token) {
        return token >= 69 /* Identifier */;
    }
    ts.tokenIsIdentifierOrKeyword = tokenIsIdentifierOrKeyword;
    var textToToken = {
        "abstract": 115 /* AbstractKeyword */,
        "any": 117 /* AnyKeyword */,
        "as": 116 /* AsKeyword */,
        "boolean": 120 /* BooleanKeyword */,
        "break": 70 /* BreakKeyword */,
        "case": 71 /* CaseKeyword */,
        "catch": 72 /* CatchKeyword */,
        "class": 73 /* ClassKeyword */,
        "continue": 75 /* ContinueKeyword */,
        "const": 74 /* ConstKeyword */,
        "constructor": 121 /* ConstructorKeyword */,
        "debugger": 76 /* DebuggerKeyword */,
        "declare": 122 /* DeclareKeyword */,
        "default": 77 /* DefaultKeyword */,
        "delete": 78 /* DeleteKeyword */,
        "do": 79 /* DoKeyword */,
        "else": 80 /* ElseKeyword */,
        "enum": 81 /* EnumKeyword */,
        "export": 82 /* ExportKeyword */,
        "extends": 83 /* ExtendsKeyword */,
        "false": 84 /* FalseKeyword */,
        "finally": 85 /* FinallyKeyword */,
        "for": 86 /* ForKeyword */,
        "from": 136 /* FromKeyword */,
        "function": 87 /* FunctionKeyword */,
        "get": 123 /* GetKeyword */,
        "if": 88 /* IfKeyword */,
        "implements": 106 /* ImplementsKeyword */,
        "import": 89 /* ImportKeyword */,
        "in": 90 /* InKeyword */,
        "instanceof": 91 /* InstanceOfKeyword */,
        "interface": 107 /* InterfaceKeyword */,
        "is": 124 /* IsKeyword */,
        "let": 108 /* LetKeyword */,
        "module": 125 /* ModuleKeyword */,
        "namespace": 126 /* NamespaceKeyword */,
        "never": 127 /* NeverKeyword */,
        "new": 92 /* NewKeyword */,
        "null": 93 /* NullKeyword */,
        "number": 130 /* NumberKeyword */,
        "package": 109 /* PackageKeyword */,
        "private": 110 /* PrivateKeyword */,
        "protected": 111 /* ProtectedKeyword */,
        "public": 112 /* PublicKeyword */,
        "readonly": 128 /* ReadonlyKeyword */,
        "require": 129 /* RequireKeyword */,
        "global": 137 /* GlobalKeyword */,
        "return": 94 /* ReturnKeyword */,
        "set": 131 /* SetKeyword */,
        "static": 113 /* StaticKeyword */,
        "string": 132 /* StringKeyword */,
        "super": 95 /* SuperKeyword */,
        "switch": 96 /* SwitchKeyword */,
        "symbol": 133 /* SymbolKeyword */,
        "this": 97 /* ThisKeyword */,
        "throw": 98 /* ThrowKeyword */,
        "true": 99 /* TrueKeyword */,
        "try": 100 /* TryKeyword */,
        "type": 134 /* TypeKeyword */,
        "typeof": 101 /* TypeOfKeyword */,
        "undefined": 135 /* UndefinedKeyword */,
        "var": 102 /* VarKeyword */,
        "void": 103 /* VoidKeyword */,
        "while": 104 /* WhileKeyword */,
        "with": 105 /* WithKeyword */,
        "yield": 114 /* YieldKeyword */,
        "async": 118 /* AsyncKeyword */,
        "await": 119 /* AwaitKeyword */,
        "of": 138 /* OfKeyword */,
        "{": 15 /* OpenBraceToken */,
        "}": 16 /* CloseBraceToken */,
        "(": 17 /* OpenParenToken */,
        ")": 18 /* CloseParenToken */,
        "[": 19 /* OpenBracketToken */,
        "]": 20 /* CloseBracketToken */,
        ".": 21 /* DotToken */,
        "...": 22 /* DotDotDotToken */,
        ";": 23 /* SemicolonToken */,
        ",": 24 /* CommaToken */,
        "<": 25 /* LessThanToken */,
        ">": 27 /* GreaterThanToken */,
        "<=": 28 /* LessThanEqualsToken */,
        ">=": 29 /* GreaterThanEqualsToken */,
        "==": 30 /* EqualsEqualsToken */,
        "!=": 31 /* ExclamationEqualsToken */,
        "===": 32 /* EqualsEqualsEqualsToken */,
        "!==": 33 /* ExclamationEqualsEqualsToken */,
        "=>": 34 /* EqualsGreaterThanToken */,
        "+": 35 /* PlusToken */,
        "-": 36 /* MinusToken */,
        "**": 38 /* AsteriskAsteriskToken */,
        "*": 37 /* AsteriskToken */,
        "/": 39 /* SlashToken */,
        "%": 40 /* PercentToken */,
        "++": 41 /* PlusPlusToken */,
        "--": 42 /* MinusMinusToken */,
        "<<": 43 /* LessThanLessThanToken */,
        "</": 26 /* LessThanSlashToken */,
        ">>": 44 /* GreaterThanGreaterThanToken */,
        ">>>": 45 /* GreaterThanGreaterThanGreaterThanToken */,
        "&": 46 /* AmpersandToken */,
        "|": 47 /* BarToken */,
        "^": 48 /* CaretToken */,
        "!": 49 /* ExclamationToken */,
        "~": 50 /* TildeToken */,
        "&&": 51 /* AmpersandAmpersandToken */,
        "||": 52 /* BarBarToken */,
        "?": 53 /* QuestionToken */,
        ":": 54 /* ColonToken */,
        "=": 56 /* EqualsToken */,
        "+=": 57 /* PlusEqualsToken */,
        "-=": 58 /* MinusEqualsToken */,
        "*=": 59 /* AsteriskEqualsToken */,
        "**=": 60 /* AsteriskAsteriskEqualsToken */,
        "/=": 61 /* SlashEqualsToken */,
        "%=": 62 /* PercentEqualsToken */,
        "<<=": 63 /* LessThanLessThanEqualsToken */,
        ">>=": 64 /* GreaterThanGreaterThanEqualsToken */,
        ">>>=": 65 /* GreaterThanGreaterThanGreaterThanEqualsToken */,
        "&=": 66 /* AmpersandEqualsToken */,
        "|=": 67 /* BarEqualsToken */,
        "^=": 68 /* CaretEqualsToken */,
        "@": 55 /* AtToken */,
    };
    /* @internal */ function isUnicodeIdentifierStart(code, languageVersion) {
        return;
    }
    ts.isUnicodeIdentifierStart = isUnicodeIdentifierStart;
    function makeReverseMap(source) {
        var result = [];
        for (var name_1 in source) {
            if (source.hasOwnProperty(name_1)) {
                result[source[name_1]] = name_1;
            }
        }
        return result;
    }
    var tokenStrings = makeReverseMap(textToToken);
    function tokenToString(t) {
        return tokenStrings[t];
    }
    ts.tokenToString = tokenToString;
    /* @internal */
    function stringToToken(s) {
        return textToToken[s];
    }
    ts.stringToToken = stringToToken;
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
                    if (ch > ts.CharCode.asciiMax && isLineBreak(ch)) {
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
    // #region DEL
    function isWhiteSpace(ch) { return; }
    ts.isWhiteSpace = isWhiteSpace;
    /** Does not include line breaks. For that, see isWhiteSpaceLike. */
    function isNoBreakWhiteSpace(ch) { return; }
    ts.isNoBreakWhiteSpace = isNoBreakWhiteSpace;
    function isLineBreak(ch) { return; }
    ts.isLineBreak = isLineBreak;
    function isDecimalDigit(ch) { return; }
    /* @internal */
    function isOctalDigit(ch) { return; }
    ts.isOctalDigit = isOctalDigit;
    function isIdentifierStart(ch, languageVersion) {
        return;
    }
    ts.isIdentifierStart = isIdentifierStart;
    function isIdentifierPart(ch, languageVersion) {
        return;
    }
    ts.isIdentifierPart = isIdentifierPart;
    /* @internal */
    function isIdentifier(name, languageVersion) {
        return;
    }
    ts.isIdentifier = isIdentifier;
    // #endregion
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
                return ch > ts.CharCode.asciiMax;
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
                            if (isLineBreak(text.charCodeAt(pos))) {
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
                    if (ch > ts.CharCode.asciiMax && (isWhiteSpace(ch))) {
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
        if (pos === 0 || isLineBreak(text.charCodeAt(pos - 1))) {
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
    function scanConflictMarkerTrivia(text, pos, error) {
        if (error) {
            error(ts.Diagnostics.Merge_conflict_marker_encountered, mergeConflictMarkerLength);
        }
        var ch = text.charCodeAt(pos);
        var len = text.length;
        if (ch === ts.CharCode.lessThan || ch === ts.CharCode.greaterThan) {
            while (pos < len && !isLineBreak(text.charCodeAt(pos))) {
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
                        var kind = nextChar === ts.CharCode.slash ? 2 /* SingleLineCommentTrivia */ : 3 /* MultiLineCommentTrivia */;
                        var startPos = pos;
                        pos += 2;
                        if (nextChar === ts.CharCode.slash) {
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
                    if (ch > ts.CharCode.asciiMax && (isWhiteSpace(ch))) {
                        if (result && result.length && isLineBreak(ch)) {
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
    function createScanner(languageVersion, skipTrivia, languageVariant, text, onError, start, length) {
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
            hasExtendedUnicodeEscape: function () { return hasExtendedUnicodeEscape; },
            hasPrecedingLineBreak: function () { return precedingLineBreak; },
            isIdentifier: function () { return token === 69 /* Identifier */ || token > 105 /* LastReservedWord */; },
            isReservedWord: function () { return token >= 70 /* FirstReservedWord */ && token <= 105 /* LastReservedWord */; },
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
            setOnError: setOnError,
            setTextPos: setTextPos,
            tryScan: tryScan,
            lookAhead: lookAhead,
            scanRange: scanRange,
        };
        function error(message, length) {
            if (onError) {
                onError(message, length || 0);
            }
        }
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
            while (isOctalDigit(text.charCodeAt(pos))) {
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
                if (ch >= ts.CharCode.num0 && ch <= ts.CharCode)
                    .9;
                {
                    value = value * 16 + ch - ts.CharCode.num0;
                }
                if (ch >= ts.CharCode.A && ch <= ts.CharCode.F) {
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
                if (isLineBreak(ch)) {
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
                    resultingToken = startedWithBacktick ? 11 /* NoSubstitutionTemplateLiteral */ : 14 /* TemplateTail */;
                    break;
                }
                var currChar = text.charCodeAt(pos);
                // '`'
                if (currChar === ts.CharCode.backtick) {
                    contents += text.substring(start, pos);
                    pos++;
                    resultingToken = startedWithBacktick ? 11 /* NoSubstitutionTemplateLiteral */ : 14 /* TemplateTail */;
                    break;
                }
                // '${'
                if (currChar === ts.CharCode.dollar && pos + 1 < end && text.charCodeAt(pos + 1) === ts.CharCode.openBrace) {
                    contents += text.substring(start, pos);
                    pos += 2;
                    resultingToken = startedWithBacktick ? 12 /* TemplateHead */ : 13 /* TemplateMiddle */;
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
                if (isIdentifierPart(ch, languageVersion)) {
                    pos++;
                }
                else if (ch === ts.CharCode.backslash) {
                    ch = peekUnicodeEscape();
                    if (!(ch >= 0 && isIdentifierPart(ch, languageVersion))) {
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
        function getIdentifierToken() {
            // Reserved words are between 2 and 11 characters long and start with a lowercase letter
            var len = tokenValue.length;
            if (len >= 2 && len <= 11) {
                var ch = tokenValue.charCodeAt(0);
                if (ch >= ts.CharCode.a && ch <= ts.CharCode.z && hasOwnProperty.call(textToToken, tokenValue)) {
                    return token = textToToken[tokenValue];
                }
            }
            return token = 69 /* Identifier */;
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
                        return token = 6 /* ShebangTrivia */;
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
                            return token = 4 /* NewLineTrivia */;
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
                            while (pos < end && isNoBreakWhiteSpace(text.charCodeAt(pos))) {
                                pos++;
                            }
                            return token = 5 /* WhitespaceTrivia */;
                        }
                    case ts.CharCode.exclamation:
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            if (text.charCodeAt(pos + 2) === ts.CharCode.equals) {
                                return pos += 3, token = 33 /* ExclamationEqualsEqualsToken */;
                            }
                            return pos += 2, token = 31 /* ExclamationEqualsToken */;
                        }
                        pos++;
                        return token = 49 /* ExclamationToken */;
                    case ts.CharCode.doubleQuote:
                    case ts.CharCode.singleQuote:
                        tokenValue = scanString();
                        return token = 9 /* StringLiteral */;
                    case ts.CharCode.backtick:
                        return token = scanTemplateAndSetTokenValue();
                    case ts.CharCode.percent:
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            return pos += 2, token = 62 /* PercentEqualsToken */;
                        }
                        pos++;
                        return token = 40 /* PercentToken */;
                    case ts.CharCode.ampersand:
                        if (text.charCodeAt(pos + 1) === ts.CharCode.ampersand) {
                            return pos += 2, token = 51 /* AmpersandAmpersandToken */;
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            return pos += 2, token = 66 /* AmpersandEqualsToken */;
                        }
                        pos++;
                        return token = 46 /* AmpersandToken */;
                    case ts.CharCode.openParen:
                        pos++;
                        return token = 17 /* OpenParenToken */;
                    case ts.CharCode.closeParen:
                        pos++;
                        return token = 18 /* CloseParenToken */;
                    case ts.CharCode.asterisk:
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            return pos += 2, token = 59 /* AsteriskEqualsToken */;
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.asterisk) {
                            if (text.charCodeAt(pos + 2) === ts.CharCode.equals) {
                                return pos += 3, token = 60 /* AsteriskAsteriskEqualsToken */;
                            }
                            return pos += 2, token = 38 /* AsteriskAsteriskToken */;
                        }
                        pos++;
                        return token = 37 /* AsteriskToken */;
                    case ts.CharCode.plus:
                        if (text.charCodeAt(pos + 1) === ts.CharCode.plus) {
                            return pos += 2, token = 41 /* PlusPlusToken */;
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            return pos += 2, token = 57 /* PlusEqualsToken */;
                        }
                        pos++;
                        return token = 35 /* PlusToken */;
                    case ts.CharCode.comma:
                        pos++;
                        return token = 24 /* CommaToken */;
                    case ts.CharCode.minus:
                        if (text.charCodeAt(pos + 1) === ts.CharCode.minus) {
                            return pos += 2, token = 42 /* MinusMinusToken */;
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            return pos += 2, token = 58 /* MinusEqualsToken */;
                        }
                        pos++;
                        return token = 36 /* MinusToken */;
                    case ts.CharCode.dot:
                        if (isDecimalDigit(text.charCodeAt(pos + 1))) {
                            tokenValue = scanNumber();
                            return token = 8 /* NumericLiteral */;
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.dot && text.charCodeAt(pos + 2) === ts.CharCode.dot) {
                            return pos += 3, token = 22 /* DotDotDotToken */;
                        }
                        pos++;
                        return token = 21 /* DotToken */;
                    case ts.CharCode.slash:
                        // Single-line comment
                        if (text.charCodeAt(pos + 1) === ts.CharCode.slash) {
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
                                return token = 2 /* SingleLineCommentTrivia */;
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
                                if (isLineBreak(ch_2)) {
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
                                return token = 3 /* MultiLineCommentTrivia */;
                            }
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            return pos += 2, token = 61 /* SlashEqualsToken */;
                        }
                        pos++;
                        return token = 39 /* SlashToken */;
                    case ts.CharCode.num0:
                        if (pos + 2 < end && (text.charCodeAt(pos + 1) === ts.CharCode.X || text.charCodeAt(pos + 1) === ts.CharCode.x)) {
                            pos += 2;
                            var value = scanMinimumNumberOfHexDigits(1);
                            if (value < 0) {
                                error(ts.Diagnostics.Hexadecimal_digit_expected);
                                value = 0;
                            }
                            tokenValue = "" + value;
                            return token = 8 /* NumericLiteral */;
                        }
                        else if (pos + 2 < end && (text.charCodeAt(pos + 1) === ts.CharCode.B || text.charCodeAt(pos + 1) === ts.CharCode.b)) {
                            pos += 2;
                            var value = scanBinaryOrOctalDigits(/* base */ 2);
                            if (value < 0) {
                                error(ts.Diagnostics.Binary_digit_expected);
                                value = 0;
                            }
                            tokenValue = "" + value;
                            return token = 8 /* NumericLiteral */;
                        }
                        else if (pos + 2 < end && (text.charCodeAt(pos + 1) === ts.CharCode.O || text.charCodeAt(pos + 1) === ts.CharCode.o)) {
                            pos += 2;
                            var value = scanBinaryOrOctalDigits(/* base */ 8);
                            if (value < 0) {
                                error(ts.Diagnostics.Octal_digit_expected);
                                value = 0;
                            }
                            tokenValue = "" + value;
                            return token = 8 /* NumericLiteral */;
                        }
                        // Try to parse as an octal
                        if (pos + 1 < end && isOctalDigit(text.charCodeAt(pos + 1))) {
                            tokenValue = "" + scanOctalDigits();
                            return token = 8 /* NumericLiteral */;
                        }
                    // This fall-through is a deviation from the EcmaScript grammar. The grammar says that a leading zero
                    // can only be followed by an octal digit, a dot, or the end of the number literal. However, we are being
                    // permissive and allowing decimal digits of the form 08* and 09* (which many browsers also do).
                    case ts.CharCode: .1;
                    case ts.CharCode: .2;
                    case ts.CharCode: .3;
                    case ts.CharCode: .4;
                    case ts.CharCode.num5:
                    case ts.CharCode: .6;
                    case ts.CharCode.num7:
                    case ts.CharCode: .8;
                    case ts.CharCode:
                        .9;
                        tokenValue = scanNumber();
                        return token = 8 /* NumericLiteral */;
                    case ts.CharCode.colon:
                        pos++;
                        return token = 54 /* ColonToken */;
                    case ts.CharCode.semicolon:
                        pos++;
                        return token = 23 /* SemicolonToken */;
                    case ts.CharCode.lessThan:
                        if (isConflictMarkerTrivia(text, pos)) {
                            pos = scanConflictMarkerTrivia(text, pos, error);
                            if (skipTrivia) {
                                continue;
                            }
                            else {
                                return token = 7 /* ConflictMarkerTrivia */;
                            }
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.lessThan) {
                            if (text.charCodeAt(pos + 2) === ts.CharCode.equals) {
                                return pos += 3, token = 63 /* LessThanLessThanEqualsToken */;
                            }
                            return pos += 2, token = 43 /* LessThanLessThanToken */;
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            return pos += 2, token = 28 /* LessThanEqualsToken */;
                        }
                        if (languageVariant === 1 /* JSX */ &&
                            text.charCodeAt(pos + 1) === ts.CharCode.slash &&
                            text.charCodeAt(pos + 2) !== ts.CharCode.asterisk) {
                            return pos += 2, token = 26 /* LessThanSlashToken */;
                        }
                        pos++;
                        return token = 25 /* LessThanToken */;
                    case ts.CharCode.equals:
                        if (isConflictMarkerTrivia(text, pos)) {
                            pos = scanConflictMarkerTrivia(text, pos, error);
                            if (skipTrivia) {
                                continue;
                            }
                            else {
                                return token = 7 /* ConflictMarkerTrivia */;
                            }
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            if (text.charCodeAt(pos + 2) === ts.CharCode.equals) {
                                return pos += 3, token = 32 /* EqualsEqualsEqualsToken */;
                            }
                            return pos += 2, token = 30 /* EqualsEqualsToken */;
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.greaterThan) {
                            return pos += 2, token = 34 /* EqualsGreaterThanToken */;
                        }
                        pos++;
                        return token = 56 /* EqualsToken */;
                    case ts.CharCode.greaterThan:
                        if (isConflictMarkerTrivia(text, pos)) {
                            pos = scanConflictMarkerTrivia(text, pos, error);
                            if (skipTrivia) {
                                continue;
                            }
                            else {
                                return token = 7 /* ConflictMarkerTrivia */;
                            }
                        }
                        pos++;
                        return token = 27 /* GreaterThanToken */;
                    case ts.CharCode.question:
                        pos++;
                        return token = 53 /* QuestionToken */;
                    case ts.CharCode.openBracket:
                        pos++;
                        return token = 19 /* OpenBracketToken */;
                    case ts.CharCode.closeBracket:
                        pos++;
                        return token = 20 /* CloseBracketToken */;
                    case ts.CharCode.caret:
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            return pos += 2, token = 68 /* CaretEqualsToken */;
                        }
                        pos++;
                        return token = 48 /* CaretToken */;
                    case ts.CharCode.openBrace:
                        pos++;
                        return token = 15 /* OpenBraceToken */;
                    case ts.CharCode.bar:
                        if (text.charCodeAt(pos + 1) === ts.CharCode.bar) {
                            return pos += 2, token = 52 /* BarBarToken */;
                        }
                        if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                            return pos += 2, token = 67 /* BarEqualsToken */;
                        }
                        pos++;
                        return token = 47 /* BarToken */;
                    case ts.CharCode.closeBrace:
                        pos++;
                        return token = 16 /* CloseBraceToken */;
                    case ts.CharCode.tilde:
                        pos++;
                        return token = 50 /* TildeToken */;
                    case ts.CharCode.at:
                        pos++;
                        return token = 55 /* AtToken */;
                    case ts.CharCode.backslash:
                        var cookedChar = peekUnicodeEscape();
                        if (cookedChar >= 0 && isIdentifierStart(cookedChar, languageVersion)) {
                            pos += 6;
                            tokenValue = String.fromCharCode(cookedChar) + scanIdentifierParts();
                            return token = getIdentifierToken();
                        }
                        error(ts.Diagnostics.Invalid_character);
                        pos++;
                        return token = 0 /* unknown */;
                    default:
                        if (isIdentifierStart(ch, languageVersion)) {
                            pos++;
                            while (pos < end && isIdentifierPart(ch = text.charCodeAt(pos), languageVersion))
                                pos++;
                            tokenValue = text.substring(tokenPos, pos);
                            if (ch === ts.CharCode.backslash) {
                                tokenValue += scanIdentifierParts();
                            }
                            return token = getIdentifierToken();
                        }
                        else if (isNoBreakWhiteSpace(ch)) {
                            pos++;
                            continue;
                        }
                        else if (isLineBreak(ch)) {
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
            if (token === 27 /* GreaterThanToken */) {
                if (text.charCodeAt(pos) === ts.CharCode.greaterThan) {
                    if (text.charCodeAt(pos + 1) === ts.CharCode.greaterThan) {
                        if (text.charCodeAt(pos + 2) === ts.CharCode.equals) {
                            return pos += 3, token = 65 /* GreaterThanGreaterThanGreaterThanEqualsToken */;
                        }
                        return pos += 2, token = 45 /* GreaterThanGreaterThanGreaterThanToken */;
                    }
                    if (text.charCodeAt(pos + 1) === ts.CharCode.equals) {
                        return pos += 2, token = 64 /* GreaterThanGreaterThanEqualsToken */;
                    }
                    pos++;
                    return token = 44 /* GreaterThanGreaterThanToken */;
                }
                if (text.charCodeAt(pos) === ts.CharCode.equals) {
                    pos++;
                    return token = 29 /* GreaterThanEqualsToken */;
                }
            }
            return token;
        }
        function reScanSlashToken() {
            if (token === 39 /* SlashToken */ || token === 61 /* SlashEqualsToken */) {
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
                    if (isLineBreak(ch)) {
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
                while (p < end && isIdentifierPart(text.charCodeAt(p), languageVersion)) {
                    p++;
                }
                pos = p;
                tokenValue = text.substring(tokenPos, pos);
                token = 10 /* RegularExpressionLiteral */;
            }
            return token;
        }
        /**
         * Unconditionally back up and scan a template expression portion.
         */
        function reScanTemplateToken() {
            ts.Debug.assert(token === 16 /* CloseBraceToken */, "'reScanTemplateToken' should only be called on a '}'");
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
                    return token = 26 /* LessThanSlashToken */;
                }
                pos++;
                return token = 25 /* LessThanToken */;
            }
            if (char === ts.CharCode.openBrace) {
                pos++;
                return token = 15 /* OpenBraceToken */;
            }
            while (pos < end) {
                pos++;
                char = text.charCodeAt(pos);
                if ((char === ts.CharCode.openBrace) || (char === ts.CharCode.lessThan)) {
                    break;
                }
            }
            return token = 244 /* JsxText */;
        }
        // Scans a JSX identifier; these differ from normal identifiers in that
        // they allow dashes
        function scanJsxIdentifier() {
            if (tokenIsIdentifierOrKeyword(token)) {
                var firstCharPosition = pos;
                while (pos < end) {
                    var ch = text.charCodeAt(pos);
                    if (ch === ts.CharCode.minus || ((firstCharPosition === pos) ? isIdentifierStart(ch, languageVersion) : isIdentifierPart(ch, languageVersion))) {
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
                if (isNoBreakWhiteSpace(ch)) {
                    pos++;
                }
                else {
                    break;
                }
            }
            tokenPos = pos;
            switch (ch) {
                case ts.CharCode.at:
                    return pos += 1, token = 55 /* AtToken */;
                case ts.CharCode.lineFeed:
                case ts.CharCode.carriageReturn:
                    return pos += 1, token = 4 /* NewLineTrivia */;
                case ts.CharCode.asterisk:
                    return pos += 1, token = 37 /* AsteriskToken */;
                case ts.CharCode.openBrace:
                    return pos += 1, token = 15 /* OpenBraceToken */;
                case ts.CharCode.closeBrace:
                    return pos += 1, token = 16 /* CloseBraceToken */;
                case ts.CharCode.openBracket:
                    return pos += 1, token = 19 /* OpenBracketToken */;
                case ts.CharCode.closeBracket:
                    return pos += 1, token = 20 /* CloseBracketToken */;
                case ts.CharCode.equals:
                    return pos += 1, token = 56 /* EqualsToken */;
                case ts.CharCode.comma:
                    return pos += 1, token = 24 /* CommaToken */;
            }
            if (isIdentifierStart(ch, 2 /* Latest */)) {
                pos++;
                while (isIdentifierPart(text.charCodeAt(pos), 2 /* Latest */) && pos < end) {
                    pos++;
                }
                return token = 69 /* Identifier */;
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
        function setOnError(errorCallback) {
            onError = errorCallback;
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