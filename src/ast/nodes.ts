/**
 * @fileOverview 语法树节点
 * @generated 此文件部分使用 `$ tpack gen-nodes` 命令生成。
 */

import {TokenType, tokenToString} from './tokenType';
import {NodeVisitor} from './nodeVisitor';

// #region 节点

/**
 * 表示一个语法树节点。
 */
export abstract class Node {

    /**
     * 获取当前节点的开始位置。如果当前节点是生成的则返回 undefined。
     */
    start: number;

    /**
     * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
     */
    end: number;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    abstract accept(vistior: NodeVisitor);

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return true;
    }

    /**
     * 遍历当前节点的所有直接和间接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    walk(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.each(function (childNode: Node) {
            return callback.apply(this, arguments) !== false &&
                childNode.walk(callback, scope);
        }, scope);
    }

}

/**
 * 表示一个节点列表(<..., ...>。
 */
export class NodeList<T extends Node> extends Array<T> {

    /**
     * 获取当前节点列表的开始位置。如果不存在开始标记则返回 undefined。
     */
    start: number;

    /**
     * 获取当前节点列表的结束位置。如果不存在结束标记则返回 undefined。
     */
    end: number;

    /**
     * 获取当前节点所有分割符（如逗号）的开始位置。如果当前列表无分隔符则返回 undefined。
     */
    seperatorStarts: number[];

    /**
     * 获取当前节点所有分割符（如逗号）的结束位置。如果当前列表无分隔符则返回 undefined。
     */
    get seperatorEnds() { return this.seperatorStarts.map(p => p + 1); }

    /**
     * 判断当前列表是否包含尾随的分隔符（如数组定义中的最后一项是否是逗号）。
     */
    get hasTrailingSeperator() { return this.seperatorStarts.length === this.length; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitNodeList(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: T, key, target) => boolean | void, scope?: any) {
        for (let i = 0; i < this.length; i++) {
            if (callback.call(scope, this[i], i, this) === false) {
                return false;
            }
        }
        return true;
    }

    /**
     * 遍历当前节点的所有直接和间接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    walk(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.each(function (childNode: Node) {
            return callback.apply(this, arguments) !== false &&
                childNode.walk(callback, scope);
        }, scope);
    }

}

/**
 * 表示一个源文件。
 */
export class SourceFile extends Node {

    /**
     * 获取当前源文件的路径。如果当前文件不是从硬盘载入则返回 undefined。
     */
    path: string;

    /**
     * 获取当前源文件的内容。
     */
    content: string;

    /**
     * 获取当前源文件的所有注释。如果未启用注释解析则返回 undefined。
     */
    comments: NodeList<Comment>;

    /**
     * 获取当前源文件的文档注释头。如果未启用文档注释解析则返回 undefined。
     */
    jsDoc: JsDocComment;

    /**
     * 获取当前源文件的所有语句。
     */
    statements: NodeList<Statement>;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitSourceFile(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return (!this.comments || this.comments.each(callback, scope)) &&
            (!this.jsDoc || callback.call(scope, this.jsDoc, "jsDoc", this) !== false) &&
            this.statements.each(callback, scope);
    }

}

// #endregion

// #region 语句

/**
 * 表示一个语句。
 */
export abstract class Statement extends Node {

    /**
     * 判断当前语句末尾是否包含分号。
     */
    get hasSemicolon() { return false; }

}

/**
 * 表示一个空语句(;)。
 */
export class EmptyStatement extends Statement {

    /**
     * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
     */
    get end() { return this.start + 1; }

    /**
     * 判断当前语句末尾是否包含分号。
     */
    get hasSemicolon() { return true; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitEmptyStatement(this);
    }

}

/**
 * 表示一个语句块({...})。
 */
export class Block extends Statement {

    /**
     * 获取当前语句块内的所有语句。
     */
    statements: NodeList<Statement>;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitBlock(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.statements.each(callback, scope);
    }

}

/**
 * 表示一个变量声明语句(var xx = ...)。
 */
export class VariableStatement extends Statement {

    /**
     *
     */
    decorators: NodeList<Decorator>;

    /**
     * 获取当前变量声明语句的格式。
     */
    type: VariableType;

    /**
     * 获取当前变量声明语句的所有变量。
     */
    variables: NodeList<VariableDeclaration>;

    /**
     * 判断当前语句末尾是否包含分号。
     */
    get hasSemicolon() { return this.end > this.variables[this.variables.length - 1].end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitVariableStatement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.decorators.each(callback, scope) &&
            this.variables.each(callback, scope);
    }

}

/**
 * 表示变量的声明格式。
 */
export enum VariableType {

    /**
     * 变量未声明。
     */
    none,

    /**
     * 使用 var 声明。
     */
    var,

    /**
     * 使用 const 声明。
     */
    const,

    /**
     * 使用 let 声明。
     */
    let,

}

/**
 * 表示一个标签语句(xx: ...)。
 */
export class LabeledStatement extends Statement {

    /**
     * 获取当前标签语句的标签部分。
     */
    label: Identifier;

    /**
     * 获取当前标签名后冒号的开始位置。
     */
    colonStart: number;

    /**
     * 获取当前标签名后冒号的结束位置。
     */
    get colonEnd() { return this.colonEnd + 1; }

    /**
     * 获取当前标签语句的主体部分。
     */
    body: Statement;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitLabeledStatement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.label, "label", this) !== false &&
            callback.call(scope, this.body, "body", this) !== false;
    }

}

/**
 * 表示一个表达式语句(...;)。
 */
export class ExpressionStatement extends Statement {

    /**
     * 获取当前表达式语句的主体部分。
     */
    body: Expression;

    /**
     * 判断当前语句末尾是否包含分号。
     */
    get hasSemicolon() { return this.end > this.body.end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitExpressionStatement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.body, "body", this) !== false;
    }

}

/**
 * 表示一个 if 语句(if(...) {...})。
 */
export class IfStatement extends Statement {

    /**
     * 获取当前 if 语句的条件部分。
     */
    condition: Expression;

    /**
     * 获取当前 if 语句的则部分。
     */
    then: Statement;

    /**
     * 获取当前 if 语句的否则部分。如果不含否则部分则返回 undefined。
     */
    else: Statement;

    /**
     * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
     */
    get end() { return (this.else || this.then).end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitIfStatement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.condition, "condition", this) !== false &&
            callback.call(scope, this.then, "then", this) !== false &&
            (!this.else || callback.call(scope, this.else, "else", this) !== false);
    }

}

/**
 * 表示一个 switch 语句(switch(...){...})。
 */
