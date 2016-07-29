///<reference path='..\services.ts' />
///<reference path='formattingScanner.ts' />
///<reference path='rulesProvider.ts' />
///<reference path='references.ts' />
/* @internal */
var ts;
(function (ts) {
    var formatting;
    (function (formatting) {
        function formatOnEnter(position, sourceFile, rulesProvider, options) {
            var line = sourceFile.getLineAndCharacterOfPosition(position).line;
            if (line === 0) {
                return [];
            }
            // After the enter key, the cursor is now at a new line. The new line may or may not contain non-whitespace characters.
            // If the new line has only whitespaces, we won't want to format this line, because that would remove the indentation as
            // trailing whitespaces. So the end of the formatting span should be the later one between:
            //  1. the end of the previous line
            //  2. the last non-whitespace character in the current line
            var endOfFormatSpan = ts.getEndLinePosition(line, sourceFile);
            while (ts.isNoBreakWhiteSpace(sourceFile.text.charCodeAt(endOfFormatSpan))) {
                endOfFormatSpan--;
            }
            // if the character at the end of the span is a line break, we shouldn't include it, because it indicates we don't want to
            // touch the current line at all. Also, on some OSes the line break consists of two characters (\r\n), we should test if the
            // previous character before the end of format span is line break character as well.
            if (ts.isLineBreak(sourceFile.text.charCodeAt(endOfFormatSpan))) {
                endOfFormatSpan--;
            }
            var span = {
                // get start position for the previous line
                pos: ts.getStartPositionOfLine(line - 1, sourceFile),
                // end value is exclusive so add 1 to the result
                end: endOfFormatSpan + 1
            };
            return formatSpan(span, sourceFile, options, rulesProvider, 2 /* FormatOnEnter */);
        }
        formatting.formatOnEnter = formatOnEnter;
        function formatOnSemicolon(position, sourceFile, rulesProvider, options) {
            return formatOutermostParent(position, SyntaxKind.SemicolonToken, sourceFile, options, rulesProvider, 3 /* FormatOnSemicolon */);
        }
        formatting.formatOnSemicolon = formatOnSemicolon;
        function formatOnClosingCurly(position, sourceFile, rulesProvider, options) {
            return formatOutermostParent(position, SyntaxKind.CloseBraceToken, sourceFile, options, rulesProvider, 4 /* FormatOnClosingCurlyBrace */);
        }
        formatting.formatOnClosingCurly = formatOnClosingCurly;
        function formatDocument(sourceFile, rulesProvider, options) {
            var span = {
                pos: 0,
                end: sourceFile.text.length
            };
            return formatSpan(span, sourceFile, options, rulesProvider, 0 /* FormatDocument */);
        }
        formatting.formatDocument = formatDocument;
        function formatSelection(start, end, sourceFile, rulesProvider, options) {
            // format from the beginning of the line
            var span = {
                pos: ts.getLineStartPositionForPosition(start, sourceFile),
                end: end
            };
            return formatSpan(span, sourceFile, options, rulesProvider, 1 /* FormatSelection */);
        }
        formatting.formatSelection = formatSelection;
        function formatOutermostParent(position, expectedLastToken, sourceFile, options, rulesProvider, requestKind) {
            var parent = findOutermostParent(position, expectedLastToken, sourceFile);
            if (!parent) {
                return [];
            }
            var span = {
                pos: ts.getLineStartPositionForPosition(parent.getStart(sourceFile), sourceFile),
                end: parent.end
            };
            return formatSpan(span, sourceFile, options, rulesProvider, requestKind);
        }
        function findOutermostParent(position, expectedTokenKind, sourceFile) {
            var precedingToken = ts.findPrecedingToken(position, sourceFile);
            // when it is claimed that trigger character was typed at given position
            // we verify that there is a token with a matching kind whose end is equal to position (because the character was just typed).
            // If this condition is not hold - then trigger character was typed in some other context,
            // i.e.in comment and thus should not trigger autoformatting
            if (!precedingToken ||
                precedingToken.kind !== expectedTokenKind ||
                position !== precedingToken.getEnd()) {
                return undefined;
            }
            // walk up and search for the parent node that ends at the same position with precedingToken.
            // for cases like this
            //
            // let x = 1;
            // while (true) {
            // }
            // after typing close curly in while statement we want to reformat just the while statement.
            // However if we just walk upwards searching for the parent that has the same end value -
            // we'll end up with the whole source file. isListElement allows to stop on the list element level
            var current = precedingToken;
            while (current &&
                current.parent &&
                current.parent.end === precedingToken.end &&
                !isListElement(current.parent, current)) {
                current = current.parent;
            }
            return current;
        }
        // Returns true if node is a element in some list in parent
        // i.e. parent is class declaration with the list of members and node is one of members.
        function isListElement(parent, node) {
            switch (parent.kind) {
                case SyntaxKind.ClassDeclaration:
                case SyntaxKind.InterfaceDeclaration:
                    return ts.rangeContainsRange(parent.members, node);
                case SyntaxKind.ModuleDeclaration:
                    var body = parent.body;
                    return body && body.kind === SyntaxKind.Block && ts.rangeContainsRange(body.statements, node);
                case SyntaxKind.SourceFile:
                case SyntaxKind.Block:
                case SyntaxKind.ModuleBlock:
                    return ts.rangeContainsRange(parent.statements, node);
                case SyntaxKind.CatchClause:
                    return ts.rangeContainsRange(parent.block.statements, node);
            }
            return false;
        }
        /** find node that fully contains given text range */
        function findEnclosingNode(range, sourceFile) {
            return find(sourceFile);
            function find(n) {
                var candidate = ts.forEachChild(n, function (c) { return ts.startEndContainsRange(c.getStart(sourceFile), c.end, range) && c; });
                if (candidate) {
                    var result = find(candidate);
                    if (result) {
                        return result;
                    }
                }
                return n;
            }
        }
        /** formatting is not applied to ranges that contain parse errors.
          * This function will return a predicate that for a given text range will tell
          * if there are any parse errors that overlap with the range.
          */
        function prepareRangeContainsErrorFunction(errors, originalRange) {
            if (!errors.length) {
                return rangeHasNoErrors;
            }
            // pick only errors that fall in range
            var sorted = errors
                .filter(function (d) { return ts.rangeOverlapsWithStartEnd(originalRange, d.start, d.start + d.length); })
                .sort(function (e1, e2) { return e1.start - e2.start; });
            if (!sorted.length) {
                return rangeHasNoErrors;
            }
            var index = 0;
            return function (r) {
                // in current implementation sequence of arguments [r1, r2...] is monotonically increasing.
                // 'index' tracks the index of the most recent error that was checked.
                while (true) {
                    if (index >= sorted.length) {
                        // all errors in the range were already checked -> no error in specified range
                        return false;
                    }
                    var error_1 = sorted[index];
                    if (r.end <= error_1.start) {
                        // specified range ends before the error refered by 'index' - no error in range
                        return false;
                    }
                    if (ts.startEndOverlapsWithStartEnd(r.pos, r.end, error_1.start, error_1.start + error_1.length)) {
                        // specified range overlaps with error range
                        return true;
                    }
                    index++;
                }
            };
            function rangeHasNoErrors(r) {
                return false;
            }
        }
        /**
          * Start of the original range might fall inside the comment - scanner will not yield appropriate results
          * This function will look for token that is located before the start of target range
          * and return its end as start position for the scanner.
          */
        function getScanStartPosition(enclosingNode, originalRange, sourceFile) {
            var start = enclosingNode.getStart(sourceFile);
            if (start === originalRange.pos && enclosingNode.end === originalRange.end) {
                return start;
            }
            var precedingToken = ts.findPrecedingToken(originalRange.pos, sourceFile);
            if (!precedingToken) {
                // no preceding token found - start from the beginning of enclosing node
                return enclosingNode.pos;
            }
            // preceding token ends after the start of original range (i.e when originalRange.pos falls in the middle of literal)
            // start from the beginning of enclosingNode to handle the entire 'originalRange'
            if (precedingToken.end >= originalRange.pos) {
                return enclosingNode.pos;
            }
            return precedingToken.end;
        }
        /*
         * For cases like
         * if (a ||
         *     b ||$
         *     c) {...}
         * If we hit Enter at $ we want line '    b ||' to be indented.
         * Formatting will be applied to the last two lines.
         * Node that fully encloses these lines is binary expression 'a ||...'.
         * Initial indentation for this node will be 0.
         * Binary expressions don't introduce new indentation scopes, however it is possible
         * that some parent node on the same line does - like if statement in this case.
         * Note that we are considering parents only from the same line with initial node -
         * if parent is on the different line - its delta was already contributed
         * to the initial indentation.
         */
        function getOwnOrInheritedDelta(n, options, sourceFile) {
            var previousLine = -1 /* Unknown */;
            var child;
            while (n) {
                var line = sourceFile.getLineAndCharacterOfPosition(n.getStart(sourceFile)).line;
                if (previousLine !== -1 /* Unknown */ && line !== previousLine) {
                    break;
                }
                if (formatting.SmartIndenter.shouldIndentChildNode(n, child)) {
                    return options.IndentSize;
                }
                previousLine = line;
                child = n;
                n = n.parent;
            }
            return 0;
        }
        function formatSpan(originalRange, sourceFile, options, rulesProvider, requestKind) {
            var rangeContainsError = prepareRangeContainsErrorFunction(sourceFile.parseDiagnostics, originalRange);
            // formatting context is used by rules provider
            var formattingContext = new formatting.FormattingContext(sourceFile, requestKind);
            // find the smallest node that fully wraps the range and compute the initial indentation for the node
            var enclosingNode = findEnclosingNode(originalRange, sourceFile);
            var formattingScanner = formatting.getFormattingScanner(sourceFile, getScanStartPosition(enclosingNode, originalRange, sourceFile), originalRange.end);
            var initialIndentation = formatting.SmartIndenter.getIndentationForNode(enclosingNode, originalRange, sourceFile, options);
            var previousRangeHasError;
            var previousRange;
            var previousParent;
            var previousRangeStartLine;
            var lastIndentedLine;
            var indentationOnLastIndentedLine;
            var edits = [];
            formattingScanner.advance();
            if (formattingScanner.isOnToken()) {
                var startLine = sourceFile.getLineAndCharacterOfPosition(enclosingNode.getStart(sourceFile)).line;
                var undecoratedStartLine = startLine;
                if (enclosingNode.decorators) {
                    undecoratedStartLine = sourceFile.getLineAndCharacterOfPosition(ts.getNonDecoratorTokenPosOfNode(enclosingNode, sourceFile)).line;
                }
                var delta = getOwnOrInheritedDelta(enclosingNode, options, sourceFile);
                processNode(enclosingNode, enclosingNode, startLine, undecoratedStartLine, initialIndentation, delta);
            }
            if (!formattingScanner.isOnToken()) {
                var leadingTrivia = formattingScanner.getCurrentLeadingTrivia();
                if (leadingTrivia) {
                    processTrivia(leadingTrivia, enclosingNode, enclosingNode, undefined);
                    trimTrailingWhitespacesForRemainingRange();
                }
            }
            formattingScanner.close();
            return edits;
            // local functions
            /** Tries to compute the indentation for a list element.
              * If list element is not in range then
              * function will pick its actual indentation
              * so it can be pushed downstream as inherited indentation.
              * If list element is in the range - its indentation will be equal
              * to inherited indentation from its predecessors.
              */
            function tryComputeIndentationForListItem(startPos, endPos, parentStartLine, range, inheritedIndentation) {
                if (ts.rangeOverlapsWithStartEnd(range, startPos, endPos) ||
                    ts.rangeContainsStartEnd(range, startPos, endPos) /* Not to miss zero-range nodes e.g. JsxText */) {
                    if (inheritedIndentation !== -1 /* Unknown */) {
                        return inheritedIndentation;
                    }
                }
                else {
                    var startLine = sourceFile.getLineAndCharacterOfPosition(startPos).line;
                    var startLinePosition = ts.getLineStartPositionForPosition(startPos, sourceFile);
                    var column = formatting.SmartIndenter.findFirstNonWhitespaceColumn(startLinePosition, startPos, sourceFile, options);
                    if (startLine !== parentStartLine || startPos === column) {
                        // Use the base indent size if it is greater than
                        // the indentation of the inherited predecessor.
                        var baseIndentSize = formatting.SmartIndenter.getBaseIndentation(options);
                        return baseIndentSize > column ? baseIndentSize : column;
                    }
                }
                return -1 /* Unknown */;
            }
            function computeIndentation(node, startLine, inheritedIndentation, parent, parentDynamicIndentation, effectiveParentStartLine) {
                var indentation = inheritedIndentation;
                var delta = formatting.SmartIndenter.shouldIndentChildNode(node) ? options.IndentSize : 0;
                if (effectiveParentStartLine === startLine) {
                    // if node is located on the same line with the parent
                    // - inherit indentation from the parent
                    // - push children if either parent of node itself has non-zero delta
                    indentation = startLine === lastIndentedLine
                        ? indentationOnLastIndentedLine
                        : parentDynamicIndentation.getIndentation();
                    delta = Math.min(options.IndentSize, parentDynamicIndentation.getDelta(node) + delta);
                }
                else if (indentation === -1 /* Unknown */) {
                    if (formatting.SmartIndenter.childStartsOnTheSameLineWithElseInIfStatement(parent, node, startLine, sourceFile)) {
                        indentation = parentDynamicIndentation.getIndentation();
                    }
                    else {
                        indentation = parentDynamicIndentation.getIndentation() + parentDynamicIndentation.getDelta(node);
                    }
                }
                return {
                    indentation: indentation,
                    delta: delta
                };
            }
            function getFirstNonDecoratorTokenOfNode(node) {
                if (node.modifiers && node.modifiers.length) {
                    return node.modifiers[0].kind;
                }
                switch (node.kind) {
                    case SyntaxKind.ClassDeclaration: return SyntaxKind.ClassKeyword;
                    case SyntaxKind.InterfaceDeclaration: return SyntaxKind.InterfaceKeyword;
                    case SyntaxKind.FunctionDeclaration: return SyntaxKind.FunctionKeyword;
                    case SyntaxKind.EnumDeclaration: return SyntaxKind.EnumDeclaration;
                    case SyntaxKind.GetAccessor: return SyntaxKind.GetKeyword;
                    case SyntaxKind.SetAccessor: return SyntaxKind.SetKeyword;
                    case SyntaxKind.MethodDeclaration:
                        if (node.asteriskToken) {
                            return SyntaxKind.AsteriskToken;
                        }
                    // fall-through
                    case SyntaxKind.PropertyDeclaration:
                    case SyntaxKind.Parameter:
                        return node.name.kind;
                }
            }
            function getDynamicIndentation(node, nodeStartLine, indentation, delta) {
                return {
                    getIndentationForComment: function (kind, tokenIndentation, container) {
                        switch (kind) {
                            // preceding comment to the token that closes the indentation scope inherits the indentation from the scope
                            // ..  {
                            //     // comment
                            // }
                            case SyntaxKind.CloseBraceToken:
                            case SyntaxKind.CloseBracketToken:
                            case SyntaxKind.CloseParenToken:
                                return indentation + getEffectiveDelta(delta, container);
                        }
                        return tokenIndentation !== -1 /* Unknown */ ? tokenIndentation : indentation;
                    },
                    getIndentationForToken: function (line, kind, container) {
                        if (nodeStartLine !== line && node.decorators) {
                            if (kind === getFirstNonDecoratorTokenOfNode(node)) {
                                // if this token is the first token following the list of decorators, we do not need to indent
                                return indentation;
                            }
                        }
                        switch (kind) {
                            // open and close brace, 'else' and 'while' (in do statement) tokens has indentation of the parent
                            case SyntaxKind.OpenBraceToken:
                            case SyntaxKind.CloseBraceToken:
                            case SyntaxKind.OpenBracketToken:
                            case SyntaxKind.CloseBracketToken:
                            case SyntaxKind.OpenParenToken:
                            case SyntaxKind.CloseParenToken:
                            case SyntaxKind.ElseKeyword:
                            case SyntaxKind.WhileKeyword:
                            case SyntaxKind.AtToken:
                                return indentation;
                            default:
                                // if token line equals to the line of containing node (this is a first token in the node) - use node indentation
                                return nodeStartLine !== line ? indentation + getEffectiveDelta(delta, container) : indentation;
                        }
                    },
                    getIndentation: function () { return indentation; },
                    getDelta: function (child) { return getEffectiveDelta(delta, child); },
                    recomputeIndentation: function (lineAdded) {
                        if (node.parent && formatting.SmartIndenter.shouldIndentChildNode(node.parent, node)) {
                            if (lineAdded) {
                                indentation += options.IndentSize;
                            }
                            else {
                                indentation -= options.IndentSize;
                            }
                            if (formatting.SmartIndenter.shouldIndentChildNode(node)) {
                                delta = options.IndentSize;
                            }
                            else {
                                delta = 0;
                            }
                        }
                    }
                };
                function getEffectiveDelta(delta, child) {
                    // Delta value should be zero when the node explicitly prevents indentation of the child node
                    return formatting.SmartIndenter.nodeWillIndentChild(node, child, true) ? delta : 0;
                }
            }
            function processNode(node, contextNode, nodeStartLine, undecoratedNodeStartLine, indentation, delta) {
                if (!ts.rangeOverlapsWithStartEnd(originalRange, node.getStart(sourceFile), node.getEnd())) {
                    return;
                }
                var nodeDynamicIndentation = getDynamicIndentation(node, nodeStartLine, indentation, delta);
                // a useful observations when tracking context node
                //        /
                //      [a]
                //   /   |   \
                //  [b] [c] [d]
                // node 'a' is a context node for nodes 'b', 'c', 'd'
                // except for the leftmost leaf token in [b] - in this case context node ('e') is located somewhere above 'a'
                // this rule can be applied recursively to child nodes of 'a'.
                //
                // context node is set to parent node value after processing every child node
                // context node is set to parent of the token after processing every token
                var childContextNode = contextNode;
                // if there are any tokens that logically belong to node and interleave child nodes
                // such tokens will be consumed in processChildNode for for the child that follows them
                ts.forEachChild(node, function (child) {
                    processChildNode(child, /*inheritedIndentation*/ -1 /* Unknown */, node, nodeDynamicIndentation, nodeStartLine, undecoratedNodeStartLine, /*isListItem*/ false);
                }, function (nodes) {
                    processChildNodes(nodes, node, nodeStartLine, nodeDynamicIndentation);
                });
                // proceed any tokens in the node that are located after child nodes
                while (formattingScanner.isOnToken()) {
                    var tokenInfo = formattingScanner.readTokenInfo(node);
                    if (tokenInfo.token.end > node.end) {
                        break;
                    }
                    consumeTokenAndAdvanceScanner(tokenInfo, node, nodeDynamicIndentation);
                }
                function processChildNode(child, inheritedIndentation, parent, parentDynamicIndentation, parentStartLine, undecoratedParentStartLine, isListItem, isFirstListItem) {
                    var childStartPos = child.getStart(sourceFile);
                    var childStartLine = sourceFile.getLineAndCharacterOfPosition(childStartPos).line;
                    var undecoratedChildStartLine = childStartLine;
                    if (child.decorators) {
                        undecoratedChildStartLine = sourceFile.getLineAndCharacterOfPosition(ts.getNonDecoratorTokenPosOfNode(child, sourceFile)).line;
                    }
                    // if child is a list item - try to get its indentation
                    var childIndentationAmount = -1 /* Unknown */;
                    if (isListItem) {
                        childIndentationAmount = tryComputeIndentationForListItem(childStartPos, child.end, parentStartLine, originalRange, inheritedIndentation);
                        if (childIndentationAmount !== -1 /* Unknown */) {
                            inheritedIndentation = childIndentationAmount;
                        }
                    }
                    // child node is outside the target range - do not dive inside
                    if (!ts.rangeOverlapsWithStartEnd(originalRange, child.pos, child.end)) {
                        if (child.end < originalRange.pos) {
                            formattingScanner.skipToEndOf(child);
                        }
                        return inheritedIndentation;
                    }
                    if (child.getFullWidth() === 0) {
                        return inheritedIndentation;
                    }
                    while (formattingScanner.isOnToken()) {
                        // proceed any parent tokens that are located prior to child.getStart()
                        var tokenInfo = formattingScanner.readTokenInfo(node);
                        if (tokenInfo.token.end > childStartPos) {
                            // stop when formatting scanner advances past the beginning of the child
                            break;
                        }
                        consumeTokenAndAdvanceScanner(tokenInfo, node, parentDynamicIndentation);
                    }
                    if (!formattingScanner.isOnToken()) {
                        return inheritedIndentation;
                    }
                    if (ts.isToken(child)) {
                        // if child node is a token, it does not impact indentation, proceed it using parent indentation scope rules
                        var tokenInfo = formattingScanner.readTokenInfo(child);
                        ts.Debug.assert(tokenInfo.token.end === child.end);
                        consumeTokenAndAdvanceScanner(tokenInfo, node, parentDynamicIndentation, child);
                        return inheritedIndentation;
                    }
                    var effectiveParentStartLine = child.kind === SyntaxKind.Decorator ? childStartLine : undecoratedParentStartLine;
                    var childIndentation = computeIndentation(child, childStartLine, childIndentationAmount, node, parentDynamicIndentation, effectiveParentStartLine);
                    processNode(child, childContextNode, childStartLine, undecoratedChildStartLine, childIndentation.indentation, childIndentation.delta);
                    childContextNode = node;
                    if (isFirstListItem && parent.kind === SyntaxKind.ArrayLiteralExpression && inheritedIndentation === -1 /* Unknown */) {
                        inheritedIndentation = childIndentation.indentation;
                    }
                    return inheritedIndentation;
                }
                function processChildNodes(nodes, parent, parentStartLine, parentDynamicIndentation) {
                    var listStartToken = getOpenTokenForList(parent, nodes);
                    var listEndToken = getCloseTokenForOpenToken(listStartToken);
                    var listDynamicIndentation = parentDynamicIndentation;
                    var startLine = parentStartLine;
                    if (listStartToken !== SyntaxKind.Unknown) {
                        // introduce a new indentation scope for lists (including list start and end tokens)
                        while (formattingScanner.isOnToken()) {
                            var tokenInfo = formattingScanner.readTokenInfo(parent);
                            if (tokenInfo.token.end > nodes.pos) {
                                // stop when formatting scanner moves past the beginning of node list
                                break;
                            }
                            else if (tokenInfo.token.kind === listStartToken) {
                                // consume list start token
                                startLine = sourceFile.getLineAndCharacterOfPosition(tokenInfo.token.pos).line;
                                var indentation_1 = computeIndentation(tokenInfo.token, startLine, -1 /* Unknown */, parent, parentDynamicIndentation, parentStartLine);
                                listDynamicIndentation = getDynamicIndentation(parent, parentStartLine, indentation_1.indentation, indentation_1.delta);
                                consumeTokenAndAdvanceScanner(tokenInfo, parent, listDynamicIndentation);
                            }
                            else {
                                // consume any tokens that precede the list as child elements of 'node' using its indentation scope
                                consumeTokenAndAdvanceScanner(tokenInfo, parent, parentDynamicIndentation);
                            }
                        }
                    }
                    var inheritedIndentation = -1 /* Unknown */;
                    for (var i = 0; i < nodes.length; i++) {
                        var child = nodes[i];
                        inheritedIndentation = processChildNode(child, inheritedIndentation, node, listDynamicIndentation, startLine, startLine, /*isListItem*/ true, /*isFirstListItem*/ i === 0);
                    }
                    if (listEndToken !== SyntaxKind.Unknown) {
                        if (formattingScanner.isOnToken()) {
                            var tokenInfo = formattingScanner.readTokenInfo(parent);
                            // consume the list end token only if it is still belong to the parent
                            // there might be the case when current token matches end token but does not considered as one
                            // function (x: function) <--
                            // without this check close paren will be interpreted as list end token for function expression which is wrong
                            if (tokenInfo.token.kind === listEndToken && ts.rangeContainsRange(parent, tokenInfo.token)) {
                                // consume list end token
                                consumeTokenAndAdvanceScanner(tokenInfo, parent, listDynamicIndentation);
                            }
                        }
                    }
                }
                function consumeTokenAndAdvanceScanner(currentTokenInfo, parent, dynamicIndentation, container) {
                    ts.Debug.assert(ts.rangeContainsRange(parent, currentTokenInfo.token));
                    var lastTriviaWasNewLine = formattingScanner.lastTrailingTriviaWasNewLine();
                    var indentToken = false;
                    if (currentTokenInfo.leadingTrivia) {
                        processTrivia(currentTokenInfo.leadingTrivia, parent, childContextNode, dynamicIndentation);
                    }
                    var lineAdded;
                    var isTokenInRange = ts.rangeContainsRange(originalRange, currentTokenInfo.token);
                    var tokenStart = sourceFile.getLineAndCharacterOfPosition(currentTokenInfo.token.pos);
                    if (isTokenInRange) {
                        var rangeHasError = rangeContainsError(currentTokenInfo.token);
                        // save previousRange since processRange will overwrite this value with current one
                        var savePreviousRange = previousRange;
                        lineAdded = processRange(currentTokenInfo.token, tokenStart, parent, childContextNode, dynamicIndentation);
                        if (rangeHasError) {
                            // do not indent comments\token if token range overlaps with some error
                            indentToken = false;
                        }
                        else {
                            if (lineAdded !== undefined) {
                                indentToken = lineAdded;
                            }
                            else {
                                // indent token only if end line of previous range does not match start line of the token
                                var prevEndLine = savePreviousRange && sourceFile.getLineAndCharacterOfPosition(savePreviousRange.end).line;
                                indentToken = lastTriviaWasNewLine && tokenStart.line !== prevEndLine;
                            }
                        }
                    }
                    if (currentTokenInfo.trailingTrivia) {
                        processTrivia(currentTokenInfo.trailingTrivia, parent, childContextNode, dynamicIndentation);
                    }
                    if (indentToken) {
                        var tokenIndentation = (isTokenInRange && !rangeContainsError(currentTokenInfo.token)) ?
                            dynamicIndentation.getIndentationForToken(tokenStart.line, currentTokenInfo.token.kind, container) :
                            -1 /* Unknown */;
                        var indentNextTokenOrTrivia = true;
                        if (currentTokenInfo.leadingTrivia) {
                            var commentIndentation = dynamicIndentation.getIndentationForComment(currentTokenInfo.token.kind, tokenIndentation, container);
                            for (var _i = 0, _a = currentTokenInfo.leadingTrivia; _i < _a.length; _i++) {
                                var triviaItem = _a[_i];
                                var triviaInRange = ts.rangeContainsRange(originalRange, triviaItem);
                                switch (triviaItem.kind) {
                                    case SyntaxKind.MultiLineCommentTrivia:
                                        if (triviaInRange) {
                                            indentMultilineComment(triviaItem, commentIndentation, /*firstLineIsIndented*/ !indentNextTokenOrTrivia);
                                        }
                                        indentNextTokenOrTrivia = false;
                                        break;
                                    case SyntaxKind.SingleLineCommentTrivia:
                                        if (indentNextTokenOrTrivia && triviaInRange) {
                                            insertIndentation(triviaItem.pos, commentIndentation, /*lineAdded*/ false);
                                        }
                                        indentNextTokenOrTrivia = false;
                                        break;
                                    case SyntaxKind.NewLineTrivia:
                                        indentNextTokenOrTrivia = true;
                                        break;
                                }
                            }
                        }
                        // indent token only if is it is in target range and does not overlap with any error ranges
                        if (tokenIndentation !== -1 /* Unknown */ && indentNextTokenOrTrivia) {
                            insertIndentation(currentTokenInfo.token.pos, tokenIndentation, lineAdded);
                            lastIndentedLine = tokenStart.line;
                            indentationOnLastIndentedLine = tokenIndentation;
                        }
                    }
                    formattingScanner.advance();
                    childContextNode = parent;
                }
            }
            function processTrivia(trivia, parent, contextNode, dynamicIndentation) {
                for (var _i = 0, trivia_1 = trivia; _i < trivia_1.length; _i++) {
                    var triviaItem = trivia_1[_i];
                    if (ts.isComment(triviaItem.kind) && ts.rangeContainsRange(originalRange, triviaItem)) {
                        var triviaItemStart = sourceFile.getLineAndCharacterOfPosition(triviaItem.pos);
                        processRange(triviaItem, triviaItemStart, parent, contextNode, dynamicIndentation);
                    }
                }
            }
            function processRange(range, rangeStart, parent, contextNode, dynamicIndentation) {
                var rangeHasError = rangeContainsError(range);
                var lineAdded;
                if (!rangeHasError && !previousRangeHasError) {
                    if (!previousRange) {
                        // trim whitespaces starting from the beginning of the span up to the current line
                        var originalStart = sourceFile.getLineAndCharacterOfPosition(originalRange.pos);
                        trimTrailingWhitespacesForLines(originalStart.line, rangeStart.line);
                    }
                    else {
                        lineAdded =
                            processPair(range, rangeStart.line, parent, previousRange, previousRangeStartLine, previousParent, contextNode, dynamicIndentation);
                    }
                }
                previousRange = range;
                previousParent = parent;
                previousRangeStartLine = rangeStart.line;
                previousRangeHasError = rangeHasError;
                return lineAdded;
            }
            function processPair(currentItem, currentStartLine, currentParent, previousItem, previousStartLine, previousParent, contextNode, dynamicIndentation) {
                formattingContext.updateContext(previousItem, previousParent, currentItem, currentParent, contextNode);
                var rule = rulesProvider.getRulesMap().GetRule(formattingContext);
                var trimTrailingWhitespaces;
                var lineAdded;
                if (rule) {
                    applyRuleEdits(rule, previousItem, previousStartLine, currentItem, currentStartLine);
                    if (rule.Operation.Action & (2 /* Space */ | 8 /* Delete */) && currentStartLine !== previousStartLine) {
                        lineAdded = false;
                        // Handle the case where the next line is moved to be the end of this line.
                        // In this case we don't indent the next line in the next pass.
                        if (currentParent.getStart(sourceFile) === currentItem.pos) {
                            dynamicIndentation.recomputeIndentation(/*lineAddedByFormatting*/ false);
                        }
                    }
                    else if (rule.Operation.Action & 4 /* NewLine */ && currentStartLine === previousStartLine) {
                        lineAdded = true;
                        // Handle the case where token2 is moved to the new line.
                        // In this case we indent token2 in the next pass but we set
                        // sameLineIndent flag to notify the indenter that the indentation is within the line.
                        if (currentParent.getStart(sourceFile) === currentItem.pos) {
                            dynamicIndentation.recomputeIndentation(/*lineAddedByFormatting*/ true);
                        }
                    }
                    // We need to trim trailing whitespace between the tokens if they were on different lines, and no rule was applied to put them on the same line
                    trimTrailingWhitespaces = !(rule.Operation.Action & 8 /* Delete */) && rule.Flag !== 1 /* CanDeleteNewLines */;
                }
                else {
                    trimTrailingWhitespaces = true;
                }
                if (currentStartLine !== previousStartLine && trimTrailingWhitespaces) {
                    // We need to trim trailing whitespace between the tokens if they were on different lines, and no rule was applied to put them on the same line
                    trimTrailingWhitespacesForLines(previousStartLine, currentStartLine, previousItem);
                }
                return lineAdded;
            }
            function insertIndentation(pos, indentation, lineAdded) {
                var indentationString = getIndentationString(indentation, options);
                if (lineAdded) {
                    // new line is added before the token by the formatting rules
                    // insert indentation string at the very beginning of the token
                    recordReplace(pos, 0, indentationString);
                }
                else {
                    var tokenStart = sourceFile.getLineAndCharacterOfPosition(pos);
                    var startLinePosition = ts.getStartPositionOfLine(tokenStart.line, sourceFile);
                    if (indentation !== tokenStart.character || indentationIsDifferent(indentationString, startLinePosition)) {
                        recordReplace(startLinePosition, tokenStart.character, indentationString);
                    }
                }
            }
            function indentationIsDifferent(indentationString, startLinePosition) {
                return indentationString !== sourceFile.text.substr(startLinePosition, indentationString.length);
            }
            function indentMultilineComment(commentRange, indentation, firstLineIsIndented) {
                // split comment in lines
                var startLine = sourceFile.getLineAndCharacterOfPosition(commentRange.pos).line;
                var endLine = sourceFile.getLineAndCharacterOfPosition(commentRange.end).line;
                var parts;
                if (startLine === endLine) {
                    if (!firstLineIsIndented) {
                        // treat as single line comment
                        insertIndentation(commentRange.pos, indentation, /*lineAdded*/ false);
                    }
                    return;
                }
                else {
                    parts = [];
                    var startPos = commentRange.pos;
                    for (var line = startLine; line < endLine; line++) {
                        var endOfLine = ts.getEndLinePosition(line, sourceFile);
                        parts.push({ pos: startPos, end: endOfLine });
                        startPos = ts.getStartPositionOfLine(line + 1, sourceFile);
                    }
                    parts.push({ pos: startPos, end: commentRange.end });
                }
                var startLinePos = ts.getStartPositionOfLine(startLine, sourceFile);
                var nonWhitespaceColumnInFirstPart = formatting.SmartIndenter.findFirstNonWhitespaceCharacterAndColumn(startLinePos, parts[0].pos, sourceFile, options);
                if (indentation === nonWhitespaceColumnInFirstPart.column) {
                    return;
                }
                var startIndex = 0;
                if (firstLineIsIndented) {
                    startIndex = 1;
                    startLine++;
                }
                // shift all parts on the delta size
                var delta = indentation - nonWhitespaceColumnInFirstPart.column;
                for (var i = startIndex, len = parts.length; i < len; i++, startLine++) {
                    var startLinePos_1 = ts.getStartPositionOfLine(startLine, sourceFile);
                    var nonWhitespaceCharacterAndColumn = i === 0
                        ? nonWhitespaceColumnInFirstPart
                        : formatting.SmartIndenter.findFirstNonWhitespaceCharacterAndColumn(parts[i].pos, parts[i].end, sourceFile, options);
                    var newIndentation = nonWhitespaceCharacterAndColumn.column + delta;
                    if (newIndentation > 0) {
                        var indentationString = getIndentationString(newIndentation, options);
                        recordReplace(startLinePos_1, nonWhitespaceCharacterAndColumn.character, indentationString);
                    }
                    else {
                        recordDelete(startLinePos_1, nonWhitespaceCharacterAndColumn.character);
                    }
                }
            }
            function trimTrailingWhitespacesForLines(line1, line2, range) {
                for (var line = line1; line < line2; line++) {
                    var lineStartPosition = ts.getStartPositionOfLine(line, sourceFile);
                    var lineEndPosition = ts.getEndLinePosition(line, sourceFile);
                    // do not trim whitespaces in comments or template expression
                    if (range && (ts.isComment(range.kind) || ts.isStringOrRegularExpressionOrTemplateLiteral(range.kind)) && range.pos <= lineEndPosition && range.end > lineEndPosition) {
                        continue;
                    }
                    var whitespaceStart = getTrailingWhitespaceStartPosition(lineStartPosition, lineEndPosition);
                    if (whitespaceStart !== -1) {
                        ts.Debug.assert(whitespaceStart === lineStartPosition || !ts.isNoBreakWhiteSpace(sourceFile.text.charCodeAt(whitespaceStart - 1)));
                        recordDelete(whitespaceStart, lineEndPosition + 1 - whitespaceStart);
                    }
                }
            }
            /**
             * @param start The position of the first character in range
             * @param end The position of the last character in range
             */
            function getTrailingWhitespaceStartPosition(start, end) {
                var pos = end;
                while (pos >= start && ts.isNoBreakWhiteSpace(sourceFile.text.charCodeAt(pos))) {
                    pos--;
                }
                if (pos !== end) {
                    return pos + 1;
                }
                return -1;
            }
            /**
             * Trimming will be done for lines after the previous range
             */
            function trimTrailingWhitespacesForRemainingRange() {
                var startPosition = previousRange ? previousRange.end : originalRange.pos;
                var startLine = sourceFile.getLineAndCharacterOfPosition(startPosition).line;
                var endLine = sourceFile.getLineAndCharacterOfPosition(originalRange.end).line;
                trimTrailingWhitespacesForLines(startLine, endLine + 1, previousRange);
            }
            function newTextChange(start, len, newText) {
                return { span: ts.createTextSpan(start, len), newText: newText };
            }
            function recordDelete(start, len) {
                if (len) {
                    edits.push(newTextChange(start, len, ""));
                }
            }
            function recordReplace(start, len, newText) {
                if (len || newText) {
                    edits.push(newTextChange(start, len, newText));
                }
            }
            function applyRuleEdits(rule, previousRange, previousStartLine, currentRange, currentStartLine) {
                switch (rule.Operation.Action) {
                    case 1 /* Ignore */:
                        // no action required
                        return;
                    case 8 /* Delete */:
                        if (previousRange.end !== currentRange.pos) {
                            // delete characters starting from t1.end up to t2.pos exclusive
                            recordDelete(previousRange.end, currentRange.pos - previousRange.end);
                        }
                        break;
                    case 4 /* NewLine */:
                        // exit early if we on different lines and rule cannot change number of newlines
                        // if line1 and line2 are on subsequent lines then no edits are required - ok to exit
                        // if line1 and line2 are separated with more than one newline - ok to exit since we cannot delete extra new lines
                        if (rule.Flag !== 1 /* CanDeleteNewLines */ && previousStartLine !== currentStartLine) {
                            return;
                        }
                        // edit should not be applied only if we have one line feed between elements
                        var lineDelta = currentStartLine - previousStartLine;
                        if (lineDelta !== 1) {
                            recordReplace(previousRange.end, currentRange.pos - previousRange.end, options.NewLineCharacter);
                        }
                        break;
                    case 2 /* Space */:
                        // exit early if we on different lines and rule cannot change number of newlines
                        if (rule.Flag !== 1 /* CanDeleteNewLines */ && previousStartLine !== currentStartLine) {
                            return;
                        }
                        var posDelta = currentRange.pos - previousRange.end;
                        if (posDelta !== 1 || sourceFile.text.charCodeAt(previousRange.end) !== CharacterCodes.space) {
                            recordReplace(previousRange.end, currentRange.pos - previousRange.end, " ");
                        }
                        break;
                }
            }
        }
        function getOpenTokenForList(node, list) {
            switch (node.kind) {
                case SyntaxKind.Constructor:
                case SyntaxKind.FunctionDeclaration:
                case SyntaxKind.FunctionExpression:
                case SyntaxKind.MethodDeclaration:
                case SyntaxKind.MethodSignature:
                case SyntaxKind.ArrowFunction:
                    if (node.typeParameters === list) {
                        return SyntaxKind.LessThanToken;
                    }
                    else if (node.parameters === list) {
                        return SyntaxKind.OpenParenToken;
                    }
                    break;
                case SyntaxKind.CallExpression:
                case SyntaxKind.NewExpression:
                    if (node.typeArguments === list) {
                        return SyntaxKind.LessThanToken;
                    }
                    else if (node.arguments === list) {
                        return SyntaxKind.OpenParenToken;
                    }
                    break;
                case SyntaxKind.TypeReference:
                    if (node.typeArguments === list) {
                        return SyntaxKind.LessThanToken;
                    }
            }
            return SyntaxKind.Unknown;
        }
        function getCloseTokenForOpenToken(kind) {
            switch (kind) {
                case SyntaxKind.OpenParenToken:
                    return SyntaxKind.CloseParenToken;
                case SyntaxKind.LessThanToken:
                    return SyntaxKind.GreaterThanToken;
            }
            return SyntaxKind.Unknown;
        }
        var internedSizes;
        var internedTabsIndentation;
        var internedSpacesIndentation;
        function getIndentationString(indentation, options) {
            // reset interned strings if FormatCodeOptions were changed
            var resetInternedStrings = !internedSizes || (internedSizes.tabSize !== options.TabSize || internedSizes.indentSize !== options.IndentSize);
            if (resetInternedStrings) {
                internedSizes = { tabSize: options.TabSize, indentSize: options.IndentSize };
                internedTabsIndentation = internedSpacesIndentation = undefined;
            }
            if (!options.ConvertTabsToSpaces) {
                var tabs = Math.floor(indentation / options.TabSize);
                var spaces = indentation - tabs * options.TabSize;
                var tabString = void 0;
                if (!internedTabsIndentation) {
                    internedTabsIndentation = [];
                }
                if (internedTabsIndentation[tabs] === undefined) {
                    internedTabsIndentation[tabs] = tabString = repeat("\t", tabs);
                }
                else {
                    tabString = internedTabsIndentation[tabs];
                }
                return spaces ? tabString + repeat(" ", spaces) : tabString;
            }
            else {
                var spacesString = void 0;
                var quotient = Math.floor(indentation / options.IndentSize);
                var remainder = indentation % options.IndentSize;
                if (!internedSpacesIndentation) {
                    internedSpacesIndentation = [];
                }
                if (internedSpacesIndentation[quotient] === undefined) {
                    spacesString = repeat(" ", options.IndentSize * quotient);
                    internedSpacesIndentation[quotient] = spacesString;
                }
                else {
                    spacesString = internedSpacesIndentation[quotient];
                }
                return remainder ? spacesString + repeat(" ", remainder) : spacesString;
            }
            function repeat(value, count) {
                var s = "";
                for (var i = 0; i < count; i++) {
                    s += value;
                }
                return s;
            }
        }
        formatting.getIndentationString = getIndentationString;
    })(formatting = ts.formatting || (ts.formatting = {}));
})(ts || (ts = {}));
//# sourceMappingURL=formatting.js.map