module.exports = app => {
    app.route('/statusService')
        .get(app.src.nfs.statusService)

    app.route('/nfs')
        .all(app.config.passport.authenticate())
        .post(app.src.nfs.emitirNFS)
        .get(app.src.nfs.consultaLoteNFS)
    app.route('/nfs/:id')
        .all(app.config.passport.authenticate())
        .get(app.src.nfs.consultaNFS)
        .delete(app.src.nfs.cancelaNFS)
}