export class SwitchStatement extends Statement {

    /**
     * 获取当前 switch 语句的条件部分。如果当前语句无条件部分则返回 undefined。
     */
    condition: Expression;

    /**
     * 获取当前 switch 语句的所有分支。
     */
    cases: NodeList<CaseClause>;

    /**
     * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
     */
    get end() { return this.cases.end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitSwitchStatement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return (!this.condition || callback.call(scope, this.condition, "condition", this) !== false) &&
            this.cases.each(callback, scope);
    }

}

/**
 * 表示一个 switch 语句的 case 分支(case ...:{...})。
 */
export class CaseClause extends Node {

    /**
     * 获取当前分支的标签部分。如果当前分支是 default 分支则返回 undefined。
     */
    label: Expression;

    /**
     * 获取当前标签名后冒号的开始位置。
     */
    colonStart: number;

    /**
     * 获取当前标签名后冒号的结束位置。
     */
    get colonEnd() { return this.colonEnd + 1; }

    /**
     * 获取当前分支的所有语句。
     */
    statements: NodeList<Statement>;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitCaseClause(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return (!this.label || callback.call(scope, this.label, "label", this) !== false) &&
            this.statements.each(callback, scope);
    }

}

/**
 * 表示一个 for 语句(for(...; ...; ...) {...})。
 */
export class ForStatement extends Statement {

    /**
     * 获取当前 for 语句的初始化部分。如果当前 for 语句不存在初始化语句则返回 undefined。
     */
    initializer: VariableStatement | Expression;

    /**
     * 获取条件部分中首个分号的开始位置。
     */
    firstSemicolonStart: number;

    /**
     * 获取条件部分中首个分号的结束位置。
     */
    get firstSemicolonEnd() { return this.firstSemicolonStart + 1; }

    /**
     * 获取当前 for 语句的条件部分。如果当前 for 语句不存在条件部分则返回 undefined。
     */
    condition: Expression;

    /**
     * 获取条件部分中第二个分号的开始位置。
     */
    secondSemicolonStart: number;

    /**
     * 获取条件部分中第二个分号的结束位置。
     */
    get secondSemicolonEnd() { return this.secondSemicolonStart + 1; }

    /**
     * 获取当前 for 语句的迭代器部分。如果当前 for 语句不存在迭代器部分则返回 undefined。
     */
    iterator: Expression;

    /**
     * 获取当前 for 语句的主体部分。
     */
    body: Statement;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitForStatement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return (!this.initializer || callback.call(scope, this.initializer, "initializer", this) !== false) &&
            (!this.condition || callback.call(scope, this.condition, "condition", this) !== false) &&
            (!this.iterator || callback.call(scope, this.iterator, "iterator", this) !== false) &&
            callback.call(scope, this.body, "body", this) !== false;
    }

}

/**
 * 表示一个 for..in 语句(for(var xx in ...) {...})。
 */
export class ForInStatement extends Statement {

    /**
     * 获取当前 for..in 语句的变量声明格式。如果未声明变量则返回 undefined。
     */
    variableType: VariableType;

    /**
     * 获取当前 for..in 语句的变量名。
     */
    variable: Identifier | ArrayBindingPattern | ObjectBindingPattern;

    /**
     * 获取当前 for..in 语句的迭代部分。
     */
    iterator: Expression;

    /**
     * 获取当前 for..in 语句的主体部分。
     */
    body: Statement;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitForInStatement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.variable, "variable", this) !== false &&
            callback.call(scope, this.iterator, "iterator", this) !== false &&
            callback.call(scope, this.body, "body", this) !== false;
    }

}

/**
 * 表示一个 for..of 语句(for(var xx of ...) {...})。
 */
export class ForOfStatement extends Statement {

    /**
     * 获取当前 for..of 语句的变量声明格式。如果未声明变量则返回 undefined。
     */
    variableType: VariableType;

    /**
     * 获取当前 for..of 语句的变量部分。
     */
    variable: Identifier | ArrayBindingPattern | ObjectBindingPattern;

    /**
     * 获取当前 for..of 语句的迭代部分。
     */
    iterator: Expression;

    /**
     * 获取当前 for..of 语句的主体部分。
     */
    body: Statement;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitForOfStatement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.variable, "variable", this) !== false &&
            callback.call(scope, this.iterator, "iterator", this) !== false &&
            callback.call(scope, this.body, "body", this) !== false;
    }

}

/**
 * 表示一个 for..to 语句(for(var xx = ... to ...) {...})。
 */
export class ForToStatement extends Statement {

    /**
     * 获取当前 for..of 语句的变量声明格式。如果未声明变量则返回 undefined。
     */
    variableType: VariableType;

    /**
     * 获取当前 for..of 语句的变量部分。
     */
    variable: Identifier;

    /**
     * 获取等号的开始位置。如果不存在等号则返回 undefined。
     */
    equalStart: number;

    /**
     * 获取等号的结束位置。如果不存在等号则返回非数字。
     */
    get equalEnd() { return this.equalStart + 1; }

    /**
     * 获取当前 for 语句的初始化部分。如果当前 for 语句不存在初始化语句则返回 undefined。
     */
    initializer: Expression;

    /**
     * 获取当前 for..of 语句的迭代部分。
     */
    iterator: Expression;

    /**
     * 获取当前 for..of 语句的主体部分。
     */
    body: Statement;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitForToStatement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.variable, "variable", this) !== false &&
            (!this.initializer || callback.call(scope, this.initializer, "initializer", this) !== false) &&
            callback.call(scope, this.iterator, "iterator", this) !== false &&
            callback.call(scope, this.body, "body", this) !== false;
    }

}

/**
 * 表示一个 while 语句(while(...) {...})。
 */
export class WhileStatement extends Statement {

    /**
     * 获取当前 while 语句的条件部分。
     */
    condition: Expression;

    /**
     * 获取当前 while 语句的主体部分。
     */
    body: Statement;

    /**
     * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
     */
    get end() { return this.body.end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitWhileStatement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.condition, "condition", this) !== false &&
            callback.call(scope, this.body, "body", this) !== false;
    }

}

/**
 * 表示一个 do..while 语句(do {...} while(...);)。
 */
export class DoWhileStatement extends Statement {

    /**
     * 获取当前 do..while 语句的条件部分。
     */
    condition: Expression;

    /**
     * 获取当前 do..while 语句的主体部分。
     */
    body: Statement;

    /**
     * 判断当前语句末尾是否包含分号。
     */
    get hasSemicolon() { return this.end > this.condition.end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitDoWhileStatement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.condition, "condition", this) !== false &&
            callback.call(scope, this.body, "body", this) !== false;
    }

}

