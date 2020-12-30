import React from 'react';
import request from '../utils/request';

class Home extends React.Component {
  state = {
    list: []
  }

  componentDidMount() {
    request({
      url: '/api/members',
      method: 'post'
    }).then((res) => {
      if (res.code !== 0)  {
        alert(res.message);
      } else {
        this.setState({ list: res.data });
      }
    }).catch((err) => {
      alert(err.message);
    });
  }

  gotoAbout = () => {
    this.props.history.push('/about');
  }

  render() {
    return (
      <div>
        <h2>成员列表</h2>
        {this.state.list.map((item, index) => (
          <p key={index}>
            id: {item.id} -- name: {item.name}
          </p>
        ))}
        <hr />
        <button onClick={this.gotoAbout}>个人信息</button>
      </div>
    );
  }
}

export default Home;
