const cheerio = require("cheerio");
const axios = require("axios");
const mongodb = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors")

app.use(cors());

const url = 'mongodb+srv://naosan:cowcowcow5@cluster0-yifl2.gcp.mongodb.net/Scraping?retryWrites=true&w=majority';
const client = new mongodb.MongoClient(url);
let db, collection;
client.connect((err) => {
    if (err) console.log(err);
    console.log("Connected Successfully");
    db = client.db("Scraping");
    collection = db.collection("document");
})

app.get("/", async (req, res) => {
    collection.find({}).sort({ date: 1 }).toArray((err, docs) => {
        if (err) console.log(err);
        res.json(docs);
        console.log(docs);
    });
})
app.listen(8000, console.log("Server started"));

function getTetsugakuNews() {
    axios.get("http://blog.livedoor.jp/nwknews/")
        .then(res => {
            const $ = cheerio.load(res.data);
            $(".article-title").each((i, el) => {
                const title = $(el).text();
                const link = $(el).find("a").attr("href");
                const date = new Date().getTime();

                collection.findOne({ "link": link }, (err, doc) => {
                    if (err) throw err;
                    if (!doc) {
                        collection.insertOne(
                            { "title": title, "link": link, "date": date }
                        )
                    }
                })
            })
            console.log("Scraping done...")
        });
}

function getQiita() {
    axios.get("https://qiita.com/tags/javascript?page=1")
        .then(res => {
            const $ = cheerio.load(res.data);
            $(".tst-ArticleBody_title").each((i, el) => {
                const title = $(el).text();
                const link = $(el).attr("href");
                const date = new Date().getTime();

                collection.findOne({ "link": link }, (err, doc) => {
                    if (err) throw err;
                    if (!doc) {
                        collection.insertOne(
                            { "title": title, "link": "https://qiita.com/" + link, "date": date }
                        )
                    }
                })
            })
            console.log("Scraping done...")
        });
}

setInterval(getTetsugakuNews, 1000 * 60 * 30);
setInterval(getQiita, 1000 * 60 * 30);