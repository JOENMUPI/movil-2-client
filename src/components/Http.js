const url = 'http://192.168.1.105:8000/'
const headers = { 'Content-Type': 'application/json' }


const send = async (method, endpoint, body) => { 
    const response = await fetch(url + endpoint , { method, mode: 'cors', headers, body: JSON.stringify(body) });
    
    return await response.json(); 
}

export default {
    send
}