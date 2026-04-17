/**
 * AI Study Helper - Main Application Logic
 * Optimized and cleaned code for robustness and performance.
 */

const initApp = () => {
    // --- DOM Elements Cache ---
    const elements = {
        topicInput: document.getElementById('topic-input'),
        generateBtn: document.getElementById('generate-btn'),
        outputArea: document.getElementById('output-area'),
        actionButtons: document.getElementById('action-buttons'),
        clearBtn: document.getElementById('clear-btn'),
        copyBtn: document.getElementById('copy-btn'),
        regenerateBtn: document.getElementById('regenerate-btn'),
        saveBtn: document.getElementById('save-btn'),
        savedTopicsSection: document.getElementById('saved-topics-section'),
        savedTopicsList: document.getElementById('saved-topics-list'),
        themeToggleBtn: document.getElementById('theme-toggle'),
        suggestionsStrip: document.getElementById('suggestions-strip'),
        suggestionsChips: document.getElementById('suggestions-chips'),
    };

    // Verify all DOM elements exist to prevent silent failures
    if (Object.values(elements).some(el => !el)) {
        console.error('Core DOM elements missing purely. Application cannot initialize correctly.');
        return;
    }

    // --- State ---
    let isGenerating = false;

    // --- Knowledge Database (Advanced Tutor Edition) ---
    const database = {
        // --- PROGRAMMING ---
        'loop': {
            category: 'programming',
            title: 'Loops',
            definition: 'A mechanism to execute a block of code multiple times based on a condition.',
            syntax: 'for (let i = 0; i < limit; i++) { ... }',
            example: 'for (let i = 0; i < 3; i++) {\n  console.log("Iteration " + i);\n}',
            output: 'Iteration 0\nIteration 1\nIteration 2',
            keywords: ['for', 'while', 'do-while', 'iteration', 'condition', 'infinite loop'],
            related: ['array', 'function', 'async', 'jumping statement']
        },
        'array': {
            category: 'programming',
            title: 'Arrays',
            definition: 'A high-level, list-like object used to store multiple values in a single variable.',
            syntax: 'const list = [item1, item2, ...];',
            example: 'const colors = ["Red", "Green"];\nconsole.log(colors[0]);\nconsole.log(colors.length);',
            output: 'Red\n2',
            keywords: ['zero-indexed', 'index', 'length', 'push', 'pop', 'dynamic'],
            related: ['loop', 'function', 'class']
        },
        'async': {
            category: 'programming',
            title: 'Async/Await',
            definition: 'Modern syntax for handling asynchronous operations without nesting multiple callbacks.',
            syntax: 'async function fetch() {\n  const res = await api();\n}',
            example: 'async function greet() {\n  console.log("Starting...");\n  await new Promise(r => setTimeout(r, 100));\n  console.log("Done!");\n}\ngreet();',
            output: 'Starting...\n(Pause)\nDone!',
            keywords: ['async', 'await', 'Promise', 'callback', 'synchronous', 'try/catch'],
            related: ['function', 'loop', 'class']
        },
        'function': {
            category: 'programming',
            title: 'Functions',
            definition: 'A reusable, self-contained block of code that performs a specific task when called.',
            syntax: 'function name(params) {\n  return result;\n}',
            example: 'function multiply(a, b) {\n  return a * b;\n}\nconsole.log(multiply(4, 5));',
            output: '20',
            keywords: ['parameter', 'return', 'call', 'invoke', 'scope', 'reusable'],
            related: ['loop', 'array', 'class', 'async']
        },
        'class': {
            category: 'programming',
            title: 'Classes (OOP)',
            definition: 'A blueprint for creating objects, encapsulating data (properties) and behavior (methods) together.',
            syntax: 'class Animal {\n  constructor(name) {\n    this.name = name;\n  }\n}',
            example: 'class Dog extends Animal {\n  speak() {\n    console.log(this.name + " barks!");\n  }\n}\nnew Dog("Rex").speak();',
            output: 'Rex barks!',
            keywords: ['constructor', 'extends', 'inheritance', 'method', 'object', 'instance'],
            related: ['function', 'array', 'async']
        },
        'jumping statement': {
            category: 'programming',
            title: 'Jumping Statements',
            definition: 'Statements that immediately redirect the flow of execution within loops or functions.',
            syntax: 'break;     // exit loop\ncontinue;  // skip iteration\nreturn;    // exit function',
            example: 'for (let i = 0; i < 5; i++) {\n  if (i === 2) continue;\n  if (i === 4) break;\n  console.log(i);\n}',
            output: '0\n1\n3',
            keywords: ['break', 'continue', 'return', 'exit', 'skip', 'flow'],
            related: ['loop', 'function', 'array']
        },
        // --- SCIENCE ---
        'photosynthesis': {
            category: 'science',
            title: 'Photosynthesis',
            explanation: 'The biological process by which plants convert light energy (sunlight) into chemical energy (glucose).',
            realWorld: 'Think of a leaf as a tiny solar panel that also builds its own batteries to survive.',
            keywords: ['chlorophyll', 'glucose', 'CO2', 'oxygen', 'sunlight', 'chloroplast'],
            related: ['relativity', 'inflation', 'blockchain']
        },
        'relativity': {
            category: 'science',
            title: 'General Relativity',
            explanation: 'Einstein\'s theory that gravity is not a force between masses, but a curvature of space and time caused by mass and energy.',
            realWorld: 'Imagine placing a bowling ball on a trampoline; the way it dips is how a planet curves space around it.',
            keywords: ['gravity', 'space-time', 'curvature', 'mass', 'energy', 'Einstein'],
            related: ['photosynthesis', 'blockchain', 'inflation']
        },
        // --- GENERAL ---
        'inflation': {
            category: 'general',
            title: 'Inflation',
            explanation: 'An economic concept where the purchasing power of money decreases as prices for goods and services rise.',
            realWorld: 'If a loaf of bread cost $1 last year and $1.10 today, that 10% increase is inflation.',
            keywords: ['purchasing power', 'prices', 'interest rates', 'central bank', 'demand', 'supply'],
            related: ['blockchain', 'relativity', 'photosynthesis']
        },
        'blockchain': {
            category: 'general',
            title: 'Blockchain',
            explanation: 'A decentralized, distributed digital ledger that records transactions across many computers securely.',
            realWorld: 'Like a shared spreadsheet where anyone can see new entries, but no one can ever erase or change old ones.',
            keywords: ['decentralized', 'ledger', 'cryptography', 'Bitcoin', 'block', 'chain'],
            related: ['inflation', 'async', 'class']
        }
    };

    /**
     * Get local storage data safely
     */
    const getStorageData = (key, defaultVal) => {
        try {
            return JSON.parse(localStorage.getItem(key)) || defaultVal;
        } catch {
            return defaultVal;
        }
    };

    /**
     * Set local storage data safely
     */
    const setStorageData = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('LocalStorage is disabled or full.', e);
        }
    };

    /**
     * Debounce utility to prevent high-frequency function calls
     */
    const debounce = (fn, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    };

    /**
     * Get/Set Cache for topics
     */
    const getCachedTopic = (topic) => getStorageData('aiTopicCache', {})[topic.toLowerCase()];
    const setCachedTopic = (topic, content) => {
        const cache = getStorageData('aiTopicCache', {});
        cache[topic.toLowerCase()] = content;
        setStorageData('aiTopicCache', cache);
    };

    /**
     * Highlights important keywords in a piece of text.
     */
    const highlightKeywords = (text, keywords) => {
        if (!keywords || keywords.length === 0) return text;
        const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const regex = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
        return text.replace(regex, '<span class="keyword-highlight">$1</span>');
    };

    /**
     * Generates a structured HTML string based on the given topic and its category.
     */
    const getDummyExplanation = (topic) => {
        const topicLower = topic.toLowerCase();
        const matchKey = Object.keys(database).find(key => topicLower.includes(key));
        
        const data = matchKey ? database[matchKey] : {
            category: 'general',
            title: 'Topic Unknown',
            explanation: `I'm still learning about "${topic}". Try asking about <strong>coding</strong> (loops, async), <strong>science</strong> (relativity, photosynthesis), or <strong>economics</strong> (inflation).`,
            realWorld: 'Think of this as an opportunity for us both to research further!',
            keywords: [],
            related: Object.keys(database).slice(0, 4),
            points: ['Double-check the spelling.', 'Try broader terms.']
        };

        const category = data.category || 'general';
        const keywords = data.keywords || [];
        const pointsHtml = (data.points || [
            'Pay attention to the definition for the core concept.',
            `Explore related topics to deepen your understanding.`
        ]).map(p => `<li>${highlightKeywords(p, keywords)}</li>`).join('');
        
        // Icons
        const iconDef = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
        const iconEx = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.5.5 2.8 1.5 3.5.76.76 1.23 1.52 1.4 2.5"></path></svg>`;
        const iconCode = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg>`;
        const iconKey = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>`;

        let specificContent = '';

        if (category === 'programming') {
            specificContent = `
                <div class="content-block">
                    <h4 class="block-title"><span class="icon-wrapper">${iconCode}</span> Syntax</h4>
                    <pre><code class="inline-code">${data.syntax}</code></pre>
                </div>
                <div class="content-block">
                    <h4 class="block-title"><span class="icon-wrapper">${iconCode}</span> Code Example</h4>
                    <pre><code class="inline-code">${data.example}</code></pre>
                    <div class="output-box">
                        ${(data.output || '').split('\n').map(l => `<span class="output-line">${l}</span>`).join('')}
                    </div>
                </div>
            `;
        } else {
            specificContent = `
                <div class="content-block">
                    <h4 class="block-title"><span class="icon-wrapper">${iconEx}</span> Real-World Example</h4>
                    <div class="block-text ex-box">${highlightKeywords(data.realWorld, keywords)}</div>
                </div>
            `;
        }

        const definitionText = highlightKeywords(data.definition || data.explanation, keywords);

        return `
            <div class="generated-content fade-in">
                <div class="category-badge badge-${category}">${category}</div>
                <h3 class="generated-title">
                    Subject: <span class="primary-text">${data.title}</span>
                </h3>
                <div class="content-block">
                    <h4 class="block-title"><span class="icon-wrapper">${iconDef}</span> ${category === 'programming' ? 'Definition' : 'Explanation'}</h4>
                    <div class="block-text def-box">${definitionText}</div>
                </div>
                ${specificContent}
                <div class="content-block">
                    <h4 class="block-title"><span class="icon-wrapper">${iconKey}</span> Key Takeaways</h4>
                    <ul class="block-list">${pointsHtml}</ul>
                </div>
                <div class="tutor-note">
                    💡 Great learning! Every expert was once a beginner — keep exploring.
                </div>
            </div>
        `;
    };

    /**
     * Renders related topic suggestion chips.
     */
    const renderSuggestions = (matchKey) => {
        const data = matchKey ? database[matchKey] : null;
        const related = data?.related || [];

        if (related.length === 0) {
            elements.suggestionsStrip.classList.add('hidden');
            return;
        }

        const categoryIcons = { programming: '💻', science: '🔬', general: '💡' };
        elements.suggestionsChips.innerHTML = '';
        const frag = document.createDocumentFragment();
        related.forEach(key => {
            const item = database[key];
            if (!item) return;
            const chip = document.createElement('button');
            chip.className = 'suggestion-chip';
            chip.setAttribute('aria-label', `Explore ${item.title}`);
            chip.dataset.topic = item.title;
            chip.innerHTML = `<span class="suggestion-chip-icon" aria-hidden="true">${categoryIcons[item.category] || '📖'}</span>${item.title}`;
            frag.appendChild(chip);
        });
        elements.suggestionsChips.appendChild(frag);
        elements.suggestionsStrip.classList.remove('hidden');
    };

    /**
     * Core generation logic. Accepts forceRefresh to bypass cache.
     */
    const runGeneration = (topic, forceRefresh = false) => {
        if (!forceRefresh) {
            const cachedContent = getCachedTopic(topic);
            if (cachedContent) {
                elements.outputArea.className = 'output-area filled';
                elements.outputArea.innerHTML = cachedContent;
                elements.actionButtons.classList.remove('hidden');
                // Still render suggestions from cache
                const matchKey = Object.keys(database).find(k => topic.toLowerCase().includes(k));
                renderSuggestions(matchKey);
                return;
            }
        }

        isGenerating = true;
        const originalBtnContent = elements.generateBtn.innerHTML;
        elements.generateBtn.innerHTML = '<span class="loader" aria-hidden="true"></span> Generating...';
        elements.generateBtn.disabled = true;
        if (elements.regenerateBtn) elements.regenerateBtn.disabled = true;

        elements.actionButtons.classList.add('hidden');
        elements.suggestionsStrip.classList.add('hidden');
        elements.outputArea.className = 'output-area empty';
        elements.outputArea.innerHTML = `
            <div class="placeholder">
                <p>Analyzing <strong class="primary-text">${topic}</strong><span class="loading-dots"></span></p>
            </div>
        `;

        setTimeout(() => {
            const matchKey = Object.keys(database).find(k => topic.toLowerCase().includes(k));
            const explanation = getDummyExplanation(topic);

            // Smooth transition: fade out → inject → slide up
            elements.outputArea.classList.add('filling');
            requestAnimationFrame(() => {
                setTimeout(() => {
                    elements.outputArea.className = 'output-area filled';
                    elements.outputArea.innerHTML = explanation;

                    // Cache the fresh content
                    setCachedTopic(topic, explanation);

                    elements.actionButtons.classList.remove('hidden');
                    elements.generateBtn.innerHTML = originalBtnContent;
                    elements.generateBtn.disabled = false;
                    if (elements.regenerateBtn) elements.regenerateBtn.disabled = false;
                    isGenerating = false;

                    // Render related suggestions
                    renderSuggestions(matchKey);
                }, 120); // short delay for filling class to render
            });
        }, 750);
    };

    /**
     * Handles the generation process.
     */
    const handleGenerate = () => {
        const topic = elements.topicInput.value.trim();
        
        if (!topic) {
            elements.topicInput.focus();
            elements.topicInput.classList.add('shake-anim');
            setTimeout(() => elements.topicInput.classList.remove('shake-anim'), 300);
            return;
        }

        if (isGenerating) return;
        runGeneration(topic);
    };

    // --- Utilities ---
    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    /**
     * Renders saved topics grouped by date.
     */
    const renderSavedTopics = () => {
        const savedNotes = getStorageData('aiStudyNotes', []);
        elements.savedTopicsList.innerHTML = '';

        if (savedNotes.length === 0) {
            elements.savedTopicsSection.classList.add('hidden');
            return;
        }

        elements.savedTopicsSection.classList.remove('hidden');

        // Group notes by relative date
        const groups = {
            'Today': [],
            'Yesterday': [],
            'Older': []
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        savedNotes.forEach(note => {
            const noteDate = new Date(note.timestamp);
            noteDate.setHours(0, 0, 0, 0);

            if (noteDate.getTime() === today.getTime()) {
                groups['Today'].push(note);
            } else if (noteDate.getTime() === yesterday.getTime()) {
                groups['Yesterday'].push(note);
            } else {
                groups['Older'].push(note);
            }
        });

        // Create fragments for better performance
        const fragment = document.createDocumentFragment();

        Object.entries(groups).forEach(([groupTitle, notes]) => {
            if (notes.length === 0) return;

            const groupContainer = document.createElement('div');
            groupContainer.className = 'history-group';

            const groupBtn = document.createElement('button');
            groupBtn.className = 'history-group-btn';
            groupBtn.setAttribute('aria-expanded', 'true');
            groupBtn.innerHTML = `
                <span>${groupTitle}</span>
                <span class="group-expand-icon" aria-hidden="true">▼</span>
            `;

            const groupWrapper = document.createElement('div');
            groupWrapper.className = 'history-group-wrapper expanded';
            
            const groupList = document.createElement('div');
            groupList.className = 'history-group-list';

            notes.forEach(note => {
                const card = document.createElement('div');
                card.className = 'saved-topic-item fade-in';
                card.innerHTML = `
                    <div class="saved-topic-header" role="button" aria-expanded="false" tabindex="0">
                        <div class="saved-topic-meta">
                            <h4 class="saved-topic-title">
                                <span class="mini-note-icon" aria-hidden="true">📝</span>
                                <span>${note.topic}</span>
                            </h4>
                            <span class="saved-topic-time">${formatTime(new Date(note.timestamp))}</span>
                        </div>
                        <div class="saved-topic-actions">
                            <button class="delete-note-btn" title="Delete Note" aria-label="Delete note for ${note.topic}" tabindex="0">
                                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                            <span class="expand-icon" aria-hidden="true">▼</span>
                        </div>
                    </div>
                    <div class="saved-topic-content-wrapper">
                        <div class="saved-topic-content-inner">
                            ${note.content}
                        </div>
                    </div>
                `;
                groupList.appendChild(card);
            });

            groupWrapper.appendChild(groupList);
            groupContainer.appendChild(groupBtn);
            groupContainer.appendChild(groupWrapper);
            fragment.appendChild(groupContainer);
        });

        elements.savedTopicsList.appendChild(fragment);
    };

    /**
     * Efficient Event Delegation for Saved Notes
     */
    elements.savedTopicsList.addEventListener('click', (e) => {
        const target = e.target;
        
        // Handle Delete
        const deleteBtn = target.closest('.delete-note-btn');
        if (deleteBtn) {
            e.stopPropagation();
            const card = deleteBtn.closest('.saved-topic-item');
            const topicName = card.querySelector('.saved-topic-title span:last-child').textContent;
            
            if (window.confirm(`Are you sure you want to delete your note on "${topicName}"?`)) {
                let savedNotes = getStorageData('aiStudyNotes', []);
                savedNotes = savedNotes.filter(n => n.topic !== topicName);
                setStorageData('aiStudyNotes', savedNotes);
                renderSavedTopics();
            }
            return;
        }

        // Handle Expand/Collapse (Card Header)
        const headerBtn = target.closest('.saved-topic-header');
        if (headerBtn) {
            toggleNote(headerBtn);
            return;
        }

        // Handle Group Expand/Collapse
        const groupBtn = target.closest('.history-group-btn');
        if (groupBtn) {
            toggleGroup(groupBtn);
        }
    });

    const toggleNote = (header) => {
        const card = header.closest('.saved-topic-item');
        const contentWrapper = card.querySelector('.saved-topic-content-wrapper');
        const icon = card.querySelector('.expand-icon');
        const isExpanded = contentWrapper.classList.contains('expanded');
        
        if (isExpanded) {
            contentWrapper.classList.remove('expanded');
            icon.style.transform = 'rotate(0deg)';
            header.setAttribute('aria-expanded', 'false');
        } else {
            contentWrapper.classList.add('expanded');
            icon.style.transform = 'rotate(180deg)';
            header.setAttribute('aria-expanded', 'true');
        }
    };

    const toggleGroup = (groupBtn) => {
        const wrapper = groupBtn.nextElementSibling;
        const icon = groupBtn.querySelector('.group-expand-icon');
        const isExpanded = wrapper.classList.contains('expanded');
        
        if (isExpanded) {
            wrapper.classList.remove('expanded');
            groupBtn.setAttribute('aria-expanded', 'false');
            icon.style.transform = 'rotate(-90deg)';
        } else {
            wrapper.classList.add('expanded');
            groupBtn.setAttribute('aria-expanded', 'true');
            icon.style.transform = 'rotate(0deg)';
        }
    };

    /**
     * Keyboard support for accessibility
     */
    elements.savedTopicsList.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            const header = e.target.closest('.saved-topic-header');
            if (header) {
                e.preventDefault();
                toggleNote(header);
            }
            const groupBtn = e.target.closest('.history-group-btn');
            if (groupBtn) {
                e.preventDefault();
                toggleGroup(groupBtn);
            }
        }
    });

    /**
     * Clears current UI.
     */
    const clearInterface = () => {
        elements.topicInput.value = '';
        elements.topicInput.style.height = 'auto';
        elements.outputArea.className = 'output-area empty';
        elements.outputArea.innerHTML = `
            <div class="placeholder">
                <svg class="placeholder-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <p>Your explanation will appear here</p>
            </div>
        `;
        elements.actionButtons.classList.add('hidden');
        elements.topicInput.focus();
    };

    /**
     * Saves note to storage.
     */
    const saveCurrentNote = () => {
        const currentTopic = elements.topicInput.value.trim();
        const currentContent = elements.outputArea.innerHTML;
        
        if (!currentTopic || elements.outputArea.classList.contains('empty')) return;

        let savedNotes = getStorageData('aiStudyNotes', []);
        // Avoid duplicates
        savedNotes = savedNotes.filter(n => n.topic.toLowerCase() !== currentTopic.toLowerCase());
        
        savedNotes.unshift({
            topic: currentTopic,
            content: currentContent,
            timestamp: new Date().toISOString()
        });
        
        setStorageData('aiStudyNotes', savedNotes);
        
        const originalBtnContent = elements.saveBtn.innerHTML;
        elements.saveBtn.innerHTML = '<span class="btn-icon" aria-hidden="true">✅</span> Saved!';
        elements.saveBtn.disabled = true;
        
        setTimeout(() => { 
            elements.saveBtn.innerHTML = originalBtnContent; 
            elements.saveBtn.disabled = false;
        }, 2000);
        
        renderSavedTopics();
    };

    /**
     * Apply dark/light theme correctly.
     */
    const applyTheme = (isDark) => {
        if (isDark) {
            document.body.classList.add('dark');
            elements.themeToggleBtn.setAttribute('aria-label', 'Switch to Light Mode');
            elements.themeToggleBtn.setAttribute('data-tooltip', 'Switch to Light Mode');
        } else {
            document.body.classList.remove('dark');
            elements.themeToggleBtn.setAttribute('aria-label', 'Switch to Dark Mode');
            elements.themeToggleBtn.setAttribute('data-tooltip', 'Switch to Dark Mode');
        }
        try {
            localStorage.setItem('aiStudyTheme', isDark ? 'dark' : 'light');
        } catch (e) {
            console.warn('LocalStorage unavailable for theme settings.');
        }
    };

    // --- Main Event Listeners ---
    elements.generateBtn.addEventListener('click', handleGenerate);
    
    elements.topicInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleGenerate();
        }
    });

    const handleResize = debounce(() => {
        elements.topicInput.style.height = 'auto';
        const newHeight = Math.min(elements.topicInput.scrollHeight, 200);
        elements.topicInput.style.height = newHeight + 'px';
        elements.topicInput.style.overflowY = elements.topicInput.scrollHeight > 200 ? 'auto' : 'hidden';
    }, 100);

    elements.topicInput.addEventListener('input', handleResize);
    elements.clearBtn.addEventListener('click', () => {
        clearInterface();
        elements.suggestionsStrip.classList.add('hidden');
    });
    elements.saveBtn.addEventListener('click', saveCurrentNote);

    // --- Copy to Clipboard ---
    elements.copyBtn.addEventListener('click', async () => {
        const text = elements.outputArea.innerText;
        if (!text || elements.outputArea.classList.contains('empty')) return;
        try {
            await navigator.clipboard.writeText(text);
            const orig = elements.copyBtn.innerHTML;
            elements.copyBtn.innerHTML = `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></svg> Copied!`;
            elements.copyBtn.style.color = '#22c55e';
            setTimeout(() => {
                elements.copyBtn.innerHTML = orig;
                elements.copyBtn.style.color = '';
            }, 2000);
        } catch {
            elements.copyBtn.textContent = 'Failed';
            setTimeout(() => { elements.copyBtn.innerHTML = `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy`; }, 2000);
        }
    });

    // --- Regenerate ---
    elements.regenerateBtn.addEventListener('click', () => {
        const topic = elements.topicInput.value.trim();
        if (!topic || isGenerating) return;
        runGeneration(topic, true); // force bypass cache
    });

    // --- Suggestion Chip Clicks (event delegation) ---
    elements.suggestionsChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.suggestion-chip');
        if (!chip) return;
        const topic = chip.dataset.topic;
        if (!topic) return;
        elements.topicInput.value = topic;
        handleResize();
        runGeneration(topic);
        elements.outputArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    elements.themeToggleBtn.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark');
        applyTheme(isDark);
    });

    // --- Boot Sequence ---
    let savedTheme = 'light';
    try {
        savedTheme = localStorage.getItem('aiStudyTheme');
    } catch {}

    const wantsDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    applyTheme(wantsDark);
    
    renderSavedTopics();
    elements.topicInput.focus();

    // --- Rotating Placeholder Suggestions ---
    const placeholderSuggestions = [
        'e.g., Loops in Python',
        'e.g., Photosynthesis',
        'e.g., What is Blockchain?',
        'e.g., Async/Await explained',
        'e.g., How does Inflation work?',
        'e.g., Classes and Objects',
        'e.g., General Relativity',
        'e.g., Array methods in JavaScript',
    ];

    let placeholderIndex = 0;
    let placeholderTimer = null;

    const rotatePlaceholder = () => {
        // Only animate when output is empty and input is unfocused
        if (elements.outputArea.classList.contains('empty') && document.activeElement !== elements.topicInput) {
            placeholderIndex = (placeholderIndex + 1) % placeholderSuggestions.length;
            elements.topicInput.setAttribute('placeholder', placeholderSuggestions[placeholderIndex]);
        }
    };

    // Rotate every 3s
    placeholderTimer = setInterval(rotatePlaceholder, 3000);

    // Stop rotation while user is typing or focused
    elements.topicInput.addEventListener('focus', () => clearInterval(placeholderTimer));
    elements.topicInput.addEventListener('blur', () => {
        // Resume rotation when user leaves the field
        if (elements.outputArea.classList.contains('empty')) {
            placeholderTimer = setInterval(rotatePlaceholder, 3000);
        }
    });
};

// Guarantee execution after DOM is completely parsed.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
