from rest_framework import parsers, response, views


class UploadHKPView(views.APIView):
    parser_classes = [parsers.FileUploadParser]

    def put(self, request, filename, format=None):
        file_obj = request.data['file']
        # ...
        # do some stuff with uploaded file
        # ...
        return response.Response({'test': True, }, status=204)
