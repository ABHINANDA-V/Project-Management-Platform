import api from './api'

// get task
export const getTasks = async ({ queryKey }) => {
  const [_key,mode, search, project, user, priority, fromDate, toDate,tag,flag] = queryKey

  let url = "tasks/?"

  if (mode === "all") url += "all=true&"

  if (search) url += `search=${search}&`
  if (project) url += `project=${project}&`
  if (user) url += `assigned_user=${user}&`
  if (priority) url += `priority=${priority}&`
  if (fromDate) url += `due_date_from=${fromDate}&`
  if (toDate) url += `due_date_to=${toDate}&`
  if (tag) url += `tag=${tag}&`
  if (flag) url += `flag=${flag}&`

  const res = await api.get(url)
  return res.data
}

export const createTask = async (data) => {
  const formData = new FormData()

  for (let key in data) {
    formData.append(key, data[key])
  }

  const res = await api.post('tasks/', formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return res.data
}

// Update
export const updateTask = async ({ id, data }) => {
  let formData;

  if (data instanceof FormData) {
    formData = data;
  } else {
    
    formData = new FormData();
    for (let key in data) {
      formData.append(key, data[key]);
    }
  }

  const res = await api.patch(`tasks/${id}/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
export const deleteTask = async (id) => {
  await api.delete(`tasks/${id}/`)
}