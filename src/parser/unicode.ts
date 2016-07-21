﻿/**
 * @fileOverview Unicode 字符处理工具
 * @author xuld@vip.qq.com
 * @stable
 */

/**
 * 表示 Unicode 字符码表。
 */
export const enum CharCode {

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

    /**
     * 行分隔符(LS)。
     */
    lineSeparator = 0x2028,

    /**
     * 段落分隔符(PS)。
     */
    paragraphSeparator = 0x2029,

    /**
     * 换行符(NL)。
     */
    nextLine = 0x0085,

    /**
     * 不换号空格(NBSP)。
     */
    nonBreakingSpace = 0x00A0,

    /**
     * 对开空格(EQ)。
     */
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

    /**
     * 零宽空格(ZWS)。
     */
    zeroWidthSpace = 0x200B,

    /**
     * 窄不换行空格(NNBS)。
     */
    narrowNoBreakSpace = 0x202F,

    /**
     * 表意字空格(IS)。
     */
    ideographicSpace = 0x3000,

    /**
     * 数学空格(MMS)。
     */
    mathematicalSpace = 0x205F,

    /**
     * 欧甘文字(OGHAM)。
     */
    ogham = 0x1680,

    /**
     * UTF-8 标记码(BOM)。
     */
    byteOrderMark = 0xFEFF,

    // #endregion 

}

/**
 * 判断一个字符是否是换行符。
 * @param ch 要判断的字符。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isLineBreak(ch: CharCode) {
    return ch === CharCode.lineFeed ||
        ch === CharCode.carriageReturn ||
        ch === CharCode.lineSeparator ||
        ch === CharCode.paragraphSeparator;
}

/**
 * 判断一个字符是否是换行符以外的空白字符。
 * @param ch 要判断的字符。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isNoBreakWhiteSpace(ch: CharCode) {
    return ch === CharCode.space ||
        ch === CharCode.horizontalTab ||
        ch === CharCode.verticalTab ||
        ch === CharCode.formFeed ||
        ch >= CharCode.nextLine && (
            ch === CharCode.byteOrderMark ||
            ch === CharCode.nextLine ||
            ch === CharCode.nonBreakingSpace ||
            ch === CharCode.ogham ||
            ch >= CharCode.enQuad && ch <= CharCode.zeroWidthSpace ||
            ch === CharCode.narrowNoBreakSpace ||
            ch === CharCode.mathematicalSpace ||
            ch === CharCode.ideographicSpace
        );
}

/**
 * 判断一个字符是否是空白字符。
 * @param ch 要判断的字符。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isWhiteSpace(ch: CharCode) {
    return isLineBreak(ch) || isNoBreakWhiteSpace(ch);
}

/**
 * 判断一个字符是否是十进制数字。
 * @param ch 要判断的字符。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isDecimalDigit(ch: CharCode) {
    return ch >= CharCode.num0 && ch <= CharCode.num9;
}

/**
 * 判断一个字符是否是八进制数字。
 * @param ch 要判断的字符。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isOctalDigit(ch: CharCode) {
    return ch >= CharCode.num0 && ch <= CharCode.num7;
}

/**
 * 判断一个字符是否是十六进制数字。
 * @param ch 要判断的字符。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isHexDigit(ch: CharCode) {
    return ch >= CharCode.num0 && ch <= CharCode.num9 ||
        ch >= CharCode.A && ch <= CharCode.F ||
        ch >= CharCode.a && ch <= CharCode.f;
}

// #region 内部函数

// From TypeScript (scanner.ts)

/*
        As per ECMAScript Language Specification 3th Edition, Section 7.6: Identifiers
        IdentifierStart ::
            Can contain Unicode 3.0.0  categories:
            Uppercase letter (Lu),
            Lowercase letter (Ll),
            Titlecase letter (Lt),
            Modifier letter (Lm),
            Other letter (Lo), or
            Letter number (Nl).
        IdentifierPart :: =
            Can contain IdentifierStart + Unicode 3.0.0  categories:
            Non-spacing mark (Mn),
            Combining spacing mark (Mc),
            Decimal number (Nd), or
            Connector punctuation (Pc).

        Codepoint ranges for ES3 Identifiers are extracted from the Unicode 3.0.0 specification at:
        http://www.unicode.org/Public/3.0-Update/UnicodeData-3.0.0.txt
    */
