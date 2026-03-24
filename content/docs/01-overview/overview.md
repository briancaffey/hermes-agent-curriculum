# Module 01: Overview & Mental Model

## 🎯 What You'll Learn

- The big picture: what Hermes Agent actually is
- High-level architecture diagram
- Key components and their responsibilities
- How data flows through the system
- Where to find things in the codebase

---

## 1.1 What is Hermes Agent?

Hermes is a **tool-using AI agent** that can:
- Chat with you naturally (CLI or messaging apps)
- Execute tools (terminal, files, web, browser, etc.)
- Remember past conversations and learn from experience
- Run autonomously on schedules or in the background
- Delegate work to subagents for parallel processing

### Key Design Principles

1. **Model-agnostic** — Use any LLM provider (OpenRouter, Nous Portal, local, etc.)
2. **Platform-agnostic** — Same agent, multiple interfaces (CLI, Telegram, Discord...)
3. **Self-improving** — Creates and refines skills from experience
4. **Persistent** — Remembers across sessions via SQLite + memory system
5. **Research-ready** — Batch processing, trajectory logging, RL environments

---

## 1.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACES                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   CLI    │  │ Telegram │  │ Discord  │  │ Slack... │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼────────────┼────────────┼────────────┼──────────────┘
        │            │            │            │
        └────────────┴─────┬──────┴────────────┘
                           │
              ┌────────────▼────────────┐
              │     GATEWAY LAYER       │
              │  (gateway/run.py)       │
              │  - Message routing      │
              │  - Platform adapters    │
              │  - Session management   │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │     AGENT CORE          │
              │  (run_agent.py)         │
              │  - Conversation loop    │
              │  - Tool orchestration   │
              │  - Context building     │
              └────────────┬────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐ ┌──────▼───────┐ ┌────────▼────────┐
