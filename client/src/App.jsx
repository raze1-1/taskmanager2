import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from "sonner";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile"
import Dashboard from "./pages/dashboard";
import TaskList from "./pages/TaskList";
import NotFound from "./pages/NotFound";
import UserSettings from "./pages/UserSettings";

function Layout() {
  const { user } = useSelector((state) => state.auth);
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // You can return a layout for authenticated users here
  return (
    <div>
      <Dashboard user={user} />
    </div>
  );
}

function App() {
  const { user } = useSelector((state) => state.auth);
  return (
    <main className="w-full min-h-screen bg-[#f3f4f6]">
      <Routes>
        {/* Route for authenticated pages */}
        <Route element={<Layout />}>
          <Route index path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} /> 
        </Route>

        <Route path="/profile/:user" element={<Profile user={user}/>} />
        <Route path="/profile/:user/usersettings" element={<UserSettings user={user}/>} />
        <Route path="/tasklist/:taskListName" element={<TaskList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster richColors />
    </main>
  );
}

export default App;
