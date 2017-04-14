import React from 'react';
import _     from 'lodash';
import keycode from 'keycode';
import request from 'superagent';

export default class ConfigureControls extends React.Component {
  constructor(props){
    super();
    this.state = {
      keyMap: _.cloneDeep(props.user.keyMap)
    }
  }

  saveKeyMap(){
    request.post(`http://localhost:9000/update_keymap`)
      .send(
        {
          keyMap: this.state.keyMap,
          userEmail: this.props.user.email,
        }
      ).end((err, res) => {
        this.props.parent.state.user.keyMap = this.state.keyMap; // wrong, but easy
        this.props.parent.setState({controls: false});
      });
  }

  render(){
    const styles = {
      h3: {
        textAlign: 'center',
      },
      button: {
        border: 'none',
        padding: '10px',
        backgroundColor: '#009688',
        fontWeight: 'bold',
        color: 'white'
      },
    };
    console.log(this.state);
    return (
      <div>
        <h3 style={styles.h3}> Controls </h3>
        {
          _.map(this.state.keyMap, (val, action) => (
            <div style={{textAlign: 'center'}}>
              {action} <input
                type="text"
                value={keycode(val)}
                onKeyDown={(e)=>{
                  e.preventDefault();
                  e.persist();
                  e.target.value = keycode(e.target.keyCode);

                  this.setState((state) => {
                    state.keyMap[action] = e.keyCode;
                    return state;
                  });
                }}
              />
            </div>
          ))
        }
        <div style={{textAlign: 'center', marginTop: '10px'}}>
          <button style={styles.button} onClick={()=>this.saveKeyMap()} >Save</button>
          <button style={styles.button} onClick={()=>this.props.parent.setState({controls: false})} >Cancel</button>
        </div>
      </div>
    )
  }
}
