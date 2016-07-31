// TealScript 语法解析器
// 此文件可用于生成 parser.ts、nodes.ts、nodeVisitor.ts

// #region 解析

function parseSyntax(source: string, tokenNames: {}) {

    const lines = source.split(/\r\n?|\n/);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 忽略空行、注释、type、declare 开头的行。
        if (!line || /^(\/\/|\s*(type|declare)\b)/.test(line)) continue;



    }

    function parseHeader(line) {

    }

    function parseParam(line) {

    }

    function isPart(line) {
        return /^\s*_/.test(line);
    }

	/**
	 * 从指定的代码行中提取字段信息。
	 * @param production 所属的产生式。
	 * @param line 行源码。
	 */
    function parseCode(production: Production, line: string) {

        // _...
        if (/^\s*_/.test(line)) {
            const field: ProductionField = {};
            line.replace(/\/\/\s*(.+)$/, function (_, value) {
                field.comment = value.trim();
                return "";
            }).replace(/__/, (_) => {
                field.optional = true;
                return "_";
            }).replace(/^\s*_\('(.*?)'\)/, (all, token) => {
                return "_." + nameOf(token) + " = " + all;
            }).replace(/_\.(\w+)\s*=\s*(.*)/, (_, name, value) => {
                field.name = name;

                // _.x = read('x', 'x')
                if (/_\('/.test(value)) {
                    field.type = "number";
                    const tokens = value.replace(/,\s+/g, ",").replace(/^_\('/g, "").replace(/'\)$/g, "").split(",");
                    if (tokens.length > 1) {
                        field.tokens = tokens;
                        return `result.${field.name} = this.readToken(); // ${field.tokens.join("、")}`;
                    }
                    field.token = tokens[0];
                    return `result.${field.name} = this.expectToken(TokenType.${nameOf(field.token)});`;
                }

                // _.x = <'xx'>
                if (/<'\w'>/) {

                }

                // _.x = T()
                field.type = getWord(value);
                return _.replace("_", "result");
            });
        }

        // Initializer(_);
        if (line.indexOf("(_)") >= 0) {
            production.fields.push({
                inline: getWord(line)
            });
            return line.replace("_", "result");
        }

        return line;
    }

    function nameOf(token: string) {
        return (tokenNames[token] || token) + "Token";
    }

    function getWord(content) {
        return (/(\w+)/.exec(content) || [""])[0];
    }

    interface Production {
        fields: ProductionField[];
    }

    interface ProductionField {
        inline?: string;
        tokens?: string[];
        token?: string;
        name?: string;
        type?: string;
        optional?: boolean;
        comment?: string;
    }

}

// #endregion

// #region 标记

/**
 * 表示一个标记类型。
 */
const TokenType = {

    // #region 控制符(Control)

    unknown: '', // 未知标记

    endOfFile: 'EOF' && [1], // 文件已结束

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

};

// #endregion 标记

// #region 语法

/** 
 * 特殊标记：指定当前产生式的基类。
 * @param type 类型。
 */
declare function extend(type);

/** 
 * 特殊标记：表示当前产生式是指定类型的别名。
 * @param types 类型。
 */
declare function alias(...types);

/** 
 * 特殊标记：表示当前产生式是指定类型组成的列表。
 * @param type 列表元素类型。
 * @param allowEmpty 是否允许空列表。
 * @param openToken 列表开始标记。
 * @param closeToken 列表结束标记。
 * @param seperator 列表分割符。
 * @param continueParse 继续解析列表元素的函数。
 */
declare function list(type?, allowEmpty?: boolean, openToken?: string, closeToken?: string, seperator?: string, continueParse?);

/**
 * 特殊标记：表示当前产生式包含文档注释。
 */
declare function doc(_);

///**
// * 特殊标记：表示当前产生式由一个简单标记组成。
// * @param types 类型。
// */
//declare function simple(...types);

/**
 * 特殊标记：表示当前产生式。
 * - _('.') 表示为产生式添加类型为特定标记的标记字段。
 * - _.xx = read('.', ...) 表示为产生式添加类型为特定标记的 xx 字段。
 * - _.xx = T(...) 表示为产生式添加类型为 T 的 xx 字段。
 * - _.xx = /*T*\/foo(); 表示为产生式添加类型为 T 的 xx 字段。
 * - _.xx = list(...) 表示为产生式添加类型为列表的 xx 字段。
 * - XX(_) 表示为产生式添加其它产生式的字段。
 * 如果 _ 所在行缩进超过 1，则认为当前标记是可选的。
 */
declare var _;

/**
 * 特殊标记：表示当前的词法扫描器。
 */
declare var lexer;

/**
 * 特殊标记：表示当前的解析配置。
 */
declare var options;

/**
 * 特殊标记：表示读取下一个标记。
 * @param tokens 允许读取的标记类型。
 */
declare function read(...tokens: string[]);

/**
 * 特殊标记：表示判断并读取下一个标记。
 * @param token 允许读取的标记类型。
 */
declare function readIf(token: string);

/**
 * 特殊标记：表示读取指定的标记。
 */
declare function readToken(token: string);

/**
 * 特殊标记：表示报告错误。
 */
declare function error(location, message, ...args);

/**
 * 特殊标记：表示下一个标记类型。
 */
declare var peek: string;

/**
 * 特殊标记：表示下一个标记在当前行。
 */
declare var sameLine: boolean;

/**
 * 缓存标记状态。
 */
declare function stashSave();

/**
 * 恢复标记状态。
 */
declare function stashRestore(state);

/**
 * 清除标记状态。
 */
declare function stashClear(state);

declare var Precedence,
    isPredefinedType,
    isIdentifierName,
    isBindingElementStart,
    isArrayBindingElementStart,
    isObjectBindingElementStart,
    isKeyword,
    getPrecedence,
    isDeclarationStart,
    isExpressionStart,
    isStatementStart,
    isModifier,
    isBinaryOperator,
    isArgumentStart,
    isTypeNodeStart,
    isCaseLabelStart,
    isBindingNameStart,
    isUnaryOperator,
    isRightHandOperator,
    isPropertyNameStart,
    getTokenName;

//declare function Identifier(allowKeyword?);
//declare function Parameters();
//declare function Modifiers();
//declare function StringLiteral();
//declare function NumericLiteral();
//declare function PropertyName();
//declare function TypeAnnotation(_);
//declare function CommaOrSemicolon(_);
//declare function TypeParameters();
//declare function Parameters();
//declare function TypeArguments();
//declare function BlockStatement();
//declare function FunctionExpression(modifiers?);
//declare function ClassExpression();
//declare function FunctionBody(_);
//declare function Initializer(_, allowIn?);
//declare function Semicolon(_);
//declare function Condition(_);
//declare function FunctionTypeNode(typeParameters?, parameters?);
//declare function ArrowFunctionExpression(modifiers?, typeParameters?, parameters?, allowIn?);
//declare function ExpressionStatement(expression);
//declare function FunctionDeclaration();
//declare function BindingName();
//declare function EmbeddedStatement();
//type Modifiers = any;
//type Parameters = any;
//type TypeParameters = any;
//type Identifier = any;
//
//type Statement = any;
//type BlockStatement = any;
//type MemberCallExpression = any;
//type TemplateSpan = any;
//type TemplateLiteral = any;
//type StringLiteral = any;
//type VariableStatement = any;
//type ExpressionStatement = any;

