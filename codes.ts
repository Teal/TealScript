/**
 * @fileOverview 标记
 * @author xuld@vip.qq.com
 * @generated 此文件标记为 @generated 的变量和函数内容使用 `tpack gen-tokenType` 生成。
 */
import {CharCode} from './unicode';

/**
 * 表示标记类型。
 * @generated
 */
export const enum TokenType {

    // #region 控制符(Control)

    /**
     * 未知标记。
     */
    unknown = 0,

    /**
     * 文件已结束(EOF)。
     */
    endOfFile = 1,

    // #endregion

    // #region 其它运算符(Other Operators)

    /**
     * 闭圆括号。
     */
    closeParen = 2,

    /**
     * 闭方括号。
     */
    closeBracket = 3,

    /**
     * 闭花括号。
     */
    closeBrace = 4,

    /**
     * 冒号。
     */
    colon = 5,

    /**
     * 分号。
     */
    semicolon = 6,

    /**
     * 模板字符串中间(`}...${`)。
     */
    templateMiddle = 7,

    /**
     * 模板字符串结尾(`}...\``)。
     */
    templateTail = 8,

    // #endregion

    // #region 字面量(Literal)

    /**
     * 简单模板字符串字面量(`\`...\``)。
     */
    noSubstitutionTemplateLiteral = 9,

    /**
     * 模板字符串开头(`\`...${`)。
     */
    templateHead = 10,

    /**
     * 正则表达式字面量(`/.../`)。
     */
    regularExpressionLiteral = 11,

    /**
     * 关键字 super。
     */
    super = 12,

    /**
     * 数字字面量(`0x0`)。
     */
    numericLiteral = 13,

    /**
     * 字符串字面量(`"..."`、`'...'`)。
     */
    stringLiteral = 14,

    /**
     * 关键字 true。
     */
    true = 15,

    /**
     * 关键字 false。
     */
    false = 16,

    /**
     * 关键字 null。
     */
    null = 17,

    /**
     * 关键字 this。
     */
    this = 18,

    /**
     * 关键字 undefined。
     */
    undefined = 19,

    /**
     * 标识符(`x`)。
     */
    identifier = 20,

    // #endregion

    // #region 修饰符(Modifiers)

    /**
     * 关键字 async。
     */
    async = 21,

    /**
     * 关键字 declare。
     */
    declare = 22,

    /**
     * 关键字 static。
     */
    static = 23,

    /**
     * 关键字 abstract。
     */
    abstract = 24,

    /**
     * 关键字 private。
     */
    private = 25,

    /**
     * 关键字 protected。
     */
    protected = 26,

    /**
     * 关键字 public。
     */
    public = 27,

    /**
     * 关键字 readonly。
     */
    readonly = 28,

    /**
     * 关键字 export。
     */
    export = 29,

    /**
     * 关键字 const。
     */
    const = 30,

    // #endregion

    // #region 声明(Declarations)

    /**
     * 关键字 function。
     */
    function = 31,

    /**
     * 关键字 class。
     */
    class = 32,

    /**
     * 关键字 enum。
     */
    enum = 33,

    /**
     * 关键字 namespace。
     */
    namespace = 34,

    /**
     * 关键字 module。
     */
    module = 35,

    /**
     * 关键字 interface。
     */
    interface = 36,

    // #endregion

    // #region 单目运算符(Unary Operators)

    /**
     * 关键字 yield。
     */
    yield = 37,

    /**
     * 关键字 await。
     */
    await = 38,

    /**
     * 开花括号。
     */
    openBrace = 39,

    /**
     * 关键字 new。
     */
    new = 40,

    /**
     * 关键字 typeof。
     */
    typeof = 41,

    /**
     * 关键字 void。
     */
    void = 42,

    /**
     * 非。
     */
    exclamation = 43,

    /**
     * 关键字 delete。
     */
    delete = 44,

    /**
     * 展开。
     */
    dotDotDot = 45,

    /**
     * 电子邮件符号。
     */
    at = 46,

    /**
     * 位反。
     */
    tilde = 47,

    // #endregion

    // #region 单/双目运算符(Unary & Binary Operators)

    /**
     * 加。
     */
    plus = 48,

    /**
     * 减。
     */
    minus = 49,

    /**
     * 加加。
     */
    plusPlus = 50,

    /**
     * 减减。
     */
    minusMinus = 51,

    /**
     * 开圆括号。
     */
    openParen = 52,

    /**
     * 开方括号。
     */
    openBracket = 53,

    /**
     * 除。
     */
    slash = 54,

    /**
     * 小于。
     */
    lessThan = 55,

    /**
     * 箭头。
     */
    equalsGreaterThan = 56,

    /**
     * 除等于。
     */
    slashEquals = 57,

    // #endregion

    // #region 双目运算符(Binary Operators)

    /**
     * 乘乘。
     */
    asteriskAsterisk = 58,

    /**
     * 等于。
     */
    equals = 59,

    /**
     * 加等于。
     */
    plusEquals = 60,

    /**
     * 减等于。
     */
    minusEquals = 61,

    /**
     * 乘等于。
     */
    asteriskEquals = 62,

    /**
     * 取余等于。
     */
    percentEquals = 63,

    /**
     * 左移等于。
     */
    lessThanLessThanEquals = 64,

    /**
     * 右移等于。
     */
    greaterThanGreaterThanEquals = 65,

    /**
     * 无符右移等于。
     */
    greaterThanGreaterThanGreaterThanEquals = 66,

    /**
     * 位与等于。
     */
    ampersandEquals = 67,

    /**
     * 位或等于。
     */
    barEquals = 68,

    /**
     * 异或等于。
     */
    caretEquals = 69,

    /**
     * 乘乘等于。
     */
    asteriskAsteriskEquals = 70,

    /**
     * 点。
     */
    dot = 71,

    /**
     * 点点。
     */
    dotDot = 72,

    /**
     * 问号点。
     */
    questionDot = 73,

    /**
     * 位与。
     */
    ampersand = 74,

    /**
     * 取余。
     */
    percent = 75,

    /**
     * 大于。
     */
    greaterThan = 76,

    /**
     * 小于等于。
     */
    lessThanEquals = 77,

    /**
     * 大于等于。
     */
    greaterThanEquals = 78,

    /**
     * 等于。
     */
    equalsEquals = 79,

    /**
     * 不等于。
     */
    exclamationEquals = 80,

    /**
     * 严格等于。
     */
    equalsEqualsEquals = 81,

    /**
     * 不严格等于。
     */
    exclamationEqualsEquals = 82,

    /**
     * 左移。
     */
    lessThanLessThan = 83,

    /**
     * 右移。
     */
    greaterThanGreaterThan = 84,

    /**
     * 无符右移。
     */
    greaterThanGreaterThanGreaterThan = 85,

    /**
     * 位或。
     */
    bar = 86,

    /**
     * 异或。
     */
    caret = 87,

    /**
     * 与。
     */
    ampersandAmpersand = 88,

    /**
     * 或。
     */
    barBar = 89,

    /**
     * 逗号。
     */
    comma = 90,

    /**
     * 关键字 in。
     */
    in = 91,

    /**
     * 关键字 instanceOf。
     */
    instanceOf = 92,

    /**
     * 关键字 as。
     */
    as = 93,

    /**
     * 关键字 is。
     */
    is = 94,

    /**
     * 乘。
     */
    asterisk = 95,

    /**
     * 问号。
     */
    question = 96,

    // #endregion

    // #region 内置类型(Predefined Types)

    /**
     * 关键字 any。
     */
    any = 97,

    /**
     * 关键字 number。
     */
    number = 98,

    /**
     * 关键字 boolean。
     */
    boolean = 99,

    /**
     * 关键字 string。
     */
    string = 100,

    /**
     * 关键字 symbol。
     */
    symbol = 101,

    /**
     * 关键字 never。
     */
    never = 102,

    /**
     * 关键字 char。
     */
    char = 103,

    /**
     * 关键字 byte。
     */
    byte = 104,

    /**
     * 关键字 int。
     */
    int = 105,

    /**
     * 关键字 long。
     */
    long = 106,

    /**
     * 关键字 short。
     */
    short = 107,

    /**
     * 关键字 uint。
     */
    uint = 108,

    /**
     * 关键字 ulong。
     */
    ulong = 109,

    /**
     * 关键字 ushort。
     */
    ushort = 110,

    /**
     * 关键字 float。
     */
    float = 111,

    /**
     * 关键字 double。
     */
    double = 112,

    // #endregion

    // #region 其它语句(Other Statements)

    /**
     * 关键字 from。
     */
    from = 113,

    /**
     * 关键字 implements。
     */
    implements = 114,

    /**
     * 关键字 package。
     */
    package = 115,

    /**
     * 关键字 of。
     */
    of = 116,

    /**
     * 关键字 to。
     */
    to = 117,

    /**
     * 关键字 else。
     */
    else = 118,

    /**
     * 关键字 case。
     */
    case = 119,

    /**
     * 关键字 default。
     */
    default = 120,

    /**
     * 关键字 catch。
     */
    catch = 121,

    /**
     * 关键字 finally。
     */
    finally = 122,

    /**
     * 关键字 extends。
     */
    extends = 123,

    // #endregion

    // #region 语句头(Statement Headers)

    /**
     * 关键字 if。
     */
    if = 124,

    /**
     * 关键字 switch。
     */
    switch = 125,

    /**
     * 关键字 for。
     */
    for = 126,

    /**
     * 关键字 while。
     */
    while = 127,

    /**
     * 关键字 do。
     */
    do = 128,

    /**
     * 关键字 continue。
     */
    continue = 129,

    /**
     * 关键字 break。
     */
    break = 130,

    /**
     * 关键字 return。
     */
    return = 131,

    /**
     * 关键字 throw。
     */
    throw = 132,

    /**
     * 关键字 try。
     */
    try = 133,

    /**
     * 关键字 debugger。
     */
    debugger = 134,

    /**
     * 关键字 with。
     */
    with = 135,

    /**
     * 关键字 var。
     */
    var = 136,

    /**
     * 关键字 import。
     */
    import = 137,

    /**
     * 关键字 let。
     */
    let = 138,

    /**
     * 关键字 type。
     */
    type = 139,

    // #endregion

}

