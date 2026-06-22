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
        :show-file-list="false"
        :auto-upload="autoUpload"
        :disabled="disabled"
        :style="uploadStyle"
        drag
        :class="[uploadClasses, 'image-upload']"
        :before-upload="handleBeforeUpload"
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-remove="handleRemove"
        :on-exceed="handleExceed"
        :on-preview="handlePreview"
        :http-request="customHttpRequest"
        :on-change="handleChange"
        v-bind="$attrs"
      >
        <!-- 上传按钮区域：虚线框样式 -->
        <template #trigger>
          <div
            v-if="!disabled"
            class="image-upload-trigger"
            :class="{ 'is-full': limit && fileList.length >= limit }"
          >
            <svg class="upload-icon" viewBox="0 0 40 40" fill="none">
              <rect
                x="4"
                y="6"
                width="32"
                height="28"
                rx="3"
                stroke="#909399"
                stroke-width="2"
              />
              <circle cx="14" cy="16" r="3" stroke="#909399" stroke-width="2" />
              <path
                d="M8 30l8-10 6 8 4-5 6 7"
                stroke="#909399"
                stroke-width="2"
                stroke-linejoin="round"
              />
            </svg>
            <div class="upload-text">{{ buttonText }}</div>
            <div v-if="hint" class="upload-hint">{{ hint }}</div>
          </div>
        </template>
      </el-upload>

      <!-- 图片预览网格 -->
      <div v-if="fileList.length > 0" class="image-preview-grid">
        <div
          v-for="(file, index) in fileList"
          :key="index"
          class="image-preview-item"
          @click="handlePreview(file)"
        >
          <img :src="file.url" :alt="file.name" />
          <div v-if="file.dimensionError" class="dimension-error-badge">
            <el-icon><WarningFilled /></el-icon>
          </div>
          <el-icon
            class="preview-remove-btn"
            @click.stop="handleRemoveFile(file)"
          >
            <Close />
          </el-icon>
        </div>
      </div>
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
          <svg-icon name="upload" width="62" height="62"></svg-icon>
          <div class="mt-6 text-base font-normal text-black">
            {{ buttonText }}
          </div>
          <div v-if="hint" class="text-xs text-[#999999]">{{ hint }}</div>
          <div v-if="hint2" class="mt-2 text-sm text-[#999999]">
            {{ hint2 }}
          </div>
        </template>

        <template #tip>
          <!-- <div v-if="showTypeTip" class="upload-tip">
            支持 {{ acceptText }} 格式
          </div> -->
        </template>

        <template #file="{ file }">
          <div class="text-info">{{ $t("web.gfuc.upload_result") }}</div>
          <slot name="file" :file="file">
            <div class="relative file-item">
              <svg-icon name="upload-file" width="40" height="48"></svg-icon>
              <div class="absolute left-0 h-12 top-2 w-9">
                <div
                  class="h-12 text-sm font-normal text-center text-white leading-[48px]"
                >
                  {{ file.name.split(".")[1] }}
                </div>
              </div>
              <div class="flex flex-col flex-1 min-w-0">
                <!-- 文件名 -->
                <div>
                  <span
                    class="w-full overflow-hidden whitespace-normal file-name"
                    >{{ file.name }}</span
                  >
                </div>
                <!-- 进度和状态 -->
                <div class="flex items-center gap-2">
                  <!-- <span class="text-sm text-info">{{ file.status }}</span> -->
                  <span class="text-xs font-normal text-info">{{
                    currentProgress + "%"
                  }}</span>
                  <span
                    class="text-xs font-normal"
                    :class="
                      currentProgress === 100 ? 'text-success' : 'text-info'
                    "
                    >{{
                      currentProgress === 100
                        ? $t("web.gfuc.upload_success")
                        : $t("web.gfuc.uploading")
                    }}</span
                  >
                  <!-- <span class="text-xs font-normal file-size text-info">{{
                    formatFileSize(file.size)
                  }}</span> -->
                </div>
                <div class="relative w-full h-1">
                  <el-progress
                    :percentage="currentProgress"
                    :show-text="false"
                    class="w-full"
                    :color="currentProgress === 100 ? ['#00b578'] : ['#fc4c02']"
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
  Picture,
  VideoCameraFilled,
  WarningFilled,
  Refresh,
  Delete,
  Close
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
  // 上传提示信息2
  hint2: {
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
  },
  // 是否需要前端提示
  needFrontMsg: {
    type: Boolean,
    default: true
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

// 上传组件类名
const uploadClasses = computed(() => ({
  "has-custom-width": props.uploadWidth || props.width,
  "has-custom-height": props.uploadHeight || props.height
}));

// 接受的文件类型文本
const acceptText = computed(() => {
  if (props.accept) {
    return props.accept.replace(/\./g, "").toUpperCase();
  }
  return props.type === "image"
    ? "JPG, PNG, GIF"
    : t("web.gfuc.file" /** 文件 **/);
});

// 图片尺寸提示文本
const imageDimensionHint = computed(() => {
  const hints = [];
  if (props.imageWidth && props.imageHeight) {
    if (props.exactDimension) {
      hints.push(
        t(
          "web.gfuc.size_requirement_exact" /** 尺寸要求: 精确 {width} x {height}px **/,
          {
            width: props.imageWidth,
            height: props.imageHeight
          }
        )
      );
    } else {
      hints.push(
        t(
          "web.gfuc.size_requirement_recommend" /** 建议尺寸: {width} x {height}px **/,
          {
            width: props.imageWidth,
            height: props.imageHeight
          }
        )
      );
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
      if (props.minWidth)
        widthHint.push(
          t("web.gfuc.min_size" /** 最小 {size}px **/, { size: props.minWidth })
        );
      if (props.maxWidth)
        widthHint.push(
          t("web.gfuc.max_size" /** 最大 {size}px **/, { size: props.maxWidth })
        );
      if (props.minHeight)
        heightHint.push(
          t("web.gfuc.min_size" /** 最小 {size}px **/, {
            size: props.minHeight
          })
        );
      if (props.maxHeight)
        heightHint.push(
          t("web.gfuc.max_size" /** 最大 {size}px **/, {
            size: props.maxHeight
          })
        );

      if (widthHint.length)
        hints.push(
          t("web.gfuc.dimension_width" /** 宽度: {values} **/, {
            values: widthHint.join(" · ")
          })
        );
      if (heightHint.length)
        hints.push(
          t("web.gfuc.dimension_height" /** 高度: {values} **/, {
            values: heightHint.join(" · ")
          })
        );
    }
  }
  return hints.join(t("web.gfuc.dimension_separator" /** ； **/));
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
          errorMessage = t(
            "web.gfuc.image_dimension_exact" /** 图片尺寸必须为 {width}x{height}px，当前为 {curWidth}x{curHeight}px **/,
            {
              width: props.imageWidth,
              height: props.imageHeight,
              curWidth: width,
              curHeight: height
            }
          );
        }
      }
      // 建议尺寸（警告）
      else if (props.imageWidth && props.imageHeight && !props.exactDimension) {
        isValid = true;
        if (width !== props.imageWidth || height !== props.imageHeight) {
          errorMessage = t(
            "web.gfuc.image_dimension_recommend" /** 建议使用 {width}x{height}px 的图片，当前为 {curWidth}x{curHeight}px **/,
            {
              width: props.imageWidth,
              height: props.imageHeight,
              curWidth: width,
              curHeight: height
            }
          );
          ElMessage.warning(errorMessage);
        }
      }
      // 范围限制
      else {
        if (props.minWidth && width < props.minWidth) {
          isValid = false;
          errorMessage = t(
            "web.gfuc.image_width_min" /** 图片宽度不能小于 {min}px，当前为 {cur}px **/,
            { min: props.minWidth, cur: width }
          );
        } else if (props.maxWidth && width > props.maxWidth) {
          isValid = false;
          errorMessage = t(
            "web.gfuc.image_width_max" /** 图片宽度不能大于 {max}px，当前为 {cur}px **/,
            { max: props.maxWidth, cur: width }
          );
        } else if (props.minHeight && height < props.minHeight) {
          isValid = false;
          errorMessage = t(
            "web.gfuc.image_height_min" /** 图片高度不能小于 {min}px，当前为 {cur}px **/,
            { min: props.minHeight, cur: height }
          );
        } else if (props.maxHeight && height > props.maxHeight) {
          isValid = false;
          errorMessage = t(
            "web.gfuc.image_height_max" /** 图片高度不能大于 {max}px，当前为 {cur}px **/,
            { max: props.maxHeight, cur: height }
          );
        }
      }

      if (isValid) {
        resolve({ width, height, isValid: true });
      } else {
        reject(new Error(errorMessage));
      }
    };
    img.onerror = () => {
      reject(
        new Error(
          t("web.gfuc.image_load_failed" /** 图片加载失败，无法获取尺寸信息 **/)
        )
      );
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
        t(
          "web.gfuc.unsupported_file_type" /** 不支持的文件类型，请上传 {accept} 格式的文件 **/,
          { accept: acceptText.value }
        )
      );
      return false;
    }
  }

  // 校验文件大小
  const maxSizeBytes = props.maxSize * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    ElMessage.error(
      t("web.gfuc.file_size_exceeded" /** 文件大小不能超过 {size}MB **/, {
        size: props.maxSize
      })
    );
    return false;
  }

  // 校验数量限制
  if (!props.multiple && fileList.value.length >= props.limit) {
    ElMessage.warning(
      t("web.gfuc.file_count_exceeded" /** 最多只能上传 {limit} 个文件 **/, {
        limit: props.limit
      })
    );
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
  if (props.needFrontMsg) {
    ElMessage.success(`${file.name} ${t("web.gfuc.upload_success")}`);
  }
  fileList.value = fileListData;
  emit("success", response, file, fileListData);
};

