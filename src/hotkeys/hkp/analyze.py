"""HKP file analyzer — a reverse-engineering aid for AoE2:DE hotkey files.

Decompresses one or more ``.hkp`` files and dumps a structured analysis
(header, hex+ASCII body, printable-string scan with surrounding bytes, and a
best-effort walk using the legacy parser logic) to stdout.  Intended for
diffing old-format vs new-format hotkey files while the binary layout is
being reverse-engineered.

Run via ``python -m hotkeys.hkp.analyze <file.hkp> ...`` from the ``src/``
directory, or directly as ``python src/hotkeys/hkp/analyze.py``.
"""

from __future__ import annotations

import argparse
import os
import struct
import sys
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

# Dual-mode imports: work both as a package module and as a standalone script.
if __package__ in (None, ""):
    _here = os.path.dirname(os.path.abspath(__file__))
    _src = os.path.abspath(os.path.join(_here, "..", ".."))
    if _src not in sys.path:
        sys.path.insert(0, _src)
    from hotkeys.hkp.izip import decompress  # type: ignore
else:
    from .izip import decompress


HEADER_STRUCT = struct.Struct("<I")
FLOAT_STRUCT = struct.Struct("<f")
COUNT_STRUCT = struct.Struct("<I")
OLD_HOTKEY_STRUCT = struct.Struct("<Ii???x")  # code, id, ctrl, alt, shift, pad


# ---------------------------------------------------------------------------
# Data containers
# ---------------------------------------------------------------------------

@dataclass
class StringHit:
    offset: int
    length: int
    text: str
    prefix4: bytes
    suffix8: bytes

    @property
    def prefix_u32_le(self) -> int:
        return struct.unpack("<I", self.prefix4)[0] if len(self.prefix4) == 4 else -1


@dataclass
class WalkResult:
    ok: bool
    header: int
    menus: List[List[dict]] = field(default_factory=list)
    stopped_at: int = 0
    stage: str = ""
    error: str = ""
    remaining: int = 0


# ---------------------------------------------------------------------------
# Analysis helpers
# ---------------------------------------------------------------------------

def hexdump(data: bytes, start: int = 0, max_bytes: Optional[int] = None) -> str:
    if max_bytes is not None and len(data) > max_bytes:
        data = data[:max_bytes]
        truncated = True
    else:
        truncated = False

    lines = []
    for base in range(0, len(data), 16):
        chunk = data[base:base + 16]
        hex_part = " ".join(f"{b:02x}" for b in chunk)
        hex_part = hex_part.ljust(16 * 3 - 1)
        ascii_part = "".join(chr(b) if 32 <= b < 127 else "." for b in chunk)
        lines.append(f"{start + base:08x}  {hex_part}  |{ascii_part}|")
    if truncated:
        lines.append(f"... (truncated, showing {max_bytes} of original)")
    return "\n".join(lines)


def find_strings(data: bytes, min_length: int = 6) -> List[StringHit]:
    hits: List[StringHit] = []
    i = 0
    n = len(data)
    while i < n:
        if 32 <= data[i] < 127:
            j = i
            while j < n and 32 <= data[j] < 127:
                j += 1
            if j - i >= min_length:
                prefix = data[max(0, i - 4):i]
                if len(prefix) < 4:
                    prefix = b"\x00" * (4 - len(prefix)) + prefix
                suffix = data[j:j + 8]
                hits.append(StringHit(
                    offset=i,
                    length=j - i,
                    text=data[i:j].decode("ascii", errors="replace"),
                    prefix4=bytes(prefix),
                    suffix8=bytes(suffix),
                ))
            i = j
        else:
            i += 1
    return hits


def partial_walk(data: bytes, file_type: str = "HKP") -> WalkResult:
    """Walk ``data`` using the legacy parser logic, stopping on first failure."""
    res = WalkResult(ok=False, header=0)
    off = 0
    try:
        (res.header,) = HEADER_STRUCT.unpack_from(data, off)
        off += HEADER_STRUCT.size

        def read_menu(cur: int) -> Tuple[List[dict], int]:
            (num_hk,) = COUNT_STRUCT.unpack_from(data, cur)
            cur += COUNT_STRUCT.size
            hotkeys = []
            for _ in range(num_hk):
                code, sid, c, a, s = OLD_HOTKEY_STRUCT.unpack_from(data, cur)
                cur += OLD_HOTKEY_STRUCT.size
                hotkeys.append({"code": code, "id": sid,
                                "ctrl": c, "alt": a, "shift": s})
            return hotkeys, cur

        res.stage = "base_menus"
        if file_type == "HKP":
            for _ in range(3):
                menu, off = read_menu(off)
                res.menus.append(menu)

        res.stage = "menu_count"
        (num_menus,) = COUNT_STRUCT.unpack_from(data, off)
        off += COUNT_STRUCT.size

        res.stage = "extra_menus"
        for _ in range(num_menus):
            menu, off = read_menu(off)
            res.menus.append(menu)

        res.stopped_at = off
        res.ok = (off == len(data))
        if not res.ok:
            res.error = f"walk ended at 0x{off:x} but file length is 0x{len(data):x}"
            res.remaining = len(data) - off
    except struct.error as e:
        res.stopped_at = off
        res.error = str(e)
        res.remaining = len(data) - off
    return res


# ---------------------------------------------------------------------------
# Reporting
# ---------------------------------------------------------------------------

def _section(title: str) -> str:
    return f"\n{'=' * 78}\n== {title}\n{'=' * 78}"


