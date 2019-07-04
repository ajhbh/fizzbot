const request = require('request');

const urlroot = 'https://api.noopschallenge.com';
var urlcurrent = '/fizzbot/questions/1';

// wrap a request in an promise so can run synchronously in order cos' javascript
function getRequest(url) {
    return new Promise((resolve, reject) => {
        request.get(url, (error, response, body) => {
            if (error) reject(error);
            if (response.statusCode != 200) {
                reject('Invalid status code <' + response.statusCode + '>');
            }
            var jsonRespnse = JSON.parse(body);
            resolve(jsonRespnse);
        });
    });
}

function postRequest(url, answer) {
    return new Promise((resolve, reject) => {
        var string = {
            "answer": answer
        };
        request.post(url, {
            json: string
        }, function (error, response, body) {
            if (error) reject(error);
            if (response.statusCode != 200) {
                reject('Invalid status code <' + response.statusCode + '>');
            }
            //var jsonRespnse = JSON.parse(body);
            resolve(body);
        });
    });
}

function processResponse(response) {
    return new Promise((resolve, reject) => {
        if (response.nextQuestion != undefined) {
            urlcurrent = response.nextQuestion;
            resolve(null)
        } else if (response.exampleResponse != undefined && response.exampleResponse.answer != undefined && response.exampleResponse.answer == "COBOL") {
            resolve("COBOL")
        } else if (response.result != undefined && response.result == "interview complete") {
            resolve("interview complete")
        }
        var numbers = response.numbers;
        var rules = response.rules;

        var output = "";

        var i;

        for (i = 0; i < numbers.length; i++) {
            output += " ";

            var addition = "";
            for (var rule of rules) {
                if (numbers[i] % rule.number == 0) {
                    addition += rule.response;
                }
            }
            if (addition == "") {
                addition += numbers[i];
            }
            output += addition;
        }
        output = output.trim();
        resolve(output);
    });
}

// all you need to do is use async functions and await for functions returning promises
async function main() {
    while (true) {
        var urlrequest = urlroot + urlcurrent;
        console.log(urlrequest);

        try {
            var response = await getRequest(urlrequest)
            console.log(JSON.stringify(response));

            var answerString = await processResponse(response);
            if (answerString == null) {
                continue
            } 
            console.log(JSON.stringify(answerString));
            response = await postRequest(urlrequest, answerString);
            console.log(JSON.stringify(response));
            var finalanswerString = await processResponse(response)
            if (finalanswerString == "interview complete") {
                break;
            }

        } catch (error) {
            console.error('ERROR:');
            console.error(error);
            break;
        }
    }
}

main();
