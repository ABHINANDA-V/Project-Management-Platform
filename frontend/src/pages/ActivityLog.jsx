import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActivityLogs } from "../services/activityService";
import {FiSearch,FiCalendar} from "react-icons/fi"

export default function ActivityLog() {
  const [filters, setFilters] = useState({
    search: "",
    date: "",
    page: 1,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["activities", filters],
    queryFn: () => getActivityLogs(filters),
  });

  const activities = data?.results || [];

  return (
    <div className="p-8 bg-purple-50 min-h-screen">
      <h1 className="text-3xl font-bold text-purple-900 mb-6">Activity Log</h1>

      {/* search and filter */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100 mb-8 flex flex-col md:flex-row gap-4 items-center transition-all">
        {/* Username Search */}
        <div className="relative w-full md:w-72">
          <FiSearch
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by username..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value, page: 1 })
            }
            className="w-full pl-11 pr-4 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all text-sm placeholder:text-purple-300 text-purple-900"
          />
        </div>

        {/* Date Filter */}
        <div className="relative w-full md:w-auto">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
            <FiCalendar size={16} />
          </div>
          <input
            type="date"
            value={filters.date}
            onChange={(e) =>
              setFilters({ ...filters, date: e.target.value, page: 1 })
            }
            className="w-full pl-10 pr-4 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all text-sm text-purple-900 cursor-pointer"
          />
        </div>

        {(filters.search || filters.date) && (
          <button
            onClick={() =>
              setFilters({ ...filters, search: "", date: "", page: 1 })
            }
            className="text-xs font-semibold text-purple-500 hover:text-purple-700 transition-colors px-2"
          >
            Reset Filters
          </button>
        )}
      </div>
      {/* activity list */}
      <div className="bg-white p-6 rounded-xl shadow">
        {isLoading ? (
          <p>Loading...</p>
        ) : activities.length === 0 ? (
          <p className="text-gray-400">No activity found.</p>
        ) : (
          <ul className="space-y-4">
            {activities.map((a) => (
              <ActivityItem key={a.id} activity={a} />
            ))}
          </ul>
        )}

        {/* pagination */}
        <div className="flex justify-between mt-6">
          <button
            disabled={!data?.previous}
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            className="px-4 py-2 bg-purple-100 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">Page {filters.page}</span>

          <button
            disabled={!data?.next}
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            className="px-4 py-2 bg-purple-100 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

const formatTime = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diff = Math.floor((now - past) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;

  return `${Math.floor(diff / 86400)} days ago`;
};

const ActivityItem = ({ activity }) => {
  return (
    <li className="border-l-4 border-purple-400 pl-4">
      <p className="text-sm font-semibold text-gray-800">
        {activity.user_name} {activity.action}
      </p>

      {activity.old_value && (
        <p className="text-xs text-gray-500">
          {activity.old_value} → {activity.new_value}
        </p>
      )}

      <p className="text-xs text-gray-400">
        Task: {activity.task_title} | Project: {activity.project_name}
      </p>

      <p className="text-xs text-gray-400">{formatTime(activity.created_at)}</p>
    </li>
  );
};
