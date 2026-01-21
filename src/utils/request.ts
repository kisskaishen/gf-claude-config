import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ElMessage, ElMessageBox } from "element-plus";
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

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || "/api",
  timeout: 10000
});

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

    // 4. X-Request-ID: 请求id (建议)
    config.headers["X-Request-ID"] = crypto.randomUUID();

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

    // 3.5 响应数据格式规范
    // status: 接口业务处理状态码：1-成功，0-失败
    if (res.status !== 1) {
      ElMessage({
        message: res.message || "Error",
        type: "error",
        duration: 5 * 1000
      });

      // 特殊错误码处理，例如：Token 失效
      if (res.code === 401) {
        const userStore = useUserStoreWithOut();
        ElMessageBox.confirm(
          "登录状态已过期，您可以继续留在该页面，或者重新登录",
          "系统提示",
          {
            confirmButtonText: "重新登录",
            cancelButtonText: "取消",
            type: "warning"
          }
        ).then(() => {
          userStore.logout();
          location.reload();
        });
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
