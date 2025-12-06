import { useState, useEffect } from 'react'
import { getSessoes, criarSessao, getFilmes, getSalas } from '../services/api'
import { sessaoSchema, Sessao, Filme, Sala } from '../schemas'
import { z } from 'zod'
import { VendaIngressoModal } from '../components/VendaIngressoModal'

export function SessoesPage() {
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [filmes, setFilmes] = useState<Filme[]>([])
  const [salas, setSalas] = useState<Sala[]>([])
  const [loading, setLoading] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [mostrarVenda, setMostrarVenda] = useState(false)
  const [sessaoSelecionada, setSessaoSelecionada] = useState<Sessao | null>(null)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [sucesso, setSucesso] = useState('')
  const [formData, setFormData] = useState({
    filmeId: '',
    salaId: '',
    data: '',
    horario: '',
  })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [sessoesRes, filmesRes, salasRes] = await Promise.all([
        getSessoes(),
        getFilmes(),
        getSalas(),
      ])
      setSessoes(sessoesRes.data)
      setFilmes(filmesRes.data)
      setSalas(salasRes.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErros({})
    setSucesso('')

    const data = {
      filmeId: parseInt(formData.filmeId),
      salaId: parseInt(formData.salaId),
      data: formData.data,
      horario: formData.horario,
    }

    try {
      sessaoSchema.parse(data)
      await criarSessao(data as Sessao)
      setSucesso('Sessão agendada com sucesso!')
      setFormData({
        filmeId: '',
        salaId: '',
        data: '',
        horario: '',
      })
      setMostrarForm(false)
      await carregarDados()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((err: any) => {
          const path = err.path[0]
          newErrors[path as string] = err.message
        })
        setErros(newErrors)
      }
    }
  }

  const getNomeFilme = (filmeId: number) => {
    return filmes.find((f) => f.id === filmeId)?.titulo || 'Desconhecido'
  }

  const getNumeroDaSala = (salaId: number) => {
    return salas.find((s) => s.id === salaId)?.numero || 'Desconhecida'
  }

  return (
    <div className="container-fluid py-5">
      <div className="row mb-4">
        <div className="col">
          <h1 className="mb-4">🎟️ Gerenciar Sessões</h1>
          <button
            className="btn btn-success"
            onClick={() => setMostrarForm(!mostrarForm)}
          >
            {mostrarForm ? 'Cancelar' : '+ Agendar Sessão'}
          </button>
        </div>
      </div>

      {sucesso && (
        <div className="alert alert-success alert-dismissible fade show">
          {sucesso}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSucesso('')}
          ></button>
        </div>
      )}

      {mostrarForm && (
        <div className="card mb-4 border-success">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">Nova Sessão</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Filme</label>
                  <select
                    className={`form-select ${erros.filmeId ? 'is-invalid' : ''}`}
                    value={formData.filmeId}
                    onChange={(e) =>
                      setFormData({ ...formData, filmeId: e.target.value })
                    }
                  >
                    <option value="">Selecione um filme</option>
                    {filmes.map((filme) => (
                      <option key={filme.id} value={filme.id}>
                        {filme.titulo}
                      </option>
                    ))}
                  </select>
                  {erros.filmeId && (
                    <div className="invalid-feedback d-block">{erros.filmeId}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Sala</label>
                  <select
                    className={`form-select ${erros.salaId ? 'is-invalid' : ''}`}
                    value={formData.salaId}
                    onChange={(e) =>
                      setFormData({ ...formData, salaId: e.target.value })
                    }
                  >
                    <option value="">Selecione uma sala</option>
                    {salas.map((sala) => (
                      <option key={sala.id} value={sala.id}>
                        Sala {sala.numero} ({sala.capacidade} lugares)
                      </option>
                    ))}
                  </select>
                  {erros.salaId && (
                    <div className="invalid-feedback d-block">{erros.salaId}</div>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Data</label>
                  <input
                    type="date"
                    className={`form-control ${erros.data ? 'is-invalid' : ''}`}
                    value={formData.data}
                    onChange={(e) =>
                      setFormData({ ...formData, data: e.target.value })
                    }
                  />
                  {erros.data && (
                    <div className="invalid-feedback d-block">{erros.data}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Horário</label>
                  <input
                    type="time"
                    className={`form-control ${erros.horario ? 'is-invalid' : ''}`}
                    value={formData.horario}
                    onChange={(e) =>
                      setFormData({ ...formData, horario: e.target.value })
                    }
                  />
                  {erros.horario && (
                    <div className="invalid-feedback d-block">{erros.horario}</div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-success w-100">
                Agendar Sessão
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {sessoes.map((sessao) => (
            <div key={sessao.id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0 hover-card">
                <div className="card-body">
                  <h5 className="card-title text-success">
                    🎬 {getNomeFilme(sessao.filmeId)}
                  </h5>
                  <p className="card-text">
                    <small>
                      <strong>Sala:</strong> {getNumeroDaSala(sessao.salaId)}
                    </small>
                  </p>
                  <p className="card-text">
                    <small>
                      <strong>Data:</strong> {new Date(sessao.data).toLocaleDateString('pt-BR')}
                    </small>
                  </p>
                  <p className="card-text">
                    <small>
                      <strong>Horário:</strong> {sessao.horario}
                    </small>
                  </p>
                </div>
                <div className="card-footer bg-white border-top">
                  <button
                    className="btn btn-success btn-sm w-100"
                    onClick={() => {
                      setSessaoSelecionada(sessao)
                      setMostrarVenda(true)
                    }}
                  >
                    <i className="bi bi-ticket"></i> Vender Ingresso
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {mostrarVenda && sessaoSelecionada && (
        <VendaIngressoModal
          sessao={sessaoSelecionada}
          filme={filmes.find((f) => f.id === sessaoSelecionada.filmeId)!}
          onClose={() => {
            setMostrarVenda(false)
            setSessaoSelecionada(null)
          }}
          onSuccess={() => {
            setMostrarVenda(false)
            setSucesso('Ingresso vendido com sucesso!')
          }}
        />
      )}
    </div>
  )
}
