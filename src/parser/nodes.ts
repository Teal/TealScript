/**
 * @fileOverview 语法树节点
 */

import {TokenType, tokenToString} from './tokenType';

// #region 节点

/**
 * 表示一个语法树节点。
 */
export abstract class Node {

    ///**
    // * 判断当前节点是否是指定类型。
    // * @param type 要判断的节点类型。
    // */
    //is(type: Function) {
    //    return this.constructor === type;
    //}

    /**
     * 获取当前节点的开始位置。如果值为 undefined 表示当前节点是生成的。
     */
    start: number;

    /**
     * 获取当前节点的结束位置。如果值为 undefined 表示当前节点是生成的。
     */
    end: number;

    forEach(callback: (t: Node) => void, scope?: any) {

    }

}

/**
 * 表示一个变量。
 */
export class Variable extends Node {

    /**
     * 获取当前变量的变量类型。
     */
    variableType: VariableType;

    /**
     * 获取当前变量的类型。
     */
    type: Expression;

    /**
     * 获取当前变量的名字。
     */
    name: Identifier;

    /**
     * 获取当前变量的初始值。
     */
    initialiser: Expression;

}

/**
 * 对变量类型的枚举。
 */
enum VariableType {

    /**
     * 表示这是一个普通变量。
     */
    normalLocal,

    /**
     * 表示这是一个常量。
     */
    constLocal,

    /**
     * 表示这是一个静态变量。
     */
    staticLocal,

    /**
     * 表示这是一个静态最终变量。
     */
    finalLocal,

    /**
     * 表示这是一个寄存变量。
     */
    externLocal,

    /**
     * 表示这是一个易变变量。
     */
    volatileLocal,

    /**
     * 表示这是一个外部变量。
     */
    outLocal,

    /**
     * 表示这是一个引用变量。
     */
    refLocal,

    /**
     * 标记为变量。
     */
    PARAMETER,

    /**
     * 表示这是一个输入参数。
     */
    inParameter,

    /**
     * 表示这是一个输出参数。
     */
    outParameter,

    /**
     * 表示这是一个引用参数。
     */
    refParameter,

    /**
     * 表示这是一个可变参数。
     */
    paramsParameter,

    /**
     * 表示这是一个参数列表。
     */
    argListParameter,

}

// #endregion

// #region 语句

/**
 * 表示一个语句。
 */
export abstract class Statement extends Node {

}

/**
 * 表示一个空语句。
 */
export class EmptyStatement extends Statement {

}

/**
 * 表示一个语句块。
 */
export class Block extends Statement {

    /**
     * 获取当前块内的所有语句。
     */
    statements: Statement[];

}

/**
 * 表示一个变量声明语句。
 */
export class VariableStatement extends Statement {

    /**
     * 获取当前语句的所有变量。
     */
    variables: Variable[];

}

/**
 * 表示一个标签语句。
 */
export class LabeledStatement extends Statement {

    /**
     * 获取当前的标签。
     */
    label: Identifier;

    /**
     * 获取当前的主要语句。
     */
    body: Statement;

}

/**
 * 表示一个表达式语句。
 */
export class ExpressionStatement extends Statement {

    /**
     * 获取当前表达式语句的主体。
     */
    body: Expression;

}

/**
 * 表示一个 if 语句。
 */
export class IfStatement extends Statement {

    /**
     * 获取条件部分。
     */
    condition: Expression;

    /**
     * 获取当前的则的部分。
     */
    thenClause: Statement;

    /**
     * 获取当前的否则的部分。
     */
    elseClause: Statement;

    /**
     * 获取当前节点的结束位置。如果值为 undefined 表示当前节点是生成的。
     */
    get end() { return (this.elseClause || this.thenClause).end; }

}

/**
 * 表示一个 switch 语句。
 */
export class SwitchStatement extends Statement {

    /**
     * 获取判断的条件。
     */
    condition: Expression;

    /**
     * 获取全部选项。
     */
    caseClauses: {

        /**
         * 获取当前 case 的标签。如果标签是 null，表示是 else 分支。
         */
        label: Expression;

        /**
         * 获取当前的全部语句。如果 body 是 null，表示当前 case 是一个直接贯穿的 case 。
         */
        body: Block;

    }[];

}

