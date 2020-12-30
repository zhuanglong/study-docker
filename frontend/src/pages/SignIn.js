import React from 'react';
import request from '../utils/request';

class SignIn extends React.Component {
  state = {
    username: '',
    password: ''
  }

  gotoSignUp = () => {
    this.props.history.push('/sign-up');
  }

  onSignIn = () => {
    const { username, password } = this.state;
    request({
      url: '/api/sign-in',
      method: 'post',
      data: {
        username,
        password
      }
    }).then((res) => {
      if (res.code !== 0)  {
        alert(res.message);
      } else {
        window.localStorage.setItem('token', res.data.token);
        window.localStorage.setItem('username', res.data.username);
        this.props.history.replace('/');
      }
    });
  }

  render() {
    return (
      <div>
        <h2>登陆</h2>
        <input type="text" onChange={(event) => this.setState({ username: event.target.value })} placeholder="用户名" />
        <p />
        <input type="password" onChange={(event) => this.setState({ password: event.target.value })} placeholder="密码" />
        <p />
        <button onClick={this.onSignIn}>登录</button> | <button onClick={this.gotoSignUp}>没有账户？去注册</button>
      </div>
    );
  }
}

export default SignIn;
