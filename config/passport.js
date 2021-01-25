const passport = require('passport')
const passportJwt = require('passport-jwt')
const { Strategy, ExtractJwt } = passportJwt

module.exports = app => {
    const params = {
        secretOrKey: process.env.AUTH_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    }

    const bearerStrategy = new Strategy(params, (payload, done) => {
        app.commonDB('usuario')
            .where({ id: payload.id })
            .first()
            .then(user => done(null, user ? payload : false))
            .catch(err => done(err, false))
    })

    passport.use(bearerStrategy)

    return {
        authenticate: () => passport.authenticate('jwt', { session: false })
    }
}