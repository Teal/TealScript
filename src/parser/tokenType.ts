﻿/**
 * @fileOverview 标记和关键字
 */

import {CharCode} from './charCode';

/**
 * 表示一个标记类型。
 * @internal
 */
export enum TokenType {

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

    // #region 修饰符(Modifiers)

    /**
     * 最小的表达式开始。
     */
    MIN_EXPRESSION_START,

    /**
     * 最小的修饰符前缀。
     */
    MIN_MODIFIER,

    /**
     * 关键字 export(仅在 JavaScript 7)。
     */
    export,

    /**
     * 关键字 async(仅在 JavaScript 7)。
     */
    async,

    /**
     * 关键字 private(仅在 JavaScript 7)。
     */
    private,

    /**
     * 关键字 protected(仅在 JavaScript 7)。
     */
    protected,

    /**
     * 关键字 public(仅在 JavaScript 7)。
     */
    public,

    /**
     * 关键字 static(仅在 JavaScript 7)。
     */
    static,

    /**
     * 关键字 abstract(仅在 JavaScript 7)。
     */
    abstract,

    /**
     * 关键字 declare(仅在 TypeScript)。
     */
    declare,

    /**
     * 关键字 readonly(仅在 TypeScript)。
     */
    readonly,

    /**
     * 最大的修饰符前缀。
     */
    MAX_MODIFIER,

    // #endregion

    // #region 定义(Declarations)

    /**
     * 最小的定义前缀。
     */
    MIN_DECLARATION,

    /**
     * 关键字 enum(仅在 JavaScript 7)。
     */
    enum,

    /**
     * 关键字 interface(仅在 JavaScript 7)。
     */
    interface,

    /**
     * 关键字 class(仅在 JavaScript 7)。
     */
    class,

    /**
     * 关键字 function。
     */
    function,

    /**
     * 最大的定义前缀。
     */
    MAX_DECLARATION,

    // #endregion

    // #region 字面量(Literal)

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
     * 简单模板字符串字面量(`...`)(仅在 JavaScript 7)。
     */
    noSubstitutionTemplateLiteral,

    /**
     * 模板字符串头(`...${)(仅在 JavaScript 7)。
     */
    templateHead,

    /**
     * 最小的简单字面量。
     */
    MIN_SIMPLE_LITERAL,

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
     * 关键字 super(仅在 JavaScript 7)。
     */
    super,

    /**
     * 最大的简单字面量。
     */
    MAX_SIMPLE_LITERAL,

    // #endregion

    // #region 单目运算符(Unary Operators)

    /**
     * 最小的单目运算符。
     */
    MIN_UNARY_OPERATOR,

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
     * 位反(~)。
     */
    tilde,

    /**
     * 关键字 yield(仅在 JavaScript 7)。
     */
    yield,

    /**
     * 关键字 await(仅在 JavaScript 7)。
     */
    await,

    /**
     * 电子邮件符号(@)(仅在 JavaScript 7)。
     */
    at,

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
     * 箭头(=>)(仅在 JavaScript 7)。
     */
    equalsGreaterThan,

    /**
     * 点点点(...)(仅在 JavaScript 7)。
     */
    dotDotDot,

    /**
     * 最大的单目运算符。
     */
    MAX_UNARY_OPERATOR,

    /**
     * 最大的表达式开始。
     */
    MAX_EXPRESSION_START,

    // #endregion

    // #region 双目运算符(Binary Operators)

    /**
     * 点(.)。
     */
    dot,

    /**
     * 点点(..)(仅在 TealScript)。
     */
    dotDot,

    /**
     * 问号点(?.)(仅在 TealScript)。
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
     * 关键字 in。
     */
    in,

    /**
     * 关键字 instanceOf。
     */
    instanceOf,

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
     * 星号星号(**)(仅在 JavaScript 7)。
     */
    asteriskAsterisk,

