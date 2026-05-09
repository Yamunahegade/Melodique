import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Songs() {
  const [songs, setSongs] = useState([])
  const [filters, setFilters] = useState({ song_name: '', singer: '', genre: '' })
  const [selected, setSelected] = useState(null)

  const fetchSongs = async () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    const { data } = await api.get('/songs', { params })
    setSongs(data)
  }

  useEffect(() => { fetchSongs() }, [])

  return (
    <section>
      <div className="toolbar">
        <input placeholder="Search by song" value={filters.song_name} onChange={(e) => setFilters({ ...filters, song_name: e.target.value })} />
        <input placeholder="Search by singer" value={filters.singer} onChange={(e) => setFilters({ ...filters, singer: e.target.value })} />
        <input placeholder="Search by genre" value={filters.genre} onChange={(e) => setFilters({ ...filters, genre: e.target.value })} />
        <button onClick={fetchSongs}>Search</button>
      </div>
      <div className="grid">
        {songs.map(song => (
          <div className="card" key={song.id}>
            <h3>{song.song_name}</h3>
            <p>{song.singer_name} • {song.genre}</p>
            <p>Songwriter: {song.songwriter}</p>
            <p>Release: {song.release_date}</p>
            <audio controls src={song.file_path} className="audio" />
            <button onClick={() => setSelected(song)}>View details</button>
          </div>
        ))}
      </div>
      {selected && (
        <div className="card details">
          <h3>{selected.song_name}</h3>
          <p>Singer: {selected.singer_name}</p>
          <p>Genre: {selected.genre}</p>
          <p>Songwriter: {selected.songwriter}</p>
          <p>Release date: {selected.release_date}</p>
        </div>
      )}
    </section>
  )
}