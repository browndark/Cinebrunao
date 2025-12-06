# 🎬 CineBrunão! - Sistema de Gestão de Cinema

Sistema web completo de gerenciamento e vendas para a rede de cinemas "CineBrunão!". O projeto implementa cadastro de filmes, gerenciamento de salas, agendamento de sessões, venda de ingressos, gerenciamento de lanches e combos com sistema completo de carrinho de compras e pagamento.

Desenvolvido como atividade prática de **Desenvolvimento Web Frontend** com React, Vite e TypeScript.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** React 19 + Vite 7.2.6 + TypeScript
- **UI/Styling:** Bootstrap 5.3.3 + Bootstrap Icons
- **Validação:** Zod
- **Notificações:** Sonner
- **Backend Simulado:** JSON Server 1.0.0-beta.3
- **HTTP Client:** Fetch API
- **Roteamento:** React Router DOM

---

## 📋 Funcionalidades

### ✅ Gerenciamento de Cinemas (`/cinemas`)
- Cadastro, edição e exclusão de cinemas
- Gestão de salas, filmes e sessões vinculadas ao cinema
- Cards expandíveis mostrando relacionamentos bidirecionais
- Interface com cores de destaque por categoria

### ✅ Gestão de Filmes (`/filmes`)
- Cadastro com foto em base64
- Validação de dados (título, sinopse > 10 caracteres, duração > 0)
- Edição e exclusão com confirmação
- Visualização de sessões relacionadas

### ✅ Gestão de Salas (`/salas`)
- Cadastro com número e capacidade
- Vínculo com cinema (cinemaId)
- Edição e exclusão
- Listagem de sessões agendadas

### ✅ Agendamento de Sessões (`/sessoes`)
- Criação de sessões com filme, sala e data/hora
- Validação de data (não retroativa)
- Vínculo com cinema (cinemaId)
- Definição de preços fixos (R$20 inteira, R$10 meia)
- Botões interativos para venda de ingressos

### ✅ Venda de Ingressos (`/ingressos`)
- **Checkout completo** com 2 colunas:
  - Esquerda: Listagem de sessões com detalhes
  - Direita: Carrinho sticky com resumo
- Sistema de carrinho com add/remove
- Escolha entre Inteira (R$20) e Meia (R$10)
- Dados do cliente (nome obrigatório, CPF e email opcionais)
- Métodos de pagamento: **Cartão** ou **PIX**
- Salva compras em `compras` collection
- Cálculo automático de total

### ✅ Lanchonete (`/lanches`)
- **Catálogo de Lanches:** Cadastro, edição e exclusão
- **Sistema de Compra Integrado:**
  - Cards com preços destacados
  - Carrinho sticky à direita
  - Controle de quantidade (+/−)
  - Dados de cliente
  - Escolha de pagamento (Cartão/PIX)
  - Finalização com salvamento em `comprasLanches`

### ✅ Gerenciamento de Combos (`/combos`)
- Cadastro de combos (nome, descrição, valor)
- Edição e exclusão
- Validação com Zod

### ✅ Navegação
- Navbar responsiva com todas as seções
- Links para Home, Filmes, Salas, Sessões, Ingressos, Cinemas, Lanches e Combos
- Ícones visuais para cada seção

---

## 🛠️ Instalação e Execução

