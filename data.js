/*=========================================================
    data.js
    Datos del torneo
=========================================================*/

"use strict";

/*=========================================================
    PARTICIPANTES
=========================================================*/

const PLAYERS = [

    {
        nombre: "Carlos Aznar",
        equipo: "Caballeros de Estalia",
        ejercito: "Enanos"
    },

    {
        nombre: "Leitdorf",
        equipo: "Caballeros de Estalia",
        ejercito: "Condes Vampiro"
    },

    {
        nombre: "Teutógeno",
        equipo: "Caballeros de Estalia",
        ejercito: "Imperio"
    },

    {
        nombre: "Arzur",
        equipo: "Caballeros de Estalia",
        ejercito: "Altos Elfos"
    },

    {
        nombre: "Xorro",
        equipo: "Albahammer",
        ejercito: "Enanos del Caos"
    },

    {
        nombre: "Jous",
        equipo: "Albahammer",
        ejercito: "Enanos"
    },

    {
        nombre: "Farton",
        equipo: "Albahammer",
        ejercito: "Reinos Ogros"
    },

    {
        nombre: "Marqués de Zoco",
        equipo: "Albahammer",
        ejercito: "Elfos Oscuros"
    },

    {
        nombre: "Santinik",
        equipo: "CR Hammer",
        ejercito: "Orcos y Goblins"
    },

    {
        nombre: "Juan Arnás",
        equipo: "CR Hammer",
        ejercito: "Mercenarios"
    },

    {
        nombre: "Pedro Escobar",
        equipo: "Mercenario",
        ejercito: "Altos Elfos"
    },

    {
        nombre: "Rafa Vera",
        equipo: "Mercenario",
        ejercito: "Imperio"
    },

    {
        nombre: "Pablo Vera",
        equipo: "Mercenario",
        ejercito: "Bretonia"
    },

    {
        nombre: "Romi",
        equipo: "Karak Yakka",
        ejercito: "Elfos Oscuros"
    },

    {
        nombre: "Javier Ibáñez",
        equipo: "Karak Yakka",
        ejercito: "Reyes Funerarios"
    },

    {
        nombre: "Orfeo",
        equipo: "Mercenario",
        ejercito: "Elfos Silvanos"
    },

    {
        nombre: "Kolxer",
        equipo: "Mercenario",
        ejercito: "Hombres Lagarto"
    },

    {
        nombre: "Sr. Zumbador",
        equipo: "ASYF Linarheim",
        ejercito: "Imperio"
    },

    {
        nombre: "Galar",
        equipo: "Mercenario",
        ejercito: "Imperio"
    },

    {
        nombre: "Mario Damián",
        equipo: "AIME",
        ejercito: "Elfos Silvanos"
    }

];

/*=========================================================
    ENFRENTAMIENTOS PROHIBIDOS
=========================================================*/

const FORBIDDEN_MATCHES = [

    ["Xorro", "Javier Ibáñez"],
    ["Javier Ibáñez", "Xorro"],

    ["Pablo Vera", "Rafa Vera"],
    ["Rafa Vera", "Pablo Vera"]

];

/*=========================================================
    CONFIGURACIÓN
=========================================================*/

const CONFIG = {

    evitarMismoEquipo: true,

    evitarMismoEjercito: true,

    mercenarioNoCuentaComoEquipo: true,

    animacionBola: 2600,

    pausaEntreJugadores: 1000

};

/*=========================================================
    FUNCIONES DE ACCESO
=========================================================*/

function getPlayers(){

    return structuredClone(PLAYERS);

}

function getForbiddenMatches(){

    return structuredClone(FORBIDDEN_MATCHES);

}

function getConfig(){

    return structuredClone(CONFIG);

}
