# PRD — Mode Schéma & Formes (YvCode)

## Vision
Ajouter un mode “diagramme léger” pour créer et exporter rapidement des schémas (flowcharts, UML basique, user journeys) en complément du code/text.

## Objectifs
- Créer un schéma simple en < 2 minutes.
- 80 % des sessions utilisent guides/grille sans frustration d’alignement.
- 50 % des exports de schémas en SVG prêts à l’usage (Figma/Slides) sans retouche.

## Personas
- Créateur tech (post social).
- Formateur (explication d’algo/pipeline).
- PM/Dev (parcours utilisateur ou séquencement API).

## Portée (in)
- Palette de formes vectorielles.
- Connecteurs intelligents.
- Guides/grille de snapping.
- Calques, groupes, verrouillage.
- Bibliothèque de gabarits (templates).
- Export SVG/PNG + clipboard vectoriel.
- Import/export JSON compatible.

Hors périmètre MVP: collaboration temps réel, auto-layout avancé, thèmes multiples, animation/vidéo.

## Fonctionnalités & Uses

### Palette de formes
- Rectangles, ellipses, lignes, polygones simples; remplissage, contour, coins, ombre, opacité.
- Uses:
  - Croquer des blocs de processus.
  - Dessiner des états ou entités (classe UML, étape d’un flux).
  - Mettre en avant une zone avec un surlignage large semi-transparent.

### Connecteurs intelligents
- Points magnétiques sur bords; styles (plein, pointillé, double); auto-routage orthogonal simple; flèches tête/tail configurables; étiquette optionnelle.
- Uses:
  - Relier étapes d’un flow sans lignes qui se chevauchent.
  - Annoter un lien avec une condition (“oui/non”, “200/500”).
  - Mettre à jour automatiquement le tracé lors d’un déplacement de forme.

### Guides, grille et snapping
- Grille paramétrable; guides d’alignement/espacement; snaps centre/bords; toggle rapide + raccourci.
- Uses:
  - Aligner plusieurs blocs à la même hauteur.
  - Distribuer uniformément des étapes sur l’axe X ou Y.
  - Tracer à la main en conservant un espacement régulier.

### Calques, groupes, verrouillage
- Grouper/dégrouper (Cmd+G / Shift+Cmd+G); masquer/afficher; verrouiller pour éviter la sélection; réordonner dans le panneau Layers existant.
- Uses:
  - Déplacer un sous-ensemble du diagramme d’un seul geste.
  - Geler le fond ou le décor pour éditer uniquement le contenu.
  - Cacher une variante pendant l’export d’une autre.

### Bibliothèque de gabarits
- Flowchart de base, UML classe/séquence simplifiée, user journey; insertion en un clic via modal avec aperçus; chaque élément reste éditable.
- Uses:
  - Démarrer un flux CRUD standard en 5 secondes.
  - Générer un squelette de séquence API (Client → Gateway → Service → DB).
  - Préparer un parcours utilisateur type (Awareness → Consideration → Action).

### Export enrichi
- SVG et PNG (fond transparent), facteur d’échelle; copier en vectoriel vers presse-papiers.
- Uses:
  - Coller directement dans Figma/Slides sans pixellisation.
  - Export haute résolution 2x pour réseaux sociaux.
  - Partager un schéma avec fond transparent pour overlay.

### Persistance & compatibilité
- JSON inclut nouveaux types (`shape`, `connector`), props complètes; migration ascendante depuis projets existants.
- Uses:
  - Rééditer un diagramme plus tard avec toutes les propriétés intactes.
  - Échanger un template custom via fichier JSON.
  - Charger d’anciens snaps sans perte (fallback pour types inconnus).

## Expérience utilisateur
- Toolbar: nouveaux boutons Forme (dropdown) et Connecteur.
- Canvas: handles de resize/rotation; ancres visibles au survol; guides/grille toggle.
- Inspector: sections contextuelles (forme, connecteur, groupe) pour couleurs, contour, épaisseur, coins, ombre, dash, flèches.
- Templates: modal “Insérer un modèle” avec aperçus; insertion en groupe.
- Export: sélection PNG/SVG, échelle, fond transparent.

## Données (ajouts)
- Élément `shape`: `{ variant: 'rect'|'ellipse'|'polygon', fill, stroke, strokeWidth, cornerRadius, shadow, opacity }`.
- Élément `connector` (ou extension d’arrow): `{ style: 'straight'|'orthogonal'|'curved', dash, headStart, headEnd, anchors: [{ elementId, side, offset }], routing: 'auto'|'manual', label? }`.
- Templates: catalogue JSON versionné avec ID, titre, aperçu.

## Non-fonctionnel
- Perf: drag 200 éléments à 60fps; auto-routage simple <16 ms par connecteur.
- Export: SVG <1 s pour 200 éléments; PNG 2x <1.5 s en 1920x1080.
- Accessibilité: focus clavier sur handles, raccourcis annoncés, aria-labels.

## Mesure du succès
- Usage guides/grille (% sessions).
- Temps médian de création d’un schéma.
- Ratio exports SVG vs PNG.
- Taux d’insertion de template dans nouvelles sessions.

## Risques
- Routage complexe → MVP orthogonal simple, fallback ligne droite.
- Inflation d’options UI → regroupement dans Inspector, toolbar minimale.
- Compat JSON → versionnement + migrations.

## Roadmap indicative
- S1: data model + rendu formes + Inspector.
- S2: guides/grille + groupes/verrouillage + shortcuts.
- S3: connecteurs magnétiques + auto-routage simple + export SVG.
- S4: bibliothèque de gabarits + QA, perf, migrations JSON.
