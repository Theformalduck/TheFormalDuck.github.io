import React, { useState, useCallback, useEffect } from 'react';
import { Grid } from './components/Grid';
import { Toolbar } from './components/Toolbar';
import { UserPanel } from './components/UserPanel';
import { Position, Square, User } from './types';
import { login, logout, getCurrentUser, signUp, getAllUsers } from './services/auth';
import { saveSquare, getAllSquares, transferSquare } from './services/squareStorage';
import { calculateSquarePrice, processPayment } from './services/paymentService';

function App() {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [squares, setSquares] = useState<Record<string, Square>>({});
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Square[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    const savedSquares = getAllSquares();
    setSquares(savedSquares);
  }, []);

  const handleZoom = useCallback((newZoom: number) => {
    setZoom(Math.max(0.05, Math.min(5, newZoom)));
  }, []);

  const handlePan = useCallback((dx: number, dy: number) => {
    setPosition(prev => ({ x: prev.x + dx / zoom, y: prev.y + dy / zoom }));
  }, [zoom]);

  const handlePurchaseSquare = useCallback((x: number, y: number, owner: string) => {
    const price = calculateSquarePrice({ x, y });
    const newSquare: Square = { id: `${x},${y}`, owner, price, content: {} };
    setSquares(prev => {
      const updatedSquares = { ...prev, [`${x},${y}`]: newSquare };
      saveSquare(newSquare);
      return updatedSquares;
    });
    if (currentUser) {
      setCurrentUser(prev => prev ? { ...prev, squaresOwned: prev.squaresOwned + 1 } : null);
    }
  }, [currentUser]);

  const handleCustomizeSquare = useCallback((x: number, y: number, content: Partial<Square['content']>) => {
    setSquares(prev => {
      const squareKey = `${x},${y}`;
      const updatedSquare = { ...prev[squareKey], content: { ...prev[squareKey].content, ...content } };
      saveSquare(updatedSquare);
      return { ...prev, [squareKey]: updatedSquare };
    });
  }, []);

  const handleTransferSquare = useCallback((squareId: string, newOwner: string) => {
    const updatedSquare = transferSquare(squareId, newOwner);
    if (updatedSquare) {
      setSquares(prev => ({ ...prev, [squareId]: updatedSquare }));
    }
  }, []);

  const handleLogin = useCallback((usernameOrEmail: string, password: string) => {
    const user = login(usernameOrEmail, password);
    if (user) {
      setCurrentUser(user);
    } else {
      alert('Invalid credentials');
    }
  }, []);

  const handleSignUp = useCallback((username: string, email: string, password: string) => {
    const user = signUp(username, email, password);
    if (user) {
      setCurrentUser(user);
    } else {
      alert('Username or email already exists');
    }
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setCurrentUser(null);
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term) {
      const results = Object.values(squares).filter(square => 
        square.owner?.toLowerCase().includes(term.toLowerCase()) ||
        square.id.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
      if (results.length > 0) {
        const [x, y] = results[0].id.split(',').map(Number);
        setPosition({ x: -x, y: -y });
        setZoom(1);
      }
    } else {
      setSearchResults([]);
    }
  }, [squares]);

  return (
    <div className="flex flex-col h-screen">
      <Toolbar 
        onZoom={handleZoom} 
        zoom={zoom} 
        onResetView={handleResetView}
        onSearch={handleSearch}
        searchTerm={searchTerm}
        allUsers={getAllUsers()}
      />
      <div className="flex flex-1 overflow-hidden">
        <Grid
          zoom={zoom}
          position={position}
          onPan={handlePan}
          squares={squares}
          onPurchaseSquare={handlePurchaseSquare}
          onCustomizeSquare={handleCustomizeSquare}
          selectedSquare={selectedSquare}
          setSelectedSquare={setSelectedSquare}
          currentUser={currentUser}
          searchResults={searchResults}
        />
        <UserPanel
          onPurchaseSquare={handlePurchaseSquare}
          onCustomizeSquare={handleCustomizeSquare}
          onTransferSquare={handleTransferSquare}
          selectedSquare={selectedSquare}
          squares={squares}
          currentUser={currentUser}
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          onLogout={handleLogout}
          allUsers={getAllUsers()}
        />
      </div>
    </div>
  );
}

export default App;