//------------------------------------------------------------------------
//  Watson assistant for inspections.
//  Vocal interaction powered by Google Actions
//------------------------------------------------------------------------
var watson = require('watson-developer-cloud');     // watson sdk
const express = require('express');

const bodyParser = require('body-parser');
const {actionssdk,BasicCard,Button,Image} = require('actions-on-google');
console.log("Initializing google");
const app = actionssdk({debug: false});
console.log("initialized google")
//-------------------------------------------------------------------------------------
// The checklist varianle contains all controls of the inspection.
// It is for demo purpose only and it should be managed as collection of
// NoSQL database documents in order to save control results (photo, comments, ratings) 
//--------------------------------------------------------------------------------------
var checklist=[
        "lo stato generale della fondazione e l'assenza di fessure nel calcestruzzo.",
        "le condizioni generali dell' armadio GROUND (collegamenti, filtri dell'aria).",
        "lo stato dell'UPS (se funziona correttamente, non bypassato).",
        "le condizioni dei filtri della porta di accesso alla turbina.",
        "le condizioni generali dell'illuminazione nella turbina (sezioni e navicella).",
        "il corretto contrassegno di coppia sugli elementi di fissaggio delle giunzioni tra le sezioni della torre.",
        "lo stato del cavi del loop di alimentazione (nella sezione seconda torre).",
        "lo stato delle guide di fissaggio dell'elevatore."        
];

var previous=[3,1,4,2,3,3,1,3,4]; // simulate rates from prevous inspections;
var last_date='May 18, 2017';
var frase_da_pronunciare="";
var finisci=false;
//---------------------------------------------
// initialize dialog context variables
//---------------------------------------------
var initialContext={
    utente:"Raffa",
    turbina:"2",
    plant:"Roma",
    tempo:"",
    inspection: "si",
    ispezione_iniziata:0,
    current_step:checklist[0],
    n_control:0
};

//---------------------------------------
// define assistant credentials
//---------------------------------------
console.log("PRIMA DI inizializzare assistant");
var workspace_id = '5e22a66e-1784-4b20-9d9c-6eeced59c98c';
var assistant = watson.conversation({
    username: 'b5da2fc4-f1cd-485a-a0da-a4d035f896a1',
    password: 'gnkHoHSTNuiN',
    version: 'v1',
    version_date: '2018-02-16'
});
console.log("assistant initialized");

//---------------------------------------------------------------
//  Begin conversation with a null text
//---------------------------------------------------------------
app.intent('actions.intent.MAIN', (conv) => {
    console.log("PARTO...");
    return prima_conversazione(conv);
    console.log("ESCO......");
});

function prima_conversazione(conv) {
    return new Promise(function (resolve,reject){
        assistant.message({
            workspace_id: workspace_id,
            input: { text: "" },
            context: initialContext},
            function(err,response) {
                if(err) {
                    console.log("watson error "+err);
                    reject(err);
                }
                else {
                    conv.data.ws_context=response.context;
                    conv.data.ws_context.n_control=0;
                    var miafrase="";
                    for(var i = 0; i<response.output.text.length && i<3; i++) {
                        miafrase+=response.output.text[i]+". ";        
                    }
                    conv.ask(miafrase);
                    resolve();
                }
            }
        )
    });
}

app.intent('actions.intent.TEXT', (conv, input) => { 
    if(finisci) {
        return conv.close("A presto!");
    }
    console.log("intent: TEXT");
    return altre_conversazioni(conv,input);
});
  //----------------------------------------------------------
  //    FUNCTION PROCESSRESPONSE
  //    Process the conversation response and continue
  //    until inspection ends
  //----------------------------------------------------------
function altre_conversazioni(conv,input) {
    return new Promise (function (resolve,reject) {  
        assistant.message({
            workspace_id: workspace_id,
            input: { text: input },
            context: conv.data.ws_context,
        }, function(err,response){
            if(err) {
                console.log("watson2 error: "+err);
                reject(err);
            }            
            else {
                if(response.output.text.length>0 && response.output.text[0].indexOf('_action')>=0) {
                    var x = response.output.text[0].split(' ')[1];
                    if(x.indexOf('last_inspection_step')>=0) {
                        frase_da_pronunciare='During last inspection this control was rated '+previous[nn];
                        console.log(frase_da_pronunciare);
                    }
                }
                else {
                    for(var i = 0; i<response.output.text.length;i++) {
                        frase_da_pronunciare=response.output.text[i]+". ";        
                    }
                    console.log(frase_da_pronunciare);                    
                }
                var nn=conv.data.ws_context.n_control;
                if(isNaN(nn)) {
                    nn=0;
                    console.log("NN not defined...");
                }
            //--------------------------------------
            // Check if ispezione terminata
            //--------------------------------------
                if(response.context.ispezione_iniziata<10) {
                    if(response.context.ispezione_iniziata==1) {
                        nn++;
                        console.log("NN: "+nn + ", ISP_INIZIATA: "+response.context.ispezione_iniziata);
                        if(nn < checklist.length) {  // go to next control 
        //                response.context.ispezione_iniziata=1;
                            response.context.current_step=checklist[nn];                
                        }
                        else {  // finish
                            conv.ask('Arrivederci!');
                            finisci=true;
                            resolve();
                        }
                    }
                }
                else { // finish
                    conv.ask('Arrivederci!');
                    finisci=true;
                    resolve();
                }
                conv.data.ws_context=response.context;
                conv.data.ws_context.n_control=nn;
                console.log('====> Controllo se mandare testo o basic card');
                if (frase_da_pronunciare.indexOf('foto') >=0 &&
                    conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) 
                {
// Create a basic card
                    console.log('====> Creo Basic Card');
                    conv.ask(frase_da_pronunciare);
                    conv.ask(new BasicCard({
                        text: 'Clicca per scattare foto', 
// Note the two spaces before '\n' required for a line break to be rendered in the card.
                        subtitle: 'Sottotitolo',
                        title: 'Titolo',
                        buttons: new Button({
                            title: 'Camera',
                            url: 'https://assistant.google.com/',
                        }),
                        image: new Image({
                            url: 'https://example.com/image.png',
                            alt: 'Fotocamera',
                        }),
                    }));
                }
                else {
                    console.log('====> Creo semplice testo');
                    conv.ask(frase_da_pronunciare)
                }     
                console.log("RESOLVING");           
                resolve();
            }                
        });
    })
}

  express().use(bodyParser.json(), app).listen(process.env.PORT || 3000);