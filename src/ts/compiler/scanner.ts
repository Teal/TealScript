/// <reference path="core.ts"/>
/// <reference path="diagnosticInformationMap.generated.ts"/>

namespace ts {
    export interface ErrorCallback {
        (message: DiagnosticMessage, length: number): void;
    }

    /* @internal */
    export function tokenIsIdentifierOrKeyword(token: TokenType): boolean {
        return token >= TokenType.Identifier;
    }

    export interface Scanner {
        getStartPos(): number;
        getToken(): TokenType;
        getTextPos(): number;
        getTokenPos(): number;
        getTokenText(): string;
        getTokenValue(): string;
        hasExtendedUnicodeEscape(): boolean;
        hasPrecedingLineBreak(): boolean;
        isIdentifier(): boolean;
        isReservedWord(): boolean;
        isUnterminated(): boolean;
        reScanGreaterToken(): TokenType;
        reScanSlashToken(): TokenType;
        reScanTemplateToken(): TokenType;
        scanJsxIdentifier(): TokenType;
        reScanJsxToken(): TokenType;
        scanJsxToken(): TokenType;
        scanJSDocToken(): TokenType;
        scan(): TokenType;
        getText(): string;
        // Sets the text for the scanner to scan.  An optional subrange starting point and length
        // can be provided to have the scanner only scan a portion of the text.
        setText(text: string, start?: number, length?: number): void;
        setOnError(onError: ErrorCallback): void;
        setScriptTarget(scriptTarget: ScriptTarget): void;
        setLanguageVariant(variant: LanguageVariant): void;
        setTextPos(textPos: number): void;
        // Invokes the provided callback then unconditionally restores the scanner to the state it
        // was in immediately prior to invoking the callback.  The result of invoking the callback
        // is returned from this function.
        lookAhead<T>(callback: () => T): T;

        // Invokes the callback with the scanner set to scan the specified range. When the callback
        // returns, the scanner is restored to the state it was in before scanRange was called.
        scanRange<T>(start: number, length: number, callback: () => T): T;

        // Invokes the provided callback.  If the callback returns something falsy, then it restores
        // the scanner to the state it was in immediately prior to invoking the callback.  If the
        // callback returns something truthy, then the scanner state is not rolled back.  The result
        // of invoking the callback is returned from this function.
        tryScan<T>(callback: () => T): T;
    }

    const textToToken: Map<TokenType> = {
        "abstract": TokenType.AbstractKeyword,
        "any": TokenType.AnyKeyword,
        "as": TokenType.AsKeyword,
        "boolean": TokenType.BooleanKeyword,
        "break": TokenType.BreakKeyword,
        "case": TokenType.CaseKeyword,
        "catch": TokenType.CatchKeyword,
        "class": TokenType.ClassKeyword,
        "continue": TokenType.ContinueKeyword,
        "const": TokenType.ConstKeyword,
        "constructor": TokenType.ConstructorKeyword,
        "debugger": TokenType.DebuggerKeyword,
        "declare": TokenType.DeclareKeyword,
        "default": TokenType.DefaultKeyword,
        "delete": TokenType.DeleteKeyword,
        "do": TokenType.DoKeyword,
        "else": TokenType.ElseKeyword,
        "enum": TokenType.EnumKeyword,
        "export": TokenType.ExportKeyword,
        "extends": TokenType.ExtendsKeyword,
        "false": TokenType.FalseKeyword,
        "finally": TokenType.FinallyKeyword,
        "for": TokenType.ForKeyword,
        "from": TokenType.FromKeyword,
        "function": TokenType.FunctionKeyword,
        "get": TokenType.GetKeyword,
        "if": TokenType.IfKeyword,
        "implements": TokenType.ImplementsKeyword,
        "import": TokenType.ImportKeyword,
        "in": TokenType.InKeyword,
        "instanceof": TokenType.InstanceOfKeyword,
        "interface": TokenType.InterfaceKeyword,
        "is": TokenType.IsKeyword,
        "let": TokenType.LetKeyword,
        "module": TokenType.ModuleKeyword,
        "namespace": TokenType.NamespaceKeyword,
        "never": TokenType.NeverKeyword,
        "new": TokenType.NewKeyword,
        "null": TokenType.NullKeyword,
        "number": TokenType.NumberKeyword,
        "package": TokenType.PackageKeyword,
        "private": TokenType.PrivateKeyword,
        "protected": TokenType.ProtectedKeyword,
        "public": TokenType.PublicKeyword,
        "readonly": TokenType.ReadonlyKeyword,
        "require": TokenType.RequireKeyword,
        "global": TokenType.GlobalKeyword,
        "return": TokenType.ReturnKeyword,
        "set": TokenType.SetKeyword,
        "static": TokenType.StaticKeyword,
        "string": TokenType.StringKeyword,
        "super": TokenType.SuperKeyword,
        "switch": TokenType.SwitchKeyword,
        "symbol": TokenType.SymbolKeyword,
        "this": TokenType.ThisKeyword,
        "throw": TokenType.ThrowKeyword,
        "true": TokenType.TrueKeyword,
        "try": TokenType.TryKeyword,
        "type": TokenType.TypeKeyword,
        "typeof": TokenType.TypeOfKeyword,
        "undefined": TokenType.UndefinedKeyword,
        "var": TokenType.VarKeyword,
        "void": TokenType.VoidKeyword,
        "while": TokenType.WhileKeyword,
        "with": TokenType.WithKeyword,
        "yield": TokenType.YieldKeyword,
        "async": TokenType.AsyncKeyword,
        "await": TokenType.AwaitKeyword,
        "of": TokenType.OfKeyword,
        "{": TokenType.OpenBraceToken,
        "}": TokenType.CloseBraceToken,
        "(": TokenType.OpenParenToken,
        ")": TokenType.CloseParenToken,
        "[": TokenType.OpenBracketToken,
        "]": TokenType.CloseBracketToken,
        ".": TokenType.DotToken,
        "...": TokenType.DotDotDotToken,
        ";": TokenType.SemicolonToken,
        ",": TokenType.CommaToken,
        "<": TokenType.LessThanToken,
        ">": TokenType.GreaterThanToken,
        "<=": TokenType.LessThanEqualsToken,
        ">=": TokenType.GreaterThanEqualsToken,
        "==": TokenType.EqualsEqualsToken,
        "!=": TokenType.ExclamationEqualsToken,
        "===": TokenType.EqualsEqualsEqualsToken,
        "!==": TokenType.ExclamationEqualsEqualsToken,
        "=>": TokenType.EqualsGreaterThanToken,
        "+": TokenType.PlusToken,
        "-": TokenType.MinusToken,
        "**": TokenType.AsteriskAsteriskToken,
        "*": TokenType.AsteriskToken,
        "/": TokenType.SlashToken,
        "%": TokenType.PercentToken,
        "++": TokenType.PlusPlusToken,
        "--": TokenType.MinusMinusToken,
        "<<": TokenType.LessThanLessThanToken,
        "</": TokenType.LessThanSlashToken,
        ">>": TokenType.GreaterThanGreaterThanToken,
        ">>>": TokenType.GreaterThanGreaterThanGreaterThanToken,
        "&": TokenType.AmpersandToken,
        "|": TokenType.BarToken,
        "^": TokenType.CaretToken,
        "!": TokenType.ExclamationToken,
        "~": TokenType.TildeToken,
        "&&": TokenType.AmpersandAmpersandToken,
        "||": TokenType.BarBarToken,
        "?": TokenType.QuestionToken,
        ":": TokenType.ColonToken,
        "=": TokenType.EqualsToken,
        "+=": TokenType.PlusEqualsToken,
        "-=": TokenType.MinusEqualsToken,
        "*=": TokenType.AsteriskEqualsToken,
        "**=": TokenType.AsteriskAsteriskEqualsToken,
        "/=": TokenType.SlashEqualsToken,
        "%=": TokenType.PercentEqualsToken,
        "<<=": TokenType.LessThanLessThanEqualsToken,
        ">>=": TokenType.GreaterThanGreaterThanEqualsToken,
        ">>>=": TokenType.GreaterThanGreaterThanGreaterThanEqualsToken,
        "&=": TokenType.AmpersandEqualsToken,
        "|=": TokenType.BarEqualsToken,
        "^=": TokenType.CaretEqualsToken,
        "@": TokenType.AtToken,
    };

    

