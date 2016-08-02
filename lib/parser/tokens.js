/**
 * @fileOverview 标记
 * @author xuld@vip.qq.com
 * @generated 此文件标记为 @generated 的变量和函数内容使用 `tpack gen-parser` 生成。
 */
/**
 * 存储所有标记的类型名称映射。
 * @generated
 */
exports.tokenNames = [
    "<unknown>",
    "<endOfFile>",
    ")",
    "]",
    "}",
    ":",
    "<templateMiddle>",
    "<templateTail>`",
    "<noSubstitutionTemplateLiteral>",
    "<templateHead>",
    "<regularExpressionLiteral>",
    "super",
    "<identifier>",
    "<numericLiteral>",
    "<stringLiteral>",
    "true",
    "false",
    "null",
    "this",
    "undefined",
    "any",
    "number",
    "boolean",
    "string",
    "symbol",
    "never",
    "char",
    "byte",
    "int",
    "long",
    "short",
    "uint",
    "ulong",
    "ushort",
    "float",
    "double",
    "void",
    "*",
    "?",
    "async",
    "declare",
    "static",
    "abstract",
    "private",
    "protected",
    "public",
    "readonly",
    "export",
    "const",
    "function",
    "class",
    "enum",
    "namespace",
    "module",
    "interface",
    "yield",
    "await",
    "{",
    "new",
    "typeof",
    "@",
    "!",
    "delete",
    "...",
    "~",
    "+",
    "-",
    "++",
    "--",
    "(",
    "[",
    "/",
    "<",
    "=>",
    "/=",
    "**",
    "=",
    "+=",
    "-=",
    "*=",
    "%=",
    "<<=",
    ">>=",
    ">>>=",
    "&=",
    "|=",
    "^=",
    "**=",
    ".",
    "..",
    "?.",
    "&",
    "%",
    ">",
    "<=",
    ">=",
    "==",
    "!=",
    "===",
    "!==",
    "<<",
    ">>",
    ">>>",
    "|",
    "^",
    "&&",
    "||",
    ",",
    "in",
    "instanceOf",
    "as",
    "is",
    ";",
    "if",
    "switch",
    "for",
    "while",
    "do",
    "continue",
    "break",
    "return",
    "throw",
    "try",
    "debugger",
    "with",
    "var",
    "import",
    "let",
    "type",
    "from",
    "implements",
    "package",
    "of",
    "to",
    "get",
    "set",
    "else",
    "case",
    "default",
    "catch",
    "finally",
    "extends"
];
/**
 * 获取指定标记的名字。
 * @param token 要获取的标记。
 * @returns 返回标记名字。如果标记无效则返回 undefined。
 */
function getTokenName(token) {
    return exports.tokenNames[token];
}
exports.getTokenName = getTokenName;
/**
 * 获取指定名字对应的标记类型。
 * @param token 要转换的字符串。
 * @returns 返回等效的标记。如果标记无效，则返回 undefined。
 * @remark 如需要获取关键字标记类型，建议使用更高效的 {@link getKeyword}。
 */
function getTokenType(value) {
    for (var i = 0; i < exports.tokenNames.length; i++) {
        if (exports.tokenNames[i] === value) {
            return i;
        }
    }
}
exports.getTokenType = getTokenType;
/**
 * 存储所有关键字的名称类型映射。
 * @generated
 */
