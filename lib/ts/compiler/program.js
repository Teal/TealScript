/// <reference path="sys.ts" />
/// <reference path="emitter.ts" />
/// <reference path="core.ts" />
var ts;
(function (ts) {
    /* @internal */ ts.programTime = 0;
    /* @internal */ ts.emitTime = 0;
    /* @internal */ ts.ioReadTime = 0;
    /* @internal */ ts.ioWriteTime = 0;
    /** The version of the TypeScript compiler release */
    ts.version = "2.0.0";
    var emptyArray = [];
    var defaultTypeRoots = ["node_modules/@types"];
    function findConfigFile(searchPath, fileExists) {
        while (true) {
            var fileName = ts.combinePaths(searchPath, "tsconfig.json");
            if (fileExists(fileName)) {
                return fileName;
            }
            var parentPath = ts.getDirectoryPath(searchPath);
            if (parentPath === searchPath) {
                break;
            }
            searchPath = parentPath;
        }
        return undefined;
    }
    ts.findConfigFile = findConfigFile;
    function resolveTripleslashReference(moduleName, containingFile) {
        var basePath = ts.getDirectoryPath(containingFile);
        var referencedFileName = ts.isRootedDiskPath(moduleName) ? moduleName : ts.combinePaths(basePath, moduleName);
        return ts.normalizePath(referencedFileName);
    }
    ts.resolveTripleslashReference = resolveTripleslashReference;
    /* @internal */
    function computeCommonSourceDirectoryOfFilenames(fileNames, currentDirectory, getCanonicalFileName) {
        var commonPathComponents;
        var failed = ts.forEach(fileNames, function (sourceFile) {
            // Each file contributes into common source file path
            var sourcePathComponents = ts.getNormalizedPathComponents(sourceFile, currentDirectory);
            sourcePathComponents.pop(); // The base file name is not part of the common directory path
            if (!commonPathComponents) {
                // first file
                commonPathComponents = sourcePathComponents;
                return;
            }
            for (var i = 0, n = Math.min(commonPathComponents.length, sourcePathComponents.length); i < n; i++) {
                if (getCanonicalFileName(commonPathComponents[i]) !== getCanonicalFileName(sourcePathComponents[i])) {
                    if (i === 0) {
                        // Failed to find any common path component
                        return true;
                    }
                    // New common path found that is 0 -> i-1
                    commonPathComponents.length = i;
                    break;
                }
            }
            // If the sourcePathComponents was shorter than the commonPathComponents, truncate to the sourcePathComponents
            if (sourcePathComponents.length < commonPathComponents.length) {
                commonPathComponents.length = sourcePathComponents.length;
            }
        });
        // A common path can not be found when paths span multiple drives on windows, for example
        if (failed) {
            return "";
        }
        if (!commonPathComponents) {
            return currentDirectory;
        }
        return ts.getNormalizedPathFromPathComponents(commonPathComponents);
    }
    ts.computeCommonSourceDirectoryOfFilenames = computeCommonSourceDirectoryOfFilenames;
    function trace(host, message) {
        host.trace(ts.formatMessage.apply(undefined, arguments));
    }
    function isTraceEnabled(compilerOptions, host) {
        return compilerOptions.traceResolution && host.trace !== undefined;
    }
    /* @internal */
    function hasZeroOrOneAsteriskCharacter(str) {
        var seenAsterisk = false;
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) === ts.CharCode.asterisk) {
                if (!seenAsterisk) {
                    seenAsterisk = true;
                }
                else {
                    // have already seen asterisk
                    return false;
                }
            }
        }
        return true;
    }
    ts.hasZeroOrOneAsteriskCharacter = hasZeroOrOneAsteriskCharacter;
    function createResolvedModule(resolvedFileName, isExternalLibraryImport, failedLookupLocations) {
        return { resolvedModule: resolvedFileName ? { resolvedFileName: resolvedFileName, isExternalLibraryImport: isExternalLibraryImport } : undefined, failedLookupLocations: failedLookupLocations };
    }
    function moduleHasNonRelativeName(moduleName) {
        if (ts.isRootedDiskPath(moduleName)) {
            return false;
        }
        var i = moduleName.lastIndexOf("./", 1);
        var startsWithDotSlashOrDotDotSlash = i === 0 || (i === 1 && moduleName.charCodeAt(0) === ts.CharCode.dot);
        return !startsWithDotSlashOrDotDotSlash;
    }
    function tryReadTypesSection(packageJsonPath, baseDirectory, state) {
        var jsonContent;
        try {
            var jsonText = state.host.readFile(packageJsonPath);
            jsonContent = jsonText ? JSON.parse(jsonText) : {};
        }
        catch (e) {
            // gracefully handle if readFile fails or returns not JSON
            jsonContent = {};
        }
        var typesFile;
        var fieldName;
        // first try to read content of 'typings' section (backward compatibility)
        if (jsonContent.typings) {
            if (typeof jsonContent.typings === "string") {
                fieldName = "typings";
                typesFile = jsonContent.typings;
            }
            else {
                if (state.traceEnabled) {
                    trace(state.host, ts.Diagnostics.Expected_type_of_0_field_in_package_json_to_be_string_got_1, "typings", typeof jsonContent.typings);
                }
            }
        }
        // then read 'types'
        if (!typesFile && jsonContent.types) {
            if (typeof jsonContent.types === "string") {
                fieldName = "types";
                typesFile = jsonContent.types;
            }
            else {
                if (state.traceEnabled) {
                    trace(state.host, ts.Diagnostics.Expected_type_of_0_field_in_package_json_to_be_string_got_1, "types", typeof jsonContent.types);
                }
            }
        }
        if (typesFile) {
            var typesFilePath = ts.normalizePath(ts.combinePaths(baseDirectory, typesFile));
            if (state.traceEnabled) {
                trace(state.host, ts.Diagnostics.package_json_has_0_field_1_that_references_2, fieldName, typesFile, typesFilePath);
            }
            return typesFilePath;
        }
        // Use the main module for inferring types if no types package specified and the allowJs is set
        if (state.compilerOptions.allowJs && jsonContent.main && typeof jsonContent.main === "string") {
            if (state.traceEnabled) {
                trace(state.host, ts.Diagnostics.No_types_specified_in_package_json_but_allowJs_is_set_so_returning_main_value_of_0, jsonContent.main);
            }
            var mainFilePath = ts.normalizePath(ts.combinePaths(baseDirectory, jsonContent.main));
            return mainFilePath;
        }
        return undefined;
    }
    var typeReferenceExtensions = [".d.ts"];
    function getEffectiveTypeRoots(options, host) {
        if (options.typeRoots) {
            return options.typeRoots;
        }
        var currentDirectory;
        if (options.configFilePath) {
            currentDirectory = ts.getDirectoryPath(options.configFilePath);
        }
        else if (host.getCurrentDirectory) {
            currentDirectory = host.getCurrentDirectory();
        }
        if (!currentDirectory) {
            return undefined;
        }
        return ts.map(defaultTypeRoots, function (d) { return ts.combinePaths(currentDirectory, d); });
    }
    /**
     * @param {string | undefined} containingFile - file that contains type reference directive, can be undefined if containing file is unknown.
     * This is possible in case if resolution is performed for directives specified via 'types' parameter. In this case initial path for secondary lookups
     * is assumed to be the same as root directory of the project.
     */
    function resolveTypeReferenceDirective(typeReferenceDirectiveName, containingFile, options, host) {
        var traceEnabled = isTraceEnabled(options, host);
        var moduleResolutionState = {
            compilerOptions: options,
            host: host,
            skipTsx: true,
            traceEnabled: traceEnabled
        };
        var typeRoots = getEffectiveTypeRoots(options, host);
        if (traceEnabled) {
            if (containingFile === undefined) {
                if (typeRoots === undefined) {
                    trace(host, ts.Diagnostics.Resolving_type_reference_directive_0_containing_file_not_set_root_directory_not_set, typeReferenceDirectiveName);
                }
                else {
                    trace(host, ts.Diagnostics.Resolving_type_reference_directive_0_containing_file_not_set_root_directory_1, typeReferenceDirectiveName, typeRoots);
                }
            }
            else {
                if (typeRoots === undefined) {
                    trace(host, ts.Diagnostics.Resolving_type_reference_directive_0_containing_file_1_root_directory_not_set, typeReferenceDirectiveName, containingFile);
                }
                else {
                    trace(host, ts.Diagnostics.Resolving_type_reference_directive_0_containing_file_1_root_directory_2, typeReferenceDirectiveName, containingFile, typeRoots);
                }
            }
        }
        var failedLookupLocations = [];
        // Check primary library paths
        if (typeRoots && typeRoots.length) {
            if (traceEnabled) {
                trace(host, ts.Diagnostics.Resolving_with_primary_search_path_0, typeRoots.join(", "));
            }
            var primarySearchPaths = typeRoots;
            for (var _i = 0, primarySearchPaths_1 = primarySearchPaths; _i < primarySearchPaths_1.length; _i++) {
                var typeRoot = primarySearchPaths_1[_i];
                var candidate = ts.combinePaths(typeRoot, typeReferenceDirectiveName);
                var candidateDirectory = ts.getDirectoryPath(candidate);
                var resolvedFile_1 = loadNodeModuleFromDirectory(typeReferenceExtensions, candidate, failedLookupLocations, !directoryProbablyExists(candidateDirectory, host), moduleResolutionState);
                if (resolvedFile_1) {
                    if (traceEnabled) {
                        trace(host, ts.Diagnostics.Type_reference_directive_0_was_successfully_resolved_to_1_primary_Colon_2, typeReferenceDirectiveName, resolvedFile_1, true);
                    }
                    return {
                        resolvedTypeReferenceDirective: { primary: true, resolvedFileName: resolvedFile_1 },
                        failedLookupLocations: failedLookupLocations
                    };
                }
            }
        }
        else {
            if (traceEnabled) {
                trace(host, ts.Diagnostics.Root_directory_cannot_be_determined_skipping_primary_search_paths);
            }
        }
        var resolvedFile;
        var initialLocationForSecondaryLookup;
        if (containingFile) {
            initialLocationForSecondaryLookup = ts.getDirectoryPath(containingFile);
        }
        if (initialLocationForSecondaryLookup !== undefined) {
            // check secondary locations
            if (traceEnabled) {
                trace(host, ts.Diagnostics.Looking_up_in_node_modules_folder_initial_location_0, initialLocationForSecondaryLookup);
            }
            resolvedFile = loadModuleFromNodeModules(typeReferenceDirectiveName, initialLocationForSecondaryLookup, failedLookupLocations, moduleResolutionState);
            if (traceEnabled) {
                if (resolvedFile) {
                    trace(host, ts.Diagnostics.Type_reference_directive_0_was_successfully_resolved_to_1_primary_Colon_2, typeReferenceDirectiveName, resolvedFile, false);
                }
                else {
                    trace(host, ts.Diagnostics.Type_reference_directive_0_was_not_resolved, typeReferenceDirectiveName);
                }
            }
        }
        else {
            if (traceEnabled) {
                trace(host, ts.Diagnostics.Containing_file_is_not_specified_and_root_directory_cannot_be_determined_skipping_lookup_in_node_modules_folder);
            }
        }
        return {
            resolvedTypeReferenceDirective: resolvedFile
                ? { primary: false, resolvedFileName: resolvedFile }
                : undefined,
            failedLookupLocations: failedLookupLocations
        };
    }
    ts.resolveTypeReferenceDirective = resolveTypeReferenceDirective;
    function resolveModuleName(moduleName, containingFile, compilerOptions, host) {
        var traceEnabled = isTraceEnabled(compilerOptions, host);
        if (traceEnabled) {
            trace(host, ts.Diagnostics.Resolving_module_0_from_1, moduleName, containingFile);
        }
        var moduleResolution = compilerOptions.moduleResolution;
        if (moduleResolution === undefined) {
            moduleResolution = ts.getEmitModuleKind(compilerOptions) === ts.ModuleKind.CommonJS ? ts.ModuleResolutionKind.NodeJs : ts.ModuleResolutionKind.Classic;
            if (traceEnabled) {
                trace(host, ts.Diagnostics.Module_resolution_kind_is_not_specified_using_0, ts.ModuleResolutionKind[moduleResolution]);
            }
        }
        else {
            if (traceEnabled) {
                trace(host, ts.Diagnostics.Explicitly_specified_module_resolution_kind_Colon_0, ts.ModuleResolutionKind[moduleResolution]);
            }
        }
        var result;
        switch (moduleResolution) {
            case ts.ModuleResolutionKind.NodeJs:
                result = nodeModuleNameResolver(moduleName, containingFile, compilerOptions, host);
                break;
            case ts.ModuleResolutionKind.Classic:
                result = classicNameResolver(moduleName, containingFile, compilerOptions, host);
                break;
        }
        if (traceEnabled) {
            if (result.resolvedModule) {
                trace(host, ts.Diagnostics.Module_name_0_was_successfully_resolved_to_1, moduleName, result.resolvedModule.resolvedFileName);
            }
            else {
                trace(host, ts.Diagnostics.Module_name_0_was_not_resolved, moduleName);
            }
        }
        return result;
    }
    ts.resolveModuleName = resolveModuleName;
    /**
     * Any module resolution kind can be augmented with optional settings: 'baseUrl', 'paths' and 'rootDirs' - they are used to
     * mitigate differences between design time structure of the project and its runtime counterpart so the same import name
     * can be resolved successfully by TypeScript compiler and runtime module loader.
     * If these settings are set then loading procedure will try to use them to resolve module name and it can of failure it will
     * fallback to standard resolution routine.
     *
     * - baseUrl - this setting controls how non-relative module names are resolved. If this setting is specified then non-relative
     * names will be resolved relative to baseUrl: i.e. if baseUrl is '/a/b' then candidate location to resolve module name 'c/d' will
     * be '/a/b/c/d'
     * - paths - this setting can only be used when baseUrl is specified. allows to tune how non-relative module names
     * will be resolved based on the content of the module name.
     * Structure of 'paths' compiler options
     * 'paths': {
     *    pattern-1: [...substitutions],
     *    pattern-2: [...substitutions],
     *    ...
     *    pattern-n: [...substitutions]
     * }
     * Pattern here is a string that can contain zero or one '*' character. During module resolution module name will be matched against
     * all patterns in the list. Matching for patterns that don't contain '*' means that module name must be equal to pattern respecting the case.
     * If pattern contains '*' then to match pattern "<prefix>*<suffix>" module name must start with the <prefix> and end with <suffix>.
     * <MatchedStar> denotes part of the module name between <prefix> and <suffix>.
     * If module name can be matches with multiple patterns then pattern with the longest prefix will be picked.
     * After selecting pattern we'll use list of substitutions to get candidate locations of the module and the try to load module
     * from the candidate location.
     * Substitution is a string that can contain zero or one '*'. To get candidate location from substitution we'll pick every
     * substitution in the list and replace '*' with <MatchedStar> string. If candidate location is not rooted it
     * will be converted to absolute using baseUrl.
     * For example:
     * baseUrl: /a/b/c
     * "paths": {
     *     // match all module names
     *     "*": [
     *         "*",        // use matched name as is,
     *                     // <matched name> will be looked as /a/b/c/<matched name>
     *
     *         "folder1/*" // substitution will convert matched name to 'folder1/<matched name>',
     *                     // since it is not rooted then final candidate location will be /a/b/c/folder1/<matched name>
     *     ],
     *     // match module names that start with 'components/'
     *     "components/*": [ "/root/components/*" ] // substitution will convert /components/folder1/<matched name> to '/root/components/folder1/<matched name>',
     *                                              // it is rooted so it will be final candidate location
     * }
     *
     * 'rootDirs' allows the project to be spreaded across multiple locations and resolve modules with relative names as if
     * they were in the same location. For example lets say there are two files
     * '/local/src/content/file1.ts'
     * '/shared/components/contracts/src/content/protocols/file2.ts'
     * After bundling content of '/shared/components/contracts/src' will be merged with '/local/src' so
     * if file1 has the following import 'import {x} from "./protocols/file2"' it will be resolved successfully in runtime.
     * 'rootDirs' provides the way to tell compiler that in order to get the whole project it should behave as if content of all
     * root dirs were merged together.
     * I.e. for the example above 'rootDirs' will have two entries: [ '/local/src', '/shared/components/contracts/src' ].
     * Compiler will first convert './protocols/file2' into absolute path relative to the location of containing file:
     * '/local/src/content/protocols/file2' and try to load it - failure.
     * Then it will search 'rootDirs' looking for a longest matching prefix of this absolute path and if such prefix is found - absolute path will
     * be converted to a path relative to found rootDir entry './content/protocols/file2' (*). As a last step compiler will check all remaining
     * entries in 'rootDirs', use them to build absolute path out of (*) and try to resolve module from this location.
     */
    function tryLoadModuleUsingOptionalResolutionSettings(moduleName, containingDirectory, loader, failedLookupLocations, supportedExtensions, state) {
        if (moduleHasNonRelativeName(moduleName)) {
            return tryLoadModuleUsingBaseUrl(moduleName, loader, failedLookupLocations, supportedExtensions, state);
        }
        else {
            return tryLoadModuleUsingRootDirs(moduleName, containingDirectory, loader, failedLookupLocations, supportedExtensions, state);
        }
    }
    function tryLoadModuleUsingRootDirs(moduleName, containingDirectory, loader, failedLookupLocations, supportedExtensions, state) {
        if (!state.compilerOptions.rootDirs) {
            return undefined;
        }
        if (state.traceEnabled) {
            trace(state.host, ts.Diagnostics.rootDirs_option_is_set_using_it_to_resolve_relative_module_name_0, moduleName);
        }
        var candidate = ts.normalizePath(ts.combinePaths(containingDirectory, moduleName));
        var matchedRootDir;
        var matchedNormalizedPrefix;
        for (var _i = 0, _a = state.compilerOptions.rootDirs; _i < _a.length; _i++) {
            var rootDir = _a[_i];
            // rootDirs are expected to be absolute
            // in case of tsconfig.json this will happen automatically - compiler will expand relative names
            // using location of tsconfig.json as base location
            var normalizedRoot = ts.normalizePath(rootDir);
            if (!ts.endsWith(normalizedRoot, ts.directorySeparator)) {
                normalizedRoot += ts.directorySeparator;
            }
            var isLongestMatchingPrefix = ts.startsWith(candidate, normalizedRoot) &&
                (matchedNormalizedPrefix === undefined || matchedNormalizedPrefix.length < normalizedRoot.length);
            if (state.traceEnabled) {
                trace(state.host, ts.Diagnostics.Checking_if_0_is_the_longest_matching_prefix_for_1_2, normalizedRoot, candidate, isLongestMatchingPrefix);
            }
            if (isLongestMatchingPrefix) {
                matchedNormalizedPrefix = normalizedRoot;
                matchedRootDir = rootDir;
            }
        }
        if (matchedNormalizedPrefix) {
            if (state.traceEnabled) {
                trace(state.host, ts.Diagnostics.Longest_matching_prefix_for_0_is_1, candidate, matchedNormalizedPrefix);
            }
            var suffix = candidate.substr(matchedNormalizedPrefix.length);
            // first - try to load from a initial location
            if (state.traceEnabled) {
                trace(state.host, ts.Diagnostics.Loading_0_from_the_root_dir_1_candidate_location_2, suffix, matchedNormalizedPrefix, candidate);
            }
            var resolvedFileName = loader(candidate, supportedExtensions, failedLookupLocations, !directoryProbablyExists(containingDirectory, state.host), state);
            if (resolvedFileName) {
                return resolvedFileName;
            }
            if (state.traceEnabled) {
                trace(state.host, ts.Diagnostics.Trying_other_entries_in_rootDirs);
            }
            // then try to resolve using remaining entries in rootDirs
            for (var _b = 0, _c = state.compilerOptions.rootDirs; _b < _c.length; _b++) {
                var rootDir = _c[_b];
                if (rootDir === matchedRootDir) {
                    // skip the initially matched entry
                    continue;
                }
                var candidate_1 = ts.combinePaths(ts.normalizePath(rootDir), suffix);
                if (state.traceEnabled) {
                    trace(state.host, ts.Diagnostics.Loading_0_from_the_root_dir_1_candidate_location_2, suffix, rootDir, candidate_1);
                }
                var baseDirectory = ts.getDirectoryPath(candidate_1);
                var resolvedFileName_1 = loader(candidate_1, supportedExtensions, failedLookupLocations, !directoryProbablyExists(baseDirectory, state.host), state);
                if (resolvedFileName_1) {
                    return resolvedFileName_1;
                }
            }
            if (state.traceEnabled) {
                trace(state.host, ts.Diagnostics.Module_resolution_using_rootDirs_has_failed);
            }
        }
        return undefined;
    }
    function tryLoadModuleUsingBaseUrl(moduleName, loader, failedLookupLocations, supportedExtensions, state) {
        if (!state.compilerOptions.baseUrl) {
            return undefined;
        }
        if (state.traceEnabled) {
            trace(state.host, ts.Diagnostics.baseUrl_option_is_set_to_0_using_this_value_to_resolve_non_relative_module_name_1, state.compilerOptions.baseUrl, moduleName);
        }
        // string is for exact match
        var matchedPattern = undefined;
        if (state.compilerOptions.paths) {
            if (state.traceEnabled) {
                trace(state.host, ts.Diagnostics.paths_option_is_specified_looking_for_a_pattern_to_match_module_name_0, moduleName);
            }
            matchedPattern = matchPatternOrExact(ts.getKeys(state.compilerOptions.paths), moduleName);
        }
        if (matchedPattern) {
            var matchedStar = typeof matchedPattern === "string" ? undefined : matchedText(matchedPattern, moduleName);
            var matchedPatternText = typeof matchedPattern === "string" ? matchedPattern : patternText(matchedPattern);
            if (state.traceEnabled) {
                trace(state.host, ts.Diagnostics.Module_name_0_matched_pattern_1, moduleName, matchedPatternText);
            }
            for (var _i = 0, _a = state.compilerOptions.paths[matchedPatternText]; _i < _a.length; _i++) {
                var subst = _a[_i];
                var path_1 = matchedStar ? subst.replace("*", matchedStar) : subst;
                var candidate = ts.normalizePath(ts.combinePaths(state.compilerOptions.baseUrl, path_1));
                if (state.traceEnabled) {
                    trace(state.host, ts.Diagnostics.Trying_substitution_0_candidate_module_location_Colon_1, subst, path_1);
                }
                var resolvedFileName = loader(candidate, supportedExtensions, failedLookupLocations, !directoryProbablyExists(ts.getDirectoryPath(candidate), state.host), state);
                if (resolvedFileName) {
                    return resolvedFileName;
                }
            }
            return undefined;
        }
        else {
            var candidate = ts.normalizePath(ts.combinePaths(state.compilerOptions.baseUrl, moduleName));
            if (state.traceEnabled) {
                trace(state.host, ts.Diagnostics.Resolving_module_name_0_relative_to_base_url_1_2, moduleName, state.compilerOptions.baseUrl, candidate);
            }
            return loader(candidate, supportedExtensions, failedLookupLocations, !directoryProbablyExists(ts.getDirectoryPath(candidate), state.host), state);
        }
    }
    /**
     * patternStrings contains both pattern strings (containing "*") and regular strings.
     * Return an exact match if possible, or a pattern match, or undefined.
     * (These are verified by verifyCompilerOptions to have 0 or 1 "*" characters.)
     */
    function matchPatternOrExact(patternStrings, candidate) {
        var patterns = [];
        for (var _i = 0, patternStrings_1 = patternStrings; _i < patternStrings_1.length; _i++) {
            var patternString = patternStrings_1[_i];
            var pattern = tryParsePattern(patternString);
            if (pattern) {
                patterns.push(pattern);
            }
            else if (patternString === candidate) {
                // pattern was matched as is - no need to search further
                return patternString;
            }
        }
        return findBestPatternMatch(patterns, function (_) { return _; }, candidate);
    }
    function patternText(_a) {
        var prefix = _a.prefix, suffix = _a.suffix;
        return prefix + "*" + suffix;
    }
    /**
     * Given that candidate matches pattern, returns the text matching the '*'.
     * E.g.: matchedText(tryParsePattern("foo*baz"), "foobarbaz") === "bar"
     */
    function matchedText(pattern, candidate) {
        ts.Debug.assert(isPatternMatch(pattern, candidate));
        return candidate.substr(pattern.prefix.length, candidate.length - pattern.suffix.length);
    }
    /** Return the object corresponding to the best pattern to match `candidate`. */
    /* @internal */
    function findBestPatternMatch(values, getPattern, candidate) {
        var matchedValue = undefined;
        // use length of prefix as betterness criteria
        var longestMatchPrefixLength = -1;
        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
            var v = values_1[_i];
            var pattern = getPattern(v);
            if (isPatternMatch(pattern, candidate) && pattern.prefix.length > longestMatchPrefixLength) {
                longestMatchPrefixLength = pattern.prefix.length;
                matchedValue = v;
            }
        }
        return matchedValue;
    }
    ts.findBestPatternMatch = findBestPatternMatch;
    function isPatternMatch(_a, candidate) {
        var prefix = _a.prefix, suffix = _a.suffix;
        return candidate.length >= prefix.length + suffix.length &&
            ts.startsWith(candidate, prefix) &&
            ts.endsWith(candidate, suffix);
    }
    /* @internal */
    function tryParsePattern(pattern) {
        // This should be verified outside of here and a proper error thrown.
        ts.Debug.assert(hasZeroOrOneAsteriskCharacter(pattern));
        var indexOfStar = pattern.indexOf("*");
        return indexOfStar === -1 ? undefined : {
            prefix: pattern.substr(0, indexOfStar),
            suffix: pattern.substr(indexOfStar + 1)
        };
    }
    ts.tryParsePattern = tryParsePattern;
    function nodeModuleNameResolver(moduleName, containingFile, compilerOptions, host) {
        var containingDirectory = ts.getDirectoryPath(containingFile);
        var supportedExtensions = ts.getSupportedExtensions(compilerOptions);
        var traceEnabled = isTraceEnabled(compilerOptions, host);
        var failedLookupLocations = [];
        var state = { compilerOptions: compilerOptions, host: host, traceEnabled: traceEnabled, skipTsx: false };
        var resolvedFileName = tryLoadModuleUsingOptionalResolutionSettings(moduleName, containingDirectory, nodeLoadModuleByRelativeName, failedLookupLocations, supportedExtensions, state);
        var isExternalLibraryImport = false;
        if (!resolvedFileName) {
            if (moduleHasNonRelativeName(moduleName)) {
                if (traceEnabled) {
                    trace(host, ts.Diagnostics.Loading_module_0_from_node_modules_folder, moduleName);
                }
                resolvedFileName = loadModuleFromNodeModules(moduleName, containingDirectory, failedLookupLocations, state);
                isExternalLibraryImport = resolvedFileName !== undefined;
            }
            else {
                var candidate = ts.normalizePath(ts.combinePaths(containingDirectory, moduleName));
                resolvedFileName = nodeLoadModuleByRelativeName(candidate, supportedExtensions, failedLookupLocations, /*onlyRecordFailures*/ false, state);
            }
        }
        if (resolvedFileName && host.realpath) {
            var originalFileName = resolvedFileName;
            resolvedFileName = ts.normalizePath(host.realpath(resolvedFileName));
            if (traceEnabled) {
                trace(host, ts.Diagnostics.Resolving_real_path_for_0_result_1, originalFileName, resolvedFileName);
            }
        }
        return createResolvedModule(resolvedFileName, isExternalLibraryImport, failedLookupLocations);
    }
    ts.nodeModuleNameResolver = nodeModuleNameResolver;
    function nodeLoadModuleByRelativeName(candidate, supportedExtensions, failedLookupLocations, onlyRecordFailures, state) {
        if (state.traceEnabled) {
            trace(state.host, ts.Diagnostics.Loading_module_as_file_Slash_folder_candidate_module_location_0, candidate);
        }
        var resolvedFileName = loadModuleFromFile(candidate, supportedExtensions, failedLookupLocations, onlyRecordFailures, state);
        return resolvedFileName || loadNodeModuleFromDirectory(supportedExtensions, candidate, failedLookupLocations, onlyRecordFailures, state);
    }
    /* @internal */
    function directoryProbablyExists(directoryName, host) {
        // if host does not support 'directoryExists' assume that directory will exist
        return !host.directoryExists || host.directoryExists(directoryName);
    }
    ts.directoryProbablyExists = directoryProbablyExists;
    /**
     * @param {boolean} onlyRecordFailures - if true then function won't try to actually load files but instead record all attempts as failures. This flag is necessary
     * in cases when we know upfront that all load attempts will fail (because containing folder does not exists) however we still need to record all failed lookup locations.
     */
    function loadModuleFromFile(candidate, extensions, failedLookupLocation, onlyRecordFailures, state) {
        // First try to keep/add an extension: importing "./foo.ts" can be matched by a file "./foo.ts", and "./foo" by "./foo.d.ts"
        var resolvedByAddingOrKeepingExtension = loadModuleFromFileWorker(candidate, extensions, failedLookupLocation, onlyRecordFailures, state);
        if (resolvedByAddingOrKeepingExtension) {
            return resolvedByAddingOrKeepingExtension;
        }
        // Then try stripping a ".js" or ".jsx" extension and replacing it with a TypeScript one, e.g. "./foo.js" can be matched by "./foo.ts" or "./foo.d.ts"
        if (ts.hasJavaScriptFileExtension(candidate)) {
            var extensionless = ts.removeFileExtension(candidate);
            if (state.traceEnabled) {
                var extension = candidate.substring(extensionless.length);
                trace(state.host, ts.Diagnostics.File_name_0_has_a_1_extension_stripping_it, candidate, extension);
            }
            return loadModuleFromFileWorker(extensionless, extensions, failedLookupLocation, onlyRecordFailures, state);
        }
    }
    function loadModuleFromFileWorker(candidate, extensions, failedLookupLocation, onlyRecordFailures, state) {
        if (!onlyRecordFailures) {
            // check if containing folder exists - if it doesn't then just record failures for all supported extensions without disk probing
            var directory = ts.getDirectoryPath(candidate);
            if (directory) {
                onlyRecordFailures = !directoryProbablyExists(directory, state.host);
            }
        }
        return ts.forEach(extensions, tryLoad);
        function tryLoad(ext) {
            if (state.skipTsx && ts.isJsxOrTsxExtension(ext)) {
                return undefined;
            }
            var fileName = ts.fileExtensionIs(candidate, ext) ? candidate : candidate + ext;
            if (!onlyRecordFailures && state.host.fileExists(fileName)) {
                if (state.traceEnabled) {
                    trace(state.host, ts.Diagnostics.File_0_exist_use_it_as_a_name_resolution_result, fileName);
                }
                return fileName;
            }
            else {
                if (state.traceEnabled) {
                    trace(state.host, ts.Diagnostics.File_0_does_not_exist, fileName);
                }
                failedLookupLocation.push(fileName);
                return undefined;
            }
        }
    }
    function loadNodeModuleFromDirectory(extensions, candidate, failedLookupLocation, onlyRecordFailures, state) {
        var packageJsonPath = ts.combinePaths(candidate, "package.json");
        var directoryExists = !onlyRecordFailures && directoryProbablyExists(candidate, state.host);
        if (directoryExists && state.host.fileExists(packageJsonPath)) {
            if (state.traceEnabled) {
                trace(state.host, ts.Diagnostics.Found_package_json_at_0, packageJsonPath);
            }
            var typesFile = tryReadTypesSection(packageJsonPath, candidate, state);
            if (typesFile) {
                var result = loadModuleFromFile(typesFile, extensions, failedLookupLocation, !directoryProbablyExists(ts.getDirectoryPath(typesFile), state.host), state);
                if (result) {
                    return result;
                }
            }
            else {
                if (state.traceEnabled) {
                    trace(state.host, ts.Diagnostics.package_json_does_not_have_types_field);
                }
            }
        }
        else {
            if (state.traceEnabled) {
                trace(state.host, ts.Diagnostics.File_0_does_not_exist, packageJsonPath);
            }
            // record package json as one of failed lookup locations - in the future if this file will appear it will invalidate resolution results
            failedLookupLocation.push(packageJsonPath);
        }
        return loadModuleFromFile(ts.combinePaths(candidate, "index"), extensions, failedLookupLocation, !directoryExists, state);
    }
    function loadModuleFromNodeModulesFolder(moduleName, directory, failedLookupLocations, state) {
        var nodeModulesFolder = ts.combinePaths(directory, "node_modules");
        var nodeModulesFolderExists = directoryProbablyExists(nodeModulesFolder, state.host);
        var candidate = ts.normalizePath(ts.combinePaths(nodeModulesFolder, moduleName));
        var supportedExtensions = ts.getSupportedExtensions(state.compilerOptions);
        var result = loadModuleFromFile(candidate, supportedExtensions, failedLookupLocations, !nodeModulesFolderExists, state);
        if (result) {
            return result;
        }
        result = loadNodeModuleFromDirectory(supportedExtensions, candidate, failedLookupLocations, !nodeModulesFolderExists, state);
        if (result) {
            return result;
        }
    }
    function loadModuleFromNodeModules(moduleName, directory, failedLookupLocations, state) {
        directory = ts.normalizeSlashes(directory);
        while (true) {
            var baseName = ts.getBaseFileName(directory);
            if (baseName !== "node_modules") {
                // Try to load source from the package
                var packageResult = loadModuleFromNodeModulesFolder(moduleName, directory, failedLookupLocations, state);
                if (packageResult && ts.hasTypeScriptFileExtension(packageResult)) {
                    // Always prefer a TypeScript (.ts, .tsx, .d.ts) file shipped with the package
                    return packageResult;
                }
                else {
                    // Else prefer a types package over non-TypeScript results (e.g. JavaScript files)
                    var typesResult = loadModuleFromNodeModulesFolder(ts.combinePaths("@types", moduleName), directory, failedLookupLocations, state);
                    if (typesResult || packageResult) {
                        return typesResult || packageResult;
                    }
                }
            }
            var parentPath = ts.getDirectoryPath(directory);
            if (parentPath === directory) {
                break;
            }
            directory = parentPath;
        }
        return undefined;
    }
    function classicNameResolver(moduleName, containingFile, compilerOptions, host) {
        var traceEnabled = isTraceEnabled(compilerOptions, host);
        var state = { compilerOptions: compilerOptions, host: host, traceEnabled: traceEnabled, skipTsx: !compilerOptions.jsx };
        var failedLookupLocations = [];
        var supportedExtensions = ts.getSupportedExtensions(compilerOptions);
        var containingDirectory = ts.getDirectoryPath(containingFile);
        var resolvedFileName = tryLoadModuleUsingOptionalResolutionSettings(moduleName, containingDirectory, loadModuleFromFile, failedLookupLocations, supportedExtensions, state);
        if (resolvedFileName) {
            return createResolvedModule(resolvedFileName, /*isExternalLibraryImport*/ false, failedLookupLocations);
        }
        var referencedSourceFile;
        if (moduleHasNonRelativeName(moduleName)) {
            while (true) {
                var searchName = ts.normalizePath(ts.combinePaths(containingDirectory, moduleName));
                referencedSourceFile = loadModuleFromFile(searchName, supportedExtensions, failedLookupLocations, /*onlyRecordFailures*/ false, state);
                if (referencedSourceFile) {
                    break;
                }
                var parentPath = ts.getDirectoryPath(containingDirectory);
                if (parentPath === containingDirectory) {
                    break;
                }
                containingDirectory = parentPath;
            }
        }
        else {
            var candidate = ts.normalizePath(ts.combinePaths(containingDirectory, moduleName));
            referencedSourceFile = loadModuleFromFile(candidate, supportedExtensions, failedLookupLocations, /*onlyRecordFailures*/ false, state);
        }
        return referencedSourceFile
            ? { resolvedModule: { resolvedFileName: referencedSourceFile }, failedLookupLocations: failedLookupLocations }
            : { resolvedModule: undefined, failedLookupLocations: failedLookupLocations };
    }
    ts.classicNameResolver = classicNameResolver;
    /* @internal */
    ts.defaultInitCompilerOptions = {
        module: ts.ModuleKind.CommonJS,
        target: 1 /* ES5 */,
        noImplicitAny: false,
        sourceMap: false,
    };
    function createCompilerHost(options, setParentNodes) {
        var existingDirectories = {};
        function getCanonicalFileName(fileName) {
            // if underlying system can distinguish between two files whose names differs only in cases then file name already in canonical form.
            // otherwise use toLowerCase as a canonical form.
            return ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
        }
        // returned by CScript sys environment
        var unsupportedFileEncodingErrorCode = -2147024809;
        function getSourceFile(fileName, languageVersion, onError) {
            var text;
            try {
                var start = new Date().getTime();
                text = ts.sys.readFile(fileName, options.charset);
                ts.ioReadTime += new Date().getTime() - start;
            }
            catch (e) {
                if (onError) {
                    onError(e.number === unsupportedFileEncodingErrorCode
                        ? ts.createCompilerDiagnostic(ts.Diagnostics.Unsupported_file_encoding).messageText
                        : e.message);
                }
                text = "";
            }
            return text !== undefined ? ts.createSourceFile(fileName, text, languageVersion, setParentNodes) : undefined;
        }
        function directoryExists(directoryPath) {
            if (ts.hasProperty(existingDirectories, directoryPath)) {
                return true;
            }
            if (ts.sys.directoryExists(directoryPath)) {
                existingDirectories[directoryPath] = true;
                return true;
            }
            return false;
        }
        function ensureDirectoriesExist(directoryPath) {
            if (directoryPath.length > ts.getRootLength(directoryPath) && !directoryExists(directoryPath)) {
                var parentDirectory = ts.getDirectoryPath(directoryPath);
                ensureDirectoriesExist(parentDirectory);
                ts.sys.createDirectory(directoryPath);
            }
        }
        var outputFingerprints;
        function writeFileIfUpdated(fileName, data, writeByteOrderMark) {
            if (!outputFingerprints) {
                outputFingerprints = {};
            }
            var hash = ts.sys.createHash(data);
            var mtimeBefore = ts.sys.getModifiedTime(fileName);
            if (mtimeBefore && ts.hasProperty(outputFingerprints, fileName)) {
                var fingerprint = outputFingerprints[fileName];
                // If output has not been changed, and the file has no external modification
                if (fingerprint.byteOrderMark === writeByteOrderMark &&
                    fingerprint.hash === hash &&
                    fingerprint.mtime.getTime() === mtimeBefore.getTime()) {
                    return;
                }
            }
            ts.sys.writeFile(fileName, data, writeByteOrderMark);
            var mtimeAfter = ts.sys.getModifiedTime(fileName);
            outputFingerprints[fileName] = {
                hash: hash,
                byteOrderMark: writeByteOrderMark,
                mtime: mtimeAfter
            };
        }
        function writeFile(fileName, data, writeByteOrderMark, onError) {
            try {
                var start = new Date().getTime();
                ensureDirectoriesExist(ts.getDirectoryPath(ts.normalizePath(fileName)));
                if (ts.isWatchSet(options) && ts.sys.createHash && ts.sys.getModifiedTime) {
                    writeFileIfUpdated(fileName, data, writeByteOrderMark);
                }
                else {
                    ts.sys.writeFile(fileName, data, writeByteOrderMark);
                }
                ts.ioWriteTime += new Date().getTime() - start;
            }
            catch (e) {
                if (onError) {
                    onError(e.message);
                }
            }
        }
        function getDefaultLibLocation() {
            return ts.getDirectoryPath(ts.normalizePath(ts.sys.getExecutingFilePath()));
        }
        var newLine = ts.getNewLineCharacter(options);
        var realpath = ts.sys.realpath && (function (path) { return ts.sys.realpath(path); });
        return {
            getSourceFile: getSourceFile,
            getDefaultLibLocation: getDefaultLibLocation,
            getDefaultLibFileName: function (options) { return ts.combinePaths(getDefaultLibLocation(), ts.getDefaultLibFileName(options)); },
            writeFile: writeFile,
            getCurrentDirectory: ts.memoize(function () { return ts.sys.getCurrentDirectory(); }),
            useCaseSensitiveFileNames: function () { return ts.sys.useCaseSensitiveFileNames; },
            getCanonicalFileName: getCanonicalFileName,
            getNewLine: function () { return newLine; },
            fileExists: function (fileName) { return ts.sys.fileExists(fileName); },
            readFile: function (fileName) { return ts.sys.readFile(fileName); },
            trace: function (s) { return ts.sys.write(s + newLine); },
            directoryExists: function (directoryName) { return ts.sys.directoryExists(directoryName); },
            getDirectories: function (path) { return ts.sys.getDirectories(path); },
            realpath: realpath
        };
    }
    ts.createCompilerHost = createCompilerHost;
    function getPreEmitDiagnostics(program, sourceFile, cancellationToken) {
        var diagnostics = program.getOptionsDiagnostics(cancellationToken).concat(program.getSyntacticDiagnostics(sourceFile, cancellationToken), program.getGlobalDiagnostics(cancellationToken), program.getSemanticDiagnostics(sourceFile, cancellationToken));
        if (program.getCompilerOptions().declaration) {
            diagnostics = diagnostics.concat(program.getDeclarationDiagnostics(sourceFile, cancellationToken));
        }
        return ts.sortAndDeduplicateDiagnostics(diagnostics);
    }
    ts.getPreEmitDiagnostics = getPreEmitDiagnostics;
    function flattenDiagnosticMessageText(messageText, newLine) {
        if (typeof messageText === "string") {
            return messageText;
        }
        else {
            var diagnosticChain = messageText;
            var result = "";
            var indent = 0;
            while (diagnosticChain) {
                if (indent) {
                    result += newLine;
                    for (var i = 0; i < indent; i++) {
                        result += "  ";
                    }
                }
                result += diagnosticChain.messageText;
                indent++;
                diagnosticChain = diagnosticChain.next;
            }
            return result;
        }
    }
    ts.flattenDiagnosticMessageText = flattenDiagnosticMessageText;
    function loadWithLocalCache(names, containingFile, loader) {
        if (names.length === 0) {
            return [];
        }
        var resolutions = [];
        var cache = {};
        for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
            var name_1 = names_1[_i];
            var result = void 0;
            if (ts.hasProperty(cache, name_1)) {
                result = cache[name_1];
            }
            else {
                result = loader(name_1, containingFile);
                cache[name_1] = result;
            }
            resolutions.push(result);
        }
        return resolutions;
    }
    function getInferredTypesRoot(options, rootFiles, host) {
        return computeCommonSourceDirectoryOfFilenames(rootFiles, host.getCurrentDirectory(), function (f) { return host.getCanonicalFileName(f); });
    }
    /**
      * Given a set of options and a set of root files, returns the set of type directive names
      *   that should be included for this program automatically.
      * This list could either come from the config file,
      *   or from enumerating the types root + initial secondary types lookup location.
      * More type directives might appear in the program later as a result of loading actual source files;
      *   this list is only the set of defaults that are implicitly included.
      */
    function getAutomaticTypeDirectiveNames(options, rootFiles, host) {
        // Use explicit type list from tsconfig.json
        if (options.types) {
            return options.types;
        }
        // Walk the primary type lookup locations
        var result = [];
        if (host.directoryExists && host.getDirectories) {
            var typeRoots = getEffectiveTypeRoots(options, host);
            if (typeRoots) {
                for (var _i = 0, typeRoots_1 = typeRoots; _i < typeRoots_1.length; _i++) {
                    var root = typeRoots_1[_i];
                    if (host.directoryExists(root)) {
                        result = result.concat(host.getDirectories(root));
                    }
                }
            }
        }
        return result;
    }
    ts.getAutomaticTypeDirectiveNames = getAutomaticTypeDirectiveNames;
    function createProgram(rootNames, options, host, oldProgram) {
        var program;
        var files = [];
        var commonSourceDirectory;
        var diagnosticsProducingTypeChecker;
        var noDiagnosticsTypeChecker;
        var classifiableNames;
        var resolvedTypeReferenceDirectives = {};
        var fileProcessingDiagnostics = ts.createDiagnosticCollection();
        // The below settings are to track if a .js file should be add to the program if loaded via searching under node_modules.
        // This works as imported modules are discovered recursively in a depth first manner, specifically:
        // - For each root file, findSourceFile is called.
        // - This calls processImportedModules for each module imported in the source file.
        // - This calls resolveModuleNames, and then calls findSourceFile for each resolved module.
        // As all these operations happen - and are nested - within the createProgram call, they close over the below variables.
        // The current resolution depth is tracked by incrementing/decrementing as the depth first search progresses.
        var maxNodeModulesJsDepth = typeof options.maxNodeModuleJsDepth === "number" ? options.maxNodeModuleJsDepth : 2;
        var currentNodeModulesJsDepth = 0;
        // If a module has some of its imports skipped due to being at the depth limit under node_modules, then track
        // this, as it may be imported at a shallower depth later, and then it will need its skipped imports processed.
        var modulesWithElidedImports = {};
        // Track source files that are JavaScript files found by searching under node_modules, as these shouldn't be compiled.
        var sourceFilesFoundSearchingNodeModules = {};
        var start = new Date().getTime();
        host = host || createCompilerHost(options);
        var skipDefaultLib = options.noLib;
        var programDiagnostics = ts.createDiagnosticCollection();
        var currentDirectory = host.getCurrentDirectory();
        var supportedExtensions = ts.getSupportedExtensions(options);
        // Map storing if there is emit blocking diagnostics for given input
        var hasEmitBlockingDiagnostics = ts.createFileMap(getCanonicalFileName);
        var resolveModuleNamesWorker;
        if (host.resolveModuleNames) {
            resolveModuleNamesWorker = function (moduleNames, containingFile) { return host.resolveModuleNames(moduleNames, containingFile); };
        }
        else {
            var loader_1 = function (moduleName, containingFile) { return resolveModuleName(moduleName, containingFile, options, host).resolvedModule; };
            resolveModuleNamesWorker = function (moduleNames, containingFile) { return loadWithLocalCache(moduleNames, containingFile, loader_1); };
        }
        var resolveTypeReferenceDirectiveNamesWorker;
        if (host.resolveTypeReferenceDirectives) {
            resolveTypeReferenceDirectiveNamesWorker = function (typeDirectiveNames, containingFile) { return host.resolveTypeReferenceDirectives(typeDirectiveNames, containingFile); };
        }
        else {
            var loader_2 = function (typesRef, containingFile) { return resolveTypeReferenceDirective(typesRef, containingFile, options, host).resolvedTypeReferenceDirective; };
            resolveTypeReferenceDirectiveNamesWorker = function (typeReferenceDirectiveNames, containingFile) { return loadWithLocalCache(typeReferenceDirectiveNames, containingFile, loader_2); };
        }
        var filesByName = ts.createFileMap();
        // stores 'filename -> file association' ignoring case
        // used to track cases when two file names differ only in casing
        var filesByNameIgnoreCase = host.useCaseSensitiveFileNames() ? ts.createFileMap(function (fileName) { return fileName.toLowerCase(); }) : undefined;
        if (!tryReuseStructureFromOldProgram()) {
            ts.forEach(rootNames, function (name) { return processRootFile(name, /*isDefaultLib*/ false); });
            // load type declarations specified via 'types' argument or implicitly from types/ and node_modules/@types folders
            var typeReferences = getAutomaticTypeDirectiveNames(options, rootNames, host);
            if (typeReferences) {
                var inferredRoot = getInferredTypesRoot(options, rootNames, host);
                var containingFilename = ts.combinePaths(inferredRoot, "__inferred type names__.ts");
                var resolutions = resolveTypeReferenceDirectiveNamesWorker(typeReferences, containingFilename);
                for (var i = 0; i < typeReferences.length; i++) {
                    processTypeReferenceDirective(typeReferences[i], resolutions[i]);
                }
            }
            // Do not process the default library if:
            //  - The '--noLib' flag is used.
            //  - A 'no-default-lib' reference comment is encountered in
            //      processing the root files.
            if (!skipDefaultLib) {
                // If '--lib' is not specified, include default library file according to '--target'
                // otherwise, using options specified in '--lib' instead of '--target' default library file
                if (!options.lib) {
                    processRootFile(host.getDefaultLibFileName(options), /*isDefaultLib*/ true);
                }
                else {
                    var libDirectory_1 = host.getDefaultLibLocation ? host.getDefaultLibLocation() : ts.getDirectoryPath(host.getDefaultLibFileName(options));
                    ts.forEach(options.lib, function (libFileName) {
                        processRootFile(ts.combinePaths(libDirectory_1, libFileName), /*isDefaultLib*/ true);
                    });
                }
            }
        }
        // unconditionally set oldProgram to undefined to prevent it from being captured in closure
        oldProgram = undefined;
        program = {
            getRootFileNames: function () { return rootNames; },
            getSourceFile: getSourceFile,
            getSourceFileByPath: getSourceFileByPath,
            getSourceFiles: function () { return files; },
            getCompilerOptions: function () { return options; },
            getSyntacticDiagnostics: getSyntacticDiagnostics,
            getOptionsDiagnostics: getOptionsDiagnostics,
            getGlobalDiagnostics: getGlobalDiagnostics,
            getSemanticDiagnostics: getSemanticDiagnostics,
            getDeclarationDiagnostics: getDeclarationDiagnostics,
            getTypeChecker: getTypeChecker,
            getClassifiableNames: getClassifiableNames,
            getDiagnosticsProducingTypeChecker: getDiagnosticsProducingTypeChecker,
            getCommonSourceDirectory: getCommonSourceDirectory,
            emit: emit,
            getCurrentDirectory: function () { return currentDirectory; },
            getNodeCount: function () { return getDiagnosticsProducingTypeChecker().getNodeCount(); },
            getIdentifierCount: function () { return getDiagnosticsProducingTypeChecker().getIdentifierCount(); },
            getSymbolCount: function () { return getDiagnosticsProducingTypeChecker().getSymbolCount(); },
            getTypeCount: function () { return getDiagnosticsProducingTypeChecker().getTypeCount(); },
            getFileProcessingDiagnostics: function () { return fileProcessingDiagnostics; },
            getResolvedTypeReferenceDirectives: function () { return resolvedTypeReferenceDirectives; }
        };
        verifyCompilerOptions();
        ts.programTime += new Date().getTime() - start;
        return program;
        function getCommonSourceDirectory() {
            if (typeof commonSourceDirectory === "undefined") {
                if (options.rootDir && checkSourceFilesBelongToPath(files, options.rootDir)) {
                    // If a rootDir is specified and is valid use it as the commonSourceDirectory
                    commonSourceDirectory = ts.getNormalizedAbsolutePath(options.rootDir, currentDirectory);
                }
                else {
                    commonSourceDirectory = computeCommonSourceDirectory(files);
                }
                if (commonSourceDirectory && commonSourceDirectory[commonSourceDirectory.length - 1] !== ts.directorySeparator) {
                    // Make sure directory path ends with directory separator so this string can directly
                    // used to replace with "" to get the relative path of the source file and the relative path doesn't
                    // start with / making it rooted path
                    commonSourceDirectory += ts.directorySeparator;
                }
            }
            return commonSourceDirectory;
        }
        function getClassifiableNames() {
            if (!classifiableNames) {
                // Initialize a checker so that all our files are bound.
                getTypeChecker();
                classifiableNames = {};
                for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                    var sourceFile = files_1[_i];
                    ts.copyMap(sourceFile.classifiableNames, classifiableNames);
                }
            }
            return classifiableNames;
        }
        function tryReuseStructureFromOldProgram() {
            if (!oldProgram) {
                return false;
            }
            // check properties that can affect structure of the program or module resolution strategy
            // if any of these properties has changed - structure cannot be reused
            var oldOptions = oldProgram.getCompilerOptions();
            if ((oldOptions.module !== options.module) ||
                (oldOptions.moduleResolution !== options.moduleResolution) ||
                (oldOptions.noResolve !== options.noResolve) ||
                (oldOptions.target !== options.target) ||
                (oldOptions.noLib !== options.noLib) ||
                (oldOptions.jsx !== options.jsx) ||
                (oldOptions.allowJs !== options.allowJs) ||
                (oldOptions.rootDir !== options.rootDir) ||
                (oldOptions.configFilePath !== options.configFilePath) ||
                (oldOptions.baseUrl !== options.baseUrl) ||
                (oldOptions.maxNodeModuleJsDepth !== options.maxNodeModuleJsDepth) ||
                !ts.arrayIsEqualTo(oldOptions.typeRoots, oldOptions.typeRoots) ||
                !ts.arrayIsEqualTo(oldOptions.rootDirs, options.rootDirs) ||
                !ts.mapIsEqualTo(oldOptions.paths, options.paths)) {
                return false;
            }
            ts.Debug.assert(!oldProgram.structureIsReused);
            // there is an old program, check if we can reuse its structure
            var oldRootNames = oldProgram.getRootFileNames();
            if (!ts.arrayIsEqualTo(oldRootNames, rootNames)) {
                return false;
            }
            if (!ts.arrayIsEqualTo(options.types, oldOptions.types)) {
                return false;
            }
            // check if program source files has changed in the way that can affect structure of the program
            var newSourceFiles = [];
            var filePaths = [];
            var modifiedSourceFiles = [];
            for (var _i = 0, _a = oldProgram.getSourceFiles(); _i < _a.length; _i++) {
                var oldSourceFile = _a[_i];
                var newSourceFile = host.getSourceFileByPath
                    ? host.getSourceFileByPath(oldSourceFile.fileName, oldSourceFile.path, options.target)
                    : host.getSourceFile(oldSourceFile.fileName, options.target);
                if (!newSourceFile) {
                    return false;
                }
                newSourceFile.path = oldSourceFile.path;
                filePaths.push(newSourceFile.path);
                if (oldSourceFile !== newSourceFile) {
                    if (oldSourceFile.hasNoDefaultLib !== newSourceFile.hasNoDefaultLib) {
                        // value of no-default-lib has changed
                        // this will affect if default library is injected into the list of files
                        return false;
                    }
                    // check tripleslash references
                    if (!ts.arrayIsEqualTo(oldSourceFile.referencedFiles, newSourceFile.referencedFiles, fileReferenceIsEqualTo)) {
                        // tripleslash references has changed
                        return false;
                    }
                    // check imports and module augmentations
                    collectExternalModuleReferences(newSourceFile);
                    if (!ts.arrayIsEqualTo(oldSourceFile.imports, newSourceFile.imports, moduleNameIsEqualTo)) {
                        // imports has changed
                        return false;
                    }
                    if (!ts.arrayIsEqualTo(oldSourceFile.moduleAugmentations, newSourceFile.moduleAugmentations, moduleNameIsEqualTo)) {
                        // moduleAugmentations has changed
                        return false;
                    }
                    if (!ts.arrayIsEqualTo(oldSourceFile.typeReferenceDirectives, newSourceFile.typeReferenceDirectives, fileReferenceIsEqualTo)) {
                        // 'types' references has changed
                        return false;
                    }
                    var newSourceFilePath = ts.getNormalizedAbsolutePath(newSourceFile.fileName, currentDirectory);
                    if (resolveModuleNamesWorker) {
                        var moduleNames = ts.map(ts.concatenate(newSourceFile.imports, newSourceFile.moduleAugmentations), getTextOfLiteral);
                        var resolutions = resolveModuleNamesWorker(moduleNames, newSourceFilePath);
                        // ensure that module resolution results are still correct
                        var resolutionsChanged = ts.hasChangesInResolutions(moduleNames, resolutions, oldSourceFile.resolvedModules, ts.moduleResolutionIsEqualTo);
                        if (resolutionsChanged) {
                            return false;
                        }
                    }
                    if (resolveTypeReferenceDirectiveNamesWorker) {
                        var typesReferenceDirectives = ts.map(newSourceFile.typeReferenceDirectives, function (x) { return x.fileName; });
                        var resolutions = resolveTypeReferenceDirectiveNamesWorker(typesReferenceDirectives, newSourceFilePath);
                        // ensure that types resolutions are still correct
                        var resolutionsChanged = ts.hasChangesInResolutions(typesReferenceDirectives, resolutions, oldSourceFile.resolvedTypeReferenceDirectiveNames, ts.typeDirectiveIsEqualTo);
                        if (resolutionsChanged) {
                            return false;
                        }
                    }
                    // pass the cache of module/types resolutions from the old source file
                    newSourceFile.resolvedModules = oldSourceFile.resolvedModules;
                    newSourceFile.resolvedTypeReferenceDirectiveNames = oldSourceFile.resolvedTypeReferenceDirectiveNames;
                    modifiedSourceFiles.push(newSourceFile);
                }
                else {
                    // file has no changes - use it as is
                    newSourceFile = oldSourceFile;
                }
                // if file has passed all checks it should be safe to reuse it
                newSourceFiles.push(newSourceFile);
            }
            // update fileName -> file mapping
            for (var i = 0, len = newSourceFiles.length; i < len; i++) {
                filesByName.set(filePaths[i], newSourceFiles[i]);
            }
            files = newSourceFiles;
            fileProcessingDiagnostics = oldProgram.getFileProcessingDiagnostics();
            for (var _b = 0, modifiedSourceFiles_1 = modifiedSourceFiles; _b < modifiedSourceFiles_1.length; _b++) {
                var modifiedFile = modifiedSourceFiles_1[_b];
                fileProcessingDiagnostics.reattachFileDiagnostics(modifiedFile);
            }
            resolvedTypeReferenceDirectives = oldProgram.getResolvedTypeReferenceDirectives();
            oldProgram.structureIsReused = true;
            return true;
        }
        function getEmitHost(writeFileCallback) {
            return {
                getCanonicalFileName: getCanonicalFileName,
                getCommonSourceDirectory: program.getCommonSourceDirectory,
                getCompilerOptions: program.getCompilerOptions,
                getCurrentDirectory: function () { return currentDirectory; },
                getNewLine: function () { return host.getNewLine(); },
                getSourceFile: program.getSourceFile,
                getSourceFileByPath: program.getSourceFileByPath,
                getSourceFiles: program.getSourceFiles,
                isSourceFileFromExternalLibrary: function (file) { return !!ts.lookUp(sourceFilesFoundSearchingNodeModules, file.path); },
                writeFile: writeFileCallback || (function (fileName, data, writeByteOrderMark, onError, sourceFiles) { return host.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles); }),
                isEmitBlocked: isEmitBlocked,
            };
        }
        function getDiagnosticsProducingTypeChecker() {
            return diagnosticsProducingTypeChecker || (diagnosticsProducingTypeChecker = ts.createTypeChecker(program, /*produceDiagnostics:*/ true));
        }
        function getTypeChecker() {
            return noDiagnosticsTypeChecker || (noDiagnosticsTypeChecker = ts.createTypeChecker(program, /*produceDiagnostics:*/ false));
        }
        function emit(sourceFile, writeFileCallback, cancellationToken) {
            var _this = this;
            return runWithCancellationToken(function () { return emitWorker(_this, sourceFile, writeFileCallback, cancellationToken); });
        }
        function isEmitBlocked(emitFileName) {
            return hasEmitBlockingDiagnostics.contains(ts.toPath(emitFileName, currentDirectory, getCanonicalFileName));
        }
        function emitWorker(program, sourceFile, writeFileCallback, cancellationToken) {
            var declarationDiagnostics = [];
            if (options.noEmit) {
                return { diagnostics: declarationDiagnostics, sourceMaps: undefined, emittedFiles: undefined, emitSkipped: true };
            }
            // If the noEmitOnError flag is set, then check if we have any errors so far.  If so,
            // immediately bail out.  Note that we pass 'undefined' for 'sourceFile' so that we
            // get any preEmit diagnostics, not just the ones
            if (options.noEmitOnError) {
                var diagnostics = program.getOptionsDiagnostics(cancellationToken).concat(program.getSyntacticDiagnostics(sourceFile, cancellationToken), program.getGlobalDiagnostics(cancellationToken), program.getSemanticDiagnostics(sourceFile, cancellationToken));
                if (diagnostics.length === 0 && program.getCompilerOptions().declaration) {
                    declarationDiagnostics = program.getDeclarationDiagnostics(/*sourceFile*/ undefined, cancellationToken);
                }
                if (diagnostics.length > 0 || declarationDiagnostics.length > 0) {
                    return {
                        diagnostics: ts.concatenate(diagnostics, declarationDiagnostics),
                        sourceMaps: undefined,
                        emittedFiles: undefined,
                        emitSkipped: true
                    };
                }
            }
            // Create the emit resolver outside of the "emitTime" tracking code below.  That way
            // any cost associated with it (like type checking) are appropriate associated with
            // the type-checking counter.
            //
            // If the -out option is specified, we should not pass the source file to getEmitResolver.
            // This is because in the -out scenario all files need to be emitted, and therefore all
            // files need to be type checked. And the way to specify that all files need to be type
            // checked is to not pass the file to getEmitResolver.
            var emitResolver = getDiagnosticsProducingTypeChecker().getEmitResolver((options.outFile || options.out) ? undefined : sourceFile);
            var start = new Date().getTime();
            var emitResult = ts.emitFiles(emitResolver, getEmitHost(writeFileCallback), sourceFile);
            ts.emitTime += new Date().getTime() - start;
            return emitResult;
        }
        function getSourceFile(fileName) {
            return getSourceFileByPath(ts.toPath(fileName, currentDirectory, getCanonicalFileName));
        }
        function getSourceFileByPath(path) {
            return filesByName.get(path);
        }
        function getDiagnosticsHelper(sourceFile, getDiagnostics, cancellationToken) {
            if (sourceFile) {
                return getDiagnostics(sourceFile, cancellationToken);
            }
            var allDiagnostics = [];
            ts.forEach(program.getSourceFiles(), function (sourceFile) {
                if (cancellationToken) {
                    cancellationToken.throwIfCancellationRequested();
                }
                ts.addRange(allDiagnostics, getDiagnostics(sourceFile, cancellationToken));
            });
            return ts.sortAndDeduplicateDiagnostics(allDiagnostics);
        }
        function getSyntacticDiagnostics(sourceFile, cancellationToken) {
            return getDiagnosticsHelper(sourceFile, getSyntacticDiagnosticsForFile, cancellationToken);
        }
        function getSemanticDiagnostics(sourceFile, cancellationToken) {
            return getDiagnosticsHelper(sourceFile, getSemanticDiagnosticsForFile, cancellationToken);
        }
        function getDeclarationDiagnostics(sourceFile, cancellationToken) {
            var options = program.getCompilerOptions();
            // collect diagnostics from the program only once if either no source file was specified or out/outFile is set (bundled emit)
            if (!sourceFile || options.out || options.outFile) {
                return getDeclarationDiagnosticsWorker(sourceFile, cancellationToken);
            }
            else {
                return getDiagnosticsHelper(sourceFile, getDeclarationDiagnosticsForFile, cancellationToken);
            }
        }
        function getSyntacticDiagnosticsForFile(sourceFile, cancellationToken) {
            return sourceFile.parseDiagnostics;
        }
        function runWithCancellationToken(func) {
            try {
                return func();
            }
            catch (e) {
                if (e instanceof ts.OperationCanceledException) {
                    // We were canceled while performing the operation.  Because our type checker
                    // might be a bad state, we need to throw it away.
                    //
                    // Note: we are overly aggressive here.  We do not actually *have* to throw away
                    // the "noDiagnosticsTypeChecker".  However, for simplicity, i'd like to keep
                    // the lifetimes of these two TypeCheckers the same.  Also, we generally only
                    // cancel when the user has made a change anyways.  And, in that case, we (the
                    // program instance) will get thrown away anyways.  So trying to keep one of
                    // these type checkers alive doesn't serve much purpose.
                    noDiagnosticsTypeChecker = undefined;
                    diagnosticsProducingTypeChecker = undefined;
                }
                throw e;
            }
        }
        function getSemanticDiagnosticsForFile(sourceFile, cancellationToken) {
            return runWithCancellationToken(function () {
                var typeChecker = getDiagnosticsProducingTypeChecker();
                ts.Debug.assert(!!sourceFile.bindDiagnostics);
                var bindDiagnostics = sourceFile.bindDiagnostics;
                // For JavaScript files, we don't want to report the normal typescript semantic errors.
                // Instead, we just report errors for using TypeScript-only constructs from within a
                // JavaScript file.
                var checkDiagnostics = ts.isSourceFileJavaScript(sourceFile) ?
                    getJavaScriptSemanticDiagnosticsForFile(sourceFile, cancellationToken) :
                    typeChecker.getDiagnostics(sourceFile, cancellationToken);
                var fileProcessingDiagnosticsInFile = fileProcessingDiagnostics.getDiagnostics(sourceFile.fileName);
                var programDiagnosticsInFile = programDiagnostics.getDiagnostics(sourceFile.fileName);
                return bindDiagnostics.concat(checkDiagnostics).concat(fileProcessingDiagnosticsInFile).concat(programDiagnosticsInFile);
            });
        }
        function getJavaScriptSemanticDiagnosticsForFile(sourceFile, cancellationToken) {
            return runWithCancellationToken(function () {
                var diagnostics = [];
                walk(sourceFile);
                return diagnostics;
                function walk(node) {
                    if (!node) {
                        return false;
                    }
                    switch (node.kind) {
                        case 375 /* ImportEqualsDeclaration */:
                            diagnostics.push(ts.createDiagnosticForNode(node, ts.Diagnostics.import_can_only_be_used_in_a_ts_file));
                            return true;
                        case 381 /* ExportAssignment */:
                            if (node.isExportEquals) {
                                diagnostics.push(ts.createDiagnosticForNode(node, ts.Diagnostics.export_can_only_be_used_in_a_ts_file));
                                return true;
                            }
                            break;
                        case 367 /* ClassDeclaration */:
                            var classDeclaration = node;
                            if (checkModifiers(classDeclaration.modifiers) ||
                                checkTypeParameters(classDeclaration.typeParameters)) {
                                return true;
                            }
                            break;
                        case 397 /* HeritageClause */:
                            var heritageClause = node;
                            if (heritageClause.token === 132 /* implements */) {
                                diagnostics.push(ts.createDiagnosticForNode(node, ts.Diagnostics.implements_clauses_can_only_be_used_in_a_ts_file));
                                return true;
                            }
                            break;
                        case 368 /* InterfaceDeclaration */:
                            diagnostics.push(ts.createDiagnosticForNode(node, ts.Diagnostics.interface_declarations_can_only_be_used_in_a_ts_file));
                            return true;
                        case 371 /* ModuleDeclaration */:
                            diagnostics.push(ts.createDiagnosticForNode(node, ts.Diagnostics.module_declarations_can_only_be_used_in_a_ts_file));
                            return true;
                        case 369 /* TypeAliasDeclaration */:
                            diagnostics.push(ts.createDiagnosticForNode(node, ts.Diagnostics.type_aliases_can_only_be_used_in_a_ts_file));
                            return true;
                        case 293 /* MethodDeclaration */:
                        case 292 /* MethodSignature */:
                        case 294 /* Constructor */:
                        case 295 /* GetAccessor */:
                        case 296 /* SetAccessor */:
                        case 325 /* FunctionExpression */:
                        case 366 /* FunctionDeclaration */:
                        case 326 /* ArrowFunction */:
                        case 366 /* FunctionDeclaration */:
                            var functionDeclaration = node;
                            if (checkModifiers(functionDeclaration.modifiers) ||
                                checkTypeParameters(functionDeclaration.typeParameters) ||
                                checkTypeAnnotation(functionDeclaration.type)) {
                                return true;
                            }
                            break;
                        case 346 /* VariableStatement */:
                            var variableStatement = node;
                            if (checkModifiers(variableStatement.modifiers)) {
                                return true;
                            }
                            break;
                        case 364 /* VariableDeclaration */:
                            var variableDeclaration = node;
                            if (checkTypeAnnotation(variableDeclaration.type)) {
                                return true;
                            }
                            break;
                        case 320 /* CallExpression */:
                        case 321 /* NewExpression */:
                            var expression = node;
                            if (expression.typeArguments && expression.typeArguments.length > 0) {
                                var start_1 = expression.typeArguments.pos;
                                diagnostics.push(ts.createFileDiagnostic(sourceFile, start_1, expression.typeArguments.end - start_1, ts.Diagnostics.type_arguments_can_only_be_used_in_a_ts_file));
                                return true;
                            }
                            break;
                        case 288 /* Parameter */:
                            var parameter = node;
                            if (parameter.modifiers) {
                                var start_2 = parameter.modifiers.pos;
                                diagnostics.push(ts.createFileDiagnostic(sourceFile, start_2, parameter.modifiers.end - start_2, ts.Diagnostics.parameter_modifiers_can_only_be_used_in_a_ts_file));
                                return true;
                            }
                            if (parameter.questionToken) {
                                diagnostics.push(ts.createDiagnosticForNode(parameter.questionToken, ts.Diagnostics._0_can_only_be_used_in_a_ts_file, "?"));
                                return true;
                            }
                            if (parameter.type) {
                                diagnostics.push(ts.createDiagnosticForNode(parameter.type, ts.Diagnostics.types_can_only_be_used_in_a_ts_file));
                                return true;
                            }
                            break;
                        case 291 /* PropertyDeclaration */:
                            var propertyDeclaration = node;
                            if (propertyDeclaration.modifiers) {
                                for (var _i = 0, _a = propertyDeclaration.modifiers; _i < _a.length; _i++) {
                                    var modifier = _a[_i];
                                    if (modifier.kind !== 9 /* static */) {
                                        diagnostics.push(ts.createDiagnosticForNode(modifier, ts.Diagnostics._0_can_only_be_used_in_a_ts_file, ts.tokenToString(modifier.kind)));
                                        return true;
                                    }
                                }
                            }
                            if (checkTypeAnnotation(node.type)) {
                                return true;
                            }
                            break;
                        case 370 /* EnumDeclaration */:
                            diagnostics.push(ts.createDiagnosticForNode(node, ts.Diagnostics.enum_declarations_can_only_be_used_in_a_ts_file));
                            return true;
                        case 323 /* TypeAssertionExpression */:
                            var typeAssertionExpression = node;
                            diagnostics.push(ts.createDiagnosticForNode(typeAssertionExpression.type, ts.Diagnostics.type_assertion_expressions_can_only_be_used_in_a_ts_file));
                            return true;
                        case 289 /* Decorator */:
                            if (!options.experimentalDecorators) {
                                diagnostics.push(ts.createDiagnosticForNode(node, ts.Diagnostics.Experimental_support_for_decorators_is_a_feature_that_is_subject_to_change_in_a_future_release_Set_the_experimentalDecorators_option_to_remove_this_warning));
                            }
                            return true;
                    }
                    return ts.forEachChild(node, walk);
                }
                function checkTypeParameters(typeParameters) {
                    if (typeParameters) {
                        var start_3 = typeParameters.pos;
                        diagnostics.push(ts.createFileDiagnostic(sourceFile, start_3, typeParameters.end - start_3, ts.Diagnostics.type_parameter_declarations_can_only_be_used_in_a_ts_file));
                        return true;
                    }
                    return false;
                }
                function checkTypeAnnotation(type) {
                    if (type) {
                        diagnostics.push(ts.createDiagnosticForNode(type, ts.Diagnostics.types_can_only_be_used_in_a_ts_file));
                        return true;
                    }
                    return false;
                }
                function checkModifiers(modifiers) {
                    if (modifiers) {
                        for (var _i = 0, modifiers_1 = modifiers; _i < modifiers_1.length; _i++) {
                            var modifier = modifiers_1[_i];
                            switch (modifier.kind) {
                                case 8 /* public */:
                                case 6 /* private */:
                                case 7 /* protected */:
                                case 12 /* readonly */:
                                case 11 /* declare */:
                                    diagnostics.push(ts.createDiagnosticForNode(modifier, ts.Diagnostics._0_can_only_be_used_in_a_ts_file, ts.tokenToString(modifier.kind)));
                                    return true;
                                // These are all legal modifiers.
                                case 9 /* static */:
                                case 4 /* export */:
                                case 115 /* const */:
                                case 127 /* default */:
                                case 10 /* abstract */:
                            }
                        }
                    }
                    return false;
                }
            });
        }
        function getDeclarationDiagnosticsWorker(sourceFile, cancellationToken) {
            return runWithCancellationToken(function () {
                var resolver = getDiagnosticsProducingTypeChecker().getEmitResolver(sourceFile, cancellationToken);
                // Don't actually write any files since we're just getting diagnostics.
                var writeFile = function () { };
                return ts.getDeclarationDiagnostics(getEmitHost(writeFile), resolver, sourceFile);
            });
        }
        function getDeclarationDiagnosticsForFile(sourceFile, cancellationToken) {
            return ts.isDeclarationFile(sourceFile) ? [] : getDeclarationDiagnosticsWorker(sourceFile, cancellationToken);
        }
        function getOptionsDiagnostics() {
            var allDiagnostics = [];
            ts.addRange(allDiagnostics, fileProcessingDiagnostics.getGlobalDiagnostics());
            ts.addRange(allDiagnostics, programDiagnostics.getGlobalDiagnostics());
            return ts.sortAndDeduplicateDiagnostics(allDiagnostics);
        }
        function getGlobalDiagnostics() {
            var allDiagnostics = [];
            ts.addRange(allDiagnostics, getDiagnosticsProducingTypeChecker().getGlobalDiagnostics());
            return ts.sortAndDeduplicateDiagnostics(allDiagnostics);
        }
        function hasExtension(fileName) {
            return ts.getBaseFileName(fileName).indexOf(".") >= 0;
        }
        function processRootFile(fileName, isDefaultLib) {
            processSourceFile(ts.normalizePath(fileName), isDefaultLib, /*isReference*/ true);
        }
        function fileReferenceIsEqualTo(a, b) {
            return a.fileName === b.fileName;
        }
        function moduleNameIsEqualTo(a, b) {
            return a.text === b.text;
        }
        function getTextOfLiteral(literal) {
            return literal.text;
        }
        function collectExternalModuleReferences(file) {
            if (file.imports) {
                return;
            }
            var isJavaScriptFile = ts.isSourceFileJavaScript(file);
            var isExternalModuleFile = ts.isExternalModule(file);
            var imports;
            var moduleAugmentations;
            for (var _i = 0, _a = file.statements; _i < _a.length; _i++) {
                var node = _a[_i];
                collectModuleReferences(node, /*inAmbientModule*/ false);
                if (isJavaScriptFile) {
                    collectRequireCalls(node);
                }
            }
            file.imports = imports || emptyArray;
            file.moduleAugmentations = moduleAugmentations || emptyArray;
            return;
            function collectModuleReferences(node, inAmbientModule) {
                switch (node.kind) {
                    case 376 /* ImportDeclaration */:
                    case 375 /* ImportEqualsDeclaration */:
                    case 382 /* ExportDeclaration */:
                        var moduleNameExpr = ts.getExternalModuleName(node);
                        if (!moduleNameExpr || moduleNameExpr.kind !== 155 /* StringLiteral */) {
                            break;
                        }
                        if (!moduleNameExpr.text) {
                            break;
                        }
                        // TypeScript 1.0 spec (April 2014): 12.1.6
                        // An ExternalImportDeclaration in an AmbientExternalModuleDeclaration may reference other external modules
                        // only through top - level external module names. Relative external module names are not permitted.
                        if (!inAmbientModule || !ts.isExternalModuleNameRelative(moduleNameExpr.text)) {
                            (imports || (imports = [])).push(moduleNameExpr);
                        }
                        break;
                    case 371 /* ModuleDeclaration */:
                        if (ts.isAmbientModule(node) && (inAmbientModule || node.flags & 2 /* Ambient */ || ts.isDeclarationFile(file))) {
                            var moduleName = node.name;
                            // Ambient module declarations can be interpreted as augmentations for some existing external modules.
                            // This will happen in two cases:
                            // - if current file is external module then module augmentation is a ambient module declaration defined in the top level scope
                            // - if current file is not external module then module augmentation is an ambient module declaration with non-relative module name
                            //   immediately nested in top level ambient module declaration .
                            if (isExternalModuleFile || (inAmbientModule && !ts.isExternalModuleNameRelative(moduleName.text))) {
                                (moduleAugmentations || (moduleAugmentations = [])).push(moduleName);
                            }
                            else if (!inAmbientModule) {
                                // An AmbientExternalModuleDeclaration declares an external module.
                                // This type of declaration is permitted only in the global module.
                                // The StringLiteral must specify a top - level external module name.
                                // Relative external module names are not permitted
                                // NOTE: body of ambient module is always a module block, if it exists
                                var body = node.body;
                                if (body) {
                                    for (var _i = 0, _a = body.statements; _i < _a.length; _i++) {
                                        var statement = _a[_i];
                                        collectModuleReferences(statement, /*inAmbientModule*/ true);
                                    }
                                }
                            }
                        }
                }
            }
            function collectRequireCalls(node) {
                if (ts.isRequireCall(node, /*checkArgumentIsStringLiteral*/ true)) {
                    (imports || (imports = [])).push(node.arguments[0]);
                }
                else {
                    ts.forEachChild(node, collectRequireCalls);
                }
            }
        }
        /**
          * 'isReference' indicates whether the file was brought in via a reference directive (rather than an import declaration)
          */
        function processSourceFile(fileName, isDefaultLib, isReference, refFile, refPos, refEnd) {
            var diagnosticArgument;
            var diagnostic;
            if (hasExtension(fileName)) {
                if (!options.allowNonTsExtensions && !ts.forEach(supportedExtensions, function (extension) { return ts.fileExtensionIs(host.getCanonicalFileName(fileName), extension); })) {
                    diagnostic = ts.Diagnostics.File_0_has_unsupported_extension_The_only_supported_extensions_are_1;
                    diagnosticArgument = [fileName, "'" + supportedExtensions.join("', '") + "'"];
                }
                else if (!findSourceFile(fileName, ts.toPath(fileName, currentDirectory, getCanonicalFileName), isDefaultLib, isReference, refFile, refPos, refEnd)) {
                    diagnostic = ts.Diagnostics.File_0_not_found;
                    diagnosticArgument = [fileName];
                }
                else if (refFile && host.getCanonicalFileName(fileName) === host.getCanonicalFileName(refFile.fileName)) {
                    diagnostic = ts.Diagnostics.A_file_cannot_have_a_reference_to_itself;
                    diagnosticArgument = [fileName];
                }
            }
            else {
                var nonTsFile = options.allowNonTsExtensions && findSourceFile(fileName, ts.toPath(fileName, currentDirectory, getCanonicalFileName), isDefaultLib, isReference, refFile, refPos, refEnd);
                if (!nonTsFile) {
                    if (options.allowNonTsExtensions) {
                        diagnostic = ts.Diagnostics.File_0_not_found;
                        diagnosticArgument = [fileName];
                    }
                    else if (!ts.forEach(supportedExtensions, function (extension) { return findSourceFile(fileName + extension, ts.toPath(fileName + extension, currentDirectory, getCanonicalFileName), isDefaultLib, isReference, refFile, refPos, refEnd); })) {
                        diagnostic = ts.Diagnostics.File_0_not_found;
                        fileName += ".ts";
                        diagnosticArgument = [fileName];
                    }
                }
            }
            if (diagnostic) {
                if (refFile !== undefined && refEnd !== undefined && refPos !== undefined) {
                    fileProcessingDiagnostics.add(ts.createFileDiagnostic.apply(void 0, [refFile, refPos, refEnd - refPos, diagnostic].concat(diagnosticArgument)));
                }
                else {
                    fileProcessingDiagnostics.add(ts.createCompilerDiagnostic.apply(void 0, [diagnostic].concat(diagnosticArgument)));
                }
            }
        }
        function reportFileNamesDifferOnlyInCasingError(fileName, existingFileName, refFile, refPos, refEnd) {
            if (refFile !== undefined && refPos !== undefined && refEnd !== undefined) {
                fileProcessingDiagnostics.add(ts.createFileDiagnostic(refFile, refPos, refEnd - refPos, ts.Diagnostics.File_name_0_differs_from_already_included_file_name_1_only_in_casing, fileName, existingFileName));
            }
            else {
                fileProcessingDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.File_name_0_differs_from_already_included_file_name_1_only_in_casing, fileName, existingFileName));
            }
        }
        // Get source file from normalized fileName
        function findSourceFile(fileName, path, isDefaultLib, isReference, refFile, refPos, refEnd) {
            if (filesByName.contains(path)) {
                var file_1 = filesByName.get(path);
                // try to check if we've already seen this file but with a different casing in path
                // NOTE: this only makes sense for case-insensitive file systems
                if (file_1 && options.forceConsistentCasingInFileNames && ts.getNormalizedAbsolutePath(file_1.fileName, currentDirectory) !== ts.getNormalizedAbsolutePath(fileName, currentDirectory)) {
                    reportFileNamesDifferOnlyInCasingError(fileName, file_1.fileName, refFile, refPos, refEnd);
                }
                // See if we need to reprocess the imports due to prior skipped imports
                if (file_1 && ts.lookUp(modulesWithElidedImports, file_1.path)) {
                    if (currentNodeModulesJsDepth < maxNodeModulesJsDepth) {
                        modulesWithElidedImports[file_1.path] = false;
                        processImportedModules(file_1, ts.getDirectoryPath(fileName));
                    }
                }
                return file_1;
            }
            // We haven't looked for this file, do so now and cache result
            var file = host.getSourceFile(fileName, options.target, function (hostErrorMessage) {
                if (refFile !== undefined && refPos !== undefined && refEnd !== undefined) {
                    fileProcessingDiagnostics.add(ts.createFileDiagnostic(refFile, refPos, refEnd - refPos, ts.Diagnostics.Cannot_read_file_0_Colon_1, fileName, hostErrorMessage));
                }
                else {
                    fileProcessingDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Cannot_read_file_0_Colon_1, fileName, hostErrorMessage));
                }
            });
            filesByName.set(path, file);
            if (file) {
                file.path = path;
                if (host.useCaseSensitiveFileNames()) {
                    // for case-sensitive file systems check if we've already seen some file with similar filename ignoring case
                    var existingFile = filesByNameIgnoreCase.get(path);
                    if (existingFile) {
                        reportFileNamesDifferOnlyInCasingError(fileName, existingFile.fileName, refFile, refPos, refEnd);
                    }
                    else {
                        filesByNameIgnoreCase.set(path, file);
                    }
                }
                skipDefaultLib = skipDefaultLib || file.hasNoDefaultLib;
                var basePath = ts.getDirectoryPath(fileName);
                if (!options.noResolve) {
                    processReferencedFiles(file, basePath, isDefaultLib);
                    processTypeReferenceDirectives(file);
                }
                // always process imported modules to record module name resolutions
                processImportedModules(file, basePath);
                if (isDefaultLib) {
                    files.unshift(file);
                }
                else {
                    files.push(file);
                }
            }
            return file;
        }
        function processReferencedFiles(file, basePath, isDefaultLib) {
            ts.forEach(file.referencedFiles, function (ref) {
                var referencedFileName = resolveTripleslashReference(ref.fileName, file.fileName);
                processSourceFile(referencedFileName, isDefaultLib, /*isReference*/ true, file, ref.pos, ref.end);
            });
        }
        function processTypeReferenceDirectives(file) {
            var typeDirectives = ts.map(file.typeReferenceDirectives, function (l) { return l.fileName; });
            var resolutions = resolveTypeReferenceDirectiveNamesWorker(typeDirectives, file.fileName);
            for (var i = 0; i < typeDirectives.length; i++) {
                var ref = file.typeReferenceDirectives[i];
                var resolvedTypeReferenceDirective = resolutions[i];
                // store resolved type directive on the file
                ts.setResolvedTypeReferenceDirective(file, ref.fileName, resolvedTypeReferenceDirective);
                processTypeReferenceDirective(ref.fileName, resolvedTypeReferenceDirective, file, ref.pos, ref.end);
            }
        }
        function processTypeReferenceDirective(typeReferenceDirective, resolvedTypeReferenceDirective, refFile, refPos, refEnd) {
            // If we already found this library as a primary reference - nothing to do
            var previousResolution = resolvedTypeReferenceDirectives[typeReferenceDirective];
            if (previousResolution && previousResolution.primary) {
                return;
            }
            var saveResolution = true;
            if (resolvedTypeReferenceDirective) {
                if (resolvedTypeReferenceDirective.primary) {
                    // resolved from the primary path
                    processSourceFile(resolvedTypeReferenceDirective.resolvedFileName, /*isDefaultLib*/ false, /*isReference*/ true, refFile, refPos, refEnd);
                }
                else {
                    // If we already resolved to this file, it must have been a secondary reference. Check file contents
                    // for sameness and possibly issue an error
                    if (previousResolution) {
                        var otherFileText = host.readFile(resolvedTypeReferenceDirective.resolvedFileName);
                        if (otherFileText !== getSourceFile(previousResolution.resolvedFileName).text) {
                            fileProcessingDiagnostics.add(createDiagnostic(refFile, refPos, refEnd, ts.Diagnostics.Conflicting_library_definitions_for_0_found_at_1_and_2_Copy_the_correct_file_to_the_typings_folder_to_resolve_this_conflict, typeReferenceDirective, resolvedTypeReferenceDirective.resolvedFileName, previousResolution.resolvedFileName));
                        }
                        // don't overwrite previous resolution result
                        saveResolution = false;
                    }
                    else {
                        // First resolution of this library
                        processSourceFile(resolvedTypeReferenceDirective.resolvedFileName, /*isDefaultLib*/ false, /*isReference*/ true, refFile, refPos, refEnd);
                    }
                }
            }
            else {
                fileProcessingDiagnostics.add(createDiagnostic(refFile, refPos, refEnd, ts.Diagnostics.Cannot_find_type_definition_file_for_0, typeReferenceDirective));
            }
            if (saveResolution) {
                resolvedTypeReferenceDirectives[typeReferenceDirective] = resolvedTypeReferenceDirective;
            }
        }
        function createDiagnostic(refFile, refPos, refEnd, message) {
            var args = [];
            for (var _i = 4; _i < arguments.length; _i++) {
                args[_i - 4] = arguments[_i];
            }
            if (refFile === undefined || refPos === undefined || refEnd === undefined) {
                return ts.createCompilerDiagnostic.apply(void 0, [message].concat(args));
            }
            else {
                return ts.createFileDiagnostic.apply(void 0, [refFile, refPos, refEnd - refPos, message].concat(args));
            }
        }
        function getCanonicalFileName(fileName) {
            return host.getCanonicalFileName(fileName);
        }
        function processImportedModules(file, basePath) {
            collectExternalModuleReferences(file);
            if (file.imports.length || file.moduleAugmentations.length) {
                file.resolvedModules = {};
                var moduleNames = ts.map(ts.concatenate(file.imports, file.moduleAugmentations), getTextOfLiteral);
                var resolutions = resolveModuleNamesWorker(moduleNames, ts.getNormalizedAbsolutePath(file.fileName, currentDirectory));
                for (var i = 0; i < moduleNames.length; i++) {
                    var resolution = resolutions[i];
                    ts.setResolvedModule(file, moduleNames[i], resolution);
                    var resolvedPath = resolution ? ts.toPath(resolution.resolvedFileName, currentDirectory, getCanonicalFileName) : undefined;
                    // add file to program only if:
                    // - resolution was successful
                    // - noResolve is falsy
                    // - module name comes from the list of imports
                    // - it's not a top level JavaScript module that exceeded the search max
                    var isFromNodeModulesSearch = resolution && resolution.isExternalLibraryImport;
                    var isJsFileFromNodeModules = isFromNodeModulesSearch && ts.hasJavaScriptFileExtension(resolution.resolvedFileName);
                    if (isFromNodeModulesSearch) {
                        sourceFilesFoundSearchingNodeModules[resolvedPath] = true;
                    }
                    if (isJsFileFromNodeModules) {
                        currentNodeModulesJsDepth++;
                    }
                    var elideImport = isJsFileFromNodeModules && currentNodeModulesJsDepth > maxNodeModulesJsDepth;
                    var shouldAddFile = resolution && !options.noResolve && i < file.imports.length && !elideImport;
                    if (elideImport) {
                        modulesWithElidedImports[file.path] = true;
                    }
                    else if (shouldAddFile) {
                        findSourceFile(resolution.resolvedFileName, resolvedPath, 
                        /*isDefaultLib*/ false, /*isReference*/ false, file, ts.skipTrivia(file.text, file.imports[i].pos), file.imports[i].end);
                    }
                    if (isJsFileFromNodeModules) {
                        currentNodeModulesJsDepth--;
                    }
                }
            }
            else {
                // no imports - drop cached module resolutions
                file.resolvedModules = undefined;
            }
            return;
        }
        function computeCommonSourceDirectory(sourceFiles) {
            var fileNames = [];
            for (var _i = 0, sourceFiles_1 = sourceFiles; _i < sourceFiles_1.length; _i++) {
                var file = sourceFiles_1[_i];
                if (!file.isDeclarationFile) {
                    fileNames.push(file.fileName);
                }
            }
            return computeCommonSourceDirectoryOfFilenames(fileNames, currentDirectory, getCanonicalFileName);
        }
        function checkSourceFilesBelongToPath(sourceFiles, rootDirectory) {
            var allFilesBelongToPath = true;
            if (sourceFiles) {
                var absoluteRootDirectoryPath = host.getCanonicalFileName(ts.getNormalizedAbsolutePath(rootDirectory, currentDirectory));
                for (var _i = 0, sourceFiles_2 = sourceFiles; _i < sourceFiles_2.length; _i++) {
                    var sourceFile = sourceFiles_2[_i];
                    if (!ts.isDeclarationFile(sourceFile)) {
                        var absoluteSourceFilePath = host.getCanonicalFileName(ts.getNormalizedAbsolutePath(sourceFile.fileName, currentDirectory));
                        if (absoluteSourceFilePath.indexOf(absoluteRootDirectoryPath) !== 0) {
                            programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.File_0_is_not_under_rootDir_1_rootDir_is_expected_to_contain_all_source_files, sourceFile.fileName, options.rootDir));
                            allFilesBelongToPath = false;
                        }
                    }
                }
            }
            return allFilesBelongToPath;
        }
        function verifyCompilerOptions() {
            if (options.isolatedModules) {
                if (options.declaration) {
                    programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Option_0_cannot_be_specified_with_option_1, "declaration", "isolatedModules"));
                }
                if (options.noEmitOnError) {
                    programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Option_0_cannot_be_specified_with_option_1, "noEmitOnError", "isolatedModules"));
                }
                if (options.out) {
                    programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Option_0_cannot_be_specified_with_option_1, "out", "isolatedModules"));
                }
                if (options.outFile) {
                    programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Option_0_cannot_be_specified_with_option_1, "outFile", "isolatedModules"));
                }
            }
            if (options.inlineSourceMap) {
                if (options.sourceMap) {
                    programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Option_0_cannot_be_specified_with_option_1, "sourceMap", "inlineSourceMap"));
                }
                if (options.mapRoot) {
                    programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Option_0_cannot_be_specified_with_option_1, "mapRoot", "inlineSourceMap"));
                }
            }
            if (options.paths && options.baseUrl === undefined) {
                programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Option_paths_cannot_be_used_without_specifying_baseUrl_option));
            }
            if (options.paths) {
                for (var key in options.paths) {
                    if (!ts.hasProperty(options.paths, key)) {
                        continue;
                    }
                    if (!hasZeroOrOneAsteriskCharacter(key)) {
                        programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Pattern_0_can_have_at_most_one_Asterisk_character, key));
                    }
                    if (ts.isArray(options.paths[key])) {
                        for (var _i = 0, _a = options.paths[key]; _i < _a.length; _i++) {
                            var subst = _a[_i];
                            var typeOfSubst = typeof subst;
                            if (typeOfSubst === "string") {
                                if (!hasZeroOrOneAsteriskCharacter(subst)) {
                                    programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Substitution_0_in_pattern_1_in_can_have_at_most_one_Asterisk_character, subst, key));
                                }
                            }
                            else {
                                programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Substitution_0_for_pattern_1_has_incorrect_type_expected_string_got_2, subst, key, typeOfSubst));
                            }
                        }
                    }
                    else {
                        programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Substitutions_for_pattern_0_should_be_an_array, key));
                    }
                }
            }
            if (!options.sourceMap && !options.inlineSourceMap) {
                if (options.inlineSources) {
                    programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Option_0_can_only_be_used_when_either_option_inlineSourceMap_or_option_sourceMap_is_provided, "inlineSources"));
                }
                if (options.sourceRoot) {
                    programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Option_0_can_only_be_used_when_either_option_inlineSourceMap_or_option_sourceMap_is_provided, "sourceRoot"));
                }
            }
            if (options.out && options.outFile) {
                programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Option_0_cannot_be_specified_with_option_1, "out", "outFile"));
            }
            if (options.mapRoot && !options.sourceMap) {
                // Error to specify --mapRoot without --sourcemap
                programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Option_0_cannot_be_specified_without_specifying_option_1, "mapRoot", "sourceMap"));
            }
            if (options.declarationDir) {
                if (!options.declaration) {
                    programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Option_0_cannot_be_specified_without_specifying_option_1, "declarationDir", "declaration"));
                }
                if (options.out || options.outFile) {
                    programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Option_0_cannot_be_specified_with_option_1, "declarationDir", options.out ? "out" : "outFile"));
                }
            }
            if (options.lib && options.noLib) {
                programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Option_0_cannot_be_specified_with_option_1, "lib", "noLib"));
            }
            var languageVersion = options.target || 0 /* ES3 */;
            var outFile = options.outFile || options.out;
            var firstExternalModuleSourceFile = ts.forEach(files, function (f) { return ts.isExternalModule(f) ? f : undefined; });
            if (options.isolatedModules) {
                if (options.module === ts.ModuleKind.None && languageVersion < 2 /* ES6 */) {
                    programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Option_isolatedModules_can_only_be_used_when_either_option_module_is_provided_or_option_target_is_ES2015_or_higher));
                }
                var firstNonExternalModuleSourceFile = ts.forEach(files, function (f) { return !ts.isExternalModule(f) && !ts.isDeclarationFile(f) ? f : undefined; });
                if (firstNonExternalModuleSourceFile) {
                    var span = ts.getErrorSpanForNode(firstNonExternalModuleSourceFile, firstNonExternalModuleSourceFile);
                    programDiagnostics.add(ts.createFileDiagnostic(firstNonExternalModuleSourceFile, span.start, span.length, ts.Diagnostics.Cannot_compile_namespaces_when_the_isolatedModules_flag_is_provided));
                }
            }
            else if (firstExternalModuleSourceFile && languageVersion < 2 /* ES6 */ && options.module === ts.ModuleKind.None) {
                // We cannot use createDiagnosticFromNode because nodes do not have parents yet
                var span = ts.getErrorSpanForNode(firstExternalModuleSourceFile, firstExternalModuleSourceFile.externalModuleIndicator);
                programDiagnostics.add(ts.createFileDiagnostic(firstExternalModuleSourceFile, span.start, span.length, ts.Diagnostics.Cannot_use_imports_exports_or_module_augmentations_when_module_is_none));
            }
            // Cannot specify module gen that isn't amd or system with --out
            if (outFile) {
                if (options.module && !(options.module === ts.ModuleKind.AMD || options.module === ts.ModuleKind.System)) {
                    programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Only_amd_and_system_modules_are_supported_alongside_0, options.out ? "out" : "outFile"));
                }
                else if (options.module === undefined && firstExternalModuleSourceFile) {
                    var span = ts.getErrorSpanForNode(firstExternalModuleSourceFile, firstExternalModuleSourceFile.externalModuleIndicator);
                    programDiagnostics.add(ts.createFileDiagnostic(firstExternalModuleSourceFile, span.start, span.length, ts.Diagnostics.Cannot_compile_modules_using_option_0_unless_the_module_flag_is_amd_or_system, options.out ? "out" : "outFile"));
                }
            }
            // there has to be common source directory if user specified --outdir || --sourceRoot
            // if user specified --mapRoot, there needs to be common source directory if there would be multiple files being emitted
            if (options.outDir ||
                options.sourceRoot ||
                options.mapRoot) {
                // Precalculate and cache the common source directory
                var dir = getCommonSourceDirectory();
                // If we failed to find a good common directory, but outDir is specified and at least one of our files is on a windows drive/URL/other resource, add a failure
                if (options.outDir && dir === "" && ts.forEach(files, function (file) { return ts.getRootLength(file.fileName) > 1; })) {
                    programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Cannot_find_the_common_subdirectory_path_for_the_input_files));
                }
            }
            if (!options.noEmit && options.allowJs && options.declaration) {
                programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Option_0_cannot_be_specified_with_option_1, "allowJs", "declaration"));
            }
            if (options.emitDecoratorMetadata &&
                !options.experimentalDecorators) {
                programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Option_0_cannot_be_specified_without_specifying_option_1, "emitDecoratorMetadata", "experimentalDecorators"));
            }
            if (options.reactNamespace && !ts.isIdentifier(options.reactNamespace, languageVersion)) {
                programDiagnostics.add(ts.createCompilerDiagnostic(ts.Diagnostics.Invalid_value_for_reactNamespace_0_is_not_a_valid_identifier, options.reactNamespace));
            }
            // If the emit is enabled make sure that every output file is unique and not overwriting any of the input files
            if (!options.noEmit && !options.suppressOutputPathCheck) {
                var emitHost = getEmitHost();
                var emitFilesSeen_1 = ts.createFileMap(!host.useCaseSensitiveFileNames() ? function (key) { return key.toLocaleLowerCase(); } : undefined);
                ts.forEachExpectedEmitFile(emitHost, function (emitFileNames, sourceFiles, isBundledEmit) {
                    verifyEmitFilePath(emitFileNames.jsFilePath, emitFilesSeen_1);
                    verifyEmitFilePath(emitFileNames.declarationFilePath, emitFilesSeen_1);
                });
            }
            // Verify that all the emit files are unique and don't overwrite input files
            function verifyEmitFilePath(emitFileName, emitFilesSeen) {
                if (emitFileName) {
                    var emitFilePath = ts.toPath(emitFileName, currentDirectory, getCanonicalFileName);
                    // Report error if the output overwrites input file
                    if (filesByName.contains(emitFilePath)) {
                        createEmitBlockingDiagnostics(emitFileName, emitFilePath, ts.Diagnostics.Cannot_write_file_0_because_it_would_overwrite_input_file);
                    }
                    // Report error if multiple files write into same file
                    if (emitFilesSeen.contains(emitFilePath)) {
                        // Already seen the same emit file - report error
                        createEmitBlockingDiagnostics(emitFileName, emitFilePath, ts.Diagnostics.Cannot_write_file_0_because_it_would_be_overwritten_by_multiple_input_files);
                    }
                    else {
                        emitFilesSeen.set(emitFilePath, true);
                    }
                }
            }
        }
        function createEmitBlockingDiagnostics(emitFileName, emitFilePath, message) {
            hasEmitBlockingDiagnostics.set(ts.toPath(emitFileName, currentDirectory, getCanonicalFileName), true);
            programDiagnostics.add(ts.createCompilerDiagnostic(message, emitFileName));
        }
    }
    ts.createProgram = createProgram;
})(ts || (ts = {}));
//# sourceMappingURL=program.js.map