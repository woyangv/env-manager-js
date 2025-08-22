# 前端多环境管理的优雅解决方案：env-manager-js

## 🎯 背景与痛点

在现代前端开发中，我们经常需要面对多个部署环境：开发环境（dev）、测试环境（test）、预发布环境（pre）、生产环境（prod）等。传统的环境管理方式通常依赖于构建时的环境变量，这种方式存在以下痛点：

### 传统方案的问题

- **🔄 构建成本高**：每次切换环境都需要重新打包，CI/CD流程复杂
- **🛠️ 维护困难**：环境变量散落在各个配置文件中，难以统一管理  
- **🐛 调试不便**：无法在运行时动态切换环境，调试效率低
- **📦 部署复杂**：需要为每个环境维护独立的构建产物

### 理想的解决方案

我们需要一个能够：
- 🚀 **运行时动态切换**：无需重新打包即可切换环境
- 💾 **状态持久化**：记住用户的环境选择
- 🛡️ **安全可控**：防止在生产环境误操作
- 📱 **框架无关**：支持React、Vue等各种前端框架
- 🎯 **类型安全**：提供完整的TypeScript支持

## 💡 解决方案：env-manager-js

基于以上需求，我们开发了 `env-manager-js` —— 一个轻量级、零依赖的前端环境管理工具。

### 🌟 核心特性

#### 1. 智能环境切换策略

```typescript
/**
 * 环境切换优先级：URL参数 > localStorage > 域名默认
 * 这种设计确保了：
 * - 域名安全：生产域名默认使用生产环境
 * - 用户体验：记住用户的环境选择  
 * - 调试便利：通过URL参数快速切换
 */
function getCurrentEnv(): string {
  if (typeof window === 'undefined') return defaultEnv;

  // 1. 首先根据域名确定默认环境
  let currentEnv = isProductionDomain() ? productionEnv : defaultEnv;
  
  // 2. localStorage覆盖默认环境
  const savedEnv = localStorage.getItem(storageKey);
  if (savedEnv && envConfig[savedEnv]) {
    currentEnv = savedEnv;
  }
  
  // 3. URL参数优先级最高，覆盖所有
  const urlEnv = getUrlParam(paramName);
  if (urlEnv && envConfig[urlEnv]) {
    currentEnv = urlEnv;
  }
  
  return currentEnv;
}
```

#### 2. URL同步机制

```typescript
function syncUrlParams(env: string): void {
  // 只有非生产域名才在URL上显示参数，保持生产环境URL干净
  if (!isProductionDomain()) {
    setTimeout(() => {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set(paramName, env);
      window.history.replaceState({}, '', currentUrl.toString());
    }, syncDelay);
  }
}
```

## 🚀 实际应用场景

### React项目集成示例

```jsx
import React, { useState, useEffect } from 'react';
import createEnvManager from 'env-manager-js';
import axios from 'axios';

// 环境配置
const envManager = createEnvManager({
  envConfig: {
    dev: { 
      baseURL: "//localhost:3000", 
      timeout: 10000,
      debug: true 
    },
    test: { 
      baseURL: "//test-api.example.com", 
      timeout: 8000,
      debug: true 
    },
    prod: { 
      baseURL: "//api.example.com", 
      timeout: 5000,
      debug: false 
    }
  },
  productionDomains: ['example.com'],
  paramName: 'apiSwitch',
  defaultEnv: 'dev'
});

// 创建axios实例
const apiClient = axios.create({
  baseURL: envManager.getConfig('baseURL'),
  timeout: envManager.getConfig('timeout')
});

function App() {
  const [currentEnv, setCurrentEnv] = useState('');
  
  useEffect(() => {
    setCurrentEnv(envManager.getCurrentEnv());
  }, []);
  
  const handleSwitchEnv = (env) => {
    if (envManager.switchEnv(env)) {
      setCurrentEnv(env);
      // 重新配置axios或刷新页面
      window.location.reload();
    }
  };
  
  return (
    <div>
      <div className="env-switcher">
        <span>当前环境: {currentEnv}</span>
        {!envManager.isProductionDomain() && (
          <div>
            {envManager.getAvailableEnvs().map(env => (
              <button 
                key={env} 
                onClick={() => handleSwitchEnv(env)}
                className={env === currentEnv ? 'active' : ''}
              >
                {env}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

## 🔧 技术实现细节

### 1. TypeScript类型设计

```typescript
// 环境配置映射类型
export interface EnvConfig {
  [key: string]: string | object;
}

