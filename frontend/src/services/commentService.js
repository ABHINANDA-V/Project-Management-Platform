import api from "./api";

// Get comments
export const getComments = async (taskId) => {
  const res = await api.get(`comments/?task=${taskId}`);
  return res.data;
};


export const createComment = async (data) => {
  const res = await api.post("comments/", data);
  return res.data;
};

export const updateComment = async ({ id, data }) => {
  const res = await api.put(`comments/${id}/`, data);
  return res.data;
};

export const deleteComment = async (id) => {
  await api.delete(`comments/${id}/`);
};