'use client';
import { useState } from 'react';
import { calcularPremio, calcularPontos } from '@/utils/points';

export default function IndexPage({ 
  partidaAtiva = { id: '1', banner: 'https://via.placeholder.com/800x400', timeA: 'Brasil', timeB: 'Argentina', dataHora: '2026-06-20T16:00', placarA: 0, placarB: 0, encerrada: false },
  palpitesGerais = []
}) {
  const [partida, setPartida] = useState(partidaAtiva);
  const [palpites, setPalpites] = useState(palpitesGerais);

  // Modal e Estados do Form
  const [modalAviso, setModalAviso] = useState(false);
  const [formPalpite, setFormPalpite] = useState({ nome: '', telefone: '', palpiteA: 0, palpiteB: 0 });

  const totalValidados = palpites.filter(p => p.pago).length;
  const valorDoPremio = calcularPremio(totalValidados, 10);

  const handlePalpitarSubmit = (e) => {
    e.preventDefault();
    if (!formPalpite.nome || !formPalpite.telefone) return;
    setModalAviso(true);
  };

  const redirecionarWhatsApp = () => {
    setModalAviso(false);
    
    // Configuração da mensagem para o seu WhatsApp Admin
    const numeroAdmin = "5518999999999"; // Substitua pelo seu número completo com DDD
    const textoMensagem = encodeURIComponent(
      `Olá! Segue meu palpite para o jogo:\n\n` +
      `Competidor: ${formPalpite.nome}\n` +
      `Telefone: ${formPalpite.telefone}\n` +
      `Palpite: ${partida.timeA} ${formPalpite.palpiteA} x ${formPalpite.palpiteB} ${partida.timeB}\n\n` +
      `Aguardo a confirmação após o envio do comprovante PIX.`
    );
    
    window.open(`https://wa.me/${numeroAdmin}?text=${textoMensagem}`, '_blank');
  };

  // Processar classificação se a partida estiver encerrada
  const classificacao = palpites
    .filter(p => p.pago)
    .map(p => {
      const resultado = calcularPontos(p.palpiteA, p.palpiteB, partida.placarA, partida.placarB);
      return { ...p, pontos: resultado.pontos, descricao: resultado.descricao };
    })
    .sort((a, b) => b.pontos - a.pontos);

  return (
    <div className="bg-black text-white min-h-screen font-sans">
      
      {/* HEADER */}
      <header className="p-4 max-w-4xl mx-auto flex justify-between items-center border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-yellow-500">Copa do Mundo 2026</h1>
          <span className="text-sm font-semibold text-gray-400">Palpite Premiado Pulse</span>
        </div>
        <a href="https://wa.me/5518999999999" target="_blank" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full text-xs font-bold transition">
          Dúvidas & Suporte
        </a>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* CARD DE PRÊMIO EM DESTAQUE (Sombra Dourada) */}
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-6 rounded-xl text-center shadow-[0_0_25px_rgba(234,179,8,0.4)] text-black">
          <p className="text-xs uppercase tracking-widest font-black opacity-80">Valor do Prêmio Atualizado</p>
          <p className="text-4xl font-black mt-1">R$ {valorDoPremio.toFixed(2)}</p>
          <p className="text-xs mt-2 opacity-70">*Calculado com base nas apostas confirmadas da rodada</p>
        </div>

        {/* BANNER E EVENTO CARD */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg">
          <img src={partida.banner} alt="Banner Evento" className="w-full h-48 object-cover" />
          
          <div className="p-6 text-center">
            <p className="text-xs text-yellow-500 font-bold mb-2 uppercase tracking-wider">
              {new Date(partida.dataHora).toLocaleString('pt-BR')}
            </p>
            
            {/* LINHA DOS TIMES */}
            <div className="flex justify-center items-center gap-8 my-4">
              <div className="text-center w-28">
                <div className="w-12 h-12 bg-gray-800 rounded-full mx-auto mb-2 flex items-center justify-center font-bold">🏳️</div>
                <p className="font-bold text-sm truncate">{partida.timeA}</p>
                {partida.encerrada && <p className="text-2xl font-black mt-1 text-yellow-500">{partida.placarA}</p>}
              </div>
              
              <div className="text-gray-500 font-black text-xl">VS</div>
              
              <div className="text-center w-28">
                <div className="w-12 h-12 bg-gray-800 rounded-full mx-auto mb-2 flex items-center justify-center font-bold">🏳️</div>
                <p className="font-bold text-sm truncate">{partida.timeB}</p>
                {partida.encerrada && <p className="text-2xl font-black mt-1 text-yellow-500">{partida.placarB}</p>}
              </div>
            </div>

            {/* SEÇÃO PALPITAR / STATUS */}
            {!partida.encerrada ? (
              <form onSubmit={handlePalpitarSubmit} className="mt-6 border-t border-gray-800 pt-6 max-w-md mx-auto space-y-4">
                <div className="bg-gray-800 p-2 rounded-lg text-center font-bold text-sm text-yellow-400">
                  <span>Valor por Palpite: R$ 10,00</span>
                </div>

                <div className="flex gap-4 items-center justify-center bg-gray-800 p-3 rounded-lg">
                  <span className="text-xs font-bold text-gray-400">{partida.timeA}</span>
                  <input type="number" min="0" value={formPalpite.palpiteA} onChange={e => setFormPalpite({...formPalpite, palpiteA: e.target.value})} className="w-14 p-1 bg-black text-center text-xl font-bold rounded border border-gray-700" />
                  <span className="text-gray-500">x</span>
                  <input type="number" min="0" value={formPalpite.palpiteB} onChange={e => setFormPalpite({...formPalpite, palpiteB: e.target.value})} className="w-14 p-1 bg-black text-center text-xl font-bold rounded border border-gray-700" />
                  <span className="text-xs font-bold text-gray-400">{partida.timeB}</span>
                </div>

                <input type="text" placeholder="Seu Nome Completo" required value={formPalpite.nome} onChange={e => setFormPalpite({...formPalpite, nome: e.target.value})} className="w-full p-2.5 bg-gray-800 rounded border border-gray-700 text-sm" />
                <input type="tel" placeholder="Seu Telefone / WhatsApp" required value={formPalpite.telefone} onChange={e => setFormPalpite({...formPalpite, telefone: e.target.value})} className="w-full p-2.5 bg-gray-800 rounded border border-gray-700 text-sm" />

                <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black uppercase text-sm py-3 rounded-lg transition tracking-wider">
                  Enviar Palpite Pró-Vidente
                </button>
              </form>
            ) : (
              <div className="mt-4 bg-gray-800 p-3 rounded-lg max-w-sm mx-auto">
                <p className="text-xs font-bold text-red-400 uppercase">Inscrições Encerradas</p>
                <p className="text-sm text-gray-300 mt-1">Partida finalizada e computada.</p>
              </div>
            )}
          </div>
        </div>

        {/* RESULTADO FINAL & PONTUÇÃO (Só exibe com o gatilho de encerrada) */}
        {partida.encerrada && (
          <div className="bg-gray-950 border border-gray-800 p-6 rounded-xl space-y-4">
            <h3 className="text-xl font-black border-l-4 border-yellow-500 pl-2 text-yellow-500 uppercase">Resultado Final & Ganhadores</h3>
            
            <div className="divide-y divide-gray-800">
              {classificacao.map((item, index) => (
                <div key={item.id} className="py-3 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-gray-500 mr-2">#{index + 1}</span>
                    <span className="font-bold text-sm">{item.nome}</span>
                    <p className="text-xs text-gray-400">Aposta realizada: {item.palpiteA} x {item.palpiteB} ({item.descricao})</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-yellow-500 text-black font-black px-2 py-1 rounded text-xs">
                      {item.pontos} Pts
                    </span>
                  </div>
                </div>
              ))}
              {classificacao.length === 0 && (
                <p className="text-sm text-gray-400">Nenhum palpite elegível computado.</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE AVISO (PRE-WHATSAPP) */}
      {modalAviso && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl max-w-sm w-full text-center space-y-4">
            <p className="text-amber-500 font-black text-lg uppercase tracking-wide">⚠️ Atenção</p>
            <p className="text-sm text-gray-300">
              Envie o comprovante de pagamento no WhatsApp para validar seu palpite até **5 minutos antes** do início da partida.
            </p>
            <button onClick={redirecionarWhatsApp} className="w-full bg-green-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-green-700 transition">
              Entendi, Ir para o WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="max-w-4xl mx-auto border-t border-gray-800 mt-12 p-6 flex flex-col sm:flex-row gap-4 justify-between items-center text-xs text-gray-500">
        <p>© 2026 Pulse Play. Todos os direitos reservados.</p>
        <div className="flex gap-4">
          <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="hover:text-white font-semibold transition">Compartilhar App 🔗</button>
          <a href="https://wa.me/5518999999999" target="_blank" className="hover:text-white font-semibold transition">Suporte Técnico 💬</a>
        </div>
      </footer>
    </div>
  );
}