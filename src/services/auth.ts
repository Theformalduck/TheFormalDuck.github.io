import { User } from '../types';

// Simulated user database
let users: User[] = [
  { username: 'user1', email: 'user1@example.com', password: 'password1', squaresOwned: 3 },
  { username: 'user2', email: 'user2@example.com', password: 'password2', squaresOwned: 5 },
];

export const login = (usernameOrEmail: string, password: string): User | null => {
  const user = users.find(u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem('currentUser');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const signUp = (username: string, email: string, password: string): User | null => {
  // Basic input validation
  if (username.length > 13 || username.length < 3) {
    return null; // Username is too long or too short
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null; // Invalid email format
  }
  if (password.length < 8) {
    return null; // Password is too short
  }
  if (users.some(u => u.username === username || u.email === email)) {
    return null; // Username or email already exists
  }
  const newUser: User = { username, email, password, squaresOwned: 0 };
  users.push(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
  return userWithoutPassword;
};

export const getAllUsers = (): Omit<User, 'password'>[] => {
  return users.map(({ password, ...user }) => user);
};