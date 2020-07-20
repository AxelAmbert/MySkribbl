const Room = require("./room");
const Game = require("./game");
const Player = require("./player");
var io = require('socket.io')(http);
const serverMainSocket = require("./serverMainSocket");

var express = require("express");
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const crypto = require('crypto');
const path = require('path');
require("../config/database")();
require('dotenv').config();
const userRoute = require("./routes/user");
const galleryRoute = require ("./routes/gallery");
const roomRoute = require("./routes/room");
const request = require("request-promise");
const cookieParser = require("cookie-parser");
const ug = require("./UsernameGenerator");

const UsernameGenerator = new ug();
const RoomList = [];
const PlayerList = [];
let datareceived = [];
const serverMainSocketInstance = new serverMainSocket(io, RoomList, PlayerList);

process.on('SIGINT', function() {
    console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
    // some other closing procedures go here
    process.exit(1);
});


app.use(express.json());
app.set('trust proxy', 1);

app.use("/api/v1/user", (req, res, next) => {
    req.UsernameGenerator = UsernameGenerator;
    next();
});

app.use("/api/v1/user", userRoute);
app.use("/api/v1/gallery", galleryRoute);




app.use("/api/v1/room", (req, res, next) => {
console.log("oh con");
    req.PlayerList = PlayerList;
    req.RoomList = RoomList;
    next();
});

app.use("/api/v1/room", roomRoute);

app.use((req, res, next) => {

    console.log(req.url);
   next();
});

app.use(express.static(path.join(__dirname, '../build')));

app.use(cookieParser());

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});



const verifyParametersIntegrity = (argsToVerify) =>  (req, res, next) => {
    let succeed = true;

    argsToVerify.forEach((value) => {
        if (!req.query[value])
            succeed = false;
    });
    if (succeed)
        next();
    else
        res.status(400).json({success: false, error: "some parameters are missing"});
};


app.post("/photo/", async (req, res) => {

    var options = {
        method: 'POST',
        uri: "https://webhook.site/6cb3bac6-214e-4f4f-b8a5-19a0a16a7233",
        body: req.body,
        json: true // Automatically stringifies the body to JSON
    };
    const ok = await request(options);
    console.log("DONE ! ", ok);
    console.log("body ? ", req.body);
});


function median(values) {

    values.sort( function(a,b) {return a - b;} );

    var half = Math.floor(values.length/2);

    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
}

const reactRoutes = ["/mainPage"];
/*

reactRoutes.forEach((route) => {
    app.get(route, function (req, res) {
        res.redirect(route);
    });
});
*/



app.get('/*', function (req, res) {

    console.log("redirect ");
    res.redirect("/");
    //res.sendFile(path.join(__dirname, '../build', 'index.html'));
});



http.listen(8081, () => {
    console.log('listening on *:4242');
});

const d = new Date();
console.log("Hello World, its ", d.getDate(), "/", d.getMonth(), " a ", d.getHours(), "h", d.getMinutes(), "m", d.getSeconds(), "s");
