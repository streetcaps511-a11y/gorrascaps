/* === SERVICIO API === 
   Este archivo se encarga exclusivamente de la comunicación HTTP (GET, POST, PUT, DELETE) con el Backend. 
   Toma los datos del Hook y realiza peticiones usando fetch o axios, y maneja posibles errores de red. */

// src/services/mail.service.js
import * as Brevo from '@getbrevo/brevo';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

// 🚀 CONFIGURACIÓN DE BREVO
const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'duvann1991@gmail.com';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Gorras Medellin';

/**
 * Enviar el correo de recuperación de contraseña
 * @param {string} email - Destinatario
 * @param {string} nombre - Nombre del usuario para el saludo
 * @param {string} resetLink - El enlace único para cambiar la clave
 */
export const sendForgotPasswordEmail = async (email, nombre, resetLink) => {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = "Recuperar tu contraseña - Gorras Medellin 👒";
  sendSmtpEmail.sender = { "name": SENDER_NAME, "email": SENDER_EMAIL };
  sendSmtpEmail.to = [{ "email": email, "name": nombre }];
  
  // 🎨 DISEÑO DEL CORREO (HTML Premium)
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #333; text-align: center;">¡Hola, ${nombre}! 👋</h2>
      <p style="color: #666; font-size: 16px; text-align: center;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Gorras Medellin</strong>.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 18px;">
          RESTABLECER CONTRASEÑA
        </a>
      </div>
      <p style="color: #999; font-size: 14px; text-align: center;">
        Este enlace expirará en 15 minutos por tu seguridad. Si no solicitaste este cambio, simplemente ignora este correo.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
      <p style="color: #ccc; font-size: 12px; text-align: center;">
        &copy; 2024 Gorras Medellin. Todos los derechos reservados.
      </p>
    </div>
  `;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Correo enviado con éxito via Brevo:', data.body);
    return true;
  } catch (error) {
    console.error('❌ Error enviando correo vía Brevo:', error);
    throw new Error('No se pudo enviar el correo de recuperación');
  }
};

/**
 * Enviar correo de PIN de verificación para registro
 * @param {string} email - Destinatario
 * @param {string} pin - Código de verificación de 6 dígitos
 */
export const sendPinEmail = async (email, pin) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="background-color: #000000; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px;">GORRAS MEDELLÍN</h1>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="color: #333333; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Verifica tu cuenta! 🧢</h2>
        <p style="color: #555555; font-size: 16px; text-align: center; line-height: 1.6; margin-bottom: 30px;">
          Gracias por querer unirte a la mejor tienda de gorras. Para completar tu registro y asegurar tu cuenta, por favor ingresa el siguiente código de verificación:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #f4f4f4; color: #000000; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 32px; letter-spacing: 5px; border: 2px dashed #cccccc;">
            ${pin}
          </span>
        </div>
        <p style="color: #888888; font-size: 14px; text-align: center; margin-top: 30px;">
          Este código es válido por 15 minutos. Si no solicitaste este registro, puedes ignorar este mensaje.
        </p>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
        <p style="color: #aaaaaa; font-size: 12px; margin: 0;">
          &copy; ${new Date().getFullYear()} Gorras Medellin. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: '"Gorras Medellin" <' + process.env.SMTP_USER + '>',
    to: email,
    subject: 'Tu código de verificación - Gorras Medellin 🧢',
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Correo de PIN enviado con éxito a:', email);
    return true;
  } catch (error) {
    console.error('❌ Error enviando correo de PIN vía Nodemailer:', error);
    throw new Error('No se pudo enviar el correo de verificación');
  }
};
