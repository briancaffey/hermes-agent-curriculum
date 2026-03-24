# Module 05: Sessions, Memory & Persistence

## 🎯 What You'll Learn

- Session storage architecture (SQLite + FTS5)
- How conversation history is persisted and retrieved
- The memory system (key-value store)
- User profiles and cross-session continuity
- Context compression strategies
- Searching past conversations

---

## 5.1 Session Storage Architecture

### SQLite Database Structure

```python
# hermes_state.py - SessionDB class
class SessionDB:
    """
    Persistent session storage using SQLite with FTS5 full-text search.
    
    Tables:
        - sessions: Metadata (session_key, timestamps, platform info)
        - messages: Conversation content (role, content, timestamp)
        - memories: Key-value user preferences and facts
    """
    
    def __init__(self, db_path: str = "~/.hermes/state.db"):
        self.conn = sqlite3.connect(db_path)
        self._setup_tables()
```

### Schema Definition

```python
# hermes_state.py - _setup_tables()
def _setup_tables(self):
    cursor = self.conn.cursor()
    
    # Sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_key TEXT PRIMARY KEY,
            session_id TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            platform TEXT NOT NULL,
            chat_id TEXT NOT NULL,
            display_name TEXT,
            input_tokens INTEGER DEFAULT 0,
            output_tokens INTEGER DEFAULT 0,
            total_tokens INTEGER DEFAULT 0
        )
    """)
    
    # Messages table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_key TEXT NOT NULL,
            role TEXT NOT NULL,  -- 'user' or 'assistant'
            content TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_key) REFERENCES sessions(session_key)
        )
    """)
    
    # FTS5 virtual table for full-text search
    cursor.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
            content,
            role,
            content='messages',
            content_rowid='id'
        )
    """)
    
    # Indexes for performance
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_messages_session
        ON messages(session_key, timestamp)
    """)
    
    self.conn.commit()
```

### Session Key Format

```python
# Unique identifier for each conversation thread
def make_session_key(platform: str, chat_id: str, thread_id: str = None) -> str:
    """
    Generate a unique session key.
    
    Examples:
        cli                                    # CLI mode (single session)
        telegram:dm:5490634439                # Telegram DM with user
        telegram:group:-1001234567890         # Telegram group chat
        discord:#engineering                  # Discord channel
        slack:C012AB3CD                       # Slack channel/user
    """
    if thread_id:
        return f"{platform}:{chat_id}:{thread_id}"
    else:
        return f"{platform}:{chat_id}"
```

---

## 5.2 Session CRUD Operations

### Create/Get Session

```python
# hermes_state.py
def get_or_create_session(self, platform: str, chat_id: str,
                          display_name: str = None) -> Session:
    """
    Get existing session or create a new one.
    
    Returns Session object with metadata and message history.
    """
    session_key = self.make_session_key(platform, chat_id)
    
    cursor = self.conn.cursor()
    
    # Try to find existing session
    cursor.execute("""
        SELECT * FROM sessions WHERE session_key = ?
    """, (session_key,))
    
    row = cursor.fetchone()
    
    if row:
        # Return existing session
        return Session.from_db_row(row)
    else:
        # Create new session
        session_id = self._generate_session_id()
        created_at = datetime.now()
        
        cursor.execute("""
            INSERT INTO sessions 
            (session_key, session_id, platform, chat_id, display_name, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (session_key, session_id, platform, chat_id, display_name, created_at))
        
        self.conn.commit()
        
        return Session(
            session_key=session_key,
            session_id=session_id,
            platform=platform,
            chat_id=chat_id,
            display_name=display_name,
            messages=[]  # Fresh session
        )
```

### Save Message

```python
# hermes_state.py
def add_message(self, session_key: str, role: str, content: str):
    """
    Add a message to a session and update FTS index.
    
    This is called after every user/assistant turn.
    """
    cursor = self.conn.cursor()
    
    # Insert message
    cursor.execute("""
        INSERT INTO messages (session_key, role, content)
        VALUES (?, ?, ?)
    """, (session_key, role, content))
    
    # Sync to FTS index
    cursor.execute("""
        INSERT INTO messages_fts(rowid, content, role)
        SELECT id, content, role FROM messages 
        WHERE rowid = last_insert_rowid()
    """)
    
    # Update session timestamp and token counts
    if role == 'user':
        cursor.execute("""
            UPDATE sessions SET updated_at = ?, input_tokens = input_tokens + ?
            WHERE session_key = ?
        """, (datetime.now(), estimate_tokens(content), session_key))
    else:
        cursor.execute("""
            UPDATE sessions SET updated_at = ?, output_tokens = output_tokens + ?
            WHERE session_key = ?
        """, (datetime.now(), estimate_tokens(content), session_key))
    
    self.conn.commit()
```

