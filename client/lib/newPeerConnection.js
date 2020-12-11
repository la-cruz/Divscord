import Peer from 'peerjs';

export default function newPeerConnection(id) {
  return new Peer(id, {
    host: 'chat-alves-audart.herokuapp.com',
    path: '/mypeer',
  });
}
