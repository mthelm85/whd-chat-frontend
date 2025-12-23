<script lang="ts">
  import Markdown from './Markdown.svelte';

  export let role: 'user' | 'assistant';
  export let content: string;
</script>

<div class="message {role}">
  <div class="role-badge">
    <span class="icon">{role === 'user' ? '👤' : '🤖'}</span>
    <span class="role-text">{role === 'user' ? 'You' : 'Assistant'}</span>
  </div>
  <div class="content">
    {#if role === 'assistant'}
      <Markdown {content} />
    {:else}
      <div class="user-text">{content}</div>
    {/if}
  </div>
</div>

<style>
  .message {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    margin-bottom: 0.5rem;
    border-radius: 12px;
    animation: slideIn 0.2s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message.user {
    background: var(--user-bg);
    border: 1px solid var(--border);
  }

  .message.assistant {
    background: var(--assistant-bg);
    border: 1px solid transparent;
  }

  .role-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    min-width: 60px;
  }

  .icon {
    font-size: 1.5rem;
  }

  .role-text {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .content {
    flex: 1;
    min-width: 0;
  }

  .user-text {
    white-space: pre-wrap;
    word-wrap: break-word;
    color: var(--text-primary);
  }
</style>