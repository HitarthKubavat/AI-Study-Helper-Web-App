/**
 * AI Study Helper - Main Application Logic
 * Powered by Google Gemini API
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
        apiKeyInput: document.getElementById('api-key-input'),
        apiKeySaveBtn: document.getElementById('api-key-save'),
        apiKeyToggleBtn: document.getElementById('api-key-toggle'),
        apiKeyStatus: document.getElementById('api-key-status'),
    };

    // Verify all DOM elements exist to prevent silent failures
    if (Object.values(elements).some(el => !el)) {
        console.warn('Some DOM elements are missing. Continuing with available elements.');
    }

    // --- State ---
    let isGenerating = false;
    let currentAbortController = null;

    // ---------------------------------------------------------------
    // GEMINI API CONFIGURATION
    // ---------------------------------------------------------------
    const GEMINI_MODEL = 'gemini-1.5-flash';
    const GEMINI_ENDPOINT = (key) =>
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;

    /**
     * Retrieves the stored Gemini API key.
     */
    const getApiKey = () => {
        try { return localStorage.getItem('geminiApiKey') || ''; }
        catch { return ''; }
    };

    /**
     * Saves the Gemini API key to localStorage.
     */
    const saveApiKey = (key) => {
        try { localStorage.setItem('geminiApiKey', key.trim()); }
        catch (e) { console.warn('Could not save API key.', e); }
    };

    // Load saved key into the input field on boot
    if (elements.apiKeyInput) {
        const savedKey = getApiKey();
        if (savedKey) {
            elements.apiKeyInput.value = savedKey;
            if (elements.apiKeyStatus) {
                elements.apiKeyStatus.textContent = '✅ API key loaded. Ready to generate!';
                elements.apiKeyStatus.className = 'api-key-note success';
            }
        }
    }

    // Save key button
    if (elements.apiKeySaveBtn) {
        elements.apiKeySaveBtn.addEventListener('click', () => {
            const key = elements.apiKeyInput.value.trim();
            if (!key) {
                elements.apiKeyStatus.textContent = '⚠️ Please paste a valid API key first.';
                elements.apiKeyStatus.className = 'api-key-note warning';
                return;
            }
            saveApiKey(key);
            elements.apiKeyStatus.textContent = '✅ API key saved! Ready to generate.';
            elements.apiKeyStatus.className = 'api-key-note success';
            elements.apiKeyInput.blur();
        });
    }

    // Toggle key visibility
    if (elements.apiKeyToggleBtn) {
        elements.apiKeyToggleBtn.addEventListener('click', () => {
            const isHidden = elements.apiKeyInput.type === 'password';
            elements.apiKeyInput.type = isHidden ? 'text' : 'password';
            elements.apiKeyToggleBtn.setAttribute('aria-label', isHidden ? 'Hide API key' : 'Show API key');
        });
    }

    // ---------------------------------------------------------------
    // GEMINI API CALL
    // ---------------------------------------------------------------

    /**
     * Builds a structured prompt asking Gemini to return JSON.
     */
    const buildPrompt = (topic) => `
You are an expert study tutor. Explain the concept: "${topic}".

Return ONLY a valid JSON object (no markdown fences, no extra text) with this exact structure:
{
  "title": "<Clear topic title>",
  "definition": "<2-3 sentence plain-language definition or explanation>",
  "points": ["<3 concise key points>"],
  "example": "<One clear, concrete example or real-world analogy. If programming, include a code snippet. Otherwise, use plain text. If no example applies, return null>",
  "keywords": ["<5-7 key terms>"]
}
`;

    /**
     * Calls the Gemini API and returns parsed JSON data.
     */
    const callGeminiApi = async (topic, abortSignal) => {
        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error('NO_API_KEY');
        }

        const response = await fetch(GEMINI_ENDPOINT(apiKey), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: abortSignal,
            body: JSON.stringify({
                contents: [{ parts: [{ text: buildPrompt(topic) }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            const msg = errBody?.error?.message || `HTTP ${response.status}`;
            throw new Error(msg);
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Strip accidental markdown code fences if Gemini adds them
        const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
        return JSON.parse(cleaned);
    };

    // ---------------------------------------------------------------
    // HTML RENDERING FROM AI RESPONSE
    // ---------------------------------------------------------------

    /**
     * Highlights important keywords in a piece of text.
     */
    const highlightKeywords = (text, keywords) => {
        if (!keywords || keywords.length === 0) return text;
        const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const regex = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
        return text.replace(regex, '<span class="keyword-highlight">$1</span>');
    };

    // SVG icons (Simplified for the new layout)
    const iconDef = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
    const iconKey = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>`;
    const iconEx = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.5.5 2.8 1.5 3.5.76.76 1.23 1.52 1.4 2.5"></path></svg>`;

    /**
     * Renders structured AI JSON data into rich HTML.
     */
    const renderAiResponse = (ai, topic) => {
        const keywords = ai.keywords || [];

        const definitionText = highlightKeywords(escapeHtml(ai.definition || ''), keywords);
        const exampleText = highlightKeywords(escapeHtml(ai.example || ''), keywords);

        const pointsHtml = (ai.points || [])
            .map(p => `<li class="bullet-point">${highlightKeywords(escapeHtml(p), keywords)}</li>`).join('');

        return `
            <div class="generated-content fade-in" style="display: flex; flex-direction: column; gap: 1.5rem;">
                <div class="header-section" style="border-bottom: 2px solid var(--input-border); padding-bottom: 1rem;">
                    <div class="ai-powered-badge">✦ Gemini AI</div>
                    <h3 class="generated-title" style="margin-bottom: 0;">
                        <span class="primary-text" style="font-size: 1.5rem;">${escapeHtml(ai.title || topic)}</span>
                    </h3>
                </div>

                <div class="content-block" style="margin-bottom: 0;">
                    <h4 class="block-title"><span class="icon-wrapper">${iconDef}</span> Definition</h4>
                    <div class="block-text def-box" style="font-size: 1.05rem;">${definitionText}</div>
                </div>

                ${pointsHtml ? `
                <div class="content-block" style="margin-bottom: 0;">
                    <h4 class="block-title"><span class="icon-wrapper">${iconKey}</span> Key points</h4>
                    <ul class="block-list" style="padding-left: 1.5rem;">${pointsHtml}</ul>
                </div>` : ''}

                ${ai.example ? `
                <div class="content-block" style="margin-bottom: 0;">
                    <h4 class="block-title"><span class="icon-wrapper">${iconEx}</span> Example</h4>
                    <div class="block-text ex-box" style="white-space: pre-wrap;">${exampleText}</div>
                </div>` : ''}
            </div>
        `;
    };

    /**
     * Renders an inline error card inside the output area.
     */
    const renderErrorCard = (message) => {
        return `
            <div class="error-card fade-in">
                <div class="error-icon">⚠️</div>
                <h4>Something went wrong</h4>
                <p>${escapeHtml(message)}</p>
            </div>
        `;
    };

    /**
     * Safely escapes HTML special characters.
     */
    const escapeHtml = (str) => {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

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
     * Renders related topic suggestion chips from AI response data.
     */
    const renderSuggestions = (related = []) => {
        if (!related || related.length === 0) {
            elements.suggestionsStrip.classList.add('hidden');
            return;
        }

        elements.suggestionsChips.innerHTML = '';
        const frag = document.createDocumentFragment();
        related.forEach(title => {
            const chip = document.createElement('button');
            chip.className = 'suggestion-chip';
            chip.setAttribute('aria-label', `Explore ${title}`);
            chip.dataset.topic = title;
            chip.innerHTML = `<span class="suggestion-chip-icon" aria-hidden="true">📖</span>${escapeHtml(title)}`;
            frag.appendChild(chip);
        });
        elements.suggestionsChips.appendChild(frag);
        elements.suggestionsStrip.classList.remove('hidden');
    };

    /**
     * Core generation logic. Accepts forceRefresh to bypass cache.
     * Calls the real Gemini API.
     */
    const runGeneration = async (topic, forceRefresh = false) => {
        if (isGenerating) return;

        // Cache hit (skip API call)
        if (!forceRefresh) {
            const cachedContent = getCachedTopic(topic);
            if (cachedContent) {
                elements.outputArea.className = 'output-area filled';
                elements.outputArea.innerHTML = cachedContent;
                elements.actionButtons.classList.remove('hidden');
                // Re-render suggestions from cached HTML chips
                const relatedFromCache = [...elements.outputArea.querySelectorAll('.ai-related-chip')]
                    .map(c => c.dataset.topic).filter(Boolean);
                renderSuggestions(relatedFromCache);
                return;
            }
        }

        // Cancel any previous in-flight request
        if (currentAbortController) currentAbortController.abort();
        currentAbortController = new AbortController();

        isGenerating = true;
        const originalBtnContent = elements.generateBtn.innerHTML;
        elements.generateBtn.innerHTML = '<span class="loader" aria-hidden="true"></span> Generating…';
        elements.generateBtn.disabled = true;
        if (elements.regenerateBtn) elements.regenerateBtn.disabled = true;

        elements.actionButtons.classList.add('hidden');
        elements.suggestionsStrip.classList.add('hidden');
        elements.outputArea.className = 'output-area empty';
        elements.outputArea.innerHTML = `
            <div class="placeholder">
                <p>Asking Gemini about <strong class="primary-text">${escapeHtml(topic)}</strong><span class="loading-dots"></span></p>
            </div>
        `;

        try {
            const aiData = await callGeminiApi(topic, currentAbortController.signal);
            const html = renderAiResponse(aiData, topic);

            elements.outputArea.classList.add('filling');
            requestAnimationFrame(() => {
                setTimeout(() => {
                    elements.outputArea.className = 'output-area filled';
                    elements.outputArea.innerHTML = html;
                    setCachedTopic(topic, html);
                    elements.actionButtons.classList.remove('hidden');
                    renderSuggestions(aiData.related || []);
                }, 100);
            });

        } catch (err) {
            if (err.name === 'AbortError') {
                // Silently cancelled
                elements.outputArea.className = 'output-area empty';
                elements.outputArea.innerHTML = `<div class="placeholder"><p>Generation cancelled.</p></div>`;
            } else if (err.message === 'NO_API_KEY') {
                elements.outputArea.className = 'output-area filled';
                elements.outputArea.innerHTML = renderErrorCard(
                    'No API key found. Please paste your Gemini API key in the field above and click Save Key.');
            } else {
                elements.outputArea.className = 'output-area filled';
                elements.outputArea.innerHTML = renderErrorCard(
                    `Gemini API error: ${err.message}`);
            }
        } finally {
            isGenerating = false;
            elements.generateBtn.innerHTML = originalBtnContent;
            elements.generateBtn.disabled = false;
            if (elements.regenerateBtn) elements.regenerateBtn.disabled = false;
        }
    };

    /**
     * Validates the input topic string.
     * Returns an error message if invalid, or null if valid.
     */
    const validateTopicContent = (rawTopic) => {
        const topic = typeof rawTopic === 'string' ? rawTopic.trim() : "";
        if (!topic) return "Topic cannot be empty.";
        if (topic.length < 2) return "Topic must be at least 2 characters long.";
        if (topic.length > 100) return "Topic is too long (maximum 100 characters).";

        // Ensure there is at least one letter or number
        if (!/[a-zA-Z0-9]/.test(topic)) return "Topic must contain at least one alphanumeric character.";

        return null; // Valid
    };

    /**
     * Handles the generation process.
     */
    const handleGenerate = () => {
        const topic = elements.topicInput.value.trim();

        const validationError = validateTopicContent(topic);
        if (validationError) {
            elements.topicInput.focus();
            elements.topicInput.classList.add('shake-anim');
            setTimeout(() => elements.topicInput.classList.remove('shake-anim'), 300);

            // Show error in output area
            elements.outputArea.className = 'output-area filled';
            elements.outputArea.innerHTML = renderErrorCard(`Invalid Input: ${validationError}`);
            elements.actionButtons.classList.add('hidden');
            elements.suggestionsStrip.classList.add('hidden');
            return;
        }

        if (isGenerating) return;
        runGeneration(topic);
    };

    // --- Basic Unit Tests ---
    const runValidatorTests = () => {
        let passed = 0;
        let failed = 0;

        const assertEqual = (actual, expected, testName) => {
            if (actual === expected) {
                console.log(`✅ [PASS] ${testName}`);
                passed++;
            } else {
                console.error(`❌ [FAIL] ${testName} | Expected: "${expected}", Got: "${actual}"`);
                failed++;
            }
        };

        console.log("--- Running Unit Tests for validateTopicContent ---");

        assertEqual(validateTopicContent(""), "Topic cannot be empty.", "Empty string test");
        assertEqual(validateTopicContent("   "), "Topic cannot be empty.", "Whitespace only test");
        assertEqual(validateTopicContent("A"), "Topic must be at least 2 characters long.", "Single character test");
        assertEqual(validateTopicContent("!@#$%^"), "Topic must contain at least one alphanumeric character.", "Only special characters test");
        assertEqual(validateTopicContent("A".repeat(101)), "Topic is too long (maximum 100 characters).", "Too long string test");
        assertEqual(validateTopicContent("Quantum Computing"), null, "Valid typical topic");
        assertEqual(validateTopicContent("C++"), null, "Valid topic with special characters");

        console.log(`--- Test Summary: ${passed} passed, ${failed} failed ---`);
    };

    // Expose globally for manual execution in console
    window.runAppTests = runValidatorTests;

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

    // --- AI Related Chip Clicks (inside output area) ---
    elements.outputArea.addEventListener('click', (e) => {
        const chip = e.target.closest('.ai-related-chip');
        if (!chip) return;
        const topic = chip.dataset.topic;
        if (!topic) return;
        elements.topicInput.value = topic;
        handleResize();
        runGeneration(topic);
        elements.topicInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });


    elements.themeToggleBtn.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark');
        applyTheme(isDark);
    });

    // --- Boot Sequence ---
    let savedTheme = 'light';
    try {
        savedTheme = localStorage.getItem('aiStudyTheme');
    } catch { }

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
