import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getTasks } from "../services/taskService";
import StatusColumn from "../components/StatusColumn";
import { FiLayout, FiLoader,FiSearch } from "react-icons/fi";
import { useState } from "react";

const Status = () => {
  const [search, setSearch] = useState("");
  // Fetch all tasks
  const { data: tasks = [], isFetching } = useQuery({
    queryKey: ["tasks", "all", search],
    queryFn: getTasks,
  });

  // Group tasks
  const todoTasks = tasks.filter((t) => t.status === "todo");
  const progressTasks = tasks.filter((t) => t.status === "in_progress");
  const doneTasks = tasks.filter((t) => t.status === "done");

 

  return (
    <div className="p-4 md:p-8 bg-[#FDFCFE] min-h-screen">
      {/* HEADER SECTION */}
      <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <FiLayout className="text-purple-600 text-xl" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-purple-900 tracking-tight">
            Task Status Board
          </h1>
          <p className="text-purple-500 text-sm font-medium">
            Visualizing workflow progress across all projects
          </p>
          </div>
          </div>

          <div className="flex items-center gap-4 p-4 border border-purple-100 rounded-xl bg-white shadow-[inset_0_2px_4px_rgba(107,33,168,0.05)]">
            <div className="relative flex-grow max-w-lg">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 text-lg" />
            <input
              type="text"
              placeholder="Search by task, project, or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-purple-100 rounded-full bg-purple-50 focus:ring-2 focus:ring-purple-500 outline-none text-purple-900 placeholder:text-purple-400"
            />
          </div>

            {isFetching && <FiLoader className="animate-spin text-purple-600" />}
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {/* Todo column */}
        <StatusColumn
          title="Todo"
          tasks={todoTasks}
          accentColor="border-slate-300"
        />

        {/* progress column */}
        <StatusColumn
          title="In Progress"
          tasks={progressTasks}
          accentColor="border-purple-400"
        />

        {/* done column */}
        <StatusColumn
          title="Done"
          tasks={doneTasks}
          accentColor="border-emerald-400"
        />
      </div>
    </div>
  );
};

export default Status;
