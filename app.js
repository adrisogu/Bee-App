// ==========================================================================
// SPELLING BEE KIDS — Lógica principal (app.js)
//
// Estructura de este archivo:
//   1. Datos y configuración (logros, mensajes, banco de palabras)
//   2. Sistema de palabras con categorías compartidas
//   3. Variables de estado del juego
//   4. Almacenamiento (localStorage)
//   5. Voz (Text-To-Speech)
//   6. Navegación entre pantallas
//   7. Pantalla Selector (categoría, nivel, timer, word count)
//   8. Lógica del juego (cargar palabra, validar, temporizador)
//   9. Panel de administración (agregar, importar, eliminar)
//  10. Estadísticas
//  11. Toast (mensaje flotante)
//  12. Inicialización
// ==========================================================================


// ==========================================================================
// 1. DATOS Y CONFIGURACIÓN GENERAL
// ==========================================================================

/**
 * Logros que el estudiante puede desbloquear.
 * req: función que recibe las estadísticas (s) y devuelve true/false.
 * Para AGREGAR un logro: copia una línea y cambia id/icon/label/condición.
 */
const ACHIEVEMENTS = [
  { id:'first',   icon:'🥇', label:'First Word!',       req: s => s.totalWords >= 1   },
  { id:'ten',     icon:'🔟', label:'10 Words',           req: s => s.totalWords >= 10  },
  { id:'fifty',   icon:'5️⃣0️⃣', label:'50 Words',        req: s => s.totalWords >= 50  },
  { id:'hundred', icon:'💯', label:'100 Words',          req: s => s.totalWords >= 100 },
  { id:'stars10', icon:'⭐', label:'10 Stars',           req: s => s.totalStars >= 10  },
  { id:'stars50', icon:'🌟', label:'50 Stars',           req: s => s.totalStars >= 50  },
  { id:'perfect', icon:'💎', label:'Perfect Session',    req: s => s.perfectSessions >= 1 },
];

/**
 * Mensajes de felicitación al completar una palabra.
 * Se elige uno al azar cada vez. Puedes editar o agregar más mensajes.
 */
const SUCCESS_MSGS = [
  'Great Job! 🎉','Excellent! 🌟','Amazing! 🚀',
  'Well Done! 👏','Superstar! ⭐','Fantastic! 🎊','Brilliant! 💡'
];

// ==========================================================================
// 2. SISTEMA DE PALABRAS CON CATEGORÍAS COMPARTIDAS
//
// En lugar de duplicar una entrada por cada categoría en la que aparece
// una palabra, cada entrada tiene un campo "cats" que es un ARRAY de
// categorías. Esto evita duplicados en el código manteniendo la
// disponibilidad de cada palabra para todas sus categorías.
//
// Ejemplo:
//   { emoji:'🐶', word:'DOG', cats:['Camila','Sebas'] }
//   → disponible al filtrar por "Camila", por "Sebas" o por "All".
//
// Para AGREGAR una nueva palabra:
//   - Solo en una categoría: cats:['Camila']
//   - En varias categorías:  cats:['Camila','Sebas']
//
// ⚠️  NO dupliques entradas: si DOG aparece en Camila y Sebas, ponla
//     UNA sola vez con cats:['Camila','Sebas'].
// ==========================================================================

/**
 * Banco de palabras por defecto.
 * Se usa la primera vez que se abre la app o si el usuario borra el banco.
 *
 * Palabras exclusivas de Camila (solo en cats:['Camila']):
 *   HAT, CAP, RAT, BAG, FAN, PAN, VAN, JAM, MAP, RED, BED, PEN, NET,
 *   LEG, WET, HEN, TEN, JET, PIG, SIT, DIG, FIX, LIP, PIN, FOX, BOX,
 *   SHE, HE, ONE, TWO, THREE, BALL, MILK, FISH, APPLE, FROG, COW, CAT
 *
 * Palabras exclusivas de Sebas (solo en cats:['Sebas']):
 *   SON, SAD, FLY, RUN, BEAR, LION, FAST, SLOW, CLEAN, PANDA, WHALE,
 *   WATER, HAPPY, SMALL, RABBIT, DOLPHIN, PENGUIN, PARROT, KITCHEN,
 *   BEDROOM, BATHROOM, HABITAT, GRANDPA, GRANDMA, KANGAROO, DAUGHTER,
 *   GRANDSON, GRANDDAUGHTER, OCEAN, LAND, SWIM, DIRTY, SHORT, TALL
 *
 * Palabras compartidas (cats:['Camila','Sebas']): BAT, BIG, DAD, DOG, HOT, MOM
 */
