from google.cloud import storage
from zipfile import ZipFile
from zipfile import is_zipfile
import io
import json

def zipextract(request):

    request = request.get_data()
    try: 
        request_json = json.loads(request.decode())
    except ValueError as e:
        print(f"Error decoding JSON: {e}")
        return "JSON Error", 400
    frombucketname = request_json.get("fbuck")
    srcpath = request_json.get("src")
    tobucketname = request_json.get("tbuck")
    destpath = request_json.get("dest")
    storage_client = storage.Client()
    srcbucket = storage_client.get_bucket(frombucketname)
    destbucket = storage_client.get_bucket(tobucketname)
    src_blob_pathname = srcpath
    dest_blob_pathname = destpath

    blob = srcbucket.blob(src_blob_pathname)
    zipbytes = io.BytesIO(blob.download_as_string())

    if is_zipfile(zipbytes):
        with ZipFile(zipbytes, 'r') as myzip:
            for contentfilename in myzip.namelist():
                contentfile = myzip.read(contentfilename)
                blob = destbucket.blob(dest_blob_pathname + "/" + contentfilename)
                blob.upload_from_string(contentfile)

