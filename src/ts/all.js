var io = require("F:\\Node\\node_modules\\tutils\\node\\io");
var files = io.getFiles("F:\\Teal\\TealScript\\src\\ts");

for(var i = 0; i < files.length; i++){
	var content = io.readFile(files[i]);
	
	content = content.replace(/(TokenType\.)([A-Z])(\w*)(Token|Trivia|Keyword)/g, function(all, tokenType, u, rest, tail){
		return tokenType + u.toLowerCase() + rest;
	})
	
	io.writeFile(files[i], content);
}