const unicodeES3IdentifierStart = [170, 170, 181, 181, 186, 186, 192, 214, 216, 246, 248, 543, 546, 563, 592, 685, 688, 696, 699, 705, 720, 721, 736, 740, 750, 750, 890, 890, 902, 902, 904, 906, 908, 908, 910, 929, 931, 974, 976, 983, 986, 1011, 1024, 1153, 1164, 1220, 1223, 1224, 1227, 1228, 1232, 1269, 1272, 1273, 1329, 1366, 1369, 1369, 1377, 1415, 1488, 1514, 1520, 1522, 1569, 1594, 1600, 1610, 1649, 1747, 1749, 1749, 1765, 1766, 1786, 1788, 1808, 1808, 1810, 1836, 1920, 1957, 2309, 2361, 2365, 2365, 2384, 2384, 2392, 2401, 2437, 2444, 2447, 2448, 2451, 2472, 2474, 2480, 2482, 2482, 2486, 2489, 2524, 2525, 2527, 2529, 2544, 2545, 2565, 2570, 2575, 2576, 2579, 2600, 2602, 2608, 2610, 2611, 2613, 2614, 2616, 2617, 2649, 2652, 2654, 2654, 2674, 2676, 2693, 2699, 2701, 2701, 2703, 2705, 2707, 2728, 2730, 2736, 2738, 2739, 2741, 2745, 2749, 2749, 2768, 2768, 2784, 2784, 2821, 2828, 2831, 2832, 2835, 2856, 2858, 2864, 2866, 2867, 2870, 2873, 2877, 2877, 2908, 2909, 2911, 2913, 2949, 2954, 2958, 2960, 2962, 2965, 2969, 2970, 2972, 2972, 2974, 2975, 2979, 2980, 2984, 2986, 2990, 2997, 2999, 3001, 3077, 3084, 3086, 3088, 3090, 3112, 3114, 3123, 3125, 3129, 3168, 3169, 3205, 3212, 3214, 3216, 3218, 3240, 3242, 3251, 3253, 3257, 3294, 3294, 3296, 3297, 3333, 3340, 3342, 3344, 3346, 3368, 3370, 3385, 3424, 3425, 3461, 3478, 3482, 3505, 3507, 3515, 3517, 3517, 3520, 3526, 3585, 3632, 3634, 3635, 3648, 3654, 3713, 3714, 3716, 3716, 3719, 3720, 3722, 3722, 3725, 3725, 3732, 3735, 3737, 3743, 3745, 3747, 3749, 3749, 3751, 3751, 3754, 3755, 3757, 3760, 3762, 3763, 3773, 3773, 3776, 3780, 3782, 3782, 3804, 3805, 3840, 3840, 3904, 3911, 3913, 3946, 3976, 3979, 4096, 4129, 4131, 4135, 4137, 4138, 4176, 4181, 4256, 4293, 4304, 4342, 4352, 4441, 4447, 4514, 4520, 4601, 4608, 4614, 4616, 4678, 4680, 4680, 4682, 4685, 4688, 4694, 4696, 4696, 4698, 4701, 4704, 4742, 4744, 4744, 4746, 4749, 4752, 4782, 4784, 4784, 4786, 4789, 4792, 4798, 4800, 4800, 4802, 4805, 4808, 4814, 4816, 4822, 4824, 4846, 4848, 4878, 4880, 4880, 4882, 4885, 4888, 4894, 4896, 4934, 4936, 4954, 5024, 5108, 5121, 5740, 5743, 5750, 5761, 5786, 5792, 5866, 6016, 6067, 6176, 6263, 6272, 6312, 7680, 7835, 7840, 7929, 7936, 7957, 7960, 7965, 7968, 8005, 8008, 8013, 8016, 8023, 8025, 8025, 8027, 8027, 8029, 8029, 8031, 8061, 8064, 8116, 8118, 8124, 8126, 8126, 8130, 8132, 8134, 8140, 8144, 8147, 8150, 8155, 8160, 8172, 8178, 8180, 8182, 8188, 8319, 8319, 8450, 8450, 8455, 8455, 8458, 8467, 8469, 8469, 8473, 8477, 8484, 8484, 8486, 8486, 8488, 8488, 8490, 8493, 8495, 8497, 8499, 8505, 8544, 8579, 12293, 12295, 12321, 12329, 12337, 12341, 12344, 12346, 12353, 12436, 12445, 12446, 12449, 12538, 12540, 12542, 12549, 12588, 12593, 12686, 12704, 12727, 13312, 19893, 19968, 40869, 40960, 42124, 44032, 55203, 63744, 64045, 64256, 64262, 64275, 64279, 64285, 64285, 64287, 64296, 64298, 64310, 64312, 64316, 64318, 64318, 64320, 64321, 64323, 64324, 64326, 64433, 64467, 64829, 64848, 64911, 64914, 64967, 65008, 65019, 65136, 65138, 65140, 65140, 65142, 65276, 65313, 65338, 65345, 65370, 65382, 65470, 65474, 65479, 65482, 65487, 65490, 65495, 65498, 65500,];
const unicodeES3IdentifierPart = [170, 170, 181, 181, 186, 186, 192, 214, 216, 246, 248, 543, 546, 563, 592, 685, 688, 696, 699, 705, 720, 721, 736, 740, 750, 750, 768, 846, 864, 866, 890, 890, 902, 902, 904, 906, 908, 908, 910, 929, 931, 974, 976, 983, 986, 1011, 1024, 1153, 1155, 1158, 1164, 1220, 1223, 1224, 1227, 1228, 1232, 1269, 1272, 1273, 1329, 1366, 1369, 1369, 1377, 1415, 1425, 1441, 1443, 1465, 1467, 1469, 1471, 1471, 1473, 1474, 1476, 1476, 1488, 1514, 1520, 1522, 1569, 1594, 1600, 1621, 1632, 1641, 1648, 1747, 1749, 1756, 1759, 1768, 1770, 1773, 1776, 1788, 1808, 1836, 1840, 1866, 1920, 1968, 2305, 2307, 2309, 2361, 2364, 2381, 2384, 2388, 2392, 2403, 2406, 2415, 2433, 2435, 2437, 2444, 2447, 2448, 2451, 2472, 2474, 2480, 2482, 2482, 2486, 2489, 2492, 2492, 2494, 2500, 2503, 2504, 2507, 2509, 2519, 2519, 2524, 2525, 2527, 2531, 2534, 2545, 2562, 2562, 2565, 2570, 2575, 2576, 2579, 2600, 2602, 2608, 2610, 2611, 2613, 2614, 2616, 2617, 2620, 2620, 2622, 2626, 2631, 2632, 2635, 2637, 2649, 2652, 2654, 2654, 2662, 2676, 2689, 2691, 2693, 2699, 2701, 2701, 2703, 2705, 2707, 2728, 2730, 2736, 2738, 2739, 2741, 2745, 2748, 2757, 2759, 2761, 2763, 2765, 2768, 2768, 2784, 2784, 2790, 2799, 2817, 2819, 2821, 2828, 2831, 2832, 2835, 2856, 2858, 2864, 2866, 2867, 2870, 2873, 2876, 2883, 2887, 2888, 2891, 2893, 2902, 2903, 2908, 2909, 2911, 2913, 2918, 2927, 2946, 2947, 2949, 2954, 2958, 2960, 2962, 2965, 2969, 2970, 2972, 2972, 2974, 2975, 2979, 2980, 2984, 2986, 2990, 2997, 2999, 3001, 3006, 3010, 3014, 3016, 3018, 3021, 3031, 3031, 3047, 3055, 3073, 3075, 3077, 3084, 3086, 3088, 3090, 3112, 3114, 3123, 3125, 3129, 3134, 3140, 3142, 3144, 3146, 3149, 3157, 3158, 3168, 3169, 3174, 3183, 3202, 3203, 3205, 3212, 3214, 3216, 3218, 3240, 3242, 3251, 3253, 3257, 3262, 3268, 3270, 3272, 3274, 3277, 3285, 3286, 3294, 3294, 3296, 3297, 3302, 3311, 3330, 3331, 3333, 3340, 3342, 3344, 3346, 3368, 3370, 3385, 3390, 3395, 3398, 3400, 3402, 3405, 3415, 3415, 3424, 3425, 3430, 3439, 3458, 3459, 3461, 3478, 3482, 3505, 3507, 3515, 3517, 3517, 3520, 3526, 3530, 3530, 3535, 3540, 3542, 3542, 3544, 3551, 3570, 3571, 3585, 3642, 3648, 3662, 3664, 3673, 3713, 3714, 3716, 3716, 3719, 3720, 3722, 3722, 3725, 3725, 3732, 3735, 3737, 3743, 3745, 3747, 3749, 3749, 3751, 3751, 3754, 3755, 3757, 3769, 3771, 3773, 3776, 3780, 3782, 3782, 3784, 3789, 3792, 3801, 3804, 3805, 3840, 3840, 3864, 3865, 3872, 3881, 3893, 3893, 3895, 3895, 3897, 3897, 3902, 3911, 3913, 3946, 3953, 3972, 3974, 3979, 3984, 3991, 3993, 4028, 4038, 4038, 4096, 4129, 4131, 4135, 4137, 4138, 4140, 4146, 4150, 4153, 4160, 4169, 4176, 4185, 4256, 4293, 4304, 4342, 4352, 4441, 4447, 4514, 4520, 4601, 4608, 4614, 4616, 4678, 4680, 4680, 4682, 4685, 4688, 4694, 4696, 4696, 4698, 4701, 4704, 4742, 4744, 4744, 4746, 4749, 4752, 4782, 4784, 4784, 4786, 4789, 4792, 4798, 4800, 4800, 4802, 4805, 4808, 4814, 4816, 4822, 4824, 4846, 4848, 4878, 4880, 4880, 4882, 4885, 4888, 4894, 4896, 4934, 4936, 4954, 4969, 4977, 5024, 5108, 5121, 5740, 5743, 5750, 5761, 5786, 5792, 5866, 6016, 6099, 6112, 6121, 6160, 6169, 6176, 6263, 6272, 6313, 7680, 7835, 7840, 7929, 7936, 7957, 7960, 7965, 7968, 8005, 8008, 8013, 8016, 8023, 8025, 8025, 8027, 8027, 8029, 8029, 8031, 8061, 8064, 8116, 8118, 8124, 8126, 8126, 8130, 8132, 8134, 8140, 8144, 8147, 8150, 8155, 8160, 8172, 8178, 8180, 8182, 8188, 8255, 8256, 8319, 8319, 8400, 8412, 8417, 8417, 8450, 8450, 8455, 8455, 8458, 8467, 8469, 8469, 8473, 8477, 8484, 8484, 8486, 8486, 8488, 8488, 8490, 8493, 8495, 8497, 8499, 8505, 8544, 8579, 12293, 12295, 12321, 12335, 12337, 12341, 12344, 12346, 12353, 12436, 12441, 12442, 12445, 12446, 12449, 12542, 12549, 12588, 12593, 12686, 12704, 12727, 13312, 19893, 19968, 40869, 40960, 42124, 44032, 55203, 63744, 64045, 64256, 64262, 64275, 64279, 64285, 64296, 64298, 64310, 64312, 64316, 64318, 64318, 64320, 64321, 64323, 64324, 64326, 64433, 64467, 64829, 64848, 64911, 64914, 64967, 65008, 65019, 65056, 65059, 65075, 65076, 65101, 65103, 65136, 65138, 65140, 65140, 65142, 65276, 65296, 65305, 65313, 65338, 65343, 65343, 65345, 65370, 65381, 65470, 65474, 65479, 65482, 65487, 65490, 65495, 65498, 65500,];

