/**
 * 通用下载函数
 * @param url 文件链接
 * @param fileName 文件名（可选）
 */
export const downloadFile = async (url: string, fileName?: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;

    // 优先使用传入的文件名，否则尝试从url或response headers中提取（此处简化为默认）
    link.download = fileName || url.substring(url.lastIndexOf("/") + 1);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.warn("Download failed, opening in new tab", error);
    window.open(url, "_blank");
  }
};
