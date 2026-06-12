require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Convert ET time to Bangladesh time (ET + 10 hours)
function toBDT(dateStr, etTime) {
    const isPM = etTime.includes('PM');
    const isAM = etTime.includes('AM');
    let [hourMin] = etTime.split(' ');
    let [hour, min] = hourMin.split(':').map(Number);
    if (isPM && hour !== 12) hour += 12;
    if (isAM && hour === 12) hour = 0;
    const dt = new Date(`${dateStr}T${String(hour).padStart(2,'0')}:${String(min||0).padStart(2,'0')}:00-04:00`);
    return dt.toLocaleString('en-US', {
        timeZone: 'Asia/Dhaka',
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
}

const schedule = [
    { date:'2026-06-11', et:'3:00 PM', home:'🇲🇽 Mexico', away:'🇿🇦 South Africa', venue:'Mexico City' },
    { date:'2026-06-11', et:'10:00 PM', home:'🇰🇷 South Korea', away:'🇨🇿 Czechia', venue:'Zapopan' },
    { date:'2026-06-12', et:'3:00 PM', home:'🇨🇦 Canada', away:'🇧🇦 Bosnia & Herz.', venue:'Toronto' },
    { date:'2026-06-12', et:'9:00 PM', home:'🇺🇸 USA', away:'🇵🇾 Paraguay', venue:'Los Angeles' },
    { date:'2026-06-13', et:'3:00 PM', home:'🇶🇦 Qatar', away:'🇨🇭 Switzerland', venue:'Santa Clara' },
    { date:'2026-06-13', et:'6:00 PM', home:'🇧🇷 Brazil', away:'🇲🇦 Morocco', venue:'New York' },
    { date:'2026-06-13', et:'9:00 PM', home:'🇭🇹 Haiti', away:'🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland', venue:'Boston' },
    { date:'2026-06-14', et:'12:00 AM', home:'🇦🇺 Australia', away:'🇹🇷 Türkiye', venue:'Vancouver' },
    { date:'2026-06-14', et:'1:00 PM', home:'🇩🇪 Germany', away:'🇨🇼 Curaçao', venue:'Houston' },
    { date:'2026-06-14', et:'4:00 PM', home:'🇳🇱 Netherlands', away:'🇯🇵 Japan', venue:'Arlington' },
    { date:'2026-06-14', et:'7:00 PM', home:'🇨🇮 Ivory Coast', away:'🇪🇨 Ecuador', venue:'Philadelphia' },
    { date:'2026-06-14', et:'10:00 PM', home:'🇸🇪 Sweden', away:'🇹🇳 Tunisia', venue:'Monterrey' },
    { date:'2026-06-15', et:'12:00 PM', home:'🇪🇸 Spain', away:'🇨🇻 Cabo Verde', venue:'Atlanta' },
    { date:'2026-06-15', et:'3:00 PM', home:'🇧🇪 Belgium', away:'🇪🇬 Egypt', venue:'Seattle' },
    { date:'2026-06-15', et:'6:00 PM', home:'🇸🇦 Saudi Arabia', away:'🇺🇾 Uruguay', venue:'Miami' },
    { date:'2026-06-15', et:'9:00 PM', home:'🇮🇷 Iran', away:'🇳🇿 New Zealand', venue:'Los Angeles' },
    { date:'2026-06-16', et:'3:00 PM', home:'🇫🇷 France', away:'🇸🇳 Senegal', venue:'New York' },
    { date:'2026-06-16', et:'6:00 PM', home:'🇮🇶 Iraq', away:'🇳🇴 Norway', venue:'Boston' },
    { date:'2026-06-16', et:'9:00 PM', home:'🇦🇷 Argentina', away:'🇩🇿 Algeria', venue:'Kansas City' },
    { date:'2026-06-17', et:'12:00 AM', home:'🇦🇹 Austria', away:'🇯🇴 Jordan', venue:'Santa Clara' },
    { date:'2026-06-17', et:'1:00 PM', home:'🇵🇹 Portugal', away:'🇨🇩 DR Congo', venue:'Houston' },
    { date:'2026-06-17', et:'4:00 PM', home:'🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', away:'🇭🇷 Croatia', venue:'Arlington' },
    { date:'2026-06-17', et:'7:00 PM', home:'🇬🇭 Ghana', away:'🇵🇦 Panama', venue:'Toronto' },
    { date:'2026-06-17', et:'10:00 PM', home:'🇺🇿 Uzbekistan', away:'🇨🇴 Colombia', venue:'Mexico City' },
    { date:'2026-06-18', et:'12:00 PM', home:'🇨🇿 Czechia', away:'🇿🇦 South Africa', venue:'Atlanta' },
    { date:'2026-06-18', et:'3:00 PM', home:'🇨🇭 Switzerland', away:'🇧🇦 Bosnia & Herz.', venue:'Los Angeles' },
    { date:'2026-06-18', et:'6:00 PM', home:'🇨🇦 Canada', away:'🇶🇦 Qatar', venue:'Vancouver' },
    { date:'2026-06-18', et:'9:00 PM', home:'🇲🇽 Mexico', away:'🇰🇷 South Korea', venue:'Zapopan' },
    { date:'2026-06-19', et:'3:00 PM', home:'🇺🇸 USA', away:'🇦🇺 Australia', venue:'Seattle' },
    { date:'2026-06-19', et:'6:00 PM', home:'🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland', away:'🇲🇦 Morocco', venue:'Boston' },
    { date:'2026-06-19', et:'8:30 PM', home:'🇧🇷 Brazil', away:'🇭🇹 Haiti', venue:'Philadelphia' },
    { date:'2026-06-19', et:'11:00 PM', home:'🇹🇷 Türkiye', away:'🇵🇾 Paraguay', venue:'Santa Clara' },
    { date:'2026-06-20', et:'1:00 PM', home:'🇳🇱 Netherlands', away:'🇸🇪 Sweden', venue:'Houston' },
    { date:'2026-06-20', et:'4:00 PM', home:'🇩🇪 Germany', away:'🇨🇮 Ivory Coast', venue:'Toronto' },
    { date:'2026-06-20', et:'8:00 PM', home:'🇪🇨 Ecuador', away:'🇨🇼 Curaçao', venue:'Kansas City' },
    { date:'2026-06-21', et:'12:00 AM', home:'🇹🇳 Tunisia', away:'🇯🇵 Japan', venue:'Monterrey' },
    { date:'2026-06-21', et:'12:00 PM', home:'🇪🇸 Spain', away:'🇸🇦 Saudi Arabia', venue:'Atlanta' },
    { date:'2026-06-21', et:'3:00 PM', home:'🇧🇪 Belgium', away:'🇮🇷 Iran', venue:'Los Angeles' },
    { date:'2026-06-21', et:'6:00 PM', home:'🇺🇾 Uruguay', away:'🇨🇻 Cabo Verde', venue:'Miami' },
    { date:'2026-06-21', et:'9:00 PM', home:'🇳🇿 New Zealand', away:'🇪🇬 Egypt', venue:'Vancouver' },
    { date:'2026-06-22', et:'1:00 PM', home:'🇦🇷 Argentina', away:'🇦🇹 Austria', venue:'Arlington' },
    { date:'2026-06-22', et:'5:00 PM', home:'🇫🇷 France', away:'🇮🇶 Iraq', venue:'Philadelphia' },
    { date:'2026-06-22', et:'8:00 PM', home:'🇳🇴 Norway', away:'🇸🇳 Senegal', venue:'New York' },
    { date:'2026-06-22', et:'11:00 PM', home:'🇯🇴 Jordan', away:'🇩🇿 Algeria', venue:'Santa Clara' },
    { date:'2026-06-23', et:'1:00 PM', home:'🇵🇹 Portugal', away:'🇺🇿 Uzbekistan', venue:'Kansas City' },
    { date:'2026-06-23', et:'4:00 PM', home:'🇨🇴 Colombia', away:'🇨🇩 DR Congo', venue:'Miami' },
    { date:'2026-06-23', et:'7:00 PM', home:'🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', away:'🇬🇭 Ghana', venue:'Boston' },
    { date:'2026-06-23', et:'10:00 PM', home:'🇵🇦 Panama', away:'🇭🇷 Croatia', venue:'Los Angeles' },
    { date:'2026-06-24', et:'3:00 PM', home:'🇨🇭 Switzerland', away:'🇨🇦 Canada', venue:'Vancouver' },
    { date:'2026-06-24', et:'3:00 PM', home:'🇧🇦 Bosnia & Herz.', away:'🇶🇦 Qatar', venue:'Los Angeles' },
    { date:'2026-06-24', et:'9:00 PM', home:'🇰🇷 South Korea', away:'🇿🇦 South Africa', venue:'Atlanta' },
    { date:'2026-06-24', et:'9:00 PM', home:'🇨🇿 Czechia', away:'🇲🇽 Mexico', venue:'Mexico City' },
    { date:'2026-06-25', et:'3:00 PM', home:'🇪🇨 Ecuador', away:'🇩🇪 Germany', venue:'Philadelphia' },
    { date:'2026-06-25', et:'3:00 PM', home:'🇨🇼 Curaçao', away:'🇨🇮 Ivory Coast', venue:'Houston' },
    { date:'2026-06-25', et:'9:00 PM', home:'🇹🇳 Tunisia', away:'🇳🇱 Netherlands', venue:'Monterrey' },
    { date:'2026-06-25', et:'9:00 PM', home:'🇯🇵 Japan', away:'🇸🇪 Sweden', venue:'Houston' },
    { date:'2026-06-26', et:'3:00 PM', home:'🇺🇾 Uruguay', away:'🇪🇸 Spain', venue:'Miami' },
    { date:'2026-06-26', et:'3:00 PM', home:'🇨🇻 Cabo Verde', away:'🇸🇦 Saudi Arabia', venue:'Atlanta' },
    { date:'2026-06-26', et:'9:00 PM', home:'🇳🇴 Norway', away:'🇫🇷 France', venue:'New York' },
    { date:'2026-06-26', et:'9:00 PM', home:'🇸🇳 Senegal', away:'🇮🇶 Iraq', venue:'Boston' },
    { date:'2026-06-27', et:'3:00 PM', home:'🇧🇪 Belgium', away:'🇪🇬 Egypt', venue:'Seattle' },
    { date:'2026-06-27', et:'3:00 PM', home:'🇮🇷 Iran', away:'🇳🇿 New Zealand', venue:'Los Angeles' },
    { date:'2026-06-27', et:'9:00 PM', home:'🇩🇿 Algeria', away:'🇦🇹 Austria', venue:'Kansas City' },
    { date:'2026-06-27', et:'9:00 PM', home:'🇯🇴 Jordan', away:'🇦🇷 Argentina', venue:'Los Angeles' },
];

function getTodayStr() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
}

function getTomorrowStr() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
}

