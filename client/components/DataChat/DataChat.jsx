import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import SendIcon from '@material-ui/icons/Send';
import PlayCircleFilledWhiteIcon from '@material-ui/icons/PlayCircleFilledWhite';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import newPeerConnection from '../../lib/newPeerConnection';

const useStyles = makeStyles(() => ({
  root: {
    minHeight: '10vh',
    flexGrow: 1,
  },
  headerChat: {
    flexBasis: '100px',
    width: '100%',
  },
  containerInput: {
    padding: '0.5rem 0.5rem',
  },
  gridHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: '#4389a2',
    '&:disabled': {
      color: 'grey',
    },
  },
  iconStop: {
    color: '#C70039',
    '&:disabled': {
      color: 'grey',
    },
  },
  input: {
    width: '100%',
  },
  inputContent: {
    width: '80%',
    margin: '0.2rem 0',
    padding: 'auto 1rem',
  },
  iconSend: {
    marginRight: '-0.5rem',
    color: '#5c258d',
  },
}));

const peerConnection = {
  peer: null,
  connection: null,
};

function DataChat() {
  const classes = useStyles();
  const [isConnected, setIsConnected] = useState(false);
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [message, setMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const [errors, setErrors] = useState({
    sender: 'no error',
    receiver: 'no error',
    message: 'no error',
  });

  const endOfContainer = useRef();

  const scrollToBottom = () => {
    endOfContainer.current.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messageList]);

  const start = () => {
    const newErrors = {
      sender: sender === '' ? 'Empty username' : 'no error',
      receiver: receiver === '' ? 'Empty receiver' : 'no error',
      message: 'no error',
    };

    setErrors(newErrors);

    if (newErrors.sender !== 'no error' || newErrors.receiver !== 'no error') {
      return;
    }

    setIsConnected(true);

    peerConnection.peer = newPeerConnection(sender);
    peerConnection.connection = peerConnection.peer.connect(receiver);

    peerConnection.peer.on('connection', () => { console.log('connected to ', receiver); });

    peerConnection.peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        console.log('message : ', data);

        if (data.type === 'MESSAGE') {
          const newMessage = {
            author: false,
            message: data.data,
          };
          setMessageList((oldArray) => [...oldArray, newMessage]);
        }
      });
    });
  };

  const send = () => {
    if (message === '') {
      return;
    }

    const newMessage = {
      author: true,
      message,
    };

    setMessageList([...messageList, newMessage]);
    peerConnection.connection.send({
      type: 'MESSAGE',
      data: message,
    });
    setMessage('');
  };

  const hangUp = () => {
    peerConnection.peer.disconnect();
    setIsConnected(false);
  };

  const handleSpacePress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div>
      <form className={classes.root} onSubmit={(e) => { e.preventDefault(); }}>
        <Box className={classes.headerChat}>
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item xs={12} sm={4}>
              <Box className={classes.containerInput}>
                <TextField
                  className={classes.input}
                  error={errors.sender !== 'no error'}
                  helperText={errors.sender !== 'no error' ? errors.sender : ''}
                  label="Username"
                  variant="outlined"
                  value={sender}
                  disabled={isConnected}
                  onChange={(e) => { setSender(e.target.value); }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box className={classes.containerInput}>
                <TextField
                  className={classes.input}
                  error={errors.receiver !== 'no error'}
                  helperText={errors.receiver !== 'no error' ? errors.receiver : ''}
                  label="Receiver"
                  variant="outlined"
                  value={receiver}
                  disabled={isConnected}
                  onChange={(e) => { setReceiver(e.target.value); }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Box className={classes.gridHeader}>
                <IconButton aria-label="start" onClick={start} disabled={isConnected} className={classes.icon}>
                  <PlayCircleFilledWhiteIcon fontSize="large" />
                </IconButton>
                <IconButton aria-label="hangup" onClick={hangUp} disabled={!isConnected} className={classes.iconStop}>
                  <HighlightOffIcon fontSize="large" />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Box className="container-msg">
          <div className="message-flow ">
            {
              messageList.map((elem) => (
                <span className={elem.author ? 'author' : 'other'} key={elem.message + Math.random().toString(36).substr(2, 5)}>
                  {elem.message}
                </span>
              ))
            }
            <div ref={endOfContainer} />
          </div>
          <Box className="input-msg">
            <OutlinedInput
              multiline
              rowsMax={2}
              variant="outlined"
              value={message}
              onChange={(e) => { setMessage(e.target.value); }}
              onKeyPress={(e) => { handleSpacePress(e); }}
              className={classes.inputContent}
              placeholder="Message..."
              endAdornment={(
                <InputAdornment position="end">
                  <IconButton
                    aria-label="send message"
                    onClick={send}
                    edge="end"
                    className={classes.iconSend}
                  >
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              )}
            />
          </Box>
        </Box>
      </form>
    </div>
  );
}

export default DataChat;
