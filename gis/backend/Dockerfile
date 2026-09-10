# 单阶段运行镜像：本机已交叉编译 Linux 二进制（bin/server），直接拷入。
# 不在此处编译，避免容器内访问私有 Go 模块的问题。迁移脚本资源已 embed 进二进制。
FROM alpine:3.22

RUN apk add --no-cache ca-certificates tzdata \
    && addgroup -S kratos && adduser -S -G kratos -h /app kratos

WORKDIR /app

COPY bin/server ./server
COPY configs ./configs

RUN chmod +x ./server \
    && mkdir -p /app/logs \
    && chown -R kratos:kratos /app

# 日志目录持久化。
VOLUME ["/app/logs"]

EXPOSE 6002 7002

USER kratos:kratos

# -e docker 加载 *.docker.yaml 覆盖（postgres/redis/consul 指向 host.docker.internal 本机中间件）。
CMD ["./server", "-c", "./configs", "-e", "docker"]