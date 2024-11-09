import { useNavigate } from 'react-router-dom';
import '../assets/navbar.css'

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you willing to logout?");
    if (confirmed) {
      localStorage.removeItem('email'); 
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default Navbar;
