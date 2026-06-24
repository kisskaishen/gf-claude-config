<template>
  <select-dropdown
    v-model="appStore.site"
    :options="options"
    @change="handleSetSite"
  />
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/app";
import SelectDropdown from "@/components/SelectDropdown/index.vue";
import { Site } from "@/enums";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/store/user";
import { useRouter } from "vue-router";

defineOptions({
  name: "SiteSelect"
});

const router = useRouter();

const { t } = useI18n();

const appStore = useAppStore();

const userStore = useUserStore();

const siteLabelMap: Record<string, string> = {
  [Site.fr]: "web.gfuc.french_site",
  [Site.it]: "web.gfuc.italian_site",
  [Site.nl]: "web.gfuc.dutch_site"
};

const options = computed(() => {
  // 优先使用登录时从接口获取的站点列表
  const list =
    appStore.siteList.length > 0
      ? appStore.siteList
      : [Site.fr, Site.it, Site.nl];
  return list.map((code) => ({
    value: code,
    label: t(siteLabelMap[code] || code)
  }));
});

const handleSetSite = (val: any) => {
  appStore.setSite(val);
  // userStore.isUserInfoUpdated = false;
  // window.location.reload();
  if (sessionStorage.getItem("balanceAlertNotShown")) {
    sessionStorage.removeItem("balanceAlertNotShown");
  }
  if (sessionStorage.getItem("single_order_form_data")) {
    sessionStorage.removeItem("single_order_form_data");
  }
  // 清空用户信息
  userStore.logout();
  sessionStorage.setItem("setSite", val);
  router.push("/login");
};
</script>

<style scoped lang="scss"></style>
