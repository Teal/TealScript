/**
 * @fileOverview 全局编译器功能
 * @author xuld@vip.qq.com
 */
/**
 * 获取或设置编译器全局配置。
 */
exports.options = {
    // #region 语法
    // #endregion
    // #region 功能
    /**
     * 设置是否解析注释。
     */
    parseComments: boolean,
    /**
     * 解析 <reference /> 注释。此选项要求 {@link parseComments} 为 true。
     */
    parseReferenceComments: boolean,
    /**
     * 解析 JsDoc 文档注释(/** 段)。此选项要求 {@link parseComments} 为 true。
     */
    parseJsDocComments: boolean,
    /**
     * 解析 TealDoc 文档注释(/// 段)。此选项要求 {@link parseComments} 为 true。
     */
    parseTealDocComments: boolean,
    /**
     * 跳过 Jsx 语法(<xx/>)。
     */
    parseJsx: boolean,
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