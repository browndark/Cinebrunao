import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { type Sessao, type Filme, type Sala, type Ingresso, sessaoSchema } from "../types";

export function Sessoes() {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [ingressos, setIngressos] = useState<Ingresso[]>([]);
  const [formData, setFormData] = useState({
    filmeId: "",
    salaId: "",
    dataHora: "",
  });
  const [novoIngresso, setNovoIngresso] = useState({
    valorInteira: "",
    valorMeia: "",
  });
  const [selectedSessao, setSelectedSessao] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [vendaData, setVendaData] = useState({
    sessaoId: "",
    tipo: "Inteira",
  });

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3000/sessoes").then((r) => r.json()),
      fetch("http://localhost:3000/filmes").then((r) => r.json()),
      fetch("http://localhost:3000/salas").then((r) => r.json()),
      fetch("http://localhost:3000/ingressos").then((r) => r.json()),
    ]).then(([sessoesData, filmesData, salasData, ingressosData]) => {
      setSessoes(sessoesData);
      setFilmes(filmesData);
      setSalas(salasData);
      setIngressos(ingressosData);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dados = sessaoSchema.parse(formData);
      setErrors({});

      const payload = {
        filmeId: dados.filmeId,
        salaId: dados.salaId,
        dataHora: dados.dataHora,
      };

      const response = await fetch("http://localhost:3000/sessoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newSessao = await response.json();
        setSessoes([...sessoes, newSessao]);
        setFormData({ filmeId: "", salaId: "", dataHora: "" });
        toast.success("Sessão agendada! Agora defina os preços dos ingressos.");
        setSelectedSessao(newSessao.id);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
        err.issues.forEach((error) => {
          fieldErrors[error.path[0] as string] = error.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleAdicionarIngresso = async () => {
    if (!selectedSessao) {
      toast.error("Selecione uma sessão");
      return;
    }

    const valorInteira = 20;
    const valorMeia = 10;

    try {
      const response = await fetch("http://localhost:3000/ingressos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessaoId: selectedSessao,
          valorInteira: valorInteira,
          valorMeia: valorMeia,
        }),
      });

      if (response.ok) {
        const newIngresso = await response.json();
        setIngressos([...ingressos, newIngresso]);
        setNovoIngresso({ valorInteira: "", valorMeia: "" });
        setSelectedSessao(null);
        toast.success("Preços de ingressos definidos!");
      }
    } catch (error) {
      toast.error("Erro ao adicionar ingressos");
      console.error(error);
    }
  };

  const venderIngresso = (sessaoId: string, tipo: "Inteira" | "Meia") => {
    const ingresso = ingressos.find((i) => i.sessaoId === sessaoId);
    if (!ingresso) {
      toast.error("Preços não definidos para esta sessão");
      return;
    }

    const valor = tipo === "Inteira" ? ingresso.valorInteira : ingresso.valorMeia;
    toast.success(
      `Ingresso ${tipo} vendido! Valor: R$ ${valor.toFixed(2)}`
    );
  };

  const handleDelete = (id: string) => {
    toast("Deseja realmente excluir esta sessão?", {
      action: {
        label: "Excluir",
        onClick: async () => {
          try {
            await fetch(`http://localhost:3000/sessoes/${id}`, {
              method: "DELETE",
            });
            setSessoes(sessoes.filter((s) => s.id !== id));
            toast.success("Sessão excluída!");
          } catch (error) {
            toast.error("Falha ao excluir sessão.");
            console.error(error);
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
    });
  };

  const getNomeFilme = (id: string) =>
    filmes.find((f) => f.id === id)?.titulo || "Desconhecido";
  const getNumeroSala = (id: string) =>
    salas.find((s) => s.id === id)?.numero || "?";
  const getIngressoSessao = (sessaoId: string) =>
    ingressos.find((i) => i.sessaoId === sessaoId);

  return (
    <div className="container">
      <h2>Agendar Sessão</h2>
      <form onSubmit={handleSubmit} className="card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Filme</label>
            <select
              className={`form-select ${errors.filmeId ? "is-invalid" : ""}`}
              value={formData.filmeId}
              onChange={(e) =>
                setFormData({ ...formData, filmeId: e.target.value })
              }
            >
              <option value="">Selecione...</option>
              {filmes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.titulo}
                </option>
              ))}
            </select>
            {errors.filmeId && (
              <div className="invalid-feedback">{errors.filmeId}</div>
            )}
          </div>
          <div className="col-md-4">
            <label className="form-label">Sala</label>
            <select
              className={`form-select ${errors.salaId ? "is-invalid" : ""}`}
              value={formData.salaId}
              onChange={(e) =>
                setFormData({ ...formData, salaId: e.target.value })
              }
            >
              <option value="">Selecione...</option>
              {salas.map((s) => (
                <option key={s.id} value={s.id}>
                  Sala {s.numero}
                </option>
              ))}
            </select>
            {errors.salaId && (
              <div className="invalid-feedback">{errors.salaId}</div>
            )}
          </div>
          <div className="col-md-4">
            <label className="form-label">Data e Hora</label>
            <input
              type="datetime-local"
              className={`form-control ${errors.dataHora ? "is-invalid" : ""}`}
              value={formData.dataHora}
              onChange={(e) =>
                setFormData({ ...formData, dataHora: e.target.value })
              }
            />
            {errors.dataHora && (
              <div className="invalid-feedback">{errors.dataHora}</div>
            )}
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-primary">
              Agendar Sessão
            </button>
          </div>
        </div>
      </form>

      <h3 className="mt-5">Sessões Agendadas</h3>
                      <div className="row">
        {sessoes.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info">Nenhuma sessão agendada.</div>
          </div>
        ) : (
          sessoes.map((sessao) => {
            const ingresso = getIngressoSessao(sessao.id);
            return (
              <div key={sessao.id} className="col-md-6 mb-3">
                <div className={`card ${ingresso ? "border-success" : ""}`}>
                  <div className="card-body">
                    <h5 className="card-title">
                      {getNomeFilme(sessao.filmeId)}
                    </h5>
                    <h6 className="card-subtitle mb-2 text-primary">
                      <i className="bi bi-door-closed"></i> Sala:{" "}
                      {getNumeroSala(sessao.salaId)}
                    </h6>
                    <p className="card-text">
                      <i className="bi bi-calendar-event"></i>{" "}
                      {new Date(sessao.dataHora).toLocaleDateString("pt-BR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="card-text">
                      <i className="bi bi-clock"></i>{" "}
                      {new Date(sessao.dataHora).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {ingresso ? (
                      <div className="alert alert-success mb-2">
                        <strong>Preços definidos:</strong>
                        <br />
                        Inteira: R$ {ingresso.valorInteira.toFixed(2)}
                        <br />
                        Meia: R$ {ingresso.valorMeia.toFixed(2)}
                      </div>
                    ) : (
                      <div className="alert alert-warning mb-2">
                        Preços não definidos
                      </div>
                    )}

                    {!ingresso && (
                      <>
                        {selectedSessao === sessao.id ? (
                          <div className="alert alert-info mb-2">
                            <strong>Preços padrão:</strong>
                            <br />
                            Inteira: R$ 20,00
                            <br />
                            Meia: R$ 10,00
                            <div className="row g-2 mt-3">
                              <div className="col-12">
                                <button
                                  type="button"
                                  onClick={handleAdicionarIngresso}
                                  className="btn btn-success btn-sm w-100"
                                >
                                  Confirmar Preços
                                </button>
                              </div>
                              <div className="col-12">
                                <button
                                  type="button"
                                  onClick={() => setSelectedSessao(null)}
                                  className="btn btn-secondary btn-sm w-100"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedSessao(sessao.id)}
                            className="btn btn-warning btn-sm w-100 mb-2"
                          >
                            Definir Preços Padrão
                          </button>
                        )}
                      </>
                    )}

                    {ingresso && (
                      <div className="row g-2 mt-3">
                        <div className="col-6">
                          <button
                            type="button"
                            onClick={() => venderIngresso(sessao.id, "Inteira")}
                            className="btn btn-success btn-sm w-100"
                          >
                            <i className="bi bi-ticket"></i> Inteira
                            <br />
                            R$ 20,00
                          </button>
                        </div>
                        <div className="col-6">
                          <button
                            type="button"
                            onClick={() => venderIngresso(sessao.id, "Meia")}
                            className="btn btn-info btn-sm w-100"
                          >
                            <i className="bi bi-ticket"></i> Meia
                            <br />
                            R$ 10,00
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleDelete(sessao.id)}
                      className="btn btn-danger btn-sm w-100"
                    >
                      <i className="bi bi-trash"></i> Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
