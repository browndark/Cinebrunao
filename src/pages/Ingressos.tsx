import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { type Ingresso, type Sessao, type Filme, type Sala } from "../types";

type IngressoSessao = Sessao & {
  filme: Filme;
  sala: Sala;
};

type CarrinhoItem = {
  sessaoId: string;
  tipo: "Inteira" | "Meia";
  valor: number;
  sessao: IngressoSessao;
};

const pagamentoSchema = z.object({
  nomeCliente: z.string().min(1, "Nome é obrigatório"),
  metodo: z.enum(["cartao", "pix"]),
  cpf: z.string().optional(),
});

export function Ingressos() {
  const [sessoes, setSessoes] = useState<IngressoSessao[]>([]);
  const [ingressos, setIngressos] = useState<Ingresso[]>([]);
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [formPagamento, setFormPagamento] = useState({
    nomeCliente: "",
    metodo: "cartao" as "cartao" | "pix",
    cpf: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessoesRes, ingressosRes, filmesRes, salasRes] =
        await Promise.all([
          fetch("http://localhost:3000/sessoes"),
          fetch("http://localhost:3000/ingressos"),
          fetch("http://localhost:3000/filmes"),
          fetch("http://localhost:3000/salas"),
        ]);

      const sessoesData: Sessao[] = await sessoesRes.json();
      const ingressosData: Ingresso[] = await ingressosRes.json();
      const filmesData: Filme[] = await filmesRes.json();
      const salasData: Sala[] = await salasRes.json();

      const filmesMap = new Map(filmesData.map((f) => [f.id, f]));
      const salasMap = new Map(salasData.map((s) => [s.id, s]));

      const sessoesComDados = sessoesData.map((sessao) => ({
        ...sessao,
        filme: filmesMap.get(sessao.filmeId)!,
        sala: salasMap.get(sessao.salaId)!,
      }));

      setSessoes(sessoesComDados);
      setIngressos(ingressosData);
    } catch (error) {
      toast.error("Erro ao carregar dados");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarAoCarrinho = (sessaoId: string, tipo: "Inteira" | "Meia") => {
    const ingresso = ingressos.find((i) => i.sessaoId === sessaoId);
    if (!ingresso) {
      toast.error("Preços não definidos para esta sessão");
      return;
    }

    const sessao = sessoes.find((s) => s.id === sessaoId);
    if (!sessao) return;

    const valor = tipo === "Inteira" ? ingresso.valorInteira : ingresso.valorMeia;

    setCarrinho([
      ...carrinho,
      {
        sessaoId,
        tipo,
        valor,
        sessao,
      },
    ]);

    toast.success(`${tipo} adicionado ao carrinho! R$ ${valor.toFixed(2)}`);
  };

  const removerDoCarrinho = (index: number) => {
    setCarrinho(carrinho.filter((_, i) => i !== index));
  };

  const total = carrinho.reduce((sum, item) => sum + item.valor, 0);

  const handleFinalizarPagamento = async () => {
    try {
      const dados = pagamentoSchema.parse(formPagamento);
      setErrors({});

      if (carrinho.length === 0) {
        toast.error("Carrinho vazio");
        return;
      }

      // Simular processamento de pagamento
      toast.loading("Processando pagamento...");

      // Aqui você poderia integrar com uma API de pagamento real
      // Por enquanto, vamos salvar como compra realizada

      for (const item of carrinho) {
        await fetch("http://localhost:3000/compras", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nomeCliente: dados.nomeCliente,
            sessaoId: item.sessaoId,
            tipo: item.tipo,
            valor: item.valor,
            metodo: dados.metodo,
            cpf: dados.cpf,
            dataPagamento: new Date().toISOString(),
          }),
        });
      }

      toast.success("Pagamento realizado com sucesso! 🎉");
      setCarrinho([]);
      setFormPagamento({ nomeCliente: "", metodo: "cartao", cpf: "" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
        err.issues.forEach((error) => {
          fieldErrors[error.path[0] as string] = error.message;
        });
        setErrors(fieldErrors);
      }
      toast.error("Erro ao processar pagamento");
    }
  };

  if (loading) {
    return (
      <div className="container text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>🎫 Compra de Ingressos</h2>

      <div className="row">
        {/* Seção de Sessões Disponíveis */}
        <div className="col-md-8">
          <h4 className="mb-3">Sessões Disponíveis</h4>
          <div className="row">
            {sessoes.map((sessao) => {
              const ingresso = ingressos.find((i) => i.sessaoId === sessao.id);
              return (
                <div key={sessao.id} className="col-md-6 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">{sessao.filme.titulo}</h5>
                      <p className="card-text small">
                        <strong>Gênero:</strong> {sessao.filme.genero}
                      </p>
                      <p className="card-text small">
                        <i className="bi bi-door-closed"></i> Sala{" "}
                        {sessao.sala.numero}
                      </p>
                      <p className="card-text small">
                        <i className="bi bi-calendar-event"></i>{" "}
                        {new Date(sessao.dataHora).toLocaleDateString("pt-BR")}{" "}
                        às{" "}
                        {new Date(sessao.dataHora).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      {ingresso ? (
                        <div className="row g-2 mt-3">
                          <div className="col-6">
                            <button
                              onClick={() =>
                                adicionarAoCarrinho(sessao.id, "Inteira")
                              }
                              className="btn btn-success btn-sm w-100"
                            >
                              <i className="bi bi-ticket"></i>
                              <br />
                              Inteira
                              <br />
                              R$ {ingresso.valorInteira.toFixed(2)}
                            </button>
                          </div>
                          <div className="col-6">
                            <button
                              onClick={() =>
                                adicionarAoCarrinho(sessao.id, "Meia")
                              }
                              className="btn btn-info btn-sm w-100"
                            >
                              <i className="bi bi-ticket"></i>
                              <br />
                              Meia
                              <br />
                              R$ {ingresso.valorMeia.toFixed(2)}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="alert alert-warning mb-0 mt-3">
                          <small>Preços não definidos</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seção de Carrinho e Pagamento */}
        <div className="col-md-4">
          <div className="card sticky-top" style={{ top: "20px" }}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-cart"></i> Carrinho ({carrinho.length})
              </h5>
            </div>
            <div className="card-body">
              {carrinho.length === 0 ? (
                <p className="text-muted">Carrinho vazio</p>
              ) : (
                <>
                  <div className="mb-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {carrinho.map((item, index) => (
                      <div key={index} className="border-bottom pb-2 mb-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <strong>{item.sessao.filme.titulo}</strong>
                            <br />
                            <small className="text-muted">
                              {item.tipo} - Sala {item.sessao.sala.numero}
                            </small>
                            <br />
                            <small>
                              {new Date(item.sessao.dataHora).toLocaleString(
                                "pt-BR"
                              )}
                            </small>
                          </div>
                          <div className="text-end">
                            <strong>R$ {item.valor.toFixed(2)}</strong>
                            <br />
                            <button
                              onClick={() => removerDoCarrinho(index)}
                              className="btn btn-sm btn-danger"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-top pt-3 mb-3">
                    <div className="d-flex justify-content-between">
                      <strong>Total:</strong>
                      <strong className="text-success fs-5">
                        R$ {total.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Nome do Cliente</label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.nomeCliente ? "is-invalid" : ""
                      }`}
                      placeholder="Digite seu nome"
                      value={formPagamento.nomeCliente}
                      onChange={(e) =>
                        setFormPagamento({
                          ...formPagamento,
                          nomeCliente: e.target.value,
                        })
                      }
                    />
                    {errors.nomeCliente && (
                      <div className="invalid-feedback d-block">
                        {errors.nomeCliente}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">CPF (opcional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="000.000.000-00"
                      value={formPagamento.cpf}
                      onChange={(e) =>
                        setFormPagamento({
                          ...formPagamento,
                          cpf: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Forma de Pagamento</label>
                    <div className="btn-group w-100" role="group">
                      <input
                        type="radio"
                        className="btn-check"
                        name="metodo"
                        id="cartao"
                        value="cartao"
                        checked={formPagamento.metodo === "cartao"}
                        onChange={(e) =>
                          setFormPagamento({
                            ...formPagamento,
                            metodo: e.target.value as "cartao" | "pix",
                          })
                        }
                      />
                      <label className="btn btn-outline-primary" htmlFor="cartao">
                        <i className="bi bi-credit-card"></i> Cartão
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        name="metodo"
                        id="pix"
                        value="pix"
                        checked={formPagamento.metodo === "pix"}
                        onChange={(e) =>
                          setFormPagamento({
                            ...formPagamento,
                            metodo: e.target.value as "cartao" | "pix",
                          })
                        }
                      />
                      <label className="btn btn-outline-primary" htmlFor="pix">
                        <i className="bi bi-qr-code"></i> PIX
                      </label>
                    </div>
                  </div>

                  {formPagamento.metodo === "pix" && (
                    <div className="alert alert-info mb-3">
                      <small>
                        <strong>QR Code PIX:</strong> Será exibido após confirmar
                        o pagamento
                      </small>
                    </div>
                  )}

                  <button
                    onClick={handleFinalizarPagamento}
                    className="btn btn-success w-100"
                  >
                    <i className="bi bi-check-circle"></i> Finalizar Pagamento
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
