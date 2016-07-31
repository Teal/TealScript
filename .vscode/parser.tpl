// TealScript 语法解析器
// 此文件可用于生成 parser.ts、nodes.ts、nodeVisitor.ts

// 语法说明：
//	@ 开头表示一个产生式。
//	紧跟的缩进行是对上一个产生式的说明。
//	所有产生式将最终生成一个前缀为 parse 的函数。
//	如果产生式下包含了代码以外的定义，则该产生式还会生成一个节点类。
//	在代码中，@产生式会转为对应的 parse 函数调用；@ 会转为 this.。

@TypeNode(precedence = Precedence.any) // 类型节点
	let result: @TypeNode;
	if (isPredefinedType(@peek)) {
		result = @PredefinedTypeNode();
		@PredefinedTypeNode // 内置类型节点(`number`、`string`、...)
			type: 'any'|'number'|'boolean'|'string'|'symbol'|'void'|'never'|'this'|'null'|'undefined'|'char'|'byte'|'int'|'long'|'short'|'uint'|'ulong'|'ushort'|'float'|'double'|'*'|'?' // 类型
	} else {
		switch (@peek) {
			//+ case 'identifier':
			//+ 	result = @GenericTypeOrTypeReferenceNode();
			//+ 	break;
				@GenericTypeOrTypeReferenceNode // 泛型类型节点(`x<T>`)或类型引用节点(`x`)
					let result = @TypeReferenceNode();
					if (@sameLine && @peek === '<') {
						return @GenericTypeNode(result);
					}
					return result;
					@GenericTypeNode(*) // 泛型类型节点(`Array<number>`)
						target: TypeReferenceNode // 目标部分
						typeArguments: TypeArguments // 类型参数部分
						@TypeArguments list < TypeArgument , ...isTypeNodeStart > // 类型参数列表(`<number>`)
							@TypeArgument // 类型参数(`number`)
								value: TypeNode(Precedence.assignment) // 值
					@TypeReferenceNode extends TypeNode // 类型引用节点(`x`)
						value: 'identifier' // 值部分
						if (isIdentifierName(@peek)) {
							const result = new @TypeReferenceNode();
							result.start = @read;
							result.value = @lexer.current.value;
							result.end = @lexer.current.end;
							return result;
						}
						@error(@lexer.peek(), "Type expected. Unexpected token '{0}'.", getTokenName(@peek));
						return @ErrorTypeNode();
						@ErrorTypeNode(start = @lexer.current.end/*标记的开始位置*/) // 错误的类型节点
							const result = new @ErrorTypeNode();
							result.start = start;
							result.end = @lexer.current.end;
							return result;
			case '(':
				result = @FunctionOrParenthesizedTypeNode();
				break;
				@FunctionOrParenthesizedTypeNode // 函数(`()=> void`)或括号类型节点(`(x)`)
					const savedState = @stashSave();
					const parameters = @Parameters();
					if (@peek === '=>') {
						@stashClear(savedState);
						return @FunctionTypeNode(undefined, parameters);
					}
					@stashRestore(savedState);
					return @ParenthesizedTypeNode();
					@FunctionTypeNode(*, *) // 函数类型节点(`(x: number) => void`)。
						?typeParameters: TypeParameters
						?parameters: Parameters
						'=>'
						returnType: TypeNode()
						@TypeParameters list < TypeParameterDeclaration , ...isIdentifierName > // 类型参数列表(`<T>`)
							@TypeParameterDeclaration // 类型参数声明(`T`、`T extends R`)
								name: Identifier
								?extends
								?extends: TypeNode
								const result = new @TypeParameterDeclaration();
								result.name = @Identifier();
								if (@peek === 'extends') {
									result.extendsToken = @readToken('extends');
									result.extends = @TypeNode();
								}
								return result;
						@Parameters list ( ?ParameterDeclaration , ...isBindingElementStart ) // 参数列表(`(x, y)`)
							@ParameterDeclaration // 参数声明(`x`、`x?: number`)
								?modifiers: Modifiers
								?'...'
								name: BindingName
								?'?'
								?TypeAnnotation
								?Initializer
								@BindingName alias Identifier | ArrayBindingPattern | ObjectBindingPattern // 绑定名称(`x`, `[x]`, `{x: x}`)
									@ArrayBindingPattern  // 数组绑定模式项(`[x]`)
										elements: [ ?ArrayBindingElement , ...isArrayBindingElementStart ]
										@ArrayBindingElement // 数组绑定模式项(`x`)
											?'...'
											?value: BindingName
											?Initializer
											const result = new @ArrayBindingElement();
											if (@peek !== ',' && @peek !== ']') {
												if (@peek === '...') result.dotDotDotToken = @readToken('...');
												result.value = @BindingName();
												@Initializer(result);
											}
											return result;
									@ObjectBindingPattern // 对象绑定模式项(`{x: x}`)
										elements: { ?ObjectBindingElement , ...isObjectBindingElementStart }
										@ObjectBindingElement // 对象绑定模式项(`x`)
											?'...'
											key: PropertyName,
											?':'
											value: BindingName
											?Initializer
											@PropertyName alias Identifier | NumericLiteral | StringLiteral | ComputedPropertyName // 属性名称(`xx`、`"xx"`、`0`、`[xx]`)
												switch (@peek) {
													//+ case 'identifier':
													//+ 	return @Identifier(true);
													case 'stringLiteral':
														return @StringLiteral();
													case 'numericLiteral':
														return @NumericLiteral();
													case '[':
														return @ComputedPropertyName();
														@ComputedPropertyName // 已计算的属性名(`[1]`)
															[ 
															body: Expression(Precedence.assignment) 
															]
													default:
														return @Identifier(true);
												}
								@TypeAnnotation(result) // 类型注解(`: number`)
									?':'
									?type: TypeNode // 类型部分
								@Initializer(result, allowIn) // 初始值
									?'='
									?initializer: Expression(Precedence.assignment, allowIn)
					@ParenthesizedTypeNode // 括号类型节点(`(number)`)
						'('
						body: TypeNode() // 主体部分
						')'
			case '[':
				result = @TupleTypeNode();
				break;
				@TupleTypeNode // 元祖类型节点(`[string, number]`)
					elements: [ ?TupleTypeElement , ...isTypeNodeStart ] // 所有元素
					@TupleTypeElement // 元祖类型节点元素(`x`)
						value: TypeNode(Precedence.assignment)
			case '{':
				result = @ObjectTypeNode();
				break;
				@ObjectTypeNode // 对象类型节点(`{x: number}`)
					elements: { TypeMemberSignature ... }
					@TypeMemberSignature alias PropertySignature | CallSignature | ConstructSignature | IndexSignature | MethodSignature | AccessorSignature // 类型成员签名(`x： y`、`x() {...}`)
						switch (@peek) {
							//+ case 'identifier':
							//+ 	break;
							case 'get':
							case 'set':
								const savedToken = @lexer.current;
								@lexer.read();
								if (isKeyword(@peek) || @peek === '[') {
									return @AccessorSignature(savedToken.type === 'get' ? savedToken.start : undefined, savedToken.type === 'set' ? savedToken.start : undefined);
								}
								@lexer.current = savedToken;
								break;
							case '[':
								let isIndexSignature;
								const savedToken = @lexer.current;
								@lexer.read();
								if (isIdentifierName(@peek)) {
									@lexer.read();
									isIndexSignature = @peek === ':';
								}
								@lexer.current = savedToken;
								if (isIndexSignature) {
									return @IndexSignature();
								}
								break;
							case '(':
								return @CallSignature();
							case 'new':
								return @ConstructSignature();
						}
						const name = @PropertyName();
						const questionToken = @peek === '?' ? @readToken('?') : undefined;
						switch (@peek) {
							case '(':
							case '<':
								return @MethodSignature(name, questionToken);
							default:
								return @PropertySignature(name, questionToken);
						}
						@PropertySignature(*, *) doc // 属性签名(`x: number`)
							name: PropertyName // 名字部分
							?'?'
							?TypeAnnotation
							ObjectMemberTail
						@CallSignature doc // 函数签名(`(): number`)
							?TypeParameters
							Parameters
							?TypeAnnotation
							ObjectMemberTail
						@ConstructSignature doc // 构造函数签名(`new x(): number`)
							'new'
							?TypeParameters
							Parameters
							?TypeAnnotation
							ObjectMemberTail
						@IndexSignature doc // 索引器声明(`get x() {...}`、`set x(value) {...}`)
							'['
							argument: Identifier
							?TypeAnnotation
							']'
							?TypeAnnotation
							ObjectMemberTail
						@MethodSignature(*, *) doc // 方法签名(`x(): number`)
							name: PropertyName
							?'?'
							?TypeParameters
							Parameters
							?TypeAnnotation
							ObjectMemberTail
						@AccessorSignature(*, *) doc // 访问器签名(`get x(): number`、`set x(value): void`)
							?'get'
							?'set'
							name: PropertyName
							?'?'
							Parameters
							?TypeAnnotation
							ObjectMemberTail
						@ObjectMemberTail(result) // 对象成员尾部
							?','
							?';'
							if (@peek === ';') {
								result.semicolonToken = @readToken(';');
							} else if (@peek === ',') {
								result.commaToken = @readToken(',');
							} else if (@sameLine) {
								this.error({ start: this.lexer.current.end, end: this.lexer.current.end }, "Missing ';' after property.");
							}
			case 'new':
				return @ConstructorTypeNode();
				@ConstructorTypeNode // 构造函数类型节点(`new () => void`)
					'new' 
					?TypeParameters
					Parameters 
					'=>'
					return: TypeNode
			case '<':
				return @FunctionTypeNode(@TypeParameters(), @Parameters());
			case 'typeof':
				result = @TypeQueryNode();
				break;
				@TypeQueryNode extends TypeNode // 类型查询节点(`typeof x`)
					'typeof'
					operand: Expression(Precedence.postfix)
			case '=>':
				return @FunctionTypeNode();
			case 'numericLiteral':
			case 'stringLiteral':
			case 'true':
			case 'false':
				result = @LiteralTypeNode();
				break;
				@LiteralTypeNode // 字面量类型节点(`"abc"`、`true`)
					value: Expression(Precedence.primary)
			default:
				result = @GenericTypeOrTypeReferenceNode();
				break;
		}
	}
	while (getPrecedence(@peek) >= precedence) {
		switch (@peek) {
			case '.':
				result = @QualifiedNameTypeNode(result);
				continue;
				@QualifiedNameTypeNode(*) // 限定名称类型节点(`"abc"`、`true`)
					target: TypeNode // 目标部分
					'.'
					argument: Identifier(true) = @MemberCallArgument() // 参数部分
			case '[':
				if (@sameLine) {
					result = @ArrayTypeNode(result);
				}
				continue;
				@ArrayTypeNode(*) // 数组类型节点(`T[]`)
					target: TypeNode
					'['
					']'
			case '&':
			case '|':
			case 'is':
				result = @BinaryTypeNode(result);
				continue;
				@BinaryTypeNode(*) // 双目表达式(x + y、x = y、...)
					left: TypeNode // 左值部分
					operator: '&'|'|'|'is' // 运算类型
					right: TypeNode(getPrecedence(result.operator) + 1) // 右值部分
		}
		break;
	}
	return result;

