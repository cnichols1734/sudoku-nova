/* ========================================
   SUDOKU NOVA - Game Engine
   ======================================== */

// ============ Sound Engine ============
class SoundEngine {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.3; // Subtle volume
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        this.unlocked = false;
    }
    
    init() {
        if (this.audioContext) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // iOS Safari requires resuming on user interaction
            if (this.isIOS) {
                this.unlockAudio();
            }
        } catch (e) {
            console.log('Web Audio not supported');
            this.enabled = false;
        }
    }
    
    // Special unlock for iOS Safari
    unlockAudio() {
        if (this.unlocked) return;
        
        const unlock = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    // Create and play a silent buffer to fully unlock
                    const buffer = this.audioContext.createBuffer(1, 1, 22050);
                    const source = this.audioContext.createBufferSource();
                    source.buffer = buffer;
                    source.connect(this.audioContext.destination);
                    source.start(0);
                    this.unlocked = true;
                });
            } else {
                this.unlocked = true;
            }
        };
        
        // Listen for any user interaction
        ['touchstart', 'touchend', 'click', 'keydown'].forEach(event => {
            document.addEventListener(event, unlock, { once: true });
        });
    }
    
    // Ensure audio context is resumed (needed for mobile)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // Create a gain node for volume control
    createGain(volume = this.volume) {
        const gain = this.audioContext.createGain();
        gain.gain.value = volume;
        gain.connect(this.audioContext.destination);
        return gain;
    }
    
    // Soft click for number placement
    playPlace() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        const osc = this.audioContext.createOscillator();
        const gain = this.createGain(0.15);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.08);
        
        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);
        
        osc.connect(gain);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.08);
    }
    
    // Positive chime for correct placement
    playCorrect() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        const osc = this.audioContext.createOscillator();
        const gain = this.createGain(0.12);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
        osc.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.08); // E5
        
        gain.gain.setValueAtTime(0.12, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        osc.connect(gain);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
    }
    
    // Soft error tone
    playError() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        const osc = this.audioContext.createOscillator();
        const gain = this.createGain(0.1);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        osc.connect(gain);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
    }
    
    // Satisfying chime for region complete (row/col/box)
    playRegionComplete() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        const notes = [523, 659, 784]; // C5, E5, G5 - major chord arpeggio
        
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.createGain(0.1);
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const startTime = this.audioContext.currentTime + (i * 0.06);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);
            
            osc.connect(gain);
            osc.start(startTime);
            osc.stop(startTime + 0.25);
        });
    }
    
    // Rising tone for combo increase
    playCombo(comboLevel) {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        const baseFreq = 400 + (comboLevel * 50); // Higher pitch for higher combos
        
        const osc = this.audioContext.createOscillator();
        const gain = this.createGain(0.15);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.audioContext.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        osc.connect(gain);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.2);
    }
    
    // Celebration sound for level up
    playLevelUp() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.createGain(0.12);
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const startTime = this.audioContext.currentTime + (i * 0.08);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            
            osc.connect(gain);
            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }
    
    // Victory fanfare
    playVictory() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        // Play a triumphant chord progression
        const chords = [
            [523, 659, 784],     // C major
            [587, 740, 880],     // D major  
            [659, 784, 988],     // E minor-ish
            [784, 988, 1175]     // G major high
        ];
        
        chords.forEach((chord, chordIndex) => {
            chord.forEach((freq, noteIndex) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.createGain(0.08);
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                const startTime = this.audioContext.currentTime + (chordIndex * 0.2);
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.08, startTime + 0.03);
                gain.gain.setValueAtTime(0.08, startTime + 0.15);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
                
                osc.connect(gain);
                osc.start(startTime);
                osc.stop(startTime + 0.4);
            });
        });
    }
    
    // Subtle UI click
    playClick() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        const osc = this.audioContext.createOscillator();
        const gain = this.createGain(0.08);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.03);
        
        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.03);
        
        osc.connect(gain);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.03);
    }
    
    // Power-up activation
    playPowerUp() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.createGain(0.12);
        
        osc1.type = 'sine';
        osc2.type = 'sine';
        
        osc1.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.15);
        
        osc2.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.12, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        osc1.connect(gain);
        osc2.connect(gain);
        osc1.start();
        osc2.start();
        osc1.stop(this.audioContext.currentTime + 0.2);
        osc2.stop(this.audioContext.currentTime + 0.2);
    }
}

// Global sound engine
const Sound = new SoundEngine();

class SudokuNova {
    constructor() {
        // Game State
        this.grid = [];
        this.solution = [];
        this.initialGrid = [];
        this.selectedCell = null;
        this.notesMode = false;
        this.notes = Array(81).fill(null).map(() => new Set());
        this.history = [];
        this.difficulty = 'medium';
        
        // Scoring & Progression
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('sudokuNovaHighScore')) || 0;
        this.combo = 1;
        this.maxCombo = 1;
        this.comboTimer = null;
        this.comboTimeout = 35000; // 35 seconds to maintain combo (Sudoku needs thinking time!)
        this.comboBarInterval = null;
        this.comboStartTime = null;
        
        // Perfect game tracking
        this.mistakesMade = 0;
        this.hintsUsed = 0;
        
        // Number completion tracking (to detect when a number just completed)
        this.completedNumbers = new Set();
        
