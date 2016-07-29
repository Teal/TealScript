/// <reference path="utilities.ts"/>
/// <reference path="parser.ts"/>
/* @internal */
var ts;
(function (ts) {
    ts.bindTime = 0;
    function getModuleInstanceState(node) {
        // A module is uninstantiated if it contains only
        // 1. interface declarations, type alias declarations
        if (node.kind === 368 /* InterfaceDeclaration */ || node.kind === 369 /* TypeAliasDeclaration */) {
            return 0 /* NonInstantiated */;
        }
        else if (ts.isConstEnumDeclaration(node)) {
            return 2 /* ConstEnumOnly */;
        }
        else if ((node.kind === 376 /* ImportDeclaration */ || node.kind === 375 /* ImportEqualsDeclaration */) && !(node.flags & 1 /* Export */)) {
            return 0 /* NonInstantiated */;
        }
        else if (node.kind === 372 /* ModuleBlock */) {
            var state_1 = 0 /* NonInstantiated */;
            ts.forEachChild(node, function (n) {
                switch (getModuleInstanceState(n)) {
                    case 0 /* NonInstantiated */:
                        // child is non-instantiated - continue searching
                        return false;
                    case 2 /* ConstEnumOnly */:
                        // child is const enum only - record state and continue searching
                        state_1 = 2 /* ConstEnumOnly */;
                        return false;
                    case 1 /* Instantiated */:
                        // child is instantiated - record state and stop
                        state_1 = 1 /* Instantiated */;
                        return true;
                }
            });
            return state_1;
        }
        else if (node.kind === 371 /* ModuleDeclaration */) {
            var body = node.body;
            return body ? getModuleInstanceState(body) : 1 /* Instantiated */;
        }
        else {
            return 1 /* Instantiated */;
        }
    }
    ts.getModuleInstanceState = getModuleInstanceState;
    var binder = createBinder();
    function bindSourceFile(file, options) {
        var start = new Date().getTime();
        binder(file, options);
        ts.bindTime += new Date().getTime() - start;
    }
    ts.bindSourceFile = bindSourceFile;
    function createBinder() {
        var file;
        var options;
        var languageVersion;
        var parent;
        var container;
        var blockScopeContainer;
        var lastContainer;
        var seenThisKeyword;
        // state used by control flow analysis
        var currentFlow;
        var currentBreakTarget;
        var currentContinueTarget;
        var currentReturnTarget;
        var currentTrueTarget;
        var currentFalseTarget;
        var preSwitchCaseFlow;
        var activeLabels;
        var hasExplicitReturn;
        // state used for emit helpers
        var emitFlags;
        // If this file is an external module, then it is automatically in strict-mode according to
        // ES6.  If it is not an external module, then we'll determine if it is in strict mode or
        // not depending on if we see "use strict" in certain places (or if we hit a class/namespace).
        var inStrictMode;
        var symbolCount = 0;
        var Symbol;
        var classifiableNames;
        var unreachableFlow = { flags: 1 /* Unreachable */ };
        var reportedUnreachableFlow = { flags: 1 /* Unreachable */ };
        function bindSourceFile(f, opts) {
            file = f;
            options = opts;
            languageVersion = ts.getEmitScriptTarget(options);
            inStrictMode = !!file.externalModuleIndicator;
            classifiableNames = {};
            symbolCount = 0;
            Symbol = ts.objectAllocator.getSymbolConstructor();
            if (!file.locals) {
                bind(file);
                file.symbolCount = symbolCount;
                file.classifiableNames = classifiableNames;
            }
            file = undefined;
            options = undefined;
            languageVersion = undefined;
            parent = undefined;
            container = undefined;
            blockScopeContainer = undefined;
            lastContainer = undefined;
            seenThisKeyword = false;
            currentFlow = undefined;
            currentBreakTarget = undefined;
            currentContinueTarget = undefined;
            currentReturnTarget = undefined;
            currentTrueTarget = undefined;
            currentFalseTarget = undefined;
            activeLabels = undefined;
            hasExplicitReturn = false;
            emitFlags = 0 /* None */;
        }
        return bindSourceFile;
        function createSymbol(flags, name) {
            symbolCount++;
            return new Symbol(flags, name);
        }
        function addDeclarationToSymbol(symbol, node, symbolFlags) {
            symbol.flags |= symbolFlags;
            node.symbol = symbol;
            if (!symbol.declarations) {
                symbol.declarations = [];
            }
            symbol.declarations.push(node);
            if (symbolFlags & 1952 /* HasExports */ && !symbol.exports) {
                symbol.exports = {};
            }
            if (symbolFlags & 6240 /* HasMembers */ && !symbol.members) {
                symbol.members = {};
            }
            if (symbolFlags & 107455 /* Value */) {
                var valueDeclaration = symbol.valueDeclaration;
                if (!valueDeclaration ||
                    (valueDeclaration.kind !== node.kind && valueDeclaration.kind === 371 /* ModuleDeclaration */)) {
                    // other kinds of value declarations take precedence over modules
                    symbol.valueDeclaration = node;
                }
            }
        }
        // Should not be called on a declaration with a computed property name,
        // unless it is a well known Symbol.
        function getDeclarationName(node) {
            if (node.name) {
                if (ts.isAmbientModule(node)) {
                    return ts.isGlobalScopeAugmentation(node) ? "__global" : "\"" + node.name.text + "\"";
                }
                if (node.name.kind === 286 /* ComputedPropertyName */) {
                    var nameExpression = node.name.expression;
                    // treat computed property names where expression is string/numeric literal as just string/numeric literal
                    if (ts.isStringOrNumericLiteral(nameExpression.kind)) {
                        return nameExpression.text;
                    }
                    ts.Debug.assert(ts.isWellKnownSymbolSyntactically(nameExpression));
                    return ts.getPropertyNameForKnownSymbolName(nameExpression.name.text);
                }
                return node.name.text;
            }
            switch (node.kind) {
                case 294 /* Constructor */:
                    return "__constructor";
                case 302 /* FunctionType */:
                case 297 /* CallSignature */:
                    return "__call";
                case 303 /* ConstructorType */:
                case 298 /* ConstructSignature */:
                    return "__new";
                case 299 /* IndexSignature */:
                    return "__index";
                case 382 /* ExportDeclaration */:
                    return "__export";
                case 381 /* ExportAssignment */:
                    return node.isExportEquals ? "export=" : "default";
                case 333 /* BinaryExpression */:
                    switch (ts.getSpecialPropertyAssignmentKind(node)) {
                        case 2 /* ModuleExports */:
                            // module.exports = ...
                            return "export=";
                        case 1 /* ExportsProperty */:
                        case 4 /* ThisProperty */:
                            // exports.x = ... or this.y = ...
                            return node.left.name.text;
                        case 3 /* PrototypeProperty */:
                            // className.prototype.methodName = ...
                            return node.left.expression.name.text;
                    }
                    ts.Debug.fail("Unknown binary declaration kind");
                    break;
                case 366 /* FunctionDeclaration */:
                case 367 /* ClassDeclaration */:
                    return node.flags & 512 /* Default */ ? "default" : undefined;
                case 415 /* JSDocFunctionType */:
                    return ts.isJSDocConstructSignature(node) ? "__new" : "__call";
                case 288 /* Parameter */:
                    // Parameters with names are handled at the top of this function.  Parameters
                    // without names can only come from JSDocFunctionTypes.
                    ts.Debug.assert(node.parent.kind === 415 /* JSDocFunctionType */);
                    var functionType = node.parent;
                    var index = ts.indexOf(functionType.parameters, node);
                    return "p" + index;
                case 425 /* JSDocTypedefTag */:
                    var parentNode = node.parent && node.parent.parent;
                    var nameFromParentNode = void 0;
                    if (parentNode && parentNode.kind === 346 /* VariableStatement */) {
                        if (parentNode.declarationList.declarations.length > 0) {
                            var nameIdentifier = parentNode.declarationList.declarations[0].name;
                            if (nameIdentifier.kind === 215 /* Identifier */) {
                                nameFromParentNode = nameIdentifier.text;
                            }
                        }
                    }
                    return nameFromParentNode;
            }
        }
        function getDisplayName(node) {
            return node.name ? ts.declarationNameToString(node.name) : getDeclarationName(node);
        }
        /**
         * Declares a Symbol for the node and adds it to symbols. Reports errors for conflicting identifier names.
         * @param symbolTable - The symbol table which node will be added to.
         * @param parent - node's parent declaration.
         * @param node - The declaration to be added to the symbol table
         * @param includes - The SymbolFlags that node has in addition to its declaration type (eg: export, ambient, etc.)
         * @param excludes - The flags which node cannot be declared alongside in a symbol table. Used to report forbidden declarations.
         */
        function declareSymbol(symbolTable, parent, node, includes, excludes) {
            ts.Debug.assert(!ts.hasDynamicName(node));
            var isDefaultExport = node.flags & 512 /* Default */;
            // The exported symbol for an export default function/class node is always named "default"
            var name = isDefaultExport && parent ? "default" : getDeclarationName(node);
            var symbol;
            if (name !== undefined) {
                // Check and see if the symbol table already has a symbol with this name.  If not,
                // create a new symbol with this name and add it to the table.  Note that we don't
                // give the new symbol any flags *yet*.  This ensures that it will not conflict
                // with the 'excludes' flags we pass in.
                //
                // If we do get an existing symbol, see if it conflicts with the new symbol we're
                // creating.  For example, a 'var' symbol and a 'class' symbol will conflict within
                // the same symbol table.  If we have a conflict, report the issue on each
                // declaration we have for this symbol, and then create a new symbol for this
                // declaration.
                //
                // If we created a new symbol, either because we didn't have a symbol with this name
                // in the symbol table, or we conflicted with an existing symbol, then just add this
                // node as the sole declaration of the new symbol.
                //
                // Otherwise, we'll be merging into a compatible existing symbol (for example when
                // you have multiple 'vars' with the same name in the same container).  In this case
                // just add this node into the declarations list of the symbol.
                symbol = ts.hasProperty(symbolTable, name)
                    ? symbolTable[name]
                    : (symbolTable[name] = createSymbol(0 /* None */, name));
                if (name && (includes & 788448 /* Classifiable */)) {
                    classifiableNames[name] = name;
                }
                if (symbol.flags & excludes) {
                    if (node.name) {
                        node.name.parent = node;
                    }
                    // Report errors every position with duplicate declaration
                    // Report errors on previous encountered declarations
                    var message_1 = symbol.flags & 2 /* BlockScopedVariable */
                        ? ts.Diagnostics.Cannot_redeclare_block_scoped_variable_0
                        : ts.Diagnostics.Duplicate_identifier_0;
                    ts.forEach(symbol.declarations, function (declaration) {
                        if (declaration.flags & 512 /* Default */) {
                            message_1 = ts.Diagnostics.A_module_cannot_have_multiple_default_exports;
                        }
                    });
                    ts.forEach(symbol.declarations, function (declaration) {
                        file.bindDiagnostics.push(ts.createDiagnosticForNode(declaration.name || declaration, message_1, getDisplayName(declaration)));
                    });
                    file.bindDiagnostics.push(ts.createDiagnosticForNode(node.name || node, message_1, getDisplayName(node)));
                    symbol = createSymbol(0 /* None */, name);
                }
            }
            else {
                symbol = createSymbol(0 /* None */, "__missing");
            }
            addDeclarationToSymbol(symbol, node, includes);
            symbol.parent = parent;
            return symbol;
        }
        function declareModuleMember(node, symbolFlags, symbolExcludes) {
            var hasExportModifier = ts.getCombinedNodeFlags(node) & 1 /* Export */;
            if (symbolFlags & 8388608 /* Alias */) {
                if (node.kind === 384 /* ExportSpecifier */ || (node.kind === 375 /* ImportEqualsDeclaration */ && hasExportModifier)) {
                    return declareSymbol(container.symbol.exports, container.symbol, node, symbolFlags, symbolExcludes);
                }
                else {
                    return declareSymbol(container.locals, undefined, node, symbolFlags, symbolExcludes);
                }
            }
            else {
                // Exported module members are given 2 symbols: A local symbol that is classified with an ExportValue,
                // ExportType, or ExportContainer flag, and an associated export symbol with all the correct flags set
                // on it. There are 2 main reasons:
                //
                //   1. We treat locals and exports of the same name as mutually exclusive within a container.
                //      That means the binder will issue a Duplicate Identifier error if you mix locals and exports
                //      with the same name in the same container.
                //      TODO: Make this a more specific error and decouple it from the exclusion logic.
                //   2. When we checkIdentifier in the checker, we set its resolved symbol to the local symbol,
                //      but return the export symbol (by calling getExportSymbolOfValueSymbolIfExported). That way
                //      when the emitter comes back to it, it knows not to qualify the name if it was found in a containing scope.
                // NOTE: Nested ambient modules always should go to to 'locals' table to prevent their automatic merge
                //       during global merging in the checker. Why? The only case when ambient module is permitted inside another module is module augmentation
                //       and this case is specially handled. Module augmentations should only be merged with original module definition
                //       and should never be merged directly with other augmentation, and the latter case would be possible if automatic merge is allowed.
                if (!ts.isAmbientModule(node) && (hasExportModifier || container.flags & 8192 /* ExportContext */)) {
                    var exportKind = (symbolFlags & 107455 /* Value */ ? 1048576 /* ExportValue */ : 0) |
                        (symbolFlags & 793056 /* Type */ ? 2097152 /* ExportType */ : 0) |
                        (symbolFlags & 1536 /* Namespace */ ? 4194304 /* ExportNamespace */ : 0);
                    var local = declareSymbol(container.locals, undefined, node, exportKind, symbolExcludes);
                    local.exportSymbol = declareSymbol(container.symbol.exports, container.symbol, node, symbolFlags, symbolExcludes);
                    node.localSymbol = local;
                    return local;
                }
                else {
                    return declareSymbol(container.locals, undefined, node, symbolFlags, symbolExcludes);
                }
            }
        }
        // All container nodes are kept on a linked list in declaration order. This list is used by
        // the getLocalNameOfContainer function in the type checker to validate that the local name
        // used for a container is unique.
        function bindContainer(node, containerFlags) {
            // Before we recurse into a node's children, we first save the existing parent, container
            // and block-container.  Then after we pop out of processing the children, we restore
            // these saved values.
            var saveContainer = container;
            var savedBlockScopeContainer = blockScopeContainer;
            // Depending on what kind of node this is, we may have to adjust the current container
            // and block-container.   If the current node is a container, then it is automatically
            // considered the current block-container as well.  Also, for containers that we know
            // may contain locals, we proactively initialize the .locals field. We do this because
            // it's highly likely that the .locals will be needed to place some child in (for example,
            // a parameter, or variable declaration).
            //
            // However, we do not proactively create the .locals for block-containers because it's
            // totally normal and common for block-containers to never actually have a block-scoped
            // variable in them.  We don't want to end up allocating an object for every 'block' we
            // run into when most of them won't be necessary.
            //
            // Finally, if this is a block-container, then we clear out any existing .locals object
            // it may contain within it.  This happens in incremental scenarios.  Because we can be
            // reusing a node from a previous compilation, that node may have had 'locals' created
            // for it.  We must clear this so we don't accidentally move any stale data forward from
            // a previous compilation.
            if (containerFlags & 1 /* IsContainer */) {
                container = blockScopeContainer = node;
                if (containerFlags & 32 /* HasLocals */) {
                    container.locals = {};
                }
                addToContainerChain(container);
            }
            else if (containerFlags & 2 /* IsBlockScopedContainer */) {
                blockScopeContainer = node;
                blockScopeContainer.locals = undefined;
            }
            if (containerFlags & 4 /* IsControlFlowContainer */) {
                var saveCurrentFlow = currentFlow;
                var saveBreakTarget = currentBreakTarget;
                var saveContinueTarget = currentContinueTarget;
                var saveReturnTarget = currentReturnTarget;
                var saveActiveLabels = activeLabels;
                var saveHasExplicitReturn = hasExplicitReturn;
                var isIIFE = containerFlags & 16 /* IsFunctionExpression */ && !!ts.getImmediatelyInvokedFunctionExpression(node);
                // An IIFE is considered part of the containing control flow. Return statements behave
                // similarly to break statements that exit to a label just past the statement body.
                if (isIIFE) {
                    currentReturnTarget = createBranchLabel();
                }
                else {
                    currentFlow = { flags: 2 /* Start */ };
                    if (containerFlags & 16 /* IsFunctionExpression */) {
                        currentFlow.container = node;
                    }
                    currentReturnTarget = undefined;
                }
                currentBreakTarget = undefined;
                currentContinueTarget = undefined;
                activeLabels = undefined;
                hasExplicitReturn = false;
                bindChildren(node);
                // Reset all reachability check related flags on node (for incremental scenarios)
                // Reset all emit helper flags on node (for incremental scenarios)
                node.flags &= ~4030464 /* ReachabilityAndEmitFlags */;
                if (!(currentFlow.flags & 1 /* Unreachable */) && containerFlags & 8 /* IsFunctionLike */ && ts.nodeIsPresent(node.body)) {
                    node.flags |= 32768 /* HasImplicitReturn */;
                    if (hasExplicitReturn)
                        node.flags |= 65536 /* HasExplicitReturn */;
                }
                if (node.kind === 402 /* SourceFile */) {
                    node.flags |= emitFlags;
                }
                if (isIIFE) {
                    addAntecedent(currentReturnTarget, currentFlow);
                    currentFlow = finishFlowLabel(currentReturnTarget);
                }
                else {
                    currentFlow = saveCurrentFlow;
                }
                currentBreakTarget = saveBreakTarget;
                currentContinueTarget = saveContinueTarget;
                currentReturnTarget = saveReturnTarget;
                activeLabels = saveActiveLabels;
                hasExplicitReturn = saveHasExplicitReturn;
            }
            else if (containerFlags & 64 /* IsInterface */) {
                seenThisKeyword = false;
                bindChildren(node);
                node.flags = seenThisKeyword ? node.flags | 16384 /* ContainsThis */ : node.flags & ~16384 /* ContainsThis */;
            }
            else {
                bindChildren(node);
            }
            container = saveContainer;
            blockScopeContainer = savedBlockScopeContainer;
        }
        function bindChildren(node) {
            // Binding of JsDocComment should be done before the current block scope container changes.
            // because the scope of JsDocComment should not be affected by whether the current node is a
            // container or not.
            if (ts.isInJavaScriptFile(node) && node.jsDocComments) {
                for (var _i = 0, _a = node.jsDocComments; _i < _a.length; _i++) {
                    var jsDocComment = _a[_i];
                    bind(jsDocComment);
                }
            }
            if (checkUnreachable(node)) {
                ts.forEachChild(node, bind);
                return;
            }
            switch (node.kind) {
                case 351 /* WhileStatement */:
                    bindWhileStatement(node);
                    break;
                case 350 /* DoStatement */:
                    bindDoStatement(node);
                    break;
                case 352 /* ForStatement */:
                    bindForStatement(node);
                    break;
                case 353 /* ForInStatement */:
                case 354 /* ForOfStatement */:
                    bindForInOrForOfStatement(node);
                    break;
                case 349 /* IfStatement */:
                    bindIfStatement(node);
                    break;
                case 357 /* ReturnStatement */:
                case 361 /* ThrowStatement */:
                    bindReturnOrThrow(node);
                    break;
                case 356 /* BreakStatement */:
                case 355 /* ContinueStatement */:
                    bindBreakOrContinueStatement(node);
                    break;
                case 362 /* TryStatement */:
                    bindTryStatement(node);
                    break;
                case 359 /* SwitchStatement */:
                    bindSwitchStatement(node);
                    break;
                case 373 /* CaseBlock */:
                    bindCaseBlock(node);
                    break;
                case 395 /* CaseClause */:
                    bindCaseClause(node);
                    break;
                case 360 /* LabeledStatement */:
                    bindLabeledStatement(node);
                    break;
                case 331 /* PrefixUnaryExpression */:
                    bindPrefixUnaryExpressionFlow(node);
                    break;
                case 333 /* BinaryExpression */:
                    bindBinaryExpressionFlow(node);
                    break;
                case 327 /* DeleteExpression */:
                    bindDeleteExpressionFlow(node);
                    break;
                case 334 /* ConditionalExpression */:
                    bindConditionalExpressionFlow(node);
                    break;
                case 364 /* VariableDeclaration */:
                    bindVariableDeclarationFlow(node);
                    break;
                case 320 /* CallExpression */:
                    bindCallExpressionFlow(node);
                    break;
                default:
                    ts.forEachChild(node, bind);
                    break;
            }
        }
        function isNarrowingExpression(expr) {
            switch (expr.kind) {
                case 215 /* Identifier */:
                case 29 /* this */:
                case 318 /* PropertyAccessExpression */:
                    return isNarrowableReference(expr);
                case 320 /* CallExpression */:
                    return hasNarrowableArgument(expr);
                case 324 /* ParenthesizedExpression */:
                    return isNarrowingExpression(expr.expression);
                case 333 /* BinaryExpression */:
                    return isNarrowingBinaryExpression(expr);
                case 331 /* PrefixUnaryExpression */:
                    return expr.operator === 32 /* exclamation */ && isNarrowingExpression(expr.operand);
            }
            return false;
        }
        function isNarrowableReference(expr) {
            return expr.kind === 215 /* Identifier */ ||
                expr.kind === 29 /* this */ ||
                expr.kind === 318 /* PropertyAccessExpression */ && isNarrowableReference(expr.expression);
        }
        function hasNarrowableArgument(expr) {
            if (expr.arguments) {
                for (var _i = 0, _a = expr.arguments; _i < _a.length; _i++) {
                    var argument = _a[_i];
                    if (isNarrowableReference(argument)) {
                        return true;
                    }
                }
            }
            if (expr.expression.kind === 318 /* PropertyAccessExpression */ &&
                isNarrowableReference(expr.expression.expression)) {
                return true;
            }
            return false;
        }
        function isNarrowingNullCheckOperands(expr1, expr2) {
            return (expr1.kind === 26 /* null */ || expr1.kind === 215 /* Identifier */ && expr1.text === "undefined") && isNarrowableOperand(expr2);
        }
        function isNarrowingTypeofOperands(expr1, expr2) {
            return expr1.kind === 328 /* TypeOfExpression */ && isNarrowableOperand(expr1.expression) && expr2.kind === 155 /* StringLiteral */;
        }
        function isNarrowingDiscriminant(expr) {
            return expr.kind === 318 /* PropertyAccessExpression */ && isNarrowableReference(expr.expression);
        }
        function isNarrowingBinaryExpression(expr) {
            switch (expr.operatorToken.kind) {
                case 77 /* equals */:
                    return isNarrowableReference(expr.left);
                case 64 /* equalsEquals */:
                case 65 /* exclamationEquals */:
                case 66 /* equalsEqualsEquals */:
                case 67 /* exclamationEqualsEquals */:
                    return isNarrowingNullCheckOperands(expr.right, expr.left) || isNarrowingNullCheckOperands(expr.left, expr.right) ||
                        isNarrowingTypeofOperands(expr.right, expr.left) || isNarrowingTypeofOperands(expr.left, expr.right) ||
                        isNarrowingDiscriminant(expr.left) || isNarrowingDiscriminant(expr.right);
                case 59 /* instanceOf */:
                    return isNarrowableOperand(expr.left);
                case 92 /* comma */:
                    return isNarrowingExpression(expr.right);
            }
            return false;
        }
        function isNarrowableOperand(expr) {
            switch (expr.kind) {
                case 324 /* ParenthesizedExpression */:
                    return isNarrowableOperand(expr.expression);
                case 333 /* BinaryExpression */:
                    switch (expr.operatorToken.kind) {
                        case 77 /* equals */:
                            return isNarrowableOperand(expr.left);
                        case 92 /* comma */:
                            return isNarrowableOperand(expr.right);
                    }
            }
            return isNarrowableReference(expr);
        }
        function isNarrowingSwitchStatement(switchStatement) {
            var expr = switchStatement.expression;
            return expr.kind === 318 /* PropertyAccessExpression */ && isNarrowableReference(expr.expression);
        }
        function createBranchLabel() {
            return {
                flags: 4 /* BranchLabel */,
                antecedents: undefined
            };
        }
        function createLoopLabel() {
            return {
                flags: 8 /* LoopLabel */,
                antecedents: undefined
            };
        }
        function setFlowNodeReferenced(flow) {
            // On first reference we set the Referenced flag, thereafter we set the Shared flag
            flow.flags |= flow.flags & 256 /* Referenced */ ? 512 /* Shared */ : 256 /* Referenced */;
        }
        function addAntecedent(label, antecedent) {
            if (!(antecedent.flags & 1 /* Unreachable */) && !ts.contains(label.antecedents, antecedent)) {
                (label.antecedents || (label.antecedents = [])).push(antecedent);
                setFlowNodeReferenced(antecedent);
            }
        }
        function createFlowCondition(flags, antecedent, expression) {
            if (antecedent.flags & 1 /* Unreachable */) {
                return antecedent;
            }
            if (!expression) {
                return flags & 32 /* TrueCondition */ ? antecedent : unreachableFlow;
            }
            if (expression.kind === 27 /* true */ && flags & 64 /* FalseCondition */ ||
                expression.kind === 28 /* false */ && flags & 32 /* TrueCondition */) {
                return unreachableFlow;
            }
            if (!isNarrowingExpression(expression)) {
                return antecedent;
            }
            setFlowNodeReferenced(antecedent);
            return {
                flags: flags,
                expression: expression,
                antecedent: antecedent
            };
        }
        function createFlowSwitchClause(antecedent, switchStatement, clauseStart, clauseEnd) {
            if (!isNarrowingSwitchStatement(switchStatement)) {
                return antecedent;
            }
            setFlowNodeReferenced(antecedent);
            return {
                flags: 128 /* SwitchClause */,
                switchStatement: switchStatement,
                clauseStart: clauseStart,
                clauseEnd: clauseEnd,
                antecedent: antecedent
            };
        }
        function createFlowAssignment(antecedent, node) {
            setFlowNodeReferenced(antecedent);
            return {
                flags: 16 /* Assignment */,
                antecedent: antecedent,
                node: node
            };
        }
        function finishFlowLabel(flow) {
            var antecedents = flow.antecedents;
            if (!antecedents) {
                return unreachableFlow;
            }
            if (antecedents.length === 1) {
                return antecedents[0];
            }
            return flow;
        }
        function isStatementCondition(node) {
            var parent = node.parent;
            switch (parent.kind) {
                case 349 /* IfStatement */:
                case 351 /* WhileStatement */:
                case 350 /* DoStatement */:
                    return parent.expression === node;
                case 352 /* ForStatement */:
                case 334 /* ConditionalExpression */:
                    return parent.condition === node;
            }
            return false;
        }
        function isLogicalExpression(node) {
            while (true) {
                if (node.kind === 324 /* ParenthesizedExpression */) {
                    node = node.expression;
                }
                else if (node.kind === 331 /* PrefixUnaryExpression */ && node.operator === 32 /* exclamation */) {
                    node = node.operand;
                }
                else {
                    return node.kind === 333 /* BinaryExpression */ && (node.operatorToken.kind === 73 /* ampersandAmpersand */ ||
                        node.operatorToken.kind === 74 /* barBar */);
                }
            }
        }
        function isTopLevelLogicalExpression(node) {
            while (node.parent.kind === 324 /* ParenthesizedExpression */ ||
                node.parent.kind === 331 /* PrefixUnaryExpression */ &&
                    node.parent.operator === 32 /* exclamation */) {
                node = node.parent;
            }
            return !isStatementCondition(node) && !isLogicalExpression(node.parent);
        }
        function bindCondition(node, trueTarget, falseTarget) {
            var saveTrueTarget = currentTrueTarget;
            var saveFalseTarget = currentFalseTarget;
            currentTrueTarget = trueTarget;
            currentFalseTarget = falseTarget;
            bind(node);
            currentTrueTarget = saveTrueTarget;
            currentFalseTarget = saveFalseTarget;
            if (!node || !isLogicalExpression(node)) {
                addAntecedent(trueTarget, createFlowCondition(32 /* TrueCondition */, currentFlow, node));
                addAntecedent(falseTarget, createFlowCondition(64 /* FalseCondition */, currentFlow, node));
            }
        }
        function bindIterativeStatement(node, breakTarget, continueTarget) {
            var saveBreakTarget = currentBreakTarget;
            var saveContinueTarget = currentContinueTarget;
            currentBreakTarget = breakTarget;
            currentContinueTarget = continueTarget;
            bind(node);
            currentBreakTarget = saveBreakTarget;
            currentContinueTarget = saveContinueTarget;
        }
        function bindWhileStatement(node) {
            var preWhileLabel = createLoopLabel();
            var preBodyLabel = createBranchLabel();
            var postWhileLabel = createBranchLabel();
            addAntecedent(preWhileLabel, currentFlow);
            currentFlow = preWhileLabel;
            bindCondition(node.expression, preBodyLabel, postWhileLabel);
            currentFlow = finishFlowLabel(preBodyLabel);
            bindIterativeStatement(node.statement, postWhileLabel, preWhileLabel);
            addAntecedent(preWhileLabel, currentFlow);
            currentFlow = finishFlowLabel(postWhileLabel);
        }
        function bindDoStatement(node) {
            var preDoLabel = createLoopLabel();
            var preConditionLabel = createBranchLabel();
            var postDoLabel = createBranchLabel();
            addAntecedent(preDoLabel, currentFlow);
            currentFlow = preDoLabel;
            bindIterativeStatement(node.statement, postDoLabel, preConditionLabel);
            addAntecedent(preConditionLabel, currentFlow);
            currentFlow = finishFlowLabel(preConditionLabel);
            bindCondition(node.expression, preDoLabel, postDoLabel);
            currentFlow = finishFlowLabel(postDoLabel);
        }
        function bindForStatement(node) {
            var preLoopLabel = createLoopLabel();
            var preBodyLabel = createBranchLabel();
            var postLoopLabel = createBranchLabel();
            bind(node.initializer);
            addAntecedent(preLoopLabel, currentFlow);
            currentFlow = preLoopLabel;
            bindCondition(node.condition, preBodyLabel, postLoopLabel);
            currentFlow = finishFlowLabel(preBodyLabel);
            bindIterativeStatement(node.statement, postLoopLabel, preLoopLabel);
            bind(node.incrementor);
            addAntecedent(preLoopLabel, currentFlow);
            currentFlow = finishFlowLabel(postLoopLabel);
        }
        function bindForInOrForOfStatement(node) {
            var preLoopLabel = createLoopLabel();
            var postLoopLabel = createBranchLabel();
            addAntecedent(preLoopLabel, currentFlow);
            currentFlow = preLoopLabel;
            bind(node.expression);
            addAntecedent(postLoopLabel, currentFlow);
            bind(node.initializer);
            if (node.initializer.kind !== 365 /* VariableDeclarationList */) {
                bindAssignmentTargetFlow(node.initializer);
            }
            bindIterativeStatement(node.statement, postLoopLabel, preLoopLabel);
            addAntecedent(preLoopLabel, currentFlow);
            currentFlow = finishFlowLabel(postLoopLabel);
        }
        function bindIfStatement(node) {
            var thenLabel = createBranchLabel();
            var elseLabel = createBranchLabel();
            var postIfLabel = createBranchLabel();
            bindCondition(node.expression, thenLabel, elseLabel);
            currentFlow = finishFlowLabel(thenLabel);
            bind(node.thenStatement);
            addAntecedent(postIfLabel, currentFlow);
            currentFlow = finishFlowLabel(elseLabel);
            bind(node.elseStatement);
            addAntecedent(postIfLabel, currentFlow);
            currentFlow = finishFlowLabel(postIfLabel);
        }
        function bindReturnOrThrow(node) {
            bind(node.expression);
            if (node.kind === 357 /* ReturnStatement */) {
                hasExplicitReturn = true;
                if (currentReturnTarget) {
                    addAntecedent(currentReturnTarget, currentFlow);
                }
            }
            currentFlow = unreachableFlow;
        }
        function findActiveLabel(name) {
            if (activeLabels) {
                for (var _i = 0, activeLabels_1 = activeLabels; _i < activeLabels_1.length; _i++) {
                    var label = activeLabels_1[_i];
                    if (label.name === name) {
                        return label;
                    }
                }
            }
            return undefined;
        }
        function bindbreakOrContinueFlow(node, breakTarget, continueTarget) {
            var flowLabel = node.kind === 356 /* BreakStatement */ ? breakTarget : continueTarget;
            if (flowLabel) {
                addAntecedent(flowLabel, currentFlow);
                currentFlow = unreachableFlow;
            }
        }
        function bindBreakOrContinueStatement(node) {
            bind(node.label);
            if (node.label) {
                var activeLabel = findActiveLabel(node.label.text);
                if (activeLabel) {
                    activeLabel.referenced = true;
                    bindbreakOrContinueFlow(node, activeLabel.breakTarget, activeLabel.continueTarget);
                }
            }
            else {
                bindbreakOrContinueFlow(node, currentBreakTarget, currentContinueTarget);
            }
        }
        function bindTryStatement(node) {
            var postFinallyLabel = createBranchLabel();
            var preTryFlow = currentFlow;
            // TODO: Every statement in try block is potentially an exit point!
            bind(node.tryBlock);
            addAntecedent(postFinallyLabel, currentFlow);
            if (node.catchClause) {
                currentFlow = preTryFlow;
                bind(node.catchClause);
                addAntecedent(postFinallyLabel, currentFlow);
            }
            if (node.finallyBlock) {
                currentFlow = preTryFlow;
                bind(node.finallyBlock);
            }
            currentFlow = finishFlowLabel(postFinallyLabel);
        }
        function bindSwitchStatement(node) {
            var postSwitchLabel = createBranchLabel();
            bind(node.expression);
            var saveBreakTarget = currentBreakTarget;
            var savePreSwitchCaseFlow = preSwitchCaseFlow;
            currentBreakTarget = postSwitchLabel;
            preSwitchCaseFlow = currentFlow;
            bind(node.caseBlock);
            addAntecedent(postSwitchLabel, currentFlow);
            var hasDefault = ts.forEach(node.caseBlock.clauses, function (c) { return c.kind === 396 /* DefaultClause */; });
            // We mark a switch statement as possibly exhaustive if it has no default clause and if all
            // case clauses have unreachable end points (e.g. they all return).
            node.possiblyExhaustive = !hasDefault && !postSwitchLabel.antecedents;
            if (!hasDefault) {
                addAntecedent(postSwitchLabel, createFlowSwitchClause(preSwitchCaseFlow, node, 0, 0));
            }
            currentBreakTarget = saveBreakTarget;
            preSwitchCaseFlow = savePreSwitchCaseFlow;
            currentFlow = finishFlowLabel(postSwitchLabel);
        }
        function bindCaseBlock(node) {
            var clauses = node.clauses;
            var fallthroughFlow = unreachableFlow;
            for (var i = 0; i < clauses.length; i++) {
                var clauseStart = i;
                while (!clauses[i].statements.length && i + 1 < clauses.length) {
                    bind(clauses[i]);
                    i++;
                }
                var preCaseLabel = createBranchLabel();
                addAntecedent(preCaseLabel, createFlowSwitchClause(preSwitchCaseFlow, node.parent, clauseStart, i + 1));
                addAntecedent(preCaseLabel, fallthroughFlow);
                currentFlow = finishFlowLabel(preCaseLabel);
                var clause = clauses[i];
                bind(clause);
                fallthroughFlow = currentFlow;
                if (!(currentFlow.flags & 1 /* Unreachable */) && i !== clauses.length - 1 && options.noFallthroughCasesInSwitch) {
                    errorOnFirstToken(clause, ts.Diagnostics.Fallthrough_case_in_switch);
                }
            }
        }
        function bindCaseClause(node) {
            var saveCurrentFlow = currentFlow;
            currentFlow = preSwitchCaseFlow;
            bind(node.expression);
            currentFlow = saveCurrentFlow;
            ts.forEach(node.statements, bind);
        }
        function pushActiveLabel(name, breakTarget, continueTarget) {
            var activeLabel = {
                name: name,
                breakTarget: breakTarget,
                continueTarget: continueTarget,
                referenced: false
            };
            (activeLabels || (activeLabels = [])).push(activeLabel);
            return activeLabel;
        }
        function popActiveLabel() {
            activeLabels.pop();
        }
        function bindLabeledStatement(node) {
            var preStatementLabel = createLoopLabel();
            var postStatementLabel = createBranchLabel();
            bind(node.label);
            addAntecedent(preStatementLabel, currentFlow);
            var activeLabel = pushActiveLabel(node.label.text, postStatementLabel, preStatementLabel);
            bind(node.statement);
            popActiveLabel();
            if (!activeLabel.referenced && !options.allowUnusedLabels) {
                file.bindDiagnostics.push(ts.createDiagnosticForNode(node.label, ts.Diagnostics.Unused_label));
            }
            addAntecedent(postStatementLabel, currentFlow);
            currentFlow = finishFlowLabel(postStatementLabel);
        }
        function bindDestructuringTargetFlow(node) {
            if (node.kind === 333 /* BinaryExpression */ && node.operatorToken.kind === 77 /* equals */) {
                bindAssignmentTargetFlow(node.left);
            }
            else {
                bindAssignmentTargetFlow(node);
            }
        }
        function bindAssignmentTargetFlow(node) {
            if (isNarrowableReference(node)) {
                currentFlow = createFlowAssignment(currentFlow, node);
            }
            else if (node.kind === 316 /* ArrayLiteralExpression */) {
                for (var _i = 0, _a = node.elements; _i < _a.length; _i++) {
                    var e = _a[_i];
                    if (e.kind === 337 /* SpreadElementExpression */) {
                        bindAssignmentTargetFlow(e.expression);
                    }
                    else {
                        bindDestructuringTargetFlow(e);
                    }
                }
            }
            else if (node.kind === 317 /* ObjectLiteralExpression */) {
                for (var _b = 0, _c = node.properties; _b < _c.length; _b++) {
                    var p = _c[_b];
                    if (p.kind === 399 /* PropertyAssignment */) {
                        bindDestructuringTargetFlow(p.initializer);
                    }
                    else if (p.kind === 400 /* ShorthandPropertyAssignment */) {
                        bindAssignmentTargetFlow(p.name);
                    }
                }
            }
        }
        function bindLogicalExpression(node, trueTarget, falseTarget) {
            var preRightLabel = createBranchLabel();
            if (node.operatorToken.kind === 73 /* ampersandAmpersand */) {
                bindCondition(node.left, preRightLabel, falseTarget);
            }
            else {
                bindCondition(node.left, trueTarget, preRightLabel);
            }
            currentFlow = finishFlowLabel(preRightLabel);
            bind(node.operatorToken);
            bindCondition(node.right, trueTarget, falseTarget);
        }
        function bindPrefixUnaryExpressionFlow(node) {
            if (node.operator === 32 /* exclamation */) {
                var saveTrueTarget = currentTrueTarget;
                currentTrueTarget = currentFalseTarget;
                currentFalseTarget = saveTrueTarget;
                ts.forEachChild(node, bind);
                currentFalseTarget = currentTrueTarget;
                currentTrueTarget = saveTrueTarget;
            }
            else {
                ts.forEachChild(node, bind);
            }
        }
        function bindBinaryExpressionFlow(node) {
            var operator = node.operatorToken.kind;
            if (operator === 73 /* ampersandAmpersand */ || operator === 74 /* barBar */) {
                if (isTopLevelLogicalExpression(node)) {
                    var postExpressionLabel = createBranchLabel();
                    bindLogicalExpression(node, postExpressionLabel, postExpressionLabel);
                    currentFlow = finishFlowLabel(postExpressionLabel);
                }
                else {
                    bindLogicalExpression(node, currentTrueTarget, currentFalseTarget);
                }
            }
            else {
                ts.forEachChild(node, bind);
                if (operator === 77 /* equals */ && !ts.isAssignmentTarget(node)) {
                    bindAssignmentTargetFlow(node.left);
                }
            }
        }
        function bindDeleteExpressionFlow(node) {
            ts.forEachChild(node, bind);
            if (node.expression.kind === 318 /* PropertyAccessExpression */) {
                bindAssignmentTargetFlow(node.expression);
            }
        }
        function bindConditionalExpressionFlow(node) {
            var trueLabel = createBranchLabel();
            var falseLabel = createBranchLabel();
            var postExpressionLabel = createBranchLabel();
            bindCondition(node.condition, trueLabel, falseLabel);
            currentFlow = finishFlowLabel(trueLabel);
            bind(node.whenTrue);
            addAntecedent(postExpressionLabel, currentFlow);
            currentFlow = finishFlowLabel(falseLabel);
            bind(node.whenFalse);
            addAntecedent(postExpressionLabel, currentFlow);
            currentFlow = finishFlowLabel(postExpressionLabel);
        }
        function bindInitializedVariableFlow(node) {
            var name = node.name;
            if (ts.isBindingPattern(name)) {
                for (var _i = 0, _a = name.elements; _i < _a.length; _i++) {
                    var child = _a[_i];
                    bindInitializedVariableFlow(child);
                }
            }
            else {
                currentFlow = createFlowAssignment(currentFlow, node);
            }
        }
        function bindVariableDeclarationFlow(node) {
            ts.forEachChild(node, bind);
            if (node.initializer || node.parent.parent.kind === 353 /* ForInStatement */ || node.parent.parent.kind === 354 /* ForOfStatement */) {
                bindInitializedVariableFlow(node);
            }
        }
        function bindCallExpressionFlow(node) {
            // If the target of the call expression is a function expression or arrow function we have
            // an immediately invoked function expression (IIFE). Initialize the flowNode property to
            // the current control flow (which includes evaluation of the IIFE arguments).
            var expr = node.expression;
            while (expr.kind === 324 /* ParenthesizedExpression */) {
                expr = expr.expression;
            }
            if (expr.kind === 325 /* FunctionExpression */ || expr.kind === 326 /* ArrowFunction */) {
                ts.forEach(node.typeArguments, bind);
                ts.forEach(node.arguments, bind);
                bind(node.expression);
            }
            else {
                ts.forEachChild(node, bind);
            }
        }
        function getContainerFlags(node) {
            switch (node.kind) {
                case 338 /* ClassExpression */:
                case 367 /* ClassDeclaration */:
                case 370 /* EnumDeclaration */:
                case 317 /* ObjectLiteralExpression */:
                case 305 /* TypeLiteral */:
                case 427 /* JSDocTypeLiteral */:
                case 411 /* JSDocRecordType */:
                    return 1 /* IsContainer */;
                case 368 /* InterfaceDeclaration */:
                    return 1 /* IsContainer */ | 64 /* IsInterface */;
                case 415 /* JSDocFunctionType */:
                case 371 /* ModuleDeclaration */:
                case 369 /* TypeAliasDeclaration */:
                    return 1 /* IsContainer */ | 32 /* HasLocals */;
                case 402 /* SourceFile */:
                    return 1 /* IsContainer */ | 4 /* IsControlFlowContainer */ | 32 /* HasLocals */;
                case 294 /* Constructor */:
                case 366 /* FunctionDeclaration */:
                case 293 /* MethodDeclaration */:
                case 292 /* MethodSignature */:
                case 295 /* GetAccessor */:
                case 296 /* SetAccessor */:
                case 297 /* CallSignature */:
                case 298 /* ConstructSignature */:
                case 299 /* IndexSignature */:
                case 302 /* FunctionType */:
                case 303 /* ConstructorType */:
                    return 1 /* IsContainer */ | 4 /* IsControlFlowContainer */ | 32 /* HasLocals */ | 8 /* IsFunctionLike */;
                case 325 /* FunctionExpression */:
                case 326 /* ArrowFunction */:
                    return 1 /* IsContainer */ | 4 /* IsControlFlowContainer */ | 32 /* HasLocals */ | 8 /* IsFunctionLike */ | 16 /* IsFunctionExpression */;
                case 372 /* ModuleBlock */:
                    return 4 /* IsControlFlowContainer */;
                case 291 /* PropertyDeclaration */:
                    return node.initializer ? 4 /* IsControlFlowContainer */ : 0;
                case 398 /* CatchClause */:
                case 352 /* ForStatement */:
                case 353 /* ForInStatement */:
                case 354 /* ForOfStatement */:
                case 373 /* CaseBlock */:
                    return 2 /* IsBlockScopedContainer */;
                case 345 /* Block */:
                    // do not treat blocks directly inside a function as a block-scoped-container.
                    // Locals that reside in this block should go to the function locals. Otherwise 'x'
                    // would not appear to be a redeclaration of a block scoped local in the following
                    // example:
                    //
                    //      function foo() {
                    //          var x;
                    //          let x;
                    //      }
                    //
                    // If we placed 'var x' into the function locals and 'let x' into the locals of
                    // the block, then there would be no collision.
                    //
                    // By not creating a new block-scoped-container here, we ensure that both 'var x'
                    // and 'let x' go into the Function-container's locals, and we do get a collision
                    // conflict.
                    return ts.isFunctionLike(node.parent) ? 0 /* None */ : 2 /* IsBlockScopedContainer */;
            }
            return 0 /* None */;
        }
        function addToContainerChain(next) {
            if (lastContainer) {
                lastContainer.nextContainer = next;
            }
            lastContainer = next;
        }
        function declareSymbolAndAddToSymbolTable(node, symbolFlags, symbolExcludes) {
            // Just call this directly so that the return type of this function stays "void".
            return declareSymbolAndAddToSymbolTableWorker(node, symbolFlags, symbolExcludes);
        }
        function declareSymbolAndAddToSymbolTableWorker(node, symbolFlags, symbolExcludes) {
            switch (container.kind) {
                // Modules, source files, and classes need specialized handling for how their
                // members are declared (for example, a member of a class will go into a specific
                // symbol table depending on if it is static or not). We defer to specialized
                // handlers to take care of declaring these child members.
                case 371 /* ModuleDeclaration */:
                    return declareModuleMember(node, symbolFlags, symbolExcludes);
                case 402 /* SourceFile */:
                    return declareSourceFileMember(node, symbolFlags, symbolExcludes);
                case 338 /* ClassExpression */:
                case 367 /* ClassDeclaration */:
                    return declareClassMember(node, symbolFlags, symbolExcludes);
                case 370 /* EnumDeclaration */:
                    return declareSymbol(container.symbol.exports, container.symbol, node, symbolFlags, symbolExcludes);
                case 305 /* TypeLiteral */:
                case 317 /* ObjectLiteralExpression */:
                case 368 /* InterfaceDeclaration */:
                case 411 /* JSDocRecordType */:
                case 427 /* JSDocTypeLiteral */:
                    // Interface/Object-types always have their children added to the 'members' of
                    // their container. They are only accessible through an instance of their
                    // container, and are never in scope otherwise (even inside the body of the
                    // object / type / interface declaring them). An exception is type parameters,
                    // which are in scope without qualification (similar to 'locals').
                    return declareSymbol(container.symbol.members, container.symbol, node, symbolFlags, symbolExcludes);
                case 302 /* FunctionType */:
                case 303 /* ConstructorType */:
                case 297 /* CallSignature */:
                case 298 /* ConstructSignature */:
                case 299 /* IndexSignature */:
                case 293 /* MethodDeclaration */:
                case 292 /* MethodSignature */:
                case 294 /* Constructor */:
                case 295 /* GetAccessor */:
                case 296 /* SetAccessor */:
                case 366 /* FunctionDeclaration */:
                case 325 /* FunctionExpression */:
                case 326 /* ArrowFunction */:
                case 415 /* JSDocFunctionType */:
                case 369 /* TypeAliasDeclaration */:
                    // All the children of these container types are never visible through another
                    // symbol (i.e. through another symbol's 'exports' or 'members').  Instead,
                    // they're only accessed 'lexically' (i.e. from code that exists underneath
                    // their container in the tree.  To accomplish this, we simply add their declared
                    // symbol to the 'locals' of the container.  These symbols can then be found as
                    // the type checker walks up the containers, checking them for matching names.
                    return declareSymbol(container.locals, /*parent*/ undefined, node, symbolFlags, symbolExcludes);
            }
        }
        function declareClassMember(node, symbolFlags, symbolExcludes) {
            return node.flags & 32 /* Static */
                ? declareSymbol(container.symbol.exports, container.symbol, node, symbolFlags, symbolExcludes)
                : declareSymbol(container.symbol.members, container.symbol, node, symbolFlags, symbolExcludes);
        }
        function declareSourceFileMember(node, symbolFlags, symbolExcludes) {
            return ts.isExternalModule(file)
                ? declareModuleMember(node, symbolFlags, symbolExcludes)
                : declareSymbol(file.locals, undefined, node, symbolFlags, symbolExcludes);
        }
        function hasExportDeclarations(node) {
            var body = node.kind === 402 /* SourceFile */ ? node : node.body;
            if (body && (body.kind === 402 /* SourceFile */ || body.kind === 372 /* ModuleBlock */)) {
                for (var _i = 0, _a = body.statements; _i < _a.length; _i++) {
                    var stat = _a[_i];
                    if (stat.kind === 382 /* ExportDeclaration */ || stat.kind === 381 /* ExportAssignment */) {
                        return true;
                    }
                }
            }
            return false;
        }
        function setExportContextFlag(node) {
            // A declaration source file or ambient module declaration that contains no export declarations (but possibly regular
            // declarations with export modifiers) is an export context in which declarations are implicitly exported.
            if (ts.isInAmbientContext(node) && !hasExportDeclarations(node)) {
                node.flags |= 8192 /* ExportContext */;
            }
            else {
                node.flags &= ~8192 /* ExportContext */;
            }
        }
        function bindModuleDeclaration(node) {
            setExportContextFlag(node);
            if (ts.isAmbientModule(node)) {
                if (node.flags & 1 /* Export */) {
                    errorOnFirstToken(node, ts.Diagnostics.export_modifier_cannot_be_applied_to_ambient_modules_and_module_augmentations_since_they_are_always_visible);
                }
                if (ts.isExternalModuleAugmentation(node)) {
                    declareSymbolAndAddToSymbolTable(node, 1024 /* NamespaceModule */, 0 /* NamespaceModuleExcludes */);
                }
                else {
                    var pattern = void 0;
                    if (node.name.kind === 155 /* StringLiteral */) {
                        var text = node.name.text;
                        if (ts.hasZeroOrOneAsteriskCharacter(text)) {
                            pattern = ts.tryParsePattern(text);
                        }
                        else {
                            errorOnFirstToken(node.name, ts.Diagnostics.Pattern_0_can_have_at_most_one_Asterisk_character, text);
                        }
                    }
                    var symbol = declareSymbolAndAddToSymbolTable(node, 512 /* ValueModule */, 106639 /* ValueModuleExcludes */);
                    if (pattern) {
                        (file.patternAmbientModules || (file.patternAmbientModules = [])).push({ pattern: pattern, symbol: symbol });
                    }
                }
            }
            else {
                var state = getModuleInstanceState(node);
                if (state === 0 /* NonInstantiated */) {
                    declareSymbolAndAddToSymbolTable(node, 1024 /* NamespaceModule */, 0 /* NamespaceModuleExcludes */);
                }
                else {
                    declareSymbolAndAddToSymbolTable(node, 512 /* ValueModule */, 106639 /* ValueModuleExcludes */);
                    if (node.symbol.flags & (16 /* Function */ | 32 /* Class */ | 256 /* RegularEnum */)) {
                        // if module was already merged with some function, class or non-const enum
                        // treat is a non-const-enum-only
                        node.symbol.constEnumOnlyModule = false;
                    }
                    else {
                        var currentModuleIsConstEnumOnly = state === 2 /* ConstEnumOnly */;
                        if (node.symbol.constEnumOnlyModule === undefined) {
                            // non-merged case - use the current state
                            node.symbol.constEnumOnlyModule = currentModuleIsConstEnumOnly;
                        }
                        else {
                            // merged case: module is const enum only if all its pieces are non-instantiated or const enum
                            node.symbol.constEnumOnlyModule = node.symbol.constEnumOnlyModule && currentModuleIsConstEnumOnly;
                        }
                    }
                }
            }
        }
        function bindFunctionOrConstructorType(node) {
            // For a given function symbol "<...>(...) => T" we want to generate a symbol identical
            // to the one we would get for: { <...>(...): T }
            //
            // We do that by making an anonymous type literal symbol, and then setting the function
            // symbol as its sole member. To the rest of the system, this symbol will be  indistinguishable
            // from an actual type literal symbol you would have gotten had you used the long form.
            var symbol = createSymbol(131072 /* Signature */, getDeclarationName(node));
            addDeclarationToSymbol(symbol, node, 131072 /* Signature */);
            var typeLiteralSymbol = createSymbol(2048 /* TypeLiteral */, "__type");
            addDeclarationToSymbol(typeLiteralSymbol, node, 2048 /* TypeLiteral */);
            typeLiteralSymbol.members = (_a = {}, _a[symbol.name] = symbol, _a);
            var _a;
        }
        function bindObjectLiteralExpression(node) {
            if (inStrictMode) {
                var seen = {};
                for (var _i = 0, _a = node.properties; _i < _a.length; _i++) {
                    var prop = _a[_i];
                    if (prop.name.kind !== 215 /* Identifier */) {
                        continue;
                    }
                    var identifier = prop.name;
                    // ECMA-262 11.1.5 Object Initializer
                    // If previous is not undefined then throw a SyntaxError exception if any of the following conditions are true
                    // a.This production is contained in strict code and IsDataDescriptor(previous) is true and
                    // IsDataDescriptor(propId.descriptor) is true.
                    //    b.IsDataDescriptor(previous) is true and IsAccessorDescriptor(propId.descriptor) is true.
                    //    c.IsAccessorDescriptor(previous) is true and IsDataDescriptor(propId.descriptor) is true.
                    //    d.IsAccessorDescriptor(previous) is true and IsAccessorDescriptor(propId.descriptor) is true
                    // and either both previous and propId.descriptor have[[Get]] fields or both previous and propId.descriptor have[[Set]] fields
                    var currentKind = prop.kind === 399 /* PropertyAssignment */ || prop.kind === 400 /* ShorthandPropertyAssignment */ || prop.kind === 293 /* MethodDeclaration */
                        ? 1 /* Property */
                        : 2 /* Accessor */;
                    var existingKind = seen[identifier.text];
                    if (!existingKind) {
                        seen[identifier.text] = currentKind;
                        continue;
                    }
                    if (currentKind === 1 /* Property */ && existingKind === 1 /* Property */) {
                        var span = ts.getErrorSpanForNode(file, identifier);
                        file.bindDiagnostics.push(ts.createFileDiagnostic(file, span.start, span.length, ts.Diagnostics.An_object_literal_cannot_have_multiple_properties_with_the_same_name_in_strict_mode));
                    }
                }
            }
            return bindAnonymousDeclaration(node, 4096 /* ObjectLiteral */, "__object");
        }
        function bindAnonymousDeclaration(node, symbolFlags, name) {
            var symbol = createSymbol(symbolFlags, name);
            addDeclarationToSymbol(symbol, node, symbolFlags);
        }
        function bindBlockScopedDeclaration(node, symbolFlags, symbolExcludes) {
            switch (blockScopeContainer.kind) {
                case 371 /* ModuleDeclaration */:
                    declareModuleMember(node, symbolFlags, symbolExcludes);
                    break;
                case 402 /* SourceFile */:
                    if (ts.isExternalModule(container)) {
                        declareModuleMember(node, symbolFlags, symbolExcludes);
                        break;
                    }
                // fall through.
                default:
                    if (!blockScopeContainer.locals) {
                        blockScopeContainer.locals = {};
                        addToContainerChain(blockScopeContainer);
                    }
                    declareSymbol(blockScopeContainer.locals, undefined, node, symbolFlags, symbolExcludes);
            }
        }
        function bindBlockScopedVariableDeclaration(node) {
            bindBlockScopedDeclaration(node, 2 /* BlockScopedVariable */, 107455 /* BlockScopedVariableExcludes */);
        }
        // The binder visits every node in the syntax tree so it is a convenient place to perform a single localized
        // check for reserved words used as identifiers in strict mode code.
        function checkStrictModeIdentifier(node) {
            if (inStrictMode &&
                node.originalKeywordKind >= 252 /* FirstFutureReservedWord */ &&
                node.originalKeywordKind <= 260 /* LastFutureReservedWord */ &&
                !ts.isIdentifierName(node) &&
                !ts.isInAmbientContext(node)) {
                // Report error only if there are no parse errors in file
                if (!file.parseDiagnostics.length) {
                    file.bindDiagnostics.push(ts.createDiagnosticForNode(node, getStrictModeIdentifierMessage(node), ts.declarationNameToString(node)));
                }
            }
        }
        function getStrictModeIdentifierMessage(node) {
            // Provide specialized messages to help the user understand why we think they're in
            // strict mode.
            if (ts.getContainingClass(node)) {
                return ts.Diagnostics.Identifier_expected_0_is_a_reserved_word_in_strict_mode_Class_definitions_are_automatically_in_strict_mode;
            }
            if (file.externalModuleIndicator) {
                return ts.Diagnostics.Identifier_expected_0_is_a_reserved_word_in_strict_mode_Modules_are_automatically_in_strict_mode;
            }
            return ts.Diagnostics.Identifier_expected_0_is_a_reserved_word_in_strict_mode;
        }
        function checkStrictModeBinaryExpression(node) {
            if (inStrictMode && ts.isLeftHandSideExpression(node.left) && ts.isAssignmentOperator(node.operatorToken.kind)) {
                // ECMA 262 (Annex C) The identifier eval or arguments may not appear as the LeftHandSideExpression of an
                // Assignment operator(11.13) or of a PostfixExpression(11.3)
                checkStrictModeEvalOrArguments(node, node.left);
            }
        }
        function checkStrictModeCatchClause(node) {
            // It is a SyntaxError if a TryStatement with a Catch occurs within strict code and the Identifier of the
            // Catch production is eval or arguments
            if (inStrictMode && node.variableDeclaration) {
                checkStrictModeEvalOrArguments(node, node.variableDeclaration.name);
            }
        }
        function checkStrictModeDeleteExpression(node) {
            // Grammar checking
            if (inStrictMode && node.expression.kind === 215 /* Identifier */) {
                // When a delete operator occurs within strict mode code, a SyntaxError is thrown if its
                // UnaryExpression is a direct reference to a variable, function argument, or function name
                var span = ts.getErrorSpanForNode(file, node.expression);
                file.bindDiagnostics.push(ts.createFileDiagnostic(file, span.start, span.length, ts.Diagnostics.delete_cannot_be_called_on_an_identifier_in_strict_mode));
            }
        }
        function isEvalOrArgumentsIdentifier(node) {
            return node.kind === 215 /* Identifier */ &&
                (node.text === "eval" || node.text === "arguments");
        }
        function checkStrictModeEvalOrArguments(contextNode, name) {
            if (name && name.kind === 215 /* Identifier */) {
                var identifier = name;
                if (isEvalOrArgumentsIdentifier(identifier)) {
                    // We check first if the name is inside class declaration or class expression; if so give explicit message
                    // otherwise report generic error message.
                    var span = ts.getErrorSpanForNode(file, name);
                    file.bindDiagnostics.push(ts.createFileDiagnostic(file, span.start, span.length, getStrictModeEvalOrArgumentsMessage(contextNode), identifier.text));
                }
            }
        }
        function getStrictModeEvalOrArgumentsMessage(node) {
            // Provide specialized messages to help the user understand why we think they're in
            // strict mode.
            if (ts.getContainingClass(node)) {
                return ts.Diagnostics.Invalid_use_of_0_Class_definitions_are_automatically_in_strict_mode;
            }
            if (file.externalModuleIndicator) {
                return ts.Diagnostics.Invalid_use_of_0_Modules_are_automatically_in_strict_mode;
            }
            return ts.Diagnostics.Invalid_use_of_0_in_strict_mode;
        }
        function checkStrictModeFunctionName(node) {
            if (inStrictMode) {
                // It is a SyntaxError if the identifier eval or arguments appears within a FormalParameterList of a strict mode FunctionDeclaration or FunctionExpression (13.1))
                checkStrictModeEvalOrArguments(node, node.name);
            }
        }
        function getStrictModeBlockScopeFunctionDeclarationMessage(node) {
            // Provide specialized messages to help the user understand why we think they're in
            // strict mode.
            if (ts.getContainingClass(node)) {
                return ts.Diagnostics.Function_declarations_are_not_allowed_inside_blocks_in_strict_mode_when_targeting_ES3_or_ES5_Class_definitions_are_automatically_in_strict_mode;
            }
            if (file.externalModuleIndicator) {
                return ts.Diagnostics.Function_declarations_are_not_allowed_inside_blocks_in_strict_mode_when_targeting_ES3_or_ES5_Modules_are_automatically_in_strict_mode;
            }
            return ts.Diagnostics.Function_declarations_are_not_allowed_inside_blocks_in_strict_mode_when_targeting_ES3_or_ES5;
        }
        function checkStrictModeFunctionDeclaration(node) {
            if (languageVersion < 2 /* ES6 */) {
                // Report error if function is not top level function declaration
                if (blockScopeContainer.kind !== 402 /* SourceFile */ &&
                    blockScopeContainer.kind !== 371 /* ModuleDeclaration */ &&
                    !ts.isFunctionLike(blockScopeContainer)) {
                    // We check first if the name is inside class declaration or class expression; if so give explicit message
                    // otherwise report generic error message.
                    var errorSpan = ts.getErrorSpanForNode(file, node);
                    file.bindDiagnostics.push(ts.createFileDiagnostic(file, errorSpan.start, errorSpan.length, getStrictModeBlockScopeFunctionDeclarationMessage(node)));
                }
            }
        }
        function checkStrictModeNumericLiteral(node) {
            if (inStrictMode && node.isOctalLiteral) {
                file.bindDiagnostics.push(ts.createDiagnosticForNode(node, ts.Diagnostics.Octal_literals_are_not_allowed_in_strict_mode));
            }
        }
        function checkStrictModePostfixUnaryExpression(node) {
            // Grammar checking
            // The identifier eval or arguments may not appear as the LeftHandSideExpression of an
            // Assignment operator(11.13) or of a PostfixExpression(11.3) or as the UnaryExpression
            // operated upon by a Prefix Increment(11.4.4) or a Prefix Decrement(11.4.5) operator.
            if (inStrictMode) {
                checkStrictModeEvalOrArguments(node, node.operand);
            }
        }
        function checkStrictModePrefixUnaryExpression(node) {
            // Grammar checking
            if (inStrictMode) {
                if (node.operator === 47 /* plusPlus */ || node.operator === 48 /* minusMinus */) {
                    checkStrictModeEvalOrArguments(node, node.operand);
                }
            }
        }
        function checkStrictModeWithStatement(node) {
            // Grammar checking for withStatement
            if (inStrictMode) {
                errorOnFirstToken(node, ts.Diagnostics.with_statements_are_not_allowed_in_strict_mode);
            }
        }
        function errorOnFirstToken(node, message, arg0, arg1, arg2) {
            var span = ts.getSpanOfTokenAtPosition(file, node.pos);
            file.bindDiagnostics.push(ts.createFileDiagnostic(file, span.start, span.length, message, arg0, arg1, arg2));
        }
        function getDestructuringParameterName(node) {
            return "__" + ts.indexOf(node.parent.parameters, node);
        }
        function bind(node) {
            if (!node) {
                return;
            }
            node.parent = parent;
            var saveInStrictMode = inStrictMode;
            // First we bind declaration nodes to a symbol if possible. We'll both create a symbol
            // and then potentially add the symbol to an appropriate symbol table. Possible
            // destination symbol tables are:
            //
            //  1) The 'exports' table of the current container's symbol.
            //  2) The 'members' table of the current container's symbol.
            //  3) The 'locals' table of the current container.
            //
            // However, not all symbols will end up in any of these tables. 'Anonymous' symbols
            // (like TypeLiterals for example) will not be put in any table.
            bindWorker(node);
            // Then we recurse into the children of the node to bind them as well. For certain
            // symbols we do specialized work when we recurse. For example, we'll keep track of
            // the current 'container' node when it changes. This helps us know which symbol table
            // a local should go into for example. Since terminal nodes are known not to have
            // children, as an optimization we don't process those.
            if (node.kind > ts.TokenType.last) {
                var saveParent = parent;
                parent = node;
                var containerFlags = getContainerFlags(node);
                if (containerFlags === 0 /* None */) {
                    bindChildren(node);
                }
                else {
                    bindContainer(node, containerFlags);
                }
                parent = saveParent;
            }
            inStrictMode = saveInStrictMode;
        }
        function updateStrictModeStatementList(statements) {
            if (!inStrictMode) {
                for (var _i = 0, statements_1 = statements; _i < statements_1.length; _i++) {
                    var statement = statements_1[_i];
                    if (!ts.isPrologueDirective(statement)) {
                        return;
                    }
                    if (isUseStrictPrologueDirective(statement)) {
                        inStrictMode = true;
                        return;
                    }
                }
            }
        }
        /// Should be called only on prologue directives (isPrologueDirective(node) should be true)
        function isUseStrictPrologueDirective(node) {
            var nodeText = ts.getTextOfNodeFromSourceText(file.text, node.expression);
            // Note: the node text must be exactly "use strict" or 'use strict'.  It is not ok for the
            // string to contain unicode escapes (as per ES5).
            return nodeText === '"use strict"' || nodeText === "'use strict'";
        }
        function bindWorker(node) {
            switch (node.kind) {
                /* Strict mode checks */
                case 215 /* Identifier */:
                case 29 /* this */:
                    if (currentFlow && (ts.isExpression(node) || parent.kind === 400 /* ShorthandPropertyAssignment */)) {
                        node.flowNode = currentFlow;
                    }
                    return checkStrictModeIdentifier(node);
                case 318 /* PropertyAccessExpression */:
                    if (currentFlow && isNarrowableReference(node)) {
                        node.flowNode = currentFlow;
                    }
                    break;
                case 333 /* BinaryExpression */:
                    if (ts.isInJavaScriptFile(node)) {
                        var specialKind = ts.getSpecialPropertyAssignmentKind(node);
                        switch (specialKind) {
                            case 1 /* ExportsProperty */:
                                bindExportsPropertyAssignment(node);
                                break;
                            case 2 /* ModuleExports */:
                                bindModuleExportsAssignment(node);
                                break;
                            case 3 /* PrototypeProperty */:
                                bindPrototypePropertyAssignment(node);
                                break;
                            case 4 /* ThisProperty */:
                                bindThisPropertyAssignment(node);
                                break;
                            case 0 /* None */:
                                // Nothing to do
                                break;
                            default:
                                ts.Debug.fail("Unknown special property assignment kind");
                        }
                    }
                    return checkStrictModeBinaryExpression(node);
                case 398 /* CatchClause */:
                    return checkStrictModeCatchClause(node);
                case 327 /* DeleteExpression */:
                    return checkStrictModeDeleteExpression(node);
                case 154 /* NumericLiteral */:
                    return checkStrictModeNumericLiteral(node);
                case 332 /* PostfixUnaryExpression */:
                    return checkStrictModePostfixUnaryExpression(node);
                case 331 /* PrefixUnaryExpression */:
                    return checkStrictModePrefixUnaryExpression(node);
                case 358 /* WithStatement */:
                    return checkStrictModeWithStatement(node);
                case 311 /* ThisType */:
                    seenThisKeyword = true;
                    return;
                case 300 /* TypePredicate */:
                    return checkTypePredicate(node);
                case 287 /* TypeParameter */:
                    return declareSymbolAndAddToSymbolTable(node, 262144 /* TypeParameter */, 530912 /* TypeParameterExcludes */);
                case 288 /* Parameter */:
                    return bindParameter(node);
                case 364 /* VariableDeclaration */:
                case 315 /* BindingElement */:
                    return bindVariableDeclarationOrBindingElement(node);
                case 291 /* PropertyDeclaration */:
                case 290 /* PropertySignature */:
                case 412 /* JSDocRecordMember */:
                    return bindPropertyOrMethodOrAccessor(node, 4 /* Property */ | (node.questionToken ? 536870912 /* Optional */ : 0 /* None */), 0 /* PropertyExcludes */);
                case 426 /* JSDocPropertyTag */:
                    return bindJSDocProperty(node);
                case 399 /* PropertyAssignment */:
                case 400 /* ShorthandPropertyAssignment */:
                    return bindPropertyOrMethodOrAccessor(node, 4 /* Property */, 0 /* PropertyExcludes */);
                case 401 /* EnumMember */:
                    return bindPropertyOrMethodOrAccessor(node, 8 /* EnumMember */, 107455 /* EnumMemberExcludes */);
                case 393 /* JsxSpreadAttribute */:
                    emitFlags |= 1073741824 /* HasJsxSpreadAttribute */;
                    return;
                case 297 /* CallSignature */:
                case 298 /* ConstructSignature */:
                case 299 /* IndexSignature */:
                    return declareSymbolAndAddToSymbolTable(node, 131072 /* Signature */, 0 /* None */);
                case 293 /* MethodDeclaration */:
                case 292 /* MethodSignature */:
                    // If this is an ObjectLiteralExpression method, then it sits in the same space
                    // as other properties in the object literal.  So we use SymbolFlags.PropertyExcludes
                    // so that it will conflict with any other object literal members with the same
                    // name.
                    return bindPropertyOrMethodOrAccessor(node, 8192 /* Method */ | (node.questionToken ? 536870912 /* Optional */ : 0 /* None */), ts.isObjectLiteralMethod(node) ? 0 /* PropertyExcludes */ : 99263 /* MethodExcludes */);
                case 366 /* FunctionDeclaration */:
                    return bindFunctionDeclaration(node);
                case 294 /* Constructor */:
                    return declareSymbolAndAddToSymbolTable(node, 16384 /* Constructor */, /*symbolExcludes:*/ 0 /* None */);
                case 295 /* GetAccessor */:
                    return bindPropertyOrMethodOrAccessor(node, 32768 /* GetAccessor */, 41919 /* GetAccessorExcludes */);
                case 296 /* SetAccessor */:
                    return bindPropertyOrMethodOrAccessor(node, 65536 /* SetAccessor */, 74687 /* SetAccessorExcludes */);
                case 302 /* FunctionType */:
                case 303 /* ConstructorType */:
                case 415 /* JSDocFunctionType */:
                    return bindFunctionOrConstructorType(node);
                case 305 /* TypeLiteral */:
                case 427 /* JSDocTypeLiteral */:
                case 411 /* JSDocRecordType */:
                    return bindAnonymousDeclaration(node, 2048 /* TypeLiteral */, "__type");
                case 317 /* ObjectLiteralExpression */:
                    return bindObjectLiteralExpression(node);
                case 325 /* FunctionExpression */:
                case 326 /* ArrowFunction */:
                    return bindFunctionExpression(node);
                case 320 /* CallExpression */:
                    if (ts.isInJavaScriptFile(node)) {
                        bindCallExpression(node);
                    }
                    break;
                // Members of classes, interfaces, and modules
                case 338 /* ClassExpression */:
                case 367 /* ClassDeclaration */:
                    // All classes are automatically in strict mode in ES6.
                    inStrictMode = true;
                    return bindClassLikeDeclaration(node);
                case 368 /* InterfaceDeclaration */:
                    return bindBlockScopedDeclaration(node, 64 /* Interface */, 792960 /* InterfaceExcludes */);
                case 425 /* JSDocTypedefTag */:
                case 369 /* TypeAliasDeclaration */:
                    return bindBlockScopedDeclaration(node, 524288 /* TypeAlias */, 793056 /* TypeAliasExcludes */);
                case 370 /* EnumDeclaration */:
                    return bindEnumDeclaration(node);
                case 371 /* ModuleDeclaration */:
                    return bindModuleDeclaration(node);
                // Imports and exports
                case 375 /* ImportEqualsDeclaration */:
                case 378 /* NamespaceImport */:
                case 380 /* ImportSpecifier */:
                case 384 /* ExportSpecifier */:
                    return declareSymbolAndAddToSymbolTable(node, 8388608 /* Alias */, 8388608 /* AliasExcludes */);
                case 374 /* NamespaceExportDeclaration */:
                    return bindNamespaceExportDeclaration(node);
                case 377 /* ImportClause */:
                    return bindImportClause(node);
                case 382 /* ExportDeclaration */:
                    return bindExportDeclaration(node);
                case 381 /* ExportAssignment */:
                    return bindExportAssignment(node);
                case 402 /* SourceFile */:
                    updateStrictModeStatementList(node.statements);
                    return bindSourceFileIfExternalModule();
                case 345 /* Block */:
                    if (!ts.isFunctionLike(node.parent)) {
                        return;
                    }
                // Fall through
                case 372 /* ModuleBlock */:
                    return updateStrictModeStatementList(node.statements);
            }
        }
        function checkTypePredicate(node) {
            var parameterName = node.parameterName, type = node.type;
            if (parameterName && parameterName.kind === 215 /* Identifier */) {
                checkStrictModeIdentifier(parameterName);
            }
            if (parameterName && parameterName.kind === 311 /* ThisType */) {
                seenThisKeyword = true;
            }
            bind(type);
        }
        function bindSourceFileIfExternalModule() {
            setExportContextFlag(file);
            if (ts.isExternalModule(file)) {
                bindSourceFileAsExternalModule();
            }
        }
        function bindSourceFileAsExternalModule() {
            bindAnonymousDeclaration(file, 512 /* ValueModule */, "\"" + ts.removeFileExtension(file.fileName) + "\"");
        }
        function bindExportAssignment(node) {
            var boundExpression = node.kind === 381 /* ExportAssignment */ ? node.expression : node.right;
            if (!container.symbol || !container.symbol.exports) {
                // Export assignment in some sort of block construct
                bindAnonymousDeclaration(node, 8388608 /* Alias */, getDeclarationName(node));
            }
            else if (boundExpression.kind === 215 /* Identifier */ && node.kind === 381 /* ExportAssignment */) {
                // An export default clause with an identifier exports all meanings of that identifier
                declareSymbol(container.symbol.exports, container.symbol, node, 8388608 /* Alias */, 0 /* PropertyExcludes */ | 8388608 /* AliasExcludes */);
            }
            else {
                // An export default clause with an expression exports a value
                declareSymbol(container.symbol.exports, container.symbol, node, 4 /* Property */, 0 /* PropertyExcludes */ | 8388608 /* AliasExcludes */);
            }
        }
        function bindNamespaceExportDeclaration(node) {
            if (node.modifiers && node.modifiers.length) {
                file.bindDiagnostics.push(ts.createDiagnosticForNode(node, ts.Diagnostics.Modifiers_cannot_appear_here));
            }
            if (node.parent.kind !== 402 /* SourceFile */) {
                file.bindDiagnostics.push(ts.createDiagnosticForNode(node, ts.Diagnostics.Global_module_exports_may_only_appear_at_top_level));
                return;
            }
            else {
                var parent_1 = node.parent;
                if (!ts.isExternalModule(parent_1)) {
                    file.bindDiagnostics.push(ts.createDiagnosticForNode(node, ts.Diagnostics.Global_module_exports_may_only_appear_in_module_files));
                    return;
                }
                if (!parent_1.isDeclarationFile) {
                    file.bindDiagnostics.push(ts.createDiagnosticForNode(node, ts.Diagnostics.Global_module_exports_may_only_appear_in_declaration_files));
                    return;
                }
            }
            file.symbol.globalExports = file.symbol.globalExports || {};
            declareSymbol(file.symbol.globalExports, file.symbol, node, 8388608 /* Alias */, 8388608 /* AliasExcludes */);
        }
        function bindExportDeclaration(node) {
            if (!container.symbol || !container.symbol.exports) {
                // Export * in some sort of block construct
                bindAnonymousDeclaration(node, 1073741824 /* ExportStar */, getDeclarationName(node));
            }
            else if (!node.exportClause) {
                // All export * declarations are collected in an __export symbol
                declareSymbol(container.symbol.exports, container.symbol, node, 1073741824 /* ExportStar */, 0 /* None */);
            }
        }
        function bindImportClause(node) {
            if (node.name) {
                declareSymbolAndAddToSymbolTable(node, 8388608 /* Alias */, 8388608 /* AliasExcludes */);
            }
        }
        function setCommonJsModuleIndicator(node) {
            if (!file.commonJsModuleIndicator) {
                file.commonJsModuleIndicator = node;
                bindSourceFileAsExternalModule();
            }
        }
        function bindExportsPropertyAssignment(node) {
            // When we create a property via 'exports.foo = bar', the 'exports.foo' property access
            // expression is the declaration
            setCommonJsModuleIndicator(node);
            declareSymbol(file.symbol.exports, file.symbol, node.left, 4 /* Property */ | 7340032 /* Export */, 0 /* None */);
        }
        function bindModuleExportsAssignment(node) {
            // 'module.exports = expr' assignment
            setCommonJsModuleIndicator(node);
            declareSymbol(file.symbol.exports, file.symbol, node, 4 /* Property */ | 7340032 /* Export */ | 512 /* ValueModule */, 0 /* None */);
        }
        function bindThisPropertyAssignment(node) {
            // Declare a 'member' in case it turns out the container was an ES5 class or ES6 constructor
            var assignee;
            if (container.kind === 366 /* FunctionDeclaration */ || container.kind === 366 /* FunctionDeclaration */) {
                assignee = container;
            }
            else if (container.kind === 294 /* Constructor */) {
                assignee = container.parent;
            }
            else {
                return;
            }
            assignee.symbol.members = assignee.symbol.members || {};
            // It's acceptable for multiple 'this' assignments of the same identifier to occur
            declareSymbol(assignee.symbol.members, assignee.symbol, node, 4 /* Property */, 0 /* PropertyExcludes */ & ~4 /* Property */);
        }
        function bindPrototypePropertyAssignment(node) {
            // We saw a node of the form 'x.prototype.y = z'. Declare a 'member' y on x if x was a function.
            // Look up the function in the local scope, since prototype assignments should
            // follow the function declaration
            var leftSideOfAssignment = node.left;
            var classPrototype = leftSideOfAssignment.expression;
            var constructorFunction = classPrototype.expression;
            // Fix up parent pointers since we're going to use these nodes before we bind into them
            leftSideOfAssignment.parent = node;
            constructorFunction.parent = classPrototype;
            classPrototype.parent = leftSideOfAssignment;
            var funcSymbol = container.locals[constructorFunction.text];
            if (!funcSymbol || !(funcSymbol.flags & 16 /* Function */ || ts.isDeclarationOfFunctionExpression(funcSymbol))) {
                return;
            }
            // Set up the members collection if it doesn't exist already
            if (!funcSymbol.members) {
                funcSymbol.members = {};
            }
            // Declare the method/property
            declareSymbol(funcSymbol.members, funcSymbol, leftSideOfAssignment, 4 /* Property */, 0 /* PropertyExcludes */);
        }
        function bindCallExpression(node) {
            // We're only inspecting call expressions to detect CommonJS modules, so we can skip
            // this check if we've already seen the module indicator
            if (!file.commonJsModuleIndicator && ts.isRequireCall(node, /*checkArgumentIsStringLiteral*/ false)) {
                setCommonJsModuleIndicator(node);
            }
        }
        function bindClassLikeDeclaration(node) {
            if (!ts.isDeclarationFile(file) && !ts.isInAmbientContext(node)) {
                if (ts.getClassExtendsHeritageClauseElement(node) !== undefined) {
                    emitFlags |= 262144 /* HasClassExtends */;
                }
                if (ts.nodeIsDecorated(node)) {
                    emitFlags |= 524288 /* HasDecorators */;
                }
            }
            if (node.kind === 367 /* ClassDeclaration */) {
                bindBlockScopedDeclaration(node, 32 /* Class */, 899519 /* ClassExcludes */);
            }
            else {
                var bindingName = node.name ? node.name.text : "__class";
                bindAnonymousDeclaration(node, 32 /* Class */, bindingName);
                // Add name of class expression into the map for semantic classifier
                if (node.name) {
                    classifiableNames[node.name.text] = node.name.text;
                }
            }
            var symbol = node.symbol;
            // TypeScript 1.0 spec (April 2014): 8.4
            // Every class automatically contains a static property member named 'prototype', the
            // type of which is an instantiation of the class type with type Any supplied as a type
            // argument for each type parameter. It is an error to explicitly declare a static
            // property member with the name 'prototype'.
            //
            // Note: we check for this here because this class may be merging into a module.  The
            // module might have an exported variable called 'prototype'.  We can't allow that as
            // that would clash with the built-in 'prototype' for the class.
            var prototypeSymbol = createSymbol(4 /* Property */ | 134217728 /* Prototype */, "prototype");
            if (ts.hasProperty(symbol.exports, prototypeSymbol.name)) {
                if (node.name) {
                    node.name.parent = node;
                }
                file.bindDiagnostics.push(ts.createDiagnosticForNode(symbol.exports[prototypeSymbol.name].declarations[0], ts.Diagnostics.Duplicate_identifier_0, prototypeSymbol.name));
            }
            symbol.exports[prototypeSymbol.name] = prototypeSymbol;
            prototypeSymbol.parent = symbol;
        }
        function bindEnumDeclaration(node) {
            return ts.isConst(node)
                ? bindBlockScopedDeclaration(node, 128 /* ConstEnum */, 899967 /* ConstEnumExcludes */)
                : bindBlockScopedDeclaration(node, 256 /* RegularEnum */, 899327 /* RegularEnumExcludes */);
        }
        function bindVariableDeclarationOrBindingElement(node) {
            if (inStrictMode) {
                checkStrictModeEvalOrArguments(node, node.name);
            }
            if (!ts.isBindingPattern(node.name)) {
                if (ts.isBlockOrCatchScoped(node)) {
                    bindBlockScopedVariableDeclaration(node);
                }
                else if (ts.isParameterDeclaration(node)) {
                    // It is safe to walk up parent chain to find whether the node is a destructing parameter declaration
                    // because its parent chain has already been set up, since parents are set before descending into children.
                    //
                    // If node is a binding element in parameter declaration, we need to use ParameterExcludes.
                    // Using ParameterExcludes flag allows the compiler to report an error on duplicate identifiers in Parameter Declaration
                    // For example:
                    //      function foo([a,a]) {} // Duplicate Identifier error
                    //      function bar(a,a) {}   // Duplicate Identifier error, parameter declaration in this case is handled in bindParameter
                    //                             // which correctly set excluded symbols
                    declareSymbolAndAddToSymbolTable(node, 1 /* FunctionScopedVariable */, 107455 /* ParameterExcludes */);
                }
                else {
                    declareSymbolAndAddToSymbolTable(node, 1 /* FunctionScopedVariable */, 107454 /* FunctionScopedVariableExcludes */);
                }
            }
        }
        function bindParameter(node) {
            if (!ts.isDeclarationFile(file) &&
                !ts.isInAmbientContext(node) &&
                ts.nodeIsDecorated(node)) {
                emitFlags |= (524288 /* HasDecorators */ | 1048576 /* HasParamDecorators */);
            }
            if (inStrictMode) {
                // It is a SyntaxError if the identifier eval or arguments appears within a FormalParameterList of a
                // strict mode FunctionLikeDeclaration or FunctionExpression(13.1)
                checkStrictModeEvalOrArguments(node, node.name);
            }
            if (ts.isBindingPattern(node.name)) {
                bindAnonymousDeclaration(node, 1 /* FunctionScopedVariable */, getDestructuringParameterName(node));
            }
            else {
                declareSymbolAndAddToSymbolTable(node, 1 /* FunctionScopedVariable */, 107455 /* ParameterExcludes */);
            }
            // If this is a property-parameter, then also declare the property symbol into the
            // containing class.
            if (ts.isParameterPropertyDeclaration(node)) {
                var classDeclaration = node.parent.parent;
                declareSymbol(classDeclaration.symbol.members, classDeclaration.symbol, node, 4 /* Property */ | (node.questionToken ? 536870912 /* Optional */ : 0 /* None */), 0 /* PropertyExcludes */);
            }
        }
        function bindFunctionDeclaration(node) {
            if (!ts.isDeclarationFile(file) && !ts.isInAmbientContext(node)) {
                if (ts.isAsyncFunctionLike(node)) {
                    emitFlags |= 2097152 /* HasAsyncFunctions */;
                }
            }
            checkStrictModeFunctionName(node);
            if (inStrictMode) {
                checkStrictModeFunctionDeclaration(node);
                bindBlockScopedDeclaration(node, 16 /* Function */, 106927 /* FunctionExcludes */);
            }
            else {
                declareSymbolAndAddToSymbolTable(node, 16 /* Function */, 106927 /* FunctionExcludes */);
            }
        }
        function bindFunctionExpression(node) {
            if (!ts.isDeclarationFile(file) && !ts.isInAmbientContext(node)) {
                if (ts.isAsyncFunctionLike(node)) {
                    emitFlags |= 2097152 /* HasAsyncFunctions */;
                }
            }
            if (currentFlow) {
                node.flowNode = currentFlow;
            }
            checkStrictModeFunctionName(node);
            var bindingName = node.name ? node.name.text : "__function";
            return bindAnonymousDeclaration(node, 16 /* Function */, bindingName);
        }
        function bindPropertyOrMethodOrAccessor(node, symbolFlags, symbolExcludes) {
            if (!ts.isDeclarationFile(file) && !ts.isInAmbientContext(node)) {
                if (ts.isAsyncFunctionLike(node)) {
                    emitFlags |= 2097152 /* HasAsyncFunctions */;
                }
                if (ts.nodeIsDecorated(node)) {
                    emitFlags |= 524288 /* HasDecorators */;
                }
            }
            return ts.hasDynamicName(node)
                ? bindAnonymousDeclaration(node, symbolFlags, "__computed")
                : declareSymbolAndAddToSymbolTable(node, symbolFlags, symbolExcludes);
        }
        function bindJSDocProperty(node) {
            return declareSymbolAndAddToSymbolTable(node, 4 /* Property */, 0 /* PropertyExcludes */);
        }
        // reachability checks
        function shouldReportErrorOnModuleDeclaration(node) {
            var instanceState = getModuleInstanceState(node);
            return instanceState === 1 /* Instantiated */ || (instanceState === 2 /* ConstEnumOnly */ && options.preserveConstEnums);
        }
        function checkUnreachable(node) {
            if (!(currentFlow.flags & 1 /* Unreachable */)) {
                return false;
            }
            if (currentFlow === unreachableFlow) {
                var reportError = 
                // report error on all statements except empty ones
                (ts.isStatement(node) && node.kind !== 347 /* EmptyStatement */) ||
                    // report error on class declarations
                    node.kind === 367 /* ClassDeclaration */ ||
                    // report error on instantiated modules or const-enums only modules if preserveConstEnums is set
                    (node.kind === 371 /* ModuleDeclaration */ && shouldReportErrorOnModuleDeclaration(node)) ||
                    // report error on regular enums and const enums if preserveConstEnums is set
                    (node.kind === 370 /* EnumDeclaration */ && (!ts.isConstEnumDeclaration(node) || options.preserveConstEnums));
                if (reportError) {
                    currentFlow = reportedUnreachableFlow;
                    // unreachable code is reported if
                    // - user has explicitly asked about it AND
                    // - statement is in not ambient context (statements in ambient context is already an error
                    //   so we should not report extras) AND
                    //   - node is not variable statement OR
                    //   - node is block scoped variable statement OR
                    //   - node is not block scoped variable statement and at least one variable declaration has initializer
                    //   Rationale: we don't want to report errors on non-initialized var's since they are hoisted
                    //   On the other side we do want to report errors on non-initialized 'lets' because of TDZ
                    var reportUnreachableCode = !options.allowUnreachableCode &&
                        !ts.isInAmbientContext(node) &&
                        (node.kind !== 346 /* VariableStatement */ ||
                            ts.getCombinedNodeFlags(node.declarationList) & 3072 /* BlockScoped */ ||
                            ts.forEach(node.declarationList.declarations, function (d) { return d.initializer; }));
                    if (reportUnreachableCode) {
                        errorOnFirstToken(node, ts.Diagnostics.Unreachable_code_detected);
                    }
                }
            }
            return true;
        }
    }
})(ts || (ts = {}));
//# sourceMappingURL=binder.js.map