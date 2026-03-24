# Module 03: Tools System & Toolsets

## 🎯 What You'll Learn

- How tools are registered and discovered
- The toolset system for organizing capabilities
- Implementing a new tool from scratch
- Environment variable requirements
- Background process management
- MCP integration basics

---

## 3.1 Tool Architecture Overview

### Three-Layer Design

```
┌─────────────────────────────────────┐
│         TOOLSETS (toolsets.py)      │
│   - Group tools by capability       │
│   - User enables/disables sets      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        REGISTRY (registry.py)       │
│   - Central dispatch                │
│   - Schema collection               │
│   - Availability checking           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      TOOL IMPLEMENTATIONS           │
│   tools/terminal_tool.py            │
│   tools/file_tools.py               │
│   tools/web_tools.py                │
│   ... (20+ files)                   │
└─────────────────────────────────────┘
```

---

## 3.2 The Registry Pattern

### Registration at Import Time

```python
# tools/registry.py
class ToolRegistry:
    def __init__(self):
        self._tools = {}  # name -> tool info dict
        self._toolsets = defaultdict(list)  # toolset -> [names]
    
    def register(self, name: str, toolset: str, schema: dict,
                 handler: Callable, check_fn: Callable = None,
                 requires_env: list = None):
        """
        Register a tool. Called at module import time.
        
        Args:
            name: Unique tool identifier (e.g., "terminal_tool")
            toolset: Which set it belongs to (e.g., "core", "web")
            schema: OpenAI-compatible function schema
            handler: Function that executes the tool
            check_fn: Optional availability check (returns bool)
            requires_env: List of required env vars
        """
        self._tools[name] = {
            "schema": schema,
            "handler": handler,
            "check_fn": check_fn,
            "requires_env": requires_env or [],
            "toolset": toolset,
        }
        
        self._toolsets[toolset].append(name)

# Global instance
registry = ToolRegistry()
```

### Example: Registering a Tool

```python
# tools/example_tool.py
import json, os
from tools.registry import registry

def check_requirements() -> bool:
    """Return True if tool can run (has API keys, etc.)."""
    return bool(os.getenv("EXAMPLE_API_KEY"))

def example_tool(query: str, limit: int = 10, task_id: str = None) -> str:
    """
    Example tool that does something.
    
    Args:
        query: Search query
        limit: Max results to return
        task_id: Optional ID for background tracking
    
    Returns:
        JSON string with result
    """
    # Do the work...
    results = {"query": query, "count": limit}
    
    return json.dumps({"success": True, "data": results})

# Register at import time
registry.register(
    name="example_tool",
    toolset="example",
    schema={
        "name": "example_tool",
        "description": "Does something useful with a query.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"},
                "limit": {"type": "integer", "default": 10, "description": "Max results"},
            },
            "required": ["query"],
        },
    },
    handler=lambda args, **kw: example_tool(
        query=args.get("query", ""),
        limit=args.get("limit", 10),
        task_id=kw.get("task_id")
    ),
    check_fn=check_requirements,
    requires_env=["EXAMPLE_API_KEY"],
)
```

**Key Points:**
- Registration happens **at import time** (when Python loads the module)
- Handler must return a **JSON string**
- `task_id` is passed for background process tracking
- `check_fn` and `requires_env` control availability

---

## 3.3 Toolsets System

### Defining Toolsets

```python
# toolsets.py
_HERMES_CORE_TOOLS = [
    "terminal_tool",
    "file_read", "file_write", "file_search", "file_patch",
    "todo",
]

_TOOLSETS = {
    "core": {
        "description": "Core tools for terminal, files, and task management",
        "tools": _HERMES_CORE_TOOLS,
        "enabled_by_default": True,
    },
    "web": {
        "description": "Web search and content extraction",
        "tools": ["web_search", "web_extract"],
        "enabled_by_default": False,  # Requires API key
    },
    "browser": {
        "description": "Browser automation via Browserbase",
        "tools": ["browser_navigate", "browser_click", "browser_type"],
        "enabled_by_default": False,
    },
}
```

### Enabling/Disabling Toolsets

```python
# User config in ~/.hermes/config.yaml
enabled_toolsets:
  - core
  - web
  
disabled_toolsets: []  # Override defaults
```

### Runtime Filtering

```python
# model_tools.py - _discover_tools()
def _discover_tools(self) -> dict:
    """Collect available tools based on enabled toolsets."""
    available = {}
    
    for name, info in registry._tools.items():
        # Filter by enabled toolset
        if info["toolset"] not in self.enabled_toolsets:
            continue
        
        # Check environment requirements
        if info.get("requires_env"):
            missing = [env for env in info["requires_env"] if not os.getenv(env)]
            if missing:
                continue  # Skip if API keys missing
        
        # Run availability check
        if info.get("check_fn") and not info["check_fn"]():
            continue
        
        available[name] = info["schema"]
    
    return available
```

---

## 3.4 Core Tool Categories

### Terminal Tools (`tools/terminal_tool.py`)

