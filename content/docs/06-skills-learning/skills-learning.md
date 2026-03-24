# Module 06: Skills System & Self-Improvement

## 🎯 What You'll Learn

- How skills work as procedural memory
- Skill structure (SKILL.md format)
- Automatic skill creation from experience
- Skill search and installation
- Skill execution and context passing
- Updating skills when they break

---

## 6.1 Skills Overview

### What Are Skills?

Skills are **reusable workflows** that the agent can execute. They're like functions with:
- Instructions (what to do)
- References (supporting docs)
- Templates (reusable snippets)
- Scripts (helper code)

### Key Design Principles

1. **Procedural Memory** — Skills persist across sessions
2. **Self-Improving** — Agent can update skills when they break
3. **User-Extensible** — Install new skills from community or create your own
4. **Context-Aware** — Skills load into the agent's context as needed

### Skill Storage Locations

```bash
# Built-in skills (from repo)
~/git/nous-hermes-agent/optional-skills/

# User-installed skills
~/.hermes/skills/

# Skill format: Each skill is a directory with:
my-skill/
├── SKILL.md          # Main instructions
├── references/       # Supporting documentation
├── templates/        # Reusable templates (YAML, JSON, etc.)
└── scripts/          # Helper Python scripts
```

---

## 6.2 Skill Structure

### SKILL.md Format

```markdown
# Skill Name

Short description of what this skill does.

---

## Trigger Conditions

Use this skill when:
- Condition 1
- Condition 2

Do NOT use this skill when:
- Condition A
- Condition B

---

## Prerequisites

Required tools/APIs:
- Tool X must be installed
- API key Y must be set

---

## Steps

1. **Step name**: Description of what to do
   - Sub-step if needed
   - Another sub-step

2. **Another step**: More details
   ```python
   # Example code snippet
   result = do_something()
   ```

3. **Final step**: Wrap up

---

## Pitfalls

Common mistakes to avoid:
- Don't do X (explain why)
- Watch out for Y (edge case)

---

## Verification

After completing this skill, verify:
- [ ] Result looks correct
- [ ] No errors in output
- [ ] Files are in expected locations
```

### Example Skill: GitHub PR Workflow

```markdown
# github-pr-workflow

Full pull request lifecycle — create branches, commit changes, open PRs.

---

## Trigger Conditions

Use this skill when:
- User wants to create a new pull request
- User needs to update an existing PR
- User wants to review code changes

Do NOT use this skill when:
- Just viewing repo (use github-repo-management instead)
- Simple file edit without version control

---

## Prerequisites

Required tools/APIs:
- `gh` CLI installed and authenticated (`gh auth status`)
- Git configured with user.name and user.email
- Write access to target repository

---

## Steps

1. **Understand the request**: Clarify what changes need to be made
   - Ask for branch name if not specified
   - Confirm target repository

2. **Create/checkout branch**:
   ```bash
   git checkout -b feature/my-feature
   # or: git checkout existing-branch
   ```

3. **Make changes**: Use file tools to edit code
   - Read files first to understand context
   - Make targeted edits with `file_patch`
   - Test if applicable

4. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat: descriptive message"
   ```

5. **Push branch**:
   ```bash
   git push origin feature/my-feature
   ```

6. **Create PR**: Use `gh pr create`
   ```bash
   gh pr create \
     --title "Descriptive title" \
     --body "## Description\nWhat this does\n\n## Changes\n- Change 1\n- Change 2"
   ```

---

## Pitfalls

- **Don't commit without reviewing**: Always show the user a diff before committing
- **Don't push to main**: Always create a feature branch first
- **Watch for merge conflicts**: Check if upstream has new commits

---

## Verification