/**
 * 表示一个 for 语句。
 */
export class ForStatement extends Statement {

    /**
     * 获取初始化语句。
     */
    initializer: Node;

    /**
     * 获取条件部分。
     */
    condition: Expression;

    /**
     * 获取下一次语句。
     */
    iterator: Expression;

    /**
     * 获取主体部分。
     */
    body: Statement;

}

/**
 * 表示一个 for in 语句。
 */
export class ForInStatement extends Statement {

    /**
     * 获取全部变量。
     */
    variable: Variable;

    /**
     * 获取目标表达式。
     */
    iterator: Expression;

    /**
     * 获取主体部分。
     */
    body: Statement;

}

/**
 * 表示一个 for of 语句。
 */
export class ForOfStatement extends Statement {

    /**
     * 获取循环的目标表达式。
     */
    variable: Variable;

    /**
     * 获取结束表达式。
     */
    target: Expression;

    /**
     * 获取下一次语句。
     */
    iterator: Expression;

    /**
     * 获取主体部分。
     */
    body: Statement;

}

/**
 * 表示一个 while 语句。
 */
export class WhileStatement extends Statement {

    /**
     * 获取条件部分。
     */
    condition: Expression;

    /**
     * 获取主体部分。
     */
    body: Statement;

    /**
     * 获取当前节点的结束位置。如果值为 undefined 表示当前节点是生成的。
     */
    get end() { return this.body.end; }

}

/**
 * 表示一个 do while 语句。
 */
export class DoWhileStatement extends Statement {

    /**
     * 获取条件部分。
     */
    condition: Expression;

    /**
     * 获取主体部分。
     */
    body: Statement;

}

/**
 * 表示一个 continue 语句。
 */
export class ContinueStatement extends Statement {

    /**
     * 获取当前跳转的标签。
     */
    label: Identifier;

}

/**
 * 表示一个 break 语句。
 */
export class BreakStatement extends Statement {

    /**
     * 获取当前跳转的标签。
     */
    label: Identifier;

}

/**
 * 表示一个 return 语句。
 */
export class ReturnStatement extends Statement {

    /**
     * 获取返回的表达式。
     */
    value: Expression;

}

/**
 * 表示一个 throw 语句。
 */
export class ThrowStatement extends Statement {

    /**
     * 获取表达式。
     */
    value: Expression;

}

/**
 * 表示一个 try 语句。
 */
export class TryStatement extends Statement {

    /**
     * 获取 try 语句块。
     */
    tryClause: Statement;

    /**
     * 获取当前的所有 catch 块。
     */
    catchClause: {

        /**
         * 获取当前捕获的异常类型。
         */
        variable: Variable;

        /**
         * 当前块的主体。
         */
        body: Statement;

    };

    /**
     * 获取 finally 语句块。
     */
    finallyClause: Statement;

}

/**
 * 表示一个 with 语句。
 */
export class WithStatement extends Statement {

    /**
     * 获取当前的目标表达式。
     */
    target: Node;

    /**
     * 获取主体部分。
     */
    body: Statement;

}

// #endregion

// #region 表达式

/**
 * 表示一个表达式。
 */
export abstract class Expression extends Node {

}

/**
 * 表示一个标识符。
 */
export class Identifier extends Expression {

    /**
     * 获取当前标识符的内容。
     */
    value: string;

}

/**
 * 表示内置类型字面量。
 */
export class PredefinedTypeLiteral extends Expression {

    /**
     * 获取常量的类型。可能的值为 var void int ...
     */
    type: TokenType;

}

/**
 * 表示 null 常量。
 */
export class NullLiteral extends Expression {

}

/**
 * 表示 true 常量。
 */
export class TrueLiteral extends Expression {

}

/**
 * 表示 false 常量。
 */
export class FalseLiteral extends Expression {

}

/**
 * 表示一个浮点数常量。
 */
export class NumericLiteral extends Expression {

    /**
     * 获取实际的值。
     */
    value: number;

}

