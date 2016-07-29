// Copyright (c) Microsoft. All rights reserved. Licensed under the Apache License, Version 2.0.
// See LICENSE.txt in the project root for complete license information.
/// <reference path='services.ts' />
/* @internal */
var ts;
(function (ts) {
    var JsTyping;
    (function (JsTyping) {
        ;
        ;
        // A map of loose file names to library names
        // that we are confident require typings
        var safeList;
        /**
         * @param host is the object providing I/O related operations.
         * @param fileNames are the file names that belong to the same project
         * @param projectRootPath is the path to the project root directory
         * @param safeListPath is the path used to retrieve the safe list
         * @param packageNameToTypingLocation is the map of package names to their cached typing locations
         * @param typingOptions are used to customize the typing inference process
         * @param compilerOptions are used as a source for typing inference
         */
        function discoverTypings(host, fileNames, projectRootPath, safeListPath, packageNameToTypingLocation, typingOptions, compilerOptions) {
            // A typing name to typing file path mapping
            var inferredTypings = {};
            if (!typingOptions || !typingOptions.enableAutoDiscovery) {
                return { cachedTypingPaths: [], newTypingNames: [], filesToWatch: [] };
            }
            // Only infer typings for .js and .jsx files
            fileNames = ts.filter(ts.map(fileNames, ts.normalizePath), function (f) { return ts.scriptKindIs(f, /*LanguageServiceHost*/ undefined, 1 /* JS */, 2 /* JSX */); });
            if (!safeList) {
                var result = ts.readConfigFile(safeListPath, function (path) { return host.readFile(path); });
                if (result.config) {
                    safeList = result.config;
                }
                else {
                    safeList = {};
                }
                ;
            }
            var filesToWatch = [];
            // Directories to search for package.json, bower.json and other typing information
            var searchDirs = [];
            var exclude = [];
            mergeTypings(typingOptions.include);
            exclude = typingOptions.exclude || [];
            var possibleSearchDirs = ts.map(fileNames, ts.getDirectoryPath);
            if (projectRootPath !== undefined) {
                possibleSearchDirs.push(projectRootPath);
            }
            searchDirs = ts.deduplicate(possibleSearchDirs);
            for (var _i = 0, searchDirs_1 = searchDirs; _i < searchDirs_1.length; _i++) {
                var searchDir = searchDirs_1[_i];
                var packageJsonPath = ts.combinePaths(searchDir, "package.json");
                getTypingNamesFromJson(packageJsonPath, filesToWatch);
                var bowerJsonPath = ts.combinePaths(searchDir, "bower.json");
                getTypingNamesFromJson(bowerJsonPath, filesToWatch);
                var nodeModulesPath = ts.combinePaths(searchDir, "node_modules");
                getTypingNamesFromNodeModuleFolder(nodeModulesPath);
            }
            getTypingNamesFromSourceFileNames(fileNames);
            // Add the cached typing locations for inferred typings that are already installed
            for (var name_1 in packageNameToTypingLocation) {
                if (ts.hasProperty(inferredTypings, name_1) && !inferredTypings[name_1]) {
                    inferredTypings[name_1] = packageNameToTypingLocation[name_1];
                }
            }
            // Remove typings that the user has added to the exclude list
            for (var _a = 0, exclude_1 = exclude; _a < exclude_1.length; _a++) {
                var excludeTypingName = exclude_1[_a];
                delete inferredTypings[excludeTypingName];
            }
            var newTypingNames = [];
            var cachedTypingPaths = [];
            for (var typing in inferredTypings) {
                if (inferredTypings[typing] !== undefined) {
                    cachedTypingPaths.push(inferredTypings[typing]);
                }
                else {
                    newTypingNames.push(typing);
                }
            }
            return { cachedTypingPaths: cachedTypingPaths, newTypingNames: newTypingNames, filesToWatch: filesToWatch };
            /**
             * Merge a given list of typingNames to the inferredTypings map
             */
            function mergeTypings(typingNames) {
                if (!typingNames) {
                    return;
                }
                for (var _i = 0, typingNames_1 = typingNames; _i < typingNames_1.length; _i++) {
                    var typing = typingNames_1[_i];
                    if (!ts.hasProperty(inferredTypings, typing)) {
                        inferredTypings[typing] = undefined;
                    }
                }
            }
            /**
             * Get the typing info from common package manager json files like package.json or bower.json
             */
            function getTypingNamesFromJson(jsonPath, filesToWatch) {
                var result = ts.readConfigFile(jsonPath, function (path) { return host.readFile(path); });
                if (result.config) {
                    var jsonConfig = result.config;
                    filesToWatch.push(jsonPath);
                    if (jsonConfig.dependencies) {
                        mergeTypings(ts.getKeys(jsonConfig.dependencies));
                    }
                    if (jsonConfig.devDependencies) {
                        mergeTypings(ts.getKeys(jsonConfig.devDependencies));
                    }
                    if (jsonConfig.optionalDependencies) {
                        mergeTypings(ts.getKeys(jsonConfig.optionalDependencies));
                    }
                    if (jsonConfig.peerDependencies) {
                        mergeTypings(ts.getKeys(jsonConfig.peerDependencies));
                    }
                }
            }
            /**
             * Infer typing names from given file names. For example, the file name "jquery-min.2.3.4.js"
             * should be inferred to the 'jquery' typing name; and "angular-route.1.2.3.js" should be inferred
             * to the 'angular-route' typing name.
             * @param fileNames are the names for source files in the project
             */
            function getTypingNamesFromSourceFileNames(fileNames) {
                var jsFileNames = ts.filter(fileNames, ts.hasJavaScriptFileExtension);
                var inferredTypingNames = ts.map(jsFileNames, function (f) { return ts.removeFileExtension(ts.getBaseFileName(f.toLowerCase())); });
                var cleanedTypingNames = ts.map(inferredTypingNames, function (f) { return f.replace(/((?:\.|-)min(?=\.|$))|((?:-|\.)\d+)/g, ""); });
                if (safeList === undefined) {
                    mergeTypings(cleanedTypingNames);
                }
                else {
                    mergeTypings(ts.filter(cleanedTypingNames, function (f) { return ts.hasProperty(safeList, f); }));
                }
                var hasJsxFile = ts.forEach(fileNames, function (f) { return ts.scriptKindIs(f, /*LanguageServiceHost*/ undefined, 2 /* JSX */); });
                if (hasJsxFile) {
                    mergeTypings(["react"]);
                }
            }
            /**
             * Infer typing names from node_module folder
             * @param nodeModulesPath is the path to the "node_modules" folder
             */
            function getTypingNamesFromNodeModuleFolder(nodeModulesPath) {
                // Todo: add support for ModuleResolutionHost too
                if (!host.directoryExists(nodeModulesPath)) {
                    return;
                }
                var typingNames = [];
                var fileNames = host.readDirectory(nodeModulesPath, ["*.json"], /*excludes*/ undefined, /*includes*/ undefined, /*depth*/ 2);
                for (var _i = 0, fileNames_1 = fileNames; _i < fileNames_1.length; _i++) {
                    var fileName = fileNames_1[_i];
                    var normalizedFileName = ts.normalizePath(fileName);
                    if (ts.getBaseFileName(normalizedFileName) !== "package.json") {
                        continue;
                    }
                    var result = ts.readConfigFile(normalizedFileName, function (path) { return host.readFile(path); });
                    if (!result.config) {
                        continue;
                    }
                    var packageJson = result.config;
                    // npm 3's package.json contains a "_requiredBy" field
                    // we should include all the top level module names for npm 2, and only module names whose
                    // "_requiredBy" field starts with "#" or equals "/" for npm 3.
                    if (packageJson._requiredBy &&
                        ts.filter(packageJson._requiredBy, function (r) { return r[0] === "#" || r === "/"; }).length === 0) {
                        continue;
                    }
                    // If the package has its own d.ts typings, those will take precedence. Otherwise the package name will be used
                    // to download d.ts files from DefinitelyTyped
                    if (!packageJson.name) {
                        continue;
                    }
                    if (packageJson.typings) {
                        var absolutePath = ts.getNormalizedAbsolutePath(packageJson.typings, ts.getDirectoryPath(normalizedFileName));
                        inferredTypings[packageJson.name] = absolutePath;
                    }
                    else {
                        typingNames.push(packageJson.name);
                    }
                }
                mergeTypings(typingNames);
            }
        }
        JsTyping.discoverTypings = discoverTypings;
    })(JsTyping = ts.JsTyping || (ts.JsTyping = {}));
})(ts || (ts = {}));
//# sourceMappingURL=jsTyping.js.map