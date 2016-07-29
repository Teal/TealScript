/// <reference path="harness.ts" />
/// <reference path="runnerbase.ts" />
// In harness baselines, null is different than undefined. See `generateActual` in `harness.ts`.
/* tslint:disable:no-null-keyword */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Test262BaselineRunner = (function (_super) {
    __extends(Test262BaselineRunner, _super);
    function Test262BaselineRunner() {
        _super.apply(this, arguments);
    }
    Test262BaselineRunner.getTestFilePath = function (filename) {
        return Test262BaselineRunner.basePath + "/" + filename;
    };
    Test262BaselineRunner.prototype.runTest = function (filePath) {
        describe("test262 test for " + filePath, function () {
            // Mocha holds onto the closure environment of the describe callback even after the test is done.
            // Everything declared here should be cleared out in the "after" callback.
            var testState;
            before(function () {
                var content = Harness.IO.readFile(filePath);
                var testFilename = ts.removeFileExtension(filePath).replace(/\//g, "_") + ".test";
                var testCaseContent = Harness.TestCaseParser.makeUnitsFromTest(content, testFilename);
                var inputFiles = testCaseContent.testUnitData.map(function (unit) {
                    var unitName = Test262BaselineRunner.getTestFilePath(unit.name);
                    return { unitName: unitName, content: unit.content };
                });
                // Emit the results
                testState = {
                    filename: testFilename,
                    inputFiles: inputFiles,
                    compilerResult: undefined,
                };
                var output = Harness.Compiler.compileFiles([Test262BaselineRunner.helperFile].concat(inputFiles), 
                /*otherFiles*/ [], 
                /* harnessOptions */ undefined, Test262BaselineRunner.options, 
                /* currentDirectory */ undefined);
                testState.compilerResult = output.result;
            });
            after(function () {
                testState = undefined;
            });
            it("has the expected emitted code", function () {
                Harness.Baseline.runBaseline("has the expected emitted code", testState.filename + ".output.js", function () {
                    var files = testState.compilerResult.files.filter(function (f) { return f.fileName !== Test262BaselineRunner.helpersFilePath; });
                    return Harness.Compiler.collateOutputs(files);
                }, false, Test262BaselineRunner.baselineOptions);
            });
            it("has the expected errors", function () {
                Harness.Baseline.runBaseline("has the expected errors", testState.filename + ".errors.txt", function () {
                    var errors = testState.compilerResult.errors;
                    if (errors.length === 0) {
                        return null;
                    }
                    return Harness.Compiler.getErrorBaseline(testState.inputFiles, errors);
                }, false, Test262BaselineRunner.baselineOptions);
            });
            it("satisfies invariants", function () {
                var sourceFile = testState.compilerResult.program.getSourceFile(Test262BaselineRunner.getTestFilePath(testState.filename));
                Utils.assertInvariants(sourceFile, /*parent:*/ undefined);
            });
            it("has the expected AST", function () {
                Harness.Baseline.runBaseline("has the expected AST", testState.filename + ".AST.txt", function () {
                    var sourceFile = testState.compilerResult.program.getSourceFile(Test262BaselineRunner.getTestFilePath(testState.filename));
                    return Utils.sourceFileToJSON(sourceFile);
                }, false, Test262BaselineRunner.baselineOptions);
            });
        });
    };
    Test262BaselineRunner.prototype.kind = function () {
        return "test262";
    };
    Test262BaselineRunner.prototype.enumerateTestFiles = function () {
        return ts.map(this.enumerateFiles(Test262BaselineRunner.basePath, Test262BaselineRunner.testFileExtensionRegex, { recursive: true }), ts.normalizePath);
    };
    Test262BaselineRunner.prototype.initializeTests = function () {
        var _this = this;
        // this will set up a series of describe/it blocks to run between the setup and cleanup phases
        if (this.tests.length === 0) {
            var testFiles = this.enumerateTestFiles();
            testFiles.forEach(function (fn) {
                _this.runTest(fn);
            });
        }
        else {
            this.tests.forEach(function (test) { return _this.runTest(test); });
        }
    };
    Test262BaselineRunner.basePath = "internal/cases/test262";
    Test262BaselineRunner.helpersFilePath = "tests/cases/test262-harness/helpers.d.ts";
    Test262BaselineRunner.helperFile = {
        unitName: Test262BaselineRunner.helpersFilePath,
        content: Harness.IO.readFile(Test262BaselineRunner.helpersFilePath),
    };
    Test262BaselineRunner.testFileExtensionRegex = /\.js$/;
    Test262BaselineRunner.options = {
        allowNonTsExtensions: true,
        target: 2 /* Latest */,
        module: ts.ModuleKind.CommonJS
    };
    Test262BaselineRunner.baselineOptions = {
        Subfolder: "test262",
        Baselinefolder: "internal/baselines"
    };
    return Test262BaselineRunner;
}(RunnerBase));
//# sourceMappingURL=test262Runner.js.map