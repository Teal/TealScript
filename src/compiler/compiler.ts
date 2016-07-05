
/**
 * 表示当前的编译器配置。
 */
export var options: CompileOptions = {};

/**
 * 表示一个编译器配置。
 */
export interface CompileOptions {

    /**
     * 获取或设置当前解析的语法版本。
     */
    languageVersion?: LanguageVersion;

    /**
     * 获取或设置是否禁止省略条件表达式的括号。
     */
    disallowMissingParentheses?: boolean;

    /**
     * 设置是否解析注释。
     */
    parseComments?: ParseCommentsOption;

}

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
    javaScript7,

    /**
     * JavaScript 3(ECMAScript-262, the 3rd verison)。
     */
    javaScript3,

}

/**
 * 指示如何解析注释。
 */
export enum ParseCommentsOption {

    /**
     * 不解析注释。
     */
    none,

    /**
     * 仅解析单行注释。
     */
    singleLine = 1 << 0,

    /**
     * 仅解析多行注释。
     */
    multiLine = 1 << 1,

    /**
     * 仅解析文档注释。
     */
    jsDoc = ParseCommentsOption.multiLine | 1 << 2,

    /**
     * 解析全部注释。
     */
    all = ParseCommentsOption.singleLine | ParseCommentsOption.multiLine,

}

/**
 * 报告一个错误。
 * @param type 错误的类型。
 * @param message 错误的信息。
 * @param args 格式化错误的参数。
 */
export function error(type: ErrorType, message: string, ...args: any[]) {

}

/**
 * 表示错误类型。
 */
export enum ErrorType {

    /**
     * 词法解析错误。
     */
    lexical,

    /**
     * 语法解析错误。
     */
    syntax,

    /**
     * 语义分析错误。
     */
    resolve

}
