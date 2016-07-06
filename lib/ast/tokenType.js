/**
 * @fileOverview 标记和关键字
 */
/**
 * 表示一个标记类型。
 * @internal
 */
(function (TokenType) {
    // #region 控制符（Control）
    /**
     * 未知标记。
     */
    TokenType[TokenType["unknown"] = 0] = "unknown";
    /**
     * 文件已结束(EOF)。
     */
    TokenType[TokenType["endOfFile"] = 1] = "endOfFile";
    // #endregion
    // #region 定义（Definitions）
    /**
     * 关键字 function。
     */
    TokenType[TokenType["function"] = 2] = "function";
    /**
     * 关键字 class(仅在 JavaScript 7)。
     */
    TokenType[TokenType["class"] = 3] = "class";
    /**
     * 关键字 interface(仅在 JavaScript 7)。
     */
    TokenType[TokenType["interface"] = 4] = "interface";
    /**
     * 关键字 enum(仅在 JavaScript 7)。
     */
    TokenType[TokenType["enum"] = 5] = "enum";
    /**
     * 关键字 async(仅在 JavaScript 7)。
     */
    TokenType[TokenType["async"] = 6] = "async";
    /**
     * 关键字 namespace(仅在 TypeScript)。
     */
    TokenType[TokenType["namespace"] = 7] = "namespace";
    /**
     * 关键字 module(仅在 TypeScript)。
     */
    TokenType[TokenType["module"] = 8] = "module";
    // #endregion
    // #region 字面量（Literal）
    /**
     * 标识符(xx)。
     */
    TokenType[TokenType["identifier"] = 9] = "identifier";
    /**
     * 数字常量(0x0)。
     */
    TokenType[TokenType["numericLiteral"] = 10] = "numericLiteral";
    /**
     * 字符串常量('...')。
     */
    TokenType[TokenType["stringLiteral"] = 11] = "stringLiteral";
    /**
     * 正则表达式常量(/.../)。
     */
    TokenType[TokenType["regularExpressionLiteral"] = 12] = "regularExpressionLiteral";
    /**
     * 模板字符串常量(`...`)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["noSubstitutionTemplateLiteral"] = 13] = "noSubstitutionTemplateLiteral";
    /**
     * 模板字符串头(`...${)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["templateHead"] = 14] = "templateHead";
    /**
     * 模板字符串主体(}...${)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["templateMiddle"] = 15] = "templateMiddle";
    /**
     * 模板字符串尾(}...`)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["templateTail"] = 16] = "templateTail";
    /**
     * 关键字 null。
     */
    TokenType[TokenType["null"] = 17] = "null";
    /**
     * 关键字 true。
     */
    TokenType[TokenType["true"] = 18] = "true";
    /**
     * 关键字 false。
     */
    TokenType[TokenType["false"] = 19] = "false";
    /**
     * 关键字 this。
     */
    TokenType[TokenType["this"] = 20] = "this";
    /**
     * 关键字 super(仅在 JavaScript 7)。
     */
    TokenType[TokenType["super"] = 21] = "super";
    // #endregion
    // #region 单目运算符（Unary Operators）
    /**
     * 开花括号({)。
     * @precedence 80
     */
    TokenType[TokenType["openBrace"] = 22] = "openBrace";
    /**
     * 非(!)。
     */
    TokenType[TokenType["exclamation"] = 23] = "exclamation";
    /**
     * 关键字 new。
     */
    TokenType[TokenType["new"] = 24] = "new";
    /**
     * 关键字 delete。
     */
    TokenType[TokenType["delete"] = 25] = "delete";
    /**
     * 关键字 typeof。
     */
    TokenType[TokenType["typeof"] = 26] = "typeof";
    /**
     * 关键字 void。
     */
    TokenType[TokenType["void"] = 27] = "void";
    /**
     * 关键字 yield(仅在 JavaScript 7)。
     */
    TokenType[TokenType["yield"] = 28] = "yield";
    /**
     * 关键字 await(仅在 JavaScript 7)。
     */
    TokenType[TokenType["await"] = 29] = "await";
    /**
     * 位反(~)。
     */
    TokenType[TokenType["tilde"] = 30] = "tilde";
    /**
     * 电子邮件符号(@)(仅在 JavaScript 7)。
     * @precedence 80
     */
    TokenType[TokenType["at"] = 31] = "at";
    // #endregion
    // #region 单/双目运算符（Unary & Binary Operators）
    /**
     * 开括号(()。
     * @precedence 80
     */
    TokenType[TokenType["openParen"] = 32] = "openParen";
    /**
     * 开方括号([)。
     * @precedence 80
     */
    TokenType[TokenType["openBracket"] = 33] = "openBracket";
    /**
     * 加(+)。
     */
    TokenType[TokenType["plus"] = 34] = "plus";
    /**
     * 减(-)。
     */
    TokenType[TokenType["minus"] = 35] = "minus";
    /**
     * 斜杠(/)。
     */
    TokenType[TokenType["slash"] = 36] = "slash";
    /**
     * 加加(++)。
     */
    TokenType[TokenType["plusPlus"] = 37] = "plusPlus";
    /**
     * 减减(--)。
     */
    TokenType[TokenType["minusMinus"] = 38] = "minusMinus";
    /**
     * 小于(<)。
     */
    TokenType[TokenType["lessThan"] = 39] = "lessThan";
    /**
     * 箭头(=>)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["equalsGreaterThan"] = 40] = "equalsGreaterThan";
    /**
     * 点点点(...)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["dotDotDot"] = 41] = "dotDotDot";
    // #endregion
    // #region 双目运算符（Binary Operators）
    /**
     * 星号(*)。
     */
    TokenType[TokenType["asterisk"] = 42] = "asterisk";
    /**
     * 位与(&)。
     */
    TokenType[TokenType["ampersand"] = 43] = "ampersand";
    /**
     * 关键字 in。
     */
    TokenType[TokenType["in"] = 44] = "in";
    /**
     * 关键字 instanceOf。
     */
    TokenType[TokenType["instanceOf"] = 45] = "instanceOf";
    /**
     * 点(.)。
     */
    TokenType[TokenType["dot"] = 46] = "dot";
    /**
     * 点点(..)(仅在 TealScript)。
     */
    TokenType[TokenType["dotDot"] = 47] = "dotDot";
    /**
     * 百分号(%)。
     */
    TokenType[TokenType["percent"] = 48] = "percent";
    /**
     * 大于(>)。
     */
    TokenType[TokenType["greaterThan"] = 49] = "greaterThan";
    /**
     * 小于等于(<=)。
     */
    TokenType[TokenType["lessThanEquals"] = 50] = "lessThanEquals";
    /**
     * 大于等于(>=)。
     */
    TokenType[TokenType["greaterThanEquals"] = 51] = "greaterThanEquals";
    /**
     * 等于等于(==)。
     */
    TokenType[TokenType["equalsEquals"] = 52] = "equalsEquals";
    /**
     * 不等于(!=)。
     */
    TokenType[TokenType["exclamationEquals"] = 53] = "exclamationEquals";
    /**
     * 等于等于等于(===)。
     */
    TokenType[TokenType["equalsEqualsEquals"] = 54] = "equalsEqualsEquals";
    /**
     * 不等于等于(!==)。
     */
    TokenType[TokenType["exclamationEqualsEquals"] = 55] = "exclamationEqualsEquals";
    /**
     * 左移(<<)。
     */
    TokenType[TokenType["lessThanLessThan"] = 56] = "lessThanLessThan";
    /**
     * 右移(>>)。
     */
    TokenType[TokenType["greaterThanGreaterThan"] = 57] = "greaterThanGreaterThan";
    /**
     * 无符右移(>>>)。
     */
    TokenType[TokenType["greaterThanGreaterThanGreaterThan"] = 58] = "greaterThanGreaterThanGreaterThan";
    /**
     * 位或(|)。
     */
    TokenType[TokenType["bar"] = 59] = "bar";
    /**
     * 异或(^)。
     */
    TokenType[TokenType["caret"] = 60] = "caret";
    /**
     * 与(&&)。
     */
    TokenType[TokenType["ampersandAmpersand"] = 61] = "ampersandAmpersand";
    /**
     * 或(||)。
     */
    TokenType[TokenType["barBar"] = 62] = "barBar";
    /**
     * 星号星号(**)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["asteriskAsterisk"] = 63] = "asteriskAsterisk";
    /**
     * 等于(=)。
     */
    TokenType[TokenType["equals"] = 64] = "equals";
    /**
     * 加等于(+=)。
     */
    TokenType[TokenType["plusEquals"] = 65] = "plusEquals";
    /**
     * 减等于(-=)。
     */
    TokenType[TokenType["minusEquals"] = 66] = "minusEquals";
    /**
     * 星号等于(*=)。
     */
    TokenType[TokenType["asteriskEquals"] = 67] = "asteriskEquals";
    /**
     * 星号星号等于(**=)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["asteriskAsteriskEquals"] = 68] = "asteriskAsteriskEquals";
    /**
     * 斜杠等于(/=)。
     */
    TokenType[TokenType["slashEquals"] = 69] = "slashEquals";
    /**
     * 百分号等于(%=)。
     */
    TokenType[TokenType["percentEquals"] = 70] = "percentEquals";
    /**
     * 左移等于(<<=)。
     */
    TokenType[TokenType["lessThanLessThanEquals"] = 71] = "lessThanLessThanEquals";
    /**
     * 右移等于(>>=)。
     */
    TokenType[TokenType["greaterThanGreaterThanEquals"] = 72] = "greaterThanGreaterThanEquals";
    /**
     * 无符右移等于(>>>=)。
     */
    TokenType[TokenType["greaterThanGreaterThanGreaterThanEquals"] = 73] = "greaterThanGreaterThanGreaterThanEquals";
    /**
     * 位与等于(&=)。
     */
    TokenType[TokenType["ampersandEquals"] = 74] = "ampersandEquals";
    /**
     * 位或等于(|=)。
     */
    TokenType[TokenType["barEquals"] = 75] = "barEquals";
    /**
     * 异或等于(^=)。
     */
    TokenType[TokenType["caretEquals"] = 76] = "caretEquals";
    /**
     * 问号(?)。
     */
    TokenType[TokenType["question"] = 77] = "question";
    /**
     * 逗号(,)。
     * @precedence 8
     */
    TokenType[TokenType["comma"] = 78] = "comma";
    /**
     * 关键字 as(仅在 TypeScript)。
     */
    TokenType[TokenType["as"] = 79] = "as";
    /**
     * 关键字 is(仅在 TypeScript)。
     */
    TokenType[TokenType["is"] = 80] = "is";
    // #endregion
    // #region 其它运算符（Other Operators）
    /**
     * 闭括号())。
     * @precedence 84
     */
    TokenType[TokenType["closeParen"] = 81] = "closeParen";
    /**
     * 闭方括号(])。
     * @precedence 84
     */
    TokenType[TokenType["closeBracket"] = 82] = "closeBracket";
    /**
     * 闭花括号(})。
     * @precedence 84
     */
    TokenType[TokenType["closeBrace"] = 83] = "closeBrace";
    /**
     * 冒号(:)。
     * @precedence 82
     */
    TokenType[TokenType["colon"] = 84] = "colon";
    /**
     * 分号(;)。
     * @precedence 100
     */
    TokenType[TokenType["semicolon"] = 85] = "semicolon";
    // #endregion
    // #region 语句（Statements）
    /**
     * 关键字 if。
     */
    TokenType[TokenType["if"] = 86] = "if";
    /**
     * 关键字 else。
     */
    TokenType[TokenType["else"] = 87] = "else";
    /**
     * 关键字 switch。
     */
    TokenType[TokenType["switch"] = 88] = "switch";
    /**
     * 关键字 case。
     */
    TokenType[TokenType["case"] = 89] = "case";
    /**
     * 关键字 default。
     */
    TokenType[TokenType["default"] = 90] = "default";
    /**
     * 关键字 for。
     */
    TokenType[TokenType["for"] = 91] = "for";
    /**
     * 关键字 of(仅在 JavaScript 7)。
     */
    TokenType[TokenType["of"] = 92] = "of";
    /**
     * 关键字 to(仅在 TealScript)。
     */
    TokenType[TokenType["to"] = 93] = "to";
    /**
     * 关键字 while。
     */
    TokenType[TokenType["while"] = 94] = "while";
    /**
     * 关键字 do。
     */
    TokenType[TokenType["do"] = 95] = "do";
    /**
     * 关键字 continue。
     */
    TokenType[TokenType["continue"] = 96] = "continue";
    /**
     * 关键字 break。
     */
    TokenType[TokenType["break"] = 97] = "break";
    /**
     * 关键字 return。
     */
    TokenType[TokenType["return"] = 98] = "return";
    /**
     * 关键字 throw。
     */
    TokenType[TokenType["throw"] = 99] = "throw";
    /**
     * 关键字 try。
     */
    TokenType[TokenType["try"] = 100] = "try";
    /**
     * 关键字 catch。
     */
    TokenType[TokenType["catch"] = 101] = "catch";
    /**
     * 关键字 finally。
     */
    TokenType[TokenType["finally"] = 102] = "finally";
    /**
     * 关键字 var。
     */
    TokenType[TokenType["var"] = 103] = "var";
    /**
     * 关键字 const(仅在 JavaScript 7)。
     */
    TokenType[TokenType["const"] = 104] = "const";
    /**
     * 关键字 let(仅在 JavaScript 7)。
     */
    TokenType[TokenType["let"] = 105] = "let";
    /**
     * 关键字 debugger。
     */
    TokenType[TokenType["debugger"] = 106] = "debugger";
    /**
     * 关键字 with。
     */
    TokenType[TokenType["with"] = 107] = "with";
    /**
     * 关键字 import(仅在 JavaScript 7)。
     */
    TokenType[TokenType["import"] = 108] = "import";
    /**
     * 关键字 from(仅在 JavaScript 7)。
     */
    TokenType[TokenType["from"] = 109] = "from";
    /**
     * 关键字 export(仅在 JavaScript 7)。
     */
    TokenType[TokenType["export"] = 110] = "export";
    /**
     * 关键字 extends(仅在 JavaScript 7)。
     */
    TokenType[TokenType["extends"] = 111] = "extends";
    /**
     * 关键字 implements(仅在 JavaScript 7)。
     */
    TokenType[TokenType["implements"] = 112] = "implements";
    /**
     * 关键字 package(仅在 JavaScript 7)。
     */
    TokenType[TokenType["package"] = 113] = "package";
    /**
     * 关键字 private(仅在 JavaScript 7)。
     */
    TokenType[TokenType["private"] = 114] = "private";
    /**
     * 关键字 protected(仅在 JavaScript 7)。
     */
    TokenType[TokenType["protected"] = 115] = "protected";
    /**
     * 关键字 public(仅在 JavaScript 7)。
     */
    TokenType[TokenType["public"] = 116] = "public";
    /**
     * 关键字 static(仅在 JavaScript 7)。
     */
    TokenType[TokenType["static"] = 117] = "static";
    /**
     * 关键字 abstract(仅在 JavaScript 7)。
     */
    TokenType[TokenType["abstract"] = 118] = "abstract";
    /**
     * 关键字 declare(仅在 TypeScript)。
     */
    TokenType[TokenType["declare"] = 119] = "declare";
    /**
     * 关键字 readonly(仅在 TypeScript)。
     */
    TokenType[TokenType["readonly"] = 120] = "readonly";
})(exports.TokenType || (exports.TokenType = {}));
var TokenType = exports.TokenType;
//,
//*= /= %= += ‐= <<= >>= >>>= &= ^= |= **=
//    ? :   yield()=>{ }
//||
//&&
//|
//^
//&
//== != === !==
//    < > <= >= instanceof in
//<< >> >>>
//    + -
//* / %
//    **
delete void typeof +-~!
/**
 * 判断指定的标记是否可作为单目运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
;
/**
 * 判断指定的标记是否可作为单目运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isUnaryOperator(token) {
    return token >= TokenType.openParen;
}
exports.isUnaryOperator = isUnaryOperator;
/**
 * 判断指定的标记是否可作为双目运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isBinaryOperator(token) {
    return type >= TokenType.BINARAY_OPERATOR_START && type < TokenType.BINARAY_OPERATOR_END;
}
exports.isBinaryOperator = isBinaryOperator;
/**
 * 判断指定的标记是否是赋值运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isAssignOperator(token) {
    return type >= TokenType.ASSIGN_OPERATOR_START && type < TokenType.ASSIGN_OPERATOR_END;
}
exports.isAssignOperator = isAssignOperator;
/**
 * 判断指定的标记是否可作为表达式的开头。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isExpressionStart(token) {
    return isUnaryOperator(token) || isPredefinedType(type);
}
exports.isExpressionStart = isExpressionStart;
/**
 * 判断指定的标记是否可作为语句开头。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isStatementStart(token) {
    return type >= TokenType.STATEMENT_START && type < TokenType.STATEMENT_END;
}
exports.isStatementStart = isStatementStart;
/**
 * 存储所有标记的名字。
 */
