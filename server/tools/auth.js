const errorCatcher = require("./errorCatcher");
const User = require("../../Schemas/User");
const jwt = require('jsonwebtoken');

const authVerification = errorCatcher(async (req, res, next) => {
   if (!req.headers || !req.headers.authorization) {
       console.log(req.headers);
       return (res.status(403).json({
           success: false,
           error: "Not authorized to perform this action, no headers found"
       }));
   }
   const encryptedToken = req.headers.authorization.split(" ")[1];
    console.log(encryptedToken);
   const token = jwt.verify(encryptedToken, process.env.JWT_SECRET);

   if (!token) {
       console.log(encryptedToken);
       return (res.status(403).json({success: false, error: "Not authorized to perform this action, invalid or expired token"}));
   }
   const user = await User.find({_id: token.id});

   if (!user) {
       return (res.status(403).json({success: false, error: "Not authorized to perform this action, invalid user"}));
   }
   next();
});

module.exports = authVerification;
