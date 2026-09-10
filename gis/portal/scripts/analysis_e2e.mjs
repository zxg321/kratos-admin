// GIS M2 analysis 接口联调：登录后依次验证测量/缓冲/叠加接口。
import crypto from "node:crypto";

const ADMIN = "http://127.0.0.1:7001";
const GIS = "http://127.0.0.1:7002";
const [, , captchaId, captchaCode] = process.argv;

async function login() {
  const verifyRes = await fetch(`${ADMIN}/api/v1/base/captcha/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ captcha_id: captchaId, captcha_code: captchaCode }),
  });
  if (!verifyRes.ok) throw new Error(`VerifyCaptcha HTTP ${verifyRes.status}`);
  const { captcha_token: captchaToken } = await verifyRes.json();

  const pub = await (await fetch(`${ADMIN}/api/v1/base/password-public-key?scene=1`)).json();
  const aesKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const publicKey = crypto.createPublicKey({
    key: Buffer.from(pub.public_key.replace(/-----.*KEY-----|\s/g, ""), "base64"),
    format: "der",
    type: "spki",
  });
  const encryptedKey = crypto.publicEncrypt(
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
    aesKey,
  );
  const cipher = crypto.createCipheriv("aes-256-gcm", aesKey, iv);
  const ciphertext = Buffer.concat([cipher.update("112233", "utf8"), cipher.final(), cipher.getAuthTag()]);
  const loginRes = await fetch(`${ADMIN}/api/v1/base/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_name: "super",
      password: {
        key_id: pub.key_id, nonce: pub.nonce, algorithm: pub.algorithm,
        encrypted_key: encryptedKey.toString("base64"), iv: iv.toString("base64"),
        ciphertext: ciphertext.toString("base64"),
      },
      captcha_id: captchaId, captcha_code: captchaToken,
    }),
  });
  const login = await loginRes.json();
  if (login.status !== 1) throw new Error(`Login status=${login.status}`);
  return { Authorization: `Bearer ${login.access_token}`, "Content-Type": "application/json" };
}

async function call(headers, path, body) {
  const res = await fetch(`${GIS}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (res.status !== 200) throw new Error(`${path} HTTP ${res.status}: ${text}`);
  return JSON.parse(text);
}

async function main() {
  const headers = await login();
  console.log("[1] login OK");

  // 2. 测距：上海→北京直线（球面大圆距离约 1067km）
  const line = { type: "LineString", coordinates: [[121.4737, 31.2304], [116.3975, 39.9087]] };
  const d = await call(headers, "/api/v1/gis/admin/analysis/distance", {
    geometry: { type: "LineString", coordinates: JSON.stringify(line) },
  });
  console.log("[2] distance 沪京直线:", (d.meters / 1000).toFixed(1), "km（期望约 1067km）");

  // 3. 测积：北京天安门附近 0.01°×0.01° 矩形（39.9°N 球面面积约 0.95km²）
  const poly = {
    type: "Polygon",
    coordinates: [[[116.39, 39.90], [116.40, 39.90], [116.40, 39.91], [116.39, 39.91], [116.39, 39.90]]],
  };
  const a = await call(headers, "/api/v1/gis/admin/analysis/area", {
    geometry: { type: "Polygon", coordinates: JSON.stringify(poly) },
  });
  console.log("[3] area 0.01°×0.01°:", (a.square_meters / 1000000).toFixed(4), "km²（期望约 0.95km²）");

  // 4. 缓冲：北京天安门点 + 5km，验证缓冲半径约 0.045°
  const b = await call(headers, "/api/v1/gis/admin/analysis/buffer", {
    geometry: { type: "Point", coordinates: JSON.stringify({ type: "Point", coordinates: [116.3975, 39.9087] }) },
    distance_meters: 5000,
  });
  const bgeo = JSON.parse(b.result.coordinates);
  const lons = bgeo.coordinates[0].map((p) => p[0]);
  const lats = bgeo.coordinates[0].map((p) => p[1]);
  const midLat = (Math.max(...lats) + Math.min(...lats)) / 2;
  const lonSpan = (Math.max(...lons) - Math.min(...lons)) / 2 * Math.cos((midLat * Math.PI) / 180);
  const latSpan = (Math.max(...lats) - Math.min(...lats)) / 2;
  console.log("[4] buffer type:", bgeo.type, "半径约:", (Math.max(lonSpan, latSpan) * 111).toFixed(1), "km（期望约 5km）");

  // 5. 叠加：范围包住北京（within 应命中北京天安门要素）
  const range = {
    type: "Polygon",
    coordinates: [[[116.30, 39.80], [116.50, 39.80], [116.50, 40.00], [116.30, 40.00], [116.30, 39.80]]],
  };
  const w = await call(headers, "/api/v1/gis/admin/analysis/within", {
    query: {
      layer_id: 1,
      geometry: { type: "Polygon", coordinates: JSON.stringify(range) },
      limit: 100,
    },
  });
  const wNames = (w.result?.list ?? []).map((f) => JSON.parse(f.properties).name);
  console.log("[5] within 北京范围:", JSON.stringify(wNames), "（期望含 北京天安门）");

  // 6. 叠加：intersects 中国范围（覆盖沪/京/穗三要素）。
  // 注意：MySQL 8.0 对 SRID 4326 跨 180° 经线（经度跨度>180°）的多边形按球面
  // 最小包络解释，不适用"全球覆盖"语义，联调用例避免跨 dateline。
  const china = {
    type: "Polygon",
    coordinates: [[[95, 15], [130, 15], [130, 55], [95, 55], [95, 15]]],
  };
  const i = await call(headers, "/api/v1/gis/admin/analysis/intersects", {
    query: {
      layer_id: 1,
      geometry: { type: "Polygon", coordinates: JSON.stringify(china) },
      limit: 100,
    },
  });
  console.log("[6] intersects 中国:", (i.result?.list ?? []).length, "个要素（期望 3）");

  console.log("M2_ANALYSIS_OK");
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
