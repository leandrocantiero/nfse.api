const soap = require('soap');
const url = process.env.NFS_URL;

var options = {
    wsdl_options: {
        forever: true,
        rejectUnauthorized: false,
        strictSSL: false,
        //   pfx: fs.readFileSync(__dirname + '/folder/my.pfx'),
        //   passphrase: 'myPass'
    }
};

// http://issprudente.sp.gov.br/ws_nfse/nfseservice.svc
// http://schemas.xmlsoap.org/soap/envelope/

module.exports = app => {
    const { existsOrError } = app.config.validation

    const statusService = (req, res) => {
        soap.createClient(url, options, function (err, client) {
            if (err) {
                console.log(err);
                return res.status(500).send('Não foi possível conectar-se ao servidor da prefeitura')
            }

            return res.status(204).send()
        })
    }

    const versaoNFS = async (req, res) => {
        soap.createClient(url, options, function (err, client) {
            if (err) {
                console.log(err);
                return res.status(500).send('Não foi possível conectar-se ao servidor da prefeitura')
            }

            const server = client.NfseService.BasicHttpBinding_INfseService

            server.Versao((err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Erro ao consultar versão')
                }

                return res.json({ data: result.VersaoResult })
            })
        })
    }

    const emitirNFS = (req, res) => {
    }

    const consultaNFS = (req, res) => {
        try {
            existsOrError(req.params.notaFiscal, 'Informe o número da nota')
            existsOrError(req.query.cnpj, 'Informe o CNPJ da empresa')
            existsOrError(req.query.inscricaoMunicipal, 'Informe a inscrição municipal da empresa')
            existsOrError(req.query.senha, 'Informe a senha do portal simpliss')
        } catch (e) {
            return res.status(400).send(e.toString())
        }

        soap.createClient(url, options, function (err, client) {
            if (err) {
                console.log(err);
                return res.status(500).send('Não foi possível conectar-se ao servidor da prefeitura')
            }

            const server = client.NfseService.BasicHttpBinding_INfseService

            server.ConsultarNfse({
                ConsultarNfseEnvio: {
                    Prestador: {
                        Cnpj: req.query.cnpj,
                        InscricaoMunicipal: req.query.inscricaoMunicipal
                    },
                    NumeroNfse: req.params.notaFiscal
                },
                pParam: { P1: req.query.cnpj, P2: req.query.senha }
            }, (err, result, xmlResponse) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Erro ao consultar Nota fiscal')
                }

                return res.json(result.ConsultarNfseResult.ListaNfse.CompNfse.Nfse)
            })
        })
    }

    const consultaLoteNFS = (req, res) => {
        try {
            existsOrError(req.query.dataInicial, 'Informe uma data inicial')
            existsOrError(req.query.dataFinal, 'Informe uma data final')
            existsOrError(req.query.cnpj, 'Informe o CNPJ da empresa')
            existsOrError(req.query.inscricaoMunicipal, 'Informe a inscrição municipal da empresa')
            existsOrError(req.query.senha, 'Informe a senha do portal simpliss')
        } catch (e) {
            return res.status(400).send(e.toString())
        }

        soap.createClient(url, options, function (err, client) {
            if (err) {
                console.log(err);
                return res.status(500).send('Não foi possível conectar-se ao servidor da prefeitura')
            }

            const server = client.NfseService.BasicHttpBinding_INfseService

            server.ConsultarNfse({
                ConsultarNfseEnvio: {
                    Prestador: {
                        Cnpj: req.query.cnpj,
                        InscricaoMunicipal: req.query.inscricaoMunicipal
                    },
                    DataInicial: req.query.dataInicial,
                    DataFinal: req.query.dataFinal
                },
                pParam: { P1: req.query.cnpj, P2: req.query.senha }
            }, (err, result, xmlResponse) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Erro ao consultar Nota fiscal')
                }

                return res.json(result.ConsultarNfseResult.ListaNfse.CompNfse)
            })
        })
    }

    const cancelaNFS = (req, res) => {
    }

    return { statusService, versaoNFS, emitirNFS, consultaLoteNFS, consultaNFS, cancelaNFS }
}