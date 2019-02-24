import React from 'react';

class TextBox extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      value: this.props.default || '',
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    const { value } = event.target;
    this.setState({ value });
    this.props.onChange(value);
  }

  render() {
    const style = {
      width: '200px',
      height: '30px',
      border: '0',
      borderBottom: '2px solid #0005',
      backgroundColor: '#0001',
      marginLeft: '10px',
      color: 'black',
      fontSize: '1.1rem',
      paddingLeft: '5px',
    };

    return (
      <input type="text" style={style} value={this.state.value} onChange={this.onChange}/>
    );
  }

}

export default TextBox;
