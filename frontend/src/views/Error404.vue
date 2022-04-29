<template>
  <div class="not-found">
    <img src="/static/logo.png" alt="logo">
    <div class="not-found-text">
      <h1>404</h1>
      <h2>страница не найдена</h2>
      <span>Для перехода на главную страниу перейдите по <a href="/"> ссылке </a></span>
    </div>

  </div>
</template>

<script>
</script>

<style scoped lang="scss">
@import "../assets/scss/theme";

.not-found {
  display: flex;
  flex-grow: 1;
  background: #f9f9f9;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  img {
    width: 50px;
    height: 50px;
    margin: 80px;
  }

  .not-found-text {
    border-radius: 5px;
    background: #fff;
    padding: 30px;
    color: #505050;
  }
}

</style>