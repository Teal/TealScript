/// <reference path="session.ts" />
var ts;
(function (ts) {
    var server;
    (function (server) {
        var SessionClient = (function () {
            function SessionClient(host) {
                this.host = host;
                this.sequence = 0;
                this.lineMaps = {};
                this.messages = [];
            }
            SessionClient.prototype.onMessage = function (message) {
                this.messages.push(message);
            };
            SessionClient.prototype.writeMessage = function (message) {
                this.host.writeMessage(message);
            };
            SessionClient.prototype.getLineMap = function (fileName) {
                var lineMap = ts.lookUp(this.lineMaps, fileName);
                if (!lineMap) {
                    var scriptSnapshot = this.host.getScriptSnapshot(fileName);
                    lineMap = this.lineMaps[fileName] = ts.computeLineStarts(scriptSnapshot.getText(0, scriptSnapshot.getLength()));
                }
                return lineMap;
            };
            SessionClient.prototype.lineOffsetToPosition = function (fileName, lineOffset, lineMap) {
                lineMap = lineMap || this.getLineMap(fileName);
                return ts.computePositionOfLineAndCharacter(lineMap, lineOffset.line - 1, lineOffset.offset - 1);
            };
            SessionClient.prototype.positionToOneBasedLineOffset = function (fileName, position) {
                var lineOffset = ts.computeLineAndCharacterOfPosition(this.getLineMap(fileName), position);
                return {
                    line: lineOffset.line + 1,
                    offset: lineOffset.character + 1
                };
            };
            SessionClient.prototype.convertCodeEditsToTextChange = function (fileName, codeEdit) {
                var start = this.lineOffsetToPosition(fileName, codeEdit.start);
                var end = this.lineOffsetToPosition(fileName, codeEdit.end);
                return {
                    span: ts.createTextSpanFromBounds(start, end),
                    newText: codeEdit.newText
                };
            };
            SessionClient.prototype.processRequest = function (command, args) {
                var request = {
                    seq: this.sequence,
                    type: "request",
                    arguments: args,
                    command: command
                };
                this.sequence++;
                this.writeMessage(JSON.stringify(request));
                return request;
            };
            SessionClient.prototype.processResponse = function (request) {
                var foundResponseMessage = false;
                var lastMessage;
                var response;
                while (!foundResponseMessage) {
                    lastMessage = this.messages.shift();
                    ts.Debug.assert(!!lastMessage, "Did not receive any responses.");
                    var responseBody = processMessage(lastMessage);
                    try {
                        response = JSON.parse(responseBody);
                        // the server may emit events before emitting the response. We
                        // want to ignore these events for testing purpose.
                        if (response.type === "response") {
                            foundResponseMessage = true;
                        }
                    }
                    catch (e) {
                        throw new Error("Malformed response: Failed to parse server response: " + lastMessage + ". \r\n  Error details: " + e.message);
                    }
                }
                // verify the sequence numbers
                ts.Debug.assert(response.request_seq === request.seq, "Malformed response: response sequence number did not match request sequence number.");
                // unmarshal errors
                if (!response.success) {
                    throw new Error("Error " + response.message);
                }
                ts.Debug.assert(!!response.body, "Malformed response: Unexpected empty response body.");
                return response;
                function processMessage(message) {
                    // Read the content length
                    var contentLengthPrefix = "Content-Length: ";
                    var lines = message.split("\r\n");
                    ts.Debug.assert(lines.length >= 2, "Malformed response: Expected 3 lines in the response.");
                    var contentLengthText = lines[0];
                    ts.Debug.assert(contentLengthText.indexOf(contentLengthPrefix) === 0, "Malformed response: Response text did not contain content-length header.");
                    var contentLength = parseInt(contentLengthText.substring(contentLengthPrefix.length));
                    // Read the body
                    var responseBody = lines[2];
                    // Verify content length
                    ts.Debug.assert(responseBody.length + 1 === contentLength, "Malformed response: Content length did not match the response's body length.");
                    return responseBody;
                }
            };
            SessionClient.prototype.openFile = function (fileName, content, scriptKindName) {
                var args = { file: fileName, fileContent: content, scriptKindName: scriptKindName };
                this.processRequest(server.CommandNames.Open, args);
            };
            SessionClient.prototype.closeFile = function (fileName) {
                var args = { file: fileName };
                this.processRequest(server.CommandNames.Close, args);
            };
            SessionClient.prototype.changeFile = function (fileName, start, end, newText) {
                // clear the line map after an edit
                this.lineMaps[fileName] = undefined;
                var lineOffset = this.positionToOneBasedLineOffset(fileName, start);
                var endLineOffset = this.positionToOneBasedLineOffset(fileName, end);
                var args = {
                    file: fileName,
                    line: lineOffset.line,
                    offset: lineOffset.offset,
                    endLine: endLineOffset.line,
                    endOffset: endLineOffset.offset,
                    insertString: newText
                };
                this.processRequest(server.CommandNames.Change, args);
            };
            SessionClient.prototype.getQuickInfoAtPosition = function (fileName, position) {
                var lineOffset = this.positionToOneBasedLineOffset(fileName, position);
                var args = {
                    file: fileName,
                    line: lineOffset.line,
                    offset: lineOffset.offset
                };
                var request = this.processRequest(server.CommandNames.Quickinfo, args);
                var response = this.processResponse(request);
                var start = this.lineOffsetToPosition(fileName, response.body.start);
                var end = this.lineOffsetToPosition(fileName, response.body.end);
                return {
                    kind: response.body.kind,
                    kindModifiers: response.body.kindModifiers,
                    textSpan: ts.createTextSpanFromBounds(start, end),
                    displayParts: [{ kind: "text", text: response.body.displayString }],
                    documentation: [{ kind: "text", text: response.body.documentation }]
                };
            };
            SessionClient.prototype.getProjectInfo = function (fileName, needFileNameList) {
                var args = {
                    file: fileName,
                    needFileNameList: needFileNameList
                };
                var request = this.processRequest(server.CommandNames.ProjectInfo, args);
                var response = this.processResponse(request);
                return {
                    configFileName: response.body.configFileName,
                    fileNames: response.body.fileNames
                };
            };
            SessionClient.prototype.getCompletionsAtPosition = function (fileName, position) {
                var lineOffset = this.positionToOneBasedLineOffset(fileName, position);
                var args = {
                    file: fileName,
                    line: lineOffset.line,
                    offset: lineOffset.offset,
                    prefix: undefined
                };
                var request = this.processRequest(server.CommandNames.Completions, args);
                var response = this.processResponse(request);
                return {
                    isMemberCompletion: false,
                    isNewIdentifierLocation: false,
                    entries: response.body
                };
            };
            SessionClient.prototype.getCompletionEntryDetails = function (fileName, position, entryName) {
                var lineOffset = this.positionToOneBasedLineOffset(fileName, position);
                var args = {
                    file: fileName,
                    line: lineOffset.line,
                    offset: lineOffset.offset,
                    entryNames: [entryName]
                };
                var request = this.processRequest(server.CommandNames.CompletionDetails, args);
                var response = this.processResponse(request);
                ts.Debug.assert(response.body.length === 1, "Unexpected length of completion details response body.");
                return response.body[0];
            };
            SessionClient.prototype.getNavigateToItems = function (searchValue) {
                var _this = this;
                var args = {
                    searchValue: searchValue,
                    file: this.host.getScriptFileNames()[0]
                };
                var request = this.processRequest(server.CommandNames.Navto, args);
                var response = this.processResponse(request);
                return response.body.map(function (entry) {
                    var fileName = entry.file;
                    var start = _this.lineOffsetToPosition(fileName, entry.start);
                    var end = _this.lineOffsetToPosition(fileName, entry.end);
                    return {
                        name: entry.name,
                        containerName: entry.containerName || "",
                        containerKind: entry.containerKind || "",
                        kind: entry.kind,
                        kindModifiers: entry.kindModifiers,
                        matchKind: entry.matchKind,
                        isCaseSensitive: entry.isCaseSensitive,
                        fileName: fileName,
                        textSpan: ts.createTextSpanFromBounds(start, end)
                    };
                });
            };
            SessionClient.prototype.getFormattingEditsForRange = function (fileName, start, end, options) {
                var _this = this;
                var startLineOffset = this.positionToOneBasedLineOffset(fileName, start);
                var endLineOffset = this.positionToOneBasedLineOffset(fileName, end);
                var args = {
                    file: fileName,
                    line: startLineOffset.line,
                    offset: startLineOffset.offset,
                    endLine: endLineOffset.line,
                    endOffset: endLineOffset.offset,
                };
                // TODO: handle FormatCodeOptions
                var request = this.processRequest(server.CommandNames.Format, args);
                var response = this.processResponse(request);
                return response.body.map(function (entry) { return _this.convertCodeEditsToTextChange(fileName, entry); });
            };
            SessionClient.prototype.getFormattingEditsForDocument = function (fileName, options) {
                return this.getFormattingEditsForRange(fileName, 0, this.host.getScriptSnapshot(fileName).getLength(), options);
            };
            SessionClient.prototype.getFormattingEditsAfterKeystroke = function (fileName, position, key, options) {
                var _this = this;
                var lineOffset = this.positionToOneBasedLineOffset(fileName, position);
                var args = {
                    file: fileName,
                    line: lineOffset.line,
                    offset: lineOffset.offset,
                    key: key
                };
                // TODO: handle FormatCodeOptions
                var request = this.processRequest(server.CommandNames.Formatonkey, args);
                var response = this.processResponse(request);
                return response.body.map(function (entry) { return _this.convertCodeEditsToTextChange(fileName, entry); });
            };
            SessionClient.prototype.getDefinitionAtPosition = function (fileName, position) {
                var _this = this;
                var lineOffset = this.positionToOneBasedLineOffset(fileName, position);
                var args = {
                    file: fileName,
                    line: lineOffset.line,
                    offset: lineOffset.offset,
                };
                var request = this.processRequest(server.CommandNames.Definition, args);
                var response = this.processResponse(request);
                return response.body.map(function (entry) {
                    var fileName = entry.file;
                    var start = _this.lineOffsetToPosition(fileName, entry.start);
                    var end = _this.lineOffsetToPosition(fileName, entry.end);
                    return {
                        containerKind: "",
                        containerName: "",
                        fileName: fileName,
                        textSpan: ts.createTextSpanFromBounds(start, end),
                        kind: "",
                        name: ""
                    };
                });
            };
            SessionClient.prototype.getTypeDefinitionAtPosition = function (fileName, position) {
                var _this = this;
                var lineOffset = this.positionToOneBasedLineOffset(fileName, position);
                var args = {
                    file: fileName,
                    line: lineOffset.line,
                    offset: lineOffset.offset,
                };
                var request = this.processRequest(server.CommandNames.TypeDefinition, args);
                var response = this.processResponse(request);
                return response.body.map(function (entry) {
                    var fileName = entry.file;
                    var start = _this.lineOffsetToPosition(fileName, entry.start);
                    var end = _this.lineOffsetToPosition(fileName, entry.end);
                    return {
                        containerKind: "",
                        containerName: "",
                        fileName: fileName,
                        textSpan: ts.createTextSpanFromBounds(start, end),
                        kind: "",
                        name: ""
                    };
                });
            };
            SessionClient.prototype.findReferences = function (fileName, position) {
                // Not yet implemented.
                return [];
            };
            SessionClient.prototype.getReferencesAtPosition = function (fileName, position) {
                var _this = this;
                var lineOffset = this.positionToOneBasedLineOffset(fileName, position);
                var args = {
                    file: fileName,
                    line: lineOffset.line,
                    offset: lineOffset.offset,
                };
                var request = this.processRequest(server.CommandNames.References, args);
                var response = this.processResponse(request);
                return response.body.refs.map(function (entry) {
                    var fileName = entry.file;
                    var start = _this.lineOffsetToPosition(fileName, entry.start);
                    var end = _this.lineOffsetToPosition(fileName, entry.end);
                    return {
                        fileName: fileName,
                        textSpan: ts.createTextSpanFromBounds(start, end),
                        isWriteAccess: entry.isWriteAccess,
                        isDefinition: entry.isDefinition,
                    };
                });
            };
            SessionClient.prototype.getEmitOutput = function (fileName) {
                throw new Error("Not Implemented Yet.");
            };
            SessionClient.prototype.getSyntacticDiagnostics = function (fileName) {
                throw new Error("Not Implemented Yet.");
            };
            SessionClient.prototype.getSemanticDiagnostics = function (fileName) {
                throw new Error("Not Implemented Yet.");
            };
            SessionClient.prototype.getCompilerOptionsDiagnostics = function () {
                throw new Error("Not Implemented Yet.");
            };
            SessionClient.prototype.getRenameInfo = function (fileName, position, findInStrings, findInComments) {
                var _this = this;
                var lineOffset = this.positionToOneBasedLineOffset(fileName, position);
                var args = {
                    file: fileName,
                    line: lineOffset.line,
                    offset: lineOffset.offset,
                    findInStrings: findInStrings,
                    findInComments: findInComments
                };
                var request = this.processRequest(server.CommandNames.Rename, args);
                var response = this.processResponse(request);
                var locations = [];
                response.body.locs.map(function (entry) {
                    var fileName = entry.file;
                    entry.locs.map(function (loc) {
                        var start = _this.lineOffsetToPosition(fileName, loc.start);
                        var end = _this.lineOffsetToPosition(fileName, loc.end);
                        locations.push({
                            textSpan: ts.createTextSpanFromBounds(start, end),
                            fileName: fileName
                        });
                    });
                });
                return this.lastRenameEntry = {
                    canRename: response.body.info.canRename,
                    displayName: response.body.info.displayName,
                    fullDisplayName: response.body.info.fullDisplayName,
                    kind: response.body.info.kind,
                    kindModifiers: response.body.info.kindModifiers,
                    localizedErrorMessage: response.body.info.localizedErrorMessage,
                    triggerSpan: ts.createTextSpanFromBounds(position, position),
                    fileName: fileName,
                    position: position,
                    findInStrings: findInStrings,
                    findInComments: findInComments,
                    locations: locations
                };
            };
            SessionClient.prototype.findRenameLocations = function (fileName, position, findInStrings, findInComments) {
                if (!this.lastRenameEntry ||
                    this.lastRenameEntry.fileName !== fileName ||
                    this.lastRenameEntry.position !== position ||
                    this.lastRenameEntry.findInStrings !== findInStrings ||
                    this.lastRenameEntry.findInComments !== findInComments) {
                    this.getRenameInfo(fileName, position, findInStrings, findInComments);
                }
                return this.lastRenameEntry.locations;
            };
            SessionClient.prototype.decodeNavigationBarItems = function (items, fileName, lineMap) {
                var _this = this;
                if (!items) {
                    return [];
                }
                return items.map(function (item) { return ({
                    text: item.text,
                    kind: item.kind,
                    kindModifiers: item.kindModifiers || "",
                    spans: item.spans.map(function (span) {
                        return ts.createTextSpanFromBounds(_this.lineOffsetToPosition(fileName, span.start, lineMap), _this.lineOffsetToPosition(fileName, span.end, lineMap));
                    }),
                    childItems: _this.decodeNavigationBarItems(item.childItems, fileName, lineMap),
                    indent: item.indent,
                    bolded: false,
                    grayed: false
                }); });
            };
            SessionClient.prototype.getNavigationBarItems = function (fileName) {
                var args = {
                    file: fileName
                };
                var request = this.processRequest(server.CommandNames.NavBar, args);
                var response = this.processResponse(request);
                var lineMap = this.getLineMap(fileName);
                return this.decodeNavigationBarItems(response.body, fileName, lineMap);
            };
            SessionClient.prototype.getNameOrDottedNameSpan = function (fileName, startPos, endPos) {
                throw new Error("Not Implemented Yet.");
            };
            SessionClient.prototype.getBreakpointStatementAtPosition = function (fileName, position) {
                throw new Error("Not Implemented Yet.");
            };
            SessionClient.prototype.getSignatureHelpItems = function (fileName, position) {
                var lineOffset = this.positionToOneBasedLineOffset(fileName, position);
                var args = {
                    file: fileName,
                    line: lineOffset.line,
                    offset: lineOffset.offset
                };
                var request = this.processRequest(server.CommandNames.SignatureHelp, args);
                var response = this.processResponse(request);
                if (!response.body) {
                    return undefined;
                }
                var helpItems = response.body;
                var span = helpItems.applicableSpan;
                var start = this.lineOffsetToPosition(fileName, span.start);
                var end = this.lineOffsetToPosition(fileName, span.end);
                var result = {
                    items: helpItems.items,
                    applicableSpan: {
                        start: start,
                        length: end - start
                    },
                    selectedItemIndex: helpItems.selectedItemIndex,
                    argumentIndex: helpItems.argumentIndex,
                    argumentCount: helpItems.argumentCount,
                };
                return result;
            };
            SessionClient.prototype.getOccurrencesAtPosition = function (fileName, position) {
                var _this = this;
                var lineOffset = this.positionToOneBasedLineOffset(fileName, position);
                var args = {
                    file: fileName,
                    line: lineOffset.line,
                    offset: lineOffset.offset,
                };
                var request = this.processRequest(server.CommandNames.Occurrences, args);
                var response = this.processResponse(request);
                return response.body.map(function (entry) {
                    var fileName = entry.file;
                    var start = _this.lineOffsetToPosition(fileName, entry.start);
                    var end = _this.lineOffsetToPosition(fileName, entry.end);
                    return {
                        fileName: fileName,
                        textSpan: ts.createTextSpanFromBounds(start, end),
                        isWriteAccess: entry.isWriteAccess,
                        isDefinition: false
                    };
                });
            };
            SessionClient.prototype.getDocumentHighlights = function (fileName, position, filesToSearch) {
                var _a = this.positionToOneBasedLineOffset(fileName, position), line = _a.line, offset = _a.offset;
                var args = { file: fileName, line: line, offset: offset, filesToSearch: filesToSearch };
                var request = this.processRequest(server.CommandNames.DocumentHighlights, args);
                var response = this.processResponse(request);
                var self = this;
                return response.body.map(convertToDocumentHighlights);
                function convertToDocumentHighlights(item) {
                    var file = item.file, highlightSpans = item.highlightSpans;
                    return {
                        fileName: file,
                        highlightSpans: highlightSpans.map(convertHighlightSpan)
                    };
                    function convertHighlightSpan(span) {
                        var start = self.lineOffsetToPosition(file, span.start);
                        var end = self.lineOffsetToPosition(file, span.end);
                        return {
                            textSpan: ts.createTextSpanFromBounds(start, end),
                            kind: span.kind
                        };
                    }
                }
            };
            SessionClient.prototype.getOutliningSpans = function (fileName) {
                throw new Error("Not Implemented Yet.");
            };
            SessionClient.prototype.getTodoComments = function (fileName, descriptors) {
                throw new Error("Not Implemented Yet.");
            };
            SessionClient.prototype.getDocCommentTemplateAtPosition = function (fileName, position) {
                throw new Error("Not Implemented Yet.");
            };
            SessionClient.prototype.isValidBraceCompletionAtPosition = function (fileName, position, openingBrace) {
                throw new Error("Not Implemented Yet.");
            };
            SessionClient.prototype.getBraceMatchingAtPosition = function (fileName, position) {
                var _this = this;
                var lineOffset = this.positionToOneBasedLineOffset(fileName, position);
                var args = {
                    file: fileName,
                    line: lineOffset.line,
                    offset: lineOffset.offset,
                };
                var request = this.processRequest(server.CommandNames.Brace, args);
                var response = this.processResponse(request);
                return response.body.map(function (entry) {
                    var start = _this.lineOffsetToPosition(fileName, entry.start);
                    var end = _this.lineOffsetToPosition(fileName, entry.end);
                    return {
                        start: start,
                        length: end - start,
                    };
                });
            };
            SessionClient.prototype.getIndentationAtPosition = function (fileName, position, options) {
                throw new Error("Not Implemented Yet.");
            };
            SessionClient.prototype.getSyntacticClassifications = function (fileName, span) {
                throw new Error("Not Implemented Yet.");
            };
            SessionClient.prototype.getSemanticClassifications = function (fileName, span) {
                throw new Error("Not Implemented Yet.");
            };
            SessionClient.prototype.getEncodedSyntacticClassifications = function (fileName, span) {
                throw new Error("Not Implemented Yet.");
            };
            SessionClient.prototype.getEncodedSemanticClassifications = function (fileName, span) {
                throw new Error("Not Implemented Yet.");
            };
            SessionClient.prototype.getProgram = function () {
                throw new Error("SourceFile objects are not serializable through the server protocol.");
            };
            SessionClient.prototype.getNonBoundSourceFile = function (fileName) {
                throw new Error("SourceFile objects are not serializable through the server protocol.");
            };
            SessionClient.prototype.cleanupSemanticCache = function () {
                throw new Error("cleanupSemanticCache is not available through the server layer.");
            };
            SessionClient.prototype.dispose = function () {
                throw new Error("dispose is not available through the server layer.");
            };
            return SessionClient;
        }());
        server.SessionClient = SessionClient;
    })(server = ts.server || (ts.server = {}));
})(ts || (ts = {}));
//# sourceMappingURL=client.js.map