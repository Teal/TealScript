/**
 * @fileOverview 标记类型
 */

/**
 * 表示一个标记类型。
 */
export enum TokenType {

    // #region 控制

    /**
     * 未知标记。
     */
    unknown,

    /**
     * 文件已结束(EOF)。
     */
    endOfFile,

    // #endregion

    // #region 空白

    /**
     * 单行注释。
     */
    singleLineComment,

    /**
     * 多行注释。
     */
    multiLineComment,

    /**
     * 换行。
     */
    newLine,

    /**
     * 空白。
     */
    whitespace,

    /**
     * Linux Shell 控制字符。
     */
    shebang,

    /**
     * Git 冲突标记。
     */
    conflictMarker,

    // #endregion

    // #region 常量

    /**
     * 数字常量。
     */
    numericLiteral,

    /**
     * 字符串常量。
     */
    stringLiteral,

    /**
     * 正则表达式常量。
     */
    regularExpressionLiteral,

    /**
     * 模板字符串常量。
     */
    noSubstitutionTemplateLiteral,

    /**
     * 模板字符串头。
     */
    templateHead,

    /**
     * 模板字符串主体。
     */
    templateMiddle,

    /**
     * 模板字符串尾。
     */
    templateTail,

    // #endregion

    // #region 连接符

    /**
     * 开花括号({)。
     */
    openBrace,

    /**
     * 闭花括号(})。
     */
    closeBrace,

    /**
     * 开括号(()。
     */
    openParen,

    /**
     * 闭括号())。
     */
    closeParen,

    /**
     * 开方括号([)。
     */
    openBracket,

    /**
     * 闭方括号(])。
     */
    closeBracket,

    /**
     * 点(.)。
     */
    dot,

    /**
     * 点点点(...)。
     */
    dotDotDot,

    /**
     * 分号(;)。
     */
    semicolon,

    /**
     * 逗号(,)。
     */
    comma,

    /**
     * 小于(<)。
     */
    lessThan,

    /**
     * 小于斜杠(</)。
     */
    lessThanSlash,

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
     * 箭头(=>)。
     */
    equalsGreaterThan,

    /**
     * 加(+)。
     */
    plus,

    /**
     * 减(-)。
     */
    minus,

    /**
     * 星号(*)。
     */
    asterisk,

    /**
     * 星号(**)。
     */
    asteriskAsterisk,

    /**
     * 斜杠(/)。
     */
    slash,

    /**
     * 百分号(%)。
     */
    percent,

    /**
     * 加加(++)。
     */
    plusPlus,

    /**
     * 减减(--)。
     */
    minusMinus,

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
     * 位与(&)。
     */
    ampersand,

    /**
     * 位或(|)。
     */
    bar,

    /**
     * 异或(^)。
     */
    caret,

    /**
     * 非(!)。
     */
    exclamation,

    /**
     * 位反(~)。
     */
    tilde,

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
     * 冒号(:)。
     */
    colon,

    /**
     * 电子邮件符号(@)。
     */
    at,

    /**
     * 等于(=)
     */
    equals,

    /**
     * 加等于(+=)
     */
    plusEquals,

    /**
     * 减等于(-=)
     */
    minusEquals,

    /**
     * 乘等于(*=)
     */
    asteriskEquals,

    /**
     * 乘乘等于(**=)
     */
    asteriskAsteriskEquals,

    /**
     * 除等于(/=)
     */
    slashEquals,

    /**
     * 百分号等于(%=)
     */
    percentEquals,

    /**
     * 左移等于(<<=)
     */
    lessThanLessThanEquals,

    /**
     * 右移等于(>>=)
     */
    greaterThanGreaterThanEquals,

    /**
     * 无符右移等于(>>>=)
     */
    greaterThanGreaterThanGreaterThanEquals,

    /**
     * 位与等于(&=)
     */
    ampersandEquals,

    /**
     * 位或等于(|=)
     */
    barEquals,

    /**
     * 异或等于(^=)
     */
    caretEquals,

    // #endregion

    // #region 标识符

    /**
     * 标识符。
     */
    identifier,

    /**
     * 关键字 break。
     */
    break,

    /**
     * 关键字 case。
     */
    case,

    /**
     * 关键字 catch。
     */
    catch,

    /**
     * 关键字 class。
     */
    class,

    /**
     * 关键字 const。
     */
    const,

    /**
     * 关键字 continue。
     */
    continue,

    /**
     * 关键字 debugger。
     */
    debugger,

    /**
     * 关键字 default。
     */
    default,

    /**
     * 关键字 delete。
     */
    delete,

    /**
     * 关键字 do。
     */
    do,

    /**
     * 关键字 else。
     */
    else,

