INSERT INTO departments (name)
VALUES  ('General'),
        ('Production'),
        ('Human Resources'),
        ('Management'),
        ('Finance');

INSERT INTO roles (title, salary, department_id)
VALUES  ('HR Representative', 30000, 3),
        ('Accountant', 50000, 5),
        ('Secret Agent', 200000, 2),
        ('Secretary', 30000, 1),
        ('Scientist', 75000, 2),
        ('CEO', 1000000, 4),
        ('Valet', 15000, 1);



INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES  ('Sterling', 'Archer', 3, 5),
        ('Lana', 'Kane', 3, 5),
        ('Cyril', 'Figgis', 2, 5),
        ('Algernon', 'Kreager', 5, 5),
        ('Malory', 'Archer', 6, NULL),
        ('Cheryl', 'Tunt', 4, 5),
        ('Carol', 'Tunt', 4, 5),
        ('Charlene', 'Tunt', 4, 5),
        ('Pam', 'Poovey', 1, 5),
        ('Ray', 'Gillete', 3, 5),
        ('Arthur', 'Woodhouse', 7, 5);