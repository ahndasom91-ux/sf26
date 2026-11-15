/**
 * 2026 Summer Festival 만족도 조사 [방콕] — 설문 구성 (단일 원본)
 *
 * 이 파일 하나를 Apps Script(gas/)와 설문 페이지(web/)가 함께 사용한다.
 *   - Apps Script : 서버 검증 · 응답 시트 열 제목 · 집계 수식
 *   - web/index.html : 화면 렌더링 (<script src="questions.js">)
 * 수정 후에는 반드시 web/questions.js 로 복사하고(내용 동일), SCHEMA_VERSION 을 올린다.
 * (버전이 다르면 서버가 집계 탭을 다시 만들고, 페이지는 "새로고침" 안내를 띄운다)
 *
 * 문항 형식
 *   type 'scale' : 단일 점수. points = 10 또는 5
 *   type 'group' : 항목별 점수(가수별·식당별 등). items[], points. skippable 이면 항목마다 skipLabel(미방문 등) 선택 가능
 *   type 'text'  : 주관식. max = 글자 수 제한. 주관식은 모두 선택(required:false)
 *   no    : 화면 번호 ('1', '1-1' ...)   col : 응답 시트 열 제목   area : 영역 태그
 */

var SURVEY_TITLE = '2026 Summer Festival 만족도 조사 [방콕]';
var SCHEMA_VERSION = '4';

/** 설문 페이지 주소(GitHub Pages). Apps Script 링크로 들어온 사람은 이 주소로 보낸다 */
var PAGE_URL = 'https://ahndasom91-ux.github.io/sf26/';
/** 저장 API (Apps Script 웹앱 배포 URL, @버전 고정 배포) */
var API_URL = 'https://script.google.com/macros/s/AKfycbzD_bLwQFgr_N01W6HVsx_N4gRLFsrsa3zr-HdybjupgTm8w1gTJjj63LSq5iEa4emU/exec';

var INTRO_NOTICE = '본 설문은 익명으로 진행되며, 1인 1회 참여를 원칙으로 합니다. 응답 내용은 향후 행사 운영 개선을 위한 자료로 활용됩니다.';
var THANKS_MESSAGE = '소중한 의견 감사합니다. 응답이 정상적으로 제출되었습니다.';
var AUTHOR_LINE = '설문 작성자 : RP영업지원팀 안다솜과장';

var SCALE_LABELS_5 = { 1: '매우 불만족', 2: '불만족', 3: '보통', 4: '만족', 5: '매우 만족' };