const DEFAULT_WORDS = [
  // ---------- Exclusivas de Camila ----------
  { emoji:'🐱', word:'CAT',   cats:['Camila'] },
  { emoji:'🎩', word:'HAT',   cats:['Camila'] },
  { emoji:'🧢', word:'CAP',   cats:['Camila'] },
  { emoji:'🐀', word:'RAT',   cats:['Camila'] },
  { emoji:'🎒', word:'BAG',   cats:['Camila'] },
  { emoji:'🌀', word:'FAN',   cats:['Camila'] },
  { emoji:'🍳', word:'PAN',   cats:['Camila'] },
  { emoji:'🚐', word:'VAN',   cats:['Camila'] },
  { emoji:'🍓', word:'JAM',   cats:['Camila'] },
  { emoji:'🗺️', word:'MAP',   cats:['Camila'] },
  { emoji:'🔴', word:'RED',   cats:['Camila'] },
  { emoji:'🛏️', word:'BED',   cats:['Camila'] },
  { emoji:'🖊️', word:'PEN',   cats:['Camila'] },
  { emoji:'🥅', word:'NET',   cats:['Camila'] },
  { emoji:'🦵', word:'LEG',   cats:['Camila'] },
  { emoji:'💧', word:'WET',   cats:['Camila'] },
  { emoji:'🐔', word:'HEN',   cats:['Camila'] },
  { emoji:'🔟', word:'TEN',   cats:['Camila'] },
  { emoji:'✈️', word:'JET',   cats:['Camila'] },
  { emoji:'🐷', word:'PIG',   cats:['Camila'] },
  { emoji:'🪑', word:'SIT',   cats:['Camila'] },
  { emoji:'⛏️', word:'DIG',   cats:['Camila'] },
  { emoji:'🔧', word:'FIX',   cats:['Camila'] },
  { emoji:'👄', word:'LIP',   cats:['Camila'] },
  { emoji:'📌', word:'PIN',   cats:['Camila'] },
  { emoji:'🦊', word:'FOX',   cats:['Camila'] },
  { emoji:'📦', word:'BOX',   cats:['Camila'] },
  { emoji:'👩', word:'SHE',   cats:['Camila'] },
  { emoji:'🧑🏻', word:'HE',  cats:['Camila'] },
  { emoji:'1️⃣', word:'ONE',   cats:['Camila'] },
  { emoji:'2️⃣', word:'TWO',   cats:['Camila'] },
  { emoji:'3️⃣', word:'THREE', cats:['Camila'] },
  { emoji:'⚽', word:'BALL',   cats:['Camila'] },
  { emoji:'🥛', word:'MILK',   cats:['Camila'] },
  { emoji:'🐟', word:'FISH',   cats:['Camila'] },
  { emoji:'🍎', word:'APPLE',  cats:['Camila'] },
  { emoji:'🐸', word:'FROG',   cats:['Camila'] },
  { emoji:'🐮', word:'COW',    cats:['Camila'] },

  // ---------- Compartidas: Camila + Sebas ----------
  { emoji:'🦇', word:'BAT',   cats:['Camila','Sebas'] },
  { emoji:'🐘', word:'BIG',   cats:['Camila','Sebas'] },
  { emoji:'👨', word:'DAD',   cats:['Camila','Sebas'] },
  { emoji:'🐶', word:'DOG',   cats:['Camila','Sebas'] },
  { emoji:'☀️', word:'HOT',   cats:['Camila','Sebas'] },
  { emoji:'👩', word:'MOM',   cats:['Camila','Sebas'] },

  // ---------- Exclusivas de Sebas ----------
  { emoji:'👦', word:'SON',          cats:['Sebas'] },
  { emoji:'😢', word:'SAD',          cats:['Sebas'] },
  { emoji:'✈️', word:'FLY',          cats:['Sebas'] },
  { emoji:'🏃', word:'RUN',          cats:['Sebas'] },
  { emoji:'🐻', word:'BEAR',         cats:['Sebas'] },
  { emoji:'🦁', word:'LION',         cats:['Sebas'] },
  { emoji:'🏍️', word:'FAST',         cats:['Sebas'] },
  { emoji:'🐢', word:'SLOW',         cats:['Sebas'] },
  { emoji:'🧼', word:'CLEAN',        cats:['Sebas'] },
  { emoji:'🐼', word:'PANDA',        cats:['Sebas'] },
  { emoji:'🐋', word:'WHALE',        cats:['Sebas'] },
  { emoji:'💦', word:'WATER',        cats:['Sebas'] },
  { emoji:'😊', word:'HAPPY',        cats:['Sebas'] },
  { emoji:'🐭', word:'SMALL',        cats:['Sebas'] },
  { emoji:'🐰', word:'RABBIT',       cats:['Sebas'] },
  { emoji:'🐬', word:'DOLPHIN',      cats:['Sebas'] },
  { emoji:'🐧', word:'PENGUIN',      cats:['Sebas'] },
  { emoji:'🦜', word:'PARROT',       cats:['Sebas'] },
  { emoji:'🍳', word:'KITCHEN',      cats:['Sebas'] },
  { emoji:'🛏️', word:'BEDROOM',      cats:['Sebas'] },
  { emoji:'🚿', word:'BATHROOM',     cats:['Sebas'] },
  { emoji:'🏜️', word:'HABITAT',      cats:['Sebas'] },
  { emoji:'👴', word:'GRANDPA',      cats:['Sebas'] },
  { emoji:'👵', word:'GRANDMA',      cats:['Sebas'] },
  { emoji:'🦘', word:'KANGAROO',     cats:['Sebas'] },
  { emoji:'👧', word:'DAUGHTER',     cats:['Sebas'] },
  { emoji:'👦', word:'GRANDSON',     cats:['Sebas'] },
  { emoji:'👧', word:'GRANDDAUGHTER',cats:['Sebas'] },
  { emoji:'🌊', word:'OCEAN',        cats:['Sebas'] },
  { emoji:'🌱', word:'LAND',         cats:['Sebas'] },
  { emoji:'🏊', word:'SWIM',         cats:['Sebas'] },
  { emoji:'🟫', word:'DIRTY',        cats:['Sebas'] },
  { emoji:'🩳', word:'SHORT',        cats:['Sebas'] },
  { emoji:'🦒', word:'TALL',         cats:['Sebas'] },
];

