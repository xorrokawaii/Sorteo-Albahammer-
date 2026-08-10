/*=========================================================
    pairing.js
    PARTE 1
=========================================================*/

"use strict";

/*=========================================================
    MOTOR DE EMPAREJAMIENTOS
=========================================================*/

const PairingEngine = (() => {

    /*=========================================
        CONSTANTES
    =========================================*/

    const TEAM_PENALTY = 1000;

    const ARMY_PENALTY = 100;

    /*=========================================
        VARIABLES
    =========================================*/

    let forbidden = [];

    /*=========================================
        API PÚBLICA
    =========================================*/

    function generatePairings(players){

        forbidden = getForbiddenMatches();

        const result = solve(players);

        if(!result){

            throw new Error(

                "No ha sido posible generar un sorteo válido."

            );

        }

        return result;

    }

    /*=========================================
        RESTRICCIÓN ABSOLUTA
    =========================================*/

    function isForbidden(a,b){

        return forbidden.some(pair =>

            (pair[0] === a.nombre && pair[1] === b.nombre) ||

            (pair[0] === b.nombre && pair[1] === a.nombre)

        );

    }

    /*=========================================
        MISMO EQUIPO
    =========================================*/

    function sameTeam(a,b){

        if(a.equipo === "Mercenario")
            return false;

        if(b.equipo === "Mercenario")
            return false;

        return a.equipo === b.equipo;

    }

    /*=========================================
        MISMO EJÉRCITO
    =========================================*/

    function sameArmy(a,b){

        return a.ejercito === b.ejercito;

    }

    /*=========================================
        COSTE DEL EMPAREJAMIENTO
    =========================================*/

    function pairingCost(a,b){

        if(isForbidden(a,b))
            return Infinity;

        let cost = 0;

        if(sameTeam(a,b))
            cost += TEAM_PENALTY;

        if(sameArmy(a,b))
            cost += ARMY_PENALTY;

        return cost;

    }

    /*=========================================
        COPIA DE JUGADORES
    =========================================*/

    function clonePlayers(players){

        return players.map(player => ({...player}));

    }

    /*=========================================
        ELIMINAR JUGADOR
    =========================================*/

    function removePlayer(list,index){

        const copy = [...list];

        copy.splice(index,1);

        return copy;

    }

    /*=========================================
        BÚSQUEDA
        (Implementada en la Parte 2)
    =========================================*/

    function solve(players){

        return backtracking(

            clonePlayers(players),

            []

        );

    }

    function backtracking(remaining,current){

        // Continúa en la Parte 2

        return null;

    }

    /*=========================================
        EXPORTAR TEXTO
    =========================================*/

    function pairingsToText(pairings){

        return pairings

            .map((pair,index)=>

                `${index+1}. ${pair.a.nombre} vs ${pair.b.nombre}`

            )

            .join("\n");

    }

    /*=========================================
        API
    =========================================*/

    return {

        generatePairings,

        pairingsToText

    };

})();

/*=========================================================
    pairing.js
    PARTE 2
=========================================================*/

/*=========================================
    BACKTRACKING
=========================================*/

function backtracking(remaining,current){

    if(remaining.length===0){

        return current;

    }

    const player=remaining[0];

    let bestSolution=null;

    let bestCost=Infinity;

    for(let i=1;i<remaining.length;i++){

        const opponent=remaining[i];

        const pairCost=pairingCost(player,opponent);

        if(pairCost===Infinity)
            continue;

        const nextRemaining=[

            ...remaining.slice(1,i),

            ...remaining.slice(i+1)

        ];

        const nextCurrent=[

            ...current,

            {

                a:player,

                b:opponent,

                cost:pairCost

            }

        ];

        const solution=

            backtracking(

                nextRemaining,

                nextCurrent

            );

        if(!solution)
            continue;

        const totalCost=

            solution.reduce(

                (sum,p)=>sum+p.cost,

                0

            );

        if(totalCost<bestCost){

            bestCost=totalCost;

            bestSolution=solution;

            if(bestCost===0)
                break;

        }

    }

    return bestSolution;

}

/*=========================================
    ORDENAR POR COSTE
=========================================*/

function sortPairings(pairings){

    return [...pairings]

        .sort(

            (a,b)=>a.cost-b.cost

        );

}

/*=========================================
    COSTE TOTAL
=========================================*/

function totalCost(pairings){

    return pairings.reduce(

        (sum,pair)=>sum+pair.cost,

        0

    );

}

/*=========================================================
    pairing.js
    PARTE 3
    Heurísticas y optimización
=========================================================*/

/*=========================================
    ELEGIR JUGADOR MÁS RESTRICTIVO
=========================================*/

function selectNextPlayer(players){

    let bestIndex = 0;

    let fewestOpponents = Infinity;

    for(let i=0;i<players.length;i++){

        let validOpponents = 0;

        for(let j=0;j<players.length;j++){

            if(i===j)
                continue;

            if(

                pairingCost(

                    players[i],

                    players[j]

                )!==Infinity

            ){

                validOpponents++;

            }

        }

        if(validOpponents<fewestOpponents){

            fewestOpponents = validOpponents;

            bestIndex = i;

        }

    }

    return bestIndex;

}

/*=========================================
    ORDENAR RIVALES
=========================================*/

function orderedOpponents(players,index){

    const result=[];

    const player=players[index];

    for(let i=0;i<players.length;i++){

        if(i===index)
            continue;

        const cost=

            pairingCost(

                player,

                players[i]

            );

        if(cost===Infinity)
            continue;

        result.push({

            index:i,

            player:players[i],

            cost

        });

    }

    result.sort(

        (a,b)=>a.cost-b.cost

    );

    return result;

}

/*=========================================
    BACKTRACKING OPTIMIZADO
=========================================*/

function backtracking(remaining,current){

    if(remaining.length===0){

        return current;

    }

    const index=

        selectNextPlayer(

            remaining

        );

    const player=

        remaining[index];

    const candidates=

        orderedOpponents(

            remaining,

            index

        );

    let bestSolution=null;

    let bestCost=Infinity;

    for(const candidate of candidates){

        const opponent=

            candidate.player;

        const cost=

            candidate.cost;

        const next=

            remaining.filter(

                (_,i)=>

                    i!==index &&
                    i!==candidate.index

            );

        const partial=[

            ...current,

            {

                a:player,

                b:opponent,

                cost

            }

        ];

        const solution=

            backtracking(

                next,

                partial

            );

        if(!solution)
            continue;

        const solutionCost=

            totalCost(

                solution

            );

        if(solutionCost<bestCost){

            bestCost=

                solutionCost;

            bestSolution=

                solution;

            if(bestCost===0)
                break;

        }

    }

    return bestSolution;

}
