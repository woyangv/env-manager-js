/**
 * @description: 环境管理工具包 TypeScript 类型定义
 * @author: liyang1057
 * @version: 1.0.0
 * @license: MIT
 */

/**
 * 环境配置映射类型
 */
export interface EnvConfig {
  [key: string]: string;
}

/**
 * 环境管理器配置选项
 */
export interface EnvManagerConfig {
  /** 环境配置映射对象 */
  envConfig?: EnvConfig;
  /** 生产域名列表，默认 [] */
  productionDomains?: string[];
  /** URL参数名，默认 'apiSwitch' */
  paramName?: string;
  /** localStorage键名，默认与paramName相同 */
  storageKey?: string;
  /** 默认环境，默认 'pre' */
  defaultEnv?: string;
  /** 生产环境名称，默认 'prod' */
  productionEnv?: string;
  /** 是否在非生产域名显示URL参数，默认 true */
  showUrlParams?: boolean;
  /** URL同步延时(ms)，默认 100 */
  syncDelay?: number;
  /** 是否启用控制台日志，默认 true */
  enableLog?: boolean;
}

/**
 * 动态配置对象类型
 */
export interface DynamicConfig {
  /** 当前环境的API基础URL */
  readonly url: string;
}

/**
 * 环境管理器接口
 */
export interface EnvManager {
  /**
   * 获取当前环境
   * @returns 当前环境名称
   */
  getCurrentEnv(): string;

  /**
   * 获取当前环境的配置
   * @param _key 配置项的键名，如果不传则返回整个配置对象
   * @returns 配置值或配置对象
   */
  getConfig(_key?: string): any;


  /**
   * 判断是否是生产环境
   * @returns 是否生产环境
   */
  isProduction(): boolean;

  /**
   * 判断是否是生产域名
   * @returns 是否生产域名
   */
  isProductionDomain(): boolean;

  /**
   * 手动切换环境
   * @param _env 目标环境名称
   * @returns 切换是否成功
   */
  switchEnv(_env: string): boolean;

  /**
   * 获取所有可用环境
   * @returns 环境名称数组
   */
  getAvailableEnvs(): string[];

  /**
   * 创建动态配置对象
   * @returns 动态配置对象
   */
  createConfig(): DynamicConfig;

  /**
   * 同步URL参数
   * @param _env 环境名称
   */
  syncUrlParams(_env: string): void;
}

/**
 * 创建环境管理器
 * @param config 配置选项
 * @returns 环境管理器实例
 */
declare function createEnvManager(_config?: EnvManagerConfig): EnvManager;

export default createEnvManager;
export { createEnvManager };