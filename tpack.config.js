var tpack = require("tpack");

tpack.task("gen", function () {

	tpack.src("src/parser/nodes.json").pipe(function(file){
		var data = JSON.parse(file.content);
		
		
		
	}).extension(".ts");

});
