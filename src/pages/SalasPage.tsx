import { useState, useEffect } from 'react'
import { getSalas, criarSala } from '../services/api'
import { salaSchema, Sala } from '../schemas'
import { z } from 'zod'

export function SalasPage() {
  const [salas, setSalas] = useState<Sala[]>([])
  const [loading, setLoading] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [sucesso, setSucesso] = useState('')
  const [formData, setFormData] = useState({
    numero: '',
    capacidade: '',
  })

  useEffect(() => {
    carregarSalas()
  }, [])

  const carregarSalas = async () => {
    try {
      setLoading(true)
      const response = await getSalas()
      setSalas(response.data)
    } catch (error) {
      console.error('Erro ao carregar salas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErros({})
    setSucesso('')

    const data = {
      numero: parseInt(formData.numero),
      capacidade: parseInt(formData.capacidade),
    }

    try {
      salaSchema.parse(data)
      await criarSala(data)
      setSucesso('Sala criada com sucesso!')
      setFormData({
        numero: '',
        capacidade: '',
      })
      setMostrarForm(false)
      await carregarSalas()
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

  return (
    <div className="container-fluid py-5">
      <div className="row mb-4">
        <div className="col">
          <h1 className="mb-4">🚪 Gerenciar Salas</h1>
          <button
            className="btn btn-primary"
            onClick={() => setMostrarForm(!mostrarForm)}
          >
            {mostrarForm ? 'Cancelar' : '+ Adicionar Sala'}
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
        <div className="card mb-4 border-primary">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Nova Sala</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Número da Sala</label>
                  <input
                    type="number"
                    className={`form-control ${erros.numero ? 'is-invalid' : ''}`}
                    value={formData.numero}
                    onChange={(e) =>
                      setFormData({ ...formData, numero: e.target.value })
                    }
                  />
                  {erros.numero && (
                    <div className="invalid-feedback d-block">{erros.numero}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Capacidade (lugares)</label>
                  <input
                    type="number"
                    className={`form-control ${erros.capacidade ? 'is-invalid' : ''}`}
                    value={formData.capacidade}
                    onChange={(e) =>
                      setFormData({ ...formData, capacidade: e.target.value })
                    }
                  />
                  {erros.capacidade && (
                    <div className="invalid-feedback d-block">{erros.capacidade}</div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Salvar Sala
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Sala</th>
                <th>Capacidade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {salas.map((sala) => (
                <tr key={sala.id}>
                  <td className="fw-bold">Sala {sala.numero}</td>
                  <td>{sala.capacidade} lugares</td>
                  <td>
                    <span className="badge bg-success">Ativa</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
