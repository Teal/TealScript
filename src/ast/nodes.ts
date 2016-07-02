/**
 * @fileOverview 语法树节点
 * @generated partial $ tpack gen
 */

import {TokenType, tokenToString} from './tokenType';
import {NodeVisitor} from './nodeVisitor';

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
     * 遍历当前节点的所有直接和间接子节点，并对每一项执行 *callback*。
     * @param callback 对每一项执行的回调函数。
     * * param value 当前项的值。
     * * param key 当前项的索引或键。
     * * param target 当前正在遍历的目标对象。
     * * returns 函数可以返回 false 以终止循环。
     * @param scope 设置 *callback* 执行时 this 的值。
     * @returns 如果循环是因为 *callback* 返回 false 而中止，则返回 false，否则返回 true。
     */
    abstract walk(callback: (node: Node, key, target) => boolean | void, scope?: any): boolean;

}

/**
 * 表示一个源文件。
 */
export class SourceFile extends Node {

    /**
     * 获取或设置当前源文件的路径。如果当前文件不是从硬盘载入则返回 undefined。
     */
    path: string;

    /**
     * 获取或设置当前源文件的内容。
     */
    content: string;

    /**
     * 获取当前源文件的所有语句。
     */
    statements: Statement[];

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitSourceFile(this);
    }

}

/**
 * 表示一个逗号隔开的节点列表(<..., ...>。
 */
export class NodeList<T extends Node> extends Array<T> {

    /**
     * 获取当前节点开始标记的开始位置。
     */
    openStart: number;

    /**
     * 获取当前节点开始标记的结束位置。
     */
    openEnd: number;

    /**
     * 获取当前节点的分割标记的所有开始位置。
     */
    seperatorStarts: number[];

    /**
     * 获取当前节点的分割标记的所有结束位置。
     */
    get seperatorEnds() { return this.seperatorStarts.map(p => p + 1); }

    /**
     * 获取当前节点开始标记的开始位置。
     */
    closeStart: number;

    /**
     * 获取当前节点开始标记的结束位置。
     */
    closeEnd: number;

    /**
     * 判断当前列表是否包含尾随的数组。
     */
    get hasTrailingComma() { return this.seperatorStarts.length === this.length; }

}

/**
 * 表示一个语句。
 */
export abstract class Statement extends Node {

    /**
     * 判断当前语句是否以分号结尾。
     */
    get hasSemicolon() { return false; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitStatement(this);
    }

}

/**
 * 表示一个空语句(;)。
 */
export class EmptyStatement extends Statement {

    /**
     * undefined
     */
    get end() { return this.start + 1; }

    /**
     * 判断当前语句是否以分号结尾。
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
    statements: Statement[];

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitBlock(this);
    }

}

/**
 * 表示一个变量声明语句(var xx = ...)。
 */
export class VariableStatement extends Statement {

    /**
     * 获取当前变量声明语句的格式。
     */
    type: VariableType;

    /**
     * 获取当前变量声明语句的所有变量。
     */
    variables: VariableDeclaration[];

    /**
     * 判断当前语句是否以分号结尾。
     */
    get hasSemicolon() { return this.end > this.variables[this.variables.length - 1].end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitVariableStatement(this);
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
 * 表示一个变量声明(xx = ...)。
 */
export class VariableDeclaration extends Node {

    /**
     * 获取当前变量的名字。
     */
    name: Identifier | BindingPattern;

    /**
     * 获取当前变量名后冒号的开始位置。如果当前变量后不跟冒号则返回 undefined。
     */
    colonStart: number;

    /**
     * 获取当前变量名后冒号的结束位置。如果当前变量后不跟冒号则返回 undefined。
     */
    get colonEnd() { return this.colonEnd != undefined ? this.colonEnd + 1 : undefined; }

    /**
     * 获取当前变量定义的类型。
     */
    type: Expression;

    /**
     * 获取当前变量名后等号的开始位置。如果当前变量后不跟等号则返回 undefined。
     */
    equalStart: number;

    /**
     * 获取当前变量名后等号的结束位置。如果当前变量后不跟等号则返回 undefined。
     */
    get equalEnd() { return this.equalStart != undefined ? this.equalStart + 1 : undefined; }

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

}

/**
 * 表示一个绑定模式([xx, ...])
 */
export abstract class BindingPattern extends Node {

    /**
     * 获取当前绑定模式的元素列表。
     */
    elements: NodeList<BindingElement>;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitBindingPattern(this);
    }

}

/**
 * 表示一个绑定模式项(xx, ..)
 */
export abstract class BindingElement extends Node {

    /**
     * 获取当前绑定模式项的名字。
     */
    name: Identifier | BindingPattern;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitBindingElement(this);
    }

}

/**
 * 表示一个数组绑定模式([xx, ...])
 */
export class ArrayBindingPattern extends BindingPattern {

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

}

/**
 * 表示一个数组绑定模式项(xx, ..)
 */
export class ArrayBindingElement extends BindingElement {

    /**
     * 获取当前绑定模式项的点点点开始位置。如果当前绑定模式项不含点点点则返回 undefined。
     */
    dotDotDotStart: number;