exports.keywords = {
    super: 11 /* super */,
    true: 15 /* true */,
    false: 16 /* false */,
    null: 17 /* null */,
    this: 18 /* this */,
    undefined: 19 /* undefined */,
    any: 20 /* any */,
    number: 21 /* number */,
    boolean: 22 /* boolean */,
    string: 23 /* string */,
    symbol: 24 /* symbol */,
    never: 25 /* never */,
    char: 26 /* char */,
    byte: 27 /* byte */,
    int: 28 /* int */,
    long: 29 /* long */,
    short: 30 /* short */,
    uint: 31 /* uint */,
    ulong: 32 /* ulong */,
    ushort: 33 /* ushort */,
    float: 34 /* float */,
    double: 35 /* double */,
    void: 36 /* void */,
    async: 39 /* async */,
    declare: 40 /* declare */,
    static: 41 /* static */,
    abstract: 42 /* abstract */,
    private: 43 /* private */,
    protected: 44 /* protected */,
    public: 45 /* public */,
    readonly: 46 /* readonly */,
    export: 47 /* export */,
    const: 48 /* const */,
    function: 49 /* function */,
    class: 50 /* class */,
    enum: 51 /* enum */,
    namespace: 52 /* namespace */,
    module: 53 /* module */,
    interface: 54 /* interface */,
    yield: 55 /* yield */,
    await: 56 /* await */,
    new: 58 /* new */,
    typeof: 59 /* typeof */,
    delete: 62 /* delete */,
    in: 108 /* in */,
    instanceOf: 109 /* instanceOf */,
    as: 110 /* as */,
    is: 111 /* is */,
    if: 113 /* if */,
    switch: 114 /* switch */,
    for: 115 /* for */,
    while: 116 /* while */,
    do: 117 /* do */,
    continue: 118 /* continue */,
    break: 119 /* break */,
    return: 120 /* return */,
    throw: 121 /* throw */,
    try: 122 /* try */,
    debugger: 123 /* debugger */,
    with: 124 /* with */,
    var: 125 /* var */,
    import: 126 /* import */,
    let: 127 /* let */,
    type: 128 /* type */,
    from: 129 /* from */,
    implements: 130 /* implements */,
    package: 131 /* package */,
    of: 132 /* of */,
    to: 133 /* to */,
    get: 134 /* get */,
    set: 135 /* set */,
    else: 136 /* else */,
    case: 137 /* case */,
    default: 138 /* default */,
    catch: 139 /* catch */,
    finally: 140 /* finally */,
    extends: 141 /* extends */
};
/**
 * 获取指定标识符对应的关键字标记。
 * @param value 要转换的字符串。
 * @returns 返回等效的标记。如果字符串不是关键字，则返回 undefined。
 */
function getKeyword(value) {
    return exports.keywords[value];
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
    return getTokenName(token) in exports.keywords;
}
exports.isKeyword = isKeyword;
/**
 * 判断指定的标记是否可作为标志名。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @remark 为了兼容历史代码，部分关键字允许被作为变量名使用。
 * @generated
 */
