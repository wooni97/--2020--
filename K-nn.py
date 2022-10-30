import json
import boto3
import os
import csv

from boto3.dynamodb.conditions import Key, Attr
import urllib.request
from bs4 import BeautifulSoup
import re

bucket = 'starsbucket' #S3버킷이름
key = 'dogtime_stars.csv'
dogsNum = 357
questionsNum = 26


def lambda_handler(event, context):
    postId = event["Records"][0]["Sns"]["Message"]
   
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['DB_TABLE_NAME'])
    postItem = table.query(
        KeyConditionExpression = Key('id').eq(postId)
        )
        
    question = []
    for i in range(1, questionsNum+1):
        Q = "Q" + str(i)
        question.append(int(postItem["Items"][0][Q]))
        
    #S3
    s3_resource = boto3.resource('s3')
    s3_object = s3_resource.Object(bucket, key)
    data = s3_object.get()['Body'].read().decode('utf-8').splitlines()
    
    #S3 data       
    lines = csv.reader(data)
    headers = next(lines)
    dogs_list = []
    for line in lines:
        dogs_list.append(line)
        
    distance_list = K_NN(dogs_list, question)
    cnts = sorted(distance_list)
    dognamelist = []
    data_list = []
    pic_list = []
    
 

    for i in range(3):
        dognamelist.append(dogs_list[distance_list.index(cnts[i])][0])
        distance_list[distance_list.index(cnts[i])] = 10000
        
        datas = ""
        datas = Crawling_p(dognamelist[i])
        result = get_translate_text(datas)
        data_list.append(result)
        
        datass = Crawling_pic(dognamelist[i])
        pic_list.append(datass)
        
      
    
    

    #translate dogname
    b=""
    dognamelist_eng = []
    for i in range(3):
        dognamelist_eng.append(dognamelist[i])
        dognamelist[i] = get_translate_text(dognamelist[i])  #상위 3개의 견종 번역  
       #b = b + dognamelist[i] + "\n" + data_list[i] + "\n"

    

    dynamodb2 = boto3.resource('dynamodb')
    table2 = dynamodb2.Table(os.environ['DB_TABLE_NAME2'])
    
    
    
    table2.put_item(
        Item = {
            "id" : postId,
            "first_dogname" : dognamelist[0],
            "first_data" : data_list[0],
            "first_engname" : dognamelist_eng[0],
            "first_pic": pic_list[0],
            #"first_stars" : stars_list[0],
            
            "second_dogname" : dognamelist[1],
            "second_data" : data_list[1],
            "second_engname" : dognamelist_eng[1],
            "second_pic": pic_list[1],
            #"second_stars" : stars_list[1],
            
            
            "third_dogname" : dognamelist[2],
            "third_data" : data_list[2],
            "third_engname" : dognamelist_eng[2],
            "third_pic": pic_list[2],
            #"third_stars" : stars_list[2]
            
        })
    
    
    
# - - - - - - - - - - -  #    
# K-NN 함수 구현 부분
def K_NN(dogs_list, question):
    
    distance_list = [0 for _ in range(dogsNum)]
    
    count = 0
    for j in range(dogsNum):
        for i in range(questionsNum):
            k = (question[i] - int(dogs_list[j][i+1]))**2
            distance_list[count] += k
        count = count+1
        
    
    return distance_list
    
def Crawling_p(dogname):
    
    if dogname == 'Xoloitzcuintli':
        dogname = 'Xoloitzuintli'
    elif dogname == 'Korean-Jindo-Dog':
        dogname = 'Jindo'
    
    url = "https://dogtime.com/dog-breeds/" + dogname
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req).read()
    text = response.decode('utf-8')
    soup = BeautifulSoup(response, "html.parser")
    
    

    p_tags = soup.find_all("p")
    data_list = []
    for i in p_tags:
        data_list.append(i.text.strip())
    print (data_list[0])
        
    return data_list[0]


def Crawling_pic(dogname):
    
    if dogname == 'Xoloitzcuintli':
        dogname = 'Xoloitzuintli'
    elif dogname == 'Korean-Jindo-Dog':
        dogname = 'Jindo'
    
    url = "https://dogtime.com/dog-breeds/" + dogname
    req = urllib.request.Request(url, headers = {'User-Agent': 'Mozilla/5.0(Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.3'})
    response = urllib.request.urlopen(req).read()
    text = response.decode('utf-8')
    soup = BeautifulSoup(response, "html.parser")

    soup = soup.find("div", class_="breeds-single-intro")
    #img의 경로를 받아온다
    img = soup.find("img")
    img_src = img.get("src")

    return img_src

#AWS Translate
def get_translate_text(text):
    
    REGION = 'us-east-2'
    SRC_LANG = 'en'
    TRG_LANG = 'ko'
    
    translate = boto3.client(service_name='translate')
    
    #사용자 지정 용어 적용 단위
    p1 = re.compile('[A-C]+')       
    p2 = re.compile('[D-O]+')
    p3 = re.compile('[P-Y]+')
    
    if p1.match(text[0]) is not None:
        range = "A-to-C"
    elif p2.match(text[0]) is not None:
        range = "D-to-O"
    elif p3.match(text[0]) is not None:
        range = "P-to-Y"
        
   
    response = translate.translate_text(
        Text=text,
        SourceLanguageCode=SRC_LANG,
        TargetLanguageCode=TRG_LANG,
        TerminologyNames=[range],
    )
    result = response.get('TranslatedText')
    
    return result

    
