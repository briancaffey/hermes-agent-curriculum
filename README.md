# Hermes Agent Architecture Course 📚

A comprehensive, step-by-step curriculum to understand the Hermes Agent codebase from NousResearch.

## 🌐 Live Website

**View the course online:** https://briancaffey.github.io/hermes-agent-curriculum

## 📖 About This Course

This course takes you from zero to deep understanding of how Hermes Agent works under the hood. We explore the codebase step by step, with hands-on examples and exercises.

### What You'll Learn

1. **How Hermes works as a whole** — The big picture architecture and data flow
2. **The agent loop in detail** — How conversations progress turn by turn
3. **Tool orchestration** — How tools are discovered, registered, and called
4. **Multi-platform support** — How one codebase serves CLI, Telegram, Discord, etc.
5. **Persistence layer** — Sessions, memory, and how context survives across restarts
6. **Learning loop** — How skills are created, improved, and reused
7. **Advanced features** — Subagents, scheduling, MCP integration

## 📚 Course Modules

| Module | Topic | Estimated Time |
|--------|-------|----------------|
| [01](https://briancaffey.github.io/hermes-agent-curriculum/docs/overview) | Overview & Mental Model | 30 min |
| [02](https://briancaffey.github.io/hermes-agent-curriculum/docs/core-loop) | Core Agent Loop & Conversation Flow | 60 min |
| [03](https://briancaffey.github.io/hermes-agent-curriculum/docs/tools-system) | Tools System & Toolsets | 90 min |
| [04](https://briancaffey.github.io/hermes-agent-curriculum/docs/gateway-platforms) | Gateway & Messaging Platforms | 60 min |
| [05](https://briancaffey.github.io/hermes-agent-curriculum/docs/sessions-memory) | Sessions, Memory & Persistence | 45 min |
| [06](https://briancaffey.github.io/hermes-agent-curriculum/docs/skills-learning) | Skills System & Self-Improvement | 75 min |
| [07](https://briancaffey.github.io/hermes-agent-curriculum/docs/advanced-topics) | Advanced Topics: Subagents, Cron, MCP | 60 min |

**Total Time:** ~6 hours (spread over multiple sessions)

## 🛠️ Prerequisites

- Basic Python knowledge (functions, classes, decorators)
- Familiarity with LLMs and chat interfaces
- The cloned repo at `~/git/nous-hermes-agent`

## 🔗 Resources

- **Hermes Agent Repo:** https://github.com/NousResearch/hermes-agent
- **Official Docs:** https://hermes-agent.nousresearch.com/docs/
- **Discord Community:** https://discord.gg/NousResearch

## 🚀 Running Locally

If you want to run the course website locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run generate
```

The site will be available at `http://localhost:3000` during development.

## 📝 License

MIT License - feel free to use this course material for learning!

---

*Course created by Brian Caffey*
