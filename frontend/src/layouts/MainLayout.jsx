import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

const MainLayout = ({ children }) => {
  const [open, setOpen] = useState(true); // mobile default closed

  return (
    <div className="flex h-screen overflow-hidden">

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed z-50 inset-y-0 left-0 transform 
          ${open ? "translate-x-0" : "-translate-x-full"}
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
        `}
      >
        <Sidebar open={open} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        <div className="p-4 shadow-md bg-white flex items-center">
          <button
            onClick={() => setOpen(!open)}
            className="text-2xl lg:hidden"
          >
            ☰
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </div>
      </div>

    </div>
  );
};

export default MainLayout;