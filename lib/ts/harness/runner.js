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
/// <reference path="test262Runner.ts" />
/// <reference path="compilerRunner.ts" />
/// <reference path="fourslashRunner.ts" />
/// <reference path="projectsRunner.ts" />
/// <reference path="rwcRunner.ts" />
/// <reference path="harness.ts" />
var runners = [];
var iterations = 1;
function runTests(runners) {
    for (var i = iterations; i > 0; i--) {
        for (var j = 0; j < runners.length; j++) {
            runners[j].initializeTests();
        }
    }
}
function tryGetConfig(args) {
    var prefix = "--config=";
    var configPath = ts.forEach(args, function (arg) { return arg.lastIndexOf(prefix, 0) === 0 && arg.substr(prefix.length); });
    // strip leading and trailing quotes from the path (necessary on Windows since shell does not do it automatically)
    return configPath && configPath.replace(/(^[\"'])|([\"']$)/g, "");
}
function createRunner(kind) {
    switch (kind) {
        case "conformance":
            return new CompilerBaselineRunner(0 /* Conformance */);
        case "compiler":
            return new CompilerBaselineRunner(1 /* Regressions */);
        case "fourslash":
            return new FourSlashRunner(0 /* Native */);
        case "fourslash-shims":
            return new FourSlashRunner(1 /* Shims */);
        case "fourslash-shims-pp":
            return new FourSlashRunner(2 /* ShimsWithPreprocess */);
        case "fourslash-server":
            return new FourSlashRunner(3 /* Server */);
        case "project":
            return new ProjectRunner();
        case "rwc":
            return new RWCRunner();
        case "test262":
            return new Test262BaselineRunner();
    }
}
// users can define tests to run in mytest.config that will override cmd line args, otherwise use cmd line args (test.config), otherwise no options
var mytestconfigFileName = "mytest.config";
var testconfigFileName = "test.config";
var customConfig = tryGetConfig(Harness.IO.args());
var testConfigContent = customConfig && Harness.IO.fileExists(customConfig)
    ? Harness.IO.readFile(customConfig)
    : Harness.IO.fileExists(mytestconfigFileName)
        ? Harness.IO.readFile(mytestconfigFileName)
        : Harness.IO.fileExists(testconfigFileName) ? Harness.IO.readFile(testconfigFileName) : "";
var taskConfigsFolder;
var workerCount;
var runUnitTests = true;
if (testConfigContent !== "") {
    var testConfig = JSON.parse(testConfigContent);
    if (testConfig.light) {
        Harness.lightMode = true;
    }
    if (testConfig.taskConfigsFolder) {
        taskConfigsFolder = testConfig.taskConfigsFolder;
    }
    if (testConfig.runUnitTests !== undefined) {
        runUnitTests = testConfig.runUnitTests;
    }
    if (testConfig.workerCount) {
        workerCount = testConfig.workerCount;
    }
    if (testConfig.tasks) {
        for (var _i = 0, _a = testConfig.tasks; _i < _a.length; _i++) {
            var taskSet = _a[_i];
            var runner = createRunner(taskSet.runner);
            for (var _b = 0, _c = taskSet.files; _b < _c.length; _b++) {
                var file = _c[_b];
                runner.addTest(file);
            }
            runners.push(runner);
        }
    }
    if (testConfig.test && testConfig.test.length > 0) {
        for (var _d = 0, _e = testConfig.test; _d < _e.length; _d++) {
            var option = _e[_d];
            if (!option) {
                continue;
            }
            switch (option) {
                case "compiler":
                    runners.push(new CompilerBaselineRunner(0 /* Conformance */));
                    runners.push(new CompilerBaselineRunner(1 /* Regressions */));
                    runners.push(new ProjectRunner());
                    break;
                case "conformance":
                    runners.push(new CompilerBaselineRunner(0 /* Conformance */));
                    break;
                case "project":
                    runners.push(new ProjectRunner());
                    break;
                case "fourslash":
                    runners.push(new FourSlashRunner(0 /* Native */));
                    break;
                case "fourslash-shims":
                    runners.push(new FourSlashRunner(1 /* Shims */));
                    break;
                case "fourslash-shims-pp":
                    runners.push(new FourSlashRunner(2 /* ShimsWithPreprocess */));
                    break;
                case "fourslash-server":
                    runners.push(new FourSlashRunner(3 /* Server */));
                    break;
                case "fourslash-generated":
                    runners.push(new GeneratedFourslashRunner(0 /* Native */));
                    break;
                case "rwc":
                    runners.push(new RWCRunner());
                    break;
                case "test262":
                    runners.push(new Test262BaselineRunner());
                    break;
            }
        }
    }
}
if (runners.length === 0) {
    // compiler
    runners.push(new CompilerBaselineRunner(0 /* Conformance */));
    runners.push(new CompilerBaselineRunner(1 /* Regressions */));
    // TODO: project tests don't work in the browser yet
    if (Utils.getExecutionEnvironment() !== 1 /* Browser */) {
        runners.push(new ProjectRunner());
    }
    // language services
    runners.push(new FourSlashRunner(0 /* Native */));
    runners.push(new FourSlashRunner(1 /* Shims */));
    runners.push(new FourSlashRunner(2 /* ShimsWithPreprocess */));
    runners.push(new FourSlashRunner(3 /* Server */));
}
if (taskConfigsFolder) {
    // this instance of mocha should only partition work but not run actual tests
    runUnitTests = false;
    var workerConfigs = [];
    for (var i = 0; i < workerCount; i++) {
        // pass light mode settings to workers
        workerConfigs.push({ light: Harness.lightMode, tasks: [] });
    }
    for (var _f = 0, runners_1 = runners; _f < runners_1.length; _f++) {
        var runner = runners_1[_f];
        var files = runner.enumerateTestFiles();
        var chunkSize = Math.floor(files.length / workerCount) + 1; // add extra 1 to prevent missing tests due to rounding
        for (var i = 0; i < workerCount; i++) {
            var startPos = i * chunkSize;
            var len = Math.min(chunkSize, files.length - startPos);
            if (len > 0) {
                workerConfigs[i].tasks.push({
                    runner: runner.kind(),
                    files: files.slice(startPos, startPos + len)
                });
            }
        }
    }
    for (var i = 0; i < workerCount; i++) {
        var config = workerConfigs[i];
        // use last worker to run unit tests
        config.runUnitTests = i === workerCount - 1;
        Harness.IO.writeFile(ts.combinePaths(taskConfigsFolder, "task-config" + i + ".json"), JSON.stringify(workerConfigs[i]));
    }
}
else {
    runTests(runners);
}
if (!runUnitTests) {
    // patch `describe` to skip unit tests
    describe = (function () { });
}
//# sourceMappingURL=runner.js.map