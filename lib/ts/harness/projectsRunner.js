///<reference path="harness.ts" />
///<reference path="runnerbase.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ProjectRunner = (function (_super) {
    __extends(ProjectRunner, _super);
    function ProjectRunner() {
        _super.apply(this, arguments);
    }
    ProjectRunner.prototype.enumerateTestFiles = function () {
        return this.enumerateFiles("tests/cases/project", /\.json$/, { recursive: true });
    };
    ProjectRunner.prototype.kind = function () {
        return "project";
    };
    ProjectRunner.prototype.initializeTests = function () {
        var _this = this;
        if (this.tests.length === 0) {
            var testFiles = this.enumerateTestFiles();
            testFiles.forEach(function (fn) {
                _this.runProjectTestCase(fn);
            });
        }
        else {
            this.tests.forEach(function (test) { return _this.runProjectTestCase(test); });
        }
    };
    ProjectRunner.prototype.runProjectTestCase = function (testCaseFileName) {
        var testCase;
        var testFileText;
        try {
            testFileText = Harness.IO.readFile(testCaseFileName);
        }
        catch (e) {
            assert(false, "Unable to open testcase file: " + testCaseFileName + ": " + e.message);
        }
        try {
            testCase = JSON.parse(testFileText);
        }
        catch (e) {
            assert(false, "Testcase: " + testCaseFileName + " does not contain valid json format: " + e.message);
        }
        var testCaseJustName = testCaseFileName.replace(/^.*[\\\/]/, "").replace(/\.json/, "");
        function moduleNameToString(moduleKind) {
            return moduleKind === ts.ModuleKind.AMD
                ? "amd"
                : moduleKind === ts.ModuleKind.CommonJS
                    ? "node"
                    : "none";
        }
        // Project baselines verified go in project/testCaseName/moduleKind/
        function getBaselineFolder(moduleKind) {
            return "project/" + testCaseJustName + "/" + moduleNameToString(moduleKind) + "/";
        }
        // When test case output goes to tests/baselines/local/projectOutput/testCaseName/moduleKind/
        // We have these two separate locations because when comparing baselines the baseline verifier will delete the existing file
        // so even if it was created by compiler in that location, the file will be deleted by verified before we can read it
        // so lets keep these two locations separate
        function getProjectOutputFolder(fileName, moduleKind) {
            return Harness.Baseline.localPath("projectOutput/" + testCaseJustName + "/" + moduleNameToString(moduleKind) + "/" + fileName);
        }
        function cleanProjectUrl(url) {
            var diskProjectPath = ts.normalizeSlashes(Harness.IO.resolvePath(testCase.projectRoot));
            var projectRootUrl = "file:///" + diskProjectPath;
            var normalizedProjectRoot = ts.normalizeSlashes(testCase.projectRoot);
            diskProjectPath = diskProjectPath.substr(0, diskProjectPath.lastIndexOf(normalizedProjectRoot));
            projectRootUrl = projectRootUrl.substr(0, projectRootUrl.lastIndexOf(normalizedProjectRoot));
            if (url && url.length) {
                if (url.indexOf(projectRootUrl) === 0) {
                    // replace the disk specific project url path into project root url
                    url = "file:///" + url.substr(projectRootUrl.length);
                }
                else if (url.indexOf(diskProjectPath) === 0) {
                    // Replace the disk specific path into the project root path
                    url = url.substr(diskProjectPath.length);
                    // TODO: should be '!=='?
                    if (url.charCodeAt(0) != ts.CharacterCodes.slash) {
                        url = "/" + url;
                    }
                }
            }
            return url;
        }
        function getCurrentDirectory() {
            return Harness.IO.resolvePath(testCase.projectRoot);
        }
        function compileProjectFiles(moduleKind, getInputFiles, getSourceFileTextImpl, writeFile, compilerOptions) {
            var program = ts.createProgram(getInputFiles(), compilerOptions, createCompilerHost());
            var errors = ts.getPreEmitDiagnostics(program);
            var emitResult = program.emit();
            errors = ts.concatenate(errors, emitResult.diagnostics);
            var sourceMapData = emitResult.sourceMaps;
            // Clean up source map data that will be used in baselining
            if (sourceMapData) {
                for (var i = 0; i < sourceMapData.length; i++) {
                    for (var j = 0; j < sourceMapData[i].sourceMapSources.length; j++) {
                        sourceMapData[i].sourceMapSources[j] = cleanProjectUrl(sourceMapData[i].sourceMapSources[j]);
                    }
                    sourceMapData[i].jsSourceMappingURL = cleanProjectUrl(sourceMapData[i].jsSourceMappingURL);
                    sourceMapData[i].sourceMapSourceRoot = cleanProjectUrl(sourceMapData[i].sourceMapSourceRoot);
                }
            }
            return {
                moduleKind: moduleKind,
                program: program,
                errors: errors,
                sourceMapData: sourceMapData
            };
            function getSourceFileText(fileName) {
                var text = getSourceFileTextImpl(fileName);
                return text !== undefined ? text : getSourceFileTextImpl(ts.getNormalizedAbsolutePath(fileName, getCurrentDirectory()));
            }
            function getSourceFile(fileName, languageVersion) {
                var sourceFile = undefined;
                if (fileName === Harness.Compiler.defaultLibFileName) {
                    sourceFile = Harness.Compiler.getDefaultLibrarySourceFile(Harness.Compiler.getDefaultLibFileName(compilerOptions));
                }
                else {
                    var text = getSourceFileText(fileName);
                    if (text !== undefined) {
                        sourceFile = Harness.Compiler.createSourceFileAndAssertInvariants(fileName, text, languageVersion);
                    }
                }
                return sourceFile;
            }
            function createCompilerHost() {
                return {
                    getSourceFile: getSourceFile,
                    getDefaultLibFileName: function (options) { return Harness.Compiler.defaultLibFileName; },
                    writeFile: writeFile,
                    getCurrentDirectory: getCurrentDirectory,
                    getCanonicalFileName: Harness.Compiler.getCanonicalFileName,
                    useCaseSensitiveFileNames: function () { return Harness.IO.useCaseSensitiveFileNames(); },
                    getNewLine: function () { return Harness.IO.newLine(); },
                    fileExists: function (fileName) { return fileName === Harness.Compiler.defaultLibFileName || getSourceFileText(fileName) !== undefined; },
                    readFile: function (fileName) { return Harness.IO.readFile(fileName); },
                    getDirectories: function (path) { return Harness.IO.getDirectories(path); }
                };
            }
        }
        function batchCompilerProjectTestCase(moduleKind) {
            var nonSubfolderDiskFiles = 0;
            var outputFiles = [];
            var inputFiles = testCase.inputFiles;
            var compilerOptions = createCompilerOptions();
            var configFileName;
            if (compilerOptions.project) {
                // Parse project
                configFileName = ts.normalizePath(ts.combinePaths(compilerOptions.project, "tsconfig.json"));
                assert(!inputFiles || inputFiles.length === 0, "cannot specify input files and project option together");
            }
            else if (!inputFiles || inputFiles.length === 0) {
                configFileName = ts.findConfigFile("", fileExists);
            }
            if (configFileName) {
                var result = ts.readConfigFile(configFileName, getSourceFileText);
                if (result.error) {
                    return {
                        moduleKind: moduleKind,
                        errors: [result.error]
                    };
                }
                var configObject = result.config;
                var configParseHost = {
                    useCaseSensitiveFileNames: Harness.IO.useCaseSensitiveFileNames(),
                    fileExists: fileExists,
                    readDirectory: readDirectory,
                };
                var configParseResult = ts.parseJsonConfigFileContent(configObject, configParseHost, ts.getDirectoryPath(configFileName), compilerOptions);
                if (configParseResult.errors.length > 0) {
                    return {
                        moduleKind: moduleKind,
                        errors: configParseResult.errors
                    };
                }
                inputFiles = configParseResult.fileNames;
                compilerOptions = configParseResult.options;
            }
            var projectCompilerResult = compileProjectFiles(moduleKind, function () { return inputFiles; }, getSourceFileText, writeFile, compilerOptions);
            return {
                moduleKind: moduleKind,
                program: projectCompilerResult.program,
                compilerOptions: compilerOptions,
                sourceMapData: projectCompilerResult.sourceMapData,
                outputFiles: outputFiles,
                errors: projectCompilerResult.errors,
            };
            function createCompilerOptions() {
                // Set the special options that depend on other testcase options
                var compilerOptions = {
                    mapRoot: testCase.resolveMapRoot && testCase.mapRoot ? Harness.IO.resolvePath(testCase.mapRoot) : testCase.mapRoot,
                    sourceRoot: testCase.resolveSourceRoot && testCase.sourceRoot ? Harness.IO.resolvePath(testCase.sourceRoot) : testCase.sourceRoot,
                    module: moduleKind,
                    moduleResolution: ts.ModuleResolutionKind.Classic,
                };
                // Set the values specified using json
                var optionNameMap = {};
                ts.forEach(ts.optionDeclarations, function (option) {
                    optionNameMap[option.name] = option;
                });
                for (var name_1 in testCase) {
                    if (name_1 !== "mapRoot" && name_1 !== "sourceRoot" && ts.hasProperty(optionNameMap, name_1)) {
                        var option = optionNameMap[name_1];
                        var optType = option.type;
                        var value = testCase[name_1];
                        if (typeof optType !== "string") {
                            var key = value.toLowerCase();
                            if (ts.hasProperty(optType, key)) {
                                value = optType[key];
                            }
                        }
                        compilerOptions[option.name] = value;
                    }
                }
                return compilerOptions;
            }
            function getFileNameInTheProjectTest(fileName) {
                return ts.isRootedDiskPath(fileName)
                    ? fileName
                    : ts.normalizeSlashes(testCase.projectRoot) + "/" + ts.normalizeSlashes(fileName);
            }
            function readDirectory(rootDir, extension, exclude, include) {
                var harnessReadDirectoryResult = Harness.IO.readDirectory(getFileNameInTheProjectTest(rootDir), extension, exclude, include);
                var result = [];
                for (var i = 0; i < harnessReadDirectoryResult.length; i++) {
                    result[i] = ts.getRelativePathToDirectoryOrUrl(testCase.projectRoot, harnessReadDirectoryResult[i], getCurrentDirectory(), Harness.Compiler.getCanonicalFileName, /*isAbsolutePathAnUrl*/ false);
                }
                return result;
            }
            function fileExists(fileName) {
                return Harness.IO.fileExists(getFileNameInTheProjectTest(fileName));
            }
            function getSourceFileText(fileName) {
                var text = undefined;
                try {
                    text = Harness.IO.readFile(getFileNameInTheProjectTest(fileName));
                }
                catch (e) {
                }
                return text;
            }
            function writeFile(fileName, data, writeByteOrderMark) {
                // convert file name to rooted name
                // if filename is not rooted - concat it with project root and then expand project root relative to current directory
                var diskFileName = ts.isRootedDiskPath(fileName)
                    ? fileName
                    : Harness.IO.resolvePath(ts.normalizeSlashes(testCase.projectRoot) + "/" + ts.normalizeSlashes(fileName));
                var currentDirectory = getCurrentDirectory();
                // compute file name relative to current directory (expanded project root)
                var diskRelativeName = ts.getRelativePathToDirectoryOrUrl(currentDirectory, diskFileName, currentDirectory, Harness.Compiler.getCanonicalFileName, /*isAbsolutePathAnUrl*/ false);
                if (ts.isRootedDiskPath(diskRelativeName) || diskRelativeName.substr(0, 3) === "../") {
                    // If the generated output file resides in the parent folder or is rooted path,
                    // we need to instead create files that can live in the project reference folder
                    // but make sure extension of these files matches with the fileName the compiler asked to write
                    diskRelativeName = "diskFile" + nonSubfolderDiskFiles +
                        (Harness.Compiler.isDTS(fileName) ? ".d.ts" :
                            Harness.Compiler.isJS(fileName) ? ".js" : ".js.map");
                    nonSubfolderDiskFiles++;
                }
                if (Harness.Compiler.isJS(fileName)) {
                    // Make sure if there is URl we have it cleaned up
                    var indexOfSourceMapUrl = data.lastIndexOf("//# sourceMappingURL=");
                    if (indexOfSourceMapUrl !== -1) {
                        data = data.substring(0, indexOfSourceMapUrl + 21) + cleanProjectUrl(data.substring(indexOfSourceMapUrl + 21));
                    }
                }
                else if (Harness.Compiler.isJSMap(fileName)) {
                    // Make sure sources list is cleaned
                    var sourceMapData = JSON.parse(data);
                    for (var i = 0; i < sourceMapData.sources.length; i++) {
                        sourceMapData.sources[i] = cleanProjectUrl(sourceMapData.sources[i]);
                    }
                    sourceMapData.sourceRoot = cleanProjectUrl(sourceMapData.sourceRoot);
                    data = JSON.stringify(sourceMapData);
                }
                var outputFilePath = getProjectOutputFolder(diskRelativeName, moduleKind);
                // Actual writing of file as in tc.ts
                function ensureDirectoryStructure(directoryname) {
                    if (directoryname) {
                        if (!Harness.IO.directoryExists(directoryname)) {
                            ensureDirectoryStructure(ts.getDirectoryPath(directoryname));
                            Harness.IO.createDirectory(directoryname);
                        }
                    }
                }
                ensureDirectoryStructure(ts.getDirectoryPath(ts.normalizePath(outputFilePath)));
                Harness.IO.writeFile(outputFilePath, data);
                outputFiles.push({ emittedFileName: fileName, code: data, fileName: diskRelativeName, writeByteOrderMark: writeByteOrderMark });
            }
        }
        function compileCompileDTsFiles(compilerResult) {
            var allInputFiles = [];
            if (!compilerResult.program) {
                return;
            }
            var compilerOptions = compilerResult.program.getCompilerOptions();
            ts.forEach(compilerResult.program.getSourceFiles(), function (sourceFile) {
                if (ts.isDeclarationFile(sourceFile)) {
                    allInputFiles.unshift({ emittedFileName: sourceFile.fileName, code: sourceFile.text });
                }
                else if (!(compilerOptions.outFile || compilerOptions.out)) {
                    var emitOutputFilePathWithoutExtension = undefined;
                    if (compilerOptions.outDir) {
                        var sourceFilePath = ts.getNormalizedAbsolutePath(sourceFile.fileName, compilerResult.program.getCurrentDirectory());
                        sourceFilePath = sourceFilePath.replace(compilerResult.program.getCommonSourceDirectory(), "");
                        emitOutputFilePathWithoutExtension = ts.removeFileExtension(ts.combinePaths(compilerOptions.outDir, sourceFilePath));
                    }
                    else {
                        emitOutputFilePathWithoutExtension = ts.removeFileExtension(sourceFile.fileName);
                    }
                    var outputDtsFileName = emitOutputFilePathWithoutExtension + ".d.ts";
                    var file = findOutputDtsFile(outputDtsFileName);
                    if (file) {
                        allInputFiles.unshift(file);
                    }
                }
                else {
                    var outputDtsFileName = ts.removeFileExtension(compilerOptions.outFile || compilerOptions.out) + ".d.ts";
                    var outputDtsFile = findOutputDtsFile(outputDtsFileName);
                    if (!ts.contains(allInputFiles, outputDtsFile)) {
                        allInputFiles.unshift(outputDtsFile);
                    }
                }
            });
            // Dont allow config files since we are compiling existing source options
            return compileProjectFiles(compilerResult.moduleKind, getInputFiles, getSourceFileText, writeFile, compilerResult.compilerOptions);
            function findOutputDtsFile(fileName) {
                return ts.forEach(compilerResult.outputFiles, function (outputFile) { return outputFile.emittedFileName === fileName ? outputFile : undefined; });
            }
            function getInputFiles() {
                return ts.map(allInputFiles, function (outputFile) { return outputFile.emittedFileName; });
            }
            function getSourceFileText(fileName) {
                for (var _i = 0, allInputFiles_1 = allInputFiles; _i < allInputFiles_1.length; _i++) {
                    var inputFile = allInputFiles_1[_i];
                    var isMatchingFile = ts.isRootedDiskPath(fileName)
                        ? ts.getNormalizedAbsolutePath(inputFile.emittedFileName, getCurrentDirectory()) === fileName
                        : inputFile.emittedFileName === fileName;
                    if (isMatchingFile) {
                        return inputFile.code;
                    }
                }
                return undefined;
            }
            function writeFile(fileName, data, writeByteOrderMark) {
            }
        }
        function getErrorsBaseline(compilerResult) {
            var inputFiles = compilerResult.program ? ts.map(ts.filter(compilerResult.program.getSourceFiles(), function (sourceFile) { return !Harness.isDefaultLibraryFile(sourceFile.fileName); }), function (sourceFile) {
                return {
                    unitName: ts.isRootedDiskPath(sourceFile.fileName) ?
                        RunnerBase.removeFullPaths(sourceFile.fileName) :
                        sourceFile.fileName,
                    content: sourceFile.text
                };
            }) : [];
            return Harness.Compiler.getErrorBaseline(inputFiles, compilerResult.errors);
        }
        var name = "Compiling project for " + testCase.scenario + ": testcase " + testCaseFileName;
        describe("Projects tests", function () {
            describe(name, function () {
                function verifyCompilerResults(moduleKind) {
                    var compilerResult;
                    function getCompilerResolutionInfo() {
                        var resolutionInfo = JSON.parse(JSON.stringify(testCase));
                        resolutionInfo.resolvedInputFiles = ts.map(compilerResult.program.getSourceFiles(), function (inputFile) {
                            return ts.convertToRelativePath(inputFile.fileName, getCurrentDirectory(), function (path) { return Harness.Compiler.getCanonicalFileName(path); });
                        });
                        resolutionInfo.emittedFiles = ts.map(compilerResult.outputFiles, function (outputFile) {
                            return ts.convertToRelativePath(outputFile.emittedFileName, getCurrentDirectory(), function (path) { return Harness.Compiler.getCanonicalFileName(path); });
                        });
                        return resolutionInfo;
                    }
                    it(name + ": " + moduleNameToString(moduleKind), function () {
                        // Compile using node
                        compilerResult = batchCompilerProjectTestCase(moduleKind);
                    });
                    it("Resolution information of (" + moduleNameToString(moduleKind) + "): " + testCaseFileName, function () {
                        Harness.Baseline.runBaseline("Resolution information of (" + moduleNameToString(compilerResult.moduleKind) + "): " + testCaseFileName, getBaselineFolder(compilerResult.moduleKind) + testCaseJustName + ".json", function () {
                            return JSON.stringify(getCompilerResolutionInfo(), undefined, "    ");
                        });
                    });
                    it("Errors for (" + moduleNameToString(moduleKind) + "): " + testCaseFileName, function () {
                        if (compilerResult.errors.length) {
                            Harness.Baseline.runBaseline("Errors for (" + moduleNameToString(compilerResult.moduleKind) + "): " + testCaseFileName, getBaselineFolder(compilerResult.moduleKind) + testCaseJustName + ".errors.txt", function () {
                                return getErrorsBaseline(compilerResult);
                            });
                        }
                    });
                    it("Baseline of emitted result (" + moduleNameToString(moduleKind) + "): " + testCaseFileName, function () {
                        if (testCase.baselineCheck) {
                            ts.forEach(compilerResult.outputFiles, function (outputFile) {
                                Harness.Baseline.runBaseline("Baseline of emitted result (" + moduleNameToString(compilerResult.moduleKind) + "): " + testCaseFileName, getBaselineFolder(compilerResult.moduleKind) + outputFile.fileName, function () {
                                    try {
                                        return Harness.IO.readFile(getProjectOutputFolder(outputFile.fileName, compilerResult.moduleKind));
                                    }
                                    catch (e) {
                                        return undefined;
                                    }
                                });
                            });
                        }
                    });
                    it("SourceMapRecord for (" + moduleNameToString(moduleKind) + "): " + testCaseFileName, function () {
                        if (compilerResult.sourceMapData) {
                            Harness.Baseline.runBaseline("SourceMapRecord for (" + moduleNameToString(compilerResult.moduleKind) + "): " + testCaseFileName, getBaselineFolder(compilerResult.moduleKind) + testCaseJustName + ".sourcemap.txt", function () {
                                return Harness.SourceMapRecorder.getSourceMapRecord(compilerResult.sourceMapData, compilerResult.program, ts.filter(compilerResult.outputFiles, function (outputFile) { return Harness.Compiler.isJS(outputFile.emittedFileName); }));
                            });
                        }
                    });
                    // Verify that all the generated .d.ts files compile
                    it("Errors in generated Dts files for (" + moduleNameToString(moduleKind) + "): " + testCaseFileName, function () {
                        if (!compilerResult.errors.length && testCase.declaration) {
                            var dTsCompileResult_1 = compileCompileDTsFiles(compilerResult);
                            if (dTsCompileResult_1 && dTsCompileResult_1.errors.length) {
                                Harness.Baseline.runBaseline("Errors in generated Dts files for (" + moduleNameToString(compilerResult.moduleKind) + "): " + testCaseFileName, getBaselineFolder(compilerResult.moduleKind) + testCaseJustName + ".dts.errors.txt", function () {
                                    return getErrorsBaseline(dTsCompileResult_1);
                                });
                            }
                        }
                    });
                    after(function () {
                        compilerResult = undefined;
                    });
                }
                verifyCompilerResults(ts.ModuleKind.CommonJS);
                verifyCompilerResults(ts.ModuleKind.AMD);
                after(function () {
                    // Mocha holds onto the closure environment of the describe callback even after the test is done.
                    // Therefore we have to clean out large objects after the test is done.
                    testCase = undefined;
                    testFileText = undefined;
                    testCaseJustName = undefined;
                });
            });
        });
    };
    return ProjectRunner;
}(RunnerBase));
//# sourceMappingURL=projectsRunner.js.map