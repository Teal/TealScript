/**
 * @fileOverview 语法树节点
 * @generated $ tpack gen
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * 表示一个语法树节点。
 */
var Node = (function () {
    function Node() {
    }
    return Node;
}());
exports.Node = Node;
/**
 * 表示一个源文件。
 */
var SourceFile = (function (_super) {
    __extends(SourceFile, _super);
    function SourceFile() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    SourceFile.prototype.accept = function (vistior) {
        return vistior.visitSourceFile(this);
    };
    return SourceFile;
}(Node));
exports.SourceFile = SourceFile;
/**
 * 表示一个逗号隔开的节点列表(<..., ...>。
 */
var NodeList = (function (_super) {
    __extends(NodeList, _super);
    function NodeList() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(NodeList.prototype, "seperatorEnds", {
        /**
         * 获取当前节点的分割标记的所有结束位置。
         */
        get: function () { return this.seperatorStarts.map(function (p) { return p + 1; }); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NodeList.prototype, "hasTrailingComma", {
        /**
         * 判断当前列表是否包含尾随的数组。
         */
        get: function () { return this.seperators.length === this.length; },
        enumerable: true,
        configurable: true
    });
    return NodeList;
}(Array));
exports.NodeList = NodeList;
/**
 * 表示一个语句。
 */
var Statement = (function (_super) {
    __extends(Statement, _super);
    function Statement() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(Statement.prototype, "hasSemicolon", {
        /**
         * 判断当前语句是否以分号结尾。
         */
        get: function () { return false; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    Statement.prototype.accept = function (vistior) {
        return vistior.visitStatement(this);
    };
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
        /**
         * undefined
         */
        get: function () { return this.start + 1; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EmptyStatement.prototype, "hasSemicolon", {
        /**
         * 判断当前语句是否以分号结尾。
         */
        get: function () { return true; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    EmptyStatement.prototype.accept = function (vistior) {
        return vistior.visitEmptyStatement(this);
    };
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
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    Block.prototype.accept = function (vistior) {
        return vistior.visitBlock(this);
    };
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
    Object.defineProperty(VariableStatement.prototype, "hasSemicolon", {
        /**
         * 判断当前语句是否以分号结尾。
         */
        get: function () { return this.end > this.variables[this.variables.length - 1].end; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    VariableStatement.prototype.accept = function (vistior) {
        return vistior.visitVariableStatement(this);
    };
    return VariableStatement;
}(Statement));
exports.VariableStatement = VariableStatement;
/**
 * 表示变量的声明格式。
 */
(function (VariableType) {
    /**
     * 变量未声明。
     */
    VariableType[VariableType["none"] = 0] = "none";
    /**
     * 使用 var 声明。
     */
    VariableType[VariableType["var"] = 1] = "var";
    /**
     * 使用 const 声明。
     */
    VariableType[VariableType["const"] = 2] = "const";
    /**
     * 使用 let 声明。
     */
    VariableType[VariableType["let"] = 3] = "let";
})(exports.VariableType || (exports.VariableType = {}));
var VariableType = exports.VariableType;
/**
 * 表示一个变量声明(xx = ...)。
 */
var VariableDeclaration = (function (_super) {
    __extends(VariableDeclaration, _super);
    function VariableDeclaration() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(VariableDeclaration.prototype, "colonEnd", {
        /**
         * 获取当前变量名后冒号的结束位置。如果当前变量后不跟冒号则返回 undefined。
         */
        get: function () { return this.colonEnd != undefined ? this.colonEnd + 1 : undefined; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VariableDeclaration.prototype, "equalEnd", {
        /**
         * 获取当前变量名后等号的结束位置。如果当前变量后不跟等号则返回 undefined。
         */
        get: function () { return this.equalStart != undefined ? this.equalStart + 1 : undefined; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    VariableDeclaration.prototype.accept = function (vistior) {
        return vistior.visitVariableDeclaration(this);
    };
    return VariableDeclaration;
}(Node));
exports.VariableDeclaration = VariableDeclaration;
/**
 * 表示一个绑定模式([xx, ...])
 */
var BindingPattern = (function (_super) {
    __extends(BindingPattern, _super);
    function BindingPattern() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    BindingPattern.prototype.accept = function (vistior) {
        return vistior.visitBindingPattern(this);
    };
    return BindingPattern;
}(Node));
exports.BindingPattern = BindingPattern;
/**
 * 表示一个绑定模式项(xx, ..)
 */
var BindingElement = (function (_super) {
    __extends(BindingElement, _super);
    function BindingElement() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    BindingElement.prototype.accept = function (vistior) {
        return vistior.visitBindingElement(this);
    };
    return BindingElement;
}(Node));
exports.BindingElement = BindingElement;
/**
 * 表示一个数组绑定模式([xx, ...])
 */
var ArrayBindingPattern = (function (_super) {
    __extends(ArrayBindingPattern, _super);
    function ArrayBindingPattern() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ArrayBindingPattern.prototype.accept = function (vistior) {
        return vistior.visitArrayBindingPattern(this);
    };
    return ArrayBindingPattern;
}(BindingPattern));
exports.ArrayBindingPattern = ArrayBindingPattern;
/**
 * 表示一个数组绑定模式项(xx, ..)
 */
var ArrayBindingElement = (function (_super) {
    __extends(ArrayBindingElement, _super);
    function ArrayBindingElement() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(ArrayBindingElement.prototype, "dotDotDotEnd", {
        /**
         * 获取当前绑定模式项的点点点结束位置。如果当前绑定模式项不含点点点则返回 undefined。
         */
        get: function () { return this.dotDotDotStart != undefined ? this.dotDotDotStart + 3 : undefined; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ArrayBindingElement.prototype, "equalEnd", {
        /**
         * 获取当前绑定模式项的等号结束位置。如果当前绑定模式项不含等号则返回 undefined。
         */
        get: function () { return this.equalEnd != undefined ? this.equalStart + 1 : undefined; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ArrayBindingElement.prototype.accept = function (vistior) {
        return vistior.visitArrayBindingElement(this);
    };
    return ArrayBindingElement;
}(BindingElement));
exports.ArrayBindingElement = ArrayBindingElement;
/**
 * 表示一个对象绑定模式({xx, ...})
 */
var ObjectBindingPattern = (function (_super) {
    __extends(ObjectBindingPattern, _super);
    function ObjectBindingPattern() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ObjectBindingPattern.prototype.accept = function (vistior) {
        return vistior.visitObjectBindingPattern(this);
    };
    return ObjectBindingPattern;
}(BindingPattern));
exports.ObjectBindingPattern = ObjectBindingPattern;
/**
 * 表示一个对象绑定模式项(xx: y)
 */
var ObjectBindingElement = (function (_super) {
    __extends(ObjectBindingElement, _super);
    function ObjectBindingElement() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(ObjectBindingElement.prototype, "colonEnd", {
        /**
         * 获取当前属性名后冒号的结束位置。如果当前属性后不跟冒号则返回 undefined。
         */
        get: function () { return this.colonEnd != undefined ? this.colonEnd + 1 : undefined; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ObjectBindingElement.prototype.accept = function (vistior) {
        return vistior.visitObjectBindingElement(this);
    };
    return ObjectBindingElement;
}(BindingElement));
exports.ObjectBindingElement = ObjectBindingElement;
/**
 * 表示一个标签语句(xx: ...)。
 */
var LabeledStatement = (function (_super) {
    __extends(LabeledStatement, _super);
    function LabeledStatement() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    LabeledStatement.prototype.accept = function (vistior) {
        return vistior.visitLabeledStatement(this);
    };
    return LabeledStatement;
}(Statement));
exports.LabeledStatement = LabeledStatement;
/**
 * 表示一个表达式语句(...;)。
 */
var ExpressionStatement = (function (_super) {
    __extends(ExpressionStatement, _super);
    function ExpressionStatement() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(ExpressionStatement.prototype, "hasSemicolon", {
        /**
         * 判断当前语句是否以分号结尾。
         */
        get: function () { return this.end > this.body.end; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ExpressionStatement.prototype.accept = function (vistior) {
        return vistior.visitExpressionStatement(this);
    };
    return ExpressionStatement;
}(Statement));
exports.ExpressionStatement = ExpressionStatement;
/**
 * 表示一个 if 语句(if(...) {...})。
 */
var IfStatement = (function (_super) {
    __extends(IfStatement, _super);
    function IfStatement() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(IfStatement.prototype, "end", {
        /**
         * undefined
         */
        get: function () { return (this.else || this.then).end; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    IfStatement.prototype.accept = function (vistior) {
        return vistior.visitIfStatement(this);
    };
    return IfStatement;
}(Statement));
exports.IfStatement = IfStatement;
/**
 * 表示一个 switch 语句(switch(...){...})。
 */
var SwitchStatement = (function (_super) {
    __extends(SwitchStatement, _super);
    function SwitchStatement() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    SwitchStatement.prototype.accept = function (vistior) {
        return vistior.visitSwitchStatement(this);
    };
    return SwitchStatement;
}(Statement));
exports.SwitchStatement = SwitchStatement;
/**
 * 表示一个 switch 语句的 case 分支(case ...:{...})。
 */
var CaseClause = (function (_super) {
    __extends(CaseClause, _super);
    function CaseClause() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(CaseClause.prototype, "colonEnd", {
        /**
         * 获取当前标签名后冒号的结束位置。
         */
        get: function () { return this.colonEnd + 1; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    CaseClause.prototype.accept = function (vistior) {
        return vistior.visitCaseClause(this);
    };
    return CaseClause;
}(Node));
exports.CaseClause = CaseClause;
/**
 * 表示一个 for 语句(for(...; ...; ...) {...})。
 */
var ForStatement = (function (_super) {
    __extends(ForStatement, _super);
    function ForStatement() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(ForStatement.prototype, "firstSemicolonEnd", {
        /**
         * 获取条件部分中首个分号的结束位置。
         */
        get: function () { return this.firstSemicolonStart + 1; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ForStatement.prototype, "secondSemicolonEnd", {
        /**
         * 获取条件部分中第二个分号的结束位置。
         */
        get: function () { return this.secondSemicolonStart + 1; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ForStatement.prototype.accept = function (vistior) {
        return vistior.visitForStatement(this);
    };
    return ForStatement;
}(Statement));
exports.ForStatement = ForStatement;
/**
 * 表示一个 for..in 语句(for(var xx in ...) {...})。
 */
var ForInStatement = (function (_super) {
    __extends(ForInStatement, _super);
    function ForInStatement() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ForInStatement.prototype.accept = function (vistior) {
        return vistior.visitForInStatement(this);
    };
    return ForInStatement;
}(Statement));
exports.ForInStatement = ForInStatement;
/**
 * 表示一个 for..of 语句(for(var xx of ...) {...})。
 */
var ForOfStatement = (function (_super) {
    __extends(ForOfStatement, _super);
    function ForOfStatement() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ForOfStatement.prototype.accept = function (vistior) {
        return vistior.visitForOfStatement(this);
    };
    return ForOfStatement;
}(Statement));
exports.ForOfStatement = ForOfStatement;
/**
 * 表示一个 while 语句(while(...) {...})。
 */
var WhileStatement = (function (_super) {
    __extends(WhileStatement, _super);
    function WhileStatement() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(WhileStatement.prototype, "end", {
        /**
         * undefined
         */
        get: function () { return this.body.end; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    WhileStatement.prototype.accept = function (vistior) {
        return vistior.visitWhileStatement(this);
    };
    return WhileStatement;
}(Statement));
exports.WhileStatement = WhileStatement;
/**
 * 表示一个 do..while 语句(do {...} while(...);)。
 */
var DoWhileStatement = (function (_super) {
    __extends(DoWhileStatement, _super);
    function DoWhileStatement() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(DoWhileStatement.prototype, "hasSemicolon", {
        /**
         * 判断当前语句是否以分号结尾。
         */
        get: function () { return this.end > this.condition.end; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    DoWhileStatement.prototype.accept = function (vistior) {
        return vistior.visitDoWhileStatement(this);
    };
    return DoWhileStatement;
}(Statement));
exports.DoWhileStatement = DoWhileStatement;
/**
 * 表示一个 continue 语句(continue;)。
 */
var ContinueStatement = (function (_super) {
    __extends(ContinueStatement, _super);
    function ContinueStatement() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(ContinueStatement.prototype, "hasSemicolon", {
        /**
         * 判断当前语句是否以分号结尾。
         */
        get: function () { return this.end > this.start + 8 /*'continue'.length*/; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ContinueStatement.prototype.accept = function (vistior) {
        return vistior.visitContinueStatement(this);
    };
    return ContinueStatement;
}(Statement));
exports.ContinueStatement = ContinueStatement;
/**
 * 表示一个 break 语句(break;)。
 */
var BreakStatement = (function (_super) {
    __extends(BreakStatement, _super);
    function BreakStatement() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(BreakStatement.prototype, "hasSemicolon", {
        /**
         * 判断当前语句是否以分号结尾。
         */
        get: function () { return this.end > this.start + 5 /*'break'.length*/; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    BreakStatement.prototype.accept = function (vistior) {
        return vistior.visitBreakStatement(this);
    };
    return BreakStatement;
}(Statement));
exports.BreakStatement = BreakStatement;
/**
 * 表示一个 return 语句(return ...;)。
 */
var ReturnStatement = (function (_super) {
    __extends(ReturnStatement, _super);
    function ReturnStatement() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(ReturnStatement.prototype, "hasSemicolon", {
        /**
         * 判断当前语句是否以分号结尾。
         */
        get: function () { return this.end > (this.value ? this.value.end : this.start + 6 /*'return'.length*/); },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ReturnStatement.prototype.accept = function (vistior) {
        return vistior.visitReturnStatement(this);
    };
    return ReturnStatement;
}(Statement));
exports.ReturnStatement = ReturnStatement;
/**
 * 表示一个 throw 语句(throw ...;)。
 */
var ThrowStatement = (function (_super) {
    __extends(ThrowStatement, _super);
    function ThrowStatement() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(ThrowStatement.prototype, "hasSemicolon", {
        /**
         * 判断当前语句是否以分号结尾。
         */
        get: function () { return this.end > (this.value ? this.value.end : this.start + 6 /*'return'.length*/); },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ThrowStatement.prototype.accept = function (vistior) {
        return vistior.visitThrowStatement(this);
    };
    return ThrowStatement;
}(Statement));
exports.ThrowStatement = ThrowStatement;
/**
 * 表示一个 try 语句(try {...} catch(e) {...})。
 */
var TryStatement = (function (_super) {
    __extends(TryStatement, _super);
    function TryStatement() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    TryStatement.prototype.accept = function (vistior) {
        return vistior.visitTryStatement(this);
    };
    return TryStatement;
}(Statement));
exports.TryStatement = TryStatement;
/**
 * 表示一个 try 语句的 catch 部分(catch(e) {...})。
 */
var CatchClause = (function (_super) {
    __extends(CatchClause, _super);
    function CatchClause() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(CatchClause.prototype, "openParanEnd", {
        /**
         * 获取异常变量的开括号的结束位置。
         */
        get: function () { return this.openParanStart + 1; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CatchClause.prototype, "closeParanEnd", {
        /**
         * 获取异常变量的闭括号的结束位置。
         */
        get: function () { return this.closeParanStart + 1; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    CatchClause.prototype.accept = function (vistior) {
        return vistior.visitCatchClause(this);
    };
    return CatchClause;
}(Node));
exports.CatchClause = CatchClause;
/**
 * 表示一个 try 语句的 finally 部分(finally {...})。
 */
var FinallyClause = (function (_super) {
    __extends(FinallyClause, _super);
    function FinallyClause() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    FinallyClause.prototype.accept = function (vistior) {
        return vistior.visitFinallyClause(this);
    };
    return FinallyClause;
}(Node));
exports.FinallyClause = FinallyClause;
/**
 * 表示一个 with 语句(with(...) {...})。
 */
var WithStatement = (function (_super) {
    __extends(WithStatement, _super);
    function WithStatement() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    WithStatement.prototype.accept = function (vistior) {
        return vistior.visitWithStatement(this);
    };
    return WithStatement;
}(Statement));
exports.WithStatement = WithStatement;
/**
 * 表示一个表达式。
 */
var Expression = (function (_super) {
    __extends(Expression, _super);
    function Expression() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    Expression.prototype.accept = function (vistior) {
        return vistior.visitExpression(this);
    };
    return Expression;
}(Node));
exports.Expression = Expression;
/**
 * 表示一个标识符(xx)。
 */
var Identifier = (function (_super) {
    __extends(Identifier, _super);
    function Identifier() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    Identifier.prototype.accept = function (vistior) {
        return vistior.visitIdentifier(this);
    };
    return Identifier;
}(Expression));
exports.Identifier = Identifier;
/**
 * 表示 null 字面量(null)。
 */
var NullLiteral = (function (_super) {
    __extends(NullLiteral, _super);
    function NullLiteral() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    NullLiteral.prototype.accept = function (vistior) {
        return vistior.visitNullLiteral(this);
    };
    return NullLiteral;
}(Expression));
exports.NullLiteral = NullLiteral;
/**
 * 表示 true 字面量(true)。
 */
var TrueLiteral = (function (_super) {
    __extends(TrueLiteral, _super);
    function TrueLiteral() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    TrueLiteral.prototype.accept = function (vistior) {
        return vistior.visitTrueLiteral(this);
    };
    return TrueLiteral;
}(Expression));
exports.TrueLiteral = TrueLiteral;
/**
 * 表示 false 字面量(false)。
 */
var FalseLiteral = (function (_super) {
    __extends(FalseLiteral, _super);
    function FalseLiteral() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    FalseLiteral.prototype.accept = function (vistior) {
        return vistior.visitFalseLiteral(this);
    };
    return FalseLiteral;
}(Expression));
exports.FalseLiteral = FalseLiteral;
/**
 * 表示一个浮点数字面量(1)。
 */
var NumericLiteral = (function (_super) {
    __extends(NumericLiteral, _super);
    function NumericLiteral() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    NumericLiteral.prototype.accept = function (vistior) {
        return vistior.visitNumericLiteral(this);
    };
    return NumericLiteral;
}(Expression));
exports.NumericLiteral = NumericLiteral;
/**
 * 表示一个字符串字面量('...')。
 */
var StringLiteral = (function (_super) {
    __extends(StringLiteral, _super);
    function StringLiteral() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    StringLiteral.prototype.accept = function (vistior) {
        return vistior.visitStringLiteral(this);
    };
    return StringLiteral;
}(Expression));
exports.StringLiteral = StringLiteral;
/**
 * 表示一个数组字面量([...])。
 */
var ArrayLiteral = (function (_super) {
    __extends(ArrayLiteral, _super);
    function ArrayLiteral() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ArrayLiteral.prototype.accept = function (vistior) {
        return vistior.visitArrayLiteral(this);
    };
    return ArrayLiteral;
}(Expression));
exports.ArrayLiteral = ArrayLiteral;
/**
 * 表示一个对象字面量({x: ...})。
 */
var ObjectLiteral = (function (_super) {
    __extends(ObjectLiteral, _super);
    function ObjectLiteral() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ObjectLiteral.prototype.accept = function (vistior) {
        return vistior.visitObjectLiteral(this);
    };
    return ObjectLiteral;
}(Expression));
exports.ObjectLiteral = ObjectLiteral;
/**
 * 表示一个对象字面量项。
 */
var ObjectLiteralElement = (function (_super) {
    __extends(ObjectLiteralElement, _super);
    function ObjectLiteralElement() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(ObjectLiteralElement.prototype, "colonEnd", {
        /**
         * 获取当前变量名后冒号的结束位置。如果当前变量后不跟冒号则返回 undefined。
         */
        get: function () { return this.colonEnd != undefined ? this.colonEnd + 1 : undefined; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ObjectLiteralElement.prototype.accept = function (vistior) {
        return vistior.visitObjectLiteralElement(this);
    };
    return ObjectLiteralElement;
}(Node));
exports.ObjectLiteralElement = ObjectLiteralElement;
/**
 * 表示 this 字面量(this)。
 */
var ThisLiteral = (function (_super) {
    __extends(ThisLiteral, _super);
    function ThisLiteral() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ThisLiteral.prototype.accept = function (vistior) {
        return vistior.visitThisLiteral(this);
    };
    return ThisLiteral;
}(Expression));
exports.ThisLiteral = ThisLiteral;
/**
 * 表示 super 字面量(super)。
 */
var SuperLiteral = (function (_super) {
    __extends(SuperLiteral, _super);
    function SuperLiteral() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    SuperLiteral.prototype.accept = function (vistior) {
        return vistior.visitSuperLiteral(this);
    };
    return SuperLiteral;
}(Expression));
exports.SuperLiteral = SuperLiteral;
/**
 * 表示一个括号表达式((...))。
 */
var ParenthesizedExpression = (function (_super) {
    __extends(ParenthesizedExpression, _super);
    function ParenthesizedExpression() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ParenthesizedExpression.prototype.accept = function (vistior) {
        return vistior.visitParenthesizedExpression(this);
    };
    return ParenthesizedExpression;
}(Expression));
exports.ParenthesizedExpression = ParenthesizedExpression;
/**
 * 表示一个条件表达式(... ? ... : ...)。
 */
var ConditionalExpression = (function (_super) {
    __extends(ConditionalExpression, _super);
    function ConditionalExpression() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ConditionalExpression.prototype.accept = function (vistior) {
        return vistior.visitConditionalExpression(this);
    };
    return ConditionalExpression;
}(Expression));
exports.ConditionalExpression = ConditionalExpression;
/**
 * 表示一个箭头函数(x => ...)。
 */
var LambdaLiteral = (function (_super) {
    __extends(LambdaLiteral, _super);
    function LambdaLiteral() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(LambdaLiteral.prototype, "arrowEnd", {
        /**
         * 获取当前表达式的箭头结束位置。
         */
        get: function () { return this.arrowStart + 1; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    LambdaLiteral.prototype.accept = function (vistior) {
        return vistior.visitLambdaLiteral(this);
    };
    return LambdaLiteral;
}(Expression));
exports.LambdaLiteral = LambdaLiteral;
/**
 * 表示一个 yield 表达式(yield xx)。
 */
var YieldExpression = (function (_super) {
    __extends(YieldExpression, _super);
    function YieldExpression() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(YieldExpression.prototype, "asteriskEnd", {
        /**
         * 获取当前表达式的 * 的结束位置。如果当前表达式无 * 则返回 undefined。
         */
        get: function () { return this.asteriskStart != undefined ? this.asteriskStart + 1 : undefined; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(YieldExpression.prototype, "end", {
        /**
         * 获取当前节点的结束位置。如果当前节点是生成的则返回 undefined。
         */
        get: function () { return this.body ? this.body.end : this.start + 5 /*'yield'.length*/; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    YieldExpression.prototype.accept = function (vistior) {
        return vistior.visitYieldExpression(this);
    };
    return YieldExpression;
}(Statement));
exports.YieldExpression = YieldExpression;
/**
 * 表示一个类型转换表达式(<T>xx)。
 */
var CastExpression = (function (_super) {
    __extends(CastExpression, _super);
    function CastExpression() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(CastExpression.prototype, "lessThanEnd", {
        /**
         * 获取当前表达式的 < 的结束位置。
         */
        get: function () { return this.lessThanStart + 1; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CastExpression.prototype, "greaterThanEnd", {
        /**
         * 获取当前表达式的 > 的结束位置。
         */
        get: function () { return this.greaterThanStart + 1; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    CastExpression.prototype.accept = function (vistior) {
        return vistior.visitCastExpression(this);
    };
    return CastExpression;
}(Expression));
exports.CastExpression = CastExpression;
/**
 * 表示一个成员调用表达式(x.y)。
 */
var MemberCallExpression = (function (_super) {
    __extends(MemberCallExpression, _super);
    function MemberCallExpression() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(MemberCallExpression.prototype, "start", {
        /**
         * undefined
         */
        get: function () { return this.target.start; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MemberCallExpression.prototype, "end", {
        /**
         * undefined
         */
        get: function () { return this.argument.end; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    MemberCallExpression.prototype.accept = function (vistior) {
        return vistior.visitMemberCallExpression(this);
    };
    return MemberCallExpression;
}(Expression));
exports.MemberCallExpression = MemberCallExpression;
/**
 * 表示一个类调用表达式(x(...))。
 */
var CallLikeExpression = (function (_super) {
    __extends(CallLikeExpression, _super);
    function CallLikeExpression() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    CallLikeExpression.prototype.accept = function (vistior) {
        return vistior.visitCallLikeExpression(this);
    };
    return CallLikeExpression;
}(Expression));
exports.CallLikeExpression = CallLikeExpression;
/**
 * 表示一个函数调用表达式(x(...))。
 */
var CallExpression = (function (_super) {
    __extends(CallExpression, _super);
    function CallExpression() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    CallExpression.prototype.accept = function (vistior) {
        return vistior.visitCallExpression(this);
    };
    return CallExpression;
}(CallLikeExpression));
exports.CallExpression = CallExpression;
/**
 * 表示一个 new 表达式(new x(...))。
 */
var NewExpression = (function (_super) {
    __extends(NewExpression, _super);
    function NewExpression() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    NewExpression.prototype.accept = function (vistior) {
        return vistior.visitNewExpression(this);
    };
    return NewExpression;
}(CallLikeExpression));
exports.NewExpression = NewExpression;
/**
 * 表示一个索引调用表达式(x[...])。
 */
var IndexCallExpression = (function (_super) {
    __extends(IndexCallExpression, _super);
    function IndexCallExpression() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(IndexCallExpression.prototype, "start", {
        /**
         * undefined
         */
        get: function () { return this.target.start; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    IndexCallExpression.prototype.accept = function (vistior) {
        return vistior.visitIndexCallExpression(this);
    };
    return IndexCallExpression;
}(CallLikeExpression));
exports.IndexCallExpression = IndexCallExpression;
/**
 * 表示一个一元运算表达式(+x)。
 */
var UnaryExpression = (function (_super) {
    __extends(UnaryExpression, _super);
    function UnaryExpression() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(UnaryExpression.prototype, "isPostfix", {
        /**
         * 判断当前表达式是否是后缀表达式。
         */
        get: function () { return this.end > this.operand.end; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    UnaryExpression.prototype.accept = function (vistior) {
        return vistior.visitUnaryExpression(this);
    };
    return UnaryExpression;
}(Expression));
exports.UnaryExpression = UnaryExpression;
/**
 * 表示一个二元运算表达式(x + y)。
 */
var BinaryExpression = (function (_super) {
    __extends(BinaryExpression, _super);
    function BinaryExpression() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(BinaryExpression.prototype, "operatorEnd", {
        /**
         * 获取运算符的结束位置。
         */
        get: function () { return this.operatorStart + tokenToString(this.operator).length; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BinaryExpression.prototype, "start", {
        /**
         * undefined
         */
        get: function () { return this.leftOperand.start; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BinaryExpression.prototype, "end", {
        /**
         * undefined
         */
        get: function () { return this.rightOperand.end; },
        enumerable: true,
        configurable: true
    });
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    BinaryExpression.prototype.accept = function (vistior) {
        return vistior.visitBinaryExpression(this);
    };
    return BinaryExpression;
}(Expression));
exports.BinaryExpression = BinaryExpression;
/**
 * 表示内置类型字面量(number)。
 */
var PredefinedTypeLiteral = (function (_super) {
    __extends(PredefinedTypeLiteral, _super);
    function PredefinedTypeLiteral() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    PredefinedTypeLiteral.prototype.accept = function (vistior) {
        return vistior.visitPredefinedTypeLiteral(this);
    };
    return PredefinedTypeLiteral;
}(Expression));
exports.PredefinedTypeLiteral = PredefinedTypeLiteral;
/**
 * 表示一个泛型表达式(Array<T>)。
 */
var GenericTypeExpression = (function (_super) {
    __extends(GenericTypeExpression, _super);
    function GenericTypeExpression() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    GenericTypeExpression.prototype.accept = function (vistior) {
        return vistior.visitGenericTypeExpression(this);
    };
    return GenericTypeExpression;
}(Expression));
exports.GenericTypeExpression = GenericTypeExpression;
/**
 * 表示一个数组类型表达式(T[])。
 */
var ArrayTypeExpression = (function (_super) {
    __extends(ArrayTypeExpression, _super);
    function ArrayTypeExpression() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ArrayTypeExpression.prototype.accept = function (vistior) {
        return vistior.visitArrayTypeExpression(this);
    };
    return ArrayTypeExpression;
}(Expression));
exports.ArrayTypeExpression = ArrayTypeExpression;
/**
 * 表示一个类型（如类、结构、接口）定义。
 */
var TypeDefinition = (function (_super) {
    __extends(TypeDefinition, _super);
    function TypeDefinition() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    TypeDefinition.prototype.accept = function (vistior) {
        return vistior.visitTypeDefinition(this);
    };
    return TypeDefinition;
}(MemberContainerDefinition));
exports.TypeDefinition = TypeDefinition;
/**
 * 表示一个成员（如方法、字段、类、模块等）定义。
 */
var MemberDefinition = (function (_super) {
    __extends(MemberDefinition, _super);
    function MemberDefinition() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    MemberDefinition.prototype.accept = function (vistior) {
        return vistior.visitMemberDefinition(this);
    };
    return MemberDefinition;
}(Node));
exports.MemberDefinition = MemberDefinition;
/**
 * 表示一个注解(@xx(...))。
 */
var Annotation = (function (_super) {
    __extends(Annotation, _super);
    function Annotation() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    Annotation.prototype.accept = function (vistior) {
        return vistior.visitAnnotation(this);
    };
    return Annotation;
}(CallLikeExpression));
exports.Annotation = Annotation;
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
    Modifiers[Modifiers["final"] = 2] = "final";
    /**
     * 表示覆盖的成员。
     */
    Modifiers[Modifiers["new"] = 3] = "new";
    /**
     * 表示抽象的成员。
     */
    Modifiers[Modifiers["abstract"] = 4] = "abstract";
    /**
     * 表示虚成员。
     */
    Modifiers[Modifiers["virtual"] = 5] = "virtual";
    /**
     * 表示重写的成员。
     */
    Modifiers[Modifiers["override"] = 6] = "override";
    /**
     * 表示外部的成员。
     */
    Modifiers[Modifiers["declare"] = 7] = "declare";
    /**
     * 表示公开的成员。
     */
    Modifiers[Modifiers["public"] = 8] = "public";
    /**
     * 表示保护的成员。
     */
    Modifiers[Modifiers["protected"] = 9] = "protected";
    /**
     * 表示私有的成员。
     */
    Modifiers[Modifiers["private"] = 10] = "private";
    /**
     * 表示访问修饰符。
     */
    Modifiers[Modifiers["accessibility"] = 11] = "accessibility";
})(exports.Modifiers || (exports.Modifiers = {}));
var Modifiers = exports.Modifiers;
/**
 * 表示一个参数声明。
 */
var ParameterDeclaration = (function (_super) {
    __extends(ParameterDeclaration, _super);
    function ParameterDeclaration() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ParameterDeclaration.prototype.accept = function (vistior) {
        return vistior.visitParameterDeclaration(this);
    };
    return ParameterDeclaration;
}(Node));
exports.ParameterDeclaration = ParameterDeclaration;
/**
 * 表示一个泛型参数。
 */
var GenericParameterDeclaration = (function (_super) {
    __extends(GenericParameterDeclaration, _super);
    function GenericParameterDeclaration() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    GenericParameterDeclaration.prototype.accept = function (vistior) {
        return vistior.visitGenericParameterDeclaration(this);
    };
    return GenericParameterDeclaration;
}(Node));
exports.GenericParameterDeclaration = GenericParameterDeclaration;
/**
 * 表示一个可以保存子成员的容器成员定义。
 */
var MemberContainerDefinition = (function (_super) {
    __extends(MemberContainerDefinition, _super);
    function MemberContainerDefinition() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    MemberContainerDefinition.prototype.accept = function (vistior) {
        return vistior.visitMemberContainerDefinition(this);
    };
    return MemberContainerDefinition;
}(MemberDefinition));
exports.MemberContainerDefinition = MemberContainerDefinition;
/**
 * 表示一个类定义。
 */
var ClassDefinition = (function (_super) {
    __extends(ClassDefinition, _super);
    function ClassDefinition() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ClassDefinition.prototype.accept = function (vistior) {
        return vistior.visitClassDefinition(this);
    };
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
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    StructDefinition.prototype.accept = function (vistior) {
        return vistior.visitStructDefinition(this);
    };
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
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    InterfaceDefinition.prototype.accept = function (vistior) {
        return vistior.visitInterfaceDefinition(this);
    };
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
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    EnumDefinition.prototype.accept = function (vistior) {
        return vistior.visitEnumDefinition(this);
    };
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
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ExtensionDefinition.prototype.accept = function (vistior) {
        return vistior.visitExtensionDefinition(this);
    };
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
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    NamespaceDefinition.prototype.accept = function (vistior) {
        return vistior.visitNamespaceDefinition(this);
    };
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
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ImportDirective.prototype.accept = function (vistior) {
        return vistior.visitImportDirective(this);
    };
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
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ModuleDefinition.prototype.accept = function (vistior) {
        return vistior.visitModuleDefinition(this);
    };
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
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    TypeMemberDefinition.prototype.accept = function (vistior) {
        return vistior.visitTypeMemberDefinition(this);
    };
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
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    FieldDefinition.prototype.accept = function (vistior) {
        return vistior.visitFieldDefinition(this);
    };
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
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    MethodOrPropertyDefinition.prototype.accept = function (vistior) {
        return vistior.visitMethodOrPropertyDefinition(this);
    };
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
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    PropertyOrIndexerDefinition.prototype.accept = function (vistior) {
        return vistior.visitPropertyOrIndexerDefinition(this);
    };
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
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    PropertyDefinition.prototype.accept = function (vistior) {
        return vistior.visitPropertyDefinition(this);
    };
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
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    IndexerDefinition.prototype.accept = function (vistior) {
        return vistior.visitIndexerDefinition(this);
    };
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
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    MethodOrConstructorDefinition.prototype.accept = function (vistior) {
        return vistior.visitMethodOrConstructorDefinition(this);
    };
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
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    MethodDefinition.prototype.accept = function (vistior) {
        return vistior.visitMethodDefinition(this);
    };
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
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    ConstructorDefinition.prototype.accept = function (vistior) {
        return vistior.visitConstructorDefinition(this);
    };
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
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    EnumMemberDefinition.prototype.accept = function (vistior) {
        return vistior.visitEnumMemberDefinition(this);
    };
    return EnumMemberDefinition;
}(TypeMemberDefinition));
exports.EnumMemberDefinition = EnumMemberDefinition;
/**
 * 标识一个 JS 文档注释。
 */
var JsDocComment = (function (_super) {
    __extends(JsDocComment, _super);
    function JsDocComment() {
        _super.apply(this, arguments);
    }
    /**
     * 使用指定的节点访问器处理当前节点。
     * @param vistior 要使用的节点访问器。
     */
    JsDocComment.prototype.accept = function (vistior) {
        return vistior.visitJsDocComment(this);
    };
    return JsDocComment;
}(Node));
exports.JsDocComment = JsDocComment;
//# sourceMappingURL=nodes.js.map