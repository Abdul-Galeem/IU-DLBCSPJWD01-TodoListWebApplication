// Imports
const express = require("express");
const cors = require("cors");

// Create an express application instance (main server)
const app = express();

// The port number the server will run on
const PORT = 3000;

// Middleware setup
app.use(cors());
app.use(express.json());

// In-memory task storage 
let tasks = [];
let idCounter = 0;

// A test route to confirm backend is running 
app.get("/", (request, response) => {
    response.json({ message: "Welcome to the To-do backend"});
});

// Return tasks stored in memory
app.get("/tasks", (request, response) => {
    response.json(tasks);
});

// Create a new task and add it to the task list
app.post("/tasks", (request, response) => {
    const { taskTitle, category, priority, dueDate } = request.body;

    // Backend validation
    if (!taskTitle || !category || !priority) {
        return response.status(400).json({ error: "Task title, category, and priority are required"});
    }

    const newTask = {
        id: idCounter++,
        taskTitle: taskTitle.trim(),
        category,
        priority,
        completion: false,
        dueDate: dueDate || null,    
    };

    tasks.push(newTask);
    response.status(201).json(newTask);
});

// Updates an existing task
app.put("/tasks/:id", (request, response) => {
    const id = parseInt(request.params.id);
    const task = tasks.find(t => t.id === id);

    // Return error if task does not exist
    if (!task) {
        return response.status(404).json({ error: "Task not found"});             
    }  

    const { taskTitle, completion } = request.body; 
    
    // Update only provided fields
    if (taskTitle !== undefined) task.taskTitle = taskTitle.trim();
    if (completion !== undefined) task.completion = completion;
    
    response.json(task); 
});

// Delete task 
app.delete("/tasks/:id", (request, response) => {
    const id = parseInt(request.params.id);
    
    // Check if task exists 
    const taskExists = tasks.some(t => t.id === id);
    if (!taskExists) {
        return response.status(404).json({ error: "Task not found"});
    }

    // Remove task from array 
    tasks = tasks.filter(t => t.id !== id);

    response.json({ message: "Task successfully removed"});
});

// Start backend server and listen for requests 
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});