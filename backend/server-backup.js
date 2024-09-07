const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = 'your-secret-key'; // 실제 운영 환경에서는 환경 변수로 관리해야 합니다.

// 사용자 데이터 파일 경로
const USER_DATA_FILE = './userData.json';

// 사용자 데이터 읽기
function readUserData() {
  try {
    const data = fs.readFileSync(USER_DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // 파일이 없거나 읽을 수 없는 경우 빈 배열 반환
    return [];
  }
}

// 사용자 데이터 쓰기
function writeUserData(users) {
  fs.writeFileSync(USER_DATA_FILE, JSON.stringify(users, null, 2));
}

// 사용자 데이터 초기화
let users = readUserData();

// 임시 데이터 저장소
let inspectorData = {};

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

// 검사자 정보 등록 API (인증 필요)
app.post('/api/inspector', authenticateToken, (req, res) => {
  const { warehouse, time, nickname, email, fee, accountNumber, bankName } = req.body;
  const key = `${warehouse}-${time}`;
  if (!inspectorData[key]) {
    inspectorData[key] = [];
  }
  inspectorData[key].push({ nickname, email, fee, accountNumber, bankName });
  res.json({ message: '검사자 정보가 등록되었습니다.' });
});

// 검사자 정보 조회 API
app.get('/api/inspector', (req, res) => {
  const { warehouse, time } = req.query;
  const key = `${warehouse}-${time}`;
  const data = inspectorData[key] || [];
  res.json(data);
});

// 가용 창고 목록을 반환하는 엔드포인트
app.get('/api/available-warehouses', (req, res) => {
  const availableWarehouses = Object.keys(inspectorData).map(key => {
    const [warehouse, time] = key.split('-');
    return { warehouse, time };
  });

  console.log('Available warehouses:', availableWarehouses); // 디버깅을 위한 로그
  res.json(availableWarehouses);
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
