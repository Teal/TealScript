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
/// <reference path="..\services\services.ts" />
/// <reference path="..\services\shims.ts" />
/// <reference path="harnessLanguageService.ts" />
/// <reference path="harness.ts" />
/// <reference path="fourslashRunner.ts" />
var FourSlash;
(function (FourSlash) {
    ts.disableIncrementalParsing = false;
    FourSlash.IndentStyle = ts.IndentStyle;
    var entityMap = {
        "&": "&amp;",
        "\"": "&quot;",
        "'": "&#39;",
        "/": "&#47;",
        "<": "&lt;",
        ">": "&gt;"
    };
    function escapeXmlAttributeValue(s) {
        return s.replace(/[&<>"'\/]/g, function (ch) { return entityMap[ch]; });
    }
    FourSlash.escapeXmlAttributeValue = escapeXmlAttributeValue;
    // Name of testcase metadata including ts.CompilerOptions properties that will be used by globalOptions
    // To add additional option, add property into the testOptMetadataNames, refer the property in either globalMetadataNames or fileMetadataNames
    // Add cases into convertGlobalOptionsToCompilationsSettings function for the compiler to acknowledge such option from meta data
    var metadataOptionNames = {
        baselineFile: "BaselineFile",
        emitThisFile: "emitThisFile",
        fileName: "Filename",
        resolveReference: "ResolveReference",
    };
    // List of allowed metadata names
    var fileMetadataNames = [metadataOptionNames.fileName, metadataOptionNames.emitThisFile, metadataOptionNames.resolveReference];
    function convertGlobalOptionsToCompilerOptions(globalOptions) {
        var settings = { target: 1 /* ES5 */ };
        Harness.Compiler.setCompilerOptionsFromHarnessSetting(globalOptions, settings);
        return settings;
    }
    var TestCancellationToken = (function () {
        function TestCancellationToken() {
            this.numberOfCallsBeforeCancellation = TestCancellationToken.NotCanceled;
        }
        TestCancellationToken.prototype.isCancellationRequested = function () {
            if (this.numberOfCallsBeforeCancellation < 0) {
                return false;
            }
            if (this.numberOfCallsBeforeCancellation > 0) {
                this.numberOfCallsBeforeCancellation--;
                return false;
            }
            return true;
        };
        TestCancellationToken.prototype.setCancelled = function (numberOfCalls) {
            if (numberOfCalls === void 0) { numberOfCalls = 0; }
            ts.Debug.assert(numberOfCalls >= 0);
            this.numberOfCallsBeforeCancellation = numberOfCalls;
        };
        TestCancellationToken.prototype.resetCancelled = function () {
            this.numberOfCallsBeforeCancellation = TestCancellationToken.NotCanceled;
        };
        // 0 - cancelled
        // >0 - not cancelled
        // <0 - not cancelled and value denotes number of isCancellationRequested after which token become cancelled
        TestCancellationToken.NotCanceled = -1;
        return TestCancellationToken;
    }());
    FourSlash.TestCancellationToken = TestCancellationToken;
    function verifyOperationIsCancelled(f) {
        try {
            f();
        }
        catch (e) {
            if (e instanceof ts.OperationCanceledException) {
                return;
            }
        }
        throw new Error("Operation should be cancelled");
    }
    FourSlash.verifyOperationIsCancelled = verifyOperationIsCancelled;
    // This function creates IScriptSnapshot object for testing getPreProcessedFileInfo
    // Return object may lack some functionalities for other purposes.
    function createScriptSnapShot(sourceText) {
        return {
            getText: function (start, end) {
                return sourceText.substr(start, end - start);
            },
            getLength: function () {
                return sourceText.length;
            },
            getChangeRange: function (oldSnapshot) {
                return undefined;
            }
        };
    }
    var TestState = (function () {
        function TestState(basePath, testType, testData) {
            var _this = this;
            this.basePath = basePath;
            this.testType = testType;
            this.testData = testData;
            // The current caret position in the active file
            this.currentCaretPosition = 0;
            this.lastKnownMarker = "";
            // Whether or not we should format on keystrokes
            this.enableFormatting = true;
            this.inputFiles = {}; // Map between inputFile's fileName and its content for easily looking up when resolving references
            this.alignmentForExtraInfo = 50;
            // Create a new Services Adapter
            this.cancellationToken = new TestCancellationToken();
            var compilationOptions = convertGlobalOptionsToCompilerOptions(this.testData.globalOptions);
            if (compilationOptions.typeRoots) {
                compilationOptions.typeRoots = compilationOptions.typeRoots.map(function (p) { return ts.getNormalizedAbsolutePath(p, _this.basePath); });
            }
            var languageServiceAdapter = this.getLanguageServiceAdapter(testType, this.cancellationToken, compilationOptions);
            this.languageServiceAdapterHost = languageServiceAdapter.getHost();
            this.languageService = languageServiceAdapter.getLanguageService();
            // Initialize the language service with all the scripts
            var startResolveFileRef;
            ts.forEach(testData.files, function (file) {
                // Create map between fileName and its content for easily looking up when resolveReference flag is specified
                _this.inputFiles[file.fileName] = file.content;
                if (!startResolveFileRef && file.fileOptions[metadataOptionNames.resolveReference] === "true") {
                    startResolveFileRef = file;
                }
                else if (startResolveFileRef) {
                    // If entry point for resolving file references is already specified, report duplication error
                    throw new Error("There exists a Fourslash file which has resolveReference flag specified; remove duplicated resolveReference flag");
                }
            });
            if (startResolveFileRef) {
                // Add the entry-point file itself into the languageServiceShimHost
                this.languageServiceAdapterHost.addScript(startResolveFileRef.fileName, startResolveFileRef.content, /*isRootFile*/ true);
                var resolvedResult = languageServiceAdapter.getPreProcessedFileInfo(startResolveFileRef.fileName, startResolveFileRef.content);
                var referencedFiles = resolvedResult.referencedFiles;
                var importedFiles = resolvedResult.importedFiles;
                // Add triple reference files into language-service host
                ts.forEach(referencedFiles, function (referenceFile) {
                    // Fourslash insert tests/cases/fourslash into inputFile.unitName so we will properly append the same base directory to refFile path
                    var referenceFilePath = _this.basePath + "/" + referenceFile.fileName;
                    _this.addMatchedInputFile(referenceFilePath, /* extensions */ undefined);
                });
                // Add import files into language-service host
                ts.forEach(importedFiles, function (importedFile) {
                    // Fourslash insert tests/cases/fourslash into inputFile.unitName and import statement doesn't require ".ts"
                    // so convert them before making appropriate comparison
                    var importedFilePath = _this.basePath + "/" + importedFile.fileName;
                    _this.addMatchedInputFile(importedFilePath, ts.getSupportedExtensions(compilationOptions));
                });
                // Check if no-default-lib flag is false and if so add default library
                if (!resolvedResult.isLibFile) {
                    this.languageServiceAdapterHost.addScript(Harness.Compiler.defaultLibFileName, Harness.Compiler.getDefaultLibrarySourceFile().text, /*isRootFile*/ false);
                }
            }
            else {
                // resolveReference file-option is not specified then do not resolve any files and include all inputFiles
                ts.forEachKey(this.inputFiles, function (fileName) {
                    if (!Harness.isDefaultLibraryFile(fileName)) {
                        _this.languageServiceAdapterHost.addScript(fileName, _this.inputFiles[fileName], /*isRootFile*/ true);
                    }
                });
                this.languageServiceAdapterHost.addScript(Harness.Compiler.defaultLibFileName, Harness.Compiler.getDefaultLibrarySourceFile().text, /*isRootFile*/ false);
            }
            this.formatCodeOptions = {
                BaseIndentSize: 0,
                IndentSize: 4,
                TabSize: 4,
                NewLineCharacter: Harness.IO.newLine(),
                ConvertTabsToSpaces: true,
                IndentStyle: ts.IndentStyle.Smart,
                InsertSpaceAfterCommaDelimiter: true,
                InsertSpaceAfterSemicolonInForStatements: true,
                InsertSpaceBeforeAndAfterBinaryOperators: true,
                InsertSpaceAfterKeywordsInControlFlowStatements: true,
                InsertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
                InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
                InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
                InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
                InsertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: false,
                PlaceOpenBraceOnNewLineForFunctions: false,
                PlaceOpenBraceOnNewLineForControlBlocks: false,
            };
            // Open the first file by default
            this.openFile(0);
        }
        // Add input file which has matched file name with the given reference-file path.
        // This is necessary when resolveReference flag is specified
        TestState.prototype.addMatchedInputFile = function (referenceFilePath, extensions) {
            var inputFiles = this.inputFiles;
            var languageServiceAdapterHost = this.languageServiceAdapterHost;
            if (!extensions) {
                tryAdd(referenceFilePath);
            }
            else {
                tryAdd(referenceFilePath) || ts.forEach(extensions, function (ext) { return tryAdd(referenceFilePath + ext); });
            }
            function tryAdd(path) {
                var inputFile = inputFiles[path];
                if (inputFile && !Harness.isDefaultLibraryFile(path)) {
                    languageServiceAdapterHost.addScript(path, inputFile, /*isRootFile*/ true);
                    return true;
                }
            }
        };
        TestState.prototype.getLanguageServiceAdapter = function (testType, cancellationToken, compilationOptions) {
            switch (testType) {
                case 0 /* Native */:
                    return new Harness.LanguageService.NativeLanguageServiceAdapter(cancellationToken, compilationOptions);
                case 1 /* Shims */:
                    return new Harness.LanguageService.ShimLanguageServiceAdapter(/*preprocessToResolve*/ false, cancellationToken, compilationOptions);
                case 2 /* ShimsWithPreprocess */:
                    return new Harness.LanguageService.ShimLanguageServiceAdapter(/*preprocessToResolve*/ true, cancellationToken, compilationOptions);
                case 3 /* Server */:
                    return new Harness.LanguageService.ServerLanguageServiceAdapter(cancellationToken, compilationOptions);
                default:
                    throw new Error("Unknown FourSlash test type: ");
            }
        };
        TestState.prototype.getFileContent = function (fileName) {
            var script = this.languageServiceAdapterHost.getScriptInfo(fileName);
            return script.content;
        };
        // Entry points from fourslash.ts
        TestState.prototype.goToMarker = function (name) {
            if (name === void 0) { name = ""; }
            var marker = this.getMarkerByName(name);
            if (this.activeFile.fileName !== marker.fileName) {
                this.openFile(marker.fileName);
            }
            var content = this.getFileContent(marker.fileName);
            if (marker.position === -1 || marker.position > content.length) {
                throw new Error("Marker \"" + name + "\" has been invalidated by unrecoverable edits to the file.");
            }
            this.lastKnownMarker = name;
            this.goToPosition(marker.position);
        };
        TestState.prototype.goToPosition = function (pos) {
            this.currentCaretPosition = pos;
        };
        TestState.prototype.moveCaretRight = function (count) {
            if (count === void 0) { count = 1; }
            this.currentCaretPosition += count;
            this.currentCaretPosition = Math.min(this.currentCaretPosition, this.getFileContent(this.activeFile.fileName).length);
        };
        TestState.prototype.openFile = function (indexOrName, content, scriptKindName) {
            var fileToOpen = this.findFile(indexOrName);
            fileToOpen.fileName = ts.normalizeSlashes(fileToOpen.fileName);
            this.activeFile = fileToOpen;
            // Let the host know that this file is now open
            this.languageServiceAdapterHost.openFile(fileToOpen.fileName, content, scriptKindName);
        };
        TestState.prototype.verifyErrorExistsBetweenMarkers = function (startMarkerName, endMarkerName, negative) {
            var startMarker = this.getMarkerByName(startMarkerName);
            var endMarker = this.getMarkerByName(endMarkerName);
            var predicate = function (errorMinChar, errorLimChar, startPos, endPos) {
                return ((errorMinChar === startPos) && (errorLimChar === endPos)) ? true : false;
            };
            var exists = this.anyErrorInRange(predicate, startMarker, endMarker);
            if (exists !== negative) {
                this.printErrorLog(negative, this.getAllDiagnostics());
                throw new Error("Failure between markers: " + startMarkerName + ", " + endMarkerName);
            }
        };
        TestState.prototype.raiseError = function (message) {
            message = this.messageAtLastKnownMarker(message);
            throw new Error(message);
        };
        TestState.prototype.messageAtLastKnownMarker = function (message) {
            return "Marker: " + this.lastKnownMarker + "\n" + message;
        };
        TestState.prototype.assertionMessageAtLastKnownMarker = function (msg) {
            return "\nMarker: " + this.lastKnownMarker + "\nChecking: " + msg + "\n\n";
        };
        TestState.prototype.getDiagnostics = function (fileName) {
            var syntacticErrors = this.languageService.getSyntacticDiagnostics(fileName);
            var semanticErrors = this.languageService.getSemanticDiagnostics(fileName);
            var diagnostics = [];
            diagnostics.push.apply(diagnostics, syntacticErrors);
            diagnostics.push.apply(diagnostics, semanticErrors);
            return diagnostics;
        };
        TestState.prototype.getAllDiagnostics = function () {
            var diagnostics = [];
            var fileNames = this.languageServiceAdapterHost.getFilenames();
            for (var i = 0, n = fileNames.length; i < n; i++) {
                diagnostics.push.apply(this.getDiagnostics(fileNames[i]));
            }
            return diagnostics;
        };
        TestState.prototype.verifyErrorExistsAfterMarker = function (markerName, negative, after) {
            var marker = this.getMarkerByName(markerName);
            var predicate;
            if (after) {
                predicate = function (errorMinChar, errorLimChar, startPos, endPos) {
                    return ((errorMinChar >= startPos) && (errorLimChar >= startPos)) ? true : false;
                };
            }
            else {
                predicate = function (errorMinChar, errorLimChar, startPos, endPos) {
                    return ((errorMinChar <= startPos) && (errorLimChar <= startPos)) ? true : false;
                };
            }
            var exists = this.anyErrorInRange(predicate, marker);
            var diagnostics = this.getAllDiagnostics();
            if (exists !== negative) {
                this.printErrorLog(negative, diagnostics);
                throw new Error("Failure at marker: " + markerName);
            }
        };
        TestState.prototype.anyErrorInRange = function (predicate, startMarker, endMarker) {
            var errors = this.getDiagnostics(startMarker.fileName);
            var exists = false;
            var startPos = startMarker.position;
            var endPos = undefined;
            if (endMarker !== undefined) {
                endPos = endMarker.position;
            }
            errors.forEach(function (error) {
                if (predicate(error.start, error.start + error.length, startPos, endPos)) {
                    exists = true;
                }
            });
            return exists;
        };
        TestState.prototype.printErrorLog = function (expectErrors, errors) {
            if (expectErrors) {
                Harness.IO.log("Expected error not found.  Error list is:");
            }
            else {
                Harness.IO.log("Unexpected error(s) found.  Error list is:");
            }
            errors.forEach(function (error) {
                Harness.IO.log("  minChar: " + error.start +
                    ", limChar: " + (error.start + error.length) +
                    ", message: " + ts.flattenDiagnosticMessageText(error.messageText, Harness.IO.newLine()) + "\n");
            });
        };
        TestState.prototype.verifyNumberOfErrorsInCurrentFile = function (expected) {
            var errors = this.getDiagnostics(this.activeFile.fileName);
            var actual = errors.length;
            if (actual !== expected) {
                this.printErrorLog(/*expectErrors*/ false, errors);
                var errorMsg = "Actual number of errors (" + actual + ") does not match expected number (" + expected + ")";
                Harness.IO.log(errorMsg);
                this.raiseError(errorMsg);
            }
        };
        TestState.prototype.verifyEval = function (expr, value) {
            var emit = this.languageService.getEmitOutput(this.activeFile.fileName);
            if (emit.outputFiles.length !== 1) {
                throw new Error("Expected exactly one output from emit of " + this.activeFile.fileName);
            }
            var evaluation = new Function(emit.outputFiles[0].text + ";\r\nreturn (" + expr + ");")();
            if (evaluation !== value) {
                this.raiseError("Expected evaluation of expression \"" + expr + "\" to equal \"" + value + "\", but got \"" + evaluation + "\"");
            }
        };
        TestState.prototype.verifyGetEmitOutputForCurrentFile = function (expected) {
            var emit = this.languageService.getEmitOutput(this.activeFile.fileName);
            if (emit.outputFiles.length !== 1) {
                throw new Error("Expected exactly one output from emit of " + this.activeFile.fileName);
            }
            var actual = emit.outputFiles[0].text;
            if (actual !== expected) {
                this.raiseError("Expected emit output to be \"" + expected + "\", but got \"" + actual + "\"");
            }
        };
        TestState.prototype.verifyGetEmitOutputContentsForCurrentFile = function (expected) {
            var emit = this.languageService.getEmitOutput(this.activeFile.fileName);
            assert.equal(emit.outputFiles.length, expected.length, "Number of emit output files");
            for (var i = 0; i < emit.outputFiles.length; i++) {
                assert.equal(emit.outputFiles[i].name, expected[i].name, "FileName");
                assert.equal(emit.outputFiles[i].text, expected[i].text, "Content");
            }
        };
        TestState.prototype.verifyMemberListContains = function (symbol, text, documentation, kind) {
            var members = this.getMemberListAtCaret();
            if (members) {
                this.assertItemInCompletionList(members.entries, symbol, text, documentation, kind);
            }
            else {
                this.raiseError("Expected a member list, but none was provided");
            }
        };
        TestState.prototype.verifyMemberListCount = function (expectedCount, negative) {
            if (expectedCount === 0 && negative) {
                this.verifyMemberListIsEmpty(/*negative*/ false);
                return;
            }
            var members = this.getMemberListAtCaret();
            if (members) {
                var match = members.entries.length === expectedCount;
                if ((!match && !negative) || (match && negative)) {
                    this.raiseError("Member list count was " + members.entries.length + ". Expected " + expectedCount);
                }
            }
            else if (expectedCount) {
                this.raiseError("Member list count was 0. Expected " + expectedCount);
            }
        };
        TestState.prototype.verifyMemberListDoesNotContain = function (symbol) {
            var members = this.getMemberListAtCaret();
            if (members && members.entries.filter(function (e) { return e.name === symbol; }).length !== 0) {
                this.raiseError("Member list did contain " + symbol);
            }
        };
        TestState.prototype.verifyCompletionListItemsCountIsGreaterThan = function (count, negative) {
            var completions = this.getCompletionListAtCaret();
            var itemsCount = completions.entries.length;
            if (negative) {
                if (itemsCount > count) {
                    this.raiseError("Expected completion list items count to not be greater than " + count + ", but is actually " + itemsCount);
                }
            }
            else {
                if (itemsCount <= count) {
                    this.raiseError("Expected completion list items count to be greater than " + count + ", but is actually " + itemsCount);
                }
            }
        };
        TestState.prototype.verifyCompletionListStartsWithItemsInOrder = function (items) {
            if (items.length === 0) {
                return;
            }
            var entries = this.getCompletionListAtCaret().entries;
            assert.isTrue(items.length <= entries.length, "Amount of expected items in completion list [ " + items.length + " ] is greater than actual number of items in list [ " + entries.length + " ]");
            for (var i = 0; i < items.length; i++) {
                assert.equal(entries[i].name, items[i], "Unexpected item in completion list");
            }
        };
        TestState.prototype.noItemsWithSameNameButDifferentKind = function () {
            var completions = this.getCompletionListAtCaret();
            var uniqueItems = {};
            for (var _i = 0, _a = completions.entries; _i < _a.length; _i++) {
                var item = _a[_i];
                if (!ts.hasProperty(uniqueItems, item.name)) {
                    uniqueItems[item.name] = item.kind;
                }
                else {
                    assert.equal(item.kind, uniqueItems[item.name], "Items should have the same kind, got " + item.kind + " and " + uniqueItems[item.name]);
                }
            }
        };
        TestState.prototype.verifyMemberListIsEmpty = function (negative) {
            var members = this.getMemberListAtCaret();
            if ((!members || members.entries.length === 0) && negative) {
                this.raiseError("Member list is empty at Caret");
            }
            else if ((members && members.entries.length !== 0) && !negative) {
                var errorMsg = "\n" + "Member List contains: [" + members.entries[0].name;
                for (var i = 1; i < members.entries.length; i++) {
                    errorMsg += ", " + members.entries[i].name;
                }
                errorMsg += "]\n";
                this.raiseError("Member list is not empty at Caret: " + errorMsg);
            }
        };
        TestState.prototype.verifyCompletionListIsEmpty = function (negative) {
            var completions = this.getCompletionListAtCaret();
            if ((!completions || completions.entries.length === 0) && negative) {
                this.raiseError("Completion list is empty at caret at position " + this.activeFile.fileName + " " + this.currentCaretPosition);
            }
            else if (completions && completions.entries.length !== 0 && !negative) {
                var errorMsg = "\n" + "Completion List contains: [" + completions.entries[0].name;
                for (var i = 1; i < completions.entries.length; i++) {
                    errorMsg += ", " + completions.entries[i].name;
                }
                errorMsg += "]\n";
                this.raiseError("Completion list is not empty at caret at position " + this.activeFile.fileName + " " + this.currentCaretPosition + errorMsg);
            }
        };
        TestState.prototype.verifyCompletionListAllowsNewIdentifier = function (negative) {
            var completions = this.getCompletionListAtCaret();
            if ((completions && !completions.isNewIdentifierLocation) && !negative) {
                this.raiseError("Expected builder completion entry");
            }
            else if ((completions && completions.isNewIdentifierLocation) && negative) {
                this.raiseError("Un-expected builder completion entry");
            }
        };
        TestState.prototype.verifyCompletionListContains = function (symbol, text, documentation, kind) {
            var completions = this.getCompletionListAtCaret();
            if (completions) {
                this.assertItemInCompletionList(completions.entries, symbol, text, documentation, kind);
            }
            else {
                this.raiseError("No completions at position '" + this.currentCaretPosition + "' when looking for '" + symbol + "'.");
            }
        };
        /**
         * Verify that the completion list does NOT contain the given symbol.
         * The symbol is considered matched with the symbol in the list if and only if all given parameters must matched.
         * When any parameter is omitted, the parameter is ignored during comparison and assumed that the parameter with
         * that property of the symbol in the list.
         * @param symbol the name of symbol
         * @param expectedText the text associated with the symbol
         * @param expectedDocumentation the documentation text associated with the symbol
         * @param expectedKind the kind of symbol (see ScriptElementKind)
         */
        TestState.prototype.verifyCompletionListDoesNotContain = function (symbol, expectedText, expectedDocumentation, expectedKind) {
            var that = this;
            function filterByTextOrDocumentation(entry) {
                var details = that.getCompletionEntryDetails(entry.name);
                var documentation = ts.displayPartsToString(details.documentation);
                var text = ts.displayPartsToString(details.displayParts);
                if (expectedText && expectedDocumentation) {
                    return (documentation === expectedDocumentation && text === expectedText) ? true : false;
                }
                else if (expectedText && !expectedDocumentation) {
                    return text === expectedText ? true : false;
                }
                else if (expectedDocumentation && !expectedText) {
                    return documentation === expectedDocumentation ? true : false;
                }
                // Because expectedText and expectedDocumentation are undefined, we assume that
                // users don"t care to compare them so we will treat that entry as if the entry has matching text and documentation
                // and keep it in the list of filtered entry.
                return true;
            }
            var completions = this.getCompletionListAtCaret();
            if (completions) {
                var filterCompletions = completions.entries.filter(function (e) { return e.name === symbol; });
                filterCompletions = expectedKind ? filterCompletions.filter(function (e) { return e.kind === expectedKind; }) : filterCompletions;
                filterCompletions = filterCompletions.filter(filterByTextOrDocumentation);
                if (filterCompletions.length !== 0) {
                    // After filtered using all present criterion, if there are still symbol left in the list
                    // then these symbols must meet the criterion for Not supposed to be in the list. So we
                    // raise an error
                    var error = "Completion list did contain \'" + symbol + "\'.";
                    var details = this.getCompletionEntryDetails(filterCompletions[0].name);
                    if (expectedText) {
                        error += "Expected text: " + expectedText + " to equal: " + ts.displayPartsToString(details.displayParts) + ".";
                    }
                    if (expectedDocumentation) {
                        error += "Expected documentation: " + expectedDocumentation + " to equal: " + ts.displayPartsToString(details.documentation) + ".";
                    }
                    if (expectedKind) {
                        error += "Expected kind: " + expectedKind + " to equal: " + filterCompletions[0].kind + ".";
                    }
                    this.raiseError(error);
                }
            }
        };
        TestState.prototype.verifyCompletionEntryDetails = function (entryName, expectedText, expectedDocumentation, kind) {
            var details = this.getCompletionEntryDetails(entryName);
            assert(details, "no completion entry available");
            assert.equal(ts.displayPartsToString(details.displayParts), expectedText, this.assertionMessageAtLastKnownMarker("completion entry details text"));
            if (expectedDocumentation !== undefined) {
                assert.equal(ts.displayPartsToString(details.documentation), expectedDocumentation, this.assertionMessageAtLastKnownMarker("completion entry documentation"));
            }
            if (kind !== undefined) {
                assert.equal(details.kind, kind, this.assertionMessageAtLastKnownMarker("completion entry kind"));
            }
        };
        TestState.prototype.verifyReferencesAre = function (expectedReferences) {
            var actualReferences = this.getReferencesAtCaret() || [];
            if (actualReferences.length > expectedReferences.length) {
                // Find the unaccounted-for reference.
                var _loop_1 = function(actual) {
                    if (!ts.forEach(expectedReferences, function (r) { return r.start === actual.textSpan.start; })) {
                        this_1.raiseError("A reference " + stringify(actual) + " is unaccounted for.");
                    }
                };
                var this_1 = this;
                for (var _i = 0, actualReferences_1 = actualReferences; _i < actualReferences_1.length; _i++) {
                    var actual = actualReferences_1[_i];
                    _loop_1(actual);
                }
                // Probably will never reach here.
                this.raiseError("There are " + actualReferences.length + " references but only " + expectedReferences.length + " were expected.");
            }
            for (var _a = 0, expectedReferences_1 = expectedReferences; _a < expectedReferences_1.length; _a++) {
                var reference = expectedReferences_1[_a];
                var fileName = reference.fileName, start = reference.start, end = reference.end;
                if (reference.marker && reference.marker.data) {
                    var _b = reference.marker.data, isWriteAccess = _b.isWriteAccess, isDefinition = _b.isDefinition;
                    this.verifyReferencesWorker(actualReferences, fileName, start, end, isWriteAccess, isDefinition);
                }
                else {
                    this.verifyReferencesWorker(actualReferences, fileName, start, end);
                }
            }
        };
        TestState.prototype.verifyReferencesOf = function (_a, references) {
            var fileName = _a.fileName, start = _a.start;
            this.openFile(fileName);
            this.goToPosition(start);
            this.verifyReferencesAre(references);
        };
        TestState.prototype.verifyRangesReferenceEachOther = function (ranges) {
            ranges = ranges || this.getRanges();
            assert(ranges.length);
            for (var _i = 0, ranges_1 = ranges; _i < ranges_1.length; _i++) {
                var range = ranges_1[_i];
                this.verifyReferencesOf(range, ranges);
            }
        };
        TestState.prototype.verifyRangesWithSameTextReferenceEachOther = function () {
            var _this = this;
            ts.forEachValue(this.rangesByText(), function (ranges) { return _this.verifyRangesReferenceEachOther(ranges); });
        };
        TestState.prototype.verifyReferencesWorker = function (references, fileName, start, end, isWriteAccess, isDefinition) {
            for (var i = 0; i < references.length; i++) {
                var reference = references[i];
                if (reference && reference.fileName === fileName && reference.textSpan.start === start && ts.textSpanEnd(reference.textSpan) === end) {
                    if (typeof isWriteAccess !== "undefined" && reference.isWriteAccess !== isWriteAccess) {
                        this.raiseError("verifyReferencesAtPositionListContains failed - item isWriteAccess value does not match, actual: " + reference.isWriteAccess + ", expected: " + isWriteAccess + ".");
                    }
                    if (typeof isDefinition !== "undefined" && reference.isDefinition !== isDefinition) {
                        this.raiseError("verifyReferencesAtPositionListContains failed - item isDefinition value does not match, actual: " + reference.isDefinition + ", expected: " + isDefinition + ".");
                    }
                    return;
                }
            }
            var missingItem = { fileName: fileName, start: start, end: end, isWriteAccess: isWriteAccess, isDefinition: isDefinition };
            this.raiseError("verifyReferencesAtPositionListContains failed - could not find the item: " + stringify(missingItem) + " in the returned list: (" + stringify(references) + ")");
        };
        TestState.prototype.getMemberListAtCaret = function () {
            return this.languageService.getCompletionsAtPosition(this.activeFile.fileName, this.currentCaretPosition);
        };
        TestState.prototype.getCompletionListAtCaret = function () {
            return this.languageService.getCompletionsAtPosition(this.activeFile.fileName, this.currentCaretPosition);
        };
        TestState.prototype.getCompletionEntryDetails = function (entryName) {
            return this.languageService.getCompletionEntryDetails(this.activeFile.fileName, this.currentCaretPosition, entryName);
        };
        TestState.prototype.getReferencesAtCaret = function () {
            return this.languageService.getReferencesAtPosition(this.activeFile.fileName, this.currentCaretPosition);
        };
        TestState.prototype.getSyntacticDiagnostics = function (expected) {
            var diagnostics = this.languageService.getSyntacticDiagnostics(this.activeFile.fileName);
            this.testDiagnostics(expected, diagnostics);
        };
        TestState.prototype.getSemanticDiagnostics = function (expected) {
            var diagnostics = this.languageService.getSemanticDiagnostics(this.activeFile.fileName);
            this.testDiagnostics(expected, diagnostics);
        };
        TestState.prototype.testDiagnostics = function (expected, diagnostics) {
            var realized = ts.realizeDiagnostics(diagnostics, "\r\n");
            var actual = stringify(realized);
            assert.equal(actual, expected);
        };
        TestState.prototype.verifyQuickInfoString = function (negative, expectedText, expectedDocumentation) {
            var actualQuickInfo = this.languageService.getQuickInfoAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            var actualQuickInfoText = actualQuickInfo ? ts.displayPartsToString(actualQuickInfo.displayParts) : "";
            var actualQuickInfoDocumentation = actualQuickInfo ? ts.displayPartsToString(actualQuickInfo.documentation) : "";
            if (negative) {
                if (expectedText !== undefined) {
                    assert.notEqual(actualQuickInfoText, expectedText, this.messageAtLastKnownMarker("quick info text"));
                }
                // TODO: should be '==='?
                if (expectedDocumentation != undefined) {
                    assert.notEqual(actualQuickInfoDocumentation, expectedDocumentation, this.messageAtLastKnownMarker("quick info doc comment"));
                }
            }
            else {
                if (expectedText !== undefined) {
                    assert.equal(actualQuickInfoText, expectedText, this.messageAtLastKnownMarker("quick info text"));
                }
                // TODO: should be '==='?
                if (expectedDocumentation != undefined) {
                    assert.equal(actualQuickInfoDocumentation, expectedDocumentation, this.assertionMessageAtLastKnownMarker("quick info doc"));
                }
            }
        };
        TestState.prototype.verifyQuickInfoDisplayParts = function (kind, kindModifiers, textSpan, displayParts, documentation) {
            function getDisplayPartsJson(displayParts) {
                var result = "";
                ts.forEach(displayParts, function (part) {
                    if (result) {
                        result += ",\n    ";
                    }
                    else {
                        result = "[\n    ";
                    }
                    result += JSON.stringify(part);
                });
                if (result) {
                    result += "\n]";
                }
                return result;
            }
            var actualQuickInfo = this.languageService.getQuickInfoAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            assert.equal(actualQuickInfo.kind, kind, this.messageAtLastKnownMarker("QuickInfo kind"));
            assert.equal(actualQuickInfo.kindModifiers, kindModifiers, this.messageAtLastKnownMarker("QuickInfo kindModifiers"));
            assert.equal(JSON.stringify(actualQuickInfo.textSpan), JSON.stringify(textSpan), this.messageAtLastKnownMarker("QuickInfo textSpan"));
            assert.equal(getDisplayPartsJson(actualQuickInfo.displayParts), getDisplayPartsJson(displayParts), this.messageAtLastKnownMarker("QuickInfo displayParts"));
            assert.equal(getDisplayPartsJson(actualQuickInfo.documentation), getDisplayPartsJson(documentation), this.messageAtLastKnownMarker("QuickInfo documentation"));
        };
        TestState.prototype.verifyRenameLocations = function (findInStrings, findInComments, ranges) {
            var renameInfo = this.languageService.getRenameInfo(this.activeFile.fileName, this.currentCaretPosition);
            if (renameInfo.canRename) {
                var references = this.languageService.findRenameLocations(this.activeFile.fileName, this.currentCaretPosition, findInStrings, findInComments);
                ranges = ranges || this.getRanges();
                if (!references) {
                    if (ranges.length !== 0) {
                        this.raiseError("Expected " + ranges.length + " rename locations; got none.");
                    }
                    return;
                }
                if (ranges.length !== references.length) {
                    this.raiseError("Rename location count does not match result.\n\nExpected: " + stringify(ranges) + "\n\nActual:" + stringify(references));
                }
                ranges = ranges.sort(function (r1, r2) { return r1.start - r2.start; });
                references = references.sort(function (r1, r2) { return r1.textSpan.start - r2.textSpan.start; });
                for (var i = 0, n = ranges.length; i < n; i++) {
                    var reference = references[i];
                    var range = ranges[i];
                    if (reference.textSpan.start !== range.start ||
                        ts.textSpanEnd(reference.textSpan) !== range.end) {
                        this.raiseError("Rename location results do not match.\n\nExpected: " + stringify(ranges) + "\n\nActual:" + JSON.stringify(references));
                    }
                }
            }
            else {
                this.raiseError("Expected rename to succeed, but it actually failed.");
            }
        };
        TestState.prototype.verifyQuickInfoExists = function (negative) {
            var actualQuickInfo = this.languageService.getQuickInfoAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            if (negative) {
                if (actualQuickInfo) {
                    this.raiseError("verifyQuickInfoExists failed. Expected quick info NOT to exist");
                }
            }
            else {
                if (!actualQuickInfo) {
                    this.raiseError("verifyQuickInfoExists failed. Expected quick info to exist");
                }
            }
        };
        TestState.prototype.verifyCurrentSignatureHelpIs = function (expected) {
            var help = this.getActiveSignatureHelpItem();
            assert.equal(ts.displayPartsToString(help.prefixDisplayParts) +
                help.parameters.map(function (p) { return ts.displayPartsToString(p.displayParts); }).join(ts.displayPartsToString(help.separatorDisplayParts)) +
                ts.displayPartsToString(help.suffixDisplayParts), expected);
        };
        TestState.prototype.verifyCurrentParameterIsletiable = function (isVariable) {
            var signature = this.getActiveSignatureHelpItem();
            assert.isOk(signature);
            assert.equal(isVariable, signature.isVariadic);
        };
        TestState.prototype.verifyCurrentParameterHelpName = function (name) {
            var activeParameter = this.getActiveParameter();
            var activeParameterName = activeParameter.name;
            assert.equal(activeParameterName, name);
        };
        TestState.prototype.verifyCurrentParameterSpanIs = function (parameter) {
            var activeParameter = this.getActiveParameter();
            assert.equal(ts.displayPartsToString(activeParameter.displayParts), parameter);
        };
        TestState.prototype.verifyCurrentParameterHelpDocComment = function (docComment) {
            var activeParameter = this.getActiveParameter();
            var activeParameterDocComment = activeParameter.documentation;
            assert.equal(ts.displayPartsToString(activeParameterDocComment), docComment, this.assertionMessageAtLastKnownMarker("current parameter Help DocComment"));
        };
        TestState.prototype.verifyCurrentSignatureHelpParameterCount = function (expectedCount) {
            assert.equal(this.getActiveSignatureHelpItem().parameters.length, expectedCount);
        };
        TestState.prototype.verifyCurrentSignatureHelpDocComment = function (docComment) {
            var actualDocComment = this.getActiveSignatureHelpItem().documentation;
            assert.equal(ts.displayPartsToString(actualDocComment), docComment, this.assertionMessageAtLastKnownMarker("current signature help doc comment"));
        };
        TestState.prototype.verifySignatureHelpCount = function (expected) {
            var help = this.languageService.getSignatureHelpItems(this.activeFile.fileName, this.currentCaretPosition);
            var actual = help && help.items ? help.items.length : 0;
            assert.equal(actual, expected);
        };
        TestState.prototype.verifySignatureHelpArgumentCount = function (expected) {
            var signatureHelpItems = this.languageService.getSignatureHelpItems(this.activeFile.fileName, this.currentCaretPosition);
            var actual = signatureHelpItems.argumentCount;
            assert.equal(actual, expected);
        };
        TestState.prototype.verifySignatureHelpPresent = function (shouldBePresent) {
            if (shouldBePresent === void 0) { shouldBePresent = true; }
            var actual = this.languageService.getSignatureHelpItems(this.activeFile.fileName, this.currentCaretPosition);
            if (shouldBePresent) {
                if (!actual) {
                    this.raiseError("Expected signature help to be present, but it wasn't");
                }
            }
            else {
                if (actual) {
                    this.raiseError("Expected no signature help, but got \"" + stringify(actual) + "\"");
                }
            }
        };
        TestState.prototype.validate = function (name, expected, actual) {
            if (expected && expected !== actual) {
                this.raiseError("Expected " + name + " '" + expected + "'.  Got '" + actual + "' instead.");
            }
        };
        TestState.prototype.verifyRenameInfoSucceeded = function (displayName, fullDisplayName, kind, kindModifiers) {
            var renameInfo = this.languageService.getRenameInfo(this.activeFile.fileName, this.currentCaretPosition);
            if (!renameInfo.canRename) {
                this.raiseError("Rename did not succeed");
            }
            this.validate("displayName", displayName, renameInfo.displayName);
            this.validate("fullDisplayName", fullDisplayName, renameInfo.fullDisplayName);
            this.validate("kind", kind, renameInfo.kind);
            this.validate("kindModifiers", kindModifiers, renameInfo.kindModifiers);
            if (this.getRanges().length !== 1) {
                this.raiseError("Expected a single range to be selected in the test file.");
            }
            var expectedRange = this.getRanges()[0];
            if (renameInfo.triggerSpan.start !== expectedRange.start ||
                ts.textSpanEnd(renameInfo.triggerSpan) !== expectedRange.end) {
                this.raiseError("Expected triggerSpan [" + expectedRange.start + "," + expectedRange.end + ").  Got [" +
                    renameInfo.triggerSpan.start + "," + ts.textSpanEnd(renameInfo.triggerSpan) + ") instead.");
            }
        };
        TestState.prototype.verifyRenameInfoFailed = function (message) {
            var renameInfo = this.languageService.getRenameInfo(this.activeFile.fileName, this.currentCaretPosition);
            if (renameInfo.canRename) {
                this.raiseError("Rename was expected to fail");
            }
            this.validate("error", message, renameInfo.localizedErrorMessage);
        };
        TestState.prototype.getActiveSignatureHelpItem = function () {
            var help = this.languageService.getSignatureHelpItems(this.activeFile.fileName, this.currentCaretPosition);
            var index = help.selectedItemIndex;
            return help.items[index];
        };
        TestState.prototype.getActiveParameter = function () {
            var help = this.languageService.getSignatureHelpItems(this.activeFile.fileName, this.currentCaretPosition);
            var item = help.items[help.selectedItemIndex];
            var currentParam = help.argumentIndex;
            return item.parameters[currentParam];
        };
        TestState.prototype.spanInfoToString = function (pos, spanInfo, prefixString) {
            var resultString = "SpanInfo: " + JSON.stringify(spanInfo);
            if (spanInfo) {
                var spanString = this.activeFile.content.substr(spanInfo.start, spanInfo.length);
                var spanLineMap = ts.computeLineStarts(spanString);
                for (var i = 0; i < spanLineMap.length; i++) {
                    if (!i) {
                        resultString += "\n";
                    }
                    resultString += prefixString + spanString.substring(spanLineMap[i], spanLineMap[i + 1]);
                }
                resultString += "\n" + prefixString + ":=> (" + this.getLineColStringAtPosition(spanInfo.start) + ") to (" + this.getLineColStringAtPosition(ts.textSpanEnd(spanInfo)) + ")";
            }
            return resultString;
        };
        TestState.prototype.baselineCurrentFileLocations = function (getSpanAtPos) {
            var _this = this;
            var fileLineMap = ts.computeLineStarts(this.activeFile.content);
            var nextLine = 0;
            var resultString = "";
            var currentLine;
            var previousSpanInfo;
            var startColumn;
            var length;
            var prefixString = "    >";
            var pos = 0;
            var addSpanInfoString = function () {
                if (previousSpanInfo) {
                    resultString += currentLine;
                    var thisLineMarker = repeatString(startColumn, " ") + repeatString(length, "~");
                    thisLineMarker += repeatString(_this.alignmentForExtraInfo - thisLineMarker.length - prefixString.length + 1, " ");
                    resultString += thisLineMarker;
                    resultString += "=> Pos: (" + (pos - length) + " to " + (pos - 1) + ") ";
                    resultString += " " + previousSpanInfo;
                    previousSpanInfo = undefined;
                }
            };
            for (; pos < this.activeFile.content.length; pos++) {
                if (pos === 0 || pos === fileLineMap[nextLine]) {
                    nextLine++;
                    addSpanInfoString();
                    if (resultString.length) {
                        resultString += "\n--------------------------------";
                    }
                    currentLine = "\n" + nextLine.toString() + repeatString(3 - nextLine.toString().length, " ") + ">" + this.activeFile.content.substring(pos, fileLineMap[nextLine]) + "\n    ";
                    startColumn = 0;
                    length = 0;
                }
                var spanInfo = this.spanInfoToString(pos, getSpanAtPos(pos), prefixString);
                if (previousSpanInfo && previousSpanInfo !== spanInfo) {
                    addSpanInfoString();
                    previousSpanInfo = spanInfo;
                    startColumn = startColumn + length;
                    length = 1;
                }
                else {
                    previousSpanInfo = spanInfo;
                    length++;
                }
            }
            addSpanInfoString();
            return resultString;
        };
        TestState.prototype.getBreakpointStatementLocation = function (pos) {
            return this.languageService.getBreakpointStatementAtPosition(this.activeFile.fileName, pos);
        };
        TestState.prototype.baselineCurrentFileBreakpointLocations = function () {
            var _this = this;
            var baselineFile = this.testData.globalOptions[metadataOptionNames.baselineFile];
            if (!baselineFile) {
                baselineFile = this.activeFile.fileName.replace(this.basePath + "/breakpointValidation", "bpSpan");
                baselineFile = baselineFile.replace(".ts", ".baseline");
            }
            Harness.Baseline.runBaseline("Breakpoint Locations for " + this.activeFile.fileName, baselineFile, function () {
                return _this.baselineCurrentFileLocations(function (pos) { return _this.getBreakpointStatementLocation(pos); });
            }, true /* run immediately */);
        };
        TestState.prototype.baselineGetEmitOutput = function () {
            var _this = this;
            // Find file to be emitted
            var emitFiles = []; // List of FourSlashFile that has emitThisFile flag on
            var allFourSlashFiles = this.testData.files;
            for (var idx = 0; idx < allFourSlashFiles.length; idx++) {
                var file = allFourSlashFiles[idx];
                if (file.fileOptions[metadataOptionNames.emitThisFile] === "true") {
                    // Find a file with the flag emitThisFile turned on
                    emitFiles.push(file);
                }
            }
            // If there is not emiThisFile flag specified in the test file, throw an error
            if (emitFiles.length === 0) {
                this.raiseError("No emitThisFile is specified in the test file");
            }
            Harness.Baseline.runBaseline("Generate getEmitOutput baseline : " + emitFiles.join(" "), this.testData.globalOptions[metadataOptionNames.baselineFile], function () {
                var resultString = "";
                // Loop through all the emittedFiles and emit them one by one
                emitFiles.forEach(function (emitFile) {
                    var emitOutput = _this.languageService.getEmitOutput(emitFile.fileName);
                    // Print emitOutputStatus in readable format
                    resultString += "EmitSkipped: " + emitOutput.emitSkipped + Harness.IO.newLine();
                    if (emitOutput.emitSkipped) {
                        resultString += "Diagnostics:" + Harness.IO.newLine();
                        var diagnostics = ts.getPreEmitDiagnostics(_this.languageService.getProgram());
                        for (var i = 0, n = diagnostics.length; i < n; i++) {
                            resultString += "  " + diagnostics[0].messageText + Harness.IO.newLine();
                        }
                    }
                    emitOutput.outputFiles.forEach(function (outputFile, idx, array) {
                        var fileName = "FileName : " + outputFile.name + Harness.IO.newLine();
                        resultString = resultString + fileName + outputFile.text;
                    });
                    resultString += Harness.IO.newLine();
                });
                return resultString;
            }, true /* run immediately */);
        };
        TestState.prototype.printBreakpointLocation = function (pos) {
            Harness.IO.log("\n**Pos: " + pos + " " + this.spanInfoToString(pos, this.getBreakpointStatementLocation(pos), "  "));
        };
        TestState.prototype.printBreakpointAtCurrentLocation = function () {
            this.printBreakpointLocation(this.currentCaretPosition);
        };
        TestState.prototype.printCurrentParameterHelp = function () {
            var help = this.languageService.getSignatureHelpItems(this.activeFile.fileName, this.currentCaretPosition);
            Harness.IO.log(stringify(help));
        };
        TestState.prototype.printCurrentQuickInfo = function () {
            var quickInfo = this.languageService.getQuickInfoAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            Harness.IO.log("Quick Info: " + quickInfo.displayParts.map(function (part) { return part.text; }).join(""));
        };
        TestState.prototype.printErrorList = function () {
            var syntacticErrors = this.languageService.getSyntacticDiagnostics(this.activeFile.fileName);
            var semanticErrors = this.languageService.getSemanticDiagnostics(this.activeFile.fileName);
            var errorList = syntacticErrors.concat(semanticErrors);
            Harness.IO.log("Error list (" + errorList.length + " errors)");
            if (errorList.length) {
                errorList.forEach(function (err) {
                    Harness.IO.log("start: " + err.start +
                        ", length: " + err.length +
                        ", message: " + ts.flattenDiagnosticMessageText(err.messageText, Harness.IO.newLine()));
                });
            }
        };
        TestState.prototype.printCurrentFileState = function (makeWhitespaceVisible, makeCaretVisible) {
            if (makeWhitespaceVisible === void 0) { makeWhitespaceVisible = false; }
            if (makeCaretVisible === void 0) { makeCaretVisible = true; }
            for (var i = 0; i < this.testData.files.length; i++) {
                var file = this.testData.files[i];
                var active = (this.activeFile === file);
                Harness.IO.log("=== Script (" + file.fileName + ") " + (active ? "(active, cursor at |)" : "") + " ===");
                var content = this.getFileContent(file.fileName);
                if (active) {
                    content = content.substr(0, this.currentCaretPosition) + (makeCaretVisible ? "|" : "") + content.substr(this.currentCaretPosition);
                }
                if (makeWhitespaceVisible) {
                    content = TestState.makeWhitespaceVisible(content);
                }
                Harness.IO.log(content);
            }
        };
        TestState.prototype.printCurrentSignatureHelp = function () {
            var sigHelp = this.getActiveSignatureHelpItem();
            Harness.IO.log(stringify(sigHelp));
        };
        TestState.prototype.printMemberListMembers = function () {
            var members = this.getMemberListAtCaret();
            this.printMembersOrCompletions(members);
        };
        TestState.prototype.printCompletionListMembers = function () {
            var completions = this.getCompletionListAtCaret();
            this.printMembersOrCompletions(completions);
        };
        TestState.prototype.printMembersOrCompletions = function (info) {
            function pad(s, length) {
                return s + new Array(length - s.length + 1).join(" ");
            }
            function max(arr, selector) {
                return arr.reduce(function (prev, x) { return Math.max(prev, selector(x)); }, 0);
            }
            var longestNameLength = max(info.entries, function (m) { return m.name.length; });
            var longestKindLength = max(info.entries, function (m) { return m.kind.length; });
            info.entries.sort(function (m, n) { return m.sortText > n.sortText ? 1 : m.sortText < n.sortText ? -1 : m.name > n.name ? 1 : m.name < n.name ? -1 : 0; });
            var membersString = info.entries.map(function (m) { return (pad(m.name, longestNameLength) + " " + pad(m.kind, longestKindLength) + " " + m.kindModifiers); }).join("\n");
            Harness.IO.log(membersString);
        };
        TestState.prototype.printReferences = function () {
            var references = this.getReferencesAtCaret();
            ts.forEach(references, function (entry) {
                Harness.IO.log(stringify(entry));
            });
        };
        TestState.prototype.printContext = function () {
            ts.forEach(this.languageServiceAdapterHost.getFilenames(), Harness.IO.log);
        };
        TestState.prototype.deleteChar = function (count) {
            if (count === void 0) { count = 1; }
            var offset = this.currentCaretPosition;
            var ch = "";
            var checkCadence = (count >> 2) + 1;
            for (var i = 0; i < count; i++) {
                // Make the edit
                this.languageServiceAdapterHost.editScript(this.activeFile.fileName, offset, offset + 1, ch);
                this.updateMarkersForEdit(this.activeFile.fileName, offset, offset + 1, ch);
                if (i % checkCadence === 0) {
                    this.checkPostEditInvariants();
                }
                // Handle post-keystroke formatting
                if (this.enableFormatting) {
                    var edits = this.languageService.getFormattingEditsAfterKeystroke(this.activeFile.fileName, offset, ch, this.formatCodeOptions);
                    if (edits.length) {
                        offset += this.applyEdits(this.activeFile.fileName, edits, /*isFormattingEdit*/ true);
                    }
                }
            }
            // Move the caret to wherever we ended up
            this.currentCaretPosition = offset;
            this.fixCaretPosition();
            this.checkPostEditInvariants();
        };
        TestState.prototype.replace = function (start, length, text) {
            this.languageServiceAdapterHost.editScript(this.activeFile.fileName, start, start + length, text);
            this.updateMarkersForEdit(this.activeFile.fileName, start, start + length, text);
            this.checkPostEditInvariants();
        };
        TestState.prototype.deleteCharBehindMarker = function (count) {
            if (count === void 0) { count = 1; }
            var offset = this.currentCaretPosition;
            var ch = "";
            var checkCadence = (count >> 2) + 1;
            for (var i = 0; i < count; i++) {
                offset--;
                // Make the edit
                this.languageServiceAdapterHost.editScript(this.activeFile.fileName, offset, offset + 1, ch);
                this.updateMarkersForEdit(this.activeFile.fileName, offset, offset + 1, ch);
                if (i % checkCadence === 0) {
                    this.checkPostEditInvariants();
                }
                // Handle post-keystroke formatting
                if (this.enableFormatting) {
                    var edits = this.languageService.getFormattingEditsAfterKeystroke(this.activeFile.fileName, offset, ch, this.formatCodeOptions);
                    if (edits.length) {
                        offset += this.applyEdits(this.activeFile.fileName, edits, /*isFormattingEdit*/ true);
                    }
                }
            }
            // Move the caret to wherever we ended up
            this.currentCaretPosition = offset;
            this.fixCaretPosition();
            this.checkPostEditInvariants();
        };
        // Enters lines of text at the current caret position
        TestState.prototype.type = function (text) {
            return this.typeHighFidelity(text);
        };
        // Enters lines of text at the current caret position, invoking
        // language service APIs to mimic Visual Studio's behavior
        // as much as possible
        TestState.prototype.typeHighFidelity = function (text) {
            var offset = this.currentCaretPosition;
            var prevChar = " ";
            var checkCadence = (text.length >> 2) + 1;
            for (var i = 0; i < text.length; i++) {
                // Make the edit
                var ch = text.charAt(i);
                this.languageServiceAdapterHost.editScript(this.activeFile.fileName, offset, offset, ch);
                this.languageService.getBraceMatchingAtPosition(this.activeFile.fileName, offset);
                this.updateMarkersForEdit(this.activeFile.fileName, offset, offset, ch);
                offset++;
                if (ch === "(" || ch === ",") {
                    /* Signature help*/
                    this.languageService.getSignatureHelpItems(this.activeFile.fileName, offset);
                }
                else if (prevChar === " " && /A-Za-z_/.test(ch)) {
                    /* Completions */
                    this.languageService.getCompletionsAtPosition(this.activeFile.fileName, offset);
                }
                if (i % checkCadence === 0) {
                    this.checkPostEditInvariants();
                }
                // Handle post-keystroke formatting
                if (this.enableFormatting) {
                    var edits = this.languageService.getFormattingEditsAfterKeystroke(this.activeFile.fileName, offset, ch, this.formatCodeOptions);
                    if (edits.length) {
                        offset += this.applyEdits(this.activeFile.fileName, edits, /*isFormattingEdit*/ true);
                    }
                }
            }
            // Move the caret to wherever we ended up
            this.currentCaretPosition = offset;
            this.fixCaretPosition();
            this.checkPostEditInvariants();
        };
        // Enters text as if the user had pasted it
        TestState.prototype.paste = function (text) {
            var start = this.currentCaretPosition;
            var offset = this.currentCaretPosition;
            this.languageServiceAdapterHost.editScript(this.activeFile.fileName, offset, offset, text);
            this.updateMarkersForEdit(this.activeFile.fileName, offset, offset, text);
            this.checkPostEditInvariants();
            offset += text.length;
            // Handle formatting
            if (this.enableFormatting) {
                var edits = this.languageService.getFormattingEditsForRange(this.activeFile.fileName, start, offset, this.formatCodeOptions);
                if (edits.length) {
                    offset += this.applyEdits(this.activeFile.fileName, edits, /*isFormattingEdit*/ true);
                    this.checkPostEditInvariants();
                }
            }
            // Move the caret to wherever we ended up
            this.currentCaretPosition = offset;
            this.fixCaretPosition();
            this.checkPostEditInvariants();
        };
        TestState.prototype.checkPostEditInvariants = function () {
            if (this.testType !== 0 /* Native */) {
                // getSourcefile() results can not be serialized. Only perform these verifications
                // if running against a native LS object.
                return;
            }
            var incrementalSourceFile = this.languageService.getNonBoundSourceFile(this.activeFile.fileName);
            Utils.assertInvariants(incrementalSourceFile, /*parent:*/ undefined);
            var incrementalSyntaxDiagnostics = incrementalSourceFile.parseDiagnostics;
            // Check syntactic structure
            var content = this.getFileContent(this.activeFile.fileName);
            var referenceSourceFile = ts.createLanguageServiceSourceFile(this.activeFile.fileName, createScriptSnapShot(content), 2 /* Latest */, /*version:*/ "0", /*setNodeParents:*/ false);
            var referenceSyntaxDiagnostics = referenceSourceFile.parseDiagnostics;
            Utils.assertDiagnosticsEquals(incrementalSyntaxDiagnostics, referenceSyntaxDiagnostics);
            Utils.assertStructuralEquals(incrementalSourceFile, referenceSourceFile);
        };
        TestState.prototype.fixCaretPosition = function () {
            // The caret can potentially end up between the \r and \n, which is confusing. If
            // that happens, move it back one character
            if (this.currentCaretPosition > 0) {
                var ch = this.getFileContent(this.activeFile.fileName).substring(this.currentCaretPosition - 1, this.currentCaretPosition);
                if (ch === "\r") {
                    this.currentCaretPosition--;
                }
            }
            ;
        };
        TestState.prototype.applyEdits = function (fileName, edits, isFormattingEdit) {
            if (isFormattingEdit === void 0) { isFormattingEdit = false; }
            // We get back a set of edits, but langSvc.editScript only accepts one at a time. Use this to keep track
            // of the incremental offset from each edit to the next. Assumption is that these edit ranges don't overlap
            var runningOffset = 0;
            edits = edits.sort(function (a, b) { return a.span.start - b.span.start; });
            // Get a snapshot of the content of the file so we can make sure any formatting edits didn't destroy non-whitespace characters
            var oldContent = this.getFileContent(this.activeFile.fileName);
            for (var j = 0; j < edits.length; j++) {
                this.languageServiceAdapterHost.editScript(fileName, edits[j].span.start + runningOffset, ts.textSpanEnd(edits[j].span) + runningOffset, edits[j].newText);
                this.updateMarkersForEdit(fileName, edits[j].span.start + runningOffset, ts.textSpanEnd(edits[j].span) + runningOffset, edits[j].newText);
                var change = (edits[j].span.start - ts.textSpanEnd(edits[j].span)) + edits[j].newText.length;
                runningOffset += change;
            }
            if (isFormattingEdit) {
                var newContent = this.getFileContent(fileName);
                if (newContent.replace(/\s/g, "") !== oldContent.replace(/\s/g, "")) {
                    this.raiseError("Formatting operation destroyed non-whitespace content");
                }
            }
            return runningOffset;
        };
        TestState.prototype.copyFormatOptions = function () {
            return ts.clone(this.formatCodeOptions);
        };
        TestState.prototype.setFormatOptions = function (formatCodeOptions) {
            var oldFormatCodeOptions = this.formatCodeOptions;
            this.formatCodeOptions = formatCodeOptions;
            return oldFormatCodeOptions;
        };
        TestState.prototype.formatDocument = function () {
            var edits = this.languageService.getFormattingEditsForDocument(this.activeFile.fileName, this.formatCodeOptions);
            this.currentCaretPosition += this.applyEdits(this.activeFile.fileName, edits, /*isFormattingEdit*/ true);
            this.fixCaretPosition();
        };
        TestState.prototype.formatSelection = function (start, end) {
            var edits = this.languageService.getFormattingEditsForRange(this.activeFile.fileName, start, end, this.formatCodeOptions);
            this.currentCaretPosition += this.applyEdits(this.activeFile.fileName, edits, /*isFormattingEdit*/ true);
            this.fixCaretPosition();
        };
        TestState.prototype.formatOnType = function (pos, key) {
            var edits = this.languageService.getFormattingEditsAfterKeystroke(this.activeFile.fileName, pos, key, this.formatCodeOptions);
            this.currentCaretPosition += this.applyEdits(this.activeFile.fileName, edits, /*isFormattingEdit*/ true);
            this.fixCaretPosition();
        };
        TestState.prototype.updateMarkersForEdit = function (fileName, minChar, limChar, text) {
            for (var _i = 0, _a = this.testData.markers; _i < _a.length; _i++) {
                var marker = _a[_i];
                if (marker.fileName === fileName) {
                    marker.position = updatePosition(marker.position);
                }
            }
            for (var _b = 0, _c = this.testData.ranges; _b < _c.length; _b++) {
                var range = _c[_b];
                if (range.fileName === fileName) {
                    range.start = updatePosition(range.start);
                    range.end = updatePosition(range.end);
                }
            }
            function updatePosition(position) {
                if (position > minChar) {
                    if (position < limChar) {
                        // Inside the edit - mark it as invalidated (?)
                        return -1;
                    }
                    else {
                        // Move marker back/forward by the appropriate amount
                        return position + (minChar - limChar) + text.length;
                    }
                }
                else {
                    return position;
                }
            }
        };
        TestState.prototype.goToBOF = function () {
            this.goToPosition(0);
        };
        TestState.prototype.goToEOF = function () {
            var len = this.getFileContent(this.activeFile.fileName).length;
            this.goToPosition(len);
        };
        TestState.prototype.goToDefinition = function (definitionIndex) {
            var definitions = this.languageService.getDefinitionAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            if (!definitions || !definitions.length) {
                this.raiseError("goToDefinition failed - expected to at least one definition location but got 0");
            }
            if (definitionIndex >= definitions.length) {
                this.raiseError("goToDefinition failed - definitionIndex value (" + definitionIndex + ") exceeds definition list size (" + definitions.length + ")");
            }
            var definition = definitions[definitionIndex];
            this.openFile(definition.fileName);
            this.currentCaretPosition = definition.textSpan.start;
        };
        TestState.prototype.goToTypeDefinition = function (definitionIndex) {
            var definitions = this.languageService.getTypeDefinitionAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            if (!definitions || !definitions.length) {
                this.raiseError("goToTypeDefinition failed - expected to at least one definition location but got 0");
            }
            if (definitionIndex >= definitions.length) {
                this.raiseError("goToTypeDefinition failed - definitionIndex value (" + definitionIndex + ") exceeds definition list size (" + definitions.length + ")");
            }
            var definition = definitions[definitionIndex];
            this.openFile(definition.fileName);
            this.currentCaretPosition = definition.textSpan.start;
        };
        TestState.prototype.verifyDefinitionLocationExists = function (negative) {
            var definitions = this.languageService.getDefinitionAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            var foundDefinitions = definitions && definitions.length;
            if (foundDefinitions && negative) {
                this.raiseError("goToDefinition - expected to 0 definition locations but got " + definitions.length);
            }
            else if (!foundDefinitions && !negative) {
                this.raiseError("goToDefinition - expected to at least one definition location but got 0");
            }
        };
        TestState.prototype.verifyDefinitionsCount = function (negative, expectedCount) {
            var assertFn = negative ? assert.notEqual : assert.equal;
            var definitions = this.languageService.getDefinitionAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            var actualCount = definitions && definitions.length || 0;
            assertFn(actualCount, expectedCount, this.messageAtLastKnownMarker("Definitions Count"));
        };
        TestState.prototype.verifyTypeDefinitionsCount = function (negative, expectedCount) {
            var assertFn = negative ? assert.notEqual : assert.equal;
            var definitions = this.languageService.getTypeDefinitionAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            var actualCount = definitions && definitions.length || 0;
            assertFn(actualCount, expectedCount, this.messageAtLastKnownMarker("Type definitions Count"));
        };
        TestState.prototype.verifyDefinitionsName = function (negative, expectedName, expectedContainerName) {
            var definitions = this.languageService.getDefinitionAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            var actualDefinitionName = definitions && definitions.length ? definitions[0].name : "";
            var actualDefinitionContainerName = definitions && definitions.length ? definitions[0].containerName : "";
            if (negative) {
                assert.notEqual(actualDefinitionName, expectedName, this.messageAtLastKnownMarker("Definition Info Name"));
                assert.notEqual(actualDefinitionContainerName, expectedContainerName, this.messageAtLastKnownMarker("Definition Info Container Name"));
            }
            else {
                assert.equal(actualDefinitionName, expectedName, this.messageAtLastKnownMarker("Definition Info Name"));
                assert.equal(actualDefinitionContainerName, expectedContainerName, this.messageAtLastKnownMarker("Definition Info Container Name"));
            }
        };
        TestState.prototype.getMarkers = function () {
            //  Return a copy of the list
            return this.testData.markers.slice(0);
        };
        TestState.prototype.getRanges = function () {
            return this.testData.ranges;
        };
        TestState.prototype.rangesByText = function () {
            var result = {};
            for (var _i = 0, _a = this.getRanges(); _i < _a.length; _i++) {
                var range = _a[_i];
                var text = this.rangeText(range);
                (ts.getProperty(result, text) || (result[text] = [])).push(range);
            }
            return result;
        };
        TestState.prototype.rangeText = function (_a, more) {
            var fileName = _a.fileName, start = _a.start, end = _a.end;
            if (more === void 0) { more = false; }
            return this.getFileContent(fileName).slice(start, end);
        };
        TestState.prototype.verifyCaretAtMarker = function (markerName) {
            if (markerName === void 0) { markerName = ""; }
            var pos = this.getMarkerByName(markerName);
            if (pos.fileName !== this.activeFile.fileName) {
                throw new Error("verifyCaretAtMarker failed - expected to be in file \"" + pos.fileName + "\", but was in file \"" + this.activeFile.fileName + "\"");
            }
            if (pos.position !== this.currentCaretPosition) {
                throw new Error("verifyCaretAtMarker failed - expected to be at marker \"/*" + markerName + "*/, but was at position " + this.currentCaretPosition + "(" + this.getLineColStringAtPosition(this.currentCaretPosition) + ")");
            }
        };
        TestState.prototype.getIndentation = function (fileName, position, indentStyle, baseIndentSize) {
            var formatOptions = ts.clone(this.formatCodeOptions);
            formatOptions.IndentStyle = indentStyle;
            formatOptions.BaseIndentSize = baseIndentSize;
            return this.languageService.getIndentationAtPosition(fileName, position, formatOptions);
        };
        TestState.prototype.verifyIndentationAtCurrentPosition = function (numberOfSpaces, indentStyle, baseIndentSize) {
            if (indentStyle === void 0) { indentStyle = ts.IndentStyle.Smart; }
            if (baseIndentSize === void 0) { baseIndentSize = 0; }
            var actual = this.getIndentation(this.activeFile.fileName, this.currentCaretPosition, indentStyle, baseIndentSize);
            var lineCol = this.getLineColStringAtPosition(this.currentCaretPosition);
            if (actual !== numberOfSpaces) {
                this.raiseError("verifyIndentationAtCurrentPosition failed at " + lineCol + " - expected: " + numberOfSpaces + ", actual: " + actual);
            }
        };
        TestState.prototype.verifyIndentationAtPosition = function (fileName, position, numberOfSpaces, indentStyle, baseIndentSize) {
            if (indentStyle === void 0) { indentStyle = ts.IndentStyle.Smart; }
            if (baseIndentSize === void 0) { baseIndentSize = 0; }
            var actual = this.getIndentation(fileName, position, indentStyle, baseIndentSize);
            var lineCol = this.getLineColStringAtPosition(position);
            if (actual !== numberOfSpaces) {
                this.raiseError("verifyIndentationAtPosition failed at " + lineCol + " - expected: " + numberOfSpaces + ", actual: " + actual);
            }
        };
        TestState.prototype.verifyCurrentLineContent = function (text) {
            var actual = this.getCurrentLineContent();
            if (actual !== text) {
                throw new Error("verifyCurrentLineContent\n" +
                    "\tExpected: \"" + text + "\"\n" +
                    "\t  Actual: \"" + actual + "\"");
            }
        };
        TestState.prototype.verifyCurrentFileContent = function (text) {
            var actual = this.getFileContent(this.activeFile.fileName);
            var replaceNewlines = function (str) { return str.replace(/\r\n/g, "\n"); };
            if (replaceNewlines(actual) !== replaceNewlines(text)) {
                throw new Error("verifyCurrentFileContent\n" +
                    "\tExpected: \"" + text + "\"\n" +
                    "\t  Actual: \"" + actual + "\"");
            }
        };
        TestState.prototype.verifyTextAtCaretIs = function (text) {
            var actual = this.getFileContent(this.activeFile.fileName).substring(this.currentCaretPosition, this.currentCaretPosition + text.length);
            if (actual !== text) {
                throw new Error("verifyTextAtCaretIs\n" +
                    "\tExpected: \"" + text + "\"\n" +
                    "\t  Actual: \"" + actual + "\"");
            }
        };
        TestState.prototype.verifyCurrentNameOrDottedNameSpanText = function (text) {
            var span = this.languageService.getNameOrDottedNameSpan(this.activeFile.fileName, this.currentCaretPosition, this.currentCaretPosition);
            if (!span) {
                this.raiseError("verifyCurrentNameOrDottedNameSpanText\n" +
                    "\tExpected: \"" + text + "\"\n" +
                    "\t  Actual: undefined");
            }
            var actual = this.getFileContent(this.activeFile.fileName).substring(span.start, ts.textSpanEnd(span));
            if (actual !== text) {
                this.raiseError("verifyCurrentNameOrDottedNameSpanText\n" +
                    "\tExpected: \"" + text + "\"\n" +
                    "\t  Actual: \"" + actual + "\"");
            }
        };
        TestState.prototype.getNameOrDottedNameSpan = function (pos) {
            return this.languageService.getNameOrDottedNameSpan(this.activeFile.fileName, pos, pos);
        };
        TestState.prototype.baselineCurrentFileNameOrDottedNameSpans = function () {
            var _this = this;
            Harness.Baseline.runBaseline("Name OrDottedNameSpans for " + this.activeFile.fileName, this.testData.globalOptions[metadataOptionNames.baselineFile], function () {
                return _this.baselineCurrentFileLocations(function (pos) {
                    return _this.getNameOrDottedNameSpan(pos);
                });
            }, true /* run immediately */);
        };
        TestState.prototype.printNameOrDottedNameSpans = function (pos) {
            Harness.IO.log(this.spanInfoToString(pos, this.getNameOrDottedNameSpan(pos), "**"));
        };
        TestState.prototype.verifyClassifications = function (expected, actual) {
            if (actual.length !== expected.length) {
                this.raiseError("verifyClassifications failed - expected total classifications to be " + expected.length +
                    ", but was " + actual.length +
                    jsonMismatchString());
            }
            for (var i = 0; i < expected.length; i++) {
                var expectedClassification = expected[i];
                var actualClassification = actual[i];
                var expectedType = ts.ClassificationTypeNames[expectedClassification.classificationType];
                if (expectedType !== actualClassification.classificationType) {
                    this.raiseError("verifyClassifications failed - expected classifications type to be " +
                        expectedType + ", but was " +
                        actualClassification.classificationType +
                        jsonMismatchString());
                }
                var expectedSpan = expectedClassification.textSpan;
                var actualSpan = actualClassification.textSpan;
                if (expectedSpan) {
                    var expectedLength = expectedSpan.end - expectedSpan.start;
                    if (expectedSpan.start !== actualSpan.start || expectedLength !== actualSpan.length) {
                        this.raiseError("verifyClassifications failed - expected span of text to be " +
                            "{start=" + expectedSpan.start + ", length=" + expectedLength + "}, but was " +
                            "{start=" + actualSpan.start + ", length=" + actualSpan.length + "}" +
                            jsonMismatchString());
                    }
                }
                var actualText = this.activeFile.content.substr(actualSpan.start, actualSpan.length);
                if (expectedClassification.text !== actualText) {
                    this.raiseError("verifyClassifications failed - expected classified text to be " +
                        expectedClassification.text + ", but was " +
                        actualText +
                        jsonMismatchString());
                }
            }
            function jsonMismatchString() {
                return Harness.IO.newLine() +
                    "expected: '" + Harness.IO.newLine() + stringify(expected) + "'" + Harness.IO.newLine() +
                    "actual:   '" + Harness.IO.newLine() + stringify(actual) + "'";
            }
        };
        TestState.prototype.verifyProjectInfo = function (expected) {
            var _this = this;
            if (this.testType === 3 /* Server */) {
                var actual = this.languageService.getProjectInfo(this.activeFile.fileName, 
                /* needFileNameList */ true);
                assert.equal(expected.join(","), actual.fileNames.map(function (file) {
                    return file.replace(_this.basePath + "/", "");
                }).join(","));
            }
        };
        TestState.prototype.verifySemanticClassifications = function (expected) {
            var actual = this.languageService.getSemanticClassifications(this.activeFile.fileName, ts.createTextSpan(0, this.activeFile.content.length));
            this.verifyClassifications(expected, actual);
        };
        TestState.prototype.verifySyntacticClassifications = function (expected) {
            var actual = this.languageService.getSyntacticClassifications(this.activeFile.fileName, ts.createTextSpan(0, this.activeFile.content.length));
            this.verifyClassifications(expected, actual);
        };
        TestState.prototype.verifyOutliningSpans = function (spans) {
            var actual = this.languageService.getOutliningSpans(this.activeFile.fileName);
            if (actual.length !== spans.length) {
                this.raiseError("verifyOutliningSpans failed - expected total spans to be " + spans.length + ", but was " + actual.length);
            }
            for (var i = 0; i < spans.length; i++) {
                var expectedSpan = spans[i];
                var actualSpan = actual[i];
                if (expectedSpan.start !== actualSpan.textSpan.start || expectedSpan.end !== ts.textSpanEnd(actualSpan.textSpan)) {
                    this.raiseError("verifyOutliningSpans failed - span " + (i + 1) + " expected: (" + expectedSpan.start + "," + expectedSpan.end + "),  actual: (" + actualSpan.textSpan.start + "," + ts.textSpanEnd(actualSpan.textSpan) + ")");
                }
            }
        };
        TestState.prototype.verifyTodoComments = function (descriptors, spans) {
            var actual = this.languageService.getTodoComments(this.activeFile.fileName, descriptors.map(function (d) { return { text: d, priority: 0 }; }));
            if (actual.length !== spans.length) {
                this.raiseError("verifyTodoComments failed - expected total spans to be " + spans.length + ", but was " + actual.length);
            }
            for (var i = 0; i < spans.length; i++) {
                var expectedSpan = spans[i];
                var actualComment = actual[i];
                var actualCommentSpan = ts.createTextSpan(actualComment.position, actualComment.message.length);
                if (expectedSpan.start !== actualCommentSpan.start || expectedSpan.end !== ts.textSpanEnd(actualCommentSpan)) {
                    this.raiseError("verifyOutliningSpans failed - span " + (i + 1) + " expected: (" + expectedSpan.start + "," + expectedSpan.end + "),  actual: (" + actualCommentSpan.start + "," + ts.textSpanEnd(actualCommentSpan) + ")");
                }
            }
        };
        TestState.prototype.verifyDocCommentTemplate = function (expected) {
            var name = "verifyDocCommentTemplate";
            var actual = this.languageService.getDocCommentTemplateAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            if (expected === undefined) {
                if (actual) {
                    this.raiseError(name + " failed - expected no template but got {newText: \"" + actual.newText + "\" caretOffset: " + actual.caretOffset + "}");
                }
                return;
            }
            else {
                if (actual === undefined) {
                    this.raiseError(name + " failed - expected the template {newText: \"" + actual.newText + "\" caretOffset: " + actual.caretOffset + "} but got nothing instead");
                }
                if (actual.newText !== expected.newText) {
                    this.raiseError(name + " failed - expected insertion:\n" + this.clarifyNewlines(expected.newText) + "\nactual insertion:\n" + this.clarifyNewlines(actual.newText));
                }
                if (actual.caretOffset !== expected.caretOffset) {
                    this.raiseError(name + " failed - expected caretOffset: " + expected.caretOffset + ",\nactual caretOffset:" + actual.caretOffset);
                }
            }
        };
        TestState.prototype.clarifyNewlines = function (str) {
            return str.replace(/\r?\n/g, function (lineEnding) {
                var representation = lineEnding === "\r\n" ? "CRLF" : "LF";
                return "# - " + representation + lineEnding;
            });
        };
        TestState.prototype.verifyBraceCompletionAtPosition = function (negative, openingBrace) {
            var openBraceMap = {
                "(": ts.CharacterCodes.openParen,
                "{": ts.CharacterCodes.openBrace,
                "[": ts.CharacterCodes.openBracket,
                "'": ts.CharacterCodes.singleQuote,
                '"': ts.CharacterCodes.doubleQuote,
                "`": ts.CharacterCodes.backtick,
                "<": ts.CharacterCodes.lessThan
            };
            var charCode = openBraceMap[openingBrace];
            if (!charCode) {
                this.raiseError("Invalid openingBrace '" + openingBrace + "' specified.");
            }
            var position = this.currentCaretPosition;
            var validBraceCompletion = this.languageService.isValidBraceCompletionAtPosition(this.activeFile.fileName, position, charCode);
            if (!negative && !validBraceCompletion) {
                this.raiseError(position + " is not a valid brace completion position for " + openingBrace);
            }
            if (negative && validBraceCompletion) {
                this.raiseError(position + " is a valid brace completion position for " + openingBrace);
            }
        };
        TestState.prototype.verifyMatchingBracePosition = function (bracePosition, expectedMatchPosition) {
            var actual = this.languageService.getBraceMatchingAtPosition(this.activeFile.fileName, bracePosition);
            if (actual.length !== 2) {
                this.raiseError("verifyMatchingBracePosition failed - expected result to contain 2 spans, but it had " + actual.length);
            }
            var actualMatchPosition = -1;
            if (bracePosition === actual[0].start) {
                actualMatchPosition = actual[1].start;
            }
            else if (bracePosition === actual[1].start) {
                actualMatchPosition = actual[0].start;
            }
            else {
                this.raiseError("verifyMatchingBracePosition failed - could not find the brace position: " + bracePosition + " in the returned list: (" + actual[0].start + "," + ts.textSpanEnd(actual[0]) + ") and (" + actual[1].start + "," + ts.textSpanEnd(actual[1]) + ")");
            }
            if (actualMatchPosition !== expectedMatchPosition) {
                this.raiseError("verifyMatchingBracePosition failed - expected: " + actualMatchPosition + ",  actual: " + expectedMatchPosition);
            }
        };
        TestState.prototype.verifyNoMatchingBracePosition = function (bracePosition) {
            var actual = this.languageService.getBraceMatchingAtPosition(this.activeFile.fileName, bracePosition);
            if (actual.length !== 0) {
                this.raiseError("verifyNoMatchingBracePosition failed - expected: 0 spans, actual: " + actual.length);
            }
        };
        /*
            Check number of navigationItems which match both searchValue and matchKind.
            Report an error if expected value and actual value do not match.
        */
        TestState.prototype.verifyNavigationItemsCount = function (expected, searchValue, matchKind) {
            var items = this.languageService.getNavigateToItems(searchValue);
            var actual = 0;
            var item;
            // Count only the match that match the same MatchKind
            for (var i = 0; i < items.length; i++) {
                item = items[i];
                if (!matchKind || item.matchKind === matchKind) {
                    actual++;
                }
            }
            if (expected !== actual) {
                this.raiseError("verifyNavigationItemsCount failed - found: " + actual + " navigation items, expected: " + expected + ".");
            }
        };
        /*
            Verify that returned navigationItems from getNavigateToItems have matched searchValue, matchKind, and kind.
            Report an error if getNavigateToItems does not find any matched searchValue.
        */
        TestState.prototype.verifyNavigationItemsListContains = function (name, kind, searchValue, matchKind, fileName, parentName) {
            var items = this.languageService.getNavigateToItems(searchValue);
            if (!items || items.length === 0) {
                this.raiseError("verifyNavigationItemsListContains failed - found 0 navigation items, expected at least one.");
            }
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item && item.name === name && item.kind === kind &&
                    (matchKind === undefined || item.matchKind === matchKind) &&
                    (fileName === undefined || item.fileName === fileName) &&
                    (parentName === undefined || item.containerName === parentName)) {
                    return;
                }
            }
            // if there was an explicit match kind specified, then it should be validated.
            if (matchKind !== undefined) {
                var missingItem = { name: name, kind: kind, searchValue: searchValue, matchKind: matchKind, fileName: fileName, parentName: parentName };
                this.raiseError("verifyNavigationItemsListContains failed - could not find the item: " + stringify(missingItem) + " in the returned list: (" + stringify(items) + ")");
            }
        };
        TestState.prototype.verifyNavigationBar = function (json) {
            var items = this.languageService.getNavigationBarItems(this.activeFile.fileName);
            if (JSON.stringify(items, replacer) !== JSON.stringify(json)) {
                this.raiseError("verifyNavigationBar failed - expected: " + stringify(json) + ", got: " + stringify(items, replacer));
            }
            // Make the data easier to read.
            function replacer(key, value) {
                switch (key) {
                    case "spans":
                        // We won't ever check this.
                        return undefined;
                    case "childItems":
                        return value.length === 0 ? undefined : value;
                    default:
                        // Omit falsy values, those are presumed to be the default.
                        return value || undefined;
                }
            }
        };
        TestState.prototype.printNavigationItems = function (searchValue) {
            var items = this.languageService.getNavigateToItems(searchValue);
            var length = items && items.length;
            Harness.IO.log("NavigationItems list (" + length + " items)");
            for (var i = 0; i < length; i++) {
                var item = items[i];
                Harness.IO.log("name: " + item.name + ", kind: " + item.kind + ", parentName: " + item.containerName + ", fileName: " + item.fileName);
            }
        };
        TestState.prototype.printNavigationBar = function () {
            var items = this.languageService.getNavigationBarItems(this.activeFile.fileName);
            var length = items && items.length;
            Harness.IO.log("Navigation bar (" + length + " items)");
            for (var i = 0; i < length; i++) {
                var item = items[i];
                Harness.IO.log(repeatString(item.indent, " ") + "name: " + item.text + ", kind: " + item.kind + ", childItems: " + item.childItems.map(function (child) { return child.text; }));
            }
        };
        TestState.prototype.getOccurrencesAtCurrentPosition = function () {
            return this.languageService.getOccurrencesAtPosition(this.activeFile.fileName, this.currentCaretPosition);
        };
        TestState.prototype.verifyOccurrencesAtPositionListContains = function (fileName, start, end, isWriteAccess) {
            var occurrences = this.getOccurrencesAtCurrentPosition();
            if (!occurrences || occurrences.length === 0) {
                this.raiseError("verifyOccurrencesAtPositionListContains failed - found 0 references, expected at least one.");
            }
            for (var _i = 0, occurrences_1 = occurrences; _i < occurrences_1.length; _i++) {
                var occurrence = occurrences_1[_i];
                if (occurrence && occurrence.fileName === fileName && occurrence.textSpan.start === start && ts.textSpanEnd(occurrence.textSpan) === end) {
                    if (typeof isWriteAccess !== "undefined" && occurrence.isWriteAccess !== isWriteAccess) {
                        this.raiseError("verifyOccurrencesAtPositionListContains failed - item isWriteAccess value does not match, actual: " + occurrence.isWriteAccess + ", expected: " + isWriteAccess + ".");
                    }
                    return;
                }
            }
            var missingItem = { fileName: fileName, start: start, end: end, isWriteAccess: isWriteAccess };
            this.raiseError("verifyOccurrencesAtPositionListContains failed - could not find the item: " + stringify(missingItem) + " in the returned list: (" + stringify(occurrences) + ")");
        };
        TestState.prototype.verifyOccurrencesAtPositionListCount = function (expectedCount) {
            var occurrences = this.getOccurrencesAtCurrentPosition();
            var actualCount = occurrences ? occurrences.length : 0;
            if (expectedCount !== actualCount) {
                this.raiseError("verifyOccurrencesAtPositionListCount failed - actual: " + actualCount + ", expected:" + expectedCount);
            }
        };
        TestState.prototype.getDocumentHighlightsAtCurrentPosition = function (fileNamesToSearch) {
            var _this = this;
            var filesToSearch = fileNamesToSearch.map(function (name) { return ts.combinePaths(_this.basePath, name); });
            return this.languageService.getDocumentHighlights(this.activeFile.fileName, this.currentCaretPosition, filesToSearch);
        };
        TestState.prototype.verifyDocumentHighlightsAtPositionListContains = function (fileName, start, end, fileNamesToSearch, kind) {
            var documentHighlights = this.getDocumentHighlightsAtCurrentPosition(fileNamesToSearch);
            if (!documentHighlights || documentHighlights.length === 0) {
                this.raiseError("verifyDocumentHighlightsAtPositionListContains failed - found 0 highlights, expected at least one.");
            }
            for (var _i = 0, documentHighlights_1 = documentHighlights; _i < documentHighlights_1.length; _i++) {
                var documentHighlight = documentHighlights_1[_i];
                if (documentHighlight.fileName === fileName) {
                    var highlightSpans = documentHighlight.highlightSpans;
                    for (var _a = 0, highlightSpans_1 = highlightSpans; _a < highlightSpans_1.length; _a++) {
                        var highlight = highlightSpans_1[_a];
                        if (highlight && highlight.textSpan.start === start && ts.textSpanEnd(highlight.textSpan) === end) {
                            if (typeof kind !== "undefined" && highlight.kind !== kind) {
                                this.raiseError("verifyDocumentHighlightsAtPositionListContains failed - item \"kind\" value does not match, actual: " + highlight.kind + ", expected: " + kind + ".");
                            }
                            return;
                        }
                    }
                }
            }
            var missingItem = { fileName: fileName, start: start, end: end, kind: kind };
            this.raiseError("verifyDocumentHighlightsAtPositionListContains failed - could not find the item: " + stringify(missingItem) + " in the returned list: (" + stringify(documentHighlights) + ")");
        };
        TestState.prototype.verifyDocumentHighlightsAtPositionListCount = function (expectedCount, fileNamesToSearch) {
            var documentHighlights = this.getDocumentHighlightsAtCurrentPosition(fileNamesToSearch);
            var actualCount = documentHighlights
                ? documentHighlights.reduce(function (currentCount, _a) {
                    var highlightSpans = _a.highlightSpans;
                    return currentCount + highlightSpans.length;
                }, 0)
                : 0;
            if (expectedCount !== actualCount) {
                this.raiseError("verifyDocumentHighlightsAtPositionListCount failed - actual: " + actualCount + ", expected:" + expectedCount);
            }
        };
        // Get the text of the entire line the caret is currently at
        TestState.prototype.getCurrentLineContent = function () {
            var text = this.getFileContent(this.activeFile.fileName);
            var pos = this.currentCaretPosition;
            var startPos = pos, endPos = pos;
            while (startPos > 0) {
                var ch = text.charCodeAt(startPos - 1);
                if (ch === ts.CharacterCodes.carriageReturn || ch === ts.CharacterCodes.lineFeed) {
                    break;
                }
                startPos--;
            }
            while (endPos < text.length) {
                var ch = text.charCodeAt(endPos);
                if (ch === ts.CharacterCodes.carriageReturn || ch === ts.CharacterCodes.lineFeed) {
                    break;
                }
                endPos++;
            }
            return text.substring(startPos, endPos);
        };
        TestState.prototype.assertItemInCompletionList = function (items, name, text, documentation, kind) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.name === name) {
                    if (documentation != undefined || text !== undefined) {
                        var details = this.getCompletionEntryDetails(item.name);
                        if (documentation !== undefined) {
                            assert.equal(ts.displayPartsToString(details.documentation), documentation, this.assertionMessageAtLastKnownMarker("completion item documentation for " + name));
                        }
                        if (text !== undefined) {
                            assert.equal(ts.displayPartsToString(details.displayParts), text, this.assertionMessageAtLastKnownMarker("completion item detail text for " + name));
                        }
                    }
                    if (kind !== undefined) {
                        assert.equal(item.kind, kind, this.assertionMessageAtLastKnownMarker("completion item kind for " + name));
                    }
                    return;
                }
            }
            var itemsString = items.map(function (item) { return stringify({ name: item.name, kind: item.kind }); }).join(",\n");
            this.raiseError("Expected \"" + stringify({ name: name, text: text, documentation: documentation, kind: kind }) + "\" to be in list [" + itemsString + "]");
        };
        TestState.prototype.findFile = function (indexOrName) {
            var result;
            if (typeof indexOrName === "number") {
                var index = indexOrName;
                if (index >= this.testData.files.length) {
                    throw new Error("File index (" + index + ") in openFile was out of range. There are only " + this.testData.files.length + " files in this test.");
                }
                else {
                    result = this.testData.files[index];
                }
            }
            else if (typeof indexOrName === "string") {
                var name_1 = indexOrName;
                // names are stored in the compiler with this relative path, this allows people to use goTo.file on just the fileName
                name_1 = name_1.indexOf("/") === -1 ? (this.basePath + "/" + name_1) : name_1;
                var availableNames = [];
                var foundIt = false;
                for (var i = 0; i < this.testData.files.length; i++) {
                    var fn = this.testData.files[i].fileName;
                    if (fn) {
                        if (fn === name_1) {
                            result = this.testData.files[i];
                            foundIt = true;
                            break;
                        }
                        availableNames.push(fn);
                    }
                }
                if (!foundIt) {
                    throw new Error("No test file named \"" + name_1 + "\" exists. Available file names are: " + availableNames.join(", "));
                }
            }
            else {
                throw new Error("Unknown argument type");
            }
            return result;
        };
        TestState.prototype.getLineColStringAtPosition = function (position) {
            var pos = this.languageServiceAdapterHost.positionToLineAndCharacter(this.activeFile.fileName, position);
            return "line " + (pos.line + 1) + ", col " + pos.character;
        };
        TestState.prototype.getMarkerByName = function (markerName) {
            var markerPos = this.testData.markerPositions[markerName];
            if (markerPos === undefined) {
                var markerNames = [];
                for (var m in this.testData.markerPositions)
                    markerNames.push(m);
                throw new Error("Unknown marker \"" + markerName + "\" Available markers: " + markerNames.map(function (m) { return "\"" + m + "\""; }).join(", "));
            }
            else {
                return markerPos;
            }
        };
        TestState.makeWhitespaceVisible = function (text) {
            return text.replace(/ /g, "\u00B7").replace(/\r/g, "\u00B6").replace(/\n/g, "\u2193\n").replace(/\t/g, "\u2192\   ");
        };
        TestState.prototype.setCancelled = function (numberOfCalls) {
            this.cancellationToken.setCancelled(numberOfCalls);
        };
        TestState.prototype.resetCancelled = function () {
            this.cancellationToken.resetCancelled();
        };
        return TestState;
    }());
    FourSlash.TestState = TestState;
    function runFourSlashTest(basePath, testType, fileName) {
        var content = Harness.IO.readFile(fileName);
        runFourSlashTestContent(basePath, testType, content, fileName);
    }
    FourSlash.runFourSlashTest = runFourSlashTest;
    function runFourSlashTestContent(basePath, testType, content, fileName) {
        // Parse out the files and their metadata
        var testData = parseTestData(basePath, content, fileName);
        var state = new TestState(basePath, testType, testData);
        var result = "";
        var fourslashFile = {
            unitName: Harness.Compiler.fourslashFileName,
            content: undefined,
        };
        var testFile = {
            unitName: fileName,
            content: content
        };
        var host = Harness.Compiler.createCompilerHost([fourslashFile, testFile], function (fn, contents) { return result = contents; }, 2 /* Latest */, Harness.IO.useCaseSensitiveFileNames(), Harness.IO.getCurrentDirectory());
        var program = ts.createProgram([Harness.Compiler.fourslashFileName, fileName], { outFile: "fourslashTestOutput.js", noResolve: true, target: 0 /* ES3 */ }, host);
        var sourceFile = host.getSourceFile(fileName, 0 /* ES3 */);
        var diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);
        if (diagnostics.length > 0) {
            throw new Error(("Error compiling " + fileName + ": ") +
                diagnostics.map(function (e) { return ts.flattenDiagnosticMessageText(e.messageText, Harness.IO.newLine()); }).join("\r\n"));
        }
        program.emit(sourceFile);
        ts.Debug.assert(!!result);
        runCode(result, state);
    }
    FourSlash.runFourSlashTestContent = runFourSlashTestContent;
    function runCode(code, state) {
        // Compile and execute the test
        var wrappedCode = "(function(test, goTo, verify, edit, debug, format, cancellation, classification, verifyOperationIsCancelled) {\n" + code + "\n})";
        try {
            var test = new FourSlashInterface.Test(state);
            var goTo = new FourSlashInterface.GoTo(state);
            var verify = new FourSlashInterface.Verify(state);
            var edit = new FourSlashInterface.Edit(state);
            var debug = new FourSlashInterface.Debug(state);
            var format = new FourSlashInterface.Format(state);
            var cancellation = new FourSlashInterface.Cancellation(state);
            var f = eval(wrappedCode);
            f(test, goTo, verify, edit, debug, format, cancellation, FourSlashInterface.Classification, FourSlash.verifyOperationIsCancelled);
        }
        catch (err) {
            // Debugging: FourSlash.currentTestState.printCurrentFileState();
            throw err;
        }
    }
    function chompLeadingSpace(content) {
        var lines = content.split("\n");
        for (var i = 0; i < lines.length; i++) {
            if ((lines[i].length !== 0) && (lines[i].charAt(0) !== " ")) {
                return content;
            }
        }
        return lines.map(function (s) { return s.substr(1); }).join("\n");
    }
    function parseTestData(basePath, contents, fileName) {
        // Regex for parsing options in the format "@Alpha: Value of any sort"
        var optionRegex = /^\s*@(\w+): (.*)\s*/;
        // List of all the subfiles we've parsed out
        var files = [];
        // Global options
        var globalOptions = {};
        // Marker positions
        // Split up the input file by line
        // Note: IE JS engine incorrectly handles consecutive delimiters here when using RegExp split, so
        // we have to string-based splitting instead and try to figure out the delimiting chars
        var lines = contents.split("\n");
        var markerPositions = {};
        var markers = [];
        var ranges = [];
        // Stuff related to the subfile we're parsing
        var currentFileContent = undefined;
        var currentFileName = fileName;
        var currentFileOptions = {};
        function resetLocalData() {
            currentFileContent = undefined;
            currentFileOptions = {};
            currentFileName = fileName;
        }
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var lineLength = line.length;
            if (lineLength > 0 && line.charAt(lineLength - 1) === "\r") {
                line = line.substr(0, lineLength - 1);
            }
            if (line.substr(0, 4) === "////") {
                // Subfile content line
                // Append to the current subfile content, inserting a newline needed
                if (currentFileContent === undefined) {
                    currentFileContent = "";
                }
                else {
                    // End-of-line
                    currentFileContent = currentFileContent + "\n";
                }
                currentFileContent = currentFileContent + line.substr(4);
            }
            else if (line.substr(0, 2) === "//") {
                // Comment line, check for global/file @options and record them
                var match = optionRegex.exec(line.substr(2));
                if (match) {
                    var fileMetadataNamesIndex = fileMetadataNames.indexOf(match[1]);
                    if (fileMetadataNamesIndex === -1) {
                        // Check if the match is already existed in the global options
                        if (globalOptions[match[1]] !== undefined) {
                            throw new Error("Global Option : '" + match[1] + "' is already existed");
                        }
                        globalOptions[match[1]] = match[2];
                    }
                    else {
                        if (fileMetadataNamesIndex === fileMetadataNames.indexOf(metadataOptionNames.fileName)) {
                            // Found an @FileName directive, if this is not the first then create a new subfile
                            if (currentFileContent) {
                                var file = parseFileContent(currentFileContent, currentFileName, markerPositions, markers, ranges);
                                file.fileOptions = currentFileOptions;
                                // Store result file
                                files.push(file);
                                resetLocalData();
                            }
                            currentFileName = basePath + "/" + match[2];
                            currentFileOptions[match[1]] = match[2];
                        }
                        else {
                            // Add other fileMetadata flag
                            currentFileOptions[match[1]] = match[2];
                        }
                    }
                }
            }
            else if (line == "" || lineLength === 0) {
            }
            else {
                // Empty line or code line, terminate current subfile if there is one
                if (currentFileContent) {
                    var file = parseFileContent(currentFileContent, currentFileName, markerPositions, markers, ranges);
                    file.fileOptions = currentFileOptions;
                    // Store result file
                    files.push(file);
                    resetLocalData();
                }
            }
        }
        // @Filename is the only directive that can be used in a test that contains tsconfig.json file.
        if (containTSConfigJson(files)) {
            var directive = getNonFileNameOptionInFileList(files);
            if (!directive) {
                directive = getNonFileNameOptionInObject(globalOptions);
            }
            if (directive) {
                throw Error("It is not allowed to use tsconfig.json along with directive '" + directive + "'");
            }
        }
        return {
            markerPositions: markerPositions,
            markers: markers,
            globalOptions: globalOptions,
            files: files,
            ranges: ranges
        };
    }
    function containTSConfigJson(files) {
        return ts.forEach(files, function (f) { return f.fileOptions["Filename"] === "tsconfig.json"; });
    }
    function getNonFileNameOptionInFileList(files) {
        return ts.forEach(files, function (f) { return getNonFileNameOptionInObject(f.fileOptions); });
    }
    function getNonFileNameOptionInObject(optionObject) {
        for (var option in optionObject) {
            if (option !== metadataOptionNames.fileName) {
                return option;
            }
        }
        return undefined;
    }
    function reportError(fileName, line, col, message) {
        var errorMessage = fileName + "(" + line + "," + col + "): " + message;
        throw new Error(errorMessage);
    }
    function recordObjectMarker(fileName, location, text, markerMap, markers) {
        var markerValue = undefined;
        try {
            // Attempt to parse the marker value as JSON
            markerValue = JSON.parse("{ " + text + " }");
        }
        catch (e) {
            reportError(fileName, location.sourceLine, location.sourceColumn, "Unable to parse marker text " + e.message);
        }
        if (markerValue === undefined) {
            reportError(fileName, location.sourceLine, location.sourceColumn, "Object markers can not be empty");
            return undefined;
        }
        var marker = {
            fileName: fileName,
            position: location.position,
            data: markerValue
        };
        // Object markers can be anonymous
        if (markerValue.name) {
            markerMap[markerValue.name] = marker;
        }
        markers.push(marker);
        return marker;
    }
    function recordMarker(fileName, location, name, markerMap, markers) {
        var marker = {
            fileName: fileName,
            position: location.position
        };
        // Verify markers for uniqueness
        if (markerMap[name] !== undefined) {
            var message = "Marker '" + name + "' is duplicated in the source file contents.";
            reportError(marker.fileName, location.sourceLine, location.sourceColumn, message);
            return undefined;
        }
        else {
            markerMap[name] = marker;
            markers.push(marker);
            return marker;
        }
    }
    function parseFileContent(content, fileName, markerMap, markers, ranges) {
        content = chompLeadingSpace(content);
        // Any slash-star comment with a character not in this string is not a marker.
        var validMarkerChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$1234567890_";
        /// The file content (minus metacharacters) so far
        var output = "";
        /// The current marker (or maybe multi-line comment?) we're parsing, possibly
        var openMarker = undefined;
        /// A stack of the open range markers that are still unclosed
        var openRanges = [];
        /// A list of ranges we've collected so far */
        var localRanges = [];
        /// The latest position of the start of an unflushed plain text area
        var lastNormalCharPosition = 0;
        /// The total number of metacharacters removed from the file (so far)
        var difference = 0;
        /// The fourslash file state object we are generating
        var state = 0 /* none */;
        /// Current position data
        var line = 1;
        var column = 1;
        var flush = function (lastSafeCharIndex) {
            if (lastSafeCharIndex === undefined) {
                output = output + content.substr(lastNormalCharPosition);
            }
            else {
                output = output + content.substr(lastNormalCharPosition, lastSafeCharIndex - lastNormalCharPosition);
            }
        };
        if (content.length > 0) {
            var previousChar = content.charAt(0);
            for (var i = 1; i < content.length; i++) {
                var currentChar = content.charAt(i);
                switch (state) {
                    case 0 /* none */:
                        if (previousChar === "[" && currentChar === "|") {
                            // found a range start
                            openRanges.push({
                                position: (i - 1) - difference,
                                sourcePosition: i - 1,
                                sourceLine: line,
                                sourceColumn: column,
                            });
                            // copy all text up to marker position
                            flush(i - 1);
                            lastNormalCharPosition = i + 1;
                            difference += 2;
                        }
                        else if (previousChar === "|" && currentChar === "]") {
                            // found a range end
                            var rangeStart = openRanges.pop();
                            if (!rangeStart) {
                                reportError(fileName, line, column, "Found range end with no matching start.");
                            }
                            var range = {
                                fileName: fileName,
                                start: rangeStart.position,
                                end: (i - 1) - difference,
                                marker: rangeStart.marker
                            };
                            localRanges.push(range);
                            // copy all text up to range marker position
                            flush(i - 1);
                            lastNormalCharPosition = i + 1;
                            difference += 2;
                        }
                        else if (previousChar === "/" && currentChar === "*") {
                            // found a possible marker start
                            state = 1 /* inSlashStarMarker */;
                            openMarker = {
                                position: (i - 1) - difference,
                                sourcePosition: i - 1,
                                sourceLine: line,
                                sourceColumn: column,
                            };
                        }
                        else if (previousChar === "{" && currentChar === "|") {
                            // found an object marker start
                            state = 2 /* inObjectMarker */;
                            openMarker = {
                                position: (i - 1) - difference,
                                sourcePosition: i - 1,
                                sourceLine: line,
                                sourceColumn: column,
                            };
                            flush(i - 1);
                        }
                        break;
                    case 2 /* inObjectMarker */:
                        // Object markers are only ever terminated by |} and have no content restrictions
                        if (previousChar === "|" && currentChar === "}") {
                            // Record the marker
                            var objectMarkerNameText = content.substring(openMarker.sourcePosition + 2, i - 1).trim();
                            var marker = recordObjectMarker(fileName, openMarker, objectMarkerNameText, markerMap, markers);
                            if (openRanges.length > 0) {
                                openRanges[openRanges.length - 1].marker = marker;
                            }
                            // Set the current start to point to the end of the current marker to ignore its text
                            lastNormalCharPosition = i + 1;
                            difference += i + 1 - openMarker.sourcePosition;
                            // Reset the state
                            openMarker = undefined;
                            state = 0 /* none */;
                        }
                        break;
                    case 1 /* inSlashStarMarker */:
                        if (previousChar === "*" && currentChar === "/") {
                            // Record the marker
                            // start + 2 to ignore the */, -1 on the end to ignore the * (/ is next)
                            var markerNameText = content.substring(openMarker.sourcePosition + 2, i - 1).trim();
                            var marker = recordMarker(fileName, openMarker, markerNameText, markerMap, markers);
                            if (openRanges.length > 0) {
                                openRanges[openRanges.length - 1].marker = marker;
                            }
                            // Set the current start to point to the end of the current marker to ignore its text
                            flush(openMarker.sourcePosition);
                            lastNormalCharPosition = i + 1;
                            difference += i + 1 - openMarker.sourcePosition;
                            // Reset the state
                            openMarker = undefined;
                            state = 0 /* none */;
                        }
                        else if (validMarkerChars.indexOf(currentChar) < 0) {
                            if (currentChar === "*" && i < content.length - 1 && content.charAt(i + 1) === "/") {
                            }
                            else {
                                // We've hit a non-valid marker character, so we were actually in a block comment
                                // Bail out the text we've gathered so far back into the output
                                flush(i);
                                lastNormalCharPosition = i;
                                openMarker = undefined;
                                state = 0 /* none */;
                            }
                        }
                        break;
                }
                if (currentChar === "\n" && previousChar === "\r") {
                    // Ignore trailing \n after a \r
                    continue;
                }
                else if (currentChar === "\n" || currentChar === "\r") {
                    line++;
                    column = 1;
                    continue;
                }
                column++;
                previousChar = currentChar;
            }
        }
        // Add the remaining text
        flush(undefined);
        if (openRanges.length > 0) {
            var openRange = openRanges[0];
            reportError(fileName, openRange.sourceLine, openRange.sourceColumn, "Unterminated range.");
        }
        if (openMarker) {
            reportError(fileName, openMarker.sourceLine, openMarker.sourceColumn, "Unterminated marker.");
        }
        // put ranges in the correct order
        localRanges = localRanges.sort(function (a, b) { return a.start < b.start ? -1 : 1; });
        localRanges.forEach(function (r) { ranges.push(r); });
        return {
            content: output,
            fileOptions: {},
            version: 0,
            fileName: fileName
        };
    }
    function repeatString(count, char) {
        var result = "";
        for (var i = 0; i < count; i++) {
            result += char;
        }
        return result;
    }
    function stringify(data, replacer) {
        return JSON.stringify(data, replacer, 2);
    }
})(FourSlash || (FourSlash = {}));
var FourSlashInterface;
(function (FourSlashInterface) {
    var Test = (function () {
        function Test(state) {
            this.state = state;
        }
        Test.prototype.markers = function () {
            return this.state.getMarkers();
        };
        Test.prototype.marker = function (name) {
            return this.state.getMarkerByName(name);
        };
        Test.prototype.ranges = function () {
            return this.state.getRanges();
        };
        Test.prototype.rangesByText = function () {
            return this.state.rangesByText();
        };
        Test.prototype.markerByName = function (s) {
            return this.state.getMarkerByName(s);
        };
        return Test;
    }());
    FourSlashInterface.Test = Test;
    var GoTo = (function () {
        function GoTo(state) {
            this.state = state;
        }
        // Moves the caret to the specified marker,
        // or the anonymous marker ('/**/') if no name
        // is given
        GoTo.prototype.marker = function (name) {
            this.state.goToMarker(name);
        };
        GoTo.prototype.bof = function () {
            this.state.goToBOF();
        };
        GoTo.prototype.eof = function () {
            this.state.goToEOF();
        };
        GoTo.prototype.definition = function (definitionIndex) {
            if (definitionIndex === void 0) { definitionIndex = 0; }
            this.state.goToDefinition(definitionIndex);
        };
        GoTo.prototype.type = function (definitionIndex) {
            if (definitionIndex === void 0) { definitionIndex = 0; }
            this.state.goToTypeDefinition(definitionIndex);
        };
        GoTo.prototype.position = function (position, fileNameOrIndex) {
            if (fileNameOrIndex !== undefined) {
                this.file(fileNameOrIndex);
            }
            this.state.goToPosition(position);
        };
        GoTo.prototype.file = function (indexOrName, content, scriptKindName) {
            this.state.openFile(indexOrName, content, scriptKindName);
        };
        return GoTo;
    }());
    FourSlashInterface.GoTo = GoTo;
    var VerifyNegatable = (function () {
        function VerifyNegatable(state, negative) {
            if (negative === void 0) { negative = false; }
            this.state = state;
            this.negative = negative;
            if (!negative) {
                this.not = new VerifyNegatable(state, true);
            }
        }
        // Verifies the member list contains the specified symbol. The
        // member list is brought up if necessary
        VerifyNegatable.prototype.memberListContains = function (symbol, text, documentation, kind) {
            if (this.negative) {
                this.state.verifyMemberListDoesNotContain(symbol);
            }
            else {
                this.state.verifyMemberListContains(symbol, text, documentation, kind);
            }
        };
        VerifyNegatable.prototype.memberListCount = function (expectedCount) {
            this.state.verifyMemberListCount(expectedCount, this.negative);
        };
        // Verifies the completion list contains the specified symbol. The
        // completion list is brought up if necessary
        VerifyNegatable.prototype.completionListContains = function (symbol, text, documentation, kind) {
            if (this.negative) {
                this.state.verifyCompletionListDoesNotContain(symbol, text, documentation, kind);
            }
            else {
                this.state.verifyCompletionListContains(symbol, text, documentation, kind);
            }
        };
        // Verifies the completion list items count to be greater than the specified amount. The
        // completion list is brought up if necessary
        VerifyNegatable.prototype.completionListItemsCountIsGreaterThan = function (count) {
            this.state.verifyCompletionListItemsCountIsGreaterThan(count, this.negative);
        };
        VerifyNegatable.prototype.assertHasRanges = function (ranges) {
            assert(ranges.length !== 0, "Array of ranges is expected to be non-empty");
        };
        VerifyNegatable.prototype.completionListIsEmpty = function () {
            this.state.verifyCompletionListIsEmpty(this.negative);
        };
        VerifyNegatable.prototype.completionListAllowsNewIdentifier = function () {
            this.state.verifyCompletionListAllowsNewIdentifier(this.negative);
        };
        VerifyNegatable.prototype.memberListIsEmpty = function () {
            this.state.verifyMemberListIsEmpty(this.negative);
        };
        VerifyNegatable.prototype.signatureHelpPresent = function () {
            this.state.verifySignatureHelpPresent(!this.negative);
        };
        VerifyNegatable.prototype.errorExistsBetweenMarkers = function (startMarker, endMarker) {
            this.state.verifyErrorExistsBetweenMarkers(startMarker, endMarker, !this.negative);
        };
        VerifyNegatable.prototype.errorExistsAfterMarker = function (markerName) {
            if (markerName === void 0) { markerName = ""; }
            this.state.verifyErrorExistsAfterMarker(markerName, !this.negative, /*after*/ true);
        };
        VerifyNegatable.prototype.errorExistsBeforeMarker = function (markerName) {
            if (markerName === void 0) { markerName = ""; }
            this.state.verifyErrorExistsAfterMarker(markerName, !this.negative, /*after*/ false);
        };
        VerifyNegatable.prototype.quickInfoIs = function (expectedText, expectedDocumentation) {
            this.state.verifyQuickInfoString(this.negative, expectedText, expectedDocumentation);
        };
        VerifyNegatable.prototype.quickInfoExists = function () {
            this.state.verifyQuickInfoExists(this.negative);
        };
        VerifyNegatable.prototype.definitionCountIs = function (expectedCount) {
            this.state.verifyDefinitionsCount(this.negative, expectedCount);
        };
        VerifyNegatable.prototype.typeDefinitionCountIs = function (expectedCount) {
            this.state.verifyTypeDefinitionsCount(this.negative, expectedCount);
        };
        VerifyNegatable.prototype.definitionLocationExists = function () {
            this.state.verifyDefinitionLocationExists(this.negative);
        };
        VerifyNegatable.prototype.verifyDefinitionsName = function (name, containerName) {
            this.state.verifyDefinitionsName(this.negative, name, containerName);
        };
        VerifyNegatable.prototype.isValidBraceCompletionAtPosition = function (openingBrace) {
            this.state.verifyBraceCompletionAtPosition(this.negative, openingBrace);
        };
        return VerifyNegatable;
    }());
    FourSlashInterface.VerifyNegatable = VerifyNegatable;
    var Verify = (function (_super) {
        __extends(Verify, _super);
        function Verify(state) {
            _super.call(this, state);
        }
        Verify.prototype.caretAtMarker = function (markerName) {
            this.state.verifyCaretAtMarker(markerName);
        };
        Verify.prototype.indentationIs = function (numberOfSpaces) {
            this.state.verifyIndentationAtCurrentPosition(numberOfSpaces);
        };
        Verify.prototype.indentationAtPositionIs = function (fileName, position, numberOfSpaces, indentStyle, baseIndentSize) {
            if (indentStyle === void 0) { indentStyle = ts.IndentStyle.Smart; }
            if (baseIndentSize === void 0) { baseIndentSize = 0; }
            this.state.verifyIndentationAtPosition(fileName, position, numberOfSpaces, indentStyle, baseIndentSize);
        };
        Verify.prototype.textAtCaretIs = function (text) {
            this.state.verifyTextAtCaretIs(text);
        };
        /**
         * Compiles the current file and evaluates 'expr' in a context containing
         * the emitted output, then compares (using ===) the result of that expression
         * to 'value'. Do not use this function with external modules as it is not supported.
         */
        Verify.prototype.eval = function (expr, value) {
            this.state.verifyEval(expr, value);
        };
        Verify.prototype.currentLineContentIs = function (text) {
            this.state.verifyCurrentLineContent(text);
        };
        Verify.prototype.currentFileContentIs = function (text) {
            this.state.verifyCurrentFileContent(text);
        };
        Verify.prototype.verifyGetEmitOutputForCurrentFile = function (expected) {
            this.state.verifyGetEmitOutputForCurrentFile(expected);
        };
        Verify.prototype.verifyGetEmitOutputContentsForCurrentFile = function (expected) {
            this.state.verifyGetEmitOutputContentsForCurrentFile(expected);
        };
        Verify.prototype.referencesAre = function (ranges) {
            this.state.verifyReferencesAre(ranges);
        };
        Verify.prototype.referencesOf = function (start, references) {
            this.state.verifyReferencesOf(start, references);
        };
        Verify.prototype.rangesReferenceEachOther = function (ranges) {
            this.state.verifyRangesReferenceEachOther(ranges);
        };
        Verify.prototype.rangesWithSameTextReferenceEachOther = function () {
            this.state.verifyRangesWithSameTextReferenceEachOther();
        };
        Verify.prototype.currentParameterHelpArgumentNameIs = function (name) {
            this.state.verifyCurrentParameterHelpName(name);
        };
        Verify.prototype.currentParameterSpanIs = function (parameter) {
            this.state.verifyCurrentParameterSpanIs(parameter);
        };
        Verify.prototype.currentParameterHelpArgumentDocCommentIs = function (docComment) {
            this.state.verifyCurrentParameterHelpDocComment(docComment);
        };
        Verify.prototype.currentSignatureHelpDocCommentIs = function (docComment) {
            this.state.verifyCurrentSignatureHelpDocComment(docComment);
        };
        Verify.prototype.signatureHelpCountIs = function (expected) {
            this.state.verifySignatureHelpCount(expected);
        };
        Verify.prototype.signatureHelpArgumentCountIs = function (expected) {
            this.state.verifySignatureHelpArgumentCount(expected);
        };
        Verify.prototype.currentSignatureParameterCountIs = function (expected) {
            this.state.verifyCurrentSignatureHelpParameterCount(expected);
        };
        Verify.prototype.currentSignatureHelpIs = function (expected) {
            this.state.verifyCurrentSignatureHelpIs(expected);
        };
        Verify.prototype.numberOfErrorsInCurrentFile = function (expected) {
            this.state.verifyNumberOfErrorsInCurrentFile(expected);
        };
        Verify.prototype.baselineCurrentFileBreakpointLocations = function () {
            this.state.baselineCurrentFileBreakpointLocations();
        };
        Verify.prototype.baselineCurrentFileNameOrDottedNameSpans = function () {
            this.state.baselineCurrentFileNameOrDottedNameSpans();
        };
        Verify.prototype.baselineGetEmitOutput = function () {
            this.state.baselineGetEmitOutput();
        };
        Verify.prototype.nameOrDottedNameSpanTextIs = function (text) {
            this.state.verifyCurrentNameOrDottedNameSpanText(text);
        };
        Verify.prototype.outliningSpansInCurrentFile = function (spans) {
            this.state.verifyOutliningSpans(spans);
        };
        Verify.prototype.todoCommentsInCurrentFile = function (descriptors) {
            this.state.verifyTodoComments(descriptors, this.state.getRanges());
        };
        Verify.prototype.matchingBracePositionInCurrentFile = function (bracePosition, expectedMatchPosition) {
            this.state.verifyMatchingBracePosition(bracePosition, expectedMatchPosition);
        };
        Verify.prototype.noMatchingBracePositionInCurrentFile = function (bracePosition) {
            this.state.verifyNoMatchingBracePosition(bracePosition);
        };
        Verify.prototype.DocCommentTemplate = function (expectedText, expectedOffset, empty) {
            this.state.verifyDocCommentTemplate(empty ? undefined : { newText: expectedText, caretOffset: expectedOffset });
        };
        Verify.prototype.noDocCommentTemplate = function () {
            this.DocCommentTemplate(/*expectedText*/ undefined, /*expectedOffset*/ undefined, /*empty*/ true);
        };
        Verify.prototype.navigationBar = function (json) {
            this.state.verifyNavigationBar(json);
        };
        Verify.prototype.navigationItemsListCount = function (count, searchValue, matchKind) {
            this.state.verifyNavigationItemsCount(count, searchValue, matchKind);
        };
        Verify.prototype.navigationItemsListContains = function (name, kind, searchValue, matchKind, fileName, parentName) {
            this.state.verifyNavigationItemsListContains(name, kind, searchValue, matchKind, fileName, parentName);
        };
        Verify.prototype.occurrencesAtPositionContains = function (range, isWriteAccess) {
            this.state.verifyOccurrencesAtPositionListContains(range.fileName, range.start, range.end, isWriteAccess);
        };
        Verify.prototype.occurrencesAtPositionCount = function (expectedCount) {
            this.state.verifyOccurrencesAtPositionListCount(expectedCount);
        };
        Verify.prototype.documentHighlightsAtPositionContains = function (range, fileNamesToSearch, kind) {
            this.state.verifyDocumentHighlightsAtPositionListContains(range.fileName, range.start, range.end, fileNamesToSearch, kind);
        };
        Verify.prototype.documentHighlightsAtPositionCount = function (expectedCount, fileNamesToSearch) {
            this.state.verifyDocumentHighlightsAtPositionListCount(expectedCount, fileNamesToSearch);
        };
        Verify.prototype.completionEntryDetailIs = function (entryName, text, documentation, kind) {
            this.state.verifyCompletionEntryDetails(entryName, text, documentation, kind);
        };
        /**
         * This method *requires* a contiguous, complete, and ordered stream of classifications for a file.
         */
        Verify.prototype.syntacticClassificationsAre = function () {
            var classifications = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                classifications[_i - 0] = arguments[_i];
            }
            this.state.verifySyntacticClassifications(classifications);
        };
        /**
         * This method *requires* an ordered stream of classifications for a file, and spans are highly recommended.
         */
        Verify.prototype.semanticClassificationsAre = function () {
            var classifications = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                classifications[_i - 0] = arguments[_i];
            }
            this.state.verifySemanticClassifications(classifications);
        };
        Verify.prototype.renameInfoSucceeded = function (displayName, fullDisplayName, kind, kindModifiers) {
            this.state.verifyRenameInfoSucceeded(displayName, fullDisplayName, kind, kindModifiers);
        };
        Verify.prototype.renameInfoFailed = function (message) {
            this.state.verifyRenameInfoFailed(message);
        };
        Verify.prototype.renameLocations = function (findInStrings, findInComments, ranges) {
            this.state.verifyRenameLocations(findInStrings, findInComments, ranges);
        };
        Verify.prototype.verifyQuickInfoDisplayParts = function (kind, kindModifiers, textSpan, displayParts, documentation) {
            this.state.verifyQuickInfoDisplayParts(kind, kindModifiers, textSpan, displayParts, documentation);
        };
        Verify.prototype.getSyntacticDiagnostics = function (expected) {
            this.state.getSyntacticDiagnostics(expected);
        };
        Verify.prototype.getSemanticDiagnostics = function (expected) {
            this.state.getSemanticDiagnostics(expected);
        };
        Verify.prototype.ProjectInfo = function (expected) {
            this.state.verifyProjectInfo(expected);
        };
        return Verify;
    }(VerifyNegatable));
    FourSlashInterface.Verify = Verify;
    var Edit = (function () {
        function Edit(state) {
            this.state = state;
        }
        Edit.prototype.backspace = function (count) {
            this.state.deleteCharBehindMarker(count);
        };
        Edit.prototype.deleteAtCaret = function (times) {
            this.state.deleteChar(times);
        };
        Edit.prototype.replace = function (start, length, text) {
            this.state.replace(start, length, text);
        };
        Edit.prototype.paste = function (text) {
            this.state.paste(text);
        };
        Edit.prototype.insert = function (text) {
            this.insertLines(text);
        };
        Edit.prototype.insertLine = function (text) {
            this.insertLines(text + "\n");
        };
        Edit.prototype.insertLines = function () {
            var lines = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                lines[_i - 0] = arguments[_i];
            }
            this.state.type(lines.join("\n"));
        };
        Edit.prototype.moveRight = function (count) {
            this.state.moveCaretRight(count);
        };
        Edit.prototype.moveLeft = function (count) {
            if (typeof count === "undefined") {
                count = 1;
            }
            this.state.moveCaretRight(count * -1);
        };
        Edit.prototype.enableFormatting = function () {
            this.state.enableFormatting = true;
        };
        Edit.prototype.disableFormatting = function () {
            this.state.enableFormatting = false;
        };
        return Edit;
    }());
    FourSlashInterface.Edit = Edit;
    var Debug = (function () {
        function Debug(state) {
            this.state = state;
        }
        Debug.prototype.printCurrentParameterHelp = function () {
            this.state.printCurrentParameterHelp();
        };
        Debug.prototype.printCurrentFileState = function () {
            this.state.printCurrentFileState();
        };
        Debug.prototype.printCurrentFileStateWithWhitespace = function () {
            this.state.printCurrentFileState(/*makeWhitespaceVisible*/ true);
        };
        Debug.prototype.printCurrentFileStateWithoutCaret = function () {
            this.state.printCurrentFileState(/*makeWhitespaceVisible*/ false, /*makeCaretVisible*/ false);
        };
        Debug.prototype.printCurrentQuickInfo = function () {
            this.state.printCurrentQuickInfo();
        };
        Debug.prototype.printCurrentSignatureHelp = function () {
            this.state.printCurrentSignatureHelp();
        };
        Debug.prototype.printMemberListMembers = function () {
            this.state.printMemberListMembers();
        };
        Debug.prototype.printCompletionListMembers = function () {
            this.state.printCompletionListMembers();
        };
        Debug.prototype.printBreakpointLocation = function (pos) {
            this.state.printBreakpointLocation(pos);
        };
        Debug.prototype.printBreakpointAtCurrentLocation = function () {
            this.state.printBreakpointAtCurrentLocation();
        };
        Debug.prototype.printNameOrDottedNameSpans = function (pos) {
            this.state.printNameOrDottedNameSpans(pos);
        };
        Debug.prototype.printErrorList = function () {
            this.state.printErrorList();
        };
        Debug.prototype.printNavigationItems = function (searchValue) {
            if (searchValue === void 0) { searchValue = ".*"; }
            this.state.printNavigationItems(searchValue);
        };
        Debug.prototype.printNavigationBar = function () {
            this.state.printNavigationBar();
        };
        Debug.prototype.printReferences = function () {
            this.state.printReferences();
        };
        Debug.prototype.printContext = function () {
            this.state.printContext();
        };
        return Debug;
    }());
    FourSlashInterface.Debug = Debug;
    var Format = (function () {
        function Format(state) {
            this.state = state;
        }
        Format.prototype.document = function () {
            this.state.formatDocument();
        };
        Format.prototype.copyFormatOptions = function () {
            return this.state.copyFormatOptions();
        };
        Format.prototype.setFormatOptions = function (options) {
            return this.state.setFormatOptions(options);
        };
        Format.prototype.selection = function (startMarker, endMarker) {
            this.state.formatSelection(this.state.getMarkerByName(startMarker).position, this.state.getMarkerByName(endMarker).position);
        };
        Format.prototype.onType = function (posMarker, key) {
            this.state.formatOnType(this.state.getMarkerByName(posMarker).position, key);
        };
        Format.prototype.setOption = function (name, value) {
            this.state.formatCodeOptions[name] = value;
        };
        return Format;
    }());
    FourSlashInterface.Format = Format;
    var Cancellation = (function () {
        function Cancellation(state) {
            this.state = state;
        }
        Cancellation.prototype.resetCancelled = function () {
            this.state.resetCancelled();
        };
        Cancellation.prototype.setCancelled = function (numberOfCalls) {
            if (numberOfCalls === void 0) { numberOfCalls = 0; }
            this.state.setCancelled(numberOfCalls);
        };
        return Cancellation;
    }());
    FourSlashInterface.Cancellation = Cancellation;
    var Classification;
    (function (Classification) {
        function comment(text, position) {
            return getClassification("comment", text, position);
        }
        Classification.comment = comment;
        function identifier(text, position) {
            return getClassification("identifier", text, position);
        }
        Classification.identifier = identifier;
        function keyword(text, position) {
            return getClassification("keyword", text, position);
        }
        Classification.keyword = keyword;
        function numericLiteral(text, position) {
            return getClassification("numericLiteral", text, position);
        }
        Classification.numericLiteral = numericLiteral;
        function operator(text, position) {
            return getClassification("operator", text, position);
        }
        Classification.operator = operator;
        function stringLiteral(text, position) {
            return getClassification("stringLiteral", text, position);
        }
        Classification.stringLiteral = stringLiteral;
        function whiteSpace(text, position) {
            return getClassification("whiteSpace", text, position);
        }
        Classification.whiteSpace = whiteSpace;
        function text(text, position) {
            return getClassification("text", text, position);
        }
        Classification.text = text;
        function punctuation(text, position) {
            return getClassification("punctuation", text, position);
        }
        Classification.punctuation = punctuation;
        function docCommentTagName(text, position) {
            return getClassification("docCommentTagName", text, position);
        }
        Classification.docCommentTagName = docCommentTagName;
        function className(text, position) {
            return getClassification("className", text, position);
        }
        Classification.className = className;
        function enumName(text, position) {
            return getClassification("enumName", text, position);
        }
        Classification.enumName = enumName;
        function interfaceName(text, position) {
            return getClassification("interfaceName", text, position);
        }
        Classification.interfaceName = interfaceName;
        function moduleName(text, position) {
            return getClassification("moduleName", text, position);
        }
        Classification.moduleName = moduleName;
        function typeParameterName(text, position) {
            return getClassification("typeParameterName", text, position);
        }
        Classification.typeParameterName = typeParameterName;
        function parameterName(text, position) {
            return getClassification("parameterName", text, position);
        }
        Classification.parameterName = parameterName;
        function typeAliasName(text, position) {
            return getClassification("typeAliasName", text, position);
        }
        Classification.typeAliasName = typeAliasName;
        function jsxOpenTagName(text, position) {
            return getClassification("jsxOpenTagName", text, position);
        }
        Classification.jsxOpenTagName = jsxOpenTagName;
        function jsxCloseTagName(text, position) {
            return getClassification("jsxCloseTagName", text, position);
        }
        Classification.jsxCloseTagName = jsxCloseTagName;
        function jsxSelfClosingTagName(text, position) {
            return getClassification("jsxSelfClosingTagName", text, position);
        }
        Classification.jsxSelfClosingTagName = jsxSelfClosingTagName;
        function jsxAttribute(text, position) {
            return getClassification("jsxAttribute", text, position);
        }
        Classification.jsxAttribute = jsxAttribute;
        function jsxText(text, position) {
            return getClassification("jsxText", text, position);
        }
        Classification.jsxText = jsxText;
        function jsxAttributeStringLiteralValue(text, position) {
            return getClassification("jsxAttributeStringLiteralValue", text, position);
        }
        Classification.jsxAttributeStringLiteralValue = jsxAttributeStringLiteralValue;
        function getClassification(type, text, position) {
            return {
                classificationType: type,
                text: text,
                textSpan: position === undefined ? undefined : { start: position, end: position + text.length }
            };
        }
    })(Classification = FourSlashInterface.Classification || (FourSlashInterface.Classification = {}));
})(FourSlashInterface || (FourSlashInterface = {}));
//# sourceMappingURL=fourslash.js.map