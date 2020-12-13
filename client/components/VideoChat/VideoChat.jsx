import React, { useRef, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import CallIcon from '@material-ui/icons/Call';
import CallEndRoundedIcon from '@material-ui/icons/CallEndRounded';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import Button from '@material-ui/core/Button';
import newPeerConnection from '../../lib/newPeerConnection';

const Transition = React.forwardRef((props, ref) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Slide direction="up" ref={ref} {...props} />
));

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

function VideoChat({ user }) {
  const classes = useStyles();
  const localVideoRef = useRef();
  const localStreamRef = useRef();
  const remoteVideoRef = useRef();
  const [openModal, setOpenModal] = useState(false);
  const [openRefusedModal, setRefusedModal] = useState(false);
  const [callAvailable, setCall] = useState(false);
  const [hangupAvailable, setHangup] = useState(false);
  const [receiver, setReceiver] = useState('');
  const [isMute, setIsMute] = useState(false);
  const [isWithoutCam, setIsWithoutCam] = useState(false);
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
    setCall(false);
    setHangup(false);
  };

  const cutVideo = () => {
    localStreamRef.current.getVideoTracks()[0].enabled = false;
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then(gotStream)
      .catch((e) => { alert(`getUserMedia() error: ${e.name}`); });

    peerConnection.peer = newPeerConnection(user);
    peerConnection.peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        switch (data.type) {
          case 'DISCONNECT':
            disconnect();
            break;
          case 'CALLING':
            if (callAvailable) {
              setOpenModal(true);
              setReceiver(data.author);
            }
            break;
          case 'REFUSED':
            setCall(true);
            setHangup(false);
            setRefusedModal(true);
            break;
          case 'MUTE':
            remoteVideoRef.current.srcObject.getAudioTracks()[0].enabled = !data.state;
            break;
          case 'CUT-CAM':
            remoteVideoRef.current.srcObject.getVideoTracks()[0].enabled = !data.state;
            break;
          default:
            break;
        }
      });
    });
  }, []);

  const call = () => {
    const newErrors = {
      receiver: receiver === '' ? 'Empty receiver' : 'no error',
      message: 'no error',
    };

    setErrors(newErrors);

    if (newErrors.receiver !== 'no error') {
      return;
    }

    if (peerConnection.connection === null) {
      peerConnection.connection = peerConnection.peer.connect(receiver);
    } else {
      peerConnection.connection = peerConnection.peer.reconnect(receiver);
    }

    setTimeout(() => {
      if (!openModal) {
        peerConnection.connection.send({
          type: 'CALLING',
          author: user,
        });
      }
    }, 1000);

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
    peerConnection.connection.send({ type: 'DISCONNECT' });
    disconnect();
  };

  const cancelCall = () => {
    if (peerConnection.connection === null) {
      peerConnection.connection = peerConnection.peer.connect(receiver);
    }

    setReceiver('');

    setTimeout(() => {
      peerConnection.connection.send({
        type: 'REFUSED',
      });
    }, 1000);
  };

  const mute = () => {
    peerConnection.connection.send({
      type: 'MUTE',
      state: !isMute,
    });
    setIsMute(!isMute);
  };

  const cutCam = () => {
    peerConnection.connection.send({
      type: 'CUT-CAM',
      state: !isWithoutCam,
    });
    setIsWithoutCam(!isWithoutCam);
  };

  console.log(isMute);
  console.log(isWithoutCam);

  return (
    <div>
      {
        user === ''
        && (
          <div className="unconnected-user">
            <h3>You&apos;re not connected</h3>
            <Link to="/" className="icon-btn">Go to Home</Link>
          </div>
        )
      }
      <form className={classes.root} onSubmit={(e) => { e.preventDefault(); }}>
        <Box className={classes.headerChat}>
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item xs={12} sm={10}>
              <Box className={classes.containerInput}>
                <TextField
                  className={classes.input}
                  error={errors.receiver !== 'no error'}
                  helperText={errors.receiver !== 'no error' ? errors.receiver : ''}
                  label="Receiver"
                  variant="outlined"
                  value={receiver}
                  disabled={!callAvailable}
                  onChange={(e) => { setReceiver(e.target.value); }}
                />
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
        {
          hangupAvailable
          && (
            <>
              <IconButton aria-label="mute" onClick={mute} className={isMute ? 'btn-mic off' : 'btn-mic'}>
                { isMute ? <MicOffIcon /> : <MicIcon /> }
              </IconButton>
              <IconButton aria-label="video" onClick={cutCam} className={isWithoutCam ? 'btn-cam off' : 'btn-cam'}>
                { isWithoutCam ? <VideocamOffIcon /> : <VideocamIcon /> }
              </IconButton>
            </>
          )
        }
      </Box>
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
          {' wants to call'}
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
      <Dialog
        open={openRefusedModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => { setRefusedModal(false); }}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">
          { receiver }
          {' refused your call'}
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => { setRefusedModal(false); }} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

VideoChat.propTypes = {
  user: PropTypes.string.isRequired,
};

export default VideoChat;
