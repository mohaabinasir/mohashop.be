import User from '../cfg/schema.js';
import { decode, compare } from 'moha-tools-tokens';
import bot from '../server.js';

const buy = async(req, res) => {
    try {
        const { token, pid } = req.body;
    if (!token || !pid) {
        return res.json({ msg: 'Cilad ayaa dhacday, markale iskuday.', error: 'Invalid token'});
    }
    const data = decode(token, pid);
    if (!data || typeof data !== 'object') {
        return res.json({ msg: 'Cilad ayaa dhacday, markale iskuday.', error: 'No data in token'});
    }
    const {name, price, id, pubg_id, phone} = data;
    const user = await User.findOne({ id });
    if (!user) {
        return res.json({ msg: 'Cilad ayaa dhacday, markale iskuday.', id: typeof id + id});
    }
    const now = new Date();
     const time = now.toLocaleString('en-US', { timeZone: 'Africa/Mogadishu' });
    const dt = Date.now();
    user.requests.push({ pubg_id, phone, price, name, request_id: dt, status: 'waiting', date: time})    
    
     if (!user.thread_id) {
         const colors = [7322096, 16766590, 13338331, 9367192, 16749490, 16478047];
               const rc = Math.floor(Math.random() * colors.length);
               const ct = await bot.telegram.createForumTopic('-1002729351959', user.firstname || '' + user.lastname || '', { icon_color: colors[rc]});
               user.thread_id = ct.message_thread_id;               
     }
     
     await bot.telegram.sendMessage('-1002729351959', `<b>New user request:</b>\n\nID: ${user.id}\nUC: ${name}\nDate: ${time}\nPhone Number: ${phone}\nPubg ID: ${pubg_id}\nRequest ID: ${dt}`, { parse_mode: 'html', message_thread_id: user.thread_id, reply_markup: { inline_keyboard: [
             [{text: '✅ Approve', callback_data: `approve_${user.id}_${dt}`}, {text: '❌ Decline', callback_data: `decline_${user.id}_${dt}`}]
         ]}});
      await user.save();
      
  return res.json({ msg: 'Waad kuguulaysatay, codsigaaga waala diray.', success: true});
    } catch(err) {
        return res.json({ msg: 'Cilad ayaa dhacday, markale iskuday.', error: err});
    }
}

export default buy;
