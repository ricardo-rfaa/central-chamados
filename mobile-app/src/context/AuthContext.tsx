import React, { createContext, useContext, useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import type { User, LoginResponse } from '../types/auth'
import { loginClient, loginAgent, registerClient, registerAgent } from '../services/authService'

interface AuthContextData {
  user: User | null
  token: string | null
  isLoading: boolean
  signInAsClient: (email: string, password: string) => Promise<void>
  signInAsAgent: (email: string, password: string) => Promise<void>
  signUpAsClient: (name: string, email: string, password: string, department: string) => Promise<void>
  signUpAgent: (name: string, email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextData | undefined>(undefined)

// Mesma ideia da versão web: uma chave só, guardando { token, user }.
// SecureStore é o equivalente RN ao localStorage — mas é assíncrono
// (não existe leitura síncrona de armazenamento seguro em RN) e criptografa
// o valor no Keychain (iOS) / Keystore (Android), então é mais seguro
// para guardar o token do que AsyncStorage puro.
const STORAGE_KEY = 'chamados_session'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    restoreSession()
  }, [])

  async function restoreSession() {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY)
      if (raw) {
        const parsed: LoginResponse = JSON.parse(raw)
        setUser(parsed.user)
        setToken(parsed.token)
      }
    } catch {
      await SecureStore.deleteItemAsync(STORAGE_KEY)
    } finally {
      setIsLoading(false)
    }
  }

  async function persist(session: LoginResponse) {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(session))
    setUser(session.user)
    setToken(session.token)
  }

  async function signInAsClient(email: string, password: string) {
    const session = await loginClient(email, password)
    await persist(session)
  }

  async function signInAsAgent(email: string, password: string) {
    const session = await loginAgent(email, password)
    await persist(session)
  }

  async function signUpAsClient(name: string, email: string, password: string, department: string) {
    const session = await registerClient(name, email, password, department)
    await persist(session)
  }

  // Cadastra um novo atendente usando o token do atendente atualmente
  // logado. Não troca a sessão local — quem está logado continua logado
  // como está; só a nova conta é criada no backend.
  async function signUpAgent(name: string, email: string, password: string) {
    if (!token) throw new Error('É preciso estar logado como atendente para cadastrar outro atendente.')
    await registerAgent(token, name, email, password)
  }

  async function signOut() {
    await SecureStore.deleteItemAsync(STORAGE_KEY)
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signInAsClient, signInAsAgent, signUpAsClient, signUpAgent, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
