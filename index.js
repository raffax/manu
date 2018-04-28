//------------------------------------------------------------------------
// Google Actions app for voice interaction on smartphone 
//------------------------------------------------------------------------
// Initialize Google Actions
//------------------------------------------------------------------------
const express = require('express');
const bodyParser = require('body-parser');
const {actionssdk} = require('actions-on-google');

const app = actionssdk({debug: true});
if(app.request && app.request.input) console.log("MANU input: " + app.request.input);
if(app.request && app.request.user && app.request.userStorage) 
{
	console.log("MANU data: "+app.request.userStorage);
}
else {
	console.log("MANU data inesistente");
}
app.intent('actions.intent.MAIN', (conv) => {
    conv.data={ok: 1};
    frase="Hello, I am miss Manu, I help you in performing plant inspections";
    conv.ask(frase);
  });
  
app.intent('actions.intent.TEXT', (conv, input) => {
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