### Pré-requisitos
- **Node.js** 18+ instalado ([Download](https://nodejs.org))
- **Git** instalado ([Download](https://git-scm.com))

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/browndark/Cinebrunao.git
cd Cinebrunao
```

### 2️⃣ Instale as Dependências

```bash
npm install
```

### 3️⃣ Inicie os Servidores

Abra **2 terminais** na pasta do projeto:

**Terminal 1 - Servidor Vite (Frontend):**
```bash
npm run dev
```
- A aplicação estará disponível em: `http://localhost:5500`

**Terminal 2 - JSON Server (API):**
```bash
npm run server
```
- A API estará disponível em: `http://localhost:3000`
- Dados salvos em: `db.json`

### 4️⃣ Acesse a Aplicação

Abra no navegador: **http://localhost:5500**

---

## 📁 Estrutura do Projeto

```
CineBrunao/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx          # Navegação principal
│   │   └── ...
│   ├── pages/
│   │   ├── Home.tsx            # Página inicial
│   │   ├── Filmes.tsx          # Gestão de filmes
│   │   ├── Salas.tsx           # Gestão de salas
│   │   ├── Sessoes.tsx         # Agendamento de sessões
│   │   ├── Ingressos.tsx       # Checkout de ingressos
│   │   ├── Cinemas.tsx         # Gestão de cinemas
│   │   ├── Lanches.tsx         # Lanchonete com compra
│   │   ├── Combos.tsx          # Gestão de combos
│   │   └── ...
│   ├── types.ts                # Definições de tipos (Zod schemas)
│   ├── App.tsx                 # Roteamento principal
│   └── main.tsx                # Ponto de entrada
├── db.json                     # Base de dados JSON
├── package.json                # Dependências
├── vite.config.ts              # Configuração Vite
├── tsconfig.json               # Configuração TypeScript
└── README.md                   # Este arquivo
```

---

## 🗂️ Coleções de Dados (db.json)

O `db.json` contém as seguintes coleções:

```json
{
  "filmes": [],              // Filmes cadastrados
  "salas": [],               // Salas de cinema
  "sessoes": [],             // Sessões agendadas
  "ingressos": [],           // Preços de ingressos por sessão
  "cinemas": [],             // Cinemas cadastrados
  "lanches": [],             // Produtos da lanchonete
  "combos": [],              // Combos disponíveis
  "ingressoCombo": [],       // Relação ingresso-combo
  "compras": [],             // Compras de ingressos
  "comprasLanches": []       // Compras de lanches
}
```

---

## 💾 Scripts NPM

```bash
# Inicia o servidor Vite (desenvolvimento)
npm run dev

# Inicia o JSON Server
npm run server

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint (verifica código)
npm run lint
```

---

## 🎨 Design e Estilo

- **Tema Escuro:** Cores: `#1a1a1a`, `#2a2a2a`, `#444`
- **Destaques:** 
  - 🔴 Vermelho (#ff6b6b) - Cinemas
  - 🟠 Laranja (#ffa500) - Lanches
  - 🔵 Azul (#4a90e2) - Salas
  - 🟢 Verde (#50c878) - Sessões
- **Typography:** Contraste alto para legibilidade
- **Componentes:** Bootstrap 5 com customizações

---

## 📝 Como Usar

### Primeiro Acesso:
1. Acesse a página **Home** para visão geral
2. Vá para **Cinemas** → Crie um novo cinema
3. Vá para **Filmes** → Adicione filmes ao catálogo
4. Vá para **Salas** → Crie salas (vinculadas ao cinema)
5. Vá para **Sessões** → Agende sessões (filme + sala + data/hora)
6. Vá para **Ingressos** → Compre ingressos com carrinho
7. Vá para **Lanches** → Compre produtos com PIX/Cartão

### Sistema de Compras:
- **Ingressos:** Escolha entre Inteira (R$20) e Meia (R$10)
- **Lanches:** Selecione quantidade e itens
- **Pagamento:** Escolha entre PIX (com QR code) ou Cartão
- **Confirmação:** Dados salvos em tempo real

---

## ⚙️ Configuração do Desenvolvedor

### Variáveis de Ambiente (Opcional)

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3000
```

### Porta Customizada do Vite

Edite `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    port: 5500,  // Mude para outra porta se necessário
  },
});
```

---

## 🐛 Troubleshooting

### "Port 5500 already in use"
```bash
# Mude a porta no vite.config.ts ou use:
npm run dev -- --port 3001
```

### "Cannot find module"
```bash
# Limpe cache e reinstale:
rm -rf node_modules package-lock.json
npm install
```

### JSON Server não conecta
```bash
# Verifique se a porta 3000 está livre:
# Windows (PowerShell):
Get-NetTCPConnection -LocalPort 3000

# Mac/Linux:
lsof -i :3000
```

### Dados não persistem
- Verifique se `db.json` tem permissões de escrita
- Certifique-se que JSON Server está rodando (`npm run server`)

---

## 📚 Dependências Principais

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.x.x",
    "bootstrap": "^5.3.3",
    "bootstrap-icons": "^1.x.x",
    "zod": "^3.x.x",
    "sonner": "^1.x.x",
    "date-fns": "^3.x.x"
  },
  "devDependencies": {
    "vite": "^7.2.6",
    "typescript": "^5.x.x",
    "@vitejs/plugin-react": "^4.x.x"
  }
}
```

---

## 🤝 Contribuindo

Para contribuir:
1. Crie uma branch: `git checkout -b minha-feature`
2. Commit: `git commit -m 'Descrição da mudança'`
3. Push: `git push origin minha-feature`
4. Abra um Pull Request

---

## 📞 Suporte

Dúvidas ou problemas? 
- Abra uma issue no repositório
- Verifique a documentação do Vite: [vitejs.dev](https://vitejs.dev)
- Verifique a documentação do React: [react.dev](https://react.dev)

---

## 📄 Licença

Este projeto é fornecido para fins educacionais.

---

## ✨ Créditos

Desenvolvido por **Bruno** para a disciplina de Desenvolvimento Web Frontend.

**Última atualização:** Dezembro 2025