import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Grid from '@material-ui/core/Grid';
import { Link } from 'react-router-dom';
import TextLogo from '../../assets/images/text_logo.png';
import CallLogo from '../../assets/images/call_logo.png';

function Home() {
  return (
    <div className="home-container">
      <h1>&#60;divscord/&#62;</h1>
      <h3>To start a session please enter a username :</h3>
      <OutlinedInput
        variant="outlined"
        // value={}
        // onChange={}
        // onKeyPress={}
        className="input-username"
        placeholder="Your username..."
      />
      <Grid container direction="row" justify="space-evenly" alignItems="center">
        <Grid item xs={10} sm={3}>
          <Link to="/data-chat" className="paper-list">
            <Paper elevation={3} className="paper">
              <img className="app-logo" src={TextLogo} alt="Logo text" />
              <p className="text">Text session</p>
            </Paper>
          </Link>
        </Grid>
        <Grid item xs={10} sm={3}>
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

export default Home;
