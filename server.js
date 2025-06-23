import express from 'express';
import cors from 'cors';
import { PORT, BOT_TOKEN } from './cfg/config.js';
import connectDB from './cfg/db.js';
import register from './ctr/register.js';
import login from './ctr/login.js';
import { Telegraf } from 'telegraf';
import buy from './ctr/buy.js';
import User from './cfg/schema.js';
import requests from './ctr/requests.js';
import { sendPhoto, sendMsg } from './ctr/sendMsg.js';
import getMsgs from './ctr/getMsgs.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/audio/');
  },
  filename: function(req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const storage2 = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/photo/');
  },
  filename: function(req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });
const upload2 = multer({ storage: storage2 });

const bot = new Telegraf(BOT_TOKEN);

const app = express();

connectDB();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Server is up!');
});

app.post('/register', register);
app.post('/login', login);
app.post('/buy', buy);
app.post('/requests', requests);
app.post('/sendMsg',upload.single('file'), sendMsg);
app.post('/sendPhoto',upload2.single('file'), sendPhoto);
app.post('/getMsgs', getMsgs);

bot.start((ctx) => {
    ctx.reply(`Soo dhawoow ${ctx.from.first_name}, Taabo battanka hoose si aad ugu shid website-ka`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🛍 Shop', web_app: { url: 'https://mohashop.onrender.com'}}]
            ]
        }
    })
});

const memoryStore = new Map();

function session() {
  return async (ctx, next) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return next();

    const sessionData = memoryStore.get(chatId);
     if (sessionData) {
      ctx.session = sessionData.data;
    } else {
      ctx.session = {};
    }
     await next();
    memoryStore.set(chatId, {
      data: ctx.session,
    });
  };
};
bot.use(session());
bot.command('send', (ctx) => {
    if (ctx.chat.id !== -1002729351959) return;
    if (ctx.from.id !== 6623597406) return;
    ctx.session.send = true;
    ctx.reply('Send me msg to send this user.');
});

function gct() {
    return new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });
 }

bot.on('message', async(ctx) => {
    if (ctx.session.send) {
        const user = await User.findOne({ thread_id: ctx.message.message_thread_id });
        if (ctx.message.text) {
          user.messages.push({type: 'text', text: ctx.message.text, time: gct() });
        } else if (ctx.message.voice) {
        const fileLink = await ctx.telegram.getFileLink(ctx.message.voice.file_id);  
            user.messages.push({type: 'voice', url: fileLink.href, time: gct(), duration: ctx.message.voice.duration, rd: ctx.message.voice.duration });
        } else if (ctx.message.photo) {
            const photoArray = ctx.message.photo;
            const largestPhoto = photoArray[photoArray.length - 1];
            const fileLink = await ctx.telegram.getFileLink(largestPhoto.file_id);
            user.messages.push({type: 'photo', src: fileLink.href, time: gct(), text: ctx.message.caption });
        }
        
        await user.save();
        
        ctx.reply('message sent!');
    }
});

bot.action(/^approve_(\d+)_(\d+)$/, async (ctx) => {
try {
    const user_id = ctx.match[1];
    const req_id = ctx.match[2];
    const user = await User.findOne({ id: Number(user_id) });

    const index = user.requests.findIndex(r => r.request_id === Number(req_id));
    if (index !== -1) {
        user.requests[index].status = 'Approved';
        user.markModified('requests');
        await user.save();
        ctx.answerCbQuery('Request approved.');
        ctx.editMessageReplyMarkup();
         try {
     const originalText = ctx.update.callback_query.message.text;
     const updatedText = `${originalText}\n\n✅ Approved`;
     await ctx.editMessageText(updatedText, { parse_mode: 'HTML' });
     } catch (err) {
     console.error('Edit failed:', err.message);
     }
    } else {
       await ctx.answerCbQuery('Request not found.');
    }
} catch(err) {
    console.log('err: ', err);
}
});

bot.action(/^decline_(\d+)_(\d+)$/, async (ctx) => {
    try {
        const user_id = ctx.match[1];
    const req_id = ctx.match[2];
    const user = await User.findOne({ id: Number(user_id) });

    const index = user.requests.findIndex(r => r.request_id === Number(req_id));
    if (index !== -1) {
        user.requests[index].status = 'Declined';
        user.markModified('requests');
        await user.save();
        ctx.answerCbQuery('Request declined.');
        ctx.editMessageReplyMarkup();
         try {
     const originalText = ctx.update.callback_query.message.text;
     const updatedText = `${originalText}\n\n❌ Declined`;
      await ctx.editMessageText(updatedText, { parse_mode: 'HTML' });
     } catch (err) {
      console.error('Edit failed:', err.message);
     }   
     } else {   
        await ctx.answerCbQuery('Request not found.');
    }
    } catch(err) {
        console.log('err: ', err)
    }
});

process.on('uncaughtException', async(err) => {
   console.log(err);
   });
   
   process.on('unhandledRejection', async(reason, promise) => {
      console.log(reason)
   });

app.listen(PORT, () => console.log('running on port ' + PORT));

bot.launch();

export default bot;
