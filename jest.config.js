module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',

  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/src/**/*.test.js'
  ],

  // 覆盖率收集
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],

  // 覆盖率报告格式
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],

  // 覆盖率输出目录
  coverageDirectory: 'coverage',

  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },

  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // 模块路径映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // 转换配置
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // 忽略转换的模块
  transformIgnorePatterns: [
    'node_modules/(?!(module-to-transform)/)'
  ],

  // 清除模拟
  clearMocks: true,

  // 详细输出
  verbose: true
};