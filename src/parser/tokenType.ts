/**
 * @fileOverview 标记
 * @author xuld@vip.qq.com
 * @stable
 */

import {CharCode} from './unicode';

/**
 * 表示一个标记类型。
 */
export const enum TokenType {

    // #region 控制符(Control)

    /**
     * 未知标记。
     */
    unknown,

    /**
     * 文件已结束(EOF)。
     */
    endOfFile,

    // #endregion

    // #region 其它运算符(Other Operators)

    /**
     * 闭括号())。
     */
    closeParen,

    /**
     * 闭方括号(])。
     */
    closeBracket,

    /**
     * 闭花括号(})。
     */
    closeBrace,

    /**
     * 冒号(:)。
     */
    colon,

    /**
     * 分号(;)。
     */
    semicolon,

    /**
     * 模板字符串主体(}...${)(JavaScript 5 新增)。
     */
    templateMiddle,

    /**
     * 模板字符串尾(}...`)(JavaScript 5 新增)。
     */
    templateTail,

    // #endregion

    // #region 字面量(Literal)

    /**
     * 最小的表达式开头。
     */
    MIN_EXPRESSION_START,

    /**
     * 标识符(x)。
     */
    identifier,

    /**
     * 数字字面量(0x0)。
     */
    numericLiteral,

    /**
     * 字符串字面量('...')。
     */
    stringLiteral,

    /**
     * 正则表达式字面量(/.../)。
     */
    regularExpressionLiteral,

    /**
     * 简单模板字符串字面量(`...`)(JavaScript 5 新增)。
     */
    noSubstitutionTemplateLiteral,

    /**
     * 模板字符串头(`...${)(JavaScript 5 新增)。
     */
    templateHead,

    /**
     * 最小的简单字面量。
     */
    MIN_SIMPLE_LITERAL,

    /**
     * 关键字 undefined。
     */
    undefined,

    /**
     * 关键字 null。
     */
    null,

    /**
     * 关键字 true。
     */
    true,

    /**
     * 关键字 false。
     */
    false,

    /**
     * 关键字 this。
     */
    this,

    /**
     * 最小的标识符 1。
     */
    MIN_IDENTIFIER_NAME_1,

    /**
     * 关键字 super(JavaScript 3 保留字、JavaScript 5 新增)。
     */
    super,

    /**
     * 最大的简单字面量。
     */
    MAX_SIMPLE_LITERAL,

    // #endregion

    // #region 修饰符(Modifiers)

    /**
     * 最小的定义开头。
     */
    MIN_DECLARATION_START,

    /**
     * 最小的修饰符前缀。
     */
    MIN_MODIFIER,

    /**
     * 关键字 async(JavaScript 3 保留字、JavaScript 5 新增)。
     */
    async,

    /**
     * 关键字 declare(TypeScript 1 新增)。
     */
    declare,

    /**
     * 关键字 static(JavaScript 3 保留字、JavaScript 5 严格模式保留字)。。
     */
    static,

    /**
     * 关键字 abstract(JavaScript 3 保留字、TypeScript 1 新增)。
     */
    abstract,

    /**
     * 关键字 private(JavaScript 3 保留字、TypeScript 1 新增)。
     */
    private,

    /**
     * 关键字 protected(JavaScript 3 保留字、TypeScript 1 新增)。
     */
    protected,

    /**
     * 关键字 public(JavaScript 3 保留字、TypeScript 1 新增)。
     */
    public,

    /**
     * 关键字 readonly(TypeScript 2 新增)。
     */
    readonly,

    /**
     * 最大的标识符 1。
     */
    MAX_IDENTIFIER_NAME_1,

    /**
     * 关键字 export(JavaScript 3 保留字、JavaScript 5 新增)。
     */
    export,

    /**
     * 关键字 const(JavaScript 5 新增)。
     */
    const,

    /**
     * 最大的修饰符前缀。
     */
    MAX_MODIFIER,

    // #endregion

    // #region 声明(Declarations)

    /**
     * 关键字 function。
     */
    function,

    /**
     * 关键字 class(JavaScript 3 保留字、JavaScript 5 新增)。
     */
    class,

    /**
     * 关键字 enum(JavaScript 3 保留字、JavaScript 5 严格模式保留字、TypeScript 1 新增)。
     */
    enum,

    /**
     * 最小的标识符 2。
     */
    MIN_IDENTIFIER_NAME_2,

    /**
     * 关键字 namespace(TypeScript 新增)。
     */
    namespace,

    /**
     * 关键字 module(TypeScript 新增)。
     */
    module,

    /**
     * 关键字 interface(JavaScript 3 保留字、JavaScript 5 严格模式保留字、TypeScript 1 新增)。
     */
    interface,

    /**
     * 最大的定义开头。
     */
    MAX_DECLARATION_START,

    // #endregion

    // #region 单目运算符(Unary Operators)

    /**
     * 最小的单目运算符。
     */
    MIN_UNARY_OPERATOR,

    /**
     * 关键字 yield(JavaScript 5 新增)。
     */
    yield,

    /**
     * 关键字 await(JavaScript 7 新增)。
     */
    await,

    /**
     * 最大的标识符 2。
     */
    MAX_IDENTIFIER_NAME_2,

    /**
     * 开花括号({)。
     */
    openBrace,

    /**
     * 非(!)。
     */
    exclamation,

    /**
     * 关键字 new。
     */
    new,

    /**
     * 关键字 delete。
     */
    delete,

    /**
     * 关键字 typeof。
     */
    typeof,

    /**
     * 关键字 void。
     */
    void,

    /**
     * 点点点(...)(JavaScript 5 新增)。
     */
    dotDotDot,

    /**
     * 电子邮件符号(@)(TypeScript 1 新增)。
     */
    at,

    /**
     * 位反(~)。
     */
    tilde,

    // #endregion

    // #region 单/双目运算符(Unary & Binary Operators)

    /**
     * 最小的双目运算符。
     */
    MIN_BINARY_OPERATOR,

    /**
     * 开括号(()。
     */
    openParen,

    /**
     * 开方括号([)。
     */
    openBracket,

    /**
     * 加(+)。
     */
    plus,

    /**
     * 减(-)。
     */
    minus,

    /**
     * 斜杠(/)。
     */
    slash,

    /**
     * 加加(++)。
     */
    plusPlus,

    /**
     * 减减(--)。
     */
    minusMinus,

    /**
     * 小于(<)。
     */
    lessThan,

    /**
     * 箭头(=>)(JavaScript 5 新增)。
     */
    equalsGreaterThan,

    /**
     * 最小的右值运算符。
     */
    MIN_RIGHT_HAND_OPERATOR,

    /**
     * 斜杠等于(/=)。
     */
    slashEquals,

    /**
     * 最大的单目运算符。
     */
    MAX_UNARY_OPERATOR,

    /**
     * 最大的表达式开头。
     */
    MAX_EXPRESSION_START,

    // #endregion

    // #region 双目运算符(Binary Operators)

    /**
     * 星号星号(**)(TypeScript 1 新增)。
     */
    asteriskAsterisk,

    /**
     * 等于(=)。
     */
    equals,

    /**
     * 加等于(+=)。
     */
    plusEquals,

    /**
     * 减等于(-=)。
     */
    minusEquals,

    /**
     * 星号等于(*=)。
     */
    asteriskEquals,

    /**
     * 百分号等于(%=)。
     */
    percentEquals,

    /**
     * 左移等于(<<=)。
     */
    lessThanLessThanEquals,

    /**
     * 右移等于(>>=)。
     */
    greaterThanGreaterThanEquals,

    /**
     * 无符右移等于(>>>=)。
     */
    greaterThanGreaterThanGreaterThanEquals,

    /**
     * 位与等于(&=)。
     */
    ampersandEquals,

    /**
     * 位或等于(|=)。
     */
    barEquals,

    /**
     * 异或等于(^=)。
     */
    caretEquals,

    /**
     * 星号星号等于(**=)(TypeScript 1 新增)。
     */
    asteriskAsteriskEquals,

    /**
     * 最大的右值运算符。
     */
    MAX_RIGHT_HAND_OPERATOR,

    /**
     * 点(.)。
     */
    dot,

    /**
     * 点点(..)(TealScript 新增)。
     */
    dotDot,

    /**
     * 问号点(?.)(TealScript 新增)。
     */
    questionDot,

    /**
     * 星号(*)。
     */
    asterisk,

    /**
     * 位与(&)。
     */
    ampersand,

    /**
     * 百分号(%)。
     */
    percent,

    /**
     * 大于(>)。
     */
    greaterThan,

    /**
     * 小于等于(<=)。
     */
    lessThanEquals,

    /**
     * 大于等于(>=)。
     */
    greaterThanEquals,

    /**
     * 等于等于(==)。
     */
    equalsEquals,

    /**
     * 不等于(!=)。
     */
    exclamationEquals,

    /**
     * 等于等于等于(===)。
     */
    equalsEqualsEquals,

    /**
     * 不等于等于(!==)。
     */
    exclamationEqualsEquals,

    /**
     * 左移(<<)。
     */
    lessThanLessThan,

    /**
     * 右移(>>)。
     */
    greaterThanGreaterThan,

    /**
     * 无符右移(>>>)。
     */
    greaterThanGreaterThanGreaterThan,

    /**
     * 位或(|)。
     */
    bar,

    /**
     * 异或(^)。
     */
    caret,

    /**
     * 与(&&)。
     */
    ampersandAmpersand,

    /**
     * 或(||)。
     */
    barBar,

    /**
     * 问号(?)。
     */
    question,

    /**
     * 逗号(,)。
     */
    comma,

    /**
     * 关键字 in。
     */
    in,

    /**
     * 关键字 instanceOf。
     */
    instanceOf,

    /**
     * 最小的标识符 3。
     */
    MIN_IDENTIFIER_NAME_3,

    /**
     * 关键字 as(TypeScript 新增)。
     */
    as,

    /**
     * 关键字 is(TypeScript 新增)。
     */
    is,

    /**
     * 最大的双目运算符。
     */
    MAX_BINARY_OPERATOR,

    // #endregion

    // #region 内置类型(Predefined Types)

    /**
     * 最小的内置类型。
     */
    MIN_PREDEFINED_TYPE,

    /**
     * 关键字 any(TypeScript 1 新增)。
     */
    any,

    /**
     * 关键字 boolean(TypeScript 1 新增)。
     */
    boolean,

    /**
     * 关键字 number(TypeScript 1 新增)。
     */
    number,

    /**
     * 关键字 string(TypeScript 1 新增)。
     */
    string,

    /**
     * 关键字 symbol(TypeScript 1 新增)。
     */
    symbol,

    /**
     * 关键字 never(TypeScript 2 新增)。
     */
    never,

    /**
     * 关键字 char(TealScript 1 新增)。
     */
    char,

    /**
     * 关键字 byte(TealScript 1 新增)。
     */
    byte,

    /**
     * 关键字 int(TealScript 1 新增)。
     */
    int,

    /**
     * 关键字 long(TealScript 1 新增)。
     */
    long,

    /**
     * 关键字 short(TealScript 1 新增)。
     */
    short,

    /**
     * 关键字 uint(TealScript 1 新增)。
     */
    uint,

    /**
     * 关键字 ulong(TealScript 1 新增)。
     */
    ulong,

    /**
     * 关键字 ushort(TealScript 1 新增)。
     */
    ushort,

    /**
     * 关键字 float(TealScript 1 新增)。
     */
    float,

    /**
     * 关键字 double(TealScript 1 新增)。
     */
    double,

    /**
     * 最大的内置类型。
     */
    MAX_PREDEFINED_TYPE,

    /**
     * 最大的合法标签。
     */
    MAX_TOKEN,

    // #endregion

    // #region 其它语句(Other Statements)

    /**
     * 关键字 from(仅在 JavaScript 7)。
     */
    from,

    /**
     * 关键字 implements(JavaScript 3 保留字、JavaScript 3 严格模式保留字、TypeScript 新增)。
     */
    implements,

    /**
     * 关键字 of(JavaScript 5 新增)。
     */
    of,

    /**
     * 关键字 to(TealScript 1 新增)。
     */
    to,

    /**
     * 最大的标识符 3。
     */
    MAX_IDENTIFIER_NAME_3,

    /**
     * 关键字 else。
     */
    else,

    /**
     * 关键字 case。
     */
    case,

    /**
     * 关键字 default。
     */
    default,

    /**
     * 关键字 catch。
     */
    catch,

    /**
     * 关键字 finally。
     */
    finally,

    /**
     * 关键字 extends(JavaScript 3 保留字、JavaScript 5 新增)。
     */
    extends,

    // #endregion

    // #region 语句头(Statement Headers)

    /**
     * 最小的语句开头。
     */
    MIN_STATEMENT_START,

    /**
     * 关键字 if。
     */
    if,

    /**
     * 关键字 switch。
     */
    switch,

    /**
     * 关键字 for。
     */
    for,

    /**
     * 关键字 while。
     */
    while,

    /**
     * 关键字 do。
     */
    do,

    /**
     * 关键字 continue。
     */
    continue,

    /**
     * 关键字 break。
     */
    break,

    /**
     * 关键字 return。
     */
    return,

    /**
     * 关键字 throw。
     */
    throw,

    /**
     * 关键字 try。
     */
    try,

    /**
     * 关键字 debugger。
     */
    debugger,

    /**
     * 关键字 with。
     */
    with,

    /**
     * 关键字 var。
     */
    var,

    /**
     * 关键字 let(JavaScript 5 新增)。
     */
    let,

    /**
     * 关键字 import(JavaScript 5 保留字、TypeScript 1 新增)。
     */
    import,

    /**
     * 关键字 type(TypeScript 新增)。
     */
    type,

    /**
     * 最大的语句开头。
     */
    MAX_STATEMENT_START,

    // #endregion

}

