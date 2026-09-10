// 登录链路封装：验证码、密码临时公钥、RSA-OAEP-256+A256GCM 混合加密密码、会话创建。

export interface CaptchaResult {
  captcha_id: string
  captcha_base64: string
  type: string
}

export interface PublicKeyResult {
  key_id: string
  public_key: string
  algorithm: string
  nonce: string
  expires_in: number
}

export interface LoginResult {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  // 1=AUTHENTICATED 4=PASSWORD_CHANGE_REQUIRED，其余为 MFA 等未完成状态
  status: number
  mfa_challenge_id: string
}

export interface PasswordCrypto {
  key_id: string
  nonce: string
  algorithm: string
  encrypted_key: string
  iv: string
  ciphertext: string
}

// 门户仅支持文本验证码输入，固定请求 digit 类型（random 可能返回滑块等行为验证码）。
export const loginApi = {
  captcha: (type = 'digit') =>
    fetch(`/api/v1/base/captcha?type=${type}`).then(check).then((r) => r.json() as Promise<CaptchaResult>),

  publicKey: (scene = 1) =>
    fetch(`/api/v1/base/password-public-key?scene=${scene}`).then(check).then((r) => r.json() as Promise<PublicKeyResult>),

  // 预校验验证码并换取一次性令牌。
  verifyCaptcha: (captchaId: string, captchaCode: string) =>
    fetch('/api/v1/base/captcha/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ captcha_id: captchaId, captcha_code: captchaCode }),
    })
      .then(check)
      .then((r) => r.json() as Promise<{ captcha_token: string; expires_in: number }>),

  login: async (
    userName: string,
    rawPassword: string,
    captcha: { captcha_id: string; captcha_code: string },
  ) => {
    // 1.先用验证码换取一次性令牌（后端要求 captcha_code 携带令牌，而非原始答案）。
    const verified = await loginApi.verifyCaptcha(captcha.captcha_id, captcha.captcha_code)
    // 2.公钥只获取一次：加密与提交必须使用同一 key_id，避免密钥不匹配。
    const pub = await loginApi.publicKey(1)
    const password = await encryptPassword(pub, rawPassword)
    const res = await fetch('/api/v1/base/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: userName,
        password,
        captcha_id: captcha.captcha_id,
        captcha_code: verified.captcha_token,
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`登录失败: HTTP ${res.status} ${text}`)
    }
    return res.json() as Promise<LoginResult>
  },
}

async function check(res: Response): Promise<Response> {
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  }
  return res
}

// RSA-OAEP(SHA-256) 包装 AES-256 key + AES-256-GCM 加密密码（与后端 password_crypto.go 对齐）。
async function encryptPassword(pub: PublicKeyResult, rawPassword: string): Promise<PasswordCrypto> {
  const aesKey = crypto.getRandomValues(new Uint8Array(32))
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const publicKey = await importPublicKey(pub.public_key)
  const encryptedKey = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, aesKey)

  const encoder = new TextEncoder()
  const aesCryptoKey = await crypto.subtle.importKey('raw', aesKey, { name: 'AES-GCM' }, false, ['encrypt'])
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesCryptoKey, encoder.encode(rawPassword))

  return {
    key_id: pub.key_id,
    nonce: pub.nonce,
    algorithm: pub.algorithm,
    encrypted_key: base64(new Uint8Array(encryptedKey)),
    iv: base64(iv),
    ciphertext: base64(new Uint8Array(ciphertext)),
  }
}

async function importPublicKey(pem: string): Promise<CryptoKey> {
  const pemHeader = '-----BEGIN PUBLIC KEY-----'
  const pemFooter = '-----END PUBLIC KEY-----'
  const body = pem.replace(pemHeader, '').replace(pemFooter, '').replace(/\s+/g, '')
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0))
  return crypto.subtle.importKey('spki', der, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt'])
}

function base64(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}
