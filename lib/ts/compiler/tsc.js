/// <reference path="program.ts"/>
/// <reference path="commandLineParser.ts"/>
var ts;
(function (ts) {
    var reportDiagnostic = reportDiagnosticSimply;
    function reportDiagnostics(diagnostics, host) {
        for (var _i = 0, diagnostics_1 = diagnostics; _i < diagnostics_1.length; _i++) {
            var diagnostic = diagnostics_1[_i];
            reportDiagnostic(diagnostic, host);
        }
    }
    function reportEmittedFiles(files, host) {
        if (!files || files.length == 0) {
            return;
        }
        var currentDir = ts.sys.getCurrentDirectory();
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            var filepath = ts.getNormalizedAbsolutePath(file, currentDir);
            ts.sys.write("TSFILE: " + filepath + ts.sys.newLine);
        }
    }
    /**
     * Checks to see if the locale is in the appropriate format,
     * and if it is, attempts to set the appropriate language.
     */
    function validateLocaleAndSetLanguage(locale, errors) {
        var matchResult = /^([a-z]+)([_\-]([a-z]+))?$/.exec(locale.toLowerCase());
        if (!matchResult) {
            errors.push(ts.createCompilerDiagnostic(ts.Diagnostics.Locale_must_be_of_the_form_language_or_language_territory_For_example_0_or_1, "en", "ja-jp"));
            return false;
        }
        var language = matchResult[1];
        var territory = matchResult[3];
        // First try the entire locale, then fall back to just language if that's all we have.
        // Either ways do not fail, and fallback to the English diagnostic strings.
        if (!trySetLanguageAndTerritory(language, territory, errors)) {
            trySetLanguageAndTerritory(language, undefined, errors);
        }
        return true;
    }
    function trySetLanguageAndTerritory(language, territory, errors) {
        var compilerFilePath = ts.normalizePath(ts.sys.getExecutingFilePath());
        var containingDirectoryPath = ts.getDirectoryPath(compilerFilePath);
        var filePath = ts.combinePaths(containingDirectoryPath, language);
        if (territory) {
            filePath = filePath + "-" + territory;
        }
        filePath = ts.sys.resolvePath(ts.combinePaths(filePath, "diagnosticMessages.generated.json"));
        if (!ts.sys.fileExists(filePath)) {
            return false;
        }
        // TODO: Add codePage support for readFile?
        var fileContents = "";
        try {
            fileContents = ts.sys.readFile(filePath);
        }
        catch (e) {
            errors.push(ts.createCompilerDiagnostic(ts.Diagnostics.Unable_to_open_file_0, filePath));
            return false;
        }
        try {
            ts.localizedDiagnosticMessages = JSON.parse(fileContents);
        }
        catch (e) {
            errors.push(ts.createCompilerDiagnostic(ts.Diagnostics.Corrupted_locale_file_0, filePath));
            return false;
        }
        return true;
    }
    function countLines(program) {
        var count = 0;
        ts.forEach(program.getSourceFiles(), function (file) {
            count += ts.getLineStarts(file).length;
        });
        return count;
    }
    function getDiagnosticText(message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var diagnostic = ts.createCompilerDiagnostic.apply(undefined, arguments);
        return diagnostic.messageText;
    }
    function getRelativeFileName(fileName, host) {
        return host ? ts.convertToRelativePath(fileName, host.getCurrentDirectory(), function (fileName) { return host.getCanonicalFileName(fileName); }) : fileName;
    }
    function reportDiagnosticSimply(diagnostic, host) {
        var output = "";
        if (diagnostic.file) {
            var _a = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start), line = _a.line, character = _a.character;
            var relativeFileName = getRelativeFileName(diagnostic.file.fileName, host);
            output += relativeFileName + "(" + (line + 1) + "," + (character + 1) + "): ";
        }
        var category = ts.DiagnosticCategory[diagnostic.category].toLowerCase();
        output += category + " TS" + diagnostic.code + ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine) + ts.sys.newLine;
        ts.sys.write(output);
    }
    var redForegroundEscapeSequence = "\u001b[91m";
    var yellowForegroundEscapeSequence = "\u001b[93m";
    var blueForegroundEscapeSequence = "\u001b[93m";
    var gutterStyleSequence = "\u001b[100;30m";
    var gutterSeparator = " ";
    var resetEscapeSequence = "\u001b[0m";
    var ellipsis = "...";
    var categoryFormatMap = (_a = {},
        _a[ts.DiagnosticCategory.Warning] = yellowForegroundEscapeSequence,
        _a[ts.DiagnosticCategory.Error] = redForegroundEscapeSequence,
        _a[ts.DiagnosticCategory.Message] = blueForegroundEscapeSequence,
        _a
    );
    function formatAndReset(text, formatStyle) {
        return formatStyle + text + resetEscapeSequence;
    }
    function reportDiagnosticWithColorAndContext(diagnostic, host) {
        var output = "";
        if (diagnostic.file) {
            var start = diagnostic.start, length_1 = diagnostic.length, file = diagnostic.file;
            var _a = ts.getLineAndCharacterOfPosition(file, start), firstLine = _a.line, firstLineChar = _a.character;
            var _b = ts.getLineAndCharacterOfPosition(file, start + length_1), lastLine = _b.line, lastLineChar = _b.character;
            var lastLineInFile = ts.getLineAndCharacterOfPosition(file, file.text.length).line;
            var relativeFileName = getRelativeFileName(file.fileName, host);
            var hasMoreThanFiveLines = (lastLine - firstLine) >= 4;
            var gutterWidth = (lastLine + 1 + "").length;
            if (hasMoreThanFiveLines) {
                gutterWidth = Math.max(ellipsis.length, gutterWidth);
            }
            output += ts.sys.newLine;
            for (var i = firstLine; i <= lastLine; i++) {
                // If the error spans over 5 lines, we'll only show the first 2 and last 2 lines,
                // so we'll skip ahead to the second-to-last line.
                if (hasMoreThanFiveLines && firstLine + 1 < i && i < lastLine - 1) {
                    output += formatAndReset(padLeft(ellipsis, gutterWidth), gutterStyleSequence) + gutterSeparator + ts.sys.newLine;
                    i = lastLine - 1;
                }
                var lineStart = ts.getPositionOfLineAndCharacter(file, i, 0);
                var lineEnd = i < lastLineInFile ? ts.getPositionOfLineAndCharacter(file, i + 1, 0) : file.text.length;
                var lineContent = file.text.slice(lineStart, lineEnd);
                lineContent = lineContent.replace(/\s+$/g, ""); // trim from end
                lineContent = lineContent.replace("\t", " "); // convert tabs to single spaces
                // Output the gutter and the actual contents of the line.
                output += formatAndReset(padLeft(i + 1 + "", gutterWidth), gutterStyleSequence) + gutterSeparator;
                output += lineContent + ts.sys.newLine;
                // Output the gutter and the error span for the line using tildes.
                output += formatAndReset(padLeft("", gutterWidth), gutterStyleSequence) + gutterSeparator;
                output += redForegroundEscapeSequence;
                if (i === firstLine) {
                    // If we're on the last line, then limit it to the last character of the last line.
                    // Otherwise, we'll just squiggle the rest of the line, giving 'slice' no end position.
                    var lastCharForLine = i === lastLine ? lastLineChar : undefined;
                    output += lineContent.slice(0, firstLineChar).replace(/\S/g, " ");
                    output += lineContent.slice(firstLineChar, lastCharForLine).replace(/./g, "~");
                }
                else if (i === lastLine) {
                    output += lineContent.slice(0, lastLineChar).replace(/./g, "~");
                }
                else {
                    // Squiggle the entire line.
                    output += lineContent.replace(/./g, "~");
                }
                output += resetEscapeSequence;
                output += ts.sys.newLine;
            }
            output += ts.sys.newLine;
            output += relativeFileName + "(" + (firstLine + 1) + "," + (firstLineChar + 1) + "): ";
        }
        var categoryColor = categoryFormatMap[diagnostic.category];
        var category = ts.DiagnosticCategory[diagnostic.category].toLowerCase();
        output += formatAndReset(category, categoryColor) + " TS" + diagnostic.code + ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine);
        output += ts.sys.newLine + ts.sys.newLine;
        ts.sys.write(output);
    }
    function reportWatchDiagnostic(diagnostic) {
        var output = new Date().toLocaleTimeString() + " - ";
        if (diagnostic.file) {
            var loc = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
            output += diagnostic.file.fileName + "(" + (loc.line + 1) + "," + (loc.character + 1) + "): ";
        }
        output += "" + ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine) + ts.sys.newLine;
        ts.sys.write(output);
    }
    function padLeft(s, length) {
        while (s.length < length) {
            s = " " + s;
        }
        return s;
    }
    function padRight(s, length) {
        while (s.length < length) {
            s = s + " ";
        }
        return s;
    }
    function reportStatisticalValue(name, value) {
        ts.sys.write(padRight(name + ":", 12) + padLeft(value.toString(), 10) + ts.sys.newLine);
    }
    function reportCountStatistic(name, count) {
        reportStatisticalValue(name, "" + count);
    }
    function reportTimeStatistic(name, time) {
        reportStatisticalValue(name, (time / 1000).toFixed(2) + "s");
    }
    function isJSONSupported() {
        return typeof JSON === "object" && typeof JSON.parse === "function";
    }
    function executeCommandLine(args) {
        var commandLine = ts.parseCommandLine(args);
        var configFileName; // Configuration file name (if any)
        var cachedConfigFileText; // Cached configuration file text, used for reparsing (if any)
        var configFileWatcher; // Configuration file watcher
        var directoryWatcher; // Directory watcher to monitor source file addition/removal
        var cachedProgram; // Program cached from last compilation
        var rootFileNames; // Root fileNames for compilation
        var compilerOptions; // Compiler options for compilation
        var compilerHost; // Compiler host
        var hostGetSourceFile; // getSourceFile method from default host
        var timerHandleForRecompilation; // Handle for 0.25s wait timer to trigger recompilation
        var timerHandleForDirectoryChanges; // Handle for 0.25s wait timer to trigger directory change handler
        // This map stores and reuses results of fileExists check that happen inside 'createProgram'
        // This allows to save time in module resolution heavy scenarios when existence of the same file might be checked multiple times.
        var cachedExistingFiles;
        var hostFileExists;
        if (commandLine.options.locale) {
            if (!isJSONSupported()) {
                reportDiagnostic(ts.createCompilerDiagnostic(ts.Diagnostics.The_current_host_does_not_support_the_0_option, "--locale"), /* compilerHost */ undefined);
                return ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
            }
            validateLocaleAndSetLanguage(commandLine.options.locale, commandLine.errors);
        }
        // If there are any errors due to command line parsing and/or
        // setting up localization, report them and quit.
        if (commandLine.errors.length > 0) {
            reportDiagnostics(commandLine.errors, compilerHost);
            return ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
        }
        if (commandLine.options.init) {
            writeConfigFile(commandLine.options, commandLine.fileNames);
            return ts.sys.exit(ts.ExitStatus.Success);
        }
        if (commandLine.options.version) {
            printVersion();
            return ts.sys.exit(ts.ExitStatus.Success);
        }
        if (commandLine.options.help) {
            printVersion();
            printHelp();
            return ts.sys.exit(ts.ExitStatus.Success);
        }
        if (commandLine.options.project) {
            if (!isJSONSupported()) {
                reportDiagnostic(ts.createCompilerDiagnostic(ts.Diagnostics.The_current_host_does_not_support_the_0_option, "--project"), /* compilerHost */ undefined);
                return ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
            }
            if (commandLine.fileNames.length !== 0) {
                reportDiagnostic(ts.createCompilerDiagnostic(ts.Diagnostics.Option_project_cannot_be_mixed_with_source_files_on_a_command_line), /* compilerHost */ undefined);
                return ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
            }
            var fileOrDirectory = ts.normalizePath(commandLine.options.project);
            if (!fileOrDirectory /* current directory "." */ || ts.sys.directoryExists(fileOrDirectory)) {
                configFileName = ts.combinePaths(fileOrDirectory, "tsconfig.json");
                if (!ts.sys.fileExists(configFileName)) {
                    reportDiagnostic(ts.createCompilerDiagnostic(ts.Diagnostics.Cannot_find_a_tsconfig_json_file_at_the_specified_directory_Colon_0, commandLine.options.project), /* compilerHost */ undefined);
                    return ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
                }
            }
            else {
                configFileName = fileOrDirectory;
                if (!ts.sys.fileExists(configFileName)) {
                    reportDiagnostic(ts.createCompilerDiagnostic(ts.Diagnostics.The_specified_path_does_not_exist_Colon_0, commandLine.options.project), /* compilerHost */ undefined);
                    return ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
                }
            }
        }
        else if (commandLine.fileNames.length === 0 && isJSONSupported()) {
            var searchPath = ts.normalizePath(ts.sys.getCurrentDirectory());
            configFileName = ts.findConfigFile(searchPath, ts.sys.fileExists);
        }
        if (commandLine.fileNames.length === 0 && !configFileName) {
            printVersion();
            printHelp();
            return ts.sys.exit(ts.ExitStatus.Success);
        }
        if (ts.isWatchSet(commandLine.options)) {
            if (!ts.sys.watchFile) {
                reportDiagnostic(ts.createCompilerDiagnostic(ts.Diagnostics.The_current_host_does_not_support_the_0_option, "--watch"), /* compilerHost */ undefined);
                return ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
            }
            if (configFileName) {
                configFileWatcher = ts.sys.watchFile(configFileName, configFileChanged);
            }
            if (ts.sys.watchDirectory && configFileName) {
                var directory = ts.getDirectoryPath(configFileName);
                directoryWatcher = ts.sys.watchDirectory(
                // When the configFileName is just "tsconfig.json", the watched directory should be
                // the current directory; if there is a given "project" parameter, then the configFileName
                // is an absolute file name.
                directory == "" ? "." : directory, watchedDirectoryChanged, /*recursive*/ true);
            }
        }
        performCompilation();
        function parseConfigFile() {
            if (!cachedConfigFileText) {
                try {
                    cachedConfigFileText = ts.sys.readFile(configFileName);
                }
                catch (e) {
                    var error_1 = ts.createCompilerDiagnostic(ts.Diagnostics.Cannot_read_file_0_Colon_1, configFileName, e.message);
                    reportWatchDiagnostic(error_1);
                    ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
                    return;
                }
            }
            if (!cachedConfigFileText) {
                var error_2 = ts.createCompilerDiagnostic(ts.Diagnostics.File_0_not_found, configFileName);
                reportDiagnostics([error_2], /* compilerHost */ undefined);
                ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
                return;
            }
            var result = ts.parseConfigFileTextToJson(configFileName, cachedConfigFileText);
            var configObject = result.config;
            if (!configObject) {
                reportDiagnostics([result.error], /* compilerHost */ undefined);
                ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
                return;
            }
            var configParseResult = ts.parseJsonConfigFileContent(configObject, ts.sys, ts.getNormalizedAbsolutePath(ts.getDirectoryPath(configFileName), ts.sys.getCurrentDirectory()), commandLine.options, configFileName);
            if (configParseResult.errors.length > 0) {
                reportDiagnostics(configParseResult.errors, /* compilerHost */ undefined);
                ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
                return;
            }
            if (ts.isWatchSet(configParseResult.options)) {
                if (!ts.sys.watchFile) {
                    reportDiagnostic(ts.createCompilerDiagnostic(ts.Diagnostics.The_current_host_does_not_support_the_0_option, "--watch"), /* compilerHost */ undefined);
                    ts.sys.exit(ts.ExitStatus.DiagnosticsPresent_OutputsSkipped);
                }
                if (!directoryWatcher && ts.sys.watchDirectory && configFileName) {
                    var directory = ts.getDirectoryPath(configFileName);
                    directoryWatcher = ts.sys.watchDirectory(
                    // When the configFileName is just "tsconfig.json", the watched directory should be
                    // the current directory; if there is a given "project" parameter, then the configFileName
                    // is an absolute file name.
                    directory == "" ? "." : directory, watchedDirectoryChanged, /*recursive*/ true);
                }
                ;
            }
            return configParseResult;
        }
        // Invoked to perform initial compilation or re-compilation in watch mode
        function performCompilation() {
            if (!cachedProgram) {
                if (configFileName) {
                    var configParseResult = parseConfigFile();
                    rootFileNames = configParseResult.fileNames;
                    compilerOptions = configParseResult.options;
                }
                else {
                    rootFileNames = commandLine.fileNames;
                    compilerOptions = commandLine.options;
                }
                compilerHost = ts.createCompilerHost(compilerOptions);
                hostGetSourceFile = compilerHost.getSourceFile;
                compilerHost.getSourceFile = getSourceFile;
                hostFileExists = compilerHost.fileExists;
                compilerHost.fileExists = cachedFileExists;
            }
            if (compilerOptions.pretty) {
                reportDiagnostic = reportDiagnosticWithColorAndContext;
            }
            // reset the cache of existing files
            cachedExistingFiles = {};
            var compileResult = compile(rootFileNames, compilerOptions, compilerHost);
            if (!ts.isWatchSet(compilerOptions)) {
                return ts.sys.exit(compileResult.exitStatus);
            }
            setCachedProgram(compileResult.program);
            reportWatchDiagnostic(ts.createCompilerDiagnostic(ts.Diagnostics.Compilation_complete_Watching_for_file_changes));
        }
        function cachedFileExists(fileName) {
            if (ts.hasProperty(cachedExistingFiles, fileName)) {
                return cachedExistingFiles[fileName];
            }
            return cachedExistingFiles[fileName] = hostFileExists(fileName);
        }
        function getSourceFile(fileName, languageVersion, onError) {
            // Return existing SourceFile object if one is available
            if (cachedProgram) {
                var sourceFile_1 = cachedProgram.getSourceFile(fileName);
                // A modified source file has no watcher and should not be reused
                if (sourceFile_1 && sourceFile_1.fileWatcher) {
                    return sourceFile_1;
                }
            }
            // Use default host function
            var sourceFile = hostGetSourceFile(fileName, languageVersion, onError);
            if (sourceFile && ts.isWatchSet(compilerOptions) && ts.sys.watchFile) {
                // Attach a file watcher
                sourceFile.fileWatcher = ts.sys.watchFile(sourceFile.fileName, function (fileName, removed) { return sourceFileChanged(sourceFile, removed); });
            }
            return sourceFile;
        }
        // Change cached program to the given program
        function setCachedProgram(program) {
            if (cachedProgram) {
                var newSourceFiles_1 = program ? program.getSourceFiles() : undefined;
                ts.forEach(cachedProgram.getSourceFiles(), function (sourceFile) {
                    if (!(newSourceFiles_1 && ts.contains(newSourceFiles_1, sourceFile))) {
                        if (sourceFile.fileWatcher) {
                            sourceFile.fileWatcher.close();
                            sourceFile.fileWatcher = undefined;
                        }
                    }
                });
            }
            cachedProgram = program;
        }
        // If a source file changes, mark it as unwatched and start the recompilation timer
        function sourceFileChanged(sourceFile, removed) {
            sourceFile.fileWatcher.close();
            sourceFile.fileWatcher = undefined;
            if (removed) {
                var index = rootFileNames.indexOf(sourceFile.fileName);
                if (index >= 0) {
                    rootFileNames.splice(index, 1);
                }
            }
            startTimerForRecompilation();
        }
        // If the configuration file changes, forget cached program and start the recompilation timer
        function configFileChanged() {
            setCachedProgram(undefined);
            cachedConfigFileText = undefined;
            startTimerForRecompilation();
        }
        function watchedDirectoryChanged(fileName) {
            if (fileName && !ts.isSupportedSourceFileName(fileName, compilerOptions)) {
                return;
            }
            startTimerForHandlingDirectoryChanges();
        }
        function startTimerForHandlingDirectoryChanges() {
            if (timerHandleForDirectoryChanges) {
                clearTimeout(timerHandleForDirectoryChanges);
            }
            timerHandleForDirectoryChanges = setTimeout(directoryChangeHandler, 250);
        }
        function directoryChangeHandler() {
            var parsedCommandLine = parseConfigFile();
            var newFileNames = ts.map(parsedCommandLine.fileNames, compilerHost.getCanonicalFileName);
            var canonicalRootFileNames = ts.map(rootFileNames, compilerHost.getCanonicalFileName);
            // We check if the project file list has changed. If so, we just throw away the old program and start fresh.
            if (!ts.arrayIsEqualTo(newFileNames && newFileNames.sort(), canonicalRootFileNames && canonicalRootFileNames.sort())) {
                setCachedProgram(undefined);
                startTimerForRecompilation();
            }
        }
        // Upon detecting a file change, wait for 250ms and then perform a recompilation. This gives batch
        // operations (such as saving all modified files in an editor) a chance to complete before we kick
        // off a new compilation.
        function startTimerForRecompilation() {
            if (timerHandleForRecompilation) {
                clearTimeout(timerHandleForRecompilation);
            }
            timerHandleForRecompilation = setTimeout(recompile, 250);
        }
        function recompile() {
            timerHandleForRecompilation = undefined;
            reportWatchDiagnostic(ts.createCompilerDiagnostic(ts.Diagnostics.File_change_detected_Starting_incremental_compilation));
            performCompilation();
        }
    }
    ts.executeCommandLine = executeCommandLine;
    function compile(fileNames, compilerOptions, compilerHost) {
        ts.ioReadTime = 0;
        ts.ioWriteTime = 0;
        ts.programTime = 0;
        ts.bindTime = 0;
        ts.checkTime = 0;
        ts.emitTime = 0;
        var program = ts.createProgram(fileNames, compilerOptions, compilerHost);
        var exitStatus = compileProgram();
        if (compilerOptions.listFiles) {
            ts.forEach(program.getSourceFiles(), function (file) {
                ts.sys.write(file.fileName + ts.sys.newLine);
            });
        }
        if (compilerOptions.diagnostics) {
            var memoryUsed = ts.sys.getMemoryUsage ? ts.sys.getMemoryUsage() : -1;
            reportCountStatistic("Files", program.getSourceFiles().length);
            reportCountStatistic("Lines", countLines(program));
            reportCountStatistic("Nodes", program.getNodeCount());
            reportCountStatistic("Identifiers", program.getIdentifierCount());
            reportCountStatistic("Symbols", program.getSymbolCount());
            reportCountStatistic("Types", program.getTypeCount());
            if (memoryUsed >= 0) {
                reportStatisticalValue("Memory used", Math.round(memoryUsed / 1000) + "K");
            }
            // Individual component times.
            // Note: To match the behavior of previous versions of the compiler, the reported parse time includes
            // I/O read time and processing time for triple-slash references and module imports, and the reported
            // emit time includes I/O write time. We preserve this behavior so we can accurately compare times.
            reportTimeStatistic("I/O read", ts.ioReadTime);
            reportTimeStatistic("I/O write", ts.ioWriteTime);
            reportTimeStatistic("Parse time", ts.programTime);
            reportTimeStatistic("Bind time", ts.bindTime);
            reportTimeStatistic("Check time", ts.checkTime);
            reportTimeStatistic("Emit time", ts.emitTime);
            reportTimeStatistic("Total time", ts.programTime + ts.bindTime + ts.checkTime + ts.emitTime);
        }
        return { program: program, exitStatus: exitStatus };
        function compileProgram() {
            var diagnostics;
            // First get and report any syntactic errors.
            diagnostics = program.getSyntacticDiagnostics();
            // If we didn't have any syntactic errors, then also try getting the global and
            // semantic errors.
            if (diagnostics.length === 0) {
                diagnostics = program.getOptionsDiagnostics().concat(program.getGlobalDiagnostics());
                if (diagnostics.length === 0) {
                    diagnostics = program.getSemanticDiagnostics();
                }
            }
            // Otherwise, emit and report any errors we ran into.
            var emitOutput = program.emit();
            diagnostics = diagnostics.concat(emitOutput.diagnostics);
            reportDiagnostics(ts.sortAndDeduplicateDiagnostics(diagnostics), compilerHost);
            reportEmittedFiles(emitOutput.emittedFiles, compilerHost);
            if (emitOutput.emitSkipped && diagnostics.length > 0) {
                // If the emitter didn't emit anything, then pass that value along.
                return ts.ExitStatus.DiagnosticsPresent_OutputsSkipped;
            }
            else if (diagnostics.length > 0) {
                // The emitter emitted something, inform the caller if that happened in the presence
                // of diagnostics or not.
                return ts.ExitStatus.DiagnosticsPresent_OutputsGenerated;
            }
            return ts.ExitStatus.Success;
        }
    }
    function printVersion() {
        ts.sys.write(getDiagnosticText(ts.Diagnostics.Version_0, ts.version) + ts.sys.newLine);
    }
    function printHelp() {
        var output = "";
        // We want to align our "syntax" and "examples" commands to a certain margin.
        var syntaxLength = getDiagnosticText(ts.Diagnostics.Syntax_Colon_0, "").length;
        var examplesLength = getDiagnosticText(ts.Diagnostics.Examples_Colon_0, "").length;
        var marginLength = Math.max(syntaxLength, examplesLength);
        // Build up the syntactic skeleton.
        var syntax = makePadding(marginLength - syntaxLength);
        syntax += "tsc [" + getDiagnosticText(ts.Diagnostics.options) + "] [" + getDiagnosticText(ts.Diagnostics.file) + " ...]";
        output += getDiagnosticText(ts.Diagnostics.Syntax_Colon_0, syntax);
        output += ts.sys.newLine + ts.sys.newLine;
        // Build up the list of examples.
        var padding = makePadding(marginLength);
        output += getDiagnosticText(ts.Diagnostics.Examples_Colon_0, makePadding(marginLength - examplesLength) + "tsc hello.ts") + ts.sys.newLine;
        output += padding + "tsc --out file.js file.ts" + ts.sys.newLine;
        output += padding + "tsc @args.txt" + ts.sys.newLine;
        output += ts.sys.newLine;
        output += getDiagnosticText(ts.Diagnostics.Options_Colon) + ts.sys.newLine;
        // Sort our options by their names, (e.g. "--noImplicitAny" comes before "--watch")
        var optsList = ts.filter(ts.optionDeclarations.slice(), function (v) { return !v.experimental; });
        optsList.sort(function (a, b) { return ts.compareValues(a.name.toLowerCase(), b.name.toLowerCase()); });
        // We want our descriptions to align at the same column in our output,
        // so we keep track of the longest option usage string.
        marginLength = 0;
        var usageColumn = []; // Things like "-d, --declaration" go in here.
        var descriptionColumn = [];
        var optionsDescriptionMap = {}; // Map between option.description and list of option.type if it is a kind
        var _loop_1 = function(i) {
            var option = optsList[i];
            // If an option lacks a description,
            // it is not officially supported.
            if (!option.description) {
                return "continue";
            }
            var usageText_1 = " ";
            if (option.shortName) {
                usageText_1 += "-" + option.shortName;
                usageText_1 += getParamType(option);
                usageText_1 += ", ";
            }
            usageText_1 += "--" + option.name;
            usageText_1 += getParamType(option);
            usageColumn.push(usageText_1);
            var description = void 0;
            if (option.name === "lib") {
                description = getDiagnosticText(option.description);
                var options_1 = [];
                var element = option.element;
                ts.forEachKey(element.type, function (key) {
                    options_1.push("'" + key + "'");
                });
                optionsDescriptionMap[description] = options_1;
            }
            else {
                description = getDiagnosticText(option.description);
            }
            descriptionColumn.push(description);
            // Set the new margin for the description column if necessary.
            marginLength = Math.max(usageText_1.length, marginLength);
        };
        for (var i = 0; i < optsList.length; i++) {
            var state_1 = _loop_1(i);
            if (state_1 === "continue") continue;
        }
        // Special case that can't fit in the loop.
        var usageText = " @<" + getDiagnosticText(ts.Diagnostics.file) + ">";
        usageColumn.push(usageText);
        descriptionColumn.push(getDiagnosticText(ts.Diagnostics.Insert_command_line_options_and_files_from_a_file));
        marginLength = Math.max(usageText.length, marginLength);
        // Print out each row, aligning all the descriptions on the same column.
        for (var i = 0; i < usageColumn.length; i++) {
            var usage = usageColumn[i];
            var description = descriptionColumn[i];
            var kindsList = optionsDescriptionMap[description];
            output += usage + makePadding(marginLength - usage.length + 2) + description + ts.sys.newLine;
            if (kindsList) {
                output += makePadding(marginLength + 4);
                for (var _i = 0, kindsList_1 = kindsList; _i < kindsList_1.length; _i++) {
                    var kind = kindsList_1[_i];
                    output += kind + " ";
                }
                output += ts.sys.newLine;
            }
        }
        ts.sys.write(output);
        return;
        function getParamType(option) {
            if (option.paramType !== undefined) {
                return " " + getDiagnosticText(option.paramType);
            }
            return "";
        }
        function makePadding(paddingLength) {
            return Array(paddingLength + 1).join(" ");
        }
    }
    function writeConfigFile(options, fileNames) {
        var currentDirectory = ts.sys.getCurrentDirectory();
        var file = ts.normalizePath(ts.combinePaths(currentDirectory, "tsconfig.json"));
        if (ts.sys.fileExists(file)) {
            reportDiagnostic(ts.createCompilerDiagnostic(ts.Diagnostics.A_tsconfig_json_file_is_already_defined_at_Colon_0, file), /* compilerHost */ undefined);
        }
        else {
            var compilerOptions = ts.extend(options, ts.defaultInitCompilerOptions);
            var configurations = {
                compilerOptions: serializeCompilerOptions(compilerOptions)
            };
            if (fileNames && fileNames.length) {
                // only set the files property if we have at least one file
                configurations.files = fileNames;
            }
            else {
                configurations.exclude = ["node_modules"];
                if (compilerOptions.outDir) {
                    configurations.exclude.push(compilerOptions.outDir);
                }
            }
            ts.sys.writeFile(file, JSON.stringify(configurations, undefined, 4));
            reportDiagnostic(ts.createCompilerDiagnostic(ts.Diagnostics.Successfully_created_a_tsconfig_json_file), /* compilerHost */ undefined);
        }
        return;
        function serializeCompilerOptions(options) {
            var result = {};
            var optionsNameMap = ts.getOptionNameMap().optionNameMap;
            for (var name_1 in options) {
                if (ts.hasProperty(options, name_1)) {
                    // tsconfig only options cannot be specified via command line,
                    // so we can assume that only types that can appear here string | number | boolean
                    var value = options[name_1];
                    switch (name_1) {
                        case "init":
                        case "watch":
                        case "version":
                        case "help":
                        case "project":
                            break;
                        default:
                            var optionDefinition = optionsNameMap[name_1.toLowerCase()];
                            if (optionDefinition) {
                                if (typeof optionDefinition.type === "string") {
                                    // string, number or boolean
                                    result[name_1] = value;
                                }
                                else {
                                    // Enum
                                    var typeMap = optionDefinition.type;
                                    for (var key in typeMap) {
                                        if (ts.hasProperty(typeMap, key)) {
                                            if (typeMap[key] === value)
                                                result[name_1] = key;
                                        }
                                    }
                                }
                            }
                            break;
                    }
                }
            }
            return result;
        }
    }
    var _a;
})(ts || (ts = {}));
ts.executeCommandLine(ts.sys.args);
//# sourceMappingURL=tsc.js.map