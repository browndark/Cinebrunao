import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { type Filme, type Sessao, type Sala } from "../types";

export function Home() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3000/filmes").then((r) => r.json()),
      fetch("http://localhost:3000/sessoes").then((r) => r.json()),
      fetch("http://localhost:3000/salas").then((r) => r.json()),
    ])
      .then(([filmesData, sessoesData, salasData]) => {
        setFilmes(filmesData);
        setSessoes(sessoesData);
        setSalas(salasData);
      })
      .finally(() => setLoading(false));
  }, []);

  const getFilme = (id: number) => filmes.find((f) => f.id === id);
  const getSala = (id: number) => salas.find((s) => s.id === id);

  const filmesComSessao = filmes.filter((filme) =>
    sessoes.some(
      (sessao) =>
        sessao.filmeId === filme.id && new Date(sessao.dataHora) > new Date(),
    ),
  );

  const sessoesDisponiveis = sessoes
    .filter((sessao) => new Date(sessao.dataHora) > new Date())
    .sort(
      (a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime(),
    );

  const heroFilme = filmesComSessao.length > 0 ? filmesComSessao[0] : null;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .hero-section {
          background: linear-gradient(to top, var(--bs-body-bg) 20%, rgba(0,0,0,0.5)), url('https://placehold.co/1920x1080/0A0A0A/FFFFFF?text=CineBrun%C3%A3o!') no-repeat center center;
          background-size: cover;
          padding: 8rem 0;
          color: white;
        }
        .hero-section .display-4 {
          text-shadow: 2px 2px 8px rgba(0,0,0,0.7);
        }
        .horizontal-scroll {
          display: flex;
          overflow-x: auto;
          padding-bottom: 1.5rem;
          gap: 1rem;
        }
        .horizontal-scroll::-webkit-scrollbar {
          height: 8px;
        }
        .horizontal-scroll::-webkit-scrollbar-track {
          background: var(--bs-light);
          border-radius: 4px;
        }
        .horizontal-scroll::-webkit-scrollbar-thumb {
          background: var(--bs-primary);
          border-radius: 4px;
        }
        .movie-card {
          flex: 0 0 280px;
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .movie-card:hover {
            box-shadow: 0 8px 24px rgba(var(--bs-primary-rgb), 0.1);
        }
        .session-card {
            border-left: 4px solid var(--bs-primary);
        }
      `}</style>

      {heroFilme && (
        <div className="hero-section mb-5">
          <div className="container">
            <h1 className="display-4 fw-bold">{heroFilme.titulo}</h1>
            <p className="lead col-md-8">{heroFilme.sinopse}</p>
            <Link to={`/sessoes`} className="btn btn-primary btn-lg">
              Ver Sessões
            </Link>
          </div>
        </div>
      )}

      <div className="container">
        <section className="my-5">
          <h2 className="mb-4">Em Cartaz</h2>
          <div className="horizontal-scroll">
            {filmesComSessao.length > 0 ? (
              filmesComSessao.map((filme) => {
                const sessoesDosFilmes = sessoes.filter(
                  (s) => s.filmeId === filme.id && new Date(s.dataHora) > new Date()
                );
                return (
                  <div key={filme.id} className="card movie-card h-100">
                    {filme.foto && (
                      <img
                        src={filme.foto}
                        alt={filme.titulo}
                        className="card-img-top"
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                    )}
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{filme.titulo}</h5>
                      <p className="card-text text-primary small">
                        {filme.genero} | {filme.duracao} min
                      </p>
                      
                      <div className="mt-3">
                        <small className="text-muted d-block mb-2"><strong>Sessões:</strong></small>
                        <div className="d-flex flex-column gap-2">
                          {sessoesDosFilmes.slice(0, 3).map((sessao) => {
                            const sala = getSala(sessao.salaId);
                            return (
                              <div key={sessao.id} className="p-2 bg-light rounded small">
                                <div className="fw-semibold text-primary">
                                  {new Date(sessao.dataHora).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                                <div className="text-secondary">Sala {sala?.numero ?? "?"}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-auto pt-3">
                        <Link
                          to={`/sessoes`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          Ver Sessões
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>Nenhum filme em cartaz no momento.</p>
            )}
          </div>
        </section>

        <section className="my-5">
          <h2 className="mb-4">Próximas Sessões</h2>
          <div className="list-group">
            {sessoesDisponiveis.slice(0, 5).map((sessao) => {
              const filme = getFilme(sessao.filmeId);
              const sala = getSala(sessao.salaId);
              return (
                <div
                  key={sessao.id}
                  className="list-group-item session-card mb-2"
                >
                  <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1 text-primary">
                      {filme?.titulo ?? "Filme não encontrado"}
                    </h5>
                    <span className="badge bg-light text-primary rounded-pill">
                      {new Date(sessao.dataHora).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mb-1 text-primary">
                    {new Date(sessao.dataHora).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    | Sala {sala?.numero ?? "?"}
                  </p>
                </div>
              );
            })}
            {sessoesDisponiveis.length > 5 && (
              <Link
                to="/sessoes"
                className="list-group-item list-group-item-action text-center text-primary"
              >
                Ver todas as sessões...
              </Link>
            )}
            {sessoesDisponiveis.length === 0 && (
              <p>Nenhuma sessão disponível no momento.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
