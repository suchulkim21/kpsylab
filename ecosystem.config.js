/**
 * PM2 프로덕션 설정 파일
 * KPSY LAB Portal 프로덕션 배포용
 */

module.exports = {
  apps: [{
    name: 'kpsylab-portal',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 7777',
    cwd: './portal',
    instances: 1,
    exec_mode: 'fork', // 'cluster' 모드는 Next.js에서 권장하지 않음
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 7777
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 7777
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }]
};

