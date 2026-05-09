import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = sessionStorage.getItem('token')
    const user = sessionStorage.getItem('user')
    return token && user ? { token, user: JSON.parse(user) } : { token: null, user: null }
  })

  const login = (token, user) => {
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('user', JSON.stringify(user))
    setAuth({ token, user })
  }

  const logout = () => {
    sessionStorage.clear()
    setAuth({ token: null, user: null })
  }

  const value = useMemo(() => ({ ...auth, login, logout }), [auth])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)