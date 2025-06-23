import User from '../cfg/schema.js';

const getMsgs = async(req, res) => {
   try {      
    const { id } = req.body;
    
    if (!id) return res.json({ error: 'no_id'});
    const user = await User.findOne({ id: Number(id) });
    if (!user) return res.json({ error: 'no_user' });
    const messages = [...user.messages];
    user.messages = [];
    user.markModified('messages');
    await user.save();
    res.json({ messages: messages });
   } catch(err) {
       res.json({ msg: "An error occured", error: err});
   } 
}

export default getMsgs;
