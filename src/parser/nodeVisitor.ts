/**
 * @fileOverview 节点访问器
 * @generated $ tpack gen
 */

import * as nodes from './nodes';

/**
 * 表示一个节点访问器。
 */
export abstract class NodeVisitor {

    /**
     * 访问一个多个节点数组。
     * @param nodes 要访问的节点数组。
     */
    visitList<T extends nodes.Node>(nodes: T[]) {
        for (const node of nodes) {
            node.accept(this);
        }
    }

    /**
     * 访问一个逗号隔开的节点列表(<..., ...>。
     * @param nodes 要访问的节点列表。
     */
    visitNodeList<T extends nodes.Node>(nodes: nodes.NodeList<T>) {
        this.visitList(nodes);
    }

    /**
     * 访问一个源文件。
     * @param node 要访问的节点。
     */
    visitSourceFile(node: nodes.SourceFile) {
        this.visitList(node.statements);
    }

    /**
     * 访问一个空语句(;)。
     * @param node 要访问的节点。
     */
    visitEmptyStatement(node: nodes.EmptyStatement) {

    }

    /**
     * 访问一个语句块({...})。
     * @param node 要访问的节点。
     */
    visitBlock(node: nodes.Block) {
        this.visitList(node.statements);
    }

    /**
     * 访问一个变量声明语句(var xx = ...)。
     * @param node 要访问的节点。
     */
    visitVariableStatement(node: nodes.VariableStatement) {
        this.visitList(node.variables);
    }

    /**
     * 访问一个变量声明(xx = ...)。
     * @param node 要访问的节点。
     */
    visitVariableDeclaration(node: nodes.VariableDeclaration) {
        node.name.accept(this);
        node.type.accept(this);
        node.initializer.accept(this);
    }

    /**
     * 访问一个数组绑定模式([xx, ...])
     * @param node 要访问的节点。
     */
    visitArrayBindingPattern(node: nodes.ArrayBindingPattern) {
        this.visitNodeList(node.elements);
    }

    /**
     * 访问一个数组绑定模式项(xx, ..)
     * @param node 要访问的节点。
     */
    visitArrayBindingElement(node: nodes.ArrayBindingElement) {
        node.initializer.accept(this);
    }

    /**
     * 访问一个对象绑定模式({xx, ...})
     * @param node 要访问的节点。
     */
    visitObjectBindingPattern(node: nodes.ObjectBindingPattern) {
        this.visitNodeList(node.elements);
    }

    /**
     * 访问一个对象绑定模式项(xx: y)
     * @param node 要访问的节点。
     */
    visitObjectBindingElement(node: nodes.ObjectBindingElement) {
        node.propertyName.accept(this);
    }

    /**
     * 访问一个标签语句(xx: ...)。
     * @param node 要访问的节点。
     */
    visitLabeledStatement(node: nodes.LabeledStatement) {
        node.label.accept(this);
        node.body.accept(this);
    }

    /**
     * 访问一个表达式语句(...;)。
     * @param node 要访问的节点。
     */
    visitExpressionStatement(node: nodes.ExpressionStatement) {
        node.body.accept(this);
    }

    /**
     * 访问一个 if 语句(if(...) {...})。
     * @param node 要访问的节点。
     */
    visitIfStatement(node: nodes.IfStatement) {
        node.condition.accept(this);
        node.then.accept(this);
        node.else.accept(this);
    }

    /**
     * 访问一个 switch 语句(switch(...){...})。
     * @param node 要访问的节点。
     */
    visitSwitchStatement(node: nodes.SwitchStatement) {
        node.condition.accept(this);
        this.visitList(node.cases);
    }

    /**
     * 访问一个 switch 语句的 case 分支(case ...:{...})。
     * @param node 要访问的节点。
     */
    visitCaseClause(node: nodes.CaseClause) {
        node.label.accept(this);
        this.visitList(node.statements);
    }

    /**
     * 访问一个 for 语句(for(...; ...; ...) {...})。
     * @param node 要访问的节点。
     */
    visitForStatement(node: nodes.ForStatement) {
        node.initializer.accept(this);
        node.condition.accept(this);
        node.iterator.accept(this);
        node.body.accept(this);
    }

    /**
     * 访问一个 for..in 语句(for(var xx in ...) {...})。
     * @param node 要访问的节点。
     */
    visitForInStatement(node: nodes.ForInStatement) {
        node.variable.accept(this);
        node.iterator.accept(this);
        node.body.accept(this);
    }

