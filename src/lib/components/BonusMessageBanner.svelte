<script lang="ts">
  let { 
    visible = false 
  }: {
    visible?: boolean;
  } = $props();
</script>

{#if visible}
  <div class="banner">
    <div class="banner-icon">🃏</div>
    <div class="banner-text">
      <div class="banner-title">Joker Mode Active</div>
      <div class="banner-subtitle">1 Guaranteed Joker in Your Deal</div>
    </div>
  </div>
{/if}

<style>
  .banner {
    position: fixed;
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, rgba(20, 20, 40, 0.95), rgba(40, 20, 60, 0.95));
    border: 2px solid #ffd700;
    border-radius: 16px;
    padding: 16px 32px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 
      0 0 30px rgba(255, 215, 0, 0.4),
      0 8px 24px rgba(0, 0, 0, 0.5);
    animation: slideDown 0.4s ease, glow 2s ease-in-out infinite;
    z-index: 100;
  }

  @keyframes slideDown {
    from {
      transform: translateX(-50%) translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 
        0 0 20px rgba(255, 215, 0, 0.3),
        0 8px 24px rgba(0, 0, 0, 0.5);
    }
    50% {
      box-shadow: 
        0 0 40px rgba(255, 215, 0, 0.6),
        0 8px 24px rgba(0, 0, 0, 0.5);
    }
  }

  .banner-icon {
    font-size: 48px;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  .banner-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .banner-title {
    font-size: 20px;
    font-weight: bold;
    color: #ffd700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  .banner-subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
  }

  @media (max-width: 768px) {
    .banner {
      top: 20px;
      padding: 12px 24px;
      gap: 12px;
    }

    .banner-icon {
      font-size: 36px;
    }

    .banner-title {
      font-size: 16px;
    }

    .banner-subtitle {
      font-size: 12px;
    }
  }

  @media (max-width: 480px) {
    .banner {
      padding: 10px 16px;
      gap: 10px;
      max-width: 90vw;
    }

    .banner-icon {
      font-size: 32px;
    }

    .banner-title {
      font-size: 14px;
    }

    .banner-subtitle {
      font-size: 11px;
    }
  }
</style>
