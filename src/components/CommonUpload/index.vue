<!-- commonUpload.vue -->
<template>
  <div class="common-upload" :style="containerStyle">
    <!-- 图片上传模式 -->
    <template v-if="type === 'image'">
      <el-upload
        ref="uploadRef"
        :action="action"
        :list-type="listType"
        :accept="accept"
        :multiple="multiple"
        :limit="limit"
        :file-list="fileList"
        :show-file-list="showFileList"
        :auto-upload="autoUpload"
        :drag="drag"
        :disabled="disabled"
        :style="uploadStyle"
        :class="uploadClasses"
        :before-upload="handleBeforeUpload"
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-remove="handleRemove"
        :on-exceed="handleExceed"
        :on-preview="handlePreview"
        :http-request="customHttpRequest"
        v-bind="$attrs"
      >
        <!-- 上传按钮区域 -->
        <template #trigger>
          <div
            v-if="!disabled && (!limit || fileList.length < limit)"
            class="upload-trigger"
          >
            <div v-if="drag" class="drag-area" :style="dragAreaStyle">
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">
                <span class="link-text">点击上传</span> 或拖拽文件到这里
              </div>
              <div class="upload-hint">{{ acceptText }}</div>
              <div v-if="imageDimensionHint" class="dimension-hint">
                {{ imageDimensionHint }}
              </div>
            </div>
            <div v-else class="upload-button">
              <el-button :type="buttonType" :icon="Upload" :style="buttonStyle">
                {{ buttonText }}
              </el-button>
              <div v-if="hint" class="upload-hint">{{ hint }}</div>
              <div v-if="imageDimensionHint" class="dimension-hint">
                {{ imageDimensionHint }}
              </div>
            </div>
          </div>
        </template>

        <!-- 预览插槽 -->
        <template v-if="usePreviewSlot" #default="{ file }">
          <slot name="preview" :file="file">
            <div class="preview-container" :style="previewItemStyle">
              <img
                :src="file.url"
                class="preview-image"
                :style="previewImageStyle"
              />
              <div v-if="file.dimensionError" class="dimension-error-badge">
                <el-icon><WarningFilled /></el-icon>
              </div>
            </div>
          </slot>
        </template>

        <!-- 文件列表插槽 -->
        <template #file="{ file }">
          <slot name="file" :file="file">
            <div class="file-item">
              <el-icon><Document /></el-icon>
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <span v-if="file.dimensionError" class="dimension-error">
                <el-icon><WarningFilled /></el-icon>
                尺寸不符
              </span>
            </div>
          </slot>
        </template>
      </el-upload>
    </template>

    <!-- 文件上传模式 -->
    <template v-else>
      <el-upload
        ref="uploadRef"
        :action="action"
        :accept="accept"
        :multiple="multiple"
        :limit="limit"
        :file-list="fileList"
        :show-file-list="showFileList"
        :auto-upload="autoUpload"
        :disabled="disabled"
        :style="uploadStyle"
        :class="uploadClasses"
        :before-upload="handleBeforeUpload"
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-remove="handleRemove"
        :on-exceed="handleExceed"
        :http-request="customHttpRequest"
        v-bind="$attrs"
        :drag="drag"
      >
        <template #trigger>
          <svg-icon name="upload" width="36" height="32"></svg-icon>
          <div class="text-sm text-[#7A869A] font-normal">
            {{ buttonText }}
          </div>
        </template>

        <template #tip>
          <div v-if="hint" class="upload-tip">{{ hint }}</div>
          <!-- <div v-if="showTypeTip" class="upload-tip">
            支持 {{ acceptText }} 格式
          </div> -->
        </template>

        <template #file="{ file }">
          <div class="text-info">{{ $t("web.gfuc.upload_result") }}</div>

          <slot name="file" :file="file">
            <div class="relative file-item">
              <svg-icon name="upload-file" width="40" height="48"></svg-icon>
              <div class="absolute left-0 h-12 w-9 top-2">
                <div
                  class="h-12 text-sm font-normal text-center text-white leading-[48px]"
                >
                  {{ file.name.split(".")[1] }}
                </div>
              </div>
              <div class="flex flex-col flex-1">
                <!-- 文件名 -->
                <div>
                  <span class="file-name">{{ file.name }}</span>
                </div>
                <!-- 进度和状态 -->
                <div class="flex items-center gap-2">
                  <!-- <span class="text-sm text-[#7A869A]">{{ file.status }}</span> -->
                  <span class="text-xs text-[#7A869A] font-normal">{{
                    currentProgress + "%"
                  }}</span>
                  <span class="text-xs text-[#7A869A] font-normal">{{
                    currentProgress === 100
                      ? $t("web.gfuc.upload_success")
                      : $t("web.gfuc.uploading")
                  }}</span>
                  <span class="file-size text-xs text-[#7A869A] font-normal">{{
                    formatFileSize(file.size)
                  }}</span>
                </div>
                <div class="relative w-full h-1">
                  <el-progress
                    :percentage="currentProgress"
                    :show-text="false"
                    class="w-full"
                  />
                  <!-- <el-progress :percentage="file.percent" status="active" /> -->
                </div>
              </div>

              <div class="flex gap-1">
                <el-button link @click="handleRefresh">
                  <el-icon><Refresh /></el-icon>
                </el-button>
                <el-button
                  link
                  @click="handleRemoveFile(file)"
                  class="text-primary"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </slot>
        </template>
      </el-upload>
    </template>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="40%">
      <img :src="previewUrl" class="preview-dialog-image" />
      <div v-if="currentPreviewDimension" class="preview-dimension">
        尺寸: {{ currentPreviewDimension.width }} x
        {{ currentPreviewDimension.height }}
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  Upload,
  Document,
  Picture,
  VideoCameraFilled,
  WarningFilled,
  Refresh,
  Delete
} from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  // 上传类型：image-图片，file-文件
  type: {
    type: String,
    default: "image",
    validator: (value) => ["image", "file"].includes(value)
  },
  // 上传地址
  action: {
    type: String
  },
  // 按钮文字
  buttonText: {
    type: String,
    default: "点击上传"
  },
  // 按钮类型
  buttonType: {
    type: String,
    default: "primary"
  },
  // 是否支持多选
  multiple: {
    type: Boolean,
    default: false
  },
  // 最大上传数量
  limit: {
    type: Number,
    default: Infinity
  },
  // 是否展示文件列表
  showFileList: {
    type: Boolean,
    default: true
  },
  // 是否自动上传
  autoUpload: {
    type: Boolean,
    default: true
  },
  // 是否支持拖拽上传
  drag: {
    type: Boolean,
    default: false
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 允许上传的文件类型
  accept: {
    type: String,
    default: () => ""
  },
  // 自定义请求方法
  httpRequest: {
    type: Function,
    default: null
  },
  // 文件列表 v-model
  modelValue: {
    type: Array,
    default: () => []
  },
  // 文件大小限制（MB）
  maxSize: {
    type: Number,
    default: 10
  },
  // 上传提示信息
  hint: {
    type: String,
    default: ""
  },
  // 图片列表类型
  listType: {
    type: String,
    default: "picture-card",
    validator: (value) => ["text", "picture", "picture-card"].includes(value)
  },
  // 额外参数
  data: {
    type: Object,
    default: () => ({})
  },
  // 请求头
  headers: {
    type: Object,
    default: () => ({})
  },
  // 是否显示类型提示
  showTypeTip: {
    type: Boolean,
    default: true
  },

  // ========== 新增：宽高透传相关 props ==========
  // 组件容器宽度
  width: {
    type: [String, Number],
    default: null
  },
  // 组件容器高度
  height: {
    type: [String, Number],
    default: null
  },
  // 上传区域宽度（适用于 drag 模式或 picture-card 模式）
  uploadWidth: {
    type: [String, Number],
    default: null
  },
  // 上传区域高度
  uploadHeight: {
    type: [String, Number],
    default: null
  },
  // 预览项宽度（picture-card 模式）
  previewItemWidth: {
    type: [String, Number],
    default: null
  },
  // 预览项高度
  previewItemHeight: {
    type: [String, Number],
    default: null
  },
  // 预览图片宽度
  previewImageWidth: {
    type: [String, Number],
    default: null
  },
  // 预览图片高度
  previewImageHeight: {
    type: [String, Number],
    default: null
  },
  // 按钮宽度
  buttonWidth: {
    type: [String, Number],
    default: null
  },
  // 按钮高度
  buttonHeight: {
    type: [String, Number],
    default: null
  },
  // 拖拽区域宽度
  dragAreaWidth: {
    type: [String, Number],
    default: null
  },
  // 拖拽区域高度
  dragAreaHeight: {
    type: [String, Number],
    default: null
  },
  // 图片宽高限制
  imageWidth: {
    type: Number,
    default: null
  },
  imageHeight: {
    type: Number,
    default: null
  },
  // 是否精确匹配宽高
  exactDimension: {
    type: Boolean,
    default: false
  },
  // 最小宽度
  minWidth: {
    type: Number,
    default: null
  },
  // 最大宽度
  maxWidth: {
    type: Number,
    default: null
  },
  // 最小高度
  minHeight: {
    type: Number,
    default: null
  },
  // 最大高度
  maxHeight: {
    type: Number,
    default: null
  },

  // 上传进度
  progress: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits([
  "update:modelValue",
  "success",
  "error",
  "remove",
  "exceed",
  "before-upload",
  "refresh"
]);

const uploadRef = ref(null);
const fileList = ref([]);
const previewVisible = ref(false);
const previewUrl = ref("");
const currentPreviewDimension = ref(null);
const currentProgress = ref(0);
let animationTimer = null;

// 监听 progress 变化
watch(
  () => props.progress,
  (newProgress) => {
    // 清除之前的动画
    if (animationTimer) {
      clearInterval(animationTimer);
      animationTimer = null;
    }

    if (newProgress === 0) {
      currentProgress.value = 0;
    } else if (newProgress === 2) {
      // 直接显示100%
      currentProgress.value = 100;
    } else {
      // 3秒内从0到80%的动画
      const duration = 3000; // 3秒
      const target = 80;
      const startTime = Date.now();

      animationTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * target, target);
        currentProgress.value = Math.round(progress);

        if (elapsed >= duration) {
          currentProgress.value = target;
          clearInterval(animationTimer);
          animationTimer = null;
        }
      }, 16); // 约60fps
    }
  },
  { immediate: true }
);
// 计算容器样式
const containerStyle = computed(() => {
  const style = {};
  if (props.width) {
    style.width =
      typeof props.width === "number" ? `${props.width}px` : props.width;
  }
  if (props.height) {
    style.height =
      typeof props.height === "number" ? `${props.height}px` : props.height;
  }
  return style;
});

