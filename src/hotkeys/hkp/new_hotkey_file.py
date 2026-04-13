import hashlib
import struct

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
                        4748, 4820, 2672, 2324, 2796, 2336, 4996}, 'Definitive Edition'),
    # 2026+ format wraps every record in named markers, so the file size is
    # variable (depends on how many hotkeys/groups are present). Sentinel
    # `None` means "any size accepted".
    ('de_new', 0x408a3d71, None, 'Definitive Edition (2026+)'),
]

# Filesizes by path (Base/Profile)
# 107882: 2796/2336
# 109739: 2796/2336
# 117204: 2836/2336
# 118476: 2836/2336
# 133341: 2348/4268


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
        try:
            data = parser.parse_to_dict(hk_bytes)
        except struct.error as error:
            raise error

        self._num_menus = len(data['menus'])
        self.deserialize_file(data)

        # Header, used to determine version
        self._header = data['header']

        # File size, used to determine version
        self._file_size = data['size']

        # Format ('legacy' or 'new'); used so the unparser writes back in the
        # same shape we read.
        self._format = data.get('format', 'legacy')
        self._handler_magic = data.get('handler_magic')

        # todo: graceful wrong hotkey file version handling
        self.version = self._find_version(self._file_size, self._header)
        # Raw menu data
        # self.data = hk_dict['menus']

        # hk_map = raw menu data; no menu
        self.hk_map, self.orphan_ids = self._build_id_map(self.data)

        if validate:
            parser.validate_size()
            self.validate()

    def update(self, newValues) -> dict:
        changed = {}
        for key, value in newValues.items():
            if key in self:
                if self[key] != value:
                    changed[key] = value

                self[key] = value
        return changed

    # todo: make this fail is there's missing strings in hk_mapping
    def deserialize_file(self, data):
        self.data = {}
        # Preserve the raw parsed menu structure so we can round-trip slots that
        # don't appear in self.data (id <= 0 sentinels, or hotkeys we filter out
        # because they have no displayable string). _slot_keys maps each
        # (menu_idx, slot_idx) of self._raw_menus to the data key it lives under.
        self._raw_menus = data['menus']
        self._slot_keys = {}
        for menu_idx, menu in enumerate(self._raw_menus):
            for slot_idx, key in enumerate(menu):
                if key['id'] <= 0:
                    continue

                # The string ID isn't guaranteed to be unique, so we we hash it
                # and then rehash the hash until it provides a unique hash that
                # isn't already in self.data.  This means that all keys are not
                # only guaranteed to be unique eventually, but that given the
                # same starting string ID the keys are repeatably the same.
                # The keys being the same is important since we read the a
                # hotkey file twice per user: once when loading the interface
                # and once when handing them the new file.  This means that keys
                # need to be unique but repeatably generatable betweenr reads.
                md5 = hashlib.md5()
                md5.update(str(key['id']).encode('utf-8'))
                dataKey = md5.hexdigest()
                while dataKey in self.data:
                    md5.update(dataKey.encode('utf-8'))
                    dataKey = md5.hexdigest()

                # It's important that string_text is blank if it fails to find a string match
                # Looking for blank strings is what is used by the grabstrings command when
                # looking for missing strings when an update happens.
                self.data[dataKey] = {"string_text": hk_mapping[key['id']] if key['id'] in hk_mapping else "",  # noqa
                                           "string_id": key['id'],
                                           "keycode": key['code'],
                                           "ctrl": key['ctrl'],
                                           "alt": key['alt'],
                                           "shift": key['shift'],
                                           "menu_id": menu_idx, }
                self._slot_keys[(menu_idx, slot_idx)] = dataKey

    def serialize_to_file(self):
        # Walk the original parsed menu structure and replace each tracked slot
        # with its (possibly user-edited) value from self.data. Untracked slots
        # (id <= 0) pass through unchanged. This preserves both order and the
        # filtered-out sentinel slots that the previous self.data-only rebuild
        # would silently drop.
        output = []
        for menu_idx, menu in enumerate(self._raw_menus):
            out_menu = []
            for slot_idx, raw_slot in enumerate(menu):
                data_key = self._slot_keys.get((menu_idx, slot_idx))
                if data_key is not None and data_key in self.data:
                    hotkey = self.data[data_key]
                    out_menu.append({"code": hotkey["keycode"],
                                     "id": hotkey["string_id"],
                                     "ctrl": hotkey["ctrl"],
                                     "alt": hotkey["alt"],
                                     "shift": hotkey["shift"]})
                else:
                    out_menu.append({"code": raw_slot["code"],
                                     "id": raw_slot["id"],
                                     "ctrl": raw_slot["ctrl"],
                                     "alt": raw_slot["alt"],
                                     "shift": raw_slot["shift"]})
            output.append(out_menu)
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
            if header != head:
                continue
            # `sizes is None` means any size is valid (used for the variable-size
            # 2026+ DE format).
            if sizes is None or file_size in sizes:
                version = k
        return version

    def __iter__(self):
        for k, v in self.data.items():
            yield k, v

    def __contains__(self, key):
        return key in self.data

    def __getitem__(self, key):
        return self.data[key]

    def __setitem__(self, key, value):
        self.data[key] = value

    # def deserialize(self, json: str):
    def serialize(self):
        unparser = HkUnparser(self._file_type)
        hk_dict = dict(size=self._file_size, header=self._header,
                       menus=self.serialize_to_file(),
                       format=self._format,
                       handler_magic=self._handler_magic)
        raw = unparser.unparse_to_bytes(hk_dict)
        return compress(raw)