var tokenNames = [];
/**
 * 将指定标记转为 JavaScript 源码等效的字符串。
 * @param token 要转换的标记。
 * @returns 返回等效的字符串。
 */
function tokenToString(token) {
    return tokenNames[token];
}
exports.tokenToString = tokenToString;
///**
// * 判断指定的标记是否是非保留的关键字。
// * @param token 要判断的标记。
// * @returns 如果是则返回 true，否则返回 false。
// */
//export function isNonReservedWord(token: TokenType) {
//    return token > TokenType.with;
//}
/**
 * 存储所有标记的优先级。
 */
var precedences = [];
/**
 * 获取操作符的优先级。
 * @param token 要判断的标记。
 * @returns 返回一个数字。数字越大说明优先级越高。
 */
function getPrecedence(token) {
    return precedences[token];
}
exports.getPrecedence = getPrecedence;
/**
 * 存储所有关键字的名字。
 */
var keywords = {};
/**
 * 将指定的字符串转为对应的标记。
 * @param token 要转换的字符串。
 * @returns 返回等效的标记。如果字符串无效，则返回 undefined。
 */
function stringToToken(token) {
    //// Reserved words are between 2 and 11 characters long and start with a lowercase letter
    //const len = tokenValue.length;
    //if (len >= 2 && len <= 11) {
    //    const ch = tokenValue.charCodeAt(0);
    //    if (ch >= CharacterCodes.a && ch <= CharacterCodes.z && hasOwnProperty.call(textToToken, tokenValue)) {
    //        return token = textToToken[tokenValue];
    //    }
    //}
    return keywords[token];
}
exports.stringToToken = stringToToken;
/// <summary>
/// 获取标识符是否是关键字。
/// </summary>
/// <param name="type"></param>
/// <returns></returns>
function isKeyword(token) {
    return Unicode.isLetter(type.getName()[0]);
}
exports.isKeyword = isKeyword;
/**
 * 判断一个标记是否是标识符或关键字。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isIdentifierOrKeyword(token) {
    return token >= SyntaxKind.Identifier;
}
exports.isIdentifierOrKeyword = isIdentifierOrKeyword;
//# sourceMappingURL=tokenType.js.map