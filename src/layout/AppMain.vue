<template>
    <section class="app-main">
        <router-view v-slot="{ Component, route }">
            <transition name="fade-transform" mode="out-in">
                <component v-if="!route.meta.link" :is="Component" :key="route.path" />
            </transition>
        </router-view>
    </section>
</template>

<script setup lang="ts">

</script>

<style lang="scss" scoped>
.app-main {
    /* 50= navbar  50  */
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
    .fixed-header {
        padding-right: 17px;
    }
}
</style>
