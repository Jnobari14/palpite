const ADMIN_PASSWORD = "pulse2026";

const loginAdmin = document.getElementById("loginAdmin");
const painelAdmin = document.getElementById("painelAdmin");

document.getElementById("entrarAdminBtn").addEventListener("click", () => {
  const senha = document.getElementById("adminSenha").value;

  if (senha !== ADMIN_PASSWORD) {
    alert("Senha incorreta.");
    return;
  }

  loginAdmin.classList.add("hidden");
  painelAdmin.classList.remove("hidden");
  initAdmin();
});

function initAdmin() {
  const config = getConfig();

  document.getElementById("whatsappAdmin").value = config.whatsapp;
  document.getElementById("regrasAdmin").value = config.regras;

  renderAdminJogos();
  renderAdminPalpites();
  renderResumoAdmin();
}

document.getElementById("salvarConfigBtn").addEventListener("click", () => {
  saveConfig({
    whatsapp: document.getElementById("whatsappAdmin").value.trim(),
    regras: document.getElementById("regrasAdmin").value.trim()
  });

  alert("Configurações salvas.");
});

document.getElementById("adicionarJogoBtn").addEventListener("click", () => {
  const jogo = {
    id: crypto.randomUUID(),
    timeA: document.getElementById("timeA").value.trim(),
    bandeiraA: document.getElementById("bandeiraA").value.trim(),
    timeB: document.getElementById("timeB").value.trim(),
    bandeiraB: document.getElementById("bandeiraB").value.trim(),
    data: document.getElementById("dataJogo").value,
    hora: document.getElementById("horaJogo").value,
    valor: Number(document.getElementById("valorPalpite").value || 0),
    finalA: "",
    finalB: "",
    encerrado: false
  };

  if (!jogo.timeA || !jogo.timeB || !jogo.valor) {
    alert("Preencha Time A, Time B e valor do palpite.");
    return;
  }

  const jogos = getJogos();
  jogos.push(jogo);
  saveJogos(jogos);

  document.getElementById("timeA").value = "";
  document.getElementById("bandeiraA").value = "";
  document.getElementById("timeB").value = "";
  document.getElementById("bandeiraB").value = "";
  document.getElementById("dataJogo").value = "";
  document.getElementById("horaJogo").value = "";
  document.getElementById("valorPalpite").value = "";

  renderAdminJogos();
});

function renderAdminJogos() {
  const jogos = getJogos();
  const container = document.getElementById("adminJogosContainer");

  if (!jogos.length) {
    container.innerHTML = `<p class="muted">Nenhum jogo cadastrado.</p>`;
    return;
  }

  container.innerHTML = jogos.map(jogo => `
    <div class="admin-item">
      <div class="teams">
        <div class="team">${renderFlag(jogo.bandeiraA)} <strong>${jogo.timeA}</strong></div>
        <span class="versus">x</span>
        <div class="team">${renderFlag(jogo.bandeiraB)} <strong>${jogo.timeB}</strong></div>
      </div>

      <p>${jogo.data || "Sem data"} às ${jogo.hora || "--:--"} | ${formatMoney(jogo.valor)}</p>

      <div class="score-inputs">
        <input type="number" min="0" value="${jogo.finalA}" placeholder="Final A" data-final-a="${jogo.id}" />
        <span>x</span>
        <input type="number" min="0" value="${jogo.finalB}" placeholder="Final B" data-final-b="${jogo.id}" />
      </div>

      <div class="actions">
        <button class="primary-btn small" onclick="salvarResultado('${jogo.id}')">Confirmar resultado</button>
        <button class="danger-btn small" onclick="removerJogo('${jogo.id}')">Remover</button>
      </div>
    </div>
  `).join("");
}

function salvarResultado(jogoId) {
  const jogos = getJogos();
  const jogo = jogos.find(j => j.id === jogoId);

  jogo.finalA = document.querySelector(`[data-final-a="${jogoId}"]`).value;
  jogo.finalB = document.querySelector(`[data-final-b="${jogoId}"]`).value;

  if (jogo.finalA === "" || jogo.finalB === "") {
    alert("Informe o resultado final completo.");
    return;
  }

  jogo.encerrado = true;
  saveJogos(jogos);

  alert("Resultado confirmado. O index já pode calcular a pontuação.");
  renderAdminJogos();
  renderAdminPalpites();
}

function removerJogo(jogoId) {
  if (!confirm("Remover este jogo?")) return;

  const jogos = getJogos().filter(j => j.id !== jogoId);
  saveJogos(jogos);
  renderAdminJogos();
}

function renderAdminPalpites() {
  const palpites = getPalpites();
  const jogos = getJogos();
  const container = document.getElementById("adminPalpitesContainer");

  if (!palpites.length) {
    container.innerHTML = `<p class="muted">Nenhum palpite recebido.</p>`;
    return;
  }

  container.innerHTML = palpites.map(palpite => {
    const pontos = calcularRanking().find(r => r.telefone === palpite.telefone && r.nome === palpite.nome)?.pontos || 0;

    return `
      <div class="admin-item">
        <h3>${palpite.nome}</h3>
        <p>WhatsApp: ${palpite.telefone}</p>
        <p>Status: <strong>${palpite.validado ? "Validado" : "Pendente"}</strong></p>
        <p>Pontos atuais: <strong>${pontos}</strong></p>

        ${palpite.jogos.map(p => {
          const jogo = jogos.find(j => j.id === p.jogoId);
          if (!jogo) return "";
          return `<p>${jogo.timeA} ${p.golsA} x ${p.golsB} ${jogo.timeB}</p>`;
        }).join("")}

        <div class="actions">
          <button class="primary-btn small" onclick="validarPalpite('${palpite.id}')">Validar</button>
          <button class="danger-btn small" onclick="removerPalpite('${palpite.id}')">Remover</button>
        </div>
      </div>
    `;
  }).join("");

  renderResumoAdmin();
}

function validarPalpite(palpiteId) {
  const palpites = getPalpites();
  const palpite = palpites.find(p => p.id === palpiteId);

  palpite.validado = true;
  savePalpites(palpites);

  renderAdminPalpites();
  renderResumoAdmin();
}

function removerPalpite(palpiteId) {
  if (!confirm("Remover este palpite?")) return;

  const palpites = getPalpites().filter(p => p.id !== palpiteId);
  savePalpites(palpites);

  renderAdminPalpites();
  renderResumoAdmin();
}

function renderResumoAdmin() {
  const resumo = calcularResumoFinanceiro();

  document.getElementById("totalValidado").innerText = formatMoney(resumo.total);
  document.getElementById("premioAdmin").innerText = formatMoney(resumo.premio);
  document.getElementById("casaAdmin").innerText = formatMoney(resumo.casa);
}
