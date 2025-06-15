import User from '../cfg/schema.js';
import { decode, encode } from 'moha-tools-tokens';

const register = async(req, res) => {
    try {
        const { token, pid } = req.body;
    if (!token || !pid) {
        return res.json({ msg: 'Cilad ayaa dhacday, fadlan isku day markale.', error: 'Invalid token'});
    }
    const data = decode(token, pid);
    if (!data || typeof data !== 'object') {
        return res.json({ msg: 'Cilad ayaa dhacday, fadlan isku day markale.', error: 'No data in token'});
    }
    const {firstname, lastname, cb} = data;
    if (!(firstname || '').trim() && !(lastname || '').trim()) {
        return res.json({ msg: 'Fadlan geli magacaaga 1aad iyo magacaaga 2aad.'});
    }
    if (!cb) {
        return res.json({ msg: 'Fadlan aqbal xeerarka iyo shuruucda'});
    }
    const id = Math.floor(Math.random() * 10000000000);
    const user = await User.findOne({ id });
    if (user) {
        return res.json({ msg: 'Cilad ayaa dhacday, fadlan isku day markale.'});
    }
    function generatePass(length = 9) {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';

  const upperCount = Math.round(length * 0.4);
  const lowerCount = Math.round(length * 0.4);
  const numberCount = length - upperCount - lowerCount;

  let password = [];

  for (let i = 0; i < upperCount; i++) {
    password.push(upper[Math.floor(Math.random() * upper.length)]);
  }
  for (let i = 0; i < lowerCount; i++) {
    password.push(lower[Math.floor(Math.random() * lower.length)]);
  }
  for (let i = 0; i < numberCount; i++) {
    password.push(numbers[Math.floor(Math.random() * numbers.length)]);
  }

  password = password.sort(() => Math.random() - 0.5);

  return password.join('');
}   
  const pass = generatePass();
  const newUser = await User({
      id,
      firstname: firstname || '',
      lastname: lastname || '',
      password: encode(pass.trim(), { id, exp: 'non'})
  });
  
  await newUser.save();
  
  return res.json({ msg: 'Waad kuguulaysatay inaad isdiwaan geliso', id, password: pass, success: true});
    } catch(err) {
        return res.json({ msg: 'Cilad ayaa dhacday, fadlan isku day markale.', error: err});
    }
}

export default register;
