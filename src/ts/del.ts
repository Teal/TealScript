namespace ts {

    export  function error(a: any) { return }

    function getLanguageVariant(scriptKind: ScriptKind) {
        // .tsx and .jsx files are treated as jsx language variant.
        return scriptKind === ScriptKind.TSX || scriptKind === ScriptKind.JSX || scriptKind === ScriptKind.JS ? LanguageVariant.JSX : LanguageVariant.Standard;
    }

    function getBinaryOperatorPrecedence(): number {
        return -1;
    }

    const textToToken: Map<TokenType> = {
        "abstract": TokenType.abstract,
        "any": TokenType.any,
        "as": TokenType.as,
        "boolean": TokenType.boolean,
        "break": TokenType.break,
        "case": TokenType.case,
        "catch": TokenType.catch,
        "class": TokenType.class,
        "continue": TokenType.continue,
        "const": TokenType.const,
        "constructor": TokenType.constructor,
        "debugger": TokenType.debugger,
        "declare": TokenType.declare,
        "default": TokenType.default,
        "delete": TokenType.delete,
        "do": TokenType.do,
        "else": TokenType.else,
        "enum": TokenType.enum,
        "export": TokenType.export,
        "extends": TokenType.extends,
        "false": TokenType.false,
        "finally": TokenType.finally,
        "for": TokenType.for,
        "from": TokenType.from,
        "function": TokenType.function,
        "get": TokenType.get,
        "if": TokenType.if,
        "implements": TokenType.implements,
        "import": TokenType.import,
        "in": TokenType.in,
        "instanceof": TokenType.instanceOf,
        "interface": TokenType.interface,
        "is": TokenType.is,
        "let": TokenType.let,
        "module": TokenType.module,
        "namespace": TokenType.namespace,
        "never": TokenType.never,
        "new": TokenType.new,
        "null": TokenType.null,
        "number": TokenType.number,
        "package": TokenType.package,
        "private": TokenType.private,
        "protected": TokenType.protected,
        "public": TokenType.public,
        "readonly": TokenType.readonly,
        "require": TokenType.require,
        "global": TokenType.global,
        "return": TokenType.return,
        "set": TokenType.set,
        "static": TokenType.static,
        "string": TokenType.string,
        "super": TokenType.super,
        "switch": TokenType.switch,
        "symbol": TokenType.symbol,
        "this": TokenType.this,
        "throw": TokenType.throw,
        "true": TokenType.true,
        "try": TokenType.try,
        "type": TokenType.type,
        "typeof": TokenType.typeof,
        "undefined": TokenType.undefined,
        "var": TokenType.var,
        "void": TokenType.void,
        "while": TokenType.while,
        "with": TokenType.with,
        "yield": TokenType.yield,
        "async": TokenType.async,
        "await": TokenType.await,
        "of": TokenType.of,
        "{": TokenType.openBrace,
        "}": TokenType.closeBrace,
        "(": TokenType.openParen,
        ")": TokenType.closeParen,
        "[": TokenType.openBracket,
        "]": TokenType.closeBracket,
        ".": TokenType.dot,
        "...": TokenType.dotDotDot,
        ";": TokenType.semicolon,
        ",": TokenType.comma,
        "<": TokenType.lessThan,
        ">": TokenType.greaterThan,
        "<=": TokenType.lessThanEquals,
        ">=": TokenType.greaterThanEquals,
        "==": TokenType.equalsEquals,
        "!=": TokenType.exclamationEquals,
        "===": TokenType.equalsEqualsEquals,
        "!==": TokenType.exclamationEqualsEquals,
        "=>": TokenType.equalsGreaterThan,
        "+": TokenType.plus,
        "-": TokenType.minus,
        "**": TokenType.asteriskAsterisk,
        "*": TokenType.asterisk,
        "/": TokenType.slash,
        "%": TokenType.percent,
        "++": TokenType.plusPlus,
        "--": TokenType.minusMinus,
        "<<": TokenType.lessThanLessThan,
        "</": TokenType.LessThanSlashToken,
        ">>": TokenType.greaterThanGreaterThan,
        ">>>": TokenType.greaterThanGreaterThanGreaterThan,
        "&": TokenType.ampersand,
        "|": TokenType.bar,
        "^": TokenType.caret,
        "!": TokenType.exclamation,
        "~": TokenType.tilde,
        "&&": TokenType.ampersandAmpersand,
        "||": TokenType.barBar,
        "?": TokenType.question,
        ":": TokenType.colon,
        "=": TokenType.equals,
        "+=": TokenType.plusEquals,
        "-=": TokenType.minusEquals,
        "*=": TokenType.asteriskEquals,
        "**=": TokenType.asteriskAsteriskEquals,
        "/=": TokenType.slashEquals,
        "%=": TokenType.percentEquals,
        "<<=": TokenType.lessThanLessThanEquals,
        ">>=": TokenType.greaterThanGreaterThanEquals,
        ">>>=": TokenType.greaterThanGreaterThanGreaterThanEquals,
        "&=": TokenType.ampersandEquals,
        "|=": TokenType.barEquals,
        "^=": TokenType.caretEquals,
        "@": TokenType.at,
    };

    function makeReverseMap(source: Map<number>): string[] {
        const result: string[] = [];
        for (const name in source) {
            if (source.hasOwnProperty(name)) {
                result[source[name]] = name;
            }
        }
        return result;
    }

    const tokenStrings = makeReverseMap(textToToken);

    export function tokenToString(t: TokenType): string {
        return tokenStrings[t];
    }

    /* @internal */
    export function stringToToken(s: string): TokenType {
        return textToToken[s];
    }

    /**
    * 表示 Unicode 字符码表。
    */
    export enum CharCode {

        // #region ASCII 字符

        /**
         * 空字符(NUL)。
         */
        null = 0x00,

        /**
         * 标题开始(SOH)。
         */
        startOfHeadLine = 0x01,

        /**
         * 正文开始(STX)。
         */
        startOfText = 0x02,

        /**
         * 正文结束(ETX)。
         */
        endOfText = 0x03,

        /**
         * 传输结束(EOT)。
         */
        endOfTransmission = 0x04,

        /**
         * 请求(ENQ)。
         */
        enquiry = 0x05,

        /**
         * 收到通知(ACK)。
         */
        acknowledge = 0x06,

        /**
         * 响铃(BEL)。
         */
        bell = 0x07,

        /**
         * 退格(BS)。
         */
        backspace = 0x08,

        /**
         * 水平制表符(HT)。
         */
        horizontalTab = 0x09,

        /**
         * 换行键(LF)。
         */
        lineFeed = 0x0A,

        /**
         * 垂直制表符(VT)。
         */
        verticalTab = 0x0B,

        /**
         * 换页键(FF)。
         */
        formFeed = 0x0C,

        /**
         * 回车键(CR)。
         */
        carriageReturn = 0x0D,

        /**
         * 不用切换(SO)。
         */
        shiftOut = 0x0E,

        /**
         * 启用切换(SI)。
         */
        shiftIn = 0x0F,

        /**
         * 数据链路转义(DLE)。
         */
        dataLinkEscape = 0x10,

        /**
         * 设备控制1(DC1)。
         */
        deviceControl1 = 0x11,

        /**
         * 设备控制2(DC2)。
         */
        deviceControl2 = 0x12,

        /**
         * 设备控制3(DC3)。
         */
        deviceControl3 = 0x13,

        /**
         * 设备控制4(DC4)。
         */
        deviceControl4 = 0x14,

        /**
         * 拒绝接收(NAK)。
         */
        negativeAcknowledge = 0x15,

        /**
         * 同步空闲(SYN)。
         */
        synchronousIdle = 0x16,

        /**
         * 结束传输块(ETB)。
         */
        endOfTranslateBlock = 0x17,

        /**
         * 取消(CAN)。
         */
        cancel = 0x18,

        /**
         * 媒介结束(EM)。
         */
        endOfMedium = 0x19,

        /**
         * 代替(SUB)。
         */
        substitute = 0x1A,

        /**
         * 换码(溢出)(ESC)。
         */
        escape = 0x1B,

        /**
         * 文件分隔符(FS)。
         */
        fileSeparator = 0x1C,

        /**
         * 分组符(GS)。
         */
        groupSeparator = 0x1D,

        /**
         * 记录分隔符(RS)。
         */
        recordSeparator = 0x1E,

        /**
         * 单元分隔符(US)。
         */
        unitSeparator = 0x1F,

        /**
         * 空格(space)。
         */
        space = 0x20,

        /**
         * 叹号(!)。
         */
        exclamation = 0x21,

        /**
         * 双引号(")。
         */
        doubleQuote = 0x22,

        /**
         * 井号(#)。
         */
        hash = 0x23,

        /**
         * 美元符($)。
         */
        dollar = 0x24,

        /**
         * 百分号(%)。
         */
        percent = 0x25,

        /**
         * 和(&)。
         */
        ampersand = 0x26,

        /**
         * 闭单引号(')。
         */
        singleQuote = 0x27,

        /**
         * 开括号(()。
         */
        openParen = 0x28,

        /**
         * 闭括号())。
         */
        closeParen = 0x29,

        /**
         * 星号(*)。
         */
        asterisk = 0x2A,

        /**
         * 加(+)。
         */
        plus = 0x2B,

        /**
         * 逗号(,)。
         */
        comma = 0x2C,

        /**
         * 减(-)。
         */
        minus = 0x2D,

        /**
         * 点(.)。
         */
        dot = 0x2E,

        /**
         * 斜杠(/)。
         */
        slash = 0x2F,

        /**
         * 数字 0。
         */
        num0 = 0x30,

        /**
         * 数字 1。
         */
        num1 = 0x31,

        /**
         * 数字 2。
         */
        num2 = 0x32,

        /**
         * 数字 3。
         */
        num3 = 0x33,

        /**
         * 数字 4。
         */
        num4 = 0x34,

        /**
         * 数字 5。
         */
        num5 = 0x35,

        /**
         * 数字 6。
         */
        num6 = 0x36,

        /**
         * 数字 7。
         */
        num7 = 0x37,

        /**
         * 数字 8。
         */
        num8 = 0x38,

        /**
         * 数字 9。
         */
        num9 = 0x39,

        /**
         * 冒号(:)。
         */
        colon = 0x3A,

        /**
         * 分号(;)。
         */
        semicolon = 0x3B,

        /**
         * 小于(<)。
         */
        lessThan = 0x3C,

        /**
         * 等号(=)。
         */
        equals = 0x3D,

        /**
         * 大于(>)。
         */
        greaterThan = 0x3E,

        /**
         * 问号(?)。
         */
        question = 0x3F,

        /**
         * 电子邮件符号(@)。
         */
        at = 0x40,

        /**
         * 大写字母 A。
         */
        A = 0x41,

        /**
         * 大写字母 B。
         */
        B = 0x42,

        /**
         * 大写字母 C。
         */
        C = 0x43,

        /**
         * 大写字母 D。
         */
        D = 0x44,

        /**
         * 大写字母 E。
         */
        E = 0x45,

        /**
         * 大写字母 F。
         */
        F = 0x46,

        /**
         * 大写字母 G。
         */
        G = 0x47,

        /**
         * 大写字母 H。
         */
        H = 0x48,

        /**
         * 大写字母 I。
         */
        I = 0x49,

        /**
         * 大写字母 J。
         */
        J = 0x4A,

        /**
         * 大写字母 K。
         */
        K = 0x4B,

        /**
         * 大写字母 L。
         */
        L = 0x4C,

        /**
         * 大写字母 M。
         */
        M = 0x4D,

        /**
         * 大写字母 N。
         */
        N = 0x4E,

        /**
         * 大写字母 O。
         */
        O = 0x4F,

        /**
         * 大写字母 P。
         */
        P = 0x50,

        /**
         * 大写字母 Q。
         */
        Q = 0x51,

        /**
         * 大写字母 R。
         */
        R = 0x52,

        /**
         * 大写字母 S。
         */
        S = 0x53,

        /**
         * 大写字母 T。
         */
        T = 0x54,

        /**
         * 大写字母 U。
         */
        U = 0x55,

        /**
         * 大写字母 V。
         */
        V = 0x56,

        /**
         * 大写字母 W。
         */
        W = 0x57,

        /**
         * 大写字母 X。
         */
        X = 0x58,

        /**
         * 大写字母 Y。
         */
        Y = 0x59,

        /**
         * 大写字母 Z。
         */
        Z = 0x5A,

        /**
         * 开方括号([)。
         */
        openBracket = 0x5B,

        /**
         * 反斜杠(\)。
         */
        backslash = 0x5C,

        /**
         * 闭方括号(])。
         */
        closeBracket = 0x5D,

        /**
         * 托字符(^)。
         */
        caret = 0x5E,

        /**
         * 下划线(_)。
         */
        underline = 0x5F,

        /**
         * 开单引号(`)。
         */
        backtick = 0x60,

        /**
         * 小写字母 a。
         */
        a = 0x61,

        /**
         * 小写字母 b。
         */
        b = 0x62,

        /**
         * 小写字母 c。
         */
        c = 0x63,

        /**
         * 小写字母 d。
         */
        d = 0x64,

        /**
         * 小写字母 e。
         */
        e = 0x65,

        /**
         * 小写字母 f。
         */
        f = 0x66,

        /**
         * 小写字母 g。
         */
        g = 0x67,

        /**
         * 小写字母 h。
         */
        h = 0x68,

        /**
         * 小写字母 i。
         */
        i = 0x69,

        /**
         * 小写字母 j。
         */
        j = 0x6A,

        /**
         * 小写字母 k。
         */
        k = 0x6B,

        /**
         * 小写字母 l。
         */
        l = 0x6C,

        /**
         * 小写字母 m。
         */
        m = 0x6D,

        /**
         * 小写字母 n。
         */
        n = 0x6E,

        /**
         * 小写字母 o。
         */
        o = 0x6F,

        /**
         * 小写字母 p。
         */
        p = 0x70,

        /**
         * 小写字母 q。
         */
        q = 0x71,

        /**
         * 小写字母 r。
         */
        r = 0x72,

        /**
         * 小写字母 s。
         */
        s = 0x73,

        /**
         * 小写字母 t。
         */
        t = 0x74,

        /**
         * 小写字母 u。
         */
        u = 0x75,

        /**
         * 小写字母 v。
         */
        v = 0x76,

        /**
         * 小写字母 w。
         */
        w = 0x77,

        /**
         * 小写字母 x。
         */
        x = 0x78,

        /**
         * 小写字母 y。
         */
        y = 0x79,

        /**
         * 小写字母 z。
         */
        z = 0x7A,

        /**
         * 开花括号({)。
         */
        openBrace = 0x7B,

        /**
         * 竖线(|)。
         */
        bar = 0x7C,

        /**
         * 闭花括号(})。
         */
        closeBrace = 0x7D,

        /**
         * 波浪号(~)。
         */
        tilde = 0x7E,

        /**
         * 删除(DEL)。
         */
        delete = 0x7F,

        /**
         * 最大的 ASCII 字符。
         */
        MAX_ASCII = 0x80,

        // #endregion 

        // #region Unicode 字符

        lineSeparator = 0x2028,
        paragraphSeparator = 0x2029,
        nextLine = 0x0085,

        nonBreakingSpace = 0x00A0,
        enQuad = 0x2000,
        emQuad = 0x2001,
        enSpace = 0x2002,
        emSpace = 0x2003,
        threePerEmSpace = 0x2004,
        fourPerEmSpace = 0x2005,
        sixPerEmSpace = 0x2006,
        figureSpace = 0x2007,
        punctuationSpace = 0x2008,
        thinSpace = 0x2009,
        hairSpace = 0x200A,
        zeroWidthSpace = 0x200B,
        narrowNoBreakSpace = 0x202F,
        ideographicSpace = 0x3000,
        mathematicalSpace = 0x205F,
        ogham = 0x1680,

        /**
         * UTF-8 标记码(BOM)。
         */
        byteOrderMark = 0xFEFF,

        // #endregion 

    }

    // token > SyntaxKind.Identifer => token is a keyword
    // Also, If you add a new SyntaxKind be sure to keep the `Markers` section at the bottom in sync
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

        // #region 修饰符(Modifiers)

        /**
         * 最小的单目运算符。
         */
        MIN_UNARY_OPERATOR,

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

        // #endregion

        // #region 单目运算符(Unary Operators)

        /**
         * 开花括号({)。
         * @precedence 80
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
         * @precedence 80
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
         * @precedence 80
         */
        openParen,

        /**
         * 开方括号([)。
         * @precedence 80
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
         * @precedence 8
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
         * @precedence 84
         */
        closeParen,

        /**
         * 闭方括号(])。
         * @precedence 84
         */
        closeBracket,

        /**
         * 闭花括号(})。
         * @precedence 84
         */
        closeBrace,

        /**
         * 冒号(:)。
         * @precedence 82
         */
        colon,

        /**
         * 分号(;)。
         * @precedence 100
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
         * 最小的语句。
         */
        MIN_STATEMENT,

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
         * 最大的语句。
         */
        MAX_STATEMENT,

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

        SingleLineCommentTrivia,
        MultiLineCommentTrivia,
        NewLineTrivia,
        WhitespaceTrivia,
        // We detect and preserve #! on the first line
        ShebangTrivia,
        // We detect and provide better error recovery when we encounter a git merge marker.  This
        // allows us to edit files with git-conflict markers in them in a much more pleasant manner.
        ConflictMarkerTrivia,

        // Literals
        NumericLiteral,
        StringLiteral,
        RegularExpressionLiteral,
        NoSubstitutionTemplateLiteral,
        // Pseudo-literals
        TemplateHead,
        TemplateMiddle,
        TemplateTail,
        // Punctuation
        OpenBraceToken,
        CloseBraceToken,
        OpenParenToken,
        CloseParenToken,
        OpenBracketToken,
        CloseBracketToken,
        DotToken,
        DotDotDotToken,
        SemicolonToken,
        CommaToken,
        LessThanToken,
        LessThanSlashToken,
        GreaterThanToken,
        LessThanEqualsToken,
        GreaterThanEqualsToken,
        EqualsEqualsToken,
        ExclamationEqualsToken,
        EqualsEqualsEqualsToken,
        ExclamationEqualsEqualsToken,
        EqualsGreaterThanToken,
        PlusToken,
        MinusToken,
        AsteriskToken,
        AsteriskAsteriskToken,
        SlashToken,
        PercentToken,
        PlusPlusToken,
        MinusMinusToken,
        LessThanLessThanToken,
        GreaterThanGreaterThanToken,
        GreaterThanGreaterThanGreaterThanToken,
        AmpersandToken,
        BarToken,
        CaretToken,
        ExclamationToken,
        TildeToken,
        AmpersandAmpersandToken,
        BarBarToken,
        QuestionToken,
        ColonToken,
        AtToken,
        // Assignments
        EqualsToken,
        PlusEqualsToken,
        MinusEqualsToken,
        AsteriskEqualsToken,
        AsteriskAsteriskEqualsToken,
        SlashEqualsToken,
        PercentEqualsToken,
        LessThanLessThanEqualsToken,
        GreaterThanGreaterThanEqualsToken,
        GreaterThanGreaterThanGreaterThanEqualsToken,
        AmpersandEqualsToken,
        BarEqualsToken,
        CaretEqualsToken,
        // Identifiers
        Identifier,
        // Reserved words
        BreakKeyword,
        CaseKeyword,
        CatchKeyword,
        ClassKeyword,
        ConstKeyword,
        ContinueKeyword,
        DebuggerKeyword,
        DefaultKeyword,
        DeleteKeyword,
        DoKeyword,
        ElseKeyword,
        EnumKeyword,
        ExportKeyword,
        ExtendsKeyword,
        FalseKeyword,
        FinallyKeyword,
        ForKeyword,
        FunctionKeyword,
        IfKeyword,
        ImportKeyword,
        InKeyword,
        InstanceOfKeyword,
        NewKeyword,
        NullKeyword,
        ReturnKeyword,
        SuperKeyword,
        SwitchKeyword,
        ThisKeyword,
        ThrowKeyword,
        TrueKeyword,
        TryKeyword,
        TypeOfKeyword,
        VarKeyword,
        VoidKeyword,
        WhileKeyword,
        WithKeyword,
        // Strict mode reserved words
        ImplementsKeyword,
        InterfaceKeyword,
        LetKeyword,
        PackageKeyword,
        PrivateKeyword,
        ProtectedKeyword,
        PublicKeyword,
        StaticKeyword,
        YieldKeyword,
        // Contextual keywords
        AbstractKeyword,
        AsKeyword,
        AnyKeyword,
        AsyncKeyword,
        AwaitKeyword,
        BooleanKeyword,
        ConstructorKeyword,
        DeclareKeyword,
        GetKeyword,
        IsKeyword,
        ModuleKeyword,
        NamespaceKeyword,
        NeverKeyword,
        ReadonlyKeyword,
        RequireKeyword,
        NumberKeyword,
        SetKeyword,
        StringKeyword,
        SymbolKeyword,
        TypeKeyword,
        UndefinedKeyword,
        FromKeyword,
        GlobalKeyword,
        OfKeyword, // LastKeyword and LastToken

        // Parse tree nodes

        // Names
        QualifiedName,
        ComputedPropertyName,
        // Signature elements
        TypeParameter,
        Parameter,
        Decorator,
        // TypeMember
        PropertySignature,
        PropertyDeclaration,
        MethodSignature,
        MethodDeclaration,
        Constructor,
        GetAccessor,
        SetAccessor,
        CallSignature,
        ConstructSignature,
        IndexSignature,
        // Type
        TypePredicate,
        TypeReference,
        FunctionType,
        ConstructorType,
        TypeQuery,
        TypeLiteral,
        ArrayType,
        TupleType,
        UnionType,
        IntersectionType,
        ParenthesizedType,
        ThisType,
        StringLiteralType,
        // Binding patterns
        ObjectBindingPattern,
        ArrayBindingPattern,
        BindingElement,
        // Expression
        ArrayLiteralExpression,
        ObjectLiteralExpression,
        PropertyAccessExpression,
        ElementAccessExpression,
        CallExpression,
        NewExpression,
        TaggedTemplateExpression,
        TypeAssertionExpression,
        ParenthesizedExpression,
        FunctionExpression,
        ArrowFunction,
        DeleteExpression,
        TypeOfExpression,
        VoidExpression,
        AwaitExpression,
        PrefixUnaryExpression,
        PostfixUnaryExpression,
        BinaryExpression,
        ConditionalExpression,
        TemplateExpression,
        YieldExpression,
        SpreadElementExpression,
        ClassExpression,
        OmittedExpression,
        ExpressionWithTypeArguments,
        AsExpression,
        NonNullExpression,

        // Misc
        TemplateSpan,
        SemicolonClassElement,
        // Element
        Block,
        VariableStatement,
        EmptyStatement,
        ExpressionStatement,
        IfStatement,
        DoStatement,
        WhileStatement,
        ForStatement,
        ForInStatement,
        ForOfStatement,
        ContinueStatement,
        BreakStatement,
        ReturnStatement,
        WithStatement,
        SwitchStatement,
        LabeledStatement,
        ThrowStatement,
        TryStatement,
        DebuggerStatement,
        VariableDeclaration,
        VariableDeclarationList,
        FunctionDeclaration,
        ClassDeclaration,
        InterfaceDeclaration,
        TypeAliasDeclaration,
        EnumDeclaration,
        ModuleDeclaration,
        ModuleBlock,
        CaseBlock,
        NamespaceExportDeclaration,
        ImportEqualsDeclaration,
        ImportDeclaration,
        ImportClause,
        NamespaceImport,
        NamedImports,
        ImportSpecifier,
        ExportAssignment,
        ExportDeclaration,
        NamedExports,
        ExportSpecifier,
        MissingDeclaration,

        // Module references
        ExternalModuleReference,

        // JSX
        JsxElement,
        JsxSelfClosingElement,
        JsxOpeningElement,
        JsxText,
        JsxClosingElement,
        JsxAttribute,
        JsxSpreadAttribute,
        JsxExpression,

        // Clauses
        CaseClause,
        DefaultClause,
        HeritageClause,
        CatchClause,

        // Property assignments
        PropertyAssignment,
        ShorthandPropertyAssignment,

        // Enum
        EnumMember,
        // Top-level nodes
        SourceFile,

        // JSDoc nodes
        JSDocTypeExpression,
        // The * type
        JSDocAllType,
        // The ? type
        JSDocUnknownType,
        JSDocArrayType,
        JSDocUnionType,
        JSDocTupleType,
        JSDocNullableType,
        JSDocNonNullableType,
        JSDocRecordType,
        JSDocRecordMember,
        JSDocTypeReference,
        JSDocOptionalType,
        JSDocFunctionType,
        JSDocVariadicType,
        JSDocConstructorType,
        JSDocThisType,
        JSDocComment,
        JSDocTag,
        JSDocParameterTag,
        JSDocReturnTag,
        JSDocTypeTag,
        JSDocTemplateTag,
        JSDocTypedefTag,
        JSDocPropertyTag,
        JSDocTypeLiteral,

        // Synthesized list
        SyntaxList,
        // Enum value count
        Count,
        // Markers
        FirstAssignment = EqualsToken,
        LastAssignment = CaretEqualsToken,
        FirstReservedWord = BreakKeyword,
        LastReservedWord = WithKeyword,
        FirstKeyword = BreakKeyword,
        LastKeyword = OfKeyword,
        FirstFutureReservedWord = ImplementsKeyword,
        LastFutureReservedWord = YieldKeyword,
        FirstTypeNode = TypePredicate,
        LastTypeNode = StringLiteralType,
        FirstPunctuation = OpenBraceToken,
        LastPunctuation = CaretEqualsToken,
        FirstToken = unknown,
        LastToken = LastKeyword,
        FirstTriviaToken = SingleLineCommentTrivia,
        LastTriviaToken = ConflictMarkerTrivia,
        FirstLiteralToken = NumericLiteral,
        LastLiteralToken = NoSubstitutionTemplateLiteral,
        FirstTemplateToken = NoSubstitutionTemplateLiteral,
        LastTemplateToken = TemplateTail,
        FirstBinaryOperator = LessThanToken,
        LastBinaryOperator = CaretEqualsToken,
        FirstNode = QualifiedName,
        FirstJSDocNode = JSDocTypeExpression,
        LastJSDocNode = JSDocTypeLiteral,
        FirstJSDocTagNode = JSDocComment,
        LastJSDocTagNode = JSDocTypeLiteral
    }


    /* @internal */ export function isUnicodeIdentifierStart(code: number, languageVersion: ScriptTarget) {
        return;
    }

    export function isWhiteSpace(ch: number): boolean { return }

    /** Does not include line breaks. For that, see isWhiteSpaceLike. */
    export function isNoBreakWhiteSpace(ch: number): boolean { return }

    export function isLineBreak(ch: number): boolean { return }

    export function isDecimalDigit(ch: number): boolean { return }

    /* @internal */
    export function isOctalDigit(ch: number): boolean { return }

    export function isIdentifierStart(ch: number, languageVersion: ScriptTarget): boolean {
        return;
    }

    export function isIdentifierPart(ch: number, languageVersion: ScriptTarget): boolean {
        return;
    }

    /* @internal */
    export function isIdentifier(name: string, languageVersion: ScriptTarget): boolean {
        return;
    }

}