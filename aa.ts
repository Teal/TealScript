/**
 * @fileOverview 节点访问器
 * @generated 此文件可使用 `$ tpack gen-nodes` 命令生成。
 */

import * as nodes from './nodes';

/**
 * 表示一个节点访问器。
 */
export abstract class NodeVisitor {
    
    // #region 核心

    /**
        * 访问一个逗号隔开的节点列表(<..., ...>。
        * @param nodes 要访问的节点列表。
        */
    visitNodeList<T extends nodes.Node>(nodes: nodes.NodeList<T>) {
        for(const node of nodes) {
            node.accept(this);
        }
    }

    /**
        * 访问一个源文件。
        * @param node 要访问的节点。
        */
    visitSourceFile(node: nodes.SourceFile) {
        node.statements.accept(this);
    }
    
    // #endregion

    // #region 类型节点

    /**
     * 访问一个内置类型节点(`number`、`string`、...)。
     * @param node 要访问的节点。
     */
    visitPredefinedTypeNode(node: nodes.PredefinedTypeNode) {
       node.type.accept(this);
    }

    /**
     * 访问一个函数或括号类型节点(`() => void`、`(x)`)。
     * @param node 要访问的节点。
     */
    visitFunctionOrParenthesizedTypeNode(node: nodes.FunctionOrParenthesizedTypeNode) {

    }

    /**
     * 访问一个括号类型节点(`(number)`)。
     * @param node 要访问的节点。
     */
    visitParenthesizedTypeNode(node: nodes.ParenthesizedTypeNode) {
       node.openParenToken.accept(this);
       node.body.accept(this);
       node.closeParenToken.accept(this);
    }

    /**
     * 访问一个函数类型节点(`(x: number) => void`)。
     * @param node 要访问的节点。
     */
    visitFunctionTypeNode(node: nodes.FunctionTypeNode) {
       node.typeParameters && node.typeParameters.accept(this);
       node.parameters && node.parameters.accept(this);
       node.equalsGreaterThanToken.accept(this);
       node.return.accept(this);
    }

    /**
     * 访问一个元祖类型节点(`[string, number]`)。
     * @param node 要访问的节点。
     */
    visitTupleTypeNode(node: nodes.TupleTypeNode) {

    }

    /**
     * 访问一个元祖类型节点元素(`x`)。
     * @param node 要访问的节点。
     */
    visitTupleTypeElement(node: nodes.TupleTypeElement) {
       node.value.accept(this);
    }

    /**
     * 访问一个对象类型节点(`{x: number}`)。
     * @param node 要访问的节点。
     */
    visitObjectTypeNode(node: nodes.ObjectTypeNode) {
       node.elements.accept(this);
    }

    /**
     * 访问一个构造函数类型节点(`new () => void`)。
     * @param node 要访问的节点。
     */
    visitConstructorTypeNode(node: nodes.ConstructorTypeNode) {
       node.newToken.accept(this);
       node.typeParameters && node.typeParameters.accept(this);
       node.parameters.accept(this);
       node.equalsGreaterThanToken.accept(this);
       node.return.accept(this);
    }

    /**
     * 访问一个类型查询节点(`typeof x`)。
     * @param node 要访问的节点。
     */
    visitTypeQueryNode(node: nodes.TypeQueryNode) {
       node.typeofToken.accept(this);
       node.operand.accept(this);
    }

    /**
     * 访问一个字面量类型节点(`"abc"`、`true`)。
     * @param node 要访问的节点。
     */
    visitLiteralTypeNode(node: nodes.LiteralTypeNode) {
       node.value.accept(this);
    }

    /**
     * 访问一个泛型类型节点(`x<T>`)或类型引用节点(`x`)。
     * @param node 要访问的节点。
     */
    visitGenericTypeOrTypeReferenceNode(node: nodes.GenericTypeOrTypeReferenceNode) {

    }

    /**
     * 访问一个类型引用节点(`x`)。
     * @param node 要访问的节点。
     */
    visitTypeReferenceNode(node: nodes.TypeReferenceNode) {
       node.value && node.value.accept(this);
    }

    /**
     * 访问一个泛型类型节点(`Array<number>`)。
     * @param node 要访问的节点。
     */
    visitGenericTypeNode(node: nodes.GenericTypeNode) {
       node.target.accept(this);
       node.typeArguments.accept(this);
    }

    /**
     * 访问一个限定名称类型节点(`"abc"`、`true`)。
     * @param node 要访问的节点。
     */
    visitQualifiedNameTypeNode(node: nodes.QualifiedNameTypeNode) {
       node.target.accept(this);
       node.dotToken.accept(this);
       node.argument.accept(this);
    }

    /**
     * 访问一个数组类型节点(`T[]`)。
     * @param node 要访问的节点。
     */
    visitArrayTypeNode(node: nodes.ArrayTypeNode) {
       node.target.accept(this);
       node.openBracketToken.accept(this);
       node.closeBracketToken.accept(this);
    }

    /**
     * 访问一个双目表达式(`x + y`、`x = y`、...)。
     * @param node 要访问的节点。
     */
    visitBinaryTypeNode(node: nodes.BinaryTypeNode) {
       node.left.accept(this);
       node.operator.accept(this);
       node.right.accept(this);
    }

