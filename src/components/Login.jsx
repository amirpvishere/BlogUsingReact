import React, { useState, useEffect } from 'react';
import '../assets/login.css'; 
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      navigate('/dashboard'); 
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch('https://smooth-comfort-405104.uc.r.appspot.com/document/findAll/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MTg5YWFlY2FhNWVjNzQ5NDQxMThhNyIsInVzZXJuYW1lIjoicG91cnZhaGFieWFuYmFyeS5hQG5vcnRoZWFzdGVybi5lZHUiLCJpYXQiOjE3Mjk2NjU3MTcsImV4cCI6MTczMTgyNTcxN30._4ikWoi5Ke5VGAX5SQToia07wt0DtvplvdoNy-mEMTs' 
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      console.log('API response:', data); 

      const users = data.data; 

      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        localStorage.setItem('email', email);
        localStorage.setItem('name', name);  
        navigate('/dashboard');
      } else {
        setErrorMessage('Incorrect email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An error occurred! Please try again');
    }
  }

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>
      {errorMessage && <p style={{ color: 'red'}}>{errorMessage}</p>}
    </div>
  );
};

export default Login;