### Get Session History

```python
# hermes_state.py
def get_messages(self, session_key: str, limit: int = None,
                 offset: int = 0) -> list:
    """
    Retrieve conversation history for a session.
    
    Args:
        session_key: The session identifier
        limit: Max messages to return (None = all)
        offset: Skip first N messages (for pagination)
    
    Returns:
        List of Message objects in chronological order
    """
    cursor = self.conn.cursor()
    
    query = """
        SELECT role, content, timestamp FROM messages
        WHERE session_key = ?
        ORDER BY timestamp ASC
    """
    
    params = [session_key]
    
    if limit:
        query += " LIMIT ? OFFSET ?"
        params.extend([limit, offset])
    else:
        query += f" LIMIT 1000 OFFSET {offset}"  # Safety cap
    
    cursor.execute(query, params)
    
    return [
        Message(role=row[0], content=row[1], timestamp=row[2])
        for row in cursor.fetchall()
    ]
```

---

## 5.3 Full-Text Search with FTS5

### SQLite FTS5 Overview

FTS5 is SQLite's full-text search extension. It creates a virtual table that:
- Indexes text content for fast searching
- Supports boolean queries (AND, OR, NOT)
- Returns results ranked by relevance

### Search Implementation

```python
# hermes_state.py
def search_messages(self, query: str, limit: int = 10,
                    platform: str = None) -> list:
    """
    Search all messages using FTS5 full-text search.
    
    Args:
        query: Search terms (FTS5 syntax supported)
        limit: Max results to return
        platform: Filter by platform (optional)
    
    Returns:
        List of (session_key, role, content, timestamp, display_name) tuples
    """
    cursor = self.conn.cursor()
    
    # Build query with optional platform filter
    sql = """
        SELECT DISTINCT m.session_key, m.role, m.content, m.timestamp,
               s.display_name, s.platform
        FROM messages_fts f
        JOIN messages m ON f.rowid = m.id
        JOIN sessions s ON m.session_key = s.session_key
        WHERE f MATCH ?
    """
    
    params = [query]
    
    if platform:
        sql += " AND s.platform = ?"
        params.append(platform)
    
    sql += " ORDER BY m.timestamp DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(sql, params)
    
    return [
        {
            'session_key': row[0],
            'role': row[1],
            'content': row[2],
            'timestamp': row[3],
            'display_name': row[4],
            'platform': row[5]
        }
        for row in cursor.fetchall()
    ]
```

### FTS5 Query Syntax

```python
# Examples of valid search queries
search_messages("terminal AND python")      # Both terms required
search_messages("git OR github")            # Either term
search_messages("NOT docker")               # Exclude term
search_messages("\"error message\"")        # Exact phrase
search_messages("bug*")                     # Wildcard (prefix)
```

### LLM-Powered Summarization

```python
# agent/auxiliary_client.py
def summarize_search_results(results: list, query: str) -> str:
    """
    Use an LLM to summarize search results for the user.
    
    This provides a natural language summary instead of raw matches.
    """
    context = "\n\n---\n\n".join([
        f"[{r['timestamp']}] {r['display_name']} ({r['platform']}):\n{r['content']}"
        for r in results[:10]  # Top 10 matches
    ])
    
    prompt = f"""
    Search query: "{query}"
    
    Found {len(results)} matching messages from past conversations.
    
    Summarize what the user was asking about or working on:
    
    {context}
    
    Summary:
    """
    
    summary = call_llm(prompt, model="small/cheap")
    return summary
```

---

## 5.4 Memory System

### Key-Value Storage

```python
# hermes_state.py - MemoryStore class
class MemoryStore:
    """
    Simple key-value store for persistent facts and preferences.
    
    Stored in ~/.hermes/memories/ as individual JSON files.
    """
    
    def __init__(self, base_path: str = "~/.hermes/memories"):
        self.base_path = os.path.expanduser(base_path)
        os.makedirs(self.base_path, exist_ok=True)
    
    def get(self, key: str) -> Optional[str]:
        """Get a memory value by key."""
        path = os.path.join(self.base_path, f"{key}.json")
        
        if not os.path.exists(path):
            return None
        
        with open(path) as f:
            data = json.load(f)
        
        return data.get('value')
    
    def set(self, key: str, value: str):
        """Set a memory value."""
        path = os.path.join(self.base_path, f"{key}.json")
        
        with open(path, 'w') as f:
            json.dump({
                'key': key,
                'value': value,
                'updated_at': datetime.now().isoformat()
            }, f, indent=2)
    
    def delete(self, key: str):
        """Delete a memory."""
        path = os.path.join(self.base_path, f"{key}.json")
        
        if os.path.exists(path):
            os.remove(path)
    
    def list_all(self) -> dict:
        """List all memories as {key: value} dict."""
        memories = {}
        
        for filename in os.listdir(self.base_path):
            if filename.endswith('.json'):
                key = filename[:-5]  # Remove .json
                memories[key] = self.get(key)
        
        return memories
```

