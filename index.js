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
var frase="";

const app = actionssdk({debug: false});
app.intent('actions.intent.MAIN', (conv) => {
    conversation=conv;
    conv.data={ok: 1};
//    frase="Hello, I am miss Manu, I help you in performing plant inspections";
//    conv.ask(frase);
    prova(0);
  });
  
app.intent('actions.intent.TEXT', (conv, input) => {
    conversation=conv;
    ingresso=input;
    prova(1);
    //    conv.ask(frase);  
});

function prova(indi)
{
    if(indi==0) {
        frase="Hello, I am miss Manu, I help you in performing plant inspections";
    }
    else {
        if (ingresso === 'bye') {
            return conversation.close("Goodbye");
          }
          frase="Welcome to my simple action test";
          if(conversation.data && conversation.data.ok) {
              switch(conv.data.ok)
              {
                  case 1: frase="Here is sentence 1";
                  break;
                  case 2: frase="I select sentence 2";
                  break;
                  case 3: frase="Now go for sentence 3";
                  break;
                  default: frase="Now I reach the level number "+conversation.data.ok;
              }
              conversation.data = {ok: conv.data.ok+1};
          }      
    }
    conversation.ask(frase);
}


express().use(bodyParser.json(), app).listen(process.env.PORT || 3000);
