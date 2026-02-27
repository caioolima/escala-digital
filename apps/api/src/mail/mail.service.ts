import { Injectable, Logger } from '@nestjs/common';

type MailPayload = {
    to: string;
    subject: string;
    text: string;
    html?: string;
};

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private smtpTransporter?: any;

    async sendTwoFactorCodeEmail(email: string, name: string, code: string) {
        const safeName = name || 'Usuário';
        const loginUrl = this.getAppUrl('/login');
        await this.send({
            to: email,
            subject: 'Seu código de verificação',
            text: `Olá, ${safeName}. Seu código de verificação é: ${code}.`,
            html: this.renderEmailTemplate({
                title: 'Verificação em duas etapas',
                subtitle: `Olá, ${this.escapeHtml(safeName)}. Use o código abaixo para concluir seu acesso.`,
                highlightLabel: 'Código de verificação',
                highlightValue: this.escapeHtml(code),
                note: 'Este código expira em 10 minutos.',
                actionLabel: 'Abrir plataforma',
                actionUrl: loginUrl,
                footer: 'Se você não solicitou este acesso, ignore este e-mail.',
            }),
        });
    }

    async sendNewCourseEmail(email: string, name: string, courseTitle: string) {
        const safeName = name || 'Aluno';
        const catalogUrl = this.getAppUrl('/catalog');
        await this.send({
            to: email,
            subject: `Novo curso disponível: ${courseTitle}`,
            text: `Olá, ${safeName}. Um novo curso foi publicado: ${courseTitle}.`,
            html: this.renderEmailTemplate({
                title: 'Novo curso disponível',
                subtitle: `Olá, ${this.escapeHtml(safeName)}. Um novo curso foi publicado para você.`,
                highlightLabel: 'Curso',
                highlightValue: this.escapeHtml(courseTitle),
                note: 'Acesse agora e continue sua trilha de aprendizado.',
                actionLabel: 'Ver cursos',
                actionUrl: catalogUrl,
                footer: 'Você pode gerenciar suas preferências de notificação no seu perfil.',
            }),
        });
    }

    async send(payload: MailPayload) {
        const sentBySmtp = await this.sendViaSmtp(payload);
        if (sentBySmtp) return;

        const webhookUrl = process.env.EMAIL_WEBHOOK_URL;
        const webhookToken = process.env.EMAIL_WEBHOOK_TOKEN;

        if (webhookUrl) {
            try {
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        ...(webhookToken ? { authorization: `Bearer ${webhookToken}` } : {}),
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const bodyText = await response.text().catch(() => '');
                    this.logger.error(`Email webhook failed (${response.status}): ${bodyText}`);
                }
                return;
            } catch (error) {
                this.logger.error('Email webhook request failed', error as any);
                return;
            }
        }

        // Fallback for local/dev environments without a provider.
        this.logger.log(`[MAIL:FALLBACK] to=${payload.to} subject="${payload.subject}" text="${payload.text}"`);
    }

    private async sendViaSmtp(payload: MailPayload): Promise<boolean> {
        const user = process.env.SMTP_USER;
        const rawPass = process.env.SMTP_PASS;
        const pass = rawPass ? rawPass.replace(/\s+/g, '') : '';
        if (!user || !pass) return false;

        const host = process.env.SMTP_HOST || 'smtp.gmail.com';
        const port = Number(process.env.SMTP_PORT || '465');
        const secure = (process.env.SMTP_SECURE || 'true').toLowerCase() !== 'false';
        const from = process.env.SMTP_FROM || user;

        try {
            if (!this.smtpTransporter) {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const nodemailer = require('nodemailer');
                this.smtpTransporter = nodemailer.createTransport({
                    host,
                    port,
                    secure,
                    auth: { user, pass },
                });
            }

            await this.smtpTransporter.sendMail({
                from,
                to: payload.to,
                subject: payload.subject,
                text: payload.text,
                html: payload.html,
            });
            this.logger.log(`[MAIL:SMTP] delivered to=${payload.to} subject="${payload.subject}"`);
            return true;
        } catch (error) {
            this.logger.error(`[MAIL:SMTP] failed to=${payload.to} subject="${payload.subject}"`, error as any);
            return false;
        }
    }

    private escapeHtml(value: string) {
        return value
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    private getAppUrl(path: string) {
        const base = process.env.WEB_APP_URL || 'http://localhost:3000';
        return `${base.replace(/\/+$/, '')}${path}`;
    }

    private renderEmailTemplate(input: {
        title: string;
        subtitle: string;
        highlightLabel: string;
        highlightValue: string;
        note: string;
        actionLabel: string;
        actionUrl: string;
        footer: string;
    }) {
        return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${this.escapeHtml(input.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6fb;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #dbe4f0;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;background:#ffffff;color:#0f172a;border-bottom:1px solid #e2e8f0;">
                <div style="font-size:28px;line-height:1.1;letter-spacing:-0.5px;">
                  <span style="color:#111827;font-weight:600;">Escala</span><span style="color:#3b82f6;font-weight:900;">Digital</span>
                </div>
                <div style="font-size:22px;font-weight:800;line-height:1.2;margin-top:12px;">${this.escapeHtml(input.title)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 18px 0;font-size:15px;line-height:1.6;color:#334155;">${input.subtitle}</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fbff;border:1px solid #dbeafe;border-radius:12px;">
                  <tr>
                    <td style="padding:16px 18px;">
                      <div style="font-size:12px;color:#64748b;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;">${this.escapeHtml(input.highlightLabel)}</div>
                      <div style="font-size:28px;font-weight:800;color:#0f172a;letter-spacing:1px;margin-top:4px;">${input.highlightValue}</div>
                    </td>
                  </tr>
                </table>
                <p style="margin:16px 0 0 0;font-size:14px;line-height:1.6;color:#475569;">${this.escapeHtml(input.note)}</p>
                <div style="margin-top:22px;">
                  <a href="${this.escapeHtml(input.actionUrl)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:10px;font-size:14px;font-weight:700;">${this.escapeHtml(input.actionLabel)}</a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">${this.escapeHtml(input.footer)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
    }
}
