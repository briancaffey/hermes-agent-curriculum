# Module 04: Gateway & Messaging Platforms

## 🎯 What You'll Learn

- How the gateway layer works
- Platform adapters (Telegram, Discord, Slack, etc.)
- Session management across platforms
- Slash command routing and autocomplete
- Background process notifications

---

## 4.1 Gateway Architecture Overview

### The Gateway Pattern

```python
# gateway/run.py - Main loop structure
while True:
    # Poll all connected platforms for new messages
    for platform in self.platforms.values():
        messages = platform.poll()
        
        for msg in messages:
            # Resolve which session this belongs to
            session_key = self._resolve_session(msg)
            session = self.session_store.get(session_key)
            
            # Dispatch to agent
            response = self.agent.chat(msg.text, session.context)
            
            # Send back to platform
            platform.send(msg.chat_id, response)
            
            # Persist conversation
            session.add_message(msg.role, msg.text)
```

### Key Components

| Component | File | Responsibility |
|-----------|------|----------------|
| **Main Loop** | `gateway/run.py` (255KB) | Polling, dispatch, delivery |
| **Session Store** | `gateway/session.py` | Conversation persistence |
| **Platform Adapters** | `gateway/platforms/` | Telegram, Discord, Slack, etc. |
| **Config** | `gateway/config.py` | Gateway settings |

---

## 4.2 Platform Adapters

### Telegram Adapter (`gateway/platforms/telegram.py`)

```python
class TelegramPlatform:
    def __init__(self, bot_token: str):
        self.bot = telegram.Bot(token=bot_token)
        self.offset = 0  # For polling updates
    
    def poll(self) -> list:
        """
        Fetch new messages from Telegram.
        
        Returns list of Message objects.
        """
        updates = self.bot.get_updates(offset=self.offset)
        
        messages = []
        for update in updates:
            if update.message:
                msg = Message(
                    chat_id=update.message.chat.id,
                    text=update.message.text,
                    role="user",
                    platform="telegram",
                )
                messages.append(msg)
                
                self.offset = update.update_id + 1
        
        return messages
    
    def send(self, chat_id: str, text: str):
        """Send a message to a Telegram chat."""
        # Split long messages (Telegram has 4096 char limit)
        for chunk in self._chunk_text(text):
            self.bot.send_message(chat_id=chat_id, text=chunk)
    
    def _chunk_text(self, text: str) -> list:
        """Split text into chunks under 4096 chars."""
        chunks = []
        while len(text) > 4096:
            # Find last newline before limit
            split_at = text.rfind('\n', 0, 4096)
            if split_at == -1:
                split_at = 4096
            chunks.append(text[:split_at])
            text = text[split_at:].lstrip()
        
        if text:
            chunks.append(text)
        
        return chunks
```

### Discord Adapter (`gateway/platforms/discord.py`)

```python
class DiscordPlatform:
    def __init__(self, bot_token: str):
        self.client = discord.Client(intents=discord.Intents.default())
        self.message_queue = asyncio.Queue()
        
        @self.client.event
        async def on_message(message):
            if message.author.bot:
                return
            
            # Queue the message for processing
            await self.message_queue.put(Message(
                chat_id=message.channel.id,
                text=message.content,
                role="user",
                platform="discord",
            ))
    
    def poll(self) -> list:
        """Fetch messages from queue."""
        messages = []
        while not self.message_queue.empty():
            messages.append(self.message_queue.get_nowait())
        return messages
    
    async def send(self, channel_id: str, text: str):
        """Send a message to a Discord channel."""
        channel = await self.client.fetch_channel(channel_id)
        await channel.send(text)
```

### Slack Adapter (`gateway/platforms/slack.py`)

```python
class SlackPlatform:
    def __init__(self, bot_token: str):
        self.client = slack_sdk.WebClient(token=bot_token)
        self.rtm_client = slack_sdk.RTMClient(token=bot_token)
        
        @self.rtm_client.on("message")
        async def on_message(event):
            # Process Slack message
            pass
    
    def poll(self) -> list:
        """Fetch messages from RTM or Events API."""
        # Implementation depends on Slack's API mode
        pass
```

---

