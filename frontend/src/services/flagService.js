import api from "./api";

export const getFlags = async () => {
  const res = await api.get("flags/");
  return res.data;
};