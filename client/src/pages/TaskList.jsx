import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom"; // Import useParams

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false); // State to manage form visibility
  const [newTaskTitle, setNewTaskTitle] = useState(""); // State to store new task title
  const { taskListName } = useParams(); // Get taskListName from URL
  const navigate = useNavigate()

  const handleDashboard = () => {
    navigate("/dashboard");
  }

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/tasklists?taskListName=${taskListName}`);
        
        if (response.data && response.data.length > 0 && response.data[0].tasks) {
          setTasks(response.data[0].tasks); // Set tasks to the tasks array of the first task list
        } else {
          setTasks([]); // Set tasks to empty array if tasks are not found
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]); // Set tasks to empty array if there's an error
      }
    };
  
    if (taskListName) {
      fetchTasks();
    }
  }, [taskListName]);
  

  // Function to handle form submission for creating a new task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`http://localhost:8800/tasks/create/${taskListName}`, {
        title: newTaskTitle,
        completed: false,
      });

      if (response.data && response.data.newTask) {
        const updatedTasks = [...tasks, response.data.newTask];
        setTasks(updatedTasks);
        setNewTaskTitle(""); // Reset the new task title
        setShowCreateForm(false); // Hide the form after creating the task
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // Function to mark a task as completed
  const handleMarkCompleted = async (taskId) => {
    try {
      const response = await axios.put(`http://localhost:8800/tasks/complete/${taskId}`, {
        completed: true,
      });

      // Update tasks state with the updated task
      if (response.data) {
        const updatedTasks = tasks.map(task =>
          task._id === taskId ? { ...task, completed: true } : task
        );
        setTasks(updatedTasks);
        window.location.reload()
      }
    } catch (error) {
      console.error('Error marking task as completed:', error);
    }
  };

  // Function to delete a task
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await axios.delete(`http://localhost:8800/tasks/delete/${taskId}`);

      // Remove the deleted task from tasks state
      if (response.data) {
        const updatedTasks = tasks.filter(task => task._id !== taskId);
        setTasks(updatedTasks);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Function to update task name
  const handleEditTask = async (taskId) => {
    try {
      const newTaskName = prompt("Enter new task name:");
      if (!newTaskName) return; // If user cancels, do nothing
      
      const response = await axios.put(`http://localhost:8800/tasks/updateName/${taskId}`, {
        name: newTaskName,
      });

      // Update tasks state with the updated task name
      if (response.data) {
        const updatedTasks = tasks.map(task =>
          task._id === taskId ? { ...task, title: newTaskName } : task
        );
        setTasks(updatedTasks);
      }
    } catch (error) {
      console.error('Error updating task name:', error);
    }
  };

  return (
    <div>
      <Link to="/dashboard">back to dashboard</Link>
      <h1>You are currently editing tasks for Task List: {taskListName}</h1>
      <button onClick={() => setShowCreateForm(true)}>Create Task</button>

      
      {showCreateForm && (
        <form onSubmit={handleCreateTask}>
          <label>
            Task Title:
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              required
            />
          </label>
          <button type="submit">Submit</button>
        </form>
      )}

      <p>Tasks:</p>
      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            {task.title} - {task.completed ? "Completed" : "Incomplete"}
            <button className="px-5" onClick={() => handleMarkCompleted(task._id)}>Mark as Complete</button>
            <button className="px-5" onClick={() => handleDeleteTask(task._id)}>Delete Task</button>
            <button className="px-5" onClick={() => handleEditTask(task._id)}>Edit Task</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
