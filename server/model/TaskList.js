const mongoose = require('mongoose');

// Task schema for individual tasks within a task list
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});

// TaskList schema with an array of tasks
const taskListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  tasks: [taskSchema] // Embedding taskSchema within TaskList schema
});

// Create a TaskList model from the taskListSchema
const TaskList = mongoose.model('TaskList', taskListSchema);

module.exports = TaskList;