def analyze_file(path: str, max_bytes: int, min_string: int,
                 file_type: str = "HKP") -> dict:
    with open(path, "rb") as f:
        compressed = f.read()
    raw = decompress(compressed)

    header = HEADER_STRUCT.unpack_from(raw, 0)[0] if len(raw) >= 4 else 0
    header_f = FLOAT_STRUCT.unpack_from(raw, 0)[0] if len(raw) >= 4 else float("nan")
    strings = find_strings(raw, min_length=min_string)
    walk = partial_walk(raw, file_type=file_type)

    print(_section(f"FILE  {path}"))
    print(f"  compressed size : {len(compressed):d} bytes")
    print(f"  decompressed    : {len(raw):d} bytes (0x{len(raw):x})")
    print(f"  file_type arg   : {file_type}")

    print(_section("HEADER (first 4 bytes)"))
    print(f"  hex      : {raw[:4].hex(' ') if len(raw) >= 4 else '<short>'}")
    print(f"  uint32 LE: 0x{header:08x}  ({header:d})")
    print(f"  float32  : {header_f!r}")

    print(_section(f"HEX DUMP (max_bytes={max_bytes})"))
    print(hexdump(raw, start=0, max_bytes=max_bytes))

    print(_section(f"PRINTABLE STRING RUNS  (len >= {min_string}, total={len(strings)})"))
    for h in strings:
        prefix_u32 = h.prefix_u32_le
        matches_len = " <-- length prefix matches!" if prefix_u32 == h.length else ""
        print(f"  0x{h.offset:06x}  len={h.length:<3d}  "
              f"prev4={h.prefix4.hex(' ')} (u32={prefix_u32}){matches_len}")
        print(f"             text={h.text!r}")
        print(f"             next8={h.suffix8.hex(' ')}")

    print(_section("LEGACY PARTIAL WALK"))
    print(f"  header_read : 0x{walk.header:08x}")
    print(f"  ok          : {walk.ok}")
    print(f"  stopped_at  : 0x{walk.stopped_at:x}  ({walk.stopped_at:d})")
    print(f"  remaining   : {walk.remaining:d} bytes unread")
    print(f"  stage       : {walk.stage}")
    if walk.error:
        print(f"  error       : {walk.error}")
    print(f"  menus read  : {len(walk.menus)}")
    for i, m in enumerate(walk.menus):
        print(f"    menu[{i}]: {len(m)} hotkeys")

    return {
        "path": path,
        "compressed": len(compressed),
        "raw": raw,
        "header": header,
        "strings": strings,
        "walk": walk,
    }


def diff_reports(a: dict, b: dict) -> None:
    print(_section(f"DIFF  {os.path.basename(a['path'])}  vs  {os.path.basename(b['path'])}"))
    print(f"  sizes raw    : {len(a['raw'])}  vs  {len(b['raw'])}")
    print(f"  sizes zipped : {a['compressed']}  vs  {b['compressed']}")
    print(f"  headers      : 0x{a['header']:08x}  vs  0x{b['header']:08x}")

    a_strings = {h.text: h.offset for h in a["strings"]}
    b_strings = {h.text: h.offset for h in b["strings"]}
    only_a = sorted(set(a_strings) - set(b_strings))
    only_b = sorted(set(b_strings) - set(a_strings))
    common = sorted(set(a_strings) & set(b_strings))

    print(_section("STRING LABELS — SHARED (with offsets in each file)"))
    for s in common:
        print(f"  0x{a_strings[s]:06x}  |  0x{b_strings[s]:06x}  {s!r}")

    if only_a:
        print(_section(f"STRING LABELS — ONLY in {os.path.basename(a['path'])}"))
        for s in only_a:
            print(f"  0x{a_strings[s]:06x}  {s!r}")
    if only_b:
        print(_section(f"STRING LABELS — ONLY in {os.path.basename(b['path'])}"))
        for s in only_b:
            print(f"  0x{b_strings[s]:06x}  {s!r}")

    # First byte where they diverge
    ra, rb = a["raw"], b["raw"]
    lim = min(len(ra), len(rb))
    first_div = next((i for i in range(lim) if ra[i] != rb[i]), lim)
    print(_section("FIRST BYTE DIVERGENCE"))
    print(f"  index : 0x{first_div:x}")
    if first_div < lim:
        ctx_a = ra[max(0, first_div - 8):first_div + 16]
        ctx_b = rb[max(0, first_div - 8):first_div + 16]
        print(f"  a[..] : {ctx_a.hex(' ')}")
        print(f"  b[..] : {ctx_b.hex(' ')}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="python -m hotkeys.hkp.analyze",
        description="Decompress and analyze AoE2:DE .hkp hotkey files.",
    )
    p.add_argument("files", nargs="+", help="Paths to .hkp files")
    p.add_argument("--max-bytes", type=int, default=4096,
                   help="Hexdump byte cap per file (default: 4096, 0 = no limit)")
    p.add_argument("--min-string", type=int, default=6,
                   help="Minimum printable run length to report (default: 6)")
    p.add_argument("--type", choices=["HKP", "HKI"], default="HKP",
                   help="File type for the legacy walk (default: HKP)")
    p.add_argument("--diff", action="store_true",
                   help="When exactly 2 files are given, also print a structural diff.")
    return p


def main(argv: Optional[List[str]] = None) -> int:
    args = build_parser().parse_args(argv)
    max_bytes = None if args.max_bytes == 0 else args.max_bytes

    reports = [analyze_file(f, max_bytes=max_bytes,
                            min_string=args.min_string, file_type=args.type)
               for f in args.files]

    if args.diff:
        if len(reports) != 2:
            print("\n[!] --diff requires exactly 2 files", file=sys.stderr)
            return 2
        diff_reports(reports[0], reports[1])

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