// 计算上传组件样式
const uploadStyle = computed(() => {
  const style = {};
  if (props.uploadWidth) {
    style.width =
      typeof props.uploadWidth === "number"
        ? `${props.uploadWidth}px`
        : props.uploadWidth;
  }
  if (props.uploadHeight) {
    style.height =
      typeof props.uploadHeight === "number"
        ? `${props.uploadHeight}px`
        : props.uploadHeight;
  }
  return style;
});

// 计算按钮样式
const buttonStyle = computed(() => {
  const style = {};
  if (props.buttonWidth) {
    style.width =
      typeof props.buttonWidth === "number"
        ? `${props.buttonWidth}px`
        : props.buttonWidth;
  }
  if (props.buttonHeight) {
    style.height =
      typeof props.buttonHeight === "number"
        ? `${props.buttonHeight}px`
        : props.buttonHeight;
  }
  return style;
});

// 计算拖拽区域样式
const dragAreaStyle = computed(() => {
  const style = {};
  if (props.dragAreaWidth) {
    style.width =
      typeof props.dragAreaWidth === "number"
        ? `${props.dragAreaWidth}px`
        : props.dragAreaWidth;
  }
  if (props.dragAreaHeight) {
    style.height =
      typeof props.dragAreaHeight === "number"
        ? `${props.dragAreaHeight}px`
        : props.dragAreaHeight;
  }
  return style;
});