/**
 * Convierte el formato interno (cats:[…]) al formato plano (cat: string)
 * que usa el sistema de juego y administración para facilitar la iteración.
 * Una palabra con cats:['Camila','Sebas'] se EXPANDE en dos entradas
 * solo en memoria (para filtrado y visualización), pero en el banco de datos
 * se guarda como una sola entrada con cats:[…].
 *
 * @param {Array} wordList - Lista con el formato { emoji, word, cats }
 * @returns {Array} Lista plana con { emoji, word, cat } (una por categoría)
 */
function expandWords(wordList) {
  const result = [];
  for (const entry of wordList) {
    const categories = entry.cats || [entry.cat || 'Other'];
    for (const cat of categories) {
      result.push({ emoji: entry.emoji, word: entry.word, cat });
    }
  }
  return result;
}

/**
 * Convierte el formato plano (cat: string) de vuelta al formato compacto
 * (cats:[…]) para guardado en localStorage.
 * Agrupa todas las categorías de una misma palabra en un solo objeto.
 *
 * @param {Array} flatList - Lista plana con { emoji, word, cat }
 * @returns {Array} Lista compacta con { emoji, word, cats }
 */
function compactWords(flatList) {
  const map = new Map();
  for (const entry of flatList) {
    const key = entry.word.toUpperCase();
    if (map.has(key)) {
      const existing = map.get(key);
      if (!existing.cats.includes(entry.cat)) {
        existing.cats.push(entry.cat);
      }
    } else {
      map.set(key, { emoji: entry.emoji, word: entry.word, cats: [entry.cat] });
    }
  }
  return Array.from(map.values());
}


// ==========================================================================
// 3. VARIABLES DE ESTADO
// ==========================================================================

// Banco de palabras en formato PLANO (expandido) para uso interno.
// Se carga desde localStorage o desde DEFAULT_WORDS en loadData().
let words = [];

// Estadísticas acumuladas del estudiante (persistidas en localStorage)
let stats = {
  totalWords: 0, totalStars: 0, sessions: 0,
  correctFirst: 0, attempts: 0, perfectSessions: 0,
  avgTime: 0, timeSamples: 0
};

// Estado de la sesión de juego actual
let gameWords = [], gameIdx = 0, gameStars = 0, gameCorrectFirst = 0, gameAttempts = 0;
let currentSlots = [];
let wordStartTime = 0, sessionStartTime = 0;
let hintUsed = false;

// Filtros del selector
let selectedCat = 'all', selectedLevel = 'all';

// Configuración del temporizador
let timerEnabled = false, timerSeconds = 60, selectedTimerOption = '1';
let timerInterval = null, timeRemaining = 0;

// Word count personalizado
let wordCountCustomEnabled = false;


// ==========================================================================
// 4. ALMACENAMIENTO (localStorage)
// ==========================================================================

/**
 * Guarda el banco de palabras (formato compacto) y las estadísticas.
 */
function saveData() {
  try {
    localStorage.setItem('sbk_words', JSON.stringify(compactWords(words)));
    localStorage.setItem('sbk_stats', JSON.stringify(stats));
  } catch(e) {}
}

/**
 * Carga el banco de palabras y las estadísticas desde localStorage.
 *
 * Estrategia de fusión:
 *   1. Lee el banco guardado (formato compacto { cats:[…] }).
 *   2. Lo expande a formato plano.
 *   3. Agrega las palabras del DEFAULT_WORDS que no existan en el banco,
 *      incluyendo las categorías nuevas para palabras ya existentes.
 *   4. Si hubo cambios, guarda la fusión.
 */
function loadData() {
  try {
    // Cargar banco guardado
    const savedRaw = localStorage.getItem('sbk_words');
    let savedCompact = savedRaw ? JSON.parse(savedRaw) : [];

    // Normalizar entradas antiguas (formato cat: string → cats:[…])
    savedCompact = savedCompact.map(entry => {
      if (!entry.cats) {
        entry.cats = [entry.cat || 'Other'];
        delete entry.cat;
      }
      return entry;
    });

    // Construir mapa de palabras guardadas: word → { emoji, cats }
    const savedMap = new Map();
    for (const entry of savedCompact) {
      savedMap.set(entry.word.toUpperCase(), { emoji: entry.emoji, cats: [...entry.cats] });
    }

    // Fusionar DEFAULT_WORDS: añadir palabras nuevas y categorías nuevas
    let changed = false;
    for (const def of DEFAULT_WORDS) {
      const key = def.word.toUpperCase();
      if (!savedMap.has(key)) {
        // Palabra totalmente nueva
        savedMap.set(key, { emoji: def.emoji, cats: [...def.cats] });
        changed = true;
      } else {
        // Palabra ya existe: añadir categorías nuevas si las tiene en DEFAULT
        const existing = savedMap.get(key);
        for (const cat of def.cats) {
          if (!existing.cats.includes(cat)) {
            existing.cats.push(cat);
            changed = true;
          }
        }
      }
    }

    // Reconstruir formato compacto y expandir a plano
    const merged = Array.from(savedMap.entries()).map(([word, data]) => ({
      word, emoji: data.emoji, cats: data.cats
    }));
    words = expandWords(merged);
    if (changed) saveData();

    // Cargar estadísticas
    const statsRaw = localStorage.getItem('sbk_stats');
    if (statsRaw) stats = JSON.parse(statsRaw);

  } catch(e) {
    words = expandWords(DEFAULT_WORDS);
  }
}


