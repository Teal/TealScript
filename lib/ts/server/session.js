/// <reference path="..\compiler\commandLineParser.ts" />
/// <reference path="..\services\services.ts" />
/// <reference path="protocol.d.ts" />
/// <reference path="editorServices.ts" />
var ts;
(function (ts) {
    var server;
    (function (server) {
        var spaceCache = [];
        function generateSpaces(n) {
            if (!spaceCache[n]) {
                var strBuilder = "";
                for (var i = 0; i < n; i++) {
                    strBuilder += " ";
                }
                spaceCache[n] = strBuilder;
            }
            return spaceCache[n];
        }
        server.generateSpaces = generateSpaces;
        function generateIndentString(n, editorOptions) {
            if (editorOptions.ConvertTabsToSpaces) {
                return generateSpaces(n);
            }
            else {
                var result = "";
                for (var i = 0; i < Math.floor(n / editorOptions.TabSize); i++) {
                    result += "\t";
                }
                for (var i = 0; i < n % editorOptions.TabSize; i++) {
                    result += " ";
                }
                return result;
            }
        }
        server.generateIndentString = generateIndentString;
        function compareNumber(a, b) {
            if (a < b) {
                return -1;
            }
            else if (a === b) {
                return 0;
            }
            else
                return 1;
        }
        function compareFileStart(a, b) {
            if (a.file < b.file) {
                return -1;
            }
            else if (a.file == b.file) {
                var n = compareNumber(a.start.line, b.start.line);
                if (n === 0) {
                    return compareNumber(a.start.offset, b.start.offset);
                }
                else
                    return n;
            }
            else {
                return 1;
            }
        }
        function formatDiag(fileName, project, diag) {
            return {
                start: project.compilerService.host.positionToLineOffset(fileName, diag.start),
                end: project.compilerService.host.positionToLineOffset(fileName, diag.start + diag.length),
                text: ts.flattenDiagnosticMessageText(diag.messageText, "\n")
            };
        }
        function formatConfigFileDiag(diag) {
            return {
                start: undefined,
                end: undefined,
                text: ts.flattenDiagnosticMessageText(diag.messageText, "\n")
            };
        }
        function allEditsBeforePos(edits, pos) {
            for (var i = 0, len = edits.length; i < len; i++) {
                if (ts.textSpanEnd(edits[i].span) >= pos) {
                    return false;
                }
            }
            return true;
        }
        var CommandNames;
        (function (CommandNames) {
            CommandNames.Brace = "brace";
            CommandNames.Change = "change";
            CommandNames.Close = "close";
            CommandNames.Completions = "completions";
            CommandNames.CompletionDetails = "completionEntryDetails";
            CommandNames.Configure = "configure";
            CommandNames.Definition = "definition";
            CommandNames.Exit = "exit";
            CommandNames.Format = "format";
            CommandNames.Formatonkey = "formatonkey";
            CommandNames.Geterr = "geterr";
            CommandNames.GeterrForProject = "geterrForProject";
            CommandNames.SemanticDiagnosticsSync = "semanticDiagnosticsSync";
            CommandNames.SyntacticDiagnosticsSync = "syntacticDiagnosticsSync";
            CommandNames.NavBar = "navbar";
            CommandNames.Navto = "navto";
            CommandNames.Occurrences = "occurrences";
            CommandNames.DocumentHighlights = "documentHighlights";
            CommandNames.Open = "open";
            CommandNames.Quickinfo = "quickinfo";
            CommandNames.References = "references";
            CommandNames.Reload = "reload";
            CommandNames.Rename = "rename";
            CommandNames.Saveto = "saveto";
            CommandNames.SignatureHelp = "signatureHelp";
            CommandNames.TypeDefinition = "typeDefinition";
            CommandNames.ProjectInfo = "projectInfo";
            CommandNames.ReloadProjects = "reloadProjects";
            CommandNames.Unknown = "unknown";
        })(CommandNames = server.CommandNames || (server.CommandNames = {}));
        var Errors;
        (function (Errors) {
            Errors.NoProject = new Error("No Project.");
            Errors.ProjectLanguageServiceDisabled = new Error("The project's language service is disabled.");
        })(Errors || (Errors = {}));
        var Session = (function () {
            function Session(host, byteLength, hrtime, logger) {
                var _this = this;
                this.host = host;
                this.byteLength = byteLength;
                this.hrtime = hrtime;
                this.logger = logger;
                this.changeSeq = 0;
                this.handlers = (_a = {},
                    _a[CommandNames.Exit] = function () {
                        _this.exit();
                        return { responseRequired: false };
                    },
                    _a[CommandNames.Definition] = function (request) {
                        var defArgs = request.arguments;
                        return { response: _this.getDefinition(defArgs.line, defArgs.offset, defArgs.file), responseRequired: true };
                    },
                    _a[CommandNames.TypeDefinition] = function (request) {
                        var defArgs = request.arguments;
                        return { response: _this.getTypeDefinition(defArgs.line, defArgs.offset, defArgs.file), responseRequired: true };
                    },
                    _a[CommandNames.References] = function (request) {
                        var defArgs = request.arguments;
                        return { response: _this.getReferences(defArgs.line, defArgs.offset, defArgs.file), responseRequired: true };
                    },
                    _a[CommandNames.Rename] = function (request) {
                        var renameArgs = request.arguments;
                        return { response: _this.getRenameLocations(renameArgs.line, renameArgs.offset, renameArgs.file, renameArgs.findInComments, renameArgs.findInStrings), responseRequired: true };
                    },
                    _a[CommandNames.Open] = function (request) {
                        var openArgs = request.arguments;
                        var scriptKind;
                        switch (openArgs.scriptKindName) {
                            case "TS":
                                scriptKind = 3 /* TS */;
                                break;
                            case "JS":
                                scriptKind = 1 /* JS */;
                                break;
                            case "TSX":
                                scriptKind = 4 /* TSX */;
                                break;
                            case "JSX":
                                scriptKind = 2 /* JSX */;
                                break;
                        }
                        _this.openClientFile(openArgs.file, openArgs.fileContent, scriptKind);
                        return { responseRequired: false };
                    },
                    _a[CommandNames.Quickinfo] = function (request) {
                        var quickinfoArgs = request.arguments;
                        return { response: _this.getQuickInfo(quickinfoArgs.line, quickinfoArgs.offset, quickinfoArgs.file), responseRequired: true };
                    },
                    _a[CommandNames.Format] = function (request) {
                        var formatArgs = request.arguments;
                        return { response: _this.getFormattingEditsForRange(formatArgs.line, formatArgs.offset, formatArgs.endLine, formatArgs.endOffset, formatArgs.file), responseRequired: true };
                    },
                    _a[CommandNames.Formatonkey] = function (request) {
                        var formatOnKeyArgs = request.arguments;
                        return { response: _this.getFormattingEditsAfterKeystroke(formatOnKeyArgs.line, formatOnKeyArgs.offset, formatOnKeyArgs.key, formatOnKeyArgs.file), responseRequired: true };
                    },
                    _a[CommandNames.Completions] = function (request) {
                        var completionsArgs = request.arguments;
                        return { response: _this.getCompletions(completionsArgs.line, completionsArgs.offset, completionsArgs.prefix, completionsArgs.file), responseRequired: true };
                    },
                    _a[CommandNames.CompletionDetails] = function (request) {
                        var completionDetailsArgs = request.arguments;
                        return {
                            response: _this.getCompletionEntryDetails(completionDetailsArgs.line, completionDetailsArgs.offset, completionDetailsArgs.entryNames, completionDetailsArgs.file), responseRequired: true
                        };
                    },
                    _a[CommandNames.SignatureHelp] = function (request) {
                        var signatureHelpArgs = request.arguments;
                        return { response: _this.getSignatureHelpItems(signatureHelpArgs.line, signatureHelpArgs.offset, signatureHelpArgs.file), responseRequired: true };
                    },
                    _a[CommandNames.SemanticDiagnosticsSync] = function (request) {
                        return _this.requiredResponse(_this.getSemanticDiagnosticsSync(request.arguments));
                    },
                    _a[CommandNames.SyntacticDiagnosticsSync] = function (request) {
                        return _this.requiredResponse(_this.getSyntacticDiagnosticsSync(request.arguments));
                    },
                    _a[CommandNames.Geterr] = function (request) {
                        var geterrArgs = request.arguments;
                        return { response: _this.getDiagnostics(geterrArgs.delay, geterrArgs.files), responseRequired: false };
                    },
                    _a[CommandNames.GeterrForProject] = function (request) {
                        var _a = request.arguments, file = _a.file, delay = _a.delay;
                        return { response: _this.getDiagnosticsForProject(delay, file), responseRequired: false };
                    },
                    _a[CommandNames.Change] = function (request) {
                        var changeArgs = request.arguments;
                        _this.change(changeArgs.line, changeArgs.offset, changeArgs.endLine, changeArgs.endOffset, changeArgs.insertString, changeArgs.file);
                        return { responseRequired: false };
                    },
                    _a[CommandNames.Configure] = function (request) {
                        var configureArgs = request.arguments;
                        _this.projectService.setHostConfiguration(configureArgs);
                        _this.output(undefined, CommandNames.Configure, request.seq);
                        return { responseRequired: false };
                    },
                    _a[CommandNames.Reload] = function (request) {
                        var reloadArgs = request.arguments;
                        _this.reload(reloadArgs.file, reloadArgs.tmpfile, request.seq);
                        return { response: { reloadFinished: true }, responseRequired: true };
                    },
                    _a[CommandNames.Saveto] = function (request) {
                        var savetoArgs = request.arguments;
                        _this.saveToTmp(savetoArgs.file, savetoArgs.tmpfile);
                        return { responseRequired: false };
                    },
                    _a[CommandNames.Close] = function (request) {
                        var closeArgs = request.arguments;
                        _this.closeClientFile(closeArgs.file);
                        return { responseRequired: false };
                    },
                    _a[CommandNames.Navto] = function (request) {
                        var navtoArgs = request.arguments;
                        return { response: _this.getNavigateToItems(navtoArgs.searchValue, navtoArgs.file, navtoArgs.maxResultCount), responseRequired: true };
                    },
                    _a[CommandNames.Brace] = function (request) {
                        var braceArguments = request.arguments;
                        return { response: _this.getBraceMatching(braceArguments.line, braceArguments.offset, braceArguments.file), responseRequired: true };
                    },
                    _a[CommandNames.NavBar] = function (request) {
                        var navBarArgs = request.arguments;
                        return { response: _this.getNavigationBarItems(navBarArgs.file), responseRequired: true };
                    },
                    _a[CommandNames.Occurrences] = function (request) {
                        var _a = request.arguments, line = _a.line, offset = _a.offset, fileName = _a.file;
                        return { response: _this.getOccurrences(line, offset, fileName), responseRequired: true };
                    },
                    _a[CommandNames.DocumentHighlights] = function (request) {
                        var _a = request.arguments, line = _a.line, offset = _a.offset, fileName = _a.file, filesToSearch = _a.filesToSearch;
                        return { response: _this.getDocumentHighlights(line, offset, fileName, filesToSearch), responseRequired: true };
                    },
                    _a[CommandNames.ProjectInfo] = function (request) {
                        var _a = request.arguments, file = _a.file, needFileNameList = _a.needFileNameList;
                        return { response: _this.getProjectInfo(file, needFileNameList), responseRequired: true };
                    },
                    _a[CommandNames.ReloadProjects] = function (request) {
                        _this.reloadProjects();
                        return { responseRequired: false };
                    },
                    _a
                );
                this.projectService =
                    new server.ProjectService(host, logger, function (eventName, project, fileName) {
                        _this.handleEvent(eventName, project, fileName);
                    });
                var _a;
            }
            Session.prototype.handleEvent = function (eventName, project, fileName) {
                var _this = this;
                if (eventName == "context") {
                    this.projectService.log("got context event, updating diagnostics for" + fileName, "Info");
                    this.updateErrorCheck([{ fileName: fileName, project: project }], this.changeSeq, function (n) { return n === _this.changeSeq; }, 100);
                }
            };
            Session.prototype.logError = function (err, cmd) {
                var typedErr = err;
                var msg = "Exception on executing command " + cmd;
                if (typedErr.message) {
                    msg += ":\n" + typedErr.message;
                    if (typedErr.stack) {
                        msg += "\n" + typedErr.stack;
                    }
                }
                this.projectService.log(msg);
            };
            Session.prototype.sendLineToClient = function (line) {
                this.host.write(line + this.host.newLine);
            };
            Session.prototype.send = function (msg) {
                var json = JSON.stringify(msg);
                if (this.logger.isVerbose()) {
                    this.logger.info(msg.type + ": " + json);
                }
                this.sendLineToClient("Content-Length: " + (1 + this.byteLength(json, "utf8")) +
                    "\r\n\r\n" + json);
            };
            Session.prototype.configFileDiagnosticEvent = function (triggerFile, configFile, diagnostics) {
                var bakedDiags = ts.map(diagnostics, formatConfigFileDiag);
                var ev = {
                    seq: 0,
                    type: "event",
                    event: "configFileDiag",
                    body: {
                        triggerFile: triggerFile,
                        configFile: configFile,
                        diagnostics: bakedDiags
                    }
                };
                this.send(ev);
            };
            Session.prototype.event = function (info, eventName) {
                var ev = {
                    seq: 0,
                    type: "event",
                    event: eventName,
                    body: info,
                };
                this.send(ev);
            };
            Session.prototype.response = function (info, cmdName, reqSeq, errorMsg) {
                if (reqSeq === void 0) { reqSeq = 0; }
                var res = {
                    seq: 0,
                    type: "response",
                    command: cmdName,
                    request_seq: reqSeq,
                    success: !errorMsg,
                };
                if (!errorMsg) {
                    res.body = info;
                }
                else {
                    res.message = errorMsg;
                }
                this.send(res);
            };
            Session.prototype.output = function (body, commandName, requestSequence, errorMessage) {
                if (requestSequence === void 0) { requestSequence = 0; }
                this.response(body, commandName, requestSequence, errorMessage);
            };
            Session.prototype.semanticCheck = function (file, project) {
                try {
                    var diags = project.compilerService.languageService.getSemanticDiagnostics(file);
                    if (diags) {
                        var bakedDiags = diags.map(function (diag) { return formatDiag(file, project, diag); });
                        this.event({ file: file, diagnostics: bakedDiags }, "semanticDiag");
                    }
                }
                catch (err) {
                    this.logError(err, "semantic check");
                }
            };
            Session.prototype.syntacticCheck = function (file, project) {
                try {
                    var diags = project.compilerService.languageService.getSyntacticDiagnostics(file);
                    if (diags) {
                        var bakedDiags = diags.map(function (diag) { return formatDiag(file, project, diag); });
                        this.event({ file: file, diagnostics: bakedDiags }, "syntaxDiag");
                    }
                }
                catch (err) {
                    this.logError(err, "syntactic check");
                }
            };
            Session.prototype.reloadProjects = function () {
                this.projectService.reloadProjects();
            };
            Session.prototype.updateProjectStructure = function (seq, matchSeq, ms) {
                var _this = this;
                if (ms === void 0) { ms = 1500; }
                setTimeout(function () {
                    if (matchSeq(seq)) {
                        _this.projectService.updateProjectStructure();
                    }
                }, ms);
            };
            Session.prototype.updateErrorCheck = function (checkList, seq, matchSeq, ms, followMs, requireOpen) {
                var _this = this;
                if (ms === void 0) { ms = 1500; }
                if (followMs === void 0) { followMs = 200; }
                if (requireOpen === void 0) { requireOpen = true; }
                if (followMs > ms) {
                    followMs = ms;
                }
                if (this.errorTimer) {
                    clearTimeout(this.errorTimer);
                }
                if (this.immediateId) {
                    clearImmediate(this.immediateId);
                    this.immediateId = undefined;
                }
                var index = 0;
                var checkOne = function () {
                    if (matchSeq(seq)) {
                        var checkSpec_1 = checkList[index];
                        index++;
                        if (checkSpec_1.project.getSourceFileFromName(checkSpec_1.fileName, requireOpen)) {
                            _this.syntacticCheck(checkSpec_1.fileName, checkSpec_1.project);
                            _this.immediateId = setImmediate(function () {
                                _this.semanticCheck(checkSpec_1.fileName, checkSpec_1.project);
                                _this.immediateId = undefined;
                                if (checkList.length > index) {
                                    _this.errorTimer = setTimeout(checkOne, followMs);
                                }
                                else {
                                    _this.errorTimer = undefined;
                                }
                            });
                        }
                    }
                };
                if ((checkList.length > index) && (matchSeq(seq))) {
                    this.errorTimer = setTimeout(checkOne, ms);
                }
            };
            Session.prototype.getDefinition = function (line, offset, fileName) {
                var file = ts.normalizePath(fileName);
                var project = this.projectService.getProjectForFile(file);
                if (!project || project.languageServiceDiabled) {
                    throw Errors.NoProject;
                }
                var compilerService = project.compilerService;
                var position = compilerService.host.lineOffsetToPosition(file, line, offset);
                var definitions = compilerService.languageService.getDefinitionAtPosition(file, position);
                if (!definitions) {
                    return undefined;
                }
                return definitions.map(function (def) { return ({
                    file: def.fileName,
                    start: compilerService.host.positionToLineOffset(def.fileName, def.textSpan.start),
                    end: compilerService.host.positionToLineOffset(def.fileName, ts.textSpanEnd(def.textSpan))
                }); });
            };
            Session.prototype.getTypeDefinition = function (line, offset, fileName) {
                var file = ts.normalizePath(fileName);
                var project = this.projectService.getProjectForFile(file);
                if (!project || project.languageServiceDiabled) {
                    throw Errors.NoProject;
                }
                var compilerService = project.compilerService;
                var position = compilerService.host.lineOffsetToPosition(file, line, offset);
                var definitions = compilerService.languageService.getTypeDefinitionAtPosition(file, position);
                if (!definitions) {
                    return undefined;
                }
                return definitions.map(function (def) { return ({
                    file: def.fileName,
                    start: compilerService.host.positionToLineOffset(def.fileName, def.textSpan.start),
                    end: compilerService.host.positionToLineOffset(def.fileName, ts.textSpanEnd(def.textSpan))
                }); });
            };
            Session.prototype.getOccurrences = function (line, offset, fileName) {
                fileName = ts.normalizePath(fileName);
                var project = this.projectService.getProjectForFile(fileName);
                if (!project || project.languageServiceDiabled) {
                    throw Errors.NoProject;
                }
                var compilerService = project.compilerService;
                var position = compilerService.host.lineOffsetToPosition(fileName, line, offset);
                var occurrences = compilerService.languageService.getOccurrencesAtPosition(fileName, position);
                if (!occurrences) {
                    return undefined;
                }
                return occurrences.map(function (occurrence) {
                    var fileName = occurrence.fileName, isWriteAccess = occurrence.isWriteAccess, textSpan = occurrence.textSpan;
                    var start = compilerService.host.positionToLineOffset(fileName, textSpan.start);
                    var end = compilerService.host.positionToLineOffset(fileName, ts.textSpanEnd(textSpan));
                    return {
                        start: start,
                        end: end,
                        file: fileName,
                        isWriteAccess: isWriteAccess,
                    };
                });
            };
            Session.prototype.getDiagnosticsWorker = function (args, selector) {
                var file = ts.normalizePath(args.file);
                var project = this.projectService.getProjectForFile(file);
                if (!project) {
                    throw Errors.NoProject;
                }
                if (project.languageServiceDiabled) {
                    throw Errors.ProjectLanguageServiceDisabled;
                }
                var diagnostics = selector(project, file);
                return ts.map(diagnostics, function (originalDiagnostic) { return formatDiag(file, project, originalDiagnostic); });
            };
            Session.prototype.getSyntacticDiagnosticsSync = function (args) {
                return this.getDiagnosticsWorker(args, function (project, file) { return project.compilerService.languageService.getSyntacticDiagnostics(file); });
            };
            Session.prototype.getSemanticDiagnosticsSync = function (args) {
                return this.getDiagnosticsWorker(args, function (project, file) { return project.compilerService.languageService.getSemanticDiagnostics(file); });
            };
            Session.prototype.getDocumentHighlights = function (line, offset, fileName, filesToSearch) {
                fileName = ts.normalizePath(fileName);
                var project = this.projectService.getProjectForFile(fileName);
                if (!project || project.languageServiceDiabled) {
                    throw Errors.NoProject;
                }
                var compilerService = project.compilerService;
                var position = compilerService.host.lineOffsetToPosition(fileName, line, offset);
                var documentHighlights = compilerService.languageService.getDocumentHighlights(fileName, position, filesToSearch);
                if (!documentHighlights) {
                    return undefined;
                }
                return documentHighlights.map(convertToDocumentHighlightsItem);
                function convertToDocumentHighlightsItem(documentHighlights) {
                    var fileName = documentHighlights.fileName, highlightSpans = documentHighlights.highlightSpans;
                    return {
                        file: fileName,
                        highlightSpans: highlightSpans.map(convertHighlightSpan)
                    };
                    function convertHighlightSpan(highlightSpan) {
                        var textSpan = highlightSpan.textSpan, kind = highlightSpan.kind;
                        var start = compilerService.host.positionToLineOffset(fileName, textSpan.start);
                        var end = compilerService.host.positionToLineOffset(fileName, ts.textSpanEnd(textSpan));
                        return { start: start, end: end, kind: kind };
                    }
                }
            };
            Session.prototype.getProjectInfo = function (fileName, needFileNameList) {
                fileName = ts.normalizePath(fileName);
                var project = this.projectService.getProjectForFile(fileName);
                if (!project) {
                    throw Errors.NoProject;
                }
                var projectInfo = {
                    configFileName: project.projectFilename,
                    languageServiceDisabled: project.languageServiceDiabled
                };
                if (needFileNameList) {
                    projectInfo.fileNames = project.getFileNames();
                }
                return projectInfo;
            };
            Session.prototype.getRenameLocations = function (line, offset, fileName, findInComments, findInStrings) {
                var file = ts.normalizePath(fileName);
                var info = this.projectService.getScriptInfo(file);
                var projects = this.projectService.findReferencingProjects(info);
                var projectsWithLanguageServiceEnabeld = ts.filter(projects, function (p) { return !p.languageServiceDiabled; });
                if (projectsWithLanguageServiceEnabeld.length === 0) {
                    throw Errors.NoProject;
                }
                var defaultProject = projectsWithLanguageServiceEnabeld[0];
                // The rename info should be the same for every project
                var defaultProjectCompilerService = defaultProject.compilerService;
                var position = defaultProjectCompilerService.host.lineOffsetToPosition(file, line, offset);
                var renameInfo = defaultProjectCompilerService.languageService.getRenameInfo(file, position);
                if (!renameInfo) {
                    return undefined;
                }
                if (!renameInfo.canRename) {
                    return {
                        info: renameInfo,
                        locs: []
                    };
                }
                var fileSpans = server.combineProjectOutput(projectsWithLanguageServiceEnabeld, function (project) {
                    var compilerService = project.compilerService;
                    var renameLocations = compilerService.languageService.findRenameLocations(file, position, findInStrings, findInComments);
                    if (!renameLocations) {
                        return [];
                    }
                    return renameLocations.map(function (location) { return ({
                        file: location.fileName,
                        start: compilerService.host.positionToLineOffset(location.fileName, location.textSpan.start),
                        end: compilerService.host.positionToLineOffset(location.fileName, ts.textSpanEnd(location.textSpan)),
                    }); });
                }, compareRenameLocation, function (a, b) { return a.file === b.file && a.start.line === b.start.line && a.start.offset === b.start.offset; });
                var locs = fileSpans.reduce(function (accum, cur) {
                    var curFileAccum;
                    if (accum.length > 0) {
                        curFileAccum = accum[accum.length - 1];
                        if (curFileAccum.file !== cur.file) {
                            curFileAccum = undefined;
                        }
                    }
                    if (!curFileAccum) {
                        curFileAccum = { file: cur.file, locs: [] };
                        accum.push(curFileAccum);
                    }
                    curFileAccum.locs.push({ start: cur.start, end: cur.end });
                    return accum;
                }, []);
                return { info: renameInfo, locs: locs };
                function compareRenameLocation(a, b) {
                    if (a.file < b.file) {
                        return -1;
                    }
                    else if (a.file > b.file) {
                        return 1;
                    }
                    else {
                        // reverse sort assuming no overlap
                        if (a.start.line < b.start.line) {
                            return 1;
                        }
                        else if (a.start.line > b.start.line) {
                            return -1;
                        }
                        else {
                            return b.start.offset - a.start.offset;
                        }
                    }
                }
            };
            Session.prototype.getReferences = function (line, offset, fileName) {
                var file = ts.normalizePath(fileName);
                var info = this.projectService.getScriptInfo(file);
                var projects = this.projectService.findReferencingProjects(info);
                var projectsWithLanguageServiceEnabeld = ts.filter(projects, function (p) { return !p.languageServiceDiabled; });
                if (projectsWithLanguageServiceEnabeld.length === 0) {
                    throw Errors.NoProject;
                }
                var defaultProject = projectsWithLanguageServiceEnabeld[0];
                var position = defaultProject.compilerService.host.lineOffsetToPosition(file, line, offset);
                var nameInfo = defaultProject.compilerService.languageService.getQuickInfoAtPosition(file, position);
                if (!nameInfo) {
                    return undefined;
                }
                var displayString = ts.displayPartsToString(nameInfo.displayParts);
                var nameSpan = nameInfo.textSpan;
                var nameColStart = defaultProject.compilerService.host.positionToLineOffset(file, nameSpan.start).offset;
                var nameText = defaultProject.compilerService.host.getScriptSnapshot(file).getText(nameSpan.start, ts.textSpanEnd(nameSpan));
                var refs = server.combineProjectOutput(projectsWithLanguageServiceEnabeld, function (project) {
                    var compilerService = project.compilerService;
                    var references = compilerService.languageService.getReferencesAtPosition(file, position);
                    if (!references) {
                        return [];
                    }
                    return references.map(function (ref) {
                        var start = compilerService.host.positionToLineOffset(ref.fileName, ref.textSpan.start);
                        var refLineSpan = compilerService.host.lineToTextSpan(ref.fileName, start.line - 1);
                        var snap = compilerService.host.getScriptSnapshot(ref.fileName);
                        var lineText = snap.getText(refLineSpan.start, ts.textSpanEnd(refLineSpan)).replace(/\r|\n/g, "");
                        return {
                            file: ref.fileName,
                            start: start,
                            lineText: lineText,
                            end: compilerService.host.positionToLineOffset(ref.fileName, ts.textSpanEnd(ref.textSpan)),
                            isWriteAccess: ref.isWriteAccess,
                            isDefinition: ref.isDefinition
                        };
                    });
                }, compareFileStart, areReferencesResponseItemsForTheSameLocation);
                return {
                    refs: refs,
                    symbolName: nameText,
                    symbolStartOffset: nameColStart,
                    symbolDisplayString: displayString
                };
                function areReferencesResponseItemsForTheSameLocation(a, b) {
                    if (a && b) {
                        return a.file === b.file &&
                            a.start === b.start &&
                            a.end === b.end;
                    }
                    return false;
                }
            };
            /**
             * @param fileName is the name of the file to be opened
             * @param fileContent is a version of the file content that is known to be more up to date than the one on disk
             */
            Session.prototype.openClientFile = function (fileName, fileContent, scriptKind) {
                var file = ts.normalizePath(fileName);
                var _a = this.projectService.openClientFile(file, fileContent, scriptKind), configFileName = _a.configFileName, configFileErrors = _a.configFileErrors;
                if (configFileErrors) {
                    this.configFileDiagnosticEvent(fileName, configFileName, configFileErrors);
                }
            };
            Session.prototype.getQuickInfo = function (line, offset, fileName) {
                var file = ts.normalizePath(fileName);
                var project = this.projectService.getProjectForFile(file);
                if (!project || project.languageServiceDiabled) {
                    throw Errors.NoProject;
                }
                var compilerService = project.compilerService;
                var position = compilerService.host.lineOffsetToPosition(file, line, offset);
                var quickInfo = compilerService.languageService.getQuickInfoAtPosition(file, position);
                if (!quickInfo) {
                    return undefined;
                }
                var displayString = ts.displayPartsToString(quickInfo.displayParts);
                var docString = ts.displayPartsToString(quickInfo.documentation);
                return {
                    kind: quickInfo.kind,
                    kindModifiers: quickInfo.kindModifiers,
                    start: compilerService.host.positionToLineOffset(file, quickInfo.textSpan.start),
                    end: compilerService.host.positionToLineOffset(file, ts.textSpanEnd(quickInfo.textSpan)),
                    displayString: displayString,
                    documentation: docString,
                };
            };
            Session.prototype.getFormattingEditsForRange = function (line, offset, endLine, endOffset, fileName) {
                var file = ts.normalizePath(fileName);
                var project = this.projectService.getProjectForFile(file);
                if (!project || project.languageServiceDiabled) {
                    throw Errors.NoProject;
                }
                var compilerService = project.compilerService;
                var startPosition = compilerService.host.lineOffsetToPosition(file, line, offset);
                var endPosition = compilerService.host.lineOffsetToPosition(file, endLine, endOffset);
                // TODO: avoid duplicate code (with formatonkey)
                var edits = compilerService.languageService.getFormattingEditsForRange(file, startPosition, endPosition, this.projectService.getFormatCodeOptions(file));
                if (!edits) {
                    return undefined;
                }
                return edits.map(function (edit) {
                    return {
                        start: compilerService.host.positionToLineOffset(file, edit.span.start),
                        end: compilerService.host.positionToLineOffset(file, ts.textSpanEnd(edit.span)),
                        newText: edit.newText ? edit.newText : ""
                    };
                });
            };
            Session.prototype.getFormattingEditsAfterKeystroke = function (line, offset, key, fileName) {
                var file = ts.normalizePath(fileName);
                var project = this.projectService.getProjectForFile(file);
                if (!project || project.languageServiceDiabled) {
                    throw Errors.NoProject;
                }
                var compilerService = project.compilerService;
                var position = compilerService.host.lineOffsetToPosition(file, line, offset);
                var formatOptions = this.projectService.getFormatCodeOptions(file);
                var edits = compilerService.languageService.getFormattingEditsAfterKeystroke(file, position, key, formatOptions);
                // Check whether we should auto-indent. This will be when
                // the position is on a line containing only whitespace.
                // This should leave the edits returned from
                // getFormattingEditsAfterKeystroke either empty or pertaining
                // only to the previous line.  If all this is true, then
                // add edits necessary to properly indent the current line.
                if ((key == "\n") && ((!edits) || (edits.length === 0) || allEditsBeforePos(edits, position))) {
                    var scriptInfo = compilerService.host.getScriptInfo(file);
                    if (scriptInfo) {
                        var lineInfo = scriptInfo.getLineInfo(line);
                        if (lineInfo && (lineInfo.leaf) && (lineInfo.leaf.text)) {
                            var lineText = lineInfo.leaf.text;
                            if (lineText.search("\\S") < 0) {
                                // TODO: get these options from host
                                var editorOptions = {
                                    BaseIndentSize: formatOptions.BaseIndentSize,
                                    IndentSize: formatOptions.IndentSize,
                                    TabSize: formatOptions.TabSize,
                                    NewLineCharacter: formatOptions.NewLineCharacter,
                                    ConvertTabsToSpaces: formatOptions.ConvertTabsToSpaces,
                                    IndentStyle: ts.IndentStyle.Smart,
                                };
                                var preferredIndent = compilerService.languageService.getIndentationAtPosition(file, position, editorOptions);
                                var hasIndent = 0;
                                var i = void 0, len = void 0;
                                for (i = 0, len = lineText.length; i < len; i++) {
                                    if (lineText.charAt(i) == " ") {
                                        hasIndent++;
                                    }
                                    else if (lineText.charAt(i) == "\t") {
                                        hasIndent += editorOptions.TabSize;
                                    }
                                    else {
                                        break;
                                    }
                                }
                                // i points to the first non whitespace character
                                if (preferredIndent !== hasIndent) {
                                    var firstNoWhiteSpacePosition = lineInfo.offset + i;
                                    edits.push({
                                        span: ts.createTextSpanFromBounds(lineInfo.offset, firstNoWhiteSpacePosition),
                                        newText: generateIndentString(preferredIndent, editorOptions)
                                    });
                                }
                            }
                        }
                    }
                }
                if (!edits) {
                    return undefined;
                }
                return edits.map(function (edit) {
                    return {
                        start: compilerService.host.positionToLineOffset(file, edit.span.start),
                        end: compilerService.host.positionToLineOffset(file, ts.textSpanEnd(edit.span)),
                        newText: edit.newText ? edit.newText : ""
                    };
                });
            };
            Session.prototype.getCompletions = function (line, offset, prefix, fileName) {
                if (!prefix) {
                    prefix = "";
                }
                var file = ts.normalizePath(fileName);
                var project = this.projectService.getProjectForFile(file);
                if (!project || project.languageServiceDiabled) {
                    throw Errors.NoProject;
                }
                var compilerService = project.compilerService;
                var position = compilerService.host.lineOffsetToPosition(file, line, offset);
                var completions = compilerService.languageService.getCompletionsAtPosition(file, position);
                if (!completions) {
                    return undefined;
                }
                return completions.entries.reduce(function (result, entry) {
                    if (completions.isMemberCompletion || (entry.name.toLowerCase().indexOf(prefix.toLowerCase()) === 0)) {
                        result.push(entry);
                    }
                    return result;
                }, []).sort(function (a, b) { return a.name.localeCompare(b.name); });
            };
            Session.prototype.getCompletionEntryDetails = function (line, offset, entryNames, fileName) {
                var file = ts.normalizePath(fileName);
                var project = this.projectService.getProjectForFile(file);
                if (!project || project.languageServiceDiabled) {
                    throw Errors.NoProject;
                }
                var compilerService = project.compilerService;
                var position = compilerService.host.lineOffsetToPosition(file, line, offset);
                return entryNames.reduce(function (accum, entryName) {
                    var details = compilerService.languageService.getCompletionEntryDetails(file, position, entryName);
                    if (details) {
                        accum.push(details);
                    }
                    return accum;
                }, []);
            };
            Session.prototype.getSignatureHelpItems = function (line, offset, fileName) {
                var file = ts.normalizePath(fileName);
                var project = this.projectService.getProjectForFile(file);
                if (!project || project.languageServiceDiabled) {
                    throw Errors.NoProject;
                }
                var compilerService = project.compilerService;
                var position = compilerService.host.lineOffsetToPosition(file, line, offset);
                var helpItems = compilerService.languageService.getSignatureHelpItems(file, position);
                if (!helpItems) {
                    return undefined;
                }
                var span = helpItems.applicableSpan;
                var result = {
                    items: helpItems.items,
                    applicableSpan: {
                        start: compilerService.host.positionToLineOffset(file, span.start),
                        end: compilerService.host.positionToLineOffset(file, span.start + span.length)
                    },
                    selectedItemIndex: helpItems.selectedItemIndex,
                    argumentIndex: helpItems.argumentIndex,
                    argumentCount: helpItems.argumentCount,
                };
                return result;
            };
            Session.prototype.getDiagnostics = function (delay, fileNames) {
                var _this = this;
                var checkList = fileNames.reduce(function (accum, fileName) {
                    fileName = ts.normalizePath(fileName);
                    var project = _this.projectService.getProjectForFile(fileName);
                    if (project && !project.languageServiceDiabled) {
                        accum.push({ fileName: fileName, project: project });
                    }
                    return accum;
                }, []);
                if (checkList.length > 0) {
                    this.updateErrorCheck(checkList, this.changeSeq, function (n) { return n === _this.changeSeq; }, delay);
                }
            };
            Session.prototype.change = function (line, offset, endLine, endOffset, insertString, fileName) {
                var _this = this;
                var file = ts.normalizePath(fileName);
                var project = this.projectService.getProjectForFile(file);
                if (project && !project.languageServiceDiabled) {
                    var compilerService = project.compilerService;
                    var start = compilerService.host.lineOffsetToPosition(file, line, offset);
                    var end = compilerService.host.lineOffsetToPosition(file, endLine, endOffset);
                    if (start >= 0) {
                        compilerService.host.editScript(file, start, end, insertString);
                        this.changeSeq++;
                    }
                    this.updateProjectStructure(this.changeSeq, function (n) { return n === _this.changeSeq; });
                }
            };
            Session.prototype.reload = function (fileName, tempFileName, reqSeq) {
                var _this = this;
                if (reqSeq === void 0) { reqSeq = 0; }
                var file = ts.normalizePath(fileName);
                var tmpfile = ts.normalizePath(tempFileName);
                var project = this.projectService.getProjectForFile(file);
                if (project && !project.languageServiceDiabled) {
                    this.changeSeq++;
                    // make sure no changes happen before this one is finished
                    project.compilerService.host.reloadScript(file, tmpfile, function () {
                        _this.output(undefined, CommandNames.Reload, reqSeq);
                    });
                }
            };
            Session.prototype.saveToTmp = function (fileName, tempFileName) {
                var file = ts.normalizePath(fileName);
                var tmpfile = ts.normalizePath(tempFileName);
                var project = this.projectService.getProjectForFile(file);
                if (project && !project.languageServiceDiabled) {
                    project.compilerService.host.saveTo(file, tmpfile);
                }
            };
            Session.prototype.closeClientFile = function (fileName) {
                if (!fileName) {
                    return;
                }
                var file = ts.normalizePath(fileName);
                this.projectService.closeClientFile(file);
            };
            Session.prototype.decorateNavigationBarItem = function (project, fileName, items, lineIndex) {
                var _this = this;
                if (!items) {
                    return undefined;
                }
                var compilerService = project.compilerService;
                return items.map(function (item) { return ({
                    text: item.text,
                    kind: item.kind,
                    kindModifiers: item.kindModifiers,
                    spans: item.spans.map(function (span) { return ({
                        start: compilerService.host.positionToLineOffset(fileName, span.start, lineIndex),
                        end: compilerService.host.positionToLineOffset(fileName, ts.textSpanEnd(span), lineIndex)
                    }); }),
                    childItems: _this.decorateNavigationBarItem(project, fileName, item.childItems, lineIndex),
                    indent: item.indent
                }); });
            };
            Session.prototype.getNavigationBarItems = function (fileName) {
                var file = ts.normalizePath(fileName);
                var project = this.projectService.getProjectForFile(file);
                if (!project || project.languageServiceDiabled) {
                    throw Errors.NoProject;
                }
                var compilerService = project.compilerService;
                var items = compilerService.languageService.getNavigationBarItems(file);
                if (!items) {
                    return undefined;
                }
                return this.decorateNavigationBarItem(project, fileName, items, compilerService.host.getLineIndex(fileName));
            };
            Session.prototype.getNavigateToItems = function (searchValue, fileName, maxResultCount) {
                var file = ts.normalizePath(fileName);
                var info = this.projectService.getScriptInfo(file);
                var projects = this.projectService.findReferencingProjects(info);
                var projectsWithLanguageServiceEnabeld = ts.filter(projects, function (p) { return !p.languageServiceDiabled; });
                if (projectsWithLanguageServiceEnabeld.length === 0) {
                    throw Errors.NoProject;
                }
                var allNavToItems = server.combineProjectOutput(projectsWithLanguageServiceEnabeld, function (project) {
                    var compilerService = project.compilerService;
                    var navItems = compilerService.languageService.getNavigateToItems(searchValue, maxResultCount);
                    if (!navItems) {
                        return [];
                    }
                    return navItems.map(function (navItem) {
                        var start = compilerService.host.positionToLineOffset(navItem.fileName, navItem.textSpan.start);
                        var end = compilerService.host.positionToLineOffset(navItem.fileName, ts.textSpanEnd(navItem.textSpan));
                        var bakedItem = {
                            name: navItem.name,
                            kind: navItem.kind,
                            file: navItem.fileName,
                            start: start,
                            end: end,
                        };
                        if (navItem.kindModifiers && (navItem.kindModifiers !== "")) {
                            bakedItem.kindModifiers = navItem.kindModifiers;
                        }
                        if (navItem.matchKind !== "none") {
                            bakedItem.matchKind = navItem.matchKind;
                        }
                        if (navItem.containerName && (navItem.containerName.length > 0)) {
                            bakedItem.containerName = navItem.containerName;
                        }
                        if (navItem.containerKind && (navItem.containerKind.length > 0)) {
                            bakedItem.containerKind = navItem.containerKind;
                        }
                        return bakedItem;
                    });
                }, 
                /*comparer*/ undefined, areNavToItemsForTheSameLocation);
                return allNavToItems;
                function areNavToItemsForTheSameLocation(a, b) {
                    if (a && b) {
                        return a.file === b.file &&
                            a.start === b.start &&
                            a.end === b.end;
                    }
                    return false;
                }
            };
            Session.prototype.getBraceMatching = function (line, offset, fileName) {
                var file = ts.normalizePath(fileName);
                var project = this.projectService.getProjectForFile(file);
                if (!project || project.languageServiceDiabled) {
                    throw Errors.NoProject;
                }
                var compilerService = project.compilerService;
                var position = compilerService.host.lineOffsetToPosition(file, line, offset);
                var spans = compilerService.languageService.getBraceMatchingAtPosition(file, position);
                if (!spans) {
                    return undefined;
                }
                return spans.map(function (span) { return ({
                    start: compilerService.host.positionToLineOffset(file, span.start),
                    end: compilerService.host.positionToLineOffset(file, span.start + span.length)
                }); });
            };
            Session.prototype.getDiagnosticsForProject = function (delay, fileName) {
                var _this = this;
                var _a = this.getProjectInfo(fileName, /*needFileNameList*/ true), fileNames = _a.fileNames, languageServiceDisabled = _a.languageServiceDisabled;
                if (languageServiceDisabled) {
                    return;
                }
                // No need to analyze lib.d.ts
                var fileNamesInProject = fileNames.filter(function (value, index, array) { return value.indexOf("lib.d.ts") < 0; });
                // Sort the file name list to make the recently touched files come first
                var highPriorityFiles = [];
                var mediumPriorityFiles = [];
                var lowPriorityFiles = [];
                var veryLowPriorityFiles = [];
                var normalizedFileName = ts.normalizePath(fileName);
                var project = this.projectService.getProjectForFile(normalizedFileName);
                for (var _i = 0, fileNamesInProject_1 = fileNamesInProject; _i < fileNamesInProject_1.length; _i++) {
                    var fileNameInProject = fileNamesInProject_1[_i];
                    if (this.getCanonicalFileName(fileNameInProject) == this.getCanonicalFileName(fileName))
                        highPriorityFiles.push(fileNameInProject);
                    else {
                        var info = this.projectService.getScriptInfo(fileNameInProject);
                        if (!info.isOpen) {
                            if (fileNameInProject.indexOf(".d.ts") > 0)
                                veryLowPriorityFiles.push(fileNameInProject);
                            else
                                lowPriorityFiles.push(fileNameInProject);
                        }
                        else
                            mediumPriorityFiles.push(fileNameInProject);
                    }
                }
                fileNamesInProject = highPriorityFiles.concat(mediumPriorityFiles).concat(lowPriorityFiles).concat(veryLowPriorityFiles);
                if (fileNamesInProject.length > 0) {
                    var checkList = fileNamesInProject.map(function (fileName) {
                        var normalizedFileName = ts.normalizePath(fileName);
                        return { fileName: normalizedFileName, project: project };
                    });
                    // Project level error analysis runs on background files too, therefore
                    // doesn't require the file to be opened
                    this.updateErrorCheck(checkList, this.changeSeq, function (n) { return n == _this.changeSeq; }, delay, 200, /*requireOpen*/ false);
                }
            };
            Session.prototype.getCanonicalFileName = function (fileName) {
                var name = this.host.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
                return ts.normalizePath(name);
            };
            Session.prototype.exit = function () {
            };
            Session.prototype.requiredResponse = function (response) {
                return { response: response, responseRequired: true };
            };
            Session.prototype.addProtocolHandler = function (command, handler) {
                if (this.handlers[command]) {
                    throw new Error("Protocol handler already exists for command \"" + command + "\"");
                }
                this.handlers[command] = handler;
            };
            Session.prototype.executeCommand = function (request) {
                var handler = this.handlers[request.command];
                if (handler) {
                    return handler(request);
                }
                else {
                    this.projectService.log("Unrecognized JSON command: " + JSON.stringify(request));
                    this.output(undefined, CommandNames.Unknown, request.seq, "Unrecognized JSON command: " + request.command);
                    return { responseRequired: false };
                }
            };
            Session.prototype.onMessage = function (message) {
                var start;
                if (this.logger.isVerbose()) {
                    this.logger.info("request: " + message);
                    start = this.hrtime();
                }
                var request;
                try {
                    request = JSON.parse(message);
                    var _a = this.executeCommand(request), response = _a.response, responseRequired = _a.responseRequired;
                    if (this.logger.isVerbose()) {
                        var elapsed = this.hrtime(start);
                        var seconds = elapsed[0];
                        var nanoseconds = elapsed[1];
                        var elapsedMs = ((1e9 * seconds) + nanoseconds) / 1000000.0;
                        var leader = "Elapsed time (in milliseconds)";
                        if (!responseRequired) {
                            leader = "Async elapsed time (in milliseconds)";
                        }
                        this.logger.msg(leader + ": " + elapsedMs.toFixed(4).toString(), "Perf");
                    }
                    if (response) {
                        this.output(response, request.command, request.seq);
                    }
                    else if (responseRequired) {
                        this.output(undefined, request.command, request.seq, "No content available.");
                    }
                }
                catch (err) {
                    if (err instanceof ts.OperationCanceledException) {
                    }
                    this.logError(err, message);
                    this.output(undefined, request ? request.command : CommandNames.Unknown, request ? request.seq : 0, "Error processing request. " + err.message + "\n" + err.stack);
                }
            };
            return Session;
        }());
        server.Session = Session;
    })(server = ts.server || (ts.server = {}));
})(ts || (ts = {}));
//# sourceMappingURL=session.js.map