## 4.3 Session Management

### Session Keys

Each conversation is identified by a unique key:

```python
# gateway/session.py
def make_session_key(platform: str, chat_id: str, thread_id: str = None) -> str:
    """
    Generate a unique session key.
    
    Examples:
        telegram:dm:5490634439          # DM with user
        telegram:group:-1001234567890   # Group chat
        discord:#engineering            # Discord channel
        cli                             # CLI (single session)
    """
    if thread_id:
        return f"{platform}:{chat_id}:{thread_id}"
    else:
        return f"{platform}:{chat_id}"
```

### Session Store

```python
class SessionStore:
    def __init__(self, db_path: str = "~/.hermes/state.db"):
        self.conn = sqlite3.connect(db_path)
        self._setup_tables()
    
    def _setup_tables(self):
        """Create SQLite tables with FTS5 for search."""
        cursor = self.conn.cursor()
        
        # Main sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                session_key TEXT PRIMARY KEY,
                session_id TEXT,
                created_at TIMESTAMP,
                updated_at TIMESTAMP,
                platform TEXT,
                chat_id TEXT,
                display_name TEXT
            )
        """)
        
        # Messages table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_key TEXT,
                role TEXT,  # 'user' or 'assistant'
                content TEXT,
                timestamp TIMESTAMP,
                FOREIGN KEY (session_key) REFERENCES sessions(session_key)
            )
        """)
        
        # FTS5 for full-text search
        cursor.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
                content,
                content='messages',
                content_rowid='id'
            )
        """)
        
        self.conn.commit()
    
    def get(self, session_key: str) -> Session:
        """Get or create a session."""
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT * FROM sessions WHERE session_key = ?",
            (session_key,)
        )
        row = cursor.fetchone()
        
        if row:
            return Session.from_row(row)
        else:
            # Create new session
            session_id = generate_session_id()
            cursor.execute("""
                INSERT INTO sessions (session_key, session_id, created_at, updated_at)
                VALUES (?, ?, ?, ?)
            """, (session_key, session_id, datetime.now(), datetime.now()))
            self.conn.commit()
            
            return Session(session_key=session_key, session_id=session_id)
    
    def add_message(self, session_key: str, role: str, content: str):
        """Add a message to a session."""
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO messages (session_key, role, content, timestamp)
            VALUES (?, ?, ?, ?)
        """, (session_key, role, content, datetime.now()))
        
        # Also add to FTS index
        cursor.execute("""
            INSERT INTO messages_fts(rowid, content)
            SELECT id, content FROM messages WHERE rowid = last_insert_rowid()
        """)
        
        # Update session timestamp
        cursor.execute("""
            UPDATE sessions SET updated_at = ? WHERE session_key = ?
        """, (datetime.now(), session_key))
        
        self.conn.commit()
    
    def search(self, query: str, limit: int = 10) -> list:
        """Search all messages using FTS5."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT m.*, s.display_name
            FROM messages_fts f
            JOIN messages m ON f.rowid = m.id
            JOIN sessions s ON m.session_key = s.session_key
            WHERE f MATCH ?
            ORDER BY m.timestamp DESC
            LIMIT ?
        """, (query, limit))
        
        return cursor.fetchall()
```

---

## 4.4 Slash Command Routing

### Central Registry (`hermes_cli/commands.py`)

All slash commands are defined in one place:

```python
@dataclass(frozen=True)
class CommandDef:
    """Definition of a slash command."""
    name: str                      # "resume"
    description: str               # "Resume a previously-named session"
    category: str                  # "Session"
    aliases: tuple[str, ...] = ()  # ("reset",)
    args_hint: str = ""            # "[name]"
    cli_only: bool = False         # Only in CLI?
    gateway_only: bool = False     # Only in messaging?

# Central registry
COMMAND_REGISTRY: list[CommandDef] = [
    CommandDef("new", "Start a new session", "Session",
               aliases=("reset",)),
    CommandDef("resume", "Resume a named session", "Session",
               args_hint="[name]"),
    # ... more commands
]
```

### CLI Dispatch (`hermes_cli/main.py`)