@Expression(precedence = Precedence.any/*允许解析的最低操作符优先级*/, allowIn = true/*是否解析 in 表达式*/) // 表达式
	let result: @Expression;
	switch (@peek) {
		case 'identifier':
			result = @ArrowFunctionOrGenericExpressionOrIdentifier(allowIn);
			break;
			@ArrowFunctionOrGenericExpressionOrIdentifier(allowIn: boolean) // 箭头函数(`x => y`)或泛型表达式(`x<T>`)或标识符(`x`)
				let result = @Identifier();
				switch (@peek) {
					case '=>':
						result = @ArrowFunctionExpression(undefined, undefined, result, allowIn);
						break;
					case '<':
						if (@sameLine) {
							const savedState = @stashSave();
							const typeArguments = @TypeArguments();
							if (@current === '>' && (isBinaryOperator(@peek) || !isUnaryOperator(@peek))) {
								@stashClear(savedState);
								result = @GenericExpression(result, typeArguments);
							} else {
								@stashRestore(savedState);
							}
						}
						break;
						@GenericExpression(*, *) // 泛型表达式(`x<number>`)
							target: Identifier // 目标部分
							typeArguments: TypeArguments // 类型参数部分
				}
				return result;
				@Identifier(allowKeyword = false/*是否允许解析关键字*/) extends Expression // 标识符(`x`)
					value: 'identifier' // 值部分
					if (isIdentifierName(@peek) || (allowKeyword && isKeyword(@peek))) {
						const result = new @Identifier();
						result.start = @read;
						result.value = @lexer.current.value;
						result.end = @lexer.current.end;
						return result;
					}
					@error(@lexer.peek(), isKeyword(@peek) ? "Identifier expected; Keyword '{0}' cannot be used as an identifier." : "Identifier expected; Unexpected token '{0}'.", getTokenName(@peek));
					return @ErrorIdentifier();
					@ErrorIdentifier(start=@lexer.current.end/*标记的开始位置*/) // 错误的标识符占位符
						const result = new @ErrorIdentifier();
						result.start = start;
						result.end = @lexer.current.end;
						return result;
		case 'this':
		case 'null':
		case 'true':
		case 'false':
		case 'super':
			result = @SimpleLiteral();
			break;
			@SimpleLiteral // 简单字面量(`null`、`true`、`false`、`this`、`super`)
				type: 'this'|'null'|'true'|'false'|'super' // 类型
		case '(':
			result = @ArrowFunctionOrParenthesizedExpression(allowIn);
			break;
			@ArrowFunctionOrParenthesizedExpression(allowIn) // 箭头(`()=>...`)或括号表达式(`(x)`)
				const savedState = @stashSave();
				const parameters = @Parameters();
				if (@sameLine && (@peek === '=>' || @peek === ':' || @peek === '{')) {
					@stashClear(savedState);
					return @ArrowFunctionExpression(undefined, undefined, parameters, allowIn);
					@ArrowFunctionExpression(*, *, *, allowIn) // 箭头函数表达式(`x => {...}`、`(x, y) => {...}`)。
						?modifiers: Modifiers
						?typeParameters: TypeParameters
						?parameters: NodeList<ParameterDeclaration> | Identifier // 参数部分
						?TypeAnnotation
						=> 
						body: BlockStatement | Expression = @peek === '{' ? @BlockStatement() : @Expression(Precedence.assignment, allowIn)
				}
				@stashRestore(savedState);
				return @ParenthesizedExpression();
				@ParenthesizedExpression // 括号表达式(`(x)`)
					'('
					body: Expression // 主体部分
					')'
		case 'numericLiteral':
			result = @NumericLiteral();
			break;
			@NumericLiteral // 数字字面量(`1`)
				value: 'numericLiteral'
		case 'stringLiteral':
		case 'noSubstitutionTemplateLiteral':
			result = @StringLiteral();
			break;
			@StringLiteral // 字符串字面量(`'abc'`、`"abc"`、`\`abc\``)
				value: 'stringLiteral'
		case '[':
			result = @ArrayLiteral();
			break;
			@ArrayLiteral // 数组字面量(`[x, y]`)
				elements: [ ?ArrayLiteralElement , ...isExpressionStart ] // 元素列表
				@ArrayLiteralElement // 数组字面量元素(`x`)
					?'...'
					?value: Expression(Precedence.assignment)
					const result = new @ArrayLiteralElement();
					if (@peek !== ',' && @peek !== ']') {
						if (@peek === '...') result.dotDotDotToken = @readToken('...');
						result.value = @Expression(Precedence.assignment);
					}
					return result;
		case '{':
			result = @ObjectLiteral();
			break;
			@ObjectLiteral // 对象字面量(`{x: y}`)
				elements: { ?ObjectLiteralElement ... }
				@ObjectLiteralElement alias ObjectPropertyDeclaration | ObjectMethodDeclaration | ObjectAccessorDeclaration // 对象字面量元素(`x: y`、`x() {...}`)
					const modifiers = @Modifiers();
					switch (@peek) {
						//+ case 'identifier':
						//+ 	break;
						case 'get':
						case 'set':
							const savedToken = @lexer.current;
							@lexer.read();
							if (isKeyword(@peek) || @peek === '[') {
								return @ObjectAccessorDeclaration(modifiers, savedToken.type === 'get' ? savedToken.start : undefined, savedToken.type === 'set' ? savedToken.start : undefined);
								@ObjectAccessorDeclaration(*, *, *) doc // 访问器声明(`get x() {...}`、`set x(value) {...}`)
									?Modifiers
									?'get'
									?'set'
									name: PropertyName
									Parameters
									?TypeAnnotation
									?FunctionBody
									ObjectMemberTail
							}
							@lexer.current = savedToken;
							break;
						case '*':
							return @ObjectMethodDeclaration(modifiers, @read, @PropertyName());
					}
					const name = @PropertyName();
					switch (@peek) {
						case '(':
						case '<':
							return @ObjectMethodDeclaration(modifiers, undefined, name);
							@ObjectMethodDeclaration(*, *, *) doc // 方法声明(`x() {...}`)
								?Modifiers
								?'*'
								?name: PropertyName
								?TypeParameters
								Parameters
								?TypeAnnotation
								?FunctionBody
								ObjectMemberTail
						default:
							return @ObjectPropertyDeclaration(modifiers, name);
							@ObjectPropertyDeclaration(*, *, *) doc // 属性声明(`x: y`)
								?Modifiers
								key: PropertyName
								?':'
								?'='
								?value: Expression(Precedence.assignment)
								ObjectMemberTail
								const result = new @ObjectPropertyDeclaration();
								@DocComment(result);
								result.key = key;
								if (@peek === ':') {
									result.colonToken = @readToken(':');
									result.value = @Expression(Precedence.assignment);
								} else if (@peek === '=') {
									result.equalToken = @readToken('=');
									result.value = @Expression(Precedence.assignment);
								} else if(key.constructor !== @Identifier && key.constructor !== @MemberCallExpression) {
									@readToken(':');
								}
								@ObjectMemberTail(result);
								return result;
					}
		case 'function':
			result = @FunctionExpression();
			break;
		case 'new':
			result = @NewTargetOrNewExpression();
			break;
			@NewTargetOrNewExpression // new.target(`new.target`) 或 new 表达式(`new x()`)
				const newToken = @readToken('new');
				if (@peek === '.') {
					return @NewTargetExpression(newToken);
				}
				return @NewExpression(newToken);
				@NewTargetExpression(*) // new.target 表达式(`new.target`)
					'new' 
					'.'
					target
					const result = new @NewTargetExpression();
					result.newToken = newToken;
					result.dotToken = @readToken('.');
					if (@peek === 'identifier' && @lexer.peek().data === "target") {
						result.targetToken = @readToken('identifier');
						return result;
					}
					@error(@lexer.peek(), "'target' expected; Unexpected token '{0}'.", getTokenName(@peek));
					return @ErrorIdentifier(newToken);
				@NewExpression(*) // new 表达式(`new x()`、`new x`)
					'new'
					target: Expression(Precedence.member) 
					?arguments: Arguments
		case '/':
		case '/=':	
			result = @RegularExpressionLiteral();
			break;
			@RegularExpressionLiteral // 正则表达式字面量(/abc/)
				value: 'stringLiteral'
				?flags: 'stringLiteral' // 标志部分
				const result = new @RegularExpressionLiteral();
				const token = @lexer.readAsRegularExpressionLiteral();
				result.start = token.start;
				result.value = token.data.pattern;
	        	result.flags = token.data.flags;
	        	result.end = token.end;
	        	return result;
		case 'templateHead':
			result = @TemplateLiteral();
			break;
			@TemplateLiteral // 模板字面量(`\`abc\``)
				spans: NodeList<TemplateSpan|Expression> // 组成部分列表
				const result = new @TemplateLiteral()();
				result.spans = new @NodeList()<@Expression>();
				while (true) {
					result.spans.push(@TemplateSpan());
					result.spans.push(@Expression());
					if (@peek !== '}') {
		                @readToken('}');
		                break;
		            }
		            if (@lexer.readAsTemplateMiddleOrTail().type === 'templateTail') {
		                result.spans.push(@TemplateSpan());
		                break;
		            }
				}
				return result;
				@TemplateSpan // 模板文本区块(`\`abc${`、`}abc${`、`}abc\``)
					value: 'stringLiteral'
		case '<':
			result = @ArrowFunctionOrTypeAssertionExpression(allowIn);
			break;
			@ArrowFunctionOrTypeAssertionExpression(allowIn) // 箭头函数(`<T>() => {}`)或类型确认表达式(`<T>fn`)
				const savedState = @stashSave();
				const typeParameters = @TypeParameters();
				const parameters = @peek === '(' ? @Parameters() : isIdentifierName(@peek) : @Identifier() : undefined;
				if (parameters && @sameLine && (@peek === '=>' || @peek === ':' || @peek === '{')) {
					@stashClear(savedState);
					return @ArrowFunctionExpression(undefined, typeParameters, parameters, allowIn);
				}
				@stashRestore(savedState);
				return @TypeAssertionExpression();
				@TypeAssertionExpression() // 类型确认表达式(<T>xx)
					'<'
					type: TypeNode
					'>'
					operand: Expression(Precedence.postfix)
		case 'yield':
			result = @YieldExpression(allowIn);
			break;
			@YieldExpression(allowIn) // yield 表达式(`yield xx`)
				'yield' 
				?'*'
				?operand: Expression(Precedence.assignment, allowIn)
				const result = new @YieldExpression();
				result.yieldToken = @readToken('yield');
				if (@sameLine && @peek === '*') result.asteriskToken = @readToken('*');
				if (@sameLine && isExpressionStart(@peek)) result.operand = @Expression(Precedence.assignment, allowIn);
				return result;
		case 'await':
			result = @AwaitExpressionOrIdentifier(allowIn);
			break;
			@AwaitExpressionOrIdentifier(allowIn) // await 表达式(`await xx`)或标识符
				const savedToken = @lexer.current;
				@readToken('await');
				if (@sameLine && isExpressionStart(@peek)) {
					return @AwaitExpression(allowIn);
				}
				@lexer.current = savedToken;
				return @Identifier();
				@AwaitExpression(*, allowIn) // await 表达式(`await xx`)
					'await'
					operand: Expression(Precedence.assignment, allowIn)
		case 'class':
			result = @ClassExpression();
			break;
		case 'async':
			result = @AsyncFunctionExpressionOrIdentifier(allowIn);
			break;
			@AsyncArrowFunctionOrIdentifier(allowIn) // 异步函数表达式或标识符
				const savedState = @stashSave();
				const modifiers = @Modifiers();
				const typeParameters = @sameLine && @peek === '<' ? @TypeParameters() : undefined;
				if (@sameLine && (@peek === '(' || isIdentifierName(@peek))) {
					const parameters = @peek === '(' ? @Parameters() : @Identifier();
					if (@sameLine && (@peek === '=>' || @peek === ':' || @peek === '{')) {
						@stashClear(savedState);
						return @ArrowFunctionExpression(modifiers, typeParameters, parameters, allowIn);
					}
				}
				@stashRestore(savedState);
				return @Identifier();
		case '=>':
			result = @ArrowFunctionExpression(undefined, undefined, undefined, allowIn);
			break;
		default:
			if (isUnaryOperator(@peek)) {
				result = @UnaryExpression();
				break;
				@UnaryExpression // 一元运算表达式(`+x`、`typeof x`、...)
					operator: 'delete'|'void'|'typeof'|'+'|'-'|'~'|'!'|'++'|'--'|'...'
					operand: Expression(Precedence.postfix)
			}
			if (isIdentifierName(@peek)) {
				result = @ArrowFunctionOrGenericExpressionOrIdentifier(allowIn);
				break;
			}
			@error(@lexer.peek(), @isKeyword(@peek) ? "Expression expected; '{0}' is a keyword." : "Expression expected; Unexpected token '{0}'.", getTokenName(@peek));
			return @ErrorIdentifier(isStatementStart(@peek) ? @lexer.current.end : @read);
	}
	while (getPrecedence(@peek) >= precedence) {
		switch (@peek) {
			case '.':
				result = @MemberCallExpression(result);
				continue;
				@MemberCallExpression(*) // 成员调用表达式(x.y)
					target: Expression // 目标部分
					'.'
					argument: Identifier = @MemberCallArgument() // 参数部分
					@MemberCallArgument // 成员调用参数
						if (!@sameLine && isStatementStart(@peek)) {
							const savedState = @stashSave();
							@Statement();
							const isStatementStart = !savedState.errors.length;
							@stashRestore(savedState);
							if (isStatementStart) {
								return @ErrorIdentifier();
							}
						}
						return @Identifier(true);
			//+ case '=':
			//+ 	break;
			case '(':
				result = @FunctionCallExpression(result);
				continue;
				@FunctionCallExpression(*) // 函数调用表达式(`x()`)
					target: Expression 
					arguments: Arguments
					@Arguments list ( Argument , ...isArgumentStart ) // 函数调用参数列表
						@Argument // 函数调用参数(`x`)
							?'...'
							value: Expression(Precedence.assignment)
			case '[':
				result = @IndexCallExpression(result);
				continue;
				@IndexCallExpression(*) // 索引调用表达式(`x[y]`)
					target: Expression 
					'[' 
					argument: Expression
					']'
			case '?':
				result = @ConditionalExpression(result, allowIn);
				continue;
				@ConditionalExpression(*, allowIn) // 条件表达式(`x ? y : z`)
					condition: Expression 
					? 
					then: Expression(Precedence.assignment) // 则部分 
					: 
					else: Expression(Precedence.assignment, allowIn) // 否则部分
			case '++':
			case '--':
				if (!@sameLine) {
					return result;
				}
				result = @PostfixExpression(result);
				continue;
				@PostfixExpression(*) // 后缀表达式(`x++`、`x--`)
					operand: Expression(Precedence.leftHandSide) // 操作数
					operator: '++'|'--'
			case 'noSubstitutionTemplateLiteral':
				result = @TemplateCallExpression(parsed, @StringLiteral());
				continue;
			case 'templateHead':
				result = @TemplateCallExpression(parsed, @TemplateLiteral());
				continue;
				@TemplateCallExpression(*, *) // 模板调用表达式(`x\`abc\``)
					target: Expression 
					argument: TemplateLiteral | StringLiteral
			case '>':
				const savedToken = @lexer.current;
				@lexer.readAsGreaterThanTokens();
				@lexer.current = savedToken;
				break;
			case 'in':
				if (allowIn === false) {
					return result;
				}
				break;
		}
		result = @BinaryExpression(result, allowIn);
		@BinaryExpression(*, allowIn) // 双目表达式(x + y、x = y、...)
			left: Expression // 左值部分
			operator: ','|'*='|'/='|'%='|'+='|'‐='|'<<='|'>>='|'>>>='|'&='|'^='|'|='|'**='|'='|'||'|'&&'|'|'|'^'|'&'|'=='|'!='|'==='|'!=='|'<'|'>'|'<='|'>='|'instanceof'|'in'|'<<'|'>>'|'>>>'|'+'|'-'|'*'|'/'|'%'|'**' // 运算类型
			right: Expression // 右值部分
			const result = new @BinaryExpression();
			result.left = left;
			result.operator = @read;
			result.right = Expression(getPrecedence(result.operator) + (isRightHandOperator(result.operator) ? 0 : 1), allowIn);
			return result;
	}
	return result;

