///<reference path="fourslash.ts" />
///<reference path="harness.ts"/>
///<reference path="runnerbase.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var FourSlashRunner = (function (_super) {
    __extends(FourSlashRunner, _super);
    function FourSlashRunner(testType) {
        _super.call(this);
        this.testType = testType;
        switch (testType) {
            case 0 /* Native */:
                this.basePath = "tests/cases/fourslash";
                this.testSuiteName = "fourslash";
                break;
            case 1 /* Shims */:
                this.basePath = "tests/cases/fourslash/shims";
                this.testSuiteName = "fourslash-shims";
                break;
            case 2 /* ShimsWithPreprocess */:
                this.basePath = "tests/cases/fourslash/shims-pp";
                this.testSuiteName = "fourslash-shims-pp";
                break;
            case 3 /* Server */:
                this.basePath = "tests/cases/fourslash/server";
                this.testSuiteName = "fourslash-server";
                break;
        }
    }
    FourSlashRunner.prototype.enumerateTestFiles = function () {
        return this.enumerateFiles(this.basePath, /\.ts/i, { recursive: false });
    };
    FourSlashRunner.prototype.kind = function () {
        return this.testSuiteName;
    };
    FourSlashRunner.prototype.initializeTests = function () {
        var _this = this;
        if (this.tests.length === 0) {
            this.tests = this.enumerateTestFiles();
        }
        describe(this.testSuiteName + " tests", function () {
            _this.tests.forEach(function (fn) {
                describe(fn, function () {
                    fn = ts.normalizeSlashes(fn);
                    var justName = fn.replace(/^.*[\\\/]/, "");
                    // Convert to relative path
                    var testIndex = fn.indexOf("tests/");
                    if (testIndex >= 0)
                        fn = fn.substr(testIndex);
                    if (justName && !justName.match(/fourslash\.ts$/i) && !justName.match(/\.d\.ts$/i)) {
                        it(_this.testSuiteName + " test " + justName + " runs correctly", function () {
                            FourSlash.runFourSlashTest(_this.basePath, _this.testType, fn);
                        });
                    }
                });
            });
        });
    };
    return FourSlashRunner;
}(RunnerBase));
var GeneratedFourslashRunner = (function (_super) {
    __extends(GeneratedFourslashRunner, _super);
    function GeneratedFourslashRunner(testType) {
        _super.call(this, testType);
        this.basePath += "/generated/";
    }
    return GeneratedFourslashRunner;
}(FourSlashRunner));
//# sourceMappingURL=fourslashRunner.js.map