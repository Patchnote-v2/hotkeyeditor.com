import struct
from collections import namedtuple
from enum import Enum


class FileType(Enum):
    HKP = "HKP"
    HKI = "HKI"


HEADER_FORMAT = COUNT_FORMAT = struct.Struct('<I')
HOTKEY_FORMAT = struct.Struct('<Ii???x')
Hotkey = namedtuple('Hotkey', 'code id ctrl alt shift')


# Pre-2026 format header (float32 4.2)
LEGACY_HEADER = 0x40866666
# 2026+ format header (float32 4.32) — wraps every record in named markers
NEW_HEADER = 0x408a3d71
# Constant uint32 written at the start of every wrapped record. Stable across
# every sample we have; treated as a literal magic.
HANDLER_MAGIC = 0x00100a60

HANDLER_BEGIN = b'HandlerBaseGroupBegin'
HANDLER_END = b'HandlerBaseGroupEnd'
GROUP_HEADER_GUARD = b'GroupHeaderGuard'

ADDITIONAL_BEGIN = b'additionalHotkeysBegin'
ADDITIONAL_END = b'additionalHotkeysEnd'
ALL_UNIT_BEGIN = b'allUnitCommandHotkeysBegin'
ALL_UNIT_END = b'allUnitCommandHotkeysEnd'
ALL_GAME_BEGIN = b'allGameCommandHotkeysBegin'
ALL_GAME_END = b'allGameCommandHotkeysEnd'
ALL_CYCLE_BEGIN = b'allCycleCommandHotkeysBegin'
ALL_CYCLE_END = b'allCycleCommandHotkeysEnd'
DETACHED_GROUPS_BEGIN = b'detachedHotkeyGroupsBegin'
DETACHED_GROUPS_END = b'detachedHotkeyGroupsEnd'
DETACHED_GROUP_BEGIN = b'detachedHotkeysGroupBegin'
DETACHED_GROUP_END = b'detachedHotkeysGroupEnd'

BASE_HOTKEYS_BEGIN = b'baseHotkeysBegin'
BASE_HOTKEYS_END = b'baseHotkeysEnd'
SHARED_GROUPS_BEGIN = b'sharedHotkeyGroupsBegin'
SHARED_GROUPS_END = b'sharedHotkeyGroupsEnd'


