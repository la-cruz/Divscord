import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import newPeerConnection from '../../lib/newPeerConnection';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
      width: '25ch',
    },
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

    peerConnection.peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        const newMessage = {
          author: false,
          message: data,
        };

        setMessageList((oldArray) => [...oldArray, newMessage]);
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
    peerConnection.connection.send(message);
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
      <ButtonGroup size="large" color="primary" aria-label="large outlined primary button group">
        <Button onClick={start} disabled={isConnected}>
          Start
        </Button>
        <Button onClick={hangUp} disabled={!isConnected}>
          Hang Up
        </Button>
      </ButtonGroup>
      <form className={classes.root} onSubmit={(e) => { e.preventDefault(); }}>
        <TextField
          error={errors.sender !== 'no error'}
          helperText={errors.sender !== 'no error' ? errors.sender : ''}
          label="Username"
          variant="outlined"
          value={sender}
          disabled={isConnected}
          onChange={(e) => { setSender(e.target.value); }}
        />
        <TextField
          error={errors.receiver !== 'no error'}
          helperText={errors.receiver !== 'no error' ? errors.receiver : ''}
          label="Receiver"
          variant="outlined"
          value={receiver}
          disabled={isConnected}
          onChange={(e) => { setReceiver(e.target.value); }}
        />
        <div className="message-flow">
          {
            messageList.map((elem) => (
              <span className={elem.author ? 'author' : 'other'} key={elem.message + Math.random().toString(36).substr(2, 5)}>
                {elem.message}
              </span>
            ))
          }
          <div ref={endOfContainer} />
        </div>
        {
          isConnected
          && (
            <>
              <TextField
                label="Message"
                multiline
                rowsMax={2}
                variant="outlined"
                value={message}
                onChange={(e) => { setMessage(e.target.value); }}
                onKeyPress={(e) => { handleSpacePress(e); }}
              />
              <Button onClick={send} variant="outlined" size="large" color="primary">
                Send
              </Button>
            </>
          )
        }
      </form>
    </div>
  );
}

export default DataChat;