var QUESTIONS = [
  /* ── 총평 (1~10점) — 설문 맨 앞 ── */
  { id: 'q1', no: '1', area: '총평', type: 'scale', points: 10, required: true,
    title: '2026 Summer Festival 행사 전체에 대한 총점을 매겨주세요.', col: 'Q1 행사 전체 총점' },
  { id: 'q1r', no: '1-1', area: '총평', type: 'text', required: false, max: 1000,
    title: '그렇게 생각하신 이유를 자유롭게 작성해주세요.', col: 'Q1-1 행사 총점 이유' },

  { id: 'q2', no: '2', area: '총평', type: 'scale', points: 10, required: true,
    title: '호텔에 대한 총평을 점수로 매겨주세요.', col: 'Q2 호텔 총평' },
  { id: 'q2r', no: '2-1', area: '총평', type: 'text', required: false, max: 1000,
    title: '그렇게 생각하신 이유를 자유롭게 작성해주세요.', col: 'Q2-1 호텔 총평 이유' },

  { id: 'q3', no: '3', area: '총평', type: 'scale', points: 10, required: true,
    title: '만찬/시상식에 대한 전체 총점을 매겨주세요.', col: 'Q3 만찬/시상식 총점' },
  { id: 'q3r', no: '3-1', area: '총평', type: 'text', required: false, max: 1000,
    title: '그렇게 생각하신 이유를 자유롭게 작성해주세요.', col: 'Q3-1 만찬/시상식 총점 이유' },

  { id: 'q4', no: '4', area: '총평', type: 'group', points: 10, required: true,
    title: '특별공연에 대한 점수를 가수별로 매겨주세요.',
    items: [
      { id: 'q4_1', label: '장혜리', col: 'Q4-1 특별공연 장혜리' },
      { id: 'q4_2', label: '김원준', col: 'Q4-2 특별공연 김원준' },
      { id: 'q4_3', label: '하이키', col: 'Q4-3 특별공연 하이키' }
    ] },
  { id: 'q4r', no: '4-1', area: '총평', type: 'text', required: false, max: 1000,
    title: '그렇게 생각하신 이유를 자유롭게 작성해주세요.', col: 'Q4-4 특별공연 점수 이유' },

  { id: 'q5', no: '5', area: '총평', type: 'group', points: 10, required: true, skippable: true, skipLabel: '미방문',
    title: '식당에 대한 평가를 방문한 곳별로 매겨주세요.',
    desc: '방문하지 않은 식당은 "미방문"을 선택해주세요.',
    items: [
      { id: 'q5_1', label: '(현지식) 망고트리',   col: 'Q5-1 식당 (현지식) 망고트리' },
      { id: 'q5_2', label: '(한식) 페닌슐라',     col: 'Q5-2 식당 (한식) 페닌슐라' },
      { id: 'q5_3', label: '(현지식) 꼬란타식당', col: 'Q5-3 식당 (현지식) 꼬란타식당' },
      { id: 'q5_4', label: '(만찬) 호텔뷔페',     col: 'Q5-4 식당 (만찬) 호텔뷔페' }
    ] },
  { id: 'q5r', no: '5-1', area: '총평', type: 'text', required: false, max: 1000,
    title: '그렇게 생각하신 이유를 자유롭게 작성해주세요.', col: 'Q5-5 식당 평가 이유' },

  { id: 'q6', no: '6', area: '총평', type: 'scale', points: 10, required: true,
    title: '방문 관광지에 대한 전체적인 평가를 점수로 매겨주세요.', col: 'Q6 관광지 전체 평가' },
  { id: 'q6r', no: '6-1', area: '총평', type: 'text', required: false, max: 1000,
    title: '그렇게 생각하신 이유를 자유롭게 작성해주세요.', col: 'Q6-1 관광지 전체 평가 이유' },

  { id: 'q7', no: '7', area: '총평', type: 'group', points: 10, required: true, skippable: true, skipLabel: '미참여',
    title: '방문 관광지별로 평가 점수를 매겨주세요.',
    desc: '참여하지 않은 일정은 "미참여"를 선택해주세요.',
    items: [
      { id: 'q7_1', label: '(골프) 로얄방파인',      col: 'Q7-1 관광지 (골프) 로얄방파인' },
      { id: 'q7_2', label: '(골프) 카스카타',        col: 'Q7-2 관광지 (골프) 카스카타' },
      { id: 'q7_3', label: '(선택) 자유일정',        col: 'Q7-3 관광지 (선택) 자유일정' },
      { id: 'q7_4', label: '(선택) 아유타야+크루즈', col: 'Q7-4 관광지 (선택) 아유타야+크루즈' },
      { id: 'q7_5', label: '(선택) 마하나콘+마사지', col: 'Q7-5 관광지 (선택) 마하나콘+마사지' },
      { id: 'q7_6', label: '(선택) 고급스파',        col: 'Q7-6 관광지 (선택) 고급스파' },
      { id: 'q7_7', label: '(선택) 매끌렁+담넌사',   col: 'Q7-7 관광지 (선택) 매끌렁+담넌사' },
      { id: 'q7_8', label: '(선택) 롱테일보트',      col: 'Q7-8 관광지 (선택) 롱테일보트' }
    ] },

  /* ── 기존 문항 (1~5점) ── */
  { id: 'q8', no: '8', area: '숙소', type: 'scale', points: 5, required: true,
    title: '숙소 위치는 여행 일정에 적합했나요?', col: 'Q8 숙소 위치' },
  { id: 'q9', no: '9', area: '숙소', type: 'scale', points: 5, required: true,
    title: '숙소의 서비스는 어떠셨나요?', desc: '객실 시설 / 청결 상태 / 직원 서비스 등', col: 'Q9 숙소 서비스' },

  { id: 'q10', no: '10', area: '식사', type: 'scale', points: 5, required: true,
    title: '식사 장소(식당 환경)는 어떠셨나요?', col: 'Q10 식사 장소' },
  { id: 'q11', no: '11', area: '식사', type: 'group', points: 5, required: true,
    title: '제공된 식사 메뉴별 만족도는 어떠셨나요?',
    desc: '호텔식, 현지식, 한식 등 제공된 메뉴 유형별로 만족도를 평가해주세요.',
    items: [
      { id: 'q11_1', label: '호텔식', col: 'Q11-1 메뉴 호텔식' },
      { id: 'q11_2', label: '현지식', col: 'Q11-2 메뉴 현지식' },
      { id: 'q11_3', label: '한식',   col: 'Q11-3 메뉴 한식' },
      { id: 'q11_4', label: '뷔페식', col: 'Q11-4 메뉴 뷔페식' }
    ] },
  { id: 'q12', no: '12', area: '식사', type: 'scale', points: 5, required: true,
    title: '식사 제공 시간 및 구성은 어떠셨나요?', col: 'Q12 식사 시간·구성' },

  { id: 'q13', no: '13', area: '일정', type: 'scale', points: 5, required: true,
    title: '전체적인 일정에 대한 만족도는 어떠셨나요?',
    desc: '일정 구성 / 진행 속도 / 가이드 및 인솔자의 진행 / 자유 시간과 단체 일정의 비율 등', col: 'Q13 전체 일정' },
  { id: 'q14', no: '14', area: '일정', type: 'scale', points: 5, required: true,
    title: '방문 장소 및 관광지는 어떠셨나요?', col: 'Q14 방문 장소' },
  { id: 'q15', no: '15', area: '일정', type: 'scale', points: 5, required: true,
    title: '현지 이동(버스 등)은 어떠셨나요?', desc: '이동 동선 / 버스 상태 등', col: 'Q15 현지 이동' },

  { id: 'q16', no: '16', area: '시상식', type: 'scale', points: 5, required: true,
    title: '시상식에 전반적으로 얼마나 만족하셨나요?', col: 'Q16 시상식 전반' },
  { id: 'q17', no: '17', area: '시상식', type: 'scale', points: 5, required: true,
    title: '시상식의 구성과 진행은 어떠셨나요?',
    desc: '시상 진행 순서 및 진행 속도 / 무대·영상·음향 등 연출 / 전체 소요시간 및 축하 분위기 등', col: 'Q17 시상식 구성·진행' },
  { id: 'q18', no: '18', area: '시상식', type: 'text', required: false, max: 1000,
    title: '시상식에서 좋았던 점이나 개선이 필요한 점을 자유롭게 작성해주세요.',
    desc: '기억에 남는 순간이나 좋았던 구성, 진행 중 아쉬웠던 점 등을 작성해주세요.', col: 'Q18 시상식 의견' },

  { id: 'q19', no: '19', area: '공연', type: 'group', points: 5, required: true,
    title: '초청가수 공연에 전반적으로 얼마나 만족하셨나요?',
    items: [
      { id: 'q19_1', label: '장혜리', col: 'Q19-1 공연 만족 장혜리' },
      { id: 'q19_2', label: '김원준', col: 'Q19-2 공연 만족 김원준' },
      { id: 'q19_3', label: '하이키', col: 'Q19-3 공연 만족 하이키' }
    ] },
  { id: 'q20', no: '20', area: '공연', type: 'text', required: false, max: 1000,
    title: '초청가수 공연에서 좋았던 점이나 아쉬웠던 점을 자유롭게 작성해주세요.',
    desc: '초청가수 구성, 선곡, 공연 시간, 현장 분위기 등에 대한 의견을 작성해주세요. 특정 가수에 대한 의견은 가수명을 함께 기재해주셔도 좋습니다.',
    col: 'Q20 공연 의견' },

  { id: 'q21', no: '21', area: '평가', type: 'text', required: false, max: 1000,
    title: '이번 여행에 대한 전반적인 의견을 자유롭게 작성해주세요.',
    desc: '특히 만족스러웠던 점이나 개선이 필요하다고 생각되는 부분이 있다면 함께 기재해주시면 향후 운영에 반영하겠습니다.',
    col: 'Q21 전반적 의견' },
  { id: 'q22', no: '22', area: '평가', type: 'text', required: false, max: 200,
    title: '다음 Summer Festival에서 희망하시는 여행지가 있다면 자유롭게 작성해주세요.',
    col: 'Q22 희망 여행지' }
];

/** 응답 시트 열 정의(평탄화): group 의 항목은 각각 별도 열 */
function fieldList() {
  var list = [];
  QUESTIONS.forEach(function (q) {
    if (q.type === 'group') {
      q.items.forEach(function (it, i) {
        list.push({ id: it.id, qid: q.id, col: it.col, type: 'scale', points: q.points, area: q.area, no: q.no + '-' + (i + 1),
                    required: !!q.required, skippable: !!q.skippable, skipLabel: q.skipLabel || '', label: q.title + ' — ' + it.label });
      });
    } else {
      list.push({ id: q.id, qid: q.id, col: q.col, type: q.type, points: q.points, area: q.area, no: q.no,
                  required: !!q.required, max: q.max, skippable: false, skipLabel: '', label: q.title });
    }
  });
  return list;
}