After completing this skill, verify:
- [ ] PR is created and visible on GitHub
- [ ] Branch is pushed to remote
- [ ] Local working directory is clean (`git status`)
```

---

## 6.3 Skill Loading & Execution

### Skills Hub (`hermes_cli/skills_hub.py`)

```python
class SkillsHub:
    """
    Search, browse, install, and manage skills.
    
    Handles both built-in and user-installed skills.
    """
    
    def __init__(self):
        self.builtin_path = "optional-skills/"
        self.user_path = os.path.expanduser("~/.hermes/skills/")
    
    def list_all(self) -> list:
        """List all available skills (built-in + user)."""
        skills = []
        
        # Built-in skills
        if os.path.exists(self.builtin_path):
            for name in os.listdir(self.builtin_path):
                path = os.path.join(self.builtin_path, name)
                if os.path.isdir(path) and os.path.exists(f"{path}/SKILL.md"):
                    skills.append({
                        'name': name,
                        'type': 'builtin',
                        'path': path
                    })
        
        # User skills
        if os.path.exists(self.user_path):
            for name in os.listdir(self.user_path):
                path = os.path.join(self.user_path, name)
                if os.path.isdir(path) and os.path.exists(f"{path}/SKILL.md"):
                    skills.append({
                        'name': name,
                        'type': 'user',
                        'path': path
                    })
        
        return skills
    
    def get_skill(self, name: str) -> Optional[dict]:
        """Get a specific skill's content."""
        # Check user skills first (override built-ins)
        user_path = os.path.join(self.user_path, name, "SKILL.md")
        if os.path.exists(user_path):
            return self._load_skill(name, user_path)
        
        # Check built-in
        builtin_path = os.path.join(self.builtin_path, name, "SKILL.md")
        if os.path.exists(builtin_path):
            return self._load_skill(name, builtin_path)
        
        return None
    
    def _load_skill(self, name: str, path: str) -> dict:
        """Load a skill from disk."""
        with open(path) as f:
            content = f.read()
        
        # Parse YAML frontmatter if present
        parts = content.split('---\n', 2)
        if len(parts) == 3:
            import yaml
            metadata = yaml.safe_load(parts[1])
            body = parts[2]
        else:
            metadata = {}
            body = content
        
        return {
            'name': name,
            'metadata': metadata,
            'content': body,
            'path': path
        }
```

### Skill Slash Command (`hermes_cli/skill_commands.py`)

```python
def skill_command(skill_name: str, args: dict = None) -> str:
    """
    Execute a skill as part of the conversation.
    
    Skills are loaded as USER messages (not system prompt) to preserve caching.
    """
    hub = SkillsHub()
    skill = hub.get_skill(skill_name)
    
    if not skill:
        return f"Skill '{skill_name}' not found. Use /skills search to find available skills."
    
    # Build skill context
    skill_context = f"""
---
SKILL: {skill['name']}

{skill['content']}

---
Context:
{json.dumps(args or {})}
"""
    
    # Return as user message (will be injected into conversation)
    return skill_context
```

### Usage in Conversation

```python
# run_agent.py - Inject skills when needed
def build_context(user_message: str, skills: list = None):
    messages = [
        {"role": "system", "content": system_prompt},
        *conversation_history,
    ]
    
    # Load skills as user message (not system!)
    if skills:
        for skill_name in skills:
            skill_content = skill_command(skill_name)
            messages.append({"role": "user", "content": skill_content})
    
    messages.append({"role": "user", "content": user_message})
    return messages
```

---

## 6.4 Automatic Skill Creation

### When to Create Skills

```python
# agent/auxiliary_client.py - Periodic skill suggestion
def suggest_new_skills(conversation: list):
    """
    Analyze conversation and suggest new skills to create.
    
    Triggers after complex multi-step tasks (5+ tool calls).
    """
    if count_tool_calls(conversation) < 5:
        return None  # Not complex enough
    
    prompt = f"""
    Based on this conversation, could a reusable skill be created?
    
    Look for patterns like:
    - Repeated multi-step workflows
    - Common tasks the user asks about
    - Procedures that could be documented
    
    Conversation excerpt:
    {conversation[-30:]}  # Last 30 turns
    
    If a skill makes sense, suggest:
    1. Skill name (kebab-case)
    2. When to use it
    3. Step-by-step instructions
    4. Common pitfalls
    
    Otherwise say "No skill needed."
    """
    
    suggestion = call_llm(prompt)
    return parse_skill_suggestion(suggestion)
