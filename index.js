//------------------------------------------------------------------------
// Google Actions app for voice interaction on smartphone 
// Text dialog is provided by Watson assistant 
// Domain : EGP inspections to wind farm
//------------------------------------------------------------------------
// Initialize Google Actions
//------------------------------------------------------------------------
const express = require('express');
const bodyParser = require('body-parser');
const {actionssdk} = require('actions-on-google');

const app = actionssdk({debug: true});

app.intent('actions.intent.MAIN', (conv) => {
    conv.data={ok: 1};
    frase="Start well";
    conv.ask(frase);
  });
  
app.intent('actions.intent.TEXT', (conv, input) => {
    if (input === 'bye') {
      return conv.close('Goodbye!');
    }
    var frase="I am Manu";
    if(conv.data && conv.data.ok) {
        switch(conv.data.ok)
        {
            case 1: frase="Here is sentence 1";
            break;
            case 2: frase="I select sentence 2";
            break;
            case 3: frase="Now go for sentence 3";
        }
        conv.data = {ok: conv.data.ok+1};
    }
    else {
        conv.data={ok: 4};
        frase="Go on with sentence 4";
    }
    conv.ask(frase);  
});

express().use(bodyParser.json(), app).listen(process.env.PORT || 3000);