// 上传失败
const handleError = (error, file, fileListData) => {
  if (props.needFrontMsg) {
    ElMessage.error(`${file.name} ${t("web.gfuc.upload_failed")}`);
  }
  emit("error", error, file, fileListData);
};

// 文件列表变化（auto-upload=false 时靠此事件同步文件列表）
const handleChange = (file, fileListData) => {
  fileList.value = fileListData;
};

// 移除文件
const handleRemove = (file, fileListData) => {
  fileList.value = fileListData;
  emit("remove", file, fileListData);
};

// 超出数量限制
const handleExceed = (files, fileListData) => {
  ElMessage.warning(t("web.gfuc.upload_exceed_tip", { limit: props.limit }));
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
    // 清空文件列表
    fileList.value = [];
    // 重置预览状态
    previewVisible.value = false;
    previewUrl.value = "";
    currentPreviewDimension.value = null;
    // 重置上传进度
    currentProgress.value = 0;
    // 清除动画定时器
    if (animationTimer) {
      clearInterval(animationTimer);
      animationTimer = null;
    }
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
  // ===== 图片上传虚线触发区 =====
  .image-upload-trigger {
    @apply w-full;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 120px;
    min-height: 120px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    background: #fafbfc;
    border-radius: 10px;
    transition:
      border-color 0.2s,
      background-color 0.2s;

    &:hover {
      background: #fff8f0;
      border-color: #e66c28;
    }

    &.is-full {
      cursor: not-allowed;
      opacity: 0.5;

      &:hover {
        background: #fafbfc;
        border-color: transparent;
      }
    }

    .upload-icon {
      width: 36px;
      height: 36px;
      margin-bottom: 8px;
      color: #909399;
    }

    .upload-text {
      font-size: 14px;
      color: #606266;
    }

    .upload-hint {
      margin-top: 4px;
      font-size: 12px;
      color: #909399;
    }
  }

  // ===== 图片预览网格 =====
  .image-preview-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
  }

  // ===== 图片预览项 =====
  .image-preview-item {
    position: relative;
    width: 88px;
    height: 88px;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid #ebeef5;
    border-radius: 8px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .dimension-error-badge {
      position: absolute;
      top: 4px;
      left: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      font-size: 12px;
      color: #fff;
      background: rgb(245 108 108 / 90%);
      border-radius: 50%;
    }

    .preview-remove-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      font-size: 12px;
      color: #fff;
      cursor: pointer;
      background: rgb(0 0 0 / 55%);
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.15s;

      &:hover {
        background: rgb(229 69 69 / 85%);
      }
    }

    &:hover .preview-remove-btn {
      opacity: 1;
    }
  }
}

