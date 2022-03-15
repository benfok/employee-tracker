const db = require("../config/connection")
const cTable = require('console.table');
const inquirer = require('inquirer');


// Main Menu
const mainMenu = [
    {
        type: 'rawlist',
        message: 'What would you like to do?',
        name: 'mainMenu',
        loop: false,
        choices: [
            {name: 'View All Departments', value: 'viewDepts'},
            {name: 'View All Roles', value: 'viewRoles'},
            {name: 'View All Employees', value: 'viewEmployees'},
            {name: 'Add A Department', value: 'addDept'},
            {name: 'Add a Role', value: 'addRole'},
            {name: 'Add a Department', value: 'addDept'},
            {name: 'Add an Employee', value: 'addEmployee'},
            {name: `Update an Employee's Role and Manager`, value: 'updateEmployee'},
            {name: 'Exit', value: 'exit'}
        ]
    }
];

const showMainMenu = () => {
    inquirer.prompt(mainMenu)
    .then((answer) => {
        switch (answer.mainMenu) {
            case 'viewDepts':
                getDepts();
                break;
            case 'viewRoles':
                getRoles();
                break;
            case 'viewEmployees':
                getEmployees();
                break;
            case 'addDept':
                addDepartment();
                break;
            case 'addRole':
                addRole();
                break;
            case 'addEmployee':
                addEmployee();
                break;
            case 'updateEmployee':
                updateEmployee();
                break;
            case 'exit':
                console.log('Goodbye');
                db.end();
                break;
        }
    });
};


const getDepts = () => {
    //return all departments
    db.query('SELECT id, name AS department_name FROM department ORDER BY id', (error, results) => {
        if (error) {
            return 'Departments cannot be retrieved'
        }   
            console.log('\n');
            console.table(results);
        showMainMenu();
    });
};

const getRoles = () => {
    //return all roles
    db.query(
        'SELECT a.id, a.title, a.salary, b.name AS department FROM role a JOIN department b ON a.department_id = b.id', 
        (error, results) => {
        if (error) {
            return 'Roles cannot be retrieved'
        }   
            console.log('\n');
            console.table(results);
        showMainMenu();
    });
};

const getEmployees = () => {
    //return all employees
    db.query(
        `SELECT a.id, CONCAT(a.first_name, ' ', a.last_name) as employee, b.title, c.name AS department, b.salary, IF(a.manager_id IS NULL, "None", CONCAT(a.first_name, ' ', a.last_name)) AS manager FROM role b JOIN employee a ON a.role_id = b.id JOIN department c ON b.department_id = c.id LEFT JOIN employee m ON m.id = a.manager_id ORDER BY department`, 
        (error, results) => {
        if (error) {
            return 'Roles cannot be retrieved'
        }   
            console.log('\n');
            console.table(results);
        showMainMenu();
    });
};

const addDepartment = () => {
    // create new department
    inquirer.prompt([
    {
        type: 'input',
        message: 'Enter the department name:',
        name: 'deptName',
        // validate that a name of at least 2 characters is entered
        validate(answer) {
            if (answer.length < 2) {
                return 'Please enter a valid department name';
            } else {
                return true;
            }
        }
    }])
    .then((answer) => {
        db.query(
            'INSERT INTO department SET ?',
            {
                name: answer.deptName
            }
        );
        console.log(`\n Department ${answer.deptName} created`);
        getDepts();
    })
    .catch((error) => {
        console.log(error);
    });
};

const addRole = () => {
    // run a query to pull back live data for the department lookup
    db.query('SELECT * FROM department', (error, response) => {
        if(error) throw error;
        inquirer.prompt([
            {
                type: 'input',
                message: 'Enter the title of the role:',
                name: 'roleTitle',
                // validate that a name of at least 2 characters is entered
                validate(answer) {
                    if (answer.length < 2) {
                        return 'Please enter a valid title';
                    } else {
                        return true;
                    }
                }
            },
            {
                type: 'input',
                message: 'Enter the salary for this role:',
                name: 'roleSalary',
                // validate that a number is entered that is at least 1 or greater
                validate(answer) {
                    if (isNaN(answer) || answer < 1) {
                        return "Please enter a valid ID number";
                    } else {
                        return true;
                    }
                }
            },
            {
                type: 'list',
                message: 'Select the home department for the role:',
                name: 'roleDept',
                choices: 
                // take the SQL data and convert to an array of key:value pair objects for the list
                response.map(({ id, name }) => ({
                    name: name,
                    value: id
                }))
                
            }
        ])
            .then((answers) => {
                db.query(
                    'INSERT INTO role SET ?',
                    {
                        title: answers.roleTitle,
                        salary: answers.roleSalary,
                        department_id: answers.roleDept
                    }
                );
                console.log(`\n Role ${answers.roleTitle} created`);
                getRoles();
            })
            .catch((error) => {
                console.log(error);
            });
    });
};

const addEmployee = () => {
    // run two queries to pull back live data for the role manager lookups
    db.query('SELECT id, title FROM role; SELECT id, first_name, last_name FROM employee', (error, response) => {
        if(error) throw error;
        // convert the response data to an array
        const [roles, employees] = response;
        inquirer.prompt([
            {
                type: 'input',
                message: `Enter the employee's first name:`,
                name: 'firstName',
                // validate that a name of at least 1 character is entered
                validate(answer) {
                    if (answer.length < 1) {
                        return 'Please enter a valid title';
                    } else {
                        return true;
                    }
                }
            },
            {
                type: 'input',
                message: `Enter the employee's last name:`,
                name: 'lastName',
                // validate that a name of at least 1 character is entered
                validate(answer) {
                    if (answer.length < 1) {
                        return 'Please enter a valid title';
                    } else {
                        return true;
                    }
                }
            },
            {
                type: 'list',
                message: `Select the employee's role`,
                name: 'employeeRole',
                choices: 
                // take the SQL data and convert to an array of key:value pair objects for the list
                roles.map(({ id, title }) => ({
                    name: title,
                    value: id
                }))
                
            },
            {
                type: 'list',
                message: `Select the employee's manager or select "None":`,
                name: 'employeeManager',
                choices: 
                // take the SQL data and convert to an array of key:value pair objects for the list
                employees.map(({ id, first_name, last_name }) => ({
                    name: `${first_name} ${last_name}`,
                    value: id
                }))
            }
        ])
            .then((answers) => {
                // db.query(
                //     'INSERT INTO role SET ?',
                //     {
                //         title: answers.roleTitle,
                //         salary: answers.roleSalary,
                //         department_id: answers.roleDept
                //     }
                // );
                console.log(answers);
                console.log(`\n Employee ${answers.first_name} ${answers.last_name} created`);
                // getEmployees();
            })
            .catch((error) => {
                console.log(error);
            });
    });
};

const updateEmployee = () => {
    console.log('hello');
};


module.exports = { showMainMenu, getDepts, getRoles, getEmployees, addDepartment, addRole, addEmployee, updateEmployee };