```python
def terminal_tool(command: str, background: bool = False,
                  timeout: int = 180, workdir: str = None,
                  task_id: str = None) -> str:
    """
    Execute shell commands.
    
    Modes:
    - Foreground (default): Wait for completion
    - Background: Return immediately with process ID
    """
    if background:
        # Start in background
        proc = subprocess.Popen(
            command, shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            cwd=workdir
        )
        
        # Register for tracking
        process_registry.register(task_id, proc)
        
        return json.dumps({
            "status": "running",
            "process_id": task_id,
            "command": command[:100]
        })
    else:
        # Foreground - wait for result
        result = subprocess.run(
            command, shell=True,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=workdir
        )
        
        return json.dumps({
            "output": result.stdout,
            "error": result.stderr,
            "exit_code": result.returncode
        })
```

### File Tools (`tools/file_tools.py`)

```python
def file_read(path: str, offset: int = 1, limit: int = 500) -> str:
    """Read a text file with line numbers and pagination."""
    try:
        with open(path, 'r') as f:
            lines = f.readlines()
        
        # Apply pagination
        start = offset - 1
        end = min(start + limit, len(lines))
        content = ''.join(lines[start:end])
        
        return json.dumps({
            "content": content,
            "total_lines": len(lines),
            "offset": offset,
            "limit": limit,
        })
    except Exception as e:
        return json.dumps({"error": str(e)})


def file_patch(path: str, old_string: str, new_string: str,
               replace_all: bool = False) -> str:
    """Find-and-replace edit in a file."""
    try:
        with open(path, 'r') as f:
            content = f.read()
        
        if old_string not in content:
            return json.dumps({
                "success": False,
                "error": "String not found",
                "path": path
            })
        
        new_content = content.replace(old_string, new_string)
        
        with open(path, 'w') as f:
            f.write(new_content)
        
        return json.dumps({
            "success": True,
            "replacements": content.count(old_string) if replace_all else 1
        })
    except Exception as e:
        return json.dumps({"error": str(e)})
```

### Web Tools (`tools/web_tools.py`)

```python
def web_search(query: str, num_results: int = 10) -> str:
    """
    Search the web using Parallel search or Firecrawl.
    
    Requires: PARALLEL_API_KEY or FIRECRAWL_API_KEY
    """
    if os.getenv("PARALLEL_API_KEY"):
        # Use Parallel search
        results = parallel_search(query, limit=num_results)
    elif os.getenv("FIRECRAWL_API_KEY"):
        # Use Firecrawl
        results = firecrawl_search(query, limit=num_results)
    else:
        return json.dumps({"error": "No web search API key configured"})
    
    return json.dumps({"results": results})
```

---

## 3.5 Background Process Management

### Process Registry

```python
# tools/process_registry.py
class ProcessRegistry:
    def __init__(self):
        self._processes = {}  # task_id -> proc info
    
    def register(self, task_id: str, proc: subprocess.Popen):
        """Track a background process."""
        self._processes[task_id] = {
            "proc": proc,
            "started_at": datetime.now(),
            "status": "running",
        }
    
    def get_status(self, task_id: str) -> dict:
        """Check if process is still running."""
        if task_id not in self._processes:
            return {"error": "Unknown process ID"}
        
        proc_info = self._processes[task_id]
        proc = proc_info["proc"]
        
        if proc.poll() is None:
            status = "running"
        else:
            status = "completed"
            proc_info["status"] = "completed"
        
        return {
            "task_id": task_id,
            "status": status,
            "started_at": str(proc_info["started_at"]),
        }
    
    def kill(self, task_id: str) -> dict:
        """Terminate a background process."""
        if task_id not in self._processes:
            return {"error": "Unknown process ID"}
        
        proc = self._processes[task_id]["proc"]
        proc.terminate()
        
        return {"success": True, "task_id": task_id}
    
    def kill_all(self):
        """Kill all running background processes."""
        for task_id in list(self._processes.keys()):
            self.kill(task_id)
```

### Using Background Processes

```python
# In a tool call
result = terminal_tool(
    command="python long_script.py",
    background=True,
    task_id="my-task-123"
)

# Later, check status
status = process_registry.get_status("my-task-123")

# Or kill it
process_registry.kill("my-task-123")
```

---

## 3.6 MCP Integration (`tools/mcp_tool.py`)

### What is MCP?

MCP (Model Context Protocol) is a standard for connecting AI agents to external tools and data sources.

### MCP Client Implementation

