import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Register() {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', role: 'user' })
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/auth/register', form)
      setMessage('Registration successful. Redirecting to login...')
      setTimeout(() => navigate('/login'), 1000)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="form-wrap">
      <form className="card form-card" onSubmit={submit}>
        <h2>Register</h2>
        <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="user">User</option>
          <option value="singer">Singer</option>
        </select>
        <button type="submit">Create account</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  )
}