class HkParser(object):
    def __init__(self, file_type: FileType = FileType.HKI) -> None:
        self._file_type = file_type
        self._reset()

    def _reset(self, hk_bytes=None):
        self._offset = 0
        self._result = {}
        self._hk_bytes = hk_bytes

    def _unpack(self, struct_format: struct.Struct = COUNT_FORMAT):
        data = struct_format.unpack_from(self._hk_bytes, self._offset)
        self._offset += struct_format.size
        return data

    def _match_literal(self, literal: bytes):
        end = self._offset + len(literal)
        actual = bytes(self._hk_bytes[self._offset:end])
        if actual != literal:
            raise struct.error(
                f"expected literal {literal!r} at offset 0x{self._offset:x}, "
                f"got {actual!r}")
        self._offset = end

    def _parse_header(self):
        self._result['header'], = self._unpack(HEADER_FORMAT)

    # ----- legacy (pre-2026) format -----

    def _parse_legacy_hotkey(self) -> dict:
        return Hotkey(*self._unpack(HOTKEY_FORMAT))._asdict()

    def _parse_legacy_menu(self):
        num_hotkeys, = self._unpack()
        return [self._parse_legacy_hotkey() for _ in range(num_hotkeys)]

    def _parse_legacy_hkp_body(self):
        self._result['menus'] = [self._parse_legacy_menu() for _ in range(3)]
        num_extra, = self._unpack()
        for _ in range(num_extra):
            self._result['menus'].append(self._parse_legacy_menu())

    def _parse_legacy_hki_body(self):
        self._result['menus'] = []
        num_extra, = self._unpack()
        for _ in range(num_extra):
            self._result['menus'].append(self._parse_legacy_menu())

    # ----- new (2026+) format -----

    def _parse_new_hotkey(self) -> dict:
        self._match_literal(HANDLER_BEGIN)
        magic, = self._unpack()
        self._result.setdefault('handler_magic', magic)
        self._match_literal(GROUP_HEADER_GUARD)
        hotkey = Hotkey(*self._unpack(HOTKEY_FORMAT))._asdict()
        self._match_literal(HANDLER_END)
        return hotkey

    def _parse_new_flat_section(self, begin_lit: bytes, end_lit: bytes):
        self._match_literal(begin_lit)
        num_hotkeys, = self._unpack()
        menu = [self._parse_new_hotkey() for _ in range(num_hotkeys)]
        self._match_literal(end_lit)
        return menu

    def _parse_new_detached_group(self):
        num_hotkeys, = self._unpack()
        self._match_literal(DETACHED_GROUP_BEGIN)
        menu = [self._parse_new_hotkey() for _ in range(num_hotkeys)]
        self._match_literal(DETACHED_GROUP_END)
        return menu

    def _parse_new_hkp_body(self):
        self._match_literal(ADDITIONAL_BEGIN)
        menus = [
            self._parse_new_flat_section(ALL_UNIT_BEGIN, ALL_UNIT_END),
            self._parse_new_flat_section(ALL_GAME_BEGIN, ALL_GAME_END),
            self._parse_new_flat_section(ALL_CYCLE_BEGIN, ALL_CYCLE_END),
        ]
        self._match_literal(DETACHED_GROUPS_BEGIN)
        num_groups, = self._unpack()
        for _ in range(num_groups):
            menus.append(self._parse_new_detached_group())
        self._match_literal(DETACHED_GROUPS_END)
        self._match_literal(ADDITIONAL_END)
        self._result['menus'] = menus

    def _parse_new_hki_body(self):
        # The outer group count sits between the header and the first literal,
        # not after it like the per-section counts in HKP files.
        num_groups, = self._unpack()
        self._match_literal(BASE_HOTKEYS_BEGIN)
        self._match_literal(SHARED_GROUPS_BEGIN)
        menus = []
        for _ in range(num_groups):
            num_hotkeys, = self._unpack()
            menus.append([self._parse_new_hotkey() for _ in range(num_hotkeys)])
        self._match_literal(SHARED_GROUPS_END)
        self._match_literal(BASE_HOTKEYS_END)
        self._result['menus'] = menus

    # ----- entry points -----

    def parse_to_dict(self, hk_bytes):
        self._reset(hk_bytes)
        self._parse_header()
        self._result['format'] = 'new' if self._result['header'] == NEW_HEADER else 'legacy'

        if self._result['format'] == 'new':
            if self._file_type == FileType.HKP:
                self._parse_new_hkp_body()
            else:
                self._parse_new_hki_body()
        else:
            if self._file_type == FileType.HKP:
                self._parse_legacy_hkp_body()
            else:
                self._parse_legacy_hki_body()

        self._result['size'] = self._offset
        return self._result

    def validate_size(self):
        if self._result['size'] != len(self._hk_bytes):
            raise Exception(
                'Size {:d} does not equal bytearray length {:d}'
                .format(self._result['size'], len(self._hk_bytes)))


