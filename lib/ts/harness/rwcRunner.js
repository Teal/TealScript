/// <reference path="harness.ts"/>
/// <reference path="runnerbase.ts" />
/// <reference path="loggedIO.ts" />
/// <reference path="..\compiler\commandLineParser.ts"/>
// In harness baselines, null is different than undefined. See `generateActual` in `harness.ts`.
/* tslint:disable:no-null-keyword */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RWC;
(function (RWC) {
    function runWithIOLog(ioLog, fn) {
        var oldIO = Harness.IO;
        var wrappedIO = Playback.wrapIO(oldIO);
        wrappedIO.startReplayFromData(ioLog);
        Harness.IO = wrappedIO;
        try {
            fn(oldIO);
        }
        finally {
            wrappedIO.endReplay();
            Harness.IO = oldIO;
        }
    }
    function isTsConfigFile(file) {
        var tsConfigFileName = "tsconfig.json";
        return file.path.substr(file.path.length - tsConfigFileName.length).toLowerCase() === tsConfigFileName;
    }
    function runRWCTest(jsonPath) {
        describe("Testing a RWC project: " + jsonPath, function () {
            var inputFiles = [];
            var otherFiles = [];
            var compilerResult;
            var compilerOptions;
            var baselineOpts = {
                Subfolder: "rwc",
                Baselinefolder: "internal/baselines"
            };
            var baseName = /(.*)\/(.*).json/.exec(ts.normalizeSlashes(jsonPath))[2];
            var currentDirectory;
            var useCustomLibraryFile;
            after(function () {
                // Mocha holds onto the closure environment of the describe callback even after the test is done.
                // Therefore we have to clean out large objects after the test is done.
                inputFiles = [];
                otherFiles = [];
                compilerResult = undefined;
                compilerOptions = undefined;
                currentDirectory = undefined;
                // useCustomLibraryFile is a flag specified in the json object to indicate whether to use built/local/lib.d.ts
                // or to use lib.d.ts inside the json object. If the flag is true, use the lib.d.ts inside json file
                // otherwise use the lib.d.ts from built/local
                useCustomLibraryFile = undefined;
            });
            it("can compile", function () {
                var opts;
                var ioLog = JSON.parse(Harness.IO.readFile(jsonPath));
                currentDirectory = ioLog.currentDirectory;
                useCustomLibraryFile = ioLog.useCustomLibraryFile;
                runWithIOLog(ioLog, function () {
                    opts = ts.parseCommandLine(ioLog.arguments, function (fileName) { return Harness.IO.readFile(fileName); });
                    assert.equal(opts.errors.length, 0);
                    // To provide test coverage of output javascript file,
                    // we will set noEmitOnError flag to be false.
                    opts.options.noEmitOnError = false;
                });
                runWithIOLog(ioLog, function (oldIO) {
                    var fileNames = opts.fileNames;
                    var tsconfigFile = ts.forEach(ioLog.filesRead, function (f) { return isTsConfigFile(f) ? f : undefined; });
                    if (tsconfigFile) {
                        var tsconfigFileContents = getHarnessCompilerInputUnit(tsconfigFile.path);
                        var parsedTsconfigFileContents = ts.parseConfigFileTextToJson(tsconfigFile.path, tsconfigFileContents.content);
                        var configParseHost = {
                            useCaseSensitiveFileNames: Harness.IO.useCaseSensitiveFileNames(),
                            fileExists: Harness.IO.fileExists,
                            readDirectory: Harness.IO.readDirectory,
                        };
                        var configParseResult = ts.parseJsonConfigFileContent(parsedTsconfigFileContents.config, configParseHost, ts.getDirectoryPath(tsconfigFile.path));
                        fileNames = configParseResult.fileNames;
                        opts.options = ts.extend(opts.options, configParseResult.options);
                    }
                    // Load the files
                    for (var _i = 0, fileNames_1 = fileNames; _i < fileNames_1.length; _i++) {
                        var fileName = fileNames_1[_i];
                        inputFiles.push(getHarnessCompilerInputUnit(fileName));
                    }
                    // Add files to compilation
                    var isInInputList = function (resolvedPath) { return function (inputFile) { return inputFile.unitName === resolvedPath; }; };
                    for (var _a = 0, _b = ioLog.filesRead; _a < _b.length; _a++) {
                        var fileRead = _b[_a];
                        // Check if the file is already added into the set of input files.
                        var resolvedPath = ts.normalizeSlashes(Harness.IO.resolvePath(fileRead.path));
                        var inInputList = ts.forEach(inputFiles, isInInputList(resolvedPath));
                        if (isTsConfigFile(fileRead)) {
                            continue;
                        }
                        if (!Harness.isDefaultLibraryFile(fileRead.path)) {
                            if (inInputList) {
                                continue;
                            }
                            otherFiles.push(getHarnessCompilerInputUnit(fileRead.path));
                        }
                        else if (!opts.options.noLib && Harness.isDefaultLibraryFile(fileRead.path)) {
                            if (!inInputList) {
                                // If useCustomLibraryFile is true, we will use lib.d.ts from json object
                                // otherwise use the lib.d.ts from built/local
                                // Majority of RWC code will be using built/local/lib.d.ts instead of
                                // lib.d.ts inside json file. However, some RWC cases will still use
                                // their own version of lib.d.ts because they have customized lib.d.ts
                                if (useCustomLibraryFile) {
                                    inputFiles.push(getHarnessCompilerInputUnit(fileRead.path));
                                }
                                else {
                                    // set the flag to put default library to the beginning of the list
                                    inputFiles.unshift(Harness.getDefaultLibraryFile(oldIO));
                                }
                            }
                        }
                    }
                    // do not use lib since we already read it in above
                    opts.options.noLib = true;
                    // Emit the results
                    compilerOptions = undefined;
                    var output = Harness.Compiler.compileFiles(inputFiles, otherFiles, 
                    /* harnessOptions */ undefined, opts.options, 
                    // Since each RWC json file specifies its current directory in its json file, we need
                    // to pass this information in explicitly instead of acquiring it from the process.
                    currentDirectory);
                    compilerOptions = output.options;
                    compilerResult = output.result;
                });
                function getHarnessCompilerInputUnit(fileName) {
                    var unitName = ts.normalizeSlashes(Harness.IO.resolvePath(fileName));
                    var content;
                    try {
                        content = Harness.IO.readFile(unitName);
                    }
                    catch (e) {
                        content = Harness.IO.readFile(fileName);
                    }
                    return { unitName: unitName, content: content };
                }
            });
            it("has the expected emitted code", function () {
                Harness.Baseline.runBaseline("has the expected emitted code", baseName + ".output.js", function () {
                    return Harness.Compiler.collateOutputs(compilerResult.files);
                }, false, baselineOpts);
            });
            it("has the expected declaration file content", function () {
                Harness.Baseline.runBaseline("has the expected declaration file content", baseName + ".d.ts", function () {
                    if (!compilerResult.declFilesCode.length) {
                        return null;
                    }
                    return Harness.Compiler.collateOutputs(compilerResult.declFilesCode);
                }, false, baselineOpts);
            });
            it("has the expected source maps", function () {
                Harness.Baseline.runBaseline("has the expected source maps", baseName + ".map", function () {
                    if (!compilerResult.sourceMaps.length) {
                        return null;
                    }
                    return Harness.Compiler.collateOutputs(compilerResult.sourceMaps);
                }, false, baselineOpts);
            });
            /*it("has correct source map record", () => {
                if (compilerOptions.sourceMap) {
                    Harness.Baseline.runBaseline("has correct source map record", baseName + ".sourcemap.txt", () => {
                        return compilerResult.getSourceMapRecord();
                    }, false, baselineOpts);
                }
            });*/
            it("has the expected errors", function () {
                Harness.Baseline.runBaseline("has the expected errors", baseName + ".errors.txt", function () {
                    if (compilerResult.errors.length === 0) {
                        return null;
                    }
                    // Do not include the library in the baselines to avoid noise
                    var baselineFiles = inputFiles.concat(otherFiles).filter(function (f) { return !Harness.isDefaultLibraryFile(f.unitName); });
                    return Harness.Compiler.getErrorBaseline(baselineFiles, compilerResult.errors);
                }, false, baselineOpts);
            });
            // Ideally, a generated declaration file will have no errors. But we allow generated
            // declaration file errors as part of the baseline.
            it("has the expected errors in generated declaration files", function () {
                if (compilerOptions.declaration && !compilerResult.errors.length) {
                    Harness.Baseline.runBaseline("has the expected errors in generated declaration files", baseName + ".dts.errors.txt", function () {
                        var declFileCompilationResult = Harness.Compiler.compileDeclarationFiles(inputFiles, otherFiles, compilerResult, /*harnessSettings*/ undefined, compilerOptions, currentDirectory);
                        if (declFileCompilationResult.declResult.errors.length === 0) {
                            return null;
                        }
                        return Harness.Compiler.minimalDiagnosticsToString(declFileCompilationResult.declResult.errors) +
                            Harness.IO.newLine() + Harness.IO.newLine() +
                            Harness.Compiler.getErrorBaseline(declFileCompilationResult.declInputFiles.concat(declFileCompilationResult.declOtherFiles), declFileCompilationResult.declResult.errors);
                    }, false, baselineOpts);
                }
            });
            // TODO: Type baselines (need to refactor out from compilerRunner)
        });
    }
    RWC.runRWCTest = runRWCTest;
})(RWC || (RWC = {}));
var RWCRunner = (function (_super) {
    __extends(RWCRunner, _super);
    function RWCRunner() {
        _super.apply(this, arguments);
    }
    RWCRunner.prototype.enumerateTestFiles = function () {
        return Harness.IO.listFiles(RWCRunner.sourcePath, /.+\.json$/);
    };
    RWCRunner.prototype.kind = function () {
        return "rwc";
    };
    /** Setup the runner's tests so that they are ready to be executed by the harness
     *  The first test should be a describe/it block that sets up the harness's compiler instance appropriately
     */
    RWCRunner.prototype.initializeTests = function () {
        // Read in and evaluate the test list
        var testList = this.enumerateTestFiles();
        for (var i = 0; i < testList.length; i++) {
            this.runTest(testList[i]);
        }
    };
    RWCRunner.prototype.runTest = function (jsonFileName) {
        RWC.runRWCTest(jsonFileName);
    };
    RWCRunner.sourcePath = "internal/cases/rwc/";
    return RWCRunner;
}(RunnerBase));
//# sourceMappingURL=rwcRunner.js.map