    /**
     * 最小的赋值运算符。
     */
    MIN_ASSIGN_OPERATOR,

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
     * 斜杠等于(/=)。
     */
    slashEquals,

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
     * 星号星号等于(**=)(仅在 JavaScript 7)。
     */
    asteriskAsteriskEquals,

    /**
     * 最大的赋值运算符。
     */
    MAX_ASSIGN_OPERATOR,

    /**
     * 问号(?)。
     */
    question,

    /**
     * 逗号(,)。
     */
    comma,

    /**
     * 关键字 as(仅在 TypeScript)。
     */
    as,

    /**
     * 关键字 is(仅在 TypeScript)。
     */
    is,

    /**
     * 最大的双目运算符。
     */
    MAX_BINARY_OPERATOR,

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
     * 模板字符串主体(}...${)(仅在 JavaScript 7)。
     */
    templateMiddle,

    /**
     * 模板字符串尾(}...`)(仅在 JavaScript 7)。
     */
    templateTail,

    // #endregion

    // #region 语句头(Statement Headers)

    /**
     * 最小的语句开始。
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
     * 关键字 var。
     */
    var,

    /**
     * 关键字 const(仅在 JavaScript 7)。
     */
    const,

    /**
     * 关键字 let(仅在 JavaScript 7)。
     */
    let,

    /**
     * 关键字 debugger。
     */
    debugger,

    /**
     * 关键字 with。
     */
    with,

    /**
     * 关键字 import(仅在 JavaScript 7)。
     */
    import,

    /**
     * 关键字 package(仅在 JavaScript 7)。
     */
    package,

    /**
     * 关键字 type(仅在 TypeScript)。
     */
    type,

    /**
     * 关键字 namespace(仅在 TypeScript)。
     */
    namespace,

    /**
     * 关键字 module(仅在 TypeScript)。
     */
    module,

    /**
     * 最大的语句开始。
     */
    MAX_STATEMENT_START,

    // #endregion

    // #region 其它语句(Other Statements)

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
     * 关键字 from(仅在 JavaScript 7)。
     */
    from,

    /**
     * 关键字 extends(仅在 JavaScript 7)。
     */
    extends,

    /**
     * 关键字 implements(仅在 JavaScript 7)。
     */
    implements,

    /**
     * 关键字 of(仅在 JavaScript 7)。
     */
    of,

    /**
     * 关键字 to(仅在 TealScript)。
     */
    to,

    /**
     * 关键字 get(仅在 JavaScript 7)。
     */
    get,

    /**
     * 关键字 set(仅在 JavaScript 7)。
     */
    set,

    /**
     * 关键字 undefined(仅在 TypeScript)。
     */
    undefined,

    /**
     * 关键字 constructor(仅在 TypeScript)。
     */
    constructor,

    /**
     * 关键字 global(仅在 TypeScript)。
     */
    global,

    // #endregion

    // #region 内置类型(Predefined Types)

    /**
     * 最小的内置类型。
     */
    MIN_PREDEFINED_TYPE,

    /**
     * 关键字 any(仅在 TypeScript)。
     */
    any,

    /**
     * 关键字 boolean(仅在 TypeScript)。
     */
    boolean,

    /**
     * 关键字 number(仅在 TypeScript)。
     */
    number,

    /**
     * 关键字 string(仅在 TypeScript)。
     */
    string,

    /**
     * 关键字 symbol(仅在 TypeScript)。
     */
    symbol,

    /**
     * 关键字 never(仅在 TypeScript)。
     */
    never,

    /**
     * 最大的内置类型。
     */
    MAX_PREDEFINED_TYPE,

    // #endregion

}

/**
 * 将指定的字符串转为对应的标记。
 * @param token 要转换的字符串。
 * @returns 返回等效的标记。如果字符串无效，则返回 undefined。
 */
export function stringToToken(token: string) {
    return TokenType[token];
}

/**
 * 将指定的标记转为对应的字符串。
 * @param token 要转换的标记。
 * @returns 返回等效的字符串。如果标记无效，则返回 undefined。
 */
