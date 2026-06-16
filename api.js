function atualizarInfoBolao() {
    // Substitua pela URL da sua API ou arquivo JSON no backend
    fetch('https://palpite-five.vercel.app/')
        .then(response => response.json())
        .then(data => {
            // Atualiza a imagem do banner
            document.getElementById('img-banner').src = data.bannerUrl;

            // Atualiza a premiação formatando para moeda local (BRL)
            const valorFormatado = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(data.premiacao);

            document.getElementById('valor-premio').textContent = valorFormatado.replace('R$', '');
        })
        .catch(error => console.error('Erro ao buscar dados:', error));
}

// Atualiza a cada 30 segundos (30000 milissegundos)
setInterval(atualizarInfoBolao, 30000);
// Executa imediatamente ao carregar a página
atualizarInfoBolao();
