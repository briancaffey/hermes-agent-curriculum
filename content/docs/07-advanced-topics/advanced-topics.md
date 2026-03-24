# Module 07: Advanced Topics

## 🎯 What You'll Learn

- Subagent delegation for parallel workstreams
- Cron scheduler for automated tasks
- MCP (Model Context Protocol) integration
- Terminal backends (local, Docker, SSH, Modal)
- Batch trajectory generation for research
- RL training environments (Atropos)

---

## 7.1 Subagent Delegation

### Why Subagents?

Subagents allow the agent to:
- **Parallelize work** — Run multiple independent tasks simultaneously
- **Isolate context** — Each subagent has its own clean environment
- **Reduce token usage** — Subagent results don't pollute parent's context
- **Handle complex workflows** — Break big tasks into smaller pieces

### Delegate Tool (`tools/delegate_tool.py`)

```python
def delegate_task(goal: str, context: str = None, 
                  toolsets: list = None) -> str:
    """
    Spawn a subagent to work on a task.
    
    Args:
        goal: What the subagent should accomplish
        context: Background info the subagent needs
        toolsets: Which tools to enable (defaults to parent's)
    
    Returns:
        Summary of what the subagent accomplished
    """
    # Create isolated agent instance
    subagent = AIAgent(
        model=parent.model,
        enabled_toolsets=toolsets or parent.enabled_toolsets,
        session_id=generate_session_id(),
        platform="subagent",
    )
    
    # Build system prompt with context
    system_prompt = f"""
You are an autonomous agent working on a delegated task.

Goal: {goal}

Context:
{context or 'No additional context provided.'}

Work independently and report back when done.
"""
    
    # Run the subagent (blocks until completion)
    result = subagent.chat(
        message="Start working on your assigned task.",
        system_message=system_prompt,
        max_iterations=50  # Limit iterations
    )
    
    return f"Subagent completed: {result}"
```

### Batch Delegation (Parallel Subagents)

```python
def delegate_batch(tasks: list) -> list:
    """
    Spawn multiple subagents in parallel.
    
    Args:
        tasks: List of {goal, context, toolsets} dicts
    
    Returns:
        List of results (one per task)
    """
    import concurrent.futures
    
    def run_task(task):
        return delegate_task(
            goal=task['goal'],
            context=task.get('context'),
            toolsets=task.get('toolsets')
        )
    
    # Run all tasks in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(tasks)) as executor:
        results = list(executor.map(run_task, tasks))
    
    return results
```

### Usage Example

```python
# In a conversation
"I need to research three topics: Python, Rust, and Go. 
Please delegate each to a separate subagent for parallel work."

# Agent creates 3 subagents:
delegate_task(
    goal="Research Python's strengths and use cases",
    context="User is comparing programming languages"
)
delegate_task(
    goal="Research Rust's strengths and use cases",
    context="User is comparing programming languages"
)
delegate_task(
    goal="Research Go's strengths and use cases",
    context="User is comparing programming languages"
)

# Wait for all to complete, then synthesize results
"Based on the three subagent reports, create a comparison table."
```

---

## 7.2 Cron Scheduler

### Overview

Hermes has a built-in cron scheduler for:
- Daily/weekly automated reports
- Periodic backups
- Scheduled research tasks
- Recurring reminders

### Job Structure (`cron/jobs.py`)

```python
class CronJob:
    """
    A scheduled task.
    
    Attributes:
        job_id: Unique identifier
        name: Human-readable name
        schedule: Cron expression (e.g., "0 9 * * *")
        prompt: Task to execute when triggered
        skills: Skills to load before running
        deliver: Where to send results (origin, telegram, local file)
        model: Model override (optional)
        repeat: Number of times to repeat (None = forever)
        status: 'active', 'paused', or 'completed'
    """
    
    def __init__(self, name: str, schedule: str, prompt: str,
                 deliver: str = "origin", skills: list = None):
        self.job_id = generate_job_id()
        self.name = name
        self.schedule = schedule  # Cron format
        self.prompt = prompt
        self.skills = skills or []
        self.deliver = deliver
        self.status = 'active'
        self.last_run = None
        self.next_run = self._calculate_next_run()
```

### Creating a Cron Job