// ==========================================================================
// 5. VOZ (Text-To-Speech)
// ==========================================================================

/**
 * Pronuncia un texto en inglés usando la API del navegador.
 * @param {string}   text   - Texto a pronunciar
 * @param {number}   rate   - Velocidad (1 = normal)
 * @param {Function} onDone - Callback ejecutado al terminar (opcional)
 */
function speak(text, rate = 1, onDone = null) {
  if (!window.speechSynthesis) { if (onDone) onDone(); return; }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = rate; u.pitch = 1.1;
  if (onDone) u.onend = onDone;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}


// ==========================================================================
// 6. NAVEGACIÓN ENTRE PANTALLAS
// ==========================================================================

/**
 * Oculta todas las pantallas y muestra solo la indicada.
 * También ejecuta acciones secundarias según la pantalla destino.
 * @param {string} id - ID de la pantalla ('home'|'selector'|'game'|'complete'|'admin'|'stats')
 */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id !== 'game') stopWordTimer();  // Detener timer al salir del juego
  if (id === 'admin') renderWordList();
  if (id === 'stats') renderStats();
  if (id === 'home')  updateHomeCount();
}

/** Actualiza el contador de palabras en la pantalla de inicio. */
function updateHomeCount() {
  // Contar palabras únicas (no entradas duplicadas por categoría compartida)
  const uniqueWords = new Set(words.map(w => w.word));
  document.getElementById('wordCountBadge').textContent =
    uniqueWords.size + ' words in the bank';
}


// ==========================================================================
// 7. PANTALLA SELECTOR
// ==========================================================================

/**
 * Muestra la pantalla del selector y genera dinámicamente los chips
 * de categoría según las categorías existentes en el banco.
 */
function showSelector() {
  showScreen('selector');

  // Obtener categorías únicas del banco (sin 'all')
  const cats = ['all', ...new Set(words.map(w => w.cat))];
  const cc = document.getElementById('catChips');
  cc.innerHTML = cats.map(c =>
    `<div class="chip ${c==='all' ? 'selected chip-all' : ''}" data-cat="${c}" onclick="selectCat(this)">
      ${c==='all' ? '⭐ All' : c}
    </div>`
  ).join('');

  updateWordCountInfo();
}

