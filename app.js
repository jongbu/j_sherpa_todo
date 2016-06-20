var express = require('express'); 
var bodyp=require('body-parser');
var promise = require('bluebird');
var path = require('path');
var messages=new Array();
var concate="";

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

app.get('/', function (req, res) {   
	res.render('index'); });

app.get('/users',function(req,res,next){
	db.any('SELECT * FROM users')
	.then(function(data){
		res.render('index',{ data: data });
	})
	.catch(function(err){
		return next(err);
	});
});

app.post("/users",function(req,res){
	res.response("req.body.username");
});

/*
app.get("/users/:id",function(req,res,next){
	res.send(req.params.id+"<br>"+req.params.username+"<br>"+req.params.password);
});*/
app.get('/users/:id', function(req, res, next) {
var userID = parseInt(req.params.id);
 //db.one expects a single row
	 db.one('SELECT * FROM users WHERE id = $1', userID)
	 .then(function (data) {
	 res.status(200)
	 .json({
	 status: 'success',
	 data: data,
	 message: 'Retrieved ONE user'
	 });
	 })
 	.catch(function (err) {
 	return next(err);
 });
});


app.post('/login', function (req, res) { 
	var m=req.body.message;
	console.log(m);
	messages.push(m);

	//inserting it in the database 
	db.any('INSERT INTO todo(message) values ($1)',m);
	concate+="<div class=\"alert alert-info\">"+
			m+"</div>";
	res.render('index',{mes:concate});
	console.log("This is a post request");
	
	});

app.listen(3000, function () {   
	console.log('Inspiration app listening on port 3000!'); });