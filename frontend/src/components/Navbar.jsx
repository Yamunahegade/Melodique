import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="nav">
      <div className="brand">Melodique</div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/songs">Songs</Link>
        {user?.role === 'user' && <Link to="/playlist">Playlists</Link>}
        {user?.role === 'user' && <Link to="/subscribe">Subscribe</Link>}
        {user?.role === 'singer' && <Link to="/singer">Singer Panel</Link>}
        {user?.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
        {!user ? <Link to="/login">Login</Link> : <button onClick={handleLogout}>Logout</button>}
      </div>
    </nav>
  )
}