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
            {name: 'View All Employees By Manager', value: 'viewEmployeesByManager'},
            {name: 'View All Employees By Department', value: 'viewEmployeesByDept'},
            {name: 'Add A Department', value: 'addDept'},
            {name: 'Add a Role', value: 'addRole'},
            {name: 'Add a Department', value: 'addDept'},
            {name: 'Add an Employee', value: 'addEmployee'},
            {name: `Update an Employee's Role and/or Manager`, value: 'updateEmployee'},
            {name: `View Salary Budget and Head Count by Department`, value: 'salaryByDept'},
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
            case 'viewEmployeesByManager':
                getEmployeesByManager();
                break;
            case 'viewEmployeesByDept':
                getEmployeesByDept();
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
            case 'salaryByDept':
                salaryByDept();
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
            console.log(' ');
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
            console.log(' ');
            console.table(results);
        showMainMenu();
    });
};

const getEmployees = () => {
    //return all employees
    db.query(
        `SELECT a.id, CONCAT(a.first_name, ' ', a.last_name) AS employee, b.title, c.name AS department, b.salary, IF(a.manager_id IS NULL, "None", CONCAT(m.first_name, ' ', m.last_name)) AS manager FROM employee a LEFT JOIN role b ON a.role_id = b.id JOIN department c ON b.department_id = c.id LEFT JOIN employee m ON a.manager_id = m.id ORDER BY department`, 
        (error, results) => {
        if (error) {
            return 'Employees cannot be retrieved'
        }   
            console.log(' ');
            console.table(results);
        showMainMenu();
    });
};

const getEmployeesByManager = () => {
    //return all employees after selecting a manager
    db.query(
        // query returns a distinct list of only those employees who are managers of other employes
        `SELECT DISTINCT m.id, CONCAT(m.first_name, ' ' , m.last_name) AS manager, b.title FROM employee a JOIN employee m ON a.manager_id = m.id JOIN role b ON m.role_id = b.id WHERE a.manager_id IS NOT NULL`, 
        (error, results) => {
        if (error) {
            return 'Managers cannot be retrieved'
        }     
        inquirer.prompt([
            {
                type: 'list',
                message: 'Select a manager to view their employees',
                name: 'manager',
                choices: 
                // take the SQL data and convert to an array of key:value pair objects for the list
                results.map(({ id, manager }) => ({
                    name: manager,
                    value: id
                }))           
            }
        ])
        .then((answers) => {
            db.query(`SELECT a.id, CONCAT(a.first_name, ' ', a.last_name) AS employee, b.title, c.name AS department, b.salary, IF(a.manager_id IS NULL, "None", CONCAT(m.first_name, ' ', m.last_name)) AS manager FROM employee a LEFT JOIN role b ON a.role_id = b.id JOIN department c ON b.department_id = c.id LEFT JOIN employee m ON a.manager_id = m.id WHERE a.manager_id = ? ORDER BY b.title`, [answers.manager], (error, results) => {
                if (error) throw error;
                console.log(`\x1b[33m%s\x1b[0m`, `\n Employees of ${results[0].manager}:`);
                console.table(results);
                console.log(' ');
                showMainMenu();
            })
        })
        .catch((error) => {
            console.log(error);
        });
    });
};

const getEmployeesByDept = () => {
    //return all employees after selecting a manager
    db.query(
        // query returns a list of departments
        `SELECT * FROM department ORDER BY id`, 
        (error, results) => {
        if (error) {
            return 'Departments cannot be retrieved'
        }  
        inquirer.prompt([
            {
                type: 'list',
                message: `Select a department to view a list of it's employees`,
                name: 'dept',
                choices: 
                // take the SQL data and convert to an array of key:value pair objects for the list
                results.map(({ id, name }) => ({
                    name: name,
                    value: id
                }))
            }
        ])
        .then((answers) => {
            db.query(`SELECT a.id, CONCAT(a.first_name, ' ', a.last_name) as employee, b.title, c.name AS department, b.salary, IF(a.manager_id IS NULL, "None", CONCAT(m.first_name, ' ', m.last_name)) AS manager FROM role b JOIN employee a ON a.role_id = b.id JOIN department c ON b.department_id = c.id LEFT JOIN employee m ON a.manager_id = m.id WHERE c.id = ? ORDER BY b.title`, [answers.dept], (error, results) => {
                if (error) throw error;
                console.log(`\x1b[33m%s\x1b[0m`, `\n Employees in ${results[0].department}:`);
                console.table(results);
                console.log(' ');
                showMainMenu();
            })
        })
        .catch((error) => {
            console.log(error);
        });
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
        console.log(`\x1b[33m%s\x1b[0m`, `\n Department ${answer.deptName} created`);
        getDepts();
    })
    .catch((error) => {
        console.log(error);
    });
};