// 管理器配置选项
export interface EnvManagerConfig {
  envConfig?: EnvConfig;
  productionDomains?: string[];
  paramName?: string;
  storageKey?: string;
  defaultEnv?: string;
  productionEnv?: string;
  showUrlParams?: boolean;
  syncDelay?: number;
  enableLog?: boolean;
}

// 环境管理器接口
export interface EnvManager {
  getCurrentEnv(): string;
  getConfig(key?: string): any;
  isProduction(): boolean;
  isProductionDomain(): boolean;
  switchEnv(env: string): boolean;
  getAvailableEnvs(): string[];
  syncUrlParams(env: string): void;
}
```

### 2. SSR兼容性处理

```typescript
function getUrlParam(name: string): string | null {
  if (typeof window === 'undefined') return null; // SSR环境检查
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function getCurrentEnv(): string {
  if (typeof window === 'undefined') return defaultEnv; // SSR降级处理
  // ... 其他逻辑
}
```

## 📋 最佳实践

### 1. 环境配置设计

```javascript
// ✅ 推荐：对象格式，支持多配置项
const envConfig = {
  dev: {
    baseURL: "//localhost:3000",
    timeout: 10000,
    debug: true,
    mockEnabled: true
  },
  prod: {
    baseURL: "//api.example.com", 
    timeout: 5000,
    debug: false,
    mockEnabled: false
  }
};

// ❌ 不推荐：字符串格式，扩展性差
const envConfig = {
  dev: "//localhost:3000",
  prod: "//api.example.com"
};
```

### 2. 安全域名配置

```javascript
const envManager = createEnvManager({
  envConfig,
  productionDomains: [
    'example.com',
    'www.example.com',
    'app.example.com'
  ], // 明确指定生产域名
  defaultEnv: 'dev', // 非生产域名默认环境
  productionEnv: 'prod' // 生产域名默认环境
});
```

### 3. 调试友好配置

```javascript
const envManager = createEnvManager({
  envConfig,
  enableLog: process.env.NODE_ENV !== 'production', // 生产环境关闭日志
  showUrlParams: true, // 开发时显示URL参数
  syncDelay: 100 // 避免与路由冲突
});
```

## 📊 与其他方案对比

| 特性 | env-manager-js | 环境变量 | 配置文件 |
|------|----------------|----------|----------|
| 运行时切换 | ✅ | ❌ | ❌ |
| 无需重新打包 | ✅ | ❌ | ❌ |
| 状态持久化 | ✅ | ❌ | ❌ |
| URL参数支持 | ✅ | ❌ | ❌ |
| TypeScript支持 | ✅ | ✅ | ✅ |
| 零依赖 | ✅ | ✅ | ❌ |
| 学习成本 | 低 | 低 | 中 |

## 🎉 总结

`env-manager-js` 通过运行时环境管理，解决了传统构建时环境配置的诸多痛点：

### 核心优势
1. **🚀 开发效率提升**：无需重新打包即可切换环境
2. **💰 维护成本降低**：统一的环境配置管理
3. **🎯 调试体验优化**：URL参数快速切换，localStorage持久化
4. **🛡️ 生产安全保障**：域名级别的环境隔离

### 适用场景
- 需要频繁切换环境的开发团队
- 多环境部署的复杂项目  
- 需要运行时配置的微前端架构
- 对构建性能有要求的大型项目

通过合理的架构设计和最佳实践，`env-manager-js` 为前端多环境管理提供了一个优雅、高效的解决方案。

## 📦 快速开始

```bash
npm install env-manager-js
```

```javascript
import createEnvManager from 'env-manager-js';

const envManager = createEnvManager({
  envConfig: {
    dev: { baseURL: "//localhost:3000" },
    prod: { baseURL: "//api.example.com" }
  },
  productionDomains: ['example.com']
});

// 获取当前环境配置
const apiUrl = envManager.getConfig('baseURL');
```

**项目地址**：[https://github.com/woyangv/env-manager-js](https://github.com/woyangv/env-manager-js)

---

*本文介绍了前端环境管理的痛点和解决方案，希望能为你的项目带来帮助。如果有任何问题或建议，欢迎在GitHub上提交Issue或PR。*