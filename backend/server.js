const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Set your MySQL password
    database: 'kanban_db'
});

db.connect(err => {
    if (err) console.error('MySQL connection failed:', err);
    else console.log('Connected to MySQL');
});

// Fetch all columns
app.get('/columns', (req, res) => {
    db.query('SELECT * FROM columns ORDER BY column_order', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Fetch all tasks
app.get('/tasks', (req, res) => {
    db.query('SELECT * FROM tasks', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Fetch all comments
app.get('/comments', (req, res) => {
    db.query('SELECT * FROM comments', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Add a new comment
app.post('/comments', (req, res) => {
    const { id, taskId, text, createdAt } = req.body;

    if (!taskId || !text) {
        return res.status(400).json({ error: 'Task ID and comment text are required' });
    }

    db.query(
        'INSERT INTO comments (id, task_id, text, created_at) VALUES (?, ?, ?, ?)',
        [id, taskId, text, createdAt || new Date()],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Comment added successfully', commentId: result.insertId });
        }
    );
});


// Create a new task
app.post('/tasks', (req, res) => {
    const { id, content, assignedTo, dueDate, columnId } = req.body;
    db.query(
        'INSERT INTO tasks (id, content, assigned_to, due_date, column_id) VALUES (?, ?, ?, ?, ?)',
        [id, content, assignedTo, dueDate, columnId],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Task created successfully' });
        }
    );
});

// Update a task
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { content, assigned_to, due_date, column_id } = req.body;

    db.query(
        'UPDATE tasks SET content = ?, assigned_to = ?, due_date = ?, column_id = ? WHERE id = ?',
        [content, assigned_to, due_date, column_id, id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Task updated successfully' });
        }
    );
});


// Delete a task
app.delete('/tasks/:id', (req, res) => {
    db.query('DELETE FROM tasks WHERE id=?', [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Task deleted successfully' });
    });
});

// Start Server
app.listen(5000, () => console.log('Server running on port 5000'));
