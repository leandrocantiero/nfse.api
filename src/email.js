const nodemailer = require('nodemailer'),
    hbs = require('nodemailer-express-handlebars'),
    path = require('path'),
    fs = require('fs');

module.exports = app => {
    const { existsOrError, notExistsOrError } = app.config.validation

    const enviarNfseEmail = async (req, res) => {
        const email = { ...req.body }

        try {
            existsOrError(email.notaFiscal, 'Informe a nota fiscal que deseja enviar')
            existsOrError(email.destinatario, 'Informe o destinatário da mensagem')
        } catch (error) {
            return res.status(400).send(error)
        }

        fs.access(`pdfs/${email.notaFiscal}.pdf`, function (err) {
            if (err) return res.status(400).send('O arquivo não existe')

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
                // context: {
                //     // qrcode: require('./uploads/imgs/qrcodepix.png'),
                //     key: dados.pix.key,
                //     value: dados.pix.value
                // },
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

            // sgMail.setApiKey(process.env.API_KEY);
            // sgMail.send({
            //     to: email.destinatario,
            //     from: process.env.EMAIL_CAMPAG,
            //     templateId: 'd-246b1419ed2c4a19bbf9022ac5e075a9',
            //     attachments: [
            //         {
            //             content: attachment,
            //             filename: `${email.notaFiscal}.pdf`,
            //             type: "application/pdf",
            //             disposition: "attachment"
            //         }
            //     ]
            // })
            //     .then(_ => res.status(204).send())
            //     .catch(e => {
            //         console.log(e)
            //         res.status(500).send("Erro ao enviar o email, tente novamente mais tarde")
            //     })
        });
    }

    return { enviarNfseEmail }
}