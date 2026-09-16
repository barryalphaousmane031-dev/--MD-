// handler.js — CENTRAL-HEX
import config from './config.js';
import ping from './commands/ping.js';
import menu from './commands/menu.js';
import info from './commands/info.js';
import owner from './commands/owner.js';
import group from './commands/group.js';
import { getMessageInfo, getGroupInfo, getUserPermissions } from './Utils/messageUtils.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Nouvelles commandes CENTRAL-HEX
const footballnews = require('./commands/footballnews.js');
const playCmd      = require('./commands/play.js');
const songCmd      = require('./commands/song.js');
const codeaiCmd    = require('./commands/codeai.js');
const aiCmd        = require('./commands/ai.js');
const saveCmd      = require('./commands/save.js');
const toimageCmd   = require('./commands/toimage.js');
const stickerCmd   = require('./commands/sticker.js');
const imageCmd     = require('./commands/image.js');
const tagallCmd    = require('./commands/tagall.js');
const tagCmd       = require('./commands/tag.js');
const hidetagCmd   = require('./commands/hidetag.js');
const muteCmd      = require('./commands/mute.js');
const unmuteCmd    = require('./commands/unmute.js');
const aliveCmd     = require('./commands/alive.js');
const helpCmd      = require('./commands/help.js');
const allmenuCmd   = require('./commands/allmenu.js');
const goodbyeCmd   = require('./commands/goodbye.js');
const { antistickerCommand, handleAntisticker } = require('./commands/antisticker.js');
const { handleAntideleteCommand, handleMessageRevocation, storeMessage } = require('./commands/antidelete.js');

// Rendre config accessible globalement
global.config = config;

export { handleAntisticker, handleMessageRevocation, storeMessage };

export default async function handlerCommand(dvmsy, m, msg, chatUpdate, options) {
    try {
        if (!m) return;

        const messageInfo = getMessageInfo(m, dvmsy);
        const { body, sender, pushName } = messageInfo;
        const chatId = m.key.remoteJid;
        const replyMessage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        // Stocker message pour antidelete
        try { await storeMessage(dvmsy, msg); } catch {}

        // Anti-sticker check (avant préfixe)
        if (msg?.message?.stickerMessage) {
            try { await handleAntisticker(dvmsy, chatId, sender, msg); } catch {}
        }

        if (!body || !body.startsWith(config.PREFIX)) return;

        const args = body.slice(config.PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const messageText = args.join(' ');

        const groupInfo = await getGroupInfo(m, dvmsy);
        const userPerms = getUserPermissions(sender, config.OWNERS);

        const fullMessage = {
            ...m,
            ...messageInfo,
            ...groupInfo,
            ...userPerms,
            command,
            args,
            pushName: pushName || sender.split('@')[0]
        };

        console.log(`📩 [CENTRAL-HEX] Cmd: ${command} de ${fullMessage.pushName}`);

        switch (command) {

            // ─── GÉNÉRAL ───────────────────────────────
            case 'ping':
                await ping(fullMessage, dvmsy);
                break;

            case 'info':
            case 'infobot':
                await info(fullMessage, dvmsy);
                break;

            case 'runtime':
            case 'uptime': {
                const up = process.uptime();
                const h = Math.floor(up / 3600);
                const min = Math.floor((up % 3600) / 60);
                const s = Math.floor(up % 60);
                await dvmsy.sendMessage(chatId, { text: `⏰ *Uptime:* ${h}h ${min}m ${s}s` });
                break;
            }

            // ─── MENU ──────────────────────────────────
            case 'menu':
                await menu(fullMessage, dvmsy);
                break;

            case 'allmenu':
                await allmenuCmd(dvmsy, chatId, msg);
                break;

            case 'aide':
            case 'help':
                await helpCmd(dvmsy, chatId, msg, args);
                break;

            // ─── ALIVE ─────────────────────────────────
            case 'alive':
                await aliveCmd(dvmsy, chatId, msg);
                break;

            // ─── IA & TECH ─────────────────────────────
            case 'ai':
            case 'ia':
                await aiCmd(dvmsy, chatId, msg);
                break;

            case 'codeai':
                await codeaiCmd(dvmsy, chatId, sender, args, msg);
                break;

            // ─── MUSIQUE ───────────────────────────────
            case 'play':
                await playCmd(dvmsy, chatId, msg);
                break;

            case 'song':
                await songCmd(dvmsy, chatId, msg);
                break;

            // ─── MÉDIAS ────────────────────────────────
            case 'save':
                await saveCmd(dvmsy, chatId, sender, replyMessage, msg);
                break;

            case 'toimg':
            case 'toimage':
                await toimageCmd(dvmsy, chatId, replyMessage, msg);
                break;

            case 'sticker':
            case 's':
                await stickerCmd(dvmsy, chatId, msg);
                break;

            case 'image':
            case 'img':
                await imageCmd(dvmsy, chatId, msg, args);
                break;

            // ─── GROUPE ────────────────────────────────
            case 'tagall':
                await tagallCmd(dvmsy, chatId, sender, msg);
                break;

            case 'tag':
                await tagCmd(dvmsy, chatId, sender, messageText, replyMessage, msg);
                break;

            case 'hidetag':
                await hidetagCmd(dvmsy, chatId, sender, messageText, replyMessage, msg);
                break;

            case 'mute': {
                const duration = parseInt(args[0]) || 0;
                await muteCmd(dvmsy, chatId, sender, msg, duration);
                break;
            }

            case 'unmute':
                await unmuteCmd(dvmsy, chatId, sender, msg);
                break;

            case 'goodbye':
                await goodbyeCmd.goodbyeCommand(dvmsy, chatId, msg, messageText);
                break;

            // ─── PROTECTION ────────────────────────────
            case 'antisticker':
                await antistickerCommand(dvmsy, chatId, sender, args, msg);
                break;

            case 'antidelete':
                await handleAntideleteCommand(dvmsy, chatId, msg, args[0]);
                break;

            // ─── FOOT & DIVERS ─────────────────────────
            case 'footballnews':
            case 'foot':
                await footballnews(dvmsy, chatId, msg);
                break;

            // ─── OWNER ─────────────────────────────────
            case 'owner':
            case 'restart':
            case 'shutdown':
            case 'broadcast':
            case 'eval':
                await owner(fullMessage, dvmsy, command, args);
                break;

            // ─── GROUPE (ancien) ───────────────────────
            case 'link':
            case 'groupinfo':
                await group(fullMessage, dvmsy, command, args);
                break;

            default:
                console.log(`[CENTRAL-HEX] Commande inconnue: ${command}`);
        }

    } catch (error) {
        console.error('❌ Erreur handlerCommand:', error.message);
    }
}
