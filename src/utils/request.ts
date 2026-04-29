import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { useAppStoreWithOut } from "@/store/app";
import { useUserStoreWithOut } from "@/store/user";

// 扩展 AxiosRequestConfig 以支持自定义属性
declare module "axios" {
  export interface AxiosRequestConfig {
    isFullResponse?: boolean; // 是否返回包含 code, status, message 在内的完整数据
  }
}

// 响应数据接口规范
export interface Result<T = any> {
  code: number;
  status: number; // 1-成功, 0-失败
  message: string;
  msg?: string; // 兼容旧版 API
  data: T;
  requestId?: string;
}

// 分页数据接口规范
export interface PageResult<T = any> {
  pageTotal: number;
  pageList: T[];
  pageNum: number;
  pageSize: number;
}

/** 获取动态基础路径 */
const getDynamicBaseUrl = () => {
  const envBaseApi = import.meta.env.VITE_APP_BASE_API;
  // 如果是开发环境，则使用环境变量的配置
  console.log("import.meta.env.DEV", import.meta.env.DEV);

  if (import.meta.env.DEV) {
    console.log("envBaseApi", envBaseApi);

    return envBaseApi;
  }

  const { protocol, hostname } = window.location;
  const parts = hostname.split(".");
  if (parts.length > 1) {
    if (parts[0] === "gfuc-eu") {
      return `${protocol}//gfuc-api-eu.${parts.slice(1).join(".")}${envBaseApi}`;
    }
    return `${protocol}//${parts[0]}-api.${parts.slice(1).join(".")}${envBaseApi}`;
  }

  return envBaseApi;
};

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: getDynamicBaseUrl(),
  timeout: 10000
});

/** 修改请求基础路径 */
export const setServiceBaseUrl = (url: string) => {
  if (url) {
    service.defaults.baseURL = url;
  }
};

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const appStore = useAppStoreWithOut();
    const userStore = useUserStoreWithOut();

    // 3.3 请求头字段规范
    // 1. Lang: 语种
    if (appStore.lang) {
      config.headers["Lang"] = appStore.lang;
    }

    // 2. User-Time-Zone: 时区
    if (appStore.timezone) {
      config.headers["User-Time-Zone"] = appStore.timezone;
    }

    // 3. Authorization: 认证信息
    if (userStore.token) {
      config.headers["Authorization"] = `Bearer ${userStore.token}`;
    }

    // 4. SiteCode: 站点
    if (appStore.site) {
      config.headers["SiteCode"] = appStore.site;
    }

    // 5. X-Request-ID: 请求id (建议)
    // config.headers["X-Request-ID"] = crypto.randomUUID();

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 如果是下载文件（Blob），直接返回
    if (response.config.responseType === "blob") {
      return response.data;
    }

    const res = response.data as Result;
    // /oms/aceert / order;
    // 3.5 响应数据格式规范
    // status: 接口业务处理状态码：1-成功，0-失败
    if (res.status !== 1) {
      ElMessage({
        message: res.message || res.msg || "Error",
        type: "error",
        duration: 5 * 1000
      });

      // 特殊错误码处理，例如：Token 失效
      if (res.code === 401) {
        if (response.config.url === "/oms/create/order") {
          ElMessage({
            message: "下单Token失效，请联系客服",
            type: "error"
          });
        } else {
          ElMessage({
            message: "Token 失效，请重新登录",
            type: "error"
          });
          const userStore = useUserStoreWithOut();
          userStore.logout();
          location.reload();
        }
      }
      return Promise.reject(new Error(res.message || "Error"));
    } else {
      // 根据配置决定返回完整数据还是仅返回 data 字段
      return response.config.isFullResponse ? res : res.data;
    }
  },
  (error) => {
    console.log("err" + error);
    ElMessage({
      message: error.message,
      type: "error",
      duration: 5 * 1000
    });
    return Promise.reject(error);
  }
);

// 导出封装后的请求函数
const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return service(config) as unknown as Promise<T>;
};

export default request;
