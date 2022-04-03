const fs = require('fs');

module.exports = function(phase) { 
    var phaseFilename = null;
    // TODO 분기 예쁘게 만들기
    switch(phase) {
        case 'dev':
        case 'production':
            phaseFilename = phase;
            break;
        default :
            console.log('Unexpected requested phase => ' + phase);
            phaseFilename = 'dev';
    }
    console.log('Service phase => ' + phaseFilename);

    const jsonFile = fs.readFileSync('src/conf/' + phaseFilename + '.json', 'utf8');
    return JSON.parse(jsonFile);
}