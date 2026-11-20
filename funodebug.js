(() => {
  const MAX_LINES = 200;

  // --- panel ---
  const panel = document.createElement("div");
  Object.assign(panel.style, {
    position: "fixed",
    inset: "0 0 auto 0",
    zIndex: "2147483647",
    maxHeight: "40vh",
    overflowY: "auto",
    background: "#1e1e2e",
    color: "#cdd6f4",
    font: "13px/1.5 monospace",
    padding: "8px 12px",
    borderBottom: "2px solid #f38ba8",
    display: "none",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
  });
  const header = document.createElement("div");
  header.textContent = "⚠ DEBUG — press Esc to close";
  Object.assign(header.style, {
    color: "#f38ba8",
    fontWeight: "bold",
    marginBottom: "6px",
    cursor: "pointer",
  });
  header.onclick = hide;
  panel.appendChild(header);

  const body = document.createElement("div");
  panel.appendChild(body);

  // --- command input ---
  const inputRow = document.createElement("div");
  Object.assign(inputRow.style, {
    display: "flex",
    gap: "6px",
    marginTop: "6px",
    borderTop: "1px solid #45475a",
    paddingTop: "6px",
  });
  const prompt = document.createElement("span");
  prompt.textContent = ">";
  prompt.style.color = "#f38ba8";
  const input = document.createElement("textarea");
  Object.assign(input.style, {
    resize: "none",
    padding: "0",
    margin: "0",
    flex: "1",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#cdd6f4",
    font: "inherit",
    fieldSizing: "content",
    maxHeight: "10em",
    overflowY: "auto",
  });
  input.placeholder = "type a command…";
  inputRow.appendChild(prompt);
  inputRow.appendChild(input);
  panel.appendChild(inputRow);

  document.body
    ? document.body.appendChild(panel)
    : document.addEventListener("DOMContentLoaded", () =>
        document.body.appendChild(panel),
      );

  // --- log helper ---
  function log(type, msg) {
    const line = document.createElement("div");
    const colors = { error: "#f38ba8", warn: "#f9e2af", info: "#89b4fa" };
    line.style.color = colors[type] || "#cdd6f4";
    line.textContent = `[${new Date().toLocaleTimeString()}] ${type.toUpperCase()}: ${msg}`;
    body.appendChild(line);
    while (body.children.length > MAX_LINES) body.firstChild.remove();
    body.scrollTop = body.scrollHeight;
    show();
  }

  // --- command execution ---
  function runCommand() {
    const cmd = input.value.trim();
    if (!cmd) return;
    input.value = "";
    log("cmd", cmd);
    try {
      const result = eval(cmd);
      log("info", result === undefined ? "" : String(result));
    } catch (e) {
      log("error", e.message);
    }
  }
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.stopPropagation();
      e.preventDefault();
      runCommand();
    }
  });

  // --- visibility ---
  function show() {
    panel.style.display = "block";
  }
  function hide() {
    panel.style.display = "none";
  }
  function sync() {
    location.hash === "#debug" ? show() : hide();
  }

  // --- error capture ---
  window.addEventListener("error", (e) => {
    log(
      "error",
      `${e.message}  (${e.filename || "inline"}:${e.lineno}:${e.colno})`,
    );
  });
  window.addEventListener("unhandledrejection", (e) => {
    log("error", `Unhandled Promise: ${e.reason?.message || e.reason}`);
  });

  // also capture console.error / console.warn
  const origError = console.error;
  const origWarn = console.warn;
  const origLog = console.log;
  const origInfo = console.info;
  console.error = (...args) => {
    origError(...args);
    log("error", args.map(String).join(" "));
  };
  console.warn = (...args) => {
    origWarn(...args);
    log("warn", args.map(String).join(" "));
  };
  console.log = (...args) => {
    origLog(...args);
    log("info", args.map(String).join(" "));
  };
  console.info = (...args) => {
    origInfo(...args);
    log("info", args.map(String).join(" "));
  };
  console.clear = () => {
    origLog("Console cleared");
    body.innerHTML = "";
  };

  // --- controls ---
  window.addEventListener("hashchange", sync);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hide();
  });
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.code === "Backquote") {
      e.preventDefault();
      const newHash = location.hash === "#debug" ? "" : "#debug";
      window.history.replaceState(
        null,
        "",
        location.pathname + location.search + newHash,
      );
      sync();
    }
  });
  sync();
})();
