
@TypeNode // 类型节点
	let result = @UnaryOrPrimaryTypeNode(allowIn);
	while (getPrecedence(@peek) >= precedence) {
		result = @BinaryOrCallTypeNode(result, allowIn);
	}
	return result;

	BinaryOrPrimaryTypeNode(precedence: Precedence) // 联合或交错或独立类型节) {
				UnionTypeNode // 

			}
		}
		@BinaryTypeNode(%) // 双目表达式(x + y、x = y、...)
			left: TypeNode // 左值部分
			operator:TokenType // 当前运算的类型。合法的值有：,、*=、/=、%=、+=、‐=、<<=、>>=、>>>=、&=、^=、|=、**=、||、&&、|、^、&、==、!=、===、!==、<、>、<=、>=、instanceof、in、<<、>>、>>>、+、-、*、/、%、** 
			right: TypeNode(getPrecedence(result.operator) + (isRightHandOperator(result.operator) ? 0 : 1), allowIn)

	UnaryOrPrimaryTypeNode // 单目或独立类型节*
		
	*FunctionOrParenthesizedTypeNode // 函数或括号类型节点
		const parameters = @tryParseParameters();
		if (parameters) {
			return @FunctionTypeNode(undefined, parameters);
		}
		return @ParenthesizedTypeNode();

	FunctionTypeNode(., .) // 函数类型节点(`()=>void`)
		TypeParameters[opt] Parameters[opt] => TypeNode

	ConstructorType // 构造函数类型节点(`new () => void`)。
		new TypeParameters[opt] Parameters => return:TypeNode

		@TypeParameters(result) // 类型参数列表
			typeParameters: < TypeParameterDeclaration,... >
			
			@TypeParameterDeclaration // 类型参数声明(`T`、`T extends R`)
				name: Identifier
				?extends 
				?extends: TypeNode

				const result = new nodes.TypeParameterDeclaration();
				result.name = @Identifier(false);
				if (@peek === #extends#) {
					result.extendsToken = @read;
					result.extends = @TypeNode(Precedence.any)
				}
				return result;

		@Parameters(result) // 参数列表
			parameters: ( ParameterDeclaration... )

			@ParameterDeclaration // 参数声明(`x`、`x?: number`)
				?accessibility: #public#|#private#|#protected#
				?...
				name: BindingName
				??
				?TypeAnnotation
				?Initializer

				const result = new nodes.ParameterDeclaration();
				switch (@peek) {
					case @identifier:
						result.name = @Identifier(false);
						break;
					case #.#..:
						result.dotDotDotToken = @read;
						result.name = @Identifier(false);
						break;
					case #public#:
					case #private#:
					case #protected#:
						result.name = @Identifier(false);
						if (@isBindingName()) {
							result.accessibilityToken = @lexer.current.start;
							result.accessibility = @lexer.current.type;
							result.name = @BindingName();
						}
						break;
					default:
						result.name = @BindingName();
						break;
				}
				if (@peek === #?#) result.questionToken = @read;
				@TypeAnnotation(result);
				@Initializer(result);
				return result;

			@TypeAnnotation(result) // 类型注解
				:
				typeNode: TypeNode(Precedence.any)

			@Initializer(result) // 初始值
				=
				initializer: Expression(Precedence.assignment, true)

			@BindingName = Identifier | ArrayBindingPattern | ObjectBindingPattern// 绑定名称(`xx`, `[xx]`, `{x: x}`)

				@ArrayBindingPattern // 数组绑定模式项(`[xx]`)
					elements: ArrayBindingElement,...

					@ArrayBindingElement // 数组绑定模式项(`x`)
						?...
						?value: BindingName
						?Initializer

				@ObjectBindingPattern // 对象绑定模式项(`{x: x}`)
					elements: ObjectBindingElement,...

					@ObjectBindingElement // 对象绑定模式项(`x`)
						?...
						key: PropertyName,
						?:
						value: BindingName
						?Initializer

			@PropertyName = Identifier | NumericLiteral | StringLiteral | ComputedPropertyName // 属性名称(`xx`、`"xx"`、`0`、`[xx]`)
				switch (@peek) {
					case #identifier#:
						return @Identifier(false);
					case #stringLiteral#:
						return @StringLiteral();
					case #numericLiteral#:
						return @NumericLiteral();
					case #[#:
						return @ComputedPropertyName();
						@ComputedPropertyName // 已计算的属性名(`[1]`)
							[ 
							body: Expression(Precedence.assignment, true) 
							]
					default:
						if (@isKeyword(@peek)) {
							return @Identifier();
						}
						@error(@peek, "应输入属性名。");
						return @ErrorExpression(); // TODO
				}

@Expression(precedence: Precedence/*允许解析的最低操作符优先级*/, allowIn: boolean/*是否允许解析 in 表达式*/) @abstract // 表达式
	let result: nodes.Expression;
	switch (@peek) {
		case #identifier#: // x => y、x<T>、x
			result = @ArrowFunctionOrGenericExpressionOrIdentifier();
			break;

			@ArrowFunctionOrGenericExpressionOrIdentifier // 箭头或泛型表达式或标识符
				let result = @Identifier(false);
				switch (@peek) {
					case #=>#:
						result = @ArrowFunctionExpression(undefined, undefined, result);
						break;
					case #<#:
						const savedState = @stashSave();
						const arguments = @TypeArguments();
						if (@current === #>#) {
							@stashClear(savedState);
							result = @GenericExpression(result, arguments);
						} else {
							@stashRestore(savedState);
						}
						break;
				}
				return result;

				@GenericExpression(*, *) // 泛型表达式(`value<number>`)
					target: Identifier // 目标部分
					typeArguments: TypeArguments 

				@Identifier(allowKeyword: boolean) // 标识符(`x`)
					value: <identifier> // 值部分
					
					if (isIdentifierName(@peek)) {
						const result = new nodes.Identifier();
						result.start = @read;
						result.value = @lexer.current.value;
						result.end = @lexer.current.end;
						return result;
					}

					@error(@lexer.peek(), isKeyword(@peek) ? "Identifier expected. '{0}' is a keyword." : "Identifier expected.", getTokenName(@peek));
					return @ErrorIdentifier();

		case #this#:
		case #null#:
		case #true#:
		case #false#:
		case #super#:
			result = @SimpleLiteral();
			break;

			@SimpleLiteral // 简单字面量(`null`、`true`、`false`、`this`、`super`)
				type: #this#|#null#|#true#|#false#|#super# // 类型

		case #(#: // (x) => ...、(x)
			result = @ArrowFunctionOrParenthesizedExpression();
			break;

			@ArrowFunctionOrParenthesizedExpression // 括号或箭头表达式
				const savedState = @stashSave();
				const parameters = @Parameters();
				return @peek === #=># || @peek === #:# ? @ArrowFunctionLiteral(undefined, undefined, parameters, allowIn) : @ParenthesizedExpression();

				@ArrowFunctionExpression(*, *, *, allowIn: boolean) // 箭头函数表达式(`x => xx`)。
					?modifiers: Modifiers
					?typeParameters: TypeParameters
					?parameters: ParameterDeclarations | Identifier // 参数部分
					?TypeAnnotation
					=> 
					body: BlockStatement | Expression = @peek === #{# ? @BlockStatement() : @Expression(Precedence.assignment, allowIn)

				@ParenthesizedExpression // 括号表达式(`(x)`)
					(
					body: Expression(Precedence.any, true) // 主体部分
					)

		case #numericLiteral#:
			result = @NumericLiteral();
			break;

			@NumericLiteral // 数字字面量(`1`)
				value: <numericLiteral>

		case #stringLiteral#:
		case #noSubstitutionTemplateLiteral#:
			result = @StringLiteral();
			break;

			@StringLiteral // 字符串字面量(`'abc'`、`"abc"`、`\`abc\``)
				value: <stringLiteral>

		case #[#:
			result = @ArrayLiteral();
			break;

			@ArrayLiteral // 数组字面量(`[x, y]`)
				elements: [ ArrayLiteralElement,... ] // 所以元素
				@ArrayLiteralElement // 数组字面量元素(`x`)
					...?
					value?: Expression(Precedence.assignment, true)

		case #{#:
			result = @ObjectLiteral();
			break;

			@ObjectLiteral // 对象字面量(`{x: y}`)
				elements: { PropertyDefinition,... }

		case @function:
			result = @FunctionExpression(undefined);
			break;

		case @new:
			result = @NewTargetOrNewExpression();
			break;

			@NewTargetOrNewExpression // new.target 或 new 表达式
				const start = @expectToken(#new#);
				return @peek === #.# ? @NewTargetExpression(start) : @NewExpression(start);

				@NewTargetExpression(*) // new.target 表达式(`new.target`)
					new 
					.
					target

					const result = new nodes.NewTargetExpression();
					result.start = start;
					result.dotToken = @expectToken(#.#);
					if (@peek === #identifier# && @lexer.peek().data === "target") {
						result.end = @lexer.read().end;
					} else {
						@error(@lexer.current, "Expression expected.");
						result.end = @lexer.current.end;
					}
					return result;

				@NewExpression(*) : // new 表达式(`new x()`)。
					new
					target: Expression(Precedence.member, false) 
					?arguments: Arguments

		case #/#:
		case #/#=:	
			result = @RegularExpressionLiteral();
			break;

			@RegularExpressionLiteral // 正则表达式字面量(/abc/)
				value: <stringLiteral> 
				flags?: <stringLiteral> // 标志部分

				const result = new nodes.RegularExpressionLiteral();
				result.start = @lexer.readAsRegularExpressionLiteral().start;
				result.value = @lexer.current.data.pattern;
	        	result.flags = @lexer.current.data.flags;
	        	result.end = @lexer.current.end;
	        	return result;

		case #templateHead#:
			result = @TemplateLiteral();
			break;

			@TemplateLiteral // 模板字面量(`\`abc\``)
				spans: TemplateSpan | Expression... // 所有组成部分

				const result = new nodes.TemplateLiteral();
				result.spans = new nodes.NodeList<nodes.Expression>();
				while (true) {
					result.spans.push(@TemplateSpan());
					result.spans.push(@Expression());
					if (@peek !== #}#) {
		                @expectToken(#}#);
		                break;
		            }
		            if (@lexer.readAsTemplateMiddleOrTail().type === #templateTail#) {
		                result.spans.push(@TemplateSpan());
		                break;
		            }
				}
				return result;

				@TemplateSpan // 模板文本区块(`\`abc${`、`}abc${`、`}abc\``)
					value: <stringLiteral>

		case #<#: // <T> (p)=>{}、<T>fn
			result = @ArrowFunctionOrTypeAssertionExpression();
			break;

			@ArrowFunctionOrTypeAssertionExpression // 箭头函数或类型确认表达式
				const savedState = @stashSave();
				const typeParameters = @TypeParameters();
				const parameters = @peek === #(# ? @Parameters() : isIdentifierName(@peek) : @Identifier(false) : undefined;
				if (parameters && (@peek === #=># || @peek === #:#)) {
					@stashClear(savedState);
					return @ArrowFunctionExpression(undefined, typeParameters, parameters, allowIn);
				}
				@stashRestore(savedState);
				return @TypeAssertionExpression();

				@TypeAssertionExpression // 类型确认表达式(<T>xx)
					<
					type: TypeNode(Precedence.any)
					>
					operand: Expression(Precedence.postfix, false)

		case #yield#:
			result = @YieldExpression();
			break;

			@YieldExpression // yield 表达式(`yield xx`)) {
				yield 
				?*
				operand: Expression(Precedence.assignment, false)

				const result = new nodes.YieldExpression();
				result.start = @read;
				if (@sameLine && @peek === #*#) {
					result.asteriskToken = @read;
				}
				if (!@tryReadSemicolon(result)) {
					result.operand = @Expression(Precedence.assignment, false);
					@tryReadSemicolon(result);
				}
				return result;

		case #await#:
			result = @AwaitExpression();
			break;

			@AwaitExpression // wait 表达式(`await xx`)) {
				await 
				operand: Expression(Precedence.assignment, false)

				const result = new nodes.AwaitExpression();
				result.start = @read;
				if (!@tryReadSemicolon(result)) {
					result.operand = @Expression(Precedence.assignment, false);
					@tryReadSemicolon(result);
				}
				return result;

		case #class#:
			result = @ClassExpression();
			break;
			
		case #async#:
			result = @AsyncFunctionExpressionOrIdentifier(allowIn);
			break;

			@AsyncArrowFunctionOrIdentifier(allowIn: boolean) // 异步函数表达式或标识符
				const savedState = @stashSave();
				const modifiers = @Modifiers();
				const typeParameters = @sameLine && @peek === #<# ? @TypeParameters() : undefined;
				if (@sameLine && (@peek === #(# ||isIdentifierName(@peek))) {
					const parameters = @peek === #(# ? @Parameters() : @Identifier(false);
					if (@peek === #=># || @peek === #:#) {
						@stashClear(savedState);
						return @ArrowFunctionExpression(modifiers, typeParameters, parameters, allowIn);
					}
				}
				@stashRestore(savedState);
				return @Identifier(false);

		case #=>#:
			result = @ArrowFunctionExpression(undefined, undefined, undefined, allowIn);
			break;

		default:
			if (isUnaryOperator(@peek)) {
				result = @UnaryExpression();
				break;
			}
			if (isIdentifierName(@peek)) {
				result = @ArrowFunctionOrGenericExpressionOrIdentifier();
				break;
			}
			@error(@lexer.peek(), @peek === #)# || @peek === #]# || @peek === #}# || @peek === #># ? "Unexpected token '{0}'." : @isKeyword(@peek) ? "Expression expected. '{0}' is a keyword." : "Expression expected.", getTokenName(@peek));
			return @ErrorIdentifier();

			@UnaryExpression // 一元运算表达式(+x、typeof x、...)
				operator: #delete#|#void#|#typeof#|#+#|#-#|#~#|#!#|#++#|#--#
				operand: Expression(Precedence.postfix, false)

			@ErrorIdentifier // 错误的标识符
				const result = new nodes.ErrorIdentifier();
				result.start = @lexer.current.end;
				return result;

	}
	while (getPrecedence(@peek) >= precedence) {
		switch (@peek) {
			case #.#:
				result = @MemberCallExpression(result);
				continue;

				@MemberCallExpression(*) // 成员调用表达式(x.y)
					target: Expression // 目标部分
					. 
					argument: Identifier(true) // 参数部分

			case #=#:
				result = @BinaryExpression(result, allowIn);
				continue;

			case #(#:
				result = @FunctionCallExpression(result);
				continue;

				@FunctionCallExpression(*) // 函数调用表达式(x())
					target: Expression 
					arguments: CallArguments

					@CallArguments // 函数调用参数列表
						( CallArgument,... )

						@CallArgument // 函数调用参数(x)
							?...
							value: Expression(Precedence.assignment, true)

			case #[#:
				result = @IndexCallExpression(result);
				continue;

				@IndexCallExpression(*) // 索引调用表达式(x[y])
					target:Expression 
					[ 
					argument: Expression(Precedence.any, true)
					]

			case #?#:
				result = @ConditionalExpression(result);
				continue;

				@ConditionalExpression(*) // 条件表达式(`x ? y : z`)
					condition: Expression 
					? 
					then: Expression(Precedence.assignment, true) // 则部分 
					: 
					else: Expression(Precedence.assignment, allowIn) // 否则部分

			case #+#+:
			case #-#-:
				if (@sameLine) {
					result = @PostfixExpression(result);
					continue;
				}
				break;

				@PostfixExpression(*) // 后缀表达式(`x++`、`x--`)
					operand: Expression(Precedence.leftHandSide) // 操作数
					operator:: ++ | --

			case #noSubstitutionTemplateLiteral#:
				return @TemplateCallExpression(parsed, @StringLiteral());

			case #templateHead#:
				return @TemplateCallExpression(parsed, @TemplateLiteral());

				@TemplateCallExpression(*, *) // 模板调用表达式(`x\`abc\``)
					target: Expression 
					argument: TemplateLiteral | StringLiteral

			case #in#:
				if(allowIn === false) {
					break;
				}

				// 继续往下执行
			default:
				result = @BinaryExpression(result, allowIn);
				continue;

				@BinaryExpression(*, allowIn: boolean) // 双目表达式(x + y、x = y、...)
					left: Expression // 左值部分
					operator: #,#|#*=#|#/=#|#%=#|#+=#|#‐=#|#<<=#|##>=>|##>>=>|#&=#|#^=#|#|=#|#**=#|#||#|#&&#|#|#|#^#|#&#|#==#|#!=#|#===#|#!==#|#<#|##>|#<=#|##=>|#instanceof#|#in#|#<<#|##>>|##>>>|#+#|#-#|#*#|#/#|#%#|#**# // 运算类型
					right: Expression(getPrecedence(result.operator) + (isRightHandOperator(result.operator) ? 0 : 1), allowIn) // 右值部分
		}
	}
	return result;

@Statement // 语句
	switch (@peek) {
		case <identifier>: 
			return @LabeledOrExpressionStatement(@Identifier(false));

			@LabeledOrExpressionStatement(parsed: nodes.Expression) // 表达式或标签语句
				return parsed.constructor === nodes.Identifier && @peek === #:# ?
					@LabeledStatement(<nodes.Identifier>parsed) :
					@ExpressionStatement(parsed);

		        @LabeledStatement(*) // 标签语句(`x: ...`)
		        	??DocComment
		        	label: Identifier
		        	:
		        	statement: Statement // 主体部分

		        @ExpressionStatement(*) // 表达式语句(`x();`)
		        	expression: Expression // 表达式部分

		case #{#:
			return @BlockStatement();

			@BlockStatement: // 语句块(`{...}`)
				statements: { Statement... }

		case #var#:
		case #const#:
			return @VariableStatement(undefined);

			@VariableStatement(*): // 变量声明语句(`var x`、`let x`、`const x`)
				?Modifiers
				type: #var#|#let#|#const# 
				variables: VariableDeclaration,...

				@VariableDeclaration // 变量声明(`x = 1`、`[x] = [1]`、`{a: x} = {a: 1}`)
					mame: BindingName
					?TypeAnnotation
					?Initializer

		case #let#: 
			return @VariableOrExpressionStatement(true);

			@VariableOrExpressionStatement(allowIn: boolean) // 变量声明或表达式语句
				const savedToken = @lexer.current;
				@lexer.read();
				const isBindingName = @isBindingName(@peek);
				@lexer.current = savedToken;
				return isBindingName ?
					@VariableStatement(undefined) :
					@ExpressionStatement(@Expression(Precedence.any, allowIn));

		case #function#:
			return @FunctionDeclaration(undefined, undefined);

		case #if#:
			return @IfStatement();

			@IfStatement // if 语句(`if (x) ...`)
				if 
				Condition
				then: Statement = @EmabledStatement()
				?else 
				?else: Statement = @EmabledStatement()

				const result = new nodes.IfStatement();
		        result.start = @expectToken(#if#);
		        @Condition(result);
		        result.then = @EmbeddedStatement();
		        if (@peek === #else#) {
		            result.elseToken = @read;
		            result.else = @EmbeddedStatement();
		        }
		        return result;

			    @Condition(result) // 条件表达式
			    	?(
			    	condition: Expression(Precedence.any, true)
			    	?)

			    	if (@peek === #openParen#) {
			            result.openParanToken = @lexer.read().type;
			            result.condition = @allowInAnd(@Expression);
			            result.closeParanToken = @expectToken(#)#);
			        } else {
			            if (!@options.disallowMissingParenthese) {
			                @expectToken(#openParen#);
			            }
			            result.condition = @allowInAnd(@Expression);
			        }

        case #for#
            return @ForStatement();

            @ForOrForInOrForOfOrForToStatement // 
            	const start = @read;
		        const openParan = @peek === #(# ? @read : undefined;
		        if (openParan == undefined && !@options.disallowMissingParenthese) {
		            @expectToken(#(#);
		        }
		        const initializer = @peek === #;# ? undefined : @VariableOrExpressionStatement(false);
		        let type = @peek;
		        switch (type) {
		            case #;#:
		            case #in#:
		                break;
		            case #of#:
		                if (@options.disallowForOf) type = #;#;
		                break;
		            case #to#:
		                if (@options.disallowForTo) type = #;#;
		                break;
		            default:
		                type = #;#;
		                break;
		        }

		        let result: nodes.ForStatement | nodes.ForInStatement | nodes.ForOfStatement | nodes.ForToStatement;
		        switch (type) {
		            case #;#:
		                result = new nodes.ForStatement();
		                (<nodes.ForStatement>result).firstSemicolonToken = @expectToken(#;#);
		                if (@peek !== #;#) {
		                    result.condition = @allowInAnd(@Expression);
		                }
		                (<nodes.ForStatement>result).secondSemicolonToken = @expectToken(#;#);
		                if (openParan != undefined ? @peek !== #)# : isExpressionStart(@peek)) {
		                    (<nodes.ForStatement>result).iterator = @allowInAnd(@Expression);
		                }
		                break;
		            case #in#:
		                result = new nodes.ForInStatement();
		                (<nodes.ForInStatement>result).inToken = @read;
		                result.condition = @allowInAnd(@Expression);
		                break;
		            case #of#:
		                result = new nodes.ForOfStatement();
		                (<nodes.ForOfStatement>result).ofToken = @read;
		                result.condition = @options.disallowForOfCommaExpression ? @allowInAnd(@AssignmentExpressionOrHigher) : @allowInAnd(@Expression);
		                break;
		            case #to#:
		                result = new nodes.ForToStatement();
		                (<nodes.ForToStatement>result).toToken = @read;
		                result.condition = @allowInAnd(@Expression);
		                break;
		        }

		        result.start = start;
		        if (initializer) {
		            result.initializer = initializer;
		        }
		        if (openParan != undefined) {
		            result.openParanToken = openParan;
		            result.closeParanToken = @expectToken(#)#);
		        }
		        result.body = @EmbeddedStatement();
		        return result;

		        @ForStatement // for 语句(`for(var i = 0; i < 9; i++) ...`)
		        	for
		        	?(
		        	initializer: VariableStatement | ExpressionStatement
		        	firstSemicolon: <;> // 条件部分中首个分号
		        	expression: Expression
		        	secondSemicolon: <;> // 条件部分中第二个分号
		        	?)
		        	statement: Statement

		        @ForInStatement // for..in 语句(`for(var x in y) ...`)
		        	for
		        	?(
		        	initializer: VariableStatement
		        	in
		        	expression: Expression
		        	?)
		        	statement: Statement

		        @ForOfStatement // for..of 语句(`for(var x of y) ...`)
		        	for
		        	?(
		        	initializer: VariableStatement
		        	of
		        	expression: Expression
		        	?)
		        	statement: Statement

		        @ForToStatement // for..to 语句(`var x = 0 to 10) ...`)
		        	for
		        	?(
		        	initializer: VariableStatement
		        	to
		        	expression: Expression
		        	?)
		        	statement: Statement

        case #while#
            return @WhileStatement();

            @WhileStatement // while 语句(`while(x) ...`)
            	while
            	Condition
            	statement: Statement

        case #switch#
            return @SwitchStatement();

            @SwitchStatement // switch 语句(`switch(x) {...}`)

            	const result = new nodes.SwitchStatement();
		        result.start = @read;
		        if (!@options.disallowMissingSwitchCondition || @peek !== #openBrace#) {
		            @Condition(result);
		        }
		        result.cases = new nodes.NodeList<nodes.CaseClause>();
		        result.cases.start = @expectToken(#openBrace#);
		        while (true) {
		            switch (@peek) {
		                case #case#:
		                case #default#:
		                    break;
		                case #closeBrace#:
		                    result.cases.end = @lexer.read().end;
		                    return result;
		                default:
		                    @error(@lexer.peek(), "应输入“case”或“default”。");
		                    result.cases.end = @lexer.current.end;
		                    return result;
		            }

		            const caseCaluse = new nodes.CaseClause();
		            caseCaluse.start = @read;
		            if (@lexer.current.type === #case#) {
		                if (!@options.disallowCaseElse && @peek === #else#) {
		                    caseCaluse.elseToken = @read;
		                } else {
		                    caseCaluse.label = @allowInAnd(@Expression);
		                }
		            }
		            caseCaluse.colonToken = @expectToken(#colon#);
		            caseCaluse.statements = new nodes.NodeList<nodes.Statement>();
		            while (true) {
		                switch (@peek) {
		                    case #case#:
		                    case #default#:
		                    case #closeBrace#:
		                    case #endOfFile#:
		                        break;
		                    default:
		                        caseCaluse.statements.push(@Statement());
		                        continue;
		                }
		                break;
		            }
		            result.cases.push(caseCaluse);
		        }

        case #do#
            return @DoWhileStatement();

            @DoWhileStatement // do..while 语句(`do ... while(x);`)
            	do
            	statement: Statement
            	while
            	Condition
            	?;

        case #break#
            return @BreakStatement();

            @BreakStatement // break 语句(`break xx;`)
		        break
		        ?label: Identifier(false)
		        ?;

		        const result = new ndoes.ContinueStatement();
		        @BreakOrContinueStatement(result, #continue#);
		        return result;
            
        case #continue#
            return @ContinueStatement();

            @ContinueStatement // continue 语句(`continue xx;`)
		        continue
		        ?label: Identifier(false)
		        ?;

		        const result = new ndoes.ContinueStatement();
		        @BreakOrContinueStatement(result, #continue#);
		        return result;

		    @BreakOrContinueStatement(result: nodes.ContinueStatement, token: TokenType) // break 或 continue语句
		    	result.start = @expectToken(token);
		    	if (!@tryReadSemicolon(result)) {
		    		result.label = @Identifier(false);
		    		@tryReadSemicolon(result);
		    	}
		    	
        case #return#
            return @ReturnStatement();

            @ReturnStatement // return 语句(`return x;`)
            	return
            	?expression: Expression

            	const result = new nodes.ReturnStatement();
		        result.start = @expectToken(#return#);
		        if (@options.useStandardSemicolonInsertion ? !@hasSemicolon() : isExpressionStart(@peek)) {
		            result.value = @allowInAnd(@Expression);
		        }
		        result.end = @tryReadSemicolon();
		        return result;

        case #throw#
            return @ThrowStatement();

            ThrowStatement // throw 语句(`throw x;`)
            	throw
            	?expression: Expression

            	const result = new nodes.ThrowStatement();
			    result.start = @read;
			    if (@options.useStandardSemicolonInsertion ? !@hasSemicolon() : isExpressionStart(@peek)) {
			        result.value = @allowInAnd(@Expression);
			    } else if (@options.disallowRethrow) {
			        @error({ start: @lexer.current.end, end: @lexer.current.end }, "应输入表达式。");
			    }
			    result.end = @tryReadSemicolon();
			    return result;

        case #try#
            return @TryStatement();

            @TryStatement // try 语句(`try {...} catch(e) {...}`)
            	try
            	try: Statement
            	catch: CatchClause
            	finally: FinallyClause

                const result = new nodes.TryStatement();
		        result.start = @read;
		        result.try = @TryClauseBody();
		        if (@peek === #catch#) {
		            result.catch = new nodes.CatchClause();
		            result.catch.start = @read;
		            if (@peek === #openParen#) {
		                result.catch.openParanToken = @read;
		                result.catch.variable = @BindingName();
		                result.catch.openParanToken = @expectToken(#)#);
		            } else if (!@options.disallowMissingParenthese && @isBindingName()) {
		                result.catch.variable = @BindingName();
		            } else if (@options.disallowMissingCatchVaribale) {
		                @expectToken(#openParen#);
		            }
		            result.catch.body = @TryClauseBody();
		        }
		        if (@peek === #finally#) {
		            result.finally = new nodes.FinallyClause();
		            result.finally.start = @read;
		            result.finally.body = @TryClauseBody();
		        }
		        if (@options.disallowSimpleTryBlock && !result.catch && !result.finally) {
		            @error(@lexer.peek(), "应输入“catch”或“finally”");
		        }
		        return result;

		        @TryClauseBody // try 语句的语句块
		        	if (!@options.disallowMissingTryBlock) {
			            return @EmbeddedStatement();
			        }
			        if (@peek === #openBrace#) {
			            return @BlockStatement();
			        }
			        const result = new nodes.BlockStatement();
			        result.statements = new nodes.NodeList<nodes.Statement>();
			        result.statements.start = @expectToken(#openBrace#);
			        const statement = @Statement();
			        result.statements.push(statement);
			        result.statements.end = statement.end;
			        return result;

		        @CatchClause // catch 分句(`catch(e) {...}`)
		        	catch
		        	?(
		        	variable: BindingName
		        	?)
		        	statement: Statement

		        @FinallyClause // catch 分句(`finally {...}`)
		        	finally
		        	statement: Statement

        case #debugger#
            return @DebuggerStatement();

            @DebuggerStatement // debugger 语句(`debugger;`)
            	debugger
            	?;

		case #;#:
			return @EmptyStatement();

			@EmptyStatement // 空语句(`;`)
				;

        case #endOfFile#
            return @ErrorStatement();
        case #with#
            return @WithStatement();

            @WithStatement // with 语句(`with(x) ...`)
            	with
            	expression: Expression
            	const result = new nodes.WithStatement();
		        result.start = @read;
		        if (@peek === #openParen#) {
		            result.openParanToken = @read;
		            result.value = !@options.disallowWithVaribale && @isVariableStatement() ?
		                @allowInAnd(@VariableStatement) :
		                @allowInAnd(@Expression);
		            result.closeParanToken = @expectToken(#)#);
		        } else {
		            if (@options.disallowMissingParenthese) {
		                @expectToken(#openParen#);
		            }
		            result.value = !@options.disallowWithVaribale && @isVariableStatement() ?
		                @allowInAnd(@VariableStatement) :
		                @allowInAnd(@Expression);
		        }
		        result.body = @EmbeddedStatement();
		        return result;
		case #class#:
			return @ClassDeclaration(undefined, undefined);

		case #import#:
			return @ImportAssignmentOrImportDeclaration();

		case #export#:
			return @ExportAssignmentOrExportDeclaration();

		default:
			if (isDeclarationStart(@peek)) {
				return @DeclarationOrExpressionStatement();
			}
			return @ExpressionStatement(@Expression(Precedence.any, true));
			
	}

	@tryReadSemicolon(result) // todo


				@ObjectLiteralElement // 对象字面量元素(`x: y`)
					key: PropertyName 
					?: 
					?value: Expression(Precedence.assignment, true)
					const result = new nodes.ObjectLiteralElement();
					result.key = @PropertyName();
					if(@peek === #:#) {
						result.colonToken = @read();
						result.value = @Expression(Precedence.assignment, true);
					} else if(result.key.constructor !== nodes.Identifier && result.key.constructor !== nodes.MemberCallExpression) {
						@expectToken(#:#);
					}
					return result;
					
			@ArrowExpression(allowIn: boolean): // 箭头表达式
				=>
				body: Expression(Precedence.assignment, allowIn)

@Declaration @extends(Statement) // 声明

	@FunctionDeclarationOrExpression(result: nodes.FunctionDeclaration | nodes.FunctionExpression/* 解析的目标节点 */, modifiers: nodes.NodeList<nodes.Modifier>) // 函数声明或表达式
		@DocComment(result);
		if (modifiers) result.modifiers = modifiers;
		result.functionToken = @expectToken(#function#);
		if (@peek === #*#) result.asteriskToken = @read;
		if (isIdentifierName(@peek)) result.name = @Identifier(false);
		@TypeParameters(result);
		@Parameters(result);
		@TypeAnnotation(result);
		@FunctionBody(result);

		@FunctionDeclaration(*, *) // 函数声明(`function fn() {...}`、`function *fn() {...}`)
			??DocComment
			?Decorators
			?Modifiers
			function
			?*
			?name: Identifier
			?TypeParameters
			Parameters
			?TypeAnnotation
			?FunctionBody

			const result = new nodes.FunctionDeclaration();
			if (decorators) result.decorators = decorators;
			@FunctionDeclarationOrExpression(result, modifiers);
			return result;

		@FunctionExpression(*) // 函数表达式(`function () {}`)
			??DocComment
			?Modifiers
			function
			?* 
			?name: Identifier
			?TypeParameters
			Parameters
			?TypeAnnotation
			?FunctionBody

			const result = new nodes.FunctionDeclaration();
			@FunctionDeclarationOrExpression(result, modifiers);
			return result;

		@FunctionBody(result) // 函数主体(`{...}`、`=> xx`、`;`)
			?=>
			?body: BlockStatement | Expression
			?;

			switch (@peek) {
				case #{#:
					result.body = @BlockStatement();
					break;
				case #=>#:
					result.arrowToken = @read;
					result.body = @Expression(Precedence.assignment, true);
					break;
				default:
					@tryReadSemicolon(result);
					break;
			}

	@ClassDeclarationOrExpression(result: nodes.ClassDeclaration | nodes.ClassExpression) // 类声明或类表达式
		@DocComment(result);
		result.classToken = @expectToken(#class#);
		if (isIdentifierName(@peek) && @peek !== #extends# && @peek !== #implements#) result.name = @Identifier(false);
		@TypeParameters(result);
		@ExtendsClause(result);
		@ImplementsClause(result);
		@ClassBody(result);

		@ClassDeclaration(*, *) // 类声明(`class xx {}`)
			??DocComment
			?Decorators
			?Modifiers
			class 
			name?: Identifier
			?TypeParameters
			?ExtendsClause
			?ImplementsClause
			?ClassBody

			const result = new nodes.ClassDeclaration();
			if (decorators) result.decorators = decorators;
			if (modifiers) result.modifiers = modifiers;
			@ClassDeclarationOrExpression(result);
			return result;

		@ClassExpression // 类表达式(`class xx {}`)
			??DocComment
			class 
			name?: Identifier
			?TypeParameters
			?ExtendsClause
			?ImplementsClause
			?ClassBody

			const result = new nodes.ClassExpression();
			@ClassDeclarationOrExpression(result);
			return result;

		@ExtendsClause(result) // extends 分句(`extends xx`)
			extends
			extends: Expression(Precedence.leftHandSide, false),...
			
		@ImplementsClause(result) // implements 分句(`implements xx`)
			implements
			implements: Expression(Precedence.leftHandSide, false),...

		@ClassBody(result) // 类主体(`{...}`、`;`)
			?members: { ClassElement... }
			?;

			if (@peek === #{#) {
				result.members = @NodeList(@ClassElement, #{#, #}#);
			} else {
				@tryReadSemicolon(result);
			}

			@ClassElement @alias(MethodDeclaration | PropertyDeclaration | AccessorDeclaration) // 类成员
				const decorators = @Decorators();
				const modifiers = @Modifiers();
				switch (@peek) {
					case #identifier#:
						break;
					case #get#:
					case #set#:
						const savedToken = @lexer.current;
						@lexer.read();
						if (isKeyword(@peek) || @peek === #[#) {
							return @AccessorDeclaration(decorators, modifiers, savedToken.type === #get# ? savedToken.start : undefined, savedToken.type === #set# ? savedToken.start : undefined : undefined);
						}
						@lexer.current = savedToken;
						break;
					case #*#:
						return @MethodDeclaration(decorators, modifiers, @read, @PropertyName());
				}
				const name = @PropertyName();
				switch (@peek) {
					case #(#:
					case #<#:
						return @MethodDeclaration(decorators, modifiers, undefined, name);
					default:
						return @PropertyDeclaration(decorators, modifiers, name);
				}

				@MethodDeclaration(*, *, *, *) // 方法声明(`x() {...}`)
					??DocComment
					?Decorators
					?Modifiers
					?*
					?name: PropertyName
					?TypeParameters
					Parameters
					?TypeAnnotation
					?FunctionBody

				@PropertyDeclaration(*, *, *) // 属性声明(`x: number`)
					??DocComment
					?Decorators
					?Modifiers
					name: PropertyName
					?TypeAnnotation
					?Initializer

				@AccessorDeclaration(*, *, *, *) // 访问器声明(`get x() {...}`、`set x(value) {...}`)
					??DocComment
					?Decorators
					?Modifiers
					?get
					?set
					name: PropertyName
					Parameters
					?TypeAnnotation
					?FunctionBody

	@InterfaceDeclaration(*, *) // 接口声明(`interface T {...}`)
		??DocComment
		?Decorators
		?Modifiers
		interface
		name: Identifier(false)
		?TypeParameters
		?ExtendsClause
		members: ObjectTypeNode

	@EnumDeclaration(*, *) // 枚举声明(`enum T {}`)
		??DocComment
		?Decorators
		?Modifiers
		enum
		name: Identifier(false)
		?ExtendsClause
		members: { EnumMemberDeclaration,... }

		@EnumMemberDeclaration // 枚举成员声明(`x`、`x = 1`)
			name: PropertyName
			?Initializer

	@NamespaceOrModuleDeclaration(result: nodes.NamespaceDeclaration | nodes.ModuleDeclaration, decorators: nodes.NodeList<nodes.Decorator>, modifiers: nodes.NodeList<nodes.Modifier>, type: TokenType) // 命名空间或模块声明
		@DocComment(result);
		if (decorators) result.decorators = decorators;
		if (modifiers) result.modifiers = modifiers;
		result.start = @expectToken(type);
		result.names = @NodeList(() => @Identifier(false), undefined, undefined, #.#);
		@ExtendsClause(result);
		@BlockBody(result);

		@NamespaceDeclaration(*, *) // 命名空间声明(`namespace T {}`)
			??DocComment
			?Decorators
			?Modifiers
			namespace
			names: Identifier(false)....
			?BlockBody

			const result = new nodes.NamespaceDeclaration();
			@NamespaceOrModuleDeclaration(result, decorators, modifiers, <namespace>);
			return result;

		@ModuleDeclaration(*, *) // 模块声明(`module T {}`)
			??DocComment
			?Decorators
			?Modifiers
			module
			names: Identifier(false)....
			?BlockBody

			const result = new nodes.ModuleDeclaration();
			@NamespaceOrModuleDeclaration(result, decorators, modifiers, <module>);
			return result;

		@BlockBody(result) // 语句块主体(`{...}`)
			statements: { Statement... }

	@ExtensionDeclaration(*, *) // 扩展声明(`extends T {}`)
		?Decorators
		?Modifiers
		extends
		type: TypeNode(Precedence.any)
		?ExtendsClause
		?ImplementsClause
		?ClassBody

	@DeclarationOrExpressionStatement // 声明或表达式语句
		const savedState = @stashSave();
		const decorators = @Decorators();
		const modifiers = @Modifiers();
		switch (@peek) {
			case #function#:
				@stashClear(savedState);
				return @FunctionDeclaration(decorators, modifiers);
			case #class#:
				@stashClear(savedState);
				return @ClassDeclaration(decorators, modifiers);
			case #interface#:
				@stashClear(savedState);
				return @InterfaceDeclaration(decorators, modifiers);
			case #enum#:
				@stashClear(savedState);
				return @EnumDeclaration(decorators, modifiers);
			case #namespace#:
				@stashClear(savedState);
				return @NamespaceDeclaration(decorators, modifiers);
			case #module#:
				@stashClear(savedState);
				return @ModuleDeclaration(decorators, modifiers);
			case #extends#:
				@stashClear(savedState);
				return @ExtensionDeclaration(decorators, modifiers);
			default:
				@stashRestore(savedState);
				return @ExpressionStatement();
		}

	@Decorators // 修饰器列表
		decorators: Decorator...  // 修饰器列表
		
		@Decorator // 修饰器(`@x`)
			#@#
			body: Expression(Precedence.leftHandSide, false)

	@Modifiers // 修饰符列表
		modifiers: Modifier...

		let result: nodes.NodeList<nodes.Modifier>;
		while (isModifier(@peek)) {
			const savedToken = @lexer.current;
			const modifier = @Modifier();
			switch (modifier.type) {
				case #export#:
					if (!result) result = new nodes.NodeList<nodes.Modifier>();
					result.push(modifier);
					if (@peek === #default#) {
						result.push(@Modifier());
					}
					continue;
				case #const#:
					if (@peek === #enum#) {
						if (!result) result = new nodes.NodeList<nodes.Modifier>();
						result.push(modifier);
						continue;
					}
					break;
				default:
					if (@sameLine) {
						if (!result) result = new nodes.NodeList<nodes.Modifier>();
						result.push(modifier);
						continue;
					}
					break;
			}
			@lexer.current = savedToken;
			break;
		}
		return result;

		@Modifier // 修饰符(`static`、`private`、...)
			type: #export#|#default#|#declare#|#const#|#static#|#abstract#|#readonly#|#async#|#public#|#protected#|#private#

	@ImportAssignmentOrImportDeclaration // import 赋值或 import 声明
		const start = @read;
		const imports = @NodeList(@ImportClause, undefined, undefined, #,#);
		if (@peek === #=# && imports.length === 1 && imports[0].constructor === nodes.SimpleImportClause && (<nodes.SimpleImportClause>imports[0]).name == null) {
			return @ImportAssignmentDeclaration(start, (<nodes.SimpleImportClause>imports[0]).variable);
		}
		return @ImportDeclaration(start, imports);

		@ImportAssignmentDeclaration(*, *) // import 赋值声明
			import
			variable: Identifier // 别名
			=
			value: Expression(Precedence.assignment, true)
			?;

		@ImportDeclaration(*, *) // import 声明(`import x from '...';`)
			import
			?names: ImportClause,...
			?from = imports ? @expectToken(@from) : undefined
			target: StringLiteral // 导入模块名
			?;

			const result = new nodes.ImportDeclaration();
			if (names) {
				result.names = names;
				result.from = @expectToken(#from#);
			}
			result.target = @StringLiteral();
			return result;

			@ImportClause @alias(SimpleImportOrExportClause | NamespaceImportClause | NamedImportClause) // import 分句(`x`、`{x}`、...)
				switch (@peek) {
					case #identifier#:
						return @SimpleImportOrExportClause(true);
					case #*#:
						return @NamespaceImportClause();
					case #{#:
						return @NamedImportClause();
					default:
						return @SimpleImportOrExportClause(true);
				}

				@SimpleImportOrExportClause(importClause: boolean/* 解析 import 分句*/) // 简单导入或导出分句(`x`、`x as y`)
					?name: Identifier(true) // 导入或导出的名称
					?as 
					variable: Identifier // 导入或导出的变量

					const result = new nodes.SimpleImportOrExportClause();
					const nameOrVariable = @Identifier(true);
					if (@peek === @as) {
						result.name = nameOrVariable;
						result.asToken = @read;
						result.variable = @Identifier(!importClause);
					} else {
						if (importClause && !isIdentifierName(@current)) {
							@error(@lexer.current, "Identifier expected. '{0}' is a keyword.", getTokenName(@current));
						}
						result.variable = nameOrVariable;
					}
					return result;

				@NamespaceImportClause // 命名空间导入分句(* as d)
					*
					as
					variable: Identifier(false)

				@NamedImportClause // 对象导入分句(`{x, x as y}`)
					{ SimpleImportClause,... }

	@ExportAssignmentOrExportDeclaration // export 赋值或 export 声明
		const savedState = @lexer.current;
		const start = @read;
		switch (@peek) {
			case #function#:
				@lexer.current = savedState;
				return @FunctionDeclaration(undefined, @Modifiers());
			case #class#:
				@lexer.current = savedState;
				return @ClassDeclaration(undefined, @Modifiers());
			case #interface#:
				@lexer.current = savedState;
				return @InterfaceDeclaration(undefined, @Modifiers());
			case #enum#:
				@lexer.current = savedState;
				return @EnumDeclaration(undefined, @Modifiers());
			case #namespace#:
				@lexer.current = savedState;
				return @NamespaceDeclaration(undefined, @Modifiers());
			case #module#:
				@lexer.current = savedState;
				return @ModuleDeclaration(undefined, @Modifiers());

			case #var#:
			case #let#:
			case #const#:
				@lexer.current = savedState;
				return @VariableStatement(@Modifiers());

			case #*#:
				return @ExportNamespaceDeclaration(start);

				@ExportNamespaceDeclaration(*) // 导出列表声明(`export * from ...`)
					export
					*
					from
					target: StringLiteral // 导入模块名
					?;

			case #{#:
				return @ExportListDeclaration(start);

				@ExportListDeclaration(*) // 导出列表声明(`export a from ...`)
					export
					names: { SimpleImportOrExportClause... } = @NodeList(@SimpleImportOrExportClause, #{#, #}#, #,#)
					from
					target: StringLiteral // 导入模块名
					?;

			case #=#:
				return @ExportAssignmentDeclaration(start);

				@ExportAssignmentDeclaration(*) // 导出赋值声明(`export = 1;`)
					export
					=
					value: Expression(Precedence.assignment, true)
					?;
					
			default:
				@error(@peek, "Declaration or statement expected.");
				return @toExpressionStatement(@Identifier(true));
		}

@DocComment(result) // 文档注释
	
TealScript 语法规范
================================================================

词法
----------------------------------------------------------------

SourceCharacter ::
	[any Unicode code point]

InputElementDiv :: 
	WhiteSpace
	LineTerminator
	Comment
	CommonToken
	DivPunctuator
	RightBracePunctuator

InputElementRegExp :: 
	WhiteSpace
	LineTerminator
	Comment
	CommonToken
	RightBracePunctuator
	RegularExpressionLiteral

InputElementRegExpOrTemplateTail ::
	WhiteSpace
	LineTerminator
	Comment
	CommonToken
	RegularExpressionLiteral
	TemplateSubstitutionTail

InputElementTemplateTail ::
	WhiteSpace
	LineTerminator
	Comment
	CommonToken
	DivPunctuator
	TemplateSubstitutionTail

WhiteSpace ::
	<TAB>
	<VT>
	<FF>
	<SP>
	<NBSP>
	<ZWNBSP>
	<USP>

LineTerminator ::
	<LF>
	<CR>
	<LS>
	<PS>

LineTerminatorSequence ::
	<LF>
	<CR> [lookahead ≠ <LF> ]
	<LS>
	<PS>
	<CR> <LF>

Comment ::
	MultiLineComment
	SingleLineComment

MultiLineComment ::
	/* MultiLineCommentChars[opt] */

MultiLineCommentChars ::
	MultiLineNotAsteriskChar MultiLineCommentChars[opt]
	*	PostAsteriskCommentChars[opt]

PostAsteriskCommentChars ::
	MultiLineNotForwardSlashOrAsteriskChar MultiLineCommentChars[opt]
	*	PostAsteriskCommentChars[opt]

MultiLineNotAsteriskChar ::
	SourceCharacter [but not] *

MultiLineNotForwardSlashOrAsteriskChar ::
	SourceCharacter [but not] [one of] / [or] *

SingleLineComment ::
	// SingleLineCommentChars[opt]

SingleLineCommentChars ::
	SingleLineCommentChar SingleLineCommentChars[opt]

SingleLineCommentChar ::
	SourceCharacter [but not] LineTerminator

CommonToken ::
	IdentifierName Punctuator
	NumericLiteral
	StringLiteral
	Template

IdentifierName ::
	IdentifierStart
	IdentifierName IdentifierPart

IdentifierStart ::
	UnicodeIDStart
	$
	_
	\ UnicodeEscapeSequence

IdentifierPart ::
	UnicodeIDContinue
	$
	_
	\ UnicodeEscapeSequence
	<ZWNJ>
	<ZWJ> 	11.6

UnicodeIDStart ::
	[any Unicode code point with the Unicode property “ID_Start” or “Other_ID_Start”]

UnicodeIDContinue ::
	[any Unicode code point with the Unicode property “ID_Continue”, “Other_ID_Continue”, or “Other_ID_Start”]

ReservedWord ::
	Keyword
	FutureReservedWord
	NullLiteral
	BooleanLiteral

Keyword :: [one of]
	break 		do  		in  		typeof
	case 		else 		instanceof  var
	catch 		export  	new 		void
	class  		extends 	return 		while
	const 		finally 	super 		with
	continue 	for 		switch 		yield
	debugger  	function 	this
	default 	if 			throw
	delete 		import 		try

FutureReservedWord :: [one of]
	enum  		await[remark]
	implements 	package 	protected
	interface 	private 	public

Punctuator :: [one of]
	{	} 	( 	) 	[ 	]
	.	; 	, 	< 	> 	<=
	>= 	== 	!= 	=== 	!==
	+ 	- 	* 	% 	++ 	--
	<< 	>> 	>>> 	& 	| 	^
	! 	~ 	&& 	|| 	? 	:
	= 	+= 	-= 	*= 	%= 	<<=
	>>= 	>>>= 	&= 	|= 	^= 	=>

DivPunctuator :: [one of]
	/
	/=

RightBracePunctuator :: [one of]
	}

NullLiteral ::
	null

BooleanLiteral ::
	true
	false

NumericLiteral ::
	DecimalLiteral
	BinaryIntegerLiteral
	OctalIntegerLiteral
	HexIntegerLiteral

DecimalLiteral ::
	DecimalIntegerLiteral . DecimalDigits[opt] ExponentPart[opt]
	. DecimalDigits ExponentPart[opt]
	DecimalIntegerLiteral ExponentPart[opt]

DecimalIntegerLiteral ::
	0
	NonZeroDigit DecimalDigits[opt]

DecimalDigits ::
	DecimalDigit
	DecimalDigits DecimalDigit

DecimalDigit :: [one of]
	0	1  2  3  4  5  6  7  8  9

NonZeroDigit :: [one of]
	1	2  3  4  5  6  7  8  9

ExponentPart ::
	ExponentIndicator SignedInteger

ExponentIndicator :: [one of]
	e  E

SignedInteger ::
	DecimalDigits
	+ DecimalDigits
	- DecimalDigits

BinaryIntegerLiteral ::
	0b BinaryDigits
	0B BinaryDigits

BinaryDigits ::
	BinaryDigit
	BinaryDigits BinaryDigit

BinaryDigit :: [one of]
	0  1

OctalIntegerLiteral ::
	0o OctalDigits
	0O OctalDigits

OctalDigits ::
	OctalDigit
	OctalDigits OctalDigit

OctalDigit :: [one of]
	0  1  2  3  4  5  6  7

HexIntegerLiteral ::
	0x HexDigits
	0X HexDigits

HexDigits ::
	HexDigit
	HexDigits HexDigit

HexDigit :: [one of]
	0 1 2 3 4 5 6 7 8 9 a b c d e f A B C D E F

StringLiteral ::
	" DoubleStringCharacters[opt] "
	' SingleStringCharacters[opt] '

DoubleStringCharacters ::
	DoubleStringCharacter DoubleStringCharacters[opt]

SingleStringCharacters ::
	SingleStringCharacter SingleStringCharacters[opt]

DoubleStringCharacter ::
	SourceCharacter [but not] [one of] " [or] \ [or] LineTerminator
	\ EscapeSequence
	LineContinuation

SingleStringCharacter ::
	SourceCharacter [but not] [one of] ' [or] \ [or] LineTerminator
	\ EscapeSequence
	LineContinuation

LineContinuation ::
	\ LineTerminatorSequence

EscapeSequence ::
	CharacterEscapeSequence
	0 [lookahead ∉ DecimalDigit]
	HexEscapeSequence
	UnicodeEscapeSequence

CharacterEscapeSequence ::
	SingleEscapeCharacter
	NonEscapeCharacter

SingleEscapeCharacter ::  [one of]
	'  "  \  b  f  n  r  t  v

NonEscapeCharacter ::
	SourceCharacter [but not] [one of] EscapeCharacter [or] LineTerminator

EscapeCharacter ::
	SingleEscapeCharacter DecimalDigit x u

HexEscapeSequence ::
	x HexDigit HexDigit

UnicodeEscapeSequence ::
	u Hex4Digits  u{ HexDigits }

Hex4Digits ::
	HexDigit HexDigit HexDigit HexDigit

RegularExpressionLiteral ::
	/ RegularExpressionBody / RegularExpressionFlags

RegularExpressionBody ::
	RegularExpressionFirstChar RegularExpressionChars

RegularExpressionChars ::
	[empty]
	RegularExpressionChars RegularExpressionChar

RegularExpressionFirstChar ::
	RegularExpressionNonTerminator [but not] [one of] * [or] \ [or] / [or] [
	RegularExpressionBackslashSequence RegularExpressionClass

RegularExpressionChar ::
	RegularExpressionNonTerminator [but not] [one of] \ [or] / [or] [
	RegularExpressionBackslashSequence RegularExpressionClass

RegularExpressionBackslashSequence ::
	\ RegularExpressionNonTerminator

RegularExpressionNonTerminator ::
	SourceCharacter [but not] LineTerminator

RegularExpressionClass ::
	[ RegularExpressionClassChars ]

RegularExpressionClassChars ::
	[empty]
	RegularExpressionClassChars RegularExpressionClassChar

RegularExpressionClassChar ::
	RegularExpressionNonTerminator [but not] [one of] ] [or] \
	RegularExpressionBackslashSequence

RegularExpressionFlags ::
	[empty]
	RegularExpressionFlags IdentifierPart

Template ::
	NoSubstitutionTemplate
	TemplateHead 	11.8.6

NoSubstitutionTemplate ::  
	` TemplateCharacters[opt] `

TemplateHead ::
	` TemplateCharacters[opt] ${

TemplateSubstitutionTail ::
	TemplateMiddle  TemplateTail

TemplateMiddle ::
	} TemplateCharacters[opt] ${

TemplateTail ::
	} TemplateCharacters[opt] `

TemplateCharacters ::
	TemplateCharacter TemplateCharacters[opt]

TemplateCharacter ::
	$ [lookahead ≠ { ]
	\ EscapeSequence
	LineContinuation
	LineTerminatorSequence
	SourceCharacter [but not] [one of] ` [or] \ [or] $ [or] LineTerminator

表达式
----------------------------------------------------------------

IdentifierReference[Yield] :
	Identifier
	[~Yield]  yield

BindingIdentifier[Yield]  :
	Identifier
	[~Yield]  yield

LabelIdentifier[Yield] :
	Identifier
	[~Yield]  yield

Identifier :
	IdentifierName [but not] ReservedWord

PrimaryExpression[Yield] :
	this
	IdentifierReference[?Yield]
	Literal
	ArrayLiteral[?Yield]
	ObjectLiteral[?Yield] 
	FunctionExpression
	ClassExpression[?Yield] 
	GeneratorExpression 
	RegularExpressionLiteral
	TemplateLiteral[?Yield]
	CoverParenthesizedExpressionAndArrowParameterList[?Yield]

CoverParenthesizedExpressionAndArrowParameterList[Yield] :
	( Expression[In, ?Yield] )
	(   )
	( ... BindingIdentifier[?Yield] )
	( Expression[In, ?Yield] , ... BindingIdentifier[?Yield] )

CoverParenthesizedExpressionAndArrowParameterList[Yield, PrimaryExpression] :
	ParenthesizedExpression[?Yield]

ParenthesizedExpression[Yield] :
	( Expression[In, ?Yield] )

Literal :
	NullLiteral
	BooleanLiteral
	NumericLiteral
	StringLiteral

ArrayLiteral[Yield] :
	[ Elision[opt] ] 
	[ ElementList[?Yield] ]
	[ ElementList[?Yield] , Elision[opt] ]

ElementList[Yield] :
	Elision[opt] AssignmentExpression[In, ?Yield]
	Elision[opt] SpreadElement[?Yield]
	ElementList[?Yield] , Elision[opt] AssignmentExpression[In, ?Yield]
	ElementList[?Yield] , Elision[opt] SpreadElement[?Yield]

Elision :
	,
	Elision ,

SpreadElement[Yield] :
	... AssignmentExpression[In, ?Yield]

ObjectLiteral[Yield] :
	{ }
	{ PropertyDefinitionList[?Yield] }
	{ PropertyDefinitionList[?Yield] , }

PropertyDefinitionList[Yield] :
	PropertyDefinition[?Yield]
	PropertyDefinitionList[?Yield] , PropertyDefinition[?Yield]

PropertyDefinition[Yield] :
	IdentifierReference[?Yield]
	CoverInitializedName[?Yield]
	PropertyName[?Yield] : AssignmentExpression[In, ?Yield]
	MethodDefinition[?Yield]

PropertyName[Yield]  :
	LiteralPropertyName
	ComputedPropertyName[?Yield]

LiteralPropertyName :
	IdentifierName
	StringLiteral
	NumericLiteral

ComputedPropertyName[Yield]  :
	 [ AssignmentExpression[In, ?Yield]  ]

CoverInitializedName[Yield]  :
	IdentifierReference[?Yield] Initializer[In, ?Yield]

Initializer[In, Yield] :
	= AssignmentExpression[?In, ?Yield]

TemplateLiteral[Yield] :
	NoSubstitutionTemplate
	TemplateHead Expression[In, ?Yield] TemplateSpans[?Yield]

TemplateSpans[Yield]  :
	TemplateTail
	TemplateMiddleList[?Yield] TemplateTail

TemplateMiddleList[Yield]  :
	TemplateMiddle  Expression[In, ?Yield]
	TemplateMiddleList[?Yield]  TemplateMiddle  Expression[In, ?Yield]

MemberExpression[Yield] :
	PrimaryExpression[?Yield]
	MemberExpression[?Yield] [ Expression[In, ?Yield] ]
	MemberExpression[?Yield] . IdentifierName
	MemberExpression[?Yield]  TemplateLiteral[?Yield]
	SuperProperty[?Yield]  
	MetaProperty  
	new MemberExpression[?Yield] Arguments[?Yield]

SuperProperty[Yield] :
	super [ Expression[In, ?Yield] ] 
	super . IdentifierName

MetaProperty :
	NewTarget

NewTarget :
	new . target

NewExpression[Yield] :
	MemberExpression[?Yield]
	new NewExpression[?Yield]

CallExpression[Yield] :
	MemberExpression[?Yield] Arguments[?Yield]
	SuperCall[?Yield]
	CallExpression[?Yield] Arguments[?Yield]
	CallExpression[?Yield] [ Expression[In, ?Yield] ]
	CallExpression[?Yield] . IdentifierName
	CallExpression[?Yield]  TemplateLiteral[?Yield]

SuperCall[Yield] :
	super Arguments[?Yield]

Arguments[Yield] :
	( )
	( ArgumentList[?Yield]  )

ArgumentList[Yield] :
	AssignmentExpression[In, ?Yield]
	... AssignmentExpression[In, ?Yield]
	ArgumentList[?Yield] , AssignmentExpression[In, ?Yield]
	ArgumentList[?Yield] , ... AssignmentExpression[In, ?Yield]

LeftHandSideExpression[Yield] :
	NewExpression[?Yield]
	CallExpression[?Yield]

PostfixExpression[Yield] :
	LeftHandSideExpression[?Yield]
	LeftHandSideExpression[?Yield] [no LineTerminator here] ++
	LeftHandSideExpression[?Yield] [no LineTerminator here] --

UnaryExpression[Yield] :
	PostfixExpression[?Yield] 
	delete UnaryExpression[?Yield] 
	void UnaryExpression[?Yield] 
	typeof UnaryExpression[?Yield]
	++ UnaryExpression[?Yield]
	-- UnaryExpression[?Yield]
	+ UnaryExpression[?Yield]
	- UnaryExpression[?Yield]
	~ UnaryExpression[?Yield]
	! UnaryExpression[?Yield]

MultiplicativeExpression[Yield] :
	UnaryExpression[?Yield]
	MultiplicativeExpression[?Yield] MultiplicativeOperator UnaryExpression[?Yield]

MultiplicativeOperator : [one of]
	* / %

AdditiveExpression[Yield] :
	MultiplicativeExpression[?Yield]
	AdditiveExpression[?Yield] + MultiplicativeExpression[?Yield]
	AdditiveExpression[?Yield] - MultiplicativeExpression[?Yield]

ShiftExpression[Yield] :
	AdditiveExpression[?Yield]
	ShiftExpression[?Yield] << AdditiveExpression[?Yield]
	ShiftExpression[?Yield] >> AdditiveExpression[?Yield]
	ShiftExpression[?Yield] >>> AdditiveExpression[?Yield]

RelationalExpression[In, Yield] :
	ShiftExpression[?Yield]
	RelationalExpression[?In, ?Yield] < ShiftExpression[?Yield]
	RelationalExpression[?In, ?Yield] > ShiftExpression[?Yield]
	RelationalExpression[?In, ?Yield] <= ShiftExpression[? Yield]
	RelationalExpression[?In, ?Yield] >= ShiftExpression[?Yield]
	RelationalExpression[?In, ?Yield] instanceof ShiftExpression[?Yield]
	[+In] RelationalExpression[In, ?Yield]  in ShiftExpression[?Yield]

EqualityExpression[In, Yield] :
	RelationalExpression[?In, ?Yield]
	EqualityExpression[?In, ?Yield] == RelationalExpression[?In, ?Yield]
	EqualityExpression[?In, ?Yield] != RelationalExpression[?In, ?Yield]
	EqualityExpression[?In, ?Yield] === RelationalExpression[?In, ?Yield]
	EqualityExpression[?In, ?Yield] !== RelationalExpression[?In, ?Yield]

BitwiseANDExpression[In, Yield] :
	EqualityExpression[?In, ?Yield]
	BitwiseANDExpression[?In, ?Yield] & EqualityExpression[?In, ?Yield]

BitwiseXORExpression[In, Yield] :
	BitwiseANDExpression[?In, ?Yield]
	BitwiseXORExpression[?In, ?Yield] ^ BitwiseANDExpression[?In, ?Yield]

BitwiseORExpression[In, Yield] :
	BitwiseXORExpression[?In, ?Yield]
	BitwiseORExpression[?In, ?Yield] | BitwiseXORExpression[?In, ?Yield]

LogicalANDExpression[In, Yield] :
	BitwiseORExpression[?In, ?Yield]
	LogicalANDExpression[?In, ?Yield] && BitwiseORExpression[?In, ?Yield]

LogicalORExpression[In, Yield] :
	LogicalANDExpression[?In, ?Yield]
	LogicalORExpression[?In, ?Yield] || LogicalANDExpression[?In, ?Yield]

ConditionalExpression[In, Yield] :
	LogicalORExpression[?In, ?Yield]
	LogicalORExpression[?In,?Yield] ? AssignmentExpression[In, ?Yield] : AssignmentExpression[?In, ?Yield]

AssignmentExpression[In, Yield] :
	ConditionalExpression[?In, ?Yield]
	[+Yield] YieldExpression[?In]
	ArrowFunction[?In, ?Yield]
	LeftHandSideExpression[?Yield] = AssignmentExpression[?In, ?Yield]
	LeftHandSideExpression[?Yield] AssignmentOperator AssignmentExpression[?In, ?Yield]

AssignmentOperator : [one of]
	*=  /=  %=  +=  -=  <<=  >>=  >>>=  &=  ^=  |=

Expression[In, Yield] :
	AssignmentExpression[?In, ?Yield]
	Expression[?In, ?Yield] , AssignmentExpression[?In, ?Yield]

语句
----------------------------------------------------------------

Statement[Yield, Return] :
	BlockStatement[?Yield, ?Return]
	VariableStatement[?Yield]
	EmptyStatement
	ExpressionStatement[?Yield]
	IfStatement[?Yield, ?Return]
	BreakableStatement[?Yield, ?Return]
	ContinueStatement[?Yield]
	BreakStatement[?Yield]
	[+Return] ReturnStatement[?Yield]
	WithStatement[?Yield, ?Return]
	LabelledStatement[?Yield, ?Return]
	ThrowStatement[?Yield]
	TryStatement[?Yield, ?Return]
	DebuggerStatement

Declaration[Yield] :
	HoistableDeclaration[?Yield]
	ClassDeclaration[?Yield]
	LexicalDeclaration[In, ?Yield]

HoistableDeclaration[Yield, Default] :
	FunctionDeclaration[?Yield,?Default] 
	GeneratorDeclaration[?Yield, ?Default]

BreakableStatement[Yield, Return] :
	IterationStatement[?Yield, ?Return]
	SwitchStatement[?Yield, ?Return]

BlockStatement[Yield, Return] :
	Block[?Yield, ?Return]

Block[Yield, Return] :
	{ StatementList[?Yield, ?Return][opt] }

StatementList[Yield, Return] :
	StatementListItem[?Yield, ?Return]
	StatementList[?Yield, ?Return] StatementListItem[?Yield, ?Return]

StatementListItem[Yield, Return] :
	Statement[?Yield, ?Return]
	Declaration[?Yield]

LexicalDeclaration[In, Yield] :
	LetOrConst BindingList[?In, ?Yield] ;

LetOrConst : [one of]
	let const

BindingList[In, Yield] :
	LexicalBinding[?In, ?Yield]
	BindingList[?In, ?Yield] , LexicalBinding[?In, ?Yield]

LexicalBinding[In, Yield]  :
	BindingIdentifier[?Yield]  Initializer[?In, ?Yield][opt]
	BindingPattern[?Yield]   Initializer[?In, ?Yield]

VariableStatement[Yield] :
	var VariableDeclarationList[In, ?Yield] ;

VariableDeclarationList[In, Yield] :
	VariableDeclaration[?In, ?Yield]
	VariableDeclarationList[?In, ?Yield] , VariableDeclaration[?In, ?Yield]

VariableDeclaration[In, Yield] :
	BindingIdentifier[?Yield] Initializer[?In, ?Yield][opt]
	BindingPattern[?Yield]  Initializer[?In, ?Yield]

BindingPattern[Yield] :
	ObjectBindingPattern[?Yield]
	ArrayBindingPattern[?Yield]

ObjectBindingPattern[Yield] :
	{ }
	{ BindingPropertyList[?Yield] }
	{ BindingPropertyList[?Yield] , }

ArrayBindingPattern[Yield] :
	[ Elision[opt] BindingRestElement[?Yield][opt] ]
	[ BindingElementList[?Yield] ]
	[ BindingElementList[?Yield] , Elision[opt] BindingRestElement[?Yield][opt] ]

BindingPropertyList[Yield] :
	BindingProperty[?Yield]
	BindingPropertyList[?Yield] , BindingProperty[?Yield]

BindingElementList[Yield] :
	BindingElisionElement[?Yield]
	BindingElementList[?Yield] , BindingElisionElement[?Yield]

BindingElisionElement[Yield] :
	Elision[opt]  BindingElement[?Yield]

BindingProperty[Yield] :
	SingleNameBinding[?Yield]

PropertyName[?Yield] :
	BindingElement[?Yield]

BindingElement[Yield] :
	SingleNameBinding[?Yield]
	BindingPattern[?Yield] Initializer[In, ?Yield][opt]

SingleNameBinding[Yield]  :
	BindingIdentifier[?Yield] Initializer[In, ?Yield][opt]

BindingRestElement[Yield] :
	... BindingIdentifier[?Yield]

EmptyStatement :
	;

ExpressionStatement[Yield] :
	[lookahead ∉ {{, function,  class,  let [ }] Expression[In, ?Yield] ;

IfStatement[Yield, Return] :
	if ( Expression[In, ?Yield] ) Statement[?Yield, ?Return]  else Statement[?Yield, ?Return]
	if ( Expression[In, ?Yield] ) Statement[?Yield, ?Return]

IterationStatement[Yield, Return] :
	do Statement[?Yield, ?Return] while ( Expression[In, ?Yield] ) ; while ( Expression[In, ?Yield] ) Statement[?Yield, ?Return]
	for ( [lookahead ∉ {let [ }] Expression[?Yield][opt] ; Expression[In, ?Yield][opt] ; Expression[In, ?Yield][opt] ) Statement[?Yield, ?Return]
	for ( var VariableDeclarationList[?Yield]; Expression[In, ?Yield][opt] ; Expression[In, ?Yield][opt] ) Statement[?Yield, ?Return]
	for ( LexicalDeclaration[?Yield]  Expression[In, ?Yield][opt] ; Expression[In, ?Yield][opt] ) Statement[?Yield, ?Return]
	for ( [lookahead ∉ {let [ }] LeftHandSideExpression[?Yield] in Expression[In, ?Yield] ) Statement[?Yield, ?Return] 
	for ( var ForBinding[?Yield] in Expression[In, ?Yield] ) Statement[?Yield, ?Return]
	for ( ForDeclaration[?Yield]  in Expression[In, ?Yield] ) Statement[?Yield, ?Return]
	for ( [lookahead ≠ let] LeftHandSideExpression[?Yield] of AssignmentExpression[In, ?Yield] ) Statement[?Yield, ?Return]
	for ( var ForBinding[?Yield] of AssignmentExpression[In, ?Yield] ) Statement[?Yield, ?Return]
	for ( ForDeclaration[?Yield]  of AssignmentExpression[In, ?Yield] ) Statement[?Yield, ?Return]

ForDeclaration[Yield] :
	LetOrConst  ForBinding[?Yield]

ForBinding[Yield] :
	BindingIdentifier[?Yield]
	BindingPattern[?Yield]

ContinueStatement[Yield]  :
	continue ;
	continue [no LineTerminator here] LabelIdentifier[?Yield] ;

BreakStatement[Yield]  :
	break ;
	break [no LineTerminator here]  LabelIdentifier[?Yield] ;

ReturnStatement[Yield] :
	return ;
	return [no LineTerminator here] Expression[In, ?Yield] ;

WithStatement[Yield, Return] :
	with ( Expression[In, ?Yield] ) Statement[?Yield, ?Return]

SwitchStatement[Yield, Return] :
	switch ( Expression[In, ?Yield] ) CaseBlock[?Yield, ?Return]

CaseBlock[Yield, Return] :
	{ CaseClauses[?Yield, ?Return][opt] }
	{ CaseClauses[?Yield, ?Return][opt] DefaultClause[?Yield, ?Return]  CaseClauses[?Yield, ?Return][opt] }

CaseClauses[Yield, Return] :
	CaseClause[?Yield, ?Return]
	CaseClauses[?Yield, ?Return] CaseClause[?Yield, ?Return]

CaseClause[Yield, Return] :
	case Expression[In, ?Yield] : StatementList[?Yield, ?Return][opt]

DefaultClause[Yield, Return] :
	default : StatementList[?Yield, ?Return][opt]

LabelledStatement[Yield, Return] :
	LabelIdentifier[?Yield] : LabelledItem[?Yield, ?Return]

LabelledItem[Yield, Return] :
	Statement[?Yield, ?Return]
	FunctionDeclaration[?Yield]

ThrowStatement[Yield] :
	throw [no LineTerminator here] Expression[In, ?Yield] ;

TryStatement[Yield, Return] :
	try Block[?Yield, ?Return] Catch[?Yield, ?Return] 
	try Block[?Yield, ?Return] Finally[?Yield, ?Return] 
	try Block[?Yield, ?Return] Catch[?Yield, ?Return]  Finally[?Yield, ?Return]

Catch[Yield, Return] :
	catch ( CatchParameter[?Yield] ) Block[?Yield, ?Return]

Finally[Yield, Return] :
	finally Block[?Yield, ?Return]

CatchParameter[Yield] :
	BindingIdentifier[?Yield]
	BindingPattern[?Yield]

DebuggerStatement :
	debugger ;

声明
----------------------------------------------------------------

FunctionDeclaration[Yield, Default]  :
	function BindingIdentifier[?Yield] ( FormalParameters ) { FunctionBody }
	[+Default] function ( FormalParameters ) { FunctionBody }

FunctionExpression :
	function BindingIdentifier[opt] ( FormalParameters ) { FunctionBody }

StrictFormalParameters[Yield] :
	FormalParameters[?Yield]

FormalParameters[Yield] :
	[empty]
	FormalParameterList[?Yield]

FormalParameterList[Yield]  :
	FunctionRestParameter[?Yield]
	FormalsList[?Yield]
	FormalsList[?Yield], FunctionRestParameter[?Yield]

FormalsList[Yield] :
	FormalParameter[?Yield]
	FormalsList[?Yield] , FormalParameter[?Yield]

FunctionRestParameter[Yield] :
	BindingRestElement[?Yield]

FormalParameter[Yield] :
	BindingElement[?Yield]

FunctionBody[Yield] :
	FunctionStatementList[?Yield]

FunctionStatementList[Yield] :
	StatementList[?Yield, Return][opt]

ArrowFunction[In, Yield]  :
	ArrowParameters[?Yield] [no LineTerminator here]  => ConciseBody[?In]

ArrowParameters[Yield]  :
	BindingIdentifier[?Yield]
	CoverParenthesizedExpressionAndArrowParameterList[?Yield]

ConciseBody[In] :
	[lookahead ≠ {] AssignmentExpression[?In]
	{ FunctionBody }

CoverParenthesizedExpressionAndArrowParameterList[ArrowParameters]:
	ArrowFormalParameters[Yield]

ArrowFormalParameters[Yield] :
	( StrictFormalParameters[?Yield] )

MethodDefinition[Yield] :
	PropertyName[?Yield] ( StrictFormalParameters )  { FunctionBody }  
	GeneratorMethod[?Yield]
	get PropertyName[?Yield] ( )  { FunctionBody }  
	set PropertyName[?Yield] ( PropertySetParameterList ) { FunctionBody }

PropertySetParameterList :
	FormalParameter

GeneratorMethod[Yield]  :
	* PropertyName[?Yield] ( StrictFormalParameters[Yield] )  { GeneratorBody }

GeneratorDeclaration[Yield, Default] :
	function * BindingIdentifier[?Yield] ( FormalParameters[Yield] ) { GeneratorBody }
	[+Default] function * ( FormalParameters[Yield] ) { GeneratorBody }

GeneratorExpression :
	function * BindingIdentifier[Yield][opt] ( FormalParameters[Yield] ) { GeneratorBody }

GeneratorBody  :
	FunctionBody[Yield]

YieldExpression[In] :  	 yield
	yield [no LineTerminator here] AssignmentExpression[?In, Yield] 
	yield [no LineTerminator here] * AssignmentExpression[?In, Yield]

ClassDeclaration[Yield, Default] :
	class BindingIdentifier[?Yield]  ClassTail[?Yield]
	[+Default] class ClassTail[?Yield]

ClassExpression[Yield] :
	class BindingIdentifier[?Yield][opt]  ClassTail[?Yield]

ClassTail[Yield] :
	ClassHeritage[?Yield][opt]  { ClassBody[?Yield][opt] }

ClassHeritage[Yield] :
	extends LeftHandSideExpression[?Yield]

ClassBody[Yield] :
	ClassElementList[?Yield]

ClassElementList[Yield] :
	ClassElement[?Yield]
	ClassElementList[?Yield]  ClassElement[?Yield]

ClassElement[Yield] :
	MethodDefinition[?Yield]  
	static MethodDefinition[?Yield]
	;

源文件
----------------------------------------------------------------

Script :
	ScriptBody[opt]

ScriptBody :
	StatementList

Module :
	ModuleBody[opt]

ModuleBody :
	ModuleItemList

ModuleItemList :
	ModuleItem
	ModuleItemList  ModuleItem

ModuleItem :
	ImportDeclaration
	ExportDeclaration
	StatementListItem

ImportDeclaration :
	import  ImportClause FromClause ;
	import  ModuleSpecifier ;

ImportClause :
	ImportedDefaultBinding
	NameSpaceImport
	NamedImports
	ImportedDefaultBinding , NameSpaceImport
	ImportedDefaultBinding , NamedImports

ImportedDefaultBinding :
	ImportedBinding

NameSpaceImport :
	* as  ImportedBinding

NamedImports :
	{  }
	{  ImportsList }
	{  ImportsList , }

FromClause :
	from ModuleSpecifier

ImportsList :
	ImportSpecifier
	ImportsList ,  ImportSpecifier

ImportSpecifier :
	ImportedBinding
	IdentifierName as  ImportedBinding

ModuleSpecifier :
	StringLiteral

ImportedBinding :
	BindingIdentifier

ExportDeclaration :
	export *  FromClause ; 
	export  ExportClause  FromClause ; 
	export  ExportClause  ; 
	export  VariableStatement  
	export  Declaration   
	export default HoistableDeclaration[Default] 
	export default ClassDeclaration[Default] 
	export default [lookahead ∉ { function, class }]  AssignmentExpression[In] ;

ExportClause :
	{  }
	{  ExportsList }
	{  ExportsList , }

ExportsList :
	ExportSpecifier
	ExportsList ,  ExportSpecifier

ExportSpecifier :
	IdentifierName
	IdentifierName as  IdentifierName

数字
----------------------------------------------------------------

StringNumericLiteral :::
	StrWhiteSpace[opt]
	StrWhiteSpace[opt] StrNumericLiteral StrWhiteSpace[opt]

StrWhiteSpace :::
	StrWhiteSpaceChar StrWhiteSpace[opt]

StrWhiteSpaceChar ::: WhiteSpace
	LineTerminator

StrNumericLiteral :::
	StrDecimalLiteral
	BinaryIntegerLiteral OctalIntegerLiteral
	HexIntegerLiteral

StrDecimalLiteral :::
	StrUnsignedDecimalLiteral
	+ StrUnsignedDecimalLiteral
	- StrUnsignedDecimalLiteral

StrUnsignedDecimalLiteral :::
	Infinity
	DecimalDigits . DecimalDigits[opt] ExponentPart[opt]
	. DecimalDigits ExponentPart[opt]
	DecimalDigits ExponentPart[opt]

DecimalDigits :::
	DecimalDigit
	DecimalDigits DecimalDigit

DecimalDigit ::: [one of]
	0  1  2  3  4  5  6  7  8  9

ExponentPart :::
	ExponentIndicator SignedInteger

ExponentIndicator ::: [one of]
	e  E

SignedInteger :::
	DecimalDigits
	+ DecimalDigits
	- DecimalDigits

HexIntegerLiteral ::: 0x HexDigit
	0X HexDigit
	HexIntegerLiteral HexDigit

HexDigit ::: [one of]
	0 1 2 3 4 5 6 7 8 9 a b c d e f A B C D E F

URI
----------------------------------------------------------------

uri :::
	uriCharacters[opt]

uriCharacters :::
	uriCharacter 
	uriCharacters[opt]

uriCharacter ::: 
	uriReserved 
	uriUnescaped 
	uriEscaped

uriReserved ::: [one of]
	;  /  ?  :  # # &  =  +  $  ,

uriUnescaped :::
	uriAlpha DecimalDigit uriMark

uriEscaped :::
	% HexDigit HexDigit

uriAlpha ::: [one of]
	a  b  c  d  e  f  g  h  i  j  k  l  m  n  o  p  q  r  s  t  u  v  w  x  y  z A  B  C  D  E  F  G  H  I  J  K  L  M  N  O  P  Q  R  S  T  U  V  W  X  Y  Z

uriMark ::: [one of]
	-  _  .  !  ~  *  '  (  )

正则表达式
----------------------------------------------------------------

Pattern[U] ::
	Disjunction[?U]

Disjunction[U] ::
	Alternative[?U]
	 Alternative[?U] | Disjunction[?U]

Alternative[U] ::
	[empty]
	Alternative[?U] Term[?U]

Term[U] ::
	Assertion[?U]
	Atom[?U]
	Atom[?U] Quantifier

Assertion[U] ::
	^
	$
	\ b
	\ B
	( ? = Disjunction[?U] )
	( ? ! Disjunction[?U] )

Quantifier ::
	QuantifierPrefix
	QuantifierPrefix ?

QuantifierPrefix ::
	*
	+ ?
	{ DecimalDigits }
	{ DecimalDigits , }
	{ DecimalDigits , DecimalDigits }

Atom[U] ::
	PatternCharacter .
	\ AtomEscape[?U] CharacterClass[?U]
	( Disjunction[?U] )
	( ? : Disjunction[?U] )

SyntaxCharacter :: [one of]
	^  $  \  .  *  +  ?  (  )  [  ]  {  }  |

PatternCharacter ::
	SourceCharacter [but not] SyntaxCharacter

AtomEscape[U] ::  
	DecimalEscape
	CharacterEscape[?U]
	CharacterClassEscape

CharacterEscape[U] ::  
	ControlEscape c ControlLetter
	HexEscapeSequence
	RegExpUnicodeEscapeSequence[?U]
	IdentityEscape[?U]

ControlEscape ::  [one of]
	f  n  r  t  v

ControlLetter :: [one of]
	a  b  c  d  e  f  g  h  i  j  k  
	l  m  n  o  p  q  r  s  t  u  v  
	w  x  y  z 
	A  B  C  D  E  F  G  H  I  J  K  
	L  M  N  O  P  Q  R  S  T  U  V  
	W  X  Y  Z

RegExpUnicodeEscapeSequence[U]  ::
	[+U] u LeadSurrogate \u TrailSurrogate
	[+U] u LeadSurrogate
	[+U] u TrailSurrogate
	[+U] u NonSurrogate
	[~U] u Hex4Digits
	[+U] u{ HexDigits }

LeadSurrogate  ::
	Hex4Digits [match only if the SV of Hex4Digits is in the inclusive range 0xD800 to 0xDBFF]

TrailSurrogate  ::
	Hex4Digits [match only if the SV of Hex4Digits is in the inclusive range 0xDC00 to 0xDFFF]

NonSurrogate  ::
	Hex4Digits [match only if the SV of Hex4Digits is not in the inclusive range 0xD800 to 0xDFFF]

IdentityEscape[U] ::
	[+U] SyntaxCharacter
	[+U]  /
	[~U] SourceCharacter [but not] UnicodeIDContinue

DecimalEscape ::
	DecimalIntegerLiteral  [lookahead ∉ DecimalDigit]

CharacterClassEscape ::  [one of]
	d  D  s  S  w  W

CharacterClass[U]  ::
	[ [lookahead ∉ {^}] ClassRanges[?U] ]
	[ ^ ClassRanges[?U] ]

ClassRanges[U] ::
	[empty]
	NonemptyClassRanges[?U]

NonemptyClassRanges[U] ::
	ClassAtom[?U]
	ClassAtom[?U]  NonemptyClassRangesNoDash[?U]
	ClassAtom[?U] - ClassAtom[?U] ClassRanges[?U]

NonemptyClassRangesNoDash[U] ::
	ClassAtom[?U]
	ClassAtomNoDash[?U] NonemptyClassRangesNoDash[?U]
	ClassAtomNoDash[?U] - ClassAtom[?U] ClassRanges[?U]

ClassAtom[U] ::
	-
	ClassAtomNoDash[?U]

ClassAtomNoDash[U] ::
	SourceCharacter  [but not] [one of] \ [or] ] [or] -
	\ ClassEscape[?U]

ClassEscape[U] ::
	DecimalEscape b
	[+U] -
	CharacterEscape[?U]
	CharacterClassEscape

TypeScript 新增
================================================================

类型
----------------------------------------------------------------

TypeParameters:
	< TypeParameterList >

TypeParameterList:
	TypeParameter
	TypeParameterList , TypeParameter

TypeParameter:
	BindingIdentifier Constraint[opt]

Constraint:
	extends Type

TypeArguments:
	< TypeArgumentList >

TypeArgumentList:
	TypeArgument
	TypeArgumentList , TypeArgument

TypeArgument:
	Type

Type:
	UnionOrIntersectionOrPrimaryType
	FunctionType
	ConstructorType

UnionOrIntersectionOrPrimaryType:
	UnionType
	IntersectionOrPrimaryType

IntersectionOrPrimaryType:
	IntersectionType
	PrimaryType

PrimaryType:
	ParenthesizedType
	PredefinedType
	TypeReference
	ObjectType
	ArrayType TupleType
	TypeQuery ThisType

ParenthesizedType:
	( Type )

PredefinedType:	 [one of]
	any number boolean string symbol void

TypeReference:
	TypeName [no LineTerminator here] TypeArguments[opt]

TypeName:
	IdentifierReference
	NamespaceName . IdentifierReference

NamespaceName:
	IdentifierReference
	NamespaceName . IdentifierReference

ObjectType:
	{ TypeBody[opt] }

TypeBody:
	TypeMemberList ;[opt]
	TypeMemberList ,[opt]

TypeMemberList:
	TypeMember
	TypeMemberList ; TypeMember
	TypeMemberList , TypeMember

TypeMember:
	PropertySignature
	CallSignature
	ConstructSignature
	IndexSignature
	MethodSignature

ArrayType:
	PrimaryType [no LineTerminator here] [ ]

TupleType:
	[ TupleElementTypes ]

TupleElementTypes:
	TupleElementType
	TupleElementTypes , TupleElementType

TupleElementType:
	Type

UnionType:
	UnionOrIntersectionOrPrimaryType | IntersectionOrPrimaryType

IntersectionType:
	IntersectionOrPrimaryType & PrimaryType

FunctionType:
	TypeParameters[opt] ( ParameterList[opt] ) => Type

ConstructorType:
	new TypeParameters[opt] ( ParameterList[opt] ) => Type

TypeQuery:
	typeof TypeQueryExpression

TypeQueryExpression:
	IdentifierReference
	TypeQueryExpression . IdentifierName

ThisType:
	this

PropertySignature:
	PropertyName ?[opt] TypeAnnotation[opt]

PropertyName:
	IdentifierName
	StringLiteral
	NumericLiteral

TypeAnnotation:
	:	 Type

CallSignature:
	TypeParameters[opt] ( ParameterList[opt] ) TypeAnnotation[opt]

ParameterList:
	RequiredParameterList
	OptionalParameterList
	RestParameter
	RequiredParameterList , OptionalParameterList
	RequiredParameterList , RestParameter
	OptionalParameterList , RestParameter
	RequiredParameterList , OptionalParameterList , RestParameter

RequiredParameterList:
	RequiredParameter
	RequiredParameterList , RequiredParameter

RequiredParameter:
	AccessibilityModifier[opt] BindingIdentifierOrPattern TypeAnnotation[opt]

BindingIdentifier :
	StringLiteral

AccessibilityModifier:
	public private protected

BindingIdentifierOrPattern:
	BindingIdentifier 
	BindingPattern

OptionalParameterList:
	OptionalParameter
	OptionalParameterList , OptionalParameter

OptionalParameter:
	AccessibilityModifier[opt] BindingIdentifierOrPattern ? TypeAnnotation[opt]
	AccessibilityModifier[opt] BindingIdentifierOrPattern TypeAnnotation[opt] Initializer
	BindingIdentifier ? :	 StringLiteral

RestParameter:
	... BindingIdentifier TypeAnnotation[opt]

ConstructSignature:	 
	new TypeParameters[opt] ( ParameterList[opt] ) TypeAnnotation[opt]

IndexSignature:
	[ BindingIdentifier :	 string ] TypeAnnotation
	[ BindingIdentifier :	 number ] TypeAnnotation

MethodSignature:
	PropertyName ?[opt] CallSignature

TypeAliasDeclaration:
	type BindingIdentifier TypeParameters[opt] = Type ;

声明
----------------------------------------------------------------

PropertyDefinition:	  [Modified]
	IdentifierReference
	CoverInitializedName

PropertyName :
	AssignmentExpression
	PropertyName CallSignature { FunctionBody }
	GetAccessor 
	SetAccessor

GetAccessor:
	get PropertyName ( ) TypeAnnotation[opt] { FunctionBody }

SetAccessor:
	set PropertyName ( BindingIdentifierOrPattern TypeAnnotation[opt] ) { FunctionBody }

FunctionExpression:
	[Modified]function BindingIdentifier[opt] CallSignature { FunctionBody }

ArrowFormalParameters:	  [Modified]
	CallSignature

Arguments:	  [Modified]
	TypeArguments[opt] ( ArgumentList[opt] )

UnaryExpression:	  [Modified]
	< Type > UnaryExpression

Declaration:	  [Modified]…
	InterfaceDeclaration
	TypeAliasDeclaration EnumDeclaration

VariableDeclaration:	  [Modified]
	SimpleVariableDeclaration
	DestructuringVariableDeclaration

SimpleVariableDeclaration:
	BindingIdentifier TypeAnnotation[opt] Initializer[opt]

DestructuringVariableDeclaration:
	BindingPattern TypeAnnotation[opt] Initializer

LexicalBinding:	  
	[Modified]SimpleLexicalBinding
	DestructuringLexicalBinding

SimpleLexicalBinding:
	BindingIdentifier TypeAnnotation[opt] Initializer[opt]

DestructuringLexicalBinding:
	BindingPattern TypeAnnotation[opt] Initializer[opt]

FunctionDeclaration:
	[Modified]function BindingIdentifier[opt] CallSignature { FunctionBody } function BindingIdentifier[opt] CallSignature ;

InterfaceDeclaration:
	interface BindingIdentifier TypeParameters[opt] InterfaceExtendsClause[opt] ObjectType

InterfaceExtendsClause:
	extends ClassOrInterfaceTypeList

ClassOrInterfaceTypeList:
	ClassOrInterfaceType
	ClassOrInterfaceTypeList , ClassOrInterfaceType

ClassOrInterfaceType:
	TypeReference

ClassDeclaration:
	[Modified]class BindingIdentifier[opt] TypeParameters[opt] ClassHeritage { ClassBody }

ClassHeritage:	  [Modified]
	ClassExtendsClause[opt] ImplementsClause[opt]

ClassExtendsClause:
	extends  ClassType

ClassType:
	TypeReference

ImplementsClause:
	implements ClassOrInterfaceTypeList

ClassElement:	  [Modified]
	ConstructorDeclaration
	PropertyMemberDeclaration IndexMemberDeclaration

ConstructorDeclaration:
	AccessibilityModifier[opt] constructor ( ParameterList[opt] ) { FunctionBody } AccessibilityModifier[opt] constructor ( ParameterList[opt] ) ;

PropertyMemberDeclaration:
	MemberVariableDeclaration
	MemberFunctionDeclaration MemberAccessorDeclaration

MemberVariableDeclaration:
	AccessibilityModifier[opt] static[opt] PropertyName TypeAnnotation[opt] Initializer[opt] ;

MemberFunctionDeclaration:
	AccessibilityModifier[opt] static[opt] PropertyName CallSignature { FunctionBody }
	AccessibilityModifier[opt] static[opt] PropertyName CallSignature ;

MemberAccessorDeclaration:
	AccessibilityModifier[opt] static[opt] GetAccessor AccessibilityModifier[opt] static[opt]

SetAccessorIndexMemberDeclaration:
	IndexSignature ;

EnumDeclaration:
	const[opt] enum BindingIdentifier { EnumBody[opt] }

EnumBody:
	EnumMemberList ,[opt]

EnumMemberList:
	EnumMember
	EnumMemberList , EnumMember

EnumMember:
	PropertyName
	PropertyName = EnumValue

EnumValue:
	AssignmentExpression

NamespaceDeclaration:
	namespace IdentifierPath { NamespaceBody }

IdentifierPath:
	BindingIdentifier
	IdentifierPath . BindingIdentifier

NamespaceBody:
	NamespaceElements[opt]

NamespaceElements:
	NamespaceElement
	NamespaceElements NamespaceElement

NamespaceElement:
	Statement
	LexicalDeclaration
	FunctionDeclaration
	GeneratorDeclaration
	ClassDeclaration
	InterfaceDeclaration
	TypeAliasDeclaration
	EnumDeclaration
	NamespaceDeclaration
	AmbientDeclaration
	ImportAliasDeclaration
	ExportNamespaceElement

ExportNamespaceElement:
	export VariableStatement
	export LexicalDeclaration
	export FunctionDeclaration
	export GeneratorDeclaration
	export ClassDeclaration
	export InterfaceDeclaration
	export TypeAliasDeclaration
	export EnumDeclaration
	export NamespaceDeclaration
	export AmbientDeclaration
	export ImportAliasDeclaration

ImportAliasDeclaration:
	import BindingIdentifier = EntityName ;

EntityName:
	NamespaceName
	NamespaceName . IdentifierReference

SourceFile:
	ImplementationSourceFile
	DeclarationSourceFile

ImplementationSourceFile:
	ImplementationScript
	ImplementationModule

DeclarationSourceFile:
	DeclarationScript
	DeclarationModule

ImplementationScript:
	ImplementationScriptElements[opt]

ImplementationScriptElements:
	ImplementationScriptElement
	ImplementationScriptElements ImplementationScriptElement

ImplementationScriptElement:
	ImplementationElement
	AmbientModuleDeclaration

ImplementationElement:
	Statement
	LexicalDeclaration
	FunctionDeclaration
	GeneratorDeclaration
	ClassDeclaration
	InterfaceDeclaration
	TypeAliasDeclaration
	EnumDeclaration
	NamespaceDeclaration
	AmbientDeclaration
	ImportAliasDeclaration

DeclarationScript:
	DeclarationScriptElements[opt]

DeclarationScriptElements:
	DeclarationScriptElement
	DeclarationScriptElements DeclarationScriptElement

DeclarationScriptElement:
	DeclarationElement
	AmbientModuleDeclaration

DeclarationElement:
	InterfaceDeclaration
	TypeAliasDeclaration
	NamespaceDeclaration AmbientDeclaration
	ImportAliasDeclaration

ImplementationModule:
	ImplementationModuleElements[opt]

ImplementationModuleElements:
	ImplementationModuleElement
	ImplementationModuleElements ImplementationModuleElement

ImplementationModuleElement:
	ImplementationElement
	ImportDeclaration
	ImportAliasDeclaration
	ImportRequireDeclaration
	ExportImplementationElement
	ExportDefaultImplementationElement
	ExportListDeclaration ExportAssignment

DeclarationModule:
	DeclarationModuleElements[opt]

DeclarationModuleElements:
	DeclarationModuleElement
	DeclarationModuleElements DeclarationModuleElement

DeclarationModuleElement:
	DeclarationElement
	ImportDeclaration
	ImportAliasDeclaration
	ExportDeclarationElement
	ExportDefaultDeclarationElement
	ExportListDeclaration ExportAssignment

ImportRequireDeclaration:
	import BindingIdentifier = require ( StringLiteral ) ;

ExportImplementationElement:
	export VariableStatement
	export LexicalDeclaration
	export FunctionDeclaration
	export GeneratorDeclaration
	export ClassDeclaration
	export InterfaceDeclaration
	export TypeAliasDeclaration
	export EnumDeclaration
	export NamespaceDeclaration
	export AmbientDeclaration
	export ImportAliasDeclaration

ExportDeclarationElement:
	export InterfaceDeclaration
	export TypeAliasDeclaration
	export AmbientDeclaration
	export ImportAliasDeclaration

ExportDefaultImplementationElement:
	export default FunctionDeclaration
	export default GeneratorDeclaration
	export default ClassDeclaration
	export default AssignmentExpression ;

ExportDefaultDeclarationElement:
	export default AmbientFunctionDeclaration
	export default AmbientClassDeclaration
	export default IdentifierReference ;

ExportListDeclaration:
	export * FromClause ;
	export ExportClause FromClause ;
	export ExportClause ;

ExportAssignment:
	export = IdentifierReference ;

AmbientDeclaration:
	declare AmbientVariableDeclaration
	declare AmbientFunctionDeclaration
	declare AmbientClassDeclaration
	declare AmbientEnumDeclaration
	declare AmbientNamespaceDeclaration

AmbientVariableDeclaration:
	var AmbientBindingList ;
	let AmbientBindingList ;
	const AmbientBindingList ;

AmbientBindingList:
	AmbientBinding
	AmbientBindingList , AmbientBinding

AmbientBinding:
	BindingIdentifier TypeAnnotation[opt]

AmbientFunctionDeclaration:
	function BindingIdentifier CallSignature ;

AmbientClassDeclaration:
	class BindingIdentifier TypeParameters[opt] ClassHeritage { AmbientClassBody }

AmbientClassBody:
	AmbientClassBodyElements[opt]

AmbientClassBodyElements:
	AmbientClassBodyElement
	AmbientClassBodyElements AmbientClassBodyElement

AmbientClassBodyElement:
	AmbientConstructorDeclaration
	AmbientPropertyMemberDeclaration IndexSignature

AmbientConstructorDeclaration:	 
	constructor ( ParameterList[opt] ) ;

AmbientPropertyMemberDeclaration:
	AccessibilityModifier[opt] static[opt] PropertyName TypeAnnotation[opt] ;
	AccessibilityModifier[opt] static[opt] PropertyName CallSignature ;

AmbientEnumDeclaration:
	EnumDeclaration

AmbientNamespaceDeclaration:
	namespace IdentifierPath { AmbientNamespaceBody }

AmbientNamespaceBody:
	AmbientNamespaceElements[opt]

AmbientNamespaceElements:
	AmbientNamespaceElement
	AmbientNamespaceElements AmbientNamespaceElement

AmbientNamespaceElement:
	export[opt] AmbientVariableDeclaration
	export[opt] AmbientLexicalDeclaration
	export[opt] AmbientFunctionDeclaration
	export[opt] AmbientClassDeclaration
	export[opt] InterfaceDeclaration
	export[opt] AmbientEnumDeclaration
	export[opt] AmbientNamespaceDeclaration
	export[opt] ImportAliasDeclaration

AmbientModuleDeclaration:
	declare module StringLiteral {  DeclarationModule }

TealScript 新增
================================================================

IterationStatement[Yield, Return] :
	for ( [lookahead ∉ {let [ }] LeftHandSideExpression[?Yield] to Expression[In, ?Yield] ) Statement[?Yield, ?Return] 
	for ( var ForBinding[?Yield] to Expression[In, ?Yield] ) Statement[?Yield, ?Return]
	for ( ForDeclaration[?Yield]  to Expression[In, ?Yield] ) Statement[?Yield, ?Return]

WithStatement[Yield, Return] :
	with ( var ForBinding[?Yield] ) Statement[?Yield, ?Return]
	with ( var ForDeclaration[?Yield] ) Statement[?Yield, ?Return]
