const { koaBody } = require("koa-body");
const Koa = require('koa')
const app = new Koa()
const http = require('http')
const router = require('./routers/index')
const WS = require('ws')
const cors = require("koa2-cors")
const {dbClients} = require('./routers/signUp/index.js')

app.use(koaBody({
    urlencoded: true,
    multipart: true,
}))

app.use(cors({
    origin: '*',
}))

app.use(router())

const server = http.createServer(app.callback())

const wsServer = new WS.Server({
    server
})

const group = {}

wsServer.on('connection', (ws) => {
    ws.on('message', (msg) => {
        const data = JSON.parse(msg)
        let users = undefined
        if (data.event === 'login') {
            ws.connectInfo = data
            if (typeof group[data.roomId] === 'undefined') {
                group[data.roomId] = {}
                group[data.roomId]['users'] = []
                group[data.roomId]['count'] = 1
            } else {
                group[data.roomId]['count']++
            }
            group[data.roomId]['users'].push(data.userName)
            data.count = group[data.roomId]['count']
            const clients = Array.from(wsServer.clients)
            const anotherClients = clients.filter(client => client != ws)
            if (anotherClients.length) {
                const anothers = group[data.roomId]['users'].slice(0, group[data.roomId]['users'].length - 1)
                users = {users: anothers}
            }
        }
        // if (typeof ws.roomId === undefined) {
        //     ws.roomId = data.roomId
        // } // Многокомнатная прослушка
        const clients = Array.from(wsServer.clients)
        clients.forEach(client => {
            if (client.readyState === WS.OPEN) {
                if (client != ws) {
                    if (data.myMsg) {
                        data.myMsg = false
                    }
                    client.send(JSON.stringify(data))
                } else {
                    if (users != undefined) {
                        Object.assign(data, users)
                    } else {
                        data.myMsg = true;
                    }
                    client.send(JSON.stringify(data))
                    data.users = []
                }
            }
        })
    })
    ws.on('close', () => {
        group[ws.connectInfo.roomId]['users'] = group[ws.connectInfo.roomId]['users'].filter(elem => elem != ws.connectInfo.userName)
        dbClients.delete(ws.connectInfo.userName)
        const newNum = --group[ws.connectInfo.roomId]['count']
        const data = {...ws.connectInfo, event: 'close', count: newNum}
        const clients = Array.from(wsServer.clients)
        clients.filter(client => client !== ws && client.readyState === WS.OPEN).forEach(client => client.send(JSON.stringify(data)))
    })
})

server.listen(7070)