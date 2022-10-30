import json
import xmltodict
import json
from datetime import datetime
import requests
import boto3

# 유기견 API 정보 가져오기

#query문. 
def get_request_query(url, operation, params, serviceKey):
    import urllib.parse as urlparse
    params = urlparse.urlencode(params)
    request_query = url + '/' + operation + '?' + params + '&' + 'serviceKey' + '=' + serviceKey
    return request_query

def lambda_handler(event, context):
    
    bucket = 'starsbucket' #S3버킷이름
    s3 = boto3.client("s3")
    
    sido = event["sido"]
    sido = str(sido)
    #sido = "경주시"
    
    lambda_path = "/tmp/1.txt"
    with open(lambda_path, 'w+') as file:
        file.write(sido)
        file.close()
    s3.upload_file(lambda_path, bucket, "sub/user_local.txt")
    
    
