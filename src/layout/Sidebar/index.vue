<template>
  <div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :unique-opened="true"
        :collapse-transition="false"
        mode="vertical"
      >
        <router-link
          v-for="(item, index) of constantRoutes"
          :key="index"
          :to="item.children[0].path"
        >
          <el-menu-item>
            <span>{{ item.children[0].meta.title }}</span>
          </el-menu-item>
        </router-link>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { constantRoutes } from '@/router';

const route = useRoute();

const activeMenu = computed(() => {
  const { meta, path } = route;
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu;
  }
  return path;
});
</script>
