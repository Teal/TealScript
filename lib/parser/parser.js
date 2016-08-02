/**
 * @fileOverview 语法解析器
 * @author xuld@vip.qq.com
 */
var tokens = require('./tokens');
var nodes = require('./nodes');
var lexer_1 = require('./lexer');
/**
 * 表示一个语法解析器。
 * @description 语法解析器可以将源码解析一个语法树。
 */
var Parser = (function () {
    function Parser() {
        // #region 对外接口
        /**
         * 获取或设置当前语法解析器使用的词法解析器。
         */
        this.lexer = new lexer_1.Lexer();
    }
    Object.defineProperty(Parser.prototype, "options", {
        /**
         * 获取当前语法解析器的配置。
         */
        get: function () {
            return this.lexer.options;
        },
        /**
         * 设置当前语法解析器的配置。
         */
        set: function (value) {
            this.lexer.options = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 解析指定的源文件。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param options 解析的源码位置。
     */
    Parser.prototype.parse = function (text, start, options) {
        return this.parseSourceFile(text || "", start || 0, options);
    };
    /**
     * 从指定的输入解析一个语句。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param fileName 解析的源码位置。
     */
    Parser.prototype.parseAsStatement = function (text, start, fileName) {
        this.lexer.setSource(text, start, fileName);
        return this.parseStatement();
    };
    /**
     * 从指定的输入解析一个表达式。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param fileName 解析的源码位置。
     */
    Parser.prototype.parseAsExpression = function (text, start, fileName) {
        this.lexer.setSource(text, start, fileName);
        return this.parseExpression();
    };
    /**
     * 从指定的输入解析一个类型表达式。
     * @param text 要解析的源码。
     * @param start 解析的源码开始位置。
     * @param fileName 解析的源码位置。
     */
    Parser.prototype.parseAsTypeNode = function (text, start, fileName) {
        delete this.lexer.comment;
        this.lexer.setSource(text, start, fileName);
        return this.parseTypeNode();
    };
    // #endregion
    // #region 工具函数
    /**
     * 报告一个语法错误。
     * @param range 发生错误的位置。
     * @param message 错误的信息。
     * @param args 格式化错误的参数。
     */
    Parser.prototype.error = function (range, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        // error(ErrorType.syntaxError, this.lexer.fileName, range.start, range.end, message, ...args);
    };
    /**
     * 读取指定类型的标记，如果下一个标记不是指定的类型则报告错误。
     * @param token 要读取的标记类型。
     * @returns 如果标记类型匹配则返回读取的标记位置，否则返回当前的结束位置。
     */
    Parser.prototype.readToken = function (token) {
        if (this.lexer.peek().type === token) {
            return this.lexer.read().start;
        }
        this.error(this.lexer.peek(), "'{0}' expected; Unexpected token '{1}'.", tokens.getTokenName(token), tokens.getTokenName(this.lexer.peek().type));
        return this.lexer.current.end;
    };
    /**
     * 解析一个节点列表。
     * @param parseElement 解析每个元素的函数。如果解析失败函数返回 undefined。
     * @param openToken 列表的开始标记。
     * @param closeToken 列表的结束标记。
     */
    Parser.prototype.parseNodeList = function (parseElement, openToken, closeToken) {
        var result = new nodes.NodeList();
        if (openToken)
            result.start = this.readToken(openToken);
        while (this.lexer.peek().type !== TokenType.endOfFile &&
            (!closeToken || this.lexer.peek().type !== closeToken)) {
            var element = parseElement.call(this);
            if (!element)
                return result;
            result.push(element);
        }
        if (closeToken)
            result.end = this.readToken(closeToken);
        return result;
    };
    /**
     * 解析一个以逗号隔开的列表。
     * @param parseElement 解析每个元素的函数。如果解析失败函数返回 undefined。
     * @param openToken 列表的开始标记。
     * @param closeToken 列表的结束标记。
     * @param allowEmptyList 是否允许空列表。
     * @param continueParse 用于判断出现错误后是否继续解析列表项的函数。
     */
    Parser.prototype.parseDelimitedList = function (parseElement, openToken, closeToken, allowEmptyList, continueParse) {
        var result = new nodes.NodeList();
        if (openToken)
            result.start = this.readToken(openToken);
        if (!allowEmptyList || this.lexer.peek().type !== closeToken && this.lexer.peek().type !== TokenType.endOfFile) {
            while (true) {
                var element = parseElement.call(this);
                result.push(element);
                switch (this.lexer.peek().type) {
                    case TokenType.comma:
                        element.commaToken = this.readToken(TokenType.comma);
                        continue;
                    case closeToken:
                    case TokenType.endOfFile:
                        break;
                    default:
                        // 未读到分隔符和结束标记：分析是缺少,还是缺少结束标记。
                        if (continueParse && continueParse.call(this, this.lexer.peek().type)) {
                            this.readToken(TokenType.comma);
                            continue;
                        }
                        break;
                }
                break;
            }
        }
        if (closeToken)
            result.end = this.readToken(closeToken);
        return result;
    };
    /**
     * 尝试读取或自动插入一个分号。
     * @param result 存放结果的对象。
     * @return 如果已读取或自动插入一个分号则返回 true，否则返回 false。
     */
    Parser.prototype.tryReadSemicolon = function (result) {
        switch (this.lexer.peek().type) {
            case TokenType.semicolon:
                result.semicolonToken = this.lexer.read().start;
                return true;
            case TokenType.closeBrace:
            case TokenType.endOfFile:
                if (this.options.allowMissingSemicolon !== false) {
                    return true;
                }
                break;
        }
        this.error({ start: this.lexer.current.end, end: this.lexer.current.end }, "Missing ';' after statement.");
        return false;
    };
    // #endregion
    // #region 类型节点
    // #endregion
    // #region 表达式
    // #endregion
    // #region 语句
    // #endregion
    // #region 声明
    // #endregion
    // #region 文档注释
    Parser.prototype.parseJsDocComment = function (result) {
    };
    // #endregion
    /**
     * 解析一个源文件。
     */
    Parser.prototype.parseSourceFile = function (text, start, fileName) {
        var result = new nodes.SourceFile();
        result.path = fileName;
        result.content = text;
        result.start = start;
        this.lexer.setSource(text, start, fileName);
        if (this.lexer.comments) {
            for (var _i = 0, _a = this.lexer.comments; _i < _a.length; _i++) {
                var comment = _a[_i];
                // 只处理 /// 开头的注释。
                if (this.lexer.source.charCodeAt(comment.start) !== 47 /* slash */ ||
                    this.lexer.source.charCodeAt(comment.start - 1) !== 47 /* slash */) {
                    continue;
                }
            }
        }
        //// 解析文件主文档注释。
        //if (options.parseJsDoc !== false) {
        //}
        //// 解析 <reference /> 注释。
        //if (options.parseReferenceComments !== false) {
        //    this.parseReferenceComments();
        //}
        result.statements = new Nodes.NodeList();
        while (this.lexer.peek().type !== TokenType.endOfFile) {
            result.statements.push(this.parseStatement());
        }
        result.comments = this.lexer.comments;
        result.end = this.lexer.peek().start;
        return result;
    };
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map