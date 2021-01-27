const soap = require('soap');
const url = process.env.NFS_URL;

const { isCNPJ } = require('brazilian-values')

const reports = require('./report')
const pdfGenerator = require('html-pdf')

const options = {
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
    const { existsOrError, parseNumber } = app.config.validation

    const statusService = async (req, res) => {
        soap.createClient(url, options, function (err, client) {
            if (err) {
                console.log(err);
                return res.status(500).send('Não foi possível conectar-se ao servidor da prefeitura')
            }

            return res.status(204).send()
        })
    }

    const versaoNfse = async (req, res) => {
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

    const gerarNfse = async (req, res) => {
        const data = { ...req.body }

        try {
            existsOrError(data.cnpj, 'Informe o CNPJ da empresa')
            existsOrError(data.inscricaoMunicipal, 'Informe a inscrição municipal da empresa')
            existsOrError(data.senha, 'Informe a senha do portal simpliss')
            existsOrError(data.prestacaoServico, 'Informe a prestação de serviço para a geração da nota fiscal')

            data.cnpj = data.cnpj.replace(/[^\d]+/g, '')

            if (!isCNPJ(data.cnpj)) {
                throw "Informe um cnpj válido"
            }
        } catch (e) {
            return res.status(400).send(e.toString())
        }

        soap.createClient(url, options, function (err, client) {
            if (err) {
                console.log(err);
                return res.status(500).send('Não foi possível conectar-se ao servidor da prefeitura')
            }

            // return res.status(500).send('Função em desenvolvimento')

            const server = client.NfseService.BasicHttpBinding_INfseService
            server.GerarNfse({
                GerarNovaNfseEnvio: {
                    Prestador: {
                        Cnpj: data.cnpj,
                        InscricaoMunicipal: data.inscricaoMunicipal
                    },
                    InformacaoNfse: {
                        NaturezaOperacao: 1,
                        RegimeEspecialTributacao: 6,
                        OptanteSimplesNacional: data.prestacaoServico.imposto.simplesNacional ? 1 : 2,
                        IncentivadorCultural: 2,
                        Status: 1,
                        Competencia: new Date(data.prestacaoServico.dataPrestacaoServico).toISOString().substr(0, 10),
                        OutrasInformacoes: data.prestacaoServico.descricao,
                        Servico: {
                            Valores: {
                                ValorServicos: data.prestacaoServico.valorServicos,
                                ValorDeducoes: 0,
                                ValorPis: 0,
                                ValorCofins: 0,
                                ValorInss: 0,
                                ValorIr: 0,
                                ValorCsll: 0,
                                issRetido: 0,
                                ValorIss: 0,
                                OutrasRetencoes: 0,
                                BaseCalculo: data.prestacaoServico.valorServicos,
                                Aliquota: data.prestacaoServico.imposto.iss
                            },
                            ItemListaServico: data.prestacaoServico.imposto.enquadramentoServico,
                            CodigoCnae: data.prestacaoServico.imposto.cnae,
                            CodigoTributacaoMunicipio: data.prestacaoServico.imposto.enquadramentoServico,
                            Discriminacao: data.prestacaoServico.observacao,
                            ItensServico: data.prestacaoServico.servicos
                        },
                        Tomador: {
                            RazaoSocial: data.prestacaoServico.pessoa.nome,
                            IdentificacaoTomador: {
                                CpfCnpj: data.prestacaoServico.pessoa.cpfCnpj,
                                InscricaoEstadual: data.prestacaoServico.pessoa.registro,
                            },
                            Endereco: {
                                Cep: data.prestacaoServico.pessoa.cep.replace(/[^\d]+/g, ''),
                                Uf: data.prestacaoServico.pessoa.estado,
                                Bairro: data.prestacaoServico.pessoa.bairro,
                                Endereco: data.prestacaoServico.pessoa.logradouro,
                                Numero: parseNumber(data.prestacaoServico.pessoa.numero),
                                Complemento: data.prestacaoServico.pessoa.complemento || '',
                            },
                            Contato: {
                                Telefone: data.prestacaoServico.pessoa.contato1,
                                Email: data.prestacaoServico.pessoa.email1
                            }
                        }
                    }
                },
                pParam: { P1: data.cnpj, P2: data.senha }
            }, (err, result, responseXML, param, requestXML) => {
                // console.log(requestXML)
                if (err) {
                    if (err.response.statusCode == 500)
                        return res.status(500).send('Erro no servidor da prefeitura ao gerar a NFSe, tente novamente mais tarde')

                    return res.status(500).send('Erro ao gerar a NFSe, verifique os dados da prestação de serviço e impostos')
                }

                // console.log(result.GerarNfseResult.ListaMensagemRetorno.MensagemRetorno)
                // console.log(result.GerarNfseResult)

                if (result.GerarNfseResult.ListaMensagemRetorno && result.GerarNfseResult.ListaMensagemRetorno.MensagemRetorno) {
                    if (Array.isArray(result.GerarNfseResult.ListaMensagemRetorno.MensagemRetorno))
                        return res.status(400).send(result.GerarNfseResult.ListaMensagemRetorno.MensagemRetorno[0].Mensagem)
                    return res.status(400).send(result.GerarNfseResult.ListaMensagemRetorno.MensagemRetorno.Mensagem)
                }

                return res.json(result.GerarNfseResult)
            })


        })
    }

    const consultarNfse = async (req, res) => {
        const data = { ...req.body }

        try {
            existsOrError(data.cnpj, 'Informe o CNPJ da empresa')
            existsOrError(data.inscricaoMunicipal, 'Informe a inscrição municipal da empresa')
            existsOrError(data.senha, 'Informe a senha do portal simpliss')

            data.cnpj = data.cnpj.replace(/[^\d]+/g, '')

            if (!isCNPJ(data.cnpj)) {
                throw "Informe um cnpj válido"
            }
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
                        Cnpj: data.cnpj,
                        InscricaoMunicipal: data.inscricaoMunicipal
                    },
                    NumeroNfse: req.params.notaFiscal
                },
                pParam: { P1: data.cnpj, P2: data.senha }
            }, (err, result, xmlResponseString) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Erro ao consultar Nota fiscal')
                }

                if (result.ConsultarNfseResult.ListaMensagemRetorno && result.ConsultarNfseResult.ListaMensagemRetorno.MensagemRetorno) {
                    if (Array.isArray(result.ConsultarNfseResult.ListaMensagemRetorno.MensagemRetorno))
                        return res.status(400).send(result.ConsultarNfseResult.ListaMensagemRetorno.MensagemRetorno[0].Mensagem)
                    return res.status(400).send(result.ConsultarNfseResult.ListaMensagemRetorno.MensagemRetorno.Mensagem)
                }

                return res.json(result.ConsultarNfseResult.ListaNfse.CompNfse.Nfse)
            })
        })
    }

    const cancelarNfse = async (req, res) => {
    }

    const consultarLoteRps = async (req, res) => {
        const data = { ...req.body }

        try {
            existsOrError(data.dataInicial, 'Informe uma data inicial')
            existsOrError(data.dataFinal, 'Informe uma data final')
            existsOrError(data.cnpj, 'Informe o CNPJ da empresa')
            existsOrError(data.inscricaoMunicipal, 'Informe a inscrição municipal da empresa')
            existsOrError(data.senha, 'Informe a senha do portal simpliss')

            data.cnpj = data.cnpj.replace(/[^\d]+/g, '')

            if (!isCNPJ(data.cnpj)) {
                throw "Informe um cnpj válido"
            }
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
                        Cnpj: data.cnpj,
                        InscricaoMunicipal: data.inscricaoMunicipal
                    },
                    DataInicial: data.dataInicial,
                    DataFinal: data.dataFinal
                },
                pParam: { P1: data.cnpj, P2: data.senha }
            }, (err, result, xmlResponse) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Erro ao consultar Nota fiscal')
                }

                return res.json(result.ConsultarNfseResult.ListaNfse.CompNfse)
            })
        })
    }

    const consultarSituacaoLoteRps = async (req, res) => {
        const data = { ...req.body }

        try {
            existsOrError(data.protocolo, 'Informe o protocolo do lote RPS')
            existsOrError(data.cnpj, 'Informe o CNPJ da empresa')
            existsOrError(data.inscricaoMunicipal, 'Informe a inscrição municipal da empresa')
            existsOrError(data.senha, 'Informe a senha do portal simpliss')

            data.cnpj = data.cnpj.replace(/[^\d]+/g, '')

            if (!isCNPJ(data.cnpj)) {
                throw "Informe um cnpj válido"
            }
        } catch (e) {
            return res.status(400).send(e.toString())
        }

        soap.createClient(url, options, function (err, client) {
            if (err) {
                console.log(err);
                return res.status(500).send('Não foi possível conectar-se ao servidor da prefeitura')
            }

            const server = client.NfseService.BasicHttpBinding_INfseService

            server.ConsultarSituacaoLoteRps({
                ConsultarSituacaoLoteRpsEnvio: {
                    Protocolo: data.protocolo,
                    Prestador: {
                        Cnpj: data.cnpj,
                        InscricaoMunicipal: data.inscricaoMunicipal
                    },
                },
                pParam: { P1: data.cnpj, P2: data.senha }
            }, (err, result, xmlResponse) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Erro ao consultar situação do lote RPS')
                }

                if (result.ConsultarSituacaoLoteRpsResult.ListaMensagemRetorno && result.ConsultarSituacaoLoteRpsResult.ListaMensagemRetorno.MensagemRetorno) {
                    if (Array.isArray(result.ConsultarSituacaoLoteRpsResult.ListaMensagemRetorno.MensagemRetorno))
                        return res.status(400).send(result.ConsultarSituacaoLoteRpsResult.ListaMensagemRetorno.MensagemRetorno[0].Mensagem)
                    return res.status(400).send(result.ConsultarSituacaoLoteRpsResult.ListaMensagemRetorno.MensagemRetorno.Mensagem)
                }

                return res.json(result.ConsultarSituacaoLoteRpsResult)
            })
        })
    }

    const consultarNfsePorRps = async (req, res) => { }

    // const saveXml = (nome = "temp", xmlString) => {
    //     fs.writeFile(`${nome}.xml`, xmlResponseString, function (err) {
    //         if (err) {
    //             console.log(err)
    //             return
    //         }
    //     });
    // }

    const gerarPdf = async (req, res) => {
        const data = { ...req.body }

        try {
            existsOrError(data.notaFiscal, 'Informe a nota fiscal que deseja gerar o PDF')
            existsOrError(data.cnpj, 'Informe o CNPJ da empresa')
            existsOrError(data.inscricaoMunicipal, 'Informe a inscrição municipal da empresa')
            existsOrError(data.senha, 'Informe a senha do portal simpliss')

            data.cnpj = data.cnpj.replace(/[^\d]+/g, '')

            if (!isCNPJ(data.cnpj)) {
                throw "Informe um cnpj válido"
            }
        } catch (error) {
            return res.status(500).send(error)
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
                        Cnpj: data.cnpj,
                        InscricaoMunicipal: data.inscricaoMunicipal
                    },
                    NumeroNfse: data.notaFiscal
                },
                pParam: { P1: data.cnpj, P2: data.senha }
            }, (err, result, xmlResponseString) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Erro ao consultar Nota fiscal')
                }

                if (result.ConsultarNfseResult.ListaMensagemRetorno && result.ConsultarNfseResult.ListaMensagemRetorno.MensagemRetorno) {
                    if (Array.isArray(result.ConsultarNfseResult.ListaMensagemRetorno.MensagemRetorno))
                        return res.status(400).send(result.ConsultarNfseResult.ListaMensagemRetorno.MensagemRetorno[0].Mensagem)
                    return res.status(400).send(result.ConsultarNfseResult.ListaMensagemRetorno.MensagemRetorno.Mensagem)
                }

                const numeroNotaFiscal = result.ConsultarNfseResult.ListaNfse.CompNfse.Nfse.InfNfse.Numero

                pdfGenerator.create(reports.danfseHtml(result.ConsultarNfseResult.ListaNfse.CompNfse.Nfse.InfNfse), options).toFile(`./pdfs/${numeroNotaFiscal}.pdf`, function (err, file) {
                    if (err) return res.status(500).send('Erro ao gerar PDF, tente novamente mais tarde')
                    // console.log(response); // { filename: 'views/banco.pdf' } 

                    res.status(200).send(`pdfs/${numeroNotaFiscal}.pdf`)
                });
            })
        })
    }

    return {
        statusService,
        versaoNfse,
        gerarNfse,
        consultarNfse,
        cancelarNfse,
        consultarLoteRps,
        consultarSituacaoLoteRps,
        consultarNfsePorRps,
        gerarPdf
    }
}