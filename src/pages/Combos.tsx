import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { type Combo, comboSchema } from "../types";

export function Combos() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    valor: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editandoId, setEditandoId] = useState<string | null>(null);

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    try {
      const response = await fetch("http://localhost:3000/combos");
      const data = await response.json();
      setCombos(data);
    } catch (error) {
      toast.error("Erro ao carregar combos");
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dados = comboSchema.parse({
        nome: formData.nome,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
      });
      setErrors({});

      if (editandoId) {
        await fetch(`http://localhost:3000/combos/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        });
        toast.success("Combo atualizado!");
        setEditandoId(null);
      } else {
        await fetch("http://localhost:3000/combos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        });
        toast.success("Combo adicionado!");
      }

      setFormData({ nome: "", descricao: "", valor: "" });
      fetchCombos();
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
    toast("Deseja realmente excluir este combo?", {
      action: {
        label: "Excluir",
        onClick: async () => {
          try {
            await fetch(`http://localhost:3000/combos/${id}`, {
              method: "DELETE",
            });
            toast.success("Combo excluído!");
            fetchCombos();
          } catch (error) {
            toast.error("Erro ao excluir combo");
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
    });
  };

  const handleEditar = (combo: Combo) => {
    setEditandoId(combo.id);
    setFormData({
      nome: combo.nome,
      descricao: combo.descricao,
      valor: combo.valor.toString(),
    });
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setFormData({ nome: "", descricao: "", valor: "" });
    setErrors({});
  };

  return (
    <div className="container">
      <h2>Gerenciar Combos</h2>

      <form onSubmit={handleSubmit} className="card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Nome</label>
            <input
              type="text"
              className={`form-control ${errors.nome ? "is-invalid" : ""}`}
              placeholder="Nome do combo"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
            />
            {errors.nome && (
              <div className="invalid-feedback">{errors.nome}</div>
            )}
          </div>
          <div className="col-md-3">
            <label className="form-label">Descrição</label>
            <input
              type="text"
              className={`form-control ${errors.descricao ? "is-invalid" : ""}`}
              placeholder="Descrição"
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
            />
            {errors.descricao && (
              <div className="invalid-feedback">{errors.descricao}</div>
            )}
          </div>
          <div className="col-md-2">
            <label className="form-label">Valor</label>
            <input
              type="number"
              step="0.01"
              className={`form-control ${errors.valor ? "is-invalid" : ""}`}
              placeholder="Valor"
              value={formData.valor}
              onChange={(e) =>
                setFormData({ ...formData, valor: e.target.value })
              }
            />
            {errors.valor && (
              <div className="invalid-feedback">{errors.valor}</div>
            )}
          </div>
          <div className="col-md-4">
            <label className="form-label">&nbsp;</label>
            <button type="submit" className="btn btn-primary w-100">
              {editandoId ? "Atualizar" : "Adicionar"}
            </button>
            {editandoId && (
              <button
                type="button"
                onClick={handleCancelar}
                className="btn btn-secondary w-100 mt-2"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="row">
        {combos.map((combo) => (
          <div key={combo.id} className="col-md-4 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{combo.nome}</h5>
                <p className="card-text">{combo.descricao}</p>
                <p className="card-text fw-bold text-success">
                  R$ {combo.valor.toFixed(2)}
                </p>
              </div>
              <div className="card-footer bg-light">
                <button
                  onClick={() => handleEditar(combo)}
                  className="btn btn-warning btn-sm"
                >
                  <i className="bi bi-pencil"></i> Editar
                </button>
                <button
                  onClick={() => handleDelete(combo.id)}
                  className="btn btn-danger btn-sm ms-2"
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
