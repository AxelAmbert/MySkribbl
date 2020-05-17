const mongoose = require("mongoose");
const User = require("../../Schemas/User");
const errorCatcher = require("../tools/errorCatcher");
const jwt = require('jsonwebtoken');

exports.connect = errorCatcher(async(req, res, next) => {

    const user = await User.findOne(req.body);
    if (!user) {
        return (next(res.status(500).json({success: false, error: `User ${req.body.username} not found, or incorrect password.`})));
    }
    const token = jwt.sign({exp: Math.floor(Date.now() / 1000) + (60 * 60 * 72), _id: user._id}, process.env.JWT_SECRET);
    console.log("generated token ", token);
    const decrypt = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decrypted ", decrypt);

    return (next(res.status(200).json({success: true, data: user, token})));

});

exports.createUser = errorCatcher(async (req, res, next) => {

    const userAlreadyExist = await User.findOne({$or: [
            { username : req.body.username },
            { email: req.body.email }
        ]});
    let newUser = null;
    console.log("already ", userAlreadyExist);

    if (userAlreadyExist) {
        if (req.body.email === userAlreadyExist.email)
            return (next(res.status(400).json({success: false, error: `An account with email ${userAlreadyExist.email} already exists.`})));
        else
            return (next(res.status(400).json({success: false, error: `User ${req.body.username} already exists.`})));
    }
    newUser = await User.create(req.body);
    if (!newUser) {
        return (next(res.status(400).json({success: false, error: newUser})));
    }
    const token = jwt.sign({exp: Math.floor(Date.now() / 1000) + (60 * 60 * 72), _id: newUser._id}, process.env.JWT_SECRET);
    return (next(res.status(200).json({success: true, data: {username: newUser.username,}, token})));
});

exports.verifyTokenValidity = errorCatcher(async (req, res, next) => {
    console.log("go !");
    const encryptedToken = req.body.token;
    console.log(req.body.token);
    let token = jwt.verify(encryptedToken, process.env.JWT_SECRET);

    if (!token._id) {
        console.log("wtf token ", token);
        return (next(res.status(401).json({success: false, error: "Invalid informations."})));
    }
    console.log("ici oui ");
    token = jwt.sign({exp: Math.floor(Date.now() / 1000) + (60 * 60 * 72), _id: token._id}, process.env.JWT_SECRET);
    return (next(res.status(200).json({success: true, token})));
});