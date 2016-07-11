var io = require("F:\\Node\\node_modules\\tutils\\node\\io");

function replaceTokenTypes(){
	var files = io.getFiles("F:\\Teal\\TealScript\\src\\ts");
	for(var i = 0; i < files.length; i++){
		var content = io.readFile(files[i]);
		
		content = content.replace(/(TokenType\.)([A-Z])(\w*)(Token|Trivia|Keyword)/g, function(all, tokenType, u, rest, tail){
			return tokenType + u.toLowerCase() + rest;
		})
		
		io.writeFile(files[i], content);
	}
}

function replaceClassMember(p){
	var c = io.readFile(p);
	
	var members = [];
	c = c.replace(/^        (function|var|let|const)\s([\w$]+)/mg, function(t, type, name){
		members.push(name);
		return "        private " + name;
	})
	console.log(members)
	for(var i = 0; i < members.length; i++){
		c = c.replace(new RegExp("\\b" + members[i] + "\\b", "g"), function(name, pos){
			if(c.charAt(pos - 1) === '.') return name;
			return 'this.' + name;
		});
	}
	
	c = c.replace(/NodeArray/g, "NodeList")
	c = c.replace(/Debug\.assert/g, "console.assert")
	
	c = c.replace(/\b[A-Z]\w+/g, function(name, pos){
			if(c.charAt(pos - 1) === '.') return name;
			return 'Nodes.' + name;
		})
	
	c = c.replace(/private\sthis\./g, "private ")
	c = c.replace(/private\sNodes\./g, "private ")
	c = c.replace(/Nodes\.TokenType/g, "TokenType")
	io.writeFile(p + ".ts", c);
	
}

replaceClassMember("F:\\Teal\\TealScript\\src\\ts\\compiler\\parser.ts");