class HkUnparser(object):
    def __init__(self, file_type: FileType = FileType.HKI) -> None:
        self._file_type = file_type
        self._reset()

    def _reset(self, hk_dict=None):
        self._offset = 0
        self._hk_dict = hk_dict
        # New-format payloads have variable size due to the section literals,
        # so we build the buffer by appending instead of pre-allocating.
        self._result = bytearray()

    def _pack(self, *data, **kwargs):
        struct_format = kwargs.get('struct_format', COUNT_FORMAT)
        self._result += struct_format.pack(*data)
        self._offset += struct_format.size

    def _emit_literal(self, literal: bytes):
        self._result += literal
        self._offset += len(literal)

    def _unparse_header(self, header):
        self._pack(header, struct_format=HEADER_FORMAT)

    # ----- legacy -----

    def _unparse_legacy_hotkey(self, hotkey):
        self._pack(*Hotkey(**hotkey), struct_format=HOTKEY_FORMAT)

    def _unparse_legacy_menu(self, menu):
        self._pack(len(menu))
        for hotkey in menu:
            self._unparse_legacy_hotkey(hotkey)

    def _unparse_legacy_hkp(self, hk_dict):
        menus = hk_dict['menus']
        for i in range(3):
            self._unparse_legacy_menu(menus[i])
        extra = menus[3:]
        self._pack(len(extra))
        for menu in extra:
            self._unparse_legacy_menu(menu)

    def _unparse_legacy_hki(self, hk_dict):
        menus = hk_dict['menus']
        self._pack(len(menus))
        for menu in menus:
            self._unparse_legacy_menu(menu)

    # ----- new -----

    def _unparse_new_hotkey(self, hotkey, magic):
        self._emit_literal(HANDLER_BEGIN)
        self._pack(magic)
        self._emit_literal(GROUP_HEADER_GUARD)
        self._pack(*Hotkey(**hotkey), struct_format=HOTKEY_FORMAT)
        self._emit_literal(HANDLER_END)

    def _unparse_new_flat_section(self, menu, begin_lit, end_lit, magic):
        self._emit_literal(begin_lit)
        self._pack(len(menu))
        for hotkey in menu:
            self._unparse_new_hotkey(hotkey, magic)
        self._emit_literal(end_lit)

    def _unparse_new_detached_group(self, menu, magic):
        self._pack(len(menu))
        self._emit_literal(DETACHED_GROUP_BEGIN)
        for hotkey in menu:
            self._unparse_new_hotkey(hotkey, magic)
        self._emit_literal(DETACHED_GROUP_END)

    def _unparse_new_hkp(self, hk_dict):
        menus = hk_dict['menus']
        magic = hk_dict.get('handler_magic', HANDLER_MAGIC)
        self._emit_literal(ADDITIONAL_BEGIN)
        self._unparse_new_flat_section(menus[0], ALL_UNIT_BEGIN, ALL_UNIT_END, magic)
        self._unparse_new_flat_section(menus[1], ALL_GAME_BEGIN, ALL_GAME_END, magic)
        self._unparse_new_flat_section(menus[2], ALL_CYCLE_BEGIN, ALL_CYCLE_END, magic)
        self._emit_literal(DETACHED_GROUPS_BEGIN)
        detached = menus[3:]
        self._pack(len(detached))
        for menu in detached:
            self._unparse_new_detached_group(menu, magic)
        self._emit_literal(DETACHED_GROUPS_END)
        self._emit_literal(ADDITIONAL_END)

    def _unparse_new_hki(self, hk_dict):
        menus = hk_dict['menus']
        magic = hk_dict.get('handler_magic', HANDLER_MAGIC)
        self._pack(len(menus))
        self._emit_literal(BASE_HOTKEYS_BEGIN)
        self._emit_literal(SHARED_GROUPS_BEGIN)
        for menu in menus:
            self._pack(len(menu))
            for hotkey in menu:
                self._unparse_new_hotkey(hotkey, magic)
        self._emit_literal(SHARED_GROUPS_END)
        self._emit_literal(BASE_HOTKEYS_END)

    # ----- entry point -----

    def unparse_to_bytes(self, hk_dict):
        self._reset(hk_dict)
        self._unparse_header(hk_dict['header'])

        is_new = hk_dict.get('format') == 'new' or hk_dict['header'] == NEW_HEADER
        if is_new:
            if self._file_type == FileType.HKP:
                self._unparse_new_hkp(hk_dict)
            else:
                self._unparse_new_hki(hk_dict)
        else:
            if self._file_type == FileType.HKP:
                self._unparse_legacy_hkp(hk_dict)
            else:
                self._unparse_legacy_hki(hk_dict)

        return bytes(self._result)
