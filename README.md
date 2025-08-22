# env-manager-js

🌍 一个灵活的前端环境管理工具，支持动态API切换、URL参数控制和本地存储持久化。

[![npm version](https://badge.fury.io/js/env-manager-js.svg)](https://badge.fury.io/js/env-manager-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 特性

- 🚀 **动态环境切换** - 通过URL参数实时切换API环境，无需重新打包
- 💾 **持久化存储** - 使用localStorage保存环境选择，避免频繁输入
- 🔗 **URL同步显示** - 在URL中显示当前环境，一目了然
- 🛡️ **安全域名判断** - 基于域名自动判断默认环境，防止误操作生产数据
- 📱 **SSR兼容** - 完美支持服务端渲染环境
- 🎯 **TypeScript支持** - 完整的类型定义，提供最佳开发体验
- ⚡ **零依赖** - 轻量级实现，无外部依赖
- 🔧 **高度可配置** - 支持多项目、多环境灵活配置

## 📦 安装

```bash
npm install env-manager-js
```

```bash
yarn add env-manager-js
```

```bash
pnpm add env-manager-js
```

## 🚀 快速开始

### JavaScript 使用

```javascript
import createEnvManager from 'env-manager-js';

// 创建环境管理器
const envManager = createEnvManager({
  envConfig: {
    dev: { baseURL: "//localhost:3000" },
    prod: { baseURL: "//api.example.com" }
  }
});

// 获取当前环境配置
const config = envManager.getConfig();
console.log('当前API地址:', config.baseURL);
```

### TypeScript 使用

```typescript
import createEnvManager, { 
  EnvManagerConfig, 
  EnvManager 
} from 'env-manager-js';

const config: EnvManagerConfig = {
  envConfig: {
    dev: { baseURL: "//localhost:3000", timeout: 10000 },
    test: { baseURL: "//test-api.example.com", timeout: 8000 }, 
    prod: { baseURL: "//api.example.com", timeout: 5000 }
  },
  productionDomains: ['www.example.com'],
  paramName: 'apiSwitch',
  defaultEnv: 'dev'
};

const envManager: EnvManager = createEnvManager(config);
```

## 📖 API 文档

### createEnvManager(config)

创建环境管理器实例。

#### 参数

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `envConfig` | `Object` | `{}` | 环境配置映射对象 |
| `productionDomains` | `string[]` | `[]` | 生产域名列表 |
| `paramName` | `string` | `'apiSwitch'` | URL参数名 |
| `storageKey` | `string` | `paramName` | localStorage键名 |
| `defaultEnv` | `string` | `'pre'` | 默认环境 |
| `productionEnv` | `string` | `'prod'` | 生产环境名称 |
| `showUrlParams` | `boolean` | `true` | 是否在非生产域名显示URL参数 |
| `syncDelay` | `number` | `100` | URL同步延时(ms) |
| `enableLog` | `boolean` | `true` | 是否启用控制台日志 |

#### 返回值

返回环境管理器对象，包含以下方法：

| 方法 | 返回值 | 描述 |
|------|--------|------|
| `getCurrentEnv()` | `string` | 获取当前环境名称 |
| `getConfig(key?)` | `any` | 获取当前环境的配置，可指定配置项 |
| `isProduction()` | `boolean` | 判断是否是生产环境 |
| `isProductionDomain()` | `boolean` | 判断是否是生产域名 |
| `switchEnv(env)` | `boolean` | 手动切换环境 |
| `getAvailableEnvs()` | `string[]` | 获取所有可用环境 |
| `syncUrlParams(env)` | `void` | 同步URL参数 |

## 🎯 使用场景

### 1. React 项目集成

```jsx
import React, { useState, useEffect } from 'react';
import createEnvManager from 'env-manager-js';
import axios from 'axios';

const envManager = createEnvManager({
  envConfig: {
    dev: { baseURL: "//localhost:3000", timeout: 10000 },
    test: { baseURL: "//test-api.example.com", timeout: 8000 },
    prod: { baseURL: "//api.example.com", timeout: 5000 }
  },
  productionDomains: ['example.com']
});

// 获取当前环境配置
const config = envManager.getConfig();
console.log('当前API地址:', config.baseURL);

// 创建axios实例
const apiClient = axios.create({
  baseURL: envManager.getConfig(),
  timeout: 10000
});

// 获取当前环境配置
const config = envManager.getConfig();
console.log('当前API地址:', config.baseURL);

function App() {
  const [currentEnv, setCurrentEnv] = useState('');
  
  useEffect(() => {
    setCurrentEnv(envManager.getCurrentEnv());
  }, []);
  
  const handleSwitchEnv = (env) => {
    envManager.switchEnv(env);
    setCurrentEnv(env);
    // 重新创建axios实例或刷新页面
    window.location.reload();
  };
  
  return (
    <div>
      <p>当前环境: {currentEnv}</p>
      {envManager.getAvailableEnvs().map(env => (
        <button key={env} onClick={() => handleSwitchEnv(env)}>
          切换到{env}环境
        </button>
      ))}
    </div>
  );
}
```

### 2. Vue 项目集成

```javascript
// api/config.js
import createEnvManager from 'env-manager-js';

export const envManager = createEnvManager({
  envConfig: {
    dev: { baseURL: "//localhost:8080", timeout: 10000 },
    test: { baseURL: "//test-api.example.com", timeout: 8000 },
    prod: { baseURL: "//api.example.com", timeout: 5000 }
  },
  productionDomains: ['example.com']
});

export const config = envManager.getConfig();
```

```javascript
// api/request.js
import axios from 'axios';
import { config } from './config.js';

const request = axios.create({
  baseURL: config.url,
  timeout: 10000
});

export default request;
```

### 3. 多项目配置

```javascript
// 项目A的环境管理
const projectAEnvManager = createEnvManager({
  envConfig: {
    local: { baseURL: "//localhost:8080", timeout: 10000 },
    staging: { baseURL: "//staging-a.company.com", timeout: 8000 },
    production: { baseURL: "//api-a.company.com", timeout: 5000 }
  },
  productionDomains: ['app-a.company.com'],
  paramName: 'apiEnv',
  storageKey: 'projectA_env',
  defaultEnv: 'local'
});

// 获取项目A的配置
const configA = projectAEnvManager.getConfig();
console.log('项目A API地址:', configA.baseURL);

// 项目B的环境管理
const projectBEnvManager = createEnvManager({
  envConfig: {
    local: { baseURL: "//localhost:9000", timeout: 10000 }, 
    staging: { baseURL: "//staging-b.company.com", timeout: 8000 },
    production: { baseURL: "//api-b.company.com", timeout: 5000 }
  },
  productionDomains: ['app-b.company.com'],
  paramName: 'bEnv',
  storageKey: 'projectB_env',
  defaultEnv: 'local'
});

// 获取项目B的配置
const configB = projectBEnvManager.getConfig();
console.log('项目B API地址:', configB.baseURL);
```

## 🔄 环境切换逻辑

环境切换按以下优先级顺序执行：

1. **域名默认环境** - 根据当前域名判断默认环境
2. **localStorage覆盖** - 本地存储的环境选择覆盖默认环境  
3. **URL参数最高优先级** - URL参数中的环境设置覆盖所有其他设置

### 示例

```
当前域名: app.example.com (生产域名)
localStorage: test
URL参数: ?apiSwitch=dev

最终环境: dev (URL参数优先级最高)
```

## 🛡️ 安全特性

- **生产域名保护** - 在生产域名下不会在URL中显示环境参数，保持URL干净
- **环境验证** - 只允许切换到配置中存在的环境
- **SSR兼容** - 在服务端渲染环境中安全降级

## 🔧 高级配置

### 自定义日志

```javascript
const envManager = createEnvManager({
  envConfig: {
    dev: { baseURL: "//localhost:3000" },
    prod: { baseURL: "//api.example.com" }
  },
  enableLog: false, // 关闭默认日志
});

// 自定义日志处理
const originalGetConfig = envManager.getConfig;
envManager.getConfig = function(key) {
  const config = originalGetConfig.call(this, key);
  console.log(`🔧 自定义日志: 获取配置`, key ? `${key}: ${config}` : config);
  return config;
};
```

### 环境切换回调

```javascript
const envManager = createEnvManager({
  envConfig: {
    dev: { baseURL: "//localhost:3000" },
    prod: { baseURL: "//api.example.com" }
  }
});

// 监听环境切换
const originalSwitchEnv = envManager.switchEnv;
envManager.switchEnv = function(env) {
  const success = originalSwitchEnv.call(this, env);
  if (success) {
    console.log(`环境已切换到: ${env}`);
    // 执行自定义逻辑，如重新加载数据
    window.dispatchEvent(new CustomEvent('envChanged', { detail: env }));
  }
  return success;
};
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT](LICENSE) © woyangv

## 🔗 相关链接

- [GitHub Repository](https://github.com/woyangv/env-manager-js)
- [npm Package](https://www.npmjs.com/package/env-manager-js)
- [Issues](https://github.com/woyangv/env-manager-js/issues)