import * as bcrypt from "bcryptjs";

/**
 * 使用 bcryptjs 对密码进行哈希处理
 * @param password 原始密码
 * @param saltRounds 盐的轮数，默认为 10
 * @returns 哈希后的密码
 */
export async function hashPassword(
  password: string,
  saltRounds: number = 10
): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        reject(err);
      } else if (hash === undefined) {
        reject(new Error("Hash generation failed"));
      } else {
        resolve(hash);
      }
    });
  });
}

/**
 * 校验密码是否匹配
 * @param password 原始密码
 * @param hash 哈希后的密码
 * @returns 是否匹配
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, isMatch) => {
      if (err) {
        reject(err);
      } else if (isMatch === undefined) {
        reject(new Error("Password comparison failed"));
      } else {
        resolve(isMatch);
      }
    });
  });
}
