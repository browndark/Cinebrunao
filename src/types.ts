import { z } from "zod";

export const cinemaSchema = z.object({
  nome: z.string().min(1, "Nome do cinema é obrigatório"),
  endereco: z.string().min(1, "Endereço é obrigatório"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
});

export type Cinema = z.infer<typeof cinemaSchema> & { 
  id: string;
  listaSalas?: string[];
  listaFilmes?: string[];
  listaSessao?: string[];
};

export const filmeSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  sinopse: z.string().min(10, "A sinopse deve ter no mínimo 10 caracteres"),
  classificacao: z.string().min(1, "Classificação é obrigatória"),
  duracao: z.number().min(1, "Duração deve ser maior que 0"),
  genero: z.string().min(1, "Gênero é obrigatório"),
  dataEstreia: z.string().min(1, "Data é obrigatória"),
  foto: z.string().optional(),
  cinemaId: z.string().optional(),
});

export type Filme = z.infer<typeof filmeSchema> & { id: string };

export const salaSchema = z.object({
  numero: z.number().min(1, "Número da sala é obrigatório"),
  capacidade: z.number().min(1, "Capacidade deve ser maior que 0"),
  cinemaId: z.string().optional(),
});

export type Sala = z.infer<typeof salaSchema> & { id: string };

export const sessaoSchema = z.object({
  filmeId: z.string().min(1, "Selecione um filme"),
  salaId: z.string().min(1, "Selecione uma sala"),
  dataHora: z.string().refine((data) => new Date(data) >= new Date(), {
    message: "A data da sessão não pode ser retroativa",
  }),
  cinemaId: z.string().optional(),
});

export type Sessao = {
  id: string;
  filmeId: string;
  salaId: string;
  dataHora: string;
  cinemaId?: string;
};

export const ingressoSchema = z.object({
  valorInteira: z.number().min(0, "Valor inteira não pode ser negativo"),
  valorMeia: z.number().min(0, "Valor meia não pode ser negativo"),
  sessaoId: z.string().min(1, "Sessão é obrigatória"),
});

export type Ingresso = z.infer<typeof ingressoSchema> & { id: string };

export const comboSchema = z.object({
  nome: z.string().min(1, "Nome do combo é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  valor: z.number().min(0, "Valor não pode ser negativo"),
});

export type Combo = z.infer<typeof comboSchema> & { id: string };

export const lancheSchema = z.object({
  nome: z.string().min(1, "Nome do lanche é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  valor: z.number().min(0, "Valor não pode ser negativo"),
});

export type Lanche = z.infer<typeof lancheSchema> & { id: string };

export const ingressoComboSchema = z.object({
  ingressoId: z.string().min(1, "Ingresso é obrigatório"),
  comboId: z.string().min(1, "Combo é obrigatório"),
});

export type IngressoCombo = z.infer<typeof ingressoComboSchema> & { id: string };
