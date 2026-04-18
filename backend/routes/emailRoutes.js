const express = require('express');
const router = express.Router();
const { sendOrderConfirmationEmail } = require('../services/emailService');

router.post('/send-email', async (req, res) => {
  const { order } = req.body;
  if (!order || !order.user_email) {
    return res.status(400).json({ success: false, error: 'Missing order or email' });
  }
  try {
    await sendOrderConfirmationEmail(order.user_email, order.user_name, order);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Email error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
