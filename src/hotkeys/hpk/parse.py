import struct
from collections import namedtuple
from enum import Enum


class FileType(Enum):
    HKP = "HKP"
    HKI = "HKI"


HEADER_FORMAT = COUNT_FORMAT = struct.Struct('<I')
HOTKEY_FORMAT = struct.Struct('<Ii???x')
Hotkey = namedtuple('Hotkey', 'code id ctrl alt shift')


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

    def _parse_header(self):
        self._result['header'], = self._unpack(HEADER_FORMAT)

    def _parse_base_menus(self):
        self._result['menus'] = [self._parse_menu() for _ in range(3)]

    def _parse_menus(self):
        num_menus, = self._unpack()
        for each in range(num_menus):
            self._result['menus'].append(self._parse_menu())

    def _parse_menu(self):
        num_hotkeys, = self._unpack()
        return [self._parse_hotkey() for _ in range(num_hotkeys)]

    def _parse_hotkey(self) -> dict:
        hotkey_struct = self._unpack(HOTKEY_FORMAT)
        return Hotkey(*hotkey_struct)._asdict()

    def parse_to_dict(self, hk_bytes):
        self._reset(hk_bytes)
        self._parse_header()

        # .hkp has a 3 constant menus that initialize the array in self._result['menus']
        # before the n-number of menus are processed, meaning that when a .hki file is
        # processed the array has to be initialized intentionally
        if self._file_type == "HKP":
            self._parse_base_menus()
        else:
            self._result['menus'] = []

        self._parse_menus()
        self._result['size'] = self._offset
        return self._result

    def validate_size(self):
        if self._result['size'] != len(self._hk_bytes):
            raise Exception(
                'Size {:d} does not equal bytearray length {:d}'
                .format(self._result['size'], len(self._hk_bytes)))


class HkUnparser(object):

    def __init__(self):
        self._reset()

    def _reset(self, hk_dict=None):
        self._offset = 0
        self._hk_dict = hk_dict
        self._result = bytearray(hk_dict['size']) if hk_dict else None

    def _pack(self, *data, **kwargs):
        struct_format = kwargs.get('struct_format', COUNT_FORMAT)
        struct_format.pack_into(self._result, self._offset, *data)
        self._offset += struct_format.size

    def _unparse_header(self, header):
        self._pack(header, struct_format=HEADER_FORMAT)

    def _unparse_menus(self, menus):
        self._pack(len(menus))
        for menu in menus:
            self._unparse_menu(menu)

    def _unparse_menu(self, menu):
        self._pack(len(menu))
        for hotkey in menu:
            self._unparse_hotkey(hotkey)

    def _unparse_hotkey(self, hotkey):
        self._pack(*Hotkey(**hotkey), struct_format=HOTKEY_FORMAT)

    def unparse_to_bytes(self, hk_dict):
        self._reset(hk_dict)
        self._unparse_header(hk_dict['header'])
        self._unparse_menus(hk_dict['menus'])
        return self._result
