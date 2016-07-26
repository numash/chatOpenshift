var express = require('express');
var http = require('http');
var app = express();
var router = express.Router();
var server = app.listen(8080);

var io = require('socket.io').listen(server);

var dbManager = require("../lib/db/dbManager");

var hbs = require('hbs');

/*app.get('/', function(req, res){
    res.redirect('/chat');
});*/

module.exports = function(passport){

    /* GET login page. */
    router.get('/', function(req, res) {
        // Display the Login page with any flash message
        res.render('registration', { message: req.flash('message') });
    });

    /* Handle Login POST */
    router.post('/login', passport.authenticate('login', {
        successRedirect: '/chat',
        failureRedirect: '/',
        failureFlash : true
    }));
    
    /* GET Registration Page */
    router.get('/signup', function(req, res){
        res.render('registration',{message: req.flash('message')});
    });
    
    /* Handle Registration POST */
    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/chat',
        failureRedirect: '/signup',
        failureFlash : true
    }));
    
    /* Handle Logout */
    router.get('/signout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    
    /* GET Home Page */
    router.get('/chat', isAuthenticated, function(req, res){
    
        // dbManager.removeAllMessages(function(err){
        //     console.log(err);
        //     throw err;
        // });

        hbs.registerHelper('getAuthor', function(context) {
            return JSON.stringify(context);
        });
    
        dbManager.getLastMessages(function(err){
                console.log(err);
                throw err;
            },
            function(data) {

                res.render('index', { user: req.user, messages: data});
            });
    });

    return router;
};

io.on('connection', function(socket){

    socket.on('chat message', function(author, msg){

        dbManager.insertIntoDB(author, msg, function(err){
            console.log(err);
            throw err;
        }, function(){
            dbManager.getLastMessage(function(err){
                    console.log(err);
                    throw err;
                },
                function (data) {
                    io.emit('message received', data);
                });
        });
    });
});

server.listen("8000", function(){
    console.log('listening on *: ' + "8000");
});

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

//module.exports = router;