import axios from 'axios'
import { Filme, Sala, Sessao, Ingresso } from '../schemas'

const API = axios.create({
  baseURL: 'http://localhost:3000'
})

// Filmes
export const getFilmes = () => API.get<Filme[]>('/filmes')
export const criarFilme = (filme: Filme) => API.post('/filmes', filme)
export const deletarFilme = (id: number) => API.delete(`/filmes/${id}`)

// Salas
export const getSalas = () => API.get<Sala[]>('/salas')
export const criarSala = (sala: Sala) => API.post('/salas', sala)

// Sessões
export const getSessoes = () => API.get<Sessao[]>('/sessoes')
export const criarSessao = (sessao: Sessao) => API.post('/sessoes', sessao)

// Ingressos
export const getIngressos = () => API.get<Ingresso[]>('/ingressos')
export const criarIngresso = (ingresso: Ingresso) => API.post('/ingressos', ingresso)

export default API
