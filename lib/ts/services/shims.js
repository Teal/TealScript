//
// Copyright (c) Microsoft Corporation.  All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path='services.ts' />
/* @internal */
var debugObjectHost = this;
// We need to use 'null' to interface with the managed side.
/* tslint:disable:no-null-keyword */
/* tslint:disable:no-in-operator */
/* @internal */
var ts;
(function (ts) {
    function logInternalError(logger, err) {
        if (logger) {
            logger.log("*INTERNAL ERROR* - Exception in typescript services: " + err.message);
        }
    }
    var ScriptSnapshotShimAdapter = (function () {
        function ScriptSnapshotShimAdapter(scriptSnapshotShim) {
            this.scriptSnapshotShim = scriptSnapshotShim;
        }
        ScriptSnapshotShimAdapter.prototype.getText = function (start, end) {
            return this.scriptSnapshotShim.getText(start, end);
        };
        ScriptSnapshotShimAdapter.prototype.getLength = function () {
            return this.scriptSnapshotShim.getLength();
        };
        ScriptSnapshotShimAdapter.prototype.getChangeRange = function (oldSnapshot) {
            var oldSnapshotShim = oldSnapshot;
            var encoded = this.scriptSnapshotShim.getChangeRange(oldSnapshotShim.scriptSnapshotShim);
            // TODO: should this be '==='?
            if (encoded == null) {
                return null;
            }
            var decoded = JSON.parse(encoded);
            return ts.createTextChangeRange(ts.createTextSpan(decoded.span.start, decoded.span.length), decoded.newLength);
        };
        ScriptSnapshotShimAdapter.prototype.dispose = function () {
            // if scriptSnapshotShim is a COM object then property check becomes method call with no arguments
            // 'in' does not have this effect
            if ("dispose" in this.scriptSnapshotShim) {
                this.scriptSnapshotShim.dispose();
            }
        };
        return ScriptSnapshotShimAdapter;
    }());
    var LanguageServiceShimHostAdapter = (function () {
        function LanguageServiceShimHostAdapter(shimHost) {
            var _this = this;
            this.shimHost = shimHost;
            this.loggingEnabled = false;
            this.tracingEnabled = false;
            // if shimHost is a COM object then property check will become method call with no arguments.
            // 'in' does not have this effect.
            if ("getModuleResolutionsForFile" in this.shimHost) {
                this.resolveModuleNames = function (moduleNames, containingFile) {
                    var resolutionsInFile = JSON.parse(_this.shimHost.getModuleResolutionsForFile(containingFile));
                    return ts.map(moduleNames, function (name) {
                        var result = ts.lookUp(resolutionsInFile, name);
                        return result ? { resolvedFileName: result } : undefined;
                    });
                };
            }
            if ("directoryExists" in this.shimHost) {
                this.directoryExists = function (directoryName) { return _this.shimHost.directoryExists(directoryName); };
            }
            if ("getTypeReferenceDirectiveResolutionsForFile" in this.shimHost) {
                this.resolveTypeReferenceDirectives = function (typeDirectiveNames, containingFile) {
                    var typeDirectivesForFile = JSON.parse(_this.shimHost.getTypeReferenceDirectiveResolutionsForFile(containingFile));
                    return ts.map(typeDirectiveNames, function (name) { return ts.lookUp(typeDirectivesForFile, name); });
                };
            }
        }
        LanguageServiceShimHostAdapter.prototype.log = function (s) {
            if (this.loggingEnabled) {
                this.shimHost.log(s);
            }
        };
        LanguageServiceShimHostAdapter.prototype.trace = function (s) {
            if (this.tracingEnabled) {
                this.shimHost.trace(s);
            }
        };
        LanguageServiceShimHostAdapter.prototype.error = function (s) {
            this.shimHost.error(s);
        };
        LanguageServiceShimHostAdapter.prototype.getProjectVersion = function () {
            if (!this.shimHost.getProjectVersion) {
                // shimmed host does not support getProjectVersion
                return undefined;
            }
            return this.shimHost.getProjectVersion();
        };
        LanguageServiceShimHostAdapter.prototype.useCaseSensitiveFileNames = function () {
            return this.shimHost.useCaseSensitiveFileNames ? this.shimHost.useCaseSensitiveFileNames() : false;
        };
        LanguageServiceShimHostAdapter.prototype.getCompilationSettings = function () {
            var settingsJson = this.shimHost.getCompilationSettings();
            // TODO: should this be '==='?
            if (settingsJson == null || settingsJson == "") {
                throw Error("LanguageServiceShimHostAdapter.getCompilationSettings: empty compilationSettings");
            }
            return JSON.parse(settingsJson);
        };
        LanguageServiceShimHostAdapter.prototype.getScriptFileNames = function () {
            var encoded = this.shimHost.getScriptFileNames();
            return this.files = JSON.parse(encoded);
        };
        LanguageServiceShimHostAdapter.prototype.getScriptSnapshot = function (fileName) {
            var scriptSnapshot = this.shimHost.getScriptSnapshot(fileName);
            return scriptSnapshot && new ScriptSnapshotShimAdapter(scriptSnapshot);
        };
        LanguageServiceShimHostAdapter.prototype.getScriptKind = function (fileName) {
            if ("getScriptKind" in this.shimHost) {
                return this.shimHost.getScriptKind(fileName);
            }
            else {
                return 0 /* Unknown */;
            }
        };
        LanguageServiceShimHostAdapter.prototype.getScriptVersion = function (fileName) {
            return this.shimHost.getScriptVersion(fileName);
        };
        LanguageServiceShimHostAdapter.prototype.getLocalizedDiagnosticMessages = function () {
            var diagnosticMessagesJson = this.shimHost.getLocalizedDiagnosticMessages();
            if (diagnosticMessagesJson == null || diagnosticMessagesJson == "") {
                return null;
            }
            try {
                return JSON.parse(diagnosticMessagesJson);
            }
            catch (e) {
                this.log(e.description || "diagnosticMessages.generated.json has invalid JSON format");
                return null;
            }
        };
        LanguageServiceShimHostAdapter.prototype.getCancellationToken = function () {
            var hostCancellationToken = this.shimHost.getCancellationToken();
            return new ThrottledCancellationToken(hostCancellationToken);
        };
        LanguageServiceShimHostAdapter.prototype.getCurrentDirectory = function () {
            return this.shimHost.getCurrentDirectory();
        };
        LanguageServiceShimHostAdapter.prototype.getDirectories = function (path) {
            return JSON.parse(this.shimHost.getDirectories(path));
        };
        LanguageServiceShimHostAdapter.prototype.getDefaultLibFileName = function (options) {
            return this.shimHost.getDefaultLibFileName(JSON.stringify(options));
        };
        return LanguageServiceShimHostAdapter;
    }());
    ts.LanguageServiceShimHostAdapter = LanguageServiceShimHostAdapter;
    /** A cancellation that throttles calls to the host */
    var ThrottledCancellationToken = (function () {
        function ThrottledCancellationToken(hostCancellationToken) {
            this.hostCancellationToken = hostCancellationToken;
            // Store when we last tried to cancel.  Checking cancellation can be expensive (as we have
            // to marshall over to the host layer).  So we only bother actually checking once enough
            // time has passed.
            this.lastCancellationCheckTime = 0;
        }
        ThrottledCancellationToken.prototype.isCancellationRequested = function () {
            var time = Date.now();
            var duration = Math.abs(time - this.lastCancellationCheckTime);
            if (duration > 10) {
                // Check no more than once every 10 ms.
                this.lastCancellationCheckTime = time;
                return this.hostCancellationToken.isCancellationRequested();
            }
            return false;
        };
        return ThrottledCancellationToken;
    }());
    var CoreServicesShimHostAdapter = (function () {
        function CoreServicesShimHostAdapter(shimHost) {
            var _this = this;
            this.shimHost = shimHost;
            this.useCaseSensitiveFileNames = this.shimHost.useCaseSensitiveFileNames ? this.shimHost.useCaseSensitiveFileNames() : false;
            if ("directoryExists" in this.shimHost) {
                this.directoryExists = function (directoryName) { return _this.shimHost.directoryExists(directoryName); };
            }
            if ("realpath" in this.shimHost) {
                this.realpath = function (path) { return _this.shimHost.realpath(path); };
            }
        }
        CoreServicesShimHostAdapter.prototype.readDirectory = function (rootDir, extensions, exclude, include, depth) {
            // Wrap the API changes for 2.0 release. This try/catch
            // should be removed once TypeScript 2.0 has shipped.
            try {
                var pattern = ts.getFileMatcherPatterns(rootDir, extensions, exclude, include, this.shimHost.useCaseSensitiveFileNames(), this.shimHost.getCurrentDirectory());
                return JSON.parse(this.shimHost.readDirectory(rootDir, JSON.stringify(extensions), JSON.stringify(pattern.basePaths), pattern.excludePattern, pattern.includeFilePattern, pattern.includeDirectoryPattern, depth));
            }
            catch (e) {
                var results = [];
                for (var _i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
                    var extension = extensions_1[_i];
                    for (var _a = 0, _b = this.readDirectoryFallback(rootDir, extension, exclude); _a < _b.length; _a++) {
                        var file = _b[_a];
                        if (!ts.contains(results, file)) {
                            results.push(file);
                        }
                    }
                }
                return results;
            }
        };
        CoreServicesShimHostAdapter.prototype.fileExists = function (fileName) {
            return this.shimHost.fileExists(fileName);
        };
        CoreServicesShimHostAdapter.prototype.readFile = function (fileName) {
            return this.shimHost.readFile(fileName);
        };
        CoreServicesShimHostAdapter.prototype.readDirectoryFallback = function (rootDir, extension, exclude) {
            return JSON.parse(this.shimHost.readDirectory(rootDir, extension, JSON.stringify(exclude)));
        };
        return CoreServicesShimHostAdapter;
    }());
    ts.CoreServicesShimHostAdapter = CoreServicesShimHostAdapter;
    function simpleForwardCall(logger, actionDescription, action, logPerformance) {
        var start;
        if (logPerformance) {
            logger.log(actionDescription);
            start = Date.now();
        }
        var result = action();
        if (logPerformance) {
            var end = Date.now();
            logger.log(actionDescription + " completed in " + (end - start) + " msec");
            if (typeof result === "string") {
                var str = result;
                if (str.length > 128) {
                    str = str.substring(0, 128) + "...";
                }
                logger.log("  result.length=" + str.length + ", result='" + JSON.stringify(str) + "'");
            }
        }
        return result;
    }
    function forwardJSONCall(logger, actionDescription, action, logPerformance) {
        return forwardCall(logger, actionDescription, /*returnJson*/ true, action, logPerformance);
    }
    function forwardCall(logger, actionDescription, returnJson, action, logPerformance) {
        try {
            var result = simpleForwardCall(logger, actionDescription, action, logPerformance);
            return returnJson ? JSON.stringify({ result: result }) : result;
        }
        catch (err) {
            if (err instanceof ts.OperationCanceledException) {
                return JSON.stringify({ canceled: true });
            }
            logInternalError(logger, err);
            err.description = actionDescription;
            return JSON.stringify({ error: err });
        }
    }
    var ShimBase = (function () {
        function ShimBase(factory) {
            this.factory = factory;
            factory.registerShim(this);
        }
        ShimBase.prototype.dispose = function (dummy) {
            this.factory.unregisterShim(this);
        };
        return ShimBase;
    }());
    function realizeDiagnostics(diagnostics, newLine) {
        return diagnostics.map(function (d) { return realizeDiagnostic(d, newLine); });
    }
    ts.realizeDiagnostics = realizeDiagnostics;
    function realizeDiagnostic(diagnostic, newLine) {
        return {
            message: ts.flattenDiagnosticMessageText(diagnostic.messageText, newLine),
            start: diagnostic.start,
            length: diagnostic.length,
            /// TODO: no need for the tolowerCase call
            category: ts.DiagnosticCategory[diagnostic.category].toLowerCase(),
            code: diagnostic.code
        };
    }
    var LanguageServiceShimObject = (function (_super) {
        __extends(LanguageServiceShimObject, _super);
        function LanguageServiceShimObject(factory, host, languageService) {
            _super.call(this, factory);
            this.host = host;
            this.languageService = languageService;
            this.logPerformance = false;
            this.logger = this.host;
        }
        LanguageServiceShimObject.prototype.forwardJSONCall = function (actionDescription, action) {
            return forwardJSONCall(this.logger, actionDescription, action, this.logPerformance);
        };
        /// DISPOSE
        /**
         * Ensure (almost) deterministic release of internal Javascript resources when
         * some external native objects holds onto us (e.g. Com/Interop).
         */
        LanguageServiceShimObject.prototype.dispose = function (dummy) {
            this.logger.log("dispose()");
            this.languageService.dispose();
            this.languageService = null;
            // force a GC
            if (debugObjectHost && debugObjectHost.CollectGarbage) {
                debugObjectHost.CollectGarbage();
                this.logger.log("CollectGarbage()");
            }
            this.logger = null;
            _super.prototype.dispose.call(this, dummy);
        };
        /// REFRESH
        /**
         * Update the list of scripts known to the compiler
         */
        LanguageServiceShimObject.prototype.refresh = function (throwOnError) {
            this.forwardJSONCall("refresh(" + throwOnError + ")", function () { return null; });
        };
        LanguageServiceShimObject.prototype.cleanupSemanticCache = function () {
            var _this = this;
            this.forwardJSONCall("cleanupSemanticCache()", function () {
                _this.languageService.cleanupSemanticCache();
                return null;
            });
        };
        LanguageServiceShimObject.prototype.realizeDiagnostics = function (diagnostics) {
            var newLine = ts.getNewLineOrDefaultFromHost(this.host);
            return ts.realizeDiagnostics(diagnostics, newLine);
        };
        LanguageServiceShimObject.prototype.getSyntacticClassifications = function (fileName, start, length) {
            var _this = this;
            return this.forwardJSONCall("getSyntacticClassifications('" + fileName + "', " + start + ", " + length + ")", function () { return _this.languageService.getSyntacticClassifications(fileName, ts.createTextSpan(start, length)); });
        };
        LanguageServiceShimObject.prototype.getSemanticClassifications = function (fileName, start, length) {
            var _this = this;
            return this.forwardJSONCall("getSemanticClassifications('" + fileName + "', " + start + ", " + length + ")", function () { return _this.languageService.getSemanticClassifications(fileName, ts.createTextSpan(start, length)); });
        };
        LanguageServiceShimObject.prototype.getEncodedSyntacticClassifications = function (fileName, start, length) {
            var _this = this;
            return this.forwardJSONCall("getEncodedSyntacticClassifications('" + fileName + "', " + start + ", " + length + ")", 
            // directly serialize the spans out to a string.  This is much faster to decode
            // on the managed side versus a full JSON array.
            function () { return convertClassifications(_this.languageService.getEncodedSyntacticClassifications(fileName, ts.createTextSpan(start, length))); });
        };
        LanguageServiceShimObject.prototype.getEncodedSemanticClassifications = function (fileName, start, length) {
            var _this = this;
            return this.forwardJSONCall("getEncodedSemanticClassifications('" + fileName + "', " + start + ", " + length + ")", 
            // directly serialize the spans out to a string.  This is much faster to decode
            // on the managed side versus a full JSON array.
            function () { return convertClassifications(_this.languageService.getEncodedSemanticClassifications(fileName, ts.createTextSpan(start, length))); });
        };
        LanguageServiceShimObject.prototype.getSyntacticDiagnostics = function (fileName) {
            var _this = this;
            return this.forwardJSONCall("getSyntacticDiagnostics('" + fileName + "')", function () {
                var diagnostics = _this.languageService.getSyntacticDiagnostics(fileName);
                return _this.realizeDiagnostics(diagnostics);
            });
        };
        LanguageServiceShimObject.prototype.getSemanticDiagnostics = function (fileName) {
            var _this = this;
            return this.forwardJSONCall("getSemanticDiagnostics('" + fileName + "')", function () {
                var diagnostics = _this.languageService.getSemanticDiagnostics(fileName);
                return _this.realizeDiagnostics(diagnostics);
            });
        };
        LanguageServiceShimObject.prototype.getCompilerOptionsDiagnostics = function () {
            var _this = this;
            return this.forwardJSONCall("getCompilerOptionsDiagnostics()", function () {
                var diagnostics = _this.languageService.getCompilerOptionsDiagnostics();
                return _this.realizeDiagnostics(diagnostics);
            });
        };
        /// QUICKINFO
        /**
         * Computes a string representation of the type at the requested position
         * in the active file.
         */
        LanguageServiceShimObject.prototype.getQuickInfoAtPosition = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getQuickInfoAtPosition('" + fileName + "', " + position + ")", function () { return _this.languageService.getQuickInfoAtPosition(fileName, position); });
        };
        /// NAMEORDOTTEDNAMESPAN
        /**
         * Computes span information of the name or dotted name at the requested position
         * in the active file.
         */
        LanguageServiceShimObject.prototype.getNameOrDottedNameSpan = function (fileName, startPos, endPos) {
            var _this = this;
            return this.forwardJSONCall("getNameOrDottedNameSpan('" + fileName + "', " + startPos + ", " + endPos + ")", function () { return _this.languageService.getNameOrDottedNameSpan(fileName, startPos, endPos); });
        };
        /**
         * STATEMENTSPAN
         * Computes span information of statement at the requested position in the active file.
         */
        LanguageServiceShimObject.prototype.getBreakpointStatementAtPosition = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getBreakpointStatementAtPosition('" + fileName + "', " + position + ")", function () { return _this.languageService.getBreakpointStatementAtPosition(fileName, position); });
        };
        /// SIGNATUREHELP
        LanguageServiceShimObject.prototype.getSignatureHelpItems = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getSignatureHelpItems('" + fileName + "', " + position + ")", function () { return _this.languageService.getSignatureHelpItems(fileName, position); });
        };
        /// GOTO DEFINITION
        /**
         * Computes the definition location and file for the symbol
         * at the requested position.
         */
        LanguageServiceShimObject.prototype.getDefinitionAtPosition = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getDefinitionAtPosition('" + fileName + "', " + position + ")", function () { return _this.languageService.getDefinitionAtPosition(fileName, position); });
        };
        /// GOTO Type
        /**
         * Computes the definition location of the type of the symbol
         * at the requested position.
         */
        LanguageServiceShimObject.prototype.getTypeDefinitionAtPosition = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getTypeDefinitionAtPosition('" + fileName + "', " + position + ")", function () { return _this.languageService.getTypeDefinitionAtPosition(fileName, position); });
        };
        LanguageServiceShimObject.prototype.getRenameInfo = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getRenameInfo('" + fileName + "', " + position + ")", function () { return _this.languageService.getRenameInfo(fileName, position); });
        };
        LanguageServiceShimObject.prototype.findRenameLocations = function (fileName, position, findInStrings, findInComments) {
            var _this = this;
            return this.forwardJSONCall("findRenameLocations('" + fileName + "', " + position + ", " + findInStrings + ", " + findInComments + ")", function () { return _this.languageService.findRenameLocations(fileName, position, findInStrings, findInComments); });
        };
        /// GET BRACE MATCHING
        LanguageServiceShimObject.prototype.getBraceMatchingAtPosition = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getBraceMatchingAtPosition('" + fileName + "', " + position + ")", function () { return _this.languageService.getBraceMatchingAtPosition(fileName, position); });
        };
        LanguageServiceShimObject.prototype.isValidBraceCompletionAtPosition = function (fileName, position, openingBrace) {
            var _this = this;
            return this.forwardJSONCall("isValidBraceCompletionAtPosition('" + fileName + "', " + position + ", " + openingBrace + ")", function () { return _this.languageService.isValidBraceCompletionAtPosition(fileName, position, openingBrace); });
        };
        /// GET SMART INDENT
        LanguageServiceShimObject.prototype.getIndentationAtPosition = function (fileName, position, options /*Services.EditorOptions*/) {
            var _this = this;
            return this.forwardJSONCall("getIndentationAtPosition('" + fileName + "', " + position + ")", function () {
                var localOptions = JSON.parse(options);
                return _this.languageService.getIndentationAtPosition(fileName, position, localOptions);
            });
        };
        /// GET REFERENCES
        LanguageServiceShimObject.prototype.getReferencesAtPosition = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getReferencesAtPosition('" + fileName + "', " + position + ")", function () { return _this.languageService.getReferencesAtPosition(fileName, position); });
        };
        LanguageServiceShimObject.prototype.findReferences = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("findReferences('" + fileName + "', " + position + ")", function () { return _this.languageService.findReferences(fileName, position); });
        };
        LanguageServiceShimObject.prototype.getOccurrencesAtPosition = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getOccurrencesAtPosition('" + fileName + "', " + position + ")", function () { return _this.languageService.getOccurrencesAtPosition(fileName, position); });
        };
        LanguageServiceShimObject.prototype.getDocumentHighlights = function (fileName, position, filesToSearch) {
            var _this = this;
            return this.forwardJSONCall("getDocumentHighlights('" + fileName + "', " + position + ")", function () {
                var results = _this.languageService.getDocumentHighlights(fileName, position, JSON.parse(filesToSearch));
                // workaround for VS document highlighting issue - keep only items from the initial file
                var normalizedName = ts.normalizeSlashes(fileName).toLowerCase();
                return ts.filter(results, function (r) { return ts.normalizeSlashes(r.fileName).toLowerCase() === normalizedName; });
            });
        };
        /// COMPLETION LISTS
        /**
         * Get a string based representation of the completions
         * to provide at the given source position and providing a member completion
         * list if requested.
         */
        LanguageServiceShimObject.prototype.getCompletionsAtPosition = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getCompletionsAtPosition('" + fileName + "', " + position + ")", function () { return _this.languageService.getCompletionsAtPosition(fileName, position); });
        };
        /** Get a string based representation of a completion list entry details */
        LanguageServiceShimObject.prototype.getCompletionEntryDetails = function (fileName, position, entryName) {
            var _this = this;
            return this.forwardJSONCall("getCompletionEntryDetails('" + fileName + "', " + position + ", '" + entryName + "')", function () { return _this.languageService.getCompletionEntryDetails(fileName, position, entryName); });
        };
        LanguageServiceShimObject.prototype.getFormattingEditsForRange = function (fileName, start, end, options /*Services.FormatCodeOptions*/) {
            var _this = this;
            return this.forwardJSONCall("getFormattingEditsForRange('" + fileName + "', " + start + ", " + end + ")", function () {
                var localOptions = JSON.parse(options);
                return _this.languageService.getFormattingEditsForRange(fileName, start, end, localOptions);
            });
        };
        LanguageServiceShimObject.prototype.getFormattingEditsForDocument = function (fileName, options /*Services.FormatCodeOptions*/) {
            var _this = this;
            return this.forwardJSONCall("getFormattingEditsForDocument('" + fileName + "')", function () {
                var localOptions = JSON.parse(options);
                return _this.languageService.getFormattingEditsForDocument(fileName, localOptions);
            });
        };
        LanguageServiceShimObject.prototype.getFormattingEditsAfterKeystroke = function (fileName, position, key, options /*Services.FormatCodeOptions*/) {
            var _this = this;
            return this.forwardJSONCall("getFormattingEditsAfterKeystroke('" + fileName + "', " + position + ", '" + key + "')", function () {
                var localOptions = JSON.parse(options);
                return _this.languageService.getFormattingEditsAfterKeystroke(fileName, position, key, localOptions);
            });
        };
        LanguageServiceShimObject.prototype.getDocCommentTemplateAtPosition = function (fileName, position) {
            var _this = this;
            return this.forwardJSONCall("getDocCommentTemplateAtPosition('" + fileName + "', " + position + ")", function () { return _this.languageService.getDocCommentTemplateAtPosition(fileName, position); });
        };
        /// NAVIGATE TO
        /** Return a list of symbols that are interesting to navigate to */
        LanguageServiceShimObject.prototype.getNavigateToItems = function (searchValue, maxResultCount) {
            var _this = this;
            return this.forwardJSONCall("getNavigateToItems('" + searchValue + "', " + maxResultCount + ")", function () { return _this.languageService.getNavigateToItems(searchValue, maxResultCount); });
        };
        LanguageServiceShimObject.prototype.getNavigationBarItems = function (fileName) {
            var _this = this;
            return this.forwardJSONCall("getNavigationBarItems('" + fileName + "')", function () { return _this.languageService.getNavigationBarItems(fileName); });
        };
        LanguageServiceShimObject.prototype.getOutliningSpans = function (fileName) {
            var _this = this;
            return this.forwardJSONCall("getOutliningSpans('" + fileName + "')", function () { return _this.languageService.getOutliningSpans(fileName); });
        };
        LanguageServiceShimObject.prototype.getTodoComments = function (fileName, descriptors) {
            var _this = this;
            return this.forwardJSONCall("getTodoComments('" + fileName + "')", function () { return _this.languageService.getTodoComments(fileName, JSON.parse(descriptors)); });
        };
        /// Emit
        LanguageServiceShimObject.prototype.getEmitOutput = function (fileName) {
            var _this = this;
            return this.forwardJSONCall("getEmitOutput('" + fileName + "')", function () { return _this.languageService.getEmitOutput(fileName); });
        };
        LanguageServiceShimObject.prototype.getEmitOutputObject = function (fileName) {
            var _this = this;
            return forwardCall(this.logger, "getEmitOutput('" + fileName + "')", 
            /*returnJson*/ false, function () { return _this.languageService.getEmitOutput(fileName); }, this.logPerformance);
        };
        return LanguageServiceShimObject;
    }(ShimBase));
    function convertClassifications(classifications) {
        return { spans: classifications.spans.join(","), endOfLineState: classifications.endOfLineState };
    }
    var ClassifierShimObject = (function (_super) {
        __extends(ClassifierShimObject, _super);
        function ClassifierShimObject(factory, logger) {
            _super.call(this, factory);
            this.logger = logger;
            this.logPerformance = false;
            this.classifier = ts.createClassifier();
        }
        ClassifierShimObject.prototype.getEncodedLexicalClassifications = function (text, lexState, syntacticClassifierAbsent) {
            var _this = this;
            return forwardJSONCall(this.logger, "getEncodedLexicalClassifications", function () { return convertClassifications(_this.classifier.getEncodedLexicalClassifications(text, lexState, syntacticClassifierAbsent)); }, this.logPerformance);
        };
        /// COLORIZATION
        ClassifierShimObject.prototype.getClassificationsForLine = function (text, lexState, classifyKeywordsInGenerics) {
            var classification = this.classifier.getClassificationsForLine(text, lexState, classifyKeywordsInGenerics);
            var result = "";
            for (var _i = 0, _a = classification.entries; _i < _a.length; _i++) {
                var item = _a[_i];
                result += item.length + "\n";
                result += item.classification + "\n";
            }
            result += classification.finalLexState;
            return result;
        };
        return ClassifierShimObject;
    }(ShimBase));
    var CoreServicesShimObject = (function (_super) {
        __extends(CoreServicesShimObject, _super);
        function CoreServicesShimObject(factory, logger, host) {
            _super.call(this, factory);
            this.logger = logger;
            this.host = host;
            this.logPerformance = false;
        }
        CoreServicesShimObject.prototype.forwardJSONCall = function (actionDescription, action) {
            return forwardJSONCall(this.logger, actionDescription, action, this.logPerformance);
        };
        CoreServicesShimObject.prototype.resolveModuleName = function (fileName, moduleName, compilerOptionsJson) {
            var _this = this;
            return this.forwardJSONCall("resolveModuleName('" + fileName + "')", function () {
                var compilerOptions = JSON.parse(compilerOptionsJson);
                var result = ts.resolveModuleName(moduleName, ts.normalizeSlashes(fileName), compilerOptions, _this.host);
                return {
                    resolvedFileName: result.resolvedModule ? result.resolvedModule.resolvedFileName : undefined,
                    failedLookupLocations: result.failedLookupLocations
                };
            });
        };
        CoreServicesShimObject.prototype.resolveTypeReferenceDirective = function (fileName, typeReferenceDirective, compilerOptionsJson) {
            var _this = this;
            return this.forwardJSONCall("resolveTypeReferenceDirective(" + fileName + ")", function () {
                var compilerOptions = JSON.parse(compilerOptionsJson);
                var result = ts.resolveTypeReferenceDirective(typeReferenceDirective, ts.normalizeSlashes(fileName), compilerOptions, _this.host);
                return {
                    resolvedFileName: result.resolvedTypeReferenceDirective ? result.resolvedTypeReferenceDirective.resolvedFileName : undefined,
                    primary: result.resolvedTypeReferenceDirective ? result.resolvedTypeReferenceDirective.primary : true,
                    failedLookupLocations: result.failedLookupLocations
                };
            });
        };
        CoreServicesShimObject.prototype.getPreProcessedFileInfo = function (fileName, sourceTextSnapshot) {
            var _this = this;
            return this.forwardJSONCall("getPreProcessedFileInfo('" + fileName + "')", function () {
                // for now treat files as JavaScript
                var result = ts.preProcessFile(sourceTextSnapshot.getText(0, sourceTextSnapshot.getLength()), /* readImportFiles */ true, /* detectJavaScriptImports */ true);
                return {
                    referencedFiles: _this.convertFileReferences(result.referencedFiles),
                    importedFiles: _this.convertFileReferences(result.importedFiles),
                    ambientExternalModules: result.ambientExternalModules,
                    isLibFile: result.isLibFile,
                    typeReferenceDirectives: _this.convertFileReferences(result.typeReferenceDirectives)
                };
            });
        };
        CoreServicesShimObject.prototype.convertFileReferences = function (refs) {
            if (!refs) {
                return undefined;
            }
            var result = [];
            for (var _i = 0, refs_1 = refs; _i < refs_1.length; _i++) {
                var ref = refs_1[_i];
                result.push({
                    path: ts.normalizeSlashes(ref.fileName),
                    position: ref.pos,
                    length: ref.end - ref.pos
                });
            }
            return result;
        };
        CoreServicesShimObject.prototype.getTSConfigFileInfo = function (fileName, sourceTextSnapshot) {
            var _this = this;
            return this.forwardJSONCall("getTSConfigFileInfo('" + fileName + "')", function () {
                var text = sourceTextSnapshot.getText(0, sourceTextSnapshot.getLength());
                var result = ts.parseConfigFileTextToJson(fileName, text);
                if (result.error) {
                    return {
                        options: {},
                        typingOptions: {},
                        files: [],
                        raw: {},
                        errors: [realizeDiagnostic(result.error, "\r\n")]
                    };
                }
                var normalizedFileName = ts.normalizeSlashes(fileName);
                var configFile = ts.parseJsonConfigFileContent(result.config, _this.host, ts.getDirectoryPath(normalizedFileName), /*existingOptions*/ {}, normalizedFileName);
                return {
                    options: configFile.options,
                    typingOptions: configFile.typingOptions,
                    files: configFile.fileNames,
                    raw: configFile.raw,
                    errors: realizeDiagnostics(configFile.errors, "\r\n")
                };
            });
        };
        CoreServicesShimObject.prototype.getDefaultCompilationSettings = function () {
            return this.forwardJSONCall("getDefaultCompilationSettings()", function () { return ts.getDefaultCompilerOptions(); });
        };
        CoreServicesShimObject.prototype.discoverTypings = function (discoverTypingsJson) {
            var _this = this;
            var getCanonicalFileName = ts.createGetCanonicalFileName(/*useCaseSensitivefileNames:*/ false);
            return this.forwardJSONCall("discoverTypings()", function () {
                var info = JSON.parse(discoverTypingsJson);
                return ts.JsTyping.discoverTypings(_this.host, info.fileNames, ts.toPath(info.projectRootPath, info.projectRootPath, getCanonicalFileName), ts.toPath(info.safeListPath, info.safeListPath, getCanonicalFileName), info.packageNameToTypingLocation, info.typingOptions, info.compilerOptions);
            });
        };
        return CoreServicesShimObject;
    }(ShimBase));
    var TypeScriptServicesFactory = (function () {
        function TypeScriptServicesFactory() {
            this._shims = [];
        }
        /*
         * Returns script API version.
         */
        TypeScriptServicesFactory.prototype.getServicesVersion = function () {
            return ts.servicesVersion;
        };
        TypeScriptServicesFactory.prototype.createLanguageServiceShim = function (host) {
            try {
                if (this.documentRegistry === undefined) {
                    this.documentRegistry = ts.createDocumentRegistry(host.useCaseSensitiveFileNames && host.useCaseSensitiveFileNames(), host.getCurrentDirectory());
                }
                var hostAdapter = new LanguageServiceShimHostAdapter(host);
                var languageService = ts.createLanguageService(hostAdapter, this.documentRegistry);
                return new LanguageServiceShimObject(this, host, languageService);
            }
            catch (err) {
                logInternalError(host, err);
                throw err;
            }
        };
        TypeScriptServicesFactory.prototype.createClassifierShim = function (logger) {
            try {
                return new ClassifierShimObject(this, logger);
            }
            catch (err) {
                logInternalError(logger, err);
                throw err;
            }
        };
        TypeScriptServicesFactory.prototype.createCoreServicesShim = function (host) {
            try {
                var adapter = new CoreServicesShimHostAdapter(host);
                return new CoreServicesShimObject(this, host, adapter);
            }
            catch (err) {
                logInternalError(host, err);
                throw err;
            }
        };
        TypeScriptServicesFactory.prototype.close = function () {
            // Forget all the registered shims
            this._shims = [];
            this.documentRegistry = undefined;
        };
        TypeScriptServicesFactory.prototype.registerShim = function (shim) {
            this._shims.push(shim);
        };
        TypeScriptServicesFactory.prototype.unregisterShim = function (shim) {
            for (var i = 0, n = this._shims.length; i < n; i++) {
                if (this._shims[i] === shim) {
                    delete this._shims[i];
                    return;
                }
            }
            throw new Error("Invalid operation");
        };
        return TypeScriptServicesFactory;
    }());
    ts.TypeScriptServicesFactory = TypeScriptServicesFactory;
    if (typeof module !== "undefined" && module.exports) {
        module.exports = ts;
    }
})(ts || (ts = {}));
/* tslint:enable:no-in-operator */
/* tslint:enable:no-null */
/// TODO: this is used by VS, clean this up on both sides of the interface
/* @internal */
var TypeScript;
(function (TypeScript) {
    var Services;
    (function (Services) {
        Services.TypeScriptServicesFactory = ts.TypeScriptServicesFactory;
    })(Services = TypeScript.Services || (TypeScript.Services = {}));
})(TypeScript || (TypeScript = {}));
/* tslint:disable:no-unused-variable */
// 'toolsVersion' gets consumed by the managed side, so it's not unused.
// TODO: it should be moved into a namespace though.
/* @internal */
var toolsVersion = "1.9";
/* tslint:enable:no-unused-variable */
//# sourceMappingURL=shims.js.map