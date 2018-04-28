//------------------------------------------------------------------------
//  Watson assistant for inspections.
//  Vocal interaction powered by Google Actions
//------------------------------------------------------------------------
var watson = require('watson-developer-cloud');     // watson sdk
var axios = require('axios');                       // manages rest api calls
//var prompt = require('prompt-sync')();              // user interaction

const bodyParser = require('body-parser');
const {actionssdk} = require('actions-on-google');
const app = actionssdk({debug: true});
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

//---------------------------------------
// define assistant credentials
//---------------------------------------
var workspace_id = '197ccaba-7914-46d3-9e84-d50eda4ea223';
var assistant = watson.conversation({
    username: 'b5da2fc4-f1cd-485a-a0da-a4d035f896a1',
    password: 'gnkHoHSTNuiN',
    version: 'v1',
    version_date: '2018-02-16'
});
//---------------------------------------------------------------
//  Begin conversation with a null text
//---------------------------------------------------------------
app.intent('actions.intent.MAIN', (conv) => {
    assistant.message({
        workspace_id: workspace_id,
        input: { text: "" },
        context: initialContext,
    }, processResponse);
});

app.intent('actions.intent.TEXT', (conv, input) => { 
    assistant.message({
        workspace_id: workspace_id,
        input: { text: input },
        context: conv.data,
    }, processResponse);
});
  //----------------------------------------------------------
  //    FUNCTION PROCESSRESPONSE
  //    Process the conversation response and continue
  //    until inspection ends
  //----------------------------------------------------------
  function processResponse(err, response) {
    console.log("MISS-MANU");
    console.log("response="+JSON.stringify(response));
    frase_da_pronunciare="";
    if (err) {
      console.log("error: ",err); // something went wrong
      frase_da_pronunciare="Sorry, an error occurred";
      conv.data=response.context;
      conv.ask(frase_da_pronunciare);
    }
    else { // all ok
    // Check if response is an action. In this case we have to build an answer.
    // else display the output from dialog, if any.
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
  
    //--------------------------------------
    // Check if ispezione terminata
    //--------------------------------------
        if(response.context.ispezione_iniziata<10) {
            if(response.context.ispezione_iniziata==1) {
                response.context.nn++;
                if(response.context.nn<checklist.length) {  // go to next control 
//                response.context.ispezione_iniziata=1;
                    response.context.current_step=checklist[nn];                
                }
                else {  // finish
                    return conv.close('Goodbye!');
                }
            }
        }
        else { // finish
            return conv.close('Goodbye!');
        }
        conv.data=response.context;        
    }
}