    /**
     * 关键字 enum。
     */
    enum,

    /**
     * 关键字 export。
     */
    export,

    /**
     * 关键字 extends。
     */
    extends,

    /**
     * 关键字 false。
     */
    false,

    /**
     * 关键字 finally。
     */
    finally,

    /**
     * 关键字 for。
     */
    for,

    /**
     * 关键字 function。
     */
    function,

    /**
     * 关键字 if。
     */
    if,

    /**
     * 关键字 import。
     */
    import,

    /**
     * 关键字 in。
     */
    in,

    /**
     * 关键字 instanceOf。
     */
    instanceOf,

    /**
     * 关键字 new。
     */
    new,

    /**
     * 关键字 null。
     */
    null,

    /**
     * 关键字 return。
     */
    return,

    /**
     * 关键字 super。
     */
    super,

    /**
     * 关键字 switch。
     */
    switch,

    /**
     * 关键字 this。
     */
    this,

    /**
     * 关键字 throw。
     */
    throw,

    /**
     * 关键字 true。
     */
    true,

    /**
     * 关键字 try。
     */
    try,

    /**
     * 关键字 typeOf。
     */
    typeOf,

    /**
     * 关键字 var。
     */
    var,

    /**
     * 关键字 void。
     */
    void,

    /**
     * 关键字 while。
     */
    while,

    /**
     * 关键字 with。
     */
    with,

    /**
     * 关键字 implements。
     */
    implements,

    /**
     * 关键字 interface。
     */
    interface,

    /**
     * 关键字 let。
     */
    let,

    /**
     * 关键字 package。
     */
    package,

    /**
     * 关键字 private。
     */
    private,

    /**
     * 关键字 protected。
     */
    protected,

    /**
     * 关键字 public。
     */
    public,

    /**
     * 关键字 static。
     */
    static,

    /**
     * 关键字 yield。
     */
    yield,

    /**
     * 关键字 abstract。
     */
    abstract,

    /**
     * 关键字 as。
     */
    as,

    /**
     * 关键字 any。
     */
    any,

    /**
     * 关键字 async。
     */
    async,

    /**
     * 关键字 await。
     */
    await,

    /**
     * 关键字 boolean。
     */
    boolean,

    /**
     * 关键字 constructor。
     */
    constructor,

    /**
     * 关键字 declare。
     */
    declare,

    /**
     * 关键字 get。
     */
    get,

    /**
     * 关键字 is。
     */
    is,

    /**
     * 关键字 module。
     */
    module,

    /**
     * 关键字 namespace。
     */
    namespace,

    /**
     * 关键字 never。
     */
    never,

    /**
     * 关键字 readonly。
     */
    readonly,

    /**
     * 关键字 require。
     */
    require,

    /**
     * 关键字 number。
     */
    number,

    /**
     * 关键字 set。
     */
    set,

    /**
     * 关键字 string。
     */
    string,

    /**
     * 关键字 symbol。
     */
    symbol,

    /**
     * 关键字 type。
     */
    type,

    /**
     * 关键字 undefined。
     */
    undefined,

    /**
     * 关键字 from。
     */
    from,

    /**
     * 关键字 global。
     */
    global,

    /**
     * 关键字 of。
     */
    of,

    // #endregion

    //// Names
    //qualifiedName,
    //computedPropertyName,
    //// Signature elements
    //typeParameter,
    //parameter,
    //decorator,
    //// TypeMember
    //propertySignature,
    //propertyDeclaration,
    //methodSignature,
    //methodDeclaration,
    //constructor,
    //getAccessor,
    //setAccessor,
    //callSignature,
    //constructSignature,
    //indexSignature,
    //// Type
    //typePredicate,
    //typeReference,
    //functionType,
    //constructorType,
    //typeQuery,
    //typeLiteral,
    //arrayType,
    //tupleType,
    //unionType,
    //intersectionType,
    //parenthesizedType,
    //thisType,
    //stringLiteralType,
    //// Binding patterns
    //objectBindingPattern,
    //arrayBindingPattern,
    //bindingElement,
    //// Expression
    //arrayLiteralExpression,
    //objectLiteralExpression,
    //propertyAccessExpression,
    //elementAccessExpression,
    //callExpression,
    //newExpression,
    //taggedTemplateExpression,
    //typeAssertionExpression,
    //parenthesizedExpression,
    //functionExpression,
    //arrowFunction,
    //deleteExpression,
    //typeOfExpression,
    //voidExpression,
    //awaitExpression,
    //prefixUnaryExpression,
    //postfixUnaryExpression,
    //binaryExpression,
    //conditionalExpression,
    //templateExpression,
    //yieldExpression,
    //spreadElementExpression,
    //classExpression,
    //omittedExpression,
    //expressionWithTypeArguments,
    //asExpression,
    //nonNullExpression,

