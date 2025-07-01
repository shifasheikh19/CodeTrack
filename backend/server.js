const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 5000;

// Enable CORS for all routes
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:8080',
    'http://localhost:5000'  // Add your own server
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Middleware to parse JSON
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// LeetCode API endpoint
app.get('/api/activity/leetcode/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log(`Fetching LeetCode data for user: ${username}`);
    
    // Make request to LeetCode GraphQL API
    const query = `
      query getUserProfile($username: String!) {
        allQuestionsCount {
          difficulty
          count
        }
        matchedUser(username: $username) {
          username
          submitStats {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          submissionCalendar
        }
      }
    `;

    const response = await axios.post('https://leetcode.com/graphql/', {
      query: query,
      variables: { username: username }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (response.data && response.data.data && response.data.data.matchedUser) {
      const userData = response.data.data.matchedUser;
      const result = {
        username: userData.username,
        submissionCalendar: JSON.parse(userData.submissionCalendar || '{}'),
        submitStats: userData.submitStats
      };
      console.log('LeetCode data fetched successfully');
      res.json(result);
    } else {
      console.log('LeetCode user not found');
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching LeetCode data:', error.message);
    res.status(500).json({ error: 'Failed to fetch LeetCode data', details: error.message });
  }
});

// Codeforces API endpoint
app.get('/api/activity/codeforces/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log(`Fetching Codeforces data for user: ${username}`);
    
    // Make request to Codeforces API
    const response = await axios.get(`https://codeforces.com/api/user.rating?handle=${username}`);
    
    if (response.data && response.data.status === 'OK') {
      console.log('Codeforces data fetched successfully');
      res.json(response.data);
    } else {
      console.log('Codeforces user not found or no rating history');
      res.status(404).json({ error: 'User not found or no rating history' });
    }
  } catch (error) {
    console.error('Error fetching Codeforces data:', error.message);
    if (error.response && error.response.status === 400) {
      res.status(400).json({ error: 'Invalid username or user not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch Codeforces data', details: error.message });
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Frontend available at: http://localhost:${PORT}/index.html`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nServer shutting down gracefully...');
  process.exit(0);
});