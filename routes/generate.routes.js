const express = require('express');
const router = express.Router();
const { generateImage, getHistory } = require('../controllers/generate.controller');
const authenticate = require('../middleware/auth.middleware');

console.log('[DEBUG] generateImage =', typeof generateImage);
console.log('[DEBUG] getHistory =', typeof getHistory);
console.log('[DEBUG] authenticate =', typeof authenticate);

router.post('/', authenticate, generateImage);
router.get('/history', authenticate, getHistory);

module.exports = router;