```python
# Via CLI
@slash_command("cron")
def cron_create(name: str, schedule: str, prompt: str,
                deliver: str = "origin", skills: list = None):
    """
    Create a scheduled task.
    
    Usage:
        /cron create "Daily Report" "0 9 * * *" \
            "Summarize today's news from Hacker News" \
            deliver=telegram
    """
    job = CronJob(
        name=name,
        schedule=schedule,
        prompt=prompt,
        deliver=deliver,
        skills=skills
    )
    
    scheduler.add_job(job)
    return f"Job '{name}' scheduled for {schedule}. Next run: {job.next_run}"
```

### Cron Expression Format

```python
# Standard cron format: "minute hour day month weekday"
schedules = {
    "every minute": "* * * * *",
    "hourly": "0 * * * *",
    "daily at 9am": "0 9 * * *",
    "weekly on Monday": "0 0 * * 1",
    "every 30 minutes": "*/30 * * * *",
    "first of month": "0 0 1 * *",
}
```

### Scheduler Loop (`cron/scheduler.py`)

```python
class Scheduler:
    def __init__(self):
        self.jobs = []  # List of CronJob objects
        self.running = False
    
    def start(self):
        """Start the scheduler loop."""
        self.running = True
        
        while self.running:
            now = datetime.now()
            
            for job in self.jobs:
                if job.status != 'active':
                    continue
                
                if now >= job.next_run:
                    # Trigger the job
                    self._run_job(job)
                    
                    # Calculate next run time
                    job.last_run = now
                    job.next_run = self._calculate_next_run(job.schedule, now)
            
            # Check every minute
            time.sleep(60)
    
    def _run_job(self, job: CronJob):
        """
        Execute a scheduled job.
        
        Runs in isolated context with specified skills loaded.
        """
        print(f"Running scheduled job: {job.name}")
        
        # Create agent with job's skills
        agent = AIAgent(
            model=job.model or default_model,
            enabled_toolsets=get_enabled_toolsets(),
            session_id=f"cron:{job.job_id}:{timestamp()}",
        )
        
        # Load skills before running prompt
        for skill_name in job.skills:
            load_skill(skill_name)
        
        # Execute the job's prompt
        result = agent.chat(job.prompt)
        
        # Deliver result
        if job.deliver == "origin":
            send_to_origin(result)  # Back to where cron was created
        elif job.deliver == "telegram":
            send_to_telegram(result)
        elif job.deliver == "local":
            save_to_file(f"~/.hermes/cron/{job.job_id}.txt", result)
```

### Example Jobs

```yaml
# ~/.hermes/config.yaml (example cron jobs)
cron:
  - name: "Daily Hacker News Summary"
    schedule: "0 9 * * *"  # Daily at 9am
    prompt: "Fetch top 10 stories from HN and summarize each in one sentence"
    skills: ["hn"]
    deliver: telegram
    
  - name: "Weekly Backup"
    schedule: "0 0 * * 0"  # Sunday midnight
    prompt: "Backup all ~/.hermes/sessions to compressed archive"
    deliver: local
    
  - name: "Token Usage Report"
    schedule: "0 12 * * *"  # Daily at noon
    prompt: "Show token usage for all sessions this week"
    skills: ["token-usage"]
    deliver: origin
```

---

## 7.3 MCP (Model Context Protocol) Integration

### What is MCP?

MCP is a standard protocol for connecting AI agents to external tools and data sources:
- Filesystem access
- Database queries
- API integrations
- Custom tool servers

### MCP Client (`tools/mcp_tool.py`)

```python
class MCPClient:
    """
    Built-in MCP client for connecting to MCP servers.
    
    Configured via ~/.hermes/config.yaml
    """
    
    def __init__(self, config_path: str = "~/.hermes/config.yaml"):
        self.servers = self._load_servers(config_path)
        self.clients = {}  # server_name -> MCP client connection
    
    def _load_servers(self, config_path: str) -> dict:
        """
        Load MCP server configurations from YAML.
        
        Example config:
            mcp:
              servers:
                filesystem:
                  command: "npx -y @modelcontextprotocol/server-filesystem"
                  args: ["/home/brian"]
                github:
                  command: "npx -y @modelcontextprotocol/server-github"
                  env:
                    GITHUB_TOKEN: "${GITHUB_TOKEN}"
        """
        with open(config_path) as f:
            config = yaml.safe_load(f)
        
        return config.get('mcp', {}).get('servers', {})
    
    def connect(self, server_name: str):
        """
        Connect to an MCP server.
        
        Spawns the server process and establishes stdio connection.
        """
        if server_name not in self.servers:
            raise ValueError(f"Unknown MCP server: {server_name}")
        
        config = self.servers[server_name]
        
        # Spawn server process
        proc = subprocess.Popen(
            [config['command']] + config.get('args', []),
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env={**os.environ, **config.get('env', {})},
            text=True
        )
        
        # Create client wrapper
        client = MCPClientFor(proc)
        client.connect()
        
        self.clients[server_name] = client
    
    def list_tools(self, server_name: str) -> list:
        """
        List available tools from an MCP server.
        
        Returns list of {name, description, parameters} dicts.
        """
        if server_name not in self.clients:
            self.connect(server_name)
        
        return self.clients[server_name].list_tools()
    
    def call_tool(self, server_name: str, tool_name: str,
                  args: dict) -> str:
        """
        Call a tool on an MCP server.
        
        Returns result as string (usually JSON).
        """
        if server_name not in self.clients:
            self.connect(server_name)
        
        result = self.clients[server_name].call_tool(tool_name, args)
        return json.dumps({"result": result})
```

