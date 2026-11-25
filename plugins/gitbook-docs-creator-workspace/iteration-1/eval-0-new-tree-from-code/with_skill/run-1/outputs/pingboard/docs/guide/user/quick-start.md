# Quick start

This page takes you from nothing to a dashboard that shows whether your first web address is working. It takes about ten minutes.

## Before you start

You need:

- a computer with Python 3.9 or newer and Git;
- a terminal, the window where you type commands;
- one web address you want to watch, such as `https://example.org`.

## Steps

1. **Get pingboard.** This downloads it into a folder called `pingboard` and moves you into that folder.

   ```bash
   git clone https://github.com/example/pingboard
   cd pingboard
   ```

2. **Install it.** The first two lines give pingboard its own private corner of your computer, so it cannot disturb other programs. The third installs it.

   ```bash
   python3 -m venv .venv
   . .venv/bin/activate
   pip install -e .
   ```

   When this is done, the command `pingboard` works in this terminal.

3. **Add your first address.** An address you ask pingboard to watch is called a *target*.

   ```bash
   pingboard add https://example.org
   ```

   Nothing is printed. That means it worked.

4. **Check it once.**

   ```bash
   pingboard check
   ```

   You should see one line for your target:

   ```text
   up   200    84 ms  https://example.org
   ```

   `up` means the address answered. The last number before `ms` is how long it took, in thousandths of a second; yours will differ.

5. **Start the dashboard.**

   ```bash
   pingboard serve
   ```

   You should see a line that ends in `listening on http://127.0.0.1:8080`. pingboard now checks your target once a minute for as long as this terminal stays open.

6. **Open the dashboard.** In your browser, go to `http://127.0.0.1:8080`. You should see your target with `up` next to it.

To stop pingboard, go back to the terminal and press Ctrl+C.

> **Tip.** When you open a new terminal later, go to the `pingboard` folder and run `. .venv/bin/activate` again before you use the `pingboard` command.

## Next

- [Everyday use](everyday-use.md): add more targets, remove one, read the dashboard.
- [Questions and troubleshooting](faq.md): if a step did not show what this page says.
- [Trust and privacy](trust.md): what pingboard keeps and what it sends.
