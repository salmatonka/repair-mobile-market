require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ycofkd3.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const mobileCategoryCollection = client.db('mobileMarketUser').collection('mobileCategory');
    const usedMobileCollection = client.db('mobileMarketUser').collection('allMobiles');
    const bookingsCollection = client.db('mobileMarketUser').collection('bookings');
    const usersCollection = client.db('mobileMarketUser').collection('users');


    // mobileCategory
    app.get('/mobileCategory', async (req, res) => {
      const query = {};
      const result = await mobileCategoryCollection.find(query).toArray();
      // console.log(result)
      res.send(result)
    });

      //add new product in usedProductCollection
      app.post('/usedMobiles', async(req, res) => {
        const product = req.body;
        const result = await usedMobileCollection.insertOne(product);
        // console.log(result)
        res.send(result)
    })

    // all mobile Category
    app.get('/usedMobiles', async (req, res) => {
      const query = {};
      const result = await usedMobileCollection.find(query).toArray();
      // console.log(result)
      res.send(result)
    });

    //clicking or find by category
    app.get('/usedMobiles/:category', async (req, res) => {
      const category = req.params.category;
      const query = { category: (category) };
      const result = await usedMobileCollection.find(query).toArray();
      res.send(result)
    });

    //single mobile with unic id
    app.get('/mobile/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usedMobileCollection.findOne(query);
      res.send(result);
    })

    
 


  } finally {

  }
}


run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("mobile server is running");
});

app.listen(port, () => {
  console.log(`mobile server on port ${port}`);
});