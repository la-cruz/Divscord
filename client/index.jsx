import React, { useState } from 'react';
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

const Index = () => {
  const [user, setUser] = useState('');

  return (
    <div className="container">
      <Router>
        <Header user={user} />
        <Switch>
          <Route exact path="/data-chat">
            <DataChat user={user} />
          </Route>
          <Route exact path="/video-chat">
            <VideoChat user={user} />
          </Route>
          <Route exact path="/">
            <Home user={user} setUser={setUser} />
          </Route>
          <Route>
            <div>Error 404</div>
          </Route>
        </Switch>
      </Router>
    </div>
  );
};

ReactDOM.render(<Index />, document.getElementById('root'));
