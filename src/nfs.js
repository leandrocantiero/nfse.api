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
            existsOrError(data.prestacaoServico.observacao, 'Informe a discriminação de serviço para emissão da NFSe')

            existsOrError(data.prestacaoServico.pessoa, 'Informe o cliente da prestação de serviço')
            existsOrError(data.prestacaoServico.pessoa.cpfCnpj, 'Informe o CPF/CNPJ do cliente')
            existsOrError(data.prestacaoServico.pessoa.logradouro, 'Informe o endereço do cliente')
            existsOrError(data.prestacaoServico.pessoa.numero, 'Informe o número do cliente')
            existsOrError(data.prestacaoServico.pessoa.bairro, 'Informe o bairro do cliente')
            existsOrError(data.prestacaoServico.pessoa.cidade, 'Informe o cidade do cliente')
            existsOrError(data.prestacaoServico.pessoa.estado, 'Informe o UF do cliente')
            existsOrError(data.prestacaoServico.pessoa.cep, 'Informe o CEP do cliente')

            if (Number.isNaN(data.prestacaoServico.pessoa.numero))
                throw "Número do endereço do cliente inválido"

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

            const contrato = data.prestacaoServico.contrato
            // console.log({
            //     Servico: {
            //         Valores: {
            //             ValorServicos: data.prestacaoServico.valorServicos,
            //             ValorDeducoes: 0,
            //             ValorPis: 0,
            //             ValorCofins: 0,
            //             ValorInss: 0,
            //             ValorIr: 0,
            //             ValorCsll: 0,
            //             IssRetido: contrato ? (contrato.retencaoIss ? 1 : 2) : 2,
            //             ValorIss: Number(data.prestacaoServico.valorServicos * (data.prestacaoServico.imposto.iss / 100)).toFixed(2),
            //             ValorIssRetido: contrato && contrato.retencaoIss ?
            //                 Number(data.prestacaoServico.valorServicos * (data.prestacaoServico.imposto.iss / 100)).toFixed(2) : 0,
            //             OutrasRetencoes: 0,
            //             BaseCalculo: data.prestacaoServico.valorServicos,
            //             Aliquota: data.prestacaoServico.imposto.iss,
            //             ValorLiquidoNfse: data.prestacaoServico.valorServicos -
            //                 (contrato && contrato.retencaoIss ?
            //                     Number(data.prestacaoServico.valorServicos * (data.prestacaoServico.imposto.iss / 100)).toFixed(2) : 0)
            //         },
            //         ItemListaServico: data.prestacaoServico.imposto.enquadramentoServico,
            //         CodigoCnae: data.prestacaoServico.imposto.cnae,
            //         CodigoTributacaoMunicipio: data.prestacaoServico.imposto.enquadramentoServico,
            //         Discriminacao: data.prestacaoServico.observacao,
            //         CodigoMunicipio: '3541406',
            //         ItensServico: data.prestacaoServico.servicos
            //     },
            //     Tomador: {
            //         IdentificacaoTomador: {
            //             CpfCnpj: { Cnpj: data.prestacaoServico.pessoa.cpfCnpj.replace(/[^\d]+/g, '') },
            //             InscricaoEstadual: data.prestacaoServico.pessoa.registro.replace(/[^\d]+/g, ''),
            //         },
            //         RazaoSocial: data.prestacaoServico.pessoa.nome,
            //         Endereco: {
            //             Endereco: data.prestacaoServico.pessoa.logradouro,
            //             Numero: parseNumber(data.prestacaoServico.pessoa.numero),
            //             Bairro: data.prestacaoServico.pessoa.bairro,
            //             CodigoMunicipio: data.prestacaoServico.pessoa.codigoMunicipio,
            //             Cidade: data.prestacaoServico.pessoa.cidade,
            //             Uf: data.prestacaoServico.pessoa.estado,
            //             Cep: data.prestacaoServico.pessoa.cep.replace(/[^\d]+/g, ''),
            //             Complemento: data.prestacaoServico.pessoa.complemento || '',
            //         },
            //         Contato: {
            //             Telefone: data.prestacaoServico.pessoa.contato1.replace(/[^\d]+/g, ''),
            //             Email: data.prestacaoServico.pessoa.email1
            //         }
            //     }
            // })

            // return res.status(500).send('a')

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

                        Competencia: new Date().toISOString().substr(0, 10),
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
                                IssRetido: contrato ? (contrato.retencaoIss ? 1 : 2) : 2,
                                ValorIss: Number(data.prestacaoServico.valorServicos * (data.prestacaoServico.imposto.iss / 100)).toFixed(2),
                                ValorIssRetido: contrato && contrato.retencaoIss ?
                                    Number(data.prestacaoServico.valorServicos * (data.prestacaoServico.imposto.iss / 100)).toFixed(2) : 0,
                                OutrasRetencoes: 0,
                                BaseCalculo: data.prestacaoServico.valorServicos,
                                Aliquota: data.prestacaoServico.imposto.iss,
                                ValorLiquidoNfse: data.prestacaoServico.valorServicos -
                                    (contrato && contrato.retencaoIss ?
                                        Number(data.prestacaoServico.valorServicos * (data.prestacaoServico.imposto.iss / 100)).toFixed(2) : 0)
                            },
                            ItemListaServico: data.prestacaoServico.imposto.enquadramentoServico,
                            CodigoCnae: data.prestacaoServico.imposto.cnae,
                            CodigoTributacaoMunicipio: data.prestacaoServico.imposto.enquadramentoServico,
                            Discriminacao: data.prestacaoServico.observacao,
                            CodigoMunicipio: '3541406',
                            ItensServico: data.prestacaoServico.servicos
                        },
                        Tomador: {
                            IdentificacaoTomador: {
                                CpfCnpj: { Cnpj: data.prestacaoServico.pessoa.cpfCnpj.replace(/[^\d]+/g, '') },
                                InscricaoEstadual: data.prestacaoServico.pessoa.registro ? data.prestacaoServico.pessoa.registro.replace(/[^\d]+/g, '') : '',
                            },
                            RazaoSocial: data.prestacaoServico.pessoa.nome,
                            Endereco: {
                                Endereco: data.prestacaoServico.pessoa.logradouro,
                                Numero: parseNumber(data.prestacaoServico.pessoa.numero),
                                Bairro: data.prestacaoServico.pessoa.bairro,
                                CodigoMunicipio: data.prestacaoServico.pessoa.codigoMunicipio,
                                Cidade: data.prestacaoServico.pessoa.cidade,
                                Uf: data.prestacaoServico.pessoa.estado,
                                Cep: data.prestacaoServico.pessoa.cep.replace(/[^\d]+/g, ''),
                                Complemento: data.prestacaoServico.pessoa.complemento || '',
                            },
                            Contato: {
                                Telefone: data.prestacaoServico.pessoa.contato1.replace(/[^\d]+/g, ''),
                                Email: data.prestacaoServico.pessoa.email1
                            }
                        }
                    }
                },
                pParam: { P1: data.cnpj, P2: data.senha }
            }, (err, result, responseXML, param, requestXML) => {
                console.log(requestXML)
                if (err) {
                    console.log(err.response.statusCode)
                    if (err.response.statusCode == 500)
                        return res.status(500).send('Erro no servidor da prefeitura ao gerar a NFSe, tente novamente mais tarde')

                    return res.status(500).send('Erro ao gerar a NFSe, verifique os dados da prestação de serviço e impostos')
                }

                if (result.GerarNfseResult.ListaMensagemRetorno && result.GerarNfseResult.ListaMensagemRetorno.MensagemRetorno) {
                    // console.log(result.GerarNfseResult.ListaMensagemRetorno.MensagemRetorno)
                    if (Array.isArray(result.GerarNfseResult.ListaMensagemRetorno.MensagemRetorno))
                        return res.status(400).send(result.GerarNfseResult.ListaMensagemRetorno.MensagemRetorno)
                    
                    if (result.GerarNfseResult.ListaMensagemRetorno.MensagemRetorno.Codigo = "E900")
                        return res.status(500).send(result.GerarNfseResult.ListaMensagemRetorno.MensagemRetorno)
                    return res.status(400).send(result.GerarNfseResult.ListaMensagemRetorno.MensagemRetorno)
                }

                console.log(result.GerarNfseResult.NovaNfse.IdentificacaoNfse)

                return res.json(result.GerarNfseResult.NovaNfse.IdentificacaoNfse)
            })


        })
    }

    const consultarNfse = async (req, res) => {
        const data = { ...req.body }

        try {
            existsOrError(data.cnpj, 'Informe o CNPJ da empresa')
            existsOrError(data.inscricaoMunicipal, 'Informe a inscrição municipal da empresa')
            existsOrError(data.senha, 'Informe a senha do portal simpliss')
            existsOrError(data.notaFiscal, 'Informe o número da nota fiscal')

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

                return res.json(result.ConsultarNfseResult.ListaNfse.CompNfse.Nfse)
            })
        })
    }

    const cancelarNfse = async (req, res) => {
        const data = { ...req.body }

        try {
            existsOrError(data.cnpj, 'Informe o CNPJ da empresa')
            existsOrError(data.inscricaoMunicipal, 'Informe a inscrição municipal da empresa')
            existsOrError(data.senha, 'Informe a senha do portal simpliss')
            existsOrError(data.notaFiscal, 'Informe o número da nota fiscal')

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

            server.CancelarNfse({
                CancelarNfseEnvio: {
                    Prestador: {
                        Cnpj: data.cnpj,
                        InscricaoMunicipal: data.inscricaoMunicipal
                    },
                    Pedido: {
                        InfPedidoCancelamento: {
                            IdentificacaoNfse: {
                                Numero: data.notaFiscal,
                                Cnpj: data.cnpj,
                                InscricaoMunicipal: data.inscricaoMunicipal,
                                CodigoMunicipio: '3541406'
                            }
                        }
                    }
                },
                pParam: { P1: data.cnpj, P2: data.senha }
            }, (err, result, xmlResponseString) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('Erro ao cancelar Nota fiscal')
                }

                console.log(result.CancelarNfseResult.ListaMensagemRetorno)

                if (result.CancelarNfseResult.ListaMensagemRetorno && result.CancelarNfseResult.ListaMensagemRetorno.MensagemRetorno) {
                    if (Array.isArray(result.CancelarNfseResult.ListaMensagemRetorno.MensagemRetorno))
                        return res.status(400).send(result.CancelarNfseResult.ListaMensagemRetorno.MensagemRetorno[0].Mensagem)
                    return res.status(400).send(result.CancelarNfseResult.ListaMensagemRetorno.MensagemRetorno.Mensagem)
                }

                return res.json(result.CancelarNfseResult.ListaNfse.CompNfse)
            })
        })
    }

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
                    return res.status(500).send('Erro ao consultar Nota fiscal, tente novamente mais tarde')
                }

                if (result.ConsultarNfseResult.ListaMensagemRetorno && result.ConsultarNfseResult.ListaMensagemRetorno.MensagemRetorno) {
                    if (Array.isArray(result.ConsultarNfseResult.ListaMensagemRetorno.MensagemRetorno))
                        return res.status(400).send(result.ConsultarNfseResult.ListaMensagemRetorno.MensagemRetorno[0].Mensagem)
                    return res.status(400).send(result.ConsultarNfseResult.ListaMensagemRetorno.MensagemRetorno.Mensagem)
                }

                const numeroNotaFiscal = result.ConsultarNfseResult.ListaNfse.CompNfse.Nfse.InfNfse.Numero

                pdfGenerator.create(reports.danfseHtml(result.ConsultarNfseResult.ListaNfse.CompNfse.Nfse.InfNfse), options).toFile(`./pdfs/${numeroNotaFiscal}.pdf`, function (err, file) {
                    if (err) return res.status(500).send('Erro ao gerar PDF, tente novamente mais tarde')

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
        gerarPdf
    }
}