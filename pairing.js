```javascript
/*=========================================================
    pairing.js
    MOTOR DEFINITIVO DE EMPAREJAMIENTOS
=========================================================*/

"use strict";


/*=========================================================
    PAIRING ENGINE
=========================================================*/

const PairingEngine = (() => {


    /*=====================================================
        CONFIGURACIÓN DE PENALIZACIONES
    =====================================================*/

    // Mismo equipo:
    // Se intenta evitar, pero NO es imposible.
    const TEAM_PENALTY = 1000;

    // Mismo ejército:
    // Se intenta evitar antes que el mismo equipo.
    const ARMY_PENALTY = 100;


    /*=====================================================
        GENERAR EMPAREJAMIENTOS
    =====================================================*/

    function generatePairings(players){

        if(!Array.isArray(players)){

            throw new Error(
                "La lista de participantes no es válida."
            );

        }

        if(players.length < 2){

            throw new Error(
                "Se necesitan al menos 2 participantes."
            );

        }

        if(players.length % 2 !== 0){

            throw new Error(
                "El número de participantes debe ser par."
            );

        }

        const forbidden = getForbiddenMatches();

        const result = solve(
            players,
            forbidden
        );

        if(!result){

            throw new Error(
                "No ha sido posible generar un sorteo válido."
            );

        }

        /*
            Eliminamos la propiedad interna "cost"
            antes de devolver el resultado.
        */

        return result.map(pair => ({

            a: pair.a,

            b: pair.b

        }));

    }


    /*=====================================================
        SOLUCIONADOR
    =====================================================*/

    function solve(players, forbidden){

        const remaining = [...players];

        return backtracking(

            remaining,

            [],

            forbidden

        );

    }


    /*=====================================================
        BACKTRACKING
    =====================================================*/

    function backtracking(

        remaining,

        current,

        forbidden

    ){

        /*
            Si no quedan jugadores,
            hemos encontrado una solución completa.
        */

        if(remaining.length === 0){

            return current;

        }


        /*
            Elegimos primero al jugador que tenga
            menos posibilidades de emparejamiento.

            Esto reduce enormemente las ramas
            innecesarias del algoritmo.
        */

        const playerIndex =

            selectMostRestrictedPlayer(

                remaining,

                forbidden

            );

        const player =

            remaining[playerIndex];


        /*
            Obtenemos los posibles rivales.
        */

        const candidates =

            getCandidates(

                remaining,

                playerIndex,

                forbidden

            );


        /*
            Si no tiene ningún rival posible,
            esta rama no funciona.
        */

        if(candidates.length === 0){

            return null;

        }


        /*
            Probamos los rivales en orden aleatorio
            dentro de cada nivel de coste.

            Esto hace que dos sorteos no produzcan
            necesariamente el mismo resultado.
        */

        shuffleCandidates(candidates);


        let bestSolution = null;

        let bestCost = Infinity;


        for(const candidate of candidates){

            const opponent = candidate.player;

            const cost = candidate.cost;


            /*
                Creamos la lista restante sin ambos jugadores.
            */

            const nextRemaining =

                remaining.filter(

                    (_, index) =>

                        index !== playerIndex &&

                        index !== candidate.index

                );


            /*
                Añadimos la pareja provisional.
            */

            const nextCurrent = [

                ...current,

                {

                    a: player,

                    b: opponent,

                    cost: cost

                }

            ];


            /*
                Poda:

                Si ya tenemos una solución mejor y esta rama
                ya parte con un coste superior, no merece
                la pena explorarla.

                Como los costes nunca pueden disminuir,
                esta rama no podrá superar la mejor solución.
            */

            const currentCost =

                totalCost(nextCurrent);


            if(currentCost >= bestCost){

                continue;

            }


            /*
                Continuamos recursivamente.
            */

            const solution =

                backtracking(

                    nextRemaining,

                    nextCurrent,

                    forbidden

                );


            if(!solution){

                continue;

            }


            const solutionCost =

                totalCost(solution);


            if(solutionCost < bestCost){

                bestCost = solutionCost;

                bestSolution = solution;

            }


            /*
                Coste 0 significa:

                - ningún mismo equipo
                - ningún mismo ejército

                Por tanto es una solución perfecta.
            */

            if(bestCost === 0){

                break;

            }

        }


        return bestSolution;

    }


    /*=====================================================
        SELECCIONAR JUGADOR MÁS RESTRINGIDO
    =====================================================*/

    function selectMostRestrictedPlayer(

        players,

        forbidden

    ){

        let bestIndex = 0;

        let fewestCandidates = Infinity;


        for(let i = 0; i < players.length; i++){

            let count = 0;


            for(let j = 0; j < players.length; j++){

                if(i === j){

                    continue;

                }


                if(

                    !isForbidden(

                        players[i],

                        players[j],

                        forbidden

                    )

                ){

                    count++;

                }

            }


            if(count < fewestCandidates){

                fewestCandidates = count;

                bestIndex = i;

            }

        }


        return bestIndex;

    }


    /*=====================================================
        OBTENER RIVALES POSIBLES
    =====================================================*/

    function getCandidates(

        players,

        playerIndex,

        forbidden

    ){

        const player = players[playerIndex];

        const candidates = [];


        for(let i = 0; i < players.length; i++){

            if(i === playerIndex){

                continue;

            }


            const opponent = players[i];


            const cost =

                pairingCost(

                    player,

                    opponent,

                    forbidden

                );


            /*
                Infinity significa enfrentamiento
                absolutamente prohibido.
            */

            if(cost === Infinity){

                continue;

            }


            candidates.push({

                index: i,

                player: opponent,

                cost: cost

            });

        }


        /*
            Los emparejamientos más deseables
            aparecen primero.
        */

        candidates.sort(

            (a,b) => a.cost - b.cost

        );


        return candidates;

    }


    /*=====================================================
        COSTE DE UN EMPAREJAMIENTO
    =====================================================*/

    function pairingCost(

        a,

        b,

        forbidden

    ){

        /*
            Prohibiciones absolutas.
        */

        if(

            isForbidden(

                a,

                b,

                forbidden

            )

        ){

            return Infinity;

        }


        let cost = 0;


        /*
            Mismo equipo.

            Mercenario NO se considera un equipo,
            por lo que nunca genera penalización.
        */

        if(sameTeam(a,b)){

            cost += TEAM_PENALTY;

        }


        /*
            Mismo ejército.
        */

        if(sameArmy(a,b)){

            cost += ARMY_PENALTY;

        }


        return cost;

    }


    /*=====================================================
        COMPROBAR PROHIBICIONES
    =====================================================*/

    function isForbidden(

        a,

        b,

        forbidden

    ){

        return forbidden.some(pair => {

            const first = pair[0];

            const second = pair[1];


            return (

                a.nombre === first &&

                b.nombre === second

            ) || (

                a.nombre === second &&

                b.nombre === first

            );

        });

    }


    /*=====================================================
        MISMO EQUIPO
    =====================================================*/

    function sameTeam(a,b){

        /*
            "Mercenario" no cuenta como equipo.

            Tampoco consideramos equipo vacío como
            un equipo compartido.
        */

        if(

            !a.equipo ||

            !b.equipo

        ){

            return false;

        }


        if(

            a.equipo.toLowerCase() === "mercenario" ||

            b.equipo.toLowerCase() === "mercenario"

        ){

            return false;

        }


        return a.equipo === b.equipo;

    }


    /*=====================================================
        MISMO EJÉRCITO
    =====================================================*/

    function sameArmy(a,b){

        if(!a.ejercito || !b.ejercito){

            return false;

        }

        return a.ejercito === b.ejercito;

    }


    /*=====================================================
        COSTE TOTAL
    =====================================================*/

    function totalCost(pairings){

        return pairings.reduce(

            (total,pair) =>

                total + pair.cost,

            0

        );

    }


    /*=====================================================
        ALEATORIEDAD
    =====================================================*/

    function shuffleCandidates(candidates){

        /*
            Barajamos únicamente entre candidatos
            que tienen el mismo coste.

            Así mantenemos las prioridades pero
            conseguimos resultados diferentes.
        */

        let start = 0;


        while(start < candidates.length){

            const cost = candidates[start].cost;

            let end = start + 1;


            while(

                end < candidates.length &&

                candidates[end].cost === cost

            ){

                end++;

            }


            /*
                Fisher-Yates.
            */

            for(

                let i = end - 1;

                i > start;

                i--

            ){

                const j =

                    start +

                    Math.floor(

                        Math.random() *

                        (i - start + 1)

                    );


                [

                    candidates[i],

                    candidates[j]

                ] = [

                    candidates[j],

                    candidates[i]

                ];

            }


            start = end;

        }

    }


    /*=====================================================
        TEXTO
    =====================================================*/

    function pairingsToText(pairings){

        return pairings

            .map(

                (pair,index) =>

                    `${index + 1}. ` +

                    `${pair.a.nombre} vs ` +

                    `${pair.b.nombre}`

            )

            .join("\n");

    }


    /*=====================================================
        API PÚBLICA
    =====================================================*/

    return {

        generatePairings,

        pairingsToText

    };

})();
```