    //// Misc
    //templateSpan,
    //semicolonClassElement,
    //// Element
    //block,
    //variableStatement,
    //emptyStatement,
    //expressionStatement,
    //ifStatement,
    //doStatement,
    //whileStatement,
    //forStatement,
    //forInStatement,
    //forOfStatement,
    //continueStatement,
    //breakStatement,
    //returnStatement,
    //withStatement,
    //switchStatement,
    //labeledStatement,
    //throwStatement,
    //tryStatement,
    //debuggerStatement,
    //variableDeclaration,
    //variableDeclarationList,
    //functionDeclaration,
    //classDeclaration,
    //interfaceDeclaration,
    //typeAliasDeclaration,
    //enumDeclaration,
    //moduleDeclaration,
    //moduleBlock,
    //caseBlock,
    //namespaceExportDeclaration,
    //importEqualsDeclaration,
    //importDeclaration,
    //importClause,
    //namespaceImport,
    //namedImports,
    //importSpecifier,
    //exportAssignment,
    //exportDeclaration,
    //namedExports,
    //exportSpecifier,
    //missingDeclaration,

    //// Module references
    //externalModuleReference,

    //// JSX
    //jsxElement,
    //jsxSelfClosingElement,
    //jsxOpeningElement,
    //jsxText,
    //jsxClosingElement,
    //jsxAttribute,
    //jsxSpreadAttribute,
    //jsxExpression,

    //// Clauses
    //caseClause,
    //defaultClause,
    //heritageClause,
    //catchClause,

    //// Property assignments
    //propertyAssignment,
    //shorthandPropertyAssignment,

    //// Enum
    //enumMember,
    //// Top-level nodes
    //sourceFile,

    //// JSDoc nodes
    //jSDocTypeExpression,
    //// The * type
    //jSDocAllType,
    //// The ? type
    //jSDocUnknownType,
    //jSDocArrayType,
    //jSDocUnionType,
    //jSDocTupleType,
    //jSDocNullableType,
    //jSDocNonNullableType,
    //jSDocRecordType,
    //jSDocRecordMember,
    //jSDocTypeReference,
    //jSDocOptionalType,
    //jSDocFunctionType,
    //jSDocVariadicType,
    //jSDocConstructorType,
    //jSDocThisType,
    //jSDocComment,
    //jSDocTag,
    //jSDocParameterTag,
    //jSDocReturnTag,
    //jSDocTypeTag,
    //jSDocTemplateTag,
    //jSDocTypedefTag,
    //jSDocPropertyTag,
    //jSDocTypeLiteral,

    //// Synthesized list
    //syntaxList,
    //// Enum value count
    //count,
    //// Markers
    //firstAssignment = Equals,
    //lastAssignment = CaretEquals,
    //firstReservedWord = Break,
    //lastReservedWord = With,
    //firstKeyword = Break,
    //lastKeyword = Of,
    //firstFutureReservedWord = Implements,
    //lastFutureReservedWord = Yield,
    //firstTypeNode = TypePredicate,
    //lastTypeNode = StringLiteralType,
    //firstPunctuation = OpenBrace,
    //lastPunctuation = CaretEquals,
    //firstToken = Unknown,
    //lastToken = Last,
    //firstTriviaToken = SingleLineCommentTrivia,
    //lastTriviaToken = ConflictMarkerTrivia,
    //firstLiteralToken = NumericLiteral,
    //lastLiteralToken = NoSubstitutionTemplateLiteral,
    //firstTemplateToken = NoSubstitutionTemplateLiteral,
    //lastTemplateToken = TemplateTail,
    //firstBinaryOperator = LessThan,
    //lastBinaryOperator = CaretEquals,
    //firstNode = QualifiedName,
    //firstJSDocNode = JSDocTypeExpression,
    //lastJSDocNode = JSDocTypeLiteral,
    //firstJSDocTagNode = JSDocComment,
    //lastJSDocTagNode = JSDocTypeLiteral
}

/**
 * 判断指定的标记是否是无用的标记(如空白、换行、注释)。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isTriviaToken(token: TokenType) {
    return token >= TokenType.singleLineComment && token <= TokenType.conflictMarker;
}

/**
 * 将指定标记转为 JavaScript 源码等效的字符串。
 * @param token 要转换的标记。
 * @returns 返回等效的字符串。
 */
export function tokenToString(token: TokenType) {
    return "";
}

/**
 * 判断指定的标记是否是非保留的关键字。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isNonReservedWord(token: TokenType) {
    return token > TokenType.with;
}