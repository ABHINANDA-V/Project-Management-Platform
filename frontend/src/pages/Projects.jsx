import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiPlus, FiEdit2, FiTrash2, FiFolder, FiSearch } from "react-icons/fi";
import {
  getProjects,
  createProject,
  deleteProject,
  updateProject,
} from "../services/projectService";

export default function Projects() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [editProject, setEditProject] = useState(null);

  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 5;

  // fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ["projects", search, date],
    queryFn: getProjects,
  });

  // pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;

  const currentProjects = projects.slice(
    indexOfFirstProject,
    indexOfLastProject,
  );

  const totalPages = Math.ceil(projects.length / projectsPerPage);

  // create project
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      setOpen(false);
      setName("");
      setDescription("");
    },
  });

  // delete project
  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
    },
  });

  // Update Project
  const updateMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      setOpen(false);
      setEditProject(null);
    },
  });

  const handleSave = (e) => {
    e.preventDefault();

    const data = {
      name,
      description,
      start_date: startDate,
      assigned_users: [],
    };

    if (editProject) {
      updateMutation.mutate({
        id: editProject.id,
        data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="p-8 bg-purple-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-purple-900 flex items-center gap-2">
            <FiFolder className="text-purple-600" /> Projects
          </h2>
          <p className="text-purple-600 text-sm mt-1">
            Manage and track your organization's projects.
          </p>
        </div>

        <button
          onClick={() => {
            setEditProject(null);
            setName("");
            setDescription("");
            setStartDate("");
            setOpen(true);
          }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg shadow-md transition-all font-medium text-sm"
        >
          <FiPlus /> Add New Project
        </button>
      </div>

      {/* table */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="p-4 bg-white border-b border-purple-100">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full md:w-1/2 lg:w-1/3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-purple-400" size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-purple-200 rounded-xl leading-5 bg-purple-50/30 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all"
                />
              </div>

              <div className="flex w-full md:w-auto gap-2 items-center">
                <div className="relative w-full md:w-auto">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="block w-full px-4 py-2.5 border border-purple-200 rounded-xl leading-5 bg-purple-50/30 text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all"
                  />
                </div>

                <button
                  onClick={() => {
                    setSearch("");
                    setDate("");
                  }}
                  className="px-4 py-2.5 text-sm font-semibold text-purple-600 hover:bg-purple-50 rounded-xl transition-all whitespace-nowrap"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-purple-700 uppercase bg-purple-50 border-b border-purple-100">
              <tr>
                <th className="px-6 py-4 font-bold">Project Name</th>
                <th className="px-6 py-4 font-bold">Description</th>
                <th className="px-6 py-4 font-bold">Start Date</th>
                <th className="px-6 py-4 font-bold">Tasks</th>
                <th className="px-6 py-4 font-bold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-purple-50">
              {projects.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-400 italic"
                  >
                    No projects found. Create one to get started!
                  </td>
                </tr>
              ) : (
                currentProjects.map((p) => (
                  <tr
                    key={p.id}
                    className="bg-white hover:bg-purple-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-purple-900">
                      {p.name}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      {p.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                        {p.start_date || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                        {p.task_count} Tasks
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setEditProject(p);
                          setName(p.name);
                          setDescription(p.description);
                          setStartDate(p.start_date || "");
                          setOpen(true);
                        }}
                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors"
                        title="Edit Project"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this project?",
                            )
                          ) {
                            deleteMutation.mutate(p.id);
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Project"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex justify-between items-center p-4 border-t border-purple-100 bg-white">
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-purple-100 text-purple-700 disabled:opacity-50"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? "bg-purple-600 text-white"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-purple-100 text-purple-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-900/40 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-purple-100 animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-purple-900 mb-6">
              {editProject ? "Update Project" : "Create New Project"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-purple-700 mb-1">
                  Project Name
                </label>
                <input
                  className="w-full border border-purple-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  placeholder="Enter project name..."
                  value={name}
                  required
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border border-purple-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all h-24"
                  placeholder="What is this project about?"
                  value={description}
                  required
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full border border-purple-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-gray-600"
                  value={startDate}
                  required
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-6 py-2.5 text-sm font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 rounded-lg shadow-lg transition-all"
                >
                  {editProject ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
