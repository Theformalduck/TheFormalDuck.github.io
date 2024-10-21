import { Square } from '../types';

const SQUARES_STORAGE_KEY = 'massive-grid-squares';

export const saveSquare = (square: Square) => {
  const squares = getAllSquares();
  squares[square.id] = square;
  localStorage.setItem(SQUARES_STORAGE_KEY, JSON.stringify(squares));
};

export const getAllSquares = (): Record<string, Square> => {
  const squaresJson = localStorage.getItem(SQUARES_STORAGE_KEY);
  return squaresJson ? JSON.parse(squaresJson) : {};
};

export const getSquare = (id: string): Square | undefined => {
  const squares = getAllSquares();
  return squares[id];
};

export const transferSquare = (squareId: string, newOwner: string): Square | null => {
  const squares = getAllSquares();
  const square = squares[squareId];
  if (square) {
    square.owner = newOwner;
    saveSquare(square);
    return square;
  }
  return null;
};