const fs = require('fs');
const sgMail = require('@sendgrid/mail');

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

            const attachment = fs.readFileSync(`pdfs/${email.notaFiscal}.pdf`).toString("base64");

            sgMail.setApiKey(process.env.API_KEY);
            sgMail.send({
                to: email.destinatario,
                from: process.env.EMAIL_CAMPAG,
                templateId: 'd-246b1419ed2c4a19bbf9022ac5e075a9',
                attachments: [
                    {
                      content: attachment,
                      filename: `${email.notaFiscal}.pdf`,
                      type: "application/pdf",
                      disposition: "attachment"
                    }
                  ]
            })
                .then(_ => res.status(204).send())
                .catch(e => {
                    console.log(e)
                    res.status(500).send("Erro ao enviar o email, tente novamente mais tarde")
                })
        });
    }

    return { enviarNfseEmail }
}