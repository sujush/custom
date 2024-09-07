const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const cron = require('node-cron');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = 'your-secret-key'; // 실제 운영 환경에서는 환경 변수로 관리해야 합니다.
const SALT_ROUNDS = 10;  // 솔트 라운드 설정

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
app.post('/api/signup', async (req, res) => {
  const { email, password, nickname } = req.body;
  if (users.find(user => user.email === email)) {
    return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    users.push({ email, password: hashedPassword, nickname });
    writeUserData(users);
    res.json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
  }
});

// 로그인 API
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(user => user.email === email);
  if (user) {
    try {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
      } else {
        res.status(401).json({ message: '인증 실패' });
      }
    } catch (error) {
      res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' });
    }
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
  const { warehouse, time, fee, accountNumber, bankName } = req.body;
  const email = req.user.email;
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  }
  
  const now = new Date();
  const currentHour = now.getHours();
  let inspectionDate = new Date(now);

  // 오후 6시 이후라면 다음 날로 설정
  if (currentHour >= 18) {
    inspectionDate.setDate(inspectionDate.getDate() + 1);
  }

  const year = inspectionDate.getFullYear();
  const month = String(inspectionDate.getMonth() + 1).padStart(2, '0');
  const day = String(inspectionDate.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  const key = `${formattedDate}-${warehouse}-${time}`;

  console.log('Registering inspector data with key:', key);

  if (!inspectorData[key]) {
    inspectorData[key] = [];
  }
  
  inspectorData[key].push({
    date: `${year}년 ${month}월 ${day}일`,
    warehouse,
    time,
    fee,
    accountNumber,
    bankName,
    nickname: user.nickname,
    email
  });

  console.log('Updated inspectorData:', inspectorData);

  res.json({ message: `검사자 정보가 ${currentHour >= 18 ? '다음 날' : '오늘'}로 등록되었습니다.` });
});

// 내 검사 일정 조회 API
app.get('/api/my-inspections', authenticateToken, (req, res) => {
  const userEmail = req.user.email;
  const myInspections = [];

  for (const [key, inspectors] of Object.entries(inspectorData)) {
    console.log('key:', key);  // key 값 출력
    const [year, month, day, ...rest] = key.split('-');
    const warehouse = rest.slice(0, -1).join('-');
    const time = rest[rest.length - 1];
    console.log('year:', year, 'month:', month, 'day:', day, 'warehouse:', warehouse, 'time:', time);  // 분리된 값 출력
    const inspector = inspectors.find(insp => insp.email === userEmail);
    if (inspector) {
      const formattedDate = `${year}년 ${month}월 ${day}일`;
      myInspections.push({
        date: formattedDate,
        warehouse,
        time,
        fee: inspector.fee,
        accountNumber: inspector.accountNumber,
        bankName: inspector.bankName,
        nickname: inspector.nickname,
        email: inspector.email
      });
    }
  }

  console.log('myInspections:', myInspections);  // 전송되는 데이터 로그
  res.json(myInspections);
});


// 검사자 정보 조회 API
app.get('/api/inspector', (req, res) => {
  const { warehouse, time } = req.query;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  
  console.log('Searching for dates:', todayStr, tomorrowStr);

  const relevantData = Object.entries(inspectorData).filter(([key, value]) => {
    return (key.startsWith(todayStr) || key.startsWith(tomorrowStr)) && 
           key.includes(warehouse) && 
           key.endsWith(time);
  });

  console.log('Relevant data:', relevantData);

  const result = relevantData.flatMap(([key, inspectors]) => inspectors);

  res.json(result);
});

// 가용 창고 목록을 반환하는 엔드포인트
app.get('/api/available-warehouses', (req, res) => {
  console.log('inspectorData:', inspectorData);
  const availableWarehouses = Object.keys(inspectorData).map(key => {
    console.log('Processing key:', key);
    const [year, month, day, ...rest] = key.split('-');
    const warehouse = rest.slice(0, -1).join('-');
    const time = rest[rest.length - 1];
    
    console.log(`Parsed data: year=${year}, month=${month}, day=${day}, warehouse=${warehouse}, time=${time}`);

    return { 
      warehouse: `${month}/${day}-${warehouse}`,
      time 
    };
  });
  console.log('Available warehouses:', availableWarehouses);
  res.json(availableWarehouses);
});
// 사용자 정보 조회 API 추가 (닉네임과 이메일 조회용)
app.get('/api/user', authenticateToken, (req, res) => {
  const userEmail = req.user.email;
  const user = users.find(u => u.email === userEmail);
  if (user) {
    res.json({ email: user.email, nickname: user.nickname });
  } else {
    res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
  }
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