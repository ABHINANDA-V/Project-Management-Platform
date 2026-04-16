import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../services/projectService";

const MyProjects = () => {
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  // fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  // filter
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatus = (p) => {
    if (p.task_count === 0) return "Not Started";
    if (p.task_count < 5) return "In Progress";
    return "Active";
  };

  const getStatusColor = (status) => {
    if (status === "Not Started") return "bg-gray-200 text-gray-700";
    if (status === "In Progress") return "bg-blue-100 text-blue-600";
    return "bg-green-100 text-green-600";
  };

  const getProgress = (p) => {
    if (!p.task_count) return 0;
    return Math.min(p.task_count * 20, 100);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Projects</h2>
      <input
        type="text"
        placeholder="Search projects..."
        className="border p-2 rounded w-full sm:w-64 mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {filteredProjects.map((p) => {
          const status = getStatus(p);
          const progress = getProgress(p);

          return (
            <div
              key={p.id}
              onClick={() => setSelectedProject(p)}
              className="cursor-pointer bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold mb-1">{p.name}</h3>
              <span
                className={`text-xs px-2 py-1 rounded ${getStatusColor(status)}`}
              >
                {status}
              </span>

              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {p.description || "No description"}
              </p>

              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1">{progress}% completed</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* modal */}
      {selectedProject && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h3 className="text-xl font-bold mb-3">
              {selectedProject.name}
            </h3>

            <p className="text-gray-600 mb-3">
              {selectedProject.description || "No description"}
            </p>

            <p className="text-sm mb-2">
              <strong>Start Date:</strong>{" "}
              {selectedProject.start_date || "N/A"}
            </p>

            <p className="text-sm mb-2">
              <strong>Total Tasks:</strong>{" "}
              {selectedProject.task_count}
            </p>

            <p className="text-sm mb-4">
              <strong>Team Members:</strong>{" "}
              {selectedProject.assigned_users_count}
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MyProjects;