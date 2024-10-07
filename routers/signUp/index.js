const Router = require('koa-router')
const signUp = new Router()
const Client = require('../../DBControl/clients')
const DBClients = require('../../DBControl/allClietns')
const dbClients = new DBClients()

signUp.post('/registration', (ctx) => {
    const {nickName} = JSON.parse(ctx.request.body)
    const exist =  dbClients.read("nickName", nickName)
    if (exist) {
        ctx.response.body = {status: "Client already exist"}
        ctx.response.status = 400;
        return
    }
    const client = new Client(nickName)
    dbClients.create(client)
    ctx.response.body = {status: "OK"}
    ctx.response.status = 201;
})

signUp.post('/delete', (ctx) => {
    const {nickName} = JSON.parse(ctx.request.body)
    dbClients.delete(nickName)
    ctx.response.body = {status: "OK"}
    ctx.response.status = 200;
})

module.exports = {signUp, dbClients}