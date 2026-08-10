"use strict";

/* =========================================================
   ESTADO DEL SORTEO
========================================================= */

let players = [];
let pairings = [];

let currentPairIndex = 0;
let currentPlayerA = null;
let currentPlayerB = null;

let revealingFirstPlayer = true;
let drawStarted = false;
let extractionInProgress = false;


/* =========================================================
   ELEMENTOS HTML
========================================================= */

const ballContainer =
    document.getElementById("ballContainer");

const drawBall =
    document.getElementById("drawBall");

const paperName =
    document.getElementById("paperName");

const paperTeam =
    document.getElementById("paperTeam");

const paperArmy =
    document.getElementById("paperArmy");

const historyList =
    document.getElementById("historyList");

const versusSection =
    document.getElementById("versusSection");

const playerLeft =
    document.getElementById("playerLeft");

const playerRight =
    document.getElementById("playerRight");

const startButton =
    document.getElementById("startButton");

const nextButton =
    document.getElementById("nextButton");

const restartButton =
    document.getElementById("restartButton");

const finalScreen =
    document.getElementById("finalScreen");

const finalList =
    document.getElementById("finalList");

const urnArea =
    document.getElementById("urnArea");


/* =========================================================
   AUDIO
========================================================= */

const introAudio =
    document.getElementById("introAudio");

const ballAudio =
    document.getElementById("ballAudio");

const openAudio =
    document.getElementById("openAudio");

const applauseAudio =
    document.getElementById("applauseAudio");


/* =========================================================
   BOLAS DE LA URNA
========================================================= */

const urnBalls = [];


/* =========================================================
   INICIALIZACIÓN
========================================================= */

window.addEventListener(
    "DOMContentLoaded",
    initialize
);


function initialize(){

    console.log(
        "Sorteo inicializado"
    );

    console.log(
        "PairingEngine:",
        window.PairingEngine
    );

    /*
       Cargamos los participantes desde data.js.
    */

    players = getPlayers();

    /*
       Creamos las bolas.
    */

    createUrnBalls();

    /*
       Eventos de botones.
    */

    registerEvents();

    /*
       Estado inicial.
    */

    nextButton.disabled = true;

    if(finalScreen){

        finalScreen.classList.remove(
            "show"
        );

    }

    versusSection.classList.remove(
        "show"
    );

    clearDrawBall();

}


/* =========================================================
   EVENTOS
========================================================= */

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


/* =========================================================
   CREAR BOLAS
========================================================= */

function createUrnBalls(){

    ballContainer.innerHTML = "";

    urnBalls.length = 0;

    players.forEach(
        (player,index)=>{

            const ball =
                document.createElement("div");

            ball.className = "ball";

            ball.dataset.player =
                index;

            /*
               Posición inicial aleatoria.
            */

            const angle =
                Math.random() *
                Math.PI * 2;

            const radius =
                35 +
                Math.random() * 80;

            const speed =
                0.002 +
                Math.random() * 0.004;

            ballContainer.appendChild(
                ball
            );

            urnBalls.push({

                element: ball,

                player: player,

                angle: angle,

                radius: radius,

                speed: speed,

                offset:
                    Math.random() *
                    Math.PI * 2,

                removed: false

            });

        }
    );

    /*
       Comenzamos el movimiento.
    */

    requestAnimationFrame(
        animateUrn
    );

}


/* =========================================================
   ANIMACIÓN DE LA URNA
========================================================= */

function animateUrn(time){

    urnBalls.forEach(
        ball=>{

            if(ball.removed)
                return;

            const wobble =
                Math.sin(
                    time * 0.001 +
                    ball.offset
                ) * 8;

            ball.angle +=
                ball.speed * 16;

            const x =
                Math.cos(
                    ball.angle
                ) *
                (ball.radius + wobble);

            const y =
                Math.sin(
                    ball.angle
                ) *
                (
                    ball.radius * .55
                );

            const rotation =
                ball.angle * 30;

            ball.element.style.transform =

                `translate(
                    ${x}px,
                    ${y}px
                )
                rotate(${rotation}deg)`;

        }
    );

    requestAnimationFrame(
        animateUrn
    );

}


/* =========================================================
   COMENZAR SORTEO
========================================================= */

