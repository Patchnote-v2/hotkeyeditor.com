def serialize_all_files(files: dict) -> dict:
    data = {}
    for key, file in files.items():
        data.update(file.data)

    return data
