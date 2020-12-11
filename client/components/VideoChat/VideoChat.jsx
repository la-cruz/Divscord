import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
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
  callEmitted: null,
  callReceived: null,
};

function VideoChat() {
  const classes = useStyles();
  const localVideoRef = useRef();
  const localStreamRef = useRef();
  const remoteVideoRef = useRef();
  const [startAvailable, setStart] = useState(true);
  const [callAvailable, setCall] = useState(false);
  const [hangupAvailable, setHangup] = useState(false);
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [errors, setErrors] = useState({
    sender: 'no error',
    receiver: 'no error',
  });

  const gotStream = (stream) => {
    localVideoRef.current.srcObject = stream;
    setCall(true); // On fait en sorte d'activer le bouton permettant de commencer un appel
    localStreamRef.current = stream;
  };

  const gotRemoteStream = (remoteStream) => {
    const remoteVideo = remoteVideoRef.current;

    if (remoteVideo.srcObject !== remoteStream) {
      remoteVideo.srcObject = remoteStream;
    }
  };

  const disconnect = () => {
    console.log('allo');

    if (peerConnection.callEmitted) {
      peerConnection.callEmitted.close();
    }

    if (peerConnection.callReceived) {
      peerConnection.callReceived.close();
    }

    peerConnection.connection.close();
    peerConnection.peer.destroy();

    localStreamRef.current.getTracks().forEach((track) => {
      track.stop();
    });

    gotRemoteStream(null);
    gotStream(null);
    setStart(true);
    setCall(false);
    setHangup(false);

    peerConnection.peer = null;
    peerConnection.callEmitted = null;
    peerConnection.callReceived = null;
    peerConnection.connection = null;
  };

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

    peerConnection.peer = newPeerConnection(sender);
    peerConnection.connection = peerConnection.peer.connect(receiver);

    peerConnection.peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        console.log(data);

        if (data.type === 'DISCONNECTED') {
          disconnect();
        }
      });
    });

    setStart(false);
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then(gotStream)
      .catch((e) => { alert(`getUserMedia() error: ${e.name}`); });
  };

  const call = () => {
    setCall(false);
    setHangup(true);
    const getUserMedia = navigator.getUserMedia
                      || navigator.webkitGetUserMedia
                      || navigator.mozGetUserMedia;
    getUserMedia({ video: true, audio: true }, (stream) => {
      peerConnection.callEmitted = peerConnection.peer.call(receiver, stream);
      peerConnection.callEmitted.on('stream', (remoteStream) => {
        gotRemoteStream(remoteStream);
      });
    }, (err) => {
      console.log('Failed to get local stream', err);
    });

    peerConnection.peer.on('call', (callReceived) => {
      getUserMedia({ video: true, audio: true }, (stream) => {
        callReceived.answer(stream);
        callReceived.on('stream', (remoteStream) => {
          gotRemoteStream(remoteStream);
        });

        peerConnection.callReceived = callReceived;
      }, (err) => {
        console.log('Failed to get local stream', err);
      });
    });
  };

  const hangUp = () => {
    peerConnection.connection.send({ type: 'DISCONNECTED' });
    // setTimeout(() => { disconnect(); }, 5000);
  };

  return (
    <div>
      <ButtonGroup size="large" color="primary" aria-label="large outlined primary button group">
        <Button onClick={start} disabled={!startAvailable}>
          Start
        </Button>
        <Button onClick={call} disabled={!callAvailable}>
          Call
        </Button>
        <Button onClick={hangUp} disabled={!hangupAvailable}>
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
          disabled={!startAvailable}
          onChange={(e) => { setSender(e.target.value); }}
        />
        <TextField
          error={errors.receiver !== 'no error'}
          helperText={errors.receiver !== 'no error' ? errors.receiver : ''}
          label="Receiver"
          variant="outlined"
          value={receiver}
          disabled={!startAvailable}
          onChange={(e) => { setReceiver(e.target.value); }}
        />
      </form>
      <video ref={localVideoRef} autoPlay muted>
        <track kind="captions" srcLang="en" label="english_captions" />
      </video>
      <video ref={remoteVideoRef} autoPlay>
        <track kind="captions" srcLang="en" label="english_captions" />
      </video>
    </div>
  );
}
export default VideoChat;
