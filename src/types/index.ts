export interface Position {
  x: number;
  y: number;
}

export interface Square {
  id: string;
  owner: string | null;
  price: number;
  content: {
    text?: string;
    image?: string;
    backgroundColor?: string;
    link?: string;
    fontSize?: string;
    fontWeight?: string;
    fontFamily?: string;
  };
}

export interface User {
  username: string;
  email: string;
  password?: string;
  squaresOwned: number;
}

export type PaymentMethod = 'credit_card' | 'debit_card' | 'cash_app';

export interface PaymentDetails {
  method: PaymentMethod;
  cardNumber?: string;
  expirationDate?: string;
  cvv?: string;
  cashAppUsername?: string;
}