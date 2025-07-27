import express from 'express'
import cors from 'cors';
import multer from 'multer'
import fs from 'fs'
import cloudinary  from './cloudinary.js'

const app = express();
const upload = multer({ dest: 'temp/' });

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());

app.get('/api/search', async(req, res) => {
    const input = req.query.q;
    const maxResults = parseInt(req.query.maxResults, 10) || 3;

    const API_KEY = process.env.BOOK_API_KEY;
    try {
        const contoller = new AbortController();

        req.on('close', () => {
            contoller.abort()
        })

        const bookRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(input)}&maxResults=${maxResults}&key=${API_KEY}`)
        if(!bookRes.ok) {
            console.error(bookRes.status);
            let searchErr = `Something went wrong. Code: ${bookRes.status}`
            if(bookRes.status == 429) searchErr = 'Too many requests. (Rate-Limit)'
            res.json({
                id: -1,
                error: searchErr
            })
            return;
        } 
        const data = await bookRes.json()
        const items = data.items;
        if(!items) {
            res.json({
                id: -1,
                error: 'No results found'
            })
            return;
        } 
        res.json(items.slice(0, maxResults).map((item, index) => {
            const volumeInfo = item.volumeInfo
            return({
                id: index,
                bookId: item.id,
                title: volumeInfo.title,
                cover: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : 'https://arch.the-jzt.de/defaultcover.svg',
                authors: volumeInfo.authors ? volumeInfo.authors.join(', ') : '',
                publishedDate: volumeInfo.publishedDate || '',
                pages: volumeInfo.pageCount || '',
                description: volumeInfo.description || ''
            })
        }))
    } catch (err) {
        res.status(500).json({error: "Search Failed", details: err.details})
    }  
})


app.post('/api/upload', upload.single('image'), async (req, res) => {
    const maxFileSize = 10;
    let currentFileSize = req.file.size;

    const filePath = req.file.path;
    
    try {
        if(currentFileSize > (maxFileSize * 1024 * 1024)) {
            currentFileSize = (currentFileSize / 1024 / 1024).toFixed(2);
            res.status(500).json({error: 'Too big Filesize', details: (`The maxium Filesize is at ${maxFileSize} MB you image is ${currentFileSize} MB big. That's ${currentFileSize-maxFileSize} MB to big.`)})
            return;
        }

        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'covers',
        })

        res.json({
            url: result.secure_url,
            public_id: result.public_id,
        })
    } catch (err) {
        res.status(500).json({ error: 'Upload failed', details: err.message })
    } finally {
        if(filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
})

app.post('/api/delete', async (req, res) => {
    const public_id = req.body.public_id;

    cloudinary.uploader.destroy(public_id)
        .then(result => res.json({ result }))
        .catch(err => res.status(500).json({error: err.message}
    ))


})


app.listen(3001, () => {
    console.log('Server is listening on http://localhost:3001')
})