│   TOOL LAYER   │ │  MEMORY LAYER│ │  SKILLS LAYER   │
│ (tools/*.py)   │ │(hermes_state.│ │ (optional-skills│
│ - terminal     │ │      py)     │ │  + ~/.hermes/   │
│ - files        │ │ - sessions   │ │    skills/)     │
│ - web          │ │ - memories   │ │ - skill defs    │
│ - browser      │ │ - search     │ │ - templates     │
└────────────────┘ └──────────────┘ └─────────────────┘
```

---

## 1.3 Core Components Deep Dive

### Gateway Layer (`gateway/`)
**Purpose:** Bridge between messaging platforms and the agent core.

| File | Responsibility |
|------|----------------|
| `run.py` (255KB!) | Main gateway loop, message dispatch, slash commands |
| `session.py` | SessionStore — persists conversations to SQLite |
| `platforms/` | Telegram, Discord, Slack adapters |
| `config.py` | Gateway configuration |

**Key Concept:** The gateway runs as a **separate process** from the CLI. It polls for incoming messages and dispatches them to the agent.

---

### Agent Core (`run_agent.py`, `model_tools.py`)
**Purpose:** The brain — manages conversations and tool execution.

| File | Responsibility |
|------|----------------|
| `run_agent.py` | AIAgent class, conversation loop |
| `model_tools.py` | Tool discovery, function call handling |
| `cli.py` | Interactive CLI (separate from gateway) |

**Key Concept:** The agent loop is **synchronous**: receive message → build context → call LLM → execute tools → repeat.

---

### Tools Layer (`tools/`)
**Purpose:** Implementations of all callable functions.

```
tools/
├── registry.py        # Central tool registry (schemas + dispatch)
├── terminal_tool.py   # Shell command execution
├── file_tools.py      # Read/write/search/patch files
├── web_tools.py       # Web search + extraction
├── browser_tool.py    # Browser automation (Browserbase)
├── delegate_tool.py   # Spawn subagents
├── mcp_tool.py        # MCP client (~1050 lines)
└── ... (20+ more)
```

**Key Concept:** All tools register themselves with `registry.register()` at import time. The registry builds the schema sent to the LLM.

---

### Memory Layer (`hermes_state.py`)
**Purpose:** Persistent storage for sessions, memories, and search.

| Feature | Implementation |
|---------|----------------|
| Sessions | SQLite with FTS5 full-text search |
| Memories | Key-value store in `~/.hermes/memories/` |
| User profile | JSON in `~/.hermes/config.yaml` |

---

### Skills Layer (`optional-skills/`, `~/.hermes/skills/`)
**Purpose:** Procedural memory — reusable workflows.

```
skill/
├── SKILL.md           # Instructions (YAML frontmatter + markdown)
├── references/        # Supporting docs
├── templates/         # Reusable templates
└── scripts/          # Helper Python scripts
```

**Key Concept:** Skills are **loaded as user messages**, not system prompts — preserves prompt caching.

---

## 1.4 Data Flow: A Typical Turn

Let's trace what happens when you send a message:

### Step 1: Message Arrival (Gateway)
```python
# gateway/run.py - Main loop
while True:
    messages = platform.poll()  # Telegram, Discord, etc.
    for msg in messages:
        session = session_store.get(msg.chat_id)
        response = agent.chat(msg.text, session.context)
        platform.send(response)
```

### Step 2: Context Building (Agent Core)
```python
# run_agent.py - AIAgent.run_conversation()
messages = [
    {"role": "system", "content": system_prompt},
    *session.history,  # Past conversation
    {"role": "user", "content": new_message}
]
tool_schemas = registry.get_available_tools()  # From enabled toolsets
```

### Step 3: LLM Call (Model Tools)
```python
# model_tools.py
response = client.chat.completions.create(
    model="anthropic/claude-opus-4.6",
    messages=messages,
    tools=tool_schemas
)
```

### Step 4: Tool Execution (Registry)
```python
# model_tools.py - handle_function_call()
if response.tool_calls:
    for tool_call in response.tool_calls:
        result = registry.dispatch(tool_call.name, tool_call.args)
        messages.append({"role": "tool", "content": result})
```

### Step 5: Response (Back to Gateway)
```python
# Agent returns final text → Gateway sends to platform
platform.send(final_response)
session_store.save(history + [user_msg, assistant_msg])
```

---

## 1.5 File Dependency Chain

From the AGENTS.md documentation:

```
tools/registry.py  (no deps — imported by all tool files)
       ↑
tools/*.py  (each calls registry.register() at import time)
       ↑
model_tools.py  (imports tools/registry + triggers tool discovery)
       ↑
run_agent.py, cli.py, batch_runner.py, environments/
```

**Why this matters:** If you add a new tool:
1. Create `tools/my_tool.py` with `registry.register()`
2. Add import in `model_tools.py` `_discover_tools()`
3. Add to toolset in `toolsets.py`

---

## 1.6 Key Files to Explore First

| File | Lines | What It Does |
|------|-------|--------------|
| `run_agent.py` | ~800 | Core agent loop |
| `model_tools.py` | ~500 | Tool orchestration |
| `tools/registry.py` | ~300 | Tool registration + dispatch |
| `gateway/run.py` | ~2500 | Gateway main loop (large but readable) |
| `hermes_cli/commands.py` | ~770 | Slash command registry |
| `hermes_state.py` | ~950 | Session storage + search |

---

## 1.7 Hands-On Exercise

### Exercise 1: Trace the Code

1. Open `~/git/nous-hermes-agent/run_agent.py`
2. Find the `AIAgent.run_conversation()` method (around line 150)
3. Read through the main while loop — identify where:
   - The LLM is called
   - Tool results are appended to messages
   - The final response is returned

### Exercise 2: Find Your Session

```bash
# Look at your current session file
cat ~/.hermes/sessions/session_20260322_124359_6b542f4e.json | head -50
```

What fields do you see? What does `session_key` mean?

### Exercise 3: List Available Tools

```bash
# In your Telegram chat, try:
/tools list

# Or in CLI:
cd ~/git/nous-hermes-agent
source venv/bin/activate
hermes
tools list
```

How many tools are enabled? What toolsets do they belong to?

---

## 1.8 Common Questions

**Q: Why is `gateway/run.py` so large (255KB)?**
A: It contains the main loop, all platform adapters, slash command handling, and delivery logic — essentially the entire messaging interface.

**Q: What's the difference between CLI and gateway?**
A: CLI (`hermes_cli/main.py`) is for interactive terminal use. Gateway (`gateway/run.py`) runs as a background service polling messaging platforms.

**Q: How does the agent "know" which tools to offer the LLM?**
A: `model_tools.py` builds tool schemas from the registry based on enabled toolsets in config.

**Q: Where do skills come from?**
A: Built-in skills are in `optional-skills/`. User-installed skills go in `~/.hermes/skills/`.

---

## ✅ Module 1 Checklist

- [ ] Understand the high-level architecture
- [ ] Know where key components live in the codebase
- [ ] Trace a message through the system (gateway → agent → tools → response)
- [ ] Complete all three exercises

---

**Next:** [Module 02: Core Agent Loop & Conversation Flow](../02-core-loop/core-loop.md)
