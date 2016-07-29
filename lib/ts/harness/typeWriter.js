var TypeWriterWalker = (function () {
    function TypeWriterWalker(program, fullTypeCheck) {
        this.program = program;
        // Consider getting both the diagnostics checker and the non-diagnostics checker to verify
        // they are consistent.
        this.checker = fullTypeCheck
            ? program.getDiagnosticsProducingTypeChecker()
            : program.getTypeChecker();
    }
    TypeWriterWalker.prototype.getTypeAndSymbols = function (fileName) {
        var sourceFile = this.program.getSourceFile(fileName);
        this.currentSourceFile = sourceFile;
        this.results = [];
        this.visitNode(sourceFile);
        return this.results;
    };
    TypeWriterWalker.prototype.visitNode = function (node) {
        var _this = this;
        if (ts.isExpression(node) || node.kind === ts.SyntaxKind.Identifier) {
            this.logTypeAndSymbol(node);
        }
        ts.forEachChild(node, function (child) { return _this.visitNode(child); });
    };
    TypeWriterWalker.prototype.logTypeAndSymbol = function (node) {
        var actualPos = ts.skipTrivia(this.currentSourceFile.text, node.pos);
        var lineAndCharacter = this.currentSourceFile.getLineAndCharacterOfPosition(actualPos);
        var sourceText = ts.getTextOfNodeFromSourceText(this.currentSourceFile.text, node);
        // Workaround to ensure we output 'C' instead of 'typeof C' for base class expressions
        // let type = this.checker.getTypeAtLocation(node);
        var type = node.parent && ts.isExpressionWithTypeArgumentsInClassExtendsClause(node.parent) && this.checker.getTypeAtLocation(node.parent) || this.checker.getTypeAtLocation(node);
        ts.Debug.assert(type !== undefined, "type doesn't exist");
        var symbol = this.checker.getSymbolAtLocation(node);
        var typeString = this.checker.typeToString(type, node.parent, 4 /* NoTruncation */);
        var symbolString;
        if (symbol) {
            symbolString = "Symbol(" + this.checker.symbolToString(symbol, node.parent);
            if (symbol.declarations) {
                for (var _i = 0, _a = symbol.declarations; _i < _a.length; _i++) {
                    var declaration = _a[_i];
                    symbolString += ", ";
                    var declSourceFile = declaration.getSourceFile();
                    var declLineAndCharacter = declSourceFile.getLineAndCharacterOfPosition(declaration.pos);
                    var fileName = ts.getBaseFileName(declSourceFile.fileName);
                    var isLibFile = /lib(.*)\.d\.ts/i.test(fileName);
                    symbolString += "Decl(" + fileName + ", " + (isLibFile ? "--" : declLineAndCharacter.line) + ", " + (isLibFile ? "--" : declLineAndCharacter.character) + ")";
                }
            }
            symbolString += ")";
        }
        this.results.push({
            line: lineAndCharacter.line,
            syntaxKind: node.kind,
            sourceText: sourceText,
            type: typeString,
            symbol: symbolString
        });
    };
    return TypeWriterWalker;
}());
//# sourceMappingURL=typeWriter.js.map