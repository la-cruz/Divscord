import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
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

const peerConnection = {
  peer: null,
  connection: null,
};

function DataChat({ user }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isChating, setIsChating] = useState(false);
  const [isReceiverTyping, setIsReceiverTyping] = useState(false);
  const [isSenderTyping, setIsSenderTyping] = useState(false);
  const [receiver, setReceiver] = useState('');
  const [message, setMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const [errors, setErrors] = useState({
    receiver: 'no error',
    message: 'no error',
  });

  const endOfContainer = useRef();

  const scrollToBottom = () => {
    endOfContainer.current.scrollIntoView({ behavior: 'smooth' });
  };

  const disconnect = () => {
    peerConnection.peer.disconnect();
    setIsConnected(false);
    setIsChating(false);
    peerConnection.peer = null;
    peerConnection.connection = null;
    setMessageList([]);
  };

  const connect = () => {
    if (peerConnection.peer === null && user !== '') {
      peerConnection.peer = newPeerConnection(user.toLowerCase());
      peerConnection.peer.on('connection', (conn) => {
        setIsChating(true);
        conn.on('data', (data) => {
          switch (data.type) {
            case 'MESSAGE':
              setIsReceiverTyping(false);
              setMessageList((oldArray) => [...oldArray, {
                author: false,
                message: data.data,
              }]);
              break;
            case 'DISCONNECT':
              setIsReceiverTyping(false);
              disconnect();
              break;
            case 'ISTYPING':
              setIsReceiverTyping(true);
              break;
            case 'NOLONGERTYPING':
              setIsReceiverTyping(false);
              break;
            default:
              break;
          }
        });
      });
    }
  };

  useEffect(scrollToBottom, [messageList]);

  useEffect(() => {
    if (message.length > 0 && !isSenderTyping) {
      setIsSenderTyping(true);
      peerConnection.connection.send({
        type: 'ISTYPING',
      });
    } else if (isSenderTyping && message.length === 0) {
      setIsSenderTyping(false);
      peerConnection.connection.send({
        type: 'NOLONGERTYPING',
      });
    }
  }, [message]);

  useEffect(() => {
    connect();
  }, []);

  const start = () => {
    const newErrors = {
      receiver: receiver === '' ? 'Empty receiver' : 'no error',
    };

    setErrors(newErrors);

    if (newErrors.receiver !== 'no error') {
      return;
    }

    if (peerConnection.peer === null) {
      connect();
    }

    setIsConnected(true);

    if (peerConnection.connection === null || peerConnection.connection === undefined) {
      peerConnection.connection = peerConnection.peer.connect(receiver.toLowerCase());
    } else if (peerConnection.connection.peerConnection.connectionState !== 'connected') {
      peerConnection.connection = peerConnection.peer.reconnect(receiver.toLowerCase());
    }
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
    peerConnection.connection.send({ type: 'DISCONNECT' });
    disconnect();
  };

  const handleEnterPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div>
      {
        user === ''
        && (
          <div className="unconnected-user">
            <h3>You&apos;re not connected, please reconnect</h3>
            <Link to="/" className="icon-btn">Go to Home</Link>
          </div>
        )
      }
      <form className="root-data" onSubmit={(e) => { e.preventDefault(); }}>
        <Box className="header-chat">
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item xs={12} sm={8}>
              <Box className="container-input">
                <TextField
                  className="input-header"
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
              <Box className="grid-header">
                <IconButton aria-label="start" onClick={start} disabled={isConnected} className="icon-start-header">
                  <PlayCircleFilledWhiteIcon fontSize="large" />
                </IconButton>
                <IconButton aria-label="hangup" onClick={hangUp} disabled={!isConnected} className="icon-stop-header">
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
            {
              isReceiverTyping
              && (
                <span className="other triple-dot">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              )
            }
          </div>
          <Box className="input-msg">
            <OutlinedInput
              multiline
              rowsMax={2}
              variant="outlined"
              value={message}
              onChange={(e) => { setMessage(e.target.value); }}
              onKeyPress={(e) => { handleEnterPress(e); }}
              className="input-content"
              placeholder="Message..."
              disabled={!isChating || !isConnected}
              endAdornment={(
                <InputAdornment position="end">
                  <IconButton
                    aria-label="send message"
                    onClick={send}
                    edge="end"
                    disabled={!isChating || !isConnected}
                    className="icon-send"
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

DataChat.propTypes = {
  user: PropTypes.string.isRequired,
};

export default DataChat;
