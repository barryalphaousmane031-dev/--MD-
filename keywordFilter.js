const fs = require('fs');
const path = require('path');

// Crée un module de filtre (toggle on/off + détection par mots-clés) prêt à l'emploi
function createKeywordFilter({ name, dataFile, keywords, warnText }) {
    const configPath = path.join(__dirname, '..', 'data', dataFile);
    if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify({}));

    function getConfig() { try { return JSON.parse(fs.readFileSync(configPath)); } catch { return {}; } }
    function saveConfig(d) { fs.writeFileSync(configPath, JSON.stringify(d, null, 2)); }

    async function command(sock, chatId, args, message) {
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, { text: '❌ *Uniquement dans les groupes !*' }, { quoted: message });
        }
        const config = getConfig();
        const action = (args[0] || '').toLowerCase();
        const current = config[chatId] ? '🟢 Activé' : '🔴 Désactivé';

        if (!action) {
            return await sock.sendMessage(chatId, {
                text: `🛡️ *${name} :* ${current}\n\n💡 ${name} on  |  ${name} off`
            }, { quoted: message });
        }

        config[chatId] = action === 'on';
        saveConfig(config);

        await sock.sendMessage(chatId, {
            text: `🛡️ *${name} :* ${action === 'on' ? '🟢 Activé' : '🔴 Désactivé'}`
        }, { quoted: message });
    }

    async function detect(sock, chatId, senderId, message, text) {
        try {
            const config = getConfig();
            if (!config[chatId]) return false;
            if (!text) return false;
            const lower = text.toLowerCase();
            const hit = keywords.some(k => lower.includes(k));
            if (!hit) return false;

            await sock.sendMessage(chatId, { delete: message.key }).catch(() => {});
            await sock.sendMessage(chatId, {
                text: `🚫 @${senderId.split('@')[0]} ${warnText}`,
                mentions: [senderId]
            });
            return true;
        } catch {
            return false;
        }
    }

    return { command, detect };
}

module.exports = createKeywordFilter;
