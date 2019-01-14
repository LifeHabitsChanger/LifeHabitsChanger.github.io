# PomClimat : Calculateur d'émission de Co2 
> BUSAC Pascal  
> CHAPUT Rémy  
> VERGNE Théo  
> YANG Pierre  

[M2 IA Data Visualization] Projet

### Présentation 

Ce projet a été réalisé dans le cadre de l'UE Data Visualization du master d'IA de l'université Claude Bernard Lyon 1.

Cette visualisation présente l'empreinte carbone de différentes actions du quotidien (alimentaire, transports, énergétique). Un formulaire, pré remplit avec les données moyennes française, est modifiable. Nous vous invitone à renseigner les données vous concernant pour avoir une estimation de vos émissions de gaz à effet de serre. Jouer avec les différents paramètres donne une idée de l'impact des différents éléments.

### Choix des visualisations

Nous avons choisi de présenter les données sous forme de Barshart afin de visualiser directement la somme totale calculée.
Grace aux différentes catégories indiquées, l’utilisateur peut directement comprendre la part de chacune.   
En utilisant le questionnaire, il peut explorer les impacts des différents éléments.
Les autres barsharp lui permettent de se comparer avec des profils spécifiques (français moyens, végan...).  
De plus, La représentation sous forme de droite de l’objectif de la cop 21 permet de savoir immédiatement si celui-ci est atteint en fonction des choix indiqués dans le questionnaire. 

### Limites

Certains facteurs ne sont pas pris en compte dans cette visualisation :
- On ne considère que le chauffage tout électrique
- L'empreinte carbone liée à l'achat de divers produits manufacturés n'est pas pris en compte (électronique, vêtements, produits divers)
- Chauffer à différentes température n'est pas pris en compte

Bien que nous ayons croisé les sources au mieux, la précision du modèle reste relative. Certaines valeurs changent significativement d'une source à l'autre.

### Pistes d'amélioration

On pourait gagner en précision en ce qui concerne la consommation de l'électorménager en demandant quels produits l'utilisateur possède.

Tout le monde ne connait pas la classe énergétique (A, B, .., G) de son logement et de ses appareils électrique. Il serait intéressant de proposer, par exemple, une bulle d'aide pour aider à estimer ces valeurs.

Renseigner les transports en km/an n'est pas idéal.

### Liens


![Le projet](https://lifehabitschanger.github.io/)
![Les données](https://github.com/LifeHabitsChanger/lifehabitschanger.github.io/blob/master/Data.csv)
![Le detail des données alimentaires](https://github.com/LifeHabitsChanger/lifehabitschanger.github.io/blob/master/Data_alimentaire.csv)

La majorité des sources utilisées pour mettre en place le modèle sont consultables dans le fichier Data.csv présent dans cette archive
