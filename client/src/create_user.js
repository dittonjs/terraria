import React from 'react';
import request from 'superagent';
import _ from 'lodash';
export default class CreateUser extends React.Component {
  constructor(){
    super();
    this.name = null;
    this.email = null;
    this.state = {
      error: ""
    }
  }
  saveUser(){
    if(!this.name.value){
      this.setState({error: "You must provide a user name."});
      return;
    }
    if(!this.email.value){
      this.setState({error: "You must provide an email."});
      return;
    }
    request
      .post('http://localhost:9000/users')
      .send({userName: this.name.value, email: this.email.value})
      .set('Accept', 'application/json')
      .end((err, res)=>{
        const data = JSON.parse(res.text);
        if(!data.err){
          window.localStorage.setItem('terrariaEmail', this.email.value);
          this.props.parent.setState({});
        }
      });
  }
  render(){
    const styles = {

    };
    return (
      <div>
        <h2>Enter a user name</h2>
        <input ref={el => {this.name = el;}} type="text"/>
        <h2>Enter your email address</h2>
        <input ref={el => {this.email = el;}} type="text"/>
        <div>
          <button onClick={() => this.saveUser()}>
            Save
          </button>
        </div>
        <div>{this.state.error}</div>
      </div>
    )
  }
}