/**
 * @gernerated 此常量的值使用 `tpack gen-tokenType` 生成。
 */
const tokenNames = [];

/**
 * 获取指定标记的名字。
 * @param token 要获取的标记。
 * @returns 返回标记名字。如果标记无效，则返回 undefined。
 */
export function getTokenName(token: TokenType) {
    return tokenNames[token];
}

/**
 * 获取指定名字对应的标记类型。
 * @param token 要转换的字符串。
 * @returns 返回等效的标记。如果标记无效，则返回 undefined。
 * @remark 如需要获取关键字标记类型，建议使用更高效的 {@link getKeyword}。
 */
export function getTokenType(value: string) {
    for (let i = 0; i < tokenNames.length; i++) {
        if (tokenNames[i] === value) {
            return <TokenType>i;
        }
    }
}

/**
 * @gernerated 此常量的值使用 `tpack gen-tokenType` 生成。
 */
const keywords: { [key: string]: TokenType } = {};

/**
 * 获取指定标识符对应的关键字标记。
 * @param value 要转换的字符串。
 * @returns 返回等效的标记。如果字符串不是关键字，则返回 undefined。
 */
export function getKeyword(value: string) {
    return keywords[value];
}

/**
 * 判断指定的标记是否是关键字。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @remark
 * 关键字是指在语言中有特定意义的名称。
 * 关键字可作为属性名使用，
 * 但不能作为变量名使用(部分除外)。
 */