const addRole = () => {
    // run a query to pull back live data for the department lookup
    db.query('SELECT * FROM department', (error, results) => {
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
                results.map(({ id, name }) => ({
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
                console.log(`\x1b[33m%s\x1b[0m`, `\n Role ${answers.roleTitle} created`);
                getRoles();
            })
            .catch((error) => {
                console.log(error);
            });
    });
};

const addEmployee = () => {
    // run two queries to pull back live data for the role manager lookups
    db.query('SELECT id, title FROM role; SELECT a.id, a.first_name, a.last_name, b.title FROM employee a JOIN role b ON a.role_id = b.id', (error, results) => {
        if(error) throw error;
        // convert the response data to an array
        const [roles, employees] = results;
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
                employees.map(({ id, first_name, last_name, title }) => ({
                    name: `${first_name} ${last_name} | ${title}`,
                    value: id
                })).concat([{ name:'None', value: 'NULL' }])
            }
        ])
            .then((answers) => {
                db.query(
                    'INSERT INTO employee SET ?',
                    {
                        first_name: answers.firstName,
                        last_name: answers.lastName,
                        role_id: answers.employeeRole,
                        manager_id: answers.employeeManager
                    }
                );
                console.log(answers);
                console.log(`\x1b[33m%s\x1b[0m`, `\n Employee ${answers.firstName} ${answers.lastName} created`);
                getEmployees();
            })
            .catch((error) => {
                console.log(error);
            });
    });
};

const updateEmployee = () => {
    db.query(`SELECT a.id, CONCAT(a.first_name, ' ', a.last_name) AS name, b.title FROM employee a JOIN role b ON a.role_id = b.id`, (error, results) => {
        if (error) throw error;
        inquirer.prompt([
            {
                type: 'list',
                message: `Select the employee you wish to update to view their details:`,
                name: 'employee',
                choices: 
                // take the SQL data and convert to an array of key:value pair objects for the list
                results.map(({ id, name, title }) => ({
                    name: `${name} | ${title}`,
                    value: id
                }))
            }
        ])
        .then((answer) => {
            db.query(`
            SELECT a.id, CONCAT(a.first_name, ' ', a.last_name) as employee, b.title, c.name AS department, b.salary, IF(a.manager_id IS NULL, "None", CONCAT(m.first_name, ' ', m.last_name)) AS manager FROM role b JOIN employee a ON a.role_id = b.id JOIN department c ON b.department_id = c.id LEFT JOIN employee m ON a.manager_id = m.id WHERE a.id = ? ORDER BY department; 
            SELECT * FROM role;`, 
            [answer.employee], (error, result) => {
                if (error) throw (error);
                const [chosenEmployee, roles] = results;
                console.log(' ');
                console.table(chosenEmployee);
                inquirer.prompt([
                    {
                        type: 'confirm',
                        message: `Do you want to change this employee's role?`,
                        name: 'roleChange'
                    },
                    {
                        type: 'list',
                        message: 'Choose new role:',
                        name: 'newRole',
                        when(answers) {
                            return answers.roleChange;
                        },
                        choices: 
                            roles.map(({ id, title }) => ({
                                name: title,
                                value: id
                            }))
                    }
                ])
                .then((responses) => {
                    if (responses.roleChange) {
                        db.query(`UPDATE employee SET role_id = ? WHERE id = ? `,
                        [responses.newRole, chosenEmployee[0].id]);
                        console.log(`\x1b[33m%s\x1b[0m`, `Employee role updated`);
                    } else {
                        console.log(`\x1b[33m%s\x1b[0m`, `Employee role unchanged`);
                    };
                    return chosenEmployee;
                })
                .then((employee) => {
                    db.query(`SELECT a.id, CONCAT(a.first_name, ' ', a.last_name) AS name, b.title FROM employee a JOIN role b ON a.role_id = b.id WHERE a.id <> ?`, 
                        [employee[0].id], (error, response) => {
                        if (error) throw error;
                            inquirer.prompt([
                                {
                                    type: 'confirm',
                                    message: `Do you want to change this employee's manager?`,
                                    name: 'managerChange'
                                },
                                {
                                    type: 'list',
                                    message: 'Choose new manager or choose "None:',
                                    name: 'newManager',
                                    when(answers) {
                                        return answers.managerChange;
                                    },
                                    choices: 
                                    response.map(({ id, name, title }) => ({
                                        name: `${name} | ${title}`,
                                        value: id
                                    })).concat([{ name:'None', value: 'NULL' }])
                                }
                            ])
                            .then((response) => {
                            if (response.managerChange) {
                                db.query(`UPDATE employee SET manager_id = ? WHERE id = ? `,
                                [response.newManager, employee[0].id]);
                                console.log(`\x1b[33m%s\x1b[0m`, `Employee manager updated`);
                            } else {
                                console.log(`\x1b[33m%s\x1b[0m`, `Employee manager unchanged`);
                            };
                            console.log(' ');
                            showMainMenu();
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    });
                });
            });
        });
    });
};

const salaryByDept = () => {
    //return all roles
    db.query(
        'SELECT c.name as department, count(a.id) AS total_head_count, sum(b.salary) AS total_salary FROM employee a JOIN role b ON role_id = b.id JOIN department c ON b.department_id = c.id group by c.name', 
        (error, results) => {
        if (error) {
            return 'Data cannot be retrieved'
        }   
            console.log(' ');
            console.table(results);
        showMainMenu();
    });
};





module.exports = { showMainMenu, getDepts, getRoles, getEmployees, addDepartment, addRole, addEmployee, updateEmployee };