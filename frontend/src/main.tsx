import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import { Entry } from './pages/Entry'
import { LoginCliente } from './pages/LoginCliente'
import { LoginAtendente } from './pages/LoginAtendente'
import { CadastroCliente } from './pages/CadastroCliente'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import './index.css'

function DismissKeyboardOnOrientationChange() {
  useEffect(() => {
    const dismissKeyboard = () => {
      const activeElement = document.activeElement
      if (
        activeElement instanceof HTMLElement &&
        activeElement.matches('input, textarea, select, [contenteditable="true"]')
      ) {
        activeElement.blur()
      }
    }

    window.addEventListener('orientationchange', dismissKeyboard)
    return () => window.removeEventListener('orientationchange', dismissKeyboard)
  }, [])

  return null
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <DismissKeyboardOnOrientationChange />
      <AuthProvider>
        <Routes>
          <Route path="/entrar" element={<Entry />} />
          <Route path="/login/cliente" element={<LoginCliente />} />
          <Route path="/login/atendente" element={<LoginAtendente />} />
          <Route path="/cadastro/cliente" element={<CadastroCliente />} />

          {/* Dashboard hoje é o mesmo para os dois perfis (tickets mockados);
              quando os dados vierem do backend, dá pra dividir em duas rotas
              com ProtectedRoute allowedRoles={['client']} / ['agent']. */}
          <Route element={<ProtectedRoute allowedRoles={['client', 'agent']} redirectTo="/entrar" />}>
            <Route path="/" element={<App />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
