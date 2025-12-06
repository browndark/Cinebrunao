import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { type Lanche, lancheSchema } from "../types";

type CarrinhoLanche = Lanche & { quantidade: number };

type CompraLanche = {
  nome: string;
  cpf?: string;
  email?: string;
  itens: CarrinhoLanche[];
  total: number;
  metodoPagamento: "cartao" | "pix";
  dataCompra: string;
};

export function Lanches() {
  const [lanches, setLanches] = useState<Lanche[]>([]);
  const [carrinho, setCarrinho] = useState<CarrinhoLanche[]>([]);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    valor: "",
  });
  const [clienteData, setClienteData] = useState({
    nome: "",
    cpf: "",
    email: "",
  });
  const [metodoPagamento, setMetodoPagamento] = useState<"cartao" | "pix">("pix");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mostroCadastro, setMostroCadastro] = useState(true);

  useEffect(() => {
    fetchLanches();
  }, []);

  const fetchLanches = async () => {
    try {
      const response = await fetch("http://localhost:3000/lanches");
      const data = await response.json();
      setLanches(data);
    } catch (error) {
      toast.error("Erro ao carregar lanches");
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dados = lancheSchema.parse({
        nome: formData.nome,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
      });
      setErrors({});

      if (editandoId) {
        await fetch(`http://localhost:3000/lanches/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        });
        toast.success("Lanche atualizado!");
        setEditandoId(null);
      } else {
        await fetch("http://localhost:3000/lanches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        });
        toast.success("Lanche adicionado!");
      }

      setFormData({ nome: "", descricao: "", valor: "" });
      fetchLanches();
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
    toast("Deseja realmente excluir este lanche?", {
      action: {
        label: "Excluir",
        onClick: async () => {
          try {
            await fetch(`http://localhost:3000/lanches/${id}`, {
              method: "DELETE",
            });
            toast.success("Lanche excluído!");
            fetchLanches();
          } catch (error) {
            toast.error("Erro ao excluir lanche");
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
    });
  };

  const handleEditar = (lanche: Lanche) => {
    setEditandoId(lanche.id);
    setFormData({
      nome: lanche.nome,
      descricao: lanche.descricao,
      valor: lanche.valor.toString(),
    });
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setFormData({ nome: "", descricao: "", valor: "" });
    setErrors({});
  };

  const adicionarAoCarrinho = (lanche: Lanche) => {
    const itemExistente = carrinho.find((item) => item.id === lanche.id);
    if (itemExistente) {
      setCarrinho(
        carrinho.map((item) =>
          item.id === lanche.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      );
    } else {
      setCarrinho([...carrinho, { ...lanche, quantidade: 1 }]);
    }
    toast.success(`${lanche.nome} adicionado ao carrinho!`);
  };

  const removerDoCarrinho = (lancheId: string) => {
    setCarrinho(carrinho.filter((item) => item.id !== lancheId));
    toast.success("Item removido do carrinho!");
  };

  const alterarQuantidade = (lancheId: string, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerDoCarrinho(lancheId);
    } else {
      setCarrinho(
        carrinho.map((item) =>
          item.id === lancheId ? { ...item, quantidade: novaQuantidade } : item
        )
      );
    }
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + item.valor * item.quantidade, 0);
  };

  const handleFinalizarCompra = async () => {
    try {
      const nomeSchema = z.string().min(3, "Nome deve ter no mínimo 3 caracteres");
      nomeSchema.parse(clienteData.nome);

      const compra: CompraLanche = {
        nome: clienteData.nome,
        cpf: clienteData.cpf || undefined,
        email: clienteData.email || undefined,
        itens: carrinho,
        total: calcularTotal(),
        metodoPagamento,
        dataCompra: new Date().toISOString(),
      };

      const response = await fetch("http://localhost:3000/comprasLanches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(compra),
      });

      if (response.ok) {
        toast.success("Compra realizada com sucesso! 🎉");
        setCarrinho([]);
        setClienteData({ nome: "", cpf: "", email: "" });
        setMetodoPagamento("pix");
      } else {
        toast.error("Erro ao processar compra");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0].message);
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-cup-straw" style={{ fontSize: "2.5rem", color: "#ff6b6b" }}></i>
          <h2 className="mb-0" style={{ color: "#fff" }}>Lanchonete</h2>
        </div>
        <button
          className="btn btn-outline-light"
          onClick={() => setMostroCadastro(!mostroCadastro)}
        >
          <i className={`bi bi-chevron-${mostroCadastro ? "up" : "down"}`}></i>{" "}
          {mostroCadastro ? "Ocultar" : "Mostrar"} Cadastro
        </button>
      </div>

      {mostroCadastro && (
        <form onSubmit={handleSubmit} className="card p-4 mb-4" style={{ backgroundColor: "#2a2a2a", borderColor: "#444" }}>
          <h5 className="mb-3" style={{ color: "#fff" }}>Cadastrar Novo Lanche</h5>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label" style={{ color: "#fff" }}>Nome</label>
              <input
                type="text"
                className={`form-control ${errors.nome ? "is-invalid" : ""}`}
                placeholder="Nome do lanche"
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
            <div className="col-md-3">
              <label className="form-label" style={{ color: "#fff" }}>Descrição</label>
              <input
                type="text"
                className={`form-control ${errors.descricao ? "is-invalid" : ""}`}
                placeholder="Descrição"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                style={{ backgroundColor: "#1a1a1a", color: "#fff", borderColor: "#444" }}
              />
              {errors.descricao && (
                <div className="invalid-feedback d-block" style={{ color: "#ff6b6b" }}>{errors.descricao}</div>
              )}
            </div>
            <div className="col-md-2">
              <label className="form-label" style={{ color: "#fff" }}>Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                className={`form-control ${errors.valor ? "is-invalid" : ""}`}
                placeholder="0.00"
                value={formData.valor}
                onChange={(e) =>
                  setFormData({ ...formData, valor: e.target.value })
                }
                style={{ backgroundColor: "#1a1a1a", color: "#fff", borderColor: "#444" }}
              />
              {errors.valor && (
                <div className="invalid-feedback d-block" style={{ color: "#ff6b6b" }}>{errors.valor}</div>
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label" style={{ color: "#fff" }}>&nbsp;</label>
              <button type="submit" className="btn btn-primary w-100">
                <i className="bi bi-plus-circle"></i> {editandoId ? "Atualizar" : "Adicionar Lanche"}
              </button>
              {editandoId && (
                <button
                  type="button"
                  onClick={handleCancelar}
                  className="btn btn-secondary w-100 mt-2"
                >
                  <i className="bi bi-x-circle"></i> Cancelar
                </button>
              )}
            </div>
          </div>
        </form>
      )}

      <div className="row">
        {/* Catálogo de Lanches */}
        <div className="col-lg-8">
          <h5 className="mb-3" style={{ color: "#fff" }}>
            <i className="bi bi-shop"></i> Catálogo de Produtos
          </h5>
          <div className="row g-3">
            {lanches.length === 0 ? (
              <div className="col-12">
                <div className="alert alert-info" style={{ backgroundColor: "#1a3a3a", borderColor: "#4a7a7a", color: "#fff" }}>
                  <i className="bi bi-info-circle"></i> Nenhum lanche disponível ainda.
                </div>
              </div>
            ) : (
              lanches.map((lanche) => (
                <div key={lanche.id} className="col-sm-6">
                  <div className="card h-100" style={{ backgroundColor: "#2a2a2a", borderColor: "#ff6b6b", borderWidth: "2px" }}>
                    <div className="card-body">
                      <h5 className="card-title" style={{ color: "#ff6b6b" }}>
                        {lanche.nome}
                      </h5>
                      <p className="card-text" style={{ color: "#aaa" }}>
                        {lanche.descricao}
                      </p>
                      <p style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "bold" }}>
                        R$ {lanche.valor.toFixed(2)}
                      </p>
                    </div>
                    <div className="card-footer" style={{ backgroundColor: "#1a1a1a", borderColor: "#444" }}>
                      <button
                        onClick={() => adicionarAoCarrinho(lanche)}
                        className="btn btn-success w-100"
                      >
                        <i className="bi bi-cart-plus"></i> Comprar
                      </button>
                      <button
                        onClick={() => handleEditar(lanche)}
                        className="btn btn-warning btn-sm w-100 mt-2"
                      >
                        <i className="bi bi-pencil"></i> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(lanche.id)}
                        className="btn btn-danger btn-sm w-100 mt-2"
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

        {/* Carrinho */}
        <div className="col-lg-4">
          <div
            className="card position-sticky"
            style={{ top: "20px", backgroundColor: "#2a2a2a", borderColor: "#ffa500", borderWidth: "2px" }}
          >
            <div className="card-header" style={{ backgroundColor: "#ffa500", color: "#000" }}>
              <h5 className="mb-0">
                <i className="bi bi-cart"></i> Seu Carrinho
              </h5>
            </div>
            <div className="card-body">
              {carrinho.length === 0 ? (
                <p style={{ color: "#999", textAlign: "center" }}>Carrinho vazio</p>
              ) : (
                <>
                  <div style={{ maxHeight: "300px", overflowY: "auto" }} className="mb-3">
                    {carrinho.map((item) => (
                      <div
                        key={item.id}
                        className="d-flex justify-content-between align-items-center mb-2 p-2"
                        style={{ backgroundColor: "#1a1a1a", borderRadius: "4px", borderLeft: "3px solid #ffa500" }}
                      >
                        <div style={{ flex: 1 }}>
                          <p style={{ color: "#fff", marginBottom: "0.25rem", fontSize: "0.9rem" }}>
                            <strong>{item.nome}</strong>
                          </p>
                          <p style={{ color: "#aaa", marginBottom: "0.25rem", fontSize: "0.85rem" }}>
                            R$ {item.valor.toFixed(2)}
                          </p>
                          <div className="d-flex align-items-center gap-1">
                            <button
                              onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
                              className="btn btn-sm btn-secondary"
                              style={{ padding: "2px 6px", fontSize: "0.75rem" }}
                            >
                              −
                            </button>
                            <span style={{ color: "#fff", minWidth: "30px", textAlign: "center", fontSize: "0.9rem" }}>
                              {item.quantidade}
                            </span>
                            <button
                              onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
                              className="btn btn-sm btn-secondary"
                              style={{ padding: "2px 6px", fontSize: "0.75rem" }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ color: "#ffa500", marginBottom: "0.5rem", fontWeight: "bold" }}>
                            R$ {(item.valor * item.quantidade).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removerDoCarrinho(item.id)}
                            className="btn-close btn-close-white"
                          ></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: "2px solid #444", paddingTop: "1rem" }} className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ color: "#fff" }}>Subtotal:</span>
                      <span style={{ color: "#fff" }}>R$ {calcularTotal().toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between" style={{ fontSize: "1.2rem" }}>
                      <strong style={{ color: "#fff" }}>Total:</strong>
                      <strong style={{ color: "#ffa500" }}>R$ {calcularTotal().toFixed(2)}</strong>
                    </div>
                  </div>

                  <div style={{ borderTop: "2px solid #444", paddingTop: "1rem" }} className="mb-3">
                    <h6 style={{ color: "#fff", marginBottom: "1rem" }}>Dados da Compra</h6>
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Seu nome"
                      value={clienteData.nome}
                      onChange={(e) =>
                        setClienteData({ ...clienteData, nome: e.target.value })
                      }
                      style={{ backgroundColor: "#1a1a1a", color: "#fff", borderColor: "#444" }}
                    />
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="CPF (opcional)"
                      value={clienteData.cpf}
                      onChange={(e) =>
                        setClienteData({ ...clienteData, cpf: e.target.value })
                      }
                      style={{ backgroundColor: "#1a1a1a", color: "#fff", borderColor: "#444" }}
                    />
                    <input
                      type="email"
                      className="form-control mb-3"
                      placeholder="Email (opcional)"
                      value={clienteData.email}
                      onChange={(e) =>
                        setClienteData({ ...clienteData, email: e.target.value })
                      }
                      style={{ backgroundColor: "#1a1a1a", color: "#fff", borderColor: "#444" }}
                    />

                    <h6 style={{ color: "#fff", marginBottom: "1rem" }}>Método de Pagamento</h6>
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="pagamento"
                          id="pix"
                          value="pix"
                          checked={metodoPagamento === "pix"}
                          onChange={(e) => setMetodoPagamento(e.target.value as "pix")}
                        />
                        <label className="form-check-label" htmlFor="pix" style={{ color: "#fff" }}>
                          <i className="bi bi-qr-code"></i> PIX
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="pagamento"
                          id="cartao"
                          value="cartao"
                          checked={metodoPagamento === "cartao"}
                          onChange={(e) => setMetodoPagamento(e.target.value as "cartao")}
                        />
                        <label className="form-check-label" htmlFor="cartao" style={{ color: "#fff" }}>
                          <i className="bi bi-credit-card"></i> Cartão
                        </label>
                      </div>
                    </div>

                    {metodoPagamento === "pix" && (
                      <div
                        className="alert alert-info p-2"
                        style={{ backgroundColor: "#1a3a3a", borderColor: "#4a7a7a", color: "#aaa", fontSize: "0.85rem" }}
                      >
                        <i className="bi bi-info-circle"></i> Escaneie o código QR para efetuar o pagamento via PIX
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleFinalizarCompra}
                    className="btn btn-success w-100"
                    style={{ fontSize: "1.1rem", fontWeight: "bold" }}
                  >
                    <i className="bi bi-check-circle"></i> Finalizar Compra
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
