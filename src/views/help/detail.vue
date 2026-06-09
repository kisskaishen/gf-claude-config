<template>
  <page-container>
    <CommonTitle
      :title="$t('web.gfuc.help_center')"
      :tip="$t('web.gfuc.help_center_desc')"
    />

    <div class="flex mt-6 gap-6">
      <!-- 主内容区 -->
      <div class="flex-1 min-w-0">
        <!-- 返回按钮 -->
        <div class="mb-6">
          <el-button
            text
            class="flex items-center p-0 text-text-secondary hover:text-primary"
            @click="goBack"
          >
            <el-icon class="mr-1"><ArrowLeft /></el-icon>
            {{ $t("web.gfuc.help_back") }}
          </el-button>
        </div>

        <!-- 文章内容 -->
        <div class="p-8 bg-white rounded-lg shadow-sm">
          <h1 class="mb-4 text-xl font-bold text-text-regular">
            {{ article?.title }}
          </h1>
          <div class="mb-6 text-xs text-info">
            {{ article?.createdAt }}
          </div>
          <div class="article-content leading-relaxed text-text-secondary">
            <div v-for="(paragraph, index) in contentParagraphs" :key="index">
              <template v-if="paragraph.startsWith('## ')">
                <h2 class="mt-6 mb-3 text-base font-semibold text-text-regular">
                  {{ paragraph.replace("## ", "") }}
                </h2>
              </template>
              <template v-else-if="paragraph.startsWith('### ')">
                <h3 class="mt-4 mb-2 text-sm font-semibold text-text-regular">
                  {{ paragraph.replace("### ", "") }}
                </h3>
              </template>
              <template v-else-if="paragraph.startsWith('- ')">
                <ul class="pl-4 mb-2 list-disc">
                  <li>{{ paragraph.replace("- ", "") }}</li>
                </ul>
              </template>
              <template v-else-if="paragraph.match(/^\d+\.\s/)">
                <ol class="pl-4 mb-2 list-decimal">
                  <li>{{ paragraph.replace(/^\d+\.\s/, "") }}</li>
                </ol>
              </template>
              <template v-else-if="paragraph.trim()">
                <p class="mb-3 text-sm leading-7">{{ paragraph }}</p>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 侧边栏 -->
      <HelpSidebar
        :categories="categories"
        :active-category="articleCategoryId"
        @select-category="handleCategorySelect"
      />
    </div>
  </page-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";
import CommonTitle from "@/components/CommonTitle/index.vue";
import HelpSidebar from "./components/HelpSidebar.vue";
import type { HelpCategory, HelpArticle } from "./types";

defineOptions({
  name: "HelpDetail"
});

const route = useRoute();
const router = useRouter();

// Mock 分类数据
const categories: HelpCategory[] = [
  {
    id: "shipping",
    title: "发货运输",
    i18nKey: "web.gfuc.help_category_shipping",
    icon: "order",
    description: "了解发货流程、运输时效、跟踪包裹等相关信息",
    articleCount: 6
  },
  {
    id: "billing",
    title: "费用问题",
    i18nKey: "web.gfuc.help_category_billing",
    icon: "finance",
    description: "查询运费标准、账单说明、充值退款等费用相关问题",
    articleCount: 8
  },
  {
    id: "account",
    title: "账户相关",
    i18nKey: "web.gfuc.help_category_account",
    icon: "setting",
    description: "账户注册、登录、信息修改、安全设置等操作指南",
    articleCount: 5
  },
  {
    id: "technical",
    title: "技术问题",
    i18nKey: "web.gfuc.help_category_technical",
    icon: "problem",
    description: "系统操作、API对接、常见错误码等技术问题解答",
    articleCount: 4
  }
];

