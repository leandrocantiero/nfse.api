const nodemailer = require('nodemailer'),
    hbs = require('nodemailer-express-handlebars'),
    path = require('path');

module.exports = app => {
    const { existsOrError } = app.config.validation

    const enviarNfseEmail = async (req, res) => {
        const email = { ...req.body }

        try {
            existsOrError(email.notaFiscal, 'Informe a nota fiscal que deseja enviar')
            existsOrError(email.destinatario, 'Informe o destinatário da mensagem')
        } catch (error) {
            return res.status(400).send(error)
        }

        const smtpTransport = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_CAMPAG,
                pass: process.env.EMAIL_PASS
            }
        });

        smtpTransport.use('compile', hbs({
            viewEngine: {
                extName: ".handlebars",
                partialsDir: path.resolve(__dirname, "views"),
                defaultLayout: false,
            },
            viewPath: path.resolve(__dirname, "../views"),
            extName: ".handlebars",
        }))

        const data = {
            to: email.destinatario,
            from: process.env.EMAIL_CAMPAG,
            subject: 'Nota Fiscal de Serviço - QuickBlue',
            template: 'nfse',
            attachments: [{
                filename: `${email.notaFiscal}.pdf`,
                path: `./pdfs/${email.notaFiscal}.pdf`,
            }],
        }

        smtpTransport.sendMail(data)
            .then(result => {
                res.status(204).send()
            })
            .catch(error => {
                console.log(error)
                return res.status(500).send('Erro ao enviar email(s), tente novamente mais tarde!')
            })
    }

    return { enviarNfseEmail }
}