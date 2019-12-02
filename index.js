var converter = require('./lib/convert'),
    fs = require('fs'),
    _ = require('lodash'),
    validateRAML = (data) => {
        // check if it starts with #%RAML 0.8
        if (data.startsWith('#%RAML 0.8')) {
            // title property is a must for RAML0.8 specs
            // most of the specs have title: in the second line itself
            // hence to avoid splitting the whole file by newline and then checking for title field
            if (data.startsWith('#%RAML 0.8\ntitle:')) {
                return { result: true };
            }
            else {
                let dataArray = data.split('\n'),
                titleExist = _.find(dataArray, (element) => {
                    return element.startsWith('title:');
                })
                if (titleExist) {
                    return { result: true }
                }
                else {
                    return {
                        result: false,
                        reason: 'RAML 0.8 specification must have title property'
                    }
                }
            }
        }
        else {
            return {
                result: false,
                reason: 'RAML 0.8 specification must have #%RAML 0.8 at beginning of the file'
            }
        }
    };
module.exports = {
    getOptions: function() {
        return [];
    },
    convert: function(input, options, callback) {
        // this function will be called by parseString function if conversion was successful
        var success = (collection, environment) => {
            return callback(null, {
                result: true,
                output: [
                    {
                        type: 'collection',
                        data: collection
                    },
                    {
                        type: 'environment',
                        data: environment
                    }
                ]
            });
        },
        // this function will be called by parseString function if conversion failed
        failure = (error) => {
            if(typeof error === 'string' && error.includes('cannot fetch')) {
                return callback({
                    result: false,
                    reason: 'External references are not supported yet. ' + error
                });
            }
            return callback({
                result: false,
                reason: error
            });
        };
        if (input.type === 'file') {
            data = fs.readFileSync(input.data).toString();
            converter.parseString(data, success, failure);
        }
        else if(input.type === 'string') {
            converter.parseString(input.data, success, failure)
        }
        else {
            return callback({
                result: false,
                reason: 'input type: ' + input.type + ' is not valid'
            });
        }
    },
    validate: function(input) {
        let data;
        if (input.type === 'file') {
            data = fs.readFileSync(input.data).toString();
            data = data.trim();
            return validateRAML(data);
        }
        else if(input.type === 'string') {
            data = input.data.trim();
            return validateRAML(data);
        }
        else {
            return { 
                result: false,
                reason: 'input type: ' + input.type + ' is not valid'
            };
        }
    }
}