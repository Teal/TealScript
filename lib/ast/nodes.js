/**
 * @fileOverview 语法树节点
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var tokenType_1 = require('./tokenType');
var predefinedTypes_1 = require('../resolver/predefinedTypes');
// #region 节点
/**
 * 表示一个语法树节点。
 */
var Node = (function () {
    function Node() {
    }
    /**
     * 搜索指定类型的父节点。
     * @param nodeType 要查找的父类型。
     */
    Node.prototype.findParent = function (nodeType) {
        var p = this.parent;
        while (p) {
            if (p.constructor === nodeType) {
                return p;
            }
            p = p.parent;
        }
    };
    Object.defineProperty(Node.prototype, "module", {
        /**
         * 获取当前节点的父模块。
         * @returns 返回模块。
         */
        get: function () { return this.findParent(Module); },
        enumerable: true,
        configurable: true
    });
    /**
     * 对当前节点进行转换。
     */
    Node.prototype.resolve = function (context) { };
    // #endregion
    // #region 转换
    // #endregion
    // #region 生成
    /**
     * 输出当前节点。
     */
    Node.prototype.emit = function (context) { };
    return Node;
}());
exports.Node = Node;
/**
 * 表示一个变量。
 */
var Variable = (function (_super) {
    __extends(Variable, _super);
    function Variable() {
        _super.apply(this, arguments);
    }
    return Variable;
}(Node));
exports.Variable = Variable;
/**
 * 对变量类型的枚举。
 */
var VariableType;
(function (VariableType) {
    /**
     * 表示这是一个普通变量。
     */
    VariableType[VariableType["normalLocal"] = 0] = "normalLocal";
    /**
     * 表示这是一个常量。
     */
    VariableType[VariableType["constLocal"] = 1] = "constLocal";
    /**
     * 表示这是一个静态变量。
     */
    VariableType[VariableType["staticLocal"] = 2] = "staticLocal";
    /**
     * 表示这是一个静态最终变量。
     */
    VariableType[VariableType["finalLocal"] = 3] = "finalLocal";
    /**
     * 表示这是一个寄存变量。
     */
    VariableType[VariableType["externLocal"] = 4] = "externLocal";
    /**
     * 表示这是一个易变变量。
     */
    VariableType[VariableType["volatileLocal"] = 5] = "volatileLocal";
    /**
     * 表示这是一个外部变量。
     */
    VariableType[VariableType["outLocal"] = 6] = "outLocal";
    /**
     * 表示这是一个引用变量。
     */
    VariableType[VariableType["refLocal"] = 7] = "refLocal";
    /**
     * 标记为变量。
     */
    VariableType[VariableType["PARAMETER"] = 8] = "PARAMETER";
    /**
     * 表示这是一个输入参数。
     */
    VariableType[VariableType["inParameter"] = 9] = "inParameter";
    /**
     * 表示这是一个输出参数。
     */
    VariableType[VariableType["outParameter"] = 10] = "outParameter";
    /**
     * 表示这是一个引用参数。
     */
    VariableType[VariableType["refParameter"] = 11] = "refParameter";
    /**
     * 表示这是一个可变参数。
     */
    VariableType[VariableType["paramsParameter"] = 12] = "paramsParameter";
    /**
     * 表示这是一个参数列表。
     */
    VariableType[VariableType["argListParameter"] = 13] = "argListParameter";
})(VariableType || (VariableType = {}));
/**
 * 表示一个模块(即一个源文件)。
 */
