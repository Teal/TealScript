/**
 * @fileOverview 节点访问器
 * @generated $ tpack gen
 */
/**
 * 表示一个节点访问器。
 */
var NodeVisitor = (function () {
    function NodeVisitor() {
    }
    /**
     * 访问一个逗号隔开的节点列表(<..., ...>。
     * @param nodes 要访问的节点列表。
     */
    NodeVisitor.prototype.visitNodeList = function (nodes) {
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            node.accept(this);
        }
    };
    /**
     * 访问一个源文件。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitSourceFile = function (node) {
        node.statements.accept(this);
    };
    /**
     * 访问一个空语句(;)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitEmptyStatement = function (node) {
    };
    /**
     * 访问一个语句块({...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitBlock = function (node) {
        node.statements.accept(this);
    };
    /**
     * 访问一个变量声明语句(var xx = ...)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitVariableStatement = function (node) {
        node.variables.accept(this);
    };
    /**
     * 访问一个变量声明(xx = ...)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitVariableDeclaration = function (node) {
        node.name.accept(this);
        node.type.accept(this);
        node.initializer.accept(this);
    };
    /**
     * 访问一个数组绑定模式([xx, ...])
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitArrayBindingPattern = function (node) {
        node.elements.accept(this);
    };
    /**
     * 访问一个数组绑定模式项(xx, ..)
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitArrayBindingElement = function (node) {
        node.initializer.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个对象绑定模式({xx, ...})
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitObjectBindingPattern = function (node) {
        node.elements.accept(this);
    };
    /**
     * 访问一个对象绑定模式项(xx: y)
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitObjectBindingElement = function (node) {
        node.propertyName.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个标签语句(xx: ...)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitLabeledStatement = function (node) {
        node.label.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个表达式语句(...;)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitExpressionStatement = function (node) {
        node.body.accept(this);
    };
    /**
     * 访问一个 if 语句(if(...) {...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitIfStatement = function (node) {
        node.condition.accept(this);
        node.then.accept(this);
        node.else.accept(this);
    };
    /**
     * 访问一个 switch 语句(switch(...){...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitSwitchStatement = function (node) {
        node.condition.accept(this);
        node.cases.accept(this);
    };
    /**
     * 访问一个 switch 语句的 case 分支(case ...:{...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitCaseClause = function (node) {
        node.label.accept(this);
        node.statements.accept(this);
    };
    /**
     * 访问一个 for 语句(for(...; ...; ...) {...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitForStatement = function (node) {
        node.initializer.accept(this);
        node.condition.accept(this);
        node.iterator.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 for..in 语句(for(var xx in ...) {...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitForInStatement = function (node) {
        node.variable.accept(this);
        node.iterator.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 for..of 语句(for(var xx of ...) {...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitForOfStatement = function (node) {
        node.variable.accept(this);
        node.iterator.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 while 语句(while(...) {...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitWhileStatement = function (node) {
        node.condition.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 do..while 语句(do {...} while(...);)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitDoWhileStatement = function (node) {
        node.condition.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 continue 语句(continue;)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitContinueStatement = function (node) {
        node.label.accept(this);
    };
    /**
     * 访问一个 break 语句(break;)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitBreakStatement = function (node) {
        node.label.accept(this);
    };
    /**
     * 访问一个 return 语句(return ...;)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitReturnStatement = function (node) {
        node.value.accept(this);
    };
    /**
     * 访问一个 throw 语句(throw ...;)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitThrowStatement = function (node) {
        node.value.accept(this);
    };
    /**
     * 访问一个 try 语句(try {...} catch(e) {...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitTryStatement = function (node) {
        node.try.accept(this);
        node.catch.accept(this);
        node.finally.accept(this);
    };
    /**
     * 访问一个 try 语句的 catch 部分(catch(e) {...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitCatchClause = function (node) {
        node.variable.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 try 语句的 finally 部分(finally {...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitFinallyClause = function (node) {
        node.body.accept(this);
    };
    /**
     * 访问一个 with 语句(with(...) {...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitWithStatement = function (node) {
        node.value.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个标识符(xx)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitIdentifier = function (node) {
    };
    /**
     * 访问 null 字面量(null)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitNullLiteral = function (node) {
    };
    /**
     * 访问 true 字面量(true)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitTrueLiteral = function (node) {
    };
    /**
     * 访问 false 字面量(false)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitFalseLiteral = function (node) {
    };
    /**
     * 访问一个浮点数字面量(1)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitNumericLiteral = function (node) {
    };
    /**
     * 访问一个字符串字面量('...')。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitStringLiteral = function (node) {
    };
    /**
     * 访问一个数组字面量([...])。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitArrayLiteral = function (node) {
        node.elements.accept(this);
    };
    /**
     * 访问一个对象字面量({x: ...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitObjectLiteral = function (node) {
        node.elements.accept(this);
    };
    /**
     * 访问一个对象字面量项。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitObjectLiteralElement = function (node) {
        node.name.accept(this);
        node.value.accept(this);
    };
    /**
     * 访问 this 字面量(this)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitThisLiteral = function (node) {
    };
    /**
     * 访问 super 字面量(super)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitSuperLiteral = function (node) {
    };
    /**
     * 访问一个括号表达式((...))。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitParenthesizedExpression = function (node) {
        node.body.accept(this);
    };
    /**
     * 访问一个条件表达式(... ? ... : ...)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitConditionalExpression = function (node) {
        node.condition.accept(this);
        node.then.accept(this);
        node.else.accept(this);
    };
    /**
     * 访问一个箭头函数(x => ...)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitLambdaLiteral = function (node) {
        node.typeParameters.accept(this);
        node.parameters.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 yield 表达式(yield xx)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitYieldExpression = function (node) {
        node.body.accept(this);
    };
    /**
     * 访问一个类型转换表达式(<T>xx)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitCastExpression = function (node) {
        node.type.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个成员调用表达式(x.y)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitMemberCallExpression = function (node) {
        node.target.accept(this);
        node.argument.accept(this);
    };
    /**
     * 访问一个函数调用表达式(x(...))。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitCallExpression = function (node) {
        node.target.accept(this);
        node.arguments.accept(this);
    };
    /**
     * 访问一个 new 表达式(new x(...))。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitNewExpression = function (node) {
        node.target.accept(this);
        node.arguments.accept(this);
    };
    /**
     * 访问一个索引调用表达式(x[...])。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitIndexCallExpression = function (node) {
        node.target.accept(this);
        node.arguments.accept(this);
    };
    /**
     * 访问一个一元运算表达式(+x)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitUnaryExpression = function (node) {
        node.operand.accept(this);
    };
    /**
     * 访问一个二元运算表达式(x + y)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitBinaryExpression = function (node) {
        node.leftOperand.accept(this);
        node.rightOperand.accept(this);
    };
    /**
     * 访问内置类型字面量(number)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitPredefinedTypeLiteral = function (node) {
    };
    /**
     * 访问一个泛型表达式(Array<T>)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitGenericTypeExpression = function (node) {
        node.element.accept(this);
        node.genericArguments.accept(this);
    };
    /**
     * 访问一个数组类型表达式(NodeList<T>)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitArrayTypeExpression = function (node) {
        node.element.accept(this);
    };
    /**
     * 访问一个类型（如类、结构、接口）定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitTypeDefinition = function (node) {
        node.extends.accept(this);
        node.implements.accept(this);
        node.genericParameters.accept(this);
        node.members.accept(this);
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个成员（如方法、字段、类、模块等）定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitMemberDefinition = function (node) {
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个注解(@xx(...))。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitAnnotation = function (node) {
        node.target.accept(this);
        node.arguments.accept(this);
    };
    /**
     * 访问一个参数声明。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitParameterDeclaration = function (node) {
        node.annotations.accept(this);
    };
    /**
     * 访问一个泛型参数。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitGenericParameterDeclaration = function (node) {
        node.name.accept(this);
        node.constraint.accept(this);
    };
    /**
     * 访问一个可以保存子成员的容器成员定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitMemberContainerDefinition = function (node) {
        node.members.accept(this);
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个类定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitClassDefinition = function (node) {
        node.extends.accept(this);
        node.implements.accept(this);
        node.genericParameters.accept(this);
        node.members.accept(this);
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个结构定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitStructDefinition = function (node) {
        node.extends.accept(this);
        node.implements.accept(this);
        node.genericParameters.accept(this);
        node.members.accept(this);
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个接口定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitInterfaceDefinition = function (node) {
        node.extends.accept(this);
        node.implements.accept(this);
        node.genericParameters.accept(this);
        node.members.accept(this);
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个枚举定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitEnumDefinition = function (node) {
        node.extends.accept(this);
        node.implements.accept(this);
        node.genericParameters.accept(this);
        node.members.accept(this);
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个扩展定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitExtensionDefinition = function (node) {
        node.targetType.accept(this);
        node.baseTypes.accept(this);
        node.members.accept(this);
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个命名空间定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitNamespaceDefinition = function (node) {
        node.names.accept(this);
        node.members.accept(this);
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个 import 指令。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitImportDirective = function (node) {
        node.next.accept(this);
        node.alias.accept(this);
        node.value.accept(this);
    };
    /**
     * 访问一个模块。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitModuleDefinition = function (node) {
        node.members.accept(this);
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个类型子成员定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitTypeMemberDefinition = function (node) {
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个字段定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitFieldDefinition = function (node) {
        node.variables.accept(this);
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个方法或属性定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitMethodOrPropertyDefinition = function (node) {
        node.returnType.accept(this);
        node.explicitType.accept(this);
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个属性或索引器定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitPropertyOrIndexerDefinition = function (node) {
        node.body.accept(this);
        node.returnType.accept(this);
        node.explicitType.accept(this);
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个属性定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitPropertyDefinition = function (node) {
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个索引器定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitIndexerDefinition = function (node) {
        node.parameters.accept(this);
        node.body.accept(this);
        node.returnType.accept(this);
        node.explicitType.accept(this);
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个方法或构造函数定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitMethodOrConstructorDefinition = function (node) {
        node.parameters.accept(this);
        node.body.accept(this);
        node.returnType.accept(this);
        node.explicitType.accept(this);
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个方法定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitMethodDefinition = function (node) {
        node.genericParameters.accept(this);
        node.parameters.accept(this);
        node.body.accept(this);
        node.returnType.accept(this);
        node.explicitType.accept(this);
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个构造函数定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitConstructorDefinition = function (node) {
        node.parameters.accept(this);
        node.body.accept(this);
        node.returnType.accept(this);
        node.explicitType.accept(this);
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个枚举的成员定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitEnumMemberDefinition = function (node) {
        node.initializer.accept(this);
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 标识一个 JS 文档注释。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitJsDocComment = function (node) {
    };
    return NodeVisitor;
}());
exports.NodeVisitor = NodeVisitor;
//# sourceMappingURL=nodeVisitor.js.map