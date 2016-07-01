
import * as nodes from '../parser/nodes';
import * as symbols from './symbols';

/**
 * 表示一个语义分析器。
 */
export class Resolver {

    /**
     * 获取
     */
    package: nodes.Package;

    anyType = new symbols.PrimaryTypeSymbol("any");

    nullType = new symbols.PrimaryTypeSymbol("null");

    /**
     * 初始化新的语义分析器。
     * @param pkg 要分析的包。
     */
    constructor(pkg: nodes.Package) {
        this.package = pkg;

        // 初始化语法树以便语义分析。
    }

    /**
     * 启用语义分析。
     */
    enable() {

    }

    /**
     * 禁用语义分析。此操作可能使正在进行的语义分析终止。
     */
    disable() {

    }

    /**
     * 获取指定表达式的类型。
     * @param node 要获取的节点。
     */
    resolveTypeOfExpression(node: nodes.Expression) {
        switch (node.constructor) {
            case nodes.NullLiteral:
                return this.nullType;
        }
    }

    /**
     * 获取指定标识符的标识。
     * @param node 要获取的节点。
     */
    resolveSymbolOfIdentifier(node: nodes.Identifier) {

    }

    /**
     * 
     * @param block
     * @param name
     */
    resolveValueOfString(block: nodes.Block, name: string) {

    }

    ///**
    // * 获取指定节点的类型。
    // * @param node
    // */
    //getTypeOfNode(node: nodes.Node) {

    //}

}
