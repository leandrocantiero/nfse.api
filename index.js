const app = require('express')()
const http = require('http').createServer(app)

require('dotenv').config()

require('consign')()
    .include('./config')
    .then('./src')
    .then('./routes')
    .into(app)

const PORT = process.env.PORT || 4000
http.listen(PORT, function () {
    console.log('api online na porta ' + PORT)
})