const mongoose = require("mongoose");
const User = require("../../Schemas/User");
const errorCatcher = require("../tools/errorCatcher");
const jwt = require('jsonwebtoken');
const {performance} = require('perf_hooks');

exports.connect = errorCatcher(async(req, res, next) => {

    const user = await User.findOne({username: req.body.username}).select("+password");;
    if (!user || !req.body.password) {
        return (next(res.status(500).json({success: false, error: `User ${req.body.username} not found, or incorrect password.`})));
    }

    const t1 = performance.now();
    const passwordOK = await user.matchPassword(req.body.password);
    if (passwordOK === false) {
        return (next(res.status(500).json({success: false, error: `User ${req.body.username} not found, or incorrect password.`})));
    }
    const token = await jwt.sign({exp: Math.floor(Date.now() / 1000) + (60 * 60 * 72), _id: user._id}, process.env.JWT_SECRET);

    return (next(res.status(200).json({success: true,  data: {infos: {username: user.username,}}, token})));

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
    return (next(res.status(200).json({success: true, data: {infos: {username: newUser.username,}}, token})));
});

exports.verifyTokenValidity = errorCatcher(async (req, res, next) => {
    console.log("go !");
    const encryptedToken = req.body.token;
    console.log(req.body.token);
    let token = jwt.verify(encryptedToken, process.env.JWT_SECRET);

    if (!token.exp || token.exp <= Date.now() / 1000) {
        return (next(res.status(401).json({success: false, error: "Token expired."})));
    }
    let user = await User.findOne({_id: token._id});

    console.log("token ", token._id);
    if (!user) {
        console.log("wtf token ", token);
        return (next(res.status(401).json({success: false, error: "Invalid informations."})));
    }
    console.log("ici oui ", user);
    console.log(".... ", {infos: {username: user.username}});
    token = jwt.sign({exp: Math.floor(Date.now() / 1000) + (60 * 60 * 72), _id: token._id}, process.env.JWT_SECRET);
    return (next(res.status(200).json({success: true, token, data: {infos: {username: user.username}}})));
});