import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { type Filme, filmeSchema, type Sala } from "../types";

export function Filmes() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // Estados do formulário
  const [formData, setFormData] = useState({
    titulo: "",
    sinopse: "",
    classificacao: "",
    duracao: 0,
    genero: "",
    dataEstreia: "",
    foto: "",
  });

  const [sessoes, setSessoes] = useState<Array<{ salaId: string; dataHora: string }>>([]);

  useEffect(() => {
    fetch("http://localhost:3000/filmes")
      .then((r) => r.json())
      .then(setFilmes);
    
    fetch("http://localhost:3000/salas")
      .then((r) => r.json())
      .then(setSalas);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validação Zod
      const dadosValidos = filmeSchema.parse(formData);
      setErrors({});

      if (editandoId) {
        // Atualizar filme existente
        await fetch(`http://localhost:3000/filmes/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosValidos),
        });

        toast.success("Filme atualizado!");
      } else {
        // Criar novo filme
        const filmeResponse = await fetch("http://localhost:3000/filmes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosValidos),
        });

        const novoFilme = await filmeResponse.json();

        // Salvar sessões
        for (const sessao of sessoes) {
          await fetch("http://localhost:3000/sessoes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filmeId: novoFilme.id,
              salaId: sessao.salaId,
              dataHora: sessao.dataHora,
            }),
          });
        }

        toast.success(`Filme cadastrado com ${sessoes.length} sessão(ões)!`);
      }

      setFormData({
        titulo: "",
        sinopse: "",
        classificacao: "",
        duracao: 0,
        genero: "",
        dataEstreia: "",
        foto: "",
      });
      setSessoes([]);
      setEditandoId(null);
      
      // Recarregar filmes
      const response = await fetch("http://localhost:3000/filmes");
      setFilmes(await response.json());
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
    toast("Deseja realmente excluir este filme?", {
      action: {
        label: "Excluir",
        onClick: async () => {
          try {
            await fetch(`http://localhost:3000/filmes/${id}`, {
              method: "DELETE",
            });
            setFilmes(filmes.filter((f) => f.id !== id));
            toast.success("Filme excluído!");
          } catch (error) {
            toast.error("Falha ao excluir filme.");
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, foto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdicionarSessao = () => {
    setSessoes([...sessoes, { salaId: "", dataHora: "" }]);
  };

  const handleRemoverSessao = (index: number) => {
    setSessoes(sessoes.filter((_, i) => i !== index));
  };

  const handleAtualizarSessao = (
    index: number,
    field: "salaId" | "dataHora",
    value: string
  ) => {
    const novasSessoes = [...sessoes];
    novasSessoes[index] = { ...novasSessoes[index], [field]: value };
    setSessoes(novasSessoes);
  };

  const handleEditar = (filme: Filme) => {
    setFormData({
      titulo: filme.titulo,
      sinopse: filme.sinopse,
      classificacao: filme.classificacao,
      duracao: filme.duracao,
      genero: filme.genero,
      dataEstreia: filme.dataEstreia,
      foto: filme.foto || "",
    });
    setEditandoId(filme.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelarEdicao = () => {
    setEditandoId(null);
    setFormData({
      titulo: "",
      sinopse: "",
      classificacao: "",
      duracao: 0,
      genero: "",
      dataEstreia: "",
      foto: "",
    });
    setSessoes([]);
  };

  return (
    <div className="container">
      <h2>{editandoId ? "Editar Filme" : "Gerenciar Filmes"}</h2>
      {/* Formulário */}
      <form onSubmit={handleSubmit} className="card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Título</label>
            <input
              type="text"
              className={`form-control ${errors.titulo ? "is-invalid" : ""}`}
              value={formData.titulo}
              onChange={(e) =>
                setFormData({ ...formData, titulo: e.target.value })
              }
            />
            {errors.titulo && (
              <div className="invalid-feedback">{errors.titulo}</div>
            )}
          </div>
          <div className="col-md-3">
            <label className="form-label">Duração (min)</label>
            <input
              type="number"
              className={`form-control ${errors.duracao ? "is-invalid" : ""}`}
              value={formData.duracao}
              onChange={(e) =>
                setFormData({ ...formData, duracao: Number(e.target.value) })
              }
            />
            {errors.duracao && (
              <div className="invalid-feedback">{errors.duracao}</div>
            )}
          </div>
          <div className="col-md-3">
            <label className="form-label">Gênero</label>
            <input
              type="text"
              className={`form-control ${errors.genero ? "is-invalid" : ""}`}
              value={formData.genero}
              onChange={(e) =>
                setFormData({ ...formData, genero: e.target.value })
              }
            />
            {errors.genero && (
              <div className="invalid-feedback">{errors.genero}</div>
            )}
          </div>
          <div className="col-12">
            <label className="form-label">Sinopse</label>
            <textarea
              className={`form-control ${errors.sinopse ? "is-invalid" : ""}`}
              value={formData.sinopse}
              onChange={(e) =>
                setFormData({ ...formData, sinopse: e.target.value })
              }
            />
            {errors.sinopse && (
              <div className="invalid-feedback">{errors.sinopse}</div>
            )}
          </div>
          <div className="col-md-4">
            <label className="form-label">Classificação</label>
            <input
              type="text"
              className={`form-control ${
                errors.classificacao ? "is-invalid" : ""
              }`}
              value={formData.classificacao}
              onChange={(e) =>
                setFormData({ ...formData, classificacao: e.target.value })
              }
            />
            {errors.classificacao && (
              <div className="invalid-feedback">{errors.classificacao}</div>
            )}
          </div>
          <div className="col-md-4">
            <label className="form-label">Data</label>
            <input
              type="date"
              className={`form-control ${
                errors.dataEstreia ? "is-invalid" : ""
              }`}
              value={formData.dataEstreia}
              onChange={(e) =>
                setFormData({ ...formData, dataEstreia: e.target.value })
              }
            />
            {errors.dataEstreia && (
              <div className="invalid-feedback">{errors.dataEstreia}</div>
            )}
          </div>
          <div className="col-md-4">
            <label className="form-label">Foto do Filme</label>
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={handleImageUpload}
            />
            {formData.foto && (
              <div className="mt-2">
                <img
                  src={formData.foto}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "150px",
                    borderRadius: "8px",
                  }}
                />
              </div>
            )}
          </div>
          <div className="col-12">
            <hr />
            <h5 className="mb-3">
              <i className="bi bi-calendar-event"></i> Horários de Sessões
            </h5>

            {sessoes.map((sessao, index) => (
              <div key={index} className="row g-2 mb-3 p-3 bg-light rounded">
                <div className="col-md-6">
                  <label className="form-label">Sala</label>
                  <select
                    className="form-select"
                    value={sessao.salaId}
                    onChange={(e) =>
                      handleAtualizarSessao(index, "salaId", e.target.value)
                    }
                  >
                    <option value="">Selecione uma sala</option>
                    {salas.map((sala) => (
                      <option key={sala.id} value={sala.id}>
                        Sala {sala.numero} (Cap. {sala.capacidade})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-5">
                  <label className="form-label">Data e Hora</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={sessao.dataHora}
                    onChange={(e) =>
                      handleAtualizarSessao(index, "dataHora", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-1 d-flex align-items-end">
                  <button
                    type="button"
                    className="btn btn-danger btn-sm w-100"
                    onClick={() => handleRemoverSessao(index)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-secondary btn-sm mb-3"
              onClick={handleAdicionarSessao}
            >
              <i className="bi bi-plus-circle"></i> Adicionar Sessão
            </button>
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-save"></i> {editandoId ? "Atualizar" : "Salvar"}
            </button>
            {editandoId && (
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={handleCancelarEdicao}
              >
                <i className="bi bi-x-circle"></i> Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Listagem */}
      <div className="row">
        {filmes.map((filme) => (
          <div className="col-md-4 mb-3" key={filme.id}>
            <div className="card h-100">
              {filme.foto && (
                <img
                  src={filme.foto}
                  className="card-img-top"
                  alt={filme.titulo}
                  style={{ height: "250px", objectFit: "cover" }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-film"></i> {filme.titulo}
                </h5>
                <p className="card-text">{filme.sinopse}</p>
                <p className="small text-primary">
                  {filme.genero} | {filme.duracao} min
                </p>
                <button
                  onClick={() => handleEditar(filme)}
                  className="btn btn-warning btn-sm me-2"
                >
                  <i className="bi bi-pencil"></i> Editar
                </button>
                <button
                  onClick={() => handleDelete(filme.id)}
                  className="btn btn-danger btn-sm"
                >
                  <i className="bi bi-trash"></i> Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
