var assert = require("assert");

describe('Unicode', function () {
    return
    var unicode = require("../lib/parser/unicode.js");
    var methods = require("./result/unicode.json");
    for (var method in methods) {
        it(method, function () {
            this.timeout(100000);
            for (var i = 0; i < 65536; i++) {
                var expected = methods[method].indexOf(i) >= 0;
                assert.equal(unicode[method](i), expected, method + "(" + i + ") 应返回 " + expected);
            }
        });
    }
});

describe("TokenType", function () {
    var tokenType = require("../lib/parser/tokenType.js");

    it("stringToToken & tokenToString", function () {
        for (var i = 0; i < tokenType.TokenType.MAX_TOKEN; i++) {
            assert.equal(tokenType.stringToToken(tokenType.tokenToString(i)), i);
        }
    });

    var methods = require("./result/tokenType.json");
    for (var method in methods) {
        it(method, function () {
            this.timeout(100000);
            for (var i = 0; i < tokenType.TokenType.MAX_TOKEN; i++) {
                if (tokenType.tokenToString(i).indexOf("_") >= 0) continue;
                var expected = methods[method].indexOf(tokenType.tokenToString(i)) >= 0;
                assert.equal(tokenType[method](i), expected, method + "(" + tokenType.tokenToString(i) + ") 应返回 " + expected);
            }
        });
    }
});
