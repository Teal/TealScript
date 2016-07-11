/**
 * @fileOverview 标记和关键字
 */
var charCode_1 = require('./charCode');
/**
 * 表示一个标记类型。
 * @internal
 */
(function (TokenType) {
    // #region 控制符(Control)
    /**
     * 未知标记。
     */
    TokenType[TokenType["unknown"] = 0] = "unknown";
    /**
     * 文件已结束(EOF)。
     */
    TokenType[TokenType["endOfFile"] = 1] = "endOfFile";
    // #endregion
    // #region 修饰符(Modifiers)
    /**
     * 最小的单目运算符。
     */
    TokenType[TokenType["MIN_UNARY_OPERATOR"] = 2] = "MIN_UNARY_OPERATOR";
    /**
     * 最小的修饰符前缀。
     */
    TokenType[TokenType["MIN_MODIFIER"] = 3] = "MIN_MODIFIER";
    /**
     * 关键字 export(仅在 JavaScript 7)。
     */
    TokenType[TokenType["export"] = 4] = "export";
    /**
     * 关键字 async(仅在 JavaScript 7)。
     */
    TokenType[TokenType["async"] = 5] = "async";
    /**
     * 关键字 private(仅在 JavaScript 7)。
     */
    TokenType[TokenType["private"] = 6] = "private";
    /**
     * 关键字 protected(仅在 JavaScript 7)。
     */
    TokenType[TokenType["protected"] = 7] = "protected";
    /**
     * 关键字 public(仅在 JavaScript 7)。
     */
    TokenType[TokenType["public"] = 8] = "public";
    /**
     * 关键字 static(仅在 JavaScript 7)。
     */
    TokenType[TokenType["static"] = 9] = "static";
    /**
     * 关键字 abstract(仅在 JavaScript 7)。
     */
    TokenType[TokenType["abstract"] = 10] = "abstract";
    /**
     * 关键字 declare(仅在 TypeScript)。
     */
    TokenType[TokenType["declare"] = 11] = "declare";
    /**
     * 关键字 readonly(仅在 TypeScript)。
     */
    TokenType[TokenType["readonly"] = 12] = "readonly";
    /**
     * 最大的修饰符前缀。
     */
    TokenType[TokenType["MAX_MODIFIER"] = 13] = "MAX_MODIFIER";
    // #endregion
    // #region 定义(Declarations)
    /**
     * 最小的定义前缀。
     */
    TokenType[TokenType["MIN_DECLARATION"] = 14] = "MIN_DECLARATION";
    /**
     * 关键字 enum(仅在 JavaScript 7)。
     */
    TokenType[TokenType["enum"] = 15] = "enum";
    /**
     * 关键字 interface(仅在 JavaScript 7)。
     */
    TokenType[TokenType["interface"] = 16] = "interface";
    /**
     * 关键字 class(仅在 JavaScript 7)。
     */
    TokenType[TokenType["class"] = 17] = "class";
    /**
     * 关键字 function。
     */
    TokenType[TokenType["function"] = 18] = "function";
    /**
     * 最大的定义前缀。
     */
    TokenType[TokenType["MAX_DECLARATION"] = 19] = "MAX_DECLARATION";
    // #endregion
    // #region 字面量(Literal)
    /**
     * 标识符(x)。
     */
    TokenType[TokenType["identifier"] = 20] = "identifier";
    /**
     * 数字字面量(0x0)。
     */
    TokenType[TokenType["numericLiteral"] = 21] = "numericLiteral";
    /**
     * 字符串字面量('...')。
     */
    TokenType[TokenType["stringLiteral"] = 22] = "stringLiteral";
    /**
     * 正则表达式字面量(/.../)。
     */
    TokenType[TokenType["regularExpressionLiteral"] = 23] = "regularExpressionLiteral";
    /**
     * 简单模板字符串字面量(`...`)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["noSubstitutionTemplateLiteral"] = 24] = "noSubstitutionTemplateLiteral";
    /**
     * 模板字符串头(`...${)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["templateHead"] = 25] = "templateHead";
    /**
     * 关键字 null。
     */
    TokenType[TokenType["null"] = 26] = "null";
    /**
     * 关键字 true。
     */
    TokenType[TokenType["true"] = 27] = "true";
    /**
     * 关键字 false。
     */
    TokenType[TokenType["false"] = 28] = "false";
    /**
     * 关键字 this。
     */
    TokenType[TokenType["this"] = 29] = "this";
    /**
     * 关键字 super(仅在 JavaScript 7)。
     */
    TokenType[TokenType["super"] = 30] = "super";
    // #endregion
    // #region 单目运算符(Unary Operators)
    /**
     * 开花括号({)。
     * @precedence 80
     */
    TokenType[TokenType["openBrace"] = 31] = "openBrace";
    /**
     * 非(!)。
     */
    TokenType[TokenType["exclamation"] = 32] = "exclamation";
    /**
     * 关键字 new。
     */
    TokenType[TokenType["new"] = 33] = "new";
    /**
     * 关键字 delete。
     */
    TokenType[TokenType["delete"] = 34] = "delete";
    /**
     * 关键字 typeof。
     */
    TokenType[TokenType["typeof"] = 35] = "typeof";
    /**
     * 关键字 void。
     */
    TokenType[TokenType["void"] = 36] = "void";
    /**
     * 位反(~)。
     */
    TokenType[TokenType["tilde"] = 37] = "tilde";
    /**
     * 关键字 yield(仅在 JavaScript 7)。
     */
    TokenType[TokenType["yield"] = 38] = "yield";
    /**
     * 关键字 await(仅在 JavaScript 7)。
     */
    TokenType[TokenType["await"] = 39] = "await";
    /**
     * 电子邮件符号(@)(仅在 JavaScript 7)。
     * @precedence 80
     */
    TokenType[TokenType["at"] = 40] = "at";
    // #endregion
    // #region 单/双目运算符(Unary & Binary Operators)
    /**
     * 最小的双目运算符。
     */
    TokenType[TokenType["MIN_BINARY_OPERATOR"] = 41] = "MIN_BINARY_OPERATOR";
    /**
     * 开括号(()。
     * @precedence 80
     */
    TokenType[TokenType["openParen"] = 42] = "openParen";
    /**
     * 开方括号([)。
     * @precedence 80
     */
    TokenType[TokenType["openBracket"] = 43] = "openBracket";
    /**
     * 加(+)。
     */
    TokenType[TokenType["plus"] = 44] = "plus";
    /**
     * 减(-)。
     */
    TokenType[TokenType["minus"] = 45] = "minus";
    /**
     * 斜杠(/)。
     */
    TokenType[TokenType["slash"] = 46] = "slash";
    /**
     * 加加(++)。
     */
    TokenType[TokenType["plusPlus"] = 47] = "plusPlus";
    /**
     * 减减(--)。
     */
    TokenType[TokenType["minusMinus"] = 48] = "minusMinus";
    /**
     * 小于(<)。
     */
    TokenType[TokenType["lessThan"] = 49] = "lessThan";
    /**
     * 箭头(=>)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["equalsGreaterThan"] = 50] = "equalsGreaterThan";
    /**
     * 点点点(...)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["dotDotDot"] = 51] = "dotDotDot";
    /**
     * 最大的单目运算符。
     */
    TokenType[TokenType["MAX_UNARY_OPERATOR"] = 52] = "MAX_UNARY_OPERATOR";
    // #endregion
    // #region 双目运算符(Binary Operators)
    /**
     * 点(.)。
     */
    TokenType[TokenType["dot"] = 53] = "dot";
    /**
     * 点点(..)(仅在 TealScript)。
     */
    TokenType[TokenType["dotDot"] = 54] = "dotDot";
    /**
     * 问号点(?.)(仅在 TealScript)。
     */
    TokenType[TokenType["questionDot"] = 55] = "questionDot";
    /**
     * 星号(*)。
     */
    TokenType[TokenType["asterisk"] = 56] = "asterisk";
    /**
     * 位与(&)。
     */
    TokenType[TokenType["ampersand"] = 57] = "ampersand";
    /**
     * 关键字 in。
     */
    TokenType[TokenType["in"] = 58] = "in";
    /**
     * 关键字 instanceOf。
     */
    TokenType[TokenType["instanceOf"] = 59] = "instanceOf";
    /**
     * 百分号(%)。
     */
    TokenType[TokenType["percent"] = 60] = "percent";
    /**
     * 大于(>)。
     */
    TokenType[TokenType["greaterThan"] = 61] = "greaterThan";
    /**
     * 小于等于(<=)。
     */
    TokenType[TokenType["lessThanEquals"] = 62] = "lessThanEquals";
    /**
     * 大于等于(>=)。
     */
    TokenType[TokenType["greaterThanEquals"] = 63] = "greaterThanEquals";
    /**
     * 等于等于(==)。
     */
    TokenType[TokenType["equalsEquals"] = 64] = "equalsEquals";
    /**
     * 不等于(!=)。
     */
    TokenType[TokenType["exclamationEquals"] = 65] = "exclamationEquals";
    /**
     * 等于等于等于(===)。
     */
    TokenType[TokenType["equalsEqualsEquals"] = 66] = "equalsEqualsEquals";
    /**
     * 不等于等于(!==)。
     */
    TokenType[TokenType["exclamationEqualsEquals"] = 67] = "exclamationEqualsEquals";
    /**
     * 左移(<<)。
     */
    TokenType[TokenType["lessThanLessThan"] = 68] = "lessThanLessThan";
    /**
     * 右移(>>)。
     */
    TokenType[TokenType["greaterThanGreaterThan"] = 69] = "greaterThanGreaterThan";
    /**
     * 无符右移(>>>)。
     */
    TokenType[TokenType["greaterThanGreaterThanGreaterThan"] = 70] = "greaterThanGreaterThanGreaterThan";
    /**
     * 位或(|)。
     */
    TokenType[TokenType["bar"] = 71] = "bar";
    /**
     * 异或(^)。
     */
    TokenType[TokenType["caret"] = 72] = "caret";
    /**
     * 与(&&)。
     */
    TokenType[TokenType["ampersandAmpersand"] = 73] = "ampersandAmpersand";
    /**
     * 或(||)。
     */
    TokenType[TokenType["barBar"] = 74] = "barBar";
    /**
     * 星号星号(**)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["asteriskAsterisk"] = 75] = "asteriskAsterisk";
    /**
     * 最小的赋值运算符。
     */
    TokenType[TokenType["MIN_ASSIGN_OPERATOR"] = 76] = "MIN_ASSIGN_OPERATOR";
    /**
     * 等于(=)。
     */
    TokenType[TokenType["equals"] = 77] = "equals";
    /**
     * 加等于(+=)。
     */
    TokenType[TokenType["plusEquals"] = 78] = "plusEquals";
    /**
     * 减等于(-=)。
     */
    TokenType[TokenType["minusEquals"] = 79] = "minusEquals";
    /**
     * 星号等于(*=)。
     */
    TokenType[TokenType["asteriskEquals"] = 80] = "asteriskEquals";
    /**
     * 斜杠等于(/=)。
     */
    TokenType[TokenType["slashEquals"] = 81] = "slashEquals";
    /**
     * 百分号等于(%=)。
     */
    TokenType[TokenType["percentEquals"] = 82] = "percentEquals";
    /**
     * 左移等于(<<=)。
     */
    TokenType[TokenType["lessThanLessThanEquals"] = 83] = "lessThanLessThanEquals";
    /**
     * 右移等于(>>=)。
     */
    TokenType[TokenType["greaterThanGreaterThanEquals"] = 84] = "greaterThanGreaterThanEquals";
    /**
     * 无符右移等于(>>>=)。
     */
    TokenType[TokenType["greaterThanGreaterThanGreaterThanEquals"] = 85] = "greaterThanGreaterThanGreaterThanEquals";
    /**
     * 位与等于(&=)。
     */
    TokenType[TokenType["ampersandEquals"] = 86] = "ampersandEquals";
    /**
     * 位或等于(|=)。
     */
    TokenType[TokenType["barEquals"] = 87] = "barEquals";
    /**
     * 异或等于(^=)。
     */
    TokenType[TokenType["caretEquals"] = 88] = "caretEquals";
    /**
     * 星号星号等于(**=)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["asteriskAsteriskEquals"] = 89] = "asteriskAsteriskEquals";
    /**
     * 最大的赋值运算符。
     */
    TokenType[TokenType["MAX_ASSIGN_OPERATOR"] = 90] = "MAX_ASSIGN_OPERATOR";
    /**
     * 问号(?)。
     */
    TokenType[TokenType["question"] = 91] = "question";
    /**
     * 逗号(,)。
     * @precedence 8
     */
    TokenType[TokenType["comma"] = 92] = "comma";
    /**
     * 关键字 as(仅在 TypeScript)。
     */
    TokenType[TokenType["as"] = 93] = "as";
    /**
     * 关键字 is(仅在 TypeScript)。
     */
    TokenType[TokenType["is"] = 94] = "is";
    /**
     * 最大的双目运算符。
     */
    TokenType[TokenType["MAX_BINARY_OPERATOR"] = 95] = "MAX_BINARY_OPERATOR";
    // #endregion
    // #region 其它运算符(Other Operators)
    /**
     * 闭括号())。
     * @precedence 84
     */
    TokenType[TokenType["closeParen"] = 96] = "closeParen";
    /**
     * 闭方括号(])。
     * @precedence 84
     */
    TokenType[TokenType["closeBracket"] = 97] = "closeBracket";
    /**
     * 闭花括号(})。
     * @precedence 84
     */
    TokenType[TokenType["closeBrace"] = 98] = "closeBrace";
    /**
     * 冒号(:)。
     * @precedence 82
     */
    TokenType[TokenType["colon"] = 99] = "colon";
    /**
     * 分号(;)。
     * @precedence 100
     */
    TokenType[TokenType["semicolon"] = 100] = "semicolon";
    /**
     * 模板字符串主体(}...${)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["templateMiddle"] = 101] = "templateMiddle";
    /**
     * 模板字符串尾(}...`)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["templateTail"] = 102] = "templateTail";
    // #endregion
    // #region 语句头(Statement Headers)
    /**
     * 最小的语句。
     */
    TokenType[TokenType["MIN_STATEMENT"] = 103] = "MIN_STATEMENT";
    /**
     * 关键字 if。
     */
    TokenType[TokenType["if"] = 104] = "if";
    /**
     * 关键字 switch。
     */
    TokenType[TokenType["switch"] = 105] = "switch";
    /**
     * 关键字 for。
     */
    TokenType[TokenType["for"] = 106] = "for";
    /**
     * 关键字 while。
     */
    TokenType[TokenType["while"] = 107] = "while";
    /**
     * 关键字 do。
     */
    TokenType[TokenType["do"] = 108] = "do";
    /**
     * 关键字 continue。
     */
    TokenType[TokenType["continue"] = 109] = "continue";
    /**
     * 关键字 break。
     */
    TokenType[TokenType["break"] = 110] = "break";
    /**
     * 关键字 return。
     */
    TokenType[TokenType["return"] = 111] = "return";
    /**
     * 关键字 throw。
     */
    TokenType[TokenType["throw"] = 112] = "throw";
    /**
     * 关键字 try。
     */
    TokenType[TokenType["try"] = 113] = "try";
    /**
     * 关键字 var。
     */
    TokenType[TokenType["var"] = 114] = "var";
    /**
     * 关键字 const(仅在 JavaScript 7)。
     */
    TokenType[TokenType["const"] = 115] = "const";
    /**
     * 关键字 let(仅在 JavaScript 7)。
     */
    TokenType[TokenType["let"] = 116] = "let";
    /**
     * 关键字 debugger。
     */
    TokenType[TokenType["debugger"] = 117] = "debugger";
    /**
     * 关键字 with。
     */
    TokenType[TokenType["with"] = 118] = "with";
    /**
     * 关键字 import(仅在 JavaScript 7)。
     */
    TokenType[TokenType["import"] = 119] = "import";
    /**
     * 关键字 package(仅在 JavaScript 7)。
     */
    TokenType[TokenType["package"] = 120] = "package";
    /**
     * 关键字 type(仅在 TypeScript)。
     */
    TokenType[TokenType["type"] = 121] = "type";
    /**
     * 关键字 namespace(仅在 TypeScript)。
     */
    TokenType[TokenType["namespace"] = 122] = "namespace";
    /**
     * 关键字 module(仅在 TypeScript)。
     */
    TokenType[TokenType["module"] = 123] = "module";
    /**
     * 最大的语句。
     */
    TokenType[TokenType["MAX_STATEMENT"] = 124] = "MAX_STATEMENT";
    // #endregion
    // #region 其它语句(Other Statements)
    /**
     * 关键字 else。
     */
    TokenType[TokenType["else"] = 125] = "else";
    /**
     * 关键字 case。
     */
    TokenType[TokenType["case"] = 126] = "case";
    /**
     * 关键字 default。
     */
    TokenType[TokenType["default"] = 127] = "default";
    /**
     * 关键字 catch。
     */
    TokenType[TokenType["catch"] = 128] = "catch";
    /**
     * 关键字 finally。
     */
    TokenType[TokenType["finally"] = 129] = "finally";
    /**
     * 关键字 from(仅在 JavaScript 7)。
     */
    TokenType[TokenType["from"] = 130] = "from";
    /**
     * 关键字 extends(仅在 JavaScript 7)。
     */
    TokenType[TokenType["extends"] = 131] = "extends";
    /**
     * 关键字 implements(仅在 JavaScript 7)。
     */
    TokenType[TokenType["implements"] = 132] = "implements";
    /**
     * 关键字 of(仅在 JavaScript 7)。
     */
    TokenType[TokenType["of"] = 133] = "of";
    /**
     * 关键字 to(仅在 TealScript)。
     */
    TokenType[TokenType["to"] = 134] = "to";
    /**
     * 关键字 get(仅在 JavaScript 7)。
     */
    TokenType[TokenType["get"] = 135] = "get";
    /**
     * 关键字 set(仅在 JavaScript 7)。
     */
    TokenType[TokenType["set"] = 136] = "set";
    /**
     * 关键字 undefined(仅在 TypeScript)。
     */
    TokenType[TokenType["undefined"] = 137] = "undefined";
    /**
     * 关键字 constructor(仅在 TypeScript)。
     */
    TokenType[TokenType["constructor"] = 138] = "constructor";
    /**
     * 关键字 global(仅在 TypeScript)。
     */
    TokenType[TokenType["global"] = 139] = "global";
    // #endregion
    // #region 内置类型(Predefined Types)
    /**
     * 最小的内置类型。
     */
    TokenType[TokenType["MIN_PREDEFINED_TYPE"] = 140] = "MIN_PREDEFINED_TYPE";
    /**
     * 关键字 any(仅在 TypeScript)。
     */
    TokenType[TokenType["any"] = 141] = "any";
    /**
     * 关键字 boolean(仅在 TypeScript)。
     */
    TokenType[TokenType["boolean"] = 142] = "boolean";
    /**
     * 关键字 number(仅在 TypeScript)。
     */
    TokenType[TokenType["number"] = 143] = "number";
    /**
     * 关键字 string(仅在 TypeScript)。
     */
    TokenType[TokenType["string"] = 144] = "string";
    /**
     * 关键字 symbol(仅在 TypeScript)。
     */
    TokenType[TokenType["symbol"] = 145] = "symbol";
    /**
     * 关键字 never(仅在 TypeScript)。
     */
    TokenType[TokenType["never"] = 146] = "never";
    /**
     * 最大的内置类型。
     */
    TokenType[TokenType["MAX_PREDEFINED_TYPE"] = 147] = "MAX_PREDEFINED_TYPE";
})(exports.TokenType || (exports.TokenType = {}));
var TokenType = exports.TokenType;
/**
 * 将指定的字符串转为对应的标记。
 * @param token 要转换的字符串。
 * @returns 返回等效的标记。如果字符串无效，则返回 undefined。
 */
function stringToToken(token) {
    return TokenType[token];
}
exports.stringToToken = stringToToken;
/**
 * 将指定的标记转为对应的字符串。
 * @param token 要转换的标记。
 * @returns 返回等效的字符串。如果标记无效，则返回 undefined。
 */
function tokenToString(token) {
    return TokenType[token];
}
exports.tokenToString = tokenToString;
/**
 * 判断指定的标记是否是关键字。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isKeyword(token) {
    var ch = tokenToString(token).charCodeAt(0);
    return ch >= charCode_1.CharCode.a && ch <= charCode_1.CharCode.z;
}
exports.isKeyword = isKeyword;
//# sourceMappingURL=tokenType.js.map