function TypeNode(precedence = Precedence.any) { // 类型节点
    type TypeNode = any;
    let result: TypeNode;
    if (isPredefinedType(peek)) {
        result = function PredefinedTypeNode() { // 内置类型节点(`number`、`string`、...)
            _.type = read('any', 'number', 'boolean', 'string', 'symbol', 'void', 'never', 'this', 'null', 'undefined', 'char', 'byte', 'int', 'long', 'short', 'uint', 'ulong', 'ushort', 'float', 'double', '*', '?'); // 类型
        };
    } else {
        switch (peek) {
            //+ case 'identifier':
            //+ 	result = GenericTypeOrTypeReferenceNode;
            //+ 	break;
            case '(':
                result = function FunctionOrParenthesizedTypeNode(): any { // 函数或括号类型节点(`() => void`、`(x)`)
                    const savedState = stashSave();
                    const parameters = Parameters();
                    if (peek === '=>' || peek === ':') {
                        stashClear(savedState);
                        return FunctionTypeNode(undefined, parameters);
                    }
                    stashRestore(savedState);
                    return function ParenthesizedTypeNode() { // 括号类型节点(`(number)`)
                        read('(');
                        _.body = TypeNode; // 主体部分
                        read(')');
                    };
                }
                function FunctionTypeNode(typeParameters = null || TypeParameters, parameters = null || Parameters) { // 函数类型节点(`(x: number) => void`)
                    read('=>');
                    _.return = TypeNode;
                }
                break;
            case '[':
                result = function TupleTypeNode() { // 元祖类型节点(`[string, number]`)
                    list(TupleTypeElement, true, '[', ']', ',', isTypeNodeStart); // 元素列表
                    function TupleTypeElement() { // 元祖类型节点元素(`x`)
                        _.value = TypeNode(Precedence.assignment); // 值部分
                    }
                }
                break;
            case '{':
                result = function ObjectTypeNode() { // 对象类型节点(`{x: number}`)
                    _.elements = list(TypeMemberSignature, true, '{', '}');
                }
                break;
            case 'new':
                return function ConstructorTypeNode() { // 构造函数类型节点(`new () => void`)
                    read('new');
                    if (peek === '<') {
                        _.typeParameters = TypeParameters();
                    }
                    _.parameters = Parameters;
                    read('=>');
                    _.return = TypeNode;
                }
            case '<':
                return FunctionTypeNode(TypeParameters, Parameters);
            case 'typeof':
                result = function TypeQueryNode() { // 类型查询节点(`typeof x`) 
                    extend(TypeNode);
                    read('typeof');
                    _.operand = Expression(Precedence.postfix);
                }
                break;
            case '=>':
                return FunctionTypeNode();
            case 'numericLiteral':
            case 'stringLiteral':
            case 'true':
            case 'false':
                result = function LiteralTypeNode() { // 字面量类型节点(`"abc"`、`true`)
                    _.value = Expression(Precedence.primary);
                }
                break;
            default:
                result = function GenericTypeOrTypeReferenceNode(): any { // 泛型类型节点(`x<T>`)或类型引用节点(`x`)
                    const result = TypeReferenceNode;
                    function TypeReferenceNode() { // 类型引用节点(`x`)
                        extend(TypeNode);
                        if (isIdentifierName(peek)) {
                            _.value = read('identifier');  // 值部分
                        } else {
                            error(lexer.peek(), "Type expected. Unexpected token '{0}'.", getTokenName(peek));
                            _.end = _.start = lexer.current.end;
                            _.hasError = true;
                        }
                    }
                    if (sameLine && peek === '<') {
                        return GenericTypeNode(result);
                        function GenericTypeNode(target = TypeReferenceNode/*目标部分*/) { // 泛型类型节点(`Array<number>`)
                            _.typeArguments = TypeArguments() // 类型参数部分
                        }
                    }
                    return result;
                }
                break;
        }
    }
    while (getPrecedence(peek) >= precedence) {
        switch (peek) {
            case '.':
                result = QualifiedNameTypeNode(result);
                function QualifiedNameTypeNode(target = TypeNode/*目标部分*/) { // 限定名称类型节点(`"abc"`、`true`)
                    read('.');
                    _.argument = Identifier(true); // 参数部分
                }
                continue;
            case '[':
                if (sameLine) {
                    result = ArrayTypeNode(result);
                    function ArrayTypeNode(target = TypeNode) { // 数组类型节点(`T[]`)
                        read('[');
                        read(']');
                    }
                }
                continue;
            case '&':
            case '|':
            case 'is':
                result = BinaryTypeNode(result);
                function BinaryTypeNode(left = TypeNode/*左值部分*/) { // 双目表达式(x + y、x = y、...)
                    _.operator = read('&', '|', 'is'); // 运算类型
                    _.right = TypeNode(getPrecedence(result.operator) + 1); // 右值部分
                }
                continue;
        }
        return result;
    }
}

function TypeMemberSignature() { // 类型成员签名(`x： y`、`x() {...}`)
    alias(PropertySignature, FunctionSignature, ConstructSignature, IndexSignature, MethodSignature, AccessorSignature);
    switch (peek) {
        //+ case 'identifier':
        //+ 	break;
        case 'get':
        case 'set':
            const savedToken = lexer.current;
            lexer.read();
            if (isPropertyNameStart(peek)) {
                return AccessorSignature(savedToken.type === 'get' ? savedToken.start : undefined, savedToken.type === 'set' ? savedToken.start : undefined);
                function AccessorSignature(getToken = null || read('get'), setToken = null || read('set')) { // 访问器签名(`get x(): number`、`set x(value): void`)
                    doc(_);
                    _.name = PropertyName;
                    readIf('?');
                    _.parameters = Parameters;
                    TypeAnnotation(_);
                    CommaOrSemicolon(_);
                }
            }
            lexer.current = savedToken;
            break;
        case '[':
            let isIndexSignature: boolean;
            const savedToken2 = lexer.current;
            lexer.read();
            if (isIdentifierName(peek)) {
                lexer.read();
                isIndexSignature = peek === ':';
            }
            lexer.current = savedToken2;
            if (isIndexSignature) {
                return IndexSignature();
                function IndexSignature() { // 索引器声明(`[key: string]: string``)
                    doc(_);
                    read('[');
                    _.argument = Identifier;
                    TypeAnnotation(_);
                    read(']');
                    TypeAnnotation(_);
                    CommaOrSemicolon(_);
                }
            }
            break;
        case '(':
        case '<':
            return FunctionSignature();
            function FunctionSignature() { // 函数签名(`(): number`)
                doc(_);
                MethodOrConstructOrCallSignature(_);
            }
        case 'new':
            return ConstructSignature();
            function ConstructSignature() { // 构造函数签名(`new x(): number`)
                doc(_);
                read('new');
                MethodOrConstructOrCallSignature(_);
            }
    }
    const name = PropertyName();
    const questionToken = peek === '?' ? read('?') : undefined;
    switch (peek) {
        case '(':
        case '<':
            return MethodSignature(name, questionToken);
            function MethodSignature(name = PropertyName(), questionToken = null || read('?')) {  // 方法签名(`x(): number`)
                doc(_);
                MethodOrConstructOrCallSignature(_);
            }
        default:
            return PropertySignature(name, questionToken);
            function PropertySignature(name = PropertyName()/* 名字部分 */, questionToken = null || read('?')) { // 属性签名(`x: number`)
                doc(_);
                TypeAnnotation(_);
                CommaOrSemicolon(_);
            }
    }
    function MethodOrConstructOrCallSignature(_) { // 方法(`x(): number`)或构造函数(`new x(): number`)或函数(`(): number`)签名
        CallSignature(_);
        CommaOrSemicolon(_);
    }
}

