var mongoose = require('mongoose');

var StoryModel = mongoose.model('StoryModel');
var UserModel = mongoose.model('UserModel');

exports.getHome = (req,res) => {
    console.log("hit renderHome");
    res.render('home.handlebars',{
        famousQuote: "You may tell a tale that takes up residence in someone's soul, becomes their blood and self and purpose. That tale will move them and drive them and who knows that they might do because of it, because of your words. That is your role, your gift.",
        author:"Erin Morgenstern, The Night Circus"
    })
}

exports.getStories = (req,res) => {
    console.log("hit renderStories");
    var user  = req.session.currentUser;
    console.log(user);
    StoryModel.find({},{_id:false,__v:false},(err,docsArr)=>{
        if(err){
            console.error("Error is fetching stories from db. Error: %s",JSON.stringify(err));
        }else{
            // if(user!=null){
            //     res.render('stories.handlebars', {
            //         userLoggedIn: true,
            //         username:user,
            //         stories:docsArr
            //     })
            // }else{
            //     res.render('stories.handlebars', {
            //         userLoggedIn: false,
            //         stories:docsArr
            //     })
            // }   
            res.render('stories.handlebars',{
                session:req.session,
                stories:docsArr
            })
        }
    })
}

exports.getLogin = (req,res) => {
    console.log("hit renderLogin");
    res.render('login.handlebars',{})
}

exports.getRegister = (req,res) => {
    console.log("hit renderRegister");
    res.render('register.handlebars',{})
}

exports.getCreateStory = (req,res) => {
    console.log("hit renderCreateStory");    
    var user  = req.session.currentUser;
    console.log(user);
    if(user){
        res.render('createStory.handlebars',{session:req.session})
    }else{
        res.redirect('/login');
    }
}

exports.postLogin = (req,res) => {
    console.log(req.body);
    var email = req.body.email;
    var password = req.body.password;
    var loginStatus;
    UserModel.findOne({email:email},(err,user)=>{
        if(!err){
            if(user === null){
                console.log("user not found")
                loginStatus = 'Login Failed. User doesnot exist';
                res.render('login.handlebars',{
                    loginStatus:loginStatus
                })
            }
            if(user && user.password!=password){
                console.log("invalid credntials")
                loginStatus = 'Login Failed. Invalid Credentials';
                res.render('login.handlebars',{
                    loginStatus:loginStatus
                })
            }
            if(user && user.email=== email && user.password === password){
                console.log("login success")
                req.session.currentUser = user.name;
                res.redirect('/createStory')
            }
        }
    })
}

exports.getLogout = (req,res) => {
    console.log("logout called")
    //destroy session
    req.session.destroy();
    res.redirect('/home')
}

exports.postRegister = (req,res) => {
    console.log(req.body);

    var registerStatus;

    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    var userModel = new UserModel();
    userModel.name = name;
    userModel.email = email;
    userModel.password = password;

    userModel.save((err, savedUser)=>{
        if(err){
            console.log("Error is saving new user");
            registerStatus = "Registration failed. User Already Exists";
            res.render('register.handlebars',{registerStatus: registerStatus})
        }else{
            console.log("User saved successfully");
            //res.render('login.handlebars',{})
            res.redirect('/login')
        }
    })
}

exports.postStory = (req,res) => {
    console.log("creating new story")
    console.log(req.session)
    var title = req.body.title;
    var body = req.body.story;
    var summary = req.body.summary;
    var date = new Date();
    var currentUser = req.session.currentUser;
    if(currentUser){
        var author = currentUser;
    }else{
        console.log('User data not found in session')
        res.redirect('/login');
        return
    }
    
    var newStory = new StoryModel();
    newStory.title = title;
    newStory.content = body;
    newStory.date = date;
    newStory.author = author;
    newStory.summary = summary;
    newStory.slug = createSlug(title);
    
    newStory.save((err,savedStory)=>{
        if(err){
            console.log("Error in saving new story. "+err);
        }
        else{
            console.log("Successfully saved new story in db.");
            res.redirect('/stories')
        }
    })
}

var createSlug = (title) => {
    var lower = title.toLowerCase();
    var slug = lower.replace(/[^a-zA-Z0-9 ]/g, "");
    slug = slug.replace(/\s+/g,"-");
    return slug;
}


exports.getStory = (req,res)=>{
    console.log(req.session)
    var slug = req.params.slug
    StoryModel.findOne({slug:slug},(err,story)=>{
        if(err){
            console.log("Story not found");
            throw new Error("Story not found");
        }else{
            res.render('story.handlebars',{story:story,session:req.session});
        }
    })
}

exports.postComment = (req,res) => {
    console.log("posting comment");
    var commentBody = req.body.commentBody;
    var commentedBy = req.session.currentUser;
    var commentDate = new Date();

    var comment = {
        commentBody:commentBody,
        commentedBy:commentedBy,
        commentDate:commentDate
    }
    console.log(comment);
    var storySlug = req.params.slug;
    console.log(storySlug);

    // StoryModel.update({slug:storySlug},{$push:{comments,comment}},{upsert:true},(err,story)=>{
    //     if(err){
    //         console.log("Error in posting comment: "+err);
    //         res.redirect('/story/'+storySlug);
    //     }else{
    //         console.log(story);
    //         res.redirect('/story/'+storySlug);
    //     }
    // })
    StoryModel.findOne({slug:storySlug},(err, story)=>{
        story.comments.push(comment);
        story.save((err,savedObje)=>{
            if(err){
                console.log("Error in posting comment: " + err);
                res.redirect('/story/' + storySlug);
            } else {
                console.log(story);
                res.redirect('/story/' + storySlug);
            }
        });
    })
}