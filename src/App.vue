<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import enLocale from 'element-plus/es/locale/lang/en'
import zhCnLocale from 'element-plus/es/locale/lang/zh-cn'

const { locale } = useI18n()
const elLocale = computed(() => (locale.value === 'en' ? enLocale : zhCnLocale))
</script>

<template>
  <el-config-provider :locale="elLocale">
    <router-view />
  </el-config-provider>
</template>