function TypeParameters() { // 类型参数列表(`<T>`)
    list(TypeParameterDeclaration, false, '<', '>', ',', isIdentifierName);
    function TypeParameterDeclaration() { // 类型参数声明(`T`、`T extends R`)
        _.name = Identifier;
        if (peek === 'extends') {
            read('extends');
            _.extends = TypeNode;
        }
    }
}
function TypeArguments() {// 类型参数列表(`<number>`)
    list(TypeArgument, false, '<', '>', ',', isTypeNodeStart);
    function TypeArgument() { // 类型参数(`number`)
        _.value = TypeNode(Precedence.assignment); // 值部分
    }
}
function Parameters(): any { // 参数列表(`(x, y)`)
    list(ParameterDeclaration, true, '(', ')', ',', isBindingElementStart);
    function ParameterDeclaration() { // 参数声明(`x`、`x?: number`)
        const modifiers = Modifiers();
        if (modifiers) {
            _.modifiers = /*Modifiers*/modifiers;
        }
        readIf('...');
        _.name = BindingName;
        readIf('?');
        TypeAnnotation(_);
        Initializer(_);
    }
}

function BindingName() { // 绑定名称(`x`, `[x]`, `{x: x}`)
    alias(Identifier, ArrayBindingPattern, ObjectBindingPattern);
    switch (peek) {
        case '[':
            return ArrayBindingPattern();
            function ArrayBindingPattern() { // 数组绑定模式项(`[x]`)
                _.elements = list(ArrayBindingElement, true, '[', ']', ',', isArrayBindingElementStart);
                function ArrayBindingElement() { // 数组绑定模式项(`x`)
                    if (peek !== ',' && peek !== ']') {
                        readIf('...');
                        _.value = BindingName;
                        Initializer(_);
                    }
                }
            }
        case '{':
            return ObjectBindingPattern();
            function ObjectBindingPattern() { // 对象绑定模式项(`{x: x}`)
                _.elements = list(ObjectBindingElement, true, '{', '}', ',', isObjectBindingElementStart);
                function ObjectBindingElement() { // 对象绑定模式项(`x`)
                    const keyToken = peek;
                    _.key = PropertyName;
                    if (peek === ':') {
                        read(':');
                        _.value = BindingName;
                    } else if (!isIdentifierName(keyToken)) {
                        readToken(':');
                    }
                    Initializer(_);
                }
            }
        default:
            return Identifier();
    }
}
function TypeAnnotation(_) { // 类型注解(`: number`)
    if (peek === ':') {
        read(':');
        _.type = TypeNode; // 类型部分
    }
}
function Initializer(_, allowIn?) { // 初始值
    if (peek === '=') {
        read('=');
        _.initializer = Expression(Precedence.assignment, allowIn); // 初始值部分
    }
}
function PropertyName() { // 属性名称(`xx`、`"xx"`、`0`、`[xx]`)
    alias(Identifier, NumericLiteral, StringLiteral, ComputedPropertyName);
    switch (peek) {
        //+ case 'identifier':
        //+ 	return Identifier(true);
        case 'stringLiteral':
            return StringLiteral();
        case 'numericLiteral':
            return NumericLiteral();
        case '[':
            return ComputedPropertyName();
            function ComputedPropertyName() { // 已计算的属性名(`[1]`)
                read('[');
                _.body = Expression(Precedence.assignment);
                read(']');
            }
        default:
            return Identifier(true);
    }
}

function CommaOrSemicolon(_) { // 对象成员尾部
    switch (peek) {
        case ';':
            read(';');
        case ',':
            read(',');
            break;
        default:
            if (sameLine) {
                error({ start: lexer.current.end, end: lexer.current.end }, "Missing ';' after property.");
            }
            break;
    }
}