### MCP Tool Wrapper

```python
# tools/mcp_tool.py - Register as regular tool
def mcp_call(server: str, tool: str, args_json: str) -> str:
    """
    Call an MCP server tool.
    
    Usage: mcp_call("filesystem", "read_file", {"path": "/home/brian/file.txt"})
    """
    client = MCPClient()
    return client.call_tool(server, tool, json.loads(args_json))

# Register with registry
registry.register(
    name="mcp_call",
    toolset="mcp",
    schema={
        "name": "mcp_call",
        "description": "Call a tool on an MCP server.",
        "parameters": {
            "type": "object",
            "properties": {
                "server": {"type": "string", "description": "MCP server name"},
                "tool": {"type": "string", "description": "Tool to call"},
                "args_json": {"type": "string", "description": "JSON args for the tool"}
            },
            "required": ["server", "tool", "args_json"]
        }
    },
    handler=lambda args, **kw: mcp_call(
        server=args["server"],
        tool=args["tool"],
        args_json=args["args_json"]
    )
)
```

### Using MCP in Conversations

```python
# User asks:
"Read the file /home/brian/project/config.yaml and tell me what's in it"

# Agent uses MCP filesystem tool:
mcp_call(
    server="filesystem",
    tool="read_file",
    args_json='{"path": "/home/brian/project/config.yaml"}'
)

# Returns file contents, agent summarizes for user
```

---

## 7.4 Terminal Backends

### Overview

Hermes supports multiple terminal execution backends:

| Backend | Description | Use Case |
|---------|-------------|----------|
| **local** | Run on current machine | Development, testing |
| **docker** | Run in Docker container | Isolation, reproducibility |
| **ssh** | Run on remote server via SSH | Remote development |
| **daytona** | Serverless containers | Persistent environments |
| **modal** | Serverless GPU compute | ML training, heavy workloads |
| **singularity** | HPC container platform | Research clusters |

### Backend Selection

```python
# ~/.hermes/config.yaml
terminal:
  backend: "local"  # or "docker", "ssh", "daytona", "modal"
  
  # Backend-specific config
  ssh:
    host: "myserver.example.com"
    user: "brian"
    port: 22
  
  docker:
    image: "python:3.11-slim"
    volumes:
      - "/home/brian/project:/workspace"
  
  modal:
    gpu: "T4"  # or "A10G", "A100"
```

### Docker Backend Example

```python
# tools/environments/docker.py
class DockerBackend:
    def __init__(self, image: str = "python:3.11-slim",
                 volumes: dict = None):
        self.image = image
        self.volumes = volumes or {}
    
    def execute(self, command: str, workdir: str = None) -> str:
        """
        Run a command in a Docker container.
        """
        # Build volume mounts
        volume_args = []
        for host_path, container_path in self.volumes.items():
            volume_args.extend(["-v", f"{host_path}:{container_path}"])
        
        # Build working directory
        workdir_arg = f"-w {workdir}" if workdir else ""
        
        # Run command in container (ephemeral)
        cmd = [
            "docker", "run", "--rm",
            *volume_args,
            workdir_arg,
            self.image,
            "bash", "-c", command
        ]
        
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=300
        )
        
        return {
            "output": result.stdout,
            "error": result.stderr,
            "exit_code": result.returncode
        }
```

---

## 7.5 Batch Trajectory Generation

### Purpose

For research and training data generation:
- Generate many agent trajectories for analysis
- Create training data for fine-tuning
- Benchmark performance across tasks

