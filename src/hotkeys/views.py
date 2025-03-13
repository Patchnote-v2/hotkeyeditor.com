import json
import io
import struct
import zipfile

from pathlib import Path

from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.templatetags.static import static
from django.utils.encoding import smart_str
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic.base import View

from .utils import serialize_all_files, load_default_files, format_groups

from .hkp.new_hotkey_file import HotkeyFile
from .hkp.parse import FileType
from .hkp.strings import hk_groups


@method_decorator(csrf_exempt, name="dispatch")
class HKPView(View):
    def post(self, request):
        # Determine which user file is larger and use that to determine which file is
        # Base.hkp.

        if len(request.FILES.getlist("files", None)) != 2:
            return JsonResponse(data={"message": "Please select only the two correct files (<b>&lt;profile_name>.hkp</b> and <b>&lt;profile_name>/Base.hkp</b>)."},  # noqa
                                status=400)

        user_files = {'base': None, 'profile': None}
        for each in request.FILES.getlist("files", None):
            if not user_files['base']:
                user_files['base'] = each
            elif user_files['base'].size < each.size:
                user_files['profile'] = user_files['base']
                user_files['base'] = each
            else:
                user_files['profile'] = each

        # Save the name of the profile file for later
        profile_name = Path(user_files['profile'].name).stem

        # Parse the user files
        # Try for exceptions individually so we can let the user know which one is invalid
        try:
            user_files['base'] = HotkeyFile(user_files['base'].read(),
                                            False,
                                            user_files['base'].name,
                                            FileType.HKP)
        except struct.error:
            return JsonResponse(data={"message": "The provided file for Base.hkp is an invalid size.  Make sure that you're uploading two unique files from a supported build of the game."},  # noqa
                                status=400)

        try:
            user_files['profile'] = HotkeyFile(user_files['profile'].read(),
                                               False,
                                               user_files['profile'].name,
                                               FileType.HKI)
        except struct.error:
            return JsonResponse(data={"message": f"The provided file for {profile_name}.hkp is an invalid size.  Make sure that you're uploading two unique files from a supported build of the game."},  # noqa
                                status=400)

        # Load default hotkey files so they can be updated with the user-uploaded files
        # This is more robust since if the user uploads either files a version ahead or
        # a version behind, no error will be thrown, at worst some hotkeys might be missing
        default_files = load_default_files()

        changed = serialize_all_files(user_files)
        userChanged = default_files['base'].update(changed) | default_files['profile'].update(changed)

        return JsonResponse(data={"data": {"hotkeys": serialize_all_files(default_files),
                                           "groups": format_groups(hk_groups)},
                                  "changed": userChanged,
                                  "name": profile_name},
                            status=200)

    def get(self, response):
        # todo: find a way to automate getting the highest version number
        # otherwise it has to be updated manually
        default_files = load_default_files()

        return JsonResponse(data={"hotkeys": serialize_all_files(default_files),
                                  "groups": format_groups(hk_groups)},
                            status=200)


@method_decorator(csrf_exempt, name="dispatch")
class GenerateHKPView(View):
    def post(self, request):
        data = json.loads(request.body.decode("UTF-8"))
        changed = data["changed"]
        profile_name = f'{data["profileName"]} (2)' if data["profileName"] else "Edited Hotkeys"

        default_files = load_default_files()

        default_files['base'].update(changed)
        default_files['profile'].update(changed)

        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w') as zipper:
            zipper.writestr(f"{profile_name}/Base.hkp", default_files['base'].serialize())
            zipper.writestr(f"{profile_name}.hkp", default_files['profile'].serialize())

        response = HttpResponse(buffer.getvalue(),
                                content_type="application/x-zip-compressed")
        # https://stackoverflow.com/a/37931084/2368714
        response['Access-Control-Expose-Headers'] = "Content-Disposition"
        response['Content-Disposition'] = f"attachment; filename={smart_str('Hotkeys.zip')}"

        return response
