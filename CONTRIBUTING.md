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

### 2. Add to marketplace.json

Fork this repository and add an entry to `marketplace.json`:

```json
{
  "id": "my-plugin",
  "name": "My Plugin Name",
  "description": "Brief description of what it does",
  "author": "Your Name",
  "version": "1.0.0",
  "repository": "https://github.com/username/my-plugin",
  "keywords": ["tag1", "tag2", "tag3"],
  "category": "Development",
  "license": "MIT",
  "install": "git clone https://github.com/username/my-plugin ~/.claude/plugins/my-plugin"
}
```

**Field descriptions:**

- `id` — Unique identifier (kebab-case, used as install directory name)
- `name` — Display name
- `description` — One-line summary
- `author` — Your name or GitHub username
- `version` — Semantic version matching your plugin.json
- `repository` — HTTPS git clone URL
- `keywords` — Search tags (array of strings)
- `category` — One of: Frontend, Backend, Productivity, Development, Data, Integration, Utilities, AI/ML, DevOps, Security
- `license` — SPDX license identifier
- `install` — The exact git clone command users should run

### 3. Open a Pull Request

1. Commit your changes:
   ```bash
   git add marketplace.json
   git commit -m "Add my-plugin to marketplace"
   ```

2. Push and open a PR to this repository

3. Fill out the PR template with:
   - Plugin name and description
   - Link to your repository
   - Brief explanation of what it does

### 4. Review Process

Maintainers will check:
- Valid JSON in marketplace.json
- Plugin repository is accessible
- Required files exist (.claude-plugin/plugin.json, README, LICENSE)
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

- **Plugin ID** — kebab-case, descriptive (e.g., `frontend-scaffold`, `git-helper`)
- **Commands** — Prefix with plugin name if generic (e.g., `/scaffold-frontend` not just `/scaffold`)
- **Skills** — Specific trigger descriptions to avoid conflicts

### Security

- Never include API keys or secrets in your plugin
- Document any required credentials or environment variables
- Use environment variables for sensitive configuration

## Need Help?

- **Questions** — Open a [Discussion](https://github.com/YOUR_USERNAME/claude-plugins/discussions)
- **Issues** — Open an [Issue](https://github.com/YOUR_USERNAME/claude-plugins/issues)
- **Example** — See [plugins/frontend-scaffold](plugins/frontend-scaffold/) for a reference implementation

Thank you for contributing to the Claude Code ecosystem!
