const translate = require('@vitalets/google-translate-api');

exports.regionalToText = function (reg) {
    const regAlphabet = '🇦🇧🇨🇩🇪🇫🇬🇭🇮🇯🇰🇱🇲🇳🇴🇵🇶🇷🇸🇹🇺🇻🇼🇽🇾🇿';
    const alphabet = 'a b c d e f g h i j k l m n o p q r s t u v w x y z';
    let langTo = '';
    // Convert to normal ascii
    for (const c of reg) {
        langTo += alphabet.charAt(regAlphabet.search(c));
    }
    switch(langTo) {
        case ca:
        case us:
        case gb:
        case au:
            langTo = 'en';
            break;
        case ee:
            langTo = 'et';
            break;
        case jp:
            langTo = 'ja';
            break;
    }
    return langTo;
}

exports.textToRegional = function (text) {
    const regAlphabet = ['🇦', '🇧', '🇨', ,'🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿'];
    const alphabet = '.abcdefghijklmnopqrstuvwxyz';
    let regTo = '';
    for (const c of text) {
        regTo += regAlphabet[alphabet.search(c)];
    }
    // If lang not found, parse english regional flags
    switch(regTo) {
        case '🇪🇳':
            regTo = '🇬🇧';
            break;
        case '🇪🇹':
            regTo = '🇪🇪';
            break;
        case '🇯🇦':
            regTo = '🇯🇵';

    }
    // Parse the language
    return regTo;
}

exports.translateTo = async function (to, text) {
    try {
        const translation = await translate(text, {to: to});
        return translation;
    }
    catch(err) {
        console.log(err);
    }
}