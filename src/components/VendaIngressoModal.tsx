import { useState } from 'react'
import { criarIngresso } from '../services/api'
import { ingressoSchema, Sessao, Filme } from '../schemas'
import { z } from 'zod'

interface VendaIngressoModalProps {
  sessao: Sessao
  filme: Filme
  onClose: () => void
  onSuccess: () => void
}

const PRECO_INTEIRA = 30
const PRECO_MEIA = 15

export function VendaIngressoModal({
  sessao,
  filme,
  onClose,
  onSuccess,
}: VendaIngressoModalProps) {
  const [tipo, setTipo] = useState<'inteira' | 'meia'>('inteira')
  const [comprador, setComprador] = useState('')
  const [erros, setErros] = useState<Record<string, string>>({})

  const preco = tipo === 'inteira' ? PRECO_INTEIRA : PRECO_MEIA

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErros({})

    const data = {
      sessaoId: sessao.id!,
      tipo,
      comprador,
      preco,
    }

    try {
      ingressoSchema.parse({
        sessaoId: data.sessaoId,
        tipo: data.tipo,
        comprador: data.comprador,
      })
      await criarIngresso(data as any)
      onSuccess()
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
    <div className="modal-backdrop fade show d-flex align-items-center justify-content-center">
      <div className="modal fade show d-block" tabIndex={-1} role="dialog">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-warning text-dark">
              <h5 className="modal-title">🎫 Vender Ingresso</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <strong>Filme:</strong> {filme.titulo}
              </div>
              <div className="mb-3">
                <strong>Sessão:</strong> {sessao.data} às {sessao.horario}
              </div>
              <hr />
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nome do Comprador</label>
                  <input
                    type="text"
                    className={`form-control ${erros.comprador ? 'is-invalid' : ''}`}
                    value={comprador}
                    onChange={(e) => setComprador(e.target.value)}
                  />
                  {erros.comprador && (
                    <div className="invalid-feedback d-block">
                      {erros.comprador}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Tipo de Ingresso</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="tipo"
                      id="inteira"
                      value="inteira"
                      checked={tipo === 'inteira'}
                      onChange={(e) => setTipo(e.target.value as 'inteira' | 'meia')}
                    />
                    <label className="form-check-label" htmlFor="inteira">
                      Inteira - R$ {PRECO_INTEIRA},00
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="tipo"
                      id="meia"
                      value="meia"
                      checked={tipo === 'meia'}
                      onChange={(e) => setTipo(e.target.value as 'inteira' | 'meia')}
                    />
                    <label className="form-check-label" htmlFor="meia">
                      Meia - R$ {PRECO_MEIA},00
                    </label>
                  </div>
                </div>

                <div className="alert alert-info">
                  <strong>Valor Total:</strong> R$ {preco},00
                </div>

                <button type="submit" className="btn btn-warning w-100">
                  Confirmar Venda
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
