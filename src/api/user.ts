import request from "@/utils/request";

/**
 * 用户注册-账号核对
 */
export function postCheckAccount(data: { email: string }) {
  return request({
    url: "/user/email/check",
    method: "post",
    data
  });
}

/**
 * 用户注册
 */
export function postRegister(data: {
  email: string;
  password: string;
  verificationCode: string;
  /** 协议留痕（前端自定义） */
  protocolTracing: string;
}) {
  return request({
    url: "/user/register",
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
 * 获取验证码
 */
export function getVerifyCode() {
  return request({
    url: "/user/verifyCode",
    method: "get"
  });
}

/**
 * 用户登录
 */
export function postLogin(data: {
  email: string;
  password: string;
  code: string;
  /** 验证码 */ uuid: string; /*** 验证码UUID */
}) {
  return request({
    url: "/user/login",
    method: "post",
    data
  });
}
/** 获取用户信息 */
export function getUserInfo() {
  return request({
    url: `/userinfo`,
    method: "get"
  });
}
/**
 * 更新用户信息
 */
export function postUpdateUserInfo(data: any) {
  return request({
    url: "/userinfo/update",
    method: "post",
    data
  });
}

/**
 * 开通服务
 */
export function postOpenService(data: {
  /** 货量预估 */
  shippingVolume?: string;
  /** 发货频率 */
  shippingFrequency?: string;
  email?: string;
  name?: string;
  country?: any[];
  phone?: string;
}) {
  return request({
    url: "/fms/customer/lead",
    method: "post",
    data
  });
}