/**
 * 表示一个字符串常量。
 */
export class StringLiteral extends Expression {

    /**
     * 获取实际的值。
     */
    value: string;

}

/**
 * 表示一个列表字面量。
 */
export class ArrayLiteral extends Expression {

    /**
     * 获取当前表达式的值列表。
     */
    values: Expression[];

}

/**
 * 表示一个字典字面量。
 */
export class ObjectLiteral extends Expression {

    /**
     * 获取当前表达式的值列表。
     */
    values: {

        /**
         * 获取属性的键。
         */
        key: Expression;

        /**
         * 获取属性的值。
         */
        value: Expression;

    }[];

}

/**
 * 表示 this 常量。
 */
export class ThisLiteral extends Expression {

}

/**
 * 表示 super 常量。
 */
export class SuperLiteral extends Expression {

}

/**
 * 表示一个函数表达式。
 */
export class LambdaLiteral extends Expression {

    /**
     * 获取当前函数定义的参数列表。
     */
    parameters: Parameter[];

    /**
     * 获取当前函数的主体表达式部分。
     */
    returnBody: Expression;

    /**
     * 获取当前函数的主体部分。
     */
    body: Block;

}

/**
/// 表示一个括号表达式。
 */
export class ParenthesizedExpression extends Expression {

    /**
     * 获取当前表达式的主体。
     */
    body: Expression;

}

/**
 * 表示一组逗号隔开的表达式。
 */
export class CommaExpression extends Expression {

    /**
     * 获取左边部分的表达式。
     */
    left: Expression;

    /**
     * 获取右边部分的表达式。
     */
    right: Expression;

}

/**
 * 表示一个 yield 表达式。
 */
export class YieldExpression extends Statement {

    /**
     * 获取返回的表达式。
     */
    value: Expression;

    /**
     * 获取当前节点的结束位置。如果值为 undefined 表示当前节点是生成的。
     */
    get end() { return this.value ? this.value.end : this.start + 5; }

    get asterisk() { return this.asteriskStart != undefined; }

    asteriskStart: number;

    get asteriskEnd() { return this.asteriskStart != undefined ? this.asteriskStart + 1 : undefined; };

}

/**
 * 表示一个三元条件表达式。
 */
export class ConditionalExpression extends Expression {

    /**
     * 获取当前表达式的条件。
     */
    condition: Expression;

    /**
     * 获取当前表达式的则部分。
     */
    thenExpression: Expression;

    /**
     * 获取当前表达式的否则部分。
     */
    elseExpression: Expression;

}

/**
 * 表示一个类型转换表达式。
 */
export class CastExpression extends Expression {

    /**
     * 获取当前表达式的主体。
     */
    targetType: Expression;

    /**
     * 获取当前表达式的主体。
     */
    body: Expression;

}

/**
 * 表示一个泛型表达式。
 */
export class GenericTypeExpression extends Expression {

    /**
     * 获取当前泛型表达式的基础部分。
     */
    elementType: Identifier;

    /**
     * 获取当前泛型表达式的泛型参数。
     */
    genericArguments: Expression[];

}

/**
 * 表示一个数组类型表达式。
 */
export class ArrayTypeExpression extends Expression {

    /**
     * 获取当前类型的基础类型。
     */
    elementType: Expression;

}

/**
 * 表示一个成员调用表达式。
 */
export class MemberCallExpression extends Expression {

    /**
     * 获取当前调用的目标表达式。
     */
    target: Expression;

    /**
     * 获取当前调用的参数表达式。
     */
    argument: Expression;

}

/**
 * 表示一个函数调用表达式。
 */
export class FuncCallExpression extends Expression {

    /**
     * 获取当前调用的参数列表。
     */
    arguments: Expression[];

}

/**
 * 表示一个 new 表达式。
 */
export class NewExpression extends FuncCallExpression {

    /**
     * 获取当前表达式的初始化项。
     */
    initializer: Expression;

}

/**
 * 表示一个索引调用表达式。
 */
export class IndexCallExpression extends FuncCallExpression {

}

/**
 * 表示一个链式成员访问表达式。
 */
