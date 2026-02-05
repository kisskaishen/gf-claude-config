import { getPublicKey } from "@/api/common";
import JSEncrypt from "jsencrypt";

export async function rsaEncryptPwd(rawPassword: string) {
  // 步骤1：获取后端公钥
  const publicKey = await getPublicKey();
  // 步骤2：初始化JSEncrypt实例
  const encryptor = new JSEncrypt();
  // 步骤3：设置公钥（直接传入后端Base64编码的公钥，无需手动解码）
  encryptor.setPublicKey(publicKey);
  // 步骤4：执行加密（自动PKCS1Padding填充+Base64编码，直接传给后端）
  const encryptedPwd = encryptor.encrypt(rawPassword);
  // 校验加密结果（公钥无效/明文过长会返回false）
  if (!encryptedPwd) {
    throw new Error("密码加密失败，请检查密码长度或公钥有效性");
  }
  return encryptedPwd; // 返回加密后的Base64密文
}
