require('dotenv').config();

const fs = require('fs');
const path = require('path');
const settings = require('./settings');
const { getCurrentPrefix } = require('./commands/setprefix');

// ─── Dossier temp ───────────────────────────────────────────
const customTemp = path.join(process.cwd(), 'temp');
if (!fs.existsSync(customTemp)) fs.mkdirSync(customTemp, { recursive: true });
process.env.TMPDIR = customTemp;
process.env.TEMP = customTemp;
process.env.TMP = customTemp;

setInterval(() => {
    fs.readdir(customTemp, (err, files) => {
        if (err) return;
        for (const file of files) {
            const filePath = path.join(customTemp, file);
            fs.stat(filePath, (err, stats) => {
                if (!err && Date.now() - stats.mtimeMs > 3 * 60 * 60 * 1000)
                    fs.unlink(filePath, () => {});
            });
        }
    });
}, 3 * 60 * 60 * 1000);

// ─── Imports des 57 commandes choisies ──────────────────────
// GÉNÉRAL
const menuCommand         = require('./commands/menu');
const allmenuCommand      = require('./commands/allmenu');
const helpCommand         = require('./commands/help');
const pingCommand         = require('./commands/ping');
const aliveCommand        = require('./commands/alive');
const ownerCommand        = require('./commands/owner');
const settingsCommand     = require('./commands/settings');
// GROUPE
const modeCommand         = require('./commands/mode');
const kickCommand         = require('./commands/kick');
const kickallCommand      = require('./commands/kickall');
const kickall2Command     = require('./commands/kickall2');
const openCommand         = require('./commands/open');
const closeCommand        = require('./commands/close');
const tagallCommand       = require('./commands/tagall');
const tagCommand          = require('./commands/tag');
const warnCommand         = require('./commands/warn');
const { welcomeCommand, handleJoinEvent } = require('./commands/welcome');
const { goodbyeCommand, handleLeaveEvent } = require('./commands/goodbye');
const setmenuimageCommand = require('./commands/setmenuimage');
const gcreateCommand      = require('./commands/gcreate');
const leaveCommand        = require('./commands/leave');
const antispamCommand     = require('./commands/antispam');
const { handleAntilinkCommand, handleLinkDetection } = require('./commands/antilink');
const antimaraboutCommand = require('./commands/antimarabout');
const { handleAntideleteCommand, handleMessageRevocation, storeMessage } = require('./commands/antidelete');
const { antibotCommand } = require('./commands/antibot');
const { antistickerCommand, handleAntisticker } = require('./commands/antisticker');
const antiloveCommand     = require('./commands/antilove');
const antinjureCommand    = require('./commands/antinjure');
const { acceptallCommand, rejectallCommand } = require('./commands/acceptreject');
const linkCommand         = require('./commands/link');
const groupInfoCommand    = require('./commands/groupinfo');
const antipurgeCommand    = require('./commands/antipurge');
const { antimentionCommand, handleAntimention } = require('./commands/antimention');
// EDITING
const imageCommand        = require('./commands/image');
const stickerCommand      = require('./commands/sticker');
const toimageCommand      = require('./commands/toimage');
const waouhCommand        = require('./commands/waouh');
const hummCommand         = require('./commands/humm');
const { lyricsCommand }   = require('./commands/lyrics');
const saveCommand         = require('./commands/save');
const autoreactstatusCommand = require('./commands/autoreactstatus'); // likestatus
const groupstatusCommand  = require('./commands/groupstatus');
const autoviewstatusCommand  = require('./commands/autoviewstatus'); // lecture_status
// AI
const aiCommand           = require('./commands/ai');
const gptCommand          = require('./commands/gpt');
const imagineCommand      = require('./commands/imagine');
const geminiCommand       = require('./commands/gemini');
// TELECHARGEMENT
const videoCommand        = require('./commands/video');
const songCommand         = require('./commands/song');
const playCommand         = require('./commands/play');
const footballnewsCommand = require('./commands/footballnews');
const urlCommand          = require('./commands/url');
// UTILITY
const b64decCommand       = require('./commands/b64dec');
const ipinfoCommand       = require('./commands/ipinfo');
const passwordCommand     = require('./commands/password');

// ─── Globals ────────────────────────────────────────────────
global.packname     = settings.packname;
global.author       = settings.author;
global.channelLink  = settings.waChannel;
global.botname      = settings.botName;

const channelInfo = {
    contextInfo: {
        forwardingScore: 1, isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363408304719268@newsletter',
            newsletterName: 'SATORU-MD', serverMessageId: -1
        }
    }
};

