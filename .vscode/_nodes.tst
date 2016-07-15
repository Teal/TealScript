TypeNode: // 类型节点(`number`、`string[]`、...)。
	UnionOrIntersectionOrPrimaryTypeNode:
		UnionTypeNode:
			UnionOrIntersectionOrPrimaryTypeNode	| IntersectionOrPrimaryTypeNode
		IntersectionOrPrimaryTypeNode:
			IntersectionTypeNode:
				IntersectionOrPrimaryTypeNode	& PrimaryTypeNode
			PrimaryTypeNode:
				PredefinedTypeNode // 内置类型节点(`number`、`string`、...)。
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
				ParenthesizedTypeNode
					( body:TypeNode )
				TypeReference
					TypeName [no_LineTerminator_here] TypeArguments?
				ObjectTypeNode
					{ TypeBody? }
				ArrayTypeNode
					PrimaryTypeNode [no_LineTerminator_here]	[ ]
				TupleTypeNode
					[ TupleElementTypes	]
				TypeQuery
					typeof TypeQueryExpression
	FunctionTypeNode:
		TypeParameterDeclarations? ParameterDeclarations => TypeNode
	ConstructorTypeNode: // 构造函数类型节点(`new ()=>void`)。
		new TypeParameterDeclarations? ParameterDeclarations => TypeNode

parameters:ParameterDeclarations:
	( ParameterDeclarationList? )

typeParameters:TypeParameterDeclarations:
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

TypeName:
	IdentifierReference
	NamespaceName . IdentifierReference

NamespaceName:
	IdentifierReference
	NamespaceName . IdentifierReference

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

TupleElementTypes:
	TupleElementTypeNode
	TupleElementTypes	, TupleElementTypeNode

TupleElementTypeNode:
	TypeNode

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