### Batch Runner (`batch_runner.py`)

```python
class BatchRunner:
    """
    Run multiple agent tasks in parallel.
    
    Used for research, benchmarking, and dataset generation.
    """
    
    def __init__(self, num_workers: int = 4):
        self.num_workers = num_workers
    
    def run_tasks(self, tasks: list) -> list:
        """
        Execute multiple tasks in parallel.
        
        Args:
            tasks: List of {prompt, expected_output, metadata} dicts
        
        Returns:
            List of {task_id, trajectory, success, metrics} dicts
        """
        import concurrent.futures
        
        def run_task(task):
            agent = AIAgent(
                model="anthropic/claude-opus-4.6",
                max_iterations=50,
                save_trajectories=True,
            )
            
            result = agent.chat(task['prompt'])
            trajectory = agent.get_trajectory()
            
            return {
                'task_id': task.get('id'),
                'trajectory': trajectory,
                'success': self._evaluate(result, task.get('expected_output')),
                'metrics': self._compute_metrics(trajectory)
            }
        
        with concurrent.futures.ThreadPoolExecutor(
            max_workers=self.num_workers
        ) as executor:
            results = list(executor.map(run_task, tasks))
        
        return results
    
    def save_results(self, results: list, output_path: str):
        """
        Save batch results to file for analysis.
        """
        with open(output_path, 'w') as f:
            for result in results:
                json.dump(result, f)
                f.write('\n')  # JSON Lines format
```

### Usage Example

```python
# Generate training data
tasks = [
    {"id": "task_1", "prompt": "Write a Python function to sort a list"},
    {"id": "task_2", "prompt": "Debug this error: ..."},
    # ... more tasks
]

runner = BatchRunner(num_workers=8)
results = runner.run_tasks(tasks)
runner.save_results(results, "~/trajectories.jsonl")
```

---

## 7.6 RL Training Environments (Atropos)

### Overview

Hermes includes RL training environments for fine-tuning agents:
- **Atropos**: Custom environment for tool-use RL
- Compatible with TRL, Axolotl, Unsloth for fine-tuning

### Environment Structure (`environments/`)

```python
# environments/atropos/env.py
class AtroposEnv(gym.Env):
    """
    RL environment for training tool-using agents.
    
    Observation: Current task + conversation history
    Action: Tool call or final answer
    Reward: Task success + intermediate steps
    """
    
    def __init__(self, tasks: list):
        super().__init__()
        self.tasks = tasks
        self.current_task = None
        self.history = []
    
    def reset(self):
        """Start a new task."""
        self.current_task = random.choice(self.tasks)
        self.history = [{"role": "user", "content": self.current_task['prompt']}]
        return self._get_observation()
    
    def step(self, action: dict) -> tuple:
        """
        Execute an action (tool call or answer).
        
        Returns: (observation, reward, done, info)
        """
        if action['type'] == 'tool_call':
            # Execute tool
            result = execute_tool(action['name'], action['args'])
            self.history.append({
                "role": "assistant",
                "content": f"Tool call: {action['name']}"
            })
            self.history.append({
                "role": "tool", 
                "content": result
            })
            
            return (
                self._get_observation(),
                0.1,  # Small reward for taking action
                False,
                {}
            )
        
        elif action['type'] == 'answer':
            # Final answer
            success = self._evaluate(action['content'])
            reward = 1.0 if success else -1.0
            
            return (
                self._get_observation(),
                reward,
                True,  # Episode done
                {"success": success}
            )
    
    def _get_observation(self) -> str:
        """
        Build observation for the agent.
        
        Returns conversation history as string.
        """
        return "\n".join(
            f"{msg['role']}: {msg['content']}"
            for msg in self.history
        )
```

### Training with TRL

```python
# Train an agent using Atropos environment
from trl import PPOConfig, PPOTrainer
from environments.atropos.env import AtroposEnv

# Create environment
env = AtroposEnv(tasks=load_tasks("~/tasks.jsonl"))

# Configure training
config = PPOConfig(
    model_name="anthropic/claude-3.5-sonnet",
    learning_rate=1e-5,
    batch_size=32,
)

# Train
trainer = PPOTrainer(config=config, env=env)
trainer.train(num_steps=10000)
```

---

## 7.7 Hands-On Exercise

### Exercise 1: Test Subagent Delegation