```python
# tools/mcp_tool.py (~1050 lines)
class MCPClient:
    def __init__(self, config_path: str = "~/.hermes/config.yaml"):
        self.servers = self._load_servers(config_path)
        self.clients = {}  # server_name -> MCP client
    
    def _load_servers(self, config_path: str) -> dict:
        """Load MCP server configs from YAML."""
        with open(config_path) as f:
            config = yaml.safe_load(f)
        
        return config.get("mcp", {}).get("servers", {})
    
    def connect(self, server_name: str):
        """Connect to an MCP server."""
        if server_name not in self.servers:
            raise ValueError(f"Unknown server: {server_name}")
        
        config = self.servers[server_name]
        client = MCPClientFor(config)  # Platform-specific
        client.connect()
        
        self.clients[server_name] = client
    
    def list_tools(self, server_name: str) -> list:
        """List available tools from an MCP server."""
        if server_name not in self.clients:
            self.connect(server_name)
        
        return self.clients[server_name].list_tools()
    
    def call_tool(self, server_name: str, tool_name: str, args: dict) -> str:
        """Call a tool on an MCP server."""
        if server_name not in self.clients:
            self.connect(server_name)
        
        result = self.clients[server_name].call_tool(tool_name, args)
        return json.dumps({"result": result})
```

### Configuring MCP Servers

```yaml
# ~/.hermes/config.yaml
mcp:
  servers:
    filesystem:
      command: "npx -y @modelcontextprotocol/server-filesystem"
      args: ["/home/brian"]
    github:
      command: "npx -y @modelcontextprotocol/server-github"
      env:
        GITHUB_TOKEN: "${GITHUB_TOKEN}"
```

---

## 3.7 Hands-On Exercise

### Exercise 1: Inspect the Registry

```bash
cd ~/git/nous-hermes-agent
source venv/bin/activate

>>> from tools.registry import registry
>>> 
>>> # How many total tools?
>>> len(registry._tools)
>>> 
>>> # What toolsets exist?
>>> list(registry._toolsets.keys())
>>> 
>>> # Tools in the 'core' set
>>> registry._toolsets['core']
>>> 
>>> # Inspect a specific tool
>>> import pprint
>>> pprint.pprint(registry._tools['terminal_tool'])
```

**Questions:**
- How many tools are registered?
- What's the schema structure for `terminal_tool`?
- Does it have environment requirements?

### Exercise 2: Trace Tool Discovery

```python
# Create a minimal test
from model_tools import ModelTools

agent = ModelTools(
    enabled_toolsets=["core", "web"],
    disabled_toolsets=[]
)

tools = agent._discover_tools()
print(f"Available tools: {len(tools)}")
for name in sorted(tools.keys()):
    print(f"  - {name}")
```

**Questions:**
- How many tools are available with just "core" enabled?
- What changes when you add "web"? (Requires API key)

### Exercise 3: Write a Simple Tool

Create `~/git/nous-hermes-agent/tools/hello_tool.py`:

```python
import json
from tools.registry import registry

def hello_tool(name: str, greeting: str = "Hello") -> str:
    """Say hello to someone."""
    message = f"{greeting}, {name}!"
    return json.dumps({"message": message})

registry.register(
    name="hello_tool",
    toolset="core",  # Always available
    schema={
        "name": "hello_tool",
        "description": "Say hello to someone by name.",
        "parameters": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "Person's name"},
                "greeting": {"type": "string", "default": "Hello", 
                            "description": "Greeting word"},
            },
            "required": ["name"],
        },
    },
    handler=lambda args, **kw: hello_tool(
        name=args.get("name", "World"),
        greeting=args.get("greeting", "Hello")
    ),
)
```

Now test it:

```python
# In Python shell
from tools.registry import registry
result = registry._tools['hello_tool']['handler']({"name": "Brian"})
print(result)
```

### Exercise 4: Test Background Processes

```bash
# Start Hermes CLI
hermes

# Run a background command
/terminal sleep 30 && echo "Done!" --background

# Check status (if supported in your version)
/status

# Or kill it
/stop
```

**Observe:**
- What response do you get immediately?
- How can you track the process?

---

## 3.8 Common Pitfalls

### ❌ Don't Forget JSON Return Values

```python
# BAD: Returns plain string
def bad_tool():
    return "Success!"  # LLM expects JSON!

# GOOD: Always return JSON
def good_tool():
    return json.dumps({"success": True, "message": "Success!"})
```

### ❌ Don't Hardcode Paths

```python
# BAD
def read_config():
    with open("/home/brian/.hermes/config.yaml") as f:  # Won't work for others!
        return yaml.safe_load(f)

# GOOD
def read_config():
    config_path = os.getenv("HERMES_HOME", "~/.hermes") + "/config.yaml"
    with open(os.path.expanduser(config_path)) as f:
        return yaml.safe_load(f)
```

### ❌ Don't Block on Long Operations Without Background Option

```python
# BAD: No way to interrupt
def long_process():
    for i in range(1000000):
        time.sleep(1)  # Blocks forever!

# GOOD: Support background mode
def process(data, background=False):
    if background:
        return start_background_task(data)
    else:
        return run_synchronously(data)
```

---

## ✅ Module 3 Checklist

- [ ] Understand the registry pattern and registration at import time
- [ ] Explain how toolsets filter available tools
- [ ] Trace a tool call from LLM to execution to result
- [ ] Implement a simple tool from scratch
- [ ] Understand background process management
- [ ] Complete all four exercises

---

**Next:** [Module 04: Gateway & Messaging Platforms](../04-gateway-platforms/gateway-platforms.md)