@Statement // 语句
	switch (@peek) {
		case 'identifier': 
			return @LabeledOrExpressionStatement(@Identifier());
			@LabeledOrExpressionStatement(parsed: @Expression) // 表达式或标签语句
				if (parsed.constructor === @Identifier && @peek === ':') {
					return @LabelledStatement(<@Identifier>parsed);
				}
				return @ExpressionStatement(parsed);
		        @LabelledStatement(*) doc // 标签语句(`x: ...`)
		        	label: Identifier
		        	':'
		        	statement: Statement // 主体部分
		        @ExpressionStatement(expression?: @Expression) // 表达式语句(`x();`)
		        	expression: Expression // 表达式部分
					const result = new @ExpressionStatement();
					result.expression = expression || @Expression();
					return result;
		case '{':
			return @BlockStatement();
			@BlockStatement // 语句块(`{...}`)
				statements: { ?Statement ... }
		case 'var':
		case 'const':
			return @VariableStatement();
			@VariableStatement(*, allowIn): // 变量声明语句(`var x`、`let x`、`const x`)
				?Modifiers
				type: 'var'|'let'|'const' 
				variables: VariableDeclaration , ...isBindingNameStart = @DelimitedList(allowIn === false ? @VariableDeclarationWithoutIn : @VariableDeclaration, undefined, undefined, isBindingNameStart)
				@VariableDeclarationWithoutIn() // 变量声明（不带 in）
					return @VariableDeclaration(false);
				@VariableDeclaration(allowIn) // 变量声明(`x = 1`、`[x] = [1]`、`{a: x} = {a: 1}`)
					mame: BindingName
					?TypeAnnotation
					?Initializer(allowIn)
		case 'let': 
			return @VariableOrExpressionStatement(true);
			@VariableOrExpressionStatement(allowIn = true) // 变量声明(`let x`)或表达式语句(`let(x)`)
				const savedToken = @lexer.current;
				switch (@peek) {
					case 'let':
					case 'var':
					case 'const':
						@lexer.read();
						const isBindingName = isBindingNameStart(@peek);
						@lexer.current = savedToken;
						if (isBindingName) {
							return @VariableStatement(allowIn);
						}
						break;
				}
				return @ExpressionStatement(@Expression(Precedence.any, allowIn));
		case 'function':
			return @FunctionDeclaration();
		case 'if':
			return @IfStatement();
			@IfStatement // if 语句(`if (x) ...`)
				'if' 
				Condition
				then: Statement
				?'else'
				?else: Statement
				const result = new @IfStatement();
		        result.ifToken = @readToken('if');
		        @Condition(result);
		        result.then = @EmbeddedStatement();
		        if (@peek === 'else') {
		            result.elseToken = @readToken('else');
		            result.else = @EmbeddedStatement();
		        }
		        return result;
			    @Condition(result) // 条件表达式
			    	?'('
			    	condition: Expression()
			    	?')'
					const hasParan = @peek === '(';
					if (hasParan || @options.allowMissingParenthese === false) result.openParanToken = @readToken('(');
					result.condition = @Expression();
					if (hasParan) result.closeParanToken = @readToken(')');
				@EmbeddedStatement // 内嵌语句
					return @Statement();
        case 'for'
            return @ForOrForInOrForOfOrForToStatement();
            @ForOrForInOrForOfOrForToStatement // for 或 for..in 或 for..of 或 for..to 语句
            	const forToken = @readToken('for');
		        const openParan = @peek === '(' || @options.allowMissingParenthese === false ? @readToken('(') : undefined;
		        const initializer = @peek === ';' ? undefined : @VariableOrExpressionStatement(false);
		        let type = @peek;
		        switch (type) {
		            //+ case ';':
		            //+    return @ForStatement(forToken, openParan, initializer);
		            case 'in':
		                return @ForInStatement(forToken, openParan, initializer);
		            case 'of':
		                return @ForOfStatement(forToken, openParan, initializer);
		            case 'to':
		                return @ForToStatement(forToken, openParan, initializer);
		            default:
		                return @ForStatement(forToken, openParan, initializer);
		        }
		        @ForStatement(*,*,*) // for 语句(`for(var i = 0; i < 9; i++) ...`)
		        	'for'
		        	?'('
		        	?initializer: VariableStatement | ExpressionStatement
		        	firstSemicolon: ';' // 条件部分中首个分号
		        	?condition: Expression
		        	secondSemicolon: ';' // 条件部分中第二个分号
					?iterator: Expression
		        	?')'
		        	statement: Statement = @EmbeddedStatement()
					const result = new @ForStatement();
					result.forToken = forToken;
					if (openParanToken != undefined) result.openParanToken = openParanToken;
					if (initializer != undefined) result.initializer = initializer;
					result.firstSemicolonToken = @readToken(';');
					if (@peek !== ';') result.condition = @Expression();
					result.secondSemicolonToken = @readToken(';');
					if (openParanToken == undefined ? isExpressionStart(iterator) : @peek !== ')') result.iterator = @Expression();
					if (openParanToken != undefined) result.closeParanToken = @readToken(')');
		        	result.body = @EmbeddedStatement();
					return result;
		        @ForInStatement(*,*,*) // for..in 语句(`for(var x in y) ...`)
		        	'for'
		        	?'('
		        	initializer: VariableStatement | ExpressionStatement
		        	'in'
		        	condition: Expression
		        	?')'
		        	statement: Statement
					const result = new @ForInStatement();
					result.forToken = forToken;
					if (openParanToken != undefined) result.openParanToken = openParanToken;
					result.initializer = initializer;
					result.inToken = @readToken('in');
					result.condition = @Expression();
					if (openParanToken != undefined) result.closeParanToken = @readToken(')');
		        	result.body = @EmbeddedStatement();
					return result;
		        @ForOfStatement(*,*,*) // for..of 语句(`for(var x of y) ...`)
		        	'for'
		        	?'('
		        	initializer: VariableStatement | ExpressionStatement
		        	'of'
		        	condition: Expression
		        	?')'
		        	statement: Statement
					const result = new @ForInStatement();
					result.forToken = forToken;
					if (openParanToken != undefined) result.openParanToken = openParanToken;
					result.initializer = initializer;
					result.ofToken = @readToken('of');
					result.condition = @Expression();
					if (openParanToken != undefined) result.closeParanToken = @readToken(')');
		        	result.body = @EmbeddedStatement();
					return result;
		        @ForToStatement(*,*,*) // for..to 语句(`for(var x = 0 to 10) ...`)
		        	'for'
		        	?'('
		        	initializer: VariableStatement | ExpressionStatement
		        	'to'
		        	expression: Expression
		        	?')'
		        	statement: Statement
					const result = new @ForInStatement();
					result.forToken = forToken;
					if (openParanToken != undefined) result.openParanToken = openParanToken;
					result.initializer = initializer;
					result.toToken = @readToken('to');
					result.condition = @Expression();
					if (openParanToken != undefined) result.closeParanToken = @readToken(')');
		        	result.body = @EmbeddedStatement();
					return result;
        case 'while'
            return @WhileStatement();
            @WhileStatement // while 语句(`while(x) ...`)
            	'while'
            	Condition
            	statement: Statement = @EmbeddedStatement()
        case 'switch'
            return @SwitchStatement();
            @SwitchStatement // switch 语句(`switch(x) {...}`)
            	'switch'
            	?Condition
            	cases: { ?CaseOrDefaultClause ... }
            	const result = new @SwitchStatement();
		        result.switchToken = @readToken('switch');
		        if (@options.allowMissingSwitchCondition === false || @peek !== '{') {
		            @Condition(result);
		        }
		        result.cases = @NodeList(@CaseOrDefaultClause, '{', '}');
		        return result;
		        @CaseOrDefaultClause // case(`case x: ...`) 或 default(`default: ...`) 分支
		        	switch (@peek) {
		        		case 'case':
		        			return @CaseClause();
		                case 'default':
		                    return @DefaultClause();
		                default:
		                	@error(@lexer.peek(), "'case' or 'default' expected; Unexpected token '{0}'.", getTokenName(@peek));
		                	return;
		        	}
					@CaseClause // case 分支(`case x: ...`)
			        	'case'
			        	labels: CaseClauseLabel , ...isCaseLabelStart // 标签列表
			        	':'
			        	statements: Statement ... = @NodeList(@CaseStatement)
			        	@CaseClauseLabel // case 分支标签(`case x: ...`)
			        		?'else'
			        		?label: Expression(Precedence.assignment)
							const result = new @CaseClauseLabel();
							if (@options.allowCaseElse !== false && @peek === 'else') {
								result.elseToken = @readToken('else');
							} else {
								result.label = @Expression(Precedence.assignment);
							}
							return result;
			        @DefaultClause // default 分支(`default: ...`)
			        	'default'
			        	':'
			        	statements: Statement ... = @NodeList(@CaseStatement)
			        	@CaseStatement // case 段语句
			        		switch (@peek) {
			                    case 'case':
			                    case 'default':
			                    case '}':
			                    case 'endOfFile':
			                        return;
			                    default:
			                        return @Statement();
			                }
			       
        case 'do'
            return @DoWhileStatement();
            @DoWhileStatement // do..while 语句(`do ... while(x);`)
            	'do'
            	statement: Statement = @EmbeddedStatement()
            	'while'
            	Condition
            	?';'
        case 'break'
            return @BreakStatement();
            @BreakStatement // break 语句(`break xx;`)
		        'break'
		        ?label: Identifier(false)
		        ?';'
		        const result = new @ContinueStatement();
		        @BreakOrContinueStatement(result, 'continue');
		        return result;
        case 'continue'
            return @ContinueStatement();
            @ContinueStatement // continue 语句(`continue xx;`)
		        'continue'
		        ?label: Identifier(false)
		        ?';'
		        const result = new @ContinueStatement();
		        @BreakOrContinueStatement(result, 'continue');
		        return result;
		    @BreakOrContinueStatement(result: @ContinueStatement, token: TokenType) // break(`break xx;`)或 continue(`continue xx;`)语句
		    	result.start = @readToken(token);
		    	if (!@tryReadSemicolon(result)) {
		    		result.label = @Identifier();
		    		@tryReadSemicolon(result);
		    	}
        case 'return'
            return @ReturnStatement();
            @ReturnStatement // return 语句(`return x;`)
            	'return'
            	?value: Expression
		        ?';'
            	const result = new @ReturnStatement();
            	result.returnToken = @readToken('return');
            	if (!@tryReadSemicolon(result)) {
            	    result.value = @Expression();
            		@tryReadSemicolon(result);
            	}
            	return result;
        case 'throw'
            return @ThrowStatement();
            ThrowStatement // throw 语句(`throw x;`)
            	'throw'
            	?value: Expression
		        ?';'
            	const result = new @ThrowStatement();
			    result.throwToken = @readToken('throw');
			    if (@options.allowRethrow === false || !@tryReadSemicolon(result)) {
			        result.value = @Expression();
			        !@tryReadSemicolon(result);
			    }
			    return result;
        case 'try'
            return @TryStatement();
            @TryStatement // try 语句(`try {...} catch(e) {...}`)
            	'try'
            	try: Statement
            	catch: CatchClause
            	finally: FinallyClause
                const result = new @TryStatement();
		        result.tryToken = @readToken('try');
		        result.try = @EmbeddedStatement();
		        if (@peek === 'catch') result.catch = @CatchClause();
		        if (@peek === 'finally') result.catch = @FinallyClause();
		        if (@options.allowSimpleTryBlock === false && !result.catch && !result.finally) {
		            @error(@lexer.peek(), "'catch' or 'finally' expected. Unexpected token '{0}'.", getTokenName(@lexer.peek()));
		        }
		        return result;
		        @CatchClause // catch 分句(`catch(e) {...}`)
		        	'catch'
		        	?'('
		        	?variable: BindingName
		        	?')'
		        	statement: Statement
		        	const result = new @CatchClause();
		        	result.catchToken = @readToken('catch');
					const hasParan = @peek === '(';
					if (hasParan || @options.allowMissingParenthese === false) result.openParan = @readToken('(');
					if (@options.allowMissingCatchVaribale === false || isBindingName(@peek)) {
						result.variable = @BindingName();
						if (@peek === ':') {
							@error(@peek, "Catch variable cannot have a type annotation; Unexpected token ':'.");
							@read;
							if (isTypeNodeStart(@peek)) {
								@TypeNode();
							}
						}
					}
					if (hasParan) result.closeParan = @readToken(')');
		            result.body = @EmbeddedStatement();
		            return result;
		        @FinallyClause // finally 分句(`finally {...}`)
		        	'finally'
		        	statement: Statement = @EmbeddedStatement()
        case 'debugger'
            return @DebuggerStatement();
            @DebuggerStatement // debugger 语句(`debugger;`)
            	'debugger'
            	?';'
		case ';':
			return @EmptyStatement();
			@EmptyStatement // 空语句(`;`)
				';'
        case 'endOfFile'
            return @ErrorStatement();
        case 'with'
            return @WithStatement();
            @WithStatement // with 语句(`with (x) ...`)
            	'with'
				?'('
            	value: VariableStatement | Expression
				?')'
				body: Statement
            	const result = new @WithStatement();
		        result.start = @readToken('with');
				const hasParan = @peek === '(';
				if (hasParan) result.openParanToken = @readToken('(');
				result.value = @options.allowWithVaribale !== false ? @VariableOrExpressionStatement() : @Expression();
				if (hasParan) result.closeParanToken = @readToken(')');
		        result.body = @EmbeddedStatement();
		        return result;
		case 'import':
			return @ImportAssignmentOrImportDeclaration();
		case 'export':
			return @ExportAssignmentOrExportDeclaration();
		case 'type':
			return @TypeAliasDeclaration();
		//+ case 'class':
		//+ 	return @ClassDeclaration();
		default:
			if (isDeclarationStart(@peek)) {
				return @DeclarationOrExpressionStatement();
			}
			return @ExpressionStatement(@Expression());
	}
		