    /**
     * 访问一个 for..of 语句(for(var xx of ...) {...})。
     * @param node 要访问的节点。
     */
    visitForOfStatement(node: nodes.ForOfStatement) {
        node.variable.accept(this);
        node.iterator.accept(this);
        node.body.accept(this);
    }

    /**
     * 访问一个 while 语句(while(...) {...})。
     * @param node 要访问的节点。
     */
    visitWhileStatement(node: nodes.WhileStatement) {
        node.condition.accept(this);
        node.body.accept(this);
    }

    /**
     * 访问一个 do..while 语句(do {...} while(...);)。
     * @param node 要访问的节点。
     */
    visitDoWhileStatement(node: nodes.DoWhileStatement) {
        node.condition.accept(this);
        node.body.accept(this);
    }

    /**
     * 访问一个 continue 语句(continue;)。
     * @param node 要访问的节点。
     */
    visitContinueStatement(node: nodes.ContinueStatement) {
        node.label.accept(this);
    }

    /**
     * 访问一个 break 语句(break;)。
     * @param node 要访问的节点。
     */
    visitBreakStatement(node: nodes.BreakStatement) {
        node.label.accept(this);
    }

    /**
     * 访问一个 return 语句(return ...;)。
     * @param node 要访问的节点。
     */
    visitReturnStatement(node: nodes.ReturnStatement) {
        node.value.accept(this);
    }

    /**
     * 访问一个 throw 语句(throw ...;)。
     * @param node 要访问的节点。
     */
    visitThrowStatement(node: nodes.ThrowStatement) {
        node.value.accept(this);
    }

    /**
     * 访问一个 try 语句(try {...} catch(e) {...})。
     * @param node 要访问的节点。
     */
    visitTryStatement(node: nodes.TryStatement) {
        node.try.accept(this);
        node.catch.accept(this);
        node.finally.accept(this);
    }

    /**
     * 访问一个 try 语句的 catch 部分(catch(e) {...})。
     * @param node 要访问的节点。
     */
    visitCatchClause(node: nodes.CatchClause) {
        node.variable.accept(this);
        node.body.accept(this);
    }

    /**
     * 访问一个 try 语句的 finally 部分(finally {...})。
     * @param node 要访问的节点。
     */
    visitFinallyClause(node: nodes.FinallyClause) {
        node.body.accept(this);
    }

    /**
     * 访问一个 with 语句(with(...) {...})。
     * @param node 要访问的节点。
     */
    visitWithStatement(node: nodes.WithStatement) {
        node.value.accept(this);
        node.body.accept(this);
    }

    /**
     * 访问一个标识符(xx)。
     * @param node 要访问的节点。
     */
    visitIdentifier(node: nodes.Identifier) {

    }

    /**
     * 访问 null 字面量(null)。
     * @param node 要访问的节点。
     */
    visitNullLiteral(node: nodes.NullLiteral) {

    }

    /**
     * 访问 true 字面量(true)。
     * @param node 要访问的节点。
     */
    visitTrueLiteral(node: nodes.TrueLiteral) {

    }

    /**
     * 访问 false 字面量(false)。
     * @param node 要访问的节点。
     */
    visitFalseLiteral(node: nodes.FalseLiteral) {

    }

    /**
     * 访问一个浮点数字面量(1)。
     * @param node 要访问的节点。
     */
    visitNumericLiteral(node: nodes.NumericLiteral) {

    }

    /**
     * 访问一个字符串字面量('...')。
     * @param node 要访问的节点。
     */
    visitStringLiteral(node: nodes.StringLiteral) {

    }

    /**
     * 访问一个数组字面量([...])。
     * @param node 要访问的节点。
     */
    visitArrayLiteral(node: nodes.ArrayLiteral) {
        this.visitNodeList(node.elements);
    }

    /**
     * 访问一个对象字面量({x: ...})。
     * @param node 要访问的节点。
     */
    visitObjectLiteral(node: nodes.ObjectLiteral) {
        this.visitNodeList(node.elements);
    }

    /**
     * 访问一个对象字面量项。
     * @param node 要访问的节点。
     */
    visitObjectLiteralElement(node: nodes.ObjectLiteralElement) {
        node.name.accept(this);
        node.value.accept(this);
    }

