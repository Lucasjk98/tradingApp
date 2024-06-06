import mongoose, { Schema, Document } from 'mongoose';

export interface IPortfolio extends Document {
  symbol: string;
  quantity: number;
  purchasePrice: number;
}

const PortfolioSchema: Schema = new Schema({
  symbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  purchasePrice: { type: Number, required: true },
});

export const Portfolio = mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);