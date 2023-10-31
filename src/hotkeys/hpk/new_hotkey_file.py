from collections import namedtuple

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


class HotkeyFile:
    # these are derived from the numerical ids/text ids in the game configs
    _hk_names = {k: v[0] for k, v in hk_mapping.items()}

    # the reverse of _hk_names
    _hk_ids = {v: k for k, v in _hk_names.items()}

    _valid_ids = set(_hk_ids.keys())

    # the strings that the above numerical ids/text ids map to
    _hk_desc = {k: v[1] for k, v in hk_mapping.items()}
    _hk_groups = hk_groups

    def __init__(self,
                 hki,
                 validate=True,
                 file_name: str = "Base.hkp",
                 file_type: FileType = FileType.HKI):
        self._file_name = file_name
        self._file_type = file_type

        hk_bytes = decompress(hki)
        parser = HkParser(file_type)
        data = parser.parse_to_dict(hk_bytes)

        self._num_menus = len(data['menus'])
        self.deserialize_file(data)

        # Header, used to determine version
        self._header = data['header']

        # File size, used to determine version
        self._file_size = data['size']
        self.version = self._find_version(self._file_size, self._header)
        # Raw menu data
        # self.data = hk_dict['menus']

        # hk_map = raw menu data; no menu
        self.hk_map, self.orphan_ids = self._build_id_map(self.data)

        if validate:
            parser.validate_size()
            self.validate()

    def deserialize_file(self, data):
        # Perhaps need to add a file_type??
        Hotkey = namedtuple('Hotkey', 'string_text keycode ctrl alt shift menu_id')

        self.data = {}
        index = 0
        for menu in data['menus']:
            for key in menu:
                if key['id'] <= 0:
                    continue
                self.data[key['id']] = Hotkey(hk_mapping[key['id']],
                                              key['code'],
                                              key['ctrl'],
                                              key['alt'],
                                              key['shift'],
                                              index,)
            index = index + 1

    def serialize_to_file(self):
        # Serializes the data from Hotfile.data to just include the data that the
        # hotkey file has
        output = [[] for _ in range(self._num_menus)]
        for id, hotkey in self.data.items():
            output[hotkey.menu_id].append({"code": hotkey.keycode,
                                           "id": id,
                                           "ctrl": hotkey.ctrl,
                                           "alt": hotkey.alt,
                                           "shift": hotkey.shift})
        return output

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
        for id, hotkey in menus.items():
            hk_map[id] = hotkey
            # if id >= 0:
            # while id in hk_map:
            # id += 0x1000000
            # hk_map[id] = hotkey
        return hk_map, set(hk_map.keys()) - cls._valid_ids

    @ staticmethod
    def _find_version(file_size, header):
        version = None
        for (k, head, sizes, desc) in hk_versions:
            if file_size in sizes and header == head:
                version = k
        return version

    def __iter__(self):
        for k, v in self.data.items():
            yield k, v

    def __contains__(self, key):
        return key in self.data

    def __getitem__(self, key):
        return self.data[key]

    # def deserialize(self, json: str):
    def serialize(self):
        unparser = HkUnparser(self._file_type)
        hk_dict = dict(size=self._file_size, header=self._header,
                       menus=self.serialize_to_file())
        raw = unparser.unparse_to_bytes(hk_dict)
        return compress(raw)
