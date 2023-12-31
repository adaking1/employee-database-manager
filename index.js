const inquirer = require('inquirer');
const mysql = require('mysql2');
// this npm package formats all of the console.table's in the file
const cTable = require('console.table');
require('dotenv').config();

const db = mysql.createConnection(
    {
        host: '127.0.0.1',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
);

// This function displays the name column from the departments table
function showDepartments() {
    const sql = `SELECT id, name AS department FROM departments;`
    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err)
        }
        console.log('\n\n');
        console.table(rows);
        console.log('\n');
        init();
    });
}

// This function joins the roles and departments tables and displays the role id, role title, department name, and role salary columns 
function showRoles() {
    const sql = `SELECT roles.id AS id, roles.title AS role, departments.name as department, roles.salary AS salary FROM roles
    JOIN departments
    ON roles.department_id = departments.id
    ORDER BY roles.id;`;
    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
        }
        console.log('\n\n');
        console.table(rows);
        console.log('\n');
        init();
    });
}

// this function joins the employees, roles, departments, and another employees tables and displays the employee id, employee name, role title, department name, role salary, and manager name
function showEmployees() {
    const sql= `SELECT employees.id AS id, employees.first_name AS first, 
    employees.last_name AS last, roles.title AS job_title, departments.name as department, 
    roles.salary AS salary, CONCAT(managers.first_name, ' ', managers.last_name) AS manager FROM employees
    JOIN roles
    ON employees.role_id = roles.id
    JOIN departments
    ON roles.department_id = departments.id
    LEFT JOIN employees AS managers 
    ON employees.manager_id = managers.id 
    ORDER BY employees.id;`
    db.query(sql, (err,rows) => {
        if (err) {
            console.error(err);
        }
        console.log('\n\n');
        console.table(rows);
        console.log('\n');
        init();
    })
}

// this function adds a department to the departments table by using INSERT
function addDepartment() {  
    inquirer
    .prompt([
        {
            name: 'addDep',
            type: 'input',
            message: 'Enter name of department'   
        }
    ])
    .then((answer) => {
        const sql = `INSERT INTO departments (name) VALUES (?);`;
        db.query(sql, [answer.addDep], (err,rows) => {
            if (err) {
                console.error(err);
            }
            console.log('\n New department has been added! \n');
            init();
        });
    });
}

// this function prompts the user to enter the name of a new role, enter the salary, and select its department.
// it then inserts that role into the roles table
function addRole() {
    inquirer
    .prompt([
        {
            name: 'addRole',
            type: 'input',
            message: 'Enter name of role',
            validate: (text) => text.length !== 0 || 'Enter a roll'            
        },
        {
            name: 'addSalary',
            type: 'input',
            message: 'Enter the salary for this role',
            validate: (input) => !isNaN(input) && input.length !== 0 || 'Enter salary (numbers only)'
        }
    ])
    .then((answer) => {
        const sql =`SELECT * FROM departments;`;
        db.query(sql, (err, rows) => {
            if (err) {
                console.error(err);
            }
            inquirer.prompt([
                {
                    name: 'showDeps',
                    type: 'list',
                    message: 'Select the department for this role',
                    choices: rows
                }
            ])
            .then((input) => {
                const sql = `INSERT INTO roles (title, salary, department_id) VALUES (?, ?, (SELECT id FROM departments WHERE departments.name = ?));`;
                db.query(sql, [answer.addRole, answer.addSalary, input.showDeps], (err, rows) => {
                    if (err) {
                        console.error(err);
                    }
                    console.log('\n New role has been added! \n');
                    init();
                });
            });
        });
    });
}