/**
 * 表示一个 continue 语句(continue;)。
 */
export class ContinueStatement extends Statement {

    /**
     * 获取当前 continue 语句的标签部分。如果不存在标签则返回 undefined。
     */
    label: Identifier;

    /**
     * 判断当前语句末尾是否包含分号。
     */
    get hasSemicolon() { return this.end > this.start + 8/*'continue'.length*/; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitContinueStatement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return (!this.label || callback.call(scope, this.label, "label", this) !== false);
    }

}

/**
 * 表示一个 break 语句(break;)。
 */
export class BreakStatement extends Statement {

    /**
     * 获取当前 break 语句的标签部分。如果不存在标签部分则返回 undefined。
     */
    label: Identifier;

    /**
     * 判断当前语句末尾是否包含分号。
     */
    get hasSemicolon() { return this.end > this.start + 5/*'break'.length*/; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitBreakStatement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return (!this.label || callback.call(scope, this.label, "label", this) !== false);
    }

}

/**
 * 表示一个 return 语句(return ...;)。
 */
export class ReturnStatement extends Statement {

    /**
     * 获取当前 return 语句的返回值部分。如果不存在返回值部分则返回 undefined。
     */
    value: Expression;

    /**
     * 判断当前语句末尾是否包含分号。
     */
    get hasSemicolon() { return this.end > (this.value ? this.value.end : this.start + 6/*'return'.length*/); }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitReturnStatement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return (!this.value || callback.call(scope, this.value, "value", this) !== false);
    }

}

/**
 * 表示一个 throw 语句(throw ...;)。
 */
export class ThrowStatement extends Statement {

    /**
     * 获取当前 throw 语句的参数部分。
     */
    value: Expression;

    /**
     * 判断当前语句末尾是否包含分号。
     */
    get hasSemicolon() { return this.end > (this.value ? this.value.end : this.start + 6/*'return'.length*/); }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitThrowStatement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.value, "value", this) !== false;
    }

}

/**
 * 表示一个 try 语句(try {...} catch(e) {...})。
 */
export class TryStatement extends Statement {

    /**
     * 获取当前 try 语句的 try 部分。
     */
    try: Statement;

    /**
     * 获取当前 try 语句的 catch 部分。
     */
    catch: CatchClause;

    /**
     * 获取当前 try 语句的 finally 部分。
     */
    finally: FinallyClause;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitTryStatement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.try, "try", this) !== false &&
            callback.call(scope, this.catch, "catch", this) !== false &&
            callback.call(scope, this.finally, "finally", this) !== false;
    }

}

/**
 * 表示一个 try 语句的 catch 分句(catch(e) {...})。
 */
export class CatchClause extends Node {

    /**
     * 获取异常变量的开括号的开始位置。
     */
    openParanStart: number;

    /**
     * 获取异常变量的开括号的结束位置。
     */
    get openParanEnd() { return this.openParanStart + 1; }

    /**
     * 获取当前 catch 分句的变量名
     */
    variable: Identifier;

    /**
     * 获取异常变量的闭括号的开始位置。
     */
    closeParanStart: number;

    /**
     * 获取异常变量的闭括号的结束位置。
     */
    get closeParanEnd() { return this.closeParanStart + 1; }

    /**
     * 获取当前 catch 分句的主体部分。
     */
    body: Statement;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitCatchClause(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.variable, "variable", this) !== false &&
            callback.call(scope, this.body, "body", this) !== false;
    }

}

/**
 * 表示一个 try 语句的 finally 分句(finally {...})。
 */
export class FinallyClause extends Node {

    /**
     * 获取当前 finally 分句的主体部分。
     */
    body: Statement;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitFinallyClause(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.body, "body", this) !== false;
    }

}

/**
 * 表示一个 debugger 语句(debugger;)。
 */
export class DebuggerStatement extends Statement {

    /**
     * 判断当前语句末尾是否包含分号。
     */
    get hasSemicolon() { return this.end > this.start + 8/*'debugger'.length*/; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitDebuggerStatement(this);
    }

}

/**
 * 表示一个 with 语句(with(...) {...})。
 */
export class WithStatement extends Statement {

    /**
     * 获取当前的 with 语句的值部分。
     */
    value: Expression;

    /**
     * 获取当前的 with 语句的主体部分。
     */
    body: Statement;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitWithStatement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.value, "value", this) !== false &&
            callback.call(scope, this.body, "body", this) !== false;
    }

}

// #endregion

// #region 表达式

/**
 * 表示一个表达式。
 */
export abstract class Expression extends Node {

}

/**
 * 表示一个标识符(xx)。
 */
export class Identifier extends Expression {

    /**
     * 获取或设置当前标识符的内容。
     */
    value: string;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitIdentifier(this);
    }

}

/**
 * 表示 null 字面量(null)。
 */
export class NullLiteral extends Expression {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitNullLiteral(this);
    }

}

/**
 * 表示 true 字面量(true)。
 */
export class TrueLiteral extends Expression {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitTrueLiteral(this);
    }

}

/**
 * 表示 false 字面量(false)。
 */
export class FalseLiteral extends Expression {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitFalseLiteral(this);
    }

}

/**
 * 表示一个浮点数字面量(1)。
 */
export class NumericLiteral extends Expression {

    /**
     * 获取或设置当前浮点数的值。
     */
    value: number;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitNumericLiteral(this);
    }

}

/**
 * 表示一个字符串字面量('...')。
 */
export class StringLiteral extends Expression {

    /**
     * 获取或设置当前引号的类型。
     */
    quote: TokenType;

    /**
     * 获取或设置当前字符串的内容。
     */
    value: string;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitStringLiteral(this);
    }

}

/**
 * 表示一个正则表达式字面量(/.../)。
 */
export class RegExpLiteral extends Expression {

    /**
     * 获取或设置当前斜杠的类型。
     */
    slash: TokenType;

    /**
     * 获取或设置当前正则表达式的内容。
     */
    value: string;

    /**
     * 获取当前正则表达式的标志部分。如果不存在标志则返回 undefined。
     */
    flags: Identifier;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitRegExpLiteral(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return (!this.flags || callback.call(scope, this.flags, "flags", this) !== false);
    }

}

/**
 * 表示一个模板字符串字面量(`...`)。
 */
export class TemplateStringLiteral extends StringLiteral {

    /**
     * 获取当前模板字符串的标签部分。如果不存在标签则返回 undefined。
     */
    tag: Identifier;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitTemplateStringLiteral(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return (!this.tag || callback.call(scope, this.tag, "tag", this) !== false);
    }

}

