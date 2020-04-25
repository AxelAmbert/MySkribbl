var express = require("express");
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const crypto = require('crypto');
const path = require('path');

//app.use(app.json());



app.use(express.static(path.join(__dirname, 'build')));



var datareceived = [];

console.log("mdr");
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

var RoomList = [];

app.get('/newroom/:roomName', (req, res) => {
    const roomName = req.params.roomName || null;

    if (RoomList[req.params.roomName]) {
        res.json({success: false, error: "Room already exist"});
        return;
    } else if (!roomName) {
        res.json({success: false, error: "No room name specified"});
        return;
    }
    //const RandomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    RoomList[req.params.roomName] = {roomName: req.params.roomName, playerSockets: [] };
    res.json({success: true, roomName: req.params.roomName});
});

app.get('/joinroom/:roomName',
    (req, res) => {
    const Room = RoomList[req.params.roomName];

    if (!Room) {
        res.status(404).json({success: false, error: `Room ${req.params.roomName} don't exist`});
        return;
    }
    res.status(200).json({success: true, roomName: req.params.roomName});

    //console.log(`New id -> ${req.params.id}`);
    /*
        try {
            RoomList[req.params.roomId].socketList.push(socket);
        } catch (error) {

        }
        res.json({status: "oK"});*/
});
function median(values) {

    values.sort( function(a,b) {return a - b;} );

    var half = Math.floor(values.length/2);

    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
}

io.on('connection', async (socket) => {
    console.log("middleware:", socket.request._query['roomName']);
    console.log('a user connected');
    const roomName = socket.request._query['roomName'];

    await socket.join(roomName);


    RoomList[socket.request._query["roomName"]].playerSockets.push(socket);
    /*RoomList[socket.request._query["roomName"]].playerSockets[RoomList[socket.request._query["roomName"]].playerSockets.length - 1].*/
    socket.on('message', function(message) {
        console.log("MESSAGE!");
        socket.to(roomName).emit("reply", `${message} was sent`);
    });

    socket.on("gameData", function(data) {

        datareceived.push(JSON.stringify(data).length);
        //console.log("ARRAY SIZE - ", data.length, " TRAME SIZE  ", JSON.stringify(data).length);

        console.log(datareceived);

        console.log("MEDIANE ", median(datareceived));
        socket.to(roomName).emit("gameData", data);
    });

    if (RoomList[socket.request._query["roomName"]].playerSockets.length === 1) {
        socket.emit("newPlayerTurn");
    }
});


app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


http.listen(8081, () => {
    console.log('listening on *:4242');
});