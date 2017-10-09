var credentials = require('./credentials.json');

var mysql=require("mysql");
		

var databases = [];

credentials.host="ids";
var connection = mysql.createConnection(credentials);

connection.connect(function(err) {
	if(err){
		console.log("Problems with MySQL: "+err);
	} else {
		console.log("Connected to Database.");
	}
});

function getDatabaseNames(rows) {
	for(var i = 0; i < rows.length; i++) {
		var database = new Object();
		database.title = rows[i].Database;
		database.tables = [];
		databases.push(database);
	}
}

function getTableNames(rows, index) {
	for(var i = 0; i < rows.length; i++) {
		function outer2(i) {
			var tableName = rows[i][Object.keys(rows[i])[0]];
			databases[index].tables.push(tableName);
			getTableDescription(index, i);
		}
		outer2(i);
	}
}

function getTableDescription(databaseIndex, tableIndex) {
	connection.query('DESCRIBE ' + databases[databaseIndex].title + ".`" + databases[databaseIndex].tables[tableIndex] + "`", function(err,rows,fields){
		if(err){
			console.log('Error looking up table description.' + err);
		} else {
			if(tableIndex == 0)
			{
			console.log("---|" + databases[databaseIndex].title + ">");
			}
			var formatted = getDescription(rows, databaseIndex, tableIndex);
			console.log("......|" + databases[databaseIndex].title + "." + databases[databaseIndex].tables[tableIndex] + formatted);
		}
	});
}

function getDescription(rows,databaseIndex,tableIndex)
{
	var text = "";
	for(var i = 0; i < rows.length; i++) {
		function outer3(i) {
			text += "\n\t" + "FieldName: `" + rows[i].Field + "`\t(" + rows[i].Type + ")";
		}
		if(i == rows.length -1 && databaseIndex == databases.length - 1 && tableIndex == databases[databaseIndex].tables.length - 1) {
			connection.end()
		}
		outer3(i);
	}
	return text;
}

function getDatabases() {
	connection.query('SHOW DATABASES', function(err,rows,fields){
		if(err){
			console.log('Error looking up databases.');
		} else {
			getTables(getDatabaseNames(rows));
		}
	});
			
}

function getTables() {
	var i;
	for(i = 0; i < databases.length; i++)
	{
		function outer(i) {
			getTable(i);
		}
		outer(i);
	}

}



function getTable(index) {
	connection.query('SHOW TABLES FROM ' + databases[index].title, function(err,rows,fields){
		if(err){
			console.log(err);
			console.log('Error looking up tables.');
		} else {
			getTableNames(rows, index);
		}
	});
}


getDatabases(getTables);

console.log("All done now.");

