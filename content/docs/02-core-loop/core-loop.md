# Module 02: Core Agent Loop & Conversation Flow

## 🎯 What You'll Learn

- The synchronous agent loop in detail
- How context is built for each LLM call
- Tool discovery and schema generation
- Function call handling and result injection
- Context compression strategies
- Iteration limits and budget management

---

## 2.1 The Agent Loop: Step by Step

The entire agent logic lives in `run_agent.py`. Let's break it down:

### Entry Point: `AIAgent.chat()`

```python
# run_agent.py (simplified)
class AIAgent:
    def chat(self, message: str) -> str:
        """Simple interface — returns final response string."""
        result = self.run_conversation(user_message=message)
        return result["final_response"]
```

### The Real Work: `run_conversation()`

```python
def run_conversation(self, user_message: str, system_message: str = None,
                     conversation_history: list = None, task_id: str = None) -> dict:
    """
    Main agent loop. Returns dict with final_response + messages.
    
    This is where the magic happens — synchronous turn-by-turn execution.
    """
```

---

## 2.2 The Core Loop (Simplified)

```python
# run_agent.py - Main loop structure
api_call_count = 0
while api_call_count < self.max_iterations and self.iteration_budget.remaining > 0:
    # Step 1: Build context for this turn
    messages = self._build_context(user_message, conversation_history)
    tool_schemas = self._get_tool_definitions()
    
    # Step 2: Call the LLM
    response = client.chat.completions.create(
        model=self.model,
        messages=messages,
        tools=tool_schemas if tool_schemas else None,
        temperature=self.temperature,
    )
    
    # Step 3: Check for tool calls
    if response.tool_calls:
        # Execute each tool and inject results
        for tool_call in response.tool_calls:
            result = handle_function_call(
                tool_call.name, 
                tool_call.args, 
                task_id=task_id
            )
            messages.append({
                "role": "tool",
                "name": tool_call.name,
                "content": result
            })
        api_call_count += 1
    else:
        # No tools — LLM is done, return response
        return {
            "final_response": response.content,
            "messages": messages,
            "api_calls": api_call_count,
        }
```

---

## 2.3 Context Building

### System Prompt Assembly

```python
# agent/prompt_builder.py
def build_system_prompt(
    personality: str,
    enabled_toolsets: list,
    skills: list = None,
    user_profile: dict = None,
) -> str:
    """
    Constructs the system prompt from multiple sources.
    
    Order matters for prompt caching!
    """
    parts = [
        CORE_SYSTEM_PROMPT,           # Fixed base
        f"Personality: {personality}",
        format_tool_descriptions(enabled_toolsets),
    ]
    
    if skills:
        parts.append(format_skills(skills))  # Loaded as user message, not system!
    
    if user_profile:
        parts.append(f"User profile: {user_profile}")
    
    return "\n\n---\n\n".join(parts)
```

### Conversation History

```python
# run_agent.py - _build_context()
def _build_context(self, user_message: str, conversation_history: list = None):
    messages = [
        {"role": "system", "content": self.system_prompt},
    ]
    
    if conversation_history:
        # Compress if needed
        if len(conversation_history) > self.context_threshold:
            conversation_history = self._compress_context(conversation_history)
        messages.extend(conversation_history)
    
    messages.append({"role": "user", "content": user_message})
    return messages
```

---

## 2.4 Tool Discovery & Schema Generation

### The Registry Pattern

All tools register themselves at import time:

```python
# tools/registry.py
class ToolRegistry:
    def __init__(self):
        self._tools = {}  # name -> tool info
        self._toolsets = defaultdict(list)  # toolset -> [tool names]
    
    def register(self, name: str, toolset: str, schema: dict, handler: Callable,
                 check_fn: Callable = None, requires_env: list = None):
        """
        Register a tool. Called at import time in each tool file.
        """
        self._tools[name] = {
            "schema": schema,
            "handler": handler,
            "check_fn": check_fn,  # Optional availability check
            "requires_env": requires_env or [],
            "toolset": toolset,
        }
```

### Tool Discovery in Model Tools

```python
# model_tools.py - _discover_tools()
def _discover_tools(self) -> dict:
    """
    Collect all registered tools, filter by enabled toolsets.
    
    Returns: {tool_name: schema_dict}
    """
    available = {}
    for name, info in registry._tools.items():
        # Check if toolset is enabled
        if info["toolset"] not in self.enabled_toolsets:
            continue
        
        # Check environment requirements
        if info.get("requires_env"):
            if not all(os.getenv(env) for env in info["requires_env"]):
                continue  # Skip if API keys missing
        
        # Check availability function
        if info.get("check_fn") and not info["check_fn"]():
            continue
        
        available[name] = info["schema"]
    
    return available
```

