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

// 新增：解析单个zip二进制，返回内部所有文件
async function parseInnerZip(
  buf: ArrayBuffer
): Promise<{ name: string; data: Uint8Array }[]> {
  const innerZip = await JSZip.loadAsync(buf);
  const fileList: { name: string; data: Uint8Array }[] = [];
  // 遍历zip内所有文件，跳过文件夹
  for (const [fileName, zipObj] of Object.entries(innerZip.files)) {
    if (zipObj.dir) continue;
    const fileBuf = await zipObj.async("uint8array");
    fileList.push({ name: fileName, data: fileBuf });
  }
  return fileList;
}

export const downloadZip = async (urlList: string[]) => {
  if (!urlList || urlList.length === 0) {
    console.error("下载列表为空");
    alert("没有可下载的文件");
    return;
  }

  if (urlList.length === 1) {
    const url = urlList[0];
    let fileName = url.split("/").pop() || "download";
    fileName = fileName.split("?")[0];
    fileName = fileName.replace(/[\s/:*?"<>|\x00-\x1F]/g, "_") || "download";
    await downloadFile(url, fileName);
    return;
  }

  const zip = new JSZip();

  try {
    for (let i = 0; i < urlList.length; i++) {
      const url = urlList[i];
      console.log(`正在下载文件 ${i + 1}/${urlList.length}: ${url}`);

      const res = await fetch(url, {
        headers: { Accept: "*/*" }
      });

      if (!res.ok) {
        console.error(`文件下载失败，状态码: ${res.status}`, url);
        continue;
      }

      const arrayBuffer = await res.arrayBuffer();
      console.log(`文件 ${i + 1} 大小: ${arrayBuffer.byteLength} bytes`);

      if (arrayBuffer.byteLength === 0) {
        console.error(`文件 ${i + 1} 为空`, url);
        continue;
      }

      // 原始文件名
      let originFileName = url.split("/").pop() || `file_${i + 1}`;
      originFileName = originFileName.split("?")[0];
      originFileName =
        originFileName.replace(/[\s/:*?"<>|\x00-\x1F]/g, "_") ||
        `file_${i + 1}`;
      const isZipFile = originFileName.toLowerCase().endsWith(".zip");

      // =========关键改动：是zip就解析内层文件，否则直接添加原文件=========
      if (isZipFile) {
        // 解析内部所有文件
        const innerFiles = await parseInnerZip(arrayBuffer);
        for (const item of innerFiles) {
          // 去重文件名
          let finalName = item.name;
          let cnt = 1;
          while (zip.files[finalName]) {
            const dotIdx = finalName.lastIndexOf(".");
            if (dotIdx > 0) {
              finalName =
                finalName.slice(0, dotIdx) +
                `_${cnt}` +
                finalName.slice(dotIdx);
            } else {
              finalName = finalName + `_${cnt}`;
            }
            cnt++;
          }
          // 内层普通文件统一压缩
          zip.file(finalName, item.data, { compression: "DEFLATE" });
        }
        console.log(
          `源压缩包${originFileName}已解包，提取${innerFiles.length}个文件加入总压缩包`
        );
      } else {
        // 非zip原文件逻辑不变
        let finalFileName = originFileName;
        let counter = 1;
        while (zip.files[finalFileName]) {
          const extIndex = originFileName.lastIndexOf(".");
          if (extIndex > 0) {
            finalFileName =
              originFileName.substring(0, extIndex) +
              `_${counter}` +
              originFileName.substring(extIndex);
          } else {
            finalFileName = originFileName + `_${counter}`;
          }
          counter++;
        }
        zip.file(finalFileName, arrayBuffer, {
          binary: true,
          date: new Date(),
          compression: "DEFLATE"
        });
        console.log(`文件 ${i + 1} 添加成功: ${finalFileName}`);
      }
    }

    const fileCount = Object.keys(zip.files).length;
    if (fileCount === 0) {
      console.error("没有成功添加任何文件");
      alert("没有成功添加任何文件");
      return;
    }

    console.log(`成功添加 ${fileCount} 个文件到ZIP`);

    const zipBlob = await zip.generateAsync({
      type: "blob",
      platform: "DOS",
      comment: "",
      mimeType: "application/zip"
    });

    console.log(`ZIP文件生成成功，大小: ${zipBlob.size} bytes`);

    const blobUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "batch_files.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);

    console.log("ZIP文件下载成功");
  } catch (err) {
    console.error("打包失败:", err);
    alert("打包下载失败，请重试");
  }
};
