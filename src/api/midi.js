import axios from 'axios'
import QS from 'qs';
export const getAPi = () => axios.get('http://www.suihanmusic.com:5001');

export const searchMidi = (baseUrl,data) => axios.post(`http://${baseUrl}:16007/search_midi`,  QS.stringify(data));

export const getMidiUrl = (path) => axios.get(`http://${sessionStorage.getItem('ipPath')}${path}`);