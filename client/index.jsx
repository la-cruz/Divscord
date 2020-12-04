import React from 'react';
import ReactDOM from 'react-dom';
import Header from './components/Header/Header';
import Content from './components/Content/Content';

const Index = () => (
  <div className="container">
    <Header />
    <Content />
  </div>
);

ReactDOM.render(<Index />, document.getElementById('root'));
