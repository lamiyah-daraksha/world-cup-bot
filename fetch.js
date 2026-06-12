require('dotenv').config();
const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://free-api-live-football-data.p.rapidapi.com/football-current-live',
  headers: {
    'x-rapidapi-key': process.env.FOOTBALL_API_KEY,
    'x-rapidapi-host': process.env.FOOTBALL_API_HOST
  }
};

async function fetchMatches() {
  try {
    const response = await axios.request(options);
    console.log('✅ Connected! Match data:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

fetchMatches();
