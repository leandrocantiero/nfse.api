module.exports = app => {
    app.get('/', (req, res) => {
        res.status(200).send(`Versão ${process.env.VERSION}`)
    })
    
    // // Funções RPS
    // app.route('/recepcionarLoteRps')
    // // .all(app.config.passport.authenticate())
    // app.route('/consultarSituacaoLoteRps')
    //     // .all(app.config.passport.authenticate())
    //     .post(app.src.nfs.consultarSituacaoLoteRps)
    // app.route('/ConsultarNfsePorRps')
    //     // .all(app.config.passport.authenticate())
    //     .post(app.src.nfs.consultarNfsePorRps)
    // app.route('/consultarLoteRps')
    //     // .all(app.config.passport.authenticate())
    //     .post(app.src.nfs.consultarLoteRps)


    // Funções Nfse
    app.route('/statusServico')
        .get(app.src.nfs.statusService)
    app.route('/versao')
        .get(app.src.nfs.versaoNfse)
    app.route('/gerarNfse')
        // .all(app.config.passport.authenticate())
        .post(app.src.nfs.gerarNfse)
    app.route('/consultarNfse')
        // .all(app.config.passport.authenticate())
        .post(app.src.nfs.consultarNfse)
    // app.route('/cancelarNfse')
    //     .all(app.config.passport.authenticate())
    //     .post(app.src.nfs.cancelarNfse)

    app.route('/gerarPdf')
        // .all(app.config.passport.authenticate())
        .post(app.src.nfs.gerarPdf)
    app.route('/enviarNfseEmail')
        // .all(app.config.passport.authenticate())
        .post(app.src.email.enviarNfseEmail)

    app.get('*', function (req, res) {
        res.status(404).send('Erro 404');
    });
}