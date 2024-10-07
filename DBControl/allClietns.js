class DBClients{
    constructor() {
        this.dbClients = []
    }

    create(client) {
        this.dbClients.push(client)
    }

    delete(nickName) {
        this.dbClients = this.dbClients.filter(elem => elem.nickName != nickName)
    }

    read(key, nickName) {
        return this.dbClients.find(elem => elem[key] == nickName)
    }

}

module.exports = DBClients