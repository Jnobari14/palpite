const STORAGE_KEYS = {
  jogos: "pulse_jogos",
  palpites: "pulse_palpites",
  config: "pulse_config"
};

const DEFAULT_REGRAS = `
Evento recreativo realizado entre amigos e clientes da Pulse.

Pontuação:
25 pontos: placar exato.
15 pontos: vencedor/empate + saldo correto.
10 pontos: apenas vencedor/empate.
0 pontos: errou vencedor/empate.

O palpite só será validado após envio do comprovante via WhatsApp.
`.trim();

function getData(key, fallback) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getJogos() {
  return getData(STORAGE_KEYS.jogos, []);
}

function saveJogos(jogos) {
  setData(STORAGE_KEYS.jogos, jogos);
}

function getPalpites() {
  return getData(STORAGE_KEYS.palpites, []);
}

function savePalpites(palpites) {
  setData(STORAGE_KEYS.palpites, palpites);
}

function getConfig() {
  return getData(STORAGE_KEYS.config, {
    whatsapp: "5500000000000",
    regras: DEFAULT_REGRAS
  });
}

function saveConfig(config) {
  setData(STORAGE_KEYS.config, config);
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function onlyNumbers(value) {
  return String(value || "").replace(/\D/g, "");
}

function calcularPontuacao(palpiteA, palpiteB, finalA, finalB) {
  const pA = Number(palpiteA);
  const pB = Number(palpiteB);
  const fA = Number(finalA);
  const fB = Number(finalB);

  if ([pA, pB, fA, fB].some(Number.isNaN)) return 0;

  if (pA === fA && pB === fB) return 25;

  const palpiteSaldo = pA - pB;
  const finalSaldo = fA - fB;

  const palpiteResultado = Math.sign(palpiteSaldo);
  const finalResultado = Math.sign(finalSaldo);

  if (palpiteResultado === finalResultado && palpiteSaldo === finalSaldo) return 15;
  if (palpiteResultado === finalResultado) return 10;

  return 0;
}

function calcularResumoFinanceiro() {
  const jogos = getJogos();
  const palpites = getPalpites().filter(p => p.validado);

  let total = 0;

  palpites.forEach(palpite => {
    palpite.jogos.forEach(jogoPalpite => {
      const jogo = jogos.find(j => j.id === jogoPalpite.jogoId);
      if (jogo) {
        total += Number(jogo.valor || 0) * 0.9;
      }
    });
  });

  return {
    total,
    premio: total,
    casa: total / 9
  };
}
function calcularRanking() {
  const jogos = getJogos();
  const palpites = getPalpites().filter(p => p.validado);

  return palpites.map(participante => {
    let pontos = 0;

    participante.jogos.forEach(palpiteJogo => {
      const jogo = jogos.find(j => j.id === palpiteJogo.jogoId);

      if (!jogo || jogo.finalA === "" || jogo.finalB === "" || jogo.finalA == null || jogo.finalB == null) {
        return;
      }

      pontos += calcularPontuacao(
        palpiteJogo.golsA,
        palpiteJogo.golsB,
        jogo.finalA,
        jogo.finalB
      );
    });

    return {
      nome: participante.nome,
      telefone: participante.telefone,
      pontos
    };
  }).sort((a, b) => b.pontos - a.pontos);
}

function renderFlag(value) {
  if (!value) return "🏳️";
  if (value.startsWith("http")) {
    return `<img class="flag-img" src="${value}" alt="Bandeira">`;
  }
  return `<span class="flag-emoji">${value}</span>`;
}
