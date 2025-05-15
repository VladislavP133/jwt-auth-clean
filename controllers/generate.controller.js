const fs = require('fs');
const path = require('path');
const OpenAI = require('openai'); 

const historyFile = path.join(__dirname, '../data/history.json');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function loadHistory() {
  if (!fs.existsSync(historyFile)) return {};
  return JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
}

function saveHistory(history) {
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2), 'utf-8');
}

const generateImage = async (req, res) => {
  const { prompt } = req.body;
  const userEmail = req.user.email;

  if (!prompt || prompt.trim().length < 5) {
    return res.status(400).json({ message: 'Недостатньо опису' });
  }

  try {
    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: '512x512'
    });

    const imageUrl = response.data[0].url;

    const history = loadHistory();
    if (!history[userEmail]) history[userEmail] = [];
    history[userEmail].push({ prompt, imageUrl, date: new Date().toISOString() });
    saveHistory(history);

    res.json({ imageUrl });
  } catch (err) {
    console.error('[OpenAI error]', err.response?.data || err.message);
    res.status(500).json({ message: 'Помилка при генерації зображення' });
  }
};

const getHistory = (req, res) => {
  const userEmail = req.user.email;
  const history = loadHistory();
  res.json(history[userEmail] || []);
};

module.exports = {
  generateImage,
  getHistory
};