        // XP & Levels
        this.xp = parseInt(localStorage.getItem('sudokuNovaXP')) || 0;
        this.level = parseInt(localStorage.getItem('sudokuNovaLevel')) || 1;
        this.xpPerLevel = 100;
        
        // Streaks
        this.streak = parseInt(localStorage.getItem('sudokuNovaStreak')) || 0;
        this.lastPlayDate = localStorage.getItem('sudokuNovaLastPlay');
        
        // Stats (persistent across all games)
        this.stats = this.loadStats();
        
        // Power-ups (calculated from level, reset each game)
        this.powerups = this.calculatePowerups();
        
        // Timer
        this.timerInterval = null;
        this.elapsedTime = 0;
        this.timerFrozen = false;
        
        // Completion tracking
        this.completedRows = new Set();
        this.completedCols = new Set();
        this.completedBoxes = new Set();
        
        // DOM Elements
        this.gridElement = document.getElementById('sudoku-grid');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.comboElement = document.getElementById('combo');
        this.timerElement = document.getElementById('timer');
        this.streakElement = document.getElementById('streak');
        this.levelElement = document.getElementById('level');
        this.xpFillElement = document.getElementById('xp-fill');
        this.xpTextElement = document.getElementById('xp-text');
        this.comboPopup = document.getElementById('combo-popup');
        
