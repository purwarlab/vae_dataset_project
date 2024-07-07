/*Import Express and create an application*/
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var {reducer} = require('./lib/reducer');

// Body-Parser middleware used to read POST Http request body
app.use(bodyParser.json({ limit: '10mb' })); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
    })); // for parsing application/x-www-form-urlencoded

app.use(function(req, res, next) { //Middleware to enable CORS for cross-origin Resource Sharing
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
    });

//Initialisation Done
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Routing Starts

let listener = app.listen(4001, function() {
    console.log('Server started at ' + listener.address().port)
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var fs = require('fs');
var path = require('path');
eval(fs.readFileSync(path.join(__dirname, 'js', 'models.js')) + '');
eval(fs.readFileSync(path.join(__dirname, 'js', 'constants.js')) + '');
eval(fs.readFileSync(path.join(__dirname, 'js', 'models.js')) + '');
eval(fs.readFileSync(path.join(__dirname, 'js', 'drawables.js')) + '');
eval(fs.readFileSync(path.join(__dirname, 'js', 'helper.js')) + '');
eval(fs.readFileSync(path.join(__dirname, 'js', 'fileHandler.js')) + '');
eval(fs.readFileSync(path.join(__dirname, 'js', 'simulator.js')) + '');
eval(fs.readFileSync(path.join(__dirname, 'js', 'core.js')) + '');

app.get('/', function(req, res, next) {
    res.send("Hello world");
});

// Done by Prena: 
/*app.get('/simulation', function(req, res) {
    let data = reducer(undefined, {type:"LOAD_JOINTS_AND_LINKS", data:req.body, window: {drawables: drawables, simulator: simulator}})
    console.log('NEXT REQUEST \n');
    res.send(data);
}); */

// Done by Zhijie, but long ago
// app.post('/simulation', function(req, res) {
//     let data = reducer(undefined, {type:"PROTO_SIM", data:req.body, window: {drawables: drawables, simulator: simulator}})
//     console.log('NEXT REQUEST \n');
//     res.send(data);
//     }); //for optimal synthesis

app.post('/simulation', function(req, res) {
//let result = reducer(undefined, {type:"PROTO_SIM", data:req.body})
let result = reducer(undefined, {type:"PROTO_SIM_JAPAN_Multi", data:req.body})
res.send(result);
}); 

app.post('/simulation-8bar', function(req, res) {
    let result = reducer(undefined, {type:"PROTO_SIM_JAPAN_Multi_8BAR", data:req.body})
    res.send(result);
}); 