/**
 * 表示一个数组字面量([...])。
 */
export class ArrayLiteral extends Expression {

    /**
     * 获取当前数组字面量的所有项。
     */
    elements: NodeList<Expression>;

    /**
     * 获取当前节点的开始位置。如果当前节点是生成的则返回 undefined。
     */
    get start() { return this.elements.start; }

    /**
     * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
     */
    get end() { return this.elements.end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitArrayLiteral(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.elements.each(callback, scope);
    }

}

/**
 * 表示一个对象字面量({x: ...})。
 */
export class ObjectLiteral extends Expression {

    /**
     * 获取当前对象字面量的所有项。
     */
    elements: NodeList<ObjectLiteralElement>;

    /**
     * 获取当前节点的开始位置。如果当前节点是生成的则返回 undefined。
     */
    get start() { return this.elements.start; }

    /**
     * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
     */
    get end() { return this.elements.end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitObjectLiteral(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.elements.each(callback, scope);
    }

}

/**
 * 表示一个对象字面量项。
 */
export class ObjectLiteralElement extends Node {

    /**
     * 获取当前对象字面量项的键部分。
     */
    name: Identifier | StringLiteral | NumericLiteral;

    /**
     * 获取当前变量名后冒号的开始位置。如果当前变量后不跟冒号则返回 undefined。
     */
    colonStart: number;

    /**
     * 获取当前变量名后冒号的结束位置。如果当前变量后不跟冒号则返回非数字。
     */
    get colonEnd() { return this.colonEnd + 1; }

    /**
     * 获取当前对象字面量项的值部分。如果当前键值对省略了键，则返回键部分。
     */
    value: Expression;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitObjectLiteralElement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.name, "name", this) !== false &&
            callback.call(scope, this.value, "value", this) !== false;
    }

}

/**
 * 表示 this 字面量(this)。
 */
export class ThisLiteral extends Expression {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitThisLiteral(this);
    }

}

/**
 * 表示 super 字面量(super)。
 */
export class SuperLiteral extends Expression {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitSuperLiteral(this);
    }

}

/**
 * 表示一个括号表达式((...))。
 */
export class ParenthesizedExpression extends Expression {

    /**
     * 获取当前括号表达式的主体部分。
     */
    body: Expression;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitParenthesizedExpression(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.body, "body", this) !== false;
    }

}

/**
 * 表示一个条件表达式(... ? ... : ...)。
 */
export class ConditionalExpression extends Expression {

    /**
     * 获取当前条件表达式的条件部分。
     */
    condition: Expression;

    /**
     * 获取当前条件表达式的则部分。
     */
    then: Expression;

    /**
     * 获取当前条件表达式的否则部分。
     */
    else: Expression;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitConditionalExpression(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.condition, "condition", this) !== false &&
            callback.call(scope, this.then, "then", this) !== false &&
            callback.call(scope, this.else, "else", this) !== false;
    }

}

/**
 * 表示一个成员调用表达式(x.y)。
 */
export class MemberCallExpression extends Expression {

    /**
     * 获取当前调用的目标部分。
     */
    target: Expression;

    /**
     * 获取当前调用的参数部分。
     */
    argument: Identifier;

    /**
     * 获取当前节点的开始位置。如果当前节点是生成的则返回 undefined。
     */
    get start() { return this.target.start; }

    /**
     * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
     */
    get end() { return this.argument.end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitMemberCallExpression(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.target, "target", this) !== false &&
            callback.call(scope, this.argument, "argument", this) !== false;
    }

}

/**
 * 表示一个类调用表达式(x(...))。
 */
export abstract class CallLikeExpression extends Expression {

    /**
     * 获取当前调用的目标部分。
     */
    target: Expression;

    /**
     * 获取当前表达式的所有参数。
     */
    arguments: NodeList<Expression>;

}

/**
 * 表示一个函数调用表达式(x(...))。
 */
export class CallExpression extends CallLikeExpression {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitCallExpression(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.target, "target", this) !== false &&
            this.arguments.each(callback, scope);
    }

}

/**
 * 表示一个 new 表达式(new x(...))。
 */
export class NewExpression extends CallLikeExpression {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitNewExpression(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.target, "target", this) !== false &&
            this.arguments.each(callback, scope);
    }

}

/**
 * 表示一个索引调用表达式(x[...])。
 */
export class IndexCallExpression extends CallLikeExpression {

    /**
     * 获取当前节点的开始位置。如果当前节点是生成的则返回 undefined。
     */
    get start() { return this.target.start; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitIndexCallExpression(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.target, "target", this) !== false &&
            this.arguments.each(callback, scope);
    }

}

/**
 * 表示一个一元运算表达式(+x)。
 */
export class UnaryExpression extends Expression {

    /**
     * 获取当前表达式的运算符。可能的值有：+、-、++、--、!、~、typeof、await。
     */
    operator: TokenType;

    /**
     * 获取当前表达式的运算数。
     */
    operand: Expression;

    /**
     * 判断当前表达式是否是后缀表达式。
     */
    get isPostfix() { return this.end > this.operand.end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitUnaryExpression(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.operand, "operand", this) !== false;
    }

}

/**
 * 表示一个二元运算表达式(x + y)。
 */
export class BinaryExpression extends Expression {

    /**
     * 获取当前表达式的左值部分。
     */
    leftOperand: Expression;

    /**
     * 获取当前表达式的运算符。合法的值为 +、-、*、/、**、^、%、&、|、&&、||、<<、>>、>>>、is、as、instanceof。
     */
    operator: TokenType;

    /**
     * 获取运算符的开始位置。
     */
    operatorStart: number;

    /**
     * 获取运算符的结束位置。
     */
    get operatorEnd() { return this.operatorStart + tokenToString(this.operator).length; }

    /**
     * 获取当前表达式的右值部分。
     */
    rightOperand: Expression;

    /**
     * 获取当前节点的开始位置。如果当前节点是生成的则返回 undefined。
     */
    get start() { return this.leftOperand.start; }

    /**
     * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
     */
    get end() { return this.rightOperand.end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitBinaryExpression(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.leftOperand, "leftOperand", this) !== false &&
            callback.call(scope, this.rightOperand, "rightOperand", this) !== false;
    }

}

/**
 * 表示一个箭头函数(x => ...)。
 */
export class LambdaLiteral extends Expression {

    /**
     * 获取当前箭头函数的所有泛型参数。
     */
    typeParameters: NodeList<GenericParameterDeclaration>;

