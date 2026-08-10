/*=========================================================
    script.js
    PARTE 1
=========================================================*/

"use strict";

/*=========================================================
    VARIABLES GLOBALES
=========================================================*/

let players = [];
let pairings = [];

let currentPair = 0;
let revealingFirst = true;

let firstPlayer = null;
let secondPlayer = null;

let tournamentStarted = false;

/*=========================================================
    ELEMENTOS DEL DOM
=========================================================*/

const urn = document.getElementById("urn");
const ballContainer = document.getElementById("ballContainer");

const drawBall = document.getElementById("drawBall");

const paperName = document.getElementById("paperName");
const paperTeam = document.getElementById("paperTeam");
const paperArmy = document.getElementById("paperArmy");

const historyList = document.getElementById("historyList");

const versusSection = document.getElementById("versusSection");

const leftCard = document.getElementById("playerLeft");
const rightCard = document.getElementById("playerRight");

const startButton = document.getElementById("startButton");
const nextButton = document.getElementById("nextButton");
const restartButton = document.getElementById("restartButton");

const finalScreen = document.getElementById("finalScreen");
const finalList = document.getElementById("finalList");

/*======================
    AUDIO
======================*/

const introAudio = document.getElementById("introAudio");
const ballAudio = document.getElementById("ballAudio");
const openAudio = document.getElementById("openAudio");
const applauseAudio = document.getElementById("applauseAudio");

/*=========================================================
    INICIALIZACIÓN
=========================================================*/

window.addEventListener("DOMContentLoaded", initialize);

function initialize(){

    players = getPlayers();

    createUrnBalls();

    registerEvents();

    nextButton.disabled = true;

    finalScreen.classList.remove("show");

}

/*=========================================================
    EVENTOS
=========================================================*/

function registerEvents(){

    startButton.addEventListener(

        "click",

        startDraw

    );

    nextButton.addEventListener(

        "click",

        nextExtraction

    );

    restartButton.addEventListener(

        "click",

        restartDraw

    );

}

/*=========================================================
    CREAR BOLAS
=========================================================*/

function createUrnBalls(){

    ballContainer.innerHTML = "";

    players.forEach((player,index)=>{

        const ball = document.createElement("div");

        ball.className = "ball";

        ball.dataset.index = index;

        randomBallPosition(ball);

        ballContainer.appendChild(ball);

    });

}

/*=========================================================
    POSICIÓN ALEATORIA
=========================================================*/

function randomBallPosition(ball){

    const radius = 170;

    const angle = Math.random()*Math.PI*2;

    const distance = Math.random()*radius;

    const x = Math.cos(angle)*distance;

    const y = Math.sin(angle)*distance;

    ball.style.left =

        (250+x)+"px";

    ball.style.top =

        (250+y)+"px";

}

/*=========================================================
    COMENZAR
=========================================================*/

function startDraw(){

    if(tournamentStarted)
        return;

    tournamentStarted = true;

    try{

        pairings = PairingEngine.generatePairings(

            players

        );

    }

    catch(error){

        alert(error.message);

        return;

    }

    startButton.disabled = true;

    nextButton.disabled = false;

    if(introAudio){

        introAudio.currentTime = 0;

        introAudio.play().catch(()=>{});

    }

}

/*=========================================================
    SIGUIENTE EXTRACCIÓN
=========================================================*/

function nextExtraction(){

    if(currentPair>=pairings.length){

        finishTournament();

        return;

    }

    extractBallAnimation();

}

/*=========================================================
    REINICIAR
=========================================================*/

function restartDraw(){

    location.reload();

}

/*=========================================================
    ANIMACIÓN
=========================================================*/

/*

Se implementará completamente
en la Parte 3.

*/

function extractBallAnimation(){

}

/*=========================================================
    script.js
    PARTE 2
    Gestión del sorteo
=========================================================*/

/*=========================================================
    DEVOLVER JUGADOR ACTUAL
=========================================================*/

function getCurrentPlayer(){

    const pairing = pairings[currentPair];

    if(revealingFirst){

        return pairing.a;

    }

    return pairing.b;

}

/*=========================================================
    REVELAR JUGADOR
=========================================================*/

function revealCurrentPlayer(){

    const player = getCurrentPlayer();

    paperName.textContent = player.nombre;
    paperTeam.textContent = player.equipo;
    paperArmy.textContent = player.ejercito;

    if(openAudio){

        openAudio.currentTime = 0;
        openAudio.play().catch(()=>{});

    }

    drawBall.classList.add("open");

    if(revealingFirst){

        firstPlayer = player;

        revealingFirst = false;

    }

    else{

        secondPlayer = player;

        revealingFirst = true;

        setTimeout(showVersusPair,1000);

    }

}

/*=========================================================
    MOSTRAR ENFRENTAMIENTO
=========================================================*/

function showVersusPair(){

    leftCard.querySelector(".playerName").textContent =
        firstPlayer.nombre;

    leftCard.querySelector(".playerTeam").textContent =
        firstPlayer.equipo;

    leftCard.querySelector(".playerArmy").textContent =
        firstPlayer.ejercito;

    rightCard.querySelector(".playerName").textContent =
        secondPlayer.nombre;

    rightCard.querySelector(".playerTeam").textContent =
        secondPlayer.equipo;

    rightCard.querySelector(".playerArmy").textContent =
        secondPlayer.ejercito;

    leftCard.classList.add("show");
    rightCard.classList.add("show");

    versusSection.classList.add("show");

    addHistoryCard(firstPlayer,secondPlayer);

    currentPair++;

    firstPlayer = null;
    secondPlayer = null;

    setTimeout(resetExtraction,2500);

}

/*=========================================================
    AÑADIR AL HISTORIAL
=========================================================*/

