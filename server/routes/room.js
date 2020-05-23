const express = require("express");
const rateLimit = require("express-rate-limit");



const {newRoom, joinRoom} = require("../controllers/room");

const router = express.Router({ mergeParams: true });

router.route('/join/:roomName/:playerSecretID').post(joinRoom);
router.route("/new/:roomName/:playerSecretID").post(newRoom);

module.exports = router;

