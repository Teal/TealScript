/// <reference path="node.d.ts" />
/// <reference path="session.ts" />
// used in fs.writeSync
/* tslint:disable:no-null-keyword */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ts;
(function (ts) {
    var server;
    (function (server) {
        var readline = require("readline");
        var fs = require("fs");
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false,
        });
        var Logger = (function () {
            function Logger(logFilename, level) {
                this.logFilename = logFilename;
                this.level = level;
                this.fd = -1;
                this.seq = 0;
                this.inGroup = false;
                this.firstInGroup = true;
            }
            Logger.padStringRight = function (str, padding) {
                return (str + padding).slice(0, padding.length);
            };
            Logger.prototype.close = function () {
                if (this.fd >= 0) {
                    fs.close(this.fd);
                }
            };
            Logger.prototype.perftrc = function (s) {
                this.msg(s, "Perf");
            };
            Logger.prototype.info = function (s) {
                this.msg(s, "Info");
            };
            Logger.prototype.startGroup = function () {
                this.inGroup = true;
                this.firstInGroup = true;
            };
            Logger.prototype.endGroup = function () {
                this.inGroup = false;
                this.seq++;
                this.firstInGroup = true;
            };
            Logger.prototype.loggingEnabled = function () {
                return !!this.logFilename;
            };
            Logger.prototype.isVerbose = function () {
                return this.loggingEnabled() && (this.level == "verbose");
            };
            Logger.prototype.msg = function (s, type) {
                if (type === void 0) { type = "Err"; }
                if (this.fd < 0) {
                    if (this.logFilename) {
                        this.fd = fs.openSync(this.logFilename, "w");
                    }
                }
                if (this.fd >= 0) {
                    s = s + "\n";
                    var prefix = Logger.padStringRight(type + " " + this.seq.toString(), "          ");
                    if (this.firstInGroup) {
                        s = prefix + s;
                        this.firstInGroup = false;
                    }
                    if (!this.inGroup) {
                        this.seq++;
                        this.firstInGroup = true;
                    }
                    var buf = new Buffer(s);
                    fs.writeSync(this.fd, buf, 0, buf.length, null);
                }
            };
            return Logger;
        }());
        var IOSession = (function (_super) {
            __extends(IOSession, _super);
            function IOSession(host, logger) {
                _super.call(this, host, Buffer.byteLength, process.hrtime, logger);
            }
            IOSession.prototype.exit = function () {
                this.projectService.log("Exiting...", "Info");
                this.projectService.closeLog();
                process.exit(0);
            };
            IOSession.prototype.listen = function () {
                var _this = this;
                rl.on("line", function (input) {
                    var message = input.trim();
                    _this.onMessage(message);
                });
                rl.on("close", function () {
                    _this.exit();
                });
            };
            return IOSession;
        }(server.Session));
        function parseLoggingEnvironmentString(logEnvStr) {
            var logEnv = {};
            var args = logEnvStr.split(" ");
            for (var i = 0, len = args.length; i < (len - 1); i += 2) {
                var option = args[i];
                var value = args[i + 1];
                if (option && value) {
                    switch (option) {
                        case "-file":
                            logEnv.file = value;
                            break;
                        case "-level":
                            logEnv.detailLevel = value;
                            break;
                    }
                }
            }
            return logEnv;
        }
        // TSS_LOG "{ level: "normal | verbose | terse", file?: string}"
        function createLoggerFromEnv() {
            var fileName = undefined;
            var detailLevel = "normal";
            var logEnvStr = process.env["TSS_LOG"];
            if (logEnvStr) {
                var logEnv = parseLoggingEnvironmentString(logEnvStr);
                if (logEnv.file) {
                    fileName = logEnv.file;
                }
                else {
                    fileName = __dirname + "/.log" + process.pid.toString();
                }
                if (logEnv.detailLevel) {
                    detailLevel = logEnv.detailLevel;
                }
            }
            return new Logger(fileName, detailLevel);
        }
        // This places log file in the directory containing editorServices.js
        // TODO: check that this location is writable
        // average async stat takes about 30 microseconds
        // set chunk size to do 30 files in < 1 millisecond
        function createPollingWatchedFileSet(interval, chunkSize) {
            if (interval === void 0) { interval = 2500; }
            if (chunkSize === void 0) { chunkSize = 30; }
            var watchedFiles = [];
            var nextFileToCheck = 0;
            var watchTimer;
            function getModifiedTime(fileName) {
                return fs.statSync(fileName).mtime;
            }
            function poll(checkedIndex) {
                var watchedFile = watchedFiles[checkedIndex];
                if (!watchedFile) {
                    return;
                }
                fs.stat(watchedFile.fileName, function (err, stats) {
                    if (err) {
                        watchedFile.callback(watchedFile.fileName);
                    }
                    else if (watchedFile.mtime.getTime() !== stats.mtime.getTime()) {
                        watchedFile.mtime = getModifiedTime(watchedFile.fileName);
                        watchedFile.callback(watchedFile.fileName, watchedFile.mtime.getTime() === 0);
                    }
                });
            }
            // this implementation uses polling and
            // stat due to inconsistencies of fs.watch
            // and efficiency of stat on modern filesystems
            function startWatchTimer() {
                watchTimer = setInterval(function () {
                    var count = 0;
                    var nextToCheck = nextFileToCheck;
                    var firstCheck = -1;
                    while ((count < chunkSize) && (nextToCheck !== firstCheck)) {
                        poll(nextToCheck);
                        if (firstCheck < 0) {
                            firstCheck = nextToCheck;
                        }
                        nextToCheck++;
                        if (nextToCheck === watchedFiles.length) {
                            nextToCheck = 0;
                        }
                        count++;
                    }
                    nextFileToCheck = nextToCheck;
                }, interval);
            }
            function addFile(fileName, callback) {
                var file = {
                    fileName: fileName,
                    callback: callback,
                    mtime: getModifiedTime(fileName)
                };
                watchedFiles.push(file);
                if (watchedFiles.length === 1) {
                    startWatchTimer();
                }
                return file;
            }
            function removeFile(file) {
                watchedFiles = ts.copyListRemovingItem(file, watchedFiles);
            }
            return {
                getModifiedTime: getModifiedTime,
                poll: poll,
                startWatchTimer: startWatchTimer,
                addFile: addFile,
                removeFile: removeFile
            };
        }
        // REVIEW: for now this implementation uses polling.
        // The advantage of polling is that it works reliably
        // on all os and with network mounted files.
        // For 90 referenced files, the average time to detect
        // changes is 2*msInterval (by default 5 seconds).
        // The overhead of this is .04 percent (1/2500) with
        // average pause of < 1 millisecond (and max
        // pause less than 1.5 milliseconds); question is
        // do we anticipate reference sets in the 100s and
        // do we care about waiting 10-20 seconds to detect
        // changes for large reference sets? If so, do we want
        // to increase the chunk size or decrease the interval
        // time dynamically to match the large reference set?
        var pollingWatchedFileSet = createPollingWatchedFileSet();
        var logger = createLoggerFromEnv();
        var pending = [];
        var canWrite = true;
        function writeMessage(s) {
            if (!canWrite) {
                pending.push(s);
            }
            else {
                canWrite = false;
                process.stdout.write(new Buffer(s, "utf8"), setCanWriteFlagAndWriteMessageIfNecessary);
            }
        }
        function setCanWriteFlagAndWriteMessageIfNecessary() {
            canWrite = true;
            if (pending.length) {
                writeMessage(pending.shift());
            }
        }
        var sys = ts.sys;
        // Override sys.write because fs.writeSync is not reliable on Node 4
        sys.write = function (s) { return writeMessage(s); };
        sys.watchFile = function (fileName, callback) {
            var watchedFile = pollingWatchedFileSet.addFile(fileName, callback);
            return {
                close: function () { return pollingWatchedFileSet.removeFile(watchedFile); }
            };
        };
        sys.setTimeout = setTimeout;
        sys.clearTimeout = clearTimeout;
        var ioSession = new IOSession(sys, logger);
        process.on("uncaughtException", function (err) {
            ioSession.logError(err, "unknown");
        });
        // Start listening
        ioSession.listen();
    })(server = ts.server || (ts.server = {}));
})(ts || (ts = {}));
//# sourceMappingURL=server.js.map