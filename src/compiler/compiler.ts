
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
     * 设置是否解析注释。
     */
    parseComments?: boolean;

    /**
     * 跳过 Unix #! 标记。
     */
    skipShebang?: boolean;

    /**
     * 跳过未关闭的多行字符串和注释。
     */
    skipUnterminatedLiteral?: boolean;

    /**
     * 跳过 Git 冲突标记(<<<<<<<)。
     */
    skipGitConflictMarker?: boolean;

    /**
     * 跳过 Jsx 语法(<xx/>)。
     */
    parseJsx?: boolean;

    /**
     * 自动插入分号。
     */
    autoInsertSemicolon?: boolean;

    /**
     * 启用更智能的分号插入方式。
     */
    smartSemicolonInsertion: boolean;

    /**
     * 自动插入条件表达式的括号。
     */
    autoInsertParenthese?: boolean;

    /**
     * 自动插入 switch 语句的条件。
     */
    autoInsertSwitchCondition?: boolean;

    /**
     * 允许使用 case else 语法代替 default。
     */
    allowCaseElse?: boolean;

    /**
     * 允许使用 for..of 语法。
     */
    allowForOf?: boolean;

    /**
     * 允许使用 for..to 语法。
     */
    allowForTo?: boolean;

    /**
     * 允许使用 throw 空参数语法。
     */
    allowRethrow?: boolean;

    /**
     * 允许使用 with 语句定义语法。
     */
    allowWithVaribale?: boolean;

    /**
     * 自动插入 try 语句块。
     */
    autoInsertTryStatementBlock?: boolean;

    /**
     * 自动插入 try 语句块。
     */
    allowTryStatementCatchMissingVaribale?: boolean;

    /**
     * 解析 <reference /> 注释。
     */
    parseReferenceComments: boolean;

    /**
     * 解析 Js 文档注释。
     */
    parseJsDoc: boolean;

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
    javaScript,

    /**
     * JavaScript 3(ECMAScript-262, the 3rd verison)。
     */
    javaScript3,

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
