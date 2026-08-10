"use strict";

/* =====================================================
   MOTOR DE EMPAREJAMIENTOS
   ===================================================== */

window.PairingEngine = {

    generatePairings: function(players) {

        if (!players || players.length < 2) {
            throw new Error(
                "No hay suficientes participantes."
            );
        }

        if (players.length % 2 !== 0) {
            throw new Error(
                "El número de participantes debe ser par."
            );
        }

        const forbidden = [
            ["Xorro", "Javier Ibáñez"],
            ["Pablo Vera", "Rafa Vera"]
        ];

        const result = findPairings(
            [...players],
            forbidden
        );

        if (!result) {
            throw new Error(
                "No ha sido posible generar un sorteo válido."
            );
        }

        return result;
    }

};


/* =====================================================
   BUSCAR EMPAREJAMIENTOS
   ===================================================== */

function findPairings(players, forbidden) {

    if (players.length === 0) {
        return [];
    }

    /*
       Elegimos al jugador con menos posibilidades.
       Esto mejora muchísimo el rendimiento.
    */

    let selectedIndex = 0;
    let selectedOptions = null;

    for (let i = 0; i < players.length; i++) {

        const options = [];

        for (let j = 0; j < players.length; j++) {

            if (i === j) continue;

            if (
                isForbidden(
                    players[i],
                    players[j],
                    forbidden
                )
            ) {
                continue;
            }

            options.push(j);
        }

        if (
            selectedOptions === null ||
            options.length < selectedOptions.length
        ) {
            selectedIndex = i;
            selectedOptions = options;
        }
    }

    if (!selectedOptions.length) {
        return null;
    }

    const player = players[selectedIndex];

    /*
       Ordenamos los posibles rivales según prioridad.
    */

    const candidates = selectedOptions.map(index => {

        const opponent = players[index];

        return {
            index: index,
            player: opponent,
            cost: pairingCost(
                player,
                opponent
            )
        };

    });

    /*
       Primero las mejores opciones.
    */

    candidates.sort(
        (a, b) => a.cost - b.cost
    );

    /*
       Si tienen el mismo coste,
       introducimos aleatoriedad.
    */

    shuffleEqualCosts(candidates);


    /*
       Probamos candidatos.
    */

    for (const candidate of candidates) {

        const remaining = players.filter(
            (_, index) =>
                index !== selectedIndex &&
                index !== candidate.index
        );

        const rest = findPairings(
            remaining,
            forbidden
        );

        if (rest !== null) {

            return [
                {
                    a: player,
                    b: candidate.player
                },
                ...rest
            ];

        }

    }

    return null;
}


/* =====================================================
   COSTE DEL EMPAREJAMIENTO
   ===================================================== */

function pairingCost(a, b) {

    let cost = 0;

    /*
       Mismo equipo:
       penalización MUY alta.
    */

    if (sameTeam(a, b)) {
        cost += 1000;
    }

    /*
       Mismo ejército:
       penalización menor.
    */

    if (sameArmy(a, b)) {
        cost += 100;
    }

    return cost;
}


/* =====================================================
   MISMO EQUIPO
   ===================================================== */

function sameTeam(a, b) {

    /*
       Mercenario no cuenta como equipo.
    */

    if (!a.equipo || !b.equipo) {
        return false;
    }

    if (
        a.equipo.toLowerCase() === "mercenario" ||
        b.equipo.toLowerCase() === "mercenario"
    ) {
        return false;
    }

    return a.equipo === b.equipo;
}


/* =====================================================
   MISMO EJÉRCITO
   ===================================================== */

function sameArmy(a, b) {

    if (!a.ejercito || !b.ejercito) {
        return false;
    }

    return a.ejercito === b.ejercito;
}


/* =====================================================
   ENFRENTAMIENTO PROHIBIDO
   ===================================================== */

function isForbidden(a, b, forbidden) {

    return forbidden.some(pair => {

        return (

            (
                pair[0] === a.nombre &&
                pair[1] === b.nombre
            )

            ||

            (
                pair[0] === b.nombre &&
                pair[1] === a.nombre
            )

        );

    });

}


/* =====================================================
   ALEATORIEDAD
   ===================================================== */

function shuffleEqualCosts(array) {

    let start = 0;

    while (start < array.length) {

        let end = start + 1;

        while (
            end < array.length &&
            array[end].cost === array[start].cost
        ) {
            end++;
        }

        for (
            let i = end - 1;
            i > start;
            i--
        ) {

            const j =
                start +
                Math.floor(
                    Math.random() *
                    (i - start + 1)
                );

            [
                array[i],
                array[j]
            ] = [
                array[j],
                array[i]
            ];
        }

        start = end;
    }

}
