var express = require('express');
const { MongoClient } = require('mongodb');
const tokenUtil = require('../utils/tokenUtil');
const { dbConfig } = require('../utils/secret');

var router = express.Router();

var connectDB = () => MongoClient.connect(`mongodb://${dbConfig.host}:${dbConfig.port}`, {
  // 存在用户名才设置，防止为空报错
  ...(dbConfig.username &&
    {
      auth: {
        user: dbConfig.username,
        password: dbConfig.password
      }
    }
  )
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

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

    const conn = await connectDB();
    const users = conn.db(dbConfig.database).collection('users');
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

    const conn = await connectDB();
    const users = conn.db(dbConfig.database).collection('users');
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

module.exports = router;
