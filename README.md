# 📧 Gerador de Assinatura de E-mail

![PHP](https://img.shields.io/badge/PHP-7.4+-777BB4?logo=php&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.3-7952B3?logo=bootstrap&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E?logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/Licença-Proprietária-red)

Ferramenta web profissional para criação de assinaturas de e-mail corporativas com **4 templates**, live preview em tempo real, sistema de paletas de cores, upload de imagens, guia de instalação integrado e painel administrativo completo.

---

## ✨ Features

- 🎨 **4 Templates** — Clássico, Horizontal, Minimalista, Corporate Dark
- 🎭 **Sistema de Paletas** — 5 paletas pré-definidas + cores customizáveis
- 👁️ **Live Preview** — Atualização em tempo real com debounce (400ms)
- 📋 **Copiar & Colar** — Cópia direta para clipboard compatível com email clients
- 📖 **Guia de Instalação** — Modal com instruções para Gmail, Outlook, Apple Mail
- 📤 **Upload de Imagens** — Drag & drop para foto e logo com validação
- 🖼️ **Ícones Flaticon CDN** — PNGs universalmente compatíveis com email clients
- 🌙 **Dark Theme** — Glassmorphism com gradients animados
- 📱 **Responsivo** — Layout adaptável para mobile e desktop
- 🔔 **Toast Notifications** — Feedback visual animado (sucesso/erro/info)
- 🛡️ **Painel Admin** — Dashboard de métricas, galeria de uploads, logs e configurações

---

## 📸 Templates

| Template | Estilo | Foto | Logo | Ícones |
|----------|--------|:----:|:----:|:------:|
| **Modelo 1** — Clássico | Divisor vertical, Times New Roman | 150px | Abaixo da foto | ✅ Email, Tel, Endereço, Empresa |
| **Modelo 2** — Horizontal | Gradient header, cards | 70px circular | Rodapé direito | ✅ Todos + Website |
| **Modelo 3** — Minimalista | Tipografia leve, gradiente sutil | 50px circular | Rodapé | 🏢 Empresa |
| **Modelo 4** — Corporate Dark | Fundo escuro, borda gradiente | 70px circular | Abaixo do contato | ✅ Todos com highlight |

**Todos incluem:** disclaimer de confidencialidade, links clicáveis (email, telefone, Google Maps), redes sociais (LinkedIn, Instagram, Twitter/X).

---

## 🏗️ Arquitetura

```
assinatura/
├── index.html              # Frontend — formulário e preview
├── style.css               # Design system (CSS custom properties)
├── script.js               # Lógica (templates, paletas, live preview)
├── upload.php              # Backend de upload com validação
├── htaccess                # Config Apache (cache, GZIP, segurança)
├── stats.json              # Estatísticas de uso (auto-gerado)
│
├── img/                    # Assets estáticos
│   ├── logo-nova.webp      # Logo Rugemtugem
│   └── modelo[1-3].png     # Previews dos templates
│
├── uploads/                # Fotos e logos uploadados
│   └── index.html          # Redirect de segurança
│
└── admin/                  # 🛡️ Painel Command Center
    ├── admin.php            # Router (login + sidebar layout)
    ├── helpers.php          # Utilitários (auth, logging, config)
    ├── assets/
    │   ├── admin.css        # Design system do admin (800+ linhas)
    │   └── admin.js         # Client-side logic (500+ linhas)
    ├── api/
    │   ├── stats.php        # Métricas e ações (GET/POST)
    │   ├── delete.php       # Deleção em lote segura
    │   └── export.php       # CSV + ZIP backup
    ├── sections/
    │   ├── dashboard.php    # KPIs, chart, saúde do sistema
    │   ├── uploads.php      # Galeria com filtros e preview
    │   ├── logs.php         # Auditoria com filtros
    │   └── settings.php     # Segurança, config, danger zone
    └── data/                # Auto-gerado
        ├── config.json      # Configuração centralizada
        ├── activity.log     # Log JSONL rotativo
        └── .htaccess        # Bloqueia acesso HTTP
```

---

## 🚀 Setup

### Pré-requisitos
- **Apache** com **PHP 7.4+** (XAMPP, WAMP, MAMP, ou similar)
- Extensões PHP: `json`, `session`, `zip` (para backups)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/rugemtugem/gerador-de-assinaturas.git

# Mova para o diretório do servidor web
cp -r gerador-de-assinaturas/ /caminho/do/htdocs/

# Garanta permissão de escrita no diretório de uploads
chmod 755 uploads/

# (Opcional) Ative cache e segurança no Apache
cp htaccess .htaccess
```

### Acesso

| Recurso | URL |
|---------|-----|
| **Gerador** | `http://localhost/assinatura/` |
| **Admin** | `http://localhost/assinatura/admin/admin.php` |
| **Senha padrão** | Definida em `admin/data/config.json` (brcypt hash) |

> **Nota:** Na primeira execução, `admin/data/config.json` é gerado automaticamente com a senha padrão. Altere imediatamente via **Admin → Configurações → Segurança**.

---

## 🎨 Design System

### Paletas de Cores

| Paleta | Primária | Secundária |
|--------|----------|------------|
| **Rugemtugem** | `#992A2B` | `#EE6936` |
| **Ocean** | `#0077B6` | `#00B4D8` |
| **Forest** | `#2D6A4F` | `#52B788` |
| **Midnight** | `#7B2CBF` | `#C77DFF` |
| **Sunset** | `#E63946` | `#F4A261` |
| **Custom** | 🎨 Color picker | 🎨 Color picker |

### Ícones de Contato (Flaticon CDN)

Os ícones de contato e redes sociais utilizam **PNGs do CDN Flaticon** — formato universalmente suportado por todos os clientes de email (Gmail, Outlook, Apple Mail, Thunderbird).

| Ícone | Uso | Flaticon ID |
|-------|-----|-------------|
| 📧 Email | Contato | `732/732200` |
| 📞 Telefone | Contato | `724/724664` |
| 📍 Localização | Endereço | `684/684908` |
| 🌐 Website | URL | `3687/3687554` |
| 🏢 Empresa | Nome da empresa | `4514/4514940` |
| LinkedIn | Rede social | `174/174857` |
| Instagram | Rede social | `174/174855` |
| Twitter/X | Rede social | `733/733579` |

---

## 🛡️ Painel Admin — Command Center

O painel administrativo foi construído como um **Command Center** com tema escuro e arquitetura modular.

### Módulos

| Módulo | Descrição |
|--------|-----------|
| **Dashboard** | 4 KPIs (total, fotos, logos, storage), chart SVG 7 dias, saúde do sistema |
| **Uploads** | Galeria com grid, filtros (tipo/busca/sort), preview modal, deleção em lote |
| **Logs** | Auditoria JSONL com filtros por ação/status/IP, export CSV |
| **Settings** | Password bcrypt, limites de upload, modo manutenção, danger zone |
| **Export** | CSV (UTF-8 BOM para Excel BR), ZIP backup completo |

### Segurança

- 🔐 **Bcrypt** para hash de senhas
- ⏱️ **Session timeout** configurável (30min–2h)
- 🛑 **Path traversal protection** via `basename()` + `realpath()`
- 🔒 **API auth guard** — todos os endpoints verificam sessão
- 📁 **Data directory** protegido por `.htaccess`
- 🧹 **XSS prevention** — `htmlspecialchars()` em todas as saídas

---

## 🔧 Stack Técnica

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Bootstrap** | 5.3.3 | Grid, componentes, modal |
| **Bootstrap Icons** | 1.11.3 | Ícones da interface |
| **Google Fonts** (Inter) | — | Tipografia do formulário |
| **Flaticon CDN** | — | Ícones nos templates de email |
| **PHP** | 7.4+ | Upload, admin, APIs |
| **Vanilla JS** | ES6+ | Toda a lógica frontend |

---

## 📝 Licença

© 2026 [Rugemtugem](https://rugemtugem.dev) — Todos os direitos reservados.

Desenvolvido por **Fábio Soares** — [LinkedIn](https://www.linkedin.com/in/fabio-soares-dev/) · [GitHub](https://github.com/rugemtugem)