// this function prompts the user for the new employee's name, then select their role, and select their manager.
// it then inserts the new employee into the employees table
function addEmployee() {
    inquirer
    .prompt([
        {
            name: 'first',
            type: 'input',
            message: 'Enter the first name for this employee',
            validate: (input) => input.length !== 0 || 'Enter a first name'
        },
        {
            name: 'last',
            type: 'input',
            message: 'Enter the last name for this employee',
            validate: (input) => input.length !== 0 || 'Enter a last name'
        }
    ])
    .then((input) => {
        const sql = `SELECT title FROM roles;`;
        db.query(sql, (err, rows) => {
            if (err) {
                console.error(err);
            }
            const roles = rows.map(({title}) => ({name: title}));
            inquirer.prompt([
                {
                    name: 'role',
                    type: 'list',
                    message: 'Select the role for this employee',
                    choices: roles
                }
            ])
            .then((choice) => {
                const sql = `SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employees;`;
                db.query(sql, (err, rows) => {
                    if (err) {
                        console.error(err);
                    }
                    inquirer.prompt([
                        {
                            name: 'manager',
                            type: 'list',
                            message: 'Select the manager for this employee',
                            choices: rows.concat([{name: 'None'}])
                        }
                    ])
                    .then((data) => {
                        const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
                        VALUES (?, ?, (SELECT id FROM roles WHERE roles.title = ?), (SELECT id FROM employees AS managers WHERE CONCAT(managers.first_name, ' ', managers.last_name) = ?));`;
                        db.query(sql, [input.first, input.last, choice.role, data.manager], (err, rows) => {
                            if (err) {
                                console.error(err);
                            }
                            console.log('\n Employee added! \n');
                            init();
                        });
                    });

                });
                   
            });
                   
        });
    });
}

// this function prompts the user to select an employee to update, then it prompts the user to select the new role
// it then updates the employee's role id on the employees table
function updateEmployeeRole() {
    const sql = `SELECT CONCAT(first_name, ' ', last_name) AS name FROM employees;`;
    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
        }
        inquirer.prompt([
            {
                name: 'employee',
                type: 'list',
                message: 'Which employee would you like to update?',
                choices: rows
            }
        ])
        .then(data => {
            const sql = `SELECT title AS name FROM roles;`;
            db.query(sql, (err, rows) => {
                if (err) {
                    console.error(err);
                }
                inquirer.prompt([
                    {
                        name: 'role',
                        type: 'list',
                        message: 'Select a new role for this employee',
                        choices: rows
                    }
                ])
                .then(choice => {
                    const sql = `UPDATE employees SET role_id = (SELECT id FROM roles WHERE roles.title = ?) WHERE CONCAT(employees.first_name, ' ', employees.last_name) = ?;`;
                    db.query(sql, [choice.role, data.employee], (err, rows) => {
                        if (err) {
                            console.error(err);
                        }
                        console.log('\n Employee role updated! \n');
                        init();
                    });
                });
            });
        });
    });
}

// this function prompts the user to select employee to update, then prompts the user to select their new manager
// it then updates the manager id on the employees table
function updateManager() {
    const sql = `SELECT CONCAT(first_name, ' ', last_name) AS name FROM employees;`
    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
        }
        inquirer.prompt([
            {
                name: 'selectEmp',
                type: 'list',
                message: 'Which employee would you like to update the manager for?',
                choices: rows
            }
        ])
        .then(input => {
            const sql = `SELECT CONCAT(first_name, ' ', last_name) AS name FROM employees;`;
            db.query(sql, (err, rows) => {
                if (err) {
                    console.error(err);
                }
                inquirer.prompt([
                    {
                        name: 'newManager',
                        type: 'list',
                        message:'Select the new manager for this employee',
                        choices: rows.concat([{name: 'None'}])
                    }
                ])
                .then(choice => {
                    const managerId = `SELECT id from employees WHERE CONCAT(first_name, ' ', last_name) = ?;`;
                    const sql = `UPDATE employees SET manager_id = ? WHERE CONCAT(first_name, ' ',last_name) = ?;`;
                    if (choice.newManager === 'None') {
                        const sqlNull = `UPDATE employees SET manager_id = null WHERE CONCAT(first_name, ' ',last_name) = ?;`;
                        db.query(sqlNull, input.selectEmp, (err, rows) => {
                            console.log('\n Manager updated! \n');
                            init();
                        })
                        
                    }
                    else {
                        db.query(managerId, choice.newManager, (err, manager) => {
                            if (err) {
                                console.error(err);
                            }
                            db.query(sql, [manager[0].id, input.selectEmp], (err,rows) => {
                                if (err) {
                                    console.error(err);
                                }
                                console.log('\n Employee manager updated! \n');
                                init();
                            });
                        });
                    } 
                });
            });
        });
    });
}

// this function prompts the user to select manager 
// it then displays the employees whose manager id is the id of the selected manager
function viewEmployeeByManager() {
    const id = `SELECT DISTINCT manager_id AS id FROM employees WHERE manager_id IS NOT NULL;`;
    db.query(id, (err, rows) => {
        let sql = `SELECT CONCAT(first_name, ' ', last_name) AS manager FROM employees WHERE id IN (?);`;
        if (err) {
            console.error(err);
        }
        const idList = [];
        rows.forEach(row => {
            idList.push(row.id);
        });
        if (idList.length === 1){
            sql = `SELECT CONCAT(first_name, ' ', last_name) AS manager FROM employees WHERE id = ?;`;
        }
        db.query(sql, [idList], (err, r) => {
            if (err) {
                console.error(err);
            }
            const nameList = [];
            r.forEach(row => {
            nameList.push(row.manager);
        });
            inquirer.prompt([
                {
                    name: 'name',
                    type: 'list',
                    message: 'Select manager',
                    choices: nameList
                }
            ])
            .then((choice) => {
                const sql = `SELECT id, CONCAT(first_name, ' ', last_name) AS employees FROM employees WHERE manager_id = (SELECT id FROM employees WHERE CONCAT(first_name, ' ', last_name) = ?);`;
                db.query(sql, choice.name, (err, employees) => {
                    if (err) {
                        console.error(err);
                    }
                    console.log('\n\n');
                    console.table(employees);
                    console.log('\n');
                    init();
                });
            });
        });
    });    
}

// this function prompts the user to select a department
// it then displays the names, role, and salaries for the employees in the selected department
function viewEmpByDepartment() {
    const sql = `SELECT name FROM departments;`;
    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
        }
        inquirer.prompt([
            {
                name: 'department',
                type: 'list',
                message: 'Select Department',
                choices: rows
            }
        ])
        .then((choice) => {
            const sql = `SELECT CONCAT(first_name, ' ', last_name) AS employee, roles.title AS role, roles.salary AS salary FROM employees
                        JOIN roles ON employees.role_id = roles.id
                        JOIN departments ON roles.department_id = departments.id WHERE departments.name = ?;`;
            db.query(sql, choice.department, (err, row) => {
                if (err) {
                    console.err(err)
                }
                console.log('\n\n')
                console.table(row);
                console.log('\n');
                init();
            })
        });
    });
}

// this function prompts the user to select a department
// it then adds the salary of every employee in that salary and displays it
function depBudget() {
    const sql = `SELECT name FROM departments;`;
    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
        }
        inquirer.prompt([
            {
                name: 'department',
                type: 'list',
                message: 'Select Department',
                choices: rows
            }
        ])
        .then(choice => {
            const sql = `SELECT SUM(salary) AS budget FROM employees JOIN roles ON employees.role_id = roles.id 
            JOIN departments ON roles.department_id = departments.id
            WHERE departments.name = ?;`;
            db.query(sql, choice.department, (err, table) => {
                if (err) {
                    console.error(err);
                }
                console.log('\n\n');
                console.table(table);
                console.log('\n');
                init();
            })
        });
    });
}

// this function initiates the app
// it starts the initial prompt
function init() { 
    inquirer
    .prompt([
        {
        name: 'mainSelection',
        type: 'list',
        message: 'What would you like to do?',
        choices: ['View Departments', 'View Roles', 'View Employees', 'Add Department',
                    'Add Role', 'Add Employee', 'Update Employee Role', 'Update Employee Manager',
                'View Employees By Manager', 'View Budget By Department', 'View Employees By Department']
        }
    ])
    .then((input) => {
        const selection = input.mainSelection;
        switch(selection) {
            case 'View Departments':
                showDepartments();
                break;
            case 'View Roles':
                showRoles();
                break;
            case 'View Employees':
                showEmployees();
                break;
            case 'Add Department':
                addDepartment();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Update Employee Role':
                updateEmployeeRole();
                break;
            case 'Update Employee Manager':
                updateManager();
                break;
            case 'View Employees By Manager':
                viewEmployeeByManager();
                break;
            case 'View Budget By Department':
                depBudget();
                break;
            case 'View Employees By Department':
                viewEmpByDepartment();
                break;
        }
    });
}

// this is used as an opening page for the app
console.log(`
███████╗███╗░░░███╗██████╗░██╗░░░░░░█████╗░██╗░░░██╗███████╗███████╗  ██████╗░██████╗░
██╔════╝████╗░████║██╔══██╗██║░░░░░██╔══██╗╚██╗░██╔╝██╔════╝██╔════╝  ██╔══██╗██╔══██╗
█████╗░░██╔████╔██║██████╔╝██║░░░░░██║░░██║░╚████╔╝░█████╗░░█████╗░░  ██║░░██║██████╦╝
██╔══╝░░██║╚██╔╝██║██╔═══╝░██║░░░░░██║░░██║░░╚██╔╝░░██╔══╝░░██╔══╝░░  ██║░░██║██╔══██╗
███████╗██║░╚═╝░██║██║░░░░░███████╗╚█████╔╝░░░██║░░░███████╗███████╗  ██████╔╝██████╦╝
╚══════╝╚═╝░░░░░╚═╝╚═╝░░░░░╚══════╝░╚════╝░░░░╚═╝░░░╚══════╝╚══════╝  ╚═════╝░╚═════╝░

███╗░░░███╗░█████╗░███╗░░██╗░█████╗░░██████╗░███████╗██████╗░
████╗░████║██╔══██╗████╗░██║██╔══██╗██╔════╝░██╔════╝██╔══██╗
██╔████╔██║███████║██╔██╗██║███████║██║░░██╗░█████╗░░██████╔╝
██║╚██╔╝██║██╔══██║██║╚████║██╔══██║██║░░╚██╗██╔══╝░░██╔══██╗
██║░╚═╝░██║██║░░██║██║░╚███║██║░░██║╚██████╔╝███████╗██║░░██║
╚═╝░░░░░╚═╝╚═╝░░╚═╝╚═╝░░╚══╝╚═╝░░╚═╝░╚═════╝░╚══════╝╚═╝░░╚═╝ 


`);
init();
