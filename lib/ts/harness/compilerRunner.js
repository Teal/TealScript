/// <reference path="harness.ts" />
/// <reference path="runnerbase.ts" />
/// <reference path="typeWriter.ts" />
// In harness baselines, null is different than undefined. See `generateActual` in `harness.ts`.
/* tslint:disable:no-null-keyword */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var CompilerBaselineRunner = (function (_super) {
    __extends(CompilerBaselineRunner, _super);
    function CompilerBaselineRunner(testType) {
        _super.call(this);
        this.testType = testType;
        this.basePath = "tests/cases";
        this.errors = true;
        this.emit = true;
        this.decl = true;
        this.output = true;
        if (testType === 0 /* Conformance */) {
            this.testSuiteName = "conformance";
        }
        else if (testType === 1 /* Regressions */) {
            this.testSuiteName = "compiler";
        }
        else if (testType === 2 /* Test262 */) {
            this.testSuiteName = "test262";
        }
        else {
            this.testSuiteName = "compiler"; // default to this for historical reasons
        }
        this.basePath += "/" + this.testSuiteName;
    }
    CompilerBaselineRunner.prototype.kind = function () {
        return this.testSuiteName;
    };
    CompilerBaselineRunner.prototype.enumerateTestFiles = function () {
        return this.enumerateFiles(this.basePath, /\.tsx?$/, { recursive: true });
    };
    CompilerBaselineRunner.prototype.makeUnitName = function (name, root) {
        return ts.isRootedDiskPath(name) ? name : ts.combinePaths(root, name);
    };
    ;
    CompilerBaselineRunner.prototype.checkTestCodeOutput = function (fileName) {
        var _this = this;
        describe("compiler tests for " + fileName, function () {
            // Mocha holds onto the closure environment of the describe callback even after the test is done.
            // Everything declared here should be cleared out in the "after" callback.
            var justName;
            var lastUnit;
            var harnessSettings;
            var hasNonDtsFiles;
            var result;
            var options;
            // equivalent to the files that will be passed on the command line
            var toBeCompiled;
            // equivalent to other files on the file system not directly passed to the compiler (ie things that are referenced by other files)
            var otherFiles;
            before(function () {
                justName = fileName.replace(/^.*[\\\/]/, ""); // strips the fileName from the path.
                var content = Harness.IO.readFile(fileName);
                var rootDir = fileName.indexOf("conformance") === -1 ? "tests/cases/compiler/" : ts.getDirectoryPath(fileName) + "/";
                var testCaseContent = Harness.TestCaseParser.makeUnitsFromTest(content, fileName, rootDir);
                var units = testCaseContent.testUnitData;
                harnessSettings = testCaseContent.settings;
                var tsConfigOptions;
                if (testCaseContent.tsConfig) {
                    assert.equal(testCaseContent.tsConfig.fileNames.length, 0, "list of files in tsconfig is not currently supported");
                    tsConfigOptions = ts.clone(testCaseContent.tsConfig.options);
                }
                else {
                    var baseUrl = harnessSettings["baseUrl"];
                    if (baseUrl !== undefined && !ts.isRootedDiskPath(baseUrl)) {
                        harnessSettings["baseUrl"] = ts.getNormalizedAbsolutePath(baseUrl, rootDir);
                    }
                }
                lastUnit = units[units.length - 1];
                hasNonDtsFiles = ts.forEach(units, function (unit) { return !ts.fileExtensionIs(unit.name, ".d.ts"); });
                // We need to assemble the list of input files for the compiler and other related files on the 'filesystem' (ie in a multi-file test)
                // If the last file in a test uses require or a triple slash reference we'll assume all other files will be brought in via references,
                // otherwise, assume all files are just meant to be in the same compilation session without explicit references to one another.
                toBeCompiled = [];
                otherFiles = [];
                if (testCaseContent.settings["noImplicitReferences"] || /require\(/.test(lastUnit.content) || /reference\spath/.test(lastUnit.content)) {
                    toBeCompiled.push({ unitName: _this.makeUnitName(lastUnit.name, rootDir), content: lastUnit.content, fileOptions: lastUnit.fileOptions });
                    units.forEach(function (unit) {
                        if (unit.name !== lastUnit.name) {
                            otherFiles.push({ unitName: _this.makeUnitName(unit.name, rootDir), content: unit.content, fileOptions: unit.fileOptions });
                        }
                    });
                }
                else {
                    toBeCompiled = units.map(function (unit) {
                        return { unitName: _this.makeUnitName(unit.name, rootDir), content: unit.content, fileOptions: unit.fileOptions };
                    });
                }
                if (tsConfigOptions && tsConfigOptions.configFilePath !== undefined) {
                    tsConfigOptions.configFilePath = ts.combinePaths(rootDir, tsConfigOptions.configFilePath);
                }
                var output = Harness.Compiler.compileFiles(toBeCompiled, otherFiles, harnessSettings, /*options*/ tsConfigOptions, /*currentDirectory*/ harnessSettings["currentDirectory"]);
                options = output.options;
                result = output.result;
            });
            after(function () {
                // Mocha holds onto the closure environment of the describe callback even after the test is done.
                // Therefore we have to clean out large objects after the test is done.
                justName = undefined;
                lastUnit = undefined;
                hasNonDtsFiles = undefined;
                result = undefined;
                options = undefined;
                toBeCompiled = undefined;
                otherFiles = undefined;
            });
            function getByteOrderMarkText(file) {
                return file.writeByteOrderMark ? "\u00EF\u00BB\u00BF" : "";
            }
            function getErrorBaseline(toBeCompiled, otherFiles, result) {
                return Harness.Compiler.getErrorBaseline(toBeCompiled.concat(otherFiles), result.errors);
            }
            // check errors
            it("Correct errors for " + fileName, function () {
                if (_this.errors) {
                    Harness.Baseline.runBaseline("Correct errors for " + fileName, justName.replace(/\.tsx?$/, ".errors.txt"), function () {
                        if (result.errors.length === 0)
                            return null;
                        return getErrorBaseline(toBeCompiled, otherFiles, result);
                    });
                }
            });
            it("Correct module resolution tracing for " + fileName, function () {
                if (options.traceResolution) {
                    Harness.Baseline.runBaseline("Correct module resolution tracing for " + fileName, justName.replace(/\.tsx?$/, ".trace.json"), function () {
                        return JSON.stringify(result.traceResults || [], undefined, 4);
                    });
                }
            });
            // Source maps?
            it("Correct sourcemap content for " + fileName, function () {
                if (options.sourceMap || options.inlineSourceMap) {
                    Harness.Baseline.runBaseline("Correct sourcemap content for " + fileName, justName.replace(/\.tsx?$/, ".sourcemap.txt"), function () {
                        var record = result.getSourceMapRecord();
                        if (options.noEmitOnError && result.errors.length !== 0 && record === undefined) {
                            // Because of the noEmitOnError option no files are created. We need to return null because baselining isn"t required.
                            return null;
                        }
                        return record;
                    });
                }
            });
            it("Correct JS output for " + fileName, function () {
                if (hasNonDtsFiles && _this.emit) {
                    if (!options.noEmit && result.files.length === 0 && result.errors.length === 0) {
                        throw new Error("Expected at least one js file to be emitted or at least one error to be created.");
                    }
                    // check js output
                    Harness.Baseline.runBaseline("Correct JS output for " + fileName, justName.replace(/\.tsx?/, ".js"), function () {
                        var tsCode = "";
                        var tsSources = otherFiles.concat(toBeCompiled);
                        if (tsSources.length > 1) {
                            tsCode += "//// [" + fileName + "] ////\r\n\r\n";
                        }
                        for (var i = 0; i < tsSources.length; i++) {
                            tsCode += "//// [" + Harness.Path.getFileName(tsSources[i].unitName) + "]\r\n";
                            tsCode += tsSources[i].content + (i < (tsSources.length - 1) ? "\r\n" : "");
                        }
                        var jsCode = "";
                        for (var i = 0; i < result.files.length; i++) {
                            jsCode += "//// [" + Harness.Path.getFileName(result.files[i].fileName) + "]\r\n";
                            jsCode += getByteOrderMarkText(result.files[i]);
                            jsCode += result.files[i].code;
                        }
                        if (result.declFilesCode.length > 0) {
                            jsCode += "\r\n\r\n";
                            for (var i = 0; i < result.declFilesCode.length; i++) {
                                jsCode += "//// [" + Harness.Path.getFileName(result.declFilesCode[i].fileName) + "]\r\n";
                                jsCode += getByteOrderMarkText(result.declFilesCode[i]);
                                jsCode += result.declFilesCode[i].code;
                            }
                        }
                        var declFileCompilationResult = Harness.Compiler.compileDeclarationFiles(toBeCompiled, otherFiles, result, harnessSettings, options, /*currentDirectory*/ undefined);
                        if (declFileCompilationResult && declFileCompilationResult.declResult.errors.length) {
                            jsCode += "\r\n\r\n//// [DtsFileErrors]\r\n";
                            jsCode += "\r\n\r\n";
                            jsCode += getErrorBaseline(declFileCompilationResult.declInputFiles, declFileCompilationResult.declOtherFiles, declFileCompilationResult.declResult);
                        }
                        if (jsCode.length > 0) {
                            return tsCode + "\r\n\r\n" + jsCode;
                        }
                        else {
                            return null;
                        }
                    });
                }
            });
            it("Correct Sourcemap output for " + fileName, function () {
                if (options.inlineSourceMap) {
                    if (result.sourceMaps.length > 0) {
                        throw new Error("No sourcemap files should be generated if inlineSourceMaps was set.");
                    }
                    return null;
                }
                else if (options.sourceMap) {
                    if (result.sourceMaps.length !== result.files.length) {
                        throw new Error("Number of sourcemap files should be same as js files.");
                    }
                    Harness.Baseline.runBaseline("Correct Sourcemap output for " + fileName, justName.replace(/\.tsx?/, ".js.map"), function () {
                        if (options.noEmitOnError && result.errors.length !== 0 && result.sourceMaps.length === 0) {
                            // We need to return null here or the runBaseLine will actually create a empty file.
                            // Baselining isn't required here because there is no output.
                            return null;
                        }
                        var sourceMapCode = "";
                        for (var i = 0; i < result.sourceMaps.length; i++) {
                            sourceMapCode += "//// [" + Harness.Path.getFileName(result.sourceMaps[i].fileName) + "]\r\n";
                            sourceMapCode += getByteOrderMarkText(result.sourceMaps[i]);
                            sourceMapCode += result.sourceMaps[i].code;
                        }
                        return sourceMapCode;
                    });
                }
            });
            it("Correct type/symbol baselines for " + fileName, function () {
                if (fileName.indexOf("APISample") >= 0) {
                    return;
                }
                // NEWTODO: Type baselines
                if (result.errors.length !== 0) {
                    return;
                }
                // The full walker simulates the types that you would get from doing a full
                // compile.  The pull walker simulates the types you get when you just do
                // a type query for a random node (like how the LS would do it).  Most of the
                // time, these will be the same.  However, occasionally, they can be different.
                // Specifically, when the compiler internally depends on symbol IDs to order
                // things, then we may see different results because symbols can be created in a
                // different order with 'pull' operations, and thus can produce slightly differing
                // output.
                //
                // For example, with a full type check, we may see a type displayed as: number | string
                // But with a pull type check, we may see it as:                        string | number
                //
                // These types are equivalent, but depend on what order the compiler observed
                // certain parts of the program.
                var program = result.program;
                var allFiles = toBeCompiled.concat(otherFiles).filter(function (file) { return !!program.getSourceFile(file.unitName); });
                var fullWalker = new TypeWriterWalker(program, /*fullTypeCheck*/ true);
                var fullResults = {};
                var pullResults = {};
                for (var _i = 0, allFiles_1 = allFiles; _i < allFiles_1.length; _i++) {
                    var sourceFile = allFiles_1[_i];
                    fullResults[sourceFile.unitName] = fullWalker.getTypeAndSymbols(sourceFile.unitName);
                    pullResults[sourceFile.unitName] = fullWalker.getTypeAndSymbols(sourceFile.unitName);
                }
                // Produce baselines.  The first gives the types for all expressions.
                // The second gives symbols for all identifiers.
                var e1, e2;
                try {
                    checkBaseLines(/*isSymbolBaseLine*/ false);
                }
                catch (e) {
                    e1 = e;
                }
                try {
                    checkBaseLines(/*isSymbolBaseLine*/ true);
                }
                catch (e) {
                    e2 = e;
                }
                if (e1 || e2) {
                    throw e1 || e2;
                }
                return;
                function checkBaseLines(isSymbolBaseLine) {
                    var fullBaseLine = generateBaseLine(fullResults, isSymbolBaseLine);
                    var pullBaseLine = generateBaseLine(pullResults, isSymbolBaseLine);
                    var fullExtension = isSymbolBaseLine ? ".symbols" : ".types";
                    var pullExtension = isSymbolBaseLine ? ".symbols.pull" : ".types.pull";
                    if (fullBaseLine !== pullBaseLine) {
                        Harness.Baseline.runBaseline("Correct full information for " + fileName, justName.replace(/\.tsx?/, fullExtension), function () { return fullBaseLine; });
                        Harness.Baseline.runBaseline("Correct pull information for " + fileName, justName.replace(/\.tsx?/, pullExtension), function () { return pullBaseLine; });
                    }
                    else {
                        Harness.Baseline.runBaseline("Correct information for " + fileName, justName.replace(/\.tsx?/, fullExtension), function () { return fullBaseLine; });
                    }
                }
                function generateBaseLine(typeWriterResults, isSymbolBaseline) {
                    var typeLines = [];
                    var typeMap = {};
                    allFiles.forEach(function (file) {
                        var codeLines = file.content.split("\n");
                        typeWriterResults[file.unitName].forEach(function (result) {
                            if (isSymbolBaseline && !result.symbol) {
                                return;
                            }
                            var typeOrSymbolString = isSymbolBaseline ? result.symbol : result.type;
                            var formattedLine = result.sourceText.replace(/\r?\n/g, "") + " : " + typeOrSymbolString;
                            if (!typeMap[file.unitName]) {
                                typeMap[file.unitName] = {};
                            }
                            var typeInfo = [formattedLine];
                            var existingTypeInfo = typeMap[file.unitName][result.line];
                            if (existingTypeInfo) {
                                typeInfo = existingTypeInfo.concat(typeInfo);
                            }
                            typeMap[file.unitName][result.line] = typeInfo;
                        });
                        typeLines.push("=== " + file.unitName + " ===\r\n");
                        for (var i = 0; i < codeLines.length; i++) {
                            var currentCodeLine = codeLines[i];
                            typeLines.push(currentCodeLine + "\r\n");
                            if (typeMap[file.unitName]) {
                                var typeInfo = typeMap[file.unitName][i];
                                if (typeInfo) {
                                    typeInfo.forEach(function (ty) {
                                        typeLines.push(">" + ty + "\r\n");
                                    });
                                    if (i + 1 < codeLines.length && (codeLines[i + 1].match(/^\s*[{|}]\s*$/) || codeLines[i + 1].trim() === "")) {
                                    }
                                    else {
                                        typeLines.push("\r\n");
                                    }
                                }
                            }
                            else {
                                typeLines.push("No type information for this code.");
                            }
                        }
                    });
                    return typeLines.join("");
                }
            });
        });
    };
    CompilerBaselineRunner.prototype.initializeTests = function () {
        var _this = this;
        describe(this.testSuiteName + " tests", function () {
            describe("Setup compiler for compiler baselines", function () {
                _this.parseOptions();
            });
            // this will set up a series of describe/it blocks to run between the setup and cleanup phases
            if (_this.tests.length === 0) {
                var testFiles = _this.enumerateTestFiles();
                testFiles.forEach(function (fn) {
                    fn = fn.replace(/\\/g, "/");
                    _this.checkTestCodeOutput(fn);
                });
            }
            else {
                _this.tests.forEach(function (test) { return _this.checkTestCodeOutput(test); });
            }
        });
    };
    CompilerBaselineRunner.prototype.parseOptions = function () {
        if (this.options && this.options.length > 0) {
            this.errors = false;
            this.emit = false;
            this.decl = false;
            this.output = false;
            var opts = this.options.split(",");
            for (var i = 0; i < opts.length; i++) {
                switch (opts[i]) {
                    case "error":
                        this.errors = true;
                        break;
                    case "emit":
                        this.emit = true;
                        break;
                    case "decl":
                        this.decl = true;
                        break;
                    case "output":
                        this.output = true;
                        break;
                    default:
                        throw new Error("unsupported flag");
                }
            }
        }
    };
    return CompilerBaselineRunner;
}(RunnerBase));
//# sourceMappingURL=compilerRunner.js.map