    /* @internal */ export function isUnicodeIdentifierStart(code: number, languageVersion: ScriptTarget) {
        return ;
    }

    function makeReverseMap(source: Map<number>): string[] {
        const result: string[] = [];
        for (const name in source) {
            if (source.hasOwnProperty(name)) {
                result[source[name]] = name;
            }
        }
        return result;
    }

    const tokenStrings = makeReverseMap(textToToken);

    export function tokenToString(t: TokenType): string {
        return tokenStrings[t];
    }

    /* @internal */
    export function stringToToken(s: string): TokenType {
        return textToToken[s];
    }

    /* @internal */
    export function computeLineStarts(text: string): number[] {
        const result: number[] = new Array();
        let pos = 0;
        let lineStart = 0;
        while (pos < text.length) {
            const ch = text.charCodeAt(pos);
            pos++;
            switch (ch) {
                case CharCode.carriageReturn:
                    if (text.charCodeAt(pos) === CharCode.lineFeed) {
                        pos++;
                    }
                case CharCode.lineFeed:
                    result.push(lineStart);
                    lineStart = pos;
                    break;
                default:
                    if (ch > CharCode.asciiMax && isLineBreak(ch)) {
                        result.push(lineStart);
                        lineStart = pos;
                    }
                    break;
            }
        }
        result.push(lineStart);
        return result;
    }

    export function getPositionOfLineAndCharacter(sourceFile: SourceFile, line: number, character: number): number {
        return computePositionOfLineAndCharacter(getLineStarts(sourceFile), line, character);
    }

    /* @internal */
    export function computePositionOfLineAndCharacter(lineStarts: number[], line: number, character: number): number {
        Debug.assert(line >= 0 && line < lineStarts.length);
        return lineStarts[line] + character;
    }

    /* @internal */
    export function getLineStarts(sourceFile: SourceFile): number[] {
        return sourceFile.lineMap || (sourceFile.lineMap = computeLineStarts(sourceFile.text));
    }

    /* @internal */
    /**
     * We assume the first line starts at position 0 and 'position' is non-negative.
     */
    export function computeLineAndCharacterOfPosition(lineStarts: number[], position: number) {
        let lineNumber = binarySearch(lineStarts, position);
        if (lineNumber < 0) {
            // If the actual position was not found,
            // the binary search returns the 2's-complement of the next line start
            // e.g. if the line starts at [5, 10, 23, 80] and the position requested was 20
            // then the search will return -2.
            //
            // We want the index of the previous line start, so we subtract 1.
            // Review 2's-complement if this is confusing.
            lineNumber = ~lineNumber - 1;
            Debug.assert(lineNumber !== -1, "position cannot precede the beginning of the file");
        }
        return {
            line: lineNumber,
            character: position - lineStarts[lineNumber]
        };
    }

    export function getLineAndCharacterOfPosition(sourceFile: SourceFile, position: number): LineAndCharacter {
        return computeLineAndCharacterOfPosition(getLineStarts(sourceFile), position);
    }

    const hasOwnProperty = Object.prototype.hasOwnProperty;

    // #region DEL

    export function isWhiteSpace(ch: number): boolean { return }

    /** Does not include line breaks. For that, see isWhiteSpaceLike. */
    export function isNoBreakWhiteSpace(ch: number): boolean { return }

