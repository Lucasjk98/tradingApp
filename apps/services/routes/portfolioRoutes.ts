import express from 'express';
import { User } from '../models/User';
import { Portfolio } from '../models/Portfolio';
import { Transaction } from '../models/Transaction';
import mongoose from 'mongoose';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


const router = express.Router();

// Get user portfolio
router.get('/:userId/portfolio', async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      totalCash: user.totalCash,
      positions: user.portfolio,
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(400).json({ message: 'Error fetching portfolio', error: error.message || error });
  }
});

router.get('/crypto/data', async (req, res) => {
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

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    res.status(400).json({ message: 'Error fetching crypto data', error: error.message || error });
  }
});


// Add a new portfolio item for a user
router.post('/:userId/portfolio', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { symbol, quantity, purchasePrice, type } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the portfolio item in the user's portfolio
    const portfolioItem = user.portfolio.find(item => item.symbol === symbol);

    if (type === 'buy') {
      const totalCost = purchasePrice * quantity;
      if (user.totalCash < totalCost) {
        return res.status(400).json({ message: 'Insufficient funds to complete the purchase' });
      }
      // Subtract the purchase price from the user's total cash
      user.totalCash -= totalCost;
    } else if (type === 'sell') {
      // Add the sale price to the user's total cash
      user.totalCash += purchasePrice * -quantity;
    }

    if (portfolioItem) {
      // Update the quantity if the portfolio item exists
      portfolioItem.quantity += quantity;

      if (portfolioItem.quantity <= 0) {
        // Remove the portfolio item if quantity is less than or equal to 0
        user.portfolio = user.portfolio.filter(item => item.symbol !== symbol);
        res.status(200).json({ message: 'Portfolio item removed successfully' });
      } else {
        res.status(200).json({ message: 'Portfolio item updated successfully', portfolioItem });
      }
    } else {
      // Add a new portfolio item if it doesn't exist
      user.portfolio.push({
        userId: user._id,
        symbol,
        quantity,
        purchasePrice,
      });
      res.status(201).json({ message: 'Portfolio item added successfully', newPortfolioItem: { symbol, quantity, purchasePrice } });
    }

    // Log the transaction
    const newTransaction = new Transaction({
      symbol,
      type,
      quantity,
      price: purchasePrice,
      date: new Date(),
    });
    user.transactions.push(newTransaction);

    // Save the user document
    await user.save();

  } catch (error) {
    console.error('Error adding/updating portfolio item:', error);
    res.status(400).json({
      message: 'Error adding/updating portfolio item',
      error: error.message || error,
    });
  }
});

export default router;
