require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const cron = require('node-cron');

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://custom-alpha.vercel.app',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// 사용자 모델
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// 검사자 정보 모델
const inspectorSchema = new mongoose.Schema({
  date: String,
  warehouse: String,
  time: String,
  fee: Number,
  accountNumber: String,
  bankName: String,
  nickname: String,
  email: String
});

const Inspector = mongoose.model('Inspector', inspectorSchema);

// JWT 설정
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1h';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = '7d';

// 토큰 생성 함수
const generateTokens = (user) => {
  const accessToken = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ email: user.email }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
};


const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager({
    region: 'us-east-2'  // 예: 'us-west-2'
});

async function loadSecretsToEnv() {
    const secretName = "custom_project_env";  // AWS Secrets Manager에 저장한 비밀의 이름
    
    try {
        const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
        
        if (data.SecretString) {
            const secrets = JSON.parse(data.SecretString); // JSON 형식으로 저장된 비밀을 파싱
            
            // 환경 변수 설정
            process.env.API_KEY = secrets.API_KEY;  // 예시: 비밀로부터 API_KEY 가져오기
            process.env.DATABASE_URL = secrets.DATABASE_URL;
            
            console.log('Secrets loaded successfully.');
        } else {
            console.error('SecretString not found.');
        }
    } catch (err) {
        console.error('Error retrieving secrets:', err);
    }
}

// 애플리케이션 시작 전에 비밀 로드
loadSecretsToEnv();



// 회원가입 API
app.post('/api/signup', async (req, res) => {
  const { email, password, nickname } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, nickname });
    await newUser.save();
    res.json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
  }
});

// 로그인 API
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      const { accessToken, refreshToken } = generateTokens(user);
      res.json({ accessToken, refreshToken });
    } else {
      res.status(401).json({ message: '인증 실패' });
    }
  } catch (error) {
    res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' });
  }
});

// 토큰 갱신 API
app.post('/api/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh Token이 없습니다.' });
  }

  try {
    const user = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

// 미들웨어: 토큰 확인
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// 검사자 정보 등록 API
app.post('/api/inspector', authenticateToken, async (req, res) => {
  const { warehouse, time, fee, accountNumber, bankName } = req.body;
  const email = req.user.email;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    const now = new Date();
    const inspectionDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (now.getHours() >= 18 ? 1 : 0));
    const formattedDate = inspectionDate.toISOString().split('T')[0];

    const newInspector = new Inspector({
      date: formattedDate,
      warehouse,
      time,
      fee,
      accountNumber,
      bankName,
      nickname: user.nickname,
      email
    });

    await newInspector.save();
    res.json({ message: `검사자 정보가 ${now.getHours() >= 18 ? '다음 날' : '오늘'}로 등록되었습니다.` });
  } catch (error) {
    res.status(500).json({ message: '검사자 정보 등록 중 오류가 발생했습니다.' });
  }
});

// 내 검사 일정 조회 API
app.get('/api/my-inspections', authenticateToken, async (req, res) => {
  const userEmail = req.user.email;
  try {
    const myInspections = await Inspector.find({ email: userEmail });
    res.json(myInspections);
  } catch (error) {
    res.status(500).json({ message: '검사 일정 조회 중 오류가 발생했습니다.' });
  }
});

// 검사자 정보 조회 API
app.get('/api/inspector', async (req, res) => {
  const { warehouse, time } = req.query;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const inspectors = await Inspector.find({
      date: { $in: [today.toISOString().split('T')[0], tomorrow.toISOString().split('T')[0]] },
      warehouse,
      time
    });
    res.json(inspectors);
  } catch (error) {
    res.status(500).json({ message: '검사자 정보 조회 중 오류가 발생했습니다.' });
  }
});

// 가용 창고 목록을 반환하는 엔드포인트
app.get('/api/available-warehouses', async (req, res) => {
  try {
    const inspectors = await Inspector.find();
    const availableWarehouses = inspectors.map(inspector => ({
      warehouse: `${inspector.date.split('-')[1]}/${inspector.date.split('-')[2]}-${inspector.warehouse}`,
      time: inspector.time
    }));
    res.json(availableWarehouses);
  } catch (error) {
    res.status(500).json({ message: '가용 창고 목록 조회 중 오류가 발생했습니다.' });
  }
});

// 사용자 정보 조회 API
app.get('/api/user', authenticateToken, async (req, res) => {
  const userEmail = req.user.email;
  try {
    const user = await User.findOne({ email: userEmail }, { password: 0 });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
  } catch (error) {
    res.status(500).json({ message: '사용자 정보 조회 중 오류가 발생했습니다.' });
  }
});

// 오전 6시에 전날 검사 내역 삭제 스케줄러
cron.schedule('0 6 * * *', async () => {
  console.log('오전 6시가 되어 전날의 검사 내역을 삭제합니다.');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  try {
    await Inspector.deleteMany({ date: yesterdayStr, time: { $ne: '오후' } });
    console.log(`삭제된 검사 내역: ${yesterdayStr}`);
  } catch (error) {
    console.error('검사 내역 삭제 중 오류 발생:', error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});