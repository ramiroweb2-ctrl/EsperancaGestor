
import "./style.css";

const app = document.querySelector("#app");

const API = "/api";

const secoes = {
  beneficiarios: {
    titulo: "Beneficiários",
    singular: "Beneficiário",
    icone: "👥",
    campos: [
      { nome: "nome", label: "Nome completo", obrigatorio: true },
      { nome: "cpf", label: "CPF" },
      { nome: "telefone", label: "Telefone" },
      { nome: "nascimento", label: "Data de nascimento", tipo: "date" },
      { nome: "endereco", label: "Endereço" },
      { nome: "observacoes", label: "Observações", tipo: "textarea" }
    ]
  },
  doadores: {
    titulo: "Doadores",
    singular: "Doador",
    icone: "💚",
    campos: [
      { nome: "nome", label: "Nome completo", obrigatorio: true },
      { nome: "telefone", label: "Telefone" },
      { nome: "email", label: "E-mail", tipo: "email" },
      { nome: "tipo", label: "Tipo de doador", tipo: "select", opcoes: ["Pessoa física", "Empresa"] },
      { nome: "observacoes", label: "Observações", tipo: "textarea" }
    ]
  },
  voluntarios: {
    titulo: "Voluntários",
    singular: "Voluntário",
    icone: "🤝",
    campos: [
      { nome: "nome", label: "Nome completo", obrigatorio: true },
      { nome: "telefone", label: "Telefone" },
      { nome: "email", label: "E-mail", tipo: "email" },
      { nome: "disponibilidade", label: "Disponibilidade" },
      { nome: "atividade", label: "Área de atuação" }
    ]
  },
  entregas: {
    titulo: "Entregas",
    singular: "Entrega",
    icone: "🚚",
    campos: [
      { nome: "beneficiario", label: "Beneficiário", obrigatorio: true },
      { nome: "descricao", label: "Descrição do item", obrigatorio: true },
      { nome: "quantidade", label: "Quantidade", tipo: "number" },
      { nome: "data", label: "Data da entrega", tipo: "date" },
      { nome: "status", label: "Situação", tipo: "select", opcoes: ["Pendente", "Entregue"] },
      { nome: "observacoes", label: "Observações", tipo: "textarea" }
    ]
  },
  doacoes: {
    titulo: "Doações",
    singular: "Doação",
    icone: "📦",
    campos: [
      { nome: "descricao", label: "Descrição da doação", obrigatorio: true },
      { nome: "doador", label: "Nome do doador" },
      { nome: "tipo", label: "Tipo de doação", tipo: "select", opcoes: ["Dinheiro", "Alimentos", "Roupas", "Higiene", "Outros"] },
      { nome: "valor", label: "Valor (R$)", tipo: "number" },
      { nome: "data", label: "Data da doação", tipo: "date" }
    ]
  }
};

let secaoAtual = "inicio";
let registros = {};
let termoBusca = "";
let registroEditando = null;

function escapar(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[caractere]);
}

