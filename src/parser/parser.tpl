// @file=parser.ts
/**
 * @fileOverview 语法解析器
 * @author xuld@vip.qq.com
 * @generated 此文件使用 `tpack gen-parser` 命令生成。
 */

import {CharCode} from './unicode';
import {TokenType, tokenToString, isKeyword, isReservedWord, isExpressionStart, isDeclarationStart, isModifier, isBindingNameStart, isPredefinedType} from './tokenType';
import {TextRange} from './location';
import {Lexer, LexerOptions} from './lexer';
import * as nodes from './nodes';

/**
 * 表示一个语法解析器。
 * @description 语法解析器可以将源码解析一个语法树。
 */
export class Parser {

    // #region 对外接口

    /**
     * 获取或设置当前语法解析器使用的词法解析器。
     */
    lexer = new Lexer();

    /**
     * 获取当前语法解析器的配置。
     */
    get options(): ParserOptions {
        return this.lexer.options;
    }

    /**
     * 设置当前语法解析器的配置。
     */
    set options(value) {
        this.lexer.options = value;
    }

    /**
     * 解析指定的源文件。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param options 解析的源码位置。
     */
    parse(text: string, start?: number, options?: ParserOptions) {
        return this.parseSourceFile(text || "", start || 0, options);
    }

    /**
     * 从指定的输入解析一个语句。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param fileName 解析的源码位置。
     */
    parseAsStatement(text: string, start?: number, fileName?: string) {
        this.lexer.setSource(text, start, fileName);
        return this.parseStatement();
    }

    /**
     * 从指定的输入解析一个表达式。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param fileName 解析的源码位置。
     */
    parseAsExpression(text: string, start?: number, fileName?: string) {
        this.lexer.setSource(text, start, fileName);
        return this.parseExpression();
    }

    /**
     * 从指定的输入解析一个类型表达式。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param fileName 解析的源码位置。
     */
    parseAsTypeNode(text: string, start?: number, fileName?: string) {
        delete this.lexer.comment;
        this.lexer.setSource(text, start, fileName);
        return this.parseTypeNode();
    }

    /**
     * 报告一个语法错误。
     * @param range 发生错误的位置。
     * @param message 错误的信息。
     * @param args 格式化错误的参数。
     */
    error(range: TextRange, message: string, ...args: any[]) {
        // error(ErrorType.syntaxError, this.lexer.fileName, range.start, range.end, message, ...args);
    }

    // #endregion

    // #region 解析类型节点



    // #endregion

}

/**
 * 表示语法解析的相关配置。
 */
export interface ParserOptions extends LexerOptions {

    /**
     * 禁止省略语句末尾的分号。
     */
    disallowMissingSemicolon?: boolean,

    /**
     * 使用智能分号插入策略。使用该策略可以减少省略分号引发的语法错误。
     */
    useStandardSemicolonInsertion?: boolean,

    /**
     * 禁止省略条件表达式的括号。
     */
    disallowMissingParenthese?: boolean,

    /**
     * 禁止省略 switch (true) 中的 (true)。
     */
    disallowMissingSwitchCondition?: boolean,

    /**
     * 禁止使用 case else 语法代替 default。
     */
    disallowCaseElse?: boolean,

    /**
     * 使用 for..in 兼容变量定义。
     */
    useCompatibleForInAndForOf?: boolean,

    /**
     * 禁止使用 for..of 语法。
     */
    disallowForOf?: boolean,

    /**
     * 禁止使用 for..of 逗号语法。
     */
    disallowForOfCommaExpression?: boolean,

    /**
     * 禁止使用 for..to 语法。
     */
    disallowForTo?: boolean,

    /**
     * 禁止使用 throw 空参数语法。
     */
    disallowRethrow?: boolean,

    /**
     * 禁止使用 with 语句定义语法。
     */
    disallowWithVaribale?: boolean,

    /**
     * 禁止省略 try 语句块的 {}。
     */
    disallowMissingTryBlock?: boolean,

    /**
     * 禁止省略 catch 分句的变量名。
     */
    disallowMissingCatchVaribale?: boolean,

    /**
     * 禁止不含 catch 和 finally 分句的 try 语句。
     */
    disallowSimpleTryBlock?: boolean,

}

/**
 * 表示修饰符的使用场景。
 */
const enum ModifierUsage {

    /**
     * 参数。
     */
    parameter,

    /**
     * 属性。
     */
    property,

    /**
     * 定义。
     */
    declaration,

}

// @file=nodes.ts
/**
 * @fileOverview 语法树节点
 * @generated 此文件使用 `tpack gen-parser` 命令生成。
 */

import {intern} from '../compiler/compiler';
import {TokenType, tokenToString} from './tokenType';
import {TextRange} from './location';
import {NodeVisitor} from './nodeVisitor';

// #region 节点底层

/**
 * 表示一个语法树节点。
 */
export abstract class Node implements TextRange {

    /**
     * 获取当前节点的开始位置(可能不存在)。
     */
    start: number;

    /**
     * 获取当前节点的结束位置(可能不存在)。
     */
    end: number;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     * @returns 返回访问器的处理结果。
     */
    abstract accept(vistior: NodeVisitor);

    /**
     * 遍历当前节点的所有直接子节点，并对每个节点执行 *callback*。
     * @param callback 处理每个子节点的函数。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果遍历是因为 *callback* 返回 false 而中止则返回 false，否则返回 true。
     */
    each(callback: EachCallback, scope?: any) {
        return true;
    }

    /**
     * 遍历当前节点的所有直接和间接子节点，并对每个节点执行 *callback*。
     * @param callback 处理每个子节点的函数。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果遍历是因为 *callback* 返回 false 而中止则返回 false，否则返回 true。
     */
    walk(callback: EachCallback, scope?: any) {
        return this.each(function (childNode: Node) {
            return callback.apply(this, arguments) !== false &&
                childNode.walk(callback, scope);
        }, scope);
    }

}

/**
 * 表示遍历节点的回调函数。
 * @param node 当前的节点。
 * @param key 当前节点的索引或键。
 * @param target 当前正在遍历的目标节点或所在列表。
 * @returns 函数如果返回 false 则表示终止遍历。
 */
type EachCallback = (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void;

/**
 * 表示一个节点列表(<..., ...>。
 */
export class NodeList<T extends Node> extends Array<T> implements TextRange {

    /**
     * 获取当前节点列表开始标记的位置(可能不存在)。
     */
    start: number;

    /**
     * 获取当前节点列表结束标记的位置(可能不存在)。
     */
    end: number;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     * @returns 返回访问器的处理结果。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitNodeList(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每个节点执行 *callback*。
     * @param callback 处理每个子节点的函数。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果遍历是因为 *callback* 返回 false 而中止则返回 false，否则返回 true。
     */
    each(callback: (node: T, key: number, target: NodeList<T>) => boolean | void, scope?: any) {
        for (let i = 0; i < this.length; i++) {
            if (callback.call(scope, this[i], i, this) === false) {
                return false;
            }
        }
        return true;
    }

    /**
     * 遍历当前节点的所有直接和间接子节点，并对每个节点执行 *callback*。
     * @param callback 处理每个子节点的函数。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果遍历是因为 *callback* 返回 false 而中止则返回 false，否则返回 true。
     */
    walk = Node.prototype.walk;

}

// #endregion
