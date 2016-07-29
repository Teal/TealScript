var fs = require("fs");
var path = require("path");
function instrumentForRecording(fn, tscPath) {
    instrument(tscPath, "\nts.sys = Playback.wrapSystem(ts.sys);\nts.sys.startRecord(\"" + fn + "\");", "ts.sys.endRecord();");
}
function instrumentForReplay(logFilename, tscPath) {
    instrument(tscPath, "\nts.sys = Playback.wrapSystem(ts.sys);\nts.sys.startReplay(\"" + logFilename + "\");");
}
function instrument(tscPath, prepareCode, cleanupCode) {
    if (cleanupCode === void 0) { cleanupCode = ""; }
    var bak = tscPath + ".bak";
    fs.exists(bak, function (backupExists) {
        var filename = tscPath;
        if (backupExists) {
            filename = bak;
        }
        fs.readFile(filename, "utf-8", function (err, tscContent) {
            if (err)
                throw err;
            fs.writeFile(bak, tscContent, function (err) {
                if (err)
                    throw err;
                fs.readFile(path.resolve(path.dirname(tscPath) + "/loggedIO.js"), "utf-8", function (err, loggerContent) {
                    if (err)
                        throw err;
                    var invocationLine = "ts.executeCommandLine(ts.sys.args);";
                    var index1 = tscContent.indexOf(invocationLine);
                    if (index1 < 0) {
                        throw new Error("Could not find " + invocationLine);
                    }
                    var index2 = index1 + invocationLine.length;
                    var newContent = tscContent.substr(0, index1) + loggerContent + prepareCode + invocationLine + cleanupCode + tscContent.substr(index2) + "\r\n";
                    fs.writeFile(tscPath, newContent);
                });
            });
        });
    });
}
var isJson = function (arg) { return arg.indexOf(".json") > 0; };
var record = process.argv.indexOf("record");
var tscPath = process.argv[process.argv.length - 1];
if (record >= 0) {
    console.log("Instrumenting " + tscPath + " for recording");
    instrumentForRecording(process.argv[record + 1], tscPath);
}
else if (process.argv.some(isJson)) {
    var filename = process.argv.filter(isJson)[0];
    instrumentForReplay(filename, tscPath);
}
//# sourceMappingURL=instrumenter.js.map