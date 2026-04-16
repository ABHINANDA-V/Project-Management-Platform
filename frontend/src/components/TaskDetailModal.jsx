import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
} from "../services/subtaskService";
import SubtaskModal from "./SubtaskModal";

export default function TaskDetailModal({ task, onClose }) {
  const queryClient = useQueryClient();
  const [openSubModal, setOpenSubModal] = useState(false);

  const { data: subtasks = [] } = useQuery({
    queryKey: ["subtasks", task.id],
    queryFn: () => getSubtasks(task.id),
  });

  const createMutation = useMutation({
    mutationFn: createSubtask,
    onSuccess: () => {
      queryClient.invalidateQueries(["subtasks", task.id]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSubtask,
    onSuccess: () => {
      queryClient.invalidateQueries(["subtasks", task.id]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubtask,
    onSuccess: () => {
      queryClient.invalidateQueries(["subtasks", task.id]);
    },
  });

  const handleAdd = (data) => {
    createMutation.mutate({ ...data, task: task.id });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-3">{task.title}</h2>

        <p className="text-sm text-gray-600 mb-4">{task.description}</p>

        <h3 className="font-semibold mb-2">Subtasks</h3>

        {subtasks.map((s) => (
          <div key={s.id} className="flex justify-between mb-2">
            <span
              className={`cursor-pointer ${
                s.status === "done" ? "line-through text-gray-400" : ""
              }`}
              onClick={() =>
                updateMutation.mutate({
                  id: s.id,
                  data: {
                    status: s.status === "done" ? "todo" : "done",
                  },
                })
              }
            >
              {s.title}
            </span>

            <button onClick={() => deleteMutation.mutate(s.id)}>❌</button>
          </div>
        ))}

        <button
          onClick={() => setOpenSubModal(true)}
          className="mt-3 bg-purple-600 text-white px-3 py-1 rounded"
        >
          + Add Subtask
        </button>

        <div className="flex justify-end mt-4">
          <button onClick={onClose}>Close</button>
        </div>

        <SubtaskModal
          open={openSubModal}
          onClose={() => setOpenSubModal(false)}
          onSave={handleAdd}
        />
      </div>
    </div>
  );
}