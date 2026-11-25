#!/usr/bin/env python3
"""csvjoin: join two CSV files on a shared column and print the result as CSV."""
import argparse
import csv
import os
import sys

MAX_ROWS = int(os.environ.get("CSVJOIN_MAX_ROWS", "1000000"))


def read(path, delimiter, encoding):
    with open(path, newline="", encoding=encoding) as fh:
        rows = list(csv.DictReader(fh, delimiter=delimiter))
    if len(rows) > MAX_ROWS:
        sys.exit(f"csvjoin: {path} has {len(rows)} rows, more than CSVJOIN_MAX_ROWS={MAX_ROWS}")
    return rows


def main(argv=None):
    ap = argparse.ArgumentParser(prog="csvjoin", description=__doc__)
    ap.add_argument("left")
    ap.add_argument("right")
    ap.add_argument("--on", required=True, help="name of the column both files share")
    ap.add_argument("--how", choices=("inner", "left", "outer"), default="inner", help="which rows to keep")
    ap.add_argument("--delimiter", default=",", help="field separator of both inputs and the output")
    ap.add_argument("--encoding", default="utf-8", help="text encoding of both inputs")
    ap.add_argument("--output", "-o", help="write to this file instead of standard output")
    args = ap.parse_args(argv)

    left = read(args.left, args.delimiter, args.encoding)
    right = read(args.right, args.delimiter, args.encoding)
    for name, rows in ((args.left, left), (args.right, right)):
        if rows and args.on not in rows[0]:
            sys.exit(f"csvjoin: {name} has no column called {args.on}")
    index = {}
    for r in right:
        index.setdefault(r[args.on], []).append(r)
    fields = list(left[0].keys() if left else []) + [k for k in (right[0].keys() if right else []) if k != args.on]
    out = []
    seen = set()
    for l in left:
        matches = index.get(l[args.on], [])
        seen.add(l[args.on])
        if matches:
            out += [{**l, **m} for m in matches]
        elif args.how in ("left", "outer"):
            out.append(l)
    if args.how == "outer":
        out += [r for r in right if r[args.on] not in seen]
    fh = open(args.output, "w", newline="", encoding="utf-8") if args.output else sys.stdout
    w = csv.DictWriter(fh, fieldnames=fields, delimiter=args.delimiter, restval="")
    w.writeheader()
    w.writerows(out)
    if args.output:
        fh.close()
        print(f"csvjoin: wrote {len(out)} rows to {args.output}", file=sys.stderr)


if __name__ == "__main__":
    main()