// 计算预览项样式
const previewItemStyle = computed(() => {
  const style = {};
  if (props.previewItemWidth) {
    style.width =
      typeof props.previewItemWidth === "number"
        ? `${props.previewItemWidth}px`
        : props.previewItemWidth;
  }
  if (props.previewItemHeight) {
    style.height =
      typeof props.previewItemHeight === "number"
        ? `${props.previewItemHeight}px`
        : props.previewItemHeight;
  }
  return style;
});

// 计算预览图片样式
const previewImageStyle = computed(() => {
  const style = {};
  if (props.previewImageWidth) {
    style.width =
      typeof props.previewImageWidth === "number"
        ? `${props.previewImageWidth}px`
        : props.previewImageWidth;
  }
  if (props.previewImageHeight) {
    style.height =
      typeof props.previewImageHeight === "number"
        ? `${props.previewImageHeight}px`
        : props.previewImageHeight;
  }
  return style;
});

// 上传组件类名
const uploadClasses = computed(() => ({
  "has-custom-width": props.uploadWidth || props.width,
  "has-custom-height": props.uploadHeight || props.height
}));

// 是否使用预览插槽
const usePreviewSlot = computed(() => props.listType === "picture-card");

// 接受的文件类型文本
const acceptText = computed(() => {
  if (props.accept) {
    return props.accept.replace(/\./g, "").toUpperCase();
  }
  return props.type === "image" ? "JPG, PNG, GIF" : "文件";
});

