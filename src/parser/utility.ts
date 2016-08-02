
import {Modifier} from './nodes';
import {TokenType, getKeyword, isIdentifierName} from './tokens';
import {isIdentifierStart, isIdentifierPart} from './unicode';

/**
 * 判断指定字符串是否是合法的标识符。
 * @param value 要判断的字符串。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isIdentifier(value: string) {
    const keyword = getKeyword(value);
    if (keyword != undefined) {
        return isIdentifierName(keyword);
    }
    if (!isIdentifierStart(value.charCodeAt(0))) {
        return false;
    }
    for (let i = 1; i < value.length; i++) {
        if (!isIdentifierPart(name.charCodeAt(i))) {
            return false;
        }
    }
    return true;
}

/**
 * 判断指定的修饰符列表是否包含指定的修饰符。
 */
export function hasModifier(modifiers: ArrayLike<nodes.Modifier>, modifier: TokenType) {

}
