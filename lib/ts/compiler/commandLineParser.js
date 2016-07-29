/// <reference path="sys.ts"/>
/// <reference path="types.ts"/>
/// <reference path="core.ts"/>
/// <reference path="diagnosticInformationMap.generated.ts"/>
/// <reference path="scanner.ts"/>
var ts;
(function (ts) {
    /* @internal */
    ts.optionDeclarations = [
        {
            name: "charset",
            type: "string",
        },
        {
            name: "declaration",
            shortName: "d",
            type: "boolean",
            description: ts.Diagnostics.Generates_corresponding_d_ts_file,
        },
        {
            name: "declarationDir",
            type: "string",
            isFilePath: true,
            paramType: ts.Diagnostics.DIRECTORY,
        },
        {
            name: "diagnostics",
            type: "boolean",
        },
        {
            name: "emitBOM",
            type: "boolean"
        },
        {
            name: "help",
            shortName: "h",
            type: "boolean",
            description: ts.Diagnostics.Print_this_message,
        },
        {
            name: "help",
            shortName: "?",
            type: "boolean"
        },
        {
            name: "init",
            type: "boolean",
            description: ts.Diagnostics.Initializes_a_TypeScript_project_and_creates_a_tsconfig_json_file,
        },
        {
            name: "inlineSourceMap",
            type: "boolean",
        },
        {
            name: "inlineSources",
            type: "boolean",
        },
        {
            name: "jsx",
            type: {
                "preserve": 1 /* Preserve */,
                "react": 2 /* React */
            },
            paramType: ts.Diagnostics.KIND,
            description: ts.Diagnostics.Specify_JSX_code_generation_Colon_preserve_or_react,
        },
        {
            name: "reactNamespace",
            type: "string",
            description: ts.Diagnostics.Specify_the_object_invoked_for_createElement_and_spread_when_targeting_react_JSX_emit
        },
        {
            name: "listFiles",
            type: "boolean",
        },
        {
            name: "locale",
            type: "string",
        },
        {
            name: "mapRoot",
            type: "string",
            isFilePath: true,
            description: ts.Diagnostics.Specify_the_location_where_debugger_should_locate_map_files_instead_of_generated_locations,
            paramType: ts.Diagnostics.LOCATION,
        },
        {
            name: "module",
            shortName: "m",
            type: {
                "none": ts.ModuleKind.None,
                "commonjs": ts.ModuleKind.CommonJS,
                "amd": ts.ModuleKind.AMD,
                "system": ts.ModuleKind.System,
                "umd": ts.ModuleKind.UMD,
                "es6": ts.ModuleKind.ES6,
                "es2015": ts.ModuleKind.ES2015,
            },
            description: ts.Diagnostics.Specify_module_code_generation_Colon_commonjs_amd_system_umd_or_es2015,
            paramType: ts.Diagnostics.KIND,
        },
        {
            name: "newLine",
            type: {
                "crlf": 0 /* CarriageReturnLineFeed */,
                "lf": 1 /* LineFeed */
            },
            description: ts.Diagnostics.Specify_the_end_of_line_sequence_to_be_used_when_emitting_files_Colon_CRLF_dos_or_LF_unix,
            paramType: ts.Diagnostics.NEWLINE,
        },
        {
            name: "noEmit",
            type: "boolean",
            description: ts.Diagnostics.Do_not_emit_outputs,
        },
        {
            name: "noEmitHelpers",
            type: "boolean"
        },
        {
            name: "noEmitOnError",
            type: "boolean",
            description: ts.Diagnostics.Do_not_emit_outputs_if_any_errors_were_reported,
        },
        {
            name: "noImplicitAny",
            type: "boolean",
            description: ts.Diagnostics.Raise_error_on_expressions_and_declarations_with_an_implied_any_type,
        },
        {
            name: "noImplicitThis",
            type: "boolean",
            description: ts.Diagnostics.Raise_error_on_this_expressions_with_an_implied_any_type,
        },
        {
            name: "noUnusedLocals",
            type: "boolean",
            description: ts.Diagnostics.Report_Errors_on_Unused_Locals,
        },
        {
            name: "noUnusedParameters",
            type: "boolean",
            description: ts.Diagnostics.Report_Errors_on_Unused_Parameters
        },
        {
            name: "noLib",
            type: "boolean",
        },
        {
            name: "noResolve",
            type: "boolean",
        },
        {
            name: "skipDefaultLibCheck",
            type: "boolean",
        },
        {
            name: "skipLibCheck",
            type: "boolean",
            description: ts.Diagnostics.Skip_type_checking_of_declaration_files,
        },
        {
            name: "out",
            type: "string",
            isFilePath: false,
            // for correct behaviour, please use outFile
            paramType: ts.Diagnostics.FILE,
        },
        {
            name: "outFile",
            type: "string",
            isFilePath: true,
            description: ts.Diagnostics.Concatenate_and_emit_output_to_single_file,
            paramType: ts.Diagnostics.FILE,
        },
        {
            name: "outDir",
            type: "string",
            isFilePath: true,
            description: ts.Diagnostics.Redirect_output_structure_to_the_directory,
            paramType: ts.Diagnostics.DIRECTORY,
        },
        {
            name: "preserveConstEnums",
            type: "boolean",
            description: ts.Diagnostics.Do_not_erase_const_enum_declarations_in_generated_code
        },
        {
            name: "pretty",
            description: ts.Diagnostics.Stylize_errors_and_messages_using_color_and_context_experimental,
            type: "boolean"
        },
        {
            name: "project",
            shortName: "p",
            type: "string",
            isFilePath: true,
            description: ts.Diagnostics.Compile_the_project_in_the_given_directory,
            paramType: ts.Diagnostics.DIRECTORY
        },
        {
            name: "removeComments",
            type: "boolean",
            description: ts.Diagnostics.Do_not_emit_comments_to_output,
        },
        {
            name: "rootDir",
            type: "string",
            isFilePath: true,
            paramType: ts.Diagnostics.LOCATION,
            description: ts.Diagnostics.Specify_the_root_directory_of_input_files_Use_to_control_the_output_directory_structure_with_outDir,
        },
        {
            name: "isolatedModules",
            type: "boolean",
        },
        {
            name: "sourceMap",
            type: "boolean",
            description: ts.Diagnostics.Generates_corresponding_map_file,
        },
        {
            name: "sourceRoot",
            type: "string",
            isFilePath: true,
            description: ts.Diagnostics.Specify_the_location_where_debugger_should_locate_TypeScript_files_instead_of_source_locations,
            paramType: ts.Diagnostics.LOCATION,
        },
        {
            name: "suppressExcessPropertyErrors",
            type: "boolean",
            description: ts.Diagnostics.Suppress_excess_property_checks_for_object_literals,
            experimental: true
        },
        {
            name: "suppressImplicitAnyIndexErrors",
            type: "boolean",
            description: ts.Diagnostics.Suppress_noImplicitAny_errors_for_indexing_objects_lacking_index_signatures,
        },
        {
            name: "stripInternal",
            type: "boolean",
            description: ts.Diagnostics.Do_not_emit_declarations_for_code_that_has_an_internal_annotation,
            experimental: true
        },
        {
            name: "target",
            shortName: "t",
            type: {
                "es3": 0 /* ES3 */,
                "es5": 1 /* ES5 */,
                "es6": 2 /* ES6 */,
                "es2015": 2 /* ES2015 */,
            },
            description: ts.Diagnostics.Specify_ECMAScript_target_version_Colon_ES3_default_ES5_or_ES2015,
            paramType: ts.Diagnostics.VERSION,
        },
        {
            name: "version",
            shortName: "v",
            type: "boolean",
            description: ts.Diagnostics.Print_the_compiler_s_version,
        },
        {
            name: "watch",
            shortName: "w",
            type: "boolean",
            description: ts.Diagnostics.Watch_input_files,
        },
        {
            name: "experimentalDecorators",
            type: "boolean",
            description: ts.Diagnostics.Enables_experimental_support_for_ES7_decorators
        },
        {
            name: "emitDecoratorMetadata",
            type: "boolean",
            experimental: true,
            description: ts.Diagnostics.Enables_experimental_support_for_emitting_type_metadata_for_decorators
        },
        {
            name: "moduleResolution",
            type: {
                "node": ts.ModuleResolutionKind.NodeJs,
                "classic": ts.ModuleResolutionKind.Classic,
            },
            description: ts.Diagnostics.Specify_module_resolution_strategy_Colon_node_Node_js_or_classic_TypeScript_pre_1_6,
        },
        {
            name: "allowUnusedLabels",
            type: "boolean",
            description: ts.Diagnostics.Do_not_report_errors_on_unused_labels
        },
        {
            name: "noImplicitReturns",
            type: "boolean",
            description: ts.Diagnostics.Report_error_when_not_all_code_paths_in_function_return_a_value
        },
        {
            name: "noFallthroughCasesInSwitch",
            type: "boolean",
            description: ts.Diagnostics.Report_errors_for_fallthrough_cases_in_switch_statement
        },
        {
            name: "allowUnreachableCode",
            type: "boolean",
            description: ts.Diagnostics.Do_not_report_errors_on_unreachable_code
        },
        {
            name: "forceConsistentCasingInFileNames",
            type: "boolean",
            description: ts.Diagnostics.Disallow_inconsistently_cased_references_to_the_same_file
        },
        {
            name: "baseUrl",
            type: "string",
            isFilePath: true,
            description: ts.Diagnostics.Base_directory_to_resolve_non_absolute_module_names
        },
        {
            // this option can only be specified in tsconfig.json
            // use type = object to copy the value as-is
            name: "paths",
            type: "object",
            isTSConfigOnly: true
        },
        {
            // this option can only be specified in tsconfig.json
            // use type = object to copy the value as-is
            name: "rootDirs",
            type: "list",
            isTSConfigOnly: true,
            element: {
                name: "rootDirs",
                type: "string",
                isFilePath: true
            }
        },
        {
            name: "typeRoots",
            type: "list",
            element: {
                name: "typeRoots",
                type: "string",
                isFilePath: true
            }
        },
        {
            name: "types",
            type: "list",
            element: {
                name: "types",
                type: "string"
            },
            description: ts.Diagnostics.Type_declaration_files_to_be_included_in_compilation
        },
        {
            name: "traceResolution",
            type: "boolean",
            description: ts.Diagnostics.Enable_tracing_of_the_name_resolution_process
        },
        {
            name: "allowJs",
            type: "boolean",
            description: ts.Diagnostics.Allow_javascript_files_to_be_compiled
        },
        {
            name: "allowSyntheticDefaultImports",
            type: "boolean",
            description: ts.Diagnostics.Allow_default_imports_from_modules_with_no_default_export_This_does_not_affect_code_emit_just_typechecking
        },
        {
            name: "noImplicitUseStrict",
            type: "boolean",
            description: ts.Diagnostics.Do_not_emit_use_strict_directives_in_module_output
        },
        {
            name: "maxNodeModuleJsDepth",
            type: "number",
            description: ts.Diagnostics.The_maximum_dependency_depth_to_search_under_node_modules_and_load_JavaScript_files
        },
        {
            name: "listEmittedFiles",
            type: "boolean"
        },
        {
            name: "lib",
            type: "list",
            element: {
                name: "lib",
                type: {
                    // JavaScript only
                    "es5": "lib.es5.d.ts",
                    "es6": "lib.es2015.d.ts",
                    "es2015": "lib.es2015.d.ts",
                    "es7": "lib.es2016.d.ts",
                    "es2016": "lib.es2016.d.ts",
                    "es2017": "lib.es2017.d.ts",
                    // Host only
                    "dom": "lib.dom.d.ts",
                    "webworker": "lib.webworker.d.ts",
                    "scripthost": "lib.scripthost.d.ts",
                    // ES2015 Or ESNext By-feature options
                    "es2015.core": "lib.es2015.core.d.ts",
                    "es2015.collection": "lib.es2015.collection.d.ts",
                    "es2015.generator": "lib.es2015.generator.d.ts",
                    "es2015.iterable": "lib.es2015.iterable.d.ts",
                    "es2015.promise": "lib.es2015.promise.d.ts",
                    "es2015.proxy": "lib.es2015.proxy.d.ts",
                    "es2015.reflect": "lib.es2015.reflect.d.ts",
                    "es2015.symbol": "lib.es2015.symbol.d.ts",
                    "es2015.symbol.wellknown": "lib.es2015.symbol.wellknown.d.ts",
                    "es2016.array.include": "lib.es2016.array.include.d.ts",
                    "es2017.object": "lib.es2017.object.d.ts",
                    "es2017.sharedmemory": "lib.es2017.sharedmemory.d.ts"
                },
            },
            description: ts.Diagnostics.Specify_library_files_to_be_included_in_the_compilation_Colon
        },
        {
            name: "disableSizeLimit",
            type: "boolean"
        },
        {
            name: "strictNullChecks",
            type: "boolean",
            description: ts.Diagnostics.Enable_strict_null_checks
        }
    ];
    /* @internal */
    ts.typingOptionDeclarations = [
        {
            name: "enableAutoDiscovery",
            type: "boolean",
        },
        {
            name: "include",
            type: "list",
            element: {
                name: "include",
                type: "string"
            }
        },
        {
            name: "exclude",
            type: "list",
            element: {
                name: "exclude",
                type: "string"
            }
        }
    ];
    var optionNameMapCache;
    /* @internal */
    function getOptionNameMap() {
        if (optionNameMapCache) {
            return optionNameMapCache;
        }
        var optionNameMap = {};
        var shortOptionNames = {};
        ts.forEach(ts.optionDeclarations, function (option) {
            optionNameMap[option.name.toLowerCase()] = option;
            if (option.shortName) {
                shortOptionNames[option.shortName] = option.name;
            }
        });
        optionNameMapCache = { optionNameMap: optionNameMap, shortOptionNames: shortOptionNames };
        return optionNameMapCache;
    }
    ts.getOptionNameMap = getOptionNameMap;
    /* @internal */
    function createCompilerDiagnosticForInvalidCustomType(opt) {
        var namesOfType = [];
        ts.forEachKey(opt.type, function (key) {
            namesOfType.push(" '" + key + "'");
        });
        return ts.createCompilerDiagnostic(ts.Diagnostics.Argument_for_0_option_must_be_Colon_1, "--" + opt.name, namesOfType);
    }
    ts.createCompilerDiagnosticForInvalidCustomType = createCompilerDiagnosticForInvalidCustomType;
    /* @internal */
    function parseCustomTypeOption(opt, value, errors) {
        var key = trimString((value || "")).toLowerCase();
        var map = opt.type;
        if (ts.hasProperty(map, key)) {
            return map[key];
        }
        else {
            errors.push(createCompilerDiagnosticForInvalidCustomType(opt));
        }
    }
    ts.parseCustomTypeOption = parseCustomTypeOption;
    /* @internal */
    function parseListTypeOption(opt, value, errors) {
        if (value === void 0) { value = ""; }
        value = trimString(value);
        if (ts.startsWith(value, "-")) {
            return undefined;
        }
        if (value === "") {
            return [];
        }
        var values = value.split(",");
        switch (opt.element.type) {
            case "number":
                return ts.map(values, parseInt);
            case "string":
                return ts.map(values, function (v) { return v || ""; });
            default:
                return ts.filter(ts.map(values, function (v) { return parseCustomTypeOption(opt.element, v, errors); }), function (v) { return !!v; });
        }
    }
    ts.parseListTypeOption = parseListTypeOption;
    /* @internal */
    function parseCommandLine(commandLine, readFile) {
        var options = {};
        var fileNames = [];
        var errors = [];
        var _a = getOptionNameMap(), optionNameMap = _a.optionNameMap, shortOptionNames = _a.shortOptionNames;
        parseStrings(commandLine);
        return {
            options: options,
            fileNames: fileNames,
            errors: errors
        };
        function parseStrings(args) {
            var i = 0;
            while (i < args.length) {
                var s = args[i];
                i++;
                if (s.charCodeAt(0) === ts.CharCode.at) {
                    parseResponseFile(s.slice(1));
                }
                else if (s.charCodeAt(0) === ts.CharCode.minus) {
                    s = s.slice(s.charCodeAt(1) === ts.CharCode.minus ? 2 : 1).toLowerCase();
                    // Try to translate short option names to their full equivalents.
                    if (ts.hasProperty(shortOptionNames, s)) {
                        s = shortOptionNames[s];
                    }
                    if (ts.hasProperty(optionNameMap, s)) {
                        var opt = optionNameMap[s];
                        if (opt.isTSConfigOnly) {
                            errors.push(ts.createCompilerDiagnostic(ts.Diagnostics.Option_0_can_only_be_specified_in_tsconfig_json_file, opt.name));
                        }
                        else {
                            // Check to see if no argument was provided (e.g. "--locale" is the last command-line argument).
                            if (!args[i] && opt.type !== "boolean") {
                                errors.push(ts.createCompilerDiagnostic(ts.Diagnostics.Compiler_option_0_expects_an_argument, opt.name));
                            }
                            switch (opt.type) {
                                case "number":
                                    options[opt.name] = parseInt(args[i]);
                                    i++;
                                    break;
                                case "boolean":
                                    options[opt.name] = true;
                                    break;
                                case "string":
                                    options[opt.name] = args[i] || "";
                                    i++;
                                    break;
                                case "list":
                                    var result = parseListTypeOption(opt, args[i], errors);
                                    options[opt.name] = result || [];
                                    if (result) {
                                        i++;
                                    }
                                    break;
                                // If not a primitive, the possible types are specified in what is effectively a map of options.
                                default:
                                    options[opt.name] = parseCustomTypeOption(opt, args[i], errors);
                                    i++;
                                    break;
                            }
                        }
                    }
                    else {
                        errors.push(ts.createCompilerDiagnostic(ts.Diagnostics.Unknown_compiler_option_0, s));
                    }
                }
                else {
                    fileNames.push(s);
                }
            }
        }
        function parseResponseFile(fileName) {
            var text = readFile ? readFile(fileName) : ts.sys.readFile(fileName);
            if (!text) {
                errors.push(ts.createCompilerDiagnostic(ts.Diagnostics.File_0_not_found, fileName));
                return;
            }
            var args = [];
            var pos = 0;
            while (true) {
                while (pos < text.length && text.charCodeAt(pos) <= ts.CharCode.space)
                    pos++;
                if (pos >= text.length)
                    break;
                var start = pos;
                if (text.charCodeAt(start) === ts.CharCode.doubleQuote) {
                    pos++;
                    while (pos < text.length && text.charCodeAt(pos) !== ts.CharCode.doubleQuote)
                        pos++;
                    if (pos < text.length) {
                        args.push(text.substring(start + 1, pos));
                        pos++;
                    }
                    else {
                        errors.push(ts.createCompilerDiagnostic(ts.Diagnostics.Unterminated_quoted_string_in_response_file_0, fileName));
                    }
                }
                else {
                    while (text.charCodeAt(pos) > ts.CharCode.space)
                        pos++;
                    args.push(text.substring(start, pos));
                }
            }
            parseStrings(args);
        }
    }
    ts.parseCommandLine = parseCommandLine;
    /**
      * Read tsconfig.json file
      * @param fileName The path to the config file
      */
    function readConfigFile(fileName, readFile) {
        var text = "";
        try {
            text = readFile(fileName);
        }
        catch (e) {
            return { error: ts.createCompilerDiagnostic(ts.Diagnostics.Cannot_read_file_0_Colon_1, fileName, e.message) };
        }
        return parseConfigFileTextToJson(fileName, text);
    }
    ts.readConfigFile = readConfigFile;
    /**
      * Parse the text of the tsconfig.json file
      * @param fileName The path to the config file
      * @param jsonText The text of the config file
      */
    function parseConfigFileTextToJson(fileName, jsonText) {
        try {
            var jsonTextWithoutComments = removeComments(jsonText);
            return { config: /\S/.test(jsonTextWithoutComments) ? JSON.parse(jsonTextWithoutComments) : {} };
        }
        catch (e) {
            return { error: ts.createCompilerDiagnostic(ts.Diagnostics.Failed_to_parse_file_0_Colon_1, fileName, e.message) };
        }
    }
    ts.parseConfigFileTextToJson = parseConfigFileTextToJson;
    /**
     * Remove the comments from a json like text.
     * Comments can be single line comments (starting with # or //) or multiline comments using / * * /
     *
     * This method replace comment content by whitespace rather than completely remove them to keep positions in json parsing error reporting accurate.
     */
    function removeComments(jsonText) {
        var output = "";
        var scanner = ts.createScanner(1 /* ES5 */, /* skipTrivia */ false, 0 /* Standard */, jsonText);
        var token;
        while ((token = scanner.scan()) !== 1 /* endOfFile */) {
            switch (token) {
                case ts.TokenType.singleLineComment:
                case ts.TokenType.multiLineComment:
                    // replace comments with whitespace to preserve original character positions
                    output += scanner.getTokenText().replace(/\S/g, " ");
                    break;
                default:
                    output += scanner.getTokenText();
                    break;
            }
        }
        return output;
    }
    // Skip over any minified JavaScript files (ending in ".min.js")
    // Skip over dotted files and folders as well
    var ignoreFileNamePattern = /(\.min\.js$)|([\\/]\.[\w.])/;
    /**
      * Parse the contents of a config file (tsconfig.json).
      * @param json The contents of the config file to parse
      * @param host Instance of ParseConfigHost used to enumerate files in folder.
      * @param basePath A root directory to resolve relative path entries in the config
      *    file to. e.g. outDir
      */
    function parseJsonConfigFileContent(json, host, basePath, existingOptions, configFileName) {
        if (existingOptions === void 0) { existingOptions = {}; }
        var errors = [];
        var compilerOptions = convertCompilerOptionsFromJsonWorker(json["compilerOptions"], basePath, errors, configFileName);
        var options = ts.extend(existingOptions, compilerOptions);
        var typingOptions = convertTypingOptionsFromJsonWorker(json["typingOptions"], basePath, errors, configFileName);
        options.configFilePath = configFileName;
        var _a = getFileNames(errors), fileNames = _a.fileNames, wildcardDirectories = _a.wildcardDirectories;
        return {
            options: options,
            fileNames: fileNames,
            typingOptions: typingOptions,
            raw: json,
            errors: errors,
            wildcardDirectories: wildcardDirectories
        };
        function getFileNames(errors) {
            var fileNames;
            if (ts.hasProperty(json, "files")) {
                if (ts.isArray(json["files"])) {
                    fileNames = json["files"];
                }
                else {
                    errors.push(ts.createCompilerDiagnostic(ts.Diagnostics.Compiler_option_0_requires_a_value_of_type_1, "files", "Array"));
                }
            }
            var includeSpecs;
            if (ts.hasProperty(json, "include")) {
                if (ts.isArray(json["include"])) {
                    includeSpecs = json["include"];
                }
                else {
                    errors.push(ts.createCompilerDiagnostic(ts.Diagnostics.Compiler_option_0_requires_a_value_of_type_1, "include", "Array"));
                }
            }
            var excludeSpecs;
            if (ts.hasProperty(json, "exclude")) {
                if (ts.isArray(json["exclude"])) {
                    excludeSpecs = json["exclude"];
                }
                else {
                    errors.push(ts.createCompilerDiagnostic(ts.Diagnostics.Compiler_option_0_requires_a_value_of_type_1, "exclude", "Array"));
                }
            }
            else if (ts.hasProperty(json, "excludes")) {
                errors.push(ts.createCompilerDiagnostic(ts.Diagnostics.Unknown_option_excludes_Did_you_mean_exclude));
            }
            else {
                // By default, exclude common package folders
                excludeSpecs = ["node_modules", "bower_components", "jspm_packages"];
            }
            // Always exclude the output directory unless explicitly included
            var outDir = json["compilerOptions"] && json["compilerOptions"]["outDir"];
            if (outDir) {
                excludeSpecs.push(outDir);
            }
            if (fileNames === undefined && includeSpecs === undefined) {
                includeSpecs = ["**/*"];
            }
            return matchFileNames(fileNames, includeSpecs, excludeSpecs, basePath, options, host, errors);
        }
    }
    ts.parseJsonConfigFileContent = parseJsonConfigFileContent;
    function convertCompilerOptionsFromJson(jsonOptions, basePath, configFileName) {
        var errors = [];
        var options = convertCompilerOptionsFromJsonWorker(jsonOptions, basePath, errors, configFileName);
        return { options: options, errors: errors };
    }
    ts.convertCompilerOptionsFromJson = convertCompilerOptionsFromJson;
    function convertTypingOptionsFromJson(jsonOptions, basePath, configFileName) {
        var errors = [];
        var options = convertTypingOptionsFromJsonWorker(jsonOptions, basePath, errors, configFileName);
        return { options: options, errors: errors };
    }
    ts.convertTypingOptionsFromJson = convertTypingOptionsFromJson;
    function convertCompilerOptionsFromJsonWorker(jsonOptions, basePath, errors, configFileName) {
        var options = ts.getBaseFileName(configFileName) === "jsconfig.json" ? { allowJs: true } : {};
        convertOptionsFromJson(ts.optionDeclarations, jsonOptions, basePath, options, ts.Diagnostics.Unknown_compiler_option_0, errors);
        return options;
    }
    function convertTypingOptionsFromJsonWorker(jsonOptions, basePath, errors, configFileName) {
        var options = ts.getBaseFileName(configFileName) === "jsconfig.json"
            ? { enableAutoDiscovery: true, include: [], exclude: [] }
            : { enableAutoDiscovery: false, include: [], exclude: [] };
        convertOptionsFromJson(ts.typingOptionDeclarations, jsonOptions, basePath, options, ts.Diagnostics.Unknown_typing_option_0, errors);
        return options;
    }
    function convertOptionsFromJson(optionDeclarations, jsonOptions, basePath, defaultOptions, diagnosticMessage, errors) {
        if (!jsonOptions) {
            return;
        }
        var optionNameMap = ts.arrayToMap(optionDeclarations, function (opt) { return opt.name; });
        for (var id in jsonOptions) {
            if (ts.hasProperty(optionNameMap, id)) {
                var opt = optionNameMap[id];
                defaultOptions[opt.name] = convertJsonOption(opt, jsonOptions[id], basePath, errors);
            }
            else {
                errors.push(ts.createCompilerDiagnostic(diagnosticMessage, id));
            }
        }
    }
    function convertJsonOption(opt, value, basePath, errors) {
        var optType = opt.type;
        var expectedType = typeof optType === "string" ? optType : "string";
        if (optType === "list" && ts.isArray(value)) {
            return convertJsonOptionOfListType(opt, value, basePath, errors);
        }
        else if (typeof value === expectedType) {
            if (typeof optType !== "string") {
                return convertJsonOptionOfCustomType(opt, value, errors);
            }
            else {
                if (opt.isFilePath) {
                    value = ts.normalizePath(ts.combinePaths(basePath, value));
                    if (value === "") {
                        value = ".";
                    }
                }
            }
            return value;
        }
        else {
            errors.push(ts.createCompilerDiagnostic(ts.Diagnostics.Compiler_option_0_requires_a_value_of_type_1, opt.name, expectedType));
        }
    }
    function convertJsonOptionOfCustomType(opt, value, errors) {
        var key = value.toLowerCase();
        if (ts.hasProperty(opt.type, key)) {
            return opt.type[key];
        }
        else {
            errors.push(createCompilerDiagnosticForInvalidCustomType(opt));
        }
    }
    function convertJsonOptionOfListType(option, values, basePath, errors) {
        return ts.filter(ts.map(values, function (v) { return convertJsonOption(option.element, v, basePath, errors); }), function (v) { return !!v; });
    }
    function trimString(s) {
        return typeof s.trim === "function" ? s.trim() : s.replace(/^[\s]+|[\s]+$/g, "");
    }
    /**
     * Tests for a path that ends in a recursive directory wildcard.
     * Matches **, \**, **\, and \**\, but not a**b.
     *
     * NOTE: used \ in place of / above to avoid issues with multiline comments.
     *
     * Breakdown:
     *  (^|\/)      # matches either the beginning of the string or a directory separator.
     *  \*\*        # matches the recursive directory wildcard "**".
     *  \/?$        # matches an optional trailing directory separator at the end of the string.
     */
    var invalidTrailingRecursionPattern = /(^|\/)\*\*\/?$/;
    /**
     * Tests for a path with multiple recursive directory wildcards.
     * Matches **\** and **\a\**, but not **\a**b.
     *
     * NOTE: used \ in place of / above to avoid issues with multiline comments.
     *
     * Breakdown:
     *  (^|\/)      # matches either the beginning of the string or a directory separator.
     *  \*\*\/      # matches a recursive directory wildcard "**" followed by a directory separator.
     *  (.*\/)?     # optionally matches any number of characters followed by a directory separator.
     *  \*\*        # matches a recursive directory wildcard "**"
     *  ($|\/)      # matches either the end of the string or a directory separator.
     */
    var invalidMultipleRecursionPatterns = /(^|\/)\*\*\/(.*\/)?\*\*($|\/)/;
    /**
     * Tests for a path where .. appears after a recursive directory wildcard.
     * Matches **\..\*, **\a\..\*, and **\.., but not ..\**\*
     *
     * NOTE: used \ in place of / above to avoid issues with multiline comments.
     *
     * Breakdown:
     *  (^|\/)      # matches either the beginning of the string or a directory separator.
     *  \*\*\/      # matches a recursive directory wildcard "**" followed by a directory separator.
     *  (.*\/)?     # optionally matches any number of characters followed by a directory separator.
     *  \.\.        # matches a parent directory path component ".."
     *  ($|\/)      # matches either the end of the string or a directory separator.
     */
    var invalidDotDotAfterRecursiveWildcardPattern = /(^|\/)\*\*\/(.*\/)?\.\.($|\/)/;
    /**
     * Tests for a path containing a wildcard character in a directory component of the path.
     * Matches \*\, \?\, and \a*b\, but not \a\ or \a\*.
     *
     * NOTE: used \ in place of / above to avoid issues with multiline comments.
     *
     * Breakdown:
     *  \/          # matches a directory separator.
     *  [^/]*?      # matches any number of characters excluding directory separators (non-greedy).
     *  [*?]        # matches either a wildcard character (* or ?)
     *  [^/]*       # matches any number of characters excluding directory separators (greedy).
     *  \/          # matches a directory separator.
     */
    var watchRecursivePattern = /\/[^/]*?[*?][^/]*\//;
    /**
     * Matches the portion of a wildcard path that does not contain wildcards.
     * Matches \a of \a\*, or \a\b\c of \a\b\c\?\d.
     *
     * NOTE: used \ in place of / above to avoid issues with multiline comments.
     *
     * Breakdown:
     *  ^                   # matches the beginning of the string
     *  [^*?]*              # matches any number of non-wildcard characters
     *  (?=\/[^/]*[*?])     # lookahead that matches a directory separator followed by
     *                      # a path component that contains at least one wildcard character (* or ?).
     */
    var wildcardDirectoryPattern = /^[^*?]*(?=\/[^/]*[*?])/;
    /**
     * Expands an array of file specifications.
     *
     * @param fileNames The literal file names to include.
     * @param include The wildcard file specifications to include.
     * @param exclude The wildcard file specifications to exclude.
     * @param basePath The base path for any relative file specifications.
     * @param options Compiler options.
     * @param host The host used to resolve files and directories.
     * @param errors An array for diagnostic reporting.
     */
    function matchFileNames(fileNames, include, exclude, basePath, options, host, errors) {
        basePath = ts.normalizePath(basePath);
        // The exclude spec list is converted into a regular expression, which allows us to quickly
        // test whether a file or directory should be excluded before recursively traversing the
        // file system.
        var keyMapper = host.useCaseSensitiveFileNames ? caseSensitiveKeyMapper : caseInsensitiveKeyMapper;
        // Literal file names (provided via the "files" array in tsconfig.json) are stored in a
        // file map with a possibly case insensitive key. We use this map later when when including
        // wildcard paths.
        var literalFileMap = {};
        // Wildcard paths (provided via the "includes" array in tsconfig.json) are stored in a
        // file map with a possibly case insensitive key. We use this map to store paths matched
        // via wildcard, and to handle extension priority.
        var wildcardFileMap = {};
        if (include) {
            include = validateSpecs(include, errors, /*allowTrailingRecursion*/ false);
        }
        if (exclude) {
            exclude = validateSpecs(exclude, errors, /*allowTrailingRecursion*/ true);
        }
        // Wildcard directories (provided as part of a wildcard path) are stored in a
        // file map that marks whether it was a regular wildcard match (with a `*` or `?` token),
        // or a recursive directory. This information is used by filesystem watchers to monitor for
        // new entries in these paths.
        var wildcardDirectories = getWildcardDirectories(include, exclude, basePath, host.useCaseSensitiveFileNames);
        // Rather than requery this for each file and filespec, we query the supported extensions
        // once and store it on the expansion context.
        var supportedExtensions = ts.getSupportedExtensions(options);
        // Literal files are always included verbatim. An "include" or "exclude" specification cannot
        // remove a literal file.
        if (fileNames) {
            for (var _i = 0, fileNames_1 = fileNames; _i < fileNames_1.length; _i++) {
                var fileName = fileNames_1[_i];
                var file = ts.combinePaths(basePath, fileName);
                literalFileMap[keyMapper(file)] = file;
            }
        }
        if (include && include.length > 0) {
            for (var _a = 0, _b = host.readDirectory(basePath, supportedExtensions, exclude, include); _a < _b.length; _a++) {
                var file = _b[_a];
                // If we have already included a literal or wildcard path with a
                // higher priority extension, we should skip this file.
                //
                // This handles cases where we may encounter both <file>.ts and
                // <file>.d.ts (or <file>.js if "allowJs" is enabled) in the same
                // directory when they are compilation outputs.
                if (hasFileWithHigherPriorityExtension(file, literalFileMap, wildcardFileMap, supportedExtensions, keyMapper)) {
                    continue;
                }
                if (ignoreFileNamePattern.test(file)) {
                    continue;
                }
                // We may have included a wildcard path with a lower priority
                // extension due to the user-defined order of entries in the
                // "include" array. If there is a lower priority extension in the
                // same directory, we should remove it.
                removeWildcardFilesWithLowerPriorityExtension(file, wildcardFileMap, supportedExtensions, keyMapper);
                var key = keyMapper(file);
                if (!ts.hasProperty(literalFileMap, key) && !ts.hasProperty(wildcardFileMap, key)) {
                    wildcardFileMap[key] = file;
                }
            }
        }
        var literalFiles = ts.reduceProperties(literalFileMap, addFileToOutput, []);
        var wildcardFiles = ts.reduceProperties(wildcardFileMap, addFileToOutput, []);
        wildcardFiles.sort(host.useCaseSensitiveFileNames ? ts.compareStrings : ts.compareStringsCaseInsensitive);
        return {
            fileNames: literalFiles.concat(wildcardFiles),
            wildcardDirectories: wildcardDirectories
        };
    }
    function validateSpecs(specs, errors, allowTrailingRecursion) {
        var validSpecs = [];
        for (var _i = 0, specs_1 = specs; _i < specs_1.length; _i++) {
            var spec = specs_1[_i];
            if (!allowTrailingRecursion && invalidTrailingRecursionPattern.test(spec)) {
                errors.push(ts.createCompilerDiagnostic(ts.Diagnostics.File_specification_cannot_end_in_a_recursive_directory_wildcard_Asterisk_Asterisk_Colon_0, spec));
            }
            else if (invalidMultipleRecursionPatterns.test(spec)) {
                errors.push(ts.createCompilerDiagnostic(ts.Diagnostics.File_specification_cannot_contain_multiple_recursive_directory_wildcards_Asterisk_Asterisk_Colon_0, spec));
            }
            else if (invalidDotDotAfterRecursiveWildcardPattern.test(spec)) {
                errors.push(ts.createCompilerDiagnostic(ts.Diagnostics.File_specification_cannot_contain_a_parent_directory_that_appears_after_a_recursive_directory_wildcard_Asterisk_Asterisk_Colon_0, spec));
            }
            else {
                validSpecs.push(spec);
            }
        }
        return validSpecs;
    }
    /**
     * Gets directories in a set of include patterns that should be watched for changes.
     */
    function getWildcardDirectories(include, exclude, path, useCaseSensitiveFileNames) {
        // We watch a directory recursively if it contains a wildcard anywhere in a directory segment
        // of the pattern:
        //
        //  /a/b/**/d   - Watch /a/b recursively to catch changes to any d in any subfolder recursively
        //  /a/b/*/d    - Watch /a/b recursively to catch any d in any immediate subfolder, even if a new subfolder is added
        //
        // We watch a directory without recursion if it contains a wildcard in the file segment of
        // the pattern:
        //
        //  /a/b/*      - Watch /a/b directly to catch any new file
        //  /a/b/a?z    - Watch /a/b directly to catch any new file matching a?z
        var rawExcludeRegex = ts.getRegularExpressionForWildcard(exclude, path, "exclude");
        var excludeRegex = rawExcludeRegex && new RegExp(rawExcludeRegex, useCaseSensitiveFileNames ? "" : "i");
        var wildcardDirectories = {};
        if (include !== undefined) {
            var recursiveKeys = [];
            for (var _i = 0, include_1 = include; _i < include_1.length; _i++) {
                var file = include_1[_i];
                var name_1 = ts.normalizePath(ts.combinePaths(path, file));
                if (excludeRegex && excludeRegex.test(name_1)) {
                    continue;
                }
                var match = wildcardDirectoryPattern.exec(name_1);
                if (match) {
                    var key = useCaseSensitiveFileNames ? match[0] : match[0].toLowerCase();
                    var flags = watchRecursivePattern.test(name_1) ? 1 /* Recursive */ : 0 /* None */;
                    var existingFlags = ts.getProperty(wildcardDirectories, key);
                    if (existingFlags === undefined || existingFlags < flags) {
                        wildcardDirectories[key] = flags;
                        if (flags === 1 /* Recursive */) {
                            recursiveKeys.push(key);
                        }
                    }
                }
            }
            // Remove any subpaths under an existing recursively watched directory.
            for (var key in wildcardDirectories) {
                if (ts.hasProperty(wildcardDirectories, key)) {
                    for (var _a = 0, recursiveKeys_1 = recursiveKeys; _a < recursiveKeys_1.length; _a++) {
                        var recursiveKey = recursiveKeys_1[_a];
                        if (key !== recursiveKey && ts.containsPath(recursiveKey, key, path, !useCaseSensitiveFileNames)) {
                            delete wildcardDirectories[key];
                        }
                    }
                }
            }
        }
        return wildcardDirectories;
    }
    /**
     * Determines whether a literal or wildcard file has already been included that has a higher
     * extension priority.
     *
     * @param file The path to the file.
     * @param extensionPriority The priority of the extension.
     * @param context The expansion context.
     */
    function hasFileWithHigherPriorityExtension(file, literalFiles, wildcardFiles, extensions, keyMapper) {
        var extensionPriority = ts.getExtensionPriority(file, extensions);
        var adjustedExtensionPriority = ts.adjustExtensionPriority(extensionPriority);
        for (var i = 0 /* Highest */; i < adjustedExtensionPriority; i++) {
            var higherPriorityExtension = extensions[i];
            var higherPriorityPath = keyMapper(ts.changeExtension(file, higherPriorityExtension));
            if (ts.hasProperty(literalFiles, higherPriorityPath) || ts.hasProperty(wildcardFiles, higherPriorityPath)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Removes files included via wildcard expansion with a lower extension priority that have
     * already been included.
     *
     * @param file The path to the file.
     * @param extensionPriority The priority of the extension.
     * @param context The expansion context.
     */
    function removeWildcardFilesWithLowerPriorityExtension(file, wildcardFiles, extensions, keyMapper) {
        var extensionPriority = ts.getExtensionPriority(file, extensions);
        var nextExtensionPriority = ts.getNextLowestExtensionPriority(extensionPriority);
        for (var i = nextExtensionPriority; i < extensions.length; i++) {
            var lowerPriorityExtension = extensions[i];
            var lowerPriorityPath = keyMapper(ts.changeExtension(file, lowerPriorityExtension));
            delete wildcardFiles[lowerPriorityPath];
        }
    }
    /**
     * Adds a file to an array of files.
     *
     * @param output The output array.
     * @param file The file path.
     */
    function addFileToOutput(output, file) {
        output.push(file);
        return output;
    }
    /**
     * Gets a case sensitive key.
     *
     * @param key The original key.
     */
    function caseSensitiveKeyMapper(key) {
        return key;
    }
    /**
     * Gets a case insensitive key.
     *
     * @param key The original key.
     */
    function caseInsensitiveKeyMapper(key) {
        return key.toLowerCase();
    }
})(ts || (ts = {}));
//# sourceMappingURL=commandLineParser.js.map