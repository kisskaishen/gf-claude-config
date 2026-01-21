import type { Lang, Site } from "@/enums";
import request from "@/utils/request";

/**
 * 用户注册
 */
export function postRegister(data: {
  email: string;
  password: string;
  verificationCode: string;
}) {
  return request({
    url: "/user/register",
    method: "post",
    data
  });
}

/**
 * 验证用户注册邮箱是否有效
 */
export function postVerifyEmail(data: { email: string }) {
  return request({
    url: "/user/register/email/verify",
    method: "post",
    data
  });
}

/**
 * 发送邮箱验证码
 */

export function postSendVerificationCode(data: { email: string }) {
  return request({
    url: "/user/register/email/code",
    method: "post",
    data
  });
}

/**
 * 用户登录
 */
export function postLogin(data: { email: string; password: string }) {
  return request({
    url: "/user/login",
    method: "post",
    data
  });
}
/**
 * 保存偏好设置
 */
export function postSavePreferences(data: {
  site: Site;
  timezone: string;
  lang: Lang;
}) {
  return request({
    url: "/user/preferences",
    method: "post",
    data
  });
}
