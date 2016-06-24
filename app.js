var express = require('express'); 
var bodyp=require('body-parser');
var promise = require('bluebird');
var path = require('path');
var str;
var result;
var temp;

var app = express();

var options =  {
	promiseLib: promise
};

var pgp = require('pg-promise')(options);
var db = pgp('postgres://postgres:Computer1@localhost:5432/testdb');

app.set('view engine','hbs');
app.set('views', path.join(__dirname,'views'));

app.use(express.static(__dirname+ '/public'));
app.use(bodyp.urlencoded({extend: true}));


//loading the root 
app.get('/', function (req, res) {   
	db.query('SELECT message from chats').then(function (data) {
		res.render('index',{chats:data});
		});
	/*
	db.any('SELECT * from todo ORDER BY count desc limit 5').then(function (data) {
		res.render('index',{mes:data});
		});
		*/
	 });


/*
app.get("/users/:id",function(req,res,next){
	res.send(req.params.id+"<br>"+req.params.username+"<br>"+req.params.password);
});*/

//loading the root 
app.get('/trending', function (req, res) {   
	db.any('SELECT * from todo ORDER BY count desc limit 5').then(function (data) {
		res.render('index',{mes:data});
		});
	 });

app.post('/sent', function (req, res) { 
	str = req.body.message;
	result=str.split(' ');
	var arrayLength = result.length;
	var insertQuery;
	var updateQuery;
	var selectQuery;

	
	//to store the parsed words into the database and keep a count
	for (var i = 0; i < arrayLength; i++) {
		insertQuery="INSERT INTO todo(message,count) values ( \'"+String(result[i])+"\',1);";
		updateQuery="Update todo set count=count+1 where message = \'"+String(result[i])+"\';";
		selectQuery="SELECT count from todo where message = \'"+String(result[i])+"\';";
	    /*

		 console.log(String(result[i]));
		 //searching if the message is repeated if not initialize to zero
		db.any("SELECT count from todo where message = $1",[result[i]]).then(function (data) {
		 if((data%1)!==0){
		 	console.log(i);
		 	console.log(String(result[i]));
			db.any("Update todo set count=count+1 where message =$1",[String(result[i])]);
		}
		else{
			console.log(i);
			console.log(String(result[i]));
			db.none("INSERT INTO todo(message,count) values ($1,1)",[String(result[i])]);//inserting it in the database
		}
		})
	 	.catch(function (err) {
	 	return next(err);
	 });*/


		 console.log(String(result[i]));
		 //searching if the message is repeated if not initialize to zero
		db.any("SELECT count from todo where message = $1",result[i]).then(function () {
		 	console.log(i);
		 	console.log(String(result[i]));
			db.any("Update todo set count=count+1 where message =$1",result[i]);
		})
	 	.catch(function (err) {
	 	return next(err);
	 	});

	 	db.none("SELECT count from todo where message = $1",result[i]).then(function () {
		 	console.log(i);
			console.log(String(result[i]));
			db.none("INSERT INTO todo(message,count) values ($1,1)",result[i]);//inserting it in the database
		})
	 	.catch(function (err) {
	 	return next(err);
	 	});
	 	
	 
	}
	//to post in the chats
	db.none('INSERT INTO chats(message) values ($1)',str).then(function () {
		res.redirect('/');
	})
	
	});

	
	
	

app.listen(3000, function () {   
	console.log('Inspiration app listening on port 3000!'); });