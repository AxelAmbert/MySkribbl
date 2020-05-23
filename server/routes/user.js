const express = require("express");
const User = require("../../Schemas/User");
const rateLimit = require("express-rate-limit");



const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 100, // start blocking after 5 requests
    message:
        "Too many accounts created from this IP, please try again after an hour"
});

const { connect, createUser, verifyTokenValidity} = require("../controllers/user");

const router = express.Router({ mergeParams: true });

router.route("/verifyTokenValidity").post(verifyTokenValidity);
router.route("/connect").post(connect);
router.post("/", createAccountLimiter, createUser);
//router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;

