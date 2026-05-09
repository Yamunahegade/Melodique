import { useEffect, useState } from 'react'
import api from '../services/api'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [singers, setSingers] = useState([])
  const [report, setReport] = useState(null)
  const [userForm, setUserForm] = useState({ name: '', username: '', email: '', password: '', subscription_status: 'free' })
  const [singerForm, setSingerForm] = useState({ name: '', username: '', email: '', password: '' })

  const load = async () => {
    const [u, s, r] = await Promise.all([
      api.get('/admin/users'),
      api.get('/admin/singers'),
      api.get('/admin/reports')
    ])
    setUsers(u.data)
    setSingers(s.data)
    setReport(r.data)
  }

  useEffect(() => { load() }, [])

  const createUser = async () => { await api.post('/admin/users', userForm); setUserForm({ name: '', username: '', email: '', password: '', subscription_status: 'free' }); load() }
  const createSinger = async () => { await api.post('/admin/singers', singerForm); setSingerForm({ name: '', username: '', email: '', password: '' }); load() }
  const deleteUser = async (id) => { await api.delete(`/admin/users/${id}`); load() }
  const deleteSinger = async (id) => { await api.delete(`/admin/singers/${id}`); load() }

  return (
    <section>
      {report && (
        <div className="grid four">
          <div className="card"><h3>{report.users}</h3><p>Users</p></div>
          <div className="card"><h3>{report.singers}</h3><p>Singers</p></div>
          <div className="card"><h3>{report.songs}</h3><p>Songs</p></div>
          <div className="card"><h3>₹{report.successful_revenue}</h3><p>Revenue</p></div>
        </div>
      )}
      <div className="dashboard-grid">
        <div className="card form-card">
          <h2>Create User</h2>
          <input placeholder="Name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
          <input placeholder="Username" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} />
          <input placeholder="Email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
          <input placeholder="Password" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
          <select value={userForm.subscription_status} onChange={(e) => setUserForm({ ...userForm, subscription_status: e.target.value })}>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
          <button onClick={createUser}>Add user</button>
        </div>
        <div className="card form-card">
          <h2>Create Singer</h2>
          <input placeholder="Name" value={singerForm.name} onChange={(e) => setSingerForm({ ...singerForm, name: e.target.value })} />
          <input placeholder="Username" value={singerForm.username} onChange={(e) => setSingerForm({ ...singerForm, username: e.target.value })} />
          <input placeholder="Email" value={singerForm.email} onChange={(e) => setSingerForm({ ...singerForm, email: e.target.value })} />
          <input placeholder="Password" type="password" value={singerForm.password} onChange={(e) => setSingerForm({ ...singerForm, password: e.target.value })} />
          <button onClick={createSinger}>Add singer</button>
        </div>
      </div>
      <div className="dashboard-grid">
        <div className="card">
          <h2>Users</h2>
          {users.map(user => <div className="list-row" key={user.id}><span>{user.username} ({user.subscription_status})</span><button className="danger" onClick={() => deleteUser(user.id)}>Delete</button></div>)}
        </div>
        <div className="card">
          <h2>Singers</h2>
          {singers.map(singer => <div className="list-row" key={singer.id}><span>{singer.username}</span><button className="danger" onClick={() => deleteSinger(singer.id)}>Delete</button></div>)}
        </div>
      </div>
    </section>
  )
}