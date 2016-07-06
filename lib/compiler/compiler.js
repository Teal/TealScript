/**
 * 表示当前的编译器配置。
 */
exports.options = {};
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
 * 指示如何解析注释。
 */
(function (ParseCommentsOption) {
    /**
     * 不解析注释。
     */
    ParseCommentsOption[ParseCommentsOption["none"] = 0] = "none";
    /**
     * 仅解析单行注释。
     */
    ParseCommentsOption[ParseCommentsOption["singleLine"] = 1] = "singleLine";
    /**
     * 仅解析多行注释。
     */
    ParseCommentsOption[ParseCommentsOption["multiLine"] = 2] = "multiLine";
    /**
     * 仅解析文档注释。
     */
    ParseCommentsOption[ParseCommentsOption["jsDoc"] = 6] = "jsDoc";
    /**
     * 解析全部注释。
     */
    ParseCommentsOption[ParseCommentsOption["all"] = 3] = "all";
})(exports.ParseCommentsOption || (exports.ParseCommentsOption = {}));
var ParseCommentsOption = exports.ParseCommentsOption;
/**
 * 报告一个错误。
 * @param type 错误的类型。
 * @param message 错误的信息。
 * @param args 格式化错误的参数。
 */
function error(type, message) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
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
    ErrorType[ErrorType["lexical"] = 0] = "lexical";
    /**
     * 语法解析错误。
     */
    ErrorType[ErrorType["syntax"] = 1] = "syntax";
    /**
     * 语义分析错误。
     */
    ErrorType[ErrorType["resolve"] = 2] = "resolve";
})(exports.ErrorType || (exports.ErrorType = {}));
var ErrorType = exports.ErrorType;
//# sourceMappingURL=compiler.js.map