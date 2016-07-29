///<reference path='references.ts' />
/* @internal */
var ts;
(function (ts) {
    var formatting;
    (function (formatting) {
        var Rules = (function () {
            function Rules() {
                ///
                /// Common Rules
                ///
                // Leave comments alone
                this.IgnoreBeforeComment = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.Any, formatting.Shared.TokenRange.Comments), formatting.RuleOperation.create1(1 /* Ignore */));
                this.IgnoreAfterLineComment = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.SingleLineCommentTrivia, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create1(1 /* Ignore */));
                // Space after keyword but not before ; or : or ?
                this.NoSpaceBeforeSemicolon = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, SyntaxKind.SemicolonToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceBeforeColon = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, SyntaxKind.ColonToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsNotBinaryOpContext), 8 /* Delete */));
                this.NoSpaceBeforeQuestionMark = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, SyntaxKind.QuestionToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsNotBinaryOpContext), 8 /* Delete */));
                this.SpaceAfterColon = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.ColonToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsNotBinaryOpContext), 2 /* Space */));
                this.SpaceAfterQuestionMarkInConditionalOperator = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.QuestionToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsConditionalOperatorContext), 2 /* Space */));
                this.NoSpaceAfterQuestionMark = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.QuestionToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                this.SpaceAfterSemicolon = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.SemicolonToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 2 /* Space */));
                // Space after }.
                this.SpaceAfterCloseBrace = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.CloseBraceToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsAfterCodeBlockContext), 2 /* Space */));
                // Special case for (}, else) and (}, while) since else & while tokens are not part of the tree which makes SpaceAfterCloseBrace rule not applied
                this.SpaceBetweenCloseBraceAndElse = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.CloseBraceToken, SyntaxKind.ElseKeyword), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 2 /* Space */));
                this.SpaceBetweenCloseBraceAndWhile = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.CloseBraceToken, SyntaxKind.WhileKeyword), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 2 /* Space */));
                this.NoSpaceAfterCloseBrace = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.CloseBraceToken, formatting.Shared.TokenRange.FromTokens([SyntaxKind.CloseParenToken, SyntaxKind.CloseBracketToken, SyntaxKind.CommaToken, SyntaxKind.SemicolonToken])), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                // No space for dot
                this.NoSpaceBeforeDot = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, SyntaxKind.DotToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceAfterDot = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.DotToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                // No space before and after indexer
                this.NoSpaceBeforeOpenBracket = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, SyntaxKind.OpenBracketToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceAfterCloseBracket = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.CloseBracketToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsNotBeforeBlockInFunctionDeclarationContext), 8 /* Delete */));
                // Place a space before open brace in a function declaration
                this.FunctionOpenBraceLeftTokenRange = formatting.Shared.TokenRange.AnyIncludingMultilineComments;
                this.SpaceBeforeOpenBraceInFunction = new formatting.Rule(formatting.RuleDescriptor.create2(this.FunctionOpenBraceLeftTokenRange, SyntaxKind.OpenBraceToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsFunctionDeclContext, Rules.IsBeforeBlockContext, Rules.IsNotFormatOnEnter, Rules.IsSameLineTokenOrBeforeMultilineBlockContext), 2 /* Space */), 1 /* CanDeleteNewLines */);
                // Place a space before open brace in a TypeScript declaration that has braces as children (class, module, enum, etc)
                this.TypeScriptOpenBraceLeftTokenRange = formatting.Shared.TokenRange.FromTokens([SyntaxKind.Identifier, SyntaxKind.MultiLineCommentTrivia, SyntaxKind.ClassKeyword, SyntaxKind.ExportKeyword, SyntaxKind.ImportKeyword]);
                this.SpaceBeforeOpenBraceInTypeScriptDeclWithBlock = new formatting.Rule(formatting.RuleDescriptor.create2(this.TypeScriptOpenBraceLeftTokenRange, SyntaxKind.OpenBraceToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsTypeScriptDeclWithBlockContext, Rules.IsNotFormatOnEnter, Rules.IsSameLineTokenOrBeforeMultilineBlockContext), 2 /* Space */), 1 /* CanDeleteNewLines */);
                // Place a space before open brace in a control flow construct
                this.ControlOpenBraceLeftTokenRange = formatting.Shared.TokenRange.FromTokens([SyntaxKind.CloseParenToken, SyntaxKind.MultiLineCommentTrivia, SyntaxKind.DoKeyword, SyntaxKind.TryKeyword, SyntaxKind.FinallyKeyword, SyntaxKind.ElseKeyword]);
                this.SpaceBeforeOpenBraceInControl = new formatting.Rule(formatting.RuleDescriptor.create2(this.ControlOpenBraceLeftTokenRange, SyntaxKind.OpenBraceToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsControlDeclContext, Rules.IsNotFormatOnEnter, Rules.IsSameLineTokenOrBeforeMultilineBlockContext), 2 /* Space */), 1 /* CanDeleteNewLines */);
                // Insert a space after { and before } in single-line contexts, but remove space from empty object literals {}.
                this.SpaceAfterOpenBrace = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.OpenBraceToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSingleLineBlockContext), 2 /* Space */));
                this.SpaceBeforeCloseBrace = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, SyntaxKind.CloseBraceToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSingleLineBlockContext), 2 /* Space */));
                this.NoSpaceBetweenEmptyBraceBrackets = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.OpenBraceToken, SyntaxKind.CloseBraceToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsObjectContext), 8 /* Delete */));
                // Insert new line after { and before } in multi-line contexts.
                this.NewLineAfterOpenBraceInBlockContext = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.OpenBraceToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsMultilineBlockContext), 4 /* NewLine */));
                // For functions and control block place } on a new line    [multi-line rule]
                this.NewLineBeforeCloseBraceInBlockContext = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.AnyIncludingMultilineComments, SyntaxKind.CloseBraceToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsMultilineBlockContext), 4 /* NewLine */));
                // Special handling of unary operators.
                // Prefix operators generally shouldn't have a space between
                // them and their target unary expression.
                this.NoSpaceAfterUnaryPrefixOperator = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.UnaryPrefixOperators, formatting.Shared.TokenRange.UnaryPrefixExpressions), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsNotBinaryOpContext), 8 /* Delete */));
                this.NoSpaceAfterUnaryPreincrementOperator = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.PlusPlusToken, formatting.Shared.TokenRange.UnaryPreincrementExpressions), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceAfterUnaryPredecrementOperator = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.MinusMinusToken, formatting.Shared.TokenRange.UnaryPredecrementExpressions), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceBeforeUnaryPostincrementOperator = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.UnaryPostincrementExpressions, SyntaxKind.PlusPlusToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceBeforeUnaryPostdecrementOperator = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.UnaryPostdecrementExpressions, SyntaxKind.MinusMinusToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                // More unary operator special-casing.
                // DevDiv 181814:  Be careful when removing leading whitespace
                // around unary operators.  Examples:
                //      1 - -2  --X-->  1--2
                //      a + ++b --X-->  a+++b
                this.SpaceAfterPostincrementWhenFollowedByAdd = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.PlusPlusToken, SyntaxKind.PlusToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                this.SpaceAfterAddWhenFollowedByUnaryPlus = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.PlusToken, SyntaxKind.PlusToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                this.SpaceAfterAddWhenFollowedByPreincrement = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.PlusToken, SyntaxKind.PlusPlusToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                this.SpaceAfterPostdecrementWhenFollowedBySubtract = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.MinusMinusToken, SyntaxKind.MinusToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                this.SpaceAfterSubtractWhenFollowedByUnaryMinus = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.MinusToken, SyntaxKind.MinusToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                this.SpaceAfterSubtractWhenFollowedByPredecrement = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.MinusToken, SyntaxKind.MinusMinusToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                this.NoSpaceBeforeComma = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, SyntaxKind.CommaToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                this.SpaceAfterCertainKeywords = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.FromTokens([SyntaxKind.VarKeyword, SyntaxKind.ThrowKeyword, SyntaxKind.NewKeyword, SyntaxKind.DeleteKeyword, SyntaxKind.ReturnKeyword, SyntaxKind.TypeOfKeyword, SyntaxKind.AwaitKeyword]), formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 2 /* Space */));
                this.SpaceAfterLetConstInVariableDeclaration = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.FromTokens([SyntaxKind.LetKeyword, SyntaxKind.ConstKeyword]), formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsStartOfVariableDeclarationList), 2 /* Space */));
                this.NoSpaceBeforeOpenParenInFuncCall = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, SyntaxKind.OpenParenToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsFunctionCallOrNewContext, Rules.IsPreviousTokenNotComma), 8 /* Delete */));
                this.SpaceAfterFunctionInFuncDecl = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.FunctionKeyword, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsFunctionDeclContext), 2 /* Space */));
                this.NoSpaceBeforeOpenParenInFuncDecl = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, SyntaxKind.OpenParenToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsFunctionDeclContext), 8 /* Delete */));
                this.SpaceAfterVoidOperator = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.VoidKeyword, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsVoidOpContext), 2 /* Space */));
                this.NoSpaceBetweenReturnAndSemicolon = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.ReturnKeyword, SyntaxKind.SemicolonToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                // Add a space between statements. All keywords except (do,else,case) has open/close parens after them.
                // So, we have a rule to add a space for [),Any], [do,Any], [else,Any], and [case,Any]
                this.SpaceBetweenStatements = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.FromTokens([SyntaxKind.CloseParenToken, SyntaxKind.DoKeyword, SyntaxKind.ElseKeyword, SyntaxKind.CaseKeyword]), formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.isNonJsxElementContext, Rules.IsNotForContext), 2 /* Space */));
                // This low-pri rule takes care of "try {" and "finally {" in case the rule SpaceBeforeOpenBraceInControl didn't execute on FormatOnEnter.
                this.SpaceAfterTryFinally = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.FromTokens([SyntaxKind.TryKeyword, SyntaxKind.FinallyKeyword]), SyntaxKind.OpenBraceToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 2 /* Space */));
                //      get x() {}
                //      set x(val) {}
                this.SpaceAfterGetSetInMember = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.FromTokens([SyntaxKind.GetKeyword, SyntaxKind.SetKeyword]), SyntaxKind.Identifier), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsFunctionDeclContext), 2 /* Space */));
                // Special case for binary operators (that are keywords). For these we have to add a space and shouldn't follow any user options.
                this.SpaceBeforeBinaryKeywordOperator = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.Any, formatting.Shared.TokenRange.BinaryKeywordOperators), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                this.SpaceAfterBinaryKeywordOperator = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.BinaryKeywordOperators, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                // TypeScript-specific higher priority rules
                // Treat constructor as an identifier in a function declaration, and remove spaces between constructor and following left parentheses
                this.NoSpaceAfterConstructor = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.ConstructorKeyword, SyntaxKind.OpenParenToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                // Use of module as a function call. e.g.: import m2 = module("m2");
                this.NoSpaceAfterModuleImport = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.FromTokens([SyntaxKind.ModuleKeyword, SyntaxKind.RequireKeyword]), SyntaxKind.OpenParenToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                // Add a space around certain TypeScript keywords
                this.SpaceAfterCertainTypeScriptKeywords = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.FromTokens([SyntaxKind.AbstractKeyword, SyntaxKind.ClassKeyword, SyntaxKind.DeclareKeyword, SyntaxKind.DefaultKeyword, SyntaxKind.EnumKeyword, SyntaxKind.ExportKeyword, SyntaxKind.ExtendsKeyword, SyntaxKind.GetKeyword, SyntaxKind.ImplementsKeyword, SyntaxKind.ImportKeyword, SyntaxKind.InterfaceKeyword, SyntaxKind.ModuleKeyword, SyntaxKind.NamespaceKeyword, SyntaxKind.PrivateKeyword, SyntaxKind.PublicKeyword, SyntaxKind.ProtectedKeyword, SyntaxKind.SetKeyword, SyntaxKind.StaticKeyword, SyntaxKind.TypeKeyword, SyntaxKind.FromKeyword]), formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 2 /* Space */));
                this.SpaceBeforeCertainTypeScriptKeywords = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.Any, formatting.Shared.TokenRange.FromTokens([SyntaxKind.ExtendsKeyword, SyntaxKind.ImplementsKeyword, SyntaxKind.FromKeyword])), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 2 /* Space */));
                // Treat string literals in module names as identifiers, and add a space between the literal and the opening Brace braces, e.g.: module "m2" {
                this.SpaceAfterModuleName = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.StringLiteral, SyntaxKind.OpenBraceToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsModuleDeclContext), 2 /* Space */));
                // Lambda expressions
                this.SpaceBeforeArrow = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, SyntaxKind.EqualsGreaterThanToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 2 /* Space */));
                this.SpaceAfterArrow = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.EqualsGreaterThanToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 2 /* Space */));
                // Optional parameters and let args
                this.NoSpaceAfterEllipsis = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.DotDotDotToken, SyntaxKind.Identifier), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceAfterOptionalParameters = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.QuestionToken, formatting.Shared.TokenRange.FromTokens([SyntaxKind.CloseParenToken, SyntaxKind.CommaToken])), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsNotBinaryOpContext), 8 /* Delete */));
                // generics and type assertions
                this.NoSpaceBeforeOpenAngularBracket = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.TypeNames, SyntaxKind.LessThanToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsTypeArgumentOrParameterOrAssertionContext), 8 /* Delete */));
                this.NoSpaceBetweenCloseParenAndAngularBracket = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.CloseParenToken, SyntaxKind.LessThanToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsTypeArgumentOrParameterOrAssertionContext), 8 /* Delete */));
                this.NoSpaceAfterOpenAngularBracket = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.LessThanToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsTypeArgumentOrParameterOrAssertionContext), 8 /* Delete */));
                this.NoSpaceBeforeCloseAngularBracket = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, SyntaxKind.GreaterThanToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsTypeArgumentOrParameterOrAssertionContext), 8 /* Delete */));
                this.NoSpaceAfterCloseAngularBracket = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.GreaterThanToken, formatting.Shared.TokenRange.FromTokens([SyntaxKind.OpenParenToken, SyntaxKind.OpenBracketToken, SyntaxKind.GreaterThanToken, SyntaxKind.CommaToken])), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsTypeArgumentOrParameterOrAssertionContext), 8 /* Delete */));
                this.NoSpaceAfterTypeAssertion = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.GreaterThanToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsTypeAssertionContext), 8 /* Delete */));
                // Remove spaces in empty interface literals. e.g.: x: {}
                this.NoSpaceBetweenEmptyInterfaceBraceBrackets = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.OpenBraceToken, SyntaxKind.CloseBraceToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsObjectTypeContext), 8 /* Delete */));
                // decorators
                this.SpaceBeforeAt = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, SyntaxKind.AtToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 2 /* Space */));
                this.NoSpaceAfterAt = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.AtToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                this.SpaceAfterDecorator = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.Any, formatting.Shared.TokenRange.FromTokens([SyntaxKind.AbstractKeyword, SyntaxKind.Identifier, SyntaxKind.ExportKeyword, SyntaxKind.DefaultKeyword, SyntaxKind.ClassKeyword, SyntaxKind.StaticKeyword, SyntaxKind.PublicKeyword, SyntaxKind.PrivateKeyword, SyntaxKind.ProtectedKeyword, SyntaxKind.GetKeyword, SyntaxKind.SetKeyword, SyntaxKind.OpenBracketToken, SyntaxKind.AsteriskToken])), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsEndOfDecoratorContextOnSameLine), 2 /* Space */));
                this.NoSpaceBetweenFunctionKeywordAndStar = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.FunctionKeyword, SyntaxKind.AsteriskToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsFunctionDeclarationOrFunctionExpressionContext), 8 /* Delete */));
                this.SpaceAfterStarInGeneratorDeclaration = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.AsteriskToken, formatting.Shared.TokenRange.FromTokens([SyntaxKind.Identifier, SyntaxKind.OpenParenToken])), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsFunctionDeclarationOrFunctionExpressionContext), 2 /* Space */));
                this.NoSpaceBetweenYieldKeywordAndStar = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.YieldKeyword, SyntaxKind.AsteriskToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsYieldOrYieldStarWithOperand), 8 /* Delete */));
                this.SpaceBetweenYieldOrYieldStarAndOperand = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.FromTokens([SyntaxKind.YieldKeyword, SyntaxKind.AsteriskToken]), formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsYieldOrYieldStarWithOperand), 2 /* Space */));
                // Async-await
                this.SpaceBetweenAsyncAndOpenParen = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.AsyncKeyword, SyntaxKind.OpenParenToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsArrowFunctionContext, Rules.IsNonJsxSameLineTokenContext), 2 /* Space */));
                this.SpaceBetweenAsyncAndFunctionKeyword = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.AsyncKeyword, SyntaxKind.FunctionKeyword), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 2 /* Space */));
                // template string
                this.NoSpaceBetweenTagAndTemplateString = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.Identifier, formatting.Shared.TokenRange.FromTokens([SyntaxKind.NoSubstitutionTemplateLiteral, SyntaxKind.TemplateHead])), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                // These rules are higher in priority than user-configurable rules.
                this.HighPriorityCommonRules = [
                    this.IgnoreBeforeComment, this.IgnoreAfterLineComment,
                    this.NoSpaceBeforeColon, this.SpaceAfterColon, this.NoSpaceBeforeQuestionMark, this.SpaceAfterQuestionMarkInConditionalOperator,
                    this.NoSpaceAfterQuestionMark,
                    this.NoSpaceBeforeDot, this.NoSpaceAfterDot,
                    this.NoSpaceAfterUnaryPrefixOperator,
                    this.NoSpaceAfterUnaryPreincrementOperator, this.NoSpaceAfterUnaryPredecrementOperator,
                    this.NoSpaceBeforeUnaryPostincrementOperator, this.NoSpaceBeforeUnaryPostdecrementOperator,
                    this.SpaceAfterPostincrementWhenFollowedByAdd,
                    this.SpaceAfterAddWhenFollowedByUnaryPlus, this.SpaceAfterAddWhenFollowedByPreincrement,
                    this.SpaceAfterPostdecrementWhenFollowedBySubtract,
                    this.SpaceAfterSubtractWhenFollowedByUnaryMinus, this.SpaceAfterSubtractWhenFollowedByPredecrement,
                    this.NoSpaceAfterCloseBrace,
                    this.SpaceAfterOpenBrace, this.SpaceBeforeCloseBrace, this.NewLineBeforeCloseBraceInBlockContext,
                    this.SpaceAfterCloseBrace, this.SpaceBetweenCloseBraceAndElse, this.SpaceBetweenCloseBraceAndWhile, this.NoSpaceBetweenEmptyBraceBrackets,
                    this.NoSpaceBetweenFunctionKeywordAndStar, this.SpaceAfterStarInGeneratorDeclaration,
                    this.SpaceAfterFunctionInFuncDecl, this.NewLineAfterOpenBraceInBlockContext, this.SpaceAfterGetSetInMember,
                    this.NoSpaceBetweenYieldKeywordAndStar, this.SpaceBetweenYieldOrYieldStarAndOperand,
                    this.NoSpaceBetweenReturnAndSemicolon,
                    this.SpaceAfterCertainKeywords,
                    this.SpaceAfterLetConstInVariableDeclaration,
                    this.NoSpaceBeforeOpenParenInFuncCall,
                    this.SpaceBeforeBinaryKeywordOperator, this.SpaceAfterBinaryKeywordOperator,
                    this.SpaceAfterVoidOperator,
                    this.SpaceBetweenAsyncAndOpenParen, this.SpaceBetweenAsyncAndFunctionKeyword,
                    this.NoSpaceBetweenTagAndTemplateString,
                    // TypeScript-specific rules
                    this.NoSpaceAfterConstructor, this.NoSpaceAfterModuleImport,
                    this.SpaceAfterCertainTypeScriptKeywords, this.SpaceBeforeCertainTypeScriptKeywords,
                    this.SpaceAfterModuleName,
                    this.SpaceBeforeArrow, this.SpaceAfterArrow,
                    this.NoSpaceAfterEllipsis,
                    this.NoSpaceAfterOptionalParameters,
                    this.NoSpaceBetweenEmptyInterfaceBraceBrackets,
                    this.NoSpaceBeforeOpenAngularBracket,
                    this.NoSpaceBetweenCloseParenAndAngularBracket,
                    this.NoSpaceAfterOpenAngularBracket,
                    this.NoSpaceBeforeCloseAngularBracket,
                    this.NoSpaceAfterCloseAngularBracket,
                    this.NoSpaceAfterTypeAssertion,
                    this.SpaceBeforeAt,
                    this.NoSpaceAfterAt,
                    this.SpaceAfterDecorator,
                ];
                // These rules are lower in priority than user-configurable rules.
                this.LowPriorityCommonRules = [
                    this.NoSpaceBeforeSemicolon,
                    this.SpaceBeforeOpenBraceInControl, this.SpaceBeforeOpenBraceInFunction, this.SpaceBeforeOpenBraceInTypeScriptDeclWithBlock,
                    this.NoSpaceBeforeComma,
                    this.NoSpaceBeforeOpenBracket,
                    this.NoSpaceAfterCloseBracket,
                    this.SpaceAfterSemicolon,
                    this.NoSpaceBeforeOpenParenInFuncDecl,
                    this.SpaceBetweenStatements, this.SpaceAfterTryFinally
                ];
                ///
                /// Rules controlled by user options
                ///
                // Insert space after comma delimiter
                this.SpaceAfterComma = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.CommaToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.isNonJsxElementContext, Rules.IsNextTokenNotCloseBracket), 2 /* Space */));
                this.NoSpaceAfterComma = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.CommaToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.isNonJsxElementContext), 8 /* Delete */));
                // Insert space before and after binary operators
                this.SpaceBeforeBinaryOperator = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.Any, formatting.Shared.TokenRange.BinaryOperators), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                this.SpaceAfterBinaryOperator = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.BinaryOperators, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                this.NoSpaceBeforeBinaryOperator = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.Any, formatting.Shared.TokenRange.BinaryOperators), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsBinaryOpContext), 8 /* Delete */));
                this.NoSpaceAfterBinaryOperator = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.BinaryOperators, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsBinaryOpContext), 8 /* Delete */));
                // Insert space after keywords in control flow statements
                this.SpaceAfterKeywordInControl = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Keywords, SyntaxKind.OpenParenToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsControlDeclContext), 2 /* Space */));
                this.NoSpaceAfterKeywordInControl = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Keywords, SyntaxKind.OpenParenToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsControlDeclContext), 8 /* Delete */));
                // Open Brace braces after function
                // TypeScript: Function can have return types, which can be made of tons of different token kinds
                this.NewLineBeforeOpenBraceInFunction = new formatting.Rule(formatting.RuleDescriptor.create2(this.FunctionOpenBraceLeftTokenRange, SyntaxKind.OpenBraceToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsFunctionDeclContext, Rules.IsBeforeMultilineBlockContext), 4 /* NewLine */), 1 /* CanDeleteNewLines */);
                // Open Brace braces after TypeScript module/class/interface
                this.NewLineBeforeOpenBraceInTypeScriptDeclWithBlock = new formatting.Rule(formatting.RuleDescriptor.create2(this.TypeScriptOpenBraceLeftTokenRange, SyntaxKind.OpenBraceToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsTypeScriptDeclWithBlockContext, Rules.IsBeforeMultilineBlockContext), 4 /* NewLine */), 1 /* CanDeleteNewLines */);
                // Open Brace braces after control block
                this.NewLineBeforeOpenBraceInControl = new formatting.Rule(formatting.RuleDescriptor.create2(this.ControlOpenBraceLeftTokenRange, SyntaxKind.OpenBraceToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsControlDeclContext, Rules.IsBeforeMultilineBlockContext), 4 /* NewLine */), 1 /* CanDeleteNewLines */);
                // Insert space after semicolon in for statement
                this.SpaceAfterSemicolonInFor = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.SemicolonToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsForContext), 2 /* Space */));
                this.NoSpaceAfterSemicolonInFor = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.SemicolonToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.IsForContext), 8 /* Delete */));
                // Insert space after opening and before closing nonempty parenthesis
                this.SpaceAfterOpenParen = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.OpenParenToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 2 /* Space */));
                this.SpaceBeforeCloseParen = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, SyntaxKind.CloseParenToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 2 /* Space */));
                this.NoSpaceBetweenParens = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.OpenParenToken, SyntaxKind.CloseParenToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceAfterOpenParen = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.OpenParenToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceBeforeCloseParen = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, SyntaxKind.CloseParenToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                // Insert space after opening and before closing nonempty brackets
                this.SpaceAfterOpenBracket = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.OpenBracketToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 2 /* Space */));
                this.SpaceBeforeCloseBracket = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, SyntaxKind.CloseBracketToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 2 /* Space */));
                this.NoSpaceBetweenBrackets = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.OpenBracketToken, SyntaxKind.CloseBracketToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceAfterOpenBracket = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.OpenBracketToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceBeforeCloseBracket = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, SyntaxKind.CloseBracketToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                // Insert space after opening and before closing template string braces
                this.NoSpaceAfterTemplateHeadAndMiddle = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.FromTokens([SyntaxKind.TemplateHead, SyntaxKind.TemplateMiddle]), formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                this.SpaceAfterTemplateHeadAndMiddle = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.FromTokens([SyntaxKind.TemplateHead, SyntaxKind.TemplateMiddle]), formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 2 /* Space */));
                this.NoSpaceBeforeTemplateMiddleAndTail = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.Any, formatting.Shared.TokenRange.FromTokens([SyntaxKind.TemplateMiddle, SyntaxKind.TemplateTail])), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 8 /* Delete */));
                this.SpaceBeforeTemplateMiddleAndTail = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.Any, formatting.Shared.TokenRange.FromTokens([SyntaxKind.TemplateMiddle, SyntaxKind.TemplateTail])), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext), 2 /* Space */));
                // No space after { and before } in JSX expression
                this.NoSpaceAfterOpenBraceInJsxExpression = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.OpenBraceToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.isJsxExpressionContext), 8 /* Delete */));
                this.SpaceAfterOpenBraceInJsxExpression = new formatting.Rule(formatting.RuleDescriptor.create3(SyntaxKind.OpenBraceToken, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.isJsxExpressionContext), 2 /* Space */));
                this.NoSpaceBeforeCloseBraceInJsxExpression = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, SyntaxKind.CloseBraceToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.isJsxExpressionContext), 8 /* Delete */));
                this.SpaceBeforeCloseBraceInJsxExpression = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, SyntaxKind.CloseBraceToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsNonJsxSameLineTokenContext, Rules.isJsxExpressionContext), 2 /* Space */));
                // Insert space after function keyword for anonymous functions
                this.SpaceAfterAnonymousFunctionKeyword = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.FunctionKeyword, SyntaxKind.OpenParenToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsFunctionDeclContext), 2 /* Space */));
                this.NoSpaceAfterAnonymousFunctionKeyword = new formatting.Rule(formatting.RuleDescriptor.create1(SyntaxKind.FunctionKeyword, SyntaxKind.OpenParenToken), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsFunctionDeclContext), 8 /* Delete */));
            }
            Rules.prototype.getRuleName = function (rule) {
                var o = this;
                for (var name_1 in o) {
                    if (o[name_1] === rule) {
                        return name_1;
                    }
                }
                throw new Error("Unknown rule");
            };
            ///
            /// Contexts
            ///
            Rules.IsForContext = function (context) {
                return context.contextNode.kind === SyntaxKind.ForStatement;
            };
            Rules.IsNotForContext = function (context) {
                return !Rules.IsForContext(context);
            };
            Rules.IsBinaryOpContext = function (context) {
                switch (context.contextNode.kind) {
                    case SyntaxKind.BinaryExpression:
                    case SyntaxKind.ConditionalExpression:
                    case SyntaxKind.AsExpression:
                    case SyntaxKind.ExportSpecifier:
                    case SyntaxKind.ImportSpecifier:
                    case SyntaxKind.TypePredicate:
                    case SyntaxKind.UnionType:
                    case SyntaxKind.IntersectionType:
                        return true;
                    // equals in binding elements: function foo([[x, y] = [1, 2]])
                    case SyntaxKind.BindingElement:
                    // equals in type X = ...
                    case SyntaxKind.TypeAliasDeclaration:
                    // equal in import a = module('a');
                    case SyntaxKind.ImportEqualsDeclaration:
                    // equal in let a = 0;
                    case SyntaxKind.VariableDeclaration:
                    // equal in p = 0;
                    case SyntaxKind.Parameter:
                    case SyntaxKind.EnumMember:
                    case SyntaxKind.PropertyDeclaration:
                    case SyntaxKind.PropertySignature:
                        return context.currentTokenSpan.kind === SyntaxKind.EqualsToken || context.nextTokenSpan.kind === SyntaxKind.EqualsToken;
                    // "in" keyword in for (let x in []) { }
                    case SyntaxKind.ForInStatement:
                        return context.currentTokenSpan.kind === SyntaxKind.InKeyword || context.nextTokenSpan.kind === SyntaxKind.InKeyword;
                    // Technically, "of" is not a binary operator, but format it the same way as "in"
                    case SyntaxKind.ForOfStatement:
                        return context.currentTokenSpan.kind === SyntaxKind.OfKeyword || context.nextTokenSpan.kind === SyntaxKind.OfKeyword;
                }
                return false;
            };
            Rules.IsNotBinaryOpContext = function (context) {
                return !Rules.IsBinaryOpContext(context);
            };
            Rules.IsConditionalOperatorContext = function (context) {
                return context.contextNode.kind === SyntaxKind.ConditionalExpression;
            };
            Rules.IsSameLineTokenOrBeforeMultilineBlockContext = function (context) {
                //// This check is mainly used inside SpaceBeforeOpenBraceInControl and SpaceBeforeOpenBraceInFunction.
                ////
                //// Ex:
                //// if (1)     { ....
                ////      * ) and { are on the same line so apply the rule. Here we don't care whether it's same or multi block context
                ////
                //// Ex:
                //// if (1)
                //// { ... }
                ////      * ) and { are on different lines. We only need to format if the block is multiline context. So in this case we don't format.
                ////
                //// Ex:
                //// if (1)
                //// { ...
                //// }
                ////      * ) and { are on different lines. We only need to format if the block is multiline context. So in this case we format.
                return context.TokensAreOnSameLine() || Rules.IsBeforeMultilineBlockContext(context);
            };
            // This check is done before an open brace in a control construct, a function, or a typescript block declaration
            Rules.IsBeforeMultilineBlockContext = function (context) {
                return Rules.IsBeforeBlockContext(context) && !(context.NextNodeAllOnSameLine() || context.NextNodeBlockIsOnOneLine());
            };
            Rules.IsMultilineBlockContext = function (context) {
                return Rules.IsBlockContext(context) && !(context.ContextNodeAllOnSameLine() || context.ContextNodeBlockIsOnOneLine());
            };
            Rules.IsSingleLineBlockContext = function (context) {
                return Rules.IsBlockContext(context) && (context.ContextNodeAllOnSameLine() || context.ContextNodeBlockIsOnOneLine());
            };
            Rules.IsBlockContext = function (context) {
                return Rules.NodeIsBlockContext(context.contextNode);
            };
            Rules.IsBeforeBlockContext = function (context) {
                return Rules.NodeIsBlockContext(context.nextTokenParent);
            };
            // IMPORTANT!!! This method must return true ONLY for nodes with open and close braces as immediate children
            Rules.NodeIsBlockContext = function (node) {
                if (Rules.NodeIsTypeScriptDeclWithBlockContext(node)) {
                    // This means we are in a context that looks like a block to the user, but in the grammar is actually not a node (it's a class, module, enum, object type literal, etc).
                    return true;
                }
                switch (node.kind) {
                    case SyntaxKind.Block:
                    case SyntaxKind.CaseBlock:
                    case SyntaxKind.ObjectLiteralExpression:
                    case SyntaxKind.ModuleBlock:
                        return true;
                }
                return false;
            };
            Rules.IsFunctionDeclContext = function (context) {
                switch (context.contextNode.kind) {
                    case SyntaxKind.FunctionDeclaration:
                    case SyntaxKind.MethodDeclaration:
                    case SyntaxKind.MethodSignature:
                    // case SyntaxKind.MemberFunctionDeclaration:
                    case SyntaxKind.GetAccessor:
                    case SyntaxKind.SetAccessor:
                    // case SyntaxKind.MethodSignature:
                    case SyntaxKind.CallSignature:
                    case SyntaxKind.FunctionExpression:
                    case SyntaxKind.Constructor:
                    case SyntaxKind.ArrowFunction:
                    // case SyntaxKind.ConstructorDeclaration:
                    // case SyntaxKind.SimpleArrowFunctionExpression:
                    // case SyntaxKind.ParenthesizedArrowFunctionExpression:
                    case SyntaxKind.InterfaceDeclaration:
                        return true;
                }
                return false;
            };
            Rules.IsFunctionDeclarationOrFunctionExpressionContext = function (context) {
                return context.contextNode.kind === SyntaxKind.FunctionDeclaration || context.contextNode.kind === SyntaxKind.FunctionExpression;
            };
            Rules.IsTypeScriptDeclWithBlockContext = function (context) {
                return Rules.NodeIsTypeScriptDeclWithBlockContext(context.contextNode);
            };
            Rules.NodeIsTypeScriptDeclWithBlockContext = function (node) {
                switch (node.kind) {
                    case SyntaxKind.ClassDeclaration:
                    case SyntaxKind.ClassExpression:
                    case SyntaxKind.InterfaceDeclaration:
                    case SyntaxKind.EnumDeclaration:
                    case SyntaxKind.TypeLiteral:
                    case SyntaxKind.ModuleDeclaration:
                    case SyntaxKind.ExportDeclaration:
                    case SyntaxKind.NamedExports:
                    case SyntaxKind.ImportDeclaration:
                    case SyntaxKind.NamedImports:
                        return true;
                }
                return false;
            };
            Rules.IsAfterCodeBlockContext = function (context) {
                switch (context.currentTokenParent.kind) {
                    case SyntaxKind.ClassDeclaration:
                    case SyntaxKind.ModuleDeclaration:
                    case SyntaxKind.EnumDeclaration:
                    case SyntaxKind.Block:
                    case SyntaxKind.CatchClause:
                    case SyntaxKind.ModuleBlock:
                    case SyntaxKind.SwitchStatement:
                        return true;
                }
                return false;
            };
            Rules.IsControlDeclContext = function (context) {
                switch (context.contextNode.kind) {
                    case SyntaxKind.IfStatement:
                    case SyntaxKind.SwitchStatement:
                    case SyntaxKind.ForStatement:
                    case SyntaxKind.ForInStatement:
                    case SyntaxKind.ForOfStatement:
                    case SyntaxKind.WhileStatement:
                    case SyntaxKind.TryStatement:
                    case SyntaxKind.DoStatement:
                    case SyntaxKind.WithStatement:
                    // TODO
                    // case SyntaxKind.ElseClause:
                    case SyntaxKind.CatchClause:
                        return true;
                    default:
                        return false;
                }
            };
            Rules.IsObjectContext = function (context) {
                return context.contextNode.kind === SyntaxKind.ObjectLiteralExpression;
            };
            Rules.IsFunctionCallContext = function (context) {
                return context.contextNode.kind === SyntaxKind.CallExpression;
            };
            Rules.IsNewContext = function (context) {
                return context.contextNode.kind === SyntaxKind.NewExpression;
            };
            Rules.IsFunctionCallOrNewContext = function (context) {
                return Rules.IsFunctionCallContext(context) || Rules.IsNewContext(context);
            };
            Rules.IsPreviousTokenNotComma = function (context) {
                return context.currentTokenSpan.kind !== SyntaxKind.CommaToken;
            };
            Rules.IsNextTokenNotCloseBracket = function (context) {
                return context.nextTokenSpan.kind !== SyntaxKind.CloseBracketToken;
            };
            Rules.IsArrowFunctionContext = function (context) {
                return context.contextNode.kind === SyntaxKind.ArrowFunction;
            };
            Rules.IsNonJsxSameLineTokenContext = function (context) {
                return context.TokensAreOnSameLine() && context.contextNode.kind !== SyntaxKind.JsxText;
            };
            Rules.isNonJsxElementContext = function (context) {
                return context.contextNode.kind !== SyntaxKind.JsxElement;
            };
            Rules.isJsxExpressionContext = function (context) {
                return context.contextNode.kind === SyntaxKind.JsxExpression;
            };
            Rules.IsNotBeforeBlockInFunctionDeclarationContext = function (context) {
                return !Rules.IsFunctionDeclContext(context) && !Rules.IsBeforeBlockContext(context);
            };
            Rules.IsEndOfDecoratorContextOnSameLine = function (context) {
                return context.TokensAreOnSameLine() &&
                    context.contextNode.decorators &&
                    Rules.NodeIsInDecoratorContext(context.currentTokenParent) &&
                    !Rules.NodeIsInDecoratorContext(context.nextTokenParent);
            };
            Rules.NodeIsInDecoratorContext = function (node) {
                while (ts.isExpression(node)) {
                    node = node.parent;
                }
                return node.kind === SyntaxKind.Decorator;
            };
            Rules.IsStartOfVariableDeclarationList = function (context) {
                return context.currentTokenParent.kind === SyntaxKind.VariableDeclarationList &&
                    context.currentTokenParent.getStart(context.sourceFile) === context.currentTokenSpan.pos;
            };
            Rules.IsNotFormatOnEnter = function (context) {
                return context.formattingRequestKind !== 2 /* FormatOnEnter */;
            };
            Rules.IsModuleDeclContext = function (context) {
                return context.contextNode.kind === SyntaxKind.ModuleDeclaration;
            };
            Rules.IsObjectTypeContext = function (context) {
                return context.contextNode.kind === SyntaxKind.TypeLiteral; // && context.contextNode.parent.kind !== SyntaxKind.InterfaceDeclaration;
            };
            Rules.IsTypeArgumentOrParameterOrAssertion = function (token, parent) {
                if (token.kind !== SyntaxKind.LessThanToken && token.kind !== SyntaxKind.GreaterThanToken) {
                    return false;
                }
                switch (parent.kind) {
                    case SyntaxKind.TypeReference:
                    case SyntaxKind.TypeAssertionExpression:
                    case SyntaxKind.ClassDeclaration:
                    case SyntaxKind.ClassExpression:
                    case SyntaxKind.InterfaceDeclaration:
                    case SyntaxKind.FunctionDeclaration:
                    case SyntaxKind.FunctionExpression:
                    case SyntaxKind.ArrowFunction:
                    case SyntaxKind.MethodDeclaration:
                    case SyntaxKind.MethodSignature:
                    case SyntaxKind.CallSignature:
                    case SyntaxKind.ConstructSignature:
                    case SyntaxKind.CallExpression:
                    case SyntaxKind.NewExpression:
                    case SyntaxKind.ExpressionWithTypeArguments:
                        return true;
                    default:
                        return false;
                }
            };
            Rules.IsTypeArgumentOrParameterOrAssertionContext = function (context) {
                return Rules.IsTypeArgumentOrParameterOrAssertion(context.currentTokenSpan, context.currentTokenParent) ||
                    Rules.IsTypeArgumentOrParameterOrAssertion(context.nextTokenSpan, context.nextTokenParent);
            };
            Rules.IsTypeAssertionContext = function (context) {
                return context.contextNode.kind === SyntaxKind.TypeAssertionExpression;
            };
            Rules.IsVoidOpContext = function (context) {
                return context.currentTokenSpan.kind === SyntaxKind.VoidKeyword && context.currentTokenParent.kind === SyntaxKind.VoidExpression;
            };
            Rules.IsYieldOrYieldStarWithOperand = function (context) {
                return context.contextNode.kind === SyntaxKind.YieldExpression && context.contextNode.expression !== undefined;
            };
            return Rules;
        }());
        formatting.Rules = Rules;
    })(formatting = ts.formatting || (ts.formatting = {}));
})(ts || (ts = {}));
//# sourceMappingURL=rules.js.map