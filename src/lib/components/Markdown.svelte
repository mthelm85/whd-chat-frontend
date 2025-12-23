<script lang="ts">
  import { marked } from 'marked';
  import { onMount } from 'svelte';

  export let content: string;

  let html: string = '';

  // Configure marked options
  marked.setOptions({
    breaks: true, // Convert \n to <br>
    gfm: true, // GitHub Flavored Markdown
  });

  $: {
    // Parse markdown to HTML
    html = marked.parse(content) as string;
  }
</script>

<div class="markdown">
  {@html html}
</div>

<style>
  .markdown {
    line-height: 1.7;
  }

  .markdown :global(h1),
  .markdown :global(h2),
  .markdown :global(h3) {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .markdown :global(h1) {
    font-size: 1.5rem;
    color: var(--text-primary);
  }

  .markdown :global(h2) {
    font-size: 1.25rem;
    color: var(--text-primary);
  }

  .markdown :global(h3) {
    font-size: 1.1rem;
    color: var(--text-secondary);
  }

  .markdown :global(p) {
    margin: 0.75rem 0;
  }

  .markdown :global(strong) {
    color: var(--text-primary);
    font-weight: 600;
  }

  .markdown :global(em) {
    color: var(--text-secondary);
  }

  .markdown :global(ul),
  .markdown :global(ol) {
    margin: 0.75rem 0;
    padding-left: 1.5rem;
  }

  .markdown :global(li) {
    margin: 0.25rem 0;
  }

  .markdown :global(code) {
    background: var(--bg-tertiary);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.9em;
    color: #64ffda;
  }

  .markdown :global(pre) {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    overflow-x: auto;
    margin: 1rem 0;
  }

  .markdown :global(pre code) {
    background: none;
    padding: 0;
    color: var(--text-primary);
  }

  .markdown :global(blockquote) {
    border-left: 4px solid var(--accent);
    padding-left: 1rem;
    margin: 1rem 0;
    color: var(--text-secondary);
    font-style: italic;
  }

  .markdown :global(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 1rem 0;
  }

  .markdown :global(th),
  .markdown :global(td) {
    border: 1px solid var(--border);
    padding: 0.5rem;
    text-align: left;
  }

  .markdown :global(th) {
    background: var(--bg-tertiary);
    font-weight: 600;
  }

  .markdown :global(tr:nth-child(even)) {
    background: var(--bg-secondary);
  }

  .markdown :global(a) {
    color: var(--accent);
    text-decoration: none;
  }

  .markdown :global(a:hover) {
    text-decoration: underline;
  }

  .markdown :global(hr) {
    border: none;
    border-top: 1px solid var(--border);
    margin: 1.5rem 0;
  }
</style>