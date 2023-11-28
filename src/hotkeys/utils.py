from django.conf import settings

from .hpk.new_hotkey_file import HotkeyFile
from .hpk.parse import FileType


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
