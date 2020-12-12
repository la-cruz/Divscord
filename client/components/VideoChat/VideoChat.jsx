import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import CallIcon from '@material-ui/icons/Call';
import CallEndRoundedIcon from '@material-ui/icons/CallEndRounded';
import PlayCircleFilledWhiteIcon from '@material-ui/icons/PlayCircleFilledWhite';
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
  input: {
    width: '100%',
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
  hisVideo: {
    width: '100%',
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
    if (peerConnection.callEmitted) {
      peerConnection.callEmitted.close();
    }

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
    }

    peerConnection.peer.on('connection', (conn) => {
      conn.on('data', (data) => {
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
    disconnect();
  };

  return (
    <div>
      <form className={classes.root} onSubmit={(e) => { e.preventDefault(); }}>
        <Box className={classes.headerChat}>
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item xs={12} sm={5}>
              <Box className={classes.containerInput}>
                <TextField
                  className={classes.input}
                  error={errors.sender !== 'no error'}
                  helperText={errors.sender !== 'no error' ? errors.sender : ''}
                  label="Username"
                  variant="outlined"
                  value={sender}
                  disabled={!startAvailable}
                  onChange={(e) => { setSender(e.target.value); }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={5}>
              <Box className={classes.containerInput}>
                <TextField
                  className={classes.input}
                  error={errors.receiver !== 'no error'}
                  helperText={errors.receiver !== 'no error' ? errors.receiver : ''}
                  label="Receiver"
                  variant="outlined"
                  value={receiver}
                  disabled={!startAvailable}
                  onChange={(e) => { setReceiver(e.target.value); }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={1}>
              <Box className={classes.gridHeader}>
                <IconButton aria-label="start" onClick={start} disabled={!startAvailable} className={classes.icon}>
                  <PlayCircleFilledWhiteIcon fontSize="large" />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </form>
      <Box className="container-video">
        <Box className="box-video">
          <Grid container direction="row" justify="space-evenly" alignItems="center">
            <Grid item xs={10} sm={5} className="grid-video-mobile">
              <video ref={localVideoRef} autoPlay muted className="local-video">
                <track kind="captions" srcLang="en" label="english_captions" />
              </video>
            </Grid>
            <Grid item xs={10} sm={5} className="grid-video-mobile">
              <video ref={remoteVideoRef} autoPlay className="remote-video">
                <track kind="captions" srcLang="en" label="english_captions" />
              </video>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Box className="video-command">
        <IconButton aria-label="call" onClick={call} disabled={!callAvailable} className="btn-call">
          <CallIcon />
        </IconButton>
        <IconButton aria-label="hangup" onClick={hangUp} disabled={!hangupAvailable} className="btn-hangup">
          <CallEndRoundedIcon />
        </IconButton>
      </Box>
    </div>
  );
}
export default VideoChat;
