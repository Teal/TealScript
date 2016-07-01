var nodes = require('../parser/nodes');
var symbols = require('./symbols');
/**
 * 表示一个语义分析器。
 */
var Resolver = (function () {
    /**
     * 初始化新的语义分析器。
     * @param pkg 要分析的包。
     */
    function Resolver(pkg) {
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
    return Resolver;
}());
exports.Resolver = Resolver;
//# sourceMappingURL=resolver.js.map