var Module = (function (_super) {
    __extends(Module, _super);
    function Module() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(Module.prototype, "start", {
        // #region 节点
        // #endregion
        // #region 位置
        /**
         * 获取当前节点的开始位置。如果当前节点是生成的则返回 undefined。
         */
        get: function () { return 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Module.prototype, "end", {
        /**
         * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
         */
        get: function () { return this.text.length; },
        enumerable: true,
        configurable: true
    });
    return Module;
}(Node));
exports.Module = Module;
// #endregion
// #region 语句
/**
 * 表示一个语句。
 */
var Statement = (function (_super) {
    __extends(Statement, _super);
    function Statement() {
        _super.apply(this, arguments);
    }
    return Statement;
}(Node));
exports.Statement = Statement;
/**
 * 表示一个空语句(;)。
 */
var EmptyStatement = (function (_super) {
    __extends(EmptyStatement, _super);
    function EmptyStatement() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(EmptyStatement.prototype, "end", {
        // #region 节点
        // #endregion
        // #region 位置
        // #endregion
        // #region 分析
        // #endregion
        // #region 转换
        // #endregion
        // #region 生成
        // #endregion
        // #region 位置
        /**
         * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
         */
        get: function () { return this.start + 1; },
        enumerable: true,
        configurable: true
    });
    return EmptyStatement;
}(Statement));
exports.EmptyStatement = EmptyStatement;
/**
 * 表示一个语句块({...})。
 */
var Block = (function (_super) {
    __extends(Block, _super);
    function Block() {
        _super.apply(this, arguments);
    }
    return Block;
}(Statement));
exports.Block = Block;
/**
 * 表示一个变量声明语句(var xx = ...)。
 */
var VariableStatement = (function (_super) {
    __extends(VariableStatement, _super);
    function VariableStatement() {
        _super.apply(this, arguments);
    }
    return VariableStatement;
}(Statement));
exports.VariableStatement = VariableStatement;
/**
 * 表示一个标签语句。
 */
var LabeledStatement = (function (_super) {
    __extends(LabeledStatement, _super);
    function LabeledStatement() {
        _super.apply(this, arguments);
    }
    return LabeledStatement;
}(Statement));
exports.LabeledStatement = LabeledStatement;
/**
 * 表示一个表达式语句。
 */
var ExpressionStatement = (function (_super) {
    __extends(ExpressionStatement, _super);
    function ExpressionStatement() {
        _super.apply(this, arguments);
    }
    return ExpressionStatement;
}(Statement));
exports.ExpressionStatement = ExpressionStatement;
/**
 * 表示一个 if 语句。
 */
var IfStatement = (function (_super) {
    __extends(IfStatement, _super);
    function IfStatement() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(IfStatement.prototype, "end", {
        /**
         * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
         */
        get: function () { return (this.elseClause || this.thenClause).end; },
        enumerable: true,
        configurable: true
    });
    return IfStatement;
}(Statement));
exports.IfStatement = IfStatement;
/**
 * 表示一个 switch 语句。
 */
var SwitchStatement = (function (_super) {
    __extends(SwitchStatement, _super);
    function SwitchStatement() {
        _super.apply(this, arguments);
    }
    return SwitchStatement;
}(Statement));
exports.SwitchStatement = SwitchStatement;
/**
 * 表示一个 for 语句。
 */
var ForStatement = (function (_super) {
    __extends(ForStatement, _super);
    function ForStatement() {
        _super.apply(this, arguments);
    }
    return ForStatement;
}(Statement));
exports.ForStatement = ForStatement;
/**
 * 表示一个 for in 语句。
 */
var ForInStatement = (function (_super) {
    __extends(ForInStatement, _super);
    function ForInStatement() {
        _super.apply(this, arguments);
    }
    return ForInStatement;
}(Statement));
exports.ForInStatement = ForInStatement;
/**
 * 表示一个 for of 语句。
 */
var ForOfStatement = (function (_super) {
    __extends(ForOfStatement, _super);
    function ForOfStatement() {
        _super.apply(this, arguments);
    }
    return ForOfStatement;
}(Statement));
exports.ForOfStatement = ForOfStatement;
/**
 * 表示一个 while 语句。
 */
var WhileStatement = (function (_super) {
    __extends(WhileStatement, _super);
    function WhileStatement() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(WhileStatement.prototype, "end", {
        /**
         * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
         */
        get: function () { return this.body.end; },
        enumerable: true,
        configurable: true
    });
    return WhileStatement;
}(Statement));
exports.WhileStatement = WhileStatement;
/**
 * 表示一个 do while 语句。
 */
var DoWhileStatement = (function (_super) {
    __extends(DoWhileStatement, _super);
    function DoWhileStatement() {
        _super.apply(this, arguments);
    }
    return DoWhileStatement;
}(Statement));
exports.DoWhileStatement = DoWhileStatement;
/**
 * 表示一个 continue 语句。
 */
var ContinueStatement = (function (_super) {
    __extends(ContinueStatement, _super);
    function ContinueStatement() {
        _super.apply(this, arguments);
    }
    return ContinueStatement;
}(Statement));
exports.ContinueStatement = ContinueStatement;
/**
 * 表示一个 break 语句。
 */
var BreakStatement = (function (_super) {
    __extends(BreakStatement, _super);
    function BreakStatement() {
        _super.apply(this, arguments);
    }
    return BreakStatement;
}(Statement));
exports.BreakStatement = BreakStatement;
/**
 * 表示一个 return 语句。
 */
var ReturnStatement = (function (_super) {
    __extends(ReturnStatement, _super);
    function ReturnStatement() {
        _super.apply(this, arguments);
    }
    return ReturnStatement;
}(Statement));
exports.ReturnStatement = ReturnStatement;
/**
 * 表示一个 throw 语句。
 */
var ThrowStatement = (function (_super) {
    __extends(ThrowStatement, _super);
    function ThrowStatement() {
        _super.apply(this, arguments);
    }
    return ThrowStatement;
}(Statement));
exports.ThrowStatement = ThrowStatement;
/**
 * 表示一个 try 语句。
 */
var TryStatement = (function (_super) {
    __extends(TryStatement, _super);
    function TryStatement() {
        _super.apply(this, arguments);
    }
    return TryStatement;
}(Statement));
exports.TryStatement = TryStatement;
/**
 * 表示一个 with 语句。
 */
var WithStatement = (function (_super) {
    __extends(WithStatement, _super);
    function WithStatement() {
        _super.apply(this, arguments);
    }
    return WithStatement;
}(Statement));
exports.WithStatement = WithStatement;
// #endregion
// #region 表达式
/**
 * 表示一个表达式。
 */
var Expression = (function (_super) {
    __extends(Expression, _super);
    function Expression() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(Expression.prototype, "statement", {
        /**
         * 获取当前节点的父模块。
         * @returns 返回模块。
         */
        get: function () { return this.findParent(Statement); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Expression.prototype, "isConstant", {
        /**
         * 判断当前表达式是否是常量值。
         */
        get: function () { return 'constantValue' in this; },
        enumerable: true,
        configurable: true
    });
    return Expression;
}(Node));
exports.Expression = Expression;
/**
 * 表示一个标识符。
 */
var Identifier = (function (_super) {
    __extends(Identifier, _super);
    function Identifier() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(Identifier.prototype, "value", {
        /**
         * 获取当前标识符的内容。
         */
        get: function () {
            if (this._value == undefined) {
                return this.module.text.substring(this.start, this.end);
            }
            return this._value;
        },
        /**
         * 设置当前标识符的内容。
         */
        set: function (value) {
            this._value = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Identifier.prototype, "resolvedType", {
        /**
         * 获取当前表达式的返回类型。如果分析错误，则返回 undefined。
         */
        get: function () {
            if (!this.parent)
                return undefined;
            // 标识符的使用场景有：
            switch (this.parent.constructor) {
                case LabeledStatement:
                    return undefined;
            }
        },
        enumerable: true,
        configurable: true
    });
    return Identifier;
}(Expression));
exports.Identifier = Identifier;
/**
 * 表示内置类型字面量。
 */
var PredefinedTypeLiteral = (function (_super) {
    __extends(PredefinedTypeLiteral, _super);
    function PredefinedTypeLiteral() {
        _super.apply(this, arguments);
    }
    return PredefinedTypeLiteral;
}(Expression));
exports.PredefinedTypeLiteral = PredefinedTypeLiteral;
/**
 * 表示 null 常量。
 */
var NullLiteral = (function (_super) {
    __extends(NullLiteral, _super);
    function NullLiteral() {
        _super.apply(this, arguments);
    }
    return NullLiteral;
}(Expression));
exports.NullLiteral = NullLiteral;
/**
 * 表示 true 常量。
 */
var TrueLiteral = (function (_super) {
    __extends(TrueLiteral, _super);
    function TrueLiteral() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(TrueLiteral.prototype, "resolvedType", {
        // #region 节点
        // #endregion
        // #region 位置
        // #endregion
        // #region 分析
        // #endregion
        // #region 转换
        // #endregion
        // #region 生成
        // #endregion
        // #region 转换
        /**
         * 获取当前表达式的返回类型。如果分析错误，则返回 undefined。
         */
        get: function () { return predefinedTypes_1.getPredefinedType("boolean"); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TrueLiteral.prototype, "constantValue", {
        /**
         * 如果当前表达式是常量则返回其值。
         */
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    return TrueLiteral;
}(Expression));
exports.TrueLiteral = TrueLiteral;
/**
 * 表示 false 常量。
 */
var FalseLiteral = (function (_super) {
    __extends(FalseLiteral, _super);
    function FalseLiteral() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(FalseLiteral.prototype, "resolvedType", {
        // #region 节点
        // #endregion
        // #region 位置
        // #endregion
        // #region 分析
        // #endregion
        // #region 转换
        // #endregion
        // #region 生成
        // #endregion
        // #region 转换
        /**
         * 获取当前表达式的返回类型。如果分析错误，则返回 undefined。
         */
        get: function () { return predefinedTypes_1.getPredefinedType("boolean"); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FalseLiteral.prototype, "constantValue", {
        /**
         * 如果当前表达式是常量则返回其值。
         */
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    return FalseLiteral;
}(Expression));
exports.FalseLiteral = FalseLiteral;
/**
 * 表示一个浮点数常量。
 */
var NumericLiteral = (function (_super) {
    __extends(NumericLiteral, _super);
    function NumericLiteral() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(NumericLiteral.prototype, "value", {
        /**
         * 获取当前标识符的内容。
         */
        get: function () {
            if (this._value == undefined) {
            }
            return this._value;
        },
        /**
         * 设置当前标识符的内容。
         */
        set: function (value) {
            this._value = value;
        },
        enumerable: true,
        configurable: true
    });
    return NumericLiteral;
}(Expression));
exports.NumericLiteral = NumericLiteral;
/**
 * 表示一个字符串常量。
 */
var StringLiteral = (function (_super) {
    __extends(StringLiteral, _super);
    function StringLiteral() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(StringLiteral.prototype, "value", {
        /**
         * 获取当前标识符的内容。
         */
        get: function () {
            if (this._value == undefined) {
                return this.module.text.substring(this.start, this.end);
            }
            return this._value;
        },
        /**
         * 设置当前标识符的内容。
         */
        set: function (value) {
            this._value = value;
        },
        enumerable: true,
        configurable: true
    });
    return StringLiteral;
}(Expression));
exports.StringLiteral = StringLiteral;
/**
 * 表示一个列表字面量。
 */
var ArrayLiteral = (function (_super) {
    __extends(ArrayLiteral, _super);
    function ArrayLiteral() {
        _super.apply(this, arguments);
    }
    return ArrayLiteral;
}(Expression));
exports.ArrayLiteral = ArrayLiteral;
/**
 * 表示一个字典字面量。
 */
var ObjectLiteral = (function (_super) {
    __extends(ObjectLiteral, _super);
    function ObjectLiteral() {
        _super.apply(this, arguments);
    }
    return ObjectLiteral;
}(Expression));
exports.ObjectLiteral = ObjectLiteral;
/**
 * 表示 this 常量。
 */
var ThisLiteral = (function (_super) {
    __extends(ThisLiteral, _super);
    function ThisLiteral() {
        _super.apply(this, arguments);
    }
    return ThisLiteral;
}(Expression));
exports.ThisLiteral = ThisLiteral;
/**
 * 表示 super 常量。
 */
var SuperLiteral = (function (_super) {
    __extends(SuperLiteral, _super);
    function SuperLiteral() {
        _super.apply(this, arguments);
    }
    return SuperLiteral;
}(Expression));
exports.SuperLiteral = SuperLiteral;
/**
 * 表示一个函数表达式。
 */
var LambdaLiteral = (function (_super) {
    __extends(LambdaLiteral, _super);
    function LambdaLiteral() {
        _super.apply(this, arguments);
    }
    return LambdaLiteral;
}(Expression));
exports.LambdaLiteral = LambdaLiteral;
/**
 * 表示一个括号表达式。
 */
var ParenthesizedExpression = (function (_super) {
    __extends(ParenthesizedExpression, _super);
    function ParenthesizedExpression() {
        _super.apply(this, arguments);
    }
    return ParenthesizedExpression;
}(Expression));
exports.ParenthesizedExpression = ParenthesizedExpression;
/**
 * 表示一组逗号隔开的表达式。
 */
var CommaExpression = (function (_super) {
    __extends(CommaExpression, _super);
    function CommaExpression() {
        _super.apply(this, arguments);
    }
    return CommaExpression;
}(Expression));
exports.CommaExpression = CommaExpression;
/**
 * 表示一个 yield 表达式。
 */
var YieldExpression = (function (_super) {
    __extends(YieldExpression, _super);
    function YieldExpression() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(YieldExpression.prototype, "end", {
        /**
         * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
         */
        get: function () { return this.value ? this.value.end : this.start + 5; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(YieldExpression.prototype, "asterisk", {
        get: function () { return this.asteriskStart != undefined; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(YieldExpression.prototype, "asteriskEnd", {
        get: function () { return this.asteriskStart != undefined ? this.asteriskStart + 1 : undefined; },
        enumerable: true,
        configurable: true
    });
    ;
    return YieldExpression;
}(Statement));
exports.YieldExpression = YieldExpression;
/**
 * 表示一个三元条件表达式。
 */
var ConditionalExpression = (function (_super) {
    __extends(ConditionalExpression, _super);
    function ConditionalExpression() {
        _super.apply(this, arguments);
    }
    return ConditionalExpression;
}(Expression));
exports.ConditionalExpression = ConditionalExpression;
/**
 * 表示一个类型分析表达式。
 */
var CastExpression = (function (_super) {
    __extends(CastExpression, _super);
    function CastExpression() {
        _super.apply(this, arguments);
    }
    return CastExpression;
}(Expression));
exports.CastExpression = CastExpression;
/**
 * 表示一个泛型表达式。
 */
var GenericTypeExpression = (function (_super) {
    __extends(GenericTypeExpression, _super);
    function GenericTypeExpression() {
        _super.apply(this, arguments);
    }
    return GenericTypeExpression;
}(Expression));
exports.GenericTypeExpression = GenericTypeExpression;
/**
 * 表示一个数组类型表达式。
 */
var ArrayTypeExpression = (function (_super) {
    __extends(ArrayTypeExpression, _super);
    function ArrayTypeExpression() {
        _super.apply(this, arguments);
    }
    return ArrayTypeExpression;
}(Expression));
exports.ArrayTypeExpression = ArrayTypeExpression;
/**
 * 表示一个成员调用表达式。
 */
var MemberCallExpression = (function (_super) {
    __extends(MemberCallExpression, _super);
    function MemberCallExpression() {
        _super.apply(this, arguments);
    }
    return MemberCallExpression;
}(Expression));
exports.MemberCallExpression = MemberCallExpression;
/**
 * 表示一个函数调用表达式。
 */
var FuncCallExpression = (function (_super) {
    __extends(FuncCallExpression, _super);
    function FuncCallExpression() {
        _super.apply(this, arguments);
    }
    return FuncCallExpression;
}(Expression));
exports.FuncCallExpression = FuncCallExpression;
/**
 * 表示一个 new 表达式。
 */
var NewExpression = (function (_super) {
    __extends(NewExpression, _super);
    function NewExpression() {
        _super.apply(this, arguments);
    }
    return NewExpression;
}(FuncCallExpression));
exports.NewExpression = NewExpression;
/**
 * 表示一个索引调用表达式。
 */
var IndexCallExpression = (function (_super) {
    __extends(IndexCallExpression, _super);
    function IndexCallExpression() {
        _super.apply(this, arguments);
    }
    return IndexCallExpression;
}(FuncCallExpression));
exports.IndexCallExpression = IndexCallExpression;
/**
 * 表示一个链式成员访问表达式。
 */
var ChainCallExpression = (function (_super) {
    __extends(ChainCallExpression, _super);
    function ChainCallExpression() {
        _super.apply(this, arguments);
    }
    return ChainCallExpression;
}(MemberCallExpression));
exports.ChainCallExpression = ChainCallExpression;
/**
 * 表示一个一元运算表达式。
 */
var UnaryExpression = (function (_super) {
    __extends(UnaryExpression, _super);
    function UnaryExpression() {
        _super.apply(this, arguments);
    }
    return UnaryExpression;
}(Expression));
exports.UnaryExpression = UnaryExpression;
/**
 * 表示一个 typeof 或 sizeof 表达式。
 */
var TypeOrSizeOfExpression = (function (_super) {
    __extends(TypeOrSizeOfExpression, _super);
    function TypeOrSizeOfExpression() {
        _super.apply(this, arguments);
    }
    return TypeOrSizeOfExpression;
}(Expression));
exports.TypeOrSizeOfExpression = TypeOrSizeOfExpression;
/**
 * 表示一个 typeof 表达式。
 */
var TypeOfExpression = (function (_super) {
    __extends(TypeOfExpression, _super);
    function TypeOfExpression() {
        _super.apply(this, arguments);
    }
    return TypeOfExpression;
}(TypeOrSizeOfExpression));
exports.TypeOfExpression = TypeOfExpression;
/**
 * 表示一个 ++ 或 -- 运算表达式。
 */
var MutatorExpression = (function (_super) {
    __extends(MutatorExpression, _super);
    function MutatorExpression() {
        _super.apply(this, arguments);
    }
    return MutatorExpression;
}(UnaryExpression));
exports.MutatorExpression = MutatorExpression;
/**
 * 表示一个二元运算表达式。
 */
var BinaryExpression = (function (_super) {
    __extends(BinaryExpression, _super);
    function BinaryExpression() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(BinaryExpression.prototype, "operatorEnd", {
        /**
         * 获取运算符的结束位置。如果当前节点是生成的则返回 undefined。
         */
        get: function () { return this.operatorStart + tokenType_1.tokenToString(this.operator).length; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BinaryExpression.prototype, "start", {
        /**
         * 获取当前节点的开始位置。如果当前节点是生成的则返回 undefined。
         */
        get: function () { return this.leftOperand.start; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BinaryExpression.prototype, "end", {
        /**
         * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
         */
        get: function () { return this.rightOperand.end; },
        enumerable: true,
        configurable: true
    });
    return BinaryExpression;
}(Expression));
exports.BinaryExpression = BinaryExpression;
/**
 * 表示一个 is 或 as 表达式。
 */
var IsOrAsExpression = (function (_super) {
    __extends(IsOrAsExpression, _super);
    function IsOrAsExpression() {
        _super.apply(this, arguments);
    }
    return IsOrAsExpression;
}(Expression));
exports.IsOrAsExpression = IsOrAsExpression;
/**
 * 表示一个 instanceof 表达式。
 */
var InstanceofExpression = (function (_super) {
    __extends(InstanceofExpression, _super);
    function InstanceofExpression() {
        _super.apply(this, arguments);
    }
    return InstanceofExpression;
}(IsOrAsExpression));
exports.InstanceofExpression = InstanceofExpression;
/**
 * 表示一个 as 表达式。
 */
var AsExpression = (function (_super) {
    __extends(AsExpression, _super);
    function AsExpression() {
        _super.apply(this, arguments);
    }
    return AsExpression;
}(IsOrAsExpression));
exports.AsExpression = AsExpression;
// #endregion
// #region 成员
/**
 * 表示一个成员（如方法、字段、类、模块等）定义。
 */
var MemberDefinition = (function (_super) {
    __extends(MemberDefinition, _super);
    function MemberDefinition() {
        _super.apply(this, arguments);
    }
    return MemberDefinition;
}(Node));
exports.MemberDefinition = MemberDefinition;
/**
 * 表示成员修饰符的枚举。
 */
(function (Modifiers) {
    /**
     * 无修饰符。
     */
    Modifiers[Modifiers["none"] = 0] = "none";
    /**
     * 表示静态的成员。
     */
    Modifiers[Modifiers["static"] = 1] = "static";
    /**
     * 表示最终的成员。标记当前类不可被继承、函数不可被重写、字段不可被改变。
     */
    Modifiers[Modifiers["final"] = 4] = "final";
    /**
     * 表示覆盖的成员。
     */
    Modifiers[Modifiers["new"] = 8] = "new";
    /**
     * 表示抽象的成员。
     */
    Modifiers[Modifiers["abstract"] = 16] = "abstract";
    /**
     * 表示虚成员。
     */
    Modifiers[Modifiers["virtual"] = 32] = "virtual";
    /**
     * 表示重写的成员。
     */
    Modifiers[Modifiers["override"] = 64] = "override";
    /**
     * 表示外部的成员。
     */
    Modifiers[Modifiers["declare"] = 128] = "declare";
    /**
     * 表示公开的成员。
     */
    Modifiers[Modifiers["public"] = 512] = "public";
    /**
     * 表示保护的成员。
     */
    Modifiers[Modifiers["protected"] = 1024] = "protected";
    /**
     * 表示私有的成员。
     */
    Modifiers[Modifiers["private"] = 2048] = "private";
    /**
     * 表示访问修饰符。
     */
    Modifiers[Modifiers["accessibility"] = 3584] = "accessibility";
})(exports.Modifiers || (exports.Modifiers = {}));
var Modifiers = exports.Modifiers;
/**
 * 表示一个函数参数。
 */
var Parameter = (function (_super) {
    __extends(Parameter, _super);
    function Parameter() {
        _super.apply(this, arguments);
    }
    return Parameter;
}(Variable));
exports.Parameter = Parameter;
/**
 * 表示一个泛型参数。
 */
var GenericParameter = (function (_super) {
    __extends(GenericParameter, _super);
    function GenericParameter() {
        _super.apply(this, arguments);
    }
    return GenericParameter;
}(Node));
exports.GenericParameter = GenericParameter;
/**
 * 表示一个可以保存子成员的容器成员定义。
 */
var MemberContainerDefinition = (function (_super) {
    __extends(MemberContainerDefinition, _super);
    function MemberContainerDefinition() {
        _super.apply(this, arguments);
    }
    return MemberContainerDefinition;
}(MemberDefinition));
exports.MemberContainerDefinition = MemberContainerDefinition;
/**
 * 表示一个类型（如类、结构、接口）定义。
 */
var TypeDefinition = (function (_super) {
    __extends(TypeDefinition, _super);
    function TypeDefinition() {
        _super.apply(this, arguments);
    }
    return TypeDefinition;
}(MemberContainerDefinition));
exports.TypeDefinition = TypeDefinition;
/**
 * 表示一个类定义。
 */
var ClassDefinition = (function (_super) {
    __extends(ClassDefinition, _super);
    function ClassDefinition() {
        _super.apply(this, arguments);
    }
    return ClassDefinition;
}(TypeDefinition));
exports.ClassDefinition = ClassDefinition;
/**
 * 表示一个结构定义。
 */
var StructDefinition = (function (_super) {
    __extends(StructDefinition, _super);
    function StructDefinition() {
        _super.apply(this, arguments);
    }
    return StructDefinition;
}(TypeDefinition));
exports.StructDefinition = StructDefinition;
/**
 * 表示一个接口定义。
 */
var InterfaceDefinition = (function (_super) {
    __extends(InterfaceDefinition, _super);
    function InterfaceDefinition() {
        _super.apply(this, arguments);
    }
    return InterfaceDefinition;
}(TypeDefinition));
exports.InterfaceDefinition = InterfaceDefinition;
/**
 * 表示一个枚举定义。
 */
var EnumDefinition = (function (_super) {
    __extends(EnumDefinition, _super);
    function EnumDefinition() {
        _super.apply(this, arguments);
    }
    return EnumDefinition;
}(TypeDefinition));
exports.EnumDefinition = EnumDefinition;
/**
 * 表示一个扩展定义。
 */
var ExtensionDefinition = (function (_super) {
    __extends(ExtensionDefinition, _super);
    function ExtensionDefinition() {
        _super.apply(this, arguments);
    }
    return ExtensionDefinition;
}(MemberContainerDefinition));
exports.ExtensionDefinition = ExtensionDefinition;
/**
 * 表示一个命名空间定义。
 */
var NamespaceDefinition = (function (_super) {
    __extends(NamespaceDefinition, _super);
    function NamespaceDefinition() {
        _super.apply(this, arguments);
    }
    return NamespaceDefinition;
}(MemberContainerDefinition));
exports.NamespaceDefinition = NamespaceDefinition;
/**
 * 表示一个 import 指令。
 */
var ImportDirective = (function (_super) {
    __extends(ImportDirective, _super);
    function ImportDirective() {
        _super.apply(this, arguments);
    }
    return ImportDirective;
}(Node));
exports.ImportDirective = ImportDirective;
/**
 * 表示一个模块。
 */
var ModuleDefinition = (function (_super) {
    __extends(ModuleDefinition, _super);
    function ModuleDefinition() {
        _super.apply(this, arguments);
    }
    return ModuleDefinition;
}(MemberContainerDefinition));
exports.ModuleDefinition = ModuleDefinition;
/**
 * 表示一个类型子成员定义。
 */
var TypeMemberDefinition = (function (_super) {
    __extends(TypeMemberDefinition, _super);
    function TypeMemberDefinition() {
        _super.apply(this, arguments);
    }
    return TypeMemberDefinition;
}(MemberDefinition));
exports.TypeMemberDefinition = TypeMemberDefinition;
/**
 * 表示一个字段定义。
 */
var FieldDefinition = (function (_super) {
    __extends(FieldDefinition, _super);
    function FieldDefinition() {
        _super.apply(this, arguments);
    }
    return FieldDefinition;
}(TypeMemberDefinition));
exports.FieldDefinition = FieldDefinition;
/**
 * 表示一个方法或属性定义。
 */
var MethodOrPropertyDefinition = (function (_super) {
    __extends(MethodOrPropertyDefinition, _super);
    function MethodOrPropertyDefinition() {
        _super.apply(this, arguments);
    }
    return MethodOrPropertyDefinition;
}(TypeMemberDefinition));
exports.MethodOrPropertyDefinition = MethodOrPropertyDefinition;
/**
 * 表示一个属性或索引器定义。
 */
var PropertyOrIndexerDefinition = (function (_super) {
    __extends(PropertyOrIndexerDefinition, _super);
    function PropertyOrIndexerDefinition() {
        _super.apply(this, arguments);
    }
    return PropertyOrIndexerDefinition;
}(MethodOrPropertyDefinition));
exports.PropertyOrIndexerDefinition = PropertyOrIndexerDefinition;
/**
 * 表示一个属性定义。
 */
var PropertyDefinition = (function (_super) {
    __extends(PropertyDefinition, _super);
    function PropertyDefinition() {
        _super.apply(this, arguments);
    }
    return PropertyDefinition;
}(MemberDefinition));
exports.PropertyDefinition = PropertyDefinition;
/**
 * 表示一个索引器定义。
 */
var IndexerDefinition = (function (_super) {
    __extends(IndexerDefinition, _super);
    function IndexerDefinition() {
        _super.apply(this, arguments);
    }
    return IndexerDefinition;
}(PropertyOrIndexerDefinition));
exports.IndexerDefinition = IndexerDefinition;
/**
 * 表示一个方法或构造函数定义。
 */
var MethodOrConstructorDefinition = (function (_super) {
    __extends(MethodOrConstructorDefinition, _super);
    function MethodOrConstructorDefinition() {
        _super.apply(this, arguments);
    }
    return MethodOrConstructorDefinition;
}(MethodOrPropertyDefinition));
exports.MethodOrConstructorDefinition = MethodOrConstructorDefinition;
/**
 * 表示一个方法定义。
 */
var MethodDefinition = (function (_super) {
    __extends(MethodDefinition, _super);
    function MethodDefinition() {
        _super.apply(this, arguments);
    }
    return MethodDefinition;
}(MethodOrConstructorDefinition));
exports.MethodDefinition = MethodDefinition;
/**
 * 表示一个构造函数定义。
 */
var ConstructorDefinition = (function (_super) {
    __extends(ConstructorDefinition, _super);
    function ConstructorDefinition() {
        _super.apply(this, arguments);
    }
    return ConstructorDefinition;
}(MethodOrConstructorDefinition));
exports.ConstructorDefinition = ConstructorDefinition;
/**
 * 表示一个枚举的成员定义。
 */
var EnumMemberDefinition = (function (_super) {
    __extends(EnumMemberDefinition, _super);
    function EnumMemberDefinition() {
        _super.apply(this, arguments);
    }
    return EnumMemberDefinition;
}(TypeMemberDefinition));
exports.EnumMemberDefinition = EnumMemberDefinition;
// #endregion
// #region 注释
/**
 * 标识一个 JS 文档注释。
 */
var JsDocComment = (function (_super) {
    __extends(JsDocComment, _super);
    function JsDocComment() {
        _super.apply(this, arguments);
    }
    return JsDocComment;
}(Node));
exports.JsDocComment = JsDocComment;
// #endregion
//# sourceMappingURL=nodes.js.map