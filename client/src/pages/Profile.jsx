// Profile.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";

const Profile = () => {
  const { user } = useParams();

  return (
    <div className="max-w-lg px-4">
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      <p className="text-lg mb-2">Welcome, {user}!</p>
      <Link
        to={`/profile/${user}/usersettings`}
        className="inline-block bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out"
      >
        User Settings
      </Link>
    </div>
  );
};

export default Profile;
