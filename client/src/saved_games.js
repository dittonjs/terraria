import React from 'react';
import request from 'superagent';
import _ from 'lodash';
export default class SavedGames extends React.Component {
  constructor(){
    super();
    this.state = {
      worldNames: []
    }
  }
  componentWillMount(){
    request
      .get(`http://localhost:9000/world_names?creator_email=${this.props.user.email}`)
      .end((err, res)=>{
        this.setState({worldNames: JSON.parse(res.text)});
      });
  }
  deleteWorld(worldName){
    request
      .get(`http://localhost:9000/delete_world?world_name=${worldName}`)
      .end((err, res)=>{
        this.componentWillMount();
      });
  }
  continueGame(worldName){}
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
    }
    return (
      <div>
        <h3>Saved Worlds</h3>
        <div style={styles.container}>
          {_.map(this.state.worldNames, world => (
            <div key={world._id} style={styles.worldName}>
              {world.name}
              <button style={styles.button} onClick={()=>this.deleteWorld(world.name)}>Delete</button>
              <button style={styles.button} onClick={()=>this.continueGame(world.name)}>Continue</button>
              <div style={{clear: 'both'}} />
            </div>
          ))}
        </div>
      </div>
    );
  }
}
