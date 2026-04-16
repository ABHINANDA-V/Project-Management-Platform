import api from "./api";

export const getTags = async () => {
  const res = await api.get("tags/");
  return res.data;
};