/**
 * 存储所有标记的类型名称映射。
 * @generated
 */
export const tokenNames = [
	"<unknown>",
	"<endOfFile>",
	")",
	"]",
	"}",
	":",
	";",
	"<templateMiddle>",
	"<templateTail>`",
	"<noSubstitutionTemplateLiteral>",
	"<templateHead>",
	"<regularExpressionLiteral>",
	"super",
	"<numericLiteral>",
	"<stringLiteral>",
	"true",
	"false",
	"null",
	"this",
	"undefined",
	"<identifier>",
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
	"void",
	"!",
	"delete",
	"...",
	"@",
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
	"*",
	"?",
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
	"from",
	"implements",
	"package",
	"of",
	"to",
	"else",
	"case",
	"default",
	"catch",
	"finally",
	"extends",
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
	"type"
];

/**
 * 获取指定标记的名字。
 * @param token 要获取的标记。
 * @returns 返回标记名字。如果标记无效则返回 undefined。
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
 * 存储所有关键字的名称类型映射。
 * @generated
 */
export const keywords: { [key: string]: TokenType } = {
	super: TokenType.super,
	true: TokenType.true,
	false: TokenType.false,
	null: TokenType.null,
	this: TokenType.this,
	undefined: TokenType.undefined,
	async: TokenType.async,
	declare: TokenType.declare,
	static: TokenType.static,
	abstract: TokenType.abstract,
	private: TokenType.private,
	protected: TokenType.protected,
	public: TokenType.public,
	readonly: TokenType.readonly,
	export: TokenType.export,
	const: TokenType.const,
	function: TokenType.function,
	class: TokenType.class,
	enum: TokenType.enum,
	namespace: TokenType.namespace,
	module: TokenType.module,
	interface: TokenType.interface,
	yield: TokenType.yield,
	await: TokenType.await,
	new: TokenType.new,
	typeof: TokenType.typeof,
	void: TokenType.void,
	delete: TokenType.delete,
	in: TokenType.in,
	instanceOf: TokenType.instanceOf,
	as: TokenType.as,
	is: TokenType.is,
	any: TokenType.any,
	number: TokenType.number,
	boolean: TokenType.boolean,
	string: TokenType.string,
	symbol: TokenType.symbol,
	never: TokenType.never,
	char: TokenType.char,
	byte: TokenType.byte,
	int: TokenType.int,
	long: TokenType.long,
	short: TokenType.short,
	uint: TokenType.uint,
	ulong: TokenType.ulong,
	ushort: TokenType.ushort,
	float: TokenType.float,
	double: TokenType.double,
	from: TokenType.from,
	implements: TokenType.implements,
	package: TokenType.package,
	of: TokenType.of,
	to: TokenType.to,
	else: TokenType.else,
	case: TokenType.case,
	default: TokenType.default,
	catch: TokenType.catch,
	finally: TokenType.finally,
	extends: TokenType.extends,
	if: TokenType.if,
	switch: TokenType.switch,
	for: TokenType.for,
	while: TokenType.while,
	do: TokenType.do,
	continue: TokenType.continue,
	break: TokenType.break,
	return: TokenType.return,
	throw: TokenType.throw,
	try: TokenType.try,
	debugger: TokenType.debugger,
	with: TokenType.with,
	var: TokenType.var,
	import: TokenType.import,
	let: TokenType.let,
	type: TokenType.type
};

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
    return getTokenName(token) in keywords;
}

