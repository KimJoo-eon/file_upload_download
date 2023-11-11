const express = require('express');
const multer = require('multer');
// const path = require('path');
const fs = require('fs/promises');

const app = express();
const PORT = 3000;

app.use(express.static('uploads'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // 클라이언트에서 전달한 파일 이름 사용
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.single('file'), (req, res) => {
    const uploadedFileName = req.file.originalname; // 사용자가 전달한 파일 이름 사용
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});