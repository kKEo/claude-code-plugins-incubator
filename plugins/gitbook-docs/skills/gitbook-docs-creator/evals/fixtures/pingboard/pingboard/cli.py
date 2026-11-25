"""Command line: pingboard add|remove|list|check|serve."""
import argparse
import sys

from . import check, config, server, store


def main(argv=None):
    ap = argparse.ArgumentParser(prog="pingboard")
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("add", help="add a URL to the list")
    a.add_argument("url")
    r = sub.add_parser("remove", help="remove a URL from the list")
    r.add_argument("url")
    sub.add_parser("list", help="print the URLs, one per line")
    c = sub.add_parser("check", help="check every URL once and exit")
    c.add_argument("--json", action="store_true", help="print results as JSON")
    c.add_argument("--fail-fast", action="store_true", help="stop at the first URL that is down")
    s = sub.add_parser("serve", help="run the dashboard and check on a schedule")
    s.add_argument("--port", type=int, help="override PINGBOARD_PORT")
    args = ap.parse_args(argv)
    cfg = config.load()

    if args.cmd == "add":
        if not args.url.startswith(("http://", "https://")):
            sys.exit("pingboard: a target must start with http:// or https://")
        store.write(cfg.data_file, store.read(cfg.data_file) + [args.url])
    elif args.cmd == "remove":
        targets = store.read(cfg.data_file)
        if args.url not in targets:
            sys.exit(f"pingboard: {args.url} is not in the list")
        store.write(cfg.data_file, [t for t in targets if t != args.url])
    elif args.cmd == "list":
        print("\n".join(store.read(cfg.data_file)))
    elif args.cmd == "check":
        down = 0
        out = []
        for url in store.read(cfg.data_file):
            res = check.check(url, cfg.timeout)
            out.append(res.__dict__)
            down += not res.up
            if not args.json:
                print(f"{'up  ' if res.up else 'DOWN'} {res.status:3} {res.millis:5} ms  {url}")
            if args.fail_fast and not res.up:
                break
        if args.json:
            import json
            print(json.dumps(out))
        sys.exit(1 if down else 0)
    elif args.cmd == "serve":
        if args.port:
            cfg = config.Config(**{**cfg.__dict__, "port": args.port})
        server.serve(cfg)


if __name__ == "__main__":
    main()