/** Selecciona una categoría en el selector. */
function selectCat(el) {
  document.querySelectorAll('#catChips .chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedCat = el.dataset.cat;
  updateWordCountInfo();
}

/** Selecciona un nivel de dificultad en el selector. */
function selectLevel(el) {
  document.querySelectorAll('[data-level]').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedLevel = el.dataset.level;
  updateWordCountInfo();
}

// ---- Temporizador ----

/** Activa o desactiva las opciones de tiempo según el toggle. */
function onTimerToggle() {
  timerEnabled = document.getElementById('timerEnabled').checked;
  document.getElementById('timerOptions').classList.toggle('disabled', !timerEnabled);
}

/** Selecciona una opción de tiempo (1/5/10 min o Custom). */
function selectTimer(el) {
  document.querySelectorAll('#timerOptions .chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedTimerOption = el.dataset.timer;
  document.getElementById('timerCustomRow').classList.toggle('hidden', selectedTimerOption !== 'custom');
}

/**
 * Calcula el total de segundos para el temporizador.
 * @returns {number} Segundos (mínimo 1)
 */
function getTimerSeconds() {
  if (selectedTimerOption === 'custom') {
    const m = parseInt(document.getElementById('timerCustomMinutes').value, 10);
    const s = parseInt(document.getElementById('timerCustomSeconds').value, 10);
    const mins = isNaN(m) ? 0 : Math.max(0, m);
    const secs = isNaN(s) ? 0 : Math.max(0, Math.min(59, s));
    const total = mins * 60 + secs;
    return total < 1 ? 1 : total;
  }
  return parseInt(selectedTimerOption, 10) * 60;
}

// ---- Word Count ----

/** Activa o desactiva el campo personalizado de cantidad de palabras. */
function onWordCountToggle() {
  wordCountCustomEnabled = document.getElementById('wordCountCustomEnabled').checked;
  document.getElementById('wordCountCustomRow').classList.toggle('hidden', !wordCountCustomEnabled);
  updateWordCountInfo();
}

/** Actualiza el texto informativo de cuántas palabras hay disponibles. */
function updateWordCountInfo() {
  const pool = words.filter(w => {
    const catOk = selectedCat === 'all' || w.cat === selectedCat;
    const lvlOk = selectedLevel === 'all' || getLevel(w.word) === selectedLevel;
    return catOk && lvlOk;
  });
  // Contar palabras únicas (evita doble conteo de palabras compartidas entre categorías)
  const total = new Set(pool.map(w => w.word)).size;
  const info = document.getElementById('wordCountInfo');
  if (!info) return;
  info.textContent = wordCountCustomEnabled
    ? total + ' words available with current filters'
    : 'All ' + total + ' available word' + (total !== 1 ? 's' : '') + ' will be used';
}


// ==========================================================================
// 8. LÓGICA DEL JUEGO
// ==========================================================================

/**
 * Determina el nivel de una palabra por su longitud:
 *   3-4 letras → beginner | 5-7 → intermediate | 8+ → advanced
 * @param {string} word
 * @returns {'beginner'|'intermediate'|'advanced'}
 */
function getLevel(word) {
  const l = word.replace(/\s/g, '').length;
  if (l <= 4) return 'beginner';
  if (l <= 7) return 'intermediate';
  return 'advanced';
}

/**
 * Inicia una sesión de juego:
 *   1. Filtra el banco por categoría y nivel.
 *   2. Mezcla y limita las palabras según el word count.
 *   3. Reinicia contadores de sesión.
 *   4. Muestra la pantalla de juego y carga la primera palabra.
 */
function startGame() {
  let pool = words.filter(w => {
    const catOk = selectedCat === 'all' || w.cat === selectedCat;
    const lvlOk = selectedLevel === 'all' || getLevel(w.word) === selectedLevel;
    return catOk && lvlOk;
  });
  if (pool.length === 0) {
    showToast('No words match the filter! Try different settings.');
    return;
  }

  let limit = pool.length;
  if (wordCountCustomEnabled) {
    const customVal = parseInt(document.getElementById('wordCountCustomValue').value, 10);
    if (!isNaN(customVal) && customVal > 0) limit = Math.min(customVal, pool.length);
  }
  gameWords = shuffle([...pool]).slice(0, limit);
  gameIdx = 0; gameStars = 0; gameCorrectFirst = 0; gameAttempts = 0;
  sessionStartTime = Date.now();
  timerSeconds = getTimerSeconds();
  document.getElementById('timerBadge').style.display = timerEnabled ? 'flex' : 'none';
  stats.sessions++;
  saveData();
  showScreen('game');
  loadWord();
}

/**
 * Mezcla aleatoriamente un arreglo (Fisher-Yates).
 * @param {Array} arr
 * @returns {Array}
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Carga la palabra actual (gameWords[gameIdx]) en la pantalla de juego:
 *   - Muestra el emoji
 *   - Actualiza progreso y barra
 *   - Crea slots vacíos y botones de letras mezcladas
 *   - Inicia el temporizador
 */
function loadWord() {
  hintUsed = false;
  wordStartTime = Date.now();
  const w = gameWords[gameIdx];
  const letters = w.word.replace(/\s/g, '').toUpperCase().split('');
  currentSlots = new Array(letters.length).fill(null);

  document.getElementById('wordEmoji').textContent = w.emoji;
  document.getElementById('progressText').textContent = (gameIdx + 1) + ' / ' + gameWords.length;
  document.getElementById('progressBar').style.width = Math.round((gameIdx / gameWords.length) * 100) + '%';
  document.getElementById('starsBadge').textContent = '⭐ ' + gameStars;

  // Calcular tamaño de slot midiendo el ancho REAL disponible en pantalla.
  // Así los slots siempre llenan todo el ancho sin importar cuántas letras
  // tenga la palabra — ni demasiado pequeños ni desbordados.
  const n = letters.length;
  const slotsEl  = document.getElementById('slots');
  const lettersEl = document.getElementById('letters');

  // Ancho disponible = ancho del contenedor padre de los slots
  // (se mide en px reales después del layout del DOM)
  const availableWidth = slotsEl.parentElement.clientWidth || window.innerWidth * 0.95;

  // Gap proporcional al ancho disponible, mínimo 4px, máximo 18px
  const gapPx    = Math.max(4, Math.min(18, availableWidth * 0.008));
  // Ancho del slot: reparte todo el espacio disponible entre N slots y gaps.
  // Sin límite superior fijo para palabras cortas — se limita solo por el
  // CSS base (.slot max-width no aplica aquí porque usamos style inline).
  // Para palabras cortas se permite crecer hasta 124px de ancho.
  const rawWidth  = (availableWidth - gapPx * (n - 1)) / n;
  const slotW     = Math.min(124, Math.floor(rawWidth));
  // Alto del slot: 15% más alto que ancho (igual que el diseño original),
  // con un mínimo de 56px y máximo de 140px.
  const slotH     = Math.min(140, Math.max(56, Math.floor(slotW * 1.15)));
  // Fuente: 65% del ancho del slot, mínimo 14px
  const fontPx    = Math.max(14, Math.floor(slotW * 0.65));
  // Botones de letras: cuadrados, misma medida que el ancho del slot
  const lBtnPx    = slotW;
  const lFontPx   = Math.max(14, Math.floor(slotW * 0.62));

  // Slots vacíos: flex-wrap:nowrap para que nunca se partan en dos filas
  slotsEl.style.gap      = gapPx + 'px';
  slotsEl.style.flexWrap = 'nowrap';
  slotsEl.innerHTML = letters.map((_, i) =>
    `<div class="slot empty" data-idx="${i}" onclick="removeFromSlot(${i})"
         style="width:${slotW}px;height:${slotH}px;font-size:${fontPx}px;min-width:0;flex-shrink:0;"></div>`
  ).join('');

  // Letras mezcladas en orden distinto al original
  let mixed = shuffle([...letters]);
  let attempts = 0;
  while (mixed.join('') === letters.join('') && attempts < 20) {
    mixed = shuffle([...letters]);
    attempts++;
  }
  lettersEl.style.gap = gapPx + 'px';
  lettersEl.innerHTML = mixed.map((l, i) =>
    `<button class="letter-btn" data-li="${i}" onclick="placeLetter(this,'${l}')"
             style="width:${lBtnPx}px;height:${lBtnPx}px;font-size:${lFontPx}px;min-width:0;">${l}</button>`
  ).join('');

  startWordTimer();
}

// ---- Temporizador ----

/** Inicia la cuenta regresiva para la palabra actual. */
function startWordTimer() {
  stopWordTimer();
  if (!timerEnabled) return;
  timeRemaining = timerSeconds;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) { stopWordTimer(); onTimeUp(); }
  }, 1000);
}