function getWeekDates() {
    const dates = [];
    const d = new Date();
    for (let i = 0; i < 7; i++) {
        const copy = new Date(d);
        copy.setDate(d.getDate() + i);
        dates.push(copy.toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' }));
    }
    return dates;
}

function formatMatches(matches, label) {
    if (matches.length === 0) return `📅 ${label}\n\nNo matches scheduled.`;
    let msg = `📅 ${label}\n\n`;
    matches.forEach(m => {
        const bdt = toBDT(m.date, m.et);
        msg += `${m.home} vs ${m.away}\n🕐 ${bdt}\n🏟️ ${m.venue}\n\n`;
    });
    return msg.trim();
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('📱 Scan QR code!');
});

client.on('ready', () => {
    console.log('✅ WhatsApp connected!');
});

client.on('message', async (msg) => {
    const body = msg.body.trim().toLowerCase();
    console.log('Message:', body);

    if (body === '/wc') {
        await msg.reply(
`🏆 FIFA World Cup 2026
All times in 🇧🇩 Bangladesh time!

1️⃣ Today's Matches
2️⃣ Tomorrow's Matches
3️⃣ This Week's Matches

Reply with 1, 2 or 3`
        );
    }
    else if (body === '1') {
        const matches = schedule.filter(m => m.date === getTodayStr());
        await msg.reply(formatMatches(matches, "TODAY'S MATCHES"));
    }
    else if (body === '2') {
        const matches = schedule.filter(m => m.date === getTomorrowStr());
        await msg.reply(formatMatches(matches, "TOMORROW'S MATCHES"));
    }
    else if (body === '3') {
        const weekDates = getWeekDates();
        let reply = `📅 THIS WEEK'S MATCHES\n\n`;
        let found = false;
        weekDates.forEach(date => {
            const matches = schedule.filter(m => m.date === date);
            if (matches.length > 0) {
                found = true;
                matches.forEach(m => {
                    const bdt = toBDT(m.date, m.et);
                    reply += `${m.home} vs ${m.away}\n🕐 ${bdt}\n🏟️ ${m.venue}\n\n`;
                });
            }
        });
        if (!found) reply += 'No matches this week.';
        await msg.reply(reply.trim());
    }
});

client.initialize();