
/**
 * 表示一个包(即一个项目)。
 */
export class Package {

    // #region 节点

    /**
     * 获取所有模块列表。
     */
    modules: Module[];

    // #endregion

    // #region 位置

    // #endregion

    // #region 分析

    // #endregion

    // #region 转换

    /**
     * 对当前包进行转换。
     */
    resolve(context = new ResolveContext()) {

    }

    // #endregion

    // #region 生成

    // #endregion

}
