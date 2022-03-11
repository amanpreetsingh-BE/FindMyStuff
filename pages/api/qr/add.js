import * as admin from 'firebase-admin'
const serviceAccount = JSON.parse(Buffer.from(process.env.SECRET_SERVICE_ACCOUNT, 'base64'))

const app = !admin.apps.length ? admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }) : admin.app()
  
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const NumberQR = req.body.formNumberQR
        const allQR = []
        const newQR = []
        try {
            const qrCollection = await (await app.firestore().collection("QR").listDocuments()).forEach(doc => {
                allQR.push(doc.id)
            })
            
            for (let i = 0 ; i < NumberQR ; i++) {
                while(true){
                    var rs = randomString(8, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
                    if(!allQR.includes(rs)){
                        newQR.push(rs)
                        break;
                    }
                }
            }
            addQRtoDB(newQR)
            //generateNemesis()
            res.status(200).json({success:true, newQR: newQR})
        } catch (err) {
            console.log(err)
            res.status(err.statusCode || 500).json(err.message);
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}

function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function getInitialQR() {
    const arr1 = ["02OxiA61", "04XR4MwG", "09DMKbEI", "0C06NEbb", "0EwQi0Uq", "0FB6wFKV", "0GVnxqpl", "0JUhc5zD", "0JYGeykf", "0JxPS7dg", "0Kli1Ord", "0MNzGofi", "0O3uSW5z", "0VfSHZyr", "0aA8l1oT", "0fKjkjAn", "0gHTqryC", "0lXOM0UT", "0oPd19GA", "0p7AP8Sg", "0sUrgMEi", "0tr1KXoz", "0unq0jVw", "16M9Ales", "19Yrh4nN", "1C2GaYlU", "1UiQ4xzf", "1UqQlbUD", "1WGCRXGt", "1WYZ44Qq", "1XDjfsU8", "1ZdEokV6", "1bEWhmCi", "1flOJSP3", "1lHyTTC0", "1m8Jg6Vr", "1n61osck", "1rusTyOP", "1uJwBVFL", "1x0o5ZXw", "1xDFGw0x", "1ydbmCTV", "1yhUEkfG", "20BKXE0T", "22MO6Cdo", "26IE1VQ5", "2EWwWmyZ", "2HzIOuMm", "2ItX38l9", "2JBDX8HX"]
    const arr2 = ['2MCE68dR', '2PmcLViB', '2U5hFw36', '2UAJPs3H', '2UXX6x5v', '2UwyxcT3', '2YDFHYbD', '2ejw2t4C', '2haV5A3p', '2i1EIk3r', '2lURPMwt', '2m8Begsl', '2nUvR9Gc', '2nVm39yr', '2ndZIJA1', '2pMsUN5v', '2tcyws07', '2uRGWLPy', '2vfxKmP3', '2xEg5d5A', '2zVjhHsf', '332iG1ua', '33P17Zia', '33TrI8IE', '3GvWL9IE', '3MggE59X', '3bYD1WPc', '3dhgEXQS', '3exUZaHV', '3fgAq6nR', '3hMR4qk7', '3kBIErF3', '3ksDcdbS', '3llpC5Np', '3q0ALvI8', '3q9HZra9', '42VXLjNr', '441qY8ZY', '459gBSF4', '45NjI9xC', '47M9p5s0', '4839GJq6', '4CRt0Mna', '4DSPpafo', '4EPp7gDv', '4Nvfq1Kn', '4OvqKsQ9', '4PM7USzN', '4Xrv4l3f', '4abgc2KQ']
    const arr3 = ['4eN3xvMS', '4kvC0VdO', '4lSHJ0OA', '4lmwev2d', '4moFQgz3', '4rruNvRw', '4tu15V8n', '4wD4ruwW', '4weh0yme', '4xI7YDEY', '4yiiHaMH', '53JYWy2I', '555HcIT2', '5HGWasj0', '5HORuWO4', '5OSR3uP8', '5QjGgs5h', '5SwwaVjW', '5TPMt2ea', '5V4HFOHn', '5YuUaCTj', '5bGobkAD', '5cgVyL5C', '5eDuj5EU', '5fjhcAiB', '5iB11SXD', '5jQ1OcCP', '5jn8lDY6', '5l16ustX', '5m55VNcU', '5mSgegnh', '5nXoBP28', '5rKvhqAc', '5siXL6pg', '5tEAb9Rr', '5tugJOuw', '5uZmVuxi', '5utw2f2q', '5xQg3qv0', '67L0kSBP', '6ErMjHV2', '6FL31LiY', '6N1ghdAH', '6UJo15nk', '6ZYhCdb6', '6hfMOUpR', '6n9kZD6x', '6prp3QAh', '6rpEHUKG', '6uLFniWT']
    const initial = [...arr1, ...arr2, ...arr3]
    return initial
}

function addQRtoDB(arr) {
    arr.forEach(element => {
            app.firestore().collection("QR").doc(element).set({
                email: "",
                activate: false,
                relais: null,
                jetons: 1,
                timestamp: null,
                pdf: null,
            })
    });
}

/* First 150 QR nemesis QR codes */
function generateNemesis() {
    var N = getInitialQR()
    N.forEach(element => {
            app.firestore().collection("QR").doc(element).set({
                email: "",
                activate: false,
                relais: null,
                jetons: 1,
                timestamp: null,
                pdf: null,
            })
    });
}