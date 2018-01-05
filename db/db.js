var mongoose = require('mongoose');

var dbURL = "mongodb://root:root@ds153705.mlab.com:53705/something_to_say";
//var dbURL = "mongodb://127.0.0.1/something_to_say_enhanced";
mongoose.connect(dbURL);

mongoose.connection.on('connected',()=>{
    console.log("Connected to mongodb database");
})

mongoose.connection.on('error',(err)=>{
    console.log("Connection error: "+err);
})

mongoose.connection.on('disconnected',()=>{
    console.log("Disconnected from mongodb");
})

var UserSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true,unique:true},
    password: {type: String, required: true}
}, {collection: 'users_collection'});

var StorySchema = new mongoose.Schema({
    title: {type:String, required: true},
    date: {type:Date,required:true},
    content: {type: String, required: true},
    summary: {type:String, required:true},
    author: {type: String, required: true},
    slug: {type:String, required:true   },
    comments: [{commentBody:String, commentedBy:String, commentDate:Date}]
}, {collection: 'stories_collection'});

//register models
mongoose.model('StoryModel',StorySchema);
mongoose.model('UserModel',UserSchema); 