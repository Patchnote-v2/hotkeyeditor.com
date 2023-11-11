from django.core.management.base import BaseCommand

from hotkeys.hpk.new_hotkey_file import HotkeyFile
from hotkeys.hpk.parse import FileType

keys = [81, 87, 69, 82, 84,
        65, 83, 68, 70, 71,
        90, 88, 67, 86, 66]


class Command(BaseCommand):
    help = "Finds all hotkeys pertaining for each key in the grid layout and creates a dict"  # noqa

    def add_arguments(self, parser):
        parser.add_argument("update_id", nargs=1, type=int)

    def handle(self, *args, **options):
        update_id = options["update_id"][0]

        base_path = f"hotkeys/static/hotkeys/defaults/{str(update_id)}/Base.hkp"
        dev_path = f"hotkeys/static/hotkeys/defaults/{str(update_id)}/Dev.hkp"

        # Open hotkey files
        files = {'base': None, 'profile': None}
        with open(base_path, "rb") as file:
            files["base"] = HotkeyFile(file.read(), False, "Base.hkp", FileType.HKP)
        with open(dev_path, "rb") as file:
            files["profile"] = HotkeyFile(file.read(), False, "Dev.hkp", FileType.HKI)

        output = {}
        for each in keys:
            output[each] = []

            for uuid, hotkey in files['profile']:
                if (hotkey['keycode'] == each):
                    output[each].append(hotkey['string_id'])
            for uuid, hotkey in files['base']:
                if (hotkey['keycode'] == each):
                    output[each].append(hotkey['string_id'])

        self.stdout.write(self.style.SUCCESS(output))
