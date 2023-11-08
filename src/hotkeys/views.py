import json

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic.base import View

from .utils import serialize_all_files

from .hpk.new_hotkey_file import HotkeyFile
from .hpk.parse import FileType
from .hpk.strings import hk_groups


@method_decorator(csrf_exempt, name="dispatch")
class HKPView(View):
    def post(self, request):
        # Check for valid Content-Type header, otherwise return given JSON response

        # response_data = json.dumps(response_data, cls=serializers.json.DjangoJSONEncoder)
        # return JsonResponse(data={'message': message,
        # 'data': response_data},
        # status=200)

        files = {'base': None, 'profile': None}
        for each in request.FILES.getlist("files", None):
            if each.name == "Base.hkp":
                files['base'] = HotkeyFile(each.read(), False, each.name, FileType.HKP)
            else:
                files['profile'] = HotkeyFile(each.read(), False, each.name, FileType.HKI)

        # files['base'].serialize_to_file()

        serialize_all_files(files)

        # serialize_all_files(files)
        # print(f"{files['base']._file_type.value} -- {files['base'].id_to_file_type}")
        # print(f"{files['profile']._file_type.value} -- {files['profile'].id_to_file_type}")

        with open("Base.hkp", "wb") as file:
            file.write(files['base'].serialize())
            file.close()

        # with open("output.txt", 'w') as file:
        #     file.write(f"hk_names: {files['base']._hk_names}\n\n\n")
        #     file.write(f"hk_map: {files['base'].hk_map}\n\n\n")
        #     file.write(f"hk_ids: {files['base']._hk_ids}\n\n\n")
        #     file.write(f"_valid_ids: {files['base']._valid_ids}\n\n\n")
        #     file.write(f"hk_desc: {files['base']._hk_desc}\n\n\n")
        #     file.write(f"hk_groups: {files['base']._hk_groups}\n\n\n")
        #     file.write(f"data: {files['base'].data}\n\n\n")
        #     file.write(f"hk_dict: {files['base'].hk_dict}\n\n\n")

        # print(f"hk_names: {files['base']._hk_names}")
        # print(f"hk_ids: {files['base']._hk_ids}")
        # print(f"_valid_ids: {files['base']._valid_ids}")
        # print(f"hk_desc: {files['base']._hk_desc}")
        # print(f"hk_groups: {files['base']._hk_groups}")

        # print(files['base'].get_file_size() + files['profile'].get_file_size())

        return JsonResponse(data={"test": True}, status=200)

    def get(self, response):
        # todo: find a way to automate getting the highest version number
        # otherwise it has to be updated manually
        base_path = f"hotkeys/static/hotkeys/defaults/95810/Base.hkp"
        dev_path = f"hotkeys/static/hotkeys/defaults/95810/Dev.hkp"

        files = {'base': None, 'profile': None}
        with open(base_path, "rb") as file:
            files["base"] = HotkeyFile(file.read(), False, "Base.hkp", FileType.HKP)

        with open(dev_path, "rb") as file:
            files["profile"] = HotkeyFile(file.read(), False, "Dev.hkp", FileType.HKI)

        return JsonResponse(data={"hotkeys": serialize_all_files(files),
                                  "groups": hk_groups},
                            status=200)


@method_decorator(csrf_exempt, name="dispatch")
class GenerateHKPView(View):
    def post(self, request):
        # todo: figure out best way to determine <profile> naming when downloading
        # if the user uploaded their own files, figure out a way to save that name
        # for later; otherwise, if editing from default, probably ad a text box
        # that lets the user set their own name (with default text value)
        changed = json.loads(request.body.decode("UTF-8"))
        base_path = f"hotkeys/static/hotkeys/defaults/95810/Base.hkp"
        dev_path = f"hotkeys/static/hotkeys/defaults/95810/Dev.hkp"

        files = {'base': None, 'profile': None}
        with open(base_path, "rb") as file:
            files["base"] = HotkeyFile(file.read(), False, "Base.hkp", FileType.HKP)
        with open(dev_path, "rb") as file:
            files["profile"] = HotkeyFile(file.read(), False, "Dev.hkp", FileType.HKI)

        files['base'].update(changed)
        files['profile'].update(changed)

        with open("Base.hkp", "wb") as file:
            file.write(files['base'].serialize())
            file.close()

        with open("Test.hkp", "wb") as file:
            file.write(files['profile'].serialize())
            file.close()

        return JsonResponse(data={"test": True}, status=200)