```python
def process_command(self, command: str) -> str:
    """
    Parse and dispatch a slash command in the CLI.
    
    Example: /resume my-session
    """
    # Parse command
    parts = command.strip().split()
    cmd_name = parts[0][1:]  # Remove leading slash
    args = ' '.join(parts[1:])
    
    # Resolve to canonical name (handles aliases)
    canonical = resolve_command(cmd_name)  # "resume"
    
    if not canonical:
        return f"Unknown command: {cmd_name}"
    
    # Dispatch
    if canonical == "new":
        return self._handle_new()
    elif canonical == "resume":
        return self._handle_resume(args)
    # ... more handlers
```

### Gateway Dispatch (`gateway/run.py`)

```python
async def handle_message(self, msg: Message) -> str:
    """
    Handle an incoming message from any platform.
    
    If it's a slash command, dispatch immediately.
    Otherwise, pass to agent for normal processing.
    """
    text = msg.text.strip()
    
    # Check if it's a slash command
    if text.startswith('/'):
        return await self._handle_slash_command(msg)
    
    # Normal message - send to agent
    session = self.session_store.get(msg.session_key)
    response = self.agent.chat(text, session.context)
    return response

async def _handle_slash_command(self, msg: Message) -> str:
    """
    Parse and dispatch a slash command in the gateway.
    
    Similar to CLI but platform-aware.
    """
    parts = msg.text.strip().split()
    cmd_name = parts[0][1:]  # Remove leading slash
    args = ' '.join(parts[1:])
    
    # Resolve to canonical name
    canonical = resolve_command(cmd_name)
    
    if not canonical:
        return f"Unknown command: {cmd_name}"
    
    # Check platform restrictions
    cmd_def = get_command_def(canonical)
    if cmd_def.cli_only:
        return "This command is only available in the CLI."
    if cmd_def.gateway_only and msg.platform != 'cli':
        return f"This command is only available on {msg.platform}."
    
    # Dispatch
    if canonical == "new":
        return await self._handle_new(msg)
    elif canonical == "resume":
        return await self._handle_resume(msg, args)
    # ... more handlers
```

### Autocomplete (`hermes_cli/commands.py`)

```python
class SlashCommandCompleter(Completer):
    """
    Tab completion for slash commands in the CLI.
    
    Provides suggestions as you type.
    """
    def __init__(self):
        # Build flat dict of all commands + aliases
        self.commands = {}
        for cmd_def in COMMAND_REGISTRY:
            self.commands[cmd_def.name] = cmd_def
            for alias in cmd_def.aliases:
                self.commands[alias] = cmd_def
    
    def get_completions(self, document, complete_event):
        """
        Suggest commands as user types.
        
        Example: User types "/re" → suggests "/resume", "/retry"
        """
        text = document.text_before_cursor
        
        if not text.startswith('/'):
            return
        
        # Extract partial command
        parts = text.split()
        partial = parts[-1]  # Last word after slash
        
        # Find matches
        for cmd_name, cmd_def in self.commands.items():
            if cmd_name.startswith(partial.lstrip('/')):
                yield Completion(
                    cmd_name,
                    start_position=-len(partial),
                    display_meta=cmd_def.description[:50],
                )
```

---

## 4.5 Background Process Notifications

### Check Interval Pattern

```python
# tools/terminal_tool.py
def terminal_tool(command: str, background: bool = False,
                  check_interval: int = None, **kwargs) -> str:
    """
    Execute a shell command.
    
    Args:
        command: Shell command to run
        background: Run asynchronously?
        check_interval: Seconds between status updates (gateway only)
    """
    if background and check_interval:
        # Start with periodic notifications
        proc = subprocess.Popen(
            command, shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )
        
        # Register watcher in gateway
        process_registry.register(task_id=kwargs.get('task_id'),
                                  proc=proc,
                                  check_interval=check_interval)
    
    # ... rest of implementation
```

### Gateway Watcher (`gateway/run.py`)

