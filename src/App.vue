<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <a class="navbar-brand" href="#">
        <span class="brand">
          Kontera
          <span class="text-success font-weight-light">Verify</span>
        </span>
      </a>
    </div>
  </nav>

  <div class="container content">
    <router-view />
  </div>
</template>

<style lang="scss" scoped>
.content {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
}
</style>
