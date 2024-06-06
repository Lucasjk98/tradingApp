import express from 'express';
import { User } from '../models/User';
import { Portfolio } from '../models/portfolio';
import { Transaction } from '../models/Transaction';
import mongoose from 'mongoose';

const router = express.Router();

// Get user portfolio
router.get('/:userId/portfolio', async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid userId' });
        }
        const objectId = new mongoose.Types.ObjectId(userId);

        // Find portfolio items by userId
        const portfolioItems = await Portfolio.find({ userId: objectId });

        res.status(200).json(portfolioItems);
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(400).json({
            message: 'Error fetching portfolio',
            error: error.message || error,
        });
    }
});

// Update a portfolio item for a user
router.put('/:userId/portfolio/:portfolioItemId', async (req, res) => {
    try {
        const { userId, portfolioItemId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(portfolioItemId)) {
            return res.status(400).json({ message: 'Invalid userId or portfolioItemId' });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const portfolioObjectId = new mongoose.Types.ObjectId(portfolioItemId);

        // Find the portfolio item by ID
        const portfolioItem = await Portfolio.findOne({ _id: portfolioObjectId, userId: userObjectId });

        if (!portfolioItem) {
            return res.status(404).json({ message: 'Portfolio item not found' });
        }

        // Update the quantity
        portfolioItem.quantity += quantity;

        // If quantity drops to zero or below, delete the portfolio item
        if (portfolioItem.quantity <= 0) {
            await Portfolio.deleteOne({ _id: portfolioObjectId });
            return res.status(200).json({ message: 'Portfolio item deleted' });
        }

        // Save the updated portfolio item
        await portfolioItem.save();

        res.status(200).json({
            message: 'Portfolio item updated successfully',
            portfolioItem,
        });
    } catch (error) {
        console.error('Error updating portfolio item:', error);
        res.status(400).json({
            message: 'Error updating portfolio item',
            error: error.message || error,
        });
    }
});

// Add a new portfolio item for a user
router.post('/:userId/portfolio', async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const objectId = new mongoose.Types.ObjectId(userId);
    const { symbol, quantity, purchasePrice, type } = req.body;

    // Find the user by ID
    const user = await User.findById(objectId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the portfolio item
    const portfolioItem = await Portfolio.findOne({ userId: objectId, symbol });

    if (portfolioItem) {
      // Update the quantity if the portfolio item exists
      portfolioItem.quantity += quantity;

      if (portfolioItem.quantity <= 0) {
        // Remove the portfolio item if quantity is less than or equal to 0
        await Portfolio.deleteOne({ _id: portfolioItem._id });
        res.status(200).json({ message: 'Portfolio item removed successfully' });
      } else {
        await portfolioItem.save();
        res.status(200).json({ message: 'Portfolio item updated successfully', portfolioItem });
      }
    } else {
      // Add a new portfolio item if it doesn't exist
      const newPortfolioItem = new Portfolio({
        userId: objectId,
        symbol,
        quantity,
        purchasePrice,
      });
      await newPortfolioItem.save();
      res.status(201).json({ message: 'Portfolio item added successfully', newPortfolioItem });
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
