import { useState } from 'react'
import api from '../services/api'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

  const requestToken = async () => {
    const { data } = await api.post('/auth/request-password-reset', { email })
    setMessage(`Use this demo reset token: ${data.reset_token || 'Check response'}`)
  }

  const reset = async () => {
    try {
      const { data } = await api.post('/auth/reset-password', { email, reset_token: token, new_password: newPassword })
      setMessage(data.message)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Reset failed')
    }
  }

  return (
    <div className="form-wrap">
      <div className="card form-card">
        <h2>Password reset</h2>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={requestToken}>Request token</button>
        <input placeholder="Reset token" value={token} onChange={(e) => setToken(e.target.value)} />
        <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button onClick={reset}>Reset password</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  )
}