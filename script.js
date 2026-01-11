document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let gameState = {};

    // --- DOM Elements ---
    const screens = {
        setup: document.getElementById('setup-screen'),
        game: document.getElementById('game-screen'),
        results: document.getElementById('results-screen'),
    };
    const setupForm = document.getElementById('setup-form');
    const numPlayersInput = document.getElementById('num-players');
    const playerNamesContainer = document.getElementById('player-names-container');
    const scoringSystemSelect = document.getElementById('scoring-system');
    const rascalOptionsDiv = document.getElementById('rascal-options');
    const gameVariantSelect = document.getElementById('game-variant');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const scoresheetContainer = document.getElementById('scoresheet-container');
    const roundTitle = document.getElementById('round-title');
    const currentRoundInputsTitle = document.getElementById('current-round-inputs-title');
    const roundInputsContainer = document.getElementById('round-inputs');
    const calculateRoundBtn = document.getElementById('calculate-round-btn');
    const backRoundBtn = document.getElementById('back-round-btn');
    const saveGameBtn = document.getElementById('save-game-btn');
    const loadGameBtn = document.getElementById('load-game-btn');
    const endGameBtn = document.getElementById('end-game-btn');
    const testModeBtn = document.getElementById('test-mode-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const winnerDeclaration = document.getElementById('winner-declaration');
    const finalScoresContainer = document.getElementById('final-scores');
    const bestBidderStat = document.getElementById('best-bidder');
    const mostBonusStat = document.getElementById('most-bonus');

    // --- Event Listeners ---
    
    // Theme
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Setup
    numPlayersInput.addEventListener('input', updatePlayerNameInputs);
    scoringSystemSelect.addEventListener('change', () => {
        rascalOptionsDiv.style.display = scoringSystemSelect.value === 'rascal' ? 'block' : 'none';
    });
    setupForm.addEventListener('submit', startGame);
    
    // Game
    calculateRoundBtn.addEventListener('click', processRound);
    backRoundBtn.addEventListener('click', goBackOneRound);
    saveGameBtn.addEventListener('click', saveGame);
    loadGameBtn.addEventListener('click', loadGame);
    endGameBtn.addEventListener('click', showResults);
    testModeBtn.addEventListener('click', runTestMode);
    
    // Results
    newGameBtn.addEventListener('click', () => switchScreen('setup'));
    exportPdfBtn.addEventListener('click', exportResultsToPDF);

    // --- Initialization ---
    function initialize() {
        const savedTheme = localStorage.getItem('skullKingTheme');
        if (savedTheme) {
            document.body.classList.add(savedTheme);
        }
        updatePlayerNameInputs();
    }

    // --- Screen Management ---
    function switchScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[screenName].classList.add('active');
        if (screenName === 'setup') {
            localStorage.removeItem('skullKingGameState');
            gameState = {};
            scoresheetContainer.innerHTML = '';
            roundInputsContainer.innerHTML = '';
        }
    }

    // --- Theme Management ---
    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const theme = document.body.classList.contains('dark-theme') ? 'dark-theme' : '';
        localStorage.setItem('skullKingTheme', theme);
    }

    // --- Setup Logic ---
    function updatePlayerNameInputs() {
        const numPlayers = parseInt(numPlayersInput.value) || 0;
        playerNamesContainer.innerHTML = '';
        for (let i = 1; i <= numPlayers; i++) {
            const div = document.createElement('div');
            div.className = 'form-group';
            div.innerHTML = `
                <label for="player${i}">Nom du Joueur ${i}:</label>
                <input type="text" id="player${i}" value="Joueur ${i}" required>
            `;
            playerNamesContainer.appendChild(div);
        }
    }

    function defineRounds(variant) {
        const rounds = {
            'default':   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            'no-odd':    [2, 4, 6, 8, 10],
            'combat':    [6, 7, 8, 9, 10],
            'flash':     [5, 5, 5, 5, 5],
            'barrage':   [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
            'whirlwind': [9, 7, 5, 3, 1],
            'bedtime':   [1]
        };
        return rounds[variant];
    }
    
    function startGame(e) {
        if(e) e.preventDefault();

        const numPlayers = parseInt(numPlayersInput.value);
        const playerNames = [];
        for (let i = 1; i <= numPlayers; i++) {
            playerNames.push(document.getElementById(`player${i}`).value);
        }

        gameState = {
            players: playerNames.map(name => ({ name, scores: [], totalScore: 0, correctBids: 0, bonusPoints: 0 })),
            settings: {
                scoringSystem: scoringSystemSelect.value,
                useCannonball: document.getElementById('rascal-cannonball-mode').checked,
                gameVariant: gameVariantSelect.value,
            },
            rounds: defineRounds(gameVariantSelect.value),
            currentRound: 0,
        };

        setupGameScreen();
        switchScreen('game');
    }

    // --- Game Logic ---
    function setupGameScreen() {
        renderScoresheet();
        renderCurrentRoundInputs();
        updateGameScreenTitles();
    }

    function renderScoresheet() {
        let tableHTML = `<table class="scoresheet"><thead><tr><th>Manche</th>`;
        gameState.players.forEach(player => {
            tableHTML += `<th class="player-name">${player.name}</th>`;
        });
        tableHTML += `</tr></thead><tbody>`;

        for (let i = 0; i < gameState.rounds.length; i++) {
            tableHTML += `<tr><td><strong>${i + 1}</strong> (${gameState.rounds[i]} cartes)</td>`;
            gameState.players.forEach(player => {
                const roundScore = player.scores[i];
                let scoreText = '';
                if (roundScore !== undefined) {
                    const bidText = roundScore.originalBid !== roundScore.bid ? `${roundScore.originalBid}→${roundScore.bid}` : roundScore.bid;
                    scoreText = `<span class="round-score">${bidText} / ${roundScore.tricks} = <strong>${roundScore.roundTotal}</strong></span>`;
                }
                tableHTML += `<td>${scoreText}</td>`;
            });
            tableHTML += `</tr>`;
        }

        tableHTML += `<tr><td><strong>TOTAL</strong></td>`;
        gameState.players.forEach(player => {
            tableHTML += `<td class="total-score">${player.totalScore}</td>`;
        });
        tableHTML += `</tr></tbody></table>`;

        scoresheetContainer.innerHTML = tableHTML;
    }

    function renderCurrentRoundInputs() {
        const roundIndex = gameState.currentRound;
        if (roundIndex >= gameState.rounds.length) {
            roundInputsContainer.innerHTML = '<p>Toutes les manches sont terminées. Cliquez sur "Terminer la partie".</p>';
            calculateRoundBtn.style.display = 'none';
            return;
        }
        
        calculateRoundBtn.style.display = 'block';
        let inputsHTML = '';
        const cardsThisRound = gameState.rounds[roundIndex];

        gameState.players.forEach((player, index) => {
            const savedScore = player.scores[roundIndex];
            const bid = (savedScore && savedScore.originalBid !== undefined) ? savedScore.originalBid : 0;
            const tricks = (savedScore && savedScore.tricks !== undefined) ? savedScore.tricks : 0;
            const bonuses = savedScore ? savedScore.bonuses : {};

            inputsHTML += `
                <div class="player-input-card" id="player-input-${index}">
                    <h3>${player.name}</h3>
                    <div class="form-group">
                        <label for="bid-${index}">Mise :</label>
                        <input type="number" id="bid-${index}" min="0" max="${cardsThisRound}" value="${bid}" required>
                    </div>
                    <div class="form-group">
                        <label for="tricks-${index}">Plis réalisés :</label>
                        <input type="number" id="tricks-${index}" min="0" max="${cardsThisRound}" value="${tricks}" required>
                    </div>

                    <h4>Bonus & Pouvoirs</h4>
                    <div class="bonus-section">
                        <div class="form-group">
                            <label for="bonus-14-classic-${index}">Cartes 14 classiques (x10):</label>
                            <input type="number" id="bonus-14-classic-${index}" min="0" value="${bonuses.classic14s || 0}">
                        </div>
                        <div class="form-group">
                            <label for="bonus-14-black-${index}">Carte 14 noire (20):</label>
                            <input type="checkbox" id="bonus-14-black-${index}" ${bonuses.black14 ? 'checked' : ''}>
                        </div>
                        <div class="form-group">
                            <label for="bonus-mermaid-${index}">Sirènes capturées (x20):</label>
                            <input type="number" id="bonus-mermaid-${index}" min="0" value="${bonuses.mermaidByPirate || 0}">
                        </div>
                        <div class="form-group">
                            <label for="bonus-pirate-${index}">Pirates capturés (x30):</label>
                            <input type="number" id="bonus-pirate-${index}" min="0" value="${bonuses.pirateByKing || 0}">
                        </div>
                        <div class="form-group">
                            <label for="bonus-king-${index}">Skull King capturé (40):</label>
                            <input type="checkbox" id="bonus-king-${index}" ${bonuses.kingByMermaid ? 'checked' : ''}>
                        </div>
                        <div class="form-group">
                            <label for="bonus-loot-${index}">Alliance Butin réussie (20):</label>
                            <input type="checkbox" id="bonus-loot-${index}" ${bonuses.lootBonus ? 'checked' : ''}>
                        </div>
                        <div class="form-group">
                            <label for="bonus-rascal-${index}">Pari de Rascal (0, 10, 20):</label>
                            <input type="number" id="bonus-rascal-${index}" placeholder="N/A" step="10" value="${bonuses.rascalBet !== undefined && bonuses.rascalBet !== null ? bonuses.rascalBet : ''}">
                        </div>
                        <div class="form-group">
                            <label for="power-harry-${index}">Pouvoir d'Harry:</label>
                             <select id="power-harry-${index}">
                                <option value="0" ${!bonuses.harryModifier || bonuses.harryModifier === 0 ? 'selected' : ''}>Pas de modif.</option>
                                <option value="1" ${bonuses.harryModifier === 1 ? 'selected' : ''}>Mise +1</option>
                                <option value="-1" ${bonuses.harryModifier === -1 ? 'selected' : ''}>Mise -1</option>
                            </select>
                        </div>
                    </div>
                </div>
            `;
        });
        roundInputsContainer.innerHTML = inputsHTML;
    }

    function updateGameScreenTitles() {
        const roundIndex = gameState.currentRound;
        if (roundIndex >= gameState.rounds.length) {
            roundTitle.textContent = "Partie Terminée";
            currentRoundInputsTitle.textContent = "";
            return;
        }
        const cards = gameState.rounds[roundIndex];
        const title = `Manche ${roundIndex + 1} (${cards} carte${cards > 1 ? 's' : ''})`;
        roundTitle.textContent = title;
        currentRoundInputsTitle.textContent = `Saisie pour la Manche ${roundIndex + 1}`;
    }

    function processRound() {
        const roundIndex = gameState.currentRound;
        if (roundIndex >= gameState.rounds.length) return;

        let totalTricks = 0;
        const roundData = [];

        // Collect data from inputs
        for (let i = 0; i < gameState.players.length; i++) {
            const originalBid = parseInt(document.getElementById(`bid-${i}`).value);
            const tricks = parseInt(document.getElementById(`tricks-${i}`).value);
            const harryModifier = parseInt(document.getElementById(`power-harry-${i}`).value);
            let bid = Math.max(0, originalBid + harryModifier); // Apply Harry's power

            const rascalBetValue = document.getElementById(`bonus-rascal-${i}`).value;
            const rascalBet = rascalBetValue === '' ? null : parseInt(rascalBetValue);

            if (isNaN(originalBid) || isNaN(tricks)) {
                alert(`Veuillez remplir la mise et les plis pour ${gameState.players[i].name}.`);
                return;
            }
             if (rascalBet !== null && ![0, 10, 20].includes(rascalBet)) {
                alert(`Le pari de Rascal pour ${gameState.players[i].name} doit être 0, 10, 20 ou vide.`);
                return;
            }
            
            totalTricks += tricks;
            roundData.push({
                originalBid,
                bid,
                tricks,
                bonuses: {
                    mermaidByPirate: parseInt(document.getElementById(`bonus-mermaid-${i}`).value) || 0,
                    pirateByKing: parseInt(document.getElementById(`bonus-pirate-${i}`).value) || 0,
                    kingByMermaid: document.getElementById(`bonus-king-${i}`).checked,
                    lootBonus: document.getElementById(`bonus-loot-${i}`).checked,
                    classic14s: parseInt(document.getElementById(`bonus-14-classic-${i}`).value) || 0,
                    black14: document.getElementById(`bonus-14-black-${i}`).checked,
                    rascalBet,
                    harryModifier
                }
            });
        }
        
        const cardsThisRound = gameState.rounds[roundIndex];
        if (totalTricks !== cardsThisRound) {
            alert(`Le nombre total de plis (${totalTricks}) ne correspond pas au nombre de cartes distribuées (${cardsThisRound}). Veuillez vérifier votre saisie.`);
            return;
        }

        // Calculate scores
        for (let i = 0; i < gameState.players.length; i++) {
            const data = roundData[i];
            let scoreData;

            if (gameState.settings.scoringSystem === 'rascal') {
                scoreData = calculateRascalScore(data, cardsThisRound);
            } else {
                scoreData = calculateSkullKingScore(data, cardsThisRound);
            }
            
            gameState.players[i].scores[roundIndex] = { ...data, ...scoreData };
        }
        
        recalculateTotalScores();
        gameState.currentRound++;
        
        renderScoresheet();
        renderCurrentRoundInputs();
        updateGameScreenTitles();
    }
    
    function goBackOneRound() {
        if (gameState.currentRound > 0) {
            gameState.currentRound--;
            gameState.players.forEach(player => {
                player.scores.pop();
            });
            recalculateTotalScores();
            renderScoresheet();
            renderCurrentRoundInputs();
            updateGameScreenTitles();
        }
    }

    function recalculateTotalScores() {
        gameState.players.forEach(player => {
            player.totalScore = player.scores.reduce((total, score) => total + score.roundTotal, 0);
            player.correctBids = player.scores.filter(s => s.bid === s.tricks).length;
            player.bonusPoints = player.scores.reduce((total, score) => total + score.bonusPoints, 0);
        });
    }

    // --- Scoring Calculation ---
    function calculateSkullKingScore(data, roundNumber) {
        let bidPoints = 0;
        let bonusPoints = 0;
        let rascalPoints = 0;
        const { bid, tricks, bonuses } = data;

        if (bid === 0) {
            if (tricks === 0) {
                bidPoints = 10 * roundNumber;
            } else {
                bidPoints = -10 * roundNumber;
            }
        } else {
            if (bid === tricks) {
                bidPoints = 20 * bid;
            } else {
                bidPoints = -10 * Math.abs(bid - tricks);
            }
        }

        if (bid === tricks && bonuses.lootBonus) {
             bonusPoints += 20;
        }

        bonusPoints += bonuses.classic14s * 10;
        if (bonuses.black14) bonusPoints += 20;
        bonusPoints += bonuses.mermaidByPirate * 20;
        bonusPoints += bonuses.pirateByKing * 30;
        if (bonuses.kingByMermaid) bonusPoints += 40;
        
        if (bonuses.rascalBet !== null) {
            rascalPoints = (bid === tricks) ? bonuses.rascalBet : -bonuses.rascalBet;
        }

        return { bidPoints, bonusPoints, roundTotal: bidPoints + bonusPoints + rascalPoints };
    }
    
    function calculateRascalScore(data, roundNumber) {
        let bidPoints = 0;
        let bonusPoints = 0;
        let rascalPoints = 0;
        const { bid, tricks, bonuses } = data;
        const diff = Math.abs(bid - tricks);

        const potentialScore = gameState.settings.useCannonball ? 15 * roundNumber : 10 * roundNumber;
        let bonusMultiplier = 0;

        if (diff === 0) { // Coup direct
            bidPoints = potentialScore;
            bonusMultiplier = 1;
        } else if (diff === 1 && !gameState.settings.useCannonball) { // Frappe à revers
            bidPoints = Math.round(potentialScore / 2);
            bonusMultiplier = 0.5;
        } else { // Échec cuisant
            bidPoints = 0;
            bonusMultiplier = 0;
        }

        let potentialBonus = (bonuses.mermaidByPirate * 20) + (bonuses.pirateByKing * 30);
        if (bonuses.kingByMermaid) potentialBonus += 40;
        if (bonuses.lootBonus) potentialBonus += 20;
        
        bonusPoints = Math.round(potentialBonus * bonusMultiplier);
        bonusPoints += bonuses.classic14s * 10; // 14 bonus is always full
        if (bonuses.black14) bonusPoints += 20; // 14 bonus is always full

        if (bonuses.rascalBet !== null) {
            rascalPoints = (bid === tricks) ? bonuses.rascalBet : -bonuses.rascalBet;
        }
        
        return { bidPoints, bonusPoints, roundTotal: bidPoints + bonusPoints + rascalPoints };
    }

    // --- Results Screen ---
    function showResults() {
        if (gameState.currentRound === 0) {
            alert("Aucune manche n'a été jouée !");
            return;
        }
        
        const sortedPlayers = [...gameState.players].sort((a, b) => b.totalScore - a.totalScore);
        
        const winner = sortedPlayers[0];
        winnerDeclaration.innerHTML = `<h2>Le vainqueur est ${winner.name} !</h2><p>Avec un score de ${winner.totalScore} points.</p>`;

        let scoresTable = `<table><thead><tr><th>Joueur</th><th>Score Final</th></tr></thead><tbody>`;
        sortedPlayers.forEach(player => {
            scoresTable += `<tr><td>${player.name}</td><td>${player.totalScore}</td></tr>`;
        });
        scoresTable += `</tbody></table>`;
        finalScoresContainer.innerHTML = scoresTable;
        
        const bestBidder = gameState.players.sort((a,b) => (b.correctBids / b.scores.length) - (a.correctBids / a.scores.length))[0];
        const bidAccuracy = (bestBidder.correctBids / bestBidder.scores.length * 100).toFixed(1);
        bestBidderStat.textContent = `Meilleur Parieur : ${bestBidder.name} (${bidAccuracy}% de mises correctes)`;

        const mostBonus = gameState.players.sort((a,b) => b.bonusPoints - a.bonusPoints)[0];
        mostBonusStat.textContent = `Plus de Bonus : ${mostBonus.name} (${mostBonus.bonusPoints} points bonus)`;

        switchScreen('results');
    }
    
    // --- Save/Load Logic ---
    function saveGame() {
        if (!gameState.players) {
            alert("Aucune partie en cours à sauvegarder.");
            return;
        }
        localStorage.setItem('skullKingGameState', JSON.stringify(gameState));
        alert("Partie sauvegardée !");
    }

    function loadGame() {
        const savedState = localStorage.getItem('skullKingGameState');
        if (savedState) {
            gameState = JSON.parse(savedState);
            numPlayersInput.value = gameState.players.length;
            updatePlayerNameInputs();
            gameState.players.forEach((p,i) => document.getElementById(`player${i+1}`).value = p.name);
            scoringSystemSelect.value = gameState.settings.scoringSystem;
            document.getElementById('rascal-cannonball-mode').checked = gameState.settings.useCannonball;
            gameVariantSelect.value = gameState.settings.gameVariant;
            
            setupGameScreen();
            switchScreen('game');
        } else {
            alert("Aucune partie sauvegardée trouvée.");
        }
    }
    
    // --- Test & PDF Export ---
    function runTestMode() {
        numPlayersInput.value = 3;
        updatePlayerNameInputs();
        document.getElementById('player1').value = "Barbe Noire";
        document.getElementById('player2').value = "Anne Bonny";
        document.getElementById('player3').value = "Calico Jack";
        gameVariantSelect.value = 'default';
        startGame();

        function simulateRound(bids, tricks) {
            for (let i = 0; i < gameState.players.length; i++) {
                document.getElementById(`bid-${i}`).value = bids[i];
                document.getElementById(`tricks-${i}`).value = tricks[i];
            }
            processRound();
        }
        
        simulateRound([0, 1, 0], [0, 1, 0]);
        simulateRound([1, 0, 1], [0, 1, 1]);
        simulateRound([2, 1, 0], [2, 0, 1]);

        alert("Mode test : 3 manches ont été simulées.");
    }

    function exportResultsToPDF() {
        const { jsPDF } = window.jspdf;
        const content = document.getElementById('results-content');
        
        html2canvas(content).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save("resultats_skull_king.pdf");
        });
    }

    // --- Start the app ---
    initialize();
});