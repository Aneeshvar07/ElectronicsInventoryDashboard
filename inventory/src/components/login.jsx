import React, { useState } from 'react';
import Logo from '../assets/Logo3.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for authentication logic
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    // Add authentication logic here
    alert('Login attempted!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0] font-sans" style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-[#D8D2C2] flex flex-col items-center">
        <img src={Logo} alt="Logo" className="h-16 w-auto mb-6 rounded" />
        <h1 className="text-2xl font-bold text-[#4A4947] mb-2">Inventory Login</h1>
        <p className="text-[#B17457] mb-6">Sign in to manage your inventory</p>
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#4A4947] text-sm font-semibold mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-[#D8D2C2] rounded-lg focus:ring-2 focus:ring-[#B17457] bg-[#FAF7F0] text-[#4A4947] placeholder-[#D8D2C2]"
              placeholder="you@example.com"
              autoComplete="username"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#4A4947] text-sm font-semibold mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-[#D8D2C2] rounded-lg focus:ring-2 focus:ring-[#B17457] bg-[#FAF7F0] text-[#4A4947] placeholder-[#D8D2C2]"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#B17457] text-white rounded-lg font-semibold hover:bg-[#4A4947] transition-colors shadow"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 