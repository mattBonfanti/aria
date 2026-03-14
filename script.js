document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // GREETER - messaggio di benvenuto contestuale
    // =============================================
    const greeting = document.getElementById('welcomeGreeting');
    if (greeting) {
        const hour = new Date().getHours();
        let saluto = 'Buonasera';
        if (hour >= 5 && hour < 12) saluto = 'Buongiorno';
        else if (hour >= 12 && hour < 18) saluto = 'Buon pomeriggio';
        greeting.textContent = `${saluto}, Dott.ssa Rossi`;
    }

    // =============================================
    // NAVIGAZIONE TRA VISTE
    // =============================================
    const navDashboard = document.getElementById('nav-dashboard');
    const navKnowledge = document.getElementById('nav-knowledge');
    const navConfig    = document.getElementById('nav-config');

    const dashboardView = document.getElementById('dashboardView');
    const knowledgeView = document.getElementById('knowledgeView');
    const configView    = document.getElementById('configView');

    function switchView(viewName) {
        // Rimuovi active da tutti i nav items
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        // Nascondi tutte le viste
        [dashboardView, knowledgeView, configView].forEach(v => {
            if (v) v.classList.add('hidden');
        });

        if (viewName === 'dashboard') {
            navDashboard.classList.add('active');
            dashboardView.classList.remove('hidden');
        } else if (viewName === 'knowledge') {
            navKnowledge.classList.add('active');
            knowledgeView.classList.remove('hidden');
            if (network) setTimeout(() => network.fit(), 100);
        } else if (viewName === 'config') {
            navConfig.classList.add('active');
            configView.classList.remove('hidden');
        }

        // Chiudi sidebar su mobile dopo la navigazione
        closeSidebar();
    }

    navDashboard.addEventListener('click', e => { e.preventDefault(); switchView('dashboard'); });
    navKnowledge.addEventListener('click', e => { e.preventDefault(); switchView('knowledge'); });
    navConfig.addEventListener('click',    e => { e.preventDefault(); switchView('config'); });

    // =============================================
    // SIDEBAR MOBILE – hamburger
    // =============================================
    const sidebar         = document.getElementById('sidebar');
    const hamburgerBtn    = document.getElementById('hamburgerBtn');
    const sidebarOverlay  = document.getElementById('sidebarOverlay');

    function openSidebar() {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('open');
    }
    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('open');
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    // =============================================
    // KNOWLEDGE BASE – ricerca + filtri + espandi
    // =============================================
    const expandKnowledgeBtn = document.getElementById('expandKnowledgeBtn');
    const addSourceForm      = document.getElementById('addSourceForm');
    const cancelSourceBtn    = document.getElementById('cancelSourceBtn');
    const submitSourceBtn    = document.getElementById('submitSourceBtn');
    const newSourceInput     = document.getElementById('newSourceInput');
    const sourceList         = document.getElementById('sourceList');
    const docSearch          = document.getElementById('docSearch');
    const filterPills        = document.querySelectorAll('.filter-pill');

    function filterSources() {
        if (!docSearch || !sourceList) return;
        const term     = docSearch.value.toLowerCase();
        const activePill  = document.querySelector('.filter-pill.active');
        const activeCategory = activePill ? activePill.dataset.category : 'tutte';

        sourceList.querySelectorAll('.source-card').forEach(card => {
            const title    = (card.dataset.title || '').toLowerCase();
            const category = card.dataset.category || '';
            const matchT   = title.includes(term);
            const matchC   = activeCategory === 'tutte' || category === activeCategory;
            card.style.display = (matchT && matchC) ? 'flex' : 'none';
        });
    }

    if (docSearch) docSearch.addEventListener('input', filterSources);

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            filterSources();
        });
    });

    if (expandKnowledgeBtn) expandKnowledgeBtn.addEventListener('click', () => {
        addSourceForm.classList.remove('hidden');
        newSourceInput.focus();
    });
    if (cancelSourceBtn) cancelSourceBtn.addEventListener('click', () => {
        addSourceForm.classList.add('hidden');
        newSourceInput.value = '';
    });
    if (submitSourceBtn) submitSourceBtn.addEventListener('click', () => {
        const val = newSourceInput.value.trim();
        if (!val) return;
        const newCard = document.createElement('div');
        newCard.className = 'source-card';
        newCard.dataset.category = 'ricerca';
        newCard.dataset.title    = val;
        newCard.innerHTML = `
            <div class="source-icon web"><i class="fas fa-link"></i></div>
            <div class="source-info">
                <h4>${val.length > 28 ? val.substring(0, 28) + '...' : val}</h4>
                <span>Ricerca • Fonte Personalizzata • Elaborazione...</span>
            </div>`;
        sourceList.insertBefore(newCard, sourceList.firstChild);
        addSourceForm.classList.add('hidden');
        newSourceInput.value = '';
        setTimeout(() => {
            const span = newCard.querySelector('span');
            if (span) span.textContent = 'Ricerca • Fonte Personalizzata • Elaborato ✓';
            const icon = newCard.querySelector('.source-icon');
            if (icon) { icon.style.backgroundColor = 'rgba(35,134,54,0.12)'; icon.style.color = 'var(--success-text)'; }
            const ico  = newCard.querySelector('.source-icon i');
            if (ico) ico.className = 'fas fa-check';
        }, 2200);
        filterSources();
    });

    // Link grafo → chat
    const graphFitBtn = document.getElementById('graphFitBtn');
    if (graphFitBtn) graphFitBtn.addEventListener('click', () => { if (network) network.fit(); });

    // =============================================
    // VIS.JS GRAPH
    // =============================================
    let network = null;
    function initGraph() {
        const container = document.getElementById('knowledgeGraph');
        if (!container) return;
        const nodes = new vis.DataSet([
            { id: 1, label: 'CM-841\n(Formulazione Base)', group: 'formulation', value: 30, title: 'Miscela ad Alta Resistenza' },
            { id: 2, label: 'Cemento Portland\n(Tipo I)',           group: 'material',    value: 20 },
            { id: 3, label: 'Ceneri Volanti\n(Classe F)',           group: 'material',    value: 15 },
            { id: 4, label: 'Fumi di Silice',                       group: 'material',    value: 15 },
            { id: 5, label: 'Test Compressione',                    group: 'test',        value: 25, title: '55 MPa a 28 giorni' },
            { id: 6, label: 'Camera Maturazione A',                 group: 'environment', value: 10 },
            { id: 7, label: 'CM-840\n(Geopolimero)',                group: 'formulation', value: 25 },
            { id: 8, label: 'Attivatore Alcalino',                  group: 'material',    value: 15 },
            { id: 9, label: 'Scorie',                               group: 'material',    value: 20 },
            { id: 10, label: 'Test Trazione',                       group: 'test',        value: 20 }
        ]);
        const edges = new vis.DataSet([
            { from: 1, to: 2, label: 'contiene 65%' },
            { from: 1, to: 3, label: 'contiene 25%' },
            { from: 1, to: 4, label: 'contiene 10%' },
            { from: 1, to: 5, label: 'valutato da' },
            { from: 5, to: 6, label: 'maturato in' },
            { from: 7, to: 8, label: 'attivato da' },
            { from: 7, to: 9, label: 'materiale base' },
            { from: 7, to: 10, label: 'valutato da' },
            { from: 3, to: 9, label: 'studio compar.' }
        ]);
        const options = {
            nodes: { shape: 'dot', font: { color: '#e6edf3', face: 'Outfit', size: 12 }, borderWidth: 2, shadow: true },
            edges: {
                color: { color: '#30363d', highlight: '#ff7b00' },
                font: { color: '#8b949e', face: 'Outfit', size: 11, align: 'middle' },
                arrows: { to: { enabled: true, scaleFactor: 0.5 } },
                smooth: { type: 'continuous' }
            },
            groups: {
                formulation: { color: { background: '#1f6feb', border: '#388bfd' } },
                material:    { color: { background: '#238636', border: '#3fb950' } },
                test:        { color: { background: '#d29922', border: '#e3b341' } },
                environment: { color: { background: '#8957e5', border: '#a371f7' } }
            },
            physics: {
                barnesHut: { gravitationalConstant: -3000, centralGravity: 0.3, springLength: 150 },
                stabilization: { iterations: 150 }
            },
            interaction: { hover: true, tooltipDelay: 200 }
        };
        network = new vis.Network(container, { nodes, edges }, options);
        network.on('click', params => {
            if (params.nodes.length > 0) {
                const node = nodes.get(params.nodes[0]);
                openChat();
                chatInput.value = `Dimmi di più su: ${node.label.replace('\n', ' ')}`;
                chatInput.focus();
            }
        });
    }
    initGraph();

    // =============================================
    // CHAT – visibilità e toggle
    // =============================================
    const chatWidget   = document.getElementById('chatWidget');
    const openChatBtn  = document.getElementById('openChatBtn');
    const toggleChatBtn = document.getElementById('toggleChat');
    const chatInput    = document.getElementById('chatInput');
    const sendBtn      = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    const chatSuggestions = document.getElementById('chatSuggestions');
    const openChatDesktopBtn = document.getElementById('openChatDesktopBtn');
    const initTime     = document.getElementById('initTime');

    // Imposta ora messaggio iniziale
    if (initTime) {
        const now = new Date();
        initTime.textContent = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    }

    function minimizeChat() {
        chatWidget.classList.add('minimized');
        openChatBtn.classList.remove('hidden');
    }
    function openChat() {
        chatWidget.classList.remove('minimized');
        openChatBtn.classList.add('hidden');
        if (chatSuggestions) chatSuggestions.classList.remove('hidden');
        setTimeout(() => chatInput.focus(), 100);
    }

    if (toggleChatBtn) toggleChatBtn.addEventListener('click', e => { e.stopPropagation(); minimizeChat(); });
    if (openChatBtn)   openChatBtn.addEventListener('click', openChat);
    if (openChatDesktopBtn) openChatDesktopBtn.addEventListener('click', openChat);

    // Chat aperta di default (visibile)
    openChatBtn.classList.add('hidden');

    // Suggestion chips
    if (chatSuggestions) {
        chatSuggestions.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                chatInput.value = chip.dataset.text;
                chatSuggestions.classList.add('hidden'); // nascondi dopo uso
                sendMessage();
            });
        });
    }

    // =============================================
    // CHAT – invio messaggi
    // =============================================
    // Leggi le credenziali dalla config salvata, oppure usa i default hardcoded
    function getConfig() {
        const saved = JSON.parse(localStorage.getItem('ariaConfig') || '{}');
        return {
            webhookUrl: saved.webhookUrl || 'https://lorenzolottici.app.n8n.cloud/webhook/fe68a097-f742-445d-b945-1bf311cb7987',
            supabaseUrl: saved.supabaseUrl || 'https://ioekvjvpjbzkkrvyrgcz.supabase.co',
            supabaseKey: saved.supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZWt2anZwamJ6a2tydnlyZ2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NzgyNjQsImV4cCI6MjA4OTA1NDI2NH0.PKEenEHPzd0xwvNvp-fdOBHg8eRQkQDEriaxeCg1JOY',
            supabaseTable: saved.supabaseTable || 'knowledge_base'
        };
    }

    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message ai-message';
    typingIndicator.innerHTML = `
        <div class="msg-content" style="display:flex;gap:5px;align-items:center;padding:12px 16px;">
            <div style="width:7px;height:7px;background:var(--text-secondary);border-radius:50%;animation:pulse 1.2s infinite;"></div>
            <div style="width:7px;height:7px;background:var(--text-secondary);border-radius:50%;animation:pulse 1.2s infinite 0.2s;"></div>
            <div style="width:7px;height:7px;background:var(--text-secondary);border-radius:50%;animation:pulse 1.2s infinite 0.4s;"></div>
        </div>`;

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;
        if (chatSuggestions) chatSuggestions.classList.add('hidden');

        appendMessage(text, 'user-message');
        chatInput.value = '';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const cfg = getConfig();

        try {
            const response = await fetch(cfg.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatInput: text, sessionId: 'aria-' + Date.now() })
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (chatMessages.contains(typingIndicator)) chatMessages.removeChild(typingIndicator);

            let aiText = 'Ho ricevuto una risposta ma non sono riuscita a interpretarla.';
            if (data.output)       aiText = data.output;
            else if (data.text)    aiText = data.text;
            else if (data.message) aiText = data.message;
            else if (typeof data === 'string') aiText = data;
            else aiText = JSON.stringify(data);

            appendMessage(aiText, 'ai-message');
        } catch (err) {
            console.error('Errore webhook:', err);
            if (chatMessages.contains(typingIndicator)) chatMessages.removeChild(typingIndicator);
            appendMessage(`⚠️ Impossibile contattare l'assistente. Verifica il webhook n8n nella sezione <strong>Configurazione</strong>.`, 'ai-message');
        }
    }

    function appendMessage(text, senderClass) {
        const div = document.createElement('div');
        div.className = `message ${senderClass}`;
        const now = new Date();
        const time = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        div.innerHTML = `<div class="msg-content">${text}</div><span class="msg-time">${time}</span>`;
        chatMessages.appendChild(div);
        setTimeout(() => { chatMessages.scrollTop = chatMessages.scrollHeight; }, 60);
    }

    if (sendBtn)   sendBtn.addEventListener('click', sendMessage);
    if (chatInput) chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

    // =============================================
    // CONFIGURAZIONE PANEL
    // =============================================
    const cfgWebhookUrl    = document.getElementById('cfgWebhookUrl');
    const cfgSupabaseUrl   = document.getElementById('cfgSupabaseUrl');
    const cfgSupabaseKey   = document.getElementById('cfgSupabaseKey');
    const cfgSupabaseTable = document.getElementById('cfgSupabaseTable');
    const saveConfigBtn    = document.getElementById('saveConfigBtn');
    const resetConfigBtn   = document.getElementById('resetConfigBtn');
    const configStatus     = document.getElementById('configStatus');

    const DEFAULTS = {
        webhookUrl:    'https://lorenzolottici.app.n8n.cloud/webhook/fe68a097-f742-445d-b945-1bf311cb7987',
        supabaseUrl:   'https://ioekvjvpjbzkkrvyrgcz.supabase.co',
        supabaseKey:   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZWt2anZwamJ6a2tydnlyZ2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NzgyNjQsImV4cCI6MjA4OTA1NDI2NH0.PKEenEHPzd0xwvNvp-fdOBHg8eRQkQDEriaxeCg1JOY',
        supabaseTable: 'knowledge_base'
    };

    // Popola campi dalla config salvata o defaults
    function populateConfigFields() {
        const saved = JSON.parse(localStorage.getItem('ariaConfig') || '{}');
        if (cfgWebhookUrl)    cfgWebhookUrl.value    = saved.webhookUrl    || DEFAULTS.webhookUrl;
        if (cfgSupabaseUrl)   cfgSupabaseUrl.value   = saved.supabaseUrl   || DEFAULTS.supabaseUrl;
        if (cfgSupabaseKey)   cfgSupabaseKey.value   = saved.supabaseKey   || DEFAULTS.supabaseKey;
        if (cfgSupabaseTable) cfgSupabaseTable.value = saved.supabaseTable || DEFAULTS.supabaseTable;
    }
    populateConfigFields();

    if (saveConfigBtn) saveConfigBtn.addEventListener('click', () => {
        const cfg = {
            webhookUrl:    cfgWebhookUrl?.value.trim()    || DEFAULTS.webhookUrl,
            supabaseUrl:   cfgSupabaseUrl?.value.trim()   || DEFAULTS.supabaseUrl,
            supabaseKey:   cfgSupabaseKey?.value.trim()   || DEFAULTS.supabaseKey,
            supabaseTable: cfgSupabaseTable?.value.trim() || DEFAULTS.supabaseTable
        };
        localStorage.setItem('ariaConfig', JSON.stringify(cfg));
        showConfigStatus('✅ Configurazione salvata correttamente!', 'success-msg');
    });

    if (resetConfigBtn) resetConfigBtn.addEventListener('click', () => {
        localStorage.removeItem('ariaConfig');
        populateConfigFields();
        showConfigStatus('🔄 Configurazione ripristinata ai valori predefiniti.', 'success-msg');
    });

    function showConfigStatus(msg, cls) {
        if (!configStatus) return;
        configStatus.textContent = msg;
        configStatus.className = `config-status ${cls}`;
        configStatus.classList.remove('hidden');
        setTimeout(() => configStatus.classList.add('hidden'), 4000);
    }

    // Bottoni copia & mostra/nascondi password
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.dataset.target);
            if (!target) return;
            navigator.clipboard.writeText(target.value).then(() => {
                const icon = btn.querySelector('i');
                icon.className = 'fas fa-check';
                setTimeout(() => { icon.className = 'fas fa-copy'; }, 2000);
            });
        });
    });

    document.querySelectorAll('.toggle-pwd-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.dataset.target);
            if (!target) return;
            const isHidden = target.type === 'password';
            target.type = isHidden ? 'text' : 'password';
            btn.querySelector('i').className = isHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
        });
    });

    // =============================================
    // SUPABASE – carica insights notturni
    // =============================================
    async function loadNightlyInsights() {
        const cfg = getConfig();
        if (!cfg.supabaseUrl || !cfg.supabaseKey || !window.supabase) {
            console.log('Credenziali Supabase non impostate. Mostro dati simulati.');
            return;
        }
        const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
        try {
            const { data, error } = await client
                .from(cfg.supabaseTable)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
            if (error) throw error;
            if (data && data.length > 0) {
                const tbody = document.querySelector('.activity-card tbody');
                if (!tbody) return;
                tbody.innerHTML = '';
                data.forEach(item => {
                    const tr   = document.createElement('tr');
                    let color  = 'var(--text-primary)';
                    const rel  = parseInt(String(item.relevance || '').replace('%',''));
                    if (!isNaN(rel)) { if (rel >= 90) color = 'var(--accent)'; else if (rel >= 60) color = 'var(--warning)'; }
                    const cls  = (item.status || '').toLowerCase().includes('index') ? 'completed' : 'processing';
                    tr.innerHTML = `
                        <td>${item.source || 'Sconosciuto'}</td>
                        <td>${item.topic_aggregation || item.title || 'Nessun Argomento'}</td>
                        <td><span style="color:${color};font-weight:bold;">${item.relevance || 'N/A'}</span></td>
                        <td><span class="status-badge ${cls}">${item.status || 'Elaborato'}</span></td>`;
                    tbody.appendChild(tr);
                });
            }
        } catch (err) {
            console.error('Errore Supabase:', err.message);
        }
    }
    loadNightlyInsights();

    // "Vedi Log Scansioni" → vai alla knowledge base
    const viewLogBtn = document.getElementById('viewLogBtn');
    if (viewLogBtn) viewLogBtn.addEventListener('click', () => switchView('knowledge'));

});
