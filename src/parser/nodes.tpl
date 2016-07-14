#region 类型

TypeNode: // 类型节点(`number`、`string[]`、...)
	UnionOrIntersectionOrPrimaryTypeNode:
		UnionTypeNode: -> BinaryTypeNode
			UnionOrIntersectionOrPrimaryTypeNode | IntersectionOrPrimaryTypeNode
		IntersectionOrPrimaryTypeNode:
			IntersectionTypeNode: -> BinaryTypeNode
				IntersectionOrPrimaryTypeNode & PrimaryTypeNode
			PrimaryTypeNode:
				GenericTypeNode: // 泛型节点(`Array<T>`)。
					TypeName [no_LineTerminator_here] TypeArguments?
				TypeName:
					PredefinedTypeNode // 内置类型节点(`number`、`string`、...)
						any
						number
						boolean
						string
						symbol
						void
						never
						null
						*
						?
						this
					IdentifierTypeNode // 标识符类型节点(`x`)
					QualifiedNameTypeNode: // 限定名称类型节点(`"abc"`、`true`)
						TypeName . IdentifierReference
				ParenthesizedTypeNode: // 括号类型节点(`(number)`)
					( body:TypeNode )
				ObjectTypeNode:
					{ TypeBody? }
				ArrayTypeNode:
					PrimaryTypeNode [no_LineTerminator_here]	[ ]
				TupleTypeNode:
					[ TupleElementTypes	]
					- TupleElementTypes:
						TupleElementTypeNode:
							TypeNode
						TupleElementTypes	, TupleElementTypeNode
				TypeQueryNode: // 类型查询节点(`typeof x`)。
					typeof operand:TypeQueryExpression
	FunctionTypeNode:
		TypeParameterDeclarations? ParameterDeclarations@try => TypeNode
	ConstructorTypeNode: // 构造函数类型节点(`new ()=>void`)。
		new TypeParameterDeclarations? ParameterDeclarations => TypeNode

ParameterDeclarations: // @name=parameters
	( ParameterDeclarationList? )

TypeParameterDeclarations: // @name=typeParameters
	< TypeParameterDeclarationList	>

TypeParameterDeclarationList:
	TypeParameterDeclaration
	TypeParameterDeclarationList	, TypeParameterDeclaration

TypeParameterDeclaration:
	BindingIdentifier Constraint?

Constraint:
	extends TypeNode

TypeArguments:
	< TypeArgumentList	>

TypeArgumentList:
	TypeArgument
	TypeArgumentList	, TypeArgument

TypeArgument:
	TypeNode

TypeBody:
	TypeMemberList	;?
	TypeMemberList	,?

TypeMemberList:
	TypeMember
	TypeMemberList	; TypeMember
	TypeMemberList	, TypeMember

TypeMember:
	PropertySignature
	CallSignature
	ConstructSignature
	IndexSignature
	MethodSignature

TypeQueryExpression:
	IdentifierReference
	TypeQueryExpression	. IdentifierName

PropertySignature:
	PropertyName ?? TypeAnnotation?

PropertyName:
	IdentifierName
	StringLiteral
	NumericLiteral

TypeAnnotation:
	 TypeNode

CallSignature:
	TypeParameterDeclarations? ( ParameterDeclarationList? ) TypeAnnotation?

ParameterDeclarationList:
	RequiredParameterDeclarationList
	OptionalParameterDeclarationList
	RestParameter
	RequiredParameterDeclarationList	, OptionalParameterDeclarationList
	RequiredParameterDeclarationList	, RestParameter
	OptionalParameterDeclarationList	, RestParameter
	RequiredParameterDeclarationList	, OptionalParameterDeclarationList	, RestParameter

RequiredParameterDeclarationList:
	RequiredParameter
	RequiredParameterDeclarationList	, RequiredParameter

RequiredParameter:
	AccessibilityModifier? BindingIdentifierOrPattern TypeAnnotation?
	BindingIdentifier  StringLiteral

AccessibilityModifier:
	public
	private
	protected

BindingIdentifierOrPattern:
	BindingIdentifier
	BindingPattern

OptionalParameterDeclarationList:
	OptionalParameter
	OptionalParameterDeclarationList	, OptionalParameter

OptionalParameter:
	AccessibilityModifier? BindingIdentifierOrPattern	? TypeAnnotation?
	AccessibilityModifier? BindingIdentifierOrPattern TypeAnnotation? Initializer
	BindingIdentifier ?  StringLiteral

RestParameter:
	... 	BindingIdentifier TypeAnnotation?

ConstructSignature:
	new TypeParameterDeclarations? ( ParameterDeclarationList? ) TypeAnnotation?

IndexSignature:
	[ BindingIdentifier  string ] TypeAnnotation
	[ BindingIdentifier  number ] TypeAnnotation

MethodSignature:
	PropertyName ?? CallSignature

#endregion