    /**
     * 获取当前箭头函数的所有参数。
     */
    parameters: NodeList<ParameterDeclaration>;

    /**
     * 获取当前表达式的箭头开始位置。
     */
    arrowStart: number;

    /**
     * 获取当前表达式的箭头结束位置。
     */
    get arrowEnd() { return this.arrowStart + 2; }

    /**
     * 获取当前箭头函数的主体部分。
     */
    body: Block | Expression;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitLambdaLiteral(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.typeParameters.each(callback, scope) &&
            this.parameters.each(callback, scope) &&
            callback.call(scope, this.body, "body", this) !== false;
    }

}

/**
 * 表示一个 yield 表达式(yield xx)。
 */
export class YieldExpression extends Statement {

    /**
     * 获取当前表达式的 * 的开始位置。如果当前表达式无 * 则返回 undefined。
     */
    asteriskStart: number;

    /**
     * 获取当前表达式的 * 的结束位置。如果当前表达式无 * 则返回非数字。
     */
    get asteriskEnd() { return this.asteriskStart + 1; }

    /**
     * 获取 yield 表达式的主体部分。
     */
    body: Expression;

    /**
     * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
     */
    get end() { return this.body ? this.body.end : this.start + 5/*'yield'.length*/; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitYieldExpression(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.body, "body", this) !== false;
    }

}

/**
 * 表示一个类型转换表达式(<T>xx)。
 */
export class CastExpression extends Expression {

    /**
     * 获取当前表达式的 < 的开始位置。
     */
    lessThanStart: number;

    /**
     * 获取当前表达式的 < 的结束位置。
     */
    get lessThanEnd() { return this.lessThanStart + 1; }

    /**
     * 获取当前类型转换表达式的类型部分。
     */
    type: Expression;

    /**
     * 获取当前表达式的 > 的开始位置。
     */
    greaterThanStart: number;

    /**
     * 获取当前表达式的 > 的结束位置。
     */
    get greaterThanEnd() { return this.greaterThanStart + 1; }

    /**
     * 获取当前类型转换表达式的主体部分。
     */
    body: Expression;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitCastExpression(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.type, "type", this) !== false &&
            callback.call(scope, this.body, "body", this) !== false;
    }

}

/**
 * 表示内置类型字面量(number)。
 */
export class PredefinedTypeLiteral extends Expression {

    /**
     * 获取字面量所表示的类型。可能的返回值有 void、number、string、boolean、any。
     */
    type: TokenType;

    /**
     * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
     */
    get end() { return this.start + tokenToString(this.type).length; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitPredefinedTypeLiteral(this);
    }

}

/**
 * 表示一个泛型表达式(Array<T>)。
 */
export class GenericTypeExpression extends Expression {

    /**
     * 获取当前泛型表达式的元素部分。
     */
    element: Expression;

    /**
     * 获取当前泛型表达式的所有参数。
     */
    genericArguments: NodeList<Expression>;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitGenericTypeExpression(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.element, "element", this) !== false &&
            this.genericArguments.each(callback, scope);
    }

}

/**
 * 表示一个数组类型表达式(T[])。
 */
export class ArrayTypeExpression extends Expression {

    /**
     * 获取当前数组类型的基础类型。
     */
    element: Expression;

    /**
     * 获取当前表达式的 [ 的开始位置。
     */
    openBracketStart: number;

    /**
     * 获取当前表达式的 [ 的结束位置。
     */
    get openBracketEnd() { return this.openBracketStart + 1; }

    /**
     * 获取当前表达式的 ] 的开始位置。
     */
    closeBracketStart: number;

    /**
     * 获取当前表达式的 ] 的结束位置。
     */
    get closeBracketEnd() { return this.closeBracketStart + 1; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitArrayTypeExpression(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.element, "element", this) !== false;
    }

}

/**
 * 表示一个 JSX 节点（<div>...</div>)。
 */
export abstract class JsxNode extends Expression {

}

/**
 * 表示一个 JSX 标签（<div>...</div>)。
 */
export class JsxElement extends JsxNode {

    /**
     * 获取当前标签的名字。
     */
    tagName: Expression;

    /**
     * 获取当前标签的属性。
     */
    attributes: NodeList<JsxAttribute>;

    /**
     * 获取当前标签的子节点。
     */
    children: NodeList<JsxNode>;

    /**
     * 获取斜杠的开始位置。如果当前标签不含斜杠则返回 undefined。
     */
    slashStart: number;

    /**
     * 获取斜杠的结束位置。如果当前标签不含斜杠则返回非数字。
     */
    get slashEnd() { return this.slashStart + 1; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitJsxElement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.tagName, "tagName", this) !== false &&
            this.attributes.each(callback, scope) &&
            this.children.each(callback, scope);
    }

}

/**
 * 表示一个 JSX 标签属性（id="a")。
 */
export class JsxAttribute extends JsxNode {

    /**
     * 获取当前属性的名字。
     */
    name: Identifier;

    /**
     * 获取等号的开始位置。
     */
    equalStart: number;

    /**
     * 获取等号的结束位置。
     */
    get equalEnd() { return this.equalStart + 1; }

    /**
     * 获取当前属性的值。如果不存在值则返回 undefined。
     */
    value: JsxExpression | JsxText;

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.name, "name", this) !== false &&
            (!this.value || callback.call(scope, this.value, "value", this) !== false);
    }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitJsxAttribute(this);
    }

}

/**
 * 表示一个 JSX 表达式（{...})。
 */
export class JsxExpression extends JsxNode {

    /**
     * 获取当前表达式的主体。
     */
    body: Expression;

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.body, "body", this) !== false;
    }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitJsxExpression(this);
    }
}

/**
 * 表示一个 JSX 文本（{...})。
 */
export class JsxText extends JsxNode {

    /**
     * 获取当前文本的值。
     */
    value: string;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitJsxText(this);
    }
}

/**
 * 表示一个 JSX 文本（{...})。
 */
export class JsxClosingElement extends JsxNode {

    /**
     * 获取当前标签的名字。
     */
    tagName: Expression;

    /**
     * 获取斜杠的开始位置。
     */
    slashStart: number;

    /**
     * 获取斜杠的结束位置。
     */
    get slashEnd() { return this.slashStart + 1; }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.tagName, "tagName", this) !== false;
    }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitJsxClosingElement(this);
    }

}

// #endregion

// #region 成员

/**
 * 表示一个成员（如方法、字段、类等）定义。
 */
export abstract class MemberDefinition extends Statement {

