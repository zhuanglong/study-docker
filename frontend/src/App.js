import { HashRouter as Router, withRouter, Switch, Redirect, Route }  from 'react-router-dom';

import eventBus from './utils/eventBus';
import React from 'react';
import Home from './pages/Home';
import About from './pages/About';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

// 路由验证
const PrivateRoute = ({ component: Component, ...rest }) => {
  // 存在 token 表示已登录
  const isLogined = !!window.localStorage.getItem('token');
  return (
    <Route
      {...rest}
      render={(props) => (
        isLogined ?
          <Component {...props} />
          :
          <Redirect to="/sign-in" />
      )}
    />
  );
};

class Layout extends React.Component {
  componentDidMount() {
    eventBus.on('SignOut', () => {
      window.localStorage.setItem('token', '');
      window.localStorage.setItem('username', '');
      this.props.history.replace('/sign-in');
    });
  }

  componentWillUnmount() {
    eventBus.off('SignOut');
  }

  render() {
    return (
      <Switch>
        <PrivateRoute exact path="/" component={Home} />
        <PrivateRoute exact path="/About" component={About} />
        <Route path="/sign-in" component={SignIn} />
        <Route path="/sign-up" component={SignUp} />
      </Switch>
    )
  }
}

const LayoutWithRouter = withRouter(Layout);

function App() {
  return (
    <Router>
      <LayoutWithRouter />
    </Router>
  );
}

export default App;
