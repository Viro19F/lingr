const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- JSON File Database ---
const DB_PATH = path.join(__dirname, 'db.json');

function loadDB() {
  if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  return null;
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getDB() {
  let db = loadDB();
  if (!db) {
    db = createSeedData();
    saveDB(db);
  }
  return db;
}

function createSeedData() {
  return {
    waitlist: [],
    profiles: [
      { id: 1, name: 'Sofia Martinez', email: 'sofia@ie.edu', native_language: 'Spanish', learning_language: 'English', level: 'advanced', interests: 'photography, hiking, cinema', bio: 'Born in Madrid, love meeting international people!', campus: 'segovia', available: true },
      { id: 2, name: 'Lucas Dubois', email: 'lucas@ie.edu', native_language: 'French', learning_language: 'Spanish', level: 'intermediate', interests: 'cooking, music, basketball', bio: 'French exchange student, obsessed with tapas.', campus: 'segovia', available: true },
      { id: 3, name: 'Emma Chen', email: 'emma@ie.edu', native_language: 'Mandarin', learning_language: 'Spanish', level: 'beginner', interests: 'art, travel, yoga', bio: 'Just arrived from Shanghai, excited to learn!', campus: 'segovia', available: true },
      { id: 4, name: 'Maximilian Braun', email: 'max@ie.edu', native_language: 'German', learning_language: 'Spanish', level: 'intermediate', interests: 'football, startups, reading', bio: 'Business student, want to be fluent by summer.', campus: 'segovia', available: true },
      { id: 5, name: 'Amara Okafor', email: 'amara@ie.edu', native_language: 'English', learning_language: 'French', level: 'beginner', interests: 'dance, film, writing', bio: 'Nigerian-British, here for the IE experience.', campus: 'segovia', available: true },
      { id: 6, name: 'Yuki Tanaka', email: 'yuki@ie.edu', native_language: 'Japanese', learning_language: 'English', level: 'advanced', interests: 'anime, gaming, running', bio: 'Tokyo native, practicing English every day.', campus: 'segovia', available: true },
      { id: 7, name: 'Isabella Rossi', email: 'isabella@ie.edu', native_language: 'Italian', learning_language: 'English', level: 'intermediate', interests: 'fashion, coffee, painting', bio: 'From Milan with love. Coffee snob.', campus: 'segovia', available: true },
      { id: 8, name: 'Mateo Silva', email: 'mateo@ie.edu', native_language: 'Portuguese', learning_language: 'French', level: 'beginner', interests: 'surfing, guitar, cooking', bio: 'Brazilian vibes, want to learn French!', campus: 'segovia', available: true },
    ],
    matches: [
      { id: 1, user_a: 1, user_b: 2, status: 'accepted', created_at: new Date().toISOString() },
      { id: 2, user_a: 3, user_b: 4, status: 'accepted', created_at: new Date().toISOString() },
      { id: 3, user_a: 5, user_b: 6, status: 'pending', created_at: new Date().toISOString() },
      { id: 4, user_a: 7, user_b: 8, status: 'accepted', created_at: new Date().toISOString() },
    ],
    messages: [
      { id: 1, match_id: 1, sender_id: 1, content: 'Hola Lucas! Quieres practicar espanol juntos?', msg_type: 'text', created_at: new Date().toISOString() },
      { id: 2, match_id: 1, sender_id: 2, content: 'Oui! Digo... Si! Me encantaria. Como estas?', msg_type: 'text', created_at: new Date().toISOString() },
      { id: 3, match_id: 1, sender_id: 1, content: 'Muy bien! De donde eres en Francia?', msg_type: 'text', created_at: new Date().toISOString() },
      { id: 4, match_id: 2, sender_id: 3, content: 'Hi Max! I want to practice Spanish, can you help?', msg_type: 'text', created_at: new Date().toISOString() },
      { id: 5, match_id: 2, sender_id: 4, content: "Klar! I mean, claro! Let's do tandem style.", msg_type: 'text', created_at: new Date().toISOString() },
    ],
    prompts: [
      { id: 1, category: 'icebreaker', text_en: "What's your favorite thing about studying in Segovia?", text_es: "Cual es tu cosa favorita de estudiar en Segovia?", difficulty: 'easy' },
      { id: 2, category: 'icebreaker', text_en: "If you could live anywhere in the world for a year, where would it be?", text_es: "Si pudieras vivir en cualquier lugar del mundo por un ano, donde seria?", difficulty: 'easy' },
      { id: 3, category: 'icebreaker', text_en: "What's a word in your language that has no translation?", text_es: "Cual es una palabra en tu idioma que no tiene traduccion?", difficulty: 'medium' },
      { id: 4, category: 'culture', text_en: "What's a tradition from your country that surprises people?", text_es: "Cual es una tradicion de tu pais que sorprende a la gente?", difficulty: 'easy' },
      { id: 5, category: 'culture', text_en: "Describe your favorite meal from home", text_es: "Describe tu comida favorita de casa", difficulty: 'easy' },
      { id: 6, category: 'culture', text_en: "What's the biggest culture shock you've experienced in Spain?", text_es: "Cual ha sido el mayor choque cultural que has experimentado en Espana?", difficulty: 'medium' },
      { id: 7, category: 'deep', text_en: "What made you choose to study abroad?", text_es: "Que te hizo elegir estudiar en el extranjero?", difficulty: 'medium' },
      { id: 8, category: 'deep', text_en: "How has learning a new language changed the way you think?", text_es: "Como ha cambiado tu forma de pensar aprender un nuevo idioma?", difficulty: 'hard' },
      { id: 9, category: 'fun', text_en: "What's the funniest misunderstanding you've had in another language?", text_es: "Cual es el malentendido mas gracioso que has tenido en otro idioma?", difficulty: 'easy' },
      { id: 10, category: 'fun', text_en: "Teach me a slang word from your country!", text_es: "Enseneme una palabra de argot de tu pais!", difficulty: 'easy' },
      { id: 11, category: 'fun', text_en: "What song do you always sing wrong in another language?", text_es: "Que cancion siempre cantas mal en otro idioma?", difficulty: 'easy' },
      { id: 12, category: 'academic', text_en: "What's the hardest subject to study in your second language?", text_es: "Cual es la asignatura mas dificil de estudiar en tu segundo idioma?", difficulty: 'medium' },
    ],
    nextIds: { waitlist: 1, match: 5, message: 6, profile: 9 }
  };
}

// --- API Routes ---

// Waitlist
app.post('/api/waitlist', (req, res) => {
  const { name, email, native_language, learning_language, campus } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

  const db = getDB();
  if (db.waitlist.some(w => w.email === email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const entry = { id: db.nextIds.waitlist++, name, email, native_language: native_language || null, learning_language: learning_language || null, campus: campus || 'segovia', created_at: new Date().toISOString() };
  db.waitlist.push(entry);
  saveDB(db);
  res.json({ success: true, id: entry.id, message: "You're on the list!" });
});

app.get('/api/waitlist/count', (req, res) => {
  const db = getDB();
  res.json({ count: db.waitlist.length });
});

// Profiles
app.get('/api/profiles', (req, res) => {
  const db = getDB();
  res.json(db.profiles.map(({ email, ...p }) => p));
});

app.get('/api/profiles/:id', (req, res) => {
  const db = getDB();
  const profile = db.profiles.find(p => p.id === parseInt(req.params.id));
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile);
});

// Matching
app.get('/api/matches/:userId', (req, res) => {
  const db = getDB();
  const userId = parseInt(req.params.userId);
  const matches = db.matches.filter(m => m.user_a === userId || m.user_b === userId).map(m => {
    const pa = db.profiles.find(p => p.id === m.user_a);
    const pb = db.profiles.find(p => p.id === m.user_b);
    return {
      ...m,
      user_a_name: pa?.name, user_a_native: pa?.native_language, user_a_learning: pa?.learning_language,
      user_b_name: pb?.name, user_b_native: pb?.native_language, user_b_learning: pb?.learning_language,
    };
  });
  res.json(matches);
});

app.post('/api/matches', (req, res) => {
  const { user_a, user_b } = req.body;
  const db = getDB();
  const existing = db.matches.find(m => (m.user_a === user_a && m.user_b === user_b) || (m.user_a === user_b && m.user_b === user_a));
  if (existing) return res.status(409).json({ error: 'Match already exists' });

  const match = { id: db.nextIds.match++, user_a, user_b, status: 'pending', created_at: new Date().toISOString() };
  db.matches.push(match);
  saveDB(db);
  res.json({ success: true, id: match.id });
});

app.patch('/api/matches/:id', (req, res) => {
  const db = getDB();
  const match = db.matches.find(m => m.id === parseInt(req.params.id));
  if (!match) return res.status(404).json({ error: 'Match not found' });
  match.status = req.body.status;
  saveDB(db);
  res.json({ success: true });
});

// Messages
app.get('/api/messages/:matchId', (req, res) => {
  const db = getDB();
  const matchId = parseInt(req.params.matchId);
  const messages = db.messages.filter(m => m.match_id === matchId).map(m => {
    const sender = db.profiles.find(p => p.id === m.sender_id);
    return { ...m, sender_name: sender?.name || 'Unknown' };
  });
  res.json(messages);
});

app.post('/api/messages', (req, res) => {
  const { match_id, sender_id, content, msg_type } = req.body;
  const db = getDB();
  const msg = { id: db.nextIds.message++, match_id, sender_id, content, msg_type: msg_type || 'text', created_at: new Date().toISOString() };
  db.messages.push(msg);
  saveDB(db);
  res.json({ success: true, id: msg.id });
});

// Prompts
app.get('/api/prompts', (req, res) => {
  const db = getDB();
  let prompts = db.prompts;
  if (req.query.category) prompts = prompts.filter(p => p.category === req.query.category);
  if (req.query.difficulty) prompts = prompts.filter(p => p.difficulty === req.query.difficulty);
  res.json(prompts);
});

app.get('/api/prompts/random', (req, res) => {
  const db = getDB();
  const prompt = db.prompts[Math.floor(Math.random() * db.prompts.length)];
  res.json(prompt);
});

// Smart match suggestions
app.get('/api/suggest/:userId', (req, res) => {
  const db = getDB();
  const user = db.profiles.find(p => p.id === parseInt(req.params.userId));
  if (!user) return res.status(404).json({ error: 'User not found' });

  const matchedIds = new Set();
  db.matches.forEach(m => {
    if (m.user_a === user.id) matchedIds.add(m.user_b);
    if (m.user_b === user.id) matchedIds.add(m.user_a);
  });

  const suggestions = db.profiles.filter(p =>
    p.id !== user.id && p.available && !matchedIds.has(p.id) &&
    (p.native_language === user.learning_language || p.learning_language === user.native_language)
  ).slice(0, 5);

  res.json(suggestions);
});

// Stats
app.get('/api/stats', (req, res) => {
  const db = getDB();
  res.json({
    users: db.profiles.length,
    matches: db.matches.filter(m => m.status === 'accepted').length,
    messages: db.messages.length,
    languages: new Set(db.profiles.map(p => p.native_language)).size
  });
});

// App route
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  Linger is running at http://localhost:${PORT}\n`);
});