### Post-Processing: Cross-Tool References

```python
# model_tools.py - get_tool_definitions()
def get_tool_definitions(self) -> list:
    schemas = self._discover_tools()
    
    # Add dynamic cross-references (avoid hardcoded mentions)
    for name, schema in schemas.items():
        if "browser_navigate" in name and "web_search" in schemas:
            # Dynamically add reference if both tools available
            schema["description"] += "\nYou can also use web_search to find URLs."
    
    return list(schemas.values())
```

**Why dynamic?** If a tool mentions another by name but that tool is disabled, the LLM will hallucinate calls to non-existent tools.

---

## 2.5 Function Call Handling

### Dispatch Logic

```python
# model_tools.py - handle_function_call()
def handle_function_call(tool_name: str, args_json: str, task_id: str = None) -> str:
    """
    Execute a tool call and return JSON result.
    
    All handlers MUST return JSON strings!
    """
    # Parse arguments
    try:
        args = json.loads(args_json)
    except json.JSONDecodeError:
        return json.dumps({"error": f"Invalid JSON: {args_json}"})
    
    # Find handler
    if tool_name not in registry._tools:
        return json.dumps({"error": f"Unknown tool: {tool_name}"})
    
    tool_info = registry._tools[tool_name]
    handler = tool_info["handler"]
    
    # Execute with task_id for background process tracking
    try:
        result = handler(args, task_id=task_id)
        return result  # Already a JSON string from the handler
    except Exception as e:
        return json.dumps({"error": str(e), "tool": tool_name})
```

### Example: Terminal Tool

```python
# tools/terminal_tool.py
def terminal_tool(command: str, background: bool = False, 
                  timeout: int = 180, task_id: str = None) -> str:
    """
    Execute a shell command.
    
    Returns JSON with output, exit_code, and optionally process_id.
    """
    if background:
        # Start background process
        proc = subprocess.Popen(
            command, shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )
        
        # Register with process registry for tracking
        process_registry.register(task_id, proc)
        
        return json.dumps({
            "status": "running",
            "process_id": task_id,
            "message": f"Started background process: {command[:50]}..."
        })
    else:
        # Foreground - wait for completion
        result = subprocess.run(
            command, shell=True,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        
        return json.dumps({
            "output": result.stdout,
            "error": result.stderr,
            "exit_code": result.returncode
        })
```

---

## 2.6 Context Compression

### Why Compress?

LLMs have context limits (e.g., 128K, 200K tokens). As conversations grow, we need to:
- Remove redundant information
- Summarize older turns
- Keep recent context intact

### Automatic Compression

```python
# agent/context_compressor.py
def compress_context(messages: list, max_tokens: int) -> list:
    """
    Compress conversation history when it exceeds token limit.
    
    Strategy:
    1. Keep system prompt + recent N turns intact
    2. Summarize older turns into a single block
    3. Preserve tool results (they contain important state)
    """
    if count_tokens(messages) <= max_tokens:
        return messages
    
    # Separate recent and old
    recent = messages[-10:]  # Keep last 10 turns
    old = messages[:-10]
    
    # Summarize old conversation
    summary = summarize_conversation(old)
    
    return [
        {"role": "system", "content": "[Context compressed. Previous conversation summarized below.]\n\n" + summary},
        *recent,
    ]
```

### Manual Compression

```python
# User can trigger with /compress command
@slash_command("compress")
def compress(session: Session):
    """Manually compress conversation context."""
    compressed = compress_context(session.history, target_tokens=50000)
    session.history = compressed
    return "Context compressed. Token count reduced by X%."
```

---

## 2.7 Iteration Budget & Loop Control

### Max Iterations

```python
# run_agent.py - __init__
def __init__(self, max_iterations: int = 90, ...):
    self.max_iterations = max_iterations
    self.iteration_budget = IterationBudget(max_iterations)
```

**What counts as an iteration?** Each LLM API call that results in tool execution. If the LLM responds without tools, that's the final turn (doesn't count against budget).

### Early Termination Conditions

```python
while api_call_count < self.max_iterations and self.iteration_budget.remaining > 0:
    # ... LLM call ...
    
    if response.tool_calls:
        # Execute tools
        api_call_count += 1
    else:
        break  # Done!
```

