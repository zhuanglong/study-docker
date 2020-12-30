[express-jwt 项目地址](https://github.com/zhuanglong/login-demo_node/tree/express-jwt)

## JWT 理解

> JWT(json web token) 是为了在网络应用环境间传递声明而执行的一种基于 JSON 的开放标准。（json 格式传 token）
JWT 的声明一般被用来在身份提供者和服务提供者间传递被认证的用户身份信息，以便于从资源服务器获取资源。比如用在用户登录上。

**JWT 工作流程：**

1. 前端向服务端发送用户名和密码。
2. 服务端生成 token 并返回给前端。
3. 前端缓存 token，并且每次请求都带上。
4. 服务端接收 token 进行验证，确认用户信息。
5. 验证成功，返回数据给前端。

**JWT 优缺点：**

优点：

1. 利用 authorization 传输 token，无跨域问题，更适用于 app（因为app不支持 cookie）。
2. 可扩展性好，分布式的情况下，session 需要做多机数据共享，通常存到数据库或 redis，而 jwt 不需要。

缺点：

1. 占用内存比 cookies 大。
2. token 不能在服务端撤销。比如用户注销，并不能把服务端的 token 删除，只能等它失效。虽然用户已注销，但 token 可能还在有效期内，这样携带该 token 的请求依然能通过校验。

**token 不能在服务端撤销的解决方案：**

1. 将 token 存入数据库或 reids：如果需要某个 token 失效，删除即可。但是这样导致每次请求都要从数据库查询，而且违背了 JWT 的无状态原则。
2. 黑名单机制：和方法一类似。使用数据库或 redis 维护一个黑名单，如果想要某个 token 失效则添加进黑名单。每次请求都查询该 token 是否存在黑名单中。

## 开始

> 项目环境：
> - 基于 express-generator 初始化的 express 项目。
> - MongoDB 数据库。

<font color="red">注：端口已修改为 9090。</font>

express-generator 初始化的项目，结构如下：

![](https://gitee.com/zloooong/image_store/raw/master/img/20201211142036.png)

**1. 安装依赖库**

`yarn add mongodb jsonwebtoken`

 [jsonwebtoken 文档](https://github.com/auth0/node-jsonwebtoken)

**2. 封装一个 token 的工具方法**

backend\utils\tokenUtil.js

```js
const jwt = require('jsonwebtoken');
const secretKey = 'My key';

exports.setToken = ({ username, _id }) => {
  return new Promise((resolve) => {
    const token = jwt.sign(
      {
        _id,
        username
      },
      secretKey,
      {
        expiresIn: 60 * 60 * 3
      }
    );
    resolve(token);
  });
}

exports.checkToken = (token = '') => {
  return new Promise((resolve, reject) => {
    try {
      const info = jwt.verify(token.split(' ')[1], secretKey);
      resolve(info);
    } catch (error) {
      reject({ type: 'jwt', message: error.message });
    }
  });
}
```

**3. 用户注册接口**

打开 backend\routes\index.js

```js
const { MongoClient } = require('mongodb');
const tokenUtil = require('../utils/tokenUtil');
...
// 注册
router.post('/sign-up', async (req, res) => {
  let conn = null;
  try {
    const { username, password, password2 } = req.body;
    let message = '';
    if (!username) {
      message = '用户名不能为空！';
    } else if (!password) {
      message = '密码不能为空！';
    } else if (password !== password2) {
      message = '密码不一致！';
    }
    if (message) {
      res.json({
        code: 1,
        message
      });
      return;
    }

    const conn = await MongoClient.connect('mongodb://localhost:27017');
    const users = conn.db('loginDemo').collection('users');
    const userList = await users.find({ username }).toArray();
    if (userList.length) {
      res.json({
        code: 1,
        message: '已存在该用户名！'
      });
      return;
    }

    await users.insertOne({ username, password });
    res.json({
      code: 0,
      message: '注册成功！'
    });
  } catch (error) {
    console.log(`错误：${error.message}`);
  } finally {
    if (conn !== null) conn.close();
  }
});
```

调试接口

![](https://gitee.com/zloooong/image_store/raw/master/img/20201211151218.png)

成功插入记录到数据库

![](https://gitee.com/zloooong/image_store/raw/master/img/20201211152455.png)

注册流程，判断是否存在该用户，不存在则在 users 表写入一条记录。

**4. 用户登录接口**

打开 backend\routes\index.js

```js
// 登录
router.post('/sign-in', async (req, res) => {
  let conn = null;
  try {
    const { username, password } = req.body;
    let message = '';
    if (!username) {
      message = '用户名不能为空！';
    } else if (!password) {
      message = '密码不能为空！';
    }
    if (message) {
      res.json({
        code: 1,
        message
      });
      return;
    }

    const conn = await MongoClient.connect('mongodb://localhost:27017');
    const users = conn.db('loginDemo').collection('users');
    const userList = await users.find({ username, password }).toArray();
    if (!userList.length) {
      res.json({
        code: 1,
        message: '用户名或密码错误！'
      });
      return;
    }

    const token = await tokenUtil.setToken({
      _id: userList[0]._id,
      username: userList[0].username
    });
    res.json({
      code: 0,
      message: '登入成功！',
      data: {
        token,
        username: userList[0].username
      }
    });
  } catch (error) {
    console.log(`错误：${error.message}`);
  } finally {
    if (conn !== null) conn.close();
  }
});
```

调试接口

![](https://gitee.com/zloooong/image_store/raw/master/img/20201211153601.png)

登录流程，查询用户名和密码是否正确，正确则用 _id 和 username 生成 token，返回给客户端。

**5. 路由前置校验 token**

打开 backend\app.js

![](https://gitee.com/zloooong/image_store/raw/master/img/20201211142525.png)

```js
var tokenUtil = require('./utils/tokenUtil');
...
app.use(async function(req, res, next) {
  const whiteList = ['/sign-in', '/sign-up', '/users'];
  if (whiteList.includes(req.path)) {
    next();
    return;
  }
  try {
    const data = await tokenUtil.checkToken(req.headers['authorization']);
    res.locals.userinfo = data;
    next();
  } catch (error) {
    res.json({
      code: 101,
      message: error.message
    });
  }
});
```

请求的路由都会经过该入口，`whiteList` 是白名单，比如登录、注册这些不需要校验 token。

checkToken 校验 token 并解析出用户信息，赋值给 res.locals.userinfo，这样下一个回调就能拿到用户信息。

**6. members 接口**

打开 backend\routes\index.js

```js
router.post('/members', async (req, res) => {
  let conn = null;
  try {
    const userinfo = res.locals.userinfo;
    res.json({
      code: 0,
      message: '查询成功！',
      data: [
        { id: userinfo._id, name: userinfo.username },
        { id: 'xxx1', name: 'A' },
        { id: 'xxx2', name: 'B' },
      ]
    });
  } catch (error) {
    console.log(`错误：${error.message}`);
  } finally {
    if (conn !== null) conn.close();
  }
});
```

调试接口

![](https://gitee.com/zloooong/image_store/raw/master/img/20201211162853.png)

## 参考

- [node.js之express的token验证](https://blog.csdn.net/qq_39905409/article/details/87905335)
- [express中实现加密JWT（JSON Web Token）](https://blog.csdn.net/u014713031/article/details/93872479)
- [jwt与token+redis，哪种方案更好用？](https://www.zhihu.com/question/274566992)
- [深入了解jwt方案的优缺点](https://www.cnblogs.com/nangec/p/12687258.html)
- [JWT 安全性 讨论](https://www.v2ex.com/t/375908)
- [前后端分离，用 React/Vue 框架下，用户权限应该用 cookie 验证？还是 token 验证？](https://www.v2ex.com/t/737483#reply33)
