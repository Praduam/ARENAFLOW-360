// ArenaFlow 360 - Smart Stadium GenAI & Simulation Service

// Local simulator state
let state = {
  crowdLevels: {
    'Gate A (Main Entry)': { level: 'Moderate', density: 65, color: '#eab308' },
    'Gate B (Transit Hub)': { level: 'High', density: 88, color: '#ef4444' },
    'Gate C (West Gates)': { level: 'Low', density: 25, color: '#22c55e' },
    'Gate D (VIP & Accessible)': { level: 'Low', density: 15, color: '#22c55e' },
    'Sector 100 (Lower Bowl)': { level: 'High', density: 92, color: '#ef4444' },
    'Sector 200 (Club Level)': { level: 'Moderate', density: 55, color: '#eab308' },
    'Sector 300 (Upper Deck)': { level: 'Low', density: 40, color: '#22c55e' },
    'Concourse (North)': { level: 'High', density: 82, color: '#ef4444' },
    'Concourse (South)': { level: 'Moderate', density: 60, color: '#eab308' }
  },
  parking: {
    'Lot A (Public)': { occupied: 720, total: 1000, status: 'Active' },
    'Lot B (Reserved/VIP)': { occupied: 450, total: 500, status: 'Filling Fast' },
    'Lot C (Bus/Rideshare)': { occupied: 80, total: 200, status: 'Moderate' },
    'Lot D (Accessible)': { occupied: 65, total: 150, status: 'Spaces Available' }
  },
  shuttles: [
    { id: 'S1', route: 'MetLife Stadium <=> Secaucus Junction', estArrival: '4 min', status: 'On Schedule', loads: 'High' },
    { id: 'S2', route: 'MetLife Stadium <=> Lot A/B', estArrival: '2 min', status: 'On Schedule', loads: 'Moderate' },
    { id: 'S3', route: 'MetLife Stadium <=> Downtown Express Hub', estArrival: '9 min', status: 'Delayed (Traffic)', loads: 'Very High' }
  ],
  incidents: [
    { id: 'INC-1024', category: 'Maintenance', sector: 'Sector 300 (Upper Deck)', description: 'Beverage spill near Row 14, stairs slippery.', status: 'Dispatched', priority: 'Medium', reportedAt: '20:10', assignedTo: 'Volunteer Team B' },
    { id: 'INC-1025', category: 'Medical', sector: 'Sector 100 (Lower Bowl)', description: 'Fan feeling lightheaded near Section 112.', status: 'Resolved', priority: 'High', reportedAt: '19:55', assignedTo: 'First Aid Station 2' },
    { id: 'INC-1026', category: 'Ticketing', sector: 'Gate B (Transit Hub)', description: 'Turnstile #4 ticket scanning latency.', status: 'Investigating', priority: 'Low', reportedAt: '20:15', assignedTo: 'Tech Support Team A' }
  ],
  volunteers: [
    { id: 'V-201', name: 'Diego Ramirez', role: 'Language Assistant (ES/EN)', status: 'Active', checkedIn: '17:30', gate: 'Gate A' },
    { id: 'V-202', name: 'Yuki Tanaka', role: 'Usher / Section Lead', status: 'Active', checkedIn: '17:45', gate: 'Sector 100' },
    { id: 'V-203', name: 'Sarah Al-Farsi', role: 'Accessibility Helper', status: 'On Break', checkedIn: '18:00', gate: 'Gate D' }
  ],
  matchInfo: {
    teams: { home: 'India', away: 'Pakistan' },
    score: { home: 1, away: 0 },
    time: '74th Minute',
    attendance: 82450,
    status: 'In Progress',
    weather: 'Clear, 24°C'
  },
  apiKey: localStorage.getItem('arenaflow_gemini_apikey') || ''
};

// Listeners list to notify when simulation updates
const listeners = [];
function notifyStateChange() {
  listeners.forEach(cb => cb({ ...state }));
}

