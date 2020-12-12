import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import HomeIcon from '@material-ui/icons/Home';
import { Link } from 'react-router-dom';
import AppLogo from '../../assets/images/app_logo.png';

const useStyles = makeStyles({
  headerContainer: {
    width: '100vw',
    fontFamily: 'Raleway, Arial',
    display: 'flex',
    flexBasis: '100px',
    alignItems: 'center',
    padding: '1rem 0',
    justifyContent: 'space-between',
  },
  appLogo: {
    maxWidth: '40px',
    margin: '0 1rem',
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textTransform: 'uppercase',
    margin: '0 1rem',
    padding: '0.5rem 1.5rem',
    fontWeight: 'bold',
    borderRadius: '50px',
    background: 'linear-gradient(to right, #5c258d, #4389a2)',
    boxShadow: '0px 0px 8px rgba(150, 150, 150, 1)',
  },
  icon: {
    marginRight: '0.5rem',
    fontSize: '1.5rem',
    textShadow: '0px 0px 3px rgba(150, 150, 150, 1)',
  },
});

function Header() {
  const classes = useStyles();

  return (
    <>
      <div className={classes.headerContainer}>
        <img className={classes.appLogo} src={AppLogo} alt="Logo App The Board" />
        <Link to="/" className={classes.iconBtn}>
          <HomeIcon className={classes.icon} />
          Home
        </Link>
      </div>
    </>
  );
}

export default Header;
