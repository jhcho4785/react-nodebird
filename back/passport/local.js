const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { User } = require('../models');
const bcrypt = require('bcrypt');

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        //로그인 시 요청하는 키 이름
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({
            where: { email },
          });
          if (!user) {
            //서버에러, 성공여부, 클라이언트에러
            done(null, false, { reason: '존재하지 않는 이메일입니다.' });
          }
          //비밀번호 일치 여부 확인
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          }
          return done(null, false, { reason: '비밀번호가 틀렸습니다.' });
        } catch (e) {
          console.error(e);
          done(e);
        }
      },
    ),
  );
};
