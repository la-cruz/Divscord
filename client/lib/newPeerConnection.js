import Peer from 'peerjs';

export default function newPeerConnection(id) {
  // La config suivante est la config pour heroku

  // return new Peer(id, {
  //   host: 'divscord.herokuapp.com',
  //   path: '/mypeer',
  // });

  return new Peer(id, {
    host: 'localhost',
    port: 3000,
    path: '/mypeer',
  });
}
