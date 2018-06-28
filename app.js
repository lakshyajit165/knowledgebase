const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');


mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

//check connection
db.once('open', () => {
	console.log('Connected to mongoDB');
});


//check for db errors
db.on('error', (err) =>{
	console.log(err);
});

//init app
const app = express();

//Bring in models
let Article = require('./models/article');

//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Set Public Folder
app.use(express.static(path.join(__dirname,'public'	)));

//Express Session MiddleWare
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
 
}));




//home route
app.get('/', (req,res) => {

	/*let articles = [

		{
			id:1,
			title:'Article One',
			author:'Lk',
			body:'This is article one'
		},
		{
			id:2,
			title:'Article Two',
			author:'John Doe',
			body:'This is article two'
		},
		{
			id:3,
			title:'Article three',
			author:'Lk',
			body:'This is article three'
		}
	];*/

	Article.find({}, (err, articles) =>{
			
			if(err){
				console.log(err);
			}else{
				res.render('index',{
				title:'Articles',
				articles: articles
				});
			}
			
	});

	
});

//Get single Article
app.get('/article/:id', (req,res) => {
	Article.findById(req.params.id, (err,article)=>{
		res.render('article', {
			article:article
		});
	});
});	
//add article route
app.get('/articles/add', (req,res) =>{
	res.render('add_article', {
		title:'Add Article'
	});
});

//Add Submit POST route
app.post('/articles/add', (req,res) => {
	let article = new Article();
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;

	article.save( (err) => {
		if(err){
			console.log(err);
			return;
		}else{
			
			res.redirect('/');
		}
	});
});

//Load Edit Form
app.get('/article/edit/:id', (req,res) => {
	Article.findById(req.params.id, (err,article)=>{
		res.render('edit_article', {
			article:article
		});
	});
});	

//Update Submit POST route
app.post('/articles/edit/:id', (req,res) => {
	let article = {};
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;

	let query = {_id:req.params.id}


	Article.update(query, article, (err) => {
		if(err){
			console.log(err);
			return;
		}else{
			res.redirect('/');
		}
	});
});

//Delete Route (my comment)
app.delete('/article/:id', (req,res) => {
	let query = {_id:req.params.id}

	Article.remove(query, (err) => {
		if(err){
			console.log(err);
		}
		res.send('Success');
	});
});

//start server
app.listen(process.env.PORT || 3000, () => {
	console.log('Server started...');
});