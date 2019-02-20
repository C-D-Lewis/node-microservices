import React from 'react';

class TextBox extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = { value: this.props.default || '' };
    this.onChange = this.onChange.bind(this);
  }

  render() {
    return (
      <input type="text" className="text-box" value={this.state.value} onChange={this.onChange}/>
    );
  }
  
  onChange(event) {
    const { value } = event.target;
    this.setState({ value });
    this.props.onChange(value);
  }
  
}

export default TextBox;
