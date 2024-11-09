import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import '../assets/home_styles.css';

const Home = () => {
  const [userName, setUserName] = useState('');
  const [isRegistered, setIsRegistered] = useState(false); // New state for registration status
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const capitalizeFirstLetter = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  useEffect(() => {
    const fetchUserData = async () => {
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

        const email = localStorage.getItem('email');
        const user = users.find(u => u.email === email);

        if (user) {
          setUserName(capitalizeFirstLetter(user.name));
          setIsRegistered(true); // User is registered
        } else {
          setErrorMessage('User not found');
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrorMessage('An error occurred! Please try again');
      }
    };

    fetchUserData();
  }, []);

  const handleDashboardClick = (e) => {
    if (!userName) {
      e.preventDefault(); 
      alert('Please Login or Register First');
    }
  };

  const handleLogoutClick = (e) => {
    if (!userName) {
      e.preventDefault(); 
      alert('Please Login or Register First');
    }
  };

  const handleRegisterClick = (e) => {
    if (isRegistered) { // Check if user is already registered
      e.preventDefault(); 
      alert('You are already Registered');
    }
  };

  return (
    <div className='container'>
      <ul>
        <li><Link to='/login' className='button'>Login</Link></li>
        <li><Link to='/register' className='button' onClick={handleRegisterClick}>Register</Link></li>
        <li><Link to='/logout' className='button' onClick={handleLogoutClick}>Log Out</Link></li>
        <li>
          <Link to='/dashboard' className='button' onClick={handleDashboardClick}>Dashboard</Link></li>
      </ul>
      <h1>Welcome to the Home Page {userName ? userName : ''}!</h1>
      {!userName && <h2>Please login</h2>}
    </div>
  );
};

export default Home;
