import { ACCOUNT_DELETION_RETENTION_DAYS } from "@subly/shared";

export type LegalDocumentId =
  | "faq"
  | "terms"
  | "legal"
  | "privacy"
  | "rights"
  | "retention"
  | "permissions";

export type LegalDocumentSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocumentDefinition = {
  id: LegalDocumentId;
  title: string;
  subtitle: string;
  sections: LegalDocumentSection[];
};

const LEGAL_IDENTITY = {
  appName: "Subly",
  editorName: "Subly",
  publicationDirector: "Equipe produit Subly",
  legalEmail: "legal@subly.app",
  privacyEmail: "privacy@subly.app",
  supportEmail: "support@subly.app",
  editorialAddress: "Adresse editoriale a completer avant mise en production publique.",
  hostingProvider: "Google Firebase / Google Cloud",
  hostingContact: "https://firebase.google.com/support",
  lastUpdated: "18/03/2026"
} as const;

export const LEGAL_DOCUMENT_ORDER: LegalDocumentId[] = [
  "faq",
  "terms",
  "legal",
  "privacy",
  "rights",
  "retention",
  "permissions"
];

export const LEGAL_DOCUMENTS: Record<LegalDocumentId, LegalDocumentDefinition> = {
  faq: {
    id: "faq",
    title: "FAQ",
    subtitle: "Reponses rapides aux questions les plus frequentes sur l'usage de Subly et la gestion du compte.",
    sections: [
      {
        title: "Compte et connexion",
        bullets: [
          "Si tu as oublie ton mot de passe, utilise l'option de reinitialisation sur l'ecran de connexion.",
          "Tu peux changer ton mot de passe directement depuis les reglages, dans la rubrique securite du compte.",
          "Si ton compte est en attente de suppression, l'acces est bloque jusqu'a la suppression definitive."
        ]
      },
      {
        title: "Abonnements et rappels",
        bullets: [
          "Tu peux ajouter un abonnement manuellement depuis le catalogue ou en mode personnalise.",
          "Les rappels de paiement, de fin d'essai et certaines alertes peuvent etre actives ou desactivees dans les reglages.",
          "Les frequences hebdomadaire, mensuelle, trimestrielle et annuelle sont prises en charge."
        ]
      },
      {
        title: "Services inclus et abonnements lies",
        bullets: [
          "Un abonnement peut inclure d'autres services lorsqu'ils sont compris dans l'offre principale.",
          "Les services lies apparaissent dans les listes avec une mention d'association, sans etre affiches dans les bulles interactives.",
          "Sur le plan gratuit, le nombre de services inclus par abonnement est limite. Le plan premium retire cette limite."
        ]
      },
      {
        title: "Suppression du compte",
        paragraphs: [
          `Quand tu demandes la suppression, le compte est desactive tout de suite puis archive pendant ${ACCOUNT_DELETION_RETENTION_DAYS} jours pour des raisons de securite.`,
          "A l'issue de ce delai, les donnees reliees au compte sont supprimees definitivement."
        ]
      },
      {
        title: "Support et donnees personnelles",
        bullets: [
          "Pour une question de support, tu peux utiliser l'adresse support indiquee dans les informations legales.",
          "Pour exercer un droit RGPD, utilise les coordonnees indiquees dans la rubrique donnees personnelles et droits RGPD.",
          "La FAQ complete les autres pages mais ne remplace pas les conditions d'utilisation, la politique de confidentialite ou les informations legales."
        ]
      }
    ]
  },
  terms: {
    id: "terms",
    title: "Conditions d'utilisation",
    subtitle: "Regles d'acces, d'usage et de responsabilite applicables a l'application.",
    sections: [
      {
        title: "Objet du service",
        paragraphs: [
          "Subly permet de centraliser, suivre et analyser des abonnements recurrents, leurs echeances, rappels et services inclus.",
          "L'application est fournie pour un usage personnel ou professionnel, sous reserve du respect des presentes conditions."
        ]
      },
      {
        title: "Acces au compte",
        bullets: [
          "L'utilisateur doit fournir des informations exactes lors de la creation du compte.",
          "L'utilisateur reste responsable de la confidentialite de ses identifiants.",
          "Toute utilisation frauduleuse, detournement technique ou tentative d'acces non autorise peut entrainer la suspension du compte."
        ]
      },
      {
        title: "Usage autorise",
        bullets: [
          "Ne pas utiliser le service pour contourner la loi, perturber la plateforme ou porter atteinte aux droits d'un tiers.",
          "Ne pas injecter de contenu malveillant, automatiser abusivement l'application ou essayer d'acceder aux donnees d'autres utilisateurs.",
          "Ne renseigner dans les notes et informations libres que des contenus necessaires a l'usage du service."
        ]
      },
      {
        title: "Disponibilite et evolution",
        paragraphs: [
          "Subly peut faire evoluer ses fonctionnalites, ses ecrans ou ses tarifs afin d'ameliorer le service, la securite ou la conformite.",
          "Une indisponibilite temporaire, une maintenance ou une mise a jour peuvent intervenir sans engager une obligation de disponibilite continue."
        ]
      },
      {
        title: "Propriete intellectuelle",
        paragraphs: [
          "L'interface, la structure, les textes originaux et l'identite visuelle de Subly restent proteges par les droits de propriete intellectuelle applicables.",
          "Les marques et logos de services tiers affiches dans l'application demeurent la propriete de leurs titulaires respectifs."
        ]
      },
      {
        title: "Fermeture et suppression",
        paragraphs: [
          `L'utilisateur peut demander la suppression de son compte depuis les reglages. Le compte est alors desactive et archive pendant ${ACCOUNT_DELETION_RETENTION_DAYS} jours pour des raisons de securite avant suppression definitive.`,
          "Subly peut egalement suspendre un compte en cas d'abus manifeste, de risque de securite ou d'obligation legale."
        ]
      }
    ]
  },
  legal: {
    id: "legal",
    title: "Informations legales",
    subtitle: "Identification de l'editeur, contact et hebergement du service.",
    sections: [
      {
        title: "Editeur du service",
        bullets: [
          `Nom du service : ${LEGAL_IDENTITY.appName}`,
          `Editeur : ${LEGAL_IDENTITY.editorName}`,
          `Directeur de publication : ${LEGAL_IDENTITY.publicationDirector}`,
          `Contact legal : ${LEGAL_IDENTITY.legalEmail}`,
          `Adresse editoriale : ${LEGAL_IDENTITY.editorialAddress}`
        ]
      },
      {
        title: "Hebergement et infrastructure",
        bullets: [
          `Fournisseur principal : ${LEGAL_IDENTITY.hostingProvider}`,
          `Support hebergeur : ${LEGAL_IDENTITY.hostingContact}`,
          "Les services d'authentification, base de donnees et fonctions serveur sont operes sur l'infrastructure technique Firebase / Google Cloud."
        ]
      },
      {
        title: "Contact",
        bullets: [
          `Support utilisateur : ${LEGAL_IDENTITY.supportEmail}`,
          `Protection des donnees : ${LEGAL_IDENTITY.privacyEmail}`,
          `Questions juridiques : ${LEGAL_IDENTITY.legalEmail}`
        ]
      },
      {
        title: "Mise a jour",
        paragraphs: [
          `Derniere mise a jour de ces informations : ${LEGAL_IDENTITY.lastUpdated}.`,
          "Les informations legales peuvent etre completees ou ajustees lors d'une mise en production publique, notamment pour les mentions editoriales definitives."
        ]
      }
    ]
  },
  privacy: {
    id: "privacy",
    title: "Politique de confidentialite",
    subtitle: "Quelles donnees sont traitees, pourquoi et sur quelle base.",
    sections: [
      {
        title: "Categories de donnees traitees",
        bullets: [
          "Donnees de compte : email, nom d'affichage, identifiant utilisateur.",
          "Donnees fonctionnelles : abonnements, categories, frequence, prix, rappels, notes, services inclus, historiques relies au compte.",
          "Preferences : devise, rappels, notifications et choix de configuration du compte.",
          "Donnees techniques necessaires au service : jetons de session, identifiants techniques lies a Firebase Auth et donnees strictement necessaires au fonctionnement."
        ]
      },
      {
        title: "Finalites et bases legales",
        bullets: [
          "Fournir l'espace utilisateur, synchroniser les abonnements et afficher les statistiques : execution du contrat.",
          "Envoyer ou preparer les rappels de paiement et d'essai : execution du contrat et interet legitime de bon fonctionnement.",
          "Proteger le compte, prevenir les acces non autorises et gerer les demandes de suppression : obligation legale et interet legitime de securite.",
          "Traiter les demandes liees aux droits RGPD et au support : obligation legale et interet legitime d'assistance."
        ]
      },
      {
        title: "Destinataires",
        paragraphs: [
          "Les donnees sont accessibles uniquement aux personnes habilitees pour l'exploitation de Subly ainsi qu'aux sous-traitants techniques necessaires au service.",
          "En l'etat du projet, les principaux services techniques utilises sont Firebase Authentication, Cloud Firestore, Cloud Functions et, si les notifications sont activees, Firebase Cloud Messaging."
        ]
      },
      {
        title: "Caractere obligatoire ou facultatif",
        bullets: [
          "L'email, le mot de passe et les informations minimales de compte sont necessaires pour creer et securiser l'espace utilisateur.",
          "Les donnees d'abonnement sont fournies par l'utilisateur pour permettre les rappels, les listes et les statistiques.",
          "Les notifications peuvent etre desactivees dans les reglages lorsque leur base repose sur un choix utilisateur."
        ]
      },
      {
        title: "Partage et transfert",
        paragraphs: [
          "Subly ne vend pas les donnees personnelles de ses utilisateurs.",
          "Des traitements techniques peuvent etre operes par des prestataires cloud. Lorsqu'un traitement implique un transfert hors de l'Union europeenne, il doit etre encadre par les mecanismes contractuels applicables."
        ]
      }
    ]
  },
  rights: {
    id: "rights",
    title: "Donnees personnelles et droits RGPD",
    subtitle: "Resume des droits et modalites d'exercice depuis l'application ou par contact.",
    sections: [
      {
        title: "Vos droits",
        bullets: [
          "Droit d'acces a vos donnees.",
          "Droit de rectification des informations inexactes.",
          "Droit a l'effacement dans les limites prevues par la loi.",
          "Droit a la limitation du traitement dans certains cas.",
          "Droit d'opposition lorsqu'un traitement repose sur l'interet legitime.",
          "Droit a la portabilite pour les donnees fournies par l'utilisateur et traitees de facon automatisee.",
          "Droit de retirer un consentement a tout moment lorsque le traitement repose sur ce consentement."
        ]
      },
      {
        title: "Comment exercer vos droits",
        bullets: [
          "Modifier ou corriger vos informations directement depuis l'application lorsque l'option existe.",
          `Contacter l'equipe via ${LEGAL_IDENTITY.privacyEmail} en precisant l'objet de la demande et l'adresse du compte concerne.`,
          "Demander la suppression du compte depuis les reglages lorsque vous souhaitez fermer l'espace utilisateur."
        ]
      },
      {
        title: "Delais de reponse",
        paragraphs: [
          "Les demandes liees aux droits RGPD doivent etre traitees dans les delais legaux applicables, en principe dans un delai d'un mois a compter de leur reception.",
          "Une verification d'identite peut etre demandee avant toute transmission ou suppression de donnees."
        ]
      },
      {
        title: "Recours",
        paragraphs: [
          "Si vous estimez que vos droits ne sont pas respectes, vous pouvez introduire une reclamation aupres de l'autorite de controle competente, notamment la CNIL en France."
        ]
      }
    ]
  },
  retention: {
    id: "retention",
    title: "Conservation des donnees et securite",
    subtitle: "Durees de conservation, suppression et mesures de protection appliquees au compte.",
    sections: [
      {
        title: "Conservation courante",
        bullets: [
          "Les donnees de compte et d'abonnement sont conservees tant que le compte reste actif et necessaire au service.",
          "Les preferences utilisateur et reglages restent associes au compte tant qu'il est utilise.",
          "Les donnees fonctionnelles sont supprimees avec le compte lorsqu'aucune conservation supplementaire n'est necessaire."
        ]
      },
      {
        title: "Suppression du compte",
        paragraphs: [
          `Apres une demande de suppression, le compte est desactive immediatement puis archive pendant ${ACCOUNT_DELETION_RETENTION_DAYS} jours pour des raisons de securite, de prevention des suppressions accidentelles et de traitement des contestations.`,
          "A l'issue de ce delai, les donnees reliees au compte sont supprimees definitivement par le processus de purge."
        ]
      },
      {
        title: "Securite",
        bullets: [
          "Authentification geree par Firebase Authentication.",
          "Acces API proteges par jetons d'authentification.",
          "Separation des donnees par identifiant utilisateur.",
          "Controles d'acces limites aux personnes habilitees et aux composants techniques necessaires au service."
        ]
      }
    ]
  },
  permissions: {
    id: "permissions",
    title: "Permissions, notifications et traceurs",
    subtitle: "Ce que l'application utilise concretement sur le terminal et a quelles fins.",
    sections: [
      {
        title: "Permissions applicatives",
        bullets: [
          "Aucune permission d'acces aux contacts, a la camera, au micro, a la geolocalisation ou aux photos n'est utilisee par defaut dans ce build.",
          "Le stockage local est utilise pour conserver l'etat de session et certaines preferences necessaires au fonctionnement de l'application."
        ]
      },
      {
        title: "Notifications",
        paragraphs: [
          "Les rappels de paiement, de fin d'essai et certaines alertes de suivi peuvent necessiter l'activation des notifications.",
          "Si les notifications push sont activees, un jeton technique peut etre traite afin d'acheminer les rappels vers l'appareil."
        ]
      },
      {
        title: "Traceurs et SDK",
        bullets: [
          "Aucun SDK publicitaire tiers n'est reference dans ce build.",
          "Aucun outil d'analytics marketing ou de profilage publicitaire n'est actuellement configure dans le depot.",
          "Les composants techniques Firebase utilises servent a l'authentification, a la base de donnees et aux fonctions serveur."
        ]
      },
      {
        title: "Evolutions futures",
        paragraphs: [
          "Si de nouvelles permissions terminal, de nouveaux SDK ou de nouveaux traitements optionnels sont ajoutes, Subly devra mettre a jour ces informations et, si necessaire, recueillir le consentement adequat avant activation."
        ]
      }
    ]
  }
};

export function getLegalDocument(documentId: LegalDocumentId) {
  return LEGAL_DOCUMENTS[documentId];
}
