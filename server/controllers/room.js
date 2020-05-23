const Room = require("../room");
const errorCatcher = require("../tools/errorCatcher");

//app.get('/newroom/:roomName/:secretId',
exports.newRoom = errorCatcher((req, res, _) => {
    const roomName = req.params.roomName || null;
    const secretID = req.params.playerSecretID || null;
    const TheRoom = req.RoomList[req.params.roomName];
    if (TheRoom) {
        res.status(500).json({success: false, error: "Room already exist"});
        return;
    } else if (!roomName) {
        res.status(401).json({success: false, error: "No room name specified"});
        return;
    }
    const roomSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    //RoomList[req.params.roomName] = {roomName: req.params.roomName, playerSockets: [] , roomSecret, game: new Game()};
    const newRoom = new Room(req.params.roomName, roomSecret);

    req.RoomList[req.params.roomName] = newRoom;
    if (secretID) {
        const player = req.PlayerList[secretID];
        if (player)
            player.roomName = req.params.roomName;
    }
    res.status(200).json({success: true, roomName, roomSecret});
});



//app.get('/joinroom/:roomName/:playerSecretID', (req, res) => {
exports.joinRoom = errorCatcher((req, res, _) => {

    console.log("join ", req.params);
    const Room = req.RoomList[req.params.roomName];

    if (!Room) {
        res.status(404).json({success: false, error: `Room ${req.params.roomName} don't exist`});
        return;
    } else if (Room.playerExist(req.params.playerSecretID)) {
        console.log("ALREADY IN ROOM ???? ", Room.players);
        res.status(500).json({success: false, error: `player ${req.params.secretID} already in the room`});
        return;
    }
    const player = req.PlayerList[req.params.playerSecretID];

    if (!player) {
        console.log("don't exist wtf ", req.PlayerList);
        res.status(500).json({success: false, error: `player ${req.params.secretID} don't exist`});
        return;
    }
    player.roomName = Room.roomName;
    res.status(200).json({success: true, roomName: req.params.roomName});
});