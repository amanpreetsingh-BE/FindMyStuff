/* React.js */
import { useState } from "react";
/* Next imports */
import Image from "next/image";

/* Custom components imports */
import NavReduced from "@components/navbar/NavReduced";
import FooterSection from "@components/index/FooterSection";

/* Translate imports */
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

/* Handle language */
export async function getStaticProps({ locale }) {
  const hostname = process.env.HOSTNAME;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["terms", "home"])),
      locale,
      hostname,
    },
  };
}

export default function Terms(props) {
  /* Handle language */
  const { t } = useTranslation();

  return (
    <main className="bg-primary text-white font-nxt">
      <NavReduced darkLogo={false} />

      <h1 className=" text-xl sm:text-2xl font-bold w-1/2 min-w-[300px] max-w-[640px] border-b-4 border-secondary flex items-end justify-end my-10">
        {t("terms:Heading1")}
      </h1>
      <div className="flex flex-col mx-10">
        <p className="  font-medium mb-5 py-3 px-3">
          {t("terms:cgvIntro1")} <br /> <br /> {t("terms:cgvIntro2")} <br />{" "}
          <br /> {t("terms:cgvIntro3")} <br /> <br /> {t("terms:cgvIntro4")}
          <br /> <br /> {t("terms:cgvIntro5")} <br /> <br />{" "}
          {t("terms:cgvIntro6")} <br /> <br /> {t("terms:cgvIntro7")}
          <br /> {t("terms:cgvIntro8")} <br /> {t("terms:cgvIntro9")} <br />{" "}
          {t("terms:cgvIntro10")}
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH1")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">{t("terms:cgvP1")}</p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH2")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">{t("terms:cgvP2")}</p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH3")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          {t("terms:cgvP3")} <br /> <br /> {t("terms:cgvP4")} <br /> <br />{" "}
          {t("terms:cgvP5")} <br /> <br /> {t("terms:cgvP6")}
          <br /> <br /> {t("terms:cgvP7")} <br /> <br /> {t("terms:cgvP8")}
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH4")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">{t("terms:cgvP9")}</p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH5")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          {t("terms:cgvP10")} <br /> <br /> {t("terms:cgvP11")} <br /> <br />{" "}
          {t("terms:cgvP12")} <br /> <br /> {t("terms:cgvP13")}
          <br /> <br /> {t("terms:cgvP14")}
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH6")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          {t("terms:cgvP18")} <br /> <br /> {t("terms:cgvP19")} <br /> <br />{" "}
          {t("terms:cgvP20")}
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH7")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          {t("terms:cgvP15")} <br /> <br /> {t("terms:cgvP16")} <br /> <br />{" "}
          {t("terms:cgvP17")}
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH8")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">{t("terms:cgvP21")}</p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH9")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          {t("terms:cgvP22")} <br /> <br /> {t("terms:cgvP23")}{" "}
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH10")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">{t("terms:cgvP24")}</p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH11")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">{t("terms:cgvP25")}</p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH12")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">{t("terms:cgvP26")}</p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH13")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">{t("terms:cgvP27")}</p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH14")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          {t("terms:cgvP28")} <br /> <br /> {t("terms:cgvP29")} <br /> <br />{" "}
          {t("terms:cgvP30")}
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH15")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">{t("terms:cgvP31")}</p>
        <ul className="  font-medium mb-5 px-12 list-disc">
          <li>{t("terms:cgvLi1")}</li>
          <li>{t("terms:cgvLi2")}</li>
          <li>{t("terms:cgvLi3")}</li>
        </ul>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH16")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">{t("terms:cgvP32")}</p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH17")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">{t("terms:cgvP33")}</p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH18")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">{t("terms:cgvP34")}</p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH19")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">{t("terms:cgvP35")}</p>
        <ul className="  font-medium mb-5 px-12 list-disc">
          <li>{t("terms:cgvLi4")}</li>
          <li>{t("terms:cgvLi5")}</li>
          <li>{t("terms:cgvLi6")}</li>
          <li>{t("terms:cgvLi7")}</li>
          <li>{t("terms:cgvLi8")}</li>
          <li>{t("terms:cgvLi9")}</li>
          <li>{t("terms:cgvLi10")}</li>
          <li>{t("terms:cgvLi11")}</li>
        </ul>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH20")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          {t("terms:cgvP36")} <br /> <br /> {t("terms:cgvP37")}
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          {t("terms:cgvH21")}
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          {t("terms:cgvP38")} <br /> <br /> {t("terms:cgvP39")} <br /> <br />{" "}
          {t("terms:cgvP40")} <br /> <br /> {t("terms:cgvP41")} <br /> <br />{" "}
          {t("terms:cgvP42")}
        </p>
        <ul className="  font-medium mb-5 px-12 list-decimal">
          <li>
            {t("terms:cgvLi12")}
            <ul className="  font-medium mb-5 px-12 list-disc">
              <li>{t("terms:cgvLii12")}</li>
              <li>{t("terms:cgvLiii12")}</li>
            </ul>
          </li>
          <li>{t("terms:cgvLi13")}</li>
        </ul>

        <p className="  font-medium mb-5 py-3 px-3">
          {t("terms:cgvP43")} <br /> <br /> {t("terms:cgvP44")}
        </p>
      </div>

      <h1 className=" text-xl sm:text-2xl font-bold w-1/2 min-w-[300px] max-w-[640px] border-b-4 border-secondary flex items-end justify-end my-10">
        {t("terms:Heading2")}
      </h1>

      <div className="flex flex-col mx-10">
        <p className="  font-medium mb-5 py-3 px-3">
          En vigueur au 15 Janvier 2022 <br />
          Les pr??sentes conditions g??n??rales d'utilisation (dites ?? CGU ??) ont
          pour objet l'encadrement juridique des modalit??s de mise ?? disposition
          du site et des services par findmystuff.io et de d??finir les
          conditions d???acc??s et d???utilisation des services par ?? l'Utilisateur
          ??. Les pr??sentes CGU sont accessibles sur le site ?? la rubrique ?? CGV
          et CGU ??. <br />
          Les CGU doivent ??tre accept??es par tout Utilisateur souhaitant acc??der
          au site. Elles constituent le contrat entre le site et l'Utilisateur.
          L???acc??s au site par l???Utilisateur signifie son acceptation des
          pr??sentes CGU. Il s???engage d??sormais ?? respecter les pr??sentes
          conditions. Toute inscription ou utilisation du site implique
          l'acceptation sans aucune r??serve ni restriction des pr??sentes CGU par
          l???utilisateur. Lors de l'inscription sur le site via le Formulaire
          d???inscription, chaque utilisateur accepte express??ment les pr??sentes
          CGU en cochant la case pr??c??dant le texte suivant : ?? J'accepte les
          conditions g??n??rales et politique de confidentialit?? ??. <br />
          En cas de non-acceptation des CGU stipul??es dans le pr??sent contrat,
          l'Utilisateur se doit de renoncer ?? l'acc??s des services propos??s par
          le site. findmystuff.io se r??serve le droit de modifier
          unilat??ralement et ?? tout moment le contenu des pr??sentes CGU.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 1 : Mentions l??gales
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          L'??dition du site findmystuff.io est assur??e par la Soci??t??
          FindMystuff de Bruxelles dont le si??ge social est situ?? chem. du
          Cyclotron 6, 1348 Ottignies-Louvain-la-Neuve, team@findmystuff.io.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 2 : Acc??s au site
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          L???Utilisateur non membre n'a pas acc??s aux services r??serv??s. Pour
          cela, il doit s???inscrire en remplissant le formulaire. En acceptant de
          s???inscrire aux services r??serv??s, l???Utilisateur membre s???engage ??
          fournir des informations sinc??res et exactes concernant son ??tat civil
          et ses coordonn??es, notamment son adresse email. L???Utilisateur est
          responsable de la mise ?? jour des informations fournies. Il lui est
          pr??cis?? qu???il peut les modifier en se connectant ?? son espace membre.
          Pour acc??der aux services, l???Utilisateur devra s'identifier ?? l'aide
          de son nom d???utilisateur et de son mot de passe qui lui seront
          communiqu??s apr??s son inscription et qui sont strictement personnels.
          A ce titre, il s???en interdit toute divulgation. Dans le cas contraire,
          il restera seul responsable de l???usage qui en sera fait. L???Utilisateur
          pourra ??galement solliciter sa d??sinscription en se rendant ?? la page
          d??di??e sur son espace personnel ou envoyant un email ?? :
          team@findmystuff.io . Celle-ci sera effective dans un d??lai
          raisonnable. En cas de non respect des conditions g??n??rales de vente
          et/ou d???utilisation, le site findmystuff.io aura la possibilit?? de
          suspendre voire de fermer le compte d???un Utilisateur apr??s mise en
          demeure adress??e par voie ??lectronique et rest??e sans effet. Toute
          suppression de compte, quel qu???en soit le motif, engendre la
          suppression pure et simple de toutes informations personnelles de
          l???Utilisateur. Tout ??v??nement d?? ?? un cas de force majeure ayant pour
          cons??quence un dysfonctionnement du site ou serveur et sous r??serve de
          toute interruption ou modification en cas de maintenance, n'engage pas
          la responsabilit?? de findmystuff.io . Dans ces cas, l???Utilisateur
          accepte ainsi ne pas tenir rigueur ?? l?????diteur de toute interruption
          ou suspension de service, m??me sans pr??avis. L'Utilisateur a la
          possibilit?? de contacter le site par messagerie ??lectronique ??
          l???adresse email de l?????diteur communiqu?? ?? l'Article 1. Le Site est
          destin?? aux internautes majeurs capables ou mineurs ??mancip??s.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 3 : Service et retour de l???objet
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          Cette conformit?? sera toutefois sujette au bon acc??s ?? internet fixe
          et mobile disposant de zones de couvertures variables et dont nous ne
          connaissons pas les limites. FindMyStuff n???est pas une soci??t??
          d???assurance, le retour de l???objet ?? son propri??taire n???est donc pas
          enti??rement garanti. Le retour est assur?? uniquement dans le cas o?? le
          code qr est scann?? et rapport?? ?? un point relai collaborant avec la
          soci??t??. Dans le cas de la perte du produit, l???Acheteur b??n??ficie
          d???une premi??re livraison gratuite. La fois suivante, le propri??taire
          devra s???acquitter de des frais correspondants ?? la livraison de
          l???objet. Le produit a ??t?? initialement con??u pour ??tre accroch?? ?? un
          trousseau de clef, ?? un sac ?? dos ou sac ?? main, tout autre
          utilisation n???est pas appropri??e pour ce service. Cette conformit??
          sera toutefois sujette au bon acc??s ?? internet fixe et mobile
          disposant de zones de couvertures variables et dont nous ne
          connaissons pas les limites.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 4 : QR code
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          Le client est responsable de la d??gradation du QR code. Dans le cas o??
          le code n???est pas scannable par aucun appareil, L???Acheteur doit
          envoyer une demande par le mail ?? team@findmystuff.io afin qu???un
          nouveau produit lui soit envoy??. Toute duplication, r??utilisation ou
          recyclage du code qr d???un produit est formellement interdit de la part
          de l???Acheteur, client du produit.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 5 : Produit mis en vente sur le site
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          Le produit FindMyStuff propos?? ?? la vente est uniquement celui
          figurant sur le Site au jour de votre consultation; le site indiquera
          clairement si le produit est ou n???est pas disponible en stock. Compte
          tenu du nombre important de demandes de FindMyStuff, nous ne pouvons
          pas garantir la disponibilit?? du produit lors de votre commande. Nous
          faisons nos meilleurs efforts pour montrer et d??crire le produit mis
          en vente de la mani??re la plus fid??le possible en respectant ses
          coloris, dimensions et proportions. Les photographies, vid??os, les
          textes et toute autre description du produit FindMyStuff peuvent
          toutefois ne pas rendre parfaitement compte de leur v??ritable aspect.
          Vous savez que la vente ?? distance, compte tenu des contraintes
          techniques y aff??rentes, ne peut remplacer un contact physique avec
          nos produits. Les prix en vigueur, exprim??s toutes taxes comprises en
          Euros, sont ceux mentionn??s sur le Site au moment de la commande. Ces
          prix peuvent changer ?? tout moment. FindMyStuff d??sert son service au
          sein du territoire belge. Toute transaction provenant d???un pays
          ext??rieur sera retourn??e.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 6 : Retour des produits FindMyStuff non conformes et droit de
          r??tractation
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          A la r??ception de la commande, vous devrez v??rifier la conformit?? des
          produit re??us en ex??cution de votre commande. <br /> <br />
          6.1. D??livrance non conforme <br /> <br />
          Nous faisons les meilleures diligences pour vous livrer nos produits
          FindMyStuff. conformes, au sens des dispositions du Code de la
          consommation. Toutefois, nous ne pouvons pr??venir une ??ventuelle
          d??livrance non-conforme. En cas de non-conformit?? majeure, vous devez
          nous le notifier ?? l???adresse email team@findmystuff.io et retourner le
          produit non conforme (article ab??m??, colis endommag?? ???) au Service
          Client. Au-del?? de ce d??lai de 14 jours, les r??clamations pour
          d??livrance non conforme ne seront plus recevables et nous ne serons
          pas tenus de proc??der ?? une nouvelle livraison. En cas de retours
          anormaux ou abusifs, nous pourrons refuser de servir une commande
          ult??rieure. <br /> <br />
          6.2 Droit de r??tractation <br /> <br />
          Vous disposez d???un d??lai de quatorze (14) jours ?? compter de la date
          de r??ception pour nous signaler votre d??cision de r??tractation. Vous
          devez retourner le produits au plus tard dans un d??lai de quatorze
          (14) jours ?? compter de la communication de votre d??cision de vous
          r??tracter et supportez les frais de renvoie du produit. <br /> <br />
          6.3 Modalit??s de retours
          <br /> <br />
          En cas d???article non conforme ou d???exercice du droit de r??tractation,
          le retour du produit doit intervenir dans son conditionnement initial,
          en parfait ??tat, accompagn?? du justificatif de commande, sans que
          l???article n???ait ??t?? utilis?? ni ouvert, ?? l???adresse postale indiqu??e ??
          l???article 1.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 7 : Donn??es personnelles
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          Le site assure ?? l'Utilisateur une collecte et un traitement
          d'informations personnelles dans le respect de la vie priv??e
          conform??ment ?? la loi relative ?? l'informatique, aux fichiers et aux
          libert??s. L'Utilisateur dispose d'un droit d'acc??s, de rectification,
          de suppression et d'opposition de ses donn??es personnelles.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 8 : Propri??t?? intellectuelle
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          Les marques, logos, signes ainsi que tous les contenus du site
          (textes, images, son...) font l'objet d'une protection par le Code de
          la propri??t?? intellectuelle et plus particuli??rement par le droit
          d'auteur. La marque FindMyStuff est une marque d??pos??e par l?????quipe de
          findmystuff.io.Toute repr??sentation et/ou reproduction et/ou
          exploitation partielle ou totale de cette marque, de quelque nature
          que ce soit, est totalement prohib??e. L'Utilisateur doit solliciter
          l'autorisation pr??alable du site pour toute reproduction, publication,
          copie des diff??rents contenus. Il s'engage ?? une utilisation des
          contenus du site dans un cadre strictement priv??, toute utilisation ??
          des fins commerciales et publicitaires est strictement interdite.
          Toute repr??sentation totale ou partielle de ce site par quelque
          proc??d?? que ce soit, sans l???autorisation expresse de l???exploitant du
          site Internet constituerait une contrefa??on sanctionn??e par le Code de
          la propri??t?? intellectuelle. Il est rappel?? dans le Code de propri??t??
          intellectuelle que l???Utilisateur qui reproduit, copie ou publie le
          contenu prot??g?? doit citer l???auteur et sa source.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 9 : Responsabilit??
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          Les sources des informations diffus??es sur le site findmystuff.io sont
          r??put??es fiables mais le site ne garantit pas qu???il soit exempt de
          d??fauts, d???erreurs ou d???omissions. Les informations communiqu??es sont
          pr??sent??es ?? titre indicatif et g??n??ral sans valeur contractuelle.
          Malgr?? des mises ?? jour r??guli??res, le site findmystuff.io ne peut
          ??tre tenu responsable de la modification des dispositions
          administratives et juridiques survenant apr??s la publication. De m??me,
          le site ne peut ??tre tenue responsable de l???utilisation et de
          l???interpr??tation de l???information contenue dans ce site. L'Utilisateur
          s'assure de garder son mot de passe secret. Toute divulgation du mot
          de passe, quelle que soit sa forme, est interdite. Il assume les
          risques li??s ?? l'utilisation de son identifiant et mot de passe. Le
          site d??cline toute responsabilit??. Le site findmystuff.io ne peut ??tre
          tenu pour responsable d?????ventuels virus qui pourraient infecter
          l???ordinateur ou tout mat??riel informatique de l???Internaute, suite ??
          une utilisation, ?? l???acc??s, ou au t??l??chargement provenant de ce site.
          La responsabilit?? du site ne peut ??tre engag??e en cas de force majeure
          ou du fait impr??visible et insurmontable d'un tiers.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 10 : Liens hypertextes
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          Des liens hypertextes peuvent ??tre pr??sents sur le site. L???Utilisateur
          est inform?? qu???en cliquant sur ces liens, il sortira du site
          findmystuff.io. Ce dernier n???a pas de contr??le sur les pages web sur
          lesquelles aboutissent ces liens et ne saurait, en aucun cas, ??tre
          responsable de leur contenu.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 11 : Cookies
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          Les cookies sont de petits fichiers stock??s temporairement sur le
          disque dur de l???ordinateur de l???Utilisateur par votre navigateur et
          qui sont n??cessaires ?? l???utilisation du site findmystuff.io. Les
          cookies ne contiennent pas d???information personnelle et ne peuvent pas
          ??tre utilis??s pour identifier quelqu???un. Un cookie contient un
          identifiant unique, g??n??r?? al??atoirement et donc anonyme. Certains
          cookies expirent ?? la fin de la visite de l???Utilisateur, d???autres
          restent. L???information contenue dans les cookies est utilis??e pour
          am??liorer le site, par exemple en :
          <ul>
            <li>
              permettant ?? un service de reconna??tre l???appareil de
              l???Utilisateur, pour qu???il n???ait pas ?? donner les m??mes
              informations ?? plusieurs reprises, par exemple remplir un
              formulaire ou une enqu??te.
            </li>
            <li>
              m??morisant que vous l???Utilisateur a d??j?? donn?? ses identifiant et
              mot de passe, pour ne pas avoir ?? le refaire ?? chaque nouvelle
              page.
            </li>
            <li>
              surveillant comment les utilisateurs se servent des services, pour
              les rendre plus simples d???utilisation et allouer suffisamment de
              puissance pour s???assurer de leur r??activit??.
            </li>
            <li>
              analysant des donn??es ?? anonymis??es ?? pour aider ?? comprendre
              comment les utilisateurs interagissent avec les diff??rents aspects
              des services en ligne et donc permettre de les am??liorer.
            </li>
          </ul>
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 12 : Droit applicable et juridiction comp??tente{" "}
        </h2>
        <p className="font-medium mb-5 py-3 px-3">
          La l??gislation belge s'applique au pr??sent contrat. En cas d'absence
          de r??solution amiable d'un litige n?? entre les parties, les tribunaux
          belges seront seuls comp??tents pour en conna??tre. Pour toute question
          relative ?? l???application des pr??sentes CGU, vous pouvez joindre
          l?????diteur aux coordonn??es inscrites ?? l???Article 1.
        </p>
      </div>
      {/* Footer */}
      <FooterSection
        useState={useState}
        t={t}
        Image={Image}
        hostname={props.hostname}
      />
    </main>
  );
}
