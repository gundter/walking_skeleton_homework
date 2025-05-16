var express = require('express');
var router = express.Router();
var path = require('path');
var RateLimit = require('express-rate-limit'); // Import rate limiting middleware

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/basic_walking_skeleton');

var Cat = mongoose.model('Cat', {name:String});

// Configure rate limiter: maximum of 100 requests per 15 minutes
var limiter = RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

router.post('/add', function(request, response, next){
   var kitty = new Cat({name: request.body.name});
    kitty.save(function(err){
        if(err) console.log('meow %s', err);
        response.send(kitty.toJSON());
        next();
    });
});

router.get('/cats', limiter, function(request, response, next){
    return Cat.find({}).exec(function(err, cats){
        if(err) throw new Error(err);
        response.send(JSON.stringify(cats));
        next();
    });
});

// Apply rate limiter to this route
router.get("/*", limiter, function (req, res, next){
    console.log("Here is a console log");
    var file = req.params[0] || 'views/index.html';
    res.sendFile(path.join(__dirname, '../public', file));
    //next();
});

module.exports = router;