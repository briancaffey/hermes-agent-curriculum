---
title: 'Hermes Agent Architecture Course'
description: 'A comprehensive, step-by-step curriculum to understand the Hermes Agent codebase from NousResearch.'
---

# 📚 Hermes Agent Architecture Course

Welcome! This course will take you from zero to deep understanding of how Hermes Agent works under the hood. We'll explore the codebase step by step, with hands-on examples and exercises.

## 🎯 What You'll Learn

By the end of this course, you'll understand:

1. **How Hermes works as a whole** — The big picture architecture and data flow
2. **The agent loop in detail** — How conversations progress turn by turn
3. **Tool orchestration** — How tools are discovered, registered, and called
4. **Multi-platform support** — How one codebase serves CLI, Telegram, Discord, etc.
5. **Persistence layer** — Sessions, memory, and how context survives across restarts
6. **Learning loop** — How skills are created, improved, and reused
7. **Advanced features** — Subagents, scheduling, MCP integration

## 📖 Course Modules

| Module | Topic | Estimated Time |
|--------|-------|----------------|
| [01](./docs/01-overview/overview) | Overview & Mental Model | 30 min |
|| [02](./docs/02-core-loop/core-loop) | Core Agent Loop & Conversation Flow | 60 min |
|| [03](./docs/03-tools-system/tools-system) | Tools System & Toolsets | 90 min |
|| [04](./docs/04-gateway-platforms/gateway-platforms) | Gateway & Messaging Platforms | 60 min |
|| [05](./docs/05-sessions-memory/sessions-memory) | Sessions, Memory & Persistence | 45 min |
|| [06](./docs/06-skills-learning/skills-learning) | Skills System & Self-Improvement | 75 min |
|| [07](./docs/07-advanced-topics/advanced-topics) | Advanced Topics: Subagents, Cron, MCP | 60 min |

**Total Time:** ~6 hours (spread over multiple sessions)

## 🛠️ Prerequisites

- Basic Python knowledge (functions, classes, decorators)
- Familiarity with LLMs and chat interfaces
- The cloned repo at `~/git/nous-hermes-agent`

## 🚀 Quick Start

1. **Start with Module 01** — Read the overview to understand the big picture
2. **Progress through modules in order** — Each builds on previous knowledge
3. **Code along** — Actually run the exercises, don't just read them
4. **Take breaks** — 6 hours is a lot; spread it over several days if needed

## 📝 How to Use This Course

Each module includes:
- ✅ Conceptual explanations with diagrams
- ✅ Real code from the Hermes codebase
- ✅ Hands-on exercises you can try
- ✅ Common pitfalls to avoid
- ✅ Checklist to verify understanding

## 🔗 Resources

- **Hermes Agent Repo:** https://github.com/NousResearch/hermes-agent
- **Official Docs:** https://hermes-agent.nousresearch.com/docs/
- **Discord Community:** https://discord.gg/NousResearch

---

Ready to start? Begin with [Module 01: Overview & Mental Model](./docs/01-overview/overview) 🚀
