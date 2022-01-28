const express = require('express');
const { MongoClient } = require('mongodb')
const ObjectId = require('mongodb').ObjectId
const cors = require('cors')
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())

// mongo db connection 
// database 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dejzn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect()
        const blogsCollection = client.db('travellersStory').collection('blogs')
        const userCollection = client.db('travellersStory').collection('users')


        // post blog
        app.post('/blogs', async (req, res) => {
            const result = await blogsCollection.insertOne(req.body)
            res.json(result)
        })
        // get blogs with approve query with pagination
        app.get('/blogs', async (req, res) => {
            const status = req.query.status;
            const query = { status: status }
            const page = req.query.page
            const size = parseInt(req.query.size);
            let result;
            const count = await blogsCollection.find(query).count()
            if (page) {
                result = await blogsCollection.find(query).skip(page * size).limit(size).toArray()
            } else {
                result = await blogsCollection.find(query).toArray()
            }
            res.json({ count, result })
        })
        // get single blog
        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const result = await blogsCollection.findOne({ _id: ObjectId(id) })
            res.json(result)
        })
        // get all blogs for admin 
        app.get('/all-blogs', async (req, res) => {
            const result = await blogsCollection.find({}).toArray()
            res.json(result)
        })

        // update blog status
        app.put('/updateStatus/:id', async (req, res) => {
            const id = req.params.id
            const result = await blogsCollection.updateOne({ _id: ObjectId(id) }, {
                $set: {
                    status: 'approve',
                }
            })
            res.json(result);
        })
        app.put('/updateStatus1/:id', async (req, res) => {
            const id = req.params.id
            const result = await blogsCollection.updateOne({ _id: ObjectId(id) }, {
                $set: {
                    status: 'pending',
                }
            })
            res.json(result);
        })

        // delete blog from db
        app.delete('/delete/:id', async (req, res) => {
            const result = await blogsCollection.deleteOne({ _id: ObjectId(req.params.id) })
            res.json(result)
        })

        // get single email posted blog
        app.get('/myBlogs', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const cursor = blogsCollection.find(query)
            const result = await cursor.toArray()
            res.json(result)
        })


        // add user to db
        app.post('/users', async (req, res) => {
            const result = await userCollection.insertOne(req.body)
            res.json(result)
        })
        // upsert for google login 
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const options = { upsert: true }
            const updatDoc = { $set: user }
            const result = await userCollection.updateOne(filter, updatDoc, options)
            res.json(result)
        })
        // make admin 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await userCollection.updateOne(filter, updateDoc)
            res.json(result)
        })
        // get admin user
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await userCollection.findOne(query)
            let isAdmin = false
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })








    } finally {
        // await client.close()
    }
}
run().catch(console.dir)






app.get('/', (req, res) => {
    res.send('Travellers story is running')
})
app.listen(port, () => console.log(`Port running on, ${port}`))