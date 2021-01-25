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

    if (process.env.ENVIRONMENT == 'production') {
        const Service = require('node-windows').Service;

        var svc = new Service({
            name: 'QuickBlue-API',
            description: 'Servidor express QuickBlue-API',
            script: `${__dirname}/index.js`
        });

        // Listen for the "install" event, which indicates the
        // process is available as a service.
        svc.on('install', function () {
            svc.start();

            console.log('Serviço criado!')
        });

        svc.install();
    }
})