export class ChainCallExpression extends MemberCallExpression {

}

/**
 * 表示一个一元运算表达式。
 */
export class UnaryExpression extends Expression {

    /**
     * 获取当前表达式的运算符。可能的合法值是：+ - ! ^~ &amp; typeof await 。
     */
    operator: TokenType;

    /**
     * 获取当前表达式的运算数。
     */
    operand: Expression;

}

/**
 * 表示一个 typeof 或 sizeof 表达式。
 */
export abstract class TypeOrSizeOfExpression extends Expression {

    /**
     * 获取当前表达式的运算数。
     */
    operand: Expression;

}

/**
 * 表示一个 typeof 表达式。
 */
export class TypeOfExpression extends TypeOrSizeOfExpression {

}

/**
 * 表示一个 ++ 或 -- 运算表达式。
 */
export class MutatorExpression extends UnaryExpression {

    /**
     * 判断当前表达式是否是前缀表达式。
     */
    prefix: boolean;

}

/**
 * 表示一个二元运算表达式。
 */
export class BinaryExpression extends Expression {

    /**
     * 获取当前表达式的左值。
     */
    leftOperand: Expression;

    /**
     * 获取当前表达式的运算符。合法的值为 +、-、*、/、**、^、%、&、|、&&、||、<<、>>、>>>、is、as、instanceof。
     */
    operator: TokenType;

    /**
     * 获取当前表达式的右值。
     */
    rightOperand: Expression;

    /**
     * 获取运算符的开始位置。如果值为 undefined 表示当前节点是生成的。
     */
    operatorStart: number;

    /**
     * 获取运算符的结束位置。如果值为 undefined 表示当前节点是生成的。
     */
    get operatorEnd() { return this.operatorStart + tokenToString(this.operator).length; }

    /**
     * 获取当前节点的开始位置。如果值为 undefined 表示当前节点是生成的。
     */
    get start() { return this.leftOperand.start; }

    /**
     * 获取当前节点的结束位置。如果值为 undefined 表示当前节点是生成的。
     */
    get end() { return this.rightOperand.end; }

}

/**
 * 表示一个 is 或 as 表达式。
 */
export abstract class IsOrAsExpression extends Expression {

    /**
     * 获取当前表达式的左值。
     */
    leftOperand: Expression;

    /**
     * 获取当前表达式的右值。
     */
    rightOperand: Expression;

}

/**
 * 表示一个 instanceof 表达式。
 */
export class InstanceofExpression extends IsOrAsExpression {

}

/**
 * 表示一个 as 表达式。
 */
export class AsExpression extends IsOrAsExpression {

}

// #endregion

// #region 成员

/**
 * 表示一个成员（如方法、字段、类、模块等）定义。
 */
export abstract class MemberDefinition extends Node {

    ///**
    // * 获取当前成员的文档注释。如果不存在文档注释则返回 null。
    // */
    //docComment: DocComment;

    annotations: FuncCallExpression[]

    /**
     * 获取当前成员的修饰符。
     */
    modifiers: Modifiers;

    /**
     * 获取当前成员的名字。
     */
    name: Identifier;

}

/**
 * 表示成员修饰符的枚举。
 */
export enum Modifiers {

    /**
     * 无修饰符。
     */
    none = 0,

    /**
     * 表示静态的成员。
     */
    static = 1 << 0,

    /**
     * 表示最终的成员。标记当前类不可被继承、函数不可被重写、字段不可被改变。
     */
    final = 1 << 2,

    /**
     * 表示覆盖的成员。
     */
    new = 1 << 3,

    /**
     * 表示抽象的成员。
     */
    abstract = 1 << 4,

    /**
     * 表示虚成员。
     */
    virtual = 1 << 5,

    /**
     * 表示重写的成员。
     */
    override = 1 << 6,

    /**
     * 表示外部的成员。
     */
    declare = 1 << 7,

    /**
     * 表示公开的成员。
     */
    public = 1 << 9,

    /**
     * 表示保护的成员。
     */
    protected = 1 << 10,

    /**
     * 表示私有的成员。
     */
    private = 1 << 11,