function addHistoryCard(a,b){

    const card = document.createElement("div");

    card.className = "historyCard";

    card.innerHTML = `
        <strong>${a.nombre}</strong><br>
        <small>${a.equipo}</small><br>
        <small>${a.ejercito}</small>

        <div class="vs">VS</div>

        <strong>${b.nombre}</strong><br>
        <small>${b.equipo}</small><br>
        <small>${b.ejercito}</small>
    `;

    historyList.appendChild(card);

    requestAnimationFrame(()=>{

        card.classList.add("show");

    });

    historyList.scrollTop =
        historyList.scrollHeight;

}

/*=========================================================
    PREPARAR SIGUIENTE EXTRACCIÓN
=========================================================*/

function resetExtraction(){

    drawBall.classList.remove(

        "visible",
        "extract",
        "open"

    );

    paperName.textContent = "";
    paperTeam.textContent = "";
    paperArmy.textContent = "";

}

/*=========================================================
    FINALIZAR
=========================================================*/

function finishTournament(){

    nextButton.disabled = true;

    finalList.innerHTML = "";

    pairings.forEach(pair=>{

        const row = document.createElement("div");

        row.className = "historyCard";

        row.innerHTML = `
            <strong>${pair.a.nombre}</strong>
            <div class="vs">VS</div>
            <strong>${pair.b.nombre}</strong>
        `;

        finalList.appendChild(row);

    });

    finalScreen.classList.add("show");

    if(applauseAudio){

        applauseAudio.currentTime = 0;

        applauseAudio.play().catch(()=>{});

    }

}

/*=========================================================
    script.js
    PARTE 3
    Animaciones de la urna
=========================================================*/

/*=========================================================
    VARIABLES DE ANIMACIÓN
=========================================================*/

const urnBalls = [];

let animationRunning = true;

/*=========================================================
    INICIAR ANIMACIÓN
=========================================================*/

window.addEventListener("load",()=>{

    initializeUrnPhysics();

    requestAnimationFrame(animateUrn);

});

/*=========================================================
    CREAR MOVIMIENTO DE LAS BOLAS
=========================================================*/

function initializeUrnPhysics(){

    const balls=document.querySelectorAll(".ball");

    balls.forEach(ball=>{

        urnBalls.push({

            element:ball,

            angle:Math.random()*Math.PI*2,

            radius:70+Math.random()*120,

            speed:0.003+(Math.random()*0.004),

            offset:Math.random()*Math.PI*2,

            removed:false

        });

    });

}

/*=========================================================
    ANIMACIÓN CONTINUA
=========================================================*/

function animateUrn(time){

    if(animationRunning){

        urnBalls.forEach(ball=>{

            if(ball.removed)
                return;

            ball.angle+=ball.speed*16;

            const wobble=

                Math.sin(time*0.001+ball.offset)*18;

            const x=

                Math.cos(ball.angle)*
                (ball.radius+wobble);

            const y=

                Math.sin(ball.angle)*
                (ball.radius*0.55);

            ball.element.style.transform=

                `translate(${x}px,${y}px)`;

        });

    }

    requestAnimationFrame(animateUrn);

}

/*=========================================================
    EXTRAER BOLA
=========================================================*/

function extractBallAnimation(){

    const available=

        urnBalls.filter(ball=>!ball.removed);

    if(!available.length){

        finishTournament();

        return;

    }

    const selected=

        available[
            Math.floor(Math.random()*available.length)
        ];

    selected.removed=true;

    selected.element.classList.add("hidden");

    drawBall.className="";

    void drawBall.offsetWidth;

    drawBall.classList.add(

        "visible",
        "extract"

    );

    if(ballAudio){

        ballAudio.currentTime=0;

        ballAudio.play().catch(()=>{});

    }

    setTimeout(()=>{

        drawBall.classList.add("open");

    },1900);

    setTimeout(()=>{

        revealCurrentPlayer();

    },2600);

}

/*=========================================================
    ELIMINAR BOLA VISUALMENTE
=========================================================*/

function removeBallFromUrn(){

    const removed=

        urnBalls.find(ball=>ball.removed &&
        !ball.deleted);

    if(!removed)
        return;

    removed.deleted=true;

    removed.element.style.transition=

        "opacity .8s, transform .8s";

    removed.element.style.opacity="0";

    removed.element.style.transform+=

        " scale(.2)";

}

/*=========================================================
    REINICIAR EXTRACCIÓN
=========================================================*/

function resetExtraction(){

    removeBallFromUrn();

    drawBall.classList.remove(

        "visible",
        "extract",
        "open"

    );

    paperName.textContent="";
    paperTeam.textContent="";
    paperArmy.textContent="";

}

/*=========================================================
    EFECTO DESTELLO
=========================================================*/

function flashUrn(){

    const glow=document.getElementById(

        "backgroundGlow"

    );

    glow.animate(

        [

            {

                opacity:.3,

                transform:"scale(1)"

            },

            {

                opacity:1,

                transform:"scale(1.12)"

            },

            {

                opacity:.3,

                transform:"scale(1)"

            }

        ],

        {

            duration:700

        }

    );

}

/*=========================================================
    CONFETI
=========================================================*/

function launchConfetti(){

    for(let i=0;i<120;i++){

        const piece=

            document.createElement("div");

        piece.className="confetti";

        piece.style.left=

            Math.random()*100+"vw";

        piece.style.animationDelay=

            (Math.random()*1.5)+"s";

        piece.style.background=

            [

                "#ffd54a",

                "#ffffff",

                "#3aa7ff",

                "#ff5757"

            ][Math.floor(Math.random()*4)];

        document.body.appendChild(piece);

        setTimeout(()=>{

            piece.remove();

        },5000);

    }

}
