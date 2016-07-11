/**
 * @fileOverview 全局编译器功能
 * @author xuld@vip.qq.com
 */

/**
 * 获取或设置编译器全局配置。
 */
export var options = {

    // #region 词法

    /**
     * 是否使用 ES3 规范的标识符编码。
     */
    useES3Identifier: false,

    /**
     * 允许出现 Unix #! 标记。
     */
    disallowShebang: false,

    /**
     * 允许出现未关闭的多行字符串和注释。
     */
    disallowUnterminatedLiteral: false,

    /**
     * 允许出现 Git 冲突标记(<<<<<<<)。
     */
    disallowGitConflictMarker: false,

    /**
     * 允许使用 Unicode 编码的关键字字符串。
     */
    disallowEscapedKeyword: false,

    // #endregion

    // #region 语法

    /**
     * 允许省略语句末尾的分号。
     */
    disallowMissingSemicolon: false,

    /**
     * 使用智能分号插入策略。使用该策略可以减少省略分号引发的语法错误。
     */
    smartSemicolonInsertion: false,

    /**
     * 允许省略条件表达式的括号。
     */
    disallowMissingParenthese: false,

    /**
     * 允许省略 switch (true) 中的 (true)。
     */
    disallowMissingSwitchCondition: false,

    /**
     * 允许使用 case else 语法代替 default。
     */
    disallowCaseElse: false,

    /**
     * 允许使用 for..of 语法。
     */
    disallowForOf: false,

    /**
     * 允许使用 for..of 逗号语法。
     */
    disallowForOfCommaExpression: false,

    /**
     * 允许使用 for..to 语法。
     */
    disallowForTo: false,

    /**
     * 允许使用 throw 空参数语法。
     */
    disallowRethrow: false,

    /**
     * 允许使用 with 语句定义语法。
     */
    disallowWithVaribale: false,

    /**
     * 允许省略 try 语句块的 {}。
     */
    disallowMissingTryBlock: false,

    /**
     * 允许省略 catch 分句的变量名。
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

    // #endregion

    ///**
    // * 获取或设置当前解析的语法版本。
    // */
    //languageVersion: LanguageVersion;

};

/**
 * 表示支持的语法版本。
 */
export enum LanguageVersion {

    /**
     * TealScript 0.1。
     */
    tealScript,

    /**
     * TypeScript 1.8。
     */
    typeScript,

    /**
     * JavaScript 7(ECMAScript-262, the 7th verison)。
     */
    javaScript,

    /**
     * JavaScript 3(ECMAScript-262, the 3rd verison)。
     */
    javaScript3,

}

/**
 * 存储已共享的字符串。
 */
export var interns: { [key: string]: string; } = Object.create(null);

/**
 * 共享相同字符串的内存。
 * @param value 要恭喜的字符串。
 */
export function intern(value: string) {
    return interns[value] || (interns[value] = value);
}

/**
 * 报告一个错误。
 * @param type 错误的类型。
 * @param message 错误的信息。
 * @param args 格式化错误的参数。
 */
export function error(type: ErrorType, fileName: string, start: number, end: number, message: string, ...args: any[]) {

}

/**
 * 表示错误类型。
 */
export enum ErrorType {

    /**
     * 词法解析错误。
     */
    lexicalError,

    /**
     * 语法解析错误。
     */
    syntaxError,

    /**
     * 语义分析错误。
     */
    resolveError

}
