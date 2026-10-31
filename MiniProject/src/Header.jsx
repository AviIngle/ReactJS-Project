import React from 'react';
import { NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header className="header">
      <NavLink to="/" className="logo" aria-label="Go to Home">
        <img src="/src/assets/logo (1).png" alt="Logo" />
      </NavLink>

      <nav className="menu" aria-label="Main navigation">
        <ul>
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/about">About</NavLink></li>
          <li><NavLink to="/services">Services</NavLink></li>
          <li><NavLink to="/contact">Contact</NavLink></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
