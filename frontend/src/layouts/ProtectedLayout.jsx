import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'
import MainLayout from './MainLayout'

export default function ProtectedLayout() {
  const token = useSelector((state) => state.auth.token)

  if (!token) {
    return <Navigate to="/" />
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}