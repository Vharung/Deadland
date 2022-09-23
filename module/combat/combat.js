export class DeadlandscCombat extends Combat {

    //fonction de comparaison de l'init pour le tri du tracker
    //si la fonction retourne un nombre négatif alors A agira avant B
    _sortCombatants(a,b){
        console.log("sortCombatants");
        const initA = Number.isNumeric(a.initiative) ? a.initiative : 0;
        const initB = Number.isNumeric(b.initiative) ? b.initiative : 0;

        let initDifference = initB - initA;
        if (initDifference != 0){
            return initDifference
        }
    }

    //init de l'objet combatant
    _prepareCombatant(c, scene,players,settings = {}){
        console.log("prepareCombatant");
        //appel de la méthode parente
        let combatant = super._prepareCombatant(c,scene,players,settings);
        //utilisation des flags pour stocker des données le temps du combat.
        combatant.flags.cards= Array.isArray(combatant.flags.cards) ? combatant.flags.cards : [];
        return combatant;

    }

    //ajout d'un element à la pile d'historique
    async _pushHistory(data){
        console.log("pushHistory");
        //important, toujours faire une copie et ne pas modifier directement l'original si on veut de la persistance. 
        let turnHistory = this.getFlag("deadlandsc", "turnHistory").slice();
        turnHistory.push(data);
        console.log(turnHistory);
        return this.setFlag("deadlandsc", "turnHistory", turnHistory);
    }

    //retrait d'un element de la pile
    async _popHistory(){
        console.log("popHistory");
        //important, toujours faire une copie et ne pas modifier directement l'original si on veut de la persistance. 
        let turnHistory = this.getFlag("deadlandsc", "turnHistory").slice();
        let result = turnHistory.pop();
        console.log(turnHistory);
        await this.setFlag("deadlandsc", "turnHistory", turnHistory);
        return result;
    }

    //jouer une carte
    async spendCard(combatant){
        console.log("spendCard");
        //sauvegarde avant la nouvelle initiative
        this._pushHistory({
            id: combatant._id,
            initiative: combatant.initiative,
            cards: combatant.flags.cards,
        });
        console.log(combatant);
        //calcul de la nouvelle initiative
        let cards=combatant.flags.cards;
        let newInitiative = 0;
        if (cards.length > 1)
        {
            cards.pop();
            newInitiative= cards[cards.length-1][3];
        }
        if (cards.length == 1)
        {
            newInitiative= cards[0][3];
            cards=[];
        }
        return this.updateCombatant({
            _id: combatant._id,
            initiative: newInitiative,
            ["flags.cards"] :cards,
        });
    }

    //Fonction de récupération de la formule d'init du system
    _getInitiativeFormula(combatant){
        console.log("_getInitiativeFormula");
        let baseFormula = super._getInitiativeFormula(combatant);
        console.log("Initiative Base Formula : " + baseFormula);
        //modification de la formule
        const coordination = combatant.actor.system.physique.rapidite.coordination;
        const dice = combatant.actor.system.physique.rapidite.de;
        baseFormula ="{ ";
        for (let i=0; i<coordination; i++)
        {
            baseFormula += "1d"+dice+"x";
            if(i+1 < coordination)
            {
                baseFormula +=", "
            }
        }
        baseFormula += " }kh";
        console.log("New Initiative Formula :" + baseFormula)
        //combatant.actor.Initiative();
        return baseFormula;
    }

    //surcharge du rollInitiative afin de mettre à jour l'init des combatants.
    async rollInitiative(ids,formulaopt, updateTurnopt,messageOptionsopt )
    {
        console.log("rollInitiative");
        await super.rollInitiative(ids,formulaopt, updateTurnopt,messageOptionsopt );
        console.log("tirage des cartes");
        for (let id of ids){       
            let c = this.getCombatant(id);
            console.log(c.name+" pour "+ c.initiative);
            //détermination du nombre de carte à tirer
            let nbcard =1;
            if (c.initiative >= 5)
            {
                nbcard= nbcard + Math.trunc(c.initiative / 5);
            }
            //tirage des cartes
            let cards=[];
            for(let j=0; j < nbcard ;j++)
            {
                let card = c.actor.Tirer();
                cards[j]= card;
                console.log("tire "+card[2]+ " : " +card[3]);
            }
            console.log(cards);
            //tri du tableau
            cards.sort(function(a, b) {
                return a[3] - b[3];
              });
            //gestion du joker noir
            if(cards[cards.length-1][3] == 54)
            {
                //suppression du JN
                cards.pop();
                //suppression de la carte de plus haute valeur
                if (cards.length>=1)
                {
                    cards.pop();
                }
            }
            console.log(cards);
            //attribution de l'initiative de départ
            if (cards.length>=1)
            { 
                //this.setInitiative(c._id,cards[cards.length-1][3]);
                //revoir l'enregistrement du flag
                await this.updateCombatant({
                    _id: id,
                    initiative: cards[cards.length-1][3],
                    ["flags.cards"]: cards
                });
                console.log("init flag " + id);
                console.log(c);
            }
            else
            {
                this.setInitiative(id, 0); 
            }

        }
        return this.update({ turn: 0});
    }

    //surcharge de startCombat qui est l'action déclenchée par le bouton Begin
    async startCombat(){
        console.log("startCombat");
        await this.setupTurns();
        //gestion d'une pile pour les retour arrière dans le combat tracker
        await this.setFlag("deadlandsc", "turnHistory", []);
        return super.startCombat();
    }

    //fonction pour passer au tour suivant
    async nextTurn(){
        console.log("nextTurn");
        let combatant = this.combatant;

        //si init <= 0 le combatant n'a plus de cartes
        if (combatant.initiative <= 0){
            return this.nextRound();
        }
        //on dépense une carte ou on la met de côté
        //const cardSpent = combatant.flags.cards;
        await this.spendCard(combatant);
        console.log(combatant);
        return this.update({ turn: 0});
    }

    async nextRound() {
        console.log("nextRound");
        //sauvegarde de l'état de l'ensemble des combatants.
        await this._pushHistory(this.combatants.map(c => {
            return {
                id: c._id,
                intiative: c.initiative,
                cards: c.flags.cards,
            }
        }));
        //on pousse un marqueur de nouveau round
        await this._pushHistory("newRound");

        //preparation du nouveau round
        /*
        this.combatants.forEach(c => this.updateCombatant({
            _id:c._id,
            ...
        }));
        */

        //réactivation du bouton pour lancer l'init
        await this.resetAll();

        //incrémentation du numéro de round
        //return this.update({round: this.round + 1, turn:0}, {advanceTime : CONFIG.time.roundTime});
        return this.update({round: this.round + 1, turn:0});
    }

    async previousRound(){
        console.log("previousRound");
        const round = Math.max(this.round -1, 0);

        if(round > 0){
            let turnHistory = this.getFlag("deadlandsc", "turnHistory").slice();
            let data = turnHistory.pop();
            let roundState;
            console.log (turnHistory);

            if(Array.isArray(data)){
                roundState = data;
            }
            else {
                let index = turnHistory.lastIndexOf("newRound");
                turnHistory.splice(index);
                roundState = turnHistory.pop();
            }
            await this.setFlag("deadlandsc", "turnHistory", turnHistory);

            //restoration des combatants
            for (let c of roundState){
                await this.updateCombatant({
                    _id: c.id,
                    intiative: c.initiative,
                    ["flags.cards"]: c.cards,
                });
            }

            return this.update({ round: round, turn:0});
        }
    }

    async previousTurn(){
        console.log("previousTurn");
        let data = await this._popHistory();

        //si on rencontre le marqueur de nouveau round on appel la fonction previousRound
        if (data == null || data === "newRound") {
            return this.previousRound();
        }

        await this.updateCombatant({
            _id: data.id,
            initiative: system.initiative,
            ["flags.cards"] : system.cards,
        });

        return this.update({ turn: 0});
    }
}
