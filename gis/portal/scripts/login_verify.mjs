// GIS 门户登录链路联调脚本（Node 内置 crypto，算法与前端 Web Crypto 对齐）
// 用法: node login_verify.mjs <用户名> <密码> <captcha_id> <captcha_code>
import crypto from "node:crypto";

const BASE = "http://127.0.0.1:7001";
const [, , userName, rawPassword, captchaId, captchaCode] = process.argv;

async function main() {
  // 1. 验证码换令牌
  const verifyRes = await fetch(`${BASE}/api/v1/base/captcha/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ captcha_id: captchaId, captcha_code: captchaCode }),
  });
  if (!verifyRes.ok) {
    throw new Error(`VerifyCaptcha HTTP ${verifyRes.status}: ${await verifyRes.text()}`);
  }
  const { captcha_token: captchaToken } = await verifyRes.json();
  console.log("[1] captcha_token =", captchaToken);

  // 2. 获取公钥
  const pubRes = await fetch(`${BASE}/api/v1/base/password-public-key?scene=1`);
  const pub = await pubRes.json();
  console.log("[2] key_id =", pub.key_id);

  // 3. RSA-OAEP(SHA-256) 包 AES-256 key + AES-GCM 加密密码
  const aesKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const publicKeyPem = pub.public_key.replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\s+/g, "");
  const spki = Buffer.from(publicKeyPem, "base64");
  const publicKey = crypto.createPublicKey({ key: spki, format: "der", type: "spki" });
  const encryptedKey = crypto.publicEncrypt(
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
    aesKey,
  );
  const cipher = crypto.createCipheriv("aes-256-gcm", aesKey, iv);
  const ciphertext = Buffer.concat([cipher.update(rawPassword, "utf8"), cipher.final(), cipher.getAuthTag()]);
  const password = {
    key_id: pub.key_id,
    nonce: pub.nonce,
    algorithm: pub.algorithm,
    encrypted_key: encryptedKey.toString("base64"),
    iv: iv.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };

  // 4. 登录
  const loginRes = await fetch(`${BASE}/api/v1/base/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_name: userName,
      password,
      captcha_id: captchaId,
      captcha_code: captchaToken,
    }),
  });
  if (!loginRes.ok) {
    throw new Error(`Login HTTP ${loginRes.status}: ${await loginRes.text()}`);
  }
  const result = await loginRes.json();
  console.log("[4] login status =", result.status, "token_type =", result.token_type, "expires_in =", result.expires_in);
  if (result.access_token) {
    console.log("[4] access_token =", result.access_token.slice(0, 40) + "...");
    console.log("FULL_TOKEN=" + result.access_token);
  }
  console.log("LOGIN_OK");
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
