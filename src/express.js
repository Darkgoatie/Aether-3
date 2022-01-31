async function runExp({ voteCallback }) {
    require("dotenv").config();
    const express = require("express");
    const app = express();
    const Topgg = require("@top-gg/sdk");

    app.use(express.static("public"));
    const Hook = new Topgg.Webhook(process.env.TopggAuth);
    // define the first route
    app.post("/votes", Hook.listener(voteCallback));

    app.get("/", async (req, res) => {
        res.send("<h1>This is the Aether api! Please don't interact with unless you are given permission to!</h1>")
    })

    // start the server listening for requests
    app.listen(process.env.PORT || 3000, 
    	() => console.log("Server is running...")
    );
}

module.exports = {
    runExp
};