export const aiService = {
  getState: () => ({ ...state }),

  subscribe: (cb) => {
    listeners.push(cb);
    return () => {
      const idx = listeners.indexOf(cb);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  },

  updateApiKey: (key) => {
    state.apiKey = key;
    localStorage.setItem('arenaflow_gemini_apikey', key);
    notifyStateChange();
  },

  updateCrowdDensity: (sector, density) => {
    if (state.crowdLevels[sector]) {
      state.crowdLevels[sector].density = density;
      if (density < 35) state.crowdLevels[sector].level = 'Low';
      else if (density < 75) state.crowdLevels[sector].level = 'Moderate';
      else state.crowdLevels[sector].level = 'High';
      notifyStateChange();
    }
  },

  addIncident: (incident) => {
    const newInc = {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Open',
      reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      assignedTo: 'Unassigned',
      ...incident
    };
    state.incidents = [newInc, ...state.incidents];
    notifyStateChange();
    return newInc;
  },

  updateIncidentStatus: (id, status, assignedTo) => {
    state.incidents = state.incidents.map(inc => {
      if (inc.id === id) {
        return { ...inc, status, ...(assignedTo ? { assignedTo } : {}) };
      }
      return inc;
    });
    notifyStateChange();
  },

  checkinVolunteer: (vol) => {
    const newVol = {
      id: `V-${Math.floor(200 + Math.random() * 800)}`,
      status: 'Active',
      checkedIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...vol
    };
    state.volunteers = [...state.volunteers, newVol];
    notifyStateChange();
    return newVol;
  },

  updateVolunteerStatus: (id, status) => {
    state.volunteers = state.volunteers.map(v => {
      if (v.id === id) return { ...v, status };
      return v;
    });
    notifyStateChange();
  },

  updateMatchScore: (home, away, time) => {
    state.matchInfo.score.home = home;
    state.matchInfo.score.away = away;
    state.matchInfo.score.time = time;
    notifyStateChange();
  },

  // FAN ASSISTANT AI (Simulated or Real Gemini API)
  getFanAIResponse: async (query, lang = 'English') => {
    if (state.apiKey) {
      return await callGeminiAPI(query, `You are ArenaFlow, a friendly, multilingual AI assistant at MetLife Stadium for the FIFA World Cup 2026. Respond in ${lang}. Provide clear, actionable stadium, navigation, transit, and accessibility advice.`);
    }
    
    // Offline / Mock fallback: Wait 800ms to simulate response latency
    await new Promise(r => setTimeout(r, 850));
    const lowerQuery = query.toLowerCase();
    
    // Context database mapping
    const qa = [
      {
        keys: ['restroom', 'bathroom', 'toilet', 'wc', 'accessible restroom', 'elevator', 'lift'],
        ans: {
          English: `**Accessible restrooms** are available on all levels:
- **Lower Level (Sector 100):** Near Sections 104, 117, and 128 (next to the main elevator cores).
- **Club Level (Sector 200):** Near Sections 207 and 232.
- **Upper Level (Sector 300):** Near Sections 315 and 339.
All accessible family restrooms feature power-assisted doors, lower sinks, and grab bars. If you need assistance, please flag an usher or head to **Gate D (VIP & Accessible Entrance)** where our Accessibility Helpers are stationed.`,
          Spanish: `Los **baños accesibles** están disponibles en todos los niveles:
- **Nivel Inferior (Sector 100):** Cerca de las Secciones 104, 117 y 128 (junto a los ascensores principales).
- **Nivel Club (Sector 200):** Cerca de las Secciones 207 y 232.
- **Nivel Superior (Sector 300):** Cerca de las Secciones 315 y 339.
Todos los baños familiares accesibles cuentan con puertas automáticas y barras de apoyo. Si necesita ayuda, busque a un voluntario de chaleco verde o diríjase a la **Puerta D (Acceso VIP y Accesibilidad)**.`,
          French: `Des **toilettes accessibles** sont disponibles à tous les niveaux :
- **Niveau inférieur (Secteur 100) :** Près des Sections 104, 117 et 128 (à côté des ascenseurs principaux).
- **Niveau Club (Secteur 200) :** Près des Sections 207 et 232.
- **Niveau supérieur (Secteur 300) :** Près des Sections 315 et 339.
Toutes nos toilettes familiales disposent de portes automatiques et de barres d'appui. Pour obtenir de l'aide, contactez un bénévole ou rendez-vous à la **Porte D (VIP & Accessibilité)**.`
        }
      },
      {
        keys: ['transit', 'secaucus', 'train', 'bus', 'shuttle', 'subway', 'station', 'transport', 'uber', 'taxi', 'rideshare'],
        ans: {
          English: `**Transportation Guide to MetLife Stadium:**
1. **Train / Rail:** The NJ Transit Meadowlands Rail Station is directly outside **Gate B**. Trains run continuously to Secaucus Junction connection hub. Current queue time is approx. 12 minutes.
2. **Shuttles:** Shuttle **S1** runs to Secaucus Hub every 4 minutes. Shuttle **S3** (Downtown Express) is currently experiencing minor traffic delays (~9 min arrival).
3. **Rideshare (Uber/Lyft):** Dedicated pickup zone is in **Lot C**. Follow signs from Gate C. Do not order rides until you reach Lot C due to security perimeter lockdowns.`,
          Spanish: `**Guía de Transporte para el Estadio MetLife:**
1. **Tren:** La estación de tren NJ Transit Meadowlands está justo afuera de la **Puerta B**. Los trenes conectan con la estación de Secaucus. Tiempo de espera actual: ~12 minutos.
2. **Traslados (Shuttles):** El autobús **S1** sale hacia Secaucus cada 4 minutos. El **S3** (Downtown Express) tiene retrasos menores por tráfico (~9 min de espera).
3. **Viajes Compartidos (Uber/Lyft):** Zona de recogida designada en el **Lote C**. Siga las señales de la Puerta C.`,
          French: `**Guide des transports pour le Stade MetLife :**
1. **Train :** La gare NJ Transit Meadowlands se situe juste devant la **Porte B**. Trains continus vers Secaucus Junction. Attente estimée : 12 minutes.
2. **Navettes (Shuttles) :** La navette **S1** part toutes les 4 minutes. La navette **S3** (Express Centre-ville) subit un léger trafic (~9 min d'attente).
3. **Covoiturage (Uber/Lyft) :** Zone de prise en charge dédiée au **Parking C** (depuis la Porte C).`
        }
      },
      {
        keys: ['food', 'eat', 'vegan', 'halal', 'kosher', 'water', 'drink', 'beer', 'hot dog', 'burger'],
        ans: {
          English: `**Stadium Concessions & Dining Options:**
- **Vegan/Vegetarian:** Green Field Eats (Sector 100, near Sec 117) offers plant-based burgers and fresh salads.
- **Halal:** Global Bites (Sector 200, near Sec 224) offers certified halal wraps and chicken platters.
- **Classic Stadium Food:** Hot dogs, pretzels, and beverages are available at local counters in every sector.
- **Sustainability Note:** MetLife Stadium is a zero-plastic facility. Refill your reusable bottles at our free smart water fountains near Sections 110, 142, 220, and 312!`,
          Spanish: `**Opciones de Comida y Bebida:**
- **Vegano/Vegetariano:** Green Field Eats (Sector 100, cerca de Secc 117) tiene hamburguesas veganas y ensaladas.
- **Halal:** Global Bites (Sector 200, cerca de Secc 224) ofrece wraps halal y platos de pollo.
- **Nota de Sostenibilidad:** ¡El estadio es libre de plástico! Llene sus botellas reutilizables en las fuentes de agua gratuitas cerca de las Secciones 110, 142, 220 y 312.`,
          French: `**Restauration et Boissons dans le Stade :**
- **Végétalien/Végétarien :** Green Field Eats (Secteur 100, près de la Sec 117) propose des burgers végétaux et salades.
- **Halal :** Global Bites (Secteur 200, près de la Sec 224) sert des wraps halal certifiés.
- **Éco-responsable :** Notre stade élimine le plastique jetable ! Remplissez vos gourdes aux fontaines gratuites près des Sections 110, 142, 220 et 312.`
        }
      },
      {
        keys: ['gate', 'entry', 'entrance', 'security', 'bag', 'backpack', 'ticket'],
        ans: {
          English: `**Entry Gates & Security Policies:**
- **Gate Status:** Gates A, B, and C are open. Gate B is currently busy due to rail arrivals. **Gate D** is the designated VIP, media, and accessible entry.
- **Bag Policy:** Clear bags only (maximum size: 12" x 6" x 12"). Small clutches smaller than 4.5" x 6.5" are permitted. Backpacks and large luggage are not allowed.
- **Tickets:** Please have your digital mobile tickets open and active in your wallet app before reaching the scanning stanchions. Screenshots are NOT accepted due to security protocols.`,
          Spanish: `**Puertas de Acceso y Políticas de Seguridad:**
- **Estado de Puertas:** A, B y C abiertas. La Puerta B está con mayor flujo. La **Puerta D** es para accesibilidad, VIP y prensa.
- **Bolsas:** Solo bolsas transparentes (máx 30 x 15 x 30 cm) o carteras pequeñas. No se permiten mochilas.
- **Boletos:** Tenga sus boletos digitales listos en la aplicación móvil de boletos. No se aceptan capturas de pantalla.`
        }
      },
      {
        keys: ['emergency', 'accident', 'medical', 'police', 'first aid', 'lost', 'help'],
        ans: {
          English: `🚨 **EMERGENCY ASSISTANCE INSTRUCTIONS:**
- **First Aid Stations:** Located at Section 109, 144, 219, and 302.
- **Text Helpline:** Text "WCPD <your sector and issue>" to 78247 for immediate, quiet security assistance.
- **In-person help:** Locate any volunteer (green jackets) or security officer (yellow vests) immediately.
- **Evacuation:** In case of emergency, exit via the nearest staircase following stadium illuminated indicators. Do NOT use elevators unless instructed by emergency crew.`,
          Spanish: `🚨 **INSTRUCCIONES DE EMERGENCIA Y ASISTENCIA:**
- **Estaciones de Primeros Auxilios:** Ubicadas en Secciones 109, 144, 219 y 302.
- **Línea de Ayuda SMS:** Envíe un mensaje con "WCPD <su sector y problema>" al 78247 para ayuda inmediata.
- **Evacuación:** En caso de emergencia, siga las flechas luminiscentes hacia la salida más cercana.`
        }
      }
    ];

    // Check matches
    for (const item of qa) {
      if (item.keys.some(k => lowerQuery.includes(k))) {
        return item.ans[lang] || item.ans['English'];
      }
    }

    // Default responses based on language
    const defaults = {
      English: `Hello! I am ArenaFlow, your AI Assistant. I can help you with stadium routes, accessible bathrooms, ticket rules, transit wait times, and vegan food locations. Could you please specify your sector or question?`,
      Spanish: `¡Hola! Soy ArenaFlow, tu asistente de Inteligencia Artificial. Puedo ayudarte con rutas, baños accesibles, comida vegana, y transporte. ¿En qué sector del estadio te encuentras o cuál es tu consulta?`,
      French: `Bonjour ! Je suis ArenaFlow, votre assistant IA. Je peux vous aider pour les itinéraires dans le stade, les toilettes accessibles, la restauration et les transports. Pouvez-vous préciser votre question ou votre secteur ?`,
      Arabic: `مرحباً! أنا ArenaFlow، مساعدك الذكي في الملعب. يمكنني مساعدتك في العثور على البوابات، دورات المياه المهيئة، مواعيد الحافلات، وخيارات الطعام. ما هو استفسارك؟`,
      German: `Hallo! Ich bin ArenaFlow, Ihr KI-Assistent. Ich helfe Ihnen bei Stadionplänen, barrierefreien Toiletten, Ticketregeln und Verkehrsverbindungen. Wie kann ich Ihnen helfen?`,
      Japanese: `こんにちは！アリーナフローAIアシスタントです。スタジアム案内、バリアフリートイレ、交通機関、フードエリアについてお尋ねください。`,
      Portuguese: `Olá! Sou o ArenaFlow, o seu assistente de Inteligência Artificial. Posso ajudar com rotas do estádio, banheiros acessíveis, transporte e opções de alimentação. Qual a sua dúvida?`
    };

    return defaults[lang] || defaults['English'];
  },

  // STAFF ASSISTANT AI
  getStaffAIResponse: async (query) => {
    if (state.apiKey) {
      return await callGeminiAPI(query, `You are the ArenaFlow Stadium Operations Oracle for FIFA World Cup 2026. You assist venue managers, logistics, and incident coordinators. Provide precise operational advice using technical, concise directives.`);
    }

    await new Promise(r => setTimeout(r, 900));
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('lightning') || lowerQuery.includes('weather') || lowerQuery.includes('storm')) {
      return `### ⚡ FIFA 2026 Weather Emergency Protocol (Code Orange)
1. **Detection:** Stadium Lightning Alert System triggers when strike detected within 8 miles.
2. **Operations:** Suspend match play immediately. Broadcast "Severe Weather - Take Cover" on video screens.
3. **Evacuation:** Instruct ushers to guide upper bowl (Sector 300) into enclosed concourses. Open VIP lounges for general seating.
4. **Resumption:** Play cannot resume until 30 minutes after the last recorded strike within 8 miles.`;
    }

    if (lowerQuery.includes('spill') || lowerQuery.includes('slip') || lowerQuery.includes('maintenance')) {
      return `### 🧹 Maintenance & Sanitation Dispatch Guide
- **Code:** Minor Spill / Hazard
- **Procedure:** Log incident in Staff Portal. System tags the sector and selects nearest standby Volunteer crew (e.g., Volunteer Team B for Upper Deck).
- **Communication:** Dispatch via radio: *"Dispatch Team B to Sector 300, Section 312, Row 14. Beverage spill. Acknowledge."*
- **SLA:** Clean-up and safety sign placement must be completed within 7 minutes.`;
    }

    if (lowerQuery.includes('medical') || lowerQuery.includes('injured') || lowerQuery.includes('heart') || lowerQuery.includes('faint')) {
      return `### 🚑 Medical Emergency Response Protocol (Code Red)
1. **Alert:** Staff notes Section & Row. Notify Dispatch immediately.
2. **Dispatch:** Dispatch nearest Emergency Medical Technician (EMT) Foot Patrol. Red First Aid Station 2 covers Sections 100-140.
3. **Escort:** Stretcher team dispatched from nearest tunnel if EMT requests. Keep tunnel access clear of fans.
4. **Logistics:** If ambulance transport required, route via Gate D (VIP & Accessible ramp).`;
    }

    if (lowerQuery.includes('capacity') || lowerQuery.includes('crowd') || lowerQuery.includes('gate b') || lowerQuery.includes('congestion')) {
      return `### 🚶 Crowd Management & Transit Congestion Tactics
- **Observation:** Gate B (Transit Hub) is at 88% capacity due to high NJ Transit passenger arrivals.
- **Intervention Plan:**
  1. Trigger dynamic message boards at Train Exit to redirect incoming crowds to **Gate A** (5-minute walk, currently 65% capacity).
  2. Deploy 4 additional usher volunteers to Secaucus Junction shuttle loading zone to organize queues.
  3. Increase ticket scanner sensitivity settings on Turnstiles 1-8.`;
    }

    return `### 📊 ArenaFlow Operations Oracle
Operational queries recognized:
* **"weather protocol"** or **"lightning policy"** (severe weather protocols)
* **"spill dispatch"** or **"cleaning protocol"** (sanitation response SLAs)
* **"medical emergency"** or **"Code Red"** (EMT coordination guidelines)
* **"crowd capacity Gate B"** (crowd density management steps)

Please specify your topic or check the real-time graphs for instant stats.`;
  },

  // GENAI SMART DISPATCH DRAFTER
  generateDispatchDraft: (incident) => {
    const { category, sector, description, priority } = incident;
    const priorityCode = priority === 'High' ? 'CODE RED - IMMEDIATE' : priority === 'Medium' ? 'CODE AMBER - URGENT' : 'STANDARD ASSIGNMENT';
    
    return `[DISPATCH ORDER]
LEVEL: ${priorityCode}
TARGET ZONE: ${sector}
INCIDENT: Category [${category}] - ${description}
INSTRUCTIONS: Standby crews check-in on channel 4. Deploy to target location immediately. Report back when site is secured/cleared.`;
  },

  // TRANSLATION SERVICES FOR VOLUNTEERS
  getTranslation: (text, targetLang) => {
    // Quick mockup database for standard helper phrases
    const phrases = {
      'Welcome to MetLife Stadium! Please show your digital ticket.': {
        Spanish: '¡Bienvenido al Estadio MetLife! Por favor, muestre su boleto digital.',
        French: 'Bienvenue au Stade MetLife ! Veuillez présenter votre billet numérique.',
        Arabic: 'مرحباً بكم في ملعب متلايف! يرجى إظهار تذكرتكم الرقمية.',
        German: 'Willkommen im MetLife Stadium! Bitte zeigen Sie Ihr digitales Ticket.',
        Japanese: 'メットライフ・スタジアムへようこそ！デジタルチケットをご提示ください。',
        Portuguese: 'Bem-vindo ao MetLife Stadium! Por favor, mostre seu ingresso digital.'
      },
      'The nearest accessible restroom is down the concourse near Section 104.': {
        Spanish: 'El baño accesible más cercano está en el pasillo, cerca de la Sección 104.',
        French: 'Les toilettes accessibles les plus proches sont dans le couloir, près de la Section 104.',
        Arabic: 'أقرب دورة مياه مهيئة تقع في الممر بالقرب من القسم 104.',
        German: 'Die nächste barrierefreie Toilette befindet sich weiter hinten im Gang bei Sektor 104.',
        Japanese: '最も近いバリアフリートイレは、セクション104近くのコンコースにあります。',
        Portuguese: 'O banheiro acessível mais próximo fica no corredor perto da Seção 104.'
      },
      'In case of emergency, please follow me to the nearest exit stairs.': {
        Spanish: 'En caso de emergencia, por favor sígame hacia las escaleras de salida más cercanas.',
        French: 'En cas d\'urgence, veuillez me suivre vers les escaliers de secours les plus proches.',
        Arabic: 'في حالة الطوارئ، يرجى اتباعي إلى أقرب سلم خروج.',
        German: 'Im Notfall folgen Sie mir bitte zu den nächsten Notausgangstreppen.',
        Japanese: '緊急の際は、私について最も近い非常口の階段へ進んでください。',
        Portuguese: 'Em caso de emergência, siga-me até as escadas de saída mais próximas.'
      },
      'Bottled water and free refill fountains are available right around the corner.': {
        Spanish: 'El agua embotellada y las fuentes de agua gratuitas están a la vuelta de la esquina.',
        French: 'Des bouteilles d\'eau et des fontaines gratuites sont disponibles juste au coin de la rue.',
        Arabic: 'تتوفر المياه المعبأة ونوافير الشرب المجانية قاب قوسين أو أدنى.',
        German: 'Flaschenwasser und kostenlose Trinkbrunnen finden Sie gleich um die Ecke.',
        Japanese: 'ペットボトルの水と無料の給水機は、すぐ角を曲がったところにあります。',
        Portuguese: 'Garrafas de água e fontes de recarga gratuitas estão disponíveis logo na esquina.'
      }
    };

    // Fallback translation rules (simulated translator)
    if (phrases[text] && phrases[text][targetLang]) {
      return phrases[text][targetLang];
    }

    const translationsFallback = {
      English: `[English]: "${text}" (Simulated)`,
      Spanish: `[Traducido al Español]: "${text}" (Simulado)`,
      French: `[Traduit en Français]: "${text}" (Simulé)`,
      Arabic: `[مترجم إلى العربية]: "${text}" (محاكاة)`,
      German: `[Ins Deutsche übersetzt]: "${text}" (Simuliert)`,
      Japanese: `[日本語訳]: "${text}" (シミュレート済み)`,
      Portuguese: `[Traduzido para o Português]: "${text}" (Simulado)`
    };

    return translationsFallback[targetLang] || text;
  }
};

// GEMINI API CONNECTOR
async function callGeminiAPI(prompt, systemInstruction) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
        })
      }
    );
    if (!response.ok) {
      let errMsg = `HTTP Error ${response.status}`;
      try {
        const err = await response.json();
        errMsg = err.error?.message || errMsg;
      } catch {
        // Fallback if response is not JSON
      }
      throw new Error(errMsg);
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';
  } catch (error) {
    console.error('Gemini API Error:', error);
    return `❌ **Connection Error:** ${error.message}. Falling back to simulated response...\n\n` + 
           `*Make sure your API key is correct in Developer Settings, or check your internet connection.*`;
  }
}
