import { useEffect, useState } from 'react'
import api from '../services/api'

export default function PlaylistPage() {
  const [songs, setSongs] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [name, setName] = useState('')
  const [selectedSongs, setSelectedSongs] = useState([])

  const load = async () => {
    const songRes = await api.get('/songs')
    const playlistRes = await api.get('/playlists')
    setSongs(songRes.data)
    setPlaylists(playlistRes.data)
  }

  useEffect(() => { load() }, [])

  const toggleSong = (id) => {
    setSelectedSongs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const createPlaylist = async () => {
    await api.post('/playlists', { name, song_ids: selectedSongs })
    setName('')
    setSelectedSongs([])
    load()
  }

  return (
    <section className="dashboard-grid">
      <div className="card form-card">
        <h2>Create playlist</h2>
        <input placeholder="Playlist name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="checkbox-list">
          {songs.map(song => (
            <label key={song.id}><input type="checkbox" checked={selectedSongs.includes(song.id)} onChange={() => toggleSong(song.id)} /> {song.song_name}</label>
          ))}
        </div>
        <button onClick={createPlaylist}>Save playlist</button>
      </div>
      <div className="grid">
        {playlists.map(pl => (
          <div className="card" key={pl.id}>
            <h3>{pl.name}</h3>
            {pl.songs.map(song => <p key={song.id}>{song.song_name}</p>)}
          </div>
        ))}
      </div>
    </section>
  )
}