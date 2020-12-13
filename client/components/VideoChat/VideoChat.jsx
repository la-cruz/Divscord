import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useSound from 'use-sound';
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
import RingVolumeIcon from '@material-ui/icons/RingVolume';
import PhoneMissedIcon from '@material-ui/icons/PhoneMissed';
import CheckIcon from '@material-ui/icons/Check';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import newPeerConnection from '../../lib/newPeerConnection';
import soundUrl from '../../assets/sounds/ringtone.mp3';

const Transition = React.forwardRef((props, ref) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Slide direction="up" ref={ref} {...props} />
));

const peerConnection = {
  peer: null,
  connection: null,
  callEmitted: null,
  callReceived: null,
};

function VideoChat({ user }) {
  // Ref pour les stream vidéo
  const localVideoRef = useRef();
  const localStreamRef = useRef();
  const remoteVideoRef = useRef();

  // State pour la gestion des modales
  const [openModal, setOpenModal] = useState(false);
  const [openRefusedModal, setRefusedModal] = useState(false);
  const [openWaitingModal, setWaitingModal] = useState(false);

  // State pour la gestion de l'appel
  const [callAvailable, _setCall] = useState(true);
  const [hangupAvailable, setHangup] = useState(false);

  // State pour géré l'interlocuteur
  const [receiver, setReceiver] = useState('');

  // State pour les mutes / coupe caméra
  const [isMute, setIsMute] = useState(false);
  const [isWithoutCam, setIsWithoutCam] = useState(false);
  const [remoteIsMute, setRemoteIsMute] = useState(false);
  const [remoteIsWithoutCam, setRemoteIsWithoutCam] = useState(false);

  const [errors, setErrors] = useState({
    sender: 'no error',
    receiver: 'no error',
  });
  const callRef = useRef(callAvailable);

  // Hook pour le son
  const [play, { stop }] = useSound(soundUrl);

  // Déclanche et arrete la sonnerie au bon moment
  useEffect(() => {
    if (openModal || openWaitingModal) {
      play();
    } else {
      stop();
    }
  }, [openModal, openWaitingModal]);

  // Remplacement du setCall avec une reference pour pouvoir y accèder dans le listener
  const setCall = (data) => {
    callRef.current = data;
    _setCall(data);
  };

  const gotStream = (stream) => {
    localVideoRef.current.srcObject = stream;
    localStreamRef.current = stream;
  };

  const gotRemoteStream = (remoteStream) => {
    const remoteVideo = remoteVideoRef.current;

    if (remoteVideo.srcObject !== remoteStream) {
      remoteVideo.srcObject = remoteStream;
    }
  };

  const connect = () => {
    if (peerConnection.peer === null && user !== '') {
      peerConnection.peer = newPeerConnection(user.toLowerCase());
      peerConnection.peer.on('connection', (conn) => {
        conn.on('data', (data) => {
          switch (data.type) {
            case 'DISCONNECT':
              // eslint-disable-next-line no-use-before-define
              disconnect();
              break;
            case 'CALLING':
              if (callRef.current) {
                setOpenModal(true);
                setReceiver(data.author);
              }
              break;
            case 'REFUSED':
              setCall(true);
              setHangup(false);
              setRefusedModal(true);
              setWaitingModal(false);
              break;
            case 'MUTE':
              remoteVideoRef.current.srcObject.getAudioTracks()[0].enabled = !data.state;
              setRemoteIsMute(data.state);
              break;
            case 'CUT-CAM':
              remoteVideoRef.current.srcObject.getVideoTracks()[0].enabled = !data.state;
              setRemoteIsWithoutCam(data.state);
              break;
            default:
              break;
          }
        });
      });
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

    gotRemoteStream(null);
    setIsMute(false);
    setRemoteIsMute(false);
    setIsWithoutCam(false);
    setRemoteIsWithoutCam(false);
    setCall(true);
    setHangup(false);

    peerConnection.peer = null;
    peerConnection.connection = null;

    connect();
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then(gotStream)
      // eslint-disable-next-line no-alert
      .catch((e) => { alert(`getUserMedia() error: ${e.name}`); });

    connect();
  }, []);

  const call = (isResponse) => {
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

    if (peerConnection.connection === null || peerConnection.connection === undefined) {
      peerConnection.connection = peerConnection.peer.connect(receiver.toLowerCase());
    } else if (peerConnection.connection.peerConnection.connectionState !== 'connected') {
      peerConnection.connection = peerConnection.peer.reconnect(receiver.toLowerCase());
    }

    setTimeout(() => {
      if (callAvailable && !isResponse) {
        setWaitingModal(true);
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
        setWaitingModal(false);
      });
    }, (err) => {
      // eslint-disable-next-line no-console
      console.log('Failed to get local stream', err);
    });

    peerConnection.peer.on('call', (callReceived) => {
      getUserMedia({ video: true, audio: true }, (stream) => {
        callReceived.answer(stream);
        callReceived.on('stream', (remoteStream) => {
          gotRemoteStream(remoteStream);
          setWaitingModal(false);
        });

        peerConnection.callReceived = callReceived;
      }, (err) => {
        // eslint-disable-next-line no-console
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
    localStreamRef.current.getVideoTracks()[0].enabled = isWithoutCam;
    setIsWithoutCam(!isWithoutCam);
  };

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
      <form className="root-video" onSubmit={(e) => { e.preventDefault(); }}>
        <Box className="header-video">
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item xs={12} sm={10}>
              <Box className="container-input">
                <TextField
                  className="input-header"
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
              <div className="icon-remote">
                {
                  remoteIsMute && (
                    <MicOffIcon />
                  )
                }
                {
                  remoteIsWithoutCam && (
                    <VideocamOffIcon />
                  )
                }
              </div>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Box className="video-command">
        <IconButton aria-label="call" onClick={() => call(false)} disabled={!callAvailable} className="btn-call">
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
        className="modal-dialog"
      >
        <RingVolumeIcon className="icon-head" />
        <DialogTitle id="alert-dialog-slide-title" className="container-text">
          { receiver }
          {' wants to call'}
        </DialogTitle>
        <DialogActions className="container-btn">
          <IconButton aria-label="call" onClick={() => { call(true); setOpenModal(false); }} className="btn-call">
            <CallIcon />
          </IconButton>
          <IconButton aria-label="hangup" onClick={() => { cancelCall(); setOpenModal(false); }} className="btn-hangup">
            <CallEndRoundedIcon />
          </IconButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openRefusedModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => { setRefusedModal(false); }}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
        className="modal-dialog"
      >
        <PhoneMissedIcon className="icon-head miss-call" />
        <DialogTitle id="alert-dialog-slide-title" className="container-text">
          { receiver }
          {' refused your call'}
        </DialogTitle>
        <DialogActions className="container-btn">
          <IconButton aria-label="call-miss" onClick={() => { setRefusedModal(false); }} className="btn-miss">
            <CheckIcon />
          </IconButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openWaitingModal}
        TransitionComponent={Transition}
        keepMounted
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
        className="modal-dialog"
      >
        <RingVolumeIcon className="icon-head" />
        <DialogTitle id="alert-dialog-slide-title" className="container-text">
          {'You\'re calling '}
          { receiver }
        </DialogTitle>
      </Dialog>
    </div>
  );
}

VideoChat.propTypes = {
  user: PropTypes.string.isRequired,
};

export default VideoChat;
