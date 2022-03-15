const db = require('./config/connection');
const { showMainMenu } = require('./src/utils');



// Connect to the db
db.connect(function (error) {
    if (error) throw error;
    console.log(`\x1b[33m%s\x1b[0m`, `
  _________________________________________________  
 |   __    __  _______  ____    ____     ______   |
 |  |  |  |  | |  ____| |  |    |  |    /  __  |  |
 |  |  |__|  | |  |__   |  |    |  |    | |  | |  |
 |  |   __   | |   __|  |  |    |  |    | |  | |  |
 |  |  |  |  | |  |___  |  |__  |  |__  | |__| |  |
 |  |__|  |__| |______| |_____| |_____| |______/  |    
 |________________________________________________|

         Welcome to the Employee Tracker!
    
    `)
    showMainMenu();
});



