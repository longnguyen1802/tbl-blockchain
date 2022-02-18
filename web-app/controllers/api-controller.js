let logger = require("../services/logger");
let encryption = require('../services/encryption');
let certificates = require('../database/models/certificates');



async function getGenerateProof(req,res,next) {

    try {

        if (!req.query.sharedAttributes || req.query.sharedAttributes.length === 0) {
            throw Error("Choose atleast one attribute to share")
        }

        let mTreeProof = await encryption.generateCertificateProof(req.query.sharedAttributes, req.query.certUUID, req.session.email);
        let disclosedData = await certificates.findOne({"_id" : req.query.certUUID}).select(req.query.sharedAttributes.join(" ") + " -_id");
        console.log(typeof req.query.sharedAttributes);
        console.log(typeof req.query.certUUID);
        console.log(typeof req.session.email);
        console.log(req.query.sharedAttributes);
        console.log(req.query.certUUID);
        console.log(req.session.email);
        res.status(200).send({
            proof: mTreeProof,
            disclosedData: disclosedData,
            certUUID: req.query.certUUID
        })
    } catch (e) {
        logger.error(e);
        next(e);
    }
}


async function apiErrorHandler(err, req, res, next) {

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    return res.status(err.status || 500).send(JSON.stringify(err.message, undefined, 4));
}


module.exports = {getGenerateProof, apiErrorHandler};