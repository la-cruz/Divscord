import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import HomeIcon from '@material-ui/icons/Home';
import { Link, useLocation } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import CheckIcon from '@material-ui/icons/Check';
import AppLogo from '../../assets/images/app_logo.png';
import AppLogoWhite from '../../assets/images/app_logo_white.png';

function Header({ user }) {
  const homeLocation = useLocation().pathname === '/';
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setTimeout(() => { setIsCopied(false); }, 3000);
  }, [isCopied]);

  return (
    <>
      <div className={!homeLocation ? 'header-container nav-color-white' : 'header-container'}>
        <img className="app-logo" src={homeLocation ? AppLogoWhite : AppLogo} alt="Logo App The Board" />
        {
          !homeLocation
          && (
            <div className="container-username">
              <div className="username-display">{user}</div>
              <CopyToClipboard
                text={user}
                onCopy={
                  () => {
                    setIsCopied(true);
                    setTimeout(() => { setIsCopied(false); }, 5000);
                  }
                }
                className="icon-copy"
              >
                <FileCopyIcon className="icon-copy" />
              </CopyToClipboard>
              {isCopied ? <CheckIcon className="icon-check" /> : null}
            </div>
          )
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
