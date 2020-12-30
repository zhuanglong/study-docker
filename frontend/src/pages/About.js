import React from 'react';
import eventBus from '../utils/eventBus';

class About extends React.Component {
  goBack = () => {
    this.props.history.goBack();
  }

  onSignOut() {
    eventBus.fire('SignOut');
  }

  render() {
    return (
      <div>
        <h2>个人资料</h2>
        <p>
          name: {window.localStorage.getItem('username')}
        </p>
        <hr />
        <button onClick={this.goBack}>返回</button> | <button onClick={this.onSignOut}>退出登陆</button>
      </div>
    );
  }
}

export default About;
