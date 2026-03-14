document.addEventListener('DOMContentLoaded', () => {
    // Chat UI Elements
    const chatWidget = document.getElementById('chatWidget');
    const openChatBtn = document.getElementById('openChatBtn');
    const toggleChatBtn = document.getElementById('toggleChat');
    const chatHeader = document.getElementById('chatHeader');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    const initTime = document.getElementById('initTime');

    // Layout Navigation Elements
    const navDashboard = document.getElementById('nav-dashboard');
    const navKnowledge = document.getElementById('nav-knowledge');
    const dashboardGrid = document.querySelector('.dashboard-grid');
    const knowledgeView = document.getElementById('knowledgeView');

    // Layout Navigation Logic
    function switchView(viewName) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        
        if (viewName === 'dashboard') {
            navDashboard.classList.add('active');
            dashboardGrid.classList.remove('hidden');
            knowledgeView.classList.add('hidden');
        } else if (viewName === 'knowledge') {
            navKnowledge.classList.add('active');
            dashboardGrid.classList.add('hidden');
            knowledgeView.classList.remove('hidden');
            // Ensure graph renders correctly when suddenly becoming visible
            if (network) network.fit();
        }
    }

    navDashboard.addEventListener('click', (e) => { e.preventDefault(); switchView('dashboard'); });
    navKnowledge.addEventListener('click', (e) => { e.preventDefault(); switchView('knowledge'); });

    // Knowledge Base - Source Aggregator Logic
    const addSourceBtn = document.getElementById('addSourceBtn');
    const addSourceForm = document.getElementById('addSourceForm');
    const cancelSourceBtn = document.getElementById('cancelSourceBtn');
    const submitSourceBtn = document.getElementById('submitSourceBtn');
    const newSourceInput = document.getElementById('newSourceInput');
    const sourceList = document.getElementById('sourceList');

    addSourceBtn.addEventListener('click', () => {
        addSourceForm.classList.remove('hidden');
        newSourceInput.focus();
    });

    cancelSourceBtn.addEventListener('click', () => {
        addSourceForm.classList.add('hidden');
        newSourceInput.value = '';
    });

    submitSourceBtn.addEventListener('click', () => {
        const val = newSourceInput.value.trim();
        if(!val) return;
        
        const newCard = document.createElement('div');
        newCard.className = 'source-card';
        newCard.innerHTML = `
            <div class="source-icon web"><i class="fas fa-link"></i></div>
            <div class="source-info">
                <h4>${val.length > 20 ? val.substring(0,20)+'...' : val}</h4>
                <span>Custom Source • Processing...</span>
            </div>
        `;
        sourceList.insertBefore(newCard, sourceList.firstChild);
        
        addSourceForm.classList.add('hidden');
        newSourceInput.value = '';

        // Simulate processing complete after 2 seconds
        setTimeout(() => {
            newCard.querySelector('span').textContent = 'Custom Source • Processing Complete';
            newCard.querySelector('.source-icon').style.backgroundColor = 'rgba(35, 134, 54, 0.1)';
            newCard.querySelector('.source-icon').style.color = 'var(--success)';
            newCard.querySelector('.source-icon i').className = 'fas fa-check';
        }, 2000);
    });

    // Vis.js Graph Initialization
    let network = null;
    
    function initGraph() {
        const container = document.getElementById('knowledgeGraph');
        
        // Mock data for cement mortars research
        const nodes = new vis.DataSet([
            { id: 1, label: 'CM-841 (Core Formulation)', group: 'formulation', value: 30, title: 'High-Strength Portland Blend' },
            { id: 2, label: 'Portland Cement (Type I)', group: 'material', value: 20 },
            { id: 3, label: 'Fly Ash (Class F)', group: 'material', value: 15 },
            { id: 4, label: 'Silica Fume', group: 'material', value: 15 },
            { id: 5, label: 'Compressive Strength Test', group: 'test', value: 25, title: 'Results: 55 MPa at 28 days' },
            { id: 6, label: 'Curing Chamber A', group: 'environment', value: 10 },
            { id: 7, label: 'CM-840 (Geopolymer)', group: 'formulation', value: 25 },
            { id: 8, label: 'Alkaline Activator', group: 'material', value: 15 },
            { id: 9, label: 'Slag', group: 'material', value: 20 },
            { id: 10, label: 'Tensile Strength Test', group: 'test', value: 20 }
        ]);

        const edges = new vis.DataSet([
            { from: 1, to: 2, label: 'contains 65%' },
            { from: 1, to: 3, label: 'contains 25%' },
            { from: 1, to: 4, label: 'contains 10%' },
            { from: 1, to: 5, label: 'evaluated by' },
            { from: 5, to: 6, label: 'cured in' },
            { from: 7, to: 8, label: 'activated by' },
            { from: 7, to: 9, label: 'base material' },
            { from: 7, to: 10, label: 'evaluated by' },
            { from: 3, to: 9, label: 'comparative study' }
        ]);

        const data = { nodes: nodes, edges: edges };
        
        const options = {
            nodes: {
                shape: 'dot',
                font: { color: '#e6edf3', face: 'Outfit' },
                borderWidth: 2,
                shadow: true
            },
            edges: {
                color: { color: '#30363d', highlight: '#ff7b00' },
                font: { color: '#8b949e', face: 'Outfit', size: 12, align: 'middle' },
                arrows: { to: { enabled: true, scaleFactor: 0.5 } },
                smooth: { type: 'continuous' }
            },
            groups: {
                formulation: { color: { background: '#1f6feb', border: '#388bfd' } },
                material: { color: { background: '#238636', border: '#3fb950' } },
                test: { color: { background: '#d29922', border: '#e3b341' } },
                environment: { color: { background: '#8957e5', border: '#a371f7' } }
            },
            physics: {
                barnesHut: { gravitationalConstant: -3000, centralGravity: 0.3, springLength: 150 },
                stabilization: { iterations: 150 }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200
            }
        };

        network = new vis.Network(container, data, options);
        
        // Link Graph clicks to Chat
        network.on("click", function (params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const node = nodes.get(nodeId);
                
                // If chat is minimized, open it
                if (chatWidget.classList.contains('minimized')) {
                    openChat();
                }
                
                chatInput.value = `Tell me more about ${node.label}...`;
                chatInput.focus();
            }
        });
    }

    // Initialize graph on load
    initGraph();

    // Set initial time for first message
    if (initTime) {
        const now = new Date();
        initTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Toggle Chat Visibility
    function minimizeChat() {
        chatWidget.classList.add('minimized');
        openChatBtn.classList.remove('hidden');
    }

    function openChat() {
        chatWidget.classList.remove('minimized');
        openChatBtn.classList.add('hidden');
        chatInput.focus();
    }

    toggleChatBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        minimizeChat();
    });
    
    chatHeader.addEventListener('click', minimizeChat);
    openChatBtn.addEventListener('click', openChat);

    // Initial state: ensure chat is open, button is hidden
    openChatBtn.classList.add('hidden');

    const N8N_WEBHOOK_URL = 'https://lorenzolottici.app.n8n.cloud/webhook-test/fe68a097-f742-445d-b945-1bf311cb7987';
    
    // Create a loading element
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message ai-message loading-indicator';
    typingIndicator.innerHTML = `
        <div class="msg-content" style="display: flex; gap: 4px; align-items: center; padding: 12px 16px;">
            <div style="width: 6px; height: 6px; background: var(--text-secondary); border-radius: 50%; animation: pulse 1s infinite;"></div>
            <div style="width: 6px; height: 6px; background: var(--text-secondary); border-radius: 50%; animation: pulse 1s infinite 0.2s;"></div>
            <div style="width: 6px; height: 6px; background: var(--text-secondary); border-radius: 50%; animation: pulse 1s infinite 0.4s;"></div>
        </div>
    `;

    // Handle sending messages to n8n
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message
        appendMessage(text, 'user-message');
        chatInput.value = '';
        
        // Show typing indicator
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    chatInput: text,
                    sessionId: 'user-session-' + Date.now() // Simple session tracking
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            // Parse standard n8n output (can handle raw text or json with 'output' key)
            const data = await response.json();
            
            // Remove typing indicator
            if (chatMessages.contains(typingIndicator)) {
                chatMessages.removeChild(typingIndicator);
            }

            // Extract the actual text response based on standard n8n/langchain patterns
            let aiText = "I received a response but couldn't parse the message.";
            if (data.output) {
                aiText = data.output;
            } else if (data.text) {
                aiText = data.text;
            } else if (data.message) {
                aiText = data.message;
            } else if (typeof data === 'string') {
                aiText = data;
            } else {
                aiText = JSON.stringify(data); // Fallback to raw JSON if unknown format
            }

            appendMessage(aiText, 'ai-message');

        } catch (error) {
            console.error('Webhook Error:', error);
            if (chatMessages.contains(typingIndicator)) {
                chatMessages.removeChild(typingIndicator);
            }
            appendMessage(`Connection error: Unable to reach the AI assistant. Make sure the n8n webhook is active and listening.`, 'ai-message');
        }
    }

    function appendMessage(text, senderClass) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${senderClass}`;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        msgDiv.innerHTML = `
            <div class="msg-content">${text}</div>
            <span class="msg-time">${timeString}</span>
        `;
        
        chatMessages.appendChild(msgDiv);
        
        // Scroll to bottom with slight delay to ensure DOM update
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 50);
    }

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // --- Supabase Integration ---
    // Make sure to replace these with your actual Supabase URL and Anon Key
    const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
    const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

    let supabaseClient = null;
    
    // Only initialize if keys have been replaced
    if (SUPABASE_URL && SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' && window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    async function loadNightlyInsights() {
        if (!supabaseClient) {
            console.log("Supabase credentials not set. Showing mock insights.");
            return; // Leave the hardcoded HTML rows intact
        }

        try {
            // Replace 'knowledge_base' with your actual Supabase table name
            // Assuming table structure has: source, topic_aggregation, relevance, status
            const { data, error } = await supabaseClient
                .from('knowledge_base')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;

            if (data && data.length > 0) {
                const tableBody = document.querySelector('.activity-card tbody');
                tableBody.innerHTML = ''; // Clear mock data
                
                data.forEach(item => {
                    const tr = document.createElement('tr');
                    
                    // Determine relevance color
                    let relevanceColor = 'var(--text-primary)';
                    let relString = String(item.relevance || 'N/A');
                    
                    if (item.relevance) {
                        const numericRel = parseInt(relString.replace('%','').replace(/\s/g,''));
                        if (!isNaN(numericRel)) {
                            if (numericRel >= 90) relevanceColor = 'var(--accent)';
                            else if (numericRel >= 60) relevanceColor = 'var(--warning)';
                        }
                    }
                    
                    // Determine status classes
                    const statusClass = (item.status && item.status.toLowerCase().includes('index')) ? 'completed' : 'processing';
                    
                    tr.innerHTML = `
                        <td>${item.source || 'Unknown'}</td>
                        <td>${item.topic_aggregation || item.title || 'No Topic'}</td>
                        <td><span style="color: ${relevanceColor}; font-weight: bold;">${relString}</span></td>
                        <td><span class="status-badge ${statusClass}">${item.status || 'Processed'}</span></td>
                    `;
                    tableBody.appendChild(tr);
                });
            }
        } catch (err) {
            console.error("Supabase Fetch Error:", err.message);
        }
    }

    // Call on load
    loadNightlyInsights();

});