// 图片尺寸提示文本
const imageDimensionHint = computed(() => {
  const hints = [];
  if (props.imageWidth && props.imageHeight) {
    if (props.exactDimension) {
      hints.push(`尺寸要求: 精确 ${props.imageWidth} x ${props.imageHeight}px`);
    } else {
      hints.push(`建议尺寸: ${props.imageWidth} x ${props.imageHeight}px`);
    }
  } else {
    if (
      props.minWidth ||
      props.maxWidth ||
      props.minHeight ||
      props.maxHeight
    ) {
      const widthHint = [];
      const heightHint = [];
      if (props.minWidth) widthHint.push(`最小 ${props.minWidth}px`);
      if (props.maxWidth) widthHint.push(`最大 ${props.maxWidth}px`);
      if (props.minHeight) heightHint.push(`最小 ${props.minHeight}px`);
      if (props.maxHeight) heightHint.push(`最大 ${props.maxHeight}px`);

      if (widthHint.length) hints.push(`宽度: ${widthHint.join(" · ")}`);
      if (heightHint.length) hints.push(`高度: ${heightHint.join(" · ")}`);
    }
  }
  return hints.join("；");
});

// 检查图片尺寸
const checkImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      let isValid = true;
      let errorMessage = "";

      // 精确匹配
      if (props.imageWidth && props.imageHeight && props.exactDimension) {
        isValid = width === props.imageWidth && height === props.imageHeight;
        if (!isValid) {
          errorMessage = `图片尺寸必须为 ${props.imageWidth}x${props.imageHeight}px，当前为 ${width}x${height}px`;
        }
      }
      // 建议尺寸（警告）
      else if (props.imageWidth && props.imageHeight && !props.exactDimension) {
        isValid = true;
        if (width !== props.imageWidth || height !== props.imageHeight) {
          errorMessage = `建议使用 ${props.imageWidth}x${props.imageHeight}px 的图片，当前为 ${width}x${height}px`;
          ElMessage.warning(errorMessage);
        }
      }
      // 范围限制
      else {
        if (props.minWidth && width < props.minWidth) {
          isValid = false;
          errorMessage = `图片宽度不能小于 ${props.minWidth}px，当前为 ${width}px`;
        } else if (props.maxWidth && width > props.maxWidth) {
          isValid = false;
          errorMessage = `图片宽度不能大于 ${props.maxWidth}px，当前为 ${width}px`;
        } else if (props.minHeight && height < props.minHeight) {
          isValid = false;
          errorMessage = `图片高度不能小于 ${props.minHeight}px，当前为 ${height}px`;
        } else if (props.maxHeight && height > props.maxHeight) {
          isValid = false;
          errorMessage = `图片高度不能大于 ${props.maxHeight}px，当前为 ${height}px`;
        }
      }

      if (isValid) {
        resolve({ width, height, isValid: true });
      } else {
        reject(new Error(errorMessage));
      }
    };
    img.onerror = () => {
      reject(new Error("图片加载失败，无法获取尺寸信息"));
    };
    img.src = URL.createObjectURL(file);
  });
};

// 监听外部modelValue变化
watch(
  () => props.modelValue,
  (newVal) => {
    console.log("外部modelValue变化", newVal);
  },
  { deep: true, immediate: true }
);

// 监听内部fileList变化
watch(
  fileList,
  (newVal) => {
    emit("update:modelValue", newVal);
  },
  { deep: true }
);

// 上传前校验
const handleBeforeUpload = async (file) => {
  // 校验文件类型
  if (props.accept) {
    const acceptTypes = props.accept
      .split(",")
      .map((type) => type.trim().toLowerCase());
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    const isValid = acceptTypes.some((type) => {
      if (type.startsWith(".")) {
        return fileName.endsWith(type);
      }
      return fileType.includes(type) || fileName.endsWith(type);
    });

    if (!isValid) {
      ElMessage.error(
        `不支持的文件类型，请上传 ${acceptText.value} 格式的文件`
      );
      return false;
    }
  }

  // 校验文件大小
  const maxSizeBytes = props.maxSize * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`);
    return false;
  }

  // 校验数量限制
  if (!props.multiple && fileList.value.length >= props.limit) {
    ElMessage.warning(`最多只能上传 ${props.limit} 个文件`);
    return false;
  }

  // 图片尺寸校验
  if (props.type === "image") {
    try {
      const dimension = await checkImageDimensions(file);
      // 保存尺寸信息到文件对象
      file.dimension = dimension;
      file.dimensionError = false;
    } catch (error) {
      if (props.exactDimension) {
        ElMessage.error(error.message);
        return false;
      } else {
        ElMessage.warning(error.message);
        file.dimensionError = true;
      }
    }
  }

  const result = emit("before-upload", file);
  if (result === false) return false;

  return true;
};

// 上传成功
const handleSuccess = (response, file, fileListData) => {
  ElMessage.success(`${file.name} ${t("web.gfuc.upload_success")}`);
  fileList.value = fileListData;
  emit("success", response, file, fileListData);
};

// 上传失败
const handleError = (error, file, fileListData) => {
  ElMessage.error(`${file.name} ${$t("web.gfuc.upload_failed")}`);
  emit("error", error, file, fileListData);
};

// 移除文件
const handleRemove = (file, fileListData) => {
  fileList.value = fileListData;
  emit("remove", file, fileListData);
};

// 超出数量限制
const handleExceed = (files, fileListData) => {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`);
  emit("exceed", files, fileListData);
};

