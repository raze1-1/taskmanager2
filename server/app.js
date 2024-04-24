require("dotenv").config()
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./model/User")
const TaskList = require("./model/TaskList")

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb+srv://raze1_1:WJhc46L1kB67mcPt@clustrr.4cz8ivo.mongodb.net/?retryWrites=true&w=majority&appName=Clustrr", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});


app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const newUser = new User({
      username,
      email,
      password,
    });

    // Save the user to the database
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET user ID by username
app.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ userId: user._id }); // Return the user ID
  } catch (error) {
    console.error('Error fetching user ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords (assuming stored password is plain text)
    const passwordMatch = user.password === password;
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }


    res.status(200).json({ username: user.username, userId: user._id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/tasklists", async (req, res) => {
  try {
    const { userId, name, tasks } = req.body; // Corrected to use userId

    // Create a new task list
    const newTaskList = new TaskList({
      userId,
      name,
      tasks
    });

    // Save the task list to the database
    await newTaskList.save();

    res.status(201).json(newTaskList);
  } catch (error) {
    console.error("Error creating task list:", error);
    res.status(500).json({ message: "Error creating task list", error: error.message });
  }
});

// GET tasklists route
app.get("/tasklists", async (req, res) => {
  try {
    const { taskListName, userId } = req.query;
    let query = {};

    if (taskListName) {
      query.name = taskListName;
    }

    if (userId) {
      query.userId = userId;
    }

    // Assuming you have a TaskList model
    const taskLists = await TaskList.find(query);

    res.status(200).json(taskLists);
  } catch (error) {
    console.error("Error fetching task lists:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/tasklists/delete", async (req, res) => {
  try {
    const { taskListName } = req.query;
    const deletedTaskList = await TaskList.findOneAndDelete({ "name": taskListName });
    console.log(taskListName)

    if (!deletedTaskList) {
      return res.status(404).json({ error: "Task list not found" });
    }

    return res.status(200).json({ message: "Task list deleted" });
  } catch (error) {
    console.error("Error deleting task list:", error);
    res.status(500).json({ error: "Failed to delete task list" });
  }
});

app.put("/tasklists/update", async (req, res) => {
  try {
    const { taskListName, newTaskListName } = req.body;

    if (!taskListName || !newTaskListName) {
      return res.status(400).json({ error: "Both taskListName and newTaskListName are required" });
    }

    const updatedTaskList = await TaskList.findOneAndUpdate(
      { "name": taskListName },
      { $set: { "name": newTaskListName } },
      { new: true } // Return the updated document
    );

    if (!updatedTaskList) {
      return res.status(404).json({ error: "Task list not found" });
    }

    return res.status(200).json({ message: "Task list name updated", updatedTaskList });
  } catch (error) {
    console.error("Error updating task list name:", error);
    res.status(500).json({ error: "Failed to update task list name" });
  }
});



// mark task as completed endpoint
app.put("/tasks/complete/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  const { completed } = req.body;

  try {
    console.log("Received Task ID:", taskId);

    // Update the task in the database
    const updatedTask = await TaskList.findOneAndUpdate(
      { "tasks._id": taskId },
      { $set: { "tasks.$.completed": completed } },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Update user's streaks and last completed task date
    const user = await User.findOne({ username: updatedTask.username });
    console.log(user)

    // Send the updated task as a response
    res.json(updatedTask);

  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
});



// delete task endpoint
app.delete("/tasks/delete/:taskId", async (req, res) => {
  const taskId = req.params.taskId;

  try {
    // Find the task list that contains the task to be deleted
    const taskList = await TaskList.findOne({ "tasks._id": taskId });

    // Check if task list was not found
    if (!taskList) {
      return res.status(404).json({ error: "Task list not found" });
    }

    // Filter out the task to be deleted
    const updatedTasks = taskList.tasks.filter(task => task._id.toString() !== taskId);

    // Update the task list with the filtered tasks
    taskList.tasks = updatedTasks;
    
    // Save the updated task list
    const updatedTaskList = await taskList.save();

    // Send the deleted task as a response
    res.json({ message: "Task deleted successfully", updatedList: updatedTaskList });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// update task name endpoint
app.put("/tasks/updateName/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  const newName = req.body.name;

  try {
    // Find the task list that contains the task to be updated
    const taskList = await TaskList.findOne({ "tasks._id": taskId });

    // Check if task list was not found
    if (!taskList) {
      return res.status(404).json({ error: "Task list not found" });
    }

    // Find the index of the task to update
    const taskIndex = taskList.tasks.findIndex(task => task._id.toString() === taskId);

    // Check if task to update was not found
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Update the name of the task directly within the TaskList
    taskList.tasks[taskIndex].title = newName;

    // Save the updated task list
    const updatedTaskList = await taskList.save();

    res.json({ message: "Task name updated successfully", updatedTask: updatedTaskList });
  } catch (error) {
    console.error("Error updating task name:", error);
    res.status(500).json({ error: "Failed to update task name" });
  }
});

app.post("/tasks/create/:taskListName", async (req, res) => {
  const taskListName = req.params.taskListName;
  const{ title, completed } = req.body;

  try {
    const taskList = await TaskList.findOne({name: taskListName});

    if (!taskList) {
      return res.status(404).json({ error: "Task list not found" });
    }

    const newTask = {
      title: title,
      completed : false,
    }

    taskList.tasks.push(newTask);

    const updatedTaskList = await taskList.save()

    res.status(201).json({ message: "Task added successfully", newTask: updatedTaskList.tasks.slice(-1)[0] });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ error: "Failed to add task" });
  }
});





app.use(express.json());

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
