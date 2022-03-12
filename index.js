const db = require('./config/connection');


// Connect to the db
db.connect(function (error) {
    if (error) throw error;
    console.log(`Welcome to the Employee Tracker`)
});