    /**
     * 表示访问修饰符。
     */
    accessibility = Modifiers.public | Modifiers.protected | Modifiers.private

}

/**
 * 表示一个函数参数。
 */
export class Parameter extends Variable {

}

/**
 * 表示一个泛型参数。
 */
export class GenericParameter extends Node {

    /**
     * 获取当前参数的名字。
     */
    name: Identifier;

    /**
     * 获取类型约束。
     */
    constraint: Expression;

}

/**
 * 表示一个可以保存子成员的容器成员定义。
 */
export abstract class MemberContainerDefinition extends MemberDefinition {

    /**
     * 获取当前容器内的所有成员。
     */
    members: MemberDefinition;

}

/**
 * 表示一个类型（如类、结构、接口）定义。
 */
export abstract class TypeDefinition extends MemberContainerDefinition {

    /**
     * 获取当前类型的基类型列表。
     */
    baseTypes: Expression[];

    /**
     * 获取当前类型的泛型形参列表。非泛型则返回 null 。
     */
    genericParameters: GenericParameter;

}

/**
 * 表示一个类定义。
 */
export class ClassDefinition extends TypeDefinition {

}

/**
 * 表示一个结构定义。
 */
export class StructDefinition extends TypeDefinition {

}

/**
 * 表示一个接口定义。
 */
export class InterfaceDefinition extends TypeDefinition {

}

/**
 * 表示一个枚举定义。
 */
export class EnumDefinition extends TypeDefinition {

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

}

/**
 * 表示一个命名空间定义。
 */
export class NamespaceDefinition extends MemberContainerDefinition {

    /**
     * 获取当前的命名空间。
     */
    names: Identifier[];

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

}

/**
 * 表示一个模块。
 */
export class ModuleDefinition extends MemberContainerDefinition {

}

/**
 * 表示一个独立的模块。
 */
export class Module extends MemberContainerDefinition {

    /**
     * 获取当前单元内的导入列表。
     */
    importDirectives: ImportDirective;

}

/**
 * 表示一个类型子成员定义。
 */
export abstract class TypeMemberDefinition extends MemberDefinition {

}

/**
 * 表示一个字段定义。
 */
export class FieldDefinition extends TypeMemberDefinition {

    /**
     * 获取当前字段的所有变量。
     */
    variables: Variable[];

}

/**
 * 表示一个方法或属性定义。
 */
export abstract class MethodOrPropertyDefinition extends TypeMemberDefinition {

    /**
     * 获取当前成员的返回类型。
     */
    returnType: Expression;

    /**
     * 获取当前成员被显式声明的所有者。
     */
    explicitType: Expression;

}

/**
 * 表示一个属性或索引器定义。
 */
export abstract class PropertyOrIndexerDefinition extends MethodOrPropertyDefinition {

    /**
     * 获取访问器的主体。（可能为 null）
     */
    body: Block;

}

/**
 * 表示一个属性定义。
 */
export class PropertyDefinition extends MemberDefinition {

}

/**
 * 表示一个索引器定义。
 */
export class IndexerDefinition extends PropertyOrIndexerDefinition {

    /**
     * 获取当前定义的参数列表。
     */
    parameters: Parameter;

}

/**
 * 表示一个方法或构造函数定义。
 */
export abstract class MethodOrConstructorDefinition extends MethodOrPropertyDefinition {

    /**
     * 获取当前函数定义的参数列表。
     */
    parameters: Parameter;

    /**
     * 获取当前函数定义的主体。
     */
    body: Block;

}

/**
 * 表示一个方法定义。
 */
export class MethodDefinition extends MethodOrConstructorDefinition {

    /**
     * 获取成员的泛型参数。
     */
    genericParameters: GenericParameter[];

}

/**
 * 表示一个构造函数定义。
 */
export class ConstructorDefinition extends MethodOrConstructorDefinition {

}

/**
 * 表示一个枚举的成员定义。
 */
export class EnumMemberDefinition extends TypeMemberDefinition {

    /**
     * 获取当前枚举成员的初始化表达式（可能为 null）。
     */
    initializer: Expression;

}

// #endregion