function Expression(precedence = Precedence.any/*允许解析的最低操作符优先级*/, allowIn: boolean = true/*是否解析 in 表达式*/) { // 表达式
    type Expression = any;
    let result: Expression;
    switch (peek) {
        //+ case 'identifier':
        //+    result = ArrowFunctionOrGenericExpressionOrIdentifier(allowIn);
        //+    break;
        case 'this':
        case 'null':
        case 'true':
        case 'false':
        case 'super':
            result = function SimpleLiteral() { // 简单字面量(`null`、`true`、`false`、`this`、`super`)
                _.type = read('this', 'null', 'true', 'false', 'super'); // 类型
            }
            break;
        case '(':
            result = function ArrowFunctionOrParenthesizedExpression(allowIn?): any { // 箭头或括号表达式(`()=>...`、`(x)`)
                const savedState = stashSave();
                const parameters = Parameters();
                if (sameLine && (peek === '=>' || peek === ':' || peek === '{')) {
                    stashClear(savedState);
                    return ArrowFunctionExpression(undefined, undefined, parameters, allowIn);
                }
                stashRestore(savedState);
                return function ParenthesizedExpression() { // 括号表达式(`(x)`)
                    read('(');
                    _.body = Expression; // 主体部分
                    read(')');
                }
            }
            break;
        case 'numericLiteral':
            result = NumericLiteral;
            break;
        case 'stringLiteral':
        case 'noSubstitutionTemplateLiteral':
            result = StringLiteral;
            break;
        case '[':
            result = function ArrayLiteral() { // 数组字面量(`[x, y]`)
                _.elements = list(ArrayLiteralElement, true, '[', ']', isExpressionStart); // 元素列表
                function ArrayLiteralElement() { // 数组字面量元素(`x`)
                    if (peek !== ',' && peek !== ']') {
                        readIf('...');
                        _.value = Expression(Precedence.assignment);
                    }
                }
            }
            break;
        case '{':
            result = function ObjectLiteral() { // 对象字面量(`{x: y}`)
                _.elements = list(ObjectLiteralElement, true, '{', '}', ',', isPropertyNameStart);
                function ObjectLiteralElement() { // 对象字面量元素(`x: y`、`x() {...}`)
                    alias(ObjectPropertyDeclaration, ObjectMethodDeclaration, ObjectAccessorDeclaration);
                    const modifiers = Modifiers;
                    switch (peek) {
                        //+ case 'identifier':
                        //+ 	break;
                        case 'get':
                        case 'set':
                            const savedToken = lexer.current;
                            lexer.read();
                            if (isPropertyNameStart(peek)) {
                                return ObjectAccessorDeclaration(modifiers, savedToken.type === 'get' ? savedToken.start : undefined, savedToken.type === 'set' ? savedToken.start : undefined);
                                function ObjectAccessorDeclaration(modifiers = null || Modifiers, getToken = null || read('get'), setToken = null || read('set')) { // 访问器声明(`get x() {...}`、`set x(value) {...}`)
                                    doc(_);
                                    _.name = PropertyName;
                                    CallSignature(_);
                                    FunctionBody(_);
                                    CommaOrSemicolon(_);
                                }
                            }
                            lexer.current = savedToken;
                            break;
                        case '*':
                            return ObjectMethodDeclaration(modifiers, readToken('*'), PropertyName);
                    }
                    const name = PropertyName;
                    switch (peek) {
                        case '(':
                        case '<':
                            return ObjectMethodDeclaration(modifiers, undefined, name);
                            function ObjectMethodDeclaration(modifiers?, _1 = null || read('*'), name = PropertyName) { // 方法声明(`x() {...}`)
                                doc(_);
                                CallSignature(_);
                                FunctionBody(_);
                                CommaOrSemicolon(_);
                            }
                        default:
                            return ObjectPropertyDeclaration(modifiers, name);
                            function ObjectPropertyDeclaration(modifiers?, key = PropertyName) { // 属性声明(`x: y`)
                                doc(_);
                                type MemberCallExpression = any;
                                if (peek === ':' || peek === '=') {
                                    if (peek === ':') {
                                        read(':');
                                    } else {
                                        read('=');
                                    }
                                    _.value = Expression(Precedence.assignment);
                                } else if (key.constructor === Identifier ? !isIdentifierName(getTokenName(<Identifier>key).value) :
                                    key.constructor === MemberCallExpression ? !isIdentifierName(getTokenName(<MemberCallExpression>key).argument) :
                                        true) {
                                    readToken(':');
                                    _.hasError = true;
                                }
                                CommaOrSemicolon(_);
                            }
                    }
                }
            }
            break;
        case 'function':
            result = FunctionExpression;
            break;
        case 'new':
            result = function NewTargetOrNewExpression() { // new.target(`new.target`) 或 new 表达式(`new x()`)
                const newToken = read('new');
                if (peek === '.') {
                    return function NewTargetExpression(newToken = read('new')) { // new.target 表达式(`new.target`)
                        read('.');
                        if (peek === 'identifier' && lexer.peek().value === "target") {
                            _.target = read('unknown');
                        } else {
                            error(lexer.peek(), "'target' expected; Unexpected token '{0}'.", getTokenName(peek));
                            _.hasError = true;
                        }
                    }
                }
                return function NewExpression(newToken = read('new')) { // new 表达式(`new x()`、`new x`)
                    _.target = Expression(Precedence.member);
                    if (peek === '(') {
                        _.arguments = Arguments;
                    }
                }
            }
            break;
        case '/':
        case '/=':
            result = function RegularExpressionLiteral() { // 正则表达式字面量(/abc/)
                //_.start = lexer.readAsRegularExpressionLiteral().start;
                _.value = read('regularExpressionLiteral');
                //_.flags = token.value.flags; // 标志部分;
                //_.end = token.end;
            }
            break;
        case 'templateHead':
            result = TemplateLiteral;
            function TemplateLiteral() { // 模板字面量(`\`abc\``)
                _.spans = list(TemplateSpan || Expression); // 组成部分列表
                while (true) {
                    result.spans.push(TemplateSpan());
                    function TemplateSpan() { // 模板文本区块(`\`abc${`、`}abc${`、`}abc\``)
                        //_.start = lexer.read().start;
                        _.value = read('templateMiddle');
                        //_.end = lexer.current.start;
                    }
                    result.spans.push(Expression());
                    if (peek !== '}') {
                        readToken('}');
                        break;
                    }
                    if (lexer.readAsTemplateMiddleOrTail().type === 'templateTail') {
                        result.spans.push(TemplateSpan());
                        break;
                    }
                }
            }
            break;
        case '<':
            result = function ArrowFunctionOrTypeAssertionExpression(allowIn?): any { // 箭头函数(`<T>() => {}`)或类型确认表达式(`<T>fn`)
                const savedState = stashSave();
                const typeParameters = TypeParameters();
                const parameters = peek === '(' ? Parameters() : isIdentifierName(peek) ? Identifier() : undefined;
                if (parameters && sameLine && (peek === '=>' || peek === ':' || peek === '{')) {
                    stashClear(savedState);
                    return ArrowFunctionExpression(undefined, typeParameters, parameters, allowIn);
                }
                stashRestore(savedState);
                return function TypeAssertionExpression() { // 类型确认表达式(<T>xx)
                    read('<');
                    _.type = TypeNode;
                    read('>');
                    _.operand = Expression(Precedence.postfix);
                }
            }
            break;
        case 'yield':
            result = function YieldExpression(allowIn?) { // yield 表达式(`yield xx`)
                read('yield');
                if (sameLine && peek === '*') {
                    read('*');
                }
                if (sameLine && isExpressionStart(peek)) {
                    _.operand = Expression(Precedence.assignment, allowIn);
                }
            }
            break;
        case 'await':
            result = function AwaitExpressionOrIdentifier(allowIn) { // await 表达式(`await xx`)或标识符
                const savedToken = lexer.current;
                const awaitToken = read('await');
                if (sameLine && isExpressionStart(peek)) {
                    return function AwaitExpression(awaitToken = read('await'), allowIn?) { // await 表达式(`await xx`)
                        _.operand = Expression(Precedence.assignment, allowIn);
                    }
                }
                lexer.current = savedToken;
                return Identifier;
            }
            break;
        case 'class':
            result = ClassExpression();
            break;
        case 'async':
            result = function AsyncFunctionExpressionOrIdentifier(allowIn?) { // 异步函数表达式或标识符
                const savedState = stashSave();
                const modifiers = Modifiers;
                const typeParameters = sameLine && peek === '<' ? TypeParameters() : undefined;
                if (sameLine) {
                    if (peek === 'function') {
                        return FunctionExpression(modifiers);
                    }
                    if ((peek === '(' || isIdentifierName(peek))) {
                        const parameters = peek === '(' ? Parameters() : Identifier();
                        if (sameLine && (peek === '=>' || peek === ':' || peek === '{')) {
                            stashClear(savedState);
                            return ArrowFunctionExpression(modifiers, typeParameters, parameters, allowIn);
                        }
                    }
                }
                stashRestore(savedState);
                return Identifier();
            }
            break;
        case '=>':
            result = ArrowFunctionExpression(undefined, undefined, undefined, allowIn);
            break;
        default:
            if (isUnaryOperator(peek)) {
                result = function UnaryExpression() { // 一元运算表达式(`+x`、`typeof x`、...)
                    _.operator = read('delete', 'void', 'typeof', '+', '-', '~', '!', '++', '--', '...'); // 操作符
                    _.operand = Expression(Precedence.postfix); // 操作数
                }
                break;
            }
            if (isIdentifierName(peek)) {
                result = ArrowFunctionOrGenericExpressionOrIdentifier(allowIn);
                function ArrowFunctionOrGenericExpressionOrIdentifier(allowIn?) { // 箭头函数或泛型表达式或标识符(`x => y`、`x<T>`、`x`)
                    let result: any = Identifier;
                    switch (peek) {
                        case '=>':
                            result = ArrowFunctionExpression(undefined, undefined, result, allowIn);
                            break;
                        case '<':
                            if (sameLine) {
                                const savedState = stashSave();
                                const typeArguments = TypeArguments;
                                if (lexer.current === '>' && (isBinaryOperator(peek) || !isUnaryOperator(peek))) {
                                    stashClear(savedState);
                                    result = GenericExpression(result, typeArguments);
                                    function GenericExpression(target = Identifier/*目标部分*/, typeArguments = TypeArguments/*类型参数部分*/) { // 泛型表达式(`x<number>`)
                                    }
                                } else {
                                    stashRestore(savedState);
                                }
                            }
                            break;
                    }
                    return result;
                }
                break;
            }
            error(lexer.peek(), isKeyword(peek) ? "Expression expected; '{0}' is a keyword." : "Expression expected; Unexpected token '{0}'.", getTokenName(peek));
            return MissingExpression(isStatementStart(peek) ? lexer.current.end : lexer.read().type);
            function MissingExpression(start: number/*标记的开始位置*/) { // 错误的表达式占位符
                _.start = start;
                _.end = lexer.current.end;
            }
    }
    while (getPrecedence(peek) >= precedence) {
        switch (peek) {
            case '.':
                result = MemberCallExpression(result);
                continue;
            //+ case '=':
            //+ 	break;
            case '(':
                result = FunctionCallExpression(result);
                function FunctionCallExpression(target = Expression()) { // 函数调用表达式(`x()`)
                    _.arguments = Arguments;
                }
                continue;
            case '[':
                result = IndexCallExpression(result);
                function IndexCallExpression(target = Expression()) { // 索引调用表达式(`x[y]`)
                    read('[');
                    _.argument = Expression;
                    read(']');
                }
                continue;
            case '?':
                result = ConditionalExpression(result, allowIn);
                function ConditionalExpression(condition = Expression(), allowIn?) { // 条件表达式(`x ? y : z`)
                    read('?');
                    _.then = Expression(Precedence.assignment) // 则部分
                    read(':');
                    _.else = Expression(Precedence.assignment, allowIn); // 否则部分
                }
                continue;
            case '++':
            case '--':
                if (!sameLine) {
                    return result;
                }
                result = PostfixExpression(result);
                function PostfixExpression(operand = Expression(Precedence.leftHandSide)) { // 后缀表达式(`x++`、`x--`)
                    _.operator = read('++', '--');
                }
                continue;
            case 'noSubstitutionTemplateLiteral':
                result = TemplateCallExpression(result, StringLiteral);
                continue;
            case 'templateHead':
                result = TemplateCallExpression(result, TemplateLiteral);
                function TemplateCallExpression(target = Expression, argument = TemplateLiteral || StringLiteral) { // 模板调用表达式(`x\`abc\``)
                }
                continue;
            case '>':
                const savedToken = lexer.current;
                lexer.readAsGreaterThanTokens();
                lexer.current = savedToken;
                break;
            case 'in':
                if (allowIn === false) {
                    return result;
                }
                break;
        }
        result = BinaryExpression(result, allowIn);
        function BinaryExpression(left = Expression/*左值部分*/, allowIn?) { // 双目表达式(x + y、x = y、...)
            _.operator = read(',', '*=', '/=', '%=', '+=', '‐=', '<<=', '>>=', '>>>=', '&=', '^=', ',=', '**=', '=', ',,', '&&', ',', '^', '&', '==', '!=', '===', '!==', '<', '>', '<=', '>=', 'instanceof', 'in', '<<', '>>', '>>>', '+', '-', '*', '/', '%', '**');; // 运算类型
            _.right = Expression(getPrecedence(result.operator) + (isRightHandOperator(_.operator) ? 0 : 1), allowIn); // 右值部分
            return result;
        }
    }
    return result;
    function Arguments() { // 函数调用参数列表
        list(Argument, true, undefined, undefined, ',', isArgumentStart);
        function Argument() { // 函数调用参数(`x`)
            readIf('...');
            _.value = Expression(Precedence.assignment);
        }
    }
    function ArrowFunctionExpression(modifiers = null || Modifiers, typeParameters = null || TypeParameters(), parameters = null || Parameters || Identifier/*参数部分*/, allowIn?) { // 箭头函数表达式(`x => {...}`、`(x, y) => {...}`)。
        if (parameters.constructor !== Identifier) {
            TypeAnnotation(_);
        }
        read('=>');
        _.body = /*BlockStatement | Expression*/peek === '{' ? BlockStatement() : Expression(Precedence.assignment, allowIn);
    }
}

