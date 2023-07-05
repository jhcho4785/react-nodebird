const passport = require('passport');
const local = require('./local');
const { User } = require('../models');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id); //세션에 로그인한 아이디만 저장하기 위해
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({ where: id });
      done(null, user);
    } catch (e) {
      console.error(e);
      done(e);
    }
  });

  local();
};
