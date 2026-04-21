// Test the chat messages endpoint directly
const http = require('http');

// First, login to get a token
const loginData = JSON.stringify({
  email: 'sneha@hackmate.dev',
  password: 'hackmate123'
});

const loginReq = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Login status:', res.statusCode);
    
    if (res.statusCode !== 200) {
      console.log('Login failed:', body);
      process.exit(1);
    }
    
    const data = JSON.parse(body);
    const token = data.access_token;
    console.log('Got token:', token ? token.substring(0, 20) + '...' : 'none');
    
    // Now test the messages endpoint
    const msgReq = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/conversations/94357da1-009e-4095-9c9f-1bf9255e2edd/messages?limit=50',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res2) => {
      let body2 = '';
      res2.on('data', chunk => body2 += chunk);
      res2.on('end', () => {
        console.log('\nMessages endpoint status:', res2.statusCode);
        console.log('Response:', body2);
        process.exit(0);
      });
    });
    
    msgReq.on('error', (e) => {
      console.error('Messages request error:', e.message);
      process.exit(1);
    });
    
    msgReq.end();
  });
});

loginReq.on('error', (e) => {
  console.error('Login request error:', e.message);
  process.exit(1);
});

loginReq.write(loginData);
loginReq.end();
