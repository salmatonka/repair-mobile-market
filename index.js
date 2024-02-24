require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ycofkd3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ycofkd3.mongodb.net/?retryWrites=true&w=majority`;
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
    const usedMobileCollection = client.db('mobileMarketUser').collection('allUsedPhone');
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
    //   app.post('/usedMobiles', async(req, res) => {
    //     const product = req.body;
    //     const result = await usedMobileCollection.insertOne(product);
    //     // console.log(result)
    //     res.send(result)
    // })

    // all mobile Category
    app.get('/usedMobile', async (req, res) => {
      const query = {};
      const result = await usedMobileCollection.find(query).toArray();
      // console.log(result)
      res.send(result)
    });

    //clicking or find by category
    app.get('/usedMobile/:category', async (req, res) => {
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

    app.put('/usedMobile', async(req, res) => {
      const id = req.query.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updatedDoc = {
      $set: {
        report: true
      }
    }
    const result = await usedMobileCollection.updateOne(filter, updatedDoc, options)
    res.send(result)
  });

  app.get('/allReported', async(req, res) => {
    const report = req.query.report;
    const query = {report: true};
    const result = await usedMobileCollection.find(query).toArray();
    res.send(result)
})


    app.post('/users',async(req,res)=>{
      const user = req.body;
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })
    app.get('/users', async(req,res)=>{
      const query = {}
      const result = await usersCollection.find(query).toArray()
      res.send(result)
    })
    app.put('/users',async(req, res)=>{
      const id = req.query.id;
      const filter = {_id: new ObjectId(id)};
            const options = {upsert: true};
            const updatedDoc = {
            $set: {
              verified: true
            }
          }
          const result = await usersCollection.updateOne(filter, updatedDoc, options)
          res.send(result)

    })

    app.get('/users/:email', async(req, res)=> {
      const email = req.params.email;
      const query = {email: email};
      const result = await usersCollection.find(query).toArray();
      res.send(email);
    
  });

  app.delete('/users', async(req,res)=>{
    const id = req.query.id;
    const query = {_id: new ObjectId(id)}
    const result = await usersCollection.deleteOne(query)
    res.send(result);
  })

  //get admin route 
  app.get('/users/admin/:email',async(req,res)=>{
    const email = req.params.email;
    const query = {email}
    const user = await usersCollection.findOne(query)
    res.send({isAdmin: user?.role === 'admin'});
})
app.get('/users/seller/:email', async(req, res) => {
  const email = req.params.email;
  const query =  { email };
  const user = await usersCollection.findOne(query);
  res.send({isSeller: user?.role === 'seller'})
});



    // add booking product 
    app.post('/booking', async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking)
      res.send(result);
    })
    app.get('/booking', async (req, res) => {
      const email = req.query.email;
      const query = { email: (email) }
      const bookings = await bookingsCollection.find(query).toArray()
      res.send(bookings);

    })
    app.delete('/booking', async(req, res) => {
      const id = req.query.id;
      const query = {_id: new ObjectId(id)};
      const result = await bookingsCollection.deleteOne(query);
      res.send(result)
  })

//add new product in usedProductCollection
      app.post('/usedMobile', async(req, res) => {
        const product = req.body;
        const result = await usedMobileCollection.insertOne(product);
        // console.log(result)
        res.send(result)
    })

 //  find the seller product 

 app.get('/myproduct',async(req,res)=>{
  const email = req.query.email;
  const query = {userEmail: (email)}
  const result = await usedMobileCollection.find(query).toArray()
  res.send(result)
})

app.delete('/myproduct',async(req,res)=>{
  const id = req.query.id;
  const query = {_id: new ObjectId(id)}
  const result = await usedMobileCollection.deleteOne(query)
  console.log(result);
  res.send(result)
})

app.put('/myproduct', async(req, res) => {
  const id = req.query.id;
  const filter = {_id: new ObjectId(id)};
  const options = {upsert: true};
  const updatedDoc = {
  $set: {
    advertising: true
  }
}
const result = await usedMobileCollection.updateOne(filter, updatedDoc, options)
res.send(result)
})


//filter items for advertising 

app.get('/advertisingProduct', async(req, res) => {
  const query = {};
  const mobiles = await usedMobileCollection.find(query).toArray();
  const advertising = mobiles.filter(mobile => mobile?.advertising === true) 
  res.send(advertising)
});



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