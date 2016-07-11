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
     * 最小的表达式开始。
     */
    TokenType[TokenType["MIN_EXPRESSION_START"] = 2] = "MIN_EXPRESSION_START";
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
     * 最小的单目运算符。
     */
    TokenType[TokenType["MIN_UNARY_OPERATOR"] = 31] = "MIN_UNARY_OPERATOR";
    /**
     * 开花括号({)。
     */
    TokenType[TokenType["openBrace"] = 32] = "openBrace";
    /**
     * 非(!)。
     */
    TokenType[TokenType["exclamation"] = 33] = "exclamation";
    /**
     * 关键字 new。
     */
    TokenType[TokenType["new"] = 34] = "new";
    /**
     * 关键字 delete。
     */
    TokenType[TokenType["delete"] = 35] = "delete";
    /**
     * 关键字 typeof。
     */
    TokenType[TokenType["typeof"] = 36] = "typeof";
    /**
     * 关键字 void。
     */
    TokenType[TokenType["void"] = 37] = "void";
    /**
     * 位反(~)。
     */
    TokenType[TokenType["tilde"] = 38] = "tilde";
    /**
     * 关键字 yield(仅在 JavaScript 7)。
     */
    TokenType[TokenType["yield"] = 39] = "yield";
    /**
     * 关键字 await(仅在 JavaScript 7)。
     */
    TokenType[TokenType["await"] = 40] = "await";
    /**
     * 电子邮件符号(@)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["at"] = 41] = "at";
    // #endregion
    // #region 单/双目运算符(Unary & Binary Operators)
    /**
     * 最小的双目运算符。
     */
    TokenType[TokenType["MIN_BINARY_OPERATOR"] = 42] = "MIN_BINARY_OPERATOR";
    /**
     * 开括号(()。
     */
    TokenType[TokenType["openParen"] = 43] = "openParen";
    /**
     * 开方括号([)。
     */
    TokenType[TokenType["openBracket"] = 44] = "openBracket";
    /**
     * 加(+)。
     */
    TokenType[TokenType["plus"] = 45] = "plus";
    /**
     * 减(-)。
     */
    TokenType[TokenType["minus"] = 46] = "minus";
    /**
     * 斜杠(/)。
     */
    TokenType[TokenType["slash"] = 47] = "slash";
    /**
     * 加加(++)。
     */
    TokenType[TokenType["plusPlus"] = 48] = "plusPlus";
    /**
     * 减减(--)。
     */
    TokenType[TokenType["minusMinus"] = 49] = "minusMinus";
    /**
     * 小于(<)。
     */
    TokenType[TokenType["lessThan"] = 50] = "lessThan";
    /**
     * 箭头(=>)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["equalsGreaterThan"] = 51] = "equalsGreaterThan";
    /**
     * 点点点(...)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["dotDotDot"] = 52] = "dotDotDot";
    /**
     * 最大的单目运算符。
     */
    TokenType[TokenType["MAX_UNARY_OPERATOR"] = 53] = "MAX_UNARY_OPERATOR";
    /**
     * 最大的表达式开始。
     */
    TokenType[TokenType["MAX_EXPRESSION_START"] = 54] = "MAX_EXPRESSION_START";
    // #endregion
    // #region 双目运算符(Binary Operators)
    /**
     * 点(.)。
     */
    TokenType[TokenType["dot"] = 55] = "dot";
    /**
     * 点点(..)(仅在 TealScript)。
     */
    TokenType[TokenType["dotDot"] = 56] = "dotDot";
    /**
     * 问号点(?.)(仅在 TealScript)。
     */
    TokenType[TokenType["questionDot"] = 57] = "questionDot";
    /**
     * 星号(*)。
     */
    TokenType[TokenType["asterisk"] = 58] = "asterisk";
    /**
     * 位与(&)。
     */
    TokenType[TokenType["ampersand"] = 59] = "ampersand";
    /**
     * 关键字 in。
     */
    TokenType[TokenType["in"] = 60] = "in";
    /**
     * 关键字 instanceOf。
     */
    TokenType[TokenType["instanceOf"] = 61] = "instanceOf";
    /**
     * 百分号(%)。
     */
    TokenType[TokenType["percent"] = 62] = "percent";
    /**
     * 大于(>)。
     */
    TokenType[TokenType["greaterThan"] = 63] = "greaterThan";
    /**
     * 小于等于(<=)。
     */
    TokenType[TokenType["lessThanEquals"] = 64] = "lessThanEquals";
    /**
     * 大于等于(>=)。
     */
    TokenType[TokenType["greaterThanEquals"] = 65] = "greaterThanEquals";
    /**
     * 等于等于(==)。
     */
    TokenType[TokenType["equalsEquals"] = 66] = "equalsEquals";
    /**
     * 不等于(!=)。
     */
    TokenType[TokenType["exclamationEquals"] = 67] = "exclamationEquals";
    /**
     * 等于等于等于(===)。
     */
    TokenType[TokenType["equalsEqualsEquals"] = 68] = "equalsEqualsEquals";
    /**
     * 不等于等于(!==)。
     */
    TokenType[TokenType["exclamationEqualsEquals"] = 69] = "exclamationEqualsEquals";
    /**
     * 左移(<<)。
     */
    TokenType[TokenType["lessThanLessThan"] = 70] = "lessThanLessThan";
    /**
     * 右移(>>)。
     */
    TokenType[TokenType["greaterThanGreaterThan"] = 71] = "greaterThanGreaterThan";
    /**
     * 无符右移(>>>)。
     */
    TokenType[TokenType["greaterThanGreaterThanGreaterThan"] = 72] = "greaterThanGreaterThanGreaterThan";
    /**
     * 位或(|)。
     */
    TokenType[TokenType["bar"] = 73] = "bar";
    /**
     * 异或(^)。
     */
    TokenType[TokenType["caret"] = 74] = "caret";
    /**
     * 与(&&)。
     */
    TokenType[TokenType["ampersandAmpersand"] = 75] = "ampersandAmpersand";
    /**
     * 或(||)。
     */
    TokenType[TokenType["barBar"] = 76] = "barBar";
    /**
     * 星号星号(**)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["asteriskAsterisk"] = 77] = "asteriskAsterisk";
    /**
     * 最小的赋值运算符。
     */
    TokenType[TokenType["MIN_ASSIGN_OPERATOR"] = 78] = "MIN_ASSIGN_OPERATOR";
    /**
     * 等于(=)。
     */
    TokenType[TokenType["equals"] = 79] = "equals";
    /**
     * 加等于(+=)。
     */
    TokenType[TokenType["plusEquals"] = 80] = "plusEquals";
    /**
     * 减等于(-=)。
     */
    TokenType[TokenType["minusEquals"] = 81] = "minusEquals";
    /**
     * 星号等于(*=)。
     */
    TokenType[TokenType["asteriskEquals"] = 82] = "asteriskEquals";
    /**
     * 斜杠等于(/=)。
     */
    TokenType[TokenType["slashEquals"] = 83] = "slashEquals";
    /**
     * 百分号等于(%=)。
     */
    TokenType[TokenType["percentEquals"] = 84] = "percentEquals";
    /**
     * 左移等于(<<=)。
     */
    TokenType[TokenType["lessThanLessThanEquals"] = 85] = "lessThanLessThanEquals";
    /**
     * 右移等于(>>=)。
     */
    TokenType[TokenType["greaterThanGreaterThanEquals"] = 86] = "greaterThanGreaterThanEquals";
    /**
     * 无符右移等于(>>>=)。
     */
    TokenType[TokenType["greaterThanGreaterThanGreaterThanEquals"] = 87] = "greaterThanGreaterThanGreaterThanEquals";
    /**
     * 位与等于(&=)。
     */
    TokenType[TokenType["ampersandEquals"] = 88] = "ampersandEquals";
    /**
     * 位或等于(|=)。
     */
    TokenType[TokenType["barEquals"] = 89] = "barEquals";
    /**
     * 异或等于(^=)。
     */
    TokenType[TokenType["caretEquals"] = 90] = "caretEquals";
    /**
     * 星号星号等于(**=)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["asteriskAsteriskEquals"] = 91] = "asteriskAsteriskEquals";
    /**
     * 最大的赋值运算符。
     */
    TokenType[TokenType["MAX_ASSIGN_OPERATOR"] = 92] = "MAX_ASSIGN_OPERATOR";
    /**
     * 问号(?)。
     */
    TokenType[TokenType["question"] = 93] = "question";
    /**
     * 逗号(,)。
     */
    TokenType[TokenType["comma"] = 94] = "comma";
    /**
     * 关键字 as(仅在 TypeScript)。
     */
    TokenType[TokenType["as"] = 95] = "as";
    /**
     * 关键字 is(仅在 TypeScript)。
     */
    TokenType[TokenType["is"] = 96] = "is";
    /**
     * 最大的双目运算符。
     */
    TokenType[TokenType["MAX_BINARY_OPERATOR"] = 97] = "MAX_BINARY_OPERATOR";
    // #endregion
    // #region 其它运算符(Other Operators)
    /**
     * 闭括号())。
     */
    TokenType[TokenType["closeParen"] = 98] = "closeParen";
    /**
     * 闭方括号(])。
     */
    TokenType[TokenType["closeBracket"] = 99] = "closeBracket";
    /**
     * 闭花括号(})。
     */
    TokenType[TokenType["closeBrace"] = 100] = "closeBrace";
    /**
     * 冒号(:)。
     */
    TokenType[TokenType["colon"] = 101] = "colon";
    /**
     * 分号(;)。
     */
    TokenType[TokenType["semicolon"] = 102] = "semicolon";
    /**
     * 模板字符串主体(}...${)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["templateMiddle"] = 103] = "templateMiddle";
    /**
     * 模板字符串尾(}...`)(仅在 JavaScript 7)。
     */
    TokenType[TokenType["templateTail"] = 104] = "templateTail";
    // #endregion
    // #region 语句头(Statement Headers)
    /**
     * 最小的语句开始。
     */
    TokenType[TokenType["MIN_STATEMENT_START"] = 105] = "MIN_STATEMENT_START";
    /**
     * 关键字 if。
     */
    TokenType[TokenType["if"] = 106] = "if";
    /**
     * 关键字 switch。
     */
    TokenType[TokenType["switch"] = 107] = "switch";
    /**
     * 关键字 for。
     */
    TokenType[TokenType["for"] = 108] = "for";
    /**
     * 关键字 while。
     */
    TokenType[TokenType["while"] = 109] = "while";
    /**
     * 关键字 do。
     */
    TokenType[TokenType["do"] = 110] = "do";
    /**
     * 关键字 continue。
     */
    TokenType[TokenType["continue"] = 111] = "continue";
    /**
     * 关键字 break。
     */
    TokenType[TokenType["break"] = 112] = "break";
    /**
     * 关键字 return。
     */
    TokenType[TokenType["return"] = 113] = "return";
    /**
     * 关键字 throw。
     */
    TokenType[TokenType["throw"] = 114] = "throw";
    /**
     * 关键字 try。
     */
    TokenType[TokenType["try"] = 115] = "try";
    /**
     * 关键字 var。
     */
    TokenType[TokenType["var"] = 116] = "var";
    /**
     * 关键字 const(仅在 JavaScript 7)。
     */
    TokenType[TokenType["const"] = 117] = "const";
    /**
     * 关键字 let(仅在 JavaScript 7)。
     */
    TokenType[TokenType["let"] = 118] = "let";
    /**
     * 关键字 debugger。
     */
    TokenType[TokenType["debugger"] = 119] = "debugger";
    /**
     * 关键字 with。
     */
    TokenType[TokenType["with"] = 120] = "with";
    /**
     * 关键字 import(仅在 JavaScript 7)。
     */
    TokenType[TokenType["import"] = 121] = "import";
    /**
     * 关键字 package(仅在 JavaScript 7)。
     */
    TokenType[TokenType["package"] = 122] = "package";
    /**
     * 关键字 type(仅在 TypeScript)。
     */
    TokenType[TokenType["type"] = 123] = "type";
    /**
     * 关键字 namespace(仅在 TypeScript)。
     */
    TokenType[TokenType["namespace"] = 124] = "namespace";
    /**
     * 关键字 module(仅在 TypeScript)。
     */
    TokenType[TokenType["module"] = 125] = "module";
    /**
     * 最大的语句开始。
     */
    TokenType[TokenType["MAX_STATEMENT_START"] = 126] = "MAX_STATEMENT_START";
    // #endregion
    // #region 其它语句(Other Statements)
    /**
     * 关键字 else。
     */
    TokenType[TokenType["else"] = 127] = "else";
    /**
     * 关键字 case。
     */
    TokenType[TokenType["case"] = 128] = "case";
    /**
     * 关键字 default。
     */
    TokenType[TokenType["default"] = 129] = "default";
    /**
     * 关键字 catch。
     */
    TokenType[TokenType["catch"] = 130] = "catch";
    /**
     * 关键字 finally。
     */
    TokenType[TokenType["finally"] = 131] = "finally";
    /**
     * 关键字 from(仅在 JavaScript 7)。
     */
    TokenType[TokenType["from"] = 132] = "from";
    /**
     * 关键字 extends(仅在 JavaScript 7)。
     */
    TokenType[TokenType["extends"] = 133] = "extends";
    /**
     * 关键字 implements(仅在 JavaScript 7)。
     */
    TokenType[TokenType["implements"] = 134] = "implements";
    /**
     * 关键字 of(仅在 JavaScript 7)。
     */
    TokenType[TokenType["of"] = 135] = "of";
    /**
     * 关键字 to(仅在 TealScript)。
     */
    TokenType[TokenType["to"] = 136] = "to";
    /**
     * 关键字 get(仅在 JavaScript 7)。
     */
    TokenType[TokenType["get"] = 137] = "get";
    /**
     * 关键字 set(仅在 JavaScript 7)。
     */
    TokenType[TokenType["set"] = 138] = "set";
    /**
     * 关键字 undefined(仅在 TypeScript)。
     */
    TokenType[TokenType["undefined"] = 139] = "undefined";
    /**
     * 关键字 constructor(仅在 TypeScript)。
     */
    TokenType[TokenType["constructor"] = 140] = "constructor";
    /**
     * 关键字 global(仅在 TypeScript)。
     */
    TokenType[TokenType["global"] = 141] = "global";
    // #endregion
    // #region 内置类型(Predefined Types)
    /**
     * 最小的内置类型。
     */
    TokenType[TokenType["MIN_PREDEFINED_TYPE"] = 142] = "MIN_PREDEFINED_TYPE";
    /**
     * 关键字 any(仅在 TypeScript)。
     */
    TokenType[TokenType["any"] = 143] = "any";
    /**
     * 关键字 boolean(仅在 TypeScript)。
     */
    TokenType[TokenType["boolean"] = 144] = "boolean";
    /**
     * 关键字 number(仅在 TypeScript)。
     */
    TokenType[TokenType["number"] = 145] = "number";
    /**
     * 关键字 string(仅在 TypeScript)。
     */
    TokenType[TokenType["string"] = 146] = "string";
    /**
     * 关键字 symbol(仅在 TypeScript)。
     */
    TokenType[TokenType["symbol"] = 147] = "symbol";
    /**
     * 关键字 never(仅在 TypeScript)。
     */
    TokenType[TokenType["never"] = 148] = "never";
    /**
     * 最大的内置类型。
     */
    TokenType[TokenType["MAX_PREDEFINED_TYPE"] = 149] = "MAX_PREDEFINED_TYPE";
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
 * 判断指定的标记是否是单目运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isUnaryOperator(token) {
    return token > TokenType.MIN_UNARY_OPERATOR && token < TokenType.MAX_UNARY_OPERATOR;
}
exports.isUnaryOperator = isUnaryOperator;
/**
 * 判断指定的标记是否是双目运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isBinaryOperator(token) {
    return token > TokenType.MIN_BINARY_OPERATOR && token < TokenType.MAX_BINARY_OPERATOR;
}
exports.isBinaryOperator = isBinaryOperator;
/**
 * 判断指定的标记是否是修饰符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isModifier(token) {
    return token > TokenType.MIN_MODIFIER && token < TokenType.MAX_MODIFIER;
}
exports.isModifier = isModifier;
/**
 * 判断指定的标记是否是语句开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isStatementStart(token) {
    return token > TokenType.MIN_STATEMENT_START && token < TokenType.MAX_STATEMENT_START;
}
exports.isStatementStart = isStatementStart;
/**
 * 判断指定的标记是否是表达式开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isExpressionStart(token) {
    return token > TokenType.MIN_EXPRESSION_START && token < TokenType.MAX_EXPRESSION_START;
}
exports.isExpressionStart = isExpressionStart;
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
/**
 * 存储所有优先级。
 */
