import { useState } from "react";

export default function SubtaskModal({ open, onClose, onSave }) {
  const [title, setTitle] = useState("");

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, status: "todo" });
    setTitle("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-5 rounded-lg w-80">
        <h3 className="text-lg font-bold mb-3">Add Subtask</h3>

        <form onSubmit={handleSubmit}>
          <input
            className="w-full border p-2 mb-3"
            placeholder="Subtask title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2">
            <button onClick={onClose}>Cancel</button>
            <button className="bg-purple-600 text-white px-3 py-1 rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}