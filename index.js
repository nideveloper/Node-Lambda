'use strict';

var rp = require('request-promise-native');

var pentonURL = 'https://vendor2-mock.herokuapp.com/penton/';
var veriskURL = 'https://vendor1-mock.herokuapp.com/verisk/';

/**
 * There are starndard properies required to make an HTTP request by the request-promise module
 */
function makeGetRequest(url) {
    var standardProperties = {
            uri: url,
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true // Automatically parses the JSON string in the response
        };

    return rp(standardProperties);
}

exports.handler = (event, context, callback) => {

    var veriskPromise = makeGetRequest(veriskURL+'yearBusinessStarted/'+event["queryStringParameters"].veriskID);
    var pentonPromise = makeGetRequest(pentonURL+'yearBusinessStarted/'+event["queryStringParameters"].pentonID);

    Promise.all([veriskPromise, pentonPromise]).then(function(mappedValues) {
        //deconstructing the results into named variables but maintining reference to whole array
        var [verisk, penton] = mappedValues;
        var chosenValue;
        var decisionReason = "";
        var chosenVendor = "";
        //If Verisk returns a value use it, otherwise use Penton
        if(typeof verisk.value != "undefined"){
            chosenValue = verisk;
            decisionReason = "Verisk Had a value";
            chosenVendor = "verisk";
        }else {
            chosenValue = penton;
            decisionReason = "Verisk Did Not Have a value";
            chosenVendor="penton";
        }
        console.log("DATS YearBusinessStarted made decision chose value '"+chosenValue.value+"' from "+JSON.stringify(chosenValue)+ " because '"+decisionReason+"', full list of options was "+JSON.stringify(mappedValues));
        
        callback(null, {
            statusCode: 200,
            body: JSON.stringify({"value": chosenValue.value,  "chosenVendor": chosenVendor, "decisionReason": decisionReason})
        })
    });

}