function startDraw(){

    if(drawStarted)
        return;

    /*
       Comprobación de seguridad.
    */

    if(
        !window.PairingEngine ||
        typeof window.PairingEngine.generatePairings
        !== "function"
    ){

        alert(
            "No se ha podido cargar el motor de emparejamientos."
        );

        console.error(
            "PairingEngine no está disponible."
        );

        return;

    }

    drawStarted = true;

    /*
       Generamos todos los enfrentamientos
       antes de comenzar el espectáculo.
    */

    try{

        pairings =
            window.PairingEngine
                .generatePairings(
                    players
                );

        console.log(
            "Emparejamientos generados:",
            pairings
        );

    }

    catch(error){

        console.error(error);

        alert(
            error.message
        );

        drawStarted = false;

        return;

    }

    /*
       Cambiamos botones.
    */

    startButton.disabled = true;

    nextButton.disabled = false;

    /*
       Sonido inicial.
    */

    playAudio(
        introAudio
    );

    /*
       Animación inicial de la urna.
    */

    if(urnArea){

        urnArea.classList.add(
            "active"
        );

    }

}


/* =========================================================
   SIGUIENTE EXTRACCIÓN
========================================================= */

function nextExtraction(){

    if(extractionInProgress)
        return;

    if(
        currentPairIndex >=
        pairings.length
    ){

        finishTournament();

        return;

    }

    /*
       Limpiamos completamente cualquier
       información visual anterior.
    */

    clearPreviousReveal();

    /*
       Extraemos la siguiente bola.
    */

    extractBall();

}


/* =========================================================
   EXTRAER BOLA
========================================================= */

function extractBall(){

    if(extractionInProgress)
        return;

    extractionInProgress = true;

    nextButton.disabled = true;

    /*
       Ocultamos temporalmente el VS anterior.
    */

    versusSection.classList.remove(
        "show"
    );

    /*
       Buscamos bolas disponibles.
    */

    const available =
        urnBalls.filter(
            ball => !ball.removed
        );

    if(!available.length){

        finishTournament();

        return;

    }

    /*
       Elegimos una bola aleatoria.
    */

    const selected =
        available[
            Math.floor(
                Math.random() *
                available.length
            )
        ];

    selected.removed = true;

    /*
       Sonido.
    */

    playAudio(
        ballAudio
    );

    /*
       Agitamos la urna.
    */

    if(urnArea){

        urnArea.classList.remove(
            "shake"
        );

        void urnArea.offsetWidth;

        urnArea.classList.add(
            "shake"
        );

    }

    /*
       Animación de salida.
    */

    animateBallExtraction(
        selected
    );

}


/* =========================================================
   ANIMACIÓN DE EXTRACCIÓN
========================================================= */

function animateBallExtraction(
    selected
){

    const original =
        selected.element;

    /*
       Posición de la bola.
    */

    const rect =
        original.getBoundingClientRect();

    /*
       Creamos una copia para realizar
       el recorrido.
    */

    const flyingBall =
        document.createElement(
            "div"
        );

    flyingBall.className =
        "extractionBall";

    /*
       Posición inicial.
    */

    flyingBall.style.left =
        rect.left + "px";

    flyingBall.style.top =
        rect.top + "px";

    /*
       La colocamos por encima de todo.
    */

    document.body.appendChild(
        flyingBall
    );

    /*
       Quitamos visualmente la original.
    */

    original.style.opacity =
        "0";

    /*
       FASE 1:
       La bola sale de la urna.
    */

    setTimeout(
        ()=>{
            flyingBall.classList.add(
                "rise"
            );
        },
        50
    );

    /*
       FASE 2:
       Viaja hacia el centro.
    */

    setTimeout(
        ()=>{
            flyingBall.classList.add(
                "travel"
            );
        },
        700
    );

    /*
       FASE 3:
       Llega al centro.
    */

    setTimeout(
        ()=>{
            flyingBall.classList.add(
                "arrive"
            );
        },
        1400
    );

    /*
       FASE 4:
       Desaparece y aparece la bola grande.
    */

    setTimeout(
        ()=>{

            flyingBall.remove();

            showDrawBall();

        },
        2100
    );

}


/* =========================================================
   MOSTRAR BOLA CENTRAL
========================================================= */

