const { formatToBRL, formatToCNPJ, formatToDateTime, formatToCEP, formatToPhone } = require('brazilian-values')

getServicos = function (servicos) {
    if (!Array.isArray(servicos.ItensServico)) {
        return `
        Descrição: <span class="campo_valor" id="serv_desc">${servicos.ItensServico.Descricao}</span>
        <br />
        Quantidade: <span class="campo_valor" id="serv_quant">${servicos.ItensServico.Quantidade}</span>
        <br />
        Valor Unitário: <span class="campo_valor" id="serv_valor_unit">${formatToBRL(servicos.ItensServico.ValorUnitario)}</span>
        `
    } else if (Array.isArray(servicos.ItensServico)) {
        var html = ""

        servicos.ItensServico.forEach(item => {
            html += `
            Descrição: <span class="campo_valor" id="serv_desc">${item.Descricao}</span>
            <br />
            Quantidade: <span class="campo_valor" id="serv_quant">${item.Quantidade}</span> - Valor Unitário: <span class="campo_valor" id="serv_valor_unit">${formatToBRL(item.ValorUnitario)}</span>
            <br />
            <br />
            `
        })

        return html
    }

    return "Nenhum Serviço Econtrado"
}

module.exports = {
    danfseHtml: (params) =>
        `<html class="no-js" lang="pt-BR">
        <head>
            <title>Pdf da NFS-e</title>
            <meta name="description" content="">
            <meta name="author" content="Leandro Cantiero">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <meta http-equiv="X-UA-Compatible" content="IE=edge, chrome=1">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta http-equiv="no-cache">
        
            <style type="text/css" media="print">
                html,
                body,
                * {
                    margin: 0px!important;
                    font-size: 10px!important;
                    line-height: 15px!important;
                }
            </style>
        
            <style type="text/css">
        
                .nfeArea .imgCanceled {
                    position: absolute;
                    top: 60mm;
                    left: 65mm;
                    z-index: 3;
                    opacity: 0.8;
                    display: none;
                }
        
                .nfeArea.invoiceCanceled .imgCanceled {
                    display: block;
                }
        
                .nfeArea .imgNull {
                    position: absolute;
                    top: 45mm;
                    left: 65mm;
                    z-index: 3;
                    opacity: 0.8;
                    display: none;
                }
        
                .nfeArea.invoiceNull .imgNull {
                    display: block;
                }
        
                .nfeArea.invoiceCancelNull .imgCanceled {
                    top: 69mm;
                    left: 85mm;
                    display: block;
                }
        
                .nfeArea.invoiceCancelNull .imgNull {
                    top: 40mm;
                    left: 60mm;
                    display: block;
                }
        
                .tabela {
                    border: 2px solid #000;
                    border-spacing: 0px;
                    margin: 0px 0px 0px 0px;
                }
        
                    .tabela tr td {
                        border: 1px solid #000;
                    }
        
                    .tabela table tr td {
                        border-style: none;
                        border-width: 0px;
                    }
        
                .cabecalho {
                    line-height: normal;
                    font-style: normal;
                    font-weight: normal;
                    font-variant: normal;
                    font-size: 8px;
                    font-family: "Courier New";
                    margin: 0px 0px 0px 2px;
                    line-height: 9px;
                    /*letter-spacing: 1px;*/
                }
        
                .tabela dl {
                    border: 0px none #000;
                    border-spacing: 0px;
                    margin: 0px 0px 0px 0px;
                }
        
                .tabela dt {
                    margin: 0px 5px;
                    text-transform: uppercase;
                    font: 9px 'Courier New';
                    color: #000;
                    white-space: nowrap;
                }
        
                .tabela dd {
                    margin: 0px 5px 1px;
                    color: #369;
                    line-height: normal;
                    font-style: normal;
                    font-variant: normal;
                    font-size: 10px;
                    font-family: "Courier New";
                    height: 14px;
                    white-space: nowrap;
                }
        
                .sub-titulo {
                    line-height: normal;
                    font-style: normal;
                    font-weight: bold;
                    font-variant: normal;
                    font-size: 12px;
                    font-family: "Courier New";
                    margin: 0px 0px 0px 0px;
                    white-space: pre-line;
                }
        
                .corpo {
                    color: #369;
                    line-height: normal;
                    font-style: normal;
                    font-weight: bold;
                    font-variant: normal;
                    font-size: 9px;
                    font-family: "Courier New";
                    margin: 0px 0px 0px 0px;
                    white-space: nowrap;
                    letter-spacing: -1px;
                }
        
                .campo_titulo {
                    line-height: normal;
                    font-style: normal;
                    font-weight: bold;
                    font-variant: normal;
                    font-size: 9px;
                    font-family: "Courier New";
                    margin: 0px 0px 0px 0px;
                    white-space: nowrap;
                    word-spacing: -1px;
                }
        
                .campo_valor {
                    color: #369;
                    line-height: normal;
                    font-style: normal;
                    font-weight: bold;
                    font-variant: normal;
                    font-size: 10px;
                    font-family: "Courier New";
                    margin: 0px 0px 0px 0px;
                    white-space: pre-line;
                    display: inline-block;
                    max-width: 780px;
                }
        
                #popup {
                    position: absolute;
                    top: 4px;
                    right: 3px;
                    text-indent: -9999px;
                    margin: 0px;
                    padding: 0px;
                    width: 52px;
                }
        
                    #popup li {
                        float: right;
                        margin: 3px;
                        width: 20px;
                        height: 20px;
                        cursor: pointer;
                    }
        
                        #popup li.close {
                            background: url("img/ico/icosup_cancelar.gif") no-repeat 0px 0px !important;
                        }
        
                            #popup li.close:hover {
                                background: url("img/ico/icosup_cancelar_hover.gif") no-repeat 0px 0px !important;
                            }
        
                #report_content footer {
                    display: none;
                }
        
                #print {
                    width: 95%;
                    padding: 35px 0 30px 30px;
                }
        
                @media print {
                    * {
                        background: transparent !important;
                        color: black !important;
                        box-shadow: none !important;
                        text-shadow: none !important;
                        filter: none !important;
                        -ms-filter: none !important;
                        zoom: 0 !important;
                    }
                    /* Black prints faster: h5bp.com/s */
                    a, a:visited {
                        text-decoration: underline;
                    }
        
                        a[href]:after {
                            content: " (" attr(href) ")";
                        }
        
                    abbr[title]:after {
                        content: " (" attr(title) ")";
                    }
        
                    .ir a:after, a[href^="javascript:"]:after, a[href^="#"]:after {
                        content: "";
                    }
                    /* Don't show links for images, or javascript/internal links */
                    pre, blockquote {
                        border: 1px solid #999;
                        page-break-inside: avoid;
                    }
        
                    thead {
                        display: table-header-group;
                    }
                    /* h5bp.com/t */
                    tr, img {
                        page-break-inside: avoid;
                    }
        
                    img {
                        max-width: 100% !important;
                    }
        
                    p, h2, h3 {
                        orphans: 3;
                        widows: 3;
                    }
        
                    h2, h3 {
                        page-break-after: avoid;
                    }
        
                    header, footer, aside, .render-form, .table, .paging, #printActionBar {
                        display: none !important;
                    }
        
                    header {
                        display: none !important;
                    }
        
                    footer {
                        display: none !important;
                    }
        
                    #ui-datepicker-div {
                        display: none !important;
                    }
        
                    .ui-autocomplete.ui-menu ui-widget.ui-widget-content.ui-corner-all {
                        display: none !important;
                    }
        
                    #maskDel {
                        display: none !important;
                    }
        
                    #container {
                        display: none !important;
                    }
        
                    #report_content {
                        overflow: hidden !important;
                        position: relative !important;
                        width: auto !important;
                        height: auto !important;
                        top: 0 !important;
                        margin: 0 !important;
                        left: 0 !important;
                        border: 0 !important;
                        padding: 0 !important;
                    }
        
                    #print {
                        width: auto !important;
                        height: auto !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        page-break-inside: avoid;
                    }
        
                    .cabecalho {
                        letter-spacing: 0px;
                    }
        
                    span#dadosnfe_ds_additional_information {
                        display: block;
                        width: auto;
                        white-space: normal;
                    }
        
                    .jspContainer {
                        overflow: visible !important;
                    }
        
                    #div_nfe_control_last_ws_response {
                        display: none !important;
                    }
        
                    .nfeArea .imgCanceled {
                        top: 75mm;
                        left: 30mm;
                    }
        
                    .nfeArea .imgNull {
                        top: 75mm;
                        left: 20mm;
                    }
        
                    .nfeArea.invoiceCancelNull .imgCanceled {
                        top: 100mm;
                        left: 35mm;
                    }
        
                    .nfeArea.invoiceCancelNull .imgNull {
                        top: 65mm;
                        left: 15mm;
                    }
                }
            </style>
        </head>
        <body>
            <script src="js/libs/jquery-barcode-2.0.1.min.js" type="text/javascript"></script>
            <div id="print" class="nfeArea">
                <img class="imgCanceled" src="tarja_nf_cancelada.png" alt="" />
                <img class="imgNull" src="tarja_nf_semvalidade.png" alt="" />

                <table class="tabela" style="width: 100%;">
                    <tr>
                        <td style="width: 40%; height: 100px;" rowspan="3">
        
                            <table style="width: 100%; height: 108px;">
                                <tr>
                                    <td style="width: 33%; vertical-align: middle;">
                                        <img class="client_logo" width="180" height="100" style="vertical-align: middle" src="${process.env.API_URL}/uploads/imgs/molde-do-logotipo-da-silhueta-do-pássaro-letra-de-c-79791235.313527a5.jpg" alt="logo_img"/>
                                    </td>
                                    <td style="vertical-align: middle; padding: 5px;">
                                        <p class="sub-titulo">
                                            <span id="emit_cab_ds_issuer_name">${params.PrestadorServico.RazaoSocial}</span>
                                        </p>
                                        <p>
                                            <span id="emit_cab_ds_city_name">Presidente Prudente</span>&nbsp;-
                                            <span id="emit_cab_nfe_ds_uf">${params.PrestadorServico.Endereco.Uf}</span>
                                            <br />
                                            Telefone:&nbsp;<span id="emit_phone_number">${formatToPhone(params.PrestadorServico.Contato.Telefone)}</span>
                                        </p>
                                    </td>
                                    <td>&nbsp;</td>
                                </tr>
                            </table>
        
                        </td>
                        <td style="width: 80%; height: 100px; text-align: center; vertical-align: middle;" rowspan="3">
                            <span class="sub-titulo" style="font-size: large;">NFS-e</span>
                        </td>
                        <td>
                            <dl>
                                <dt>Número da Nota</dt>
                                <dd id="dadosnfe_nu_invoice">${params.Numero}</dd>
                            </dl>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <dl>
                                <dt>Data e Hora de Emissão</dt>
                                <dd id="dadosnfe_dt_invoice_issue">${formatToDateTime(new Date(params.DataEmissao))}</dd>
                            </dl>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <dl>
                                <dt>Código de Verificão</dt>
                                <dd id="dadosnfe_ds_protocol">${params.CodigoVerificacao}</dd>
                            </dl>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3" style="height: 20%">
                            <table style="width: 100%;">
                                <tr>
                                    <td style="width: 50%; text-align: center;" colspan="2">
                                        <span class="sub-titulo">PRESTADOR DE SERVIÇOS</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="campo_titulo" style="width: 50%; padding-left: 5px">
                                        CNPJ/CPF: <span id="emit_nu_cnpj_cpf" class="campo_valor">${formatToCNPJ(params.PrestadorServico.IdentificacaoPrestador.Cnpj)}</span>
                                        <br />
                                        Nome/Razão Social: <span class="campo_valor" id="emit_corp_ds_issuer_name">${params.PrestadorServico.RazaoSocial}</span>
                                        <br />
                                        Endereço: <span id="emit_ds_addres" class="campo_valor">${params.PrestadorServico.Endereco.Endereco}</span>,
                                        <span id="emit_ds_neighborhood" class="campo_valor">${params.PrestadorServico.Endereco.Bairro}</span>
                                        CEP: <span id="emit_nu_cep" class="campo_valor">${formatToCEP(params.PrestadorServico.Endereco.Cep)}</span>
                                        <br />
                                        Município: <span class="campo_valor" id="emit_corp_ds_city_name">Presidente Prudente</span>
                                    </td>
                                    <td class="campo_titulo" style="width: 50%; padding-left: 5px;">
                                        Inscrição Municipal: <span class="campo_valor" id="emit_nu_im">${params.PrestadorServico.IdentificacaoPrestador.InscricaoMunicipal}</span>
                                        <br />
                                        <br />
                                        <br />
                                        UF: <span class="campo_valor" id="emit_corp_nfe_ds_uf">${params.PrestadorServico.Endereco.Uf}</span>
                                    </td>
                                </tr>
                            </table>
        
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3" style="height: 20%">
                            <table style="width: 100%;">
                                <tr>
                                    <td style="width: 50%; text-align: center;" colspan="2">
                                        <span class="sub-titulo">TOMADOR DE SERVIÇO</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="campo_titulo" style="width: 50%; padding-left: 5px;">
                                        Nome/Razão Social: <span class="campo_valor" id="dest_receiver_name">${params.TomadorServico.RazaoSocial}</span>
                                        <br />
                                        CNPJ/CPF: <span class="campo_valor" id="dest_nu_cnpj_cpf">${formatToCNPJ(params.TomadorServico.IdentificacaoTomador.CpfCnpj.Cnpj)}</span>
                                        <br />
                                        Endereço: <span id="dest_ds_address" class="campo_valor">${params.TomadorServico.Endereco.Endereco}</span>
                                        <span id="dest_ds_neighborhood" class="campo_valor">${params.TomadorServico.Endereco.Bairro}</span>
                                        CEP: <span id="dest_nu_cep" class="campo_valor">${formatToCEP(params.TomadorServico.Endereco.Cep)}</span>
                                        <br />
        
                                        Município: <span class="campo_valor" id="dest_ds_city_name">Presidente Prudente</span>&nbsp;&nbsp;&nbsp;
                                        UF: <span class="campo_valor" id="dest_ds_uf">${params.TomadorServico.Endereco.Uf}</span>
                                    </td>
                                    <td class="campo_titulo" style="width: 50%; padding-left: 5px;">
                                        Inscrição Municipal: <span class="campo_valor" id="dest_nu_im">${params.TomadorServico.IdentificacaoTomador.InscricaoMunicipal || "Isento"}</span>
                                        <br />
                                        <br />
                                        <br />
                                        E-Mail: <span class="campo_valor" id="dest_ds_email">${params.TomadorServico.Contato.Email}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3" style="height: 190px;">
                            <table style="width: 100%; height: 100%;">
                                <tr>
                                    <td style="text-align: center; width: 100%; height: 1px;" colspan="2">
                                        <span class="sub-titulo">DISCRIMINAÇÃO DOS SERVIÇOS</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="campo_titulo" style="width: 50%; padding-left: 5px; vertical-align: top;">
                                        ${getServicos(params.Servico)}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align: center;">
                            <span class="sub-titulo">TOTAL DA NOTA = <span id="TOTSERV">${formatToBRL(params.Servico.Valores.ValorLiquidoNfse)}</span></span>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3">
                            <table style="width: 100%; height: 100%;">
                                <tr>
                                    <td style="border-right: 1px solid #000;">
                                        <dl>
                                            <dt>COFINS</dt>
                                            <dd style="text-align: right;">R$ <span id="COFINS">0,00</span></dd>
                                        </dl>
                                    </td>
                                    <td style="border-right: 1px solid #000;">
                                        <dl>
                                            <dt>CSLL</dt>
                                            <dd style="text-align: right;">R$ <span id="CSLL">0,00</span></dd>
                                        </dl>
                                    </td>
                                    <td style="border-right: 1px solid #000;">
                                        <dl>
                                            <dt>INSS</dt>
                                            <dd style="text-align: right;">R$ <span id="INSS">0,00</span></dd>
                                        </dl>
                                    </td>
                                    <td style="border-right: 1px solid #000;">
                                        <dl>
                                            <dt>IRPJ</dt>
                                            <dd style="text-align: right;">R$ <span id="IRPJ">0,00</span></dd>
                                        </dl>
                                    </td>
                                    <td>
                                        <dl>
                                            <dt>PIS</dt>
                                            <dd style="text-align: right;">R$ <span id="PIS">0,00</span></dd>
                                        </dl>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3">
                            <span class="campo_titulo">Código do Serviço: ${params.Servico.CodigoCnae}</span>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3">
                            <table style="width: 100%; height: 100%;">
                                <tr>
                                    <td style="border-right: 1px solid #000;">
                                        <dl>
                                            <dt>Valor Total das Deduções (R$)</dt>
                                            <dd style="text-align: right;">${formatToBRL(params.Servico.Valores.ValorIss)}</dd>
                                        </dl>
                                    </td>
                                    <td style="border-right: 1px solid #000;">
                                        <dl>
                                            <dt>Base de Cálculo (R$)</dt>
                                            <dd style="text-align: right;" id="ISS_Bs">${formatToBRL(params.Servico.Valores.BaseCalculo)}</dd>
                                        </dl>
                                    </td>
                                    <td style="border-right: 1px solid #000;">
                                        <dl>
                                            <dt>Alíquota (%)</dt>
                                            <dd style="text-align: right;" id="ISS_Aliq">${params.Servico.Valores.Aliquota} %</dd>
                                        </dl>
                                    </td>
                                    <td style="border-right: 1px solid #000;">
                                        <dl>
                                            <dt>Valor do ISS (R$)</dt>
                                            <dd style="text-align: right;" id="ISS">${formatToBRL(params.Servico.Valores.ValorIss)}</dd>
                                        </dl>
                                    </td>
                                    <td>
                                        <dl>
                                            <dt>Crédito p/ Abatimento do IPTU</dt>
                                            <dd style="text-align: right;">R$ 0,00</dd>
                                        </dl>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3" style="max-width: 400px;">
                            <table style="width: 100%;">
                                <tr>
                                    <td style="text-align: center; width: 100%; height: 1px;" colspan="2">
                                        <span class="sub-titulo">OUTRAS INFORMAÇÕES</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="campo_titulo"
                                        style="width: 50%; padding-left: 5px; vertical-align: top;">
                                        <span class="campo_valor" id="dadosnfe_ds_additional_information">${params.OutrasInformacoes || "Nenhuma informação adicional"}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <table cellpadding="0" cellspacing="0" style="width: 50%;">
                    <tbody>
                        <tr>
                        
                            <td style="text-align: left">
                                <a href="http://contribnovo.issprudente.sp.gov.br/app/nfse/relatorio?cnpj=${params.PrestadorServico.IdentificacaoPrestador.Cnpj}&ser=E&inum=${params.Numero}&icod=${params.CodigoVerificacao}" target="blank" />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table cellpadding="0" cellspacing="0" style="width: 100%; margin-right: 50px">
                    <tbody>
                        <tr>
                            <td style="text-align: right">${params.PrestadorServico.RazaoSocial} <a href="https://campaginformatica.com.br" target="_blank" /></td>
                        </tr>
                    </tbody>
                </table>
                
            </div>
        
        </body>
        </html>`
}