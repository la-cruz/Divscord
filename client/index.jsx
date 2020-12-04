import React from 'react';
import ReactDOM from 'react-dom';
import Header from './components/Header/Header';
import DataChat from './components/DataChat/DataChat';

const Index = () => (
  <div className="container">
    <Header />
    <DataChat />
  </div>
);

ReactDOM.render(<Index />, document.getElementById('root'));