    /**
     * 访问 this 字面量(this)。
     * @param node 要访问的节点。
     */
    visitThisLiteral(node: nodes.ThisLiteral) {

    }

    /**
     * 访问 super 字面量(super)。
     * @param node 要访问的节点。
     */
    visitSuperLiteral(node: nodes.SuperLiteral) {

    }

    /**
     * 访问一个括号表达式((...))。
     * @param node 要访问的节点。
     */
    visitParenthesizedExpression(node: nodes.ParenthesizedExpression) {
        node.body.accept(this);
    }

    /**
     * 访问一个条件表达式(... ? ... : ...)。
     * @param node 要访问的节点。
     */
    visitConditionalExpression(node: nodes.ConditionalExpression) {
        node.condition.accept(this);
        node.then.accept(this);
        node.else.accept(this);
    }

    /**
     * 访问一个箭头函数(x => ...)。
     * @param node 要访问的节点。
     */
    visitLambdaLiteral(node: nodes.LambdaLiteral) {
        this.visitNodeList(node.typeParameters);
        this.visitNodeList(node.parameters);
        node.body.accept(this);
    }

    /**
     * 访问一个 yield 表达式(yield xx)。
     * @param node 要访问的节点。
     */
    visitYieldExpression(node: nodes.YieldExpression) {
        node.body.accept(this);
    }

    /**
     * 访问一个类型转换表达式(<T>xx)。
     * @param node 要访问的节点。
     */
    visitCastExpression(node: nodes.CastExpression) {
        node.type.accept(this);
        node.body.accept(this);
    }

    /**
     * 访问一个成员调用表达式(x.y)。
     * @param node 要访问的节点。
     */
    visitMemberCallExpression(node: nodes.MemberCallExpression) {
        node.target.accept(this);
        node.argument.accept(this);
    }

    /**
     * 访问一个函数调用表达式(x(...))。
     * @param node 要访问的节点。
     */
    visitCallExpression(node: nodes.CallExpression) {

    }

    /**
     * 访问一个 new 表达式(new x(...))。
     * @param node 要访问的节点。
     */
    visitNewExpression(node: nodes.NewExpression) {

    }

    /**
     * 访问一个索引调用表达式(x[...])。
     * @param node 要访问的节点。
     */
    visitIndexCallExpression(node: nodes.IndexCallExpression) {

    }

    /**
     * 访问一个一元运算表达式(+x)。
     * @param node 要访问的节点。
     */
    visitUnaryExpression(node: nodes.UnaryExpression) {
        node.operand.accept(this);
    }

    /**
     * 访问一个二元运算表达式(x + y)。
     * @param node 要访问的节点。
     */
    visitBinaryExpression(node: nodes.BinaryExpression) {
        node.leftOperand.accept(this);
        node.rightOperand.accept(this);
    }

    /**
     * 访问内置类型字面量(number)。
     * @param node 要访问的节点。
     */
    visitPredefinedTypeLiteral(node: nodes.PredefinedTypeLiteral) {

    }

    /**
     * 访问一个泛型表达式(Array<T>)。
     * @param node 要访问的节点。
     */
    visitGenericTypeExpression(node: nodes.GenericTypeExpression) {
        node.element.accept(this);
        this.visitNodeList(node.genericArguments);
    }

    /**
     * 访问一个数组类型表达式(T[])。
     * @param node 要访问的节点。
     */
    visitArrayTypeExpression(node: nodes.ArrayTypeExpression) {
        node.element.accept(this);
    }

    /**
     * 访问一个类型（如类、结构、接口）定义。
     * @param node 要访问的节点。
     */
    visitTypeDefinition(node: nodes.TypeDefinition) {
        this.visitNodeList(node.extends);
        this.visitNodeList(node.implements);
        this.visitNodeList(node.genericParameters);
    }

    /**
     * 访问一个成员（如方法、字段、类、模块等）定义。
     * @param node 要访问的节点。
     */
    visitMemberDefinition(node: nodes.MemberDefinition) {
        this.visitList(node.annotations);
        node.name.accept(this);
    }

    /**
     * 访问一个注解(@xx(...))。
     * @param node 要访问的节点。
     */
    visitAnnotation(node: nodes.Annotation) {

    }

