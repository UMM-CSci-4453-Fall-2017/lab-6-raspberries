var credentials = require('./credentials.json');

var mysql=require("mysql");
		
// array of database objects
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

// creates a database object for each database
function getDatabaseNames(rows) {
	for(var i = 0; i < rows.length; i++) {
		var database = new Object();
		database.title = rows[i].Database;
		database.tables = [];
		databases.push(database);
	}
}

// adds table names to database object
// calls getTabeDescription for each table
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

// calls DESCRIBE for each table
// calls detDescription for each table column
// prints everything
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

// formats table descriptions for output correctly
// connection ends here
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

// uses a query to get databases
// calls getTables with callback getDatabaseNames
function getDatabases() {
	connection.query('SHOW DATABASES', function(err,rows,fields){
		if(err){
			console.log('Error looking up databases.');
		} else {
			getTables(getDatabaseNames(rows));
		}
	});
			
}

// calls GetTable for each database
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


// calls getTableNames for a database
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


// script starts here
// calls getDatabases 
getDatabases();

console.log("All done now.");

