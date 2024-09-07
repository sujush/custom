const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const cron = require('node-cron');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = 'your-secret-key'; // 실제 운영 환경에서는 환경 변수로 관리해야 합니다.

let inspectorData = {}; // 검사자 정보 저장소

// 사용자 데이터 파일 경로
const USER_DATA_FILE = './userData.json';

// 사용자 데이터 읽기
function readUserData() {
  try {
    const data = fs.readFileSync(USER_DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// 사용자 데이터 쓰기
function writeUserData(users) {
  fs.writeFileSync(USER_DATA_FILE, JSON.stringify(users, null, 2));
}

// 사용자 데이터 초기화
let users = readUserData();

// 회원가입 API
app.post('/api/signup', (req, res) => {
  const { email, password } = req.body;
  if (users.find(user => user.email === email)) {
    return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
  }
  users.push({ email, password });
  writeUserData(users);
  res.json({ message: '회원가입이 완료되었습니다.' });
});

// 로그인 API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(user => user.email === email && user.password === password);
  if (user) {
    const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: '인증 실패' });
  }
});

// 미들웨어: 토큰 확인
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// 검사자 정보 등록 API
app.post('/api/inspector', authenticateToken, (req, res) => {
  const { warehouse, time, nickname, email, fee, accountNumber, bankName } = req.body;
  
  const now = new Date();
  const currentHour = now.getHours();
  let inspectionDate = new Date(now);

  if (currentHour >= 18) {
    // 오후 6시 이후라면 다음 날로 설정
    inspectionDate.setDate(inspectionDate.getDate() + 1);
  }
  const formattedDate = `${inspectionDate.getMonth() + 1}/${inspectionDate.getDate()}`;
  
  const key = `${formattedDate}-${warehouse}-${time}`;

  if (!inspectorData[key]) {
    inspectorData[key] = [];
  }
  
  inspectorData[key].push({ nickname, email, fee, accountNumber, bankName });
  res.json({ message: `검사자 정보가 ${currentHour >= 18 ? '다음 날' : '오늘'}로 등록되었습니다.` });
});

// 검사자 정보 조회 API
app.get('/api/inspector', (req, res) => {
  const { warehouse, time } = req.query;
  const now = new Date();
  const today = `${now.getMonth() + 1}/${now.getDate()}`;
  const tomorrow = `${now.getMonth() + 1}/${now.getDate() + 1}`;
  
  const todayKey = `${today}-${warehouse}-${time}`;
  const tomorrowKey = `${tomorrow}-${warehouse}-${time}`;
  
  const todayData = inspectorData[todayKey] || [];
  const tomorrowData = inspectorData[tomorrowKey] || [];
  
  res.json([...todayData, ...tomorrowData]);
});

// 가용 창고 목록을 반환하는 엔드포인트
app.get('/api/available-warehouses', (req, res) => {
  const availableWarehouses = Object.keys(inspectorData).map(key => {
    const [date, warehouse, time] = key.split('-');
    return { date, warehouse, time };
  });
  res.json(availableWarehouses);
});

// 내 검사 일정 조회 API
app.get('/api/my-inspections', authenticateToken, (req, res) => {
  const userEmail = req.user.email;
  const myInspections = [];

  for (const [key, inspectors] of Object.entries(inspectorData)) {
    const [date, warehouse, time] = key.split('-');
    const inspector = inspectors.find(insp => insp.email === userEmail);
    if (inspector) {
      myInspections.push({
        date,
        warehouse,
        time,
        ...inspector
      });
    }
  }

  res.json(myInspections);
});

// 오전 6시에 전날 검사 내역 삭제 스케줄러
cron.schedule('0 6 * * *', () => {
  console.log('오전 6시가 되어 전날의 검사 내역을 삭제합니다.');
  const now = new Date();
  now.setDate(now.getDate() - 1); // 전날 날짜
  const yesterday = `${now.getMonth() + 1}/${now.getDate()}`;
  
  for (const key in inspectorData) {
    const [date, , time] = key.split('-');
    if (date === yesterday && time !== '오후') {
      delete inspectorData[key];
      console.log(`삭제된 검사 내역: ${key}`);
    }
  }
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});