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

const bot = new Telegraf(BOT_TOKEN);

const app = express();

connectDB();

app.use(express.json());
app.use(cors());

app.get('/', () => {
    res.send('Server is up!');
});

app.post('/register', register);
app.post('/login', login);
app.post('/buy', buy);
app.post('/requests', requests);

bot.start((ctx) => {
    ctx.reply(`Soo dhawoow ${ctx.from.first_name}, Taabo battanka hoose si aad ugu shid website-ka`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🛍 Shop', web_app: { url: 'https://mohashop.onrender.com'}}]
            ]
        }
    })
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
