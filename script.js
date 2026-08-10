/*=========================================================
    script.js
    PARTE 1
=========================================================*/

"use strict";

/*=========================================================
    ESTADO GLOBAL
=========================================================*/

let players = [];
let pairings = [];

let currentPairIndex = 0;
let revealingFirstPlayer = true;

let currentPlayerA = null;
let currentPlayerB = null;

let drawStarted = false;

/*=========================================================
    ELEMENTOS DEL DOM
=========================================================*/

const ballContainer = document.getElementById("ballContainer");

const drawBall = document.getElementById("drawBall");

const paperName = document.getElementById("paperName");
const paperTeam = document.getElementById("paperTeam");
const paperArmy = document.getElementById("paperArmy");

const historyList = document.getElementById("historyList");

const versusSection = document.getElementById("versusSection");

const playerLeft = document.getElementById("playerLeft");
const playerRight = document.getElementById("playerRight");

const startButton = document.getElementById("startButton");
const nextButton = document.getElementById("nextButton");
const restartButton = document.getElementById("restartButton");

const finalScreen = document.getElementById("finalScreen");
const finalList = document.getElementById("finalList");

/*=========================================================
    SONIDOS
=========================================================*/

const introAudio = document.getElementById("introAudio");
const ballAudio = document.getElementById("ballAudio");
const openAudio = document.getElementById("openAudio");
const applauseAudio = document.getElementById("applauseAudio");

/*=========================================================
    BOLAS DE LA URNA
=========================================================*/

const urnBalls = [];

/*=========================================================
    INICIALIZACIÓN
=========================================================*/

window.addEventListener("DOMContentLoaded", initialize);

function initialize(){

    console.log("SCRIPT.JS CARGADO");

    console.log(
        "PairingEngine:",
        window.PairingEngine
    );

    players = getPlayers();

    createUrnBalls();

    registerEvents();

    nextButton.disabled = true;

    finalScreen.classList.remove("show");

    versusSection.classList.remove("show");

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

        ball.dataset.player = index;

        ballContainer.appendChild(ball);

        urnBalls.push({

            element: ball,

            removed: false,

            angle: Math.random()*Math.PI*2,

            radius: 60 + Math.random()*110,

            speed: 0.003 + Math.random()*0.003,

            offset: Math.random()*Math.PI*2

        });

    });

}

/*=========================================================
    COMENZAR SORTEO
=========================================================*/