    /**
     * 获取当前成员的所有注解。
     */
    decorators: NodeList<Decorator>;

    /**
     * 获取当前成员的修饰符。
     */
    modifiers: NodeList<Modifier>;

    /**
     * 获取当前成员的名字。如果当前成员是匿名的则返回 undefined。
     */
    name: Identifier;

}

/**
 * 表示一个描述器(@xx(...))。
 */
export class Decorator extends Node {

    /**
     * 获取当前描述器的主体部分。
     */
    body: Expression;

    /**
     * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
     */
    get end() { return this.body.end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitDecorator(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.body, "body", this) !== false;
    }

}

/**
 * 表示一个修饰符(public)。
 */
export class Modifier extends Node {

    /**
     * 获取当前修饰符的类型。可能的值有：static、abstract、public、protected、private。
     */
    type: TokenType;

    /**
     * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
     */
    get end() { return this.start + tokenToString(this.type).length; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitModifier(this);
    }

}

/**
 * 表示一个可以包含子成员的容器成员定义。
 */
export abstract class MemberContainerDefinition extends MemberDefinition {

    /**
     * 获取当前容器内的所有成员。
     */
    members: NodeList<MemberDefinition>;

}

/**
 * 表示一个类型（如类、接口）定义。
 */
export abstract class TypeDefinition extends MemberContainerDefinition {

    /**
     * 获取当前类型的继承列表。
     */
    extends: NodeList<Expression>;

    /**
     * 获取当前类型的实现列表。
     */
    implements: NodeList<Expression>;

    /**
     * 获取当前类型定义的泛型形参列表。如果当前定义不是泛型则返回 undefined。
     */
    genericParameters: NodeList<GenericParameterDeclaration>;

}

/**
 * 表示一个类定义(@class ...)。
 */
export class ClassDefinition extends TypeDefinition {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitClassDefinition(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.extends.each(callback, scope) &&
            this.implements.each(callback, scope) &&
            (!this.genericParameters || this.genericParameters.each(callback, scope)) &&
            this.members.each(callback, scope) &&
            this.decorators.each(callback, scope) &&
            this.modifiers.each(callback, scope) &&
            (!this.name || callback.call(scope, this.name, "name", this) !== false);
    }

}

/**
 * 表示一个接口定义。
 */
export class InterfaceDefinition extends TypeDefinition {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitInterfaceDefinition(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.extends.each(callback, scope) &&
            this.implements.each(callback, scope) &&
            (!this.genericParameters || this.genericParameters.each(callback, scope)) &&
            this.members.each(callback, scope) &&
            this.decorators.each(callback, scope) &&
            this.modifiers.each(callback, scope) &&
            (!this.name || callback.call(scope, this.name, "name", this) !== false);
    }

}

/**
 * 表示一个枚举定义。
 */
export class EnumDefinition extends TypeDefinition {

    /**
     * 获取当前容器内的所有成员。
     */
    members: NodeList<EnumMemberDefinition>;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitEnumDefinition(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.members.each(callback, scope) &&
            this.extends.each(callback, scope) &&
            this.implements.each(callback, scope) &&
            (!this.genericParameters || this.genericParameters.each(callback, scope)) &&
            this.decorators.each(callback, scope) &&
            this.modifiers.each(callback, scope) &&
            (!this.name || callback.call(scope, this.name, "name", this) !== false);
    }

}

/**
 * 表示一个扩展定义。
 */
export class ExtensionDefinition extends MemberContainerDefinition {

    /**
     * 获取当前要扩展的目标类型表达式。
     */
    targetType: Expression;

    /**
     * 获取当前类型的基类型列表。
     */
    implements: NodeList<Expression>;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitExtensionDefinition(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.targetType, "targetType", this) !== false &&
            this.implements.each(callback, scope) &&
            this.members.each(callback, scope) &&
            this.decorators.each(callback, scope) &&
            this.modifiers.each(callback, scope) &&
            (!this.name || callback.call(scope, this.name, "name", this) !== false);
    }

}

/**
 * 表示一个命名空间定义。
 */
export class NamespaceDefinition extends MemberContainerDefinition {

    /**
     * 获取当前的命名空间。
     */
    names: NodeList<Identifier>;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitNamespaceDefinition(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.names.each(callback, scope) &&
            this.members.each(callback, scope) &&
            this.decorators.each(callback, scope) &&
            this.modifiers.each(callback, scope) &&
            (!this.name || callback.call(scope, this.name, "name", this) !== false);
    }

}

/**
 * 表示一个模块。
 */
export class ModuleDefinition extends MemberContainerDefinition {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitModuleDefinition(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.members.each(callback, scope) &&
            this.decorators.each(callback, scope) &&
            this.modifiers.each(callback, scope) &&
            (!this.name || callback.call(scope, this.name, "name", this) !== false);
    }

}

/**
 * 表示一个类型子成员定义。
 */
export class TypeMemberDefinition extends MemberDefinition {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitTypeMemberDefinition(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.decorators.each(callback, scope) &&
            this.modifiers.each(callback, scope) &&
            (!this.name || callback.call(scope, this.name, "name", this) !== false);
    }

}

/**
 * 表示一个字段定义。
 */
export class FieldDefinition extends TypeMemberDefinition {

    /**
     * 获取当前字段的所有变量。
     */
    variables: NodeList<VariableDeclaration>;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitFieldDefinition(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.variables.each(callback, scope) &&
            this.decorators.each(callback, scope) &&
            this.modifiers.each(callback, scope) &&
            (!this.name || callback.call(scope, this.name, "name", this) !== false);
    }

}

/**
 * 表示一个方法或属性定义。
 */
export class MethodOrPropertyDefinition extends TypeMemberDefinition {

    /**
     * 获取当前成员的返回类型。
     */
    returnType: Expression;

    /**
     * 获取当前成员被显式声明的所有者。
     */
    explicitType: Expression;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitMethodOrPropertyDefinition(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.returnType, "returnType", this) !== false &&
            callback.call(scope, this.explicitType, "explicitType", this) !== false &&
            this.decorators.each(callback, scope) &&
            this.modifiers.each(callback, scope) &&
            (!this.name || callback.call(scope, this.name, "name", this) !== false);
    }

}

/**
 * 表示一个属性或索引器定义。
 */
export class PropertyOrIndexerDefinition extends MethodOrPropertyDefinition {

