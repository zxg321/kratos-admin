-- base_oauth_provider OAuth第三方登录方式

CREATE TABLE IF NOT EXISTS "base_oauth_provider" (
    "id" BIGINT NOT NULL,
    "provider" VARCHAR(32) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255) NOT NULL DEFAULT '',
    "icon" VARCHAR(255) NOT NULL DEFAULT '',
    "client_id" VARCHAR(255) NOT NULL DEFAULT '',
    "client_secret" VARCHAR(1024) NOT NULL DEFAULT '',
    "redirect_uri" VARCHAR(512) NOT NULL DEFAULT '',
    "scopes" JSON NOT NULL DEFAULT '[]'::jsonb,
    "config" JSON NOT NULL DEFAULT '{}'::jsonb,
    "sort" INT NOT NULL DEFAULT 0,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_by" BIGINT NOT NULL DEFAULT 1,
    "updated_by" BIGINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY ("id"),
    CONSTRAINT "unique_base_oauth_provider" UNIQUE ("provider", "deleted_at")
);

-- 索引
CREATE INDEX IF NOT EXISTS "idx_base_oauth_provider_status_sort" ON "base_oauth_provider" ("status", "sort", "id");

-- 表备注
COMMENT ON TABLE "base_oauth_provider" IS 'OAuth第三方登录方式';

-- 列备注
COMMENT ON COLUMN "base_oauth_provider"."id" IS 'OAuth登录方式ID';
COMMENT ON COLUMN "base_oauth_provider"."provider" IS 'Provider稳定标识';
COMMENT ON COLUMN "base_oauth_provider"."name" IS '登录方式名称';
COMMENT ON COLUMN "base_oauth_provider"."description" IS '登录方式提示语';
COMMENT ON COLUMN "base_oauth_provider"."icon" IS '图标键或图片地址';
COMMENT ON COLUMN "base_oauth_provider"."client_id" IS '第三方应用标识';
COMMENT ON COLUMN "base_oauth_provider"."client_secret" IS '第三方应用密钥';
COMMENT ON COLUMN "base_oauth_provider"."redirect_uri" IS 'OAuth回调地址';
COMMENT ON COLUMN "base_oauth_provider"."scopes" IS 'OAuth Scope JSON数组';
COMMENT ON COLUMN "base_oauth_provider"."config" IS 'Provider个性化配置JSON对象';
COMMENT ON COLUMN "base_oauth_provider"."sort" IS '排序';
COMMENT ON COLUMN "base_oauth_provider"."status" IS '状态：枚举【Status】';
COMMENT ON COLUMN "base_oauth_provider"."created_by" IS '创建者ID';
COMMENT ON COLUMN "base_oauth_provider"."updated_by" IS '更新者ID';
COMMENT ON COLUMN "base_oauth_provider"."created_at" IS '创建时间';
COMMENT ON COLUMN "base_oauth_provider"."updated_at" IS '更新时间';
COMMENT ON COLUMN "base_oauth_provider"."deleted_at" IS '删除时间';

