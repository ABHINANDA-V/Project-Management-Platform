import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, updateTask } from "../services/taskService";
import { getProjects } from "../services/projectService";
import {
  getComments,
  createComment,
  deleteComment,
  updateComment,
} from "../services/commentService";
import {
  getSubtasks,
  createSubtask,
  updateSubtask,
} from "../services/subtaskService";
import {
  FiCalendar,
  FiMessageSquare,
  FiX,
  FiFilter,
  FiInfo,
  FiCheckCircle,
  FiAlertCircle,
  FiPaperclip,
} from "react-icons/fi";

export default function MyTasks() {
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const role = localStorage.getItem("role");

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", role === "admin" ? "all" : "user"],
    queryFn: getTasks,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const projectList = projects?.results || projects;

  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      setSelectedTask(null);
    },
  });

  const filteredTasks = selectedProject
    ? tasks.filter((t) => t.project == selectedProject)
    : tasks;

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const indexOfLast = currentPage * tasksPerPage;
  const indexOfFirst = indexOfLast - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirst, indexOfLast);

  const getTasksByStatus = (status) => {
    return currentTasks.filter((t) => t.status === status);
  };
  return (
    <div className="p-4 md:p-8 bg-[#FDFCFE] min-h-screen font-sans">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-purple-900 tracking-tight">
            My Workspace
          </h2>
          <p className="text-purple-500 font-medium">
            Manage and track your active contributions
          </p>
        </div>

        <div className="relative w-full md:w-80 shadow-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiFilter className="text-purple-400" />
          </div>
          <select
            className="bg-white border border-purple-100 text-purple-900 text-sm rounded-xl block w-full pl-10 p-3.5 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer"
            value={selectedProject}
            onChange={(e) => {
              setSelectedProject(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Projects</option>

            {projectList.length === 0 && (
              <option disabled>No projects assigned</option>
            )}
            {projectList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Column
          title="To Do"
          tasks={getTasksByStatus("todo")}
          onClick={setSelectedTask}
          accent="bg-slate-300"
          updateMutation={updateMutation}
        />
        <Column
          title="In Progress"
          tasks={getTasksByStatus("in_progress")}
          onClick={setSelectedTask}
          accent="bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.3)]"
          updateMutation={updateMutation}
        />
        <Column
          title="Done"
          tasks={getTasksByStatus("done")}
          onClick={setSelectedTask}
          accent="bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
          updateMutation={updateMutation}
        />
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-sm font-semibold">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={(data) =>
            updateMutation.mutate({ id: selectedTask.id, data })
          }
        />
      )}
    </div>
  );
}

