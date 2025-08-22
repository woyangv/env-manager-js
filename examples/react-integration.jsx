// React集成示例
import React, { useState, useEffect } from 'react';
import { createEnvManager } from 'env-manager-js';

// 环境配置
const envConfig = {
  prod: {
    baseURL: 'https://api.production.com',
    wsURL: 'wss://ws.production.com',
    debug: false
  },
  pre: {
    baseURL: 'https://api.pre-release.com',
    wsURL: 'wss://ws.pre-release.com',
    debug: true
  },
  test: {
    baseURL: 'https://api.test.com',
    wsURL: 'wss://ws.test.com',
    debug: true
  }
};

// 创建环境管理器实例
const envManager = createEnvManager(envConfig);

// 自定义Hook
function useEnvManager() {
  const [currentEnv, setCurrentEnv] = useState(envManager.getCurrentEnv());
  const [config, setConfig] = useState(envManager.getConfig());

  const switchEnvironment = (env) => {
    envManager.switchEnv(env, (newEnv, newConfig) => {
      setCurrentEnv(newEnv);
      setConfig(newConfig);
    });
  };

  return {
    currentEnv,
    config,
    switchEnvironment,
    availableEnvs: Object.keys(envConfig)
  };
}

// API服务
class ApiService {
  constructor() {
    this.config = envManager.getConfig();
  }

  updateConfig() {
    this.config = envManager.getConfig();
  }

  async get(endpoint) {
    const response = await fetch(`${this.config.baseURL}${endpoint}`);
    return response.json();
  }

  async post(endpoint, data) {
    const response = await fetch(`${this.config.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

const apiService = new ApiService();

// 环境切换组件
function EnvironmentSwitcher() {
  const { currentEnv, switchEnvironment, availableEnvs } = useEnvManager();

  const handleEnvChange = (event) => {
    const newEnv = event.target.value;
    switchEnvironment(newEnv);
    // 更新API服务配置
    apiService.updateConfig();
  };

  return (
    <div className="env-switcher">
      <label htmlFor="env-select">当前环境: </label>
      <select
        id="env-select"
        value={currentEnv}
        onChange={handleEnvChange}
      >
        {availableEnvs.map(env => (
          <option key={env} value={env}>
            {env.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

// 配置显示组件
function ConfigDisplay() {
  const { config, currentEnv } = useEnvManager();

  return (
    <div className="config-display">
      <h3>当前配置 ({currentEnv})</h3>
      <pre>{JSON.stringify(config, null, 2)}</pre>
    </div>
  );
}

// 主应用组件
function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { config } = useEnvManager();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const userData = await apiService.get('/users');
      setUsers(userData);
    } catch (error) {
      console.error('获取用户数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [config]); // 当配置改变时重新获取数据

  return (
    <div className="app">
      <h1>环境管理器 React 示例</h1>

      <EnvironmentSwitcher />
      <ConfigDisplay />

      <div className="user-section">
        <h2>用户数据</h2>
        <button onClick={fetchUsers} disabled={loading}>
          {loading ? '加载中...' : '刷新数据'}
        </button>

        {users.length > 0 ? (
          <ul>
            {users.map(user => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        ) : (
          <p>暂无用户数据</p>
        )}
      </div>
    </div>
  );
}

export default App;