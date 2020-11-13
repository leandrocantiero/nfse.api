module.exports = app => {
    app.route('/statusService')
        .get(app.src.nfs.statusService)
    app.route('/versaoNFS')
        .get(app.src.nfs.versaoNFS)

    app.route('/nfse')
        // .all(app.config.passport.authenticate())
        .post(app.src.nfs.emitirNFS)
        .get(app.src.nfs.consultaLoteNFS)
    app.route('/nfse/:notaFiscal')
        // .all(app.config.passport.authenticate())
        .get(app.src.nfs.consultaNFS)
        .delete(app.src.nfs.cancelaNFS)
}