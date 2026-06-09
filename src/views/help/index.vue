<template>
  <page-container>
    <CommonTitle
      :title="$t('web.gfuc.help_center')"
      :tip="$t('web.gfuc.help_center_desc')"
    />

    <div class="flex flex-1 gap-6 mt-6 min-h-0">
      <!-- 主内容区 -->
      <div class="flex-1 min-w-0 overflow-y-auto">
        <!-- 搜索框 -->
        <div class="mb-6">
          <el-input
            v-model="searchQuery"
            :placeholder="$t('web.gfuc.help_search_placeholder')"
            clearable
            size="large"
            class="search-input"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon class="text-info"><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 搜索结果提示 -->
        <div v-if="searchQuery" class="mb-4 text-sm text-info">
          {{ $t("web.gfuc.help_search_no_results") }}
        </div>

        <!-- 分类卡片网格 -->
        <div v-if="!searchQuery" class="grid grid-cols-2 gap-4 mb-8">
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-card"
            :class="{ 'is-active': activeCategory === category.id }"
            @click="handleCategorySelect(category.id)"
          >
            <div class="flex items-start">
              <div
                class="flex items-center justify-center w-12 h-12 mr-4 rounded-lg shrink-0"
                :class="
                  activeCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-orange-50'
                "
              >
                <svg-icon
                  :name="category.icon"
                  :width="24"
                  :height="24"
                  :color="activeCategory === category.id ? '#fff' : '#fc4c02'"
                />
              </div>
              <div class="flex-1 min-w-0">
                <h3
                  class="text-base font-medium text-text-regular"
                  :class="{ 'text-primary': activeCategory === category.id }"
                >
                  {{ $t(category.i18nKey) }}
                </h3>
                <p class="mt-1 text-sm text-text-tertiary line-clamp-2">
                  {{ category.description }}
                </p>
                <span class="inline-block mt-2 text-xs text-info">
                  {{ category.articleCount }} {{ $t("web.gfuc.help_view_all") }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 文章列表 -->
        <div v-if="filteredArticles.length > 0" class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-medium text-text-regular">
              {{ currentCategoryTitle }}
            </h3>
          </div>
          <div class="bg-white divide-y rounded-lg shadow-sm divide-border">
            <div
              v-for="article in filteredArticles"
              :key="article.id"
              class="article-item"
              @click="handleArticleClick(article.id)"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium truncate text-text-regular">
                    {{ article.title }}
                  </h4>
                  <p class="mt-1 text-xs text-text-tertiary line-clamp-1">
                    {{ article.summary }}
                  </p>
                </div>
                <el-icon class="ml-2 text-info shrink-0"
                  ><ArrowRight
                /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- FAQ 折叠列表 -->
        <div v-if="!searchQuery" class="mb-8">
          <h3 class="mb-4 text-base font-medium text-text-regular">
            {{ $t("web.gfuc.help_faq") }}
          </h3>
          <el-collapse v-model="activeFAQ" accordion class="faq-collapse">
            <el-collapse-item
              v-for="faq in faqs"
              :key="faq.id"
              :name="faq.id"
              class="faq-item"
            >
              <template #title>
                <span class="text-sm font-medium text-text-regular">{{
                  faq.question
                }}</span>
              </template>
              <div class="text-sm leading-relaxed text-text-secondary">
                {{ faq.answer }}
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>

      <!-- 侧边栏 -->
      <HelpSidebar
        :categories="categories"
        :active-category="activeCategory"
        @select-category="handleCategorySelect"
      />
    </div>
  </page-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Search, ArrowRight } from "@element-plus/icons-vue";
import CommonTitle from "@/components/CommonTitle/index.vue";
import HelpSidebar from "./components/HelpSidebar.vue";
import type { HelpCategory, HelpArticle, FAQ } from "./types";

defineOptions({
  name: "HelpCenter"
});

const router = useRouter();

// 搜索
const searchQuery = ref("");
const activeCategory = ref("shipping");
const activeFAQ = ref("faq-1");

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

