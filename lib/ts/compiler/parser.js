/// <reference path="utilities.ts"/>
/// <reference path="scanner.ts"/>
var ts;
(function (ts) {
    /* @internal */ ts.parseTime = 0;
    var NodeConstructor;
    var SourceFileConstructor;
    // Produces a new SourceFile for the 'newText' provided. The 'textChangeRange' parameter
    // indicates what changed between the 'text' that this SourceFile has and the 'newText'.
    // The SourceFile will be created with the compiler attempting to reuse as many nodes from
    // this file as possible.
    //
    // Note: this function mutates nodes from this SourceFile. That means any existing nodes
    // from this SourceFile that are being held onto may change as a result (including
    // becoming detached from any SourceFile).  It is recommended that this SourceFile not
    // be used once 'update' is called on it.
    function updateSourceFile(sourceFile, newText, textChangeRange, aggressiveChecks) {
        return IncrementalParser.updateSourceFile(sourceFile, newText, textChangeRange, aggressiveChecks);
    }
    ts.updateSourceFile = updateSourceFile;
    /* @internal */
    function parseIsolatedJSDocComment(content, start, length) {
        var result = Parser.JSDocParser.parseIsolatedJSDocComment(content, start, length);
        if (result && result.jsDocComment) {
            // because the jsDocComment was parsed out of the source file, it might
            // not be covered by the fixupParentReferences.
            Parser.fixupParentReferences(result.jsDocComment);
        }
        return result;
    }
    ts.parseIsolatedJSDocComment = parseIsolatedJSDocComment;
    /* @internal */
    // Exposed only for testing.
    function parseJSDocTypeExpressionForTests(content, start, length) {
        return Parser.JSDocParser.parseJSDocTypeExpressionForTests(content, start, length);
    }
    ts.parseJSDocTypeExpressionForTests = parseJSDocTypeExpressionForTests;
    var Nodes;
    (function (Nodes) {
    })(Nodes || (Nodes = {}));
    ParsingContext;
    {
        Nodes.SourceElements,
            Nodes.BlockStatements,
            Nodes.SwitchClauses,
            Nodes.SwitchClauseStatements,
            Nodes.TypeMembers,
            Nodes.ClassMembers,
            Nodes.EnumMembers,
            Nodes.HeritageClauseElement,
            Nodes.VariableDeclarations,
            Nodes.ObjectBindingElements,
            Nodes.ArrayBindingElements,
            Nodes.ArgumentExpressions,
            Nodes.ObjectLiteralMembers,
            Nodes.JsxAttributes,
            Nodes.JsxChildren,
            Nodes.ArrayLiteralMembers,
            Nodes.Parameters,
            Nodes.TypeParameters,
            Nodes.TypeArguments,
            Nodes.TupleElementTypes,
            Nodes.HeritageClauses,
            Nodes.ImportOrExportSpecifiers,
            Nodes.JSDocFunctionParameters,
            Nodes.JSDocTypeArguments,
            Nodes.JSDocRecordMembers,
            Nodes.JSDocTupleTypes,
            Nodes.Count; // Nodes.Number of parsing contexts
    }
    var Nodes;
    (function (Nodes) {
    })(Nodes || (Nodes = {}));
    Tristate;
    {
        Nodes.False,
            Nodes.True,
            Nodes.Unknown;
    }
    var Nodes;
    (function (Nodes) {
        var JSDocParser;
        (function (JSDocParser) {
            function isJSDocType() {
                switch (this.token) {
                    case 56 /* asterisk */:
                    case 91 /* question */:
                    case 42 /* openParen */:
                    case 43 /* openBracket */:
                    case 32 /* exclamation */:
                    case 31 /* openBrace */:
                    case 18 /* function */:
                    case 51 /* dotDotDot */:
                    case 33 /* new */:
                    case 29 /* this */:
                        return true;
                }
                return ts.tokenIsIdentifierOrKeyword(this.token);
            }
            JSDocParser.isJSDocType = isJSDocType;
            function parseJSDocTypeExpressionForTests(content, start, length) {
                this.initializeState("file.js", content, Nodes.ScriptTarget.Latest, /*_syntaxCursor:*/ undefined, Nodes.ScriptKind.JS);
                this.scanner.setText(content, start, length);
                this.token = this.scanner.scan();
                var jsDocTypeExpression = parseJSDocTypeExpression();
                var diagnostics = this.parseDiagnostics;
                this.clearState();
                return jsDocTypeExpression ? { jsDocTypeExpression: jsDocTypeExpression, diagnostics: diagnostics } : undefined;
            }
            JSDocParser.parseJSDocTypeExpressionForTests = parseJSDocTypeExpressionForTests;
            // Nodes.Parses out a Nodes.JSDoc type expression.
            /* @internal */
            function parseJSDocTypeExpression() {
                var ;
                this.result = this.createNode(403 /* JSDocTypeExpression */, this.scanner.getTokenPos());
                this.parseExpected(31 /* openBrace */);
                this.result.type = parseJSDocTopLevelType();
                this.parseExpected(98 /* closeBrace */);
                fixupParentReferences(this.result);
                return this.finishNode(this.result);
            }
            JSDocParser.parseJSDocTypeExpression = parseJSDocTypeExpression;
            function parseJSDocTopLevelType() {
                var type = parseJSDocType();
                if (this.token === 71 /* bar */) {
                    var unionType = this.createNode(407 /* JSDocUnionType */, type.pos);
                    unionType.types = parseJSDocTypeList(type);
                    type = this.finishNode(unionType);
                }
                if (this.token === 77 /* equals */) {
                    var optionalType = this.createNode(414 /* JSDocOptionalType */, type.pos);
                    this.nextToken();
                    optionalType.type = type;
                    type = this.finishNode(optionalType);
                }
                return type;
            }
            function parseJSDocType() {
                var type = parseBasicTypeExpression();
                while (true) {
                    if (this.token === 43 /* openBracket */) {
                        var arrayType = this.createNode(406 /* JSDocArrayType */, type.pos);
                        arrayType.elementType = type;
                        this.nextToken();
                        this.parseExpected(97 /* closeBracket */);
                        type = this.finishNode(arrayType);
                    }
                    else if (this.token === 91 /* question */) {
                        var nullableType = this.createNode(409 /* JSDocNullableType */, type.pos);
                        nullableType.type = type;
                        this.nextToken();
                        type = this.finishNode(nullableType);
                    }
                    else if (this.token === 32 /* exclamation */) {
                        var nonNullableType = this.createNode(410 /* JSDocNonNullableType */, type.pos);
                        nonNullableType.type = type;
                        this.nextToken();
                        type = this.finishNode(nonNullableType);
                    }
                    else {
                        break;
                    }
                }
                return type;
            }
            function parseBasicTypeExpression() {
                switch (this.token) {
                    case 56 /* asterisk */:
                        return parseJSDocAllType();
                    case 91 /* question */:
                        return parseJSDocUnknownOrNullableType();
                    case 42 /* openParen */:
                        return parseJSDocUnionType();
                    case 43 /* openBracket */:
                        return parseJSDocTupleType();
                    case 32 /* exclamation */:
                        return parseJSDocNonNullableType();
                    case 31 /* openBrace */:
                        return parseJSDocRecordType();
                    case 18 /* function */:
                        return parseJSDocFunctionType();
                    case 51 /* dotDotDot */:
                        return parseJSDocVariadicType();
                    case 33 /* new */:
                        return parseJSDocConstructorType();
                    case 29 /* this */:
                        return parseJSDocThisType();
                    case 141 /* any */:
                    case 144 /* string */:
                    case 143 /* number */:
                    case 142 /* boolean */:
                    case 145 /* symbol */:
                    case 36 /* void */:
                        return this.parseTokenNode();
                }
                // Nodes.TODO (drosen): Nodes.Parse string literal types in Nodes.JSDoc as well.
                return parseJSDocTypeReference();
            }
            function parseJSDocThisType() {
                var ;
                this.result = this.createNode(418 /* JSDocThisType */);
                this.nextToken();
                this.parseExpected(99 /* colon */);
                this.result.type = parseJSDocType();
                return this.finishNode(this.result);
            }
            function parseJSDocConstructorType() {
                var ;
                this.result = this.createNode(417 /* JSDocConstructorType */);
                this.nextToken();
                this.parseExpected(99 /* colon */);
                this.result.type = parseJSDocType();
                return this.finishNode(this.result);
            }
            function parseJSDocVariadicType() {
                var ;
                this.result = this.createNode(416 /* JSDocVariadicType */);
                this.nextToken();
                this.result.type = parseJSDocType();
                return this.finishNode(this.result);
            }
            function parseJSDocFunctionType() {
                var ;
                this.result = this.createNode(415 /* JSDocFunctionType */);
                this.nextToken();
                this.parseExpected(42 /* openParen */);
                this.result.parameters = this.parseDelimitedList(Nodes.ParsingContext.JSDocFunctionParameters, parseJSDocParameter);
                checkForTrailingComma(this.result.parameters);
                this.parseExpected(96 /* closeParen */);
                if (this.token === 99 /* colon */) {
                    this.nextToken();
                    this.result.type = parseJSDocType();
                }
                return this.finishNode(this.result);
            }
            function parseJSDocParameter() {
                var parameter = this.createNode(288 /* Parameter */);
                parameter.type = parseJSDocType();
                if (this.parseOptional(77 /* equals */)) {
                    parameter.questionToken = this.createNode(77 /* equals */);
                }
                return this.finishNode(parameter);
            }
            function parseJSDocTypeReference() {
                var ;
                this.result = this.createNode(413 /* JSDocTypeReference */);
                this.result.name = this.parseSimplePropertyName();
                if (this.token === 49 /* lessThan */) {
                    this.result.typeArguments = parseTypeArguments();
                }
                else {
                    while (this.parseOptional(53 /* dot */)) {
                        if (this.token === 49 /* lessThan */) {
                            this.result.typeArguments = parseTypeArguments();
                            break;
                        }
                        else {
                            this.result.name = parseQualifiedName(this.result.name);
                        }
                    }
                }
                return this.finishNode(this.result);
            }
            function parseTypeArguments() {
                // Nodes.Move past the <
                this.nextToken();
                var typeArguments = this.parseDelimitedList(Nodes.ParsingContext.JSDocTypeArguments, parseJSDocType);
                checkForTrailingComma(typeArguments);
                checkForEmptyTypeArgumentList(typeArguments);
                this.parseExpected(61 /* greaterThan */);
                return typeArguments;
            }
            function checkForEmptyTypeArgumentList(typeArguments) {
                if (this.parseDiagnostics.length === 0 && typeArguments && typeArguments.length === 0) {
                    var start = typeArguments.pos - "<".length;
                    var end = ts.skipTrivia(this.sourceText, typeArguments.end) + ">".length;
                    return this.parseErrorAtPosition(start, end - start, Nodes.Diagnostics.Type_argument_list_cannot_be_empty);
                }
            }
            function parseQualifiedName(left) {
                var ;
                this.result = this.createNode(285 /* QualifiedName */, left.pos);
                this.result.left = left;
                this.result.right = this.parseIdentifierName();
                return this.finishNode(this.result);
            }
            function parseJSDocRecordType() {
                var ;
                this.result = this.createNode(411 /* JSDocRecordType */);
                this.nextToken();
                this.result.members = this.parseDelimitedList(Nodes.ParsingContext.JSDocRecordMembers, parseJSDocRecordMember);
                checkForTrailingComma(this.result.members);
                this.parseExpected(98 /* closeBrace */);
                return this.finishNode(this.result);
            }
            function parseJSDocRecordMember() {
                var ;
                this.result = this.createNode(412 /* JSDocRecordMember */);
                this.result.name = this.parseSimplePropertyName();
                if (this.token === 99 /* colon */) {
                    this.nextToken();
                    this.result.type = parseJSDocType();
                }
                return this.finishNode(this.result);
            }
            function parseJSDocNonNullableType() {
                var ;
                this.result = this.createNode(410 /* JSDocNonNullableType */);
                this.nextToken();
                this.result.type = parseJSDocType();
                return this.finishNode(this.result);
            }
            function parseJSDocTupleType() {
                var ;
                this.result = this.createNode(408 /* JSDocTupleType */);
                this.nextToken();
                this.result.types = this.parseDelimitedList(Nodes.ParsingContext.JSDocTupleTypes, parseJSDocType);
                checkForTrailingComma(this.result.types);
                this.parseExpected(97 /* closeBracket */);
                return this.finishNode(this.result);
            }
            function checkForTrailingComma(list) {
                if (this.parseDiagnostics.length === 0 && list.hasTrailingComma) {
                    var start = list.end - ",".length;
                    this.parseErrorAtPosition(start, ",".length, Nodes.Diagnostics.Trailing_comma_not_allowed);
                }
            }
            function parseJSDocUnionType() {
                var ;
                this.result = this.createNode(407 /* JSDocUnionType */);
                this.nextToken();
                this.result.types = parseJSDocTypeList(parseJSDocType());
                this.parseExpected(96 /* closeParen */);
                return this.finishNode(this.result);
            }
            function parseJSDocTypeList(firstType) {
                console.assert(!!firstType);
                var types = [];
                types.pos = firstType.pos;
                types.push(firstType);
                while (this.parseOptional(71 /* bar */)) {
                    types.push(parseJSDocType());
                }
                types.end = this.scanner.getStartPos();
                return types;
            }
            function parseJSDocAllType() {
                var ;
                this.result = this.createNode(404 /* JSDocAllType */);
                this.nextToken();
                return this.finishNode(this.result);
            }
            function parseJSDocUnknownOrNullableType() {
                var pos = this.scanner.getStartPos();
                // skip the ?
                this.nextToken();
                // Nodes.Need to lookahead to decide if this is a nullable or unknown type.
                // Nodes.Here are cases where we'll pick the unknown type:
                //
                //      Nodes.Foo(?,
                //      { a: ? }
                //      Nodes.Foo(?)
                //      Nodes.Foo<?>
                //      Nodes.Foo(?=
                //      (?|
                if (this.token === 92 /* comma */ ||
                    this.token === 98 /* closeBrace */ ||
                    this.token === 96 /* closeParen */ ||
                    this.token === 61 /* greaterThan */ ||
                    this.token === 77 /* equals */ ||
                    this.token === 71 /* bar */) {
                    var ;
                    this.result = this.createNode(405 /* JSDocUnknownType */, pos);
                    return this.finishNode(this.result);
                }
                else {
                    var ;
                    this.result = this.createNode(409 /* JSDocNullableType */, pos);
                    this.result.type = parseJSDocType();
                    return this.finishNode(this.result);
                }
            }
            function parseIsolatedJSDocComment(content, start, length) {
                this.initializeState("file.js", content, Nodes.ScriptTarget.Latest, /*_syntaxCursor:*/ undefined, Nodes.ScriptKind.JS);
                this.sourceFile = { languageVariant: Nodes.LanguageVariant.Standard, text: content };
                var jsDocComment = parseJSDocCommentWorker(start, length);
                var diagnostics = this.parseDiagnostics;
                this.clearState();
                return jsDocComment ? { jsDocComment: jsDocComment, diagnostics: diagnostics } : undefined;
            }
            JSDocParser.parseIsolatedJSDocComment = parseIsolatedJSDocComment;
            function parseJSDocComment(parent, start, length) {
                var saveToken = this.token;
                var saveParseDiagnosticsLength = this.parseDiagnostics.length;
                var saveParseErrorBeforeNextFinishedNode = this.parseErrorBeforeNextFinishedNode;
                var comment = parseJSDocCommentWorker(start, length);
                if (comment) {
                    comment.parent = parent;
                }
                this.token = saveToken;
                this.parseDiagnostics.length = saveParseDiagnosticsLength;
                this.parseErrorBeforeNextFinishedNode = saveParseErrorBeforeNextFinishedNode;
                return comment;
            }
            JSDocParser.parseJSDocComment = parseJSDocComment;
            function parseJSDocCommentWorker(start, length) {
                var _this = this;
                var content = this.sourceText;
                start = start || 0;
                var end = length === undefined ? content.length : start + length;
                length = end - start;
                console.assert(start >= 0);
                console.assert(start <= end);
                console.assert(end <= content.length);
                var tags;
                let;
                this.result;
                Nodes.JSDocComment;
                // Nodes.Check for /** (Nodes.JSDoc opening part)
                if (content.charCodeAt(start) === Nodes.CharCode.slash &&
                    content.charCodeAt(start + 1) === Nodes.CharCode.asterisk &&
                    content.charCodeAt(start + 2) === Nodes.CharCode.asterisk &&
                    content.charCodeAt(start + 3) !== Nodes.CharCode.asterisk) {
                    // + 3 for leading /**, - 5 in total for /** */
                    this.scanner.scanRange(start + 3, length - 5, function () {
                        // Nodes.Initially we can parse out a tag.  Nodes.We also have seen a starting asterisk.
                        // Nodes.This is so that /** * @type */ doesn't parse.
                        var canParseTag = true;
                        var seenAsterisk = true;
                        nextJSDocToken();
                        while (_this.token !== 1 /* endOfFile */) {
                            switch (_this.token) {
                                case 40 /* at */:
                                    if (canParseTag) {
                                        parseTag();
                                    }
                                    // Nodes.This will take us to the end of the line, so it's Nodes.OK to parse a tag on the next pass through the loop
                                    seenAsterisk = false;
                                    break;
                                case ts.TokenType.newLine:
                                    // Nodes.After a line break, we can parse a tag, and we haven't seen an asterisk on the next line yet
                                    canParseTag = true;
                                    seenAsterisk = false;
                                    break;
                                case 56 /* asterisk */:
                                    if (seenAsterisk) {
                                        // Nodes.If we've already seen an asterisk, then we can no longer parse a tag on this line
                                        canParseTag = false;
                                    }
                                    // Nodes.Ignore the first asterisk on a line
                                    seenAsterisk = true;
                                    break;
                                case 215 /* Identifier */:
                                    // Nodes.Anything else is doc comment text.  Nodes.We can't do anything with it.  Nodes.Because it
                                    // wasn't a tag, we can no longer parse a tag on this line until we hit the next
                                    // line break.
                                    canParseTag = false;
                                    break;
                                case 1 /* endOfFile */:
                                    break;
                            }
                            nextJSDocToken();
                        }
                        _this.result = createJSDocComment();
                    });
                }
                return this.result;
                function createJSDocComment() {
                    if (!tags) {
                        return undefined;
                    }
                    var ;
                    this.result = this.createNode(419 /* JSDocComment */, start);
                    this.result.tags = tags;
                    return this.finishNode(this.result, end);
                }
                function skipWhitespace() {
                    while (this.token === ts.TokenType.whitespace || this.token === ts.TokenType.newLine) {
                        nextJSDocToken();
                    }
                }
                function parseTag() {
                    console.assert(this.token === 40 /* at */);
                    var atToken = this.createNode(40 /* at */, this.scanner.getTokenPos());
                    atToken.end = this.scanner.getTextPos();
                    nextJSDocToken();
                    var tagName = parseJSDocIdentifierName();
                    if (!tagName) {
                        return;
                    }
                    var tag = handleTag(atToken, tagName) || handleUnknownTag(atToken, tagName);
                    addTag(tag);
                }
                function handleTag(atToken, tagName) {
                    if (tagName) {
                        switch (tagName.text) {
                            case "param":
                                return handleParamTag(atToken, tagName);
                            case "return":
                            case "returns":
                                return handleReturnTag(atToken, tagName);
                            case "template":
                                return handleTemplateTag(atToken, tagName);
                            case "type":
                                return handleTypeTag(atToken, tagName);
                            case "typedef":
                                return handleTypedefTag(atToken, tagName);
                        }
                    }
                    return undefined;
                }
                function handleUnknownTag(atToken, tagName) {
                    var ;
                    this.result = this.createNode(420 /* JSDocTag */, atToken.pos);
                    this.result.atToken = atToken;
                    this.result.tagName = tagName;
                    return this.finishNode(this.result);
                }
                function addTag(tag) {
                    if (tag) {
                        if (!tags) {
                            tags = [];
                            tags.pos = tag.pos;
                        }
                        tags.push(tag);
                        tags.end = tag.end;
                    }
                }
                function tryParseTypeExpression() {
                    if (this.token !== 31 /* openBrace */) {
                        return undefined;
                    }
                    var typeExpression = parseJSDocTypeExpression();
                    return typeExpression;
                }
                function handleParamTag(atToken, tagName) {
                    var typeExpression = tryParseTypeExpression();
                    skipWhitespace();
                    var name;
                    var isBracketed;
                    // Nodes.Looking for something like '[foo]' or 'foo'
                    if (this.parseOptionalToken(43 /* openBracket */)) {
                        name = parseJSDocIdentifierName();
                        isBracketed = true;
                        // Nodes.May have an optional default, e.g. '[foo = 42]'
                        if (this.parseOptionalToken(77 /* equals */)) {
                            this.parseExpression();
                        }
                        this.parseExpected(97 /* closeBracket */);
                    }
                    else if (ts.tokenIsIdentifierOrKeyword(this.token)) {
                        name = parseJSDocIdentifierName();
                    }
                    if (!name) {
                        this.parseErrorAtPosition(this.scanner.getStartPos(), 0, Nodes.Diagnostics.Identifier_expected);
                        return undefined;
                    }
                    var preName, postName;
                    if (typeExpression) {
                        postName = name;
                    }
                    else {
                        preName = name;
                    }
                    if (!typeExpression) {
                        typeExpression = tryParseTypeExpression();
                    }
                    var ;
                    this.result = this.createNode(421 /* JSDocParameterTag */, atToken.pos);
                    this.result.atToken = atToken;
                    this.result.tagName = tagName;
                    this.result.preParameterName = preName;
                    this.result.typeExpression = typeExpression;
                    this.result.postParameterName = postName;
                    this.result.isBracketed = isBracketed;
                    return this.finishNode(this.result);
                }
                function handleReturnTag(atToken, tagName) {
                    if (ts.forEach(tags, function (t) { return t.kind === 422 /* JSDocReturnTag */; })) {
                        this.parseErrorAtPosition(tagName.pos, this.scanner.getTokenPos() - tagName.pos, Nodes.Diagnostics._0_tag_already_specified, tagName.text);
                    }
                    var ;
                    this.result = this.createNode(422 /* JSDocReturnTag */, atToken.pos);
                    this.result.atToken = atToken;
                    this.result.tagName = tagName;
                    this.result.typeExpression = tryParseTypeExpression();
                    return this.finishNode(this.result);
                }
                function handleTypeTag(atToken, tagName) {
                    if (ts.forEach(tags, function (t) { return t.kind === 423 /* JSDocTypeTag */; })) {
                        this.parseErrorAtPosition(tagName.pos, this.scanner.getTokenPos() - tagName.pos, Nodes.Diagnostics._0_tag_already_specified, tagName.text);
                    }
                    var ;
                    this.result = this.createNode(423 /* JSDocTypeTag */, atToken.pos);
                    this.result.atToken = atToken;
                    this.result.tagName = tagName;
                    this.result.typeExpression = tryParseTypeExpression();
                    return this.finishNode(this.result);
                }
                function handlePropertyTag(atToken, tagName) {
                    var typeExpression = tryParseTypeExpression();
                    skipWhitespace();
                    var name = parseJSDocIdentifierName();
                    if (!name) {
                        this.parseErrorAtPosition(this.scanner.getStartPos(), /*length*/ 0, Nodes.Diagnostics.Identifier_expected);
                        return undefined;
                    }
                    var ;
                    this.result = this.createNode(426 /* JSDocPropertyTag */, atToken.pos);
                    this.result.atToken = atToken;
                    this.result.tagName = tagName;
                    this.result.name = name;
                    this.result.typeExpression = typeExpression;
                    return this.finishNode(this.result);
                }
                function handleTypedefTag(atToken, tagName) {
                    var typeExpression = tryParseTypeExpression();
                    skipWhitespace();
                    var typedefTag = this.createNode(425 /* JSDocTypedefTag */, atToken.pos);
                    typedefTag.atToken = atToken;
                    typedefTag.tagName = tagName;
                    typedefTag.name = parseJSDocIdentifierName();
                    typedefTag.typeExpression = typeExpression;
                    if (typeExpression) {
                        if (typeExpression.type.kind === 413 /* JSDocTypeReference */) {
                            var jsDocTypeReference = typeExpression.type;
                            if (jsDocTypeReference.name.kind === 215 /* Identifier */) {
                                var name_1 = jsDocTypeReference.name;
                                if (name_1.text === "Nodes.Object") {
                                    typedefTag.jsDocTypeLiteral = scanChildTags();
                                }
                            }
                        }
                        if (!typedefTag.jsDocTypeLiteral) {
                            typedefTag.jsDocTypeLiteral = typeExpression.type;
                        }
                    }
                    else {
                        typedefTag.jsDocTypeLiteral = scanChildTags();
                    }
                    return this.finishNode(typedefTag);
                    function scanChildTags() {
                        var jsDocTypeLiteral = this.createNode(427 /* JSDocTypeLiteral */, this.scanner.getStartPos());
                        var resumePos = this.scanner.getStartPos();
                        var canParseTag = true;
                        var seenAsterisk = false;
                        var parentTagTerminated = false;
                        while (this.token !== 1 /* endOfFile */ && !parentTagTerminated) {
                            nextJSDocToken();
                            switch (this.token) {
                                case 40 /* at */:
                                    if (canParseTag) {
                                        parentTagTerminated = !tryParseChildTag(jsDocTypeLiteral);
                                        if (!parentTagTerminated) {
                                            resumePos = this.scanner.getStartPos();
                                        }
                                    }
                                    seenAsterisk = false;
                                    break;
                                case ts.TokenType.newLine:
                                    resumePos = this.scanner.getStartPos() - 1;
                                    canParseTag = true;
                                    seenAsterisk = false;
                                    break;
                                case 56 /* asterisk */:
                                    if (seenAsterisk) {
                                        canParseTag = false;
                                    }
                                    seenAsterisk = true;
                                    break;
                                case 215 /* Identifier */:
                                    canParseTag = false;
                                case 1 /* endOfFile */:
                                    break;
                            }
                        }
                        this.scanner.setTextPos(resumePos);
                        return this.finishNode(jsDocTypeLiteral);
                    }
                }
                function tryParseChildTag(parentTag) {
                    console.assert(this.token === 40 /* at */);
                    var atToken = this.createNode(40 /* at */, this.scanner.getStartPos());
                    atToken.end = this.scanner.getTextPos();
                    nextJSDocToken();
                    var tagName = parseJSDocIdentifierName();
                    if (!tagName) {
                        return false;
                    }
                    switch (tagName.text) {
                        case "type":
                            if (parentTag.jsDocTypeTag) {
                                // already has a @type tag, terminate the parent tag now.
                                return false;
                            }
                            parentTag.jsDocTypeTag = handleTypeTag(atToken, tagName);
                            return true;
                        case "prop":
                        case "property":
                            if (!parentTag.jsDocPropertyTags) {
                                parentTag.jsDocPropertyTags = [];
                            }
                            var propertyTag = handlePropertyTag(atToken, tagName);
                            parentTag.jsDocPropertyTags.push(propertyTag);
                            return true;
                    }
                    return false;
                }
                function handleTemplateTag(atToken, tagName) {
                    if (ts.forEach(tags, function (t) { return t.kind === 424 /* JSDocTemplateTag */; })) {
                        this.parseErrorAtPosition(tagName.pos, this.scanner.getTokenPos() - tagName.pos, Nodes.Diagnostics._0_tag_already_specified, tagName.text);
                    }
                    // Nodes.Type parameter list looks like '@template T,U,V'
                    var typeParameters = [];
                    typeParameters.pos = this.scanner.getStartPos();
                    while (true) {
                        var name_2 = parseJSDocIdentifierName();
                        if (!name_2) {
                            this.parseErrorAtPosition(this.scanner.getStartPos(), 0, Nodes.Diagnostics.Identifier_expected);
                            return undefined;
                        }
                        var typeParameter = this.createNode(287 /* TypeParameter */, name_2.pos);
                        typeParameter.name = name_2;
                        this.finishNode(typeParameter);
                        typeParameters.push(typeParameter);
                        if (this.token === 92 /* comma */) {
                            nextJSDocToken();
                        }
                        else {
                            break;
                        }
                    }
                    var ;
                    this.result = this.createNode(424 /* JSDocTemplateTag */, atToken.pos);
                    this.result.atToken = atToken;
                    this.result.tagName = tagName;
                    this.result.typeParameters = typeParameters;
                    this.finishNode(this.result);
                    typeParameters.end = this.result.end;
                    return this.result;
                }
                function nextJSDocToken() {
                    return this.token = this.scanner.scanJSDocToken();
                }
                function parseJSDocIdentifierName() {
                    return createJSDocIdentifier(ts.tokenIsIdentifierOrKeyword(this.token));
                }
                function createJSDocIdentifier(isIdentifier) {
                    if (!this.isIdentifier) {
                        this.parseErrorAtCurrentToken(Nodes.Diagnostics.Identifier_expected);
                        return undefined;
                    }
                    var pos = this.scanner.getTokenPos();
                    var end = this.scanner.getTextPos();
                    var result = this.createNode(215 /* Identifier */, pos);
                    this.result.text = content.substring(pos, end);
                    this.finishNode(this.result, end);
                    nextJSDocToken();
                    return this.result;
                }
            }
            JSDocParser.parseJSDocCommentWorker = parseJSDocCommentWorker;
        })(JSDocParser = Nodes.JSDocParser || (Nodes.JSDocParser = {}));
    })(Nodes = ts.Nodes || (ts.Nodes = {}));
    // Implement the parser as a singleton module.  We do this for perf reasons because creating
    // parser instances can actually be expensive enough to impact us on projects with many source
    // files.
    var Parser;
    (function (Parser) {
        // Share a single scanner across all calls to parse a source file.  This helps speed things
        // up by avoiding the cost of creating/compiling scanners over and over again.
        var scanner = ts.createScanner(2 /* Latest */, /*skipTrivia*/ true);
        var disallowInAndDecoratorContext = 4194304 /* DisallowInContext */ | 16777216 /* DecoratorContext */;
        // capture constructors in 'initializeState' to avoid null checks
        var NodeConstructor;
        var SourceFileConstructor;
        var sourceFile;
        var parseDiagnostics;
        var syntaxCursor;
        var token;
        var sourceText;
        var nodeCount;
        var identifiers;
        var identifierCount;
        var parsingContext;
        // Flags that dictate what parsing context we're in.  For example:
        // Whether or not we are in strict parsing mode.  All that changes in strict parsing mode is
        // that some tokens that would be considered identifiers may be considered keywords.
        //
        // When adding more parser context flags, consider which is the more common case that the
        // flag will be in.  This should be the 'false' state for that flag.  The reason for this is
        // that we don't store data in our nodes unless the value is in the *non-default* state.  So,
        // for example, more often than code 'allows-in' (or doesn't 'disallow-in').  We opt for
        // 'disallow-in' set to 'false'.  Otherwise, if we had 'allowsIn' set to 'true', then almost
        // all nodes would need extra state on them to store this info.
        //
        // Note:  'allowIn' and 'allowYield' track 1:1 with the [in] and [yield] concepts in the ES6
        // grammar specification.
        //
        // An important thing about these context concepts.  By default they are effectively inherited
        // while parsing through every grammar production.  i.e. if you don't change them, then when
        // you parse a sub-production, it will have the same context values as the parent production.
        // This is great most of the time.  After all, consider all the 'expression' grammar productions
        // and how nearly all of them pass along the 'in' and 'yield' context values:
        //
        // EqualityExpression[In, Yield] :
        //      RelationalExpression[?In, ?Yield]
        //      EqualityExpression[?In, ?Yield] == RelationalExpression[?In, ?Yield]
        //      EqualityExpression[?In, ?Yield] != RelationalExpression[?In, ?Yield]
        //      EqualityExpression[?In, ?Yield] === RelationalExpression[?In, ?Yield]
        //      EqualityExpression[?In, ?Yield] !== RelationalExpression[?In, ?Yield]
        //
        // Where you have to be careful is then understanding what the points are in the grammar
        // where the values are *not* passed along.  For example:
        //
        // SingleNameBinding[Yield,GeneratorParameter]
        //      [+GeneratorParameter]BindingIdentifier[Yield] Initializer[In]opt
        //      [~GeneratorParameter]BindingIdentifier[?Yield]Initializer[In, ?Yield]opt
        //
        // Here this is saying that if the GeneratorParameter context flag is set, that we should
        // explicitly set the 'yield' context flag to false before calling into the BindingIdentifier
        // and we should explicitly unset the 'yield' context flag before calling into the Initializer.
        // production.  Conversely, if the GeneratorParameter context flag is not set, then we
        // should leave the 'yield' context flag alone.
        //
        // Getting this all correct is tricky and requires careful reading of the grammar to
        // understand when these values should be changed versus when they should be inherited.
        //
        // Note: it should not be necessary to save/restore these flags during speculative/lookahead
        // parsing.  These context flags are naturally stored and restored through normal recursive
        // descent parsing and unwinding.
        var contextFlags;
        // Whether or not we've had a parse error since creating the last AST node.  If we have
        // encountered an error, it will be stored on the next AST node we create.  Parse errors
        // can be broken down into three categories:
        //
        // 1) An error that occurred during scanning.  For example, an unterminated literal, or a
        //    character that was completely not understood.
        //
        // 2) A token was expected, but was not present.  This type of error is commonly produced
        //    by the 'parseExpected' function.
        //
        // 3) A token was present that no parsing function was able to consume.  This type of error
        //    only occurs in the 'abortParsingListOrMoveToNextToken' function when the parser
        //    decides to skip the token.
        //
        // In all of these cases, we want to mark the next node as having had an error before it.
        // With this mark, we can know in incremental settings if this node can be reused, or if
        // we have to reparse it.  If we don't keep this information around, we may just reuse the
        // node.  in that event we would then not produce the same errors as we did before, causing
        // significant confusion problems.
        //
        // Note: it is necessary that this value be saved/restored during speculative/lookahead
        // parsing.  During lookahead parsing, we will often create a node.  That node will have
        // this value attached, and then this value will be set back to 'false'.  If we decide to
        // rewind, we must get back to the same value we had prior to the lookahead.
        //
        // Note: any errors at the end of the file that do not precede a regular node, should get
        // attached to the EOF token.
        var parseErrorBeforeNextFinishedNode = false;
        function parseSourceFile(fileName, _sourceText, languageVersion, _syntaxCursor, setParentNodes, scriptKind) {
            scriptKind = ts.ensureScriptKind(fileName, scriptKind);
            initializeState(fileName, _sourceText, languageVersion, _syntaxCursor, scriptKind);
            var result = parseSourceFileWorker(fileName, languageVersion, setParentNodes, scriptKind);
            clearState();
            return result;
        }
        Parser.parseSourceFile = parseSourceFile;
        function initializeState(fileName, _sourceText, languageVersion, _syntaxCursor, scriptKind) {
            NodeConstructor = ts.objectAllocator.getNodeConstructor();
            SourceFileConstructor = ts.objectAllocator.getSourceFileConstructor();
            sourceText = _sourceText;
            syntaxCursor = _syntaxCursor;
            parseDiagnostics = [];
            parsingContext = 0;
            identifiers = {};
            identifierCount = 0;
            nodeCount = 0;
            contextFlags = scriptKind === 1 /* JS */ || scriptKind === 2 /* JSX */ ? 134217728 /* JavaScriptFile */ : 0 /* None */;
            parseErrorBeforeNextFinishedNode = false;
            // Initialize and prime the scanner before parsing the source elements.
            scanner.setText(sourceText);
            scanner.setScriptTarget(languageVersion);
            scanner.setLanguageVariant(getLanguageVariant(scriptKind));
        }
        function clearState() {
            // Clear out the text the scanner is pointing at, so it doesn't keep anything alive unnecessarily.
            scanner.setText("");
            // Clear any data.  We don't want to accidentally hold onto it for too long.
            parseDiagnostics = undefined;
            sourceFile = undefined;
            identifiers = undefined;
            syntaxCursor = undefined;
            sourceText = undefined;
        }
        function parseSourceFileWorker(fileName, languageVersion, setParentNodes, scriptKind) {
            sourceFile = createSourceFile(fileName, languageVersion, scriptKind);
            sourceFile.flags = contextFlags;
            // Prime the scanner.
            token = nextToken();
            processReferenceComments(sourceFile);
            sourceFile.statements = parseList(0 /* SourceElements */, parseStatement);
            ts.Debug.assert(token === 1 /* endOfFile */);
            sourceFile.endOfFileToken = parseTokenNode();
            setExternalModuleIndicator(sourceFile);
            sourceFile.nodeCount = nodeCount;
            sourceFile.identifierCount = identifierCount;
            sourceFile.identifiers = identifiers;
            sourceFile.parseDiagnostics = parseDiagnostics;
            if (setParentNodes) {
                fixupParentReferences(sourceFile);
            }
            return sourceFile;
        }
        function addJSDocComment(node) {
            if (contextFlags & 134217728 /* JavaScriptFile */) {
                var comments = ts.getLeadingCommentRangesOfNode(node, sourceFile);
                if (comments) {
                    for (var _i = 0, comments_1 = comments; _i < comments_1.length; _i++) {
                        var comment = comments_1[_i];
                        var jsDocComment = JSDocParser.parseJSDocComment(node, comment.pos, comment.end - comment.pos);
                        if (!jsDocComment) {
                            continue;
                        }
                        if (!node.jsDocComments) {
                            node.jsDocComments = [];
                        }
                        node.jsDocComments.push(jsDocComment);
                    }
                }
            }
            return node;
        }
        function fixupParentReferences(rootNode) {
            // normally parent references are set during binding. However, for clients that only need
            // a syntax tree, and no semantic features, then the binding process is an unnecessary
            // overhead.  This functions allows us to set all the parents, without all the expense of
            // binding.
            var parent = rootNode;
            ts.forEachChild(rootNode, visitNode);
            return;
            function visitNode(n) {
                // walk down setting parents that differ from the parent we think it should be.  This
                // allows us to quickly bail out of setting parents for subtrees during incremental
                // parsing
                if (n.parent !== parent) {
                    n.parent = parent;
                    var saveParent = parent;
                    parent = n;
                    ts.forEachChild(n, visitNode);
                    if (n.jsDocComments) {
                        for (var _i = 0, _a = n.jsDocComments; _i < _a.length; _i++) {
                            var jsDocComment = _a[_i];
                            jsDocComment.parent = n;
                            parent = jsDocComment;
                            ts.forEachChild(jsDocComment, visitNode);
                        }
                    }
                    parent = saveParent;
                }
            }
        }
        Parser.fixupParentReferences = fixupParentReferences;
        function createSourceFile(fileName, languageVersion, scriptKind) {
            // code from createNode is inlined here so createNode won't have to deal with special case of creating source files
            // this is quite rare comparing to other nodes and createNode should be as fast as possible
            var sourceFile = new SourceFileConstructor(402 /* SourceFile */, /*pos*/ 0, /* end */ sourceText.length);
            nodeCount++;
            sourceFile.text = sourceText;
            sourceFile.bindDiagnostics = [];
            sourceFile.languageVersion = languageVersion;
            sourceFile.fileName = ts.normalizePath(fileName);
            sourceFile.languageVariant = getLanguageVariant(scriptKind);
            sourceFile.isDeclarationFile = ts.fileExtensionIs(sourceFile.fileName, ".d.ts");
            sourceFile.scriptKind = scriptKind;
            return sourceFile;
        }
        function setContextFlag(val, flag) {
            if (val) {
                contextFlags |= flag;
            }
            else {
                contextFlags &= ~flag;
            }
        }
        function setDisallowInContext(val) {
            setContextFlag(val, 4194304 /* DisallowInContext */);
        }
        function setYieldContext(val) {
            setContextFlag(val, 8388608 /* YieldContext */);
        }
        function setDecoratorContext(val) {
            setContextFlag(val, 16777216 /* DecoratorContext */);
        }
        function setAwaitContext(val) {
            setContextFlag(val, 33554432 /* AwaitContext */);
        }
        function doOutsideOfContext(context, func) {
            // contextFlagsToClear will contain only the context flags that are
            // currently set that we need to temporarily clear
            // We don't just blindly reset to the previous flags to ensure
            // that we do not mutate cached flags for the incremental
            // parser (ThisNodeHasError, ThisNodeOrAnySubNodesHasError, and
            // HasAggregatedChildData).
            var contextFlagsToClear = context & contextFlags;
            if (contextFlagsToClear) {
                // clear the requested context flags
                setContextFlag(/*val*/ false, contextFlagsToClear);
                var result = func();
                // restore the context flags we just cleared
                setContextFlag(/*val*/ true, contextFlagsToClear);
                return result;
            }
            // no need to do anything special as we are not in any of the requested contexts
            return func();
        }
        function doInsideOfContext(context, func) {
            // contextFlagsToSet will contain only the context flags that
            // are not currently set that we need to temporarily enable.
            // We don't just blindly reset to the previous flags to ensure
            // that we do not mutate cached flags for the incremental
            // parser (ThisNodeHasError, ThisNodeOrAnySubNodesHasError, and
            // HasAggregatedChildData).
            var contextFlagsToSet = context & ~contextFlags;
            if (contextFlagsToSet) {
                // set the requested context flags
                setContextFlag(/*val*/ true, contextFlagsToSet);
                var result = func();
                // reset the context flags we just set
                setContextFlag(/*val*/ false, contextFlagsToSet);
                return result;
            }
            // no need to do anything special as we are already in all of the requested contexts
            return func();
        }
        function allowInAnd(func) {
            return doOutsideOfContext(4194304 /* DisallowInContext */, func);
        }
        function disallowInAnd(func) {
            return doInsideOfContext(4194304 /* DisallowInContext */, func);
        }
        function doInYieldContext(func) {
            return doInsideOfContext(8388608 /* YieldContext */, func);
        }
        function doInDecoratorContext(func) {
            return doInsideOfContext(16777216 /* DecoratorContext */, func);
        }
        function doInAwaitContext(func) {
            return doInsideOfContext(33554432 /* AwaitContext */, func);
        }
        function doOutsideOfAwaitContext(func) {
            return doOutsideOfContext(33554432 /* AwaitContext */, func);
        }
        function doInYieldAndAwaitContext(func) {
            return doInsideOfContext(8388608 /* YieldContext */ | 33554432 /* AwaitContext */, func);
        }
        function inContext(flags) {
            return (contextFlags & flags) !== 0;
        }
        function inYieldContext() {
            return inContext(8388608 /* YieldContext */);
        }
        function inDisallowInContext() {
            return inContext(4194304 /* DisallowInContext */);
        }
        function inDecoratorContext() {
            return inContext(16777216 /* DecoratorContext */);
        }
        function inAwaitContext() {
            return inContext(33554432 /* AwaitContext */);
        }
        function parseErrorAtCurrentToken(message, arg0) {
            var start = scanner.getTokenPos();
            var length = scanner.getTextPos() - start;
            parseErrorAtPosition(start, length, message, arg0);
        }
        function parseErrorAtPosition(start, length, message, arg0) {
            // Don't report another error if it would just be at the same position as the last error.
            var lastError = ts.lastOrUndefined(parseDiagnostics);
            if (!lastError || start !== lastError.start) {
                parseDiagnostics.push(ts.createFileDiagnostic(sourceFile, start, length, message, arg0));
            }
            // Mark that we've encountered an error.  We'll set an appropriate bit on the next
            // node we finish so that it can't be reused incrementally.
            parseErrorBeforeNextFinishedNode = true;
        }
        function scanError(message, length) {
            var pos = scanner.getTextPos();
            parseErrorAtPosition(pos, length || 0, message);
        }
        function getNodePos() {
            return scanner.getStartPos();
        }
        function getNodeEnd() {
            return scanner.getStartPos();
        }
        function nextToken() {
            return token = scanner.scan();
        }
        function reScanGreaterToken() {
            return token = scanner.reScanGreaterToken();
        }
        function reScanSlashToken() {
            return token = scanner.reScanSlashToken();
        }
        function reScanTemplateToken() {
            return token = scanner.reScanTemplateToken();
        }
        function scanJsxIdentifier() {
            return token = scanner.scanJsxIdentifier();
        }
        function scanJsxText() {
            return token = scanner.scanJsxToken();
        }
        function speculationHelper(callback, isLookAhead) {
            // Keep track of the state we'll need to rollback to if lookahead fails (or if the
            // caller asked us to always reset our state).
            var saveToken = token;
            var saveParseDiagnosticsLength = parseDiagnostics.length;
            var saveParseErrorBeforeNextFinishedNode = parseErrorBeforeNextFinishedNode;
            // Note: it is not actually necessary to save/restore the context flags here.  That's
            // because the saving/restoring of these flags happens naturally through the recursive
            // descent nature of our parser.  However, we still store this here just so we can
            // assert that that invariant holds.
            var saveContextFlags = contextFlags;
            // If we're only looking ahead, then tell the scanner to only lookahead as well.
            // Otherwise, if we're actually speculatively parsing, then tell the scanner to do the
            // same.
            var result = isLookAhead
                ? scanner.lookAhead(callback)
                : scanner.tryScan(callback);
            ts.Debug.assert(saveContextFlags === contextFlags);
            // If our callback returned something 'falsy' or we're just looking ahead,
            // then unconditionally restore us to where we were.
            if (!result || isLookAhead) {
                token = saveToken;
                parseDiagnostics.length = saveParseDiagnosticsLength;
                parseErrorBeforeNextFinishedNode = saveParseErrorBeforeNextFinishedNode;
            }
            return result;
        }
        /** Invokes the provided callback then unconditionally restores the parser to the state it
         * was in immediately prior to invoking the callback.  The result of invoking the callback
         * is returned from this function.
         */
        function lookAhead(callback) {
            return speculationHelper(callback, /*isLookAhead*/ true);
        }
        /** Invokes the provided callback.  If the callback returns something falsy, then it restores
         * the parser to the state it was in immediately prior to invoking the callback.  If the
         * callback returns something truthy, then the parser state is not rolled back.  The result
         * of invoking the callback is returned from this function.
         */
        function tryParse(callback) {
            return speculationHelper(callback, /*isLookAhead*/ false);
        }
        // Ignore strict mode flag because we will report an error in type checker instead.
        function isIdentifier() {
            if (token === 215 /* Identifier */) {
                return true;
            }
            // If we have a 'yield' keyword, and we're in the [yield] context, then 'yield' is
            // considered a keyword and is not an identifier.
            if (token === 38 /* yield */ && inYieldContext()) {
                return false;
            }
            // If we have a 'await' keyword, and we're in the [Await] context, then 'await' is
            // considered a keyword and is not an identifier.
            if (token === 39 /* await */ && inAwaitContext()) {
                return false;
            }
            return token > 251 /* LastReservedWord */;
        }
        function parseExpected(kind, diagnosticMessage, shouldAdvance) {
            if (shouldAdvance === void 0) { shouldAdvance = true; }
            if (token === kind) {
                if (shouldAdvance) {
                    nextToken();
                }
                return true;
            }
            // Report specific message if provided with one.  Otherwise, report generic fallback message.
            if (diagnosticMessage) {
                parseErrorAtCurrentToken(diagnosticMessage);
            }
            else {
                parseErrorAtCurrentToken(ts.Diagnostics._0_expected, ts.tokenToString(kind));
            }
            return false;
        }
        function parseOptional(t) {
            if (token === t) {
                nextToken();
                return true;
            }
            return false;
        }
        function parseOptionalToken(t) {
            if (token === t) {
                return parseTokenNode();
            }
            return undefined;
        }
        function parseExpectedToken(t, reportAtCurrentPosition, diagnosticMessage, arg0) {
            return parseOptionalToken(t) ||
                createMissingNode(t, reportAtCurrentPosition, diagnosticMessage, arg0);
        }
        function parseTokenNode() {
            var node = createNode(token);
            nextToken();
            return finishNode(node);
        }
        function canParseSemicolon() {
            // If there's a real semicolon, then we can always parse it out.
            if (token === 100 /* semicolon */) {
                return true;
            }
            // We can parse out an optional semicolon in ASI cases in the following cases.
            return token === 98 /* closeBrace */ || token === 1 /* endOfFile */ || scanner.hasPrecedingLineBreak();
        }
        function parseSemicolon() {
            if (canParseSemicolon()) {
                if (token === 100 /* semicolon */) {
                    // consume the semicolon if it was explicitly provided.
                    nextToken();
                }
                return true;
            }
            else {
                return parseExpected(100 /* semicolon */);
            }
        }
        // note: this function creates only node
        function createNode(kind, pos) {
            nodeCount++;
            if (!(pos >= 0)) {
                pos = scanner.getStartPos();
            }
            return new NodeConstructor(kind, pos, pos);
        }
        function finishNode(node, end) {
            node.end = end === undefined ? scanner.getStartPos() : end;
            if (contextFlags) {
                node.flags |= contextFlags;
            }
            // Keep track on the node if we encountered an error while parsing it.  If we did, then
            // we cannot reuse the node incrementally.  Once we've marked this node, clear out the
            // flag so that we don't mark any subsequent nodes.
            if (parseErrorBeforeNextFinishedNode) {
                parseErrorBeforeNextFinishedNode = false;
                node.flags |= 67108864 /* ThisNodeHasError */;
            }
            return node;
        }
        function createMissingNode(kind, reportAtCurrentPosition, diagnosticMessage, arg0) {
            if (reportAtCurrentPosition) {
                parseErrorAtPosition(scanner.getStartPos(), 0, diagnosticMessage, arg0);
            }
            else {
                parseErrorAtCurrentToken(diagnosticMessage, arg0);
            }
            var result = createNode(kind, scanner.getStartPos());
            result.text = "";
            return finishNode(result);
        }
        function internIdentifier(text) {
            text = ts.escapeIdentifier(text);
            return ts.hasProperty(identifiers, text) ? identifiers[text] : (identifiers[text] = text);
        }
        // An identifier that starts with two underscores has an extra underscore character prepended to it to avoid issues
        // with magic property names like '__proto__'. The 'identifiers' object is used to share a single string instance for
        // each identifier in order to reduce memory consumption.
        function createIdentifier(isIdentifier, diagnosticMessage) {
            identifierCount++;
            if (isIdentifier) {
                var node = createNode(215 /* Identifier */);
                // Store original token kind if it is not just an Identifier so we can report appropriate error later in type checker
                if (token !== 215 /* Identifier */) {
                    node.originalKeywordKind = token;
                }
                node.text = internIdentifier(scanner.getTokenValue());
                nextToken();
                return finishNode(node);
            }
            return createMissingNode(215 /* Identifier */, /*reportAtCurrentPosition*/ false, diagnosticMessage || ts.Diagnostics.Identifier_expected);
        }
        function parseIdentifier(diagnosticMessage) {
            return createIdentifier(isIdentifier(), diagnosticMessage);
        }
        function parseIdentifierName() {
            return createIdentifier(ts.tokenIsIdentifierOrKeyword(token));
        }
        function isLiteralPropertyName() {
            return ts.tokenIsIdentifierOrKeyword(token) ||
                token === 155 /* StringLiteral */ ||
                token === 154 /* NumericLiteral */;
        }
        function parsePropertyNameWorker(allowComputedPropertyNames) {
            if (token === 155 /* StringLiteral */ || token === 154 /* NumericLiteral */) {
                return parseLiteralNode(/*internName*/ true);
            }
            if (allowComputedPropertyNames && token === 43 /* openBracket */) {
                return parseComputedPropertyName();
            }
            return parseIdentifierName();
        }
        function parsePropertyName() {
            return parsePropertyNameWorker(/*allowComputedPropertyNames*/ true);
        }
        function parseSimplePropertyName() {
            return parsePropertyNameWorker(/*allowComputedPropertyNames*/ false);
        }
        function isSimplePropertyName() {
            return token === 155 /* StringLiteral */ || token === 154 /* NumericLiteral */ || ts.tokenIsIdentifierOrKeyword(token);
        }
        function parseComputedPropertyName() {
            // PropertyName [Yield]:
            //      LiteralPropertyName
            //      ComputedPropertyName[?Yield]
            var node = createNode(286 /* ComputedPropertyName */);
            parseExpected(43 /* openBracket */);
            // We parse any expression (including a comma expression). But the grammar
            // says that only an assignment expression is allowed, so the grammar checker
            // will error if it sees a comma expression.
            node.expression = allowInAnd(parseExpression);
            parseExpected(97 /* closeBracket */);
            return finishNode(node);
        }
        function parseContextualModifier(t) {
            return token === t && tryParse(nextTokenCanFollowModifier);
        }
        function nextTokenIsOnSameLineAndCanFollowModifier() {
            nextToken();
            if (scanner.hasPrecedingLineBreak()) {
                return false;
            }
            return canFollowModifier();
        }
        function nextTokenCanFollowModifier() {
            if (token === 115 /* const */) {
                // 'const' is only a modifier if followed by 'enum'.
                return nextToken() === 15 /* enum */;
            }
            if (token === 4 /* export */) {
                nextToken();
                if (token === 127 /* default */) {
                    return lookAhead(nextTokenIsClassOrFunctionOrAsync);
                }
                return token !== 56 /* asterisk */ && token !== 93 /* as */ && token !== 31 /* openBrace */ && canFollowModifier();
            }
            if (token === 127 /* default */) {
                return nextTokenIsClassOrFunctionOrAsync();
            }
            if (token === 9 /* static */) {
                nextToken();
                return canFollowModifier();
            }
            return nextTokenIsOnSameLineAndCanFollowModifier();
        }
        function parseAnyContextualModifier() {
            return ts.isModifier(token) && tryParse(nextTokenCanFollowModifier);
        }
        function canFollowModifier() {
            return token === 43 /* openBracket */
                || token === 31 /* openBrace */
                || token === 56 /* asterisk */
                || token === 51 /* dotDotDot */
                || isLiteralPropertyName();
        }
        function nextTokenIsClassOrFunctionOrAsync() {
            nextToken();
            return token === 17 /* class */ || token === 18 /* function */ ||
                (token === 5 /* async */ && lookAhead(nextTokenIsFunctionKeywordOnSameLine));
        }
        // True if positioned at the start of a list element
        function isListElement(parsingContext, inErrorRecovery) {
            var node = currentNode(parsingContext);
            if (node) {
                return true;
            }
            switch (parsingContext) {
                case 0 /* SourceElements */:
                case 1 /* BlockStatements */:
                case 3 /* SwitchClauseStatements */:
                    // If we're in error recovery, then we don't want to treat ';' as an empty statement.
                    // The problem is that ';' can show up in far too many contexts, and if we see one
                    // and assume it's a statement, then we may bail out inappropriately from whatever
                    // we're parsing.  For example, if we have a semicolon in the middle of a class, then
                    // we really don't want to assume the class is over and we're on a statement in the
                    // outer module.  We just want to consume and move on.
                    return !(token === 100 /* semicolon */ && inErrorRecovery) && isStartOfStatement();
                case 2 /* SwitchClauses */:
                    return token === 126 /* case */ || token === 127 /* default */;
                case 4 /* TypeMembers */:
                    return lookAhead(isTypeMemberStart);
                case 5 /* ClassMembers */:
                    // We allow semicolons as class elements (as specified by ES6) as long as we're
                    // not in error recovery.  If we're in error recovery, we don't want an errant
                    // semicolon to be treated as a class member (since they're almost always used
                    // for statements.
                    return lookAhead(isClassMemberStart) || (token === 100 /* semicolon */ && !inErrorRecovery);
                case 6 /* EnumMembers */:
                    // Include open bracket computed properties. This technically also lets in indexers,
                    // which would be a candidate for improved error reporting.
                    return token === 43 /* openBracket */ || isLiteralPropertyName();
                case 12 /* ObjectLiteralMembers */:
                    return token === 43 /* openBracket */ || token === 56 /* asterisk */ || isLiteralPropertyName();
                case 9 /* ObjectBindingElements */:
                    return token === 43 /* openBracket */ || isLiteralPropertyName();
                case 7 /* HeritageClauseElement */:
                    // If we see { } then only consume it as an expression if it is followed by , or {
                    // That way we won't consume the body of a class in its heritage clause.
                    if (token === 31 /* openBrace */) {
                        return lookAhead(isValidHeritageClauseObjectLiteral);
                    }
                    if (!inErrorRecovery) {
                        return isStartOfLeftHandSideExpression() && !isHeritageClauseExtendsOrImplementsKeyword();
                    }
                    else {
                        // If we're in error recovery we tighten up what we're willing to match.
                        // That way we don't treat something like "this" as a valid heritage clause
                        // element during recovery.
                        return isIdentifier() && !isHeritageClauseExtendsOrImplementsKeyword();
                    }
                case 8 /* VariableDeclarations */:
                    return isIdentifierOrPattern();
                case 10 /* ArrayBindingElements */:
                    return token === 92 /* comma */ || token === 51 /* dotDotDot */ || isIdentifierOrPattern();
                case 17 /* TypeParameters */:
                    return isIdentifier();
                case 11 /* ArgumentExpressions */:
                case 15 /* ArrayLiteralMembers */:
                    return token === 92 /* comma */ || token === 51 /* dotDotDot */ || isStartOfExpression();
                case 16 /* Parameters */:
                    return isStartOfParameter();
                case 18 /* TypeArguments */:
                case 19 /* TupleElementTypes */:
                    return token === 92 /* comma */ || isStartOfType();
                case 20 /* HeritageClauses */:
                    return isHeritageClause();
                case 21 /* ImportOrExportSpecifiers */:
                    return ts.tokenIsIdentifierOrKeyword(token);
                case 13 /* JsxAttributes */:
                    return ts.tokenIsIdentifierOrKeyword(token) || token === 31 /* openBrace */;
                case 14 /* JsxChildren */:
                    return true;
                case 22 /* JSDocFunctionParameters */:
                case 23 /* JSDocTypeArguments */:
                case 25 /* JSDocTupleTypes */:
                    return JSDocParser.isJSDocType();
                case 24 /* JSDocRecordMembers */:
                    return isSimplePropertyName();
            }
            ts.Debug.fail("Non-exhaustive case in 'isListElement'.");
        }
        function isValidHeritageClauseObjectLiteral() {
            ts.Debug.assert(token === 31 /* openBrace */);
            if (nextToken() === 98 /* closeBrace */) {
                // if we see  "extends {}" then only treat the {} as what we're extending (and not
                // the class body) if we have:
                //
                //      extends {} {
                //      extends {},
                //      extends {} extends
                //      extends {} implements
                var next = nextToken();
                return next === 92 /* comma */ || next === 31 /* openBrace */ || next === 131 /* extends */ || next === 132 /* implements */;
            }
            return true;
        }
        function nextTokenIsIdentifier() {
            nextToken();
            return isIdentifier();
        }
        function nextTokenIsIdentifierOrKeyword() {
            nextToken();
            return ts.tokenIsIdentifierOrKeyword(token);
        }
        function isHeritageClauseExtendsOrImplementsKeyword() {
            if (token === 132 /* implements */ ||
                token === 131 /* extends */) {
                return lookAhead(nextTokenIsStartOfExpression);
            }
            return false;
        }
        function nextTokenIsStartOfExpression() {
            nextToken();
            return isStartOfExpression();
        }
        // True if positioned at a list terminator
        function isListTerminator(kind) {
            if (token === 1 /* endOfFile */) {
                // Being at the end of the file ends all lists.
                return true;
            }
            switch (kind) {
                case 1 /* BlockStatements */:
                case 2 /* SwitchClauses */:
                case 4 /* TypeMembers */:
                case 5 /* ClassMembers */:
                case 6 /* EnumMembers */:
                case 12 /* ObjectLiteralMembers */:
                case 9 /* ObjectBindingElements */:
                case 21 /* ImportOrExportSpecifiers */:
                    return token === 98 /* closeBrace */;
                case 3 /* SwitchClauseStatements */:
                    return token === 98 /* closeBrace */ || token === 126 /* case */ || token === 127 /* default */;
                case 7 /* HeritageClauseElement */:
                    return token === 31 /* openBrace */ || token === 131 /* extends */ || token === 132 /* implements */;
                case 8 /* VariableDeclarations */:
                    return isVariableDeclaratorListTerminator();
                case 17 /* TypeParameters */:
                    // Tokens other than '>' are here for better error recovery
                    return token === 61 /* greaterThan */ || token === 42 /* openParen */ || token === 31 /* openBrace */ || token === 131 /* extends */ || token === 132 /* implements */;
                case 11 /* ArgumentExpressions */:
                    // Tokens other than ')' are here for better error recovery
                    return token === 96 /* closeParen */ || token === 100 /* semicolon */;
                case 15 /* ArrayLiteralMembers */:
                case 19 /* TupleElementTypes */:
                case 10 /* ArrayBindingElements */:
                    return token === 97 /* closeBracket */;
                case 16 /* Parameters */:
                    // Tokens other than ')' and ']' (the latter for index signatures) are here for better error recovery
                    return token === 96 /* closeParen */ || token === 97 /* closeBracket */ /*|| token === SyntaxKind.OpenBraceToken*/;
                case 18 /* TypeArguments */:
                    // Tokens other than '>' are here for better error recovery
                    return token === 61 /* greaterThan */ || token === 42 /* openParen */;
                case 20 /* HeritageClauses */:
                    return token === 31 /* openBrace */ || token === 98 /* closeBrace */;
                case 13 /* JsxAttributes */:
                    return token === 61 /* greaterThan */ || token === 46 /* slash */;
                case 14 /* JsxChildren */:
                    return token === 49 /* lessThan */ && lookAhead(nextTokenIsSlash);
                case 22 /* JSDocFunctionParameters */:
                    return token === 96 /* closeParen */ || token === 99 /* colon */ || token === 98 /* closeBrace */;
                case 23 /* JSDocTypeArguments */:
                    return token === 61 /* greaterThan */ || token === 98 /* closeBrace */;
                case 25 /* JSDocTupleTypes */:
                    return token === 97 /* closeBracket */ || token === 98 /* closeBrace */;
                case 24 /* JSDocRecordMembers */:
                    return token === 98 /* closeBrace */;
            }
        }
        function isVariableDeclaratorListTerminator() {
            // If we can consume a semicolon (either explicitly, or with ASI), then consider us done
            // with parsing the list of  variable declarators.
            if (canParseSemicolon()) {
                return true;
            }
            // in the case where we're parsing the variable declarator of a 'for-in' statement, we
            // are done if we see an 'in' keyword in front of us. Same with for-of
            if (isInOrOfKeyword(token)) {
                return true;
            }
            // ERROR RECOVERY TWEAK:
            // For better error recovery, if we see an '=>' then we just stop immediately.  We've got an
            // arrow function here and it's going to be very unlikely that we'll resynchronize and get
            // another variable declaration.
            if (token === 50 /* equalsGreaterThan */) {
                return true;
            }
            // Keep trying to parse out variable declarators.
            return false;
        }
        // True if positioned at element or terminator of the current list or any enclosing list
        function isInSomeParsingContext() {
            for (var kind = 0; kind < 26 /* Count */; kind++) {
                if (parsingContext & (1 << kind)) {
                    if (isListElement(kind, /*inErrorRecovery*/ true) || isListTerminator(kind)) {
                        return true;
                    }
                }
            }
            return false;
        }
        // Parses a list of elements
        function parseList(kind, parseElement) {
            var saveParsingContext = parsingContext;
            parsingContext |= 1 << kind;
            var result = [];
            result.pos = getNodePos();
            while (!isListTerminator(kind)) {
                if (isListElement(kind, /*inErrorRecovery*/ false)) {
                    var element = parseListElement(kind, parseElement);
                    result.push(element);
                    continue;
                }
                if (abortParsingListOrMoveToNextToken(kind)) {
                    break;
                }
            }
            result.end = getNodeEnd();
            parsingContext = saveParsingContext;
            return result;
        }
        function parseListElement(parsingContext, parseElement) {
            var node = currentNode(parsingContext);
            if (node) {
                return consumeNode(node);
            }
            return parseElement();
        }
        function currentNode(parsingContext) {
            // If there is an outstanding parse error that we've encountered, but not attached to
            // some node, then we cannot get a node from the old source tree.  This is because we
            // want to mark the next node we encounter as being unusable.
            //
            // Note: This may be too conservative.  Perhaps we could reuse the node and set the bit
            // on it (or its leftmost child) as having the error.  For now though, being conservative
            // is nice and likely won't ever affect perf.
            if (parseErrorBeforeNextFinishedNode) {
                return undefined;
            }
            if (!syntaxCursor) {
                // if we don't have a cursor, we could never return a node from the old tree.
                return undefined;
            }
            var node = syntaxCursor.currentNode(scanner.getStartPos());
            // Can't reuse a missing node.
            if (ts.nodeIsMissing(node)) {
                return undefined;
            }
            // Can't reuse a node that intersected the change range.
            if (node.intersectsChange) {
                return undefined;
            }
            // Can't reuse a node that contains a parse error.  This is necessary so that we
            // produce the same set of errors again.
            if (ts.containsParseError(node)) {
                return undefined;
            }
            // We can only reuse a node if it was parsed under the same strict mode that we're
            // currently in.  i.e. if we originally parsed a node in non-strict mode, but then
            // the user added 'using strict' at the top of the file, then we can't use that node
            // again as the presence of strict mode may cause us to parse the tokens in the file
            // differently.
            //
            // Note: we *can* reuse tokens when the strict mode changes.  That's because tokens
            // are unaffected by strict mode.  It's just the parser will decide what to do with it
            // differently depending on what mode it is in.
            //
            // This also applies to all our other context flags as well.
            var nodeContextFlags = node.flags & 197132288 /* ContextFlags */;
            if (nodeContextFlags !== contextFlags) {
                return undefined;
            }
            // Ok, we have a node that looks like it could be reused.  Now verify that it is valid
            // in the current list parsing context that we're currently at.
            if (!canReuseNode(node, parsingContext)) {
                return undefined;
            }
            return node;
        }
        function consumeNode(node) {
            // Move the scanner so it is after the node we just consumed.
            scanner.setTextPos(node.end);
            nextToken();
            return node;
        }
        function canReuseNode(node, parsingContext) {
            switch (parsingContext) {
                case 5 /* ClassMembers */:
                    return isReusableClassMember(node);
                case 2 /* SwitchClauses */:
                    return isReusableSwitchClause(node);
                case 0 /* SourceElements */:
                case 1 /* BlockStatements */:
                case 3 /* SwitchClauseStatements */:
                    return isReusableStatement(node);
                case 6 /* EnumMembers */:
                    return isReusableEnumMember(node);
                case 4 /* TypeMembers */:
                    return isReusableTypeMember(node);
                case 8 /* VariableDeclarations */:
                    return isReusableVariableDeclaration(node);
                case 16 /* Parameters */:
                    return isReusableParameter(node);
                // Any other lists we do not care about reusing nodes in.  But feel free to add if
                // you can do so safely.  Danger areas involve nodes that may involve speculative
                // parsing.  If speculative parsing is involved with the node, then the range the
                // parser reached while looking ahead might be in the edited range (see the example
                // in canReuseVariableDeclaratorNode for a good case of this).
                case 20 /* HeritageClauses */:
                // This would probably be safe to reuse.  There is no speculative parsing with
                // heritage clauses.
                case 17 /* TypeParameters */:
                // This would probably be safe to reuse.  There is no speculative parsing with
                // type parameters.  Note that that's because type *parameters* only occur in
                // unambiguous *type* contexts.  While type *arguments* occur in very ambiguous
                // *expression* contexts.
                case 19 /* TupleElementTypes */:
                // This would probably be safe to reuse.  There is no speculative parsing with
                // tuple types.
                // Technically, type argument list types are probably safe to reuse.  While
                // speculative parsing is involved with them (since type argument lists are only
                // produced from speculative parsing a < as a type argument list), we only have
                // the types because speculative parsing succeeded.  Thus, the lookahead never
                // went past the end of the list and rewound.
                case 18 /* TypeArguments */:
                // Note: these are almost certainly not safe to ever reuse.  Expressions commonly
                // need a large amount of lookahead, and we should not reuse them as they may
                // have actually intersected the edit.
                case 11 /* ArgumentExpressions */:
                // This is not safe to reuse for the same reason as the 'AssignmentExpression'
                // cases.  i.e. a property assignment may end with an expression, and thus might
                // have lookahead far beyond it's old node.
                case 12 /* ObjectLiteralMembers */:
                // This is probably not safe to reuse.  There can be speculative parsing with
                // type names in a heritage clause.  There can be generic names in the type
                // name list, and there can be left hand side expressions (which can have type
                // arguments.)
                case 7 /* HeritageClauseElement */:
                // Perhaps safe to reuse, but it's unlikely we'd see more than a dozen attributes
                // on any given element. Same for children.
                case 13 /* JsxAttributes */:
                case 14 /* JsxChildren */:
            }
            return false;
        }
        function isReusableClassMember(node) {
            if (node) {
                switch (node.kind) {
                    case 294 /* Constructor */:
                    case 299 /* IndexSignature */:
                    case 295 /* GetAccessor */:
                    case 296 /* SetAccessor */:
                    case 291 /* PropertyDeclaration */:
                    case 344 /* SemicolonClassElement */:
                        return true;
                    case 293 /* MethodDeclaration */:
                        // Method declarations are not necessarily reusable.  An object-literal
                        // may have a method calls "constructor(...)" and we must reparse that
                        // into an actual .ConstructorDeclaration.
                        var methodDeclaration = node;
                        var nameIsConstructor = methodDeclaration.name.kind === 215 /* Identifier */ &&
                            methodDeclaration.name.originalKeywordKind === 138 /* constructor */;
                        return !nameIsConstructor;
                }
            }
            return false;
        }
        function isReusableSwitchClause(node) {
            if (node) {
                switch (node.kind) {
                    case 395 /* CaseClause */:
                    case 396 /* DefaultClause */:
                        return true;
                }
            }
            return false;
        }
        function isReusableStatement(node) {
            if (node) {
                switch (node.kind) {
                    case 366 /* FunctionDeclaration */:
                    case 346 /* VariableStatement */:
                    case 345 /* Block */:
                    case 349 /* IfStatement */:
                    case 348 /* ExpressionStatement */:
                    case 361 /* ThrowStatement */:
                    case 357 /* ReturnStatement */:
                    case 359 /* SwitchStatement */:
                    case 356 /* BreakStatement */:
                    case 355 /* ContinueStatement */:
                    case 353 /* ForInStatement */:
                    case 354 /* ForOfStatement */:
                    case 352 /* ForStatement */:
                    case 351 /* WhileStatement */:
                    case 358 /* WithStatement */:
                    case 347 /* EmptyStatement */:
                    case 362 /* TryStatement */:
                    case 360 /* LabeledStatement */:
                    case 350 /* DoStatement */:
                    case 363 /* DebuggerStatement */:
                    case 376 /* ImportDeclaration */:
                    case 375 /* ImportEqualsDeclaration */:
                    case 382 /* ExportDeclaration */:
                    case 381 /* ExportAssignment */:
                    case 371 /* ModuleDeclaration */:
                    case 367 /* ClassDeclaration */:
                    case 368 /* InterfaceDeclaration */:
                    case 370 /* EnumDeclaration */:
                    case 369 /* TypeAliasDeclaration */:
                        return true;
                }
            }
            return false;
        }
        function isReusableEnumMember(node) {
            return node.kind === 401 /* EnumMember */;
        }
        function isReusableTypeMember(node) {
            if (node) {
                switch (node.kind) {
                    case 298 /* ConstructSignature */:
                    case 292 /* MethodSignature */:
                    case 299 /* IndexSignature */:
                    case 290 /* PropertySignature */:
                    case 297 /* CallSignature */:
                        return true;
                }
            }
            return false;
        }
        function isReusableVariableDeclaration(node) {
            if (node.kind !== 364 /* VariableDeclaration */) {
                return false;
            }
            // Very subtle incremental parsing bug.  Consider the following code:
            //
            //      let v = new List < A, B
            //
            // This is actually legal code.  It's a list of variable declarators "v = new List<A"
            // on one side and "B" on the other. If you then change that to:
            //
            //      let v = new List < A, B >()
            //
            // then we have a problem.  "v = new List<A" doesn't intersect the change range, so we
            // start reparsing at "B" and we completely fail to handle this properly.
            //
            // In order to prevent this, we do not allow a variable declarator to be reused if it
            // has an initializer.
            var variableDeclarator = node;
            return variableDeclarator.initializer === undefined;
        }
        function isReusableParameter(node) {
            if (node.kind !== 288 /* Parameter */) {
                return false;
            }
            // See the comment in isReusableVariableDeclaration for why we do this.
            var parameter = node;
            return parameter.initializer === undefined;
        }
        // Returns true if we should abort parsing.
        function abortParsingListOrMoveToNextToken(kind) {
            parseErrorAtCurrentToken(parsingContextErrors(kind));
            if (isInSomeParsingContext()) {
                return true;
            }
            nextToken();
            return false;
        }
        function parsingContextErrors(context) {
            switch (context) {
                case 0 /* SourceElements */: return ts.Diagnostics.Declaration_or_statement_expected;
                case 1 /* BlockStatements */: return ts.Diagnostics.Declaration_or_statement_expected;
                case 2 /* SwitchClauses */: return ts.Diagnostics.case_or_default_expected;
                case 3 /* SwitchClauseStatements */: return ts.Diagnostics.Statement_expected;
                case 4 /* TypeMembers */: return ts.Diagnostics.Property_or_signature_expected;
                case 5 /* ClassMembers */: return ts.Diagnostics.Unexpected_token_A_constructor_method_accessor_or_property_was_expected;
                case 6 /* EnumMembers */: return ts.Diagnostics.Enum_member_expected;
                case 7 /* HeritageClauseElement */: return ts.Diagnostics.Expression_expected;
                case 8 /* VariableDeclarations */: return ts.Diagnostics.Variable_declaration_expected;
                case 9 /* ObjectBindingElements */: return ts.Diagnostics.Property_destructuring_pattern_expected;
                case 10 /* ArrayBindingElements */: return ts.Diagnostics.Array_element_destructuring_pattern_expected;
                case 11 /* ArgumentExpressions */: return ts.Diagnostics.Argument_expression_expected;
                case 12 /* ObjectLiteralMembers */: return ts.Diagnostics.Property_assignment_expected;
                case 15 /* ArrayLiteralMembers */: return ts.Diagnostics.Expression_or_comma_expected;
                case 16 /* Parameters */: return ts.Diagnostics.Parameter_declaration_expected;
                case 17 /* TypeParameters */: return ts.Diagnostics.Type_parameter_declaration_expected;
                case 18 /* TypeArguments */: return ts.Diagnostics.Type_argument_expected;
                case 19 /* TupleElementTypes */: return ts.Diagnostics.Type_expected;
                case 20 /* HeritageClauses */: return ts.Diagnostics.Unexpected_token_expected;
                case 21 /* ImportOrExportSpecifiers */: return ts.Diagnostics.Identifier_expected;
                case 13 /* JsxAttributes */: return ts.Diagnostics.Identifier_expected;
                case 14 /* JsxChildren */: return ts.Diagnostics.Identifier_expected;
                case 22 /* JSDocFunctionParameters */: return ts.Diagnostics.Parameter_declaration_expected;
                case 23 /* JSDocTypeArguments */: return ts.Diagnostics.Type_argument_expected;
                case 25 /* JSDocTupleTypes */: return ts.Diagnostics.Type_expected;
                case 24 /* JSDocRecordMembers */: return ts.Diagnostics.Property_assignment_expected;
            }
        }
        ;
        // Parses a comma-delimited list of elements
        function parseDelimitedList(kind, parseElement, considerSemicolonAsDelimiter) {
            var saveParsingContext = parsingContext;
            parsingContext |= 1 << kind;
            var result = [];
            result.pos = getNodePos();
            var commaStart = -1; // Meaning the previous token was not a comma
            while (true) {
                if (isListElement(kind, /*inErrorRecovery*/ false)) {
                    result.push(parseListElement(kind, parseElement));
                    commaStart = scanner.getTokenPos();
                    if (parseOptional(92 /* comma */)) {
                        continue;
                    }
                    commaStart = -1; // Back to the state where the last token was not a comma
                    if (isListTerminator(kind)) {
                        break;
                    }
                    // We didn't get a comma, and the list wasn't terminated, explicitly parse
                    // out a comma so we give a good error message.
                    parseExpected(92 /* comma */);
                    // If the token was a semicolon, and the caller allows that, then skip it and
                    // continue.  This ensures we get back on track and don't result in tons of
                    // parse errors.  For example, this can happen when people do things like use
                    // a semicolon to delimit object literal members.   Note: we'll have already
                    // reported an error when we called parseExpected above.
                    if (considerSemicolonAsDelimiter && token === 100 /* semicolon */ && !scanner.hasPrecedingLineBreak()) {
                        nextToken();
                    }
                    continue;
                }
                if (isListTerminator(kind)) {
                    break;
                }
                if (abortParsingListOrMoveToNextToken(kind)) {
                    break;
                }
            }
            // Recording the trailing comma is deliberately done after the previous
            // loop, and not just if we see a list terminator. This is because the list
            // may have ended incorrectly, but it is still important to know if there
            // was a trailing comma.
            // Check if the last token was a comma.
            if (commaStart >= 0) {
                // Always preserve a trailing comma by marking it on the NodeArray
                result.hasTrailingComma = true;
            }
            result.end = getNodeEnd();
            parsingContext = saveParsingContext;
            return result;
        }
        function createMissingList() {
            var pos = getNodePos();
            var result = [];
            result.pos = pos;
            result.end = pos;
            return result;
        }
        function parseBracketedList(kind, parseElement, open, close) {
            if (parseExpected(open)) {
                var result = parseDelimitedList(kind, parseElement);
                parseExpected(close);
                return result;
            }
            return createMissingList();
        }
        // The allowReservedWords parameter controls whether reserved words are permitted after the first dot
        function parseEntityName(allowReservedWords, diagnosticMessage) {
            var entity = parseIdentifier(diagnosticMessage);
            while (parseOptional(53 /* dot */)) {
                var node = createNode(285 /* QualifiedName */, entity.pos); // !!!
                node.left = entity;
                node.right = parseRightSideOfDot(allowReservedWords);
                entity = finishNode(node);
            }
            return entity;
        }
        function parseRightSideOfDot(allowIdentifierNames) {
            // Technically a keyword is valid here as all identifiers and keywords are identifier names.
            // However, often we'll encounter this in error situations when the identifier or keyword
            // is actually starting another valid construct.
            //
            // So, we check for the following specific case:
            //
            //      name.
            //      identifierOrKeyword identifierNameOrKeyword
            //
            // Note: the newlines are important here.  For example, if that above code
            // were rewritten into:
            //
            //      name.identifierOrKeyword
            //      identifierNameOrKeyword
            //
            // Then we would consider it valid.  That's because ASI would take effect and
            // the code would be implicitly: "name.identifierOrKeyword; identifierNameOrKeyword".
            // In the first case though, ASI will not take effect because there is not a
            // line terminator after the identifier or keyword.
            if (scanner.hasPrecedingLineBreak() && ts.tokenIsIdentifierOrKeyword(token)) {
                var matchesPattern = lookAhead(nextTokenIsIdentifierOrKeywordOnSameLine);
                if (matchesPattern) {
                    // Report that we need an identifier.  However, report it right after the dot,
                    // and not on the next token.  This is because the next token might actually
                    // be an identifier and the error would be quite confusing.
                    return createMissingNode(215 /* Identifier */, /*reportAtCurrentPosition*/ true, ts.Diagnostics.Identifier_expected);
                }
            }
            return allowIdentifierNames ? parseIdentifierName() : parseIdentifier();
        }
        function parseTemplateExpression() {
            var template = createNode(335 /* TemplateExpression */);
            template.head = parseTemplateLiteralFragment();
            ts.Debug.assert(template.head.kind === 158 /* TemplateHead */, "Template head has wrong token kind");
            var templateSpans = [];
            templateSpans.pos = getNodePos();
            do {
                templateSpans.push(parseTemplateSpan());
            } while (ts.lastOrUndefined(templateSpans).literal.kind === 159 /* TemplateMiddle */);
            templateSpans.end = getNodeEnd();
            template.templateSpans = templateSpans;
            return finishNode(template);
        }
        function parseTemplateSpan() {
            var span = createNode(343 /* TemplateSpan */);
            span.expression = allowInAnd(parseExpression);
            var literal;
            if (token === 98 /* closeBrace */) {
                reScanTemplateToken();
                literal = parseTemplateLiteralFragment();
            }
            else {
                literal = parseExpectedToken(160 /* TemplateTail */, /*reportAtCurrentPosition*/ false, ts.Diagnostics._0_expected, ts.tokenToString(98 /* closeBrace */));
            }
            span.literal = literal;
            return finishNode(span);
        }
        function parseStringLiteralTypeNode() {
            return parseLiteralLikeNode(312 /* StringLiteralType */, /*internName*/ true);
        }
        function parseLiteralNode(internName) {
            return parseLiteralLikeNode(token, internName);
        }
        function parseTemplateLiteralFragment() {
            return parseLiteralLikeNode(token, /*internName*/ false);
        }
        function parseLiteralLikeNode(kind, internName) {
            var node = createNode(kind);
            var text = scanner.getTokenValue();
            node.text = internName ? internIdentifier(text) : text;
            if (scanner.hasExtendedUnicodeEscape()) {
                node.hasExtendedUnicodeEscape = true;
            }
            if (scanner.isUnterminated()) {
                node.isUnterminated = true;
            }
            var tokenPos = scanner.getTokenPos();
            nextToken();
            finishNode(node);
            // Octal literals are not allowed in strict mode or ES5
            // Note that theoretically the following condition would hold true literals like 009,
            // which is not octal.But because of how the scanner separates the tokens, we would
            // never get a token like this. Instead, we would get 00 and 9 as two separate tokens.
            // We also do not need to check for negatives because any prefix operator would be part of a
            // parent unary expression.
            if (node.kind === 154 /* NumericLiteral */
                && sourceText.charCodeAt(tokenPos) === ts.CharCode.num0
                && ts.isOctalDigit(sourceText.charCodeAt(tokenPos + 1))) {
                node.isOctalLiteral = true;
            }
            return node;
        }
        // TYPES
        function parseTypeReference() {
            var typeName = parseEntityName(/*allowReservedWords*/ false, ts.Diagnostics.Type_expected);
            var node = createNode(301 /* TypeReference */, typeName.pos);
            node.typeName = typeName;
            if (!scanner.hasPrecedingLineBreak() && token === 49 /* lessThan */) {
                node.typeArguments = parseBracketedList(18 /* TypeArguments */, parseType, 49 /* lessThan */, 61 /* greaterThan */);
            }
            return finishNode(node);
        }
        function parseThisTypePredicate(lhs) {
            nextToken();
            var node = createNode(300 /* TypePredicate */, lhs.pos);
            node.parameterName = lhs;
            node.type = parseType();
            return finishNode(node);
        }
        function parseThisTypeNode() {
            var node = createNode(311 /* ThisType */);
            nextToken();
            return finishNode(node);
        }
        function parseTypeQuery() {
            var node = createNode(304 /* TypeQuery */);
            parseExpected(35 /* typeof */);
            node.exprName = parseEntityName(/*allowReservedWords*/ true);
            return finishNode(node);
        }
        function parseTypeParameter() {
            var node = createNode(287 /* TypeParameter */);
            node.name = parseIdentifier();
            if (parseOptional(131 /* extends */)) {
                // It's not uncommon for people to write improper constraints to a generic.  If the
                // user writes a constraint that is an expression and not an actual type, then parse
                // it out as an expression (so we can recover well), but report that a type is needed
                // instead.
                if (isStartOfType() || !isStartOfExpression()) {
                    node.constraint = parseType();
                }
                else {
                    // It was not a type, and it looked like an expression.  Parse out an expression
                    // here so we recover well.  Note: it is important that we call parseUnaryExpression
                    // and not parseExpression here.  If the user has:
                    //
                    //      <T extends "">
                    //
                    // We do *not* want to consume the  >  as we're consuming the expression for "".
                    node.expression = parseUnaryExpressionOrHigher();
                }
            }
            return finishNode(node);
        }
        function parseTypeParameters() {
            if (token === 49 /* lessThan */) {
                return parseBracketedList(17 /* TypeParameters */, parseTypeParameter, 49 /* lessThan */, 61 /* greaterThan */);
            }
        }
        function parseParameterType() {
            if (parseOptional(99 /* colon */)) {
                return parseType();
            }
            return undefined;
        }
        function isStartOfParameter() {
            return token === 51 /* dotDotDot */ || isIdentifierOrPattern() || ts.isModifier(token) || token === 40 /* at */ || token === 29 /* this */;
        }
        function setModifiers(node, modifiers) {
            if (modifiers) {
                node.flags |= modifiers.flags;
                node.modifiers = modifiers;
            }
        }
        function parseParameter() {
            var node = createNode(288 /* Parameter */);
            if (token === 29 /* this */) {
                node.name = createIdentifier(/*isIdentifier*/ true, undefined);
                node.type = parseParameterType();
                return finishNode(node);
            }
            node.decorators = parseDecorators();
            setModifiers(node, parseModifiers());
            node.dotDotDotToken = parseOptionalToken(51 /* dotDotDot */);
            // FormalParameter [Yield,Await]:
            //      BindingElement[?Yield,?Await]
            node.name = parseIdentifierOrPattern();
            if (ts.getFullWidth(node.name) === 0 && node.flags === 0 && ts.isModifier(token)) {
                // in cases like
                // 'use strict'
                // function foo(static)
                // isParameter('static') === true, because of isModifier('static')
                // however 'static' is not a legal identifier in a strict mode.
                // so result of this function will be ParameterDeclaration (flags = 0, name = missing, type = undefined, initializer = undefined)
                // and current token will not change => parsing of the enclosing parameter list will last till the end of time (or OOM)
                // to avoid this we'll advance cursor to the next token.
                nextToken();
            }
            node.questionToken = parseOptionalToken(91 /* question */);
            node.type = parseParameterType();
            node.initializer = parseBindingElementInitializer(/*inParameter*/ true);
            // Do not check for initializers in an ambient context for parameters. This is not
            // a grammar error because the grammar allows arbitrary call signatures in
            // an ambient context.
            // It is actually not necessary for this to be an error at all. The reason is that
            // function/constructor implementations are syntactically disallowed in ambient
            // contexts. In addition, parameter initializers are semantically disallowed in
            // overload signatures. So parameter initializers are transitively disallowed in
            // ambient contexts.
            return addJSDocComment(finishNode(node));
        }
        function parseBindingElementInitializer(inParameter) {
            return inParameter ? parseParameterInitializer() : parseNonParameterInitializer();
        }
        function parseParameterInitializer() {
            return parseInitializer(/*inParameter*/ true);
        }
        function fillSignature(returnToken, yieldContext, awaitContext, requireCompleteParameterList, signature) {
            var returnTokenRequired = returnToken === 50 /* equalsGreaterThan */;
            signature.typeParameters = parseTypeParameters();
            signature.parameters = parseParameterList(yieldContext, awaitContext, requireCompleteParameterList);
            if (returnTokenRequired) {
                parseExpected(returnToken);
                signature.type = parseTypeOrTypePredicate();
            }
            else if (parseOptional(returnToken)) {
                signature.type = parseTypeOrTypePredicate();
            }
        }
        function parseParameterList(yieldContext, awaitContext, requireCompleteParameterList) {
            // FormalParameters [Yield,Await]: (modified)
            //      [empty]
            //      FormalParameterList[?Yield,Await]
            //
            // FormalParameter[Yield,Await]: (modified)
            //      BindingElement[?Yield,Await]
            //
            // BindingElement [Yield,Await]: (modified)
            //      SingleNameBinding[?Yield,?Await]
            //      BindingPattern[?Yield,?Await]Initializer [In, ?Yield,?Await] opt
            //
            // SingleNameBinding [Yield,Await]:
            //      BindingIdentifier[?Yield,?Await]Initializer [In, ?Yield,?Await] opt
            if (parseExpected(42 /* openParen */)) {
                var savedYieldContext = inYieldContext();
                var savedAwaitContext = inAwaitContext();
                setYieldContext(yieldContext);
                setAwaitContext(awaitContext);
                var result = parseDelimitedList(16 /* Parameters */, parseParameter);
                setYieldContext(savedYieldContext);
                setAwaitContext(savedAwaitContext);
                if (!parseExpected(96 /* closeParen */) && requireCompleteParameterList) {
                    // Caller insisted that we had to end with a )   We didn't.  So just return
                    // undefined here.
                    return undefined;
                }
                return result;
            }
            // We didn't even have an open paren.  If the caller requires a complete parameter list,
            // we definitely can't provide that.  However, if they're ok with an incomplete one,
            // then just return an empty set of parameters.
            return requireCompleteParameterList ? undefined : createMissingList();
        }
        function parseTypeMemberSemicolon() {
            // We allow type members to be separated by commas or (possibly ASI) semicolons.
            // First check if it was a comma.  If so, we're done with the member.
            if (parseOptional(92 /* comma */)) {
                return;
            }
            // Didn't have a comma.  We must have a (possible ASI) semicolon.
            parseSemicolon();
        }
        function parseSignatureMember(kind) {
            var node = createNode(kind);
            if (kind === 298 /* ConstructSignature */) {
                parseExpected(33 /* new */);
            }
            fillSignature(99 /* colon */, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
            parseTypeMemberSemicolon();
            return finishNode(node);
        }
        function isIndexSignature() {
            if (token !== 43 /* openBracket */) {
                return false;
            }
            return lookAhead(isUnambiguouslyIndexSignature);
        }
        function isUnambiguouslyIndexSignature() {
            // The only allowed sequence is:
            //
            //   [id:
            //
            // However, for error recovery, we also check the following cases:
            //
            //   [...
            //   [id,
            //   [id?,
            //   [id?:
            //   [id?]
            //   [public id
            //   [private id
            //   [protected id
            //   []
            //
            nextToken();
            if (token === 51 /* dotDotDot */ || token === 97 /* closeBracket */) {
                return true;
            }
            if (ts.isModifier(token)) {
                nextToken();
                if (isIdentifier()) {
                    return true;
                }
            }
            else if (!isIdentifier()) {
                return false;
            }
            else {
                // Skip the identifier
                nextToken();
            }
            // A colon signifies a well formed indexer
            // A comma should be a badly formed indexer because comma expressions are not allowed
            // in computed properties.
            if (token === 99 /* colon */ || token === 92 /* comma */) {
                return true;
            }
            // Question mark could be an indexer with an optional property,
            // or it could be a conditional expression in a computed property.
            if (token !== 91 /* question */) {
                return false;
            }
            // If any of the following tokens are after the question mark, it cannot
            // be a conditional expression, so treat it as an indexer.
            nextToken();
            return token === 99 /* colon */ || token === 92 /* comma */ || token === 97 /* closeBracket */;
        }
        function parseIndexSignatureDeclaration(fullStart, decorators, modifiers) {
            var node = createNode(299 /* IndexSignature */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            node.parameters = parseBracketedList(16 /* Parameters */, parseParameter, 43 /* openBracket */, 97 /* closeBracket */);
            node.type = parseTypeAnnotation();
            parseTypeMemberSemicolon();
            return finishNode(node);
        }
        function parsePropertyOrMethodSignature(fullStart, modifiers) {
            var name = parsePropertyName();
            var questionToken = parseOptionalToken(91 /* question */);
            if (token === 42 /* openParen */ || token === 49 /* lessThan */) {
                var method = createNode(292 /* MethodSignature */, fullStart);
                setModifiers(method, modifiers);
                method.name = name;
                method.questionToken = questionToken;
                // Method signatures don't exist in expression contexts.  So they have neither
                // [Yield] nor [Await]
                fillSignature(99 /* colon */, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, method);
                parseTypeMemberSemicolon();
                return finishNode(method);
            }
            else {
                var property = createNode(290 /* PropertySignature */, fullStart);
                setModifiers(property, modifiers);
                property.name = name;
                property.questionToken = questionToken;
                property.type = parseTypeAnnotation();
                if (token === 77 /* equals */) {
                    // Although type literal properties cannot not have initializers, we attempt
                    // to parse an initializer so we can report in the checker that an interface
                    // property or type literal property cannot have an initializer.
                    property.initializer = parseNonParameterInitializer();
                }
                parseTypeMemberSemicolon();
                return finishNode(property);
            }
        }
        function isTypeMemberStart() {
            var idToken;
            // Return true if we have the start of a signature member
            if (token === 42 /* openParen */ || token === 49 /* lessThan */) {
                return true;
            }
            // Eat up all modifiers, but hold on to the last one in case it is actually an identifier
            while (ts.isModifier(token)) {
                idToken = token;
                nextToken();
            }
            // Index signatures and computed property names are type members
            if (token === 43 /* openBracket */) {
                return true;
            }
            // Try to get the first property-like token following all modifiers
            if (isLiteralPropertyName()) {
                idToken = token;
                nextToken();
            }
            // If we were able to get any potential identifier, check that it is
            // the start of a member declaration
            if (idToken) {
                return token === 42 /* openParen */ ||
                    token === 49 /* lessThan */ ||
                    token === 91 /* question */ ||
                    token === 99 /* colon */ ||
                    canParseSemicolon();
            }
            return false;
        }
        function parseTypeMember() {
            if (token === 42 /* openParen */ || token === 49 /* lessThan */) {
                return parseSignatureMember(297 /* CallSignature */);
            }
            if (token === 33 /* new */ && lookAhead(isStartOfConstructSignature)) {
                return parseSignatureMember(298 /* ConstructSignature */);
            }
            var fullStart = getNodePos();
            var modifiers = parseModifiers();
            if (isIndexSignature()) {
                return parseIndexSignatureDeclaration(fullStart, /*decorators*/ undefined, modifiers);
            }
            return parsePropertyOrMethodSignature(fullStart, modifiers);
        }
        function isStartOfConstructSignature() {
            nextToken();
            return token === 42 /* openParen */ || token === 49 /* lessThan */;
        }
        function parseTypeLiteral() {
            var node = createNode(305 /* TypeLiteral */);
            node.members = parseObjectTypeMembers();
            return finishNode(node);
        }
        function parseObjectTypeMembers() {
            var members;
            if (parseExpected(31 /* openBrace */)) {
                members = parseList(4 /* TypeMembers */, parseTypeMember);
                parseExpected(98 /* closeBrace */);
            }
            else {
                members = createMissingList();
            }
            return members;
        }
        function parseTupleType() {
            var node = createNode(307 /* TupleType */);
            node.elements = parseBracketedList(19 /* TupleElementTypes */, parseType, 43 /* openBracket */, 97 /* closeBracket */);
            return finishNode(node);
        }
        function parseParenthesizedType() {
            var node = createNode(310 /* ParenthesizedType */);
            parseExpected(42 /* openParen */);
            node.type = parseType();
            parseExpected(96 /* closeParen */);
            return finishNode(node);
        }
        function parseFunctionOrConstructorType(kind) {
            var node = createNode(kind);
            if (kind === 303 /* ConstructorType */) {
                parseExpected(33 /* new */);
            }
            fillSignature(50 /* equalsGreaterThan */, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
            return finishNode(node);
        }
        function parseKeywordAndNoDot() {
            var node = parseTokenNode();
            return token === 53 /* dot */ ? undefined : node;
        }
        function parseNonArrayType() {
            switch (token) {
                case 141 /* any */:
                case 144 /* string */:
                case 143 /* number */:
                case 142 /* boolean */:
                case 145 /* symbol */:
                case 137 /* undefined */:
                case 146 /* never */:
                    // If these are followed by a dot, then parse these out as a dotted type reference instead.
                    var node = tryParse(parseKeywordAndNoDot);
                    return node || parseTypeReference();
                case 155 /* StringLiteral */:
                    return parseStringLiteralTypeNode();
                case 36 /* void */:
                case 26 /* null */:
                    return parseTokenNode();
                case 29 /* this */: {
                    var thisKeyword = parseThisTypeNode();
                    if (token === 94 /* is */ && !scanner.hasPrecedingLineBreak()) {
                        return parseThisTypePredicate(thisKeyword);
                    }
                    else {
                        return thisKeyword;
                    }
                }
                case 35 /* typeof */:
                    return parseTypeQuery();
                case 31 /* openBrace */:
                    return parseTypeLiteral();
                case 43 /* openBracket */:
                    return parseTupleType();
                case 42 /* openParen */:
                    return parseParenthesizedType();
                default:
                    return parseTypeReference();
            }
        }
        function isStartOfType() {
            switch (token) {
                case 141 /* any */:
                case 144 /* string */:
                case 143 /* number */:
                case 142 /* boolean */:
                case 145 /* symbol */:
                case 36 /* void */:
                case 137 /* undefined */:
                case 26 /* null */:
                case 29 /* this */:
                case 35 /* typeof */:
                case 146 /* never */:
                case 31 /* openBrace */:
                case 43 /* openBracket */:
                case 49 /* lessThan */:
                case 33 /* new */:
                case 155 /* StringLiteral */:
                    return true;
                case 42 /* openParen */:
                    // Only consider '(' the start of a type if followed by ')', '...', an identifier, a modifier,
                    // or something that starts a type. We don't want to consider things like '(1)' a type.
                    return lookAhead(isStartOfParenthesizedOrFunctionType);
                default:
                    return isIdentifier();
            }
        }
        function isStartOfParenthesizedOrFunctionType() {
            nextToken();
            return token === 96 /* closeParen */ || isStartOfParameter() || isStartOfType();
        }
        function parseArrayTypeOrHigher() {
            var type = parseNonArrayType();
            while (!scanner.hasPrecedingLineBreak() && parseOptional(43 /* openBracket */)) {
                parseExpected(97 /* closeBracket */);
                var node = createNode(306 /* ArrayType */, type.pos);
                node.elementType = type;
                type = finishNode(node);
            }
            return type;
        }
        function parseUnionOrIntersectionType(kind, parseConstituentType, operator) {
            var type = parseConstituentType();
            if (token === operator) {
                var types = [type];
                types.pos = type.pos;
                while (parseOptional(operator)) {
                    types.push(parseConstituentType());
                }
                types.end = getNodeEnd();
                var node = createNode(kind, type.pos);
                node.types = types;
                type = finishNode(node);
            }
            return type;
        }
        function parseIntersectionTypeOrHigher() {
            return parseUnionOrIntersectionType(309 /* IntersectionType */, parseArrayTypeOrHigher, 57 /* ampersand */);
        }
        function parseUnionTypeOrHigher() {
            return parseUnionOrIntersectionType(308 /* UnionType */, parseIntersectionTypeOrHigher, 71 /* bar */);
        }
        function isStartOfFunctionType() {
            if (token === 49 /* lessThan */) {
                return true;
            }
            return token === 42 /* openParen */ && lookAhead(isUnambiguouslyStartOfFunctionType);
        }
        function skipParameterStart() {
            if (ts.isModifier(token)) {
                // Skip modifiers
                parseModifiers();
            }
            if (isIdentifier() || token === 29 /* this */) {
                nextToken();
                return true;
            }
            if (token === 43 /* openBracket */ || token === 31 /* openBrace */) {
                // Return true if we can parse an array or object binding pattern with no errors
                var previousErrorCount = parseDiagnostics.length;
                parseIdentifierOrPattern();
                return previousErrorCount === parseDiagnostics.length;
            }
            return false;
        }
        function isUnambiguouslyStartOfFunctionType() {
            nextToken();
            if (token === 96 /* closeParen */ || token === 51 /* dotDotDot */) {
                // ( )
                // ( ...
                return true;
            }
            if (skipParameterStart()) {
                // We successfully skipped modifiers (if any) and an identifier or binding pattern,
                // now see if we have something that indicates a parameter declaration
                if (token === 99 /* colon */ || token === 92 /* comma */ ||
                    token === 91 /* question */ || token === 77 /* equals */) {
                    // ( xxx :
                    // ( xxx ,
                    // ( xxx ?
                    // ( xxx =
                    return true;
                }
                if (token === 96 /* closeParen */) {
                    nextToken();
                    if (token === 50 /* equalsGreaterThan */) {
                        // ( xxx ) =>
                        return true;
                    }
                }
            }
            return false;
        }
        function parseTypeOrTypePredicate() {
            var typePredicateVariable = isIdentifier() && tryParse(parseTypePredicatePrefix);
            var type = parseType();
            if (typePredicateVariable) {
                var node = createNode(300 /* TypePredicate */, typePredicateVariable.pos);
                node.parameterName = typePredicateVariable;
                node.type = type;
                return finishNode(node);
            }
            else {
                return type;
            }
        }
        function parseTypePredicatePrefix() {
            var id = parseIdentifier();
            if (token === 94 /* is */ && !scanner.hasPrecedingLineBreak()) {
                nextToken();
                return id;
            }
        }
        function parseType() {
            // The rules about 'yield' only apply to actual code/expression contexts.  They don't
            // apply to 'type' contexts.  So we disable these parameters here before moving on.
            return doOutsideOfContext(41943040 /* TypeExcludesFlags */, parseTypeWorker);
        }
        function parseTypeWorker() {
            if (isStartOfFunctionType()) {
                return parseFunctionOrConstructorType(302 /* FunctionType */);
            }
            if (token === 33 /* new */) {
                return parseFunctionOrConstructorType(303 /* ConstructorType */);
            }
            return parseUnionTypeOrHigher();
        }
        function parseTypeAnnotation() {
            return parseOptional(99 /* colon */) ? parseType() : undefined;
        }
        // EXPRESSIONS
        function isStartOfLeftHandSideExpression() {
            switch (token) {
                case 29 /* this */:
                case 30 /* super */:
                case 26 /* null */:
                case 27 /* true */:
                case 28 /* false */:
                case 154 /* NumericLiteral */:
                case 155 /* StringLiteral */:
                case 157 /* NoSubstitutionTemplateLiteral */:
                case 158 /* TemplateHead */:
                case 42 /* openParen */:
                case 43 /* openBracket */:
                case 31 /* openBrace */:
                case 18 /* function */:
                case 17 /* class */:
                case 33 /* new */:
                case 46 /* slash */:
                case 81 /* slashEquals */:
                case 215 /* Identifier */:
                    return true;
                default:
                    return isIdentifier();
            }
        }
        function isStartOfExpression() {
            if (isStartOfLeftHandSideExpression()) {
                return true;
            }
            switch (token) {
                case 44 /* plus */:
                case 45 /* minus */:
                case 37 /* tilde */:
                case 32 /* exclamation */:
                case 34 /* delete */:
                case 35 /* typeof */:
                case 36 /* void */:
                case 47 /* plusPlus */:
                case 48 /* minusMinus */:
                case 49 /* lessThan */:
                case 39 /* await */:
                case 38 /* yield */:
                    // Yield/await always starts an expression.  Either it is an identifier (in which case
                    // it is definitely an expression).  Or it's a keyword (either because we're in
                    // a generator or async function, or in strict mode (or both)) and it started a yield or await expression.
                    return true;
                default:
                    // Error tolerance.  If we see the start of some binary operator, we consider
                    // that the start of an expression.  That way we'll parse out a missing identifier,
                    // give a good message about an identifier being missing, and then consume the
                    // rest of the binary expression.
                    if (isBinaryOperator()) {
                        return true;
                    }
                    return isIdentifier();
            }
        }
        function isStartOfExpressionStatement() {
            // As per the grammar, none of '{' or 'function' or 'class' can start an expression statement.
            return token !== 31 /* openBrace */ &&
                token !== 18 /* function */ &&
                token !== 17 /* class */ &&
                token !== 40 /* at */ &&
                isStartOfExpression();
        }
        function parseExpression() {
            // Expression[in]:
            //      AssignmentExpression[in]
            //      Expression[in] , AssignmentExpression[in]
            // clear the decorator context when parsing Expression, as it should be unambiguous when parsing a decorator
            var saveDecoratorContext = inDecoratorContext();
            if (saveDecoratorContext) {
                setDecoratorContext(/*val*/ false);
            }
            var expr = parseAssignmentExpressionOrHigher();
            var operatorToken;
            while ((operatorToken = parseOptionalToken(92 /* comma */))) {
                expr = makeBinaryExpression(expr, operatorToken, parseAssignmentExpressionOrHigher());
            }
            if (saveDecoratorContext) {
                setDecoratorContext(/*val*/ true);
            }
            return expr;
        }
        function parseInitializer(inParameter) {
            if (token !== 77 /* equals */) {
                // It's not uncommon during typing for the user to miss writing the '=' token.  Check if
                // there is no newline after the last token and if we're on an expression.  If so, parse
                // this as an equals-value clause with a missing equals.
                // NOTE: There are two places where we allow equals-value clauses.  The first is in a
                // variable declarator.  The second is with a parameter.  For variable declarators
                // it's more likely that a { would be a allowed (as an object literal).  While this
                // is also allowed for parameters, the risk is that we consume the { as an object
                // literal when it really will be for the block following the parameter.
                if (scanner.hasPrecedingLineBreak() || (inParameter && token === 31 /* openBrace */) || !isStartOfExpression()) {
                    // preceding line break, open brace in a parameter (likely a function body) or current token is not an expression -
                    // do not try to parse initializer
                    return undefined;
                }
            }
            // Initializer[In, Yield] :
            //     = AssignmentExpression[?In, ?Yield]
            parseExpected(77 /* equals */);
            return parseAssignmentExpressionOrHigher();
        }
        function parseAssignmentExpressionOrHigher() {
            //  AssignmentExpression[in,yield]:
            //      1) ConditionalExpression[?in,?yield]
            //      2) LeftHandSideExpression = AssignmentExpression[?in,?yield]
            //      3) LeftHandSideExpression AssignmentOperator AssignmentExpression[?in,?yield]
            //      4) ArrowFunctionExpression[?in,?yield]
            //      5) AsyncArrowFunctionExpression[in,yield,await]
            //      6) [+Yield] YieldExpression[?In]
            //
            // Note: for ease of implementation we treat productions '2' and '3' as the same thing.
            // (i.e. they're both BinaryExpressions with an assignment operator in it).
            // First, do the simple check if we have a YieldExpression (production '5').
            if (isYieldExpression()) {
                return parseYieldExpression();
            }
            // Then, check if we have an arrow function (production '4' and '5') that starts with a parenthesized
            // parameter list or is an async arrow function.
            // AsyncArrowFunctionExpression:
            //      1) async[no LineTerminator here]AsyncArrowBindingIdentifier[?Yield][no LineTerminator here]=>AsyncConciseBody[?In]
            //      2) CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await][no LineTerminator here]=>AsyncConciseBody[?In]
            // Production (1) of AsyncArrowFunctionExpression is parsed in "tryParseAsyncSimpleArrowFunctionExpression".
            // And production (2) is parsed in "tryParseParenthesizedArrowFunctionExpression".
            //
            // If we do successfully parse arrow-function, we must *not* recurse for productions 1, 2 or 3. An ArrowFunction is
            // not a  LeftHandSideExpression, nor does it start a ConditionalExpression.  So we are done
            // with AssignmentExpression if we see one.
            var arrowExpression = tryParseParenthesizedArrowFunctionExpression() || tryParseAsyncSimpleArrowFunctionExpression();
            if (arrowExpression) {
                return arrowExpression;
            }
            // Now try to see if we're in production '1', '2' or '3'.  A conditional expression can
            // start with a LogicalOrExpression, while the assignment productions can only start with
            // LeftHandSideExpressions.
            //
            // So, first, we try to just parse out a BinaryExpression.  If we get something that is a
            // LeftHandSide or higher, then we can try to parse out the assignment expression part.
            // Otherwise, we try to parse out the conditional expression bit.  We want to allow any
            // binary expression here, so we pass in the 'lowest' precedence here so that it matches
            // and consumes anything.
            var expr = parseBinaryExpressionOrHigher(/*precedence*/ 0);
            // To avoid a look-ahead, we did not handle the case of an arrow function with a single un-parenthesized
            // parameter ('x => ...') above. We handle it here by checking if the parsed expression was a single
            // identifier and the current token is an arrow.
            if (expr.kind === 215 /* Identifier */ && token === 50 /* equalsGreaterThan */) {
                return parseSimpleArrowFunctionExpression(expr);
            }
            // Now see if we might be in cases '2' or '3'.
            // If the expression was a LHS expression, and we have an assignment operator, then
            // we're in '2' or '3'. Consume the assignment and return.
            //
            // Note: we call reScanGreaterToken so that we get an appropriately merged token
            // for cases like > > =  becoming >>=
            if (ts.isLeftHandSideExpression(expr) && ts.isAssignmentOperator(reScanGreaterToken())) {
                return makeBinaryExpression(expr, parseTokenNode(), parseAssignmentExpressionOrHigher());
            }
            // It wasn't an assignment or a lambda.  This is a conditional expression:
            return parseConditionalExpressionRest(expr);
        }
        function isYieldExpression() {
            if (token === 38 /* yield */) {
                // If we have a 'yield' keyword, and this is a context where yield expressions are
                // allowed, then definitely parse out a yield expression.
                if (inYieldContext()) {
                    return true;
                }
                // We're in a context where 'yield expr' is not allowed.  However, if we can
                // definitely tell that the user was trying to parse a 'yield expr' and not
                // just a normal expr that start with a 'yield' identifier, then parse out
                // a 'yield expr'.  We can then report an error later that they are only
                // allowed in generator expressions.
                //
                // for example, if we see 'yield(foo)', then we'll have to treat that as an
                // invocation expression of something called 'yield'.  However, if we have
                // 'yield foo' then that is not legal as a normal expression, so we can
                // definitely recognize this as a yield expression.
                //
                // for now we just check if the next token is an identifier.  More heuristics
                // can be added here later as necessary.  We just need to make sure that we
                // don't accidentally consume something legal.
                return lookAhead(nextTokenIsIdentifierOrKeywordOrNumberOnSameLine);
            }
            return false;
        }
        function nextTokenIsIdentifierOnSameLine() {
            nextToken();
            return !scanner.hasPrecedingLineBreak() && isIdentifier();
        }
        function parseYieldExpression() {
            var node = createNode(336 /* YieldExpression */);
            // YieldExpression[In] :
            //      yield
            //      yield [no LineTerminator here] [Lexical goal InputElementRegExp]AssignmentExpression[?In, Yield]
            //      yield [no LineTerminator here] * [Lexical goal InputElementRegExp]AssignmentExpression[?In, Yield]
            nextToken();
            if (!scanner.hasPrecedingLineBreak() &&
                (token === 56 /* asterisk */ || isStartOfExpression())) {
                node.asteriskToken = parseOptionalToken(56 /* asterisk */);
                node.expression = parseAssignmentExpressionOrHigher();
                return finishNode(node);
            }
            else {
                // if the next token is not on the same line as yield.  or we don't have an '*' or
                // the start of an expression, then this is just a simple "yield" expression.
                return finishNode(node);
            }
        }
        function parseSimpleArrowFunctionExpression(identifier, asyncModifier) {
            ts.Debug.assert(token === 50 /* equalsGreaterThan */, "parseSimpleArrowFunctionExpression should only have been called if we had a =>");
            var node;
            if (asyncModifier) {
                node = createNode(326 /* ArrowFunction */, asyncModifier.pos);
                setModifiers(node, asyncModifier);
            }
            else {
                node = createNode(326 /* ArrowFunction */, identifier.pos);
            }
            var parameter = createNode(288 /* Parameter */, identifier.pos);
            parameter.name = identifier;
            finishNode(parameter);
            node.parameters = [parameter];
            node.parameters.pos = parameter.pos;
            node.parameters.end = parameter.end;
            node.equalsGreaterThanToken = parseExpectedToken(50 /* equalsGreaterThan */, /*reportAtCurrentPosition*/ false, ts.Diagnostics._0_expected, "=>");
            node.body = parseArrowFunctionExpressionBody(/*isAsync*/ !!asyncModifier);
            return finishNode(node);
        }
        function tryParseParenthesizedArrowFunctionExpression() {
            var triState = isParenthesizedArrowFunctionExpression();
            if (triState === 0 /* False */) {
                // It's definitely not a parenthesized arrow function expression.
                return undefined;
            }
            // If we definitely have an arrow function, then we can just parse one, not requiring a
            // following => or { token. Otherwise, we *might* have an arrow function.  Try to parse
            // it out, but don't allow any ambiguity, and return 'undefined' if this could be an
            // expression instead.
            var arrowFunction = triState === 1 /* True */
                ? parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ true)
                : tryParse(parsePossibleParenthesizedArrowFunctionExpressionHead);
            if (!arrowFunction) {
                // Didn't appear to actually be a parenthesized arrow function.  Just bail out.
                return undefined;
            }
            var isAsync = !!(arrowFunction.flags & 256 /* Async */);
            // If we have an arrow, then try to parse the body. Even if not, try to parse if we
            // have an opening brace, just in case we're in an error state.
            var lastToken = token;
            arrowFunction.equalsGreaterThanToken = parseExpectedToken(50 /* equalsGreaterThan */, /*reportAtCurrentPosition*/ false, ts.Diagnostics._0_expected, "=>");
            arrowFunction.body = (lastToken === 50 /* equalsGreaterThan */ || lastToken === 31 /* openBrace */)
                ? parseArrowFunctionExpressionBody(isAsync)
                : parseIdentifier();
            return finishNode(arrowFunction);
        }
        //  True        -> We definitely expect a parenthesized arrow function here.
        //  False       -> There *cannot* be a parenthesized arrow function here.
        //  Unknown     -> There *might* be a parenthesized arrow function here.
        //                 Speculatively look ahead to be sure, and rollback if not.
        function isParenthesizedArrowFunctionExpression() {
            if (token === 42 /* openParen */ || token === 49 /* lessThan */ || token === 5 /* async */) {
                return lookAhead(isParenthesizedArrowFunctionExpressionWorker);
            }
            if (token === 50 /* equalsGreaterThan */) {
                // ERROR RECOVERY TWEAK:
                // If we see a standalone => try to parse it as an arrow function expression as that's
                // likely what the user intended to write.
                return 1 /* True */;
            }
            // Definitely not a parenthesized arrow function.
            return 0 /* False */;
        }
        function isParenthesizedArrowFunctionExpressionWorker() {
            if (token === 5 /* async */) {
                nextToken();
                if (scanner.hasPrecedingLineBreak()) {
                    return 0 /* False */;
                }
                if (token !== 42 /* openParen */ && token !== 49 /* lessThan */) {
                    return 0 /* False */;
                }
            }
            var first = token;
            var second = nextToken();
            if (first === 42 /* openParen */) {
                if (second === 96 /* closeParen */) {
                    // Simple cases: "() =>", "(): ", and  "() {".
                    // This is an arrow function with no parameters.
                    // The last one is not actually an arrow function,
                    // but this is probably what the user intended.
                    var third = nextToken();
                    switch (third) {
                        case 50 /* equalsGreaterThan */:
                        case 99 /* colon */:
                        case 31 /* openBrace */:
                            return 1 /* True */;
                        default:
                            return 0 /* False */;
                    }
                }
                // If encounter "([" or "({", this could be the start of a binding pattern.
                // Examples:
                //      ([ x ]) => { }
                //      ({ x }) => { }
                //      ([ x ])
                //      ({ x })
                if (second === 43 /* openBracket */ || second === 31 /* openBrace */) {
                    return 2 /* Unknown */;
                }
                // Simple case: "(..."
                // This is an arrow function with a rest parameter.
                if (second === 51 /* dotDotDot */) {
                    return 1 /* True */;
                }
                // If we had "(" followed by something that's not an identifier,
                // then this definitely doesn't look like a lambda.
                // Note: we could be a little more lenient and allow
                // "(public" or "(private". These would not ever actually be allowed,
                // but we could provide a good error message instead of bailing out.
                if (!isIdentifier()) {
                    return 0 /* False */;
                }
                // If we have something like "(a:", then we must have a
                // type-annotated parameter in an arrow function expression.
                if (nextToken() === 99 /* colon */) {
                    return 1 /* True */;
                }
                // This *could* be a parenthesized arrow function.
                // Return Unknown to let the caller know.
                return 2 /* Unknown */;
            }
            else {
                ts.Debug.assert(first === 49 /* lessThan */);
                // If we have "<" not followed by an identifier,
                // then this definitely is not an arrow function.
                if (!isIdentifier()) {
                    return 0 /* False */;
                }
                // JSX overrides
                if (sourceFile.languageVariant === 1 /* JSX */) {
                    var isArrowFunctionInJsx = lookAhead(function () {
                        var third = nextToken();
                        if (third === 131 /* extends */) {
                            var fourth = nextToken();
                            switch (fourth) {
                                case 77 /* equals */:
                                case 61 /* greaterThan */:
                                    return false;
                                default:
                                    return true;
                            }
                        }
                        else if (third === 92 /* comma */) {
                            return true;
                        }
                        return false;
                    });
                    if (isArrowFunctionInJsx) {
                        return 1 /* True */;
                    }
                    return 0 /* False */;
                }
                // This *could* be a parenthesized arrow function.
                return 2 /* Unknown */;
            }
        }
        function parsePossibleParenthesizedArrowFunctionExpressionHead() {
            return parseParenthesizedArrowFunctionExpressionHead(/*allowAmbiguity*/ false);
        }
        function tryParseAsyncSimpleArrowFunctionExpression() {
            // We do a check here so that we won't be doing unnecessarily call to "lookAhead"
            if (token === 5 /* async */) {
                var isUnParenthesizedAsyncArrowFunction = lookAhead(isUnParenthesizedAsyncArrowFunctionWorker);
                if (isUnParenthesizedAsyncArrowFunction === 1 /* True */) {
                    var asyncModifier = parseModifiersForArrowFunction();
                    var expr = parseBinaryExpressionOrHigher(/*precedence*/ 0);
                    return parseSimpleArrowFunctionExpression(expr, asyncModifier);
                }
            }
            return undefined;
        }
        function isUnParenthesizedAsyncArrowFunctionWorker() {
            // AsyncArrowFunctionExpression:
            //      1) async[no LineTerminator here]AsyncArrowBindingIdentifier[?Yield][no LineTerminator here]=>AsyncConciseBody[?In]
            //      2) CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await][no LineTerminator here]=>AsyncConciseBody[?In]
            if (token === 5 /* async */) {
                nextToken();
                // If the "async" is followed by "=>" token then it is not a begining of an async arrow-function
                // but instead a simple arrow-function which will be parsed inside "parseAssignmentExpressionOrHigher"
                if (scanner.hasPrecedingLineBreak() || token === 50 /* equalsGreaterThan */) {
                    return 0 /* False */;
                }
                // Check for un-parenthesized AsyncArrowFunction
                var expr = parseBinaryExpressionOrHigher(/*precedence*/ 0);
                if (!scanner.hasPrecedingLineBreak() && expr.kind === 215 /* Identifier */ && token === 50 /* equalsGreaterThan */) {
                    return 1 /* True */;
                }
            }
            return 0 /* False */;
        }
        function parseParenthesizedArrowFunctionExpressionHead(allowAmbiguity) {
            var node = createNode(326 /* ArrowFunction */);
            setModifiers(node, parseModifiersForArrowFunction());
            var isAsync = !!(node.flags & 256 /* Async */);
            // Arrow functions are never generators.
            //
            // If we're speculatively parsing a signature for a parenthesized arrow function, then
            // we have to have a complete parameter list.  Otherwise we might see something like
            // a => (b => c)
            // And think that "(b =>" was actually a parenthesized arrow function with a missing
            // close paren.
            fillSignature(99 /* colon */, /*yieldContext*/ false, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ !allowAmbiguity, node);
            // If we couldn't get parameters, we definitely could not parse out an arrow function.
            if (!node.parameters) {
                return undefined;
            }
            // Parsing a signature isn't enough.
            // Parenthesized arrow signatures often look like other valid expressions.
            // For instance:
            //  - "(x = 10)" is an assignment expression parsed as a signature with a default parameter value.
            //  - "(x,y)" is a comma expression parsed as a signature with two parameters.
            //  - "a ? (b): c" will have "(b):" parsed as a signature with a return type annotation.
            //
            // So we need just a bit of lookahead to ensure that it can only be a signature.
            if (!allowAmbiguity && token !== 50 /* equalsGreaterThan */ && token !== 31 /* openBrace */) {
                // Returning undefined here will cause our caller to rewind to where we started from.
                return undefined;
            }
            return node;
        }
        function parseArrowFunctionExpressionBody(isAsync) {
            if (token === 31 /* openBrace */) {
                return parseFunctionBlock(/*allowYield*/ false, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);
            }
            if (token !== 100 /* semicolon */ &&
                token !== 18 /* function */ &&
                token !== 17 /* class */ &&
                isStartOfStatement() &&
                !isStartOfExpressionStatement()) {
                // Check if we got a plain statement (i.e. no expression-statements, no function/class expressions/declarations)
                //
                // Here we try to recover from a potential error situation in the case where the
                // user meant to supply a block. For example, if the user wrote:
                //
                //  a =>
                //      let v = 0;
                //  }
                //
                // they may be missing an open brace.  Check to see if that's the case so we can
                // try to recover better.  If we don't do this, then the next close curly we see may end
                // up preemptively closing the containing construct.
                //
                // Note: even when 'ignoreMissingOpenBrace' is passed as true, parseBody will still error.
                return parseFunctionBlock(/*allowYield*/ false, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ true);
            }
            return isAsync
                ? doInAwaitContext(parseAssignmentExpressionOrHigher)
                : doOutsideOfAwaitContext(parseAssignmentExpressionOrHigher);
        }
        function parseConditionalExpressionRest(leftOperand) {
            // Note: we are passed in an expression which was produced from parseBinaryExpressionOrHigher.
            var questionToken = parseOptionalToken(91 /* question */);
            if (!questionToken) {
                return leftOperand;
            }
            // Note: we explicitly 'allowIn' in the whenTrue part of the condition expression, and
            // we do not that for the 'whenFalse' part.
            var node = createNode(334 /* ConditionalExpression */, leftOperand.pos);
            node.condition = leftOperand;
            node.questionToken = questionToken;
            node.whenTrue = doOutsideOfContext(disallowInAndDecoratorContext, parseAssignmentExpressionOrHigher);
            node.colonToken = parseExpectedToken(99 /* colon */, /*reportAtCurrentPosition*/ false, ts.Diagnostics._0_expected, ts.tokenToString(99 /* colon */));
            node.whenFalse = parseAssignmentExpressionOrHigher();
            return finishNode(node);
        }
        function parseBinaryExpressionOrHigher(precedence) {
            var leftOperand = parseUnaryExpressionOrHigher();
            return parseBinaryExpressionRest(precedence, leftOperand);
        }
        function isInOrOfKeyword(t) {
            return t === 58 /* in */ || t === 133 /* of */;
        }
        function parseBinaryExpressionRest(precedence, leftOperand) {
            while (true) {
                // We either have a binary operator here, or we're finished.  We call
                // reScanGreaterToken so that we merge token sequences like > and = into >=
                reScanGreaterToken();
                var newPrecedence = getBinaryOperatorPrecedence();
                // Check the precedence to see if we should "take" this operator
                // - For left associative operator (all operator but **), consume the operator,
                //   recursively call the function below, and parse binaryExpression as a rightOperand
                //   of the caller if the new precedence of the operator is greater then or equal to the current precedence.
                //   For example:
                //      a - b - c;
                //            ^token; leftOperand = b. Return b to the caller as a rightOperand
                //      a * b - c
                //            ^token; leftOperand = b. Return b to the caller as a rightOperand
                //      a - b * c;
                //            ^token; leftOperand = b. Return b * c to the caller as a rightOperand
                // - For right associative operator (**), consume the operator, recursively call the function
                //   and parse binaryExpression as a rightOperand of the caller if the new precedence of
                //   the operator is strictly grater than the current precedence
                //   For example:
                //      a ** b ** c;
                //             ^^token; leftOperand = b. Return b ** c to the caller as a rightOperand
                //      a - b ** c;
                //            ^^token; leftOperand = b. Return b ** c to the caller as a rightOperand
                //      a ** b - c
                //             ^token; leftOperand = b. Return b to the caller as a rightOperand
                var consumeCurrentOperator = token === 75 /* asteriskAsterisk */ ?
                    newPrecedence >= precedence :
                    newPrecedence > precedence;
                if (!consumeCurrentOperator) {
                    break;
                }
                if (token === 58 /* in */ && inDisallowInContext()) {
                    break;
                }
                if (token === 93 /* as */) {
                    // Make sure we *do* perform ASI for constructs like this:
                    //    var x = foo
                    //    as (Bar)
                    // This should be parsed as an initialized variable, followed
                    // by a function call to 'as' with the argument 'Bar'
                    if (scanner.hasPrecedingLineBreak()) {
                        break;
                    }
                    else {
                        nextToken();
                        leftOperand = makeAsExpression(leftOperand, parseType());
                    }
                }
                else {
                    leftOperand = makeBinaryExpression(leftOperand, parseTokenNode(), parseBinaryExpressionOrHigher(newPrecedence));
                }
            }
            return leftOperand;
        }
        function isBinaryOperator() {
            if (inDisallowInContext() && token === 58 /* in */) {
                return false;
            }
            return getBinaryOperatorPrecedence() > 0;
        }
        function makeBinaryExpression(left, operatorToken, right) {
            var node = createNode(333 /* BinaryExpression */, left.pos);
            node.left = left;
            node.operatorToken = operatorToken;
            node.right = right;
            return finishNode(node);
        }
        function makeAsExpression(left, right) {
            var node = createNode(341 /* AsExpression */, left.pos);
            node.expression = left;
            node.type = right;
            return finishNode(node);
        }
        function parsePrefixUnaryExpression() {
            var node = createNode(331 /* PrefixUnaryExpression */);
            node.operator = token;
            nextToken();
            node.operand = parseSimpleUnaryExpression();
            return finishNode(node);
        }
        function parseDeleteExpression() {
            var node = createNode(327 /* DeleteExpression */);
            nextToken();
            node.expression = parseSimpleUnaryExpression();
            return finishNode(node);
        }
        function parseTypeOfExpression() {
            var node = createNode(328 /* TypeOfExpression */);
            nextToken();
            node.expression = parseSimpleUnaryExpression();
            return finishNode(node);
        }
        function parseVoidExpression() {
            var node = createNode(329 /* VoidExpression */);
            nextToken();
            node.expression = parseSimpleUnaryExpression();
            return finishNode(node);
        }
        function isAwaitExpression() {
            if (token === 39 /* await */) {
                if (inAwaitContext()) {
                    return true;
                }
                // here we are using similar heuristics as 'isYieldExpression'
                return lookAhead(nextTokenIsIdentifierOnSameLine);
            }
            return false;
        }
        function parseAwaitExpression() {
            var node = createNode(330 /* AwaitExpression */);
            nextToken();
            node.expression = parseSimpleUnaryExpression();
            return finishNode(node);
        }
        /**
         * Parse ES7 unary expression and await expression
         *
         * ES7 UnaryExpression:
         *      1) SimpleUnaryExpression[?yield]
         *      2) IncrementExpression[?yield] ** UnaryExpression[?yield]
         */
        function parseUnaryExpressionOrHigher() {
            if (isAwaitExpression()) {
                return parseAwaitExpression();
            }
            if (isIncrementExpression()) {
                var incrementExpression = parseIncrementExpression();
                return token === 75 /* asteriskAsterisk */ ?
                    parseBinaryExpressionRest(getBinaryOperatorPrecedence(), incrementExpression) :
                    incrementExpression;
            }
            var unaryOperator = token;
            var simpleUnaryExpression = parseSimpleUnaryExpression();
            if (token === 75 /* asteriskAsterisk */) {
                var start = ts.skipTrivia(sourceText, simpleUnaryExpression.pos);
                if (simpleUnaryExpression.kind === 323 /* TypeAssertionExpression */) {
                    parseErrorAtPosition(start, simpleUnaryExpression.end - start, ts.Diagnostics.A_type_assertion_expression_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses);
                }
                else {
                    parseErrorAtPosition(start, simpleUnaryExpression.end - start, ts.Diagnostics.An_unary_expression_with_the_0_operator_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses, ts.tokenToString(unaryOperator));
                }
            }
            return simpleUnaryExpression;
        }
        /**
         * Parse ES7 simple-unary expression or higher:
         *
         * ES7 SimpleUnaryExpression:
         *      1) IncrementExpression[?yield]
         *      2) delete UnaryExpression[?yield]
         *      3) void UnaryExpression[?yield]
         *      4) typeof UnaryExpression[?yield]
         *      5) + UnaryExpression[?yield]
         *      6) - UnaryExpression[?yield]
         *      7) ~ UnaryExpression[?yield]
         *      8) ! UnaryExpression[?yield]
         */
        function parseSimpleUnaryExpression() {
            switch (token) {
                case 44 /* plus */:
                case 45 /* minus */:
                case 37 /* tilde */:
                case 32 /* exclamation */:
                    return parsePrefixUnaryExpression();
                case 34 /* delete */:
                    return parseDeleteExpression();
                case 35 /* typeof */:
                    return parseTypeOfExpression();
                case 36 /* void */:
                    return parseVoidExpression();
                case 49 /* lessThan */:
                    // This is modified UnaryExpression grammar in TypeScript
                    //  UnaryExpression (modified):
                    //      < type > UnaryExpression
                    return parseTypeAssertion();
                default:
                    return parseIncrementExpression();
            }
        }
        /**
         * Check if the current token can possibly be an ES7 increment expression.
         *
         * ES7 IncrementExpression:
         *      LeftHandSideExpression[?Yield]
         *      LeftHandSideExpression[?Yield][no LineTerminator here]++
         *      LeftHandSideExpression[?Yield][no LineTerminator here]--
         *      ++LeftHandSideExpression[?Yield]
         *      --LeftHandSideExpression[?Yield]
         */
        function isIncrementExpression() {
            // This function is called inside parseUnaryExpression to decide
            // whether to call parseSimpleUnaryExpression or call parseIncrementExpression directly
            switch (token) {
                case 44 /* plus */:
                case 45 /* minus */:
                case 37 /* tilde */:
                case 32 /* exclamation */:
                case 34 /* delete */:
                case 35 /* typeof */:
                case 36 /* void */:
                    return false;
                case 49 /* lessThan */:
                    // If we are not in JSX context, we are parsing TypeAssertion which is an UnaryExpression
                    if (sourceFile.languageVariant !== 1 /* JSX */) {
                        return false;
                    }
                // We are in JSX context and the token is part of JSXElement.
                // Fall through
                default:
                    return true;
            }
        }
        /**
         * Parse ES7 IncrementExpression. IncrementExpression is used instead of ES6's PostFixExpression.
         *
         * ES7 IncrementExpression[yield]:
         *      1) LeftHandSideExpression[?yield]
         *      2) LeftHandSideExpression[?yield] [[no LineTerminator here]]++
         *      3) LeftHandSideExpression[?yield] [[no LineTerminator here]]--
         *      4) ++LeftHandSideExpression[?yield]
         *      5) --LeftHandSideExpression[?yield]
         * In TypeScript (2), (3) are parsed as PostfixUnaryExpression. (4), (5) are parsed as PrefixUnaryExpression
         */
        function parseIncrementExpression() {
            if (token === 47 /* plusPlus */ || token === 48 /* minusMinus */) {
                var node = createNode(331 /* PrefixUnaryExpression */);
                node.operator = token;
                nextToken();
                node.operand = parseLeftHandSideExpressionOrHigher();
                return finishNode(node);
            }
            else if (sourceFile.languageVariant === 1 /* JSX */ && token === 49 /* lessThan */ && lookAhead(nextTokenIsIdentifierOrKeyword)) {
                // JSXElement is part of primaryExpression
                return parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ true);
            }
            var expression = parseLeftHandSideExpressionOrHigher();
            ts.Debug.assert(ts.isLeftHandSideExpression(expression));
            if ((token === 47 /* plusPlus */ || token === 48 /* minusMinus */) && !scanner.hasPrecedingLineBreak()) {
                var node = createNode(332 /* PostfixUnaryExpression */, expression.pos);
                node.operand = expression;
                node.operator = token;
                nextToken();
                return finishNode(node);
            }
            return expression;
        }
        function parseLeftHandSideExpressionOrHigher() {
            // Original Ecma:
            // LeftHandSideExpression: See 11.2
            //      NewExpression
            //      CallExpression
            //
            // Our simplification:
            //
            // LeftHandSideExpression: See 11.2
            //      MemberExpression
            //      CallExpression
            //
            // See comment in parseMemberExpressionOrHigher on how we replaced NewExpression with
            // MemberExpression to make our lives easier.
            //
            // to best understand the below code, it's important to see how CallExpression expands
            // out into its own productions:
            //
            // CallExpression:
            //      MemberExpression Arguments
            //      CallExpression Arguments
            //      CallExpression[Expression]
            //      CallExpression.IdentifierName
            //      super   (   ArgumentListopt   )
            //      super.IdentifierName
            //
            // Because of the recursion in these calls, we need to bottom out first.  There are two
            // bottom out states we can run into.  Either we see 'super' which must start either of
            // the last two CallExpression productions.  Or we have a MemberExpression which either
            // completes the LeftHandSideExpression, or starts the beginning of the first four
            // CallExpression productions.
            var expression = token === 30 /* super */
                ? parseSuperExpression()
                : parseMemberExpressionOrHigher();
            // Now, we *may* be complete.  However, we might have consumed the start of a
            // CallExpression.  As such, we need to consume the rest of it here to be complete.
            return parseCallExpressionRest(expression);
        }
        function parseMemberExpressionOrHigher() {
            // Note: to make our lives simpler, we decompose the the NewExpression productions and
            // place ObjectCreationExpression and FunctionExpression into PrimaryExpression.
            // like so:
            //
            //   PrimaryExpression : See 11.1
            //      this
            //      Identifier
            //      Literal
            //      ArrayLiteral
            //      ObjectLiteral
            //      (Expression)
            //      FunctionExpression
            //      new MemberExpression Arguments?
            //
            //   MemberExpression : See 11.2
            //      PrimaryExpression
            //      MemberExpression[Expression]
            //      MemberExpression.IdentifierName
            //
            //   CallExpression : See 11.2
            //      MemberExpression
            //      CallExpression Arguments
            //      CallExpression[Expression]
            //      CallExpression.IdentifierName
            //
            // Technically this is ambiguous.  i.e. CallExpression defines:
            //
            //   CallExpression:
            //      CallExpression Arguments
            //
            // If you see: "new Foo()"
            //
            // Then that could be treated as a single ObjectCreationExpression, or it could be
            // treated as the invocation of "new Foo".  We disambiguate that in code (to match
            // the original grammar) by making sure that if we see an ObjectCreationExpression
            // we always consume arguments if they are there. So we treat "new Foo()" as an
            // object creation only, and not at all as an invocation)  Another way to think
            // about this is that for every "new" that we see, we will consume an argument list if
            // it is there as part of the *associated* object creation node.  Any additional
            // argument lists we see, will become invocation expressions.
            //
            // Because there are no other places in the grammar now that refer to FunctionExpression
            // or ObjectCreationExpression, it is safe to push down into the PrimaryExpression
            // production.
            //
            // Because CallExpression and MemberExpression are left recursive, we need to bottom out
            // of the recursion immediately.  So we parse out a primary expression to start with.
            var expression = parsePrimaryExpression();
            return parseMemberExpressionRest(expression);
        }
        function parseSuperExpression() {
            var expression = parseTokenNode();
            if (token === 42 /* openParen */ || token === 53 /* dot */ || token === 43 /* openBracket */) {
                return expression;
            }
            // If we have seen "super" it must be followed by '(' or '.'.
            // If it wasn't then just try to parse out a '.' and report an error.
            var node = createNode(318 /* PropertyAccessExpression */, expression.pos);
            node.expression = expression;
            parseExpectedToken(53 /* dot */, /*reportAtCurrentPosition*/ false, ts.Diagnostics.super_must_be_followed_by_an_argument_list_or_member_access);
            node.name = parseRightSideOfDot(/*allowIdentifierNames*/ true);
            return finishNode(node);
        }
        function tagNamesAreEquivalent(lhs, rhs) {
            if (lhs.kind !== rhs.kind) {
                return false;
            }
            if (lhs.kind === 215 /* Identifier */) {
                return lhs.text === rhs.text;
            }
            if (lhs.kind === 29 /* this */) {
                return true;
            }
            // If we are at this statement then we must have PropertyAccessExpression and because tag name in Jsx element can only
            // take forms of JsxTagNameExpression which includes an identifier, "this" expression, or another propertyAccessExpression
            // it is safe to case the expression property as such. See parseJsxElementName for how we parse tag name in Jsx element
            return lhs.name.text === rhs.name.text &&
                tagNamesAreEquivalent(lhs.expression, rhs.expression);
        }
        function parseJsxElementOrSelfClosingElement(inExpressionContext) {
            var opening = parseJsxOpeningOrSelfClosingElement(inExpressionContext);
            var result;
            if (opening.kind === 389 /* JsxOpeningElement */) {
                var node = createNode(387 /* JsxElement */, opening.pos);
                node.openingElement = opening;
                node.children = parseJsxChildren(node.openingElement.tagName);
                node.closingElement = parseJsxClosingElement(inExpressionContext);
                if (!tagNamesAreEquivalent(node.openingElement.tagName, node.closingElement.tagName)) {
                    parseErrorAtPosition(node.closingElement.pos, node.closingElement.end - node.closingElement.pos, ts.Diagnostics.Expected_corresponding_JSX_closing_tag_for_0, ts.getTextOfNodeFromSourceText(sourceText, node.openingElement.tagName));
                }
                result = finishNode(node);
            }
            else {
                ts.Debug.assert(opening.kind === 388 /* JsxSelfClosingElement */);
                // Nothing else to do for self-closing elements
                result = opening;
            }
            // If the user writes the invalid code '<div></div><div></div>' in an expression context (i.e. not wrapped in
            // an enclosing tag), we'll naively try to parse   ^ this as a 'less than' operator and the remainder of the tag
            // as garbage, which will cause the formatter to badly mangle the JSX. Perform a speculative parse of a JSX
            // element if we see a < token so that we can wrap it in a synthetic binary expression so the formatter
            // does less damage and we can report a better error.
            // Since JSX elements are invalid < operands anyway, this lookahead parse will only occur in error scenarios
            // of one sort or another.
            if (inExpressionContext && token === 49 /* lessThan */) {
                var invalidElement = tryParse(function () { return parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ true); });
                if (invalidElement) {
                    parseErrorAtCurrentToken(ts.Diagnostics.JSX_expressions_must_have_one_parent_element);
                    var badNode = createNode(333 /* BinaryExpression */, result.pos);
                    badNode.end = invalidElement.end;
                    badNode.left = result;
                    badNode.right = invalidElement;
                    badNode.operatorToken = createMissingNode(92 /* comma */, /*reportAtCurrentPosition*/ false, /*diagnosticMessage*/ undefined);
                    badNode.operatorToken.pos = badNode.operatorToken.end = badNode.right.pos;
                    return badNode;
                }
            }
            return result;
        }
        function parseJsxText() {
            var node = createNode(390 /* JsxText */, scanner.getStartPos());
            token = scanner.scanJsxToken();
            return finishNode(node);
        }
        function parseJsxChild() {
            switch (token) {
                case 390 /* JsxText */:
                    return parseJsxText();
                case 31 /* openBrace */:
                    return parseJsxExpression(/*inExpressionContext*/ false);
                case 49 /* lessThan */:
                    return parseJsxElementOrSelfClosingElement(/*inExpressionContext*/ false);
            }
            ts.Debug.fail("Unknown JSX child kind " + token);
        }
        function parseJsxChildren(openingTagName) {
            var result = [];
            result.pos = scanner.getStartPos();
            var saveParsingContext = parsingContext;
            parsingContext |= 1 << 14 /* JsxChildren */;
            while (true) {
                token = scanner.reScanJsxToken();
                if (token === ts.TokenType.lessThanSlash) {
                    // Closing tag
                    break;
                }
                else if (token === 1 /* endOfFile */) {
                    // If we hit EOF, issue the error at the tag that lacks the closing element
                    // rather than at the end of the file (which is useless)
                    parseErrorAtPosition(openingTagName.pos, openingTagName.end - openingTagName.pos, ts.Diagnostics.JSX_element_0_has_no_corresponding_closing_tag, ts.getTextOfNodeFromSourceText(sourceText, openingTagName));
                    break;
                }
                result.push(parseJsxChild());
            }
            result.end = scanner.getTokenPos();
            parsingContext = saveParsingContext;
            return result;
        }
        function parseJsxOpeningOrSelfClosingElement(inExpressionContext) {
            var fullStart = scanner.getStartPos();
            parseExpected(49 /* lessThan */);
            var tagName = parseJsxElementName();
            var attributes = parseList(13 /* JsxAttributes */, parseJsxAttribute);
            var node;
            if (token === 61 /* greaterThan */) {
                // Closing tag, so scan the immediately-following text with the JSX scanning instead
                // of regular scanning to avoid treating illegal characters (e.g. '#') as immediate
                // scanning errors
                node = createNode(389 /* JsxOpeningElement */, fullStart);
                scanJsxText();
            }
            else {
                parseExpected(46 /* slash */);
                if (inExpressionContext) {
                    parseExpected(61 /* greaterThan */);
                }
                else {
                    parseExpected(61 /* greaterThan */, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
                    scanJsxText();
                }
                node = createNode(388 /* JsxSelfClosingElement */, fullStart);
            }
            node.tagName = tagName;
            node.attributes = attributes;
            return finishNode(node);
        }
        function parseJsxElementName() {
            scanJsxIdentifier();
            // JsxElement can have name in the form of
            //      propertyAccessExpression
            //      primaryExpression in the form of an identifier and "this" keyword
            // We can't just simply use parseLeftHandSideExpressionOrHigher because then we will start consider class,function etc as a keyword
            // We only want to consider "this" as a primaryExpression
            var expression = token === 29 /* this */ ?
                parseTokenNode() : parseIdentifierName();
            while (parseOptional(53 /* dot */)) {
                var propertyAccess = createNode(318 /* PropertyAccessExpression */, expression.pos);
                propertyAccess.expression = expression;
                propertyAccess.name = parseRightSideOfDot(/*allowIdentifierNames*/ true);
                expression = finishNode(propertyAccess);
            }
            return expression;
        }
        function parseJsxExpression(inExpressionContext) {
            var node = createNode(394 /* JsxExpression */);
            parseExpected(31 /* openBrace */);
            if (token !== 98 /* closeBrace */) {
                node.expression = parseAssignmentExpressionOrHigher();
            }
            if (inExpressionContext) {
                parseExpected(98 /* closeBrace */);
            }
            else {
                parseExpected(98 /* closeBrace */, /*message*/ undefined, /*shouldAdvance*/ false);
                scanJsxText();
            }
            return finishNode(node);
        }
        function parseJsxAttribute() {
            if (token === 31 /* openBrace */) {
                return parseJsxSpreadAttribute();
            }
            scanJsxIdentifier();
            var node = createNode(392 /* JsxAttribute */);
            node.name = parseIdentifierName();
            if (parseOptional(77 /* equals */)) {
                switch (token) {
                    case 155 /* StringLiteral */:
                        node.initializer = parseLiteralNode();
                        break;
                    default:
                        node.initializer = parseJsxExpression(/*inExpressionContext*/ true);
                        break;
                }
            }
            return finishNode(node);
        }
        function parseJsxSpreadAttribute() {
            var node = createNode(393 /* JsxSpreadAttribute */);
            parseExpected(31 /* openBrace */);
            parseExpected(51 /* dotDotDot */);
            node.expression = parseExpression();
            parseExpected(98 /* closeBrace */);
            return finishNode(node);
        }
        function parseJsxClosingElement(inExpressionContext) {
            var node = createNode(391 /* JsxClosingElement */);
            parseExpected(ts.TokenType.lessThanSlash);
            node.tagName = parseJsxElementName();
            if (inExpressionContext) {
                parseExpected(61 /* greaterThan */);
            }
            else {
                parseExpected(61 /* greaterThan */, /*diagnostic*/ undefined, /*shouldAdvance*/ false);
                scanJsxText();
            }
            return finishNode(node);
        }
        function parseTypeAssertion() {
            var node = createNode(323 /* TypeAssertionExpression */);
            parseExpected(49 /* lessThan */);
            node.type = parseType();
            parseExpected(61 /* greaterThan */);
            node.expression = parseSimpleUnaryExpression();
            return finishNode(node);
        }
        function parseMemberExpressionRest(expression) {
            while (true) {
                var dotToken = parseOptionalToken(53 /* dot */);
                if (dotToken) {
                    var propertyAccess = createNode(318 /* PropertyAccessExpression */, expression.pos);
                    propertyAccess.expression = expression;
                    propertyAccess.name = parseRightSideOfDot(/*allowIdentifierNames*/ true);
                    expression = finishNode(propertyAccess);
                    continue;
                }
                if (token === 32 /* exclamation */ && !scanner.hasPrecedingLineBreak()) {
                    nextToken();
                    var nonNullExpression = createNode(342 /* NonNullExpression */, expression.pos);
                    nonNullExpression.expression = expression;
                    expression = finishNode(nonNullExpression);
                    continue;
                }
                // when in the [Decorator] context, we do not parse ElementAccess as it could be part of a ComputedPropertyName
                if (!inDecoratorContext() && parseOptional(43 /* openBracket */)) {
                    var indexedAccess = createNode(319 /* ElementAccessExpression */, expression.pos);
                    indexedAccess.expression = expression;
                    // It's not uncommon for a user to write: "new Type[]".
                    // Check for that common pattern and report a better error message.
                    if (token !== 97 /* closeBracket */) {
                        indexedAccess.argumentExpression = allowInAnd(parseExpression);
                        if (indexedAccess.argumentExpression.kind === 155 /* StringLiteral */ || indexedAccess.argumentExpression.kind === 154 /* NumericLiteral */) {
                            var literal = indexedAccess.argumentExpression;
                            literal.text = internIdentifier(literal.text);
                        }
                    }
                    parseExpected(97 /* closeBracket */);
                    expression = finishNode(indexedAccess);
                    continue;
                }
                if (token === 157 /* NoSubstitutionTemplateLiteral */ || token === 158 /* TemplateHead */) {
                    var tagExpression = createNode(322 /* TaggedTemplateExpression */, expression.pos);
                    tagExpression.tag = expression;
                    tagExpression.template = token === 157 /* NoSubstitutionTemplateLiteral */
                        ? parseLiteralNode()
                        : parseTemplateExpression();
                    expression = finishNode(tagExpression);
                    continue;
                }
                return expression;
            }
        }
        function parseCallExpressionRest(expression) {
            while (true) {
                expression = parseMemberExpressionRest(expression);
                if (token === 49 /* lessThan */) {
                    // See if this is the start of a generic invocation.  If so, consume it and
                    // keep checking for postfix expressions.  Otherwise, it's just a '<' that's
                    // part of an arithmetic expression.  Break out so we consume it higher in the
                    // stack.
                    var typeArguments = tryParse(parseTypeArgumentsInExpression);
                    if (!typeArguments) {
                        return expression;
                    }
                    var callExpr = createNode(320 /* CallExpression */, expression.pos);
                    callExpr.expression = expression;
                    callExpr.typeArguments = typeArguments;
                    callExpr.arguments = parseArgumentList();
                    expression = finishNode(callExpr);
                    continue;
                }
                else if (token === 42 /* openParen */) {
                    var callExpr = createNode(320 /* CallExpression */, expression.pos);
                    callExpr.expression = expression;
                    callExpr.arguments = parseArgumentList();
                    expression = finishNode(callExpr);
                    continue;
                }
                return expression;
            }
        }
        function parseArgumentList() {
            parseExpected(42 /* openParen */);
            var result = parseDelimitedList(11 /* ArgumentExpressions */, parseArgumentExpression);
            parseExpected(96 /* closeParen */);
            return result;
        }
        function parseTypeArgumentsInExpression() {
            if (!parseOptional(49 /* lessThan */)) {
                return undefined;
            }
            var typeArguments = parseDelimitedList(18 /* TypeArguments */, parseType);
            if (!parseExpected(61 /* greaterThan */)) {
                // If it doesn't have the closing >  then it's definitely not an type argument list.
                return undefined;
            }
            // If we have a '<', then only parse this as a argument list if the type arguments
            // are complete and we have an open paren.  if we don't, rewind and return nothing.
            return typeArguments && canFollowTypeArgumentsInExpression()
                ? typeArguments
                : undefined;
        }
        function canFollowTypeArgumentsInExpression() {
            switch (token) {
                case 42 /* openParen */: // foo<x>(
                // this case are the only case where this token can legally follow a type argument
                // list.  So we definitely want to treat this as a type arg list.
                case 53 /* dot */: // foo<x>.
                case 96 /* closeParen */: // foo<x>)
                case 97 /* closeBracket */: // foo<x>]
                case 99 /* colon */: // foo<x>:
                case 100 /* semicolon */: // foo<x>;
                case 91 /* question */: // foo<x>?
                case 64 /* equalsEquals */: // foo<x> ==
                case 66 /* equalsEqualsEquals */: // foo<x> ===
                case 65 /* exclamationEquals */: // foo<x> !=
                case 67 /* exclamationEqualsEquals */: // foo<x> !==
                case 73 /* ampersandAmpersand */: // foo<x> &&
                case 74 /* barBar */: // foo<x> ||
                case 72 /* caret */: // foo<x> ^
                case 57 /* ampersand */: // foo<x> &
                case 71 /* bar */: // foo<x> |
                case 98 /* closeBrace */: // foo<x> }
                case 1 /* endOfFile */:
                    // these cases can't legally follow a type arg list.  However, they're not legal
                    // expressions either.  The user is probably in the middle of a generic type. So
                    // treat it as such.
                    return true;
                case 92 /* comma */: // foo<x>,
                case 31 /* openBrace */: // foo<x> {
                // We don't want to treat these as type arguments.  Otherwise we'll parse this
                // as an invocation expression.  Instead, we want to parse out the expression
                // in isolation from the type arguments.
                default:
                    // Anything else treat as an expression.
                    return false;
            }
        }
        function parsePrimaryExpression() {
            switch (token) {
                case 154 /* NumericLiteral */:
                case 155 /* StringLiteral */:
                case 157 /* NoSubstitutionTemplateLiteral */:
                    return parseLiteralNode();
                case 29 /* this */:
                case 30 /* super */:
                case 26 /* null */:
                case 27 /* true */:
                case 28 /* false */:
                    return parseTokenNode();
                case 42 /* openParen */:
                    return parseParenthesizedExpression();
                case 43 /* openBracket */:
                    return parseArrayLiteralExpression();
                case 31 /* openBrace */:
                    return parseObjectLiteralExpression();
                case 5 /* async */:
                    // Async arrow functions are parsed earlier in parseAssignmentExpressionOrHigher.
                    // If we encounter `async [no LineTerminator here] function` then this is an async
                    // function; otherwise, its an identifier.
                    if (!lookAhead(nextTokenIsFunctionKeywordOnSameLine)) {
                        break;
                    }
                    return parseFunctionExpression();
                case 17 /* class */:
                    return parseClassExpression();
                case 18 /* function */:
                    return parseFunctionExpression();
                case 33 /* new */:
                    return parseNewExpression();
                case 46 /* slash */:
                case 81 /* slashEquals */:
                    if (reScanSlashToken() === 156 /* RegularExpressionLiteral */) {
                        return parseLiteralNode();
                    }
                    break;
                case 158 /* TemplateHead */:
                    return parseTemplateExpression();
            }
            return parseIdentifier(ts.Diagnostics.Expression_expected);
        }
        function parseParenthesizedExpression() {
            var node = createNode(324 /* ParenthesizedExpression */);
            parseExpected(42 /* openParen */);
            node.expression = allowInAnd(parseExpression);
            parseExpected(96 /* closeParen */);
            return finishNode(node);
        }
        function parseSpreadElement() {
            var node = createNode(337 /* SpreadElementExpression */);
            parseExpected(51 /* dotDotDot */);
            node.expression = parseAssignmentExpressionOrHigher();
            return finishNode(node);
        }
        function parseArgumentOrArrayLiteralElement() {
            return token === 51 /* dotDotDot */ ? parseSpreadElement() :
                token === 92 /* comma */ ? createNode(339 /* OmittedExpression */) :
                    parseAssignmentExpressionOrHigher();
        }
        function parseArgumentExpression() {
            return doOutsideOfContext(disallowInAndDecoratorContext, parseArgumentOrArrayLiteralElement);
        }
        function parseArrayLiteralExpression() {
            var node = createNode(316 /* ArrayLiteralExpression */);
            parseExpected(43 /* openBracket */);
            if (scanner.hasPrecedingLineBreak()) {
                node.multiLine = true;
            }
            node.elements = parseDelimitedList(15 /* ArrayLiteralMembers */, parseArgumentOrArrayLiteralElement);
            parseExpected(97 /* closeBracket */);
            return finishNode(node);
        }
        function tryParseAccessorDeclaration(fullStart, decorators, modifiers) {
            if (parseContextualModifier(135 /* get */)) {
                return addJSDocComment(parseAccessorDeclaration(295 /* GetAccessor */, fullStart, decorators, modifiers));
            }
            else if (parseContextualModifier(136 /* set */)) {
                return parseAccessorDeclaration(296 /* SetAccessor */, fullStart, decorators, modifiers);
            }
            return undefined;
        }
        function parseObjectLiteralElement() {
            var fullStart = scanner.getStartPos();
            var decorators = parseDecorators();
            var modifiers = parseModifiers();
            var accessor = tryParseAccessorDeclaration(fullStart, decorators, modifiers);
            if (accessor) {
                return accessor;
            }
            var asteriskToken = parseOptionalToken(56 /* asterisk */);
            var tokenIsIdentifier = isIdentifier();
            var propertyName = parsePropertyName();
            // Disallowing of optional property assignments happens in the grammar checker.
            var questionToken = parseOptionalToken(91 /* question */);
            if (asteriskToken || token === 42 /* openParen */ || token === 49 /* lessThan */) {
                return parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, propertyName, questionToken);
            }
            // check if it is short-hand property assignment or normal property assignment
            // NOTE: if token is EqualsToken it is interpreted as CoverInitializedName production
            // CoverInitializedName[Yield] :
            //     IdentifierReference[?Yield] Initializer[In, ?Yield]
            // this is necessary because ObjectLiteral productions are also used to cover grammar for ObjectAssignmentPattern
            var isShorthandPropertyAssignment = tokenIsIdentifier && (token === 92 /* comma */ || token === 98 /* closeBrace */ || token === 77 /* equals */);
            if (isShorthandPropertyAssignment) {
                var shorthandDeclaration = createNode(400 /* ShorthandPropertyAssignment */, fullStart);
                shorthandDeclaration.name = propertyName;
                shorthandDeclaration.questionToken = questionToken;
                var equalsToken = parseOptionalToken(77 /* equals */);
                if (equalsToken) {
                    shorthandDeclaration.equalsToken = equalsToken;
                    shorthandDeclaration.objectAssignmentInitializer = allowInAnd(parseAssignmentExpressionOrHigher);
                }
                return addJSDocComment(finishNode(shorthandDeclaration));
            }
            else {
                var propertyAssignment = createNode(399 /* PropertyAssignment */, fullStart);
                propertyAssignment.modifiers = modifiers;
                propertyAssignment.name = propertyName;
                propertyAssignment.questionToken = questionToken;
                parseExpected(99 /* colon */);
                propertyAssignment.initializer = allowInAnd(parseAssignmentExpressionOrHigher);
                return addJSDocComment(finishNode(propertyAssignment));
            }
        }
        function parseObjectLiteralExpression() {
            var node = createNode(317 /* ObjectLiteralExpression */);
            parseExpected(31 /* openBrace */);
            if (scanner.hasPrecedingLineBreak()) {
                node.multiLine = true;
            }
            node.properties = parseDelimitedList(12 /* ObjectLiteralMembers */, parseObjectLiteralElement, /*considerSemicolonAsDelimiter*/ true);
            parseExpected(98 /* closeBrace */);
            return finishNode(node);
        }
        function parseFunctionExpression() {
            // GeneratorExpression:
            //      function* BindingIdentifier [Yield][opt](FormalParameters[Yield]){ GeneratorBody }
            //
            // FunctionExpression:
            //      function BindingIdentifier[opt](FormalParameters){ FunctionBody }
            var saveDecoratorContext = inDecoratorContext();
            if (saveDecoratorContext) {
                setDecoratorContext(/*val*/ false);
            }
            var node = createNode(325 /* FunctionExpression */);
            setModifiers(node, parseModifiers());
            parseExpected(18 /* function */);
            node.asteriskToken = parseOptionalToken(56 /* asterisk */);
            var isGenerator = !!node.asteriskToken;
            var isAsync = !!(node.flags & 256 /* Async */);
            node.name =
                isGenerator && isAsync ? doInYieldAndAwaitContext(parseOptionalIdentifier) :
                    isGenerator ? doInYieldContext(parseOptionalIdentifier) :
                        isAsync ? doInAwaitContext(parseOptionalIdentifier) :
                            parseOptionalIdentifier();
            fillSignature(99 /* colon */, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, node);
            node.body = parseFunctionBlock(/*allowYield*/ isGenerator, /*allowAwait*/ isAsync, /*ignoreMissingOpenBrace*/ false);
            if (saveDecoratorContext) {
                setDecoratorContext(/*val*/ true);
            }
            return addJSDocComment(finishNode(node));
        }
        function parseOptionalIdentifier() {
            return isIdentifier() ? parseIdentifier() : undefined;
        }
        function parseNewExpression() {
            var node = createNode(321 /* NewExpression */);
            parseExpected(33 /* new */);
            node.expression = parseMemberExpressionOrHigher();
            node.typeArguments = tryParse(parseTypeArgumentsInExpression);
            if (node.typeArguments || token === 42 /* openParen */) {
                node.arguments = parseArgumentList();
            }
            return finishNode(node);
        }
        // STATEMENTS
        function parseBlock(ignoreMissingOpenBrace, diagnosticMessage) {
            var node = createNode(345 /* Block */);
            if (parseExpected(31 /* openBrace */, diagnosticMessage) || ignoreMissingOpenBrace) {
                node.statements = parseList(1 /* BlockStatements */, parseStatement);
                parseExpected(98 /* closeBrace */);
            }
            else {
                node.statements = createMissingList();
            }
            return finishNode(node);
        }
        function parseFunctionBlock(allowYield, allowAwait, ignoreMissingOpenBrace, diagnosticMessage) {
            var savedYieldContext = inYieldContext();
            setYieldContext(allowYield);
            var savedAwaitContext = inAwaitContext();
            setAwaitContext(allowAwait);
            // We may be in a [Decorator] context when parsing a function expression or
            // arrow function. The body of the function is not in [Decorator] context.
            var saveDecoratorContext = inDecoratorContext();
            if (saveDecoratorContext) {
                setDecoratorContext(/*val*/ false);
            }
            var block = parseBlock(ignoreMissingOpenBrace, diagnosticMessage);
            if (saveDecoratorContext) {
                setDecoratorContext(/*val*/ true);
            }
            setYieldContext(savedYieldContext);
            setAwaitContext(savedAwaitContext);
            return block;
        }
        function parseEmptyStatement() {
            var node = createNode(347 /* EmptyStatement */);
            parseExpected(100 /* semicolon */);
            return finishNode(node);
        }
        function parseIfStatement() {
            var node = createNode(349 /* IfStatement */);
            parseExpected(104 /* if */);
            parseExpected(42 /* openParen */);
            node.expression = allowInAnd(parseExpression);
            parseExpected(96 /* closeParen */);
            node.thenStatement = parseStatement();
            node.elseStatement = parseOptional(125 /* else */) ? parseStatement() : undefined;
            return finishNode(node);
        }
        function parseDoStatement() {
            var node = createNode(350 /* DoStatement */);
            parseExpected(108 /* do */);
            node.statement = parseStatement();
            parseExpected(107 /* while */);
            parseExpected(42 /* openParen */);
            node.expression = allowInAnd(parseExpression);
            parseExpected(96 /* closeParen */);
            // From: https://mail.mozilla.org/pipermail/es-discuss/2011-August/016188.html
            // 157 min --- All allen at wirfs-brock.com CONF --- "do{;}while(false)false" prohibited in
            // spec but allowed in consensus reality. Approved -- this is the de-facto standard whereby
            //  do;while(0)x will have a semicolon inserted before x.
            parseOptional(100 /* semicolon */);
            return finishNode(node);
        }
        function parseWhileStatement() {
            var node = createNode(351 /* WhileStatement */);
            parseExpected(107 /* while */);
            parseExpected(42 /* openParen */);
            node.expression = allowInAnd(parseExpression);
            parseExpected(96 /* closeParen */);
            node.statement = parseStatement();
            return finishNode(node);
        }
        function parseForOrForInOrForOfStatement() {
            var pos = getNodePos();
            parseExpected(106 /* for */);
            parseExpected(42 /* openParen */);
            var initializer = undefined;
            if (token !== 100 /* semicolon */) {
                if (token === 114 /* var */ || token === 116 /* let */ || token === 115 /* const */) {
                    initializer = parseVariableDeclarationList(/*inForStatementInitializer*/ true);
                }
                else {
                    initializer = disallowInAnd(parseExpression);
                }
            }
            var forOrForInOrForOfStatement;
            if (parseOptional(58 /* in */)) {
                var forInStatement = createNode(353 /* ForInStatement */, pos);
                forInStatement.initializer = initializer;
                forInStatement.expression = allowInAnd(parseExpression);
                parseExpected(96 /* closeParen */);
                forOrForInOrForOfStatement = forInStatement;
            }
            else if (parseOptional(133 /* of */)) {
                var forOfStatement = createNode(354 /* ForOfStatement */, pos);
                forOfStatement.initializer = initializer;
                forOfStatement.expression = allowInAnd(parseAssignmentExpressionOrHigher);
                parseExpected(96 /* closeParen */);
                forOrForInOrForOfStatement = forOfStatement;
            }
            else {
                var forStatement = createNode(352 /* ForStatement */, pos);
                forStatement.initializer = initializer;
                parseExpected(100 /* semicolon */);
                if (token !== 100 /* semicolon */ && token !== 96 /* closeParen */) {
                    forStatement.condition = allowInAnd(parseExpression);
                }
                parseExpected(100 /* semicolon */);
                if (token !== 96 /* closeParen */) {
                    forStatement.incrementor = allowInAnd(parseExpression);
                }
                parseExpected(96 /* closeParen */);
                forOrForInOrForOfStatement = forStatement;
            }
            forOrForInOrForOfStatement.statement = parseStatement();
            return finishNode(forOrForInOrForOfStatement);
        }
        function parseBreakOrContinueStatement(kind) {
            var node = createNode(kind);
            parseExpected(kind === 356 /* BreakStatement */ ? 110 /* break */ : 109 /* continue */);
            if (!canParseSemicolon()) {
                node.label = parseIdentifier();
            }
            parseSemicolon();
            return finishNode(node);
        }
        function parseReturnStatement() {
            var node = createNode(357 /* ReturnStatement */);
            parseExpected(111 /* return */);
            if (!canParseSemicolon()) {
                node.expression = allowInAnd(parseExpression);
            }
            parseSemicolon();
            return finishNode(node);
        }
        function parseWithStatement() {
            var node = createNode(358 /* WithStatement */);
            parseExpected(118 /* with */);
            parseExpected(42 /* openParen */);
            node.expression = allowInAnd(parseExpression);
            parseExpected(96 /* closeParen */);
            node.statement = parseStatement();
            return finishNode(node);
        }
        function parseCaseClause() {
            var node = createNode(395 /* CaseClause */);
            parseExpected(126 /* case */);
            node.expression = allowInAnd(parseExpression);
            parseExpected(99 /* colon */);
            node.statements = parseList(3 /* SwitchClauseStatements */, parseStatement);
            return finishNode(node);
        }
        function parseDefaultClause() {
            var node = createNode(396 /* DefaultClause */);
            parseExpected(127 /* default */);
            parseExpected(99 /* colon */);
            node.statements = parseList(3 /* SwitchClauseStatements */, parseStatement);
            return finishNode(node);
        }
        function parseCaseOrDefaultClause() {
            return token === 126 /* case */ ? parseCaseClause() : parseDefaultClause();
        }
        function parseSwitchStatement() {
            var node = createNode(359 /* SwitchStatement */);
            parseExpected(105 /* switch */);
            parseExpected(42 /* openParen */);
            node.expression = allowInAnd(parseExpression);
            parseExpected(96 /* closeParen */);
            var caseBlock = createNode(373 /* CaseBlock */, scanner.getStartPos());
            parseExpected(31 /* openBrace */);
            caseBlock.clauses = parseList(2 /* SwitchClauses */, parseCaseOrDefaultClause);
            parseExpected(98 /* closeBrace */);
            node.caseBlock = finishNode(caseBlock);
            return finishNode(node);
        }
        function parseThrowStatement() {
            // ThrowStatement[Yield] :
            //      throw [no LineTerminator here]Expression[In, ?Yield];
            // Because of automatic semicolon insertion, we need to report error if this
            // throw could be terminated with a semicolon.  Note: we can't call 'parseExpression'
            // directly as that might consume an expression on the following line.
            // We just return 'undefined' in that case.  The actual error will be reported in the
            // grammar walker.
            var node = createNode(361 /* ThrowStatement */);
            parseExpected(112 /* throw */);
            node.expression = scanner.hasPrecedingLineBreak() ? undefined : allowInAnd(parseExpression);
            parseSemicolon();
            return finishNode(node);
        }
        // TODO: Review for error recovery
        function parseTryStatement() {
            var node = createNode(362 /* TryStatement */);
            parseExpected(113 /* try */);
            node.tryBlock = parseBlock(/*ignoreMissingOpenBrace*/ false);
            node.catchClause = token === 128 /* catch */ ? parseCatchClause() : undefined;
            // If we don't have a catch clause, then we must have a finally clause.  Try to parse
            // one out no matter what.
            if (!node.catchClause || token === 129 /* finally */) {
                parseExpected(129 /* finally */);
                node.finallyBlock = parseBlock(/*ignoreMissingOpenBrace*/ false);
            }
            return finishNode(node);
        }
        function parseCatchClause() {
            var result = createNode(398 /* CatchClause */);
            parseExpected(128 /* catch */);
            if (parseExpected(42 /* openParen */)) {
                result.variableDeclaration = parseVariableDeclaration();
            }
            parseExpected(96 /* closeParen */);
            result.block = parseBlock(/*ignoreMissingOpenBrace*/ false);
            return finishNode(result);
        }
        function parseDebuggerStatement() {
            var node = createNode(363 /* DebuggerStatement */);
            parseExpected(117 /* debugger */);
            parseSemicolon();
            return finishNode(node);
        }
        function parseExpressionOrLabeledStatement() {
            // Avoiding having to do the lookahead for a labeled statement by just trying to parse
            // out an expression, seeing if it is identifier and then seeing if it is followed by
            // a colon.
            var fullStart = scanner.getStartPos();
            var expression = allowInAnd(parseExpression);
            if (expression.kind === 215 /* Identifier */ && parseOptional(99 /* colon */)) {
                var labeledStatement = createNode(360 /* LabeledStatement */, fullStart);
                labeledStatement.label = expression;
                labeledStatement.statement = parseStatement();
                return addJSDocComment(finishNode(labeledStatement));
            }
            else {
                var expressionStatement = createNode(348 /* ExpressionStatement */, fullStart);
                expressionStatement.expression = expression;
                parseSemicolon();
                return addJSDocComment(finishNode(expressionStatement));
            }
        }
        function nextTokenIsIdentifierOrKeywordOnSameLine() {
            nextToken();
            return ts.tokenIsIdentifierOrKeyword(token) && !scanner.hasPrecedingLineBreak();
        }
        function nextTokenIsFunctionKeywordOnSameLine() {
            nextToken();
            return token === 18 /* function */ && !scanner.hasPrecedingLineBreak();
        }
        function nextTokenIsIdentifierOrKeywordOrNumberOnSameLine() {
            nextToken();
            return (ts.tokenIsIdentifierOrKeyword(token) || token === 154 /* NumericLiteral */) && !scanner.hasPrecedingLineBreak();
        }
        function isDeclaration() {
            while (true) {
                switch (token) {
                    case 114 /* var */:
                    case 116 /* let */:
                    case 115 /* const */:
                    case 18 /* function */:
                    case 17 /* class */:
                    case 15 /* enum */:
                        return true;
                    // 'declare', 'module', 'namespace', 'interface'* and 'type' are all legal JavaScript identifiers;
                    // however, an identifier cannot be followed by another identifier on the same line. This is what we
                    // count on to parse out the respective declarations. For instance, we exploit this to say that
                    //
                    //    namespace n
                    //
                    // can be none other than the beginning of a namespace declaration, but need to respect that JavaScript sees
                    //
                    //    namespace
                    //    n
                    //
                    // as the identifier 'namespace' on one line followed by the identifier 'n' on another.
                    // We need to look one token ahead to see if it permissible to try parsing a declaration.
                    //
                    // *Note*: 'interface' is actually a strict mode reserved word. So while
                    //
                    //   "use strict"
                    //   interface
                    //   I {}
                    //
                    // could be legal, it would add complexity for very little gain.
                    case 16 /* interface */:
                    case 121 /* type */:
                        return nextTokenIsIdentifierOnSameLine();
                    case 123 /* module */:
                    case 122 /* namespace */:
                        return nextTokenIsIdentifierOrStringLiteralOnSameLine();
                    case 10 /* abstract */:
                    case 5 /* async */:
                    case 11 /* declare */:
                    case 6 /* private */:
                    case 7 /* protected */:
                    case 8 /* public */:
                    case 12 /* readonly */:
                        nextToken();
                        // ASI takes effect for this modifier.
                        if (scanner.hasPrecedingLineBreak()) {
                            return false;
                        }
                        continue;
                    case 139 /* global */:
                        nextToken();
                        return token === 31 /* openBrace */ || token === 215 /* Identifier */ || token === 4 /* export */;
                    case 119 /* import */:
                        nextToken();
                        return token === 155 /* StringLiteral */ || token === 56 /* asterisk */ ||
                            token === 31 /* openBrace */ || ts.tokenIsIdentifierOrKeyword(token);
                    case 4 /* export */:
                        nextToken();
                        if (token === 77 /* equals */ || token === 56 /* asterisk */ ||
                            token === 31 /* openBrace */ || token === 127 /* default */ ||
                            token === 93 /* as */) {
                            return true;
                        }
                        continue;
                    case 9 /* static */:
                        nextToken();
                        continue;
                    default:
                        return false;
                }
            }
        }
        function isStartOfDeclaration() {
            return lookAhead(isDeclaration);
        }
        function isStartOfStatement() {
            switch (token) {
                case 40 /* at */:
                case 100 /* semicolon */:
                case 31 /* openBrace */:
                case 114 /* var */:
                case 116 /* let */:
                case 18 /* function */:
                case 17 /* class */:
                case 15 /* enum */:
                case 104 /* if */:
                case 108 /* do */:
                case 107 /* while */:
                case 106 /* for */:
                case 109 /* continue */:
                case 110 /* break */:
                case 111 /* return */:
                case 118 /* with */:
                case 105 /* switch */:
                case 112 /* throw */:
                case 113 /* try */:
                case 117 /* debugger */:
                // 'catch' and 'finally' do not actually indicate that the code is part of a statement,
                // however, we say they are here so that we may gracefully parse them and error later.
                case 128 /* catch */:
                case 129 /* finally */:
                    return true;
                case 115 /* const */:
                case 4 /* export */:
                case 119 /* import */:
                    return isStartOfDeclaration();
                case 5 /* async */:
                case 11 /* declare */:
                case 16 /* interface */:
                case 123 /* module */:
                case 122 /* namespace */:
                case 121 /* type */:
                case 139 /* global */:
                    // When these don't start a declaration, they're an identifier in an expression statement
                    return true;
                case 8 /* public */:
                case 6 /* private */:
                case 7 /* protected */:
                case 9 /* static */:
                case 12 /* readonly */:
                    // When these don't start a declaration, they may be the start of a class member if an identifier
                    // immediately follows. Otherwise they're an identifier in an expression statement.
                    return isStartOfDeclaration() || !lookAhead(nextTokenIsIdentifierOrKeywordOnSameLine);
                default:
                    return isStartOfExpression();
            }
        }
        function nextTokenIsIdentifierOrStartOfDestructuring() {
            nextToken();
            return isIdentifier() || token === 31 /* openBrace */ || token === 43 /* openBracket */;
        }
        function isLetDeclaration() {
            // In ES6 'let' always starts a lexical declaration if followed by an identifier or {
            // or [.
            return lookAhead(nextTokenIsIdentifierOrStartOfDestructuring);
        }
        function parseStatement() {
            switch (token) {
                case 100 /* semicolon */:
                    return parseEmptyStatement();
                case 31 /* openBrace */:
                    return parseBlock(/*ignoreMissingOpenBrace*/ false);
                case 114 /* var */:
                    return parseVariableStatement(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
                case 116 /* let */:
                    if (isLetDeclaration()) {
                        return parseVariableStatement(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
                    }
                    break;
                case 18 /* function */:
                    return parseFunctionDeclaration(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
                case 17 /* class */:
                    return parseClassDeclaration(scanner.getStartPos(), /*decorators*/ undefined, /*modifiers*/ undefined);
                case 104 /* if */:
                    return parseIfStatement();
                case 108 /* do */:
                    return parseDoStatement();
                case 107 /* while */:
                    return parseWhileStatement();
                case 106 /* for */:
                    return parseForOrForInOrForOfStatement();
                case 109 /* continue */:
                    return parseBreakOrContinueStatement(355 /* ContinueStatement */);
                case 110 /* break */:
                    return parseBreakOrContinueStatement(356 /* BreakStatement */);
                case 111 /* return */:
                    return parseReturnStatement();
                case 118 /* with */:
                    return parseWithStatement();
                case 105 /* switch */:
                    return parseSwitchStatement();
                case 112 /* throw */:
                    return parseThrowStatement();
                case 113 /* try */:
                // Include 'catch' and 'finally' for error recovery.
                case 128 /* catch */:
                case 129 /* finally */:
                    return parseTryStatement();
                case 117 /* debugger */:
                    return parseDebuggerStatement();
                case 40 /* at */:
                    return parseDeclaration();
                case 5 /* async */:
                case 16 /* interface */:
                case 121 /* type */:
                case 123 /* module */:
                case 122 /* namespace */:
                case 11 /* declare */:
                case 115 /* const */:
                case 15 /* enum */:
                case 4 /* export */:
                case 119 /* import */:
                case 6 /* private */:
                case 7 /* protected */:
                case 8 /* public */:
                case 10 /* abstract */:
                case 9 /* static */:
                case 12 /* readonly */:
                case 139 /* global */:
                    if (isStartOfDeclaration()) {
                        return parseDeclaration();
                    }
                    break;
            }
            return parseExpressionOrLabeledStatement();
        }
        function parseDeclaration() {
            var fullStart = getNodePos();
            var decorators = parseDecorators();
            var modifiers = parseModifiers();
            switch (token) {
                case 114 /* var */:
                case 116 /* let */:
                case 115 /* const */:
                    return parseVariableStatement(fullStart, decorators, modifiers);
                case 18 /* function */:
                    return parseFunctionDeclaration(fullStart, decorators, modifiers);
                case 17 /* class */:
                    return parseClassDeclaration(fullStart, decorators, modifiers);
                case 16 /* interface */:
                    return parseInterfaceDeclaration(fullStart, decorators, modifiers);
                case 121 /* type */:
                    return parseTypeAliasDeclaration(fullStart, decorators, modifiers);
                case 15 /* enum */:
                    return parseEnumDeclaration(fullStart, decorators, modifiers);
                case 139 /* global */:
                case 123 /* module */:
                case 122 /* namespace */:
                    return parseModuleDeclaration(fullStart, decorators, modifiers);
                case 119 /* import */:
                    return parseImportDeclarationOrImportEqualsDeclaration(fullStart, decorators, modifiers);
                case 4 /* export */:
                    nextToken();
                    switch (token) {
                        case 127 /* default */:
                        case 77 /* equals */:
                            return parseExportAssignment(fullStart, decorators, modifiers);
                        case 93 /* as */:
                            return parseNamespaceExportDeclaration(fullStart, decorators, modifiers);
                        default:
                            return parseExportDeclaration(fullStart, decorators, modifiers);
                    }
                default:
                    if (decorators || modifiers) {
                        // We reached this point because we encountered decorators and/or modifiers and assumed a declaration
                        // would follow. For recovery and error reporting purposes, return an incomplete declaration.
                        var node = createMissingNode(385 /* MissingDeclaration */, /*reportAtCurrentPosition*/ true, ts.Diagnostics.Declaration_expected);
                        node.pos = fullStart;
                        node.decorators = decorators;
                        setModifiers(node, modifiers);
                        return finishNode(node);
                    }
            }
        }
        function nextTokenIsIdentifierOrStringLiteralOnSameLine() {
            nextToken();
            return !scanner.hasPrecedingLineBreak() && (isIdentifier() || token === 155 /* StringLiteral */);
        }
        function parseFunctionBlockOrSemicolon(isGenerator, isAsync, diagnosticMessage) {
            if (token !== 31 /* openBrace */ && canParseSemicolon()) {
                parseSemicolon();
                return;
            }
            return parseFunctionBlock(isGenerator, isAsync, /*ignoreMissingOpenBrace*/ false, diagnosticMessage);
        }
        // DECLARATIONS
        function parseArrayBindingElement() {
            if (token === 92 /* comma */) {
                return createNode(339 /* OmittedExpression */);
            }
            var node = createNode(315 /* BindingElement */);
            node.dotDotDotToken = parseOptionalToken(51 /* dotDotDot */);
            node.name = parseIdentifierOrPattern();
            node.initializer = parseBindingElementInitializer(/*inParameter*/ false);
            return finishNode(node);
        }
        function parseObjectBindingElement() {
            var node = createNode(315 /* BindingElement */);
            var tokenIsIdentifier = isIdentifier();
            var propertyName = parsePropertyName();
            if (tokenIsIdentifier && token !== 99 /* colon */) {
                node.name = propertyName;
            }
            else {
                parseExpected(99 /* colon */);
                node.propertyName = propertyName;
                node.name = parseIdentifierOrPattern();
            }
            node.initializer = parseBindingElementInitializer(/*inParameter*/ false);
            return finishNode(node);
        }
        function parseObjectBindingPattern() {
            var node = createNode(313 /* ObjectBindingPattern */);
            parseExpected(31 /* openBrace */);
            node.elements = parseDelimitedList(9 /* ObjectBindingElements */, parseObjectBindingElement);
            parseExpected(98 /* closeBrace */);
            return finishNode(node);
        }
        function parseArrayBindingPattern() {
            var node = createNode(314 /* ArrayBindingPattern */);
            parseExpected(43 /* openBracket */);
            node.elements = parseDelimitedList(10 /* ArrayBindingElements */, parseArrayBindingElement);
            parseExpected(97 /* closeBracket */);
            return finishNode(node);
        }
        function isIdentifierOrPattern() {
            return token === 31 /* openBrace */ || token === 43 /* openBracket */ || isIdentifier();
        }
        function parseIdentifierOrPattern() {
            if (token === 43 /* openBracket */) {
                return parseArrayBindingPattern();
            }
            if (token === 31 /* openBrace */) {
                return parseObjectBindingPattern();
            }
            return parseIdentifier();
        }
        function parseVariableDeclaration() {
            var node = createNode(364 /* VariableDeclaration */);
            node.name = parseIdentifierOrPattern();
            node.type = parseTypeAnnotation();
            if (!isInOrOfKeyword(token)) {
                node.initializer = parseInitializer(/*inParameter*/ false);
            }
            return finishNode(node);
        }
        function parseVariableDeclarationList(inForStatementInitializer) {
            var node = createNode(365 /* VariableDeclarationList */);
            switch (token) {
                case 114 /* var */:
                    break;
                case 116 /* let */:
                    node.flags |= 1024 /* Let */;
                    break;
                case 115 /* const */:
                    node.flags |= 2048 /* Const */;
                    break;
                default:
                    ts.Debug.fail();
            }
            nextToken();
            // The user may have written the following:
            //
            //    for (let of X) { }
            //
            // In this case, we want to parse an empty declaration list, and then parse 'of'
            // as a keyword. The reason this is not automatic is that 'of' is a valid identifier.
            // So we need to look ahead to determine if 'of' should be treated as a keyword in
            // this context.
            // The checker will then give an error that there is an empty declaration list.
            if (token === 133 /* of */ && lookAhead(canFollowContextualOfKeyword)) {
                node.declarations = createMissingList();
            }
            else {
                var savedDisallowIn = inDisallowInContext();
                setDisallowInContext(inForStatementInitializer);
                node.declarations = parseDelimitedList(8 /* VariableDeclarations */, parseVariableDeclaration);
                setDisallowInContext(savedDisallowIn);
            }
            return finishNode(node);
        }
        function canFollowContextualOfKeyword() {
            return nextTokenIsIdentifier() && nextToken() === 96 /* closeParen */;
        }
        function parseVariableStatement(fullStart, decorators, modifiers) {
            var node = createNode(346 /* VariableStatement */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            node.declarationList = parseVariableDeclarationList(/*inForStatementInitializer*/ false);
            parseSemicolon();
            return addJSDocComment(finishNode(node));
        }
        function parseFunctionDeclaration(fullStart, decorators, modifiers) {
            var node = createNode(366 /* FunctionDeclaration */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            parseExpected(18 /* function */);
            node.asteriskToken = parseOptionalToken(56 /* asterisk */);
            node.name = node.flags & 512 /* Default */ ? parseOptionalIdentifier() : parseIdentifier();
            var isGenerator = !!node.asteriskToken;
            var isAsync = !!(node.flags & 256 /* Async */);
            fillSignature(99 /* colon */, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, node);
            node.body = parseFunctionBlockOrSemicolon(isGenerator, isAsync, ts.Diagnostics.or_expected);
            return addJSDocComment(finishNode(node));
        }
        function parseConstructorDeclaration(pos, decorators, modifiers) {
            var node = createNode(294 /* Constructor */, pos);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            parseExpected(138 /* constructor */);
            fillSignature(99 /* colon */, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
            node.body = parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false, ts.Diagnostics.or_expected);
            return addJSDocComment(finishNode(node));
        }
        function parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, name, questionToken, diagnosticMessage) {
            var method = createNode(293 /* MethodDeclaration */, fullStart);
            method.decorators = decorators;
            setModifiers(method, modifiers);
            method.asteriskToken = asteriskToken;
            method.name = name;
            method.questionToken = questionToken;
            var isGenerator = !!asteriskToken;
            var isAsync = !!(method.flags & 256 /* Async */);
            fillSignature(99 /* colon */, /*yieldContext*/ isGenerator, /*awaitContext*/ isAsync, /*requireCompleteParameterList*/ false, method);
            method.body = parseFunctionBlockOrSemicolon(isGenerator, isAsync, diagnosticMessage);
            return addJSDocComment(finishNode(method));
        }
        function parsePropertyDeclaration(fullStart, decorators, modifiers, name, questionToken) {
            var property = createNode(291 /* PropertyDeclaration */, fullStart);
            property.decorators = decorators;
            setModifiers(property, modifiers);
            property.name = name;
            property.questionToken = questionToken;
            property.type = parseTypeAnnotation();
            // For instance properties specifically, since they are evaluated inside the constructor,
            // we do *not * want to parse yield expressions, so we specifically turn the yield context
            // off. The grammar would look something like this:
            //
            //    MemberVariableDeclaration[Yield]:
            //        AccessibilityModifier_opt   PropertyName   TypeAnnotation_opt   Initializer_opt[In];
            //        AccessibilityModifier_opt  static_opt  PropertyName   TypeAnnotation_opt   Initializer_opt[In, ?Yield];
            //
            // The checker may still error in the static case to explicitly disallow the yield expression.
            property.initializer = modifiers && modifiers.flags & 32 /* Static */
                ? allowInAnd(parseNonParameterInitializer)
                : doOutsideOfContext(8388608 /* YieldContext */ | 4194304 /* DisallowInContext */, parseNonParameterInitializer);
            parseSemicolon();
            return finishNode(property);
        }
        function parsePropertyOrMethodDeclaration(fullStart, decorators, modifiers) {
            var asteriskToken = parseOptionalToken(56 /* asterisk */);
            var name = parsePropertyName();
            // Note: this is not legal as per the grammar.  But we allow it in the parser and
            // report an error in the grammar checker.
            var questionToken = parseOptionalToken(91 /* question */);
            if (asteriskToken || token === 42 /* openParen */ || token === 49 /* lessThan */) {
                return parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, name, questionToken, ts.Diagnostics.or_expected);
            }
            else {
                return parsePropertyDeclaration(fullStart, decorators, modifiers, name, questionToken);
            }
        }
        function parseNonParameterInitializer() {
            return parseInitializer(/*inParameter*/ false);
        }
        function parseAccessorDeclaration(kind, fullStart, decorators, modifiers) {
            var node = createNode(kind, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            node.name = parsePropertyName();
            fillSignature(99 /* colon */, /*yieldContext*/ false, /*awaitContext*/ false, /*requireCompleteParameterList*/ false, node);
            node.body = parseFunctionBlockOrSemicolon(/*isGenerator*/ false, /*isAsync*/ false);
            return finishNode(node);
        }
        function isClassMemberModifier(idToken) {
            switch (idToken) {
                case 8 /* public */:
                case 6 /* private */:
                case 7 /* protected */:
                case 9 /* static */:
                case 12 /* readonly */:
                    return true;
                default:
                    return false;
            }
        }
        function isClassMemberStart() {
            var idToken;
            if (token === 40 /* at */) {
                return true;
            }
            // Eat up all modifiers, but hold on to the last one in case it is actually an identifier.
            while (ts.isModifier(token)) {
                idToken = token;
                // If the idToken is a class modifier (protected, private, public, and static), it is
                // certain that we are starting to parse class member. This allows better error recovery
                // Example:
                //      public foo() ...     // true
                //      public @dec blah ... // true; we will then report an error later
                //      export public ...    // true; we will then report an error later
                if (isClassMemberModifier(idToken)) {
                    return true;
                }
                nextToken();
            }
            if (token === 56 /* asterisk */) {
                return true;
            }
            // Try to get the first property-like token following all modifiers.
            // This can either be an identifier or the 'get' or 'set' keywords.
            if (isLiteralPropertyName()) {
                idToken = token;
                nextToken();
            }
            // Index signatures and computed properties are class members; we can parse.
            if (token === 43 /* openBracket */) {
                return true;
            }
            // If we were able to get any potential identifier...
            if (idToken !== undefined) {
                // If we have a non-keyword identifier, or if we have an accessor, then it's safe to parse.
                if (!ts.isKeyword(idToken) || idToken === 136 /* set */ || idToken === 135 /* get */) {
                    return true;
                }
                // If it *is* a keyword, but not an accessor, check a little farther along
                // to see if it should actually be parsed as a class member.
                switch (token) {
                    case 42 /* openParen */: // Method declaration
                    case 49 /* lessThan */: // Generic Method declaration
                    case 99 /* colon */: // Type Annotation for declaration
                    case 77 /* equals */: // Initializer for declaration
                    case 91 /* question */:
                        return true;
                    default:
                        // Covers
                        //  - Semicolons     (declaration termination)
                        //  - Closing braces (end-of-class, must be declaration)
                        //  - End-of-files   (not valid, but permitted so that it gets caught later on)
                        //  - Line-breaks    (enabling *automatic semicolon insertion*)
                        return canParseSemicolon();
                }
            }
            return false;
        }
        function parseDecorators() {
            var decorators;
            while (true) {
                var decoratorStart = getNodePos();
                if (!parseOptional(40 /* at */)) {
                    break;
                }
                if (!decorators) {
                    decorators = [];
                    decorators.pos = decoratorStart;
                }
                var decorator = createNode(289 /* Decorator */, decoratorStart);
                decorator.expression = doInDecoratorContext(parseLeftHandSideExpressionOrHigher);
                decorators.push(finishNode(decorator));
            }
            if (decorators) {
                decorators.end = getNodeEnd();
            }
            return decorators;
        }
        /*
         * There are situations in which a modifier like 'const' will appear unexpectedly, such as on a class member.
         * In those situations, if we are entirely sure that 'const' is not valid on its own (such as when ASI takes effect
         * and turns it into a standalone declaration), then it is better to parse it and report an error later.
         *
         * In such situations, 'permitInvalidConstAsModifier' should be set to true.
         */
        function parseModifiers(permitInvalidConstAsModifier) {
            var flags = 0;
            var modifiers;
            while (true) {
                var modifierStart = scanner.getStartPos();
                var modifierKind = token;
                if (token === 115 /* const */ && permitInvalidConstAsModifier) {
                    // We need to ensure that any subsequent modifiers appear on the same line
                    // so that when 'const' is a standalone declaration, we don't issue an error.
                    if (!tryParse(nextTokenIsOnSameLineAndCanFollowModifier)) {
                        break;
                    }
                }
                else {
                    if (!parseAnyContextualModifier()) {
                        break;
                    }
                }
                if (!modifiers) {
                    modifiers = [];
                    modifiers.pos = modifierStart;
                }
                flags |= ts.modifierToFlag(modifierKind);
                modifiers.push(finishNode(createNode(modifierKind, modifierStart)));
            }
            if (modifiers) {
                modifiers.flags = flags;
                modifiers.end = scanner.getStartPos();
            }
            return modifiers;
        }
        function parseModifiersForArrowFunction() {
            var flags = 0;
            var modifiers;
            if (token === 5 /* async */) {
                var modifierStart = scanner.getStartPos();
                var modifierKind = token;
                nextToken();
                modifiers = [];
                modifiers.pos = modifierStart;
                flags |= ts.modifierToFlag(modifierKind);
                modifiers.push(finishNode(createNode(modifierKind, modifierStart)));
                modifiers.flags = flags;
                modifiers.end = scanner.getStartPos();
            }
            return modifiers;
        }
        function parseClassElement() {
            if (token === 100 /* semicolon */) {
                var result = createNode(344 /* SemicolonClassElement */);
                nextToken();
                return finishNode(result);
            }
            var fullStart = getNodePos();
            var decorators = parseDecorators();
            var modifiers = parseModifiers(/*permitInvalidConstAsModifier*/ true);
            var accessor = tryParseAccessorDeclaration(fullStart, decorators, modifiers);
            if (accessor) {
                return accessor;
            }
            if (token === 138 /* constructor */) {
                return parseConstructorDeclaration(fullStart, decorators, modifiers);
            }
            if (isIndexSignature()) {
                return parseIndexSignatureDeclaration(fullStart, decorators, modifiers);
            }
            // It is very important that we check this *after* checking indexers because
            // the [ token can start an index signature or a computed property name
            if (ts.tokenIsIdentifierOrKeyword(token) ||
                token === 155 /* StringLiteral */ ||
                token === 154 /* NumericLiteral */ ||
                token === 56 /* asterisk */ ||
                token === 43 /* openBracket */) {
                return parsePropertyOrMethodDeclaration(fullStart, decorators, modifiers);
            }
            if (decorators || modifiers) {
                // treat this as a property declaration with a missing name.
                var name_3 = createMissingNode(215 /* Identifier */, /*reportAtCurrentPosition*/ true, ts.Diagnostics.Declaration_expected);
                return parsePropertyDeclaration(fullStart, decorators, modifiers, name_3, /*questionToken*/ undefined);
            }
            // 'isClassMemberStart' should have hinted not to attempt parsing.
            ts.Debug.fail("Should not have attempted to parse class member declaration.");
        }
        function parseClassExpression() {
            return parseClassDeclarationOrExpression(
            /*fullStart*/ scanner.getStartPos(), 
            /*decorators*/ undefined, 
            /*modifiers*/ undefined, 338 /* ClassExpression */);
        }
        function parseClassDeclaration(fullStart, decorators, modifiers) {
            return parseClassDeclarationOrExpression(fullStart, decorators, modifiers, 367 /* ClassDeclaration */);
        }
        function parseClassDeclarationOrExpression(fullStart, decorators, modifiers, kind) {
            var node = createNode(kind, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            parseExpected(17 /* class */);
            node.name = parseNameOfClassDeclarationOrExpression();
            node.typeParameters = parseTypeParameters();
            node.heritageClauses = parseHeritageClauses(/*isClassHeritageClause*/ true);
            if (parseExpected(31 /* openBrace */)) {
                // ClassTail[Yield,Await] : (Modified) See 14.5
                //      ClassHeritage[?Yield,?Await]opt { ClassBody[?Yield,?Await]opt }
                node.members = parseClassMembers();
                parseExpected(98 /* closeBrace */);
            }
            else {
                node.members = createMissingList();
            }
            return finishNode(node);
        }
        function parseNameOfClassDeclarationOrExpression() {
            // implements is a future reserved word so
            // 'class implements' might mean either
            // - class expression with omitted name, 'implements' starts heritage clause
            // - class with name 'implements'
            // 'isImplementsClause' helps to disambiguate between these two cases
            return isIdentifier() && !isImplementsClause()
                ? parseIdentifier()
                : undefined;
        }
        function isImplementsClause() {
            return token === 132 /* implements */ && lookAhead(nextTokenIsIdentifierOrKeyword);
        }
        function parseHeritageClauses(isClassHeritageClause) {
            // ClassTail[Yield,Await] : (Modified) See 14.5
            //      ClassHeritage[?Yield,?Await]opt { ClassBody[?Yield,?Await]opt }
            if (isHeritageClause()) {
                return parseList(20 /* HeritageClauses */, parseHeritageClause);
            }
            return undefined;
        }
        function parseHeritageClause() {
            if (token === 131 /* extends */ || token === 132 /* implements */) {
                var node = createNode(397 /* HeritageClause */);
                node.token = token;
                nextToken();
                node.types = parseDelimitedList(7 /* HeritageClauseElement */, parseExpressionWithTypeArguments);
                return finishNode(node);
            }
            return undefined;
        }
        function parseExpressionWithTypeArguments() {
            var node = createNode(340 /* ExpressionWithTypeArguments */);
            node.expression = parseLeftHandSideExpressionOrHigher();
            if (token === 49 /* lessThan */) {
                node.typeArguments = parseBracketedList(18 /* TypeArguments */, parseType, 49 /* lessThan */, 61 /* greaterThan */);
            }
            return finishNode(node);
        }
        function isHeritageClause() {
            return token === 131 /* extends */ || token === 132 /* implements */;
        }
        function parseClassMembers() {
            return parseList(5 /* ClassMembers */, parseClassElement);
        }
        function parseInterfaceDeclaration(fullStart, decorators, modifiers) {
            var node = createNode(368 /* InterfaceDeclaration */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            parseExpected(16 /* interface */);
            node.name = parseIdentifier();
            node.typeParameters = parseTypeParameters();
            node.heritageClauses = parseHeritageClauses(/*isClassHeritageClause*/ false);
            node.members = parseObjectTypeMembers();
            return finishNode(node);
        }
        function parseTypeAliasDeclaration(fullStart, decorators, modifiers) {
            var node = createNode(369 /* TypeAliasDeclaration */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            parseExpected(121 /* type */);
            node.name = parseIdentifier();
            node.typeParameters = parseTypeParameters();
            parseExpected(77 /* equals */);
            node.type = parseType();
            parseSemicolon();
            return finishNode(node);
        }
        // In an ambient declaration, the grammar only allows integer literals as initializers.
        // In a non-ambient declaration, the grammar allows uninitialized members only in a
        // ConstantEnumMemberSection, which starts at the beginning of an enum declaration
        // or any time an integer literal initializer is encountered.
        function parseEnumMember() {
            var node = createNode(401 /* EnumMember */, scanner.getStartPos());
            node.name = parsePropertyName();
            node.initializer = allowInAnd(parseNonParameterInitializer);
            return finishNode(node);
        }
        function parseEnumDeclaration(fullStart, decorators, modifiers) {
            var node = createNode(370 /* EnumDeclaration */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            parseExpected(15 /* enum */);
            node.name = parseIdentifier();
            if (parseExpected(31 /* openBrace */)) {
                node.members = parseDelimitedList(6 /* EnumMembers */, parseEnumMember);
                parseExpected(98 /* closeBrace */);
            }
            else {
                node.members = createMissingList();
            }
            return finishNode(node);
        }
        function parseModuleBlock() {
            var node = createNode(372 /* ModuleBlock */, scanner.getStartPos());
            if (parseExpected(31 /* openBrace */)) {
                node.statements = parseList(1 /* BlockStatements */, parseStatement);
                parseExpected(98 /* closeBrace */);
            }
            else {
                node.statements = createMissingList();
            }
            return finishNode(node);
        }
        function parseModuleOrNamespaceDeclaration(fullStart, decorators, modifiers, flags) {
            var node = createNode(371 /* ModuleDeclaration */, fullStart);
            // If we are parsing a dotted namespace name, we want to
            // propagate the 'Namespace' flag across the names if set.
            var namespaceFlag = flags & 4096 /* Namespace */;
            node.decorators = decorators;
            setModifiers(node, modifiers);
            node.flags |= flags;
            node.name = parseIdentifier();
            node.body = parseOptional(53 /* dot */)
                ? parseModuleOrNamespaceDeclaration(getNodePos(), /*decorators*/ undefined, /*modifiers*/ undefined, 1 /* Export */ | namespaceFlag)
                : parseModuleBlock();
            return finishNode(node);
        }
        function parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers) {
            var node = createNode(371 /* ModuleDeclaration */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            if (token === 139 /* global */) {
                // parse 'global' as name of global scope augmentation
                node.name = parseIdentifier();
                node.flags |= 131072 /* GlobalAugmentation */;
            }
            else {
                node.name = parseLiteralNode(/*internName*/ true);
            }
            if (token === 31 /* openBrace */) {
                node.body = parseModuleBlock();
            }
            else {
                parseSemicolon();
            }
            return finishNode(node);
        }
        function parseModuleDeclaration(fullStart, decorators, modifiers) {
            var flags = modifiers ? modifiers.flags : 0;
            if (token === 139 /* global */) {
                // global augmentation
                return parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
            }
            else if (parseOptional(122 /* namespace */)) {
                flags |= 4096 /* Namespace */;
            }
            else {
                parseExpected(123 /* module */);
                if (token === 155 /* StringLiteral */) {
                    return parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
                }
            }
            return parseModuleOrNamespaceDeclaration(fullStart, decorators, modifiers, flags);
        }
        function isExternalModuleReference() {
            return token === ts.TokenType.require &&
                lookAhead(nextTokenIsOpenParen);
        }
        function nextTokenIsOpenParen() {
            return nextToken() === 42 /* openParen */;
        }
        function nextTokenIsSlash() {
            return nextToken() === 46 /* slash */;
        }
        function parseNamespaceExportDeclaration(fullStart, decorators, modifiers) {
            var exportDeclaration = createNode(374 /* NamespaceExportDeclaration */, fullStart);
            exportDeclaration.decorators = decorators;
            exportDeclaration.modifiers = modifiers;
            parseExpected(93 /* as */);
            parseExpected(122 /* namespace */);
            exportDeclaration.name = parseIdentifier();
            parseExpected(100 /* semicolon */);
            return finishNode(exportDeclaration);
        }
        function parseImportDeclarationOrImportEqualsDeclaration(fullStart, decorators, modifiers) {
            parseExpected(119 /* import */);
            var afterImportPos = scanner.getStartPos();
            var identifier;
            if (isIdentifier()) {
                identifier = parseIdentifier();
                if (token !== 92 /* comma */ && token !== 130 /* from */) {
                    // ImportEquals declaration of type:
                    // import x = require("mod"); or
                    // import x = M.x;
                    var importEqualsDeclaration = createNode(375 /* ImportEqualsDeclaration */, fullStart);
                    importEqualsDeclaration.decorators = decorators;
                    setModifiers(importEqualsDeclaration, modifiers);
                    importEqualsDeclaration.name = identifier;
                    parseExpected(77 /* equals */);
                    importEqualsDeclaration.moduleReference = parseModuleReference();
                    parseSemicolon();
                    return finishNode(importEqualsDeclaration);
                }
            }
            // Import statement
            var importDeclaration = createNode(376 /* ImportDeclaration */, fullStart);
            importDeclaration.decorators = decorators;
            setModifiers(importDeclaration, modifiers);
            // ImportDeclaration:
            //  import ImportClause from ModuleSpecifier ;
            //  import ModuleSpecifier;
            if (identifier ||
                token === 56 /* asterisk */ ||
                token === 31 /* openBrace */) {
                importDeclaration.importClause = parseImportClause(identifier, afterImportPos);
                parseExpected(130 /* from */);
            }
            importDeclaration.moduleSpecifier = parseModuleSpecifier();
            parseSemicolon();
            return finishNode(importDeclaration);
        }
        function parseImportClause(identifier, fullStart) {
            // ImportClause:
            //  ImportedDefaultBinding
            //  NameSpaceImport
            //  NamedImports
            //  ImportedDefaultBinding, NameSpaceImport
            //  ImportedDefaultBinding, NamedImports
            var importClause = createNode(377 /* ImportClause */, fullStart);
            if (identifier) {
                // ImportedDefaultBinding:
                //  ImportedBinding
                importClause.name = identifier;
            }
            // If there was no default import or if there is comma token after default import
            // parse namespace or named imports
            if (!importClause.name ||
                parseOptional(92 /* comma */)) {
                importClause.namedBindings = token === 56 /* asterisk */ ? parseNamespaceImport() : parseNamedImportsOrExports(379 /* NamedImports */);
            }
            return finishNode(importClause);
        }
        function parseModuleReference() {
            return isExternalModuleReference()
                ? parseExternalModuleReference()
                : parseEntityName(/*allowReservedWords*/ false);
        }
        function parseExternalModuleReference() {
            var node = createNode(386 /* ExternalModuleReference */);
            parseExpected(ts.TokenType.require);
            parseExpected(42 /* openParen */);
            node.expression = parseModuleSpecifier();
            parseExpected(96 /* closeParen */);
            return finishNode(node);
        }
        function parseModuleSpecifier() {
            if (token === 155 /* StringLiteral */) {
                var result = parseLiteralNode();
                internIdentifier(result.text);
                return result;
            }
            else {
                // We allow arbitrary expressions here, even though the grammar only allows string
                // literals.  We check to ensure that it is only a string literal later in the grammar
                // check pass.
                return parseExpression();
            }
        }
        function parseNamespaceImport() {
            // NameSpaceImport:
            //  * as ImportedBinding
            var namespaceImport = createNode(378 /* NamespaceImport */);
            parseExpected(56 /* asterisk */);
            parseExpected(93 /* as */);
            namespaceImport.name = parseIdentifier();
            return finishNode(namespaceImport);
        }
        function parseNamedImportsOrExports(kind) {
            var node = createNode(kind);
            // NamedImports:
            //  { }
            //  { ImportsList }
            //  { ImportsList, }
            // ImportsList:
            //  ImportSpecifier
            //  ImportsList, ImportSpecifier
            node.elements = parseBracketedList(21 /* ImportOrExportSpecifiers */, kind === 379 /* NamedImports */ ? parseImportSpecifier : parseExportSpecifier, 31 /* openBrace */, 98 /* closeBrace */);
            return finishNode(node);
        }
        function parseExportSpecifier() {
            return parseImportOrExportSpecifier(384 /* ExportSpecifier */);
        }
        function parseImportSpecifier() {
            return parseImportOrExportSpecifier(380 /* ImportSpecifier */);
        }
        function parseImportOrExportSpecifier(kind) {
            var node = createNode(kind);
            // ImportSpecifier:
            //   BindingIdentifier
            //   IdentifierName as BindingIdentifier
            // ExportSpecifier:
            //   IdentifierName
            //   IdentifierName as IdentifierName
            var checkIdentifierIsKeyword = ts.isKeyword(token) && !isIdentifier();
            var checkIdentifierStart = scanner.getTokenPos();
            var checkIdentifierEnd = scanner.getTextPos();
            var identifierName = parseIdentifierName();
            if (token === 93 /* as */) {
                node.propertyName = identifierName;
                parseExpected(93 /* as */);
                checkIdentifierIsKeyword = ts.isKeyword(token) && !isIdentifier();
                checkIdentifierStart = scanner.getTokenPos();
                checkIdentifierEnd = scanner.getTextPos();
                node.name = parseIdentifierName();
            }
            else {
                node.name = identifierName;
            }
            if (kind === 380 /* ImportSpecifier */ && checkIdentifierIsKeyword) {
                // Report error identifier expected
                parseErrorAtPosition(checkIdentifierStart, checkIdentifierEnd - checkIdentifierStart, ts.Diagnostics.Identifier_expected);
            }
            return finishNode(node);
        }
        function parseExportDeclaration(fullStart, decorators, modifiers) {
            var node = createNode(382 /* ExportDeclaration */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            if (parseOptional(56 /* asterisk */)) {
                parseExpected(130 /* from */);
                node.moduleSpecifier = parseModuleSpecifier();
            }
            else {
                node.exportClause = parseNamedImportsOrExports(383 /* NamedExports */);
                // It is not uncommon to accidentally omit the 'from' keyword. Additionally, in editing scenarios,
                // the 'from' keyword can be parsed as a named export when the export clause is unterminated (i.e. `export { from "moduleName";`)
                // If we don't have a 'from' keyword, see if we have a string literal such that ASI won't take effect.
                if (token === 130 /* from */ || (token === 155 /* StringLiteral */ && !scanner.hasPrecedingLineBreak())) {
                    parseExpected(130 /* from */);
                    node.moduleSpecifier = parseModuleSpecifier();
                }
            }
            parseSemicolon();
            return finishNode(node);
        }
        function parseExportAssignment(fullStart, decorators, modifiers) {
            var node = createNode(381 /* ExportAssignment */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            if (parseOptional(77 /* equals */)) {
                node.isExportEquals = true;
            }
            else {
                parseExpected(127 /* default */);
            }
            node.expression = parseAssignmentExpressionOrHigher();
            parseSemicolon();
            return finishNode(node);
        }
        function processReferenceComments(sourceFile) {
            var triviaScanner = ts.createScanner(sourceFile.languageVersion, /*skipTrivia*/ false, 0 /* Standard */, sourceText);
            var referencedFiles = [];
            var typeReferenceDirectives = [];
            var amdDependencies = [];
            var amdModuleName;
            // Keep scanning all the leading trivia in the file until we get to something that
            // isn't trivia.  Any single line comment will be analyzed to see if it is a
            // reference comment.
            while (true) {
                var kind = triviaScanner.scan();
                if (kind !== ts.TokenType.singleLineComment) {
                    if (ts.isTrivia(kind)) {
                        continue;
                    }
                    else {
                        break;
                    }
                }
                var range = { pos: triviaScanner.getTokenPos(), end: triviaScanner.getTextPos(), kind: triviaScanner.getToken() };
                var comment = sourceText.substring(range.pos, range.end);
                var referencePathMatchResult = ts.getFileReferenceFromReferencePath(comment, range);
                if (referencePathMatchResult) {
                    var fileReference = referencePathMatchResult.fileReference;
                    sourceFile.hasNoDefaultLib = referencePathMatchResult.isNoDefaultLib;
                    var diagnosticMessage = referencePathMatchResult.diagnosticMessage;
                    if (fileReference) {
                        if (referencePathMatchResult.isTypeReferenceDirective) {
                            typeReferenceDirectives.push(fileReference);
                        }
                        else {
                            referencedFiles.push(fileReference);
                        }
                    }
                    if (diagnosticMessage) {
                        parseDiagnostics.push(ts.createFileDiagnostic(sourceFile, range.pos, range.end - range.pos, diagnosticMessage));
                    }
                }
                else {
                    var amdModuleNameRegEx = /^\/\/\/\s*<amd-module\s+name\s*=\s*('|")(.+?)\1/gim;
                    var amdModuleNameMatchResult = amdModuleNameRegEx.exec(comment);
                    if (amdModuleNameMatchResult) {
                        if (amdModuleName) {
                            parseDiagnostics.push(ts.createFileDiagnostic(sourceFile, range.pos, range.end - range.pos, ts.Diagnostics.An_AMD_module_cannot_have_multiple_name_assignments));
                        }
                        amdModuleName = amdModuleNameMatchResult[2];
                    }
                    var amdDependencyRegEx = /^\/\/\/\s*<amd-dependency\s/gim;
                    var pathRegex = /\spath\s*=\s*('|")(.+?)\1/gim;
                    var nameRegex = /\sname\s*=\s*('|")(.+?)\1/gim;
                    var amdDependencyMatchResult = amdDependencyRegEx.exec(comment);
                    if (amdDependencyMatchResult) {
                        var pathMatchResult = pathRegex.exec(comment);
                        var nameMatchResult = nameRegex.exec(comment);
                        if (pathMatchResult) {
                            var amdDependency = { path: pathMatchResult[2], name: nameMatchResult ? nameMatchResult[2] : undefined };
                            amdDependencies.push(amdDependency);
                        }
                    }
                }
            }
            sourceFile.referencedFiles = referencedFiles;
            sourceFile.typeReferenceDirectives = typeReferenceDirectives;
            sourceFile.amdDependencies = amdDependencies;
            sourceFile.moduleName = amdModuleName;
        }
        function setExternalModuleIndicator(sourceFile) {
            sourceFile.externalModuleIndicator = ts.forEach(sourceFile.statements, function (node) {
                return node.flags & 1 /* Export */
                    || node.kind === 375 /* ImportEqualsDeclaration */ && node.moduleReference.kind === 386 /* ExternalModuleReference */
                    || node.kind === 376 /* ImportDeclaration */
                    || node.kind === 381 /* ExportAssignment */
                    || node.kind === 382 /* ExportDeclaration */
                    ? node
                    : undefined;
            });
        }
        var JSDocParser;
        (function (JSDocParser) {
            function isJSDocType() {
                switch (token) {
                    case 56 /* asterisk */:
                    case 91 /* question */:
                    case 42 /* openParen */:
                    case 43 /* openBracket */:
                    case 32 /* exclamation */:
                    case 31 /* openBrace */:
                    case 18 /* function */:
                    case 51 /* dotDotDot */:
                    case 33 /* new */:
                    case 29 /* this */:
                        return true;
                }
                return ts.tokenIsIdentifierOrKeyword(token);
            }
            JSDocParser.isJSDocType = isJSDocType;
            function parseJSDocTypeExpressionForTests(content, start, length) {
                initializeState("file.js", content, 2 /* Latest */, /*_syntaxCursor:*/ undefined, 1 /* JS */);
                scanner.setText(content, start, length);
                token = scanner.scan();
                var jsDocTypeExpression = parseJSDocTypeExpression();
                var diagnostics = parseDiagnostics;
                clearState();
                return jsDocTypeExpression ? { jsDocTypeExpression: jsDocTypeExpression, diagnostics: diagnostics } : undefined;
            }
            JSDocParser.parseJSDocTypeExpressionForTests = parseJSDocTypeExpressionForTests;
            // Parses out a JSDoc type expression.
            /* @internal */
            function parseJSDocTypeExpression() {
                var result = createNode(403 /* JSDocTypeExpression */, scanner.getTokenPos());
                parseExpected(31 /* openBrace */);
                result.type = parseJSDocTopLevelType();
                parseExpected(98 /* closeBrace */);
                fixupParentReferences(result);
                return finishNode(result);
            }
            JSDocParser.parseJSDocTypeExpression = parseJSDocTypeExpression;
            function parseJSDocTopLevelType() {
                var type = parseJSDocType();
                if (token === 71 /* bar */) {
                    var unionType = createNode(407 /* JSDocUnionType */, type.pos);
                    unionType.types = parseJSDocTypeList(type);
                    type = finishNode(unionType);
                }
                if (token === 77 /* equals */) {
                    var optionalType = createNode(414 /* JSDocOptionalType */, type.pos);
                    nextToken();
                    optionalType.type = type;
                    type = finishNode(optionalType);
                }
                return type;
            }
            function parseJSDocType() {
                var type = parseBasicTypeExpression();
                while (true) {
                    if (token === 43 /* openBracket */) {
                        var arrayType = createNode(406 /* JSDocArrayType */, type.pos);
                        arrayType.elementType = type;
                        nextToken();
                        parseExpected(97 /* closeBracket */);
                        type = finishNode(arrayType);
                    }
                    else if (token === 91 /* question */) {
                        var nullableType = createNode(409 /* JSDocNullableType */, type.pos);
                        nullableType.type = type;
                        nextToken();
                        type = finishNode(nullableType);
                    }
                    else if (token === 32 /* exclamation */) {
                        var nonNullableType = createNode(410 /* JSDocNonNullableType */, type.pos);
                        nonNullableType.type = type;
                        nextToken();
                        type = finishNode(nonNullableType);
                    }
                    else {
                        break;
                    }
                }
                return type;
            }
            function parseBasicTypeExpression() {
                switch (token) {
                    case 56 /* asterisk */:
                        return parseJSDocAllType();
                    case 91 /* question */:
                        return parseJSDocUnknownOrNullableType();
                    case 42 /* openParen */:
                        return parseJSDocUnionType();
                    case 43 /* openBracket */:
                        return parseJSDocTupleType();
                    case 32 /* exclamation */:
                        return parseJSDocNonNullableType();
                    case 31 /* openBrace */:
                        return parseJSDocRecordType();
                    case 18 /* function */:
                        return parseJSDocFunctionType();
                    case 51 /* dotDotDot */:
                        return parseJSDocVariadicType();
                    case 33 /* new */:
                        return parseJSDocConstructorType();
                    case 29 /* this */:
                        return parseJSDocThisType();
                    case 141 /* any */:
                    case 144 /* string */:
                    case 143 /* number */:
                    case 142 /* boolean */:
                    case 145 /* symbol */:
                    case 36 /* void */:
                        return parseTokenNode();
                }
                // TODO (drosen): Parse string literal types in JSDoc as well.
                return parseJSDocTypeReference();
            }
            function parseJSDocThisType() {
                var result = createNode(418 /* JSDocThisType */);
                nextToken();
                parseExpected(99 /* colon */);
                result.type = parseJSDocType();
                return finishNode(result);
            }
            function parseJSDocConstructorType() {
                var result = createNode(417 /* JSDocConstructorType */);
                nextToken();
                parseExpected(99 /* colon */);
                result.type = parseJSDocType();
                return finishNode(result);
            }
            function parseJSDocVariadicType() {
                var result = createNode(416 /* JSDocVariadicType */);
                nextToken();
                result.type = parseJSDocType();
                return finishNode(result);
            }
            function parseJSDocFunctionType() {
                var result = createNode(415 /* JSDocFunctionType */);
                nextToken();
                parseExpected(42 /* openParen */);
                result.parameters = parseDelimitedList(22 /* JSDocFunctionParameters */, parseJSDocParameter);
                checkForTrailingComma(result.parameters);
                parseExpected(96 /* closeParen */);
                if (token === 99 /* colon */) {
                    nextToken();
                    result.type = parseJSDocType();
                }
                return finishNode(result);
            }
            function parseJSDocParameter() {
                var parameter = createNode(288 /* Parameter */);
                parameter.type = parseJSDocType();
                if (parseOptional(77 /* equals */)) {
                    parameter.questionToken = createNode(77 /* equals */);
                }
                return finishNode(parameter);
            }
            function parseJSDocTypeReference() {
                var result = createNode(413 /* JSDocTypeReference */);
                result.name = parseSimplePropertyName();
                if (token === 49 /* lessThan */) {
                    result.typeArguments = parseTypeArguments();
                }
                else {
                    while (parseOptional(53 /* dot */)) {
                        if (token === 49 /* lessThan */) {
                            result.typeArguments = parseTypeArguments();
                            break;
                        }
                        else {
                            result.name = parseQualifiedName(result.name);
                        }
                    }
                }
                return finishNode(result);
            }
            function parseTypeArguments() {
                // Move past the <
                nextToken();
                var typeArguments = parseDelimitedList(23 /* JSDocTypeArguments */, parseJSDocType);
                checkForTrailingComma(typeArguments);
                checkForEmptyTypeArgumentList(typeArguments);
                parseExpected(61 /* greaterThan */);
                return typeArguments;
            }
            function checkForEmptyTypeArgumentList(typeArguments) {
                if (parseDiagnostics.length === 0 && typeArguments && typeArguments.length === 0) {
                    var start = typeArguments.pos - "<".length;
                    var end = ts.skipTrivia(sourceText, typeArguments.end) + ">".length;
                    return parseErrorAtPosition(start, end - start, ts.Diagnostics.Type_argument_list_cannot_be_empty);
                }
            }
            function parseQualifiedName(left) {
                var result = createNode(285 /* QualifiedName */, left.pos);
                result.left = left;
                result.right = parseIdentifierName();
                return finishNode(result);
            }
            function parseJSDocRecordType() {
                var result = createNode(411 /* JSDocRecordType */);
                nextToken();
                result.members = parseDelimitedList(24 /* JSDocRecordMembers */, parseJSDocRecordMember);
                checkForTrailingComma(result.members);
                parseExpected(98 /* closeBrace */);
                return finishNode(result);
            }
            function parseJSDocRecordMember() {
                var result = createNode(412 /* JSDocRecordMember */);
                result.name = parseSimplePropertyName();
                if (token === 99 /* colon */) {
                    nextToken();
                    result.type = parseJSDocType();
                }
                return finishNode(result);
            }
            function parseJSDocNonNullableType() {
                var result = createNode(410 /* JSDocNonNullableType */);
                nextToken();
                result.type = parseJSDocType();
                return finishNode(result);
            }
            function parseJSDocTupleType() {
                var result = createNode(408 /* JSDocTupleType */);
                nextToken();
                result.types = parseDelimitedList(25 /* JSDocTupleTypes */, parseJSDocType);
                checkForTrailingComma(result.types);
                parseExpected(97 /* closeBracket */);
                return finishNode(result);
            }
            function checkForTrailingComma(list) {
                if (parseDiagnostics.length === 0 && list.hasTrailingComma) {
                    var start = list.end - ",".length;
                    parseErrorAtPosition(start, ",".length, ts.Diagnostics.Trailing_comma_not_allowed);
                }
            }
            function parseJSDocUnionType() {
                var result = createNode(407 /* JSDocUnionType */);
                nextToken();
                result.types = parseJSDocTypeList(parseJSDocType());
                parseExpected(96 /* closeParen */);
                return finishNode(result);
            }
            function parseJSDocTypeList(firstType) {
                ts.Debug.assert(!!firstType);
                var types = [];
                types.pos = firstType.pos;
                types.push(firstType);
                while (parseOptional(71 /* bar */)) {
                    types.push(parseJSDocType());
                }
                types.end = scanner.getStartPos();
                return types;
            }
            function parseJSDocAllType() {
                var result = createNode(404 /* JSDocAllType */);
                nextToken();
                return finishNode(result);
            }
            function parseJSDocUnknownOrNullableType() {
                var pos = scanner.getStartPos();
                // skip the ?
                nextToken();
                // Need to lookahead to decide if this is a nullable or unknown type.
                // Here are cases where we'll pick the unknown type:
                //
                //      Foo(?,
                //      { a: ? }
                //      Foo(?)
                //      Foo<?>
                //      Foo(?=
                //      (?|
                if (token === 92 /* comma */ ||
                    token === 98 /* closeBrace */ ||
                    token === 96 /* closeParen */ ||
                    token === 61 /* greaterThan */ ||
                    token === 77 /* equals */ ||
                    token === 71 /* bar */) {
                    var result = createNode(405 /* JSDocUnknownType */, pos);
                    return finishNode(result);
                }
                else {
                    var result = createNode(409 /* JSDocNullableType */, pos);
                    result.type = parseJSDocType();
                    return finishNode(result);
                }
            }
            function parseIsolatedJSDocComment(content, start, length) {
                initializeState("file.js", content, 2 /* Latest */, /*_syntaxCursor:*/ undefined, 1 /* JS */);
                sourceFile = { languageVariant: 0 /* Standard */, text: content };
                var jsDocComment = parseJSDocCommentWorker(start, length);
                var diagnostics = parseDiagnostics;
                clearState();
                return jsDocComment ? { jsDocComment: jsDocComment, diagnostics: diagnostics } : undefined;
            }
            JSDocParser.parseIsolatedJSDocComment = parseIsolatedJSDocComment;
            function parseJSDocComment(parent, start, length) {
                var saveToken = token;
                var saveParseDiagnosticsLength = parseDiagnostics.length;
                var saveParseErrorBeforeNextFinishedNode = parseErrorBeforeNextFinishedNode;
                var comment = parseJSDocCommentWorker(start, length);
                if (comment) {
                    comment.parent = parent;
                }
                token = saveToken;
                parseDiagnostics.length = saveParseDiagnosticsLength;
                parseErrorBeforeNextFinishedNode = saveParseErrorBeforeNextFinishedNode;
                return comment;
            }
            JSDocParser.parseJSDocComment = parseJSDocComment;
            function parseJSDocCommentWorker(start, length) {
                var content = sourceText;
                start = start || 0;
                var end = length === undefined ? content.length : start + length;
                length = end - start;
                ts.Debug.assert(start >= 0);
                ts.Debug.assert(start <= end);
                ts.Debug.assert(end <= content.length);
                var tags;
                var result;
                // Check for /** (JSDoc opening part)
                if (content.charCodeAt(start) === ts.CharCode.slash &&
                    content.charCodeAt(start + 1) === ts.CharCode.asterisk &&
                    content.charCodeAt(start + 2) === ts.CharCode.asterisk &&
                    content.charCodeAt(start + 3) !== ts.CharCode.asterisk) {
                    // + 3 for leading /**, - 5 in total for /** */
                    scanner.scanRange(start + 3, length - 5, function () {
                        // Initially we can parse out a tag.  We also have seen a starting asterisk.
                        // This is so that /** * @type */ doesn't parse.
                        var canParseTag = true;
                        var seenAsterisk = true;
                        nextJSDocToken();
                        while (token !== 1 /* endOfFile */) {
                            switch (token) {
                                case 40 /* at */:
                                    if (canParseTag) {
                                        parseTag();
                                    }
                                    // This will take us to the end of the line, so it's OK to parse a tag on the next pass through the loop
                                    seenAsterisk = false;
                                    break;
                                case ts.TokenType.newLine:
                                    // After a line break, we can parse a tag, and we haven't seen an asterisk on the next line yet
                                    canParseTag = true;
                                    seenAsterisk = false;
                                    break;
                                case 56 /* asterisk */:
                                    if (seenAsterisk) {
                                        // If we've already seen an asterisk, then we can no longer parse a tag on this line
                                        canParseTag = false;
                                    }
                                    // Ignore the first asterisk on a line
                                    seenAsterisk = true;
                                    break;
                                case 215 /* Identifier */:
                                    // Anything else is doc comment text.  We can't do anything with it.  Because it
                                    // wasn't a tag, we can no longer parse a tag on this line until we hit the next
                                    // line break.
                                    canParseTag = false;
                                    break;
                                case 1 /* endOfFile */:
                                    break;
                            }
                            nextJSDocToken();
                        }
                        result = createJSDocComment();
                    });
                }
                return result;
                function createJSDocComment() {
                    if (!tags) {
                        return undefined;
                    }
                    var result = createNode(419 /* JSDocComment */, start);
                    result.tags = tags;
                    return finishNode(result, end);
                }
                function skipWhitespace() {
                    while (token === ts.TokenType.whitespace || token === ts.TokenType.newLine) {
                        nextJSDocToken();
                    }
                }
                function parseTag() {
                    ts.Debug.assert(token === 40 /* at */);
                    var atToken = createNode(40 /* at */, scanner.getTokenPos());
                    atToken.end = scanner.getTextPos();
                    nextJSDocToken();
                    var tagName = parseJSDocIdentifierName();
                    if (!tagName) {
                        return;
                    }
                    var tag = handleTag(atToken, tagName) || handleUnknownTag(atToken, tagName);
                    addTag(tag);
                }
                function handleTag(atToken, tagName) {
                    if (tagName) {
                        switch (tagName.text) {
                            case "param":
                                return handleParamTag(atToken, tagName);
                            case "return":
                            case "returns":
                                return handleReturnTag(atToken, tagName);
                            case "template":
                                return handleTemplateTag(atToken, tagName);
                            case "type":
                                return handleTypeTag(atToken, tagName);
                            case "typedef":
                                return handleTypedefTag(atToken, tagName);
                        }
                    }
                    return undefined;
                }
                function handleUnknownTag(atToken, tagName) {
                    var result = createNode(420 /* JSDocTag */, atToken.pos);
                    result.atToken = atToken;
                    result.tagName = tagName;
                    return finishNode(result);
                }
                function addTag(tag) {
                    if (tag) {
                        if (!tags) {
                            tags = [];
                            tags.pos = tag.pos;
                        }
                        tags.push(tag);
                        tags.end = tag.end;
                    }
                }
                function tryParseTypeExpression() {
                    if (token !== 31 /* openBrace */) {
                        return undefined;
                    }
                    var typeExpression = parseJSDocTypeExpression();
                    return typeExpression;
                }
                function handleParamTag(atToken, tagName) {
                    var typeExpression = tryParseTypeExpression();
                    skipWhitespace();
                    var name;
                    var isBracketed;
                    // Looking for something like '[foo]' or 'foo'
                    if (parseOptionalToken(43 /* openBracket */)) {
                        name = parseJSDocIdentifierName();
                        isBracketed = true;
                        // May have an optional default, e.g. '[foo = 42]'
                        if (parseOptionalToken(77 /* equals */)) {
                            parseExpression();
                        }
                        parseExpected(97 /* closeBracket */);
                    }
                    else if (ts.tokenIsIdentifierOrKeyword(token)) {
                        name = parseJSDocIdentifierName();
                    }
                    if (!name) {
                        parseErrorAtPosition(scanner.getStartPos(), 0, ts.Diagnostics.Identifier_expected);
                        return undefined;
                    }
                    var preName, postName;
                    if (typeExpression) {
                        postName = name;
                    }
                    else {
                        preName = name;
                    }
                    if (!typeExpression) {
                        typeExpression = tryParseTypeExpression();
                    }
                    var result = createNode(421 /* JSDocParameterTag */, atToken.pos);
                    result.atToken = atToken;
                    result.tagName = tagName;
                    result.preParameterName = preName;
                    result.typeExpression = typeExpression;
                    result.postParameterName = postName;
                    result.isBracketed = isBracketed;
                    return finishNode(result);
                }
                function handleReturnTag(atToken, tagName) {
                    if (ts.forEach(tags, function (t) { return t.kind === 422 /* JSDocReturnTag */; })) {
                        parseErrorAtPosition(tagName.pos, scanner.getTokenPos() - tagName.pos, ts.Diagnostics._0_tag_already_specified, tagName.text);
                    }
                    var result = createNode(422 /* JSDocReturnTag */, atToken.pos);
                    result.atToken = atToken;
                    result.tagName = tagName;
                    result.typeExpression = tryParseTypeExpression();
                    return finishNode(result);
                }
                function handleTypeTag(atToken, tagName) {
                    if (ts.forEach(tags, function (t) { return t.kind === 423 /* JSDocTypeTag */; })) {
                        parseErrorAtPosition(tagName.pos, scanner.getTokenPos() - tagName.pos, ts.Diagnostics._0_tag_already_specified, tagName.text);
                    }
                    var result = createNode(423 /* JSDocTypeTag */, atToken.pos);
                    result.atToken = atToken;
                    result.tagName = tagName;
                    result.typeExpression = tryParseTypeExpression();
                    return finishNode(result);
                }
                function handlePropertyTag(atToken, tagName) {
                    var typeExpression = tryParseTypeExpression();
                    skipWhitespace();
                    var name = parseJSDocIdentifierName();
                    if (!name) {
                        parseErrorAtPosition(scanner.getStartPos(), /*length*/ 0, ts.Diagnostics.Identifier_expected);
                        return undefined;
                    }
                    var result = createNode(426 /* JSDocPropertyTag */, atToken.pos);
                    result.atToken = atToken;
                    result.tagName = tagName;
                    result.name = name;
                    result.typeExpression = typeExpression;
                    return finishNode(result);
                }
                function handleTypedefTag(atToken, tagName) {
                    var typeExpression = tryParseTypeExpression();
                    skipWhitespace();
                    var typedefTag = createNode(425 /* JSDocTypedefTag */, atToken.pos);
                    typedefTag.atToken = atToken;
                    typedefTag.tagName = tagName;
                    typedefTag.name = parseJSDocIdentifierName();
                    typedefTag.typeExpression = typeExpression;
                    if (typeExpression) {
                        if (typeExpression.type.kind === 413 /* JSDocTypeReference */) {
                            var jsDocTypeReference = typeExpression.type;
                            if (jsDocTypeReference.name.kind === 215 /* Identifier */) {
                                var name_4 = jsDocTypeReference.name;
                                if (name_4.text === "Object") {
                                    typedefTag.jsDocTypeLiteral = scanChildTags();
                                }
                            }
                        }
                        if (!typedefTag.jsDocTypeLiteral) {
                            typedefTag.jsDocTypeLiteral = typeExpression.type;
                        }
                    }
                    else {
                        typedefTag.jsDocTypeLiteral = scanChildTags();
                    }
                    return finishNode(typedefTag);
                    function scanChildTags() {
                        var jsDocTypeLiteral = createNode(427 /* JSDocTypeLiteral */, scanner.getStartPos());
                        var resumePos = scanner.getStartPos();
                        var canParseTag = true;
                        var seenAsterisk = false;
                        var parentTagTerminated = false;
                        while (token !== 1 /* endOfFile */ && !parentTagTerminated) {
                            nextJSDocToken();
                            switch (token) {
                                case 40 /* at */:
                                    if (canParseTag) {
                                        parentTagTerminated = !tryParseChildTag(jsDocTypeLiteral);
                                        if (!parentTagTerminated) {
                                            resumePos = scanner.getStartPos();
                                        }
                                    }
                                    seenAsterisk = false;
                                    break;
                                case ts.TokenType.newLine:
                                    resumePos = scanner.getStartPos() - 1;
                                    canParseTag = true;
                                    seenAsterisk = false;
                                    break;
                                case 56 /* asterisk */:
                                    if (seenAsterisk) {
                                        canParseTag = false;
                                    }
                                    seenAsterisk = true;
                                    break;
                                case 215 /* Identifier */:
                                    canParseTag = false;
                                case 1 /* endOfFile */:
                                    break;
                            }
                        }
                        scanner.setTextPos(resumePos);
                        return finishNode(jsDocTypeLiteral);
                    }
                }
                function tryParseChildTag(parentTag) {
                    ts.Debug.assert(token === 40 /* at */);
                    var atToken = createNode(40 /* at */, scanner.getStartPos());
                    atToken.end = scanner.getTextPos();
                    nextJSDocToken();
                    var tagName = parseJSDocIdentifierName();
                    if (!tagName) {
                        return false;
                    }
                    switch (tagName.text) {
                        case "type":
                            if (parentTag.jsDocTypeTag) {
                                // already has a @type tag, terminate the parent tag now.
                                return false;
                            }
                            parentTag.jsDocTypeTag = handleTypeTag(atToken, tagName);
                            return true;
                        case "prop":
                        case "property":
                            if (!parentTag.jsDocPropertyTags) {
                                parentTag.jsDocPropertyTags = [];
                            }
                            var propertyTag = handlePropertyTag(atToken, tagName);
                            parentTag.jsDocPropertyTags.push(propertyTag);
                            return true;
                    }
                    return false;
                }
                function handleTemplateTag(atToken, tagName) {
                    if (ts.forEach(tags, function (t) { return t.kind === 424 /* JSDocTemplateTag */; })) {
                        parseErrorAtPosition(tagName.pos, scanner.getTokenPos() - tagName.pos, ts.Diagnostics._0_tag_already_specified, tagName.text);
                    }
                    // Type parameter list looks like '@template T,U,V'
                    var typeParameters = [];
                    typeParameters.pos = scanner.getStartPos();
                    while (true) {
                        var name_5 = parseJSDocIdentifierName();
                        if (!name_5) {
                            parseErrorAtPosition(scanner.getStartPos(), 0, ts.Diagnostics.Identifier_expected);
                            return undefined;
                        }
                        var typeParameter = createNode(287 /* TypeParameter */, name_5.pos);
                        typeParameter.name = name_5;
                        finishNode(typeParameter);
                        typeParameters.push(typeParameter);
                        if (token === 92 /* comma */) {
                            nextJSDocToken();
                        }
                        else {
                            break;
                        }
                    }
                    var result = createNode(424 /* JSDocTemplateTag */, atToken.pos);
                    result.atToken = atToken;
                    result.tagName = tagName;
                    result.typeParameters = typeParameters;
                    finishNode(result);
                    typeParameters.end = result.end;
                    return result;
                }
                function nextJSDocToken() {
                    return token = scanner.scanJSDocToken();
                }
                function parseJSDocIdentifierName() {
                    return createJSDocIdentifier(ts.tokenIsIdentifierOrKeyword(token));
                }
                function createJSDocIdentifier(isIdentifier) {
                    if (!isIdentifier) {
                        parseErrorAtCurrentToken(ts.Diagnostics.Identifier_expected);
                        return undefined;
                    }
                    var pos = scanner.getTokenPos();
                    var end = scanner.getTextPos();
                    var result = createNode(215 /* Identifier */, pos);
                    result.text = content.substring(pos, end);
                    finishNode(result, end);
                    nextJSDocToken();
                    return result;
                }
            }
            JSDocParser.parseJSDocCommentWorker = parseJSDocCommentWorker;
        })(JSDocParser = Parser.JSDocParser || (Parser.JSDocParser = {}));
    })(Parser || (Parser = {}));
    var IncrementalParser;
    (function (IncrementalParser) {
        function updateSourceFile(sourceFile, newText, textChangeRange, aggressiveChecks) {
            aggressiveChecks = aggressiveChecks || ts.Debug.shouldAssert(2 /* Aggressive */);
            checkChangeRange(sourceFile, newText, textChangeRange, aggressiveChecks);
            if (ts.textChangeRangeIsUnchanged(textChangeRange)) {
                // if the text didn't change, then we can just return our current source file as-is.
                return sourceFile;
            }
            if (sourceFile.statements.length === 0) {
                // If we don't have any statements in the current source file, then there's no real
                // way to incrementally parse.  So just do a full parse instead.
                return Parser.parseSourceFile(sourceFile.fileName, newText, sourceFile.languageVersion, /*syntaxCursor*/ undefined, /*setParentNodes*/ true, sourceFile.scriptKind);
            }
            // Make sure we're not trying to incrementally update a source file more than once.  Once
            // we do an update the original source file is considered unusable from that point onwards.
            //
            // This is because we do incremental parsing in-place.  i.e. we take nodes from the old
            // tree and give them new positions and parents.  From that point on, trusting the old
            // tree at all is not possible as far too much of it may violate invariants.
            var incrementalSourceFile = sourceFile;
            ts.Debug.assert(!incrementalSourceFile.hasBeenIncrementallyParsed);
            incrementalSourceFile.hasBeenIncrementallyParsed = true;
            var oldText = sourceFile.text;
            var syntaxCursor = createSyntaxCursor(sourceFile);
            // Make the actual change larger so that we know to reparse anything whose lookahead
            // might have intersected the change.
            var changeRange = extendToAffectedRange(sourceFile, textChangeRange);
            checkChangeRange(sourceFile, newText, changeRange, aggressiveChecks);
            // Ensure that extending the affected range only moved the start of the change range
            // earlier in the file.
            ts.Debug.assert(changeRange.span.start <= textChangeRange.span.start);
            ts.Debug.assert(ts.textSpanEnd(changeRange.span) === ts.textSpanEnd(textChangeRange.span));
            ts.Debug.assert(ts.textSpanEnd(ts.textChangeRangeNewSpan(changeRange)) === ts.textSpanEnd(ts.textChangeRangeNewSpan(textChangeRange)));
            // The is the amount the nodes after the edit range need to be adjusted.  It can be
            // positive (if the edit added characters), negative (if the edit deleted characters)
            // or zero (if this was a pure overwrite with nothing added/removed).
            var delta = ts.textChangeRangeNewSpan(changeRange).length - changeRange.span.length;
            // If we added or removed characters during the edit, then we need to go and adjust all
            // the nodes after the edit.  Those nodes may move forward (if we inserted chars) or they
            // may move backward (if we deleted chars).
            //
            // Doing this helps us out in two ways.  First, it means that any nodes/tokens we want
            // to reuse are already at the appropriate position in the new text.  That way when we
            // reuse them, we don't have to figure out if they need to be adjusted.  Second, it makes
            // it very easy to determine if we can reuse a node.  If the node's position is at where
            // we are in the text, then we can reuse it.  Otherwise we can't.  If the node's position
            // is ahead of us, then we'll need to rescan tokens.  If the node's position is behind
            // us, then we'll need to skip it or crumble it as appropriate
            //
            // We will also adjust the positions of nodes that intersect the change range as well.
            // By doing this, we ensure that all the positions in the old tree are consistent, not
            // just the positions of nodes entirely before/after the change range.  By being
            // consistent, we can then easily map from positions to nodes in the old tree easily.
            //
            // Also, mark any syntax elements that intersect the changed span.  We know, up front,
            // that we cannot reuse these elements.
            updateTokenPositionsAndMarkElements(incrementalSourceFile, changeRange.span.start, ts.textSpanEnd(changeRange.span), ts.textSpanEnd(ts.textChangeRangeNewSpan(changeRange)), delta, oldText, newText, aggressiveChecks);
            // Now that we've set up our internal incremental state just proceed and parse the
            // source file in the normal fashion.  When possible the parser will retrieve and
            // reuse nodes from the old tree.
            //
            // Note: passing in 'true' for setNodeParents is very important.  When incrementally
            // parsing, we will be reusing nodes from the old tree, and placing it into new
            // parents.  If we don't set the parents now, we'll end up with an observably
            // inconsistent tree.  Setting the parents on the new tree should be very fast.  We
            // will immediately bail out of walking any subtrees when we can see that their parents
            // are already correct.
            var result = Parser.parseSourceFile(sourceFile.fileName, newText, sourceFile.languageVersion, syntaxCursor, /*setParentNodes*/ true, sourceFile.scriptKind);
            return result;
        }
        IncrementalParser.updateSourceFile = updateSourceFile;
        function moveElementEntirelyPastChangeRange(element, isArray, delta, oldText, newText, aggressiveChecks) {
            if (isArray) {
                visitArray(element);
            }
            else {
                visitNode(element);
            }
            return;
            function visitNode(node) {
                var text = "";
                if (aggressiveChecks && shouldCheckNode(node)) {
                    text = oldText.substring(node.pos, node.end);
                }
                // Ditch any existing LS children we may have created.  This way we can avoid
                // moving them forward.
                if (node._children) {
                    node._children = undefined;
                }
                node.pos += delta;
                node.end += delta;
                if (aggressiveChecks && shouldCheckNode(node)) {
                    ts.Debug.assert(text === newText.substring(node.pos, node.end));
                }
                ts.forEachChild(node, visitNode, visitArray);
                if (node.jsDocComments) {
                    for (var _i = 0, _a = node.jsDocComments; _i < _a.length; _i++) {
                        var jsDocComment = _a[_i];
                        ts.forEachChild(jsDocComment, visitNode, visitArray);
                    }
                }
                checkNodePositions(node, aggressiveChecks);
            }
            function visitArray(array) {
                array._children = undefined;
                array.pos += delta;
                array.end += delta;
                for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
                    var node = array_1[_i];
                    visitNode(node);
                }
            }
        }
        function shouldCheckNode(node) {
            switch (node.kind) {
                case 155 /* StringLiteral */:
                case 154 /* NumericLiteral */:
                case 215 /* Identifier */:
                    return true;
            }
            return false;
        }
        function adjustIntersectingElement(element, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta) {
            ts.Debug.assert(element.end >= changeStart, "Adjusting an element that was entirely before the change range");
            ts.Debug.assert(element.pos <= changeRangeOldEnd, "Adjusting an element that was entirely after the change range");
            ts.Debug.assert(element.pos <= element.end);
            // We have an element that intersects the change range in some way.  It may have its
            // start, or its end (or both) in the changed range.  We want to adjust any part
            // that intersects such that the final tree is in a consistent state.  i.e. all
            // children have spans within the span of their parent, and all siblings are ordered
            // properly.
            // We may need to update both the 'pos' and the 'end' of the element.
            // If the 'pos' is before the start of the change, then we don't need to touch it.
            // If it isn't, then the 'pos' must be inside the change.  How we update it will
            // depend if delta is  positive or negative.  If delta is positive then we have
            // something like:
            //
            //  -------------------AAA-----------------
            //  -------------------BBBCCCCCCC-----------------
            //
            // In this case, we consider any node that started in the change range to still be
            // starting at the same position.
            //
            // however, if the delta is negative, then we instead have something like this:
            //
            //  -------------------XXXYYYYYYY-----------------
            //  -------------------ZZZ-----------------
            //
            // In this case, any element that started in the 'X' range will keep its position.
            // However any element that started after that will have their pos adjusted to be
            // at the end of the new range.  i.e. any node that started in the 'Y' range will
            // be adjusted to have their start at the end of the 'Z' range.
            //
            // The element will keep its position if possible.  Or Move backward to the new-end
            // if it's in the 'Y' range.
            element.pos = Math.min(element.pos, changeRangeNewEnd);
            // If the 'end' is after the change range, then we always adjust it by the delta
            // amount.  However, if the end is in the change range, then how we adjust it
            // will depend on if delta is  positive or negative.  If delta is positive then we
            // have something like:
            //
            //  -------------------AAA-----------------
            //  -------------------BBBCCCCCCC-----------------
            //
            // In this case, we consider any node that ended inside the change range to keep its
            // end position.
            //
            // however, if the delta is negative, then we instead have something like this:
            //
            //  -------------------XXXYYYYYYY-----------------
            //  -------------------ZZZ-----------------
            //
            // In this case, any element that ended in the 'X' range will keep its position.
            // However any element that ended after that will have their pos adjusted to be
            // at the end of the new range.  i.e. any node that ended in the 'Y' range will
            // be adjusted to have their end at the end of the 'Z' range.
            if (element.end >= changeRangeOldEnd) {
                // Element ends after the change range.  Always adjust the end pos.
                element.end += delta;
            }
            else {
                // Element ends in the change range.  The element will keep its position if
                // possible. Or Move backward to the new-end if it's in the 'Y' range.
                element.end = Math.min(element.end, changeRangeNewEnd);
            }
            ts.Debug.assert(element.pos <= element.end);
            if (element.parent) {
                ts.Debug.assert(element.pos >= element.parent.pos);
                ts.Debug.assert(element.end <= element.parent.end);
            }
        }
        function checkNodePositions(node, aggressiveChecks) {
            if (aggressiveChecks) {
                var pos_1 = node.pos;
                ts.forEachChild(node, function (child) {
                    ts.Debug.assert(child.pos >= pos_1);
                    pos_1 = child.end;
                });
                ts.Debug.assert(pos_1 <= node.end);
            }
        }
        function updateTokenPositionsAndMarkElements(sourceFile, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta, oldText, newText, aggressiveChecks) {
            visitNode(sourceFile);
            return;
            function visitNode(child) {
                ts.Debug.assert(child.pos <= child.end);
                if (child.pos > changeRangeOldEnd) {
                    // Node is entirely past the change range.  We need to move both its pos and
                    // end, forward or backward appropriately.
                    moveElementEntirelyPastChangeRange(child, /*isArray*/ false, delta, oldText, newText, aggressiveChecks);
                    return;
                }
                // Check if the element intersects the change range.  If it does, then it is not
                // reusable.  Also, we'll need to recurse to see what constituent portions we may
                // be able to use.
                var fullEnd = child.end;
                if (fullEnd >= changeStart) {
                    child.intersectsChange = true;
                    child._children = undefined;
                    // Adjust the pos or end (or both) of the intersecting element accordingly.
                    adjustIntersectingElement(child, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta);
                    ts.forEachChild(child, visitNode, visitArray);
                    checkNodePositions(child, aggressiveChecks);
                    return;
                }
                // Otherwise, the node is entirely before the change range.  No need to do anything with it.
                ts.Debug.assert(fullEnd < changeStart);
            }
            function visitArray(array) {
                ts.Debug.assert(array.pos <= array.end);
                if (array.pos > changeRangeOldEnd) {
                    // Array is entirely after the change range.  We need to move it, and move any of
                    // its children.
                    moveElementEntirelyPastChangeRange(array, /*isArray*/ true, delta, oldText, newText, aggressiveChecks);
                    return;
                }
                // Check if the element intersects the change range.  If it does, then it is not
                // reusable.  Also, we'll need to recurse to see what constituent portions we may
                // be able to use.
                var fullEnd = array.end;
                if (fullEnd >= changeStart) {
                    array.intersectsChange = true;
                    array._children = undefined;
                    // Adjust the pos or end (or both) of the intersecting array accordingly.
                    adjustIntersectingElement(array, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta);
                    for (var _i = 0, array_2 = array; _i < array_2.length; _i++) {
                        var node = array_2[_i];
                        visitNode(node);
                    }
                    return;
                }
                // Otherwise, the array is entirely before the change range.  No need to do anything with it.
                ts.Debug.assert(fullEnd < changeStart);
            }
        }
        function extendToAffectedRange(sourceFile, changeRange) {
            // Consider the following code:
            //      void foo() { /; }
            //
            // If the text changes with an insertion of / just before the semicolon then we end up with:
            //      void foo() { //; }
            //
            // If we were to just use the changeRange a is, then we would not rescan the { token
            // (as it does not intersect the actual original change range).  Because an edit may
            // change the token touching it, we actually need to look back *at least* one token so
            // that the prior token sees that change.
            var maxLookahead = 1;
            var start = changeRange.span.start;
            // the first iteration aligns us with the change start. subsequent iteration move us to
            // the left by maxLookahead tokens.  We only need to do this as long as we're not at the
            // start of the tree.
            for (var i = 0; start > 0 && i <= maxLookahead; i++) {
                var nearestNode = findNearestNodeStartingBeforeOrAtPosition(sourceFile, start);
                ts.Debug.assert(nearestNode.pos <= start);
                var position = nearestNode.pos;
                start = Math.max(0, position - 1);
            }
            var finalSpan = ts.createTextSpanFromBounds(start, ts.textSpanEnd(changeRange.span));
            var finalLength = changeRange.newLength + (changeRange.span.start - start);
            return ts.createTextChangeRange(finalSpan, finalLength);
        }
        function findNearestNodeStartingBeforeOrAtPosition(sourceFile, position) {
            var bestResult = sourceFile;
            var lastNodeEntirelyBeforePosition;
            ts.forEachChild(sourceFile, visit);
            if (lastNodeEntirelyBeforePosition) {
                var lastChildOfLastEntireNodeBeforePosition = getLastChild(lastNodeEntirelyBeforePosition);
                if (lastChildOfLastEntireNodeBeforePosition.pos > bestResult.pos) {
                    bestResult = lastChildOfLastEntireNodeBeforePosition;
                }
            }
            return bestResult;
            function getLastChild(node) {
                while (true) {
                    var lastChild = getLastChildWorker(node);
                    if (lastChild) {
                        node = lastChild;
                    }
                    else {
                        return node;
                    }
                }
            }
            function getLastChildWorker(node) {
                var last = undefined;
                ts.forEachChild(node, function (child) {
                    if (ts.nodeIsPresent(child)) {
                        last = child;
                    }
                });
                return last;
            }
            function visit(child) {
                if (ts.nodeIsMissing(child)) {
                    // Missing nodes are effectively invisible to us.  We never even consider them
                    // When trying to find the nearest node before us.
                    return;
                }
                // If the child intersects this position, then this node is currently the nearest
                // node that starts before the position.
                if (child.pos <= position) {
                    if (child.pos >= bestResult.pos) {
                        // This node starts before the position, and is closer to the position than
                        // the previous best node we found.  It is now the new best node.
                        bestResult = child;
                    }
                    // Now, the node may overlap the position, or it may end entirely before the
                    // position.  If it overlaps with the position, then either it, or one of its
                    // children must be the nearest node before the position.  So we can just
                    // recurse into this child to see if we can find something better.
                    if (position < child.end) {
                        // The nearest node is either this child, or one of the children inside
                        // of it.  We've already marked this child as the best so far.  Recurse
                        // in case one of the children is better.
                        ts.forEachChild(child, visit);
                        // Once we look at the children of this node, then there's no need to
                        // continue any further.
                        return true;
                    }
                    else {
                        ts.Debug.assert(child.end <= position);
                        // The child ends entirely before this position.  Say you have the following
                        // (where $ is the position)
                        //
                        //      <complex expr 1> ? <complex expr 2> $ : <...> <...>
                        //
                        // We would want to find the nearest preceding node in "complex expr 2".
                        // To support that, we keep track of this node, and once we're done searching
                        // for a best node, we recurse down this node to see if we can find a good
                        // result in it.
                        //
                        // This approach allows us to quickly skip over nodes that are entirely
                        // before the position, while still allowing us to find any nodes in the
                        // last one that might be what we want.
                        lastNodeEntirelyBeforePosition = child;
                    }
                }
                else {
                    ts.Debug.assert(child.pos > position);
                    // We're now at a node that is entirely past the position we're searching for.
                    // This node (and all following nodes) could never contribute to the result,
                    // so just skip them by returning 'true' here.
                    return true;
                }
            }
        }
        function checkChangeRange(sourceFile, newText, textChangeRange, aggressiveChecks) {
            var oldText = sourceFile.text;
            if (textChangeRange) {
                ts.Debug.assert((oldText.length - textChangeRange.span.length + textChangeRange.newLength) === newText.length);
                if (aggressiveChecks || ts.Debug.shouldAssert(3 /* VeryAggressive */)) {
                    var oldTextPrefix = oldText.substr(0, textChangeRange.span.start);
                    var newTextPrefix = newText.substr(0, textChangeRange.span.start);
                    ts.Debug.assert(oldTextPrefix === newTextPrefix);
                    var oldTextSuffix = oldText.substring(ts.textSpanEnd(textChangeRange.span), oldText.length);
                    var newTextSuffix = newText.substring(ts.textSpanEnd(ts.textChangeRangeNewSpan(textChangeRange)), newText.length);
                    ts.Debug.assert(oldTextSuffix === newTextSuffix);
                }
            }
        }
        function createSyntaxCursor(sourceFile) {
            var currentArray = sourceFile.statements;
            var currentArrayIndex = 0;
            ts.Debug.assert(currentArrayIndex < currentArray.length);
            var current = currentArray[currentArrayIndex];
            var lastQueriedPosition = -1 /* Value */;
            return {
                currentNode: function (position) {
                    // Only compute the current node if the position is different than the last time
                    // we were asked.  The parser commonly asks for the node at the same position
                    // twice.  Once to know if can read an appropriate list element at a certain point,
                    // and then to actually read and consume the node.
                    if (position !== lastQueriedPosition) {
                        // Much of the time the parser will need the very next node in the array that
                        // we just returned a node from.So just simply check for that case and move
                        // forward in the array instead of searching for the node again.
                        if (current && current.end === position && currentArrayIndex < (currentArray.length - 1)) {
                            currentArrayIndex++;
                            current = currentArray[currentArrayIndex];
                        }
                        // If we don't have a node, or the node we have isn't in the right position,
                        // then try to find a viable node at the position requested.
                        if (!current || current.pos !== position) {
                            findHighestListElementThatStartsAtPosition(position);
                        }
                    }
                    // Cache this query so that we don't do any extra work if the parser calls back
                    // into us.  Note: this is very common as the parser will make pairs of calls like
                    // 'isListElement -> parseListElement'.  If we were unable to find a node when
                    // called with 'isListElement', we don't want to redo the work when parseListElement
                    // is called immediately after.
                    lastQueriedPosition = position;
                    // Either we don'd have a node, or we have a node at the position being asked for.
                    ts.Debug.assert(!current || current.pos === position);
                    return current;
                }
            };
            // Finds the highest element in the tree we can find that starts at the provided position.
            // The element must be a direct child of some node list in the tree.  This way after we
            // return it, we can easily return its next sibling in the list.
            function findHighestListElementThatStartsAtPosition(position) {
                // Clear out any cached state about the last node we found.
                currentArray = undefined;
                currentArrayIndex = -1 /* Value */;
                current = undefined;
                // Recurse into the source file to find the highest node at this position.
                ts.forEachChild(sourceFile, visitNode, visitArray);
                return;
                function visitNode(node) {
                    if (position >= node.pos && position < node.end) {
                        // Position was within this node.  Keep searching deeper to find the node.
                        ts.forEachChild(node, visitNode, visitArray);
                        // don't proceed any further in the search.
                        return true;
                    }
                    // position wasn't in this node, have to keep searching.
                    return false;
                }
                function visitArray(array) {
                    if (position >= array.pos && position < array.end) {
                        // position was in this array.  Search through this array to see if we find a
                        // viable element.
                        for (var i = 0, n = array.length; i < n; i++) {
                            var child = array[i];
                            if (child) {
                                if (child.pos === position) {
                                    // Found the right node.  We're done.
                                    currentArray = array;
                                    currentArrayIndex = i;
                                    current = child;
                                    return true;
                                }
                                else {
                                    if (child.pos < position && position < child.end) {
                                        // Position in somewhere within this child.  Search in it and
                                        // stop searching in this array.
                                        ts.forEachChild(child, visitNode, visitArray);
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                    // position wasn't in this array, have to keep searching.
                    return false;
                }
            }
        }
    })(IncrementalParser || (IncrementalParser = {}));
})(ts || (ts = {}));
//# sourceMappingURL=parser.js.map