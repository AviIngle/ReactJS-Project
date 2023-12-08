import React from 'react'

const Header = () => {
    return (
        <div className='header'>
            <div className='logo'>
                <h1>Love Status</h1>
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