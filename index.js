const inquirer = require('inquirer');


function init() {
    inquirer
    .prompt([
        {
        name: 'mainSelection',
        input: 'list',
        message: 'What would you like to do?',
        choices: ['View Departments', 'View Roles', 'View Employees', 'Add Department',
                    'Add Role', 'Add Employee', 'Update Employee Role']
        },
        {
            when: (input) => input.mainSelection === 'Add Department',
            name: 'addDep',
            input: 'input',
            message: 'Enter name of department'
        },
        {
            when: (input) => input.mainSelection === 'Add Role',
            name: 'addRole',
            input: 'input',
            message: 'Enter name of role',
            validate: (text) => text.length === 0 || 'Enter a roll'
        },
        {
            when: (input) => input.addRole,
            name: 'addSalary',
            input: 'input',
            message: 'Add the salary for this role',
            validate: (pay) => pay.length === 0 || 'Enter salary'
        },
        {
            when: (input) => input.addSalary,
            name: 'roleDep'  ,
            input: 'list',
            message: 'Select the department for this role',
            choices: ['department column in sql database table']          
        },
        {
            when: (input) => input.mainSelection === 'Add Employee',
            name: 'firstName',
            input: 'input',
            message: 'Enter their first name',
            validate: (text) => text.length === 0 || 'Enter first name'
        },
        {
            when: (input) => input.firstName,
            name: 'lastName',
            input: 'input',
            message: 'Enter their last name',
            validate: (text) => text.length === 0 || 'Enter last name'
        },
        {
            when: (input) => input.lastName,
            name: 'empRole',
            input: 'list',
            message: 'Enter employee role',
            choices: ['role column from sql database table']
        }, 
        {
            when: (input) => input.empRole,
            name: 'empManager',
            input: 'list',
            message: 'Select manager for this employee',
            choices: ['managers column from sql database table']
        },
        {
            when: (input) => input.mainSelection === 'Update Employee Role',
            name: 'selectEmp',
            input: 'list',
            message: 'Select employee to update',
            choices: ['employee column from sql database table']
        },
        {
            when: (input) => imput.selectEmp,
            name: 'selectRole',
            input: 'list',
            message: 'Select new role for employee',
            choices: ['role column from sql database table']
        }
    ])
}