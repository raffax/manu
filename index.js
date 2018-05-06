//------------------------------------------------------------------------
//  Watson assistant for inspections.
//  Vocal interaction powered by Google Actions
//------------------------------------------------------------------------
var watson = require('watson-developer-cloud');     // watson sdk
const express = require('express');

const bodyParser = require('body-parser');
const {actionssdk} = require('actions-on-google');
console.log("Initializing google");
const app = actionssdk({debug: true});
console.log("initialized google")
//-------------------------------------------------------------------------------------
// The checklist varianle contains all controls of the inspection.
// It is for demo purpose only and it should be managed as collection of
// NoSQL database documents in order to save control results (photo, comments, ratings) 
//--------------------------------------------------------------------------------------
var checklist=[
                "the overall status of the foundation (absence of cracks in the concrete)",
            "the general status inside the Ground Cabinet (fan filters, wires connections)",
            "the general status of the UPS. Verify if works properly without any bypass",
            "the general status of the lights in the tower sections",
            "the tower section unions bolts marks",
            "the status of the power loop cable (in the 2nd tower section)",
            "the status of the lift clamping guides",
            "the conditions of the Yaw sliding plates",
            "GBX overall conditions (assess there is no crack or leakage)"
];

var previous=[3,1,4,2,3,3,1,3,4]; // simulate rates from prevous inspections;
var last_date='May 18, 2017';
var nn=0;   // pointer to current checklist step (replaced by response.context.nn)
var frase_da_pronunciare="";
//---------------------------------------------
// initialize dialog context variables
//---------------------------------------------
var initialContext={
    utente:"Raffa",
    turbina:"2",
    plant:"IVREA 1",
    tempo:"",
    inspection: "si",
    ispezione_iniziata:0,
    current_step:checklist[0],
    nn:0
};

var bcard=new BasicCard();
var bu = new Button();
//---------------------------------------
// define assistant credentials
//---------------------------------------
console.log("PRIMA DI inizializzare assistant");
var workspace_id = '197ccaba-7914-46d3-9e84-d50eda4ea223';
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
                        frase_da_pronunciare='During last inspection this control was rated '+previous[response.context.nn];
                        console.log(frase_da_pronunciare);
                    }
                }
                else {
                    for(var i = 0; i<response.output.text.length;i++) {
                        frase_da_pronunciare=response.output.text[i]+". ";        
                    }
                    console.log(frase_da_pronunciare);
                }
          
            //--------------------------------------
            // Check if ispezione terminata
            //--------------------------------------
                if(response.context.ispezione_iniziata<10) {
                    if(response.context.ispezione_iniziata==1) {
                        response.context.nn++;
                        if(response.context.nn<checklist.length) {  // go to next control 
        //                response.context.ispezione_iniziata=1;
                            response.context.current_step=checklist[response.context.nn];                
                        }
                        else {  // finish
                            conv.close('Goodbye!');
                            resolve();
                        }
                    }
                }
                else { // finish
                    conv.close('Goodbye!');
                    resolve();
                }
                conv.data.ws_context=response.context;
                if(frase_da_pronunciare.indexOf('photo')>=0 || frase_da_pronunciare.indexOf("picture")>=0) {
                    bcard.text=frase_da_pronunciare;
                    bcard.title='Action required';
                    bu.text="Take Photo";
                    bu.url='https://assistant.google.com/';
                    bcard.buttons=[bu];                    
                    conv.ask(bcard);
                }
                else {
                    conv.ask(frase_da_pronunciare);
                }
                resolve();
            }                
        });
    })
}

  express().use(bodyParser.json(), app).listen(process.env.PORT || 3000);