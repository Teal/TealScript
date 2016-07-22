/**
 * @fileOverview 标记
 * @author xuld@vip.qq.com
 * @stable
 */
/**
 * @gernerated 此常量的值使用 `tpack gen-tokenType` 生成。
 */
var tokenNames = [];
/**
 * 获取指定标记的名字。
 * @param token 要获取的标记。
 * @returns 返回标记名字。如果标记无效，则返回 undefined。
 */
function getTokenName(token) {
    return tokenNames[token];
}
exports.getTokenName = getTokenName;
/**
 * 获取指定名字对应的标记类型。
 * @param token 要转换的字符串。
 * @returns 返回等效的标记。如果标记无效，则返回 undefined。
 * @remark 如需要获取关键字标记类型，建议使用更高效的 {@link getKeyword}。
 */
function getTokenType(value) {
    for (var i = 0; i < tokenNames.length; i++) {
        if (tokenNames[i] === value) {
            return i;
        }
    }
}
exports.getTokenType = getTokenType;
/**
 * @gernerated 此常量的值使用 `tpack gen-tokenType` 生成。
 */
var keywords = {};
/**
 * 获取指定标识符对应的关键字标记。
 * @param value 要转换的字符串。
 * @returns 返回等效的标记。如果字符串不是关键字，则返回 undefined。
 */
function getKeyword(value) {
    return keywords[value];
}
exports.getKeyword = getKeyword;
/**
 * 判断指定的标记是否是关键字。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @remark
 * 关键字是指在语言中有特定意义的名称。
 * 关键字可作为属性名使用，
 * 但不能作为变量名使用(部分除外)。
 */
function isKeyword(token) {
    var ch = (tokenNames[token] || "").charCodeAt(0);
    return ch >= 97 /* a */ && ch <= 122 /* z */;
}
exports.isKeyword = isKeyword;
/**
 * 判断指定的标记是否可作为标志名。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @remark 为了兼容历史代码，部分关键字允许被作为变量名使用。
 */
function isIdentifierName(token) {
    return token === 10 /* identifier */ ||
        token > 22 /* MIN_IDENTIFIER_NAME_1 */ && token < 35 /* MAX_IDENTIFIER_NAME_1 */ ||
        token > 43 /* MIN_IDENTIFIER_NAME_2 */ && token < 51 /* MAX_IDENTIFIER_NAME_2 */ ||
        token > 113 /* MIN_IDENTIFIER_NAME_3 */ && token < 130 /* MAX_IDENTIFIER_NAME_3 */;
}
exports.isIdentifierName = isIdentifierName;
/**
 * 判断指定的标记是否是严格模式下的标识符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isReservedWord(token) {
    return token === 41 /* class */ ||
        token === 42 /* enum */ ||
        token === 135 /* extends */ ||
        token === 23 /* super */ ||
        token === 38 /* const */ ||
        token === 36 /* export */ ||
        token === 151 /* import */;
}
exports.isReservedWord = isReservedWord;
/**
 * 判断指定的标记是否可作为内置类型。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isPredefinedType(token) {
    return token > 117 /* MIN_PREDEFINED_TYPE */ && token < 124 /* MAX_PREDEFINED_TYPE */ || token == 18 /* null */ || token == 17 /* undefined */;
}
exports.isPredefinedType = isPredefinedType;
/**
 * 判断指定的标记是否可作为简单字面量。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isSimpleLiteral(token) {
    return token > 16 /* MIN_SIMPLE_LITERAL */ && token < 24 /* MAX_SIMPLE_LITERAL */;
}
exports.isSimpleLiteral = isSimpleLiteral;
/**
 * 判断指定的标记是否可作为单目运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isUnaryOperator(token) {
    return token > 48 /* MIN_UNARY_OPERATOR */ && token < 73 /* MAX_UNARY_OPERATOR */;
}
exports.isUnaryOperator = isUnaryOperator;
/**
 * 判断指定的标记是否可作为双目运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isBinaryOperator(token) {
    return token > 61 /* MIN_BINARY_OPERATOR */ && token < 116 /* MAX_BINARY_OPERATOR */;
}
exports.isBinaryOperator = isBinaryOperator;
/**
 * 判断指定的标记是否可作为表达式开头。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isExpressionStart(token) {
    return token > 9 /* MIN_EXPRESSION_START */ && token < 74 /* MAX_EXPRESSION_START */ ||
        token > 113 /* MIN_IDENTIFIER_NAME_3 */ && token < 130 /* MAX_IDENTIFIER_NAME_3 */;
}
exports.isExpressionStart = isExpressionStart;
/**
 * 判断指定的标记是否可作为语句开头。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isStatementStart(token) {
    return token > 136 /* MIN_STATEMENT_START */ && token < 153 /* MAX_STATEMENT_START */;
}
exports.isStatementStart = isStatementStart;
/**
 * 判断指定的标记是否可作为修饰符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isModifier(token) {
    return token > 26 /* MIN_MODIFIER */ && token < 39 /* MAX_MODIFIER */ || token === 38 /* const */;
}
exports.isModifier = isModifier;
/**
 * 判断指定的标记是否可作为定义开头。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isDeclarationStart(token) {
    return token > 25 /* MIN_DECLARATION_START */ && token < 47 /* MAX_DECLARATION_START */;
}
exports.isDeclarationStart = isDeclarationStart;
/**
 * 判断指定的运算符是否是从右往左优先计算。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isRightHandOperator(token) {
    return token > 71 /* MIN_RIGHT_HAND_OPERATOR */ && token < 88 /* MAX_RIGHT_HAND_OPERATOR */;
}
exports.isRightHandOperator = isRightHandOperator;
/**
 * 存储所有优先级。
 */
