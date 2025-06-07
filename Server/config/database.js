const mongoose = require('mongoose');

const dbConnect = async () => {
    try{
        await mongoose.connect(process.env.DATABASE_URL)
        console.log("Database connected");
    }
    catch(error){
        console.log("Database connection error: ", error);
    }
}

module.exports = dbConnect;