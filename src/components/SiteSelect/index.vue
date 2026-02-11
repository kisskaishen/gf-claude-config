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
defineOptions({
  name: "SiteSelect"
});

const { t } = useI18n();

const appStore = useAppStore();

const userStore = useUserStore();

const options = [
  {
    value: Site.fr,
    label: t("gfuc.french_site" /** 法国站 **/)
  },
  {
    value: Site.it,
    label: t("gfuc.italian_site" /** 意大利站 **/)
  },
  {
    value: Site.nl,
    label: t("gfuc.dutch_site" /** 荷兰站 **/)
  }
];

const handleSetSite = (val: any) => {
  appStore.setSite(val);
  // userStore.isUserInfoUpdated = false;
  window.location.reload();
};
</script>

<style scoped lang="scss"></style>
