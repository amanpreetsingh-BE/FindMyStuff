/* AES-258 decipher scheme (base64 -> utf8) to get env variables*/
const crypto = require("crypto");

var decipher = crypto.createDecipheriv(
  "AES-256-CBC",
  process.env.SERVICE_ENCRYPTION_KEY,
  process.env.SERVICE_ENCRYPTION_IV
);
var decrypted =
  decipher.update(
    Buffer.from(encrypted, "base64").toString("utf-8"),
    "base64",
    "utf8"
  ) + decipher.final("utf8");

const env = JSON.parse(decrypted);

/*
 * Description : Allow to find Mondial Relay point by CP
 * Level of credential : Private
 * Method : POST
 */
export default async function handler(req, res) {
  if (
    req.method === "POST" &&
    req.body.oob ===
      crypto
        .createHash("MD5")
        .update(`${req.body.id}${env.SS_API_KEY}`)
        .digest("hex")
  ) {
    const axios = require("axios");
    var parseString = require("xml2js").parseString;
    // check cp value --> TDB in V2
    const sec = md5(`BDTEST13BE${req.body.cp}30PrivateK`).toUpperCase();

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

    return axios
      .post("http://api.mondialrelay.com/Web_Services.asmx", xmls, {
        headers: { "Content-Type": "text/xml" },
      })
      .then((response) => {
        parseString(response.data, function (err, result) {
          res.status(200).json(result);
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(err.status || 500).end(err.message);
      });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
