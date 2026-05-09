import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import Songs from './pages/Songs'
import SingerDashboard from './pages/SingerDashboard'
import PlaylistPage from './pages/PlaylistPage'
import Subscribe from './pages/Subscribe'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/singer" element={<ProtectedRoute role="singer"><SingerDashboard /></ProtectedRoute>} />
          <Route path="/playlist" element={<ProtectedRoute role="user"><PlaylistPage /></ProtectedRoute>} />
          <Route path="/subscribe" element={<ProtectedRoute role="user"><Subscribe /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}