import { ElMessage } from "element-plus";

/**
 * 复制文本到剪贴板
 * @param {String} text 要复制的文本
 */
export const copyText = async (text) => {
  // 空值判断
  if (!text) {
    ElMessage.warning("复制内容不能为空");
    return false;
  }

  try {
    // 现代浏览器 API
    await navigator.clipboard.writeText(text);
    ElMessage.success("复制成功");
    return true;
  } catch (err) {
    // 降级兼容（部分浏览器/环境不支持 navigator.clipboard）
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    ElMessage.success("复制成功");
    return true;
  }
};
