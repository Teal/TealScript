/**
 * @fileOverview 节点访问器
 * @generated 此文件可使用 `$ tpack gen-nodes` 命令生成。
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
        node.comments && node.comments.accept(this);
        node.jsDoc && node.jsDoc.accept(this);
        node.statements.accept(this);
    };
    /**
     * 访问一个语句块({...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitBlockStatement = function (node) {
        node.statements.accept(this);
    };
    /**
     * 访问一个变量声明语句(var xx、let xx、const xx)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitVariableStatement = function (node) {
        node.decorators && node.decorators.accept(this);
        node.modifiers && node.modifiers.accept(this);
        node.variables.accept(this);
    };
    /**
     * 访问一个空语句(;)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitEmptyStatement = function (node) {
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
     * 访问一个表达式语句(x();)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitExpressionStatement = function (node) {
        node.body.accept(this);
    };
    /**
     * 访问一个 if 语句(if(xx) ...)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitIfStatement = function (node) {
        node.condition.accept(this);
        node.then.accept(this);
        node.else && node.else.accept(this);
    };
    /**
     * 访问一个 switch 语句(switch(xx){...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitSwitchStatement = function (node) {
        node.condition && node.condition.accept(this);
        node.cases.accept(this);
    };
    /**
     * 访问一个 switch 语句的 case 分支(case ...:{...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitCaseClause = function (node) {
        node.label && node.label.accept(this);
        node.statements.accept(this);
    };
    /**
     * 访问一个 for 语句(for(var i = 0; i < 9; i++) ...)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitForStatement = function (node) {
        node.initializer && node.initializer.accept(this);
        node.condition && node.condition.accept(this);
        node.iterator && node.iterator.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 for..in 语句(for(var x in y) ...)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitForInStatement = function (node) {
        node.variable.accept(this);
        node.iterator.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 for..of 语句(for(var x of y) ...)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitForOfStatement = function (node) {
        node.variable.accept(this);
        node.iterator.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 for..to 语句(for(var x = 0 to 10) ...)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitForToStatement = function (node) {
        node.variable.accept(this);
        node.initializer && node.initializer.accept(this);
        node.iterator.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 while 语句(while(...) ...)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitWhileStatement = function (node) {
        node.condition.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 do..while 语句(do ... while(xx);)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitDoWhileStatement = function (node) {
        node.condition.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 continue 语句(continue xx;)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitContinueStatement = function (node) {
        node.label && node.label.accept(this);
    };
    /**
     * 访问一个 break 语句(break xx;)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitBreakStatement = function (node) {
        node.label && node.label.accept(this);
    };
    /**
     * 访问一个 return 语句(return xx;)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitReturnStatement = function (node) {
        node.value && node.value.accept(this);
    };
    /**
     * 访问一个 throw 语句(throw xx;)。
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
     * 访问一个 try 语句的 catch 分句(catch(e) {...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitCatchClause = function (node) {
        node.variable.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 try 语句的 finally 分句(finally {...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitFinallyClause = function (node) {
        node.body.accept(this);
    };
    /**
     * 访问一个 debugger 语句(debugger;)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitDebuggerStatement = function (node) {
    };
    /**
     * 访问一个 with 语句(with(...) ...)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitWithStatement = function (node) {
        node.value.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个标识符(x)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitIdentifier = function (node) {
    };
    /**
     * 访问一个数字字面量(1)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitNumericLiteral = function (node) {
    };
    /**
     * 访问一个字符串字面量('abc'、"abc"、`abc`)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitStringLiteral = function (node) {
    };
    /**
     * 访问一个模板字符串字面量(`abc${x + y}def`)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitTemplateLiteral = function (node) {
        node.tag && node.tag.accept(this);
        node.spans.accept(this);
    };
    /**
     * 访问一个正则表达式字面量(/abc/)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitRegularExpressionLiteral = function (node) {
    };
    /**
     * 访问一个数组字面量([x, y])。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitArrayLiteral = function (node) {
        node.elements.accept(this);
    };
    /**
     * 访问一个对象字面量({x: y})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitObjectLiteral = function (node) {
        node.elements.accept(this);
    };
    /**
     * 访问一个函数表达式(function () {})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitFunctionExpression = function (node) {
    };
    /**
     * 访问一个类表达式(class xx {})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitClassExpression = function (node) {
    };
    /**
     * 访问一个接口表达式(interface xx {})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitInterfaceExpression = function (node) {
    };
    /**
     * 访问一个枚举表达式(enum xx {})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitEnumExpression = function (node) {
    };
    /**
     * 访问一个括号表达式((x))。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitParenthesizedExpression = function (node) {
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
     * 访问一个函数调用表达式(x())。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitCallExpression = function (node) {
        node.target.accept(this);
        node.arguments.accept(this);
    };
    /**
     * 访问一个 new 表达式(new x())。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitNewExpression = function (node) {
        node.target.accept(this);
        node.arguments.accept(this);
    };
    /**
     * 访问一个索引调用表达式(x[y])。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitIndexCallExpression = function (node) {
        node.target.accept(this);
        node.arguments.accept(this);
    };
    /**
     * 访问一个一元运算表达式(+x、typeof x、...)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitUnaryExpression = function (node) {
        node.operand.accept(this);
    };
    /**
     * 访问一个二元运算表达式(x + y、x = y、...)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitBinaryExpression = function (node) {
        node.leftOperand.accept(this);
        node.rightOperand.accept(this);
    };
    /**
     * 访问一个 yield 表达式(yield x、yield * x)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitYieldExpression = function (node) {
        node.body.accept(this);
    };
    /**
     * 访问一个箭头函数(x => y)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitArrowFunction = function (node) {
        node.typeParameters.accept(this);
        node.parameters.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个条件表达式(x ? y : z)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitConditionalExpression = function (node) {
        node.condition.accept(this);
        node.then.accept(this);
        node.else.accept(this);
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
     * 访问一个泛型表达式(Array<T>)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitGenericTypeExpression = function (node) {
        node.element.accept(this);
        node.genericArguments.accept(this);
    };
    /**
     * 访问一个数组类型表达式(T[])。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitArrayTypeExpression = function (node) {
        node.element.accept(this);
    };
    /**
     * 访问一个 JSX 标签(<div>...</div>)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitJsxElement = function (node) {
        node.tagName.accept(this);
        node.attributes.accept(this);
        node.children.accept(this);
    };
    /**
     * 访问一个 JSX 标签属性(id="a")。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitJsxAttribute = function (node) {
        node.name.accept(this);
        node.value && node.value.accept(this);
    };
    /**
     * 访问一个 JSX 表达式({...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitJsxExpression = function (node) {
        node.body.accept(this);
    };
    /**
     * 访问一个 JSX 文本({...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitJsxText = function (node) {
    };
    /**
     * 访问一个 JSX 关闭元素({...})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitJsxClosingElement = function (node) {
        node.tagName.accept(this);
    };
    /**
     * 访问一个描述器(@xx(...))。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitDecorator = function (node) {
        node.body.accept(this);
    };
    /**
     * 访问一个修饰符(public)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitModifier = function (node) {
    };
    /**
     * 访问一个类定义(@class ...)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitClassDefinition = function (node) {
        node.extends.accept(this);
        node.implements.accept(this);
        node.genericParameters && node.genericParameters.accept(this);
        node.members.accept(this);
        node.decorators.accept(this);
        node.modifiers.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个接口定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitInterfaceDefinition = function (node) {
        node.extends.accept(this);
        node.implements.accept(this);
        node.genericParameters && node.genericParameters.accept(this);
        node.members.accept(this);
        node.decorators.accept(this);
        node.modifiers.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个枚举定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitEnumDefinition = function (node) {
        node.members.accept(this);
        node.extends.accept(this);
        node.implements.accept(this);
        node.genericParameters && node.genericParameters.accept(this);
        node.decorators.accept(this);
        node.modifiers.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个扩展定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitExtensionDefinition = function (node) {
        node.targetType.accept(this);
        node.implements.accept(this);
        node.members.accept(this);
        node.decorators.accept(this);
        node.modifiers.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个命名空间定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitNamespaceDefinition = function (node) {
        node.names.accept(this);
        node.members.accept(this);
        node.decorators.accept(this);
        node.modifiers.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个模块。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitModuleDefinition = function (node) {
        node.members.accept(this);
        node.decorators.accept(this);
        node.modifiers.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个类型子成员定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitTypeMemberDefinition = function (node) {
        node.decorators.accept(this);
        node.modifiers.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个字段定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitFieldDefinition = function (node) {
        node.variables.accept(this);
        node.decorators.accept(this);
        node.modifiers.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个方法或属性定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitMethodOrPropertyDefinition = function (node) {
        node.returnType.accept(this);
        node.explicitType.accept(this);
        node.decorators.accept(this);
        node.modifiers.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个属性或索引器定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitPropertyOrIndexerDefinition = function (node) {
        node.body.accept(this);
        node.returnType.accept(this);
        node.explicitType.accept(this);
        node.decorators.accept(this);
        node.modifiers.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个对象属性定义(x: y)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitPropertyDefinition = function (node) {
        node.name.accept(this);
        node.value && node.value.accept(this);
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
        node.decorators.accept(this);
        node.modifiers.accept(this);
        node.name && node.name.accept(this);
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
        node.decorators.accept(this);
        node.modifiers.accept(this);
        node.name && node.name.accept(this);
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
        node.decorators.accept(this);
        node.modifiers.accept(this);
        node.name && node.name.accept(this);
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
        node.decorators.accept(this);
        node.modifiers.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个枚举的成员定义。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitEnumMemberDefinition = function (node) {
        node.initializer.accept(this);
        node.decorators.accept(this);
        node.modifiers.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个 import 指令(import xx from '...';)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitImportDirective = function (node) {
        node.elements.accept(this);
        node.target.accept(this);
    };
    /**
     * 访问一个 import = 指令(import xx = require("");)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitImportEqualsDirective = function (node) {
        node.variable.accept(this);
        node.value.accept(this);
    };
    /**
     * 访问一个名字导入声明项(a as b)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitNameImportClause = function (node) {
        node.name && node.name.accept(this);
        node.alias.accept(this);
    };
    /**
     * 访问一个命名空间导入声明项({a as b})。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitNamespaceImportClause = function (node) {
        node.elements.accept(this);
    };
    /**
     * 访问一个 export 指令(export xx from '...';)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitExportDirective = function (node) {
        node.elements.accept(this);
        node.target.accept(this);
    };
    /**
     * 访问一个 export = 指令(export = 1;)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitExportEqualsDirective = function (node) {
        node.value.accept(this);
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
     * 访问一个变量声明(xx = ...)。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitVariableDeclaration = function (node) {
        node.type.accept(this);
        node.initializer.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个参数声明。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitParameterDeclaration = function (node) {
        node.decorators.accept(this);
        node.modifiers.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个泛型参数。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitGenericParameterDeclaration = function (node) {
        node.name.accept(this);
        node.constraint && node.constraint.accept(this);
    };
    /**
     * 访问一个 JS 注释。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitComment = function (node) {
    };
    /**
     * 访问一个 JS 文档注释。
     * @param node 要访问的节点。
     */
    NodeVisitor.prototype.visitJsDocComment = function (node) {
    };
    return NodeVisitor;
}());
exports.NodeVisitor = NodeVisitor;
//# sourceMappingURL=nodeVisitor.js.map