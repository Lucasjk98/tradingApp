import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/crypto-data', async (req, res) => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    res.status(500).send('Server error');
  }
});

router.get('/crypto-news', async (req, res) => {
    try {
        const response = await axios.get('https://api.polygon.io/v2/reference/news', {
            params: {
                ticker: 'BTC', 
                limit: 10,
                apiKey: 'YdbX_8bq1ewVPuDm1p7guQk6gVqrnkSH',
            }
        });
        res.json(response.data.results);
    } catch (error) {
        console.error('Error fetching crypto news:', error);
        res.status(500).send('Server error');
    }
});

router.get('/crypto-historical-data/yearly/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: 365, 
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching yearly historical data:', error);
    res.status(500).send('Server error');
  }
});

router.get('/crypto-historical-data/daily/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: 1, 
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching daily historical data:', error);
    res.status(500).send('Server error');
  }
});

export default router;
