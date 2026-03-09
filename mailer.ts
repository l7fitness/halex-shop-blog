import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.EMAIL_FROM || 'noreply@mail.l7fitness.com.br';

export async function enviarEmail(to: string, subject: string, html: string) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Erro ao enviar e-mail via Resend:', error);
      throw new Error(error.message);
    }

    console.log('E-mail enviado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Falha ao enviar e-mail:', error);
    throw error;
  }
}