### Memory Tool

```python
# tools/memory_tool.py
def memory_tool(action: str, key: str = None, value: str = None) -> str:
    """
    Manage persistent memories.
    
    Actions:
        - get: Retrieve a memory by key
        - set: Store a memory (key + value)
        - delete: Remove a memory
        - list: Show all memories
    """
    store = MemoryStore()
    
    if action == 'get':
        result = store.get(key)
        if result is None:
            return json.dumps({"error": f"No memory found for key: {key}"})
        return json.dumps({"key": key, "value": result})
    
    elif action == 'set':
        store.set(key, value)
        return json.dumps({"success": True, "key": key})
    
    elif action == 'delete':
        store.delete(key)
        return json.dumps({"success": True, "key": key})
    
    elif action == 'list':
        memories = store.list_all()
        return json.dumps({"memories": memories})
```

### Automatic Memory Nudges

```python
# agent/auxiliary_client.py - Periodic memory maintenance
def periodic_memory_nudge(session_history: list):
    """
    Analyze conversation and suggest new memories to store.
    
    This runs periodically (e.g., every 10 turns) to help the agent
    remember important facts about the user.
    """
    prompt = f"""
    Based on this conversation, what important facts about the user
    should be remembered for future sessions?
    
    Examples:
        - User's name is Brian
        - User prefers Python over JavaScript
        - User works on a homelab project
        - User's favorite color is orange
    
    Conversation:
    {session_history[-20:]}  # Last 20 turns
    
    Suggested memories (one per line, key=value format):
    """
    
    suggestions = call_llm(prompt)
    
    # Parse and store suggestions
    for line in suggestions.strip().split('\n'):
        if '=' in line:
            key, value = line.split('=', 1)
            memory_tool(action='set', key=key.strip(), value=value.strip())
```

---

## 5.5 User Profiles

### Profile Structure

```yaml
# ~/.hermes/config.yaml (user profile section)
user:
  name: "Brian Caffey"
  timezone: "America/New_York"
  preferences:
    model: "anthropic/claude-opus-4.6"
    personality: "warm, playful assistant"
    display:
      skin: "default"
      verbose: true
```

### Loading User Profile

```python
# hermes_cli/config.py
def load_user_profile() -> dict:
    """
    Load user-specific preferences from config.yaml.
    
    This is injected into the system prompt for personalization.
    """
    config_path = os.path.expanduser("~/.hermes/config.yaml")
    
    if not os.path.exists(config_path):
        return {}  # Default profile
    
    with open(config_path) as f:
        config = yaml.safe_load(f)
    
    return {
        'name': config.get('user', {}).get('name'),
        'timezone': config.get('user', {}).get('timezone'),
        'preferences': config.get('user', {}).get('preferences', {}),
    }
```

### Profile in System Prompt

```python
# agent/prompt_builder.py
def build_system_prompt(user_profile: dict = None, **kwargs):
    """
    Construct the full system prompt.
    
    Includes user profile for personalization.
    """
    parts = [
        CORE_SYSTEM_PROMPT,
    ]
    
    if user_profile:
        profile_text = f"""
---
User Profile:
  Name: {user_profile.get('name', 'User')}
  Timezone: {user_profile.get('timezone', 'UTC')}
  Preferences:
{yaml.dump(user_profile.get('preferences', {}), indent=4)}
"""
        parts.append(profile_text)
    
    return "\n\n---\n\n".join(parts)
```

---

## 5.6 Context Compression Strategies

### Why Compress?

- LLM context limits (128K, 200K tokens)
- Cost reduction (fewer input tokens)
- Performance (faster API calls with smaller contexts)

### Automatic Compression

