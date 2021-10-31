const express = require("express")
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors')
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wtvgs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();

        const database = client.db("Tourism-Vacation");
        const serviceCollection = database.collection("services");
        const orderCollection = database.collection("orders")

        //Get all services
        app.get("/services", async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services)
        })

        //Get single services
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            res.json(service)

        });

        //add order
        app.post('/order', async (req, res) => {
            console.log(req.body)
            const result = await orderCollection.insertOne(req.body)
            res.send(result)
        });

        //Add MyOrders
        app.get("/myOrders/:email", async (req, res) => {
            const result = await orderCollection.find({ login_user: req.params.email }).toArray()
            res.send(result)
        })
        //Delete Product 
        app.delete("/deleteBooking/:id", async (req, res) => {
            const id = req.params.id
            const result = await orderCollection.deleteOne({ _id: ObjectId(id) })
            res.send(result)
        })
        //get all orders
        app.get("/manageAllOrders", async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders)
        })

        //Post Services
        app.post("/services", async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service)
            res.json(result)
        })


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Server is running")
})
app.listen(port, () => {
    console.log("Running Tourism Vacation", port)
})

