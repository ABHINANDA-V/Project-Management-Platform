import { useQuery } from "@tanstack/react-query";
import {
  FiFolder,
  FiUsers,
  FiAlertCircle,
  FiActivity,
  FiCheckCircle,
} from "react-icons/fi";
import { getProjects } from "../services/projectService";
import { getTasks } from "../services/taskService";
import { getUsers } from "../services/userService";
import { getActivityLogs } from "../services/activityService";

export default function AdminDashboard() {
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
  const { data } = useQuery({
    queryKey: ["activities"],
    queryFn: () => getActivityLogs(),
  });

  const activities = data?.results || [];
  const totalProjects = projects.length;
  const activeUsers = users.length;
  const overdueTasks = tasks.filter((task) => {
    const today = new Date();
    return new Date(task.due_date) < today && task.status !== "done";
  }).length;

  return (
    <div className="p-8 bg-purple-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-purple-900">
          Admin Console
        </h1>
        <p className="text-purple-600">System Overview & Analytics</p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          title="Projects"
          value={totalProjects}
          icon={<FiFolder className="text-purple-600" />}
        />
        <Card
          title="Active Users"
          value={activeUsers}
          icon={<FiUsers className="text-blue-600" />}
        />
        <Card
          title="Tasks Overdue"
          value={overdueTasks}
          icon={
            <FiAlertCircle
              className={overdueTasks > 0 ? "text-red-600" : "text-green-600"}
            />
          }
          isAlert={overdueTasks > 0}
        />
      </div>

      {/* BOTTOM SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProjectTracking projects={projects} />
        <RecentActions activities={activities} />
      </div>
    </div>
  );
}

const Card = ({ title, value, icon, isAlert }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-purple-500 uppercase tracking-wider">
          {title}
        </p>
        <h2
          className={`text-3xl font-bold mt-1 ${isAlert ? "text-red-500" : "text-purple-900"}`}
        >
          {value}
        </h2>
      </div>
      <div className="text-3xl p-3 bg-gray-50 rounded-lg">{icon}</div>
    </div>
  );
};

const ProjectTracking = ({ projects }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
      <div className="flex items-center gap-2 mb-6">
        <FiActivity className="text-purple-600 text-xl" />
        <h2 className="text-xl font-bold text-purple-900">Project Progress</h2>
      </div>

      {projects.length === 0 ? (
        <p className="text-gray-400 italic">No projects found.</p>
      ) : (
        projects.map((p) => {
          const total = p.task_count || 1;
          const percent = Math.min((total / 10) * 100, 100);

          return (
            <div key={p.id} className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-purple-800">{p.name}</p>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                  {Math.round(percent)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

const formatTime = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diff = Math.floor((now - past) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;

  return `${Math.floor(diff / 86400)} days ago`;
};

const RecentActions = ({ activities }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
      <div className="flex items-center gap-2 mb-6">
        <FiCheckCircle className="text-purple-600 text-xl" />
        <h2 className="text-xl font-bold text-purple-900">Recent Activity</h2>
      </div>

      <ul className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-400 italic">No recent activity.</p>
        ) : (
          activities
            .slice(0, 5)
            .map((a) => (
              <ActivityItem
                key={a.id}
                text={`${a.user_name || "User"} ${a.action}`}
                time={formatTime(a.created_at)}
              />
            ))
        )}
      </ul>
    </div>
  );
};

const ActivityItem = ({ text, time }) => (
  <li className="flex items-start gap-3 border-l-2 border-purple-100 pl-4 relative">
    <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-purple-400"></div>
    <div>
      <p className="text-sm text-gray-700 font-medium">{text}</p>
      <p className="text-xs text-gray-400">{time}</p>
    </div>
  </li>
);
