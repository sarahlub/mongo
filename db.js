const mongoose = require('mongoose');

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected Successfully');
    } catch (error) {
        console.error('Error connecting to Database', error);
    }
}

module.exports = {
    connectToDatabase
};