```

### Creating a Skill from Suggestion

```python
def create_skill_from_suggestion(suggestion: dict):
    """
    Create a new skill directory with SKILL.md.
    
    Asks user for approval before saving.
    """
    name = suggestion['name']
    path = os.path.expanduser(f"~/.hermes/skills/{name}/SKILL.md")
    
    # Create directory
    os.makedirs(os.path.dirname(path), exist_ok=True)
    
    # Write skill content
    with open(path, 'w') as f:
        f.write(suggestion['instructions'])
    
    return {
        'success': True,
        'name': name,
        'path': path,
        'message': f"Skill '{name}' created! You can now use /{name} in conversations."
    }
```

---

## 6.5 Skill Search & Installation

### Skills Hub CLI (`/skills` command)

```python
# hermes_cli/main.py - /skills slash command
@slash_command("skills")
def skills(subcommand: str = None, query: str = None):
    """
    Manage skills.
    
    Usage:
        /skills              # List all available skills
        /skills search <q>   # Search skills by keyword
        /skills inspect <name>  # Show a specific skill
        /skills install <url>   # Install from GitHub
    """
    hub = SkillsHub()
    
    if not subcommand:
        # List all skills
        skills = hub.list_all()
        return format_skills_list(skills)
    
    elif subcommand == 'search':
        # Search by keyword in skill content
        results = []
        for skill in hub.list_all():
            skill_data = hub.get_skill(skill['name'])
            if query.lower() in skill_data['content'].lower():
                results.append(skill)
        
        return format_search_results(results, query)
    
    elif subcommand == 'inspect':
        # Show specific skill
        skill = hub.get_skill(query)
        if not skill:
            return f"Skill '{query}' not found."
        
        return f"# {skill['name']}\n\n{skill['content']}"
    
    elif subcommand == 'install':
        # Install from GitHub URL
        return install_skill_from_github(query)
```

### Installing from GitHub

```python
def install_skill_from_github(url: str) -> str:
    """
    Install a skill from a GitHub repository.
    
    Expected format: https://github.com/user/repo/tree/main/skill-name
    Or: user/repo/skill-name (short form)
    """
    # Parse URL to get repo and skill name
    parsed = parse_github_url(url)
    
    if not parsed:
        return "Invalid GitHub URL format."
    
    # Clone or download the skill directory
    target_path = os.path.expanduser(f"~/.hermes/skills/{parsed['skill_name']}")
    
    if os.path.exists(target_path):
        return f"Skill '{parsed['skill_name']}' already exists. Use /skills update first."
    
    # Download from GitHub
    success = download_skill_from_github(parsed, target_path)
    
    if success:
        return f"Skill '{parsed['skill_name']}' installed! You can now use /{parsed['skill_name']}."
    else:
        return "Failed to install skill. Check the URL and try again."
```

---

## 6.6 Skill Self-Improvement

### Updating Skills When They Break

```python
def update_skill_from_error(skill_name: str, error_context: dict):
    """
    Automatically update a skill when it fails.
    
    This is the "self-improving" part of Hermes.
    """
    hub = SkillsHub()
    skill = hub.get_skill(skill_name)
    
    if not skill:
        return f"Skill '{skill_name}' not found."
    
    prompt = f"""
    This skill failed with an error. Update the instructions to prevent this.
    
    Skill: {skill['name']}
    Current instructions:
    {skill['content']}
    
    Error context:
    - What went wrong: {error_context['error']}
    - Steps taken before failure: {error_context['steps']}
    - Environment state: {error_context['state']}
    
    Update the SKILL.md to:
    1. Add this scenario to "Pitfalls" section
    2. Modify steps if needed
    3. Add verification checks
    
    Return only the updated SKILL.md content.
    """
    
    updated_content = call_llm(prompt)
    
    # Save updated skill
    path = os.path.expanduser(f"~/.hermes/skills/{skill_name}/SKILL.md")
    with open(path, 'w') as f:
        f.write(updated_content)
    
    return f"Skill '{skill_name}' updated to handle this error case."
