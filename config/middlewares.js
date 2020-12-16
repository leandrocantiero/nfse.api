const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const compression = require('compression')

module.exports = app => {
    app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }))
    app.use(bodyParser.json({ limit: '50mb' }))
    app.use(cors())
    app.use('/pdfs', express.static('pdfs'))

    app.use(compression())
}