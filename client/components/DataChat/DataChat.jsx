import React, { useState } from 'react';
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

function DataChat() {
  const classes = useStyles();
  const [startAvailable, setStartAvailable] = useState(true);
  const [sendAvailable, setSendAvailable] = useState(false);
  const [hangupAvailable, setHangupAvailable] = useState(false);
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [message, setMessage] = useState('');

  const start = () => {
    setStartAvailable(false);
    setSendAvailable(true);
    setHangupAvailable(true);

    const peer = newPeerConnection(sender);

    peer.on('open', (id) => {
      console.log(`my id is ${id}`);
    });

    peer.on('connection', (incConnection) => {
    // Receive messages
      incConnection.on('data', (data) => {
        console.log('Received', data);
      });

      // Send messages
      incConnection.send('coucou');
    });

    peer.connect(receiver);
  };

  const send = () => {

  };

  const hangUp = () => {
    setHangupAvailable(false);
    setSendAvailable(false);
    setStartAvailable(true);
  };

  return (
    <div>
      <ButtonGroup size="large" color="primary" aria-label="large outlined primary button group">
        <Button onClick={start} disabled={!startAvailable}>
          Start
        </Button>
        <Button onClick={send} disabled={!sendAvailable}>
          Send
        </Button>
        <Button onClick={hangUp} disabled={!hangupAvailable}>
          Hang Up
        </Button>
      </ButtonGroup>
      <form className={classes.root} onSubmit={(e) => { e.preventDefault(); }}>
        <TextField label="Username" variant="outlined" value={sender} onChange={(e) => { setSender(e.target.value); }} />
        <TextField label="Receiver" variant="outlined" value={receiver} onChange={(e) => { setReceiver(e.target.value); }} />
        <div className="message-flow">
          <span>coucou</span>
        </div>
        <TextField
          label="Message"
          multiline
          rows={2}
          variant="outlined"
          value={message}
          onChange={(e) => { setMessage(e.target.value); }}
        />
      </form>
    </div>
  );
}

export default DataChat;
