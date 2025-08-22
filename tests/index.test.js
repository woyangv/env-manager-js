const { createEnvManager } = require('../dist/index');

// Mock配置
const mockConfig = {
  envConfig: {
    prod: { baseURL: 'https://api.prod.com' },
    pre: { baseURL: 'https://api.pre.com' },
    test: { baseURL: 'https://api.test.com' }
  },
  productionDomains: ['prod.example.com'],
  defaultEnv: 'prod'
};

describe('EnvManager', () => {
  let envManager;

  beforeEach(() => {
    // 重置环境
    delete global.window;
    global.window = {
      location: {
        hostname: 'localhost',
        search: '',
        href: 'http://localhost:3000'
      }
    };
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };

    envManager = createEnvManager(mockConfig);
  });

  describe('createEnvManager', () => {
    test('应该创建环境管理器实例', () => {
      expect(envManager).toBeDefined();
      expect(typeof envManager.getCurrentEnv).toBe('function');
      expect(typeof envManager.getConfig).toBe('function');
      expect(typeof envManager.switchEnv).toBe('function');
    });

    test('应该使用默认配置', () => {
      const defaultManager = createEnvManager();
      expect(defaultManager).toBeDefined();
      expect(typeof defaultManager.getCurrentEnv).toBe('function');
    });
  });

  describe('getCurrentEnv', () => {
    test('应该返回默认环境', () => {
      const env = envManager.getCurrentEnv();
      expect(typeof env).toBe('string');
      expect(['prod', 'pre', 'test']).toContain(env);
    });

    test('应该从URL参数读取环境', () => {
      global.window.location.search = '?apiSwitch=test';
      const env = envManager.getCurrentEnv();
      expect(env).toBe('test');
    });
  });

  describe('getConfig', () => {
    test('应该返回当前环境的完整配置', () => {
      const config = envManager.getConfig();
      expect(typeof config).toBe('object');
      expect(config).toHaveProperty('baseURL');
    });

    test('应该返回指定配置项的值', () => {
      const baseURL = envManager.getConfig('baseURL');
      expect(typeof baseURL).toBe('string');
      expect(baseURL).toMatch(/^https?:\/\//);
    });

    test('应该在切换环境后返回正确的配置', () => {
      envManager.switchEnv('test');
      const config = envManager.getConfig();
      expect(config.baseURL).toBe('https://api.test.com');

      const baseURL = envManager.getConfig('baseURL');
      expect(baseURL).toBe('https://api.test.com');
    });

    test('应该处理不存在的配置项', () => {
      const nonExistent = envManager.getConfig('nonExistentKey');
      expect(nonExistent).toBeUndefined();
    });
  });


  describe('switchEnv', () => {
    test('应该切换环境', () => {
      const result = envManager.switchEnv('test');
      expect(typeof result).toBe('boolean');
    });

    test('应该处理无效环境', () => {
      const result = envManager.switchEnv('invalid');
      expect(result).toBe(false);
    });
  });

  describe('getAvailableEnvs', () => {
    test('应该返回可用环境列表', () => {
      const envs = envManager.getAvailableEnvs();
      expect(Array.isArray(envs)).toBe(true);
      expect(envs).toContain('prod');
      expect(envs).toContain('pre');
      expect(envs).toContain('test');
    });
  });

  describe('isProduction', () => {
    test('应该判断是否为生产环境', () => {
      const isProd = envManager.isProduction();
      expect(typeof isProd).toBe('boolean');
    });
  });

  describe('isProductionDomain', () => {
    test('应该判断是否为生产域名', () => {
      const isProdDomain = envManager.isProductionDomain();
      expect(typeof isProdDomain).toBe('boolean');
    });

    test('生产域名应该返回true', () => {
      global.window.location.hostname = 'prod.example.com';
      const isProdDomain = envManager.isProductionDomain();
      expect(isProdDomain).toBe(true);
    });
  });

  describe('SSR兼容性', () => {
    test('应该在服务端环境正常工作', () => {
      delete global.window;
      const ssrManager = createEnvManager(mockConfig);
      expect(ssrManager.getCurrentEnv()).toBeDefined();
      expect(ssrManager.getConfig()).toBeDefined();
    });
  });
});