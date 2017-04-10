import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import CreateUser from './create_user';
import request from 'superagent';
class App extends Component {
  constructor(){
    super();
    this.state = {
      user: null,
    };
  }
  componentDidMount(...args){
    this.componentWillUpdate(...args);
  }
  componentWillUpdate(){
    console.log(!this.state.user && window.localStorage.getItem('terrariaEmail'));
    if(!this.state.user && window.localStorage.getItem('terrariaEmail')){
      request
        .get(`http://localhost:9000/users?email=${window.localStorage.getItem('terrariaEmail')}`)
        .end((err, res) => {
          this.setState({user: JSON.parse(res.text)});
        });
    }
  }
  render() {
    let content = null;
    if(!window.localStorage.getItem('terrariaEmail')){
      content = <CreateUser parent={this} />;
    } else if(this.state.user){
      content = <div>{this.state.user.userName}</div>
    }
    return (
      <div className="App">
        {content}
      </div>
    );
  }
}

export default App;