```python
class BackgroundWatcher:
    """
    Monitor background processes and push updates to users.
    
    Respects user's notification preferences from config.
    """
    def __init__(self, session_store: SessionStore):
        self.session_store = session_store
        self.watchers = {}  # task_id -> watcher thread
    
    def start_watching(self, task_id: str, proc: subprocess.Popen,
                       check_interval: int, chat_id: str):
        """
        Start watching a background process.
        
        Pushes updates to the user's chat at check_interval seconds.
        """
        def watcher_loop():
            while proc.poll() is None:
                time.sleep(check_interval)
                
                # Get latest output
                output = self._get_new_output(proc)
                
                if output:
                    # Check user preferences
                    prefs = self._get_notification_prefs(chat_id)
                    
                    if prefs == 'all':
                        self._send_update(chat_id, output)
        
        thread = threading.Thread(target=watcher_loop, daemon=True)
        thread.start()
        self.watchers[task_id] = thread
    
    def _get_notification_prefs(self, chat_id: str) -> str:
        """
        Get user's notification preferences.
        
        Options: 'all', 'result', 'error', 'off'
        """
        # Load from config.yaml or session settings
        return 'all'  # Default
```

### Config Option

```yaml
# ~/.hermes/config.yaml
display:
  background_process_notifications: all  # 'all', 'result', 'error', 'off'
```

---

## 4.6 Hands-On Exercise

### Exercise 1: Inspect Gateway Code

```bash
cd ~/git/nous-hermes-agent/gateway
```

Open `run.py` and find:
1. The main polling loop (search for `while True`)
2. Platform adapter initialization
3. Slash command dispatch logic
4. Session resolution

**Questions:**
- How does it handle multiple platforms simultaneously?
- Where are Telegram, Discord adapters initialized?
- What's the structure of a Message object?

### Exercise 2: Trace a Telegram Message

```python
# Simulate a Telegram message flow
from gateway.session import SessionStore
from gateway.run import Gateway

# Create session store
store = SessionStore()

# Get or create a session
session_key = "telegram:dm:5490634439"
session = store.get(session_key)

print(f"Session ID: {session.session_id}")
print(f"Platform: {session.platform}")
```

**Questions:**
- What session_key format is used for Telegram DMs?
- How does the session get persisted to SQLite?

### Exercise 3: List Slash Commands

```bash
# In your Telegram chat, try:
/help

# Or in CLI:
hermes
/help
```

**Observe:**
- What categories of commands are shown?
- Which commands have aliases (e.g., `/reset` = `/new`)?
- Are there any gateway-only commands you can't use in CLI?

### Exercise 4: Test Session Persistence

```bash
# Start Hermes CLI
hermes

# Send a message and get a response
"What's your name?"

# Exit with /quit
/quit

# Restart Hermes
hermes

# Check if history is preserved
/history
```

**Observe:**
- Is the previous conversation visible?
- What's the session ID now vs. before?
- How many messages are in history?

---

## 4.7 Common Pitfalls

### ❌ Don't Assume Single Session Per User

```python
# BAD: One user = one session
user_sessions = {"brian": session1}

# GOOD: One chat = one session (users can have multiple chats)
session_keys = {
    "telegram:dm:5490634439": session1,
    "telegram:group:-1001234567890": session2,
    "cli": session3,
}
```

### ❌ Don't Ignore Platform Limits

```python
# BAD: Send long messages as-is
def send(text):
    bot.send_message(chat_id, text)  # Telegram has 4096 char limit!

# GOOD: Chunk long messages
def send(text):
    for chunk in chunk_text(text, max_length=4096):
        bot.send_message(chat_id, chunk)
```

### ❌ Don't Block the Main Loop

```python
# BAD: Blocking I/O in gateway loop
def poll():
    time.sleep(5)  # Blocks entire gateway!
    return messages

# GOOD: Non-blocking or async
def poll():
    updates = bot.get_updates(timeout=10)  # Non-blocking
    return updates
```

---

## ✅ Module 4 Checklist

- [ ] Understand the gateway main loop structure
- [ ] Explain how platform adapters work (Telegram, Discord, Slack)
- [ ] Trace a message from arrival to response
- [ ] Understand session key format and persistence
- [ ] Explain slash command routing across CLI and gateway
- [ ] Complete all four exercises

---

**Next:** [Module 05: Sessions, Memory & Persistence](../05-sessions-memory/sessions-memory.md)
