<template>
  <el-dialog
    v-model="visible"
    :title="$t('偏好设置')"
    width="480px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    class="preference-modal"
  >
    <div class="preference-content">
      <p class="subtitle">{{ $t("为了更好的服务，您需要设置您的网站偏好") }}</p>

      <el-form :model="form" label-position="top">
        <el-form-item :label="$t('你默认的站点是')">
          <el-select
            v-model="form.site"
            class="full-width"
            @change="handleSiteChange"
          >
            <el-option
              v-for="item in siteOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('您默认的时区是')">
          <el-select v-model="form.timezone" class="full-width">
            <el-option
              v-for="item in timezoneOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('您默认的语言是')">
          <el-select v-model="form.lang" class="full-width">
            <el-option
              v-for="item in langOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" class="submit-btn" @click="handleSubmit">
          {{ $t("确定") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, computed, nextTick } from "vue";
import { useAppStore } from "@/store/app";
import { Lang, Site } from "@/enums";
defineOptions({
  name: "PreferenceModal"
});

const emit = defineEmits(["confirm"]);
const appStore = useAppStore();
const visible = computed({
  get: () => appStore.isFirstLogin && !appStore.hasSetPreference,
  set: (val) => {
    if (!val) appStore.setFirstLogin(false);
  }
});

const siteOptions = computed(() => {
  return Object.entries(appStore.sitesMap).map(([key, value]) => ({
    value: key,
    label: value
  }));
});
const timezoneOptions = computed(() => {
  return Object.entries(appStore.timezonesMap).map(([key, value]) => ({
    label: value,
    value: key
  }));
});

const langOptions = computed(() => {
  return Object.entries(appStore.langsMap).map(([key, value]) => ({
    value: key,
    label: value
  }));
});
// 站点联动配置
const siteLinkageMap: Record<string, { timezone: string; lang: Lang }> = {
  [Site.fr]: { timezone: "Europe/Paris", lang: Lang.fr },
  [Site.it]: { timezone: "Europe/Rome", lang: Lang.it },
  [Site.nl]: { timezone: "Europe/Amsterdam", lang: Lang.nl }
};

const form = reactive({
  site: appStore.site || Site.fr,
  timezone: appStore.timezone || siteLinkageMap[Site.fr]?.timezone,
  lang: appStore.lang || siteLinkageMap[Site.fr]?.lang
});

const handleSiteChange = (val: string) => {
  const config = siteLinkageMap[val];
  if (config) {
    form.timezone = config.timezone;
    form.lang = config.lang;
  }
};

const handleSubmit = async () => {
  console.log("PreferenceModal: handleSubmit started", form);
  await appStore.setPreferences({
    site: form.site,
    timezone: form.timezone!,
    lang: form.lang!
  });
  console.log("PreferenceModal: setPreferences finished");
  await nextTick();
  appStore.setFirstLogin(false);
  console.log("PreferenceModal: emitting confirm");
  emit("confirm");
};
</script>

<style scoped lang="scss">
.preference-modal {
  font-size: var(--font-size-base);

  .preference-content {
    .subtitle {
      margin-bottom: 24px;
      color: var(--text-color-tertiary);
    }

    .full-width {
      width: 100%;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
