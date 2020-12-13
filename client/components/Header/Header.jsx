import React from 'react';
import PropTypes from 'prop-types';
import HomeIcon from '@material-ui/icons/Home';
import { Link, useLocation } from 'react-router-dom';
import AppLogo from '../../assets/images/app_logo.png';
import AppLogoWhite from '../../assets/images/app_logo_white.png';

function Header({ user }) {
  const homeLocation = useLocation().pathname === '/';

  return (
    <>
      <div className={!homeLocation ? 'header-container nav-color-white' : 'header-container'}>
        <img className="app-logo" src={homeLocation ? AppLogoWhite : AppLogo} alt="Logo App The Board" />
        {
          !homeLocation
          && <div className="username-display">{user}</div>
        }
        {
          !homeLocation && (
            <Link to="/" className="icon-btn">
              <HomeIcon className="icon" />
              Home
            </Link>
          )
        }
      </div>
    </>
  );
}

Header.propTypes = {
  user: PropTypes.string.isRequired,
};

export default Header;
