const mongoose = require("mongoose");
const User = require("../../Schemas/User");
const errorCatcher = require("../tools/errorCatcher");

exports.connect = errorCatcher(async(req, res, next) => {
    const userExist = await User.findOne(req.body);

    if (!userExist) {
        return (next(res.status(500).json({success: false, error: `User ${req.body.username} not found, or incorrect password.`})));
    }
    return (next(res.status(200).json({success: true, data: userExist})));
});

exports.createUser = errorCatcher(async (req, res, next) => {
    const userAlreadyExist = await User.findOne({username: req.body.username});
    let newUser = null;

    if (userAlreadyExist) {
        return (next(res.status(400).json({success: false, error: `User ${req.body.username} already exist`})));
    }
    newUser = await User.create(req.body);
    if (!newUser) {
        return (next(res.status(400).json({success: "d", error: newUser})));
    }
    return (next(res.status(200).json({success: true, data: {username: newUser.username}})));
});


