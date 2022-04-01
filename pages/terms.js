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
export async function getServerSideProps({ locale }) {
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
          Les présentes conditions générales d'utilisation (dites « CGU ») ont
          pour objet l'encadrement juridique des modalités de mise à disposition
          du site et des services par findmystuff.io et de définir les
          conditions d’accès et d’utilisation des services par « l'Utilisateur
          ». Les présentes CGU sont accessibles sur le site à la rubrique « CGV
          et CGU ». <br />
          Les CGU doivent être acceptées par tout Utilisateur souhaitant accéder
          au site. Elles constituent le contrat entre le site et l'Utilisateur.
          L’accès au site par l’Utilisateur signifie son acceptation des
          présentes CGU. Il s’engage désormais à respecter les présentes
          conditions. Toute inscription ou utilisation du site implique
          l'acceptation sans aucune réserve ni restriction des présentes CGU par
          l’utilisateur. Lors de l'inscription sur le site via le Formulaire
          d’inscription, chaque utilisateur accepte expressément les présentes
          CGU en cochant la case précédant le texte suivant : « J'accepte les
          conditions générales et politique de confidentialité ». <br />
          En cas de non-acceptation des CGU stipulées dans le présent contrat,
          l'Utilisateur se doit de renoncer à l'accès des services proposés par
          le site. findmystuff.io se réserve le droit de modifier
          unilatéralement et à tout moment le contenu des présentes CGU.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 1 : Mentions légales
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          L'édition du site findmystuff.io est assurée par la Société
          FindMystuff de Bruxelles dont le siège social est situé chem. du
          Cyclotron 6, 1348 Ottignies-Louvain-la-Neuve, team@findmystuff.io.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 2 : Accès au site
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          L’Utilisateur non membre n'a pas accès aux services réservés. Pour
          cela, il doit s’inscrire en remplissant le formulaire. En acceptant de
          s’inscrire aux services réservés, l’Utilisateur membre s’engage à
          fournir des informations sincères et exactes concernant son état civil
          et ses coordonnées, notamment son adresse email. L’Utilisateur est
          responsable de la mise à jour des informations fournies. Il lui est
          précisé qu’il peut les modifier en se connectant à son espace membre.
          Pour accéder aux services, l’Utilisateur devra s'identifier à l'aide
          de son nom d’utilisateur et de son mot de passe qui lui seront
          communiqués après son inscription et qui sont strictement personnels.
          A ce titre, il s’en interdit toute divulgation. Dans le cas contraire,
          il restera seul responsable de l’usage qui en sera fait. L’Utilisateur
          pourra également solliciter sa désinscription en se rendant à la page
          dédiée sur son espace personnel ou envoyant un email à :
          team@findmystuff.io . Celle-ci sera effective dans un délai
          raisonnable. En cas de non respect des conditions générales de vente
          et/ou d’utilisation, le site findmystuff.io aura la possibilité de
          suspendre voire de fermer le compte d’un Utilisateur après mise en
          demeure adressée par voie électronique et restée sans effet. Toute
          suppression de compte, quel qu’en soit le motif, engendre la
          suppression pure et simple de toutes informations personnelles de
          l’Utilisateur. Tout événement dû à un cas de force majeure ayant pour
          conséquence un dysfonctionnement du site ou serveur et sous réserve de
          toute interruption ou modification en cas de maintenance, n'engage pas
          la responsabilité de findmystuff.io . Dans ces cas, l’Utilisateur
          accepte ainsi ne pas tenir rigueur à l’éditeur de toute interruption
          ou suspension de service, même sans préavis. L'Utilisateur a la
          possibilité de contacter le site par messagerie électronique à
          l’adresse email de l’éditeur communiqué à l'Article 1. Le Site est
          destiné aux internautes majeurs capables ou mineurs émancipés.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 3 : Service et retour de l’objet
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          Cette conformité sera toutefois sujette au bon accès à internet fixe
          et mobile disposant de zones de couvertures variables et dont nous ne
          connaissons pas les limites. FindMyStuff n’est pas une société
          d’assurance, le retour de l’objet à son propriétaire n’est donc pas
          entièrement garanti. Le retour est assuré uniquement dans le cas où le
          code qr est scanné et rapporté à un point relai collaborant avec la
          société. Dans le cas de la perte du produit, l’Acheteur bénéficie
          d’une première livraison gratuite. La fois suivante, le propriétaire
          devra s’acquitter de des frais correspondants à la livraison de
          l’objet. Le produit a été initialement conçu pour être accroché à un
          trousseau de clef, à un sac à dos ou sac à main, tout autre
          utilisation n’est pas appropriée pour ce service. Cette conformité
          sera toutefois sujette au bon accès à internet fixe et mobile
          disposant de zones de couvertures variables et dont nous ne
          connaissons pas les limites.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 4 : QR code
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          Le client est responsable de la dégradation du QR code. Dans le cas où
          le code n’est pas scannable par aucun appareil, L’Acheteur doit
          envoyer une demande par le mail à team@findmystuff.io afin qu’un
          nouveau produit lui soit envoyé. Toute duplication, réutilisation ou
          recyclage du code qr d’un produit est formellement interdit de la part
          de l’Acheteur, client du produit.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 5 : Produit mis en vente sur le site
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          Le produit FindMyStuff proposé à la vente est uniquement celui
          figurant sur le Site au jour de votre consultation; le site indiquera
          clairement si le produit est ou n’est pas disponible en stock. Compte
          tenu du nombre important de demandes de FindMyStuff, nous ne pouvons
          pas garantir la disponibilité du produit lors de votre commande. Nous
          faisons nos meilleurs efforts pour montrer et décrire le produit mis
          en vente de la manière la plus fidèle possible en respectant ses
          coloris, dimensions et proportions. Les photographies, vidéos, les
          textes et toute autre description du produit FindMyStuff peuvent
          toutefois ne pas rendre parfaitement compte de leur véritable aspect.
          Vous savez que la vente à distance, compte tenu des contraintes
          techniques y afférentes, ne peut remplacer un contact physique avec
          nos produits. Les prix en vigueur, exprimés toutes taxes comprises en
          Euros, sont ceux mentionnés sur le Site au moment de la commande. Ces
          prix peuvent changer à tout moment. FindMyStuff désert son service au
          sein du territoire belge. Toute transaction provenant d’un pays
          extérieur sera retournée.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 6 : Retour des produits FindMyStuff non conformes et droit de
          rétractation
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          A la réception de la commande, vous devrez vérifier la conformité des
          produit reçus en exécution de votre commande. <br /> <br />
          6.1. Délivrance non conforme <br /> <br />
          Nous faisons les meilleures diligences pour vous livrer nos produits
          FindMyStuff. conformes, au sens des dispositions du Code de la
          consommation. Toutefois, nous ne pouvons prévenir une éventuelle
          délivrance non-conforme. En cas de non-conformité majeure, vous devez
          nous le notifier à l’adresse email team@findmystuff.io et retourner le
          produit non conforme (article abîmé, colis endommagé …) au Service
          Client. Au-delà de ce délai de 14 jours, les réclamations pour
          délivrance non conforme ne seront plus recevables et nous ne serons
          pas tenus de procéder à une nouvelle livraison. En cas de retours
          anormaux ou abusifs, nous pourrons refuser de servir une commande
          ultérieure. <br /> <br />
          6.2 Droit de rétractation <br /> <br />
          Vous disposez d’un délai de quatorze (14) jours à compter de la date
          de réception pour nous signaler votre décision de rétractation. Vous
          devez retourner le produits au plus tard dans un délai de quatorze
          (14) jours à compter de la communication de votre décision de vous
          rétracter et supportez les frais de renvoie du produit. <br /> <br />
          6.3 Modalités de retours
          <br /> <br />
          En cas d’article non conforme ou d’exercice du droit de rétractation,
          le retour du produit doit intervenir dans son conditionnement initial,
          en parfait état, accompagné du justificatif de commande, sans que
          l’article n’ait été utilisé ni ouvert, à l’adresse postale indiquée à
          l’article 1.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 7 : Données personnelles
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          Le site assure à l'Utilisateur une collecte et un traitement
          d'informations personnelles dans le respect de la vie privée
          conformément à la loi relative à l'informatique, aux fichiers et aux
          libertés. L'Utilisateur dispose d'un droit d'accès, de rectification,
          de suppression et d'opposition de ses données personnelles.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 8 : Propriété intellectuelle
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          Les marques, logos, signes ainsi que tous les contenus du site
          (textes, images, son...) font l'objet d'une protection par le Code de
          la propriété intellectuelle et plus particulièrement par le droit
          d'auteur. La marque FindMyStuff est une marque déposée par l’équipe de
          findmystuff.io.Toute représentation et/ou reproduction et/ou
          exploitation partielle ou totale de cette marque, de quelque nature
          que ce soit, est totalement prohibée. L'Utilisateur doit solliciter
          l'autorisation préalable du site pour toute reproduction, publication,
          copie des différents contenus. Il s'engage à une utilisation des
          contenus du site dans un cadre strictement privé, toute utilisation à
          des fins commerciales et publicitaires est strictement interdite.
          Toute représentation totale ou partielle de ce site par quelque
          procédé que ce soit, sans l’autorisation expresse de l’exploitant du
          site Internet constituerait une contrefaçon sanctionnée par le Code de
          la propriété intellectuelle. Il est rappelé dans le Code de propriété
          intellectuelle que l’Utilisateur qui reproduit, copie ou publie le
          contenu protégé doit citer l’auteur et sa source.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 9 : Responsabilité
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          Les sources des informations diffusées sur le site findmystuff.io sont
          réputées fiables mais le site ne garantit pas qu’il soit exempt de
          défauts, d’erreurs ou d’omissions. Les informations communiquées sont
          présentées à titre indicatif et général sans valeur contractuelle.
          Malgré des mises à jour régulières, le site findmystuff.io ne peut
          être tenu responsable de la modification des dispositions
          administratives et juridiques survenant après la publication. De même,
          le site ne peut être tenue responsable de l’utilisation et de
          l’interprétation de l’information contenue dans ce site. L'Utilisateur
          s'assure de garder son mot de passe secret. Toute divulgation du mot
          de passe, quelle que soit sa forme, est interdite. Il assume les
          risques liés à l'utilisation de son identifiant et mot de passe. Le
          site décline toute responsabilité. Le site findmystuff.io ne peut être
          tenu pour responsable d’éventuels virus qui pourraient infecter
          l’ordinateur ou tout matériel informatique de l’Internaute, suite à
          une utilisation, à l’accès, ou au téléchargement provenant de ce site.
          La responsabilité du site ne peut être engagée en cas de force majeure
          ou du fait imprévisible et insurmontable d'un tiers.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 10 : Liens hypertextes
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          Des liens hypertextes peuvent être présents sur le site. L’Utilisateur
          est informé qu’en cliquant sur ces liens, il sortira du site
          findmystuff.io. Ce dernier n’a pas de contrôle sur les pages web sur
          lesquelles aboutissent ces liens et ne saurait, en aucun cas, être
          responsable de leur contenu.
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 11 : Cookies
        </h2>
        <p className="  font-medium mb-5 py-3 px-3">
          Les cookies sont de petits fichiers stockés temporairement sur le
          disque dur de l’ordinateur de l’Utilisateur par votre navigateur et
          qui sont nécessaires à l’utilisation du site findmystuff.io. Les
          cookies ne contiennent pas d’information personnelle et ne peuvent pas
          être utilisés pour identifier quelqu’un. Un cookie contient un
          identifiant unique, généré aléatoirement et donc anonyme. Certains
          cookies expirent à la fin de la visite de l’Utilisateur, d’autres
          restent. L’information contenue dans les cookies est utilisée pour
          améliorer le site, par exemple en :
          <ul>
            <li>
              permettant à un service de reconnaître l’appareil de
              l’Utilisateur, pour qu’il n’ait pas à donner les mêmes
              informations à plusieurs reprises, par exemple remplir un
              formulaire ou une enquête.
            </li>
            <li>
              mémorisant que vous l’Utilisateur a déjà donné ses identifiant et
              mot de passe, pour ne pas avoir à le refaire à chaque nouvelle
              page.
            </li>
            <li>
              surveillant comment les utilisateurs se servent des services, pour
              les rendre plus simples d’utilisation et allouer suffisamment de
              puissance pour s’assurer de leur réactivité.
            </li>
            <li>
              analysant des données « anonymisées » pour aider à comprendre
              comment les utilisateurs interagissent avec les différents aspects
              des services en ligne et donc permettre de les améliorer.
            </li>
          </ul>
        </p>
        <h2 className=" bg-[#1B212E] rounded-lg text-lg sm:text-xl font-semibold mb-5 py-3 px-3">
          Article 12 : Droit applicable et juridiction compétente{" "}
        </h2>
        <p className="font-medium mb-5 py-3 px-3">
          La législation belge s'applique au présent contrat. En cas d'absence
          de résolution amiable d'un litige né entre les parties, les tribunaux
          belges seront seuls compétents pour en connaître. Pour toute question
          relative à l’application des présentes CGU, vous pouvez joindre
          l’éditeur aux coordonnées inscrites à l’Article 1.
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