var precedences = (_a = {},
    _a[TokenType.comma] = 1,
    _a[TokenType.equals] = 2,
    _a[TokenType.plusEquals] = 2,
    _a[TokenType.minusEquals] = 2,
    _a[TokenType.asteriskEquals] = 2,
    _a[TokenType.slashEquals] = 2,
    _a[TokenType.percentEquals] = 2,
    _a[TokenType.lessThanLessThanEquals] = 2,
    _a[TokenType.greaterThanGreaterThanEquals] = 2,
    _a[TokenType.greaterThanGreaterThanGreaterThanEquals] = 2,
    _a[TokenType.ampersandEquals] = 2,
    _a[TokenType.barEquals] = 2,
    _a[TokenType.caretEquals] = 2,
    _a[TokenType.asteriskEquals] = 2,
    _a[TokenType.asteriskAsteriskEquals] = 2,
    _a[TokenType.question] = 3,
    _a[TokenType.barBar] = 4,
    _a[TokenType.ampersandAmpersand] = 5,
    _a[TokenType.bar] = 6,
    _a[TokenType.caret] = 7,
    _a[TokenType.ampersand] = 8,
    _a[TokenType.equalsEquals] = 9,
    _a[TokenType.exclamationEquals] = 9,
    _a[TokenType.equalsEqualsEquals] = 9,
    _a[TokenType.exclamationEqualsEquals] = 9,
    _a[TokenType.lessThan] = 10,
    _a[TokenType.greaterThan] = 10,
    _a[TokenType.lessThanEquals] = 10,
    _a[TokenType.greaterThanEquals] = 10,
    _a[TokenType.instanceOf] = 10,
    _a[TokenType.in] = 10,
    _a[TokenType.is] = 10,
    _a[TokenType.as] = 10,
    _a[TokenType.lessThanLessThan] = 11,
    _a[TokenType.greaterThanGreaterThan] = 11,
    _a[TokenType.greaterThanGreaterThanGreaterThan] = 11,
    _a[TokenType.plus] = 12,
    _a[TokenType.minus] = 12,
    _a[TokenType.asterisk] = 13,
    _a[TokenType.slash] = 13,
    _a[TokenType.percent] = 13,
    _a[TokenType.asteriskAsterisk] = 14,
    _a
);
/**
 * 获取操作符的优先级。
 * @param token 要判断的标记。
 * @returns 返回一个数字。数字越大说明优先级越高。
 */
function getPrecedence(token) {
    return precedences[token] || 15;
}
exports.getPrecedence = getPrecedence;
var _a;
//# sourceMappingURL=tokenType.js.map