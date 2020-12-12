import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { Link } from 'react-router-dom';
import VoiceChatIcon from '@material-ui/icons/VoiceChat';
import ChatIcon from '@material-ui/icons/Chat';

const useStyles = makeStyles({
  homeContainer: {
    fontFamily: 'Raleway, Arial',
    display: 'flex',
    minHeight: '90vh',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appLogo: {
    maxWidth: '200px',
    display: 'block',
    margin: '2rem auto',
  },
  boardLogo: {
    height: '50px',
    paddingRight: '2rem',
  },
  paperList: {
    width: '500px',
    maxWidth: '100vw',
  },
  icon: {
    fontSize: '4rem',
    color: 'white',
    textShadow: '0px 0px 8px rgba(150, 150, 150, 1)',
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem 2rem',
    margin: '2rem 0',
    borderRadius: '20px',
    background: 'linear-gradient(to right, #5c258d, #4389a2)',
  },
  text: {
    color: 'white',
    textAlign: 'center',
    textTransform: 'uppercase',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textShadow: '0px 0px 8px rgba(50, 50, 50, 1)',
  },
});

function Home() {
  const classes = useStyles();

  return (
    <div className={classes.homeContainer}>
      <Link to="/data-chat" className={classes.paperList}>
        <Paper elevation={3} className={classes.paper}>
          <ChatIcon className={classes.icon} />
          <p className={classes.text}>Text session</p>
        </Paper>
      </Link>
      <Link to="/video-chat" className={classes.paperList}>
        <Paper elevation={3} className={classes.paper}>
          <VoiceChatIcon className={classes.icon} />
          <p className={classes.text}>Call session</p>
        </Paper>
      </Link>
    </div>
  );
}

export default Home;
