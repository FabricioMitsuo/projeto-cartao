import { v4 as uuidv4 } from 'uuid';
import { putItem, updateItem, getItem, TABLES } from '../db/dynamo.js';

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function startMfa({ userId }) {
  const otp = generateOtp();
  const sessionOtpId = uuidv4();

  // Armazena como parte da sessão (vamos criar a sessão logo antes)
  // Para simplificar, retornamos otp e gravamos no DynamoDB.
  // Em produção, você não retornaria o OTP para o backend chamar serviços externos.
  await updateItem(
    TABLES.Sessions,
    { sessionId: sessionOtpId },
    'SET #otp = :otp, #otpExpiresAt = :exp',
    { ':otp': otp, ':exp': Date.now() + 5 * 60 * 1000 },
    { '#otp': 'mfaOtp', '#otpExpiresAt': 'mfaOtpExpiresAt' }
  ).catch(async () => {
    // Se sessão não existir ainda, criamos aqui.
    await putItem(TABLES.Sessions, {
      sessionId: sessionOtpId,
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * 60 * 1000,
      mfaVerified: false,
      mfaOtp: otp,
      mfaOtpExpiresAt: Date.now() + 5 * 60 * 1000
    });
  });

  return { sessionOtpId, otp };
}

export async function verifyMfa({ sessionId, otp }) {
  const sess = await getItem(TABLES.Sessions, { sessionId });
  if (!sess) return { ok: false, reason: 'SESSION_NOT_FOUND' };
  if (sess.mfaOtpExpiresAt < Date.now()) return { ok: false, reason: 'OTP_EXPIRED' };
  if (String(sess.mfaOtp) !== String(otp)) return { ok: false, reason: 'OTP_INVALID' };

  await updateItem(
    TABLES.Sessions,
    { sessionId },
    'SET #verified = :v, #otp = :null',
    { ':v': true, ':null': null }
  );

  return { ok: true };
}

