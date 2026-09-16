require('dotenv').config();

const settings = {
    packname: 'SATORU-MD',
    author: '❖ᴹᴿ°᭄✿꧁༒ 𝐒𝐀𝐓𝐎𝐑𝐔 𝐆𝐎𝐉𝐎 ༒꧂',
    botName: process.env.BOT_NAME || '✦ 𝐒𝐀𝐓𝐎𝐑𝐔-MD ✦',
    botOwner: process.env.OWNER_NAME || '❖ᴹᴿ°᭄✿꧁༒ 𝐒𝐀𝐓𝐎𝐑𝐔 𝐆𝐎𝐉𝐎 ༒꧂',
    ownerNumber: process.env.OWNER_NUMBER || '224620126513',
    prefix: process.env.PREFIX || '🥷🏿',
    giphyApiKey: 'qnl7ssQChTdPjsKta2Ax2LMaGXz303tq',
    commandMode: process.env.COMMAND_MODE || 'public',
    maxStoreMessages: 20,
    storeWriteInterval: 10000,
    version: '2.0.0',
    waChannel: 'https://whatsapp.com/channel/0029VbDCmVWISTkNEy1D3p3H',
    BOT_IMG: 'https://files.catbox.moe/3gfn8g.jpg/file-000000003eac71f4b90c5712de3e7728.png',
};

module.exports = settings;
