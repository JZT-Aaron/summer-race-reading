import express from 'express'
import cors from 'cors';
import multer from 'multer'
import fs from 'fs'
import cloudinary  from './cloudinary.js'
import mysql from 'mysql2/promise'
import {v4 as uuid} from 'uuid'

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


const db = mysql.createPool({
    host: 'arch.the-jzt.de',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

app.post('/config', async (req, res) => {
    const friends = req.body.users;
    const slug = uuid();
    const name = 'coming'

    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {

        const [result] = await conn.query(
            'INSERT INTO configs (slug, name) VALUES (?, ?)',
            [slug, name || null]
        );

        const configId = result.insertId;

        for (const friend of friends) {
            await conn.query(
                'INSERT INTO friends (name, config_id, color, book) VALUES (?, ?, ?, ?)',
                [friend.friendName, configId, friend.color.hex, JSON.stringify(friend.presetBook)]
            );
        }

        await conn.commit();
        console.log(slug);
        res.json({slug});

    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({error: 'An error occured whilest trying to upload the users data.', details: err})
    } finally {
        conn.release();
    }

})

app.get('/config/:slug', async (req, res) => {
    const {slug} = req.params;

    try {
        const [[config]] = await db.query(
            'SELECT * FROM configs WHERE slug = ?',
            [slug]
        );

        if(!config) {
            return res.status(404).json({ error: "Config couldn't be found."})
        }

        const [friend] = await db.query(
            'SELECT * FROM friends WHERE config_id = ?',
            [config.id]
        )

        if(!friend || friend.length === 0) {
            return res.status(404).json({ error: "No friends found for this config."})
        }

        res.json({ config, friend});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'An error occured while look for your config'});
    }
});

app.listen(3001, () => {
    console.log('Server is listening on http://localhost:3001')
})

