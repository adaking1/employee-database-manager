SELECT * FROM departments;

SELECT * FROM roles;

SELECT employees.id AS id, employees.first_name AS first, 
employees.last_name AS last, roles.title AS job_title, departments.name as department, 
roles.salary AS salary, CONCAT(managers.first_name, ' ', managers.last_name) AS manager FROM employees
JOIN roles
ON employees.role_id = roles.id
JOIN departments
ON roles.department_id = departments.id
LEFT JOIN employees AS managers 
ON employees.manager_id = managers.id 
ORDER BY employees.id;


INSERT INTO departments
VALUES (newDepartmentName);

INSERT INTO roles
VALUES (title, salary, department);

INSERT INTO employees
VALUES (first, last, role, manager)

SELECT name AS department FROM departments;

SELECT roles.id AS id, roles.title AS role, departments.name as department, roles.salary AS salary FROM roles
JOIN departments
ON roles.department_id = departments.id
ORDER BY roles.id;

INSERT INTO departments (name)
    VALUES (?);

INSERT INTO roles (title, salary, department_id) VALUES ('cook','30','1');

INSERT INTO roles (title, salary, department_id) 
VALUES ('Hi', 30, (SELECT id FROM departments WHERE departments.name = 'General'));


SELECT CONCAT(managers.first_name, ' ', managers.last_name) AS manager FROM employees 
LEFT JOIN employees AS managers 
ON employees.manager_id = managers.id;