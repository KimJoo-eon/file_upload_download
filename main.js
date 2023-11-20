const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const PORT = 3000;

app.use(express.static('uploads'));
//

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const currentDate = new Date().toISOString().slice(0, 10);
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

        const newFileName = `${currentDate}_${originalName}`;

        file.originalname = newFileName;

        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname ,'views', '/index.html'));
// });

app.post('/upload', upload.single('file'), (req, res) => {
    // 업로드된 파일의 새로운 이름을 가져오기
    const uploadedFileName = req.file.originalname;
    res.send({ filename: uploadedFileName });
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    res.download(__dirname + '/uploads/' + filename);
});

app.get('/filelist', async (req, res) => {
    try {
        const files = await fs.readdir(__dirname + '/uploads');
        res.json(files);
    } catch (error) {
        console.error('Error reading file list:', error);
        res.status(500).send('Internal Server Error');
    }
});

//
const session = require('express-session')
const bodyParser = require('body-parser');
const MySQLStore = require('express-mysql-session')(session);
const  authRouter = require('./lib_login/auth');
const  authCheck = require('./lib_login/authCheck.js');
const mysql = require('mysql2/promise');
// var template = require('./lib_login/template.js');

app.use(bodyParser.urlencoded({ extended: false }));

const data = {
  host: 'localhost',
  user: 'root',
  password: '1111',
  database: 'test',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};


const sessionStore = new MySQLStore(data);

var options = {
    secret: 'blue',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { maxAge: 3.6e+6 * 24 },
};

app.use(session(options));

app.get('/', (req, res) => {
  if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
    res.redirect('/auth/login');
    return false;
  } else {                                      // 로그인 되어있으면 메인 페이지로 이동시킴
    res.redirect('/main');
    return false;
  }
})

// 인증 라우터
app.use('/auth', authRouter);

// 메인 페이지
app.get('/main', (req, res) => {
  if (!authCheck.isOwner(req, res)) {  // 로그인 안되어있으면 로그인 페이지로 이동시킴
    res.redirect('/auth/login');
    return false;
  }
  res.sendFile(path.join(__dirname ,'views', '/index.html'));
})

//

//
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = options;