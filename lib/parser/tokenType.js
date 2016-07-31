/**
 * @fileOverview 标记类型
 * @author xuld@vip.qq.com
 * @generated 此文件标记为 Generated 的区域使用 `tpack gen-tokenType` 生成。
 */
/**
 * @gernerated 此常量的值使用 `tpack gen-tokenType` 生成。
 */
var tokenNames = [];
/**
 * 获取指定标记的名字。
 * @param token 要获取的标记。
 * @returns 返回标记名字。如果标记无效则返回 undefined。
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
    return value in keywords;
}
exports.isKeyword = isKeyword;
/**
 * 存储所有优先级。
 */
exports.precedences = (_a = {},
    // #region Generated: Precedences
    _a[109 /* comma */] = 1 /* comma */,
    _a[75 /* equals */] = 2 /* assignment */,
    _a[76 /* plusEquals */] = 2 /* assignment */,
    _a[77 /* minusEquals */] = 2 /* assignment */,
    _a[78 /* asteriskEquals */] = 2 /* assignment */,
    _a[71 /* slashEquals */] = 2 /* assignment */,
    _a[79 /* percentEquals */] = 2 /* assignment */,
    _a[80 /* lessThanLessThanEquals */] = 2 /* assignment */,
    _a[81 /* greaterThanGreaterThanEquals */] = 2 /* assignment */,
    _a[82 /* greaterThanGreaterThanGreaterThanEquals */] = 2 /* assignment */,
    _a[83 /* ampersandEquals */] = 2 /* assignment */,
    _a[84 /* barEquals */] = 2 /* assignment */,
    _a[85 /* caretEquals */] = 2 /* assignment */,
    _a[78 /* asteriskEquals */] = 2 /* assignment */,
    _a[86 /* asteriskAsteriskEquals */] = 2 /* assignment */,
    _a[108 /* question */] = 3 /* conditional */,
    _a[107 /* barBar */] = 4 /* logicalOr */,
    _a[106 /* ampersandAmpersand */] = 5 /* logicalAnd */,
    _a[104 /* bar */] = 6 /* bitwiseOr */,
    _a[105 /* caret */] = 7 /* bitwiseXOr */,
    _a[92 /* ampersand */] = 8 /* bitwiseAnd */,
    _a[97 /* equalsEquals */] = 9 /* equality */,
    _a[98 /* exclamationEquals */] = 9 /* equality */,
    _a[99 /* equalsEqualsEquals */] = 9 /* equality */,
    _a[100 /* exclamationEqualsEquals */] = 9 /* equality */,
    _a[68 /* lessThan */] = 10 /* relational */,
    _a[94 /* greaterThan */] = 10 /* relational */,
    _a[95 /* lessThanEquals */] = 10 /* relational */,
    _a[96 /* greaterThanEquals */] = 10 /* relational */,
    _a[111 /* instanceOf */] = 10 /* relational */,
    _a[110 /* in */] = 10 /* relational */,
    _a[114 /* is */] = 10 /* relational */,
    _a[113 /* as */] = 10 /* relational */,
    _a[101 /* lessThanLessThan */] = 11 /* shift */,
    _a[102 /* greaterThanGreaterThan */] = 11 /* shift */,
    _a[103 /* greaterThanGreaterThanGreaterThan */] = 11 /* shift */,
    _a[63 /* plus */] = 12 /* additive */,
    _a[64 /* minus */] = 12 /* additive */,
    _a[91 /* asterisk */] = 13 /* multiplicative */,
    _a[65 /* slash */] = 13 /* multiplicative */,
    _a[93 /* percent */] = 13 /* multiplicative */,
    _a[74 /* asteriskAsterisk */] = 14 /* exponentiation */,
    _a[66 /* plusPlus */] = 15 /* postfix */,
    _a[67 /* minusMinus */] = 15 /* postfix */,
    _a[61 /* openParen */] = 17 /* functionCall */,
    _a[62 /* openBracket */] = 18 /* member */,
    _a[88 /* dot */] = 18 /* member */,
    _a[14 /* noSubstitutionTemplateLiteral */] = 18 /* member */,
    _a[15 /* templateHead */] = 18 /* member */,
    _a
);
/**
 * 获取操作符的优先级。
 * @param token 要判断的标记。
 * @returns 返回一个数字。数字越大说明优先级越高。如果标记无效则返回 undefined。
 */
function getPrecedence(token) {
    return exports.precedences[token];
}
exports.getPrecedence = getPrecedence;
/**
 * 判断指定的标记是否是双目表达式合法的运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isBinaryOperator(token) {
    var precedence = getPrecedence(token);
    return precedence > 0 /* any */ && precedence < 15 /* postfix */;
}
exports.isBinaryOperator = isBinaryOperator;
// #region Generated: checkToken
/**
 * 判断指定的标记是否可作为标志名。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @remark 为了兼容历史代码，部分关键字允许被作为变量名使用。
 */
