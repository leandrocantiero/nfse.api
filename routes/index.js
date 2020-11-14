module.exports = app => {
    // Funções RPS

    app.route('/recepcionarLoteRps')
    // .all(app.config.passport.authenticate())
    app.route('/consultarSituacaoLoteRps')
    // .all(app.config.passport.authenticate())
    app.route('/ConsultarNfsePorRps')
    // .all(app.config.passport.authenticate())
    app.route('/consultarLoteRps')
        // .all(app.config.passport.authenticate())
        .get(app.src.nfs.consultarLoteRps)


    // Funções Nfse

    app.route('/statusService')
        .get(app.src.nfs.statusService)
    app.route('/versaoNfse')
        .get(app.src.nfs.versaoNfse)
    app.route('/gerarNfse')
        // .all(app.config.passport.authenticate())
        .post(app.src.nfs.gerarNfse)
    app.route('/consultarNfse/:notaFiscal')
        // .all(app.config.passport.authenticate())
        .get(app.src.nfs.consultarNfse)
    app.route('/cancelarNfse/:notaFiscal')
        // .all(app.config.passport.authenticate())
        .delete(app.src.nfs.cancelarNfse)
}