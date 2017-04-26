import React, { Component } from 'react';
import './App.css';
import CreateUser from './create_user';
import SavedGames from './saved_games';
import JoinGame from './join_game';
import ConfigureControls from './configure_controls';
import request from 'superagent';

const styles = {
  container: {
    padding: '25px',
    width: '700px',
    margin: 'auto'
  },
  block: {
    margin: '10px',
    flex: '.5'
  },
  button: {
    border: 'none',
    padding: '10px',
    backgroundColor: '#009688',
    fontWeight: 'bold',
    color: 'white',
    margin: '5px'
  },
  modal: {
    backgroundColor: 'white',
    boxShadow: '0px 4px 4px 0px black',
    position: 'fixed',
    top: '200px',
    left: '400px',
    width: '400px',
    height: '200px',
    padding: '10px',
  },
  new: {
    textAlign: 'center'
  },
  startGame: {
    padding: '10px'
  }
}

class App extends Component {
  constructor(){
    super();
    this.state = {
      user: null,
      modalOpen: false,
      controls: false,
      credits: false,
    };
  }
  componentDidMount(...args){
    this.componentWillUpdate(...args);
  }
  componentWillUpdate(){
    if(!this.state.user && window.localStorage.getItem('terrariaEmail')){
      request
        .get(`http://localhost:9000/users?email=${window.localStorage.getItem('terrariaEmail')}`)
        .end((err, res) => {
          if(!res.text){
            window.localStorage.removeItem('terrariaEmail');
          }
          this.setState({user: JSON.parse(res.text)});
        });
    }
  }
  openModal(){
    this.setState({modalOpen: true});
  }
  newGame(){
    console.log(this.refs.gameName.value);
    if(!this.refs.gameName.value.length){
      alert('You must enter a game name');
      return;
    }
    request.post(
      `http://localhost:9000/create_world?email=${window.localStorage.getItem('terrariaEmail')}&world_name=${this.refs.gameName.value}&user_name=${this.state.user.userName}`
    ).end((err, res)=>{
      window.location.href = `http://localhost:9000/?gameName=${this.refs.gameName.value}&hostName=localhost&join=false&playerId=${this.state.user.userName}`;
    });
  }
  render() {

    let content = null;
    if(this.state.controls){
      content = (
        <ConfigureControls user={this.state.user} parent={this} />
      );
    } else if(!window.localStorage.getItem('terrariaEmail')){
      content = <CreateUser parent={this} />;
    } else if(this.state.user){
      content = (
        <div style={styles.container}>
          <div>Longest Time Survived: {this.state.user.highScore ? Math.trunc(this.state.user.highScore / 1000) : 0} Seconds</div>
          <div style={{display: 'flex'}}>
            <div style={styles.block}>
              <SavedGames user={this.state.user}/>
            </div>
            <div style={styles.block}>
              <JoinGame user={this.state.user} />
            </div>
          </div>
          <div style={styles.new}>
            <button style={styles.button} onClick={() => this.openModal()}>NEW GAME</button>
            <button style={styles.button} onClick={() => this.setState({controls: true})}>CONTROLS</button>
            <button style={styles.button} onClick={() => this.setState({credits: true})}>CREDITS</button>
          </div>
        </div>
      );
    }
    const modal = (
      <div style={styles.modal}>
        <h3 style={{color: 'grey', padding: '10px'}}> Enter Game Name </h3>
        <div style={{display: 'flex', padding: '10px'}}>
          <input ref="gameName" style={{flex: '1'}} type="text" />
        </div>
        <div style={styles.startGame}>
          <button style={styles.button} onClick={() => this.newGame()}>Start</button>
        </div>
      </div>
    );

    const credits = (
      <div style={styles.modal}>
        <h3 style={{color: 'grey'}}> Developed by Joseph Ditton </h3>
        <h3 style={{color: 'grey'}}> Music Composed by Joseph Ditton </h3>
        <h3 style={{color: 'grey'}}> Sound Effect and Art from opengameart.org</h3>
        <button style={styles.button} onClick={() => this.setState({credits: false})}>Close</button>
      </div>
    )

    return (
      <div className="App">
        {content}
        {this.state.modalOpen ? modal : null}
        {this.state.credits && credits}
      </div>
    );
  }
}

export default App;