/**
 * 判断指定的标记是否可作为标志名。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @remark 为了兼容历史代码，部分关键字允许被作为变量名使用。
 * @generated
 */
export function isIdentifierName(token: TokenType) {
	return token >= TokenType.undefined && token <= TokenType.readonly ||
		token >= TokenType.namespace && token <= TokenType.await ||
		token >= TokenType.any && token <= TokenType.to ||
		token === TokenType.let || token === TokenType.type;
}

/**
 * 判断指定的标记是否是严格模式下的标识符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
export function isReservedWord(token: TokenType) {
	return token === TokenType.static ||
		token >= TokenType.private && token <= TokenType.public ||
		token === TokenType.interface || token === TokenType.yield ||
		token === TokenType.implements || token === TokenType.package ||
		token === TokenType.let;
}

/**
 * 判断指定的标记是否可作为绑定名称开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isBindingNameStart(token: TokenType) {
    return isIdentifierName(token) ||
        token === TokenType.openBracket ||
        token === TokenType.openBrace;
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
 * 判断指定的标记是否可作为类型节点开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isTypeNodeStart(token: TokenType) {
	return token >= TokenType.numericLiteral && token <= TokenType.readonly ||
		token >= TokenType.namespace && token <= TokenType.void ||
		token === TokenType.openParen || token === TokenType.openBracket ||
		token === TokenType.lessThan ||
		token >= TokenType.asterisk && token <= TokenType.to ||
		token === TokenType.let || token === TokenType.type;
}

/**
 * 判断指定的标记是否可作为内置类型。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
export function isPredefinedType(token: TokenType) {
	return token >= TokenType.null && token <= TokenType.undefined ||
		token === TokenType.void ||
		token >= TokenType.asterisk && token <= TokenType.double;
}

/**
 * 判断指定的标记是否可作为表达式开头。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
export function isExpressionStart(token: TokenType) {
	return token >= TokenType.noSubstitutionTemplateLiteral && token <= TokenType.readonly ||
		token >= TokenType.function && token <= TokenType.slashEquals ||
		token >= TokenType.any && token <= TokenType.to;
}

/**
 * 判断指定的标记是否可作为简单字面量。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
export function isSimpleLiteral(token: TokenType) {
	return token === TokenType.super ||
		token >= TokenType.true && token <= TokenType.undefined;
}

/**
 * 判断指定的标记是否可作为单目运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
export function isUnaryOperator(token: TokenType) {
	return token >= TokenType.typeof && token <= TokenType.minusMinus;
}

/**
 * 表示操作符优先级。
 */
