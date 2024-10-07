const id = require("uuid")
class Client {
    constructor(nickName){
        this.id = id.v4();
        this.nickName = nickName
    }
}

module.exports = Client