function isIdentifierName(token) {
    return token === 12 /* identifier */ ||
        token >= 19 /* undefined */ && token <= 35 /* double */ ||
        token >= 39 /* async */ && token <= 46 /* readonly */ ||
        token >= 52 /* namespace */ && token <= 56 /* await */ ||
        token >= 127 /* let */ && token <= 135 /* set */;
}
exports.isIdentifierName = isIdentifierName;
/**
 * 判断指定的标记是否是严格模式下的标识符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
function isReservedWord(token) {
    return token === 41 /* static */ ||
        token >= 43 /* private */ && token <= 45 /* public */ ||
        token === 54 /* interface */ || token === 55 /* yield */ ||
        token === 127 /* let */ ||
        token === 130 /* implements */ || token === 131 /* package */;
}
exports.isReservedWord = isReservedWord;
/**
 * 判断指定的标记是否可作为绑定名称开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isBindingNameStart(token) {
    return isIdentifierName(token) ||
        token === 70 /* openBracket */ ||
        token === 57 /* openBrace */;
}
exports.isBindingNameStart = isBindingNameStart;
/**
 * 判断指定的标记是否可作为数组绑定元素开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isArrayBindingElementStart(token) {
    return isBindingNameStart(token) || token === 63 /* dotDotDot */;
}
exports.isArrayBindingElementStart = isArrayBindingElementStart;
/**
 * 判断指定的标记是否可作为属性名开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isPropertyNameStart(token) {
    return isKeyword(token) ||
        token === 13 /* numericLiteral */ ||
        token === 14 /* stringLiteral */ ||
        token === 70 /* openBracket */;
}
exports.isPropertyNameStart = isPropertyNameStart;
/**
 * 判断指定的标记是否可作为类型节点开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isTypeNodeStart(token) {
    return token >= 12 /* identifier */ && token <= 46 /* readonly */ ||
        token >= 52 /* namespace */ && token <= 59 /* typeof */ ||
        token === 69 /* openParen */ || token === 70 /* openBracket */ ||
        token === 72 /* lessThan */ ||
        token >= 127 /* let */ && token <= 135 /* set */;
}
exports.isTypeNodeStart = isTypeNodeStart;
/**
 * 判断指定的标记是否可作为内置类型。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
function isPredefinedType(token) {
    return token >= 17 /* null */ && token <= 38 /* question */;
}
exports.isPredefinedType = isPredefinedType;
/**
 * 判断指定的标记是否可作为表达式开头。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
function isExpressionStart(token) {
    return token >= 8 /* noSubstitutionTemplateLiteral */ && token <= 36 /* void */ ||
        token >= 39 /* async */ && token <= 46 /* readonly */ ||
        token >= 49 /* function */ && token <= 74 /* slashEquals */ ||
        token >= 127 /* let */ && token <= 135 /* set */;
}
exports.isExpressionStart = isExpressionStart;
/**
 * 判断指定的标记是否可作为简单字面量。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
function isSimpleLiteral(token) {
    return token === 11 /* super */ ||
        token >= 15 /* true */ && token <= 19 /* undefined */;
}
exports.isSimpleLiteral = isSimpleLiteral;
/**
 * 判断指定的标记是否可作为单目运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
function isUnaryOperator(token) {
    return token === 36 /* void */ ||
        token >= 59 /* typeof */ && token <= 68 /* minusMinus */;
}
exports.isUnaryOperator = isUnaryOperator;
/**
 * 判断指定的标记是否是双目表达式合法的运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isBinaryOperator(token) {
    if (token === 38 /* question */) {
        return false;
    }
    var precedence = getPrecedence(token);
    return precedence > 0 /* any */ && precedence < 15 /* postfix */;
}
exports.isBinaryOperator = isBinaryOperator;
/**
 * 存储所有优先级。
 * @generated
 */
