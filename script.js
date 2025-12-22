// Quizlet-style Flashcard Application
class FlashcardApp {
    constructor() {
        this.cards = this.loadCards();
        this.currentCardIndex = 0;
        this.isFlipped = false;
        this.studyMode = 'flashcards';
        this.trackProgress = true;
        this.studyStats = {
            studied: 0,
            correct: 0
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
        
        // Add some sample cards if none exist
        if (this.cards.length === 0) {
            this.addSampleCards();
        }
        
        this.loadCurrentCard();
    }

    bindEvents() {
        // Study mode tabs
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleModeChange(e.target.dataset.mode);
            });
        });

        // Main flashcard click to flip
        document.getElementById('mainFlashcard').addEventListener('click', () => {
            this.flipCard();
        });

        // Navigation buttons
        document.getElementById('prevCard').addEventListener('click', () => {
            this.previousCard();
        });

        document.getElementById('nextCard').addEventListener('click', () => {
            this.nextCard();
        });

        // Progress toggle
        document.getElementById('trackProgress').addEventListener('change', (e) => {
            this.trackProgress = e.target.checked;
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    // Card Management
    addSampleCards() {
        const sampleCards = [
            {
                id: 1,
                question: "Chicken Parmigiana",
                answer: "Breaded chicken breast topped with marinara sauce and melted mozzarella cheese, served with spaghetti",
                category: "entrees",
                status: "new",
                difficulty: 0,
                lastStudied: null,
                created: new Date().toISOString()
            },
            {
                id: 2,
                question: "Fettuccine Alfredo",
                answer: "Fresh fettuccine pasta tossed in our signature creamy alfredo sauce made with parmesan cheese",
                category: "pasta",
                status: "learning",
                difficulty: 1,
                lastStudied: new Date().toISOString(),
                created: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 3,
                question: "Breadsticks",
                answer: "Warm, soft breadsticks brushed with garlic butter and served with marinara sauce",
                category: "appetizers",
                status: "mastered",
                difficulty: 3,
                lastStudied: new Date().toISOString(),
                created: new Date(Date.now() - 172800000).toISOString()
            },
            {
                id: 4,
                question: "Tiramisu",
                answer: "Traditional Italian dessert made with ladyfingers, espresso, mascarpone cheese and cocoa",
                category: "desserts",
                status: "learning",
                difficulty: 2,
                lastStudied: new Date().toISOString(),
                created: new Date(Date.now() - 259200000).toISOString()
            },
            {
                id: 5,
                question: "Zuppa Toscana",
                answer: "Creamy soup with Italian sausage, bacon, potatoes, and kale in a rich broth",
                category: "soups",
                status: "new",
                difficulty: 0,
                lastStudied: null,
                created: new Date(Date.now() - 345600000).toISOString()
            }
        ];

        this.cards = sampleCards;
        this.saveCards();
        this.updateDisplay();
    }

    loadCards() {
        const saved = localStorage.getItem('olive-garden-flashcards');
        return saved ? JSON.parse(saved) : [];
    }

    saveCards() {
        localStorage.setItem('olive-garden-flashcards', JSON.stringify(this.cards));
    }

    // Navigation Methods
    nextCard() {
        if (this.currentCardIndex < this.cards.length - 1) {
            this.currentCardIndex++;
            this.loadCurrentCard();
        }
    }

    previousCard() {
        if (this.currentCardIndex > 0) {
            this.currentCardIndex--;
            this.loadCurrentCard();
        }
    }

    loadCurrentCard() {
        if (this.cards.length === 0) return;
        
        const card = this.cards[this.currentCardIndex];
        document.getElementById('cardQuestion').textContent = card.question;
        document.getElementById('cardAnswer').textContent = card.answer;
        
        // Reset flip state
        this.isFlipped = false;
        document.getElementById('mainFlashcard').classList.remove('flipped');
        
        this.updateDisplay();
    }

    flipCard() {
        this.isFlipped = !this.isFlipped;
        const flashcard = document.getElementById('mainFlashcard');
        
        if (this.isFlipped) {
            flashcard.classList.add('flipped');
        } else {
            flashcard.classList.remove('flipped');
        }
    }

    // Mode Management
    handleModeChange(mode) {
        this.studyMode = mode;
        
        // Update active tab
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Handle different study modes
        switch(mode) {
            case 'flashcards':
                this.showFlashcardMode();
                break;
            case 'learn':
                this.showLearnMode();
                break;
            case 'test':
                this.showTestMode();
                break;
            case 'match':
                this.showMatchMode();
                break;
            case 'qchat':
                this.showQChatMode();
                break;
        }
    }

    showFlashcardMode() {
        document.querySelector('.flashcard-study-area').style.display = 'block';
        document.querySelector('.cards-section').style.display = 'none';
        this.loadCurrentCard();
    }

    showLearnMode() {
        alert('Learn mode coming soon!');
    }

    showTestMode() {
        alert('Test mode coming soon!');
    }

    showMatchMode() {
        alert('Match mode coming soon!');
    }

    showQChatMode() {
        alert('Q-Chat mode coming soon!');
    }

    // Display Updates
    updateDisplay() {
        // Update card counter
        document.getElementById('currentCard').textContent = this.currentCardIndex + 1;
        document.getElementById('totalCards').textContent = this.cards.length;
        
        // Update study stats
        const studiedToday = this.cards.filter(card => {
            if (!card.lastStudied) return false;
            const today = new Date().toDateString();
            const studiedDate = new Date(card.lastStudied).toDateString();
            return today === studiedDate;
        }).length;
        
        document.getElementById('studiedCount').textContent = studiedToday;
        
        // Update navigation button states
        const prevBtn = document.getElementById('prevCard');
        const nextBtn = document.getElementById('nextCard');
        
        prevBtn.disabled = this.currentCardIndex === 0;
        nextBtn.disabled = this.currentCardIndex === this.cards.length - 1;
        
        if (prevBtn.disabled) {
            prevBtn.style.opacity = '0.5';
            prevBtn.style.cursor = 'not-allowed';
        } else {
            prevBtn.style.opacity = '1';
            prevBtn.style.cursor = 'pointer';
        }
        
        if (nextBtn.disabled) {
            nextBtn.style.opacity = '0.5';
            nextBtn.style.cursor = 'not-allowed';
        } else {
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
        }
    }

    // Keyboard Navigation
    handleKeyboard(e) {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previousCard();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextCard();
                break;
            case ' ':
                e.preventDefault();
                this.flipCard();
                break;
            case 'Escape':
                // Reset flip state
                this.isFlipped = false;
                document.getElementById('mainFlashcard').classList.remove('flipped');
                break;
        }
    }

    // Utility Methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Progress Tracking
    markCardStudied() {
        if (!this.trackProgress) return;
        
        const currentCard = this.cards[this.currentCardIndex];
        if (currentCard) {
            currentCard.lastStudied = new Date().toISOString();
            
            // Update status based on study frequency
            if (currentCard.status === 'new') {
                currentCard.status = 'learning';
            }
            
            this.saveCards();
            this.updateDisplay();
        }
    }

}

// Initialize the application
const app = new FlashcardApp();
