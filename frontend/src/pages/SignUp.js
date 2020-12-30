import React from 'react';
import request from '../utils/request';

class SignUp extends React.Component {
  state = {
    username: '',
    password: '',
    password2: ''
  }

  gotoSignIn = () => {
    this.props.history.push('/sign-in');
  }

  onSignIn = () => {
    const { username, password, password2 } = this.state;
    request({
      url: '/api/sign-up',
      method: 'post',
      data: {
        username,
        password,
        password2
      }
    }).then((res) => {
      if (res.code !== 0)  {
        alert(res.message);
      } else {
        alert(res.message);
        this.props.history.replace('/sign-in');
      }
    });
  }

  render() {
    return (
      <div>
        <h2>注册</h2>
        <input type="text" onChange={(event) => this.setState({ username: event.target.value })} placeholder="用户名" />
        <p />
        <input type="password" onChange={(event) => this.setState({ password: event.target.value })} placeholder="密码" />
        <p />
        <input type="password" onChange={(event) => this.setState({ password2: event.target.value })} placeholder="确认密码" />
        <p />
        <button onClick={this.onSignIn}>注册</button> | <button onClick={this.gotoSignIn}>已有账户？去登陆</button>
      </div>
    );
  }
}

export default SignUp;
