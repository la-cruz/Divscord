import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Grid from '@material-ui/core/Grid';
import { Link } from 'react-router-dom';
import TextLogo from '../../assets/images/text_logo.png';
import CallLogo from '../../assets/images/call_logo.png';

function Home({ user, setUser }) {
  return (
    <div className="home-container">
      <h1>&#60;divscord/&#62;</h1>
      <h3>To start a session please enter a username :</h3>
      <OutlinedInput
        variant="outlined"
        value={user}
        onChange={(e) => { setUser(e.target.value); }}
        className="input-username"
        placeholder="Your username..."
      />
      <Grid container direction="row" justify="space-evenly" alignItems="center">
        <Grid item xs={10} sm={3} className={`link-container ${user === '' ? 'disabled' : ''}`}>
          <Link to="/data-chat" className="paper-list">
            <Paper elevation={3} className="paper">
              <img className="app-logo" src={TextLogo} alt="Logo text" />
              <p className="text">Text session</p>
            </Paper>
          </Link>
        </Grid>
        <Grid item xs={10} sm={3} className={`link-container ${user === '' ? 'disabled' : ''}`}>
          <Link to="/video-chat" className="paper-list">
            <Paper elevation={3} className="paper">
              <img className="app-logo" src={CallLogo} alt="Logo call" />
              <p className="text">Call session</p>
            </Paper>
          </Link>
        </Grid>
      </Grid>
    </div>
  );
}

Home.propTypes = {
  user: PropTypes.string.isRequired,
  setUser: PropTypes.func.isRequired,
};

export default Home;
