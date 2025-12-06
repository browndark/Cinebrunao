import { z } from 'zod'

export const filmeSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  sinopse: z.string().min(10, 'Sinopse deve ter no mínimo 10 caracteres'),
  classificacao: z.string().min(1, 'Classificação é obrigatória'),
  duracao: z.number().min(1, 'Duração deve ser maior que 0'),
  genero: z.string().min(1, 'Gênero é obrigatório'),
  dataLancamento: z.string().min(1, 'Data de lançamento é obrigatória'),
  dataFinal: z.string().min(1, 'Data final é obrigatória'),
})

export type Filme = z.infer<typeof filmeSchema> & { id?: number }

export const salaSchema = z.object({
  numero: z.number().min(1, 'Número da sala é obrigatório'),
  capacidade: z.number().min(1, 'Capacidade deve ser maior que 0'),
})

export type Sala = z.infer<typeof salaSchema> & { id?: number }

export const sessaoSchema = z.object({
  filmeId: z.number().min(1, 'Filme é obrigatório'),
  salaId: z.number().min(1, 'Sala é obrigatória'),
  data: z.string().min(1, 'Data é obrigatória').refine(
    (data) => new Date(data) > new Date(),
    'Data não pode ser no passado'
  ),
  horario: z.string().min(1, 'Horário é obrigatório'),
})

export type Sessao = z.infer<typeof sessaoSchema> & { id?: number }

export const ingressoSchema = z.object({
  sessaoId: z.number().min(1, 'Sessão é obrigatória'),
  tipo: z.enum(['inteira', 'meia']),
  comprador: z.string().min(1, 'Nome do comprador é obrigatório'),
})

export type Ingresso = z.infer<typeof ingressoSchema> & { id?: number; preco?: number }
