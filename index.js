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
            // const deps = rows.map(({id, name}) => ({id: id, name: name}));
            // console.log(deps);
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
                const sql = `SELECT CONCAT(managers.first_name, ' ', managers.last_name) AS manager FROM employees 
                            LEFT JOIN employees AS managers 
                            ON employees.manager_id = managers.id;`;
                db.query(sql, (err, rows) => {
                    const manage = [];
                    rows.forEach(manager => {
                        if (manage.includes(manager)) {
                            manage.push(manager.manager);
                        } 


// dioshnfjshcuisdjkcxskz








                    });
                    console.log(rows);
                    console.log(manage);
                    inquirer.prompt([
                        {
                            name: 'manager',
                            type: 'list',
                            message: 'Select the manager for this employee',
                            choices: manage
                        }
                    ])
                })
            })
        })
    })
}

function init() { 
    inquirer
    .prompt([
        {
        name: 'mainSelection',
        type: 'list',
        message: 'What would you like to do?',
        choices: ['View Departments', 'View Roles', 'View Employees', 'Add Department',
                    'Add Role', 'Add Employee', 'Update Employee Role']
        }
//         // {
//         //     when: (input) => input.mainSelection === 'Add Role',
//         //     name: 'addRole',
//         //     type: 'input',
//         //     message: 'Enter name of role',
//         //     validate: (text) => text.length !== 0 || 'Enter a roll'
//         // },
//         // {
//         //     when: (input) => input.addRole,
//         //     name: 'addSalary',
//         //     type: 'input',
//         //     message: 'Add the salary for this role',
//         //     validate: (pay) => pay.length !== 0 || 'Enter salary'
//         // },
//         // {
//         //     when: (input) => input.addSalary,
//         //     name: 'roleDep'  ,
//         //     type: 'list',
//         //     message: 'Select the department for this role',
//         //     choices: showDepartments()
//         // },
//         // {
//         //     when: (input) => input.mainSelection === 'Add Employee',
//         //     name: 'firstName',
//         //     type: 'input',
//         //     message: 'Enter their first name',
//         //     validate: (text) => text.length === 0 || 'Enter first name'
//         // },
//         // {
//         //     when: (input) => input.firstName,
//         //     name: 'lastName',
//         //     type: 'input',
//         //     message: 'Enter their last name',
//         //     validate: (text) => text.length === 0 || 'Enter last name'
//         // },
//         // {
//         //     when: (input) => input.lastName,
//         //     name: 'empRole',
//         //     type: 'list',
//         //     message: 'Enter employee role',
//         //     choices: ['role column from sql database table']
//         // }, 
//         // {
//         //     when: (input) => input.empRole,
//         //     name: 'empManager',
//         //     type: 'list',
//         //     message: 'Select manager for this employee',
//         //     choices: ['managers column from sql database table']
//         // },
//         // {
//         //     when: (input) => input.mainSelection === 'Update Employee Role',
//         //     name: 'selectEmp',
//         //     type: 'list',
//         //     message: 'Select employee to update',
//         //     choices: ['employee column from sql database table']
//         // },
//         // {
//         //     when: (input) => input.selectEmp,
//         //     name: 'selectRole',
//         //     type: 'list',
//         //     message: 'Select new role for employee',
//         //     choices: ['role column from sql database table']
//         // }
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
                break;
         }
    })
}

init();

// showDepartments();

// db.end((err) =>  !err || console.error(err));