/*
    As per ECMAScript Language Specification 5th Edition, Section 7.6: ISyntaxToken Names and Identifiers
    IdentifierStart ::
        Can contain Unicode 6.2  categories:
        Uppercase letter (Lu),
        Lowercase letter (Ll),
        Titlecase letter (Lt),
        Modifier letter (Lm),
        Other letter (Lo), or
        Letter number (Nl).
    IdentifierPart ::
        Can contain IdentifierStart + Unicode 6.2  categories:
        Non-spacing mark (Mn),
        Combining spacing mark (Mc),
        Decimal number (Nd),
        Connector punctuation (Pc),
        <ZWNJ>, or
        <ZWJ>.

    Codepoint ranges for ES5 Identifiers are extracted from the Unicode 6.2 specification at:
    http://www.unicode.org/Public/6.2.0/ucd/UnicodeData.txt
*/
const unicodeES5IdentifierStart = [170, 170, 181, 181, 186, 186, 192, 214, 216, 246, 248, 705, 710, 721, 736, 740, 748, 748, 750, 750, 880, 884, 886, 887, 890, 893, 902, 902, 904, 906, 908, 908, 910, 929, 931, 1013, 1015, 1153, 1162, 1319, 1329, 1366, 1369, 1369, 1377, 1415, 1488, 1514, 1520, 1522, 1568, 1610, 1646, 1647, 1649, 1747, 1749, 1749, 1765, 1766, 1774, 1775, 1786, 1788, 1791, 1791, 1808, 1808, 1810, 1839, 1869, 1957, 1969, 1969, 1994, 2026, 2036, 2037, 2042, 2042, 2048, 2069, 2074, 2074, 2084, 2084, 2088, 2088, 2112, 2136, 2208, 2208, 2210, 2220, 2308, 2361, 2365, 2365, 2384, 2384, 2392, 2401, 2417, 2423, 2425, 2431, 2437, 2444, 2447, 2448, 2451, 2472, 2474, 2480, 2482, 2482, 2486, 2489, 2493, 2493, 2510, 2510, 2524, 2525, 2527, 2529, 2544, 2545, 2565, 2570, 2575, 2576, 2579, 2600, 2602, 2608, 2610, 2611, 2613, 2614, 2616, 2617, 2649, 2652, 2654, 2654, 2674, 2676, 2693, 2701, 2703, 2705, 2707, 2728, 2730, 2736, 2738, 2739, 2741, 2745, 2749, 2749, 2768, 2768, 2784, 2785, 2821, 2828, 2831, 2832, 2835, 2856, 2858, 2864, 2866, 2867, 2869, 2873, 2877, 2877, 2908, 2909, 2911, 2913, 2929, 2929, 2947, 2947, 2949, 2954, 2958, 2960, 2962, 2965, 2969, 2970, 2972, 2972, 2974, 2975, 2979, 2980, 2984, 2986, 2990, 3001, 3024, 3024, 3077, 3084, 3086, 3088, 3090, 3112, 3114, 3123, 3125, 3129, 3133, 3133, 3160, 3161, 3168, 3169, 3205, 3212, 3214, 3216, 3218, 3240, 3242, 3251, 3253, 3257, 3261, 3261, 3294, 3294, 3296, 3297, 3313, 3314, 3333, 3340, 3342, 3344, 3346, 3386, 3389, 3389, 3406, 3406, 3424, 3425, 3450, 3455, 3461, 3478, 3482, 3505, 3507, 3515, 3517, 3517, 3520, 3526, 3585, 3632, 3634, 3635, 3648, 3654, 3713, 3714, 3716, 3716, 3719, 3720, 3722, 3722, 3725, 3725, 3732, 3735, 3737, 3743, 3745, 3747, 3749, 3749, 3751, 3751, 3754, 3755, 3757, 3760, 3762, 3763, 3773, 3773, 3776, 3780, 3782, 3782, 3804, 3807, 3840, 3840, 3904, 3911, 3913, 3948, 3976, 3980, 4096, 4138, 4159, 4159, 4176, 4181, 4186, 4189, 4193, 4193, 4197, 4198, 4206, 4208, 4213, 4225, 4238, 4238, 4256, 4293, 4295, 4295, 4301, 4301, 4304, 4346, 4348, 4680, 4682, 4685, 4688, 4694, 4696, 4696, 4698, 4701, 4704, 4744, 4746, 4749, 4752, 4784, 4786, 4789, 4792, 4798, 4800, 4800, 4802, 4805, 4808, 4822, 4824, 4880, 4882, 4885, 4888, 4954, 4992, 5007, 5024, 5108, 5121, 5740, 5743, 5759, 5761, 5786, 5792, 5866, 5870, 5872, 5888, 5900, 5902, 5905, 5920, 5937, 5952, 5969, 5984, 5996, 5998, 6000, 6016, 6067, 6103, 6103, 6108, 6108, 6176, 6263, 6272, 6312, 6314, 6314, 6320, 6389, 6400, 6428, 6480, 6509, 6512, 6516, 6528, 6571, 6593, 6599, 6656, 6678, 6688, 6740, 6823, 6823, 6917, 6963, 6981, 6987, 7043, 7072, 7086, 7087, 7098, 7141, 7168, 7203, 7245, 7247, 7258, 7293, 7401, 7404, 7406, 7409, 7413, 7414, 7424, 7615, 7680, 7957, 7960, 7965, 7968, 8005, 8008, 8013, 8016, 8023, 8025, 8025, 8027, 8027, 8029, 8029, 8031, 8061, 8064, 8116, 8118, 8124, 8126, 8126, 8130, 8132, 8134, 8140, 8144, 8147, 8150, 8155, 8160, 8172, 8178, 8180, 8182, 8188, 8305, 8305, 8319, 8319, 8336, 8348, 8450, 8450, 8455, 8455, 8458, 8467, 8469, 8469, 8473, 8477, 8484, 8484, 8486, 8486, 8488, 8488, 8490, 8493, 8495, 8505, 8508, 8511, 8517, 8521, 8526, 8526, 8544, 8584, 11264, 11310, 11312, 11358, 11360, 11492, 11499, 11502, 11506, 11507, 11520, 11557, 11559, 11559, 11565, 11565, 11568, 11623, 11631, 11631, 11648, 11670, 11680, 11686, 11688, 11694, 11696, 11702, 11704, 11710, 11712, 11718, 11720, 11726, 11728, 11734, 11736, 11742, 11823, 11823, 12293, 12295, 12321, 12329, 12337, 12341, 12344, 12348, 12353, 12438, 12445, 12447, 12449, 12538, 12540, 12543, 12549, 12589, 12593, 12686, 12704, 12730, 12784, 12799, 13312, 19893, 19968, 40908, 40960, 42124, 42192, 42237, 42240, 42508, 42512, 42527, 42538, 42539, 42560, 42606, 42623, 42647, 42656, 42735, 42775, 42783, 42786, 42888, 42891, 42894, 42896, 42899, 42912, 42922, 43000, 43009, 43011, 43013, 43015, 43018, 43020, 43042, 43072, 43123, 43138, 43187, 43250, 43255, 43259, 43259, 43274, 43301, 43312, 43334, 43360, 43388, 43396, 43442, 43471, 43471, 43520, 43560, 43584, 43586, 43588, 43595, 43616, 43638, 43642, 43642, 43648, 43695, 43697, 43697, 43701, 43702, 43705, 43709, 43712, 43712, 43714, 43714, 43739, 43741, 43744, 43754, 43762, 43764, 43777, 43782, 43785, 43790, 43793, 43798, 43808, 43814, 43816, 43822, 43968, 44002, 44032, 55203, 55216, 55238, 55243, 55291, 63744, 64109, 64112, 64217, 64256, 64262, 64275, 64279, 64285, 64285, 64287, 64296, 64298, 64310, 64312, 64316, 64318, 64318, 64320, 64321, 64323, 64324, 64326, 64433, 64467, 64829, 64848, 64911, 64914, 64967, 65008, 65019, 65136, 65140, 65142, 65276, 65313, 65338, 65345, 65370, 65382, 65470, 65474, 65479, 65482, 65487, 65490, 65495, 65498, 65500,];
const unicodeES5IdentifierPart = [170, 170, 181, 181, 186, 186, 192, 214, 216, 246, 248, 705, 710, 721, 736, 740, 748, 748, 750, 750, 768, 884, 886, 887, 890, 893, 902, 902, 904, 906, 908, 908, 910, 929, 931, 1013, 1015, 1153, 1155, 1159, 1162, 1319, 1329, 1366, 1369, 1369, 1377, 1415, 1425, 1469, 1471, 1471, 1473, 1474, 1476, 1477, 1479, 1479, 1488, 1514, 1520, 1522, 1552, 1562, 1568, 1641, 1646, 1747, 1749, 1756, 1759, 1768, 1770, 1788, 1791, 1791, 1808, 1866, 1869, 1969, 1984, 2037, 2042, 2042, 2048, 2093, 2112, 2139, 2208, 2208, 2210, 2220, 2276, 2302, 2304, 2403, 2406, 2415, 2417, 2423, 2425, 2431, 2433, 2435, 2437, 2444, 2447, 2448, 2451, 2472, 2474, 2480, 2482, 2482, 2486, 2489, 2492, 2500, 2503, 2504, 2507, 2510, 2519, 2519, 2524, 2525, 2527, 2531, 2534, 2545, 2561, 2563, 2565, 2570, 2575, 2576, 2579, 2600, 2602, 2608, 2610, 2611, 2613, 2614, 2616, 2617, 2620, 2620, 2622, 2626, 2631, 2632, 2635, 2637, 2641, 2641, 2649, 2652, 2654, 2654, 2662, 2677, 2689, 2691, 2693, 2701, 2703, 2705, 2707, 2728, 2730, 2736, 2738, 2739, 2741, 2745, 2748, 2757, 2759, 2761, 2763, 2765, 2768, 2768, 2784, 2787, 2790, 2799, 2817, 2819, 2821, 2828, 2831, 2832, 2835, 2856, 2858, 2864, 2866, 2867, 2869, 2873, 2876, 2884, 2887, 2888, 2891, 2893, 2902, 2903, 2908, 2909, 2911, 2915, 2918, 2927, 2929, 2929, 2946, 2947, 2949, 2954, 2958, 2960, 2962, 2965, 2969, 2970, 2972, 2972, 2974, 2975, 2979, 2980, 2984, 2986, 2990, 3001, 3006, 3010, 3014, 3016, 3018, 3021, 3024, 3024, 3031, 3031, 3046, 3055, 3073, 3075, 3077, 3084, 3086, 3088, 3090, 3112, 3114, 3123, 3125, 3129, 3133, 3140, 3142, 3144, 3146, 3149, 3157, 3158, 3160, 3161, 3168, 3171, 3174, 3183, 3202, 3203, 3205, 3212, 3214, 3216, 3218, 3240, 3242, 3251, 3253, 3257, 3260, 3268, 3270, 3272, 3274, 3277, 3285, 3286, 3294, 3294, 3296, 3299, 3302, 3311, 3313, 3314, 3330, 3331, 3333, 3340, 3342, 3344, 3346, 3386, 3389, 3396, 3398, 3400, 3402, 3406, 3415, 3415, 3424, 3427, 3430, 3439, 3450, 3455, 3458, 3459, 3461, 3478, 3482, 3505, 3507, 3515, 3517, 3517, 3520, 3526, 3530, 3530, 3535, 3540, 3542, 3542, 3544, 3551, 3570, 3571, 3585, 3642, 3648, 3662, 3664, 3673, 3713, 3714, 3716, 3716, 3719, 3720, 3722, 3722, 3725, 3725, 3732, 3735, 3737, 3743, 3745, 3747, 3749, 3749, 3751, 3751, 3754, 3755, 3757, 3769, 3771, 3773, 3776, 3780, 3782, 3782, 3784, 3789, 3792, 3801, 3804, 3807, 3840, 3840, 3864, 3865, 3872, 3881, 3893, 3893, 3895, 3895, 3897, 3897, 3902, 3911, 3913, 3948, 3953, 3972, 3974, 3991, 3993, 4028, 4038, 4038, 4096, 4169, 4176, 4253, 4256, 4293, 4295, 4295, 4301, 4301, 4304, 4346, 4348, 4680, 4682, 4685, 4688, 4694, 4696, 4696, 4698, 4701, 4704, 4744, 4746, 4749, 4752, 4784, 4786, 4789, 4792, 4798, 4800, 4800, 4802, 4805, 4808, 4822, 4824, 4880, 4882, 4885, 4888, 4954, 4957, 4959, 4992, 5007, 5024, 5108, 5121, 5740, 5743, 5759, 5761, 5786, 5792, 5866, 5870, 5872, 5888, 5900, 5902, 5908, 5920, 5940, 5952, 5971, 5984, 5996, 5998, 6000, 6002, 6003, 6016, 6099, 6103, 6103, 6108, 6109, 6112, 6121, 6155, 6157, 6160, 6169, 6176, 6263, 6272, 6314, 6320, 6389, 6400, 6428, 6432, 6443, 6448, 6459, 6470, 6509, 6512, 6516, 6528, 6571, 6576, 6601, 6608, 6617, 6656, 6683, 6688, 6750, 6752, 6780, 6783, 6793, 6800, 6809, 6823, 6823, 6912, 6987, 6992, 7001, 7019, 7027, 7040, 7155, 7168, 7223, 7232, 7241, 7245, 7293, 7376, 7378, 7380, 7414, 7424, 7654, 7676, 7957, 7960, 7965, 7968, 8005, 8008, 8013, 8016, 8023, 8025, 8025, 8027, 8027, 8029, 8029, 8031, 8061, 8064, 8116, 8118, 8124, 8126, 8126, 8130, 8132, 8134, 8140, 8144, 8147, 8150, 8155, 8160, 8172, 8178, 8180, 8182, 8188, 8204, 8205, 8255, 8256, 8276, 8276, 8305, 8305, 8319, 8319, 8336, 8348, 8400, 8412, 8417, 8417, 8421, 8432, 8450, 8450, 8455, 8455, 8458, 8467, 8469, 8469, 8473, 8477, 8484, 8484, 8486, 8486, 8488, 8488, 8490, 8493, 8495, 8505, 8508, 8511, 8517, 8521, 8526, 8526, 8544, 8584, 11264, 11310, 11312, 11358, 11360, 11492, 11499, 11507, 11520, 11557, 11559, 11559, 11565, 11565, 11568, 11623, 11631, 11631, 11647, 11670, 11680, 11686, 11688, 11694, 11696, 11702, 11704, 11710, 11712, 11718, 11720, 11726, 11728, 11734, 11736, 11742, 11744, 11775, 11823, 11823, 12293, 12295, 12321, 12335, 12337, 12341, 12344, 12348, 12353, 12438, 12441, 12442, 12445, 12447, 12449, 12538, 12540, 12543, 12549, 12589, 12593, 12686, 12704, 12730, 12784, 12799, 13312, 19893, 19968, 40908, 40960, 42124, 42192, 42237, 42240, 42508, 42512, 42539, 42560, 42607, 42612, 42621, 42623, 42647, 42655, 42737, 42775, 42783, 42786, 42888, 42891, 42894, 42896, 42899, 42912, 42922, 43000, 43047, 43072, 43123, 43136, 43204, 43216, 43225, 43232, 43255, 43259, 43259, 43264, 43309, 43312, 43347, 43360, 43388, 43392, 43456, 43471, 43481, 43520, 43574, 43584, 43597, 43600, 43609, 43616, 43638, 43642, 43643, 43648, 43714, 43739, 43741, 43744, 43759, 43762, 43766, 43777, 43782, 43785, 43790, 43793, 43798, 43808, 43814, 43816, 43822, 43968, 44010, 44012, 44013, 44016, 44025, 44032, 55203, 55216, 55238, 55243, 55291, 63744, 64109, 64112, 64217, 64256, 64262, 64275, 64279, 64285, 64296, 64298, 64310, 64312, 64316, 64318, 64318, 64320, 64321, 64323, 64324, 64326, 64433, 64467, 64829, 64848, 64911, 64914, 64967, 65008, 65019, 65024, 65039, 65056, 65062, 65075, 65076, 65101, 65103, 65136, 65140, 65142, 65276, 65296, 65305, 65313, 65338, 65343, 65343, 65345, 65370, 65382, 65470, 65474, 65479, 65482, 65487, 65490, 65495, 65498, 65500,];

