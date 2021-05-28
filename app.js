require('dotenv').config();
const axios = require('axios').default;
const path = require('path'), fs = require('fs');
const buyText = fs.readFileSync(path.join(__dirname, 'buy.txt')).toString();
const Discord = require('discord.js');
const discord_bot = new Discord.Client();
const discordChannels = {
    price_watch: { id: "842538295170564157", instance: null}
};

discord_bot.login(process.env.DISCORD_BOT_TOKEN);

discord_bot.on('ready', async () => {
    discordChannels.price_watch.instance = await discord_bot.channels.fetch(discordChannels.price_watch.id);
    setInterval(updateBotPriceNick, process.env.AUTO_ECHO_PRICE_INTERVAL * 1000);
});

discord_bot.on('message', async (msg) => {
    if(msg.content.substr(0,1) == '$'){
        if(msg.content.substr(0,6).toUpperCase() == '$PRICE'){
            let tiddies_price = await get_tiddies_latest_price();
            msg.channel.send(getLatestPriceMessage(tiddies_price));
        }
        else if(msg.content.substr(0,4).toUpperCase() == '$BUY'){
            msg.channel.send(buyText);
        }
    }
});

function get_tiddies_latest_price(){
    return new Promise((resolve) => {
        Promise.all([
            axios.get('http://localhost:8001/coins'),
            axios.get('http://localhost:8001/tiddies-price')
        ]).then(([coins_response, tiddies_response]) => {
            let bnb_price, tiddies_per_bnb = tiddies_response.data;
            for(let i = 0, n = coins_response.data.length; i < n; i++){
                if(coins_response.data[i].symbol == 'BNB'){
                    bnb_price = coins_response.data[i].price;
                    break;
                }
            }
            resolve((bnb_price / tiddies_per_bnb).toFixed(8))
        });
    })
}

function getLatestPriceMessage(current_price){
    return `AnimeTiddies Live Price
    $${current_price.toFixed(2)}`;
}

async function updateBotPriceNick(){
    return new Promise(async (resolve) => {
        let tiddies_price = await get_tiddies_latest_price();
        let guild = await discord_bot.guilds.fetch("842534142327259147");
        let member = await guild.members.fetch(discord_bot.user.id);
        member.setNickname(`$${tiddies_price.toFixed(8)}`);
        resolve();
    })
}
