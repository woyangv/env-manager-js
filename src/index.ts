/**
 * @description: 环境管理工具包 - npm包版本
 * @author: woyangv
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
   * @param key 配置项的键名，如果不传则返回整个配置对象
   * @returns 配置值或配置对象
   */
  getConfig(key?: string): any;

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
   * @param env 目标环境名称
   * @returns 切换是否成功
   */
  switchEnv(env: string): boolean;

  /**
   * 获取所有可用环境
   * @returns 环境名称数组
   */
  getAvailableEnvs(): string[];

  /**
   * 同步URL参数
   * @param env 环境名称
   */
  syncUrlParams(env: string): void;
}

/**
 * @description: 获取URL参数的工具函数
 * @param name 参数名
 * @returns 参数值
 */
function getUrlParam(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * @description: 创建环境管理器
 * @param config 配置对象
 * @returns 环境管理器对象
 */
function createEnvManager(config: EnvManagerConfig = {}): EnvManager {
  // 解构配置参数
  const {
    envConfig = {},
    productionDomains = [],
    paramName = 'apiSwitch',
    storageKey = paramName,
    defaultEnv = 'pre',
    productionEnv = 'prod',
    showUrlParams = true,
    syncDelay = 100,
    enableLog = true
  } = config;

  /**
   * @description: 判断是否是生产域名
   * @returns 是否生产域名
   */
  function isProductionDomain(): boolean {
    if (typeof window === 'undefined') return false;
    return productionDomains.includes(window.location.hostname);
  }

  /**
   * @description: 获取当前环境
   * 环境切换逻辑：先确定默认环境，再按优先级覆盖
   * 1. 首先根据域名确定默认环境
   * 2. localStorage 覆盖默认环境
   * 3. URL参数优先级最高，覆盖所有
   * @returns 当前环境名称
   */
  function getCurrentEnv(): string {
    if (typeof window === 'undefined') return defaultEnv;

    // 1. 首先根据域名确定默认环境
    let currentEnv = isProductionDomain() ? productionEnv : defaultEnv;
    if (enableLog) {
      console.log(`🌍 域名默认环境: ${currentEnv}`);
    }

    // 2. localStorage覆盖默认环境
    const savedEnv = localStorage.getItem(storageKey);
    if (savedEnv && envConfig[savedEnv]) {
      currentEnv = savedEnv;
      if (enableLog) {
        console.log(`🌍 localStorage覆盖为: ${savedEnv}环境`);
      }
    }

    // 3. URL参数优先级最高，覆盖所有
    const urlEnv = getUrlParam(paramName);
    if (urlEnv && envConfig[urlEnv]) {
      currentEnv = urlEnv;
      if (enableLog) {
        console.log(`🌍 URL参数最终覆盖为: ${urlEnv}环境`);
      }
    }

    return currentEnv;
  }

  /**
   * @description: 同步URL参数
   * @param env 环境名称
   */
  function syncUrlParams(env: string): void {
    if (typeof window === 'undefined' || !showUrlParams) return;

    // 只有非生产域名才在URL上显示参数，生产域名保持干净
    if (!isProductionDomain()) {
      // 延时同步URL，避免与内部路由跳转冲突
      setTimeout(() => {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set(paramName, env);
        window.history.replaceState({}, '', currentUrl.toString());
      }, syncDelay);
    }
  }

  /**
   * @description: 获取当前环境的配置
   * @param key - 配置项的键名，如果不传则返回整个配置对象
   * @returns 配置值或配置对象
   */
  function getConfig(key?: string): any {
    const currentEnv = getCurrentEnv();

    // 保存当前环境到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, currentEnv);
    }

    // 同步URL参数
    syncUrlParams(currentEnv);

    const config = envConfig[currentEnv];
    if (enableLog) {
      console.log(`🌍 最终使用${currentEnv}环境配置:`, config);
    }

    // 如果指定了key，返回对应的值；否则返回整个配置对象
    return key ? (config as any)?.[key] : config;
  }

  /**
   * @description: 判断是否是生产环境
   * @returns 是否生产环境
   */
  function isProduction(): boolean {
    return getCurrentEnv() === productionEnv;
  }

  /**
   * @description: 手动切换环境
   * @param env 目标环境名称
   * @returns 切换是否成功
   */
  function switchEnv(env: string): boolean {
    if (!envConfig[env]) {
      console.warn(`🌍 环境 ${env} 不存在于配置中`);
      return false;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, env);
      syncUrlParams(env);
    }

    if (enableLog) {
      console.log(`🌍 手动切换到${env}环境: ${envConfig[env]}`);
    }

    return true;
  }

  /**
   * @description: 获取所有可用环境
   * @returns 环境名称数组
   */
  function getAvailableEnvs(): string[] {
    return Object.keys(envConfig);
  }

  // 返回环境管理器对象
  return {
    getCurrentEnv,
    getConfig,
    isProduction,
    isProductionDomain,
    switchEnv,
    getAvailableEnvs,
    syncUrlParams
  };
}

// 默认导出
export default createEnvManager;

// 命名导出（兼容性）
export { createEnvManager };