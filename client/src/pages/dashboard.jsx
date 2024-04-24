import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

function TaskLists({ userId }) {
  const [taskLists, setTaskLists] = useState([]);

  useEffect(() => {
    const fetchTaskLists = async () => {
      try {
        const response = await axios.get('http://localhost:8800/tasklists', {
          params: {
            userId: userId
          },
        });

        setTaskLists(response.data);
      } catch (error) {
        console.error('Error fetching task lists:', error);
      }
    };

    fetchTaskLists();
  }, [userId]);

  const handleDeleteTaskList = async (taskListId) => {
    try {
      const response = await axios.delete(`http://localhost:8800/tasklists/delete?taskListName=${taskListId}`);

      if (response.data && response.data.message) {
        // Refresh the task lists after deletion
        const updatedTaskLists = taskLists.filter(taskList => taskList._id !== taskListId);
        setTaskLists(updatedTaskLists);
        window.location.reload()
      }
    } catch (error) {
      console.error("Error deleting task list:", error);
    }
  };

  return (
    <div>
      <h2>Tasklists:</h2>
      <ul>
        {taskLists.map(taskList => (
          <li key={taskList._id}>
            <Link to={`/tasklist/${taskList.name}`}>{taskList.name}</Link>
            <button onClick={() => handleDeleteTaskList(taskList.name)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const Dashboard = ({ user }) => {
  const [userId, setUserId] = useState(null);
  const [newTaskListName, setNewTaskListName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateTaskListName, setUpdateTaskListName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/user/${user}`);

        if (response.data.userId) {
          localStorage.setItem("userID", response.data.userId)
          setUserId(response.data.userId);
        } else {
          console.error('User ID not found');
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, [user]);

  const handleCreateTaskList = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8800/tasklists", {
        userId: userId,
        name: newTaskListName,
        tasks: []
      });

      if (response.data && response.data._id) {
        setNewTaskListName(""); // Reset the input field
        // Refresh the task lists
        window.location.reload()
      }
    } catch (error) {
      console.error("Error creating task list:", error);
    }
  };

  const handleUpdateTaskListName = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("http://localhost:8800/tasklists/update", {
        taskListName: updateTaskListName,
        newTaskListName: newTaskListName
      });

      if (response.data && response.data.message) {
        setUpdateTaskListName(""); // Reset the input field
        setNewTaskListName(""); // Reset the input field
        setShowUpdateForm(false); // Hide the update form
        // Refresh the task lists
        window.location.reload()
      }
    } catch (error) {
      console.error("Error updating task list name:", error);
    }
  };

  return (
    <div>
      <h1>Welcome, {user}!</h1>
      <Link to={`profile/${user}`}>Profile</Link>
      <button>user settings</button><br></br>
      <button className="px-5" onClick={() => setShowCreateForm(true)}>Create new task list</button>
      <button className="px-5" onClick={() => setShowUpdateForm(true)}>Update task list name</button>
      <TaskLists userId={userId} />

      {/* Form for creating a new task list */}
      {showCreateForm && (
        <form onSubmit={handleCreateTaskList}>
          <label>
            Task List Name:
            <input
              type="text"
              value={newTaskListName}
              onChange={(e) => setNewTaskListName(e.target.value)}
              required
            />
          </label>
          <button type="submit">Create Task List</button>
        </form>
      )}

      {/* Form for updating a task list name */}
      {showUpdateForm && (
        <form onSubmit={handleUpdateTaskListName}>
          <label>
            Task List Name to Update:
            <input
              type="text"
              value={updateTaskListName}
              onChange={(e) => setUpdateTaskListName(e.target.value)}
              required
            />
          </label>
          <label>
            New Task List Name:
            <input
              type="text"
              value={newTaskListName}
              onChange={(e) => setNewTaskListName(e.target.value)}
              required
            />
          </label>
          <button type="submit">Update Task List Name</button>
        </form>
      )}
    </div>
  );
};

export default Dashboard;
