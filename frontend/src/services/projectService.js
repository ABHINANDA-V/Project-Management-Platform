import api from './api'


export const getProjects = async ({ queryKey }) => {
  const [_key, search="", date=""] = queryKey

  let url = 'projects/?'

  if (search) {
    url += `search=${search}&`
  }

  if (date) {
    url += `start_date=${date}&`
  }

  const res = await api.get(url)
  return res.data
}

export const createProject = async (data) => {
  const res = await api.post('projects/', data)
  return res.data
}

export const deleteProject = async (id) => {
  await api.delete(`projects/${id}/`)
}

export const updateProject = async ({ id, data }) => {
  const res = await api.put(`projects/${id}/`, data)
  return res.data
}