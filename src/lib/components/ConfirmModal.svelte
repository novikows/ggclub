<script lang="ts">
  let { 
    visible = false,
    title = 'Confirm',
    message = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel
  }: {
    visible: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
  } = $props();

  function handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  }
</script>

{#if visible}
  <div class="modal-overlay" onclick={handleOverlayClick} role="button" tabindex="0" onkeydown={(e) => e.key === 'Escape' && onCancel()}>
    <div class="modal">
      <div class="modal-icon">🃏</div>
      <h2 class="modal-title">{title}</h2>
      <p class="modal-message">{message}</p>
      
      <div class="modal-buttons">
        <button class="btn btn-cancel" onclick={onCancel}>
          {cancelText}
        </button>
        <button class="btn btn-confirm" onclick={onConfirm}>
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease-out;
  }

  .modal {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 24px;
    padding: 40px;
    text-align: center;
    min-width: 400px;
    max-width: 500px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    border: 2px solid rgba(255, 215, 0, 0.3);
    animation: scaleIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .modal-icon {
    font-size: 64px;
    margin-bottom: 20px;
    animation: bounce 1s ease-in-out infinite;
  }

  .modal-title {
    font-size: 28px;
    font-weight: bold;
    color: #ffd700;
    margin-bottom: 16px;
    text-transform: uppercase;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  }

  .modal-message {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.6;
    margin-bottom: 32px;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }

  .modal-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .btn {
    padding: 14px 32px;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    min-width: 120px;
  }

  .btn-cancel {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .btn-cancel:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }

  .btn-confirm {
    background: linear-gradient(45deg, #ffd700, #ffed4e);
    color: #1a1a2e;
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
  }

  .btn-confirm:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6);
  }

  .btn:active {
    transform: translateY(0);
  }

  @keyframes fadeIn {
    from { 
      opacity: 0; 
    }
    to { 
      opacity: 1; 
    }
  }

  @keyframes scaleIn {
    from { 
      transform: scale(0.8); 
      opacity: 0; 
    }
    to { 
      transform: scale(1); 
      opacity: 1; 
    }
  }

  @keyframes bounce {
    0%, 100% { 
      transform: translateY(0); 
    }
    50% { 
      transform: translateY(-10px); 
    }
  }

  @media (max-width: 768px) {
    .modal {
      padding: 32px 24px;
      min-width: 320px;
      border-radius: 20px;
    }

    .modal-icon {
      font-size: 56px;
      margin-bottom: 16px;
    }

    .modal-title {
      font-size: 24px;
      margin-bottom: 12px;
    }

    .modal-message {
      font-size: 14px;
      margin-bottom: 24px;
    }

    .btn {
      padding: 12px 24px;
      font-size: 14px;
      min-width: 100px;
    }
  }

  @media (max-width: 480px) {
    .modal {
      padding: 24px 20px;
      min-width: 280px;
      border-radius: 16px;
    }

    .modal-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .modal-title {
      font-size: 20px;
      margin-bottom: 10px;
    }

    .modal-message {
      font-size: 13px;
      margin-bottom: 20px;
    }

    .modal-buttons {
      flex-direction: column;
      gap: 10px;
    }

    .btn {
      padding: 12px 20px;
      font-size: 13px;
      width: 100%;
    }
  }
</style>
