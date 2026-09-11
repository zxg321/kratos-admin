# 单阶段运行镜像：本机已交叉编译 Linux 二进制（bin/server），直接拷入。
# 不在此处编译，避免容器内访问私有 Go 模块的问题。
FROM alpine:3.22

RUN apk add --no-cache ca-certificates gzip mysql-client openssl tzdata \
    && addgroup -S kratos && adduser -S -G kratos -h /app kratos

WORKDIR /app

COPY bin/server ./server
COPY configs ./configs
COPY migration/assets ./migration/assets
COPY data/admin /opt/kratos-admin/static/admin
COPY data/ai /opt/kratos-admin/static/ai
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x ./server /usr/local/bin/docker-entrypoint.sh \
    && sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p /app/data /app/logs /app/backups \
    && chown -R kratos:kratos /app /opt/kratos-admin /usr/local/bin/docker-entrypoint.sh

VOLUME ["/app/data", "/app/logs", "/app/backups"]

EXPOSE 6001 7001

USER kratos:kratos

# -e docker 加载 *.docker.yaml 覆盖（数据库/consul/redis 指向 host.docker.internal 本机中间件）。
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["./server", "-c", "./configs", "-e", "docker"]