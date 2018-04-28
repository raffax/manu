//------------------------------------------------------------------------
// Google Actions app for voice interaction on smartphone 
//------------------------------------------------------------------------
// Initialize Google Actions
//------------------------------------------------------------------------
const express = require('express');
const bodyParser = require('body-parser');
const {actionssdk} = require('actions-on-google');
var conversation=null;
var ingresso=null;

const app = actionssdk({debug: true});
app.intent('actions.intent.MAIN', (conv) => {
    conversation=conv;
    conv.data={ok: 1};
    frase="Hello, I am miss Manu, I help you in performing plant inspections";
    conv.ask(frase);
  });
  
app.intent('actions.intent.TEXT', (conv, input) => {
    conversation=conv;
    ingresso=input;
    if(conversation.data) {console.log("DATA: "+conversation.data);}
    else console.log("DATA inesistente");
    console.log("ingresso: "+ingresso);      
    if (input === 'bye') {
      return conv.close('Goodbye!');
    }
    var frase="Welcome to my simple action test";
    if(conv.data && conv.data.ok) {
        switch(conv.data.ok)
        {
            case 1: frase="Here is sentence 1";
            break;
            case 2: frase="I select sentence 2";
            break;
            case 3: frase="Now go for sentence 3";
            break;
            default: frase="Now I reach the level number "+conv.data.ok;
        }
        conv.data = {ok: conv.data.ok+1};
    }
    conv.ask(frase);  
});

express().use(bodyParser.json(), app).listen(process.env.PORT || 3000);
