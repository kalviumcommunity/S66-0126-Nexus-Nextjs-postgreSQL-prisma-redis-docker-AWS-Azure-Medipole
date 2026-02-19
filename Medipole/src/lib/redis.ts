import Redis from "ioredis";

const globalForRedis = global as unknown as {
  redis: Redis | undefined;
};

const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

redis.on("connect", () => {
  console.log("✅ Redis Connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

export default redis;
