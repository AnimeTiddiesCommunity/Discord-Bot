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
var lastPrice = 0,
latestPrice = 0;

discord_bot.login(process.env.DISCORD_BOT_TOKEN);
discord_bot.on('ready', async () => {
    discordChannels.price_watch.instance = await discord_bot.channels.fetch(discordChannels.price_watch.id);
    setInterval(setLatestPrice, process.env.AUTO_ECHO_PRICE_INTERVAL * 1000);
});
discord_bot.on('message', msg => {
    if(msg.content.substr(0,6).toUpperCase() == '$PRICE'){
        if(latestPrice == 0){
            setLatestPrice().then(() => {
                msg.channel.send(getLatestPriceMessage());
            })
        }
        else{
            msg.channel.send(getLatestPriceMessage());
        }
    }
});

function getLatestPriceMessage(){
    var priceMovement = lastPrice > latestPrice ? '📉' : '📈';
    var pricePercentage = ((latestPrice / lastPrice) * 100).toFixed(1);
    var priceMovePercentage = lastPrice > latestPrice ? `-${pricePercentage}%` : `+${pricePercentage}%`;
    return `AnimeTiddies Live Price
    ${priceMovement} $${latestPrice} ${pricePercentage >= 100.5 || pricePercentage <= 99.5 ? ` | ${priceMovePercentage}` : ''}`;
}

async function setLatestPrice(){
    let [bnb_price, tiddies_per_bnb] = await Promise.all([getBNBPrice(), getTiddiesPerBNB()]);
    let pancakeswap_price = tiddies_per_bnb*0.9975;
    let newPrice = ((1/pancakeswap_price)*bnb_price).toFixed(10);
    lastPrice = latestPrice;
    latestPrice = newPrice;
    let priceMovement = lastPrice > latestPrice ? '📉' : '📈';
    let guild = await discord_bot.guilds.fetch("842534142327259147");
    let member = await guild.members.fetch(discord_bot.user.id);
    member.setNickname(`${priceMovement} $${latestPrice}`);
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

