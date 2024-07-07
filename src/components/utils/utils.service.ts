import { BadRequestException, Injectable } from '@nestjs/common';
import { SendEmailDTO } from './dto/email.dto';

const formData = require('form-data');

@Injectable()
export class UtilsService {
    private mailgun;
    private mailgunClient;

    constructor() {

        this.mailgun = require('mailgun-js')
            ({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN, host: "api.eu.mailgun.net" });
        // this.mailgun = new Mailgun(formData);
        // this.mailgunClient = this.mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY, url: process.env.MAILGUN_BASE_URL })
    }

    async sendEmail(emailDto: SendEmailDTO) {
        try {
            console.log(emailDto);
            // const msg = await this.mailgunClient.messages.create(process.env.MAILGUN_DOMAIN, emailDto)
            // return msg;
            const emailResponse = this.mailgun.messages().send(emailDto, function (error, body) {
                if (error) console.log(error)
                else console.log(body);
            });

            return emailResponse
        }
        catch (err) {
            console.log(err);
            throw new BadRequestException(err?.message);
        }
    }
}
