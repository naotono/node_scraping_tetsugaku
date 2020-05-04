const cheerio = require("cheerio");
const axios = require("axios");
const mongodb = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors")


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
                        collection.insert([
                            { "title": title, "link": "https://qiita.com/" + link, "date": date }
                        ])
                    }
                })
            })
            console.log("Scraping done...")
        });
}

getQiita();