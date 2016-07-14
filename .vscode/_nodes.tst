TypeNode:
	UnionOrIntersectionOrPrimaryTypeNode
	FunctionTypeNode
	ConstructorTypeNode

UnionOrIntersectionOrPrimaryTypeNode:
	UnionTypeNode
	IntersectionOrPrimaryTypeNode

UnionTypeNode:
	UnionOrIntersectionOrPrimaryTypeNode	| IntersectionOrPrimaryTypeNode

IntersectionOrPrimaryTypeNode:
	IntersectionTypeNode
	PrimaryTypeNode

IntersectionTypeNode:
	IntersectionOrPrimaryTypeNode	& PrimaryTypeNode

PrimaryTypeNode:
	PredefinedTypeNode
	ParenthesizedTypeNode
	TypeReference
	ObjectTypeNode
	ArrayTypeNode
	TupleTypeNode
	TypeQuery
	ThisTypeNode

ParenthesizedTypeNode:
	( TypeNode )

PredefinedTypeNode:
	any
	number
	boolean
	string
	symbol
	void

ObjectTypeNode:
	{ TypeBody? }

TypeReference:
	TypeName [no_LineTerminator_here] TypeArguments?

TypeParameters:
	< TypeParameterList	>

TypeParameterList:
	TypeParameter
	TypeParameterList	, TypeParameter

TypeParameter:
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

ArrayTypeNode:
	PrimaryTypeNode [no_LineTerminator_here]	[ ]

TupleTypeNode:
	[ TupleElementTypes	]

TupleElementTypes:
	TupleElementTypeNode
	TupleElementTypes	, TupleElementTypeNode

TupleElementTypeNode:
	TypeNode

FunctionTypeNode:
	TypeParameters? ( ParameterList? ) => TypeNode

ConstructorTypeNode:
	new TypeParameters? ( ParameterList? ) => TypeNode

TypeQuery:
	typeof TypeQueryExpression

TypeQueryExpression:
	IdentifierReference
	TypeQueryExpression	. IdentifierName

ThisTypeNode:
	this

PropertySignature:
	PropertyName ?? TypeAnnotation?

PropertyName:
	IdentifierName
	StringLiteral
	NumericLiteral

TypeAnnotation:
	: TypeNode

CallSignature:
	TypeParameters? ( ParameterList? ) TypeAnnotation?

ParameterList:
	RequiredParameterList
	OptionalParameterList
	RestParameter
	RequiredParameterList	, OptionalParameterList
	RequiredParameterList	, RestParameter
	OptionalParameterList	, RestParameter
	RequiredParameterList	, OptionalParameterList	, RestParameter

RequiredParameterList:
	RequiredParameter
	RequiredParameterList	, RequiredParameter

RequiredParameter:
	AccessibilityModifier? BindingIdentifierOrPattern TypeAnnotation?
	BindingIdentifier : StringLiteral

AccessibilityModifier:
	public
	private
	protected

BindingIdentifierOrPattern:
	BindingIdentifier
	BindingPattern

OptionalParameterList:
	OptionalParameter
	OptionalParameterList	, OptionalParameter

OptionalParameter:
	AccessibilityModifier? BindingIdentifierOrPattern	? TypeAnnotation?
	AccessibilityModifier? BindingIdentifierOrPattern TypeAnnotation? Initializer
	BindingIdentifier ? : StringLiteral

RestParameter:
	... 	BindingIdentifier TypeAnnotation?

ConstructSignature:
	new TypeParameters? ( ParameterList? ) TypeAnnotation?

IndexSignature:
	[ BindingIdentifier : string ] TypeAnnotation
	[ BindingIdentifier : number ] TypeAnnotation

MethodSignature:
	PropertyName ?? CallSignature