/** Detiene el temporizador activo. */
function stopWordTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

/** Actualiza el badge del temporizador (formato m:ss). */
function updateTimerDisplay() {
  const badge   = document.getElementById('timerBadge');
  const valueEl = document.getElementById('timerValue');
  if (!timerEnabled) { badge.style.display = 'none'; return; }
  badge.style.display = 'flex';
  const m = Math.floor(timeRemaining / 60);
  const s = timeRemaining % 60;
  valueEl.textContent = m + ':' + String(s).padStart(2, '0');
  badge.classList.toggle('warning', timeRemaining <= 10);
}

/** Se ejecuta al llegar a 0: avisa y pasa a la siguiente palabra. */
function onTimeUp() {
  showTimeUpBanner();
  speak("Time's up", 1);
  setTimeout(() => nextWord(), 1200);
}

/** Muestra el banner "Time's up!" y lo oculta automáticamente. */
function showTimeUpBanner() {
  const banner = document.getElementById('timeupBanner');
  banner.classList.add('show');
  setTimeout(() => banner.classList.remove('show'), 1600);
}

// ---- Colocar y retirar letras ----

/**
 * Coloca una letra en el primer slot vacío disponible.
 * Si es la última letra, espera a que el TTS termine y luego valida.
 * @param {HTMLElement} btn    - Botón de la letra pulsada
 * @param {string}      letter - Letra correspondiente
 */
function placeLetter(btn, letter) {
  if (btn.disabled) return;
  const emptyIdx = currentSlots.indexOf(null);
  if (emptyIdx === -1) return;

  currentSlots[emptyIdx] = { letter, btnEl: btn };
  btn.disabled = true;

  const slot = document.querySelector(`.slot[data-idx="${emptyIdx}"]`);
  slot.textContent = letter;
  slot.classList.remove('empty');
  slot.classList.add('filled');

  // Última letra: validar solo después de que el TTS termine
  if (!currentSlots.includes(null)) {
    speak(letter.toLowerCase(), 1.1, checkAnswer);
  } else {
    speak(letter.toLowerCase(), 1.1);
  }
}

/**
 * Retira una letra de un slot y la devuelve al banco de letras.
 * Reordena los slots restantes para que no queden huecos en el medio.
 * @param {number} idx - Índice del slot a limpiar
 */
function removeFromSlot(idx) {
  if (!currentSlots[idx]) return;
  const { btnEl } = currentSlots[idx];
  currentSlots[idx] = null;
  btnEl.disabled = false;

  // Redibujar todos los slots según el estado actual
  for (let i = 0; i < currentSlots.length; i++) {
    const s = document.querySelector(`.slot[data-idx="${i}"]`);
    if (currentSlots[i]) {
      s.textContent = currentSlots[i].letter;
      s.classList.remove('empty'); s.classList.add('filled');
    } else {
      s.textContent = '';
      s.classList.add('empty'); s.classList.remove('filled', 'correct', 'wrong');
    }
  }
}

/** Limpia todos los slots de derecha a izquierda. */
function clearAll() {
  for (let i = currentSlots.length - 1; i >= 0; i--) {
    if (currentSlots[i]) removeFromSlot(i);
  }
}

// ---- Validación ----

/**
 * Compara la respuesta armada con la palabra correcta.
 * - Correcta: marca en verde, calcula estrellas, muestra overlay de éxito.
 * - Incorrecta: marca en rojo (shake) y limpia los slots para reintentar.
 */
function checkAnswer() {
  const w       = gameWords[gameIdx];
  const answer  = currentSlots.map(s => s ? s.letter : '').join('');
  const correct = w.word.replace(/\s/g, '').toUpperCase();
  gameAttempts++;

  if (answer === correct) {
    stopWordTimer();
    document.querySelectorAll('.slot').forEach(s => {
      s.classList.remove('filled'); s.classList.add('correct');
    });
    const elapsed = (Date.now() - wordStartTime) / 1000;
    if (gameAttempts === 1) gameCorrectFirst++;
    const earnedStars = hintUsed ? 1 : 3;
    gameStars += earnedStars;
    stats.totalWords++;
    stats.totalStars += earnedStars;
    stats.correctFirst += (gameAttempts === 1 ? 1 : 0);
    stats.attempts++;
    stats.timeSamples = (stats.timeSamples || 0) + 1;
    stats.avgTime = ((stats.avgTime || 0) * (stats.timeSamples - 1) + elapsed) / stats.timeSamples;
    saveData();
    document.getElementById('wordEmoji').classList.add('bounce');
    speak(w.word, 0.85);
    setTimeout(() => showSuccess(w, earnedStars), 500);
  } else {
    document.querySelectorAll('.slot.filled').forEach(s => s.classList.add('wrong'));
    setTimeout(() => {
      document.querySelectorAll('.slot').forEach(s => s.classList.remove('wrong'));
    }, 600);
    clearAll();
  }
}

