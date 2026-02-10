<template>
  <el-dialog
    v-model="visible"
    :title="$t('gfuc.preference_settings' /** 偏好设置 **/)"
    width="480px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    class="preference-modal"
  >
    <div class="preference-content">
      <p class="subtitle">
        {{
          $t(
            "web.gfuc.preference_settings_description" /** 为了更好的服务，您需要设置您的网站偏好 **/
          )
        }}
      </p>

      <el-form :model="form" label-position="top">
        <el-form-item
          :label="$t('web.gfuc.your_default_site' /** 你默认的站点是 **/)"
        >
          <el-select
            v-model="form.site"
            class="full-width"
            @change="handleSiteChange"
          >
            <el-option
              v-for="item in siteDict.options.value"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          :label="$t('gfuc.your_default_timezone' /** 您默认的时区是 **/)"
        >
          <el-select v-model="form.timezone" class="full-width">
            <el-option
              v-for="item in timezoneDict.options.value"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          :label="$t('gfuc.your_default_language' /** 您默认的语言是 **/)"
        >
          <el-select v-model="form.lang" class="full-width">
            <el-option
              v-for="item in langDict.options.value"
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
          {{ $t("web.gfuc.confirm" /** 确定 **/) }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, computed, nextTick } from "vue";
import { useAppStore } from "@/store/app";
import { Lang, Site, Timezone } from "@/enums";
import { useDict } from "@/hooks/useDict";
defineOptions({
  name: "PreferenceModal"
});
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(["success", "update:modelValue"]);
const appStore = useAppStore();
const visible = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  }
});

const siteDict = useDict<Site>("gfuc.site.code");

const timezoneDict = useDict<Timezone>("gfuc.time.zone");

const langDict = useDict<Lang>("gfuc.lang");

// 站点联动配置
const siteLinkageMap: Record<string, { timezone: Timezone; lang: Lang }> = {
  [Site.fr]: { timezone: Timezone.Europe_Paris, lang: Lang.fr },
  [Site.it]: { timezone: Timezone.Europe_Rome, lang: Lang.it },
  [Site.nl]: { timezone: Timezone.Europe_Amsterdam, lang: Lang.nl }
};

const form = reactive({
  site: Site.fr,
  timezone: siteLinkageMap[Site.fr]!.timezone,
  lang: siteLinkageMap[Site.fr]!.lang
});

const handleSiteChange = (val: string) => {
  const config = siteLinkageMap[val];
  if (config) {
    form.timezone = config.timezone;
    form.lang = config.lang;
  }
};

const handleSubmit = async () => {
  await appStore.setPreferences({
    site: form.site,
    timezone: form.timezone!,
    lang: form.lang!
  });
  await nextTick();
  emit("update:modelValue", false);
  emit("success");
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