@Declaration extends Statement // 声明
	@FunctionDeclarationOrExpression(result: @FunctionDeclaration | @FunctionExpression/* 解析的目标节点 */, modifiers: @NodeList<@Modifier>) // 函数声明或表达式
		@DocComment(result);
		if (modifiers) result.modifiers = modifiers;
		result.functionToken = @readToken('function');
		if (@peek === '*') result.asteriskToken = @read;
		if (isIdentifierName(@peek)) result.name = @Identifier();
		if (@peek === '<') result.typeParameters = @TypeParameters();
		result.parameters = @Parameters();
		@TypeAnnotation(result);
		@FunctionBody(result);
		@FunctionDeclaration(*, *) doc // 函数声明(`function fn() {...}`、`function *fn() {...}`)
			?Decorators
			?Modifiers
			'function'
			?'*'
			?name: Identifier
			?TypeParameters
			Parameters
			?TypeAnnotation
			?FunctionBody
			const result = new @FunctionDeclaration();
			if (decorators) result.decorators = decorators;
			@FunctionDeclarationOrExpression(result, modifiers);
			return result;
		@FunctionExpression(*) doc // 函数表达式(`function () {}`)
			?Modifiers
			'function'
			?'*'
			?name: Identifier
			?TypeParameters
			Parameters
			?TypeAnnotation
			?FunctionBody
			const result = new @FunctionDeclaration();
			@FunctionDeclarationOrExpression(result, modifiers);
			return result;
		@FunctionBody(result) // 函数主体(`{...}`、`=> xx`、`;`)
			?'=>'
			?body: BlockStatement | Expression
			?';'
			switch (@peek) {
				case '{':
					result.body = @BlockStatement();
					break;
				case '=>':
					result.arrowToken = @read;
					result.body = @Expression(Precedence.assignment);
					break;
				default:
					@tryReadSemicolon(result);
					break;
			}
	@ClassDeclarationOrExpression(result: @ClassDeclaration | @ClassExpression) // 类声明或类表达式
		@DocComment(result);
		result.classToken = @readToken('class');
		if (isIdentifierName(@peek) && @peek !== 'extends' && @peek !== 'implements') result.name = @Identifier();
		if (@peek === '<') result.typeParameters = @TypeParameters();
		@ExtendsClause(result);
		@ImplementsClause(result);
		@ClassBody(result);
		@ClassDeclaration(*, *) doc // 类声明(`class xx {}`)
			?Decorators
			?Modifiers
			'class' 
			name?: Identifier
			?TypeParameters
			?ExtendsClause
			?ImplementsClause
			?ClassBody
			const result = new @ClassDeclaration();
			if (decorators) result.decorators = decorators;
			if (modifiers) result.modifiers = modifiers;
			@ClassDeclarationOrExpression(result);
			return result;
		@ClassExpression doc // 类表达式(`class xx {}`)
			'class' 
			name?: Identifier
			?TypeParameters
			?ExtendsClause
			?ImplementsClause
			?ClassBody
			const result = new @ClassExpression();
			@ClassDeclarationOrExpression(result);
			return result;
		@ExtendsClause(result) // extends 分句(`extends xx`)
			?'extends'
			?extends: ClassHeritageNode , ... isExpressionStart
		@ImplementsClause(result) // implements 分句(`implements xx`)
			?'implements'
			?implements: ClassHeritageNode , ... isExpressionStart
			@ClassHeritageNode // extends 或 implements 分句项
				value: Expression(Precedence.leftHandSide)
		@ClassBody(result) // 类主体(`{...}`、`;`)
			?members: { ClassElement ... }
			?';'
			if (@peek === '{') {
				result.members = @NodeList(@ClassElement, '{', '}');
			} else {
				@tryReadSemicolon(result);
			}
			@ClassElement alias MethodDeclaration | PropertyDeclaration | AccessorDeclaration // 类成员
				const decorators = @Decorators();
				const modifiers = @Modifiers();
				switch (@peek) {
					case 'identifier':
						break;
					case 'get':
					case 'set':
						const savedToken = @lexer.current;
						@lexer.read();
						if (isKeyword(@peek) || @peek === '[') {
							return @AccessorDeclaration(decorators, modifiers, savedToken.type === 'get' ? savedToken.start : undefined, savedToken.type === 'set' ? savedToken.start : undefined);
							@AccessorDeclaration(*, *, *, *) doc // 访问器声明(`get x() {...}`、`set x(value) {...}`)
								?Decorators
								?Modifiers
								?'get'
								?'set'
								name: PropertyName
								Parameters
								?TypeAnnotation
								?FunctionBody
						}
						@lexer.current = savedToken;
						break;
					case '*':
						return @MethodDeclaration(decorators, modifiers, @read, @PropertyName());
				}
				const name = @PropertyName();
				switch (@peek) {
					case '(':
					case '<':
						return @MethodDeclaration(decorators, modifiers, undefined, name);
						@MethodDeclaration(*, *, *, *) doc // 方法声明(`x() {...}`)
							?Decorators
							?Modifiers
							?'*'
							?name: PropertyName
							?TypeParameters
							Parameters
							?TypeAnnotation
							?FunctionBody
					default:
						return @PropertyDeclaration(decorators, modifiers, name);
						@PropertyDeclaration(*, *, *) doc // 属性声明(`x: number`)
							?Decorators
							?Modifiers
							name: PropertyName
							?TypeAnnotation
							?Initializer
				}
	@InterfaceDeclaration(*, *) doc // 接口声明(`interface T {...}`)
		?Decorators
		?Modifiers
		'interface'
		name: Identifier(false)
		?TypeParameters
		?ExtendsClause
		members: { TypeMemberSignature ... }
	@EnumDeclaration(*, *) doc // 枚举声明(`enum T {}`)
		?Decorators
		?Modifiers
		'enum'
		name: Identifier(false)
		?ExtendsClause
		members: { ?EnumMemberDeclaration , ...isPropertyNameStart }
		@EnumMemberDeclaration // 枚举成员声明(`x`、`x = 1`)
			name: PropertyName
			?Initializer
	@NamespaceOrModuleDeclaration(result: @NamespaceDeclaration | @ModuleDeclaration, decorators: @NodeList<@Decorator>, modifiers: @NodeList<@Modifier>, type: TokenType) doc // 命名空间或模块声明
		@DocComment(result);
		if (decorators) result.decorators = decorators;
		if (modifiers) result.modifiers = modifiers;
		if (type === @namespace) result.namespaceToken = @readToken(type);
		else result.moduleToken = @readToken(type);
		if (type === 'module' && @peek === 'stringLiteral') {
			(<@ModuleDeclaration>result).name = @StringLiteral();
		} else {
			result.name = @Identifier();
			while (@peek === '.') {
				result.name = @MemberCallExpression(result.name);
			}
		}
		@BlockBody(result);
		@NamespaceDeclaration(*, *) doc // 命名空间声明(`namespace T {}`)
			?Decorators
			?Modifiers
			'namespace'
			name: Identifier | MemberCallExpression
			BlockBody
			const result = new @NamespaceDeclaration();
			@NamespaceOrModuleDeclaration(result, decorators, modifiers, 'namespace');
			return result;
		@ModuleDeclaration(*, *) doc // 模块声明(`module T {}`)
			?Decorators
			?Modifiers
			'module'
			name: Identifier | MemberCallExpression | StringLiteral
			BlockBody
			const result = new @ModuleDeclaration();
			@NamespaceOrModuleDeclaration(result, decorators, modifiers, 'module');
			return result;
		@BlockBody(result) // 语句块主体(`{...}`)
			statements: { Statement ... }
			result.statements = @NodeList(@Statement, '{', '}');
	@ExtensionDeclaration(*, *) doc // 扩展声明(`extends T {}`)
		?Decorators
		?Modifiers
		'extends'
		type: TypeNode
		?ExtendsClause
		?ImplementsClause
		?ClassBody
	@DeclarationOrExpressionStatement // 声明或表达式语句
		const savedState = @stashSave();
		const decorators = @Decorators();
		const modifiers = @Modifiers();
		switch (@peek) {
			case 'function':
				@stashClear(savedState);
				return @FunctionDeclaration(decorators, modifiers);
			case 'class':
				@stashClear(savedState);
				return @ClassDeclaration(decorators, modifiers);
			case 'interface':
				@stashClear(savedState);
				return @InterfaceDeclaration(decorators, modifiers);
			case 'enum':
				@stashClear(savedState);
				return @EnumDeclaration(decorators, modifiers);
			case 'namespace':
				@stashClear(savedState);
				return @NamespaceDeclaration(decorators, modifiers);
			case 'module':
				@stashClear(savedState);
				return @ModuleDeclaration(decorators, modifiers);
			case 'extends':
				@stashClear(savedState);
				return @ExtensionDeclaration(decorators, modifiers);
			default:
				@stashRestore(savedState);
				return @ExpressionStatement(@Expression());
		}
	@Decorators // 修饰器列表
		decorators: Decorator ...  // 修饰器列表
		let result: @NodeList<@Decorator>;
		while (@peek === '@') {
			if (!result) result = new @NodeList<@Modifier>();
			result.push(@Decorator());
		}
		return result;
		@Decorator // 修饰器(`@x`)
			'@'
			body: Expression(Precedence.leftHandSide)
	@Modifiers // 修饰符列表
		modifiers: Modifier ...
		let result: @NodeList<@Modifier>;
		while (isModifier(@peek)) {
			const savedToken = @lexer.current;
			const modifier = @Modifier();
			switch (modifier.type) {
				case 'export':
					if (!result) result = new @NodeList()<@Modifier>();
					result.push(modifier);
					if (@peek === 'default') {
						result.push(@Modifier());
					}
					continue;
				case 'const':
					if (@peek === 'enum') {
						if (!result) result = new @NodeList()<@Modifier>();
						result.push(modifier);
						continue;
					}
					break;
				default:
					if (@sameLine) {
						if (!result) result = new @NodeList()<@Modifier>();
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
			type: 'export'|'default'|'declare'|'const'|'static'|'abstract'|'readonly'|'async'|'public'|'protected'|'private'
	@TypeAliasDeclaration // 类型别名声明(`type A = number;`)
		'type'
		name: Identifier
		?TypeParameters
		'='
		TypeNode
		?';'
	@ImportAssignmentOrImportDeclaration // import 赋值或 import 声明
		const importToken = @read;
		const imports = @DelimitedList(@ImportClause, undefined, undefined, isBindingNameStart);
		if (@peek === '=' && imports.length === 1 && imports[0].constructor === @SimpleImportClause && (<@SimpleImportClause>imports[0]).name == null) {
			return @ImportAssignmentDeclaration(importToken, (<@SimpleImportClause>imports[0]).variable);
		}
		return @ImportDeclaration(importToken, imports);
		@ImportAssignmentDeclaration(*, *) // import 赋值声明
			'import'
			variable: Identifier // 别名
			'='
			value: Expression(Precedence.assignment)
			?';'
		@ImportDeclaration(*, *) // import 声明(`import x from '...';`)
			'import'
			?variables: ImportClause , ...
			?'from' = imports ? @readToken(@from) : undefined
			from: StringLiteral // 导入模块名
			?';'
			const result = new @ImportDeclaration();
			if (variables) {
				result.variables = variables;
				result.fromToken = @readToken('from');
			}
			result.from = @StringLiteral();
			return result;
			@ImportClause alias SimpleImportOrExportClause | NamespaceImportClause | NamedImportClause // import 分句(`x`、`{x}`、...)
				switch (@peek) {
					//+ case 'identifier':
					//+		return @SimpleImportOrExportClause(true);
					case '*':
						return @NamespaceImportClause();
						@NamespaceImportClause // 命名空间导入分句(`* as x`)
							*
							as
							variable: Identifier
					case '{':
						return @NamedImportClause();
						@NamedImportClause // 对象导入分句(`{x, x as y}`)
							elements: { SimpleImportOrExportClause , ... }
							const result = new @NamedImportClause();
							result.elements = @DelimitedList(@SimpleImportClause, '{', '}', isIdentifierName);
							return result;
					default:
						return @SimpleImportClause();
						@SimpleImportClause // 简单导入分句
							return @SimpleImportOrExportClause(true);
				}
				@SimpleImportOrExportClause(importClause: boolean/* 解析 import 分句*/) // 简单导入或导出分句(`x`、`x as y`)
					?name: Identifier(true) // 导入或导出的名称
					?'as' 
					variable: Identifier // 导入或导出的变量
					const result = new @SimpleImportOrExportClause();
					const nameOrVariable = @Identifier(true);
					if (@peek === @as) {
						result.name = nameOrVariable;
						result.asToken = @read;
						result.variable = @Identifier(!importClause);
					} else {
						if (importClause && !isIdentifierName(@current)) {
							@error(@lexer.current, "Identifier expected; Keyword '{0}' cannot be used as an identifier.", getTokenName(@current));
						}
						result.variable = nameOrVariable;
					}
					return result;
	@ExportAssignmentOrExportDeclaration // export 赋值或 export 声明
		const savedState = @lexer.current;
		const exportToekn = @read;
		switch (@peek) {
			case 'function':
				@lexer.current = savedState;
				return @FunctionDeclaration(undefined, @Modifiers());
			case 'class':
				@lexer.current = savedState;
				return @ClassDeclaration(undefined, @Modifiers());
			case 'interface':
				@lexer.current = savedState;
				return @InterfaceDeclaration(undefined, @Modifiers());
			case 'enum':
				@lexer.current = savedState;
				return @EnumDeclaration(undefined, @Modifiers());
			case 'namespace':
				@lexer.current = savedState;
				return @NamespaceDeclaration(undefined, @Modifiers());
			case 'module':
				@lexer.current = savedState;
				return @ModuleDeclaration(undefined, @Modifiers());
			case 'var':
			case 'let':
			case 'const':
				@lexer.current = savedState;
				return @VariableStatement(@Modifiers());
			case '*':
				return @ExportNamespaceDeclaration(exportToekn);
				@ExportNamespaceDeclaration(*) // 导出列表声明(`export * from ...`)
					'export'
					'*'
					'from'
					from: StringLiteral // 导入模块名
					?';'
			case '{':
				return @ExportListDeclaration(exportToekn);
				@ExportListDeclaration(*) // 导出列表声明(`export a from ...`)
					'export'
					variables: { SimpleImportOrExportClause ... }
					'from'
					from: StringLiteral // 导入模块名
					?';'
			case '=':
				return @ExportAssignmentDeclaration(start);
				@ExportAssignmentDeclaration(*) // 导出赋值声明(`export = 1;`)
					'export'
					'='
					value: Expression(Precedence.assignment)
					?';'
			default:
				// @lexer.current = savedState;
				// @error(@peek, "Declaration or statement expected. Unexpected token '{0}'.", getTokenName(@peek));
				return @ExportDefaultDeclaration(@Modifiers());
				@ExportDefaultDeclaration(*)  // export default 声明(`export default x = 1;`)
					?Modifiers
					expression: Expression(Precedence.assignment)
					?';'
		}

@DocComment(result) // 文档注释
