import React from 'react';

class IPTextBox extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = { value: window.location.hostname };
  }

  componentDidMount() {
    const target = { value: this.state.value };
    this.onChange({ target });
  }

  render() {
    const style = {
      width: '200px',
      height: '30px',
      border: 0,
      backgroundColor: '#0003',
      marginLeft: '50px',
      marginRight: '10px',
      color: 'white',
      fontSize: '1.1rem',
      paddingLeft: '5px',
    };

    return (
      <input id="ip-text-box" style={style} type="text" value={this.state.value} 
        onChange={this.onChange.bind(this)}/>
    );
  }
  
  onChange(event) {
    const { value } = event.target;
    this.setState({ value });

    this.props.setState({ ip: value });
  }
  
}

export default IPTextBox;
