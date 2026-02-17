<template>
  <div class="header">
    <div class="header-left">
      <div class="logo">SV</div>
      <h1>ストリートビュー図鑑<span>YCAM周辺</span></h1>
    </div>
    <div class="header-right">
      <div class="badge">DEMO</div>
    </div>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  z-index: 100;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .logo {
      width: 32px;
      height: 32px;
      background: var(--accent);
      border-radius: 8px;
      display: grid;
      place-items: center;
      font-family: var(--font-en);
      font-weight: 700;
      font-size: 14px;
      color: #fff;
    }

    h1 {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.02em;

      span {
        color: var(--text-muted);
        font-weight: 400;
        margin-left: 8px;
        font-size: 13px;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;

    .badge {
      font-size: 11px;
      font-weight: 500;
      padding: 4px 10px;
      border-radius: 20px;
      background: var(--accent-glow);
      color: var(--accent);
      font-family: var(--font-en);
    }
  }
}
</style>