    /**
     * 获取访问器的主体。（可能为 null）
     */
    body: Block;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitPropertyOrIndexerDefinition(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.body, "body", this) !== false &&
            callback.call(scope, this.returnType, "returnType", this) !== false &&
            callback.call(scope, this.explicitType, "explicitType", this) !== false &&
            this.decorators.each(callback, scope) &&
            this.modifiers.each(callback, scope) &&
            (!this.name || callback.call(scope, this.name, "name", this) !== false);
    }

}

/**
 * 表示一个属性定义。
 */
export class PropertyDefinition extends MemberDefinition {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitPropertyDefinition(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.decorators.each(callback, scope) &&
            this.modifiers.each(callback, scope) &&
            (!this.name || callback.call(scope, this.name, "name", this) !== false);
    }

}

/**
 * 表示一个索引器定义。
 */
export class IndexerDefinition extends PropertyOrIndexerDefinition {

    /**
     * 获取当前定义的参数列表。
     */
    parameters: ParameterDeclaration;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitIndexerDefinition(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.parameters, "parameters", this) !== false &&
            callback.call(scope, this.body, "body", this) !== false &&
            callback.call(scope, this.returnType, "returnType", this) !== false &&
            callback.call(scope, this.explicitType, "explicitType", this) !== false &&
            this.decorators.each(callback, scope) &&
            this.modifiers.each(callback, scope) &&
            (!this.name || callback.call(scope, this.name, "name", this) !== false);
    }

}

/**
 * 表示一个方法或构造函数定义。
 */
export class MethodOrConstructorDefinition extends MethodOrPropertyDefinition {

    /**
     * 获取当前函数定义的参数列表。
     */
    parameters: ParameterDeclaration;

    /**
     * 获取当前函数定义的主体。
     */
    body: Block;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitMethodOrConstructorDefinition(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.parameters, "parameters", this) !== false &&
            callback.call(scope, this.body, "body", this) !== false &&
            callback.call(scope, this.returnType, "returnType", this) !== false &&
            callback.call(scope, this.explicitType, "explicitType", this) !== false &&
            this.decorators.each(callback, scope) &&
            this.modifiers.each(callback, scope) &&
            (!this.name || callback.call(scope, this.name, "name", this) !== false);
    }

}

/**
 * 表示一个方法定义。
 */
export class MethodDefinition extends MethodOrConstructorDefinition {

    /**
     * 获取成员的泛型参数。
     */
    genericParameters: NodeList<GenericParameterDeclaration>;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitMethodDefinition(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.genericParameters.each(callback, scope) &&
            callback.call(scope, this.parameters, "parameters", this) !== false &&
            callback.call(scope, this.body, "body", this) !== false &&
            callback.call(scope, this.returnType, "returnType", this) !== false &&
            callback.call(scope, this.explicitType, "explicitType", this) !== false &&
            this.decorators.each(callback, scope) &&
            this.modifiers.each(callback, scope) &&
            (!this.name || callback.call(scope, this.name, "name", this) !== false);
    }

}

/**
 * 表示一个构造函数定义。
 */
export class ConstructorDefinition extends MethodOrConstructorDefinition {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitConstructorDefinition(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.parameters, "parameters", this) !== false &&
            callback.call(scope, this.body, "body", this) !== false &&
            callback.call(scope, this.returnType, "returnType", this) !== false &&
            callback.call(scope, this.explicitType, "explicitType", this) !== false &&
            this.decorators.each(callback, scope) &&
            this.modifiers.each(callback, scope) &&
            (!this.name || callback.call(scope, this.name, "name", this) !== false);
    }

}

/**
 * 表示一个枚举的成员定义。
 */
export class EnumMemberDefinition extends TypeMemberDefinition {

    /**
     * 获取当前枚举成员的初始化表达式（可能为 null）。
     */
    initializer: Expression;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitEnumMemberDefinition(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.initializer, "initializer", this) !== false &&
            this.decorators.each(callback, scope) &&
            this.modifiers.each(callback, scope) &&
            (!this.name || callback.call(scope, this.name, "name", this) !== false);
    }

}

/**
 * 表示一个 import 指令(import xx from '...';)。
 */
export class ImportDirective extends Statement {

    /**
     * 获取当前导入的元素列表。
     */
    elements: NodeList<NameImportClause | NamespaceImportClause>;

    /**
     * 获取当前导入项的值部分。
     */
    from: StringLiteral;

    /**
     * 获取当前导入声明的 from 开始位置。如果当前导入声明不含 from 则返回 undefined。
     */
    fromStart: number;

    /**
     * 获取当前导入声明的 from 结束位置。如果当前导入声明不含 from 则返回非数字。
     */
    get fromEnd() { return this.fromStart + 3; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitImportDirective(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.elements.each(callback, scope) &&
            callback.call(scope, this.from, "from", this) !== false;
    }

}

/**
 * 表示一个 import = 指令(import xx = require("");)。
 */
export class ImportEqualsDirective extends Statement {

    /**
     * 获取当前导入的元素列表。
     */
    variable: Identifier | ArrayBindingPattern | ObjectBindingPattern;

    /**
     * 获取当前导入声明的等号开始位置。
     */
    equalStart: number;

    /**
     * 获取当前导入声明的等号结束位置。
     */
    get equalEnd() { return this.equalStart + 3; }

    /**
     * 获取当前导入项的值部分。
     */
    value: Expression;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitImportEqualsDirective(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.variable, "variable", this) !== false &&
            callback.call(scope, this.value, "value", this) !== false;
    }

}

/**
 * 表示一个名字导入声明项(a as b)。
 */
export class NameImportClause extends Node {

    /**
     * 获取当前导入的名称。如果导入所有项则返回 undefined。
     */
    name: Identifier;

    /**
     * 获取当前导入声明的 as 开始位置。如果当前导入声明不含 as 则返回 undefined。
     */
    asStart: number;

    /**
     * 获取当前导入声明的 as 结束位置。如果当前导入声明不含 as 则返回非数字。
     */
    get asEnd() { return this.asStart + 3; }

    /**
     * 获取当前导入的别名。
     */
    alias: Identifier;

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return (!this.name || callback.call(scope, this.name, "name", this) !== false) &&
            callback.call(scope, this.alias, "alias", this) !== false;
    }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitNameImportClause(this);
    }
}

/**
 * 表示一个命名空间导入声明项({a as b})。
 */
export class NamespaceImportClause extends Node {

    /**
     * 获取当前导入的项。
     */
    elements: NodeList<NameImportClause>

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.elements.each(callback, scope);
    }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitNamespaceImportClause(this);
    }

}

/**
 * 表示一个 export 指令(export xx from '...';)。
 */
export class ExportDirective extends Statement {

    /**
     * 获取当前导入的元素列表。
     */
    elements: NodeList<NameImportClause | NamespaceImportClause>;

