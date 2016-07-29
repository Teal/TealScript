///<reference path='references.ts' />
/* @internal */
var ts;
(function (ts) {
    var formatting;
    (function (formatting) {
        var RuleOperation = (function () {
            function RuleOperation(Context, Action) {
                this.Context = Context;
                this.Action = Action;
            }
            RuleOperation.prototype.toString = function () {
                return "[context=" + this.Context + "," +
                    "action=" + this.Action + "]";
            };
            RuleOperation.create1 = function (action) {
                return RuleOperation.create2(formatting.RuleOperationContext.Any, action);
            };
            RuleOperation.create2 = function (context, action) {
                return new RuleOperation(context, action);
            };
            return RuleOperation;
        }());
        formatting.RuleOperation = RuleOperation;
    })(formatting = ts.formatting || (ts.formatting = {}));
})(ts || (ts = {}));
//# sourceMappingURL=ruleOperation.js.map