/**
 * @description: 环境管理工具包 - npm包版本
 * @author: liyang1057
 * @version: 1.0.0
 * @license: MIT
 */

/**
 * @description: 获取URL参数的工具函数
 * @param {string} name 参数名
 * @returns {string|null} 参数值
 */
function getUrlParam(name) {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * @description: 创建环境管理器
 * @param {Object} config 配置对象
 * @param {Object} config.envConfig 环境配置映射对象
 * @param {string[]} config.productionDomains 生产域名列表，默认 []
 * @param {string} config.paramName URL参数名，默认 'apiSwitch'
 * @param {string} config.storageKey localStorage键名，默认与paramName相同
 * @param {string} config.defaultEnv 默认环境，默认 'pre'
 * @param {string} config.productionEnv 生产环境名称，默认 'prod'
 * @param {boolean} config.showUrlParams 是否在非生产域名显示URL参数，默认 true
 * @param {number} config.syncDelay URL同步延时(ms)，默认 100
 * @param {boolean} config.enableLog 是否启用控制台日志，默认 true
 * @returns {Object} 环境管理器对象
 */
function createEnvManager(config = {}) {
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
   * @returns {boolean} 是否生产域名
   */
  function isProductionDomain() {
    if (typeof window === 'undefined') return false;
    return productionDomains.includes(window.location.hostname);
  }

  /**
   * @description: 获取当前环境
   * 环境切换逻辑：先确定默认环境，再按优先级覆盖
   * 1. 首先根据域名确定默认环境
   * 2. localStorage 覆盖默认环境
   * 3. URL参数优先级最高，覆盖所有
   * @returns {string} 当前环境名称
   */
  function getCurrentEnv() {
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
   * @param {string} env 环境名称
   */
  function syncUrlParams(env) {
    if (typeof window === 'undefined' || !showUrlParams) return;

    // 只有非生产域名才在URL上显示参数，生产域名保持干净
    if (!isProductionDomain()) {
      // 延时同步URL，避免与内部路由跳转冲突
      setTimeout(() => {
        const currentUrl = new URL(window.location);
        currentUrl.searchParams.set(paramName, env);
        window.history.replaceState({}, '', currentUrl);
      }, syncDelay);
    }
  }

  /**
   * @description: 获取当前环境的配置
   * @param {string} key - 配置项的键名，如果不传则返回整个配置对象
   * @returns {any} 配置值或配置对象
   */
  function getConfig(key) {
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
    return key ? config[key] : config;
  }


  /**
   * @description: 判断是否是生产环境
   * @returns {boolean} 是否生产环境
   */
  function isProduction() {
    return getCurrentEnv() === productionEnv;
  }

  /**
   * @description: 手动切换环境
   * @param {string} env 目标环境名称
   * @returns {boolean} 切换是否成功
   */
  function switchEnv(env) {
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
   * @returns {string[]} 环境名称数组
   */
  function getAvailableEnvs() {
    return Object.keys(envConfig);
  }

  /**
   * @description: 创建动态配置对象
   * @returns {Object} 动态配置对象
   */
  function createConfig() {
    return {
      get url() {
        return getConfig();
      }
    };
  }

  // 返回环境管理器对象
  return {
    getCurrentEnv,
    getConfig,
    isProduction,
    isProductionDomain,
    switchEnv,
    getAvailableEnvs,
    createConfig,
    syncUrlParams
  };
}

// 默认导出
export default createEnvManager;

// 命名导出（兼容性）
export { createEnvManager };