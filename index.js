const inquirer = require('inquirer');
const mysql = require('mysql2');
require('dotenv').config();


const db = mysql.createConnection(
    {
        host: '127.0.0.1',
        user: 'root',
        password: '3510',
        database: 'workforce_db'
    },
    console.log('connected to database')

);

function showDepartments() {
    const sql = `SELECT name AS department FROM departments;`
    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err)
        }
        console.table(rows);
        init();
    });
}

function showRoles() {
    const sql = `SELECT roles.id AS id, roles.title AS role, departments.name as department, roles.salary AS salary FROM roles
    JOIN departments
    ON roles.department_id = departments.id
    ORDER BY roles.id;`;
    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
        }
        console.table(rows);
        init();
    });
}

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
        console.table(rows);
        init();
    })
}

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
        console.log(answer);
        const sql = `INSERT INTO departments (name) VALUES (?);`;
        db.query(sql, [answer.addDep], (err,rows) => {
            if (err) {
                console.error(err);
            }
            console.log('New department has been added');
            init();
        })
    });
}

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
                    console.log('New role added');
                    init();
                });
            });
        });
    });
}

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
                    console.log(rows);
                    inquirer.prompt([
                        {
                            name: 'manager',
                            type: 'list',
                            message: 'Select the manager for this employee',
                            choices: rows
                        }
                    ])
                    .then((data) => {
                        const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
                        VALUES (?, ?, (SELECT id FROM roles WHERE roles.title = ?), (SELECT id FROM employees AS managers WHERE CONCAT(managers.first_name, ' ', managers.last_name) = ?));`;
                        db.query(sql, [input.first, input.last, choice.role, data.manager], (err, rows) => {
                            if (err) {
                                console.error(err);
                            }
                            console.log('Employee added');
                            init();
                        });
                    });

                });
                   
            });
                   
        });
    });
}

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
            console.log(data);
            const sql = `SELECT title AS name FROM roles;`;
            db.query(sql, (err, rows) => {
                if (err) {
                    console.log(err);
                }
                console.log(rows);
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
                        console.log('Employee role updated');
                        init();
                    });
                });
            });
        });
    });
}

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
                        choices: rows
                    }
                ])
                .then(choice => {
                    const sql = `UPDATE employees SET manager_id = (SELECT id FROM employees AS managers WHERE CONCAT(managers.first_name, ' ', managers.last_name) = ?) WHERE CONCAT(first_name, ' ',last_name) = ?;`;
                    db.query(sql, [choice.newManager, input.selectEmp], (err,rows) => {
                        if (err) {
                            console.error(err);
                        }
                        console.log('Employee manager updated');
                    });
                })
            });
        });
    });
}

function viewEmpByDepartment() {

}

function depBudget() {

}

function init() { 
    inquirer
    .prompt([
        {
        name: 'mainSelection',
        type: 'list',
        message: 'What would you like to do?',
        choices: ['View Departments', 'View Roles', 'View Employees', 'Add Department',
                    'Add Role', 'Add Employee', 'Update Employee Role', 'Update Employee Manager']
        }
    ])
    .then((input) => {
        const selection = input.mainSelection;
        console.log(selection);
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
         }
    })
}

init();

// showDepartments();

// db.end((err) =>  !err || console.error(err));






// add option for no manager when adding employee
// add some of the bonus features
// add env file to protect password
// modularize,
// add comments
// make video