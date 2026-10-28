import React from 'react'

const Header = () => {
    return (
        <div className='header'>
            <div className='logo'>
                <img src='/src/assets/logo (1).png' alt='Logo' />
            </div>

            <nav className='menu'>
            <ul>
              <li><a href='#'>Home</a></li>
              <li><a href='#'>About</a></li>
              <li><a href='#'>Services</a></li>
              <li><a href='#'>Contact</a></li>

            </ul>
                
            </nav>

        </div>
    )
}

export default Header