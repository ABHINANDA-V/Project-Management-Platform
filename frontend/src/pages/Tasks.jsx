import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiCheckSquare,
  FiFilter,
} from "react-icons/fi";
import {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
} from "../services/taskService";
import { getProjects } from "../services/projectService";
import { getUsers } from "../services/userService";
import ActivityLog from "./ActivityLog";
import AssignmentHistory from "../components/AssignmentHistory";
import { getTags } from "../services/tagService";
import { getFlags } from "../services/flagService";
import { toast } from "react-toastify";
import TaskDetailModal from "../components/TaskDetailModal";

export default function Tasks() {
  const queryClient = useQueryClient();

  const [editTask, setEditTask] = useState(null);
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [project, setProject] = useState("");
  const [assignedUser, setAssignedUser] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");

  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedFlags, setSelectedFlags] = useState([]);

  const [filterTag, setFilterTag] = useState("");
  const [filterFlag, setFilterFlag] = useState("");

  const [viewTask, setViewTask] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });

  const { data: flags = [] } = useQuery({
    queryKey: ["flags"],
    queryFn: getFlags,
  });

  // FETCH DATA
  const { data: tasks = [] } = useQuery({
    queryKey: [
      "tasks",
      "all",
      search,
      filterProject,
      filterUser,
      filterPriority,
      fromDate,
      toDate,
      filterTag,
      filterFlag,
    ],
    queryFn: getTasks,
  });

  // PAGINATION
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;

  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);

  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  // CREATE
  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      resetForm();
      toast.success("Task added successfully");
    },
    onError: () => {
      toast.error("Failed to add task");
    },
  });

  // delete
  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
    },
  });

  // update
  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      resetForm();
      toast.success("Task updated successfully");
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });

  const resetForm = () => {
    setOpen(false);
    setEditTask(null);
    setTitle("");
    setDescription("");
    setStatus("todo");
    setPriority("medium");
    setProject("");
    setAssignedUser("");
    setDueDate("");
  };

  const handleSave = (e) => {
    e.preventDefault();
    const data = {
      title,
      description,
      status,
      priority,
      project: Number(project),
      assigned_user: Number(assignedUser),
      due_date: dueDate,
      tag_ids: selectedTags,
      flag_ids: selectedFlags,
    };

    if (editTask) {
      updateMutation.mutate({ id: editTask.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="p-8 bg-purple-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-purple-900 flex items-center gap-2">
            <FiCheckSquare className="text-purple-600" /> Tasks
          </h2>
          <p className="text-purple-600 text-sm mt-1">
            Monitor and assign work across your team.
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg shadow-md transition-all font-medium text-sm"
        >
          <FiPlus /> Add New Task
        </button>
      </div>

      {/* FILTERS SECTION */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100 mb-8 transition-all">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5">
          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <FiSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400"
              size={18}
            />
            <input
              placeholder="Search tasks..."
              className="w-full pl-11 pr-4 py-2.5 bg-purple-50/50 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white outline-none transition-all text-sm placeholder:text-purple-300 text-purple-900"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full">
            <div className="flex items-center gap-2 text-purple-600 font-medium mr-1">
              <FiFilter size={18} />
              <span className="text-xs uppercase tracking-wider">Filters</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-3 w-full lg:w-auto">
              <select
                className="bg-white border border-purple-100 text-purple-900 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer hover:border-purple-300 transition-colors"
                value={filterProject}
                onChange={(e) => {
                  setFilterProject(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                value={filterTag}
                onChange={(e) => {
                  setFilterTag(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-purple-100 text-purple-900 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer hover:border-purple-300 transition-colors"
              >
                <option value="">All Tags</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              {/* Flag Select */}
              <select
                value={filterFlag}
                onChange={(e) => {
                  setFilterFlag(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-purple-100 text-purple-900 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer hover:border-purple-300 transition-colors"
              >
                <option value="">All Flags</option>
                {flags.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>

              {/* User Select */}
              <select
                className="bg-white border border-purple-100 text-purple-900 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer hover:border-purple-300 transition-colors"
                value={filterUser}
                onChange={(e) => {
                  setFilterUser(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username}
                  </option>
                ))}
              </select>

              {/* Priority Select */}
              <select
                className="bg-white border border-purple-100 text-purple-900 text-sm rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer hover:border-purple-300 transition-colors"
                value={filterPriority}
                onChange={(e) => {
                  setFilterPriority(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Date Inputs */}
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-purple-100 text-purple-700 text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              />

              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-purple-100 text-purple-700 text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* table */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-purple-700 uppercase bg-purple-50 border-b border-purple-100">
              <tr>
                <th className="px-6 py-4 font-bold">Task Title</th>
                <th className="px-6 py-4 font-bold">Description</th>
                <th className="px-6 py-4 font-bold">Project</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Priority</th>
                <th className="px-6 py-4 font-bold text-center">Assigned</th>
                <th className="px-6 py-4 font-bold">Due Date</th>
                <th className="px-6 py-4 font-bold">Tags</th>
                <th className="px-6 py-4 font-bold">Flags</th>
                <th className="px-6 py-4 font-bold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-purple-50">
              {currentTasks.map((t) => (
                <tr
                  key={t.id}
                  className="bg-white hover:bg-purple-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-purple-900">
                    {t.title}
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                    {t.description || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{t.project_name}</td>

                  <td className="px-6 py-4">
                    {t.status === "todo" && (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600 uppercase">
                        Todo
                      </span>
                    )}
                    {t.status === "in_progress" && (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-600 uppercase">
                        In Progress
                      </span>
                    )}
                    {t.status === "done" && (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-600 uppercase">
                        Done
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {t.priority === "high" && (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-600 uppercase">
                        High
                      </span>
                    )}
                    {t.priority === "medium" && (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700 uppercase">
                        Medium
                      </span>
                    )}
                    {t.priority === "low" && (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-600 uppercase">
                        Low
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Avatar */}
                      <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold border border-purple-200">
                        {t.assigned_user_username
                          ? t.assigned_user_username
                              .substring(0, 2)
                              .toUpperCase()
                          : "NA"}
                      </span>

                      {/* Username */}
                      <span className="text-sm text-gray-700">
                        {t.assigned_user_username || "Unassigned"}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-gray-500 font-medium">
                      {t.due_date || "N/A"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {t.tags?.map((tag) => (
                      <span
                        key={tag.id}
                        className="bg-blue-100 text-blue-600 px-2 py-1 mr-1 rounded text-xs"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </td>

                  <td className="px-6 py-4">
                    {t.flags?.map((flag) => (
                      <span
                        key={flag.id}
                        className="bg-red-100 text-red-600 px-2 py-1 mr-1 rounded text-xs"
                      >
                        {flag.name}
                      </span>
                    ))}
                  </td>

                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => setViewTask(t)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                    >
                      View
                    </button>

                    <button
                      onClick={() => {
                        setEditTask(t);
                        setTitle(t.title);
                        setDescription(t.description);
                        setStatus(t.status);
                        setPriority(t.priority);
                        setProject(t.project);
                        setAssignedUser(t.assigned_user);
                        setDueDate(t.due_date);
                        setOpen(true);
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Delete this task?"))
                          deleteMutation.mutate(t.id);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {viewTask && (
            <TaskDetailModal
              task={viewTask}
              onClose={() => setViewTask(null)}
            />
          )}

          <div className="flex justify-between items-center p-4 border-t border-purple-100 bg-white">
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages || 1}
            </span>

            <div className="flex gap-2 flex-wrap">
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
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 rounded bg-purple-100 text-purple-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* modal  */}
      {open && (
        <div className="fixed inset-0 flex items-start sm:items-center justify-center bg-purple-900/40 backdrop-blur-sm z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-purple-900 mb-6">
              {editTask ? "Edit Task" : "Create New Task"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-purple-700 mb-1">
                  Project
                </label>
                <select
                  className="w-full border border-purple-200 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-700 mb-1">
                  Task Title
                </label>
                <input
                  className="w-full border border-purple-200 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border border-purple-200 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  placeholder="Enter task description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-purple-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full border border-purple-200 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-purple-700 mb-1">
                    Priority
                  </label>
                  <select
                    className="w-full border border-purple-200 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-purple-700 mb-1">
                    Tags
                  </label>
                  <select
                    multiple
                    value={selectedTags}
                    onChange={(e) =>
                      setSelectedTags(
                        [...e.target.selectedOptions].map((o) =>
                          Number(o.value),
                        ),
                      )
                    }
                    className="w-full border p-2 rounded"
                  >
                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-700 mb-1">
                    Flags
                  </label>
                  <select
                    multiple
                    value={selectedFlags}
                    onChange={(e) =>
                      setSelectedFlags(
                        [...e.target.selectedOptions].map((o) =>
                          Number(o.value),
                        ),
                      )
                    }
                    className="w-full border p-2 rounded"
                  >
                    {flags.map((flag) => (
                      <option key={flag.id} value={flag.id}>
                        {flag.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-700 mb-1">
                  Assignee
                </label>
                <select
                  className="w-full border border-purple-200 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  value={assignedUser}
                  onChange={(e) => setAssignedUser(e.target.value)}
                  required
                >
                  <option value="">Assign User</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full border border-purple-200 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 text-sm font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 rounded-lg shadow-lg transition-all"
                >
                  Save Task
                </button>
              </div>
            </form>
            {editTask && (
              <>
                <AssignmentHistory taskId={editTask.id} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
