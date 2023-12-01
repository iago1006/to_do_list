const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3000;
const jwt = require('jsonwebtoken');
const validator = require('validator');
require('dotenv').config();



// Configura la conexión a la base de datos MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

// Conecta a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
    } else {
        console.log('Conexión exitosa a la base de datos');
    }
});

// Middleware para permitir JSON en las solicitudes
app.use(express.json());

// Middleware para verificar el token JWT
function authenticateToken(req, res, next) {
    // Obtiene el token del encabezado de la solicitud
    const authHeader = req.headers['authorization'];

    if (authHeader == null) {
        // Si no se proporciona el token, responde con un código de estado 401 (No autorizado)
        return res.sendStatus(401);
    }

    // Divide el encabezado de autorización para separar "Bearer" del token
    const tokenParts = authHeader.split(' ');

    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        // Si el formato del encabezado de autorización no es válido, responde con un código de estado 401 (No autorizado)
        return res.sendStatus(401);
    }

    const token = tokenParts[1]; // El token está en la segunda parte del arreglo

    // Verifica el token utilizando el mismo secreto utilizado para firmarlo
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Si el token no es válido, responde con un código de estado 403 (Prohibido)
            return res.sendStatus(403);
        }

        // Si el token es válido, el usuario está autenticado
        // Puedes guardar información adicional sobre el usuario en req.user si lo deseas
        req.user = user;
        next();
    });
}

// Ruta para el registro de usuarios
app.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Validación de correo electrónico
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'INVALID_EMAIL', message: 'El correo electrónico no es válido' });
        }

        // Validación de nombre de usuario no vacío
        if (!username) {
            return res.status(400).json({ error: 'EMPTY_USERNAME', message: 'El nombre de usuario no puede estar vacío' });
        }

        // Verifica si el usuario ya existe en la base de datos
        const userExistsQuery = 'SELECT * FROM users WHERE username = ?';
        const [existingUser] = await db.promise().query(userExistsQuery, [username]);

        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'USERNAME_ALREADY_EXISTS', message: 'El nombre de usuario ya está en uso' });
        }

        // Validación de contraseña (mínimo 8 caracteres)
        if (password.length < 8) {
            return res.status(400).json({ error: 'PASSWORD_TOO_SHORT', message: 'La contraseña debe tener al menos 8 caracteres' });
        }

        // Hashea la contraseña antes de almacenarla
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Inserta el nuevo usuario en la base de datos
        const insertUserQuery = 'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)';
        await db.promise().query(insertUserQuery, [username, hashedPassword, email]);

        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', message: 'Error al registrar usuario' });
    }
});


// Ruta para la autenticación de usuarios
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Busca al usuario en la base de datos por nombre de usuario
        const userQuery = 'SELECT * FROM users WHERE username = ?';
        const [user] = await db.promise().query(userQuery, [username]);

        // Si no se encuentra el usuario, responde con un mensaje de error
        if (user.length === 0) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Verifica la contraseña
        const isPasswordValid = await bcrypt.compare(password, user[0].password_hash);

        // Si la contraseña no es válida, responde con un mensaje de error
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Si las credenciales son válidas, genera un token JWT con el user_id
        const token = jwt.sign({ userId: user[0].user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Devuelve el token como respuesta
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error al autenticar usuario:', error);
        res.status(500).json({ message: 'Error al autenticar usuario' });
    }
});


// Ruta para crear una lista de tareas
app.post('/lists', authenticateToken, async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.userId;

        // Insertamos la nueva lista de tareas en la base de datos con el user_id del usuario autenticado
        const insertListQuery = 'INSERT INTO task_lists (user_id, name) VALUES (?, ?)';
        await db.promise().query(insertListQuery, [userId, name]);

        res.status(201).json({ message: 'Lista de tareas creada correctamente' });
    } catch (error) {
        console.error('Error al crear la lista de tareas:', error);
        res.status(500).json({ message: 'Error al crear la lista de tareas' });
    }
});


// Ruta para crear una nueva tarea en una lista
app.post('/lists/:listId/tasks', authenticateToken, async (req, res) => {
    try {
        const { title, description, dueDate, taskTime } = req.body;
        const listId = req.params.listId;
        const userId = req.user.userId;

        // Verificar si la lista seleccionada pertenece al usuario
        const isListValidQuery = 'SELECT * FROM task_lists WHERE list_id = ? AND user_id = ?';
        const [validList] = await db.promise().query(isListValidQuery, [listId, userId]);

        if (!validList.length) {
            return res.status(403).json({ message: 'No tienes permiso para agregar tareas a esta lista.' });
        }

        // Insertar la nueva tarea en la base de datos
        const insertTaskQuery = 'INSERT INTO tasks (list_id, title, description, due_date, task_time) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.promise().query(insertTaskQuery, [listId, title, description, dueDate, taskTime]);

        // Devolver la tarea creada como respuesta
        res.status(201).json({ taskId: result.insertId, title, description, dueDate, taskTime });
    } catch (error) {
        console.error('Error al crear la tarea:', error);
        res.status(500).json({ message: 'Error al crear la tarea' });
    }
});

// Ruta para obtener todas las listas de tareas de un usuario
app.get('/lists', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Consulta todas las listas de tareas del usuario
        const getListsQuery = 'SELECT * FROM task_lists WHERE user_id = ?';
        const [lists] = await db.promise().query(getListsQuery, [userId]);

        res.status(200).json(lists);
    } catch (error) {
        console.error('Error al obtener las listas de tareas del usuario:', error);
        res.status(500).json({ message: 'Error al obtener las listas de tareas del usuario' });
    }
});

