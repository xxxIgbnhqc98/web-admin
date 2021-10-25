import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import { ApiService } from '../../../services/api/api.service';
import { Md5 } from 'ts-md5/dist/md5';
import { Title } from '@angular/platform-browser';
import { ConfigService } from '../../../services/config/config.service';
import { ShareDataService } from '../../../services/share-data/share-data-service';
import { async } from '@angular/core/testing';
import { html } from './../../../_html_de';
import { BehaviorSubject } from 'rxjs';
import axios from 'axios';
import { environment } from '../../../../environments/environment';
import { GooglePlaceDirective } from "ngx-google-places-autocomplete/ngx-google-places-autocomplete.directive";
declare var require: any;
// const NodeGeocoder = require('node-geocoder');

declare var $: any;
declare let swal: any;

@Component({
  selector: 'app-add-shop',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddShopComponent implements OnInit {
  @ViewChild('multiSelect') multiSelect;
  @ViewChild("placesRef") placesRef: GooglePlaceDirective;

  public editorOptions: Object = {
    useClasses: false,

    toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'color', 'inlineClass', 'inlineStyle', 'paragraphStyle', 'lineHeight', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '-', 'insertLink', 'insertImage', 'insertVideo', 'embedly', 'insertFile', 'insertTable', '|', 'emoticons', 'fontAwesome', 'specialCharacters', 'insertHR', 'selectAll', 'clearFormatting', '|', 'print', 'getPDF', 'spellChecker', 'help', 'html', '|', 'undo', 'redo'],
    events: {
      'froalaEditor.image.beforeUpload': function (e, editor, images) {
        if (images.length) {
          const data = new FormData();
          data.append('image', images[0]);
          axios.post(`${environment.host}/api/v1/image/upload/600`, data, {
            headers: {
            }
          }).then(async (res: any) => {
            if (res.data.results.object.url) {
              await editor.image.insert(res.data.results.object.url, null, null, editor.image.get());
            } else {
              this.alertErrorUploadImageFroala();
              editor.image.insert('https://admin.kormassage.kr/assets/img/logo.png', null, null, editor.image.get());
            }
          }).catch(err => {
            this.alertErrorUploadImageFroala();
            editor.image.insert('https://admin.kormassage.kr/assets/img/logo.png', null, null, editor.image.get());

          });
        }
        return false;
      }

    },
    placeholderText: ' ',
    // key: 'EA1C1C2G2H1A17vB3D2D1B1E5A4D4I1A16B11iC-13xjtH-8hoC-22yzF4jp==' //key for kormassage.kr
    key: environment.froalakey //key for busandal31.net
  };
  id: any;
  isEdit: boolean = false;
  submitting: boolean = false;
  title: string;
  images: any = [];
  thumbnails: any = [];
  params_category_id: string;
  params_thema_id: string;
  thumbnails_base64: any = []
  category_id: string;
  themas: any = [];
  thema_id: string = null;
  tag_ids: any = [];
  tags: any = [];
  tags_select: any[] = []
  categories: any
  opening_hours: string;
  contact_phone: string;
  address: string;
  address_2: string;
  created_by_admin: boolean = true;
  city_id: string;
  district_id: string;
  ward_id: string;
  cities: any = [];
  districts: any = [];
  wards: any = [];
  description: string = html;
  loadingUploadAvatar: boolean = false;
  loadingUploadImage: boolean = false;
  short_description: string;
  min_price: string;
  kakaolink_url: string;
  theme_color: string = "#f44336";
  geolocation_api_type: string = "NAVER";
  hours = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
  ]
  hours1 = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
  ]
  districtSelect: any = []
  provinces: any = [
    {
      "name": "서울",
      "districtList": [
        "강남구",
        "강동구",
        "강북구",
        "강서구",
        "관악구",
        "광진구",
        "구로구",
        "금천구",
        "노원구",
        "도봉구",
        "동대문구",
        "동작구",
        "마포구",
        "서대문구",
        "서초구",
        "성동구",
        "성북구",
        "송파구",
        "양천구",
        "영등포구",
        "용산구",
        "은평구",
        "종로구",
        "중구",
        "중랑구"
      ]
    },
    {
      "name": "부산",
      "districtList": [
        "중구",
        "서구",
        "동구",
        "영도구",
        "부산진구",
        "동래구",
        "남구",
        "북구",
        "강서구",
        "해운대구",
        "사하구",
        "금정구",
        "연제구",
        "수영구",
        "사상구",
        "기장군"
      ]
    },
    {
      "name": "대구",
      "districtList": [
        "중구",
        "동구",
        "서구",
        "남구",
        "북구",
        "수성구",
        "달서구",
        "달성군"
      ]
    },
    {
      "name": "인천",
      "districtList": [
        "중구\t동구",
        "미추홀구",
        "연수구",
        "남동구",
        "부평구",
        "계양구",
        "서구",
        "강화군",
        "옹진군"
      ]
    },
    {
      "name": "광주",
      "districtList": [
        "동구",
        "서구",
        "남구",
        "북구",
        "광산구"
      ]
    },
    {
      "name": "대전",
      "districtList": [
        "동구",
        "중구",
        "서구",
        "유성구",
        "대덕구"
      ]
    },
    {
      "name": "울산",
      "districtList": [
        "중구",
        "남구",
        "동구",
        "북구",
        "울주군"
      ]
    },
    {
      "name": "세종",
      "districtList": [
        "고운동",
        "아름동",
        "도담동",
        "종촌동",
        "새롬동",
        "한솔동",
        "보람동"
      ]
    },
    {
      "name": "경기",
      "districtList": [
        "수원시",
        "성남시",
        "안양시",
        "안산시",
        "용인시",
        "부천시",
        "광명시",
        "평택시",
        "과천시",
        "오산시",
        "시흥시",
        "군포시",
        "의왕시",
        "하남시",
        "이천시",
        "안성시",
        "김포시",
        "화성시",
        "광주시",
        "여주시",
        "양평군",
        "고양시",
        "의정부시",
        "동두천시",
        "구리시",
        "남양주시",
        "파주시",
        "양주시",
        "포천시",
        "연천군",
        "가평군"
      ]
    },
    {
      "name": "강원",
      "districtList": [
        "춘천시",
        "원주시",
        "강릉시",
        "동해시",
        "태백시",
        "속초시",
        "삼척시",
        "홍천군",
        "횡성군",
        "영월군",
        "평창군",
        "정선군",
        "철원군",
        "화천군",
        "양구군",
        "인제군",
        "고성군",
        "양양군"
      ]
    },
    {
      "name": "충북",
      "districtList": [
        "청주시",
        "충주시",
        "제천시",
        "보은군",
        "옥천군",
        "영동군",
        "증평군",
        "진천군",
        "괴산군",
        "음성군",
        "단양군"
      ]
    },
    {
      "name": "충남",
      "districtList": [
        "천안시",
        "공주시",
        "보령시",
        "아산시",
        "서산시",
        "논산시",
        "계룡시",
        "당진시",
        "금산군",
        "부여군",
        "서천군",
        "청양군",
        "홍성군",
        "예산군",
        "태안군"
      ]
    },
    {
      "name": "전북",
      "districtList": [
        "전주시",
        "군산시",
        "익산시",
        "정읍시",
        "남원시",
        "김제시",
        "완주군",
        "진안군",
        "무주군",
        "장수군",
        "임실군",
        "순창군",
        "고창군",
        "부안군"
      ]
    },
    {
      "name": "전남",
      "districtList": [
        "목포시",
        "여수시",
        "순천시",
        "나주시",
        "광양시",
        "담양군",
        "곡성군",
        "구례군",
        "고흥군",
        "보성군",
        "화순군",
        "장흥군",
        "강진군",
        "해남군",
        "영암군",
        "무안군",
        "함평군",
        "영광군",
        "장성군",
        "완도군",
        "진도군",
        "신안군"
      ]
    },
    {
      "name": "경북",
      "districtList": [
        "포항시",
        "경주시",
        "김천시",
        "안동시",
        "구미시",
        "영주시",
        "영천시",
        "상주시",
        "문경시",
        "경산시",
        "군위군",
        "의성군",
        "청송군",
        "영양군",
        "영덕군",
        "고령군",
        "성주군",
        "칠곡군",
        "예천군",
        "봉화군",
        "울진군",
        "울릉군"
      ]
    },
    {
      "name": "경남",
      "districtList": [
        "창원시",
        "진주시",
        "통영시",
        "사천시",
        "김해시",
        "밀양시",
        "거제시",
        "양산시",
        "의령군",
        "함안군",
        "창녕군",
        "고성군",
        "남해군",
        "하동군",
        "산청군",
        "함양군",
        "거창군",
        "합천군"
      ]
    },
    {
      "name": "제주",
      "districtList": [
        "제주시",
        "서귀포시"
      ]
    }
  ]
  station: any = [
    {
      "name": "수도권",
      "stationLineList": [
        {
          "name": "1호선",
          "color": "#003499",
          "stationSubwayList": [
            "소요산",
            "동두천",
            "보산",
            "동두천중앙",
            "지행",
            "덕정",
            "덕계",
            "양주",
            "녹양",
            "가능",
            "의정부",
            "회룡",
            "망월사",
            "도봉산",
            "도봉",
            "방학",
            "창동",
            "녹천",
            "월계",
            "광운대",
            "석계",
            "신이문",
            "외대앞",
            "회기",
            "청량리",
            "제기동",
            "신설동",
            "동묘앞",
            "동대문",
            "종로5가",
            "종로3가",
            "종각",
            "시청",
            "서울역",
            "남영",
            "용산 노량진",
            "대방",
            "신길",
            "영등포",
            "신도림",
            "구로",
            "구일",
            "개봉",
            "오류동",
            "온수",
            "역곡",
            "소사",
            "부천",
            "중동",
            "송내",
            "부개",
            "부평",
            "백운",
            "동암",
            "간석",
            "주안",
            "도화",
            "제물포",
            "도원",
            "동인천",
            "인천",
            "가산디지털단지",
            "독산",
            "금천구청",
            "광명",
            "석수",
            "관악",
            "안양",
            "명학",
            "금정",
            "군포 당정",
            "의왕",
            "성균관대",
            "화서",
            "수원",
            "세류",
            "병점",
            "서동탄",
            "세마",
            "오산대",
            "오산",
            "진위",
            "송탄",
            "서정리",
            "평택지제",
            "평택",
            "성환",
            "직산",
            "두정",
            "천안",
            "봉명",
            "쌍용(나사렛대)",
            "아산",
            "배방",
            "온양온천",
            "신창"
          ]
        },
        {
          "name": "2호선",
          "color": "#37B42D",
          "stationSubwayList": [
            "시청",
            "충정로",
            "아현",
            "이대",
            "신촌",
            "홍대입구",
            "합정",
            "당산",
            "영등포구청",
            "문래",
            "신도림",
            "대림",
            "구로디지털단지",
            "신대방",
            "신림",
            "봉천",
            "서울대입구",
            "낙성대",
            "사당",
            "방배",
            "서초",
            "교대",
            "강남",
            "역삼",
            "선릉",
            "삼성",
            "종합운동장",
            "잠실새내",
            "잠실",
            "잠실나루",
            "강변",
            "구의",
            "건대입구",
            "성수",
            "뚝섬",
            "한양대 왕십리",
            "상왕십리",
            "신당",
            "동대문역사문화공원",
            "을지로4가",
            "을지로3가",
            "을지로입구",
            "도림천",
            "양천구청",
            "신정네거리",
            "까치산",
            "용답",
            "신답",
            "용두",
            "신설동"
          ]
        },
        {
          "name": "3호선",
          "color": "#FA5F2C",
          "stationSubwayList": [
            "대화",
            "주엽",
            "정발산",
            "마두",
            "백석",
            "대곡",
            "화정",
            "원당",
            "원흥",
            "삼송",
            "지축",
            "구파발",
            "연신내",
            "불광",
            "녹번",
            "홍제",
            "무악재",
            "독립문",
            "경복궁",
            "안국",
            "종로3가",
            "을지로3가",
            "충무로",
            "약수",
            "금호",
            "옥수",
            "압구정",
            "신사",
            "잠원",
            "고속터미널",
            "교대",
            "남부터미널",
            "양재",
            "매봉",
            "도곡",
            "대치 학여울",
            "대청",
            "일원",
            "수서",
            "가락시장",
            "경찰병원"
          ]
        },
        {
          "name": "4호선",
          "color": "#3171D3",
          "stationSubwayList": [
            "당고개",
            "상계",
            "노원",
            "창동",
            "쌍문",
            "수유",
            "미아",
            "미아사거리",
            "길음",
            "성신여대입구",
            "한성대입구",
            "혜화",
            "동대문",
            "동대문역사문화공원",
            "충무로",
            "명동",
            "회현",
            "서울역",
            "숙대입구",
            "삼각지",
            "신용산",
            "이촌",
            "동작",
            "총신대입구(이수)",
            "사당",
            "남태령",
            "선바위",
            "경마공원",
            "대공원",
            "과천",
            "정부과천청사",
            "인덕원",
            "평촌",
            "범계",
            "금정",
            "산본 수리산",
            "대야미",
            "반월",
            "상록수",
            "한대앞",
            "중앙",
            "고잔",
            "초지",
            "안산",
            "신길온천",
            "정왕",
            "오이도"
          ]
        },
        {
          "name": "5호선",
          "color": "#8E43B8",
          "stationSubwayList": [
            "방화",
            "개화산",
            "김포공항",
            "송정",
            "마곡",
            "발산",
            "우장산",
            "화곡",
            "신정",
            "목동",
            "오목교",
            "양평",
            "영등포구청",
            "영등포시장",
            "신길",
            "여의도",
            "여의나루",
            "마포",
            "공덕",
            "애오개",
            "충정로",
            "서대문",
            "광화문",
            "종로3가",
            "을지로4가",
            "동대문역사문화공원",
            "청구",
            "신금호",
            "행당",
            "왕십리",
            "마장",
            "답십리",
            "장한평",
            "군자",
            "아차산",
            "광나루 천호",
            "강동",
            "둔촌동",
            "올림픽공원",
            "방이",
            "오금",
            "개롱",
            "거여",
            "마천",
            "길동",
            "굽은다리",
            "명일",
            "고덕",
            "상일동",
            "강일",
            "미사",
            "하남풍산",
            "하남시청",
            "하남검단산"
          ]
        },
        {
          "name": "6호선",
          "color": "#9B4F10",
          "stationSubwayList": [
            "응암",
            "역촌",
            "불광",
            "독바위",
            "연신내",
            "구산",
            "새절",
            "증산",
            "디지털미디어시티",
            "월드컵경기장",
            "마포구청",
            "망원",
            "합정",
            "상수",
            "광흥창",
            "대흥",
            "공덕",
            "효창공원앞",
            "삼각지",
            "녹사평",
            "이태원",
            "한강진",
            "버티고개",
            "약수",
            "청구",
            "신당",
            "동묘앞",
            "창신",
            "보문",
            "안암",
            "고려대",
            "월곡",
            "상월곡",
            "돌곶이",
            "석계",
            "태릉입구 화랑대",
            "봉화산",
            "신내"
          ]
        },
        {
          "name": "7호선",
          "color": "#606D00",
          "stationSubwayList": [
            "장암",
            "도봉산",
            "수락산",
            "마들",
            "노원",
            "중계",
            "하계",
            "공릉",
            "태릉입구",
            "먹골",
            "중화",
            "상봉",
            "면목",
            "사가정",
            "용마산",
            "중곡",
            "군자",
            "어린이대공원",
            "건대입구",
            "뚝섬유원지",
            "청담",
            "강남구청",
            "학동",
            "논현",
            "반포",
            "고속터미널",
            "내방",
            "총신대입구(이수)",
            "남성",
            "숭실대입구",
            "상도",
            "장승배기",
            "신대방삼거리",
            "보라매",
            "신풍",
            "대림 남구로",
            "가산디지털단지",
            "철산",
            "광명사거리",
            "천왕",
            "온수",
            "까치울",
            "부천종합운동장",
            "춘의",
            "신중동",
            "부천시청",
            "상동",
            "삼산체육관",
            "굴포천",
            "부평구청",
            "산곡",
            "석남"
          ]
        },
        {
          "name": "8호선",
          "color": "#E71E6E",
          "stationSubwayList": [
            "암사",
            "천호",
            "강동구청",
            "몽촌토성",
            "잠실",
            "석촌",
            "송파",
            "가락시장",
            "문정",
            "장지",
            "복정",
            "산성",
            "남한산성입구",
            "단대오거리",
            "신흥",
            "수진",
            "모란"
          ]
        },
        {
          "name": "9호선",
          "color": "#BF9F1E",
          "stationSubwayList": [
            "개화",
            "김포공항",
            "공항시장",
            "신방화",
            "마곡나루",
            "양천향교",
            "가양",
            "증미",
            "등촌",
            "염창",
            "신목동",
            "선유도",
            "당산",
            "국회의사당",
            "여의도",
            "샛강",
            "노량진",
            "노들",
            "흑석",
            "동작",
            "구반포",
            "신반포",
            "고속터미널",
            "사평",
            "신논현",
            "언주",
            "선정릉",
            "삼성중앙",
            "봉은사",
            "종합운동장",
            "삼전",
            "석촌고분",
            "석촌",
            "송파나루",
            "한성백제",
            "올림픽공원 둔촌오륜",
            "중앙보훈병원"
          ]
        },
        {
          "name": "인천1호선",
          "color": "#2673F2",
          "stationSubwayList": [
            "계양",
            "귤현",
            "박촌",
            "임학",
            "게산",
            "경인교대입구",
            "작전",
            "갈산",
            "부평구청",
            "부평시장",
            "부평",
            "동수",
            "부평삼거리",
            "간석오거리",
            "인천시청",
            "예술회관",
            "인천터미널",
            "문학경기장",
            "선학",
            "신연수",
            "원인재",
            "동춘",
            "동막",
            "캠퍼스타운",
            "테크노파크",
            "지식정보단지",
            "인천대입구",
            "센트럴파크",
            "국제업무지구",
            "송도달빛축제공원"
          ]
        },
        {
          "name": "인천2호선",
          "color": "#FFB951",
          "stationSubwayList": [
            "검단오류",
            "왕길",
            "검단사거리",
            "마전",
            "완정",
            "독정",
            "검암",
            "검바위",
            "아시아드경기장",
            "서구청",
            "가정",
            "가정중앙시장",
            "석남",
            "서부여성회관",
            "인천가좌",
            "가재울",
            "주안국가산단",
            "주안",
            "시민공원",
            "석바위시장",
            "인천시청",
            "석천사거리",
            "모래내시장",
            "만수",
            "남동구청",
            "인천대공원",
            "운연"
          ]
        },
        {
          "name": "신분당",
          "color": "#A9022D",
          "stationSubwayList": [
            "강남",
            "양재",
            "양재시민의숲",
            "청계산입구",
            "판교",
            "정자",
            "미금",
            "동천",
            "수지구청",
            "성복",
            "상현",
            "광교중앙",
            "광교"
          ]
        },
        {
          "name": "경의중앙선",
          "color": "#7EC4A5",
          "stationSubwayList": [
            "임진강",
            "문산",
            "파주",
            "월롱",
            "금촌",
            "금릉",
            "운정",
            "야당",
            "탄현",
            "일산",
            "풍산",
            "백마",
            "곡산",
            "대곡",
            "능곡",
            "행신",
            "강매",
            "화전",
            "수색",
            "디지털미디어시티",
            "가좌",
            "신촌",
            "서울역",
            "홍대입구",
            "서강대",
            "공덕",
            "효창공원앞",
            "용산",
            "이촌",
            "서빙고",
            "한남",
            "옥수",
            "응봉",
            "왕십리",
            "청량리",
            "상봉 망우",
            "양원",
            "구리",
            "도농",
            "양정",
            "덕소",
            "도심",
            "팔당",
            "운길산",
            "양수",
            "신원",
            "국수",
            "아신",
            "오빈",
            "양평",
            "원덕",
            "용문",
            "지평"
          ]
        },
        {
          "name": "경춘선",
          "color": "#2BAB82",
          "stationSubwayList": [
            "춘천",
            "남춘천",
            "김유정",
            "강촌",
            "백양리",
            "굴봉산",
            "가평",
            "상천",
            "청평",
            "대성리",
            "마석",
            "천마산",
            "평내호평",
            "금곡",
            "사릉",
            "퇴계원",
            "별내",
            "갈매",
            "신내",
            "망우",
            "상봉",
            "광운대",
            "중랑",
            "회기",
            "청량리"
          ]
        },
        {
          "name": "수인분당",
          "color": "#EDB41C",
          "stationSubwayList": [
            "청량리",
            "왕십리",
            "서울숲",
            "압구정로데오",
            "강남구청",
            "선정릉",
            "선릉",
            "한티",
            "도곡",
            "구룡",
            "개포동",
            "대모산입구",
            "수서",
            "복정",
            "가천대",
            "태평",
            "야탑",
            "이매",
            "서현",
            "수내",
            "정자",
            "미금",
            "오리",
            "죽전",
            "보정",
            "구성",
            "신갈",
            "기흥",
            "상갈",
            "청명",
            "영통",
            "망포",
            "매탄권선",
            "수원시청",
            "매교",
            "수원 고색",
            "오목천",
            "어천",
            "야목",
            "사리",
            "한대앞",
            "중앙",
            "고잔",
            "초지",
            "안산",
            "신길온천",
            "정왕",
            "오이도",
            "달월",
            "월곶",
            "소래포구",
            "인천논현",
            "호구포",
            "남동인더스파크",
            "원인재",
            "연수",
            "송도",
            "인하대",
            "숭의",
            "신포",
            "인천"
          ]
        },
        {
          "name": "공항",
          "color": "#70B7E5",
          "stationSubwayList": [
            "인천공항2터미널",
            "인천공항1터미널",
            "공항화물청사",
            "운서",
            "영종",
            "청라국제도시",
            "검암",
            "계양",
            "김포공항",
            "마곡나루",
            "디지털미디어시티",
            "홍대입구",
            "공덕",
            "서울역"
          ]
        },
        {
          "name": "의정부",
          "color": "#FF8E00",
          "stationSubwayList": [
            "발곡",
            "회룡",
            "범골",
            "경전철의정부",
            "의정부시청",
            "흥선",
            "의정부중앙",
            "동오",
            "새말",
            "경기도청북부청사",
            "효자",
            "곤제",
            "어룡",
            "송산",
            "탑석"
          ]
        },
        {
          "name": "에버라인",
          "color": "#80CF7A",
          "stationSubwayList": [
            "전대.에버랜드",
            "둔전",
            "보평",
            "고진",
            "운동장.송담대",
            "김량장",
            "명지대",
            "시청.용인대",
            "삼가",
            "초당",
            "동백",
            "어정",
            "지석",
            "강남대",
            "기흥"
          ]
        },
        {
          "name": "자기부상",
          "color": "#FF9D5A",
          "stationSubwayList": [
            "인천공항1터미널",
            "장기주차장",
            "합동청사",
            "파라다이스시티",
            "워터파크",
            "용유"
          ]
        },
        {
          "name": "경강선",
          "color": "#2774F2",
          "stationSubwayList": [
            "판교",
            "이매",
            "삼동",
            "경기광주",
            "초월",
            "곤지암",
            "신둔도에촌",
            "이천",
            "부발",
            "세종대왕릉",
            "여주"
          ]
        },
        {
          "name": "우이신설",
          "color": "#C6C100",
          "stationSubwayList": [
            "북한산우이",
            "솔밭공원",
            "4.19민주묘지",
            "가오리",
            "화계",
            "삼양",
            "삼양사거리",
            "솔샘",
            "북한산보국문",
            "정릉",
            "성신여대입구",
            "보문",
            "신설동"
          ]
        },
        {
          "name": "서해선",
          "color": "#8EC643",
          "stationSubwayList": [
            "원시",
            "시우",
            "초지",
            "선부",
            "달미",
            "시흥능곡",
            "시흥시청",
            "신현",
            "신천",
            "시흥대야",
            "소새울",
            "소사"
          ]
        },
        {
          "name": "김포골드",
          "color": "#97720C",
          "stationSubwayList": [
            "양촌",
            "구래",
            "마산",
            "장기",
            "운양",
            "걸포북변",
            "사우(김포시청)",
            "풍무",
            "고촌",
            "김포공항"
          ]
        }
      ]
    },
    {
      "name": "부산",
      "stationLineList": [
        {
          "name": "1호선",
          "color": "#f86c3e",
          "stationSubwayList": [
            "다대포해수욕장",
            "다대포항",
            "낫개",
            "신장림",
            "장림",
            "동매",
            "신평",
            "하단",
            "당리",
            "사하",
            "괴정",
            "대티",
            "서대신",
            "동대신",
            "토성",
            "자갈치",
            "남포",
            "중앙",
            "부산역",
            "초량",
            "부산진",
            "좌천",
            "범일",
            "범내골",
            "서면",
            "부전",
            "양정",
            "시청",
            "연산",
            "교대",
            "동래",
            "명륜",
            "온천장",
            "부산대",
            "장전",
            "남산 범어사",
            "노포"
          ]
        },
        {
          "name": "2호선",
          "color": "#37b42d",
          "stationSubwayList": [
            "장산",
            "중동",
            "해운대",
            "동백",
            "벡스코",
            "센텀시티",
            "민락",
            "수영",
            "광안",
            "금련산",
            "남천",
            "경성대부경대",
            "대연",
            "못골",
            "지게골",
            "문현",
            "국제금융센터.부산은행",
            "전포",
            "서면",
            "부암",
            "가야",
            "동의대",
            "개금",
            "냉정",
            "주례",
            "감전",
            "사상",
            "덕포",
            "모덕",
            "모라",
            "구남",
            "구명",
            "덕천",
            "수정",
            "화명율리",
            "동원 금곡",
            "호포",
            "증산",
            "부산대양산캠퍼스",
            "남양산",
            "양산",
            "수영"
          ]
        },
        {
          "name": "3호선",
          "color": "#d7ac65",
          "stationSubwayList": [
            "망미",
            "배산",
            "물만골",
            "연산",
            "거제",
            "종합운동장",
            "사직",
            "미남",
            "만덕",
            "남산정",
            "숙등",
            "구포",
            "강서구청",
            "체육공원",
            "대저"
          ]
        },
        {
          "name": "4호선",
          "color": "#286fdb",
          "stationSubwayList": [
            "미남",
            "동래",
            "수안",
            "낙민",
            "충렬사",
            "명장",
            "서동",
            "금사",
            "반여농산물시장",
            "석대",
            "영산대",
            "윗반송",
            "고촌",
            "안평"
          ]
        },
        {
          "name": "부산김해선",
          "color": "#b251ce",
          "stationSubwayList": [
            "사상",
            "괘법르네시떼",
            "서부산유통지구",
            "공항",
            "덕두",
            "등구",
            "대저",
            "평강",
            "대사",
            "불암",
            "지내",
            "김해대학",
            "인제대",
            "김해시청",
            "부원",
            "봉황",
            "수로왕릉",
            "박물관",
            "연지공원",
            "장신대",
            "가야대"
          ]
        },
        {
          "name": "동해선",
          "color": "#80a8d8",
          "stationSubwayList": [
            "부전(동해선)",
            "거제해맞이",
            "거제",
            "교대",
            "동래(동해선)",
            "안락",
            "부산원동",
            "재송",
            "센텀",
            "벡스코",
            "신해운대",
            "송정",
            "오시리아",
            "기장",
            "일광"
          ]
        }
      ]
    },
    {
      "name": "대구",
      "stationLineList": [
        {
          "name": "1호선",
          "color": "#f86c3e",
          "stationSubwayList": [
            "설화명곡",
            "화원",
            "대곡",
            "진천",
            "월배",
            "상인",
            "월촌",
            "송현",
            "서부정류장",
            "대명",
            "안지랑",
            "현충로",
            "영대병원",
            "교대",
            "명덕",
            "반월당",
            "중앙로",
            "대구역",
            "칠성시장",
            "신천",
            "동대구역",
            "동구청",
            "아양교",
            "동촌",
            "해안",
            "방촌",
            "용계",
            "율하",
            "신기",
            "반야월",
            "각산",
            "안심"
          ]
        },
        {
          "name": "2호선",
          "color": "#37b42d",
          "stationSubwayList": [
            "설화명곡",
            "화원",
            "대곡",
            "진천",
            "월배",
            "상인",
            "월촌",
            "송현",
            "서부정류장",
            "대명",
            "안지랑",
            "현충로",
            "영대병원",
            "교대",
            "명덕",
            "반월당",
            "중앙로",
            "대구역",
            "칠성시장",
            "신천",
            "동대구역",
            "동구청",
            "아양교",
            "동촌",
            "해안",
            "방촌",
            "용계",
            "율하",
            "신기",
            "반야월",
            "각산",
            "안심"
          ]
        },
        {
          "name": "3호선",
          "color": "#fec057",
          "stationSubwayList": [
            "칠곡경대병원",
            "학정",
            "팔거",
            "동천",
            "칠곡운암",
            "구암",
            "태전",
            "매천",
            "매천시장",
            "팔달",
            "공당",
            "만평",
            "팔달시장",
            "원대",
            "북구청",
            "달성공원",
            "청라언덕",
            "남산",
            "명덕",
            "건들바위",
            "대봉교",
            "수성시장",
            "수성구민운동장",
            "어린이회관",
            "황금",
            "수성못",
            "지산",
            "범물",
            "용지"
          ]
        }
      ]
    },
    {
      "name": "대전",
      "stationLineList": [
        {
          "name": "1호선",
          "color": "#37b42d",
          "stationSubwayList": [
            "반석",
            "지족",
            "노은",
            "월드컵경기장",
            "현충원",
            "구암",
            "유성온천",
            "갑천",
            "월평",
            "갈마",
            "정부청사",
            "시청",
            "탄방",
            "용문",
            "오룡",
            "서대전네거리",
            "중구청",
            "중앙로",
            "대전역",
            "대동",
            "신흥",
            "판암"
          ]
        }
      ]
    },
    {
      "name": "광주",
      "stationLineList": [
        {
          "name": "1호선",
          "color": "#37b42d",
          "stationSubwayList": [
            "평동",
            "도산",
            "광주송정",
            "송정공원",
            "공항",
            "김대중컨벤션센터",
            "상무",
            "운천",
            "쌍촌",
            "화정",
            "농성",
            "돌고개",
            "양동시장",
            "금남로5가",
            "금남로4가",
            "문화전당",
            "남광주",
            "학동.중심사입구",
            "소태",
            "농동"
          ]
        }
      ]
    }
  ]
  stationLineList: any = []
  stationSubwayList: any = []
  shop_province: string;
  shop_district: string;
  subway_location: string;
  subway_line: string;
  subway_station: string;

  start_time: string = null;
  end_time: string = null;
  badge_text: string = null;
  badge_color: string = "#f44336";
  state: string;
  nickname: string;
  settings = {};
  old_shop: any
  latitude: number;
  longitude: number;

  payment_methods: any
  public form_tag: FormGroup;

  @ViewChild('fileAvatar') fileAvatarElementRef: ElementRef;
  @ViewChild('fileImage') fileImageElementRef: ElementRef;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private ref: ChangeDetectorRef,
    private apiService: ApiService,
    private titleService: Title,
    public configService: ConfigService,
    public shareDataService: ShareDataService) {
  }
  async ngOnInit() {
    // ////////////////
    document.getElementById("myDropdown").classList.add("hide");
    document.getElementById("myDropdownShop").classList.add("hide");
    await this.getListUser();
    await this.getListShop();
    // ///////////////////
    this.route.params.subscribe(async (params) => {

      this.id = params.id;
      if (params.thema_id) {
        this.thema_id = params.thema_id;
        this.params_thema_id = params.thema_id;
      }
      if (params.category_id) {
        this.params_category_id = params.category_id;
      }
      if (this.id == null) {
        this.isEdit = false;
        this.setDefaultData();
      } else {
        this.isEdit = true;
      }

      if (this.isEdit) {
        await this.setData();
      }
      console.log("log ", this.thema_id)
      const query: any = {
        fields: ["$all"],
        limit: 9999999
      }
      this.themas = await this.apiService.thema.getList({
        query
      });
      this.updateCateList();


      // this.tags_select = [
      //   {item_text: "Parking lot", item_id: "1558a660-bf58-11ea-a3ea-5d37b467b530"},
      //   {item_text: "Wifi", item_id: "184abd40-bf58-11ea-a3ea-5d37b467b530"},
      //   {item_text: "Credit card accepted", item_id: "096d0b70-bf58-11ea-a3ea-5d37b467b530"}
      // ];
      console.log("@@@@@tags_select ", this.tags_select)

      this.settings = {
        singleSelection: false,
        idField: 'item_id',
        textField: 'item_text',
        enableCheckAll: false,
        selectAllText: 'Select all',
        unSelectAllText: 'Unselect all',
        allowSearchFilter: true,
        limitSelection: -1,
        clearSearchFilter: true,
        maxHeight: 197,
        itemsShowLimit: 4,
        searchPlaceholderText: 'Search',
        noDataAvailablePlaceholderText: 'No info',
        closeDropDownOnSelection: false,
        showSelectedItemsAtTop: false,
        defaultOpen: false
      };
      this.setForm();


    });

  }
  lastShopSubmitSingerId: string;
  shop_id: string;
  courses: any;
  listShop: any = [];
  listShopFiltered: any = [];
  option_search: string = 'title';
  itemFields: any = ["$all"];
  searchRef: any;
  // ////////////////////////
  isShowingCategoryDropDown: boolean = false
  user_id: string;
  lastSubmitSingerId: string;
  loading_api: boolean = false;
  // listUser: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  listUser: any = [];
  listUserFiltered: any = [];
  listDuplicateImages: any = [];
  query: any = {
    fields: ["$all"],
    filter: {
      account_type: "BIZ_USER"
    }
  };
  shop_query: any = {
    fields: this.itemFields,
    filter: {}
  };
  public handleAddressChange(address: any) {
    this.address = address.formatted_address
    console.log("addressaddress ", JSON.stringify(address.geometry.location))
    const locale = JSON.stringify(address.geometry.location)

    this.longitude = JSON.parse(locale).lng
    this.latitude = JSON.parse(locale).lat
    console.log("addressaddress long", this.longitude)
    console.log("addressaddress lat", this.latitude)
    // Do some stuff
  }
  //Shop Search Section
  async getListShop() {
    try {
      this.loading_api = true;
      this.listShop = await this.apiService.shop.getList({
        query: {
          fields: ['$all'],
          filter: {},
          page: 1, limit: 10, order: [["created_at_unix_timestamp", "desc"]]
        }
      })
      this.ref.detectChanges();
      this.loading_api = false;
    } catch (error) {
      this.loading_api = false;
    }
  }
  async confirmChooseShop() {
    return await swal({
      text: (this.configService.lang === 'en') ? 'Are you sure to choose this shop?' : ((this.configService.lang === 'vn') ? 'Are you sure to choose this shop?' : 'Are you sure to choose this shop?'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'Xác nhận' : '확인'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'Kết thúc' : '취소')
    });
  }
  updateDistrict() {
    const filter = this.provinces.filter((data: any) => data.name === this.shop_province)[0]
    console.log("@#$@$ ", this.shop_province)
    this.districtSelect = filter.districtList
  }
  updateSubwayLine() {
    this.subway_line = null,
      this.subway_station = null
    const filter = this.station.filter((data: any) => data.name === this.subway_location)[0]
    this.stationLineList = filter.stationLineList
  }
  updateSubwayStation() {
    const filter = this.stationLineList.filter((data: any) => data.name === this.subway_line)[0]
    console.log("$@#@$# ", filter)
    this.stationSubwayList = filter.stationSubwayList
  }

  async onShopClick(shop) {
    await this.confirmChooseShop()
    this.shop_id = shop.id;
    this.id = shop.id;
    await this.setData()
    this.state = null
    // this.tags_select = [
    //   {item_text: "Parking lot", item_id: "1558a660-bf58-11ea-a3ea-5d37b467b530"},
    //   {item_text: "Wifi", item_id: "184abd40-bf58-11ea-a3ea-5d37b467b530"},
    //   {item_text: "Credit card accepted", item_id: "096d0b70-bf58-11ea-a3ea-5d37b467b530"}
    // ];
    console.log("hazz ", this.tags)
    console.log("@@@@@tags_select ", this.tags_select)
    this.setForm();
    document.getElementById("myDropdownShop").classList.remove("show");
  }
  showDropdownShop() {
    if (this.isShowingCategoryDropDown) {
      return;
    }

    document.getElementById("myDropdownShop").classList.add("show");
    document.getElementById("shop_id").blur();
    document.getElementById("myShopInput").focus();

    // Auto scroll to the previous chosen singer_id
    if (this.lastShopSubmitSingerId && this.lastShopSubmitSingerId !== '') {
      setTimeout(() => {
        const singerItem: any = document.getElementById('singer_' + this.lastShopSubmitSingerId);
        const singerWrapper: any = document.getElementById('singerShopListWrapper');
        singerWrapper.scrollTop = singerItem.offsetTop - 100;
      }, 500);
    }

    setTimeout(() => {
      this.filterShopFunction(null); //Show all singers
    }, 100);
  }

  closeDropdownShop() {
    document.getElementById("myDropdownShop").classList.remove("show");
    document.getElementById("myDropdownShop").classList.add("hide");
  }
  getShopNameFromId(id) {
    let name = '';
    if (this.listShop) {
      this.listShop.forEach(shop => {
        if (shop.id === id) {
          name = shop.title;
        }
      });
    }
    return name;
  }
  onShopSearch() {
    const input: any = document.getElementById("myShopInput");
    this.filterShopFunction(input.value);
  }
  rgb2hex(orig) {
    var a, isPercent,
      rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
      alpha = (rgb && rgb[4] || "").trim(),
      hex = rgb ? "#" +
        (rgb[1] | 1 << 8).toString(16).slice(1) +
        (rgb[2] | 1 << 8).toString(16).slice(1) +
        (rgb[3] | 1 << 8).toString(16).slice(1) : orig;
    if (alpha !== "") {
      isPercent = alpha.indexOf("%") > -1;
      a = parseFloat(alpha);
      if (!isPercent && a >= 0 && a <= 1) {
        a = Math.round(255 * a);
      } else if (isPercent && a >= 0 && a <= 100) {
        a = Math.round(255 * a / 100)
      } else {
        a = "";
      }
    }
    if (a) {
      hex += (a | 1 << 8).toString(16).slice(1);
    }
    return hex;
  }
  async filterShopFunction(keyword: string) {
    if (!keyword || keyword.length === 0) {
      this.listShopFiltered = this.listShop;
      return;
    }
    this.shop_query = {
      fields: ["$all"],
      filter: {}
    }
    const newFilteredUserList = [];
    try {
      if (this.option_search === 'nickname') {
        this.shop_query.fields = ['$all', { "user": ["$all", { "$filter": { nickname: { $iLike: `%${keyword}%` } } }] }, { "category": ["$all", { "thema": ["$all"] }] }, { "events": ["$all"] }];
      } else if (this.option_search === 'username') {
        this.shop_query.fields = ['$all', { "user": ["$all", { "$filter": { username: { $iLike: `%${keyword}%` } } }] }, { "category": ["$all", { "thema": ["$all"] }] }, { "events": ["$all"] }];
      } else if (this.option_search === 'title') {
        this.shop_query.filter.title = { $iLike: `%${keyword}%` }
      }
      this.listShop = await this.apiService.shop.getList({ query: this.shop_query })
      console.log(this.listShop)
    } catch (error) {
    }
    if (this.listShop.length) {
      this.listShop.forEach(shop => {
        if (shop.title.toUpperCase().indexOf(keyword.toUpperCase()) > -1 ||
          shop.user.email.toUpperCase().indexOf(keyword.toUpperCase()) > -1 ||
          shop.user.nickname.toUpperCase().indexOf(keyword.toUpperCase()) > -1 ||
          shop.user.username.toUpperCase().indexOf(keyword.toUpperCase()) > -1
        ) {
          newFilteredUserList.push(shop);
        }
      });
    }

    this.listShopFiltered = newFilteredUserList;

  }

  //User Search Section
  getUserNickNameFromId(id) {

    return this.nickname ? this.nickname : "";

  }
  async filterFunction(keyword: string) {
    if (!keyword || keyword.length === 0) {
      this.listUserFiltered = this.listUser;
      return;
    }
    const newFilteredUserList = [];
    try {
      if (keyword.length === 36) {
        this.query.filter.id = keyword
      } else {
        this.query.filter.nickname = { $iLike: `%${keyword}%` }
        this.query.filter = {
          '$or': [
            {
              nickname: { $iLike: `%${keyword}%` }
            },
            { username: { $iLike: `%${keyword}%` } },
          ]
        }
      }
      this.listUser = await this.apiService.user.getList({ query: this.query })
    } catch (error) {
    }
    console.log('listUser', this.listUser)
    if (this.listUser.length) {
      this.listUser.forEach(user => {
        if (user.username.toUpperCase().indexOf(keyword.toUpperCase()) > -1 || user.id === keyword || user.nickname.toUpperCase().indexOf(keyword.toUpperCase()) > -1) {
          newFilteredUserList.push(user);
        }
      });
    }

    this.listUserFiltered = newFilteredUserList;
    console.log('listUserFiltered', this.listUserFiltered)

  }

  closeDropdownUser() {
    document.getElementById("myDropdown").classList.remove("show");
    document.getElementById("myDropdown").classList.add("hide");
  }
  onUserSearch() {
    const input: any = document.getElementById("myInput");
    this.filterFunction(input.value);
  }
  async onUserClick(user) {
    if (this.user_id && this.user_id !== user.id) {
      try {
        await this.confirChangeUser();
      } catch (error) {
        return;
      }
    }
    this.user_id = user.id;
    this.nickname = user.nickname
    // if (this.type_category !== 'GERNE') {
    //     this.listSelectedCategoryIds = [];
    //     this.type_category = 'GERNE';
    //     this.getListCate(this.type_category);
    //     this.release_date = null;
    // }
    document.getElementById("myDropdown").classList.remove("show");
  }
  // async onChangeName() {
  //   this.listDuplicateImages = [];
  //   const qr: any = {
  //       limit: 5,
  //       fields: ['avartar'],
  //       filter: { name: this.name }
  //   }
  //   if (this.user_id) {
  //       qr.filter.user_id = this.user_id
  //   }
  //   console.log("@@@## ", this.user_id)
  //   const all_singer_with_the_same_name = await this.apiService.album.getList({
  //       query: qr
  //   });

  //   this.listDuplicateImages = all_singer_with_the_same_name.map((album: any) => {
  //       console.log("@#$% ", album.thumbnail)
  //       return album.thumbnail;
  //   });
  // }
  async getListUser() {
    try {
      this.loading_api = true;
      this.listUser = await this.apiService.user.getList({
        query: {
          fields: ['$all'], filter: {
            account_type: "BIZ_USER"
          }, page: 1, limit: 50, order: [["created_at_unix_timestamp", "desc"]]
        }
      })
      this.ref.detectChanges();
      this.loading_api = false;
    } catch (error) {
      this.loading_api = false;
    }
  }
  showDropdown() {
    if (this.isShowingCategoryDropDown) {
      return;
    }

    document.getElementById("myDropdown").classList.add("show");
    document.getElementById("user_id").blur();
    document.getElementById("myInput").focus();

    // Auto scroll to the previous chosen singer_id
    if (this.lastSubmitSingerId && this.lastSubmitSingerId !== '') {
      setTimeout(() => {
        const singerItem: any = document.getElementById('singer_' + this.lastSubmitSingerId);
        const singerWrapper: any = document.getElementById('singerListWrapper');
        singerWrapper.scrollTop = singerItem.offsetTop - 100;
      }, 500);
    }

    setTimeout(() => {
      this.filterFunction(""); //Show all singers
    }, 100);
  }
  // //////////////////////////////
  onChangeStartTime(event) {
    this.hours1 = [
      '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
    ]
    const index = this.hours.indexOf(event.target.value) + 1
    this.hours1 = this.hours1.splice(index)
  }

  resetForm() {
    this.setForm();
    this.multiSelect.toggleSelectAll();
  }
  setForm() {
    this.form_tag = new FormGroup({
      name: new FormControl(this.tags, Validators.required)
    });
  }
  save() {
    this.tag_ids = []
    this.form_tag.value.name.forEach(element => {
      this.tag_ids.push(element.item_id)
    });
    console.log("tag ", this.tag_ids)
  }
  public onSave(items: any) {
    this.save();
  }
  get f() {
    return this.form_tag.controls;
  }
  alertSuccess() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Successfully!' : ((this.configService.lang === 'vn') ? 'Thành công!' : '성공'),
      type: 'success',
      timer: 2000,
    });
  }

  async confirChangeUser() {
    return await swal({
      text: (this.configService.lang === 'en') ? 'Are you sure to change the owner of shop?' : ((this.configService.lang === 'vn') ? 'Bạn có chắc chắn thay đổi chủ sở hữu của cửa hàng' : '상점주를 변경하시겠습니까?'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'Xác nhận' : '확인'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'Kết thúc' : '취소')
    });
  }
  alertFormNotValid() {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please enter full information' : ((this.configService.lang === 'vn') ? 'Hãy nhập đầy đủ thông tin' : '모든 내역을 빠짐없이 입력하세요'),
      type: 'warning',
      timer: 2000,
    });
  }

  alertErrorFromServer(message) {
    return swal({
      title: (message === "검색한 상점주소가 확인되지 않습니다. 정확한 주소정보를 입력해주세요") ? ((this.configService.lang === 'en') ? 'your shop address not found, please check that your address, city, ward, district are matched!' : ((this.configService.lang === 'vn') ? 'Không tìm thấy địa chỉ cửa hàng của bạn, vui lòng kiểm tra xem địa chỉ, thành phố, phường, quận của bạn có khớp nhau không!' : '검색한 상점주소가 확인되지 않습니다. 정확한 주소정보를 입력해주세요')) : message,
      type: 'warning',
      timer: 2000,
    });
  }
  alertErrorFromServerOwner(message) {
    return swal({
      title: (this.configService.lang === 'en') ? 'Please remove relevant Event before transferring the ownership' : ((this.configService.lang === 'vn') ? 'Vui lòng xóa Sự kiện có liên quan trước khi chuyển quyền sở hữu' : '상점 소유권을 이전하기 위해서는 관련 이벤트를 삭제해야 합니다.'),
      type: 'warning',
      timer: 2000,
    });
  }
  alertErrorUploadImageFroala(message) {
    return swal({
      title: 'Upload failed',
      type: 'warning',
      timer: 2000,
    });
  }
  alertItemNotFound() {
    swal({
      title: 'No information found',
      type: 'warning',
      timer: 2000
    });
  }

  backToList() {
    if (this.params_category_id) {
      this.router.navigate([`/shop/shop-list/${this.params_category_id}`], { relativeTo: this.route });

    } else {
      this.router.navigate(['/shop/shop-list'], { relativeTo: this.route });
    }
  }
  backToThema() {
    this.router.navigate(['/thema/thema-list'], { relativeTo: this.route });

  }
  async updateCateListWhenChooseThema() {
    const query: any = {
      fields: ["$all"],
      limit: 9999999,
      filter: {
        thema_id: this.thema_id
      }
    }
    this.categories = await this.apiService.category.getList({
      query
    });
    const dataTag = await this.apiService.tag.getList({
      query
    });
    this.tags = dataTag.map(item => {
      return {
        item_id: item.id,
        item_text: item.name
      }
    });
    this.tags_select = []
  }
  async updateCateList() {
    const query: any = {
      fields: ["$all"],
      limit: 9999999,
      filter: {
        thema_id: this.thema_id
      }
    }
    this.categories = await this.apiService.category.getList({
      query
    });
    const dataTag = await this.apiService.tag.getList({
      query
    });
    // this.cities = await this.apiService.city.getList({
    //   query
    // });
    // this.listDistrict();
    // this.listWard();
    this.tags = dataTag.map(item => {
      return {
        item_id: item.id,
        item_text: item.name
      }
    });
  }
  setDefaultData() {
    this.titleService.setTitle('Add new shop');
    this.title = null;
    this.images = [];
    this.thumbnails = []
    this.category_id = null
    this.opening_hours = null;
    this.contact_phone = null;
    this.address = null;
    this.address_2 = null;
    this.shop_province = null;
    this.shop_district = null;
    this.subway_location = null;
    this.subway_line = null;
    this.subway_station = null;
    this.tag_ids = [];
    // this.created_by_admin = true;
    this.city_id = null;
    this.district_id = null;
    this.ward_id = null;
    this.start_time = null;
    this.end_time = null;
    this.short_description = null;
    this.min_price = '1000';
    this.kakaolink_url = null;
    this.state = null;
    this.old_shop = null;
    this.longitude = 0;
    this.latitude = 0
    return {
      category_id: this.category_id,
      tag_ids: this.tag_ids,
      name: this.title,
      images: this.images,
      opening_hours: this.opening_hours,
      contact_phone: this.contact_phone,
      address: this.address,
      address_2: this.address_2,
      created_by_admin: this.created_by_admin,
      city_id: this.city_id,
      district_id: this.district_id,
      ward_id: this.ward_id,
      start_time: this.start_time,
      end_time: this.end_time,
      description: this.description,
      thumbnails: this.thumbnails,
      short_description: this.short_description,
      min_price: this.min_price,
      kakaolink_url: this.kakaolink_url,
      old_shop: this.old_shop,
      longitude: this.longitude,
      latitude: this.latitude,
    };
  }

  async setData() {
    try {
      let data = await this.apiService.shop.getItem(this.id, {
        query: { fields: ['$all', { "category": ["$all"] }, { "user": ["nickname"] }, { "courses": ["$all", { "prices": ["$all"] }] }] }
      });
      this.state = data.state
      this.nickname = data.user.nickname
      this.old_shop = data.old_shop
      this.user_id = data.user_id
      this.thema_id = data.category.thema_id
      this.shop_province = data.shop_province;
      if (this.shop_province) {
        await this.updateDistrict()
      }
      this.shop_district = data.shop_district;
      this.subway_location = data.subway_location;
      if (this.subway_location) {
        await this.updateSubwayLine()
      }
      this.subway_line = data.subway_line;
      if (this.subway_line) {
        await this.updateSubwayStation()
      }
      this.subway_station = data.subway_station;

      await this.updateCateList();
      this.category_id = data.category_id;
      this.tag_ids = data.tag_ids;
      this.theme_color = data.theme_color;
      this.geolocation_api_type = data.geolocation_api_type;
      this.badge_text = data.badge_text;
      this.badge_color = data.badge_color;
      this.thumbnails = data.thumbnails;
      this.short_description = data.short_description;
      this.min_price = data.min_price;
      this.kakaolink_url = data.kakaolink_url;
      this.longitude = data.longitude;
      this.latitude = data.latitude;
      this.tags_select = []
      console.log("tag ne ", data.tag_ids)
      if (this.tag_ids) {
        const query: any = {
          fields: ["$all"],
          limit: 9999999,
          filter: {
            id: { $in: this.tag_ids }
          }
        }
        const dataTagSelect = await this.apiService.tag.getList({
          query
        });
        this.tags_select = dataTagSelect.map(item => {
          return {
            item_text: item.name,
            item_id: item.id
          }
        });
        // for (let index = 0; index < data.tag_ids.length; index++) {
        //   const tag_id = data.tag_ids[index];
        //   try {
        //     const tag = await this.apiService.tag.getItem(tag_id, {
        //       query: { fields: ['$all'] }
        //     });
        //     this.tags_select.push({
        //       item_text: tag.name,
        //       item_id: tag_id
        //     })
        //   } catch (err) {
        //     this.tags_select = this.tags_select
        //   }

        // }
      }
      console.log("@#@#", this.tags_select)
      this.courses = data.courses.map(item => {
        const prices = item.prices.map(item => {
          return {
            id: '1',
            course_id: '1',
            name: item.name,
            price: item.price,
            discount: item.discount,
          }
        });
        return {
          id: '1',
          title: item.title,
          running_time: item.running_time,
          description: item.description,
          recommended: item.recommended,
          unit: item.unit,
          prices
        }
      });
      this.shop_province = data.shop_province
      this.shop_district = data.shop_district
      this.subway_location = data.subway_location
      this.subway_line = data.subway_line
      this.subway_station = data.subway_station
      this.payment_methods = data.payment_methods

      this.title = data.title;
      this.images = data.images;
      if (!this.images) {
        this.images = []
      }
      this.opening_hours = data.opening_hours;
      this.contact_phone = data.contact_phone;
      this.address = data.address;
      this.address_2 = data.address_2;

      // this.created_by_admin = true;
      this.city_id = data.city_id;
      this.district_id = data.district_id;
      this.ward_id = data.ward_id;
      this.start_time = data.opening_hours.substring(0, 5);
      this.end_time = data.opening_hours.substring(6, data.opening_hours.lenght);
      this.description = data.description
      this.titleService.setTitle(this.title);
    } catch (err) {
      console.log('err: ', err);
      try { await this.alertItemNotFound(); } catch (err) { }
      this.backToList();
    }

  }

  async updateItem(form: NgForm) {
    try {

      this.opening_hours = this.start_time + '~' + this.end_time
      this.images = this.thumbnails.map(item => {
        return item.replace("300", "1024")
      });
      let { shop_province, shop_district, subway_location, subway_line, subway_station, payment_methods, longitude, latitude, short_description, min_price, kakaolink_url, category_id, thumbnails, badge_text, badge_color, theme_color, geolocation_api_type, description, tag_ids, title, images, opening_hours, contact_phone, address, address_2, city_id, district_id, ward_id } = this;
      if (badge_color) {
        if (badge_color.match('rgba')) {
          badge_color = this.rgb2hex(badge_color)
        }
      }
      console.log("@#@#@#@ ", badge_color)
      await this.apiService.shop.update(this.id, { shop_province, shop_district, subway_location, subway_line, subway_station, payment_methods, longitude, latitude, short_description, min_price, kakaolink_url, category_id, thumbnails, theme_color, geolocation_api_type: geolocation_api_type, description, tag_ids, title, images, badge_text, badge_color, opening_hours, contact_phone, address, address_2, user_id: this.user_id });
      this.alertSuccess();
      this.backToList();
      form.reset();

      this.submitting = false;
    } catch (error) {
      console.log("@#@#@#@ ", error)

      if (error.error.message === "Please remove relevant Event before transferring the ownership") {
        this.alertErrorFromServerOwner(error.error.message);
      } else {
        this.alertErrorFromServer(error.error.message);
      }
      this.submitting = false;
    }
  }
  async confirmDelete() {
    return await swal({
      title: (this.configService.lang === 'en') ? 'DELETE' : ((this.configService.lang === 'vn') ? 'Xóa' : '삭제'),
      text: (this.configService.lang === 'en') ? 'Are you sure you want to delete?' : ((this.configService.lang === 'vn') ? 'Bạn có chắc chắn muốn xóa không?' : '삭제를 진행할까요?'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: (this.configService.lang === 'en') ? 'Confirm' : ((this.configService.lang === 'vn') ? 'Xác nhận' : '확인'),
      cancelButtonText: (this.configService.lang === 'en') ? 'Cancel' : ((this.configService.lang === 'vn') ? 'Kết thúc' : '취소')
    });
  }
  async deleteItem() {
    try {
      try {

        await this.confirmDelete();
      } catch (error) {
        return;
      }
      await this.apiService.shop.deleteShop(this.id);
      this.backToList();
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
    }
  }
  changeSearchHandler() {
    this.shop_query = {
      fields: ["$all"],
      filter: {}
    }
  }
  async addItem(form: NgForm) {
    try {
      this.opening_hours = this.start_time + '~' + this.end_time
      this.images = this.thumbnails.map(item => {
        return item.replace("300", "1024")
      });
      let { shop_province, shop_district, subway_location, subway_line, subway_station, payment_methods, longitude, latitude, short_description, min_price, kakaolink_url, category_id, badge_text, badge_color, theme_color, geolocation_api_type, description, thumbnails, tag_ids, title, images, opening_hours, contact_phone, address, address_2, city_id, district_id, ward_id } = this;
      if (badge_color) {
        if (badge_color.match('rgba')) {
          badge_color = this.rgb2hex(badge_color)
        }
      }
      const shop = await this.apiService.shop.add({ shop_province, shop_district, subway_location, subway_line, subway_station, payment_methods, longitude, latitude, short_description, min_price, kakaolink_url, category_id, theme_color, geolocation_api_type: geolocation_api_type, thumbnails, description, tag_ids, title, images, badge_text, badge_color, opening_hours, contact_phone, address, address_2, verified: true, user_id: this.user_id });
      console.log("shop ne ", shop.shop.id)
      await this.apiService.course.addCourses(shop.shop.id, { courses: this.courses });

      form.reset();
      this.alertSuccess();
      if (this.params_thema_id) {
        this.backToThema();
      } else {
        this.backToList();
      }
      this.submitting = false;
    } catch (error) {
      this.alertErrorFromServer(error.error.message);
      this.submitting = false;
    }
  }

  async submitUpdate(form: NgForm) {
    this.submitting = true;
    if (form.valid) {
      await this.updateItem(form);
    } else {
      this.submitting = false;
      this.alertFormNotValid();
    }
  }

  async submitAdd(form: NgForm) {
    this.submitting = true;
    if (form.valid) {
      await this.addItem(form);
    } else {
      this.alertFormNotValid();
      this.submitting = false;
    }
  }
  getBase64(file, url) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      console.log(reader.result);
      // return reader.result
      this.thumbnails_base64.push({ base64: reader.result, url })
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
  }
  uploadAvatar(fileInput) {
    this.loadingUploadAvatar = true;
    try {
      const files = this.fileAvatarElementRef.nativeElement.files;
      const file = files[0];
      const result = this.apiService.fileUploader.uploadImage2(file, 300, 1024)
        .then(result => {
          setTimeout(() => {
            this.images.push(result.high_quality_images[0].url)
            this.thumbnails.push(result.low_quality_images[0].url)
            // this.getBase64(file, result.low_quality_images[0].url)
            this.loadingUploadAvatar = false;
          }, 2000);


        });
    } catch (err) {
      console.log('Không úp được hình');
    }
  }
  async getPosition() {
    // const res = await geocoder.geocode(this.address);
    console.log("@@$#  ", this.address)
  }
  removeAvatar(image) {
    this.thumbnails = this.thumbnails.filter(function (item) {
      return item !== image
    })
    // this.thumbnails_base64 = this.thumbnails_base64.filter(function (item) {
    //   return item !== image64
    // })
  }
  uploadImage(fileInput) {
    this.loadingUploadImage = true;
    try {
      const files = this.fileImageElementRef.nativeElement.files;
      const file = files[0];
      const result = this.apiService.fileUploader.uploadImage(file, 300)
        .then(result => {
          // this.badge_image = result.url
          this.loadingUploadImage = false;
        });
    } catch (err) {
      console.log('Không úp được hình');
    }
  }

  removeImage() {
    // this.badge_image = null
  }
  async listDistrict() {
    let fields: any = ["$all"];
    const query: any = Object.assign({
      fields: fields,
    });
    query.filter = {};
    if (this.city_id) {
      query.filter.city_id = this.city_id;
      query.limit = 99999999
      this.districts = await this.apiService.district.getList({ query });
    }
    // if (this.channel && this.city !== 'Chọn thành phố') {
    //   query.filter.channel = this.channel;
    //   query.filter.city = this.city;

    // }

  }
  async listWard() {
    let fields: any = ["$all"];
    const query: any = Object.assign({
      fields: fields,
    });
    query.filter = {};
    if (this.district_id) {
      query.filter.district_id = this.district_id;
      query.limit = 99999999
      this.wards = await this.apiService.ward.getList({ query });
    }
    // if (this.channel && this.city !== 'Chọn thành phố') {
    //   query.filter.channel = this.channel;
    //   query.filter.city = this.city;

    // }

  }
}
