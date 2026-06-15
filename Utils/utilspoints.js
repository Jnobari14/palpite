// utils/points.js

export function calcularPontos(palpiteA, palpiteB, resultadoA, resultadoB) {
  const pA = parseInt(palpiteA);
  const pB = parseInt(palpiteB);
  const rA = parseInt(resultadoA);
  const rB = parseInt(resultadoB);

  // 25 Pontos: Placar Exato
  if (pA === rA && pB === rB) {
    return { pontos: 25, descricao: "Placar Exato (25 pts)" };
  }

  const termoPalpite = pA > pB ? 'A' : pA < pB ? 'B' : 'E';
  const termoResultado = rA > rB ? 'A' : rA < rB ? 'B' : 'E';

  // Acertou o vencedor ou empate
  if (termoPalpite === termoResultado) {
    const saldoPalpite = pA - pB;
    const saldoResultado = rA - rB;

    // 15 Pontos: Vencedor + Saldo/Empate
    if (saldoPalpite === saldoResultado) {
      return { pontos: 15, descricao: "Acertou Vencedor e Saldo (15 pts)" };
    }
    
    // 10 Pontos: Apenas o Vencedor
    return { pontos: 10, descricao: "Acertou apenas o Vencedor (10 pts)" };
  }

  return { pontos: 0, descricao: "Não pontuou (0 pts)" };
}

export function calcularPremio(totalPalpitesValidados, valorInscricao = 10) {
  const arrecadado = totalPalpitesValidados * valorInscricao;
  const premioMisto = arrecadado * 0.85; // 15% fica para a casa
  return premioMisto;
}