function MemberCallExpression(target = Expression()/*目标部分*/) { // 成员调用表达式(x.y)
    read('.');
    _.argument = Identifier(true); // 参数部分
}

function NumericLiteral() { // 数字字面量(`1`)
    _.value = read('numericLiteral');
}
function StringLiteral() { // 字符串字面量(`'abc'`、`"abc"`、`\`abc\``)
    _.value = read('stringLiteral');
}

type Identifier = any;
function Identifier(allowKeyword = false/*是否允许解析关键字*/) { // 标识符(`x`)
    extend(Expression);
    let isIdentifier = isIdentifierName(peek);
    if (!isIdentifier && allowKeyword && isKeyword(peek)) {
        isIdentifier = true;
        if (!sameLine && isStatementStart(peek)) {
            const savedState = stashSave();
            Statement();
            if (!savedState.errors.length) {
                isIdentifier = false;
            }
        }
    }
    if (isIdentifier) {
        _.value = read('identifier'); // 值部分
    } else {
        error(lexer.peek(), isKeyword(peek) ? "Identifier expected; Keyword '{0}' cannot be used as an identifier." : "Identifier expected; Unexpected token '{0}'.", getTokenName(peek));
        _.end = _.start = lexer.current.end;
    }
}

function Statement() { // 语句
    switch (peek) {
        //+ case 'identifier':
        //+ 	return LabeledOrExpressionStatement(Identifier());
        case '{':
            return BlockStatement();
        case 'var':
        case 'const':
            return VariableStatement();
        case 'let':
            return VariableOrExpressionStatement();
            function VariableOrExpressionStatement(allowIn?) { // 变量声明(`let x`)或表达式语句(`let(x)`)
                const savedToken = lexer.current;
                switch (peek) {
                    case 'let':
                    case 'var':
                    case 'const':
                        lexer.read();
                        const isBindingName = isBindingNameStart(peek);
                        lexer.current = savedToken;
                        if (isBindingName) {
                            return VariableStatement(allowIn);
                        }
                        break;
                }
                return ExpressionStatement(Expression(Precedence.any, allowIn));
            }
        case 'function':
            return FunctionDeclaration();
        case 'if':
            return function IfStatement() { // if 语句(`if (x) ...`)
                read('if');
                Condition(_);
                _.then = EmbeddedStatement;
                if (peek === 'else') {
                    read('else');
                    _.else = EmbeddedStatement;
                }
            }
        case 'for':
            return function ForOrForInOrForOfOrForToStatement() { // for 或 for..in 或 for..of 或 for..to 语句
                const forToken = read('for');
                const openParanToken = peek === '(' || options.allowMissingParenthese === false ? read('(') : undefined;
                const initializer: any = peek === ';' ? undefined : VariableOrExpressionStatement(false);
                switch (peek) {
                    //+ case ';':
                    //+    return ForStatement(forToken, openParan, initializer);
                    case 'in':
                        return function ForInStatement(forToken = read('for'), openParanToken = null || read('('), initializer = null || VariableStatement || ExpressionStatement) { // for..in 语句(`for(var x in y) ...`)
                            read('in');
                            _.condition = Expression;
                            if (openParanToken != undefined) {
                                read(')');
                            }
                            _.body = EmbeddedStatement;
                        }
                    case 'of':
                        return function ForOfStatement(forToken = read('for'), openParanToken = null || read('('), initializer = null || VariableStatement || ExpressionStatement) { // for..of 语句(`for(var x of y) ...`)
                            read('of');
                            _.condition = Expression;
                            if (openParanToken != undefined) {
                                read(')');
                            }
                            _.body = EmbeddedStatement;
                        }
                    case 'to':
                        return function ForToStatement(forToken = read('for'), openParanToken = null || read('('), initializer = null || VariableStatement || ExpressionStatement) { // for..to 语句(`for(var x = 0 to 10) ...`)
                            read('to');
                            _.condition = Expression;
                            if (openParanToken != undefined) {
                                read(')');
                            }
                            _.body = EmbeddedStatement;
                        }
                    default:
                        return function ForStatement(forToken = read('for'), openParanToken = null || read('('), initializer = null || VariableStatement || ExpressionStatement) { // for 语句(`for(var i = 0; i < 9 i++) ...`)
                            _.firstSemicolon = read(';'); // 条件部分中首个分号
                            if (peek !== ';') {
                                _.condition = Expression;
                            }
                            _.secondSemicolon = ';'; // 条件部分中第二个分号
                            if (openParanToken == undefined ? isExpressionStart(peek) : peek !== ')') {
                                _.iterator = Expression;
                            }
                            if (openParanToken != undefined) {
                                read(')');
                            }
                            _.body = EmbeddedStatement;
                        }
                }
            }
        case 'while':
            return function WhileStatement() { // while 语句(`while(x) ...`)
                read('while');
                Condition(_);
                _.body = EmbeddedStatement;
            }
        case 'switch':
            return function SwitchStatement() { // switch 语句(`switch(x) {...}`)
                if (options.allowMissingSwitchCondition === false || peek !== '{') {
                    Condition(_);
                }
                _.cases = list(CaseOrDefaultClause, true, '{', '}');
                function CaseOrDefaultClause() { // case(`case x: ...`) 或 default(`default: ...`) 分支
                    switch (peek) {
                        case 'case':
                            return function CaseClause() { // case 分支(`case x: ...`)
                                read('case');
                                _.labels = list(CaseClauseLabel, false, undefined, undefined, ',', isCaseLabelStart); // 标签列表
                                function CaseClauseLabel() { // case 分支标签(`case x: ...`)
                                    if (peek === 'else') {
                                        read('else');
                                    } else {
                                        _.label = Expression(Precedence.assignment);
                                    }
                                }
                                read(':');
                                _.statements = list(/*Statement*/CaseStatement);
                            }
                        case 'default':
                            return function DefaultClause() { // default 分支(`default: ...`)
                                read('default');
                                read(':');
                                _.statements = list(/*Statement*/CaseStatement);
                            }
                        default:
                            error(lexer.peek(), "'case' or 'default' expected; Unexpected token '{0}'.", getTokenName(peek));
                            return;
                    }
                    function CaseStatement() { // case 段语句
                        switch (peek) {
                            case 'case':
                            case 'default':
                            case '}':
                            case 'endOfFile':
                                return;
                            default:
                                return Statement();
                        }
                    }
                }
            }
        case 'do':
            return function DoWhileStatement() { // do..while 语句(`do ... while(x)`)
                read('do');
                _.body = EmbeddedStatement;
                read('while');
                Condition(_);
                Semicolon(_);
            }
        case 'break':
            return BreakStatement;
            function BreakStatement() { // break 语句(`break xx`)
                read('break');
                BreakOrContinueStatement(_);
            }
        case 'continue':
            return ContinueStatement;
            function ContinueStatement() { // continue 语句(`continue xx`)
                read('continue');
                BreakOrContinueStatement(_);
            }
            function BreakOrContinueStatement(_: any = BreakStatement || ContinueStatement) { // break 或 continue语句(`break xx;`、`continue xx`)
                if (!Semicolon(_)) {
                    _.label = Identifier;
                    Semicolon(_);
                }
            }
        case 'return':
            return function ReturnStatement() { // return 语句(`return x`)
                read('return');
                if (!Semicolon(_)) {
                    _.value = Expression;
                    Semicolon(_);
                }
            }
        case 'throw':
            return function ThrowStatement() { // throw 语句(`throw x`)
                read('throw');
                if (!Semicolon(_)) {
                    _.value = Expression;
                    !Semicolon(_);
                }
            }
        case 'try':
            return function TryStatement() { // try 语句(`try {...} catch(e) {...}`)
                read('try');
                _.try = EmbeddedStatement;
                if (peek === 'catch') {
                    _.catch = function CatchClause() { // catch 分句(`catch(e) {...}`)
                        read('catch');
                        const hasParan = peek === '(';
                        if (hasParan || options.allowMissingParenthese === false) {
                            _('(');
                        }
                        if (isBindingNameStart(peek)) {
                            _.variable = BindingName;
                            if (peek === ':') {
                                error(peek, "Catch variable cannot have a type annotation; Unexpected token ':'.");
                                lexer.read();
                                if (isTypeNodeStart(peek)) {
                                    TypeNode;
                                }
                            }
                        }
                        if (hasParan) {
                            _(')');
                        }
                        _.body = EmbeddedStatement;
                    }
                }
                if (peek === 'finally') {
                    _.finally = function FinallyClause() { // finally 分句(`finally {...}`)
                        read('finally');
                        _.body = EmbeddedStatement;
                    }
                }
                if (options.allowSimpleTryBlock === false && !_.catch && !_.finally) {
                    error(lexer.peek(), "'catch' or 'finally' expected. Unexpected token '{0}'.", getTokenName(peek));
                }
            }
        case 'debugger':
            return function DebuggerStatement() { // debugger 语句(`debugger`)
                read('debugger');
                Semicolon(';');
            }
        case ';':
            return EmptyStatement();
            function EmptyStatement() {
                ; // 空语句(``)
                Semicolon(_);
            }
        case 'endOfFile':
            return function MissingStatement() { // 缺少语句
                error(lexer.peek(), "Statement Or Declaration expected. Unexpected end of file.");
            }
        case 'with':
            return function WithStatement() { // with 语句(`with (x) ...`)
                read('with');
                const hasParan = peek === '(';
                if (hasParan) {
                    _('(');
                }
                _.value = VariableOrExpressionStatement;
                if (hasParan) {
                    _(')');
                }
                _.body = EmbeddedStatement;
            }
        case 'import':
            return ImportAssignmentOrImportDeclaration();
        case 'export':
            return ExportAssignmentOrExportDeclaration();
        case 'type':
            return TypeAliasDeclaration();
        //+ case 'class':
        //+ 	return ClassDeclaration();
        default:
            if (isDeclarationStart(peek)) {
                return DeclarationOrExpressionStatement();
            }
            return LabeledOrExpressionStatement(Expression());
            function LabeledOrExpressionStatement(parsed = Expression) { // 表达式或标签语句
                if (parsed.constructor === Identifier && peek === ':') {
                    return LabelledStatement(<Identifier>parsed);
                    function LabelledStatement(label = Identifier()) { // 标签语句(`x: ...`)
                        doc(_);
                        read(':');
                        _.statement = Statement; // 主体部分
                    }
                }
                return ExpressionStatement(parsed);
            }
    }
    function Condition(_) { // 条件表达式
        const hasParan = peek === '(';
        if (hasParan || options.allowMissingParenthese === false) {
            read('(');
        }
        _.condition = Expression;
        if (hasParan) {
            read(')');
        }
    }
    function EmbeddedStatement() { // 内嵌语句
        alias(Statement);
        return Statement;
    }
}

