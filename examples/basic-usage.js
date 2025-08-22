// 基本使用示例
const { createEnvManager } = require('env-manager-js');

// 1. 定义环境配置
const envConfig = {
  prod: {
    baseURL: 'https://api.production.com',
    timeout: 5000,
    debug: false
  },
  pre: {
    baseURL: 'https://api.pre-release.com',
    timeout: 8000,
    debug: true
  },
  test: {
    baseURL: 'https://api.test.com',
    timeout: 10000,
    debug: true
  }
};

// 2. 创建环境管理器
const envManager = createEnvManager(envConfig);

// 3. 获取当前环境
console.log('当前环境:', envManager.getCurrentEnv());

// 4. 获取当前环境配置
console.log('当前配置:', envManager.getConfig());

// 5. 获取指定环境配置
console.log('测试环境配置:', envManager.getConfig('test'));

// 6. 切换环境
envManager.switchEnv('test', (env, config) => {
  console.log(`已切换到 ${env} 环境`);
  console.log('新配置:', config);
});

// 7. 在API调用中使用
function apiRequest(endpoint, options = {}) {
  const config = envManager.getConfig();
  const url = `${config.baseURL}${endpoint}`;

  return fetch(url, {
    timeout: config.timeout,
    ...options
  });
}

// 使用示例
apiRequest('/users')
  .then(response => response.json())
  .then(data => console.log('用户数据:', data))
  .catch(error => console.error('请求失败:', error));