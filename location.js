const COORDS = 'coords';
const API_ENDPOINT = 'https://ragkrx9u05.execute-api.ap-northeast-2.amazonaws.com/2020-05-31/Project-location-api'
// var LATITUDE = 37.676646399999996 
// var LONGITUDE = 126.766284
var num = "0";

// 실시간 gps로 좌표 받아오기
function handleGeoSucces(position){
    LATITUDE = position.coords.latitude;
    LONGITUDE = position.coords.longitude;
    console.log(LATITUDE, LONGITUDE);
    
    coordUser = {y: LATITUDE, _lat: LATITUDE, x: LONGITUDE, _lng: LONGITUDE};
    //console.log(coordUser);
    searchCoordinateToAddress(coordUser);
    return LATITUDE
}
// function getLatitude(position)
//     return position.coords.latitude;
// }
// function getLongitude(position){
//     return position.coords.longitude;
// }
function handleGeoError(){
    console.log('Cant access Geo');
}

function askForCoords(){
    navigator.geolocation.getCurrentPosition( handleGeoSucces, handleGeoError);
}

function loadCoords(){
    const loadedCoords = localStorage.getItem(COORDS);
    if(loadedCoords == null){
        askForCoords();
    }else{
        console.log('location Error')
    }
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// 네이버 맵api: 좌표 => 주소(시, 도)
function searchCoordinateToAddress(latlng) {
     naver.maps.Service.reverseGeocode({
        coords: latlng,
        orders: [
            naver.maps.Service.OrderType.ADDR,
            naver.maps.Service.OrderType.ROAD_ADDR
        ].join(',')
    }, function(status, response) {
        if (status === naver.maps.Service.Status.ERROR) {
            console.log('searchCoordinateToAddress ERROR');
        }

        var items = response.v2.results,
            address = '';

        for (var i=0, ii=items.length, item; i<ii; i++) {
            item = items[i];
            address = makeAddress(item) || '';
            addrType = item.name === 'roadaddr' ? '[도로명 주소]' : '[지번 주소]';
        }
        console.log(address);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', API_ENDPOINT);
        xhr.setRequestHeader('Content-type', 'application/json');
        const data = { sido: address};
        xhr.send(JSON.stringify(data));
        num = getParameterByName('num');
        callAjax();
    });
}

function makeAddress(item) {
    if (!item) {
        return;
    }

    var name = item.name,
        region = item.region,
        land = item.land,
        isRoadAddress = name === 'roadaddr';

    var sido = '';

    if (hasArea(region.area1)) {
        sido = region.area1.name;
    }

    return [sido].join(' ');
}

function hasArea(area) {
    return !!(area && area.name && area.name !== '');
}

//초기화함수
function initGeocoder() {
    loadCoords();
}

naver.maps.onJSContentLoaded = initGeocoder;





// location_get.js

var dogAd = '';
var alert = '0';

const form = document.querySelector(".js-form"),
mapForm = document.querySelector(".js-map");
  
const age = document.getElementById("content1");
const careNm = document.getElementById("content2");
const careTel = document.getElementById("content3");
const chargeNm = document.getElementById("content4");
const colorCd = document.getElementById("content5");
const breed = document.getElementById("content6");
const weight = document.getElementById("content7");
const characteristic = document.getElementById("content8");
const sexCd = document.getElementById("content9");
const careAddr = document.getElementById("content10");
const name = document.getElementById("name1");
const image1 = document.getElementById("img1");

const dogImg = document.getElementById("dogImg");
const dogName = document.getElementById("dogName");
const dataBarFull1 = document.getElementById("dataBarFull1");
const dataBarFull2 = document.getElementById("dataBarFull2");
const dataBarFull3 = document.getElementById("dataBarFull3");
const dataBarFull4 = document.getElementById("dataBarFull4");
const dataBarFull5 = document.getElementById("dataBarFull5");

temp = location.href.split("?");
recdog = decodeURI( temp[1] , "UTF-8" );
name.innerText = `유기견 정보`;

function print_pointer(){
    get_pointer(dogAd,'map','유기견 위치');
}

function print_pointer(){
    get_pointer(dogAd,'map','유기견 위치');
}

function get_pointer (adress, getid, title) {
  naver.maps.Service.geocode({
      address: adress
  }, function(status, response) {
      if (status !== naver.maps.Service.Status.OK) {
          //return alert('Something wrong!');
          console.log('주소에러');
        }
        console.log(adress, getid, title);

        var result = response.result, // 검색 결과의 컨테이너
            items = result.items; // 검색 결과의 배열

        // do Something
        var x = eval(items[0].point.x);
        var y = eval(items[0].point.y);

        var HOME_PATH = window.HOME_PATH || '.';

        var dest = new naver.maps.LatLng(y, x),
            map = new naver.maps.Map('map', {
                        center: dest.destinationPoint(0, 500),
                        zoom: 10
                    }),
                    marker = new naver.maps.Marker({
                        map: map,
                        position: dest
                    });

        var contentString = [
            '<div class="iw_inner">',
            '   <h3>'+title+'</h3>',
            '   <p>'+adress+'</p>',
            '</div>'
        ].join('');

        var infowindow = new naver.maps.InfoWindow({
            content: contentString
        });

        naver.maps.Event.addListener(marker, "click", function(e) {
            if (infowindow.getMap()) {
                infowindow.close();
            } else {
                infowindow.open(map, marker);
            }
        });

        infowindow.open(map, marker);
        console.log("성공 map button")
    });
}


function callAjax(){  
  $.ajax({
    dataType: 'json',
    url : 'https://xu4k18jlza.execute-api.ap-northeast-2.amazonaws.com/default/Project-detail_result',
    type: 'GET',
    contentType: 'application/json; charset=utf-8',
    success: function (response) {
      //document.write(response)
      var dogData = '';
      //var tableData = '';

      $.each(response, function(i, item) {
          dogData += '<tr>';
          dogData += '<td>' + item.careAddr + '</td>';
          dogData += '<td>' + item.age + '</td>';
          dogData += '<td>' + item.careNm + '</td>';
          dogData += '<td>' + item.careTel + '</td>';
          dogData += '<td>' + item.chargeNm + '</td>';
          dogData += '<td>' + item.kindCd + '</td>';
          dogData += '</tr>';
          dogAd = item.careAddr;

          image1.src = item.popfile;

          age.innerText = `나이 : ${item.age}`;
          careNm.innerText = `보호소이름 : ${item.careNm}`;
          careTel.innerText = `전화번호 : ${item.careTel}`;
          chargeNm.innerText = `담당자이름 : ${item.chargeNm}`;
          colorCd.innerText = `색깔 : ${item.colorCd}`;
          breed.innerText = `견종 : ${item.kindCd}`;
          weight.innerText = `무게 : ${item.weight}`;
          characteristic.innerText = `특징 : ${item.specialMark}`;
          sexCd.innerText = `성별 : ${item.sexCd}`;
          careAddr.innerText = `주소 : ${item.careAddr}`;

          var adap = item.adap;
          var friendli = item.frinedli;
          var health = item.health;
          var trainabil = item.trainability;
          var physic = item.physical;

          dogImg.src = item.dog_pic;
          dogName.innerText = item.dog_name;

          dataBarFull1.style.width = `${ adap* 20}%`;
          dataBarFull2.style.width = `${ friendli* 20}%`;
          dataBarFull3.style.width = `${ health* 20}%`;
          dataBarFull4.style.width = `${ trainabil* 20}%`;
          dataBarFull5.style.width = `${ physic* 20}%`;
          

          //if (item[0].kindCd == "[개] 믹스견"){
          //    alert("해당 견종의 유기견이 없어서 믹스견을 대신 표시했습니다.");
          //}
      });
     
      
      $('#dog_result').append(dogData);
      print_pointer();
    }

    ,beforeSend: function(){
        $('.wrap-loading').removeClass('display-none');
    }
    
    ,complete: function(){
        $('.wrap-loading').addClass('display-none');
    }
    ,error: function (request, error) {
        alert("code:"+request.status+"\n"+"message"+request.responseText+"\n"+"error:"+error)
    }
  });
}

//getButton.addEventListener("click", callAjax);
//mapButton.addEventListener("click", print_pointer);

//getButton.addEventListener("click", callAjax);
//mapButton.addEventListener("click", print_pointer);

//callAjax();
//getButton.addEventListener("click", callAjax);
//mapButton.addEventListener("click", print_pointer);
