# MinistryHub 🗓️⛪

<p align="center">

<img src="https://img.shields.io/badge/Framework-Next.js-black?style=for-the-badge&logo=next.js" alt="Next.js">

<img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">

<img src="https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">

<img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange?style=for-the-badge" alt="Status">

</p>

<h1 align="center">MinistryHub</h1>

<p align="center">
Automação inteligente e gestão estratégica de escalas para ministérios e igrejas.
</p>

---

# 📌 Sobre o projeto

O MinistryHub é uma plataforma web desenvolvida como Trabalho de Conclusão de Curso (TCC) com o objetivo de modernizar a organização interna de igrejas e ministérios.

O projeto centraliza a comunicação entre líderes e voluntários, substituindo processos manuais, como apresentações, planilhas, imagens e mensagens dispersas, por uma solução digital intuitiva e acessível.

A plataforma foi projetada para reduzir erros humanos, agilizar a criação de escalas e facilitar o gerenciamento das equipes.

---

# 🎯 Objetivo

Criar um ambiente centralizado que permita:

- 👥 Gerenciar voluntários;
- ⛪ Organizar ministérios;
- 📅 Criar e visualizar escalas;
- 🔒 Controlar acessos dos usuários;
- ☁️ Centralizar as informações;
- 📱 Disponibilizar uma interface moderna e responsiva.

---

# ⚙️ Como funciona?

O sistema simplifica a criação das escalas através de um fluxo organizado:

1. O usuário realiza o login.
2. O sistema identifica seu perfil.
3. Os voluntários informam suas disponibilidades.
4. Os líderes organizam as escalas.
5. As informações ficam disponíveis para toda a equipe.

---

# 📐 Diagrama 1 - Arquitetura Geral

```mermaid
graph TD

A[Usuário]

B[Interface Next.js + TypeScript]

C[Supabase Auth]

D[Banco de Dados Supabase]

A --> B

B --> C

C --> D

D --> B
```

---

# 📊 Diagrama 2 - Fluxo de Utilização

```mermaid
graph LR

A[Login]

B[Dashboard]

C[Ministérios]

D[Disponibilidades]

E[Escalas]

A --> B

B --> C

C --> D

D --> E
```

---

# 🗄️ Diagrama 3 - Entidade Relacionamento

```mermaid
erDiagram

USUARIO ||--o{ VOLUNTARIO : possui

MINISTERIO ||--o{ ESCALA : possui

VOLUNTARIO ||--o{ ESCALA : participa

USUARIO {

uuid id

string nome

string email

}

VOLUNTARIO {

uuid id

string disponibilidade

}

MINISTERIO {

uuid id

string nome

}

ESCALA {

uuid id

date data

string horario

}
```

---

# 🔄 Diagrama 4 - Fluxo de Criação da Escala

```mermaid
graph TD

A[Início]

B[Selecionar Ministério]

C[Buscar Voluntários]

D[Verificar Disponibilidade]

E[Criar Escala]

F[Publicar Escala]

A --> B

B --> C

C --> D

D --> E

E --> F
```

---

# 🛠️ Tecnologias Utilizadas

### Frontend

- Next.js
- React
- TypeScript

### Banco de Dados

- Supabase

### Ferramentas

- Git
- GitHub
- PNPM

---

# 📂 Estrutura do Projeto

```bash
public/

src/

.gitignore

components.json

next.config.ts

package.json

pnpm-lock.yaml

pnpm-workspace.yaml

postcss.config.mjs

tsconfig.json
```

---

# 🚀 Executando o projeto

Clone o repositório:

```bash
git clone https://github.com/Guilhermbsilva/tcc2026.git
```

Entre na pasta:

```bash
cd tcc2026
```

Instale as dependências:

```bash
pnpm install
```

Execute o projeto:

```bash
pnpm dev
```

Abra no navegador:

```bash
http://localhost:3000
```

---

# 🎓 Projeto Acadêmico

Projeto desenvolvido como Trabalho de Conclusão de Curso (TCC) aplicando conceitos de:

- Engenharia de Software
- Banco de Dados
- Arquitetura de Sistemas
- Desenvolvimento Web
- UX/UI
- Computação em Nuvem

---

# 👨‍💻 Equipe

Projeto desenvolvido pela equipe do TCC 2026.

Davi Tavares

Guilherme Martins

Guilherme Barroso

Vitor Costa

Matheus Forim
