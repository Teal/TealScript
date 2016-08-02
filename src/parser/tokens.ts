/**
 * @fileOverview 标记
 * @author xuld@vip.qq.com
 * @generated 此文件标记为 @generated 的变量和函数内容使用 `tpack gen-parser` 生成。
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
     * 闭圆括号(`)`)。
     */
    closeParen = 2,

    /**
     * 闭方括号(`]`)。
     */
    closeBracket = 3,

    /**
     * 闭花括号(`}`)。
     */
    closeBrace = 4,

    /**
     * 冒号(`:`)。
     */
    colon = 5,

    /**
     * 模板字符串中间(`}...${`)(在 EcmaScript 5 新增)。
     */
    templateMiddle = 6,

    /**
     * 模板字符串结尾(`}...\``)(在 EcmaScript 5 新增)。
     */
    templateTail = 7,

    // #endregion

    // #region 字面量(Literal)

    /**
     * 简单模板字符串字面量(`\`...\``)(在 EcmaScript 5 新增)。
     */
    noSubstitutionTemplateLiteral = 8,

    /**
     * 模板字符串开头(`\`...${`)(在 EcmaScript 5 新增)。
     */
    templateHead = 9,

    /**
     * 正则表达式字面量(`/.../`)。
     */
    regularExpressionLiteral = 10,

    /**
     * 关键字 super(在 EcmaScript 5 新增)。
     */
    super = 11,

    /**
     * 标识符(`x`)。
     */
    identifier = 12,

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

    // #endregion

    // #region 内置类型(Predefined Types)

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
     * 关键字 any(在 TypeScript 1 新增)。
     */
    any = 20,

    /**
     * 关键字 number(在 TypeScript 1 新增)。
     */
    number = 21,

    /**
     * 关键字 boolean(在 TypeScript 1 新增)。
     */
    boolean = 22,

    /**
     * 关键字 string(在 TypeScript 1 新增)。
     */
    string = 23,

    /**
     * 关键字 symbol(在 TypeScript 1 新增)。
     */
    symbol = 24,

    /**
     * 关键字 never(在 TypeScript 1 新增)。
     */
    never = 25,

    /**
     * 关键字 char(在 TealScript 1 新增)。
     */
    char = 26,

    /**
     * 关键字 byte(在 TealScript 1 新增)。
     */
    byte = 27,

    /**
     * 关键字 int(在 TealScript 1 新增)。
     */
    int = 28,

    /**
     * 关键字 long(在 TealScript 1 新增)。
     */
    long = 29,

    /**
     * 关键字 short(在 TealScript 1 新增)。
     */
    short = 30,

    /**
     * 关键字 uint(在 TealScript 1 新增)。
     */
    uint = 31,

    /**
     * 关键字 ulong(在 TealScript 1 新增)。
     */
    ulong = 32,

    /**
     * 关键字 ushort(在 TealScript 1 新增)。
     */
    ushort = 33,

    /**
     * 关键字 float(在 TealScript 1 新增)。
     */
    float = 34,

    /**
     * 关键字 double(在 TealScript 1 新增)。
     */
    double = 35,

    /**
     * 关键字 void。
     */
    void = 36,

    /**
     * 乘(`*`)。
     */
    asterisk = 37,

    /**
     * 问号(`?`)。
     */
    question = 38,

    // #endregion

    // #region 修饰符(Modifiers)

    /**
     * 关键字 async(在 EcmaScript 7 新增)。
     */
    async = 39,

    /**
     * 关键字 declare(在 TypeScript 1 新增)。
     */
    declare = 40,

    /**
     * 关键字 static(在 EcmaScript 7 新增)。
     */
    static = 41,

    /**
     * 关键字 abstract(在 TypeScript 1 新增)。
     */
    abstract = 42,

    /**
     * 关键字 private(在 TypeScript 1 新增)。
     */
    private = 43,

    /**
     * 关键字 protected(在 TypeScript 1 新增)。
     */
    protected = 44,

    /**
     * 关键字 public(在 TypeScript 1 新增)。
     */
    public = 45,

    /**
     * 关键字 readonly(在 TypeScript 2 新增)。
     */
    readonly = 46,

    /**
     * 关键字 export(在 EcmaScript 5 新增)。
     */
    export = 47,

    /**
     * 关键字 const(在 EcmaScript 5 新增)。
     */
    const = 48,

    // #endregion

    // #region 声明(Declarations)

    /**
     * 关键字 function。
     */
    function = 49,

    /**
     * 关键字 class(在 EcmaScript 5 新增)。
     */
    class = 50,

    /**
     * 关键字 enum(在 TypeScript 1 新增)。
     */
    enum = 51,

    /**
     * 关键字 namespace(在 TypeScript 1 新增)。
     */
    namespace = 52,

    /**
     * 关键字 module(在 TypeScript 1 新增)。
     */
    module = 53,

    /**
     * 关键字 interface(在 TypeScript 1 新增)。
     */
    interface = 54,

    // #endregion

    // #region 单目运算符(Unary Operators)

    /**
     * 关键字 yield(在 EcmaScript 5 新增)。
     */
    yield = 55,

    /**
     * 关键字 await(在 EcmaScript 7 新增)。
     */
    await = 56,

    /**
     * 开花括号(`{`)。
     */
    openBrace = 57,

    /**
     * 关键字 new。
     */
    new = 58,

    /**
     * 关键字 typeof。
     */
    typeof = 59,

    /**
     * 电子邮件符号(`@`)(在 EcmaScript 7 新增)。
     */
    at = 60,

    /**
     * 非(`!`)。
     */
    exclamation = 61,

    /**
     * 关键字 delete。
     */
    delete = 62,

    /**
     * 展开(`...`)。
     */
    dotDotDot = 63,

    /**
     * 位反(`~`)。
     */
    tilde = 64,

    // #endregion

    // #region 单/双目运算符(Unary & Binary Operators)

    /**
     * 加(`+`)。
     */
    plus = 65,

    /**
     * 减(`-`)。
     */
    minus = 66,

    /**
     * 加加(`++`)。
     */
    plusPlus = 67,

    /**
     * 减减(`--`)。
     */
    minusMinus = 68,

    /**
     * 开圆括号(`(`)。
     */
    openParen = 69,

    /**
     * 开方括号(`[`)。
     */
    openBracket = 70,

    /**
     * 除(`/`)。
     */
    slash = 71,

    /**
     * 小于(`<`)。
     */
    lessThan = 72,

    /**
     * 箭头(`=>`)(在 EcmaScript 5 新增)。
     */
    equalsGreaterThan = 73,

    /**
     * 除等于(`/=`)。
     */
    slashEquals = 74,

    // #endregion

    // #region 双目运算符(Binary Operators)

    /**
     * 乘乘(`**`)(在 EcmaScript 5 新增)。
     */
    asteriskAsterisk = 75,

    /**
     * 等于(`=`)。
     */
    equals = 76,

    /**
     * 加等于(`+=`)。
     */
    plusEquals = 77,

    /**
     * 减等于(`-=`)。
     */
    minusEquals = 78,

    /**
     * 乘等于(`*=`)。
     */
    asteriskEquals = 79,

    /**
     * 取余等于(`%=`)。
     */
    percentEquals = 80,

    /**
     * 左移等于(`<<=`)。
     */
    lessThanLessThanEquals = 81,

    /**
     * 右移等于(`>>=`)。
     */
    greaterThanGreaterThanEquals = 82,

    /**
     * 无符右移等于(`>>>=`)。
     */
    greaterThanGreaterThanGreaterThanEquals = 83,

    /**
     * 位与等于(`&=`)。
     */
    ampersandEquals = 84,

    /**
     * 位或等于(`|=`)。
     */
    barEquals = 85,

    /**
     * 异或等于(`^=`)。
     */
    caretEquals = 86,

    /**
     * 乘乘等于(`**=`)。
     */
    asteriskAsteriskEquals = 87,

    /**
     * 点(`.`)。
     */
    dot = 88,

    /**
     * 点点(`..`)(在 TealScript 1 新增)。
     */
    dotDot = 89,

    /**
     * 问号点(`?.`)(在 TealScript 1 新增)。
     */
    questionDot = 90,

    /**
     * 位与(`&`)。
     */
    ampersand = 91,

    /**
     * 取余(`%`)。
     */
    percent = 92,

    /**
     * 大于(`>`)。
     */
    greaterThan = 93,

    /**
     * 小于等于(`<=`)。
     */
    lessThanEquals = 94,

    /**
     * 大于等于(`>=`)。
     */
    greaterThanEquals = 95,

    /**
     * 等于(`==`)。
     */
    equalsEquals = 96,

    /**
     * 不等于(`!=`)。
     */
    exclamationEquals = 97,

    /**
     * 严格等于(`===`)。
     */
    equalsEqualsEquals = 98,

    /**
     * 不严格等于(`!==`)。
     */
    exclamationEqualsEquals = 99,

    /**
     * 左移(`<<`)。
     */
    lessThanLessThan = 100,

    /**
     * 右移(`>>`)。
     */
    greaterThanGreaterThan = 101,

    /**
     * 无符右移(`>>>`)。
     */
    greaterThanGreaterThanGreaterThan = 102,

    /**
     * 位或(`|`)。
     */
    bar = 103,

    /**
     * 异或(`^`)。
     */
    caret = 104,

    /**
     * 与(`&&`)。
     */
    ampersandAmpersand = 105,

    /**
     * 或(`||`)。
     */
    barBar = 106,

    /**
     * 逗号(`,`)。
     */
    comma = 107,

    /**
     * 关键字 in。
     */
    in = 108,

    /**
     * 关键字 instanceOf。
     */
    instanceOf = 109,

    /**
     * 关键字 as(在 TypeScript 1 新增)。
     */
    as = 110,

    /**
     * 关键字 is(在 TypeScript 1 新增)。
     */
    is = 111,

    // #endregion

    // #region 语句头(Statement Headers)

    /**
     * 分号(`;`)。
     */
    semicolon = 112,

    /**
     * 关键字 if。
     */
    if = 113,

    /**
     * 关键字 switch。
     */
    switch = 114,

    /**
     * 关键字 for。
     */
    for = 115,

    /**
     * 关键字 while。
     */
    while = 116,

    /**
     * 关键字 do。
     */
    do = 117,

    /**
     * 关键字 continue。
     */
    continue = 118,

    /**
     * 关键字 break。
     */
    break = 119,

    /**
     * 关键字 return。
     */
    return = 120,

    /**
     * 关键字 throw。
     */
    throw = 121,

    /**
     * 关键字 try。
     */
    try = 122,

    /**
     * 关键字 debugger。
     */
    debugger = 123,

    /**
     * 关键字 with。
     */
    with = 124,

    /**
     * 关键字 var。
     */
    var = 125,

    /**
     * 关键字 import(在 EcmaScript 5 新增)。
     */
    import = 126,

    /**
     * 关键字 let(在 EcmaScript 5 新增)。
     */
    let = 127,

    /**
     * 关键字 type(在 TypeScript 1 新增)。
     */
    type = 128,

    // #endregion

    // #region 其它语句(Other Statements)

    /**
     * 关键字 from(在 EcmaScript 5 新增)。
     */
    from = 129,

    /**
     * 关键字 implements(在 TypeScript 1 新增)。
     */
    implements = 130,

    /**
     * 关键字 package(在 TealScript 1 新增)。
     */
    package = 131,

    /**
     * 关键字 of(在 EcmaScript 5 新增)。
     */
    of = 132,

    /**
     * 关键字 to(在 TealScript 1 新增)。
     */
    to = 133,

    /**
     * 关键字 get。
     */
    get = 134,

    /**
     * 关键字 set。
     */
    set = 135,

    /**
     * 关键字 else。
     */
    else = 136,

    /**
     * 关键字 case。
     */
    case = 137,

    /**
     * 关键字 default。
     */
    default = 138,

    /**
     * 关键字 catch。
     */
    catch = 139,

    /**
     * 关键字 finally。
     */
    finally = 140,

    /**
     * 关键字 extends(在 EcmaScript 5 新增)。
     */
    extends = 141,

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
	void: TokenType.void,
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
	delete: TokenType.delete,
	in: TokenType.in,
	instanceOf: TokenType.instanceOf,
	as: TokenType.as,
	is: TokenType.is,
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
	type: TokenType.type,
	from: TokenType.from,
	implements: TokenType.implements,
	package: TokenType.package,
	of: TokenType.of,
	to: TokenType.to,
	get: TokenType.get,
	set: TokenType.set,
	else: TokenType.else,
	case: TokenType.case,
	default: TokenType.default,
	catch: TokenType.catch,
	finally: TokenType.finally,
	extends: TokenType.extends
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
	return token === TokenType.identifier ||
		token >= TokenType.undefined && token <= TokenType.double ||
		token >= TokenType.async && token <= TokenType.readonly ||
		token >= TokenType.namespace && token <= TokenType.await ||
		token >= TokenType.let && token <= TokenType.set;
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
		token === TokenType.let ||
		token === TokenType.implements || token === TokenType.package;
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
	return token >= TokenType.identifier && token <= TokenType.readonly ||
		token >= TokenType.namespace && token <= TokenType.typeof ||
		token === TokenType.openParen || token === TokenType.openBracket ||
		token === TokenType.lessThan ||
		token >= TokenType.let && token <= TokenType.set;
}

