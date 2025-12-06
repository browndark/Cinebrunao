import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { type Cinema, type Sala, type Filme, type Sessao, cinemaSchema } from "../types";

type CinemaDetalhado = Cinema & {
  salas: Sala[];
  filmes: Filme[];
  sessoes: Sessao[];
};

export function Cinemas() {
  const [cinemas, setCinemas] = useState<CinemaDetalhado[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    telefone: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cinemasRes, salasRes, filmesRes, sessoesRes] = await Promise.all([
        fetch("http://localhost:3000/cinemas"),
        fetch("http://localhost:3000/salas"),
        fetch("http://localhost:3000/filmes"),
        fetch("http://localhost:3000/sessoes"),
      ]);

      const cinemasData = await cinemasRes.json();
      const salasData = await salasRes.json();
      const filmesData = await filmesRes.json();
      const sessoesData = await sessoesRes.json();

      setSalas(salasData);
      setFilmes(filmesData);
      setSessoes(sessoesData);

      // Enriquecer cinemas com dados relacionados
      const cinemasDetalhados = cinemasData.map((cinema: Cinema) => ({
        ...cinema,
        salas: salasData.filter((s: Sala) => cinema.listaSalas?.includes(s.id)),
        filmes: filmesData.filter((f: Filme) => cinema.listaFilmes?.includes(f.id)),
        sessoes: sessoesData.filter((s: Sessao) => cinema.listaSessao?.includes(s.id)),
      }));

      setCinemas(cinemasDetalhados);
    } catch (error) {
      toast.error("Erro ao carregar dados");
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dados = cinemaSchema.parse(formData);
      setErrors({});

      if (editandoId) {
        await fetch(`http://localhost:3000/cinemas/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        });
        toast.success("Cinema atualizado!");
        setEditandoId(null);
      } else {
        await fetch("http://localhost:3000/cinemas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...dados,
            listaSalas: [],
            listaFilmes: [],
            listaSessao: [],
          }),
        });
        toast.success("Cinema adicionado!");
      }

      setFormData({ nome: "", endereco: "", telefone: "" });
      fetchData();
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

  const handleDelete = (id: string) => {
    toast("Deseja realmente excluir este cinema?", {
      action: {
        label: "Excluir",
        onClick: async () => {
          try {
            await fetch(`http://localhost:3000/cinemas/${id}`, {
              method: "DELETE",
            });
            toast.success("Cinema excluído!");
            fetchData();
          } catch (error) {
            toast.error("Erro ao excluir cinema");
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
    });
  };

  const handleEditar = (cinema: Cinema) => {
    setEditandoId(cinema.id);
    setFormData({
      nome: cinema.nome,
      endereco: cinema.endereco,
      telefone: cinema.telefone,
    });
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setFormData({ nome: "", endereco: "", telefone: "" });
    setErrors({});
  };

  const adicionarSalaAoCinema = async (cinemaId: string, salaId: string) => {
    const cinema = cinemas.find((c) => c.id === cinemaId);
    if (!cinema) return;

    const novasListaSalas = [...(cinema.listaSalas || []), salaId];

    try {
      await fetch(`http://localhost:3000/cinemas/${cinemaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...cinema,
          listaSalas: novasListaSalas,
        }),
      });
      toast.success("Sala adicionada ao cinema!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao adicionar sala");
    }
  };

  const removerSalaDoCinema = async (cinemaId: string, salaId: string) => {
    const cinema = cinemas.find((c) => c.id === cinemaId);
    if (!cinema) return;

    const novasListaSalas = (cinema.listaSalas || []).filter((id) => id !== salaId);

    try {
      await fetch(`http://localhost:3000/cinemas/${cinemaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...cinema,
          listaSalas: novasListaSalas,
        }),
      });
      toast.success("Sala removida do cinema!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao remover sala");
    }
  };

  const adicionarFilmeAoCinema = async (cinemaId: string, filmeId: string) => {
    const cinema = cinemas.find((c) => c.id === cinemaId);
    if (!cinema) return;

    const novasListaFilmes = [...(cinema.listaFilmes || []), filmeId];

    try {
      await fetch(`http://localhost:3000/cinemas/${cinemaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...cinema,
          listaFilmes: novasListaFilmes,
        }),
      });
      toast.success("Filme adicionado ao cinema!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao adicionar filme");
    }
  };

  const removerFilmeDoCinema = async (cinemaId: string, filmeId: string) => {
    const cinema = cinemas.find((c) => c.id === cinemaId);
    if (!cinema) return;

    const novasListaFilmes = (cinema.listaFilmes || []).filter((id) => id !== filmeId);

    try {
      await fetch(`http://localhost:3000/cinemas/${cinemaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...cinema,
          listaFilmes: novasListaFilmes,
        }),
      });
      toast.success("Filme removido do cinema!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao remover filme");
    }
  };

  const adicionarSessaoAoCinema = async (cinemaId: string, sessaoId: string) => {
    const cinema = cinemas.find((c) => c.id === cinemaId);
    if (!cinema) return;

    const novasListaSessao = [...(cinema.listaSessao || []), sessaoId];

    try {
      await fetch(`http://localhost:3000/cinemas/${cinemaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...cinema,
          listaSessao: novasListaSessao,
        }),
      });
      toast.success("Sessão adicionada ao cinema!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao adicionar sessão");
    }
  };

  const removerSessaoDoCinema = async (cinemaId: string, sessaoId: string) => {
    const cinema = cinemas.find((c) => c.id === cinemaId);
    if (!cinema) return;

    const novasListaSessao = (cinema.listaSessao || []).filter((id) => id !== sessaoId);

    try {
      await fetch(`http://localhost:3000/cinemas/${cinemaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...cinema,
          listaSessao: novasListaSessao,
        }),
      });
      toast.success("Sessão removida do cinema!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao remover sessão");
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center gap-2 mb-4">
        <i className="bi bi-building" style={{ fontSize: "2.5rem", color: "#ff6b6b" }}></i>
        <h2 className="mb-0" style={{ color: "#fff" }}>Gerenciar Cinemas</h2>
      </div>

      <form onSubmit={handleSubmit} className="card p-4 mb-4" style={{ backgroundColor: "#2a2a2a", borderColor: "#444" }}>
        <h5 className="mb-3" style={{ color: "#fff" }}>Novo Cinema</h5>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label" style={{ color: "#fff" }}>Nome</label>
            <input
              type="text"
              className={`form-control ${errors.nome ? "is-invalid" : ""}`}
              placeholder="Nome do cinema"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              style={{ backgroundColor: "#1a1a1a", color: "#fff", borderColor: "#444" }}
            />
            {errors.nome && (
              <div className="invalid-feedback d-block" style={{ color: "#ff6b6b" }}>{errors.nome}</div>
            )}
          </div>
          <div className="col-md-4">
            <label className="form-label" style={{ color: "#fff" }}>Endereço</label>
            <input
              type="text"
              className={`form-control ${errors.endereco ? "is-invalid" : ""}`}
              placeholder="Endereço"
              value={formData.endereco}
              onChange={(e) =>
                setFormData({ ...formData, endereco: e.target.value })
              }
              style={{ backgroundColor: "#1a1a1a", color: "#fff", borderColor: "#444" }}
            />
            {errors.endereco && (
              <div className="invalid-feedback d-block" style={{ color: "#ff6b6b" }}>{errors.endereco}</div>
            )}
          </div>
          <div className="col-md-4">
            <label className="form-label" style={{ color: "#fff" }}>Telefone</label>
            <input
              type="text"
              className={`form-control ${errors.telefone ? "is-invalid" : ""}`}
              placeholder="Telefone"
              value={formData.telefone}
              onChange={(e) =>
                setFormData({ ...formData, telefone: e.target.value })
              }
              style={{ backgroundColor: "#1a1a1a", color: "#fff", borderColor: "#444" }}
            />
            {errors.telefone && (
              <div className="invalid-feedback d-block" style={{ color: "#ff6b6b" }}>{errors.telefone}</div>
            )}
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-plus-circle"></i> {editandoId ? "Atualizar Cinema" : "Adicionar Cinema"}
            </button>
            {editandoId && (
              <button
                type="button"
                onClick={handleCancelar}
                className="btn btn-secondary ms-2"
              >
                <i className="bi bi-x-circle"></i> Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="row">
        {cinemas.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info" style={{ backgroundColor: "#1a3a3a", borderColor: "#4a7a7a", color: "#fff" }}>
              <i className="bi bi-info-circle"></i> Nenhum cinema cadastrado ainda. Adicione um novo cinema acima!
            </div>
          </div>
        ) : (
          cinemas.map((cinema) => (
            <div key={cinema.id} className="col-lg-6 mb-4">
              <div className="card h-100" style={{ backgroundColor: "#1a1a1a", borderColor: "#ff6b6b", borderWidth: "2px" }}>
                <div className="card-header" style={{ backgroundColor: "#ff6b6b", color: "#fff" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1" style={{ color: "#fff", fontSize: "1.3rem" }}>
                        <i className="bi bi-building"></i> {cinema.nome}
                      </h5>
                    </div>
                    <button
                      onClick={() =>
                        setExpandidoId(expandidoId === cinema.id ? null : cinema.id)
                      }
                      className="btn btn-sm btn-light"
                    >
                      <i className={`bi bi-chevron-${expandidoId === cinema.id ? "up" : "down"}`}></i>
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-12 mb-2">
                      <p style={{ color: "#aaa", marginBottom: "0.5rem" }}>
                        <i className="bi bi-geo-alt"></i> <strong style={{ color: "#fff" }}>Endereço:</strong> {cinema.endereco}
                      </p>
                    </div>
                    <div className="col-12">
                      <p style={{ color: "#aaa", marginBottom: "0" }}>
                        <i className="bi bi-telephone"></i> <strong style={{ color: "#fff" }}>Telefone:</strong> {cinema.telefone}
                      </p>
                    </div>
                  </div>

                  {expandidoId === cinema.id && (
                    <>
                      {/* Salas */}
                      <div className="mb-4 pb-3" style={{ borderBottom: "1px solid #444" }}>
                        <h6 style={{ color: "#fff", marginBottom: "1rem" }}>
                          <i className="bi bi-door-open" style={{ color: "#4a90e2" }}></i> Salas ({cinema.salas?.length || 0})
                        </h6>
                        <div className="row g-2 mb-2">
                          {cinema.salas && cinema.salas.length > 0 ? (
                            cinema.salas.map((sala) => (
                              <div key={sala.id} className="col-auto">
                                <div className="badge bg-info d-flex align-items-center gap-2 p-2">
                                  <span style={{ color: "#000" }}>Sala {sala.numero} • {sala.capacidade} lugares</span>
                                  <button
                                    onClick={() =>
                                      removerSalaDoCinema(cinema.id, sala.id)
                                    }
                                    className="btn-close btn-close-white"
                                    style={{ fontSize: "0.75rem" }}
                                  ></button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div style={{ color: "#666" }}>Nenhuma sala adicionada</div>
                          )}
                        </div>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              adicionarSalaAoCinema(cinema.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          className="form-select form-select-sm"
                          style={{ backgroundColor: "#2a2a2a", color: "#fff", borderColor: "#444" }}
                        >
                          <option value="" style={{ backgroundColor: "#1a1a1a", color: "#fff" }}>+ Adicionar Sala</option>
                          {salas
                            .filter((s) => !cinema.listaSalas?.includes(s.id))
                            .map((s) => (
                              <option key={s.id} value={s.id} style={{ backgroundColor: "#1a1a1a", color: "#fff" }}>
                                Sala {s.numero}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Filmes */}
                      <div className="mb-4 pb-3" style={{ borderBottom: "1px solid #444" }}>
                        <h6 style={{ color: "#fff", marginBottom: "1rem" }}>
                          <i className="bi bi-film" style={{ color: "#ffa500" }}></i> Filmes ({cinema.filmes?.length || 0})
                        </h6>
                        <div className="list-group" style={{ marginBottom: "1rem" }}>
                          {cinema.filmes && cinema.filmes.length > 0 ? (
                            cinema.filmes.map((filme) => (
                              <div
                                key={filme.id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                                style={{ backgroundColor: "#2a2a2a", borderColor: "#444", color: "#fff" }}
                              >
                                <div>
                                  <strong style={{ color: "#ffa500" }}>{filme.titulo}</strong>
                                  <br />
                                  <small style={{ color: "#999" }}>{filme.genero}</small>
                                </div>
                                <button
                                  onClick={() =>
                                    removerFilmeDoCinema(cinema.id, filme.id)
                                  }
                                  className="btn-close btn-close-white"
                                ></button>
                              </div>
                            ))
                          ) : (
                            <div style={{ color: "#666" }}>Nenhum filme adicionado</div>
                          )}
                        </div>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              adicionarFilmeAoCinema(cinema.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          className="form-select form-select-sm"
                          style={{ backgroundColor: "#2a2a2a", color: "#fff", borderColor: "#444" }}
                        >
                          <option value="" style={{ backgroundColor: "#1a1a1a", color: "#fff" }}>+ Adicionar Filme</option>
                          {filmes
                            .filter((f) => !cinema.listaFilmes?.includes(f.id))
                            .map((f) => (
                              <option key={f.id} value={f.id} style={{ backgroundColor: "#1a1a1a", color: "#fff" }}>
                                {f.titulo}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Sessões */}
                      <div className="mb-3">
                        <h6 style={{ color: "#fff", marginBottom: "1rem" }}>
                          <i className="bi bi-calendar-event" style={{ color: "#50c878" }}></i> Sessões ({cinema.sessoes?.length || 0})
                        </h6>
                        <div className="list-group" style={{ marginBottom: "1rem" }}>
                          {cinema.sessoes && cinema.sessoes.length > 0 ? (
                            cinema.sessoes.map((sessao) => (
                              <div
                                key={sessao.id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                                style={{ backgroundColor: "#2a2a2a", borderColor: "#444", color: "#fff" }}
                              >
                                <small style={{ color: "#aaa" }}>
                                  <i className="bi bi-clock"></i> {new Date(sessao.dataHora).toLocaleString("pt-BR")}
                                </small>
                                <button
                                  onClick={() =>
                                    removerSessaoDoCinema(cinema.id, sessao.id)
                                  }
                                  className="btn-close btn-close-white"
                                ></button>
                              </div>
                            ))
                          ) : (
                            <div style={{ color: "#666" }}>Nenhuma sessão adicionada</div>
                          )}
                        </div>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              adicionarSessaoAoCinema(cinema.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          className="form-select form-select-sm"
                          style={{ backgroundColor: "#2a2a2a", color: "#fff", borderColor: "#444" }}
                        >
                          <option value="" style={{ backgroundColor: "#1a1a1a", color: "#fff" }}>+ Adicionar Sessão</option>
                          {sessoes
                            .filter((s) => !cinema.listaSessao?.includes(s.id))
                            .map((s) => (
                              <option key={s.id} value={s.id} style={{ backgroundColor: "#1a1a1a", color: "#fff" }}>
                                {new Date(s.dataHora).toLocaleString("pt-BR")}
                              </option>
                            ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
                <div className="card-footer" style={{ backgroundColor: "#2a2a2a", borderColor: "#444" }}>
                  <button
                    onClick={() => handleEditar(cinema)}
                    className="btn btn-warning btn-sm"
                  >
                    <i className="bi bi-pencil"></i> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cinema.id)}
                    className="btn btn-danger btn-sm ms-2"
                  >
                    <i className="bi bi-trash"></i> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