// ─── Fonction principale ─────────────────────────────────────
async function handleMessages(sock, messageUpdate) {
    try {
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;

        const message = messages[0];
        if (!message?.message) return;

        storeMessage(sock, message);

        const chatId   = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;
        const isGroup  = chatId.endsWith('@g.us');

        const rawText = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() || ''
        );

        const prefix = getCurrentPrefix();

        if (!rawText.startsWith(prefix)) {
            // Vérifications silencieuses (antilink, antisticker, antidelete, antinjure, antispam, antimarabout, antilove, antimention)
            if (isGroup) {
                try { await handleLinkDetection(sock, chatId, message, senderId); } catch {}
                try { await handleAntisticker(sock, chatId, senderId, message); } catch {}
                try { await antinjureCommand.detect(sock, chatId, message, rawText, senderId); } catch {}
                try { await antispamCommand.detect(sock, chatId, senderId, message); } catch {}
                try { await antimaraboutCommand.detect(sock, chatId, senderId, message, rawText); } catch {}
                try { await antiloveCommand.detect(sock, chatId, senderId, message, rawText); } catch {}
                const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
                try { await handleAntimention(sock, chatId, senderId, mentionedJids, message); } catch {}
            }
            if (message.message?.protocolMessage?.type === 0) {
                try { await handleMessageRevocation(sock, message); } catch {}
            }
            return;
        }

        // 🥷🏿 tapé seul → afficher le menu
        const afterPrefix = rawText.slice(prefix.length).trim();
        let cmd, args;
        if (!afterPrefix) {
            cmd = 'menu';
            args = [];
        } else {
            args = afterPrefix.split(/ +/);
            cmd = args.shift().toLowerCase();
        }

        const replyMessage  = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        console.log(`📝 [SATORU-MD] ${isGroup ? 'Groupe' : 'MP'} | ${cmd} | ${senderId.split('@')[0]}`);

        switch (true) {

            // ── GÉNÉRAL ─────────────────────────────────────
            case cmd === 'menu':
                await menuCommand(sock, chatId, senderId, message); break;

            case cmd === 'allmenu':
                await allmenuCommand(sock, chatId, message); break;

            case cmd === 'help':
                await helpCommand(sock, chatId, message, args); break;

            case cmd === 'ping':
                await pingCommand(sock, chatId, message); break;

            case cmd === 'alive':
                await aliveCommand(sock, chatId, message); break;

            case cmd === 'owner':
                await ownerCommand(sock, chatId, message); break;

            case cmd === 'settings':
                await settingsCommand(sock, chatId, message); break;

            // ── GROUPE ───────────────────────────────────────
            case cmd === 'mode':
                await modeCommand(sock, chatId, args, message); break;

            case cmd === 'kick':
                await kickCommand(sock, chatId, senderId, mentionedJids, message); break;

            case cmd === 'kickall':
                await kickallCommand(sock, chatId, senderId, message); break;

            case cmd === 'kickall2':
                await kickall2Command(sock, chatId, senderId, message); break;

            case cmd === 'open':
                await openCommand(sock, chatId, senderId, message); break;

            case cmd === 'close':
                await closeCommand(sock, chatId, senderId, message); break;

            case cmd === 'tagall':
                await tagallCommand(sock, chatId, senderId, message); break;

            case cmd === 'tag':
                await tagCommand(sock, chatId, senderId, args.join(' '), replyMessage, message); break;

            case cmd === 'warn':
                await warnCommand(sock, chatId, senderId, mentionedJids, message); break;

            case cmd === 'welcome':
                await welcomeCommand(sock, chatId, message, args[0]); break;

            case cmd === 'goodbye':
                await goodbyeCommand(sock, chatId, message, args[0]); break;

            case cmd === 'setmenuimage':
                await setmenuimageCommand(sock, chatId, senderId, args, replyMessage, message); break;

            case cmd === 'gcreate':
                await gcreateCommand(sock, chatId, senderId, args, message); break;

            case cmd === 'leave':
                await leaveCommand(sock, chatId, message); break;

            case cmd === 'antispam':
                await antispamCommand(sock, chatId, args, message); break;

            case cmd === 'antilink':
                await handleAntilinkCommand(sock, chatId, args, senderId, true, message); break;

            case cmd === 'antimarabout':
                await antimaraboutCommand(sock, chatId, args, message); break;

            case cmd === 'antidelete':
                await handleAntideleteCommand(sock, chatId, message, args[0]); break;

            case cmd === 'antibot':
                await antibotCommand(sock, chatId, message, args, false); break;

            case cmd === 'antisticker':
                await antistickerCommand(sock, chatId, senderId, args, message); break;

            case cmd === 'antilove':
                await antiloveCommand(sock, chatId, args, message); break;

            case cmd === 'antinjure':
                await antinjureCommand(sock, chatId, message, args); break;

            case cmd === 'acceptall':
                await acceptallCommand(sock, chatId, message); break;

            case cmd === 'rejectall':
                await rejectallCommand(sock, chatId, message); break;

            case cmd === 'link':
                await linkCommand(sock, chatId, message); break;

            case cmd === 'ginfo':
                await groupInfoCommand(sock, chatId, message); break;

            case cmd === 'antipurge':
                await antipurgeCommand(sock, chatId, args, message); break;

            case cmd === 'antimention':
                await antimentionCommand(sock, chatId, senderId, args, message); break;

            // ── EDITING ──────────────────────────────────────
            case cmd === 'image':
                await imageCommand(sock, chatId, message, args); break;

            case cmd === 'sticker':
                await stickerCommand(sock, chatId, message); break;

            case cmd === 'toimg':
                await toimageCommand(sock, chatId, replyMessage, message); break;

            case cmd === 'waouh':
                await waouhCommand(sock, chatId, senderId, replyMessage, message); break;

            case cmd === 'humm':
                await hummCommand(sock, chatId, senderId, replyMessage, message); break;

            case cmd === 'lyrics':
                await lyricsCommand(sock, chatId, args, message); break;

            case cmd === 'save':
                await saveCommand(sock, chatId, senderId, replyMessage, message); break;

            case cmd === 'likestatus':
                await autoreactstatusCommand(sock, chatId, senderId, args, message); break;

            case cmd === 'groupstatus':
                await groupstatusCommand(sock, chatId, args, message); break;

            case cmd === 'lecture_status':
                await autoviewstatusCommand(sock, chatId, senderId, args, message); break;

            // ── AI ───────────────────────────────────────────
            case cmd === 'ai':
                await aiCommand(sock, chatId, message); break;

            case cmd === 'gpt':
                await gptCommand(sock, chatId, message); break;

            case cmd === 'imagine':
                await imagineCommand(sock, chatId, message); break;

            case cmd === 'gemini':
                await geminiCommand(sock, chatId, message); break;

            // ── TELECHARGEMENT ────────────────────────────────
            case cmd === 'video':
                await videoCommand(sock, chatId, message); break;

            case cmd === 'song':
                await songCommand(sock, chatId, message); break;

            case cmd === 'play':
                await playCommand(sock, chatId, message); break;

            case cmd === 'footballnews':
                await footballnewsCommand(sock, chatId, message); break;

            case cmd === 'url':
                await urlCommand(sock, chatId, message); break;

            // ── UTILITY ────────────────────────────────────────
            case cmd === 'b64dec':
                await b64decCommand(sock, chatId, args, message); break;

            case cmd === 'ipinfo':
                await ipinfoCommand(sock, chatId, args, message); break;

            case cmd === 'password':
                await passwordCommand(sock, chatId, args, message); break;

            default:
                await sock.sendMessage(chatId, {
                    text: `❌ Commande inconnue : *${prefix}${cmd}*\n💡 Tape *${prefix}menu* pour voir les commandes.`,
                    ...channelInfo
                }, { quoted: message });
        }

    } catch (error) {
        console.error('❌ Erreur handleMessages:', error.message);
    }
}

