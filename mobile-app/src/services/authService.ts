import { api } from './api'
import type { LoginResponse } from '../types/auth'

// Endpoints espelham o backend: /client/login e /agent/login.
// A checagem de "role" acontece no servidor (auth.service.js), então
// mesmo que alguém tente logar como agente pela tela de cliente, o
// backend rejeita — aqui só escolhemos qual endpoint chamar.
export function loginClient(email: string, password: string) {
  return api.post<LoginResponse>('/client/login', { email, password })
}

export function loginAgent(email: string, password: string) {
  return api.post<LoginResponse>('/agent/login', { email, password })
}

// Cadastro de cliente é público — não precisa de token.
export function registerClient(name: string, email: string, password: string, department: string) {
  return api.post<LoginResponse>('/client/register', { name, email, password, department })
}

// Cadastro de atendente exige o token de um atendente já logado —
// o backend rejeita sem isso (ver auth.routes.js).
export function registerAgent(token: string, name: string, email: string, password: string) {
  return api.post<LoginResponse>('/agent/register', { name, email, password }, token)
}
