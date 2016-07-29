/// <reference path="harness.ts" />
var RunnerBase = (function () {
    function RunnerBase() {
        // contains the tests to run
        this.tests = [];
    }
    /** Add a source file to the runner's list of tests that need to be initialized with initializeTests */
    RunnerBase.prototype.addTest = function (fileName) {
        this.tests.push(fileName);
    };
    RunnerBase.prototype.enumerateFiles = function (folder, regex, options) {
        return ts.map(Harness.IO.listFiles(Harness.userSpecifiedRoot + folder, regex, { recursive: (options ? options.recursive : false) }), ts.normalizeSlashes);
    };
    /** Replaces instances of full paths with fileNames only */
    RunnerBase.removeFullPaths = function (path) {
        // If its a full path (starts with "C:" or "/") replace with just the filename
        var fixedPath = /^(\w:|\/)/.test(path) ? Harness.Path.getFileName(path) : path;
        // when running in the browser the 'full path' is the host name, shows up in error baselines
        var localHost = /http:\/localhost:\d+/g;
        fixedPath = fixedPath.replace(localHost, "");
        return fixedPath;
    };
    return RunnerBase;
}());
//# sourceMappingURL=runnerbase.js.map