```

### Manual Skill Updates

```python
# User can also manually update skills
@slash_command("skills")
def skills_update(skill_name: str, changes: str):
    """
    Manually update a skill.
    
    Usage: /skills update <name> <changes>
    """
    hub = SkillsHub()
    skill = hub.get_skill(skill_name)
    
    if not skill:
        return f"Skill '{skill_name}' not found."
    
    # Apply changes (simple find-and-replace or full rewrite)
    updated_content = apply_changes(skill['content'], changes)
    
    path = os.path.expanduser(f"~/.hermes/skills/{skill_name}/SKILL.md")
    with open(path, 'w') as f:
        f.write(updated_content)
    
    return f"Skill '{skill_name}' updated."
```

---

## 6.7 Hands-On Exercise

### Exercise 1: List Available Skills

```bash
# In your Telegram chat or CLI
/skills

# Or search for specific skills
/skills search github
/skills search terminal
```

**Observe:**
- How many built-in skills are available?
- What categories do they fall into?
- Can you find a skill related to something you do often?

### Exercise 2: Inspect a Skill

```bash
# Look at a specific skill's content
/skills inspect github-pr-workflow

# Or directly read the file
cat ~/git/nous-hermes-agent/optional-skills/github/github-pr-workflow/SKILL.md
```

**Questions:**
- What are the trigger conditions?
- What pitfalls does it warn about?
- How would you improve this skill?

### Exercise 3: Use a Skill in Conversation

```bash
# Start a conversation and ask for help with something that has a skill
"Help me create a GitHub pull request for my changes"

# The agent should recognize the task and load the appropriate skill
```

**Observe:**
- Does the agent mention using a skill?
- How does it guide you through the steps?
- Are there any pitfalls it warns about?

### Exercise 4: Create Your Own Skill

```bash
# Create a simple custom skill
mkdir -p ~/.hermes/skills/my-custom-task

cat > ~/.hermes/skills/my-custom-task/SKILL.md << 'EOF'
# my-custom-task

A custom workflow for doing X.

---

## Trigger Conditions

Use this when:
- User wants to do X
- User needs help with Y

---

## Steps

1. Do step 1
2. Do step 2
3. Verify result

---

## Pitfalls

- Don't forget to check Z
EOF

# Test it
hermes
/my-custom-task
```

**Observe:**
- Does the agent recognize your custom skill?
- Can you use it in conversation?

---

## 6.8 Common Pitfalls

### ❌ Don't Store Skills Only in System Prompt

```python
# BAD: Skills as system prompt (breaks caching)
def build_system_prompt():
    skills = load_all_skills()  # Every skill, every time!
    return f"{CORE_PROMPT}\n\nSkills:\n{skills}"

# GOOD: Load as user message on demand
def build_context(user_message):
    messages = [{"role": "system", "content": CORE_PROMPT}]
    
    if needed_skills:
        for skill in needed_skills:
            content = load_skill(skill)
            messages.append({"role": "user", "content": f"SKILL: {content}"})
    
    messages.append({"role": "user", "content": user_message})
```

### ❌ Don't Create Skills for One-Off Tasks

```python
# BAD: Too specific, won't be reused
skill_name = "fix-this-specific-bug-in-project-x"

# GOOD: Generalize the pattern
skill_name = "debug-terminal-tool-errors"
```

### ❌ Don't Ignore Skill Updates When They Break

```python
# BAD: Let skills rot as APIs change
def execute_skill(skill):
    # Old code that no longer works
    old_api_call()  # Returns error!

# GOOD: Update skills proactively
def update_broken_skills():
    for skill in list_all_skills():
        if skill_has_deprecated_apis(skill):
            suggest_update(skill)
```

---

## ✅ Module 6 Checklist

- [ ] Understand skill structure (SKILL.md format)
- [ ] Explain how skills are loaded and executed
- [ ] Trace automatic skill creation from experience
- [ ] Use the /skills command to search/inspect/install
- [ ] Understand skill self-improvement when they break
- [ ] Complete all four exercises

---

**Next:** [Module 07: Advanced Topics](../07-advanced-topics/advanced-topics.md)
