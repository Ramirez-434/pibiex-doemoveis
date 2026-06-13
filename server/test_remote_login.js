const axios = require('axios');
const jwt = require('jsonwebtoken');

async function testLogin() {
  try {
    const res = await axios.post('https://doebrasil.onrender.com/auth/login', {
      email: 'mrbatista274@gmail.com',
      password: '135764'
    });
    console.log('Login Response User Object:', res.data.user);
    const decoded = jwt.decode(res.data.token);
    console.log('Decoded Token:', decoded);
  } catch (err) {
    console.error('Error logging in:', err.response ? err.response.data : err.message);
  }
}

testLogin();
