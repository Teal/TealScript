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
/// <reference path="..\services\services.ts" />
/// <reference path="..\services\shims.ts" />
/// <reference path="..\server\session.ts" />
/// <reference path="..\server\client.ts" />
/// <reference path="..\server\node.d.ts" />
/// <reference path="external\mocha.d.ts"/>
/// <reference path="external\chai.d.ts"/>
/// <reference path="sourceMapRecorder.ts"/>
/// <reference path="runnerbase.ts"/>
/// <reference path="virtualFileSystem.ts" />
// Block scoped definitions work poorly for global variables, temporarily enable var
/* tslint:disable:no-var-keyword */
// this will work in the browser via browserify
var _chai = require("chai");
var assert = _chai.assert;
var global = Function("return this").call(undefined);
/* tslint:enable:no-var-keyword */
var Utils;
(function (Utils) {
    function getExecutionEnvironment() {
        if (typeof WScript !== "undefined" && typeof ActiveXObject === "function") {
            return 2 /* CScript */;
        }
        else if (typeof window !== "undefined") {
            return 1 /* Browser */;
        }
        else {
            return 0 /* Node */;
        }
    }
    Utils.getExecutionEnvironment = getExecutionEnvironment;
    Utils.currentExecutionEnvironment = getExecutionEnvironment();
    var Buffer = Utils.currentExecutionEnvironment !== 1 /* Browser */
        ? require("buffer").Buffer
        : undefined;
    function encodeString(s) {
        return Buffer ? (new Buffer(s)).toString("utf8") : s;
    }
    Utils.encodeString = encodeString;
    function byteLength(s, encoding) {
        // stub implementation if Buffer is not available (in-browser case)
        return Buffer ? Buffer.byteLength(s, encoding) : s.length;
    }
    Utils.byteLength = byteLength;
    function evalFile(fileContents, fileName, nodeContext) {
        var environment = getExecutionEnvironment();
        switch (environment) {
            case 2 /* CScript */:
            case 1 /* Browser */:
                eval(fileContents);
                break;
            case 0 /* Node */:
                var vm = require("vm");
                if (nodeContext) {
                    vm.runInNewContext(fileContents, nodeContext, fileName);
                }
                else {
                    vm.runInThisContext(fileContents, fileName);
                }
                break;
            default:
                throw new Error("Unknown context");
        }
    }
    Utils.evalFile = evalFile;
    /** Splits the given string on \r\n, or on only \n if that fails, or on only \r if *that* fails. */
    function splitContentByNewlines(content) {
        // Split up the input file by line
        // Note: IE JS engine incorrectly handles consecutive delimiters here when using RegExp split, so
        // we have to use string-based splitting instead and try to figure out the delimiting chars
        var lines = content.split("\r\n");
        if (lines.length === 1) {
            lines = content.split("\n");
            if (lines.length === 1) {
                lines = content.split("\r");
            }
        }
        return lines;
    }
    Utils.splitContentByNewlines = splitContentByNewlines;
    /** Reads a file under /tests */
    function readTestFile(path) {
        if (path.indexOf("tests") < 0) {
            path = "tests/" + path;
        }
        var content = undefined;
        try {
            content = Harness.IO.readFile(Harness.userSpecifiedRoot + path);
        }
        catch (err) {
            return undefined;
        }
        return content;
    }
    Utils.readTestFile = readTestFile;
    function memoize(f) {
        var cache = {};
        return (function () {
            var key = Array.prototype.join.call(arguments);
            var cachedResult = cache[key];
            if (cachedResult) {
                return cachedResult;
            }
            else {
                return cache[key] = f.apply(this, arguments);
            }
        });
    }
    Utils.memoize = memoize;
    function assertInvariants(node, parent) {
        if (node) {
            assert.isFalse(node.pos < 0, "node.pos < 0");
            assert.isFalse(node.end < 0, "node.end < 0");
            assert.isFalse(node.end < node.pos, "node.end < node.pos");
            assert.equal(node.parent, parent, "node.parent !== parent");
            if (parent) {
                // Make sure each child is contained within the parent.
                assert.isFalse(node.pos < parent.pos, "node.pos < parent.pos");
                assert.isFalse(node.end > parent.end, "node.end > parent.end");
            }
            ts.forEachChild(node, function (child) {
                assertInvariants(child, node);
            });
            // Make sure each of the children is in order.
            var currentPos_1 = 0;
            ts.forEachChild(node, function (child) {
                assert.isFalse(child.pos < currentPos_1, "child.pos < currentPos");
                currentPos_1 = child.end;
            }, function (array) {
                assert.isFalse(array.pos < node.pos, "array.pos < node.pos");
                assert.isFalse(array.end > node.end, "array.end > node.end");
                assert.isFalse(array.pos < currentPos_1, "array.pos < currentPos");
                for (var i = 0, n = array.length; i < n; i++) {
                    assert.isFalse(array[i].pos < currentPos_1, "array[i].pos < currentPos");
                    currentPos_1 = array[i].end;
                }
                currentPos_1 = array.end;
            });
            var childNodesAndArrays_1 = [];
            ts.forEachChild(node, function (child) { childNodesAndArrays_1.push(child); }, function (array) { childNodesAndArrays_1.push(array); });
            for (var childName in node) {
                if (childName === "parent" || childName === "nextContainer" || childName === "modifiers" || childName === "externalModuleIndicator" ||
                    // for now ignore jsdoc comments
                    childName === "jsDocComment") {
                    continue;
                }
                var child = node[childName];
                if (isNodeOrArray(child)) {
                    assert.isFalse(childNodesAndArrays_1.indexOf(child) < 0, "Missing child when forEach'ing over node: " + ts.SyntaxKind[node.kind] + "-" + childName);
                }
            }
        }
    }
    Utils.assertInvariants = assertInvariants;
    function isNodeOrArray(a) {
        return a !== undefined && typeof a.pos === "number";
    }
    function convertDiagnostics(diagnostics) {
        return diagnostics.map(convertDiagnostic);
    }
    Utils.convertDiagnostics = convertDiagnostics;
    function convertDiagnostic(diagnostic) {
        return {
            start: diagnostic.start,
            length: diagnostic.length,
            messageText: ts.flattenDiagnosticMessageText(diagnostic.messageText, Harness.IO.newLine()),
            category: ts.DiagnosticCategory[diagnostic.category],
            code: diagnostic.code
        };
    }
    function sourceFileToJSON(file) {
        return JSON.stringify(file, function (k, v) {
            return isNodeOrArray(v) ? serializeNode(v) : v;
        }, "    ");
        function getKindName(k) {
            if (typeof k === "string") {
                return k;
            }
            // For some markers in SyntaxKind, we should print its original syntax name instead of
            // the marker name in tests.
            if (k === ts.SyntaxKind.FirstJSDocNode ||
                k === ts.SyntaxKind.LastJSDocNode ||
                k === ts.SyntaxKind.FirstJSDocTagNode ||
                k === ts.SyntaxKind.LastJSDocTagNode) {
                for (var kindName in ts.SyntaxKind) {
                    if (ts.SyntaxKind[kindName] === k) {
                        return kindName;
                    }
                }
            }
            return ts.SyntaxKind[k];
        }
        function getFlagName(flags, f) {
            if (f === 0) {
                return 0;
            }
            var result = "";
            ts.forEach(Object.getOwnPropertyNames(flags), function (v) {
                if (isFinite(v)) {
                    v = +v;
                    if (f === +v) {
                        result = flags[v];
                        return true;
                    }
                    else if ((f & v) > 0) {
                        if (result.length)
                            result += " | ";
                        result += flags[v];
                        return false;
                    }
                }
            });
            return result;
        }
        function getNodeFlagName(f) { return getFlagName(ts.NodeFlags, f); }
        function serializeNode(n) {
            var o = { kind: getKindName(n.kind) };
            if (ts.containsParseError(n)) {
                o.containsParseError = true;
            }
            ts.forEach(Object.getOwnPropertyNames(n), function (propertyName) {
                switch (propertyName) {
                    case "parent":
                    case "symbol":
                    case "locals":
                    case "localSymbol":
                    case "kind":
                    case "semanticDiagnostics":
                    case "id":
                    case "nodeCount":
                    case "symbolCount":
                    case "identifierCount":
                    case "scriptSnapshot":
                        // Blacklist of items we never put in the baseline file.
                        break;
                    case "originalKeywordKind":
                        o[propertyName] = getKindName(n[propertyName]);
                        break;
                    case "flags":
                        // Clear the flags that are produced by aggregating child values. That is ephemeral
                        // data we don't care about in the dump. We only care what the parser set directly
                        // on the AST.
                        var flags = n.flags & ~(134217728 /* JavaScriptFile */ | 536870912 /* HasAggregatedChildData */);
                        if (flags) {
                            o[propertyName] = getNodeFlagName(flags);
                        }
                        break;
                    case "referenceDiagnostics":
                    case "parseDiagnostics":
                        o[propertyName] = Utils.convertDiagnostics(n[propertyName]);
                        break;
                    case "nextContainer":
                        if (n.nextContainer) {
                            o[propertyName] = { kind: n.nextContainer.kind, pos: n.nextContainer.pos, end: n.nextContainer.end };
                        }
                        break;
                    case "text":
                        // Include 'text' field for identifiers/literals, but not for source files.
                        if (n.kind !== ts.SyntaxKind.SourceFile) {
                            o[propertyName] = n[propertyName];
                        }
                        break;
                    default:
                        o[propertyName] = n[propertyName];
                }
                return undefined;
            });
            return o;
        }
    }
    Utils.sourceFileToJSON = sourceFileToJSON;
    function assertDiagnosticsEquals(array1, array2) {
        if (array1 === array2) {
            return;
        }
        assert(array1, "array1");
        assert(array2, "array2");
        assert.equal(array1.length, array2.length, "array1.length !== array2.length");
        for (var i = 0, n = array1.length; i < n; i++) {
            var d1 = array1[i];
            var d2 = array2[i];
            assert.equal(d1.start, d2.start, "d1.start !== d2.start");
            assert.equal(d1.length, d2.length, "d1.length !== d2.length");
            assert.equal(ts.flattenDiagnosticMessageText(d1.messageText, Harness.IO.newLine()), ts.flattenDiagnosticMessageText(d2.messageText, Harness.IO.newLine()), "d1.messageText !== d2.messageText");
            assert.equal(d1.category, d2.category, "d1.category !== d2.category");
            assert.equal(d1.code, d2.code, "d1.code !== d2.code");
        }
    }
    Utils.assertDiagnosticsEquals = assertDiagnosticsEquals;
    function assertStructuralEquals(node1, node2) {
        if (node1 === node2) {
            return;
        }
        assert(node1, "node1");
        assert(node2, "node2");
        assert.equal(node1.pos, node2.pos, "node1.pos !== node2.pos");
        assert.equal(node1.end, node2.end, "node1.end !== node2.end");
        assert.equal(node1.kind, node2.kind, "node1.kind !== node2.kind");
        // call this on both nodes to ensure all propagated flags have been set (and thus can be
        // compared).
        assert.equal(ts.containsParseError(node1), ts.containsParseError(node2));
        assert.equal(node1.flags, node2.flags, "node1.flags !== node2.flags");
        ts.forEachChild(node1, function (child1) {
            var childName = findChildName(node1, child1);
            var child2 = node2[childName];
            assertStructuralEquals(child1, child2);
        }, function (array1) {
            var childName = findChildName(node1, array1);
            var array2 = node2[childName];
            assertArrayStructuralEquals(array1, array2);
        });
    }
    Utils.assertStructuralEquals = assertStructuralEquals;
    function assertArrayStructuralEquals(array1, array2) {
        if (array1 === array2) {
            return;
        }
        assert(array1, "array1");
        assert(array2, "array2");
        assert.equal(array1.pos, array2.pos, "array1.pos !== array2.pos");
        assert.equal(array1.end, array2.end, "array1.end !== array2.end");
        assert.equal(array1.length, array2.length, "array1.length !== array2.length");
        for (var i = 0, n = array1.length; i < n; i++) {
            assertStructuralEquals(array1[i], array2[i]);
        }
    }
    function findChildName(parent, child) {
        for (var name_1 in parent) {
            if (parent.hasOwnProperty(name_1) && parent[name_1] === child) {
                return name_1;
            }
        }
        throw new Error("Could not find child in parent");
    }
})(Utils || (Utils = {}));
var Harness;
(function (Harness) {
    var Path;
    (function (Path) {
        function getFileName(fullPath) {
            return fullPath.replace(/^.*[\\\/]/, "");
        }
        Path.getFileName = getFileName;
        function filePath(fullPath) {
            fullPath = ts.normalizeSlashes(fullPath);
            var components = fullPath.split("/");
            var path = components.slice(0, components.length - 1);
            return path.join("/") + "/";
        }
        Path.filePath = filePath;
    })(Path = Harness.Path || (Harness.Path = {}));
})(Harness || (Harness = {}));
var Harness;
(function (Harness) {
    // harness always uses one kind of new line
    var harnessNewLine = "\r\n";
    var IOImpl;
    (function (IOImpl) {
        var CScript;
        (function (CScript) {
            var fso;
            if (global.ActiveXObject) {
                fso = new global.ActiveXObject("Scripting.FileSystemObject");
            }
            else {
                fso = {};
            }
            CScript.args = function () { return ts.sys.args; };
            CScript.getExecutingFilePath = function () { return ts.sys.getExecutingFilePath(); };
            CScript.exit = function (exitCode) { return ts.sys.exit(exitCode); };
            CScript.resolvePath = function (path) { return ts.sys.resolvePath(path); };
            CScript.getCurrentDirectory = function () { return ts.sys.getCurrentDirectory(); };
            CScript.newLine = function () { return harnessNewLine; };
            CScript.useCaseSensitiveFileNames = function () { return ts.sys.useCaseSensitiveFileNames; };
            CScript.readFile = function (path) { return ts.sys.readFile(path); };
            CScript.writeFile = function (path, content) { return ts.sys.writeFile(path, content); };
            CScript.directoryName = fso.GetParentFolderName;
            CScript.getDirectories = function (dir) { return ts.sys.getDirectories(dir); };
            CScript.directoryExists = fso.FolderExists;
            CScript.fileExists = fso.FileExists;
            CScript.log = global.WScript && global.WScript.StdOut.WriteLine;
            CScript.readDirectory = function (path, extension, exclude, include) { return ts.sys.readDirectory(path, extension, exclude, include); };
            function createDirectory(path) {
                if (CScript.directoryExists(path)) {
                    fso.CreateFolder(path);
                }
            }
            CScript.createDirectory = createDirectory;
            function deleteFile(path) {
                if (CScript.fileExists(path)) {
                    fso.DeleteFile(path, true); // true: delete read-only files
                }
            }
            CScript.deleteFile = deleteFile;
            CScript.listFiles = function (path, spec, options) {
                options = options || {};
                function filesInFolder(folder, root) {
                    var paths = [];
                    var fc;
                    if (options.recursive) {
                        fc = new Enumerator(folder.subfolders);
                        for (; !fc.atEnd(); fc.moveNext()) {
                            paths = paths.concat(filesInFolder(fc.item(), root + "\\" + fc.item().Name));
                        }
                    }
                    fc = new Enumerator(folder.files);
                    for (; !fc.atEnd(); fc.moveNext()) {
                        if (!spec || fc.item().Name.match(spec)) {
                            paths.push(root + "\\" + fc.item().Name);
                        }
                    }
                    return paths;
                }
                var folder = fso.GetFolder(path);
                return filesInFolder(folder, path);
            };
        })(CScript = IOImpl.CScript || (IOImpl.CScript = {}));
        var Node;
        (function (Node) {
            var fs, pathModule;
            if (require) {
                fs = require("fs");
                pathModule = require("path");
            }
            else {
                fs = pathModule = {};
            }
            Node.resolvePath = function (path) { return ts.sys.resolvePath(path); };
            Node.getCurrentDirectory = function () { return ts.sys.getCurrentDirectory(); };
            Node.newLine = function () { return harnessNewLine; };
            Node.useCaseSensitiveFileNames = function () { return ts.sys.useCaseSensitiveFileNames; };
            Node.args = function () { return ts.sys.args; };
            Node.getExecutingFilePath = function () { return ts.sys.getExecutingFilePath(); };
            Node.exit = function (exitCode) { return ts.sys.exit(exitCode); };
            Node.getDirectories = function (path) { return ts.sys.getDirectories(path); };
            Node.readFile = function (path) { return ts.sys.readFile(path); };
            Node.writeFile = function (path, content) { return ts.sys.writeFile(path, content); };
            Node.fileExists = fs.existsSync;
            Node.log = function (s) { return console.log(s); };
            Node.readDirectory = function (path, extension, exclude, include) { return ts.sys.readDirectory(path, extension, exclude, include); };
            function createDirectory(path) {
                if (!directoryExists(path)) {
                    fs.mkdirSync(path);
                }
            }
            Node.createDirectory = createDirectory;
            function deleteFile(path) {
                try {
                    fs.unlinkSync(path);
                }
                catch (e) {
                }
            }
            Node.deleteFile = deleteFile;
            function directoryExists(path) {
                return fs.existsSync(path) && fs.statSync(path).isDirectory();
            }
            Node.directoryExists = directoryExists;
            function directoryName(path) {
                var dirPath = pathModule.dirname(path);
                // Node will just continue to repeat the root path, rather than return null
                return dirPath === path ? undefined : dirPath;
            }
            Node.directoryName = directoryName;
            Node.listFiles = function (path, spec, options) {
                options = options || {};
                function filesInFolder(folder) {
                    var paths = [];
                    var files = fs.readdirSync(folder);
                    for (var i = 0; i < files.length; i++) {
                        var pathToFile = pathModule.join(folder, files[i]);
                        var stat = fs.statSync(pathToFile);
                        if (options.recursive && stat.isDirectory()) {
                            paths = paths.concat(filesInFolder(pathToFile));
                        }
                        else if (stat.isFile() && (!spec || files[i].match(spec))) {
                            paths.push(pathToFile);
                        }
                    }
                    return paths;
                }
                return filesInFolder(path);
            };
            Node.getMemoryUsage = function () {
                if (global.gc) {
                    global.gc();
                }
                return process.memoryUsage().heapUsed;
            };
        })(Node = IOImpl.Node || (IOImpl.Node = {}));
        var Network;
        (function (Network) {
            var serverRoot = "http://localhost:8888/";
            Network.newLine = function () { return harnessNewLine; };
            Network.useCaseSensitiveFileNames = function () { return false; };
            Network.getCurrentDirectory = function () { return ""; };
            Network.args = function () { return []; };
            Network.getExecutingFilePath = function () { return ""; };
            Network.exit = function (exitCode) { };
            Network.getDirectories = function () { return []; };
            Network.log = function (s) { return console.log(s); };
            var Http;
            (function (Http) {
                function waitForXHR(xhr) {
                    while (xhr.readyState !== 4) { }
                    return { status: xhr.status, responseText: xhr.responseText };
                }
                /// Ask the server for the contents of the file at the given URL via a simple GET request
                function getFileFromServerSync(url) {
                    var xhr = new XMLHttpRequest();
                    try {
                        xhr.open("GET", url, /*async*/ false);
                        xhr.send();
                    }
                    catch (e) {
                        return { status: 404, responseText: undefined };
                    }
                    return waitForXHR(xhr);
                }
                Http.getFileFromServerSync = getFileFromServerSync;
                /// Submit a POST request to the server to do the given action (ex WRITE, DELETE) on the provided URL
                function writeToServerSync(url, action, contents) {
                    var xhr = new XMLHttpRequest();
                    try {
                        var actionMsg = "?action=" + action;
                        xhr.open("POST", url + actionMsg, /*async*/ false);
                        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                        xhr.send(contents);
                    }
                    catch (e) {
                        Network.log("XHR Error: " + e);
                        return { status: 500, responseText: undefined };
                    }
                    return waitForXHR(xhr);
                }
                Http.writeToServerSync = writeToServerSync;
            })(Http || (Http = {}));
            function createDirectory(path) {
                // Do nothing (?)
            }
            Network.createDirectory = createDirectory;
            function deleteFile(path) {
                Http.writeToServerSync(serverRoot + path, "DELETE");
            }
            Network.deleteFile = deleteFile;
            function directoryExists(path) {
                return false;
            }
            Network.directoryExists = directoryExists;
            function directoryNameImpl(path) {
                var dirPath = path;
                // root of the server
                if (dirPath.match(/localhost:\d+$/) || dirPath.match(/localhost:\d+\/$/)) {
                    dirPath = undefined;
                }
                else if (dirPath.indexOf(".") === -1) {
                    dirPath = dirPath.substring(0, dirPath.lastIndexOf("/"));
                }
                else {
                    // strip any trailing slash
                    if (dirPath.match(/.*\/$/)) {
                        dirPath = dirPath.substring(0, dirPath.length - 2);
                    }
                    dirPath = dirPath.substring(0, dirPath.lastIndexOf("/"));
                }
                return dirPath;
            }
            Network.directoryName = Utils.memoize(directoryNameImpl);
            Network.resolvePath = function (path) { return Network.directoryName(path); };
            function fileExists(path) {
                var response = Http.getFileFromServerSync(serverRoot + path);
                return response.status === 200;
            }
            Network.fileExists = fileExists;
            function _listFilesImpl(path, spec, options) {
                var response = Http.getFileFromServerSync(serverRoot + path);
                if (response.status === 200) {
                    var results = response.responseText.split(",");
                    if (spec) {
                        return results.filter(function (file) { return spec.test(file); });
                    }
                    else {
                        return results;
                    }
                }
                else {
                    return [""];
                }
            }
            Network._listFilesImpl = _listFilesImpl;
            ;
            Network.listFiles = Utils.memoize(_listFilesImpl);
            function readFile(file) {
                var response = Http.getFileFromServerSync(serverRoot + file);
                if (response.status === 200) {
                    return response.responseText;
                }
                else {
                    return undefined;
                }
            }
            Network.readFile = readFile;
            function writeFile(path, contents) {
                Http.writeToServerSync(serverRoot + path, "WRITE", contents);
            }
            Network.writeFile = writeFile;
            function readDirectory(path, extension, exclude, include) {
                var fs = new Utils.VirtualFileSystem(path, Network.useCaseSensitiveFileNames());
                for (var file in Network.listFiles(path)) {
                    fs.addFile(file);
                }
                return ts.matchFiles(path, extension, exclude, include, Network.useCaseSensitiveFileNames(), Network.getCurrentDirectory(), function (path) {
                    var entry = fs.traversePath(path);
                    if (entry && entry.isDirectory()) {
                        var directory = entry;
                        return {
                            files: ts.map(directory.getFiles(), function (f) { return f.name; }),
                            directories: ts.map(directory.getDirectories(), function (d) { return d.name; })
                        };
                    }
                    return { files: [], directories: [] };
                });
            }
            Network.readDirectory = readDirectory;
        })(Network = IOImpl.Network || (IOImpl.Network = {}));
    })(IOImpl || (IOImpl = {}));
    switch (Utils.getExecutionEnvironment()) {
        case 2 /* CScript */:
            Harness.IO = IOImpl.CScript;
            break;
        case 0 /* Node */:
            Harness.IO = IOImpl.Node;
            break;
        case 1 /* Browser */:
            Harness.IO = IOImpl.Network;
            break;
    }
})(Harness || (Harness = {}));
var Harness;
(function (Harness) {
    Harness.libFolder = "built/local/";
    var tcServicesFileName = ts.combinePaths(Harness.libFolder, Utils.getExecutionEnvironment() === 1 /* Browser */ ? "typescriptServicesInBrowserTest.js" : "typescriptServices.js");
    Harness.tcServicesFile = Harness.IO.readFile(tcServicesFileName);
    // Settings
    Harness.userSpecifiedRoot = "";
    Harness.lightMode = false;
    /** Functionality for compiling TypeScript code */
    var Compiler;
    (function (Compiler) {
        /** Aggregate various writes into a single array of lines. Useful for passing to the
         *  TypeScript compiler to fill with source code or errors.
         */
        var WriterAggregator = (function () {
            function WriterAggregator() {
                this.lines = [];
                this.currentLine = undefined;
            }
            WriterAggregator.prototype.Write = function (str) {
                // out of memory usage concerns avoid using + or += if we're going to do any manipulation of this string later
                this.currentLine = [(this.currentLine || ""), str].join("");
            };
            WriterAggregator.prototype.WriteLine = function (str) {
                // out of memory usage concerns avoid using + or += if we're going to do any manipulation of this string later
                this.lines.push([(this.currentLine || ""), str].join(""));
                this.currentLine = undefined;
            };
            WriterAggregator.prototype.Close = function () {
                if (this.currentLine !== undefined) {
                    this.lines.push(this.currentLine);
                }
                this.currentLine = undefined;
            };
            WriterAggregator.prototype.reset = function () {
                this.lines = [];
                this.currentLine = undefined;
            };
            return WriterAggregator;
        }());
        Compiler.WriterAggregator = WriterAggregator;
        function createSourceFileAndAssertInvariants(fileName, sourceText, languageVersion) {
            // We'll only assert invariants outside of light mode.
            var shouldAssertInvariants = !Harness.lightMode;
            // Only set the parent nodes if we're asserting invariants.  We don't need them otherwise.
            var result = ts.createSourceFile(fileName, sourceText, languageVersion, /*setParentNodes:*/ shouldAssertInvariants);
            if (shouldAssertInvariants) {
                Utils.assertInvariants(result, /*parent:*/ undefined);
            }
            return result;
        }
        Compiler.createSourceFileAndAssertInvariants = createSourceFileAndAssertInvariants;
        var carriageReturnLineFeed = "\r\n";
        var lineFeed = "\n";
        Compiler.defaultLibFileName = "lib.d.ts";
        Compiler.es2015DefaultLibFileName = "lib.es2015.d.ts";
        var libFileNameSourceFileMap = (_a = {},
            _a[Compiler.defaultLibFileName] = createSourceFileAndAssertInvariants(Compiler.defaultLibFileName, Harness.IO.readFile(Harness.libFolder + "lib.es5.d.ts"), /*languageVersion*/ 2 /* Latest */),
            _a
        );
        function getDefaultLibrarySourceFile(fileName) {
            if (fileName === void 0) { fileName = Compiler.defaultLibFileName; }
            if (!isDefaultLibraryFile(fileName)) {
                return undefined;
            }
            if (!libFileNameSourceFileMap[fileName]) {
                libFileNameSourceFileMap[fileName] = createSourceFileAndAssertInvariants(fileName, Harness.IO.readFile(Harness.libFolder + fileName), 2 /* Latest */);
            }
            return libFileNameSourceFileMap[fileName];
        }
        Compiler.getDefaultLibrarySourceFile = getDefaultLibrarySourceFile;
        function getDefaultLibFileName(options) {
            return options.target === 2 /* ES6 */ ? Compiler.es2015DefaultLibFileName : Compiler.defaultLibFileName;
        }
        Compiler.getDefaultLibFileName = getDefaultLibFileName;
        // Cache these between executions so we don't have to re-parse them for every test
        Compiler.fourslashFileName = "fourslash.ts";
        function getCanonicalFileName(fileName) {
            return fileName;
        }
        Compiler.getCanonicalFileName = getCanonicalFileName;
        function createCompilerHost(inputFiles, writeFile, scriptTarget, useCaseSensitiveFileNames, 
            // the currentDirectory is needed for rwcRunner to passed in specified current directory to compiler host
            currentDirectory, newLineKind) {
            // Local get canonical file name function, that depends on passed in parameter for useCaseSensitiveFileNames
            var getCanonicalFileName = ts.createGetCanonicalFileName(useCaseSensitiveFileNames);
            var realPathMap = ts.createFileMap();
            var fileMap = ts.createFileMap();
            var _loop_1 = function(file) {
                if (file.content !== undefined) {
                    var fileName = ts.normalizePath(file.unitName);
                    var path_1 = ts.toPath(file.unitName, currentDirectory, getCanonicalFileName);
                    if (file.fileOptions && file.fileOptions["symlink"]) {
                        var link = file.fileOptions["symlink"];
                        var linkPath = ts.toPath(link, currentDirectory, getCanonicalFileName);
                        realPathMap.set(linkPath, fileName);
                        fileMap.set(path_1, function () { throw new Error("Symlinks should always be resolved to a realpath first"); });
                    }
                    var sourceFile_1 = createSourceFileAndAssertInvariants(fileName, file.content, scriptTarget);
                    fileMap.set(path_1, function () { return sourceFile_1; });
                }
            };
            for (var _i = 0, inputFiles_1 = inputFiles; _i < inputFiles_1.length; _i++) {
                var file = inputFiles_1[_i];
                _loop_1(file);
            }
            function getSourceFile(fileName, languageVersion) {
                fileName = ts.normalizePath(fileName);
                var path = ts.toPath(fileName, currentDirectory, getCanonicalFileName);
                if (fileMap.contains(path)) {
                    return fileMap.get(path)();
                }
                else if (fileName === Compiler.fourslashFileName) {
                    var tsFn = "tests/cases/fourslash/" + Compiler.fourslashFileName;
                    Compiler.fourslashSourceFile = Compiler.fourslashSourceFile || createSourceFileAndAssertInvariants(tsFn, Harness.IO.readFile(tsFn), scriptTarget);
                    return Compiler.fourslashSourceFile;
                }
                else {
                    // Don't throw here -- the compiler might be looking for a test that actually doesn't exist as part of the TC
                    // Return if it is other library file, otherwise return undefined
                    return getDefaultLibrarySourceFile(fileName);
                }
            }
            var newLine = newLineKind === 0 /* CarriageReturnLineFeed */ ? carriageReturnLineFeed :
                newLineKind === 1 /* LineFeed */ ? lineFeed :
                    Harness.IO.newLine();
            return {
                getCurrentDirectory: function () { return currentDirectory; },
                getSourceFile: getSourceFile,
                getDefaultLibFileName: getDefaultLibFileName,
                writeFile: writeFile,
                getCanonicalFileName: getCanonicalFileName,
                useCaseSensitiveFileNames: function () { return useCaseSensitiveFileNames; },
                getNewLine: function () { return newLine; },
                fileExists: function (fileName) {
                    var path = ts.toPath(fileName, currentDirectory, getCanonicalFileName);
                    return fileMap.contains(path) || (realPathMap && realPathMap.contains(path));
                },
                readFile: function (fileName) {
                    return fileMap.get(ts.toPath(fileName, currentDirectory, getCanonicalFileName))().getText();
                },
                realpath: realPathMap && (function (f) {
                    var path = ts.toPath(f, currentDirectory, getCanonicalFileName);
                    return realPathMap.contains(path) ? realPathMap.get(path) : path;
                }),
                directoryExists: function (dir) {
                    var path = ts.toPath(dir, currentDirectory, getCanonicalFileName);
                    // Strip trailing /, which may exist if the path is a drive root
                    if (path[path.length - 1] === "/") {
                        path = path.substr(0, path.length - 1);
                    }
                    var exists = false;
                    fileMap.forEachValue(function (key) {
                        if (key.indexOf(path) === 0 && key[path.length] === "/") {
                            exists = true;
                        }
                    });
                    return exists;
                },
                getDirectories: function (d) {
                    var path = ts.toPath(d, currentDirectory, getCanonicalFileName);
                    var result = [];
                    fileMap.forEachValue(function (key, value) {
                        if (key.indexOf(path) === 0 && key.lastIndexOf("/") > path.length) {
                            var dirName = key.substr(path.length, key.indexOf("/", path.length + 1) - path.length);
                            if (dirName[0] === "/") {
                                dirName = dirName.substr(1);
                            }
                            if (result.indexOf(dirName) < 0) {
                                result.push(dirName);
                            }
                        }
                    });
                    return result;
                }
            };
        }
        Compiler.createCompilerHost = createCompilerHost;
        // Additional options not already in ts.optionDeclarations
        var harnessOptionDeclarations = [
            { name: "allowNonTsExtensions", type: "boolean" },
            { name: "useCaseSensitiveFileNames", type: "boolean" },
            { name: "baselineFile", type: "string" },
            { name: "includeBuiltFile", type: "string" },
            { name: "fileName", type: "string" },
            { name: "libFiles", type: "string" },
            { name: "noErrorTruncation", type: "boolean" },
            { name: "suppressOutputPathCheck", type: "boolean" },
            { name: "noImplicitReferences", type: "boolean" },
            { name: "currentDirectory", type: "string" },
            { name: "symlink", type: "string" }
        ];
        var optionsIndex;
        function getCommandLineOption(name) {
            if (!optionsIndex) {
                optionsIndex = {};
                var optionDeclarations = harnessOptionDeclarations.concat(ts.optionDeclarations);
                for (var _i = 0, optionDeclarations_1 = optionDeclarations; _i < optionDeclarations_1.length; _i++) {
                    var option = optionDeclarations_1[_i];
                    optionsIndex[option.name.toLowerCase()] = option;
                }
            }
            return ts.lookUp(optionsIndex, name.toLowerCase());
        }
        function setCompilerOptionsFromHarnessSetting(settings, options) {
            for (var name_2 in settings) {
                if (settings.hasOwnProperty(name_2)) {
                    var value = settings[name_2];
                    if (value === undefined) {
                        throw new Error("Cannot have undefined value for compiler option '" + name_2 + "'.");
                    }
                    var option = getCommandLineOption(name_2);
                    if (option) {
                        var errors = [];
                        switch (option.type) {
                            case "boolean":
                                options[option.name] = value.toLowerCase() === "true";
                                break;
                            case "string":
                                options[option.name] = value;
                                break;
                            // If not a primitive, the possible types are specified in what is effectively a map of options.
                            case "list":
                                options[option.name] = ts.parseListTypeOption(option, value, errors);
                                break;
                            default:
                                options[option.name] = ts.parseCustomTypeOption(option, value, errors);
                                break;
                        }
                        if (errors.length > 0) {
                            throw new Error("Unknown value '" + value + "' for compiler option '" + name_2 + "'.");
                        }
                    }
                    else {
                        throw new Error("Unknown compiler option '" + name_2 + "'.");
                    }
                }
            }
        }
        Compiler.setCompilerOptionsFromHarnessSetting = setCompilerOptionsFromHarnessSetting;
        function compileFiles(inputFiles, otherFiles, harnessSettings, compilerOptions, 
            // Current directory is needed for rwcRunner to be able to use currentDirectory defined in json file
            currentDirectory) {
            var options = compilerOptions ? ts.clone(compilerOptions) : { noResolve: false };
            options.target = options.target || 0 /* ES3 */;
            options.newLine = options.newLine || 0 /* CarriageReturnLineFeed */;
            options.noErrorTruncation = true;
            options.skipDefaultLibCheck = typeof options.skipDefaultLibCheck === "undefined" ? true : options.skipDefaultLibCheck;
            if (typeof currentDirectory === "undefined") {
                currentDirectory = Harness.IO.getCurrentDirectory();
            }
            // Parse settings
            if (harnessSettings) {
                setCompilerOptionsFromHarnessSetting(harnessSettings, options);
            }
            if (options.rootDirs) {
                options.rootDirs = ts.map(options.rootDirs, function (d) { return ts.getNormalizedAbsolutePath(d, currentDirectory); });
            }
            var useCaseSensitiveFileNames = options.useCaseSensitiveFileNames !== undefined ? options.useCaseSensitiveFileNames : Harness.IO.useCaseSensitiveFileNames();
            var programFiles = inputFiles.slice();
            // Files from built\local that are requested by test "@includeBuiltFiles" to be in the context.
            // Treat them as library files, so include them in build, but not in baselines.
            if (options.includeBuiltFile) {
                var builtFileName = ts.combinePaths(Harness.libFolder, options.includeBuiltFile);
                var builtFile = {
                    unitName: builtFileName,
                    content: normalizeLineEndings(Harness.IO.readFile(builtFileName), Harness.IO.newLine()),
                };
                programFiles.push(builtFile);
            }
            var fileOutputs = [];
            // Files from tests\lib that are requested by "@libFiles"
            if (options.libFiles) {
                for (var _i = 0, _a = options.libFiles.split(","); _i < _a.length; _i++) {
                    var fileName = _a[_i];
                    var libFileName = "tests/lib/" + fileName;
                    programFiles.push({ unitName: libFileName, content: normalizeLineEndings(Harness.IO.readFile(libFileName), Harness.IO.newLine()) });
                }
            }
            var programFileNames = programFiles.map(function (file) { return file.unitName; });
            var compilerHost = createCompilerHost(programFiles.concat(otherFiles), function (fileName, code, writeByteOrderMark) { return fileOutputs.push({ fileName: fileName, code: code, writeByteOrderMark: writeByteOrderMark }); }, options.target, useCaseSensitiveFileNames, currentDirectory, options.newLine);
            var traceResults;
            if (options.traceResolution) {
                traceResults = [];
                compilerHost.trace = function (text) { return traceResults.push(text); };
            }
            var program = ts.createProgram(programFileNames, options, compilerHost);
            var emitResult = program.emit();
            var errors = ts.getPreEmitDiagnostics(program);
            var result = new CompilerResult(fileOutputs, errors, program, Harness.IO.getCurrentDirectory(), emitResult.sourceMaps, traceResults);
            return { result: result, options: options };
        }
        Compiler.compileFiles = compileFiles;
        function compileDeclarationFiles(inputFiles, otherFiles, result, harnessSettings, options, 
            // Current directory is needed for rwcRunner to be able to use currentDirectory defined in json file
            currentDirectory) {
            if (options.declaration && result.errors.length === 0 && result.declFilesCode.length !== result.files.length) {
                throw new Error("There were no errors and declFiles generated did not match number of js files generated");
            }
            var declInputFiles = [];
            var declOtherFiles = [];
            // if the .d.ts is non-empty, confirm it compiles correctly as well
            if (options.declaration && result.errors.length === 0 && result.declFilesCode.length > 0) {
                ts.forEach(inputFiles, function (file) { return addDtsFile(file, declInputFiles); });
                ts.forEach(otherFiles, function (file) { return addDtsFile(file, declOtherFiles); });
                var output = compileFiles(declInputFiles, declOtherFiles, harnessSettings, options, currentDirectory);
                return { declInputFiles: declInputFiles, declOtherFiles: declOtherFiles, declResult: output.result };
            }
            function addDtsFile(file, dtsFiles) {
                if (isDTS(file.unitName)) {
                    dtsFiles.push(file);
                }
                else if (isTS(file.unitName)) {
                    var declFile = findResultCodeFile(file.unitName);
                    if (declFile && !findUnit(declFile.fileName, declInputFiles) && !findUnit(declFile.fileName, declOtherFiles)) {
                        dtsFiles.push({ unitName: declFile.fileName, content: declFile.code });
                    }
                }
            }
            function findResultCodeFile(fileName) {
                var sourceFile = result.program.getSourceFile(fileName);
                assert(sourceFile, "Program has no source file with name '" + fileName + "'");
                // Is this file going to be emitted separately
                var sourceFileName;
                var outFile = options.outFile || options.out;
                if (!outFile) {
                    if (options.outDir) {
                        var sourceFilePath = ts.getNormalizedAbsolutePath(sourceFile.fileName, result.currentDirectoryForProgram);
                        sourceFilePath = sourceFilePath.replace(result.program.getCommonSourceDirectory(), "");
                        sourceFileName = ts.combinePaths(options.outDir, sourceFilePath);
                    }
                    else {
                        sourceFileName = sourceFile.fileName;
                    }
                }
                else {
                    // Goes to single --out file
                    sourceFileName = outFile;
                }
                var dTsFileName = ts.removeFileExtension(sourceFileName) + ".d.ts";
                return ts.forEach(result.declFilesCode, function (declFile) { return declFile.fileName === dTsFileName ? declFile : undefined; });
            }
            function findUnit(fileName, units) {
                return ts.forEach(units, function (unit) { return unit.unitName === fileName ? unit : undefined; });
            }
        }
        Compiler.compileDeclarationFiles = compileDeclarationFiles;
        function normalizeLineEndings(text, lineEnding) {
            var normalized = text.replace(/\r\n?/g, "\n");
            if (lineEnding !== "\n") {
                normalized = normalized.replace(/\n/g, lineEnding);
            }
            return normalized;
        }
        function minimalDiagnosticsToString(diagnostics) {
            // This is basically copied from tsc.ts's reportError to replicate what tsc does
            var errorOutput = "";
            ts.forEach(diagnostics, function (diagnostic) {
                if (diagnostic.file) {
                    var lineAndCharacter = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                    errorOutput += diagnostic.file.fileName + "(" + (lineAndCharacter.line + 1) + "," + (lineAndCharacter.character + 1) + "): ";
                }
                errorOutput += ts.DiagnosticCategory[diagnostic.category].toLowerCase() + " TS" + diagnostic.code + ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, Harness.IO.newLine()) + Harness.IO.newLine();
            });
            return errorOutput;
        }
        Compiler.minimalDiagnosticsToString = minimalDiagnosticsToString;
        function getErrorBaseline(inputFiles, diagnostics) {
            diagnostics.sort(ts.compareDiagnostics);
            var outputLines = [];
            // Count up all errors that were found in files other than lib.d.ts so we don't miss any
            var totalErrorsReportedInNonLibraryFiles = 0;
            function outputErrorText(error) {
                var message = ts.flattenDiagnosticMessageText(error.messageText, Harness.IO.newLine());
                var errLines = RunnerBase.removeFullPaths(message)
                    .split("\n")
                    .map(function (s) { return s.length > 0 && s.charAt(s.length - 1) === "\r" ? s.substr(0, s.length - 1) : s; })
                    .filter(function (s) { return s.length > 0; })
                    .map(function (s) { return "!!! " + ts.DiagnosticCategory[error.category].toLowerCase() + " TS" + error.code + ": " + s; });
                errLines.forEach(function (e) { return outputLines.push(e); });
                // do not count errors from lib.d.ts here, they are computed separately as numLibraryDiagnostics
                // if lib.d.ts is explicitly included in input files and there are some errors in it (i.e. because of duplicate identifiers)
                // then they will be added twice thus triggering 'total errors' assertion with condition
                // 'totalErrorsReportedInNonLibraryFiles + numLibraryDiagnostics + numTest262HarnessDiagnostics, diagnostics.length
                if (!error.file || !isDefaultLibraryFile(error.file.fileName)) {
                    totalErrorsReportedInNonLibraryFiles++;
                }
            }
            // Report global errors
            var globalErrors = diagnostics.filter(function (err) { return !err.file; });
            globalErrors.forEach(outputErrorText);
            // 'merge' the lines of each input file with any errors associated with it
            inputFiles.filter(function (f) { return f.content !== undefined; }).forEach(function (inputFile) {
                // Filter down to the errors in the file
                var fileErrors = diagnostics.filter(function (e) {
                    var errFn = e.file;
                    return errFn && errFn.fileName === inputFile.unitName;
                });
                // Header
                outputLines.push("==== " + inputFile.unitName + " (" + fileErrors.length + " errors) ====");
                // Make sure we emit something for every error
                var markedErrorCount = 0;
                // For each line, emit the line followed by any error squiggles matching this line
                // Note: IE JS engine incorrectly handles consecutive delimiters here when using RegExp split, so
                // we have to string-based splitting instead and try to figure out the delimiting chars
                var lineStarts = ts.computeLineStarts(inputFile.content);
                var lines = inputFile.content.split("\n");
                if (lines.length === 1) {
                    lines = lines[0].split("\r");
                }
                lines.forEach(function (line, lineIndex) {
                    if (line.length > 0 && line.charAt(line.length - 1) === "\r") {
                        line = line.substr(0, line.length - 1);
                    }
                    var thisLineStart = lineStarts[lineIndex];
                    var nextLineStart;
                    // On the last line of the file, fake the next line start number so that we handle errors on the last character of the file correctly
                    if (lineIndex === lines.length - 1) {
                        nextLineStart = inputFile.content.length;
                    }
                    else {
                        nextLineStart = lineStarts[lineIndex + 1];
                    }
                    // Emit this line from the original file
                    outputLines.push("    " + line);
                    fileErrors.forEach(function (err) {
                        // Does any error start or continue on to this line? Emit squiggles
                        var end = ts.textSpanEnd(err);
                        if ((end >= thisLineStart) && ((err.start < nextLineStart) || (lineIndex === lines.length - 1))) {
                            // How many characters from the start of this line the error starts at (could be positive or negative)
                            var relativeOffset = err.start - thisLineStart;
                            // How many characters of the error are on this line (might be longer than this line in reality)
                            var length_1 = (end - err.start) - Math.max(0, thisLineStart - err.start);
                            // Calculate the start of the squiggle
                            var squiggleStart = Math.max(0, relativeOffset);
                            // TODO/REVIEW: this doesn't work quite right in the browser if a multi file test has files whose names are just the right length relative to one another
                            outputLines.push("    " + line.substr(0, squiggleStart).replace(/[^\s]/g, " ") + new Array(Math.min(length_1, line.length - squiggleStart) + 1).join("~"));
                            // If the error ended here, or we're at the end of the file, emit its message
                            if ((lineIndex === lines.length - 1) || nextLineStart > end) {
                                // Just like above, we need to do a split on a string instead of on a regex
                                // because the JS engine does regexes wrong
                                outputErrorText(err);
                                markedErrorCount++;
                            }
                        }
                    });
                });
                // Verify we didn't miss any errors in this file
                assert.equal(markedErrorCount, fileErrors.length, "count of errors in " + inputFile.unitName);
            });
            var numLibraryDiagnostics = ts.countWhere(diagnostics, function (diagnostic) {
                return diagnostic.file && (isDefaultLibraryFile(diagnostic.file.fileName) || isBuiltFile(diagnostic.file.fileName));
            });
            var numTest262HarnessDiagnostics = ts.countWhere(diagnostics, function (diagnostic) {
                // Count an error generated from tests262-harness folder.This should only apply for test262
                return diagnostic.file && diagnostic.file.fileName.indexOf("test262-harness") >= 0;
            });
            // Verify we didn't miss any errors in total
            assert.equal(totalErrorsReportedInNonLibraryFiles + numLibraryDiagnostics + numTest262HarnessDiagnostics, diagnostics.length, "total number of errors");
            return minimalDiagnosticsToString(diagnostics) +
                Harness.IO.newLine() + Harness.IO.newLine() + outputLines.join("\r\n");
        }
        Compiler.getErrorBaseline = getErrorBaseline;
        function collateOutputs(outputFiles) {
            // Collect, test, and sort the fileNames
            outputFiles.sort(function (a, b) { return cleanName(a.fileName).localeCompare(cleanName(b.fileName)); });
            // Emit them
            var result = "";
            for (var _i = 0, outputFiles_1 = outputFiles; _i < outputFiles_1.length; _i++) {
                var outputFile = outputFiles_1[_i];
                // Some extra spacing if this isn't the first file
                if (result.length) {
                    result += "\r\n\r\n";
                }
                // FileName header + content
                result += "/*====== " + outputFile.fileName + " ======*/\r\n";
                result += outputFile.code;
            }
            return result;
            function cleanName(fn) {
                var lastSlash = ts.normalizeSlashes(fn).lastIndexOf("/");
                return fn.substr(lastSlash + 1).toLowerCase();
            }
        }
        Compiler.collateOutputs = collateOutputs;
        // This does not need to exist strictly speaking, but many tests will need to be updated if it's removed
        function compileString(code, unitName, callback) {
            // NEWTODO: Re-implement 'compileString'
            throw new Error("compileString NYI");
        }
        Compiler.compileString = compileString;
        function stringEndsWith(str, end) {
            return str.substr(str.length - end.length) === end;
        }
        function isTS(fileName) {
            return stringEndsWith(fileName, ".ts");
        }
        Compiler.isTS = isTS;
        function isTSX(fileName) {
            return stringEndsWith(fileName, ".tsx");
        }
        Compiler.isTSX = isTSX;
        function isDTS(fileName) {
            return stringEndsWith(fileName, ".d.ts");
        }
        Compiler.isDTS = isDTS;
        function isJS(fileName) {
            return stringEndsWith(fileName, ".js");
        }
        Compiler.isJS = isJS;
        function isJSX(fileName) {
            return stringEndsWith(fileName, ".jsx");
        }
        Compiler.isJSX = isJSX;
        function isJSMap(fileName) {
            return stringEndsWith(fileName, ".js.map") || stringEndsWith(fileName, ".jsx.map");
        }
        Compiler.isJSMap = isJSMap;
        /** Contains the code and errors of a compilation and some helper methods to check its status. */
        var CompilerResult = (function () {
            /** @param fileResults an array of strings for the fileName and an ITextWriter with its code */
            function CompilerResult(fileResults, errors, program, currentDirectoryForProgram, sourceMapData, traceResults) {
                this.program = program;
                this.currentDirectoryForProgram = currentDirectoryForProgram;
                this.sourceMapData = sourceMapData;
                this.traceResults = traceResults;
                this.files = [];
                this.errors = [];
                this.declFilesCode = [];
                this.sourceMaps = [];
                for (var _i = 0, fileResults_1 = fileResults; _i < fileResults_1.length; _i++) {
                    var emittedFile = fileResults_1[_i];
                    if (isDTS(emittedFile.fileName)) {
                        // .d.ts file, add to declFiles emit
                        this.declFilesCode.push(emittedFile);
                    }
                    else if (isJS(emittedFile.fileName) || isJSX(emittedFile.fileName)) {
                        // .js file, add to files
                        this.files.push(emittedFile);
                    }
                    else if (isJSMap(emittedFile.fileName)) {
                        this.sourceMaps.push(emittedFile);
                    }
                    else {
                        throw new Error("Unrecognized file extension for file " + emittedFile.fileName);
                    }
                }
                this.errors = errors;
            }
            CompilerResult.prototype.getSourceMapRecord = function () {
                if (this.sourceMapData) {
                    return Harness.SourceMapRecorder.getSourceMapRecord(this.sourceMapData, this.program, this.files);
                }
            };
            return CompilerResult;
        }());
        Compiler.CompilerResult = CompilerResult;
        var _a;
    })(Compiler = Harness.Compiler || (Harness.Compiler = {}));
    var TestCaseParser;
    (function (TestCaseParser) {
        // Regex for parsing options in the format "@Alpha: Value of any sort"
        var optionRegex = /^[\/]{2}\s*@(\w+)\s*:\s*(\S*)/gm; // multiple matches on multiple lines
        function extractCompilerSettings(content) {
            var opts = {};
            var match;
            /* tslint:disable:no-null-keyword */
            while ((match = optionRegex.exec(content)) !== null) {
                /* tslint:enable:no-null-keyword */
                opts[match[1]] = match[2];
            }
            return opts;
        }
        /** Given a test file containing // @FileName directives, return an array of named units of code to be added to an existing compiler instance */
        function makeUnitsFromTest(code, fileName, rootDir) {
            var settings = extractCompilerSettings(code);
            // List of all the subfiles we've parsed out
            var testUnitData = [];
            var lines = Utils.splitContentByNewlines(code);
            // Stuff related to the subfile we're parsing
            var currentFileContent = undefined;
            var currentFileOptions = {};
            var currentFileName = undefined;
            var refs = [];
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                var testMetaData = optionRegex.exec(line);
                if (testMetaData) {
                    // Comment line, check for global/file @options and record them
                    optionRegex.lastIndex = 0;
                    var metaDataName = testMetaData[1].toLowerCase();
                    currentFileOptions[testMetaData[1]] = testMetaData[2];
                    if (metaDataName !== "filename") {
                        continue;
                    }
                    // New metadata statement after having collected some code to go with the previous metadata
                    if (currentFileName) {
                        // Store result file
                        var newTestFile = {
                            content: currentFileContent,
                            name: currentFileName,
                            fileOptions: currentFileOptions,
                            originalFilePath: fileName,
                            references: refs
                        };
                        testUnitData.push(newTestFile);
                        // Reset local data
                        currentFileContent = undefined;
                        currentFileOptions = {};
                        currentFileName = testMetaData[2];
                        refs = [];
                    }
                    else {
                        // First metadata marker in the file
                        currentFileName = testMetaData[2];
                    }
                }
                else {
                    // Subfile content line
                    // Append to the current subfile content, inserting a newline needed
                    if (currentFileContent === undefined) {
                        currentFileContent = "";
                    }
                    else {
                        // End-of-line
                        currentFileContent = currentFileContent + "\n";
                    }
                    currentFileContent = currentFileContent + line;
                }
            }
            // normalize the fileName for the single file case
            currentFileName = testUnitData.length > 0 || currentFileName ? currentFileName : Harness.Path.getFileName(fileName);
            // EOF, push whatever remains
            var newTestFile2 = {
                content: currentFileContent || "",
                name: currentFileName,
                fileOptions: currentFileOptions,
                originalFilePath: fileName,
                references: refs
            };
            testUnitData.push(newTestFile2);
            // unit tests always list files explicitly
            var parseConfigHost = {
                useCaseSensitiveFileNames: false,
                readDirectory: function (name) { return []; },
                fileExists: function (name) { return true; }
            };
            // check if project has tsconfig.json in the list of files
            var tsConfig;
            for (var i = 0; i < testUnitData.length; i++) {
                var data = testUnitData[i];
                if (ts.getBaseFileName(data.name).toLowerCase() === "tsconfig.json") {
                    var configJson = ts.parseConfigFileTextToJson(data.name, data.content);
                    assert.isTrue(configJson.config !== undefined);
                    var baseDir = ts.normalizePath(ts.getDirectoryPath(data.name));
                    if (rootDir) {
                        baseDir = ts.getNormalizedAbsolutePath(baseDir, rootDir);
                    }
                    tsConfig = ts.parseJsonConfigFileContent(configJson.config, parseConfigHost, baseDir);
                    tsConfig.options.configFilePath = data.name;
                    // delete entry from the list
                    testUnitData.splice(i, 1);
                    break;
                }
            }
            return { settings: settings, testUnitData: testUnitData, tsConfig: tsConfig };
        }
        TestCaseParser.makeUnitsFromTest = makeUnitsFromTest;
    })(TestCaseParser = Harness.TestCaseParser || (Harness.TestCaseParser = {}));
    /** Support class for baseline files */
    var Baseline;
    (function (Baseline) {
        function localPath(fileName, baselineFolder, subfolder) {
            if (baselineFolder === undefined) {
                return baselinePath(fileName, "local", "tests/baselines", subfolder);
            }
            else {
                return baselinePath(fileName, "local", baselineFolder, subfolder);
            }
        }
        Baseline.localPath = localPath;
        function referencePath(fileName, baselineFolder, subfolder) {
            if (baselineFolder === undefined) {
                return baselinePath(fileName, "reference", "tests/baselines", subfolder);
            }
            else {
                return baselinePath(fileName, "reference", baselineFolder, subfolder);
            }
        }
        function baselinePath(fileName, type, baselineFolder, subfolder) {
            if (subfolder !== undefined) {
                return Harness.userSpecifiedRoot + baselineFolder + "/" + subfolder + "/" + type + "/" + fileName;
            }
            else {
                return Harness.userSpecifiedRoot + baselineFolder + "/" + type + "/" + fileName;
            }
        }
        var fileCache = {};
        function generateActual(actualFileName, generateContent) {
            // For now this is written using TypeScript, because sys is not available when running old test cases.
            // But we need to move to sys once we have
            // Creates the directory including its parent if not already present
            function createDirectoryStructure(dirName) {
                if (fileCache[dirName] || Harness.IO.directoryExists(dirName)) {
                    fileCache[dirName] = true;
                    return;
                }
                var parentDirectory = Harness.IO.directoryName(dirName);
                if (parentDirectory != "") {
                    createDirectoryStructure(parentDirectory);
                }
                Harness.IO.createDirectory(dirName);
                fileCache[dirName] = true;
            }
            // Create folders if needed
            createDirectoryStructure(Harness.IO.directoryName(actualFileName));
            // Delete the actual file in case it fails
            if (Harness.IO.fileExists(actualFileName)) {
                Harness.IO.deleteFile(actualFileName);
            }
            var actual = generateContent();
            if (actual === undefined) {
                throw new Error("The generated content was \"undefined\". Return \"null\" if no baselining is required.\"");
            }
            // Store the content in the 'local' folder so we
            // can accept it later (manually)
            /* tslint:disable:no-null-keyword */
            if (actual !== null) {
                /* tslint:enable:no-null-keyword */
                Harness.IO.writeFile(actualFileName, actual);
            }
            return actual;
        }
        function compareToBaseline(actual, relativeFileName, opts) {
            // actual is now either undefined (the generator had an error), null (no file requested),
            // or some real output of the function
            if (actual === undefined) {
                // Nothing to do
                return;
            }
            var refFileName = referencePath(relativeFileName, opts && opts.Baselinefolder, opts && opts.Subfolder);
            /* tslint:disable:no-null-keyword */
            if (actual === null) {
                /* tslint:enable:no-null-keyword */
                actual = "<no content>";
            }
            var expected = "<no content>";
            if (Harness.IO.fileExists(refFileName)) {
                expected = Harness.IO.readFile(refFileName);
            }
            return { expected: expected, actual: actual };
        }
        function writeComparison(expected, actual, relativeFileName, actualFileName, descriptionForDescribe) {
            var encoded_actual = Utils.encodeString(actual);
            if (expected != encoded_actual) {
                // Overwrite & issue error
                var errMsg = "The baseline file " + relativeFileName + " has changed.";
                throw new Error(errMsg);
            }
        }
        function runBaseline(descriptionForDescribe, relativeFileName, generateContent, runImmediately, opts) {
            if (runImmediately === void 0) { runImmediately = false; }
            var actual = undefined;
            var actualFileName = localPath(relativeFileName, opts && opts.Baselinefolder, opts && opts.Subfolder);
            if (runImmediately) {
                actual = generateActual(actualFileName, generateContent);
                var comparison = compareToBaseline(actual, relativeFileName, opts);
                writeComparison(comparison.expected, comparison.actual, relativeFileName, actualFileName, descriptionForDescribe);
            }
            else {
                actual = generateActual(actualFileName, generateContent);
                var comparison = compareToBaseline(actual, relativeFileName, opts);
                writeComparison(comparison.expected, comparison.actual, relativeFileName, actualFileName, descriptionForDescribe);
            }
        }
        Baseline.runBaseline = runBaseline;
    })(Baseline = Harness.Baseline || (Harness.Baseline = {}));
    function isDefaultLibraryFile(filePath) {
        // We need to make sure that the filePath is prefixed with "lib." not just containing "lib." and end with ".d.ts"
        var fileName = Harness.Path.getFileName(filePath);
        return ts.startsWith(fileName, "lib.") && ts.endsWith(fileName, ".d.ts");
    }
    Harness.isDefaultLibraryFile = isDefaultLibraryFile;
    function isBuiltFile(filePath) {
        return filePath.indexOf(Harness.libFolder) === 0;
    }
    Harness.isBuiltFile = isBuiltFile;
    function getDefaultLibraryFile(io) {
        var libFile = Harness.userSpecifiedRoot + Harness.libFolder + Harness.Compiler.defaultLibFileName;
        return { unitName: libFile, content: io.readFile(libFile) };
    }
    Harness.getDefaultLibraryFile = getDefaultLibraryFile;
    if (Error)
        Error.stackTraceLimit = 1;
})(Harness || (Harness = {}));
//# sourceMappingURL=harness.js.map