export function isKeyword(token: TokenType) {
    const ch = (tokenNames[token] || "").charCodeAt(0);
    return ch >= CharCode.a && ch <= CharCode.z;
}

/**
 * 判断指定的标记是否可作为标志名。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @remark 为了兼容历史代码，部分关键字允许被作为变量名使用。
 */
export function isIdentifierName(token: TokenType) {
    return token === TokenType.identifier ||
        token > TokenType.MIN_IDENTIFIER_NAME_1 && token < TokenType.MAX_IDENTIFIER_NAME_1 ||
        token > TokenType.MIN_IDENTIFIER_NAME_2 && token < TokenType.MAX_IDENTIFIER_NAME_2 ||
        token > TokenType.MIN_IDENTIFIER_NAME_3 && token < TokenType.MAX_IDENTIFIER_NAME_3;
}

/**
 * 判断指定的标记是否是严格模式下的标识符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isReservedWord(token: TokenType) {
    return token === TokenType.class ||
        token === TokenType.enum ||
        token === TokenType.extends ||
        token === TokenType.super ||
        token === TokenType.const ||
        token === TokenType.export ||
        token === TokenType.import;
}

/**
 * 判断指定的标记是否可作为内置类型。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isPredefinedType(token: TokenType) {
    return token > TokenType.MIN_PREDEFINED_TYPE && token < TokenType.MAX_PREDEFINED_TYPE || token === TokenType.null || token === TokenType.undefined || token === TokenType.asterisk || token === TokenType.question;
}

/**
 * 判断指定的标记是否可作为类型节点开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isTypeNodeStart(token: TokenType) {
    return isIdentifierName(token) ||
        token === TokenType.openParen ||
        token === TokenType.openBracket ||
        token === TokenType.openBrace ||
        token === TokenType.new ||
        token === TokenType.lessThan ||
        token === TokenType.typeof ||
        token === TokenType.numericLiteral ||
        token === TokenType.stringLiteral ||
        token === TokenType.true ||
        token === TokenType.false;
}

/**
 * 判断指定的标记是否可作为数组绑定元素开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isArrayBindingElementStart(token: TokenType) {
    return isBindingNameStart(token) || token === TokenType.dotDotDot;
}

/**
 * 判断指定的标记是否是绑定名称开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isBindingNameStart(token: TokenType) {
    return isIdentifierName(token) ||
        token === TokenType.openBracket ||
        token === TokenType.openBrace;
}

/**
 * 判断指定的标记是否可作为对象绑定元素开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isObjectBindingElementStart(token: TokenType) {
    return isPropertyNameStart(token) || token === TokenType.dotDotDot;
}

/**
 * 判断指定的标记是否可作为属性名开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isPropertyNameStart(token: TokenType) {
    return isKeyword(token) ||
        token === TokenType.numericLiteral ||
        token === TokenType.stringLiteral ||
        token === TokenType.openBracket;
}

/**
 * 判断指定的标记是否可作为参数开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isArgumentStart(token: TokenType) {
    return isExpressionStart(token) || token === TokenType.dotDotDot;
}

/**
 * 判断指定的标记是否可作为参数开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isCaseLabelStart(token: TokenType) {
    return isExpressionStart(token) || token === TokenType.else;
}

/**
 * 判断指定的标记是否可作为简单字面量。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isSimpleLiteral(token: TokenType) {
    return token > TokenType.MIN_SIMPLE_LITERAL && token < TokenType.MAX_SIMPLE_LITERAL;
}

/**
 * 判断指定的标记是否可作为单目运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isUnaryOperator(token: TokenType) {
    return token > TokenType.MIN_UNARY_OPERATOR && token < TokenType.MAX_UNARY_OPERATOR;
}

/**
 * 判断指定的标记是否可作为双目运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isBinaryOperator(token: TokenType) {
    return token > TokenType.MIN_BINARY_OPERATOR && token < TokenType.MAX_BINARY_OPERATOR;
}

/**
 * 判断指定的标记是否可作为表达式开头。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isExpressionStart(token: TokenType) {
    return token > TokenType.MIN_EXPRESSION_START && token < TokenType.MAX_EXPRESSION_START ||
        token > TokenType.MIN_IDENTIFIER_NAME_3 && token < TokenType.MAX_IDENTIFIER_NAME_3;
}

/**
 * 判断指定的标记是否可作为语句开头。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isStatementStart(token: TokenType) {
    return token > TokenType.MIN_STATEMENT_START && token < TokenType.MAX_STATEMENT_START;
}

/**
 * 判断指定的标记是否可作为修饰符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isModifier(token: TokenType) {
    return token > TokenType.MIN_MODIFIER && token < TokenType.MAX_MODIFIER || token === TokenType.const;
}

/**
 * 判断指定的标记是否可作为定义开头。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isDeclarationStart(token: TokenType) {
    return token > TokenType.MIN_DECLARATION_START && token < TokenType.MAX_DECLARATION_START;
}

/**
 * 判断指定的运算符是否是从右往左优先计算。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isRightHandOperator(token: TokenType) {
    return token > TokenType.MIN_RIGHT_HAND_OPERATOR && token < TokenType.MAX_RIGHT_HAND_OPERATOR;
}

/**
 * 表示一个优先级。
 */
