const passport = require('passport')
const passportJwt = require('passport-jwt')
const { Strategy, ExtractJwt } = passportJwt

module.exports = app => {
    const params = {
        secretOrKey: process.env.AUTH_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    }

    const bearerStrategy = new Strategy(params, (payload, done) => {
        done(null, payload)
    })

    passport.use(bearerStrategy)

    return {
        authenticate: () => passport.authenticate('jwt', { session: false })
    }
}