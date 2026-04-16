

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import MainLayout from './layouts/MainLayout'
import ProtectedLayout from './layouts/ProtectedLayout'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import MyTasks from './pages/MyTasks'
import ManageUsers from './pages/ManageUsers'
import MyProjects from './pages/MyProjects'
import Status from './pages/Status'
import AdminReview from './pages/AdminReview'
import ActivityLog from './pages/ActivityLog'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {

  return (
  <BrowserRouter>
  <Routes>
     {/* PUBLIC ROUTES */}
    <Route path='/' element={<Login/>} />
    <Route path='/register' element={<Register/>} />

    {/* PROTECTED ROUTES */}
    <Route element={<ProtectedLayout/>}>
      <Route path='/user-dashboard' element={<UserDashboard/>}/>
      <Route path='/admin-dashboard' element={<AdminDashboard/>} />
      <Route path='/projects' element={<Projects/>} />
      <Route path='/tasks'  element={<Tasks/>}/>
      <Route path='/manageUsers' element={<ManageUsers/>} />
      <Route path='/admin-review' element={<AdminReview/>} />
      <Route path='/my-tasks' element={<MyTasks/>} />
      <Route path='/my-projects' element={<MyProjects/>} />
      <Route path='/status' element={<Status/>} />
      <Route path='/activity-log' element={<ActivityLog/>} />
      

    </Route>
  </Routes>
  </BrowserRouter>
     
  )
}

export default App
