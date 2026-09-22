// 실제 배포 시 이 파일을 ecosystem.config.cjs 로 복사한 뒤 값을 채워 넣으세요.
// ecosystem.config.cjs 는 .gitignore 에 등록되어 있어 git에는 올라가지 않습니다.
module.exports = {
  apps: [
    {
      name: "angel-home-api",
      script: "/var/www/angel-home-renewal/artifacts/api-server/dist/index.mjs",
      cwd: "/var/www/angel-home-renewal/artifacts/api-server",
      env: {
        NODE_ENV: "production",
        PORT: "5041",
        DATABASE_URL: "postgresql://<user>:<password>@127.0.0.1:5432/angel_home_renewal",
        JWT_SECRET: "<jwt-secret>",
      },
    },
  ],
};
