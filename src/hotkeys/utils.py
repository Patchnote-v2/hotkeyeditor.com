import hashlib

from django.conf import settings

from .hkp.new_hotkey_file import HotkeyFile
from .hkp.parse import FileType


def serialize_all_files(files: dict) -> dict:
    data = {}
    for key, file in files.items():
        data.update(file.data)

    return data


def load_default_files():
    base_path = f"hotkeys/static/hotkeys/defaults/{settings.CURRENT_VERSION}/Base.hkp"
    dev_path = f"hotkeys/static/hotkeys/defaults/{settings.CURRENT_VERSION}/Profile.hkp"

    files = {'base': None, 'profile': None}
    with open(base_path, "rb") as file:
        files["base"] = HotkeyFile(file.read(), False, "Base.hkp", FileType.HKP)

    with open(dev_path, "rb") as file:
        files["profile"] = HotkeyFile(file.read(), False, "Profile.hkp", FileType.HKI)

    return files


def format_groups(groups):
    output = {}
    for [group, string_ids] in groups.items():
        if group not in output:
            output[group] = []

        for string_id in string_ids:
            md5 = hashlib.md5()
            md5.update(str(string_id).encode('utf-8'))
            dataKey = md5.hexdigest()
            while dataKey in output[group]:
                md5.update(dataKey.encode('utf-8'))
                dataKey = md5.hexdigest()

            output[group].append(dataKey)

    return output
