///<reference path='references.ts' />
/* @internal */
var ts;
(function (ts) {
    var formatting;
    (function (formatting) {
        var Shared;
        (function (Shared) {
            var TokenRangeAccess = (function () {
                function TokenRangeAccess(from, to, except) {
                    this.tokens = [];
                    for (var token = from; token <= to; token++) {
                        if (ts.indexOf(except, token) < 0) {
                            this.tokens.push(token);
                        }
                    }
                }
                TokenRangeAccess.prototype.GetTokens = function () {
                    return this.tokens;
                };
                TokenRangeAccess.prototype.Contains = function (token) {
                    return this.tokens.indexOf(token) >= 0;
                };
                return TokenRangeAccess;
            }());
            Shared.TokenRangeAccess = TokenRangeAccess;
            var TokenValuesAccess = (function () {
                function TokenValuesAccess(tks) {
                    this.tokens = tks && tks.length ? tks : [];
                }
                TokenValuesAccess.prototype.GetTokens = function () {
                    return this.tokens;
                };
                TokenValuesAccess.prototype.Contains = function (token) {
                    return this.tokens.indexOf(token) >= 0;
                };
                return TokenValuesAccess;
            }());
            Shared.TokenValuesAccess = TokenValuesAccess;
            var TokenSingleValueAccess = (function () {
                function TokenSingleValueAccess(token) {
                    this.token = token;
                }
                TokenSingleValueAccess.prototype.GetTokens = function () {
                    return [this.token];
                };
                TokenSingleValueAccess.prototype.Contains = function (tokenValue) {
                    return tokenValue === this.token;
                };
                return TokenSingleValueAccess;
            }());
            Shared.TokenSingleValueAccess = TokenSingleValueAccess;
            var TokenAllAccess = (function () {
                function TokenAllAccess() {
                }
                TokenAllAccess.prototype.GetTokens = function () {
                    var result = [];
                    for (var token = SyntaxKind.FirstToken; token <= SyntaxKind.LastToken; token++) {
                        result.push(token);
                    }
                    return result;
                };
                TokenAllAccess.prototype.Contains = function (tokenValue) {
                    return true;
                };
                TokenAllAccess.prototype.toString = function () {
                    return "[allTokens]";
                };
                return TokenAllAccess;
            }());
            Shared.TokenAllAccess = TokenAllAccess;
            var TokenRange = (function () {
                function TokenRange(tokenAccess) {
                    this.tokenAccess = tokenAccess;
                }
                TokenRange.FromToken = function (token) {
                    return new TokenRange(new TokenSingleValueAccess(token));
                };
                TokenRange.FromTokens = function (tokens) {
                    return new TokenRange(new TokenValuesAccess(tokens));
                };
                TokenRange.FromRange = function (f, to, except) {
                    if (except === void 0) { except = []; }
                    return new TokenRange(new TokenRangeAccess(f, to, except));
                };
                TokenRange.AllTokens = function () {
                    return new TokenRange(new TokenAllAccess());
                };
                TokenRange.prototype.GetTokens = function () {
                    return this.tokenAccess.GetTokens();
                };
                TokenRange.prototype.Contains = function (token) {
                    return this.tokenAccess.Contains(token);
                };
                TokenRange.prototype.toString = function () {
                    return this.tokenAccess.toString();
                };
                TokenRange.Any = TokenRange.AllTokens();
                TokenRange.AnyIncludingMultilineComments = TokenRange.FromTokens(TokenRange.Any.GetTokens().concat([SyntaxKind.MultiLineCommentTrivia]));
                TokenRange.Keywords = TokenRange.FromRange(SyntaxKind.FirstKeyword, SyntaxKind.LastKeyword);
                TokenRange.BinaryOperators = TokenRange.FromRange(SyntaxKind.FirstBinaryOperator, SyntaxKind.LastBinaryOperator);
                TokenRange.BinaryKeywordOperators = TokenRange.FromTokens([SyntaxKind.InKeyword, SyntaxKind.InstanceOfKeyword, SyntaxKind.OfKeyword, SyntaxKind.AsKeyword, SyntaxKind.IsKeyword]);
                TokenRange.UnaryPrefixOperators = TokenRange.FromTokens([SyntaxKind.PlusPlusToken, SyntaxKind.MinusMinusToken, SyntaxKind.TildeToken, SyntaxKind.ExclamationToken]);
                TokenRange.UnaryPrefixExpressions = TokenRange.FromTokens([SyntaxKind.NumericLiteral, SyntaxKind.Identifier, SyntaxKind.OpenParenToken, SyntaxKind.OpenBracketToken, SyntaxKind.OpenBraceToken, SyntaxKind.ThisKeyword, SyntaxKind.NewKeyword]);
                TokenRange.UnaryPreincrementExpressions = TokenRange.FromTokens([SyntaxKind.Identifier, SyntaxKind.OpenParenToken, SyntaxKind.ThisKeyword, SyntaxKind.NewKeyword]);
                TokenRange.UnaryPostincrementExpressions = TokenRange.FromTokens([SyntaxKind.Identifier, SyntaxKind.CloseParenToken, SyntaxKind.CloseBracketToken, SyntaxKind.NewKeyword]);
                TokenRange.UnaryPredecrementExpressions = TokenRange.FromTokens([SyntaxKind.Identifier, SyntaxKind.OpenParenToken, SyntaxKind.ThisKeyword, SyntaxKind.NewKeyword]);
                TokenRange.UnaryPostdecrementExpressions = TokenRange.FromTokens([SyntaxKind.Identifier, SyntaxKind.CloseParenToken, SyntaxKind.CloseBracketToken, SyntaxKind.NewKeyword]);
                TokenRange.Comments = TokenRange.FromTokens([SyntaxKind.SingleLineCommentTrivia, SyntaxKind.MultiLineCommentTrivia]);
                TokenRange.TypeNames = TokenRange.FromTokens([SyntaxKind.Identifier, SyntaxKind.NumberKeyword, SyntaxKind.StringKeyword, SyntaxKind.BooleanKeyword, SyntaxKind.SymbolKeyword, SyntaxKind.VoidKeyword, SyntaxKind.AnyKeyword]);
                return TokenRange;
            }());
            Shared.TokenRange = TokenRange;
        })(Shared = formatting.Shared || (formatting.Shared = {}));
    })(formatting = ts.formatting || (ts.formatting = {}));
})(ts || (ts = {}));
//# sourceMappingURL=tokenRange.js.map