    export function isLineBreak(ch: number): boolean { return }

    function isDecimalDigit(ch: number): boolean { return }

    /* @internal */
    export function isOctalDigit(ch: number): boolean { return }

    export function isIdentifierStart(ch: number, languageVersion: ScriptTarget): boolean {
        return;
    }

    export function isIdentifierPart(ch: number, languageVersion: ScriptTarget): boolean {
        return;
    }

    /* @internal */
    export function isIdentifier(name: string, languageVersion: ScriptTarget): boolean {
        return;
    }

    // #endregion

    export function couldStartTrivia(text: string, pos: number): boolean {
        // Keep in sync with skipTrivia
        const ch = text.charCodeAt(pos);
        switch (ch) {
            case CharCode.carriageReturn:
            case CharCode.lineFeed:
            case CharCode.horizontalTab:
            case CharCode.verticalTab:
            case CharCode.formFeed:
            case CharCode.space:
            case CharCode.slash:
            // starts of normal trivia
            case CharCode.lessThan:
            case CharCode.equals:
            case CharCode.greaterThan:
                // Starts of conflict marker trivia
                return true;
            case CharCode.hash:
                // Only if its the beginning can we have #! trivia
                return pos === 0;
            default:
                return ch > CharCode.asciiMax;
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
                case CharCode.carriageReturn:
                    if (text.charCodeAt(pos + 1) === CharCode.lineFeed) {
                        pos++;
                    }
                case CharCode.lineFeed:
                    pos++;
                    if (stopAfterLineBreak) {
                        return pos;
                    }
                    continue;
                case CharCode.horizontalTab:
                case CharCode.verticalTab:
                case CharCode.formFeed:
                case CharCode.space:
                    pos++;
                    continue;
                case CharCode.slash:
                    if (stopAtComments) {
                        break;
                    }
                    if (text.charCodeAt(pos + 1) === CharCode.slash) {
                        pos += 2;
                        while (pos < text.length) {
                            if (isLineBreak(text.charCodeAt(pos))) {
                                break;
                            }
                            pos++;
                        }
                        continue;
                    }
                    if (text.charCodeAt(pos + 1) === CharCode.asterisk) {
                        pos += 2;
                        while (pos < text.length) {
                            if (text.charCodeAt(pos) === CharCode.asterisk && text.charCodeAt(pos + 1) === CharCode.slash) {
                                pos += 2;
                                break;
                            }
                            pos++;
                        }
                        continue;
                    }
                    break;

                case CharCode.lessThan:
                case CharCode.equals:
                case CharCode.greaterThan:
                    if (isConflictMarkerTrivia(text, pos)) {
                        pos = scanConflictMarkerTrivia(text, pos);
                        continue;
                    }
                    break;

                case CharCode.hash:
                    if (pos === 0 && isShebangTrivia(text, pos)) {
                        pos = scanShebangTrivia(text, pos);
                        continue;
                    }
                    break;

                default:
                    if (ch > CharCode.asciiMax && (isWhiteSpace(ch))) {
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

                return ch === CharCode.equals ||
                    text.charCodeAt(pos + mergeConflictMarkerLength) === CharCode.space;
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

        if (ch === CharCode.lessThan || ch === CharCode.greaterThan) {
            while (pos < len && !isLineBreak(text.charCodeAt(pos))) {
                pos++;
            }
        }
        else {
            Debug.assert(ch === CharCode.equals);
            // Consume everything from the start of the mid-conflict marker to the start of the next
            // end-conflict marker.
            while (pos < len) {
                const ch = text.charCodeAt(pos);
                if (ch === CharCode.greaterThan && isConflictMarkerTrivia(text, pos)) {
                    break;
                }

                pos++;
            }
        }

        return pos;
    }

    const shebangTriviaRegex = /^#!.*/;

    function isShebangTrivia(text: string, pos: number) {
        // Shebangs check must only be done at the start of the file
        Debug.assert(pos === 0);
        return shebangTriviaRegex.test(text);
    }

    function scanShebangTrivia(text: string, pos: number) {
        const shebang = shebangTriviaRegex.exec(text)[0];
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
    function getCommentRanges(text: string, pos: number, trailing: boolean): CommentRange[] {
        let result: CommentRange[];
        let collecting = trailing || pos === 0;
        while (pos < text.length) {
            const ch = text.charCodeAt(pos);
            switch (ch) {
                case CharCode.carriageReturn:
                    if (text.charCodeAt(pos + 1) === CharCode.lineFeed) {
                        pos++;
                    }
                case CharCode.lineFeed:
                    pos++;
                    if (trailing) {
                        return result;
                    }
                    collecting = true;
                    if (result && result.length) {
                        lastOrUndefined(result).hasTrailingNewLine = true;
                    }
                    continue;
                case CharCode.horizontalTab:
                case CharCode.verticalTab:
                case CharCode.formFeed:
                case CharCode.space:
                    pos++;
                    continue;
                case CharCode.slash:
                    let nextChar = text.charCodeAt(pos + 1);
                    let hasTrailingNewLine = false;
                    if (nextChar === CharCode.slash || nextChar === CharCode.asterisk) {
                        const kind = nextChar === CharCode.slash ? TokenType.SingleLineCommentTrivia : TokenType.MultiLineCommentTrivia;
                        const startPos = pos;
                        pos += 2;
                        if (nextChar === CharCode.slash) {
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
                                if (text.charCodeAt(pos) === CharCode.asterisk && text.charCodeAt(pos + 1) === CharCode.slash) {
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
                    if (ch > CharCode.asciiMax && (isWhiteSpace(ch))) {
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

    /** Optionally, get the shebang */
    export function getShebang(text: string): string {
        return shebangTriviaRegex.test(text)
            ? shebangTriviaRegex.exec(text)[0]
            : undefined;
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

        let token: TokenType;
        let tokenValue: string;
        let precedingLineBreak: boolean;
        let hasExtendedUnicodeEscape: boolean;
        let tokenIsUnterminated: boolean;

        setText(text, start, length);

        return {
            getStartPos: () => startPos,
            getTextPos: () => pos,
            getToken: () => token,
            getTokenPos: () => tokenPos,
            getTokenText: () => text.substring(tokenPos, pos),
            getTokenValue: () => tokenValue,
            hasExtendedUnicodeEscape: () => hasExtendedUnicodeEscape,
            hasPrecedingLineBreak: () => precedingLineBreak,
            isIdentifier: () => token === TokenType.Identifier || token > TokenType.LastReservedWord,
            isReservedWord: () => token >= TokenType.FirstReservedWord && token <= TokenType.LastReservedWord,
            isUnterminated: () => tokenIsUnterminated,
            reScanGreaterToken,
            reScanSlashToken,
            reScanTemplateToken,
            scanJsxIdentifier,
            reScanJsxToken,
            scanJsxToken,
            scanJSDocToken,
            scan,
            getText,
            setText,
            setScriptTarget,
            setLanguageVariant,
            setOnError,
            setTextPos,
            tryScan,
            lookAhead,
            scanRange,
        };

        function error(message: DiagnosticMessage, length?: number): void {
            if (onError) {
                onError(message, length || 0);
            }
        }

        function scanNumber(): string {
            const start = pos;
            while (isDecimalDigit(text.charCodeAt(pos))) pos++;
            if (text.charCodeAt(pos) === CharCode.dot) {
                pos++;
                while (isDecimalDigit(text.charCodeAt(pos))) pos++;
            }
            let end = pos;
            if (text.charCodeAt(pos) === CharCode.E || text.charCodeAt(pos) === CharCode.e) {
                pos++;
                if (text.charCodeAt(pos) === CharCode.plus || text.charCodeAt(pos) === CharCode.minus) pos++;
                if (isDecimalDigit(text.charCodeAt(pos))) {
                    pos++;
                    while (isDecimalDigit(text.charCodeAt(pos))) pos++;
                    end = pos;
                }
                else {
                    error(Diagnostics.Digit_expected);
                }
            }
            return "" + +(text.substring(start, end));
        }

        function scanOctalDigits(): number {
            const start = pos;
            while (isOctalDigit(text.charCodeAt(pos))) {
                pos++;
            }
            return +(text.substring(start, pos));
        }

        /**
         * Scans the given number of hexadecimal digits in the text,
         * returning -1 if the given number is unavailable.
         */
        function scanExactNumberOfHexDigits(count: number): number {
            return scanHexDigits(/*minCount*/ count, /*scanAsManyAsPossible*/ false);
        }

        /**
         * Scans as many hexadecimal digits as are available in the text,
         * returning -1 if the given number of digits was unavailable.
         */
        function scanMinimumNumberOfHexDigits(count: number): number {
            return scanHexDigits(/*minCount*/ count, /*scanAsManyAsPossible*/ true);
        }

        function scanHexDigits(minCount: number, scanAsManyAsPossible: boolean): number {
            let digits = 0;
            let value = 0;
            while (digits < minCount || scanAsManyAsPossible) {
                const ch = text.charCodeAt(pos);
                if (ch >= CharCode.num0 && ch <= CharCode.9) {
                    value = value * 16 + ch - CharCode.num0;
                }
                else if (ch >= CharCode.A && ch <= CharCode.F) {
                    value = value * 16 + ch - CharCode.A + 10;
                }
                else if (ch >= CharCode.a && ch <= CharCode.f) {
                    value = value * 16 + ch - CharCode.a + 10;
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

        function scanString(): string {
            const quote = text.charCodeAt(pos);
            pos++;
            let result = "";
            let start = pos;
            while (true) {
                if (pos >= end) {
                    result += text.substring(start, pos);
                    tokenIsUnterminated = true;
                    error(Diagnostics.Unterminated_string_literal);
                    break;
                }
                const ch = text.charCodeAt(pos);
                if (ch === quote) {
                    result += text.substring(start, pos);
                    pos++;
                    break;
                }
                if (ch === CharCode.backslash) {
                    result += text.substring(start, pos);
                    result += scanEscapeSequence();
                    start = pos;
                    continue;
                }
                if (isLineBreak(ch)) {
                    result += text.substring(start, pos);
                    tokenIsUnterminated = true;
                    error(Diagnostics.Unterminated_string_literal);
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
        function scanTemplateAndSetTokenValue(): TokenType {
            const startedWithBacktick = text.charCodeAt(pos) === CharCode.backtick;

            pos++;
            let start = pos;
            let contents = "";
            let resultingToken: TokenType;

            while (true) {
                if (pos >= end) {
                    contents += text.substring(start, pos);
                    tokenIsUnterminated = true;
                    error(Diagnostics.Unterminated_template_literal);
                    resultingToken = startedWithBacktick ? TokenType.NoSubstitutionTemplateLiteral : TokenType.TemplateTail;
                    break;
                }

                const currChar = text.charCodeAt(pos);

                // '`'
                if (currChar === CharCode.backtick) {
                    contents += text.substring(start, pos);
                    pos++;
                    resultingToken = startedWithBacktick ? TokenType.NoSubstitutionTemplateLiteral : TokenType.TemplateTail;
                    break;
                }

                // '${'
                if (currChar === CharCode.dollar && pos + 1 < end && text.charCodeAt(pos + 1) === CharCode.openBrace) {
                    contents += text.substring(start, pos);
                    pos += 2;
                    resultingToken = startedWithBacktick ? TokenType.TemplateHead : TokenType.TemplateMiddle;
                    break;
                }

                // Escape character
                if (currChar === CharCode.backslash) {
                    contents += text.substring(start, pos);
                    contents += scanEscapeSequence();
                    start = pos;
                    continue;
                }

                // Speculated ECMAScript 6 Spec 11.8.6.1:
                // <CR><LF> and <CR> LineTerminatorSequences are normalized to <LF> for Template Values
                if (currChar === CharCode.carriageReturn) {
                    contents += text.substring(start, pos);
                    pos++;

                    if (pos < end && text.charCodeAt(pos) === CharCode.lineFeed) {
                        pos++;
                    }

                    contents += "\n";
                    start = pos;
                    continue;
                }

                pos++;
            }

            Debug.assert(resultingToken !== undefined);

            tokenValue = contents;
            return resultingToken;
        }

        function scanEscapeSequence(): string {
            pos++;
            if (pos >= end) {
                error(Diagnostics.Unexpected_end_of_text);
                return "";
            }
            const ch = text.charCodeAt(pos);
            pos++;
            switch (ch) {
                case CharCode.num0:
                    return "\0";
                case CharCode.b:
                    return "\b";
                case CharCode.t:
                    return "\t";
                case CharCode.n:
                    return "\n";
                case CharCode.v:
                    return "\v";
                case CharCode.f:
                    return "\f";
                case CharCode.r:
                    return "\r";
                case CharCode.singleQuote:
                    return "\'";
                case CharCode.doubleQuote:
                    return "\"";
                case CharCode.u:
                    // '\u{DDDDDDDD}'
                    if (pos < end && text.charCodeAt(pos) === CharCode.openBrace) {
                        hasExtendedUnicodeEscape = true;
                        pos++;
                        return scanExtendedUnicodeEscape();
                    }

                    // '\uDDDD'
                    return scanHexadecimalEscape(/*numDigits*/ 4);

                case CharCode.x:
                    // '\xDD'
                    return scanHexadecimalEscape(/*numDigits*/ 2);

                // when encountering a LineContinuation (i.e. a backslash and a line terminator sequence),
                // the line terminator is interpreted to be "the empty code unit sequence".
                case CharCode.carriageReturn:
                    if (pos < end && text.charCodeAt(pos) === CharCode.lineFeed) {
                        pos++;
                    }
                // fall through
                case CharCode.lineFeed:
                case CharCode.lineSeparator:
                case CharCode.paragraphSeparator:
                    return "";
                default:
                    return String.fromCharCode(ch);
            }
        }

        function scanHexadecimalEscape(numDigits: number): string {
            const escapedValue = scanExactNumberOfHexDigits(numDigits);

            if (escapedValue >= 0) {
                return String.fromCharCode(escapedValue);
            }
            else {
                error(Diagnostics.Hexadecimal_digit_expected);
                return "";
            }
        }

        function scanExtendedUnicodeEscape(): string {
            const escapedValue = scanMinimumNumberOfHexDigits(1);
            let isInvalidExtendedEscape = false;

            // Validate the value of the digit
            if (escapedValue < 0) {
                error(Diagnostics.Hexadecimal_digit_expected);
                isInvalidExtendedEscape = true;
            }
            else if (escapedValue > 0x10FFFF) {
                error(Diagnostics.An_extended_Unicode_escape_value_must_be_between_0x0_and_0x10FFFF_inclusive);
                isInvalidExtendedEscape = true;
            }

            if (pos >= end) {
                error(Diagnostics.Unexpected_end_of_text);
                isInvalidExtendedEscape = true;
            }
            else if (text.charCodeAt(pos) === CharCode.closeBrace) {
                // Only swallow the following character up if it's a '}'.
                pos++;
            }
            else {
                error(Diagnostics.Unterminated_Unicode_escape_sequence);
                isInvalidExtendedEscape = true;
            }

            if (isInvalidExtendedEscape) {
                return "";
            }

            return utf16EncodeAsString(escapedValue);
        }

        // Derived from the 10.1.1 UTF16Encoding of the ES6 Spec.
        function utf16EncodeAsString(codePoint: number): string {
            Debug.assert(0x0 <= codePoint && codePoint <= 0x10FFFF);

            if (codePoint <= 65535) {
                return String.fromCharCode(codePoint);
            }

            const codeUnit1 = Math.floor((codePoint - 65536) / 1024) + 0xD800;
            const codeUnit2 = ((codePoint - 65536) % 1024) + 0xDC00;

            return String.fromCharCode(codeUnit1, codeUnit2);
        }

        // Current character is known to be a backslash. Check for Unicode escape of the form '\uXXXX'
        // and return code point value if valid Unicode escape is found. Otherwise return -1.
        function peekUnicodeEscape(): number {
            if (pos + 5 < end && text.charCodeAt(pos + 1) === CharCode.u) {
                const start = pos;
                pos += 2;
                const value = scanExactNumberOfHexDigits(4);
                pos = start;
                return value;
            }
            return -1;
        }

        function scanIdentifierParts(): string {
            let result = "";
            let start = pos;
            while (pos < end) {
                let ch = text.charCodeAt(pos);
                if (isIdentifierPart(ch, languageVersion)) {
                    pos++;
                }
                else if (ch === CharCode.backslash) {
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

        function getIdentifierToken(): TokenType {
            // Reserved words are between 2 and 11 characters long and start with a lowercase letter
            const len = tokenValue.length;
            if (len >= 2 && len <= 11) {
                const ch = tokenValue.charCodeAt(0);
                if (ch >= CharCode.a && ch <= CharCode.z && hasOwnProperty.call(textToToken, tokenValue)) {
                    return token = textToToken[tokenValue];
                }
            }
            return token = TokenType.Identifier;
        }

        function scanBinaryOrOctalDigits(base: number): number {
            Debug.assert(base !== 2 || base !== 8, "Expected either base 2 or base 8");

            let value = 0;
            // For counting number of digits; Valid binaryIntegerLiteral must have at least one binary digit following B or b.
            // Similarly valid octalIntegerLiteral must have at least one octal digit following o or O.
            let numberOfDigits = 0;
            while (true) {
                const ch = text.charCodeAt(pos);
                const valueOfCh = ch - CharCode.num0;
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

        function scan(): TokenType {
            startPos = pos;
            hasExtendedUnicodeEscape = false;
            precedingLineBreak = false;
            tokenIsUnterminated = false;
            while (true) {
                tokenPos = pos;
                if (pos >= end) {
                    return token = TokenType.endOfFile;
                }
                let ch = text.charCodeAt(pos);

                // Special handling for shebang
                if (ch === CharCode.hash && pos === 0 && isShebangTrivia(text, pos)) {
                    pos = scanShebangTrivia(text, pos);
                    if (skipTrivia) {
                        continue;
                    }
                    else {
                        return token = TokenType.ShebangTrivia;
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
                            return token = TokenType.NewLineTrivia;
                        }
                    case CharCode.horizontalTab:
                    case CharCode.verticalTab:
                    case CharCode.formFeed:
                    case CharCode.space:
                        if (skipTrivia) {
                            pos++;
                            continue;
                        }
                        else {
                            while (pos < end && isNoBreakWhiteSpace(text.charCodeAt(pos))) {
                                pos++;
                            }
                            return token = TokenType.WhitespaceTrivia;
                        }
                    case CharCode.exclamation:
                        if (text.charCodeAt(pos + 1) === CharCode.equals) {
                            if (text.charCodeAt(pos + 2) === CharCode.equals) {
                                return pos += 3, token = TokenType.ExclamationEqualsEqualsToken;
                            }
                            return pos += 2, token = TokenType.ExclamationEqualsToken;
                        }
                        pos++;
                        return token = TokenType.ExclamationToken;
                    case CharCode.doubleQuote:
                    case CharCode.singleQuote:
                        tokenValue = scanString();
                        return token = TokenType.StringLiteral;
                    case CharCode.backtick:
                        return token = scanTemplateAndSetTokenValue();
                    case CharCode.percent:
                        if (text.charCodeAt(pos + 1) === CharCode.equals) {
                            return pos += 2, token = TokenType.PercentEqualsToken;
                        }
                        pos++;
                        return token = TokenType.PercentToken;
                    case CharCode.ampersand:
                        if (text.charCodeAt(pos + 1) === CharCode.ampersand) {
                            return pos += 2, token = TokenType.AmpersandAmpersandToken;
                        }
                        if (text.charCodeAt(pos + 1) === CharCode.equals) {
                            return pos += 2, token = TokenType.AmpersandEqualsToken;
                        }
                        pos++;
                        return token = TokenType.AmpersandToken;
                    case CharCode.openParen:
                        pos++;
                        return token = TokenType.OpenParenToken;
                    case CharCode.closeParen:
                        pos++;
                        return token = TokenType.CloseParenToken;
                    case CharCode.asterisk:
                        if (text.charCodeAt(pos + 1) === CharCode.equals) {
                            return pos += 2, token = TokenType.AsteriskEqualsToken;
                        }
                        if (text.charCodeAt(pos + 1) === CharCode.asterisk) {
                            if (text.charCodeAt(pos + 2) === CharCode.equals) {
                                return pos += 3, token = TokenType.AsteriskAsteriskEqualsToken;
                            }
                            return pos += 2, token = TokenType.AsteriskAsteriskToken;
                        }
                        pos++;
                        return token = TokenType.AsteriskToken;
                    case CharCode.plus:
                        if (text.charCodeAt(pos + 1) === CharCode.plus) {
                            return pos += 2, token = TokenType.PlusPlusToken;
                        }
                        if (text.charCodeAt(pos + 1) === CharCode.equals) {
                            return pos += 2, token = TokenType.PlusEqualsToken;
                        }
                        pos++;
                        return token = TokenType.PlusToken;
                    case CharCode.comma:
                        pos++;
                        return token = TokenType.CommaToken;
                    case CharCode.minus:
                        if (text.charCodeAt(pos + 1) === CharCode.minus) {
                            return pos += 2, token = TokenType.MinusMinusToken;
                        }
                        if (text.charCodeAt(pos + 1) === CharCode.equals) {
                            return pos += 2, token = TokenType.MinusEqualsToken;
                        }
                        pos++;
                        return token = TokenType.MinusToken;
                    case CharCode.dot:
                        if (isDecimalDigit(text.charCodeAt(pos + 1))) {
                            tokenValue = scanNumber();
                            return token = TokenType.NumericLiteral;
                        }
                        if (text.charCodeAt(pos + 1) === CharCode.dot && text.charCodeAt(pos + 2) === CharCode.dot) {
                            return pos += 3, token = TokenType.DotDotDotToken;
                        }
                        pos++;
                        return token = TokenType.DotToken;
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
                                return token = TokenType.SingleLineCommentTrivia;
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
                                return token = TokenType.MultiLineCommentTrivia;
                            }
                        }

                        if (text.charCodeAt(pos + 1) === CharCode.equals) {
                            return pos += 2, token = TokenType.SlashEqualsToken;
                        }

                        pos++;
                        return token = TokenType.SlashToken;

                    case CharCode.num0:
                        if (pos + 2 < end && (text.charCodeAt(pos + 1) === CharCode.X || text.charCodeAt(pos + 1) === CharCode.x)) {
                            pos += 2;
                            let value = scanMinimumNumberOfHexDigits(1);
                            if (value < 0) {
                                error(Diagnostics.Hexadecimal_digit_expected);
                                value = 0;
                            }
                            tokenValue = "" + value;
                            return token = TokenType.NumericLiteral;
                        }
                        else if (pos + 2 < end && (text.charCodeAt(pos + 1) === CharCode.B || text.charCodeAt(pos + 1) === CharCode.b)) {
                            pos += 2;
                            let value = scanBinaryOrOctalDigits(/* base */ 2);
                            if (value < 0) {
                                error(Diagnostics.Binary_digit_expected);
                                value = 0;
                            }
                            tokenValue = "" + value;
                            return token = TokenType.NumericLiteral;
                        }
                        else if (pos + 2 < end && (text.charCodeAt(pos + 1) === CharCode.O || text.charCodeAt(pos + 1) === CharCode.o)) {
                            pos += 2;
                            let value = scanBinaryOrOctalDigits(/* base */ 8);
                            if (value < 0) {
                                error(Diagnostics.Octal_digit_expected);
                                value = 0;
                            }
                            tokenValue = "" + value;
                            return token = TokenType.NumericLiteral;
                        }
                        // Try to parse as an octal
                        if (pos + 1 < end && isOctalDigit(text.charCodeAt(pos + 1))) {
                            tokenValue = "" + scanOctalDigits();
                            return token = TokenType.NumericLiteral;
                        }
                    // This fall-through is a deviation from the EcmaScript grammar. The grammar says that a leading zero
                    // can only be followed by an octal digit, a dot, or the end of the number literal. However, we are being
                    // permissive and allowing decimal digits of the form 08* and 09* (which many browsers also do).
                    case CharCode.1:
                    case CharCode.2:
                    case CharCode.3:
                    case CharCode.4:
                    case CharCode.num5:
                    case CharCode.6:
                    case CharCode.num7:
                    case CharCode.8:
                    case CharCode.9:
                        tokenValue = scanNumber();
                        return token = TokenType.NumericLiteral;
                    case CharCode.colon:
                        pos++;
                        return token = TokenType.ColonToken;
                    case CharCode.semicolon:
                        pos++;
                        return token = TokenType.SemicolonToken;
                    case CharCode.lessThan:
                        if (isConflictMarkerTrivia(text, pos)) {
                            pos = scanConflictMarkerTrivia(text, pos, error);
                            if (skipTrivia) {
                                continue;
                            }
                            else {
                                return token = TokenType.ConflictMarkerTrivia;
                            }
                        }

                        if (text.charCodeAt(pos + 1) === CharCode.lessThan) {
                            if (text.charCodeAt(pos + 2) === CharCode.equals) {
                                return pos += 3, token = TokenType.LessThanLessThanEqualsToken;
                            }
                            return pos += 2, token = TokenType.LessThanLessThanToken;
                        }
                        if (text.charCodeAt(pos + 1) === CharCode.equals) {
                            return pos += 2, token = TokenType.LessThanEqualsToken;
                        }
                        if (languageVariant === LanguageVariant.JSX &&
                            text.charCodeAt(pos + 1) === CharCode.slash &&
                            text.charCodeAt(pos + 2) !== CharCode.asterisk) {
                            return pos += 2, token = TokenType.LessThanSlashToken;
                        }
                        pos++;
                        return token = TokenType.LessThanToken;
                    case CharCode.equals:
                        if (isConflictMarkerTrivia(text, pos)) {
                            pos = scanConflictMarkerTrivia(text, pos, error);
                            if (skipTrivia) {
                                continue;
                            }
                            else {
                                return token = TokenType.ConflictMarkerTrivia;
                            }
                        }

                        if (text.charCodeAt(pos + 1) === CharCode.equals) {
                            if (text.charCodeAt(pos + 2) === CharCode.equals) {
                                return pos += 3, token = TokenType.EqualsEqualsEqualsToken;
                            }
                            return pos += 2, token = TokenType.EqualsEqualsToken;
                        }
                        if (text.charCodeAt(pos + 1) === CharCode.greaterThan) {
                            return pos += 2, token = TokenType.EqualsGreaterThanToken;
                        }
                        pos++;
                        return token = TokenType.EqualsToken;
                    case CharCode.greaterThan:
                        if (isConflictMarkerTrivia(text, pos)) {
                            pos = scanConflictMarkerTrivia(text, pos, error);
                            if (skipTrivia) {
                                continue;
                            }
                            else {
                                return token = TokenType.ConflictMarkerTrivia;
                            }
                        }

                        pos++;
                        return token = TokenType.GreaterThanToken;
                    case CharCode.question:
                        pos++;
                        return token = TokenType.QuestionToken;
                    case CharCode.openBracket:
                        pos++;
                        return token = TokenType.OpenBracketToken;
                    case CharCode.closeBracket:
                        pos++;
                        return token = TokenType.CloseBracketToken;
                    case CharCode.caret:
                        if (text.charCodeAt(pos + 1) === CharCode.equals) {
                            return pos += 2, token = TokenType.CaretEqualsToken;
                        }
                        pos++;
                        return token = TokenType.CaretToken;
                    case CharCode.openBrace:
                        pos++;
                        return token = TokenType.OpenBraceToken;
                    case CharCode.bar:
                        if (text.charCodeAt(pos + 1) === CharCode.bar) {
                            return pos += 2, token = TokenType.BarBarToken;
                        }
                        if (text.charCodeAt(pos + 1) === CharCode.equals) {
                            return pos += 2, token = TokenType.BarEqualsToken;
                        }
                        pos++;
                        return token = TokenType.BarToken;
                    case CharCode.closeBrace:
                        pos++;
                        return token = TokenType.CloseBraceToken;
                    case CharCode.tilde:
                        pos++;
                        return token = TokenType.TildeToken;
                    case CharCode.at:
                        pos++;
                        return token = TokenType.AtToken;
                    case CharCode.backslash:
                        let cookedChar = peekUnicodeEscape();
                        if (cookedChar >= 0 && isIdentifierStart(cookedChar, languageVersion)) {
                            pos += 6;
                            tokenValue = String.fromCharCode(cookedChar) + scanIdentifierParts();
                            return token = getIdentifierToken();
                        }
                        error(Diagnostics.Invalid_character);
                        pos++;
                        return token = TokenType.unknown;
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
                        else if (isNoBreakWhiteSpace(ch)) {
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
                        return token = TokenType.unknown;
                }
            }
        }

        function reScanGreaterToken(): TokenType {
            if (token === TokenType.GreaterThanToken) {
                if (text.charCodeAt(pos) === CharCode.greaterThan) {
                    if (text.charCodeAt(pos + 1) === CharCode.greaterThan) {
                        if (text.charCodeAt(pos + 2) === CharCode.equals) {
                            return pos += 3, token = TokenType.GreaterThanGreaterThanGreaterThanEqualsToken;
                        }
                        return pos += 2, token = TokenType.GreaterThanGreaterThanGreaterThanToken;
                    }
                    if (text.charCodeAt(pos + 1) === CharCode.equals) {
                        return pos += 2, token = TokenType.GreaterThanGreaterThanEqualsToken;
                    }
                    pos++;
                    return token = TokenType.GreaterThanGreaterThanToken;
                }
                if (text.charCodeAt(pos) === CharCode.equals) {
                    pos++;
                    return token = TokenType.GreaterThanEqualsToken;
                }
            }
            return token;
        }

        function reScanSlashToken(): TokenType {
            if (token === TokenType.SlashToken || token === TokenType.SlashEqualsToken) {
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
                    else if (ch === CharCode.slash && !inCharacterClass) {
                        // A slash within a character class is permissible,
                        // but in general it signals the end of the regexp literal.
                        p++;
                        break;
                    }
                    else if (ch === CharCode.openBracket) {
                        inCharacterClass = true;
                    }
                    else if (ch === CharCode.backslash) {
                        inEscape = true;
                    }
                    else if (ch === CharCode.closeBracket) {
                        inCharacterClass = false;
                    }
                    p++;
                }

                while (p < end && isIdentifierPart(text.charCodeAt(p), languageVersion)) {
                    p++;
                }
                pos = p;
                tokenValue = text.substring(tokenPos, pos);
                token = TokenType.RegularExpressionLiteral;
            }
            return token;
        }

        /**
         * Unconditionally back up and scan a template expression portion.
         */
        function reScanTemplateToken(): TokenType {
            Debug.assert(token === TokenType.CloseBraceToken, "'reScanTemplateToken' should only be called on a '}'");
            pos = tokenPos;
            return token = scanTemplateAndSetTokenValue();
        }

        function reScanJsxToken(): TokenType {
            pos = tokenPos = startPos;
            return token = scanJsxToken();
        }

        function scanJsxToken(): TokenType {
            startPos = tokenPos = pos;

            if (pos >= end) {
                return token = TokenType.endOfFile;
            }

            let char = text.charCodeAt(pos);
            if (char === CharCode.lessThan) {
                if (text.charCodeAt(pos + 1) === CharCode.slash) {
                    pos += 2;
                    return token = TokenType.LessThanSlashToken;
                }
                pos++;
                return token = TokenType.LessThanToken;
            }

            if (char === CharCode.openBrace) {
                pos++;
                return token = TokenType.OpenBraceToken;
            }

            while (pos < end) {
                pos++;
                char = text.charCodeAt(pos);
                if ((char === CharCode.openBrace) || (char === CharCode.lessThan)) {
                    break;
                }
            }
            return token = TokenType.JsxText;
        }

        // Scans a JSX identifier; these differ from normal identifiers in that
        // they allow dashes
        function scanJsxIdentifier(): TokenType {
            if (tokenIsIdentifierOrKeyword(token)) {
                const firstCharPosition = pos;
                while (pos < end) {
                    const ch = text.charCodeAt(pos);
                    if (ch === CharCode.minus || ((firstCharPosition === pos) ? isIdentifierStart(ch, languageVersion) : isIdentifierPart(ch, languageVersion))) {
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

        function scanJSDocToken(): TokenType {
            if (pos >= end) {
                return token = TokenType.endOfFile;
            }

            startPos = pos;

            // Eat leading whitespace
            let ch = text.charCodeAt(pos);
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
                case CharCode.at:
                    return pos += 1, token = TokenType.AtToken;
                case CharCode.lineFeed:
                case CharCode.carriageReturn:
                    return pos += 1, token = TokenType.NewLineTrivia;
                case CharCode.asterisk:
                    return pos += 1, token = TokenType.AsteriskToken;
                case CharCode.openBrace:
                    return pos += 1, token = TokenType.OpenBraceToken;
                case CharCode.closeBrace:
                    return pos += 1, token = TokenType.CloseBraceToken;
                case CharCode.openBracket:
                    return pos += 1, token = TokenType.OpenBracketToken;
                case CharCode.closeBracket:
                    return pos += 1, token = TokenType.CloseBracketToken;
                case CharCode.equals:
                    return pos += 1, token = TokenType.EqualsToken;
                case CharCode.comma:
                    return pos += 1, token = TokenType.CommaToken;
            }

            if (isIdentifierStart(ch, ScriptTarget.Latest)) {
                pos++;
                while (isIdentifierPart(text.charCodeAt(pos), ScriptTarget.Latest) && pos < end) {
                    pos++;
                }
                return token = TokenType.Identifier;
            }
            else {
                return pos += 1, token = TokenType.unknown;
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

        function getText(): string {
            return text;
        }

        function setText(newText: string, start: number, length: number) {
            text = newText || "";
            end = length === undefined ? text.length : start + length;
            setTextPos(start || 0);
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
            token = TokenType.unknown;
            precedingLineBreak = false;

            tokenValue = undefined;
            hasExtendedUnicodeEscape = false;
            tokenIsUnterminated = false;
        }
    }
}
