const combine = require('koa-combine-routers')
const {signUp} = require('./signUp/index.js')

const router = combine(
    signUp
)

module.exports = router