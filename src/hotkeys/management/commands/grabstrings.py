import re

from django.core.management.base import BaseCommand

from hotkeys.hpk.new_hotkey_file import HotkeyFile
from hotkeys.hpk.parse import FileType


class Command(BaseCommand):
    help = "Uses Base.hkp, Dev.hkp, and key-value-strings-utf8.txt in a given update ID's static folder to generate a complete list of all the needed English strings for use in strings.py"  # noqa

    def add_arguments(self, parser):
        parser.add_argument("update_id", nargs=1, type=int)

    def handle(self, *args, **options):
        update_id = options["update_id"][0]

        base_path = f"hotkeys/static/hotkeys/defaults/{str(update_id)}/Base.hkp"
        dev_path = f"hotkeys/static/hotkeys/defaults/{str(update_id)}/Dev.hkp"
        strings_path = f"hotkeys/static/hotkeys/defaults/{str(update_id)}/key-value-strings-utf8.txt"  # noqa

        # Get all English strings from file
        with open(strings_path, "r", encoding="utf-8") as file:
            lines = file.readlines()
            file.close()

        # Taken from crimsoncantab/aok-hotkeys/master/modules/aoestrings.py
        # Format strings into dict of {id: "string_text", ...}
        pattern = re.compile(
            r'([^\s/]+)\s+\"(.*)\".*'
        )
        strings = {}
        for row in lines:
            match = pattern.match(row)
            if match:
                key = match.group(1)
                value = match.group(2)
                try:
                    key = int(key)
                except ValueError:
                    pass
                strings[key] = value

        # Open hotkey files
        files = {'base': None, 'profile': None}
        with open(base_path, "rb") as file:
            files["base"] = HotkeyFile(file.read(), False, "Base.hkp", FileType.HKP)

        with open(dev_path, "rb") as file:
            files["profile"] = HotkeyFile(file.read(), False, "Dev.hkp", FileType.HKI)

        invalid_strings = {'base': {}, 'profile': {}}
        for key, file in files.items():
            for id, hotkey in file.data.items():
                if hotkey.string_text == "":
                    invalid_strings[key][id] = strings[id]

        self.stdout.write(self.style.SUCCESS(invalid_strings))
