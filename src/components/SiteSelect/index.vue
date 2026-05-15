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

const options = computed(() => {
  return [
    {
      value: Site.fr,
      label: t("web.gfuc.french_site" /** 法国站 **/)
    },
    {
      value: Site.it,
      label: t("web.gfuc.italian_site" /** 意大利站 **/)
    },
    {
      value: Site.nl,
      label: t("web.gfuc.dutch_site" /** 荷兰站 **/)
    }
  ];
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
