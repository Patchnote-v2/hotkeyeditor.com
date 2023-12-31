from .izip import compress, decompress
from .parse import HkParser, HkUnparser, FileType
from .strings import hk_groups, hk_mapping


hk_versions = [
    ('aok', 0x3f800000, {2080}, 'Vanilla AoK'),
    ('aoc', 0x3f800000, {2192}, 'AoC/FE'),
    ('22', 0x40000000, {2432}, 'HD2.2-3'),  # different header, gotta keep this one
    ('24', 0x40400000, {}, 'HD2.4-8'),  # don't ever pick this version
    ('30', 0x40400000, {}, 'HD3.0-4.3'),  # don't ever pick this version
    ('44', 0x40400000, {}, 'HD4.4-4.9'),  # don't ever pick this version
    ('50', 0x40400000, {2192, 2204, 2252, 2264}, 'HD5.0+'),
    ('wk', 0x3f800000, {2240}, 'WololoKingdoms'),
    ('deo', 0x40400000, {}, 'DE (old)'),  # don't ever pick this version
    ('de', 0x40866666, {4632, 4644, 4664, 4676, 4712, 4724,
                        4748, 4820, 2672, 2324, 4996}, 'Definitive Edition'),
]


def copy_dict(d, *keys):
    return {key: d[key] for key in keys}


class HotkeyAssign:
    def __init__(self, hkfile):
        self.version = hkfile.version
        self.hotkeys = {k: copy_dict(v, 'code', 'ctrl', 'alt', 'shift') for (k, v) in hkfile}
        self.update()

    def get_hotkeys(self, version_hotkeys):
        return {k: v for (k, v) in self.hotkeys.items() if k in version_hotkeys}

    def update(self):
        self.hotkeys.update(
            {k: {'code': 0, 'ctrl': False, 'alt': False, 'shift': False} for k in hk_desc if k not in self.hotkeys})  # noqa


class HotkeyFile:
    # these are derived from the numerical ids/text ids in the game configs
    _hk_names = {k: v[0] for k, v in hk_mapping.items()}

    # the reverse of _hk_names
    _hk_ids = {v: k for k, v in _hk_names.items()}

    _valid_ids = set(_hk_ids.keys())

    # the strings that the above numerical ids/text ids map to
    _hk_desc = {k: v[1] for k, v in hk_mapping.items()}
    _hk_groups = hk_groups

    def __init__(self, hki, validate=True, file_name: str = "Base.hkp", file_type: FileType = FileType.HKI):
        self._file_name = file_name
        self._file_type = file_type

        hk_bytes = decompress(hki)
        parser = HkParser(file_type)
        hk_dict = parser.parse_to_dict(hk_bytes)

        # raw file data
        self.hk_dict = hk_dict

        # Header, used to determine version
        self._header = hk_dict['header']

        # File size, used to determine version
        self._file_size = hk_dict['size']
        self.version = self._find_version(self._file_size, self._header)
        # Raw menu data
        self.data = hk_dict['menus']

        # hk_map = raw menu data; no menu
        self.hk_map, self.orphan_ids, self.ids_in_file_type = self._build_id_map(self.data)

        if validate:
            parser.validate_size()
            self.validate()

    # def test(self):
    #     for key, value in self.hk_map.items():
    #         print(f"'{self._hk_desc[self._hk_ids[key]]}'")

    def get_file_size(self) -> int:
        return int(self._file_size)

    def validate(self):
        if not self.version:
            raise Exception(
                f"Unrecognized file format, header: {self._header:x}, length: {self._file_size:d}")
        if self.orphan_ids:
            raise Exception(
                f"Unrecognized hotkey ids: {','.join(f'{i:d}' for i in self.orphan_ids)}")

    @ classmethod
    def _build_id_map(cls, menus):
        hk_map = {}
        ids_in_file_type = []
        for menu in menus:
            for hotkey in menu:
                id = hotkey['id']
                if id >= 0:
                    while id in hk_map:
                        id += 0x1000000
                    hk_map[id] = hotkey
                    ids_in_file_type.append([id])
        return hk_map, set(hk_map.keys()) - cls._valid_ids, ids_in_file_type

    @ staticmethod
    def _find_version(file_size, header):
        version = None
        for (k, head, sizes, desc) in hk_versions:
            if file_size in sizes and header == head:
                version = k
        return version

    def __getitem__(self, key):
        return self.hk_map[self._hk_names[key]]

    def __contains__(self, key):
        return key in self._hk_names and self._hk_names[key] in self.hk_map

    def __iter__(self):
        for k in self._hk_names:
            if k in self:
                yield k, self[k]

    # def deserialize(self, json: str):

    def serialize(self):
        unparser = HkUnparser(self._file_type)
        hk_dict = dict(size=self._file_size, header=self._header, menus=self.data)
        raw = unparser.unparse_to_bytes(hk_dict)
        return compress(raw)

    def print_with_strings(self):
        for each in self.__iter__():
            print(hk_desc[each[0]])


def _print_in_hk_file_order(hotkey_file):
    groups = {name for menu in hk_groups for name in menu[1]}
    for i, menu in enumerate(hotkey_file.data):
        print(i)
        for hotkey in menu:
            if hotkey['id'] in _hk_ids:
                name = _hk_ids[hotkey['id']]
                if name not in groups:
                    print(repr(_hk_ids[hotkey['id']]) + ',')


# def _convert_to_single_map():
#     for k in sys.stdin:
#         k = k.strip()
#         print('{} : (0x{:x}, {}),'.format(repr(k), _hk_names[k], repr(hk_desc[k])))
