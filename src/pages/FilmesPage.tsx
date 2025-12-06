import { useState, useEffect } from 'react'
import { getFilmes, criarFilme, deletarFilme } from '../services/api'
import { filmeSchema, Filme } from '../schemas'
import { z } from 'zod'

export function FilmesPage() {
  const [filmes, setFilmes] = useState<Filme[]>([])
  const [loading, setLoading] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [sucesso, setSucesso] = useState('')
  const [formData, setFormData] = useState({
    titulo: '',
    sinopse: '',
    classificacao: '',
    duracao: '',
    genero: '',
    dataLancamento: '',
    dataFinal: '',
  })

  useEffect(() => {
    carregarFilmes()
  }, [])

  const carregarFilmes = async () => {
    try {
      setLoading(true)
      const response = await getFilmes()
      setFilmes(response.data)
    } catch (error) {
      console.error('Erro ao carregar filmes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErros({})
    setSucesso('')

    const data = {
      ...formData,
      duracao: parseInt(formData.duracao),
    }

    try {
      filmeSchema.parse(data)
      await criarFilme(data as Filme)
      setSucesso('Filme criado com sucesso!')
      setFormData({
        titulo: '',
        sinopse: '',
        classificacao: '',
        duracao: '',
        genero: '',
        dataLancamento: '',
        dataFinal: '',
      })
      setMostrarForm(false)
      await carregarFilmes()
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

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este filme?')) {
      try {
        await deletarFilme(id)
        setSucesso('Filme deletado com sucesso!')
        await carregarFilmes()
      } catch (error) {
        console.error('Erro ao deletar filme:', error)
      }
    }
  }

  return (
    <div className="container-fluid py-5">
      <div className="row mb-4">
        <div className="col">
          <h1 className="mb-4">🎬 Gerenciar Filmes</h1>
          <button
            className="btn btn-danger"
            onClick={() => setMostrarForm(!mostrarForm)}
          >
            {mostrarForm ? 'Cancelar' : '+ Adicionar Filme'}
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
        <div className="card mb-4 border-danger">
          <div className="card-header bg-danger text-white">
            <h5 className="mb-0">Novo Filme</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Título</label>
                  <input
                    type="text"
                    className={`form-control ${erros.titulo ? 'is-invalid' : ''}`}
                    value={formData.titulo}
                    onChange={(e) =>
                      setFormData({ ...formData, titulo: e.target.value })
                    }
                  />
                  {erros.titulo && (
                    <div className="invalid-feedback d-block">{erros.titulo}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Classificação</label>
                  <input
                    type="text"
                    className={`form-control ${erros.classificacao ? 'is-invalid' : ''}`}
                    value={formData.classificacao}
                    onChange={(e) =>
                      setFormData({ ...formData, classificacao: e.target.value })
                    }
                    placeholder="PG-13, R, etc"
                  />
                  {erros.classificacao && (
                    <div className="invalid-feedback d-block">{erros.classificacao}</div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Sinopse</label>
                <textarea
                  className={`form-control ${erros.sinopse ? 'is-invalid' : ''}`}
                  rows={3}
                  value={formData.sinopse}
                  onChange={(e) =>
                    setFormData({ ...formData, sinopse: e.target.value })
                  }
                ></textarea>
                {erros.sinopse && (
                  <div className="invalid-feedback d-block">{erros.sinopse}</div>
                )}
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Duração (minutos)</label>
                  <input
                    type="number"
                    className={`form-control ${erros.duracao ? 'is-invalid' : ''}`}
                    value={formData.duracao}
                    onChange={(e) =>
                      setFormData({ ...formData, duracao: e.target.value })
                    }
                  />
                  {erros.duracao && (
                    <div className="invalid-feedback d-block">{erros.duracao}</div>
                  )}
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Gênero</label>
                  <input
                    type="text"
                    className={`form-control ${erros.genero ? 'is-invalid' : ''}`}
                    value={formData.genero}
                    onChange={(e) =>
                      setFormData({ ...formData, genero: e.target.value })
                    }
                  />
                  {erros.genero && (
                    <div className="invalid-feedback d-block">{erros.genero}</div>
                  )}
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Data Lançamento</label>
                  <input
                    type="date"
                    className={`form-control ${erros.dataLancamento ? 'is-invalid' : ''}`}
                    value={formData.dataLancamento}
                    onChange={(e) =>
                      setFormData({ ...formData, dataLancamento: e.target.value })
                    }
                  />
                  {erros.dataLancamento && (
                    <div className="invalid-feedback d-block">{erros.dataLancamento}</div>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Data Final</label>
                  <input
                    type="date"
                    className={`form-control ${erros.dataFinal ? 'is-invalid' : ''}`}
                    value={formData.dataFinal}
                    onChange={(e) =>
                      setFormData({ ...formData, dataFinal: e.target.value })
                    }
                  />
                  {erros.dataFinal && (
                    <div className="invalid-feedback d-block">{erros.dataFinal}</div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-danger w-100">
                Salvar Filme
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filmes.map((filme) => (
            <div key={filme.id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0 hover-card">
                <div className="card-body">
                  <h5 className="card-title text-danger">{filme.titulo}</h5>
                  <p className="card-text small text-muted">{filme.sinopse}</p>
                  <div className="mb-3">
                    <span className="badge bg-danger me-2">{filme.classificacao}</span>
                    <span className="badge bg-secondary">{filme.genero}</span>
                  </div>
                  <p className="card-text">
                    <small>
                      <strong>Duração:</strong> {filme.duracao} min
                    </small>
                  </p>
                  <p className="card-text">
                    <small>
                      <strong>Em exibição:</strong> {filme.dataLancamento} a{' '}
                      {filme.dataFinal}
                    </small>
                  </p>
                </div>
                <div className="card-footer bg-white border-top">
                  <button
                    className="btn btn-danger btn-sm w-100"
                    onClick={() => handleDelete(filme.id!)}
                  >
                    <i className="bi bi-trash"></i> Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
