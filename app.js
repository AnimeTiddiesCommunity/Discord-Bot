require('dotenv').config();
const axios = require('axios').default;
const path = require('path'), fs = require('fs');
const requestBNB = fs.readFileSync(path.join(__dirname, 'request-bnb.txt')).toString();
const requestTiddy = fs.readFileSync(path.join(__dirname, 'request-tiddy.txt')).toString();
const Discord = require('discord.js');
const discord_bot = new Discord.Client();
const main_chat_id = "842534142327259150";
var channel;

discord_bot.login(process.env.DISCORD_BOT_TOKEN);
discord_bot.on('ready', async () => {
    channel = await discord_bot.channels.fetch(main_chat_id);
    echoLatestPrice();
    setInterval(echoLatestPrice, 60000);
});

async function echoLatestPrice(){
    let [bnb_price, tiddies_per_bnb] = await Promise.all([getBNBPrice(), getTiddiesPerBNB()]);
    let pancakeswap_price = tiddies_per_bnb*0.9975;
    let price_per_tiddy = ((1/pancakeswap_price)*bnb_price).toFixed(10);
    channel.send(`AnimeTiddies Live Price: $${price_per_tiddy}`);
}

function getBNBPrice(){
    return new Promise((resolve) => {
        axios.request({
            method: 'POST',
            responseType: 'json',
            headers: {
                'Accept' : 'application/json',
                'Content-Type' : 'application/json',
                'X-API-KEY': process.env.BITQUERY_API_TOKEN
            },
            url: 'https://graphql.bitquery.io',
            data: JSON.stringify({ query: requestBNB.replace(/\r\n/g,"\n"), variables: {} })
        }).then((response) => {
            resolve(response.data.data.ethereum.dexTrades[0].quotePrice);
        })
    })
}

function getTiddiesPerBNB(){
    return new Promise((resolve) => {
        axios.request({
            method: 'POST',
            responseType: 'json',
            headers: {
                'Accept' : 'application/json',
                'Content-Type' : 'application/json',
                'X-API-KEY': process.env.BITQUERY_API_TOKEN
            },
            url: 'https://graphql.bitquery.io',
            data: JSON.stringify({ query: requestTiddy.replace(/\r\n/g,"\n"), variables: {} })
        }).then((response) => {
            resolve(response.data.data.ethereum.dexTrades[0].quotePrice);
        })
    })
}

