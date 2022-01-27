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
const uri = `mongodb+srv://travellersStory:hhoxHETBzBGqbzPg@cluster0.dejzn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect()
        const blogsCollection = client.db('travellersStory').collection('blogs')
        const userCollection = client.db('travellersStory').collection('users')


        // get blogs with approve query
        app.get('/blogs', async (req, res) => {
            const status = req.query.status;
            const query = { status: status }
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