    /**
     * 获取当前绑定模式项的点点点结束位置。如果当前绑定模式项不含点点点则返回 undefined。
     */
    get dotDotDotEnd() { return this.dotDotDotStart != undefined ? this.dotDotDotStart + 3 : undefined; }

    /**
     * 获取当前绑定模式项的等号开始位置。如果当前绑定模式项不含等号则返回 undefined。
     */
    equalStart: number;

    /**
     * 获取当前绑定模式项的等号结束位置。如果当前绑定模式项不含等号则返回 undefined。
     */
    get equalEnd() { return this.equalEnd != undefined ? this.equalStart + 1 : undefined; }

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

}

/**
 * 表示一个对象绑定模式({xx, ...})
 */
export class ObjectBindingPattern extends BindingPattern {

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

}

/**
 * 表示一个对象绑定模式项(xx: y)
 */
export class ObjectBindingElement extends BindingElement {

    /**
     * 获取对象绑定模式项的属性名。
     */
    propertyName: Expression;

    /**
     * 获取当前属性名后冒号的开始位置。如果当前属性后不跟冒号则返回 undefined。
     */
    colonStart: number;

    /**
     * 获取当前属性名后冒号的结束位置。如果当前属性后不跟冒号则返回 undefined。
     */
    get colonEnd() { return this.colonEnd != undefined ? this.colonEnd + 1 : undefined; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitObjectBindingElement(this);
    }

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
     * 判断当前语句是否以分号结尾。
     */
    get hasSemicolon() { return this.end > this.body.end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitExpressionStatement(this);
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
     * 获取当前 if 语句的否则部分。如果当前 if 语句不含否则部分则返回 undefined。
     */
    else: Statement;

    /**
     * undefined
     */
    get end() { return (this.else || this.then).end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitIfStatement(this);
    }

}

/**
 * 表示一个 switch 语句(switch(...){...})。
 */
export class SwitchStatement extends Statement {

    /**
     * 获取当前 switch 语句的条件部分。
     */
    condition: Expression;

    /**
     * 获取当前 switch 语句的所有分支。
     */
    cases: CaseClause[];

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitSwitchStatement(this);
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
    statements: Statement[];

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitCaseClause(this);
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
    variable: Identifier | BindingPattern;

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
    variable: Identifier | BindingPattern;

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
     * undefined
     */
    get end() { return this.body.end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitWhileStatement(this);
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
     * 判断当前语句是否以分号结尾。
     */
    get hasSemicolon() { return this.end > this.condition.end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitDoWhileStatement(this);
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
     * 判断当前语句是否以分号结尾。
     */
    get hasSemicolon() { return this.end > this.start + 8/*'continue'.length*/; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitContinueStatement(this);
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
     * 判断当前语句是否以分号结尾。
     */
    get hasSemicolon() { return this.end > this.start + 5/*'break'.length*/; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitBreakStatement(this);
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
     * 判断当前语句是否以分号结尾。
     */
    get hasSemicolon() { return this.end > (this.value ? this.value.end : this.start + 6/*'return'.length*/); }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitReturnStatement(this);
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
     * 判断当前语句是否以分号结尾。
     */
    get hasSemicolon() { return this.end > (this.value ? this.value.end : this.start + 6/*'return'.length*/); }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitThrowStatement(this);
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

}

/**
 * 表示一个 try 语句的 catch 部分(catch(e) {...})。
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
     * 获取当前 catch 部分的变量名
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
     * 获取当前 catch 部分的主体部分。
     */
    body: Statement;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitCatchClause(this);
    }

}

/**
 * 表示一个 try 语句的 finally 部分(finally {...})。
 */
export class FinallyClause extends Node {

    /**
     * 获取当前 finally 部分的主体部分。
     */
    body: Statement;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitFinallyClause(this);
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

}

/**
 * 表示一个表达式。
 */
export abstract class Expression extends Node {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitExpression(this);
    }

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
 * 表示一个数组字面量([...])。
 */
export class ArrayLiteral extends Expression {

    /**
     * 获取当前数组字面量的所有项。
     */
    elements: NodeList<Expression>;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitArrayLiteral(this);
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
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitObjectLiteral(this);
    }

}

/**
 * 表示一个对象字面量项。
 */
export class ObjectLiteralElement extends Node {

    /**
     * 获取当前对象字面量项的键部分。
     */
    name: Identifier;

    /**
     * 获取当前变量名后冒号的开始位置。如果当前变量后不跟冒号则返回 undefined。
     */
    colonStart: number;

    /**
     * 获取当前变量名后冒号的结束位置。如果当前变量后不跟冒号则返回 undefined。
     */
    get colonEnd() { return this.colonEnd != undefined ? this.colonEnd + 1 : undefined; }

    /**
     * 获取当前对象字面量项的值部分。
     */
    value: Expression;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitObjectLiteralElement(this);
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
    get arrowEnd() { return this.arrowStart + 1; }

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
     * 获取当前表达式的 * 的结束位置。如果当前表达式无 * 则返回 undefined。
     */
    get asteriskEnd() { return this.asteriskStart != undefined ? this.asteriskStart + 1 : undefined; }

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
    argument: Expression;

