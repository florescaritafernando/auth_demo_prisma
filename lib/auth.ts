import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarEmail(to: string, subject: string, html: string) {
    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to,
            subject,
            html,
        })
        console.log(`Email sent to ${to}`)
        return true
    } catch (e) {
        console.error("Error sending email:", e)
        return false
    }
}

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "cliente"
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            await resend.emails.send({
                from: "onboarding@resend.dev",
                to: user.email,
                subject: "Verifica tu correo electrónico",
                html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 16px; text-align: center; background-color: #1e293b; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Manchester Collection</h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <p style="margin: 0 0 16px; color: #334155; font-size: 16px; line-height: 1.5;">Hola <strong>${user.name || 'Cliente'}</strong>,</p>
                            <p style="margin: 0 0 24px; color: #334155; font-size: 16px; line-height: 1.5;">Gracias por registrarte en Manchester Collection. Por favor verifica tu correo electrónico haciendo clic en el botón de abajo:</p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="${url}" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500; border-radius: 6px;">Verificar mi correo</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 24px 0 0; color: #64748b; font-size: 14px; line-height: 1.5;">Si no solicitaste este registro, puedes ignorar este correo.</p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; background-color: #f1f5f9; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">© 2024 Manchester Collection. Todos los derechos reservados.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
            });
        },
    },
    emailSignIn: {
        enabled: true,
    },
    passwordReset: {
        sendResetEmail: async ({ user, url }) => {
            await resend.emails.send({
                from: "onboarding@resend.dev",
                to: user.email,
                subject: "Restablece tu contraseña",
                html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 16px; text-align: center; background-color: #1e293b; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Manchester Collection</h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">
                            <p style="margin: 0 0 16px; color: #334155; font-size: 16px; line-height: 1.5;">Hola <strong>${user.name || 'Cliente'}</strong>,</p>
                            <p style="margin: 0 0 24px; color: #334155; font-size: 16px; line-height: 1.5;">Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña:</p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="${url}" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 500; border-radius: 6px;">Restablecer contraseña</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 24px 0 0; color: #64748b; font-size: 14px; line-height: 1.5;">Si no solicitaste este cambio, puedes ignorar este correo y tu contraseña permanecerá segura.</p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; background-color: #f1f5f9; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px; text-align: center;">© 2024 Manchester Collection. Todos los derechos reservados.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
            });
        },
    },
});