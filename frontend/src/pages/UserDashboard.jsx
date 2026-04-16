import { useQuery } from "@tanstack/react-query";
import { getTasks } from "../services/taskService";
import { FiCheckCircle, FiClock, FiList, FiAlertCircle, FiSunrise, FiSun, FiMoon } from "react-icons/fi";

export default function UserDashboard() {
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  // priority filter
  const highTasks = tasks.filter(t => t.priority === "high");
  const mediumTasks = tasks.filter(t => t.priority === "medium");
  const lowTasks = tasks.filter(t => t.priority === "low");

  // Counts
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "done").length;
  const pending = tasks.filter(t => t.status !== "done").length;

  const hour = new Date().getHours();
  let greeting = "Hello";
  let GreetingIcon = FiSun;

  if (hour < 12) {
    greeting = "Good Morning";
    GreetingIcon = FiSunrise;
  } else if (hour < 18) {
    greeting = "Good Afternoon";
    GreetingIcon = FiSun;
  } else {
    greeting = "Good Evening";
    GreetingIcon = FiMoon;
  }

  return (
    <div className="p-4 md:p-8 bg-purple-50/50 min-h-screen">
      {/* TOP SECTION */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <GreetingIcon className="text-purple-600 text-2xl" />
          <h1 className="text-2xl md:text-3xl font-extrabold text-purple-900 tracking-tight">
            {greeting}, Welcome 
          </h1>
        </div>
        <p className="text-purple-600/70 font-medium mt-1">Check your task priorities and progress below.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card title="Total Tasks" value={total} color="blue" icon={<FiList />} />
        <Card title="Pending Tasks" value={pending} color="yellow" icon={<FiClock />} />
        <Card title="Completed Tasks" value={completed} color="green" icon={<FiCheckCircle />} />
      </div>

      <div className="flex items-center gap-2 mb-6">
        <FiAlertCircle className="text-purple-700" />
        <h2 className="text-xl font-bold text-purple-900">Task Priority</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PriorityCard title="High" tasks={highTasks} color="red" />
        <PriorityCard title="Medium" tasks={mediumTasks} color="yellow" />
        <PriorityCard title="Low" tasks={lowTasks} color="green" />
      </div>
    </div>
  );
}

const Card = ({ title, value, color, icon }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    yellow: "bg-amber-50 text-amber-600 border-amber-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 flex items-center justify-between hover:shadow-md transition-all duration-300">
      <div>
        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">{title}</p>
        <h2 className="text-3xl font-black text-purple-900">{value}</h2>
      </div>
      <div className={`p-4 rounded-xl text-xl border ${colors[color]}`}>
        {icon}
      </div>
    </div>
  );
};

const PriorityCard = ({ title, tasks, color }) => {
  const colors = {
    red: "text-red-700 bg-red-50 border-red-100",
    yellow: "text-amber-700 bg-amber-50 border-amber-100",
    green: "text-emerald-700 bg-emerald-50 border-emerald-100",
  };

  const badgeColors = {
    red: "bg-red-500",
    yellow: "bg-amber-500",
    green: "bg-emerald-500",
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100 flex flex-col h-full">
      <div className={`flex items-center justify-between mb-5 p-3 rounded-xl border ${colors[color]}`}>
        <h3 className="font-bold text-sm uppercase tracking-wider">{title} Priority</h3>
        <span className={`px-2 py-0.5 text-[10px] font-black text-white rounded-full ${badgeColors[color]}`}>
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 opacity-40">
           <FiCheckCircle size={24} className="mb-2" />
           <p className="text-gray-400 text-xs font-medium italic">No tasks assigned</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div
              key={task.id}
              className="group flex flex-col border border-purple-50 p-3 rounded-xl hover:bg-purple-50/50 hover:border-purple-200 transition-all cursor-default"
            >
              <span className="text-sm font-semibold text-purple-900 group-hover:text-purple-700">{task.title}</span>
              <div className="flex justify-between items-center mt-3">
                 <span className="text-[10px] text-purple-300 font-bold uppercase">Task ID: #{task.id.toString().slice(-4)}</span>
                 <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-md border ${colors[color]}`}>
                   {task.priority}
                 </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};