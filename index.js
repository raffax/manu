//------------------------------------------------------------------------
// Google Actions app for voice interaction on smartphone 
// Text dialog is provided by Watson assistant 
// Domain : EGP inspections to wind farm
//------------------------------------------------------------------------
// Initialize Google Actions
//------------------------------------------------------------------------
const {actionssdk} = require('actions-on-google');
const app = actionssdk({debug: true});

function mainIntent(conv, input) {
    conv.data={ok: 1};
    frase="Incominciamo bene!";
    conv.ask(frase);
}

function dialoga(conv, input) {
    if (input === 'fine') {
        return conv.close('Arrivederci!');
    }
    var frase="Sono io";
    if(conv.data && conv.data.ok) {
        switch(conv.data.ok)
        {
            case 1: frase="Ecco la frase 1";
            break;
            case 2: frase="Pronuncio frase 2";
            break;
            case 3: frase="Ecco frase 3";
        }
        conv.data = {ok: conv.data.ok+1};
    }
    else {
        conv.data={ok: 4};
        frase="Ecco la frase n";
    }
    conv.ask(frase);
}

const actionMap = new Map();
actionMap.set(app.StandardIntents.MAIN, mainIntent);
actionMap.set(app.StandardIntents.TEXT, dialoga);
app.handleRequest(actionMap);