exports.precedences = (_a = {},
    _a[110 /* comma */] = 1 /* comma */,
    _a[76 /* equals */] = 2 /* assignment */,
    _a[77 /* plusEquals */] = 2 /* assignment */,
    _a[78 /* minusEquals */] = 2 /* assignment */,
    _a[79 /* asteriskEquals */] = 2 /* assignment */,
    _a[72 /* slashEquals */] = 2 /* assignment */,
    _a[80 /* percentEquals */] = 2 /* assignment */,
    _a[81 /* lessThanLessThanEquals */] = 2 /* assignment */,
    _a[82 /* greaterThanGreaterThanEquals */] = 2 /* assignment */,
    _a[83 /* greaterThanGreaterThanGreaterThanEquals */] = 2 /* assignment */,
    _a[84 /* ampersandEquals */] = 2 /* assignment */,
    _a[85 /* barEquals */] = 2 /* assignment */,
    _a[86 /* caretEquals */] = 2 /* assignment */,
    _a[79 /* asteriskEquals */] = 2 /* assignment */,
    _a[87 /* asteriskAsteriskEquals */] = 2 /* assignment */,
    _a[109 /* question */] = 3 /* conditional */,
    _a[108 /* barBar */] = 4 /* logicalOr */,
    _a[107 /* ampersandAmpersand */] = 5 /* logicalAnd */,
    _a[105 /* bar */] = 6 /* bitwiseOr */,
    _a[106 /* caret */] = 7 /* bitwiseXOr */,
    _a[93 /* ampersand */] = 8 /* bitwiseAnd */,
    _a[98 /* equalsEquals */] = 9 /* equality */,
    _a[99 /* exclamationEquals */] = 9 /* equality */,
    _a[100 /* equalsEqualsEquals */] = 9 /* equality */,
    _a[101 /* exclamationEqualsEquals */] = 9 /* equality */,
    _a[69 /* lessThan */] = 10 /* relational */,
    _a[95 /* greaterThan */] = 10 /* relational */,
    _a[96 /* lessThanEquals */] = 10 /* relational */,
    _a[97 /* greaterThanEquals */] = 10 /* relational */,
    _a[112 /* instanceOf */] = 10 /* relational */,
    _a[111 /* in */] = 10 /* relational */,
    _a[115 /* is */] = 10 /* relational */,
    _a[114 /* as */] = 10 /* relational */,
    _a[102 /* lessThanLessThan */] = 11 /* shift */,
    _a[103 /* greaterThanGreaterThan */] = 11 /* shift */,
    _a[104 /* greaterThanGreaterThanGreaterThan */] = 11 /* shift */,
    _a[64 /* plus */] = 12 /* additive */,
    _a[65 /* minus */] = 12 /* additive */,
    _a[92 /* asterisk */] = 13 /* multiplicative */,
    _a[66 /* slash */] = 13 /* multiplicative */,
    _a[94 /* percent */] = 13 /* multiplicative */,
    _a[75 /* asteriskAsterisk */] = 14 /* exponentiation */,
    _a[67 /* plusPlus */] = 15 /* postfix */,
    _a[68 /* minusMinus */] = 15 /* postfix */,
    _a[62 /* openParen */] = 17 /* functionCall */,
    _a[63 /* openBracket */] = 18 /* member */,
    _a[89 /* dot */] = 18 /* member */,
    _a[14 /* noSubstitutionTemplateLiteral */] = 18 /* member */,
    _a[15 /* templateHead */] = 18 /* member */,
    _a
);
/**
 * 获取操作符的优先级。
 * @param token 要判断的标记。
 * @returns 返回一个数字。数字越大说明优先级越高。
 */
function getPrecedence(token) {
    return exports.precedences[token];
}
exports.getPrecedence = getPrecedence;
var _a;
//# sourceMappingURL=tokenType.js.map