-- 默认数据：密钥使用配置 AES-GCM 协议加密，主表只保存 ENC[...] 内的密文载荷。
INSERT INTO "base_oauth_provider" ("id", "provider", "name", "description", "icon", "client_id", "client_secret", "redirect_uri", "scopes", "config", "sort", "status", "created_by", "updated_by", "created_at", "updated_at", "deleted_at") VALUES (1, 'dingtalk', '钉钉', '使用钉钉账号登录', 'dingtalk', '', '', 'http://127.0.0.1:7001/api/v1/base/oauth/dingtalk/callback', '["openid"]', '{}', 10, 2, 1, 1, '2026-09-23 00:00:00', '2026-09-23 00:00:00', 0) ON CONFLICT DO NOTHING;
INSERT INTO "base_oauth_provider" ("id", "provider", "name", "description", "icon", "client_id", "client_secret", "redirect_uri", "scopes", "config", "sort", "status", "created_by", "updated_by", "created_at", "updated_at", "deleted_at") VALUES (2, 'feishu', '飞书', '使用飞书账号登录', 'feishu', '', '', 'http://127.0.0.1:7001/api/v1/base/oauth/feishu/callback', '[]', '{}', 20, 2, 1, 1, '2026-09-23 00:00:00', '2026-09-23 00:00:00', 0) ON CONFLICT DO NOTHING;
INSERT INTO "base_oauth_provider" ("id", "provider", "name", "description", "icon", "client_id", "client_secret", "redirect_uri", "scopes", "config", "sort", "status", "created_by", "updated_by", "created_at", "updated_at", "deleted_at") VALUES (3, 'gitee', 'Gitee', '使用 Gitee 账号登录', 'gitee', 'a23f23168a3baef3f37b37d136400a7118278ba6ec3b8f18315727581ddeba4b', 'NGOBzVA19LGu5TlQyFeWOihl1a7XNZE0tBAKfW4vcsBEFBNkI-zozFld4JMAYs3wlF5E_fvh7f8dx-AlI5oQhqUsUt-RlfH8aE9kfuoFAkWCQLffe91UeMNmjPQ', 'http://127.0.0.1:7001/api/v1/base/oauth/gitee/callback', '["user_info","emails"]', '{}', 30, 1, 1, 1, '2026-09-23 00:00:00', '2026-09-23 00:00:00', 0) ON CONFLICT DO NOTHING;
INSERT INTO "base_oauth_provider" ("id", "provider", "name", "description", "icon", "client_id", "client_secret", "redirect_uri", "scopes", "config", "sort", "status", "created_by", "updated_by", "created_at", "updated_at", "deleted_at") VALUES (4, 'github', 'GitHub', '使用 GitHub 账号登录', 'github', 'Ov23litVBeilJRE8TgOk', 'tyZBMUfRgP89Sav-CF9-zWn7yibdcaNwcAmC_odYb0vyRJFqtplDYlK3nL-F5d7p2AX-k76cXy6Nt3vwYMk7D2VW664', 'http://127.0.0.1:7001/api/v1/base/oauth/github/callback', '["user:email"]', '{}', 40, 1, 1, 1, '2026-09-23 00:00:00', '2026-09-23 00:00:00', 0) ON CONFLICT DO NOTHING;
INSERT INTO "base_oauth_provider" ("id", "provider", "name", "description", "icon", "client_id", "client_secret", "redirect_uri", "scopes", "config", "sort", "status", "created_by", "updated_by", "created_at", "updated_at", "deleted_at") VALUES (5, 'google', 'Google', '使用 Google 账号登录', 'google', '97409157491-jak87hoo8odjb5e0capltnklk5iqjqhq.apps.googleusercontent.com', 'HwUIQF8d7dJtNDaCrX0cFQZf4YR94BSlssnj6ViUTAV_HeMctiMvegx_MG-3lBpH3XALpR_hBMGj9NokKAvO', 'http://127.0.0.1:7001/api/v1/base/oauth/google/callback', '["openid","profile","email"]', '{}', 50, 1, 1, 1, '2026-09-23 00:00:00', '2026-09-23 00:00:00', 0) ON CONFLICT DO NOTHING;
INSERT INTO "base_oauth_provider" ("id", "provider", "name", "description", "icon", "client_id", "client_secret", "redirect_uri", "scopes", "config", "sort", "status", "created_by", "updated_by", "created_at", "updated_at", "deleted_at") VALUES (6, 'wechat', '微信开放平台', '使用微信开放平台账号登录', 'wechat', '', '', 'http://127.0.0.1:7001/api/v1/base/oauth/wechat/callback', '["snsapi_login"]', '{}', 60, 2, 1, 1, '2026-09-23 00:00:00', '2026-09-23 00:00:00', 0) ON CONFLICT DO NOTHING;
INSERT INTO "base_oauth_provider" ("id", "provider", "name", "description", "icon", "client_id", "client_secret", "redirect_uri", "scopes", "config", "sort", "status", "created_by", "updated_by", "created_at", "updated_at", "deleted_at") VALUES (7, 'wechatmini', '微信小程序', '使用微信小程序账号登录', 'wechat', 'wx3fe0d8a39051f39a', 'hvd4zoPFLLwloF3wih9mgh4QJuH8SsCTHkGT6HnnG0ChzpU_sM_RdwYUshh9Qy5rd9pqJ8eB4bNX-r7H', '', '[]', '{}', 70, 1, 1, 1, '2026-09-23 00:00:00', '2026-09-23 00:00:00', 0) ON CONFLICT DO NOTHING;
INSERT INTO "base_oauth_provider" ("id", "provider", "name", "description", "icon", "client_id", "client_secret", "redirect_uri", "scopes", "config", "sort", "status", "created_by", "updated_by", "created_at", "updated_at", "deleted_at") VALUES (8, 'wechatmp', '微信公众号', '使用微信公众号账号登录', 'wechat', '', '', 'http://127.0.0.1:7001/api/v1/base/oauth/wechatmp/callback', '["snsapi_userinfo"]', '{}', 80, 2, 1, 1, '2026-09-23 00:00:00', '2026-09-23 00:00:00', 0) ON CONFLICT DO NOTHING;
INSERT INTO "base_oauth_provider" ("id", "provider", "name", "description", "icon", "client_id", "client_secret", "redirect_uri", "scopes", "config", "sort", "status", "created_by", "updated_by", "created_at", "updated_at", "deleted_at") VALUES (9, 'wechatwork', '企业微信', '使用企业微信账号登录', 'wechatwork', '', '', 'http://127.0.0.1:7001/api/v1/base/oauth/wechatwork/callback', '[]', '{}', 90, 2, 1, 1, '2026-09-23 00:00:00', '2026-09-23 00:00:00', 0) ON CONFLICT DO NOTHING;