    /**
     * 访问一个参数声明。
     * @param node 要访问的节点。
     */
    visitParameterDeclaration(node: nodes.ParameterDeclaration) {
        this.visitList(node.annotations);
    }

    /**
     * 访问一个泛型参数。
     * @param node 要访问的节点。
     */
    visitGenericParameterDeclaration(node: nodes.GenericParameterDeclaration) {
        node.name.accept(this);
        node.constraint.accept(this);
    }

    /**
     * 访问一个可以保存子成员的容器成员定义。
     * @param node 要访问的节点。
     */
    visitMemberContainerDefinition(node: nodes.MemberContainerDefinition) {
        node.members.accept(this);
    }

    /**
     * 访问一个类定义。
     * @param node 要访问的节点。
     */
    visitClassDefinition(node: nodes.ClassDefinition) {

    }

    /**
     * 访问一个结构定义。
     * @param node 要访问的节点。
     */
    visitStructDefinition(node: nodes.StructDefinition) {

    }

    /**
     * 访问一个接口定义。
     * @param node 要访问的节点。
     */
    visitInterfaceDefinition(node: nodes.InterfaceDefinition) {

    }

    /**
     * 访问一个枚举定义。
     * @param node 要访问的节点。
     */
    visitEnumDefinition(node: nodes.EnumDefinition) {

    }

    /**
     * 访问一个扩展定义。
     * @param node 要访问的节点。
     */
    visitExtensionDefinition(node: nodes.ExtensionDefinition) {
        node.targetType.accept(this);
        this.visitList(node.baseTypes);
    }

    /**
     * 访问一个命名空间定义。
     * @param node 要访问的节点。
     */
    visitNamespaceDefinition(node: nodes.NamespaceDefinition) {
        this.visitList(node.names);
    }

    /**
     * 访问一个 import 指令。
     * @param node 要访问的节点。
     */
    visitImportDirective(node: nodes.ImportDirective) {
        node.next.accept(this);
        node.alias.accept(this);
        node.value.accept(this);
    }

    /**
     * 访问一个模块。
     * @param node 要访问的节点。
     */
    visitModuleDefinition(node: nodes.ModuleDefinition) {

    }

    /**
     * 访问一个类型子成员定义。
     * @param node 要访问的节点。
     */
    visitTypeMemberDefinition(node: nodes.TypeMemberDefinition) {

    }

    /**
     * 访问一个字段定义。
     * @param node 要访问的节点。
     */
    visitFieldDefinition(node: nodes.FieldDefinition) {
        this.visitList(node.variables);
    }

    /**
     * 访问一个方法或属性定义。
     * @param node 要访问的节点。
     */
    visitMethodOrPropertyDefinition(node: nodes.MethodOrPropertyDefinition) {
        node.returnType.accept(this);
        node.explicitType.accept(this);
    }

    /**
     * 访问一个属性或索引器定义。
     * @param node 要访问的节点。
     */
    visitPropertyOrIndexerDefinition(node: nodes.PropertyOrIndexerDefinition) {
        node.body.accept(this);
    }

    /**
     * 访问一个属性定义。
     * @param node 要访问的节点。
     */
    visitPropertyDefinition(node: nodes.PropertyDefinition) {

    }

    /**
     * 访问一个索引器定义。
     * @param node 要访问的节点。
     */
    visitIndexerDefinition(node: nodes.IndexerDefinition) {
        node.parameters.accept(this);
    }

    /**
     * 访问一个方法或构造函数定义。
     * @param node 要访问的节点。
     */
    visitMethodOrConstructorDefinition(node: nodes.MethodOrConstructorDefinition) {
        node.parameters.accept(this);
        node.body.accept(this);
    }

    /**
     * 访问一个方法定义。
     * @param node 要访问的节点。
     */
    visitMethodDefinition(node: nodes.MethodDefinition) {
        this.visitList(node.genericParameters);
    }

    /**
     * 访问一个构造函数定义。
     * @param node 要访问的节点。
     */
    visitConstructorDefinition(node: nodes.ConstructorDefinition) {

    }

    /**
     * 访问一个枚举的成员定义。
     * @param node 要访问的节点。
     */
    visitEnumMemberDefinition(node: nodes.EnumMemberDefinition) {
        node.initializer.accept(this);
    }

    /**
     * 标识一个 JS 文档注释。
     * @param node 要访问的节点。
     */
    visitJsDocComment(node: nodes.JsDocComment) {

    }

}