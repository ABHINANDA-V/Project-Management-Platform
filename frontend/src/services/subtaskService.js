import api from "./api";

export const getSubtasks = async (taskId) => {
  const res = await api.get(`subtasks/?task=${taskId}`);
  return res.data;
};

export const createSubtask = async (data) => {
  const res = await api.post("subtasks/", data);
  return res.data;
};

export const updateSubtask = async ({ id, data }) => {
  const res = await api.patch(`subtasks/${id}/`, data);
  return res.data;
};

export const deleteSubtask = async (id) => {
  await api.delete(`subtasks/${id}/`);
};