```python
# agent/context_compressor.py
def compress_context(messages: list, max_tokens: int = 100000) -> list:
    """
    Compress conversation history when it exceeds token limit.
    
    Strategy:
        1. Keep system prompt + recent N turns intact
        2. Summarize older turns into a single block
        3. Preserve tool results (they contain important state)
    """
    if count_tokens(messages) <= max_tokens:
        return messages  # No compression needed
    
    # Separate recent and old
    recent_count = 15  # Keep last 15 turns intact
    recent = messages[-recent_count:]
    old = messages[:-recent_count]
    
    # Summarize older conversation
    summary = summarize_conversation(old)
    
    return [
        {
            "role": "system",
            "content": (
                f"[Context compressed. Previous conversation summarized below.]\n\n"
                f"{summary}\n\n"
                f"---\n\nRecent conversation follows:"
            )
        },
        *recent
    ]
```

### Manual Compression Command

```python
# hermes_cli/main.py - /compress command
@slash_command("compress")
def compress(session: Session, target_tokens: int = 50000):
    """
    Manually compress conversation context.
    
    Usage: /compress [target_tokens]
    """
    original_count = count_tokens(session.messages)
    
    compressed = compress_context(session.messages, target_tokens)
    session.messages = compressed
    
    new_count = count_tokens(compressed)
    reduction = ((original_count - new_count) / original_count) * 100
    
    return f"Context compressed from {original_count:,} to {new_count:,} tokens ({reduction:.1f}% reduction)"
```

---

## 5.7 Hands-On Exercise

### Exercise 1: Inspect Your Session Database

```bash
# Navigate to Hermes home
cd ~/.hermes

# Open SQLite database
sqlite3 state.db

# List tables
.tables

# See your sessions
SELECT session_key, session_id, platform, display_name, created_at 
FROM sessions 
ORDER BY updated_at DESC;

# See message count per session
SELECT session_key, COUNT(*) as msg_count 
FROM messages 
GROUP BY session_key 
ORDER BY msg_count DESC;

# Search for specific content
SELECT role, substr(content, 1, 100) 
FROM messages_fts 
WHERE messages_fts MATCH 'terminal OR python' 
LIMIT 5;

# Exit SQLite
.quit
```

### Exercise 2: Test FTS5 Search

```python
# In Python shell
cd ~/git/nous-hermes-agent
source venv/bin/activate

>>> from hermes_state import SessionDB
>>> db = SessionDB()
>>> 
>>> # Search for specific terms
>>> results = db.search_messages("terminal", limit=5)
>>> for r in results:
...     print(f"[{r['timestamp']}] {r['role']}: {r['content'][:100]}")
```

**Questions:**
- How many results did you get?
- What's the relevance ranking based on?

### Exercise 3: Inspect Memory Files

```bash
# List all memory files
ls -la ~/.hermes/memories/

# Read a specific memory
cat ~/.hermes/memories/user_name.json

# Or list via CLI (if supported)
hermes
/memory list
```

**Observe:**
- What memories are stored?
- How is the data formatted?

### Exercise 4: Test Context Compression

```bash
# Start Hermes CLI
hermes

# Have a long conversation (or load an existing one)
# Then trigger compression
/compress 50000

# Check token usage
/usage
```

**Observe:**
- How many tokens before compression?
- How many after?
- Is the conversation still usable?

---

## 5.8 Common Pitfalls

### ❌ Don't Ignore Token Limits

```python
# BAD: No context size checking
messages = build_context()  # Could be millions of tokens!
response = llm.chat(messages)

# GOOD: Check and compress
if count_tokens(messages) > MAX_TOKENS * 0.9:
    messages = compress_context(messages, MAX_TOKENS * 0.8)
```

### ❌ Don't Store Sensitive Data in Memories

```python
# BAD: Storing secrets as memories
memory_tool('set', 'api_key', 'sk-1234567890abcdef')

# GOOD: Use environment variables or secure vaults
os.environ['API_KEY'] = 'sk-1234567890abcdef'
```

### ❌ Don't Assume Session Continuity

```python
# BAD: Assuming session persists forever
session = db.get(session_key)
# ... hours later ...
session.messages  # Might be stale!

# GOOD: Always reload from database
def get_current_session(session_key):
    return db.get(session_key)  # Fresh read each time
```

---

## ✅ Module 5 Checklist

- [ ] Understand SQLite schema for sessions and messages
- [ ] Explain FTS5 full-text search integration
- [ ] Trace how messages are persisted after each turn
- [ ] Understand memory system (key-value store)
- [ ] Explain context compression strategies
- [ ] Complete all four exercises

---

**Next:** [Module 06: Skills System & Self-Improvement](../06-skills-learning/README.md)