const Column = ({ title, tasks, onClick, accent, updateMutation }) => {
  return (
    <div className="bg-[#F8F7FB] p-5 rounded-3xl border border-purple-50/50 min-h-[70vh]">
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${accent}`}></div>
          <h3 className="font-bold text-purple-900 text-lg">{title}</h3>
        </div>
        <span className="bg-purple-100 text-purple-600 text-[11px] font-bold px-2.5 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-4">
        {tasks.map((t) => {
          const isOverdue =
            new Date(t.due_date) < new Date() && t.status !== "done";

          return (
            <div
              key={t.id}
              onClick={() => onClick(t)}
              className="group bg-white p-5 rounded-2xl shadow-sm border border-transparent hover:border-purple-200 hover:shadow-md transition-all cursor-pointer active:scale-95"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  {t.review_status && t.review_status !== "pending" ? (
                    <span
                      className={`text-[9px] font-extrabold px-2 py-1 rounded shadow-sm inline-flex items-center gap-1 uppercase tracking-tighter border ${
                        t.review_status === "approved"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : t.review_status === "rejected"
                            ? "bg-rose-50 text-rose-600 border-rose-100"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}
                    >
                      {t.review_status}
                    </span>
                  ) : (
                    <div className="h-5"></div>
                  )}
                </div>

                <span
                  className={`text-[9px] font-extrabold px-2 py-1 rounded shadow-sm uppercase tracking-tighter border ${
                    (t.priority || "").toLowerCase() === "high"
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-blue-50 text-blue-600 border-blue-100"
                  }`}
                >
                  {t.priority}
                </span>
              </div>

              <div className="mb-2">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wide">
                  {t.project_name || "General Project"}
                </span>
              </div>

              <h4 className="font-bold text-gray-800 group-hover:text-purple-700 transition-colors mb-1 truncate">
                {t.title}
              </h4>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {t.tags?.map((tag) => (
                  <span
                    key={`tag-${tag.id}`}
                    className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-md font-semibold border border-blue-100"
                  >
                    {tag.name}
                  </span>
                ))}

                {t.flags?.map((flag) => (
                  <span
                    key={`flag-${flag.id}`}
                    className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded-md font-semibold border border-red-100"
                  >
                    {flag.name}
                  </span>
                ))}
              </div>

              <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed h-8">
                {t.description}
              </p>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-[10px] font-bold text-purple-600">
                    {t.assigned_by_username?.charAt(0) || "A"}
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {t.assigned_by_username || "Admin"}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1 text-[11px] font-bold ${
                    isOverdue ? "text-rose-500" : "text-gray-400"
                  }`}
                >
                  <FiCalendar size={12} />
                  {new Date(t.due_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>

              <div className="mt-4">
                <select
                  className="w-full text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-2 focus:ring-2 focus:ring-purple-400 outline-none cursor-pointer hover:bg-white transition-all appearance-none text-center"
                  value={t.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const formData = new FormData();
                    formData.append("title", t.title);
                    formData.append("description", t.description);
                    formData.append("project", t.project);
                    formData.append("assigned_user", t.assigned_user);
                    formData.append("due_date", t.due_date);
                    formData.append("status", e.target.value);
                    updateMutation.mutate({ id: t.id, data: formData });
                  }}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TaskModal = ({ task, onClose, onSave }) => {
  const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;
  const [story, setStory] = useState(task.story || "");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", task.id],
    queryFn: () => getComments(task.id),
  });

  const { data: subtasks = [] } = useQuery({
    queryKey: ["subtasks", task.id],
    queryFn: () => getSubtasks(task.id),
  });

  const createMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", task.id]);
      setCommentText("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", task.id]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateComment,
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", task.id]);
    },
  });

  const subtaskCreateMutation = useMutation({
    mutationFn: createSubtask,
    onSuccess: () => {
      queryClient.invalidateQueries(["subtasks", task.id]);
      queryClient.invalidateQueries(["tasks"]);
      setSubtaskTitle("");
    },
  });

  const subtaskUpdateMutation = useMutation({
    mutationFn: updateSubtask,
    onSuccess: () => {
      queryClient.invalidateQueries(["subtasks", task.id]);
      queryClient.invalidateQueries(["tasks"]);
    },
  });

  const total = subtasks.length;
  const completed = subtasks.filter((s) => s.status === "done").length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const handleDelete = (id) => {
    if (confirm("Delete this comment?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (comment) => {
    const newText = prompt("Edit comment:", comment.content);
    if (newText) {
      updateMutation.mutate({
        id: comment.id,
        data: { content: newText, task: comment.task },
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    console.log("FORM SUBMIT TRIGGERED");
    e.preventDefault();

    console.log("Submitting form...");
    console.log(image);

    const formData = new FormData();
    formData.append("title", task.title);
    formData.append("description", task.description);
    formData.append("project", task.project);
    formData.append("assigned_user", task.assigned_user);
    formData.append("due_date", task.due_date);
    formData.append("story", story);
    formData.append("status", task.status);
    if (image) formData.append("output", image);

    onSave(formData);
    if (commentText.trim()) {
      createMutation.mutate({ task: task.id, content: commentText });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* modal header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
            <p className="text-sm text-purple-500 font-medium">
              {task.project_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-purple-50 rounded-full transition-colors"
          >
            <FiX className="text-xl text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {task.status === "revision_needed" && (
            <div
              className="flex p-4 text-amber-800 border border-amber-200 rounded-2xl bg-amber-50"
              role="alert"
            >
              <FiAlertCircle className="flex-shrink-0 w-5 h-5 me-3" />
              <div>
                <span className="font-bold">Revision Requested:</span>
                <p className="text-sm mt-1">
                  {task.admin_comment ||
                    "Please check the comments below for required changes."}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Priority
              </label>
              <p className="text-sm font-semibold text-gray-700">
                {task.priority || "Medium"}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Deadline
              </label>
              <p className="text-sm font-semibold text-gray-700">
                {new Date(task.due_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">
              Task Requirements
            </label>
            <div className="p-4 bg-purple-50/50 rounded-xl text-sm text-gray-600 leading-relaxed italic border border-purple-100">
              {task.description}
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-bold text-gray-700 mb-2">Subtasks</h4>

            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">
                Progress: {progress}%
              </p>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              {subtasks.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <span
                    onClick={() =>
                      subtaskUpdateMutation.mutate({
                        id: s.id,
                        data: {
                          status: s.status === "done" ? "todo" : "done",
                        },
                      })
                    }
                    className={`cursor-pointer text-sm ${
                      s.status === "done"
                        ? "line-through text-gray-400"
                        : "text-gray-700"
                    }`}
                  >
                    {s.title}
                  </span>

                  <input
                    type="checkbox"
                    checked={s.status === "done"}
                    onChange={() =>
                      subtaskUpdateMutation.mutate({
                        id: s.id,
                        data: {
                          status: s.status === "done" ? "todo" : "done",
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Add subtask..."
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
              />
              <button
                type="button"
                onClick={() => {
                  if (!subtaskTitle.trim()) return;
                  subtaskCreateMutation.mutate({
                    title: subtaskTitle,
                    task: task.id,
                    status: "todo",
                  });
                }}
                className="bg-purple-600 text-white px-3 rounded-lg text-sm"
              >
                Add
              </button>
            </div>
          </div>

          <hr className="border-gray-100" />
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">
              Work Submission Story
            </label>
            <textarea
              className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              rows="4"
              placeholder="Describe the work you've completed..."
              value={story}
              onChange={(e) => setStory(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">
              Proof of Work (Image)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-purple-400 transition-colors">
              <div className="space-y-1 text-center">
                <FiPaperclip className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            </div>
            {imagePreview && (
              <div className="mt-4 relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </div>

          <div className="pt-4">
            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-4">
              <FiMessageSquare className="text-purple-500" /> Discussions
            </h4>

            <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-2xl text-xs ${
                    c.is_admin ? "bg-purple-100 ml-4" : "bg-gray-100 mr-4"
                  }`}
                >
                  <p className="font-bold mb-1">{c.author_name}</p>
                  <p className="text-gray-600">{c.content}</p>
                  {Number(c.author) === Number(currentUserId) && (
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(c)}
                        className="text-blue-500 text-[10px]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="text-red-500 text-[10px]"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="relative">
              <input
                className="w-full bg-gray-50 border border-transparent rounded-full pl-4 pr-12 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a message..."
              />
              <button
                type="button"
                onClick={() =>
                  commentText.trim() &&
                  createMutation.mutate({ task: task.id, content: commentText })
                }
                className="absolute right-2 top-1.5 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
              >
                <FiCheckCircle />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-200 transition-all active:scale-[0.98]"
            onClick={() => console.log("BUTTON CLICKED")}
          >
            Submit Task for Review
          </button>
        </form>
      </div>
    </div>
  );
};
