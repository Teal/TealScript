/**
 * @fileOverview 位置
 * @author xuld@vip.qq.com
 */

/**
 * 表示一个文本区域。
 */
export interface TextRange {

    /**
     * 获取当前区域的开始位置。
     */
    start: number;

    /**
     * 获取当前区域的结束位置。
     */
    end: number;

}

/**
 * 表示源码中的行列信息。
 */
export interface Location {

    /**
     * 获取当前的行。行从 1 开始。
     */
    line: number;

    /**
     * 获取当前的列。列从 1 开始。
     */
    column: number;

}
