/* @internal */
var ts;
(function (ts) {
    var OutliningElementsCollector;
    (function (OutliningElementsCollector) {
        function collectElements(sourceFile) {
            var elements = [];
            var collapseText = "...";
            function addOutliningSpan(hintSpanNode, startElement, endElement, autoCollapse) {
                if (hintSpanNode && startElement && endElement) {
                    var span = {
                        textSpan: ts.createTextSpanFromBounds(startElement.pos, endElement.end),
                        hintSpan: ts.createTextSpanFromBounds(hintSpanNode.getStart(), hintSpanNode.end),
                        bannerText: collapseText,
                        autoCollapse: autoCollapse
                    };
                    elements.push(span);
                }
            }
            function addOutliningSpanComments(commentSpan, autoCollapse) {
                if (commentSpan) {
                    var span = {
                        textSpan: ts.createTextSpanFromBounds(commentSpan.pos, commentSpan.end),
                        hintSpan: ts.createTextSpanFromBounds(commentSpan.pos, commentSpan.end),
                        bannerText: collapseText,
                        autoCollapse: autoCollapse
                    };
                    elements.push(span);
                }
            }
            function addOutliningForLeadingCommentsForNode(n) {
                var comments = ts.getLeadingCommentRangesOfNode(n, sourceFile);
                if (comments) {
                    var firstSingleLineCommentStart = -1;
                    var lastSingleLineCommentEnd = -1;
                    var isFirstSingleLineComment = true;
                    var singleLineCommentCount = 0;
                    for (var _i = 0, comments_1 = comments; _i < comments_1.length; _i++) {
                        var currentComment = comments_1[_i];
                        // For single line comments, combine consecutive ones (2 or more) into
                        // a single span from the start of the first till the end of the last
                        if (currentComment.kind === SyntaxKind.SingleLineCommentTrivia) {
                            if (isFirstSingleLineComment) {
                                firstSingleLineCommentStart = currentComment.pos;
                            }
                            isFirstSingleLineComment = false;
                            lastSingleLineCommentEnd = currentComment.end;
                            singleLineCommentCount++;
                        }
                        else if (currentComment.kind === SyntaxKind.MultiLineCommentTrivia) {
                            combineAndAddMultipleSingleLineComments(singleLineCommentCount, firstSingleLineCommentStart, lastSingleLineCommentEnd);
                            addOutliningSpanComments(currentComment, /*autoCollapse*/ false);
                            singleLineCommentCount = 0;
                            lastSingleLineCommentEnd = -1;
                            isFirstSingleLineComment = true;
                        }
                    }
                    combineAndAddMultipleSingleLineComments(singleLineCommentCount, firstSingleLineCommentStart, lastSingleLineCommentEnd);
                }
            }
            function combineAndAddMultipleSingleLineComments(count, start, end) {
                // Only outline spans of two or more consecutive single line comments
                if (count > 1) {
                    var multipleSingleLineComments = {
                        pos: start,
                        end: end,
                        kind: SyntaxKind.SingleLineCommentTrivia
                    };
                    addOutliningSpanComments(multipleSingleLineComments, /*autoCollapse*/ false);
                }
            }
            function autoCollapse(node) {
                return ts.isFunctionBlock(node) && node.parent.kind !== SyntaxKind.ArrowFunction;
            }
            var depth = 0;
            var maxDepth = 20;
            function walk(n) {
                if (depth > maxDepth) {
                    return;
                }
                if (ts.isDeclaration(n)) {
                    addOutliningForLeadingCommentsForNode(n);
                }
                switch (n.kind) {
                    case SyntaxKind.Block:
                        if (!ts.isFunctionBlock(n)) {
                            var parent_1 = n.parent;
                            var openBrace = ts.findChildOfKind(n, SyntaxKind.OpenBraceToken, sourceFile);
                            var closeBrace = ts.findChildOfKind(n, SyntaxKind.CloseBraceToken, sourceFile);
                            // Check if the block is standalone, or 'attached' to some parent statement.
                            // If the latter, we want to collapse the block, but consider its hint span
                            // to be the entire span of the parent.
                            if (parent_1.kind === SyntaxKind.DoStatement ||
                                parent_1.kind === SyntaxKind.ForInStatement ||
                                parent_1.kind === SyntaxKind.ForOfStatement ||
                                parent_1.kind === SyntaxKind.ForStatement ||
                                parent_1.kind === SyntaxKind.IfStatement ||
                                parent_1.kind === SyntaxKind.WhileStatement ||
                                parent_1.kind === SyntaxKind.WithStatement ||
                                parent_1.kind === SyntaxKind.CatchClause) {
                                addOutliningSpan(parent_1, openBrace, closeBrace, autoCollapse(n));
                                break;
                            }
                            if (parent_1.kind === SyntaxKind.TryStatement) {
                                // Could be the try-block, or the finally-block.
                                var tryStatement = parent_1;
                                if (tryStatement.tryBlock === n) {
                                    addOutliningSpan(parent_1, openBrace, closeBrace, autoCollapse(n));
                                    break;
                                }
                                else if (tryStatement.finallyBlock === n) {
                                    var finallyKeyword = ts.findChildOfKind(tryStatement, SyntaxKind.FinallyKeyword, sourceFile);
                                    if (finallyKeyword) {
                                        addOutliningSpan(finallyKeyword, openBrace, closeBrace, autoCollapse(n));
                                        break;
                                    }
                                }
                            }
                            // Block was a standalone block.  In this case we want to only collapse
                            // the span of the block, independent of any parent span.
                            var span = ts.createTextSpanFromBounds(n.getStart(), n.end);
                            elements.push({
                                textSpan: span,
                                hintSpan: span,
                                bannerText: collapseText,
                                autoCollapse: autoCollapse(n)
                            });
                            break;
                        }
                    // Fallthrough.
                    case SyntaxKind.ModuleBlock: {
                        var openBrace = ts.findChildOfKind(n, SyntaxKind.OpenBraceToken, sourceFile);
                        var closeBrace = ts.findChildOfKind(n, SyntaxKind.CloseBraceToken, sourceFile);
                        addOutliningSpan(n.parent, openBrace, closeBrace, autoCollapse(n));
                        break;
                    }
                    case SyntaxKind.ClassDeclaration:
                    case SyntaxKind.InterfaceDeclaration:
                    case SyntaxKind.EnumDeclaration:
                    case SyntaxKind.ObjectLiteralExpression:
                    case SyntaxKind.CaseBlock: {
                        var openBrace = ts.findChildOfKind(n, SyntaxKind.OpenBraceToken, sourceFile);
                        var closeBrace = ts.findChildOfKind(n, SyntaxKind.CloseBraceToken, sourceFile);
                        addOutliningSpan(n, openBrace, closeBrace, autoCollapse(n));
                        break;
                    }
                    case SyntaxKind.ArrayLiteralExpression:
                        var openBracket = ts.findChildOfKind(n, SyntaxKind.OpenBracketToken, sourceFile);
                        var closeBracket = ts.findChildOfKind(n, SyntaxKind.CloseBracketToken, sourceFile);
                        addOutliningSpan(n, openBracket, closeBracket, autoCollapse(n));
                        break;
                }
                depth++;
                ts.forEachChild(n, walk);
                depth--;
            }
            walk(sourceFile);
            return elements;
        }
        OutliningElementsCollector.collectElements = collectElements;
    })(OutliningElementsCollector = ts.OutliningElementsCollector || (ts.OutliningElementsCollector = {}));
})(ts || (ts = {}));
//# sourceMappingURL=outliningElementsCollector.js.map