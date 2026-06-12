const abrirPalpiteBtn = document.getElementById("abrirPalpiteBtn");
const formParticipante = document.getElementById("formParticipante");
const continuarBtn = document.getElementById("continuarBtn");
const areaPalpites = document.getElementById("areaPalpites");
const jogosContainer = document.getElementById("jogosContainer");
const continuarPalpitandoBtn = document.getElementById("continuarPalpitandoBtn");
const confirmarPalpiteBtn = document.getElementById("confirmarPalpiteBtn");
const modalConfirmacao = document.getElementById("modalConfirmacao");
const resumoPalpite = document.getElementById("resumoPalpite");
const editarPalpiteBtn = document.getElementById("editarPalpiteBtn");
const enviarWhatsAppBtn = document.getElementById("enviarWhatsAppBtn");
const mensagemSucesso = document.getElementById("mensagemSucesso");

let jogoAtualIndex = 0;
let jogosVisiveis = 1;

function initIndex() {
  const config = getConfig();
  document.getElementById("supportLink").href = `https://wa.me/${onlyNumbers(config.whatsapp)}`;
  document.getElementById("regrasContainer").innerText = config.regras;
  atualizarPremio();
  renderBannerJogos();
  renderRanking();
}
function atualizarPremio() {
  const resumo = calcularResumoFinanceiro();
  document.getElementById("premioValor").innerText = formatMoney(resumo.premio);
}

abrirPalpiteBtn.addEventListener("click", () => {
  formParticipante.classList.remove("hidden");
  formParticipante.scrollIntoView({ behavior: "smooth" });
});

continuarBtn.addEventListener("click", () => {
  const nome = document.getElementById("nomeParticipante").value.trim();
  const telefone = document.getElementById("telefoneParticipante").value.trim();

  if (!nome || !telefone) {
    alert("Preencha nome e telefone para continuar.");
    return;
  }

  const jogos = getJogos();

  if (!jogos.length) {
    alert("Nenhum jogo cadastrado no momento.");
    return;
  }

  areaPalpites.classList.remove("hidden");
  renderJogosPalpite();
  areaPalpites.scrollIntoView({ behavior: "smooth" });
});

continuarPalpitandoBtn.addEventListener("click", () => {
  const jogos = getJogos();

  if (jogosVisiveis < jogos.length) {
    jogosVisiveis++;
    renderJogosPalpite();
  }
});

function renderJogosPalpite() {
  const jogos = getJogos();
  const lista = jogos.slice(0, jogosVisiveis);

  jogosContainer.innerHTML = lista.map(jogo => `
    <div class="game-card" data-jogo-id="${jogo.id}">
      <div class="teams">
        <div class="team">
          ${renderFlag(jogo.bandeiraA)}
          <strong>${jogo.timeA}</strong>
        </div>

        <span class="versus">x</span>

        <div class="team">
          ${renderFlag(jogo.bandeiraB)}
          <strong>${jogo.timeB}</strong>
        </div>
      </div>

      <p class="game-info">${jogo.data || "Data não definida"} às ${jogo.hora || "--:--"}</p>
      <p class="game-info">Valor do palpite: <strong>${formatMoney(jogo.valor)}</strong></p>

      <div class="score-inputs">
        <input type="number" min="0" placeholder="0" class="golsA" />
        <span>x</span>
        <input type="number" min="0" placeholder="0" class="golsB" />
      </div>
    </div>
  `).join("");

  continuarPalpitandoBtn.classList.toggle("hidden", jogosVisiveis >= jogos.length);
}

confirmarPalpiteBtn.addEventListener("click", () => {
  const palpite = coletarPalpite();

  if (!palpite) return;

  resumoPalpite.innerHTML = `
    <p><strong>Nome:</strong> ${palpite.nome}</p>
    <p><strong>Telefone:</strong> ${palpite.telefone}</p>
    <hr>
    ${palpite.jogos.map(j => `
      <p>${j.timeA} ${j.golsA} x ${j.golsB} ${j.timeB}</p>
    `).join("")}
  `;

  modalConfirmacao.classList.remove("hidden");
});

