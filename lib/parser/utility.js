var tokens_1 = require('./tokens');
var unicode_1 = require('./unicode');
/**
 * 判断指定字符串是否是合法的标识符。
 * @param value 要判断的字符串。
 * @returns 如果是则返回 true，否则返回 false。
 */
function isIdentifier(value) {
    var keyword = tokens_1.getKeyword(value);
    if (keyword != undefined) {
        return tokens_1.isIdentifierName(keyword);
    }
    if (!unicode_1.isIdentifierStart(value.charCodeAt(0))) {
        return false;
    }
    for (var i = 1; i < value.length; i++) {
        if (!unicode_1.isIdentifierPart(name.charCodeAt(i))) {
            return false;
        }
    }
    return true;
}
exports.isIdentifier = isIdentifier;
/**
 * 判断指定的修饰符列表是否包含指定的修饰符。
 */
function hasModifier(modifiers, modifier) {
}
exports.hasModifier = hasModifier;
//# sourceMappingURL=utility.js.map