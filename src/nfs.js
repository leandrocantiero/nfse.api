const soap = require('soap');
const url = 'http://schemas.xmlsoap.org/soap/envelope/';

// http://issprudente.sp.gov.br/ws_nfse/nfseservice.svc
// http://schemas.xmlsoap.org/soap/envelope/

module.exports = app => {
    const statusService = (req, res) => {
        soap.createClient(url, function (err, client) {
            if (err) {
                console.log(err);
                return res.status(500).send('Não foi possível conectar-se ao servidor da prefeitura')
            }

            return res.status(204).send()
        })
    }

    const emitirNFS = (req, res) => {

    }

    const consultaNFS = (req, res) => {

    }

    const consultaLoteNFS = (req, res) => {

    }

    const cancelaNFS = (req, res) => {

    }

    return { statusService, emitirNFS, consultaLoteNFS, consultaNFS, cancelaNFS }
}