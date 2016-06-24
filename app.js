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
app.get('/', function (req, res, next) {  
	db.any('SELECT message FROM keywords where date=current_date GROUP BY message ORDER BY COUNT(*) DESC limit 5')
		.then(function (data1) {
			db.query('SELECT message from chats where date=current_date').then(function (data2) {
		res.render('index',{mes:data1,chats:data2});

		}).catch(function (err) {
	 	return next(err);
	}).catch(function (err) {
	 return next(err);
	 })
	});
});

//to get chats from past 
app.post('/query', function (req, res) {   
	var d=req.body.qdate;
		db.any('SELECT message FROM keywords where date=$1 GROUP BY message ORDER BY COUNT(*) DESC limit 5',d)
			.then(function (data1) {
				db.query('SELECT message from chats where date=$1',d).then(function (data2) {
			res.render('index',{mes:data1,chats:data2});

			}).catch(function (err) {
		 	return next(err);
		}).catch(function (err) {
		 return next(err);
		 })
		});
	 });


//when the user post a message 
app.post('/sent', function (req, res) { 
	str = req.body.message; //storing into a var
	result=str.split(' '); //parsing the sentence into words
	var arrayLength = result.length;
	var i;

	//to store the parsed words into the database
	for (i = 0; i < arrayLength; i++) {
		if(result[i])//omit all the blank vars
			db.none("INSERT INTO keywords(message,date) values ($1,current_date)",result[i]);//inserting it in db with currdate
	}

	//to post in the chats
	db.none('INSERT INTO chats(message,date) values ($1,current_date)',str).then(function () {
		res.redirect('/');//sending user back to the root
	})
	
	});

	

app.listen(3000, function () {   
	console.log('Inspiration app listening on port 3000!'); });