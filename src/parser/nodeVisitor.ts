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

    // #endregion

    // #region 表达式

    // #endregion

    // #region 语句

    // #endregion

    // #region 声明

    // #endregion

}
