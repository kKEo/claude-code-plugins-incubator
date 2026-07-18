# Contributing to the Marketplace

Thank you for contributing! Here's how to add your plugin to the registry.

## Plugin Requirements

Your plugin must have:

1. **`.claude-plugin/plugin.json`** — Plugin manifest with required fields:
   ```json
   {
     "name": "plugin-name",
     "version": "1.0.0",
     "description": "What your plugin does",
     "author": { "name": "Your Name" }
   }
   ```

2. **`README.md`** — Clear documentation with:
   - What the plugin does
   - Installation instructions
   - Usage examples
   - Requirements/dependencies

3. **`LICENSE`** file — Any OSI-approved license

4. **Quality** — Plugin should be tested and working

## Submission Process

### 1. Create Your Plugin Repository

Host your plugin in its own git repository (GitHub, GitLab, etc.). Structure:

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
├── commands/          # Optional: slash commands
├── skills/            # Optional: skills
├── agents/            # Optional: agents
├── hooks/             # Optional: lifecycle hooks
├── README.md
└── LICENSE
```

### 2. Add to `.claude-plugin/marketplace.json`

Fork this repository and add a native Claude Code marketplace entry:

```json
{
  "name": "my-plugin",
  "description": "Brief description of what it does",
  "source": {
    "source": "github",
    "repo": "username/my-plugin",
    "ref": "v1.0.0"
  },
  "category": "Development"
}
```

**Field descriptions:**

- `name` — Unique plugin name from `.claude-plugin/plugin.json`
- `description` — One-line summary
- `source` — Local path or version-pinned external GitHub source
- `category` — One of: Frontend, Backend, Productivity, Development, Data, Integration, Utilities, AI/ML, DevOps, Security

### 3. Open a Pull Request

1. Commit your changes:
   ```bash
   claude plugin validate .
   git add .claude-plugin/marketplace.json
   git commit -m "Add my-plugin to marketplace"
   ```

2. Push and open a PR to this repository

3. Fill out the PR template with:
   - Plugin name and description
   - Link to your repository
   - Brief explanation of what it does

### 4. Review Process

Maintainers will check:
- A valid native Claude marketplace manifest
- Plugin repository is accessible
- Required files exist (`.claude-plugin/plugin.json`, README, LICENSE)
- No malicious code
- Description is clear

Once approved, your PR will be merged and your plugin will appear in the marketplace!

## Guidelines

### Quality Standards

- **Tested** — Plugin should work with the latest Claude Code
- **Documented** — Clear README with examples
- **Safe** — No malicious code, respect user privacy
- **Maintained** — Respond to issues, keep dependencies updated

### Naming Conventions

- **Plugin name** — kebab-case, descriptive (e.g., `frontend-scaffold`, `git-helper`)
- **Commands** — Prefix with plugin name if generic (e.g., `/scaffold-frontend` not just `/scaffold`)
- **Skills** — Specific trigger descriptions to avoid conflicts

### Security

- Never include API keys or secrets in your plugin
- Document any required credentials or environment variables
- Use environment variables for sensitive configuration

## Need Help?

- **Questions and issues** — Open an [Issue](https://github.com/kKEo/claude-code-plugins-incubator/issues)
- **Example** — See [plugins/frontend-scaffold](plugins/frontend-scaffold/) for a reference implementation

Thank you for contributing to the Claude Code ecosystem!
