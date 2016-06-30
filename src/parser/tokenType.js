/**
 * @fileOverview 标记类型
 */
/**
 * 表示一个标记类型。
 */
(function (TokenType) {
    // #region 控制
    /**
     * 未知标记。
     */
    TokenType[TokenType["unknown"] = 0] = "unknown";
    /**
     * 文件已结束(EOF)。
     */
    TokenType[TokenType["endOfFile"] = 1] = "endOfFile";
    // #endregion
    // #region 空白
    /**
     * 单行注释。
     */
    TokenType[TokenType["singleLineComment"] = 2] = "singleLineComment";
    /**
     * 多行注释。
     */
    TokenType[TokenType["multiLineComment"] = 3] = "multiLineComment";
    /**
     * 换行。
     */
    TokenType[TokenType["newLine"] = 4] = "newLine";
    /**
     * 空白。
     */
    TokenType[TokenType["whitespace"] = 5] = "whitespace";
    /**
     * Linux Shell 控制字符。
     */
    TokenType[TokenType["shebang"] = 6] = "shebang";
    /**
     * Git 冲突标记。
     */
    TokenType[TokenType["conflictMarker"] = 7] = "conflictMarker";
    // #endregion
    // #region 常量
    /**
     * 数字常量。
     */
    TokenType[TokenType["numericLiteral"] = 8] = "numericLiteral";
    /**
     * 字符串常量。
     */
    TokenType[TokenType["stringLiteral"] = 9] = "stringLiteral";
    /**
     * 正则表达式常量。
     */
    TokenType[TokenType["regularExpressionLiteral"] = 10] = "regularExpressionLiteral";
    /**
     * 模板字符串常量。
     */
    TokenType[TokenType["noSubstitutionTemplateLiteral"] = 11] = "noSubstitutionTemplateLiteral";
    /**
     * 模板字符串头。
     */
    TokenType[TokenType["templateHead"] = 12] = "templateHead";
    /**
     * 模板字符串主体。
     */
    TokenType[TokenType["templateMiddle"] = 13] = "templateMiddle";
    /**
     * 模板字符串尾。
     */
    TokenType[TokenType["templateTail"] = 14] = "templateTail";
    // #endregion
    // #region 连接符
    /**
     * 开花括号({)。
     */
    TokenType[TokenType["openBrace"] = 15] = "openBrace";
    /**
     * 闭花括号(})。
     */
    TokenType[TokenType["closeBrace"] = 16] = "closeBrace";
    /**
     * 开括号(()。
     */
    TokenType[TokenType["openParen"] = 17] = "openParen";
    /**
     * 闭括号())。
     */
    TokenType[TokenType["closeParen"] = 18] = "closeParen";
    /**
     * 开方括号([)。
     */
    TokenType[TokenType["openBracket"] = 19] = "openBracket";
    /**
     * 闭方括号(])。
     */
    TokenType[TokenType["closeBracket"] = 20] = "closeBracket";
    /**
     * 点(.)。
     */
    TokenType[TokenType["dot"] = 21] = "dot";
    /**
     * 点点点(...)。
     */
    TokenType[TokenType["dotDotDot"] = 22] = "dotDotDot";
    /**
     * 分号(;)。
     */
    TokenType[TokenType["semicolon"] = 23] = "semicolon";
    /**
     * 逗号(,)。
     */
    TokenType[TokenType["comma"] = 24] = "comma";
    /**
     * 小于(<)。
     */
    TokenType[TokenType["lessThan"] = 25] = "lessThan";
    /**
     * 小于斜杠(</)。
     */
    TokenType[TokenType["lessThanSlash"] = 26] = "lessThanSlash";
    /**
     * 大于(>)。
     */
    TokenType[TokenType["greaterThan"] = 27] = "greaterThan";
    /**
     * 小于等于(<=)。
     */
    TokenType[TokenType["lessThanEquals"] = 28] = "lessThanEquals";
    /**
     * 大于等于(>=)。
     */
    TokenType[TokenType["greaterThanEquals"] = 29] = "greaterThanEquals";
    /**
     * 等于等于(==)。
     */
    TokenType[TokenType["equalsEquals"] = 30] = "equalsEquals";
    /**
     * 不等于(!=)。
     */
    TokenType[TokenType["exclamationEquals"] = 31] = "exclamationEquals";
    /**
     * 等于等于等于(===)。
     */
    TokenType[TokenType["equalsEqualsEquals"] = 32] = "equalsEqualsEquals";
    /**
     * 不等于等于(!==)。
     */
    TokenType[TokenType["exclamationEqualsEquals"] = 33] = "exclamationEqualsEquals";
    /**
     * 箭头(=>)。
     */
    TokenType[TokenType["equalsGreaterThan"] = 34] = "equalsGreaterThan";
    /**
     * 加(+)。
     */
    TokenType[TokenType["plus"] = 35] = "plus";
    /**
     * 减(-)。
     */
    TokenType[TokenType["minus"] = 36] = "minus";
    /**
     * 星号(*)。
     */
    TokenType[TokenType["asterisk"] = 37] = "asterisk";
    /**
     * 星号(**)。
     */
    TokenType[TokenType["asteriskAsterisk"] = 38] = "asteriskAsterisk";
    /**
     * 斜杠(/)。
     */
    TokenType[TokenType["slash"] = 39] = "slash";
    /**
     * 百分号(%)。
     */
    TokenType[TokenType["percent"] = 40] = "percent";
    /**
     * 加加(++)。
     */
    TokenType[TokenType["plusPlus"] = 41] = "plusPlus";
    /**
     * 减减(--)。
     */
    TokenType[TokenType["minusMinus"] = 42] = "minusMinus";
    /**
     * 左移(<<)。
     */
    TokenType[TokenType["lessThanLessThan"] = 43] = "lessThanLessThan";
    /**
     * 右移(>>)。
     */
    TokenType[TokenType["greaterThanGreaterThan"] = 44] = "greaterThanGreaterThan";
    /**
     * 无符右移(>>>)。
     */
    TokenType[TokenType["greaterThanGreaterThanGreaterThan"] = 45] = "greaterThanGreaterThanGreaterThan";
    /**
     * 位与(&)。
     */
    TokenType[TokenType["ampersand"] = 46] = "ampersand";
    /**
     * 位或(|)。
     */
    TokenType[TokenType["bar"] = 47] = "bar";
    /**
     * 异或(^)。
     */
    TokenType[TokenType["caret"] = 48] = "caret";
    /**
     * 非(!)。
     */
    TokenType[TokenType["exclamation"] = 49] = "exclamation";
    /**
     * 位反(~)。
     */
    TokenType[TokenType["tilde"] = 50] = "tilde";
    /**
     * 与(&&)。
     */
    TokenType[TokenType["ampersandAmpersand"] = 51] = "ampersandAmpersand";
    /**
     * 或(||)。
     */
    TokenType[TokenType["barBar"] = 52] = "barBar";
    /**
     * 问号(?)。
     */
    TokenType[TokenType["question"] = 53] = "question";
    /**
     * 冒号(:)。
     */
    TokenType[TokenType["colon"] = 54] = "colon";
    /**
     * 电子邮件符号(@)。
     */
    TokenType[TokenType["at"] = 55] = "at";
    /**
     * 等于(=)
     */
    TokenType[TokenType["equals"] = 56] = "equals";
    /**
     * 加等于(+=)
     */
    TokenType[TokenType["plusEquals"] = 57] = "plusEquals";
    /**
     * 减等于(-=)
     */
    TokenType[TokenType["minusEquals"] = 58] = "minusEquals";
    /**
     * 乘等于(*=)
     */
    TokenType[TokenType["asteriskEquals"] = 59] = "asteriskEquals";
    /**
     * 乘乘等于(**=)
     */
    TokenType[TokenType["asteriskAsteriskEquals"] = 60] = "asteriskAsteriskEquals";
    /**
     * 除等于(/=)
     */
    TokenType[TokenType["slashEquals"] = 61] = "slashEquals";
    /**
     * 百分号等于(%=)
     */
    TokenType[TokenType["percentEquals"] = 62] = "percentEquals";
    /**
     * 左移等于(<<=)
     */
    TokenType[TokenType["lessThanLessThanEquals"] = 63] = "lessThanLessThanEquals";
    /**
     * 右移等于(>>=)
     */
    TokenType[TokenType["greaterThanGreaterThanEquals"] = 64] = "greaterThanGreaterThanEquals";
    /**
     * 无符右移等于(>>>=)
     */
    TokenType[TokenType["greaterThanGreaterThanGreaterThanEquals"] = 65] = "greaterThanGreaterThanGreaterThanEquals";
    /**
     * 位与等于(&=)
     */
    TokenType[TokenType["ampersandEquals"] = 66] = "ampersandEquals";
    /**
     * 位或等于(|=)
     */
    TokenType[TokenType["barEquals"] = 67] = "barEquals";
    /**
     * 异或等于(^=)
     */
    TokenType[TokenType["caretEquals"] = 68] = "caretEquals";
    // #endregion
    // #region 标识符
    /**
     * 标识符。
     */
    TokenType[TokenType["identifier"] = 69] = "identifier";
    /**
     * 关键字 break。
     */
    TokenType[TokenType["break"] = 70] = "break";
    /**
     * 关键字 case。
     */
    TokenType[TokenType["case"] = 71] = "case";
    /**
     * 关键字 catch。
     */
    TokenType[TokenType["catch"] = 72] = "catch";
    /**
     * 关键字 class。
     */
    TokenType[TokenType["class"] = 73] = "class";
    /**
     * 关键字 const。
     */
    TokenType[TokenType["const"] = 74] = "const";
    /**
     * 关键字 continue。
     */
    TokenType[TokenType["continue"] = 75] = "continue";
    /**
     * 关键字 debugger。
     */
    TokenType[TokenType["debugger"] = 76] = "debugger";
    /**
     * 关键字 default。
     */
    TokenType[TokenType["default"] = 77] = "default";
    /**
     * 关键字 delete。
     */
    TokenType[TokenType["delete"] = 78] = "delete";
    /**
     * 关键字 do。
     */
    TokenType[TokenType["do"] = 79] = "do";
    /**
     * 关键字 else。
     */
    TokenType[TokenType["else"] = 80] = "else";
    /**
     * 关键字 enum。
     */
    TokenType[TokenType["enum"] = 81] = "enum";
    /**
     * 关键字 export。
     */
    TokenType[TokenType["export"] = 82] = "export";
    /**
     * 关键字 extends。
     */
    TokenType[TokenType["extends"] = 83] = "extends";
    /**
     * 关键字 false。
     */
    TokenType[TokenType["false"] = 84] = "false";
    /**
     * 关键字 finally。
     */
    TokenType[TokenType["finally"] = 85] = "finally";
    /**
     * 关键字 for。
     */
    TokenType[TokenType["for"] = 86] = "for";
    /**
     * 关键字 function。
     */
    TokenType[TokenType["function"] = 87] = "function";
    /**
     * 关键字 if。
     */
    TokenType[TokenType["if"] = 88] = "if";
    /**
     * 关键字 import。
     */
    TokenType[TokenType["import"] = 89] = "import";
    /**
     * 关键字 in。
     */
    TokenType[TokenType["in"] = 90] = "in";
    /**
     * 关键字 instanceOf。
     */
    TokenType[TokenType["instanceOf"] = 91] = "instanceOf";
    /**
     * 关键字 new。
     */
    TokenType[TokenType["new"] = 92] = "new";
    /**
     * 关键字 null。
     */
    TokenType[TokenType["null"] = 93] = "null";
    /**
     * 关键字 return。
     */
    TokenType[TokenType["return"] = 94] = "return";
    /**
     * 关键字 super。
     */
    TokenType[TokenType["super"] = 95] = "super";
    /**
     * 关键字 switch。
     */
    TokenType[TokenType["switch"] = 96] = "switch";
    /**
     * 关键字 this。
     */
    TokenType[TokenType["this"] = 97] = "this";
    /**
     * 关键字 throw。
     */
    TokenType[TokenType["throw"] = 98] = "throw";
    /**
     * 关键字 true。
     */
    TokenType[TokenType["true"] = 99] = "true";
    /**
     * 关键字 try。
     */
    TokenType[TokenType["try"] = 100] = "try";
    /**
     * 关键字 typeOf。
     */
    TokenType[TokenType["typeOf"] = 101] = "typeOf";
    /**
     * 关键字 var。
     */
    TokenType[TokenType["var"] = 102] = "var";
    /**
     * 关键字 void。
     */
    TokenType[TokenType["void"] = 103] = "void";
    /**
     * 关键字 while。
     */
    TokenType[TokenType["while"] = 104] = "while";
    /**
     * 关键字 with。
     */
    TokenType[TokenType["with"] = 105] = "with";
    /**
     * 关键字 implements。
     */
    TokenType[TokenType["implements"] = 106] = "implements";
    /**
     * 关键字 interface。
     */
    TokenType[TokenType["interface"] = 107] = "interface";
    /**
     * 关键字 let。
     */
    TokenType[TokenType["let"] = 108] = "let";
    /**
     * 关键字 package。
     */
    TokenType[TokenType["package"] = 109] = "package";
    /**
     * 关键字 private。
     */
    TokenType[TokenType["private"] = 110] = "private";
    /**
     * 关键字 protected。
     */
    TokenType[TokenType["protected"] = 111] = "protected";
    /**
     * 关键字 public。
     */
    TokenType[TokenType["public"] = 112] = "public";
    /**
     * 关键字 static。
     */
    TokenType[TokenType["static"] = 113] = "static";
    /**
     * 关键字 yield。
     */
    TokenType[TokenType["yield"] = 114] = "yield";
    /**
     * 关键字 abstract。
     */
    TokenType[TokenType["abstract"] = 115] = "abstract";
    /**
     * 关键字 as。
     */
    TokenType[TokenType["as"] = 116] = "as";
    /**
     * 关键字 any。
     */
    TokenType[TokenType["any"] = 117] = "any";
    /**
     * 关键字 async。
     */
    TokenType[TokenType["async"] = 118] = "async";
    /**
     * 关键字 await。
     */
    TokenType[TokenType["await"] = 119] = "await";
    /**
     * 关键字 boolean。
     */
    TokenType[TokenType["boolean"] = 120] = "boolean";
    /**
     * 关键字 constructor。
     */
    TokenType[TokenType["constructor"] = 121] = "constructor";
    /**
     * 关键字 declare。
     */
    TokenType[TokenType["declare"] = 122] = "declare";
    /**
     * 关键字 get。
     */
    TokenType[TokenType["get"] = 123] = "get";
    /**
     * 关键字 is。
     */
    TokenType[TokenType["is"] = 124] = "is";
    /**
     * 关键字 module。
     */
    TokenType[TokenType["module"] = 125] = "module";
    /**
     * 关键字 namespace。
     */
    TokenType[TokenType["namespace"] = 126] = "namespace";
    /**
     * 关键字 never。
     */
    TokenType[TokenType["never"] = 127] = "never";
    /**
     * 关键字 readonly。
     */
    TokenType[TokenType["readonly"] = 128] = "readonly";
    /**
     * 关键字 require。
     */
    TokenType[TokenType["require"] = 129] = "require";
    /**
     * 关键字 number。
     */
    TokenType[TokenType["number"] = 130] = "number";
    /**
     * 关键字 set。
     */
    TokenType[TokenType["set"] = 131] = "set";
    /**
     * 关键字 string。
     */
    TokenType[TokenType["string"] = 132] = "string";
    /**
     * 关键字 symbol。
     */
    TokenType[TokenType["symbol"] = 133] = "symbol";
    /**
     * 关键字 type。
     */
    TokenType[TokenType["type"] = 134] = "type";
    /**
     * 关键字 undefined。
     */
    TokenType[TokenType["undefined"] = 135] = "undefined";
    /**
     * 关键字 from。
     */
    TokenType[TokenType["from"] = 136] = "from";
    /**
     * 关键字 global。
     */
    TokenType[TokenType["global"] = 137] = "global";
    /**
     * 关键字 of。
     */
    TokenType[TokenType["of"] = 138] = "of";
})(exports.TokenType || (exports.TokenType = {}));
var TokenType = exports.TokenType;
/**
 * 判断指定的标记是否是无用的标记(如空白、换行、注释)。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isTriviaToken(token) {
    return token >= TokenType.singleLineComment && token <= TokenType.conflictMarker;
}
exports.isTriviaToken = isTriviaToken;
/**
 * 将指定标记转为 JavaScript 源码等效的字符串。
 * @param token 要转换的标记。
 * @returns 返回等效的字符串。
 */
function tokenToString(token) {
    return "";
}
exports.tokenToString = tokenToString;
/**
 * 判断指定的标记是否是非保留的关键字。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isNonReservedWord(token) {
    return token > TokenType.with;
}
exports.isNonReservedWord = isNonReservedWord;
//# sourceMappingURL=tokenType.js.map