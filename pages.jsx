'use client';
import { useState } from 'react';

export default function AdminPanel({ 
  partidas Iniciais = [], 
  palpitesIniciais = [], 
  onAtualizarPartidas, 
  onAtualizarPalpites 
}) {
  const [partidas, setPartidas] = useState(partidasIniciais);
  const [palpites, setPalpites] = useState(palpitesIniciais);
  
  // Form de Partida
  const [formPartida, setFormPartida] = useState({ id: '', banner: '', timeA: '', timeB: '', dataHora: '', placarA: 0, placarB: 0, encerrada: false });
  const [editando, setEditando] = useState(false);

  const salvarPartida = (e) => {
    e.preventDefault();
    if (editando) {
      const atualizadas = partidas.map(p => p.id === formPartida.id ? formPartida : p);
      setPartidas(atualizadas);
      if(onAtualizarPartidas) onAtualizarPartidas(atualizadas);
      setEditando(false);
    } else {
      const nova = { ...formPartida, id: Date.now().toString() };
      const novasPartidas = [...partidas, nova];
      setPartidas(novasPartidas);
      if(onAtualizarPartidas) onAtualizarPartidas(novasPartidas);
    }
    setFormPartida({ id: '', banner: '', timeA: '', timeB: '', dataHora: '', placarA: 0, placarB: 0, encerrada: false });
  };

  const deletarPartida = (id) => {
    const filtradas = partidas.filter(p => p.id !== id);
    setPartidas(filtradas);
    if(onAtualizarPartidas) onAtualizarPartidas(filtradas);
  };

  const aprovarPalpite = (id) => {
    const atualizados = palpites.map(p => p.id === id ? { ...p, pago: true } : p);
    setPalpites(atualizados);
    if(onAtualizarPalpites) onAtualizarPalpites(atualizados);
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2">Painel Administrativo</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CRUD GERENCIAR PARTIDA */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{editando ? 'Editar Partida' : 'Cadastrar Nova Partida'}</h2>
          <form onSubmit={salvarPartida} className="space-y-4">
            <input type="text" placeholder="URL do Banner/GIF" value={formPartida.banner} onChange={e => setFormPartida({...formPartida, banner: e.target.value})} className="w-full p-2 bg-gray-700 rounded border border-gray-600" required />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Time A" value={formPartida.timeA} onChange={e => setFormPartida({...formPartida, timeA: e.target.value})} className="p-2 bg-gray-700 rounded border border-gray-600" required />
              <input type="text" placeholder="Time B" value={formPartida.timeB} onChange={e => setFormPartida({...formPartida, timeB: e.target.value})} className="p-2 bg-gray-700 rounded border border-gray-600" required />
            </div>
            <input type="datetime-local" value={formPartida.dataHora} onChange={e => setFormPartida({...formPartida, dataHora: e.target.value})} className="w-full p-2 bg-gray-700 rounded border border-gray-600" required />
            
            {editando && (
              <div className="bg-gray-700 p-4 rounded space-y-2">
                <p className="text-sm font-semibold text-yellow-400">Resultado Final (Encerrar Evento):</p>
                <div className="flex items-center gap-4">
                  <label>{formPartida.timeA}:</label>
                  <input type="number" value={formPartida.placarA} onChange={e => setFormPartida({...formPartida, placarA: parseInt(e.target.value)})} className="w-16 p-1 bg-gray-600 text-center rounded" />
                  <label>{formPartida.timeB}:</label>
                  <input type="number" value={formPartida.placarB} onChange={e => setFormPartida({...formPartida, placarB: parseInt(e.target.value)})} className="w-16 p-1 bg-gray-600 text-center rounded" />
                </div>
                <label className="flex items-center gap-2 mt-2">
                  <input type="checkbox" checked={formPartida.encerrada} onChange={e => setFormPartida({...formPartida, encerrada: e.target.checked})} />
                  Finalizar partida e disparar resultados pro Index
                </label>
              </div>
            )}

            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 p-2 rounded font-bold transition">Salvar Partida</button>
          </form>

          {/* LISTA DE PARTIDAS */}
          <div className="mt-6 space-y-2">
            {partidas.map(p => (
              <div key={p.id} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                <div>
                  <p className="font-bold">{p.timeA} x {p.timeB}</p>
                  <p className="text-xs text-gray-400">{p.dataHora} {p.encerrada && `(Encerrada: ${p.placarA}x${p.placarB})`}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setFormPartida(p); setEditando(true); }} className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">Editar</button>
                  <button onClick={() => deletarPartida(p.id)} className="bg-red-600 px-2 py-1 rounded text-xs font-bold">Excluir</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VALIDAÇÃO MANUAL DE PALPITES (PAGAMENTO) */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Aprovação de Palpites (Fila Baseada em Comprovantes)</h2>
          <div className="space-y-3">
            {palpites.filter(p => !p.pago).map(palpite => (
              <div key={palpite.id} className="bg-gray-700 p-4 rounded border-l-4 border-yellow-500 flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">{palpite.nome}</p>
                  <p className="text-sm text-gray-300">Telefone: {palpite.telefone}</p>
                  <p className="text-sm text-green-400 font-mono">Palpite: {palpite.palpiteA} x {palpite.palpiteB}</p>
                </div>
                <button onClick={() => aprovarPalpite(palpite.id)} className="bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded text-sm transition">
                  Confirmar PIX
                </button>
              </div>
            ))}
            {palpites.filter(p => !p.pago).length === 0 && (
              <p className="text-gray-400 text-sm">Nenhum palpite pendente de aprovação financeira.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}