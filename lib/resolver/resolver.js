var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var nodes = require('../ast/nodes');
var nodeVisitor_1 = require('../ast/nodeVisitor');
var symbols = require('./symbols');
/**
 * 表示一个语义分析器。
 */
var Resolver = (function (_super) {
    __extends(Resolver, _super);
    /**
     * 初始化新的语义分析器。
     * @param pkg 要分析的包。
     */
    function Resolver(pkg) {
        _super.call(this);
        this.anyType = new symbols.PrimaryTypeSymbol("any");
        this.nullType = new symbols.PrimaryTypeSymbol("null");
        this.package = pkg;
        // 初始化语法树以便语义分析。
    }
    /**
     * 启用语义分析。
     */
    Resolver.prototype.enable = function () {
    };
    /**
     * 禁用语义分析。此操作可能使正在进行的语义分析终止。
     */
    Resolver.prototype.disable = function () {
    };
    /**
     * 获取指定表达式的类型。
     * @param node 要获取的节点。
     */
    Resolver.prototype.resolveTypeOfExpression = function (node) {
        switch (node.constructor) {
            case nodes.NullLiteral:
                return this.nullType;
        }
    };
    /**
     * 获取指定标识符的标识。
     * @param node 要获取的节点。
     */
    Resolver.prototype.resolveSymbolOfIdentifier = function (node) {
    };
    /**
     *
     * @param block
     * @param name
     */
    Resolver.prototype.resolveValueOfString = function (block, name) {
    };
    ///**
    // * 获取指定节点的类型。
    // * @param node
    // */
    //getTypeOfNode(node: nodes.Node) {
    //}
    // #region 节点访问器
    /**
     * 访问一个源文件。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitSourceFile = function (node) {
        node.comments && node.comments.accept(this);
        node.jsDoc && node.jsDoc.accept(this);
        node.statements.accept(this);
    };
    /**
     * 访问一个空语句(;)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitEmptyStatement = function (node) {
    };
    /**
     * 访问一个语句块({...})。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitBlock = function (node) {
        node.statements.accept(this);
    };
    /**
     * 访问一个变量声明语句(var xx = ...)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitVariableStatement = function (node) {
        node.variables.accept(this);
    };
    /**
     * 访问一个标签语句(xx: ...)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitLabeledStatement = function (node) {
        node.label.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个表达式语句(...;)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitExpressionStatement = function (node) {
        node.body.accept(this);
    };
    /**
     * 访问一个 if 语句(if(...) {...})。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitIfStatement = function (node) {
        node.condition.accept(this);
        node.then.accept(this);
        node.else && node.else.accept(this);
    };
    /**
     * 访问一个 switch 语句(switch(...){...})。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitSwitchStatement = function (node) {
        node.condition.accept(this);
        node.cases.accept(this);
    };
    /**
     * 访问一个 switch 语句的 case 分支(case ...:{...})。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitCaseClause = function (node) {
        node.label && node.label.accept(this);
        node.statements.accept(this);
    };
    /**
     * 访问一个 for 语句(for(...; ...; ...) {...})。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitForStatement = function (node) {
        node.initializer && node.initializer.accept(this);
        node.condition && node.condition.accept(this);
        node.iterator && node.iterator.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 for..in 语句(for(var xx in ...) {...})。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitForInStatement = function (node) {
        node.variable.accept(this);
        node.iterator.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 for..of 语句(for(var xx of ...) {...})。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitForOfStatement = function (node) {
        node.variable.accept(this);
        node.iterator.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 while 语句(while(...) {...})。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitWhileStatement = function (node) {
        node.condition.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 do..while 语句(do {...} while(...);)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitDoWhileStatement = function (node) {
        node.condition.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 continue 语句(continue;)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitContinueStatement = function (node) {
        node.label && node.label.accept(this);
    };
    /**
     * 访问一个 break 语句(break;)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitBreakStatement = function (node) {
        node.label && node.label.accept(this);
    };
    /**
     * 访问一个 return 语句(return ...;)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitReturnStatement = function (node) {
        node.value && node.value.accept(this);
    };
    /**
     * 访问一个 throw 语句(throw ...;)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitThrowStatement = function (node) {
        node.value.accept(this);
    };
    /**
     * 访问一个 try 语句(try {...} catch(e) {...})。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitTryStatement = function (node) {
        node.try.accept(this);
        node.catch.accept(this);
        node.finally.accept(this);
    };
    /**
     * 访问一个 try 语句的 catch 分句(catch(e) {...})。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitCatchClause = function (node) {
        node.variable.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 try 语句的 finally 分句(finally {...})。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitFinallyClause = function (node) {
        node.body.accept(this);
    };
    /**
     * 访问一个 with 语句(with(...) {...})。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitWithStatement = function (node) {
        node.value.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个标识符(xx)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitIdentifier = function (node) {
    };
    /**
     * 访问 null 字面量(null)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitNullLiteral = function (node) {
    };
    /**
     * 访问 true 字面量(true)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitTrueLiteral = function (node) {
    };
    /**
     * 访问 false 字面量(false)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitFalseLiteral = function (node) {
    };
    /**
     * 访问一个浮点数字面量(1)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitNumericLiteral = function (node) {
    };
    /**
     * 访问一个字符串字面量('...')。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitStringLiteral = function (node) {
    };
    /**
     * 访问一个数组字面量([...])。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitArrayLiteral = function (node) {
        node.elements.accept(this);
    };
    /**
     * 访问一个对象字面量({x: ...})。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitObjectLiteral = function (node) {
        node.elements.accept(this);
    };
    /**
     * 访问一个对象字面量项。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitObjectLiteralElement = function (node) {
        node.name.accept(this);
        node.value.accept(this);
    };
    /**
     * 访问 this 字面量(this)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitThisLiteral = function (node) {
    };
    /**
     * 访问 super 字面量(super)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitSuperLiteral = function (node) {
    };
    /**
     * 访问一个括号表达式((...))。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitParenthesizedExpression = function (node) {
        node.body.accept(this);
    };
    /**
     * 访问一个条件表达式(... ? ... : ...)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitConditionalExpression = function (node) {
        node.condition.accept(this);
        node.then.accept(this);
        node.else.accept(this);
    };
    /**
     * 访问一个成员调用表达式(x.y)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitMemberCallExpression = function (node) {
        node.target.accept(this);
        node.argument.accept(this);
    };
    /**
     * 访问一个函数调用表达式(x(...))。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitCallExpression = function (node) {
        node.target.accept(this);
        node.arguments.accept(this);
    };
    /**
     * 访问一个 new 表达式(new x(...))。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitNewExpression = function (node) {
        node.target.accept(this);
        node.arguments.accept(this);
    };
    /**
     * 访问一个索引调用表达式(x[...])。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitIndexCallExpression = function (node) {
        node.target.accept(this);
        node.arguments.accept(this);
    };
    /**
     * 访问一个一元运算表达式(+x)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitUnaryExpression = function (node) {
        node.operand.accept(this);
    };
    /**
     * 访问一个二元运算表达式(x + y)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitBinaryExpression = function (node) {
        node.leftOperand.accept(this);
        node.rightOperand.accept(this);
    };
    /**
     * 访问一个箭头函数(x => ...)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitLambdaLiteral = function (node) {
        node.typeParameters.accept(this);
        node.parameters.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问一个 yield 表达式(yield xx)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitYieldExpression = function (node) {
        node.body.accept(this);
    };
    /**
     * 访问一个类型转换表达式(<T>xx)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitCastExpression = function (node) {
        node.type.accept(this);
        node.body.accept(this);
    };
    /**
     * 访问内置类型字面量(number)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitPredefinedTypeLiteral = function (node) {
    };
    /**
     * 访问一个泛型表达式(Array<T>)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitGenericTypeExpression = function (node) {
        node.element.accept(this);
        node.genericArguments.accept(this);
    };
    /**
     * 访问一个数组类型表达式(T[])。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitArrayTypeExpression = function (node) {
        node.element.accept(this);
    };
    /**
     * 访问一个注解(@xx(...))。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitAnnotation = function (node) {
        node.target.accept(this);
        node.arguments.accept(this);
    };
    /**
     * 访问一个类定义(@class ...)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitClassDefinition = function (node) {
        node.extends.accept(this);
        node.implements.accept(this);
        node.genericParameters && node.genericParameters.accept(this);
        node.members.accept(this);
        node.annotations.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个接口定义。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitInterfaceDefinition = function (node) {
        node.extends.accept(this);
        node.implements.accept(this);
        node.genericParameters && node.genericParameters.accept(this);
        node.members.accept(this);
        node.annotations.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个枚举定义。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitEnumDefinition = function (node) {
        node.members.accept(this);
        node.extends.accept(this);
        node.implements.accept(this);
        node.genericParameters && node.genericParameters.accept(this);
        node.annotations.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个扩展定义。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitExtensionDefinition = function (node) {
        node.targetType.accept(this);
        node.implements.accept(this);
        node.members.accept(this);
        node.annotations.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个命名空间定义。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitNamespaceDefinition = function (node) {
        node.names.accept(this);
        node.members.accept(this);
        node.annotations.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个模块。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitModuleDefinition = function (node) {
        node.members.accept(this);
        node.annotations.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个类型子成员定义。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitTypeMemberDefinition = function (node) {
        node.annotations.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个字段定义。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitFieldDefinition = function (node) {
        node.variables.accept(this);
        node.annotations.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个方法或属性定义。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitMethodOrPropertyDefinition = function (node) {
        node.returnType.accept(this);
        node.explicitType.accept(this);
        node.annotations.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个属性或索引器定义。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitPropertyOrIndexerDefinition = function (node) {
        node.body.accept(this);
        node.returnType.accept(this);
        node.explicitType.accept(this);
        node.annotations.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个属性定义。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitPropertyDefinition = function (node) {
        node.annotations.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个索引器定义。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitIndexerDefinition = function (node) {
        node.parameters.accept(this);
        node.body.accept(this);
        node.returnType.accept(this);
        node.explicitType.accept(this);
        node.annotations.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个方法或构造函数定义。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitMethodOrConstructorDefinition = function (node) {
        node.parameters.accept(this);
        node.body.accept(this);
        node.returnType.accept(this);
        node.explicitType.accept(this);
        node.annotations.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个方法定义。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitMethodDefinition = function (node) {
        node.genericParameters.accept(this);
        node.parameters.accept(this);
        node.body.accept(this);
        node.returnType.accept(this);
        node.explicitType.accept(this);
        node.annotations.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个构造函数定义。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitConstructorDefinition = function (node) {
        node.parameters.accept(this);
        node.body.accept(this);
        node.returnType.accept(this);
        node.explicitType.accept(this);
        node.annotations.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个枚举的成员定义。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitEnumMemberDefinition = function (node) {
        node.initializer.accept(this);
        node.annotations.accept(this);
        node.name && node.name.accept(this);
    };
    /**
     * 访问一个 import 指令(import xx from '...';)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitImportDirective = function (node) {
        node.from.accept(this);
        node.alias.accept(this);
        node.value.accept(this);
    };
    /**
     * 访问一个数组绑定模式([xx, ...])
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitArrayBindingPattern = function (node) {
        node.elements.accept(this);
    };
    /**
     * 访问一个数组绑定模式项(xx, ..)
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitArrayBindingElement = function (node) {
        node.initializer.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个对象绑定模式({xx, ...})
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitObjectBindingPattern = function (node) {
        node.elements.accept(this);
    };
    /**
     * 访问一个对象绑定模式项(xx: y)
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitObjectBindingElement = function (node) {
        node.propertyName.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个变量声明(xx = ...)。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitVariableDeclaration = function (node) {
        node.type.accept(this);
        node.initializer.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个参数声明。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitParameterDeclaration = function (node) {
        node.annotations.accept(this);
        node.name.accept(this);
    };
    /**
     * 访问一个泛型参数。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitGenericParameterDeclaration = function (node) {
        node.name.accept(this);
        node.constraint && node.constraint.accept(this);
    };
    /**
     * 访问一个 JS 注释。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitComment = function (node) {
    };
    /**
     * 访问一个 JS 文档注释。
     * @param node 要访问的节点。
     */
    Resolver.prototype.visitJsDocComment = function (node) {
    };
    return Resolver;
}(nodeVisitor_1.NodeVisitor));
exports.Resolver = Resolver;
//# sourceMappingURL=resolver.js.map