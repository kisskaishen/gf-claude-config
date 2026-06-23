<template>
  <Teleport to="body">
    <div
      v-for="ball in flyingBalls"
      :key="ball.id"
      class="fly-ball"
      :style="ball.style"
    >
      <svg-icon name="upload-download" width="18" height="18" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

defineOptions({
  name: "FlyToTaskCenter"
});

interface Props {
  /** 起始触发元素（点击的按钮 DOM） */
  fromElement: HTMLElement | null;
  /** 控制飞入动画启动 */
  visible: boolean;
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "done"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

interface FlyingBall {
  id: number;
  style: Record<string, string>;
}

const flyingBalls = ref<FlyingBall[]>([]);
let ballId = 0;

/** 获取目标元素（导航栏任务中心图标） */
const getTargetRect = (): DOMRect | null => {
  const target = document.getElementById("tour-task-center");
  return target?.getBoundingClientRect() ?? null;
};

/**
 * 二次贝塞尔曲线插值
 * B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
 */
const bezierPoint = (
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): { x: number; y: number } => {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y
  };
};

/** 弹跳缩放缓动：在到达时放大再缩小 */
const bounceScale = (t: number): number => {
  // 前半段（飞行阶段）保持正常大小
  if (t < 0.85) return 1;
  // 后半段（落地阶段）先放大再缩小
  const bt = (t - 0.85) / 0.15;
  return 1 + 0.3 * Math.sin(bt * Math.PI);
};

/** 执行单次飞入动画：沿贝塞尔曲线飞行 */
const doFly = (startRect: DOMRect): Promise<void> => {
  return new Promise((resolve) => {
    const targetRect = getTargetRect();
    if (!targetRect) {
      resolve();
      return;
    }

    const id = ++ballId;
    const ballRadius = 18; // 小球半径 (36/2)

    // 起点：按钮中心
    const p0 = {
      x: startRect.left + startRect.width / 2 - ballRadius,
      y: startRect.top + startRect.height / 2 - ballRadius
    };
    // 终点：任务中心图标中心
    const p2 = {
      x: targetRect.left + targetRect.width / 2 - ballRadius,
      y: targetRect.top + targetRect.height / 2 - ballRadius
    };
    // 控制点：水平中点 + 向上偏移，形成弧线
    const p1 = {
      x: (p0.x + p2.x) / 2,
      y: Math.min(p0.y, p2.y) - 80
    };

    // 添加飞行小球到 DOM
    flyingBalls.value.push({
      id,
      style: {
        left: `${p0.x}px`,
        top: `${p0.y}px`,
        opacity: "1"
      }
    });

    // 动画参数
    const duration = 750; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // 缓出效果
      const eased = 1 - Math.pow(1 - t, 3);

      const pos = bezierPoint(eased, p0, p1, p2);
      const scale = bounceScale(eased);
      const opacity = t > 0.9 ? 1 - (t - 0.9) / 0.1 : 1;

      const ball = flyingBalls.value.find((b) => b.id === id);
      if (ball) {
        ball.style = {
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          opacity: `${opacity}`,
          transform: `scale(${scale})`
        };
      }

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        // 动画结束，清理
        flyingBalls.value = flyingBalls.value.filter((b) => b.id !== id);
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });
};

watch(
  () => props.visible,
  async (val) => {
    if (!val || !props.fromElement) return;

    const startRect = props.fromElement.getBoundingClientRect();
    await doFly(startRect);

    emit("update:visible", false);
    emit("done");
  }
);
</script>

<style lang="scss" scoped>
.fly-ball {
  position: fixed;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--el-color-primary);
  pointer-events: none;
  background: rgb(64 158 255 / 12%);
  border-radius: 50%;
  will-change: left, top, transform, opacity;
}
</style>