function isIdentifierName(token) {
    return token === 10 /* identifier */ ||
        token > 22 /* MIN_IDENTIFIER_NAME_1 */ && token < 35 /* MAX_IDENTIFIER_NAME_1 */ ||
        token > 42 /* MIN_IDENTIFIER_NAME_2 */ && token < 50 /* MAX_IDENTIFIER_NAME_2 */ ||
        token > 112 /* MIN_IDENTIFIER_NAME_3 */ && token < 139 /* MAX_IDENTIFIER_NAME_3 */;
}
exports.isIdentifierName = isIdentifierName;
/**
 * 判断指定的标记是否是严格模式下的标识符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isReservedWord(token) {
    return token === 40 /* class */ ||
        token === 41 /* enum */ ||
        token === 145 /* extends */ ||
        token === 23 /* super */ ||
        token === 37 /* const */ ||
        token === 36 /* export */ ||
        token === 161 /* import */;
}
exports.isReservedWord = isReservedWord;
/**
 * 判断指定的标记是否可作为内置类型。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isPredefinedType(token) {
    return token > 116 /* MIN_PREDEFINED_TYPE */ && token < 133 /* MAX_PREDEFINED_TYPE */ || token === 18 /* null */ || token === 17 /* undefined */ || token === 91 /* asterisk */ || token === 108 /* question */;
}
exports.isPredefinedType = isPredefinedType;
/**
 * 判断指定的标记是否可作为类型节点开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isTypeNodeStart(token) {
    return isIdentifierName(token) ||
        token === 61 /* openParen */ ||
        token === 62 /* openBracket */ ||
        token === 51 /* openBrace */ ||
        token === 53 /* new */ ||
        token === 68 /* lessThan */ ||
        token === 55 /* typeof */ ||
        token === 11 /* numericLiteral */ ||
        token === 12 /* stringLiteral */ ||
        token === 19 /* true */ ||
        token === 20 /* false */;
}
exports.isTypeNodeStart = isTypeNodeStart;
/**
 * 判断指定的标记是否可作为数组绑定元素开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isArrayBindingElementStart(token) {
    return isBindingNameStart(token) || token === 57 /* dotDotDot */;
}
exports.isArrayBindingElementStart = isArrayBindingElementStart;
/**
 * 判断指定的标记是否是绑定名称开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isBindingNameStart(token) {
    return isIdentifierName(token) ||
        token === 62 /* openBracket */ ||
        token === 51 /* openBrace */;
}
exports.isBindingNameStart = isBindingNameStart;
/**
 * 判断指定的标记是否可作为对象绑定元素开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isObjectBindingElementStart(token) {
    return isPropertyNameStart(token) || token === 57 /* dotDotDot */;
}
exports.isObjectBindingElementStart = isObjectBindingElementStart;
/**
 * 判断指定的标记是否可作为属性名开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isPropertyNameStart(token) {
    return isKeyword(token) ||
        token === 11 /* numericLiteral */ ||
        token === 12 /* stringLiteral */ ||
        token === 62 /* openBracket */;
}
exports.isPropertyNameStart = isPropertyNameStart;
/**
 * 判断指定的标记是否可作为参数开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isArgumentStart(token) {
    return isExpressionStart(token) || token === 57 /* dotDotDot */;
}
exports.isArgumentStart = isArgumentStart;
/**
 * 判断指定的标记是否可作为参数开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isCaseLabelStart(token) {
    return isExpressionStart(token) || token === 140 /* else */;
}
exports.isCaseLabelStart = isCaseLabelStart;
/**
 * 判断指定的标记是否可作为单目运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isUnaryOperator(token) {
    return token > 47 /* MIN_UNARY_OPERATOR */ && token < 72 /* MAX_UNARY_OPERATOR */;
}
exports.isUnaryOperator = isUnaryOperator;
/**
 * 判断指定的标记是否可作为表达式开头。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isExpressionStart(token) {
    return token > 9 /* MIN_EXPRESSION_START */ && token < 73 /* MAX_EXPRESSION_START */ ||
        token > 112 /* MIN_IDENTIFIER_NAME_3 */ && token < 139 /* MAX_IDENTIFIER_NAME_3 */;
}
exports.isExpressionStart = isExpressionStart;
/**
 * 判断指定的标记是否可作为语句开头。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isStatementStart(token) {
    return token > 146 /* MIN_STATEMENT_START */ && token < 163 /* MAX_STATEMENT_START */;
}
exports.isStatementStart = isStatementStart;
/**
 * 判断指定的标记是否可作为修饰符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isModifier(token) {
    return token > 26 /* MIN_MODIFIER */ && token < 38 /* MAX_MODIFIER */ || token === 37 /* const */;
}
exports.isModifier = isModifier;
/**
 * 判断指定的标记是否可作为定义开头。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isDeclarationStart(token) {
    return token > 25 /* MIN_DECLARATION_START */ && token < 46 /* MAX_DECLARATION_START */;
}
exports.isDeclarationStart = isDeclarationStart;
/**
 * 判断指定的运算符是否是从右往左优先计算。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isRightHandOperator(token) {
    return token > 70 /* MIN_RIGHT_HAND_OPERATOR */ && token < 87 /* MAX_RIGHT_HAND_OPERATOR */;
}
exports.isRightHandOperator = isRightHandOperator;
var _a;
// #endregion Generated: checkToken
//# sourceMappingURL=tokenType.js.map