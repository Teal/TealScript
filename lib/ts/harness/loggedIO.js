/// <reference path="..\..\src\compiler\sys.ts" />
/// <reference path="..\..\src\harness\harness.ts" />
/// <reference path="..\..\src\harness\runnerbase.ts" />
var Playback;
(function (Playback) {
    var recordLog = undefined;
    var replayLog = undefined;
    var recordLogFileNameBase = "";
    function memoize(func) {
        var lookup = {};
        var run = (function (s) {
            if (lookup.hasOwnProperty(s))
                return lookup[s];
            return lookup[s] = func(s);
        });
        run.reset = function () {
            lookup = undefined;
        };
        return run;
    }
    function createEmptyLog() {
        return {
            timestamp: (new Date()).toString(),
            arguments: [],
            currentDirectory: "",
            filesRead: [],
            directoriesRead: [],
            filesWritten: [],
            filesDeleted: [],
            filesAppended: [],
            fileExists: [],
            filesFound: [],
            dirs: [],
            dirExists: [],
            dirsCreated: [],
            pathsResolved: [],
            executingPath: ""
        };
    }
    function initWrapper(wrapper, underlying) {
        ts.forEach(Object.keys(underlying), function (prop) {
            wrapper[prop] = underlying[prop];
        });
        wrapper.startReplayFromString = function (logString) {
            wrapper.startReplayFromData(JSON.parse(logString));
        };
        wrapper.startReplayFromData = function (log) {
            replayLog = log;
            // Remove non-found files from the log (shouldn't really need them, but we still record them for diagnostic purposes)
            replayLog.filesRead = replayLog.filesRead.filter(function (f) { return f.result.contents !== undefined; });
        };
        wrapper.endReplay = function () {
            replayLog = undefined;
        };
        wrapper.startRecord = function (fileNameBase) {
            recordLogFileNameBase = fileNameBase;
            recordLog = createEmptyLog();
            if (typeof underlying.args !== "function") {
                recordLog.arguments = underlying.args;
            }
        };
        wrapper.startReplayFromFile = function (logFn) {
            wrapper.startReplayFromString(underlying.readFile(logFn));
        };
        wrapper.endRecord = function () {
            if (recordLog !== undefined) {
                var i_1 = 0;
                var fn = function () { return recordLogFileNameBase + i_1 + ".json"; };
                while (underlying.fileExists(fn()))
                    i_1++;
                underlying.writeFile(fn(), JSON.stringify(recordLog));
                recordLog = undefined;
            }
        };
        wrapper.fileExists = recordReplay(wrapper.fileExists, underlying)(function (path) { return callAndRecord(underlying.fileExists(path), recordLog.fileExists, { path: path }); }, memoize(function (path) {
            // If we read from the file, it must exist
            if (findFileByPath(wrapper, replayLog.filesRead, path, /*throwFileNotFoundError*/ false)) {
                return true;
            }
            else {
                return findResultByFields(replayLog.fileExists, { path: path }, /*defaultValue*/ false);
            }
        }));
        wrapper.getExecutingFilePath = function () {
            if (replayLog !== undefined) {
                return replayLog.executingPath;
            }
            else if (recordLog !== undefined) {
                return recordLog.executingPath = underlying.getExecutingFilePath();
            }
            else {
                return underlying.getExecutingFilePath();
            }
        };
        wrapper.getCurrentDirectory = function () {
            if (replayLog !== undefined) {
                return replayLog.currentDirectory || "";
            }
            else if (recordLog !== undefined) {
                return recordLog.currentDirectory = underlying.getCurrentDirectory();
            }
            else {
                return underlying.getCurrentDirectory();
            }
        };
        wrapper.resolvePath = recordReplay(wrapper.resolvePath, underlying)(function (path) { return callAndRecord(underlying.resolvePath(path), recordLog.pathsResolved, { path: path }); }, memoize(function (path) { return findResultByFields(replayLog.pathsResolved, { path: path }, !ts.isRootedDiskPath(ts.normalizeSlashes(path)) && replayLog.currentDirectory ? replayLog.currentDirectory + "/" + path : ts.normalizeSlashes(path)); }));
        wrapper.readFile = recordReplay(wrapper.readFile, underlying)(function (path) {
            var result = underlying.readFile(path);
            var logEntry = { path: path, codepage: 0, result: { contents: result, codepage: 0 } };
            recordLog.filesRead.push(logEntry);
            return result;
        }, memoize(function (path) { return findFileByPath(wrapper, replayLog.filesRead, path, /*throwFileNotFoundError*/ true).contents; }));
        wrapper.readDirectory = recordReplay(wrapper.readDirectory, underlying)(function (path, extensions, exclude, include) {
            var result = underlying.readDirectory(path, extensions, exclude, include);
            var logEntry = { path: path, extensions: extensions, exclude: exclude, include: include, result: result };
            recordLog.directoriesRead.push(logEntry);
            return result;
        }, function (path, extensions, exclude) {
            // Because extensions is an array of all allowed extension, we will want to merge each of the replayLog.directoriesRead into one
            // if each of the directoriesRead has matched path with the given path (directory with same path but different extension will considered
            // different entry).
            // TODO (yuisu): We can certainly remove these once we recapture the RWC using new API
            var normalizedPath = ts.normalizePath(path).toLowerCase();
            var result = [];
            for (var _i = 0, _a = replayLog.directoriesRead; _i < _a.length; _i++) {
                var directory = _a[_i];
                if (ts.normalizeSlashes(directory.path).toLowerCase() === normalizedPath) {
                    result.push.apply(result, directory.result);
                }
            }
            return result;
        });
        wrapper.writeFile = recordReplay(wrapper.writeFile, underlying)(function (path, contents) { return callAndRecord(underlying.writeFile(path, contents), recordLog.filesWritten, { path: path, contents: contents, bom: false }); }, function (path, contents) { return noOpReplay("writeFile"); });
        wrapper.exit = function (exitCode) {
            if (recordLog !== undefined) {
                wrapper.endRecord();
            }
            underlying.exit(exitCode);
        };
    }
    function recordReplay(original, underlying) {
        function createWrapper(record, replay) {
            return (function () {
                if (replayLog !== undefined) {
                    return replay.apply(undefined, arguments);
                }
                else if (recordLog !== undefined) {
                    return record.apply(undefined, arguments);
                }
                else {
                    return original.apply(underlying, arguments);
                }
            });
        }
        return createWrapper;
    }
    function callAndRecord(underlyingResult, logArray, logEntry) {
        if (underlyingResult !== undefined) {
            logEntry.result = underlyingResult;
        }
        logArray.push(logEntry);
        return underlyingResult;
    }
    function findResultByFields(logArray, expectedFields, defaultValue) {
        var predicate = function (entry) {
            return Object.getOwnPropertyNames(expectedFields).every(function (name) { return entry[name] === expectedFields[name]; });
        };
        var results = logArray.filter(function (entry) { return predicate(entry); });
        if (results.length === 0) {
            if (defaultValue !== undefined) {
                return defaultValue;
            }
            else {
                throw new Error("No matching result in log array for: " + JSON.stringify(expectedFields));
            }
        }
        return results[0].result;
    }
    function findFileByPath(wrapper, logArray, expectedPath, throwFileNotFoundError) {
        var normalizedName = ts.normalizePath(expectedPath).toLowerCase();
        // Try to find the result through normal fileName
        for (var _i = 0, logArray_1 = logArray; _i < logArray_1.length; _i++) {
            var log = logArray_1[_i];
            if (ts.normalizeSlashes(log.path).toLowerCase() === normalizedName) {
                return log.result;
            }
        }
        // If we got here, we didn't find a match
        if (throwFileNotFoundError) {
            throw new Error("No matching result in log array for path: " + expectedPath);
        }
        else {
            return undefined;
        }
    }
    function noOpReplay(name) {
        // console.log("Swallowed write operation during replay: " + name);
    }
    function wrapIO(underlying) {
        var wrapper = {};
        initWrapper(wrapper, underlying);
        wrapper.directoryName = function (path) { throw new Error("NotSupported"); };
        wrapper.createDirectory = function (path) { throw new Error("NotSupported"); };
        wrapper.directoryExists = function (path) { throw new Error("NotSupported"); };
        wrapper.deleteFile = function (path) { throw new Error("NotSupported"); };
        wrapper.listFiles = function (path, filter, options) { throw new Error("NotSupported"); };
        return wrapper;
    }
    Playback.wrapIO = wrapIO;
    function wrapSystem(underlying) {
        var wrapper = {};
        initWrapper(wrapper, underlying);
        return wrapper;
    }
    Playback.wrapSystem = wrapSystem;
})(Playback || (Playback = {}));
//# sourceMappingURL=loggedIO.js.map