    /**
     * 支持多个对象组成一个单链表。
     */
    from: StringLiteral;

    /**
     * 获取当前导入声明的 from 开始位置。如果当前导入声明不含 from 则返回 undefined。
     */
    fromStart: number;

    /**
     * 获取当前导入声明的 from 结束位置。如果当前导入声明不含 from 则返回非数字。
     */
    get fromEnd() { return this.fromStart + 3; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitExportDirective(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.elements.each(callback, scope) &&
            callback.call(scope, this.from, "from", this) !== false;
    }

}

/**
 * 表示一个 export = 指令(export = 1;)。
 */
export class ExportEqualsDirective extends Statement {

    /**
     * 获取当前导入声明的等号开始位置。
     */
    equalStart: number;

    /**
     * 获取当前导入声明的等号结束位置。
     */
    get equalEnd() { return this.equalStart + 3; }

    /**
     * 获取当前导出项的值部分。
     */
    value: Expression;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitExportEqualsDirective(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.value, "value", this) !== false;
    }

}

// #endregion

// #region 声明

/**
 * 表示一个声明。
 */
export abstract class Declaration extends Node {

    /**
     * 获取当前声明的名字部分。
     */
    name: Identifier | ArrayBindingPattern | ObjectBindingPattern;

}

/**
 * 表示一个数组绑定模式([xx, ...])
 */
export class ArrayBindingPattern extends Node {

    /**
     * 获取当前绑定模式的元素列表。
     */
    elements: NodeList<ArrayBindingElement>;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitArrayBindingPattern(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.elements.each(callback, scope);
    }

}

/**
 * 表示一个数组绑定模式项(xx, ..)
 */
export class ArrayBindingElement extends Declaration {

    /**
     * 获取当前绑定模式项的点点点开始位置。如果当前绑定模式项不含点点点则返回 undefined。
     */
    dotDotDotStart: number;

    /**
     * 获取当前绑定模式项的点点点结束位置。如果当前绑定模式项不含点点点则返回非数字。
     */
    get dotDotDotEnd() { return this.dotDotDotStart + 3; }

    /**
     * 获取当前绑定模式项的等号开始位置。如果当前绑定模式项不含等号则返回 undefined。
     */
    equalStart: number;

    /**
     * 获取当前绑定模式项的等号结束位置。如果当前绑定模式项不含等号则返回非数字。
     */
    get equalEnd() { return this.equalStart + 1; }

    /**
     * 获取当前绑定模式项的初始值。
     */
    initializer: Expression;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitArrayBindingElement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.initializer, "initializer", this) !== false &&
            callback.call(scope, this.name, "name", this) !== false;
    }

}

/**
 * 表示一个对象绑定模式({xx, ...})
 */
export class ObjectBindingPattern extends Node {

    /**
     * 获取当前绑定模式的元素列表。
     */
    elements: NodeList<ObjectBindingElement>;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitObjectBindingPattern(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.elements.each(callback, scope);
    }

}

/**
 * 表示一个对象绑定模式项(xx: y)
 */
export class ObjectBindingElement extends Declaration {

    /**
     * 获取对象绑定模式项的属性名。
     */
    propertyName: Identifier | NumericLiteral | StringLiteral;

    /**
     * 获取当前属性名后冒号的开始位置。如果当前属性后不跟冒号则返回 undefined。
     */
    colonStart: number;

    /**
     * 获取当前属性名后冒号的结束位置。如果当前属性后不跟冒号则返回非数字。
     */
    get colonEnd() { return this.colonEnd + 1; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitObjectBindingElement(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.propertyName, "propertyName", this) !== false &&
            callback.call(scope, this.name, "name", this) !== false;
    }

}

/**
 * 表示一个变量声明(xx = ...)。
 */
export class VariableDeclaration extends Declaration {

    /**
     * 获取当前变量名后冒号的开始位置。如果当前变量后不跟冒号则返回 undefined。
     */
    colonStart: number;

    /**
     * 获取当前变量名后冒号的结束位置。如果当前变量后不跟冒号则返回非数字。
     */
    get colonEnd() { return this.colonEnd + 1; }

    /**
     * 获取当前变量定义的类型。
     */
    type: Expression;

    /**
     * 获取当前变量名后等号的开始位置。如果当前变量后不跟等号则返回 undefined。
     */
    equalStart: number;

    /**
     * 获取当前变量名后等号的结束位置。如果当前变量后不跟等号则返回非数字。
     */
    get equalEnd() { return this.equalStart + 1; }

    /**
     * 获取当前变量的初始值。
     */
    initializer: Expression;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitVariableDeclaration(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.type, "type", this) !== false &&
            callback.call(scope, this.initializer, "initializer", this) !== false &&
            callback.call(scope, this.name, "name", this) !== false;
    }

}

/**
 * 表示一个参数声明。
 */
export class ParameterDeclaration extends Declaration {

    /**
     * 获取当前参数的所有注解。
     */
    decorators: NodeList<Decorator>;

    /**
     * 获取当前参数的修饰符。
     */
    modifiers: NodeList<Modifier>;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitParameterDeclaration(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return this.decorators.each(callback, scope) &&
            this.modifiers.each(callback, scope) &&
            callback.call(scope, this.name, "name", this) !== false;
    }

}

/**
 * 表示一个泛型参数。
 */
export class GenericParameterDeclaration extends Declaration {

    /**
     * 获取当前泛型参数的名字部分。
     */
    name: Identifier;

    /**
     * 获取 extends 关键字的开始位置。如果不存在约束部分则返回 undefined。
     */
    extendsStart: number;

    /**
     * 获取 extends 关键字的开始位置。如果不存在约束部分则返回 undefined。
     */
    extendsEnd: number;

    /**
     * 获取当前泛型参数的约束部分。如果不存在约束部分则返回 undefined。
     */
    constraint: Expression;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitGenericParameterDeclaration(this);
    }

    /**
     * 遍历当前节点的所有直接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    each(callback: (node: Node, key: string | number, target: Node | NodeList<Node>) => boolean | void, scope?: any) {
        return callback.call(scope, this.name, "name", this) !== false &&
            (!this.constraint || callback.call(scope, this.constraint, "constraint", this) !== false);
    }

}

// #endregion

// #region 注释

/**
 * 表示一个 JS 注释。
 */
export class Comment extends Node {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitComment(this);
    }

}

/**
 * 表示一个 JS 文档注释。
 */
export class JsDocComment extends Node {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitJsDocComment(this);
    }

}

// #endregion
