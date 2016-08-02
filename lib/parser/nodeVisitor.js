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
    // #region 核心
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
    return NodeVisitor;
}());
exports.NodeVisitor = NodeVisitor;
//# sourceMappingURL=nodeVisitor.js.map