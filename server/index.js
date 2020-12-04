/* eslint-disable no-console */

const express = require('express');
const http = require('http');
const path = require('path');
const { ExpressPeerServer } = require('peer');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || '3000';
const DIST_DIR = path.join(__dirname, '../dist');
// const HTML_FILE = path.join(DIST_DIR, 'index.html');

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/mypeer',
});

const mockResponse = {
  foo: 'bar',
  bar: 'foo',
};

app.use(express.static(DIST_DIR));
app.use(peerServer);

app.get('/api', (req, res) => {
  res.send(mockResponse);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(port, () => {
  console.log(`App listening on port: ${port}`);
});