function showDrawBall(){

    /*
       Limpiamos clases anteriores.
    */

    drawBall.className = "";

    void drawBall.offsetWidth;

    /*
       Entrada de la bola.
    */

    drawBall.classList.add(
        "visible"
    );

    /*
       Pequeño retraso antes de abrir.
    */

    setTimeout(
        ()=>{

            drawBall.classList.add(
                "open"
            );

            playAudio(
                openAudio
            );

        },
        900
    );

    /*
       Revelamos jugador.
    */

    setTimeout(
        ()=>{
            revealPlayer();
        },
        1500
    );

}


/* =========================================================
   REVELAR JUGADOR
========================================================= */

function revealPlayer(){

    const pairing =
        pairings[
            currentPairIndex
        ];

    /*
       Primera bola del enfrentamiento.
    */

    if(revealingFirstPlayer){

        currentPlayerA =
            pairing.a;

        showPaper(
            currentPlayerA
        );

        revealingFirstPlayer =
            false;

    }

    /*
       Segunda bola.
    */

    else{

        currentPlayerB =
            pairing.b;

        showPaper(
            currentPlayerB
        );

        revealingFirstPlayer =
            true;

        /*
           Después de mostrar el segundo
           jugador presentamos el VS.
        */

        setTimeout(
            showVersus,
            1300
        );

    }

}


/* =========================================================
   MOSTRAR PAPEL
========================================================= */

function showPaper(player){

    paperName.textContent =
        player.nombre;

    paperTeam.textContent =
        player.equipo;

    paperArmy.textContent =
        player.ejercito;

    /*
       Animación del contenido.
    */

    const paper =
        document.getElementById(
            "paper"
        );

    if(paper){

        paper.classList.remove(
            "reveal"
        );

        void paper.offsetWidth;

        paper.classList.add(
            "reveal"
        );

    }

}


/* =========================================================
   MOSTRAR VS
========================================================= */

function showVersus(){

    /*
       MUY IMPORTANTE:
       limpiamos las tarjetas antes de rellenarlas.
    */

    clearPlayerCards();

    /*
       Rellenamos jugador izquierdo.
    */

    fillPlayerCard(
        playerLeft,
        currentPlayerA
    );

    /*
       Rellenamos jugador derecho.
    */

    fillPlayerCard(
        playerRight,
        currentPlayerB
    );

    /*
       Forzamos reinicio de animaciones.
    */

    playerLeft.classList.remove(
        "show"
    );

    playerRight.classList.remove(
        "show"
    );

    versusSection.classList.remove(
        "show"
    );

    void versusSection.offsetWidth;

    /*
       Mostramos VS.
    */

    versusSection.classList.add(
        "show"
    );

    playerLeft.classList.add(
        "show"
    );

    playerRight.classList.add(
        "show"
    );

    /*
       Guardamos en historial.
    */

    addHistoryCard(
        currentPlayerA,
        currentPlayerB
    );

    /*
       Pasamos al siguiente enfrentamiento.
    */

    currentPairIndex++;

    /*
       La extracción ha terminado.
    */

    extractionInProgress =
        false;

    /*
       El botón vuelve a estar disponible.
    */

    nextButton.disabled =
        false;

}


/* =========================================================
   RELLENAR TARJETA
========================================================= */

function fillPlayerCard(
    card,
    player
){

    if(!card || !player)
        return;

    const name =
        card.querySelector(
            ".playerName"
        );

    const team =
        card.querySelector(
            ".playerTeam"
        );

    const army =
        card.querySelector(
            ".playerArmy"
        );

    if(name)
        name.textContent =
            player.nombre;

    if(team)
        team.textContent =
            player.equipo;

    if(army)
        army.textContent =
            player.ejercito;

}


/* =========================================================
   LIMPIAR TARJETAS
========================================================= */

function clearPlayerCards(){

    /*
       Esta función evita exactamente el problema
       que estabas viendo: los jugadores anteriores
       permaneciendo en pantalla.
    */

    [playerLeft,playerRight].forEach(
        card=>{

            if(!card)
                return;

            const name =
                card.querySelector(
                    ".playerName"
                );

            const team =
                card.querySelector(
                    ".playerTeam"
                );

            const army =
                card.querySelector(
                    ".playerArmy"
                );

            if(name)
                name.textContent = "";

            if(team)
                team.textContent = "";

            if(army)
                army.textContent = "";

            card.classList.remove(
                "show"
            );

        }
    );

}