// ---- Overlay de éxito ----

/**
 * Muestra el overlay de felicitación con emoji, mensaje, palabra y estrellas.
 * @param {{ emoji:string, word:string }} wordObj
 * @param {number} earnedStars
 */
function showSuccess(wordObj, earnedStars) {
  document.getElementById('overlayEmoji').textContent   = wordObj.emoji;
  document.getElementById('overlayMessage').textContent = SUCCESS_MSGS[Math.floor(Math.random() * SUCCESS_MSGS.length)];

  // Ajustar tamaño de fuente y letter-spacing según la longitud de la palabra
  // para que palabras largas como GRANDDAUGHTER (13 letras) no se corten.
  const wordEl = document.getElementById('overlayWord');
  const len = wordObj.word.replace(/\s/g, '').length;
  let wordFontSize, wordSpacing;
  if (len <= 7) {
    wordFontSize = 'clamp(1.6rem, 2.6vw, 2.6rem)';
    wordSpacing  = '4px';
  } else if (len <= 10) {
    wordFontSize = 'clamp(1.2rem, 2vw, 2rem)';
    wordSpacing  = '2px';
  } else {
    wordFontSize = 'clamp(0.95rem, 1.4vw, 1.5rem)';
    wordSpacing  = '1px';
  }
  wordEl.textContent        = wordObj.word;
  wordEl.style.fontSize     = wordFontSize;
  wordEl.style.letterSpacing = wordSpacing;

  document.getElementById('starsRow').innerHTML =
    Array(earnedStars).fill(0).map((_, i) =>
      `<span class="star" style="animation-delay:${i * 0.15}s">⭐</span>`
    ).join('');
  launchConfetti();
  document.getElementById('successOverlay').classList.add('show');
}

/** Genera partículas de confeti dentro del overlay. */
function launchConfetti() {
  const wrap   = document.getElementById('confettiWrap');
  const colors = ['#F5A623','#FF7043','#66BB6A','#42A5F5','#AB47BC','#EF5350'];
  wrap.innerHTML = '';
  for (let i = 0; i < 30; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.cssText =
      `left:${Math.random()*100}%;` +
      `background:${colors[i % colors.length]};` +
      `animation-duration:${1 + Math.random() * 1.5}s;` +
      `animation-delay:${Math.random() * 0.5}s;` +
      `transform:rotate(${Math.random() * 360}deg)`;
    wrap.appendChild(c);
  }
}

// ---- Navegación dentro del juego ----

/** Avanza a la siguiente palabra o muestra la pantalla de resumen. */
function nextWord() {
  document.getElementById('successOverlay').classList.remove('show');
  document.getElementById('wordEmoji').classList.remove('bounce');
  stopWordTimer();
  gameIdx++;

  if (gameIdx >= gameWords.length) {
    // Sesión completa
    const acc = gameAttempts > 0
      ? Math.round((gameCorrectFirst / gameWords.length) * 100)
      : 0;
    if (acc === 100) stats.perfectSessions = (stats.perfectSessions || 0) + 1;
    document.getElementById('cmpWords').textContent    = gameWords.length;
    document.getElementById('cmpStars').textContent    = gameStars;
    document.getElementById('cmpAccuracy').textContent = acc + '%';
    document.getElementById('cmpTime').textContent     = Math.round(stats.avgTime || 0) + 's';
    saveData();
    showScreen('complete');
  } else {
    gameAttempts = 0;
    loadWord();
  }
}

/** Retrocede a la palabra anterior. */
function prevWord() {
  if (gameIdx === 0) return;
  document.getElementById('successOverlay').classList.remove('show');
  stopWordTimer();
  gameIdx--;
  gameAttempts = 0;
  loadWord();
}


// ==========================================================================
// 9. PANEL DE ADMINISTRACIÓN (Manage Words)
// ==========================================================================

/**
 * Agrega una palabra nueva al banco (formato plano).
 * Si la palabra ya existe con esa misma categoría, la rechaza.
 */
