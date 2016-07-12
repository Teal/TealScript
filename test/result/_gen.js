
function genUnicode() {
    var ts = require("./typescript.js");
    var methods = {
        isLineBreak: [],
        isNoBreakWhiteSpace: [],
        isWhiteSpace: [],
        isDecimalDigit: [],
        isOctalDigit: [],
        isHexDigit: [],
        isIdentifierStart: [],
        isIdentifierPart: [],
        isIdentifierStart_true: [],
        isIdentifierPart_true: [],
    };

    ts.isDigit = function (ch) {
        if (ch >= 48 /* _0 */ && ch <= 57 /* _9 */) {
            return true;
        }
        return false;
    }
    ts.isHexDigit = function (ch) {
        if (ch >= 48 /* _0 */ && ch <= 57 /* _9 */) {
            return true;
        }
        else if (ch >= 65 /* A */ && ch <= 70 /* F */) {
            return true;
        }
        else if (ch >= 97 /* a */ && ch <= 102 /* f */) {
            return true;
        }

        return false;
    }

    for (var i = 0; i < 65536; i++) {
        if (ts.isLineBreak(i)) {
            methods.isLineBreak.push(i);
        }
        if (ts.isWhiteSpaceSingleLine(i)) {
            methods.isNoBreakWhiteSpace.push(i);
        }
        if (ts.isWhiteSpace(i)) {
            methods.isWhiteSpace.push(i);
        }
        if (ts.isDigit(i)) {
            methods.isDecimalDigit.push(i);
        }
        if (ts.isOctalDigit(i)) {
            methods.isOctalDigit.push(i);
        }
        if (ts.isHexDigit(i)) {
            methods.isHexDigit.push(i);
        }
        if (ts.isIdentifierStart(i, 2 /* Latest */)) {
            methods.isIdentifierStart.push(i);
        }
        if (ts.isIdentifierPart(i, 2 /* Latest */)) {
            methods.isIdentifierPart.push(i);
        }
        if (ts.isIdentifierStart(i)) {
            methods.isIdentifierStart_true.push(i);
        }
        if (ts.isIdentifierPart(i)) {
            methods.isIdentifierPart_true.push(i);
        }
    }
    require("fs").writeFileSync("unicode.json", JSON.stringify(methods, undefined, 4));

}
genUnicode();

function genTokenType() {
    var tokenType = require("../../lib/parser/tokenType.js");
    var methods = {
        isSimpleLiteral: [],
        isUnaryOperator: [],
        isBinaryOperator: [],
        isModifier: [],
        isDeclarationStart: [],
        isStatementStart: [],
        isExpressionStart: [],
        isKeyword: [],
        isReservedWord: [],
    };

    for (var i = 0; i < tokenType.TokenType.MAX_TOKEN; i++) {
        for (var method in methods) {
            if (tokenType.tokenToString(i).indexOf("_") >= 0) {
                continue;
            }
            if (tokenType[method](i)) {
                methods[method].push(tokenType.tokenToString(i));
            }
        }
    }
    require("fs").writeFileSync("tokenType.json", JSON.stringify(methods, undefined, 4));

}
genTokenType();