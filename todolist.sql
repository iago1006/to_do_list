-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS to_do_list;

-- Seleccionar la base de datos recién creada
USE to_do_list;

-- Crear la tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

-- Crear la tabla de listas de tareas
CREATE TABLE IF NOT EXISTS task_lists (
    list_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Crear la tabla de tareas
CREATE TABLE IF NOT EXISTS tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    list_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (list_id) REFERENCES task_lists(list_id)
);

-- Mostrar un mensaje de confirmación
SELECT 'Base de datos y datos de prueba creados correctamente' AS mensaje;
