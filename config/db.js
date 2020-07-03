const mongoose = require('mongoose');
const config   = require('config');
const db       = config.get('mongoURI');

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false,
			useUnifiedTopology: true
        });
        
        console.log("Mongoose database connected");
    }
    catch(error){
        console.log(error);
        // Exit program with error
        process.exit(1);
    }
}

module.exports = connectDB;