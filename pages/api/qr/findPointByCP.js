export default async function handler(req, res) {
    if (req.method === 'POST' && req.body.authorization == process.env.NEXT_PUBLIC_API_KEY) {
        const axios = require("axios")
        const md5 = require("md5")
        var parseString = require('xml2js').parseString

        const sec = md5(`BDTEST13BE${req.body.cp}30PrivateK`).toUpperCase()
        
        let xmls = `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"> \
                    <soap12:Body> \
                        <WSI4_PointRelais_Recherche xmlns="http://www.mondialrelay.fr/webservice/"> \
                        <Enseigne>BDTEST13</Enseigne> \
                        <Pays>BE</Pays> \
                        <NumPointRelais></NumPointRelais> \
                        <Ville></Ville> \
                        <CP>${req.body.cp}</CP> \
                        <Latitude></Latitude> \
                        <Longitude></Longitude> \
                        <Taille></Taille> \
                        <Poids></Poids> \
                        <Action></Action> \
                        <DelaiEnvoi></DelaiEnvoi> \
                        <RayonRecherche></RayonRecherche> \
                        <TypeActivite></TypeActivite> \
                        <NACE></NACE> \
                        <NombreResultats>30</NombreResultats> \
                        <Security>${sec}</Security> \
                        </WSI4_PointRelais_Recherche> \
                    </soap12:Body> \
                    </soap12:Envelope>`;
        
        return axios.post('http://api.mondialrelay.com/Web_Services.asmx', xmls,
        {headers:
            {'Content-Type': 'text/xml'}
        }).then(response=>{
            parseString(response.data, function (err, result) {
                res.status(200).json(result)
            });
        }).catch(err=>{
            console.log(err)
            res.status(err.status || 500).end(err.message)
        });
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}