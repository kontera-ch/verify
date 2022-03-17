<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <a class="navbar-brand" href="#">Kontera</a>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link active" to="/">Verify</router-link>
          </li>
        </ul>
      </div>
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