exports.precedences = {
    8 /*TokenType.noSubstitutionTemplateLiteral*/: 18 /* member */,
    9 /*TokenType.templateHead*/: 18 /* member */,
    37 /*TokenType.asterisk*/: 13 /* multiplicative */,
    38 /*TokenType.question*/: 3 /* conditional */,
    65 /*TokenType.plus*/: 12 /* additive */,
    66 /*TokenType.minus*/: 12 /* additive */,
    67 /*TokenType.plusPlus*/: 15 /* postfix */,
    68 /*TokenType.minusMinus*/: 15 /* postfix */,
    69 /*TokenType.openParen*/: 17 /* functionCall */,
    70 /*TokenType.openBracket*/: 18 /* member */,
    71 /*TokenType.slash*/: 13 /* multiplicative */,
    72 /*TokenType.lessThan*/: 10 /* relational */,
    75 /*TokenType.asteriskAsterisk*/: 14 /* exponentiation */,
    76 /*TokenType.equals*/: 2 /* assignment */,
    77 /*TokenType.plusEquals*/: 2 /* assignment */,
    78 /*TokenType.minusEquals*/: 2 /* assignment */,
    79 /*TokenType.asteriskEquals*/: 2 /* assignment */,
    80 /*TokenType.percentEquals*/: 2 /* assignment */,
    81 /*TokenType.lessThanLessThanEquals*/: 2 /* assignment */,
    82 /*TokenType.greaterThanGreaterThanEquals*/: 2 /* assignment */,
    83 /*TokenType.greaterThanGreaterThanGreaterThanEquals*/: 2 /* assignment */,
    84 /*TokenType.ampersandEquals*/: 2 /* assignment */,
    85 /*TokenType.barEquals*/: 2 /* assignment */,
    86 /*TokenType.caretEquals*/: 2 /* assignment */,
    87 /*TokenType.asteriskAsteriskEquals*/: 2 /* assignment */,
    88 /*TokenType.dot*/: 18 /* member */,
    89 /*TokenType.dotDot*/: 18 /* member */,
    90 /*TokenType.questionDot*/: 18 /* member */,
    91 /*TokenType.ampersand*/: 8 /* bitwiseAnd */,
    92 /*TokenType.percent*/: 13 /* multiplicative */,
    93 /*TokenType.greaterThan*/: 10 /* relational */,
    94 /*TokenType.lessThanEquals*/: 10 /* relational */,
    95 /*TokenType.greaterThanEquals*/: 10 /* relational */,
    96 /*TokenType.equalsEquals*/: 9 /* equality */,
    97 /*TokenType.exclamationEquals*/: 9 /* equality */,
    98 /*TokenType.equalsEqualsEquals*/: 9 /* equality */,
    99 /*TokenType.exclamationEqualsEquals*/: 9 /* equality */,
    100 /*TokenType.lessThanLessThan*/: 11 /* shift */,
    101 /*TokenType.greaterThanGreaterThan*/: 11 /* shift */,
    102 /*TokenType.greaterThanGreaterThanGreaterThan*/: 11 /* shift */,
    103 /*TokenType.bar*/: 6 /* bitwiseOr */,
    104 /*TokenType.caret*/: 7 /* bitwiseXOr */,
    105 /*TokenType.ampersandAmpersand*/: 5 /* logicalAnd */,
    106 /*TokenType.barBar*/: 4 /* logicalOr */,
    107 /*TokenType.comma*/: 1 /* comma */,
    108 /*TokenType.in*/: 10 /* relational */,
    109 /*TokenType.instanceOf*/: 10 /* relational */,
    110 /*TokenType.as*/: 10 /* relational */,
    111 /*TokenType.is*/: 10 /* relational */
};
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
 * 判断指定的运算符是否是从右往左优先计算。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
function isRightHandOperator(token) {
    return token >= 74 /* slashEquals */ && token <= 87 /* asteriskAsteriskEquals */;
}
exports.isRightHandOperator = isRightHandOperator;
/**
 * 判断指定的标记是否可作为参数开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isArgumentStart(token) {
    return isExpressionStart(token) || token === 63 /* dotDotDot */;
}
exports.isArgumentStart = isArgumentStart;
/**
 * 判断指定的标记是否可作为语句开头。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
function isStatementStart(token) {
    return token >= 112 /* semicolon */ && token <= 128 /* type */;
}
exports.isStatementStart = isStatementStart;
/**
 * 判断指定的标记是否可作为 case 标签开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isCaseLabelStart(token) {
    return isExpressionStart(token) || token === 136 /* else */;
}
exports.isCaseLabelStart = isCaseLabelStart;
/**
 * 判断指定的标记是否可作为定义开头。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
function isDeclarationStart(token) {
    return token >= 39 /* async */ && token <= 54 /* interface */ ||
        token === 60 /* at */ ||
        token === 141 /* extends */;
}
exports.isDeclarationStart = isDeclarationStart;
/**
 * 判断指定的标记是否可作为修饰符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
function isModifier(token) {
    return token >= 39 /* async */ && token <= 48 /* const */;
}
exports.isModifier = isModifier;
/**
 * 判断指定的标记是否可作为参数开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isParameterStart(token) {
    return isModifier(token) || isBindingNameStart(token) || token === 63 /* dotDotDot */;
}
exports.isParameterStart = isParameterStart;
//# sourceMappingURL=tokens.js.map