export function tokenToString(token: TokenType) {
    return TokenType[token];
}

/**
 * 判断指定的标记是否是表达式开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isSimpleLiteral(token: TokenType) {
    return token > TokenType.MIN_SIMPLE_LITERAL && token < TokenType.MAX_SIMPLE_LITERAL;
}

/**
 * 判断指定的标记是否是单目运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isUnaryOperator(token: TokenType) {
    return token > TokenType.MIN_UNARY_OPERATOR && token < TokenType.MAX_UNARY_OPERATOR;
}

/**
 * 判断指定的标记是否是双目运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isBinaryOperator(token: TokenType) {
    return token > TokenType.MIN_BINARY_OPERATOR && token < TokenType.MAX_BINARY_OPERATOR;
}

/**
 * 判断指定的标记是否是修饰符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isModifier(token: TokenType) {
    return token > TokenType.MIN_MODIFIER && token < TokenType.MAX_MODIFIER;
}

/**
 * 判断指定的标记是否是语句开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isStatementStart(token: TokenType) {
    return token > TokenType.MIN_STATEMENT_START && token < TokenType.MAX_STATEMENT_START;
}

/**
 * 判断指定的标记是否是表达式开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isExpressionStart(token: TokenType) {
    return token > TokenType.MIN_EXPRESSION_START && token < TokenType.MAX_EXPRESSION_START;
}

/**
 * 判断指定的标记是否是关键字。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isKeyword(token: TokenType) {
    const ch = tokenToString(token).charCodeAt(0);
    return ch >= CharCode.a && ch <= CharCode.z;
}

/**
 * 存储所有优先级。
 */
const precedences = {
    [TokenType.comma]: 1,

    [TokenType.equals]: 2,
    [TokenType.plusEquals]: 2,
    [TokenType.minusEquals]: 2,
    [TokenType.asteriskEquals]: 2,
    [TokenType.slashEquals]: 2,
    [TokenType.percentEquals]: 2,
    [TokenType.lessThanLessThanEquals]: 2,
    [TokenType.greaterThanGreaterThanEquals]: 2,
    [TokenType.greaterThanGreaterThanGreaterThanEquals]: 2,
    [TokenType.ampersandEquals]: 2,
    [TokenType.barEquals]: 2,
    [TokenType.caretEquals]: 2,
    [TokenType.asteriskEquals]: 2,
    [TokenType.asteriskAsteriskEquals]: 2,

    [TokenType.question]: 3,
    [TokenType.barBar]: 4,
    [TokenType.ampersandAmpersand]: 5,
    [TokenType.bar]: 6,
    [TokenType.caret]: 7,
    [TokenType.ampersand]: 8,

    [TokenType.equalsEquals]: 9,
    [TokenType.exclamationEquals]: 9,
    [TokenType.equalsEqualsEquals]: 9,
    [TokenType.exclamationEqualsEquals]: 9,

    [TokenType.lessThan]: 10,
    [TokenType.greaterThan]: 10,
    [TokenType.lessThanEquals]: 10,
    [TokenType.greaterThanEquals]: 10,
    [TokenType.instanceOf]: 10,
    [TokenType.in]: 10,
    [TokenType.is]: 10,
    [TokenType.as]: 10,

    [TokenType.lessThanLessThan]: 11,
    [TokenType.greaterThanGreaterThan]: 11,
    [TokenType.greaterThanGreaterThanGreaterThan]: 11,

    [TokenType.plus]: 12,
    [TokenType.minus]: 12,

    [TokenType.asterisk]: 13,
    [TokenType.slash]: 13,
    [TokenType.percent]: 13,

    [TokenType.asteriskAsterisk]: 14,

};

/**
 * 获取操作符的优先级。
 * @param token 要判断的标记。
 * @returns 返回一个数字。数字越大说明优先级越高。
 */
export function getPrecedence(token: TokenType) {
    return precedences[token] || 15;
}