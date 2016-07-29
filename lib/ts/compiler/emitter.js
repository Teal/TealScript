/// <reference path="checker.ts"/>
/// <reference path="sourcemap.ts" />
/// <reference path="declarationEmitter.ts"/>
/* @internal */
var ts;
(function (ts) {
    function getResolvedExternalModuleName(host, file) {
        return file.moduleName || ts.getExternalModuleNameFromPath(host, file.fileName);
    }
    ts.getResolvedExternalModuleName = getResolvedExternalModuleName;
    function getExternalModuleNameFromDeclaration(host, resolver, declaration) {
        var file = resolver.getExternalModuleFileFromDeclaration(declaration);
        if (!file || ts.isDeclarationFile(file)) {
            return undefined;
        }
        return getResolvedExternalModuleName(host, file);
    }
    ts.getExternalModuleNameFromDeclaration = getExternalModuleNameFromDeclaration;
    var entities = {
        "quot": 0x0022,
        "amp": 0x0026,
        "apos": 0x0027,
        "lt": 0x003C,
        "gt": 0x003E,
        "nbsp": 0x00A0,
        "iexcl": 0x00A1,
        "cent": 0x00A2,
        "pound": 0x00A3,
        "curren": 0x00A4,
        "yen": 0x00A5,
        "brvbar": 0x00A6,
        "sect": 0x00A7,
        "uml": 0x00A8,
        "copy": 0x00A9,
        "ordf": 0x00AA,
        "laquo": 0x00AB,
        "not": 0x00AC,
        "shy": 0x00AD,
        "reg": 0x00AE,
        "macr": 0x00AF,
        "deg": 0x00B0,
        "plusmn": 0x00B1,
        "sup2": 0x00B2,
        "sup3": 0x00B3,
        "acute": 0x00B4,
        "micro": 0x00B5,
        "para": 0x00B6,
        "middot": 0x00B7,
        "cedil": 0x00B8,
        "sup1": 0x00B9,
        "ordm": 0x00BA,
        "raquo": 0x00BB,
        "frac14": 0x00BC,
        "frac12": 0x00BD,
        "frac34": 0x00BE,
        "iquest": 0x00BF,
        "Agrave": 0x00C0,
        "Aacute": 0x00C1,
        "Acirc": 0x00C2,
        "Atilde": 0x00C3,
        "Auml": 0x00C4,
        "Aring": 0x00C5,
        "AElig": 0x00C6,
        "Ccedil": 0x00C7,
        "Egrave": 0x00C8,
        "Eacute": 0x00C9,
        "Ecirc": 0x00CA,
        "Euml": 0x00CB,
        "Igrave": 0x00CC,
        "Iacute": 0x00CD,
        "Icirc": 0x00CE,
        "Iuml": 0x00CF,
        "ETH": 0x00D0,
        "Ntilde": 0x00D1,
        "Ograve": 0x00D2,
        "Oacute": 0x00D3,
        "Ocirc": 0x00D4,
        "Otilde": 0x00D5,
        "Ouml": 0x00D6,
        "times": 0x00D7,
        "Oslash": 0x00D8,
        "Ugrave": 0x00D9,
        "Uacute": 0x00DA,
        "Ucirc": 0x00DB,
        "Uuml": 0x00DC,
        "Yacute": 0x00DD,
        "THORN": 0x00DE,
        "szlig": 0x00DF,
        "agrave": 0x00E0,
        "aacute": 0x00E1,
        "acirc": 0x00E2,
        "atilde": 0x00E3,
        "auml": 0x00E4,
        "aring": 0x00E5,
        "aelig": 0x00E6,
        "ccedil": 0x00E7,
        "egrave": 0x00E8,
        "eacute": 0x00E9,
        "ecirc": 0x00EA,
        "euml": 0x00EB,
        "igrave": 0x00EC,
        "iacute": 0x00ED,
        "icirc": 0x00EE,
        "iuml": 0x00EF,
        "eth": 0x00F0,
        "ntilde": 0x00F1,
        "ograve": 0x00F2,
        "oacute": 0x00F3,
        "ocirc": 0x00F4,
        "otilde": 0x00F5,
        "ouml": 0x00F6,
        "divide": 0x00F7,
        "oslash": 0x00F8,
        "ugrave": 0x00F9,
        "uacute": 0x00FA,
        "ucirc": 0x00FB,
        "uuml": 0x00FC,
        "yacute": 0x00FD,
        "thorn": 0x00FE,
        "yuml": 0x00FF,
        "OElig": 0x0152,
        "oelig": 0x0153,
        "Scaron": 0x0160,
        "scaron": 0x0161,
        "Yuml": 0x0178,
        "fnof": 0x0192,
        "circ": 0x02C6,
        "tilde": 0x02DC,
        "Alpha": 0x0391,
        "Beta": 0x0392,
        "Gamma": 0x0393,
        "Delta": 0x0394,
        "Epsilon": 0x0395,
        "Zeta": 0x0396,
        "Eta": 0x0397,
        "Theta": 0x0398,
        "Iota": 0x0399,
        "Kappa": 0x039A,
        "Lambda": 0x039B,
        "Mu": 0x039C,
        "Nu": 0x039D,
        "Xi": 0x039E,
        "Omicron": 0x039F,
        "Pi": 0x03A0,
        "Rho": 0x03A1,
        "Sigma": 0x03A3,
        "Tau": 0x03A4,
        "Upsilon": 0x03A5,
        "Phi": 0x03A6,
        "Chi": 0x03A7,
        "Psi": 0x03A8,
        "Omega": 0x03A9,
        "alpha": 0x03B1,
        "beta": 0x03B2,
        "gamma": 0x03B3,
        "delta": 0x03B4,
        "epsilon": 0x03B5,
        "zeta": 0x03B6,
        "eta": 0x03B7,
        "theta": 0x03B8,
        "iota": 0x03B9,
        "kappa": 0x03BA,
        "lambda": 0x03BB,
        "mu": 0x03BC,
        "nu": 0x03BD,
        "xi": 0x03BE,
        "omicron": 0x03BF,
        "pi": 0x03C0,
        "rho": 0x03C1,
        "sigmaf": 0x03C2,
        "sigma": 0x03C3,
        "tau": 0x03C4,
        "upsilon": 0x03C5,
        "phi": 0x03C6,
        "chi": 0x03C7,
        "psi": 0x03C8,
        "omega": 0x03C9,
        "thetasym": 0x03D1,
        "upsih": 0x03D2,
        "piv": 0x03D6,
        "ensp": 0x2002,
        "emsp": 0x2003,
        "thinsp": 0x2009,
        "zwnj": 0x200C,
        "zwj": 0x200D,
        "lrm": 0x200E,
        "rlm": 0x200F,
        "ndash": 0x2013,
        "mdash": 0x2014,
        "lsquo": 0x2018,
        "rsquo": 0x2019,
        "sbquo": 0x201A,
        "ldquo": 0x201C,
        "rdquo": 0x201D,
        "bdquo": 0x201E,
        "dagger": 0x2020,
        "Dagger": 0x2021,
        "bull": 0x2022,
        "hellip": 0x2026,
        "permil": 0x2030,
        "prime": 0x2032,
        "Prime": 0x2033,
        "lsaquo": 0x2039,
        "rsaquo": 0x203A,
        "oline": 0x203E,
        "frasl": 0x2044,
        "euro": 0x20AC,
        "image": 0x2111,
        "weierp": 0x2118,
        "real": 0x211C,
        "trade": 0x2122,
        "alefsym": 0x2135,
        "larr": 0x2190,
        "uarr": 0x2191,
        "rarr": 0x2192,
        "darr": 0x2193,
        "harr": 0x2194,
        "crarr": 0x21B5,
        "lArr": 0x21D0,
        "uArr": 0x21D1,
        "rArr": 0x21D2,
        "dArr": 0x21D3,
        "hArr": 0x21D4,
        "forall": 0x2200,
        "part": 0x2202,
        "exist": 0x2203,
        "empty": 0x2205,
        "nabla": 0x2207,
        "isin": 0x2208,
        "notin": 0x2209,
        "ni": 0x220B,
        "prod": 0x220F,
        "sum": 0x2211,
        "minus": 0x2212,
        "lowast": 0x2217,
        "radic": 0x221A,
        "prop": 0x221D,
        "infin": 0x221E,
        "ang": 0x2220,
        "and": 0x2227,
        "or": 0x2228,
        "cap": 0x2229,
        "cup": 0x222A,
        "int": 0x222B,
        "there4": 0x2234,
        "sim": 0x223C,
        "cong": 0x2245,
        "asymp": 0x2248,
        "ne": 0x2260,
        "equiv": 0x2261,
        "le": 0x2264,
        "ge": 0x2265,
        "sub": 0x2282,
        "sup": 0x2283,
        "nsub": 0x2284,
        "sube": 0x2286,
        "supe": 0x2287,
        "oplus": 0x2295,
        "otimes": 0x2297,
        "perp": 0x22A5,
        "sdot": 0x22C5,
        "lceil": 0x2308,
        "rceil": 0x2309,
        "lfloor": 0x230A,
        "rfloor": 0x230B,
        "lang": 0x2329,
        "rang": 0x232A,
        "loz": 0x25CA,
        "spades": 0x2660,
        "clubs": 0x2663,
        "hearts": 0x2665,
        "diams": 0x2666
    };
    // targetSourceFile is when users only want one file in entire project to be emitted. This is used in compileOnSave feature
    function emitFiles(resolver, host, targetSourceFile) {
        // emit output for the __extends helper function
        var extendsHelper = "\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};";
        var assignHelper = "\nvar __assign = (this && this.__assign) || Object.assign || function(t) {\n    for (var s, i = 1, n = arguments.length; i < n; i++) {\n        s = arguments[i];\n        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))\n            t[p] = s[p];\n    }\n    return t;\n};";
        // emit output for the __decorate helper function
        var decorateHelper = "\nvar __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {\n    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;\n    if (typeof Reflect === \"object\" && typeof Reflect.decorate === \"function\") r = Reflect.decorate(decorators, target, key, desc);\n    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;\n    return c > 3 && r && Object.defineProperty(target, key, r), r;\n};";
        // emit output for the __metadata helper function
        var metadataHelper = "\nvar __metadata = (this && this.__metadata) || function (k, v) {\n    if (typeof Reflect === \"object\" && typeof Reflect.metadata === \"function\") return Reflect.metadata(k, v);\n};";
        // emit output for the __param helper function
        var paramHelper = "\nvar __param = (this && this.__param) || function (paramIndex, decorator) {\n    return function (target, key) { decorator(target, key, paramIndex); }\n};";
        var awaiterHelper = "\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments)).next());\n    });\n};";
        var compilerOptions = host.getCompilerOptions();
        var languageVersion = ts.getEmitScriptTarget(compilerOptions);
        var modulekind = ts.getEmitModuleKind(compilerOptions);
        var sourceMapDataList = compilerOptions.sourceMap || compilerOptions.inlineSourceMap ? [] : undefined;
        var emittedFilesList = compilerOptions.listEmittedFiles ? [] : undefined;
        var emitterDiagnostics = ts.createDiagnosticCollection();
        var emitSkipped = false;
        var newLine = host.getNewLine();
        var emitJavaScript = createFileEmitter();
        ts.forEachExpectedEmitFile(host, emitFile, targetSourceFile);
        return {
            emitSkipped: emitSkipped,
            diagnostics: emitterDiagnostics.getDiagnostics(),
            emittedFiles: emittedFilesList,
            sourceMaps: sourceMapDataList
        };
        function isUniqueLocalName(name, container) {
            for (var node = container; ts.isNodeDescendentOf(node, container); node = node.nextContainer) {
                if (node.locals && ts.hasProperty(node.locals, name)) {
                    // We conservatively include alias symbols to cover cases where they're emitted as locals
                    if (node.locals[name].flags & (107455 /* Value */ | 1048576 /* ExportValue */ | 8388608 /* Alias */)) {
                        return false;
                    }
                }
            }
            return true;
        }
        function setLabeledJump(state, isBreak, labelText, labelMarker) {
            if (isBreak) {
                if (!state.labeledNonLocalBreaks) {
                    state.labeledNonLocalBreaks = {};
                }
                state.labeledNonLocalBreaks[labelText] = labelMarker;
            }
            else {
                if (!state.labeledNonLocalContinues) {
                    state.labeledNonLocalContinues = {};
                }
                state.labeledNonLocalContinues[labelText] = labelMarker;
            }
        }
        function hoistVariableDeclarationFromLoop(state, declaration) {
            if (!state.hoistedLocalVariables) {
                state.hoistedLocalVariables = [];
            }
            visit(declaration.name);
            function visit(node) {
                if (node.kind === 215 /* Identifier */) {
                    state.hoistedLocalVariables.push(node);
                }
                else {
                    for (var _a = 0, _b = node.elements; _a < _b.length; _a++) {
                        var element = _b[_a];
                        visit(element.name);
                    }
                }
            }
        }
        function createFileEmitter() {
            var writer = ts.createTextWriter(newLine);
            var write = writer.write, writeTextOfNode = writer.writeTextOfNode, writeLine = writer.writeLine, increaseIndent = writer.increaseIndent, decreaseIndent = writer.decreaseIndent;
            var sourceMap = compilerOptions.sourceMap || compilerOptions.inlineSourceMap ? ts.createSourceMapWriter(host, writer) : ts.getNullSourceMapWriter();
            var setSourceFile = sourceMap.setSourceFile, emitStart = sourceMap.emitStart, emitEnd = sourceMap.emitEnd, emitPos = sourceMap.emitPos;
            var currentSourceFile;
            var currentText;
            var currentLineMap;
            var currentFileIdentifiers;
            var renamedDependencies;
            var isEs6Module;
            var isCurrentFileExternalModule;
            // name of an exporter function if file is a System external module
            // System.register([...], function (<exporter>) {...})
            // exporting in System modules looks like:
            // export var x; ... x = 1
            // =>
            // var x;... exporter("x", x = 1)
            var exportFunctionForFile;
            var contextObjectForFile;
            var generatedNameSet;
            var nodeToGeneratedName;
            var computedPropertyNamesToGeneratedNames;
            var decoratedClassAliases;
            var convertedLoopState;
            var extendsEmitted;
            var assignEmitted;
            var decorateEmitted;
            var paramEmitted;
            var awaiterEmitted;
            var tempFlags = 0;
            var tempVariables;
            var tempParameters;
            var externalImports;
            var exportSpecifiers;
            var exportEquals;
            var hasExportStarsToExportValues;
            var detachedCommentsInfo;
            /** Sourcemap data that will get encoded */
            var sourceMapData;
            /** Is the file being emitted into its own file */
            var isOwnFileEmit;
            /** If removeComments is true, no leading-comments needed to be emitted **/
            var emitLeadingCommentsOfPosition = compilerOptions.removeComments ? function (pos) { } : emitLeadingCommentsOfPositionWorker;
            var setSourceMapWriterEmit = compilerOptions.sourceMap || compilerOptions.inlineSourceMap ? changeSourceMapEmit : function (writer) { };
            var moduleEmitDelegates = (_a = {},
                _a[ts.ModuleKind.ES6] = emitES6Module,
                _a[ts.ModuleKind.AMD] = emitAMDModule,
                _a[ts.ModuleKind.System] = emitSystemModule,
                _a[ts.ModuleKind.UMD] = emitUMDModule,
                _a[ts.ModuleKind.CommonJS] = emitCommonJSModule,
                _a
            );
            var bundleEmitDelegates = (_b = {},
                _b[ts.ModuleKind.ES6] = function () { },
                _b[ts.ModuleKind.AMD] = emitAMDModule,
                _b[ts.ModuleKind.System] = emitSystemModule,
                _b[ts.ModuleKind.UMD] = function () { },
                _b[ts.ModuleKind.CommonJS] = function () { },
                _b
            );
            return doEmit;
            function doEmit(jsFilePath, sourceMapFilePath, sourceFiles, isBundledEmit) {
                sourceMap.initialize(jsFilePath, sourceMapFilePath, sourceFiles, isBundledEmit);
                generatedNameSet = {};
                nodeToGeneratedName = [];
                decoratedClassAliases = [];
                isOwnFileEmit = !isBundledEmit;
                // Emit helpers from all the files
                if (isBundledEmit && modulekind) {
                    ts.forEach(sourceFiles, emitEmitHelpers);
                }
                // Do not call emit directly. It does not set the currentSourceFile.
                ts.forEach(sourceFiles, emitSourceFile);
                writeLine();
                var sourceMappingURL = sourceMap.getSourceMappingURL();
                if (sourceMappingURL) {
                    write("//# sourceMappingURL=" + sourceMappingURL);
                }
                writeEmittedFiles(writer.getText(), jsFilePath, sourceMapFilePath, /*writeByteOrderMark*/ compilerOptions.emitBOM, sourceFiles);
                // reset the state
                sourceMap.reset();
                writer.reset();
                currentSourceFile = undefined;
                currentText = undefined;
                currentLineMap = undefined;
                exportFunctionForFile = undefined;
                contextObjectForFile = undefined;
                generatedNameSet = undefined;
                nodeToGeneratedName = undefined;
                decoratedClassAliases = undefined;
                computedPropertyNamesToGeneratedNames = undefined;
                convertedLoopState = undefined;
                extendsEmitted = false;
                decorateEmitted = false;
                paramEmitted = false;
                awaiterEmitted = false;
                assignEmitted = false;
                tempFlags = 0;
                tempVariables = undefined;
                tempParameters = undefined;
                externalImports = undefined;
                exportSpecifiers = undefined;
                exportEquals = undefined;
                hasExportStarsToExportValues = undefined;
                detachedCommentsInfo = undefined;
                sourceMapData = undefined;
                isEs6Module = false;
                renamedDependencies = undefined;
                isCurrentFileExternalModule = false;
            }
            function emitSourceFile(sourceFile) {
                currentSourceFile = sourceFile;
                currentText = sourceFile.text;
                currentLineMap = ts.getLineStarts(sourceFile);
                exportFunctionForFile = undefined;
                contextObjectForFile = undefined;
                isEs6Module = sourceFile.symbol && sourceFile.symbol.exports && !!sourceFile.symbol.exports["___esModule"];
                renamedDependencies = sourceFile.renamedDependencies;
                currentFileIdentifiers = sourceFile.identifiers;
                isCurrentFileExternalModule = ts.isExternalModule(sourceFile);
                setSourceFile(sourceFile);
                emitNodeWithCommentsAndWithoutSourcemap(sourceFile);
            }
            function isUniqueName(name) {
                return !resolver.hasGlobalName(name) &&
                    !ts.hasProperty(currentFileIdentifiers, name) &&
                    !ts.hasProperty(generatedNameSet, name);
            }
            // Return the next available name in the pattern _a ... _z, _0, _1, ...
            // TempFlags._i or TempFlags._n may be used to express a preference for that dedicated name.
            // Note that names generated by makeTempVariableName and makeUniqueName will never conflict.
            function makeTempVariableName(flags) {
                if (flags && !(tempFlags & flags)) {
                    var name_1 = flags === 268435456 /* _i */ ? "_i" : "_n";
                    if (isUniqueName(name_1)) {
                        tempFlags |= flags;
                        return name_1;
                    }
                }
                while (true) {
                    var count = tempFlags & 268435455 /* CountMask */;
                    tempFlags++;
                    // Skip over 'i' and 'n'
                    if (count !== 8 && count !== 13) {
                        var name_2 = count < 26 ? "_" + String.fromCharCode(ts.CharCode.a + count) : "_" + (count - 26);
                        if (isUniqueName(name_2)) {
                            return name_2;
                        }
                    }
                }
            }
            // Generate a name that is unique within the current file and doesn't conflict with any names
            // in global scope. The name is formed by adding an '_n' suffix to the specified base name,
            // where n is a positive integer. Note that names generated by makeTempVariableName and
            // makeUniqueName are guaranteed to never conflict.
            function makeUniqueName(baseName) {
                // Find the first unique 'name_n', where n is a positive number
                if (baseName.charCodeAt(baseName.length - 1) !== ts.CharCode.underline) {
                    baseName += "_";
                }
                var i = 1;
                while (true) {
                    var generatedName = baseName + i;
                    if (isUniqueName(generatedName)) {
                        return generatedNameSet[generatedName] = generatedName;
                    }
                    i++;
                }
            }
            function generateNameForModuleOrEnum(node) {
                var name = node.name.text;
                // Use module/enum name itself if it is unique, otherwise make a unique variation
                return isUniqueLocalName(name, node) ? name : makeUniqueName(name);
            }
            function generateNameForImportOrExportDeclaration(node) {
                var expr = ts.getExternalModuleName(node);
                var baseName = expr.kind === 155 /* StringLiteral */ ?
                    ts.escapeIdentifier(ts.makeIdentifierFromModuleName(expr.text)) : "module";
                return makeUniqueName(baseName);
            }
            function generateNameForExportDefault() {
                return makeUniqueName("default");
            }
            function generateNameForClassExpression() {
                return makeUniqueName("class");
            }
            function generateNameForNode(node) {
                switch (node.kind) {
                    case 215 /* Identifier */:
                        return makeUniqueName(node.text);
                    case 371 /* ModuleDeclaration */:
                    case 370 /* EnumDeclaration */:
                        return generateNameForModuleOrEnum(node);
                    case 376 /* ImportDeclaration */:
                    case 382 /* ExportDeclaration */:
                        return generateNameForImportOrExportDeclaration(node);
                    case 366 /* FunctionDeclaration */:
                    case 367 /* ClassDeclaration */:
                    case 381 /* ExportAssignment */:
                        return generateNameForExportDefault();
                    case 338 /* ClassExpression */:
                        return generateNameForClassExpression();
                    default:
                        ts.Debug.fail();
                }
            }
            function getGeneratedNameForNode(node) {
                var id = ts.getNodeId(node);
                return nodeToGeneratedName[id] || (nodeToGeneratedName[id] = ts.unescapeIdentifier(generateNameForNode(node)));
            }
            /** Write emitted output to disk */
            function writeEmittedFiles(emitOutput, jsFilePath, sourceMapFilePath, writeByteOrderMark, sourceFiles) {
                if (compilerOptions.sourceMap && !compilerOptions.inlineSourceMap) {
                    ts.writeFile(host, emitterDiagnostics, sourceMapFilePath, sourceMap.getText(), /*writeByteOrderMark*/ false, sourceFiles);
                }
                if (sourceMapDataList) {
                    sourceMapDataList.push(sourceMap.getSourceMapData());
                }
                ts.writeFile(host, emitterDiagnostics, jsFilePath, emitOutput, writeByteOrderMark, sourceFiles);
            }
            // Create a temporary variable with a unique unused name.
            function createTempVariable(flags) {
                var result = ts.createSynthesizedNode(215 /* Identifier */);
                result.text = makeTempVariableName(flags);
                return result;
            }
            function recordTempDeclaration(name) {
                if (!tempVariables) {
                    tempVariables = [];
                }
                tempVariables.push(name);
            }
            function createAndRecordTempVariable(flags) {
                var temp = createTempVariable(flags);
                recordTempDeclaration(temp);
                return temp;
            }
            function emitTempDeclarations(newLine) {
                if (tempVariables) {
                    if (newLine) {
                        writeLine();
                    }
                    else {
                        write(" ");
                    }
                    write("var ");
                    emitCommaList(tempVariables);
                    write(";");
                }
            }
            /** Emit the text for the given token that comes after startPos
              * This by default writes the text provided with the given tokenKind
              * but if optional emitFn callback is provided the text is emitted using the callback instead of default text
              * @param tokenKind the kind of the token to search and emit
              * @param startPos the position in the source to start searching for the token
              * @param emitFn if given will be invoked to emit the text instead of actual token emit */
            function emitToken(tokenKind, startPos, emitFn) {
                var tokenStartPos = ts.skipTrivia(currentText, startPos);
                emitPos(tokenStartPos);
                var tokenString = ts.tokenToString(tokenKind);
                if (emitFn) {
                    emitFn();
                }
                else {
                    write(tokenString);
                }
                var tokenEndPos = tokenStartPos + tokenString.length;
                emitPos(tokenEndPos);
                return tokenEndPos;
            }
            function emitOptional(prefix, node) {
                if (node) {
                    write(prefix);
                    emit(node);
                }
            }
            function emitParenthesizedIf(node, parenthesized) {
                if (parenthesized) {
                    write("(");
                }
                emit(node);
                if (parenthesized) {
                    write(")");
                }
            }
            function emitLinePreservingList(parent, nodes, allowTrailingComma, spacesBetweenBraces) {
                ts.Debug.assert(nodes.length > 0);
                increaseIndent();
                if (nodeStartPositionsAreOnSameLine(parent, nodes[0])) {
                    if (spacesBetweenBraces) {
                        write(" ");
                    }
                }
                else {
                    writeLine();
                }
                for (var i = 0, n = nodes.length; i < n; i++) {
                    if (i) {
                        if (nodeEndIsOnSameLineAsNodeStart(nodes[i - 1], nodes[i])) {
                            write(", ");
                        }
                        else {
                            write(",");
                            writeLine();
                        }
                    }
                    emit(nodes[i]);
                }
                if (nodes.hasTrailingComma && allowTrailingComma) {
                    write(",");
                }
                decreaseIndent();
                if (nodeEndPositionsAreOnSameLine(parent, ts.lastOrUndefined(nodes))) {
                    if (spacesBetweenBraces) {
                        write(" ");
                    }
                }
                else {
                    writeLine();
                }
            }
            function emitList(nodes, start, count, multiLine, trailingComma, leadingComma, noTrailingNewLine, emitNode) {
                if (!emitNode) {
                    emitNode = emit;
                }
                for (var i = 0; i < count; i++) {
                    if (multiLine) {
                        if (i || leadingComma) {
                            write(",");
                        }
                        writeLine();
                    }
                    else {
                        if (i || leadingComma) {
                            write(", ");
                        }
                    }
                    var node = nodes[start + i];
                    // This emitting is to make sure we emit following comment properly
                    //   ...(x, /*comment1*/ y)...
                    //         ^ => node.pos
                    // "comment1" is not considered leading comment for "y" but rather
                    // considered as trailing comment of the previous node.
                    emitTrailingCommentsOfPosition(node.pos);
                    emitNode(node);
                    leadingComma = true;
                }
                if (trailingComma) {
                    write(",");
                }
                if (multiLine && !noTrailingNewLine) {
                    writeLine();
                }
                return count;
            }
            function emitCommaList(nodes) {
                if (nodes) {
                    emitList(nodes, 0, nodes.length, /*multiLine*/ false, /*trailingComma*/ false);
                }
            }
            function emitLines(nodes) {
                emitLinesStartingAt(nodes, /*startIndex*/ 0);
            }
            function emitLinesStartingAt(nodes, startIndex) {
                for (var i = startIndex; i < nodes.length; i++) {
                    writeLine();
                    emit(nodes[i]);
                }
            }
            function isBinaryOrOctalIntegerLiteral(node, text) {
                if (node.kind === 154 /* NumericLiteral */ && text.length > 1) {
                    switch (text.charCodeAt(1)) {
                        case ts.CharCode.b:
                        case ts.CharCode.B:
                        case ts.CharCode.o:
                        case ts.CharCode.O:
                            return true;
                    }
                }
                return false;
            }
            function emitLiteral(node) {
                var text = getLiteralText(node);
                if ((compilerOptions.sourceMap || compilerOptions.inlineSourceMap) && (node.kind === 155 /* StringLiteral */ || ts.isTemplateLiteralKind(node.kind))) {
                    writer.writeLiteral(text);
                }
                else if (languageVersion < 2 /* ES6 */ && isBinaryOrOctalIntegerLiteral(node, text)) {
                    write(node.text);
                }
                else {
                    write(text);
                }
            }
            function getLiteralText(node) {
                // Any template literal or string literal with an extended escape
                // (e.g. "\u{0067}") will need to be downleveled as a escaped string literal.
                if (languageVersion < 2 /* ES6 */ && (ts.isTemplateLiteralKind(node.kind) || node.hasExtendedUnicodeEscape)) {
                    return getQuotedEscapedLiteralText('"', node.text, '"');
                }
                // If we don't need to downlevel and we can reach the original source text using
                // the node's parent reference, then simply get the text as it was originally written.
                if (node.parent) {
                    return ts.getTextOfNodeFromSourceText(currentText, node);
                }
                // If we can't reach the original source text, use the canonical form if it's a number,
                // or an escaped quoted form of the original text if it's string-like.
                switch (node.kind) {
                    case 155 /* StringLiteral */:
                        return getQuotedEscapedLiteralText('"', node.text, '"');
                    case 157 /* NoSubstitutionTemplateLiteral */:
                        return getQuotedEscapedLiteralText("`", node.text, "`");
                    case 158 /* TemplateHead */:
                        return getQuotedEscapedLiteralText("`", node.text, "${");
                    case 159 /* TemplateMiddle */:
                        return getQuotedEscapedLiteralText("}", node.text, "${");
                    case 160 /* TemplateTail */:
                        return getQuotedEscapedLiteralText("}", node.text, "`");
                    case 154 /* NumericLiteral */:
                        return node.text;
                }
                ts.Debug.fail("Literal kind '" + node.kind + "' not accounted for.");
            }
            function getQuotedEscapedLiteralText(leftQuote, text, rightQuote) {
                return leftQuote + ts.escapeNonAsciiCharacters(ts.escapeString(text)) + rightQuote;
            }
            function emitDownlevelRawTemplateLiteral(node) {
                // Find original source text, since we need to emit the raw strings of the tagged template.
                // The raw strings contain the (escaped) strings of what the user wrote.
                // Examples: `\n` is converted to "\\n", a template string with a newline to "\n".
                var text = ts.getTextOfNodeFromSourceText(currentText, node);
                // text contains the original source, it will also contain quotes ("`"), dollar signs and braces ("${" and "}"),
                // thus we need to remove those characters.
                // First template piece starts with "`", others with "}"
                // Last template piece ends with "`", others with "${"
                var isLast = node.kind === 157 /* NoSubstitutionTemplateLiteral */ || node.kind === 160 /* TemplateTail */;
                text = text.substring(1, text.length - (isLast ? 1 : 2));
                // Newline normalization:
                // ES6 Spec 11.8.6.1 - Static Semantics of TV's and TRV's
                // <CR><LF> and <CR> LineTerminatorSequences are normalized to <LF> for both TV and TRV.
                text = text.replace(/\r\n?/g, "\n");
                text = ts.escapeString(text);
                write("\"" + text + "\"");
            }
            function emitDownlevelTaggedTemplateArray(node, literalEmitter) {
                write("[");
                if (node.template.kind === 157 /* NoSubstitutionTemplateLiteral */) {
                    literalEmitter(node.template);
                }
                else {
                    literalEmitter(node.template.head);
                    ts.forEach(node.template.templateSpans, function (child) {
                        write(", ");
                        literalEmitter(child.literal);
                    });
                }
                write("]");
            }
            function emitDownlevelTaggedTemplate(node) {
                var tempVariable = createAndRecordTempVariable(0 /* Auto */);
                write("(");
                emit(tempVariable);
                write(" = ");
                emitDownlevelTaggedTemplateArray(node, emit);
                write(", ");
                emit(tempVariable);
                write(".raw = ");
                emitDownlevelTaggedTemplateArray(node, emitDownlevelRawTemplateLiteral);
                write(", ");
                emitParenthesizedIf(node.tag, needsParenthesisForPropertyAccessOrInvocation(node.tag));
                write("(");
                emit(tempVariable);
                // Now we emit the expressions
                if (node.template.kind === 335 /* TemplateExpression */) {
                    ts.forEach(node.template.templateSpans, function (templateSpan) {
                        write(", ");
                        var needsParens = templateSpan.expression.kind === 333 /* BinaryExpression */
                            && templateSpan.expression.operatorToken.kind === 92 /* comma */;
                        emitParenthesizedIf(templateSpan.expression, needsParens);
                    });
                }
                write("))");
            }
            function emitTemplateExpression(node) {
                // In ES6 mode and above, we can simply emit each portion of a template in order, but in
                // ES3 & ES5 we must convert the template expression into a series of string concatenations.
                if (languageVersion >= 2 /* ES6 */) {
                    ts.forEachChild(node, emit);
                    return;
                }
                var emitOuterParens = ts.isExpression(node.parent)
                    && templateNeedsParens(node, node.parent);
                if (emitOuterParens) {
                    write("(");
                }
                var headEmitted = false;
                if (shouldEmitTemplateHead()) {
                    emitLiteral(node.head);
                    headEmitted = true;
                }
                for (var i = 0, n = node.templateSpans.length; i < n; i++) {
                    var templateSpan = node.templateSpans[i];
                    // Check if the expression has operands and binds its operands less closely than binary '+'.
                    // If it does, we need to wrap the expression in parentheses. Otherwise, something like
                    //    `abc${ 1 << 2 }`
                    // becomes
                    //    "abc" + 1 << 2 + ""
                    // which is really
                    //    ("abc" + 1) << (2 + "")
                    // rather than
                    //    "abc" + (1 << 2) + ""
                    var needsParens = templateSpan.expression.kind !== 324 /* ParenthesizedExpression */
                        && comparePrecedenceToBinaryPlus(templateSpan.expression) !== 1 /* GreaterThan */;
                    if (i > 0 || headEmitted) {
                        // If this is the first span and the head was not emitted, then this templateSpan's
                        // expression will be the first to be emitted. Don't emit the preceding ' + ' in that
                        // case.
                        write(" + ");
                    }
                    emitParenthesizedIf(templateSpan.expression, needsParens);
                    // Only emit if the literal is non-empty.
                    // The binary '+' operator is left-associative, so the first string concatenation
                    // with the head will force the result up to this point to be a string.
                    // Emitting a '+ ""' has no semantic effect for middles and tails.
                    if (templateSpan.literal.text.length !== 0) {
                        write(" + ");
                        emitLiteral(templateSpan.literal);
                    }
                }
                if (emitOuterParens) {
                    write(")");
                }
                function shouldEmitTemplateHead() {
                    // If this expression has an empty head literal and the first template span has a non-empty
                    // literal, then emitting the empty head literal is not necessary.
                    //     `${ foo } and ${ bar }`
                    // can be emitted as
                    //     foo + " and " + bar
                    // This is because it is only required that one of the first two operands in the emit
                    // output must be a string literal, so that the other operand and all following operands
                    // are forced into strings.
                    //
                    // If the first template span has an empty literal, then the head must still be emitted.
                    //     `${ foo }${ bar }`
                    // must still be emitted as
                    //     "" + foo + bar
                    // There is always atleast one templateSpan in this code path, since
                    // NoSubstitutionTemplateLiterals are directly emitted via emitLiteral()
                    ts.Debug.assert(node.templateSpans.length !== 0);
                    return node.head.text.length !== 0 || node.templateSpans[0].literal.text.length === 0;
                }
                function templateNeedsParens(template, parent) {
                    switch (parent.kind) {
                        case 320 /* CallExpression */:
                        case 321 /* NewExpression */:
                            return parent.expression === template;
                        case 322 /* TaggedTemplateExpression */:
                        case 324 /* ParenthesizedExpression */:
                            return false;
                        default:
                            return comparePrecedenceToBinaryPlus(parent) !== -1 /* LessThan */;
                    }
                }
                /**
                 * Returns whether the expression has lesser, greater,
                 * or equal precedence to the binary '+' operator
                 */
                function comparePrecedenceToBinaryPlus(expression) {
                    // All binary expressions have lower precedence than '+' apart from '*', '/', and '%'
                    // which have greater precedence and '-' which has equal precedence.
                    // All unary operators have a higher precedence apart from yield.
                    // Arrow functions and conditionals have a lower precedence,
                    // although we convert the former into regular function expressions in ES5 mode,
                    // and in ES6 mode this function won't get called anyway.
                    //
                    // TODO (drosen): Note that we need to account for the upcoming 'yield' and
                    //                spread ('...') unary operators that are anticipated for ES6.
                    switch (expression.kind) {
                        case 333 /* BinaryExpression */:
                            switch (expression.operatorToken.kind) {
                                case 56 /* asterisk */:
                                case 46 /* slash */:
                                case 60 /* percent */:
                                    return 1 /* GreaterThan */;
                                case 44 /* plus */:
                                case 45 /* minus */:
                                    return 0 /* EqualTo */;
                                default:
                                    return -1 /* LessThan */;
                            }
                        case 336 /* YieldExpression */:
                        case 334 /* ConditionalExpression */:
                            return -1 /* LessThan */;
                        default:
                            return 1 /* GreaterThan */;
                    }
                }
            }
            function emitTemplateSpan(span) {
                emit(span.expression);
                emit(span.literal);
            }
            function jsxEmitReact(node) {
                /// Emit a tag name, which is either '"div"' for lower-cased names, or
                /// 'Div' for upper-cased or dotted names
                function emitTagName(name) {
                    if (name.kind === 215 /* Identifier */ && ts.isIntrinsicJsxName(name.text)) {
                        write('"');
                        emit(name);
                        write('"');
                    }
                    else {
                        emit(name);
                    }
                }
                /// Emit an attribute name, which is quoted if it needs to be quoted. Because
                /// these emit into an object literal property name, we don't need to be worried
                /// about keywords, just non-identifier characters
                function emitAttributeName(name) {
                    if (/^[A-Za-z_]\w*$/.test(name.text)) {
                        emit(name);
                    }
                    else {
                        write('"');
                        emit(name);
                        write('"');
                    }
                }
                /// Emit an name/value pair for an attribute (e.g. "x: 3")
                function emitJsxAttribute(node) {
                    emitAttributeName(node.name);
                    write(": ");
                    if (node.initializer) {
                        emit(node.initializer);
                    }
                    else {
                        write("true");
                    }
                }
                function emitJsxElement(openingNode, children) {
                    var syntheticReactRef = ts.createSynthesizedNode(215 /* Identifier */);
                    syntheticReactRef.text = compilerOptions.reactNamespace ? compilerOptions.reactNamespace : "React";
                    syntheticReactRef.parent = openingNode;
                    // Call React.createElement(tag, ...
                    emitLeadingComments(openingNode);
                    emitExpressionIdentifier(syntheticReactRef);
                    write(".createElement(");
                    emitTagName(openingNode.tagName);
                    write(", ");
                    // Attribute list
                    if (openingNode.attributes.length === 0) {
                        // When there are no attributes, React wants "null"
                        write("null");
                    }
                    else {
                        // Either emit one big object literal (no spread attribs), or
                        // a call to the __assign helper
                        var attrs = openingNode.attributes;
                        if (ts.forEach(attrs, function (attr) { return attr.kind === 393 /* JsxSpreadAttribute */; })) {
                            write("__assign(");
                            var haveOpenedObjectLiteral = false;
                            for (var i = 0; i < attrs.length; i++) {
                                if (attrs[i].kind === 393 /* JsxSpreadAttribute */) {
                                    // If this is the first argument, we need to emit a {} as the first argument
                                    if (i === 0) {
                                        write("{}, ");
                                    }
                                    if (haveOpenedObjectLiteral) {
                                        write("}");
                                        haveOpenedObjectLiteral = false;
                                    }
                                    if (i > 0) {
                                        write(", ");
                                    }
                                    emit(attrs[i].expression);
                                }
                                else {
                                    ts.Debug.assert(attrs[i].kind === 392 /* JsxAttribute */);
                                    if (haveOpenedObjectLiteral) {
                                        write(", ");
                                    }
                                    else {
                                        haveOpenedObjectLiteral = true;
                                        if (i > 0) {
                                            write(", ");
                                        }
                                        write("{");
                                    }
                                    emitJsxAttribute(attrs[i]);
                                }
                            }
                            if (haveOpenedObjectLiteral)
                                write("}");
                            write(")"); // closing paren to React.__spread(
                        }
                        else {
                            // One object literal with all the attributes in them
                            write("{");
                            for (var i = 0, n = attrs.length; i < n; i++) {
                                if (i > 0) {
                                    write(", ");
                                }
                                emitJsxAttribute(attrs[i]);
                            }
                            write("}");
                        }
                    }
                    // Children
                    if (children) {
                        var firstChild = void 0;
                        var multipleEmittableChildren = false;
                        for (var i = 0, n = children.length; i < n; i++) {
                            var jsxChild = children[i];
                            if (isJsxChildEmittable(jsxChild)) {
                                // we need to decide whether to emit in single line or multiple lines as indented list
                                // store firstChild reference, if we see another emittable child, then emit accordingly
                                if (!firstChild) {
                                    write(", ");
                                    firstChild = jsxChild;
                                }
                                else {
                                    // more than one emittable child, emit indented list
                                    if (!multipleEmittableChildren) {
                                        multipleEmittableChildren = true;
                                        increaseIndent();
                                        writeLine();
                                        emit(firstChild);
                                    }
                                    write(", ");
                                    writeLine();
                                    emit(jsxChild);
                                }
                            }
                        }
                        if (multipleEmittableChildren) {
                            decreaseIndent();
                        }
                        else if (firstChild) {
                            if (firstChild.kind !== 387 /* JsxElement */ && firstChild.kind !== 388 /* JsxSelfClosingElement */) {
                                emit(firstChild);
                            }
                            else {
                                // If the only child is jsx element, put it on a new indented line
                                increaseIndent();
                                writeLine();
                                emit(firstChild);
                                writeLine();
                                decreaseIndent();
                            }
                        }
                    }
                    // Closing paren
                    write(")"); // closes "React.createElement("
                    emitTrailingComments(openingNode);
                }
                if (node.kind === 387 /* JsxElement */) {
                    emitJsxElement(node.openingElement, node.children);
                }
                else {
                    ts.Debug.assert(node.kind === 388 /* JsxSelfClosingElement */);
                    emitJsxElement(node);
                }
            }
            function jsxEmitPreserve(node) {
                function emitJsxAttribute(node) {
                    emit(node.name);
                    if (node.initializer) {
                        write("=");
                        emit(node.initializer);
                    }
                }
                function emitJsxSpreadAttribute(node) {
                    write("{...");
                    emit(node.expression);
                    write("}");
                }
                function emitAttributes(attribs) {
                    for (var i = 0, n = attribs.length; i < n; i++) {
                        if (i > 0) {
                            write(" ");
                        }
                        if (attribs[i].kind === 393 /* JsxSpreadAttribute */) {
                            emitJsxSpreadAttribute(attribs[i]);
                        }
                        else {
                            ts.Debug.assert(attribs[i].kind === 392 /* JsxAttribute */);
                            emitJsxAttribute(attribs[i]);
                        }
                    }
                }
                function emitJsxOpeningOrSelfClosingElement(node) {
                    write("<");
                    emit(node.tagName);
                    if (node.attributes.length > 0 || (node.kind === 388 /* JsxSelfClosingElement */)) {
                        write(" ");
                    }
                    emitAttributes(node.attributes);
                    if (node.kind === 388 /* JsxSelfClosingElement */) {
                        write("/>");
                    }
                    else {
                        write(">");
                    }
                }
                function emitJsxClosingElement(node) {
                    write("</");
                    emit(node.tagName);
                    write(">");
                }
                function emitJsxElement(node) {
                    emitJsxOpeningOrSelfClosingElement(node.openingElement);
                    for (var i = 0, n = node.children.length; i < n; i++) {
                        emit(node.children[i]);
                    }
                    emitJsxClosingElement(node.closingElement);
                }
                if (node.kind === 387 /* JsxElement */) {
                    emitJsxElement(node);
                }
                else {
                    ts.Debug.assert(node.kind === 388 /* JsxSelfClosingElement */);
                    emitJsxOpeningOrSelfClosingElement(node);
                }
            }
            // This function specifically handles numeric/string literals for enum and accessor 'identifiers'.
            // In a sense, it does not actually emit identifiers as much as it declares a name for a specific property.
            // For example, this is utilized when feeding in a result to Object.defineProperty.
            function emitExpressionForPropertyName(node) {
                ts.Debug.assert(node.kind !== 315 /* BindingElement */);
                if (node.kind === 155 /* StringLiteral */) {
                    emitLiteral(node);
                }
                else if (node.kind === 286 /* ComputedPropertyName */) {
                    // if this is a decorated computed property, we will need to capture the result
                    // of the property expression so that we can apply decorators later. This is to ensure
                    // we don't introduce unintended side effects:
                    //
                    //   class C {
                    //     [_a = x]() { }
                    //   }
                    //
                    // The emit for the decorated computed property decorator is:
                    //
                    //   __decorate([dec], C.prototype, _a, Object.getOwnPropertyDescriptor(C.prototype, _a));
                    //
                    if (ts.nodeIsDecorated(node.parent)) {
                        if (!computedPropertyNamesToGeneratedNames) {
                            computedPropertyNamesToGeneratedNames = [];
                        }
                        var generatedName = computedPropertyNamesToGeneratedNames[ts.getNodeId(node)];
                        if (generatedName) {
                            // we have already generated a variable for this node, write that value instead.
                            write(generatedName);
                            return;
                        }
                        generatedName = createAndRecordTempVariable(0 /* Auto */).text;
                        computedPropertyNamesToGeneratedNames[ts.getNodeId(node)] = generatedName;
                        write(generatedName);
                        write(" = ");
                    }
                    emit(node.expression);
                }
                else {
                    write('"');
                    if (node.kind === 154 /* NumericLiteral */) {
                        write(node.text);
                    }
                    else {
                        writeTextOfNode(currentText, node);
                    }
                    write('"');
                }
            }
            function isExpressionIdentifier(node) {
                var parent = node.parent;
                switch (parent.kind) {
                    case 316 /* ArrayLiteralExpression */:
                    case 341 /* AsExpression */:
                    case 330 /* AwaitExpression */:
                    case 333 /* BinaryExpression */:
                    case 320 /* CallExpression */:
                    case 395 /* CaseClause */:
                    case 286 /* ComputedPropertyName */:
                    case 334 /* ConditionalExpression */:
                    case 289 /* Decorator */:
                    case 327 /* DeleteExpression */:
                    case 350 /* DoStatement */:
                    case 319 /* ElementAccessExpression */:
                    case 381 /* ExportAssignment */:
                    case 348 /* ExpressionStatement */:
                    case 340 /* ExpressionWithTypeArguments */:
                    case 352 /* ForStatement */:
                    case 353 /* ForInStatement */:
                    case 354 /* ForOfStatement */:
                    case 349 /* IfStatement */:
                    case 391 /* JsxClosingElement */:
                    case 388 /* JsxSelfClosingElement */:
                    case 389 /* JsxOpeningElement */:
                    case 393 /* JsxSpreadAttribute */:
                    case 394 /* JsxExpression */:
                    case 321 /* NewExpression */:
                    case 342 /* NonNullExpression */:
                    case 324 /* ParenthesizedExpression */:
                    case 332 /* PostfixUnaryExpression */:
                    case 331 /* PrefixUnaryExpression */:
                    case 357 /* ReturnStatement */:
                    case 400 /* ShorthandPropertyAssignment */:
                    case 337 /* SpreadElementExpression */:
                    case 359 /* SwitchStatement */:
                    case 322 /* TaggedTemplateExpression */:
                    case 343 /* TemplateSpan */:
                    case 361 /* ThrowStatement */:
                    case 323 /* TypeAssertionExpression */:
                    case 328 /* TypeOfExpression */:
                    case 329 /* VoidExpression */:
                    case 351 /* WhileStatement */:
                    case 358 /* WithStatement */:
                    case 336 /* YieldExpression */:
                        return true;
                    case 315 /* BindingElement */:
                    case 401 /* EnumMember */:
                    case 288 /* Parameter */:
                    case 399 /* PropertyAssignment */:
                    case 291 /* PropertyDeclaration */:
                    case 364 /* VariableDeclaration */:
                        return parent.initializer === node;
                    case 318 /* PropertyAccessExpression */:
                        return parent.expression === node;
                    case 326 /* ArrowFunction */:
                    case 325 /* FunctionExpression */:
                        return parent.body === node;
                    case 375 /* ImportEqualsDeclaration */:
                        return parent.moduleReference === node;
                    case 285 /* QualifiedName */:
                        return parent.left === node;
                }
                return false;
            }
            function emitExpressionIdentifier(node) {
                var container = resolver.getReferencedExportContainer(node);
                if (container) {
                    if (container.kind === 402 /* SourceFile */) {
                        // Identifier references module export
                        if (modulekind !== ts.ModuleKind.ES6 && modulekind !== ts.ModuleKind.System) {
                            write("exports.");
                        }
                    }
                    else {
                        // Identifier references namespace export
                        write(getGeneratedNameForNode(container));
                        write(".");
                    }
                }
                else {
                    if (modulekind !== ts.ModuleKind.ES6) {
                        var declaration = resolver.getReferencedImportDeclaration(node);
                        if (declaration) {
                            if (declaration.kind === 377 /* ImportClause */) {
                                // Identifier references default import
                                write(getGeneratedNameForNode(declaration.parent));
                                write(languageVersion === 0 /* ES3 */ ? '["default"]' : ".default");
                                return;
                            }
                            else if (declaration.kind === 380 /* ImportSpecifier */) {
                                // Identifier references named import
                                write(getGeneratedNameForNode(declaration.parent.parent.parent));
                                var name_3 = declaration.propertyName || declaration.name;
                                var identifier = ts.getTextOfNodeFromSourceText(currentText, name_3);
                                if (languageVersion === 0 /* ES3 */ && identifier === "default") {
                                    write('["default"]');
                                }
                                else {
                                    write(".");
                                    write(identifier);
                                }
                                return;
                            }
                        }
                    }
                    if (languageVersion < 2 /* ES6 */) {
                        var declaration = resolver.getReferencedDeclarationWithCollidingName(node);
                        if (declaration) {
                            write(getGeneratedNameForNode(declaration.name));
                            return;
                        }
                    }
                    else if (resolver.getNodeCheckFlags(node) & 1048576 /* BodyScopedClassBinding */) {
                        // Due to the emit for class decorators, any reference to the class from inside of the class body
                        // must instead be rewritten to point to a temporary variable to avoid issues with the double-bind
                        // behavior of class names in ES6.
                        var declaration = resolver.getReferencedValueDeclaration(node);
                        if (declaration) {
                            var classAlias = decoratedClassAliases[ts.getNodeId(declaration)];
                            if (classAlias !== undefined) {
                                write(classAlias);
                                return;
                            }
                        }
                    }
                }
                if (ts.nodeIsSynthesized(node)) {
                    write(node.text);
                }
                else {
                    writeTextOfNode(currentText, node);
                }
            }
            function isNameOfNestedBlockScopedRedeclarationOrCapturedBinding(node) {
                if (languageVersion < 2 /* ES6 */) {
                    var parent_1 = node.parent;
                    switch (parent_1.kind) {
                        case 315 /* BindingElement */:
                        case 367 /* ClassDeclaration */:
                        case 370 /* EnumDeclaration */:
                        case 364 /* VariableDeclaration */:
                            return parent_1.name === node && resolver.isDeclarationWithCollidingName(parent_1);
                    }
                }
                return false;
            }
            function getClassExpressionInPropertyAccessInStaticPropertyDeclaration(node) {
                if (languageVersion >= 2 /* ES6 */) {
                    var parent_2 = node.parent;
                    if (parent_2.kind === 318 /* PropertyAccessExpression */ && parent_2.expression === node) {
                        parent_2 = parent_2.parent;
                        while (parent_2 && parent_2.kind !== 291 /* PropertyDeclaration */) {
                            parent_2 = parent_2.parent;
                        }
                        return parent_2 && parent_2.kind === 291 /* PropertyDeclaration */ && (parent_2.flags & 32 /* Static */) !== 0 &&
                            parent_2.parent.kind === 338 /* ClassExpression */ ? parent_2.parent : undefined;
                    }
                }
                return undefined;
            }
            function emitIdentifier(node) {
                if (convertedLoopState) {
                    if (node.text == "arguments" && resolver.isArgumentsLocalBinding(node)) {
                        // in converted loop body arguments cannot be used directly.
                        var name_4 = convertedLoopState.argumentsName || (convertedLoopState.argumentsName = makeUniqueName("arguments"));
                        write(name_4);
                        return;
                    }
                }
                if (!node.parent) {
                    write(node.text);
                }
                else if (isExpressionIdentifier(node)) {
                    var classExpression = getClassExpressionInPropertyAccessInStaticPropertyDeclaration(node);
                    if (classExpression) {
                        var declaration = resolver.getReferencedValueDeclaration(node);
                        if (declaration === classExpression) {
                            write(getGeneratedNameForNode(declaration.name));
                            return;
                        }
                    }
                    emitExpressionIdentifier(node);
                }
                else if (isNameOfNestedBlockScopedRedeclarationOrCapturedBinding(node)) {
                    write(getGeneratedNameForNode(node));
                }
                else if (ts.nodeIsSynthesized(node)) {
                    write(node.text);
                }
                else {
                    writeTextOfNode(currentText, node);
                }
            }
            function emitThis(node) {
                if (resolver.getNodeCheckFlags(node) & 2 /* LexicalThis */) {
                    write("_this");
                }
                else if (convertedLoopState) {
                    write(convertedLoopState.thisName || (convertedLoopState.thisName = makeUniqueName("this")));
                }
                else {
                    write("this");
                }
            }
            function emitSuper(node) {
                if (languageVersion >= 2 /* ES6 */) {
                    write("super");
                }
                else {
                    var flags = resolver.getNodeCheckFlags(node);
                    if (flags & 256 /* SuperInstance */) {
                        write("_super.prototype");
                    }
                    else {
                        write("_super");
                    }
                }
            }
            function emitObjectBindingPattern(node) {
                write("{ ");
                var elements = node.elements;
                emitList(elements, 0, elements.length, /*multiLine*/ false, /*trailingComma*/ elements.hasTrailingComma);
                write(" }");
            }
            function emitArrayBindingPattern(node) {
                write("[");
                var elements = node.elements;
                emitList(elements, 0, elements.length, /*multiLine*/ false, /*trailingComma*/ elements.hasTrailingComma);
                write("]");
            }
            function emitBindingElement(node) {
                if (node.propertyName) {
                    emit(node.propertyName);
                    write(": ");
                }
                if (node.dotDotDotToken) {
                    write("...");
                }
                if (ts.isBindingPattern(node.name)) {
                    emit(node.name);
                }
                else {
                    emitModuleMemberName(node);
                }
                emitOptional(" = ", node.initializer);
            }
            function emitSpreadElementExpression(node) {
                write("...");
                emit(node.expression);
            }
            function emitYieldExpression(node) {
                write(ts.tokenToString(38 /* yield */));
                if (node.asteriskToken) {
                    write("*");
                }
                if (node.expression) {
                    write(" ");
                    emit(node.expression);
                }
            }
            function emitAwaitExpression(node) {
                var needsParenthesis = needsParenthesisForAwaitExpressionAsYield(node);
                if (needsParenthesis) {
                    write("(");
                }
                write(ts.tokenToString(38 /* yield */));
                write(" ");
                emit(node.expression);
                if (needsParenthesis) {
                    write(")");
                }
            }
            function needsParenthesisForAwaitExpressionAsYield(node) {
                if (node.parent.kind === 333 /* BinaryExpression */ && !ts.isAssignmentOperator(node.parent.operatorToken.kind)) {
                    return true;
                }
                else if (node.parent.kind === 334 /* ConditionalExpression */ && node.parent.condition === node) {
                    return true;
                }
                return false;
            }
            function needsParenthesisForPropertyAccessOrInvocation(node) {
                switch (node.kind) {
                    case 215 /* Identifier */:
                    case 316 /* ArrayLiteralExpression */:
                    case 318 /* PropertyAccessExpression */:
                    case 319 /* ElementAccessExpression */:
                    case 320 /* CallExpression */:
                    case 324 /* ParenthesizedExpression */:
                        // This list is not exhaustive and only includes those cases that are relevant
                        // to the check in emitArrayLiteral. More cases can be added as needed.
                        return false;
                }
                return true;
            }
            function emitListWithSpread(elements, needsUniqueCopy, multiLine, trailingComma, useConcat) {
                var pos = 0;
                var group = 0;
                var length = elements.length;
                while (pos < length) {
                    // Emit using the pattern <group0>.concat(<group1>, <group2>, ...)
                    if (group === 1 && useConcat) {
                        write(".concat(");
                    }
                    else if (group > 0) {
                        write(", ");
                    }
                    var e = elements[pos];
                    if (e.kind === 337 /* SpreadElementExpression */) {
                        e = e.expression;
                        emitParenthesizedIf(e, /*parenthesized*/ group === 0 && needsParenthesisForPropertyAccessOrInvocation(e));
                        pos++;
                        if (pos === length && group === 0 && needsUniqueCopy && e.kind !== 316 /* ArrayLiteralExpression */) {
                            write(".slice()");
                        }
                    }
                    else {
                        var i = pos;
                        while (i < length && elements[i].kind !== 337 /* SpreadElementExpression */) {
                            i++;
                        }
                        write("[");
                        if (multiLine) {
                            increaseIndent();
                        }
                        emitList(elements, pos, i - pos, multiLine, trailingComma && i === length);
                        if (multiLine) {
                            decreaseIndent();
                        }
                        write("]");
                        pos = i;
                    }
                    group++;
                }
                if (group > 1) {
                    if (useConcat) {
                        write(")");
                    }
                }
            }
            function isSpreadElementExpression(node) {
                return node.kind === 337 /* SpreadElementExpression */;
            }
            function emitArrayLiteral(node) {
                var elements = node.elements;
                if (elements.length === 0) {
                    write("[]");
                }
                else if (languageVersion >= 2 /* ES6 */ || !ts.forEach(elements, isSpreadElementExpression)) {
                    write("[");
                    emitLinePreservingList(node, node.elements, elements.hasTrailingComma, /*spacesBetweenBraces*/ false);
                    write("]");
                }
                else {
                    emitListWithSpread(elements, /*needsUniqueCopy*/ true, /*multiLine*/ node.multiLine, 
                    /*trailingComma*/ elements.hasTrailingComma, /*useConcat*/ true);
                }
            }
            function emitObjectLiteralBody(node, numElements) {
                if (numElements === 0) {
                    write("{}");
                    return;
                }
                write("{");
                if (numElements > 0) {
                    var properties = node.properties;
                    // If we are not doing a downlevel transformation for object literals,
                    // then try to preserve the original shape of the object literal.
                    // Otherwise just try to preserve the formatting.
                    if (numElements === properties.length) {
                        emitLinePreservingList(node, properties, /*allowTrailingComma*/ languageVersion >= 1 /* ES5 */, /*spacesBetweenBraces*/ true);
                    }
                    else {
                        var multiLine = node.multiLine;
                        if (!multiLine) {
                            write(" ");
                        }
                        else {
                            increaseIndent();
                        }
                        emitList(properties, 0, numElements, /*multiLine*/ multiLine, /*trailingComma*/ false);
                        if (!multiLine) {
                            write(" ");
                        }
                        else {
                            decreaseIndent();
                        }
                    }
                }
                write("}");
            }
            function emitDownlevelObjectLiteralWithComputedProperties(node, firstComputedPropertyIndex) {
                var multiLine = node.multiLine;
                var properties = node.properties;
                write("(");
                if (multiLine) {
                    increaseIndent();
                }
                // For computed properties, we need to create a unique handle to the object
                // literal so we can modify it without risking internal assignments tainting the object.
                var tempVar = createAndRecordTempVariable(0 /* Auto */);
                // Write out the first non-computed properties
                // (or all properties if none of them are computed),
                // then emit the rest through indexing on the temp variable.
                emit(tempVar);
                write(" = ");
                emitObjectLiteralBody(node, firstComputedPropertyIndex);
                for (var i = firstComputedPropertyIndex, n = properties.length; i < n; i++) {
                    writeComma();
                    var property = properties[i];
                    emitStart(property);
                    if (property.kind === 295 /* GetAccessor */ || property.kind === 296 /* SetAccessor */) {
                        // TODO (drosen): Reconcile with 'emitMemberFunctions'.
                        var accessors = ts.getAllAccessorDeclarations(node.properties, property);
                        if (property !== accessors.firstAccessor) {
                            continue;
                        }
                        write("Object.defineProperty(");
                        emit(tempVar);
                        write(", ");
                        emitStart(property.name);
                        emitExpressionForPropertyName(property.name);
                        emitEnd(property.name);
                        write(", {");
                        increaseIndent();
                        if (accessors.getAccessor) {
                            writeLine();
                            emitLeadingComments(accessors.getAccessor);
                            write("get: ");
                            emitStart(accessors.getAccessor);
                            write("function ");
                            emitSignatureAndBody(accessors.getAccessor);
                            emitEnd(accessors.getAccessor);
                            emitTrailingComments(accessors.getAccessor);
                            write(",");
                        }
                        if (accessors.setAccessor) {
                            writeLine();
                            emitLeadingComments(accessors.setAccessor);
                            write("set: ");
                            emitStart(accessors.setAccessor);
                            write("function ");
                            emitSignatureAndBody(accessors.setAccessor);
                            emitEnd(accessors.setAccessor);
                            emitTrailingComments(accessors.setAccessor);
                            write(",");
                        }
                        writeLine();
                        write("enumerable: true,");
                        writeLine();
                        write("configurable: true");
                        decreaseIndent();
                        writeLine();
                        write("})");
                        emitEnd(property);
                    }
                    else {
                        emitLeadingComments(property);
                        emitStart(property.name);
                        emit(tempVar);
                        emitMemberAccessForPropertyName(property.name);
                        emitEnd(property.name);
                        write(" = ");
                        if (property.kind === 399 /* PropertyAssignment */) {
                            emit(property.initializer);
                        }
                        else if (property.kind === 400 /* ShorthandPropertyAssignment */) {
                            emitExpressionIdentifier(property.name);
                        }
                        else if (property.kind === 293 /* MethodDeclaration */) {
                            emitFunctionDeclaration(property);
                        }
                        else {
                            ts.Debug.fail("ObjectLiteralElement type not accounted for: " + property.kind);
                        }
                    }
                    emitEnd(property);
                }
                writeComma();
                emit(tempVar);
                if (multiLine) {
                    decreaseIndent();
                    writeLine();
                }
                write(")");
                function writeComma() {
                    if (multiLine) {
                        write(",");
                        writeLine();
                    }
                    else {
                        write(", ");
                    }
                }
            }
            function emitObjectLiteral(node) {
                var properties = node.properties;
                if (languageVersion < 2 /* ES6 */) {
                    var numProperties = properties.length;
                    // Find the first computed property.
                    // Everything until that point can be emitted as part of the initial object literal.
                    var numInitialNonComputedProperties = numProperties;
                    for (var i = 0, n = properties.length; i < n; i++) {
                        if (properties[i].name.kind === 286 /* ComputedPropertyName */) {
                            numInitialNonComputedProperties = i;
                            break;
                        }
                    }
                    var hasComputedProperty = numInitialNonComputedProperties !== properties.length;
                    if (hasComputedProperty) {
                        emitDownlevelObjectLiteralWithComputedProperties(node, numInitialNonComputedProperties);
                        return;
                    }
                }
                // Ordinary case: either the object has no computed properties
                // or we're compiling with an ES6+ target.
                emitObjectLiteralBody(node, properties.length);
            }
            function createBinaryExpression(left, operator, right, startsOnNewLine) {
                var result = ts.createSynthesizedNode(333 /* BinaryExpression */, startsOnNewLine);
                result.operatorToken = ts.createSynthesizedNode(operator);
                result.left = left;
                result.right = right;
                return result;
            }
            function createPropertyAccessExpression(expression, name) {
                var result = ts.createSynthesizedNode(318 /* PropertyAccessExpression */);
                result.expression = parenthesizeForAccess(expression);
                result.name = name;
                return result;
            }
            function createElementAccessExpression(expression, argumentExpression) {
                var result = ts.createSynthesizedNode(319 /* ElementAccessExpression */);
                result.expression = parenthesizeForAccess(expression);
                result.argumentExpression = argumentExpression;
                return result;
            }
            function parenthesizeForAccess(expr) {
                // When diagnosing whether the expression needs parentheses, the decision should be based
                // on the innermost expression in a chain of nested type assertions.
                while (expr.kind === 323 /* TypeAssertionExpression */ ||
                    expr.kind === 341 /* AsExpression */ ||
                    expr.kind === 342 /* NonNullExpression */) {
                    expr = expr.expression;
                }
                // isLeftHandSideExpression is almost the correct criterion for when it is not necessary
                // to parenthesize the expression before a dot. The known exceptions are:
                //
                //    NewExpression:
                //       new C.x        -> not the same as (new C).x
                //    NumberLiteral
                //       1.x            -> not the same as (1).x
                //
                if (ts.isLeftHandSideExpression(expr) &&
                    expr.kind !== 321 /* NewExpression */ &&
                    expr.kind !== 154 /* NumericLiteral */) {
                    return expr;
                }
                var node = ts.createSynthesizedNode(324 /* ParenthesizedExpression */);
                node.expression = expr;
                return node;
            }
            function emitComputedPropertyName(node) {
                write("[");
                emitExpressionForPropertyName(node);
                write("]");
            }
            function emitMethod(node) {
                if (languageVersion >= 2 /* ES6 */ && node.asteriskToken) {
                    write("*");
                }
                emit(node.name);
                if (languageVersion < 2 /* ES6 */) {
                    write(": function ");
                }
                emitSignatureAndBody(node);
            }
            function emitPropertyAssignment(node) {
                emit(node.name);
                write(": ");
                // This is to ensure that we emit comment in the following case:
                //      For example:
                //          obj = {
                //              id: /*comment1*/ ()=>void
                //          }
                // "comment1" is not considered to be leading comment for node.initializer
                // but rather a trailing comment on the previous node.
                emitTrailingCommentsOfPosition(node.initializer.pos);
                emit(node.initializer);
            }
            // Return true if identifier resolves to an exported member of a namespace
            function isExportReference(node) {
                var container = resolver.getReferencedExportContainer(node);
                return !!container;
            }
            // Return true if identifier resolves to an imported identifier
            function isImportedReference(node) {
                var declaration = resolver.getReferencedImportDeclaration(node);
                return declaration && (declaration.kind === 377 /* ImportClause */ || declaration.kind === 380 /* ImportSpecifier */);
            }
            function emitShorthandPropertyAssignment(node) {
                // The name property of a short-hand property assignment is considered an expression position, so here
                // we manually emit the identifier to avoid rewriting.
                writeTextOfNode(currentText, node.name);
                // If emitting pre-ES6 code, or if the name requires rewriting when resolved as an expression identifier,
                // we emit a normal property assignment. For example:
                //   module m {
                //       export let y;
                //   }
                //   module m {
                //       let obj = { y };
                //   }
                // Here we need to emit obj = { y : m.y } regardless of the output target.
                // The same rules apply for imported identifiers when targeting module formats with indirect access to
                // the imported identifiers. For example, when targeting CommonJS:
                //
                //   import {foo} from './foo';
                //   export const baz = { foo };
                //
                // Must be transformed into:
                //
                //   const foo_1 = require('./foo');
                //   exports.baz = { foo: foo_1.foo };
                //
                if (languageVersion < 2 /* ES6 */ || (modulekind !== ts.ModuleKind.ES6 && isImportedReference(node.name)) || isExportReference(node.name)) {
                    // Emit identifier as an identifier
                    write(": ");
                    emitExpressionIdentifier(node.name);
                }
                if (languageVersion >= 2 /* ES6 */ && node.objectAssignmentInitializer) {
                    write(" = ");
                    emit(node.objectAssignmentInitializer);
                }
            }
            function tryEmitConstantValue(node) {
                var constantValue = tryGetConstEnumValue(node);
                if (constantValue !== undefined) {
                    write(constantValue.toString());
                    if (!compilerOptions.removeComments) {
                        var propertyName = node.kind === 318 /* PropertyAccessExpression */ ? ts.declarationNameToString(node.name) : ts.getTextOfNode(node.argumentExpression);
                        write(" /* " + propertyName + " */");
                    }
                    return true;
                }
                return false;
            }
            function tryGetConstEnumValue(node) {
                if (compilerOptions.isolatedModules) {
                    return undefined;
                }
                return node.kind === 318 /* PropertyAccessExpression */ || node.kind === 319 /* ElementAccessExpression */
                    ? resolver.getConstantValue(node)
                    : undefined;
            }
            // Returns 'true' if the code was actually indented, false otherwise.
            // If the code is not indented, an optional valueToWriteWhenNotIndenting will be
            // emitted instead.
            function indentIfOnDifferentLines(parent, node1, node2, valueToWriteWhenNotIndenting) {
                var realNodesAreOnDifferentLines = !ts.nodeIsSynthesized(parent) && !nodeEndIsOnSameLineAsNodeStart(node1, node2);
                // Always use a newline for synthesized code if the synthesizer desires it.
                var synthesizedNodeIsOnDifferentLine = synthesizedNodeStartsOnNewLine(node2);
                if (realNodesAreOnDifferentLines || synthesizedNodeIsOnDifferentLine) {
                    increaseIndent();
                    writeLine();
                    return true;
                }
                else {
                    if (valueToWriteWhenNotIndenting) {
                        write(valueToWriteWhenNotIndenting);
                    }
                    return false;
                }
            }
            function emitPropertyAccess(node) {
                if (tryEmitConstantValue(node)) {
                    return;
                }
                if (languageVersion === 2 /* ES6 */ &&
                    node.expression.kind === 30 /* super */ &&
                    isInAsyncMethodWithSuperInES6(node)) {
                    var name_5 = ts.createSynthesizedNode(155 /* StringLiteral */);
                    name_5.text = node.name.text;
                    emitSuperAccessInAsyncMethod(node.expression, name_5);
                    return;
                }
                emit(node.expression);
                var dotRangeStart = ts.nodeIsSynthesized(node.expression) ? -1 : node.expression.end;
                var dotRangeEnd = ts.nodeIsSynthesized(node.expression) ? -1 : ts.skipTrivia(currentText, node.expression.end) + 1;
                var dotToken = { pos: dotRangeStart, end: dotRangeEnd };
                var indentedBeforeDot = indentIfOnDifferentLines(node, node.expression, dotToken);
                // 1 .toString is a valid property access, emit a space after the literal
                // Also emit a space if expression is a integer const enum value - it will appear in generated code as numeric literal
                var shouldEmitSpace = false;
                if (!indentedBeforeDot) {
                    if (node.expression.kind === 154 /* NumericLiteral */) {
                        // check if numeric literal was originally written with a dot
                        var text = ts.getTextOfNodeFromSourceText(currentText, node.expression);
                        shouldEmitSpace = text.indexOf(ts.tokenToString(53 /* dot */)) < 0;
                    }
                    else {
                        // check if constant enum value is integer
                        var constantValue = tryGetConstEnumValue(node.expression);
                        // isFinite handles cases when constantValue is undefined
                        shouldEmitSpace = isFinite(constantValue) && Math.floor(constantValue) === constantValue;
                    }
                }
                if (shouldEmitSpace) {
                    write(" .");
                }
                else {
                    write(".");
                }
                var indentedAfterDot = indentIfOnDifferentLines(node, dotToken, node.name);
                emit(node.name);
                decreaseIndentIf(indentedBeforeDot, indentedAfterDot);
            }
            function emitQualifiedName(node) {
                emit(node.left);
                write(".");
                emit(node.right);
            }
            function emitQualifiedNameAsExpression(node, useFallback) {
                if (node.left.kind === 215 /* Identifier */) {
                    emitEntityNameAsExpression(node.left, useFallback);
                }
                else if (useFallback) {
                    var temp = createAndRecordTempVariable(0 /* Auto */);
                    write("(");
                    emitNodeWithoutSourceMap(temp);
                    write(" = ");
                    emitEntityNameAsExpression(node.left, /*useFallback*/ true);
                    write(") && ");
                    emitNodeWithoutSourceMap(temp);
                }
                else {
                    emitEntityNameAsExpression(node.left, /*useFallback*/ false);
                }
                write(".");
                emit(node.right);
            }
            function emitEntityNameAsExpression(node, useFallback) {
                switch (node.kind) {
                    case 215 /* Identifier */:
                        if (useFallback) {
                            write("typeof ");
                            emitExpressionIdentifier(node);
                            write(" !== 'undefined' && ");
                        }
                        emitExpressionIdentifier(node);
                        break;
                    case 285 /* QualifiedName */:
                        emitQualifiedNameAsExpression(node, useFallback);
                        break;
                    default:
                        emitNodeWithoutSourceMap(node);
                        break;
                }
            }
            function emitIndexedAccess(node) {
                if (tryEmitConstantValue(node)) {
                    return;
                }
                if (languageVersion === 2 /* ES6 */ &&
                    node.expression.kind === 30 /* super */ &&
                    isInAsyncMethodWithSuperInES6(node)) {
                    emitSuperAccessInAsyncMethod(node.expression, node.argumentExpression);
                    return;
                }
                emit(node.expression);
                write("[");
                emit(node.argumentExpression);
                write("]");
            }
            function hasSpreadElement(elements) {
                return ts.forEach(elements, function (e) { return e.kind === 337 /* SpreadElementExpression */; });
            }
            function skipParentheses(node) {
                while (node.kind === 324 /* ParenthesizedExpression */ ||
                    node.kind === 323 /* TypeAssertionExpression */ ||
                    node.kind === 341 /* AsExpression */ ||
                    node.kind === 342 /* NonNullExpression */) {
                    node = node.expression;
                }
                return node;
            }
            function emitCallTarget(node) {
                if (node.kind === 215 /* Identifier */ || node.kind === 29 /* this */ || node.kind === 30 /* super */) {
                    emit(node);
                    return node;
                }
                var temp = createAndRecordTempVariable(0 /* Auto */);
                write("(");
                emit(temp);
                write(" = ");
                emit(node);
                write(")");
                return temp;
            }
            function emitCallWithSpread(node) {
                var target;
                var expr = skipParentheses(node.expression);
                if (expr.kind === 318 /* PropertyAccessExpression */) {
                    // Target will be emitted as "this" argument
                    target = emitCallTarget(expr.expression);
                    write(".");
                    emit(expr.name);
                }
                else if (expr.kind === 319 /* ElementAccessExpression */) {
                    // Target will be emitted as "this" argument
                    target = emitCallTarget(expr.expression);
                    write("[");
                    emit(expr.argumentExpression);
                    write("]");
                }
                else if (expr.kind === 30 /* super */) {
                    target = expr;
                    write("_super");
                }
                else {
                    emit(node.expression);
                }
                write(".apply(");
                if (target) {
                    if (target.kind === 30 /* super */) {
                        // Calls of form super(...) and super.foo(...)
                        emitThis(target);
                    }
                    else {
                        // Calls of form obj.foo(...)
                        emit(target);
                    }
                }
                else {
                    // Calls of form foo(...)
                    write("void 0");
                }
                write(", ");
                emitListWithSpread(node.arguments, /*needsUniqueCopy*/ false, /*multiLine*/ false, /*trailingComma*/ false, /*useConcat*/ true);
                write(")");
            }
            function isInAsyncMethodWithSuperInES6(node) {
                if (languageVersion === 2 /* ES6 */) {
                    var container = ts.getSuperContainer(node, /*includeFunctions*/ false);
                    if (container && resolver.getNodeCheckFlags(container) & (2048 /* AsyncMethodWithSuper */ | 4096 /* AsyncMethodWithSuperBinding */)) {
                        return true;
                    }
                }
                return false;
            }
            function emitSuperAccessInAsyncMethod(superNode, argumentExpression) {
                var container = ts.getSuperContainer(superNode, /*includeFunctions*/ false);
                var isSuperBinding = resolver.getNodeCheckFlags(container) & 4096 /* AsyncMethodWithSuperBinding */;
                write("_super(");
                emit(argumentExpression);
                write(isSuperBinding ? ").value" : ")");
            }
            function emitCallExpression(node) {
                if (languageVersion < 2 /* ES6 */ && hasSpreadElement(node.arguments)) {
                    emitCallWithSpread(node);
                    return;
                }
                var expression = node.expression;
                var superCall = false;
                var isAsyncMethodWithSuper = false;
                if (expression.kind === 30 /* super */) {
                    emitSuper(expression);
                    superCall = true;
                }
                else {
                    superCall = ts.isSuperPropertyOrElementAccess(expression);
                    isAsyncMethodWithSuper = superCall && isInAsyncMethodWithSuperInES6(node);
                    emit(expression);
                }
                if (superCall && (languageVersion < 2 /* ES6 */ || isAsyncMethodWithSuper)) {
                    write(".call(");
                    emitThis(expression);
                    if (node.arguments.length) {
                        write(", ");
                        emitCommaList(node.arguments);
                    }
                    write(")");
                }
                else {
                    write("(");
                    emitCommaList(node.arguments);
                    write(")");
                }
            }
            function emitNewExpression(node) {
                write("new ");
                // Spread operator logic is supported in new expressions in ES5 using a combination
                // of Function.prototype.bind() and Function.prototype.apply().
                //
                //     Example:
                //
                //         var args = [1, 2, 3, 4, 5];
                //         new Array(...args);
                //
                //     is compiled into the following ES5:
                //
                //         var args = [1, 2, 3, 4, 5];
                //         new (Array.bind.apply(Array, [void 0].concat(args)));
                //
                // The 'thisArg' to 'bind' is ignored when invoking the result of 'bind' with 'new',
                // Thus, we set it to undefined ('void 0').
                if (languageVersion === 1 /* ES5 */ &&
                    node.arguments &&
                    hasSpreadElement(node.arguments)) {
                    write("(");
                    var target = emitCallTarget(node.expression);
                    write(".bind.apply(");
                    emit(target);
                    write(", [void 0].concat(");
                    emitListWithSpread(node.arguments, /*needsUniqueCopy*/ false, /*multiLine*/ false, /*trailingComma*/ false, /*useConcat*/ false);
                    write(")))");
                    write("()");
                }
                else {
                    emit(node.expression);
                    if (node.arguments) {
                        write("(");
                        emitCommaList(node.arguments);
                        write(")");
                    }
                }
            }
            function emitTaggedTemplateExpression(node) {
                if (languageVersion >= 2 /* ES6 */) {
                    emit(node.tag);
                    write(" ");
                    emit(node.template);
                }
                else {
                    emitDownlevelTaggedTemplate(node);
                }
            }
            function emitParenExpression(node) {
                // If the node is synthesized, it means the emitter put the parentheses there,
                // not the user. If we didn't want them, the emitter would not have put them
                // there.
                if (!ts.nodeIsSynthesized(node) && node.parent.kind !== 326 /* ArrowFunction */) {
                    if (node.expression.kind === 323 /* TypeAssertionExpression */ ||
                        node.expression.kind === 341 /* AsExpression */ ||
                        node.expression.kind === 342 /* NonNullExpression */) {
                        var operand = node.expression.expression;
                        // Make sure we consider all nested cast expressions, e.g.:
                        // (<any><number><any>-A).x;
                        while (operand.kind === 323 /* TypeAssertionExpression */ ||
                            operand.kind === 341 /* AsExpression */ ||
                            operand.kind === 342 /* NonNullExpression */) {
                            operand = operand.expression;
                        }
                        // We have an expression of the form: (<Type>SubExpr)
                        // Emitting this as (SubExpr) is really not desirable. We would like to emit the subexpr as is.
                        // Omitting the parentheses, however, could cause change in the semantics of the generated
                        // code if the casted expression has a lower precedence than the rest of the expression, e.g.:
                        //      (<any>new A).foo should be emitted as (new A).foo and not new A.foo
                        //      (<any>typeof A).toString() should be emitted as (typeof A).toString() and not typeof A.toString()
                        //      new (<any>A()) should be emitted as new (A()) and not new A()
                        //      (<any>function foo() { })() should be emitted as an IIF (function foo(){})() and not declaration function foo(){} ()
                        if (operand.kind !== 331 /* PrefixUnaryExpression */ &&
                            operand.kind !== 329 /* VoidExpression */ &&
                            operand.kind !== 328 /* TypeOfExpression */ &&
                            operand.kind !== 327 /* DeleteExpression */ &&
                            operand.kind !== 332 /* PostfixUnaryExpression */ &&
                            operand.kind !== 321 /* NewExpression */ &&
                            !(operand.kind === 320 /* CallExpression */ && node.parent.kind === 321 /* NewExpression */) &&
                            !(operand.kind === 325 /* FunctionExpression */ && node.parent.kind === 320 /* CallExpression */) &&
                            !(operand.kind === 154 /* NumericLiteral */ && node.parent.kind === 318 /* PropertyAccessExpression */)) {
                            emit(operand);
                            return;
                        }
                    }
                }
                write("(");
                emit(node.expression);
                write(")");
            }
            function emitDeleteExpression(node) {
                write(ts.tokenToString(34 /* delete */));
                write(" ");
                emit(node.expression);
            }
            function emitVoidExpression(node) {
                write(ts.tokenToString(36 /* void */));
                write(" ");
                emit(node.expression);
            }
            function emitTypeOfExpression(node) {
                write(ts.tokenToString(35 /* typeof */));
                write(" ");
                emit(node.expression);
            }
            function isNameOfExportedSourceLevelDeclarationInSystemExternalModule(node) {
                if (!isCurrentFileSystemExternalModule() || node.kind !== 215 /* Identifier */ || ts.nodeIsSynthesized(node)) {
                    return false;
                }
                var isVariableDeclarationOrBindingElement = node.parent && (node.parent.kind === 364 /* VariableDeclaration */ || node.parent.kind === 315 /* BindingElement */);
                var targetDeclaration = isVariableDeclarationOrBindingElement
                    ? node.parent
                    : resolver.getReferencedValueDeclaration(node);
                return isSourceFileLevelDeclarationInSystemJsModule(targetDeclaration, /*isExported*/ true);
            }
            function isNameOfExportedDeclarationInNonES6Module(node) {
                if (modulekind === ts.ModuleKind.System || node.kind !== 215 /* Identifier */ || ts.nodeIsSynthesized(node)) {
                    return false;
                }
                return !exportEquals && exportSpecifiers && ts.hasProperty(exportSpecifiers, node.text);
            }
            function emitPrefixUnaryExpression(node) {
                var isPlusPlusOrMinusMinus = (node.operator === 47 /* plusPlus */
                    || node.operator === 48 /* minusMinus */);
                var externalExportChanged = isPlusPlusOrMinusMinus &&
                    isNameOfExportedSourceLevelDeclarationInSystemExternalModule(node.operand);
                if (externalExportChanged) {
                    // emit
                    // ++x
                    // as
                    // exports('x', ++x)
                    write(exportFunctionForFile + "(\"");
                    emitNodeWithoutSourceMap(node.operand);
                    write("\", ");
                }
                var internalExportChanged = isPlusPlusOrMinusMinus &&
                    isNameOfExportedDeclarationInNonES6Module(node.operand);
                if (internalExportChanged) {
                    emitAliasEqual(node.operand);
                }
                write(ts.tokenToString(node.operator));
                // In some cases, we need to emit a space between the operator and the operand. One obvious case
                // is when the operator is an identifier, like delete or typeof. We also need to do this for plus
                // and minus expressions in certain cases. Specifically, consider the following two cases (parens
                // are just for clarity of exposition, and not part of the source code):
                //
                //  (+(+1))
                //  (+(++1))
                //
                // We need to emit a space in both cases. In the first case, the absence of a space will make
                // the resulting expression a prefix increment operation. And in the second, it will make the resulting
                // expression a prefix increment whose operand is a plus expression - (++(+x))
                // The same is true of minus of course.
                if (node.operand.kind === 331 /* PrefixUnaryExpression */) {
                    var operand = node.operand;
                    if (node.operator === 44 /* plus */ && (operand.operator === 44 /* plus */ || operand.operator === 47 /* plusPlus */)) {
                        write(" ");
                    }
                    else if (node.operator === 45 /* minus */ && (operand.operator === 45 /* minus */ || operand.operator === 48 /* minusMinus */)) {
                        write(" ");
                    }
                }
                emit(node.operand);
                if (externalExportChanged) {
                    write(")");
                }
            }
            function emitPostfixUnaryExpression(node) {
                var externalExportChanged = isNameOfExportedSourceLevelDeclarationInSystemExternalModule(node.operand);
                var internalExportChanged = isNameOfExportedDeclarationInNonES6Module(node.operand);
                if (externalExportChanged) {
                    // export function returns the value that was passes as the second argument
                    // however for postfix unary expressions result value should be the value before modification.
                    // emit 'x++' as '(export('x', ++x) - 1)' and 'x--' as '(export('x', --x) + 1)'
                    write("(" + exportFunctionForFile + "(\"");
                    emitNodeWithoutSourceMap(node.operand);
                    write("\", ");
                    write(ts.tokenToString(node.operator));
                    emit(node.operand);
                    if (node.operator === 47 /* plusPlus */) {
                        write(") - 1)");
                    }
                    else {
                        write(") + 1)");
                    }
                }
                else if (internalExportChanged) {
                    emitAliasEqual(node.operand);
                    emit(node.operand);
                    if (node.operator === 47 /* plusPlus */) {
                        write(" += 1");
                    }
                    else {
                        write(" -= 1");
                    }
                }
                else {
                    emit(node.operand);
                    write(ts.tokenToString(node.operator));
                }
            }
            function shouldHoistDeclarationInSystemJsModule(node) {
                return isSourceFileLevelDeclarationInSystemJsModule(node, /*isExported*/ false);
            }
            /*
             * Checks if given node is a source file level declaration (not nested in module/function).
             * If 'isExported' is true - then declaration must also be exported.
             * This function is used in two cases:
             * - check if node is a exported source file level value to determine
             *   if we should also export the value after its it changed
             * - check if node is a source level declaration to emit it differently,
             *   i.e non-exported variable statement 'var x = 1' is hoisted so
             *   we we emit variable statement 'var' should be dropped.
             */
            function isSourceFileLevelDeclarationInSystemJsModule(node, isExported) {
                if (!node || !isCurrentFileSystemExternalModule()) {
                    return false;
                }
                var current = ts.getRootDeclaration(node).parent;
                while (current) {
                    if (current.kind === 402 /* SourceFile */) {
                        return !isExported || ((ts.getCombinedNodeFlags(node) & 1 /* Export */) !== 0);
                    }
                    else if (ts.isDeclaration(current)) {
                        return false;
                    }
                    else {
                        current = current.parent;
                    }
                }
            }
            /**
             * Emit ES7 exponentiation operator downlevel using Math.pow
             * @param node a binary expression node containing exponentiationOperator (**, **=)
             */
            function emitExponentiationOperator(node) {
                var leftHandSideExpression = node.left;
                if (node.operatorToken.kind === 89 /* asteriskAsteriskEquals */) {
                    var synthesizedLHS = void 0;
                    var shouldEmitParentheses = false;
                    if (ts.isElementAccessExpression(leftHandSideExpression)) {
                        shouldEmitParentheses = true;
                        write("(");
                        synthesizedLHS = ts.createSynthesizedNode(319 /* ElementAccessExpression */, /*startsOnNewLine*/ false);
                        var identifier = emitTempVariableAssignment(leftHandSideExpression.expression, /*canDefineTempVariablesInPlace*/ false, /*shouldEmitCommaBeforeAssignment*/ false);
                        synthesizedLHS.expression = identifier;
                        if (leftHandSideExpression.argumentExpression.kind !== 154 /* NumericLiteral */ &&
                            leftHandSideExpression.argumentExpression.kind !== 155 /* StringLiteral */) {
                            var tempArgumentExpression = createAndRecordTempVariable(268435456 /* _i */);
                            synthesizedLHS.argumentExpression = tempArgumentExpression;
                            emitAssignment(tempArgumentExpression, leftHandSideExpression.argumentExpression, /*shouldEmitCommaBeforeAssignment*/ true, leftHandSideExpression.expression);
                        }
                        else {
                            synthesizedLHS.argumentExpression = leftHandSideExpression.argumentExpression;
                        }
                        write(", ");
                    }
                    else if (ts.isPropertyAccessExpression(leftHandSideExpression)) {
                        shouldEmitParentheses = true;
                        write("(");
                        synthesizedLHS = ts.createSynthesizedNode(318 /* PropertyAccessExpression */, /*startsOnNewLine*/ false);
                        var identifier = emitTempVariableAssignment(leftHandSideExpression.expression, /*canDefineTempVariablesInPlace*/ false, /*shouldEmitCommaBeforeAssignment*/ false);
                        synthesizedLHS.expression = identifier;
                        synthesizedLHS.name = leftHandSideExpression.name;
                        write(", ");
                    }
                    emit(synthesizedLHS || leftHandSideExpression);
                    write(" = ");
                    write("Math.pow(");
                    emit(synthesizedLHS || leftHandSideExpression);
                    write(", ");
                    emit(node.right);
                    write(")");
                    if (shouldEmitParentheses) {
                        write(")");
                    }
                }
                else {
                    write("Math.pow(");
                    emit(leftHandSideExpression);
                    write(", ");
                    emit(node.right);
                    write(")");
                }
            }
            function emitAliasEqual(name) {
                for (var _a = 0, _b = exportSpecifiers[name.text]; _a < _b.length; _a++) {
                    var specifier = _b[_a];
                    emitStart(specifier.name);
                    emitContainingModuleName(specifier);
                    if (languageVersion === 0 /* ES3 */ && name.text === "default") {
                        write('["default"]');
                    }
                    else {
                        write(".");
                        emitNodeWithCommentsAndWithoutSourcemap(specifier.name);
                    }
                    emitEnd(specifier.name);
                    write(" = ");
                }
                return true;
            }
            function emitBinaryExpression(node) {
                if (languageVersion < 2 /* ES6 */ && node.operatorToken.kind === 77 /* equals */ &&
                    (node.left.kind === 317 /* ObjectLiteralExpression */ || node.left.kind === 316 /* ArrayLiteralExpression */)) {
                    emitDestructuring(node, node.parent.kind === 348 /* ExpressionStatement */);
                }
                else {
                    var isAssignment = ts.isAssignmentOperator(node.operatorToken.kind);
                    var externalExportChanged = isAssignment &&
                        isNameOfExportedSourceLevelDeclarationInSystemExternalModule(node.left);
                    if (externalExportChanged) {
                        // emit assignment 'x <op> y' as 'exports("x", x <op> y)'
                        write(exportFunctionForFile + "(\"");
                        emitNodeWithoutSourceMap(node.left);
                        write("\", ");
                    }
                    var internalExportChanged = isAssignment &&
                        isNameOfExportedDeclarationInNonES6Module(node.left);
                    if (internalExportChanged) {
                        // export { foo }
                        // emit foo = 2 as exports.foo = foo = 2
                        emitAliasEqual(node.left);
                    }
                    if (node.operatorToken.kind === 75 /* asteriskAsterisk */ || node.operatorToken.kind === 89 /* asteriskAsteriskEquals */) {
                        // Downleveled emit exponentiation operator using Math.pow
                        emitExponentiationOperator(node);
                    }
                    else {
                        emit(node.left);
                        // Add indentation before emit the operator if the operator is on different line
                        // For example:
                        //      3
                        //      + 2;
                        //   emitted as
                        //      3
                        //          + 2;
                        var indentedBeforeOperator = indentIfOnDifferentLines(node, node.left, node.operatorToken, node.operatorToken.kind !== 92 /* comma */ ? " " : undefined);
                        write(ts.tokenToString(node.operatorToken.kind));
                        var indentedAfterOperator = indentIfOnDifferentLines(node, node.operatorToken, node.right, " ");
                        emit(node.right);
                        decreaseIndentIf(indentedBeforeOperator, indentedAfterOperator);
                    }
                    if (externalExportChanged) {
                        write(")");
                    }
                }
            }
            function synthesizedNodeStartsOnNewLine(node) {
                return ts.nodeIsSynthesized(node) && node.startsOnNewLine;
            }
            function emitConditionalExpression(node) {
                emit(node.condition);
                var indentedBeforeQuestion = indentIfOnDifferentLines(node, node.condition, node.questionToken, " ");
                write("?");
                var indentedAfterQuestion = indentIfOnDifferentLines(node, node.questionToken, node.whenTrue, " ");
                emit(node.whenTrue);
                decreaseIndentIf(indentedBeforeQuestion, indentedAfterQuestion);
                var indentedBeforeColon = indentIfOnDifferentLines(node, node.whenTrue, node.colonToken, " ");
                write(":");
                var indentedAfterColon = indentIfOnDifferentLines(node, node.colonToken, node.whenFalse, " ");
                emit(node.whenFalse);
                decreaseIndentIf(indentedBeforeColon, indentedAfterColon);
            }
            // Helper function to decrease the indent if we previously indented.  Allows multiple
            // previous indent values to be considered at a time.  This also allows caller to just
            // call this once, passing in all their appropriate indent values, instead of needing
            // to call this helper function multiple times.
            function decreaseIndentIf(value1, value2) {
                if (value1) {
                    decreaseIndent();
                }
                if (value2) {
                    decreaseIndent();
                }
            }
            function isSingleLineEmptyBlock(node) {
                if (node && node.kind === 345 /* Block */) {
                    var block = node;
                    return block.statements.length === 0 && nodeEndIsOnSameLineAsNodeStart(block, block);
                }
            }
            function emitBlock(node) {
                if (isSingleLineEmptyBlock(node)) {
                    emitToken(31 /* openBrace */, node.pos);
                    write(" ");
                    emitToken(98 /* closeBrace */, node.statements.end);
                    return;
                }
                emitToken(31 /* openBrace */, node.pos);
                increaseIndent();
                if (node.kind === 372 /* ModuleBlock */) {
                    ts.Debug.assert(node.parent.kind === 371 /* ModuleDeclaration */);
                    emitCaptureThisForNodeIfNecessary(node.parent);
                }
                emitLines(node.statements);
                if (node.kind === 372 /* ModuleBlock */) {
                    emitTempDeclarations(/*newLine*/ true);
                }
                decreaseIndent();
                writeLine();
                emitToken(98 /* closeBrace */, node.statements.end);
            }
            function emitEmbeddedStatement(node) {
                if (node.kind === 345 /* Block */) {
                    write(" ");
                    emit(node);
                }
                else {
                    increaseIndent();
                    writeLine();
                    emit(node);
                    decreaseIndent();
                }
            }
            function emitExpressionStatement(node) {
                emitParenthesizedIf(node.expression, /*parenthesized*/ node.expression.kind === 326 /* ArrowFunction */);
                write(";");
            }
            function emitIfStatement(node) {
                var endPos = emitToken(104 /* if */, node.pos);
                write(" ");
                endPos = emitToken(42 /* openParen */, endPos);
                emit(node.expression);
                emitToken(96 /* closeParen */, node.expression.end);
                emitEmbeddedStatement(node.thenStatement);
                if (node.elseStatement) {
                    writeLine();
                    emitToken(125 /* else */, node.thenStatement.end);
                    if (node.elseStatement.kind === 349 /* IfStatement */) {
                        write(" ");
                        emit(node.elseStatement);
                    }
                    else {
                        emitEmbeddedStatement(node.elseStatement);
                    }
                }
            }
            function emitDoStatement(node) {
                emitLoop(node, emitDoStatementWorker);
            }
            function emitDoStatementWorker(node, loop) {
                write("do");
                if (loop) {
                    emitConvertedLoopCall(loop, /*emitAsBlock*/ true);
                }
                else {
                    emitNormalLoopBody(node, /*emitAsEmbeddedStatement*/ true);
                }
                if (node.statement.kind === 345 /* Block */) {
                    write(" ");
                }
                else {
                    writeLine();
                }
                write("while (");
                emit(node.expression);
                write(");");
            }
            function emitWhileStatement(node) {
                emitLoop(node, emitWhileStatementWorker);
            }
            function emitWhileStatementWorker(node, loop) {
                write("while (");
                emit(node.expression);
                write(")");
                if (loop) {
                    emitConvertedLoopCall(loop, /*emitAsBlock*/ true);
                }
                else {
                    emitNormalLoopBody(node, /*emitAsEmbeddedStatement*/ true);
                }
            }
            /**
             * Returns true if start of variable declaration list was emitted.
             * Returns false if nothing was written - this can happen for source file level variable declarations
             *     in system modules where such variable declarations are hoisted.
             */
            function tryEmitStartOfVariableDeclarationList(decl) {
                if (shouldHoistVariable(decl, /*checkIfSourceFileLevelDecl*/ true)) {
                    // variables in variable declaration list were already hoisted
                    return false;
                }
                if (convertedLoopState && (ts.getCombinedNodeFlags(decl) & 3072 /* BlockScoped */) === 0) {
                    // we are inside a converted loop - this can only happen in downlevel scenarios
                    // record names for all variable declarations
                    for (var _a = 0, _b = decl.declarations; _a < _b.length; _a++) {
                        var varDecl = _b[_a];
                        hoistVariableDeclarationFromLoop(convertedLoopState, varDecl);
                    }
                    return false;
                }
                emitStart(decl);
                if (decl && languageVersion >= 2 /* ES6 */) {
                    if (ts.isLet(decl)) {
                        write("let ");
                    }
                    else if (ts.isConst(decl)) {
                        write("const ");
                    }
                    else {
                        write("var ");
                    }
                }
                else {
                    write("var ");
                }
                // Note here we specifically dont emit end so that if we are going to emit binding pattern
                // we can alter the source map correctly
                return true;
            }
            function emitVariableDeclarationListSkippingUninitializedEntries(list) {
                var started = false;
                for (var _a = 0, _b = list.declarations; _a < _b.length; _a++) {
                    var decl = _b[_a];
                    if (!decl.initializer) {
                        continue;
                    }
                    if (!started) {
                        started = true;
                    }
                    else {
                        write(", ");
                    }
                    emit(decl);
                }
                return started;
            }
            function shouldConvertLoopBody(node) {
                return languageVersion < 2 /* ES6 */ &&
                    (resolver.getNodeCheckFlags(node) & 65536 /* LoopWithCapturedBlockScopedBinding */) !== 0;
            }
            function emitLoop(node, loopEmitter) {
                var shouldConvert = shouldConvertLoopBody(node);
                if (!shouldConvert) {
                    loopEmitter(node, /* convertedLoop*/ undefined);
                }
                else {
                    var loop = convertLoopBody(node);
                    if (node.parent.kind === 360 /* LabeledStatement */) {
                        // if parent of the loop was labeled statement - attach the label to loop skipping converted loop body
                        emitLabelAndColon(node.parent);
                    }
                    loopEmitter(node, loop);
                }
            }
            function convertLoopBody(node) {
                var functionName = makeUniqueName("_loop");
                var loopInitializer;
                switch (node.kind) {
                    case 352 /* ForStatement */:
                    case 353 /* ForInStatement */:
                    case 354 /* ForOfStatement */:
                        var initializer = node.initializer;
                        if (initializer && initializer.kind === 365 /* VariableDeclarationList */) {
                            loopInitializer = node.initializer;
                        }
                        break;
                }
                var loopParameters;
                var loopOutParameters;
                if (loopInitializer && (ts.getCombinedNodeFlags(loopInitializer) & 3072 /* BlockScoped */)) {
                    // if loop initializer contains block scoped variables - they should be passed to converted loop body as parameters
                    loopParameters = [];
                    for (var _a = 0, _b = loopInitializer.declarations; _a < _b.length; _a++) {
                        var varDeclaration = _b[_a];
                        processVariableDeclaration(varDeclaration.name);
                    }
                }
                var bodyIsBlock = node.statement.kind === 345 /* Block */;
                var paramList = loopParameters ? loopParameters.join(", ") : "";
                writeLine();
                write("var " + functionName + " = function(" + paramList + ")");
                var convertedOuterLoopState = convertedLoopState;
                convertedLoopState = { loopOutParameters: loopOutParameters };
                if (convertedOuterLoopState) {
                    // convertedOuterLoopState !== undefined means that this converted loop is nested in another converted loop.
                    // if outer converted loop has already accumulated some state - pass it through
                    if (convertedOuterLoopState.argumentsName) {
                        // outer loop has already used 'arguments' so we've already have some name to alias it
                        // use the same name in all nested loops
                        convertedLoopState.argumentsName = convertedOuterLoopState.argumentsName;
                    }
                    if (convertedOuterLoopState.thisName) {
                        // outer loop has already used 'this' so we've already have some name to alias it
                        // use the same name in all nested loops
                        convertedLoopState.thisName = convertedOuterLoopState.thisName;
                    }
                    if (convertedOuterLoopState.hoistedLocalVariables) {
                        // we've already collected some non-block scoped variable declarations in enclosing loop
                        // use the same storage in nested loop
                        convertedLoopState.hoistedLocalVariables = convertedOuterLoopState.hoistedLocalVariables;
                    }
                }
                write(" {");
                writeLine();
                increaseIndent();
                if (bodyIsBlock) {
                    emitLines(node.statement.statements);
                }
                else {
                    emit(node.statement);
                }
                writeLine();
                // end of loop body -> copy out parameter
                copyLoopOutParameters(convertedLoopState, 1 /* ToOutParameter */, /*emitAsStatements*/ true);
                decreaseIndent();
                writeLine();
                write("};");
                writeLine();
                if (loopOutParameters) {
                    // declare variables to hold out params for loop body
                    write("var ");
                    for (var i = 0; i < loopOutParameters.length; i++) {
                        if (i !== 0) {
                            write(", ");
                        }
                        write(loopOutParameters[i].outParamName);
                    }
                    write(";");
                    writeLine();
                }
                if (convertedLoopState.argumentsName) {
                    // if alias for arguments is set
                    if (convertedOuterLoopState) {
                        // pass it to outer converted loop
                        convertedOuterLoopState.argumentsName = convertedLoopState.argumentsName;
                    }
                    else {
                        // this is top level converted loop and we need to create an alias for 'arguments' object
                        write("var " + convertedLoopState.argumentsName + " = arguments;");
                        writeLine();
                    }
                }
                if (convertedLoopState.thisName) {
                    // if alias for this is set
                    if (convertedOuterLoopState) {
                        // pass it to outer converted loop
                        convertedOuterLoopState.thisName = convertedLoopState.thisName;
                    }
                    else {
                        // this is top level converted loop so we need to create an alias for 'this' here
                        // NOTE:
                        // if converted loops were all nested in arrow function then we'll always emit '_this' so convertedLoopState.thisName will not be set.
                        // If it is set this means that all nested loops are not nested in arrow function and it is safe to capture 'this'.
                        write("var " + convertedLoopState.thisName + " = this;");
                        writeLine();
                    }
                }
                if (convertedLoopState.hoistedLocalVariables) {
                    // if hoistedLocalVariables !== undefined this means that we've possibly collected some variable declarations to be hoisted later
                    if (convertedOuterLoopState) {
                        // pass them to outer converted loop
                        convertedOuterLoopState.hoistedLocalVariables = convertedLoopState.hoistedLocalVariables;
                    }
                    else {
                        // deduplicate and hoist collected variable declarations
                        write("var ");
                        var seen = void 0;
                        for (var _c = 0, _d = convertedLoopState.hoistedLocalVariables; _c < _d.length; _c++) {
                            var id = _d[_c];
                            // Don't initialize seen unless we have at least one element.
                            // Emit a comma to separate for all but the first element.
                            if (!seen) {
                                seen = {};
                            }
                            else {
                                write(", ");
                            }
                            if (!ts.hasProperty(seen, id.text)) {
                                emit(id);
                                seen[id.text] = id.text;
                            }
                        }
                        write(";");
                        writeLine();
                    }
                }
                var currentLoopState = convertedLoopState;
                convertedLoopState = convertedOuterLoopState;
                return { functionName: functionName, paramList: paramList, state: currentLoopState };
                function processVariableDeclaration(name) {
                    if (name.kind === 215 /* Identifier */) {
                        var nameText = isNameOfNestedBlockScopedRedeclarationOrCapturedBinding(name)
                            ? getGeneratedNameForNode(name)
                            : name.text;
                        loopParameters.push(nameText);
                        if (resolver.getNodeCheckFlags(name.parent) & 2097152 /* NeedsLoopOutParameter */) {
                            var reassignedVariable = { originalName: name, outParamName: makeUniqueName("out_" + nameText) };
                            (loopOutParameters || (loopOutParameters = [])).push(reassignedVariable);
                        }
                    }
                    else {
                        for (var _a = 0, _b = name.elements; _a < _b.length; _a++) {
                            var element = _b[_a];
                            processVariableDeclaration(element.name);
                        }
                    }
                }
            }
            function emitNormalLoopBody(node, emitAsEmbeddedStatement) {
                var saveAllowedNonLabeledJumps;
                if (convertedLoopState) {
                    // we get here if we are trying to emit normal loop loop inside converted loop
                    // set allowedNonLabeledJumps to Break | Continue to mark that break\continue inside the loop should be emitted as is
                    saveAllowedNonLabeledJumps = convertedLoopState.allowedNonLabeledJumps;
                    convertedLoopState.allowedNonLabeledJumps = 2 /* Break */ | 4 /* Continue */;
                }
                if (emitAsEmbeddedStatement) {
                    emitEmbeddedStatement(node.statement);
                }
                else if (node.statement.kind === 345 /* Block */) {
                    emitLines(node.statement.statements);
                }
                else {
                    writeLine();
                    emit(node.statement);
                }
                if (convertedLoopState) {
                    convertedLoopState.allowedNonLabeledJumps = saveAllowedNonLabeledJumps;
                }
            }
            function copyLoopOutParameters(state, copyDirection, emitAsStatements) {
                if (state.loopOutParameters) {
                    for (var _a = 0, _b = state.loopOutParameters; _a < _b.length; _a++) {
                        var outParam = _b[_a];
                        if (copyDirection === 0 /* ToOriginal */) {
                            emitIdentifier(outParam.originalName);
                            write(" = " + outParam.outParamName);
                        }
                        else {
                            write(outParam.outParamName + " = ");
                            emitIdentifier(outParam.originalName);
                        }
                        if (emitAsStatements) {
                            write(";");
                            writeLine();
                        }
                        else {
                            write(", ");
                        }
                    }
                }
            }
            function emitConvertedLoopCall(loop, emitAsBlock) {
                if (emitAsBlock) {
                    write(" {");
                    writeLine();
                    increaseIndent();
                }
                // loop is considered simple if it does not have any return statements or break\continue that transfer control outside of the loop
                // simple loops are emitted as just 'loop()';
                // NOTE: if loop uses only 'continue' it still will be emitted as simple loop
                var isSimpleLoop = !(loop.state.nonLocalJumps & ~4 /* Continue */) &&
                    !loop.state.labeledNonLocalBreaks &&
                    !loop.state.labeledNonLocalContinues;
                var loopResult = makeUniqueName("state");
                if (!isSimpleLoop) {
                    write("var " + loopResult + " = ");
                }
                write(loop.functionName + "(" + loop.paramList + ");");
                writeLine();
                copyLoopOutParameters(loop.state, 0 /* ToOriginal */, /*emitAsStatements*/ true);
                if (!isSimpleLoop) {
                    // for non simple loops we need to store result returned from converted loop function and use it to do dispatching
                    // converted loop function can return:
                    // - object - used when body of the converted loop contains return statement. Property "value" of this object stores retuned value
                    // - string - used to dispatch jumps. "break" and "continue" are used to non-labeled jumps, other values are used to transfer control to
                    //   different labels
                    writeLine();
                    if (loop.state.nonLocalJumps & 8 /* Return */) {
                        write("if (typeof " + loopResult + " === \"object\") ");
                        if (convertedLoopState) {
                            // we are currently nested in another converted loop - return unwrapped result
                            write("return " + loopResult + ";");
                            // propagate 'hasReturn' flag to outer loop
                            convertedLoopState.nonLocalJumps |= 8 /* Return */;
                        }
                        else {
                            // top level converted loop - return unwrapped value
                            write("return " + loopResult + ".value;");
                        }
                        writeLine();
                    }
                    if (loop.state.nonLocalJumps & 2 /* Break */) {
                        write("if (" + loopResult + " === \"break\") break;");
                        writeLine();
                    }
                    // in case of labeled breaks emit code that either breaks to some known label inside outer loop or delegates jump decision to outer loop
                    emitDispatchTableForLabeledJumps(loopResult, loop.state, convertedLoopState);
                }
                if (emitAsBlock) {
                    writeLine();
                    decreaseIndent();
                    write("}");
                }
                function emitDispatchTableForLabeledJumps(loopResultVariable, currentLoop, outerLoop) {
                    if (!currentLoop.labeledNonLocalBreaks && !currentLoop.labeledNonLocalContinues) {
                        return;
                    }
                    write("switch(" + loopResultVariable + ") {");
                    increaseIndent();
                    emitDispatchEntriesForLabeledJumps(currentLoop.labeledNonLocalBreaks, /*isBreak*/ true, loopResultVariable, outerLoop);
                    emitDispatchEntriesForLabeledJumps(currentLoop.labeledNonLocalContinues, /*isBreak*/ false, loopResultVariable, outerLoop);
                    decreaseIndent();
                    writeLine();
                    write("}");
                }
                function emitDispatchEntriesForLabeledJumps(table, isBreak, loopResultVariable, outerLoop) {
                    if (!table) {
                        return;
                    }
                    for (var labelText in table) {
                        var labelMarker = table[labelText];
                        writeLine();
                        write("case \"" + labelMarker + "\": ");
                        // if there are no outer converted loop or outer label in question is located inside outer converted loop
                        // then emit labeled break\continue
                        // otherwise propagate pair 'label -> marker' to outer converted loop and emit 'return labelMarker' so outer loop can later decide what to do
                        if (!outerLoop || (outerLoop.labels && outerLoop.labels[labelText])) {
                            if (isBreak) {
                                write("break ");
                            }
                            else {
                                write("continue ");
                            }
                            write(labelText + ";");
                        }
                        else {
                            setLabeledJump(outerLoop, isBreak, labelText, labelMarker);
                            write("return " + loopResultVariable + ";");
                        }
                    }
                }
            }
            function emitForStatement(node) {
                emitLoop(node, emitForStatementWorker);
            }
            function emitForStatementWorker(node, loop) {
                var endPos = emitToken(106 /* for */, node.pos);
                write(" ");
                endPos = emitToken(42 /* openParen */, endPos);
                if (node.initializer && node.initializer.kind === 365 /* VariableDeclarationList */) {
                    var variableDeclarationList = node.initializer;
                    var startIsEmitted = tryEmitStartOfVariableDeclarationList(variableDeclarationList);
                    if (startIsEmitted) {
                        emitCommaList(variableDeclarationList.declarations);
                    }
                    else {
                        emitVariableDeclarationListSkippingUninitializedEntries(variableDeclarationList);
                    }
                }
                else if (node.initializer) {
                    emit(node.initializer);
                }
                write(";");
                emitOptional(" ", node.condition);
                write(";");
                emitOptional(" ", node.incrementor);
                write(")");
                if (loop) {
                    emitConvertedLoopCall(loop, /*emitAsBlock*/ true);
                }
                else {
                    emitNormalLoopBody(node, /*emitAsEmbeddedStatement*/ true);
                }
            }
            function emitForInOrForOfStatement(node) {
                if (languageVersion < 2 /* ES6 */ && node.kind === 354 /* ForOfStatement */) {
                    emitLoop(node, emitDownLevelForOfStatementWorker);
                }
                else {
                    emitLoop(node, emitForInOrForOfStatementWorker);
                }
            }
            function emitForInOrForOfStatementWorker(node, loop) {
                var endPos = emitToken(106 /* for */, node.pos);
                write(" ");
                endPos = emitToken(42 /* openParen */, endPos);
                if (node.initializer.kind === 365 /* VariableDeclarationList */) {
                    var variableDeclarationList = node.initializer;
                    if (variableDeclarationList.declarations.length >= 1) {
                        tryEmitStartOfVariableDeclarationList(variableDeclarationList);
                        emit(variableDeclarationList.declarations[0]);
                    }
                }
                else {
                    emit(node.initializer);
                }
                if (node.kind === 353 /* ForInStatement */) {
                    write(" in ");
                }
                else {
                    write(" of ");
                }
                emit(node.expression);
                emitToken(96 /* closeParen */, node.expression.end);
                if (loop) {
                    emitConvertedLoopCall(loop, /*emitAsBlock*/ true);
                }
                else {
                    emitNormalLoopBody(node, /*emitAsEmbeddedStatement*/ true);
                }
            }
            function emitDownLevelForOfStatementWorker(node, loop) {
                // The following ES6 code:
                //
                //    for (let v of expr) { }
                //
                // should be emitted as
                //
                //    for (let _i = 0, _a = expr; _i < _a.length; _i++) {
                //        let v = _a[_i];
                //    }
                //
                // where _a and _i are temps emitted to capture the RHS and the counter,
                // respectively.
                // When the left hand side is an expression instead of a let declaration,
                // the "let v" is not emitted.
                // When the left hand side is a let/const, the v is renamed if there is
                // another v in scope.
                // Note that all assignments to the LHS are emitted in the body, including
                // all destructuring.
                // Note also that because an extra statement is needed to assign to the LHS,
                // for-of bodies are always emitted as blocks.
                var endPos = emitToken(106 /* for */, node.pos);
                write(" ");
                endPos = emitToken(42 /* openParen */, endPos);
                // Do not emit the LHS let declaration yet, because it might contain destructuring.
                // Do not call recordTempDeclaration because we are declaring the temps
                // right here. Recording means they will be declared later.
                // In the case where the user wrote an identifier as the RHS, like this:
                //
                //     for (let v of arr) { }
                //
                // we can't reuse 'arr' because it might be modified within the body of the loop.
                var counter = createTempVariable(268435456 /* _i */);
                var rhsReference = ts.createSynthesizedNode(215 /* Identifier */);
                rhsReference.text = node.expression.kind === 215 /* Identifier */ ?
                    makeUniqueName(node.expression.text) :
                    makeTempVariableName(0 /* Auto */);
                // This is the let keyword for the counter and rhsReference. The let keyword for
                // the LHS will be emitted inside the body.
                emitStart(node.expression);
                write("var ");
                // _i = 0
                emitNodeWithoutSourceMap(counter);
                write(" = 0");
                emitEnd(node.expression);
                // , _a = expr
                write(", ");
                emitStart(node.expression);
                emitNodeWithoutSourceMap(rhsReference);
                write(" = ");
                emitNodeWithoutSourceMap(node.expression);
                emitEnd(node.expression);
                write("; ");
                // _i < _a.length;
                emitStart(node.expression);
                emitNodeWithoutSourceMap(counter);
                write(" < ");
                emitNodeWithCommentsAndWithoutSourcemap(rhsReference);
                write(".length");
                emitEnd(node.expression);
                write("; ");
                // _i++)
                emitStart(node.expression);
                emitNodeWithoutSourceMap(counter);
                write("++");
                emitEnd(node.expression);
                emitToken(96 /* closeParen */, node.expression.end);
                // Body
                write(" {");
                writeLine();
                increaseIndent();
                // Initialize LHS
                // let v = _a[_i];
                var rhsIterationValue = createElementAccessExpression(rhsReference, counter);
                emitStart(node.initializer);
                if (node.initializer.kind === 365 /* VariableDeclarationList */) {
                    write("var ");
                    var variableDeclarationList = node.initializer;
                    if (variableDeclarationList.declarations.length > 0) {
                        var declaration = variableDeclarationList.declarations[0];
                        if (ts.isBindingPattern(declaration.name)) {
                            // This works whether the declaration is a var, let, or const.
                            // It will use rhsIterationValue _a[_i] as the initializer.
                            emitDestructuring(declaration, /*isAssignmentExpressionStatement*/ false, rhsIterationValue);
                        }
                        else {
                            // The following call does not include the initializer, so we have
                            // to emit it separately.
                            emitNodeWithCommentsAndWithoutSourcemap(declaration);
                            write(" = ");
                            emitNodeWithoutSourceMap(rhsIterationValue);
                        }
                    }
                    else {
                        // It's an empty declaration list. This can only happen in an error case, if the user wrote
                        //     for (let of []) {}
                        emitNodeWithoutSourceMap(createTempVariable(0 /* Auto */));
                        write(" = ");
                        emitNodeWithoutSourceMap(rhsIterationValue);
                    }
                }
                else {
                    // Initializer is an expression. Emit the expression in the body, so that it's
                    // evaluated on every iteration.
                    var assignmentExpression = createBinaryExpression(node.initializer, 77 /* equals */, rhsIterationValue, /*startsOnNewLine*/ false);
                    if (node.initializer.kind === 316 /* ArrayLiteralExpression */ || node.initializer.kind === 317 /* ObjectLiteralExpression */) {
                        // This is a destructuring pattern, so call emitDestructuring instead of emit. Calling emit will not work, because it will cause
                        // the BinaryExpression to be passed in instead of the expression statement, which will cause emitDestructuring to crash.
                        emitDestructuring(assignmentExpression, /*isAssignmentExpressionStatement*/ true, /*value*/ undefined);
                    }
                    else {
                        emitNodeWithCommentsAndWithoutSourcemap(assignmentExpression);
                    }
                }
                emitEnd(node.initializer);
                write(";");
                if (loop) {
                    writeLine();
                    emitConvertedLoopCall(loop, /*emitAsBlock*/ false);
                }
                else {
                    emitNormalLoopBody(node, /*emitAsEmbeddedStatement*/ false);
                }
                writeLine();
                decreaseIndent();
                write("}");
            }
            function emitBreakOrContinueStatement(node) {
                if (convertedLoopState) {
                    // check if we can emit break\continue as is
                    // it is possible if either
                    //   - break\continue is statement labeled and label is located inside the converted loop
                    //   - break\continue is non-labeled and located in non-converted loop\switch statement
                    var jump = node.kind === 356 /* BreakStatement */ ? 2 /* Break */ : 4 /* Continue */;
                    var canUseBreakOrContinue = (node.label && convertedLoopState.labels && convertedLoopState.labels[node.label.text]) ||
                        (!node.label && (convertedLoopState.allowedNonLabeledJumps & jump));
                    if (!canUseBreakOrContinue) {
                        write("return ");
                        // explicit exit from loop -> copy out parameters
                        copyLoopOutParameters(convertedLoopState, 1 /* ToOutParameter */, /*emitAsStatements*/ false);
                        if (!node.label) {
                            if (node.kind === 356 /* BreakStatement */) {
                                convertedLoopState.nonLocalJumps |= 2 /* Break */;
                                write("\"break\";");
                            }
                            else {
                                convertedLoopState.nonLocalJumps |= 4 /* Continue */;
                                // note: return value is emitted only to simplify debugging, call to converted loop body does not do any dispatching on it.
                                write("\"continue\";");
                            }
                        }
                        else {
                            var labelMarker = void 0;
                            if (node.kind === 356 /* BreakStatement */) {
                                labelMarker = "break-" + node.label.text;
                                setLabeledJump(convertedLoopState, /*isBreak*/ true, node.label.text, labelMarker);
                            }
                            else {
                                labelMarker = "continue-" + node.label.text;
                                setLabeledJump(convertedLoopState, /*isBreak*/ false, node.label.text, labelMarker);
                            }
                            write("\"" + labelMarker + "\";");
                        }
                        return;
                    }
                }
                emitToken(node.kind === 356 /* BreakStatement */ ? 110 /* break */ : 109 /* continue */, node.pos);
                emitOptional(" ", node.label);
                write(";");
            }
            function emitReturnStatement(node) {
                if (convertedLoopState) {
                    convertedLoopState.nonLocalJumps |= 8 /* Return */;
                    write("return { value: ");
                    if (node.expression) {
                        emit(node.expression);
                    }
                    else {
                        write("void 0");
                    }
                    write(" };");
                    return;
                }
                emitToken(111 /* return */, node.pos);
                emitOptional(" ", node.expression);
                write(";");
            }
            function emitWithStatement(node) {
                write("with (");
                emit(node.expression);
                write(")");
                emitEmbeddedStatement(node.statement);
            }
            function emitSwitchStatement(node) {
                var endPos = emitToken(105 /* switch */, node.pos);
                write(" ");
                emitToken(42 /* openParen */, endPos);
                emit(node.expression);
                endPos = emitToken(96 /* closeParen */, node.expression.end);
                write(" ");
                var saveAllowedNonLabeledJumps;
                if (convertedLoopState) {
                    saveAllowedNonLabeledJumps = convertedLoopState.allowedNonLabeledJumps;
                    // for switch statement allow only non-labeled break
                    convertedLoopState.allowedNonLabeledJumps |= 2 /* Break */;
                }
                emitCaseBlock(node.caseBlock, endPos);
                if (convertedLoopState) {
                    convertedLoopState.allowedNonLabeledJumps = saveAllowedNonLabeledJumps;
                }
            }
            function emitCaseBlock(node, startPos) {
                emitToken(31 /* openBrace */, startPos);
                increaseIndent();
                emitLines(node.clauses);
                decreaseIndent();
                writeLine();
                emitToken(98 /* closeBrace */, node.clauses.end);
            }
            function nodeStartPositionsAreOnSameLine(node1, node2) {
                return ts.getLineOfLocalPositionFromLineMap(currentLineMap, ts.skipTrivia(currentText, node1.pos)) ===
                    ts.getLineOfLocalPositionFromLineMap(currentLineMap, ts.skipTrivia(currentText, node2.pos));
            }
            function nodeEndPositionsAreOnSameLine(node1, node2) {
                return ts.getLineOfLocalPositionFromLineMap(currentLineMap, node1.end) ===
                    ts.getLineOfLocalPositionFromLineMap(currentLineMap, node2.end);
            }
            function nodeEndIsOnSameLineAsNodeStart(node1, node2) {
                return ts.getLineOfLocalPositionFromLineMap(currentLineMap, node1.end) ===
                    ts.getLineOfLocalPositionFromLineMap(currentLineMap, ts.skipTrivia(currentText, node2.pos));
            }
            function emitCaseOrDefaultClause(node) {
                if (node.kind === 395 /* CaseClause */) {
                    write("case ");
                    emit(node.expression);
                    write(":");
                }
                else {
                    write("default:");
                }
                if (node.statements.length === 1 && nodeStartPositionsAreOnSameLine(node, node.statements[0])) {
                    write(" ");
                    emit(node.statements[0]);
                }
                else {
                    increaseIndent();
                    emitLines(node.statements);
                    decreaseIndent();
                }
            }
            function emitThrowStatement(node) {
                write("throw ");
                emit(node.expression);
                write(";");
            }
            function emitTryStatement(node) {
                write("try ");
                emit(node.tryBlock);
                emit(node.catchClause);
                if (node.finallyBlock) {
                    writeLine();
                    write("finally ");
                    emit(node.finallyBlock);
                }
            }
            function emitCatchClause(node) {
                writeLine();
                var endPos = emitToken(128 /* catch */, node.pos);
                write(" ");
                emitToken(42 /* openParen */, endPos);
                emit(node.variableDeclaration);
                emitToken(96 /* closeParen */, node.variableDeclaration ? node.variableDeclaration.end : endPos);
                write(" ");
                emitBlock(node.block);
            }
            function emitDebuggerStatement(node) {
                emitToken(117 /* debugger */, node.pos);
                write(";");
            }
            function emitLabelAndColon(node) {
                emit(node.label);
                write(": ");
            }
            function emitLabeledStatement(node) {
                if (!ts.isIterationStatement(node.statement, /* lookInLabeledStatements */ false) || !shouldConvertLoopBody(node.statement)) {
                    emitLabelAndColon(node);
                }
                if (convertedLoopState) {
                    if (!convertedLoopState.labels) {
                        convertedLoopState.labels = {};
                    }
                    convertedLoopState.labels[node.label.text] = node.label.text;
                }
                emit(node.statement);
                if (convertedLoopState) {
                    convertedLoopState.labels[node.label.text] = undefined;
                }
            }
            function getContainingModule(node) {
                do {
                    node = node.parent;
                } while (node && node.kind !== 371 /* ModuleDeclaration */);
                return node;
            }
            function emitContainingModuleName(node) {
                var container = getContainingModule(node);
                write(container ? getGeneratedNameForNode(container) : "exports");
            }
            function emitModuleMemberName(node) {
                emitStart(node.name);
                if (ts.getCombinedNodeFlags(node) & 1 /* Export */) {
                    var container = getContainingModule(node);
                    if (container) {
                        write(getGeneratedNameForNode(container));
                        write(".");
                    }
                    else if (modulekind !== ts.ModuleKind.ES6 && modulekind !== ts.ModuleKind.System) {
                        write("exports.");
                    }
                }
                emitNodeWithCommentsAndWithoutSourcemap(node.name);
                emitEnd(node.name);
            }
            function createVoidZero() {
                var zero = ts.createSynthesizedNode(154 /* NumericLiteral */);
                zero.text = "0";
                var result = ts.createSynthesizedNode(329 /* VoidExpression */);
                result.expression = zero;
                return result;
            }
            function emitEs6ExportDefaultCompat(node) {
                if (node.parent.kind === 402 /* SourceFile */) {
                    ts.Debug.assert(!!(node.flags & 512 /* Default */) || node.kind === 381 /* ExportAssignment */);
                    // only allow export default at a source file level
                    if (modulekind === ts.ModuleKind.CommonJS || modulekind === ts.ModuleKind.AMD || modulekind === ts.ModuleKind.UMD) {
                        if (!isEs6Module) {
                            if (languageVersion !== 0 /* ES3 */) {
                                // default value of configurable, enumerable, writable are `false`.
                                write('Object.defineProperty(exports, "__esModule", { value: true });');
                                writeLine();
                            }
                            else {
                                write("exports.__esModule = true;");
                                writeLine();
                            }
                        }
                    }
                }
            }
            function emitExportMemberAssignment(node) {
                if (node.flags & 1 /* Export */) {
                    writeLine();
                    emitStart(node);
                    // emit call to exporter only for top level nodes
                    if (modulekind === ts.ModuleKind.System && node.parent === currentSourceFile) {
                        // emit export default <smth> as
                        // export("default", <smth>)
                        write(exportFunctionForFile + "(\"");
                        if (node.flags & 512 /* Default */) {
                            write("default");
                        }
                        else {
                            emitNodeWithCommentsAndWithoutSourcemap(node.name);
                        }
                        write("\", ");
                        emitDeclarationName(node);
                        write(")");
                    }
                    else {
                        if (node.flags & 512 /* Default */) {
                            emitEs6ExportDefaultCompat(node);
                            if (languageVersion === 0 /* ES3 */) {
                                write('exports["default"]');
                            }
                            else {
                                write("exports.default");
                            }
                        }
                        else {
                            emitModuleMemberName(node);
                        }
                        write(" = ");
                        emitDeclarationName(node);
                    }
                    emitEnd(node);
                    write(";");
                }
            }
            function emitExportMemberAssignments(name) {
                if (modulekind === ts.ModuleKind.System) {
                    return;
                }
                if (!exportEquals && exportSpecifiers && ts.hasProperty(exportSpecifiers, name.text)) {
                    for (var _a = 0, _b = exportSpecifiers[name.text]; _a < _b.length; _a++) {
                        var specifier = _b[_a];
                        writeLine();
                        emitStart(specifier.name);
                        emitContainingModuleName(specifier);
                        write(".");
                        emitNodeWithCommentsAndWithoutSourcemap(specifier.name);
                        emitEnd(specifier.name);
                        write(" = ");
                        emitExpressionIdentifier(name);
                        write(";");
                    }
                }
            }
            function emitExportSpecifierInSystemModule(specifier) {
                ts.Debug.assert(modulekind === ts.ModuleKind.System);
                if (!resolver.getReferencedValueDeclaration(specifier.propertyName || specifier.name) && !resolver.isValueAliasDeclaration(specifier)) {
                    return;
                }
                writeLine();
                emitStart(specifier.name);
                write(exportFunctionForFile + "(\"");
                emitNodeWithCommentsAndWithoutSourcemap(specifier.name);
                write("\", ");
                emitExpressionIdentifier(specifier.propertyName || specifier.name);
                write(")");
                emitEnd(specifier.name);
                write(";");
            }
            /**
             * Emit an assignment to a given identifier, 'name', with a given expression, 'value'.
             * @param name an identifier as a left-hand-side operand of the assignment
             * @param value an expression as a right-hand-side operand of the assignment
             * @param shouldEmitCommaBeforeAssignment a boolean indicating whether to prefix an assignment with comma
             */
            function emitAssignment(name, value, shouldEmitCommaBeforeAssignment, nodeForSourceMap) {
                if (shouldEmitCommaBeforeAssignment) {
                    write(", ");
                }
                var exportChanged = isNameOfExportedSourceLevelDeclarationInSystemExternalModule(name);
                if (exportChanged) {
                    write(exportFunctionForFile + "(\"");
                    emitNodeWithCommentsAndWithoutSourcemap(name);
                    write("\", ");
                }
                var isVariableDeclarationOrBindingElement = name.parent && (name.parent.kind === 364 /* VariableDeclaration */ || name.parent.kind === 315 /* BindingElement */);
                // If this is first var declaration, we need to start at var/let/const keyword instead
                // otherwise use nodeForSourceMap as the start position
                emitStart(isFirstVariableDeclaration(nodeForSourceMap) ? nodeForSourceMap.parent : nodeForSourceMap);
                withTemporaryNoSourceMap(function () {
                    if (isVariableDeclarationOrBindingElement) {
                        emitModuleMemberName(name.parent);
                    }
                    else {
                        emit(name);
                    }
                    write(" = ");
                    emit(value);
                });
                emitEnd(nodeForSourceMap, /*stopOverridingSpan*/ true);
                if (exportChanged) {
                    write(")");
                }
            }
            /**
             * Create temporary variable, emit an assignment of the variable the given expression
             * @param expression an expression to assign to the newly created temporary variable
             * @param canDefineTempVariablesInPlace a boolean indicating whether you can define the temporary variable at an assignment location
             * @param shouldEmitCommaBeforeAssignment a boolean indicating whether an assignment should prefix with comma
             */
            function emitTempVariableAssignment(expression, canDefineTempVariablesInPlace, shouldEmitCommaBeforeAssignment, sourceMapNode) {
                var identifier = createTempVariable(0 /* Auto */);
                if (!canDefineTempVariablesInPlace) {
                    recordTempDeclaration(identifier);
                }
                emitAssignment(identifier, expression, shouldEmitCommaBeforeAssignment, sourceMapNode || expression.parent);
                return identifier;
            }
            function isFirstVariableDeclaration(root) {
                return root.kind === 364 /* VariableDeclaration */ &&
                    root.parent.kind === 365 /* VariableDeclarationList */ &&
                    root.parent.declarations[0] === root;
            }
            function emitDestructuring(root, isAssignmentExpressionStatement, value) {
                var emitCount = 0;
                // An exported declaration is actually emitted as an assignment (to a property on the module object), so
                // temporary variables in an exported declaration need to have real declarations elsewhere
                // Also temporary variables should be explicitly allocated for source level declarations when module target is system
                // because actual variable declarations are hoisted
                var canDefineTempVariablesInPlace = false;
                if (root.kind === 364 /* VariableDeclaration */) {
                    var isExported = ts.getCombinedNodeFlags(root) & 1 /* Export */;
                    var isSourceLevelForSystemModuleKind = shouldHoistDeclarationInSystemJsModule(root);
                    canDefineTempVariablesInPlace = !isExported && !isSourceLevelForSystemModuleKind;
                }
                else if (root.kind === 288 /* Parameter */) {
                    canDefineTempVariablesInPlace = true;
                }
                if (root.kind === 333 /* BinaryExpression */) {
                    emitAssignmentExpression(root);
                }
                else {
                    ts.Debug.assert(!isAssignmentExpressionStatement);
                    // If first variable declaration of variable statement correct the start location
                    if (isFirstVariableDeclaration(root)) {
                        // Use emit location of "var " as next emit start entry
                        sourceMap.changeEmitSourcePos();
                    }
                    emitBindingElement(root, value);
                }
                /**
                 * Ensures that there exists a declared identifier whose value holds the given expression.
                 * This function is useful to ensure that the expression's value can be read from in subsequent expressions.
                 * Unless 'reuseIdentifierExpressions' is false, 'expr' will be returned if it is just an identifier.
                 *
                 * @param expr the expression whose value needs to be bound.
                 * @param reuseIdentifierExpressions true if identifier expressions can simply be returned;
                 *                                   false if it is necessary to always emit an identifier.
                 */
                function ensureIdentifier(expr, reuseIdentifierExpressions, sourceMapNode) {
                    if (expr.kind === 215 /* Identifier */ && reuseIdentifierExpressions) {
                        return expr;
                    }
                    var identifier = emitTempVariableAssignment(expr, canDefineTempVariablesInPlace, emitCount > 0, sourceMapNode);
                    emitCount++;
                    return identifier;
                }
                function createDefaultValueCheck(value, defaultValue, sourceMapNode) {
                    // The value expression will be evaluated twice, so for anything but a simple identifier
                    // we need to generate a temporary variable
                    // If the temporary variable needs to be emitted use the source Map node for assignment of that statement
                    value = ensureIdentifier(value, /*reuseIdentifierExpressions*/ true, sourceMapNode);
                    // Return the expression 'value === void 0 ? defaultValue : value'
                    var equals = ts.createSynthesizedNode(333 /* BinaryExpression */);
                    equals.left = value;
                    equals.operatorToken = ts.createSynthesizedNode(66 /* equalsEqualsEquals */);
                    equals.right = createVoidZero();
                    return createConditionalExpression(equals, defaultValue, value);
                }
                function createConditionalExpression(condition, whenTrue, whenFalse) {
                    var cond = ts.createSynthesizedNode(334 /* ConditionalExpression */);
                    cond.condition = condition;
                    cond.questionToken = ts.createSynthesizedNode(91 /* question */);
                    cond.whenTrue = whenTrue;
                    cond.colonToken = ts.createSynthesizedNode(99 /* colon */);
                    cond.whenFalse = whenFalse;
                    return cond;
                }
                function createNumericLiteral(value) {
                    var node = ts.createSynthesizedNode(154 /* NumericLiteral */);
                    node.text = "" + value;
                    return node;
                }
                function createPropertyAccessForDestructuringProperty(object, propName) {
                    var index;
                    var nameIsComputed = propName.kind === 286 /* ComputedPropertyName */;
                    if (nameIsComputed) {
                        // TODO to handle when we look into sourcemaps for computed properties, for now use propName
                        index = ensureIdentifier(propName.expression, /*reuseIdentifierExpressions*/ false, propName);
                    }
                    else {
                        // We create a synthetic copy of the identifier in order to avoid the rewriting that might
                        // otherwise occur when the identifier is emitted.
                        index = ts.createSynthesizedNode(propName.kind);
                        // We need to unescape identifier here because when parsing an identifier prefixing with "__"
                        // the parser need to append "_" in order to escape colliding with magic identifiers such as "__proto__"
                        // Therefore, in order to correctly emit identifiers that are written in original TypeScript file,
                        // we will unescapeIdentifier to remove additional underscore (if no underscore is added, the function will return original input string)
                        index.text = ts.unescapeIdentifier(propName.text);
                    }
                    return !nameIsComputed && index.kind === 215 /* Identifier */
                        ? createPropertyAccessExpression(object, index)
                        : createElementAccessExpression(object, index);
                }
                function createSliceCall(value, sliceIndex) {
                    var call = ts.createSynthesizedNode(320 /* CallExpression */);
                    var sliceIdentifier = ts.createSynthesizedNode(215 /* Identifier */);
                    sliceIdentifier.text = "slice";
                    call.expression = createPropertyAccessExpression(value, sliceIdentifier);
                    call.arguments = ts.createSynthesizedNodeArray();
                    call.arguments[0] = createNumericLiteral(sliceIndex);
                    return call;
                }
                function emitObjectLiteralAssignment(target, value, sourceMapNode) {
                    var properties = target.properties;
                    if (properties.length !== 1) {
                        // For anything but a single element destructuring we need to generate a temporary
                        // to ensure value is evaluated exactly once.
                        // When doing so we want to highlight the passed in source map node since thats the one needing this temp assignment
                        value = ensureIdentifier(value, /*reuseIdentifierExpressions*/ true, sourceMapNode);
                    }
                    for (var _a = 0, properties_1 = properties; _a < properties_1.length; _a++) {
                        var p = properties_1[_a];
                        if (p.kind === 399 /* PropertyAssignment */ || p.kind === 400 /* ShorthandPropertyAssignment */) {
                            var propName = p.name;
                            var target_1 = p.kind === 400 /* ShorthandPropertyAssignment */ ? p : p.initializer || propName;
                            // Assignment for target = value.propName should highlight whole property, hence use p as source map node
                            emitDestructuringAssignment(target_1, createPropertyAccessForDestructuringProperty(value, propName), p);
                        }
                    }
                }
                function emitArrayLiteralAssignment(target, value, sourceMapNode) {
                    var elements = target.elements;
                    if (elements.length !== 1) {
                        // For anything but a single element destructuring we need to generate a temporary
                        // to ensure value is evaluated exactly once.
                        // When doing so we want to highlight the passed in source map node since thats the one needing this temp assignment
                        value = ensureIdentifier(value, /*reuseIdentifierExpressions*/ true, sourceMapNode);
                    }
                    for (var i = 0; i < elements.length; i++) {
                        var e = elements[i];
                        if (e.kind !== 339 /* OmittedExpression */) {
                            // Assignment for target = value.propName should highlight whole property, hence use e as source map node
                            if (e.kind !== 337 /* SpreadElementExpression */) {
                                emitDestructuringAssignment(e, createElementAccessExpression(value, createNumericLiteral(i)), e);
                            }
                            else if (i === elements.length - 1) {
                                emitDestructuringAssignment(e.expression, createSliceCall(value, i), e);
                            }
                        }
                    }
                }
                function emitDestructuringAssignment(target, value, sourceMapNode) {
                    // When emitting target = value use source map node to highlight, including any temporary assignments needed for this
                    if (target.kind === 400 /* ShorthandPropertyAssignment */) {
                        if (target.objectAssignmentInitializer) {
                            value = createDefaultValueCheck(value, target.objectAssignmentInitializer, sourceMapNode);
                        }
                        target = target.name;
                    }
                    else if (target.kind === 333 /* BinaryExpression */ && target.operatorToken.kind === 77 /* equals */) {
                        value = createDefaultValueCheck(value, target.right, sourceMapNode);
                        target = target.left;
                    }
                    if (target.kind === 317 /* ObjectLiteralExpression */) {
                        emitObjectLiteralAssignment(target, value, sourceMapNode);
                    }
                    else if (target.kind === 316 /* ArrayLiteralExpression */) {
                        emitArrayLiteralAssignment(target, value, sourceMapNode);
                    }
                    else {
                        emitAssignment(target, value, /*shouldEmitCommaBeforeAssignment*/ emitCount > 0, sourceMapNode);
                        emitCount++;
                    }
                }
                function emitAssignmentExpression(root) {
                    var target = root.left;
                    var value = root.right;
                    if (ts.isEmptyObjectLiteralOrArrayLiteral(target)) {
                        emit(value);
                    }
                    else if (isAssignmentExpressionStatement) {
                        // Source map node for root.left = root.right is root
                        // but if root is synthetic, which could be in below case, use the target which is { a }
                        // for ({a} of {a: string}) {
                        // }
                        emitDestructuringAssignment(target, value, ts.nodeIsSynthesized(root) ? target : root);
                    }
                    else {
                        if (root.parent.kind !== 324 /* ParenthesizedExpression */) {
                            write("(");
                        }
                        // Temporary assignment needed to emit root should highlight whole binary expression
                        value = ensureIdentifier(value, /*reuseIdentifierExpressions*/ true, root);
                        // Source map node for root.left = root.right is root
                        emitDestructuringAssignment(target, value, root);
                        write(", ");
                        emit(value);
                        if (root.parent.kind !== 324 /* ParenthesizedExpression */) {
                            write(")");
                        }
                    }
                }
                function emitBindingElement(target, value) {
                    // Any temporary assignments needed to emit target = value should point to target
                    if (target.initializer) {
                        // Combine value and initializer
                        value = value ? createDefaultValueCheck(value, target.initializer, target) : target.initializer;
                    }
                    else if (!value) {
                        // Use 'void 0' in absence of value and initializer
                        value = createVoidZero();
                    }
                    if (ts.isBindingPattern(target.name)) {
                        var pattern = target.name;
                        var elements = pattern.elements;
                        var numElements = elements.length;
                        if (numElements !== 1) {
                            // For anything other than a single-element destructuring we need to generate a temporary
                            // to ensure value is evaluated exactly once. Additionally, if we have zero elements
                            // we need to emit *something* to ensure that in case a 'var' keyword was already emitted,
                            // so in that case, we'll intentionally create that temporary.
                            value = ensureIdentifier(value, /*reuseIdentifierExpressions*/ numElements !== 0, target);
                        }
                        for (var i = 0; i < numElements; i++) {
                            var element = elements[i];
                            if (pattern.kind === 313 /* ObjectBindingPattern */) {
                                // Rewrite element to a declaration with an initializer that fetches property
                                var propName = element.propertyName || element.name;
                                emitBindingElement(element, createPropertyAccessForDestructuringProperty(value, propName));
                            }
                            else if (element.kind !== 339 /* OmittedExpression */) {
                                if (!element.dotDotDotToken) {
                                    // Rewrite element to a declaration that accesses array element at index i
                                    emitBindingElement(element, createElementAccessExpression(value, createNumericLiteral(i)));
                                }
                                else if (i === numElements - 1) {
                                    emitBindingElement(element, createSliceCall(value, i));
                                }
                            }
                        }
                    }
                    else {
                        emitAssignment(target.name, value, /*shouldEmitCommaBeforeAssignment*/ emitCount > 0, target);
                        emitCount++;
                    }
                }
            }
            function emitVariableDeclaration(node) {
                if (ts.isBindingPattern(node.name)) {
                    var isExported = ts.getCombinedNodeFlags(node) & 1 /* Export */;
                    if (languageVersion >= 2 /* ES6 */ && (!isExported || modulekind === ts.ModuleKind.ES6)) {
                        // emit ES6 destructuring only if target module is ES6 or variable is not exported
                        // exported variables in CJS/AMD are prefixed with 'exports.' so result javascript { exports.toString } = 1; is illegal
                        var isTopLevelDeclarationInSystemModule = modulekind === ts.ModuleKind.System &&
                            shouldHoistVariable(node, /*checkIfSourceFileLevelDecl*/ true);
                        if (isTopLevelDeclarationInSystemModule) {
                            // In System modules top level variables are hoisted
                            // so variable declarations with destructuring are turned into destructuring assignments.
                            // As a result, they will need parentheses to disambiguate object binding assignments from blocks.
                            write("(");
                        }
                        emit(node.name);
                        emitOptional(" = ", node.initializer);
                        if (isTopLevelDeclarationInSystemModule) {
                            write(")");
                        }
                    }
                    else {
                        emitDestructuring(node, /*isAssignmentExpressionStatement*/ false);
                    }
                }
                else {
                    var initializer = node.initializer;
                    if (!initializer &&
                        languageVersion < 2 /* ES6 */ &&
                        // for names - binding patterns that lack initializer there is no point to emit explicit initializer
                        // since downlevel codegen for destructuring will fail in the absence of initializer so all binding elements will say uninitialized
                        node.name.kind === 215 /* Identifier */) {
                        var container = ts.getEnclosingBlockScopeContainer(node);
                        var flags = resolver.getNodeCheckFlags(node);
                        // nested let bindings might need to be initialized explicitly to preserve ES6 semantic
                        // { let x = 1; }
                        // { let x; } // x here should be undefined. not 1
                        // NOTES:
                        // Top level bindings never collide with anything and thus don't require explicit initialization.
                        // As for nested let bindings there are two cases:
                        // - nested let bindings that were not renamed definitely should be initialized explicitly
                        //   { let x = 1; }
                        //   { let x; if (some-condition) { x = 1}; if (x) { /*1*/ } }
                        //   Without explicit initialization code in /*1*/ can be executed even if some-condition is evaluated to false
                        // - renaming introduces fresh name that should not collide with any existing names, however renamed bindings sometimes also should be
                        //   explicitly initialized. One particular case: non-captured binding declared inside loop body (but not in loop initializer)
                        //   let x;
                        //   for (;;) {
                        //       let x;
                        //   }
                        //   in downlevel codegen inner 'x' will be renamed so it won't collide with outer 'x' however it will should be reset on every iteration
                        //   as if it was declared anew.
                        //   * Why non-captured binding - because if loop contains block scoped binding captured in some function then loop body will be rewritten
                        //   to have a fresh scope on every iteration so everything will just work.
                        //   * Why loop initializer is excluded - since we've introduced a fresh name it already will be undefined.
                        var isCapturedInFunction = flags & 131072 /* CapturedBlockScopedBinding */;
                        var isDeclaredInLoop = flags & 262144 /* BlockScopedBindingInLoop */;
                        var emittedAsTopLevel = ts.isBlockScopedContainerTopLevel(container) ||
                            (isCapturedInFunction && isDeclaredInLoop && container.kind === 345 /* Block */ && ts.isIterationStatement(container.parent, /*lookInLabeledStatements*/ false));
                        var emittedAsNestedLetDeclaration = ts.getCombinedNodeFlags(node) & 1024 /* Let */ &&
                            !emittedAsTopLevel;
                        var emitExplicitInitializer = emittedAsNestedLetDeclaration &&
                            container.kind !== 353 /* ForInStatement */ &&
                            container.kind !== 354 /* ForOfStatement */ &&
                            (!resolver.isDeclarationWithCollidingName(node) ||
                                (isDeclaredInLoop && !isCapturedInFunction && !ts.isIterationStatement(container, /*lookInLabeledStatements*/ false)));
                        if (emitExplicitInitializer) {
                            initializer = createVoidZero();
                        }
                    }
                    var exportChanged = isNameOfExportedSourceLevelDeclarationInSystemExternalModule(node.name);
                    if (exportChanged) {
                        write(exportFunctionForFile + "(\"");
                        emitNodeWithCommentsAndWithoutSourcemap(node.name);
                        write("\", ");
                    }
                    emitModuleMemberName(node);
                    emitOptional(" = ", initializer);
                    if (exportChanged) {
                        write(")");
                    }
                }
            }
            function emitExportVariableAssignments(node) {
                if (node.kind === 339 /* OmittedExpression */) {
                    return;
                }
                var name = node.name;
                if (name.kind === 215 /* Identifier */) {
                    emitExportMemberAssignments(name);
                }
                else if (ts.isBindingPattern(name)) {
                    ts.forEach(name.elements, emitExportVariableAssignments);
                }
            }
            function isES6ExportedDeclaration(node) {
                return !!(node.flags & 1 /* Export */) &&
                    modulekind === ts.ModuleKind.ES6 &&
                    node.parent.kind === 402 /* SourceFile */;
            }
            function emitVariableStatement(node) {
                var startIsEmitted = false;
                if (node.flags & 1 /* Export */) {
                    if (isES6ExportedDeclaration(node)) {
                        // Exported ES6 module member
                        write("export ");
                        startIsEmitted = tryEmitStartOfVariableDeclarationList(node.declarationList);
                    }
                }
                else {
                    startIsEmitted = tryEmitStartOfVariableDeclarationList(node.declarationList);
                }
                if (startIsEmitted) {
                    emitCommaList(node.declarationList.declarations);
                    write(";");
                }
                else {
                    var atLeastOneItem = emitVariableDeclarationListSkippingUninitializedEntries(node.declarationList);
                    if (atLeastOneItem) {
                        write(";");
                    }
                }
                if (modulekind !== ts.ModuleKind.ES6 && node.parent === currentSourceFile) {
                    ts.forEach(node.declarationList.declarations, emitExportVariableAssignments);
                }
            }
            function shouldEmitLeadingAndTrailingCommentsForVariableStatement(node) {
                // If we're not exporting the variables, there's nothing special here.
                // Always emit comments for these nodes.
                if (!(node.flags & 1 /* Export */)) {
                    return true;
                }
                // If we are exporting, but it's a top-level ES6 module exports,
                // we'll emit the declaration list verbatim, so emit comments too.
                if (isES6ExportedDeclaration(node)) {
                    return true;
                }
                // Otherwise, only emit if we have at least one initializer present.
                for (var _a = 0, _b = node.declarationList.declarations; _a < _b.length; _a++) {
                    var declaration = _b[_a];
                    if (declaration.initializer) {
                        return true;
                    }
                }
                return false;
            }
            function emitParameter(node) {
                if (languageVersion < 2 /* ES6 */) {
                    if (ts.isBindingPattern(node.name)) {
                        var name_6 = createTempVariable(0 /* Auto */);
                        if (!tempParameters) {
                            tempParameters = [];
                        }
                        tempParameters.push(name_6);
                        emit(name_6);
                    }
                    else {
                        emit(node.name);
                    }
                }
                else {
                    if (node.dotDotDotToken) {
                        write("...");
                    }
                    emit(node.name);
                    emitOptional(" = ", node.initializer);
                }
            }
            function emitDefaultValueAssignments(node) {
                if (languageVersion < 2 /* ES6 */) {
                    var tempIndex_1 = 0;
                    ts.forEach(node.parameters, function (parameter) {
                        // A rest parameter cannot have a binding pattern or an initializer,
                        // so let's just ignore it.
                        if (parameter.dotDotDotToken) {
                            return;
                        }
                        var paramName = parameter.name, initializer = parameter.initializer;
                        if (ts.isBindingPattern(paramName)) {
                            // In cases where a binding pattern is simply '[]' or '{}',
                            // we usually don't want to emit a var declaration; however, in the presence
                            // of an initializer, we must emit that expression to preserve side effects.
                            var hasBindingElements = paramName.elements.length > 0;
                            if (hasBindingElements || initializer) {
                                writeLine();
                                write("var ");
                                if (hasBindingElements) {
                                    emitDestructuring(parameter, /*isAssignmentExpressionStatement*/ false, tempParameters[tempIndex_1]);
                                }
                                else {
                                    emit(tempParameters[tempIndex_1]);
                                    write(" = ");
                                    emit(initializer);
                                }
                                write(";");
                            }
                            // Regardless of whether we will emit a var declaration for the binding pattern, we generate the temporary
                            // variable for the parameter (see: emitParameter)
                            tempIndex_1++;
                        }
                        else if (initializer) {
                            writeLine();
                            emitStart(parameter);
                            write("if (");
                            emitNodeWithoutSourceMap(paramName);
                            write(" === void 0)");
                            emitEnd(parameter);
                            write(" { ");
                            emitStart(parameter);
                            emitNodeWithCommentsAndWithoutSourcemap(paramName);
                            write(" = ");
                            emitNodeWithCommentsAndWithoutSourcemap(initializer);
                            emitEnd(parameter);
                            write("; }");
                        }
                    });
                }
            }
            function emitRestParameter(node) {
                if (languageVersion < 2 /* ES6 */ && ts.hasDeclaredRestParameter(node)) {
                    var restIndex = node.parameters.length - 1;
                    var restParam = node.parameters[restIndex];
                    // A rest parameter cannot have a binding pattern, so let's just ignore it if it does.
                    if (ts.isBindingPattern(restParam.name)) {
                        return;
                    }
                    var tempName = createTempVariable(268435456 /* _i */).text;
                    writeLine();
                    emitLeadingComments(restParam);
                    emitStart(restParam);
                    write("var ");
                    emitNodeWithCommentsAndWithoutSourcemap(restParam.name);
                    write(" = [];");
                    emitEnd(restParam);
                    emitTrailingComments(restParam);
                    writeLine();
                    write("for (");
                    emitStart(restParam);
                    write("var " + tempName + " = " + restIndex + ";");
                    emitEnd(restParam);
                    write(" ");
                    emitStart(restParam);
                    write(tempName + " < arguments.length;");
                    emitEnd(restParam);
                    write(" ");
                    emitStart(restParam);
                    write(tempName + "++");
                    emitEnd(restParam);
                    write(") {");
                    increaseIndent();
                    writeLine();
                    emitStart(restParam);
                    emitNodeWithCommentsAndWithoutSourcemap(restParam.name);
                    write("[" + tempName + " - " + restIndex + "] = arguments[" + tempName + "];");
                    emitEnd(restParam);
                    decreaseIndent();
                    writeLine();
                    write("}");
                }
            }
            function emitAccessor(node) {
                write(node.kind === 295 /* GetAccessor */ ? "get " : "set ");
                emit(node.name);
                emitSignatureAndBody(node);
            }
            function shouldEmitAsArrowFunction(node) {
                return node.kind === 326 /* ArrowFunction */ && languageVersion >= 2 /* ES6 */;
            }
            function emitDeclarationName(node) {
                if (node.name) {
                    emitNodeWithCommentsAndWithoutSourcemap(node.name);
                }
                else {
                    write(getGeneratedNameForNode(node));
                }
            }
            function shouldEmitFunctionName(node) {
                if (node.kind === 325 /* FunctionExpression */) {
                    // Emit name if one is present
                    return !!node.name;
                }
                if (node.kind === 366 /* FunctionDeclaration */) {
                    // Emit name if one is present, or emit generated name in down-level case (for export default case)
                    return !!node.name || modulekind !== ts.ModuleKind.ES6;
                }
            }
            function emitFunctionDeclaration(node) {
                if (ts.nodeIsMissing(node.body)) {
                    return emitCommentsOnNotEmittedNode(node);
                }
                // TODO (yuisu) : we should not have special cases to condition emitting comments
                // but have one place to fix check for these conditions.
                var kind = node.kind, parent = node.parent;
                if (kind !== 293 /* MethodDeclaration */ &&
                    kind !== 292 /* MethodSignature */ &&
                    parent &&
                    parent.kind !== 399 /* PropertyAssignment */ &&
                    parent.kind !== 320 /* CallExpression */ &&
                    parent.kind !== 316 /* ArrayLiteralExpression */) {
                    // 1. Methods will emit comments at their assignment declaration sites.
                    //
                    // 2. If the function is a property of object literal, emitting leading-comments
                    //    is done by emitNodeWithoutSourceMap which then call this function.
                    //    In particular, we would like to avoid emit comments twice in following case:
                    //
                    //          var obj = {
                    //              id:
                    //                  /*comment*/ () => void
                    //          }
                    //
                    // 3. If the function is an argument in call expression, emitting of comments will be
                    //    taken care of in emit list of arguments inside of 'emitCallExpression'.
                    //
                    // 4. If the function is in an array literal, 'emitLinePreservingList' will take care
                    //    of leading comments.
                    emitLeadingComments(node);
                }
                emitStart(node);
                // For targeting below es6, emit functions-like declaration including arrow function using function keyword.
                // When targeting ES6, emit arrow function natively in ES6 by omitting function keyword and using fat arrow instead
                if (!shouldEmitAsArrowFunction(node)) {
                    if (isES6ExportedDeclaration(node)) {
                        write("export ");
                        if (node.flags & 512 /* Default */) {
                            write("default ");
                        }
                    }
                    write("function");
                    if (languageVersion >= 2 /* ES6 */ && node.asteriskToken) {
                        write("*");
                    }
                    write(" ");
                }
                if (shouldEmitFunctionName(node)) {
                    emitDeclarationName(node);
                }
                emitSignatureAndBody(node);
                if (modulekind !== ts.ModuleKind.ES6 && kind === 366 /* FunctionDeclaration */ && parent === currentSourceFile && node.name) {
                    emitExportMemberAssignments(node.name);
                }
                emitEnd(node);
                if (kind !== 293 /* MethodDeclaration */ &&
                    kind !== 292 /* MethodSignature */ &&
                    kind !== 326 /* ArrowFunction */) {
                    emitTrailingComments(node);
                }
            }
            function emitCaptureThisForNodeIfNecessary(node) {
                if (resolver.getNodeCheckFlags(node) & 4 /* CaptureThis */) {
                    writeLine();
                    emitStart(node);
                    write("var _this = this;");
                    emitEnd(node);
                }
            }
            function emitSignatureParameters(node) {
                increaseIndent();
                write("(");
                if (node) {
                    var parameters = node.parameters;
                    var skipCount = node.parameters.length && node.parameters[0].name.text === "this" ? 1 : 0;
                    var omitCount = languageVersion < 2 /* ES6 */ && ts.hasDeclaredRestParameter(node) ? 1 : 0;
                    emitList(parameters, skipCount, parameters.length - omitCount - skipCount, /*multiLine*/ false, /*trailingComma*/ false);
                }
                write(")");
                decreaseIndent();
            }
            function emitSignatureParametersForArrow(node) {
                // Check whether the parameter list needs parentheses and preserve no-parenthesis
                if (node.parameters.length === 1 && node.pos === node.parameters[0].pos) {
                    emit(node.parameters[0]);
                    return;
                }
                emitSignatureParameters(node);
            }
            function emitAsyncFunctionBodyForES6(node) {
                var promiseConstructor = ts.getEntityNameFromTypeNode(node.type);
                var isArrowFunction = node.kind === 326 /* ArrowFunction */;
                var hasLexicalArguments = (resolver.getNodeCheckFlags(node) & 8192 /* CaptureArguments */) !== 0;
                // An async function is emit as an outer function that calls an inner
                // generator function. To preserve lexical bindings, we pass the current
                // `this` and `arguments` objects to `__awaiter`. The generator function
                // passed to `__awaiter` is executed inside of the callback to the
                // promise constructor.
                //
                // The emit for an async arrow without a lexical `arguments` binding might be:
                //
                //  // input
                //  let a = async (b) => { await b; }
                //
                //  // output
                //  let a = (b) => __awaiter(this, void 0, void 0, function* () {
                //      yield b;
                //  });
                //
                // The emit for an async arrow with a lexical `arguments` binding might be:
                //
                //  // input
                //  let a = async (b) => { await arguments[0]; }
                //
                //  // output
                //  let a = (b) => __awaiter(this, arguments, void 0, function* (arguments) {
                //      yield arguments[0];
                //  });
                //
                // The emit for an async function expression without a lexical `arguments` binding
                // might be:
                //
                //  // input
                //  let a = async function (b) {
                //      await b;
                //  }
                //
                //  // output
                //  let a = function (b) {
                //      return __awaiter(this, void 0, void 0, function* () {
                //          yield b;
                //      });
                //  }
                //
                // The emit for an async function expression with a lexical `arguments` binding
                // might be:
                //
                //  // input
                //  let a = async function (b) {
                //      await arguments[0];
                //  }
                //
                //  // output
                //  let a = function (b) {
                //      return __awaiter(this, arguments, void 0, function* (_arguments) {
                //          yield _arguments[0];
                //      });
                //  }
                //
                // The emit for an async function expression with a lexical `arguments` binding
                // and a return type annotation might be:
                //
                //  // input
                //  let a = async function (b): MyPromise<any> {
                //      await arguments[0];
                //  }
                //
                //  // output
                //  let a = function (b) {
                //      return __awaiter(this, arguments, MyPromise, function* (_arguments) {
                //          yield _arguments[0];
                //      });
                //  }
                //
                // If this is not an async arrow, emit the opening brace of the function body
                // and the start of the return statement.
                if (!isArrowFunction) {
                    write(" {");
                    increaseIndent();
                    writeLine();
                    if (resolver.getNodeCheckFlags(node) & 4096 /* AsyncMethodWithSuperBinding */) {
                        writeLines("\nconst _super = (function (geti, seti) {\n    const cache = Object.create(null);\n    return name => cache[name] || (cache[name] = { get value() { return geti(name); }, set value(v) { seti(name, v); } });\n})(name => super[name], (name, value) => super[name] = value);");
                        writeLine();
                    }
                    else if (resolver.getNodeCheckFlags(node) & 2048 /* AsyncMethodWithSuper */) {
                        write("const _super = name => super[name];");
                        writeLine();
                    }
                    write("return");
                }
                write(" __awaiter(this");
                if (hasLexicalArguments) {
                    write(", arguments, ");
                }
                else {
                    write(", void 0, ");
                }
                if (languageVersion >= 2 /* ES6 */ || !promiseConstructor) {
                    write("void 0");
                }
                else {
                    emitEntityNameAsExpression(promiseConstructor, /*useFallback*/ false);
                }
                // Emit the call to __awaiter.
                write(", function* ()");
                // Emit the signature and body for the inner generator function.
                emitFunctionBody(node);
                write(")");
                // If this is not an async arrow, emit the closing brace of the outer function body.
                if (!isArrowFunction) {
                    write(";");
                    decreaseIndent();
                    writeLine();
                    write("}");
                }
            }
            function emitFunctionBody(node) {
                if (!node.body) {
                    // There can be no body when there are parse errors.  Just emit an empty block
                    // in that case.
                    write(" { }");
                }
                else {
                    if (node.body.kind === 345 /* Block */) {
                        emitBlockFunctionBody(node, node.body);
                    }
                    else {
                        emitExpressionFunctionBody(node, node.body);
                    }
                }
            }
            function emitSignatureAndBody(node) {
                var saveConvertedLoopState = convertedLoopState;
                var saveTempFlags = tempFlags;
                var saveTempVariables = tempVariables;
                var saveTempParameters = tempParameters;
                convertedLoopState = undefined;
                tempFlags = 0;
                tempVariables = undefined;
                tempParameters = undefined;
                // When targeting ES6, emit arrow function natively in ES6
                if (shouldEmitAsArrowFunction(node)) {
                    emitSignatureParametersForArrow(node);
                    write(" =>");
                }
                else {
                    emitSignatureParameters(node);
                }
                var isAsync = ts.isAsyncFunctionLike(node);
                if (isAsync) {
                    emitAsyncFunctionBodyForES6(node);
                }
                else {
                    emitFunctionBody(node);
                }
                if (!isES6ExportedDeclaration(node)) {
                    emitExportMemberAssignment(node);
                }
                ts.Debug.assert(convertedLoopState === undefined);
                convertedLoopState = saveConvertedLoopState;
                tempFlags = saveTempFlags;
                tempVariables = saveTempVariables;
                tempParameters = saveTempParameters;
            }
            // Returns true if any preamble code was emitted.
            function emitFunctionBodyPreamble(node) {
                emitCaptureThisForNodeIfNecessary(node);
                emitDefaultValueAssignments(node);
                emitRestParameter(node);
            }
            function emitExpressionFunctionBody(node, body) {
                if (languageVersion < 2 /* ES6 */ || node.flags & 256 /* Async */) {
                    emitDownLevelExpressionFunctionBody(node, body);
                    return;
                }
                // For es6 and higher we can emit the expression as is.  However, in the case
                // where the expression might end up looking like a block when emitted, we'll
                // also wrap it in parentheses first.  For example if you have: a => <foo>{}
                // then we need to generate: a => ({})
                write(" ");
                // Unwrap all type assertions.
                var current = body;
                while (current.kind === 323 /* TypeAssertionExpression */) {
                    current = current.expression;
                }
                emitParenthesizedIf(body, current.kind === 317 /* ObjectLiteralExpression */);
            }
            function emitDownLevelExpressionFunctionBody(node, body) {
                write(" {");
                increaseIndent();
                var outPos = writer.getTextPos();
                emitDetachedCommentsAndUpdateCommentsInfo(node.body);
                emitFunctionBodyPreamble(node);
                var preambleEmitted = writer.getTextPos() !== outPos;
                decreaseIndent();
                // If we didn't have to emit any preamble code, then attempt to keep the arrow
                // function on one line.
                if (!preambleEmitted && nodeStartPositionsAreOnSameLine(node, body)) {
                    write(" ");
                    emitStart(body);
                    write("return ");
                    emit(body);
                    emitEnd(body);
                    write(";");
                    emitTempDeclarations(/*newLine*/ false);
                    write(" ");
                }
                else {
                    increaseIndent();
                    writeLine();
                    emitLeadingComments(node.body);
                    emitStart(body);
                    write("return ");
                    emit(body);
                    emitEnd(body);
                    write(";");
                    emitTrailingComments(node.body);
                    emitTempDeclarations(/*newLine*/ true);
                    decreaseIndent();
                    writeLine();
                }
                emitStart(node.body);
                write("}");
                emitEnd(node.body);
            }
            function emitBlockFunctionBody(node, body) {
                write(" {");
                var initialTextPos = writer.getTextPos();
                increaseIndent();
                emitDetachedCommentsAndUpdateCommentsInfo(body.statements);
                // Emit all the directive prologues (like "use strict").  These have to come before
                // any other preamble code we write (like parameter initializers).
                var startIndex = emitDirectivePrologues(body.statements, /*startWithNewLine*/ true);
                emitFunctionBodyPreamble(node);
                decreaseIndent();
                var preambleEmitted = writer.getTextPos() !== initialTextPos;
                if (!preambleEmitted && nodeEndIsOnSameLineAsNodeStart(body, body)) {
                    for (var _a = 0, _b = body.statements; _a < _b.length; _a++) {
                        var statement = _b[_a];
                        write(" ");
                        emit(statement);
                    }
                    emitTempDeclarations(/*newLine*/ false);
                    write(" ");
                    emitLeadingCommentsOfPosition(body.statements.end);
                }
                else {
                    increaseIndent();
                    emitLinesStartingAt(body.statements, startIndex);
                    emitTempDeclarations(/*newLine*/ true);
                    writeLine();
                    emitLeadingCommentsOfPosition(body.statements.end);
                    decreaseIndent();
                }
                emitToken(98 /* closeBrace */, body.statements.end);
            }
            /**
             * Return the statement at a given index if it is a super-call statement
             * @param ctor a constructor declaration
             * @param index an index to constructor's body to check
             */
            function getSuperCallAtGivenIndex(ctor, index) {
                if (!ctor.body) {
                    return undefined;
                }
                var statements = ctor.body.statements;
                if (!statements || index >= statements.length) {
                    return undefined;
                }
                var statement = statements[index];
                if (statement.kind === 348 /* ExpressionStatement */) {
                    return ts.isSuperCallExpression(statement.expression) ? statement : undefined;
                }
            }
            function emitParameterPropertyAssignments(node) {
                ts.forEach(node.parameters, function (param) {
                    if (param.flags & 92 /* ParameterPropertyModifier */) {
                        writeLine();
                        emitStart(param);
                        emitStart(param.name);
                        write("this.");
                        emitNodeWithoutSourceMap(param.name);
                        emitEnd(param.name);
                        write(" = ");
                        emit(param.name);
                        write(";");
                        emitEnd(param);
                    }
                });
            }
            function emitMemberAccessForPropertyName(memberName) {
                // This does not emit source map because it is emitted by caller as caller
                // is aware how the property name changes to the property access
                // eg. public x = 10; becomes this.x and static x = 10 becomes className.x
                if (memberName.kind === 155 /* StringLiteral */ || memberName.kind === 154 /* NumericLiteral */) {
                    write("[");
                    emitNodeWithCommentsAndWithoutSourcemap(memberName);
                    write("]");
                }
                else if (memberName.kind === 286 /* ComputedPropertyName */) {
                    emitComputedPropertyName(memberName);
                }
                else {
                    write(".");
                    emitNodeWithCommentsAndWithoutSourcemap(memberName);
                }
            }
            function getInitializedProperties(node, isStatic) {
                var properties = [];
                for (var _a = 0, _b = node.members; _a < _b.length; _a++) {
                    var member = _b[_a];
                    if (member.kind === 291 /* PropertyDeclaration */ && isStatic === ((member.flags & 32 /* Static */) !== 0) && member.initializer) {
                        properties.push(member);
                    }
                }
                return properties;
            }
            function emitPropertyDeclarations(node, properties) {
                for (var _a = 0, properties_2 = properties; _a < properties_2.length; _a++) {
                    var property = properties_2[_a];
                    emitPropertyDeclaration(node, property);
                }
            }
            function emitPropertyDeclaration(node, property, receiver, isExpression) {
                writeLine();
                emitLeadingComments(property);
                emitStart(property);
                emitStart(property.name);
                if (receiver) {
                    write(receiver);
                }
                else {
                    if (property.flags & 32 /* Static */) {
                        emitDeclarationName(node);
                    }
                    else {
                        write("this");
                    }
                }
                emitMemberAccessForPropertyName(property.name);
                emitEnd(property.name);
                write(" = ");
                emit(property.initializer);
                if (!isExpression) {
                    write(";");
                }
                emitEnd(property);
                emitTrailingComments(property);
            }
            function emitMemberFunctionsForES5AndLower(node) {
                ts.forEach(node.members, function (member) {
                    if (member.kind === 344 /* SemicolonClassElement */) {
                        writeLine();
                        write(";");
                    }
                    else if (member.kind === 293 /* MethodDeclaration */ || node.kind === 292 /* MethodSignature */) {
                        if (!member.body) {
                            return emitCommentsOnNotEmittedNode(member);
                        }
                        writeLine();
                        emitLeadingComments(member);
                        emitStart(member);
                        emitStart(member.name);
                        emitClassMemberPrefix(node, member);
                        emitMemberAccessForPropertyName(member.name);
                        emitEnd(member.name);
                        write(" = ");
                        emitFunctionDeclaration(member);
                        emitEnd(member);
                        write(";");
                        emitTrailingComments(member);
                    }
                    else if (member.kind === 295 /* GetAccessor */ || member.kind === 296 /* SetAccessor */) {
                        var accessors = ts.getAllAccessorDeclarations(node.members, member);
                        if (member === accessors.firstAccessor) {
                            writeLine();
                            emitStart(member);
                            write("Object.defineProperty(");
                            emitStart(member.name);
                            emitClassMemberPrefix(node, member);
                            write(", ");
                            emitExpressionForPropertyName(member.name);
                            emitEnd(member.name);
                            write(", {");
                            increaseIndent();
                            if (accessors.getAccessor) {
                                writeLine();
                                emitLeadingComments(accessors.getAccessor);
                                write("get: ");
                                emitStart(accessors.getAccessor);
                                write("function ");
                                emitSignatureAndBody(accessors.getAccessor);
                                emitEnd(accessors.getAccessor);
                                emitTrailingComments(accessors.getAccessor);
                                write(",");
                            }
                            if (accessors.setAccessor) {
                                writeLine();
                                emitLeadingComments(accessors.setAccessor);
                                write("set: ");
                                emitStart(accessors.setAccessor);
                                write("function ");
                                emitSignatureAndBody(accessors.setAccessor);
                                emitEnd(accessors.setAccessor);
                                emitTrailingComments(accessors.setAccessor);
                                write(",");
                            }
                            writeLine();
                            write("enumerable: true,");
                            writeLine();
                            write("configurable: true");
                            decreaseIndent();
                            writeLine();
                            write("});");
                            emitEnd(member);
                        }
                    }
                });
            }
            function emitMemberFunctionsForES6AndHigher(node) {
                for (var _a = 0, _b = node.members; _a < _b.length; _a++) {
                    var member = _b[_a];
                    if ((member.kind === 293 /* MethodDeclaration */ || node.kind === 292 /* MethodSignature */) && !member.body) {
                        emitCommentsOnNotEmittedNode(member);
                    }
                    else if (member.kind === 293 /* MethodDeclaration */ ||
                        member.kind === 295 /* GetAccessor */ ||
                        member.kind === 296 /* SetAccessor */) {
                        writeLine();
                        emitLeadingComments(member);
                        emitStart(member);
                        if (member.flags & 32 /* Static */) {
                            write("static ");
                        }
                        if (member.kind === 295 /* GetAccessor */) {
                            write("get ");
                        }
                        else if (member.kind === 296 /* SetAccessor */) {
                            write("set ");
                        }
                        if (member.asteriskToken) {
                            write("*");
                        }
                        emit(member.name);
                        emitSignatureAndBody(member);
                        emitEnd(member);
                        emitTrailingComments(member);
                    }
                    else if (member.kind === 344 /* SemicolonClassElement */) {
                        writeLine();
                        write(";");
                    }
                }
            }
            function emitConstructor(node, baseTypeElement) {
                var saveConvertedLoopState = convertedLoopState;
                var saveTempFlags = tempFlags;
                var saveTempVariables = tempVariables;
                var saveTempParameters = tempParameters;
                convertedLoopState = undefined;
                tempFlags = 0;
                tempVariables = undefined;
                tempParameters = undefined;
                emitConstructorWorker(node, baseTypeElement);
                ts.Debug.assert(convertedLoopState === undefined);
                convertedLoopState = saveConvertedLoopState;
                tempFlags = saveTempFlags;
                tempVariables = saveTempVariables;
                tempParameters = saveTempParameters;
            }
            function emitConstructorWorker(node, baseTypeElement) {
                // Check if we have property assignment inside class declaration.
                // If there is property assignment, we need to emit constructor whether users define it or not
                // If there is no property assignment, we can omit constructor if users do not define it
                var hasInstancePropertyWithInitializer = false;
                // Emit the constructor overload pinned comments
                ts.forEach(node.members, function (member) {
                    if (member.kind === 294 /* Constructor */ && !member.body) {
                        emitCommentsOnNotEmittedNode(member);
                    }
                    // Check if there is any non-static property assignment
                    if (member.kind === 291 /* PropertyDeclaration */ && member.initializer && (member.flags & 32 /* Static */) === 0) {
                        hasInstancePropertyWithInitializer = true;
                    }
                });
                var ctor = ts.getFirstConstructorWithBody(node);
                // For target ES6 and above, if there is no user-defined constructor and there is no property assignment
                // do not emit constructor in class declaration.
                if (languageVersion >= 2 /* ES6 */ && !ctor && !hasInstancePropertyWithInitializer) {
                    return;
                }
                if (ctor) {
                    emitLeadingComments(ctor);
                }
                emitStart(ctor || node);
                if (languageVersion < 2 /* ES6 */) {
                    write("function ");
                    emitDeclarationName(node);
                    emitSignatureParameters(ctor);
                }
                else {
                    write("constructor");
                    if (ctor) {
                        emitSignatureParameters(ctor);
                    }
                    else {
                        // Based on EcmaScript6 section 14.5.14: Runtime Semantics: ClassDefinitionEvaluation.
                        // If constructor is empty, then,
                        //      If ClassHeritageopt is present, then
                        //          Let constructor be the result of parsing the String "constructor(... args){ super (...args);}" using the syntactic grammar with the goal symbol MethodDefinition.
                        //      Else,
                        //          Let constructor be the result of parsing the String "constructor( ){ }" using the syntactic grammar with the goal symbol MethodDefinition
                        if (baseTypeElement) {
                            write("(...args)");
                        }
                        else {
                            write("()");
                        }
                    }
                }
                var startIndex = 0;
                write(" {");
                increaseIndent();
                if (ctor) {
                    // Emit all the directive prologues (like "use strict").  These have to come before
                    // any other preamble code we write (like parameter initializers).
                    startIndex = emitDirectivePrologues(ctor.body.statements, /*startWithNewLine*/ true);
                    emitDetachedCommentsAndUpdateCommentsInfo(ctor.body.statements);
                }
                emitCaptureThisForNodeIfNecessary(node);
                var superCall;
                if (ctor) {
                    emitDefaultValueAssignments(ctor);
                    emitRestParameter(ctor);
                    if (baseTypeElement) {
                        superCall = getSuperCallAtGivenIndex(ctor, startIndex);
                        if (superCall) {
                            writeLine();
                            emit(superCall);
                        }
                    }
                    emitParameterPropertyAssignments(ctor);
                }
                else {
                    if (baseTypeElement) {
                        writeLine();
                        emitStart(baseTypeElement);
                        if (languageVersion < 2 /* ES6 */) {
                            write("_super.apply(this, arguments);");
                        }
                        else {
                            write("super(...args);");
                        }
                        emitEnd(baseTypeElement);
                    }
                }
                emitPropertyDeclarations(node, getInitializedProperties(node, /*isStatic*/ false));
                if (ctor) {
                    var statements = ctor.body.statements;
                    if (superCall) {
                        statements = statements.slice(1);
                    }
                    emitLinesStartingAt(statements, startIndex);
                }
                emitTempDeclarations(/*newLine*/ true);
                writeLine();
                if (ctor) {
                    emitLeadingCommentsOfPosition(ctor.body.statements.end);
                }
                decreaseIndent();
                emitToken(98 /* closeBrace */, ctor ? ctor.body.statements.end : node.members.end);
                emitEnd(ctor || node);
                if (ctor) {
                    emitTrailingComments(ctor);
                }
            }
            function emitClassExpression(node) {
                return emitClassLikeDeclaration(node);
            }
            function emitClassDeclaration(node) {
                return emitClassLikeDeclaration(node);
            }
            function emitClassLikeDeclaration(node) {
                if (languageVersion < 2 /* ES6 */) {
                    emitClassLikeDeclarationBelowES6(node);
                }
                else {
                    emitClassLikeDeclarationForES6AndHigher(node);
                }
                if (modulekind !== ts.ModuleKind.ES6 && node.parent === currentSourceFile && node.name) {
                    emitExportMemberAssignments(node.name);
                }
            }
            function emitClassLikeDeclarationForES6AndHigher(node) {
                var decoratedClassAlias;
                var isHoistedDeclarationInSystemModule = shouldHoistDeclarationInSystemJsModule(node);
                var isDecorated = ts.nodeIsDecorated(node);
                var rewriteAsClassExpression = isDecorated || isHoistedDeclarationInSystemModule;
                if (node.kind === 367 /* ClassDeclaration */) {
                    if (rewriteAsClassExpression) {
                        // When we emit an ES6 class that has a class decorator, we must tailor the
                        // emit to certain specific cases.
                        //
                        // In the simplest case, we emit the class declaration as a let declaration, and
                        // evaluate decorators after the close of the class body:
                        //
                        //  TypeScript                      | Javascript
                        //  --------------------------------|------------------------------------
                        //  @dec                            | let C = class C {
                        //  class C {                       | }
                        //  }                               | C = __decorate([dec], C);
                        //  --------------------------------|------------------------------------
                        //  @dec                            | export let C = class C {
                        //  export class C {                | }
                        //  }                               | C = __decorate([dec], C);
                        //  ---------------------------------------------------------------------
                        //  [Example 1]
                        //
                        // If a class declaration contains a reference to itself *inside* of the class body,
                        // this introduces two bindings to the class: One outside of the class body, and one
                        // inside of the class body. If we apply decorators as in [Example 1] above, there
                        // is the possibility that the decorator `dec` will return a new value for the
                        // constructor, which would result in the binding inside of the class no longer
                        // pointing to the same reference as the binding outside of the class.
                        //
                        // As a result, we must instead rewrite all references to the class *inside* of the
                        // class body to instead point to a local temporary alias for the class:
                        //
                        //  TypeScript                      | Javascript
                        //  --------------------------------|------------------------------------
                        //  @dec                            | let C_1 = class C {
                        //  class C {                       |   static x() { return C_1.y; }
                        //    static x() { return C.y; }    | }
                        //    static y = 1;                 | let C = C_1;
                        //  }                               | C.y = 1;
                        //                                  | C = C_1 = __decorate([dec], C);
                        //  --------------------------------|------------------------------------
                        //  @dec                            | let C_1 = class C {
                        //  export class C {                |   static x() { return C_1.y; }
                        //    static x() { return C.y; }    | }
                        //    static y = 1;                 | export let C = C_1;
                        //  }                               | C.y = 1;
                        //                                  | C = C_1 = __decorate([dec], C);
                        //  ---------------------------------------------------------------------
                        //  [Example 2]
                        //
                        // If a class declaration is the default export of a module, we instead emit
                        // the export after the decorated declaration:
                        //
                        //  TypeScript                      | Javascript
                        //  --------------------------------|------------------------------------
                        //  @dec                            | let default_1 = class {
                        //  export default class {          | }
                        //  }                               | default_1 = __decorate([dec], default_1);
                        //                                  | export default default_1;
                        //  --------------------------------|------------------------------------
                        //  @dec                            | let C = class C {
                        //  export default class {          | }
                        //  }                               | C = __decorate([dec], C);
                        //                                  | export default C;
                        //  ---------------------------------------------------------------------
                        //  [Example 3]
                        //
                        // If the class declaration is the default export and a reference to itself
                        // inside of the class body, we must emit both an alias for the class *and*
                        // move the export after the declaration:
                        //
                        //  TypeScript                      | Javascript
                        //  --------------------------------|------------------------------------
                        //  @dec                            | let C_1 = class C {
                        //  export default class C {        |   static x() { return C_1.y; }
                        //    static x() { return C.y; }    | };
                        //    static y = 1;                 | let C = C_1;
                        //  }                               | C.y = 1;
                        //                                  | C = C_1 = __decorate([dec], C);
                        //                                  | export default C;
                        //  ---------------------------------------------------------------------
                        //  [Example 4]
                        //
                        // NOTE: we reuse the same rewriting logic for cases when targeting ES6 and module kind is System.
                        // Because of hoisting top level class declaration need to be emitted as class expressions.
                        // Double bind case is only required if node is decorated.
                        if (isDecorated && resolver.getNodeCheckFlags(node) & 524288 /* ClassWithBodyScopedClassBinding */) {
                            decoratedClassAlias = ts.unescapeIdentifier(makeUniqueName(node.name ? node.name.text : "default"));
                            decoratedClassAliases[ts.getNodeId(node)] = decoratedClassAlias;
                        }
                        if (isES6ExportedDeclaration(node) && !(node.flags & 512 /* Default */) && decoratedClassAlias === undefined) {
                            write("export ");
                        }
                        if (!isHoistedDeclarationInSystemModule) {
                            write("let ");
                        }
                        if (decoratedClassAlias !== undefined) {
                            write("" + decoratedClassAlias);
                        }
                        else {
                            emitDeclarationName(node);
                        }
                        write(" = ");
                    }
                    else if (isES6ExportedDeclaration(node)) {
                        write("export ");
                        if (node.flags & 512 /* Default */) {
                            write("default ");
                        }
                    }
                }
                // If the class has static properties, and it's a class expression, then we'll need
                // to specialize the emit a bit.  for a class expression of the form:
                //
                //      class C { static a = 1; static b = 2; ... }
                //
                // We'll emit:
                //
                //      (_temp = class C { ... }, _temp.a = 1, _temp.b = 2, _temp)
                //
                // This keeps the expression as an expression, while ensuring that the static parts
                // of it have been initialized by the time it is used.
                var staticProperties = getInitializedProperties(node, /*isStatic*/ true);
                var isClassExpressionWithStaticProperties = staticProperties.length > 0 && node.kind === 338 /* ClassExpression */;
                var generatedName;
                if (isClassExpressionWithStaticProperties) {
                    generatedName = getGeneratedNameForNode(node.name);
                    var synthesizedNode = ts.createSynthesizedNode(215 /* Identifier */);
                    synthesizedNode.text = generatedName;
                    recordTempDeclaration(synthesizedNode);
                    write("(");
                    increaseIndent();
                    emit(synthesizedNode);
                    write(" = ");
                }
                write("class");
                // emit name if
                // - node has a name
                // - this is default export with static initializers
                if (node.name || (node.flags & 512 /* Default */ && (staticProperties.length > 0 || modulekind !== ts.ModuleKind.ES6) && !rewriteAsClassExpression)) {
                    write(" ");
                    emitDeclarationName(node);
                }
                var baseTypeNode = ts.getClassExtendsHeritageClauseElement(node);
                if (baseTypeNode) {
                    write(" extends ");
                    emit(baseTypeNode.expression);
                }
                write(" {");
                increaseIndent();
                writeLine();
                emitConstructor(node, baseTypeNode);
                emitMemberFunctionsForES6AndHigher(node);
                decreaseIndent();
                writeLine();
                emitToken(98 /* closeBrace */, node.members.end);
                if (rewriteAsClassExpression) {
                    if (decoratedClassAlias !== undefined) {
                        write(";");
                        writeLine();
                        if (isES6ExportedDeclaration(node) && !(node.flags & 512 /* Default */)) {
                            write("export ");
                        }
                        write("let ");
                        emitDeclarationName(node);
                        write(" = " + decoratedClassAlias);
                    }
                    decoratedClassAliases[ts.getNodeId(node)] = undefined;
                    write(";");
                }
                // Emit static property assignment. Because classDeclaration is lexically evaluated,
                // it is safe to emit static property assignment after classDeclaration
                // From ES6 specification:
                //      HasLexicalDeclaration (N) : Determines if the argument identifier has a binding in this environment record that was created using
                //                                  a lexical declaration such as a LexicalDeclaration or a ClassDeclaration.
                if (isClassExpressionWithStaticProperties) {
                    for (var _a = 0, staticProperties_1 = staticProperties; _a < staticProperties_1.length; _a++) {
                        var property = staticProperties_1[_a];
                        write(",");
                        writeLine();
                        emitPropertyDeclaration(node, property, /*receiver*/ generatedName, /*isExpression*/ true);
                    }
                    write(",");
                    writeLine();
                    write(generatedName);
                    decreaseIndent();
                    write(")");
                }
                else {
                    writeLine();
                    emitPropertyDeclarations(node, staticProperties);
                    emitDecoratorsOfClass(node, decoratedClassAlias);
                }
                if (!(node.flags & 1 /* Export */)) {
                    return;
                }
                if (modulekind !== ts.ModuleKind.ES6) {
                    emitExportMemberAssignment(node);
                }
                else {
                    // If this is an exported class, but not on the top level (i.e. on an internal
                    // module), export it
                    if (node.flags & 512 /* Default */) {
                        // if this is a top level default export of decorated class, write the export after the declaration.
                        if (isDecorated) {
                            writeLine();
                            write("export default ");
                            emitDeclarationName(node);
                            write(";");
                        }
                    }
                    else if (node.parent.kind !== 402 /* SourceFile */) {
                        writeLine();
                        emitStart(node);
                        emitModuleMemberName(node);
                        write(" = ");
                        emitDeclarationName(node);
                        emitEnd(node);
                        write(";");
                    }
                }
            }
            function emitClassLikeDeclarationBelowES6(node) {
                var isES6ExportedClass = isES6ExportedDeclaration(node);
                if (node.kind === 367 /* ClassDeclaration */) {
                    if (isES6ExportedClass && !(node.flags & 512 /* Default */)) {
                        write("export ");
                    }
                    // source file level classes in system modules are hoisted so 'var's for them are already defined
                    if (!shouldHoistDeclarationInSystemJsModule(node)) {
                        write("var ");
                    }
                    emitDeclarationName(node);
                    write(" = ");
                }
                write("(function (");
                var baseTypeNode = ts.getClassExtendsHeritageClauseElement(node);
                if (baseTypeNode) {
                    write("_super");
                }
                write(") {");
                var saveTempFlags = tempFlags;
                var saveTempVariables = tempVariables;
                var saveTempParameters = tempParameters;
                var saveComputedPropertyNamesToGeneratedNames = computedPropertyNamesToGeneratedNames;
                var saveConvertedLoopState = convertedLoopState;
                convertedLoopState = undefined;
                tempFlags = 0;
                tempVariables = undefined;
                tempParameters = undefined;
                computedPropertyNamesToGeneratedNames = undefined;
                increaseIndent();
                if (baseTypeNode) {
                    writeLine();
                    emitStart(baseTypeNode);
                    write("__extends(");
                    emitDeclarationName(node);
                    write(", _super);");
                    emitEnd(baseTypeNode);
                }
                writeLine();
                emitConstructor(node, baseTypeNode);
                emitMemberFunctionsForES5AndLower(node);
                emitPropertyDeclarations(node, getInitializedProperties(node, /*isStatic*/ true));
                writeLine();
                emitDecoratorsOfClass(node, /*decoratedClassAlias*/ undefined);
                writeLine();
                emitToken(98 /* closeBrace */, node.members.end, function () {
                    write("return ");
                    emitDeclarationName(node);
                });
                write(";");
                emitTempDeclarations(/*newLine*/ true);
                ts.Debug.assert(convertedLoopState === undefined);
                convertedLoopState = saveConvertedLoopState;
                tempFlags = saveTempFlags;
                tempVariables = saveTempVariables;
                tempParameters = saveTempParameters;
                computedPropertyNamesToGeneratedNames = saveComputedPropertyNamesToGeneratedNames;
                decreaseIndent();
                writeLine();
                emitToken(98 /* closeBrace */, node.members.end);
                emitStart(node);
                write("(");
                if (baseTypeNode) {
                    emit(baseTypeNode.expression);
                }
                write("))");
                if (node.kind === 367 /* ClassDeclaration */) {
                    write(";");
                }
                emitEnd(node);
                if (node.kind === 367 /* ClassDeclaration */ && !isES6ExportedClass) {
                    emitExportMemberAssignment(node);
                }
                else if (isES6ExportedClass && (node.flags & 512 /* Default */)) {
                    writeLine();
                    write("export default ");
                    emitDeclarationName(node);
                    write(";");
                }
            }
            function emitClassMemberPrefix(node, member) {
                emitDeclarationName(node);
                if (!(member.flags & 32 /* Static */)) {
                    write(".prototype");
                }
            }
            function emitDecoratorsOfClass(node, decoratedClassAlias) {
                emitDecoratorsOfMembers(node, /*staticFlag*/ 0);
                emitDecoratorsOfMembers(node, 32 /* Static */);
                emitDecoratorsOfConstructor(node, decoratedClassAlias);
            }
            function emitDecoratorsOfConstructor(node, decoratedClassAlias) {
                var decorators = node.decorators;
                var constructor = ts.getFirstConstructorWithBody(node);
                var firstParameterDecorator = constructor && ts.forEach(constructor.parameters, function (parameter) { return parameter.decorators; });
                // skip decoration of the constructor if neither it nor its parameters are decorated
                if (!decorators && !firstParameterDecorator) {
                    return;
                }
                // Emit the call to __decorate. Given the class:
                //
                //   @dec
                //   class C {
                //   }
                //
                // The emit for the class is:
                //
                //   C = __decorate([dec], C);
                //
                writeLine();
                emitStart(node.decorators || firstParameterDecorator);
                emitDeclarationName(node);
                if (decoratedClassAlias !== undefined) {
                    write(" = " + decoratedClassAlias);
                }
                write(" = __decorate([");
                increaseIndent();
                writeLine();
                var decoratorCount = decorators ? decorators.length : 0;
                var argumentsWritten = emitList(decorators, 0, decoratorCount, /*multiLine*/ true, /*trailingComma*/ false, /*leadingComma*/ false, /*noTrailingNewLine*/ true, function (decorator) { return emit(decorator.expression); });
                if (firstParameterDecorator) {
                    argumentsWritten += emitDecoratorsOfParameters(constructor, /*leadingComma*/ argumentsWritten > 0);
                }
                emitSerializedTypeMetadata(node, /*leadingComma*/ argumentsWritten >= 0);
                decreaseIndent();
                writeLine();
                write("], ");
                emitDeclarationName(node);
                write(")");
                emitEnd(node.decorators || firstParameterDecorator);
                write(";");
                writeLine();
            }
            function emitDecoratorsOfMembers(node, staticFlag) {
                for (var _a = 0, _b = node.members; _a < _b.length; _a++) {
                    var member = _b[_a];
                    // only emit members in the correct group
                    if ((member.flags & 32 /* Static */) !== staticFlag) {
                        continue;
                    }
                    // skip members that cannot be decorated (such as the constructor)
                    if (!ts.nodeCanBeDecorated(member)) {
                        continue;
                    }
                    // skip an accessor declaration if it is not the first accessor
                    var decorators = void 0;
                    var functionLikeMember = void 0;
                    if (ts.isAccessor(member)) {
                        var accessors = ts.getAllAccessorDeclarations(node.members, member);
                        if (member !== accessors.firstAccessor) {
                            continue;
                        }
                        // get the decorators from the first accessor with decorators
                        decorators = accessors.firstAccessor.decorators;
                        if (!decorators && accessors.secondAccessor) {
                            decorators = accessors.secondAccessor.decorators;
                        }
                        // we only decorate parameters of the set accessor
                        functionLikeMember = accessors.setAccessor;
                    }
                    else {
                        decorators = member.decorators;
                        // we only decorate the parameters here if this is a method
                        if (member.kind === 293 /* MethodDeclaration */) {
                            functionLikeMember = member;
                        }
                    }
                    var firstParameterDecorator = functionLikeMember && ts.forEach(functionLikeMember.parameters, function (parameter) { return parameter.decorators; });
                    // skip a member if it or any of its parameters are not decorated
                    if (!decorators && !firstParameterDecorator) {
                        continue;
                    }
                    // Emit the call to __decorate. Given the following:
                    //
                    //   class C {
                    //     @dec method(@dec2 x) {}
                    //     @dec get accessor() {}
                    //     @dec prop;
                    //   }
                    //
                    // The emit for a method is:
                    //
                    //   __decorate([
                    //       dec,
                    //       __param(0, dec2),
                    //       __metadata("design:type", Function),
                    //       __metadata("design:paramtypes", [Object]),
                    //       __metadata("design:returntype", void 0)
                    //   ], C.prototype, "method", undefined);
                    //
                    // The emit for an accessor is:
                    //
                    //   __decorate([
                    //       dec
                    //   ], C.prototype, "accessor", undefined);
                    //
                    // The emit for a property is:
                    //
                    //   __decorate([
                    //       dec
                    //   ], C.prototype, "prop");
                    //
                    writeLine();
                    emitStart(decorators || firstParameterDecorator);
                    write("__decorate([");
                    increaseIndent();
                    writeLine();
                    var decoratorCount = decorators ? decorators.length : 0;
                    var argumentsWritten = emitList(decorators, 0, decoratorCount, /*multiLine*/ true, /*trailingComma*/ false, /*leadingComma*/ false, /*noTrailingNewLine*/ true, function (decorator) { return emit(decorator.expression); });
                    if (firstParameterDecorator) {
                        argumentsWritten += emitDecoratorsOfParameters(functionLikeMember, argumentsWritten > 0);
                    }
                    emitSerializedTypeMetadata(member, argumentsWritten > 0);
                    decreaseIndent();
                    writeLine();
                    write("], ");
                    emitClassMemberPrefix(node, member);
                    write(", ");
                    emitExpressionForPropertyName(member.name);
                    if (languageVersion > 0 /* ES3 */) {
                        if (member.kind !== 291 /* PropertyDeclaration */) {
                            // We emit `null` here to indicate to `__decorate` that it can invoke `Object.getOwnPropertyDescriptor` directly.
                            // We have this extra argument here so that we can inject an explicit property descriptor at a later date.
                            write(", null");
                        }
                        else {
                            // We emit `void 0` here to indicate to `__decorate` that it can invoke `Object.defineProperty` directly, but that it
                            // should not invoke `Object.getOwnPropertyDescriptor`.
                            write(", void 0");
                        }
                    }
                    write(")");
                    emitEnd(decorators || firstParameterDecorator);
                    write(";");
                    writeLine();
                }
            }
            function emitDecoratorsOfParameters(node, leadingComma) {
                var argumentsWritten = 0;
                if (node) {
                    var parameterIndex_1 = 0;
                    for (var _a = 0, _b = node.parameters; _a < _b.length; _a++) {
                        var parameter = _b[_a];
                        if (ts.nodeIsDecorated(parameter)) {
                            var decorators = parameter.decorators;
                            argumentsWritten += emitList(decorators, 0, decorators.length, /*multiLine*/ true, /*trailingComma*/ false, /*leadingComma*/ leadingComma, /*noTrailingNewLine*/ true, function (decorator) {
                                write("__param(" + parameterIndex_1 + ", ");
                                emit(decorator.expression);
                                write(")");
                            });
                            leadingComma = true;
                        }
                        parameterIndex_1++;
                    }
                }
                return argumentsWritten;
            }
            function shouldEmitTypeMetadata(node) {
                // This method determines whether to emit the "design:type" metadata based on the node's kind.
                // The caller should have already tested whether the node has decorators and whether the emitDecoratorMetadata
                // compiler option is set.
                switch (node.kind) {
                    case 293 /* MethodDeclaration */:
                    case 295 /* GetAccessor */:
                    case 296 /* SetAccessor */:
                    case 291 /* PropertyDeclaration */:
                        return true;
                }
                return false;
            }
            function shouldEmitReturnTypeMetadata(node) {
                // This method determines whether to emit the "design:returntype" metadata based on the node's kind.
                // The caller should have already tested whether the node has decorators and whether the emitDecoratorMetadata
                // compiler option is set.
                switch (node.kind) {
                    case 293 /* MethodDeclaration */:
                        return true;
                }
                return false;
            }
            function shouldEmitParamTypesMetadata(node) {
                // This method determines whether to emit the "design:paramtypes" metadata based on the node's kind.
                // The caller should have already tested whether the node has decorators and whether the emitDecoratorMetadata
                // compiler option is set.
                switch (node.kind) {
                    case 367 /* ClassDeclaration */:
                    case 293 /* MethodDeclaration */:
                    case 296 /* SetAccessor */:
                        return true;
                }
                return false;
            }
            /** Serializes the type of a declaration to an appropriate JS constructor value. Used by the __metadata decorator for a class member. */
            function emitSerializedTypeOfNode(node) {
                // serialization of the type of a declaration uses the following rules:
                //
                // * The serialized type of a ClassDeclaration is "Function"
                // * The serialized type of a ParameterDeclaration is the serialized type of its type annotation.
                // * The serialized type of a PropertyDeclaration is the serialized type of its type annotation.
                // * The serialized type of an AccessorDeclaration is the serialized type of the return type annotation of its getter or parameter type annotation of its setter.
                // * The serialized type of any other FunctionLikeDeclaration is "Function".
                // * The serialized type of any other node is "void 0".
                //
                // For rules on serializing type annotations, see `serializeTypeNode`.
                switch (node.kind) {
                    case 367 /* ClassDeclaration */:
                        write("Function");
                        return;
                    case 291 /* PropertyDeclaration */:
                        emitSerializedTypeNode(node.type);
                        return;
                    case 288 /* Parameter */:
                        emitSerializedTypeNode(node.type);
                        return;
                    case 295 /* GetAccessor */:
                        emitSerializedTypeNode(node.type);
                        return;
                    case 296 /* SetAccessor */:
                        emitSerializedTypeNode(ts.getSetAccessorTypeAnnotationNode(node));
                        return;
                }
                if (ts.isFunctionLike(node)) {
                    write("Function");
                    return;
                }
                write("void 0");
            }
            function emitSerializedTypeNode(node) {
                if (node) {
                    switch (node.kind) {
                        case 36 /* void */:
                            write("void 0");
                            return;
                        case 310 /* ParenthesizedType */:
                            emitSerializedTypeNode(node.type);
                            return;
                        case 302 /* FunctionType */:
                        case 303 /* ConstructorType */:
                            write("Function");
                            return;
                        case 306 /* ArrayType */:
                        case 307 /* TupleType */:
                            write("Array");
                            return;
                        case 300 /* TypePredicate */:
                        case 142 /* boolean */:
                            write("Boolean");
                            return;
                        case 144 /* string */:
                        case 312 /* StringLiteralType */:
                            write("String");
                            return;
                        case 143 /* number */:
                            write("Number");
                            return;
                        case 145 /* symbol */:
                            write("Symbol");
                            return;
                        case 301 /* TypeReference */:
                            emitSerializedTypeReferenceNode(node);
                            return;
                        case 304 /* TypeQuery */:
                        case 305 /* TypeLiteral */:
                        case 308 /* UnionType */:
                        case 309 /* IntersectionType */:
                        case 141 /* any */:
                        case 311 /* ThisType */:
                            break;
                        default:
                            ts.Debug.fail("Cannot serialize unexpected type node.");
                            break;
                    }
                }
                write("Object");
            }
            /** Serializes a TypeReferenceNode to an appropriate JS constructor value. Used by the __metadata decorator. */
            function emitSerializedTypeReferenceNode(node) {
                var location = node.parent;
                while (ts.isDeclaration(location) || ts.isTypeNode(location)) {
                    location = location.parent;
                }
                // Clone the type name and parent it to a location outside of the current declaration.
                var typeName = ts.cloneEntityName(node.typeName, location);
                var result = resolver.getTypeReferenceSerializationKind(typeName);
                switch (result) {
                    case ts.TypeReferenceSerializationKind.Unknown:
                        var temp = createAndRecordTempVariable(0 /* Auto */);
                        write("(typeof (");
                        emitNodeWithoutSourceMap(temp);
                        write(" = ");
                        emitEntityNameAsExpression(typeName, /*useFallback*/ true);
                        write(") === 'function' && ");
                        emitNodeWithoutSourceMap(temp);
                        write(") || Object");
                        break;
                    case ts.TypeReferenceSerializationKind.TypeWithConstructSignatureAndValue:
                        emitEntityNameAsExpression(typeName, /*useFallback*/ false);
                        break;
                    case ts.TypeReferenceSerializationKind.VoidType:
                        write("void 0");
                        break;
                    case ts.TypeReferenceSerializationKind.BooleanType:
                        write("Boolean");
                        break;
                    case ts.TypeReferenceSerializationKind.NumberLikeType:
                        write("Number");
                        break;
                    case ts.TypeReferenceSerializationKind.StringLikeType:
                        write("String");
                        break;
                    case ts.TypeReferenceSerializationKind.ArrayLikeType:
                        write("Array");
                        break;
                    case ts.TypeReferenceSerializationKind.ESSymbolType:
                        if (languageVersion < 2 /* ES6 */) {
                            write("typeof Symbol === 'function' ? Symbol : Object");
                        }
                        else {
                            write("Symbol");
                        }
                        break;
                    case ts.TypeReferenceSerializationKind.TypeWithCallSignature:
                        write("Function");
                        break;
                    case ts.TypeReferenceSerializationKind.ObjectType:
                        write("Object");
                        break;
                }
            }
            /** Serializes the parameter types of a function or the constructor of a class. Used by the __metadata decorator for a method or set accessor. */
            function emitSerializedParameterTypesOfNode(node) {
                // serialization of parameter types uses the following rules:
                //
                // * If the declaration is a class, the parameters of the first constructor with a body are used.
                // * If the declaration is function-like and has a body, the parameters of the function are used.
                //
                // For the rules on serializing the type of each parameter declaration, see `serializeTypeOfDeclaration`.
                if (node) {
                    var valueDeclaration = void 0;
                    if (node.kind === 367 /* ClassDeclaration */) {
                        valueDeclaration = ts.getFirstConstructorWithBody(node);
                    }
                    else if (ts.isFunctionLike(node) && ts.nodeIsPresent(node.body)) {
                        valueDeclaration = node;
                    }
                    if (valueDeclaration) {
                        var parameters = valueDeclaration.parameters;
                        var parameterCount = parameters.length;
                        if (parameterCount > 0) {
                            for (var i = 0; i < parameterCount; i++) {
                                if (i > 0) {
                                    write(", ");
                                }
                                if (parameters[i].dotDotDotToken) {
                                    var parameterType = parameters[i].type;
                                    if (parameterType && parameterType.kind === 306 /* ArrayType */) {
                                        parameterType = parameterType.elementType;
                                    }
                                    else if (parameterType && parameterType.kind === 301 /* TypeReference */ && parameterType.typeArguments && parameterType.typeArguments.length === 1) {
                                        parameterType = parameterType.typeArguments[0];
                                    }
                                    else {
                                        parameterType = undefined;
                                    }
                                    emitSerializedTypeNode(parameterType);
                                }
                                else {
                                    emitSerializedTypeOfNode(parameters[i]);
                                }
                            }
                        }
                    }
                }
            }
            /** Serializes the return type of function. Used by the __metadata decorator for a method. */
            function emitSerializedReturnTypeOfNode(node) {
                if (node && ts.isFunctionLike(node)) {
                    if (node.type) {
                        emitSerializedTypeNode(node.type);
                        return;
                    }
                    else if (ts.isAsyncFunctionLike(node)) {
                        write("Promise");
                        return;
                    }
                }
                write("void 0");
            }
            function emitSerializedTypeMetadata(node, writeComma) {
                // This method emits the serialized type metadata for a decorator target.
                // The caller should have already tested whether the node has decorators.
                var argumentsWritten = 0;
                if (compilerOptions.emitDecoratorMetadata) {
                    if (shouldEmitTypeMetadata(node)) {
                        if (writeComma) {
                            write(", ");
                        }
                        writeLine();
                        write("__metadata('design:type', ");
                        emitSerializedTypeOfNode(node);
                        write(")");
                        argumentsWritten++;
                    }
                    if (shouldEmitParamTypesMetadata(node)) {
                        if (writeComma || argumentsWritten) {
                            write(", ");
                        }
                        writeLine();
                        write("__metadata('design:paramtypes', [");
                        emitSerializedParameterTypesOfNode(node);
                        write("])");
                        argumentsWritten++;
                    }
                    if (shouldEmitReturnTypeMetadata(node)) {
                        if (writeComma || argumentsWritten) {
                            write(", ");
                        }
                        writeLine();
                        write("__metadata('design:returntype', ");
                        emitSerializedReturnTypeOfNode(node);
                        write(")");
                        argumentsWritten++;
                    }
                }
                return argumentsWritten;
            }
            function emitInterfaceDeclaration(node) {
                emitCommentsOnNotEmittedNode(node);
            }
            function shouldEmitEnumDeclaration(node) {
                var isConstEnum = ts.isConst(node);
                return !isConstEnum || compilerOptions.preserveConstEnums || compilerOptions.isolatedModules;
            }
            function emitEnumDeclaration(node) {
                // const enums are completely erased during compilation.
                if (!shouldEmitEnumDeclaration(node)) {
                    return;
                }
                if (!shouldHoistDeclarationInSystemJsModule(node)) {
                    // do not emit var if variable was already hoisted
                    var isES6ExportedEnum = isES6ExportedDeclaration(node);
                    if (!(node.flags & 1 /* Export */) || (isES6ExportedEnum && isFirstDeclarationOfKind(node, node.symbol && node.symbol.declarations, 370 /* EnumDeclaration */))) {
                        emitStart(node);
                        if (isES6ExportedEnum) {
                            write("export ");
                        }
                        write("var ");
                        emit(node.name);
                        emitEnd(node);
                        write(";");
                    }
                }
                writeLine();
                emitStart(node);
                write("(function (");
                emitStart(node.name);
                write(getGeneratedNameForNode(node));
                emitEnd(node.name);
                write(") {");
                increaseIndent();
                emitLines(node.members);
                decreaseIndent();
                writeLine();
                emitToken(98 /* closeBrace */, node.members.end);
                write(")(");
                emitModuleMemberName(node);
                write(" || (");
                emitModuleMemberName(node);
                write(" = {}));");
                emitEnd(node);
                if (!isES6ExportedDeclaration(node) && node.flags & 1 /* Export */ && !shouldHoistDeclarationInSystemJsModule(node)) {
                    // do not emit var if variable was already hoisted
                    writeLine();
                    emitStart(node);
                    write("var ");
                    emit(node.name);
                    write(" = ");
                    emitModuleMemberName(node);
                    emitEnd(node);
                    write(";");
                }
                if (modulekind !== ts.ModuleKind.ES6 && node.parent === currentSourceFile) {
                    if (modulekind === ts.ModuleKind.System && (node.flags & 1 /* Export */)) {
                        // write the call to exporter for enum
                        writeLine();
                        write(exportFunctionForFile + "(\"");
                        emitDeclarationName(node);
                        write("\", ");
                        emitDeclarationName(node);
                        write(");");
                    }
                    emitExportMemberAssignments(node.name);
                }
            }
            function emitEnumMember(node) {
                var enumParent = node.parent;
                emitStart(node);
                write(getGeneratedNameForNode(enumParent));
                write("[");
                write(getGeneratedNameForNode(enumParent));
                write("[");
                emitExpressionForPropertyName(node.name);
                write("] = ");
                writeEnumMemberDeclarationValue(node);
                write("] = ");
                emitExpressionForPropertyName(node.name);
                emitEnd(node);
                write(";");
            }
            function writeEnumMemberDeclarationValue(member) {
                var value = resolver.getConstantValue(member);
                if (value !== undefined) {
                    write(value.toString());
                    return;
                }
                else if (member.initializer) {
                    emit(member.initializer);
                }
                else {
                    write("undefined");
                }
            }
            function getInnerMostModuleDeclarationFromDottedModule(moduleDeclaration) {
                if (moduleDeclaration.body && moduleDeclaration.body.kind === 371 /* ModuleDeclaration */) {
                    var recursiveInnerModule = getInnerMostModuleDeclarationFromDottedModule(moduleDeclaration.body);
                    return recursiveInnerModule || moduleDeclaration.body;
                }
            }
            function shouldEmitModuleDeclaration(node) {
                return ts.isInstantiatedModule(node, compilerOptions.preserveConstEnums || compilerOptions.isolatedModules);
            }
            function isModuleMergedWithES6Class(node) {
                return languageVersion === 2 /* ES6 */ && !!(resolver.getNodeCheckFlags(node) & 32768 /* LexicalModuleMergesWithClass */);
            }
            function isFirstDeclarationOfKind(node, declarations, kind) {
                return !ts.forEach(declarations, function (declaration) { return declaration.kind === kind && declaration.pos < node.pos; });
            }
            function emitModuleDeclaration(node) {
                // Emit only if this module is non-ambient.
                var shouldEmit = shouldEmitModuleDeclaration(node);
                if (!shouldEmit) {
                    return emitCommentsOnNotEmittedNode(node);
                }
                var hoistedInDeclarationScope = shouldHoistDeclarationInSystemJsModule(node);
                var emitVarForModule = !hoistedInDeclarationScope && !isModuleMergedWithES6Class(node);
                if (emitVarForModule) {
                    var isES6ExportedNamespace = isES6ExportedDeclaration(node);
                    if (!isES6ExportedNamespace || isFirstDeclarationOfKind(node, node.symbol && node.symbol.declarations, 371 /* ModuleDeclaration */)) {
                        emitStart(node);
                        if (isES6ExportedNamespace) {
                            write("export ");
                        }
                        write("var ");
                        emit(node.name);
                        write(";");
                        emitEnd(node);
                        writeLine();
                    }
                }
                emitStart(node);
                write("(function (");
                emitStart(node.name);
                write(getGeneratedNameForNode(node));
                emitEnd(node.name);
                write(") ");
                ts.Debug.assert(node.body !== undefined); // node.body must exist, as this is a non-ambient module
                if (node.body.kind === 372 /* ModuleBlock */) {
                    var saveConvertedLoopState = convertedLoopState;
                    var saveTempFlags = tempFlags;
                    var saveTempVariables = tempVariables;
                    convertedLoopState = undefined;
                    tempFlags = 0;
                    tempVariables = undefined;
                    emit(node.body);
                    ts.Debug.assert(convertedLoopState === undefined);
                    convertedLoopState = saveConvertedLoopState;
                    tempFlags = saveTempFlags;
                    tempVariables = saveTempVariables;
                }
                else {
                    write("{");
                    increaseIndent();
                    emitCaptureThisForNodeIfNecessary(node);
                    writeLine();
                    emit(node.body);
                    decreaseIndent();
                    writeLine();
                    var moduleBlock = getInnerMostModuleDeclarationFromDottedModule(node).body;
                    emitToken(98 /* closeBrace */, moduleBlock.statements.end);
                }
                write(")(");
                // write moduleDecl = containingModule.m only if it is not exported es6 module member
                if ((node.flags & 1 /* Export */) && !isES6ExportedDeclaration(node)) {
                    emit(node.name);
                    write(" = ");
                }
                emitModuleMemberName(node);
                write(" || (");
                emitModuleMemberName(node);
                write(" = {}));");
                emitEnd(node);
                if (!isES6ExportedDeclaration(node) && node.name.kind === 215 /* Identifier */ && node.parent === currentSourceFile) {
                    if (modulekind === ts.ModuleKind.System && (node.flags & 1 /* Export */)) {
                        writeLine();
                        write(exportFunctionForFile + "(\"");
                        emitDeclarationName(node);
                        write("\", ");
                        emitDeclarationName(node);
                        write(");");
                    }
                    emitExportMemberAssignments(node.name);
                }
            }
            /*
             * Some bundlers (SystemJS builder) sometimes want to rename dependencies.
             * Here we check if alternative name was provided for a given moduleName and return it if possible.
             */
            function tryRenameExternalModule(moduleName) {
                if (renamedDependencies && ts.hasProperty(renamedDependencies, moduleName.text)) {
                    return "\"" + renamedDependencies[moduleName.text] + "\"";
                }
                return undefined;
            }
            function emitRequire(moduleName) {
                if (moduleName.kind === 155 /* StringLiteral */) {
                    write("require(");
                    var text = tryRenameExternalModule(moduleName);
                    if (text) {
                        write(text);
                    }
                    else {
                        emitStart(moduleName);
                        emitLiteral(moduleName);
                        emitEnd(moduleName);
                    }
                    emitToken(96 /* closeParen */, moduleName.end);
                }
                else {
                    write("require()");
                }
            }
            function getNamespaceDeclarationNode(node) {
                if (node.kind === 375 /* ImportEqualsDeclaration */) {
                    return node;
                }
                var importClause = node.importClause;
                if (importClause && importClause.namedBindings && importClause.namedBindings.kind === 378 /* NamespaceImport */) {
                    return importClause.namedBindings;
                }
            }
            function isDefaultImport(node) {
                return node.kind === 376 /* ImportDeclaration */ && node.importClause && !!node.importClause.name;
            }
            function emitExportImportAssignments(node) {
                if (ts.isAliasSymbolDeclaration(node) && resolver.isValueAliasDeclaration(node)) {
                    emitExportMemberAssignments(node.name);
                }
                ts.forEachChild(node, emitExportImportAssignments);
            }
            function emitImportDeclaration(node) {
                if (modulekind !== ts.ModuleKind.ES6) {
                    return emitExternalImportDeclaration(node);
                }
                // ES6 import
                if (node.importClause) {
                    var shouldEmitDefaultBindings = resolver.isReferencedAliasDeclaration(node.importClause);
                    var shouldEmitNamedBindings = node.importClause.namedBindings && resolver.isReferencedAliasDeclaration(node.importClause.namedBindings, /* checkChildren */ true);
                    if (shouldEmitDefaultBindings || shouldEmitNamedBindings) {
                        write("import ");
                        emitStart(node.importClause);
                        if (shouldEmitDefaultBindings) {
                            emit(node.importClause.name);
                            if (shouldEmitNamedBindings) {
                                write(", ");
                            }
                        }
                        if (shouldEmitNamedBindings) {
                            emitLeadingComments(node.importClause.namedBindings);
                            emitStart(node.importClause.namedBindings);
                            if (node.importClause.namedBindings.kind === 378 /* NamespaceImport */) {
                                write("* as ");
                                emit(node.importClause.namedBindings.name);
                            }
                            else {
                                write("{ ");
                                emitExportOrImportSpecifierList(node.importClause.namedBindings.elements, resolver.isReferencedAliasDeclaration);
                                write(" }");
                            }
                            emitEnd(node.importClause.namedBindings);
                            emitTrailingComments(node.importClause.namedBindings);
                        }
                        emitEnd(node.importClause);
                        write(" from ");
                        emit(node.moduleSpecifier);
                        write(";");
                    }
                }
                else {
                    write("import ");
                    emit(node.moduleSpecifier);
                    write(";");
                }
            }
            function emitExternalImportDeclaration(node) {
                if (ts.contains(externalImports, node)) {
                    var isExportedImport = node.kind === 375 /* ImportEqualsDeclaration */ && (node.flags & 1 /* Export */) !== 0;
                    var namespaceDeclaration = getNamespaceDeclarationNode(node);
                    var varOrConst = (languageVersion <= 1 /* ES5 */) ? "var " : "const ";
                    if (modulekind !== ts.ModuleKind.AMD) {
                        emitLeadingComments(node);
                        emitStart(node);
                        if (namespaceDeclaration && !isDefaultImport(node)) {
                            // import x = require("foo")
                            // import * as x from "foo"
                            if (!isExportedImport) {
                                write(varOrConst);
                            }
                            ;
                            emitModuleMemberName(namespaceDeclaration);
                            write(" = ");
                        }
                        else {
                            // import "foo"
                            // import x from "foo"
                            // import { x, y } from "foo"
                            // import d, * as x from "foo"
                            // import d, { x, y } from "foo"
                            var isNakedImport = 376 /* ImportDeclaration */ && !node.importClause;
                            if (!isNakedImport) {
                                write(varOrConst);
                                write(getGeneratedNameForNode(node));
                                write(" = ");
                            }
                        }
                        emitRequire(ts.getExternalModuleName(node));
                        if (namespaceDeclaration && isDefaultImport(node)) {
                            // import d, * as x from "foo"
                            write(", ");
                            emitModuleMemberName(namespaceDeclaration);
                            write(" = ");
                            write(getGeneratedNameForNode(node));
                        }
                        write(";");
                        emitEnd(node);
                        emitExportImportAssignments(node);
                        emitTrailingComments(node);
                    }
                    else {
                        if (isExportedImport) {
                            emitModuleMemberName(namespaceDeclaration);
                            write(" = ");
                            emit(namespaceDeclaration.name);
                            write(";");
                        }
                        else if (namespaceDeclaration && isDefaultImport(node)) {
                            // import d, * as x from "foo"
                            write(varOrConst);
                            emitModuleMemberName(namespaceDeclaration);
                            write(" = ");
                            write(getGeneratedNameForNode(node));
                            write(";");
                        }
                        emitExportImportAssignments(node);
                    }
                }
            }
            function emitImportEqualsDeclaration(node) {
                if (ts.isExternalModuleImportEqualsDeclaration(node)) {
                    emitExternalImportDeclaration(node);
                    return;
                }
                // preserve old compiler's behavior: emit 'var' for import declaration (even if we do not consider them referenced) when
                // - current file is not external module
                // - import declaration is top level and target is value imported by entity name
                if (resolver.isReferencedAliasDeclaration(node) ||
                    (!isCurrentFileExternalModule && resolver.isTopLevelValueImportEqualsWithEntityName(node))) {
                    emitLeadingComments(node);
                    emitStart(node);
                    // variable declaration for import-equals declaration can be hoisted in system modules
                    // in this case 'var' should be omitted and emit should contain only initialization
                    var variableDeclarationIsHoisted = shouldHoistVariable(node, /*checkIfSourceFileLevelDecl*/ true);
                    // is it top level export import v = a.b.c in system module?
                    // if yes - it needs to be rewritten as exporter('v', v = a.b.c)
                    var isExported = isSourceFileLevelDeclarationInSystemJsModule(node, /*isExported*/ true);
                    if (!variableDeclarationIsHoisted) {
                        ts.Debug.assert(!isExported);
                        if (isES6ExportedDeclaration(node)) {
                            write("export ");
                            write("var ");
                        }
                        else if (!(node.flags & 1 /* Export */)) {
                            write("var ");
                        }
                    }
                    if (isExported) {
                        write(exportFunctionForFile + "(\"");
                        emitNodeWithoutSourceMap(node.name);
                        write("\", ");
                    }
                    emitModuleMemberName(node);
                    write(" = ");
                    emit(node.moduleReference);
                    if (isExported) {
                        write(")");
                    }
                    write(";");
                    emitEnd(node);
                    emitExportImportAssignments(node);
                    emitTrailingComments(node);
                }
            }
            function emitExportDeclaration(node) {
                ts.Debug.assert(modulekind !== ts.ModuleKind.System);
                if (modulekind !== ts.ModuleKind.ES6) {
                    if (node.moduleSpecifier && (!node.exportClause || resolver.isValueAliasDeclaration(node))) {
                        emitStart(node);
                        var generatedName = getGeneratedNameForNode(node);
                        if (node.exportClause) {
                            // export { x, y, ... } from "foo"
                            if (modulekind !== ts.ModuleKind.AMD) {
                                write("var ");
                                write(generatedName);
                                write(" = ");
                                emitRequire(ts.getExternalModuleName(node));
                                write(";");
                            }
                            for (var _a = 0, _b = node.exportClause.elements; _a < _b.length; _a++) {
                                var specifier = _b[_a];
                                if (resolver.isValueAliasDeclaration(specifier)) {
                                    writeLine();
                                    emitStart(specifier);
                                    emitContainingModuleName(specifier);
                                    write(".");
                                    emitNodeWithCommentsAndWithoutSourcemap(specifier.name);
                                    write(" = ");
                                    write(generatedName);
                                    write(".");
                                    emitNodeWithCommentsAndWithoutSourcemap(specifier.propertyName || specifier.name);
                                    write(";");
                                    emitEnd(specifier);
                                }
                            }
                        }
                        else {
                            // export * from "foo"
                            if (hasExportStarsToExportValues && resolver.moduleExportsSomeValue(node.moduleSpecifier)) {
                                writeLine();
                                write("__export(");
                                if (modulekind !== ts.ModuleKind.AMD) {
                                    emitRequire(ts.getExternalModuleName(node));
                                }
                                else {
                                    write(generatedName);
                                }
                                write(");");
                            }
                        }
                        emitEnd(node);
                    }
                }
                else {
                    if (!node.exportClause || resolver.isValueAliasDeclaration(node)) {
                        write("export ");
                        if (node.exportClause) {
                            // export { x, y, ... }
                            write("{ ");
                            emitExportOrImportSpecifierList(node.exportClause.elements, resolver.isValueAliasDeclaration);
                            write(" }");
                        }
                        else {
                            write("*");
                        }
                        if (node.moduleSpecifier) {
                            write(" from ");
                            emit(node.moduleSpecifier);
                        }
                        write(";");
                    }
                }
            }
            function emitExportOrImportSpecifierList(specifiers, shouldEmit) {
                ts.Debug.assert(modulekind === ts.ModuleKind.ES6);
                var needsComma = false;
                for (var _a = 0, specifiers_1 = specifiers; _a < specifiers_1.length; _a++) {
                    var specifier = specifiers_1[_a];
                    if (shouldEmit(specifier)) {
                        if (needsComma) {
                            write(", ");
                        }
                        if (specifier.propertyName) {
                            emit(specifier.propertyName);
                            write(" as ");
                        }
                        emit(specifier.name);
                        needsComma = true;
                    }
                }
            }
            function emitExportAssignment(node) {
                if (!node.isExportEquals && resolver.isValueAliasDeclaration(node)) {
                    if (modulekind === ts.ModuleKind.ES6) {
                        writeLine();
                        emitStart(node);
                        write("export default ");
                        var expression = node.expression;
                        emit(expression);
                        if (expression.kind !== 366 /* FunctionDeclaration */ &&
                            expression.kind !== 367 /* ClassDeclaration */) {
                            write(";");
                        }
                        emitEnd(node);
                    }
                    else {
                        writeLine();
                        emitStart(node);
                        if (modulekind === ts.ModuleKind.System) {
                            write(exportFunctionForFile + "(\"default\",");
                            emit(node.expression);
                            write(")");
                        }
                        else {
                            emitEs6ExportDefaultCompat(node);
                            emitContainingModuleName(node);
                            if (languageVersion === 0 /* ES3 */) {
                                write('["default"] = ');
                            }
                            else {
                                write(".default = ");
                            }
                            emit(node.expression);
                        }
                        write(";");
                        emitEnd(node);
                    }
                }
            }
            function collectExternalModuleInfo(sourceFile) {
                externalImports = [];
                exportSpecifiers = {};
                exportEquals = undefined;
                hasExportStarsToExportValues = false;
                for (var _a = 0, _b = sourceFile.statements; _a < _b.length; _a++) {
                    var node = _b[_a];
                    switch (node.kind) {
                        case 376 /* ImportDeclaration */:
                            if (!node.importClause ||
                                resolver.isReferencedAliasDeclaration(node.importClause, /*checkChildren*/ true)) {
                                // import "mod"
                                // import x from "mod" where x is referenced
                                // import * as x from "mod" where x is referenced
                                // import { x, y } from "mod" where at least one import is referenced
                                externalImports.push(node);
                            }
                            break;
                        case 375 /* ImportEqualsDeclaration */:
                            if (node.moduleReference.kind === 386 /* ExternalModuleReference */ && resolver.isReferencedAliasDeclaration(node)) {
                                // import x = require("mod") where x is referenced
                                externalImports.push(node);
                            }
                            break;
                        case 382 /* ExportDeclaration */:
                            if (node.moduleSpecifier) {
                                if (!node.exportClause) {
                                    // export * from "mod"
                                    if (resolver.moduleExportsSomeValue(node.moduleSpecifier)) {
                                        externalImports.push(node);
                                        hasExportStarsToExportValues = true;
                                    }
                                }
                                else if (resolver.isValueAliasDeclaration(node)) {
                                    // export { x, y } from "mod" where at least one export is a value symbol
                                    externalImports.push(node);
                                }
                            }
                            else {
                                // export { x, y }
                                for (var _c = 0, _d = node.exportClause.elements; _c < _d.length; _c++) {
                                    var specifier = _d[_c];
                                    var name_7 = (specifier.propertyName || specifier.name).text;
                                    (exportSpecifiers[name_7] || (exportSpecifiers[name_7] = [])).push(specifier);
                                }
                            }
                            break;
                        case 381 /* ExportAssignment */:
                            if (node.isExportEquals && !exportEquals) {
                                // export = x
                                exportEquals = node;
                            }
                            break;
                    }
                }
            }
            function emitExportStarHelper() {
                if (hasExportStarsToExportValues) {
                    writeLine();
                    write("function __export(m) {");
                    increaseIndent();
                    writeLine();
                    write("for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];");
                    decreaseIndent();
                    writeLine();
                    write("}");
                }
            }
            function getLocalNameForExternalImport(node) {
                var namespaceDeclaration = getNamespaceDeclarationNode(node);
                if (namespaceDeclaration && !isDefaultImport(node)) {
                    return ts.getTextOfNodeFromSourceText(currentText, namespaceDeclaration.name);
                }
                if (node.kind === 376 /* ImportDeclaration */ && node.importClause) {
                    return getGeneratedNameForNode(node);
                }
                if (node.kind === 382 /* ExportDeclaration */ && node.moduleSpecifier) {
                    return getGeneratedNameForNode(node);
                }
            }
            function getExternalModuleNameText(importNode, emitRelativePathAsModuleName) {
                if (emitRelativePathAsModuleName) {
                    var name_8 = getExternalModuleNameFromDeclaration(host, resolver, importNode);
                    if (name_8) {
                        return "\"" + name_8 + "\"";
                    }
                }
                var moduleName = ts.getExternalModuleName(importNode);
                if (moduleName.kind === 155 /* StringLiteral */) {
                    return tryRenameExternalModule(moduleName) || getLiteralText(moduleName);
                }
                return undefined;
            }
            function emitVariableDeclarationsForImports() {
                if (externalImports.length === 0) {
                    return;
                }
                writeLine();
                var started = false;
                for (var _a = 0, externalImports_1 = externalImports; _a < externalImports_1.length; _a++) {
                    var importNode = externalImports_1[_a];
                    // do not create variable declaration for exports and imports that lack import clause
                    var skipNode = importNode.kind === 382 /* ExportDeclaration */ ||
                        (importNode.kind === 376 /* ImportDeclaration */ && !importNode.importClause);
                    if (skipNode) {
                        continue;
                    }
                    if (!started) {
                        write("var ");
                        started = true;
                    }
                    else {
                        write(", ");
                    }
                    write(getLocalNameForExternalImport(importNode));
                }
                if (started) {
                    write(";");
                }
            }
            function emitLocalStorageForExportedNamesIfNecessary(exportedDeclarations) {
                // when resolving exports local exported entries/indirect exported entries in the module
                // should always win over entries with similar names that were added via star exports
                // to support this we store names of local/indirect exported entries in a set.
                // this set is used to filter names brought by star exports.
                if (!hasExportStarsToExportValues) {
                    // local names set is needed only in presence of star exports
                    return undefined;
                }
                // local names set should only be added if we have anything exported
                if (!exportedDeclarations && ts.isEmpty(exportSpecifiers)) {
                    // no exported declarations (export var ...) or export specifiers (export {x})
                    // check if we have any non star export declarations.
                    var hasExportDeclarationWithExportClause = false;
                    for (var _a = 0, externalImports_2 = externalImports; _a < externalImports_2.length; _a++) {
                        var externalImport = externalImports_2[_a];
                        if (externalImport.kind === 382 /* ExportDeclaration */ && externalImport.exportClause) {
                            hasExportDeclarationWithExportClause = true;
                            break;
                        }
                    }
                    if (!hasExportDeclarationWithExportClause) {
                        // we still need to emit exportStar helper
                        return emitExportStarFunction(/*localNames*/ undefined);
                    }
                }
                var exportedNamesStorageRef = makeUniqueName("exportedNames");
                writeLine();
                write("var " + exportedNamesStorageRef + " = {");
                increaseIndent();
                var started = false;
                if (exportedDeclarations) {
                    for (var i = 0; i < exportedDeclarations.length; i++) {
                        // write name of exported declaration, i.e 'export var x...'
                        writeExportedName(exportedDeclarations[i]);
                    }
                }
                if (exportSpecifiers) {
                    for (var n in exportSpecifiers) {
                        for (var _b = 0, _c = exportSpecifiers[n]; _b < _c.length; _b++) {
                            var specifier = _c[_b];
                            // write name of export specified, i.e. 'export {x}'
                            writeExportedName(specifier.name);
                        }
                    }
                }
                for (var _d = 0, externalImports_3 = externalImports; _d < externalImports_3.length; _d++) {
                    var externalImport = externalImports_3[_d];
                    if (externalImport.kind !== 382 /* ExportDeclaration */) {
                        continue;
                    }
                    var exportDecl = externalImport;
                    if (!exportDecl.exportClause) {
                        // export * from ...
                        continue;
                    }
                    for (var _e = 0, _f = exportDecl.exportClause.elements; _e < _f.length; _e++) {
                        var element = _f[_e];
                        // write name of indirectly exported entry, i.e. 'export {x} from ...'
                        writeExportedName(element.name || element.propertyName);
                    }
                }
                decreaseIndent();
                writeLine();
                write("};");
                return emitExportStarFunction(exportedNamesStorageRef);
                function emitExportStarFunction(localNames) {
                    var exportStarFunction = makeUniqueName("exportStar");
                    writeLine();
                    // define an export star helper function
                    write("function " + exportStarFunction + "(m) {");
                    increaseIndent();
                    writeLine();
                    write("var exports = {};");
                    writeLine();
                    write("for(var n in m) {");
                    increaseIndent();
                    writeLine();
                    write("if (n !== \"default\"");
                    if (localNames) {
                        write("&& !" + localNames + ".hasOwnProperty(n)");
                    }
                    write(") exports[n] = m[n];");
                    decreaseIndent();
                    writeLine();
                    write("}");
                    writeLine();
                    write(exportFunctionForFile + "(exports);");
                    decreaseIndent();
                    writeLine();
                    write("}");
                    return exportStarFunction;
                }
                function writeExportedName(node) {
                    // do not record default exports
                    // they are local to module and never overwritten (explicitly skipped) by star export
                    if (node.kind !== 215 /* Identifier */ && node.flags & 512 /* Default */) {
                        return;
                    }
                    if (started) {
                        write(",");
                    }
                    else {
                        started = true;
                    }
                    writeLine();
                    write("'");
                    if (node.kind === 215 /* Identifier */) {
                        emitNodeWithCommentsAndWithoutSourcemap(node);
                    }
                    else {
                        emitDeclarationName(node);
                    }
                    write("': true");
                }
            }
            function processTopLevelVariableAndFunctionDeclarations(node) {
                // per ES6 spec:
                // 15.2.1.16.4 ModuleDeclarationInstantiation() Concrete Method
                // - var declarations are initialized to undefined - 14.a.ii
                // - function/generator declarations are instantiated - 16.a.iv
                // this means that after module is instantiated but before its evaluation
                // exported functions are already accessible at import sites
                // in theory we should hoist only exported functions and its dependencies
                // in practice to simplify things we'll hoist all source level functions and variable declaration
                // including variables declarations for module and class declarations
                var hoistedVars;
                var hoistedFunctionDeclarations;
                var exportedDeclarations;
                visit(node);
                if (hoistedVars) {
                    writeLine();
                    write("var ");
                    var seen = {};
                    for (var i = 0; i < hoistedVars.length; i++) {
                        var local = hoistedVars[i];
                        var name_9 = local.kind === 215 /* Identifier */
                            ? local
                            : local.name;
                        if (name_9) {
                            // do not emit duplicate entries (in case of declaration merging) in the list of hoisted variables
                            var text = ts.unescapeIdentifier(name_9.text);
                            if (ts.hasProperty(seen, text)) {
                                continue;
                            }
                            else {
                                seen[text] = text;
                            }
                        }
                        if (i !== 0) {
                            write(", ");
                        }
                        if (local.kind === 367 /* ClassDeclaration */ || local.kind === 371 /* ModuleDeclaration */ || local.kind === 370 /* EnumDeclaration */) {
                            emitDeclarationName(local);
                        }
                        else {
                            emit(local);
                        }
                        var flags = ts.getCombinedNodeFlags(local.kind === 215 /* Identifier */ ? local.parent : local);
                        if (flags & 1 /* Export */) {
                            if (!exportedDeclarations) {
                                exportedDeclarations = [];
                            }
                            exportedDeclarations.push(local);
                        }
                    }
                    write(";");
                }
                if (hoistedFunctionDeclarations) {
                    for (var _a = 0, hoistedFunctionDeclarations_1 = hoistedFunctionDeclarations; _a < hoistedFunctionDeclarations_1.length; _a++) {
                        var f = hoistedFunctionDeclarations_1[_a];
                        writeLine();
                        emit(f);
                        if (f.flags & 1 /* Export */) {
                            if (!exportedDeclarations) {
                                exportedDeclarations = [];
                            }
                            exportedDeclarations.push(f);
                        }
                    }
                }
                return exportedDeclarations;
                function visit(node) {
                    if (node.flags & 2 /* Ambient */) {
                        return;
                    }
                    if (node.kind === 366 /* FunctionDeclaration */) {
                        if (!hoistedFunctionDeclarations) {
                            hoistedFunctionDeclarations = [];
                        }
                        hoistedFunctionDeclarations.push(node);
                        return;
                    }
                    if (node.kind === 367 /* ClassDeclaration */) {
                        if (!hoistedVars) {
                            hoistedVars = [];
                        }
                        hoistedVars.push(node);
                        return;
                    }
                    if (node.kind === 370 /* EnumDeclaration */) {
                        if (shouldEmitEnumDeclaration(node)) {
                            if (!hoistedVars) {
                                hoistedVars = [];
                            }
                            hoistedVars.push(node);
                        }
                        return;
                    }
                    if (node.kind === 371 /* ModuleDeclaration */) {
                        if (shouldEmitModuleDeclaration(node)) {
                            if (!hoistedVars) {
                                hoistedVars = [];
                            }
                            hoistedVars.push(node);
                        }
                        return;
                    }
                    if (node.kind === 364 /* VariableDeclaration */ || node.kind === 315 /* BindingElement */) {
                        if (shouldHoistVariable(node, /*checkIfSourceFileLevelDecl*/ false)) {
                            var name_10 = node.name;
                            if (name_10.kind === 215 /* Identifier */) {
                                if (!hoistedVars) {
                                    hoistedVars = [];
                                }
                                hoistedVars.push(name_10);
                            }
                            else {
                                ts.forEachChild(name_10, visit);
                            }
                        }
                        return;
                    }
                    if (ts.isInternalModuleImportEqualsDeclaration(node) && resolver.isValueAliasDeclaration(node)) {
                        if (!hoistedVars) {
                            hoistedVars = [];
                        }
                        hoistedVars.push(node.name);
                        return;
                    }
                    if (ts.isBindingPattern(node)) {
                        ts.forEach(node.elements, visit);
                        return;
                    }
                    if (!ts.isDeclaration(node)) {
                        ts.forEachChild(node, visit);
                    }
                }
            }
            function shouldHoistVariable(node, checkIfSourceFileLevelDecl) {
                if (checkIfSourceFileLevelDecl && !shouldHoistDeclarationInSystemJsModule(node)) {
                    return false;
                }
                // hoist variable if
                // - it is not block scoped
                // - it is top level block scoped
                // if block scoped variables are nested in some another block then
                // no other functions can use them except ones that are defined at least in the same block
                return (ts.getCombinedNodeFlags(node) & 3072 /* BlockScoped */) === 0 ||
                    ts.getEnclosingBlockScopeContainer(node).kind === 402 /* SourceFile */;
            }
            function isCurrentFileSystemExternalModule() {
                return modulekind === ts.ModuleKind.System && isCurrentFileExternalModule;
            }
            function emitSystemModuleBody(node, dependencyGroups, startIndex) {
                // shape of the body in system modules:
                // function (exports) {
                //     <list of local aliases for imports>
                //     <hoisted function declarations>
                //     <hoisted variable declarations>
                //     return {
                //         setters: [
                //             <list of setter function for imports>
                //         ],
                //         execute: function() {
                //             <module statements>
                //         }
                //     }
                //     <temp declarations>
                // }
                // I.e:
                // import {x} from 'file1'
                // var y = 1;
                // export function foo() { return y + x(); }
                // console.log(y);
                // will be transformed to
                // function(exports) {
                //     var file1; // local alias
                //     var y;
                //     function foo() { return y + file1.x(); }
                //     exports("foo", foo);
                //     return {
                //         setters: [
                //             function(v) { file1 = v }
                //         ],
                //         execute(): function() {
                //             y = 1;
                //             console.log(y);
                //         }
                //     };
                // }
                emitVariableDeclarationsForImports();
                writeLine();
                var exportedDeclarations = processTopLevelVariableAndFunctionDeclarations(node);
                var exportStarFunction = emitLocalStorageForExportedNamesIfNecessary(exportedDeclarations);
                writeLine();
                write("return {");
                increaseIndent();
                writeLine();
                emitSetters(exportStarFunction, dependencyGroups);
                writeLine();
                emitExecute(node, startIndex);
                decreaseIndent();
                writeLine();
                write("}"); // return
                emitTempDeclarations(/*newLine*/ true);
            }
            function emitSetters(exportStarFunction, dependencyGroups) {
                write("setters:[");
                for (var i = 0; i < dependencyGroups.length; i++) {
                    if (i !== 0) {
                        write(",");
                    }
                    writeLine();
                    increaseIndent();
                    var group = dependencyGroups[i];
                    // derive a unique name for parameter from the first named entry in the group
                    var parameterName = makeUniqueName(ts.forEach(group, getLocalNameForExternalImport) || "");
                    write("function (" + parameterName + ") {");
                    increaseIndent();
                    for (var _a = 0, group_1 = group; _a < group_1.length; _a++) {
                        var entry = group_1[_a];
                        var importVariableName = getLocalNameForExternalImport(entry) || "";
                        switch (entry.kind) {
                            case 376 /* ImportDeclaration */:
                                if (!entry.importClause) {
                                    // 'import "..."' case
                                    // module is imported only for side-effects, no emit required
                                    break;
                                }
                            // fall-through
                            case 375 /* ImportEqualsDeclaration */:
                                ts.Debug.assert(importVariableName !== "");
                                writeLine();
                                // save import into the local
                                write(importVariableName + " = " + parameterName + ";");
                                writeLine();
                                break;
                            case 382 /* ExportDeclaration */:
                                ts.Debug.assert(importVariableName !== "");
                                if (entry.exportClause) {
                                    // export {a, b as c} from 'foo'
                                    // emit as:
                                    // exports_({
                                    //    "a": _["a"],
                                    //    "c": _["b"]
                                    // });
                                    writeLine();
                                    write(exportFunctionForFile + "({");
                                    writeLine();
                                    increaseIndent();
                                    for (var i_1 = 0, len = entry.exportClause.elements.length; i_1 < len; i_1++) {
                                        if (i_1 !== 0) {
                                            write(",");
                                            writeLine();
                                        }
                                        var e = entry.exportClause.elements[i_1];
                                        write("\"");
                                        emitNodeWithCommentsAndWithoutSourcemap(e.name);
                                        write("\": " + parameterName + "[\"");
                                        emitNodeWithCommentsAndWithoutSourcemap(e.propertyName || e.name);
                                        write("\"]");
                                    }
                                    decreaseIndent();
                                    writeLine();
                                    write("});");
                                }
                                else {
                                    // collectExternalModuleInfo prefilters star exports to keep only ones that export values
                                    // this means that check 'resolver.moduleExportsSomeValue' is redundant and can be omitted here
                                    writeLine();
                                    // export * from 'foo'
                                    // emit as:
                                    // exportStar(_foo);
                                    write(exportStarFunction + "(" + parameterName + ");");
                                }
                                writeLine();
                                break;
                        }
                    }
                    decreaseIndent();
                    write("}");
                    decreaseIndent();
                }
                write("],");
            }
            function emitExecute(node, startIndex) {
                write("execute: function() {");
                increaseIndent();
                writeLine();
                for (var i = startIndex; i < node.statements.length; i++) {
                    var statement = node.statements[i];
                    switch (statement.kind) {
                        // - function declarations are not emitted because they were already hoisted
                        // - import declarations are not emitted since they are already handled in setters
                        // - export declarations with module specifiers are not emitted since they were already written in setters
                        // - export declarations without module specifiers are emitted preserving the order
                        case 366 /* FunctionDeclaration */:
                        case 376 /* ImportDeclaration */:
                            continue;
                        case 382 /* ExportDeclaration */:
                            if (!statement.moduleSpecifier) {
                                for (var _a = 0, _b = statement.exportClause.elements; _a < _b.length; _a++) {
                                    var element = _b[_a];
                                    // write call to exporter function for every export specifier in exports list
                                    emitExportSpecifierInSystemModule(element);
                                }
                            }
                            continue;
                        case 375 /* ImportEqualsDeclaration */:
                            if (!ts.isInternalModuleImportEqualsDeclaration(statement)) {
                                // - import equals declarations that import external modules are not emitted
                                continue;
                            }
                        // fall-though for import declarations that import internal modules
                        default:
                            writeLine();
                            emit(statement);
                    }
                }
                decreaseIndent();
                writeLine();
                write("}"); // execute
            }
            function writeModuleName(node, emitRelativePathAsModuleName) {
                var moduleName = node.moduleName;
                if (moduleName || (emitRelativePathAsModuleName && (moduleName = getResolvedExternalModuleName(host, node)))) {
                    write("\"" + moduleName + "\", ");
                }
            }
            function emitSystemModule(node, emitRelativePathAsModuleName) {
                collectExternalModuleInfo(node);
                // System modules has the following shape
                // System.register(['dep-1', ... 'dep-n'], function(exports) {/* module body function */})
                // 'exports' here is a function 'exports<T>(name: string, value: T): T' that is used to publish exported values.
                // 'exports' returns its 'value' argument so in most cases expressions
                // that mutate exported values can be rewritten as:
                // expr -> exports('name', expr).
                // The only exception in this rule is postfix unary operators,
                // see comment to 'emitPostfixUnaryExpression' for more details
                ts.Debug.assert(!exportFunctionForFile);
                // make sure that  name of 'exports' function does not conflict with existing identifiers
                exportFunctionForFile = makeUniqueName("exports");
                contextObjectForFile = makeUniqueName("context");
                writeLine();
                write("System.register(");
                writeModuleName(node, emitRelativePathAsModuleName);
                write("[");
                var groupIndices = {};
                var dependencyGroups = [];
                for (var i = 0; i < externalImports.length; i++) {
                    var text = getExternalModuleNameText(externalImports[i], emitRelativePathAsModuleName);
                    if (text === undefined) {
                        continue;
                    }
                    // text should be quoted string
                    // for deduplication purposes in key remove leading and trailing quotes so 'a' and "a" will be considered the same
                    var key = text.substr(1, text.length - 2);
                    if (ts.hasProperty(groupIndices, key)) {
                        // deduplicate/group entries in dependency list by the dependency name
                        var groupIndex = groupIndices[key];
                        dependencyGroups[groupIndex].push(externalImports[i]);
                        continue;
                    }
                    else {
                        groupIndices[key] = dependencyGroups.length;
                        dependencyGroups.push([externalImports[i]]);
                    }
                    if (i !== 0) {
                        write(", ");
                    }
                    write(text);
                }
                write("], function(" + exportFunctionForFile + ", " + contextObjectForFile + ") {");
                writeLine();
                increaseIndent();
                var startIndex = emitDirectivePrologues(node.statements, /*startWithNewLine*/ true, /*ensureUseStrict*/ !compilerOptions.noImplicitUseStrict);
                writeLine();
                write("var __moduleName = " + contextObjectForFile + " && " + contextObjectForFile + ".id;");
                writeLine();
                emitEmitHelpers(node);
                emitCaptureThisForNodeIfNecessary(node);
                emitSystemModuleBody(node, dependencyGroups, startIndex);
                decreaseIndent();
                writeLine();
                write("});");
            }
            function getAMDDependencyNames(node, includeNonAmdDependencies, emitRelativePathAsModuleName) {
                // names of modules with corresponding parameter in the factory function
                var aliasedModuleNames = [];
                // names of modules with no corresponding parameters in factory function
                var unaliasedModuleNames = [];
                var importAliasNames = []; // names of the parameters in the factory function; these
                // parameters need to match the indexes of the corresponding
                // module names in aliasedModuleNames.
                // Fill in amd-dependency tags
                for (var _a = 0, _b = node.amdDependencies; _a < _b.length; _a++) {
                    var amdDependency = _b[_a];
                    if (amdDependency.name) {
                        aliasedModuleNames.push('"' + amdDependency.path + '"');
                        importAliasNames.push(amdDependency.name);
                    }
                    else {
                        unaliasedModuleNames.push('"' + amdDependency.path + '"');
                    }
                }
                for (var _c = 0, externalImports_4 = externalImports; _c < externalImports_4.length; _c++) {
                    var importNode = externalImports_4[_c];
                    // Find the name of the external module
                    var externalModuleName = getExternalModuleNameText(importNode, emitRelativePathAsModuleName);
                    // Find the name of the module alias, if there is one
                    var importAliasName = getLocalNameForExternalImport(importNode);
                    if (includeNonAmdDependencies && importAliasName) {
                        aliasedModuleNames.push(externalModuleName);
                        importAliasNames.push(importAliasName);
                    }
                    else {
                        unaliasedModuleNames.push(externalModuleName);
                    }
                }
                return { aliasedModuleNames: aliasedModuleNames, unaliasedModuleNames: unaliasedModuleNames, importAliasNames: importAliasNames };
            }
            function emitAMDDependencies(node, includeNonAmdDependencies, emitRelativePathAsModuleName) {
                // An AMD define function has the following shape:
                //     define(id?, dependencies?, factory);
                //
                // This has the shape of
                //     define(name, ["module1", "module2"], function (module1Alias) {
                // The location of the alias in the parameter list in the factory function needs to
                // match the position of the module name in the dependency list.
                //
                // To ensure this is true in cases of modules with no aliases, e.g.:
                // `import "module"` or `<amd-dependency path= "a.css" />`
                // we need to add modules without alias names to the end of the dependencies list
                var dependencyNames = getAMDDependencyNames(node, includeNonAmdDependencies, emitRelativePathAsModuleName);
                emitAMDDependencyList(dependencyNames);
                write(", ");
                emitAMDFactoryHeader(dependencyNames);
            }
            function emitAMDDependencyList(_a) {
                var aliasedModuleNames = _a.aliasedModuleNames, unaliasedModuleNames = _a.unaliasedModuleNames;
                write('["require", "exports"');
                if (aliasedModuleNames.length) {
                    write(", ");
                    write(aliasedModuleNames.join(", "));
                }
                if (unaliasedModuleNames.length) {
                    write(", ");
                    write(unaliasedModuleNames.join(", "));
                }
                write("]");
            }
            function emitAMDFactoryHeader(_a) {
                var importAliasNames = _a.importAliasNames;
                write("function (require, exports");
                if (importAliasNames.length) {
                    write(", ");
                    write(importAliasNames.join(", "));
                }
                write(") {");
            }
            function emitAMDModule(node, emitRelativePathAsModuleName) {
                emitEmitHelpers(node);
                collectExternalModuleInfo(node);
                writeLine();
                write("define(");
                writeModuleName(node, emitRelativePathAsModuleName);
                emitAMDDependencies(node, /*includeNonAmdDependencies*/ true, emitRelativePathAsModuleName);
                increaseIndent();
                var startIndex = emitDirectivePrologues(node.statements, /*startWithNewLine*/ true, /*ensureUseStrict*/ !compilerOptions.noImplicitUseStrict);
                emitExportStarHelper();
                emitCaptureThisForNodeIfNecessary(node);
                emitLinesStartingAt(node.statements, startIndex);
                emitExportEquals(/*emitAsReturn*/ true);
                emitTempDeclarations(/*newLine*/ true);
                decreaseIndent();
                writeLine();
                write("});");
            }
            function emitCommonJSModule(node) {
                var startIndex = emitDirectivePrologues(node.statements, /*startWithNewLine*/ false, /*ensureUseStrict*/ !compilerOptions.noImplicitUseStrict);
                emitEmitHelpers(node);
                collectExternalModuleInfo(node);
                emitExportStarHelper();
                emitCaptureThisForNodeIfNecessary(node);
                emitLinesStartingAt(node.statements, startIndex);
                emitExportEquals(/*emitAsReturn*/ false);
                emitTempDeclarations(/*newLine*/ true);
            }
            function emitUMDModule(node) {
                emitEmitHelpers(node);
                collectExternalModuleInfo(node);
                var dependencyNames = getAMDDependencyNames(node, /*includeNonAmdDependencies*/ false);
                // Module is detected first to support Browserify users that load into a browser with an AMD loader
                writeLines("(function (factory) {\n    if (typeof module === 'object' && typeof module.exports === 'object') {\n        var v = factory(require, exports); if (v !== undefined) module.exports = v;\n    }\n    else if (typeof define === 'function' && define.amd) {\n        define(");
                emitAMDDependencyList(dependencyNames);
                write(", factory);");
                writeLines("    }\n})(");
                emitAMDFactoryHeader(dependencyNames);
                increaseIndent();
                var startIndex = emitDirectivePrologues(node.statements, /*startWithNewLine*/ true, /*ensureUseStrict*/ !compilerOptions.noImplicitUseStrict);
                emitExportStarHelper();
                emitCaptureThisForNodeIfNecessary(node);
                emitLinesStartingAt(node.statements, startIndex);
                emitExportEquals(/*emitAsReturn*/ true);
                emitTempDeclarations(/*newLine*/ true);
                decreaseIndent();
                writeLine();
                write("});");
            }
            function emitES6Module(node) {
                externalImports = undefined;
                exportSpecifiers = undefined;
                exportEquals = undefined;
                hasExportStarsToExportValues = false;
                var startIndex = emitDirectivePrologues(node.statements, /*startWithNewLine*/ false);
                emitEmitHelpers(node);
                emitCaptureThisForNodeIfNecessary(node);
                emitLinesStartingAt(node.statements, startIndex);
                emitTempDeclarations(/*newLine*/ true);
                // Emit exportDefault if it exists will happen as part
                // or normal statement emit.
            }
            function emitExportEquals(emitAsReturn) {
                if (exportEquals && resolver.isValueAliasDeclaration(exportEquals)) {
                    writeLine();
                    emitStart(exportEquals);
                    write(emitAsReturn ? "return " : "module.exports = ");
                    emit(exportEquals.expression);
                    write(";");
                    emitEnd(exportEquals);
                }
            }
            function emitJsxElement(node) {
                switch (compilerOptions.jsx) {
                    case 2 /* React */:
                        jsxEmitReact(node);
                        break;
                    case 1 /* Preserve */:
                    // Fall back to preserve if None was specified (we'll error earlier)
                    default:
                        jsxEmitPreserve(node);
                        break;
                }
            }
            function trimReactWhitespaceAndApplyEntities(node) {
                var result = undefined;
                var text = ts.getTextOfNode(node, /*includeTrivia*/ true);
                var firstNonWhitespace = 0;
                var lastNonWhitespace = -1;
                // JSX trims whitespace at the end and beginning of lines, except that the
                // start/end of a tag is considered a start/end of a line only if that line is
                // on the same line as the closing tag. See examples in tests/cases/conformance/jsx/tsxReactEmitWhitespace.tsx
                for (var i = 0; i < text.length; i++) {
                    var c = text.charCodeAt(i);
                    if (ts.isLineBreak(c)) {
                        if (firstNonWhitespace !== -1 && (lastNonWhitespace - firstNonWhitespace + 1 > 0)) {
                            var part = text.substr(firstNonWhitespace, lastNonWhitespace - firstNonWhitespace + 1);
                            result = (result ? result + "\" + ' ' + \"" : "") + ts.escapeString(part);
                        }
                        firstNonWhitespace = -1;
                    }
                    else if (!ts.isNoBreakWhiteSpace(c)) {
                        lastNonWhitespace = i;
                        if (firstNonWhitespace === -1) {
                            firstNonWhitespace = i;
                        }
                    }
                }
                if (firstNonWhitespace !== -1) {
                    var part = text.substr(firstNonWhitespace);
                    result = (result ? result + "\" + ' ' + \"" : "") + ts.escapeString(part);
                }
                if (result) {
                    // Replace entities like &nbsp;
                    result = result.replace(/&(\w+);/g, function (s, m) {
                        if (entities[m] !== undefined) {
                            var ch = String.fromCharCode(entities[m]);
                            // &quot; needs to be escaped
                            return ch === '"' ? "\\\"" : ch;
                        }
                        else {
                            return s;
                        }
                    });
                }
                return result;
            }
            function isJsxChildEmittable(child) {
                if (child.kind === 394 /* JsxExpression */) {
                    // Don't emit empty expressions
                    return !!child.expression;
                }
                else if (child.kind === 390 /* JsxText */) {
                    // Don't emit empty strings
                    return !!getTextToEmit(child);
                }
                return true;
            }
            ;
            function getTextToEmit(node) {
                switch (compilerOptions.jsx) {
                    case 2 /* React */:
                        var text = trimReactWhitespaceAndApplyEntities(node);
                        if (text === undefined || text.length === 0) {
                            return undefined;
                        }
                        else {
                            return text;
                        }
                    case 1 /* Preserve */:
                    default:
                        return ts.getTextOfNode(node, /*includeTrivia*/ true);
                }
            }
            function emitJsxText(node) {
                switch (compilerOptions.jsx) {
                    case 2 /* React */:
                        write('"');
                        write(trimReactWhitespaceAndApplyEntities(node));
                        write('"');
                        break;
                    case 1 /* Preserve */:
                    default:
                        writer.writeLiteral(ts.getTextOfNode(node, /*includeTrivia*/ true));
                        break;
                }
            }
            function emitJsxExpression(node) {
                if (node.expression) {
                    switch (compilerOptions.jsx) {
                        case 1 /* Preserve */:
                        default:
                            write("{");
                            emit(node.expression);
                            write("}");
                            break;
                        case 2 /* React */:
                            emit(node.expression);
                            break;
                    }
                }
            }
            function isUseStrictPrologue(node) {
                return node.expression.text === "use strict";
            }
            function ensureUseStrictPrologue(startWithNewLine, writeUseStrict) {
                if (writeUseStrict) {
                    if (startWithNewLine) {
                        writeLine();
                    }
                    write("\"use strict\";");
                }
            }
            function emitDirectivePrologues(statements, startWithNewLine, ensureUseStrict) {
                var foundUseStrict = false;
                for (var i = 0; i < statements.length; i++) {
                    if (ts.isPrologueDirective(statements[i])) {
                        if (isUseStrictPrologue(statements[i])) {
                            foundUseStrict = true;
                        }
                        if (startWithNewLine || i > 0) {
                            writeLine();
                        }
                        emit(statements[i]);
                    }
                    else {
                        ensureUseStrictPrologue(startWithNewLine || i > 0, !foundUseStrict && ensureUseStrict);
                        // return index of the first non prologue directive
                        return i;
                    }
                }
                ensureUseStrictPrologue(startWithNewLine, !foundUseStrict && ensureUseStrict);
                return statements.length;
            }
            function writeLines(text) {
                var lines = text.split(/\r\n|\r|\n/g);
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    if (line.length) {
                        writeLine();
                        write(line);
                    }
                }
            }
            function emitEmitHelpers(node) {
                // Only emit helpers if the user did not say otherwise.
                if (!compilerOptions.noEmitHelpers) {
                    // Only Emit __extends function when target ES5.
                    // For target ES6 and above, we can emit classDeclaration as is.
                    if (languageVersion < 2 /* ES6 */ && !extendsEmitted && node.flags & 262144 /* HasClassExtends */) {
                        writeLines(extendsHelper);
                        extendsEmitted = true;
                    }
                    if (compilerOptions.jsx !== 1 /* Preserve */ && !assignEmitted && (node.flags & 1073741824 /* HasJsxSpreadAttribute */)) {
                        writeLines(assignHelper);
                        assignEmitted = true;
                    }
                    if (!decorateEmitted && node.flags & 524288 /* HasDecorators */) {
                        writeLines(decorateHelper);
                        if (compilerOptions.emitDecoratorMetadata) {
                            writeLines(metadataHelper);
                        }
                        decorateEmitted = true;
                    }
                    if (!paramEmitted && node.flags & 1048576 /* HasParamDecorators */) {
                        writeLines(paramHelper);
                        paramEmitted = true;
                    }
                    if (!awaiterEmitted && node.flags & 2097152 /* HasAsyncFunctions */) {
                        writeLines(awaiterHelper);
                        awaiterEmitted = true;
                    }
                }
            }
            function emitSourceFileNode(node) {
                // Start new file on new line
                writeLine();
                emitShebang();
                emitDetachedCommentsAndUpdateCommentsInfo(node);
                if (ts.isExternalModule(node) || compilerOptions.isolatedModules) {
                    if (isOwnFileEmit || (!ts.isExternalModule(node) && compilerOptions.isolatedModules)) {
                        var emitModule = moduleEmitDelegates[modulekind] || moduleEmitDelegates[ts.ModuleKind.CommonJS];
                        emitModule(node);
                    }
                    else {
                        bundleEmitDelegates[modulekind](node, /*emitRelativePathAsModuleName*/ true);
                    }
                }
                else {
                    // emit prologue directives prior to __extends
                    var startIndex = emitDirectivePrologues(node.statements, /*startWithNewLine*/ false);
                    externalImports = undefined;
                    exportSpecifiers = undefined;
                    exportEquals = undefined;
                    hasExportStarsToExportValues = false;
                    emitEmitHelpers(node);
                    emitCaptureThisForNodeIfNecessary(node);
                    emitLinesStartingAt(node.statements, startIndex);
                    emitTempDeclarations(/*newLine*/ true);
                }
                emitLeadingComments(node.endOfFileToken);
            }
            function emit(node) {
                emitNodeConsideringCommentsOption(node, emitNodeWithSourceMap);
            }
            function emitNodeWithCommentsAndWithoutSourcemap(node) {
                emitNodeConsideringCommentsOption(node, emitNodeWithoutSourceMap);
            }
            function emitNodeConsideringCommentsOption(node, emitNodeConsideringSourcemap) {
                if (node) {
                    if (node.flags & 2 /* Ambient */) {
                        return emitCommentsOnNotEmittedNode(node);
                    }
                    if (isSpecializedCommentHandling(node)) {
                        // This is the node that will handle its own comments and sourcemap
                        return emitNodeWithoutSourceMap(node);
                    }
                    var emitComments_1 = shouldEmitLeadingAndTrailingComments(node);
                    if (emitComments_1) {
                        emitLeadingComments(node);
                    }
                    emitNodeConsideringSourcemap(node);
                    if (emitComments_1) {
                        emitTrailingComments(node);
                    }
                }
            }
            function emitNodeWithSourceMap(node) {
                if (node) {
                    emitStart(node);
                    emitNodeWithoutSourceMap(node);
                    emitEnd(node);
                }
            }
            function emitNodeWithoutSourceMap(node) {
                if (node) {
                    emitJavaScriptWorker(node);
                }
            }
            function changeSourceMapEmit(writer) {
                sourceMap = writer;
                emitStart = writer.emitStart;
                emitEnd = writer.emitEnd;
                emitPos = writer.emitPos;
                setSourceFile = writer.setSourceFile;
            }
            function withTemporaryNoSourceMap(callback) {
                var prevSourceMap = sourceMap;
                setSourceMapWriterEmit(ts.getNullSourceMapWriter());
                callback();
                setSourceMapWriterEmit(prevSourceMap);
            }
            function isSpecializedCommentHandling(node) {
                switch (node.kind) {
                    // All of these entities are emitted in a specialized fashion.  As such, we allow
                    // the specialized methods for each to handle the comments on the nodes.
                    case 368 /* InterfaceDeclaration */:
                    case 366 /* FunctionDeclaration */:
                    case 376 /* ImportDeclaration */:
                    case 375 /* ImportEqualsDeclaration */:
                    case 369 /* TypeAliasDeclaration */:
                    case 381 /* ExportAssignment */:
                        return true;
                }
            }
            function shouldEmitLeadingAndTrailingComments(node) {
                switch (node.kind) {
                    case 346 /* VariableStatement */:
                        return shouldEmitLeadingAndTrailingCommentsForVariableStatement(node);
                    case 371 /* ModuleDeclaration */:
                        // Only emit the leading/trailing comments for a module if we're actually
                        // emitting the module as well.
                        return shouldEmitModuleDeclaration(node);
                    case 370 /* EnumDeclaration */:
                        // Only emit the leading/trailing comments for an enum if we're actually
                        // emitting the module as well.
                        return shouldEmitEnumDeclaration(node);
                }
                // If the node is emitted in specialized fashion, dont emit comments as this node will handle
                // emitting comments when emitting itself
                ts.Debug.assert(!isSpecializedCommentHandling(node));
                // If this is the expression body of an arrow function that we're down-leveling,
                // then we don't want to emit comments when we emit the body.  It will have already
                // been taken care of when we emitted the 'return' statement for the function
                // expression body.
                if (node.kind !== 345 /* Block */ &&
                    node.parent &&
                    node.parent.kind === 326 /* ArrowFunction */ &&
                    node.parent.body === node &&
                    languageVersion <= 1 /* ES5 */) {
                    return false;
                }
                // Emit comments for everything else.
                return true;
            }
            function emitJavaScriptWorker(node) {
                // Check if the node can be emitted regardless of the ScriptTarget
                switch (node.kind) {
                    case 215 /* Identifier */:
                        return emitIdentifier(node);
                    case 288 /* Parameter */:
                        return emitParameter(node);
                    case 293 /* MethodDeclaration */:
                    case 292 /* MethodSignature */:
                        return emitMethod(node);
                    case 295 /* GetAccessor */:
                    case 296 /* SetAccessor */:
                        return emitAccessor(node);
                    case 29 /* this */:
                        return emitThis(node);
                    case 30 /* super */:
                        return emitSuper(node);
                    case 26 /* null */:
                        return write("null");
                    case 27 /* true */:
                        return write("true");
                    case 28 /* false */:
                        return write("false");
                    case 154 /* NumericLiteral */:
                    case 155 /* StringLiteral */:
                    case 156 /* RegularExpressionLiteral */:
                    case 157 /* NoSubstitutionTemplateLiteral */:
                    case 158 /* TemplateHead */:
                    case 159 /* TemplateMiddle */:
                    case 160 /* TemplateTail */:
                        return emitLiteral(node);
                    case 335 /* TemplateExpression */:
                        return emitTemplateExpression(node);
                    case 343 /* TemplateSpan */:
                        return emitTemplateSpan(node);
                    case 387 /* JsxElement */:
                    case 388 /* JsxSelfClosingElement */:
                        return emitJsxElement(node);
                    case 390 /* JsxText */:
                        return emitJsxText(node);
                    case 394 /* JsxExpression */:
                        return emitJsxExpression(node);
                    case 285 /* QualifiedName */:
                        return emitQualifiedName(node);
                    case 313 /* ObjectBindingPattern */:
                        return emitObjectBindingPattern(node);
                    case 314 /* ArrayBindingPattern */:
                        return emitArrayBindingPattern(node);
                    case 315 /* BindingElement */:
                        return emitBindingElement(node);
                    case 316 /* ArrayLiteralExpression */:
                        return emitArrayLiteral(node);
                    case 317 /* ObjectLiteralExpression */:
                        return emitObjectLiteral(node);
                    case 399 /* PropertyAssignment */:
                        return emitPropertyAssignment(node);
                    case 400 /* ShorthandPropertyAssignment */:
                        return emitShorthandPropertyAssignment(node);
                    case 286 /* ComputedPropertyName */:
                        return emitComputedPropertyName(node);
                    case 318 /* PropertyAccessExpression */:
                        return emitPropertyAccess(node);
                    case 319 /* ElementAccessExpression */:
                        return emitIndexedAccess(node);
                    case 320 /* CallExpression */:
                        return emitCallExpression(node);
                    case 321 /* NewExpression */:
                        return emitNewExpression(node);
                    case 322 /* TaggedTemplateExpression */:
                        return emitTaggedTemplateExpression(node);
                    case 323 /* TypeAssertionExpression */:
                    case 341 /* AsExpression */:
                    case 342 /* NonNullExpression */:
                        return emit(node.expression);
                    case 324 /* ParenthesizedExpression */:
                        return emitParenExpression(node);
                    case 366 /* FunctionDeclaration */:
                    case 325 /* FunctionExpression */:
                    case 326 /* ArrowFunction */:
                        return emitFunctionDeclaration(node);
                    case 327 /* DeleteExpression */:
                        return emitDeleteExpression(node);
                    case 328 /* TypeOfExpression */:
                        return emitTypeOfExpression(node);
                    case 329 /* VoidExpression */:
                        return emitVoidExpression(node);
                    case 330 /* AwaitExpression */:
                        return emitAwaitExpression(node);
                    case 331 /* PrefixUnaryExpression */:
                        return emitPrefixUnaryExpression(node);
                    case 332 /* PostfixUnaryExpression */:
                        return emitPostfixUnaryExpression(node);
                    case 333 /* BinaryExpression */:
                        return emitBinaryExpression(node);
                    case 334 /* ConditionalExpression */:
                        return emitConditionalExpression(node);
                    case 337 /* SpreadElementExpression */:
                        return emitSpreadElementExpression(node);
                    case 336 /* YieldExpression */:
                        return emitYieldExpression(node);
                    case 339 /* OmittedExpression */:
                        return;
                    case 345 /* Block */:
                    case 372 /* ModuleBlock */:
                        return emitBlock(node);
                    case 346 /* VariableStatement */:
                        return emitVariableStatement(node);
                    case 347 /* EmptyStatement */:
                        return write(";");
                    case 348 /* ExpressionStatement */:
                        return emitExpressionStatement(node);
                    case 349 /* IfStatement */:
                        return emitIfStatement(node);
                    case 350 /* DoStatement */:
                        return emitDoStatement(node);
                    case 351 /* WhileStatement */:
                        return emitWhileStatement(node);
                    case 352 /* ForStatement */:
                        return emitForStatement(node);
                    case 354 /* ForOfStatement */:
                    case 353 /* ForInStatement */:
                        return emitForInOrForOfStatement(node);
                    case 355 /* ContinueStatement */:
                    case 356 /* BreakStatement */:
                        return emitBreakOrContinueStatement(node);
                    case 357 /* ReturnStatement */:
                        return emitReturnStatement(node);
                    case 358 /* WithStatement */:
                        return emitWithStatement(node);
                    case 359 /* SwitchStatement */:
                        return emitSwitchStatement(node);
                    case 395 /* CaseClause */:
                    case 396 /* DefaultClause */:
                        return emitCaseOrDefaultClause(node);
                    case 360 /* LabeledStatement */:
                        return emitLabeledStatement(node);
                    case 361 /* ThrowStatement */:
                        return emitThrowStatement(node);
                    case 362 /* TryStatement */:
                        return emitTryStatement(node);
                    case 398 /* CatchClause */:
                        return emitCatchClause(node);
                    case 363 /* DebuggerStatement */:
                        return emitDebuggerStatement(node);
                    case 364 /* VariableDeclaration */:
                        return emitVariableDeclaration(node);
                    case 338 /* ClassExpression */:
                        return emitClassExpression(node);
                    case 367 /* ClassDeclaration */:
                        return emitClassDeclaration(node);
                    case 368 /* InterfaceDeclaration */:
                        return emitInterfaceDeclaration(node);
                    case 370 /* EnumDeclaration */:
                        return emitEnumDeclaration(node);
                    case 401 /* EnumMember */:
                        return emitEnumMember(node);
                    case 371 /* ModuleDeclaration */:
                        return emitModuleDeclaration(node);
                    case 376 /* ImportDeclaration */:
                        return emitImportDeclaration(node);
                    case 375 /* ImportEqualsDeclaration */:
                        return emitImportEqualsDeclaration(node);
                    case 382 /* ExportDeclaration */:
                        return emitExportDeclaration(node);
                    case 381 /* ExportAssignment */:
                        return emitExportAssignment(node);
                    case 402 /* SourceFile */:
                        return emitSourceFileNode(node);
                }
            }
            function hasDetachedComments(pos) {
                return detachedCommentsInfo !== undefined && ts.lastOrUndefined(detachedCommentsInfo).nodePos === pos;
            }
            function getLeadingCommentsWithoutDetachedComments() {
                // get the leading comments from detachedPos
                var leadingComments = ts.getLeadingCommentRanges(currentText, ts.lastOrUndefined(detachedCommentsInfo).detachedCommentEndPos);
                if (detachedCommentsInfo.length - 1) {
                    detachedCommentsInfo.pop();
                }
                else {
                    detachedCommentsInfo = undefined;
                }
                return leadingComments;
            }
            /**
             * Determine if the given comment is a triple-slash
             *
             * @return true if the comment is a triple-slash comment else false
             **/
            function isTripleSlashComment(comment) {
                // Verify this is /// comment, but do the regexp match only when we first can find /// in the comment text
                // so that we don't end up computing comment string and doing match for all // comments
                if (currentText.charCodeAt(comment.pos + 1) === ts.CharCode.slash &&
                    comment.pos + 2 < comment.end &&
                    currentText.charCodeAt(comment.pos + 2) === ts.CharCode.slash) {
                    var textSubStr = currentText.substring(comment.pos, comment.end);
                    return textSubStr.match(ts.fullTripleSlashReferencePathRegEx) ||
                        textSubStr.match(ts.fullTripleSlashAMDReferencePathRegEx) ?
                        true : false;
                }
                return false;
            }
            function getLeadingCommentsToEmit(node) {
                // Emit the leading comments only if the parent's pos doesn't match because parent should take care of emitting these comments
                if (node.parent) {
                    if (node.parent.kind === 402 /* SourceFile */ || node.pos !== node.parent.pos) {
                        if (hasDetachedComments(node.pos)) {
                            // get comments without detached comments
                            return getLeadingCommentsWithoutDetachedComments();
                        }
                        else {
                            // get the leading comments from the node
                            return ts.getLeadingCommentRangesOfNodeFromText(node, currentText);
                        }
                    }
                }
            }
            function getTrailingCommentsToEmit(node) {
                // Emit the trailing comments only if the parent's pos doesn't match because parent should take care of emitting these comments
                if (node.parent) {
                    if (node.parent.kind === 402 /* SourceFile */ || node.end !== node.parent.end) {
                        return ts.getTrailingCommentRanges(currentText, node.end);
                    }
                }
            }
            /**
             * Emit comments associated with node that will not be emitted into JS file
             */
            function emitCommentsOnNotEmittedNode(node) {
                emitLeadingCommentsWorker(node, /*isEmittedNode*/ false);
            }
            function emitLeadingComments(node) {
                return emitLeadingCommentsWorker(node, /*isEmittedNode*/ true);
            }
            function emitLeadingCommentsWorker(node, isEmittedNode) {
                if (compilerOptions.removeComments) {
                    return;
                }
                var leadingComments;
                if (isEmittedNode) {
                    leadingComments = getLeadingCommentsToEmit(node);
                }
                else {
                    // If the node will not be emitted in JS, remove all the comments(normal, pinned and ///) associated with the node,
                    // unless it is a triple slash comment at the top of the file.
                    // For Example:
                    //      /// <reference-path ...>
                    //      declare var x;
                    //      /// <reference-path ...>
                    //      interface F {}
                    //  The first /// will NOT be removed while the second one will be removed even though both node will not be emitted
                    if (node.pos === 0) {
                        leadingComments = ts.filter(getLeadingCommentsToEmit(node), isTripleSlashComment);
                    }
                }
                ts.emitNewLineBeforeLeadingComments(currentLineMap, writer, node, leadingComments);
                // Leading comments are emitted at /*leading comment1 */space/*leading comment*/space
                ts.emitComments(currentText, currentLineMap, writer, leadingComments, /*trailingSeparator*/ true, newLine, writeComment);
            }
            function emitTrailingComments(node) {
                if (compilerOptions.removeComments) {
                    return;
                }
                // Emit the trailing comments only if the parent's end doesn't match
                var trailingComments = getTrailingCommentsToEmit(node);
                // trailing comments are emitted at space/*trailing comment1 */space/*trailing comment*/
                ts.emitComments(currentText, currentLineMap, writer, trailingComments, /*trailingSeparator*/ false, newLine, writeComment);
            }
            /**
             * Emit trailing comments at the position. The term trailing comment is used here to describe following comment:
             *      x, /comment1/ y
             *        ^ => pos; the function will emit "comment1" in the emitJS
             */
            function emitTrailingCommentsOfPosition(pos) {
                if (compilerOptions.removeComments) {
                    return;
                }
                var trailingComments = ts.getTrailingCommentRanges(currentText, pos);
                // trailing comments are emitted at space/*trailing comment1 */space/*trailing comment*/
                ts.emitComments(currentText, currentLineMap, writer, trailingComments, /*trailingSeparator*/ true, newLine, writeComment);
            }
            function emitLeadingCommentsOfPositionWorker(pos) {
                if (compilerOptions.removeComments) {
                    return;
                }
                var leadingComments;
                if (hasDetachedComments(pos)) {
                    // get comments without detached comments
                    leadingComments = getLeadingCommentsWithoutDetachedComments();
                }
                else {
                    // get the leading comments from the node
                    leadingComments = ts.getLeadingCommentRanges(currentText, pos);
                }
                ts.emitNewLineBeforeLeadingComments(currentLineMap, writer, { pos: pos, end: pos }, leadingComments);
                // Leading comments are emitted at /*leading comment1 */space/*leading comment*/space
                ts.emitComments(currentText, currentLineMap, writer, leadingComments, /*trailingSeparator*/ true, newLine, writeComment);
            }
            function emitDetachedCommentsAndUpdateCommentsInfo(node) {
                var currentDetachedCommentInfo = ts.emitDetachedComments(currentText, currentLineMap, writer, writeComment, node, newLine, compilerOptions.removeComments);
                if (currentDetachedCommentInfo) {
                    if (detachedCommentsInfo) {
                        detachedCommentsInfo.push(currentDetachedCommentInfo);
                    }
                    else {
                        detachedCommentsInfo = [currentDetachedCommentInfo];
                    }
                }
            }
            function writeComment(text, lineMap, writer, comment, newLine) {
                emitPos(comment.pos);
                ts.writeCommentRange(text, lineMap, writer, comment, newLine);
                emitPos(comment.end);
            }
            function emitShebang() {
                var shebang = ts.getShebang(currentText);
                if (shebang) {
                    write(shebang);
                    writeLine();
                }
            }
            var _a, _b;
        }
        function emitFile(_a, sourceFiles, isBundledEmit) {
            var jsFilePath = _a.jsFilePath, sourceMapFilePath = _a.sourceMapFilePath, declarationFilePath = _a.declarationFilePath;
            // Make sure not to write js File and source map file if any of them cannot be written
            if (!host.isEmitBlocked(jsFilePath) && !compilerOptions.noEmit) {
                emitJavaScript(jsFilePath, sourceMapFilePath, sourceFiles, isBundledEmit);
            }
            else {
                emitSkipped = true;
            }
            if (declarationFilePath) {
                emitSkipped = ts.writeDeclarationFile(declarationFilePath, sourceFiles, isBundledEmit, host, resolver, emitterDiagnostics) || emitSkipped;
            }
            if (!emitSkipped && emittedFilesList) {
                emittedFilesList.push(jsFilePath);
                if (sourceMapFilePath) {
                    emittedFilesList.push(sourceMapFilePath);
                }
                if (declarationFilePath) {
                    emittedFilesList.push(declarationFilePath);
                }
            }
        }
    }
    ts.emitFiles = emitFiles;
})(ts || (ts = {}));
//# sourceMappingURL=emitter.js.map