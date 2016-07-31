// TealScript 语法解析器
// 此文件可用于生成 parser.ts、nodes.ts、nodeVisitor.ts
// #region 解析
function parseSyntax(source, tokenNames) {
    var lines = source.split(/\r\n?|\n/);
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        // 忽略空行、注释、type、declare 开头的行。
        if (!line || /^(\/\/|\s*(type|declare)\b)/.test(line))
            continue;
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
    function parseCode(production, line) {
        // _...
        if (/^\s*_/.test(line)) {
            var field_1 = {};
            line.replace(/\/\/\s*(.+)$/, function (_, value) {
                field_1.comment = value.trim();
                return "";
            }).replace(/__/, function (_) {
                field_1.optional = true;
                return "_";
            }).replace(/^\s*_\('(.*?)'\)/, function (all, token) {
                return "_." + nameOf(token) + " = " + all;
            }).replace(/_\.(\w+)\s*=\s*(.*)/, function (_, name, value) {
                field_1.name = name;
                // _.x = read('x', 'x')
                if (/_\('/.test(value)) {
                    field_1.type = "number";
                    var tokens = value.replace(/,\s+/g, ",").replace(/^_\('/g, "").replace(/'\)$/g, "").split(",");
                    if (tokens.length > 1) {
                        field_1.tokens = tokens;
                        return "result." + field_1.name + " = this.readToken(); // " + field_1.tokens.join("、");
                    }
                    field_1.token = tokens[0];
                    return "result." + field_1.name + " = this.expectToken(TokenType." + nameOf(field_1.token) + ");";
                }
                // _.x = <'xx'>
                if (/<'\w'>/) {
                }
                // _.x = T()
                field_1.type = getWord(value);
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
    function nameOf(token) {
        return (tokenNames[token] || token) + "Token";
    }
    function getWord(content) {
        return (/(\w+)/.exec(content) || [""])[0];
    }
}
// #endregion
// #region 标记
/**
 * 表示一个标记类型。
 */
var TokenType = {
    // #region 控制符(Control)
    unknown: '',
    endOfFile: 'EOF' && [1],
    // #endregion
    // #region 其它运算符(Other Operators)
    /**
     * 闭括号())。
     */
    closeParen: closeParen,
    /**
     * 闭方括号(])。
     */
    closeBracket: closeBracket,
    /**
     * 闭花括号(})。
     */
    closeBrace: closeBrace,
    /**
     * 冒号(:)。
     */
    colon: colon,
    /**
     * 分号(;)。
     */
    semicolon: semicolon,
    /**
     * 模板字符串主体(}...${)(JavaScript 5 新增)。
     */
    templateMiddle: templateMiddle,
    /**
     * 模板字符串尾(}...`)(JavaScript 5 新增)。
     */
    templateTail: templateTail,
    // #endregion
    // #region 字面量(Literal)
    /**
     * 最小的表达式开头。
     */
    MIN_EXPRESSION_START: MIN_EXPRESSION_START,
    /**
     * 标识符(x)。
     */
    identifier: identifier,
    /**
     * 数字字面量(0x0)。
     */
    numericLiteral: numericLiteral,
    /**
     * 字符串字面量('...')。
     */
    stringLiteral: stringLiteral,
    /**
     * 正则表达式字面量(/.../)。
     */
    regularExpressionLiteral: regularExpressionLiteral,
    /**
     * 简单模板字符串字面量(`...`)(JavaScript 5 新增)。
     */
    noSubstitutionTemplateLiteral: noSubstitutionTemplateLiteral,
    /**
     * 模板字符串头(`...${)(JavaScript 5 新增)。
     */
    templateHead: templateHead,
    /**
     * 最小的简单字面量。
     */
    MIN_SIMPLE_LITERAL: MIN_SIMPLE_LITERAL,
    /**
     * 关键字 undefined。
     */
    undefined: undefined,
    /**
     * 关键字 null。
     */
    null: ,
    /**
     * 关键字 true。
     */
    true: ,
    /**
     * 关键字 false。
     */
    false: ,
    /**
     * 关键字 this。
     */
    this: ,
    /**
     * 最小的标识符 1。
     */
    MIN_IDENTIFIER_NAME_1: MIN_IDENTIFIER_NAME_1,
    /**
     * 关键字 super(JavaScript 3 保留字、JavaScript 5 新增)。
     */
    super: ,
    /**
     * 最大的简单字面量。
     */
    MAX_SIMPLE_LITERAL: MAX_SIMPLE_LITERAL,
    // #endregion
    // #region 修饰符(Modifiers)
    /**
     * 最小的定义开头。
     */
    MIN_DECLARATION_START: MIN_DECLARATION_START,
    /**
     * 最小的修饰符前缀。
     */
    MIN_MODIFIER: MIN_MODIFIER,
    /**
     * 关键字 async(JavaScript 3 保留字、JavaScript 5 新增)。
     */
    async: async,
    /**
     * 关键字 declare(TypeScript 1 新增)。
     */
    declare: declare,
    /**
     * 关键字 static(JavaScript 3 保留字、JavaScript 5 严格模式保留字)。。
     */
    static: static,
    /**
     * 关键字 abstract(JavaScript 3 保留字、TypeScript 1 新增)。
     */
    abstract: abstract,
    /**
     * 关键字 private(JavaScript 3 保留字、TypeScript 1 新增)。
     */
    private: private,
    /**
     * 关键字 protected(JavaScript 3 保留字、TypeScript 1 新增)。
     */
    protected: protected,
    /**
     * 关键字 public(JavaScript 3 保留字、TypeScript 1 新增)。
     */
    public: public,
    /**
     * 关键字 readonly(TypeScript 2 新增)。
     */
    readonly: readonly,
    /**
     * 最大的标识符 1。
     */
    MAX_IDENTIFIER_NAME_1: MAX_IDENTIFIER_NAME_1,
    /**
     * 关键字 export(JavaScript 3 保留字、JavaScript 5 新增)。
     */
    export: ,
    /**
     * 关键字 const(JavaScript 5 新增)。
     */
    const: ,
    /**
     * 最大的修饰符前缀。
     */
    MAX_MODIFIER: MAX_MODIFIER,
    // #endregion
    // #region 声明(Declarations)
    /**
     * 关键字 function。
     */
    function: ,
    /**
     * 关键字 class(JavaScript 3 保留字、JavaScript 5 新增)。
     */
    class: ,
    /**
     * 关键字 enum(JavaScript 3 保留字、JavaScript 5 严格模式保留字、TypeScript 1 新增)。
     */
    enum: ,
    /**
     * 最小的标识符 2。
     */
    MIN_IDENTIFIER_NAME_2: MIN_IDENTIFIER_NAME_2,
    /**
     * 关键字 namespace(TypeScript 新增)。
     */
    namespace: namespace,
    /**
     * 关键字 module(TypeScript 新增)。
     */
    module: module,
    /**
     * 关键字 interface(JavaScript 3 保留字、JavaScript 5 严格模式保留字、TypeScript 1 新增)。
     */
    interface: interface,
    /**
     * 最大的定义开头。
     */
    MAX_DECLARATION_START: MAX_DECLARATION_START,
    // #endregion
    // #region 单目运算符(Unary Operators)
    /**
     * 最小的单目运算符。
     */
    MIN_UNARY_OPERATOR: MIN_UNARY_OPERATOR,
    /**
     * 关键字 yield(JavaScript 5 新增)。
     */
    yield: yield,
    /**
     * 关键字 await(JavaScript 7 新增)。
     */
    await: await,
    /**
     * 最大的标识符 2。
     */
    MAX_IDENTIFIER_NAME_2: MAX_IDENTIFIER_NAME_2,
    /**
     * 开花括号({)。
     */
    openBrace: openBrace,
    /**
     * 非(!)。
     */
    exclamation: exclamation,
    /**
     * 关键字 new。
     */
    new: ,
    /**
     * 关键字 delete。
     */
    delete: ,
    /**
     * 关键字 typeof。
     */
    typeof: ,
    /**
     * 关键字 void。
     */
    void: ,
    /**
     * 点点点(...)(JavaScript 5 新增)。
     */
    dotDotDot: dotDotDot,
    /**
     * 电子邮件符号(@)(TypeScript 1 新增)。
     */
    at: at,
    /**
     * 位反(~)。
     */
    tilde: tilde,
    // #endregion
    // #region 单/双目运算符(Unary & Binary Operators)
    /**
     * 最小的双目运算符。
     */
    MIN_BINARY_OPERATOR: MIN_BINARY_OPERATOR,
    /**
     * 开括号(()。
     */
    openParen: openParen,
    /**
     * 开方括号([)。
     */
    openBracket: openBracket,
    /**
     * 加(+)。
     */
    plus: plus,
    /**
     * 减(-)。
     */
    minus: minus,
    /**
     * 斜杠(/)。
     */
    slash: slash,
    /**
     * 加加(++)。
     */
    plusPlus: plusPlus,
    /**
     * 减减(--)。
     */
    minusMinus: minusMinus,
    /**
     * 小于(<)。
     */
    lessThan: lessThan,
    /**
     * 箭头(=>)(JavaScript 5 新增)。
     */
    equalsGreaterThan: equalsGreaterThan,
    /**
     * 最小的右值运算符。
     */
    MIN_RIGHT_HAND_OPERATOR: MIN_RIGHT_HAND_OPERATOR,
    /**
     * 斜杠等于(/=)。
     */
    slashEquals: slashEquals,
    /**
     * 最大的单目运算符。
     */
    MAX_UNARY_OPERATOR: MAX_UNARY_OPERATOR,
    /**
     * 最大的表达式开头。
     */
    MAX_EXPRESSION_START: MAX_EXPRESSION_START,
    // #endregion
    // #region 双目运算符(Binary Operators)
    /**
     * 星号星号(**)(TypeScript 1 新增)。
     */
    asteriskAsterisk: asteriskAsterisk,
    /**
     * 等于(=)。
     */
    equals: equals,
    /**
     * 加等于(+=)。
     */
    plusEquals: plusEquals,
    /**
     * 减等于(-=)。
     */
    minusEquals: minusEquals,
    /**
     * 星号等于(*=)。
     */
    asteriskEquals: asteriskEquals,
    /**
     * 百分号等于(%=)。
     */
    percentEquals: percentEquals,
    /**
     * 左移等于(<<=)。
     */
    lessThanLessThanEquals: lessThanLessThanEquals,
    /**
     * 右移等于(>>=)。
     */
    greaterThanGreaterThanEquals: greaterThanGreaterThanEquals,
    /**
     * 无符右移等于(>>>=)。
     */
    greaterThanGreaterThanGreaterThanEquals: greaterThanGreaterThanGreaterThanEquals,
    /**
     * 位与等于(&=)。
     */
    ampersandEquals: ampersandEquals,
    /**
     * 位或等于(|=)。
     */
    barEquals: barEquals,
    /**
     * 异或等于(^=)。
     */
    caretEquals: caretEquals,
    /**
     * 星号星号等于(**=)(TypeScript 1 新增)。
     */
    asteriskAsteriskEquals: asteriskAsteriskEquals,
    /**
     * 最大的右值运算符。
     */
    MAX_RIGHT_HAND_OPERATOR: MAX_RIGHT_HAND_OPERATOR,
    /**
     * 点(.)。
     */
    dot: dot,
    /**
     * 点点(..)(TealScript 新增)。
     */
    dotDot: dotDot,
    /**
     * 问号点(?.)(TealScript 新增)。
     */
    questionDot: questionDot,
    /**
     * 星号(*)。
     */
    asterisk: asterisk,
    /**
     * 位与(&)。
     */
    ampersand: ampersand,
    /**
     * 百分号(%)。
     */
    percent: percent,
    /**
     * 大于(>)。
     */
    greaterThan: greaterThan,
    /**
     * 小于等于(<=)。
     */
    lessThanEquals: lessThanEquals,
    /**
     * 大于等于(>=)。
     */
    greaterThanEquals: greaterThanEquals,
    /**
     * 等于等于(==)。
     */
    equalsEquals: equalsEquals,
    /**
     * 不等于(!=)。
     */
    exclamationEquals: exclamationEquals,
    /**
     * 等于等于等于(===)。
     */
    equalsEqualsEquals: equalsEqualsEquals,
    /**
     * 不等于等于(!==)。
     */
    exclamationEqualsEquals: exclamationEqualsEquals,
    /**
     * 左移(<<)。
     */
    lessThanLessThan: lessThanLessThan,
    /**
     * 右移(>>)。
     */
    greaterThanGreaterThan: greaterThanGreaterThan,
    /**
     * 无符右移(>>>)。
     */
    greaterThanGreaterThanGreaterThan: greaterThanGreaterThanGreaterThan,
    /**
     * 位或(|)。
     */
    bar: bar,
    /**
     * 异或(^)。
     */
    caret: caret,
    /**
     * 与(&&)。
     */
    ampersandAmpersand: ampersandAmpersand,
    /**
     * 或(||)。
     */
    barBar: barBar,
    /**
     * 问号(?)。
     */
    question: question,
    /**
     * 逗号(,)。
     */
    comma: comma,
    /**
     * 关键字 in。
     */
    in: ,
    /**
     * 关键字 instanceOf。
     */
    instanceOf: instanceOf,
    /**
     * 最小的标识符 3。
     */
    MIN_IDENTIFIER_NAME_3: MIN_IDENTIFIER_NAME_3,
    /**
     * 关键字 as(TypeScript 新增)。
     */
    as: as,
    /**
     * 关键字 is(TypeScript 新增)。
     */
    is: is,
    /**
     * 最大的双目运算符。
     */
    MAX_BINARY_OPERATOR: MAX_BINARY_OPERATOR,
    // #endregion
    // #region 内置类型(Predefined Types)
    /**
     * 最小的内置类型。
     */
    MIN_PREDEFINED_TYPE: MIN_PREDEFINED_TYPE,
    /**
     * 关键字 any(TypeScript 1 新增)。
     */
    any: any,
    /**
     * 关键字 boolean(TypeScript 1 新增)。
     */
    boolean: boolean,
    /**
     * 关键字 number(TypeScript 1 新增)。
     */
    number: number,
    /**
     * 关键字 string(TypeScript 1 新增)。
     */
    string: string,
    /**
     * 关键字 symbol(TypeScript 1 新增)。
     */
    symbol: symbol,
    /**
     * 关键字 never(TypeScript 2 新增)。
     */
    never: never,
    /**
     * 关键字 char(TealScript 1 新增)。
     */
    char: char,
    /**
     * 关键字 byte(TealScript 1 新增)。
     */
    byte: byte,
    /**
     * 关键字 int(TealScript 1 新增)。
     */
    int: int,
    /**
     * 关键字 long(TealScript 1 新增)。
     */
    long: long,
    /**
     * 关键字 short(TealScript 1 新增)。
     */
    short: short,
    /**
     * 关键字 uint(TealScript 1 新增)。
     */
    uint: uint,
    /**
     * 关键字 ulong(TealScript 1 新增)。
     */
    ulong: ulong,
    /**
     * 关键字 ushort(TealScript 1 新增)。
     */
    ushort: ushort,
    /**
     * 关键字 float(TealScript 1 新增)。
     */
    float: float,
    /**
     * 关键字 double(TealScript 1 新增)。
     */
    double: double,
    /**
     * 最大的内置类型。
     */
    MAX_PREDEFINED_TYPE: MAX_PREDEFINED_TYPE,
    /**
     * 最大的合法标签。
     */
    MAX_TOKEN: MAX_TOKEN,
    // #endregion
    // #region 其它语句(Other Statements)
    /**
     * 关键字 from(仅在 JavaScript 7)。
     */
    from: from,
    /**
     * 关键字 implements(JavaScript 3 保留字、JavaScript 3 严格模式保留字、TypeScript 新增)。
     */
    implements: implements,
    /**
     * 关键字 of(JavaScript 5 新增)。
     */
    of: of,
    /**
     * 关键字 to(TealScript 1 新增)。
     */
    to: to,
    /**
     * 最大的标识符 3。
     */
    MAX_IDENTIFIER_NAME_3: MAX_IDENTIFIER_NAME_3,
    /**
     * 关键字 else。
     */
    else: ,
    /**
     * 关键字 case。
     */
    case: ,
    /**
     * 关键字 default。
     */
    default: ,
    /**
     * 关键字 catch。
     */
    catch: ,
    /**
     * 关键字 finally。
     */
    finally: ,
    /**
     * 关键字 extends(JavaScript 3 保留字、JavaScript 5 新增)。
     */
    extends: ,
    // #endregion
    // #region 语句头(Statement Headers)
    /**
     * 最小的语句开头。
     */
    MIN_STATEMENT_START: MIN_STATEMENT_START,
    /**
     * 关键字 if。
     */
    if: ,
    /**
     * 关键字 switch。
     */
    switch: ,
    /**
     * 关键字 for。
     */
    for: ,
    /**
     * 关键字 while。
     */
    while: ,
    /**
     * 关键字 do。
     */
    do: ,
    /**
     * 关键字 continue。
     */
    continue: ,
    /**
     * 关键字 break。
     */
    break: ,
    /**
     * 关键字 return。
     */
    return: ,
    /**
     * 关键字 throw。
     */
    throw: ,
    /**
     * 关键字 try。
     */
    try: ,
    /**
     * 关键字 debugger。
     */
    debugger: ,
    /**
     * 关键字 with。
     */
    with: ,
    /**
     * 关键字 var。
     */
    var: ,
    /**
     * 关键字 let(JavaScript 5 新增)。
     */
    let: let,
    /**
     * 关键字 import(JavaScript 5 保留字、TypeScript 1 新增)。
     */
    import: ,
    /**
     * 关键字 type(TypeScript 新增)。
     */
    type: type,
    /**
     * 最大的语句开头。
     */
    MAX_STATEMENT_START: MAX_STATEMENT_START,
};
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
function TypeNode(precedence) {
    if (precedence === void 0) { precedence = Precedence.any; }
    var result;
    if (isPredefinedType(peek)) {
        result = function PredefinedTypeNode() {
            _.type = read('any', 'number', 'boolean', 'string', 'symbol', 'void', 'never', 'this', 'null', 'undefined', 'char', 'byte', 'int', 'long', 'short', 'uint', 'ulong', 'ushort', 'float', 'double', '*', '?'); // 类型
        };
    }
    else {
        switch (peek) {
            //+ case 'identifier':
            //+ 	result = GenericTypeOrTypeReferenceNode;
            //+ 	break;
            case '(':
                result = function FunctionOrParenthesizedTypeNode() {
                    var savedState = stashSave();
                    var parameters = Parameters();
                    if (peek === '=>' || peek === ':') {
                        stashClear(savedState);
                        return FunctionTypeNode(undefined, parameters);
                    }
                    stashRestore(savedState);
                    return function ParenthesizedTypeNode() {
                        read('(');
                        _.body = TypeNode; // 主体部分
                        read(')');
                    };
                };
                function FunctionTypeNode(typeParameters, parameters) {
                    if (typeParameters === void 0) { typeParameters = null || TypeParameters; }
                    if (parameters === void 0) { parameters = null || Parameters; }
                    read('=>');
                    _.return = TypeNode;
                }
                break;
            case '[':
                result = function TupleTypeNode() {
                    list(TupleTypeElement, true, '[', ']', ',', isTypeNodeStart); // 元素列表
                    function TupleTypeElement() {
                        _.value = TypeNode(Precedence.assignment); // 值部分
                    }
                };
                break;
            case '{':
                result = function ObjectTypeNode() {
                    _.elements = list(TypeMemberSignature, true, '{', '}');
                };
                break;
            case 'new':
                return function ConstructorTypeNode() {
                    read('new');
                    if (peek === '<') {
                        _.typeParameters = TypeParameters();
                    }
                    _.parameters = Parameters;
                    read('=>');
                    _.return = TypeNode;
                };
            case '<':
                return FunctionTypeNode(TypeParameters, Parameters);
            case 'typeof':
                result = function TypeQueryNode() {
                    extend(TypeNode);
                    read('typeof');
                    _.operand = Expression(Precedence.postfix);
                };
                break;
            case '=>':
                return FunctionTypeNode();
            case 'numericLiteral':
            case 'stringLiteral':
            case 'true':
            case 'false':
                result = function LiteralTypeNode() {
                    _.value = Expression(Precedence.primary);
                };
                break;
            default:
                result = function GenericTypeOrTypeReferenceNode() {
                    var result = TypeReferenceNode;
                    function TypeReferenceNode() {
                        extend(TypeNode);
                        if (isIdentifierName(peek)) {
                            _.value = read('identifier'); // 值部分
                        }
                        else {
                            error(lexer.peek(), "Type expected. Unexpected token '{0}'.", getTokenName(peek));
                            _.end = _.start = lexer.current.end;
                            _.hasError = true;
                        }
                    }
                    if (sameLine && peek === '<') {
                        return GenericTypeNode(result);
                        function GenericTypeNode(target /*目标部分*/) {
                            if (target === void 0) { target = TypeReferenceNode; }
                            _.typeArguments = TypeArguments(); // 类型参数部分
                        }
                    }
                    return result;
                };
                break;
        }
    }
    while (getPrecedence(peek) >= precedence) {
        switch (peek) {
            case '.':
                result = QualifiedNameTypeNode(result);
                function QualifiedNameTypeNode(target /*目标部分*/) {
                    if (target === void 0) { target = TypeNode; }
                    read('.');
                    _.argument = Identifier(true); // 参数部分
                }
                continue;
            case '[':
                if (sameLine) {
                    result = ArrayTypeNode(result);
                    function ArrayTypeNode(target) {
                        if (target === void 0) { target = TypeNode; }
                        read('[');
                        read(']');
                    }
                }
                continue;
            case '&':
            case '|':
            case 'is':
                result = BinaryTypeNode(result);
                function BinaryTypeNode(left /*左值部分*/) {
                    if (left === void 0) { left = TypeNode; }
                    _.operator = read('&', '|', 'is'); // 运算类型
                    _.right = TypeNode(getPrecedence(result.operator) + 1); // 右值部分
                }
                continue;
        }
        return result;
    }
}
function TypeMemberSignature() {
    alias(PropertySignature, FunctionSignature, ConstructSignature, IndexSignature, MethodSignature, AccessorSignature);
    switch (peek) {
        //+ case 'identifier':
        //+ 	break;
        case 'get':
        case 'set':
            var savedToken = lexer.current;
            lexer.read();
            if (isPropertyNameStart(peek)) {
                return AccessorSignature(savedToken.type === 'get' ? savedToken.start : undefined, savedToken.type === 'set' ? savedToken.start : undefined);
                function AccessorSignature(getToken, setToken) {
                    if (getToken === void 0) { getToken = null || read('get'); }
                    if (setToken === void 0) { setToken = null || read('set'); }
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
            var isIndexSignature = void 0;
            var savedToken2 = lexer.current;
            lexer.read();
            if (isIdentifierName(peek)) {
                lexer.read();
                isIndexSignature = peek === ':';
            }
            lexer.current = savedToken2;
            if (isIndexSignature) {
                return IndexSignature();
                function IndexSignature() {
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
            function FunctionSignature() {
                doc(_);
                MethodOrConstructOrCallSignature(_);
            }
        case 'new':
            return ConstructSignature();
            function ConstructSignature() {
                doc(_);
                read('new');
                MethodOrConstructOrCallSignature(_);
            }
    }
    var name = PropertyName();
    var questionToken = peek === '?' ? read('?') : undefined;
    switch (peek) {
        case '(':
        case '<':
            return MethodSignature(name, questionToken);
            function MethodSignature(name, questionToken) {
                if (name === void 0) { name = PropertyName(); }
                if (questionToken === void 0) { questionToken = null || read('?'); }
                doc(_);
                MethodOrConstructOrCallSignature(_);
            }
        default:
            return PropertySignature(name, questionToken);
            function PropertySignature(name /* 名字部分 */, questionToken) {
                if (name === void 0) { name = PropertyName(); }
                if (questionToken === void 0) { questionToken = null || read('?'); }
                doc(_);
                TypeAnnotation(_);
                CommaOrSemicolon(_);
            }
    }
    function MethodOrConstructOrCallSignature(_) {
        CallSignature(_);
        CommaOrSemicolon(_);
    }
}
function TypeParameters() {
    list(TypeParameterDeclaration, false, '<', '>', ',', isIdentifierName);
    function TypeParameterDeclaration() {
        _.name = Identifier;
        if (peek === 'extends') {
            read('extends');
            _.extends = TypeNode;
        }
    }
}
function TypeArguments() {
    list(TypeArgument, false, '<', '>', ',', isTypeNodeStart);
    function TypeArgument() {
        _.value = TypeNode(Precedence.assignment); // 值部分
    }
}
function Parameters() {
    list(ParameterDeclaration, true, '(', ')', ',', isBindingElementStart);
    function ParameterDeclaration() {
        var modifiers = Modifiers();
        if (modifiers) {
            _.modifiers = modifiers;
        }
        readIf('...');
        _.name = BindingName;
        readIf('?');
        TypeAnnotation(_);
        Initializer(_);
    }
}
function BindingName() {
    alias(Identifier, ArrayBindingPattern, ObjectBindingPattern);
    switch (peek) {
        case '[':
            return ArrayBindingPattern();
            function ArrayBindingPattern() {
                _.elements = list(ArrayBindingElement, true, '[', ']', ',', isArrayBindingElementStart);
                function ArrayBindingElement() {
                    if (peek !== ',' && peek !== ']') {
                        readIf('...');
                        _.value = BindingName;
                        Initializer(_);
                    }
                }
            }
        case '{':
            return ObjectBindingPattern();
            function ObjectBindingPattern() {
                _.elements = list(ObjectBindingElement, true, '{', '}', ',', isObjectBindingElementStart);
                function ObjectBindingElement() {
                    var keyToken = peek;
                    _.key = PropertyName;
                    if (peek === ':') {
                        read(':');
                        _.value = BindingName;
                    }
                    else if (!isIdentifierName(keyToken)) {
                        readToken(':');
                    }
                    Initializer(_);
                }
            }
        default:
            return Identifier();
    }
}
function TypeAnnotation(_) {
    if (peek === ':') {
        read(':');
        _.type = TypeNode; // 类型部分
    }
}
function Initializer(_, allowIn) {
    if (peek === '=') {
        read('=');
        _.initializer = Expression(Precedence.assignment, allowIn); // 初始值部分
    }
}
function PropertyName() {
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
            function ComputedPropertyName() {
                read('[');
                _.body = Expression(Precedence.assignment);
                read(']');
            }
        default:
            return Identifier(true);
    }
}
function CommaOrSemicolon(_) {
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
function Expression(precedence /*允许解析的最低操作符优先级*/, allowIn /*是否解析 in 表达式*/) {
    if (precedence === void 0) { precedence = Precedence.any; }
    if (allowIn === void 0) { allowIn = true; }
    var result;
    switch (peek) {
        //+ case 'identifier':
        //+    result = ArrowFunctionOrGenericExpressionOrIdentifier(allowIn);
        //+    break;
        case 'this':
        case 'null':
        case 'true':
        case 'false':
        case 'super':
            result = function SimpleLiteral() {
                _.type = read('this', 'null', 'true', 'false', 'super'); // 类型
            };
            break;
        case '(':
            result = function ArrowFunctionOrParenthesizedExpression(allowIn) {
                var savedState = stashSave();
                var parameters = Parameters();
                if (sameLine && (peek === '=>' || peek === ':' || peek === '{')) {
                    stashClear(savedState);
                    return ArrowFunctionExpression(undefined, undefined, parameters, allowIn);
                }
                stashRestore(savedState);
                return function ParenthesizedExpression() {
                    read('(');
                    _.body = Expression; // 主体部分
                    read(')');
                };
            };
            break;
        case 'numericLiteral':
            result = NumericLiteral;
            break;
        case 'stringLiteral':
        case 'noSubstitutionTemplateLiteral':
            result = StringLiteral;
            break;
        case '[':
            result = function ArrayLiteral() {
                _.elements = list(ArrayLiteralElement, true, '[', ']', isExpressionStart); // 元素列表
                function ArrayLiteralElement() {
                    if (peek !== ',' && peek !== ']') {
                        readIf('...');
                        _.value = Expression(Precedence.assignment);
                    }
                }
            };
            break;
        case '{':
            result = function ObjectLiteral() {
                _.elements = list(ObjectLiteralElement, true, '{', '}', ',', isPropertyNameStart);
                function ObjectLiteralElement() {
                    alias(ObjectPropertyDeclaration, ObjectMethodDeclaration, ObjectAccessorDeclaration);
                    var modifiers = Modifiers;
                    switch (peek) {
                        //+ case 'identifier':
                        //+ 	break;
                        case 'get':
                        case 'set':
                            var savedToken = lexer.current;
                            lexer.read();
                            if (isPropertyNameStart(peek)) {
                                return ObjectAccessorDeclaration(modifiers, savedToken.type === 'get' ? savedToken.start : undefined, savedToken.type === 'set' ? savedToken.start : undefined);
                                function ObjectAccessorDeclaration(modifiers, getToken, setToken) {
                                    if (modifiers === void 0) { modifiers = null || Modifiers; }
                                    if (getToken === void 0) { getToken = null || read('get'); }
                                    if (setToken === void 0) { setToken = null || read('set'); }
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
                    var name = PropertyName;
                    switch (peek) {
                        case '(':
                        case '<':
                            return ObjectMethodDeclaration(modifiers, undefined, name);
                            function ObjectMethodDeclaration(modifiers, _1, name) {
                                if (_1 === void 0) { _1 = null || read('*'); }
                                if (name === void 0) { name = PropertyName; }
                                doc(_);
                                CallSignature(_);
                                FunctionBody(_);
                                CommaOrSemicolon(_);
                            }
                        default:
                            return ObjectPropertyDeclaration(modifiers, name);
                            function ObjectPropertyDeclaration(modifiers, key) {
                                if (key === void 0) { key = PropertyName; }
                                doc(_);
                                if (peek === ':' || peek === '=') {
                                    if (peek === ':') {
                                        read(':');
                                    }
                                    else {
                                        read('=');
                                    }
                                    _.value = Expression(Precedence.assignment);
                                }
                                else if (key.constructor === Identifier ? !isIdentifierName(getTokenName(key).value) :
                                    key.constructor === MemberCallExpression ? !isIdentifierName(getTokenName(key).argument) :
                                        true) {
                                    readToken(':');
                                    _.hasError = true;
                                }
                                CommaOrSemicolon(_);
                            }
                    }
                }
            };
            break;
        case 'function':
            result = FunctionExpression;
            break;
        case 'new':
            result = function NewTargetOrNewExpression() {
                var newToken = read('new');
                if (peek === '.') {
                    return function NewTargetExpression(newToken) {
                        if (newToken === void 0) { newToken = read('new'); }
                        read('.');
                        if (peek === 'identifier' && lexer.peek().value === "target") {
                            _.target = read('unknown');
                        }
                        else {
                            error(lexer.peek(), "'target' expected; Unexpected token '{0}'.", getTokenName(peek));
                            _.hasError = true;
                        }
                    };
                }
                return function NewExpression(newToken) {
                    if (newToken === void 0) { newToken = read('new'); }
                    _.target = Expression(Precedence.member);
                    if (peek === '(') {
                        _.arguments = Arguments;
                    }
                };
            };
            break;
        case '/':
        case '/=':
            result = function RegularExpressionLiteral() {
                //_.start = lexer.readAsRegularExpressionLiteral().start;
                _.value = read('regularExpressionLiteral');
                //_.flags = token.value.flags; // 标志部分;
                //_.end = token.end;
            };
            break;
        case 'templateHead':
            result = TemplateLiteral;
            function TemplateLiteral() {
                _.spans = list(TemplateSpan || Expression); // 组成部分列表
                while (true) {
                    result.spans.push(TemplateSpan());
                    function TemplateSpan() {
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
            result = function ArrowFunctionOrTypeAssertionExpression(allowIn) {
                var savedState = stashSave();
                var typeParameters = TypeParameters();
                var parameters = peek === '(' ? Parameters() : isIdentifierName(peek) ? Identifier() : undefined;
                if (parameters && sameLine && (peek === '=>' || peek === ':' || peek === '{')) {
                    stashClear(savedState);
                    return ArrowFunctionExpression(undefined, typeParameters, parameters, allowIn);
                }
                stashRestore(savedState);
                return function TypeAssertionExpression() {
                    read('<');
                    _.type = TypeNode;
                    read('>');
                    _.operand = Expression(Precedence.postfix);
                };
            };
            break;
        case 'yield':
            result = function YieldExpression(allowIn) {
                read('yield');
                if (sameLine && peek === '*') {
                    read('*');
                }
                if (sameLine && isExpressionStart(peek)) {
                    _.operand = Expression(Precedence.assignment, allowIn);
                }
            };
            break;
        case 'await':
            result = function AwaitExpressionOrIdentifier(allowIn) {
                var savedToken = lexer.current;
                var awaitToken = read('await');
                if (sameLine && isExpressionStart(peek)) {
                    return function AwaitExpression(awaitToken, allowIn) {
                        if (awaitToken === void 0) { awaitToken = read('await'); }
                        _.operand = Expression(Precedence.assignment, allowIn);
                    };
                }
                lexer.current = savedToken;
                return Identifier;
            };
            break;
        case 'class':
            result = ClassExpression();
            break;
        case 'async':
            result = function AsyncFunctionExpressionOrIdentifier(allowIn) {
                var savedState = stashSave();
                var modifiers = Modifiers;
                var typeParameters = sameLine && peek === '<' ? TypeParameters() : undefined;
                if (sameLine) {
                    if (peek === 'function') {
                        return FunctionExpression(modifiers);
                    }
                    if ((peek === '(' || isIdentifierName(peek))) {
                        var parameters = peek === '(' ? Parameters() : Identifier();
                        if (sameLine && (peek === '=>' || peek === ':' || peek === '{')) {
                            stashClear(savedState);
                            return ArrowFunctionExpression(modifiers, typeParameters, parameters, allowIn);
                        }
                    }
                }
                stashRestore(savedState);
                return Identifier();
            };
            break;
        case '=>':
            result = ArrowFunctionExpression(undefined, undefined, undefined, allowIn);
            break;
        default:
            if (isUnaryOperator(peek)) {
                result = function UnaryExpression() {
                    _.operator = read('delete', 'void', 'typeof', '+', '-', '~', '!', '++', '--', '...'); // 操作符
                    _.operand = Expression(Precedence.postfix); // 操作数
                };
                break;
            }
            if (isIdentifierName(peek)) {
                result = ArrowFunctionOrGenericExpressionOrIdentifier(allowIn);
                function ArrowFunctionOrGenericExpressionOrIdentifier(allowIn) {
                    var result = Identifier;
                    switch (peek) {
                        case '=>':
                            result = ArrowFunctionExpression(undefined, undefined, result, allowIn);
                            break;
                        case '<':
                            if (sameLine) {
                                var savedState = stashSave();
                                var typeArguments = TypeArguments;
                                if (lexer.current === '>' && (isBinaryOperator(peek) || !isUnaryOperator(peek))) {
                                    stashClear(savedState);
                                    result = GenericExpression(result, typeArguments);
                                    function GenericExpression(target /*目标部分*/, typeArguments /*类型参数部分*/) {
                                        if (target === void 0) { target = Identifier; }
                                        if (typeArguments === void 0) { typeArguments = TypeArguments; }
                                    }
                                }
                                else {
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
            function MissingExpression(start /*标记的开始位置*/) {
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
                function FunctionCallExpression(target) {
                    if (target === void 0) { target = Expression(); }
                    _.arguments = Arguments;
                }
                continue;
            case '[':
                result = IndexCallExpression(result);
                function IndexCallExpression(target) {
                    if (target === void 0) { target = Expression(); }
                    read('[');
                    _.argument = Expression;
                    read(']');
                }
                continue;
            case '?':
                result = ConditionalExpression(result, allowIn);
                function ConditionalExpression(condition, allowIn) {
                    if (condition === void 0) { condition = Expression(); }
                    read('?');
                    _.then = Expression(Precedence.assignment); // 则部分
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
                function PostfixExpression(operand) {
                    if (operand === void 0) { operand = Expression(Precedence.leftHandSide); }
                    _.operator = read('++', '--');
                }
                continue;
            case 'noSubstitutionTemplateLiteral':
                result = TemplateCallExpression(result, StringLiteral);
                continue;
            case 'templateHead':
                result = TemplateCallExpression(result, TemplateLiteral);
                function TemplateCallExpression(target, argument) {
                    if (target === void 0) { target = Expression; }
                    if (argument === void 0) { argument = TemplateLiteral || StringLiteral; }
                }
                continue;
            case '>':
                var savedToken = lexer.current;
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
        function BinaryExpression(left /*左值部分*/, allowIn) {
            if (left === void 0) { left = Expression; }
            _.operator = read(',', '*=', '/=', '%=', '+=', '‐=', '<<=', '>>=', '>>>=', '&=', '^=', ',=', '**=', '=', ',,', '&&', ',', '^', '&', '==', '!=', '===', '!==', '<', '>', '<=', '>=', 'instanceof', 'in', '<<', '>>', '>>>', '+', '-', '*', '/', '%', '**');
            ; // 运算类型
            _.right = Expression(getPrecedence(result.operator) + (isRightHandOperator(_.operator) ? 0 : 1), allowIn); // 右值部分
            return result;
        }
    }
    return result;
    function Arguments() {
        list(Argument, true, undefined, undefined, ',', isArgumentStart);
        function Argument() {
            readIf('...');
            _.value = Expression(Precedence.assignment);
        }
    }
    function ArrowFunctionExpression(modifiers, typeParameters, parameters /*参数部分*/, allowIn) {
        if (modifiers === void 0) { modifiers = null || Modifiers; }
        if (typeParameters === void 0) { typeParameters = null || TypeParameters(); }
        if (parameters === void 0) { parameters = null || Parameters || Identifier; }
        if (parameters.constructor !== Identifier) {
            TypeAnnotation(_);
        }
        read('=>');
        _.body = peek === '{' ? BlockStatement() : Expression(Precedence.assignment, allowIn);
    }
}
function MemberCallExpression(target /*目标部分*/) {
    if (target === void 0) { target = Expression(); }
    read('.');
    _.argument = Identifier(true); // 参数部分
}
function NumericLiteral() {
    _.value = read('numericLiteral');
}
function StringLiteral() {
    _.value = read('stringLiteral');
}
function Identifier(allowKeyword /*是否允许解析关键字*/) {
    if (allowKeyword === void 0) { allowKeyword = false; }
    extend(Expression);
    var isIdentifier = isIdentifierName(peek);
    if (!isIdentifier && allowKeyword && isKeyword(peek)) {
        isIdentifier = true;
        if (!sameLine && isStatementStart(peek)) {
            var savedState = stashSave();
            Statement();
            if (!savedState.errors.length) {
                isIdentifier = false;
            }
        }
    }
    if (isIdentifier) {
        _.value = read('identifier'); // 值部分
    }
    else {
        error(lexer.peek(), isKeyword(peek) ? "Identifier expected; Keyword '{0}' cannot be used as an identifier." : "Identifier expected; Unexpected token '{0}'.", getTokenName(peek));
        _.end = _.start = lexer.current.end;
    }
}
function Statement() {
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
            function VariableOrExpressionStatement(allowIn) {
                var savedToken = lexer.current;
                switch (peek) {
                    case 'let':
                    case 'var':
                    case 'const':
                        lexer.read();
                        var isBindingName = isBindingNameStart(peek);
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
            return function IfStatement() {
                read('if');
                Condition(_);
                _.then = EmbeddedStatement;
                if (peek === 'else') {
                    read('else');
                    _.else = EmbeddedStatement;
                }
            };
        case 'for':
            return function ForOrForInOrForOfOrForToStatement() {
                var forToken = read('for');
                var openParanToken = peek === '(' || options.allowMissingParenthese === false ? read('(') : undefined;
                var initializer = peek === ';' ? undefined : VariableOrExpressionStatement(false);
                switch (peek) {
                    //+ case ';':
                    //+    return ForStatement(forToken, openParan, initializer);
                    case 'in':
                        return function ForInStatement(forToken, openParanToken, initializer) {
                            if (forToken === void 0) { forToken = read('for'); }
                            if (openParanToken === void 0) { openParanToken = null || read('('); }
                            if (initializer === void 0) { initializer = null || VariableStatement || ExpressionStatement; }
                            read('in');
                            _.condition = Expression;
                            if (openParanToken != undefined) {
                                read(')');
                            }
                            _.body = EmbeddedStatement;
                        };
                    case 'of':
                        return function ForOfStatement(forToken, openParanToken, initializer) {
                            if (forToken === void 0) { forToken = read('for'); }
                            if (openParanToken === void 0) { openParanToken = null || read('('); }
                            if (initializer === void 0) { initializer = null || VariableStatement || ExpressionStatement; }
                            read('of');
                            _.condition = Expression;
                            if (openParanToken != undefined) {
                                read(')');
                            }
                            _.body = EmbeddedStatement;
                        };
                    case 'to':
                        return function ForToStatement(forToken, openParanToken, initializer) {
                            if (forToken === void 0) { forToken = read('for'); }
                            if (openParanToken === void 0) { openParanToken = null || read('('); }
                            if (initializer === void 0) { initializer = null || VariableStatement || ExpressionStatement; }
                            read('to');
                            _.condition = Expression;
                            if (openParanToken != undefined) {
                                read(')');
                            }
                            _.body = EmbeddedStatement;
                        };
                    default:
                        return function ForStatement(forToken, openParanToken, initializer) {
                            if (forToken === void 0) { forToken = read('for'); }
                            if (openParanToken === void 0) { openParanToken = null || read('('); }
                            if (initializer === void 0) { initializer = null || VariableStatement || ExpressionStatement; }
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
                        };
                }
            };
        case 'while':
            return function WhileStatement() {
                read('while');
                Condition(_);
                _.body = EmbeddedStatement;
            };
        case 'switch':
            return function SwitchStatement() {
                if (options.allowMissingSwitchCondition === false || peek !== '{') {
                    Condition(_);
                }
                _.cases = list(CaseOrDefaultClause, true, '{', '}');
                function CaseOrDefaultClause() {
                    switch (peek) {
                        case 'case':
                            return function CaseClause() {
                                read('case');
                                _.labels = list(CaseClauseLabel, false, undefined, undefined, ',', isCaseLabelStart); // 标签列表
                                function CaseClauseLabel() {
                                    if (peek === 'else') {
                                        read('else');
                                    }
                                    else {
                                        _.label = Expression(Precedence.assignment);
                                    }
                                }
                                read(':');
                                _.statements = list(/*Statement*/ CaseStatement);
                            };
                        case 'default':
                            return function DefaultClause() {
                                read('default');
                                read(':');
                                _.statements = list(/*Statement*/ CaseStatement);
                            };
                        default:
                            error(lexer.peek(), "'case' or 'default' expected; Unexpected token '{0}'.", getTokenName(peek));
                            return;
                    }
                    function CaseStatement() {
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
            };
        case 'do':
            return function DoWhileStatement() {
                read('do');
                _.body = EmbeddedStatement;
                read('while');
                Condition(_);
                Semicolon(_);
            };
        case 'break':
            return BreakStatement;
            function BreakStatement() {
                read('break');
                BreakOrContinueStatement(_);
            }
        case 'continue':
            return ContinueStatement;
            function ContinueStatement() {
                read('continue');
                BreakOrContinueStatement(_);
            }
            function BreakOrContinueStatement(_) {
                if (_ === void 0) { _ = BreakStatement || ContinueStatement; }
                if (!Semicolon(_)) {
                    _.label = Identifier;
                    Semicolon(_);
                }
            }
        case 'return':
            return function ReturnStatement() {
                read('return');
                if (!Semicolon(_)) {
                    _.value = Expression;
                    Semicolon(_);
                }
            };
        case 'throw':
            return function ThrowStatement() {
                read('throw');
                if (!Semicolon(_)) {
                    _.value = Expression;
                    !Semicolon(_);
                }
            };
        case 'try':
            return function TryStatement() {
                read('try');
                _.try = EmbeddedStatement;
                if (peek === 'catch') {
                    _.catch = function CatchClause() {
                        read('catch');
                        var hasParan = peek === '(';
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
                    };
                }
                if (peek === 'finally') {
                    _.finally = function FinallyClause() {
                        read('finally');
                        _.body = EmbeddedStatement;
                    };
                }
                if (options.allowSimpleTryBlock === false && !_.catch && !_.finally) {
                    error(lexer.peek(), "'catch' or 'finally' expected. Unexpected token '{0}'.", getTokenName(peek));
                }
            };
        case 'debugger':
            return function DebuggerStatement() {
                read('debugger');
                Semicolon(';');
            };
        case ';':
            return EmptyStatement();
            function EmptyStatement() {
                ; // 空语句(``)
                Semicolon(_);
            }
        case 'endOfFile':
            return function MissingStatement() {
                error(lexer.peek(), "Statement Or Declaration expected. Unexpected end of file.");
            };
        case 'with':
            return function WithStatement() {
                read('with');
                var hasParan = peek === '(';
                if (hasParan) {
                    _('(');
                }
                _.value = VariableOrExpressionStatement;
                if (hasParan) {
                    _(')');
                }
                _.body = EmbeddedStatement;
            };
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
            function LabeledOrExpressionStatement(parsed) {
                if (parsed === void 0) { parsed = Expression; }
                if (parsed.constructor === Identifier && peek === ':') {
                    return LabelledStatement(parsed);
                    function LabelledStatement(label) {
                        if (label === void 0) { label = Identifier(); }
                        doc(_);
                        read(':');
                        _.statement = Statement; // 主体部分
                    }
                }
                return ExpressionStatement(parsed);
            }
    }
    function Condition(_) {
        var hasParan = peek === '(';
        if (hasParan || options.allowMissingParenthese === false) {
            read('(');
        }
        _.condition = Expression;
        if (hasParan) {
            read(')');
        }
    }
    function EmbeddedStatement() {
        alias(Statement);
        return Statement;
    }
}
function VariableStatement(modifiers, allowIn) {
    _.type = read('var', 'let', 'const');
    _.variables = list(/*VariableDeclaration*/ allowIn !== false ? VariableDeclaration : function () { return VariableDeclaration(false); }, undefined, undefined, ',', isBindingNameStart);
    function VariableDeclaration(allowIn) {
        _.mame = BindingName;
        TypeAnnotation(_);
        Initializer(_, allowIn);
    }
}
function ExpressionStatement(expression /*表达式部分*/) {
    if (expression === void 0) { expression = Expression(); }
    Semicolon(_);
}
function BlockStatement() {
    _.statements = list(Statement, true, '{', '}');
}
function Semicolon(_) {
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
function Declaration() {
    extend(Statement);
}
function DeclarationOrExpressionStatement() {
    var savedState = stashSave();
    var decorators = Decorators();
    var modifiers = Modifiers();
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
function Decorators() {
    var result;
    while (peek === '') {
        if (!result)
            result = list(Decorator);
        result.push(Decorator());
    }
    return result;
    function Decorator() {
        read('');
        _.body = Expression(Precedence.leftHandSide);
    }
}
function Modifiers() {
    var result;
    while (isModifier(peek)) {
        var savedToken = lexer.current;
        var modifier = Modifier;
        switch (modifier.type) {
            case 'export':
                if (!result)
                    result = list(Modifier);
                result.push(modifier);
                if (peek === 'default') {
                    result.push(Modifier);
                }
                continue;
            case 'const':
                if (peek === 'enum') {
                    if (!result)
                        result = list(Modifier);
                    result.push(modifier);
                    continue;
                }
                break;
            default:
                if (sameLine) {
                    if (!result)
                        result = list(Modifier);
                    result.push(modifier);
                    continue;
                }
                break;
        }
        lexer.current = savedToken;
        break;
    }
    return result;
    function Modifier() {
        _.type = read('export', 'default', 'declare', 'const', 'static', 'abstract', 'readonly', 'async', 'public', 'protected', 'private');
    }
}
function FunctionDeclaration(decorators, modifiers) {
    if (decorators === void 0) { decorators = null || Decorators; }
    if (modifiers === void 0) { modifiers = null || Modifiers; }
    FunctionDeclarationOrExpression(_, modifiers);
}
function FunctionExpression(modifiers) {
    if (modifiers === void 0) { modifiers = null || Modifiers; }
    FunctionDeclarationOrExpression(_, modifiers);
}
function FunctionDeclarationOrExpression(_ /* 解析的目标节点 */, modifiers) {
    if (_ === void 0) { _ = FunctionDeclaration || FunctionExpression; }
    if (modifiers === void 0) { modifiers = null || Modifiers; }
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
function CallSignature(_) {
    if (peek === '<') {
        _.typeParameters = TypeParameters();
    }
    _.parameters = Parameters;
    TypeAnnotation(_);
}
function FunctionBody(_) {
    switch (peek) {
        case '{':
            _.body = BlockStatement;
            break;
        case '=>':
            read('=>');
            _.body = Expression(Precedence.assignment);
            break;
        default:
            Semicolon(_);
            break;
    }
}
function ClassDeclaration(decorators, modifiers) {
    if (decorators === void 0) { decorators = null || Decorators; }
    if (modifiers === void 0) { modifiers = null || Modifiers; }
    ClassDeclarationOrExpression(_);
}
function ClassExpression() {
    ClassDeclarationOrExpression(_);
}
function ClassDeclarationOrExpression(_) {
    if (_ === void 0) { _ = ClassDeclaration || ClassExpression; }
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
function ClassBody(_) {
    if (peek === '{') {
        _.members = list(ClassElement, true, '{', '}');
        function ClassElement() {
            alias(MethodDeclaration, PropertyDeclaration, AccessorDeclaration);
            var decorators = Decorators;
            var modifiers = Modifiers;
            switch (peek) {
                case 'identifier':
                    break;
                case 'get':
                case 'set':
                    var savedToken = lexer.current;
                    lexer.read();
                    if (isPropertyNameStart(peek)) {
                        return AccessorDeclaration(decorators, modifiers, savedToken.type === 'get' ? savedToken.start : undefined, savedToken.type === 'set' ? savedToken.start : undefined);
                        function AccessorDeclaration(decorators, modifiers, getToken, setToken) {
                            if (decorators === void 0) { decorators = null || Decorators; }
                            if (modifiers === void 0) { modifiers = null || Modifiers; }
                            if (getToken === void 0) { getToken = null || read('get'); }
                            if (setToken === void 0) { setToken = null || read('set'); }
                            doc(_);
                            _.name = PropertyName;
                            Parameters;
                            TypeAnnotation(_);
                            FunctionBody(_);
                        }
                    }
                    lexer.current = savedToken;
                    break;
                case '*':
                    return MethodDeclaration(decorators, modifiers, read, PropertyName);
            }
            var name = PropertyName;
            switch (peek) {
                case '(':
                case '<':
                    return MethodDeclaration(decorators, modifiers, undefined, name);
                    function MethodDeclaration(decorators, modifiers, _3, name) {
                        if (decorators === void 0) { decorators = null || Decorators; }
                        if (modifiers === void 0) { modifiers = null || Modifiers; }
                        if (_3 === void 0) { _3 = null || read('*'); }
                        if (name === void 0) { name = PropertyName; }
                        doc(_);
                        CallSignature(_);
                        FunctionBody(_);
                    }
                default:
                    return PropertyDeclaration(decorators, modifiers, name);
                    function PropertyDeclaration(decorators, modifiers, name) {
                        if (decorators === void 0) { decorators = null || Decorators; }
                        if (modifiers === void 0) { modifiers = null || Modifiers; }
                        if (name === void 0) { name = PropertyName; }
                        doc(_);
                        TypeAnnotation(_);
                        Initializer(_);
                    }
            }
        }
    }
    else {
        Semicolon(_);
    }
}
function InterfaceDeclaration(decorators, modifiers) {
    if (decorators === void 0) { decorators = null || Decorators; }
    if (modifiers === void 0) { modifiers = null || Modifiers; }
    doc(_);
    read('interface');
    _.name = Identifier(false);
    if (peek === '<') {
        _.typeParameters = TypeParameters;
    }
    ExtendsClause(_);
    _.members = list(TypeMemberSignature, true, '{', '}');
}
function EnumDeclaration(decorators, modifiers) {
    if (decorators === void 0) { decorators = null || Decorators; }
    if (modifiers === void 0) { modifiers = null || Modifiers; }
    doc(_);
    read('enum');
    _.name = Identifier(false);
    ExtendsClause(_);
    _.members = list(EnumMemberDeclaration, true, '{', '}', ',', isPropertyNameStart);
}
function EnumMemberDeclaration() {
    _.name = PropertyName;
    Initializer(_);
}
function NamespaceDeclaration(decorators, modifiers) {
    if (decorators === void 0) { decorators = null || Decorators; }
    if (modifiers === void 0) { modifiers = null || Modifiers; }
    read('namespace');
    NamespaceOrModuleDeclaration(_, decorators, modifiers);
}
function ModuleDeclaration(decorators, modifiers) {
    if (decorators === void 0) { decorators = null || Decorators; }
    if (modifiers === void 0) { modifiers = null || Modifiers; }
    read('module');
    NamespaceOrModuleDeclaration(_, decorators, modifiers);
}
function NamespaceOrModuleDeclaration(_, decorators, modifiers) {
    if (_ === void 0) { _ = NamespaceDeclaration || ModuleDeclaration; }
    if (decorators === void 0) { decorators = null || Decorators; }
    if (modifiers === void 0) { modifiers = null || Modifiers; }
    doc(_);
    if (lexer.current.type === 'module' && peek === 'stringLiteral') {
        _.name = StringLiteral;
    }
    else {
        _.name = Identifier;
        while (peek === '.') {
            _.name = MemberCallExpression(_.name);
        }
    }
    BlockBody(_);
}
function ExtensionDeclaration(decorators, modifiers) {
    if (decorators === void 0) { decorators = null || Decorators; }
    if (modifiers === void 0) { modifiers = null || Modifiers; }
    doc(_);
    read('extends');
    _.type = TypeNode;
    ExtendsClause(_);
    ImplementsClause(_);
    ClassBody(_);
}
function ExtendsClause(_) {
    if (peek === 'extends') {
        read('extends');
        _.extends = list(ClassHeritageNode, false, undefined, undefined, ',', isExpressionStart);
    }
}
function ImplementsClause(result) {
    if (peek === 'implements') {
        read('implements');
        _.implements = list(ClassHeritageNode, false, undefined, undefined, ',', isExpressionStart);
    }
}
function ClassHeritageNode() {
    _.value = Expression(Precedence.leftHandSide);
}
function BlockBody(_) {
    _.statements = list(Statement, true, '{', '}');
}
function TypeAliasDeclaration() {
    read('type');
    _.name = Identifier;
    if (peek === '<') {
        _.typeParameters = TypeParameters;
    }
    read('=');
    _.value = TypeNode;
    Semicolon(';');
}
function ImportAssignmentOrImportDeclaration() {
    var importToken = read;
    var imports = list(ImportClause, false, undefined, undefined, ',', isBindingNameStart);
    if (peek === '=' && imports.length === 1 && imports[0].constructor === SimpleImportOrExportClause && imports[0].name == null) {
        return ImportAssignmentDeclaration(importToken, imports[0].variable);
    }
    return ImportDeclaration(importToken, imports);
}
function ImportAssignmentDeclaration(importToken, variable /*别名*/) {
    if (importToken === void 0) { importToken = read('import'); }
    if (variable === void 0) { variable = Identifier; }
    read('=');
    _.value = Expression(Precedence.assignment);
    Semicolon(_);
}
function ImportDeclaration(importToken, variables /*别名*/) {
    if (importToken === void 0) { importToken = read('import'); }
    if (variables === void 0) { variables = list(Identifier); }
    ; // import 声明(`import x from '...'`)
    if (variables) {
        read('from');
    }
    _.from = StringLiteral; // 导入模块名
    Semicolon(_);
}
function ImportClause() {
    alias(SimpleImportOrExportClause, NamespaceImportClause, NamedImportClause);
    switch (peek) {
        //+ case 'identifier':
        //+		return SimpleImportOrExportClause(true);
        case '*':
            return NamespaceImportClause;
            function NamespaceImportClause() {
                read('*');
                read('as');
                _.variable = Identifier;
            }
        case '{':
            return NamedImportClause;
            function NamedImportClause() {
                _.elements = list(/*SimpleImportOrExportClause*/ function () { return SimpleImportOrExportClause(true); }, true, '{', '}', ',', isIdentifierName);
            }
        default:
            return SimpleImportOrExportClause(true);
    }
}
function SimpleImportOrExportClause(importClause /* 解析 import 分句*/) {
    var nameOrVariable = Identifier(true);
    if (peek === 'as') {
        _.name = nameOrVariable; // 导入或导出的名称;
        read('as');
        _.variable = Identifier(!importClause); // 导入或导出的变量
    }
    else {
        if (importClause && !isIdentifierName(lexer.current)) {
            error(lexer.current, "Identifier expected; Keyword '{0}' cannot be used as an identifier.", getTokenName(lexer.current));
        }
        _.variable = nameOrVariable;
    }
}
function ExportAssignmentOrExportDeclaration() {
    var savedState = lexer.current;
    var exportToekn = read;
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
            return function ExportNamespaceDeclaration(exportToekn) {
                if (exportToekn === void 0) { exportToekn = read('export'); }
                read('*');
                read('from');
                _.from = StringLiteral; // 导入模块名
                Semicolon(_);
            };
        case '{':
            return function ExportListDeclaration(exportToekn) {
                if (exportToekn === void 0) { exportToekn = read('export'); }
                _.variables = list(SimpleImportOrExportClause, true, '{', '}', ',', isKeyword);
                read('from');
                _.from = StringLiteral; // 导入模块名
                Semicolon(_);
            };
        case '=':
            return function ExportAssignmentDeclaration(exportToekn) {
                if (exportToekn === void 0) { exportToekn = read('export'); }
                read('=');
                _.value = Expression(Precedence.assignment);
                Semicolon(_);
            };
        default:
            // current = savedState;
            // error(peek, "Declaration or statement expected. Unexpected token '{0}'.", getTokenName(peek));
            return ExportDefaultDeclaration(Modifiers());
            function ExportDefaultDeclaration(modifiers) {
                if (modifiers === void 0) { modifiers = Modifiers; }
                _.expression = Expression(Precedence.assignment);
                Semicolon(_);
            }
    }
}
function DocComment(result) {
}
// #endregion
//# sourceMappingURL=tealscript.def.js.map