import React from "react";
import { Link, useLocation } from "react-router-dom"; 
import { useSelector } from "react-redux";

const Sidebar = ({ open }) => {
  const role = useSelector((state) => state.auth.role);
  const username = useSelector((state) => state.auth.username);
  const location = useLocation(); // Helps us highlight the current page

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // Helper function to style links
  const linkStyle = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center p-2 rounded-lg transition-colors duration-200 ${
      isActive 
        ? "bg-purple-600 text-white shadow-md" 
        : "text-purple-100 hover:bg-purple-800 hover:text-white"
    }`;
  };

  return (
    <div
      className={`bg-purple-900 text-white min-h-screen flex flex-col justify-between shadow-xl transition-all duration-300 border-r border-purple-800
       ${open ? "w-64" : "w-20 lg:w-64"}`}
    >
      <div className="flex flex-col">
        {/* Logo  */}
        <div className="p-6 mb-4">
          {open ? (
            <h1 className="text-xl font-bold tracking-tight text-white">
              Project<span className="text-purple-400">Flow</span>
            </h1>
          ) : (
            <div className="w-8 h-8 bg-purple-500 rounded-lg mx-auto"></div>
          )}
        </div>

        <ul className="space-y-2 px-4 font-medium">
          {/* Admin Links */}
          {role === "admin" && (
            <>
              <li><Link to="/admin-dashboard" className={linkStyle("/admin-dashboard")}>{open && "Dashboard"}</Link></li>
              <li><Link to="/projects" className={linkStyle("/projects")}>{open && "Projects"}</Link></li>
              <li><Link to="/tasks" className={linkStyle("/tasks")}>{open && "Tasks"}</Link></li>
              <li><Link to="/manageUsers" className={linkStyle("/manageUsers")}>{open && "Users"}</Link></li>
              <li><Link to="/status" className={linkStyle("/status")}>{open && "Status"}</Link></li>
              <li><Link to="/admin-review" className={linkStyle("/admin-review")}>{open && "Review"}</Link></li>
              <li><Link to="/activity-log" className={linkStyle("/activity-log")}>{open && "Activity Log"}</Link></li>
              <li><Link to="/my-tasks" className={linkStyle("/my-tasks")}>{open && "My Tasks"}</Link></li>
            </>
          )}

          {/* User links */}
          {role === "user" && (
            <>
              <li><Link to="/user-dashboard" className={linkStyle("/user-dashboard")}>{open && "Dashboard"}</Link></li>
              <li><Link to="/my-tasks" className={linkStyle("/my-tasks")}>{open && "My Tasks"}</Link></li>
               <li><Link to="/status" className={linkStyle("/status")}>{open && "Status"}</Link></li>
                <li><Link to="/activity-log" className={linkStyle("/activity-log")}>{open && "Activity Log"}</Link></li>
            </>
          )}
        </ul>
      </div>

      
{/* Logout */}
<div className="p-4 border-t border-purple-800">
  
  {/* User Name Display */}
  {open && (
    <div className="flex items-center mb-4 px-2">
      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-xs">
        {role?.charAt(0).toUpperCase()} 
      </div>
      <div className="ml-3 overflow-hidden">
        <p className="text-sm font-medium text-white truncate">
          {username || "User"}
        </p>
        <p className="text-xs text-purple-400 capitalize">{role}</p>
      </div>
    </div>
  )}

  <button
    onClick={handleLogout}
    className="flex items-center w-full px-4 py-2 text-sm font-medium text-purple-200 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200"
  >
    {open ? "Logout" : "Exit"}
  </button>
</div>
    </div>
  );
};

export default Sidebar;