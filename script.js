"use strict";


/* =========================================================
   ESTADO
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
   ELEMENTOS
========================================================= */

const ballContainer =
    document.getElementById("ballContainer");

const drawBall =
    document.getElementById("drawBall");

const paper =
    document.getElementById("paper");

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
   BOLAS
========================================================= */

const urnBalls = [];


/* =========================================================
   INICIO
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
       Cargar participantes.
    */

    players = getPlayers();


    /*
       Crear bolas.
    */

    createUrnBalls();


    /*
       Eventos.
    */

    registerEvents();


    /*
       Estado inicial.
    */

    nextButton.disabled = true;

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
                document.createElement(
                    "div"
                );

            ball.className =
                "ball";

            ball.dataset.player =
                index;


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


    requestAnimationFrame(
        animateUrn
    );

}


/* =========================================================
   ANIMACIÓN DE LAS BOLAS
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
                (
                    ball.radius +
                    wobble
                );


            const y =
                Math.sin(
                    ball.angle
                ) *
                (
                    ball.radius * 0.55
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
       Comprobamos el motor.
    */

    if(
        !window.PairingEngine ||
        typeof window.PairingEngine.generatePairings
        !== "function"
    ){

        alert(
            "No se ha podido cargar el motor de emparejamientos."
        );

        return;

    }


    drawStarted = true;


    /*
       Generamos los emparejamientos.
    */

    try{

        pairings =
            window.PairingEngine
                .generatePairings(
                    players
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
       =====================================================
       ALEATORIZAMOS EL ORDEN DE LOS ENFRENTAMIENTOS
       =====================================================
    */

    shuffleArray(
        pairings
    );


    /*
       =====================================================
       ALEATORIZAMOS QUIÉN APARECE PRIMERO
       EN CADA ENFRENTAMIENTO
       =====================================================
    */

    pairings.forEach(
        pair=>{

            if(
                Math.random() < 0.5
            ){

                const temp =
                    pair.a;

                pair.a =
                    pair.b;

                pair.b =
                    temp;

            }

        }
    );


    console.log(
        "Orden aleatorio:",
        pairings
    );


    /*
       Botones.
    */

    startButton.disabled =
        true;

    nextButton.disabled =
        false;


    /*
       Sonido.
    */

    playAudio(
        introAudio
    );


    /*
       Activar urna.
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


    /*
       Si hemos terminado.
    */

    if(
        currentPairIndex >=
        pairings.length
    ){

        finishTournament();

        return;

    }


    /*
       Limpiamos completamente
       la extracción anterior.
    */

    clearPreviousReveal();


    /*
       Extraemos.
    */

    extractBall();

}


/* =========================================================
   EXTRAER BOLA
========================================================= */

function extractBall(){

    if(extractionInProgress)
        return;


    extractionInProgress =
        true;


    nextButton.disabled =
        true;


    /*
       Buscar bolas disponibles.
    */

    const available =
        urnBalls.filter(
            ball =>
                !ball.removed
        );


    if(!available.length){

        finishTournament();

        return;

    }


    /*
       Bola aleatoria.
    */

    const selected =
        available[
            Math.floor(
                Math.random() *
                available.length
            )
        ];


    selected.removed =
        true;


    /*
       Guardamos visualmente el participante
       que lleva esta bola.

       IMPORTANTE:
       La bola extraída corresponde a un
       participante real.
    */

    const selectedPlayer =
        selected.player;


    /*
       Sonido.
    */

    playAudio(
        ballAudio
    );


    /*
       Agitar urna.
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
       Animación.
    */

    animateBallExtraction(
        selected,
        selectedPlayer
    );

}


/* =========================================================
   ANIMACIÓN DE LA BOLA
========================================================= */

function animateBallExtraction(
    selected,
    selectedPlayer
){

    const original =
        selected.element;


    const rect =
        original.getBoundingClientRect();


    const flyingBall =
        document.createElement(
            "div"
        );


    flyingBall.className =
        "extractionBall";


    flyingBall.style.left =
        rect.left + "px";


    flyingBall.style.top =
        rect.top + "px";


    document.body.appendChild(
        flyingBall
    );


    original.style.opacity =
        "0";


    /*
       Salida.
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
       Viaje.
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
       Llegada.
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
       Revelación.
    */

    setTimeout(
        ()=>{

            flyingBall.remove();


            showDrawBall(
                selectedPlayer
            );

        },
        2100
    );

}


/* =========================================================
   MOSTRAR BOLA GRANDE
========================================================= */

function showDrawBall(
    selectedPlayer
){

    drawBall.className = "";

    void drawBall.offsetWidth;


    drawBall.classList.add(
        "visible"
    );


    /*
       Abrir bola.
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
       Mostrar participante.
    */

    setTimeout(
        ()=>{

            revealPlayer(
                selectedPlayer
            );

        },
        1500
    );

}


/* =========================================================
   REVELAR PARTICIPANTE
========================================================= */

function revealPlayer(
    selectedPlayer
){

    /*
       =====================================================
       PRIMERA BOLA DEL ENFRENTAMIENTO
       =====================================================
    */

    if(revealingFirstPlayer){

        currentPlayerA =
            selectedPlayer;


        showPaper(
            currentPlayerA
        );


        revealingFirstPlayer =
            false;


        /*
           AQUÍ ESTABA EL BUG.

           Después de revelar al primer jugador
           tenemos que permitir volver a pulsar
           "Extraer bola".
        */

        extractionInProgress =
            false;


        nextButton.disabled =
            false;


        return;

    }


    /*
       =====================================================
       SEGUNDA BOLA
       =====================================================
    */

    currentPlayerB =
        selectedPlayer;


    showPaper(
        currentPlayerB
    );


    revealingFirstPlayer =
        true;


    /*
       Mostrar enfrentamiento.
    */

    setTimeout(
        showVersus,
        1300
    );

}


/* =========================================================
   MOSTRAR PAPEL
========================================================= */

function showPaper(
    player
){

    paperName.textContent =
        player.nombre;


    paperTeam.textContent =
        player.equipo ||
        "Sin equipo";


    paperArmy.textContent =
        player.ejercito ||
        "Ejército desconocido";


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
   MOSTRAR ENFRENTAMIENTO
========================================================= */

function showVersus(){

    /*
       Limpiar tarjetas anteriores.
    */

    clearPlayerCards();


    /*
       Rellenar izquierda.
    */

    fillPlayerCard(
        playerLeft,
        currentPlayerA
    );


    /*
       Rellenar derecha.
    */

    fillPlayerCard(
        playerRight,
        currentPlayerB
    );


    /*
       Reiniciar animaciones.
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
       Mostrar.
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
       Guardar historial.
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
       Ya podemos extraer el siguiente
       enfrentamiento.
    */

    extractionInProgress =
        false;


    nextButton.disabled =
        false;


    /*
       Si ya no quedan enfrentamientos,
       el siguiente clic mostrará la pantalla final.
    */

}


/* =========================================================
   TARJETA DE PARTICIPANTE
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
            player.equipo ||
            "Sin equipo";


    if(army)
        army.textContent =
            player.ejercito ||
            "Ejército desconocido";

}


/* =========================================================
   LIMPIAR TARJETAS
========================================================= */

function clearPlayerCards(){

    [
        playerLeft,
        playerRight
    ].forEach(
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
                name.textContent =
                    "";


            if(team)
                team.textContent =
                    "";


            if(army)
                army.textContent =
                    "";


            card.classList.remove(
                "show"
            );

        }
    );

}


/* =========================================================
   LIMPIAR EXTRACCIÓN
========================================================= */

function clearPreviousReveal(){

    versusSection.classList.remove(
        "show"
    );


    clearPlayerCards();


    clearDrawBall();


    currentPlayerA =
        null;


    currentPlayerB =
        null;

}


/* =========================================================
   LIMPIAR BOLA
========================================================= */

function clearDrawBall(){

    if(!drawBall)
        return;


    drawBall.className =
        "";


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


    requestAnimationFrame(
        ()=>{
            card.classList.add(
                "show"
            );
        }
    );


    historyList.scrollTop =
        historyList.scrollHeight;

}


/* =========================================================
   FINAL
========================================================= */

function finishTournament(){

    extractionInProgress =
        false;


    nextButton.disabled =
        true;


    clearDrawBall();


    versusSection.classList.remove(
        "show"
    );


    finalList.innerHTML =
        "";


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


    finalScreen.classList.add(
        "show"
    );


    createConfetti();


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

function playAudio(
    audio
){

    if(!audio)
        return;


    audio.currentTime =
        0;


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
   SHUFFLE
========================================================= */

function shuffleArray(
    array
){

    for(
        let i = array.length - 1;
        i > 0;
        i--
    ){

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];

    }


    return array;

}


/* =========================================================
   SEGURIDAD HTML
========================================================= */

function escapeHTML(
    text
){

    if(
        text === undefined ||
        text === null
    ){

        return "";

    }


    return String(text)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}