// 预览文件
const handlePreview = (file) => {
  if (props.type === "image") {
    previewUrl.value = file.url;
    currentPreviewDimension.value = file.dimension || null;
    previewVisible.value = true;
  } else {
    window.open(file.url, "_blank");
  }
};

// 自定义上传方法
const customHttpRequest = (options) => {
  if (props.httpRequest) {
    return props.httpRequest(options);
  }
  return null;
};

// 格式化文件大小
const formatFileSize = (size) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const handleRefresh = () => {
  emit("refresh");
};
// 手动删除文件
const handleRemoveFile = (file) => {
  if (uploadRef.value) {
    uploadRef.value.handleRemove(file);
  }
};

// 获取文件图标
const getFileIcon = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  const videoExts = ["mp4", "avi", "mov", "wmv", "flv"];

  if (imageExts.includes(ext)) return Picture;
  if (videoExts.includes(ext)) return VideoCameraFilled;
  return Document;
};

// 导出方法供父组件调用
defineExpose({
  clearFiles: () => {
    fileList.value = [];
  },
  submit: () => {
    if (uploadRef.value) {
      // 触发上传
      const uploadBtn = uploadRef.value.$el.querySelector(".el-upload__input");
      if (uploadBtn) uploadBtn.click();
    }
  }
});
</script>

<style scoped lang="scss">
.common-upload {
  .upload-trigger {
    .drag-area {
      width: 360px;
      height: 180px;
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      background-color: #fafafa;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        background-color: #f0f8ff;
      }

      .upload-icon {
        font-size: 48px;
        color: #8c939d;
        margin-bottom: 12px;
      }

      .upload-text {
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;

        .link-text {
          color: #409eff;
        }
      }

      .upload-hint {
        font-size: 12px;
        color: #909399;
      }

      .dimension-hint {
        margin-top: 8px;
        font-size: 12px;
        color: #e6a23c;
      }
    }

    .upload-button {
      .upload-hint {
        margin-top: 8px;
        font-size: 12px;
        color: #909399;
      }

      .dimension-hint {
        margin-top: 4px;
        font-size: 12px;
        color: #e6a23c;
      }
    }
  }

  .upload-tip {
    margin-top: 8px;
    font-size: 14px;
    color: #bbbdbf;
    font-weight: 400;
  }

  .file-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    width: 100%;

    .file-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 16px;
      font-weight: 400;
      color: #354250;
    }

    .file-size {
      font-size: 12px;
      color: #909399;
    }

    .dimension-error {
      font-size: 12px;
      color: #f56c6c;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .preview-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .preview-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: cover;
    }

    .dimension-error-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background-color: rgba(245, 108, 108, 0.9);
      border-radius: 50%;
      padding: 4px;
      color: white;
      font-size: 12px;
    }
  }

  .preview-dialog-image {
    width: 100%;
    height: auto;
  }

  .preview-dimension {
    margin-top: 12px;
    text-align: center;
    font-size: 14px;
    color: #909399;
  }

  // 自定义宽高样式
  &.has-custom-width,
  &.has-custom-height {
    display: inline-block;
  }

  :deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;

    &.has-custom-width,
    &.has-custom-height {
      width: var(--upload-width, 100px);
      height: var(--upload-height, 100px);
    }
  }

  :deep(.el-upload-dragger) {
    &.has-custom-width,
    &.has-custom-height {
      width: var(--drag-width, 360px);
      height: var(--drag-height, 180px);
    }
  }

  :deep(.el-upload-list__item) {
    &:hover {
      background-color: transparent;
    }

    .el-progress {
      top: 0;
    }
  }
}
</style>