function VariableStatement(modifiers?, allowIn?) { // 变量声明语句(`var x`、`let x`、`const x`)
    _.type = read('var', 'let', 'const');
    _.variables = list(/*VariableDeclaration*/allowIn !== false ? VariableDeclaration : () => VariableDeclaration(false), undefined, undefined, ',', isBindingNameStart);
    function VariableDeclaration(allowIn?) { // 变量声明(`x = 1`、`[x] = [1]`、`{a: x} = {a: 1}`)
        _.mame = BindingName;
        TypeAnnotation(_);
        Initializer(_, allowIn);
    }
}
function ExpressionStatement(expression = Expression()/*表达式部分*/) { // 表达式语句(`x()`)
    Semicolon(_);
}

function BlockStatement() { // 语句块(`{...}`)
    _.statements = list(Statement, true, '{', '}');
}

function Semicolon(_) { // 分号
    switch (this.lexer.peek().type) {
        case ';':
            readIf(';');
            return true;
        case '}':
        case 'endOfFile':
            if (this.options.allowMissingSemicolon !== false) {
                return true;
            }
            break;
    }
    error({ start: lexer.current.end, end: lexer.current.end }, "Missing ';' after statement.");
    return false;
}

function Declaration() { // 声明
    extend(Statement);
}

function DeclarationOrExpressionStatement() { // 声明或表达式语句
    const savedState = stashSave();
    const decorators = Decorators();
    const modifiers = Modifiers();
    switch (peek) {
        case 'function':
            stashClear(savedState);
            return FunctionDeclaration(decorators, modifiers);
        case 'class':
            stashClear(savedState);
            return ClassDeclaration(decorators, modifiers);
        case 'interface':
            stashClear(savedState);
            return InterfaceDeclaration(decorators, modifiers);
        case 'enum':
            stashClear(savedState);
            return EnumDeclaration(decorators, modifiers);
        case 'namespace':
            stashClear(savedState);
            return NamespaceDeclaration(decorators, modifiers);
        case 'module':
            stashClear(savedState);
            return ModuleDeclaration(decorators, modifiers);
        case 'extends':
            stashClear(savedState);
            return ExtensionDeclaration(decorators, modifiers);
        default:
            stashRestore(savedState);
            return ExpressionStatement(Expression());
    }
}
function Decorators() { // 修饰器列表
    type NodeList<T> = any;
    type Decorator = any;
    let result: NodeList<Decorator>;
    while (peek === '') {
        if (!result) result = list(Decorator);
        result.push(Decorator());
    }
    return result;
    function Decorator() { // 修饰器(`x`)
        read('');
        _.body = Expression(Precedence.leftHandSide);
    }
}
function Modifiers() { // 修饰符列表
    type NodeList<T> = any;
    type Modifier = any;
    let result: NodeList<Modifier>;
    while (isModifier(peek)) {
        const savedToken = lexer.current;
        const modifier: any = Modifier;
        switch (modifier.type) {
            case 'export':
                if (!result) result = list(Modifier);
                result.push(modifier);
                if (peek === 'default') {
                    result.push(Modifier);
                }
                continue;
            case 'const':
                if (peek === 'enum') {
                    if (!result) result = list(Modifier);
                    result.push(modifier);
                    continue;
                }
                break;
            default:
                if (sameLine) {
                    if (!result) result = list(Modifier);
                    result.push(modifier);
                    continue;
                }
                break;
        }
        lexer.current = savedToken;
        break;
    }
    return result;
    function Modifier() { // 修饰符(`static`、`private`、...)
        _.type = read('export', 'default', 'declare', 'const', 'static', 'abstract', 'readonly', 'async', 'public', 'protected', 'private');
    }
}
function FunctionDeclaration(decorators = null || Decorators, modifiers = null || Modifiers) { // 函数声明(`function fn() {...}`、`function *fn() {...}`)
    FunctionDeclarationOrExpression(_, modifiers);
}
function FunctionExpression(modifiers = null || Modifiers) { // 函数表达式(`function () {}`)
    FunctionDeclarationOrExpression(_, modifiers);
}
function FunctionDeclarationOrExpression(_: any = FunctionDeclaration || FunctionExpression/* 解析的目标节点 */, modifiers = null || Modifiers) { // 函数声明或表达式
    doc(_);
    read('function');
    readIf('*');
    if (isIdentifierName(peek)) {
        _.name = Identifier;
    }
    TypeAnnotation(_);
    CallSignature(_);
    FunctionBody(_);
}
function CallSignature(_) { // 函数签名(`(): number`)
    if (peek === '<') {
        _.typeParameters = TypeParameters();
    }
    _.parameters = Parameters;
    TypeAnnotation(_);
}
function FunctionBody(_) { // 函数主体(`{...}`、`=> xx`、``)
    switch (peek) {
        case '{':
            _.body = /*BlockStatement | Expression*/BlockStatement;
            break;
        case '=>':
            read('=>');
            _.body = /*BlockStatement | Expression*/Expression(Precedence.assignment);
            break;
        default:
            Semicolon(_);
            break;
    }
}
function ClassDeclaration(decorators = null || Decorators, modifiers = null || Modifiers) { // 类声明(`class xx {}`)
    ClassDeclarationOrExpression(_);
}
function ClassExpression() { // 类表达式(`class xx {}`)
    ClassDeclarationOrExpression(_);
}
function ClassDeclarationOrExpression(_: any = ClassDeclaration || ClassExpression) { // 类声明或类表达式
    doc(_);
    read('class');
    if (isIdentifierName(peek) && peek !== 'extends' && peek !== 'implements') {
        _.name = Identifier;
    }
    if (peek === '<') {
        _.typeParameters = TypeParameters;
    }
    ExtendsClause(_);
    ImplementsClause(_);
    ClassBody(_);
}
function ClassBody(_) {  // 类主体(`{...}`、``)
    if (peek === '{') {
        _.members = list(ClassElement, true, '{', '}');
        function ClassElement() { // 类成员
            alias(MethodDeclaration, PropertyDeclaration, AccessorDeclaration);
            const decorators = Decorators;
            const modifiers = Modifiers;
            switch (peek) {
                case 'identifier':
                    break;
                case 'get':
                case 'set':
                    const savedToken = lexer.current;
                    lexer.read();
                    if (isPropertyNameStart(peek)) {
                        return AccessorDeclaration(decorators, modifiers, savedToken.type === 'get' ? savedToken.start : undefined, savedToken.type === 'set' ? savedToken.start : undefined);
                        function AccessorDeclaration(decorators = null || Decorators, modifiers = null || Modifiers, getToken = null || read('get'), setToken = null || read('set')) { // 访问器声明(`get x() {...}`、`set x(value) {...}`)
                            doc(_);
                            _.name = PropertyName;
                            Parameters
                            TypeAnnotation(_);
                            FunctionBody(_);
                        }
                    }
                    lexer.current = savedToken;
                    break;
                case '*':
                    return MethodDeclaration(decorators, modifiers, read, PropertyName);
            }
            const name = PropertyName;
            switch (peek) {
                case '(':
                case '<':
                    return MethodDeclaration(decorators, modifiers, undefined, name);
                    function MethodDeclaration(decorators = null || Decorators, modifiers = null || Modifiers, _3 = null || read('*'), name = PropertyName) { // 方法声明(`x() {...}`)
                        doc(_);
                        CallSignature(_);
                        FunctionBody(_);
                    }
                default:
                    return PropertyDeclaration(decorators, modifiers, name);
                    function PropertyDeclaration(decorators = null || Decorators, modifiers = null || Modifiers, name = PropertyName) { // 属性声明(`x: number`)
                        doc(_);
                        TypeAnnotation(_);
                        Initializer(_);
                    }
            }
        }
    } else {
        Semicolon(_);
    }
}
function InterfaceDeclaration(decorators = null || Decorators, modifiers = null || Modifiers) { // 接口声明(`interface T {...}`)
    doc(_);
    read('interface');
    _.name = Identifier(false);
    if (peek === '<') {
        _.typeParameters = TypeParameters;
    }
    ExtendsClause(_);
    _.members = list(TypeMemberSignature, true, '{', '}');
}
function EnumDeclaration(decorators = null || Decorators, modifiers = null || Modifiers) { // 枚举声明(`enum T {}`)
    doc(_);
    read('enum');
    _.name = Identifier(false);
    ExtendsClause(_);
    _.members = list(EnumMemberDeclaration, true, '{', '}', ',', isPropertyNameStart);
}
function EnumMemberDeclaration() { // 枚举成员声明(`x`、`x = 1`)
    _.name = PropertyName;
    Initializer(_);
}
function NamespaceDeclaration(decorators = null || Decorators, modifiers = null || Modifiers) { // 命名空间声明(`namespace T {}`)
    read('namespace');
    NamespaceOrModuleDeclaration(_, decorators, modifiers);
}
function ModuleDeclaration(decorators = null || Decorators, modifiers = null || Modifiers) { // 模块声明(`module T {}`)
    read('module');
    NamespaceOrModuleDeclaration(_, decorators, modifiers);
}
function NamespaceOrModuleDeclaration(_: any = NamespaceDeclaration || ModuleDeclaration, decorators = null || Decorators, modifiers = null || Modifiers) { // 命名空间或模块声明
    doc(_);
    if (lexer.current.type === 'module' && peek === 'stringLiteral') {
        type ModuleDeclaration = any;
        (<ModuleDeclaration>_).name = StringLiteral;
    } else {
        _.name = Identifier;
        while (peek === '.') {
            _.name = MemberCallExpression(_.name);
        }
    }
    BlockBody(_);
}
function ExtensionDeclaration(decorators = null || Decorators, modifiers = null || Modifiers) { // 扩展声明(`extends T {}`)
    doc(_);
    read('extends');
    _.type = TypeNode;
    ExtendsClause(_);
    ImplementsClause(_);
    ClassBody(_);
}
function ExtendsClause(_) { // extends 分句(`extends xx`)
    if (peek === 'extends') {
        read('extends');
        _.extends = list(ClassHeritageNode, false, undefined, undefined, ',', isExpressionStart);
    }
}
function ImplementsClause(result) { // implements 分句(`implements xx`)
    if (peek === 'implements') {
        read('implements');
        _.implements = list(ClassHeritageNode, false, undefined, undefined, ',', isExpressionStart);
    }
}
function ClassHeritageNode() { // extends 或 implements 分句项
    _.value = Expression(Precedence.leftHandSide);
}
function BlockBody(_) { // 语句块主体(`{...}`)
    _.statements = list(Statement, true, '{', '}');
}
function TypeAliasDeclaration() {  // 类型别名声明(`type A = number`)
    read('type');
    _.name = Identifier;
    if (peek === '<') {
        _.typeParameters = TypeParameters;
    }
    read('=');
    _.value = TypeNode
    Semicolon(';');
}
function ImportAssignmentOrImportDeclaration() { // import 赋值或 import 声明
    const importToken = read;
    const imports = list(ImportClause, false, undefined, undefined, ',', isBindingNameStart);
    type SimpleImportOrExportClause = any;
    if (peek === '=' && imports.length === 1 && imports[0].constructor === SimpleImportOrExportClause && (<SimpleImportOrExportClause>imports[0]).name == null) {
        return ImportAssignmentDeclaration(importToken, (<SimpleImportOrExportClause>imports[0]).variable);
    }
    return ImportDeclaration(importToken, imports);
}
function ImportAssignmentDeclaration(importToken = read('import'), variable = Identifier /*别名*/) { // import 赋值声明
    read('=');
    _.value = Expression(Precedence.assignment);
    Semicolon(_);
}
function ImportDeclaration(importToken = read('import'), variables = list(Identifier) /*别名*/) {
    ; // import 声明(`import x from '...'`)
    if (variables) {
        read('from');
    }
    _.from = StringLiteral; // 导入模块名
    Semicolon(_);
}
function ImportClause(): any { // import 分句(`x`、`{x}`、...)
    alias(SimpleImportOrExportClause, NamespaceImportClause, NamedImportClause);
    switch (peek) {
        //+ case 'identifier':
        //+		return SimpleImportOrExportClause(true);
        case '*':
            return NamespaceImportClause;
            function NamespaceImportClause() { // 命名空间导入分句(`* as x`)
                read('*');
                read('as');
                _.variable = Identifier;
            }
        case '{':
            return NamedImportClause;
            function NamedImportClause() { // 对象导入分句(`{x, x as y}`)
                _.elements = list(/*SimpleImportOrExportClause*/() => SimpleImportOrExportClause(true), true, '{', '}', ',', isIdentifierName);
            }
        default:
            return SimpleImportOrExportClause(true);
    }
}
function SimpleImportOrExportClause(importClause: boolean/* 解析 import 分句*/) { // 简单导入或导出分句(`x`、`x as y`)
    const nameOrVariable = Identifier(true);
    if (peek === 'as') {
        _.name = nameOrVariable;// 导入或导出的名称;
        read('as');
        _.variable = Identifier(!importClause); // 导入或导出的变量
    } else {
        if (importClause && !isIdentifierName(lexer.current)) {
            error(lexer.current, "Identifier expected; Keyword '{0}' cannot be used as an identifier.", getTokenName(lexer.current));
        }
        _.variable = nameOrVariable;
    }
}
function ExportAssignmentOrExportDeclaration(): any { // export 赋值或 export 声明
    const savedState = lexer.current;
    const exportToekn = read;
    switch (peek) {
        case 'function':
            lexer.current = savedState;
            return FunctionDeclaration(undefined, Modifiers);
        case 'class':
            lexer.current = savedState;
            return ClassDeclaration(undefined, Modifiers);
        case 'interface':
            lexer.current = savedState;
            return InterfaceDeclaration(undefined, Modifiers);
        case 'enum':
            lexer.current = savedState;
            return EnumDeclaration(undefined, Modifiers);
        case 'namespace':
            lexer.current = savedState;
            return NamespaceDeclaration(undefined, Modifiers);
        case 'module':
            lexer.current = savedState;
            return ModuleDeclaration(undefined, Modifiers);
        case 'var':
        case 'let':
        case 'const':
            lexer.current = savedState;
            return VariableStatement(Modifiers);
        case '*':
            return function ExportNamespaceDeclaration(exportToekn = read('export')) { // 导出列表声明(`export * from ...`)
                read('*');
                read('from');
                _.from = StringLiteral; // 导入模块名
                Semicolon(_);
            }
        case '{':
            return function ExportListDeclaration(exportToekn = read('export')) { // 导出列表声明(`export a from ...`)
                _.variables = list(SimpleImportOrExportClause, true, '{', '}', ',', isKeyword);
                read('from');
                _.from = StringLiteral; // 导入模块名
                Semicolon(_);
            }
        case '=':
            return function ExportAssignmentDeclaration(exportToekn = read('export')) { // 导出赋值声明(`export = 1`)
                read('=');
                _.value = Expression(Precedence.assignment);
                Semicolon(_);
            }
        default:
            // current = savedState;
            // error(peek, "Declaration or statement expected. Unexpected token '{0}'.", getTokenName(peek));
            return ExportDefaultDeclaration(Modifiers());
            function ExportDefaultDeclaration(modifiers = Modifiers) { // export default 声明(`export default x = 1`)
                _.expression = Expression(Precedence.assignment);
                Semicolon(_);
            }
    }
}

function DocComment(result) { // 文档注释
}
// #endregion
