import api from "./api";

export const getActivityLogs = async (filters = {}) => {
  let url = "activity-logs/";

  const params = new URLSearchParams();

if (filters.taskId) params.append("task", filters.taskId);  
if (filters.search) params.append("search", filters.search);
if (filters.date) params.append("date", filters.date);
if (filters.page) params.append("page", filters.page);

  const queryString = params.toString();

  if (queryString) {
    url += `?${queryString}`;
  }

  const res = await api.get(url);
  return res.data;
};