// Ruta para obtener una lista de tareas específica
app.get('/lists/:listId', authenticateToken, async (req, res) => {
    try {
        const listId = req.params.listId;
        const userId = req.user.userId;

        // Verificar si la lista seleccionada pertenece al usuario
        const isListValidQuery = 'SELECT * FROM task_lists WHERE list_id = ? AND user_id = ?';
        const [validList] = await db.promise().query(isListValidQuery, [listId, userId]);

        if (!validList.length) {
            return res.status(403).json({ message: 'No tienes permiso para ver esta lista de tareas.' });
        }

        // Consultar las tareas de la lista
        const getTasksQuery = 'SELECT * FROM tasks WHERE list_id = ?';
        const [tasks] = await db.promise().query(getTasksQuery, [listId]);

        // Devolver la lista de tareas y sus tareas asociadas como respuesta
        res.status(200).json({ list: validList[0], tasks });
    } catch (error) {
        console.error('Error al obtener la lista de tareas:', error);
        res.status(500).json({ message: 'Error al obtener la lista de tareas' });
    }
});

// Ruta para actualizar el nombre de una lista de tareas
app.put('/lists/:listId', authenticateToken, async (req, res) => {
    try {
        const listId = req.params.listId;
        const userId = req.user.userId;
        const { newName } = req.body;

        // Verificar si la lista seleccionada pertenece al usuario
        const isListValidQuery = 'SELECT * FROM task_lists WHERE list_id = ? AND user_id = ?';
        const [validList] = await db.promise().query(isListValidQuery, [listId, userId]);

        if (!validList.length) {
            return res.status(403).json({ message: 'No tienes permiso para actualizar esta lista de tareas.' });
        }

        // Actualizar el nombre de la lista en la base de datos
        const updateListQuery = 'UPDATE task_lists SET name = ? WHERE list_id = ?';
        await db.promise().query(updateListQuery, [newName, listId]);

        res.status(200).json({ message: 'Nombre de la lista actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar el nombre de la lista de tareas:', error);
        res.status(500).json({ message: 'Error al actualizar el nombre de la lista de tareas' });
    }
});

// Ruta para eliminar una lista de tareas y sus tareas relacionadas
app.delete('/lists/:listId', authenticateToken, async (req, res) => {
    try {
        const listId = req.params.listId;
        const userId = req.user.userId;

        // Verificar si la lista seleccionada pertenece al usuario
        const isListValidQuery = 'SELECT * FROM task_lists WHERE list_id = ? AND user_id = ?';
        const [validList] = await db.promise().query(isListValidQuery, [listId, userId]);

        if (!validList.length) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar esta lista de tareas.' });
        }

        // Eliminar las tareas relacionadas a la lista
        const deleteTasksQuery = 'DELETE FROM tasks WHERE list_id = ?';
        await db.promise().query(deleteTasksQuery, [listId]);

        // Eliminar la lista de tareas
        const deleteListQuery = 'DELETE FROM task_lists WHERE list_id = ?';
        await db.promise().query(deleteListQuery, [listId]);

        res.status(200).json({ message: 'Lista de tareas y tareas relacionadas eliminadas correctamente' });
    } catch (error) {
        console.error('Error al eliminar la lista de tareas:', error);
        res.status(500).json({ message: 'Error al eliminar la lista de tareas' });
    }
});

// Ruta para actualizar una tarea
app.patch('/lists/:listId/tasks/:taskId', authenticateToken, async (req, res) => {
    try {
        const { title, description, dueDate, taskTime, completed } = req.body;
        const taskId = req.params.taskId;
        const userId = req.user.userId;

        // Verificar si la tarea pertenece a la lista y al usuario
        const isTaskValidQuery = 'SELECT * FROM tasks t JOIN task_lists l ON t.list_id = l.list_id WHERE t.task_id = ? AND l.user_id = ?';
        const [validTask] = await db.promise().query(isTaskValidQuery, [taskId, userId]);

        if (!validTask.length) {
            return res.status(403).json({ message: 'No tienes permiso para actualizar esta tarea.' });
        }

        // Actualizar la tarea en la base de datos
        const updateTaskQuery = 'UPDATE tasks SET title = ?, description = ?, due_date = ?, task_time = ?, completed = ? WHERE task_id = ?';
        await db.promise().query(updateTaskQuery, [title, description, dueDate, taskTime, completed, taskId]);

        res.status(200).json({ message: 'Tarea actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar la tarea:', error);
        res.status(500).json({ message: 'Error al actualizar la tarea' });
    }
});


// Ruta para eliminar una tarea
app.delete('/lists/:listId/tasks/:taskId', authenticateToken, async (req, res) => {
    try {
        const listId = req.params.listId;
        const taskId = req.params.taskId;
        const userId = req.user.userId;

        // Verificar si la tarea pertenece a la lista y al usuario
        const isTaskValidQuery = 'SELECT * FROM tasks t INNER JOIN task_lists l ON t.list_id = l.list_id WHERE t.task_id = ? AND l.user_id = ?';
        const [validTask] = await db.promise().query(isTaskValidQuery, [taskId, userId]);

        if (!validTask.length) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar esta tarea.' });
        }

        // Eliminar la tarea de la base de datos
        const deleteTaskQuery = 'DELETE FROM tasks WHERE task_id = ?';
        await db.promise().query(deleteTaskQuery, [taskId]);

        res.status(200).json({ message: 'Tarea eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar la tarea:', error);
        res.status(500).json({ message: 'Error al eliminar la tarea' });
    }
});

// Inicia el servidor
app.listen(port, () => {
    console.log(`Servidor en ejecución en el puerto ${port}`);
});