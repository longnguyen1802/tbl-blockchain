const {
    PDFDocument
} = require("pdf-lib");
let logger = require("../services/logger");
let encryption = require('../services/encryption');
let certificates = require('../database/models/certificates');
let moment = require('moment');
let title = "Verification Portal";
let root = "verify";
async function postVerify(req,res,next) {
    try {
        //start here
        if (!req.files && !req.files.pdfFile) {
            res.status(400);
            res.end();
        }
        // console.log("Hello");
        // console.log(req.body);
        // res.send("Hello");
        var formPdfBytes = await req.files.pdfFile.data;
        //console.log("Hello");
        const pdfDoc = await PDFDocument.load(formPdfBytes)
       // console.log("Hello");
       // res.send("Hello")
        const form = pdfDoc.getForm()
        //const name = form.getTextField('Name')
        const school = form.getTextField("School")
        // const date = form.getTextField("Date")
        // const location = form.getTextField("Location")
        const cga = form.getTextField("CGA")
        const UUID = form.getTextField("UUID")
        const email = form.getTextField("Email")
        let mTreeProof = await encryption.generateCertificateProof(['universityName','cgpa'], UUID.getText(),email.getText());
        let disclosedData = await certificates.findOne({"_id" : UUID.getText()}).select(['universityName','cgpa'].join(" ") + " -_id");
        let x = {
            proof: mTreeProof,
            disclosedData: disclosedData,
            certUUID: UUID.getText(),
        }
        x = JSON.stringify(x);
        
        //proofObject = JSON.parse(proofObject);
        let proofObject = JSON.parse(x);  
        // //end here
        // // let proofObject = req.body.proofObject;
        // // console.log("The first");
        // // console.log(proofObject);
        // // proofObject = JSON.parse(proofObject);
        // // console.log("The second");
        // console.log(proofObject);
        if(disclosedData['universityName']!= school.getText()){
            res.send("University name is wrong")
        }
        else if(disclosedData['cga']!=cga.getText()){
            res.send("CGA is wrong")
        }
        else{
        if (!proofObject.disclosedData || Object.keys(proofObject.disclosedData).length === 0  ) {
            throw new Error("No parameter given. Provide parameters that need to be verified");
        }
        let proofIsCorrect = await encryption.verifyCertificateProof(proofObject.proof, proofObject.disclosedData, proofObject.certUUID );

        if (proofIsCorrect) {
            // let certificateDbObject = await certificates.findOne({"_id": proofObject.certUUID}).select("studentName studentEmail _id dateOfIssuing universityName universityEmail");

            // res.render("verify-success", { title, root,
            //     logInType: req.session.user_type || "none",
            //     certData : certificateDbObject,
            //     proofData : proofObject.disclosedData
            // })
            res.send("Verify correct");

        } else {
            res.send("Verify fail");
            // res.render("verify-fail", {
            //     title, root,
            //     logInType: req.session.user_type || "none"
            // })
        }

    } }catch (e) {
        logger.error(e);
        next(e);
    }
}

module.exports = {postVerify};