async function requisicao(url, opcoes = {}) {
  const resposta = await fetch(`${API}${url}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...opcoes.headers
    }
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || "Não foi possível realizar a operação.");
  }

  return dados;
}

async function carregarDados() {
  for (const chave of Object.keys(secoes)) {
    registros[chave] = await requisicao(`/${chave}`);
  }
}

function totalRegistros(chave) {
  return registros[chave]?.length || 0;
}

function layout() {
  app.innerHTML = `
    <div class="dashboard">
      <aside class="sidebar">
        <div class="logo">
          <div class="logo-mark">RS</div>
          <div>
            <strong>EsperançaGestor</strong>
            <span>REDE SOLIDÁRIA</span>
          </div>
        </div>

        <p class="menu-label">MENU PRINCIPAL</p>

        <nav class="navigation">
          <button class="nav-item ${secaoAtual === "inicio" ? "active" : ""}" data-section="inicio">
            <span>▦</span> Visão geral
          </button>

          ${Object.entries(secoes).map(([chave, item]) => `
            <button class="nav-item ${secaoAtual === chave ? "active" : ""}" data-section="${chave}">
              <span>${item.icone}</span> ${item.titulo}
              <small>${totalRegistros(chave)}</small>
            </button>
          `).join("")}
        </nav>

        <div class="sidebar-footer">
          <span class="online-dot"></span>
          Sistema conectado
          <small>Versão 1.0</small>
        </div>
      </aside>

      <main class="main-content">
        <header class="topbar">
          <div>
            <span class="top-label">GESTÃO SOCIAL</span>
            <h1>${secaoAtual === "inicio" ? "Visão geral" : secoes[secaoAtual].titulo}</h1>
          </div>
          <div class="user-area">
            <span class="user-avatar">RS</span>
            <div>
              <strong>Administrador</strong>
              <small>Rede Solidária Esperança</small>
            </div>
          </div>
        </header>

        <section id="content-area">
          ${secaoAtual === "inicio" ? telaInicial() : telaColecao(secaoAtual)}
        </section>
      </main>
    </div>
  `;

  document.querySelectorAll("[data-section]").forEach(botao => {
    botao.addEventListener("click", () => {
      secaoAtual = botao.dataset.section;
      termoBusca = "";
      registroEditando = null;
      layout();
    });
  });

  if (secaoAtual !== "inicio") {
    configurarColecao();
  }
  const relatorio = document.querySelector("#relatorio-geral");
  if (relatorio) relatorio.addEventListener("click", imprimirRelatorio);
}

function telaInicial() {
  const total = Object.keys(secoes).reduce(
    (soma, chave) => soma + totalRegistros(chave), 0
  );

  return `
    <div class="welcome">
      <div>
        <span class="welcome-tag">PAINEL ADMINISTRATIVO</span>
        <h2>Bem-vindo ao EsperançaGestor!</h2>
        <p>Organização, cuidado e transparência a serviço da solidariedade.</p>
      </div>
      <div class="welcome-icon">💚</div>
    </div>

    <div class="stats-grid">
      <article class="stat-card">
        <span>👥</span>
        <p>Beneficiários</p>
        <strong>${totalRegistros("beneficiarios")}</strong>
        <small>Pessoas cadastradas</small>
      </article>
      <article class="stat-card">
        <span>💚</span>
        <p>Doadores</p>
        <strong>${totalRegistros("doadores")}</strong>
        <small>Doadores cadastrados</small>
      </article>
      <article class="stat-card">
        <span>🤝</span>
        <p>Voluntários</p>
        <strong>${totalRegistros("voluntarios")}</strong>
        <small>Voluntários cadastrados</small>
      </article>
      <article class="stat-card">
        <span>📦</span>
        <p>Doações</p>
        <strong>${totalRegistros("doacoes")}</strong>
        <small>Registros de doações</small>
      </article>
    </div>

    <section class="panel">
      <div class="panel-heading">
        <div>
          <h3>Atalhos do sistema</h3>
          <p>Escolha um módulo para começar.</p>
        </div>
      </div>
      <button class="secondary-button" id="relatorio-geral" style="margin:0 0 18px">Imprimir relatório geral</button>
      <div class="shortcut-grid">
        ${Object.entries(secoes).map(([chave, item]) => `
          <button class="shortcut" data-section="${chave}">
            <span>${item.icone}</span>
            <strong>${item.titulo}</strong>
            <small>Acessar módulo →</small>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function telaColecao(chave) {
  const secao = secoes[chave];

  return `
    <section class="panel">
      <div class="panel-heading">
        <div>
          <h3>Gerenciar ${secao.titulo.toLowerCase()}</h3>
          <p>Cadastre, consulte, edite e exclua registros.</p>
        </div>
        <button class="primary-button" id="novo-registro">+ Novo cadastro</button>
      </div>

      <input
        class="search-input"
        id="busca"
        type="search"
        placeholder="Pesquisar registros..."
        value="${escapar(termoBusca)}"
      >

      <div id="form-area"></div>
      <div id="lista-registros"></div>
    </section>
  `;
}

function campoHTML(campo, valor = "") {
  const nome = escapar(campo.nome);
  const label = escapar(campo.label);
  const obrigatorio = campo.obrigatorio ? "required" : "";
  const conteudo = escapar(valor);

  if (campo.tipo === "textarea") {
    return `
      <label class="form-field full">
        ${label}
        <textarea name="${nome}" ${obrigatorio}>${conteudo}</textarea>
      </label>
    `;
  }

  if (campo.tipo === "select") {
    return `
      <label class="form-field">
        ${label}
        <select name="${nome}">
          <option value="">Selecione</option>
          ${campo.opcoes.map(opcao => `
            <option value="${escapar(opcao)}" ${valor === opcao ? "selected" : ""}>
              ${escapar(opcao)}
            </option>
          `).join("")}
        </select>
      </label>
    `;
  }

  return `
    <label class="form-field">
      ${label}
      <input
        type="${campo.tipo || "text"}"
        name="${nome}"
        value="${conteudo}"
        ${obrigatorio}
      >
    </label>
  `;
}

function mostrarFormulario(chave, registro = null) {
  const secao = secoes[chave];
  const area = document.querySelector("#form-area");

  area.innerHTML = `
    <form id="cadastro-form" class="register-form">
      <h3>${registro ? "Editar" : "Novo"} ${secao.singular}</h3>

      <div class="form-grid">
        ${secao.campos.map(campo =>
          campoHTML(campo, registro?.[campo.nome] || "")
        ).join("")}
      </div>

      <div class="form-actions">
        <button type="button" class="secondary-button" id="cancelar">Cancelar</button>
        <button type="submit" class="primary-button">
          ${registro ? "Salvar alterações" : "Salvar cadastro"}
        </button>
      </div>
    </form>
  `;

  document.querySelector("#cancelar").addEventListener("click", () => {
    area.innerHTML = "";
    registroEditando = null;
  });

  document.querySelector("#cadastro-form").addEventListener("submit", salvarRegistro);
}

function cpfValido(valor) {
  const cpf = String(valor).replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
  let digito = (soma * 10) % 11; if (digito === 10) digito = 0;
  if (digito !== Number(cpf[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
  digito = (soma * 10) % 11; if (digito === 10) digito = 0;
  return digito === Number(cpf[10]);
}

function imprimirRelatorio() {
  const linhas = Object.entries(secoes).map(([chave, secao]) =>
    `<h2>${secao.titulo}: ${(registros[chave] || []).length}</h2><ul>` +
    (registros[chave] || []).map(r => `<li>${escapar(r.nome || r.descricao || r.beneficiario || "Registro")} — ${escapar(r.data || "")}</li>`).join("") + `</ul>`
  ).join("");
  const janela = window.open("", "_blank");
  if (!janela) { alert("Permita pop-ups para imprimir o relatório."); return; }
  janela.document.write(`<html><head><title>Relatório - EsperançaGestor</title><style>body{font:14px Arial;padding:30px;color:#223}h1{color:#27634b}h2{margin-top:24px}li{margin:6px 0}</style></head><body><h1>ONG Rede Solidária Esperança</h1><p>Relatório geral — ${new Date().toLocaleDateString("pt-BR")}</p>${linhas}<p><small>Dados demonstrativos ou registros inseridos localmente.</small></p></body></html>`);
  janela.document.close(); janela.focus(); janela.print();
}

async function salvarRegistro(evento) {
  evento.preventDefault();

  const formulario = evento.currentTarget;
  const dados = Object.fromEntries(new FormData(formulario).entries());
  if (secaoAtual === "beneficiarios" && dados.cpf && !cpfValido(dados.cpf)) {
    alert("CPF inválido. Confira os números digitados.");
    return;
  }

  try {
    const id = registroEditando?.id;

    if (id) {
      await requisicao(`/${secaoAtual}/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(dados)
      });
    } else {
      await requisicao(`/${secaoAtual}`, {
        method: "POST",
        body: JSON.stringify(dados)
      });
    }

    alert("Cadastro salvo com sucesso!");
    registroEditando = null;
    await atualizar();
  } catch (erro) {
    alert(erro.message);
  }
}

function desenharLista(chave) {
  const area = document.querySelector("#lista-registros");
  if (!area) return;

  const secao = secoes[chave];
  const termo = termoBusca.toLowerCase();

  const lista = (registros[chave] || []).filter(registro =>
    Object.values(registro).some(valor =>
      String(valor ?? "").toLowerCase().includes(termo)
    )
  );

  if (!lista.length) {
    area.innerHTML = `
      <div class="empty-state">
        <span>${secao.icone}</span>
        <h3>Nenhum registro encontrado</h3>
        <p>Comece adicionando um novo cadastro.</p>
      </div>
    `;
    return;
  }

  area.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nome / Descrição</th>
            <th>Informações</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${lista.map(registro => {
            const principal = registro.nome || registro.descricao || "Sem identificação";
            const campos = secao.campos.filter(c => c.nome !== "nome" && c.nome !== "descricao");
            const detalhes = campos
              .map(c => registro[c.nome] ? `${c.label}: ${registro[c.nome]}` : "")
              .filter(Boolean)
              .join(" • ");

            return `
              <tr>
                <td><strong>${escapar(principal)}</strong></td>
                <td>${escapar(detalhes || "Sem informações adicionais")}</td>
                <td>
                  <div class="table-actions">
                    <button class="edit-button" data-edit="${escapar(registro.id)}">Editar</button>
                    <button class="delete-button" data-delete="${escapar(registro.id)}">Excluir</button>
                  </div>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
    <p class="record-count">${lista.length} registro(s) encontrado(s).</p>
  `;

  area.querySelectorAll("[data-edit]").forEach(botao => {
    botao.addEventListener("click", () => {
      const registro = registros[chave].find(item => item.id === botao.dataset.edit);
      registroEditando = registro;
      mostrarFormulario(chave, registro);
      document.querySelector("#form-area").scrollIntoView({ behavior: "smooth" });
    });
  });

  area.querySelectorAll("[data-delete]").forEach(botao => {
    botao.addEventListener("click", async () => {
      if (!confirm("Tem certeza de que deseja excluir este registro?")) return;

      try {
        await requisicao(`/${chave}/${encodeURIComponent(botao.dataset.delete)}`, {
          method: "DELETE"
        });
        alert("Registro excluído com sucesso!");
        await atualizar();
      } catch (erro) {
        alert(erro.message);
      }
    });
  });
}

function configurarColecao() {
  document.querySelector("#novo-registro").addEventListener("click", () => {
    registroEditando = null;
    mostrarFormulario(secaoAtual);
  });

  document.querySelector("#busca").addEventListener("input", evento => {
    termoBusca = evento.target.value;
    desenharLista(secaoAtual);
  });

  desenharLista(secaoAtual);
}

async function atualizar() {
  try {
    await carregarDados();
    layout();
  } catch (erro) {
    app.innerHTML = `
      <div class="error-screen">
        <h2>Não foi possível carregar o sistema.</h2>
        <p>${escapar(erro.message)}</p>
        <button id="tentar-novamente" class="primary-button">Tentar novamente</button>
      </div>
    `;

    document.querySelector("#tentar-novamente").addEventListener("click", atualizar);
  }
}

atualizar();
