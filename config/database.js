const mongoose = require("mongoose");
require('dotenv').config();


const connectDB = async () => {
    const connection = await mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        keepAlive: true
    });

    console.log(`Mongo Connected: ${connection.connection.host}`);
};

module.exports = connectDB;