export const enum Precedence {

    /**
     * 任意操作符。
     */
    any,

    /**
     * 逗号。
     */
    comma,

    /**
     * 赋值表达式。
     */
    assignment,

    /**
     * 问号。
     */
    conditional,

    /**
     * 逻辑或。
     */
    logicalOr,

    /**
     * 逻辑且。
     */
    logicalAnd,

    /**
     * 位或。
     */
    bitwiseOr,

    /**
     * 位异或。
     */
    bitwiseXOr,

    /**
     * 位且。
     */
    bitwiseAnd,

    /**
     * 等于判断。
     */
    equality,

    /**
     * 大小比较。
     */
    relational,

    /**
     * 位移。
     */
    shift,

    /**
     * 加减。
     */
    additive,

    /**
     * 乘除。
     */
    multiplicative,

    /**
     * 次方。
     */
    exponentiation,

    /**
     * 后缀表达式。
     */
    postfix,

    /**
     * 左值表达式。
     */
    leftHandSide,

    /**
     * 函数调用表达式。
     */
    functionCall,

    /**
     * 成员表达式。
     */
    member,

    /**
     * 独立表达式。
     */
    primary,

}

/**
 * 存储所有优先级。
 */
export const precedences: { [key: number]: Precedence } = {
    [TokenType.comma]: Precedence.comma,

    [TokenType.equals]: Precedence.assignment,
    [TokenType.plusEquals]: Precedence.assignment,
    [TokenType.minusEquals]: Precedence.assignment,
    [TokenType.asteriskEquals]: Precedence.assignment,
    [TokenType.slashEquals]: Precedence.assignment,
    [TokenType.percentEquals]: Precedence.assignment,
    [TokenType.lessThanLessThanEquals]: Precedence.assignment,
    [TokenType.greaterThanGreaterThanEquals]: Precedence.assignment,
    [TokenType.greaterThanGreaterThanGreaterThanEquals]: Precedence.assignment,
    [TokenType.ampersandEquals]: Precedence.assignment,
    [TokenType.barEquals]: Precedence.assignment,
    [TokenType.caretEquals]: Precedence.assignment,
    [TokenType.asteriskEquals]: Precedence.assignment,
    [TokenType.asteriskAsteriskEquals]: Precedence.assignment,

    [TokenType.question]: Precedence.conditional,
    [TokenType.barBar]: Precedence.logicalOr,
    [TokenType.ampersandAmpersand]: Precedence.logicalAnd,
    [TokenType.bar]: Precedence.bitwiseOr,
    [TokenType.caret]: Precedence.bitwiseXOr,
    [TokenType.ampersand]: Precedence.bitwiseAnd,

    [TokenType.equalsEquals]: Precedence.equality,
    [TokenType.exclamationEquals]: Precedence.equality,
    [TokenType.equalsEqualsEquals]: Precedence.equality,
    [TokenType.exclamationEqualsEquals]: Precedence.equality,

    [TokenType.lessThan]: Precedence.relational,
    [TokenType.greaterThan]: Precedence.relational,
    [TokenType.lessThanEquals]: Precedence.relational,
    [TokenType.greaterThanEquals]: Precedence.relational,
    [TokenType.instanceOf]: Precedence.relational,
    [TokenType.in]: Precedence.relational,
    [TokenType.is]: Precedence.relational,
    [TokenType.as]: Precedence.relational,

    [TokenType.lessThanLessThan]: Precedence.shift,
    [TokenType.greaterThanGreaterThan]: Precedence.shift,
    [TokenType.greaterThanGreaterThanGreaterThan]: Precedence.shift,

    [TokenType.plus]: Precedence.additive,
    [TokenType.minus]: Precedence.additive,

    [TokenType.asterisk]: Precedence.multiplicative,
    [TokenType.slash]: Precedence.multiplicative,
    [TokenType.percent]: Precedence.multiplicative,

    [TokenType.asteriskAsterisk]: Precedence.exponentiation,

    [TokenType.plusPlus]: Precedence.postfix,
    [TokenType.minusMinus]: Precedence.postfix,

    [TokenType.openParen]: Precedence.functionCall,

    [TokenType.openBracket]: Precedence.member,
    [TokenType.dot]: Precedence.member,
    [TokenType.noSubstitutionTemplateLiteral]: Precedence.member,
    [TokenType.templateHead]: Precedence.member,

};

/**
 * 获取操作符的优先级。
 * @param token 要判断的标记。
 * @returns 返回一个数字。数字越大说明优先级越高。
 */
export function getPrecedence(token: TokenType) {
    return precedences[token];
}
