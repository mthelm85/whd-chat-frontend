<script lang="ts">
    import { streamChat } from "$lib/api";
    import ChatMessage from "$lib/components/ChatMessage.svelte";
    import type { Message, ApiMessage, StreamEvent } from "$lib/types";
    import { tick } from "svelte";

    let messages: Message[] = [];
    let input: string = "";
    let isLoading: boolean = false;
    let statusMessage: string = "";
    let currentAssistantMessage: string = "";
    let messagesContainer: HTMLDivElement;

    async function scrollToBottom() {
        await tick();
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    async function sendMessage(): Promise<void> {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        input = "";

        // Add user message
        messages = [...messages, { role: "user", content: userMessage }];
        await scrollToBottom();

        // Prepare for assistant response
        isLoading = true;
        currentAssistantMessage = "";

        // Create messages array for API
        const apiMessages: ApiMessage[] = messages.map((m) => ({
            role: m.role,
            content: m.content,
        }));

        try {
            await streamChat(apiMessages, async (event: StreamEvent) => {
                if (event.type === "text") {
                    // Only add space after specific punctuation marks
                    const lastChar = currentAssistantMessage.slice(-1);
                    const firstChar = event.content.charAt(0);

                    // Add space after sentence-ending punctuation if next char isn't whitespace or asterisk
                    const punctuationNeedsSpace = [
                        ".",
                        "!",
                        "?",
                        ":",
                        ";",
                        ")",
                    ].includes(lastChar);
                    const nextIsNotWhitespace =
                        firstChar && !/\s/.test(firstChar);
                    const nextIsNotAsterisk = firstChar !== "*"; // Add this line

                    const needsSpace =
                        currentAssistantMessage.length > 0 &&
                        punctuationNeedsSpace &&
                        nextIsNotWhitespace &&
                        nextIsNotAsterisk; // Add this condition

                    currentAssistantMessage +=
                        (needsSpace ? " " : "") + event.content;

                    // Update last message if it exists, otherwise create new
                    if (messages[messages.length - 1]?.role === "assistant") {
                        messages = [
                            ...messages.slice(0, -1),
                            {
                                role: "assistant",
                                content: currentAssistantMessage,
                            },
                        ];
                    } else {
                        messages = [
                            ...messages,
                            {
                                role: "assistant",
                                content: currentAssistantMessage,
                            },
                        ];
                    }
                    await scrollToBottom();
                } else if (event.type === "status") {
                    statusMessage = event.message;
                } else if (event.type === "done") {
                    isLoading = false;
                    statusMessage = "";
                } else if (event.type === "error") {
                    console.error("Error:", event.message);
                    if (event.message.includes("too long")) {
                        statusMessage =
                            "⚠️ Query returned too much data. Try asking for a smaller subset or summary.";
                    } else {
                        statusMessage = "Error: " + event.message;
                    }
                    isLoading = false;
                }
            });
        } catch (err) {
            console.error("Stream error:", err);
            isLoading = false;
            statusMessage = "Connection error";
        }
    }

    function handleKeypress(event: KeyboardEvent): void {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }
</script>

<div class="chat-container">
    <!-- <header>
        <div class="header-content">
            <div class="title-section">
                <h1>WHD Enforcement Chat</h1>
                <p>Explore wage and hour violation data through conversation</p>
            </div>
            <div class="stats">
                <div class="stat">
                    <span class="stat-value">{messages.length}</span>
                    <span class="stat-label">Messages</span>
                </div>
            </div>
        </div>
    </header> -->

    <div class="messages" bind:this={messagesContainer}>
        {#if messages.length === 0}
            <div class="welcome">
                <h2>Welcome!</h2>
                <p>Ask me anything about wage and hour violations:</p>
                <div class="example-questions">
                    <button
                        class="example"
                        on:click={() =>
                            (input =
                                "How many total cases are in the database?")}
                    >
                        📊 How many total cases are in the database?
                    </button>
                    <button
                        class="example"
                        on:click={() =>
                            (input =
                                "What are the top 5 states by back wages owed?")}
                    >
                        🗺️ What are the top 5 states by back wages owed?
                    </button>
                    <button
                        class="example"
                        on:click={() =>
                            (input =
                                "Show me violations in the hotel industry")}
                    >
                        🏨 Show me violations in the hotel industry
                    </button>
                </div>
            </div>
        {:else}
            {#each messages as message}
                <ChatMessage role={message.role} content={message.content} />
            {/each}
        {/if}

        {#if statusMessage}
            <div class="status">
                <div class="status-spinner"></div>
                {statusMessage}
            </div>
        {/if}
    </div>

    <div class="input-container">
        <textarea
            bind:value={input}
            on:keypress={handleKeypress}
            placeholder="Ask a question about wage violations..."
            disabled={isLoading}
            rows="2"
        ></textarea>
        <button
            on:click={sendMessage}
            disabled={isLoading || !input.trim()}
            class="send-button"
        >
            {#if isLoading}
                <div class="button-spinner"></div>
            {:else}
                <span class="send-icon">↑</span>
            {/if}
        </button>
    </div>
</div>

<style>
    .chat-container {
        max-width: 1000px;
        margin: 0 auto;
        height: 100vh;
        display: flex;
        flex-direction: column;
        padding: 0;
    }

    /* header {
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border);
        padding: 1.5rem 2rem;
    }

    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .title-section h1 {
        margin: 0 0 0.5rem;
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text-primary);
    }

    .title-section p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.95rem;
    }

    .stats {
        display: flex;
        gap: 1rem;
    }

    .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.5rem 1rem;
        background: var(--bg-tertiary);
        border-radius: 8px;
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--accent);
    }

    .stat-label {
        font-size: 0.75rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    } */

    .messages {
        flex: 1;
        overflow-y: auto;
        padding: 2rem;
        background: var(--bg-primary);
    }

    .welcome {
        text-align: center;
        padding: 4rem 2rem;
        max-width: 600px;
        margin: 0 auto;
    }

    .welcome h2 {
        font-size: 2rem;
        margin-bottom: 1rem;
        color: var(--text-primary);
    }

    .welcome p {
        color: var(--text-secondary);
        margin-bottom: 2rem;
        font-size: 1.1rem;
    }

    .example-questions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .example {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.95rem;
        text-align: left;
    }

    .example:hover {
        background: var(--bg-tertiary);
        border-color: var(--accent);
        transform: translateY(-2px);
    }

    .status {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: 12px;
        margin: 1rem 0;
        font-style: italic;
        color: var(--text-secondary);
    }

    .status-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid var(--border);
        border-top-color: var(--accent);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .input-container {
        display: flex;
        gap: 0.75rem;
        padding: 1.5rem 2rem;
        background: var(--bg-secondary);
        border-top: 1px solid var(--border);
    }

    textarea {
        flex: 1;
        padding: 1rem;
        background: var(--bg-tertiary);
        border: 1px solid var(--border);
        border-radius: 12px;
        font-family: inherit;
        font-size: 1rem;
        color: var(--text-primary);
        resize: none;
        transition: border-color 0.2s;
    }

    textarea::placeholder {
        color: var(--text-secondary);
    }

    textarea:focus {
        outline: none;
        border-color: var(--accent);
    }

    textarea:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .send-button {
        width: 48px;
        height: 48px;
        padding: 0;
        background: var(--accent);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 1.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        flex-shrink: 0;
    }

    .send-button:hover:not(:disabled) {
        background: var(--accent-hover);
        transform: translateY(-2px);
    }

    .send-button:disabled {
        background: var(--bg-tertiary);
        cursor: not-allowed;
        transform: none;
    }

    .send-icon {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .button-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
</style>