// ===== 文件模式上传提示 =====

// ===== 文件模式下文件列表项 =====
.file-item {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 8px 0;

  .file-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 16px;
    font-weight: 400;
    color: #354250;
  }

  .file-size {
    font-size: 12px;
    color: #909399;
  }

  .dimension-error {
    display: flex;
    gap: 4px;
    align-items: center;
    font-size: 12px;
    color: #f56c6c;
  }
}

// ===== 图片预览对话框 =====
.preview-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  .preview-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
  }

  .dimension-error-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    padding: 4px;
    font-size: 12px;
    color: white;
    background-color: rgb(245 108 108 / 90%);
    border-radius: 50%;
  }
}

.preview-dialog-image {
  width: 100%;
  height: auto;
}

.preview-dimension {
  margin-top: 12px;
  font-size: 14px;
  color: #909399;
  text-align: center;
}

// ===== 自定义宽高样式 =====
.common-upload {
  &.has-custom-width,
  &.has-custom-height {
    display: inline-block;
  }
}

// ===== Element Plus 覆盖 =====
:deep(.el-upload-list) {
  width: 100%;
}

:deep(.el-upload--picture-card) {
  // width: 100px;
  // height: 100px;
  @apply w-full h-full;

  &.has-custom-width,
  &.has-custom-height {
    width: var(--upload-width, 100px);
    height: var(--upload-height, 100px);
  }
}

:deep(.el-upload-dragger) {
  padding: 0;

  &:hover {
    border-color: transparent;
  }

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
</style>