        // Initialize
        this.init();
    }
    
    init() {
        this.checkStreak();
        this.updateDisplay();
        this.initParticles();
        this.bindEvents();
        this.showDifficultyModal();
        
        // Initialize sound on first user interaction (especially for iOS)
        const initSound = () => {
            Sound.init();
            if (Sound.audioContext && Sound.audioContext.state === 'suspended') {
                Sound.audioContext.resume();
            }
        };
        
        document.addEventListener('click', initSound);
        document.addEventListener('touchstart', initSound);
        document.addEventListener('touchend', initSound);
    }
    
    // ============ Sudoku Generator ============
    
    generatePuzzle(difficulty) {
        // Generate a complete valid solution first
        this.solution = this.generateSolution();
        
        // Create puzzle by removing numbers
        const removeCount = {
            easy: 35,
            medium: 45,
            hard: 52,
            expert: 58
        };
        
        this.grid = [...this.solution];
        const cellsToRemove = removeCount[difficulty] || 45;
        
        let removed = 0;
        const attempts = new Set();
        
        while (removed < cellsToRemove && attempts.size < 81) {
            const idx = Math.floor(Math.random() * 81);
            if (!attempts.has(idx) && this.grid[idx] !== 0) {
                attempts.add(idx);
                const backup = this.grid[idx];
                this.grid[idx] = 0;
                
                // For easier difficulties, just remove
                // For harder, verify unique solution
                if (difficulty === 'easy' || difficulty === 'medium' || this.hasUniqueSolution()) {
                    removed++;
                } else {
                    this.grid[idx] = backup;
                }
            }
        }
        
        this.initialGrid = [...this.grid];
        this.notes = Array(81).fill(null).map(() => new Set());
        this.history = [];
        this.completedRows = new Set();
        this.completedCols = new Set();
        this.completedBoxes = new Set();
    }
    
    generateSolution() {
        const grid = Array(81).fill(0);
        this.fillGrid(grid);
        return grid;
    }
    
    fillGrid(grid) {
        const emptyCell = grid.indexOf(0);
        if (emptyCell === -1) return true;
        
        const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        for (const num of numbers) {
            if (this.isValidPlacement(grid, emptyCell, num)) {
                grid[emptyCell] = num;
                if (this.fillGrid(grid)) return true;
                grid[emptyCell] = 0;
            }
        }
        
        return false;
    }
    
    isValidPlacement(grid, idx, num) {
        const row = Math.floor(idx / 9);
        const col = idx % 9;
        
        // Check row
        for (let c = 0; c < 9; c++) {
            if (grid[row * 9 + c] === num) return false;
        }
        
        // Check column
        for (let r = 0; r < 9; r++) {
            if (grid[r * 9 + col] === num) return false;
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (grid[r * 9 + c] === num) return false;
            }
        }
        
        return true;
    }
    
    hasUniqueSolution() {
        // Simplified check - just verify solvability for performance
        const gridCopy = [...this.grid];
        return this.solve(gridCopy);
    }
    
    solve(grid) {
        const emptyCell = grid.indexOf(0);
        if (emptyCell === -1) return true;
        
        for (let num = 1; num <= 9; num++) {
            if (this.isValidPlacement(grid, emptyCell, num)) {
                grid[emptyCell] = num;
                if (this.solve(grid)) return true;
                grid[emptyCell] = 0;
            }
        }
        
        return false;
    }
    
    shuffleArray(arr) {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // ============ Grid Rendering ============
    
    renderGrid() {
        this.gridElement.innerHTML = '';
        
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            
            if (this.initialGrid[i] !== 0) {
                cell.classList.add('fixed');
                cell.textContent = this.initialGrid[i];
            } else if (this.grid[i] !== 0) {
                cell.textContent = this.grid[i];
                
                // Check for errors
                if (this.grid[i] !== this.solution[i]) {
                    cell.classList.add('error');
                }
            } else if (this.notes[i].size > 0) {
                cell.innerHTML = this.renderNotes(this.notes[i]);
            }
            
            this.gridElement.appendChild(cell);
        }
        
        this.updateNumberCounts();
    }
    
    renderNotes(notesSet) {
        let html = '<div class="notes">';
        for (let n = 1; n <= 9; n++) {
            html += `<span>${notesSet.has(n) ? n : ''}</span>`;
        }
        html += '</div>';
        return html;
    }
    
    updateCell(idx) {
        const cell = this.gridElement.children[idx];
        if (!cell) return;
        
        cell.className = 'cell';
        
        if (this.initialGrid[idx] !== 0) {
            cell.classList.add('fixed');
            cell.textContent = this.initialGrid[idx];
        } else if (this.grid[idx] !== 0) {
            cell.textContent = this.grid[idx];
            
            if (this.grid[idx] !== this.solution[idx]) {
                cell.classList.add('error');
            }
        } else {
            cell.innerHTML = this.notes[idx].size > 0 ? this.renderNotes(this.notes[idx]) : '';
        }
        
        // Re-apply selection highlighting
        if (this.selectedCell !== null) {
            this.highlightRelated(this.selectedCell);
        }
    }
    
    // ============ Cell Selection & Highlighting ============
    
    selectCell(idx) {
        // Remove previous selection
        document.querySelectorAll('.cell.selected, .cell.same-number, .cell.same-region').forEach(c => {
            c.classList.remove('selected', 'same-number', 'same-region');
        });
        
        this.selectedCell = idx;
        const cell = this.gridElement.children[idx];
        if (cell) cell.classList.add('selected');
        
        this.highlightRelated(idx);
        this.highlightNumberButton(this.grid[idx]);
    }
    
    highlightRelated(idx) {
        const row = Math.floor(idx / 9);
        const col = idx % 9;
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        const selectedNum = this.grid[idx];
        
        for (let i = 0; i < 81; i++) {
            const cell = this.gridElement.children[i];
            const r = Math.floor(i / 9);
            const c = i % 9;
            
            // Same row, column, or box
            const inSameRow = r === row;
            const inSameCol = c === col;
            const inSameBox = r >= boxRow && r < boxRow + 3 && c >= boxCol && c < boxCol + 3;
            
            if (i !== idx) {
                if (selectedNum !== 0 && this.grid[i] === selectedNum) {
                    cell.classList.add('same-number');
                } else if (inSameRow || inSameCol || inSameBox) {
                    cell.classList.add('same-region');
                }
            }
        }
    }
    
    highlightNumberButton(num) {
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.classList.remove('highlighted');
            if (parseInt(btn.dataset.num) === num && num !== 0) {
                btn.classList.add('highlighted');
            }
        });
    }
    
    // ============ Number Input ============
    
    placeNumber(num) {
        if (this.selectedCell === null) return;
        if (this.initialGrid[this.selectedCell] !== 0) return; // Can't modify fixed cells
        
        const idx = this.selectedCell;
        const previousValue = this.grid[idx];
        const previousNotes = new Set(this.notes[idx]);
        
        if (this.notesMode) {
            // Toggle note
            if (this.notes[idx].has(num)) {
                this.notes[idx].delete(num);
            } else {
                this.notes[idx].add(num);
            }
            this.grid[idx] = 0;
        } else {
            // Place number
            this.grid[idx] = num;
            this.notes[idx].clear();
            
            // Auto-remove notes from related cells
            this.removeRelatedNotes(idx, num);
        }
        
        // Save to history
        this.history.push({
            idx,
            previousValue,
            previousNotes,
            newValue: this.grid[idx],
            newNotes: new Set(this.notes[idx])
        });
        
        // Update display
        this.updateCell(idx);
        this.selectCell(idx);
        
        // Check if correct and award points
        if (!this.notesMode && this.grid[idx] === this.solution[idx]) {
            this.onCorrectPlacement(idx);
        } else if (!this.notesMode && this.grid[idx] !== 0 && this.grid[idx] !== this.solution[idx]) {
            this.onIncorrectPlacement(idx);
        }
        
        // Check for completion
        this.checkCompletion();
    }
    
    removeRelatedNotes(idx, num) {
        const row = Math.floor(idx / 9);
        const col = idx % 9;
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = 0; i < 81; i++) {
            const r = Math.floor(i / 9);
            const c = i % 9;
            
            const inSameRow = r === row;
            const inSameCol = c === col;
            const inSameBox = r >= boxRow && r < boxRow + 3 && c >= boxCol && c < boxCol + 3;
            
            if (inSameRow || inSameCol || inSameBox) {
                if (this.notes[i].has(num)) {
                    this.notes[i].delete(num);
                    this.updateCell(i);
                }
            }
        }
    }
    
    eraseCell() {
        if (this.selectedCell === null) return;
        if (this.initialGrid[this.selectedCell] !== 0) return;
        
        const idx = this.selectedCell;
        const previousValue = this.grid[idx];
        const previousNotes = new Set(this.notes[idx]);
        
        this.grid[idx] = 0;
        this.notes[idx].clear();
        
        this.history.push({
            idx,
            previousValue,
            previousNotes,
            newValue: 0,
            newNotes: new Set()
        });
        
        this.updateCell(idx);
        this.selectCell(idx);
    }
    
    undo() {
        if (this.history.length === 0) return;
        
        const action = this.history.pop();
        this.grid[action.idx] = action.previousValue;
        this.notes[action.idx] = action.previousNotes;
        
        this.updateCell(action.idx);
        if (this.selectedCell === action.idx) {
            this.selectCell(action.idx);
        }
    }
    
    // ============ Scoring & Combos ============
    
    onCorrectPlacement(idx) {
        const cell = this.gridElement.children[idx];
        cell.classList.add('correct-place');
        setTimeout(() => cell.classList.remove('correct-place'), 400);
        
        // Base points
        let points = 10 * this.combo;
        
        // Check for row/col/box completion
        const completions = this.checkRegionCompletions(idx);
        
        if (completions.length > 0) {
            // Extend combo and increase multiplier
            this.extendCombo();
            this.combo = Math.min(this.combo + completions.length, 10);
            this.updateComboDisplay();
            
            // Play region complete sound
            Sound.playRegionComplete();
            
            // Blast effects for each completion
            completions.forEach(completion => {
                points += 50 * this.combo;
                this.triggerBlastEffect(completion.type, completion.cells);
            });
            
            // Show combo popup and play combo sound
            if (this.combo >= 2) {
                this.showComboPopup();
                Sound.playCombo(this.combo);
            }
        } else {
            // Just a regular correct placement
            Sound.playCorrect();
        }
        
        this.addScore(points);
        this.addXP(points / 10);
    }
    
    onIncorrectPlacement(idx) {
        const cell = this.gridElement.children[idx];
        cell.classList.add('error');
        
        // Track mistakes for perfect game
        this.mistakesMade++;
        
        // Reset combo on error
        this.resetCombo();
        
        // Play error sound
        Sound.playError();
        
        // Vibrate on mobile (Android only)
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    }
    
    checkRegionCompletions(idx) {
        const completions = [];
        const row = Math.floor(idx / 9);
        const col = idx % 9;
        const boxIdx = Math.floor(row / 3) * 3 + Math.floor(col / 3);
        
        // Check row
        if (!this.completedRows.has(row) && this.isRowComplete(row)) {
            this.completedRows.add(row);
            const cells = [];
            for (let c = 0; c < 9; c++) cells.push(row * 9 + c);
            completions.push({ type: 'row', cells });
        }
        
        // Check column
        if (!this.completedCols.has(col) && this.isColComplete(col)) {
            this.completedCols.add(col);
            const cells = [];
            for (let r = 0; r < 9; r++) cells.push(r * 9 + col);
            completions.push({ type: 'col', cells });
        }
        
        // Check box
        if (!this.completedBoxes.has(boxIdx) && this.isBoxComplete(boxIdx)) {
            this.completedBoxes.add(boxIdx);
            const cells = [];
            const boxRow = Math.floor(boxIdx / 3) * 3;
            const boxCol = (boxIdx % 3) * 3;
            for (let r = boxRow; r < boxRow + 3; r++) {
                for (let c = boxCol; c < boxCol + 3; c++) {
                    cells.push(r * 9 + c);
                }
            }
            completions.push({ type: 'box', cells });
        }
        
        return completions;
    }
    
    isRowComplete(row) {
        for (let c = 0; c < 9; c++) {
            const idx = row * 9 + c;
            if (this.grid[idx] !== this.solution[idx]) return false;
        }
        return true;
    }
    
    isColComplete(col) {
        for (let r = 0; r < 9; r++) {
            const idx = r * 9 + col;
            if (this.grid[idx] !== this.solution[idx]) return false;
        }
        return true;
    }
    
    isBoxComplete(boxIdx) {
        const boxRow = Math.floor(boxIdx / 3) * 3;
        const boxCol = (boxIdx % 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                const idx = r * 9 + c;
                if (this.grid[idx] !== this.solution[idx]) return false;
            }
        }
        return true;
    }
    
    triggerBlastEffect(type, cells) {
        // Add blast animation to cells
        cells.forEach((cellIdx, i) => {
            setTimeout(() => {
                const cell = this.gridElement.children[cellIdx];
                cell.classList.add(`${type}-complete`);
                cell.classList.add('blast');
                
                // Spawn particles from cell
                const rect = cell.getBoundingClientRect();
                this.spawnBlastParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
                
                setTimeout(() => {
                    cell.classList.remove(`${type}-complete`, 'blast');
                }, 600);
            }, i * 30); // Stagger effect
        });
    }
    
    extendCombo() {
        clearTimeout(this.comboTimer);
        clearInterval(this.comboBarInterval);
        
        this.comboStartTime = Date.now();
        this.comboTimer = setTimeout(() => this.resetCombo(), this.comboTimeout);
        
        // Start the combo bar animation
        const comboBar = document.getElementById('combo-timer-bar');
        const comboFill = document.getElementById('combo-timer-fill');
        
        comboBar.classList.add('active');
        comboBar.classList.remove('warning');
        comboFill.style.transform = 'scaleX(1)';
        
        // Animate the bar depleting
        this.comboBarInterval = setInterval(() => {
            const elapsed = Date.now() - this.comboStartTime;
            const remaining = Math.max(0, 1 - (elapsed / this.comboTimeout));
            comboFill.style.transform = `scaleX(${remaining})`;
            
            // Add warning when under 25% time remaining
            if (remaining < 0.25) {
                comboBar.classList.add('warning');
            }
            
            if (remaining <= 0) {
                clearInterval(this.comboBarInterval);
            }
        }, 50);
    }
    
    resetCombo() {
        clearTimeout(this.comboTimer);
        clearInterval(this.comboBarInterval);
        
        this.combo = 1;
        this.updateComboDisplay();
        
        // Hide the combo bar
        const comboBar = document.getElementById('combo-timer-bar');
        comboBar.classList.remove('active', 'warning');
    }
    
    showComboPopup() {
        this.comboPopup.innerHTML = `<span class="combo-text">COMBO x${this.combo}!</span>`;
        this.comboPopup.classList.add('active');
        setTimeout(() => this.comboPopup.classList.remove('active'), 800);
        
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
    }
    
    // ============ Score & XP ============
    
    addScore(points) {
        this.score += points;
        this.scoreElement.textContent = this.score.toLocaleString();
        
        // Animate score
        this.scoreElement.style.transform = 'scale(1.2)';
        setTimeout(() => this.scoreElement.style.transform = 'scale(1)', 150);
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore.toLocaleString();
            localStorage.setItem('sudokuNovaHighScore', this.highScore);
        }
    }
    
    getDifficultyMultiplier() {
        const multipliers = {
            easy: 1,
            medium: 1.5,
            hard: 2,
            expert: 3
        };
        return multipliers[this.difficulty] || 1;
    }
    
    addXP(amount) {
        // Apply difficulty multiplier - harder puzzles = more XP!
        const multipliedAmount = Math.floor(amount * this.getDifficultyMultiplier());
        this.xp += multipliedAmount;
        
        // Track total XP earned for stats
        this.stats.totalXPEarned += multipliedAmount;
        
        // Check for level up
        while (this.xp >= this.xpPerLevel) {
            this.xp -= this.xpPerLevel;
            this.level++;
            this.xpPerLevel = Math.floor(this.xpPerLevel * 1.2);
            this.onLevelUp();
        }
        
        this.updateXPDisplay();
        localStorage.setItem('sudokuNovaXP', this.xp);
        localStorage.setItem('sudokuNovaLevel', this.level);
    }
    
    onLevelUp() {
        // Flash effect
        const flash = document.createElement('div');
        flash.className = 'level-up-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 800);
        
        // Play level up sound
        Sound.playLevelUp();
        
        // Recalculate power-ups based on new level
        // If new allocation is higher, give them the extra immediately!
        const newAllocation = this.calculatePowerups();
        this.powerups.hint = Math.max(this.powerups.hint, newAllocation.hint);
        this.powerups.freeze = Math.max(this.powerups.freeze, newAllocation.freeze);
        this.powerups.blast = Math.max(this.powerups.blast, newAllocation.blast);
        
        this.updatePowerupDisplay();
        this.levelElement.textContent = this.level;
    }
    
    updateXPDisplay() {
        const percent = (this.xp / this.xpPerLevel) * 100;
        this.xpFillElement.style.width = `${percent}%`;
        this.xpTextElement.textContent = `${this.xp} / ${this.xpPerLevel} XP`;
    }
    
    updateComboDisplay() {
        this.comboElement.textContent = `x${this.combo}`;
        if (this.combo > 1) {
            this.comboElement.classList.add('active');
        } else {
            this.comboElement.classList.remove('active');
        }
    }
    
    // ============ Timer ============
    
    startTimer() {
        this.elapsedTime = 0;
        this.timerFrozen = false;
        clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            if (!this.timerFrozen) {
                this.elapsedTime++;
                this.updateTimerDisplay();
            }
        }, 1000);
    }
    
    stopTimer() {
        clearInterval(this.timerInterval);
    }
    
    updateTimerDisplay() {
        const mins = Math.floor(this.elapsedTime / 60);
        const secs = this.elapsedTime % 60;
        this.timerElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // ============ Power-ups ============
    
    calculatePowerups() {
        // Base allocation + level bonuses
        // This creates meaningful progression without hoarding
        return {
            hint: 2 + Math.floor(this.level / 5),    // +1 every 5 levels
            freeze: 1 + Math.floor(this.level / 10), // +1 every 10 levels
            blast: 1 + Math.floor(this.level / 15)   // +1 every 15 levels
        };
    }
    
    useHint() {
        if (this.powerups.hint <= 0) return;
        if (this.selectedCell === null) return;
        if (this.initialGrid[this.selectedCell] !== 0) return;
        if (this.grid[this.selectedCell] === this.solution[this.selectedCell]) return;
        
        Sound.playPowerUp();
        
        this.powerups.hint--;
        this.hintsUsed++;
        this.updatePowerupDisplay();
        
        // Fill in the correct number
        const idx = this.selectedCell;
        this.grid[idx] = this.solution[idx];
        this.notes[idx].clear();
        
        this.updateCell(idx);
        this.selectCell(idx);
        
        // Special animation for hint
        const cell = this.gridElement.children[idx];
        cell.style.background = 'rgba(255, 215, 0, 0.3)';
        setTimeout(() => cell.style.background = '', 500);
        
        // Check completions (but no combo bonus for hints)
        this.checkRegionCompletions(idx);
        this.checkCompletion();
    }
    
    useFreeze() {
        if (this.powerups.freeze <= 0) return;
        
        Sound.playPowerUp();
        
        this.powerups.freeze--;
        this.updatePowerupDisplay();
        
        // Freeze timer for 30 seconds
        this.timerFrozen = true;
        this.timerElement.style.color = 'var(--nova-cyan)';
        this.timerElement.style.textShadow = 'var(--glow-cyan)';
        
        setTimeout(() => {
            this.timerFrozen = false;
            this.timerElement.style.color = '';
            this.timerElement.style.textShadow = '';
        }, 30000);
    }
    
    useBlast() {
        if (this.powerups.blast <= 0) return;
        if (this.selectedCell === null) return;
        
        Sound.playPowerUp();
        
        this.powerups.blast--;
        this.updatePowerupDisplay();
        
        // Reveal all instances of a random missing number in the selected row/col/box
        const idx = this.selectedCell;
        const row = Math.floor(idx / 9);
        const col = idx % 9;
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        // Find empty cells in the box
        const emptyCells = [];
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                const i = r * 9 + c;
                if (this.grid[i] === 0 && this.initialGrid[i] === 0) {
                    emptyCells.push(i);
                }
            }
        }
        
        // Fill up to 3 cells
        const toFill = emptyCells.slice(0, 3);
        toFill.forEach((cellIdx, i) => {
            setTimeout(() => {
                this.grid[cellIdx] = this.solution[cellIdx];
                this.notes[cellIdx].clear();
                this.updateCell(cellIdx);
                
                const cell = this.gridElement.children[cellIdx];
                cell.classList.add('blast');
                this.spawnBlastParticles(
                    cell.getBoundingClientRect().left + cell.offsetWidth / 2,
                    cell.getBoundingClientRect().top + cell.offsetHeight / 2
                );
                setTimeout(() => cell.classList.remove('blast'), 600);
            }, i * 150);
        });
        
        setTimeout(() => this.checkCompletion(), toFill.length * 150 + 100);
    }
    
    updatePowerupDisplay() {
        document.querySelector('#powerup-hint .powerup-count').textContent = this.powerups.hint;
        document.querySelector('#powerup-freeze .powerup-count').textContent = this.powerups.freeze;
        document.querySelector('#powerup-blast .powerup-count').textContent = this.powerups.blast;
        
        document.getElementById('powerup-hint').classList.toggle('disabled', this.powerups.hint <= 0);
        document.getElementById('powerup-freeze').classList.toggle('disabled', this.powerups.freeze <= 0);
        document.getElementById('powerup-blast').classList.toggle('disabled', this.powerups.blast <= 0);
    }
    
    // ============ Number Tracking ============
    
    updateNumberCounts() {
        const counts = Array(10).fill(0);
        for (let i = 0; i < 81; i++) {
            if (this.grid[i] !== 0 && this.grid[i] === this.solution[i]) {
                counts[this.grid[i]]++;
            }
        }
        
        document.querySelectorAll('.num-btn').forEach(btn => {
            const num = parseInt(btn.dataset.num);
            const isComplete = counts[num] >= 9;
            btn.classList.toggle('completed', isComplete);
            
            // Celebrate when a number just got completed!
            if (isComplete && !this.completedNumbers.has(num)) {
                this.completedNumbers.add(num);
                this.celebrateNumberComplete(num, btn);
            }
        });
    }
    
    celebrateNumberComplete(num, btn) {
        // Flash the button with celebration
        btn.classList.add('number-complete-flash');
        setTimeout(() => btn.classList.remove('number-complete-flash'), 800);
        
        // Play a satisfying sound
        Sound.playRegionComplete();
        
        // Spawn particles from the button
        const rect = btn.getBoundingClientRect();
        this.spawnBlastParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
        
        // Bonus points for completing all of a number
        const bonusPoints = 25 * this.combo;
        this.addScore(bonusPoints);
    }
    
    // ============ Game Completion ============
    
    checkCompletion() {
        for (let i = 0; i < 81; i++) {
            if (this.grid[i] !== this.solution[i]) return;
        }
        
        // Puzzle complete!
        this.onPuzzleComplete();
    }
    
    onPuzzleComplete() {
        this.stopTimer();
        
        // Update streak
        this.streak++;
        this.streakElement.textContent = this.streak;
        localStorage.setItem('sudokuNovaStreak', this.streak);
        localStorage.setItem('sudokuNovaLastPlay', new Date().toDateString());
        
        // Calculate stars based on time
        let stars = 1;
        const targetTimes = {
            easy: 300,
            medium: 600,
            hard: 900,
            expert: 1200
        };
        const target = targetTimes[this.difficulty] || 600;
        
        if (this.elapsedTime < target * 0.5) stars = 3;
        else if (this.elapsedTime < target) stars = 2;
        
        // Check for perfect game (no mistakes, no hints)
        const isPerfect = this.mistakesMade === 0 && this.hintsUsed === 0;
        const perfectBonus = isPerfect ? 50 : 0;
        
        // Bonus XP (with difficulty multiplier already applied in addXP)
        const bonusXP = stars * 25 + this.maxCombo * 10 + perfectBonus;
        this.addXP(bonusXP);
        
        // Show victory modal
        document.getElementById('v-time').textContent = this.timerElement.textContent;
        document.getElementById('v-score').textContent = this.score.toLocaleString();
        document.getElementById('v-combo').textContent = `x${this.maxCombo}`;
        document.getElementById('v-xp').textContent = `+${Math.floor(bonusXP * this.getDifficultyMultiplier())}`;
        
        // Show/hide perfect badge
        const perfectBadge = document.getElementById('perfect-badge');
        if (perfectBadge) {
            perfectBadge.classList.toggle('active', isPerfect);
        }
        
        // Update lifetime stats
        this.updateStats(isPerfect);
        
        // Render victory stars with icons
        const starsContainer = document.getElementById('victory-stars');
        starsContainer.innerHTML = '';
        for (let i = 0; i < stars; i++) {
            const starIcon = document.createElement('i');
            starIcon.setAttribute('data-lucide', 'star');
            starsContainer.appendChild(starIcon);
        }
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Play victory sound
        Sound.playVictory();
        
        // Celebration particles
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.spawnBlastParticles(
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerHeight * 0.5
                );
            }, i * 50);
        }
        
        setTimeout(() => {
            document.getElementById('victory-modal').classList.add('active');
        }, 500);
    }
    
    // ============ Streak System ============
    
    checkStreak() {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (this.lastPlayDate === today) {
            // Already played today, keep streak
        } else if (this.lastPlayDate === yesterday) {
            // Streak continues
        } else if (this.lastPlayDate) {
            // Streak broken
            this.streak = 0;
        }
        
        this.streakElement.textContent = this.streak;
    }
    
    // ============ Stats System ============
    
    loadStats() {
        const defaultStats = {
            puzzlesCompleted: { easy: 0, medium: 0, hard: 0, expert: 0, total: 0 },
            bestTimes: { easy: null, medium: null, hard: null, expert: null },
            totalXPEarned: 0,
            longestStreak: 0,
            perfectGames: 0
        };
        
        try {
            const saved = localStorage.getItem('sudokuNovaStats');
            if (saved) {
                return { ...defaultStats, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.log('Error loading stats:', e);
        }
        
        return defaultStats;
    }
    
    saveStats() {
        try {
            localStorage.setItem('sudokuNovaStats', JSON.stringify(this.stats));
        } catch (e) {
            console.log('Error saving stats:', e);
        }
    }
    
    updateStats(isPerfect) {
        // Update puzzles completed
        this.stats.puzzlesCompleted[this.difficulty]++;
        this.stats.puzzlesCompleted.total++;
        
        // Update best time
        const currentBest = this.stats.bestTimes[this.difficulty];
        if (currentBest === null || this.elapsedTime < currentBest) {
            this.stats.bestTimes[this.difficulty] = this.elapsedTime;
        }
        
        // Update longest streak
        if (this.streak > this.stats.longestStreak) {
            this.stats.longestStreak = this.streak;
        }
        
        // Update perfect games count
        if (isPerfect) {
            this.stats.perfectGames++;
        }
        
        // Total XP is tracked separately (we add to it in addXP)
        this.saveStats();
    }
    
    formatTime(seconds) {
        if (seconds === null) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateStatsDisplay() {
        // Update stats tab display
        const statsElements = {
            'stat-total-puzzles': this.stats.puzzlesCompleted.total,
            'stat-easy-completed': this.stats.puzzlesCompleted.easy,
            'stat-medium-completed': this.stats.puzzlesCompleted.medium,
            'stat-hard-completed': this.stats.puzzlesCompleted.hard,
            'stat-expert-completed': this.stats.puzzlesCompleted.expert,
            'stat-easy-best': this.formatTime(this.stats.bestTimes.easy),
            'stat-medium-best': this.formatTime(this.stats.bestTimes.medium),
            'stat-hard-best': this.formatTime(this.stats.bestTimes.hard),
            'stat-expert-best': this.formatTime(this.stats.bestTimes.expert),
            'stat-total-xp': this.stats.totalXPEarned.toLocaleString(),
            'stat-longest-streak': this.stats.longestStreak,
            'stat-perfect-games': this.stats.perfectGames,
            'stat-current-level': this.level
        };
        
        for (const [id, value] of Object.entries(statsElements)) {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        }
    }
    
    // ============ New Game ============
    
    newGame(difficulty) {
        this.difficulty = difficulty;
        this.score = 0;
        this.combo = 1;
        this.maxCombo = 1;
        this.selectedCell = null;
        this.notesMode = false;
        
        // Reset perfect game tracking
        this.mistakesMade = 0;
        this.hintsUsed = 0;
        this.completedNumbers = new Set();
        
        // Reset power-ups based on current level (fresh start each game!)
        this.powerups = this.calculatePowerups();
        
        document.getElementById('btn-notes').classList.remove('active');
        
        this.generatePuzzle(difficulty);
        this.renderGrid();
        this.startTimer();
        this.updateDisplay();
        
        document.getElementById('difficulty-modal').classList.remove('active');
        document.getElementById('victory-modal').classList.remove('active');
    }
    
    showDifficultyModal() {
        // Reset to play tab
        document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.modal-tab[data-tab="play"]').classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById('tab-play').classList.add('active');
        
        document.getElementById('difficulty-modal').classList.add('active');
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score.toLocaleString();
        this.highScoreElement.textContent = this.highScore.toLocaleString();
        this.levelElement.textContent = this.level;
        this.streakElement.textContent = this.streak;
        this.updateComboDisplay();
        this.updateXPDisplay();
        this.updatePowerupDisplay();
    }
    
    // ============ Particles ============
    
    initParticles() {
        this.particleCanvas = document.getElementById('particles');
        this.ctx = this.particleCanvas.getContext('2d');
        this.particles = [];
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Background particles
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.particleCanvas.width,
                y: Math.random() * this.particleCanvas.height,
                size: Math.random() * 2 + 0.5,
                speedY: Math.random() * 0.3 + 0.1,
                opacity: Math.random() * 0.5 + 0.2,
                type: 'star'
            });
        }
        
        this.animateParticles();
    }
    
    resizeCanvas() {
        this.particleCanvas.width = window.innerWidth;
        this.particleCanvas.height = window.innerHeight;
    }
    
    animateParticles() {
        this.ctx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
        
        this.particles = this.particles.filter(p => {
            if (p.type === 'star') {
                // Slow drifting stars
                p.y -= p.speedY;
                if (p.y < -10) {
                    p.y = this.particleCanvas.height + 10;
                    p.x = Math.random() * this.particleCanvas.width;
                }
                
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                this.ctx.fill();
                return true;
            } else if (p.type === 'blast') {
                // Blast particles
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.1; // Gravity
                p.life -= 0.02;
                
                if (p.life <= 0) return false;
                
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color.replace('1)', `${p.life})`);
                this.ctx.fill();
                return true;
            }
            return false;
        });
        
        requestAnimationFrame(() => this.animateParticles());
    }
    
    spawnBlastParticles(x, y) {
        const colors = [
            'rgba(255, 215, 0, 1)',
            'rgba(255, 45, 117, 1)',
            'rgba(157, 78, 221, 1)',
            'rgba(0, 245, 212, 1)',
            'rgba(76, 201, 240, 1)'
        ];
        
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 / 15) * i + Math.random() * 0.5;
            const speed = Math.random() * 4 + 2;
            
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: Math.random() * 4 + 2,
                life: 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                type: 'blast'
            });
        }
    }
    
    // ============ Event Binding ============
    
    bindEvents() {
        // Grid clicks
        this.gridElement.addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if (cell) {
                this.selectCell(parseInt(cell.dataset.index));
            }
        });
        
        // Number pad
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Sound.playPlace();
                this.placeNumber(parseInt(btn.dataset.num));
            });
        });
        
        // Action buttons
        document.getElementById('btn-undo').addEventListener('click', () => this.undo());
        document.getElementById('btn-erase').addEventListener('click', () => this.eraseCell());
        document.getElementById('btn-new').addEventListener('click', () => this.showDifficultyModal());
        
        document.getElementById('btn-notes').addEventListener('click', (e) => {
            this.notesMode = !this.notesMode;
            e.currentTarget.classList.toggle('active', this.notesMode);
        });
        
        // Power-ups
        document.getElementById('powerup-hint').addEventListener('click', () => this.useHint());
        document.getElementById('powerup-freeze').addEventListener('click', () => this.useFreeze());
        document.getElementById('powerup-blast').addEventListener('click', () => this.useBlast());
        
        // Difficulty selection
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.newGame(btn.dataset.difficulty);
            });
        });
        
        // Modal tabs
        document.querySelectorAll('.modal-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show corresponding content
                const tabName = tab.dataset.tab;
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`tab-${tabName}`).classList.add('active');
                
                // Update stats display when stats tab is shown
                if (tabName === 'stats') {
                    this.updateStatsDisplay();
                }
            });
        });
        
        // Victory modal
        document.getElementById('btn-next').addEventListener('click', () => {
            this.newGame(this.difficulty);
        });
        
        document.getElementById('btn-share').addEventListener('click', () => {
            const text = `🌟 SUDOKU NOVA 🌟\n` +
                `I completed a ${this.difficulty.toUpperCase()} puzzle!\n` +
                `⏱️ Time: ${this.timerElement.textContent}\n` +
                `🎯 Score: ${this.score.toLocaleString()}\n` +
                `🔥 Max Combo: x${this.maxCombo}\n` +
                `⭐ Level: ${this.level}`;
            
            if (navigator.share) {
                navigator.share({ text });
            } else {
                navigator.clipboard.writeText(text);
                alert('Results copied to clipboard!');
            }
        });
        
        // Sound toggle
        const soundToggle = document.getElementById('sound-toggle');
        // Load saved sound preference
        if (localStorage.getItem('sudokuNovaMuted') === 'true') {
            Sound.enabled = false;
            soundToggle.classList.add('muted');
        }
        soundToggle.addEventListener('click', () => {
            Sound.enabled = !Sound.enabled;
            soundToggle.classList.toggle('muted', !Sound.enabled);
            localStorage.setItem('sudokuNovaMuted', !Sound.enabled);
            if (Sound.enabled) {
                Sound.init();
                Sound.playClick();
            }
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') {
                this.placeNumber(parseInt(e.key));
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                this.eraseCell();
            } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
                this.undo();
            } else if (e.key === 'n') {
                this.notesMode = !this.notesMode;
                document.getElementById('btn-notes').classList.toggle('active', this.notesMode);
            } else if (e.key === 'ArrowUp' && this.selectedCell !== null) {
                const newIdx = this.selectedCell - 9;
                if (newIdx >= 0) this.selectCell(newIdx);
            } else if (e.key === 'ArrowDown' && this.selectedCell !== null) {
                const newIdx = this.selectedCell + 9;
                if (newIdx < 81) this.selectCell(newIdx);
            } else if (e.key === 'ArrowLeft' && this.selectedCell !== null) {
                const newIdx = this.selectedCell - 1;
                if (newIdx >= 0 && Math.floor(newIdx / 9) === Math.floor(this.selectedCell / 9)) {
                    this.selectCell(newIdx);
                }
            } else if (e.key === 'ArrowRight' && this.selectedCell !== null) {
                const newIdx = this.selectedCell + 1;
                if (newIdx < 81 && Math.floor(newIdx / 9) === Math.floor(this.selectedCell / 9)) {
                    this.selectCell(newIdx);
                }
            }
        });
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    window.game = new SudokuNova();
});

