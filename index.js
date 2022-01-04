const express = require("express")
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors')
require('dotenv').config();
const fileUpload = require('express-fileupload')

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(fileUpload())


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
            console.log("body", req.body);
            console.log("files", req.files);

            const name = req.body.name;
            const days = req.body.days;
            const featured = req.body.featured;
            const long_description = req.body.long_description;
            const country = req.body.country;
            const night = req.body.night;
            const price = req.body.price;
            const short_description = req.body.short_description;
            const special_price = req.body.special_price;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');

            const service = {
                name,
                days,
                featured,
                long_description,
                country,
                night,
                price,
                short_description,
                special_price,
                image: imageBuffer
            }
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

