import User from '../cfg/schema.js';
import { decode } from 'moha-tools-tokens';

const requests = async(req, res) => {
    try {
        const { token, pid } = req.body;
    if (!token || !pid) {
        return res.json({ msg: 'An error occured, Try again.', error: 'Invalid token'});
    }
    const data = decode(token, pid);
    if (!data || typeof data !== 'object') {
        return res.json({ msg: 'An error occured, Try again.', error: 'No data in token'});
    }
    const {id } = data;
    if (!(id || '').trim()) {
        return res.json({ msg: 'Invalid ID'});
    }
    const user = await User.findOne({ id: Number(id) });
    if (!user) {
        return res.json({ msg: 'User not found, please register.', id: typeof id + id});
    }
  
  return res.json({ msg: 'Successfuly', success: true, requests: user.requests || []});
  
    } catch(err) {
        return res.json({ msg: 'An error occured, Try again.', error: err});
    }
}

export default requests;
