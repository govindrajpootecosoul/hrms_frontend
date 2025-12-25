"""
CLI wrapper for GST reconciliation workflows (Amazon, Retail/Export, Jio, Merge).

Features:
- Subcommands: amazon, retail, jio, merge, run-all
- Sensible defaults using existing filename patterns
- Clear console messaging and exit codes
"""

from pathlib import Path
import argparse
import sys

from gst_reconcile import (
    process_amazon_files,
    process_retail_export,
    process_jio_file,
    merge_files,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _first_match(pattern: str):
    """Return the first sorted Path matching the pattern in CWD (or None)."""
    matches = sorted(Path.cwd().glob(pattern))
    return matches[0] if matches else None


def _ensure_path(p: str | Path | None):
    """Convert string/Path/None to Path or None."""
    if p is None:
        return None
    return Path(p).expanduser().resolve()


def _print_header(title: str):
    bar = "=" * 60
    print(f"\n{bar}\n{title}\n{bar}")


# ---------------------------------------------------------------------------
# Command handlers
# ---------------------------------------------------------------------------

def handle_amazon(args) -> int:
    _print_header("AMAZON PROCESSING")
    mtr = _ensure_path(args.mtr) or _first_match("MTR_B2B-*.csv")
    b2c = _ensure_path(args.b2c) or _first_match("MTR_B2C-*.csv")
    stock = _ensure_path(args.stock) or _first_match("MTR_STOCK_TRANSFER-*.csv")
    out = _ensure_path(args.out) or Path.cwd() / "amazon_combined.csv"

    if not (mtr and b2c and stock):
        print("Missing one of: MTR, B2C, Stock files (check patterns or provide paths).")
        return 1

    ok, msg = process_amazon_files(str(mtr), str(b2c), str(stock), str(out))
    print(msg)
    return 0 if ok else 1


def handle_retail(args) -> int:
    _print_header("RETAIL/EXPORT PROCESSING")
    invoice = _ensure_path(args.invoice) or _first_match("Retail_invoice_input*.xlsx")
    credit = _ensure_path(args.credit) or _first_match("Retail_credit_input*.xlsx")
    out = _ensure_path(args.out) or Path.cwd() / "retail_export_combined.csv"

    if not (invoice and credit):
        print("Missing Invoice or Credit file (check patterns or provide paths).")
        return 1

    ok, msg = process_retail_export(str(invoice), str(credit), str(out))
    print(msg)
    return 0 if ok else 1


def handle_jio(args) -> int:
    _print_header("JIO PROCESSING")
    jio_file = _ensure_path(args.jio) or _first_match("Jio_*.csv")
    out = _ensure_path(args.out) or Path.cwd() / "jio_processed.csv"

    if not jio_file:
        print("Missing Jio file (check pattern or provide path).")
        return 1

    ok, msg = process_jio_file(str(jio_file), str(out))
    print(msg)
    return 0 if ok else 1


def handle_merge(args) -> int:
    _print_header("MERGING OUTPUTS")
    inputs = [_ensure_path(p) for p in args.inputs] if args.inputs else []

    if not inputs:
        # fallback to known outputs if they exist
        for name in ["amazon_combined.csv", "retail_export_combined.csv", "jio_processed.csv"]:
            candidate = Path.cwd() / name
            if candidate.exists():
                inputs.append(candidate)

    inputs = [p for p in inputs if p and p.exists()]
    if not inputs:
        print("No processed files found to merge. Provide them via --inputs.")
        return 1

    out = _ensure_path(args.out) or Path.cwd() / "merged_all.csv"
    ok, msg = merge_files([str(p) for p in inputs], str(out))
    print(msg)
    return 0 if ok else 1


def handle_run_all(args) -> int:
    """Run amazon → retail → jio → merge in sequence."""
    steps = [
        ("amazon", handle_amazon, args),
        ("retail", handle_retail, args),
        ("jio", handle_jio, args),
    ]

    outputs = []
    for name, fn, fn_args in steps:
        ret = fn(fn_args)
        if ret != 0:
            print(f"Stopping run-all: {name} step failed.")
            return ret
        if name == "amazon":
            outputs.append(_ensure_path(fn_args.out) or Path.cwd() / "amazon_combined.csv")
        elif name == "retail":
            outputs.append(_ensure_path(fn_args.out) or Path.cwd() / "retail_export_combined.csv")
        elif name == "jio":
            outputs.append(_ensure_path(fn_args.out) or Path.cwd() / "jio_processed.csv")

    merge_args = argparse.Namespace(inputs=[str(p) for p in outputs], out=args.merge_out)
    return handle_merge(merge_args)


# ---------------------------------------------------------------------------
# Parser
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="GST reconciliation processor (Amazon, Retail/Export, Jio, Merge).",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # Amazon
    p_amz = sub.add_parser("amazon", help="Process Amazon MTR/B2C/Stock files")
    p_amz.add_argument("--mtr", type=str, help="MTR (B2B) CSV path")
    p_amz.add_argument("--b2c", type=str, help="B2C CSV path")
    p_amz.add_argument("--stock", type=str, help="Stock transfer CSV path")
    p_amz.add_argument("--out", type=str, help="Output CSV path", default=None)
    p_amz.set_defaults(func=handle_amazon)

    # Retail/Export
    p_retail = sub.add_parser("retail", help="Process Retail/Export Invoice & Credit files")
    p_retail.add_argument("--invoice", type=str, help="Invoice XLSX path")
    p_retail.add_argument("--credit", type=str, help="Credit XLSX path")
    p_retail.add_argument("--out", type=str, help="Output CSV path", default=None)
    p_retail.set_defaults(func=handle_retail)

    # Jio
    p_jio = sub.add_parser("jio", help="Process Jio CSV file")
    p_jio.add_argument("--jio", type=str, help="Jio CSV path")
    p_jio.add_argument("--out", type=str, help="Output CSV path", default=None)
    p_jio.set_defaults(func=handle_jio)

    # Merge
    p_merge = sub.add_parser("merge", help="Merge already processed outputs")
    p_merge.add_argument(
        "--inputs",
        nargs="+",
        type=str,
        help="List of CSV files to merge (default: discovered processed outputs)",
    )
    p_merge.add_argument("--out", type=str, help="Merged CSV path", default=None)
    p_merge.set_defaults(func=handle_merge)

    # Run-all
    p_run_all = sub.add_parser("run-all", help="Run amazon → retail → jio → merge")
    p_run_all.add_argument("--mtr", type=str, help="MTR (B2B) CSV path")
    p_run_all.add_argument("--b2c", type=str, help="B2C CSV path")
    p_run_all.add_argument("--stock", type=str, help="Stock transfer CSV path")
    p_run_all.add_argument("--invoice", type=str, help="Invoice XLSX path")
    p_run_all.add_argument("--credit", type=str, help="Credit XLSX path")
    p_run_all.add_argument("--jio", type=str, help="Jio CSV path")
    p_run_all.add_argument("--out", type=str, help="Default output for each step", default=None)
    p_run_all.add_argument("--merge-out", type=str, help="Merged CSV path", default=None)
    p_run_all.set_defaults(func=handle_run_all)

    return parser


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

def main():
    parser = build_parser()
    args = parser.parse_args()

    # For run-all, reuse a single output argument for individual steps if provided
    if args.command == "run-all" and getattr(args, "out", None):
        args.out = args.out  # explicit paths already respected by handlers

    exit_code = args.func(args)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()