// Mock 文章数据
const articles: HelpArticle[] = [
  {
    id: "art-1",
    categoryId: "shipping",
    title: "如何创建新的物流订单？",
    summary:
      "详细说明在系统中创建物流订单的完整流程，包括填写寄件人、收件人信息等步骤",
    content:
      "## 如何创建新的物流订单\n\n1. 登录您的GOFO账户\n2. 在导航栏中点击「订单管理」→「单票下单」\n3. 填写寄件人信息，包括姓名、地址、联系方式等\n4. 填写收件人信息\n5. 填写包裹信息，包括重量、尺寸、产品类型等\n6. 选择运输渠道和服务\n7. 确认订单信息并提交\n8. 支付运费后即可获取面单文件",
    createdAt: "2024-12-01"
  },
  {
    id: "art-2",
    categoryId: "shipping",
    title: "如何批量导入订单？",
    summary: "学习使用Excel模板批量导入多个物流订单，提升下单效率",
    content:
      "## 如何批量导入订单\n\n批量导入功能可以帮助您一次性创建多个订单，大大提高工作效率。\n\n### 操作步骤\n1. 进入「订单管理」→「批量下单」\n2. 下载官方Excel模板\n3. 按照模板格式填写订单信息\n4. 上传填写好的文件\n5. 系统将自动解析并创建订单\n6. 查看导入结果，处理异常数据",
    createdAt: "2024-12-05"
  },
  {
    id: "art-3",
    categoryId: "shipping",
    title: "如何查询物流轨迹？",
    summary: "通过运单号查询包裹的实时运输状态和轨迹信息",
    content:
      "## 如何查询物流轨迹\n\n您可以通过以下方式查询包裹的物流信息：\n\n### 方法一：在系统内查询\n1. 登录账户，进入「订单管理」→「订单列表」\n2. 找到需要查询的订单\n3. 点击「查看轨迹」查看详细物流信息\n\n### 方法二：在首页查询\n在首页顶部输入运单号，点击查询即可查看最新物流状态",
    createdAt: "2024-12-10"
  },
  {
    id: "art-4",
    categoryId: "billing",
    title: "如何查看账户余额和充值？",
    summary: "了解如何查询账户余额并进行在线充值操作",
    content:
      "## 账户余额与充值\n\n### 查看余额\n进入「财务管理」→「余额」页面，可以查看您的可用余额、账号余额、信用额度及冻结金额。\n\n### 在线充值\n1. 进入「财务管理」→「充值」页面\n2. 输入充值金额\n3. 选择支付方式\n4. 完成支付\n5. 充值成功后余额将立即更新",
    createdAt: "2024-12-15"
  },
  {
    id: "art-5",
    categoryId: "billing",
    title: "如何下载运费账单？",
    summary: "查看并下载历史运费账单，方便财务对账和记录保存",
    content:
      "## 下载运费账单\n\n1. 进入「财务管理」→「账单」页面\n2. 选择需要查看的账单周期\n3. 点击「下载账单」按钮\n4. 账单将以Excel格式下载到您的电脑\n\n账单包含该周期内所有订单的详细费用信息，包括运费、附加费等。",
    createdAt: "2024-12-20"
  },
  {
    id: "art-6",
    categoryId: "billing",
    title: "如何进行退款申请？",
    summary: "了解退款政策和退款申请流程",
    content:
      "## 退款申请流程\n\n### 退款条件\n- 订单未发货或运输异常\n- 重复支付\n- 其他经客服确认可退款的情况\n\n### 申请步骤\n1. 联系客服说明退款原因\n2. 提供相关订单号和凭证\n3. 客服审核通过后安排退款\n4. 退款金额将返还至您的账户余额\n\n### 处理时间\n退款申请一般会在3-5个工作日内处理完成。",
    createdAt: "2024-12-25"
  },
  {
    id: "art-7",
    categoryId: "account",
    title: "如何修改账户信息？",
    summary: "修改个人资料、联系方式等账户基本信息",
    content:
      "## 修改账户信息\n\n1. 登录您的GOFO账户\n2. 点击右上角头像进入账户设置\n3. 在个人信息页面可以修改：\n   - 联系人姓名\n   - 联系电话\n   - 邮箱地址\n   - 公司信息等\n4. 修改完成后点击保存\n\n注意：部分敏感信息的修改可能需要客服审核。",
    createdAt: "2025-01-05"
  },
  {
    id: "art-8",
    categoryId: "account",
    title: "如何重置密码？",
    summary: "忘记密码后如何安全地重置您的账户密码",
    content:
      "## 重置密码\n\n### 通过登录页重置\n1. 在登录页面点击「忘记密码」\n2. 输入注册邮箱\n3. 查收重置密码邮件\n4. 点击邮件中的链接设置新密码\n\n### 密码要求\n- 至少8位字符\n- 包含数字和字母\n- 区分大小写",
    createdAt: "2025-01-10"
  },
  {
    id: "art-9",
    categoryId: "technical",
    title: "API对接常见问题",
    summary: "开发者对接API时遇到的常见问题及解决方案",
    content:
      "## API对接常见问题\n\n### 1. 认证失败\n请检查您的API Key是否正确，以及是否已过期。\n\n### 2. 接口返回错误码\n请参考API文档中的错误码说明表进行排查。\n\n### 3. 请求超时\n请检查网络连接，确保服务器能够正常访问我们的API端点。\n\n### 4. 数据格式问题\n确保请求参数格式正确，JSON格式无误。",
    createdAt: "2025-01-15"
  }
];

const articleId = computed(() => route.params.id as string);

const article = computed(() => {
  return articles.find((a) => a.id === articleId.value) || null;
});

const articleCategoryId = computed(() => {
  return article.value?.categoryId || "shipping";
});

const contentParagraphs = computed(() => {
  if (!article.value) return [];
  return article.value.content.split("\n");
});

const goBack = () => {
  router.push({ name: "HelpCenter" });
};

const handleCategorySelect = (categoryId: string) => {
  router.push({ name: "HelpCenter" });
};
</script>

<style scoped lang="scss">
.article-content {
  h2 {
    position: relative;
    padding-left: 14px;

    &::before {
      position: absolute;
      top: 4px;
      left: 0;
      width: 3px;
      height: 18px;
      content: "";
      background: var(--color-primary);
      border-radius: 2px;
    }
  }

  ul {
    margin-bottom: 12px;
  }

  li {
    margin-bottom: 4px;
    font-size: 14px;
    line-height: 1.8;
  }

  p {
    font-size: 14px;
    line-height: 1.8;
  }
}
</style>
