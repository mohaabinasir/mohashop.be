import User from '../cfg/schema.js';
import { decode, compare } from 'moha-tools-tokens';

const login = async(req, res) => {
    try {
        const { token, pid } = req.body;
    if (!token || !pid) {
        return res.json({ msg: 'Cilad ayaa dhacday, fadlan isku day markale.', error: 'Invalid token'});
    }
    const data = decode(token, pid);
    if (!data || typeof data !== 'object') {
        return res.json({ msg: 'Cilad ayaa dhacday, fadlan isku day markale.', error: 'No data in token'});
    }
    const {password, id, cb} = data;
    if (!id && !(password || '').trim()) {
        return res.json({ msg: 'Fadlan geli id-gaaga iyo password-kaaga'});
    }
    if (!cb) {
        return res.json({ msg: 'Fadlan aqbal xeerarka iyo shuruucda', no_cp: true});
    }
    const user = await User.findOne({ id });
    if (!user) {
        return res.json({ msg: 'Waxaad soo qortay id khaldan, markale isku day.', id: typeof id + id});
    }
    const isCorrect = compare(user.password, password, user.id);
    if (!isCorrect) {
        return res.json({ msg: 'Waxaad khaladay password-ka.'});
    }
  
  return res.json({ msg: 'Waad ku guulaysatay', success: true, fullname: user.firstname + ' ' + user.lastname});
    } catch(err) {
        return res.json({ msg: 'Cilad ayaa dhacday, fadlan isku day markale.', error: err});
    }
}

export default login;