### Manual Stop

```python
# User can interrupt with Ctrl+C (CLI) or /stop (gateway)
def handle_interrupt(session: Session):
    """Kill all running background processes and stop the loop."""
    process_registry.kill_all()
    return "Interrupted. Background processes terminated."
```

---

## 2.8 Special Agent-Internal Tools

Some tools are intercepted before `handle_function_call()`:

```python
# run_agent.py - _intercept_internal_tools()
def _intercept_internal_tools(self, tool_name: str, args: dict) -> Optional[str]:
    """
    Handle special tools that don't go through the normal registry.
    
    These are agent-internal operations (todo, memory).
    """
    if tool_name == "todo":
        return self.todo_tool.execute(args)
    elif tool_name == "memory":
        return self.memory_tool.execute(args)
    return None  # Pass through to normal registry
```

### Todo Tool Example

```python
# tools/todo_tool.py
def todo_tool(action: str, content: str = None, id: str = None) -> str:
    """
    Manage a task list within the conversation.
    
    Actions: create, update, complete, cancel, list
    """
    if action == "create":
        todo_list.append({"id": id or gen_id(), "content": content, "status": "pending"})
    elif action == "complete":
        for t in todo_list:
            if t["id"] == id:
                t["status"] = "completed"
    
    return json.dumps({"todos": todo_list})
```

---

## 2.9 Hands-On Exercise

### Exercise 1: Read the Agent Loop

```bash
cd ~/git/nous-hermes-agent
```

Open `run_agent.py` and find:
1. The `AIAgent.run_conversation()` method (around line 150)
2. The main while loop (search for `while api_call_count`)
3. Where tool results are appended to messages
4. Where the final response is returned

**Questions:**
- What's the default `max_iterations`?
- How does it handle errors during tool execution?
- Where does context compression happen?

### Exercise 2: Trace a Tool Call

1. Open `model_tools.py`
2. Find `handle_function_call()` function
3. Follow the flow:
   - Parse JSON args
   - Look up handler in registry
   - Execute with task_id
   - Return result

**Questions:**
- What happens if the tool name doesn't exist?
- Why must handlers return JSON strings?
- How is `task_id` used?

### Exercise 3: Inspect Tool Registry

```python
# Run this in a Python shell
cd ~/git/nous-hermes-agent
source venv/bin/activate

>>> from tools.registry import registry
>>> len(registry._tools)  # How many total tools?
>>> list(registry._tools.keys())[:10]  # First 10 tool names
>>> registry._tools["terminal_tool"]  # Inspect one tool's info
```

What fields do you see in the tool info dict? What's the schema structure?

### Exercise 4: Test Context Building

```bash
# Start Hermes CLI
hermes

# Send a simple message, then watch what happens
# Try:
/verbose verbose    # See detailed tool progress

# Now send: "What's 2+2?"
# Watch the tool calls and responses in real-time
```

**Observe:**
- Does it use any tools for this simple question?
- How many API calls does it take to respond?
- What does the verbose output show?

---

## 2.10 Common Pitfalls

### ❌ Don't Modify Context Mid-Conversation

```python
# BAD: This breaks prompt caching!
def bad_approach():
    messages = build_context()
    # ... later ...
    messages[0]["content"] = "modified"  # Cache invalidates!
```

**Why:** The LLM's cached context becomes stale. Forces full re-computation.

### ✅ Do Use Immutable Updates

```python
# GOOD: Create new message list
def good_approach():
    messages = [
        {"role": "system", "content": updated_prompt},
        *new_history,
    ]
```

### ❌ Don't Hardcode Cross-Tool References

```python
# BAD: In tool schema description
schema["description"] = "Use browser_navigate to open URLs."
# What if browser_tool is disabled?
```

### ✅ Do Add Dynamic References

```python
# GOOD: In get_tool_definitions()
if "browser_navigate" in schemas and "web_search" in schemas:
    schema["description"] += "\nYou can also use web_search to find URLs."
```

---

## ✅ Module 2 Checklist

- [ ] Understand the synchronous agent loop structure
- [ ] Trace how context is built for each LLM call
- [ ] Explain tool discovery and schema generation
- [ ] Follow a function call from LLM response to result injection
- [ ] Understand context compression strategies
- [ ] Complete all four exercises

---

**Next:** [Module 03: Tools System & Toolsets](../03-tools-system/README.md)
