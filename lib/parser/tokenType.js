/**
 * @fileOverview 标记和关键字
 * @author xuld@vip.qq.com
 * @statable
 */
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
 * 判断指定的标记是否是表达式开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isSimpleLiteral(token) {
    return token > 28 /* MIN_SIMPLE_LITERAL */ && token < 34 /* MAX_SIMPLE_LITERAL */;
}
exports.isSimpleLiteral = isSimpleLiteral;
/**
 * 判断指定的标记是否是单目运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isUnaryOperator(token) {
    return token > 35 /* MIN_UNARY_OPERATOR */ && token < 57 /* MAX_UNARY_OPERATOR */;
}
exports.isUnaryOperator = isUnaryOperator;
/**
 * 判断指定的标记是否是双目运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isBinaryOperator(token) {
    return token > 46 /* MIN_BINARY_OPERATOR */ && token < 101 /* MAX_BINARY_OPERATOR */;
}
exports.isBinaryOperator = isBinaryOperator;
/**
 * 判断指定的标记是否是修饰符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isModifier(token) {
    return token > 4 /* MIN_MODIFIER */ && token < 15 /* MAX_MODIFIER */ || token === 124 /* const */;
}
exports.isModifier = isModifier;
/**
 * 判断指定的标记是否是定义开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isDeclarationStart(token) {
    return token > 3 /* MIN_DECLARATION_START */ && token < 21 /* MAX_DECLARATION_START */;
}
exports.isDeclarationStart = isDeclarationStart;
/**
 * 判断指定的标记是否是语句开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isStatementStart(token) {
    return token > 109 /* MIN_STATEMENT_START */ && token < 132 /* MAX_STATEMENT_START */;
}
exports.isStatementStart = isStatementStart;
/**
 * 判断指定的标记是否是表达式开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isExpressionStart(token) {
    return token > 2 /* MIN_EXPRESSION_START */ && token < 58 /* MAX_EXPRESSION_START */;
}
exports.isExpressionStart = isExpressionStart;
/**
 * 判断指定的标记是否是关键字。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isKeyword(token) {
    var ch = tokenToString(token).charCodeAt(0);
    return ch >= 97 /* a */ && ch <= 122 /* z */;
}
exports.isKeyword = isKeyword;
/**
 * 判断指定的标记是否是保留字。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isReservedWord(token) {
    return token > 5 /* MIN_RESERVERD_WORD_1 */ && token < 19 /* MAX_RESERVERD_WORD_1 */ ||
        token > 123 /* MIN_RESERVERD_WORD_2 */ && token < 131 /* MAX_RESERVERD_WORD_2 */ ||
        token > 138 /* MIN_RESERVERD_WORD_3 */ && token < 156 /* MAX_RESERVERD_WORD_3 */ ||
        token === 33 /* super */ || token === 43 /* yield */ || token === 44 /* await */ ||
        token === 99 /* as */ || token === 100 /* is */;
}
exports.isReservedWord = isReservedWord;
/**
 * 存储所有优先级。
 */
var precedences = (_a = {},
    _a[98 /* comma */] = 1,
    _a[83 /* equals */] = 2,
    _a[84 /* plusEquals */] = 2,
    _a[85 /* minusEquals */] = 2,
    _a[86 /* asteriskEquals */] = 2,
    _a[87 /* slashEquals */] = 2,
    _a[88 /* percentEquals */] = 2,
    _a[89 /* lessThanLessThanEquals */] = 2,
    _a[90 /* greaterThanGreaterThanEquals */] = 2,
    _a[91 /* greaterThanGreaterThanGreaterThanEquals */] = 2,
    _a[92 /* ampersandEquals */] = 2,
    _a[93 /* barEquals */] = 2,
    _a[94 /* caretEquals */] = 2,
    _a[86 /* asteriskEquals */] = 2,
    _a[95 /* asteriskAsteriskEquals */] = 2,
    _a[97 /* question */] = 3,
    _a[80 /* barBar */] = 4,
    _a[79 /* ampersandAmpersand */] = 5,
    _a[77 /* bar */] = 6,
    _a[78 /* caret */] = 7,
    _a[63 /* ampersand */] = 8,
    _a[70 /* equalsEquals */] = 9,
    _a[71 /* exclamationEquals */] = 9,
    _a[72 /* equalsEqualsEquals */] = 9,
    _a[73 /* exclamationEqualsEquals */] = 9,
    _a[54 /* lessThan */] = 10,
    _a[67 /* greaterThan */] = 10,
    _a[68 /* lessThanEquals */] = 10,
    _a[69 /* greaterThanEquals */] = 10,
    _a[65 /* instanceOf */] = 10,
    _a[64 /* in */] = 10,
    _a[100 /* is */] = 10,
    _a[99 /* as */] = 10,
    _a[74 /* lessThanLessThan */] = 11,
    _a[75 /* greaterThanGreaterThan */] = 11,
    _a[76 /* greaterThanGreaterThanGreaterThan */] = 11,
    _a[49 /* plus */] = 12,
    _a[50 /* minus */] = 12,
    _a[62 /* asterisk */] = 13,
    _a[51 /* slash */] = 13,
    _a[66 /* percent */] = 13,
    _a[81 /* asteriskAsterisk */] = 14,
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