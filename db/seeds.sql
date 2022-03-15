-- insert data into the db

INSERT INTO department (name) 
VALUES 
    ("Administration"), 
    ("Operations"),
    ("Food and Beverage"),
    ("Resort Services")
;

INSERT INTO role (title, salary, department_id)
VALUES
    ("Admin Assistant", 60000, 1),
    ("Operations Director", 110000, 2),
    ("Ski Patrol Manager", 70000, 2),
    ("Lift Operations Manager", 65000, 2),
    ("Lift Operations Lead", 40000, 2),
    ("F+B Director", 110000, 3),
    ("Restaurant Manager", 60000, 3),
    ("Cook", 50000, 3),
    ("Resort Services Director", 110000, 4),
    ("Ski School Manager", 70000, 4),
    ("Ski School Supervisor", 52000, 4),
    ("Guest Services Supervisor", 50000, 4)
;

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ("Wendy", "Williams", 1, NULL),
    ("Vince", "Vaughn", 2, NULL),
    ("Angela", "Amos", 3, 2),
    ("Reed", "Richards", 4, 2),
    ("Corey", "Crippin", 5, 4),
    ("Kelsey", "King", 5, 4),
    ("Matt", "McDowell", 6, NULL),
    ("Molly", "Melton", 7, 7),
    ("Steven", "Stevens", 8, 8),
    ("Jane", "Joplin", 8, 8),
    ("Ben", " Bingo", 9, NULL),
    ("Alicia", "Anton", 10, 11),
    ("Jeanine", "Joplin", 11, 12),
    ("Andy", "Amos", 11, 12),
    ("Steven", "Seatal", 12, NULL)
;