export const enum Precedence {

    /**
     * 任意优先级。
     */
    any,

    /**
     * 逗号表达式。
     */
    comma,

    /**
     * 赋值表达式。
     */
    assignment,

    /**
     * 问号表达式。
     */
    conditional,

    /**
     * 逻辑或表达式。
     */
    logicalOr,

    /**
     * 逻辑且表达式。
     */
    logicalAnd,

    /**
     * 位或表达式。
     */
    bitwiseOr,

    /**
     * 位异或表达式。
     */
    bitwiseXOr,

    /**
     * 位且表达式。
     */
    bitwiseAnd,

    /**
     * 等于表达式。
     */
    equality,

    /**
     * 比较表达式。
     */
    relational,

    /**
     * 位移表达式。
     */
    shift,

    /**
     * 加减表达式。
     */
    additive,

    /**
     * 乘除表达式。
     */
    multiplicative,

    /**
     * 次方表达式。
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
 * 判断指定的标记是否是双目表达式合法的运算符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isBinaryOperator(token: TokenType) {
    if (token === TokenType.question) {
        return false;
    }
    const precedence = getPrecedence(token);
    return precedence > Precedence.any && precedence < Precedence.postfix;
}

/**
 * 存储所有优先级。
 * @generated
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
 * @returns 返回一个数字。数字越大说明优先级越高。如果标记无效则返回 undefined。
 */
export function getPrecedence(token: TokenType) {
    return precedences[token];
}

/**
 * 判断指定的运算符是否是从右往左优先计算。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
export function isRightHandOperator(token: TokenType) {
	return token >= TokenType.slashEquals && token <= TokenType.asteriskAsteriskEquals;
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
 * 判断指定的标记是否可作为语句开头。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
export function isStatementStart(token: TokenType) {
	return token >= TokenType.if && token <= TokenType.type;
}

/**
 * 判断指定的标记是否可作为 case 标签开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isCaseLabelStart(token: TokenType) {
    return isExpressionStart(token) || token === TokenType.else;
}

/**
 * 判断指定的标记是否可作为定义开头。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
export function isDeclarationStart(token: TokenType) {
	return token >= TokenType.async && token <= TokenType.interface ||
		token === TokenType.at ||
		token === TokenType.extends;
}

/**
 * 判断指定的标记是否可作为修饰符。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
export function isModifier(token: TokenType) {
	return token >= TokenType.async && token <= TokenType.const;
}

/**
 * 判断指定的标记是否可作为参数开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isParameterStart(token: TokenType) {
    return isModifier(token) || isBindingNameStart(token) || token === TokenType.dotDotDot;
}
