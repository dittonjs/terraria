import React from 'react';
import request from 'superagent';
import _ from 'lodash';
export default class JoinGame extends React.Component {
  constructor(){
    super();
    this.state = {
      worldNames: []
    }
  }
  componentDidMount(){
    if(!this.refs.hostName.value) return;
    request
      .get(`http://${this.refs.hostName.value}:9000/current_games`)
      .end((err, res)=>{
        console.log(res.text);
        !err && this.setState({worldNames: JSON.parse(res.text)});
      });
  }

  joinGame(worldName){
    window.location.href = `http://${this.refs.hostName.value}:9000/?gameName=${worldName}&hostName=${this.refs.hostName.value}&join=true&playerId=${this.props.user.userName}`;
  }
  render(){
    const styles = {
      container: {
        width: '300px',
        height: '400px',
        border: '1px solid white'
      },
      worldName: {
        padding: '10px',
        borderBottom: '1px solid white',
      },
      button: {
        border: 'none',
        padding: '10px',
        backgroundColor: '#009688',
        fontWeight: 'bold',
        color: 'white',
        float: 'right',
        marginLeft: '5px',
      },
      refresh: {
        padding: '3px',
        marginLeft: '0px',
        marginRight: '29px',
      },
      h3: {
        marginBottom: '0px',
      }
    }

    return (
      <div>
        <h3 style={styles.h3}>Join Game</h3>
        <div>
          Host Name: <input onChange={() => this.setState({worldNames: []})} type='text' ref='hostName' />
          <button style={{...styles.button, ...styles.refresh}} onClick={() => {this.componentDidMount()}}>Refresh</button>
        </div>
        <div style={styles.container}>
          {_.map(this.state.worldNames, world => (
            <div key={world} style={styles.worldName}>
              {world}
              <button style={styles.button} onClick={()=>this.joinGame(world)}>JOIN</button>
              <div style={{clear: 'both'}} />
            </div>
          ))}
        </div>
      </div>
    )
  }
}
