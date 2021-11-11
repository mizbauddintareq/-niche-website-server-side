const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rvmjj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("drones_world");
    const productsCollection = database.collection("products");
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection("users");
    const reviewsCollection = database.collection("reviews");

    //   add a product on db
    app.post("/addProduct", async (req, res) => {
      const product = req.body;
      const results = await productsCollection.insertOne(product);
      res.json(results);
    });

    // get all products from db
    app.get("/allProducts", async (req, res) => {
      const cursor = await productsCollection.find({}).toArray();
      res.send(cursor);
    });

    // add review on db
    app.post("/review", async (req, res) => {
      const review = req.body;
      const results = await reviewsCollection.insertOne(review);
      res.json(results);
      console.log(results);
    });

    // get all reviews from db
    app.get("/reviews", async (req, res) => {
      const cursor = await reviewsCollection.find({}).toArray();
      res.send(cursor);
    });

    // get single product from db
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    //   add an order on db
    app.post("/addOrder", async (req, res) => {
      const order = req.body;
      const results = await ordersCollection.insertOne(order);
      res.json(results);
    });
    // get all products from db
    app.get("/allOrders", async (req, res) => {
      const cursor = await ordersCollection.find({}).toArray();
      res.send(cursor);
    });
    // delete a product from db
    app.delete("/delProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.json(result);
    });
    // get my order from db
    app.get("/myOrder/:email", async (req, res) => {
      const email = req.params.email;
      const result = await ordersCollection.find({ email }).toArray();
      res.send(result);
    });

    // delete an order from db
    app.delete("/delOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    // update order status on db
    app.put("/status/:id", async (req, res) => {
      const updateId = req.params.id;
      const updatedStatus = req.body;
      console.log(updatedStatus);
      const filter = { _id: ObjectId(updateId) };

      const updateDoc = {
        $set: {
          status: updatedStatus.status,
        },
      };
      const approveStatus = await ordersCollection.updateOne(filter, updateDoc);
      res.json(approveStatus);
    });

    // save users info on db
    app.post("/user", async (req, res) => {
      const user = req.body;
      const results = await usersCollection.insertOne(user);
      res.json(results);
    });

    // set admin role on db
    app.put("/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const results = await usersCollection.updateOne(filter, updateDoc);
      res.json(results);
    });

    // check admin or not
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
