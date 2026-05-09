import { useEffect, useState } from 'react'
import api from '../services/api'

const initialForm = { song_name: '', singer_name: '', genre: '', songwriter: '', release_date: '', file_path: '' }

export default function SingerDashboard() {
  const [songs, setSongs] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')

  const fetchSongs = async () => {
    const { data } = await api.get('/my-songs')
    setSongs(data)
  }

  useEffect(() => { fetchSongs() }, [])

  const submit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) await api.put(`/songs/${editingId}`, form)
      else await api.post('/songs', form)
      setForm(initialForm)
      setEditingId(null)
      setMessage('Saved successfully')
      fetchSongs()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Operation failed')
    }
  }

  const editSong = (song) => {
    setEditingId(song.id)
    setForm(song)
  }

  const deleteSong = async (id) => {
    await api.delete(`/songs/${id}`)
    fetchSongs()
  }

  return (
    <section className="dashboard-grid">
      <form className="card form-card" onSubmit={submit}>
        <h2>{editingId ? 'Edit Song' : 'Upload Song'}</h2>
        {Object.keys(initialForm).map((field) => (
          <input key={field} type={field === 'release_date' ? 'date' : 'text'} placeholder={field.replace('_', ' ')} value={form[field] || ''} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
        ))}
        <button type="submit">{editingId ? 'Update' : 'Upload'}</button>
        {message && <p>{message}</p>}
      </form>
      <div className="grid">
        {songs.map(song => (
          <div className="card" key={song.id}>
            <h3>{song.song_name}</h3>
            <p>{song.genre} • {song.release_date}</p>
            <button onClick={() => editSong(song)}>Edit</button>
            <button className="danger" onClick={() => deleteSong(song.id)}>Delete</button>
          </div>
        ))}
      </div>
    </section>
  )
}