/**
 * 判断指定的标记是否可作为内置类型。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
export function isPredefinedType(token: TokenType) {
	return token >= TokenType.null && token <= TokenType.question;
}

/**
 * 判断指定的标记是否可作为表达式开头。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 * @generated
 */
export function isExpressionStart(token: TokenType) {
	return token >= TokenType.noSubstitutionTemplateLiteral && token <= TokenType.void ||
		token >= TokenType.async && token <= TokenType.readonly ||
		token >= TokenType.function && token <= TokenType.slashEquals ||
		token >= TokenType.let && token <= TokenType.set;
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
	return token === TokenType.void ||
		token >= TokenType.typeof && token <= TokenType.minusMinus;
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
	8/*TokenType.noSubstitutionTemplateLiteral*/: Precedence.member,
	9/*TokenType.templateHead*/: Precedence.member,
	37/*TokenType.asterisk*/: Precedence.multiplicative,
	38/*TokenType.question*/: Precedence.conditional,
	65/*TokenType.plus*/: Precedence.additive,
	66/*TokenType.minus*/: Precedence.additive,
	67/*TokenType.plusPlus*/: Precedence.postfix,
	68/*TokenType.minusMinus*/: Precedence.postfix,
	69/*TokenType.openParen*/: Precedence.functionCall,
	70/*TokenType.openBracket*/: Precedence.member,
	71/*TokenType.slash*/: Precedence.multiplicative,
	72/*TokenType.lessThan*/: Precedence.relational,
	75/*TokenType.asteriskAsterisk*/: Precedence.exponentiation,
	76/*TokenType.equals*/: Precedence.assignment,
	77/*TokenType.plusEquals*/: Precedence.assignment,
	78/*TokenType.minusEquals*/: Precedence.assignment,
	79/*TokenType.asteriskEquals*/: Precedence.assignment,
	80/*TokenType.percentEquals*/: Precedence.assignment,
	81/*TokenType.lessThanLessThanEquals*/: Precedence.assignment,
	82/*TokenType.greaterThanGreaterThanEquals*/: Precedence.assignment,
	83/*TokenType.greaterThanGreaterThanGreaterThanEquals*/: Precedence.assignment,
	84/*TokenType.ampersandEquals*/: Precedence.assignment,
	85/*TokenType.barEquals*/: Precedence.assignment,
	86/*TokenType.caretEquals*/: Precedence.assignment,
	87/*TokenType.asteriskAsteriskEquals*/: Precedence.assignment,
	88/*TokenType.dot*/: Precedence.member,
	89/*TokenType.dotDot*/: Precedence.member,
	90/*TokenType.questionDot*/: Precedence.member,
	91/*TokenType.ampersand*/: Precedence.bitwiseAnd,
	92/*TokenType.percent*/: Precedence.multiplicative,
	93/*TokenType.greaterThan*/: Precedence.relational,
	94/*TokenType.lessThanEquals*/: Precedence.relational,
	95/*TokenType.greaterThanEquals*/: Precedence.relational,
	96/*TokenType.equalsEquals*/: Precedence.equality,
	97/*TokenType.exclamationEquals*/: Precedence.equality,
	98/*TokenType.equalsEqualsEquals*/: Precedence.equality,
	99/*TokenType.exclamationEqualsEquals*/: Precedence.equality,
	100/*TokenType.lessThanLessThan*/: Precedence.shift,
	101/*TokenType.greaterThanGreaterThan*/: Precedence.shift,
	102/*TokenType.greaterThanGreaterThanGreaterThan*/: Precedence.shift,
	103/*TokenType.bar*/: Precedence.bitwiseOr,
	104/*TokenType.caret*/: Precedence.bitwiseXOr,
	105/*TokenType.ampersandAmpersand*/: Precedence.logicalAnd,
	106/*TokenType.barBar*/: Precedence.logicalOr,
	107/*TokenType.comma*/: Precedence.comma,
	108/*TokenType.in*/: Precedence.relational,
	109/*TokenType.instanceOf*/: Precedence.relational,
	110/*TokenType.as*/: Precedence.relational,
	111/*TokenType.is*/: Precedence.relational
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
	return token >= TokenType.semicolon && token <= TokenType.type;
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
