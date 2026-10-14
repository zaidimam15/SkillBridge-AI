const axios = require('axios');
const path = require('path');
const fs = require('fs');

async function testAI() {
  console.log('--- Testing AI Service ---');
  try {
    const health = await axios.get('http://127.0.0.1:8000/health');
    console.log('✅ Health response:', health.data);
  } catch (err) {
    console.error('❌ Health check failed:', err.message);
  }
}

testAI();
