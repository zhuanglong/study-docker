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