function lookupInUnicodeMap(code: CharCode, map: CharCode[]) {
    // Bail out quickly if it couldn't possibly be in the map.
    if (code < map[0]) {
        return false;
    }

    // Perform binary search in one of the Unicode range maps
    let lo = 0;
    let hi: CharCode = map.length;
    let mid: CharCode;

    while (lo + 1 < hi) {
        mid = lo + (hi - lo) / 2;
        // mid has to be even to catch a range's beginning
        mid -= mid % 2;
        if (map[mid] <= code && code <= map[mid + 1]) {
            return true;
        }

        if (code < map[mid]) {
            hi = mid;
        } else {
            lo = mid + 2;
        }
    }

    return false;
}

// #endregion

/**
 * 判断一个字符是否可作为标识符首字母。
 * @param ch 要判断的字符。
 * @param useES3Identifier 是否使用 ES3 码表。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isIdentifierStart(ch: CharCode, useES3Identifier?: boolean) {
    return ch >= CharCode.a && ch <= CharCode.z ||
        ch >= CharCode.A && ch <= CharCode.Z ||
        ch === CharCode.underline || ch === CharCode.dollar ||
        ch >= CharCode.MAX_ASCII && lookupInUnicodeMap(ch, useES3Identifier ? unicodeES3IdentifierStart : unicodeES5IdentifierStart);
}

/**
 * 判断一个字符是否作为标识符主体。
 * @param ch 要判断的字符。
 * @param useES3Identifier 是否使用 ES3 码表。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isIdentifierPart(ch: CharCode, useES3Identifier?: boolean) {
    return ch >= CharCode.a && ch <= CharCode.z ||
        ch >= CharCode.A && ch <= CharCode.Z ||
        ch >= CharCode.num0 && ch <= CharCode.num9 ||
        ch === CharCode.dollar || ch === CharCode.underline ||
        ch >= CharCode.MAX_ASCII && lookupInUnicodeMap(ch, useES3Identifier ? unicodeES3IdentifierPart : unicodeES5IdentifierPart);
}
