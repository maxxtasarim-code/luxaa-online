"use client";

if (typeof window !== "undefined" && typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const sidebar = document.getElementById("sidebar");
    const scrim = document.getElementById("sidebar-scrim");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");
    const composer = document.getElementById("composer");
    const messages = document.getElementById("messages");
    const welcomeBlock = document.getElementById("welcome-block");
    const themeToggle = document.getElementById("theme-toggle");
    const newChatButton = document.getElementById("new-chat");
    const historyList = document.getElementById("history-list");
    const historyEmpty = document.getElementById("history-empty");
    const historyCount = document.getElementById("history-count");
    const exportJsonButton = document.getElementById("export-json");
    const exportMarkdownButton = document.getElementById("export-markdown");

    let chatMessages = [];
    let isPending = false;
    let currentChatId = null;
    let chatHistory = [];

    const LUXA_AVATAR_IMAGE = "/manus-storage/IMG_20261022_104051_f3374eab.jpg";
    const USER_AVATAR_IMAGE = "/manus-storage/1000037943_15f47530.jpg";
    const HISTORY_STORAGE_KEY = "luxa_chat_history";
    const ANONYMOUS_USER_KEY = "anonymous_user_id";

    function createLocalId() {
      if (window.crypto?.randomUUID) return window.crypto.randomUUID();
      return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    function getAnonymousUserId() {
      try {
        let id = localStorage.getItem(ANONYMOUS_USER_KEY);
        if (!id) {
          id = `anon-${createLocalId()}`;
          localStorage.setItem(ANONYMOUS_USER_KEY, id);
        }
        return id;
      } catch {
        return "anonymous-local";
      }
    }

    const anonymousUserId = getAnonymousUserId();

    function readChatHistory() {
      try {
        const stored = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]");
        if (!Array.isArray(stored)) return [];
        return stored.filter((chat) => chat && typeof chat.id === "string" && Array.isArray(chat.messages));
      } catch {
        return [];
      }
    }

    function writeChatHistory() {
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(chatHistory.slice(0, 50)));
      } catch {
        // Local storage may be unavailable or full
      }
    }

    function chatTitle(messagesToTitle) {
      const firstUserMessage = messagesToTitle.find((message) => message.role === "user");
      const title = String(firstUserMessage?.content || "Yeni sohbet").replace(/\s+/g, " ").trim();
      return title.length > 44 ? `${title.slice(0, 44).trim()}…` : title;
    }

    function exportFile(filename, content, type) {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    }

    function exportFilename(extension) {
      return `luxa-ai-sohbet-gecmisi-${new Date().toISOString().slice(0, 10)}.${extension}`;
    }

    function exportJson() {
      if (chatHistory.length === 0) return;
      const payload = {
        format: "luxa-ai-chat-history",
        version: 1,
        exportedAt: new Date().toISOString(),
        anonymousUserId,
        chats: chatHistory,
      };
      exportFile(exportFilename("json"), JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
    }

    function markdownText(value) {
      return String(value || "").replace(/([\\`*_{}[\]()#+.!|>])/g, "\\$1");
    }

    function exportMarkdown() {
      if (chatHistory.length === 0) return;
      const ordered = [...chatHistory].sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
      const sections = ordered.map((chat) => {
        const messagesText = chat.messages.map((message) => {
          const heading = message.role === "assistant" ? "LUXA AI" : "Kullanıcı";
          const sources = message.role === "assistant" && Array.isArray(message.sources) && message.sources.length > 0
            ? `\n\n**Kaynaklar**\n${message.sources.slice(0, 5).map((source) => `- [${markdownText(source.title || "Web kaynağı")}](${source.url})`).join("\n")}`
            : "";
          return `### ${heading}\n\n${message.content || ""}${sources}`;
        }).join("\n\n");
        return `## ${markdownText(chat.title || chatTitle(chat.messages))}\n\n${messagesText}`;
      });
      const markdown = `# LUXA AI sohbet geçmişi\n\nDışa aktarma tarihi: ${new Date().toLocaleString("tr-TR")}\n\n${sections.join("\n\n---\n\n")}\n`;
      exportFile(exportFilename("md"), markdown, "text/markdown;charset=utf-8");
    }

    function renderChatHistory() {
      if (!historyList) return;
      historyList.replaceChildren();
      const ordered = [...chatHistory].sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
      if (historyCount) historyCount.textContent = String(ordered.length);
      if (historyEmpty) historyEmpty.hidden = ordered.length > 0;
      if (exportJsonButton) exportJsonButton.disabled = ordered.length === 0;
      if (exportMarkdownButton) exportMarkdownButton.disabled = ordered.length === 0;

      ordered.forEach((chat) => {
        const item = document.createElement("div");
        item.className = "history-item";

        const openButton = document.createElement("button");
        openButton.type = "button";
        openButton.className = "history-open";
        openButton.textContent = chat.title || chatTitle(chat.messages);
        openButton.addEventListener("click", () => openStoredChat(chat.id));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "icon-button history-delete";
        deleteButton.setAttribute("aria-label", `${openButton.textContent} sohbetini sil`);
        deleteButton.title = "Sohbeti sil";
        deleteButton.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 11v6M14 11v6M8 7l1-2h6l1 2M7 7l1 13h8l1-13" /></svg>`;
        deleteButton.addEventListener("click", (event) => {
          event.stopPropagation();
          deleteStoredChat(chat.id);
        });

        item.append(openButton, deleteButton);
        historyList.appendChild(item);
      });
    }

    function saveCurrentChat() {
      if (!currentChatId) return;
      if (chatMessages.length === 0) {
        chatHistory = chatHistory.filter((chat) => chat.id !== currentChatId);
        writeChatHistory();
        renderChatHistory();
        return;
      }
      const now = Date.now();
      const savedChat = {
        id: currentChatId,
        anonymousUserId,
        title: chatTitle(chatMessages),
        messages: chatMessages,
        createdAt: chatHistory.find((chat) => chat.id === currentChatId)?.createdAt || now,
        updatedAt: now,
      };
      chatHistory = [savedChat, ...chatHistory.filter((chat) => chat.id !== currentChatId)].slice(0, 50);
      writeChatHistory();
      renderChatHistory();
    }

    function openStoredChat(chatId) {
      if (isPending) return;
      const savedChat = chatHistory.find((chat) => chat.id === chatId);
      if (!savedChat) return;
      currentChatId = savedChat.id;
      chatMessages = savedChat.messages.filter((message) => message && ["user", "assistant"].includes(message.role));
      if (messages) messages.replaceChildren();
      if (welcomeBlock) welcomeBlock.hidden = chatMessages.length > 0;
      chatMessages.forEach((message) => addMessage(message.role, message.content, message.sources, message.thinkingDurationMs));
      setSidebar(false);
      if (messageInput) {
        messageInput.value = "";
        resizeInput();
        messageInput.focus();
      }
    }

    function deleteStoredChat(chatId) {
      chatHistory = chatHistory.filter((chat) => chat.id !== chatId);
      writeChatHistory();
      if (currentChatId === chatId) {
        currentChatId = null;
        chatMessages = [];
        if (messages) messages.replaceChildren();
        if (welcomeBlock) welcomeBlock.hidden = false;
        if (messageInput) {
          messageInput.value = "";
          resizeInput();
        }
      }
      renderChatHistory();
    }

    function setTheme(theme) {
      if (root) root.dataset.theme = theme;
      localStorage.setItem("luxa-theme", theme);
      const isDark = theme === "dark";
      if (themeToggle) {
        themeToggle.setAttribute("aria-label", isDark ? "Açık temaya geç" : "Koyu temaya geç");
        themeToggle.setAttribute("title", isDark ? "Açık temaya geç" : "Koyu temaya geç");
      }
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute("content", isDark ? "#171d1d" : "#f7f5ef");
    }

    const storedTheme = localStorage.getItem("luxa-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(storedTheme || (prefersDark ? "dark" : "light"));

    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        setTheme(root?.dataset.theme === "dark" ? "light" : "dark");
      });
    }

    if (exportJsonButton) exportJsonButton.addEventListener("click", exportJson);
    if (exportMarkdownButton) exportMarkdownButton.addEventListener("click", exportMarkdown);

    function setSidebar(open) {
      if (sidebar) sidebar.classList.toggle("is-open", open);
      if (scrim) scrim.classList.toggle("is-visible", open);
      document.body.classList.toggle("sidebar-open", open);
      if (open) document.getElementById("close-sidebar")?.focus();
    }

    document.getElementById("open-sidebar")?.addEventListener("click", () => setSidebar(true));
    document.getElementById("close-sidebar")?.addEventListener("click", () => setSidebar(false));
    if (scrim) scrim.addEventListener("click", () => setSidebar(false));

    function resizeInput() {
      if (!messageInput || !sendButton) return;
      messageInput.style.height = "auto";
      messageInput.style.height = `${Math.min(messageInput.scrollHeight, 142)}px`;
      sendButton.disabled = isPending || !messageInput.value.trim();
    }

    function setPending(pending) {
      isPending = pending;
      if (composer) composer.classList.toggle("is-pending", pending);
      if (messageInput) {
        messageInput.setAttribute("aria-busy", String(pending));
        messageInput.placeholder = pending ? "LUXA AI düşünüyor..." : "LUXA AI'ye bir şeyler yazın...";
      }
      resizeInput();
    }

    if (messageInput) {
      messageInput.addEventListener("input", resizeInput);
      messageInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          if (messageInput.value.trim() && !isPending && composer) composer.requestSubmit();
        }
      });
    }

    function scrollToLatest(element) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function formatPublishedAt(value) {
      if (typeof value !== "string" || !value.trim()) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(date);
    }

    function formatThinkingDuration(durationMs) {
      const milliseconds = Number(durationMs);
      if (!Number.isFinite(milliseconds) || milliseconds < 0) return "";
      const totalSeconds = Math.max(1, Math.round(milliseconds / 1000));
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return minutes > 0
        ? `LUXA ${minutes} dakika ${seconds} saniye düşündü`
        : `LUXA ${totalSeconds} saniye düşündü`;
    }

    function sourceDomain(value) {
      try {
        return new URL(value).hostname.replace(/^www\./i, "");
      } catch {
        return "Web kaynağı";
      }
    }

    function addSources(container, sources) {
      if (!Array.isArray(sources) || sources.length === 0) return;

      const section = document.createElement("section");
      section.className = "message-sources";
      section.setAttribute("aria-label", "Yanıt kaynakları");

      const heading = document.createElement("p");
      heading.className = "sources-heading";
      heading.textContent = "Kaynaklar";
      section.appendChild(heading);

      const list = document.createElement("div");
      list.className = "source-list";
      sources.slice(0, 5).forEach((source, index) => {
        if (!source || typeof source.url !== "string" || !/^https?:\/\//i.test(source.url)) return;
        const card = document.createElement("a");
        card.className = "source-card";
        card.href = source.url;
        card.target = "_blank";
        card.rel = "noopener noreferrer";

        let faviconUrl = "";
        try {
          faviconUrl = `${new URL(source.url).origin}/favicon.ico`;
        } catch {
          faviconUrl = "";
        }
        const favicon = document.createElement("img");
        favicon.className = "source-favicon";
        if (faviconUrl) favicon.src = faviconUrl;
        favicon.alt = "";
        favicon.loading = "lazy";
        favicon.addEventListener("error", () => favicon.remove(), { once: true });

        const number = document.createElement("span");
        number.className = "source-number";
        number.textContent = String(index + 1).padStart(2, "0");

        const copy = document.createElement("span");
        copy.className = "source-copy";

        const title = document.createElement("strong");
        title.textContent = typeof source.title === "string" && source.title.trim() ? source.title : "Web kaynağı";
        copy.appendChild(title);

        const meta = document.createElement("span");
        meta.className = "source-meta";
        meta.textContent = `${sourceDomain(source.url)} › Kaynak`;
        copy.appendChild(meta);

        const details = [
          typeof source.description === "string" && source.description.trim() ? source.description.trim() : "",
          formatPublishedAt(source.publishedAt) ? `Yayın tarihi: ${formatPublishedAt(source.publishedAt)}` : "",
        ].filter(Boolean).join(" · ");
        if (details) {
          const detail = document.createElement("span");
          detail.className = "source-detail";
          detail.textContent = details;
          copy.appendChild(detail);
        }

        card.append(number, favicon, copy);
        list.appendChild(card);
      });

      if (list.children.length > 0) {
        section.appendChild(list);
        container.appendChild(section);
      }
    }

    function addMessage(role, text, sources = [], thinkingDurationMs = null) {
      if (welcomeBlock) welcomeBlock.hidden = true;
      const item = document.createElement("article");
      item.className = `message message-${role}`;
      item.innerHTML = `
        <div class="message-avatar" aria-hidden="true">${role === "assistant" ? `<img class="avatar-icon avatar-icon-ai" src="${LUXA_AVATAR_IMAGE}" alt="">` : `<img class="avatar-icon avatar-icon-user" src="${USER_AVATAR_IMAGE}" alt="">`}</div>
        <div class="message-bubble"></div>
      `;
      const bubble = item.querySelector(".message-bubble");
      if (role === "assistant") {
        const durationText = formatThinkingDuration(thinkingDurationMs);
        if (durationText) {
          const duration = document.createElement("div");
          duration.className = "thinking-duration";
          duration.setAttribute("aria-label", durationText);
          duration.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="7.5"></circle><path d="M12 9v4l2.5 1.5M9 3h6M12 5.5V3"></path></svg><span></span>`;
          duration.querySelector("span").textContent = durationText;
          bubble.appendChild(duration);
        }
      }
      const responseText = document.createElement("div");
      responseText.className = "message-text";
      responseText.textContent = text;
      bubble.appendChild(responseText);
      if (role === "assistant") addSources(bubble, sources);
      if (messages) {
        messages.appendChild(item);
        scrollToLatest(item);
      }
      return item;
    }

    function addStatusMessage(text, kind = "info", action = null) {
      const notice = document.createElement("div");
      notice.className = `connection-banner inline-notice ${kind}`;
      notice.setAttribute("role", kind === "error" ? "alert" : "status");
      if (kind === "loading") {
        notice.innerHTML = `<span class="loading-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="loading-label">${text}</span>`;
      } else {
        notice.innerHTML = `<span class="banner-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 8v4M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg></span><span></span>`;
        notice.querySelector("span:last-child").textContent = text;
      }
      if (kind === "error" && typeof action === "function") {
        const retryButton = document.createElement("button");
        retryButton.type = "button";
        retryButton.className = "retry-button";
        retryButton.textContent = "Tekrar dene";
        retryButton.addEventListener("click", () => {
          if (retryButton.disabled) return;
          retryButton.disabled = true;
          notice.remove();
          action();
        }, { once: true });
        notice.appendChild(retryButton);
      }
      if (messages) {
        messages.appendChild(notice);
        scrollToLatest(notice);
      }
      return notice;
    }

    async function requestAssistantReply() {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 70_000);
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ messages: chatMessages }),
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.ok || !payload.message?.content) {
          const error = new Error("request_failed");
          error.code = payload?.error?.code || "request_failed";
          throw error;
        }
        return {
          ...payload.message,
          sources: Array.isArray(payload.sources) ? payload.sources : [],
          thinkingDurationMs: payload.thinkingDurationMs,
        };
      } finally {
        window.clearTimeout(timeout);
      }
    }

    async function sendMessage(text) {
      if (!text || isPending) return;

      if (!currentChatId) currentChatId = createLocalId();
      chatMessages.push({ role: "user", content: text });
      saveCurrentChat();
      addMessage("user", text);
      if (messageInput) messageInput.value = "";
      resizeInput();
      setPending(true);
      const loadingNotice = addStatusMessage("LUXA AI düşünüyor", "loading");

      try {
        const assistantMessage = await requestAssistantReply();
        loadingNotice.remove();
        chatMessages.push({ role: "assistant", content: assistantMessage.content, sources: assistantMessage.sources, thinkingDurationMs: assistantMessage.thinkingDurationMs });
        saveCurrentChat();
        addMessage("assistant", assistantMessage.content, assistantMessage.sources, assistantMessage.thinkingDurationMs);
      } catch (error) {
        loadingNotice.remove();
        if (chatMessages.at(-1)?.role === "user