    /**
     * 访问一个访问器签名(`get x(): number`、`set x(value): void`)。
     * @param node 要访问的节点。
     */
    visitAccessorSignature(node: nodes.AccessorSignature) {
       node.getToken && node.getToken.accept(this);
       node.setToken && node.setToken.accept(this);
       node.name.accept(this);
       node.questionToken && node.questionToken.accept(this);
       node.parameters.accept(this);
       node.colonToken && node.colonToken.accept(this);
       node.type && node.type.accept(this);
       node.commaToken && node.commaToken.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个索引器声明(`[key: string]: string``)。
     * @param node 要访问的节点。
     */
    visitIndexSignature(node: nodes.IndexSignature) {
       node.openBracketToken.accept(this);
       node.parameter.accept(this);
       node.closeBracketToken.accept(this);
       node.colonToken && node.colonToken.accept(this);
       node.type && node.type.accept(this);
       node.commaToken && node.commaToken.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个函数签名(`(): number`)。
     * @param node 要访问的节点。
     */
    visitFunctionSignature(node: nodes.FunctionSignature) {
       node.typeParameters && node.typeParameters.accept(this);
       node.parameters.accept(this);
       node.colonToken && node.colonToken.accept(this);
       node.type && node.type.accept(this);
       node.commaToken && node.commaToken.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个构造函数签名(`new x(): number`)。
     * @param node 要访问的节点。
     */
    visitConstructSignature(node: nodes.ConstructSignature) {
       node.newToken.accept(this);
       node.typeParameters && node.typeParameters.accept(this);
       node.parameters.accept(this);
       node.colonToken && node.colonToken.accept(this);
       node.type && node.type.accept(this);
       node.commaToken && node.commaToken.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个方法签名(`x(): number`)。
     * @param node 要访问的节点。
     */
    visitMethodSignature(node: nodes.MethodSignature) {
       node.name.accept(this);
       node.questionToken && node.questionToken.accept(this);
       node.typeParameters && node.typeParameters.accept(this);
       node.parameters.accept(this);
       node.colonToken && node.colonToken.accept(this);
       node.type && node.type.accept(this);
       node.commaToken && node.commaToken.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个属性签名(`x: number`)。
     * @param node 要访问的节点。
     */
    visitPropertySignature(node: nodes.PropertySignature) {
       node.name.accept(this);
       node.questionToken && node.questionToken.accept(this);
       node.colonToken && node.colonToken.accept(this);
       node.type && node.type.accept(this);
       node.commaToken && node.commaToken.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个方法(`x(): number`)或构造函数(`new x(): number`)或函数(`(): number`)签名。
     * @param node 要访问的节点。
     */
    visitMethodOrConstructOrCallSignature(node: nodes.MethodOrConstructOrCallSignature) {
       node.typeParameters && node.typeParameters.accept(this);
       node.parameters.accept(this);
       node.colonToken && node.colonToken.accept(this);
       node.type && node.type.accept(this);
       node.commaToken && node.commaToken.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个类型参数列表(`<T>`)。
     * @param node 要访问的节点。
     */
    visitTypeParameters(node: nodes.TypeParameters) {

    }

    /**
     * 访问一个类型参数声明(`T`、`T extends R`)。
     * @param node 要访问的节点。
     */
    visitTypeParameterDeclaration(node: nodes.TypeParameterDeclaration) {
       node.name.accept(this);
       node.extendsToken && node.extendsToken.accept(this);
       node.extends && node.extends.accept(this);
    }

    /**
     * 访问一个类型参数列表(`<number>`)。
     * @param node 要访问的节点。
     */
    visitTypeArguments(node: nodes.TypeArguments) {

    }

    /**
     * 访问一个类型参数(`number`)。
     * @param node 要访问的节点。
     */
    visitTypeArgument(node: nodes.TypeArgument) {
       node.value.accept(this);
    }

    /**
     * 访问一个参数列表(`(x, y)`)。
     * @param node 要访问的节点。
     */
    visitParameters(node: nodes.Parameters) {

    }

    /**
     * 访问一个参数声明(`x`、`x?: number`)。
     * @param node 要访问的节点。
     */
    visitParameterDeclaration(node: nodes.ParameterDeclaration) {
       node.modifiers && node.modifiers.accept(this);
       node.dotDotDotToken && node.dotDotDotToken.accept(this);
       node.name.accept(this);
       node.questionToken && node.questionToken.accept(this);
       node.colonToken && node.colonToken.accept(this);
       node.type && node.type.accept(this);
       node.equalsToken && node.equalsToken.accept(this);
       node.initializer && node.initializer.accept(this);
    }

    /**
     * 访问一个数组绑定模式项(`[x]`)。
     * @param node 要访问的节点。
     */
    visitArrayBindingPattern(node: nodes.ArrayBindingPattern) {
       node.elements.accept(this);
    }

    /**
     * 访问一个数组绑定模式项(`x`)。
     * @param node 要访问的节点。
     */
    visitArrayBindingElement(node: nodes.ArrayBindingElement) {
       node.dotDotDotToken && node.dotDotDotToken.accept(this);
       node.value && node.value.accept(this);
    }

    /**
     * 访问一个对象绑定模式项(`{x: x}`)。
     * @param node 要访问的节点。
     */
    visitObjectBindingPattern(node: nodes.ObjectBindingPattern) {
       node.elements.accept(this);
    }

    /**
     * 访问一个对象绑定模式项(`x`)。
     * @param node 要访问的节点。
     */
    visitObjectBindingElement(node: nodes.ObjectBindingElement) {
       node.key.accept(this);
       node.colonToken && node.colonToken.accept(this);
       node.value && node.value.accept(this);
       node.equalsToken && node.equalsToken.accept(this);
       node.initializer && node.initializer.accept(this);
    }

    /**
     * 访问一个类型注解(`: number`)。
     * @param node 要访问的节点。
     */
    visitTypeAnnotation(node: nodes.TypeAnnotation) {
       node.colonToken && node.colonToken.accept(this);
       node.type && node.type.accept(this);
    }

    /**
     * 访问一个初始值。
     * @param node 要访问的节点。
     */
    visitInitializer(node: nodes.Initializer) {
       node.equalsToken && node.equalsToken.accept(this);
       node.initializer && node.initializer.accept(this);
    }

    /**
     * 访问一个已计算的属性名(`[1]`)。
     * @param node 要访问的节点。
     */
    visitComputedPropertyName(node: nodes.ComputedPropertyName) {
       node.openBracketToken.accept(this);
       node.body.accept(this);
       node.closeBracketToken.accept(this);
    }
    // #endregion

    // #region 表达式

    /**
     * 访问一个对象成员尾部。
     * @param node 要访问的节点。
     */
    visitCommaOrSemicolon(node: nodes.CommaOrSemicolon) {
       node.commaToken && node.commaToken.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个简单字面量(`null`、`true`、`false`、`this`、`super`)。
     * @param node 要访问的节点。
     */
    visitSimpleLiteral(node: nodes.SimpleLiteral) {
       node.type.accept(this);
    }

    /**
     * 访问一个箭头或括号表达式(`()=>...`、`(x)`)。
     * @param node 要访问的节点。
     */
    visitArrowFunctionOrParenthesizedExpression(node: nodes.ArrowFunctionOrParenthesizedExpression) {

    }

    /**
     * 访问一个括号表达式(`(x)`)。
     * @param node 要访问的节点。
     */
    visitParenthesizedExpression(node: nodes.ParenthesizedExpression) {
       node.openParenToken.accept(this);
       node.body.accept(this);
       node.closeParenToken.accept(this);
    }

    /**
     * 访问一个数组字面量(`[x, y]`)。
     * @param node 要访问的节点。
     */
    visitArrayLiteral(node: nodes.ArrayLiteral) {
       node.elements.accept(this);
    }

    /**
     * 访问一个数组字面量元素(`x`)。
     * @param node 要访问的节点。
     */
    visitArrayLiteralElement(node: nodes.ArrayLiteralElement) {
       node.dotDotDotToken && node.dotDotDotToken.accept(this);
       node.value && node.value.accept(this);
    }

    /**
     * 访问一个对象字面量(`{x: y}`)。
     * @param node 要访问的节点。
     */
    visitObjectLiteral(node: nodes.ObjectLiteral) {
       node.elements.accept(this);
    }

    /**
     * 访问一个访问器声明(`get x() {...}`、`set x(value) {...}`)。
     * @param node 要访问的节点。
     */
    visitObjectAccessorDeclaration(node: nodes.ObjectAccessorDeclaration) {
       node.modifiers && node.modifiers.accept(this);
       node.getToken && node.getToken.accept(this);
       node.setToken && node.setToken.accept(this);
       node.name.accept(this);
       node.typeParameters && node.typeParameters.accept(this);
       node.parameters.accept(this);
       node.colonToken && node.colonToken.accept(this);
       node.type && node.type.accept(this);
       node.body && node.body.accept(this);
       node.equalsGreaterThanToken && node.equalsGreaterThanToken.accept(this);
       node.commaToken && node.commaToken.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个方法声明(`x() {...}`)。
     * @param node 要访问的节点。
     */
    visitObjectMethodDeclaration(node: nodes.ObjectMethodDeclaration) {
       node.modifiers && node.modifiers.accept(this);
       node.asteriskToken && node.asteriskToken.accept(this);
       node.name.accept(this);
       node.typeParameters && node.typeParameters.accept(this);
       node.parameters.accept(this);
       node.colonToken && node.colonToken.accept(this);
       node.type && node.type.accept(this);
       node.body && node.body.accept(this);
       node.equalsGreaterThanToken && node.equalsGreaterThanToken.accept(this);
       node.commaToken && node.commaToken.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个属性声明(`x: y`)。
     * @param node 要访问的节点。
     */
    visitObjectPropertyDeclaration(node: nodes.ObjectPropertyDeclaration) {
       node.modifiers && node.modifiers.accept(this);
       node.key.accept(this);
       node.colonToken && node.colonToken.accept(this);
       node.equalsToken && node.equalsToken.accept(this);
       node.value && node.value.accept(this);
       node.commaToken && node.commaToken.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个 new.target(`new.target`) 或 new 表达式(`new x()`)。
     * @param node 要访问的节点。
     */
    visitNewTargetOrNewExpression(node: nodes.NewTargetOrNewExpression) {

    }

    /**
     * 访问一个 new.target 表达式(`new.target`)。
     * @param node 要访问的节点。
     */
    visitNewTargetExpression(node: nodes.NewTargetExpression) {
       node.newToken.accept(this);
       node.dotToken.accept(this);
       node.target && node.target.accept(this);
    }

    /**
     * 访问一个 new 表达式(`new x()`、`new x`)。
     * @param node 要访问的节点。
     */
    visitNewExpression(node: nodes.NewExpression) {
       node.newToken.accept(this);
       node.target.accept(this);
       node.arguments && node.arguments.accept(this);
    }

    /**
     * 访问一个正则表达式字面量(/abc/)。
     * @param node 要访问的节点。
     */
    visitRegularExpressionLiteral(node: nodes.RegularExpressionLiteral) {
       node.value.accept(this);
    }

    /**
     * 访问一个模板字面量(`\`abc\``)。
     * @param node 要访问的节点。
     */
    visitTemplateLiteral(node: nodes.TemplateLiteral) {
       node.spans.accept(this);
    }

    /**
     * 访问一个模板文本区块(`\`abc${`、`}abc${`、`}abc\``)。
     * @param node 要访问的节点。
     */
    visitTemplateSpan(node: nodes.TemplateSpan) {
       node.value.accept(this);
    }

    /**
     * 访问一个箭头函数(`<T>() => {}`)或类型确认表达式(`<T>fn`)。
     * @param node 要访问的节点。
     */
    visitArrowFunctionOrTypeAssertionExpression(node: nodes.ArrowFunctionOrTypeAssertionExpression) {

    }

    /**
     * 访问一个类型确认表达式(<T>xx)。
     * @param node 要访问的节点。
     */
    visitTypeAssertionExpression(node: nodes.TypeAssertionExpression) {
       node.lessThanToken.accept(this);
       node.type.accept(this);
       node.greaterThanToken.accept(this);
       node.operand.accept(this);
    }

    /**
     * 访问一个 yield 表达式(`yield xx`)。
     * @param node 要访问的节点。
     */
    visitYieldExpression(node: nodes.YieldExpression) {
       node.yieldToken.accept(this);
       node.asteriskToken && node.asteriskToken.accept(this);
       node.operand && node.operand.accept(this);
    }

    /**
     * 访问一个 await 表达式(`await xx`)或标识符。
     * @param node 要访问的节点。
     */
    visitAwaitExpressionOrIdentifier(node: nodes.AwaitExpressionOrIdentifier) {

    }

    /**
     * 访问一个 await 表达式(`await xx`)。
     * @param node 要访问的节点。
     */
    visitAwaitExpression(node: nodes.AwaitExpression) {
       node.awaitToken.accept(this);
       node.operand.accept(this);
    }

    /**
     * 访问一个异步函数表达式或标识符。
     * @param node 要访问的节点。
     */
    visitAsyncFunctionExpressionOrIdentifier(node: nodes.AsyncFunctionExpressionOrIdentifier) {

    }

    /**
     * 访问一个一元运算表达式(`+x`、`typeof x`、...)。
     * @param node 要访问的节点。
     */
    visitUnaryExpression(node: nodes.UnaryExpression) {
       node.operator.accept(this);
       node.operand.accept(this);
    }

    /**
     * 访问一个箭头函数或泛型表达式或标识符(`x => y`、`x<T>`、`x`)。
     * @param node 要访问的节点。
     */
    visitArrowFunctionOrGenericExpressionOrIdentifier(node: nodes.ArrowFunctionOrGenericExpressionOrIdentifier) {

    }

    /**
     * 访问一个泛型表达式(`x<number>`)。
     * @param node 要访问的节点。
     */
    visitGenericExpression(node: nodes.GenericExpression) {
       node.target.accept(this);
       node.typeArguments.accept(this);
    }

    /**
     * 访问一个错误的表达式占位符。
     * @param node 要访问的节点。
     */
    visitMissingExpression(node: nodes.MissingExpression) {

    }

    /**
     * 访问一个函数调用表达式(`x()`)。
     * @param node 要访问的节点。
     */
    visitFunctionCallExpression(node: nodes.FunctionCallExpression) {
       node.target.accept(this);
       node.arguments.accept(this);
    }

    /**
     * 访问一个索引调用表达式(`x[y]`)。
     * @param node 要访问的节点。
     */
    visitIndexCallExpression(node: nodes.IndexCallExpression) {
       node.target.accept(this);
       node.openBracketToken.accept(this);
       node.argument.accept(this);
       node.closeBracketToken.accept(this);
    }

    /**
     * 访问一个条件表达式(`x ? y : z`)。
     * @param node 要访问的节点。
     */
    visitConditionalExpression(node: nodes.ConditionalExpression) {
       node.condition.accept(this);
       node.questionToken.accept(this);
       node.then.accept(this);
       node.colonToken.accept(this);
       node.else.accept(this);
    }

    /**
     * 访问一个后缀表达式(`x++`、`x--`)。
     * @param node 要访问的节点。
     */
    visitPostfixExpression(node: nodes.PostfixExpression) {
       node.operand.accept(this);
       node.operator.accept(this);
    }

    /**
     * 访问一个模板调用表达式(`x\`abc\``)。
     * @param node 要访问的节点。
     */
    visitTemplateCallExpression(node: nodes.TemplateCallExpression) {
       node.target.accept(this);
       node.argument.accept(this);
    }

    /**
     * 访问一个双目表达式(x + y、x = y、...)。
     * @param node 要访问的节点。
     */
    visitBinaryExpression(node: nodes.BinaryExpression) {
       node.left.accept(this);
       node.operator.accept(this);
       node.right.accept(this);
    }

    /**
     * 访问一个函数调用参数列表。
     * @param node 要访问的节点。
     */
    visitArguments(node: nodes.Arguments) {

    }

    /**
     * 访问一个函数调用参数(`x`)。
     * @param node 要访问的节点。
     */
    visitArgument(node: nodes.Argument) {
       node.dotDotDotToken && node.dotDotDotToken.accept(this);
       node.value.accept(this);
    }

    /**
     * 访问一个箭头函数表达式(`x => {...}`、`(x, y) => {...}`)。。
     * @param node 要访问的节点。
     */
    visitArrowFunctionExpression(node: nodes.ArrowFunctionExpression) {
       node.modifiers && node.modifiers.accept(this);
       node.typeParameters && node.typeParameters.accept(this);
       node.parameters && node.parameters.accept(this);
       node.equalsGreaterThanToken.accept(this);
       node.body.accept(this);
    }

    /**
     * 访问一个成员调用表达式(x.y)。
     * @param node 要访问的节点。
     */
    visitMemberCallExpression(node: nodes.MemberCallExpression) {
       node.target.accept(this);
       node.dotToken.accept(this);
       node.argument.accept(this);
    }

    /**
     * 访问一个数字字面量(`1`)。
     * @param node 要访问的节点。
     */
    visitNumericLiteral(node: nodes.NumericLiteral) {
       node.value.accept(this);
    }

    /**
     * 访问一个字符串字面量(`'abc'`、`"abc"`、`\`abc\``)。
     * @param node 要访问的节点。
     */
    visitStringLiteral(node: nodes.StringLiteral) {
       node.value.accept(this);
    }

    /**
     * 访问一个标识符(`x`)。
     * @param node 要访问的节点。
     */
    visitIdentifier(node: nodes.Identifier) {
       node.value && node.value.accept(this);
    }
    // #endregion

    // #region 语句

    /**
     * 访问一个变量声明(`let x`)或表达式语句(`let(x)`)。
     * @param node 要访问的节点。
     */
    visitVariableOrExpressionStatement(node: nodes.VariableOrExpressionStatement) {

    }

    /**
     * 访问一个 if 语句(`if (x) ...`)。
     * @param node 要访问的节点。
     */
    visitIfStatement(node: nodes.IfStatement) {
       node.ifToken.accept(this);
       node.openParenToken && node.openParenToken.accept(this);
       node.condition.accept(this);
       node.closeParenToken && node.closeParenToken.accept(this);
       node.then.accept(this);
       node.elseToken && node.elseToken.accept(this);
       node.else && node.else.accept(this);
    }

    /**
     * 访问一个 for 或 for..in 或 for..of 或 for..to 语句。
     * @param node 要访问的节点。
     */
    visitForOrForInOrForOfOrForToStatement(node: nodes.ForOrForInOrForOfOrForToStatement) {

    }

    /**
     * 访问一个 for..in 语句(`for(var x in y) ...`)。
     * @param node 要访问的节点。
     */
    visitForInStatement(node: nodes.ForInStatement) {
       node.forToken.accept(this);
       node.openParenToken && node.openParenToken.accept(this);
       node.initializer && node.initializer.accept(this);
       node.inToken.accept(this);
       node.condition.accept(this);
       node.closeParenToken && node.closeParenToken.accept(this);
       node.body.accept(this);
    }

    /**
     * 访问一个 for..of 语句(`for(var x of y) ...`)。
     * @param node 要访问的节点。
     */
    visitForOfStatement(node: nodes.ForOfStatement) {
       node.forToken.accept(this);
       node.openParenToken && node.openParenToken.accept(this);
       node.initializer && node.initializer.accept(this);
       node.ofToken.accept(this);
       node.condition.accept(this);
       node.closeParenToken && node.closeParenToken.accept(this);
       node.body.accept(this);
    }

    /**
     * 访问一个 for..to 语句(`for(var x = 0 to 10) ...`)。
     * @param node 要访问的节点。
     */
    visitForToStatement(node: nodes.ForToStatement) {
       node.forToken.accept(this);
       node.openParenToken && node.openParenToken.accept(this);
       node.initializer && node.initializer.accept(this);
       node.toToken.accept(this);
       node.condition.accept(this);
       node.closeParenToken && node.closeParenToken.accept(this);
       node.body.accept(this);
    }

    /**
     * 访问一个 for 语句(`for(var i = 0; i < 9 i++) ...`)。
     * @param node 要访问的节点。
     */
    visitForStatement(node: nodes.ForStatement) {
       node.forToken.accept(this);
       node.openParenToken && node.openParenToken.accept(this);
       node.initializer && node.initializer.accept(this);
       node.firstSemicolon.accept(this);
       node.condition && node.condition.accept(this);
       node.iterator && node.iterator.accept(this);
       node.closeParenToken && node.closeParenToken.accept(this);
       node.body.accept(this);
    }

    /**
     * 访问一个 while 语句(`while(x) ...`)。
     * @param node 要访问的节点。
     */
    visitWhileStatement(node: nodes.WhileStatement) {
       node.whileToken.accept(this);
       node.openParenToken && node.openParenToken.accept(this);
       node.condition.accept(this);
       node.closeParenToken && node.closeParenToken.accept(this);
       node.body.accept(this);
    }

    /**
     * 访问一个 switch 语句(`switch(x) {...}`)。
     * @param node 要访问的节点。
     */
    visitSwitchStatement(node: nodes.SwitchStatement) {
       node.cases.accept(this);
    }

    /**
     * 访问一个 case(`case x: ...`) 或 default(`default: ...`) 分支。
     * @param node 要访问的节点。
     */
    visitCaseOrDefaultClause(node: nodes.CaseOrDefaultClause) {

    }

    /**
     * 访问一个 case 分支(`case x: ...`)。
     * @param node 要访问的节点。
     */
    visitCaseClause(node: nodes.CaseClause) {
       node.caseToken.accept(this);
       node.labels.accept(this);
       node.colonToken.accept(this);
       node.statements.accept(this);
    }

    /**
     * 访问一个 case 分支标签(`case x: ...`)。
     * @param node 要访问的节点。
     */
    visitCaseClauseLabel(node: nodes.CaseClauseLabel) {
       node.elseToken && node.elseToken.accept(this);
       node.label && node.label.accept(this);
    }

    /**
     * 访问一个 default 分支(`default: ...`)。
     * @param node 要访问的节点。
     */
    visitDefaultClause(node: nodes.DefaultClause) {
       node.defaultToken.accept(this);
       node.colonToken.accept(this);
       node.statements.accept(this);
    }

    /**
     * 访问一个 case 段语句。
     * @param node 要访问的节点。
     */
    visitCaseStatement(node: nodes.CaseStatement) {

    }

    /**
     * 访问一个 do..while 语句(`do ... while(x)`)。
     * @param node 要访问的节点。
     */
    visitDoWhileStatement(node: nodes.DoWhileStatement) {
       node.doToken.accept(this);
       node.body.accept(this);
       node.whileToken.accept(this);
       node.openParenToken && node.openParenToken.accept(this);
       node.condition.accept(this);
       node.closeParenToken && node.closeParenToken.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个 break 语句(`break xx`)。
     * @param node 要访问的节点。
     */
    visitBreakStatement(node: nodes.BreakStatement) {
       node.breakToken.accept(this);
       node._.accept(this);
       node.label && node.label.accept(this);
    }

    /**
     * 访问一个 continue 语句(`continue xx`)。
     * @param node 要访问的节点。
     */
    visitContinueStatement(node: nodes.ContinueStatement) {
       node.continueToken.accept(this);
       node._.accept(this);
       node.label && node.label.accept(this);
    }

    /**
     * 访问一个 break 或 continue语句(`break xx;`、`continue xx`)。
     * @param node 要访问的节点。
     */
    visitBreakOrContinueStatement(node: nodes.BreakOrContinueStatement) {
       node._.accept(this);
       node.label && node.label.accept(this);
    }

    /**
     * 访问一个 return 语句(`return x`)。
     * @param node 要访问的节点。
     */
    visitReturnStatement(node: nodes.ReturnStatement) {
       node.returnToken.accept(this);
       node.value && node.value.accept(this);
    }

    /**
     * 访问一个 throw 语句(`throw x`)。
     * @param node 要访问的节点。
     */
    visitThrowStatement(node: nodes.ThrowStatement) {
       node.throwToken.accept(this);
       node.value && node.value.accept(this);
    }

    /**
     * 访问一个 try 语句(`try {...} catch(e) {...}`)。
     * @param node 要访问的节点。
     */
    visitTryStatement(node: nodes.TryStatement) {
       node.tryToken.accept(this);
       node.try.accept(this);
    }

    /**
     * 访问一个 catch 分句(`catch(e) {...}`)。
     * @param node 要访问的节点。
     */
    visitCatchClause(node: nodes.CatchClause) {
       node.catchToken.accept(this);
       node.variable && node.variable.accept(this);
       node.body.accept(this);
    }

    /**
     * 访问一个 finally 分句(`finally {...}`)。
     * @param node 要访问的节点。
     */
    visitFinallyClause(node: nodes.FinallyClause) {
       node.finallyToken.accept(this);
       node.body.accept(this);
    }

    /**
     * 访问一个 debugger 语句(`debugger`)。
     * @param node 要访问的节点。
     */
    visitDebuggerStatement(node: nodes.DebuggerStatement) {
       node.debuggerToken.accept(this);
    }

    /**
     * 访问一个空语句(``)。
     * @param node 要访问的节点。
     */
    visitEmptyStatement(node: nodes.EmptyStatement) {
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个缺少语句。
     * @param node 要访问的节点。
     */
    visitMissingStatement(node: nodes.MissingStatement) {

    }

    /**
     * 访问一个 with 语句(`with (x) ...`)。
     * @param node 要访问的节点。
     */
    visitWithStatement(node: nodes.WithStatement) {
       node.withToken.accept(this);
       node.value.accept(this);
       node.body.accept(this);
    }

    /**
     * 访问一个条件表达式。
     * @param node 要访问的节点。
     */
    visitCondition(node: nodes.Condition) {
       node.openParenToken && node.openParenToken.accept(this);
       node.condition.accept(this);
       node.closeParenToken && node.closeParenToken.accept(this);
    }

    /**
     * 访问一个表达式或标签语句。
     * @param node 要访问的节点。
     */
    visitLabeledOrExpressionStatement(node: nodes.LabeledOrExpressionStatement) {

    }

    /**
     * 访问一个标签语句(`x: ...`)。
     * @param node 要访问的节点。
     */
    visitLabelledStatement(node: nodes.LabelledStatement) {
       node.label.accept(this);
       node.colonToken.accept(this);
       node.statement.accept(this);
    }

    /**
     * 访问一个变量声明语句(`var x`、`let x`、`const x`)。
     * @param node 要访问的节点。
     */
    visitVariableStatement(node: nodes.VariableStatement) {
       node.modifiers && node.modifiers.accept(this);
       node.type.accept(this);
       node.variables.accept(this);
    }

    /**
     * 访问一个变量声明(`x = 1`、`[x] = [1]`、`{a: x} = {a: 1}`)。
     * @param node 要访问的节点。
     */
    visitVariableDeclaration(node: nodes.VariableDeclaration) {
       node.mame.accept(this);
       node.colonToken && node.colonToken.accept(this);
       node.type && node.type.accept(this);
    }

    /**
     * 访问一个表达式语句(`x()`)。
     * @param node 要访问的节点。
     */
    visitExpressionStatement(node: nodes.ExpressionStatement) {
       node.expression.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个语句块(`{...}`)。
     * @param node 要访问的节点。
     */
    visitBlockStatement(node: nodes.BlockStatement) {
       node.statements.accept(this);
    }

    /**
     * 访问一个分号。
     * @param node 要访问的节点。
     */
    visitSemicolon(node: nodes.Semicolon) {
       node.semicolonToken && node.semicolonToken.accept(this);
    }
    // #endregion

    // #region 声明

    /**
     * 访问一个声明或表达式语句。
     * @param node 要访问的节点。
     */
    visitDeclarationOrLabeledOrExpressionStatement(node: nodes.DeclarationOrLabeledOrExpressionStatement) {

    }

    /**
     * 访问一个修饰器列表。
     * @param node 要访问的节点。
     */
    visitDecorators(node: nodes.Decorators) {

    }

    /**
     * 访问一个修饰器(`x`)。
     * @param node 要访问的节点。
     */
    visitDecorator(node: nodes.Decorator) {
       node.atToken.accept(this);
       node.body.accept(this);
    }

    /**
     * 访问一个修饰符列表。
     * @param node 要访问的节点。
     */
    visitModifiers(node: nodes.Modifiers) {

    }

    /**
     * 访问一个修饰符(`static`、`private`、...)。
     * @param node 要访问的节点。
     */
    visitModifier(node: nodes.Modifier) {
       node.type.accept(this);
    }

    /**
     * 访问一个函数声明(`function fn() {...}`、`function *fn() {...}`)。
     * @param node 要访问的节点。
     */
    visitFunctionDeclaration(node: nodes.FunctionDeclaration) {
       node.decorators && node.decorators.accept(this);
       node.modifiers && node.modifiers.accept(this);
    }

    /**
     * 访问一个函数表达式(`function () {}`)。
     * @param node 要访问的节点。
     */
    visitFunctionExpression(node: nodes.FunctionExpression) {
       node.modifiers && node.modifiers.accept(this);
    }

    /**
     * 访问一个函数声明或表达式。
     * @param node 要访问的节点。
     */
    visitFunctionDeclarationOrExpression(node: nodes.FunctionDeclarationOrExpression) {
       node._.accept(this);
       node.modifiers && node.modifiers.accept(this);
       node.functionToken.accept(this);
       node.asteriskToken && node.asteriskToken.accept(this);
       node.name && node.name.accept(this);
       node.colonToken && node.colonToken.accept(this);
       node.type && node.type.accept(this);
       node.typeParameters && node.typeParameters.accept(this);
       node.parameters.accept(this);
       node.body && node.body.accept(this);
       node.equalsGreaterThanToken && node.equalsGreaterThanToken.accept(this);
    }

    /**
     * 访问一个函数签名(`(): number`)。
     * @param node 要访问的节点。
     */
    visitCallSignature(node: nodes.CallSignature) {
       node.typeParameters && node.typeParameters.accept(this);
       node.parameters.accept(this);
       node.colonToken && node.colonToken.accept(this);
       node.type && node.type.accept(this);
    }

    /**
     * 访问一个函数主体(`{...}`、`=> xx`、``)。
     * @param node 要访问的节点。
     */
    visitFunctionBody(node: nodes.FunctionBody) {
       node.body && node.body.accept(this);
       node.equalsGreaterThanToken && node.equalsGreaterThanToken.accept(this);
    }

    /**
     * 访问一个类声明(`class xx {}`)。
     * @param node 要访问的节点。
     */
    visitClassDeclaration(node: nodes.ClassDeclaration) {
       node.decorators && node.decorators.accept(this);
       node.modifiers && node.modifiers.accept(this);
       node._.accept(this);
       node.classToken.accept(this);
       node.name && node.name.accept(this);
       node.typeParameters && node.typeParameters.accept(this);
       node.extendsToken && node.extendsToken.accept(this);
       node.extends && node.extends.accept(this);
       node.implementsToken && node.implementsToken.accept(this);
       node.implements && node.implements.accept(this);
       node.members && node.members.accept(this);
    }

    /**
     * 访问一个类表达式(`class xx {}`)。
     * @param node 要访问的节点。
     */
    visitClassExpression(node: nodes.ClassExpression) {
       node._.accept(this);
       node.classToken.accept(this);
       node.name && node.name.accept(this);
       node.typeParameters && node.typeParameters.accept(this);
       node.extendsToken && node.extendsToken.accept(this);
       node.extends && node.extends.accept(this);
       node.implementsToken && node.implementsToken.accept(this);
       node.implements && node.implements.accept(this);
       node.members && node.members.accept(this);
    }

    /**
     * 访问一个类声明或类表达式。
     * @param node 要访问的节点。
     */
    visitClassDeclarationOrExpression(node: nodes.ClassDeclarationOrExpression) {
       node._.accept(this);
       node.classToken.accept(this);
       node.name && node.name.accept(this);
       node.typeParameters && node.typeParameters.accept(this);
       node.extendsToken && node.extendsToken.accept(this);
       node.extends && node.extends.accept(this);
       node.implementsToken && node.implementsToken.accept(this);
       node.implements && node.implements.accept(this);
       node.members && node.members.accept(this);
    }

    /**
     * 访问一个类主体(`{...}`、``)。
     * @param node 要访问的节点。
     */
    visitClassBody(node: nodes.ClassBody) {
       node.members && node.members.accept(this);
    }

    /**
     * 访问一个访问器声明(`get x() {...}`、`set x(value) {...}`)。
     * @param node 要访问的节点。
     */
    visitAccessorDeclaration(node: nodes.AccessorDeclaration) {
       node.decorators && node.decorators.accept(this);
       node.modifiers && node.modifiers.accept(this);
       node.getToken && node.getToken.accept(this);
       node.setToken && node.setToken.accept(this);
       node.name.accept(this);
       node.colonToken && node.colonToken.accept(this);
       node.type && node.type.accept(this);
       node.body && node.body.accept(this);
       node.equalsGreaterThanToken && node.equalsGreaterThanToken.accept(this);
    }

    /**
     * 访问一个方法声明(`x() {...}`)。
     * @param node 要访问的节点。
     */
    visitMethodDeclaration(node: nodes.MethodDeclaration) {
       node.decorators && node.decorators.accept(this);
       node.modifiers && node.modifiers.accept(this);
       node.asteriskToken && node.asteriskToken.accept(this);
       node.name.accept(this);
       node.typeParameters && node.typeParameters.accept(this);
       node.parameters.accept(this);
       node.colonToken && node.colonToken.accept(this);
       node.type && node.type.accept(this);
       node.body && node.body.accept(this);
       node.equalsGreaterThanToken && node.equalsGreaterThanToken.accept(this);
    }

    /**
     * 访问一个属性声明(`x: number`)。
     * @param node 要访问的节点。
     */
    visitPropertyDeclaration(node: nodes.PropertyDeclaration) {
       node.decorators && node.decorators.accept(this);
       node.modifiers && node.modifiers.accept(this);
       node.name.accept(this);
       node.colonToken && node.colonToken.accept(this);
       node.type && node.type.accept(this);
       node.equalsToken && node.equalsToken.accept(this);
       node.initializer && node.initializer.accept(this);
    }

    /**
     * 访问一个接口声明(`interface T {...}`)。
     * @param node 要访问的节点。
     */
    visitInterfaceDeclaration(node: nodes.InterfaceDeclaration) {
       node.decorators && node.decorators.accept(this);
       node.modifiers && node.modifiers.accept(this);
       node.interfaceToken.accept(this);
       node.name.accept(this);
       node.typeParameters && node.typeParameters.accept(this);
       node.extendsToken && node.extendsToken.accept(this);
       node.extends && node.extends.accept(this);
       node.members.accept(this);
    }

    /**
     * 访问一个枚举声明(`enum T {}`)。
     * @param node 要访问的节点。
     */
    visitEnumDeclaration(node: nodes.EnumDeclaration) {
       node.decorators && node.decorators.accept(this);
       node.modifiers && node.modifiers.accept(this);
       node.enumToken.accept(this);
       node.name.accept(this);
       node.extendsToken && node.extendsToken.accept(this);
       node.extends && node.extends.accept(this);
       node.members.accept(this);
    }

    /**
     * 访问一个枚举成员声明(`x`、`x = 1`)。
     * @param node 要访问的节点。
     */
    visitEnumMemberDeclaration(node: nodes.EnumMemberDeclaration) {
       node.name.accept(this);
       node.equalsToken && node.equalsToken.accept(this);
       node.initializer && node.initializer.accept(this);
    }

    /**
     * 访问一个命名空间声明(`namespace T {}`)。
     * @param node 要访问的节点。
     */
    visitNamespaceDeclaration(node: nodes.NamespaceDeclaration) {
       node.decorators && node.decorators.accept(this);
       node.modifiers && node.modifiers.accept(this);
       node.namespaceToken.accept(this);
    }

    /**
     * 访问一个模块声明(`module T {}`)。
     * @param node 要访问的节点。
     */
    visitModuleDeclaration(node: nodes.ModuleDeclaration) {
       node.decorators && node.decorators.accept(this);
       node.modifiers && node.modifiers.accept(this);
       node.moduleToken.accept(this);
    }

    /**
     * 访问一个命名空间或模块声明。
     * @param node 要访问的节点。
     */
    visitNamespaceOrModuleDeclaration(node: nodes.NamespaceOrModuleDeclaration) {
       node._.accept(this);
       node.decorators && node.decorators.accept(this);
       node.modifiers && node.modifiers.accept(this);
       node.name && node.name.accept(this);
       node.statements.accept(this);
    }

    /**
     * 访问一个扩展声明(`extends T {}`)。
     * @param node 要访问的节点。
     */
    visitExtensionDeclaration(node: nodes.ExtensionDeclaration) {
       node.decorators && node.decorators.accept(this);
       node.modifiers && node.modifiers.accept(this);
       node.extendsToken.accept(this);
       node.type.accept(this);
       node.extends && node.extends.accept(this);
       node.implementsToken && node.implementsToken.accept(this);
       node.implements && node.implements.accept(this);
       node.members && node.members.accept(this);
    }

    /**
     * 访问一个 extends 分句(`extends xx`)。
     * @param node 要访问的节点。
     */
    visitExtendsClause(node: nodes.ExtendsClause) {
       node.extendsToken && node.extendsToken.accept(this);
       node.extends && node.extends.accept(this);
    }

    /**
     * 访问一个 implements 分句(`implements xx`)。
     * @param node 要访问的节点。
     */
    visitImplementsClause(node: nodes.ImplementsClause) {
       node.implementsToken && node.implementsToken.accept(this);
       node.implements && node.implements.accept(this);
    }

    /**
     * 访问一个 extends 或 implements 分句项。
     * @param node 要访问的节点。
     */
    visitClassHeritageNode(node: nodes.ClassHeritageNode) {
       node.value.accept(this);
    }

    /**
     * 访问一个语句块主体(`{...}`)。
     * @param node 要访问的节点。
     */
    visitBlockBody(node: nodes.BlockBody) {
       node.statements.accept(this);
    }

    /**
     * 访问一个类型别名声明(`type A = number`)。
     * @param node 要访问的节点。
     */
    visitTypeAliasDeclaration(node: nodes.TypeAliasDeclaration) {
       node.typeToken.accept(this);
       node.name.accept(this);
       node.typeParameters && node.typeParameters.accept(this);
       node.equalsToken.accept(this);
       node.value.accept(this);
    }

    /**
     * 访问一个 import 赋值或 import 声明。
     * @param node 要访问的节点。
     */
    visitImportAssignmentOrImportDeclaration(node: nodes.ImportAssignmentOrImportDeclaration) {

    }

    /**
     * 访问一个 import 赋值声明。
     * @param node 要访问的节点。
     */
    visitImportAssignmentDeclaration(node: nodes.ImportAssignmentDeclaration) {
       node.importToken.accept(this);
       node.variable.accept(this);
       node.equalsToken.accept(this);
       node.value.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个。
     * @param node 要访问的节点。
     */
    visitImportDeclaration(node: nodes.ImportDeclaration) {
       node.importToken.accept(this);
       node.variables.accept(this);
       node.fromToken && node.fromToken.accept(this);
       node.from.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个命名空间导入分句(`* as x`)。
     * @param node 要访问的节点。
     */
    visitNamespaceImportClause(node: nodes.NamespaceImportClause) {
       node.asteriskToken.accept(this);
       node.asToken.accept(this);
       node.variable.accept(this);
    }

    /**
     * 访问一个对象导入分句(`{x, x as y}`)。
     * @param node 要访问的节点。
     */
    visitNamedImportClause(node: nodes.NamedImportClause) {
       node.elements.accept(this);
    }

    /**
     * 访问一个简单导入或导出分句(`x`、`x as y`)。
     * @param node 要访问的节点。
     */
    visitSimpleImportOrExportClause(node: nodes.SimpleImportOrExportClause) {
       node.asToken && node.asToken.accept(this);
       node.variable && node.variable.accept(this);
    }

    /**
     * 访问一个 export 赋值或 export 声明。
     * @param node 要访问的节点。
     */
    visitExportAssignmentOrExportDeclaration(node: nodes.ExportAssignmentOrExportDeclaration) {

    }

    /**
     * 访问一个导出列表声明(`export * from ...`)。
     * @param node 要访问的节点。
     */
    visitExportNamespaceDeclaration(node: nodes.ExportNamespaceDeclaration) {
       node.exportToken.accept(this);
       node.asteriskToken.accept(this);
       node.fromToken.accept(this);
       node.from.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个导出列表声明(`export a from ...`)。
     * @param node 要访问的节点。
     */
    visitExportListDeclaration(node: nodes.ExportListDeclaration) {
       node.exportToken.accept(this);
       node.variables.accept(this);
       node.fromToken.accept(this);
       node.from.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个导出赋值声明(`export = 1`)。
     * @param node 要访问的节点。
     */
    visitExportAssignmentDeclaration(node: nodes.ExportAssignmentDeclaration) {
       node.exportToken.accept(this);
       node.equalsToken.accept(this);
       node.value.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }

    /**
     * 访问一个 export default 声明(`export default x = 1`)。
     * @param node 要访问的节点。
     */
    visitExportDefaultDeclaration(node: nodes.ExportDefaultDeclaration) {
       node.modifiers.accept(this);
       node.expression.accept(this);
       node.semicolonToken && node.semicolonToken.accept(this);
    }
    // #endregion

}
