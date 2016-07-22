isReservedWord


isExpressionStart 
isUnaryOperator
isSimpleLiteral
isIdentifierName
isPredefinedType(部分)
	
isDeclarationStart
isModifier
	@
function
class
等
	
isBinaryOperator
break 	do 	instanceof 	typeof
case 	else 	new 	var
catch 	finally 	return 	void
continue 	for 	switch 	while
debugger 	function 	this 	with
default 	if 	throw 	delete
in 	try 	  	 
class 	enum 	extends 	super
const 	export 	import



其它关键字：


implements 	package 	public 	interface
private 	static 	let 	protected
yield



    /**
     * 最大的标识符 3。
     */
    MAX_IDENTIFIER_NAME_3,

	
	== super

RESERVED_WORD


						if (options.strictMode && @peek !== @<identifier>) {
							@error(@lexer.peek(), "Identifier expected. '{0}' is a reserved word in strict mode.", tokenToString(@peek));
}
						
	
	
    isDeclarationStart
		
    isModifier
    @
    function
    class
    等
						
						
@Modifier // 修饰符(`static`、`private`、...)
        type: <export>|<default>|<declare>|<const>|<static>|<abstract>|<readonly>|<async>|<public>|<protected>|<private>
			
			
			
			
isStatementStart


isRightHandOperator


// default 和 const 也是修饰符


/**
 * 判断指定的标记是否是绑定名称开始。
 * @param token 要判断的标记。
 * @returns 如果是则返回 true，否则返回 false。
 */
export function isBindingNameStart(token: TokenType) {
    switch (token) {
        case TokenType.identifier:
        case TokenType.openBracket:
        case TokenType.openBrace:
            return true;
        default:
            return isReservedWord(token);
    }
}

    let accessibilityToken: number;
    let accessibility: TokenType;
    let abstractOrStaticToken: number;
    let abstractOrStatic: TokenType;
    let asyncOrReadOnlyToken: number;
    let asyncOrReadOnly: TokenType;
    while (isModifier(@peek)) {
        const savedState = @stashSave();
        @lexer.read();
        if (@sameLine && (@peek === @<identifier> || isKeyword(@peek) || @peek === @[)) {
            @stashClear(savedState);
            switch (@lexer.read().type) {
                case @<get>:
                case @<set>:
                    if (asyncOrReadOnly === @<readonly>) {
                        @error({start: asyncOrReadOnlyToken, end: asyncOrReadOnlyToken + 8/*'readonly'.length*/}, "'{0}' modifier can only appear on a property declaration.", tokenToString(@<readonly>));
                    asyncOrReadOnly = asyncOrReadOnlyToken = undefined;
            }
            return @AccessorDeclaration(decorators, accessibilityToken, accessibility, abstractOrStaticToken, abstractOrStatic, asyncOrReadOnlyToken, @lexer.current.start, @lexer.current.type);
                case @<private>:
                case @<protected>:
                case @<public>:
                    if (accessibility != undefined) {
                        @error(@lexer.current, @current === accessibility ? "Duplicate modifier '{0}'." : "'{0}' modifier cannot be used with '{1}' modifier.",  tokenToString(@current),  tokenToString(@accessibility));
                        continue;
    }
    if (abstractOrStatic != undefined || asyncOrReadOnly != undefined) {
        @error(@lexer.current, "'{0}' modifier must precede '{1}' modifier.", tokenToString(@current), tokenToString(abstractOrStatic != undefined ? abstractOrStatic : asyncOrReadOnly));
        continue;
    }
    accessibilityToken = @lexer.current.start;
    accessibility = @lexer.current.type;
    continue;
							case @<abstract>:
                        case @<static>:
                            if (abstractOrStatic != undefined) {
                                @error(@lexer.current, @current === abstractOrStatic ? "Duplicate modifier '{0}'." : "'{0}' modifier cannot be used with '{1}' modifier.",  tokenToString(@current),  tokenToString(@abstractOrStatic));
                                continue;
    }
        if (asyncOrReadOnly != undefined) {
            @error(@lexer.current, "'{0}' modifier must precede '{1}' modifier.", tokenToString(@current), tokenToString(asyncOrReadOnly));
            continue;
        }
        abstractOrStaticToken = @lexer.current.start;
        abstractOrStatic = @lexer.current.type;
        continue;
                        case @<async>:
                        case @<readonly>:
                            if (asyncOrReadOnly != undefined) {
                                @error(@lexer.current, @current === asyncOrReadOnly ? "Duplicate modifier '{0}'." : "'{0}' modifier cannot be used with '{1}' modifier.",  tokenToString(@current),  tokenToString(@asyncOrReadOnly));
                                continue;
}
    asyncOrReadOnlyToken = @lexer.current.start;
    asyncOrReadOnly = @lexer.current.type;
    continue;
}
}
					@stashRestore(savedState);
break;
}
				
				
				
				
if (abstractOrStatic === @<abstract>) {
    @error({start: abstractOrStatic, end: asyncOrReadOnlyToken + 8/*'abstract'.length*/}, "'{0}' modifier can only appear on a class or method declaration.", tokenToString(@<abstract>));
abstractOrStatic = abstractOrStaticToken = undefined;
}
if (asyncOrReadOnly === @<async>) {
    @error({start: asyncOrReadOnly, end: asyncOrReadOnlyToken + 5/*'async'.length*/}, "'{0}' modifier can only appear on a property declaration.", tokenToString(@<readonly>));
asyncOrReadOnly = asyncOrReadOnlyToken = undefined;
}
if (asyncOrReadOnly === @<readonly>) {
    @error({start: asyncOrReadOnlyToken, end: asyncOrReadOnlyToken + 8/*'readonly'.length*/}, "'{0}' modifier can only appear on a property declaration.", tokenToString(@<readonly>));
asyncOrReadOnly = asyncOrReadOnlyToken = undefined;
}