function startDraw(){

    if(drawStarted)
        return;

    drawStarted = true;

    try{

        pairings = window.PairingEngine.generatePairings(

            players

        );

    }

    catch(error){

        alert(error.message);

        drawStarted = false;

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

    if(currentPairIndex >= pairings.length){

        finishTournament();

        return;

    }

    extractBall();

}

/*=========================================================
    REINICIAR
=========================================================*/

function restartDraw(){

    if(confirm("¿Deseas realizar un nuevo sorteo?")){

        location.reload();

    }

}

/*=========================================================
    PLACEHOLDERS
=========================================================*/

/*
Las siguientes funciones se implementarán
en la Parte 2.
*/

function extractBall(){}

function revealPlayer(){}

function showVersus(){}

function finishTournament(){}

/*=========================================================
    script.js
    PARTE 2
    Física y animación de la urna
=========================================================*/

/*=========================================
    ANIMACIÓN CONTINUA
=========================================*/

let animationEnabled = true;

requestAnimationFrame(updateUrn);

function updateUrn(time){

    if(animationEnabled){

        urnBalls.forEach(ball=>{

            if(ball.removed)
                return;

            ball.angle += ball.speed * 16;

            const wobble =

                Math.sin(
                    time*0.001 +
                    ball.offset
                ) * 15;

            const x =

                Math.cos(ball.angle) *
                (ball.radius + wobble);

            const y =

                Math.sin(ball.angle) *
                (ball.radius * .55);

            ball.element.style.transform =

                `translate(${x}px,${y}px)`;

        });

    }

    requestAnimationFrame(updateUrn);

}

/*=========================================
    EXTRAER BOLA
=========================================*/

function extractBall(){

    nextButton.disabled = true;

    const available =

        urnBalls.filter(

            b=>!b.removed

        );

    if(!available.length){

        finishTournament();

        return;

    }

    const selected =

        available[
            Math.floor(
                Math.random() *
                available.length
            )
        ];

    selected.removed = true;

    selected.element.classList.add(

        "hidden"

    );

    if(ballAudio){

        ballAudio.currentTime = 0;

        ballAudio.play().catch(()=>{});

    }

    drawBall.className = "";

    void drawBall.offsetWidth;

    drawBall.classList.add(

        "visible",
        "extract"

    );

    setTimeout(()=>{

        drawBall.classList.add(

            "open"

        );

    },1800);

    setTimeout(

        revealPlayer,

        2500

    );

}

/*=========================================
    REVELAR JUGADOR
=========================================*/

function revealPlayer(){

    const pairing =

        pairings[currentPairIndex];

    let player;

    if(revealingFirstPlayer){

        player = pairing.a;

        currentPlayerA = player;

    }

    else{

        player = pairing.b;

        currentPlayerB = player;

    }

    paperName.textContent =

        player.nombre;

    paperTeam.textContent =

        player.equipo;

    paperArmy.textContent =

        player.ejercito;

    if(openAudio){

        openAudio.currentTime = 0;

        openAudio.play().catch(()=>{});

    }

    if(revealingFirstPlayer){

        revealingFirstPlayer = false;

        nextButton.disabled = false;

    }

    else{

        revealingFirstPlayer = true;

        setTimeout(

            showVersus,

            1500

        );

    }

}

/*=========================================================
    script.js
    PARTE 3
    VS, historial y fin del sorteo
=========================================================*/

/*=========================================
    MOSTRAR ENFRENTAMIENTO
=========================================*/

function showVersus(){

    fillCard(playerLeft,currentPlayerA);
    fillCard(playerRight,currentPlayerB);

    playerLeft.classList.remove("show");
    playerRight.classList.remove("show");

    void playerLeft.offsetWidth;

    playerLeft.classList.add("show");
    playerRight.classList.add("show");

    versusSection.classList.add("show");

    addHistoryCard(

        currentPlayerA,

        currentPlayerB

    );

    currentPairIndex++;

    currentPlayerA=null;
    currentPlayerB=null;

    setTimeout(

        prepareNextExtraction,

        3000

    );

}

/*=========================================
    RELLENAR TARJETA
=========================================*/

function fillCard(card,player){

    card.querySelector(".playerName").textContent =
        player.nombre;

    card.querySelector(".playerTeam").textContent =
        player.equipo;

    card.querySelector(".playerArmy").textContent =
        player.ejercito;

}

/*=========================================
    HISTORIAL
=========================================*/

function addHistoryCard(a,b){

    const card=document.createElement("div");

    card.className="historyCard";

    card.innerHTML=`

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

    historyList.scrollTop=

        historyList.scrollHeight;

}

/*=========================================
    PREPARAR SIGUIENTE BOLA
=========================================*/

function prepareNextExtraction(){

    drawBall.className="";

    paperName.textContent="";
    paperTeam.textContent="";
    paperArmy.textContent="";

    if(currentPairIndex>=pairings.length){

        finishTournament();

        return;

    }

    nextButton.disabled=false;

}

/*=========================================
    PANTALLA FINAL
=========================================*/

function finishTournament(){

    nextButton.disabled=true;

    animationEnabled=false;

    finalList.innerHTML="";

    pairings.forEach((pair,index)=>{

        const row=document.createElement("div");

        row.className="historyCard";

        row.innerHTML=`

            <strong>

                ${index+1}. ${pair.a.nombre}

            </strong>

            <div class="vs">

                VS

            </div>

            <strong>

                ${pair.b.nombre}

            </strong>

        `;

        finalList.appendChild(row);

    });

    finalScreen.classList.add("show");

    createConfetti();

    if(applauseAudio){

        applauseAudio.currentTime=0;

        applauseAudio.play().catch(()=>{});

    }

}

/*=========================================
    CONFETI
=========================================*/

function createConfetti(){

    const colors=[

        "#FFD54A",

        "#FFFFFF",

        "#4FC3F7",

        "#FF6B6B",

        "#7CFF7C"

    ];

    for(let i=0;i<180;i++){

        const piece=document.createElement("div");

        piece.className="confetti";

        piece.style.left=Math.random()*100+"vw";

        piece.style.background=

            colors[

                Math.floor(

                    Math.random()*colors.length

                )

            ];

        piece.style.animationDelay=

            (Math.random()*1.5)+"s";

        piece.style.transform=

            `rotate(${Math.random()*360}deg)`;

        document.body.appendChild(piece);

        setTimeout(()=>{

            piece.remove();

        },5000);

    }

}
