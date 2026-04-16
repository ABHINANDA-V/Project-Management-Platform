import api from './api'

export const getUsers = async ({ queryKey }) => {
  const [_key, search, role, status] = queryKey;

  let url = "users/?";

  if (search) url += `search=${search}&`;
  if (role) url += `role=${role}&`;
  if (status) url += `is_active=${status === "active"}&`;

  const res = await api.get(url);
  return res.data;
};

// Create User
export const createUser = async (data) => {
  const res = await api.post('auth/register/',data)
  return res.data
}

// Update User
export const updateUser = async ({id,data}) => {
  const res = await api.put(`users/${id}/`,data)
  return res.data
}

// Delete User
export const deleteUser = async (id) => {
  await api.delete(`users/${id}/`)
}