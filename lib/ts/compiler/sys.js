/// <reference path="core.ts"/>
var ts;
(function (ts) {
    ts.sys = (function () {
        function getWScriptSystem() {
            var fso = new ActiveXObject("Scripting.FileSystemObject");
            var shell = new ActiveXObject("WScript.Shell");
            var fileStream = new ActiveXObject("ADODB.Stream");
            fileStream.Type = 2 /*text*/;
            var binaryStream = new ActiveXObject("ADODB.Stream");
            binaryStream.Type = 1 /*binary*/;
            var args = [];
            for (var i = 0; i < WScript.Arguments.length; i++) {
                args[i] = WScript.Arguments.Item(i);
            }
            function readFile(fileName, encoding) {
                if (!fso.FileExists(fileName)) {
                    return undefined;
                }
                fileStream.Open();
                try {
                    if (encoding) {
                        fileStream.Charset = encoding;
                        fileStream.LoadFromFile(fileName);
                    }
                    else {
                        // Load file and read the first two bytes into a string with no interpretation
                        fileStream.Charset = "x-ansi";
                        fileStream.LoadFromFile(fileName);
                        var bom = fileStream.ReadText(2) || "";
                        // Position must be at 0 before encoding can be changed
                        fileStream.Position = 0;
                        // [0xFF,0xFE] and [0xFE,0xFF] mean utf-16 (little or big endian), otherwise default to utf-8
                        fileStream.Charset = bom.length >= 2 && (bom.charCodeAt(0) === 0xFF && bom.charCodeAt(1) === 0xFE || bom.charCodeAt(0) === 0xFE && bom.charCodeAt(1) === 0xFF) ? "unicode" : "utf-8";
                    }
                    // ReadText method always strips byte order mark from resulting string
                    return fileStream.ReadText();
                }
                catch (e) {
                    throw e;
                }
                finally {
                    fileStream.Close();
                }
            }
            function writeFile(fileName, data, writeByteOrderMark) {
                fileStream.Open();
                binaryStream.Open();
                try {
                    // Write characters in UTF-8 encoding
                    fileStream.Charset = "utf-8";
                    fileStream.WriteText(data);
                    // If we don't want the BOM, then skip it by setting the starting location to 3 (size of BOM).
                    // If not, start from position 0, as the BOM will be added automatically when charset==utf8.
                    if (writeByteOrderMark) {
                        fileStream.Position = 0;
                    }
                    else {
                        fileStream.Position = 3;
                    }
                    fileStream.CopyTo(binaryStream);
                    binaryStream.SaveToFile(fileName, 2 /*overwrite*/);
                }
                finally {
                    binaryStream.Close();
                    fileStream.Close();
                }
            }
            function getNames(collection) {
                var result = [];
                for (var e = new Enumerator(collection); !e.atEnd(); e.moveNext()) {
                    result.push(e.item().Name);
                }
                return result.sort();
            }
            function getDirectories(path) {
                var folder = fso.GetFolder(path);
                return getNames(folder.subfolders);
            }
            function getAccessibleFileSystemEntries(path) {
                try {
                    var folder = fso.GetFolder(path || ".");
                    var files = getNames(folder.files);
                    var directories = getNames(folder.subfolders);
                    return { files: files, directories: directories };
                }
                catch (e) {
                    return { files: [], directories: [] };
                }
            }
            function readDirectory(path, extensions, excludes, includes) {
                return ts.matchFiles(path, extensions, excludes, includes, /*useCaseSensitiveFileNames*/ false, shell.CurrentDirectory, getAccessibleFileSystemEntries);
            }
            return {
                args: args,
                newLine: "\r\n",
                useCaseSensitiveFileNames: false,
                write: function (s) {
                    WScript.StdOut.Write(s);
                },
                readFile: readFile,
                writeFile: writeFile,
                resolvePath: function (path) {
                    return fso.GetAbsolutePathName(path);
                },
                fileExists: function (path) {
                    return fso.FileExists(path);
                },
                directoryExists: function (path) {
                    return fso.FolderExists(path);
                },
                createDirectory: function (directoryName) {
                    if (!this.directoryExists(directoryName)) {
                        fso.CreateFolder(directoryName);
                    }
                },
                getExecutingFilePath: function () {
                    return WScript.ScriptFullName;
                },
                getCurrentDirectory: function () {
                    return shell.CurrentDirectory;
                },
                getDirectories: getDirectories,
                readDirectory: readDirectory,
                exit: function (exitCode) {
                    try {
                        WScript.Quit(exitCode);
                    }
                    catch (e) {
                    }
                }
            };
        }
        function getNodeSystem() {
            var _fs = require("fs");
            var _path = require("path");
            var _os = require("os");
            var _crypto = require("crypto");
            var useNonPollingWatchers = process.env["TSC_NONPOLLING_WATCHER"];
            function createWatchedFileSet() {
                var dirWatchers = {};
                // One file can have multiple watchers
                var fileWatcherCallbacks = {};
                return { addFile: addFile, removeFile: removeFile };
                function reduceDirWatcherRefCountForFile(fileName) {
                    var dirName = ts.getDirectoryPath(fileName);
                    if (ts.hasProperty(dirWatchers, dirName)) {
                        var watcher = dirWatchers[dirName];
                        watcher.referenceCount -= 1;
                        if (watcher.referenceCount <= 0) {
                            watcher.close();
                            delete dirWatchers[dirName];
                        }
                    }
                }
                function addDirWatcher(dirPath) {
                    if (ts.hasProperty(dirWatchers, dirPath)) {
                        var watcher_1 = dirWatchers[dirPath];
                        watcher_1.referenceCount += 1;
                        return;
                    }
                    var watcher = _fs.watch(dirPath, { persistent: true }, function (eventName, relativeFileName) { return fileEventHandler(eventName, relativeFileName, dirPath); });
                    watcher.referenceCount = 1;
                    dirWatchers[dirPath] = watcher;
                    return;
                }
                function addFileWatcherCallback(filePath, callback) {
                    if (ts.hasProperty(fileWatcherCallbacks, filePath)) {
                        fileWatcherCallbacks[filePath].push(callback);
                    }
                    else {
                        fileWatcherCallbacks[filePath] = [callback];
                    }
                }
                function addFile(fileName, callback) {
                    addFileWatcherCallback(fileName, callback);
                    addDirWatcher(ts.getDirectoryPath(fileName));
                    return { fileName: fileName, callback: callback };
                }
                function removeFile(watchedFile) {
                    removeFileWatcherCallback(watchedFile.fileName, watchedFile.callback);
                    reduceDirWatcherRefCountForFile(watchedFile.fileName);
                }
                function removeFileWatcherCallback(filePath, callback) {
                    if (ts.hasProperty(fileWatcherCallbacks, filePath)) {
                        var newCallbacks = ts.copyListRemovingItem(callback, fileWatcherCallbacks[filePath]);
                        if (newCallbacks.length === 0) {
                            delete fileWatcherCallbacks[filePath];
                        }
                        else {
                            fileWatcherCallbacks[filePath] = newCallbacks;
                        }
                    }
                }
                function fileEventHandler(eventName, relativeFileName, baseDirPath) {
                    // When files are deleted from disk, the triggered "rename" event would have a relativefileName of "undefined"
                    var fileName = typeof relativeFileName !== "string"
                        ? undefined
                        : ts.getNormalizedAbsolutePath(relativeFileName, baseDirPath);
                    // Some applications save a working file via rename operations
                    if ((eventName === "change" || eventName === "rename") && ts.hasProperty(fileWatcherCallbacks, fileName)) {
                        for (var _i = 0, _a = fileWatcherCallbacks[fileName]; _i < _a.length; _i++) {
                            var fileCallback = _a[_i];
                            fileCallback(fileName);
                        }
                    }
                }
            }
            var watchedFileSet = createWatchedFileSet();
            function isNode4OrLater() {
                return parseInt(process.version.charAt(1)) >= 4;
            }
            var platform = _os.platform();
            // win32\win64 are case insensitive platforms, MacOS (darwin) by default is also case insensitive
            var useCaseSensitiveFileNames = platform !== "win32" && platform !== "win64" && platform !== "darwin";
            function readFile(fileName, encoding) {
                if (!fileExists(fileName)) {
                    return undefined;
                }
                var buffer = _fs.readFileSync(fileName);
                var len = buffer.length;
                if (len >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
                    // Big endian UTF-16 byte order mark detected. Since big endian is not supported by node.js,
                    // flip all byte pairs and treat as little endian.
                    len &= ~1;
                    for (var i = 0; i < len; i += 2) {
                        var temp = buffer[i];
                        buffer[i] = buffer[i + 1];
                        buffer[i + 1] = temp;
                    }
                    return buffer.toString("utf16le", 2);
                }
                if (len >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
                    // Little endian UTF-16 byte order mark detected
                    return buffer.toString("utf16le", 2);
                }
                if (len >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
                    // UTF-8 byte order mark detected
                    return buffer.toString("utf8", 3);
                }
                // Default is UTF-8 with no byte order mark
                return buffer.toString("utf8");
            }
            function writeFile(fileName, data, writeByteOrderMark) {
                // If a BOM is required, emit one
                if (writeByteOrderMark) {
                    data = "\uFEFF" + data;
                }
                var fd;
                try {
                    fd = _fs.openSync(fileName, "w");
                    _fs.writeSync(fd, data, undefined, "utf8");
                }
                finally {
                    if (fd !== undefined) {
                        _fs.closeSync(fd);
                    }
                }
            }
            function getAccessibleFileSystemEntries(path) {
                try {
                    var entries = _fs.readdirSync(path || ".").sort();
                    var files = [];
                    var directories = [];
                    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                        var entry = entries_1[_i];
                        // This is necessary because on some file system node fails to exclude
                        // "." and "..". See https://github.com/nodejs/node/issues/4002
                        if (entry === "." || entry === "..") {
                            continue;
                        }
                        var name_1 = ts.combinePaths(path, entry);
                        var stat = void 0;
                        try {
                            stat = _fs.statSync(name_1);
                        }
                        catch (e) {
                            continue;
                        }
                        if (stat.isFile()) {
                            files.push(entry);
                        }
                        else if (stat.isDirectory()) {
                            directories.push(entry);
                        }
                    }
                    return { files: files, directories: directories };
                }
                catch (e) {
                    return { files: [], directories: [] };
                }
            }
            function readDirectory(path, extensions, excludes, includes) {
                return ts.matchFiles(path, extensions, excludes, includes, useCaseSensitiveFileNames, process.cwd(), getAccessibleFileSystemEntries);
            }
            function fileSystemEntryExists(path, entryKind) {
                try {
                    var stat = _fs.statSync(path);
                    switch (entryKind) {
                        case 0 /* File */: return stat.isFile();
                        case 1 /* Directory */: return stat.isDirectory();
                    }
                }
                catch (e) {
                    return false;
                }
            }
            function fileExists(path) {
                return fileSystemEntryExists(path, 0 /* File */);
            }
            function directoryExists(path) {
                return fileSystemEntryExists(path, 1 /* Directory */);
            }
            function getDirectories(path) {
                return ts.filter(_fs.readdirSync(path), function (p) { return fileSystemEntryExists(ts.combinePaths(path, p), 1 /* Directory */); });
            }
            return {
                args: process.argv.slice(2),
                newLine: _os.EOL,
                useCaseSensitiveFileNames: useCaseSensitiveFileNames,
                write: function (s) {
                    process.stdout.write(s);
                },
                readFile: readFile,
                writeFile: writeFile,
                watchFile: function (fileName, callback) {
                    if (useNonPollingWatchers) {
                        var watchedFile_1 = watchedFileSet.addFile(fileName, callback);
                        return {
                            close: function () { return watchedFileSet.removeFile(watchedFile_1); }
                        };
                    }
                    else {
                        _fs.watchFile(fileName, { persistent: true, interval: 250 }, fileChanged);
                        return {
                            close: function () { return _fs.unwatchFile(fileName, fileChanged); }
                        };
                    }
                    function fileChanged(curr, prev) {
                        if (+curr.mtime <= +prev.mtime) {
                            return;
                        }
                        callback(fileName);
                    }
                },
                watchDirectory: function (directoryName, callback, recursive) {
                    // Node 4.0 `fs.watch` function supports the "recursive" option on both OSX and Windows
                    // (ref: https://github.com/nodejs/node/pull/2649 and https://github.com/Microsoft/TypeScript/issues/4643)
                    var options;
                    if (isNode4OrLater() && (process.platform === "win32" || process.platform === "darwin")) {
                        options = { persistent: true, recursive: !!recursive };
                    }
                    else {
                        options = { persistent: true };
                    }
                    return _fs.watch(directoryName, options, function (eventName, relativeFileName) {
                        // In watchDirectory we only care about adding and removing files (when event name is
                        // "rename"); changes made within files are handled by corresponding fileWatchers (when
                        // event name is "change")
                        if (eventName === "rename") {
                            // When deleting a file, the passed baseFileName is null
                            callback(!relativeFileName ? relativeFileName : ts.normalizePath(ts.combinePaths(directoryName, relativeFileName)));
                        }
                        ;
                    });
                },
                resolvePath: function (path) {
                    return _path.resolve(path);
                },
                fileExists: fileExists,
                directoryExists: directoryExists,
                createDirectory: function (directoryName) {
                    if (!this.directoryExists(directoryName)) {
                        _fs.mkdirSync(directoryName);
                    }
                },
                getExecutingFilePath: function () {
                    return __filename;
                },
                getCurrentDirectory: function () {
                    return process.cwd();
                },
                getDirectories: getDirectories,
                readDirectory: readDirectory,
                getModifiedTime: function (path) {
                    try {
                        return _fs.statSync(path).mtime;
                    }
                    catch (e) {
                        return undefined;
                    }
                },
                createHash: function (data) {
                    var hash = _crypto.createHash("md5");
                    hash.update(data);
                    return hash.digest("hex");
                },
                getMemoryUsage: function () {
                    if (global.gc) {
                        global.gc();
                    }
                    return process.memoryUsage().heapUsed;
                },
                getFileSize: function (path) {
                    try {
                        var stat = _fs.statSync(path);
                        if (stat.isFile()) {
                            return stat.size;
                        }
                    }
                    catch (e) { }
                    return 0;
                },
                exit: function (exitCode) {
                    process.exit(exitCode);
                },
                realpath: function (path) {
                    return _fs.realpathSync(path);
                }
            };
        }
        function getChakraSystem() {
            var realpath = ChakraHost.realpath && (function (path) { return ChakraHost.realpath(path); });
            return {
                newLine: ChakraHost.newLine || "\r\n",
                args: ChakraHost.args,
                useCaseSensitiveFileNames: !!ChakraHost.useCaseSensitiveFileNames,
                write: ChakraHost.echo,
                readFile: function (path, encoding) {
                    // encoding is automatically handled by the implementation in ChakraHost
                    return ChakraHost.readFile(path);
                },
                writeFile: function (path, data, writeByteOrderMark) {
                    // If a BOM is required, emit one
                    if (writeByteOrderMark) {
                        data = "\uFEFF" + data;
                    }
                    ChakraHost.writeFile(path, data);
                },
                resolvePath: ChakraHost.resolvePath,
                fileExists: ChakraHost.fileExists,
                directoryExists: ChakraHost.directoryExists,
                createDirectory: ChakraHost.createDirectory,
                getExecutingFilePath: function () { return ChakraHost.executingFile; },
                getCurrentDirectory: function () { return ChakraHost.currentDirectory; },
                getDirectories: ChakraHost.getDirectories,
                readDirectory: function (path, extensions, excludes, includes) {
                    var pattern = ts.getFileMatcherPatterns(path, extensions, excludes, includes, !!ChakraHost.useCaseSensitiveFileNames, ChakraHost.currentDirectory);
                    return ChakraHost.readDirectory(path, extensions, pattern.basePaths, pattern.excludePattern, pattern.includeFilePattern, pattern.includeDirectoryPattern);
                },
                exit: ChakraHost.quit,
                realpath: realpath
            };
        }
        if (typeof ChakraHost !== "undefined") {
            return getChakraSystem();
        }
        else if (typeof WScript !== "undefined" && typeof ActiveXObject === "function") {
            return getWScriptSystem();
        }
        else if (typeof process !== "undefined" && process.nextTick && !process.browser && typeof require !== "undefined") {
            // process and process.nextTick checks if current environment is node-like
            // process.browser check excludes webpack and browserify
            return getNodeSystem();
        }
        else {
            return undefined; // Unsupported host
        }
    })();
})(ts || (ts = {}));
//# sourceMappingURL=sys.js.map