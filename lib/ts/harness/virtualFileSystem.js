var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="harness.ts" />
/// <reference path="..\compiler\commandLineParser.ts"/>
var Utils;
(function (Utils) {
    var VirtualFileSystemEntry = (function () {
        function VirtualFileSystemEntry(fileSystem, name) {
            this.fileSystem = fileSystem;
            this.name = name;
        }
        VirtualFileSystemEntry.prototype.isDirectory = function () { return false; };
        VirtualFileSystemEntry.prototype.isFile = function () { return false; };
        VirtualFileSystemEntry.prototype.isFileSystem = function () { return false; };
        return VirtualFileSystemEntry;
    }());
    Utils.VirtualFileSystemEntry = VirtualFileSystemEntry;
    var VirtualFile = (function (_super) {
        __extends(VirtualFile, _super);
        function VirtualFile() {
            _super.apply(this, arguments);
        }
        VirtualFile.prototype.isFile = function () { return true; };
        return VirtualFile;
    }(VirtualFileSystemEntry));
    Utils.VirtualFile = VirtualFile;
    var VirtualFileSystemContainer = (function (_super) {
        __extends(VirtualFileSystemContainer, _super);
        function VirtualFileSystemContainer() {
            _super.apply(this, arguments);
        }
        VirtualFileSystemContainer.prototype.getFileSystemEntry = function (name) {
            for (var _i = 0, _a = this.getFileSystemEntries(); _i < _a.length; _i++) {
                var entry = _a[_i];
                if (this.fileSystem.sameName(entry.name, name)) {
                    return entry;
                }
            }
            return undefined;
        };
        VirtualFileSystemContainer.prototype.getDirectories = function () {
            return ts.filter(this.getFileSystemEntries(), function (entry) { return entry.isDirectory(); });
        };
        VirtualFileSystemContainer.prototype.getFiles = function () {
            return ts.filter(this.getFileSystemEntries(), function (entry) { return entry.isFile(); });
        };
        VirtualFileSystemContainer.prototype.getDirectory = function (name) {
            var entry = this.getFileSystemEntry(name);
            return entry.isDirectory() ? entry : undefined;
        };
        VirtualFileSystemContainer.prototype.getFile = function (name) {
            var entry = this.getFileSystemEntry(name);
            return entry.isFile() ? entry : undefined;
        };
        return VirtualFileSystemContainer;
    }(VirtualFileSystemEntry));
    Utils.VirtualFileSystemContainer = VirtualFileSystemContainer;
    var VirtualDirectory = (function (_super) {
        __extends(VirtualDirectory, _super);
        function VirtualDirectory() {
            _super.apply(this, arguments);
            this.entries = [];
        }
        VirtualDirectory.prototype.isDirectory = function () { return true; };
        VirtualDirectory.prototype.getFileSystemEntries = function () { return this.entries.slice(); };
        VirtualDirectory.prototype.addDirectory = function (name) {
            var entry = this.getFileSystemEntry(name);
            if (entry === undefined) {
                var directory = new VirtualDirectory(this.fileSystem, name);
                this.entries.push(directory);
                return directory;
            }
            else if (entry.isDirectory()) {
                return entry;
            }
            else {
                return undefined;
            }
        };
        VirtualDirectory.prototype.addFile = function (name, content) {
            var entry = this.getFileSystemEntry(name);
            if (entry === undefined) {
                var file = new VirtualFile(this.fileSystem, name);
                file.content = content;
                this.entries.push(file);
                return file;
            }
            else if (entry.isFile()) {
                var file = entry;
                file.content = content;
                return file;
            }
            else {
                return undefined;
            }
        };
        return VirtualDirectory;
    }(VirtualFileSystemContainer));
    Utils.VirtualDirectory = VirtualDirectory;
    var VirtualFileSystem = (function (_super) {
        __extends(VirtualFileSystem, _super);
        function VirtualFileSystem(currentDirectory, useCaseSensitiveFileNames) {
            _super.call(this, undefined, "");
            this.fileSystem = this;
            this.root = new VirtualDirectory(this, "");
            this.currentDirectory = currentDirectory;
            this.useCaseSensitiveFileNames = useCaseSensitiveFileNames;
        }
        VirtualFileSystem.prototype.isFileSystem = function () { return true; };
        VirtualFileSystem.prototype.getFileSystemEntries = function () { return this.root.getFileSystemEntries(); };
        VirtualFileSystem.prototype.addDirectory = function (path) {
            var components = ts.getNormalizedPathComponents(path, this.currentDirectory);
            var directory = this.root;
            for (var _i = 0, components_1 = components; _i < components_1.length; _i++) {
                var component = components_1[_i];
                directory = directory.addDirectory(component);
                if (directory === undefined) {
                    break;
                }
            }
            return directory;
        };
        VirtualFileSystem.prototype.addFile = function (path, content) {
            var absolutePath = ts.getNormalizedAbsolutePath(path, this.currentDirectory);
            var fileName = ts.getBaseFileName(path);
            var directoryPath = ts.getDirectoryPath(absolutePath);
            var directory = this.addDirectory(directoryPath);
            return directory ? directory.addFile(fileName, content) : undefined;
        };
        VirtualFileSystem.prototype.fileExists = function (path) {
            var entry = this.traversePath(path);
            return entry !== undefined && entry.isFile();
        };
        VirtualFileSystem.prototype.sameName = function (a, b) {
            return this.useCaseSensitiveFileNames ? a === b : a.toLowerCase() === b.toLowerCase();
        };
        VirtualFileSystem.prototype.traversePath = function (path) {
            var directory = this.root;
            for (var _i = 0, _a = ts.getNormalizedPathComponents(path, this.currentDirectory); _i < _a.length; _i++) {
                var component = _a[_i];
                var entry = directory.getFileSystemEntry(component);
                if (entry === undefined) {
                    return undefined;
                }
                else if (entry.isDirectory()) {
                    directory = entry;
                }
                else {
                    return entry;
                }
            }
            return directory;
        };
        return VirtualFileSystem;
    }(VirtualFileSystemContainer));
    Utils.VirtualFileSystem = VirtualFileSystem;
    var MockParseConfigHost = (function (_super) {
        __extends(MockParseConfigHost, _super);
        function MockParseConfigHost(currentDirectory, ignoreCase, files) {
            _super.call(this, currentDirectory, ignoreCase);
            for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                var file = files_1[_i];
                this.addFile(file);
            }
        }
        MockParseConfigHost.prototype.readDirectory = function (path, extensions, excludes, includes) {
            var _this = this;
            return ts.matchFiles(path, extensions, excludes, includes, this.useCaseSensitiveFileNames, this.currentDirectory, function (path) { return _this.getAccessibleFileSystemEntries(path); });
        };
        MockParseConfigHost.prototype.getAccessibleFileSystemEntries = function (path) {
            var entry = this.traversePath(path);
            if (entry && entry.isDirectory()) {
                var directory = entry;
                return {
                    files: ts.map(directory.getFiles(), function (f) { return f.name; }),
                    directories: ts.map(directory.getDirectories(), function (d) { return d.name; })
                };
            }
            return { files: [], directories: [] };
        };
        return MockParseConfigHost;
    }(VirtualFileSystem));
    Utils.MockParseConfigHost = MockParseConfigHost;
})(Utils || (Utils = {}));
//# sourceMappingURL=virtualFileSystem.js.map