import User from '../cfg/schema.js';
import bot from '../server.js';
import path from 'path';
import fs from 'fs/promises';

const sendMsg = async(req, res) => {
    try {
        const { id, type, text } = req.body;
    const user = await User.findOne({ id: Number(id) });
    if (!user.thread_id) {
         const colors = [7322096, 16766590, 13338331, 9367192, 16749490, 16478047];
               const rc = Math.floor(Math.random() * colors.length);
               const ct = await bot.telegram.createForumTopic('-1002729351959', user.firstname || '' + user.lastname || '', { icon_color: colors[rc]});
               user.thread_id = ct.message_thread_id;               
     }
     await user.save();
    if (type === 'text') {
        bot.telegram.sendMessage('-1002729351959', text, { message_thread_id: user.thread_id});
    } else if (type === 'audio') {
        const localFilePath = path.join(process.cwd(), 'public/audio', req.file.filename);
        bot.telegram.sendVoice('-1002729351959', { source: localFilePath }, { message_thread_id: user.thread_id})
        .then(async() => {
         await fs.unlink(localFilePath);
        }).catch((err) => {
            console.log('error: ', err);
        });
    }    
    res.json({ success: true });
    } catch(err) {
        res.json({ msg: "An error occured", error: err});
    }    
}

const sendPhoto = async(req, res) => {
    try {
        const { id, text } = req.body;
    const user = await User.findOne({ id: Number(id) });
    if (!user.thread_id) {
         const colors = [7322096, 16766590, 13338331, 9367192, 16749490, 16478047];
               const rc = Math.floor(Math.random() * colors.length);
               const ct = await bot.telegram.createForumTopic('-1002729351959', user.firstname || '' + user.lastname || '', { icon_color: colors[rc]});
               user.thread_id = ct.message_thread_id;               
     }
     await user.save();
        const localFilePath = path.join(process.cwd(), 'public/photo', req.file.filename);
        bot.telegram.sendPhoto('-1002729351959', { source: localFilePath }, { message_thread_id: user.thread_id, caption: text})
        .then(async() => {
            await fs.unlink(localFilePath);
        }).catch((err) => {
            console.log('error: ', err)
        }); 
    res.json({ success: true });
    } catch(err) {
        res.json({ msg: "An error occured", error: err});
    }
}

export { sendMsg, sendPhoto };
