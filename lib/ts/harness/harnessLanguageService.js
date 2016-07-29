/// <reference path="..\services\services.ts" />
/// <reference path="..\services\shims.ts" />
/// <reference path="..\server\client.ts" />
/// <reference path="harness.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Harness;
(function (Harness) {
    var LanguageService;
    (function (LanguageService) {
        var ScriptInfo = (function () {
            function ScriptInfo(fileName, content, isRootFile) {
                this.fileName = fileName;
                this.content = content;
                this.isRootFile = isRootFile;
                this.version = 1;
                this.editRanges = [];
                this.lineMap = undefined;
                this.setContent(content);
            }
            ScriptInfo.prototype.setContent = function (content) {
                this.content = content;
                this.lineMap = undefined;
            };
            ScriptInfo.prototype.getLineMap = function () {
                return this.lineMap || (this.lineMap = ts.computeLineStarts(this.content));
            };
            ScriptInfo.prototype.updateContent = function (content) {
                this.editRanges = [];
                this.setContent(content);
                this.version++;
            };
            ScriptInfo.prototype.editContent = function (start, end, newText) {
                // Apply edits
                var prefix = this.content.substring(0, start);
                var middle = newText;
                var suffix = this.content.substring(end);
                this.setContent(prefix + middle + suffix);
                // Store edit range + new length of script
                this.editRanges.push({
                    length: this.content.length,
                    textChangeRange: ts.createTextChangeRange(ts.createTextSpanFromBounds(start, end), newText.length)
                });
                // Update version #
                this.version++;
            };
            ScriptInfo.prototype.getTextChangeRangeBetweenVersions = function (startVersion, endVersion) {
                if (startVersion === endVersion) {
                    // No edits!
                    return ts.unchangedTextChangeRange;
                }
                var initialEditRangeIndex = this.editRanges.length - (this.version - startVersion);
                var lastEditRangeIndex = this.editRanges.length - (this.version - endVersion);
                var entries = this.editRanges.slice(initialEditRangeIndex, lastEditRangeIndex);
                return ts.collapseTextChangeRangesAcrossMultipleVersions(entries.map(function (e) { return e.textChangeRange; }));
            };
            return ScriptInfo;
        }());
        LanguageService.ScriptInfo = ScriptInfo;
        var ScriptSnapshot = (function () {
            function ScriptSnapshot(scriptInfo) {
                this.scriptInfo = scriptInfo;
                this.textSnapshot = scriptInfo.content;
                this.version = scriptInfo.version;
            }
            ScriptSnapshot.prototype.getText = function (start, end) {
                return this.textSnapshot.substring(start, end);
            };
            ScriptSnapshot.prototype.getLength = function () {
                return this.textSnapshot.length;
            };
            ScriptSnapshot.prototype.getChangeRange = function (oldScript) {
                var oldShim = oldScript;
                return this.scriptInfo.getTextChangeRangeBetweenVersions(oldShim.version, this.version);
            };
            return ScriptSnapshot;
        }());
        var ScriptSnapshotProxy = (function () {
            function ScriptSnapshotProxy(scriptSnapshot) {
                this.scriptSnapshot = scriptSnapshot;
            }
            ScriptSnapshotProxy.prototype.getText = function (start, end) {
                return this.scriptSnapshot.getText(start, end);
            };
            ScriptSnapshotProxy.prototype.getLength = function () {
                return this.scriptSnapshot.getLength();
            };
            ScriptSnapshotProxy.prototype.getChangeRange = function (oldScript) {
                var oldShim = oldScript;
                var range = this.scriptSnapshot.getChangeRange(oldShim.scriptSnapshot);
                if (range === undefined) {
                    return undefined;
                }
                return JSON.stringify({ span: { start: range.span.start, length: range.span.length }, newLength: range.newLength });
            };
            return ScriptSnapshotProxy;
        }());
        var DefaultHostCancellationToken = (function () {
            function DefaultHostCancellationToken() {
            }
            DefaultHostCancellationToken.prototype.isCancellationRequested = function () {
                return false;
            };
            DefaultHostCancellationToken.Instance = new DefaultHostCancellationToken();
            return DefaultHostCancellationToken;
        }());
        var LanguageServiceAdapterHost = (function () {
            function LanguageServiceAdapterHost(cancellationToken, settings) {
                if (cancellationToken === void 0) { cancellationToken = DefaultHostCancellationToken.Instance; }
                if (settings === void 0) { settings = ts.getDefaultCompilerOptions(); }
                this.cancellationToken = cancellationToken;
                this.settings = settings;
                this.fileNameToScript = {};
            }
            LanguageServiceAdapterHost.prototype.getNewLine = function () {
                return "\r\n";
            };
            LanguageServiceAdapterHost.prototype.getFilenames = function () {
                var fileNames = [];
                ts.forEachValue(this.fileNameToScript, function (scriptInfo) {
                    if (scriptInfo.isRootFile) {
                        // only include root files here
                        // usually it means that we won't include lib.d.ts in the list of root files so it won't mess the computation of compilation root dir.
                        fileNames.push(scriptInfo.fileName);
                    }
                });
                return fileNames;
            };
            LanguageServiceAdapterHost.prototype.getScriptInfo = function (fileName) {
                return ts.lookUp(this.fileNameToScript, fileName);
            };
            LanguageServiceAdapterHost.prototype.addScript = function (fileName, content, isRootFile) {
                this.fileNameToScript[fileName] = new ScriptInfo(fileName, content, isRootFile);
            };
            LanguageServiceAdapterHost.prototype.editScript = function (fileName, start, end, newText) {
                var script = this.getScriptInfo(fileName);
                if (script !== undefined) {
                    script.editContent(start, end, newText);
                    return;
                }
                throw new Error("No script with name '" + fileName + "'");
            };
            LanguageServiceAdapterHost.prototype.openFile = function (fileName, content, scriptKindName) {
            };
            /**
              * @param line 0 based index
              * @param col 0 based index
              */
            LanguageServiceAdapterHost.prototype.positionToLineAndCharacter = function (fileName, position) {
                var script = this.fileNameToScript[fileName];
                assert.isOk(script);
                return ts.computeLineAndCharacterOfPosition(script.getLineMap(), position);
            };
            return LanguageServiceAdapterHost;
        }());
        LanguageService.LanguageServiceAdapterHost = LanguageServiceAdapterHost;
        /// Native adapter
        var NativeLanguageServiceHost = (function (_super) {
            __extends(NativeLanguageServiceHost, _super);
            function NativeLanguageServiceHost() {
                _super.apply(this, arguments);
            }
            NativeLanguageServiceHost.prototype.getCompilationSettings = function () { return this.settings; };
            NativeLanguageServiceHost.prototype.getCancellationToken = function () { return this.cancellationToken; };
            NativeLanguageServiceHost.prototype.getDirectories = function (path) { return []; };
            NativeLanguageServiceHost.prototype.getCurrentDirectory = function () { return ""; };
            NativeLanguageServiceHost.prototype.getDefaultLibFileName = function () { return Harness.Compiler.defaultLibFileName; };
            NativeLanguageServiceHost.prototype.getScriptFileNames = function () { return this.getFilenames(); };
            NativeLanguageServiceHost.prototype.getScriptSnapshot = function (fileName) {
                var script = this.getScriptInfo(fileName);
                return script ? new ScriptSnapshot(script) : undefined;
            };
            NativeLanguageServiceHost.prototype.getScriptKind = function (fileName) { return 0 /* Unknown */; };
            NativeLanguageServiceHost.prototype.getScriptVersion = function (fileName) {
                var script = this.getScriptInfo(fileName);
                return script ? script.version.toString() : undefined;
            };
            NativeLanguageServiceHost.prototype.log = function (s) { };
            NativeLanguageServiceHost.prototype.trace = function (s) { };
            NativeLanguageServiceHost.prototype.error = function (s) { };
            return NativeLanguageServiceHost;
        }(LanguageServiceAdapterHost));
        var NativeLanguageServiceAdapter = (function () {
            function NativeLanguageServiceAdapter(cancellationToken, options) {
                this.host = new NativeLanguageServiceHost(cancellationToken, options);
            }
            NativeLanguageServiceAdapter.prototype.getHost = function () { return this.host; };
            NativeLanguageServiceAdapter.prototype.getLanguageService = function () { return ts.createLanguageService(this.host); };
            NativeLanguageServiceAdapter.prototype.getClassifier = function () { return ts.createClassifier(); };
            NativeLanguageServiceAdapter.prototype.getPreProcessedFileInfo = function (fileName, fileContents) { return ts.preProcessFile(fileContents, /* readImportFiles */ true, ts.hasJavaScriptFileExtension(fileName)); };
            return NativeLanguageServiceAdapter;
        }());
        LanguageService.NativeLanguageServiceAdapter = NativeLanguageServiceAdapter;
        /// Shim adapter
        var ShimLanguageServiceHost = (function (_super) {
            __extends(ShimLanguageServiceHost, _super);
            function ShimLanguageServiceHost(preprocessToResolve, cancellationToken, options) {
                var _this = this;
                _super.call(this, cancellationToken, options);
                this.nativeHost = new NativeLanguageServiceHost(cancellationToken, options);
                if (preprocessToResolve) {
                    var compilerOptions_1 = this.nativeHost.getCompilationSettings();
                    var moduleResolutionHost_1 = {
                        fileExists: function (fileName) { return _this.getScriptInfo(fileName) !== undefined; },
                        readFile: function (fileName) {
                            var scriptInfo = _this.getScriptInfo(fileName);
                            return scriptInfo && scriptInfo.content;
                        }
                    };
                    this.getModuleResolutionsForFile = function (fileName) {
                        var scriptInfo = _this.getScriptInfo(fileName);
                        var preprocessInfo = ts.preProcessFile(scriptInfo.content, /*readImportFiles*/ true);
                        var imports = {};
                        for (var _i = 0, _a = preprocessInfo.importedFiles; _i < _a.length; _i++) {
                            var module_1 = _a[_i];
                            var resolutionInfo = ts.resolveModuleName(module_1.fileName, fileName, compilerOptions_1, moduleResolutionHost_1);
                            if (resolutionInfo.resolvedModule) {
                                imports[module_1.fileName] = resolutionInfo.resolvedModule.resolvedFileName;
                            }
                        }
                        return JSON.stringify(imports);
                    };
                    this.getTypeReferenceDirectiveResolutionsForFile = function (fileName) {
                        var scriptInfo = _this.getScriptInfo(fileName);
                        if (scriptInfo) {
                            var preprocessInfo = ts.preProcessFile(scriptInfo.content, /*readImportFiles*/ false);
                            var resolutions = {};
                            var settings = _this.nativeHost.getCompilationSettings();
                            for (var _i = 0, _a = preprocessInfo.typeReferenceDirectives; _i < _a.length; _i++) {
                                var typeReferenceDirective = _a[_i];
                                var resolutionInfo = ts.resolveTypeReferenceDirective(typeReferenceDirective.fileName, fileName, settings, moduleResolutionHost_1);
                                if (resolutionInfo.resolvedTypeReferenceDirective.resolvedFileName) {
                                    resolutions[typeReferenceDirective.fileName] = resolutionInfo.resolvedTypeReferenceDirective;
                                }
                            }
                            return JSON.stringify(resolutions);
                        }
                        else {
                            return "[]";
                        }
                    };
                }
            }
            ShimLanguageServiceHost.prototype.getFilenames = function () { return this.nativeHost.getFilenames(); };
            ShimLanguageServiceHost.prototype.getScriptInfo = function (fileName) { return this.nativeHost.getScriptInfo(fileName); };
            ShimLanguageServiceHost.prototype.addScript = function (fileName, content, isRootFile) { this.nativeHost.addScript(fileName, content, isRootFile); };
            ShimLanguageServiceHost.prototype.editScript = function (fileName, start, end, newText) { this.nativeHost.editScript(fileName, start, end, newText); };
            ShimLanguageServiceHost.prototype.positionToLineAndCharacter = function (fileName, position) { return this.nativeHost.positionToLineAndCharacter(fileName, position); };
            ShimLanguageServiceHost.prototype.getCompilationSettings = function () { return JSON.stringify(this.nativeHost.getCompilationSettings()); };
            ShimLanguageServiceHost.prototype.getCancellationToken = function () { return this.nativeHost.getCancellationToken(); };
            ShimLanguageServiceHost.prototype.getCurrentDirectory = function () { return this.nativeHost.getCurrentDirectory(); };
            ShimLanguageServiceHost.prototype.getDirectories = function (path) { return JSON.stringify(this.nativeHost.getDirectories(path)); };
            ShimLanguageServiceHost.prototype.getDefaultLibFileName = function () { return this.nativeHost.getDefaultLibFileName(); };
            ShimLanguageServiceHost.prototype.getScriptFileNames = function () { return JSON.stringify(this.nativeHost.getScriptFileNames()); };
            ShimLanguageServiceHost.prototype.getScriptSnapshot = function (fileName) {
                var nativeScriptSnapshot = this.nativeHost.getScriptSnapshot(fileName);
                return nativeScriptSnapshot && new ScriptSnapshotProxy(nativeScriptSnapshot);
            };
            ShimLanguageServiceHost.prototype.getScriptKind = function (fileName) { return this.nativeHost.getScriptKind(fileName); };
            ShimLanguageServiceHost.prototype.getScriptVersion = function (fileName) { return this.nativeHost.getScriptVersion(fileName); };
            ShimLanguageServiceHost.prototype.getLocalizedDiagnosticMessages = function () { return JSON.stringify({}); };
            ShimLanguageServiceHost.prototype.readDirectory = function (rootDir, extension) {
                throw new Error("NYI");
            };
            ShimLanguageServiceHost.prototype.readDirectoryNames = function (path) {
                throw new Error("Not implemented.");
            };
            ShimLanguageServiceHost.prototype.readFileNames = function (path) {
                throw new Error("Not implemented.");
            };
            ShimLanguageServiceHost.prototype.fileExists = function (fileName) { return this.getScriptInfo(fileName) !== undefined; };
            ShimLanguageServiceHost.prototype.readFile = function (fileName) {
                var snapshot = this.nativeHost.getScriptSnapshot(fileName);
                return snapshot && snapshot.getText(0, snapshot.getLength());
            };
            ShimLanguageServiceHost.prototype.log = function (s) { this.nativeHost.log(s); };
            ShimLanguageServiceHost.prototype.trace = function (s) { this.nativeHost.trace(s); };
            ShimLanguageServiceHost.prototype.error = function (s) { this.nativeHost.error(s); };
            ShimLanguageServiceHost.prototype.directoryExists = function (directoryName) {
                // for tests pessimistically assume that directory always exists
                return true;
            };
            return ShimLanguageServiceHost;
        }(LanguageServiceAdapterHost));
        var ClassifierShimProxy = (function () {
            function ClassifierShimProxy(shim) {
                this.shim = shim;
            }
            ClassifierShimProxy.prototype.getEncodedLexicalClassifications = function (text, lexState, classifyKeywordsInGenerics) {
                throw new Error("NYI");
            };
            ClassifierShimProxy.prototype.getClassificationsForLine = function (text, lexState, classifyKeywordsInGenerics) {
                var result = this.shim.getClassificationsForLine(text, lexState, classifyKeywordsInGenerics).split("\n");
                var entries = [];
                var i = 0;
                var position = 0;
                for (; i < result.length - 1; i += 2) {
                    var t = entries[i / 2] = {
                        length: parseInt(result[i]),
                        classification: parseInt(result[i + 1])
                    };
                    assert.isTrue(t.length > 0, "Result length should be greater than 0, got :" + t.length);
                    position += t.length;
                }
                var finalLexState = parseInt(result[result.length - 1]);
                assert.equal(position, text.length, "Expected cumulative length of all entries to match the length of the source. expected: " + text.length + ", but got: " + position);
                return {
                    finalLexState: finalLexState,
                    entries: entries
                };
            };
            return ClassifierShimProxy;
        }());
        function unwrapJSONCallResult(result) {
            var parsedResult = JSON.parse(result);
            if (parsedResult.error) {
                throw new Error("Language Service Shim Error: " + JSON.stringify(parsedResult.error));
            }
            else if (parsedResult.canceled) {
                throw new ts.OperationCanceledException();
            }
            return parsedResult.result;
        }
        var LanguageServiceShimProxy = (function () {
            function LanguageServiceShimProxy(shim) {
                this.shim = shim;
            }
            LanguageServiceShimProxy.prototype.cleanupSemanticCache = function () {
                this.shim.cleanupSemanticCache();
            };
            LanguageServiceShimProxy.prototype.getSyntacticDiagnostics = function (fileName) {
                return unwrapJSONCallResult(this.shim.getSyntacticDiagnostics(fileName));
            };
            LanguageServiceShimProxy.prototype.getSemanticDiagnostics = function (fileName) {
                return unwrapJSONCallResult(this.shim.getSemanticDiagnostics(fileName));
            };
            LanguageServiceShimProxy.prototype.getCompilerOptionsDiagnostics = function () {
                return unwrapJSONCallResult(this.shim.getCompilerOptionsDiagnostics());
            };
            LanguageServiceShimProxy.prototype.getSyntacticClassifications = function (fileName, span) {
                return unwrapJSONCallResult(this.shim.getSyntacticClassifications(fileName, span.start, span.length));
            };
            LanguageServiceShimProxy.prototype.getSemanticClassifications = function (fileName, span) {
                return unwrapJSONCallResult(this.shim.getSemanticClassifications(fileName, span.start, span.length));
            };
            LanguageServiceShimProxy.prototype.getEncodedSyntacticClassifications = function (fileName, span) {
                return unwrapJSONCallResult(this.shim.getEncodedSyntacticClassifications(fileName, span.start, span.length));
            };
            LanguageServiceShimProxy.prototype.getEncodedSemanticClassifications = function (fileName, span) {
                return unwrapJSONCallResult(this.shim.getEncodedSemanticClassifications(fileName, span.start, span.length));
            };
            LanguageServiceShimProxy.prototype.getCompletionsAtPosition = function (fileName, position) {
                return unwrapJSONCallResult(this.shim.getCompletionsAtPosition(fileName, position));
            };
            LanguageServiceShimProxy.prototype.getCompletionEntryDetails = function (fileName, position, entryName) {
                return unwrapJSONCallResult(this.shim.getCompletionEntryDetails(fileName, position, entryName));
            };
            LanguageServiceShimProxy.prototype.getQuickInfoAtPosition = function (fileName, position) {
                return unwrapJSONCallResult(this.shim.getQuickInfoAtPosition(fileName, position));
            };
            LanguageServiceShimProxy.prototype.getNameOrDottedNameSpan = function (fileName, startPos, endPos) {
                return unwrapJSONCallResult(this.shim.getNameOrDottedNameSpan(fileName, startPos, endPos));
            };
            LanguageServiceShimProxy.prototype.getBreakpointStatementAtPosition = function (fileName, position) {
                return unwrapJSONCallResult(this.shim.getBreakpointStatementAtPosition(fileName, position));
            };
            LanguageServiceShimProxy.prototype.getSignatureHelpItems = function (fileName, position) {
                return unwrapJSONCallResult(this.shim.getSignatureHelpItems(fileName, position));
            };
            LanguageServiceShimProxy.prototype.getRenameInfo = function (fileName, position) {
                return unwrapJSONCallResult(this.shim.getRenameInfo(fileName, position));
            };
            LanguageServiceShimProxy.prototype.findRenameLocations = function (fileName, position, findInStrings, findInComments) {
                return unwrapJSONCallResult(this.shim.findRenameLocations(fileName, position, findInStrings, findInComments));
            };
            LanguageServiceShimProxy.prototype.getDefinitionAtPosition = function (fileName, position) {
                return unwrapJSONCallResult(this.shim.getDefinitionAtPosition(fileName, position));
            };
            LanguageServiceShimProxy.prototype.getTypeDefinitionAtPosition = function (fileName, position) {
                return unwrapJSONCallResult(this.shim.getTypeDefinitionAtPosition(fileName, position));
            };
            LanguageServiceShimProxy.prototype.getReferencesAtPosition = function (fileName, position) {
                return unwrapJSONCallResult(this.shim.getReferencesAtPosition(fileName, position));
            };
            LanguageServiceShimProxy.prototype.findReferences = function (fileName, position) {
                return unwrapJSONCallResult(this.shim.findReferences(fileName, position));
            };
            LanguageServiceShimProxy.prototype.getOccurrencesAtPosition = function (fileName, position) {
                return unwrapJSONCallResult(this.shim.getOccurrencesAtPosition(fileName, position));
            };
            LanguageServiceShimProxy.prototype.getDocumentHighlights = function (fileName, position, filesToSearch) {
                return unwrapJSONCallResult(this.shim.getDocumentHighlights(fileName, position, JSON.stringify(filesToSearch)));
            };
            LanguageServiceShimProxy.prototype.getNavigateToItems = function (searchValue) {
                return unwrapJSONCallResult(this.shim.getNavigateToItems(searchValue));
            };
            LanguageServiceShimProxy.prototype.getNavigationBarItems = function (fileName) {
                return unwrapJSONCallResult(this.shim.getNavigationBarItems(fileName));
            };
            LanguageServiceShimProxy.prototype.getOutliningSpans = function (fileName) {
                return unwrapJSONCallResult(this.shim.getOutliningSpans(fileName));
            };
            LanguageServiceShimProxy.prototype.getTodoComments = function (fileName, descriptors) {
                return unwrapJSONCallResult(this.shim.getTodoComments(fileName, JSON.stringify(descriptors)));
            };
            LanguageServiceShimProxy.prototype.getBraceMatchingAtPosition = function (fileName, position) {
                return unwrapJSONCallResult(this.shim.getBraceMatchingAtPosition(fileName, position));
            };
            LanguageServiceShimProxy.prototype.getIndentationAtPosition = function (fileName, position, options) {
                return unwrapJSONCallResult(this.shim.getIndentationAtPosition(fileName, position, JSON.stringify(options)));
            };
            LanguageServiceShimProxy.prototype.getFormattingEditsForRange = function (fileName, start, end, options) {
                return unwrapJSONCallResult(this.shim.getFormattingEditsForRange(fileName, start, end, JSON.stringify(options)));
            };
            LanguageServiceShimProxy.prototype.getFormattingEditsForDocument = function (fileName, options) {
                return unwrapJSONCallResult(this.shim.getFormattingEditsForDocument(fileName, JSON.stringify(options)));
            };
            LanguageServiceShimProxy.prototype.getFormattingEditsAfterKeystroke = function (fileName, position, key, options) {
                return unwrapJSONCallResult(this.shim.getFormattingEditsAfterKeystroke(fileName, position, key, JSON.stringify(options)));
            };
            LanguageServiceShimProxy.prototype.getDocCommentTemplateAtPosition = function (fileName, position) {
                return unwrapJSONCallResult(this.shim.getDocCommentTemplateAtPosition(fileName, position));
            };
            LanguageServiceShimProxy.prototype.isValidBraceCompletionAtPosition = function (fileName, position, openingBrace) {
                return unwrapJSONCallResult(this.shim.isValidBraceCompletionAtPosition(fileName, position, openingBrace));
            };
            LanguageServiceShimProxy.prototype.getEmitOutput = function (fileName) {
                return unwrapJSONCallResult(this.shim.getEmitOutput(fileName));
            };
            LanguageServiceShimProxy.prototype.getProgram = function () {
                throw new Error("Program can not be marshaled across the shim layer.");
            };
            LanguageServiceShimProxy.prototype.getNonBoundSourceFile = function (fileName) {
                throw new Error("SourceFile can not be marshaled across the shim layer.");
            };
            LanguageServiceShimProxy.prototype.dispose = function () { this.shim.dispose({}); };
            return LanguageServiceShimProxy;
        }());
        var ShimLanguageServiceAdapter = (function () {
            function ShimLanguageServiceAdapter(preprocessToResolve, cancellationToken, options) {
                this.host = new ShimLanguageServiceHost(preprocessToResolve, cancellationToken, options);
                this.factory = new TypeScript.Services.TypeScriptServicesFactory();
            }
            ShimLanguageServiceAdapter.prototype.getHost = function () { return this.host; };
            ShimLanguageServiceAdapter.prototype.getLanguageService = function () { return new LanguageServiceShimProxy(this.factory.createLanguageServiceShim(this.host)); };
            ShimLanguageServiceAdapter.prototype.getClassifier = function () { return new ClassifierShimProxy(this.factory.createClassifierShim(this.host)); };
            ShimLanguageServiceAdapter.prototype.getPreProcessedFileInfo = function (fileName, fileContents) {
                var shimResult;
                var coreServicesShim = this.factory.createCoreServicesShim(this.host);
                shimResult = unwrapJSONCallResult(coreServicesShim.getPreProcessedFileInfo(fileName, ts.ScriptSnapshot.fromString(fileContents)));
                var convertResult = {
                    referencedFiles: [],
                    importedFiles: [],
                    ambientExternalModules: [],
                    isLibFile: shimResult.isLibFile,
                    typeReferenceDirectives: []
                };
                ts.forEach(shimResult.referencedFiles, function (refFile) {
                    convertResult.referencedFiles.push({
                        fileName: refFile.path,
                        pos: refFile.position,
                        end: refFile.position + refFile.length
                    });
                });
                ts.forEach(shimResult.importedFiles, function (importedFile) {
                    convertResult.importedFiles.push({
                        fileName: importedFile.path,
                        pos: importedFile.position,
                        end: importedFile.position + importedFile.length
                    });
                });
                ts.forEach(shimResult.typeReferenceDirectives, function (typeRefDirective) {
                    convertResult.importedFiles.push({
                        fileName: typeRefDirective.path,
                        pos: typeRefDirective.position,
                        end: typeRefDirective.position + typeRefDirective.length
                    });
                });
                return convertResult;
            };
            return ShimLanguageServiceAdapter;
        }());
        LanguageService.ShimLanguageServiceAdapter = ShimLanguageServiceAdapter;
        // Server adapter
        var SessionClientHost = (function (_super) {
            __extends(SessionClientHost, _super);
            function SessionClientHost(cancellationToken, settings) {
                _super.call(this, cancellationToken, settings);
            }
            SessionClientHost.prototype.onMessage = function (message) {
            };
            SessionClientHost.prototype.writeMessage = function (message) {
            };
            SessionClientHost.prototype.setClient = function (client) {
                this.client = client;
            };
            SessionClientHost.prototype.openFile = function (fileName, content, scriptKindName) {
                _super.prototype.openFile.call(this, fileName, content, scriptKindName);
                this.client.openFile(fileName, content, scriptKindName);
            };
            SessionClientHost.prototype.editScript = function (fileName, start, end, newText) {
                _super.prototype.editScript.call(this, fileName, start, end, newText);
                this.client.changeFile(fileName, start, end, newText);
            };
            return SessionClientHost;
        }(NativeLanguageServiceHost));
        var SessionServerHost = (function () {
            function SessionServerHost(host) {
                this.host = host;
                this.args = [];
                this.useCaseSensitiveFileNames = false;
                this.newLine = this.host.getNewLine();
            }
            SessionServerHost.prototype.onMessage = function (message) {
            };
            SessionServerHost.prototype.writeMessage = function (message) {
            };
            SessionServerHost.prototype.write = function (message) {
                this.writeMessage(message);
            };
            SessionServerHost.prototype.readFile = function (fileName) {
                if (fileName.indexOf(Harness.Compiler.defaultLibFileName) >= 0) {
                    fileName = Harness.Compiler.defaultLibFileName;
                }
                var snapshot = this.host.getScriptSnapshot(fileName);
                return snapshot && snapshot.getText(0, snapshot.getLength());
            };
            SessionServerHost.prototype.writeFile = function (name, text, writeByteOrderMark) {
            };
            SessionServerHost.prototype.resolvePath = function (path) {
                return path;
            };
            SessionServerHost.prototype.fileExists = function (path) {
                return !!this.host.getScriptSnapshot(path);
            };
            SessionServerHost.prototype.directoryExists = function (path) {
                // for tests assume that directory exists
                return true;
            };
            SessionServerHost.prototype.getExecutingFilePath = function () {
                return "";
            };
            SessionServerHost.prototype.exit = function (exitCode) {
            };
            SessionServerHost.prototype.createDirectory = function (directoryName) {
                throw new Error("Not Implemented Yet.");
            };
            SessionServerHost.prototype.getCurrentDirectory = function () {
                return this.host.getCurrentDirectory();
            };
            SessionServerHost.prototype.getDirectories = function (path) {
                return [];
            };
            SessionServerHost.prototype.readDirectory = function (path, extension, exclude, include) {
                throw new Error("Not implemented Yet.");
            };
            SessionServerHost.prototype.watchFile = function (fileName, callback) {
                return { close: function () { } };
            };
            SessionServerHost.prototype.watchDirectory = function (path, callback, recursive) {
                return { close: function () { } };
            };
            SessionServerHost.prototype.close = function () {
            };
            SessionServerHost.prototype.info = function (message) {
                return this.host.log(message);
            };
            SessionServerHost.prototype.msg = function (message) {
                return this.host.log(message);
            };
            SessionServerHost.prototype.loggingEnabled = function () {
                return true;
            };
            SessionServerHost.prototype.isVerbose = function () {
                return false;
            };
            SessionServerHost.prototype.endGroup = function () {
            };
            SessionServerHost.prototype.perftrc = function (message) {
                return this.host.log(message);
            };
            SessionServerHost.prototype.startGroup = function () {
            };
            SessionServerHost.prototype.setTimeout = function (callback, ms) {
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
                return setTimeout(callback, ms, args);
            };
            SessionServerHost.prototype.clearTimeout = function (timeoutId) {
                clearTimeout(timeoutId);
            };
            return SessionServerHost;
        }());
        var ServerLanguageServiceAdapter = (function () {
            function ServerLanguageServiceAdapter(cancellationToken, options) {
                // This is the main host that tests use to direct tests
                var clientHost = new SessionClientHost(cancellationToken, options);
                var client = new ts.server.SessionClient(clientHost);
                // This host is just a proxy for the clientHost, it uses the client
                // host to answer server queries about files on disk
                var serverHost = new SessionServerHost(clientHost);
                var server = new ts.server.Session(serverHost, Buffer ? Buffer.byteLength : function (string, encoding) { return string.length; }, process.hrtime, serverHost);
                // Fake the connection between the client and the server
                serverHost.writeMessage = client.onMessage.bind(client);
                clientHost.writeMessage = server.onMessage.bind(server);
                // Wire the client to the host to get notifications when a file is open
                // or edited.
                clientHost.setClient(client);
                // Set the properties
                this.client = client;
                this.host = clientHost;
            }
            ServerLanguageServiceAdapter.prototype.getHost = function () { return this.host; };
            ServerLanguageServiceAdapter.prototype.getLanguageService = function () { return this.client; };
            ServerLanguageServiceAdapter.prototype.getClassifier = function () { throw new Error("getClassifier is not available using the server interface."); };
            ServerLanguageServiceAdapter.prototype.getPreProcessedFileInfo = function (fileName, fileContents) { throw new Error("getPreProcessedFileInfo is not available using the server interface."); };
            return ServerLanguageServiceAdapter;
        }());
        LanguageService.ServerLanguageServiceAdapter = ServerLanguageServiceAdapter;
    })(LanguageService = Harness.LanguageService || (Harness.LanguageService = {}));
})(Harness || (Harness = {}));
//# sourceMappingURL=harnessLanguageService.js.map