/**
 * @fileOverview 全局编译器功能
 * @author xuld@vip.qq.com
 */
/**
 * 获取或设置编译器全局配置。
 */
exports.options = {
    // #region 词法
    /**
     * 是否使用 ES3 规范的标识符编码。
     */
    useES3Identifier: false,
    /**
     * 禁止出现 Unix #! 标记。
     */
    disallowShebang: false,
    /**
     * 禁止出现未关闭的多行字符串和注释。
     */
    disallowUnterminatedLiteral: false,
    /**
     * 禁止出现 Git 冲突标记(<<<<<<<)。
     */
    disallowGitConflictMarker: false,
    /**
     * 禁止使用 Unicode 编码的关键字字符串。
     */
    disallowEscapedKeyword: false,
    // #endregion
    // #region 语法
    /**
     * 禁止省略语句末尾的分号。
     */
    disallowMissingSemicolon: false,
    /**
     * 使用智能分号插入策略。使用该策略可以减少省略分号引发的语法错误。
     */
    smartSemicolonInsertion: false,
    /**
     * 禁止省略条件表达式的括号。
     */
    disallowMissingParenthese: false,
    /**
     * 禁止省略 switch (true) 中的 (true)。
     */
    disallowMissingSwitchCondition: false,
    /**
     * 禁止使用 case else 语法代替 default。
     */
    disallowCaseElse: false,
    /**
     * 禁止使用 for..in 兼容变量定义。
     */
    disallowCompatibleForInAndForOf: true,
    /**
     * 禁止使用 for..of 语法。
     */
    disallowForOf: false,
    /**
     * 禁止使用 for..of 逗号语法。
     */
    disallowForOfCommaExpression: false,
    /**
     * 禁止使用 for..to 语法。
     */
    disallowForTo: false,
    /**
     * 禁止使用 throw 空参数语法。
     */
    disallowRethrow: false,
    /**
     * 禁止使用 with 语句定义语法。
     */
    disallowWithVaribale: false,
    /**
     * 禁止省略 try 语句块的 {}。
     */
    disallowMissingTryBlock: false,
    /**
     * 禁止省略 catch 分句的变量名。
     */
    disallowMissingCatchVaribale: false,
    // #endregion
    // #region 功能
    /**
     * 设置是否解析注释。
     */
    parseComments: false,
    /**
     * 解析 <reference /> 注释。此选项要求 {@link parseComments} 为 true。
     */
    parseReferenceComments: false,
    /**
     * 解析 JsDoc 文档注释(/** 段)。此选项要求 {@link parseComments} 为 true。
     */
    parseJsDocComments: false,
    /**
     * 解析 TealDoc 文档注释(/// 段)。此选项要求 {@link parseComments} 为 true。
     */
    parseTealDocComments: false,
    /**
     * 跳过 Jsx 语法(<xx/>)。
     */
    parseJsx: false,
};
/**
 * 表示支持的语法版本。
 */
(function (LanguageVersion) {
    /**
     * TealScript 0.1。
     */
    LanguageVersion[LanguageVersion["tealScript"] = 0] = "tealScript";
    /**
     * TypeScript 1.8。
     */
    LanguageVersion[LanguageVersion["typeScript"] = 1] = "typeScript";
    /**
     * JavaScript 7(ECMAScript-262, the 7th verison)。
     */
    LanguageVersion[LanguageVersion["javaScript"] = 2] = "javaScript";
    /**
     * JavaScript 3(ECMAScript-262, the 3rd verison)。
     */
    LanguageVersion[LanguageVersion["javaScript3"] = 3] = "javaScript3";
})(exports.LanguageVersion || (exports.LanguageVersion = {}));
var LanguageVersion = exports.LanguageVersion;
/**
 * 存储已共享的字符串。
 */
exports.interns = Object.create(null);
/**
 * 共享相同字符串的内存。
 * @param value 要恭喜的字符串。
 */
function intern(value) {
    return exports.interns[value] || (exports.interns[value] = value);
}
exports.intern = intern;
/**
 * 报告一个错误。
 * @param type 错误的类型。
 * @param message 错误的信息。
 * @param args 格式化错误的参数。
 */
function error(type, fileName, start, end, message) {
    var args = [];
    for (var _i = 5; _i < arguments.length; _i++) {
        args[_i - 5] = arguments[_i];
    }
}
exports.error = error;
/**
 * 表示错误类型。
 */
(function (ErrorType) {
    /**
     * 词法解析错误。
     */
    ErrorType[ErrorType["lexicalError"] = 0] = "lexicalError";
    /**
     * 语法解析错误。
     */
    ErrorType[ErrorType["syntaxError"] = 1] = "syntaxError";
    /**
     * 语义分析错误。
     */
    ErrorType[ErrorType["resolveError"] = 2] = "resolveError";
})(exports.ErrorType || (exports.ErrorType = {}));
var ErrorType = exports.ErrorType;
//# sourceMappingURL=compiler.js.map