// Mock FAQ 数据
const faqs: FAQ[] = [
  {
    id: "faq-1",
    question: "下单后多久可以获取面单？",
    answer:
      "支付完成后，系统会立即生成面单文件，您可以在订单详情页面直接下载PDF格式的面单文件。如果遇到支付问题，请等待支付成功后再重新下载。"
  },
  {
    id: "faq-2",
    question: "如何修改已提交的订单信息？",
    answer:
      "如果订单尚未发货，您可以在订单列表中找到该订单，点击编辑按钮修改信息。如果订单已经发货，请联系客服进行处理。注意：部分字段一旦提交后无法修改。"
  },
  {
    id: "faq-3",
    question: "支持哪些支付方式？",
    answer:
      "我们支持多种支付方式，包括：信用卡支付（Visa、Mastercard）、银行转账、PayPal等。具体支持的支付方式取决于您的账户所在地区。"
  },
  {
    id: "faq-4",
    question: "运输时效一般是多久？",
    answer:
      "运输时效根据目的地和所选渠道不同而有所差异。一般情况下，欧洲境内派送为3-7个工作日，国际快递为5-10个工作日。具体时效在下单时会有预估时间显示。"
  },
  {
    id: "faq-5",
    question: "如何联系客服？",
    answer:
      "您可以通过以下方式联系我们：\n1. 在线客服：在工作时间内通过系统右下角的在线客服按钮咨询\n2. 客服邮箱：发送邮件至 support@gofoparcels.com，我们会在24小时内回复\n3. 电话支持：具体号码请查看联系我们页面"
  }
];

// 当前选中的分类标题
const currentCategoryTitle = computed(() => {
  const cat = categories.find((c) => c.id === activeCategory.value);
  return cat ? cat.title : "";
});

// 过滤后的文章列表
const filteredArticles = computed(() => {
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.summary.toLowerCase().includes(query)
    );
  }
  return articles.filter((a) => a.categoryId === activeCategory.value);
});

const handleSearch = () => {
  // 搜索时自动选择全部，但这里因为是前端搜索，show all matching results
};

const handleCategorySelect = (categoryId: string) => {
  activeCategory.value = categoryId;
  searchQuery.value = "";
};

const handleArticleClick = (articleId: string) => {
  router.push({
    name: "HelpDetail",
    params: { id: articleId }
  });
};
</script>

<style scoped lang="scss">
.search-input {
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 6%);

    &:hover {
      box-shadow: 0 1px 6px 0 rgb(0 0 0 / 10%);
    }

    &.is-focus {
      box-shadow: 0 0 0 1px var(--color-primary) inset;
    }
  }

  :deep(.el-input__inner) {
    height: 48px;
    font-size: 14px;
  }
}

.category-card {
  padding: 20px;
  cursor: pointer;
  background: #fff;
  border: 1px solid var(--border-color, #eff0f5);
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: 0 4px 12px rgb(252 76 2 / 8%);
  }

  &.is-active {
    background: linear-gradient(
      135deg,
      rgb(252 76 2 / 3%),
      rgb(255 228 72 / 3%)
    );
    border-color: var(--color-primary);
    box-shadow: 0 4px 12px rgb(252 76 2 / 8%);
  }
}

.article-item {
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgb(252 76 2 / 3%);
  }
}

.faq-collapse {
  background: #fff;
  border: none;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 6%);

  :deep(.el-collapse-item__header) {
    height: auto;
    padding: 16px 20px;
    font-weight: 500;
    border-bottom: 1px solid var(--border-color, #eff0f5);

    &.is-active {
      border-bottom-color: transparent;
    }
  }

  :deep(.el-collapse-item__wrap) {
    border-bottom: 1px solid var(--border-color, #eff0f5);
  }

  :deep(.el-collapse-item__content) {
    padding: 0 20px 20px;
  }
}

.faq-item {
  &:last-child {
    :deep(.el-collapse-item__wrap) {
      border-bottom: none;
    }
  }
}
</style>