editarPalpiteBtn.addEventListener("click", () => {
  modalConfirmacao.classList.add("hidden");
});

enviarWhatsAppBtn.addEventListener("click", () => {
  const palpite = coletarPalpite();
  if (!palpite) return;

  const palpites = getPalpites();

  const novoPalpite = {
    id: crypto.randomUUID(),
    nome: palpite.nome,
    telefone: palpite.telefone,
    validado: false,
    criadoEm: new Date().toISOString(),
    jogos: palpite.jogos.map(j => ({
      jogoId: j.jogoId,
      golsA: j.golsA,
      golsB: j.golsB
    }))
  };

  palpites.push(novoPalpite);
  savePalpites(palpites);

  const config = getConfig();

  const texto = [
    "PALPITE PREMIADO - PULSE",
    `Nome: ${palpite.nome}`,
    `Telefone: ${palpite.telefone}`,
    "",
    "Palpites:",
    ...palpite.jogos.map(j => `${j.timeA} ${j.golsA} x ${j.golsB} ${j.timeB}`),
    "",
    "Enviarei o comprovante de pagamento para validação."
  ].join("\n");

  window.open(`https://wa.me/${onlyNumbers(config.whatsapp)}?text=${encodeURIComponent(texto)}`, "_blank");

  modalConfirmacao.classList.add("hidden");
  mensagemSucesso.classList.remove("hidden");
  mensagemSucesso.scrollIntoView({ behavior: "smooth" });
});

function coletarPalpite() {
  const nome = document.getElementById("nomeParticipante").value.trim();
  const telefone = document.getElementById("telefoneParticipante").value.trim();

  if (!nome || !telefone) {
    alert("Nome e telefone são obrigatórios.");
    return null;
  }

  const cards = [...document.querySelectorAll(".game-card")];
  const jogos = getJogos();

  const palpitesJogos = cards.map(card => {
    const jogoId = card.dataset.jogoId;
    const jogo = jogos.find(j => j.id === jogoId);
    const golsA = card.querySelector(".golsA").value;
    const golsB = card.querySelector(".golsB").value;

    return {
      jogoId,
      timeA: jogo.timeA,
      timeB: jogo.timeB,
      golsA,
      golsB
    };
  });

  const incompleto = palpitesJogos.some(j => j.golsA === "" || j.golsB === "");

  if (incompleto) {
    alert("Preencha o placar de todos os jogos exibidos.");
    return null;
  }

  return { nome, telefone, jogos: palpitesJogos };
}

function renderRanking() {
  const ranking = calcularRanking();
  const container = document.getElementById("rankingContainer");

  if (!ranking.length) {
    container.innerHTML = `<p class="muted">Nenhum palpite validado ainda.</p>`;
    return;
  }

  container.innerHTML = ranking.map((item, index) => `
    <div class="ranking-item">
      <span>${index + 1}º</span>
      <strong>${item.nome}</strong>
      <b>${item.pontos} pts</b>
    </div>
  `).join("");
}
// Exemplo de como o index.js deve buscar os jogos da nuvem
async function carregarJogosNoIndex() {
  const { data: jogos } = await supabase.from("jogos").select("*");
  // Aqui entra a sua lógica atual que joga os dados dentro do '#jogosContainer'
}
function renderBannerJogos() {
  const jogos = getJogos();
  const track = document.getElementById("bannerJogosTrack");
  const banner = document.getElementById("bannerJogosDia");

  if (!track || !banner) return;

  if (!jogos.length) {
    banner.classList.add("hidden");
    return;
  }

  banner.classList.remove("hidden");

  track.innerHTML = jogos.map(jogo => `
    <div class="carousel-match">
      <div class="carousel-game">
        ${renderFlag(jogo.bandeiraA)}
        <span>${jogo.timeA}</span>
      </div>

      <div class="carousel-vs">x</div>

      <div class="carousel-game">
        ${renderFlag(jogo.bandeiraB)}
        <span>${jogo.timeB}</span>
      </div>
    </div>
  `).join("");
}

initIndex();
