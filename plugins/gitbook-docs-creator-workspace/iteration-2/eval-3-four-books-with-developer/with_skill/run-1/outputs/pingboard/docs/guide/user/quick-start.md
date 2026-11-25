# Quick start

This page takes you from nothing to a page in your browser that shows whether your websites are up. It takes about ten minutes.

## Before you start

You need:

- a computer with Python 3.9 or newer (type `python3 --version` in a terminal to see what you have);
- `git`, to download pingboard;
- the address of one website you want to watch, such as `https://example.org`.

You type the commands below in a terminal, one line at a time.

## Steps

1. Download pingboard and go into its folder.

   ```bash
   git clone https://github.com/example/pingboard.git
   cd pingboard
   ```

   You should see `git` report that it copied the files.

2. Install it.

   ```bash
   python3 -m venv .venv
   . .venv/bin/activate
   pip install -e .
   ```

   The first two lines give pingboard its own corner of your computer so that it does not disturb other programs. The last line ends with `Successfully installed pingboard` and a version number.

3. Tell pingboard which address to watch.

   ```bash
   pingboard add https://example.org
   ```

   It prints nothing. That means it worked.

4. Check the address once.

   ```bash
   pingboard check
   ```

   You should see one line like this. `up` means the website answered; the number before `ms` is how many thousandths of a second it took.

   ```text
   up   200    87 ms  https://example.org
   ```

5. Start the dashboard, the page that shows the state of all your addresses.

   ```bash
   pingboard serve
   ```

   You should see a line that ends with `listening on http://127.0.0.1:8080`. The command keeps running; leave the terminal open.

6. Open <http://127.0.0.1:8080/> in a browser on the same computer.

   You should see the heading "pingboard" and a table with your address, the word `up` and a time. pingboard now checks the address again every minute. Reload the page to see the latest result.

To stop the dashboard, go back to the terminal and press Ctrl+C.

> **Tip.** When you open a new terminal later, go to the pingboard folder and run `. .venv/bin/activate` again before you use the `pingboard` command.

## Next

- [Everyday use](everyday-use.md): add more addresses, remove one, check from a script.
- [Questions and troubleshooting](faq.md): what to do when an address shows `DOWN` or a command prints an error.
- [Trust and privacy](trust.md): what pingboard stores and sends.
