import React from 'react';

class IPTextBox extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = { value: window.location.hostname };
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    const target = { value: this.state.value };
    this.onChange({ target });
  }

  render() {
    return (
      <input type="text" className="ip-text-box" value={this.state.value} onChange={this.onChange}/>
    );
  }
  
  onChange(event) {
    const { value } = event.target;
    this.setState({ value });
    this.props.onIpChange(value);
  }
  
}

export default IPTextBox;
