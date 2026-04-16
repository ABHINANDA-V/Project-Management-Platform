import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, updateTask } from "../services/taskService";
import { useState } from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUser,
  FiInfo,
  FiMaximize2,
  FiX,
  FiSearch,
  FiLoader,
} from "react-icons/fi";
import {
  getComments,
  createComment,
  deleteComment,
  updateComment,
} from "../services/commentService";

export default function AdminReview() {
  const [search, setSearch] = useState("");

  const { data: tasks = [], isFetching } = useQuery({
    queryKey: ["tasks", "all", search],
    queryFn: getTasks,
  });
  const [selectedTask, setSelectedTask] = useState(null);

  return (
    <div className="p-4 md:p-8 bg-[#FDFCFE] min-h-screen">
      {/* header */}
      <div className="mb-10">
        <h2 className="text-3xl font-extrabold text-purple-900 tracking-tight">
          Review Center
        </h2>
        <p className="text-purple-500 font-medium">
          Evaluate user submissions and provide quality feedback
        </p>
      </div>

      <div className="flex items-center gap-4 p-4 border border-purple-100 rounded-xl bg-white shadow-[inset_0_2px_4px_rgba(107,33,168,0.05)] mb-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((t) => (
          <div
            key={t.id}
            onClick={() => setSelectedTask(t)}
            className="group relative bg-white border border-purple-100 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-500 bg-purple-50 px-2 py-1 rounded-md">
                  {t.project_name}
                </span>

                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-md shadow-sm ${
                    t.priority === "High"
                      ? "bg-red-50 text-red-600 border border-red-100"
                      : t.priority === "Medium"
                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : "bg-blue-50 text-blue-600 border border-blue-100"
                  }`}
                >
                  {t.priority}
                </span>
              </div>

              <h4 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-purple-700 transition-colors">
                {t.title}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                {t.description}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-50 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-medium text-gray-400">
                <span className="flex items-center gap-1">
                  <FiUser className="text-purple-400" />{" "}
                  {t.assigned_user_username || "User"}
                </span>
                <span className="flex items-center gap-1">
                  <FiClock className="text-purple-400" />{" "}
                  {new Date(t.due_date).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    t.status === "done"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-purple-50 text-purple-600 border-purple-100"
                  }`}
                >
                  {t.status?.replace("_", " ").toUpperCase()}
                </span>
                <FiMaximize2 className="text-gray-300 group-hover:text-purple-400 transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <ReviewModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

const ReviewModal = ({ task, onClose }) => {
  const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;
  const [chatMessage, setChatMessage] = useState("");
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", task.id],
    queryFn: () => getComments(task.id),
  });

  const createMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", task.id]);
      setChatMessage("");
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

  const mutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      onClose();
    },
  });

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
  const handleAction = (status) => {
    mutation.mutate({
      id: task.id,
      data: {
        review_status: status,
        admin_comment: comment,
      },
    });
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-purple-900/40 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Modal header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
          <div>
            <h3 className="font-extrabold text-xl text-gray-900">
              {task.title}
            </h3>
            <p className="text-sm text-purple-500 font-medium">
              Reviewing Submission from {task.assigned_user_username}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-purple-50 rounded-full transition-colors text-gray-400 hover:text-purple-600"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* TASK CONTEXT */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <FiInfo /> Requirements
            </h5>
            <p className="text-sm text-gray-600 leading-relaxed">
              {task.description}
            </p>
          </div>

          {task.story && (
            <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100 ring-1 ring-purple-100/50">
              <h5 className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-3">
                User's Work Narrative
              </h5>
              <p className="text-sm text-purple-900 leading-relaxed italic">
                "{task.story}"
              </p>
            </div>
          )}

          {task.output && (
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Submitted Proof
              </h5>
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100">
                <img
                  src={task.output}
                  alt="Task Submission"
                  className="w-full h-auto max-h-[350px] object-contain hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          )}

          {task.review_status === "rejected" && (
            <div
              className="flex items-center p-4 text-red-800 rounded-2xl bg-red-50 border border-red-100"
              role="alert"
            >
              <FiXCircle className="w-5 h-5 mr-3" />
              <div className="text-sm font-bold tracking-tight">
                Previously Rejected. Requires careful re-evaluation.
              </div>
            </div>
          )}

          {task.review_status === "approved" && (
            <div
              className="flex items-center p-4 text-emerald-800 rounded-2xl bg-emerald-50 border border-emerald-100"
              role="alert"
            >
              <FiCheckCircle className="w-5 h-5 mr-3" />
              <div className="text-sm font-bold tracking-tight">
                Already Approved. Proceed only if editing is required.
              </div>
            </div>
          )}

          {/* chat */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-bold mb-3">Discussion</h4>

            <div className="max-h-48 overflow-y-auto space-y-3 mb-3 pr-2">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-2xl text-xs max-w-[80%] ${
                    c.is_admin
                      ? "bg-purple-100 ml-auto text-right"
                      : "bg-gray-100 mr-auto"
                  }`}
                >
                  <p className="font-bold text-[11px] mb-1">{c.author_name}</p>

                  <p className="text-gray-700">{c.content}</p>

                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(c.created_at).toLocaleString()}
                  </p>

                  {Number(c.author) === Number(currentUserId) && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEdit(c)}
                        className="text-blue-500 text-[10px]"
                      >
                        Edit
                      </button>

                      <button
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

            <div className="flex gap-2">
              <input
                className="flex-1 border border-gray-200 p-2 rounded-xl text-sm"
                placeholder="Write a message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />

              <button
                onClick={() =>
                  chatMessage.trim() &&
                  createMutation.mutate({
                    task: task.id,
                    content: chatMessage,
                  })
                }
                className="bg-purple-600 text-white px-4 rounded-xl"
              >
                Send
              </button>
            </div>
          </div>

          {/* admin feedback */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block mb-3 text-sm font-bold text-gray-700">
              Official Feedback
            </label>
            <textarea
              className="w-full border border-gray-200 p-4 rounded-2xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 transition-all outline-none"
              rows="3"
              placeholder="Provide constructive feedback for the user..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => handleAction("approved")}
              disabled={mutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50"
            >
              <FiCheckCircle /> Approve Work
            </button>

            <button
              onClick={() => handleAction("rejected")}
              disabled={mutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-red-100 transition-all active:scale-95 disabled:opacity-50"
            >
              <FiXCircle /> Reject & Send Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
