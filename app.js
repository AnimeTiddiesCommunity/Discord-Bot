require('dotenv').config();
const axios = require('axios').default;
const path = require('path'), fs = require('fs');
const requestBNB = fs.readFileSync(path.join(__dirname, 'request-bnb.txt')).toString();
const requestTiddy = fs.readFileSync(path.join(__dirname, 'request-tiddy.txt')).toString();
const Discord = require('discord.js');
const discord_bot = new Discord.Client();
const discordChannels = {
    price_watch: { id: "842538295170564157", instance: null}
};
var latestPrice = 0;

discord_bot.login(process.env.DISCORD_BOT_TOKEN);
discord_bot.on('ready', async () => {
    discordChannels.price_watch.instance = await discord_bot.channels.fetch(discordChannels.price_watch.id);
    setInterval(echoLatestPrice, 60000);
});
bot.on('message', msg => {
    if(msg.content.substr(0,6) == '$PRICE'){
        msg.channel.send(`AnimeTiddies Live Price: $${price_per_tiddy}`);
    }
});

async function echoLatestPrice(){
    let [bnb_price, tiddies_per_bnb] = await Promise.all([getBNBPrice(), getTiddiesPerBNB()]);
    let pancakeswap_price = tiddies_per_bnb*0.9975;
    let price_per_tiddy = ((1/pancakeswap_price)*bnb_price).toFixed(10);
    latestPrice = price_per_tiddy;
    discordChannels.price_watch.instance.send(`AnimeTiddies Live Price: $${price_per_tiddy}`);
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

