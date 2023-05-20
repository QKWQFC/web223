const KakaoStrategy = require('passport-kakao').Strategy

const kakaoStrategy = passport.use(new KakaoStrategy({
    clientID : process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET, // clientSecret을 사용하지 않는다면 넘기지 말거나 빈 스트링을 넘길 것
    callbackURL : callbackURL
  },
  (accessToken, refreshToken, profile, done) => {
    // 사용자의 정보는 profile에 들어있다.
    return done(profile)
  }
))

module.exports = kakaoStrategy