// ─── Exports supplémentaires requis par index.js ─────────────
async function handleGroupParticipantUpdate(sock, update) {
    try {
        const { id, participants, action } = update;
        if (action === 'add') {
            try { await handleJoinEvent(sock, id, participants); } catch {}
        }
        if (action === 'remove') {
            try { await handleLeaveEvent(sock, id, participants); } catch {}
            try {
                const antipurge = require('./commands/antipurge');
                if (update.author) await antipurge.onRemoval(sock, id, update.author);
            } catch {}
        }
    } catch (e) {}
}

async function handleStatus(sock, update) {
    try {
        const statusMessage = update?.messages ? update.messages[0] : update;
        if (!statusMessage) return;

        // lecture_status : le bot "lit" automatiquement le statut
        try {
            const cfgPath = path.join(__dirname, 'data', 'autoStatus.json');
            const cfg = JSON.parse(fs.readFileSync(cfgPath));
            if (cfg.activé && statusMessage.key) {
                await sock.readMessages([statusMessage.key]);
            }
        } catch {}

        // likestatus : le bot réagit avec un emoji
        try {
            const { handleAutoReact } = require('./commands/autoreactstatus');
            await handleAutoReact(sock, statusMessage);
        } catch {}
    } catch (e) {}
}

module.exports = { handleMessages, handleGroupParticipantUpdate, handleStatus };
