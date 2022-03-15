const db = require('./config/connection');
const { showMainMenu } = require('./src/utils');



// Connect to the db
db.connect(function (error) {
    if (error) throw error;
    console.log(`Welcome to the Employee Tracker`)
    showMainMenu();
});



