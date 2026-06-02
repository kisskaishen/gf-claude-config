import JSZip from "jszip";
import FileSaver from "file-saver";

/**
 * 通用下载函数
 * @param url 文件链接
 * @param fileName 文件名（可选）
 */
export const downloadFile = async (url: string | Blob, fileName?: string) => {
  try {
    let blob: Blob;
    if (typeof url === "string") {
      const response = await fetch(url);
      blob = await response.blob();
    } else {
      blob = url;
    }
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

// 批量打包下载

// export const downloadZip = async (urlList: string[]) => {
//   const zip = new JSZip();

//   try {
//     // 1. 逐个添加文件（保持你原有的逻辑，仅优化文件名）
//     for (let i = 0; i < urlList.length; i++) {
//       const url = urlList[i];
//       const res = await fetch(url);
//       if (!res.ok) throw new Error(`文件请求失败：${res.status}`);
//       const blob = await res.blob();

//       // 强制处理文件名：去除非ASCII字符，避免macOS解压乱码/失败
//       let fileName = url.split("/").pop() || `file_${i + 1}`;
//       fileName = fileName.replace(/[^\x00-\x7F]/g, "") || `file_${i + 1}`;

//       zip.file(fileName, blob);
//     }

//     // 2. 关键：修改JSZip生成配置，专门兼容macOS
//     const zipBlob = await zip.generateAsync({
//       type: "blob",
//       compression: "DEFLATE",
//       compressionLevel: 6,
//       platform: "UNIX", // macOS是UNIX系统，指定平台可避免目录/权限问题
//       comment: "", // 清空注释，避免部分工具不识别
//       mimeType: "application/zip"
//     });

//     // 3. 下载（文件名尽量用英文，避免macOS解压时识别问题）
//     FileSaver.saveAs(zipBlob, "batch_files.zip");
//   } catch (err) {
//     console.error("打包下载失败：", err);
//     alert("部分文件下载失败，请重试");
//   }
// };

export const downloadZip = async (urlList: string[]) => {
  // 验证URL列表
  if (!urlList || urlList.length === 0) {
    console.error("下载列表为空");
    alert("没有可下载的文件");
    return;
  }

  // 使用原生方式创建ZIP（最兼容的方式）
  const zip = new JSZip();

  try {
    // 并行下载所有文件
    const downloadPromises = urlList.map(async (url, index) => {
      console.log(`正在下载文件 ${index + 1}/${urlList.length}: ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "*/*"
          }
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          console.error(`文件下载失败，状态码: ${res.status}，URL: ${url}`);
          return null;
        }

        // 关键：使用arrayBuffer确保二进制数据完整性
        const arrayBuffer = await res.arrayBuffer();
        console.log(`文件 ${index + 1} 大小: ${arrayBuffer.byteLength} bytes`);

        if (arrayBuffer.byteLength === 0) {
          console.error(`文件 ${index + 1} 为空，URL: ${url}`);
          return null;
        }

        // 文件名处理：移除所有特殊字符和空格
        let fileName = url.split("/").pop() || `file_${index + 1}`;
        // 移除URL查询参数（如果有的话）
        fileName = fileName.split("?")[0];
        // 替换空格和所有危险字符
        fileName =
          fileName.replace(/[\s/:*?"<>|\x00-\x1F]/g, "_") ||
          `file_${index + 1}`;

        return { fileName, arrayBuffer };
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        console.error(`文件 ${index + 1} 下载异常:`, fetchErr);
        return null;
      }
    });

    // 等待所有下载完成
    const results = await Promise.all(downloadPromises);

    // 将有效文件添加到ZIP
    let fileCount = 0;
    for (const result of results) {
      if (result) {
        zip.file(result.fileName, result.arrayBuffer, {
          binary: true
        });
        fileCount++;
      }
    }

    if (fileCount === 0) {
      console.error("没有成功下载任何文件");
      alert("没有成功下载任何文件");
      return;
    }

    console.log(`成功添加 ${fileCount} 个文件到ZIP`);

    // 生成ZIP文件（使用最兼容的配置）
    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionLevel: 6,
      // 使用DOS格式确保最大兼容性
      platform: "DOS",
      comment: "",
      mimeType: "application/zip"
    });

    console.log(`ZIP文件生成成功，大小: ${zipBlob.size} bytes`);

    // 验证ZIP文件
    if (zipBlob.size < 10) {
      console.error("生成的ZIP文件过小");
      alert("生成的ZIP文件无效");
      return;
    }

    // 使用原生方式触发下载（不依赖file-saver）
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "batch_files.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("ZIP文件下载成功");
  } catch (err) {
    console.error("打包失败:", err);
    alert("打包下载失败，请重试");
  }
};
