# Quick start

This page takes you from nothing to a page in your browser that shows whether your websites are up. It takes about ten minutes.

## Before you start

You need:

- a computer with Python 3.9 or newer;
- a terminal, the window where you type commands;
- a copy of the pingboard folder from <https://github.com/example/pingboard>.

If pingboard is already installed for you, skip step 1.

## Steps

1. **Install pingboard.** Open a terminal in the pingboard folder and type:

   ```bash
   pip install -e .
   ```

   When it has finished, check that the command is there:

   ```bash
   pingboard --help
   ```

   You should see a short list of words: `add`, `remove`, `list`, `check` and `serve`. These are the things pingboard can do.

2. **Add an address to watch.** An address you ask pingboard to watch is called a target.

   ```bash
   pingboard add https://example.org
   ```

   Nothing is printed. That is normal: no message means it worked.

3. **Check it once.**

   ```bash
   pingboard check
   ```

   You should see one line for your target, like this one. Your number of milliseconds will differ.

   ```text
   up   200   184 ms  https://example.org
   ```

   `up` means the website answered. `DOWN` would mean it did not, or answered with an error.

4. **Start the dashboard.** The dashboard is the page that shows all your targets.

   ```bash
   pingboard serve
   ```

   You should see a line that ends with `listening on http://127.0.0.1:8080`. The command keeps running; leave the terminal open.

5. **Open the dashboard.** In your browser, go to <http://127.0.0.1:8080>. You should see a table with your target, the word `up` and how long the answer took.

pingboard now checks your target again every minute for as long as the command runs. Reload the page to see the newest result.

To stop, go back to the terminal and press Ctrl+C.

## Next

- [Everyday use](everyday-use.md): add more targets, remove one, check more often.
- [Questions and troubleshooting](faq.md): what to do when something looks wrong.
- [Trust and privacy](trust.md): what pingboard stores and sends.
