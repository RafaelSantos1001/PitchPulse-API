/* =========================================================
   PitchPulse · Base de dados histórica da Copa do Mundo
   Conteúdo estático — funciona sem backend, sempre disponível.
   Fontes: FIFA, Wikipédia, CNN Brasil (resultados da Copa 2026).
   ========================================================= */

const COPA_DADOS = {
  // ---------------- Edição de 2026 (encerrada) ----------------
  edicao2026: {
    campeao: "Espanha",
    campeaoEmoji: "🇪🇸",
    vice: "Argentina",
    viceEmoji: "🇦🇷",
    placarFinal: "1 × 0",
    detalheFinal: "após prorrogação — gol de Ferran Torres (106')",
    titulo: "2º título mundial da Espanha (o 1º foi em 2010)",
    dataFinal: "19 de julho de 2026",
    estadioFinal: "MetLife Stadium — East Rutherford, Nova Jersey (EUA)",
    publicoFinal: "80.663 torcedores",
    anfitrioes: "Estados Unidos, Canadá e México",
    anfitrioesNota: "1ª Copa organizada por três países",
    selecoes: 48,
    grupos: "12 grupos de 4",
    jogos: 104,
    cidades: 16,
    periodo: "11 de junho a 19 de julho de 2026",
    abertura: "Estádio Azteca, Cidade do México",
    formato:
      "48 seleções em 12 grupos de 4. Avançam ao mata-mata as 2 primeiras de cada grupo mais os 8 melhores terceiros colocados — 32 times na Rodada de 32.",
    artilheiro: { nome: "Kylian Mbappé", pais: "França", emoji: "🇫🇷", gols: 10 },
    curiosidade:
      "A Espanha se tornou a primeira nação a deter os títulos mundiais masculino e feminino (a seleção feminina venceu em 2023) em um intervalo de três anos.",
  },

  // ---------------- Artilheiros da Copa de 2026 ----------------
  artilheiros2026: [
    { nome: "Kylian Mbappé", pais: "França", emoji: "🇫🇷", gols: 10 },
    { nome: "Lionel Messi", pais: "Argentina", emoji: "🇦🇷", gols: 8 },
    { nome: "Erling Haaland", pais: "Noruega", emoji: "🇳🇴", gols: 7 },
    { nome: "Harry Kane", pais: "Inglaterra", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", gols: 6 },
    { nome: "Jude Bellingham", pais: "Inglaterra", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", gols: 6 },
    { nome: "Ousmane Dembélé", pais: "França", emoji: "🇫🇷", gols: 6 },
  ],

  // ---------------- Campeões de 1930 a 2026 ----------------
  campeoes: [
    { ano: 2026, sede: "EUA, Canadá e México", campeao: "Espanha", emoji: "🇪🇸", vice: "Argentina", viceEmoji: "🇦🇷", placar: "1 × 0 (pror.)" },
    { ano: 2022, sede: "Catar", campeao: "Argentina", emoji: "🇦🇷", vice: "França", viceEmoji: "🇫🇷", placar: "3 × 3 (4–2 pên.)" },
    { ano: 2018, sede: "Rússia", campeao: "França", emoji: "🇫🇷", vice: "Croácia", viceEmoji: "🇭🇷", placar: "4 × 2" },
    { ano: 2014, sede: "Brasil", campeao: "Alemanha", emoji: "🇩🇪", vice: "Argentina", viceEmoji: "🇦🇷", placar: "1 × 0 (pror.)" },
    { ano: 2010, sede: "África do Sul", campeao: "Espanha", emoji: "🇪🇸", vice: "Holanda", viceEmoji: "🇳🇱", placar: "1 × 0 (pror.)" },
    { ano: 2006, sede: "Alemanha", campeao: "Itália", emoji: "🇮🇹", vice: "França", viceEmoji: "🇫🇷", placar: "1 × 1 (5–3 pên.)" },
    { ano: 2002, sede: "Coreia do Sul e Japão", campeao: "Brasil", emoji: "🇧🇷", vice: "Alemanha", viceEmoji: "🇩🇪", placar: "2 × 0" },
    { ano: 1998, sede: "França", campeao: "França", emoji: "🇫🇷", vice: "Brasil", viceEmoji: "🇧🇷", placar: "3 × 0" },
    { ano: 1994, sede: "Estados Unidos", campeao: "Brasil", emoji: "🇧🇷", vice: "Itália", viceEmoji: "🇮🇹", placar: "0 × 0 (3–2 pên.)" },
    { ano: 1990, sede: "Itália", campeao: "Alemanha Ocidental", emoji: "🇩🇪", vice: "Argentina", viceEmoji: "🇦🇷", placar: "1 × 0" },
    { ano: 1986, sede: "México", campeao: "Argentina", emoji: "🇦🇷", vice: "Alemanha Ocidental", viceEmoji: "🇩🇪", placar: "3 × 2" },
    { ano: 1982, sede: "Espanha", campeao: "Itália", emoji: "🇮🇹", vice: "Alemanha Ocidental", viceEmoji: "🇩🇪", placar: "3 × 1" },
    { ano: 1978, sede: "Argentina", campeao: "Argentina", emoji: "🇦🇷", vice: "Holanda", viceEmoji: "🇳🇱", placar: "3 × 1 (pror.)" },
    { ano: 1974, sede: "Alemanha Ocidental", campeao: "Alemanha Ocidental", emoji: "🇩🇪", vice: "Holanda", viceEmoji: "🇳🇱", placar: "2 × 1" },
    { ano: 1970, sede: "México", campeao: "Brasil", emoji: "🇧🇷", vice: "Itália", viceEmoji: "🇮🇹", placar: "4 × 1" },
    { ano: 1966, sede: "Inglaterra", campeao: "Inglaterra", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", vice: "Alemanha Ocidental", viceEmoji: "🇩🇪", placar: "4 × 2 (pror.)" },
    { ano: 1962, sede: "Chile", campeao: "Brasil", emoji: "🇧🇷", vice: "Tchecoslováquia", viceEmoji: "🏳️", placar: "3 × 1" },
    { ano: 1958, sede: "Suécia", campeao: "Brasil", emoji: "🇧🇷", vice: "Suécia", viceEmoji: "🇸🇪", placar: "5 × 2" },
    { ano: 1954, sede: "Suíça", campeao: "Alemanha Ocidental", emoji: "🇩🇪", vice: "Hungria", viceEmoji: "🇭🇺", placar: "3 × 2" },
    { ano: 1950, sede: "Brasil", campeao: "Uruguai", emoji: "🇺🇾", vice: "Brasil", viceEmoji: "🇧🇷", placar: "2 × 1" },
    { ano: 1938, sede: "França", campeao: "Itália", emoji: "🇮🇹", vice: "Hungria", viceEmoji: "🇭🇺", placar: "4 × 2" },
    { ano: 1934, sede: "Itália", campeao: "Itália", emoji: "🇮🇹", vice: "Tchecoslováquia", viceEmoji: "🏳️", placar: "2 × 1 (pror.)" },
    { ano: 1930, sede: "Uruguai", campeao: "Uruguai", emoji: "🇺🇾", vice: "Argentina", viceEmoji: "🇦🇷", placar: "4 × 2" },
  ],

  // ---------------- Quadro de títulos por seleção ----------------
  titulos: [
    { pais: "Brasil", emoji: "🇧🇷", n: 5, anos: "1958, 1962, 1970, 1994, 2002" },
    { pais: "Alemanha", emoji: "🇩🇪", n: 4, anos: "1954, 1974, 1990, 2014" },
    { pais: "Itália", emoji: "🇮🇹", n: 4, anos: "1934, 1938, 1982, 2006" },
    { pais: "Argentina", emoji: "🇦🇷", n: 3, anos: "1978, 1986, 2022" },
    { pais: "Espanha", emoji: "🇪🇸", n: 2, anos: "2010, 2026" },
    { pais: "Uruguai", emoji: "🇺🇾", n: 2, anos: "1930, 1950" },
    { pais: "França", emoji: "🇫🇷", n: 2, anos: "1998, 2018" },
    { pais: "Inglaterra", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", n: 1, anos: "1966" },
  ],

  // ---------------- Maiores artilheiros da história ----------------
  artilheirosHistoricos: [
    { nome: "Kylian Mbappé", pais: "França", emoji: "🇫🇷", gols: 22, periodo: "2018–2026" },
    { nome: "Lionel Messi", pais: "Argentina", emoji: "🇦🇷", gols: 21, periodo: "2006–2026" },
    { nome: "Miroslav Klose", pais: "Alemanha", emoji: "🇩🇪", gols: 16, periodo: "2002–2014" },
    { nome: "Ronaldo", pais: "Brasil", emoji: "🇧🇷", gols: 15, periodo: "1998–2006" },
    { nome: "Gerd Müller", pais: "Alemanha", emoji: "🇩🇪", gols: 14, periodo: "1970–1974" },
    { nome: "Just Fontaine", pais: "França", emoji: "🇫🇷", gols: 13, periodo: "1958" },
    { nome: "Pelé", pais: "Brasil", emoji: "🇧🇷", gols: 12, periodo: "1958–1970" },
  ],

  // ---------------- Recordes ----------------
  recordes: [
    { titulo: "Maior campeão", valor: "Brasil", detalhe: "5 títulos mundiais" },
    { titulo: "Presente em todas as Copas", valor: "Brasil", detalhe: "única seleção — de 1930 a 2026" },
    { titulo: "Mais gols em uma única Copa", valor: "Just Fontaine", detalhe: "13 gols, na Copa de 1958" },
    { titulo: "Maior artilheiro da história", valor: "Kylian Mbappé", detalhe: "22 gols em Copas" },
    { titulo: "Gol mais rápido", valor: "Hakan Şükür", detalhe: "11 segundos — Turquia, 2002" },
    { titulo: "Jogador mais jovem a marcar", valor: "Pelé", detalhe: "17 anos — Copa de 1958" },
    { titulo: "Maior goleada", valor: "Hungria 10 × 1 El Salvador", detalhe: "Copa de 1982" },
  ],

  // ---------------- Curiosidades e fatos históricos ----------------
  curiosidades: [
    { ano: "2026", icone: "👑", titulo: "Espanha bicampeã", texto: "Após 16 anos, a Espanha voltou ao topo batendo a Argentina na prorrogação, com gol de Ferran Torres." },
    { ano: "2026", icone: "🎯", titulo: "Nova artilharia histórica", texto: "Mbappé e Messi passaram Miroslav Klose (16 gols) e reescreveram o topo da artilharia de todos os tempos." },
    { ano: "1950", icone: "😶", titulo: "O Maracanaço", texto: "Diante de um Maracanã com quase 200 mil pessoas, o Uruguai venceu o Brasil por 2 a 1 e silenciou o estádio na decisão." },
    { ano: "1986", icone: "✋", titulo: "A Mão de Deus", texto: "Maradona marcou de mão contra a Inglaterra e, minutos depois, fez o 'Gol do Século' driblando meio time adversário." },
    { ano: "1958", icone: "🔥", titulo: "Fontaine imbatível", texto: "Just Fontaine marcou 13 gols em uma só Copa — recorde que resiste há quase 70 anos." },
    { ano: "1970", icone: "🏆", titulo: "Brasil dono da Jules Rimet", texto: "Com o tri, o Brasil de Pelé conquistou o direito de ficar com a taça Jules Rimet em definitivo." },
    { ano: "2006", icone: "🤯", titulo: "A cabeçada de Zidane", texto: "Na final, Zidane foi expulso após dar uma cabeçada no peito de Materazzi — sua última partida como profissional." },
    { ano: "2002", icone: "⚡", titulo: "Gol relâmpago", texto: "Hakan Şükür marcou aos 11 segundos contra a Coreia do Sul, o gol mais rápido da história das Copas." },
  ],
};
