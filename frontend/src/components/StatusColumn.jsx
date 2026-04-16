import React from "react";
import { FiCalendar, FiUser, FiLayers } from "react-icons/fi";

const StatusColumn = ({ title, tasks, accentColor }) => {
  return (
    <div className="bg-[#F3F0F7] p-4 rounded-2xl shadow-inner border border-purple-50 min-h-[500px]">
      {/* Column Header*/}
      <div
        className={`border-l-4 ${accentColor} pl-3 mb-5 flex justify-between items-center`}
      >
        <h2 className="text-sm font-black uppercase tracking-widest text-purple-900">
          {title}
        </h2>
        <span className="bg-white text-purple-700 text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white p-4 rounded-xl shadow-sm border border-transparent hover:border-purple-200 hover:shadow-md transition-all duration-200 group"
          >
            {/* Priority Tag */}
            <div className="mb-3">
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-tighter ${
                  task.priority === "high"
                    ? "bg-red-50 text-red-600"
                    : task.priority === "medium"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {task.priority} Priority
              </span>
            </div>

            {/* Title */}
            <h3 className="font-bold text-slate-800 group-hover:text-purple-700 transition-colors mb-3">
              {task.title}
            </h3>

            {/* Meta Info */}
            <div className="grid grid-cols-1 gap-2 border-t border-slate-50 pt-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <FiLayers className="text-purple-300" />
                <span>
                  Project:{" "}
                  <span className="text-slate-700">{task.project_name}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <FiUser className="text-purple-300" />
                <span className="text-slate-700">
                  {task.assigned_user_username
                    ? `Assignee: ${task.assigned_user_username}`
                    : "Unassigned"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <FiCalendar className="text-purple-300" />
                <span>
                  Due:{" "}
                  <span className="text-purple-700 font-bold">
                    {task.due_date}
                  </span>
                </span>
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 opacity-40 border-2 border-dashed border-purple-200 rounded-xl">
            <p className="text-xs text-purple-400 font-bold italic uppercase tracking-widest">
              No active tasks
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusColumn;
