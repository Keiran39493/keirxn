// Site translations. English is the source text in the HTML; this file maps it to German, French and Italian.
// To add or fix a translation, edit a row: [English, Deutsch, Français, Italiano].
// The English must match the page text exactly (extra spaces/line breaks are ignored).
(function () {
  const LANGS = ["en", "de", "fr", "it"];
  const LOCALES = { en: "en-GB", de: "de-CH", fr: "fr-CH", it: "it-CH" };

  const ROWS = [
    // ---- Shared: nav, sidebar, footer ----
    ["Home", "Startseite", "Accueil", "Home"],
    ["Reviews", "Bewertungen", "Avis", "Recensioni"],
    ["Products", "Produkte", "Produits", "Prodotti"],
    ["Tools", "Tools", "Outils", "Strumenti"],
    ["AI Workflow", "KI-Workflow", "Workflow IA", "Workflow IA"],
    ["Services", "Dienstleistungen", "Services", "Servizi"],
    ["CV", "Lebenslauf", "CV", "CV"],
    ["Blog", "Blog", "Blog", "Blog"],
    ["System Engineer", "Systemingenieur", "Ingénieur système", "Ingegnere di sistema"],
    ["Cybersecurity · Artificial Intelligence · Networking", "Cybersicherheit · Künstliche Intelligenz · Netzwerke", "Cybersécurité · Intelligence artificielle · Réseaux", "Cybersicurezza · Intelligenza artificiale · Reti"],
    ["Follow", "Folgen", "Suivre", "Seguimi"],
    ["Get in touch", "Kontakt", "Contact", "Contatti"],
    ["Book a session", "Termin buchen", "Réserver une séance", "Prenota una sessione"],
    ["Email", "E-Mail", "E-mail", "E-mail"],
    ["Toggle theme", "Design wechseln", "Changer de thème", "Cambia tema"],
    ["Photo of Keiran Moores", "Foto von Keiran Moores", "Photo de Keiran Moores", "Foto di Keiran Moores"],
    ["Language", "Sprache", "Langue", "Lingua"],
    ["Main", "Hauptmenü", "Menu principal", "Menu principale"],

    // ---- Home ----
    ["Highlights", "Highlights", "Faits marquants", "In evidenza"],
    ["Worked as a System Engineer in MS365 administration and security.", "Tätig als Systemingenieur in MS365-Administration und IT-Sicherheit.", "Ingénieur système dans l'administration MS365 et la sécurité.", "Ingegnere di sistema nell'amministrazione MS365 e nella sicurezza."],
    ["Began my MSc in Information Systems at Universität Liechtenstein.", "Beginn meines MSc in Information Systems an der Universität Liechtenstein.", "Début de mon MSc en systèmes d'information à l'Université du Liechtenstein.", "Inizio del mio MSc in sistemi informativi presso l'Università del Liechtenstein."],
    ["Graduated with a BSc in Computer Science from Edith Cowan University.", "Abschluss des BSc in Informatik an der Edith Cowan University.", "Obtention de mon BSc en informatique à l'Edith Cowan University.", "Laurea (BSc) in informatica presso la Edith Cowan University."],
    ["Joined Optimove as an IT Specialist.", "Einstieg bei Optimove als IT-Spezialist.", "Arrivée chez Optimove en tant que spécialiste informatique.", "Ingresso in Optimove come specialista IT."],

    // ---- Shared form text ----
    ["Your name", "Ihr Name", "Votre nom", "Il suo nome"],
    ["Company", "Unternehmen", "Entreprise", "Azienda"],
    ["(optional)", "(optional)", "(facultatif)", "(facoltativo)"],
    ["Phone", "Telefon", "Téléphone", "Telefono"],
    ["Select a service…", "Dienstleistung auswählen…", "Choisissez un service…", "Selezioni un servizio…"],
    ["On-site and remote IT services", "IT-Services vor Ort und aus der Ferne", "Services informatiques sur site et à distance", "Servizi IT in sede e da remoto"],
    ["AI adoption strategy", "KI-Einführungsstrategie", "Stratégie d'adoption de l'IA", "Strategia di adozione dell'IA"],
    ["Other", "Sonstiges", "Autre", "Altro"],
    ["Sending…", "Wird gesendet…", "Envoi…", "Invio in corso…"],

    // ---- Reviews ----
    ["Leave a Review", "Bewertung abgeben", "Laisser un avis", "Lasci una recensione"],
    ["Thank you for working with me! Your feedback helps me improve and helps other businesses decide if my services are right for them. It only takes a minute.", "Vielen Dank für die Zusammenarbeit! Ihr Feedback hilft mir, besser zu werden, und anderen Unternehmen bei der Entscheidung, ob meine Dienstleistungen zu ihnen passen. Es dauert nur eine Minute.", "Merci d'avoir travaillé avec moi ! Votre avis m'aide à m'améliorer et aide d'autres entreprises à savoir si mes services leur conviennent. Cela ne prend qu'une minute.", "Grazie per aver lavorato con me! Il suo feedback mi aiuta a migliorare e aiuta altre aziende a capire se i miei servizi fanno al caso loro. Ci vuole solo un minuto."],
    ["(optional, never published)", "(optional, wird nie veröffentlicht)", "(facultatif, jamais publié)", "(facoltativo, mai pubblicato)"],
    ["Service you received", "Erhaltene Dienstleistung", "Service reçu", "Servizio ricevuto"],
    ["Security auditing & compliance", "Sicherheitsaudits & Compliance", "Audit de sécurité et conformité", "Audit di sicurezza e conformità"],
    ["Products / software", "Produkte / Software", "Produits / logiciels", "Prodotti / software"],
    ["Rating", "Bewertung", "Note", "Valutazione"],
    ["5 stars", "5 Sterne", "5 étoiles", "5 stelle"],
    ["4 stars", "4 Sterne", "4 étoiles", "4 stelle"],
    ["3 stars", "3 Sterne", "3 étoiles", "3 stelle"],
    ["2 stars", "2 Sterne", "2 étoiles", "2 stelle"],
    ["1 star", "1 Stern", "1 étoile", "1 stella"],
    ["Your review", "Ihre Bewertung", "Votre avis", "La sua recensione"],
    ["What did I help with, and how did it go?", "Wobei habe ich Ihnen geholfen, und wie ist es gelaufen?", "Sur quoi vous ai-je aidé, et comment cela s'est-il passé ?", "In cosa l'ho aiutata e com'è andata?"],
    ["I'm happy for my review (name, company and text) to be shown on this website.", "Ich bin einverstanden, dass meine Bewertung (Name, Unternehmen und Text) auf dieser Website angezeigt wird.", "J'accepte que mon avis (nom, entreprise et texte) soit affiché sur ce site.", "Acconsento alla pubblicazione della mia recensione (nome, azienda e testo) su questo sito."],
    ["Submit review", "Bewertung senden", "Envoyer l'avis", "Invia recensione"],
    ["Reviews aren't being accepted online just yet. Please check back soon.", "Bewertungen können online noch nicht abgegeben werden. Bitte schauen Sie bald wieder vorbei.", "Les avis ne peuvent pas encore être envoyés en ligne. Revenez bientôt.", "Non è ancora possibile inviare recensioni online. Torni a trovarci presto."],
    ["Please fill in your name, the service, a rating and your review.", "Bitte geben Sie Ihren Namen, die Dienstleistung, eine Bewertung und Ihren Text an.", "Veuillez indiquer votre nom, le service, une note et votre avis.", "Inserisca il suo nome, il servizio, una valutazione e la recensione."],
    ["Sorry, something went wrong sending your review. Please try again, or email me directly.", "Leider ist beim Senden Ihrer Bewertung ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie mir direkt eine E-Mail.", "Désolé, une erreur s'est produite lors de l'envoi de votre avis. Veuillez réessayer ou m'écrire directement par e-mail.", "Spiacente, si è verificato un errore durante l'invio della recensione. Riprovi o mi scriva direttamente via e-mail."],

    // ---- Products ----
    ["Open-source tools and SaaS products I've built.", "Open-Source-Tools und SaaS-Produkte, die ich entwickelt habe.", "Outils open source et produits SaaS que j'ai développés.", "Strumenti open source e prodotti SaaS che ho sviluppato."],
    ["Open Source Products", "Open-Source-Produkte", "Produits open source", "Prodotti open source"],
    ["If you ever wanted an Outlook widget that allows a user to add their attachments from their Outlook app straight to a connected SharePoint folder.", "Ein Outlook-Widget, mit dem Sie Anhänge direkt aus Outlook in einem verbundenen SharePoint-Ordner speichern können.", "Un widget Outlook qui permet d'enregistrer les pièces jointes directement depuis Outlook dans un dossier SharePoint connecté.", "Un widget di Outlook che consente di salvare gli allegati direttamente da Outlook in una cartella SharePoint collegata."],
    ["Exporting tickets from previous IT Ticket Vendor while migrating to different platform.", "Exportiert Tickets aus dem bisherigen IT-Ticketsystem bei der Migration auf eine andere Plattform.", "Exporte les tickets de l'ancien outil de ticketing lors d'une migration vers une autre plateforme.", "Esporta i ticket dal precedente sistema di ticketing IT durante la migrazione a un'altra piattaforma."],
    ["Digital Accessibility Prompt Library for Generative AI: a web app for browsing and sharing prompts that help make AI-generated content accessible.", "Digital Accessibility Prompt Library für generative KI: eine Web-App zum Durchsuchen und Teilen von Prompts, die KI-generierte Inhalte barrierefrei machen.", "Digital Accessibility Prompt Library pour l'IA générative : une application web pour parcourir et partager des prompts qui rendent accessibles les contenus générés par l'IA.", "Digital Accessibility Prompt Library per l'IA generativa: un'app web per consultare e condividere prompt che rendono accessibili i contenuti generati dall'IA."],
    ["A lightweight program to mask PII information with a human-in-the-loop procedure for flawless accuracy, recommend to use with LLMs.", "Ein schlankes Programm zur Maskierung personenbezogener Daten mit Human-in-the-Loop-Prüfung für höchste Genauigkeit – empfohlen für den Einsatz mit LLMs.", "Un programme léger qui masque les données personnelles avec une vérification humaine (human-in-the-loop) pour une précision optimale – recommandé avec les LLM.", "Un programma leggero per mascherare i dati personali con una verifica umana (human-in-the-loop) per la massima precisione – consigliato con gli LLM."],
    ["Documentation", "Dokumentation", "Documentation", "Documentazione"],
    ["Download", "Download", "Télécharger", "Scarica"],
    ["Repository", "Repository", "Dépôt", "Repository"],
    ["Consultation & Recommendations", "Beratung & Empfehlungen", "Conseil et recommandations", "Consulenza e raccomandazioni"],
    ["Not sure what fits your business?", "Unsicher, was zu Ihrem Unternehmen passt?", "Vous ne savez pas ce qui convient à votre entreprise ?", "Non sa cosa sia più adatto alla sua azienda?"],
    ["Book a consultation and I'll review your needs and recommend the right tools, products and services for you.", "Buchen Sie eine Beratung – ich analysiere Ihre Anforderungen und empfehle Ihnen die passenden Tools, Produkte und Dienstleistungen.", "Réservez une consultation : j'analyse vos besoins et vous recommande les outils, produits et services adaptés.", "Prenoti una consulenza: analizzerò le sue esigenze e le consiglierò gli strumenti, i prodotti e i servizi più adatti."],
    ["Book a consultation", "Beratung buchen", "Réserver une consultation", "Prenota una consulenza"],

    // ---- AI Workflow ----
    ["My Study Workflow Template", "Meine Vorlage für den Lern-Workflow", "Mon modèle de workflow d'étude", "Il mio modello di workflow di studio"],
    ["My workflow connects three tools: Google Drive stores my files, Claude reads and works with them, and Notion keeps the results organised.", "Mein Workflow verbindet drei Tools: Google Drive speichert meine Dateien, Claude liest und bearbeitet sie, und Notion hält die Ergebnisse geordnet.", "Mon workflow relie trois outils : Google Drive stocke mes fichiers, Claude les lit et les exploite, et Notion organise les résultats.", "Il mio workflow collega tre strumenti: Google Drive conserva i miei file, Claude li legge e li elabora, e Notion tiene in ordine i risultati."],
    ["Google Drive, Claude and Notion connected across a spinning globe", "Google Drive, Claude und Notion, verbunden über einen rotierenden Globus", "Google Drive, Claude et Notion reliés à travers un globe en rotation", "Google Drive, Claude e Notion collegati attraverso un globo rotante"],
    ["How the pieces fit", "So greifen die Teile ineinander", "Comment tout s'articule", "Come si incastrano i pezzi"],
    ["1. Collect", "1. Sammeln", "1. Collecter", "1. Raccogliere"],
    ["2. Think", "2. Denken", "2. Réfléchir", "2. Pensare"],
    ["3. Organise", "3. Ordnen", "3. Organiser", "3. Organizzare"],
    ["Lecture slides, PDFs, papers and notes go into one Drive folder per course or project.", "Vorlesungsfolien, PDFs, Paper und Notizen landen in einem Drive-Ordner pro Kurs oder Projekt.", "Supports de cours, PDF, articles et notes sont rangés dans un dossier Drive par cours ou projet.", "Slide delle lezioni, PDF, articoli e appunti finiscono in una cartella Drive per corso o progetto."],
    ["Claude reads the files straight from Drive to summarise them, answer questions and draft notes or plans.", "Claude liest die Dateien direkt aus Drive, fasst sie zusammen, beantwortet Fragen und entwirft Notizen oder Pläne.", "Claude lit les fichiers directement depuis Drive pour les résumer, répondre aux questions et rédiger des notes ou des plans.", "Claude legge i file direttamente da Drive per riassumerli, rispondere alle domande e preparare appunti o piani."],
    ["Claude writes the results into Notion pages and databases, so notes, tasks and deadlines live in one place.", "Claude schreibt die Ergebnisse in Notion-Seiten und -Datenbanken, sodass Notizen, Aufgaben und Fristen an einem Ort liegen.", "Claude écrit les résultats dans des pages et bases de données Notion : notes, tâches et échéances sont réunies au même endroit.", "Claude scrive i risultati in pagine e database di Notion, così appunti, attività e scadenze stanno in un unico posto."],
    ["Set it up yourself", "Selbst einrichten", "À vous de l'installer", "Lo configuri da sé"],
    ["You need a Claude account, a Google account and a Notion workspace. Which connectors you can use depends on your Claude plan.", "Sie benötigen ein Claude-Konto, ein Google-Konto und einen Notion-Workspace. Welche Connectors verfügbar sind, hängt von Ihrem Claude-Abo ab.", "Il vous faut un compte Claude, un compte Google et un espace de travail Notion. Les connecteurs disponibles dépendent de votre abonnement Claude.", "Le servono un account Claude, un account Google e uno spazio di lavoro Notion. I connettori disponibili dipendono dal suo piano Claude."],
    ["Step 1: Connect Google Drive", "Schritt 1: Google Drive verbinden", "Étape 1 : connecter Google Drive", "Passo 1: collegare Google Drive"],
    ["In Claude, open Settings and go to Connectors.", "Öffnen Sie in Claude die Einstellungen (Settings) und gehen Sie zu Connectors.", "Dans Claude, ouvrez les paramètres (Settings) et allez dans Connectors.", "In Claude, apra le impostazioni (Settings) e vada su Connectors."],
    ["Find Google Drive and select Connect.", "Suchen Sie Google Drive und wählen Sie Connect.", "Trouvez Google Drive et sélectionnez Connect.", "Trovi Google Drive e selezioni Connect."],
    ["Sign in with your Google account and allow access.", "Melden Sie sich mit Ihrem Google-Konto an und erlauben Sie den Zugriff.", "Connectez-vous avec votre compte Google et autorisez l'accès.", "Acceda con il suo account Google e consenta l'accesso."],
    ["Step 2: Connect Notion", "Schritt 2: Notion verbinden", "Étape 2 : connecter Notion", "Passo 2: collegare Notion"],
    ["In Settings → Connectors, browse the connectors and choose Notion.", "Durchsuchen Sie unter Settings → Connectors die Connectors und wählen Sie Notion.", "Dans Settings → Connectors, parcourez les connecteurs et choisissez Notion.", "In Settings → Connectors, sfogli i connettori e scelga Notion."],
    ["Select Connect and sign in to Notion.", "Wählen Sie Connect und melden Sie sich bei Notion an.", "Sélectionnez Connect et connectez-vous à Notion.", "Selezioni Connect e acceda a Notion."],
    ["Choose which pages Claude can access. Share only what it needs.", "Legen Sie fest, auf welche Seiten Claude zugreifen darf. Teilen Sie nur, was nötig ist.", "Choisissez les pages auxquelles Claude peut accéder. Ne partagez que le nécessaire.", "Scelga a quali pagine Claude può accedere. Condivida solo ciò che serve."],
    ["Step 3: Use both in a chat", "Schritt 3: Beide in einem Chat nutzen", "Étape 3 : utiliser les deux dans une conversation", "Passo 3: usarli entrambi in una chat"],
    ["Start a new chat and open the tools menu below the message box.", "Starten Sie einen neuen Chat und öffnen Sie das Tool-Menü unter dem Eingabefeld.", "Lancez une nouvelle conversation et ouvrez le menu des outils sous la zone de message.", "Avvii una nuova chat e apra il menu degli strumenti sotto la casella del messaggio."],
    ["Make sure Google Drive and Notion are switched on.", "Achten Sie darauf, dass Google Drive und Notion aktiviert sind.", "Vérifiez que Google Drive et Notion sont activés.", "Si assicuri che Google Drive e Notion siano attivi."],
    ["Ask Claude to use both, for example:", "Bitten Sie Claude, beide zu nutzen, zum Beispiel:", "Demandez à Claude d'utiliser les deux, par exemple :", "Chieda a Claude di usarli entrambi, per esempio:"],
    ["Read the lecture notes in my Drive folder \"Networking – Week 3\", summarise the key concepts, and create a page in my Notion \"Study Notes\" database with the summary and five revision questions.", "Lies die Vorlesungsnotizen in meinem Drive-Ordner \"Networking – Woche 3\", fasse die wichtigsten Konzepte zusammen und erstelle in meiner Notion-Datenbank \"Lernnotizen\" eine Seite mit der Zusammenfassung und fünf Wiederholungsfragen.", "Lis les notes de cours de mon dossier Drive « Réseaux – Semaine 3 », résume les concepts clés et crée une page dans ma base Notion « Notes d'étude » avec le résumé et cinq questions de révision.", "Leggi gli appunti delle lezioni nella mia cartella Drive \"Reti – Settimana 3\", riassumi i concetti chiave e crea una pagina nel mio database Notion \"Appunti di studio\" con il riassunto e cinque domande di ripasso."],
    ["Using Claude Code instead?", "Sie nutzen stattdessen Claude Code?", "Vous utilisez plutôt Claude Code ?", "Usa invece Claude Code?"],
    ["Add Notion as an MCP server from your terminal, then run /mcp inside Claude Code to sign in:", "Fügen Sie Notion im Terminal als MCP-Server hinzu und führen Sie dann in Claude Code /mcp aus, um sich anzumelden:", "Ajoutez Notion comme serveur MCP depuis votre terminal, puis lancez /mcp dans Claude Code pour vous connecter :", "Aggiunga Notion come server MCP dal terminale, poi esegua /mcp in Claude Code per accedere:"],
    ["Tips", "Tipps", "Conseils", "Consigli"],
    ["Keep one Drive folder per course or project so Claude finds the right files quickly.", "Nutzen Sie einen Drive-Ordner pro Kurs oder Projekt, damit Claude die richtigen Dateien schnell findet.", "Gardez un dossier Drive par cours ou projet pour que Claude trouve vite les bons fichiers.", "Tenga una cartella Drive per corso o progetto, così Claude trova subito i file giusti."],
    ["Set up a Notion database with properties like Course, Topic and Status first, so Claude fills in the same structure every time.", "Legen Sie zuerst eine Notion-Datenbank mit Eigenschaften wie Kurs, Thema und Status an, damit Claude jedes Mal dieselbe Struktur ausfüllt.", "Créez d'abord une base Notion avec des propriétés comme Cours, Sujet et Statut, pour que Claude remplisse toujours la même structure.", "Crei prima un database Notion con proprietà come Corso, Argomento e Stato, così Claude compila ogni volta la stessa struttura."],
    ["Check what Claude writes to Notion, especially when you are just getting started.", "Prüfen Sie, was Claude in Notion schreibt – besonders am Anfang.", "Vérifiez ce que Claude écrit dans Notion, surtout au début.", "Controlli ciò che Claude scrive in Notion, soprattutto all'inizio."],

    // ---- Services ----
    ["Professional services for SMEs", "Professionelle Dienstleistungen für KMU", "Services professionnels pour les PME", "Servizi professionali per le PMI"],
    ["On-site and remote IT Services", "IT-Services vor Ort und aus der Ferne", "Services informatiques sur site et à distance", "Servizi IT in sede e da remoto"],
    ["Troubleshooting computer systems", "Fehlerbehebung an Computersystemen", "Dépannage de systèmes informatiques", "Risoluzione dei problemi dei sistemi informatici"],
    ["Recommendations on latest IT products and services", "Empfehlungen zu aktuellen IT-Produkten und -Dienstleistungen", "Recommandations sur les derniers produits et services informatiques", "Consigli sui più recenti prodotti e servizi IT"],
    ["Guidance post-fix on solution areas, and prevention strategies", "Beratung nach der Behebung zu Lösungsansätzen und Präventionsstrategien", "Conseils après intervention sur les solutions et les stratégies de prévention", "Indicazioni dopo l'intervento sulle soluzioni e sulle strategie di prevenzione"],
    ["On-call availability within 1-week timeframe", "Verfügbarkeit auf Abruf innerhalb einer Woche", "Disponibilité sur appel sous une semaine", "Disponibilità su chiamata entro una settimana"],
    ["AI Adoption Strategies", "KI-Einführungsstrategien", "Stratégies d'adoption de l'IA", "Strategie di adozione dell'IA"],
    ["Tailored strategies on adopting latest AI technologies", "Massgeschneiderte Strategien zur Einführung neuester KI-Technologien", "Stratégies sur mesure pour adopter les dernières technologies d'IA", "Strategie su misura per adottare le più recenti tecnologie di IA"],
    ["Recommendations of automation methods, and case-by-case solutions", "Empfehlungen zu Automatisierungsmethoden und individuelle Lösungen", "Recommandations de méthodes d'automatisation et solutions au cas par cas", "Consigli sui metodi di automazione e soluzioni caso per caso"],
    ["Governance strategies according to latest research", "Governance-Strategien nach neuestem Forschungsstand", "Stratégies de gouvernance fondées sur les dernières recherches", "Strategie di governance basate sulle ricerche più recenti"],
    ["Industry-level Security Auditing & Compliance", "Sicherheitsaudits & Compliance auf Branchenniveau", "Audit de sécurité et conformité de niveau professionnel", "Audit di sicurezza e conformità di livello professionale"],
    ["Provide journey for SMEs to reach SOC 2, ISO 27001 compliance", "Begleitung von KMU auf dem Weg zur SOC-2- und ISO-27001-Compliance", "Accompagnement des PME vers la conformité SOC 2 et ISO 27001", "Accompagnamento delle PMI verso la conformità SOC 2 e ISO 27001"],
    ["Security consultations, tailor security architecture", "Sicherheitsberatung und massgeschneiderte Sicherheitsarchitektur", "Conseil en sécurité et architecture de sécurité sur mesure", "Consulenza sulla sicurezza e architettura di sicurezza su misura"],
    ["Recommend the latest security products and services", "Empfehlung der neuesten Sicherheitsprodukte und -dienstleistungen", "Recommandation des derniers produits et services de sécurité", "Consigli sui più recenti prodotti e servizi di sicurezza"],
    ["Open-Source and Free Products", "Open-Source- und kostenlose Produkte", "Produits open source et gratuits", "Prodotti open source e gratuiti"],
    ["Owner of multiple SaaS products; link-to-sharepoint, ticket-migrator and word-web", "Inhaber mehrerer SaaS-Produkte: link-to-sharepoint, ticket-migrator und word-web", "Propriétaire de plusieurs produits SaaS : link-to-sharepoint, ticket-migrator et word-web", "Titolare di diversi prodotti SaaS: link-to-sharepoint, ticket-migrator e word-web"],

    // ---- CV ----
    ["Curriculum Vitae", "Lebenslauf", "Curriculum vitae", "Curriculum vitae"],
    ["Request CV", "Lebenslauf anfordern", "Demander mon CV", "Richiedi il CV"],
    ["Positions", "Berufserfahrung", "Expérience professionnelle", "Esperienza professionale"],
    ["Education", "Ausbildung", "Formation", "Formazione"],
    ["Certifications", "Zertifikate", "Certifications", "Certificazioni"],
    ["Skills", "Fähigkeiten", "Compétences", "Competenze"],
    ["IT Specialist", "IT-Spezialist", "Spécialiste informatique", "Specialista IT"],
    ["Maintenance Engineer", "Wartungstechniker", "Ingénieur de maintenance", "Tecnico della manutenzione"],
    ["MS365 Administrator, Security Analyst, Project Creation & Implementation", "MS365-Administrator, Sicherheitsanalyst, Projektplanung & -umsetzung", "Administrateur MS365, analyste sécurité, conception et mise en œuvre de projets", "Amministratore MS365, analista della sicurezza, ideazione e realizzazione di progetti"],
    ["Help Desk Support, L1, L2 Expertise, SOC and ISO Compliance", "Helpdesk-Support, L1-/L2-Expertise, SOC- und ISO-Compliance", "Support helpdesk, expertise N1/N2, conformité SOC et ISO", "Supporto help desk, competenze L1/L2, conformità SOC e ISO"],
    ["Help Desk Support, L1 Capacity, On-site and Mobile IT Support", "Helpdesk-Support (L1), IT-Support vor Ort und mobil", "Support helpdesk (N1), support informatique sur site et mobile", "Supporto help desk (L1), assistenza IT in sede e mobile"],
    ["MSc in Information Systems", "MSc in Information Systems", "MSc en systèmes d'information", "MSc in sistemi informativi"],
    ["BSc in Computer Science", "BSc in Informatik", "BSc en informatique", "BSc in informatica"],
    ["Cert IV in Information Technology", "Cert IV in Informationstechnologie", "Cert IV en technologies de l'information", "Cert IV in tecnologia dell'informazione"],
    ["Python, Powershell, Digital Innovation and Adoption, ML & Data Algorithms, Data Application and Security", "Python, PowerShell, digitale Innovation und Adoption, ML- & Datenalgorithmen, Datenanwendung und -sicherheit", "Python, PowerShell, innovation et adoption numériques, algorithmes de ML et de données, application et sécurité des données", "Python, PowerShell, innovazione e adozione digitale, algoritmi di ML e dati, applicazione e sicurezza dei dati"],

    // ---- Blog ----
    ["Blog Posts", "Blogbeiträge", "Articles de blog", "Articoli del blog"],
    ["Occasional thoughts on IT, AI and security.", "Gelegentliche Gedanken zu IT, KI und Sicherheit.", "Réflexions occasionnelles sur l'informatique, l'IA et la sécurité.", "Riflessioni occasionali su IT, IA e sicurezza."],
    ["The first posts are on their way. Check back soon!", "Die ersten Beiträge sind in Arbeit. Schauen Sie bald wieder vorbei!", "Les premiers articles arrivent bientôt. Revenez vite !", "I primi articoli sono in arrivo. Torni presto a trovarci!"],

    // ---- Book a session ----
    ["Book a Session", "Termin buchen", "Réserver une séance", "Prenota una sessione"],
    ["Tell me what you need and when suits you. I'll get back to you by email to confirm the date and time.", "Sagen Sie mir, was Sie brauchen und wann es Ihnen passt. Ich melde mich per E-Mail, um Datum und Uhrzeit zu bestätigen.", "Dites-moi ce dont vous avez besoin et quand cela vous convient. Je vous répondrai par e-mail pour confirmer la date et l'heure.", "Mi dica di cosa ha bisogno e quando le è più comodo. Le risponderò via e-mail per confermare data e ora."],
    ["Your details", "Ihre Angaben", "Vos coordonnées", "I suoi dati"],
    ["What you need", "Ihr Anliegen", "Votre besoin", "Di cosa ha bisogno"],
    ["Service needed", "Gewünschte Dienstleistung", "Service souhaité", "Servizio richiesto"],
    ["Security auditing & compliance (SOC 2, ISO 27001)", "Sicherheitsaudits & Compliance (SOC 2, ISO 27001)", "Audit de sécurité et conformité (SOC 2, ISO 27001)", "Audit di sicurezza e conformità (SOC 2, ISO 27001)"],
    ["Products / software support", "Support für Produkte / Software", "Support produits / logiciels", "Supporto prodotti / software"],
    ["Consultation / recommendation", "Beratung / Empfehlung", "Conseil / recommandation", "Consulenza / raccomandazione"],
    ["Support type", "Art des Supports", "Type d'assistance", "Tipo di assistenza"],
    ["Remote", "Aus der Ferne", "À distance", "Da remoto"],
    ["On-site", "Vor Ort", "Sur site", "In sede"],
    ["Not sure", "Weiss nicht", "Je ne sais pas", "Non so"],
    ["Urgency", "Dringlichkeit", "Urgence", "Urgenza"],
    ["Normal", "Normal", "Normale", "Normale"],
    ["Soon (within a few days)", "Bald (innerhalb weniger Tage)", "Bientôt (sous quelques jours)", "A breve (entro pochi giorni)"],
    ["Urgent (business is affected)", "Dringend (Betrieb ist beeinträchtigt)", "Urgent (l'activité est impactée)", "Urgente (l'attività ne risente)"],
    ["Describe the issue or project", "Beschreiben Sie das Problem oder Projekt", "Décrivez le problème ou le projet", "Descriva il problema o il progetto"],
    ["What's happening, what have you tried, how many people or devices are affected?", "Was passiert, was haben Sie bereits versucht, wie viele Personen oder Geräte sind betroffen?", "Que se passe-t-il, qu'avez-vous déjà essayé, combien de personnes ou d'appareils sont concernés ?", "Cosa succede, cosa ha già provato, quante persone o dispositivi sono coinvolti?"],
    ["When", "Wann", "Quand", "Quando"],
    ["Preferred date", "Wunschdatum", "Date souhaitée", "Data preferita"],
    ["Select a date", "Datum auswählen", "Choisir une date", "Selezioni una data"],
    ["Choose a date", "Datum wählen", "Choisir une date", "Scegli una data"],
    ["Previous month", "Vorheriger Monat", "Mois précédent", "Mese precedente"],
    ["Next month", "Nächster Monat", "Mois suivant", "Mese successivo"],
    ["Preferred time", "Bevorzugte Uhrzeit", "Heure souhaitée", "Orario preferito"],
    ["Any time", "Jederzeit", "Peu importe", "Qualsiasi orario"],
    ["Morning", "Vormittag", "Matin", "Mattina"],
    ["Afternoon", "Nachmittag", "Après-midi", "Pomeriggio"],
    ["Evening", "Abend", "Soir", "Sera"],
    ["On-site address", "Adresse vor Ort", "Adresse d'intervention", "Indirizzo dell'intervento"],
    ["Send request", "Anfrage senden", "Envoyer la demande", "Invia richiesta"],
    ["Please fill in the required fields (marked *).", "Bitte füllen Sie die Pflichtfelder (mit * markiert) aus.", "Veuillez remplir les champs obligatoires (marqués d'un *).", "Compili i campi obbligatori (contrassegnati da *)."],
    ["Please select a preferred date.", "Bitte wählen Sie ein Wunschdatum.", "Veuillez choisir une date souhaitée.", "Selezioni una data preferita."],
    ["Sorry, that didn't send. Please try again or email me directly.", "Leider konnte die Anfrage nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie mir direkt eine E-Mail.", "Désolé, l'envoi a échoué. Veuillez réessayer ou m'écrire directement par e-mail.", "Spiacente, l'invio non è riuscito. Riprovi o mi scriva direttamente via e-mail."],
  ];

  // Paragraphs that contain links or bold text. Used by elements with data-i18n="key".
  const HTML = {
    "home.p1": {
      de: 'Ich bin <strong>Systemingenieur</strong> mit Erfahrung in der MS365-Administration, der Sicherheitsanalyse sowie der Planung und Umsetzung von IT-Projekten. Zudem schliesse ich derzeit meinen <strong>MSc in Information Systems</strong> an der <a href="https://www.uni.li">Universität Liechtenstein</a> ab.',
      fr: 'Je suis <strong>ingénieur système</strong>, expérimenté dans l\'administration de MS365, l\'analyse de sécurité ainsi que la conception et la mise en œuvre de projets informatiques. Je termine également un <strong>MSc en systèmes d\'information</strong> à l\'<a href="https://www.uni.li">Université du Liechtenstein</a>.',
      it: 'Sono un <strong>ingegnere di sistema</strong> con esperienza nell\'amministrazione di MS365, nell\'analisi della sicurezza e nella progettazione e realizzazione di progetti IT. Sto inoltre completando un <strong>MSc in sistemi informativi</strong> presso l\'<a href="https://www.uni.li">Università del Liechtenstein</a>.',
    },
    "home.p2": {
      de: 'Meine Arbeit verbindet <strong>Cybersicherheit</strong>, <strong>künstliche Intelligenz</strong> und <strong>Netzwerke</strong>. Zuvor war ich IT-Spezialist bei Optimove, wo ich L1/L2-Support leistete und an der SOC- und ISO-Compliance arbeitete, und davor Wartungstechniker bei Office Solutions IT. Ich habe einen BSc in Informatik der Edith Cowan University.',
      fr: 'Mon travail se situe à la croisée de la <strong>cybersécurité</strong>, de l\'<strong>intelligence artificielle</strong> et des <strong>réseaux</strong>. Auparavant, j\'étais spécialiste informatique chez Optimove, où j\'assurais le support N1/N2 et travaillais sur la conformité SOC et ISO, et avant cela ingénieur de maintenance chez Office Solutions IT. Je suis titulaire d\'un BSc en informatique de l\'Edith Cowan University.',
      it: 'Il mio lavoro si colloca all\'incrocio tra <strong>cybersicurezza</strong>, <strong>intelligenza artificiale</strong> e <strong>reti</strong>. In precedenza sono stato specialista IT presso Optimove, dove fornivo supporto L1/L2 e lavoravo alla conformità SOC e ISO, e prima ancora tecnico della manutenzione presso Office Solutions IT. Ho conseguito un BSc in informatica presso la Edith Cowan University.',
    },
    "home.p3": {
      de: 'Ich unterstütze kleine und mittlere Unternehmen bei IT-Support, KI-Einführung sowie Sicherheitsaudits und Compliance und entwickle Open-Source-Tools, die alltägliche IT-Probleme lösen.',
      fr: 'J\'accompagne les petites et moyennes entreprises en matière de support informatique, d\'adoption de l\'IA, d\'audit de sécurité et de conformité, et je développe des outils open source qui résolvent les problèmes informatiques du quotidien.',
      it: 'Aiuto le piccole e medie imprese con supporto IT, adozione dell\'IA, audit di sicurezza e conformità, e sviluppo strumenti open source che risolvono i problemi IT di tutti i giorni.',
    },
    "home.callout": {
      de: '<strong>Brauchen Sie Hilfe bei IT, KI oder Sicherheit?</strong> Sehen Sie sich meine <a href="service.html">Dienstleistungen</a> an oder entdecken Sie meine <a href="products.html">Produkte</a>. Bereits mit mir gearbeitet? <a href="reviews.html">Hinterlassen Sie eine Bewertung</a>.',
      fr: '<strong>Besoin d\'aide en informatique, en IA ou en sécurité ?</strong> Découvrez les <a href="service.html">services que je propose</a> ou parcourez mes <a href="products.html">produits</a>. Vous avez déjà travaillé avec moi ? <a href="reviews.html">Laissez un avis</a>.',
      it: '<strong>Ha bisogno di aiuto con IT, IA o sicurezza?</strong> Scopra i <a href="service.html">servizi che offro</a> o consulti i miei <a href="products.html">prodotti</a>. Ha già lavorato con me? <a href="reviews.html">Lasci una recensione</a>.',
    },
    "reviews.thanks": {
      de: '<strong>Vielen Dank!</strong> Ihre Bewertung ist eingegangen. Ich schätze es sehr, dass Sie sich die Zeit genommen haben.',
      fr: '<strong>Merci !</strong> Votre avis a bien été reçu. Je vous remercie sincèrement d\'avoir pris le temps.',
      it: '<strong>Grazie!</strong> La sua recensione è stata ricevuta. Apprezzo molto il tempo che mi ha dedicato.',
    },
    "book.thanks": {
      de: '<strong>Vielen Dank, Ihre Anfrage wurde gesendet!</strong> Ich melde mich per E-Mail, um Datum und Uhrzeit zu bestätigen.',
      fr: '<strong>Merci, votre demande a bien été envoyée !</strong> Je vous répondrai par e-mail pour confirmer la date et l\'heure.',
      it: '<strong>Grazie, la sua richiesta è stata inviata!</strong> Le risponderò via e-mail per confermare data e ora.',
    },
  };

  const norm = (s) => s.replace(/\s+/g, " ").trim();
  const DICT = {};
  ROWS.forEach(([en, de, fr, it]) => { DICT[norm(en)] = { de, fr, it }; });

  // Each language has its own URL so search engines can index it:
  // English at /page.html, the others at /de/page.html, /fr/page.html, /it/page.html.
  const PREFIX = /^\/(de|fr|it)\//;
  function save(l) { try { localStorage.setItem("lang", l); return localStorage.getItem("lang") === l; } catch (e) { return false; } }
  function stored() { try { const s = localStorage.getItem("lang"); return LANGS.includes(s) ? s : null; } catch (e) { return null; } }
  function urlFor(l, keepLangParam) {
    const url = new URL(location.href);
    url.searchParams.delete("lang");
    if (keepLangParam) url.searchParams.set("lang", l);
    url.pathname = (l === "en" ? "" : "/" + l) + url.pathname.replace(PREFIX, "/");
    return url.toString();
  }
  function detect() {
    const m = location.pathname.match(PREFIX);
    if (m) return m[1];
    // English page: send visitors who chose (or whose browser prefers) another language to that version.
    // Crawlers have no saved choice and an English browser, so they stay on the English page.
    const q = new URLSearchParams(location.search).get("lang");
    let want = LANGS.includes(q) ? (save(q), q) : stored();
    if (!want) {
      const n = (navigator.language || "en").slice(0, 2).toLowerCase();
      want = LANGS.includes(n) ? n : "en";
    }
    if (want !== "en") location.replace(urlFor(want));
    return "en";
  }
  const lang = detect();
  document.documentElement.lang = lang;

  function t(s) {
    if (lang === "en" || s == null) return s;
    const e = DICT[norm(String(s))];
    return (e && e[lang]) || s;
  }

  function apply(root) {
    root = root || document.body;
    if (lang === "en") return;
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      const h = HTML[el.dataset.i18n];
      if (h && h[lang]) el.innerHTML = h[lang];
    });
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement && n.parentElement.closest("script, style, code") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      const key = norm(n.nodeValue);
      if (!key || !DICT[key] || !DICT[key][lang]) return;
      const lead = n.nodeValue.match(/^\s*/)[0], trail = n.nodeValue.match(/\s*$/)[0];
      n.nodeValue = lead + DICT[key][lang] + trail;
    });
    ["placeholder", "alt", "aria-label", "title"].forEach((attr) => {
      root.querySelectorAll(`[${attr}]`).forEach((el) => el.setAttribute(attr, t(el.getAttribute(attr))));
    });
    document.title = document.title.split(" · ").map(t).join(" · ");
  }

  function set(l) {
    if (!LANGS.includes(l) || l === lang) return;
    // If storage is blocked, carry an English choice in the URL so the browser language doesn't override it
    const ok = save(l);
    location.href = urlFor(l, !ok && l === "en");
  }

  window.I18N = { lang, langs: LANGS, locale: LOCALES[lang], t, apply, set };
})();
