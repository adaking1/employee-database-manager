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


SELECT DISTINCT CONCAT(managers.first_name, ' ', managers.last_name) AS manager FROM employees WHERE employees.manager_id IS NOT NULL
LEFT JOIN employees AS managers 
ON employees.manager_id = managers.id;

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES (?, ?, (SELECT id FROM roles WHERE roles.title = ?), (SELECT id FROM employees AS managers WHERE CONCAT(managers.first_name, ' ', managers.last_name) = ?));


UPDATE [role_id] employees SET (SELECT id FROM roles WHERE roles.title = ?);
UPDATE employees SET manager_id = (SELECT id FROM employees AS managers WHERE CONCAT(managers.first_name, ' ', managers.last_name) = 'Cheryl Tunt') 
WHERE SELECT CONCAT(managers.first_name, ' ', managers.last_name) FROM employees AS managers = 'Cyril Figgis';


UPDATE employees SET manager_id = (SELECT id FROM employees AS managers WHERE CONCAT(managers.first_name, ' ', managers.last_name) = 'Sterling Archer') 
WHERE CONCAT(employees.first_name, ' ', employees.last_name) = 'Cyril Figgis';

UPDATE employees AS employee
SET
    manager_id = (SELECT
                id 
                FROM
                employees
                AS
                managers
                WHERE 
                CONCAT(managers.first_name, ' ', managers.last_name) = 'Lana Kane'
                )
WHERE 
    CONCAT(employee.first_name, ' ', employee.last_name) = 'Sterling Archer';


SELECT CONCAT(first_name, ' ', last_name) FROM employees WHERE manager_id = ?;
        
SELECT SUM(salary) FROM roles;
SELECT CONCAT(first_name, ' ', last_name) AS employee, roles.title AS role, roles.salary AS salary FROM employees
JOIN roles ON employees.role_id = roles.id
JOIN departments ON roles.department_id = departments.id WHERE departments.name = 'General'; 

SELECT SUM(salary) AS budget FROM employees JOIN roles ON employees.role_id = roles.id JOIN departments ON roles.department_id = departments.id
WHERE departments.name = 'General';
