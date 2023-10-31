from collections import namedtuple

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic.base import View

from .hpk.new_hotkey_file import HotkeyFile
from .hpk.parse import FileType


def serialize_all_files(files: dict) -> dict:
    data = {}
    for key, value in files.items():
        data['key'] = {}

        for each in value:
            pass
            # print(type(each))
    return data


@method_decorator(csrf_exempt, name="dispatch")
class UploadHKPView(View):
    def post(self, request):
        from random import shuffle
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

        files['base'].serialize_to_file()

        # print(files['base'].data)
        # shuffle(files['base'].data)
        # print(files['base'].data)

        # for menu in files['base'].data:
        #     for key in menu:
        #         if key['id'] == 0x4B14:
        #             key['shift'] = True

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
