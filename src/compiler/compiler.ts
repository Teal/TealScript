/**
 * @fileOverview 全局编译器功能
 * @author xuld@vip.qq.com
 */

/**
 * 获取或设置编译器全局配置。
 */
export var options = {

    // #region 语法

    // #endregion

    // #region 功能

    /**
     * 设置是否解析注释。
     */
    parseComments?: boolean,

    /**
     * 解析 <reference /> 注释。此选项要求 {@link parseComments} 为 true。
     */
    parseReferenceComments?: boolean,

    /**
     * 解析 JsDoc 文档注释(/** 段)。此选项要求 {@link parseComments} 为 true。
     */
    parseJsDocComments?: boolean,

    /**
     * 解析 TealDoc 文档注释(/// 段)。此选项要求 {@link parseComments} 为 true。
     */
    parseTealDocComments?: boolean,

    /**
     * 跳过 Jsx 语法(<xx/>)。
     */
    parseJsx?: boolean,

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
