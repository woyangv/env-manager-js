// Jest测试环境设置文件

// 设置测试环境
global.console = {
  ...console,
  // 在测试中静默某些日志
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// 基本的DOM环境模拟
if (typeof window === 'undefined') {
  global.window = {};
}

if (typeof localStorage === 'undefined') {
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };
}