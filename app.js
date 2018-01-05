var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var handlebars = require('express-handlebars');
var db = require('./db/db.js')
var routes = require('./routes/routes.js');

var app = express();

app.use(express.static(__dirname +'/public'))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(session({secret: 'secret', resave:true, saveUninitialized: false}));

app.set('view engine','handlebars')
app.engine('handlebars',handlebars({defaultLayout:'default_layout'}));

//routes
app.get('/',routes.getHome);
app.get('/home',routes.getHome);
app.get('/stories',routes.getStories);
app.post('/story',routes.postStory);
app.get('/story/:slug',routes.getStory);
app.get('/login',routes.getLogin);
app.post('/login',routes.postLogin);
app.get('/logout',routes.getLogout);
app.get('/register',routes.getRegister);
app.post('/register',routes.postRegister);
app.get('/createStory',routes.getCreateStory);
app.post('/:slug/comment',routes.postComment);

//other routes goes here

//error pages
//404
app.use('*', (req,res)=>{
    res.status(404);
    res.render('404.handlebars',{});
});
//500
app.use((error, req, res, next) => {
    console.log('Error 500: '+JSON.stringify(error));
    res.status(500);
    res.render('500.handlebars',{});
})

var port = process.env.PORT || process.env.npm_package_config_port;
app.listen(port, () => {
    console.log('listening on port: '+port);
})