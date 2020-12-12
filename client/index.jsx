import React from 'react';
import {
  HashRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import ReactDOM from 'react-dom';
import Header from './components/Header/Header';
import DataChat from './components/DataChat/DataChat';
import './assets/scss/main.scss';
import VideoChat from './components/VideoChat/VideoChat';
import Home from './components/Home/Home';

const Index = () => (
  <div className="container">
    <Router>
      <Header />
      <Switch>
        <Route path="/data-chat">
          <DataChat />
        </Route>
        <Route path="/video-chat">
          <VideoChat />
        </Route>
        <Route path="/">
          <Home />
        </Route>
        <Route>
          <div>Error 404</div>
        </Route>
      </Switch>
    </Router>
  </div>
);

ReactDOM.render(<Index />, document.getElementById('root'));