    /**
     * undefined
     */
    get start() { return this.target.start; }

    /**
     * undefined
     */
    get end() { return this.argument.end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitMemberCallExpression(this);
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

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitCallLikeExpression(this);
    }

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

}

/**
 * 表示一个索引调用表达式(x[...])。
 */
export class IndexCallExpression extends CallLikeExpression {

    /**
     * undefined
     */
    get start() { return this.target.start; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitIndexCallExpression(this);
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
     * undefined
     */
    get start() { return this.leftOperand.start; }

    /**
     * undefined
     */
    get end() { return this.rightOperand.end; }

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitBinaryExpression(this);
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
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitArrayTypeExpression(this);
    }

}

/**
 * 表示一个类型（如类、结构、接口）定义。
 */
export class TypeDefinition extends MemberContainerDefinition {

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

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitTypeDefinition(this);
    }

}

/**
 * 表示一个成员（如方法、字段、类、模块等）定义。
 */
export class MemberDefinition extends Node {

    /**
     * undefined
     */
    annotations: Annotation[];

    /**
     * 获取当前成员的修饰符。
     */
    modifiers: Modifiers;

    /**
     * 获取当前成员的名字。
     */
    name: Identifier;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitMemberDefinition(this);
    }

}

/**
 * 表示一个注解(@xx(...))。
 */
export class Annotation extends CallLikeExpression {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitAnnotation(this);
    }

}

/**
 * 表示成员修饰符的枚举。
 */
export enum Modifiers {

    /**
     * 无修饰符。
     */
    none,

    /**
     * 表示静态的成员。
     */
    static,

    /**
     * 表示最终的成员。标记当前类不可被继承、函数不可被重写、字段不可被改变。
     */
    final,

    /**
     * 表示覆盖的成员。
     */
    new,

    /**
     * 表示抽象的成员。
     */
    abstract,

    /**
     * 表示虚成员。
     */
    virtual,

    /**
     * 表示重写的成员。
     */
    override,

    /**
     * 表示外部的成员。
     */
    declare,

    /**
     * 表示公开的成员。
     */
    public,

    /**
     * 表示保护的成员。
     */
    protected,

    /**
     * 表示私有的成员。
     */
    private,

    /**
     * 表示访问修饰符。
     */
    accessibility,

}

/**
 * 表示一个参数声明。
 */
export class ParameterDeclaration extends Node {

    /**
     * 获取当前参数的修饰符。
     */
    modifiers: Modifiers;

    /**
     * 获取当前参数的注解。
     */
    annotations: Annotation[];

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitParameterDeclaration(this);
    }

}

/**
 * 表示一个泛型参数。
 */
export class GenericParameterDeclaration extends Node {

    /**
     * 获取当前参数的名字。
     */
    name: Identifier;

    /**
     * 获取类型约束。
     */
    constraint: Expression;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitGenericParameterDeclaration(this);
    }

}

/**
 * 表示一个可以保存子成员的容器成员定义。
 */
export class MemberContainerDefinition extends MemberDefinition {

    /**
     * 获取当前容器内的所有成员。
     */
    members: MemberDefinition;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitMemberContainerDefinition(this);
    }

}

/**
 * 表示一个类定义。
 */
export class ClassDefinition extends TypeDefinition {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitClassDefinition(this);
    }

}

/**
 * 表示一个结构定义。
 */
export class StructDefinition extends TypeDefinition {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitStructDefinition(this);
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

}

/**
 * 表示一个枚举定义。
 */
export class EnumDefinition extends TypeDefinition {

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitEnumDefinition(this);
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
    baseTypes: Expression[];

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitExtensionDefinition(this);
    }

}

/**
 * 表示一个命名空间定义。
 */
export class NamespaceDefinition extends MemberContainerDefinition {

    /**
     * 获取当前的命名空间。
     */
    names: Identifier[];

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitNamespaceDefinition(this);
    }

}

/**
 * 表示一个 import 指令。
 */
export class ImportDirective extends Node {

    /**
     * 支持多个对象组成一个单链表。
     */
    next: ImportDirective;

    /**
     * 获取当前指令的别名部分。
     */
    alias: Identifier;

    /**
     * 获取当前指令的值部分。
     */
    value: Expression;

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitImportDirective(this);
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

}

/**
 * 表示一个字段定义。
 */
export class FieldDefinition extends TypeMemberDefinition {

    /**
     * 获取当前字段的所有变量。
     */
    variables: VariableDeclaration[];

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitFieldDefinition(this);
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

}

/**
 * 表示一个方法定义。
 */
export class MethodDefinition extends MethodOrConstructorDefinition {

    /**
     * 获取成员的泛型参数。
     */
    genericParameters: GenericParameterDeclaration[];

    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    accept(vistior: NodeVisitor) {
        return vistior.visitMethodDefinition(this);
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

}

/**
 * 标识一个 JS 文档注释。
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
