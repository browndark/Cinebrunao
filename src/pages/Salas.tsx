import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { type Sala, salaSchema } from "../types";

export function Salas() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [formData, setFormData] = useState({ numero: 0, capacidade: 0 });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetch("http://localhost:3000/salas")
      .then((r) => r.json())
      .then(setSalas);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dados enviados:", formData);
    try {
      const dadosValidos = salaSchema.parse(formData);
      setErrors({});
      console.log("Dados validados:", dadosValidos);
      
      const response = await fetch("http://localhost:3000/salas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosValidos),
      });
      
      console.log("Resposta do servidor:", response);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      toast.success("Sala cadastrada!");
      setFormData({ numero: 0, capacidade: 0 }); // Limpar formulário
      
      // Recarregar salas
      const salasResponse = await fetch("http://localhost:3000/salas");
      const salasData = await salasResponse.json();
      console.log("Salas atualizadas:", salasData);
      setSalas(salasData);
    } catch (err) {
      console.error("Erro:", err);
      if (err instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
        err.issues.forEach((error) => {
          fieldErrors[error.path[0] as string] = error.message;
        });
        setErrors(fieldErrors);
        console.log("Erros de validação:", fieldErrors);
        toast.error("Verifique os dados da sala");
      } else {
        toast.error("Erro ao cadastrar sala");
      }
    }
  };

  const handleDelete = (id: string) => {
    toast("Deseja realmente excluir esta sala?", {
      action: {
        label: "Excluir",
        onClick: async () => {
          try {
            await fetch(`http://localhost:3000/salas/${id}`, {
              method: "DELETE",
            });
            setSalas(salas.filter((s) => s.id !== id));
            toast.success("Sala excluída!");
          } catch (error) {
            toast.error("Falha ao excluir sala.");
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

  return (
    <div className="container">
      <h2>Gerenciar Salas</h2>
      <form onSubmit={handleSubmit} className="card p-3 mb-4">
        <div className="row">
          <div className="col-md-6">
            <label className="form-label">Número da Sala</label>
            <input
              type="number"
              className={`form-control ${errors.numero ? "is-invalid" : ""}`}
              value={formData.numero || ""}
              onChange={(e) =>
                setFormData({ ...formData, numero: Number(e.target.value) })
              }
            />
            {errors.numero && (
              <div className="invalid-feedback">{errors.numero}</div>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label">Capacidade</label>
            <input
              type="number"
              className={`form-control ${
                errors.capacidade ? "is-invalid" : ""
              }`}
              value={formData.capacidade || ""}
              onChange={(e) =>
                setFormData({ ...formData, capacidade: Number(e.target.value) })
              }
            />
            {errors.capacidade && (
              <div className="invalid-feedback">{errors.capacidade}</div>
            )}
          </div>
          <div className="col-12 mt-3">
            <button type="submit" className="btn btn-primary">
              Salvar
            </button>
          </div>
        </div>
      </form>
      <ul className="list-group">
        {salas.map((sala) => (
          <li
            key={sala.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              Sala {sala.numero}
              <span className="badge bg-secondary rounded-pill ms-2 text-dark">
                Cap: {sala.capacidade}
              </span>
            </div>
            <button
              onClick={() => handleDelete(sala.id)}
              className="btn btn-danger btn-sm"
            >
              <i className="bi bi-trash"></i>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