/* =========================================================
   LIMPIAR REVELACIÓN ANTERIOR
========================================================= */

function clearPreviousReveal(){

    /*
       Ocultamos VS.
    */

    versusSection.classList.remove(
        "show"
    );

    /*
       Limpiamos las tarjetas.
    */

    clearPlayerCards();

    /*
       Limpiamos la bola.
    */

    clearDrawBall();

    /*
       Limpiamos los jugadores actuales.
    */

    currentPlayerA = null;

    currentPlayerB = null;

}


/* =========================================================
   LIMPIAR BOLA
========================================================= */

function clearDrawBall(){

    if(!drawBall)
        return;

    drawBall.className = "";

    paperName.textContent =
        "";

    paperTeam.textContent =
        "";

    paperArmy.textContent =
        "";

}


/* =========================================================
   HISTORIAL
========================================================= */

function addHistoryCard(
    playerA,
    playerB
){

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "historyCard";


    card.innerHTML = `

        <div class="historyPlayer">

            <strong>
                ${escapeHTML(
                    playerA.nombre
                )}
            </strong>

            <small>
                ${escapeHTML(
                    playerA.ejercito
                )}
            </small>

        </div>

        <div class="historyVS">
            VS
        </div>

        <div class="historyPlayer">

            <strong>
                ${escapeHTML(
                    playerB.nombre
                )}
            </strong>

            <small>
                ${escapeHTML(
                    playerB.ejercito
                )}
            </small>

        </div>

    `;


    historyList.appendChild(
        card
    );


    /*
       Animación de entrada.
    */

    requestAnimationFrame(
        ()=>{
            card.classList.add(
                "show"
            );
        }
    );


    /*
       Scroll automático.
    */

    historyList.scrollTop =
        historyList.scrollHeight;

}


/* =========================================================
   PANTALLA FINAL
========================================================= */

function finishTournament(){

    extractionInProgress =
        false;

    nextButton.disabled =
        true;

    /*
       Limpiamos la zona central.
    */

    clearDrawBall();

    versusSection.classList.remove(
        "show"
    );

    /*
       Generamos lista final.
    */

    finalList.innerHTML = "";

    pairings.forEach(
        (pair,index)=>{

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "finalPair";

            row.innerHTML = `

                <span class="number">
                    ${index + 1}
                </span>

                <strong>
                    ${escapeHTML(
                        pair.a.nombre
                    )}
                </strong>

                <span class="finalVS">
                    VS
                </span>

                <strong>
                    ${escapeHTML(
                        pair.b.nombre
                    )}
                </strong>

            `;

            finalList.appendChild(
                row
            );

            setTimeout(
                ()=>{
                    row.classList.add(
                        "show"
                    );
                },
                index * 120
            );

        }
    );


    /*
       Mostramos pantalla final.
    */

    finalScreen.classList.add(
        "show"
    );


    /*
       Confeti.
    */

    createConfetti();


    /*
       Aplausos.
    */

    playAudio(
        applauseAudio
    );

}


/* =========================================================
   CONFETI
========================================================= */

function createConfetti(){

    const colors = [

        "#FFD54A",
        "#FFFFFF",
        "#4FC3F7",
        "#FF6B6B",
        "#7CFF7C"

    ];


    for(
        let i = 0;
        i < 120;
        i++
    ){

        const piece =
            document.createElement(
                "div"
            );

        piece.className =
            "confetti";


        piece.style.left =
            Math.random() *
            100 +
            "vw";


        piece.style.background =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];


        piece.style.animationDelay =
            Math.random() *
            1.5 +
            "s";


        piece.style.transform =
            `rotate(
                ${Math.random()*360}deg
            )`;


        document.body.appendChild(
            piece
        );


        setTimeout(
            ()=>{
                piece.remove();
            },
            5000
        );

    }

}


/* =========================================================
   AUDIO
========================================================= */

function playAudio(audio){

    if(!audio)
        return;

    audio.currentTime = 0;

    audio.play().catch(
        error=>{
            console.log(
                "Audio bloqueado:",
                error
            );
        }
    );

}


/* =========================================================
   REINICIAR
========================================================= */

function restartDraw(){

    location.reload();

}


/* =========================================================
   SEGURIDAD HTML
========================================================= */

function escapeHTML(text){

    if(text === undefined ||
       text === null){

        return "";

    }

    return String(text)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");

}
