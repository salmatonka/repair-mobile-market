const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const ObjectId = require('mongodb').ObjectId;

const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();

const port = process.env.PORT || 5000;

//middleware
// app.use(cors());
//middleware
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());


//mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ycofkd3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// token function

// middleware function for jwt verify 
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.TOKEN_SECRET, function (error, decoded) {
    if (error) {
      return res.status(403).send({ message: 'Forbidden' });
    }
    req.decoded = decoded;
    next();
  })
}



//mongodb function
async function run() {
  try {
    const mobileCategoryCollection = client.db('mobileMarketUser').collection('mobileCategory');
    const usedMobileCollection = client.db('mobileMarketUser').collection('allUsedPhone');
    const bookingsCollection = client.db('mobileMarketUser').collection('bookings');
    const usersCollection = client.db('mobileMarketUser').collection('users');
    const cartCollection = client.db('mobileMarketUser').collection('carts');

    // Get jwt token 
    app.get('/jwt', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);

      if (user && user.email) {
        const token = jwt.sign({ email }, process.env.TOKEN_SECRET, { expiresIn: '12d' });
        return res.send({ accessToken: token })
      }
      // console.log(user);
      res.status(403).send({ accessToken: '' });
    })



    // mobileCategory
    app.get('/mobileCategory', async (req, res) => {
      const query = {};
      const result = await mobileCategoryCollection.find(query).toArray();
      // console.log(result)
      res.send(result)
    });


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






    // Creating user in dB 
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    // Getting Sellers for admin 
    app.get('/users/sellers', async (req, res) => {
      const query = { role: 'seller' };
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    })

    // Getting Buyers for admin 
    app.get('/users/buyers', async (req, res) => {
      const query = { role: 'buyer' };
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    })

    // Blue tick handling
    app.put('/users', async (req, res) => {
      const id = req.query.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          verified: true
        }
      }
      const result = await usersCollection.updateOne(filter, updatedDoc, options)
      res.send(result)

    })

    app.delete('/users', async (req, res) => {
      const id = req.query.id;
      const query = { _id: new ObjectId(id) }
      const result = await usersCollection.deleteOne(query)
      res.send(result);
    })



    // post  cartItem
    app.post('/carts', async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
      // console.log(result)
    });

    // carts collection
    app.get('/carts', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
      // console.log(result)
    });

    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartCollection.deleteOne(query);
      res.send(result);
      // console.log(result)
    })

    // add booking product 
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking)
      res.send(result);
    })
    app.get('/bookings', async (req, res) => {
      const email = req.query.email;
      const query = { email: (email) }
      const bookings = await bookingsCollection.find(query).toArray()
      res.send(bookings);
      // console.log(bookings)

    })
    // Deleting order 
    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const filter = { _id: new ObjectId(id) };
      const result = await bookingsCollection.deleteOne(filter);
      res.send(result);
    })



    //add new product in usedProductCollection
    app.post('/myProducts', async (req, res) => {
      const product = req.body;
      const result = await usedMobileCollection.insertOne(product);
      // console.log(result)
      res.send(result)
    })
    app.get('/myProducts', async (req, res) => {
      const products = await usedMobileCollection.find().toArray();
      res.send(products);
    })
    //single mobile with unic id
    app.get('/myProducts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usedMobileCollection.findOne(query);
      res.send(result);
    })


    //  find the  product delete

    app.delete('/myProducts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await usedMobileCollection.deleteOne(query)
      // console.log(result);
      res.send(result)
    })

//  edit product 

    app.patch("/myProducts/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const result = await usedMobileCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(result);
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