```bash
# Start Hermes CLI
hermes

# Ask for parallel work
"Research three AI frameworks (PyTorch, JAX, TensorFlow) in parallel using subagents.
Create a comparison table of their strengths."

# Observe:
# - How many subagents are spawned?
# - How long does it take vs sequential?
# - What's the final output like?
```

### Exercise 2: Create a Cron Job

```bash
# In CLI or Telegram
/cron create "Daily News Summary" "0 9 * * *" \
    "Fetch top stories from Hacker News and summarize each in one sentence" \
    deliver=telegram

# Check it was created
/cron list

# Pause if you don't want it running
/cron pause "Daily News Summary"
```

### Exercise 3: Configure MCP Server

```bash
# Add filesystem MCP server to config
cat >> ~/.hermes/config.yaml << 'EOF'
mcp:
  servers:
    filesystem:
      command: "npx -y @modelcontextprotocol/server-filesystem"
      args: ["/home/brian"]
EOF

# Reload MCP servers
/reload-mcp

# Test it
hermes
"Read the file /home/brian/git/hermes-agent/README.md and summarize it"
```

### Exercise 4: Run a Batch Task

```python
# Create a simple batch script
cat > ~/batch_test.py << 'EOF'
import sys
sys.path.insert(0, '~/git/nous-hermes-agent')

from batch_runner import BatchRunner

# Define tasks
tasks = [
    {"id": "math_1", "prompt": "What is 234 * 567?"},
    {"id": "code_1", "prompt": "Write a Python function to reverse a string"},
    {"id": "text_1", "prompt": "Summarize: The quick brown fox jumps over the lazy dog"}
]

# Run batch
runner = BatchRunner(num_workers=2)
results = runner.run_tasks(tasks)

for r in results:
    print(f"\nTask {r['task_id']}:")
    print(f"  Success: {r['success']}")
    print(f"  Trajectory length: {len(r['trajectory'])} turns")
EOF

# Run it
python ~/batch_test.py
```

---

## 7.8 Common Pitfalls

### ❌ Don't Overuse Subagents

```python
# BAD: Too much overhead for simple tasks
"What's 2+2?"  # No need to delegate!

# GOOD: Use subagents for complex, independent work
"Research these 5 topics and create a comparison report"
```

### ❌ Don't Forget Cron Job Cleanup

```python
# BAD: Let jobs accumulate forever
cron.create("Daily Task", "0 * * * *", prompt)  # Never removed!

# GOOD: Set repeat limit or manually clean up
cron.create("One-time Report", schedule, prompt, repeat=1)
cron.remove("Old Job")
```

### ❌ Don't Ignore MCP Server Errors

```python
# BAD: Assume MCP servers always work
result = mcp_call("filesystem", "read_file", args)  # Might fail!

# GOOD: Handle errors gracefully
try:
    result = mcp_call("filesystem", "read_file", args)
except Exception as e:
    log_error(f"MCP call failed: {e}")
    fallback_to_alternative()
```

---

## ✅ Module 7 Checklist

- [ ] Understand subagent delegation and parallelization
- [ ] Create and manage cron jobs
- [ ] Configure and use MCP servers
- [ ] Explain different terminal backends
- [ ] Run batch trajectory generation
- [ ] Understand RL training environments (Atropos)
- [ ] Complete all four exercises

---

## 🎉 Course Complete!

Congratulations! You've completed the full Hermes Agent architecture course.

### What You've Learned

1. **Overview & Mental Model** — Big picture architecture and data flow
2. **Core Agent Loop** — How conversations progress turn by turn
3. **Tools System** — Tool registration, discovery, and execution
4. **Gateway & Platforms** — Multi-platform messaging support
5. **Sessions & Memory** — Persistence, search, and context management
6. **Skills System** — Procedural memory and self-improvement
7. **Advanced Topics** — Subagents, cron, MCP, backends, research tools

### Next Steps

- **Explore the codebase**: Dive deeper into specific modules that interest you
- **Contribute**: Fix bugs, add features, improve documentation
- **Build skills**: Create custom skills for your workflows
- **Experiment**: Try different models, toolsets, and configurations
- **Join the community**: Discord, GitHub issues, discussions

### Resources

- **Documentation**: https://hermes-agent.nousresearch.com/docs/
- **GitHub**: https://github.com/NousResearch/hermes-agent
- **Discord**: https://discord.gg/NousResearch

---

*Course created: March 24, 2026*
*Based on Hermes Agent from NousResearch/hermes-agent*