function addWord() {
  const emoji  = document.getElementById('newEmoji').value.trim() || '📝';
  const wordRaw = document.getElementById('newWord').value.trim().toUpperCase();
  const cat    = document.getElementById('newCat').value;
  if (!wordRaw) { showToast('Please enter a word!'); return; }

  // Verificar si ya existe esa palabra EN ESA CATEGORÍA
  const duplicate = words.some(w => w.word === wordRaw && w.cat === cat);
  if (duplicate) { showToast('Word already exists in this category!'); return; }

  words.push({ emoji, word: wordRaw, cat });
  saveData();

  document.getElementById('searchWords').value = '';
  renderWordList(wordRaw);
  document.getElementById('newEmoji').value = '';
  document.getElementById('newWord').value  = '';
  document.getElementById('newWord').focus();

  const list = document.getElementById('wordList');
  setTimeout(() => {
    if (list.lastElementChild) list.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 80);
  showToast('✅ Word added: ' + wordRaw);
}

/**
 * Elimina la entrada en el índice dado del arreglo plano `words`.
 * @param {number} idx - Índice en el arreglo plano
 */
function deleteWord(idx) {
  words.splice(idx, 1);
  saveData();
  renderWordList();
  showToast('🗑 Word removed');
}

/**
 * Renderiza la lista de palabras en el panel de administración.
 * Muestra las entradas planas (una por categoría) con filtro de búsqueda.
 * @param {string} [highlightWord] - Palabra a resaltar con animación
 */
function renderWordList(highlightWord) {
  const search  = (document.getElementById('searchWords').value || '').toLowerCase();
  const list    = document.getElementById('wordList');

  // Contar palabras únicas para el badge del título
  const uniqueCount = new Set(words.map(w => w.word)).size;
  document.getElementById('wordCount').textContent = uniqueCount;

  const filtered = words
    .map((w, i) => ({ ...w, i }))
    .filter(w => !search || w.word.toLowerCase().includes(search) || w.emoji.includes(search));

  list.innerHTML = filtered.length === 0
    ? '<li style="text-align:center;padding:2rem;color:var(--text-muted)">No words found</li>'
    : filtered.map(w =>
        `<li class="word-item${highlightWord && w.word === highlightWord ? ' word-item-new' : ''}">
          <span class="word-emoji-cell">${w.emoji}</span>
          <span class="word-text">${w.word}</span>
          <span class="word-cat">${w.cat}</span>
          <button class="btn-sm btn-danger" onclick="deleteWord(${w.i})">✕</button>
        </li>`
      ).join('');
}

/**
 * Importa palabras desde un archivo Excel (.xlsx / .xls).
 * Acepta el formato: columna A = emoji, B = palabra, C = categoría (opcional).
 * @param {Event} e - Evento change del input de archivo
 */
function importExcel(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const wb   = XLSX.read(ev.target.result, { type: 'binary' });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      let added  = 0;
      data.forEach(row => {
        if (!row[0] || !row[1]) return;
        const emoji  = String(row[0]).trim() || '📝';
        const word   = String(row[1]).trim().toUpperCase();
        const cat    = row[2] ? String(row[2]).trim() : 'Other';
        // Solo agrega si no existe ya esa palabra+categoría
        if (!words.some(w => w.word === word && w.cat === cat)) {
          words.push({ emoji, word, cat });
          added++;
        }
      });
      saveData();
      renderWordList();
      showToast(`📊 Imported ${added} words!`);
    } catch(err) {
      showToast('Error reading file');
    }
    e.target.value = '';
  };
  reader.readAsBinaryString(file);
}


// ==========================================================================
// 10. ESTADÍSTICAS
// ==========================================================================

/** Renderiza la pantalla de estadísticas con los datos actuales. */
function renderStats() {
  document.getElementById('stTotalWords').textContent = stats.totalWords || 0;
  document.getElementById('stTotalStars').textContent = stats.totalStars || 0;
  const acc = stats.attempts > 0
    ? Math.round((stats.correctFirst || 0) / stats.attempts * 100)
    : 0;
  document.getElementById('stAccuracy').textContent = acc + '%';
  document.getElementById('stSessions').textContent  = stats.sessions || 0;

  const medals = [
    { icon:'🥇', label:'Gold',   req: stats.totalStars >= 100 },
    { icon:'🥈', label:'Silver', req: stats.totalStars >= 50  },
    { icon:'🥉', label:'Bronze', req: stats.totalStars >= 10  },
    { icon:'🏅', label:'Novice', req: stats.totalWords >= 1   },
  ];
  document.getElementById('medalsRow').innerHTML = medals.map(m =>
    `<div class="medal" style="${m.req ? '' : 'opacity:0.3'}">
      <div class="medal-icon">${m.icon}</div>
      <div class="medal-label">${m.label}</div>
    </div>`
  ).join('');

  document.getElementById('achievementsList').innerHTML = ACHIEVEMENTS.map(a =>
    `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0;border-bottom:1px solid var(--border);${a.req(stats) ? '' : 'opacity:0.35'}">
      <span style="font-size:1.5rem">${a.icon}</span>
      <span style="font-weight:600;font-size:0.9rem">${a.label}</span>
      ${a.req(stats)
        ? '<span style="margin-left:auto;color:var(--green);font-size:0.8rem;font-weight:700">✓ Unlocked</span>'
        : '<span style="margin-left:auto;color:var(--text-muted);font-size:0.8rem">Locked</span>'
      }
    </div>`
  ).join('');
}

/** Borra todas las estadísticas guardadas (con confirmación). */
function resetStats() {
  if (!confirm('Reset all stats?')) return;
  stats = { totalWords:0, totalStars:0, sessions:0, correctFirst:0, attempts:0, perfectSessions:0, avgTime:0, timeSamples:0 };
  saveData();
  renderStats();
  showToast('Stats reset');
}


// ==========================================================================
// 11. TOAST (mensaje flotante)
// ==========================================================================

/**
 * Muestra un mensaje flotante temporal en la parte inferior de la pantalla.
 * @param {string} msg - Texto a mostrar
 */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}


// ==========================================================================
// 12. INICIALIZACIÓN
// ==========================================================================
loadData();
updateHomeCount();
