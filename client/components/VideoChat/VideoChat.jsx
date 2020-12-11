import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import newPeerConnection from '../../lib/newPeerConnection';

const Transition = React.forwardRef((props, ref) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Slide direction="up" ref={ref} {...props} />
));

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
  const [openModal, setOpenModal] = useState(false);
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
    if (peerConnection.callEmitted) {
      peerConnection.callEmitted.close();
    }

    if (peerConnection.callReceived) {
      peerConnection.callReceived.close();
    }

    peerConnection.peer.disconnect();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }

    gotRemoteStream(null);
    gotStream(null);
    setStart(true);
    setCall(false);
    setHangup(false);
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

    if (peerConnection.peer === null) {
      peerConnection.peer = newPeerConnection(sender);
    }

    if (peerConnection.connection === null) {
      peerConnection.connection = peerConnection.peer.connect(receiver);
    } else {
      peerConnection.connection = peerConnection.peer.reconnect(receiver);
    }

    peerConnection.peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        switch (data.type) {
          case 'DISCONNECT':
            disconnect();
            break;
          case 'CALLING':
            console.log('je reçoi le message de call');
            setOpenModal(true);
            break;
          default:
            break;
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
      console.log('jenvoie un call');
      peerConnection.callEmitted = peerConnection.peer.call(receiver, stream);
      peerConnection.callEmitted.on('stream', (remoteStream) => {
        gotRemoteStream(remoteStream);
      });

      if (!openModal) {
        console.log('jenvoie le message de call');
        peerConnection.connection.send({
          type: 'CALLING',
        });
      }
    }, (err) => {
      console.log('Failed to get local stream', err);
    });

    peerConnection.peer.on('call', (callReceived) => {
      console.log('je reçois un call');
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
    peerConnection.connection.send({ type: 'DISCONNECT' });
    disconnect();
  };

  const cancelCall = () => {

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
      <Dialog
        open={openModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => { setOpenModal(false); }}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">
          { receiver }
          wants to call
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => { cancelCall(); setOpenModal(false); }} color="primary">
            Hang up
          </Button>
          <Button onClick={() => { call(); setOpenModal(false); }} color="primary">
            Pick up
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
export default VideoChat;
